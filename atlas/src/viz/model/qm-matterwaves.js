// Matter waves, DOM-free (tested in test/qm-matterwaves.test.mjs): de Broglie
// wavelengths λ = h/p (relativistic where it matters), the far-field
// (Fraunhofer) pattern behind one or two slits, sampling where single
// particles land, and the Gaussian wave packet that saturates Δx·Δp = ħ/2.
// Used by the qm-slits simulation and the PHYS 2220 lessons on de Broglie
// waves and on wave–particle duality.

import { H, HBAR, QE, C } from './qm-light.js';

export const PARTICLES = {
  electron: { label: 'electron', m: 9.1093837139e-31, mc2: 0.51099895069e6 },          // kg, eV (CODATA 2022)
  proton: { label: 'proton', m: 1.67262192595e-27, mc2: 938.27208943e6 },
  neutron: { label: 'neutron', m: 1.67492750056e-27, mc2: 939.56542194e6 },
  c60: { label: 'C₆₀ molecule', m: 720 * 1.66053906892e-27, mc2: 720 * 931.49410372e6 },  // 60 carbon-12 atoms
};

/** Momentum (kg m/s) of a particle of kinetic energy K (eV), exactly: pc = √(K² + 2K·mc²). */
export const momentumFromK = (key, K) => { const mc2 = PARTICLES[key].mc2; return (Math.sqrt(K * K + 2 * K * mc2) * QE) / C; };
/** de Broglie wavelength (m) for kinetic energy K (eV), relativistic. */
export const lambdaFromK = (key, K) => H / momentumFromK(key, K);
/** The same, with Newton’s p = √(2mK): good when K ≪ mc². */
export const lambdaNonRel = (key, K) => H / Math.sqrt(2 * PARTICLES[key].m * K * QE);
/** de Broglie wavelength (m) of a body of mass m (kg) at speed v (m/s), relativistic. */
export const lambdaFromV = (m, v) => (H * Math.sqrt(1 - (v * v) / (C * C))) / (m * v);
/** Kinetic energy (eV) an electron needs for wavelength λ (m), relativistic. */
export const kFromLambda = (key, lam) => { const mc2 = PARTICLES[key].mc2, pc = (H * C) / lam / QE; return Math.sqrt(pc * pc + mc2 * mc2) - mc2; };

/**
 * Far-field intensity behind slits, relative to the centre (1 at θ = 0):
 * one slit of width a gives the envelope [sin β/β]², β = πa sinθ/λ; two
 * slits a distance d apart multiply it by cos²(πd sinθ/λ). If the slit each
 * particle passes is recorded ('which'), the two single-slit patterns add
 * and the fringes vanish, leaving the envelope.
 */
export function intensity(theta, { lambda, a, d = 0, mode = 'double' }) {
  const s = Math.sin(theta);
  const b = (Math.PI * a * s) / lambda;
  const env = Math.abs(b) < 1e-9 ? 1 : (Math.sin(b) / b) ** 2;
  if (mode !== 'double') return env;
  const al = (Math.PI * d * s) / lambda;
  return env * Math.cos(al) ** 2;
}
/** Angle of the first dark fringe of a single slit, sin θ = λ/a, and the spacing of double-slit bright fringes, sin θ = λ/d. */
export const firstZero = (lambda, a) => Math.asin(Math.min(1, lambda / a));
export const fringeAngle = (lambda, d) => Math.asin(Math.min(1, lambda / d));

/**
 * A sampler for where single particles land: build the cumulative
 * distribution of pdf on [x0, x1] and invert it. Returns u ∈ [0, 1) → x.
 */
export function makeSampler(pdf, x0, x1, n = 4000) {
  const xs = new Float64Array(n + 1), cdf = new Float64Array(n + 1);
  let acc = 0;
  for (let i = 0; i <= n; i++) {
    xs[i] = x0 + ((x1 - x0) * i) / n;
    if (i > 0) acc += 0.5 * (pdf(xs[i]) + pdf(xs[i - 1])) * (xs[i] - xs[i - 1]);
    cdf[i] = acc;
  }
  const total = acc;
  return (u) => {
    const target = u * total;
    let lo = 0, hi = n;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cdf[mid] < target) lo = mid; else hi = mid; }
    const span = cdf[hi] - cdf[lo];
    return xs[lo] + (span > 0 ? ((target - cdf[lo]) / span) * (xs[hi] - xs[lo]) : 0);
  };
}

/**
 * A Gaussian wave packet with position spread σx (standard deviation of
 * |ψ|²): its momentum spread is σp = ħ/(2σx), the smallest the uncertainty
 * principle allows. |ψ(x)|² and |φ(p)|² are normal distributions.
 */
export const packetSigmaP = (sigmaX) => HBAR / (2 * sigmaX);
export const gaussian = (x, sigma) => Math.exp(-(x * x) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
/** The smallest momentum spread (kg m/s) for a position spread Δx (m), and the matching speed spread for mass m. */
export const minDeltaP = (dx) => HBAR / (2 * dx);
export const minDeltaV = (dx, m) => HBAR / (2 * dx * m);
