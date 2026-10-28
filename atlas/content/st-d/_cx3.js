// Helpers for the last lessons of Advanced Math D (D9–D11) and its boss:
// the closed "D" contour and the indented one, pictures of a real integrand
// with its area shaded, pole marks, and a few numbers the lessons share
// (black-hole quasinormal frequencies computed for this course with
// Leaver's continued fraction). Files whose names start with "_" are
// helpers, not lessons.

import { contour } from './_cx2.js';

const PI = Math.PI;
export const r4 = (x) => +(+x).toFixed(4);

/** The real segment [−R, R] closed by the upper (or lower) semicircle. */
export const D = (R, lower = false) => ({ kind: 'path', parts: [{ kind: 'segment', from: [-R, 0], to: [R, 0] }, { kind: 'arc', c: [0, 0], r: R, from: lower ? 0 : 0, to: lower ? -PI : PI }] });
/** The arc alone. */
export const arc = (R, lower = false) => ({ kind: 'arc', c: [0, 0], r: R, from: 0, to: lower ? -PI : PI });
/** [−R, −ε], the small upper semicircle round 0 (clockwise), [ε, R], and the big arc. */
export const indented = (R, eps) => ({ kind: 'path', parts: [
  { kind: 'segment', from: [-R, 0], to: [-eps, 0] }, { kind: 'arc', c: [0, 0], r: eps, from: PI, to: 0 },
  { kind: 'segment', from: [eps, 0], to: [R, 0] }, { kind: 'arc', c: [0, 0], r: R, from: 0, to: PI }] });

/** A pole mark for cx2-contour (labels are plain text). */
export const pole = (x, y, label = '') => ({ x: r4(x), y: r4(y), label, kind: 'pole' });
/** A label for b·i as plain text: "2i", "i", "0.5i", "−i". */
export const iPlain = (b) => (Math.abs(b) === 1 ? (b < 0 ? '−i' : 'i') : `${String(+b.toPrecision(3)).replace('-', '−')}i`);

/** A contour picture with no chain beside it. */
export const plane = (params, caption) => contour({ panel: 'none', ...params }, caption);

/**
 * A real integrand y = f(x) with the area under it shaded: { fn (Atlas syntax
 * in x), x, y, xlabel, ylabel, color, extra curves, points }.
 */
export function realPic({ fn, x, y, xlabel = 'x', ylabel = '', color = 'accent', shade = true, curves = [], points = [], vlines = [], hlines = [], caption, extra = {} }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel, ylabel, axesAt: 'edge',
      curves: [{ fn, color, width: 2.4 }, ...curves],
      shade: shade ? [{ fn, from: x[0], to: x[1], color, alpha: 0.18 }] : [],
      points, vlines, hlines, ...extra,
    },
    caption,
  };
}

// ── black-hole quasinormal modes (G = c = 1) ────────────────────────────────
// Leaver's continued fraction (1985), solved for this course to 30 digits:
// Schwarzschild ℓ = 2 (n = 0, 1) and ℓ = 3, 4 (n = 0); Kerr ℓ = m = 2, n = 0 at
// several spins χ = a/M. Berti, Cardoso & Will's fit agrees with every Kerr
// value here to within about 2% (1% for χ ≥ 0.3).
export const QNM = {
  s20: [0.37367168, -0.08896232],
  s21: [0.34671100, -0.27391488],
  s30: [0.59944329, -0.09270305],
  s40: [0.80917838, -0.09416396],
};
export const KERR = [
  [0, 0.3736717, -0.0889623], [0.3, 0.4195267, -0.0877293], [0.5, 0.4641230, -0.0856388], [0.6, 0.4940448, -0.0837652],
  [0.67, 0.5198558, -0.0818452], [0.7, 0.5326002, -0.0807929], [0.8, 0.5860170, -0.0756296], [0.9, 0.6716143, -0.0648692],
];
export const TSUN = 4.925491e-6;   // GM☉/c³, seconds
