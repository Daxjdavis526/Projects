/* The stand controller: the only path from an operator's intent to the
   hardware.

   Everything the operator can do — command a valve, change a setpoint, ask
   the technician to open the bottle, clear the cell, arm, fire, abort — is
   an `execute(action, args)` call. The controller checks interlocks, logs
   the command, and passes it to the physics. It also runs the three things
   that act on their own clock: the firing sequencer, the abort sequence,
   and the facility (cell clearing, technician tasks).

   It keeps the COMMANDED state. What the hardware actually did is in the
   physics; what the operator can see of that is in the DAQ. */

import { Emitter } from '../lib/emitter.js';
import { standardInterlocks, evaluate } from './interlocks.js';
import { psi, fmt, fmtT } from '../lib/units.js';

export const COUNTDOWN = 5;          // s from FIRE to T-0
export const TAIL = 2;               // s after the last shutdown before the sequence is complete

export class Controller extends Emitter {
  constructor(session) {
    super();
    this.s = session;
    const def = session.def;
    this.def = def;
    this.cmd = {};
    for (const e of def.physics.elements) {
      if (e.type === 'valve' || e.type === 'solenoid') this.cmd[e.id] = e.initial ?? (e.normally === 'open' ? 1 : 0);
    }
    this.regSet = 0;
    this.armed = false;
    this.seq = null;
    this.abort = null;
    this.lastAbort = null;
    this.plan = { mode: 'single', duration: 3.0, on: 0.1, off: 0.4, count: 10 };
    this.autoStop = true;
    this.recordTail = 3.0;
    this.facility = { area: 'OPEN', personnel: 2, door: 'OPEN', beacon: 'GREEN', until: null, pa: false };
    this.tech = null;             // {task, done, text}
    this.rules = standardInterlocks(def);
    this.epoch = 0;               // bumps on every configuration change
    this.pollEpoch = -1;
    this.pollResult = null;
  }

  get t() { return this.s.t; }
  log(cat, text, extra) { return this.s.log.add(this.t, cat, text, { T: this.testTime(), ...extra }); }

  testTime() { return this.seq ? this.t - this.seq.tFire : null; }

  bump() { this.epoch++; }

  get pollGo() { return this.pollResult && this.pollResult.go && this.pollEpoch === this.epoch; }

  ictx() {
    const s = this.s;
    return {
      meas: id => s.daq.latest(id),
      cmd: id => this.cmd[id],
      armed: this.armed,
      abortActive: !!(this.abort && !this.abort.reset),
      seqActive: !!this.seq,
      facility: this.facility,
      daqOnline: s.daq.online,
      recording: !!s.daq.recording,
      regSet: this.regSet,
      pollGo: this.pollGo,
      zeroableIds: s.daq.sensors.filter(x => x.zeroable).map(x => x.id),
    };
  }

  /* The single entry point for operator actions. Returns
       {ok:true} | {ok:false, blocked:{msg,why}} | {ok:false, confirm:[{msg,why}]} */
  execute(action, args = {}, opts = {}) {
    const mode = this.s.mode;
    const hits = evaluate(this.rules, mode, this.ictx(), action, args);
    const block = hits.find(h => h.sev === 'block');
    if (block) {
      this.log('INT', `BLOCKED: ${this.describe(action, args)} — ${block.rule.msg}`, { level: 'caution', rule: block.rule.id });
      this.emit('blocked', { action, args, rule: block.rule });
      return { ok: false, blocked: { msg: block.rule.msg, why: block.rule.why, id: block.rule.id } };
    }
    const warns = hits.filter(h => h.sev === 'warn');
    if (warns.length && !opts.confirmed) {
      return { ok: false, confirm: warns.map(h => ({ msg: h.rule.msg, why: h.rule.why, id: h.rule.id })) };
    }
    for (const h of hits) {
      if (h.sev === 'warn') this.log('INT', `Proceeded despite warning: ${h.rule.msg}`, { level: 'caution', rule: h.rule.id });
      if (h.rule.safety) {
        this.log('SAF', `Safety rule broken: ${h.rule.msg}`, { level: 'warning', rule: h.rule.id });
        this.s.safetyViolations.push({ t: this.t, rule: h.rule.id, msg: h.rule.msg });
      }
    }
    const r = this._do(action, args);
    this.emit('executed', { action, args, result: r });
    return r || { ok: true };
  }

