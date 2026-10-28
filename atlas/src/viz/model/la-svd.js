// The algebra behind sims/la-svd.js, DOM-free and tested headlessly
// (test/la-svd.test.mjs): the singular value decomposition of a 2×2 matrix
// in closed form (with V chosen to be a rotation), a one-sided Jacobi SVD for
// small m×n matrices, rank-k reconstruction with its errors (Eckart–Young),
// and the synthetic grey-scale pictures the image mode compresses.

const hyp = Math.hypot;

/**
 * The SVD of a 2×2 matrix A = U Σ Vᵀ. Returns { s: [σ₁, σ₂], U, V, theta, det }
 * with σ₁ ≥ σ₂ ≥ 0, the columns of V the right singular vectors v₁, v₂ (V a
 * rotation through theta, radians), the columns of U the left ones u₁, u₂
 * (a rotation when det A ≥ 0, a reflection when det A < 0).
 */
export function svd2(A) {
  const [[a, b], [c, d]] = A;
  // AᵀA = [[p, q], [q, r]]
  const p = a * a + c * c, q = a * b + c * d, r = b * b + d * d;
  const mean = (p + r) / 2, rad = hyp((p - r) / 2, q);
  const l1 = mean + rad, l2 = Math.max(0, mean - rad);
  const theta = 0.5 * Math.atan2(2 * q, p - r);
  const v1 = [Math.cos(theta), Math.sin(theta)], v2 = [-Math.sin(theta), Math.cos(theta)];
  const s1 = Math.sqrt(l1), det = a * d - b * c;
  // σ₂ from |det A| = σ₁σ₂ is more accurate than √λ₂ when A is nearly singular
  const s2 = s1 > 1e-300 ? Math.abs(det) / s1 : Math.sqrt(l2);
  const Av1 = [a * v1[0] + b * v1[1], c * v1[0] + d * v1[1]];
  const u1 = s1 > 1e-12 ? [Av1[0] / s1, Av1[1] / s1] : [1, 0];
  // u₂ ⟂ u₁, on the side that makes A v₂ = σ₂ u₂ (sign of det decides)
  const sg = det < 0 ? -1 : 1;
  const u2 = [-sg * u1[1], sg * u1[0]];
  return { s: [s1, s2], U: [[u1[0], u2[0]], [u1[1], u2[1]]], V: [[v1[0], v2[0]], [v1[1], v2[1]]], theta, det };
}

export const mul2 = (A, B) => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
export const T2 = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
export const apply2 = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
export const diag2 = (s) => [[s[0], 0], [0, s[1]]];
export const I2 = [[1, 0], [0, 1]];

/**
 * The partial products of the SVD, the maps the picture applies in stages:
 * stage 0 = I, 1 = Vᵀ, 2 = ΣVᵀ, 3 = UΣVᵀ = A.
 */
export function stages2(A) {
  const S = svd2(A), Vt = T2(S.V), SVt = mul2(diag2(S.s), Vt);
  return { ...S, maps: [I2, Vt, SVt, mul2(S.U, SVt)] };
}

/** The best rank-1 approximation σ₁u₁v₁ᵀ of a 2×2 matrix. */
export function rank1of2(A) {
  const { s, U, V } = svd2(A);
  return [[s[0] * U[0][0] * V[0][0], s[0] * U[0][0] * V[1][0]], [s[0] * U[1][0] * V[0][0], s[0] * U[1][0] * V[1][0]]];
}

// ─── general small matrices ─────────────────────────────────────────────────

/**
 * One-sided Jacobi SVD (Hestenes) of an m×n matrix (rows of numbers). Rotates
 * pairs of columns until all are mutually orthogonal: then A V = W with the
 * columns of W equal to σⱼuⱼ. Returns { s, U, V } with s descending,
 * U m×p and V n×p (p = min(m, n)) as arrays of columns: U[j] = uⱼ, V[j] = vⱼ.
 */
export function svd(A, { tol = 1e-12, sweeps = 60 } = {}) {
  const m = A.length, n = A[0].length;
  if (n > m) {   // work on the transpose, which has fewer columns
    const t = svd(A[0].map((_, j) => A.map((row) => row[j])), { tol, sweeps });
    return { s: t.s, U: t.V, V: t.U };
  }
  const W = Array.from({ length: n }, (_, j) => A.map((row) => row[j]));     // columns
  const V = Array.from({ length: n }, (_, j) => Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < sweeps; sweep++) {
    let off = 0;
    for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n; j++) {
      const wi = W[i], wj = W[j];
      let al = 0, be = 0, ga = 0;
      for (let k = 0; k < m; k++) { al += wi[k] * wi[k]; be += wj[k] * wj[k]; ga += wi[k] * wj[k]; }
      if (Math.abs(ga) <= tol * Math.sqrt(al * be) || ga === 0) continue;
      off = Math.max(off, Math.abs(ga) / Math.sqrt(al * be));
      const zeta = (be - al) / (2 * ga);
      const tt = Math.sign(zeta || 1) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta));
      const cs = 1 / Math.sqrt(1 + tt * tt), sn = cs * tt;
      for (let k = 0; k < m; k++) { const x = wi[k], y = wj[k]; wi[k] = cs * x - sn * y; wj[k] = sn * x + cs * y; }
      const vi = V[i], vj = V[j];
      for (let k = 0; k < n; k++) { const x = vi[k], y = vj[k]; vi[k] = cs * x - sn * y; vj[k] = sn * x + cs * y; }
    }
    if (off <= tol) break;
  }
  const s = W.map((w) => hyp(...w));
  const order = s.map((_, j) => j).sort((a, b) => s[b] - s[a]);
  const smax = s[order[0]] || 1;
  return {
    s: order.map((j) => s[j]),
    U: order.map((j) => (s[j] > 1e-14 * smax ? W[j].map((x) => x / s[j]) : W[j].map(() => 0))),
    V: order.map((j) => V[j]),
  };
}

