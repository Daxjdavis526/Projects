// Shared helpers for the PHYS 3550 (Intermediate Classical Mechanics)
// lessons: number formatting for TeX and canvas labels, and picture builders
// that return ordinary visual specs (graph, cm-polar …), so the content test
// validates them like any other visual. Not a lesson: the leading underscore
// keeps it out of the registry.

import { fmt } from '../../src/core/format.js';

export const G = 9.8;                       // m/s², the Atlas's g
export const GM_EARTH = 3.986004418e14;     // m³/s², IERS/WGS 84
export const R_EARTH = 6.371e6;             // m, mean radius

/** Round for a sim parameter: 6 significant figures, as a number. */
export const r6 = (v) => +(+v).toPrecision(6);

/** A number to n significant figures for TeX: ×10ⁿ outside 10⁻³ … 10⁵, thin-space thousands. */
export function sci(x, n = 3) {
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m}\\times10^{${+e}}`;
  }
  const [ip, fp] = fmt(x, n).split('.');
  return ip.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') + (fp !== undefined ? `.${fp}` : '');
}

/** A number for plain canvas text, with a true minus sign. */
export const um = (x) => String(x).replace(/-/g, '−');

/** A plain number to n significant figures for canvas labels. */
export const pl = (x, n = 3) => um(String(+(+x).toPrecision(n)));

/** A static graph picture. */
export const gpic = (params, caption, alt) => ({ type: 'graph', params: { aspect: 'wide', ...params, ...(alt ? { alt } : {}) }, caption });

/** A straight segment as a graph curve. */
export const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({
  param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}),
});

/** A label with no dot. */
export const lab = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r6(x), y: r6(y), r: 0, color, label, labelDx: dx, labelDy: dy });

/**
 * A still cm-polar picture: the motion (r(t), θ(t)) at time `at`, with the chosen arrows.
 * Numbers off and no readouts, so it never prints an answer.
 */
export function polarPic({ r, theta, T, at, show = ['path', 'basis'], x, y, scale, caption, alt, labels = true, bars = false }) {
  return {
    type: 'cm-polar',
    params: { r, theta, T, at, show, bars, values: false, fixed: true, readouts: [], labels, ...(x ? { x, y } : {}), ...(scale ? { scale } : {}), ...(alt ? { alt } : {}) },
    caption,
  };
}

/** Drop error values that a variant's numbers make (nearly) equal to the answer. */
export const distinct = (errors, answer, rel = 0.02) => errors.filter((e) => Math.abs(e.value - answer) > rel * Math.max(Math.abs(answer), 1e-12));
