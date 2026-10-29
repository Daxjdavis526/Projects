// A vector, a covector and a basis on a featureless plane — the algebra behind
// the ten-basis simulation. Positions are given in "paper" coordinates (the
// screen's own x, y) only so that something can be drawn; nothing here uses
// the paper's lengths or angles except len(), which the sim shows only when
// asked to compare a true length with a naive one.
//
//   a basis      [e1, e2], each a paper vector [x, y]
//   components   V = V¹e₁ + V²e₂            comps(basis, v) → [V¹, V²]
//   a covector   ω(x, y) = a x + b y, stored as its row [a, b]
//   components   ω = ω₁e¹ + ω₂e²,  ωᵢ = ω(eᵢ)   covComps(basis, row) → [ω₁, ω₂]
//   dual basis   eⁱ(eⱼ) = δⁱⱼ: the rows of E⁻¹, where E has columns e₁, e₂
//
// DOM-free; tested in test/ten-basis.test.mjs.

export const det = ([e1, e2]) => e1[0] * e2[1] - e2[0] * e1[1];

/** V¹e₁ + V²e₂, as a paper vector. */
export const combine = ([e1, e2], [c1, c2]) => [c1 * e1[0] + c2 * e2[0], c1 * e1[1] + c2 * e2[1]];

/** The components (V¹, V²) of the paper vector v in the basis (Cramer's rule); NaN if the basis is degenerate. */
export function comps(basis, v) {
  const d = det(basis);
  if (Math.abs(d) < 1e-12) return [NaN, NaN];
  const [e1, e2] = basis;
  return [(v[0] * e2[1] - e2[0] * v[1]) / d, (e1[0] * v[1] - v[0] * e1[1]) / d];
}

/** The dual basis [e¹, e²] as covector rows: the rows of E⁻¹. */
export function dual(basis) {
  const d = det(basis);
  if (Math.abs(d) < 1e-12) return [[NaN, NaN], [NaN, NaN]];
  const [e1, e2] = basis;
  return [[e2[1] / d, -e2[0] / d], [-e1[1] / d, e1[0] / d]];
}

/** ω(v) for a covector row and a paper vector. */
export const pair = (row, v) => row[0] * v[0] + row[1] * v[1];

/** The covector's components ωᵢ = ω(eᵢ). */
export const covComps = (basis, row) => basis.map((e) => pair(row, e));

/** The covector ω₁e¹ + ω₂e² as a row. */
export function covFromComps(basis, [w1, w2]) {
  const [d1, d2] = dual(basis);
  return [w1 * d1[0] + w2 * d2[0], w1 * d1[1] + w2 * d2[1]];
}

/** A basis turned through φ radians (anticlockwise). */
export const rotate = (basis, phi) => basis.map(([x, y]) => [x * Math.cos(phi) - y * Math.sin(phi), x * Math.sin(phi) + y * Math.cos(phi)]);

/**
 * The change-of-basis matrix A with e′ⱼ = Aⁱⱼ eᵢ: column j holds the old
 * components of the new basis vector e′ⱼ. Rows i, columns j.
 */
export function changeMatrix(oldB, newB) {
  const c1 = comps(oldB, newB[0]), c2 = comps(oldB, newB[1]);
  return [[c1[0], c2[0]], [c1[1], c2[1]]];
}

export function inv2(A) {
  const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (Math.abs(d) < 1e-12) return null;
  return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
}

/** The paper length — the one quantity that needs the paper's metric. */
export const len = (v) => Math.hypot(v[0], v[1]);

/** The integer levels k of the line a x + b y = k·step that cross the window [x0, x1] × [y0, y1]. */
export function levelsIn(row, [x0, x1], [y0, y1], step = 1) {
  const vals = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map((p) => pair(row, p) / step);
  const lo = Math.ceil(Math.min(...vals) - 1e-9), hi = Math.floor(Math.max(...vals) + 1e-9);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi - lo > 400) return [];
  const out = [];
  for (let k = lo; k <= hi; k++) out.push(k);
  return out;
}

/** The part of the line a x + b y = c inside the window, as two end points (or null). */
export function clipLine(row, c, [x0, x1], [y0, y1]) {
  const [a, b] = row;
  const pts = [];
  const push = (x, y) => { if (x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9 && !pts.some((p) => Math.hypot(p[0] - x, p[1] - y) < 1e-9)) pts.push([x, y]); };
  if (Math.abs(b) > 1e-12) { push(x0, (c - a * x0) / b); push(x1, (c - a * x1) / b); }
  if (Math.abs(a) > 1e-12) { push((c - b * y0) / a, y0); push((c - b * y1) / a, y1); }
  return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
}

/**
 * The levels a displacement from `tail` to `tip` crosses, in the order it
 * meets them: every k·step strictly past the tail's level and up to (and
 * including) the tip's. Their signed count is ω(tip − tail) rounded toward zero.
 */
export function crossed(row, tail, tip, step = 1) {
  const a = pair(row, tail) / step, b = pair(row, tip) / step, out = [];
  if (b > a) for (let k = Math.floor(a + 1e-9) + 1; k <= b + 1e-9; k++) out.push(k);
  else for (let k = Math.ceil(a - 1e-9) - 1; k >= b - 1e-9; k--) out.push(k);
  return out;
}
