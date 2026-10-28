// Partial-wave scattering from a sphere, for the q2b-scatter simulation and
// the PHYS 4710 scattering lessons. DOM-free.
//
// Lengths in units of the sphere's radius a, wavenumbers as ka. Three targets:
//   hard     an impenetrable sphere: tan δₗ = jₗ(ka)/nₗ(ka)
//   well     an attractive square well V = −V₀ inside r < a
//   barrier  a repulsive square barrier V = +V₀ inside r < a
// The strength is the dimensionless g = √(2mV₀)·a/ħ, so inside the sphere the
// wavenumber is K with (Ka)² = (ka)² ± g². Phase shifts come from matching the
// logarithmic derivative at r = a. Then
//   f(θ) = (1/k) Σ (2l + 1) e^{iδₗ} sin δₗ Pₗ(cos θ),   σ = (4π/k²) Σ (2l + 1) sin² δₗ,
// and the first Born approximation for the square well, with Q = qa = 2ka sin(θ/2):
//   f_B/a = ± g² (sin Q − Q cos Q)/Q³   (+ for the well, − for the barrier).
// Spherical Bessel functions jₗ by downward (Miller) recurrence, nₗ upward;
// modified iₗ (for a barrier above the energy) by downward recurrence too.

/** jₗ(x) for l = 0 … L, by Miller's downward recurrence normalized to j₀ = sin x / x. */
export function sphj(L, x) {
  const out = new Float64Array(L + 1);
  if (x < 1e-8) { out[0] = 1; return out; }
  const start = L + Math.ceil(Math.sqrt(40 * (L + x))) + 20;
  let jp1 = 0, j = 1e-30;
  const tmp = new Float64Array(start + 2);
  for (let l = start; l >= 0; l--) {
    const jm1 = ((2 * l + 1) / x) * j - jp1;
    tmp[l] = j;
    jp1 = j; j = jm1;
    if (Math.abs(j) > 1e250) { for (let k = l; k <= start; k++) tmp[k] *= 1e-250; jp1 *= 1e-250; j *= 1e-250; }
  }
  const s = Math.sin(x) / x / tmp[0];
  for (let l = 0; l <= L; l++) out[l] = tmp[l] * s;
  return out;
}

/** nₗ(x) for l = 0 … L (n₀ = −cos x / x), upward recurrence (stable). */
export function sphn(L, x) {
  const out = new Float64Array(L + 1);
  out[0] = -Math.cos(x) / x;
  if (L > 0) out[1] = -Math.cos(x) / (x * x) - Math.sin(x) / x;
  for (let l = 1; l < L; l++) out[l + 1] = ((2 * l + 1) / x) * out[l] - out[l - 1];
  return out;
}

/** Modified iₗ(x) for l = 0 … L (i₀ = sinh x / x), downward recurrence. */
export function sphi(L, x) {
  const out = new Float64Array(L + 1);
  if (x < 1e-8) { out[0] = 1; return out; }
  const start = L + Math.ceil(Math.sqrt(40 * (L + x))) + 20;
  let ip1 = 0, i = 1e-30;
  const tmp = new Float64Array(start + 2);
  for (let l = start; l >= 0; l--) {
    const im1 = ((2 * l + 1) / x) * i + ip1;
    tmp[l] = i;
    ip1 = i; i = im1;
    if (Math.abs(i) > 1e250) { for (let k = l; k <= start; k++) tmp[k] *= 1e-250; ip1 *= 1e-250; i *= 1e-250; }
  }
  const s = Math.sinh(x) / x / tmp[0];
  for (let l = 0; l <= L; l++) out[l] = tmp[l] * s;
  return out;
}

/** Derivatives from the recurrences: fₗ′ = fₗ₋₁ − (l + 1)fₗ/x, with f₋₁ supplied. */
function deriv(f, fm1, x) {
  return Array.from(f, (v, l) => (l === 0 ? fm1 : f[l - 1]) - ((l + 1) * v) / x);
}

/** How many partial waves to keep at a given ka. */
export const lmaxFor = (ka, g = 0) => Math.min(80, Math.ceil(ka + Math.sqrt(ka * ka + g * g) * 0.3 + 4 * Math.cbrt(ka + 1) + 6));