  describe(action, a) {
    switch (action) {
      case 'valve': return `${a.id} ${a.open ? 'OPEN' : 'CLOSE'}`;
      case 'regSet': return `${this.def.regulator} setpoint ${fmt(a.value, 'pressure')} psig`;
      case 'tech': return `technician: ${a.task}`;
      default: return action;
    }
  }

  _do(action, a) {
    const s = this.s, m = s.model;
    switch (action) {
      case 'valve': {
        if (this.cmd[a.id] === (a.open ? 1 : 0)) return { ok: true, noop: true };
        this.cmd[a.id] = a.open ? 1 : 0;
        m.command(a.id, a.open ? 1 : 0);
        this.log('CMD', `${a.id} ${a.open ? 'OPEN' : 'CLOSE'}`, { id: a.id, value: this.cmd[a.id] });
        this.bump();
        s.audio('valve', { id: a.id, open: a.open });
        return { ok: true };
      }
      case 'regSet': {
        this.regSet = Math.max(0, a.value);
        m.command(this.def.regulator, this.regSet);
        this.log('CMD', `${this.def.regulator} setpoint → ${fmt(this.regSet, 'pressure')} (EPC-101)`, { id: this.def.regulator, value: this.regSet });
        this.bump();
        s.requestPrediction();
        return { ok: true };
      }
      case 'tech': return this._tech(a.task);
      case 'clearCell': {
        if (this.facility.area !== 'OPEN') return { ok: true, noop: true };
        if (this.tech) return { ok: false, blocked: { msg: 'Technician task in progress.', why: 'Wait for the technician to finish and leave the cell.' } };
        this.facility.area = 'CLEARING';
        this.facility.until = this.t + 6;
        this.facility.beacon = 'AMBER';
        this.log('FAC', 'Cell clearing: sweep, headcount, door to close. PA: "Test cell TS-1 is being cleared."');
        this.bump();
        return { ok: true };
      }
      case 'enterCell': {
        if (this.facility.area === 'OPEN') return { ok: true, noop: true };
        this.facility = { area: 'OPEN', personnel: 2, door: 'OPEN', beacon: 'GREEN', until: null };
        this.log('FAC', 'Cell door unlocked and opened; personnel in cell: 2');
        this.bump();
        return { ok: true };
      }
      case 'daqPower': {
        s.daq.power(!!a.on, this.t);
        this.log('DAQ', a.on ? 'DAQ power ON — booting' : 'DAQ power OFF');
        return { ok: true };
      }
      case 'daqRate': {
        s.daq.setRate(a.rate);
        this.log('DAQ', `Sample rate set to ${a.rate} Hz (anti-alias corner ${Math.round(0.35 * a.rate)} Hz)`);
        return { ok: true };
      }
      case 'record': {
        if (a.on) {
          if (!s.daq.online) return { ok: false, blocked: { msg: 'DAQ offline.', why: '' } };
          const rec = s.startRecording();
          if (!rec) return { ok: false, blocked: { msg: 'Already recording.', why: '' } };
          this.log('DAQ', `Recording STARTED — file ${rec.meta.runId}, ${s.daq.rate} Hz, ${s.daq.ids.length} channels`);
        } else {
          s.stopRecording('operator');
        }
        return { ok: true };
      }
      case 'zero': {
        const out = s.daq.zero(a.ids);
        const txt = out.map(o => `${o.id} ${o.removed >= 0 ? '−' : '+'}${fmt(Math.abs(o.removed), o.quantity)}`).join(', ');
        this.log('DAQ', `Zero taken: ${txt || 'nothing to zero (DAQ offline?)'}`, { zero: out });
        return { ok: true, out };
      }
      case 'tare': {
        const out = s.daq.zero(a.ids || ['LC-501']);
        const txt = out.map(o => `${o.id} ${o.removed >= 0 ? '−' : '+'}${fmt(Math.abs(o.removed), o.quantity)}`).join(', ');
        this.log('DAQ', `Load cell tared: ${txt || 'nothing'}`, { tare: out });
        return { ok: true, out };
      }
      case 'shunt': {
        const lc = s.daq.sensor(a.id || 'LC-501');
        lc.shunt = !!a.on;
        this.log('DAQ', `${lc.id} shunt calibration ${a.on ? 'ON (expect +' + lc.shuntValue.toFixed(2) + ' N)' : 'OFF'}`);
        return { ok: true };
      }
      case 'plan': {
        this.plan = { ...this.plan, ...a.plan };
        this.log('SEQ', `Firing plan loaded: ${this.planText()}`);
        this.bump();
        s.requestPrediction();
        return { ok: true };
      }
      case 'autoStop': { this.autoStop = !!a.on; return { ok: true }; }
      case 'arm': {
        this.armed = true;
        this.facility.beacon = 'RED';
        this.log('SEQ', 'Fire circuit ARMED', { level: 'caution' });
        s.audio('arm');
        return { ok: true };
      }
      case 'disarm': {
        if (!this.armed) return { ok: true, noop: true };
        this.armed = false;
        if (this.facility.area === 'SECURED') this.facility.beacon = 'AMBER';
        if (this.cmd[this.def.fireValve]) this._fireValve(0, 'fire circuit disarmed');
        if (this.seq) { this.log('SEQ', 'Sequence terminated by DISARM', { level: 'caution' }); this.seq = null; }
        this.log('SEQ', 'Fire circuit SAFE (disarmed)');
        return { ok: true };
      }
      case 'fire': return this._startSequence();
      case 'hold': {
        if (!this.seq || this.seq.state !== 'COUNTDOWN') return { ok: true, noop: true };
        this.log('SEQ', `HOLD at ${fmtT(this.t - this.seq.tFire, 1)} — countdown recycled, fire valve never opened`, { level: 'caution' });
        this.seq = null;
        return { ok: true };
      }
      case 'cutoff': {
        if (!this.seq || this.seq.state !== 'BURN') return { ok: true, noop: true };
        this.log('SEQ', `Manual CUTOFF (normal shutdown) at ${fmtT(this.t - this.seq.tFire)}`, { level: 'caution' });
        this._fireValve(0, 'manual cutoff');
        this.seq.state = 'TAIL';
        this.seq.tEnd = this.t - this.seq.tFire;
        this.seq.cutoff = true;
        return { ok: true };
      }
      case 'abort': this.triggerAbort(a.reason || 'Manual abort by test conductor', 'operator'); return { ok: true };
      case 'resetAbort': {
        if (!this.abort) return { ok: true, noop: true };
        if (!this.abort.complete) return { ok: false, blocked: { msg: 'Abort sequence still running.', why: '' } };
        this.abort.reset = true;
        this.lastAbort = this.abort;
        this.abort = null;
        this.log('ABT', 'Abort reset by test conductor');
        return { ok: true };
      }
      case 'pa': { this.log('FAC', `PA: "${a.text}"`); return { ok: true }; }
      default: throw new Error(`unknown action ${action}`);
    }
  }

