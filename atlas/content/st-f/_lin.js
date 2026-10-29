// Helpers for the Numerical Methods lessons F5–F8 (quadrature, numerical
// linear algebra, eigenvalue methods, least squares and the SVD): the
// routines whose numbers those lessons print, written plainly in JavaScript's
// doubles — the same IEEE 754 binary64 arithmetic as NumPy, though not the
// same order of operations as LAPACK, so lessons quote round-off-sized
// quantities as orders of magnitude only.

// ── quadrature ────────────────────────────────────────────────────────
export { trap, simpson } from '../prog/_numkit.js';

/** Composite midpoint rule with n panels. */
export function midpoint(f, a, b, n) {
  const h = (b - a) / n;
  let s = 0;
  for (let k = 0; k < n; k++) s += f(a + (k + 0.5) * h);
  return h * s;
}

/** Legendre polynomial Pₙ(x) and its derivative, by the three-term recurrence. */
export function legendre(n, x) {
  let p0 = 1, p1 = x;
  if (n === 0) return [1, 0];
  for (let k = 2; k <= n; k++) [p0, p1] = [p1, ((2 * k - 1) * x * p1 - (k - 1) * p0) / k];
  return [p1, (n * (x * p1 - p0)) / (x * x - 1)];
}

/** Gauss–Legendre nodes (ascending) and weights on [−1, 1], by Newton's method on Pₙ. */
export function gaussLegendre(n) {
  const x = [], w = [];
  for (let i = 0; i < n; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5));
    for (let it = 0; it < 100; it++) {
      const [p, dp] = legendre(n, z);
      const dz = p / dp;
      z -= dz;
      if (Math.abs(dz) < 1e-16) break;
    }
    const [, dp] = legendre(n, z);
    x.push(-z); w.push(2 / ((1 - z * z) * dp * dp));
  }
  return { x, w };
}

/** n-point Gauss–Legendre on [a, b] (one panel). */
export function gauss(f, a, b, n) {
  const { x, w } = gaussLegendre(n), c = (a + b) / 2, h = (b - a) / 2;
  let s = 0;
  for (let i = 0; i < n; i++) s += w[i] * f(c + h * x[i]);
  return h * s;
}

/**
 * Adaptive Simpson (the classic recursion): accept a panel when
 * |S(left) + S(right) − S(whole)| ≤ 15 tol, returning S(left) + S(right) +
 * the Richardson correction (difference)/15; the tolerance is halved for
 * each half. Returns the value, the accepted panels [a, b] and the number of
 * function evaluations.
 */
export function adaptiveSimpson(f, a, b, tol, maxDepth = 50) {
  let evals = 0;
  const F = (x) => { evals++; return f(x); };
  const panels = [];
  const S = (a, b, fa, fm, fb) => ((b - a) / 6) * (fa + 4 * fm + fb);
  function rec(a, b, fa, fm, fb, whole, tol, depth) {
    const m = (a + b) / 2, lm = (a + m) / 2, rm = (m + b) / 2;
    const flm = F(lm), frm = F(rm);
    const left = S(a, m, fa, flm, fm), right = S(m, b, fm, frm, fb);
    const d = left + right - whole;
    if (depth <= 0 || Math.abs(d) <= 15 * tol) { panels.push([a, b]); return left + right + d / 15; }
    return rec(a, m, fa, flm, fm, left, tol / 2, depth - 1) + rec(m, b, fm, frm, fb, right, tol / 2, depth - 1);
  }
  const fa = F(a), fb = F(b), fm = F((a + b) / 2);
  const value = rec(a, b, fa, fm, fb, S(a, b, fa, fm, fb), tol, maxDepth);
  return { value, panels, evals };
}

// ── small dense matrices (arrays of rows) ─────────────────────────────
export const zeros = (m, n) => Array.from({ length: m }, () => Array(n).fill(0));
export const eye = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => +(i === j)));
export const T = (A) => A[0].map((_, j) => A.map((r) => r[j]));
export const mm = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
export const mv = (A, v) => A.map((r) => r.reduce((s, x, k) => s + x * v[k], 0));
export const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
export const nrm = (v) => Math.hypot(...v);
export const maxAbs = (A) => Math.max(...A.flat().map(Math.abs));

