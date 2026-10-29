// Shared pieces for the lab course's fitting, calibration, noise and data-
// acquisition lessons (A5–A9): seeded synthetic data, the closed-form
// least-squares line with its uncertainties and covariance, and static graph
// pictures of data with error bars, residuals and error ellipses. Not a
// lesson: the leading underscore keeps it out of the registry.

import { makeRng } from '../../src/core/rng.js';
import * as B from '../../src/viz/model/lab-bench.js';
import { sf, pmTeX, pmTxt } from '../phys2210/_lab.js';

export { B, sf, pmTeX, pmTxt };
const t = String.raw;

/** A number short enough to sit inside a graph expression (no e-notation for ordinary sizes). */
export const r6 = (x) => +(+x).toPrecision(6);

/** A seeded standard-normal source. */
export function normals(seed) {
  const rng = makeRng(seed);
  return () => B.gaussian(rng);
}

/**
 * The straight line y = a + b x by least squares, in closed form.
 *   sy: one σ per point (weighted fit, σ taken as known), a single number
 *       (every point the same known σ), or null (unweighted: σ estimated from
 *       the residuals with N − 2 degrees of freedom).
 * Returns the line, its standard uncertainties and covariance, χ² (weighted)
 * or the residual scatter s (unweighted), and the sums the formulas use.
 */
export function linfit(x, y, sy = null) {
  const n = x.length;
  const known = sy !== null && sy !== undefined;
  const sig = known ? (Array.isArray(sy) ? sy : x.map(() => sy)) : x.map(() => 1);
  const w = sig.map((s) => 1 / (s * s));
  let S = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;
  for (let i = 0; i < n; i++) { S += w[i]; Sx += w[i] * x[i]; Sy += w[i] * y[i]; Sxx += w[i] * x[i] * x[i]; Sxy += w[i] * x[i] * y[i]; }
  const D = S * Sxx - Sx * Sx;
  const b = (S * Sxy - Sx * Sy) / D, a = (Sxx * Sy - Sx * Sxy) / D;
  const res = x.map((xi, i) => y[i] - a - b * xi);
  const chi2 = res.reduce((s, r, i) => s + w[i] * r * r, 0);
  const dof = n - 2;
  const s2 = known ? 1 : chi2 / dof;          // unweighted: σ² estimated from the scatter
  const xbar = Sx / S, ybar = Sy / S;
  const Sxxc = x.reduce((s, xi, i) => s + w[i] * (xi - xbar) ** 2, 0);
  return {
    a, b, n, dof, res, chi2, chi2r: chi2 / dof, xbar, ybar, S, Sx, Sy, Sxx, Sxy, D, Sxxc,
    s: Math.sqrt(s2), sa: Math.sqrt((Sxx / D) * s2), sb: Math.sqrt((S / D) * s2), cov: (-Sx / D) * s2,
    rho: -Sx / Math.sqrt(S * Sxx),
  };
}

/** A line segment as a graph parametric curve. */
const n6 = (v) => String(r6(v));
export const seg = (x0, y0, x1, y1, o = {}) => ({ param: [`${n6(x0)} + (${n6(x1 - x0)})*t`, `${n6(y0)} + (${n6(y1 - y0)})*t`], t: [0, 1], width: 2, ...o });
/** A vertical error bar with caps (three segments). */
export const errbar = (x, y, s, cap, o = {}) => [seg(x, y - s, x, y + s, { width: 1.4, ...o }), seg(x - cap, y + s, x + cap, y + s, { width: 1.4, ...o }), seg(x - cap, y - s, x + cap, y - s, { width: 1.4, ...o })];

/** Round a window edge outward to a tidy number. */
const tidy = (v) => r6(v);

/**
 * A static picture of data with ±1σ error bars, an optional fitted line (or
 * any curve) and extra graph pieces.
 *   xs, ys, sy (number, list or 0 for none), fit: { a, b } or fn: 'expr'
 */
