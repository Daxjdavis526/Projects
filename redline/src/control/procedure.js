/* The procedure engine.

   A procedure is data: sections of steps, each with an instruction, the
   station responsible, WHY it exists, and — where the simulator can tell —
   a check against the measured state. Step kinds:

     info     read and acknowledge
     action   do something; completes itself when its check becomes true
     verify   look at the data and confirm; the confirmation is checked
     record   read a value off the instruments and enter it
     hold     wait a set time while something is monitored (leak check)
     poll     run the go/no-go poll

   Statuses: PENDING, COMPLETE, FAILED, SKIPPED (and ACTIVE for the first
   pending step, which is only a display hint). Steps may be done out of
   order — an action step completes whenever its condition is met, because
   there is usually more than one valid order and harmless differences are
   not errors. What the engine will not do is pretend: a verify step whose
   check fails is FAILED in guided modes, and in independent mode the
   operator's word is accepted but the truth is kept for the debrief.

   Checks read a view `v` of the stand built by the session: measured
   channels, commands, facility, DAQ, event history. Never the physics. */

import { Emitter } from '../lib/emitter.js';

/* Titles and texts may be functions of the view (to quote the test request). */
export const resolve = (x, v) => (typeof x === 'function' ? x(v) : x);

export const ST = { PENDING: 'PENDING', COMPLETE: 'COMPLETE', FAILED: 'FAILED', SKIPPED: 'SKIPPED' };

export class ProcedureRunner extends Emitter {
  constructor(session, proc) {
    super();
    this.s = session;
    this.proc = proc;
    this.steps = [];
    for (const sec of proc.sections) {
      for (const st of sec.steps) this.steps.push({ ...st, section: sec.id, sectionLabel: sec.label ?? sec.id, sectionTitle: sec.title });
    }
    this.byId = new Map(this.steps.map(s => [s.id, s]));
    const secs = proc.sections.map(x => x.id);
    for (const st of this.steps) st.secIdx = secs.indexOf(st.section);
    this.state = new Map(this.steps.map(s => [s.id, { status: ST.PENDING, t: null, msg: null, value: null, truthOk: null, note: '' }]));
    this.holds = new Map();
    this.activatedAt = new Map();
    this.done = false;
    this.startedAt = session.t;
    this._markActive();
  }

  status(id) { return this.state.get(id).status; }
  get active() { return this.steps.find(s => this.status(s.id) === ST.PENDING) || null; }

  _markActive() {
    const a = this.active;
    if (a && !this.activatedAt.has(a.id)) {
      this.activatedAt.set(a.id, this.s.t);
      this.emit('active', a);
    }
    if (!a && !this.done) { this.done = true; this.emit('done', this.summary()); }
  }

  _set(id, status, extra = {}) {
    const st = this.state.get(id);
    Object.assign(st, extra, { status, t: this.s.t });
    const step = this.byId.get(id);
    this.s.log.add(this.s.t, 'PROC', `${step.num ? step.num + ' ' : ''}${resolve(step.title, this.s.view())} — ${status}${extra.msg ? ': ' + extra.msg : ''}`,
                   { level: status === ST.FAILED ? 'caution' : 'info', step: id });
    this.emit('change', { id, status, step, state: st });
    this._markActive();
  }

  _audit(step, v) {
    if (!step.audit && !step.check) return null;
    try { const r = (step.audit || step.check)(v); return typeof r === 'object' ? !!r.ok : !!r; } catch { return null; }
  }

  _eval(step, v) {
    if (!step.check) return { ok: true };
    try {
      const r = step.check(v);
      if (typeof r === 'object' && r) return { ok: !!r.ok, msg: r.msg };
      return { ok: !!r, msg: r ? null : step.failMsg };
    } catch (e) { return { ok: false, msg: 'check error: ' + e.message }; }
  }

  /* Called by the session a few times a second. Action steps complete by
     themselves when their condition is met — out of order is fine, within
     reach: the current section and the next. (Without that window the
     safing steps at the end would tick themselves off at the start, when
     the stand happens to be safe already.) */
  tick(v) {
    const reach = (this.active?.secIdx ?? Infinity) + 1;
    for (const step of this.steps) {
      const st = this.state.get(step.id);
      if (st.status !== ST.PENDING) continue;
      if (step.kind === 'action' && step.check && step.secIdx <= reach && (!step.gate || step.gate(v)) && this._eval(step, v).ok) {
        this._set(step.id, ST.COMPLETE, { truthOk: this._audit(step, v) });
      }
      if (step.kind === 'hold') {
        const h = this.holds.get(step.id);
        if (h && !h.result && this.s.t >= h.end) {
          h.result = step.hold.evaluate(v, h);
          if (step.hold.store) this.s[step.hold.store] = h.result;
          this.emit('holdDone', { id: step.id, result: h.result });
        }
      }
      if (step.kind === 'poll' && v.pollAfter(this.activatedAt.get(step.id) ?? this.startedAt)) {
        const p = v.lastPoll;
        this._set(step.id, ST.COMPLETE, { msg: p.go ? 'GO' : 'NO-GO — hold', value: p.go, truthOk: p.correct });
      }
    }
  }