  planText(p = this.plan) {
    if (p.mode === 'pulse') return `pulse train, ${p.count} × ${Math.round(p.on * 1000)} ms on / ${Math.round(p.off * 1000)} ms off`;
    return `single burn, ${p.duration.toFixed(2)} s`;
  }

  /* ---- technician ------------------------------------------------------ */
  _tech(task) {
    if (this.tech) return { ok: false, blocked: { msg: 'Technician is busy.', why: this.tech.text } };
    const tasks = {
      openHV: { dur: 5, text: 'Opening bottle valve HV-100', done: () => {
        this.s.model.command('HV-100', 1); this.cmd['HV-100'] = 1; this.bump();
        this.s.later(3.0, () => {
          // the bottle's own dial gauge, read by eye to the nearest 50 psi —
          // an independent (and coarse) cross-check of PT-101
          const Pt = this.s.model.net.vol('tank').P - this.def.physics.ambient.P;
          this.log('TECH', `HV-100 open. Bottle dial gauge reads about ${Math.round(Pt / psi(50)) * 50} psig.`);
        });
      } },
      closeHV: { dur: 5, text: 'Closing bottle valve HV-100', done: () => {
        this.s.model.command('HV-100', 0); this.cmd['HV-100'] = 0; this.bump();
        this.s.later(2.6, () => this.log('TECH', 'HV-100 closed, hand-tight.'));
      } },
      walkdown: { dur: 20, text: 'Stand walkdown', done: () => {
        this.log('TECH', 'Walkdown complete: fittings torque-striped, tubing supported, thruster exhaust path clear, load-cell cable secured, no tools on the stand.');
      } },
      inspect: { dur: 25, text: 'Post-test visual inspection of the test article', done: () => {
        // A quick look, not a measurement. The full inspection interface is
        // a separate tool; this is what a technician says after a glance.
        const Tw = this.s.model.net.vol('chamber').Tw - 273.15;
        const frost = Tw < 2 ? ' Light frost on the nozzle and valve body — melting.' : Tw < 12 ? ' Thruster body cold to the touch.' : '';
        this.log('TECH', `Post-test visual: thruster, fire valve and feed line intact, no loose fittings, load cell cable secure, exhaust path clear.${frost}`);
      } },
    };
    const t = tasks[task];
    if (!t) throw new Error(`unknown technician task ${task}`);
    this.tech = { task, until: this.t + t.dur, text: t.text, done: t.done };
    this.log('TECH', `${t.text} (≈${t.dur} s)`);
    return { ok: true };
  }

