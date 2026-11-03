// Dense linear algebra for small matrices (the sizes a learner explores):
// products, LU with partial pivoting, determinant, inverse, reduced row echelon
// form, rank and null space, QR, eigenvalues (real and complex) with
// eigenvectors, the symmetric Jacobi method, SVD, Gram–Schmidt, projections.

export type Mat = number[][];
export type Vec = number[];

export const zeros = (r: number, c: number): Mat => Array.from({ length: r }, () => new Array(c).fill(0));
export const identity = (n: number): Mat => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
export const transpose = (A: Mat): Mat => A[0].map((_, j) => A.map((r) => r[j]));
export const clone = (A: Mat): Mat => A.map((r) => r.slice());
export const matmul = (A: Mat, B: Mat): Mat => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
export const matvec = (A: Mat, x: Vec): Vec => A.map((r) => r.reduce((s, a, k) => s + a * x[k], 0));
export const dot = (a: Vec, b: Vec): number => a.reduce((s, v, i) => s + v * b[i], 0);
export const norm = (a: Vec): number => Math.sqrt(dot(a, a));
export const scale = (a: Vec, k: number): Vec => a.map((v) => v * k);
export const addv = (a: Vec, b: Vec): Vec => a.map((v, i) => v + b[i]);
export const subv = (a: Vec, b: Vec): Vec => a.map((v, i) => v - b[i]);
export const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

const EPS = 1e-10;

/** LU with partial pivoting: PA = LU. Returns null if singular. */
export function lu(A: Mat): { L: Mat; U: Mat; P: number[]; sign: number } | null {
  const n = A.length, U = clone(A), L = identity(n), P = [...Array(n).keys()];
  let sign = 1;
  for (let k = 0; k < n; k++) {
    let piv = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(U[i][k]) > Math.abs(U[piv][k])) piv = i;
    if (Math.abs(U[piv][k]) < EPS * Math.max(1, maxAbs(A))) return null;
    if (piv !== k) {
      [U[k], U[piv]] = [U[piv], U[k]]; [P[k], P[piv]] = [P[piv], P[k]]; sign = -sign;
      for (let j = 0; j < k; j++) [L[k][j], L[piv][j]] = [L[piv][j], L[k][j]];
    }
    for (let i = k + 1; i < n; i++) {
      const m = U[i][k] / U[k][k];
      L[i][k] = m;
      for (let j = k; j < n; j++) U[i][j] -= m * U[k][j];
    }
  }
  return { L, U, P, sign };
}

const maxAbs = (A: Mat) => Math.max(...A.flat().map(Math.abs), 0);

export function det(A: Mat): number {
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (n === 3) return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  const f = lu(A);
  if (!f) return 0;
  return f.sign * f.U.reduce((p, r, i) => p * r[i], 1);
}

export function solve(A: Mat, b: Vec): Vec | null {
  const f = lu(A);
  if (!f) return null;
  const n = A.length, y = new Array(n).fill(0), x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) { let s = b[f.P[i]]; for (let j = 0; j < i; j++) s -= f.L[i][j] * y[j]; y[i] = s; }
  for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let j = i + 1; j < n; j++) s -= f.U[i][j] * x[j]; x[i] = s / f.U[i][i]; }
  return x;
}

export function inverse(A: Mat): Mat | null {
  const n = A.length;
  const cols: Vec[] = [];
  for (let j = 0; j < n; j++) { const e = new Array(n).fill(0); e[j] = 1; const c = solve(A, e); if (!c) return null; cols.push(c); }
  return transpose(cols);
}

/** Reduced row echelon form with the pivot columns, recording each row operation for step-by-step display. */
export function rref(A: Mat, tol = 1e-10): { R: Mat; pivots: number[]; ops: string[] } {
  const R = clone(A), m = R.length, n = R[0].length, pivots: number[] = [], ops: string[] = [];
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let piv = row;
    for (let i = row + 1; i < m; i++) if (Math.abs(R[i][col]) > Math.abs(R[piv][col])) piv = i;
    if (Math.abs(R[piv][col]) < tol) continue;
    if (piv !== row) { [R[row], R[piv]] = [R[piv], R[row]]; ops.push(`R${row + 1} ↔ R${piv + 1}`); }
    const p = R[row][col];
    if (Math.abs(p - 1) > tol) { R[row] = R[row].map((v) => v / p); ops.push(`R${row + 1} ← R${row + 1} / ${fmt(p)}`); }
    for (let i = 0; i < m; i++) {
      if (i === row || Math.abs(R[i][col]) < tol) continue;
      const f = R[i][col];
      R[i] = R[i].map((v, j) => v - f * R[row][j]);
      ops.push(`R${i + 1} ← R${i + 1} − ${fmt(f)}·R${row + 1}`);
    }
    pivots.push(col);
    row++;
  }
  for (const r of R) for (let j = 0; j < n; j++) if (Math.abs(r[j]) < tol) r[j] = 0;
  return { R, pivots, ops };
}