/** Σ over the first k terms of σⱼuⱼvⱼᵀ: the rank-k truncation, as rows. */
export function rankK({ s, U, V }, k) {
  const m = U[0].length, n = V[0].length, out = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < Math.min(k, s.length); j++) {
    const u = U[j], v = V[j], sj = s[j];
    for (let i = 0; i < m; i++) { const a = sj * u[i]; if (a === 0) continue; const row = out[i]; for (let l = 0; l < n; l++) row[l] += a * v[l]; }
  }
  return out;
}

/** The Frobenius norm √(Σ aᵢⱼ²). */
export const frob = (A) => Math.sqrt(A.reduce((s, row) => s + row.reduce((t, x) => t + x * x, 0), 0));

/**
 * The errors of the rank-k truncation from the singular values alone
 * (Eckart–Young): the largest stretch of A − A_k is σ_{k+1}, and its Frobenius
 * norm is √(σ²_{k+1} + … ). rel: that Frobenius error over ‖A‖_F.
 */
export function truncationError(s, k) {
  const tail = s.slice(k), all = s.reduce((t, x) => t + x * x, 0);
  const f = Math.sqrt(tail.reduce((t, x) => t + x * x, 0));
  return { spectral: tail[0] ?? 0, frob: f, rel: all > 0 ? f / Math.sqrt(all) : 0 };
}

/** The numbers to store a rank-k truncation of an m×n matrix: k(m + n + 1), against mn. */
export const storage = (m, n, k) => ({ kept: k * (m + n + 1), full: m * n });

// ─── synthetic pictures (no image files are shipped) ────────────────────────

/** A small seeded generator (Park–Miller), for the noise. */
export function rng(seed = 1) {
  let s = Math.max(1, Math.floor(seed)) % 2147483647;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const IMAGES = ['satellite', 'blocks', 'checker', 'disc', 'stripe', 'noise'];

/**
 * A grey-scale picture as an m×n array of values in [0, 1] (0 black, 1 white).
 * satellite: a bus, two ruled solar panels, a dish on a boom — mostly
 * rectangles aligned with the pixel grid, plus one round dish; blocks: aligned
 * rectangles only (exactly low rank); checker: an 8-pixel checkerboard
 * (rank 2); disc: a filled circle; stripe: a diagonal band; noise: random
 * pixels (full rank). noise > 0 adds seeded random speckle of that size.
 */
export function image(name = 'satellite', { m = 48, n = 64, noise = 0, seed = 3 } = {}) {
  const A = Array.from({ length: m }, () => new Array(n).fill(0));
  const R = rng(seed);
  const box = (r0, r1, c0, c1, v) => { for (let i = Math.max(0, r0); i < Math.min(m, r1); i++) for (let j = Math.max(0, c0); j < Math.min(n, c1); j++) A[i][j] = v; };
  const sx = n / 64, sy = m / 48, X = (c) => Math.round(c * sx), Y = (r) => Math.round(r * sy);
  if (name === 'satellite') {
    box(0, m, 0, n, 0.08);
    box(Y(22), Y(27), X(4), X(25), 0.42); box(Y(22), Y(27), X(39), X(60), 0.42);           // panels
    for (let c = 4; c <= 24; c += 5) box(Y(22), Y(27), X(c), X(c) + 1, 0.22);               // their cell lines
    for (let c = 39; c <= 59; c += 5) box(Y(22), Y(27), X(c), X(c) + 1, 0.22);
    box(Y(24), Y(25), X(25), X(27), 0.6); box(Y(24), Y(25), X(37), X(39), 0.6);             // panel arms
    box(Y(18), Y(32), X(27), X(37), 0.78);                                                   // bus
    box(Y(32), Y(35), X(29), X(35), 0.55);                                                   // engine
    box(Y(10), Y(18), X(31.5), X(32.5), 0.6);                                                // boom
    const ci = Y(8.5), cj = X(32), rr = 5.2 * Math.min(sx, sy);                              // dish
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (((i - ci) / 0.75) ** 2 + (j - cj) ** 2 <= rr * rr) A[i][j] = 0.95;
  } else if (name === 'blocks') {
    box(0, m, 0, n, 0.12);
    box(Y(6), Y(30), X(6), X(26), 0.8); box(Y(18), Y(42), X(34), X(58), 0.55); box(Y(34), Y(44), X(10), X(30), 0.35);
  } else if (name === 'checker') {
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) A[i][j] = (Math.floor(i / 8) + Math.floor(j / 8)) % 2 ? 0.85 : 0.15;
  } else if (name === 'disc') {
    box(0, m, 0, n, 0.1);
    const ci = (m - 1) / 2, cj = (n - 1) / 2, rr = 0.38 * m;
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if ((i - ci) ** 2 + (j - cj) ** 2 <= rr * rr) A[i][j] = 0.9;
  } else if (name === 'stripe') {
    box(0, m, 0, n, 0.1);
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (Math.abs(j - (n / m) * i) < 4) A[i][j] = 0.9;
  } else if (name === 'noise') {
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) A[i][j] = R();
  } else throw new Error(`unknown image “${name}”`);
  if (noise > 0) {
    // Box–Muller normal speckle, standard deviation `noise`
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      const z = Math.sqrt(-2 * Math.log(1 - R())) * Math.cos(2 * Math.PI * R());
      A[i][j] += noise * z;
    }
  }
  return A;
}

/** The numerical rank: how many singular values exceed tol × σ₁. */
export const numRank = (s, tol = 1e-9) => s.filter((x) => x > tol * (s[0] || 1)).length;
