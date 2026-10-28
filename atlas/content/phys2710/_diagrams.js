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