/** LU without row exchanges (Doolittle): L unit lower, U upper. */
export function luNoPivot(A0) {
  const n = A0.length, U = A0.map((r) => [...r]), L = eye(n);
  for (let k = 0; k < n; k++) for (let i = k + 1; i < n; i++) {
    const l = U[i][k] / U[k][k];
    L[i][k] = l;
    for (let j = k; j < n; j++) U[i][j] -= l * U[k][j];
    U[i][k] = 0;
  }
  return { L, U };
}
/** LU with partial pivoting: PA = LU, perm[i] = the original row now in row i. */
export function luPivot(A0) {
  const n = A0.length, U = A0.map((r) => [...r]), L = zeros(n, n), perm = A0.map((_, i) => i);
  let swaps = 0;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(U[i][k]) > Math.abs(U[p][k])) p = i;
    if (p !== k) { [U[k], U[p]] = [U[p], U[k]]; [L[k], L[p]] = [L[p], L[k]]; [perm[k], perm[p]] = [perm[p], perm[k]]; swaps++; }
    L[k][k] = 1;
    for (let i = k + 1; i < n; i++) {
      const l = U[i][k] / U[k][k];
      L[i][k] = l;
      for (let j = k; j < n; j++) U[i][j] -= l * U[k][j];
      U[i][k] = 0;
    }
  }
  return { L, U, perm, swaps };
}
export const forwardSub = (L, b) => { const y = []; for (let i = 0; i < b.length; i++) { let s = b[i]; for (let j = 0; j < i; j++) s -= L[i][j] * y[j]; y.push(s / L[i][i]); } return y; };
export const backSub = (U, y) => { const n = y.length, x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let j = i + 1; j < n; j++) s -= U[i][j] * x[j]; x[i] = s / U[i][i]; } return x; };
/** Growth factor max|uᵢⱼ| / max|aᵢⱼ|. */
export const growth = (A, U) => maxAbs(U) / maxAbs(A);

/** Cholesky A = L Lᵀ (L lower); throws if a pivot is not positive. */
export function cholesky(A) {
  const n = A.length, L = zeros(n, n);
  for (let j = 0; j < n; j++) {
    let d = A[j][j];
    for (let k = 0; k < j; k++) d -= L[j][k] ** 2;
    if (!(d > 0)) throw new Error(`not positive definite at column ${j + 1} (pivot ${d})`);
    L[j][j] = Math.sqrt(d);
    for (let i = j + 1; i < n; i++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      L[i][j] = s / L[j][j];
    }
  }
  return L;
}

/** Householder QR of an m×n matrix (m ≥ n): full Q (m×m) and R (m×n). */
export function qrHouseholder(A0) {
  const m = A0.length, n = A0[0].length, R = A0.map((r) => [...r]);
  let Q = eye(m);
  for (let k = 0; k < Math.min(n, m - 1); k++) {
    const x = R.slice(k).map((r) => r[k]);
    const a = nrm(x);
    if (a === 0) continue;
    const v = [...x];
    v[0] += (x[0] >= 0 ? 1 : -1) * a;
    const vv = dot(v, v);
    if (vv === 0) continue;
    for (let j = 0; j < n; j++) { let s = 0; for (let i = k; i < m; i++) s += v[i - k] * R[i][j]; s = (2 * s) / vv; for (let i = k; i < m; i++) R[i][j] -= s * v[i - k]; }
    for (let i = 0; i < m; i++) { let s = 0; for (let l = k; l < m; l++) s += Q[i][l] * v[l - k]; s = (2 * s) / vv; for (let l = k; l < m; l++) Q[i][l] -= s * v[l - k]; }
  }
  return { Q, R };
}
/** Classical and modified Gram–Schmidt: Q (m×n) with orthonormal columns. */
export function gramSchmidt(A, modified = false) {
  const m = A.length, n = A[0].length, Q = zeros(m, n), R = zeros(n, n);
  for (let j = 0; j < n; j++) {
    const v = A.map((r) => r[j]);
    for (let i = 0; i < j; i++) {
      const qi = Q.map((r) => r[i]);
      R[i][j] = dot(qi, modified ? v : A.map((r) => r[j]));
      for (let k = 0; k < m; k++) v[k] -= R[i][j] * qi[k];
    }
    R[j][j] = nrm(v);
    for (let k = 0; k < m; k++) Q[k][j] = v[k] / R[j][j];
  }
  return { Q, R };
}
/** ‖QᵀQ − I‖ (max entry): the loss of orthogonality. */
export const orthoLoss = (Q) => { const G = mm(T(Q), Q); return Math.max(...G.flatMap((r, i) => r.map((x, j) => Math.abs(x - (i === j ? 1 : 0))))); };

/**
 * Singular values (descending) of an m×n matrix, with U and V, by one-sided
 * Jacobi rotations on the columns: accurate to high relative precision even
 * for the small ones, which is what condition numbers need.
 */
