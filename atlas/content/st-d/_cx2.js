// Helpers for the contour-integral lessons of Advanced Math D (D5–D8): the
// cx2-contour picture with quiet defaults, and contour integrals, residues
// and Laurent coefficients computed by the same model the picture uses
// (src/viz/model/cx2-contour.js), so a printed number, its answer key and
// the chain of arrows drawn above it share one implementation.
// Files whose names start with "_" are helpers, not lessons.

import * as C from '../../src/viz/model/cx2-contour.js';

export { C };
const TWOPI_I = [0, 2 * Math.PI];

/** A cx2-contour picture: no readout and a fixed contour unless asked. */
export const contour = (params, caption, more = {}) => ({ type: 'cx2-contour', params: { readout: false, drag: false, ...params }, caption, ...more });

/** ∮ (or ∫) f dz along a contour spec, f a complex expression of z with constants E. */
export function integral(src, spec, E = {}) {
  const g = C.compile(src, Object.keys(E));
  return C.integrate((z) => g(z, E), spec, 160);
}
/** (1/2πi)∮ f dz round a small circle about a: the residue (numerically). */
export const residue = (src, a, r = 0.05, E = {}) => C.div(integral(src, { kind: 'circle', c: a, r }, E), TWOPI_I);
/** The Laurent coefficient aₙ about c, read off a circle of radius r in the annulus. */
export const laurent = (src, n, c, r, E = {}) => C.div(integral(`(${src})*(z - (${c[0]}) - (${c[1]})*i)^(${-n - 1})`, { kind: 'circle', c, r }, E), TWOPI_I);
export const circle = (r, c = [0, 0], o = {}) => ({ kind: 'circle', c, r, ...o });
