// The DOM-free model behind the induction simulation (sims/em-faraday.js):
// in every set-up the emf is checked against −dΦ/dt taken numerically from
// the flux, and each set-up's own physics besides — the slide's ±Bhv and its
// braking force, the magnet's flux (point-dipole and long-needle limits, two
// opposite pulses when it falls through), the induced electric field's line
// integral round paths that are not circles, the rails' terminal speed and
// energy balance, and the ideal transformer's ratios.
//   node atlas/test/em-faraday.test.mjs

import * as M from '../src/viz/model/em-faraday.js';
import { validate, defaults } from '../src/viz/sims/em-faraday.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
/** −dΦ/dt by a central difference. */
const dPhi = (flux, t, h = 1e-6) => -(flux(t + h) - flux(t - h)) / (2 * h);
/** Trapezoid-rule integral of f over [a, b]. */
function integral(f, a, b, n = 20000) { let s = 0.5 * (f(a) + f(b)); for (let i = 1; i < n; i++) s += f(a + ((b - a) * i) / n); return (s * (b - a)) / n; }

// ─── slide ──────────────────────────────────────────────────────────────────
{
  const P = { Bz: -0.5, w: 0.04, h: 0.03, Lf: 0.1, v: 0.05, x0: -0.02, R: 0.5 };
  const T = M.slideDuration(P);
  check('slide: the overlap is 0 before, w inside, 0 after', M.overlap(-0.01, 0.04, 0.1) === 0 && near(M.overlap(0.07, 0.04, 0.1), 0.04, 1e-12) && M.overlap(0.15, 0.04, 0.1) === 0);
  check('slide: a loop wider than the region holds the whole region', near(M.overlap(0.12, 0.2, 0.1), 0.1, 1e-12));
  let worst = 0;
  for (let k = 1; k < 200; k++) {
    const t = (T * k) / 200, xr = P.x0 + P.v * t;
    if ([0, P.Lf, P.w, P.Lf + P.w].some((c) => Math.abs(xr - c) < 1e-4)) continue;   // skip the kinks
    worst = Math.max(worst, Math.abs(dPhi((u) => M.slide(P, u).flux, t) - M.slide(P, t).emf));
  }
  check('slide: the emf is −dΦ/dt, numerically, at every moment', worst < 1e-9, `worst ${worst}`);
  const enter = M.slide(P, (0.02 + 0.01) / P.v), inside = M.slide(P, (0.02 + 0.07) / P.v), leave = M.slide(P, (0.02 + 0.12) / P.v);
  check('slide: emf = +Bhv entering a field into the page (anticlockwise), 0 inside, −Bhv leaving', near(enter.emf, 0.5 * 0.03 * 0.05, 1e-12) && inside.emf === 0 && near(leave.emf, -0.5 * 0.03 * 0.05, 1e-12));
  check('slide: the magnetic force opposes the motion, entering and leaving', enter.Fx < 0 && leave.Fx < 0 && inside.Fx === 0);
  check('slide: the force times the speed is the power dissipated, I²R', near(-enter.Fx * P.v, enter.I * enter.I * P.R, 1e-12));
  check('slide: the force is B²h²v/R', near(-enter.Fx, (0.25 * 0.03 * 0.03 * 0.05) / 0.5, 1e-12));
  const area = integral((t) => M.slide(P, t).emf, 0, 0.06 / P.v);
  check('slide: ∫ε dt over the entry is −ΔΦ', near(area, -(-0.5 * 0.03 * 0.04), 1e-4));
  check('slide: out of the page reverses the emf', near(M.slide({ ...P, Bz: 0.5 }, (0.02 + 0.01) / P.v).emf, -enter.emf, 1e-12));
}

