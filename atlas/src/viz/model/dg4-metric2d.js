// Two-dimensional metrics on their own coordinate charts, Riemannian and
// Lorentzian, and everything the st-c lessons C11–C14 compute from them:
// the Christoffel symbols (from the metric and its exact first derivatives,
// with a finite-difference check from the metric alone), the curvature, an
// orthonormal frame, geodesics (RK4), parallel transport along any path, the
// length or proper time of a path, and normal variations of a geodesic.
//
// Coordinates are (a, b): a is drawn across, b up. For every Lorentzian
// metric here b is a time function (g^bb < 0), so "future" means db > 0.
// Conventions as in Carroll: Γ^λ_μν = ½ g^λσ(∂_μ g_νσ + ∂_ν g_μσ − ∂_σ g_μν),
// R^ρ_σμν = ∂_μΓ^ρ_νσ − ∂_νΓ^ρ_μσ + Γ^ρ_μλΓ^λ_νσ − Γ^ρ_νλΓ^λ_μσ, R = g^σν R^ρ_σρν,
// and the Gaussian curvature of a 2D metric is K = R/2.
// DOM-free; tested in test/dg4-metric2d.test.mjs.

const { sin, cos, exp, sqrt, abs, atan2, atanh, PI } = Math;
const TAU = 2 * PI;

