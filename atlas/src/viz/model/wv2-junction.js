// A pulse on two strings joined at x = 0 under one tension T — PHYS 3750 W9,
// DOM-free. The model behind sims/wv2-junction.js, tested in
// test/wv2-junction.test.mjs.
//
// String 1 (x < 0) has linear density μ₁, string 2 (x > 0) has μ₂; the wave
// speeds are vᵢ = √(T/μᵢ) and the impedances Zᵢ = √(Tμᵢ) = T/vᵢ. A Gaussian
// pulse g(s) = A exp(−(s − x₀)²/2w²) starts on string 1 moving right,
// y_inc = g(x − v₁t). With F(t) = g(−v₁t) its time profile at the junction,
// the exact solution is
//   x < 0:  y = g(x − v₁t) + r g(−x − v₁t)              (incident + reflected)
//   x > 0:  y = τ g((v₁/v₂)x − v₁t)                      (transmitted)
// with r = (Z₁ − Z₂)/(Z₁ + Z₂) and τ = 2Z₁/(Z₁ + Z₂) for displacement, which
// make y and the transverse force T y_x continuous at the junction. Energy
// density e = ½μ y_t² + ½T y_x², energy flux S = −T y_t y_x. The incident
// pulse carries E = T∫g′² ds = T A²√π/(2w); afterwards a fraction r² is
// reflected and τ²Z₂/Z₁ = 4Z₁Z₂/(Z₁ + Z₂)² transmitted — together exactly 1.

export function setup({ T = 10, mu1 = 0.01, ratio = 4, A = 0.05, w = 0.3, x0 = -4 } = {}) {
  const mu2 = mu1 * ratio, v1 = Math.sqrt(T / mu1), v2 = Math.sqrt(T / mu2);
  const Z1 = Math.sqrt(T * mu1), Z2 = Math.sqrt(T * mu2);
  const r = (Z1 - Z2) / (Z1 + Z2), tau = (2 * Z1) / (Z1 + Z2);
  const R = r * r, Tr = (tau * tau * Z2) / Z1;
  const E = (T * A * A * Math.sqrt(Math.PI)) / (2 * w);
  return { T, mu1, mu2, v1, v2, Z1, Z2, r, tau, R, Tr, E, A, w, x0 };
}

const g = (S, s) => S.A * Math.exp(-((s - S.x0) ** 2) / (2 * S.w * S.w));
const gp = (S, s) => (-(s - S.x0) / (S.w * S.w)) * g(S, s);

/** Displacement, velocity y_t and slope y_x at (x, t): { y, yt, yx }. */
export function field(S, x, t) {
  if (x <= 0) {
    const a = x - S.v1 * t, b = -x - S.v1 * t;
    return { y: g(S, a) + S.r * g(S, b), yt: -S.v1 * (gp(S, a) + S.r * gp(S, b)), yx: gp(S, a) - S.r * gp(S, b) };
  }
  const q = S.v1 / S.v2, c = q * x - S.v1 * t;
  return { y: S.tau * g(S, c), yt: -S.v1 * S.tau * gp(S, c), yx: q * S.tau * gp(S, c) };
}

/** The incident and reflected parts alone (x < 0), for drawing them as ghosts. */
export function parts(S, x, t) {
  return { inc: g(S, x - S.v1 * t), ref: S.r * g(S, -x - S.v1 * t) };
}

/** Energy density e (J/m) and energy flux S (W) at (x, t). */
export function energy(S, x, t) {
  const { yt, yx } = field(S, x, t), mu = x <= 0 ? S.mu1 : S.mu2;
  return { e: 0.5 * mu * yt * yt + 0.5 * S.T * yx * yx, S: -S.T * yt * yx };
}

/** Energy on each string at time t, by Simpson's rule over everywhere the pulses can be: { left, right }. */
export function split(S, t, n = 2000) {
  const reach = 12 * S.w;
  const L0 = Math.min(S.x0 - reach, -S.v1 * t - S.x0 - reach, -reach), R1 = Math.max(S.v2 * t + (S.v2 / S.v1) * (S.x0 + reach) + reach, reach);
  const simpson = (a, b, f) => {
    const m = n % 2 ? n + 1 : n, h = (b - a) / m;
    let s = f(a) + f(b);
    for (let i = 1; i < m; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return (s * h) / 3;
  };
  const left = simpson(L0, 0, (x) => energy(S, Math.min(x, 0), t).e);
  const right = R1 > 0 ? simpson(1e-12, R1, (x) => energy(S, x, t).e) : 0;
  return { left, right };
}

/** The time at which the incident pulse's centre reaches the junction. */
export const arrival = (S) => -S.x0 / S.v1;
