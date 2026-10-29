// The geometry behind sims/la-det.js, DOM-free and tested headlessly
// (test/la-det.test.mjs): the signed area of the parallelogram two columns
// span, the turning arc from a₁ to a₂ that shows its sign, the classic
// “box minus six pieces” picture of ad − bc, and Cramer's rule read as a
// ratio of two parallelograms' areas.

/** det [a₁ a₂] = a₁ₓa₂ᵧ − a₂ₓa₁ᵧ: the signed area of the parallelogram on a₁ and a₂. */
export const det = (a1, a2) => a1[0] * a2[1] - a2[0] * a1[1];

/** The shoelace formula: the signed area of a polygon (counterclockwise positive). */
export function polyArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    s += x0 * y1 - x1 * y0;
  }
  return s / 2;
}

/** The parallelogram 0, a₁, a₁ + a₂, a₂ as a list of corners. */
export const parallelogram = (a1, a2, at = [0, 0]) => [at, [at[0] + a1[0], at[1] + a1[1]], [at[0] + a1[0] + a2[0], at[1] + a1[1] + a2[1]], [at[0] + a2[0], at[1] + a2[1]]];

/**
 * The turn from a₁ to a₂ the short way round: { from, sweep } in radians,
 * sweep in (−π, π], positive counterclockwise — its sign is the sign of the
 * determinant. null if either column is (nearly) zero.
 */
export function orientArc(a1, a2, eps = 1e-12) {
  const n1 = Math.hypot(...a1), n2 = Math.hypot(...a2);
  if (!(n1 > eps && n2 > eps)) return null;
  const from = Math.atan2(a1[1], a1[0]);
  // atan2(cross, dot) is the signed angle from a₁ to a₂, in (−π, π]
  const sweep = Math.atan2(det(a1, a2), a1[0] * a2[0] + a1[1] * a2[1]);
  return { from, sweep };
}

/**
 * The picture proof that the area is ad − bc, for columns a₁ = (a, c) and
 * a₂ = (b, d) with a, b, c, d ≥ 0 and ad > bc: the box (a + b) × (c + d)
 * minus two triangles of area ac/2, two of area bd/2 and two rectangles of
 * area bc. Returns { box, pieces: [{ pts, area, kind }] } or null when the
 * columns are not in that arrangement.
 */
export function proofPieces(a1, a2) {
  const [a, c] = a1, [b, d] = a2;
  if (!(a >= 0 && b >= 0 && c >= 0 && d >= 0) || !(a * d - b * c > 0)) return null;
  const W = a + b, H = c + d;
  const pieces = [
    { kind: 'triangle', pts: [[0, 0], [a, 0], [a, c]] },
    { kind: 'rect', pts: [[a, 0], [W, 0], [W, c], [a, c]] },
    { kind: 'triangle', pts: [[a, c], [W, c], [W, H]] },
    { kind: 'triangle', pts: [[b, d], [W, H], [b, H]] },
    { kind: 'rect', pts: [[0, d], [b, d], [b, H], [0, H]] },
    { kind: 'triangle', pts: [[0, 0], [b, d], [0, d]] },
  ].map((p) => ({ ...p, area: Math.abs(polyArea(p.pts)) }));
  return { box: [[0, 0], [W, 0], [W, H], [0, H]], W, H, pieces };
}

/**
 * Cramer's rule for [a₁ a₂] x = b: x_k = det(A with column k replaced by b) / det A.
 * Geometrically, b = x₁a₁ + x₂a₂, and sliding b along a₂ (a shear, which keeps
 * area) takes the parallelogram (b, a₂) to (x₁a₁, a₂) — so its area is x₁
 * times the area of (a₁, a₂). Returns { D, D1, D2, x: [x₁, x₂] } or null if det A = 0.
 */
export function cramer(a1, a2, b, eps = 1e-12) {
  const D = det(a1, a2), D1 = det(b, a2), D2 = det(a1, b);
  const scale = Math.max(Math.hypot(...a1), Math.hypot(...a2), 1e-300);
  if (Math.abs(D) <= eps * scale * scale) return null;
  return { D, D1, D2, x: [D1 / D, D2 / D] };
}

/** A window centred on the given points: { centre, half } with half the half-height, for a canvas `across` times as wide as tall. */
export function frame(points, across = 2, pad = 1.18) {
  const xs = [0, ...points.map((p) => p[0])], ys = [0, ...points.map((p) => p[1])];
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const half = Math.max((y1 - y0) / 2, (x1 - x0) / (2 * across), 1) * pad + 0.35;
  return { centre: [(x0 + x1) / 2, (y0 + y1) / 2], half };
}