// Each metric: g(a, b, k) → [g_aa, g_ab, g_bb]; dg(a, b, k) → [∂_a of those, ∂_b of those].
// k is the metric's one parameter (radius, H, M, ω …), `kName` says which.
export const METRICS = {
  plane: {
    label: 'Flat plane (x, y)', lorentz: false, a: ['x', 'x'], b: ['y', 'y'], view: { a: [-3, 3], b: [-2, 2] },
    valid: () => true, cyclic: ['a', 'b'],
    g: () => [1, 0, 1], dg: () => [[0, 0, 0], [0, 0, 0]],
  },
  polar: {
    label: 'Flat plane, polar (r, θ)', lorentz: false, a: ['r', 'r'], b: ['\\theta', 'θ'], view: { a: [0, 3.2], b: [-1.6, 1.6] },
    valid: (a) => a > 0.02, cyclic: ['b'], periodic: { b: TAU },
    g: (a) => [1, 0, a * a], dg: (a) => [[0, 0, 2 * a], [0, 0, 0]],
  },
  sphere: {
    label: 'Sphere (φ, θ)', lorentz: false, a: ['\\phi', 'φ'], b: ['\\theta', 'θ'], view: { a: [0, TAU], b: [0, PI] }, flipB: true,
    kName: 'radius', k: 1, valid: (a, b) => b > 0.02 && b < PI - 0.02, cyclic: ['a'], periodic: { a: TAU },
    g: (a, b, k) => [k * k * sin(b) ** 2, 0, k * k], dg: (a, b, k) => [[0, 0, 0], [2 * k * k * sin(b) * cos(b), 0, 0]],
  },
  stereo: {
    label: 'Sphere, stereographic (X, Y)', lorentz: false, a: ['X', 'X'], b: ['Y', 'Y'], view: { a: [-2.5, 2.5], b: [-1.6, 1.6] },
    kName: 'radius', k: 1, valid: () => true, cyclic: [],
    g: (a, b, k) => { const w = (4 * k * k) / (1 + a * a + b * b) ** 2; return [w, 0, w]; },
    dg: (a, b, k) => { const s = 1 + a * a + b * b, d = (-16 * k * k) / s ** 3; return [[d * a, 0, d * a], [d * b, 0, d * b]]; },
  },
  halfplane: {
    label: 'Hyperbolic half-plane (x, y)', lorentz: false, a: ['x', 'x'], b: ['y', 'y'], view: { a: [-2.5, 2.5], b: [0, 2.5] },
    valid: (a, b) => b > 0.01, cyclic: ['a'],
    g: (a, b) => [1 / (b * b), 0, 1 / (b * b)], dg: (a, b) => [[0, 0, 0], [-2 / b ** 3, 0, -2 / b ** 3]],
  },
  cylinder: {
    label: 'Cylinder (φ, z)', lorentz: false, a: ['\\phi', 'φ'], b: ['z', 'z'], view: { a: [0, TAU], b: [-2, 2] },
    kName: 'radius', k: 1, valid: () => true, cyclic: ['a', 'b'], periodic: { a: TAU },
    g: (a, b, k) => [k * k, 0, 1], dg: () => [[0, 0, 0], [0, 0, 0]],
  },
  torus: {
    // R = 2, r = 1 as in gr-surface; v = 0 is the outer equator
    label: 'Torus (u, v)', lorentz: false, a: ['u', 'u'], b: ['v', 'v'], view: { a: [0, TAU], b: [-PI, PI] },
    R: 2, r: 1, valid: () => true, cyclic: ['a'], periodic: { a: TAU, b: TAU },
    g: (a, b) => [(2 + cos(b)) ** 2, 0, 1], dg: (a, b) => [[0, 0, 0], [-2 * (2 + cos(b)) * sin(b), 0, 0]],
  },
  arm: {
    // a two-link arm, unit masses at the ends of unit links, joints free: kinetic energy T = ½ g q̇ q̇
    label: 'Two-link arm (θ₁, θ₂)', lorentz: false, a: ['\\theta_1', 'θ₁'], b: ['\\theta_2', 'θ₂'], view: { a: [-PI, PI], b: [-PI, PI] },
    valid: () => true, cyclic: ['a'], periodic: { a: TAU, b: TAU },
    g: (a, b) => [3 + 2 * cos(b), 1 + cos(b), 1], dg: (a, b) => [[0, 0, 0], [-2 * sin(b), -sin(b), 0]],
  },
  minkowski: {
    label: 'Minkowski (x, t)', lorentz: true, a: ['x', 'x'], b: ['t', 't'], view: { a: [-3, 3], b: [-2, 2] },
    valid: () => true, cyclic: ['a', 'b'],
    g: () => [1, 0, -1], dg: () => [[0, 0, 0], [0, 0, 0]],
  },
  ring: {
    // a ring of radius 1 seen from a frame turning at ω (c = 1): flat, cones tilted
    label: 'Rotating ring (φ, t)', lorentz: true, a: ['\\phi', 'φ'], b: ['t', 't'], view: { a: [0, TAU], b: [0, 3.2] },
    kName: 'ω', k: 0.4, valid: () => true, cyclic: ['a', 'b'], periodic: { a: TAU },
    g: (a, b, k) => [1, k, -(1 - k * k)], dg: () => [[0, 0, 0], [0, 0, 0]],
  },
  rindler: {
    label: 'Rindler wedge (ρ, η)', lorentz: true, a: ['\\rho', 'ρ'], b: ['\\eta', 'η'], view: { a: [0, 3], b: [-1.6, 1.6] },
    valid: (a) => a > 0.02, cyclic: ['b'],
    g: (a) => [1, 0, -a * a], dg: (a) => [[0, 0, -2 * a], [0, 0, 0]],
  },
  desitter: {
    label: '1+1 de Sitter (x, t)', lorentz: true, a: ['x', 'x'], b: ['t', 't'], view: { a: [-2.5, 2.5], b: [-1, 2] },
    kName: 'H', k: 1, valid: (a, b) => abs(b) < 12, cyclic: ['a'],
    g: (a, b, k) => [exp(2 * k * b), 0, -1], dg: (a, b, k) => [[0, 0, 0], [2 * k * exp(2 * k * b), 0, 0]],
  },
  schwarzschild: {
    label: 'Schwarzschild (r, t)', lorentz: true, a: ['r', 'r'], b: ['t', 't'], view: { a: [0, 12], b: [-3, 9] },
    kName: 'M', k: 1, valid: (a, b, k) => a > 2 * k * 1.0005, cyclic: ['b'],
    g: (a, b, k) => { const f = 1 - (2 * k) / a; return [1 / f, 0, -f]; },
    dg: (a, b, k) => { const f = 1 - (2 * k) / a, f1 = (2 * k) / (a * a); return [[-f1 / (f * f), 0, -f1], [0, 0, 0]]; },
  },
  compass: {
    // the sphere's metric with a different connection: the unit south and east vectors are declared constant
    // (∇ê_θ = ∇ê_φ = 0). Metric-compatible and flat, but with torsion; its straightest lines are rhumb lines.
    label: 'Sphere, compass connection', lorentz: false, a: ['\\phi', 'φ'], b: ['\\theta', 'θ'], view: { a: [0, TAU], b: [0, PI] }, flipB: true,
    kName: 'radius', k: 1, valid: (a, b) => b > 0.02 && b < PI - 0.02, cyclic: ['a'], periodic: { a: TAU },
    g: (a, b, k) => [k * k * sin(b) ** 2, 0, k * k], dg: (a, b, k) => [[0, 0, 0], [2 * k * k * sin(b) * cos(b), 0, 0]],
    gamma: (a, b) => [[[0, 0], [cos(b) / sin(b), 0]], [[0, 0], [0, 0]]],     // only Γ^φ_θφ = cot θ (derivative index first)
  },
  stretch: {
    // the flat plane's metric with a connection that is torsion-free but not metric-compatible: Γ^x_xx = κ
    label: 'Plane, a non-metric connection', lorentz: false, a: ['x', 'x'], b: ['y', 'y'], view: { a: [-3, 3], b: [-2, 2] },
    kName: 'κ', k: 0.4, valid: () => true, cyclic: ['a', 'b'],
    g: () => [1, 0, 1], dg: () => [[0, 0, 0], [0, 0, 0]],
    gamma: (a, b, k) => [[[k, 0], [0, 0]], [[0, 0], [0, 0]]],
  },
  ef: {
    // ingoing Eddington–Finkelstein, with t̃ = v − r so that ingoing light runs at 45°
    label: 'Schwarzschild, Eddington–Finkelstein (r, t̃)', lorentz: true, a: ['r', 'r'], b: ['\\tilde t', 't̃'], view: { a: [0, 8], b: [-1, 7] },
    kName: 'M', k: 1, valid: (a) => a > 0.05, cyclic: ['b'],
    g: (a, b, k) => [1 + (2 * k) / a, (2 * k) / a, -(1 - (2 * k) / a)],
    dg: (a, b, k) => { const d = (-2 * k) / (a * a); return [[d, d, d], [0, 0, 0]]; },
  },
};