const fmt = (v: number) => String(+v.toPrecision(6));

export const rank = (A: Mat): number => rref(A).pivots.length;

/** A basis for the null space {x : Ax = 0}. */
export function nullSpace(A: Mat): Vec[] {
  const { R, pivots } = rref(A);
  const n = A[0].length;
  const free = [...Array(n).keys()].filter((j) => !pivots.includes(j));
  return free.map((f) => {
    const v = new Array(n).fill(0);
    v[f] = 1;
    pivots.forEach((pc, i) => { v[pc] = -R[i][f]; });
    return v;
  });
}

/** Column space basis: the pivot columns of A. */
export function columnSpace(A: Mat): Vec[] {
  return rref(A).pivots.map((j) => A.map((r) => r[j]));
}

/** Gram–Schmidt (modified) on a list of vectors; drops dependent ones. */
export function gramSchmidt(vs: Vec[]): Vec[] {
  const out: Vec[] = [];
  for (const v of vs) {
    let w = v.slice();
    for (const q of out) w = subv(w, scale(q, dot(w, q)));
    const l = norm(w);
    if (l > 1e-10) out.push(scale(w, 1 / l));
  }
  return out;
}

/** Orthogonal projection of b onto the span of the columns of A (least squares). */
export function project(b: Vec, basis: Vec[]): Vec {
  const Q = gramSchmidt(basis);
  return Q.reduce((p, q) => addv(p, scale(q, dot(b, q))), new Array(b.length).fill(0));
}

/** QR by Householder reflections. */
export function qr(A: Mat): { Q: Mat; R: Mat } {
  const m = A.length, n = A[0].length;
  let Q = identity(m);
  const R = clone(A);
  for (let k = 0; k < Math.min(m - 1, n); k++) {
    const x = R.slice(k).map((r) => r[k]);
    const alpha = -Math.sign(x[0] || 1) * norm(x);
    const v = x.slice(); v[0] -= alpha;
    const vn = norm(v);
    if (vn < 1e-14) continue;
    for (let i = 0; i < v.length; i++) v[i] /= vn;
    for (let j = 0; j < n; j++) { let s = 0; for (let i = k; i < m; i++) s += v[i - k] * R[i][j]; for (let i = k; i < m; i++) R[i][j] -= 2 * v[i - k] * s; }
    for (let j = 0; j < m; j++) { let s = 0; for (let i = k; i < m; i++) s += v[i - k] * Q[j][i]; for (let i = k; i < m; i++) Q[j][i] -= 2 * v[i - k] * s; }
  }
  Q = Q.map((r) => r.slice());
  return { Q, R };
}

/** Eigen-decomposition of a real symmetric matrix by the cyclic Jacobi method: A = V diag(λ) Vᵀ. */
export function eigSymmetric(A: Mat): { values: Vec; vectors: Mat } {
  const n = A.length, a = clone(A), V = identity(n);
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off < 1e-24) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
  }
  const order = [...Array(n).keys()].sort((i, j) => a[j][j] - a[i][i]);
  return { values: order.map((i) => a[i][i]), vectors: order.map((i) => V.map((r) => r[i])) };
}

export interface Eigen { re: number; im: number; vector?: Vec }

/**
 * Eigenvalues of a general real matrix (unshifted→shifted QR on the Hessenberg form,
 * deflating 1×1 and 2×2 blocks), with real eigenvectors from the null space of A − λI.
 * Complex pairs are returned with their conjugate.
 */
