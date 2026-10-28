// Shared helpers for the vector-calculus lessons (C3-5): static pictures of
// plane vector fields on the graph sim (a grid of arrows, compressed and
// coloured by strength as field2d draws them), paths with arrowheads showing
// their direction, and small numerical tools (fields as functions, line
// integrals) for checking answer keys. Files whose names start with "_" are
// helpers, not lessons.

import { fn } from '../../src/viz/model/exprfn.js';

/** Round for an expression string or a picture, so a parameter never carries 17 digits. */
export const r6 = (v) => +(+v).toPrecision(6);

/** c·v as TeX with the coefficient tidied: (1, 't') → 't', (−1, 't') → '-t', (2.5, 't') → '2.5t'. */
export const co = (c, v) => (c === 1 ? v : c === -1 ? `-${v}` : `${+(+c).toPrecision(6)}${v}`);

/** A field given as expression strings (or functions) → (x, y) => [P, Q]. */
export function fieldFn(P, Q) {
  const p = typeof P === 'function' ? P : ((g) => (x, y) => g({ x, y }))(fn(P, ['x', 'y']));
  const q = typeof Q === 'function' ? Q : ((g) => (x, y) => g({ x, y }))(fn(Q, ['x', 'y']));
  return (x, y) => [p(x, y), q(x, y)];
}

/** The field2d colour for strength t ∈ [0, 1]: blue when weak, gold when strong. */
export const strength = (t, a = 0.85) => `rgba(${Math.round(92 + 150 * t)},${Math.round(157 + 36 * t)},${Math.round(255 - 177 * t)},${a})`;

/**
 * Arrows of the field (P, Q) on a grid covering x × y (n across), for the
 * graph sim. Lengths are compressed — weak arrows are drawn at least a third
 * as long as the strongest — unless toScale is a number: then an arrow is
 * that many units long per unit of field. skip(x, y) leaves a point out.
 */
export function fieldArrows(P, Q, { x = [-3, 3], y = [-2, 2], n = 11, toScale = null, skip = null, alpha = 0.85, width = 1.5 } = {}) {
  const F = fieldFn(P, Q);
  const dx = (x[1] - x[0]) / n, rows = Math.max(1, Math.round((y[1] - y[0]) / dx)), dy = (y[1] - y[0]) / rows;
  const pts = [];
  let maxM = 1e-12;
  for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) {
    const px = x[0] + (i + 0.5) * dx, py = y[0] + (j + 0.5) * dy;
    if (skip && skip(px, py)) continue;
    const [u, v] = F(px, py), m = Math.hypot(u, v);
    if (!Number.isFinite(m) || m < 1e-12) continue;
    pts.push([px, py, u, v, m]); maxM = Math.max(maxM, m);
  }
  const len = 0.8 * Math.min(dx, dy);
  return pts.map(([px, py, u, v, m]) => {
    const s = toScale ? toScale : (len * (0.35 + 0.65 * Math.min(1, m / maxM))) / m;
    return { from: [r6(px - (u * s) / 2), r6(py - (v * s) / 2)], to: [r6(px + (u * s) / 2), r6(py + (v * s) / 2)], color: strength(Math.min(1, m / maxM), alpha), width };
  });
}

/**
 * A static picture of a plane vector field on the graph sim, with optional
 * curves, points, shading and extra arrows (drawn over the field). The window
 * should have about the canvas's own proportions (2.1 : 1 for 'wide', 1.6 : 1
 * by default) so the field fills it.
 */
export function fieldPic(P, Q, { x = [-3.2, 3.2], y = [-1.55, 1.55], n = 15, toScale = null, skip = null, curves = [], points = [], arrows = [], shade = [], caption, aspect = 'wide', fieldAlpha = 0.85, ...rest } = {}) {
  return {
    type: 'graph',
    params: {
      x, y, equal: true, aspect, ...rest,
      shade, curves, points,
      arrows: [...fieldArrows(P, Q, { x, y, n, toScale, skip, alpha: fieldAlpha }), ...arrows],
    },
    caption,
  };
}

/**
 * A path for the graph sim — the curve (x(t), y(t)) — with arrowheads at the
 * given fractions of the way showing its direction. Returns { curve, arrows }.
 */
export function path(X, Y, [t0, t1], { color = 'gold', width = 3, at = [0.5], label, labelAt, labelDx, labelDy, dash } = {}) {
  const fx = fn(X, ['t']), fy = fn(Y, ['t']);
  const P = (t) => [fx({ t }), fy({ t })];
  const arrows = at.map((f) => {
    const t = t0 + (t1 - t0) * f, dt = (t1 - t0) * 0.035;
    const a = P(t - dt), b = P(t + dt);
    return { from: [r6(a[0]), r6(a[1])], to: [r6(b[0]), r6(b[1])], color, width };
  });
  const curve = { param: [String(X), String(Y)], t: [t0, t1], color, width, ...(dash ? { dash: true } : {}), ...(label ? { label, labelAt: labelAt ?? t0 + 0.6 * (t1 - t0), labelDx, labelDy } : {}) };
  return { curve, arrows };
}

/** Merge several paths' curves and arrows into graph params. */
export const paths = (...ps) => ({ curves: ps.map((p) => p.curve), arrows: ps.flatMap((p) => p.arrows) });