export const kOf = (M, k) => (k ?? M.k ?? 1);

/** Metric components as a 2 × 2 matrix. */
export function gMat(M, a, b, k) {
  const [p, q, r] = M.g(a, b, kOf(M, k));
  return [[p, q], [q, r]];
}

/** The inverse metric. */
export function gInv(M, a, b, k) {
  const [[p, q], [, r]] = gMat(M, a, b, k), d = p * r - q * q;
  return [[r / d, -q / d], [-q / d, p / d]];
}

const dgMat = (M, a, b, k) => M.dg(a, b, kOf(M, k)).map(([p, q, r]) => [[p, q], [q, r]]);   // dgMat[σ][μ][ν] = ∂_σ g_μν

function gammaFrom(gi, D) {
  const G = [[[0, 0], [0, 0]], [[0, 0], [0, 0]]];
  for (let l = 0; l < 2; l++) for (let m = 0; m < 2; m++) for (let n = 0; n < 2; n++) {
    let s = 0;
    for (let q = 0; q < 2; q++) s += 0.5 * gi[l][q] * (D[m][n][q] + D[n][m][q] - D[q][m][n]);
    G[l][m][n] = s;
  }
  return G;
}

/** Γ^l_mn at (a, b), index 0 = a, 1 = b, from the exact derivatives of the metric. */
export function christoffel(M, a, b, k) {
  if (M.gamma) return M.gamma(a, b, kOf(M, k));
  return gammaFrom(gInv(M, a, b, k), dgMat(M, a, b, k));
}

/** The Levi-Civita connection of M's metric, whatever connection M itself carries. */
export function leviCivita(M, a, b, k) {
  return gammaFrom(gInv(M, a, b, k), dgMat(M, a, b, k));
}

/** Torsion T^l_mn = Γ^l_mn − Γ^l_nm. */
export function torsion(M, a, b, k) {
  const G = christoffel(M, a, b, k);
  return [0, 1].map((l) => [0, 1].map((m) => [0, 1].map((n) => G[l][m][n] - G[l][n][m])));
}

/** The covariant derivative of the metric, (∇_σ g)_μν = ∂_σ g_μν − Γ^λ_σμ g_λν − Γ^λ_σν g_μλ, as D[σ][μ][ν]. */
export function nablaG(M, a, b, k) {
  const G = christoffel(M, a, b, k), g = gMat(M, a, b, k), D = dgMat(M, a, b, k);
  return [0, 1].map((sg) => [0, 1].map((m) => [0, 1].map((n) => {
    let x = D[sg][m][n];
    for (let l = 0; l < 2; l++) x -= G[l][sg][m] * g[l][n] + G[l][sg][n] * g[m][l];
    return x;
  })));
}