  /* Operator acknowledges an info step or confirms a verify/record step. */
  confirm(id, input) {
    const step = this.byId.get(id), st = this.state.get(id);
    if (!step || st.status === ST.COMPLETE) return { ok: true };
    const v = this.s.view();
    const mode = this.s.mode;
    const guided = mode === 'tutorial' || mode === 'guided';
    if (step.kind === 'info') { this._set(id, ST.COMPLETE); return { ok: true }; }
    if (step.kind === 'action') {
      // Operator claims it is done (useful in independent mode, where action
      // steps may be ticked by hand).
      const r = this._eval(step, v);
      if (r.ok) { this._set(id, ST.COMPLETE, { truthOk: this._audit(step, v) }); return { ok: true }; }
      if (guided) return { ok: false, msg: r.msg || 'Not done yet — the stand does not show this step complete.' };
      this._set(id, ST.COMPLETE, { truthOk: false, msg: 'marked complete by operator' });
      return { ok: true };
    }
    if (step.kind === 'record') {
      const val = Number(input);
      if (!Number.isFinite(val)) return { ok: false, msg: 'Enter a number.' };
      const r = step.record.validate(val, v);
      if (r.ok || !guided) { this._set(id, ST.COMPLETE, { value: val, truthOk: r.ok, msg: r.msg }); return { ok: true, note: r.msg }; }
      return { ok: false, msg: r.msg };
    }
    if (step.kind === 'hold') {
      const h = this.holds.get(id);
      if (!h || !h.result) return { ok: false, msg: 'Complete the hold first.' };
      const accept = input !== false;
      const truthOk = h.result.ok === accept;
      if (accept && !h.result.ok && guided) {
        this._set(id, ST.FAILED, { msg: h.result.msg, value: h.result.value, truthOk: false });
        return { ok: false, msg: h.result.msg };
      }
      this._set(id, accept ? ST.COMPLETE : ST.FAILED, { value: h.result.value, msg: h.result.msg, truthOk });
      return { ok: true };
    }
    if (step.kind === 'verify') {
      const r = this._eval(step, v);
      if (r.ok) { this._set(id, ST.COMPLETE, { truthOk: this._audit(step, v) }); return { ok: true }; }
      if (guided) { this._set(id, ST.FAILED, { msg: r.msg || step.failMsg || 'Check not satisfied.' }); return { ok: false, msg: r.msg || step.failMsg }; }
      this._set(id, ST.COMPLETE, { truthOk: false, msg: 'verified by operator' });
      return { ok: true };
    }
    if (step.kind === 'poll') return { ok: false, msg: 'Run the go/no-go poll.' };
    return { ok: true };
  }

  startHold(id) {
    const step = this.byId.get(id);
    if (!step || step.kind !== 'hold') return;
    const v = this.s.view();
    const pre = step.hold.pre ? step.hold.pre(v) : { ok: true };
    if (!pre.ok) return { ok: false, msg: pre.msg };
    const h = { start: this.s.t, end: this.s.t + step.hold.seconds, result: null, snapshot: step.hold.begin ? step.hold.begin(v) : null };
    this.holds.set(id, h);
    this.s.log.add(this.s.t, 'PROC', `${resolve(step.title, v)}: hold started (${step.hold.seconds} s)`, { step: id });
    this.emit('holdStart', { id, hold: h });
    return { ok: true };
  }

  skip(id, reason = '') { this._set(id, ST.SKIPPED, { msg: reason || 'skipped by operator' }); }
  fail(id, reason = '') { this._set(id, ST.FAILED, { msg: reason || 'declared failed by operator' }); }
  reopen(id) { const st = this.state.get(id); st.status = ST.PENDING; st.msg = null; this.emit('change', { id, status: ST.PENDING }); this._markActive(); }
  note(id, text) { this.state.get(id).note = text; }

  summary() {
    const c = { COMPLETE: 0, FAILED: 0, SKIPPED: 0, PENDING: 0 };
    let truthBad = 0;
    for (const s of this.steps) {
      const st = this.state.get(s.id);
      c[st.status]++;
      if (st.truthOk === false) truthBad++;
    }
    return { counts: c, total: this.steps.length, truthBad };
  }
}
