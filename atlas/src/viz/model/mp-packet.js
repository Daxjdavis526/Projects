// Wave packets, DOM-free (tested in test/mp-packet.test.mjs). A packet is a
// sum of plane waves e^{i(kx − ωt)} with Gaussian amplitudes centred on k₀;
// how ω depends on k (the dispersion relation) decides how it moves: crests
// at the phase velocity ω/k, the envelope at the group velocity dω/dk, and —
// unless ω is linear in k — the packet spreads. Units are dimensionless
// (for the free particle, ħ = m = 1). Also the three packet shapes compared
// in the uncertainty lesson: Gaussian (the minimum, Δx·Δk = ½), the ground
// state of a box (0.568) and a two-sided exponential (1/√2), with their
// momentum distributions. Used by the mp-packet simulation and the PHYS 2710
// lessons on wave packets and the uncertainty principle.

export const MU = 6;                                     // the "mass" ω(0) of the relativistic dispersion, in the same units as k₀

export const DISPERSIONS = {
  none: { label: 'no dispersion: ω = ck', w: (k) => k, vp: () => 1, vg: () => 1, w2: () => 0 },
  free: { label: 'free particle: ω = ħk²/2m', w: (k) => (k * k) / 2, vp: (k) => k / 2, vg: (k) => k, w2: () => 1 },
  water: { label: 'deep water: ω = √(gk)', w: (k) => Math.sqrt(Math.max(0, k)), vp: (k) => 1 / Math.sqrt(k), vg: (k) => 1 / (2 * Math.sqrt(k)), w2: (k) => -0.25 * k ** -1.5 },
  massive: { label: 'relativistic particle: ω = √(c²k² + μ²)', w: (k) => Math.hypot(k, MU), vp: (k) => Math.hypot(k, MU) / k, vg: (k) => k / Math.hypot(k, MU), w2: (k) => (MU * MU) / Math.hypot(k, MU) ** 3 },
};

/**
 * The plane waves of a packet: N wavenumbers evenly spread over k₀ ± 4σk,
 * with amplitudes e^{−(k − k₀)²/4σk²} (so |a|² has spread σk; at the ends
 * the amplitude is down to 2% of its peak).
 */
export function components(k0, sk, N) {
  if (N <= 1) return [{ k: k0, a: 1 }];
  const out = [];
  for (let j = 0; j < N; j++) { const k = k0 - 4 * sk + (8 * sk * j) / (N - 1); out.push({ k, a: Math.exp(-((k - k0) ** 2) / (4 * sk * sk)) }); }
  return out;
}

/** ψ(x, t) = Σ aⱼ e^{i(kⱼx − ωⱼt)}, normalised so that |ψ| = 1 at the centre at t = 0: { re, im, abs }. */
export function psi(x, t, comps, disp) {
  const D = DISPERSIONS[disp];
  let re = 0, im = 0, norm = 0;
  for (const { k, a } of comps) { const ph = k * x - D.w(k) * t; re += a * Math.cos(ph); im += a * Math.sin(ph); norm += a; }
  return { re: re / norm, im: im / norm, abs: Math.hypot(re, im) / norm };
}

/** The spread (standard deviation) in k of the amplitudes’ squares. */
export function spreadK(comps) {
  let s = 0, m = 0, m2 = 0;
  for (const { k, a } of comps) { s += a * a; m += a * a * k; m2 += a * a * k * k; }
  m /= s; return Math.sqrt(Math.max(0, m2 / s - m * m));
}

/** Mean and standard deviation of a non-negative density sampled at xs. */
export function moments(xs, ys) {
  let s = 0, m = 0, m2 = 0;
  for (let i = 0; i < xs.length; i++) { s += ys[i]; m += ys[i] * xs[i]; m2 += ys[i] * xs[i] * xs[i]; }
  m /= s; return { mean: m, sd: Math.sqrt(Math.max(0, m2 / s - m * m)) };
}

/**
 * Width (standard deviation of |ψ|²) of a Gaussian packet after time t, for a
 * dispersion whose curvature at k₀ is ω'' (exact when ω is quadratic in k,
 * as for the free particle, where ω'' = ħ/m): σ(t) = σ₀√(1 + (ω''t/2σ₀²)²).
 */
export const gaussWidth = (s0, w2, t) => s0 * Math.sqrt(1 + ((w2 * t) / (2 * s0 * s0)) ** 2);

// ---- three shapes for the uncertainty principle (x in units of the width parameter a) ----
const PI = Math.PI;
export const SHAPES = {
  gauss: {
    label: 'Gaussian',
    psi: (x, a) => Math.exp(-(x * x) / (4 * a * a)),                                        // |ψ|² has standard deviation a
    rho: (x, a) => Math.exp(-(x * x) / (2 * a * a)) / (a * Math.sqrt(2 * PI)),
    phi2: (k, a) => Math.exp(-2 * a * a * k * k),                                             // |φ(k)|², peak 1
    sx: (a) => a, sk: (a) => 1 / (2 * a),
  },
  box: {
    label: 'ground state of a box',
    psi: (x, a) => (Math.abs(x) < a / 2 ? Math.cos((PI * x) / a) : 0),                       // a is the box’s width
    rho: (x, a) => (Math.abs(x) < a / 2 ? (2 / a) * Math.cos((PI * x) / a) ** 2 : 0),
    phi2: (k, a) => {
      const q = PI / a, kk = Math.abs(Math.abs(k) - q) < 1e-9 * q ? k * (1 + 1e-7) : k;
      return (Math.cos((kk * a) / 2) ** 2 / (q * q - kk * kk) ** 2) * (q ** 4);             // peak 1 at k = 0
    },
    sx: (a) => a * Math.sqrt(1 / 12 - 1 / (2 * PI * PI)), sk: (a) => PI / a,
  },
  exp: {
    label: 'two-sided exponential',
    psi: (x, a) => Math.exp(-Math.abs(x) / a),
    rho: (x, a) => Math.exp((-2 * Math.abs(x)) / a) / a,
    phi2: (k, a) => 1 / (1 + k * k * a * a) ** 2,
    sx: (a) => a / Math.SQRT2, sk: (a) => 1 / a,
  },
};
/** Δx·Δk for a shape: ½ for the Gaussian, √(π²/12 − ½) ≈ 0.568 for the box, 1/√2 for the exponential. */
export const product = (shape) => SHAPES[shape].sx(1) * SHAPES[shape].sk(1);
