// Shared builders for Advanced Math A, modules A5 (tensors) and A6 (the
// metric): small matrix algebra for generators, TeX for arrays, and still
// pictures on the ten-metric simulation. Course-local; not a lesson.

import { frac, nice } from '../../src/core/format.js';

const t = String.raw;

/** A number as TeX: integers plainly, short decimals as decimals, thirds and the like as fractions, else 4 significant figures. */
export const fr = (x) => {
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  if (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6) return nice(x);       // a short decimal stays a decimal
  const f = frac(x, 12);
  return f.includes('frac') ? f : nice(x);
};
/** A number for a canvas label or prose: integers plainly, else up to 4 significant figures; minus as −. */
export const plainNum = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : nice(x)).replace('-', '−');
export const r6 = (x) => +(+x).toFixed(6);

export const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.map(fr).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
export const vecTeX = (v) => `(${v.map(fr).join(',\\ ')})`;

// ── matrices as arrays of rows ────────────────────────────────────────────
export const transpose = (A) => A[0].map((_, j) => A.map((row) => row[j]));
export const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const mv = (A, v) => A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0));
export const dot = (u, v) => u.reduce((s, a, k) => s + a * v[k], 0);
/** Uᵘ T_μν Vᵛ. */
export const bil = (T, U, V) => dot(U, mv(T, V));
/** T'_μν = A^α_μ A^β_ν T_αβ = (AᵀTA)_μν: column j of A is the new basis vector e′_j. */
export const cong = (T, A) => mul(mul(transpose(A), T), A);
export const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
export const inv2 = (A) => { const d = det2(A); return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; };
export const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
export const trace = (A) => A.reduce((s, row, i) => s + row[i], 0);
export const symPart = (A) => A.map((row, i) => row.map((a, j) => (a + A[j][i]) / 2));
export const antiPart = (A) => A.map((row, i) => row.map((a, j) => (a - A[j][i]) / 2));
/** Columns of a 2×2 matrix as two vectors (for drawing a basis). */
export const cols = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];

/** A still ten-metric picture in form mode: nothing to drag, no numbers. */
export const form = (params, caption) => ({
  type: 'ten-metric',
  params: { mode: 'form', dragU: false, dragV: false, readout: false, levelLabels: false, crossings: false, ...params },
  caption,
});

/** A still ten-metric chart picture (no dragging, no numbers). */
export const chartPic = (params, caption) => ({
  type: 'ten-metric',
  params: { mode: 'chart', dragProbe: false, readout: false, ...params },
  caption,
});

/** The standard caption tail for a form picture. */
export const AXES_NOTE = 'Drawn on component axes: the paper’s own lengths and angles mean nothing here.';

export { t };
