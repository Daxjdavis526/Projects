/* A regeneratively cooled chamber wall. No DOM.

   The fuel, on its way from the main valve to the injector, runs through
   channels milled into the chamber liner — in at the nozzle end, out at the
   injector end (counterflow) — and carries away the heat the hot gas puts
   into the wall. Lumped along the axis into a handful of segments, each with

     a liner node   copper alloy, thin, with its own heat capacity
                    Q_g = U_g·(T_aw − T_w),   1/U_g = 1/(h_g·S) + t/(2kS)
     a coolant node the fuel in that segment's channels, carried along by
                    the flow: m·cp·dT/dt = ṁ·cp·(T_up − T) + Q_c
                    Q_c = U_c·(T_w − T_c), 1/U_c = 1/(h_c·S) + t/(2kS) + R_coke/S

   Gas side: h_g ∝ Pc^0.8 · (At/A)^0.9 — the pressure and area scaling of
   Bartz's correlation, with the constant tuned rather than computed: the
   throat sees the highest flux, the barrel far less. Coolant side: h_c ∝
   ṁ^0.8 (Dittus–Boelter at a fixed channel), higher where the channels are
   narrow. The adiabatic wall temperature is a fixed fraction of the gas
   temperature.

   What makes it interesting is the fuel:
   · it BOILS at a temperature set by the local pressure (an invented,
     alcohol-like vapour-pressure curve). Where the coolant-side wall passes
     saturation, nucleate boiling helps; where the heat flux passes the
     CRITICAL HEAT FLUX — lower with less flow, less subcooling — a vapour
     film forms, the coefficient collapses and the liner burns out.
   · it COKES: above a threshold the coolant-side wall grows a deposit, an
     extra thermal resistance that stays for every later run.
   · the liner can CRACK: hot enough for long enough, and fuel leaks from the
     channels straight into the chamber.
   Both integrations are implicit per segment (backward Euler), so a thin
   liner is no constraint on the step. */

const ANT = { A: 8.20417, B: 1642.89, C: 230.3 };     // ethanol-like, mmHg/°C — FU-1 is fictional
const MMHG = 133.322, P_CRIT = 6.1e6;

/* Saturation temperature (K) of FU-1 at pressure P (Pa abs); above the
   critical pressure it does not boil at all. */
export function tsatFU(P) {
  if (P >= P_CRIT) return Infinity;
  const p = Math.max(P, 1000) / MMHG;
  return ANT.B / (ANT.A - Math.log10(p)) - ANT.C + 273.15;
}
export function psatFU(T) {
  const c = T - 273.15;
  return Math.min(P_CRIT, Math.pow(10, ANT.A - ANT.B / (ANT.C + c)) * MMHG);
}

export class RegenJacket {
  /* spec: { segments: [{ id, AR, L, hc0 }], throatDia, liner: { t, k, rhoC },
     hg0, Pnom, mdotNom, cp, rho, Vjacket, Tcoke, cokeRate, qchf0, Tdamage } */
  constructor(spec, { ambient }) {
    this.spec = spec;
    this.Ta = ambient.T;
    const At = Math.PI / 4 * spec.throatDia ** 2;
    let Ssum = 0;
    this.seg = spec.segments.map(s => {
      const D = spec.throatDia * Math.sqrt(s.AR), S = Math.PI * D * s.L;
      Ssum += S;
      return { ...s, S, D, A: At * s.AR, Tw: ambient.T, Tc: ambient.T, Twg: ambient.T, Twc: ambient.T,
        coke: 0, block: 0, film: false, boil: 0, qg: 0, qc: 0, P: ambient.P, Tsat: tsatFU(ambient.P) };
    });
    for (const s of this.seg) {
      s.Cw = spec.liner.rhoC * s.S * spec.liner.t;                   // J/K, liner
      s.mc = spec.rho * spec.Vjacket * s.S / Ssum;                    // kg of fuel in its channels
    }
    this.Tin = ambient.T;                                             // coolant inlet (the tank)
    this.Tout = ambient.T;
    this.Q = 0;                                                       // W into the coolant
    this.Qg = 0;                                                      // W from the gas
    this.margin = Infinity;                                           // K, worst Tsat − T_wall,coolant
    this.chfMargin = Infinity;                                        // worst q_chf / q
    this.damage = 0;
    this.breached = false;
    this.peakTwg = ambient.T;
  }

