// Helpers for the Numerical Methods lessons (st-f, modules F1–F4): pictures
// for the `graph` simulation (log–log error plots, iteration diagrams) and the
// numerical routines whose numbers the lessons print, written in JavaScript's
// doubles — the same IEEE 754 binary64 arithmetic as Python's floats.

import { seg, polyline } from '../prog/_numkit.js';
export { seg, polyline };

export const U = 2 ** -53;              // unit roundoff of float64
export const EPS = 2 ** -52;            // machine epsilon of float64
export const U32 = 2 ** -24, EPS32 = 2 ** -23;
export const lg = Math.log10;

/** A number spliced into a graph expression: no "-0", no 17-digit tails. */
export const n12 = (v) => String(+(+v).toPrecision(12));

/** Points (x, y) as graph points in log–log coordinates. */
export const logPts = (pts, o = {}) => pts.filter(([x, y]) => x > 0 && y > 0).map(([x, y]) => ({ x: n12(lg(x)), y: n12(lg(y)), r: 3.5, color: 'accent', ...o }));

/** The gap from |x| to the next larger float64 (Python's math.ulp). */
export function ulp(x) {
  const d = new DataView(new ArrayBuffer(8));
  d.setFloat64(0, Math.abs(x));
  const e = (d.getUint16(0) >> 4) & 0x7ff;
  return e === 0 ? 2 ** -1074 : 2 ** (e - 1075);
}

// ── root finders, recording every iterate ──────────────────────────────
export function bisection(f, a, b, n) {
  const out = [];
  let fa = f(a);
  for (let k = 0; k < n; k++) {
    const m = a + (b - a) / 2, fm = f(m);
    out.push({ a, b, m });
    if (fm === 0) { a = b = m; break; }
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm; } else b = m;
  }
  return out;
}
export function newton(f, df, x0, n) {
  const xs = [x0];
  for (let k = 0; k < n; k++) { const x = xs[xs.length - 1]; xs.push(x - f(x) / df(x)); }
  return xs;
}
export function secant(f, x0, x1, n) {
  const xs = [x0, x1];
  for (let k = 0; k < n; k++) {
    const a = xs[xs.length - 2], b = xs[xs.length - 1], fa = f(a), fb = f(b);
    if (fb === fa) break;
    xs.push(b - (fb * (b - a)) / (fb - fa));
  }
  return xs;
}
/** Observed orders p ≈ ln(e₍ₖ₊₁₎/eₖ)/ln(eₖ/e₍ₖ₋₁₎) from a list of errors. */
export const orders = (e) => e.slice(2).map((_, k) => Math.log(e[k + 2] / e[k + 1]) / Math.log(e[k + 1] / e[k]));

// ── interpolation ──────────────────────────────────────────────────────
export const equispaced = (n, a = -1, b = 1) => Array.from({ length: n + 1 }, (_, k) => a + ((b - a) * k) / n);
/** Chebyshev points of the first kind: the n + 1 zeros of T₍ₙ₊₁₎, mapped to [a, b], in increasing order. */
export const chebyshev = (n, a = -1, b = 1) => Array.from({ length: n + 1 }, (_, k) => (a + b) / 2 - ((b - a) / 2) * Math.cos(((2 * k + 1) * Math.PI) / (2 * n + 2)));
/** Lagrange interpolation through (xs, ys), evaluated at x. */
export function lagrange(xs, ys, x) {
  let s = 0;
  for (let i = 0; i < xs.length; i++) {
    let L = 1;
    for (let j = 0; j < xs.length; j++) if (j !== i) L *= (x - xs[j]) / (xs[i] - xs[j]);
    s += ys[i] * L;
  }
  return s;
}
/** Barycentric weights wᵢ = 1/∏(xᵢ − xⱼ). */
export const baryWeights = (xs) => xs.map((xi, i) => 1 / xs.reduce((p, xj, j) => (j === i ? p : p * (xi - xj)), 1));
/**
 * The interpolant through (xs, f(xs)) as a graph expression of x, in the
 * second barycentric form Σ wᵢyᵢ/(x − xᵢ) ÷ Σ wᵢ/(x − xᵢ). (It is 0/0 at the
 * nodes themselves; the graph leaves out that one sample.)
 */
export function baryExpr(xs, ys) {
  const w = baryWeights(xs);
  const sc = Math.max(...w.map(Math.abs));
  const term = (c, xi) => `${n12(c)}/(x - (${n12(xi)}))`;
  const num = xs.map((xi, i) => term((w[i] / sc) * ys[i], xi)).join(' + ');
  const den = xs.map((xi, i) => term(w[i] / sc, xi)).join(' + ');
  return `(${num})/(${den})`;
}
/** max |f − p| over a fine grid of [a, b]. */
export function maxErr(f, p, a = -1, b = 1, m = 4001) {
  let e = 0;
  for (let k = 0; k <= m; k++) { const x = a + ((b - a) * k) / m; e = Math.max(e, Math.abs(f(x) - p(x))); }
  return e;
}
/** The nodal polynomial ω(x) = ∏(x − xᵢ). */
export const omega = (xs) => (x) => xs.reduce((p, xi) => p * (x - xi), 1);
/** The same as a graph expression. */
export const omegaExpr = (xs) => xs.map((xi) => `(x - (${n12(xi)}))`).join('*');

/** Natural cubic spline through (xs, ys) (xs increasing): returns s(x). */
export function naturalSpline(xs, ys) {
  const n = xs.length - 1, h = xs.slice(1).map((x, i) => x - xs[i]);
  // solve for the second derivatives M₁ … M₍ₙ₋₁₎ (M₀ = Mₙ = 0): tridiagonal
  const a = [], b = [], c = [], d = [];
  for (let i = 1; i < n; i++) { a.push(h[i - 1]); b.push(2 * (h[i - 1] + h[i])); c.push(h[i]); d.push(6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1])); }
  const m = b.length;
  for (let i = 1; i < m; i++) { const w = a[i] / b[i - 1]; b[i] -= w * c[i - 1]; d[i] -= w * d[i - 1]; }
  const Mi = new Array(m).fill(0);
  for (let i = m - 1; i >= 0; i--) Mi[i] = (d[i] - (i < m - 1 ? c[i] * Mi[i + 1] : 0)) / b[i];
  const M = [0, ...Mi, 0];
  return (x) => {
    let i = Math.min(n - 1, Math.max(0, xs.findIndex((xx, k) => k < n && x <= xs[k + 1])));
    if (i < 0) i = n - 1;
    const t0 = xs[i + 1] - x, t1 = x - xs[i], hi = h[i];
    return (M[i] * t0 ** 3 + M[i + 1] * t1 ** 3) / (6 * hi) + (ys[i] / hi - (M[i] * hi) / 6) * t0 + (ys[i + 1] / hi - (M[i + 1] * hi) / 6) * t1;
  };
}

/** A number for prose in TeX: m × 10ⁿ to `d` significant figures. */
export function sci(x, d = 3) {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -3 && e <= 4) return String(+x.toPrecision(d));
  let m = +(x / 10 ** e).toPrecision(d), ee = e;
  if (Math.abs(m) >= 10) { m /= 10; ee++; }
  return `${m === 1 ? '' : `${m}\\times `}10^{${ee}}`;
}