// ─── magnet ─────────────────────────────────────────────────────────────────
{
  const m = 1.5, a = 0.025;
  // the needle tends to the point dipole as it shrinks
  const pd = (u) => (M.MU0 * m * a * a) / (2 * (a * a + u * u) ** 1.5);
  check('magnet: a short needle’s flux tends to the point dipole’s μ₀ma²/(2(a²+z²)^{3/2})', [0, 0.01, 0.03, 0.1].every((u) => near(M.turnFlux(m, 1e-5, a, u), pd(u), 1e-6)));
  check('magnet: l = 0 is the point dipole exactly', near(M.turnFlux(m, 0, a, 0.02), pd(0.02), 1e-12));
  // a long needle threading the turn carries μ₀m/l = μ₀MA through it
  check('magnet: a long needle through the turn carries μ₀m/l', near(M.turnFlux(m, 10, a, 0), (M.MU0 * m) / 10, 1e-4));
  check('magnet: the flux is the same either side (even in u)', near(M.turnFlux(m, 0.05, a, 0.04), M.turnFlux(m, 0.05, a, -0.04), 1e-12));
  // the slope, analytic against numeric
  let ws = 0;
  for (const l of [0, 0.02, 0.05]) for (const u of [-0.08, -0.02, 0.003, 0.03, 0.1]) {
    const num = (M.turnFlux(m, l, a, u + 1e-7) - M.turnFlux(m, l, a, u - 1e-7)) / 2e-7;
    ws = Math.max(ws, Math.abs(num - M.turnFluxSlope(m, l, a, u)) / (Math.abs(num) + 1e-9));
  }
  check('magnet: d(flux)/du analytic matches numeric', ws < 1e-5, `worst rel ${ws}`);
  const base = { m: -1.5, l: 0.05, a, N: 200, Lc: 0.03, R: 20 };
  for (const motion of ['inout', 'const', 'drop']) {
    const P = { ...base, motion, z0: 0.12, zs: 0, T1: 0.4, T2: 1.2, v: -1 };
    const T = M.magnetDuration(P);
    let worst = 0, peak = 0;
    for (let k = 1; k < 300; k++) {
      const t = (T * k) / 300;
      if (motion === 'inout' && [P.T1, P.T2, P.T1 + P.T2].some((c) => Math.abs(t - c) < 1e-4)) continue;
      const e = M.magnet(P, t).emf; peak = Math.max(peak, Math.abs(e));
      worst = Math.max(worst, Math.abs(dPhi((u) => M.magnet(P, u).flux, t, 1e-7) - e));
    }
    check(`magnet (${motion}): the emf is −d(NΦ)/dt, numerically`, worst < 1e-4 * peak, `worst ${worst}, peak ${peak}`);
    check(`magnet (${motion}): ∫ε dt over the run is −ΔΦ (zero: the magnet ends as far away as it began)`, Math.abs(integral((t) => M.magnet(P, t).emf, 0, T, 40000)) < 1e-4 * peak * T);
  }
  // falling through: two pulses of opposite sign, the second taller and shorter
  {
    const P = { ...base, motion: 'drop', z0: 0.12 };
    const T = M.magnetDuration(P), ts = Array.from({ length: 4001 }, (_, i) => (T * i) / 4000), es = ts.map((t) => M.magnet(P, t).emf);
    const tc = Math.sqrt((2 * 0.12) / M.G);                                   // when the centre passes the coil
    const first = es.filter((_, i) => ts[i] < tc), second = es.filter((_, i) => ts[i] > tc);
    const p1 = first.reduce((b, e) => (Math.abs(e) > Math.abs(b) ? e : b), 0), p2 = second.reduce((b, e) => (Math.abs(e) > Math.abs(b) ? e : b), 0);
    check('magnet (drop): the pulses entering and leaving have opposite signs', Math.sign(p1) === -Math.sign(p2) && p1 !== 0);
    check('magnet (drop): the second pulse is taller — the magnet is moving faster', Math.abs(p2) > Math.abs(p1));
    const A1 = integral((t) => M.magnet(P, t).emf, 0, tc), A2 = integral((t) => M.magnet(P, t).emf, tc, T);
    check('magnet (drop): the two pulses have equal and opposite areas, ∓NΦ at the centre', near(A1, -A2, 1e-3) && near(A1, -(M.linkage(P, 0).L - M.linkage(P, 0.12).L), 1e-3));
    check('magnet (drop): it passes the coil at √(2gz₀)', near(Math.abs(M.magnetMotion(P, tc).vz), Math.sqrt(2 * M.G * 0.12), 1e-9));
  }
  // Lenz: a north pole approaching the coil (moving −z, N leading: m along −z) drives a current
  // whose own field points +z, out toward the approaching N — anticlockwise about +z: a positive emf
  {
    const P = { ...base, m: -1.5, motion: 'const', z0: 0.12, v: -1 };
    check('magnet: an approaching N pole induces anticlockwise (about +z) current — the coil’s N faces it', M.magnet(P, 0.05).emf > 0);
    check('magnet: a receding N pole induces the opposite current', M.magnet(P, 0.19).emf < 0);
    check('magnet: holding the magnet still induces nothing', M.magnet({ ...P, motion: 'inout', T1: 0.4, T2: 1.2, zs: 0 }, 0.8).emf === 0);
    check('magnet: twice the turns, twice the emf', near(M.magnet({ ...P, N: 400 }, 0.05).emf, 2 * M.magnet(P, 0.05).emf, 1e-9));
  }
}

