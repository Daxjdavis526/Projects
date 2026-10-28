// The algebra behind the ten-metric simulation: a (0,2) tensor on a plane
// as a machine T(U, V) = U^μ T_μν V^ν, the covector T(U, ·) it makes from one
// vector, its symmetric and antisymmetric parts, the inverse, the signature,
// the "unit circle" T(X, X) = ±1 (an ellipse or a pair of hyperbolae), and
// metric fields on coordinate charts (polar, the 2-sphere, the half-plane,
// Minkowski, skewed axes) with lengths along a chart segment.
//
//   a tensor   T = [[T11, T12], [T21, T22]]   rows μ, columns ν: T_μν
//   a vector   [V¹, V²]          a covector [ω₁, ω₂]
//
// DOM-free; tested in test/ten-metric.test.mjs.

export const bil = (T, U, V) => U[0] * (T[0][0] * V[0] + T[0][1] * V[1]) + U[1] * (T[1][0] * V[0] + T[1][1] * V[1]);

/** T(U, ·): the covector U^μ T_μν (U in the first slot). */
export const feedFirst = (T, U) => [U[0] * T[0][0] + U[1] * T[1][0], U[0] * T[0][1] + U[1] * T[1][1]];
/** T(·, U): the covector T_μν U^ν (U in the second slot). */
export const feedSecond = (T, U) => [T[0][0] * U[0] + T[0][1] * U[1], T[1][0] * U[0] + T[1][1] * U[1]];

