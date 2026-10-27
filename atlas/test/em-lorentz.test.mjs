// The DOM-free model behind the charged-particle simulation (sims/em-lorentz.js):
// the exact motion of a charge in a uniform B (and a crossed E) against the
// textbook results — r = mv/(|q|B), T = 2πm/(|q|B) at every speed, the helix
// pitch, the E×B drift, the velocity selector and the mass spectrometer — and
// against a Boris integration; Newton's second law with the Lorentz force;
// the speed held fixed because a magnetic force does no work.
//   node atlas/test/em-lorentz.test.mjs

import * as M from '../src/viz/model/em-lorentz.js';
import { validate, defaults } from '../src/viz/sims/em-lorentz.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const mag = (v) => Math.hypot(...v);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// ─── constants ──────────────────────────────────────────────────────────────
check('e is exact', M.E_CHARGE === 1.602176634e-19);
check('the proton is 1836.15 electron masses', near(M.M_P / M.M_E, 1836.15267, 1e-8));
check('a ¹²C⁺ ion is 12 u less one electron', near(M.particle({ q: 1, m: 12 }).m, 12 * M.U_AMU - M.M_E, 1e-15));

// ─── a proton in 0.50 T at 2.0×10⁶ m/s, across the field ───────────────────
{
  const p = M.particle('proton'), B = 0.5, v = 2e6;
  const cfg = { q: p.q, m: p.m, B, v0: [v, 0, 0] };
  const r = M.radius(p.m, v, p.q, B), T = M.period(p.m, p.q, B);
  check('r = mv/(qB) = 4.18 cm for the proton', near(r, (M.M_P * v) / (M.E_CHARGE * B), 1e-12) && near(r, 0.041767, 1e-4));
  check('T = 2πm/(qB) = 131 ns', near(T, (2 * Math.PI * M.M_P) / (M.E_CHARGE * B), 1e-12) && near(T, 1.3121e-7, 1e-3));
  const c = M.centre(cfg);
  let worstR = 0, worstV = 0, worstPerp = 0;
  for (let k = 0; k <= 400; k++) {
    const s = M.stateAt(cfg, (T * k) / 137.3);
    worstR = Math.max(worstR, Math.abs(Math.hypot(s.r[0] - c[0], s.r[1] - c[1]) - r) / r);
    worstV = Math.max(worstV, Math.abs(mag(s.v) - v) / v);
    worstPerp = Math.max(worstPerp, Math.abs(dot(M.force(cfg, s.v), s.v)) / (mag(M.force(cfg, s.v)) * v));
  }
  check('the path is a circle of radius r about the centre', worstR < 1e-12, `worst ${worstR}`);
  check('the speed never changes: a magnetic force does no work', worstV < 1e-12, `worst ${worstV}`);
  check('the force is perpendicular to v at every instant', worstPerp < 1e-12, `worst ${worstPerp}`);
  const back = M.stateAt(cfg, T);
  check('after one period the proton is back where it started, moving the same way', mag(back.r) < 1e-12 * r && near(back.v[0], v, 1e-12) && Math.abs(back.v[1]) < 1e-9 * v);
  // positive charge, B along +z (out of the page): moving +x, the force points −y — clockwise seen from +z
  const F0 = M.force(cfg, [v, 0, 0]);
  check('a positive charge in B out of the page circles clockwise', F0[1] < 0 && Math.abs(F0[0]) < 1e-30 && M.stateAt(cfg, T / 4).r[1] < 0);
  check('|F| = qvB', near(mag(F0), M.E_CHARGE * v * B, 1e-12));
  // the electron goes the other way round
  const e = M.particle('electron');
  check('an electron circles anticlockwise', M.stateAt({ q: e.q, m: e.m, B, v0: [v, 0, 0] }, M.period(e.m, e.q, B) / 4).r[1] > 0);
}