/** The same, from central differences of the metric alone (a check that needs no hand-derived derivative). */
export function christoffelFD(M, a, b, k, h = 1e-5) {
  const ga = (x, y) => gMat(M, x, y, k);
  const Pa = ga(a + h, b), Ma = ga(a - h, b), Pb = ga(a, b + h), Mb = ga(a, b - h);
  const D = [0, 1].map((s) => [0, 1].map((m) => [0, 1].map((n) => (s ? (Pb[m][n] - Mb[m][n]) : (Pa[m][n] - Ma[m][n])) / (2 * h))));
  return gammaFrom(gInv(M, a, b, k), D);
}

/** Riemann R^ρ_σμν by differencing the Christoffels; returns { R4, ricci, scalar, K }. */
export function curvature(M, a, b, k, h = 1e-4) {
  const G = christoffel(M, a, b, k);
  const dG = [christoffel(M, a + h, b, k), christoffel(M, a - h, b, k), christoffel(M, a, b + h, k), christoffel(M, a, b - h, k)];
  const d = (mu, r, n, s) => (mu === 0 ? (dG[0][r][n][s] - dG[1][r][n][s]) : (dG[2][r][n][s] - dG[3][r][n][s])) / (2 * h);   // ∂_μ Γ^r_ns
  const R4 = (r, s, m, n) => {
    let x = d(m, r, n, s) - d(n, r, m, s);
    for (let l = 0; l < 2; l++) x += G[r][m][l] * G[l][n][s] - G[r][n][l] * G[l][m][s];
    return x;
  };
  const ricci = [0, 1].map((s) => [0, 1].map((n) => R4(0, s, 0, n) + R4(1, s, 1, n)));
  const gi = gInv(M, a, b, k);
  let scalar = 0;
  for (let s = 0; s < 2; s++) for (let n = 0; n < 2; n++) scalar += gi[s][n] * ricci[s][n];
  return { R4, ricci, scalar, K: scalar / 2 };
}

/** g(U, V). */
export function dot(M, a, b, k, U, V) {
  const [[p, q], [, r]] = gMat(M, a, b, k);
  return p * U[0] * V[0] + q * (U[0] * V[1] + U[1] * V[0]) + r * U[1] * V[1];
}

/**
 * An orthonormal frame at (a, b), as coordinate components. Riemannian:
 * e1 along ∂_a, e2 the unit vector at +90° (toward +b). Lorentzian: e1 along
 * ∂_a (spacelike), e0 the future unit timelike vector orthogonal to it.
 */
export function frame(M, a, b, k) {
  const [[p, q], [, r]] = gMat(M, a, b, k);
  const e1 = [1 / sqrt(p), 0];
  const w = [-q / p, 1], n2 = r - (q * q) / p;            // ∂_b minus its ∂_a part
  const e2 = [w[0] / sqrt(abs(n2)), w[1] / sqrt(abs(n2))];
  return M.lorentz ? { e1, e0: e2 } : { e1, e2 };
}

/** Components of V in the orthonormal frame: Riemannian [V¹̂, V²̂]; Lorentzian [V⁰̂, V¹̂]. */
export function frameComponents(M, a, b, k, V) {
  const F = frame(M, a, b, k);
  if (M.lorentz) return [-dot(M, a, b, k, F.e0, V), dot(M, a, b, k, F.e1, V)];
  return [dot(M, a, b, k, F.e1, V), dot(M, a, b, k, F.e2, V)];
}

/**
 * The initial velocity at (a, b). Riemannian: unit speed at `heading`
 * radians from e1 toward e2. Lorentzian: speed v (|v| < 1) relative to the
 * frame's observer e0, normalized to g(u, u) = −1; |v| = 1 gives the null
 * vector e0 ± e1.
 */
export function launch(M, a, b, k, { heading = 0, speed = 0 } = {}) {
  const F = frame(M, a, b, k);
  if (!M.lorentz) return [cos(heading) * F.e1[0] + sin(heading) * F.e2[0], cos(heading) * F.e1[1] + sin(heading) * F.e2[1]];
  if (abs(speed) >= 1) { const s = Math.sign(speed); return [F.e0[0] + s * F.e1[0], F.e0[1] + s * F.e1[1]]; }
  const gam = 1 / sqrt(1 - speed * speed);
  return [gam * (F.e0[0] + speed * F.e1[0]), gam * (F.e0[1] + speed * F.e1[1])];
}

