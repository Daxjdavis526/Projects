// Figure builders for the M0 coordinate-geometry, vector, complex-number and
// conic lessons (M0-9 to M0-11): a plane with equal axes, segments, circles,
// ellipses, hyperbolas, parabolas, arrows with component legs, and TeX/plain
// text for points. Every figure is a plain 'graph' visual; labels drawn on the
// canvas are plain text (Unicode), never TeX.
import { N, lab } from './_m0kit.js';

export const PI = Math.PI;
export const D2R = PI / 180;
export const deg = (rad) => rad / D2R;
/** An angle in degrees wrapped into (−180°, 180°]. */
export const wrap180 = (d) => { let a = (((d + 180) % 360) + 360) % 360 - 180; if (a <= -180 + 1e-9) a = 180; return a; };
/** An angle in degrees wrapped into [0°, 360°). */
export const wrap360 = (d) => { const a = ((d % 360) + 360) % 360; return a > 360 - 1e-9 ? 0 : a; };

/** A point as TeX: (−2, 3). */
export const ptTeX = (p) => `(${N(p[0])},\\ ${N(p[1])})`;
/** A point as plain canvas text: (−2, 3). */
export const ptText = (p) => `(${lab(N(p[0]))}, ${lab(N(p[1]))})`;

/** A straight segment from a to b as a parametric curve. */
export const seg = (a, b, o = {}) => ({ param: [`${N(a[0])} + t*(${N(b[0] - a[0])})`, `${N(a[1])} + t*(${N(b[1] - a[1])})`], t: [0, 1], color: 'ink3', width: 1.6, ...o });
/** A circle (or arc from t0 to t1, radians) of radius r about c. */
export const circ = (c, r, o = {}, t0 = 0, t1 = 2 * PI) => ({ param: [`${N(c[0])} + ${N(r)}*cos(t)`, `${N(c[1])} + ${N(r)}*sin(t)`], t: [N(t0), N(t1)], color: 'accent', width: 2.2, ...o });
/** An axis-aligned ellipse with semi-axes a (along x) and b (along y) about c. */
export const ell = (c, a, b, o = {}) => ({ param: [`${N(c[0])} + ${N(a)}*cos(t)`, `${N(c[1])} + ${N(b)}*sin(t)`], t: [0, N(2 * PI)], color: 'accent', width: 2.2, ...o });
/** Both branches of x²/a² − y²/b² = 1 about c (vertical: y²/a² − x²/b² = 1), out to the parameter u = ±umax. */
export const hyp = (c, a, b, o = {}, umax = 2, vertical = false) => [1, -1].map((s) => ({
  param: vertical ? [`${N(c[0])} + ${N(b)}*sinh(t)`, `${N(c[1])} + (${N(s * a)})*cosh(t)`] : [`${N(c[0])} + (${N(s * a)})*cosh(t)`, `${N(c[1])} + ${N(b)}*sinh(t)`],
  t: [N(-umax), N(umax)], color: 'accent', width: 2.2, ...o,
}));
/** The parabola (x − h)² = 4p(y − k) (vertical axis), for x in [x0, x1]. */
export const parab = (h, k, p, x0, x1, o = {}) => ({ fn: `${N(k)} + (x - (${N(h)}))^2/${N(4 * p)}`, domain: [N(x0), N(x1)], color: 'accent', width: 2.2, ...o });

/** An arrow from a to b, with optional dashed component legs (horizontal then vertical). */
export function vecArrow(a, b, { color = 'accent', label, labelDx, labelDy, width = 2.6, legs = false, legColors = ['accent2', 'warn'], dash } = {}) {
  const arrows = [{ from: [N(a[0]), N(a[1])], to: [N(b[0]), N(b[1])], color, width, ...(label ? { label } : {}), ...(labelDx !== undefined ? { labelDx } : {}), ...(labelDy !== undefined ? { labelDy } : {}), ...(dash ? { dash } : {}) }];
  const curves = legs ? [seg(a, [b[0], a[1]], { color: legColors[0], width: 2, dash: true }), seg([b[0], a[1]], b, { color: legColors[1], width: 2, dash: true })] : [];
  return { arrows, curves };
}

/**
 * A plane with equal axes. Pass curves, arrows, points (graph specs) and any
 * other graph params via extra. ticks: false hides the tick numbers.
 */
export function plane({ x, y, curves = [], arrows = [], points = [], caption, extra = {}, aspect = 'wide', ticks = true, xlabel = 'x', ylabel = 'y', grid = true, xticks, yticks }) {
  return {
    type: 'graph',
    params: {
      x, y, equal: true, aspect, xlabel, ylabel, grid,
      ...(ticks ? {} : { xticks: 0, yticks: 0 }), ...(xticks !== undefined ? { xticks } : {}), ...(yticks !== undefined ? { yticks } : {}),
      curves, arrows, points, ...extra,
    },
    caption,
  };
}

/** A window [x, y] that holds every point given, with a margin, at about the 2:1 'wide' shape. */
export function fit(pts, margin = 1.2, minHalf = 2) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  let hx = Math.max(minHalf, (x1 - x0) / 2 + margin), hy = Math.max(minHalf * 0.6, (y1 - y0) / 2 + margin);
  if (hx < 2 * hy) hx = 2 * hy; else hy = hx / 2;
  return { x: [+N(cx - hx), +N(cx + hx)], y: [+N(cy - hy), +N(cy + hy)] };
}

/** A labelled dot. */
export const dot = (p, label, o = {}) => ({ x: N(p[0]), y: N(p[1]), color: 'gold', r: 5, ...(label ? { label } : {}), ...o });
/** A bare label (no dot) centred on p. */
export const note = (p, label, o = {}) => ({ x: N(p[0]), y: N(p[1]), r: 0, label, labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2', ...o });
