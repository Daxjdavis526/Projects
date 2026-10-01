/* The fault engine: decides — secretly — whether this session has a fault,
   and which; applies it at its onset; and keeps the answer until a
   diagnosis has been submitted. No DOM.

   "I should never know whether a test will be nominal": a fault session has
   a chance of having no fault at all, and "no fault" is a diagnosis that
   can be right or wrong like any other. */

import { psi } from '../lib/units.js';

export const HINT_COST = 5;

export class FaultEngine {
  constructor(S, catalog, { enabled = false, chanceNone = 0.2, pool = null, forced = null } = {}) {
    this.S = S;
    this.catalog = catalog;
    this.enabled = enabled || !!forced;
    this.active = null;
    this.params = null;
    this.applied = false;
    this.tApplied = null;
    this.diagnosis = null;
    this.hints = [];
    if (!this.enabled) return;
    const rng = S.rng;
    let def = null;
    if (forced) def = catalog.find(f => f.id === forced) || null;
    else if (!rng.chance(chanceNone)) {
      const list = pool ? catalog.filter(f => pool.includes(f.id)) : catalog;
      def = list[Math.floor(rng.next() * list.length)] || null;
    }
    if (def) {
      this.active = def;
      this.params = def.params ? def.params(rng) : {};
      if (def.onset === 'start') this._apply();
    }
  }

  get hasFault() { return !!this.active; }

  _apply() {
    if (this.applied || !this.active) return;
    this.active.apply(this.S, this.params);
    this.applied = true;
    this.tApplied = this.S.t;
  }

  /* Called by the session every few milliseconds of sim time. */
  tick() {
    const f = this.active;
    if (!f || this.applied) return;
    const c = this.S.controller;
    if (f.onset === 'pressurised' && c.regSet >= psi(100)) this._apply();
    else if (typeof f.onset === 'object' && f.onset.fire !== undefined) {
      const q = c.seq;
      if (q && (q.state === 'BURN' || q.state === 'TAIL') && this.S.t - q.tFire >= f.onset.fire - 1e-9) this._apply();
    }
  }

  /* An inspection's reading under the active fault, if the fault defines
     one and has already happened; otherwise null (read the hardware). */
  inspectOverride(id) {
    const f = this.active;
    if (!f || !this.applied || !f.inspect?.[id]) return null;
    return f.inspect[id](this.S, this.params);
  }

  /* A senior engineer's nudge, in guided fault sessions: three levels, each
     more specific, each costing the diagnosis HINT_COST points. They ask
     questions rather than give answers until the last. */
  hint() {
    if (this.diagnosis || this.hints.length >= 3) return null;
    // keyed on the fault drawn, not on whether it has happened yet: a hint
    // must not say "nothing is wrong" about a fault still waiting for the burn
    const f = this.active;
    const n = this.hints.length;
    const liquid = this.S.def.physics?.model === 'biprop';
    let text;
    if (n === 0) text = 'Locate before you name. When did the first thing look wrong — at rest, on pressurisation, or only with flow? Which channels show it, and which channels that should show it do not?';
    else if (n === 1) text = !f
      ? (this.S.def.physics?.turbopump ? 'Every anomaly needs an ordinary explanation before it needs a fault: scatter, your own actions, the speed controller\'s corrections, the bank blowing down under the turbine, the tank regulators relieving. Check that each thing you noticed has one.'
        : liquid ? 'Every anomaly needs an ordinary explanation before it needs a fault: scatter, your own actions, the tank pressure drooping as the ullage grows, priming, the as-built injector. Check that each thing you noticed has one.'
        : 'Every anomaly needs an ordinary explanation before it needs a fault: scatter, your own actions, the non-relieving regulator, the pressure tare. Check that each thing you noticed has one.')
      : f.category === 'sensor'
        ? 'Ask whether the physics agrees. A real change shows on every channel connected to it — pressure, thrust and flow move together. One channel disagreeing with its neighbours is usually the instrument, not the stand.'
        : `The instruments agree with one another, so believe them: something in the hardware is not as drawn. Follow the ${liquid ? 'propellant' : 'gas'} — where along the flow path does the pressure or the flow stop matching the prediction?`;
    else {
      const ch = f?.evidence.find(e => /^[A-Z]/.test(e));
      const ins = f?.evidence.find(e => /^[a-z]/.test(e) && this.S.def.inspections?.some(i => i.id === e));
      const label = ins && this.S.def.inspections.find(i => i.id === ins).label;
      text = !f ? 'Compare every reduction with its prediction and every transducer with its neighbour at rest. If they all agree within their scatter, that is your answer.'
        : `Look hardest at ${ch || 'the channels nearest the anomaly'}${label ? `, and consider the inspection "${label}"` : ''}.`;
    }
    this.hints.push({ t: this.S.t, text });
    this.S.log.add(this.S.t, 'OPR', `Hint ${n + 1} requested from the senior engineer (−${HINT_COST} on the diagnosis)`);
    return text;
  }

  /* The answer, for the debrief — only after a diagnosis. */
  reveal() {
    if (!this.diagnosis) return null;
    const f = this.active;
    if (!f) return { none: true };
    return { fault: f, params: this.params, story: f.story(this.params), applied: this.applied };
  }
}
