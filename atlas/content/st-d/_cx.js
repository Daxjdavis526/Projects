// Shared helpers for Advanced Math D (complex analysis): complex numbers as
// TeX and as canvas labels, and ready-made pictures — an Argand diagram on
// the graph sim (points, arrows from 0, circles, angle arcs) and the cx-map
// simulation with sensible defaults. The arithmetic comes from the cx-map
// model, so the pictures and the answer keys share one implementation.
// Files whose names start with "_" are helpers, not lessons.

import * as M from '../../src/viz/model/cx-map.js';

export { M };
export const r6 = (x) => +(+x).toFixed(6);
const DEG = Math.PI / 180;
export const deg = (rad) => rad / DEG;

/** A real number as short TeX: integers bare, otherwise n significant figures (no e-notation for ordinary sizes). */
export function num(x, n = 3) {
  if (Math.abs(x) < 1e-9) return '0';
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return String(r);
  return String(+x.toPrecision(n));
}
/** A complex number [re, im] as TeX: 3 - 2i, i, -0.5i, 2. */
export function cTeX(z, n = 3) {
  const re = num(z[0], n), imAbs = num(Math.abs(z[1]), n);
  if (imAbs === '0') return re;
  const ip = imAbs === '1' ? 'i' : `${imAbs}i`;
  if (re === '0') return `${z[1] < 0 ? '-' : ''}${ip}`;
  return `${re} ${z[1] < 0 ? '-' : '+'} ${ip}`;
}
/** The same as plain text for a canvas label (Unicode minus). */
export const cPlain = (z, n = 3) => cTeX(z, n).replace(/-/g, '−');
/** An angle in degrees, wrapped into (−180°, 180°]. */
export const wrapDeg = (d) => { let a = ((d + 180) % 360 + 360) % 360 - 180; if (a === -180) a = 180; return a; };

/**
 * An Argand diagram on the graph sim. Every position is [re, im].
 *  pts:     [{ z, label, color, r, hollow }]
 *  arrows:  [{ to, from = [0, 0], label, color, dash, width }]
 *  circles: [{ c = [0, 0], r, color, dash }]
 *  arcs:    [{ r, from, to (radians), color, label }] — an angle marked at the origin
 *  curves:  graph curves, passed through
 *  view:    half-height of the window (equal axes; width follows the canvas)
 */
export function argand({ pts = [], arrows = [], circles = [], arcs = [], curves = [], view = 3, center = [0, 0], caption, ticks = true, extra = {} } = {}) {
  const cs = [...curves];
  for (const c of circles) {
    const [a, b] = c.c || [0, 0];
    cs.push({ param: [`${r6(a)} + ${r6(c.r)}*cos(t)`, `${r6(b)} + ${r6(c.r)}*sin(t)`], t: [0, 6.2832], color: c.color || 'ink3', width: c.width || 1.4, dash: c.dash ?? [4, 4] });
  }
  for (const a of arcs) {
    cs.push({ param: [`${r6(a.r)}*cos(t)`, `${r6(a.r)}*sin(t)`], t: [r6(a.from), r6(a.to)], color: a.color || 'ink2', width: 1.6, ...(a.label ? { label: a.label, labelAt: r6((a.from + a.to) / 2), labelDx: 6, labelDy: -4 } : {}) });
  }
  const A = arrows.map((a) => ({ from: (a.from || [0, 0]).map(r6), to: a.to.map(r6), color: a.color || 'accent', width: a.width || 2.6, ...(a.dash ? { dash: a.dash } : {}), ...(a.label ? { label: a.label } : {}) }));
  const P = pts.map((p) => ({ x: r6(p.z[0]), y: r6(p.z[1]), color: p.color || 'gold', ...(p.label ? { label: p.label } : {}), ...(p.r !== undefined ? { r: p.r } : {}), ...(p.hollow ? { hollow: true } : {}), ...(p.labelDx !== undefined ? { labelDx: p.labelDx } : {}), ...(p.labelDy !== undefined ? { labelDy: p.labelDy } : {}) }));
  return {
    type: 'graph',
    params: {
      x: [r6(center[0] - view * 1.6), r6(center[0] + view * 1.6)], y: [r6(center[1] - view), r6(center[1] + view)], equal: true,
      xlabel: 'Re', ylabel: 'Im', ...(ticks ? {} : { xticks: 0, yticks: 0 }), curves: cs, arrows: A, points: P, ...extra,
    },
    caption,
  };
}

/** A cx-map picture with the panels' defaults filled in. */
export const cxmap = (params, caption, more = {}) => ({ type: 'cx-map', params: { readout: false, ...params }, caption, ...more });

/** Unit-modulus number at an angle in degrees. */
export const cis = (d, r = 1) => M.polar(r, d * DEG);