export function svdJacobi(A0, sweeps = 80) {
  const m = A0.length, n = A0[0].length, A = A0.map((r) => [...r]), V = eye(n);
  for (let s = 0; s < sweeps; s++) {
    let off = 0;
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      let al = 0, be = 0, ga = 0;
      for (let i = 0; i < m; i++) { al += A[i][p] ** 2; be += A[i][q] ** 2; ga += A[i][p] * A[i][q]; }
      if (ga === 0) continue;
      const c0 = Math.abs(ga) / Math.sqrt(al * be);
      off = Math.max(off, c0);
      if (c0 < 1e-15) continue;
      const z = (be - al) / (2 * ga), t = Math.sign(z || 1) / (Math.abs(z) + Math.sqrt(1 + z * z)), c = 1 / Math.sqrt(1 + t * t), sn = c * t;
      for (let i = 0; i < m; i++) { const x = A[i][p], y = A[i][q]; A[i][p] = c * x - sn * y; A[i][q] = sn * x + c * y; }
      for (let i = 0; i < n; i++) { const x = V[i][p], y = V[i][q]; V[i][p] = c * x - sn * y; V[i][q] = sn * x + c * y; }
    }
    if (off < 1e-15) break;
  }
  const sv = Array.from({ length: n }, (_, j) => Math.sqrt(A.reduce((s, r) => s + r[j] ** 2, 0)));
  const idx = sv.map((_, j) => j).sort((i, j) => sv[j] - sv[i]);
  const s = idx.map((j) => sv[j]);
  const U = A.map((r) => idx.map((j) => (sv[j] > 0 ? r[j] / sv[j] : 0)));
  return { s, U, V: V.map((r) => idx.map((j) => r[j])) };
}
export const cond2 = (A) => { const { s } = svdJacobi(A); return s[0] / s[s.length - 1]; };

/** Vandermonde matrix [tᵢʲ], j = 0 … d. */
export const vander = (ts, d) => ts.map((t) => Array.from({ length: d + 1 }, (_, j) => t ** j));

/** Least squares by the normal equations (Cholesky of AᵀA) and by Householder QR. */
export function lsqNormal(A, b) {
  const At = T(A), G = mm(At, A), c = mv(At, b), L = cholesky(G);
  return backSub(T(L), forwardSub(L, c));
}
export function lsqQR(A, b) {
  const n = A[0].length, { Q, R } = qrHouseholder(A), qb = mv(T(Q), b);
  return backSub(R.slice(0, n).map((r) => r.slice(0, n)), qb.slice(0, n));
}

// ── eigenvalues ───────────────────────────────────────────────────────
/** Power iteration from x0: the normalized iterates and Rayleigh quotients. */
export function power(A, x0, n) {
  let x = x0.map((v) => v / nrm(x0));
  const xs = [x], rq = [dot(x, mv(A, x))];
  for (let k = 0; k < n; k++) {
    const y = mv(A, x), s = nrm(y);
    x = y.map((v) => v / s);
    xs.push(x); rq.push(dot(x, mv(A, x)));
  }
  return { xs, rq };
}
/** The angle between two directions (radians, 0 … π/2). */
export const angle = (u, v) => Math.acos(Math.min(1, Math.abs(dot(u, v)) / (nrm(u) * nrm(v))));

/**
 * The QR algorithm on a symmetric matrix: A ← RQ (+ μI) after factoring
 * A − μI = QR. shift: 'none' | 'rayleigh' (μ = the last diagonal entry) |
 * 'wilkinson'. Returns every iterate.
 */
export function qrIterate(A0, steps, shift = 'none') {
  const n = A0.length;
  let A = A0.map((r) => [...r]);
  const hist = [A];
  for (let k = 0; k < steps; k++) {
    let mu = 0;
    if (shift === 'rayleigh') mu = A[n - 1][n - 1];
    if (shift === 'wilkinson') {
      const a = A[n - 2][n - 2], b = A[n - 1][n - 2], c = A[n - 1][n - 1], d = (a - c) / 2;
      mu = b === 0 ? c : c - (Math.sign(d || 1) * b * b) / (Math.abs(d) + Math.hypot(d, b));
    }
    const S = A.map((r, i) => r.map((x, j) => x - (i === j ? mu : 0)));
    const { Q, R } = qrHouseholder(S);
    A = mm(R, Q).map((r, i) => r.map((x, j) => x + (i === j ? mu : 0)));
    hist.push(A);
  }
  return hist;
}
