// Picture builders and constants for PHYS 3710's geometric special-relativity
// lessons (R0–R2). Every picture is an ordinary `graph` spec, so the content
// test validates it like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.
//
// Conventions: Carroll's and Hartle's signature (−, +, +, +), so the interval
// is Δs² = −Δt² + Δx² with c = 1, negative for timelike pairs.

export { C, G, GM_SUN, GM_EARTH, R_SUN, LY, YEAR, DAY, g0 } from '../gr/_deriv.js';

/** Six significant figures, for numbers written into graph expressions. */
export const r6 = (v) => +(+v).toPrecision(6);

/** A straight segment as a graph curve. */
export const seg = (x0, y0, x1, y1, color = 'ink2', width = 2, dash = false) => ({
  param: [`${r6(x0)} + t*(${r6(x1 - x0)})`, `${r6(y0)} + t*(${r6(y1 - y0)})`], t: [0, 1], color, width, dash,
});

/** A text label at (x, y): a point too small to see. */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0, align) => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });

/**
 * A static spacetime diagram (c = 1): x across, t up.
 *   x, t:      ranges [lo, hi]
 *   cones:     [[x, t, 'future' | 'past' | 'both']] — dashed light lines through an event
 *   lines:     [{ pts: [[x, t], …], color, width, dash, label, at (segment for the label), dx, dy, align }]
 *   events:    [[x, t, label, color?, dx?, dy?, align?]]
 *   boosted:   { beta, color, ticks: n (calibration ticks), labels, at: [x, t] (origin of the axes) }
 *   simul:     [{ at: [x, t], beta, color, label }] — a line of simultaneity of a frame moving at β
 *   hyper:     [{ s, at: [x, t], kind: 'time' | 'space', color, dash, past }] — −Δt² + Δx² = ∓s²
 *   numbers:   false hides the tick numbers (a picture must not print its answer)
 */
export function st({ x, t, xlabel = 'x (light-years)', ylabel = 't (years)', cones = [], lines = [], events = [], boosted = null, simul = [], hyper = [], numbers = true, aspect = 'square', caption, extra = {} }) {
  const curves = [], points = [];
  const span = 3 * Math.max(x[1] - x[0], t[1] - t[0]);
  for (const [x0, t0, kind = 'future'] of cones) {
    if (kind !== 'past') curves.push(seg(x0, t0, x0 + span, t0 + span, 'warn', 1.2, true), seg(x0, t0, x0 - span, t0 + span, 'warn', 1.2, true));
    if (kind !== 'future') curves.push(seg(x0, t0, x0 + span, t0 - span, 'warn', 1.2, true), seg(x0, t0, x0 - span, t0 - span, 'warn', 1.2, true));
  }
  for (const h of hyper) {
    const { s, at: [x0, t0] = [0, 0], kind = 'time', color = 'ink3', dash = true, past = false, width = 1.2 } = h;
    const U = r6(Math.asinh(span / s));
    if (kind === 'time') {
      const sg = past ? -1 : 1;
      curves.push({ param: [`${r6(x0)} + ${r6(s)}*sinh(t)`, `${r6(t0)} + ${r6(sg * s)}*cosh(t)`], t: [-U, U], color, width, dash });
    } else {
      curves.push({ param: [`${r6(x0)} + ${r6(s)}*cosh(t)`, `${r6(t0)} + ${r6(s)}*sinh(t)`], t: [-U, U], color, width, dash });
      if (h.both) curves.push({ param: [`${r6(x0)} - ${r6(s)}*cosh(t)`, `${r6(t0)} + ${r6(s)}*sinh(t)`], t: [-U, U], color, width, dash });
    }
  }
  if (boosted) {
    const { beta: b, color = 'gold', ticks = 0, labels = true, at: [x0, t0] = [0, 0], names = ['t′ axis', 'x′ axis'] } = boosted;
    const g = 1 / Math.sqrt(1 - b * b);
    curves.push(seg(x0 - span * b, t0 - span, x0 + span * b, t0 + span, color, 1.9), seg(x0 - span, t0 - span * b, x0 + span, t0 + span * b, color, 1.9));
    for (let n = 1; n <= ticks; n++) {
      points.push({ x: r6(x0 + g * b * n), y: r6(t0 + g * n), r: 3, color }, { x: r6(x0 + g * n), y: r6(t0 + g * b * n), r: 3, color });
    }
    if (labels) {
      const tt = t[1] - 0.08 * (t[1] - t[0]), xx = x[1] - 0.06 * (x[1] - x[0]);
      points.push(label(x0 + b * (tt - t0), tt, names[0], color, 8, 0), label(xx, t0 + b * (xx - x0), names[1], color, -4, -12, 'right'));
    }
  }
  for (const { at: [x0, t0], beta: b, color = 'gold', label: text, width = 1.3 } of simul) {
    curves.push(seg(x0 - span, t0 - b * span, x0 + span, t0 + b * span, color, width, true));
    if (text) { const xl = x[1] - 0.04 * (x[1] - x[0]); points.push(label(xl, t0 + b * (xl - x0), text, color, 0, -10, 'right')); }
  }
  for (const L of lines) {
    const { pts, color = 'accent', width = 2.4, dash = false, label: text, at = pts.length - 2, dx = 8, dy = 0, align } = L;
    for (let k = 0; k + 1 < pts.length; k++) curves.push(seg(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], color, width, dash));
    if (text) { const [p, q] = [pts[at], pts[at + 1]]; points.push(label((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, text, color, dx, dy, align)); }
  }
  for (const [ex, et, text, color = 'accent2', dx = 9, dy = -9, align] of events) points.push({ x: r6(ex), y: r6(et), r: 4.5, color, label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });
  return {
    type: 'graph',
    params: {
      x: x.map(r6), y: t.map(r6), equal: true, aspect, axesAt: 'edge', xlabel, ylabel,
      ...(numbers ? {} : { xticks: 0, yticks: 0 }),
      curves: [...curves, ...(extra.curves || [])], points: [...points, ...(extra.points || [])],
      ...(extra.arrows ? { arrows: extra.arrows } : {}), ...(extra.shade ? { shade: extra.shade } : {}),
      ...(extra.readouts ? { readouts: extra.readouts } : {}), ...(extra.sliders ? { sliders: extra.sliders } : {}),
      ...(extra.drag ? { drag: extra.drag } : {}),
    },
    caption: caption ?? 'A spacetime diagram with c = 1: time up the page, space across, light along the dashed 45° lines.',
  };
}

/**
 * A constant-proper-acceleration worldline (c = 1, units of 1/α): x = cosh φ − 1,
 * t = sinh φ for rapidity φ from 0 to phiMax, as a graph curve.
 */
export const rocketCurve = (phiMax, color = 'gold', scale = 1, width = 2.6) => ({
  param: [`${r6(scale)}*(cosh(t) - 1)`, `${r6(scale)}*sinh(t)`], t: [0, r6(phiMax)], color, width,
});