const accel = (M, k, s) => {
  const G = christoffel(M, s[0], s[1], k), u = [s[2], s[3]];
  const f = (l) => -(G[l][0][0] * u[0] * u[0] + (G[l][0][1] + G[l][1][0]) * u[0] * u[1] + G[l][1][1] * u[1] * u[1]);
  return [s[2], s[3], f(0), f(1)];
};

/**
 * Integrate ẍ^l + Γ^l_mn ẋ^m ẋ^n = 0 by RK4 from (a, b) with velocity u for
 * an affine length `length` (proper time, arc length, or the null parameter).
 * Stops early where the chart ends or the path leaves `box` ({a, b} ranges,
 * optional). With `dmax`, steps shrink so no coordinate moves more than dmax
 * in one step (up to maxSteps steps). Returns pts [a, b, λ], vel [ua, ub], the conserved momenta
 * p_a = g_aμ u^μ and p_b = g_bμ u^μ and g(u, u) along the way, and `stopped`.
 */
export function geodesic(M, { a, b, k, u, length, steps = 800, box = null, dmax = null, maxSteps = 20000 }) {
  const kk = kOf(M, k);
  const h0 = length / steps;
  let s = [a, b, u[0], u[1]], lam = 0;
  const pts = [[a, b, 0]], vel = [[u[0], u[1]]], pa = [], pb = [], norm = [];
  const rec = () => {
    const [[p, q], [, r]] = gMat(M, s[0], s[1], kk);
    pa.push(p * s[2] + q * s[3]); pb.push(q * s[2] + r * s[3]);
    norm.push(p * s[2] * s[2] + 2 * q * s[2] * s[3] + r * s[3] * s[3]);
  };
  rec();
  let stopped = null;
  const inside = (x) => M.valid(x[0], x[1], kk) && x.every(Number.isFinite) && (!box || (x[0] >= box.a[0] && x[0] <= box.a[1] && x[1] >= box.b[0] && x[1] <= box.b[1]));
  // with dmax, a step is shortened so that no coordinate moves more than dmax (where the chart is stretched)
  for (let i = 0; i < (dmax ? maxSteps : steps) && lam < length - 1e-12; i++) {
    const add = (x, d, f) => x.map((v, j) => v + f * d[j]);
    let h = Math.min(h0, length - lam);
    if (dmax) { const v = Math.max(Math.abs(s[2]), Math.abs(s[3])); if (v * h > dmax) h = dmax / v; }
    const k1 = accel(M, kk, s);
    const s2 = add(s, k1, h / 2); if (!M.valid(s2[0], s2[1], kk)) { stopped = 'chart'; break; }
    const k2 = accel(M, kk, s2);
    const s3 = add(s, k2, h / 2); if (!M.valid(s3[0], s3[1], kk)) { stopped = 'chart'; break; }
    const k3 = accel(M, kk, s3);
    const s4 = add(s, k3, h); if (!M.valid(s4[0], s4[1], kk)) { stopped = 'chart'; break; }
    const k4 = accel(M, kk, s4);
    const n = s.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    if (!inside(n)) { stopped = M.valid(n[0], n[1], kk) ? 'box' : 'chart'; break; }
    s = n; lam += h;
    pts.push([s[0], s[1], lam]); vel.push([s[2], s[3]]);
    rec();
  }
  return { pts, vel, pa, pb, norm, stopped };
}

/**
 * Parallel-transport V0 along a path of points [a, b] (straight in the chart
 * between neighbours): dV^l/dλ + Γ^l_mn (dx^m/dλ) V^n = 0, RK4 with `sub`
 * steps per segment. Returns the components at every point.
 */
