/* The fault engine: decides — secretly — whether this session has a fault,
   and which; applies it at its onset; and keeps the answer until a
   diagnosis has been submitted. No DOM.

   "I should never know whether a test will be nominal": a fault session has
   a chance of having no fault at all, and "no fault" is a diagnosis that
   can be right or wrong like any other. */

import { psi } from '../lib/units.js';

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

  /* The answer, for the debrief — only after a diagnosis. */
  reveal() {
    if (!this.diagnosis) return null;
    const f = this.active;
    if (!f) return { none: true };
    return { fault: f, params: this.params, story: f.story(this.params), applied: this.applied };
  }
}
