// Small exact-ish matrix helpers for the st-g symmetry lessons (G-GRP,
// G-LIEG, G-LIEA, G-SYM, G-COV): products, commutators, the matrix
// exponential, the Minkowski metric, boosts, rotations, the real Lorentz
// generators and the Thomas–Wigner angle of two composed boosts. Pure
// functions on arrays of rows, no DOM. Every number the lessons print about
// these groups is computed here.

export const r6 = (v) => +(+v).toPrecision(6);
export const eye = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
export const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const add = (A, B) => A.map((row, i) => row.map((a, j) => a + B[i][j]));
export const sub = (A, B) => A.map((row, i) => row.map((a, j) => a - B[i][j]));
export const scale = (c, A) => A.map((row) => row.map((a) => c * a));
export const T = (A) => A[0].map((_, j) => A.map((row) => row[j]));
export const comm = (A, B) => sub(mul(A, B), mul(B, A));
export const close = (A, B, tol = 1e-9) => A.every((row, i) => row.every((a, j) => Math.abs(a - B[i][j]) < tol));
export const apply = (A, v) => A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0));
export const trace = (A) => A.reduce((s, row, i) => s + row[i], 0);

/** Determinant by Gaussian elimination with partial pivoting. */
export function det(A) {
  const M = A.map((r) => r.slice()), n = M.length;
  let d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) return 0;
    if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; d = -d; }
    d *= M[c][c];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k < n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return d;
}

/** exp(A) by scaling and squaring with a Taylor series (fine for the small matrices here). */
export function expm(A) {
  const n = A.length;
  const norm = Math.max(...A.map((r) => r.reduce((s, a) => s + Math.abs(a), 0)));
  const s = Math.max(0, Math.ceil(Math.log2(norm || 1)) + 1);
  const B = scale(2 ** -s, A);
  let term = eye(n), sum = eye(n);
  for (let k = 1; k < 30; k++) { term = scale(1 / k, mul(term, B)); sum = add(sum, term); }
  for (let i = 0; i < s; i++) sum = mul(sum, sum);
  return sum;
}

/** The Minkowski metric diag(−1, 1, …, 1) in n dimensions (one time). */
export const eta = (n = 4) => eye(n).map((row, i) => (i === 0 ? row.map((a) => -a) : row));

/** Levi-Civita symbol on indices 0, 1, 2. */
export const eps3 = (i, j, k) => ((i - j) * (j - k) * (k - i)) / 2;

/** Real so(3) generators, (J_i)_{jk} = −ε_{ijk}: [J₁, J₂] = J₃. */
export const J3 = [0, 1, 2].map((i) => [0, 1, 2].map((j) => [0, 1, 2].map((k) => -eps3(i, j, k))));

/** Real so(1,3) generators on (t, x, y, z): rotations J_i and boosts K_i. */
export const J4 = J3.map((J) => [[0, 0, 0, 0], ...J.map((row) => [0, ...row])]);
export const K4 = [1, 2, 3].map((i) => eye(4).map((row, a) => row.map((_, b) => ((a === 0 && b === i) || (a === i && b === 0) ? 1 : 0))));

/** A boost of rapidity w along spatial axis i (1, 2, 3) in 3+1 dimensions. */
export const boost = (i, w) => expm(scale(w, K4[i - 1]));
/** A rotation by angle th about spatial axis i in 3+1 dimensions. */
export const rot = (i, th) => expm(scale(th, J4[i - 1]));

/** The pure boost taking e_t to the four-velocity u = (γ, γv). */
export function pureBoost(u) {
  const g = u[0], p = u.slice(1), B = eye(4);
  B[0][0] = g;
  for (let i = 0; i < 3; i++) { B[0][i + 1] = p[i]; B[i + 1][0] = p[i]; }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) B[i + 1][j + 1] = (i === j ? 1 : 0) + p[i] * p[j] / (g + 1);
  return B;
}

/**
 * Thomas–Wigner rotation of the composite Λ = B₂B₁ (B₁ first): Λ = B(u)R with
 * u = Λe_t. Returns the rotation angle (radians), its signed z-component for
 * boosts in the x–y plane, and the composite speed.
 */
export function wigner(L) {
  const u = L.map((row) => row[0]);
  const Binv = mul(mul(eta(), pureBoost(u)), eta());     // the inverse of a pure boost: reverse its velocity
  const R = mul(Binv, L);
  const c = (R[1][1] + R[2][2] + R[3][3] - 1) / 2;
  const angle = Math.acos(Math.max(-1, Math.min(1, c)));
  const sz = (R[2][1] - R[1][2]) / 2;                     // sin θ times the z-component of the axis
  return { R, angle, signedZ: Math.atan2(sz, (R[1][1] + R[2][2]) / 2), speed: Math.sqrt(1 - 1 / (u[0] * u[0])) };
}

/** Wigner angle for a boost of rapidity w1 along x followed by one of w2 along y. */
export const wignerPerp = (w1, w2) => wigner(mul(boost(2, w2), boost(1, w1))).angle;
