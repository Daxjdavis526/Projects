// Shared helpers for the partial-derivative lessons (C3-3) and the ODE
// preview (C3-6): surface pictures on surface3d with paths drawn on them,
// level curves of quadratic functions as parametric curves for the graph
// sim, and arrows scaled for display. Files whose names start with "_" are
// helpers, not lessons.

import { nice } from '../../src/core/format.js';
import { fn } from '../../src/viz/model/exprfn.js';

const t = String.raw;

/** Round for an expression string, so a printed parameter never carries 17 digits. */
export const r6 = (v) => +(+v).toPrecision(6);

/**
 * The graph z = f(x, y) on surface3d. `f` is a template (x, y) => expression,
 * so a path can be substituted into it. paths: [{ x: 't', y: '2*t', t: [a, b],
 * color }] are drawn on the surface (surface3d scales them by zscale along
 * with the surface).
 */
export function surf(f, { domain = [[-2, 2], [-2, 2]], paths = [], traces = [], zscale = 1, caption = 'Drag to rotate.', curves = [], ...rest } = {}) {
  const Z = (x, y) => f(x, y);
  return {
    type: 'surface3d',
    params: {
      z: f('x', 'y'), domain, ...(zscale === 1 ? {} : { zscale }), ...rest,
      curves: [
        ...paths.map((p) => ({ param: [p.x, p.y, Z(`(${p.x})`, `(${p.y})`)], t: p.t, color: p.color || 'bad', width: p.width || 3 })),
        // traces: the cut by the plane y = b (gold, its slope is ∂f/∂x) or x = a (violet, slope ∂f/∂y)
        ...traces.map((tr) => (tr.y !== undefined
          ? { param: ['t', `${tr.y}`, Z('t', `(${tr.y})`)], t: tr.t || domain[0], color: tr.color || 'gold', width: 3 }
          : { param: [`${tr.x}`, 't', Z(`(${tr.x})`, 't')], t: tr.t || domain[1], color: tr.color || 'violet', width: 3 })),
        ...curves,
      ],
    },
    caption,
  };
}

/**
 * The ideal-gas surface P = nRT/V (P in kPa, V in L, T in K) in a display box
 * [0, 4] × [0, 4]: u = (V − 10)/7.5 runs over V = 10…40 L, v = (T − 200)/50
 * over T = 200…400 K, and the height is 0.009·P/n (1 mol tops out at 3).
 * V and T are numbers or slider keys; the isotherm through the point is gold,
 * the isochore violet, their tangent lines white, a drop line marks the point.
 */
export const GAS_R = 8.314;
export function gasSurface({ V, T, n = 1, tangents = true, drop = true, caption, ...rest } = {}) {
  const k = r6(0.009 / n), nR = r6(n * GAS_R);
  const u0 = `((${V}) - 10)/7.5`, v0 = `((${T}) - 200)/50`;
  const z0 = `${k}*${nR}*(${T})/(${V})`;
  const su = `(-${k}*${nR}*(${T})/(${V})^2*7.5)`, sv = `(${k}*${nR}/(${V})*50)`;
  return {
    type: 'surface3d',
    params: {
      surface: ['u', 'v', `${k}*${nR}*(200 + 50*v)/(10 + 7.5*u)`], domain: [[0, 4], [0, 4]], n: 32,
      axisLen: 4.6, axisLabels: ['V', 'T', 'P'], target: [2, 2, 1.1], dist: 11.5, yaw: -0.9, pitch: 0.5, alpha: 0.7,
      curves: [
        // lifted a hair above the surface, so the flat facets between grid lines do not hide them
        { param: ['t', v0, `${k}*${nR}*(${T})/(10 + 7.5*t) + 0.02`], t: [0, 4], color: 'gold', width: 3 },
        { param: [u0, 't', `${k}*${nR}*(200 + 50*t)/(${V}) + 0.02`], t: [0, 4], color: 'violet', width: 3 },
        ...(tangents ? [
          { param: [`${u0} + t`, v0, `${z0} + ${su}*t + 0.05`], t: [-0.55, 0.55], color: 'ink', width: 2.2 },
          { param: [u0, `${v0} + t`, `${z0} + ${sv}*t + 0.05`], t: [-0.55, 0.55], color: 'ink', width: 2.2 },
        ] : []),
        ...(drop ? [{ param: [u0, v0, 't'], t: [0, z0], color: 'ink3', width: 1.2 }] : []),
      ],
      ...rest,
    },
    caption: caption || t`The ideal-gas surface $P = nRT/V$, with $V$ from 10 to 40 L and $T$ from 200 to 400 K. Gold: the isotherm through the point ($T$ fixed); violet: the isochore ($V$ fixed). Drag to rotate.`,
  };
}

/**
 * A camera yaw that looks at the face of the surface z = expr(x, y) at (a, b),
 * from the downhill side, so a tangent plane there is seen face-on rather than
 * edge-on. `turn` swings the view a little to keep it three-dimensional.
 */
export function faceYaw(expr, a, b, turn = 0.7) {
  const g = fn(expr, ['x', 'y']), h = 1e-4;
  const gx = (g({ x: a + h, y: b }) - g({ x: a - h, y: b })) / (2 * h), gy = (g({ x: a, y: b + h }) - g({ x: a, y: b - h })) / (2 * h);
  return Math.hypot(gx, gy) < 1e-9 ? -0.75 : r6(Math.atan2(-gy, -gx) + turn);
}

/**
 * z = f(X, Y) for physical quantities, drawn in a display box [0, 4] × [0, 4]:
 * X runs over xr, Y over yr, and heights zr = [lo, hi] map to 0…top. f is a
 * template (X, Y) => expression in the physical units. tangentAt: [X0, Y0]
 * (physical) draws the tangent plane there; the sim's own readouts are in
 * display units, so they are hidden.
 */
export function boxSurf(f, [x0, x1], [y0, y1], { zr, top = 3, labels = ['x', 'y', 'z'], tangentAt, caption = 'Drag to rotate.', ...rest } = {}) {
  const s = r6(top / (zr[1] - zr[0]));
  const X = (u) => `(${x0} + ${r6((x1 - x0) / 4)}*${u})`, Y = (v) => `(${y0} + ${r6((y1 - y0) / 4)}*${v})`;
  const z = `${s}*((${f(X('x'), Y('y'))}) - ${zr[0]})`;
  const tp = tangentAt && [r6((4 * (tangentAt[0] - x0)) / (x1 - x0)), r6((4 * (tangentAt[1] - y0)) / (y1 - y0))];
  return {
    type: 'surface3d',
    params: {
      z, domain: [[0, 4], [0, 4]], n: 32,
      axisLen: 4.6, axisLabels: labels, target: [2, 2, top / 2], dist: 11.5, yaw: tp ? faceYaw(z, tp[0], tp[1], -0.75) : -0.9, pitch: 0.5,
      ...(tp ? { tangentAt: tp, gradient: false, readouts: [], planeSize: 0.9 } : {}),
      ...rest,
    },
    caption,
  };
}

/** A straight path y = m x into the origin, as two rays that stop short of it. */
export const linePaths = (m, reach = 2, gap = 0.04, color = 'bad') => {
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