// ─── ramp: the induced electric field ───────────────────────────────────────
{
  const P = { B0: -0.4, profile: 'trapezoid', tr: 1 }, R = 0.05;
  let worst = 0;
  for (let k = 1; k < 400; k++) {
    const t = (4 * k) / 400;
    if ([0.5, 1.5, 2.5, 3.5].some((c) => Math.abs(t - c) < 1e-4)) continue;
    worst = Math.max(worst, Math.abs((M.rampField(P, t + 1e-6).B - M.rampField(P, t - 1e-6).B) / 2e-6 - M.rampField(P, t).dB));
  }
  check('ramp: dB/dt is the derivative of B', worst < 1e-6, `worst ${worst}`);
  const S = { B0: 0.3, profile: 'sine', f: 0.5 };
  check('ramp (sine): dB/dt is the derivative of B', [0.1, 0.7, 1.3].every((t) => near((M.rampField(S, t + 1e-6).B - M.rampField(S, t - 1e-6).B) / 2e-6, M.rampField(S, t).dB, 1e-6)));
  // ∮E·dl round a circle, numerically, is −dΦ/dt — inside and outside the region
  const dB = -0.4;
  const loopIntegral = (path, n = 4000) => { let s = 0; for (let i = 0; i < n; i++) { const [x0, y0] = path(i / n), [x1, y1] = path((i + 1) / n), E = M.inducedEVec((x0 + x1) / 2, (y0 + y1) / 2, R, dB); s += E[0] * (x1 - x0) + E[1] * (y1 - y0); } return s; };
  for (const r of [0.02, 0.05, 0.09]) {
    const circ = loopIntegral((u) => [r * Math.cos(M.TAU * u), r * Math.sin(M.TAU * u)]);
    check(`ramp: ∮E·dl round a circle of radius ${r * 100} cm equals −dΦ/dt`, near(circ, M.ringEmf(r, R, dB), 1e-6) && near(circ, -Math.PI * Math.min(r, R) ** 2 * dB, 1e-6));
  }
  // round a square that is partly outside the field, off centre: −dΦ/dt with Φ = B × (the part of the square inside the circle)
  const sq = (cx, cy, s) => (u) => { const k = Math.floor(u * 4) % 4, f = u * 4 - Math.floor(u * 4), c = [[cx - s, cy - s], [cx + s, cy - s], [cx + s, cy + s], [cx - s, cy + s]], p = c[k], q = c[(k + 1) % 4]; return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]; };
  const inside = (cx, cy, s, n = 1200) => { let c = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = cx - s + (2 * s * (i + 0.5)) / n, y = cy - s + (2 * s * (j + 0.5)) / n; if (x * x + y * y < R * R) c++; } return (c / (n * n)) * 4 * s * s; };
  for (const [cx, cy, s] of [[0.03, 0.01, 0.035], [0.06, -0.02, 0.02], [0.1, 0.1, 0.02]]) {
    const lhs = loopIntegral(sq(cx, cy, s), 8000), rhs = -inside(cx, cy, s) * dB;
    check(`ramp: ∮E·dl round a square at (${cx * 100}, ${cy * 100}) cm is −dΦ/dt for the flux it encloses`, near(lhs, rhs, 3e-3, 1e-9), `${lhs} vs ${rhs}`);
  }
  check('ramp: E is there outside the field region, where B = 0', Math.abs(M.inducedE(0.08, R, dB)) > 0);
  check('ramp: E is greatest at the region’s edge, (R/2)|dB/dt|', near(Math.abs(M.inducedE(R, R, dB)), (R / 2) * 0.4, 1e-12) && Math.abs(M.inducedE(0.04, R, dB)) < Math.abs(M.inducedE(R, R, dB)) && Math.abs(M.inducedE(0.06, R, dB)) < Math.abs(M.inducedE(R, R, dB)));
  check('ramp: a field into the page growing (dBz/dt < 0) drives anticlockwise E (Lenz)', M.inducedE(0.03, R, -0.4) > 0);
}