export function eig(A: Mat): Eigen[] {
  const n = A.length;
  if (n === 2) {
    const tr = A[0][0] + A[1][1], dt = det(A), disc = tr * tr / 4 - dt;
    if (disc >= 0) return [tr / 2 + Math.sqrt(disc), tr / 2 - Math.sqrt(disc)].map((l) => ({ re: l, im: 0, vector: eigvec(A, l) }));
    return [{ re: tr / 2, im: Math.sqrt(-disc) }, { re: tr / 2, im: -Math.sqrt(-disc) }];
  }
  let H = clone(A);
  const out: Eigen[] = [];
  let m = n;
  for (let iter = 0; iter < 1000 * n && m > 0; iter++) {
    if (m === 1) { out.push({ re: H[0][0], im: 0 }); m = 0; break; }
    // deflate when a subdiagonal entry is negligible
    if (Math.abs(H[m - 1][m - 2]) < 1e-12 * (Math.abs(H[m - 1][m - 1]) + Math.abs(H[m - 2][m - 2]))) {
      out.push({ re: H[m - 1][m - 1], im: 0 });
      m--; H = H.slice(0, m).map((r) => r.slice(0, m)); continue;
    }
    if (m === 2 || Math.abs(H[m - 2][m - 3]) < 1e-12 * (Math.abs(H[m - 2][m - 2]) + Math.abs(H[m - 3][m - 3]))) {
      const a = H[m - 2][m - 2], b = H[m - 2][m - 1], c = H[m - 1][m - 2], d = H[m - 1][m - 1];
      const tr = a + d, dt = a * d - b * c, disc = tr * tr / 4 - dt;
      if (disc >= 0) out.push({ re: tr / 2 + Math.sqrt(disc), im: 0 }, { re: tr / 2 - Math.sqrt(disc), im: 0 });
      else out.push({ re: tr / 2, im: Math.sqrt(-disc) }, { re: tr / 2, im: -Math.sqrt(-disc) });
      m -= 2; H = H.slice(0, m).map((r) => r.slice(0, m)); continue;
    }
    const mu = H[m - 1][m - 1] + (iter % 11 === 10 ? 1e-3 * Math.random() : 0);   // shift; an occasional nudge breaks cycles
    const shifted = H.map((r, i) => r.map((v, j) => (i === j ? v - mu : v)));
    const { Q, R } = qr(shifted);
    H = matmul(R, Q).map((r, i) => r.map((v, j) => (i === j ? v + mu : v)));
  }
  return out.sort((x, y) => y.re - x.re || y.im - x.im).map((e) => (e.im === 0 ? { ...e, vector: eigvec(A, e.re) } : e));
}

/** A unit eigenvector for a real eigenvalue λ (the null space of A − λI, with a tolerance). */
export function eigvec(A: Mat, lambda: number): Vec | undefined {
  const n = A.length;
  const M = A.map((r, i) => r.map((v, j) => (i === j ? v - lambda : v)));
  for (const tol of [1e-10, 1e-8, 1e-6]) {
    const { R, pivots } = rref(M, tol * Math.max(1, maxAbs(A)));
    const free = [...Array(n).keys()].find((j) => !pivots.includes(j));
    if (free === undefined) continue;
    const v = new Array(n).fill(0); v[free] = 1;
    pivots.forEach((pc, i) => { v[pc] = -R[i][free]; });
    const l = norm(v);
    return v.map((x) => x / l);
  }
  return undefined;
}

/** Singular value decomposition A = U Σ Vᵀ (via the symmetric eigenproblem of AᵀA; fine for small, well-scaled matrices). */
export function svd(A: Mat): { U: Mat; S: Vec; V: Mat } {
  const m = A.length, n = A[0].length;
  const { values, vectors } = eigSymmetric(matmul(transpose(A), A));
  const S = values.map((l) => Math.sqrt(Math.max(0, l)));
  const V = transpose(vectors);                              // columns are right singular vectors
  const Ucols: Vec[] = [];
  for (let k = 0; k < Math.min(m, n); k++) {
    if (S[k] > 1e-12) Ucols.push(scale(matvec(A, vectors[k]), 1 / S[k]));
  }
  // complete U to an orthonormal basis
  const basis = gramSchmidt([...Ucols, ...identity(m)]);
  const U = transpose(basis.slice(0, m));
  return { U, S: S.slice(0, Math.min(m, n)), V };
}
