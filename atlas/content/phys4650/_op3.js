// Picture builders for PHYS 4650 O7–O11 (interference, diffraction, Fourier
// optics, coherence, lasers): line segments, beams and fringe graphs drawn
// with the graph sim. Files whose names start with "_" are helpers, not
// lessons.

import { sf } from './_op.js';

/** A straight segment from a to b as a parametric graph curve. */
export const seg = (a, b, color = 'ink2', extra = {}) => ({
  param: [`${sf(a[0], 5)} + t*(${sf(b[0] - a[0], 5)})`, `${sf(a[1], 5)} + t*(${sf(b[1] - a[1], 5)})`], t: [0, 1], color, width: 1.6, ...extra,
});

/** A circle (or an arc from t0 to t1, radians) of radius r about c. */
export const arc = (c, r, color = 'ink2', t0 = 0, t1 = 6.2832, extra = {}) => ({
  param: [`${sf(c[0], 5)} + ${sf(r, 5)}*cos(t)`, `${sf(c[1], 5)} + ${sf(r, 5)}*sin(t)`], t: [t0, t1], color, width: 1.6, ...extra,
});

/** A label with no dot, centred on its point. */
export const word = (x, y, label, color = 'ink2', extra = {}) => ({ x: sf(x, 5), y: sf(y, 5), r: 0, label, color, labelAlign: 'center', labelDx: 0, labelDy: 0, ...extra });

/** A plain picture: no axes, no grid, equal scales. */
export const pic = (x, y, extra = {}) => ({ x, y, equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', ...extra });

/**
 * Two-beam fringes across a screen: I(y) = I1 + I2 + 2V'√(I1 I2) cos(2π y/Λ + φ0), y in the units of Λ.
 * `mix` (0–1) scales the interference term (polarization or coherence).
 */
export const fringeCurve = (I1, I2, L, mix = 1, phi0 = 0) =>
  `${sf(I1, 5)} + ${sf(I2, 5)} + ${sf(2 * mix * Math.sqrt(I1 * I2), 5)}*cos(2*pi*x/${sf(L, 6)} + (${sf(phi0, 5)}))`;

/**
 * A sampled function as one graph expression of x: the piecewise-linear interpolant through (x0 + i·h, ys[i]),
 * written as a sum of hat functions (a few hundred samples at most).
 */
export const hatCurve = (x0, h, ys, digits = 4) =>
  ys.map((y, i) => `${sf(y, digits)}*max(0, 1 - abs(x - ${sf(x0 + i * h, 6)})/${sf(h, 6)})`).join(' + ');

/**
 * Normal-incidence reflectance of a stack of thin layers (characteristic matrices, Hecht §9.9).
 * layers: [{ n, d }] from the incident side, d in the units of lam; n0 incident medium, ns substrate.
 */
export function stackR(n0, layers, ns, lam) {
  // M = Π [[cos δ, i sin δ/n], [i n sin δ, cos δ]]; complex entries as [re, im]
  let m = [[[1, 0], [0, 0]], [[0, 0], [1, 0]]];
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  for (const { n, d } of layers) {
    const dl = (2 * Math.PI * n * d) / lam, c = Math.cos(dl), s = Math.sin(dl);
    const L = [[[c, 0], [0, s / n]], [[0, n * s], [c, 0]]];
    m = [0, 1].map((i) => [0, 1].map((j) => add(mul(m[i][0], L[0][j]), mul(m[i][1], L[1][j]))));
  }
  const B = add(m[0][0], [m[0][1][0] * ns, m[0][1][1] * ns]), Cc = add(m[1][0], [m[1][1][0] * ns, m[1][1][1] * ns]);
  const num = [n0 * B[0] - Cc[0], n0 * B[1] - Cc[1]], den = [n0 * B[0] + Cc[0], n0 * B[1] + Cc[1]];
  return (num[0] ** 2 + num[1] ** 2) / (den[0] ** 2 + den[1] ** 2);
}
