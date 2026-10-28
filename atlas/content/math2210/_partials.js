// Shared helpers for the partial-derivative lessons (C3-3) and the ODE
// preview (C3-6): surface pictures on surface3d with paths drawn on them,
// level curves of quadratic functions as parametric curves for the graph
// sim, and arrows scaled for display. Files whose names start with "_" are
// helpers, not lessons.

import { nice } from '../../src/core/format.js';

/** Round for an expression string, so a printed parameter never carries 17 digits. */
export const r6 = (v) => +(+v).toPrecision(6);

/**
 * The graph z = f(x, y) on surface3d. `f` is a template (x, y) => expression,
 * so a path can be substituted into it. paths: [{ x: 't', y: '2*t', t: [a, b],
 * color }] are drawn on the surface (curves are not scaled by zscale, so the
 * template is scaled here when zscale is set).
 */
export function surf(f, { domain = [[-2, 2], [-2, 2]], paths = [], zscale = 1, caption = 'Drag to rotate.', curves = [], ...rest } = {}) {
  const Z = (x, y) => (zscale === 1 ? f(x, y) : `${zscale}*(${f(x, y)})`);
  return {
    type: 'surface3d',
    params: {
      z: f('x', 'y'), domain, ...(zscale === 1 ? {} : { zscale }), ...rest,
      curves: [
        ...paths.map((p) => ({ param: [p.x, p.y, Z(`(${p.x})`, `(${p.y})`)], t: p.t, color: p.color || 'gold', width: p.width || 3 })),
        ...curves,
      ],
    },
    caption,
  };
}

/** A straight path y = m x into the origin, as two rays that stop short of it. */
export const linePaths = (m, reach = 2, gap = 0.04, color = 'gold') => {
  const s = reach / Math.sqrt(1 + m * m);
  return [{ x: 't', y: `${r6(m)}*t`, t: [gap, s], color }, { x: 't', y: `${r6(m)}*t`, t: [-s, -gap], color }];
};

/** Level curves of q = A x² + C y² (A, C > 0) at the given levels, as graph curves. */
export const ellipses = (A, C, levels, { color = 'accent2', width = 1.4, cx = 0, cy = 0 } = {}) => levels.map((c) => ({
  param: [`${r6(cx)} + ${r6(Math.sqrt(c / A))}*cos(t)`, `${r6(cy)} + ${r6(Math.sqrt(c / C))}*sin(t)`], t: [0, 6.2832], color, width,
}));

/** The rays and circles of a polar grid, for the graph sim. */
export function polarGrid({ rings = [1, 2, 3, 4], rays = 12, reach = 4.4, color = 'ink4', width = 1 } = {}) {
  return [
    ...rings.map((r) => ({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color, width })),
    ...Array.from({ length: rays }, (_, k) => {
      const a = (2 * Math.PI * k) / rays;
      return { param: [`t*${r6(Math.cos(a))}`, `t*${r6(Math.sin(a))}`], t: [0, reach], color, width };
    }),
  ];
}

/** An arrow from P along v, scaled so its length on the picture is `len` (directions true). */
export const arrowAlong = (P, v, len, o = {}) => {
  const n = Math.hypot(...v) || 1;
  return { from: [r6(P[0]), r6(P[1])], to: [r6(P[0] + (v[0] * len) / n), r6(P[1] + (v[1] * len) / n)], ...o };
};

/** A signed term for TeX and answer text: (3, 'x') → "+ 3x", (−1, 'y') → "- y"; first: no leading +. */
export function sterm(c, v = '', first = false) {
  if (!c) return '';
  const mag = Math.abs(c), body = v && mag === 1 ? v : `${nice(mag)}${v}`;
  return first ? `${c < 0 ? '-' : ''}${body}` : ` ${c < 0 ? '-' : '+'} ${body}`;
}
