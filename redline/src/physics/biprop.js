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
import { Chamber } from './combustion.js';
import { RegenJacket, tsatFU } from './cooling.js';
import { Turbopump } from './turbopump.js';

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
    /* The combustion chamber owns the 'chamber' volume's state: the network
       delivers purge gas into it, the chamber model does the rest. */
    this.chamber = p.chamber ? new Chamber(p.chamber, { ambient: p.ambient, rng }) : null;
    this.chVol = this.chamber ? this.net.vol('chamber') : null;
    if (this.chamber) this._syncChamber();
    // a regeneratively cooled engine: the fuel line runs through the jacket
    this.jacket = p.regen ? new RegenJacket(p.regen, { ambient: p.ambient }) : null;
    this.coolLine = p.regen ? this.lineById.get(p.regen.line) : null;
    // a pump-fed stand: two pumps on the lines, a turbine on the drive gas
    this.tp = p.turbopump ? new Turbopump(p.turbopump, { ambient: p.ambient, lines: this.lines, net: this.net }) : null;
    this.throttleOf = new Map(this.lines.filter(l => l.spec.throttle).map(l => [l.spec.throttle.id, l]));
    const ts = p.thrustStand;
    this.stand = { w: 2 * Math.PI * ts.fn, z: ts.zeta, y: 0, yd: 0, preload: ts.preload ?? 0 };
    this.scales = structuredClone(p.scales || {});   // per session: the DAQ's meter calibration can be changed          // tank weigh scales: pressure tare, kg per Pa
    this.t = 0;
    this.impulse = 0;
    this.signals = this._buildSignals();
  }

  get time() { return this.t; }
  get thrust() {
    const jets = this.lines.reduce((s, l) => s + l.Fjet, 0);
    if (this.chamber) return this.chamber.F + (this.chamber.burning ? 0 : jets);
    return (this.nozzleEl?.F || 0) + jets;
  }

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
      s['Tl:' + id] = () => net.ambient.T + (id === 'fu' ? this.fuelTempOffset || 0 : 0);
      valveSignals(l.valve);
    }
    const C = this.chamber;
    if (C) {
      s['Tw:ch'] = () => C.walls.ch;
      s['Tw:th'] = () => C.walls.th;
      s['Tg:ch'] = () => C.Tgas;
      // the spark exciter draws current whenever commanded, spark or no spark
      s['I:IGN'] = () => (C.igniter.cmd ? (C.igniter.open ? 0 : 1.8) : 0);
      // a photodiode looking into the chamber: flame, spark, or dark
      s['flame'] = () => (C.burning ? 7.5 * Math.min(1, C.P / (0.5 * C.spec.Pnom)) + 0.4 : C.igniter.on ? 0.6 : 0.05);
      // an accelerometer's RMS converter: combustion roughness plus any instability
      s['vib'] = () => (C.burning ? 0.6 * C.P / C.spec.Pnom + 45 * C.chug.A + 600 * C.hf.A : 0.02);
      s['cmd:IGN-901'] = () => C.igniter.cmd;
    }
    const J = this.jacket;
    if (J) {
      const l = this.coolLine;
      s['P:jin'] = () => l.Pjin;
      s['Pg:jin'] = () => l.Pjin - Pa;
      s['Tc:jout'] = () => J.Tout;
      s['Tc:jin'] = () => J.Tin;
      s['Q:jkt'] = () => J.Q;
      for (const sg of J.seg) { s['Tw:' + sg.id] = () => sg.Tw; s['Twg:' + sg.id] = () => sg.Twg; }
    }
    const TP = this.tp;
    if (TP) {
      s['N:tp'] = () => TP.rpm;
      s['vib:tp'] = () => TP.vib;
      s['Tb:pb'] = () => TP.brg.pb;
      s['Tb:tb'] = () => TP.brg.tb;
      s['T:texh'] = () => TP.Texh;
      for (const [side, p] of Object.entries(TP.pumps)) {
        s['Pgin:' + side] = () => p.Pin - Pa;
        s['Pgd:' + side] = () => p.Pd - Pa;
        s['Tc:' + side] = () => p.Tc ?? net.ambient.T;
        s['cav:' + side] = () => p.f;
      }
      for (const l of this.lines) if (l.spec.throttle) { s['thr:' + l.id] = () => l.thr; s['cmd:' + l.spec.throttle.id] = () => l.thrCmd; }
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
    if (this.chamber && id === this.def.physics.chamber.igniter) { this.chamber.igniter.cmd = value ? 1 : 0; return; }
    const thr = this.throttleOf?.get(id);
    if (thr) { thr.thrCmd = Math.max(0, Math.min(1, value)); return; }
    const line = this.valveToLine.get(id);
    if (line) { line.valve.command(!!value, this.net); return; }
    const e = this.net.el(id);
    if (!e) throw new Error(`no component ${id}`);
    if (e.type === 'regulator') e.command(value);
    else e.command(!!value, this.net);
  }

  element(id) { return this.valveToLine.get(id)?.valve || this.net.el(id) || null; }

  /* The liquid temperature each line delivers (the fuel can be warmed by a fault). */
  _liquidTemps() { for (const l of this.lines) l.Tliq = this.net.ambient.T + (l.id === 'fu' ? this.fuelTempOffset || 0 : 0); }

  /* Technician: load the run tanks — with the simulant or the propellants. */
  load(fluids, masses) {
    for (const l of this.lines) { l.setFluid(fluids[l.id]); l.setLiquid(this.net, masses[l.id]); }
  }

  _syncChamber() {
    // the network sees the chamber at its (observed, oscillating) pressure;
    // reverse flow into a manifold arrives cold, which is near enough
    const v = this.chVol, C = this.chamber, g = this.net.gas;
    v.P = C.Pobs; v.T = this.net.ambient.T; v.m = v.P * v.V / (g.R * v.T); v.U = v.m * g.cv * v.T;
  }
  line(id) { return this.lineById.get(id); }

  stableDt() {
    let dt = Math.min(this.net.stableDt(), 0.25 / this.stand.w);
    if (this.chamber) dt = Math.min(dt, this.chamber.stableDt());
    for (const l of this.lines) dt = Math.min(dt, l.stableDt(this.net));
    return Math.max(dt, 2e-6);
  }

  step(dt) {
    if (this.tp) this._liquidTemps();
    for (const l of this.lines) l.step(dt, this.net);
    this.net.step(dt);
    if (this.tp) this.tp.step(dt);
    if (this.chamber) {
      const C = this.chamber, Pc = C.P;
      // injector stiffness: the softer of the sides that are flowing
      let stiff = Infinity;
      for (const l of this.lines) if (l.mdotInj > 0.02) stiff = Math.min(stiff, (this.net.volumes[l.man].P - Pc) / Pc);
      const fu = this.lineById.get('fu');
      C.etaLeak = fu.mdotLeak > 0 && fu.mdotInj > 1e-3 ? 1 - 0.6 * fu.mdotLeak / fu.mdotInj : 1;
      C.step(dt, { ox: this.lineById.get('ox').mdotInj, fu: fu.mdotInj }, this.chVol.dm, stiff);
      this._syncChamber();
    }
    const J = this.jacket;
    if (J) {
      const l = this.coolLine, C = this.chamber;
      // what flows through the channels: the line flow, or — valve shut —
      // whatever the purge is pushing out of them
      const md = Math.max(l.mdot, l.mdotInj, 0);
      J.step(dt, { burning: C.burning, P: C.P, Tgas: C.Tgas, film: C.film, hfA: C.hf.A }, md, Math.max(l.Pjin, this.net.volumes[l.man].P),
        this.net.volumes[l.man].P, this.net.ambient.T + (this.fuelTempOffset || 0));
      const sc = J.seg_(this.def.physics.regen.chamberSeg), st = J.seg_(this.def.physics.regen.throatSeg);
      C.walls.ch = sc.Tw; C.walls.th = st.Tw;
      if (J.breached && !l.jacketLeak) l.jacketLeak = this.def.physics.regen.breachCdA;
    }
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
