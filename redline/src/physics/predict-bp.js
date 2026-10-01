/* Pre-test prediction for a cold flow on TS-2.

   Steady state, per side: the tank pressure is spent on the feed line, the
   main valve and the injector, all as square-law restrictions in series,

       P_tank − P_c = ṁ² · Σ 1 / (2ρ·CdA²)

   using the DRAWING values for the injector. The real injector is not the
   drawing (no injector is), so this prediction is a few per cent off on
   purpose — closing that gap is what the cold flow is for. Chamber pressure
   in cold flow is ambient. */

import { Gam, GAM_P } from './combustion.js';

/* A hot fire, steady state: both sides' flows and the chamber pressure are
   coupled — the chamber pressure the flows make is the back-pressure they
   flow against:

       ṁ_i = √((P_tank,i − Pc) / ΣR_i)            (each side, propellant ρ)
       Pc  = ṁ_total · η·c*(MR) / (Cd·At)

   solved by damped iteration. Drawing CdA values and the DESIGN c*
   efficiency unless told otherwise; the as-built engine is neither. */
export function predictHot(def, { Pox, Pfu, cdaOx, cdaFu, eta } = {}) {
  const D = def.design, ch = def.physics.chamber, Pa = def.physics.ambient.P;
  const At = Math.PI / 4 * ch.throatDia ** 2, Ae = Math.PI / 4 * ch.exitDia ** 2;
  const rOx = def.fluids[D.oxidiser].rho, rFu = def.fluids[D.fuel].rho;
  const lo = def.physics.lines.find(l => l.id === 'ox'), lf = def.physics.lines.find(l => l.id === 'fu');
  const R = (rho, a) => 1 / (2 * rho * a * a);
  const RO = R(rOx, lo.CdAline) + R(rOx, lo.valve.CdA) + R(rOx, cdaOx ?? D.CdAox);
  const RF = R(rFu, lf.CdAline) + R(rFu, lf.valve.CdA) + R(rFu, cdaFu ?? D.CdAfu) + (lf.jacket ? R(rFu, lf.jacket.CdA) : 0);
  const e = eta ?? D.etaCstar;
  let Pc = 0.6 * Math.min(Pox, Pfu), mo = 0, mf = 0, MR = 1.5;
  for (let i = 0; i < 200; i++) {
    mo = Math.sqrt(Math.max(0, Pox - Pc) / RO); mf = Math.sqrt(Math.max(0, Pfu - Pc) / RF);
    MR = mf > 0 ? mo / mf : 8;
    const PcNew = Math.max(0, (mo + mf) * e * ch.cstar(MR) / (ch.Cd * At) - Pa);
    Pc += 0.3 * (PcNew - Pc);
  }
  const Pabs = Pc + Pa, g = GAM_P;
  // ideal Cf for the drawing's expansion ratio at sea level
  const eps = Ae / At;
  let lo2 = 1.0001, hi = 10;
  const area = M => (1 / M) * Math.pow((2 / (g + 1)) * (1 + (g - 1) / 2 * M * M), (g + 1) / (2 * (g - 1)));
  for (let i = 0; i < 80; i++) { const m = 0.5 * (lo2 + hi); if (area(m) > eps) hi = m; else lo2 = m; }
  const Me = 0.5 * (lo2 + hi), pr = Math.pow(1 + (g - 1) / 2 * Me * Me, -g / (g - 1));
  const Cf = Gam(g) * Math.sqrt(2 * g / (g - 1) * (1 - Math.pow(pr, (g - 1) / g))) + (pr - Pa / Pabs) * eps;
  const F = ch.Cd * Cf * Pabs * At;
  const md = mo + mf;
  return { kind: 'hotfire', Pc, F, mdotOx: mo, mdotFu: mf, MR, Cf, Isp: md > 0 ? F / (md * 9.80665) : 0,
    cstar: e * ch.cstar(MR), dPox: mo * mo * R(rOx, cdaOx ?? D.CdAox), dPfu: mf * mf * R(rFu, cdaFu ?? D.CdAfu), Pox, Pfu };
}

export function predictBiprop(S) {
  const def = S.def, D = def.design, c = S.controller;
  if (c.loaded === 'propellants') {
    const req = S.request || {};
    const P = (id, r) => (c.sp?.[id] > 6894.757 * 5 ? c.sp[id] : r ?? 0);
    const Pox = P('PR-610', req.oxP), Pfu = P('PR-620', req.fuP);
    return Pox > 0 && Pfu > 0 ? predictHot(def, { Pox, Pfu }) : { kind: 'hotfire', Pc: 0, F: 0, mdotOx: 0, mdotFu: 0, MR: NaN, dPox: 0, dPfu: 0 };
  }
  const req = S.request || {};
  const rho = def.fluids[D.simulant].rho;
  const sideFor = (lineId, cdaInj, regId, reqP) => {
    const ln = def.physics.lines.find(l => l.id === lineId);
    const P = c.sp?.[regId] > 6894.757 * 5 ? c.sp[regId] : reqP ?? 0;
    const R = a => 1 / (2 * rho * a * a);
    const Rl = R(ln.CdAline) + (ln.jacket ? R(ln.jacket.CdA) : 0), Rv = R(ln.valve.CdA), Ri = R(cdaInj);
    const mdot = P > 0 ? Math.sqrt(P / (Rl + Rv + Ri)) : 0;
    return { P, mdot, dPinj: Ri * mdot * mdot, dPline: (Rl + Rv) * mdot * mdot };
  };
  const ox = sideFor('ox', D.CdAox, 'PR-610', req.oxP);
  const fu = sideFor('fu', D.CdAfu, 'PR-620', req.fuP);
  const plan = c.plan || {};
  const flowOx = plan.sides !== 'fuel', flowFu = plan.sides !== 'ox';
  const jet = (s, a) => s.mdot * 0.95 * Math.sqrt(2 * s.dPinj / rho) * 0.87;
  return {
    kind: 'coldflow', fluid: D.simulant, rho,
    Pox: ox.P, Pfu: fu.P,
    mdotOx: flowOx ? ox.mdot : 0, mdotFu: flowFu ? fu.mdot : 0,
    dPox: flowOx ? ox.dPinj : 0, dPfu: flowFu ? fu.dPinj : 0,
    dPlineOx: ox.dPline, dPlineFu: fu.dPline,
    MR: flowOx && flowFu && fu.mdot > 0 ? ox.mdot / fu.mdot : NaN,
    F: (flowOx ? jet(ox) : 0) + (flowFu ? jet(fu) : 0),
    Pc: 0,
  };
}