  /* ---- firing sequencer ------------------------------------------------ */
  _startSequence() {
    const p = this.plan;
    const sched = [];
    if (p.mode === 'pulse') {
      for (let k = 0; k < p.count; k++) {
        const t0 = k * (p.on + p.off);
        sched.push({ T: t0, v: 1 }, { T: t0 + p.on, v: 0 });
      }
    } else {
      sched.push({ T: 0, v: 1 }, { T: p.duration, v: 0 });
    }
    this.seq = { state: 'COUNTDOWN', tFire: this.t + COUNTDOWN, plan: { ...p }, sched, next: 0,
                 tEnd: sched[sched.length - 1].T, runId: this.s.daq.recording?.meta.runId ?? null };
    this.log('SEQ', `FIRE: automatic sequence started — ${this.planText()}. T-0 in ${COUNTDOWN} s`, { level: 'caution' });
    this.s.audio('countdown');
    this.emit('sequence', { state: 'COUNTDOWN' });
    return { ok: true };
  }

  _fireValve(v, why) {
    const id = this.def.fireValve;
    this.cmd[id] = v;
    this.s.model.command(id, v);
    this.log('CMD', `${id} ${v ? 'OPEN' : 'CLOSE'} (${why})`, { id, value: v });
    this.lastSvOff = v ? null : this.t;
    if (v) this.lastSvOn = this.t;
    this.s.audio('valve', { id, open: !!v });
  }

  /* ---- abort ----------------------------------------------------------- */
  triggerAbort(reason, source, detail = {}) {
    if (this.abort && !this.abort.reset) return;
    const T = this.testTime();
    this.abort = { t0: this.t, T, reason, source, detail, complete: false, reset: false,
                   steps: this.def.abortSequence.map(s => ({ ...s, done: false, tDone: null })),
                   inBurn: this.seq?.state === 'BURN' };
    if (this.seq) { this.seq.aborted = true; this.seq.state = 'ABORTED'; }
    this.log('ABT', `ABORT — ${reason} (${source === 'auto' ? 'automatic, redline' : 'manual'})`, { level: 'redline' });
    this.s.audio('abort');
    this.emit('abort', this.abort);
  }

