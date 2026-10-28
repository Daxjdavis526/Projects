// Helpers for the Numerical Methods lessons F9–F13 (ODE solvers, symplectic
// integration, PDE schemes, spectral differentiation, convergence testing):
// the routines whose numbers the lessons print, written in JavaScript's
// doubles — the same IEEE 754 binary64 arithmetic as Python's floats — and
// small builders for the `graph` simulation's pictures.

import { n12, lg } from './_num.js';
export { n12, lg };

// ── one-step methods on array states y (f(t, y) returns an array) ───────
const axpy = (y, h, k) => y.map((v, i) => v + h * k[i]);
/** Explicit Runge–Kutta step from a Butcher tableau { A, b, c }. */
export function rkStep(tab, f, t, y, h) {
  const k = [];
  for (let i = 0; i < tab.b.length; i++) {
    let yi = y;
    for (let j = 0; j < i; j++) if (tab.A[i][j]) yi = axpy(yi, h * tab.A[i][j], k[j]);
    k.push(f(t + tab.c[i] * h, yi));
  }
  return y.map((v, n) => v + h * tab.b.reduce((s, bi, i) => s + bi * k[i][n], 0));
}
export const TABLEAU = {
  euler: { A: [[]], b: [1], c: [0] },
  heun: { A: [[], [1]], b: [1 / 2, 1 / 2], c: [0, 1] },
  midpoint: { A: [[], [1 / 2]], b: [0, 1], c: [0, 1 / 2] },
  ralston: { A: [[], [2 / 3]], b: [1 / 4, 3 / 4], c: [0, 2 / 3] },
  rk3: { A: [[], [1 / 2], [-1, 2]], b: [1 / 6, 2 / 3, 1 / 6], c: [0, 1 / 2, 1] },
  rk4: { A: [[], [1 / 2], [0, 1 / 2], [0, 0, 1]], b: [1 / 6, 1 / 3, 1 / 3, 1 / 6], c: [0, 1 / 2, 1 / 2, 1] },
  rk38: { A: [[], [1 / 3], [-1 / 3, 1], [1, -1, 1]], b: [1 / 8, 3 / 8, 3 / 8, 1 / 8], c: [0, 1 / 3, 2 / 3, 1] },
};
/** n fixed steps of a tableau method from (t0, y0) to t0 + T; returns the final state. */
export function runRK(tab, f, t0, y0, T, n) {
  const h = T / n;
  let y = y0;
  for (let i = 0; i < n; i++) y = rkStep(tab, f, t0 + i * h, y, h);
  return y;
}
/** The same for a scalar equation y′ = f(t, y). */
export const runScalar = (tab, f, t0, y0, T, n) => runRK(tab, (t, y) => [f(t, y[0])], t0, [y0], T, n)[0];
/** Every point of a fixed-step scalar run: [[t, y], …]. */
export function pathScalar(tab, f, t0, y0, T, n) {
  const h = T / n, out = [[t0, y0]];
  let y = [y0];
  for (let i = 0; i < n; i++) { y = rkStep(tab, (t, u) => [f(t, u[0])], t0 + i * h, y, h); out.push([t0 + (i + 1) * h, y[0]]); }
  return out;
}

// ── embedded pairs and step-size control ────────────────────────────────
export const DP5 = {
  A: [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9], [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729], [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656], [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]],
  b: [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0],
  bh: [5179 / 57600, 0, 7571 / 16695, 393 / 640, -92097 / 339200, 187 / 2100, 1 / 40],
  c: [0, 1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1],
};
/**
 * Adaptive Dormand–Prince 5(4) with the standard controller: the error norm
 * is the RMS of (y₅ − y₄)/(atol + rtol·max|y|), a step is accepted when it is
 * ≤ 1, and h_new = h·min(5, max(0.2, 0.9·err^(−1/5))). Local extrapolation:
 * the 5th-order result is kept. FSAL is not exploited in the count: nfev
 * counts 6 new evaluations per attempted step (the 7th is the next step's first).
 */
export function dopri(f, t0, y0, T, { rtol = 1e-6, atol = 1e-9, h0 = null, hmax = Infinity } = {}) {
  let t = t0, y = y0, h = h0 ?? T / 100;
  const ts = [t], ys = [y], hs = [], rej = [];
  let k1 = f(t, y), nfev = 1;
  while (t < t0 + T - 1e-14 * Math.abs(T)) {
    h = Math.min(h, hmax, t0 + T - t);
    const k = [k1];
    for (let i = 1; i < 7; i++) {
      let yi = y;
      for (let j = 0; j < i; j++) if (DP5.A[i][j]) yi = axpy(yi, h * DP5.A[i][j], k[j]);
      k.push(f(t + DP5.c[i] * h, yi));
    }
    nfev += 6;
    const y5 = y.map((v, n) => v + h * DP5.b.reduce((s, bi, i) => s + bi * k[i][n], 0));
    const y4 = y.map((v, n) => v + h * DP5.bh.reduce((s, bi, i) => s + bi * k[i][n], 0));
    const err = Math.sqrt(y5.reduce((s, v, n) => s + ((v - y4[n]) / (atol + rtol * Math.max(Math.abs(v), Math.abs(y[n])))) ** 2, 0) / y.length);
    const fac = Math.min(5, Math.max(0.2, 0.9 * Math.max(err, 1e-300) ** -0.2));
    if (err <= 1) { t += h; y = y5; k1 = k[6]; ts.push(t); ys.push(y); hs.push(h); }
    else rej.push([t, h]);
    h *= err <= 1 ? fac : Math.min(1, fac);
  }
  return { ts, ys, hs, rejected: rej, nfev };
}

