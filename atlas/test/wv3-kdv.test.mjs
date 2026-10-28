// The model behind the wv3-kdv simulation: the KdV soliton and two-soliton
// solutions checked against the equation u_t + 6uu_x + u_xxx = 0 by finite
// differences, the speed–height law, the collision's phase shifts measured
// from the exact solution, the linear (dispersion-only) evolution against a
// single Fourier mode and its conservation laws, and the breaking time of
// the nonlinearity-only equation.
//   node atlas/test/wv3-kdv.test.mjs

import * as K from '../src/viz/model/wv3-kdv.js';
import { validate, defaults } from '../src/viz/sims/wv3-kdv.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

/** The KdV residual of u(x, t) by central differences. */
function residual(u, x, t, h = 1e-3) {
  const ut = (u(x, t + h) - u(x, t - h)) / (2 * h);
  const ux = (u(x + h, t) - u(x - h, t)) / (2 * h);
  const uxxx = (u(x + 2 * h, t) - 2 * u(x + h, t) + 2 * u(x - h, t) - u(x - 2 * h, t)) / (2 * h ** 3);
  return ut + 6 * u(x, t) * ux + uxxx;
}

// one soliton solves KdV, with speed c and height c/2
for (const c of [0.5, 1, 2, 4]) {
  let worst = 0;
  for (let x = -6; x <= 8; x += 0.37) worst = Math.max(worst, Math.abs(residual((y, s) => K.soliton(y, s, c, 0.3), x, 0.4)));
  check(`soliton c = ${c} solves KdV`, worst < 2e-4 * c ** 2.5, worst.toExponential(2));
  check(`soliton c = ${c}: height c/2`, close(K.soliton(0.3 + c * 0.4, 0.4, c, 0.3), c / 2, 1e-12));
  const half = K.soliton(K.fwhm(c) / 2, 0, c), peak = K.soliton(0, 0, c);
  check(`soliton c = ${c}: FWHM`, close(half, peak / 2, 1e-9));
}
check('speedOf: c = 2A', K.speedOf(1.5) === 3);

// two solitons solve KdV, before, during and after the collision
for (const [k1, k2] of [[2, 1], [1.6, 0.8], [1.3, 1.1]]) {
  let worst = 0;
  for (const t of [-3, 0, 0.7, 3]) for (let x = -12; x <= 12; x += 0.53) worst = Math.max(worst, Math.abs(residual((y, s) => K.twoSoliton(y, s, k1, k2, 0, 0), x, t)));
  check(`two-soliton k = ${k1}, ${k2} solves KdV`, worst < 3e-3, worst.toExponential(2));
}

// far apart, the two-soliton solution is two solitons; measure the shifts from it
{
  const k1 = 2, k2 = 1, [d1, d2] = K.phaseShifts(k1, k2);
  const peakNear = (t, guess) => { let best = guess, bu = -1; for (let x = guess - 3; x <= guess + 3; x += 1e-4) { const u = K.twoSoliton(x, t, k1, k2, 0, 0); if (u > bu) { bu = u; best = x; } } return [best, bu]; };
  const T = 12;
  const [xb, ub] = peakNear(-T, -k1 * k1 * T), [xa, ua] = peakNear(T, k1 * k1 * T);
  check('fast soliton: height k₁²/2 before and after', close(ub, k1 * k1 / 2, 1e-6) && close(ua, k1 * k1 / 2, 1e-6), `${ub} ${ua}`);
  check('fast soliton shifted forward by (2/k₁) ln((k₁+k₂)/(k₁−k₂))', close((xa - k1 * k1 * T) - (xb + k1 * k1 * T), d1, 1e-3), `${(xa - k1 * k1 * T) - (xb + k1 * k1 * T)} vs ${d1}`);
  const [sb] = peakNear(-T, -k2 * k2 * T), [sa] = peakNear(T, k2 * k2 * T);
  check('slow soliton shifted back by (2/k₂) ln(…)', close((sa - k2 * k2 * T) - (sb + k2 * k2 * T), d2, 1e-3), `${(sa - k2 * k2 * T) - (sb + k2 * k2 * T)} vs ${d2}`);
  check('shifts have the right signs', d1 > 0 && d2 < 0);
}

// FFT round trip
{
  const n = 256, re = Float64Array.from({ length: n }, (_, i) => Math.sin(i * 0.3) + 0.2 * Math.cos(i * 1.7)), im = new Float64Array(n), r0 = Float64Array.from(re);
  K.fft(re, im); K.fft(re, im, true);
  check('FFT round trip', r0.every((v, i) => Math.abs(v - re[i]) < 1e-12 && Math.abs(im[i]) < 1e-12));
}

// linear KdV: a Fourier mode cos(kx) becomes cos(kx + k³t)
{
  const n = 512, L = 40, dx = L / n, m = 7, k = (2 * Math.PI * m) / L, t = 0.9;
  const u0 = Array.from({ length: n }, (_, i) => Math.cos(k * i * dx));
  const u = K.linear(u0, dx, t);
  let worst = 0;
  for (let i = 0; i < n; i++) worst = Math.max(worst, Math.abs(u[i] - Math.cos(k * i * dx + k ** 3 * t)));
  check('linear: cos kx → cos(kx + k³t), so ω = −k³', worst < 1e-10, worst.toExponential(2));
  const g0 = Array.from({ length: n }, (_, i) => K.soliton(i * dx - 20, 0, 2));
  const g = K.linear(g0, dx, 2);
  const sum = (a) => a.reduce((s, v) => s + v, 0), sq = (a) => a.reduce((s, v) => s + v * v, 0);
  check('linear: ∫u dx conserved', close(sum(g), sum(g0), 1e-10));
  check('linear: ∫u² dx conserved', close(sq(g), sq(g0), 1e-10));
  check('linear: the hump spreads and its peak falls', Math.max(...g) < 0.8 * Math.max(...g0));
}

// nonlinearity alone breaks at t* = 1/(6 max|u0′|)
for (const c of [1, 2, 3]) {
  let m = 0;
  for (let x = -10; x <= 10; x += 1e-4) m = Math.max(m, Math.abs((K.soliton(x + 1e-6, 0, c) - K.soliton(x - 1e-6, 0, c)) / 2e-6));
  check(`breaking time for c = ${c}`, close(K.breakTime(c), 1 / (6 * m), 1e-6), `${K.breakTime(c)} vs ${1 / (6 * m)}`);
  const xi = Array.from({ length: 4001 }, (_, i) => -10 + i * 0.005);
  const before = K.fold((s) => K.soliton(s, 0, c), xi, 0.9 * K.breakTime(c)), after = K.fold((s) => K.soliton(s, 0, c), xi, 1.3 * K.breakTime(c));
  const monotone = (p) => p.every((q, i) => i === 0 || q[0] > p[i - 1][0]);
  check(`c = ${c}: single-valued before t*, folded after`, monotone(before) && !monotone(after));
}

// the simulation's validate
check('wv3-kdv defaults are valid', validate(defaults).length === 0, validate(defaults).join('; '));
check('wv3-kdv rejects an unknown mode', validate({ ...defaults, mode: 'burgers' }).length > 0);
check('wv3-kdv rejects A2 ≥ A1', validate({ ...defaults, A1: 1, A2: 1 }).length > 0);
check('wv3-kdv rejects a bad window', validate({ ...defaults, x: [5, -5] }).length > 0);

console.log(`wv3-kdv: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
