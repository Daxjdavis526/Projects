/* Pre-test prediction for a cold flow on TS-2.

   Steady state, per side: the tank pressure is spent on the feed line, the
   main valve and the injector, all as square-law restrictions in series,

       P_tank − P_c = ṁ² · Σ 1 / (2ρ·CdA²)

   using the DRAWING values for the injector. The real injector is not the
   drawing (no injector is), so this prediction is a few per cent off on
   purpose — closing that gap is what the cold flow is for. Chamber pressure
   in cold flow is ambient. */

export function predictBiprop(S) {
  const def = S.def, D = def.design, c = S.controller;
  const req = S.request || {};
  const rho = def.fluids[D.simulant].rho;
  const sideFor = (lineId, cdaInj, regId, reqP) => {
    const ln = def.physics.lines.find(l => l.id === lineId);
    const P = c.sp?.[regId] > 6894.757 * 5 ? c.sp[regId] : reqP ?? 0;
    const R = a => 1 / (2 * rho * a * a);
    const Rl = R(ln.CdAline), Rv = R(ln.valve.CdA), Ri = R(cdaInj);
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