// ── implicit and symplectic steppers ────────────────────────────────────
/** Velocity Verlet (kick–drift–kick) for x″ = a(x), x and v arrays. */
export function verlet(a, x, v, h) {
  const a0 = a(x), vh = v.map((q, i) => q + (h / 2) * a0[i]);
  const x1 = x.map((q, i) => q + h * vh[i]), a1 = a(x1);
  return [x1, vh.map((q, i) => q + (h / 2) * a1[i])];
}
/** Symplectic Euler: kick then drift. */
export function symEuler(a, x, v, h) {
  const a0 = a(x), v1 = v.map((q, i) => q + h * a0[i]);
  return [x.map((q, i) => q + h * v1[i]), v1];
}
/** Explicit Euler on x′ = v, v′ = a(x). */
export function eulerXV(a, x, v, h) {
  const a0 = a(x);
  return [x.map((q, i) => q + h * v[i]), v.map((q, i) => q + h * a0[i])];
}

// ── Chebyshev spectral differentiation (Trefethen, Spectral Methods in MATLAB, cheb.m) ──
/** Chebyshev points xⱼ = cos(jπ/N), j = 0 … N (from +1 down to −1), and the differentiation matrix D. */
export function cheb(N) {
  if (N === 0) return { x: [1], D: [[0]] };
  const x = Array.from({ length: N + 1 }, (_, j) => Math.cos((Math.PI * j) / N));
  const c = x.map((_, j) => (j === 0 || j === N ? 2 : 1) * (j % 2 ? -1 : 1));
  const D = x.map((xi, i) => x.map((xj, j) => (i === j ? 0 : (c[i] / c[j]) / (xi - xj))));
  // the diagonal by the negative-sum trick (rows of D annihilate constants)
  D.forEach((row, i) => { row[i] = -row.reduce((s, v, j) => (j === i ? s : s + v), 0); });
  return { x, D };
}
export const matvec = (A, v) => A.map((r) => r.reduce((s, a, j) => s + a * v[j], 0));

// ── extrapolation ───────────────────────────────────────────────────────
/** Richardson: A(h), A(h/r) of order p → the extrapolated value. */
export const richardson = (Ah, Ahr, p, r = 2) => (r ** p * Ahr - Ah) / (r ** p - 1);
/** Composite trapezoid with n panels. */
export function trapz(f, a, b, n) {
  const h = (b - a) / n;
  let s = (f(a) + f(b)) / 2;
  for (let k = 1; k < n; k++) s += f(a + k * h);
  return h * s;
}
/** Romberg table R[i][j]: R[i][0] = trapezoid with 2^i panels, each column one more Richardson step. */
export function romberg(f, a, b, levels) {
  const R = [];
  for (let i = 0; i < levels; i++) {
    R.push([trapz(f, a, b, 2 ** i)]);
    for (let j = 1; j <= i; j++) R[i].push(R[i][j - 1] + (R[i][j - 1] - R[i - 1][j - 1]) / (4 ** j - 1));
  }
  return R;
}

// ── pictures ────────────────────────────────────────────────────────────
/** Graph points from [[x, y], …] in log–log coordinates. */
export const loglog = (pts, o = {}) => pts.filter(([x, y]) => x > 0 && Math.abs(y) > 0).map(([x, y]) => ({ x: n12(lg(x)), y: n12(lg(Math.abs(y))), r: 4, color: 'accent', ...o }));
/** A guide line of slope p through (x0, y0) in log–log coordinates, over [xa, xb] (log₁₀ values). */
export const slopeGuide = (p, lx0, ly0, xa, xb, o = {}) => ({ fn: `${n12(ly0)} + ${p}*(x - (${n12(lx0)}))`, color: 'ink3', width: 1.3, dash: true, domain: [xa, xb], ...o });
/** Superscript digits for a plain-text canvas label: sup(-6) → '⁻⁶'. */
export const sup = (n) => String(n).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
/** A number as plain text with ×10ⁿ for canvas labels. */
export function plainSci(x, d = 2) {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -2 && e <= 3) return String(+x.toPrecision(d));
  const m = +(x / 10 ** e).toPrecision(d);
  return `${m === 1 ? '' : m + '×'}10${sup(e)}`;
}
