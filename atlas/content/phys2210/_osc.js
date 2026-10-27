// Picture builders for the PHYS 2210 oscillation lessons (module M15): a block
// on a spring, x–t graphs and a pendulum sketch, as ordinary `graph` specs so
// the content test validates them like any other visual. Not a lesson: the
// leading underscore keeps it out of the registry.

import { fmt } from '../../src/core/format.js';

export { tn } from './_fluids.js';

/** The Atlas's g, m/s² (the oscillator simulation uses the same value). */
export const G = 9.8;
export const s3 = (x) => fmt(x, 3);
const r4 = (v) => +(+v).toPrecision(6);
const seg = (a, b, color = 'ink2', width = 2, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, dash });
const text = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0.01, color, label, labelDx: dx, labelDy: dy });

/**
 * A block on a horizontal spring, fixed to a wall on the left.
 *   x       the block's displacement in drawing units (about ±1.2 fits): + pulled right, − pushed left
 *   m, k    labels for the block and the spring
 *   arrow   a label for the displacement arrow (null for none)
 *   v       a label for a velocity arrow on the block (null for none); vdir ±1
 *   ghost   another displacement to show as a dashed outline (an earlier or later position)
 */
export function springPic({ x = 0.8, m = 'm', k = 'k', arrow = 'x', v = null, vdir = 1, ghost = null, caption } = {}) {
  const xe = 4.2, xb = xe + x, w = 0.5, y0 = -0.6, y1 = 0.3;
  const zig = [];
  const n = 14, x0 = 0, x1 = xb - w;
  for (let i = 0; i <= n; i++) zig.push([x0 + ((x1 - x0) * i) / n, i === 0 || i === n ? -0.15 : -0.15 + (i % 2 ? 0.18 : -0.18)]);
  const curves = [
    seg([0, -0.75], [0, 0.85], 'ink3', 5), seg([0, y0], [7.6, y0], 'ink3', 1.6),
    ...zig.slice(1).map((p, i) => seg(zig[i], p, 'ink2', 1.8)),
    seg([xe, -0.8], [xe, 0.75], 'ink4', 1.2, true),
    seg([xb - w, y0], [xb + w, y0], 'accent', 2.4), seg([xb + w, y0], [xb + w, y1], 'accent', 2.4), seg([xb + w, y1], [xb - w, y1], 'accent', 2.4), seg([xb - w, y1], [xb - w, y0], 'accent', 2.4),
  ];
  if (ghost !== null) {
    const g = xe + ghost;
    curves.push(seg([g - w, y0], [g + w, y0], 'ink3', 1.4, true), seg([g + w, y0], [g + w, y1], 'ink3', 1.4, true), seg([g + w, y1], [g - w, y1], 'ink3', 1.4, true), seg([g - w, y1], [g - w, y0], 'ink3', 1.4, true));
  }
  const arrows = [];
  const points = [text(xe + 0.06, -0.86, 'x = 0', 'ink3', 2, 0), text(1.2, 0.42, k, 'ink2'), text(xb - w + 0.08, -0.15, m, 'accent', 0, 0)];
  if (arrow && Math.abs(x) > 0.05) { arrows.push({ from: [xe, 0.62], to: [r4(xb), 0.62], color: 'gold' }); points.push(text(xe + Math.min(x, 0) - (x < 0 ? 0.1 : -0.1), 0.92, arrow, 'gold', x < 0 ? -10 : 0, 0)); }
  if (v) { arrows.push({ from: [r4(xb + vdir * 0.7), -0.15], to: [r4(xb + vdir * 1.6), -0.15], color: 'good' }); points.push(text(xb + vdir * 1.0 - (vdir < 0 ? 0.5 : 0), 0.08, v, 'good')); }
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [-0.4, 7.6], y: [-1.05, 1.25], equal: true, xlabel: '', ylabel: '', axes: false, grid: false, curves, arrows, points, shade: [{ fn: String(y1), lower: String(y0), from: r4(xb - w), to: r4(xb + w), color: 'accent', alpha: 0.25 }] },
    caption: caption ?? 'A block on a spring on a frictionless floor, seen from the side. Not to scale.',
  };
}

/**
 * x against t for x = A cos(ωt + φ), from t = 0 to tmax, with optional marked points and extra curves.
 */
export function xtGraph({ A, w, phi = 0, tmax, ylabel = 'x (m)', xticks = 10, points = [], curves = [], hlines = [], caption, label = null }) {
  const pad = Math.abs(A) * 0.25;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r4(tmax)], y: [r4(-Math.abs(A) - pad), r4(Math.abs(A) + pad)], xlabel: 't (s)', ylabel, xticks,
      curves: [{ fn: `${r4(A)}*cos(${r4(w)}*x + ${r4(phi)})`, color: 'accent', width: 2.4, ...(label ? { label, labelAt: r4(tmax * 0.05), labelDy: -14 } : {}) }, ...curves],
      points, hlines,
    },
    caption,
  };
}

/** A pendulum sketch: a bob on a string of length label L, displaced by `deg` degrees. */
export function pendulumPic({ deg = 20, L = 'L', m = 'm', angle = 'θ', caption } = {}) {
  const th = (deg * Math.PI) / 180, len = 2.2;
  const bx = len * Math.sin(th), by = -len * Math.cos(th);
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-2.6, 2.6], y: [-2.75, 0.35], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
      curves: [seg([-0.7, 0], [0.7, 0], 'ink3', 4), seg([0, 0], [r4(bx), r4(by)], 'ink2', 1.8), seg([0, 0], [0, -len - 0.2], 'ink4', 1.2, true),
        { param: [`0.7*sin(t)`, `-0.7*cos(t)`], t: [0, r4(th)], color: 'gold', width: 1.8 }],
      points: [{ x: r4(bx), y: r4(by), color: 'accent', r: 9 }, text(bx / 2 + 0.12, by / 2, L, 'ink2'), text(0.25 * Math.sin(th / 2) + 0.12, -0.95, angle, 'gold'), text(bx + 0.22, by - 0.1, m, 'accent')],
    },
    caption: caption ?? 'A simple pendulum: a small bob on a light string. Not to scale.',
  };
}
