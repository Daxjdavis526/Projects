// A space curve built from its curvature κ(s) and torsion τ(s): the
// Frenet–Serret equations
//   α′ = T,  T′ = κN,  N′ = −κT + τB,  B′ = −τN
// integrated in arc length s by fourth-order Runge–Kutta. DOM-free; tested in
// test/dg-frenet.test.mjs.
//
// The starting frame is chosen so that a curve of constant κ and τ is the
// helix (a cos t, a sin t, b t) about the z-axis, starting at (a, 0, 0):
// T₀ = (0, κ₀, τ₀)/w₀, N₀ = (−1, 0, 0), B₀ = (0, −τ₀, κ₀)/w₀ with w₀ = √(κ₀² + τ₀²)
// and a = κ₀/w₀². (Any other start gives the same shape moved rigidly.)

const add = (a, b) => a.map((x, i) => x + b[i]);
const mul = (a, k) => a.map((x) => x * k);

/** The starting point and frame for initial curvature k0 and torsion t0. */
export function initialFrame(k0, t0) {
  const w = Math.hypot(k0, t0);
  if (!(w > 1e-12)) return { p: [0, 0, 0], T: [0, 1, 0], N: [-1, 0, 0], B: [0, 0, 1] };
  return { p: [k0 / (w * w), 0, 0], T: [0, k0 / w, t0 / w], N: [-1, 0, 0], B: [0, -t0 / w, k0 / w] };
}

// the state y = [p, T, N, B] (12 numbers) and its derivative at s
function deriv(y, s, kappa, tau) {
  const k = kappa(s), t = tau(s);
  const T = y.slice(3, 6), N = y.slice(6, 9), B = y.slice(9, 12);
  return [...T, ...mul(N, k), ...add(mul(T, -k), mul(B, t)), ...mul(N, -t)];
}

/**
 * Integrate from s = 0 to s = L in n RK4 steps.
 * Returns { s: [...], p: [[x,y,z]...], T, N, B } with n + 1 samples each.
 */
export function integrate(kappa, tau, L, n = 600) {
  const f0 = initialFrame(kappa(0), tau(0));
  let y = [...f0.p, ...f0.T, ...f0.N, ...f0.B];
  const out = { s: [0], p: [f0.p], T: [f0.T], N: [f0.N], B: [f0.B] };
  const h = L / n;
  for (let i = 0; i < n; i++) {
    const s = i * h;
    const k1 = deriv(y, s, kappa, tau);
    const k2 = deriv(add(y, mul(k1, h / 2)), s + h / 2, kappa, tau);
    const k3 = deriv(add(y, mul(k2, h / 2)), s + h / 2, kappa, tau);
    const k4 = deriv(add(y, mul(k3, h)), s + h, kappa, tau);
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    out.s.push(s + h); out.p.push(y.slice(0, 3)); out.T.push(y.slice(3, 6)); out.N.push(y.slice(6, 9)); out.B.push(y.slice(9, 12));
  }
  return out;
}

/** The sample nearest to arc length s (the table is fine enough to draw from). */
export function sampleAt(res, s) {
  const n = res.s.length - 1, L = res.s[n];
  const i = Math.max(0, Math.min(n, Math.round((s / (L || 1)) * n)));
  return { s: res.s[i], p: res.p[i], T: res.T[i], N: res.N[i], B: res.B[i] };
}

/** Axis-aligned bounding box of a list of points: { min, max, centre, size }. */
export function bounds(pts) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const p of pts) for (let k = 0; k < 3; k++) { if (p[k] < min[k]) min[k] = p[k]; if (p[k] > max[k]) max[k] = p[k]; }
  const centre = min.map((v, k) => (v + max[k]) / 2), size = Math.max(...max.map((v, k) => v - min[k]));
  return { min, max, centre, size };
}
