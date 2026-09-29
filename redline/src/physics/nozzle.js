/* A converging–diverging nozzle exhausting to ambient, quasi-steady.

   The nozzle is fast compared with everything upstream of it (gas crosses a
   few-millimetre nozzle in microseconds), so at every step it is solved as if
   in steady state for the current chamber pressure. Four regimes:

   · Pc ≤ Pa           nothing leaves (a little air can creep in; ignored for thrust)
   · subsonic          the throat is not choked: a venturi. Exit pressure is
                       ambient and mass flow depends on Pa. Happens only at the
                       very start and end of every firing.
   · choked, separated the throat is choked but the supersonic expansion would
                       fall below ~40 % of ambient; the jet separates from the
                       wall (Summerfield criterion) and the wall beyond sees
                       roughly ambient. Thrust is computed at the separation
                       station.
   · choked, attached  the textbook case: mdot = Cd·At·Pc·Γ/√(R·Tc) and
                       F = λ·mdot·Ve + (Pe − Pa)·Ae.

   What this deliberately leaves out: shocks standing inside the diverging
   section are folded into the separation model; the boundary layer is a
   single discharge coefficient Cd; and divergence loss is the conical-nozzle
   factor λ = (1 + cos α)/2. Across the choking boundary the two thrust
   expressions do not quite meet, so they are blended over 15 % of chamber
   pressure — this is a millisecond-long, sub-0.3 N part of every transient
   and nothing in the trainer depends on its exact shape. */

import { prepareGas, flowFunction, orificeFlow, areaRatio, machOfArea, prOfMach,
         machOfPr, exhaustVelocity } from './gas.js';

export class Nozzle {
  constructor(spec, gas) {
    this.gas = prepareGas(gas);
    this.configure(spec);
    this.out = { mdot: 0, F: 0, regime: 'none', pe: 0, Me: 0, Cf: 0 };
  }

  /* Geometry can change under a fault (erosion, wrong nozzle), so this is
     separate from the constructor. */
  configure(spec) {
    const g = this.gas;
    this.spec = { ...spec };
    this.throatDia = spec.throatDia;
    this.exitDia = spec.exitDia;
    this.At = Math.PI / 4 * spec.throatDia ** 2;
    this.Ae = Math.PI / 4 * spec.exitDia ** 2;
    this.eps = this.Ae / this.At;
    this.Cd = spec.Cd ?? 0.97;
    const alpha = (spec.halfAngleDeg ?? 15) * Math.PI / 180;
    this.lambda = (1 + Math.cos(alpha)) / 2;
    this.sepRatio = spec.sepRatio ?? 0.4;
    /* Obstruction: a fraction of the throat area blocked (a fault hook). */
    this.blockage = spec.blockage ?? 0;
    this.MeSup = machOfArea(this.eps, true, g);
    this.MeSub = machOfArea(this.eps, false, g);
    this.prSup = prOfMach(this.MeSup, g);   // Pe/Pc when fully expanded
    this.prSub = prOfMach(this.MeSub, g);   // Pa/Pc at which the throat just chokes
  }

  get AtEff() { return this.At * (1 - this.blockage); }

  evaluate(Pc, Tc, Pa, Tamb) {
    const g = this.gas, o = this.out;
    const At = this.AtEff;
    // An obstruction at the throat also shrinks the flow area downstream of it
    // for the purpose of the subsonic solution; keep the exit geometric.
    if (Pc <= Pa) {
      o.mdot = orificeFlow(this.Cd * At, Pc, Tc, Pa, Tamb, g);
      o.F = 0; o.regime = 'none'; o.pe = Pa; o.Me = 0; o.Cf = 0;
      return o;
    }
    const sq = Math.sqrt(g.R * Tc);
    const prA = Pa / Pc;
    const prSub = this.prSub;
    if (prA >= prSub) {
      // Subsonic throughout: exit at ambient, flow set by the exit area.
      // (Scaled by the throat blockage so the flow is continuous at choking.)
      const mdot = this.Cd * this.Ae * (1 - this.blockage) * Pc * flowFunction(prA, g) / sq;
      o.mdot = mdot;
      o.F = this.lambda * mdot * exhaustVelocity(Tc, prA, g);
      o.regime = 'subsonic';
      o.pe = Pa;
      o.Me = machOfPr(prA, g);
    } else {
      const mdot = this.Cd * At * Pc * g.fChoke / sq;
      o.mdot = mdot;
      const pSep = this.sepRatio * Pa;
      const pe = this.prSup * Pc;
      let F;
      if (pe >= pSep) {
        F = this.lambda * mdot * exhaustVelocity(Tc, this.prSup, g) + (pe - Pa) * this.Ae;
        o.regime = pe > Pa * 1.03 ? 'underexpanded' : pe < Pa * 0.97 ? 'overexpanded' : 'matched';
        o.pe = pe;
        o.Me = this.MeSup;
      } else {
        const prx = pSep / Pc;
        const Mx = machOfPr(prx, g);
        const Ax = this.At * areaRatio(Mx, g);
        F = this.lambda * mdot * exhaustVelocity(Tc, prx, g) + (pSep - Pa) * Ax;
        o.regime = 'separated';
        o.pe = pSep;
        o.Me = Mx;
      }
      // Blend across the choking boundary.
      const PcChoke = Pa / prSub;
      const w = (Pc - PcChoke) / (0.15 * PcChoke);
      if (w < 1) {
        const Fsub = this.lambda * mdot * exhaustVelocity(Tc, prSub, g);
        F = Fsub + (F - Fsub) * Math.max(0, w);
      }
      o.F = F;
    }
    if (o.F < 0) o.F = 0;
    o.Cf = o.F / (Pc * this.At);
    return o;
  }
}
