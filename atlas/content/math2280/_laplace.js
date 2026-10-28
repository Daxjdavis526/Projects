// Helpers for the DE-6 (Laplace transform), DE-8 (boundary-value problems)
// and DE-9 (Sturm–Liouville) lessons of MATH 2280: small static pictures —
// a function of t, the complex s-plane with its poles, a pole picture from
// the de-poles simulation, initial data — and number formatting for canvas
// labels and TeX.
import { nice } from '../../src/core/format.js';

/** Round for a sim parameter or a printed key: 6 significant figures, as a number. */
export const r6 = (v) => +(+v).toPrecision(6);

/** A number for a canvas label: a true minus sign, up to 3 significant figures. */
export const lab = (x, d = 3) => String(+(+x).toPrecision(d)).replace(/-/g, '−');

/** A number in TeX: integers and short decimals exactly, otherwise 4 significant figures. */
export const n = (x) => nice(r6(x));

/** A fraction p/q in lowest terms as TeX (with its sign in front): frac2(-6, 4) → "-\frac{3}{2}". */
export function frac2(p, q) {
  const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
  const d = g(p, q) || 1;
  let a = p / d, b = q / d;
  if (b < 0) { a = -a; b = -b; }
  if (b === 1) return String(a);
  return `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{${b}}`;
}

/** A fraction p/q as an Atlas expression ("(3/2)", "(-1/6)", "4"). */
export function fracE(p, q) {
  const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
  const d = g(p, q) || 1;
  let a = p / d, b = q / d;
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `(${a})` : `(${a}/${b})`;
}

/**
 * A function of t as a small static graph: the curve `fn` (an Atlas
 * expression in x) in blue, with optional dashed companions, shading,
 * points and lines.
 */
export function fpic(fn, x, y, caption, extra = {}) {
  return {
    type: 'graph',
    params: {
      x, y, xlabel: extra.xlabel ?? 't (s)', ylabel: extra.ylabel ?? 'f', aspect: extra.aspect ?? 'wide', xticks: extra.xticks, yticks: extra.yticks,
      curves: [...(extra.curves || []), ...(fn ? [{ fn, color: 'accent', width: 2.6, domain: extra.domain || [Math.max(0, x[0]), x[1]] }] : [])],
      shade: extra.shade, points: extra.points, hlines: extra.hlines, vlines: extra.vlines, arrows: extra.arrows, legend: extra.legend, legendAt: extra.legendAt,
    },
    caption,
  };
}

/**
 * The complex s-plane with poles as red dots: poles = [[re, im, label], …].
 * A static graph with equal scales on both axes.
 */
export function splane(poles, caption, win = { x: [-5, 2], y: [-4.5, 4.5] }) {
  return {
    type: 'graph',
    params: {
      x: win.x, y: win.y, equal: true, xlabel: 'Re s', ylabel: 'Im s', aspect: 'wide',
      points: poles.map(([re, im, label]) => ({ x: re, y: im, color: 'bad', r: 5.5, label, labelDx: 9, labelDy: -10 })),
    },
    caption,
  };
}

/** A window for splane() that holds every pole with a margin. */
export function swin(poles, pad = 1.2) {
  const re = poles.map((p) => p[0]), im = poles.map((p) => Math.abs(p[1]));
  const ymax = Math.max(1.5, ...im) + pad;
  return { x: [Math.min(-1, ...re) - pad, Math.max(1, ...re) + pad], y: [-ymax, ymax] };
}

/**
 * Initial data as a picture: the starting point (0, y0) and a short arrow
 * along the starting slope v0 — what a second-order initial-value problem is given.
 */
export function initPic(y0, v0, caption, { name = 'y', T = 2, span = null } = {}) {
  const h = span ?? Math.max(2, Math.abs(y0) + Math.abs(v0) * 0.6 + 1);
  const dt = Math.min(0.5, (0.45 * h) / Math.max(0.5, Math.abs(v0)));
  return {
    type: 'graph',
    params: {
      x: [-0.3, T], y: [Math.min(-h * 0.4, y0 - h * 0.6), Math.max(h * 0.4, y0 + h * 0.6)], xlabel: 't', ylabel: name, aspect: 'wide', axesAt: 'edge',
      arrows: [{ from: [0, y0], to: [dt, y0 + dt * v0], color: 'gold', width: 2.6, label: `slope ${lab(v0)}`, labelDx: 8, labelDy: v0 >= 0 ? -8 : 12 }],
      points: [{ x: 0, y: y0, color: 'gold', label: `${name}(0) = ${lab(y0)}`, labelDx: 10, labelDy: v0 >= 0 ? 14 : -14 }],
    },
    caption,
  };
}

/** A de-poles picture of the s-plane alone (no dragging, no readout): poles in the sim's format. */
export function polePic(poles, caption, { window = null, labels = true } = {}) {
  const re = poles.map((p) => p.re), im = poles.map((p) => p.im ?? 0);
  // a window with about the canvas's proportions (16:10), so equal scales do not pad it with empty half-plane
  const H = Math.max(1.5, ...im.map(Math.abs)) + 0.8, right = Math.max(1, ...re.map((x) => x + 1)), left = Math.min(right - 3.4 * H, Math.min(...re) - 1);
  const win = window || { re: [left, right], im: [-H, H] };
  return { type: 'de-poles', params: { poles, drag: false, readout: false, panels: ['s'], window: win, labels }, caption };
}