// ─── rails ──────────────────────────────────────────────────────────────────
{
  const base = { Bz: -0.5, L: 0.2, R: 0.5, mass: 0.05, x0: 0.1 };
  for (const motion of ['push', 'coast', 'pull']) {
    const P = { ...base, motion, v: 0.5, F: 0.01 };
    let worst = 0, peak = 0;
    for (let k = 1; k < 100; k++) { const t = k * 0.05, e = M.rails(P, t).emf; peak = Math.max(peak, Math.abs(e)); worst = Math.max(worst, Math.abs(dPhi((u) => M.rails(P, u).flux, t) - e)); }
    check(`rails (${motion}): the emf is −dΦ/dt = BLv, numerically`, worst < 1e-8 * Math.max(1, peak) + 1e-10, `worst ${worst}`);
    let wv = 0;
    for (let k = 1; k < 100; k++) { const t = k * 0.05, v = (M.rails(P, t + 1e-6).x - M.rails(P, t - 1e-6).x) / 2e-6; wv = Math.max(wv, Math.abs(v - M.rails(P, t).vx)); }
    check(`rails (${motion}): the speed is dx/dt`, wv < 1e-6);
  }
  const push = M.rails({ ...base, motion: 'push', v: 0.5 }, 1);
  check('rails: emf BLv, current BLv/R, force B²L²v/R opposing the motion', near(push.emf, 0.5 * 0.2 * 0.5, 1e-12) && near(push.I, 0.1, 1e-12) && near(push.Fmag, -0.01, 1e-12));
  check('rails: the pushing force times v equals I²R', near(-push.Fmag * 0.5, push.P, 1e-12));
  const C = { ...base, motion: 'coast', v: 0.3 }, tau = (0.05 * 0.5) / (0.25 * 0.04);
  check('rails (coast): τ = mR/(B²L²) = 2.5 s', near(M.rails(C, 0).tau, tau, 1e-12) && near(tau, 2.5, 1e-12));
  check('rails (coast): it glides v₀τ in all', near(M.rails(C, 200).x - 0.1, 0.3 * tau, 1e-9));
  const heat = integral((t) => M.rails(C, t).P, 0, 60 * tau, 60000);
  check('rails (coast): all its kinetic energy ends as heat in the resistor', near(heat, 0.5 * 0.05 * 0.3 * 0.3, 1e-4));
  // Newton's second law for the pulled bar: m dv/dt = F + F_mag
  const Q = { ...base, motion: 'pull', F: 0.01 };
  let wn = 0;
  for (const t of [0.2, 1, 3, 7]) { const acc = (M.rails(Q, t + 1e-5).vx - M.rails(Q, t - 1e-5).vx) / 2e-5; wn = Math.max(wn, Math.abs(0.05 * acc - (0.01 + M.rails(Q, t).Fmag))); }
  check('rails (pull): m dv/dt = F − B²L²v/R at every moment', wn < 1e-8);
  check('rails (pull): terminal speed FR/(B²L²) = 0.5 m/s', near(M.rails(Q, 0).vt, 0.5, 1e-12) && near(M.rails(Q, 60).vx, 0.5, 1e-6));
  check('rails: reversing the field does not change the braking', near(M.rails({ ...base, Bz: 0.5, motion: 'push', v: 0.5 }, 1).Fmag, push.Fmag, 1e-12));
}

