/* ============================================================================
   voyage.js — the cascade voyage
   ----------------------------------------------------------------------------
   Auto-hop through the universe one object at a time, always moving OUTWARD
   from Earth (or inward toward it, if you start beyond the midpoint of the
   scale ladder): from wherever you are, fly to the next-nearest named object
   that is farther out than the last, pause briefly, hop again — planets,
   stars, nebulae, galaxies, clusters — until the observable horizon (or home).
   Dwell time is adjustable live. Any input hands control back instantly.
   ========================================================================== */
import { clamp, fmtLen } from './scale.js';

const $ = s => document.querySelector(s);

export class Voyage {
  constructor(rig, registry, hooks) {
    this.rig = rig;
    this.registry = registry;
    this.hooks = hooks;
    this.active = false;
    this.dwell = 0.25;
    this.timer = 0;
    this.state = 'idle';
    this.itinerary = [];
    this.idx = -1;
    $('#voyDwell').addEventListener('input', e => {
      this.dwell = +e.target.value;
      $('#voyDwellVal').textContent = this.dwell.toFixed(2) + ' s';
    });
    $('#voyStop').onclick = () => this.stop();
  }

  _distEarth(p, e) { return Math.hypot(p[0]-e[0], p[1]-e[1], p[2]-e[2]); }

  start(ctx) {
    if (this.active) return;
    const e = ctx.earthPos;
    const cam = ctx.camPos;
    const camD = this._distEarth(cam, e);
    const outward = camD < 3e24;                    // beyond ~100 Mpc: come home
    // candidates: everything named with a real position
    const cands = this.registry
      .filter(o => o.pos && o.id !== 'earth' && o.kind !== 'region' || ['observable','localgroup','laniakea','cosmicweb'].includes(o.id))
      .map(o => ({ o, d: this._distEarth(o.pos(ctx), e) }))
      .filter(c => c.d > 1e8)
      .sort((a, b) => a.d - b.d);
    // geometric thinning: each stop meaningfully farther than the last
    const stops = [];
    if (outward) {
      let last = Math.max(camD, 1e8);
      for (const c of cands) {
        if (c.d >= last * 1.10) { stops.push(c.o); last = c.d; }
      }
      const obs = this.registry.find(o => o.id === 'observable');
      if (obs) stops.push(obs);
    } else {
      let last = camD;
      for (let i = cands.length - 1; i >= 0; i--) {
        const c = cands[i];
        if (c.d <= last * 0.90) { stops.push(c.o); last = c.d; }
      }
      const earth = this.registry.find(o => o.id === 'earth');
      if (earth) stops.push(earth);
    }
    if (!stops.length) return;
    this.itinerary = stops;
    this.idx = -1;
    this.active = true;
    this.outward = outward;
    $('#voyagebox').classList.add('on');
    $('#bVoyage').classList.add('on');
    this.hooks.onStart && this.hooks.onStart();
    this._next();
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.state = 'idle';
    if (this.rig.fly && this.rig.fly.locked) this.rig.fly = null;
    $('#voyagebox').classList.remove('on');
    $('#bVoyage').classList.remove('on');
    this.hooks.onStop && this.hooks.onStop();
  }

  _next() {
    this.idx++;
    if (this.idx >= this.itinerary.length) { this.stop(); return; }
    const o = this.itinerary[this.idx];
    const d = o.focusD ?? Math.max((o.radius ?? 1e9) * 4, 1e9);
    this.state = 'flying';
    $('#voyName').textContent = o.name;
    $('#voyCount').textContent = (this.idx + 1) + ' / ' + this.itinerary.length +
      (this.outward ? ' · outward' : ' · homeward');
    this.rig.flyTo(o, Math.log10(d), {
      locked: true,
      dur: null,                                     // recomputed below
      done: () => {
        if (!this.active) return;
        this.state = 'dwelling';
        this.timer = this.dwell;
        this.hooks.onArrive && this.hooks.onArrive(o);
      },
    });
    // brisk pacing: shorter flights than manual travel
    if (this.rig.fly) {
      const f = this.rig.fly;
      const travel = Math.abs(f.peak - f.from.logD) + Math.abs(f.peak - f.toLogD);
      f.dur = clamp(0.7 + travel * 0.22, 0.9, 4.5);
    }
  }

  update(dt) {
    if (!this.active || this.state !== 'dwelling') return;
    this.timer -= dt;
    if (this.timer <= 0) this._next();
  }
}
