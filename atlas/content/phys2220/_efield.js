// Constants, number formats and picture builders for the PHYS 2220
// electrostatics lessons (modules E2–E4: fields, Gauss's law, potential).
// Not a lesson: the leading underscore keeps it out of the registry.
//
// Answers are computed with the same rounded constants the prompts give the
// learner (k = 8.988×10⁹ N·m²/C², e = 1.602×10⁻¹⁹ C, …), so a learner who
// uses them lands on the key, not 0.01% beside it.

import { fmt } from '../../src/core/format.js';

export const K = 8.988e9;            // N·m²/C²
export const EPS0 = 8.854e-12;       // C²/(N·m²)
export const QE = 1.602e-19;         // C
export const ME = 9.109e-31;         // kg
export const MP = 1.673e-27;         // kg
export const U = 1.661e-27;          // kg (atomic mass unit)
export const MXE = 131.3 * U;        // kg, a xenon ion
export const G0 = 9.81;              // m/s²

/** Plain text with n significant figures (prose, and labels drawn on a canvas). */
export const s3 = (x, n = 3) => fmt(x, n);

/** A number as TeX with n significant figures, with ×10ⁿ outside [10⁻³, 10⁴). */
export function tn(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const r = +x.toPrecision(n), a = Math.abs(r);
  if (a >= 1e4 || a < 1e-3) {
    const [m, e] = r.toExponential(n - 1).split('e');
    return `${m} \\times 10^{${parseInt(e, 10)}}`;
  }
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(a)));
  return r.toFixed(d);
}

/** Six significant figures, for numbers written into a visual's parameters. */
export const r6 = (v) => +(+v).toPrecision(6);

/**
 * A picture made with the em-field simulation, static by default (no dragging,
 * no readouts — a picture must not show its answer). `params` are passed on.
 */
export const field = (params, caption) => ({ type: 'em-field', params: { static: true, readouts: [], arrows: false, ...params }, caption });

/** The same, but live: the learner can drag what the params allow. */
export const fieldLive = (params, caption) => ({ type: 'em-field', params: { readouts: [], arrows: false, ...params }, caption });

/** A uniform field pointing at `deg` degrees (0 = right, 90 = up), of size E (N/C). */
export const uniformAt = (E, deg) => [r6(E * Math.cos((deg * Math.PI) / 180)), r6(E * Math.sin((deg * Math.PI) / 180))].map((v) => (Math.abs(v) < 1e-9 * E ? 0 : v));

/**
 * A uniformly charged ring (radius a, in the horizontal plane) and a point P on
 * its axis at height h, as a rotatable 3D scene: optionally two opposite
 * pieces dq with their fields dE at P (pair), and the total along the axis (sum).
 * Lengths are in picture units (the scene is about 3 units across).
 */
export function ringPic({ a = 1.8, h = 2.2, pair = true, sum = false, caption, label = 'P' } = {}) {
  const r = Math.hypot(a, h), s = 1.3 / 1;                   // dE drawn 1.3 units long
  const d1 = [0, (-a / r) * s, (h / r) * s], d2 = [0, (a / r) * s, (h / r) * s];
  const P = [0, 0, h];
  return {
    type: 'calc-vectors3d',
    params: {
      range: 3,
      curves: [{ param: [`${r6(a)}*cos(t)`, `${r6(a)}*sin(t)`, 0], t: [0, 6.2832], color: 'bad' }],
      points: [{ at: P, color: 'gold', label }, ...(pair ? [{ at: [0, r6(a), 0], color: 'bad', label: 'dq' }, { at: [0, r6(-a), 0], color: 'bad', label: "dq'" }] : [])],
      segments: pair ? [{ from: [0, r6(a), 0], to: P, color: 'ink3', dash: true }, { from: [0, r6(-a), 0], to: P, color: 'ink3', dash: true }] : [],
      vectors: [
        ...(pair ? [{ from: P, to: P.map((c, i) => r6(c + d1[i])), color: 'accent', label: 'd\\vec E' }, { from: P, to: P.map((c, i) => r6(c + d2[i])), color: 'accent', label: "d\\vec E'" }] : []),
        ...(sum ? [{ from: P, to: [0, 0, r6(h + 2 * d1[2])], color: 'gold', label: '\\vec E' }] : []),
      ],
    },
    caption,
  };
}
