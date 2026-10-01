/* The pressure-fed bipropellant stand: a nitrogen gas network (pressurant
   bottle, regulators, tank ullages, purge system, injector manifolds,
   chamber) coupled to two liquid feed lines (liquid.js), and a thrust stand.

   Phase 6 runs it COLD: the propellants are simulants (water) and the
   chamber is open to the cell through the throat, so chamber pressure is
   ambient plus whatever purge gas is passing. What is measured is how the
   feed system and injector behave — priming, pressure drops, flow
   coefficients, mixture ratio — which is exactly what a cold-flow campaign
   exists to establish before anything is lit.

   Like the cold-gas model, this is the TRUE state, published as named
   signals for the instruments. */

import { GasNetwork } from './gasnet.js';
import { GASES } from './gas.js';
import { LiquidLine } from './liquid.js';

const G0 = 9.80665;

export class BipropModel {
  constructor(def, { rng = null } = {}) {
    const p = def.physics;
    this.def = def;
    this.gas = GASES[p.gas];
    this.net = new GasNetwork({ gas: this.gas, ambient: p.ambient, volumes: p.volumes, elements: p.elements });
    if (rng) for (const e of this.net.elements) if ('jitPull' in e) e.rng = rng;
    this.lines = p.lines.map(l => new LiquidLine(l, this.net));
    this.lineById = new Map(this.lines.map(l => [l.id, l]));
    this.valveToLine = new Map(this.lines.map(l => [l.valve.id, l]));
    this.nozzleEl = p.nozzleElement ? this.net.el(p.nozzleElement) : null;
    const ts = p.thrustStand;
    this.stand = { w: 2 * Math.PI * ts.fn, z: ts.zeta, y: 0, yd: 0, preload: ts.preload ?? 0 };
    this.scales = p.scales || {};          // tank weigh scales: pressure tare, kg per Pa
    this.t = 0;
    this.impulse = 0;
    this.signals = this._buildSignals();
  }

  get time() { return this.t; }
  get thrust() { return (this.nozzleEl?.F || 0) + this.lines.reduce((s, l) => s + l.Fjet, 0); }

  _buildSignals() {
    const net = this.net, s = {}, Pa = net.ambient.P;
    for (const v of net.volumes) {
      s['P:' + v.id] = () => v.P;
      s['Pg:' + v.id] = () => v.P - Pa;
      s['T:' + v.id] = () => v.T;
      s['Tw:' + v.id] = () => v.Tw;
    }
    const valveSignals = e => {
      s['pos:' + e.id] = () => e.pos;
      s['cmd:' + e.id] = () => e.cmd;
      if ('i' in e) s['I:' + e.id] = () => e.i;
      if ('dome' in e) s['dome:' + e.id] = () => e.dome;
      if ('atOpen' in e) { s['zso:' + e.id] = () => (e.atOpen ? 1 : 0); s['zsc:' + e.id] = () => (e.atClosed ? 1 : 0); }
    };
    for (const e of net.elements) { s['mdot:' + e.id] = () => e.mdot; valveSignals(e); }
    for (const l of this.lines) {
      const id = l.id, sc = this.scales[id] || {};
      s['mdotL:' + id] = () => l.mdot;                       // line mass flow
      s['mdotI:' + id] = () => l.mdotInj;                    // out of the injector
      s['Pgvi:' + id] = () => l.Pvi - Pa;                    // valve inlet, gauge
      s['fill:' + id] = () => l.fill;
      s['mL:' + id] = () => l.mL;
      // a turbine meter measures VOLUME flow; the DAQ turns it into mass
      // with the density it was configured for (sc.rhoCal)
      s['Qm:' + id] = () => (l.mdot / l.rho) * (sc.rhoCal ?? l.rho);
      // the tank scale: liquid plus a pressure tare from the flex lines
      s['W:' + id] = () => l.mL + (sc.dry ?? 0) + (sc.tarePerPa ?? 0) * (net.volumes[l.tank].P - Pa);
      s['Tl:' + id] = () => net.ambient.T;
      valveSignals(l.valve);
    }
    s['F:stand'] = () => this.stand.y;
    s['F:true'] = () => this.thrust;
    s['Pamb'] = () => Pa;
    s['const:0'] = () => 0;
    return s;
  }

  signal(name) {
    const f = this.signals[name];
    if (!f) throw new Error(`model has no signal ${name}`);
    return f;
  }

  command(id, value) {
    const line = this.valveToLine.get(id);
    if (line) { line.valve.command(!!value, this.net); return; }
    const e = this.net.el(id);
    if (!e) throw new Error(`no component ${id}`);
    if (e.type === 'regulator') e.command(value);
    else e.command(!!value, this.net);
  }

  element(id) { return this.valveToLine.get(id)?.valve || this.net.el(id) || null; }
  line(id) { return this.lineById.get(id); }

  stableDt() {
    let dt = Math.min(this.net.stableDt(), 0.25 / this.stand.w);
    for (const l of this.lines) dt = Math.min(dt, l.stableDt(this.net));
    return Math.max(dt, 2e-6);
  }

  step(dt) {
    for (const l of this.lines) l.step(dt, this.net);
    this.net.step(dt);
    const st = this.stand, F = this.thrust;
    st.yd += dt * (st.w * st.w * (F + st.preload - st.y) - 2 * st.z * st.w * st.yd);
    st.y += dt * st.yd;
    this.impulse += F * dt;
    this.t += dt;
  }

  advance(span, onStep) {
    const end = this.t + span;
    while (this.t < end - 1e-12) {
      const dt = Math.min(this.stableDt(), end - this.t);
      this.step(dt);
      if (onStep) onStep(this.t);
    }
  }

  snapshot() {
    const out = { t: this.t, volumes: {}, lines: {} };
    for (const v of this.net.volumes) out.volumes[v.id] = { P: v.P, T: v.T, V: v.V, m: v.m };
    for (const l of this.lines) out.lines[l.id] = { mdot: l.mdot, mdotInj: l.mdotInj, mL: l.mL, fill: l.fill, w: l.w, valve: l.valve.pos };
    out.F = this.thrust;
    return out;
  }
}

export { G0 };