export const det2 = (T) => T[0][0] * T[1][1] - T[0][1] * T[1][0];
export function inv2(T) {
  const d = det2(T);
  if (Math.abs(d) < 1e-12) return null;
  return [[T[1][1] / d, -T[0][1] / d], [-T[1][0] / d, T[0][0] / d]];
}
/** g^{μν} ω_ν: the vector made from a covector by the inverse (null if T is degenerate). */
export function raise(T, w) {
  const G = inv2(T);
  return G ? [G[0][0] * w[0] + G[0][1] * w[1], G[1][0] * w[0] + G[1][1] * w[1]] : null;
}
export const sym = (T) => [[T[0][0], (T[0][1] + T[1][0]) / 2], [(T[0][1] + T[1][0]) / 2, T[1][1]]];
export const anti = (T) => [[0, (T[0][1] - T[1][0]) / 2], [(T[1][0] - T[0][1]) / 2, 0]];
export const pair = (w, V) => w[0] * V[0] + w[1] * V[1];
/** The product ω ⊗ η: components ω_μ η_ν. */
export const outer = (w, h) => [[w[0] * h[0], w[0] * h[1]], [w[1] * h[0], w[1] * h[1]]];
/** The new components T'_μν = T(e'_μ, e'_ν) = AᵀTA, where column j of A is e'_j in the old components. */
export const congruent = (T, A) => {
  const e = [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
  return [[bil(T, e[0], e[0]), bil(T, e[0], e[1])], [bil(T, e[1], e[0]), bil(T, e[1], e[1])]];
};

/** Eigenvalues of the symmetric part, smaller first. */
export function eig(T) {
  const S = sym(T), a = S[0][0], b = S[0][1], d = S[1][1];
  const m = (a + d) / 2, r = Math.hypot((a - d) / 2, b);
  return [m - r, m + r];
}
/** The signature of the symmetric part: how many eigenvalues are negative, zero and positive. */
export function signature(T, tol = 1e-9) {
  const ev = eig(T), sc = Math.max(1, ...ev.map(Math.abs));
  const out = { neg: 0, zero: 0, pos: 0 };
  for (const l of ev) out[Math.abs(l) <= tol * sc ? 'zero' : l < 0 ? 'neg' : 'pos']++;
  return out;
}
export const sigText = (s) => `(${[...Array(s.neg).fill('−'), ...Array(s.zero).fill('0'), ...Array(s.pos).fill('+')].join(', ')})`;

/** The quadratic form in the direction φ: T(u, u) for the unit chart direction u = (cos φ, sin φ). */
export const q = (T, phi) => bil(T, [Math.cos(phi), Math.sin(phi)], [Math.cos(phi), Math.sin(phi)]);

/**
 * The curve T(X, X) = level (level ≠ 0) as polylines in chart components,
 * about the origin: an ellipse, a hyperbola's two branches, or nothing. Each
 * direction φ meets it at most at r = √(level / q(φ)); branches are cut off
 * at radius rmax.
 */
export function conic(T, level, rmax = 20, n = 1440) {
  const out = [];
  let cur = [];
  for (let i = 0; i <= n; i++) {
    const phi = (2 * Math.PI * i) / n, qq = q(T, phi);
    const r = qq !== 0 && level / qq > 0 ? Math.sqrt(level / qq) : Infinity;
    if (r <= rmax) cur.push([r * Math.cos(phi), r * Math.sin(phi)]);
    else if (cur.length) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  // an ellipse drawn in one sweep closes on itself: join the first and last runs when they meet at φ = 0
  if (out.length > 1) {
    const a = out[0][0], z = out[out.length - 1].at(-1);
    if (Math.hypot(a[0] - z[0], a[1] - z[1]) < 1e-9) out[0] = [...out.pop(), ...out[0]];
  }
  return out;
}

/** The null directions T(X, X) = 0 of the symmetric part, as unit chart vectors (none, one or two). */
export function nullDirs(T) {
  const S = sym(T), a = S[0][0], b = S[0][1], d = S[1][1];
  // a c² + 2b c s + d s² = 0
  const out = [];
  if (Math.abs(d) > 1e-12) {
    const disc = b * b - a * d;
    if (disc < -1e-12) return out;
    for (const sg of disc > 1e-12 ? [1, -1] : [1]) { const t = (-b + sg * Math.sqrt(Math.max(0, disc))) / d; const L = Math.hypot(1, t); out.push([1 / L, t / L]); }
  } else {
    out.push([0, 1]);                                        // s-axis: a·0 + 0 + 0
    if (Math.abs(a) > 1e-12 || Math.abs(b) > 1e-12) { if (Math.abs(b) > 1e-12) { const L = Math.hypot(-a, 2 * b); out.push([2 * b / L, -a / L]); } }
  }
  return out;
}

/** The kind of a vector under an indefinite form, by the sign of T(V, V). */
export const kind = (T, V, tol = 1e-9) => { const s = bil(T, V, V); return Math.abs(s) <= tol ? 'null' : s < 0 ? 'timelike' : 'spacelike'; };

/** The integer levels of the covector w that cross the window, and the segment of the line w·x = k inside it. */
export function levelsIn(w, [x0, x1], [y0, y1]) {
  const vals = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map((p) => pair(w, p));
  const lo = Math.ceil(Math.min(...vals) - 1e-9), hi = Math.floor(Math.max(...vals) + 1e-9);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi - lo > 300) return [];
  const out = [];
  for (let k = lo; k <= hi; k++) out.push(k);
  return out;
}
export function clipLine(w, c, [x0, x1], [y0, y1]) {
  const [a, b] = w, pts = [];
  const push = (x, y) => { if (x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9 && !pts.some((p) => Math.hypot(p[0] - x, p[1] - y) < 1e-9)) pts.push([x, y]); };
  if (Math.abs(b) > 1e-12) { push(x0, (c - a * x0) / b); push(x1, (c - a * x1) / b); }
  if (Math.abs(a) > 1e-12) { push((c - b * y0) / a, y0); push((c - b * y1) / a, y1); }
  return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
}
/** The levels crossed going from the origin to V (excluding 0, including V's own level when whole). */
export function crossed(w, V) {
  const b = pair(w, V), out = [];
  if (b > 0) for (let k = 1; k <= b + 1e-9; k++) out.push(k);
  else for (let k = -1; k >= b - 1e-9; k--) out.push(k);
  return out;
}

// ── metric fields on charts ──────────────────────────────────────────────────
// A chart's coordinates are (a, b): a across the page, b up it. For each chart,
// metric(a, b) gives g in that (a, b) order. 'sphere' uses a = φ and b = θ (the
// polar angle, drawn increasing downward so north is at the top), 'minkowski'
// a = x and b = t (c = 1).
export const CHARTS = {
  cartesian: { names: ['x', 'y'], metric: () => [[1, 0], [0, 1]], window: [[-2, 2], [-1.25, 1.25]], space: (a, b) => [a, b] },
  polar: { names: ['r', 'θ'], metric: (r) => [[1, 0], [0, r * r]], window: [[0, 4], [0, 2.5]], space: (r, th) => [r * Math.cos(th), r * Math.sin(th)], valid: (r) => r > 1e-9 },
  sphere: { names: ['φ', 'θ'], metric: (ph, th, R = 1) => [[R * R * Math.sin(th) ** 2, 0], [0, R * R]], window: [[0, 2 * Math.PI], [0, Math.PI]], valid: (ph, th) => Math.sin(th) > 1e-9 },
  halfplane: { names: ['x', 'y'], metric: (x, y) => [[1 / (y * y), 0], [0, 1 / (y * y)]], window: [[-2, 2], [0, 2.5]], valid: (x, y) => y > 1e-9 },
  minkowski: { names: ['x', 't'], metric: () => [[1, 0], [0, -1]], window: [[-2, 2], [-1.25, 1.25]], space: (x, t) => [x, t] },
  skew: { names: ['u', 'v'], metric: (u, v, R, alpha = Math.PI / 3) => [[1, Math.cos(alpha)], [Math.cos(alpha), 1]], window: [[-2, 2], [-1.25, 1.25]], space: (u, v, R, alpha = Math.PI / 3) => [u + v * Math.cos(alpha), v * Math.sin(alpha)] },
};

export function chartMetric(chart, a, b, o = {}) {
  const C = CHARTS[chart];
  if (!C) return null;
  if (C.valid && !C.valid(a, b)) return null;
  return C.metric(a, b, o.R ?? 1, o.alpha ?? Math.PI / 3);
}

/**
 * Length along the straight chart segment from A to B: ∫ √|g(ẋ, ẋ)| dλ, with the
 * sign of g(ẋ, ẋ) at the midpoint (for Minkowski: −1 timelike, 0 null, +1
 * spacelike), and the naive coordinate length √(Δa² + Δb²).
 */
export function segmentLength(chart, A, B, o = {}, n = 600) {
  const d = [B[0] - A[0], B[1] - A[1]];
  let L = 0, s2 = 0;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, g = chartMetric(chart, A[0] + t * d[0], A[1] + t * d[1], o);
    if (!g) return { length: NaN, s2: NaN, naive: Math.hypot(d[0], d[1]) };
    const v = bil(g, d, d);
    L += Math.sqrt(Math.abs(v)) / n; s2 += v / n;
  }
  return { length: L, s2, naive: Math.hypot(d[0], d[1]) };
}