export function dataGraph({ xs, ys, sy = 0, fit = null, fn = null, x = null, y = null, xlabel = 'x', ylabel = 'y', color = 'accent', lineColor = 'gold', curves = [], points = [], legend = null, legendAt, hlines, vlines, alt, domain = null, aspect = 'wide', extra = {} }) {
  const sig = Array.isArray(sy) ? sy : xs.map(() => sy || 0);
  const xlo = Math.min(...xs), xhi = Math.max(...xs), dx = xhi - xlo || 1;
  const ylo = Math.min(...ys.map((v, i) => v - sig[i])), yhi = Math.max(...ys.map((v, i) => v + sig[i])), dy = yhi - ylo || 1;
  const X = x || [tidy(xlo - 0.08 * dx), tidy(xhi + 0.08 * dx)];
  const Y = y || [tidy(ylo - 0.12 * dy), tidy(yhi + 0.12 * dy)];
  const cap = 0.012 * (X[1] - X[0]);
  const bars = xs.flatMap((xi, i) => (sig[i] > 0 ? errbar(xi, ys[i], sig[i], cap, { color }) : []));
  const line = fit ? [{ fn: `${n6(fit.a)} + (${n6(fit.b)})*x`, color: lineColor, width: 2, ...(domain ? { domain } : {}) }] : fn ? [{ fn, color: lineColor, width: 2, ...(domain ? { domain } : {}) }] : [];
  return {
    aspect, x: X, y: Y, xlabel, ylabel, axesAt: 'edge',
    curves: [...line, ...bars, ...curves],
    points: [...xs.map((xi, i) => ({ x: r6(xi), y: r6(ys[i]), r: 3.5, color })), ...points],
    ...(legend ? { legend, legendAt: legendAt || 'tl' } : {}),
    ...(hlines ? { hlines } : {}), ...(vlines ? { vlines } : {}),
    ...(alt ? { alt } : {}), ...extra,
  };
}

/** Residuals (data − fit) with their error bars about a zero line. */
export function resGraph({ xs, res, sy = 0, xlabel = 'x', ylabel = 'residual', x = null, y = null, color = 'accent', connect = false, alt }) {
  const sig = Array.isArray(sy) ? sy : xs.map(() => sy || 0);
  const m = Math.max(...res.map((r, i) => Math.abs(r) + sig[i])) * 1.3 || 1;
  const xlo = Math.min(...xs), xhi = Math.max(...xs), dx = xhi - xlo || 1;
  const X = x || [tidy(xlo - 0.08 * dx), tidy(xhi + 0.08 * dx)];
  const cap = 0.012 * (X[1] - X[0]);
  const curves = [{ fn: '0', color: 'gold', width: 1.6 }, ...xs.flatMap((xi, i) => (sig[i] > 0 ? errbar(xi, res[i], sig[i], cap, { color }) : []))];
  if (connect) for (let i = 1; i < xs.length; i++) curves.push(seg(xs[i - 1], res[i - 1], xs[i], res[i], { color, width: 1, dash: [3, 3] }));
  return {
    aspect: 'wide', x: X, y: y || [tidy(-m), tidy(m)], xlabel, ylabel, axesAt: 'edge',
    curves, points: xs.map((xi, i) => ({ x: r6(xi), y: r6(res[i]), r: 3.5, color })),
    ...(alt ? { alt } : {}),
  };
}

/** The Δχ² = k² ellipse of two parameters (p1 on x, p2 on y) with standard uncertainties s1, s2 and correlation rho. */
export function ellipse(p1, p2, s1, s2, rho, k = 1, o = {}) {
  const c = Math.sqrt(Math.max(0, 1 - rho * rho));
  return { param: [`${n6(p1)} + ${n6(k * s1)}*cos(t)`, `${n6(p2)} + ${n6(k * s2)}*(${n6(rho)}*cos(t) + ${n6(c)}*sin(t))`], t: [0, '2*pi'], width: 2, ...o };
}

/** The closing note every simulated experiment carries. */
export const SIMNOTE = 'Simulated data: a browser cannot replace bench work.';

/** Readings joined for a prompt: “1.2, 3.4 and 5.6”. */
export const listOf = (xs, d) => {
  const s = xs.map((v) => v.toFixed(d));
  return `${s.slice(0, -1).join(', ')} and ${s[s.length - 1]}`;
};

/** A small TeX table: rows of cells, first row the header. */
export function table(rows) {
  const cols = rows[0].length;
  const body = rows.map((r, i) => r.join(' & ') + (i === 0 ? t` \\ \hline` : t` \\`)).join(' ');
  return t`$$\begin{array}{${'c'.repeat(cols).split('').join('|')}} ${body} \end{array}$$`;
}

// ─── the χ² distribution ──────────────────────────────────────────────────
/** ln Γ(z) for z > 0 (Lanczos, g = 7). */
export function lnGamma(z) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] / (z + i);
  const tt = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(tt) - tt + Math.log(x);
}
/** The upper regularized incomplete gamma function Q(a, x). */
export function gammaQ(a, x) {
  if (x <= 0) return 1;
  const gln = lnGamma(a);
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 500; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - gln);
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h;
}
/** P(χ² ≥ x) for ν degrees of freedom. */
export const chi2sf = (x, nu) => gammaQ(nu / 2, x / 2);
/** The χ² probability density as a graph expression of x, for ν given as a number or a slider key. */
export const chi2pdfExpr = (nu) => `x^(${nu}/2 - 1)*exp(-x/2)/(2^(${nu}/2)*gamma(${nu}/2))`;
