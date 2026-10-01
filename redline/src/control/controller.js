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
import { psi, fmt, fmtT, unitLabel } from '../lib/units.js';

// an igniter is switched, not opened
// a throttle valve goes to a position
const word = (id, on) => (/^IGN-/.test(id) ? (on ? 'ON' : 'OFF') : /^FCV-/.test(id) ? `→ ${Math.round(on * 100)} %` : (on ? 'OPEN' : 'CLOSE'));

export const COUNTDOWN = 5;          // s from FIRE to T-0
export const TAIL = 2;
const EPS = 1e-9;                    // s: event-time comparison tolerance               // s after the last shutdown before the sequence is complete

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
    for (const l of def.physics.lines || []) this.cmd[l.valve.id] = l.valve.normally === 'open' ? 1 : 0;
    for (const id of def.physics.auxCommands || []) this.cmd[id] = 0;
    // every regulator's EPC command; `regSet` is the primary regulator's
    this.regIds = (def.regulators || [{ id: def.regulator }]).map(r => r.id);
    this.sp = Object.fromEntries(this.regIds.map(id => [id, 0]));
    this.armed = false;
    this.seq = null;
    this.abort = null;
    this.lastAbort = null;
    this.plan = { mode: 'single', duration: 3.0, on: 0.1, off: 0.4, count: 10, ...(def.defaultPlan || {}) };
    this.autoStop = true;
    this.recordTail = 3.0;
    this.facility = { area: 'OPEN', personnel: 2, door: 'OPEN', beacon: 'GREEN', until: null, pa: false };
    this.tech = null;             // {task, done, text}
    this.rules = standardInterlocks(def);
    this.epoch = 0;               // bumps on every configuration change
    this.pollEpoch = -1;
    this.pollResult = null;
    if (def.initController) def.initController(this);
  }

  get t() { return this.s.t; }
  get regSet() { return this.sp[this.def.regulator] ?? 0; }
  set regSet(v) { this.sp[this.def.regulator] = v; }
  log(cat, text, extra) { return this.s.log.add(this.t, cat, text, { T: this.testTime(), ...extra }); }

  testTime() { return this.seq ? this.t - this.seq.tFire : null; }

  /* A configuration change invalidates the last go/no-go poll. In a test
     SERIES (a pressure sweep, a pulse campaign) the poll is taken once for
     the whole approved test matrix, so moving between points in it — a new
     setpoint, a new firing plan — does not; anything else still does. */
  bump(kind = 'config') {
    if (kind === 'test' && this.s.scenario?.seriesPoll) return;
    this.epoch++;
  }

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
      sp: this.sp,
      plan: this.plan,
      loaded: this.loaded ?? null,
      wallT: id => s.daq.latest(id),
      pollGo: this.pollGo,
      zeroableIds: s.daq.sensors.filter(x => x.zeroable).map(x => x.id),
      fs: id => s.daq.sensor(id)?.span ?? Infinity,
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
      case 'valve': return `${a.id} ${word(a.id, a.open)}`;
      case 'regSet': return `${a.id || this.def.regulator} setpoint ${fmt(a.value, 'pressure')} ${unitLabel('pressure', true)}`;
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
        this.log('CMD', `${a.id} ${word(a.id, a.open)}`, { id: a.id, value: this.cmd[a.id] });
        this.bump();
        s.audio('valve', { id: a.id, open: a.open });
        return { ok: true };
      }
      case 'regSet': {
        const id = a.id || this.def.regulator;
        if (!(id in this.sp)) throw new Error(`no regulator ${id}`);
        this.sp[id] = Math.max(0, a.value);
        m.command(id, this.sp[id]);
        const epc = this.def.regulators?.find(r => r.id === id)?.epc || 'EPC-101';
        this.log('CMD', `${id} setpoint → ${fmt(this.sp[id], 'pressure')} (${epc})`, { id, value: this.sp[id] });
        this.bump('test');
        s.requestPrediction();
        return { ok: true };
      }
      case 'tech': return this._tech(a.task);
      case 'inspection': return this._inspection(a.id);
      case 'clearCell': {
        if (this.facility.area !== 'OPEN') return { ok: true, noop: true };
        if (this.tech) return { ok: false, blocked: { msg: 'Technician task in progress.', why: 'Wait for the technician to finish and leave the cell.' } };
        this.facility.area = 'CLEARING';
        this.facility.until = this.t + 6;
        this.facility.beacon = 'AMBER';
        this.log('FAC', `Cell clearing: sweep, headcount, door to close. PA: "${this.def.custom ? 'The test cell' : `Test cell ${this.def.family || this.def.id}`} is being cleared."`);
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
        const out = s.daq.zero(a.ids || this.def.tareIds || [this.def.loadCell || 'LC-501']);
        const txt = out.map(o => `${o.id} ${o.removed >= 0 ? '−' : '+'}${fmt(Math.abs(o.removed), o.quantity)}`).join(', ');
        this.log('DAQ', `Tared: ${txt || 'nothing'}`, { tare: out });
        return { ok: true, out };
      }
      case 'shunt': {
        const lc = s.daq.sensor(a.id || this.def.loadCell || 'LC-501');
        lc.shunt = !!a.on;
        this.log('DAQ', `${lc.id} shunt calibration ${a.on ? 'ON (expect +' + lc.shuntValue.toFixed(2) + ' N)' : 'OFF'}`);
        return { ok: true };
      }
      case 'plan': {
        this.plan = { ...this.plan, ...a.plan };
        this.log('SEQ', `Firing plan loaded: ${this.planText()}`);
        this.bump('test');
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
        for (const id of this.mainValves) if (this.cmd[id]) this._cmdValve(id, 0, 'fire circuit disarmed');
        this._auxOff('fire circuit disarmed');
        if (this.seq) { this.log('SEQ', 'Sequence terminated by DISARM', { level: 'caution' }); this.seq = null; }
        this.log('SEQ', 'Fire circuit SAFE (disarmed)');
        return { ok: true };
      }
      case 'fire': return this._startSequence();
      case 'hold': {
        if (!this.seq || this.seq.state !== 'COUNTDOWN') return { ok: true, noop: true };
        this.log('SEQ', `HOLD at ${fmtT(this.t - this.seq.tFire, 1)} — countdown recycled, fire valve never opened`, { level: 'caution' });
        this.seq = null;
        this._auxOff('hold');
        return { ok: true };
      }
      case 'cutoff': {
        if (!this.seq || this.seq.state !== 'BURN') return { ok: true, noop: true };
        this.log('SEQ', `Manual CUTOFF (normal shutdown) at ${fmtT(this.t - this.seq.tFire)}`, { level: 'caution' });
        for (const id of this.mainValves) if (this.cmd[id]) this._cmdValve(id, 0, 'manual cutoff');
        // what the plan does after its shutdown (a post-purge) still runs —
        // brought forward to start now
        const q = this.seq, Tnow = this.t - q.tFire, shift = q.tEnd - Tnow;
        const rest = q.sched.slice(q.next).filter(ev => !ev.main);
        for (const ev of rest) if (!ev.main && ev.T >= q.tEnd - EPS) ev.T -= shift;
        rest.sort((x, y) => x.T - y.T);
        q.sched = [...q.sched.slice(0, q.next), ...rest];
        if (q.tLast !== undefined) q.tLast -= shift;
        this.seq.state = 'TAIL';
        this.seq.tEnd = Tnow;
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
      default:
        if (this.def.actions?.[action]) { const r = this.def.actions[action](this, a); if (r?.ok) this.bump(); return r; }
        throw new Error(`unknown action ${action}`);
    }
  }

  planText(p = this.plan) {
    if (this.def.planText) return this.def.planText(p);
    if (p.mode === 'pulse') return `pulse train, ${p.count} × ${Math.round(p.on * 1000)} ms on / ${Math.round(p.off * 1000)} ms off`;
    return `single burn, ${p.duration.toFixed(2)} s`;
  }

  /* ---- technician ------------------------------------------------------ */
  /* A workbench inspection: a technician task whose result is read from the
     hardware (or the active fault) when it finishes. */
  _inspection(id) {
    const S = this.s, insp = S.def.inspections?.find(i => i.id === id);
    if (!insp) throw new Error(`unknown inspection ${id}`);
    if (this.tech) return { ok: false, blocked: { msg: 'Technician is busy.', why: this.tech.text } };
    const f = this.facility, net = S.model.net, Pa = S.def.physics.ambient.P;
    const lpMax = Math.max(...(this.def.inspectionVolumes || ['hp', 'lp', 'feed', 'chamber']).map(v => net.vol(v).P - Pa));
    const lp = net.vol(this.def.lowPVolume || 'lp').P - Pa;
    if (insp.needs !== 'rack' && f.area !== 'OPEN')
      return { ok: false, blocked: { msg: 'This inspection is done in the cell.', why: 'Open the cell first — which means safing anything hazardous.' } };
    const guard = this.def.inspectGuard?.(this, insp);
    if (guard) return { ok: false, blocked: guard };
    if (insp.needs === 'vented' && lpMax > psi(5))
      return { ok: false, blocked: { msg: `Technician: "Local gauge shows ${(lpMax / psi(1)).toFixed(0)} psig. I'm not opening a pressurised system."`, why: 'Vent every section downstream of IV-101 first.' } };
    if (insp.needs === 'lowP' && !(lp > psi(20) && lp < psi(55)))
      return { ok: false, blocked: { msg: 'This check needs the low-pressure side held at 20–50 psig.', why: 'Snoop tests and reference-gauge comparisons need pressure — but no more than people may be near.' } };
    this.tech = { task: 'inspection', until: this.t + insp.dur, text: insp.label, done: () => {
      const over = S.faults?.inspectOverride(id);
      const res = over || insp.run(S);
      const rec = { id, label: insp.label, group: insp.group, t: this.t, lines: res.lines || [], text: res.text || '' };
      S.inspections.push(rec);
      this.log('TECH', `Inspection complete: ${insp.label} — results in the workbench`, { inspection: id });
      S.emit('inspection', rec);
    } };
    this.log('TECH', `${insp.label} (≈${insp.dur} s)`);
    return { ok: true };
  }

  _tech(task) {
    if (this.tech) return { ok: false, blocked: { msg: 'Technician is busy.', why: this.tech.text } };
    const B = this.def.bottle || { valve: 'HV-100', volume: 'tank' }, txt = this.def.text || {};
    const tasks = {
      openHV: { dur: 5, text: `Opening bottle valve ${B.valve}`, done: () => {
        this.s.model.command(B.valve, 1); this.cmd[B.valve] = 1; this.bump();
        this.s.later(3.0, () => {
          // the bottle's own dial gauge, read by eye to the nearest 50 psi —
          // an independent (and coarse) cross-check of the supply transducer
          const Pt = this.s.model.net.vol(B.volume).P - this.def.physics.ambient.P;
          this.log('TECH', `${B.valve} open. Bottle dial gauge reads about ${Math.round(Pt / psi(50)) * 50} psig.`);
        });
      } },
      closeHV: { dur: 5, text: `Closing bottle valve ${B.valve}`, done: () => {
        this.s.model.command(B.valve, 0); this.cmd[B.valve] = 0; this.bump();
        this.s.later(2.6, () => this.log('TECH', `${B.valve} closed, hand-tight.`));
      } },
      walkdown: { dur: 20, text: 'Stand walkdown', done: () => {
        this.log('TECH', txt.walkdown || 'Walkdown complete: fittings torque-striped, tubing supported, thruster exhaust path clear, load-cell cable secured, no tools on the stand.');
      } },
      inspect: { dur: 25, text: 'Post-test visual inspection of the test article', done: () => {
        // A quick look, not a measurement. The full inspection interface is
        // a separate tool; this is what a technician says after a glance.
        if (txt.inspect) { this.log('TECH', txt.inspect(this.s)); return; }
        const Tw = this.s.model.net.vol('chamber').Tw - 273.15;
        const frost = Tw < 2 ? ' Light frost on the nozzle and valve body — melting.' : Tw < 12 ? ' Thruster body cold to the touch.' : '';
        this.log('TECH', `Post-test visual: thruster, fire valve and feed line intact, no loose fittings, load cell cable secure, exhaust path clear.${frost}`);
      } },
      ...(this.def.techTasks ? this.def.techTasks(this) : {}),
    };
    const t = tasks[task];
    if (!t) throw new Error(`unknown technician task ${task}`);
    const refuse = t.pre?.();
    if (refuse) return { ok: false, blocked: { msg: refuse, why: '' } };
    this.tech = { task, until: this.t + t.dur, text: t.text, done: t.done };
    this.log('TECH', `${t.text} (≈${t.dur} s)`);
    return { ok: true };
  }

  /* ---- firing sequencer ------------------------------------------------ */
  _startSequence() {
    const p = this.plan;
    let sched = [];
    if (this.def.sequence) sched = this.def.sequence(p);
    else if (p.mode === 'pulse') {
      for (let k = 0; k < p.count; k++) {
        const t0 = k * (p.on + p.off);
        sched.push({ T: t0, v: 1 }, { T: t0 + p.on, v: 0 });
      }
    } else {
      sched.push({ T: 0, v: 1 }, { T: p.duration, v: 0 });
    }
    // the default schedule drives the one fire valve
    if (!this.def.sequence) sched = sched.map(ev => ({ id: this.def.fireValve, main: true, ...ev }));
    this.seq = { state: 'COUNTDOWN', tFire: this.t + COUNTDOWN, plan: { ...p }, sched, next: 0,
                 tEnd: Math.max(...sched.filter(ev => ev.main).map(ev => ev.T)), tLast: sched[sched.length - 1].T, runId: this.s.daq.recording?.meta.runId ?? null };
    this.log('SEQ', `FIRE: automatic sequence started — ${this.planText()}. T-0 in ${COUNTDOWN} s`, { level: 'caution' });
    this.s.audio('countdown');
    this.emit('sequence', { state: 'COUNTDOWN' });
    return { ok: true };
  }

  /* The valves the sequencer owns as "the" valves of a firing: the fire
     valve on TS-1, both main valves on TS-2. */
  get mainValves() { return this.def.mainValves || [this.def.fireValve]; }

  _cmdValve(id, v, why) {
    this.cmd[id] = v;
    this.s.model.command(id, v);
    this.log('CMD', `${id} ${word(id, v)} (${why})`, { id, value: v });
    if (this.mainValves.includes(id)) {
      // "burning" starts with the first main valve and ends with the last
      if (v) { if (this.mainValves.every(m => m === id || !this.cmd[m])) this.lastSvOn = this.t; this.lastSvOff = null; }
      else if (this.mainValves.every(m => !this.cmd[m])) this.lastSvOff = this.t;
    }
    this.s.audio('valve', { id, open: !!v });
  }
  /* Sequencer-only outputs that are not valves (an igniter) go off whenever
     the sequence is stopped. */
  _auxOff(why) { for (const id of this.def.physics.auxCommands || []) if (this.cmd[id]) this._cmdValve(id, 0, why); }

  _fireValve(v, why) { this._cmdValve(this.def.fireValve, v, why); }

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
        } else if (st.id in this.sp) {
          this.sp[st.id] = st.value; this.s.model.command(st.id, st.value);
        } else if (this.mainValves.includes(st.id)) {
          if (this.cmd[st.id]) this._cmdValve(st.id, 0, 'abort');
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
      // events scheduled before T-0 (an igniter that must be sparking first)
      if (q.state === 'COUNTDOWN') this._runEvents(q, T);
      if (q.state === 'COUNTDOWN' && T >= -EPS) {
        q.state = 'BURN';
        this.log('SEQ', 'T-0', { level: 'caution' });
        this.emit('sequence', { state: 'BURN' });
      }
      if (q.state === 'BURN') {
        this._runEvents(q, T);
        if (!q.sched.slice(q.next).some(ev => ev.main)) { q.state = 'TAIL'; this.emit('sequence', { state: 'TAIL' }); }
      }
      // events after the last main-valve one (post-purge) run in the tail
      if (q.state === 'TAIL') this._runEvents(q, T);
      if (q.state === 'TAIL' && T >= Math.max(q.tEnd + TAIL, (q.tLast ?? 0) + 0.05) && q.next >= q.sched.length) {
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
    // closed-loop controls a stand runs on its own clock (TS-3's speed control)
    if (this.def.controlTick) this.def.controlTick(this);
  }

  _runEvents(q, T) {
    while (q.next < q.sched.length && T >= q.sched[q.next].T - EPS) {
      const ev = q.sched[q.next++];
      if (q.cutoff && ev.main) continue;           // a cutoff already closed them
      // a stand's own sequenced action (a speed controller, a setpoint ramp)
      if (ev.hook) { this.def.onEvent?.(this, ev); continue; }
      const why = ev.why || (q.plan.mode === 'pulse' ? `pulse ${Math.floor(q.next / 2 + 0.5)}` : (ev.v ? 'T-0' : 'end of burn'));
      if (this.cmd[ev.id] !== ev.v) this._cmdValve(ev.id, ev.v, why);
    }
  }

  /* Absolute sim time of the next sequencer event (T-0 or a valve edge). */
  nextEventTime() {
    const q = this.seq;
    if (!q || q.state === 'ABORTED') return Infinity;
    if (q.state === 'COUNTDOWN') return Math.min(q.tFire, q.next < q.sched.length ? q.tFire + q.sched[q.next].T : Infinity);
    if ((q.state === 'BURN' || q.state === 'TAIL') && q.next < q.sched.length) return q.tFire + q.sched[q.next].T;
    return Infinity;
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