// ─── transformer ────────────────────────────────────────────────────────────
{
  const P = { Np: 400, Ns: 20, Vp: 230, f: 50, RL: 4 };
  let wp = 0, ws = 0;
  for (let k = 0; k < 100; k++) {
    const t = k * 0.0004, s = M.transformer(P, t), d = (M.transformer(P, t + 1e-8).flux - M.transformer(P, t - 1e-8).flux) / 2e-8;
    wp = Math.max(wp, Math.abs(P.Np * d - s.vp)); ws = Math.max(ws, Math.abs(P.Ns * d - s.vs));
  }
  check('transformer: vp = Np dΦ/dt and vs = Ns dΦ/dt, numerically', wp < 1e-3 && ws < 1e-4, `${wp}, ${ws}`);
  const r = M.transformerRms(P);
  check('transformer: Vs = (Ns/Np)Vp = 11.5 V', near(r.Vs, 11.5, 1e-12));
  check('transformer: Is = Vs/RL and Ip = (Ns/Np)Is', near(r.Is, 2.875, 1e-12) && near(r.Ip, 0.14375, 1e-12));
  check('transformer: the power in equals the power out', near(P.Vp * r.Ip, r.Vs * r.Is, 1e-12));
  check('transformer: peak flux Vp√2/(Np ω)', near(r.phiPeak, (230 * Math.SQRT2) / (400 * 2 * Math.PI * 50), 1e-12));
  const D = { ...P, source: 'dc', tau: 0.004 };
  check('transformer (DC): a pulse at switch-on, then nothing', near(M.transformer(D, 0).vs, 11.5, 1e-12) && Math.abs(M.transformer(D, 0.1).vs) < 1e-9);
  check('transformer (DC): ∫vs dt = Ns ΔΦ', near(integral((t) => M.transformer(D, t).vs, 0, 0.2, 40000), P.Ns * M.transformer(D, 0.2).flux, 1e-4));
}

// ─── the simulation's parameter checks ──────────────────────────────────────
{
  const ok = (p) => validate({ ...defaults, ...p }).length === 0;
  check('validate: every mode passes with its defaults', ['slide', 'magnet', 'ramp', 'rails', 'transformer'].every((mode) => ok({ mode })));
  check('validate: an unknown mode, graph or readout fails', !ok({ mode: 'spin' }) && !ok({ mode: 'slide', graphs: ['B'] }) && !ok({ mode: 'rails', readouts: ['Vs'] }));
  check('validate: a slider out of its range fails', !ok({ mode: 'slide', sliders: [{ key: 'B', min: 1, max: 2, value: 0.5 }] }));
  check('validate: built-in sliders pass', ok({ mode: 'slide', sliders: ['B', 'v', 'w', 'h', 'R', 't'] }) && ok({ mode: 'magnet', sliders: ['v', 'N', 'm', 'R', 't'] }) && ok({ mode: 'ramp', sliders: ['B0', 'tr', 'r', 'R', 't'] }) && ok({ mode: 'rails', sliders: ['B', 'v', 'L', 'R', 'mass', 'Fa', 't'] }) && ok({ mode: 'transformer', sliders: ['Np', 'Ns', 'Vp', 'f', 'RL', 't'] }));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
