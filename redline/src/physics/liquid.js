/* A liquid feed line: tank → run line → main valve → injector manifold →
   injector orifices → chamber. One per propellant. No DOM.

   The liquid is incompressible; what makes the line dynamic is the
   liquid's inertia and the gas trapped with it.

     Line flow      I·dṁ/dt = P_tank − P_man − R(valve)·ṁ|ṁ|
                    I = Σ L/A, the line's inertance. Close the valve fast
                    and the decelerating column shows up as a pressure
                    surge at the valve inlet: water hammer, lumped.
     Resistance     R = Σ 1 / (2ρ·(CdA)²) over the fixed restrictions (line
                    friction, flowmeter, fittings) and the valve's open area.
     Injector       ṁ_inj = w · CdA_inj · √(2ρ·(P_man − P_c))
     Manifold       the volume between the main valve and the injector face
                    starts DRY — full of purge gas or air. Liquid arriving
                    compresses that gas, which escapes through the orifices
                    until the liquid reaches them. `w` is the wetted fraction
                    of the orifices, rising as the manifold fills; until it
                    reaches one, flow out of the injector is partly gas. The
                    time this takes is the PRIMING time — the first thing a
                    cold-flow test measures and the thing hot-fire start
                    sequences are built around. Once the orifices are wet
                    the gas left in the manifold (a few per cent of it, in
                    pockets) cannot escape: the liquid squeezes it, and that
                    cushion is the manifold's compliance — what makes its
                    pressure ring.

   The tank ullage and the manifold gas are ordinary volumes of the gas
   network: as liquid leaves the tank the ullage grows (and its gas expands
   and cools), as liquid fills the manifold its gas is squeezed. The network
   does the gas; this file does the liquid and the volume exchange.

   Integration: the line flow is updated semi-implicitly in its resistance
   (a valve slamming shut is infinitely stiff otherwise); everything else is
   explicit, with the step bounded by `stableDt`. */

import { Valve } from './elements.js';

const smooth = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

export class LiquidLine {
  constructor(spec, net) {
    this.spec = spec;
    this.id = spec.id;
    this.fluid = spec.fluid;                       // { name, rho }
    this.rho = spec.fluid.rho;
    this.tank = net.index(spec.tank);              // ullage gas volume
    this.man = net.index(spec.manifold);           // manifold gas volume
    this.ch = net.index(spec.chamber);
    this.Vtank = spec.Vtank;                       // m³, total tank volume
    this.Vman = spec.Vman;                         // m³, manifold (valve → injector face)
    this.cushion = spec.cushion ?? 0.03;           // trapped-gas fraction at full
    this.I = spec.inertance;                       // 1/m
    this.Iup = spec.inertanceUp ?? 0.8 * spec.inertance;   // share upstream of the valve
    this.CdAline = spec.CdAline;                   // fixed restrictions, lumped
    this.CdAinj = spec.CdAinj;                     // as-built injector, liquid
    this.CdAinjGas = spec.CdAinjGas ?? spec.CdAinj * 1.1;
    this.wetFrom = spec.wetFrom ?? 0.55;           // manifold fill fraction where orifices start to wet
    this.jetCv = spec.jetCv ?? 0.95;               // jet velocity coefficient
    this.jetAxial = spec.jetAxial ?? 0.87;         // axial share of jet momentum (impinging)
    this.gasEl = net.el(spec.gasPath);             // the network orifice gas escapes through
    // the main valve is an ordinary actuated valve, outside the gas network
    this.valve = new Valve({ ...spec.valve, type: 'valve', from: 'ambient', to: 'ambient' }, net);
    this.mL = spec.m0 ?? 0;                        // kg of liquid in the tank
    this.Vl = 0;                                   // m³ of liquid in the manifold
    this.mdot = 0;                                 // kg/s, line (tank → manifold)
    this.mdotInj = 0;                              // kg/s, liquid out of the injector
    this.mdotDot = 0;                              // kg/s², for the surge at the valve inlet
    this.Pvi = 0;                                  // Pa abs, valve inlet
    this.w = 0;
    this.Fjet = 0;
    this.drained = 0;                              // kg delivered through the injector, total
    // fault hooks
    this.injBlockage = 0;                          // fraction of orifice area plugged
    this.lineBlockage = 0;
    this._applyVolumes(net, true);
  }

  get Vliq() { return this.mL / this.rho; }
  get fill() { return this.Vl / this.Vman; }

  /* Load or unload the tank (a technician task, with the tank vented). */
  setLiquid(net, kg) {
    this.mL = Math.max(0, Math.min(kg, 0.95 * this.Vtank * this.rho));
    this._applyVolumes(net);
  }