  /* One step. g: { burning, P (Pa abs), Tgas, film, hfA }, mdot: kg/s of
     coolant, Pin / Pout: Pa abs at the jacket inlet and outlet, Tin: K. */
  step(dt, g, mdot, Pin, Pout, Tin) {
    const sp = this.spec, n = this.seg.length;
    this.Tin = Tin;
    const half = sp.liner.t / (2 * sp.liner.k);
    const flux = g.burning ? Math.pow(Math.max(g.P, 1e5) / sp.Pnom, 0.8) * (1 + 4 * g.hfA) : 0;
    const Taw = g.burning ? 0.88 * g.Tgas : g.Tgas;
    const m = Math.max(0, mdot), mr = m / sp.mdotNom;
    let Tup = Tin, Q = 0, Qg = 0, margin = Infinity, chfM = Infinity, peak = 0;
    // coolant enters at the nozzle end: walk the segments backwards
    for (let k = n - 1; k >= 0; k--) {
      const s = this.seg[k];
      s.P = Pin - (Pin - Pout) * (n - 1 - k + 0.5) / n;
      s.Tsat = tsatFU(s.P);
      // gas side (the film-cooling fault and screech raise it in the barrel)
      const hg = sp.hg0 * flux * Math.pow(s.AR, -0.9) * (k < 3 ? g.film : 1);
      const Ug = hg > 0 ? 1 / (1 / (hg * s.S) + half / s.S) : 0;
      // coolant side: forced convection, then the boiling regime
      let hc = s.hc0 * Math.pow(Math.max(mr * (1 - s.block), 0.02), 0.8) + 300;
      const sub = s.Tsat - s.Tc;
      if (Number.isFinite(s.Tsat) && s.Twc > s.Tsat) hc *= 1 + 1.5 * Math.min(1, (s.Twc - s.Tsat) / 15);
      const qchf = sp.qchf0 * Math.sqrt(Math.max(mr * (1 - s.block), 0.02)) * (1 + Math.max(0, Number.isFinite(sub) ? sub : 200) / 60);
      // a vapour film, once formed, holds until the wall falls back below
      // saturation — the boiling curve's hysteresis
      if (s.film) { hc *= 0.06; if (s.Twc < s.Tsat || !(s.qc > 0)) s.film = false; }
      else if (s.qc / s.S > qchf) s.film = true;
      if (s.boil > 0.5) hc *= 0.4;                                     // vapour in the channel
      const Uc = 1 / (1 / (hc * s.S) + half / s.S + s.coke / s.S);
      // liner, implicit against the gas and the (old) coolant temperature
      s.Tw = (s.Cw / dt * s.Tw + Ug * Taw + Uc * s.Tc) / (s.Cw / dt + Ug + Uc);
      s.qg = Ug * (Taw - s.Tw);
      // coolant, implicit, carried along by the flow
      const C = s.mc * sp.cp, F = m * sp.cp;
      s.Tc = (C / dt * s.Tc + F * Tup + Uc * s.Tw) / (C / dt + F + Uc);
      // bulk boiling: the latent heat holds it at saturation, and makes vapour
      if (s.Tc > s.Tsat) { s.boil = Math.min(1, s.boil + dt * 20); s.Tc = s.Tsat; } else s.boil = Math.max(0, s.boil - dt * 5);
      s.qc = Uc * (s.Tw - s.Tc);
      s.Twg = s.Tw + s.qg * half / s.S;
      s.Twc = s.Tc + s.qc / (hc * s.S);
      Tup = s.Tc;
      Q += s.qc; Qg += s.qg;
      if (Number.isFinite(s.Tsat)) margin = Math.min(margin, s.Tsat - s.Twc);
      if (s.qc > 1) chfM = Math.min(chfM, qchf * s.S / s.qc);
      // coking on the coolant-side wall: slow, permanent, faster the hotter
      if (s.Twc > sp.Tcoke - 40) s.coke += dt * sp.cokeRate * Math.min(60, Math.exp((s.Twc - sp.Tcoke) / 25));
      // the liner: overheated, it is damaged; damaged enough, it cracks
      if (s.Twg > sp.Tdamage) { this.damage += dt * (s.Twg - sp.Tdamage) / 150; if (this.damage > 1) this.breached = true; }
      peak = Math.max(peak, s.Twg);
    }
    this.Tout = Tup;
    this.Q = Q; this.Qg = Qg;
    this.margin = margin; this.chfMargin = chfM;
    if (peak > this.peakTwg) this.peakTwg = peak;
  }

  seg_(id) { return this.seg.find(s => s.id === id); }
}
