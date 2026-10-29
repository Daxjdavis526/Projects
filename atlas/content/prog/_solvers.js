// Helpers for the Scientific Programming lessons P9–P13 (roots, linear
// algebra, ODEs, Fourier analysis, Monte Carlo): small, exact numerical
// routines in JavaScript, so every number a lesson prints is computed — the
// same IEEE 754 doubles Python uses, though not always the same rounding
// order as NumPy, so lessons quote them to fewer digits than they hold.

/** Eigenvalues (ascending) and unit eigenvectors (V[i] belongs to w[i]) of a symmetric matrix, by Jacobi rotations. */
export function eigSym(A0) {
  const n = A0.length, A = A0.map((r) => [...r]), V = A0.map((_, i) => A0.map((__, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2;
    if (off < 1e-30 * (1 + A.reduce((s, r, i) => s + r[i] ** 2, 0))) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
      for (let k = 0; k < n; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  const idx = A.map((_, i) => i).sort((i, j) => A[i][i] - A[j][j]);
  return { w: idx.map((i) => A[i][i]), V: idx.map((i) => V.map((row) => row[i])) };
}

/** The generalized problem K v = λ M v for a diagonal mass matrix m (array): λ ascending, v normalized so vᵀMv = 1. */
export function eigGen(K, m) {
  const s = m.map((x) => 1 / Math.sqrt(x));
  const { w, V } = eigSym(K.map((r, i) => r.map((x, j) => x * s[i] * s[j])));
  return { w, V: V.map((v) => v.map((x, i) => x * s[i])) };
}

/** Gaussian elimination with partial pivoting: x with A x = b. */
export function solve(A0, b0) {
  const n = b0.length, A = A0.map((r, i) => [...r, b0[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
    [A[k], A[p]] = [A[p], A[k]];
    for (let i = k + 1; i < n; i++) { const f = A[i][k] / A[k][k]; for (let j = k; j <= n; j++) A[i][j] -= f * A[k][j]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}

/** The stiffness matrix of masses in a line joined by springs k[i] between masses i and i + 1; ground springs at the ends if given. */
export function chainK(n, k, { left = 0, right = 0 } = {}) {
  const K = Array.from({ length: n }, () => Array(n).fill(0));
  k.forEach((ki, i) => { K[i][i] += ki; K[i + 1][i + 1] += ki; K[i][i + 1] -= ki; K[i + 1][i] -= ki; });
  K[0][0] += left; K[n - 1][n - 1] += right;
  return K;
}

// ── ODE steppers on arrays (state y is an array) ──
const axpy = (y, h, k) => y.map((v, i) => v + h * k[i]);
export function rk4Step(f, t, y, h) {
  const k1 = f(t, y), k2 = f(t + h / 2, axpy(y, h / 2, k1)), k3 = f(t + h / 2, axpy(y, h / 2, k2)), k4 = f(t + h, axpy(y, h, k3));
  return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
export const eulerStep = (f, t, y, h) => axpy(y, h, f(t, y));

/** Kepler two-body right-hand side for state [x, y, vx, vy] with gravitational parameter mu. */
export const kepler2d = (mu) => (t, s) => { const r3 = Math.hypot(s[0], s[1]) ** 3; return [s[2], s[3], (-mu * s[0]) / r3, (-mu * s[1]) / r3]; };
/** Specific orbital energy of [x, y, vx, vy]. */
export const orbitEnergy = (mu, s) => 0.5 * (s[2] ** 2 + s[3] ** 2) - mu / Math.hypot(s[0], s[1]);

/** Kick–drift–kick leapfrog (velocity Verlet) for the Kepler problem: one step of size h. */
export function leapfrogStep(mu, s, h) {
  const acc = (x, y) => { const r3 = Math.hypot(x, y) ** 3; return [(-mu * x) / r3, (-mu * y) / r3]; };
  let [x, y, vx, vy] = s;
  let a = acc(x, y);
  vx += (h / 2) * a[0]; vy += (h / 2) * a[1];
  x += h * vx; y += h * vy;
  a = acc(x, y);
  vx += (h / 2) * a[0]; vy += (h / 2) * a[1];
  return [x, y, vx, vy];
}

/** A seeded uniform generator on [0, 1) (mulberry32), for synthetic pictures. */
export function uniforms(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Thousands separated for TeX ({,}) — integers only. */
export const thou = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