  /* ---- clock ----------------------------------------------------------- */
  tick() {
    const t = this.t;
    // facility
    const f = this.facility;
    if (f.area === 'CLEARING' && t >= f.until) {
      f.area = 'SECURED'; f.personnel = 0; f.door = 'LOCKED'; f.beacon = this.armed ? 'RED' : 'AMBER'; f.until = null;
      this.log('FAC', 'Cell SECURED: headcount 0, door closed and interlocked, beacons AMBER');
      this.bump();
    }
    if (this.tech && t >= this.tech.until) {
      const k = this.tech; this.tech = null;
      k.done();
    }
    // abort timeline
    const a = this.abort;
    if (a && !a.complete) {
      for (const st of a.steps) {
        if (st.done || t - a.t0 < st.at) continue;
        st.done = true; st.tDone = t;
        if (st.id === 'DISARM') {
          this.armed = false;
          if (f.area === 'SECURED') f.beacon = 'AMBER';
        } else if (st.id === this.def.regulator) {
          this.regSet = st.value; this.s.model.command(st.id, st.value);
        } else if (st.id === this.def.fireValve) {
          if (this.cmd[st.id]) this._fireValve(0, 'abort');
        } else {
          if (this.cmd[st.id] !== st.value) {
            this.cmd[st.id] = st.value; this.s.model.command(st.id, st.value);
            this.s.audio('valve', { id: st.id, open: !!st.value });
          }
        }
        this.log('ABT', `Abort step: ${st.text}`);
      }
      if (a.steps.every(s => s.done)) {
        a.complete = true;
        this.seq = null;
        this.log('ABT', 'Abort sequence complete. Stand in abort-safe configuration. Reset required.');
        this.emit('abortComplete', a);
        this.bump();
      }
    }
    // sequencer
    const q = this.seq;
    if (q && q.state !== 'ABORTED') {
      const T = t - q.tFire;
      if (q.state === 'COUNTDOWN' && T >= 0) {
        q.state = 'BURN';
        this.log('SEQ', 'T-0', { level: 'caution' });
        this.emit('sequence', { state: 'BURN' });
      }
      if (q.state === 'BURN') {
        while (q.next < q.sched.length && T >= q.sched[q.next].T) {
          const ev = q.sched[q.next++];
          this._fireValve(ev.v, q.plan.mode === 'pulse' ? `pulse ${Math.floor(q.next / 2 + 0.5)}` : (ev.v ? 'T-0' : 'end of burn'));
        }
        if (q.next >= q.sched.length) { q.state = 'TAIL'; this.emit('sequence', { state: 'TAIL' }); }
      }
      if (q.state === 'TAIL' && T >= q.tEnd + TAIL) {
        q.state = 'COMPLETE';
        this.log('SEQ', `Sequence complete${q.cutoff ? ' (manual cutoff)' : ''}. Fire circuit safed.`);
        this.armed = false;
        if (f.area === 'SECURED') f.beacon = 'AMBER';
        this.completed = q;
        this.seq = null;
        this.s.onSequenceComplete(q);
        this.emit('sequence', { state: 'COMPLETE', seq: q });
      }
    }
  }

  /* Seconds since the fire valve was last commanded closed (for limits). */
  sinceSvOff() { return this.lastSvOff == null ? Infinity : this.t - this.lastSvOff; }

  get stateLabel() {
    if (this.abort && !this.abort.complete) return 'ABORT';
    if (this.abort && !this.abort.reset) return 'ABORTED';
    if (this.seq?.state === 'COUNTDOWN') return 'COUNTDOWN';
    if (this.seq && (this.seq.state === 'BURN' || this.seq.state === 'TAIL')) return 'FIRING';
    if (this.armed) return 'ARMED';
    return null;
  }
}
