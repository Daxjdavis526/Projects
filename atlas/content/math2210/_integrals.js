// Shared picture helpers for the multiple-integral lessons (C3-4): boxes on
// a grid (c3-boxes), surfaces scaled to fit (surface3d), regions cut into
// strips (c3-slicer), plain region sketches on a graph, polar regions
// (calc-polar) and 3D scenes (calc-vectors3d). Files whose names start with
// "_" are helpers, not lessons.

import { fn } from '../../src/viz/model/exprfn.js';

/** Round for an expression string, so a printed parameter never carries 17 digits. */
export const r6 = (v) => +(+v).toPrecision(6);

/** The largest |f| over a rectangle, sampled on a grid (f an expression of x and y). */
export function maxAbs(f, [x0, x1], [y0, y1], N = 40) {
  const g = fn(f, ['x', 'y']);
  let m = 0;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const v = Math.abs(g({ x: x0 + ((x1 - x0) * i) / N, y: y0 + ((y1 - y0) * j) / N }));
    if (Number.isFinite(v)) m = Math.max(m, v);
  }
  return m;
}

/** A height scale that makes the tallest point of f stand about `top` units high. */
export const fitScale = (f, x, y, top) => r6(top / (maxAbs(f, x, y) || 1));

/**
 * Boxes on a grid under f (c3-boxes), static unless told otherwise: no cell
 * sliders and no readout by default, since a question's picture must not
 * print its answer. top: the drawn height of the tallest box, in the units of
 * the floor (heights are scaled to fit; the caption should say so).
 */
export function boxesPic(f, x, y, { m = 4, n = 4, top = null, caption, ...rest } = {}) {
  const span = Math.max(x[1] - x[0], y[1] - y[0]);
  const zscale = rest.zscale ?? fitScale(f, x, y, top ?? 0.9 * span);
  return { type: 'c3-boxes', params: { f, x, y, m, n, cellSliders: false, readout: false, zscale, dist: r6(2.3 * span + 1), ...rest }, caption };
}

/** The graph z = f(x, y) over a rectangle (surface3d), heights scaled so the tallest point is about `top`. */
export function surfPic(f, x, y, { top = null, caption = 'Drag to rotate.', n = 32, ...rest } = {}) {
  const span = Math.max(x[1] - x[0], y[1] - y[0]);
  const zscale = rest.zscale ?? fitScale(f, x, y, top ?? span);
  const cx = (x[0] + x[1]) / 2, cy = (y[0] + y[1]) / 2;
  return {
    type: 'surface3d',
    params: { z: f, domain: [x, y], n, zscale, axisLen: r6(Math.max(x[1], y[1], 1) * 1.2), target: [r6(cx), r6(cy), r6(0.3 * span)], dist: r6(2.1 * span + 0.6), yaw: 0.6, pitch: 0.45, ...rest },
    caption,
  };
}

/** A region cut into strips (c3-slicer), static: no moving strip, no numbers; ghost strips show the order. */
export function slicerPic(params, caption) {
  return { type: 'c3-slicer', params: { strip: false, readout: false, sweep: false, ghost: 8, orderChoice: false, ...params }, caption };
}

/** A plain picture of a region on a graph: shade [{ fn, lower, from, to }], curves, points — no strips. */
export function regionPic({ x, y, shade = [], curves = [], points = [], vlines = [], hlines = [], arrows = [], equal = true, caption, ...rest }) {
  return {
    type: 'graph',
    params: { x, y, equal, aspect: rest.aspect ?? 'wide', shade: shade.map((s) => ({ color: 'accent', alpha: 0.22, ...s })), curves, points, vlines, hlines, arrows, ...rest },
    caption,
  };
}

/** The rectangle [x0, x1] × [y0, y1] as a shaded region on a graph. */
export const rectShade = (x0, x1, y0, y1, o = {}) => ({ fn: String(y1), lower: String(y0), from: x0, to: x1, color: 'accent', alpha: 0.22, ...o });

/** The rectangle's outline as four graph curves. */
export const rectOutline = (x0, x1, y0, y1, color = 'accent', width = 2) => [
  { param: [`${x0} + t*${r6(x1 - x0)}`, String(y0)], t: [0, 1], color, width },
  { param: [`${x0} + t*${r6(x1 - x0)}`, String(y1)], t: [0, 1], color, width },
  { param: [String(x0), `${y0} + t*${r6(y1 - y0)}`], t: [0, 1], color, width },
  { param: [String(x1), `${y0} + t*${r6(y1 - y0)}`], t: [0, 1], color, width },
];
