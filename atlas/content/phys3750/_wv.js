// Shared helpers for PHYS 3750 (Foundations of Wave Phenomena), W1–W5:
// number formatting for TeX and canvas labels, and the course's recurring
// pictures — a complex amplitude in the complex plane, the linear chain
// (sims/wv-chain.js) as a still, and plain curves.
import { tex } from '../../src/core/format.js';

/** A number as TeX with n significant figures; thousands grouped with {,} (inside math only). */
export function tn(x, n = 3) {
  const s = tex(x, n);
  if (/times/.test(s)) return s;
  const [ip, fp] = s.replace('-', '').split('.');
  const grouped = ip.length > 4 ? ip.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') : ip;
  return `${x < 0 ? '-' : ''}${grouped}${fp !== undefined ? '.' + fp : ''}`;
}

/** A plain-text number for canvas labels (no TeX). */
export const pn = (x, n = 3) => String(+(+x).toPrecision(n));

/** Pick k distinct values from a generator (for multiple choice that must stay distinct). */
export const distinct = (xs, tol = 1e-6) => xs.every((a, i) => xs.every((b, j) => i === j || Math.abs(a - b) > tol * Math.max(1, Math.abs(a))));

/**
 * The complex plane with a complex amplitude Ã = a + ib drawn as an arrow, its
 * circle |Ã|, and (optionally) its parts marked on the axes.
 *   o.parts: label the real and imaginary parts (strings, plain text), o.extra: more arrows,
 *   o.R: half-width of the view, o.name: the arrow's label, o.circle: draw |Ã|
 */
export function phasorPic(a, b, caption, o = {}) {
  const A = Math.hypot(a, b), R = o.R || 1.35 * Math.max(A, 1e-9);
  const points = [];
  const curves = [];
  if (o.circle !== false) curves.push({ param: [`${A}*cos(t)`, `${A}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1, dash: [3, 4] });
  if (o.parts) {
    curves.push({ param: [`${a}`, `${b}*t`], t: [0, 1], color: 'ink3', width: 1, dash: [4, 4] });
    curves.push({ param: [`${a}*t`, `${b}`], t: [0, 1], color: 'ink3', width: 1, dash: [4, 4] });
    points.push({ x: a, y: 0, color: 'gold', label: o.parts[0], labelDx: a < 0 ? -8 : 6, labelDy: b > 0 ? 14 : -12, labelAlign: a < 0 ? 'right' : 'left' });
    points.push({ x: 0, y: b, color: 'good', label: o.parts[1], labelDx: a < 0 ? 8 : -8, labelDy: 0, labelAlign: a < 0 ? 'left' : 'right' });
  }
  return {
    type: 'graph',
    params: {
      x: [-R, R], y: [-R, R], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im', xticks: o.ticks ?? 5, yticks: o.ticks ?? 5,
      curves: [...curves, ...(o.curves || [])],
      arrows: [{ from: [0, 0], to: [a, b], color: 'accent', width: 2.5, label: o.name ?? 'Ã', labelDx: 6, labelDy: -6 }, ...(o.extra || [])],
      points: [...points, ...(o.points || [])],
    },
    caption,
  };
}

/** The linear chain as a still picture (no controls, no numbers) unless params say otherwise. */
export function chainPic(params, caption) {
  return { type: 'wv-chain', params: { controls: [], play: false, readout: false, ...params }, caption };
}

/** A plain graph of curves y = f(x). */
export function curvesPic(curves, x, y, caption, more = {}) {
  return { type: 'graph', params: { x, y, aspect: 'wide', curves, ...more }, caption };
}