/**
 * Phase shifts δₗ (l = 0 … L) for the target at wavenumber ka and strength g.
 * Returned in (−π/2, π/2] (modulo π, as tan δ fixes them).
 */
export function phaseShifts(target, ka, g = 0, L = lmaxFor(ka, g)) {
  const x = ka;
  const j = sphj(L, x), n = sphn(L, x);
  const jm1 = Math.cos(x) / x, nm1 = Math.sin(x) / x;           // j₋₁ = cos x/x, n₋₁ = sin x/x
  const jd = deriv(j, jm1, x), nd = deriv(n, nm1, x);
  const out = new Float64Array(L + 1);
  if (target === 'hard') { for (let l = 0; l <= L; l++) out[l] = Math.atan(j[l] / n[l]); return out; }
  const K2 = target === 'well' ? x * x + g * g : x * x - g * g;
  let beta;                                                       // K·uₗ′/uₗ, the interior's logarithmic derivative (of the radial function)
  if (K2 > 1e-12) {
    const K = Math.sqrt(K2), ji = sphj(L, K), jid = deriv(ji, Math.cos(K) / K, K);
    beta = Array.from(ji, (v, l) => (K * jid[l]) / v);
  } else if (K2 < -1e-12) {
    const q = Math.sqrt(-K2), ii = sphi(L, q), iid = deriv(ii, Math.cosh(q) / q, q);
    beta = Array.from(ii, (v, l) => (q * iid[l]) / v);
  } else {
    beta = Array.from({ length: L + 1 }, (_, l) => l);         // K = 0: R ∝ rˡ, so a·R′/R = l
  }
  for (let l = 0; l <= L; l++) {
    const num = x * jd[l] - beta[l] * j[l], den = x * nd[l] - beta[l] * n[l];
    out[l] = Math.atan(num / den);
  }
  return out;
}

/** Legendre polynomials P₀ … P_L at c = cos θ. */
export function legendre(L, c) {
  const P = new Float64Array(L + 1);
  P[0] = 1; if (L > 0) P[1] = c;
  for (let l = 1; l < L; l++) P[l + 1] = ((2 * l + 1) * c * P[l] - l * P[l - 1]) / (l + 1);
  return P;
}

/** The scattering amplitude f(θ)/a as [re, im]. */
export function amplitude(deltas, ka, theta) {
  const L = deltas.length - 1, P = legendre(L, Math.cos(theta));
  let re = 0, im = 0;
  for (let l = 0; l <= L; l++) { const d = deltas[l], s = Math.sin(d); re += (2 * l + 1) * Math.cos(d) * s * P[l]; im += (2 * l + 1) * s * s * P[l]; }
  return [re / ka, im / ka];
}

/** dσ/dΩ in units of a². */
export const diffCross = (deltas, ka, theta) => { const [re, im] = amplitude(deltas, ka, theta); return re * re + im * im; };

/** The partial cross sections σₗ and the total σ, in units of πa². */
export function crossSections(deltas, ka) {
  const parts = Array.from(deltas, (d, l) => (4 / (ka * ka)) * (2 * l + 1) * Math.sin(d) ** 2);
  return { parts, total: parts.reduce((s, v) => s + v, 0) };
}

/** First Born amplitude f_B/a for the square well (sign +1) or barrier (−1), at Q = qa. */
export function bornSquare(g, Q, sign = 1) {
  if (Q < 1e-3) return (sign * g * g) / 3 * (1 - (Q * Q) / 10);
  return (sign * g * g * (Math.sin(Q) - Q * Math.cos(Q))) / (Q * Q * Q);
}

/** The Born amplitude at angle θ for wavenumber ka. */
export const bornAt = (target, g, ka, theta) => (target === 'hard' ? NaN : bornSquare(g, 2 * ka * Math.sin(theta / 2), target === 'well' ? 1 : -1));

/** The first Born total cross section in units of πa², by integrating |f_B|² over the sphere. */
export function bornTotal(target, g, ka, n = 400) {
  let s = 0;
  for (let i = 0; i < n; i++) { const th = (Math.PI * (i + 0.5)) / n; s += bornAt(target, g, ka, th) ** 2 * Math.sin(th); }
  return (2 * Math.PI * s * (Math.PI / n)) / Math.PI;
}
