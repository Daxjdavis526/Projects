/* The cold-gas test article and its stand: a gas network, a nozzle at the end
   of it, and a thrust stand the nozzle pushes against.

   This is the TRUE state of the world. Nothing in the UI reads it directly;
   everything the operator sees goes through a sensor (instruments/) first.
   The only other consumers are the fault engine, which alters it, and the
   post-test debrief, which reveals it.

   The model publishes named signals — 'P:feed', 'F:stand', 'I:SV-301' — so a
   stand definition can wire sensors to physics by name, and a future
   bipropellant model only has to publish its own names to reuse every
   instrument, alarm and plot built for this one. */

import { GasNetwork } from './gasnet.js';
import { GASES } from './gas.js';

export class ColdGasModel {
  constructor(def) {
    const p = def.physics;
    this.def = def;
    this.gas = GASES[p.gas];
    this.net = new GasNetwork({
      gas: this.gas,
      ambient: p.ambient,
      volumes: p.volumes,
      elements: p.elements,
    });
    this.nozzleEl = this.net.el(p.nozzleElement);
    /* Thrust stand: a mass on a stiff flexure with a load cell in the load
       path. It rings when the thrust steps. Its output (in newtons, already
       scaled by the stand's stiffness) is what the load cell feels.
          y'' + 2ζω·y' + ω²·y = ω²·(F + F_tare)
       F_tare is the pressure tare: pressurising the flexible feed line to
       the thruster pushes on the stand a little even with no flow. */
    const ts = p.thrustStand;
    this.stand = {
      w: 2 * Math.PI * ts.fn, z: ts.zeta, y: 0, yd: 0,
      tareVol: this.net.index(ts.tareVolume), tarePerPa: ts.tarePerPa,
      preload: ts.preload ?? 0,
    };
    this.t = 0;
    this.impulse = 0;       // ∫F dt, true
    this.massOut = 0;       // ∫mdot dt through the nozzle, true
    this.fine = false;
    this.signals = this._buildSignals();
  }

  get time() { return this.t; }

  /* Named truth signals. Each is a zero-argument getter so sensors can hold
     a direct reference and not look anything up per sample. */
  _buildSignals() {
    const net = this.net, s = {};
    const Pa = net.ambient.P;
    for (const v of net.volumes) {
      s['P:' + v.id] = () => v.P;
      s['Pg:' + v.id] = () => v.P - Pa;
      s['T:' + v.id] = () => v.T;
      s['Tw:' + v.id] = () => v.Tw;
      s['m:' + v.id] = () => v.m;
    }
    for (const e of net.elements) {
      s['mdot:' + e.id] = () => e.mdot;
      if ('pos' in e) s['pos:' + e.id] = () => e.pos;
      if ('cmd' in e) s['cmd:' + e.id] = () => e.cmd;
      if ('i' in e) s['I:' + e.id] = () => e.i;
      if ('dome' in e) s['dome:' + e.id] = () => e.dome;
      if ('x' in e) s['x:' + e.id] = () => e.x;
      if ('lift' in e) s['lift:' + e.id] = () => e.lift;
      if ('atOpen' in e) { s['zso:' + e.id] = () => (e.atOpen ? 1 : 0); s['zsc:' + e.id] = () => (e.atClosed ? 1 : 0); }
    }
    const nz = this.nozzleEl;
    s['F:true'] = () => nz.F;
    s['F:stand'] = () => this.stand.y;
    s['Pamb'] = () => Pa;
    s['Tamb'] = () => net.ambient.T;
    s['const:0'] = () => 0;
    return s;
  }

  signal(name) {
    const f = this.signals[name];
    if (!f) throw new Error(`model has no signal ${name}`);
    return f;
  }

  /* Operator- or sequencer-level command to a component. */
  command(id, value) {
    const e = this.net.el(id);
    if (!e) throw new Error(`no component ${id}`);
    if (e.type === 'regulator') e.command(value);
    else e.command(!!value, this.net);
  }

  element(id) { return this.net.el(id); }

  stableDt() {
    const dt = this.net.stableDt();
    // the thrust stand's own natural frequency sets a ceiling too
    return Math.min(dt, 0.25 / this.stand.w);
  }

  step(dt) {
    this.net.step(dt);
    const st = this.stand, nz = this.nozzleEl;
    const tareP = st.tareVol >= 0 ? this.net.volumes[st.tareVol].P - this.net.ambient.P : 0;
    const drive = nz.F + st.tarePerPa * tareP + st.preload;
    // semi-implicit Euler: stable for an oscillator
    st.yd += dt * (st.w * st.w * (drive - st.y) - 2 * st.z * st.w * st.yd);
    st.y += dt * st.yd;
    this.impulse += nz.F * dt;
    if (nz.mdot > 0) this.massOut += nz.mdot * dt;
    this.t += dt;
  }

  /* Advance by `span` seconds with automatically chosen sub-steps. Calls
     `onStep(t)` after each sub-step so the instrumentation can sample on
     its own clock. */
  advance(span, onStep) {
    const end = this.t + span;
    while (this.t < end - 1e-12) {
      const dt = Math.min(this.stableDt(), end - this.t);
      this.step(dt);
      if (onStep) onStep(this.t);
    }
  }

  /* A compact snapshot of the true state, for debriefs and tests. */
  snapshot() {
    const out = { t: this.t, volumes: {}, elements: {} };
    for (const v of this.net.volumes) out.volumes[v.id] = { P: v.P, T: v.T, Tw: v.Tw, m: v.m };
    for (const e of this.net.elements) out.elements[e.id] = { mdot: e.mdot, pos: e.pos, cmd: e.cmd };
    out.F = this.nozzleEl.F;
    out.regime = this.nozzleEl.nozzle.out.regime;
    out.Cf = this.nozzleEl.nozzle.out.Cf;
    return out;
  }
}
