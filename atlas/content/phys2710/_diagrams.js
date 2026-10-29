// Picture builders for the PHYS 2710 lessons. Every picture is an ordinary
// `graph` spec, so the content test validates it like any other visual.
// Not a lesson: the leading underscore keeps it out of the registry.

import { wavelengthToRGB } from '../../src/viz/model/qm-light.js';

/** Six significant figures, for numbers written into graph expressions. */
export const r6 = (v) => +(+v).toPrecision(6);

/** A straight segment as a graph curve. */
export const seg = (x0, y0, x1, y1, color = 'ink2', width = 2, dash = false) => ({
  param: [`${r6(x0)} + t*(${r6(x1 - x0)})`, `${r6(y0)} + t*(${r6(y1 - y0)})`], t: [0, 1], color, width, dash,
});

/** A text label at (x, y): a point too small to see. */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0, align) => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });

/** A circle of radius r centred at (x, y), as a parametric curve. */
export const circle = (x, y, r, color = 'ink2', width = 2, dash = false) => ({
  param: [`${r6(x)} + ${r6(r)}*cos(t)`, `${r6(y)} + ${r6(r)}*sin(t)`], t: [0, 6.2832], color, width, dash,
});

/** A filled disc (shaded between the upper and lower semicircles). */
export const disc = (x, y, r, color = 'accent', alpha = 0.3) => ({
  fn: `${r6(y)} + sqrt(max(0, ${r6(r * r)} - (x - ${r6(x)})^2))`, lower: `${r6(y)} - sqrt(max(0, ${r6(r * r)} - (x - ${r6(x)})^2))`, from: r6(x - r), to: r6(x + r), color, alpha,
});

/** A static picture frame: no axes, no grid, equal scales. */
export const frame = (x, y, extra = {}) => ({ x, y, equal: true, axes: false, grid: false, xlabel: '', ylabel: '', ...extra });

/**
 * The spectrum as a coloured strip (graph): the visible colours (approximate
 * screen colours) between ultraviolet and infrared, with marked wavelengths.
 *   marks: [{ nm, label, color?, dy?, dx?, align? }]
 */
export function spectrumStrip({ from = 350, to = 700, marks = [], caption, xlabel = 'wavelength (nm)', extraCurves = [], extraPoints = [] } = {}) {
  const shade = [];
  for (let nm = 380; nm < 750; nm += 5) {
    const lo = Math.max(from, nm), hi = Math.min(to, nm + 5);
    if (hi <= lo) continue;
    const [r, g, b] = wavelengthToRGB(nm + 2.5);
    shade.push({ fn: '1', lower: '0', from: lo, to: hi, color: `rgb(${r}, ${g}, ${b})`, alpha: 0.85 });
  }
  if (from < 380) shade.unshift({ fn: '1', lower: '0', from, to: Math.min(380, to), color: 'violet', alpha: 0.1 });
  if (to > 750) shade.push({ fn: '1', lower: '0', from: Math.max(750, from), to, color: 'bad', alpha: 0.08 });
  const curves = [...extraCurves], points = [...extraPoints];
  for (const m of marks) {
    curves.push(seg(m.nm, -0.12, m.nm, 1.18, m.color || 'ink', m.width || 2.2, m.dash || false));
    points.push(label(m.nm, 1.18, m.label, m.color || 'ink', m.dx ?? 0, m.dy ?? -12, m.align || 'center'));
  }
  return {
    type: 'graph',
    params: { x: [from, to], y: [-0.35, 1.95], aspect: 'wide', axesAt: 'edge', xlabel, ylabel: '', yticks: 0, grid: false, shade, curves, points },
    caption: caption ?? 'The spectrum, with ultraviolet to the left of the visible colours and infrared to the right. Screen colours are approximate.',
  };
}

