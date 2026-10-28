// The four fundamental subspaces of a matrix, exactly — DOM-free, tested
// headlessly (test/la-subspaces.test.mjs). For an m×n matrix A of rank r:
//   column space C(A)     ⊆ ℝᵐ, dim r     — basis: the pivot columns of A (not of its RREF)
//   null space N(A)       ⊆ ℝⁿ, dim n − r — basis: the special solutions, one per free column
//   row space C(Aᵀ)       ⊆ ℝⁿ, dim r     — basis: the nonzero rows of the RREF
//   left null space N(Aᵀ) ⊆ ℝᵐ, dim m − r — basis: the special solutions of Aᵀy = 0
// The row space is perpendicular to the null space and the column space to
// the left null space. split() breaks an input x into its row-space and
// null-space parts, x = x_r + x_n (floats), for the sim's picture.

import * as Q from './la-linear.js';

/** Rationals from numbers, 'p/q' strings or [n, d] pairs. */
const toQ = (M) => M.map((row) => row.map((v) => (Array.isArray(v) ? Q.Q(v[0], v[1]) : Q.qparse(v))));
const transposeQ = (A) => A[0].map((_, j) => A.map((row) => row[j]));

/**
 * Bases of the four subspaces (exact rationals [n, d]) and the counts.
 * Returns { m, n, rank, R, pivotCols, freeCols, col, null, row, left }; each
 * basis is a list of vectors (an empty list is the zero subspace).
 */
export function fourSubspaces(M) {
  const A = toQ(M), m = A.length, n = A[0].length;
  const s = Q.solutionSet(A, n);
  const t = Q.solutionSet(transposeQ(A), m);
  return {
    m, n, rank: s.rank, R: s.R, pivotCols: s.pivotCols, freeCols: s.freeCols,
    col: s.pivotCols.map((c) => A.map((row) => row[c])),
    null: s.directions,
    row: s.R.slice(0, s.rank).map((row) => row.slice()),
    left: t.directions,
  };
}

/** The dimensions only, from the shape and the rank. */
export const dims = (m, n, r) => ({ col: r, row: r, null: n - r, left: m - r });

/** Every vector of a basis as plain numbers. */
export const numbers = (basis) => basis.map((v) => v.map(Q.qval));

/** Exact product A·v (rationals), for checks. */
export const qapply = (A, v) => A.map((row) => row.reduce((s, a, k) => Q.qadd(s, Q.qmul(a, v[k])), Q.ZERO));

/** An orthonormal basis (floats) of the span of some vectors, by Gram–Schmidt. */
export function orthonormal(vectors, eps = 1e-10) {
  const out = [];
  for (const v0 of vectors) {
    let v = v0.slice();
    for (const q of out) { const c = Q.dotN(v, q); v = v.map((x, k) => x - c * q[k]); }
    const len = Q.normN(v);
    if (len > eps) out.push(v.map((x) => x / len));
  }
  return out;
}

/**
 * x = x_r + x_n: x_r in the row space (the orthogonal projection of x onto
 * it) and x_n = x − x_r in the null space. Also Ax, which equals A x_r.
 */
export function split(M, x) {
  const S = fourSubspaces(M), A = toQ(M).map((row) => row.map(Q.qval));
  const basis = orthonormal(numbers(S.row));
  const xr = Array(x.length).fill(0);
  for (const q of basis) { const c = Q.dotN(x, q); q.forEach((v, k) => { xr[k] += c * v; }); }
  const xn = x.map((v, k) => v - xr[k]);
  const Ax = A.map((row) => Q.dotN(row, x));
  return { xr, xn, Ax };
}

/** A basis as TeX: { [col] [col] } or {0}. */
export function basisTeX(basis) {
  if (!basis.length) return '\\{\\mathbf 0\\}';
  return `\\left\\{ ${basis.map((v) => `\\begin{bmatrix} ${v.map((q) => Q.qtex(q)).join(' \\\\ ')} \\end{bmatrix}`).join(',\\ ')} \\right\\}`;
}