// ─── the period does not depend on the speed (the cyclotron's secret) ──────
{
  const p = M.particle('proton'), B = 1.2;
  const T1 = M.period(p.m, p.q, B);
  for (const v of [1e5, 3e6, 2e7]) {
    const cfg = { q: p.q, m: p.m, B, v0: [v, 0, 0] };
    const s = M.stateAt(cfg, T1);
    check(`at ${v} m/s one turn still takes T`, mag(s.r) < 1e-10 * M.radius(p.m, v, p.q, B));
  }
  check('f = qB/(2πm) is 18.3 MHz for a proton in 1.2 T', near(1 / T1, 18.29e6, 1e-3));
}

// ─── Newton's second law with the Lorentz force, numerically ───────────────
{
  const a = M.particle('alpha');
  const cfg = { q: a.q, m: a.m, B: -0.3, E: 4e4, r0: [0.01, -0.02, 0.005], v0: [3e5, -1e5, 2e5] };
  let worst = 0;
  for (const t of [0, 1e-8, 7.7e-8, 3.1e-7]) {
    const h = 1e-12, v1 = M.stateAt(cfg, t + h).v, v0 = M.stateAt(cfg, t - h).v, s = M.stateAt(cfg, t);
    const acc = v1.map((x, k) => (x - v0[k]) / (2 * h)), F = M.force(cfg, s.v);
    worst = Math.max(worst, mag(acc.map((x, k) => a.m * x - F[k])) / mag(F));
    const r1 = M.stateAt(cfg, t + h).r, r0 = M.stateAt(cfg, t - h).r;
    worst = Math.max(worst, mag(r1.map((x, k) => (x - r0[k]) / (2 * h) - s.v[k])) / mag(s.v));
  }
  check('m dv/dt = q(E + v × B) and dr/dt = v along the exact solution', worst < 1e-6, `worst ${worst}`);
}

// ─── the helix ──────────────────────────────────────────────────────────────
{
  const e = M.particle('electron'), B = 50e-6, v = 2e7, alpha = (30 * Math.PI) / 180;
  const vpar = v * Math.cos(alpha), vperp = v * Math.sin(alpha);
  const cfg = { q: e.q, m: e.m, B, v0: [vperp, 0, vpar] };
  const T = M.period(e.m, e.q, B), s = M.stateAt(cfg, T);
  check('one turn of the helix advances the pitch v∥T along B', near(s.r[2], M.pitch(e.m, vpar, e.q, B), 1e-12) && Math.hypot(s.r[0], s.r[1]) < 1e-9);
  check('an auroral electron at 30° to 50 μT: r = 1.14 m, f = 1.40 MHz', near(M.radius(e.m, vperp, e.q, B), 1.1385, 1e-3) && near(1 / T, 1.3996e6, 1e-3));
}

// ─── crossed E and B: the drift, the velocity selector ─────────────────────
{
  const p = M.particle('proton'), B = 0.2, E = 3e4;
  const T = M.period(p.m, p.q, B);
  const rest = { q: p.q, m: p.m, B, E, v0: [0, 0, 0] };
  const s = M.stateAt(rest, 3 * T);
  check('from rest in crossed fields the charge drifts at E/B along E×B', near(s.r[0] / (3 * T), E / B, 1e-9) && Math.abs(s.r[1]) < 1e-9 * s.r[0]);
  check('…and is momentarily at rest again after each turn (a cycloid)', mag(s.v) < 1e-6 * (E / B));
  const e = M.particle('electron'), se = M.stateAt({ q: e.q, m: e.m, B, E, v0: [0, 0, 0] }, 5 * M.period(e.m, e.q, B));
  check('electrons drift the same way as protons: the drift does not depend on the charge', se.r[0] > 0 && near(se.r[0] / (5 * M.period(e.m, e.q, B)), E / B, 1e-9));
  const sel = { q: p.q, m: p.m, B, E, v0: [E / B, 0, 0] };
  let worst = 0;
  for (let k = 1; k <= 20; k++) worst = Math.max(worst, Math.abs(M.stateAt(sel, (k * T) / 7).r[1]));
  check('at v = E/B the electric and magnetic forces cancel: a straight path', worst < 1e-15 && mag(M.force(sel, [E / B, 0, 0])) < 1e-30);
  const fast = M.stateAt({ ...sel, v0: [1.3 * E / B, 0, 0] }, T / 4), slow = M.stateAt({ ...sel, v0: [0.7 * E / B, 0, 0] }, T / 4);
  check('faster particles are bent one way, slower ones the other', fast.r[1] * slow.r[1] < 0);
}