export function transport(M, path, V0, k, sub = 6) {
  const kk = kOf(M, k);
  const out = [V0.slice()];
  let V = V0.slice();
  const f = (x, dx, W) => {
    const G = christoffel(M, x[0], x[1], kk);
    return [0, 1].map((l) => -(G[l][0][0] * dx[0] * W[0] + G[l][0][1] * dx[0] * W[1] + G[l][1][0] * dx[1] * W[0] + G[l][1][1] * dx[1] * W[1]));
  };
  for (let i = 0; i + 1 < path.length; i++) {
    const p = path[i], q = path[i + 1], dx = [q[0] - p[0], q[1] - p[1]];
    for (let j = 0; j < sub; j++) {
      const t0 = j / sub, hs = 1 / sub, at = (t) => [p[0] + dx[0] * t, p[1] + dx[1] * t];
      const k1 = f(at(t0), dx, V);
      const k2 = f(at(t0 + hs / 2), dx, V.map((x, m) => x + (hs / 2) * k1[m]));
      const k3 = f(at(t0 + hs / 2), dx, V.map((x, m) => x + (hs / 2) * k2[m]));
      const k4 = f(at(t0 + hs), dx, V.map((x, m) => x + hs * k3[m]));
      V = V.map((x, m) => x + (hs / 6) * (k1[m] + 2 * k2[m] + 2 * k3[m] + k4[m]));
    }
    out.push(V.slice());
  }
  return out;
}

/** The two routes from P = (a0, b0) to Q = (a1, b1) round a coordinate rectangle: along a first, or along b first. */
export function routes(a0, b0, a1, b1, n = 80) {
  const seg = (p, q) => Array.from({ length: n }, (_, i) => [p[0] + ((q[0] - p[0]) * i) / n, p[1] + ((q[1] - p[1]) * i) / n]);
  const P = [a0, b0], Q = [a1, b1], C1 = [a1, b0], C2 = [a0, b1];
  return { first: [...seg(P, C1), ...seg(C1, Q), Q], second: [...seg(P, C2), ...seg(C2, Q), Q], corners: [C1, C2] };
}

/**
 * The turn from U to V at (a, b), measured in the orthonormal frame:
 * Riemannian, the signed angle (radians, anticlockwise from e1 toward e2);
 * Lorentzian, the difference in rapidity of two timelike vectors.
 */
export function turn(M, a, b, k, U, V) {
  const u = frameComponents(M, a, b, k, U), v = frameComponents(M, a, b, k, V);
  if (!M.lorentz) return atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]);
  return atanh(v[1] / v[0]) - atanh(u[1] / u[0]);
}

/**
 * Length (Riemannian, or a spacelike path) or proper time (a timelike path)
 * of a polyline [[a, b], …], from chords with the metric at their midpoints.
 */
export function pathLength(M, pts, k) {
  const kk = kOf(M, k);
  let L = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const p = pts[i], q = pts[i + 1], d = [q[0] - p[0], q[1] - p[1]];
    L += sqrt(abs(dot(M, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, kk, d, d)));
  }
  return L;
}

/** The unit normal to a velocity u at (a, b): Riemannian, u turned +90°; Lorentzian, the spacelike unit vector orthogonal to u. */
export function unitNormal(M, a, b, k, u) {
  const kk = kOf(M, k), F = frame(M, a, b, kk), c = frameComponents(M, a, b, kk, u);
  if (!M.lorentz) {
    const n = Math.hypot(c[0], c[1]), x = -c[1] / n, y = c[0] / n;    // components in (e1, e2)
    return [x * F.e1[0] + y * F.e2[0], x * F.e1[1] + y * F.e2[1]];
  }
  const n = sqrt(abs(c[0] * c[0] - c[1] * c[1])), t = c[1] / n, x = c[0] / n;   // (u¹, u⁰)/|u|: orthogonal to u, spacelike
  return [t * F.e0[0] + x * F.e1[0], t * F.e0[1] + x * F.e1[1]];
}

/**
 * A normal variation of a geodesic with fixed ends: each point moved by
 * α sin(πλ/Λ) along the unit normal (Λ the geodesic's whole parameter range).
 */
export function varied(M, geo, alpha, k) {
  const L = geo.pts[geo.pts.length - 1][2] || 1;
  return geo.pts.map(([a, b, lam], i) => {
    const n = unitNormal(M, a, b, k, geo.vel[i]), w = alpha * sin((PI * lam) / L);
    return [a + w * n[0], b + w * n[1]];
  });
}

/** Null directions at (a, b) (Lorentzian): the two future null vectors (A, 1), sorted by A. */
export function nullDirections(M, a, b, k) {
  const [[p, q], [, r]] = gMat(M, a, b, k);
  const disc = sqrt(Math.max(0, q * q - p * r));
  return [(-q - disc) / p, (-q + disc) / p].sort((x, y) => x - y);
}
