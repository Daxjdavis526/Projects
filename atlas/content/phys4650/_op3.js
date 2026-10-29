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