  /* Ullage and manifold gas volumes follow the liquid. Changing a gas
     volume does p·dV work on (or by) the gas in it. */
  _applyVolumes(net, init = false) {
    const g = net.gas;
    const setV = (i, V) => {
      const v = net.volumes[i];
      if (!init) v.U -= v.P * (V - v.V);
      else v.U = v.m * g.cv * v.T;
      v.V = V;
      v.T = Math.max(30, v.U / (v.m * g.cv));
      v.U = v.m * g.cv * v.T;
      v.P = v.m * g.R * v.T / v.V;
    };
    const Vu = Math.max(0.02 * this.Vtank, this.Vtank - this.Vliq);
    const Vg = Math.max(1e-3 * this.Vman, this.Vman - this.Vl);
    if (init) {
      // volumes start at their nominal size, gas at the network's initial state
      for (const [i, V] of [[this.tank, Vu], [this.man, Vg]]) {
        const v = net.volumes[i];
        v.m = v.P * V / (g.R * v.T);
        setV(i, V);
      }
    } else { setV(this.tank, Vu); setV(this.man, Vg); }
  }

  R(area) { return area > 0 ? 1 / (2 * this.rho * area * area) : Infinity; }

  step(dt, net) {
    const vt = net.volumes[this.tank], vm = net.volumes[this.man];
    const Pc = net.state(this.ch).P;
    this.valve.update(dt, net);
    const aV = this.valve.CdA();
    const aL = this.CdAline * (1 - this.lineBlockage);
    const Rtot = aV > 1e-12 ? this.R(aL) + this.R(aV) : Infinity;
    // a dry tank drives nothing (the line would ingest gas: the run is over)
    const Pup = this.mL > 1e-3 ? vt.P : vm.P;
    const prev = this.mdot;
    if (!Number.isFinite(Rtot)) this.mdot = 0;
    else {
      const k = dt / this.I;
      this.mdot = (this.mdot + k * (Pup - vm.P)) / (1 + k * Rtot * Math.abs(this.mdot));
    }
    if (this.mdot > 0 && this.mL <= 0) this.mdot = 0;
    this.mdotDot = (this.mdot - prev) / dt;
    // valve inlet pressure: tank, less the upstream share of friction and the
    // force needed to decelerate (or accelerate) the upstream column
    const Rup = this.R(aL) * 0.7;
    this.Pvi = Pup - Rup * this.mdot * Math.abs(this.mdot) - this.Iup * this.mdotDot;
    // injector
    this.w = smooth((this.fill - this.wetFrom) / (1 - this.cushion - this.wetFrom));
    const dPi = vm.P - Pc;
    const aI = this.CdAinj * (1 - this.injBlockage);
    this.mdotInj = dPi > 0 && this.Vl > 0 ? this.w * aI * Math.sqrt(2 * this.rho * dPi) : 0;
    // what the orifices do not pass, purge gas blows out (and, slowly,
    // gravity drains): this is what a post-shutdown purge is for
    const gasOut = this.gasEl ? Math.max(0, this.gasEl.mdot) : 0;
    const blow = this.Vl > 0 ? this.Vl * this.rho * (Math.min(1, gasOut / 0.002) / 0.4 + 1 / 30) : 0;
    this.mdotInj += Math.min(blow, this.Vl * this.rho / dt);
    // liquid inventory
    this.mL = Math.max(0, this.mL - this.mdot * dt);
    this.Vl += (this.mdot - this.mdotInj) * dt / this.rho;
    // the trapped gas is squeezed, not removed: its pressure is what stops
    // the liquid (only a sliver of volume is kept as a numerical floor)
    const VlMax = this.Vman * (1 - 1e-3);
    if (this.Vl > VlMax) this.Vl = VlMax;
    if (this.Vl < 0) this.Vl = 0;
    this.drained += this.mdotInj * dt;
    // gas escapes through the orifices the liquid has not reached
    if (this.gasEl) this.gasEl.CdA0 = this.CdAinjGas * (1 - this.injBlockage) * (1 - this.w);
    this._applyVolumes(net);
    // jet momentum on the thrust stand
    const v = dPi > 0 ? this.jetCv * Math.sqrt(2 * dPi / this.rho) : 0;
    this.Fjet = this.mdotInj * v * this.jetAxial;
  }

  /* Largest stable explicit step for the manifold: the gas cushion against
     the injector and line conductances. */
  stableDt(net) {
    const vm = net.volumes[this.man];
    const Vg = Math.max(vm.V, 1e-9);
    const Pc = net.state(this.ch).P;
    const dPi = Math.max(vm.P - Pc, 2e3);
    const kInj = this.w * this.CdAinj * Math.sqrt(2 * this.rho) / (2 * Math.sqrt(dPi));
    const lam = (kInj / this.rho) * (vm.P / Vg);
    return lam > 0 ? 0.35 / lam : Infinity;
  }
}