// ─── the mass spectrometer ─────────────────────────────────────────────────
{
  const B = 0.25, V = 2000;
  const c12 = M.particle({ q: 1, m: 12 }), c13 = M.particle({ q: 1, m: 13.003355 });
  const v12 = M.speedFromVoltage(c12.q, c12.m, V), v13 = M.speedFromVoltage(c13.q, c13.m, V);
  const x12 = M.landing({ q: c12.q, m: c12.m, B, v0: [0, v12, 0] }).x, x13 = M.landing({ q: c13.q, m: c13.m, B, v0: [0, v13, 0] }).x;
  check('an ion lands a diameter 2r from the slit', near(Math.abs(x12), 2 * M.radius(c12.m, v12, c12.q, B), 1e-12));
  check('accelerated through the same V, landing distance ∝ √m', near(x13 / x12, Math.sqrt(c13.m / c12.m), 1e-12));
  const x13s = M.landing({ q: c13.q, m: c13.m, B, v0: [0, v12, 0] }).x;
  check('at the same speed (after a velocity selector), landing distance ∝ m', near(x13s / x12, c13.m / c12.m, 1e-12));
}

// ─── the closed form against a Boris integration ───────────────────────────
{
  const p = M.particle('proton');
  const cfg = { q: p.q, m: p.m, B: 0.7, E: -2e5, r0: [0, 0, 0], v0: [4e5, 2e5, 1e5] };
  const T = M.period(p.m, p.q, cfg.B), n = 20000, dt = (3 * T) / n;
  let r = cfg.r0, v = cfg.v0;
  for (let k = 0; k < n; k++) ({ r, v } = M.borisStep(cfg, r, v, dt));
  const ex = M.stateAt(cfg, 3 * T), L = M.radius(p.m, mag(cfg.v0), p.q, cfg.B);
  check('the Boris pusher reproduces the exact path over three turns', mag(r.map((x, k) => x - ex.r[k])) < 1e-4 * L, `${mag(r.map((x, k) => x - ex.r[k])) / L}`);
  let s0 = [0.1, 0, 0], u0 = [3e6, 0, 0];
  const pure = { q: p.q, m: p.m, B: 1 };
  for (let k = 0; k < 5000; k++) ({ r: s0, v: u0 } = M.borisStep(pure, s0, u0, 1e-10));
  check('the Boris rotation keeps the speed exactly in a pure magnetic field', near(mag(u0), 3e6, 1e-13));
}

// ─── no field: straight lines; E alone: a parabola ─────────────────────────
{
  const p = M.particle('proton');
  const s = M.stateAt({ q: p.q, m: p.m, B: 0, E: 1000, v0: [1e5, 0, 0] }, 1e-6);
  check('with B = 0 the charge accelerates along E like a projectile', near(s.r[1], 0.5 * (p.q * 1000 / p.m) * 1e-12, 1e-12) && near(s.r[0], 0.1, 1e-12));
}

// ─── the simulation's parameter check ──────────────────────────────────────
check('defaults are valid', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('an unknown species is caught', validate({ ...defaults, particles: [{ species: 'muon' }] }).length > 0);
check('an unknown view is caught', validate({ ...defaults, view: 'side' }).length > 0);
check('speeds above c/10 are refused (the model is non-relativistic)', validate({ ...defaults, v: 1e8 }).length > 0);
check('a slider outside its range is caught', validate({ ...defaults, sliders: [{ key: 'B', min: 0.1, max: 1, value: 2 }] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
