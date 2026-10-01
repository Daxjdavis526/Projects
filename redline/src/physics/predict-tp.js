/* Steady-state prediction for a turbopump test on TS-3. No DOM.

   Per line, at shaft speed n, the pump's head against the line:

       (P_tank − P_amb) + ρgH0·(a0·n² + a1·n·q) = ṁ²·(R_pump + R_suction + R_line + R_valve + R_throttle)

   which is a quadratic in ṁ. Then the shaft: the torque the two pumps,
   the bearings and the windage need at that speed, against what the
   turbine gives at a drive pressure:

       τ_t = ṁ_gas·r·(φ·c0·cos α − u)·(1 + ψ)·η_x,   ṁ_gas = CdA·P_in·Γ / √(R·T_in)

   In SPEED mode the speed is given and the drive pressure is found; in
   PRESSURE mode the drive pressure is given and the speed is found. The
   drive gas reaches the turbine colder than the bottle by the regulator's
   Joule–Thomson drop. Uses the drawing numbers (as TS-3 is built, they
   are what the stand is); faults are what makes a test differ from this. */

import { GASES, prepareGas } from './gas.js';
import { pvapOf } from './turbopump.js';

const G0 = 9.80665, TAU = 2 * Math.PI;

export function steadyTP(def, { tankOx, tankFu, thrOx, thrFu, rpm = null, Ptin = null, Pbank = null, fluids = null }) {
  const p = def.physics, TPs = p.turbopump, Pa = p.ambient.P, Ta = p.ambient.T;
  const gas = prepareGas(GASES[p.gas]);
  const wD = TPs.Nd * TAU / 60;
  const lines = { ox: p.lines.find(l => l.id === 'ox'), fu: p.lines.find(l => l.id === 'fu') };
  const tank = { ox: tankOx, fu: tankFu }, thr = { ox: thrOx, fu: thrFu };
  const R = (rho, a) => (a > 0 ? 1 / (2 * rho * a * a) : Infinity);

  const side = (s, n) => {
    const L = lines[s], ps = TPs.pumps[s], fl = fluids?.[s] || L.fluid, rho = fl.rho;
    const [a0, a1, a2] = ps.a || [1.15, -0.03, 0.12];
    const Q0 = ps.Q0, H0 = ps.H0;
    const A = rho * G0 * H0 * a0 * n * n, B = G0 * H0 * a1 * n / Q0;
    const Rq = G0 * H0 * a2 / (rho * Q0 * Q0);
    const Rt = Rq + R(rho, ps.CdAsuc) + R(rho, L.CdAline) + R(rho, L.valve.CdA) + R(rho, L.CdAinj * thr[s]);
    const head = tank[s] + A;
    const md = Number.isFinite(Rt) && head > 0 ? (B + Math.sqrt(B * B + 4 * Rt * head)) / (2 * Rt) : 0;
    const q = md / (rho * Q0);
    const P0 = ps.rhoD * G0 * H0 * Q0 / ps.eta, shut = ps.shut ?? 0.4;
    const tau = P0 / wD * (rho / ps.rhoD) * (shut * n * n + (1 - shut) * n * q);
    const Pin = tank[s] - md * md * R(rho, ps.CdAsuc);             // gauge
    const dP = A + B * md - Rq * md * md;
    const npsha = (Pin + Pa - pvapOf(fl)(Ta)) / (rho * G0);
    const x = q / Math.max(n, 0.05);
    const npshr = ps.npshr0 * n * n * (0.5 + 0.5 * x * x);
    return { mdot: md, q, tau, Pin, Pd: Pin + dP, dP, head: dP / (rho * G0), npsha, npshr, Pshaft: tau * n * wD, Phyd: dP * md / rho };
  };
  const B = TPs.bearings, T = TPs.turbine;
  const need = n => {
    const w = n * wD, o = side('ox', n), f = side('fu', n);
    return { o, f, tau: o.tau + f.tau + B.c0 + B.c1 * w + (T.kw ?? 0) * w * w };
  };
  const PbankA = (Pbank ?? 6894.757 * 2400) + Pa;
  const muJT = gas.muJT ?? 0;
  const turbine = (Pin, n) => {
    const Tin = Math.max(150, Ta - muJT * (PbankA - Pin));
    const md = p.elements.find(e => e.id === T.el).CdA * Pin * gas.fChoke / Math.sqrt(gas.R * Tin);
    const Pex = Pa * 1.05;
    const xx = Pex < Pin ? 1 - Math.pow(Pex / Pin, (gas.gamma - 1) / gas.gamma) : 0;
    const c0 = Math.sqrt(2 * gas.cp * Tin * xx);
    const u = n * wD * T.rm;
    const tau = md * T.rm * ((T.phi ?? 0.95) * c0 * Math.cos((T.alpha ?? 20) * Math.PI / 180) - u) * (1 + (T.psi ?? 0.85)) * (T.etaX ?? 0.8);
    const Pt = tau * n * wD;
    return { Tin, md, c0, tau, Pt, Texh: md > 0 ? Tin - Pt / (md * gas.cp) : Tin, eta: md > 0 && c0 > 0 ? Pt / (md * c0 * c0 / 2) : 0 };
  };
  let n, Pin;
  if (rpm != null) {
    n = rpm / TPs.Nd;
    const req = need(n).tau;
    let lo = Pa * 1.06, hi = Pa + 6894.757 * 2000;
    for (let i = 0; i < 80; i++) { const mid = 0.5 * (lo + hi); if (turbine(mid, n).tau < req) lo = mid; else hi = mid; }
    Pin = 0.5 * (lo + hi);
  } else {
    Pin = (Ptin ?? 0) + Pa;
    let lo = 0, hi = 2.0;
    if (turbine(Pin, 0).tau <= need(0).tau) n = 0;
    else {
      for (let i = 0; i < 80; i++) { const mid = 0.5 * (lo + hi); if (turbine(Pin, mid).tau > need(mid).tau) lo = mid; else hi = mid; }
      n = 0.5 * (lo + hi);
    }
  }
  const nd = need(n), tu = turbine(Pin, n);
  return {
    kind: 'pump', n, rpm: n * TPs.Nd,
    mdotOx: nd.o.mdot, mdotFu: nd.f.mdot,
    PinOx: nd.o.Pin, PinFu: nd.f.Pin, PdOx: nd.o.Pd, PdFu: nd.f.Pd, dPox: nd.o.dP, dPfu: nd.f.dP,
    headOx: nd.o.head, headFu: nd.f.head, npshaOx: nd.o.npsha, npshaFu: nd.f.npsha, npshrOx: nd.o.npshr, npshrFu: nd.f.npshr,
    PshaftOx: nd.o.Pshaft, PshaftFu: nd.f.Pshaft, PhydOx: nd.o.Phyd, PhydFu: nd.f.Phyd,
    Ptin: Pin - Pa, Ttin: tu.Tin, mdotGas: tu.md, Pturb: tu.Pt, Texh: tu.Texh, etaT: tu.eta, c0: tu.c0,
    uc0: tu.c0 > 0 ? n * wD * TPs.turbine.rm / tu.c0 : 0,
  };
}