/**
 * A static spacetime diagram drawn with `graph`: space across, time up, in
 * units where light runs at 45° (ct against x, or years against light-years).
 * Event labels are plain text (P, Q… — never A–D, which the player uses for
 * answer choices).
 *   x, t:      ranges [lo, hi]
 *   lines:     [{ pts: [[x, t], …], color, width, dash, label, at (segment index for the label), dx, dy, align }]
 *   events:    [[x, t, label, color?, dx?, dy?, align?]]
 *   cones:     [[x, t, 'future' | 'past' | 'both']] — dashed light lines through an event
 *   boosted:   { beta, color, labels } — the axes of a frame moving at β (through the origin)
 *   simul:     [{ at: [x, t], beta, color, label }] — a line of simultaneity of a frame moving at β
 *   hyperbolae: [s, …] — the curves t² − x² = s² (timelike) through (0, s)
 *   numbers:   false hides the tick numbers (a picture must not show its answer)
 */
export function minkowski({ x, t, xlabel = 'x (light-years)', ylabel = 't (years)', lines = [], events = [], cones = [], boosted = null, simul = [], hyperbolae = [], numbers = true, aspect = 'square', caption, extra = {} }) {
  const curves = [], points = [], arrows = [];
  const span = 3 * Math.max(x[1] - x[0], t[1] - t[0]);
  for (const [x0, t0, kind = 'future'] of cones) {
    if (kind !== 'past') curves.push(seg(x0, t0, x0 + span, t0 + span, 'warn', 1.2, true), seg(x0, t0, x0 - span, t0 + span, 'warn', 1.2, true));
    if (kind !== 'future') curves.push(seg(x0, t0, x0 + span, t0 - span, 'warn', 1.2, true), seg(x0, t0, x0 - span, t0 - span, 'warn', 1.2, true));
  }
  for (const s of hyperbolae) curves.push({ param: [`${r6(s)}*sinh(t)`, `${r6(s)}*cosh(t)`], t: [-3, 3], color: 'ink3', width: 1.1, dash: true });
  if (boosted) {
    const { beta: b, color = 'gold', labels = true } = boosted;
    curves.push(seg(-span * b, -span, span * b, span, color, 1.8), seg(-span, -span * b, span, span * b, color, 1.8));
    if (labels) {
      const tt = t[1] * 0.9, xx = x[1] * 0.88;
      points.push(label(b * tt, tt, 't′ axis', color, 8, 0), label(xx, b * xx, 'x′ axis', color, -6, -12, 'right'));
    }
  }
  for (const { at: [x0, t0], beta: b, color = 'gold', label: text } of simul) {
    curves.push(seg(x0 - span, t0 - b * span, x0 + span, t0 + b * span, color, 1.3, true));
    if (text) points.push(label(x[1] - 0.04 * (x[1] - x[0]), t0 + b * (x[1] - 0.04 * (x[1] - x[0]) - x0), text, color, 0, -10, 'right'));
  }
  for (const L of lines) {
    const { pts, color = 'accent', width = 2.4, dash = false, label: text, at = pts.length - 2, dx = 8, dy = 0, align, arrow = false } = L;
    for (let k = 0; k + 1 < pts.length; k++) {
      if (arrow) arrows.push({ from: [r6(pts[k][0]), r6(pts[k][1])], to: [r6(pts[k + 1][0]), r6(pts[k + 1][1])], color, width, ...(text && k === at ? { label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) } : {}) });
      else curves.push(seg(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], color, width, dash));
    }
    if (text && !arrow) { const [p, q] = [pts[at], pts[at + 1]]; points.push(label((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, text, color, dx, dy, align)); }
  }
  for (const [ex, et, text, color = 'accent2', dx = 9, dy = -9, align] of events) points.push({ x: r6(ex), y: r6(et), r: 4.5, color, label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });
  return {
    type: 'graph',
    params: {
      x: x.map(r6), y: t.map(r6), equal: true, aspect, axesAt: 'edge', xlabel, ylabel,
      ...(numbers ? {} : { xticks: 0, yticks: 0 }),
      curves: [...curves, ...(extra.curves || [])], points: [...points, ...(extra.points || [])], arrows: [...arrows, ...(extra.arrows || [])],
      ...(extra.shade ? { shade: extra.shade } : {}),
    },
    caption: caption ?? 'A spacetime diagram: time up the page, space across, in units where light runs along 45° lines.',
  };
}
