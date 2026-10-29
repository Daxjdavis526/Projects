// Special functions for the st-e lessons E6–E12, DOM-free: Legendre and
// associated Legendre functions, real spherical harmonics, Hermite and
// Laguerre polynomials, Chebyshev polynomials and expansion coefficients,
// Bessel functions of both kinds (Jₙ from core/expr.js, Yₙ from Bessel's
// integral representation), their derivatives, the zeros of the annular
// "cross-product" equations, the Riemann zeta function for s > 1, and the
// Gauss–Legendre rule. Everything is computed, nothing tabulated; checked
// against SciPy/DLMF values in test/fa2-special.test.mjs.

import { besselJ, gammaFn } from '../../core/expr.js';

export { besselJ, gammaFn };

const PI = Math.PI;

// ── orthogonal polynomials, by their three-term recurrences ──

/** Pₗ(x), Bonnet: (l+1)P_{l+1} = (2l+1)xPₗ − lP_{l−1}. */
export function legendre(l, x) {
  if (l === 0) return 1;
  let p0 = 1, p1 = x;
  for (let n = 1; n < l; n++) [p0, p1] = [p1, ((2 * n + 1) * x * p1 - n * p0) / (n + 1)];
  return p1;
}

/** Pₗᵐ(x) for 0 ≤ m ≤ l, |x| ≤ 1, WITHOUT the Condon–Shortley phase: (1 − x²)^{m/2} dᵐPₗ/dxᵐ. */
export function assocLegendre(l, m, x) {
  // P_m^m = (2m − 1)!! (1 − x²)^{m/2}, then upward in l
  let pmm = 1;
  const s = Math.sqrt(Math.max(0, 1 - x * x));
  for (let k = 1; k <= m; k++) pmm *= (2 * k - 1) * s;
  if (l === m) return pmm;
  let pm1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return pm1;
  let p0 = pmm, p1 = pm1;
  for (let n = m + 1; n < l; n++) [p0, p1] = [p1, ((2 * n + 1) * x * p1 - (n + m) * p0) / (n - m + 1)];
  return p1;
}

const fact = (n) => { let p = 1; for (let k = 2; k <= n; k++) p *= k; return p; };
export { fact };

/** The normalization √((2l+1)/4π · (l−m)!/(l+m)!) of Yₗᵐ. */
export const ylmNorm = (l, m) => Math.sqrt(((2 * l + 1) / (4 * PI)) * fact(l - Math.abs(m)) / fact(l + Math.abs(m)));

/**
 * The real spherical harmonic: m = 0 → N Pₗ(cos θ); m > 0 → √2 N Pₗᵐ cos mφ;
 * m < 0 → √2 N Pₗ^|m| sin |m|φ (no Condon–Shortley phase). Orthonormal on the sphere.
 */
export function ylmReal(l, m, theta, phi) {
  const am = Math.abs(m), P = assocLegendre(l, am, Math.cos(theta)), N = ylmNorm(l, am);
  if (m === 0) return N * P;
  return Math.SQRT2 * N * P * (m > 0 ? Math.cos(am * phi) : Math.sin(am * phi));
}

/** Physicists' Hermite Hₙ(x): H_{n+1} = 2xHₙ − 2nH_{n−1}. */
export function hermite(n, x) {
  if (n === 0) return 1;
  let h0 = 1, h1 = 2 * x;
  for (let k = 1; k < n; k++) [h0, h1] = [h1, 2 * x * h1 - 2 * k * h0];
  return h1;
}

/** Probabilists' Heₙ(x): He_{n+1} = x Heₙ − n He_{n−1}. */
export function hermiteHe(n, x) {
  if (n === 0) return 1;
  let h0 = 1, h1 = x;
  for (let k = 1; k < n; k++) [h0, h1] = [h1, x * h1 - k * h0];
  return h1;
}

/** Generalized Laguerre Lₙ^(α)(x): (k+1)L_{k+1} = (2k+1+α−x)L_k − (k+α)L_{k−1}. */
export function laguerre(n, x, alpha = 0) {
  if (n === 0) return 1;
  let l0 = 1, l1 = 1 + alpha - x;
  for (let k = 1; k < n; k++) [l0, l1] = [l1, ((2 * k + 1 + alpha - x) * l1 - (k + alpha) * l0) / (k + 1)];
  return l1;
}

/** Chebyshev Tₙ(x): T_{n+1} = 2xTₙ − T_{n−1} (equals cos(n arccos x) on [−1, 1]). */
export function chebT(n, x) {
  if (n === 0) return 1;
  let t0 = 1, t1 = x;
  for (let k = 1; k < n; k++) [t0, t1] = [t1, 2 * x * t1 - t0];
  return t1;
}

/**
 * Chebyshev coefficients a₀ … a_N of f on [−1, 1], f ≈ Σ' aₙTₙ with the first
 * term halved (a₀/2 + a₁T₁ + …), from aₙ = (2/π)∫₀^π f(cos θ) cos nθ dθ
 * evaluated by the trapezoid rule on M points (exponentially accurate: the
 * integrand is smooth and periodic). Returned with a₀ already halved, so
 * f ≈ Σ c[n] Tₙ.
 */
export function chebCoeffs(f, N, M = 2048) {
  const fv = Array.from({ length: M + 1 }, (_, j) => f(Math.cos((PI * j) / M)));
  const c = [];
  for (let n = 0; n <= N; n++) {
    let s = 0;
    for (let j = 0; j <= M; j++) s += (j === 0 || j === M ? 0.5 : 1) * fv[j] * Math.cos((PI * n * j) / M);
    c.push(((2 / M) * s) / (n === 0 ? 2 : 1));
  }
  return c;
}

/** ρ of the largest Bernstein ellipse free of a singularity at the complex point z = (re, im): ρ = |z ± √(z² − 1)|, the root > 1. */
export function bernsteinRho(re, im = 0) {
  // w = z + √(z² − 1) with the branch giving |w| ≥ 1
  const a = re * re - im * im - 1, b = 2 * re * im;
  const r = Math.hypot(a, b), sr = Math.sqrt((r + a) / 2), si = Math.sign(b || 1) * Math.sqrt(Math.max(0, (r - a) / 2));
  const w1 = Math.hypot(re + sr, im + si), w2 = Math.hypot(re - sr, im - si);
  return Math.max(w1, w2);
}

// ── Gauss–Legendre nodes and weights (Newton on Pₙ) ──
const glCache = new Map();
export function gaussLegendre(n) {
  if (glCache.has(n)) return glCache.get(n);
  const x = [], w = [];
  for (let i = 1; i <= n; i++) {
    let z = Math.cos((PI * (i - 0.25)) / (n + 0.5)), dp = 1;
    for (let it = 0; it < 100; it++) {
      const p = legendre(n, z), q = legendre(n - 1, z);
      dp = (n * (z * p - q)) / (z * z - 1);
      const dz = p / dp;
      z -= dz;
      if (Math.abs(dz) < 1e-16) break;
    }
    const p = legendre(n, z), q = legendre(n - 1, z);
    dp = (n * (z * p - q)) / (z * z - 1);
    x.push(z); w.push(2 / ((1 - z * z) * dp * dp));
  }
  const out = { x, w };
  glCache.set(n, out);
  return out;
}

/** ∫ₐᵇ f by composite Gauss–Legendre: `panels` panels of 12 points. */
export function integrate(f, a, b, panels = 24) {
  const { x, w } = gaussLegendre(12), h = (b - a) / panels;
  let s = 0;
  for (let p = 0; p < panels; p++) {
    const c = a + (p + 0.5) * h;
    for (let i = 0; i < 12; i++) s += w[i] * f(c + (h / 2) * x[i]);
  }
  return (s * h) / 2;
}

// ── Bessel functions ──

/**
 * Yₙ(x) for integer n and x > 0, from
 * Yₙ(x) = (1/π)∫₀^π sin(x sin θ − nθ) dθ − (1/π)∫₀^∞ (e^{nt} + (−1)ⁿe^{−nt}) e^{−x sinh t} dt,
 * both integrals by composite Gauss–Legendre (good to about 1e−12 for 0 < x ≤ 60).
 */
export function besselY(n, x) {
  if (n < 0) return (n % 2 ? -1 : 1) * besselY(-n, x);
  if (!(x > 0)) return -Infinity;
  const i1 = integrate((th) => Math.sin(x * Math.sin(th) - n * th), 0, PI, Math.max(16, Math.ceil(x / 2) + 8));
  // the second integrand peaks where x cosh t = n and is negligible once x sinh t − n t > 45
  let T = 1;
  while (x * Math.sinh(T) - n * T < 45 + Math.max(0, n * Math.log(Math.max(1, n / x)))) T += 0.5;
  const sg = n % 2 ? -1 : 1;
  const i2 = integrate((t) => (Math.exp(n * t - x * Math.sinh(t)) + sg * Math.exp(-n * t - x * Math.sinh(t))), 0, T, Math.max(24, Math.ceil(T * 8)));
  return (i1 - i2) / PI;
}

/** Jₙ′(x) and Yₙ′(x) from Z′ₙ = (Z_{n−1} − Z_{n+1})/2. */
export const besselJp = (n, x) => (n === 0 ? -besselJ(1, x) : (besselJ(n - 1, x) - besselJ(n + 1, x)) / 2);
export const besselYp = (n, x) => (n === 0 ? -besselY(1, x) : (besselY(n - 1, x) - besselY(n + 1, x)) / 2);

/** Roots of g on (a, b) by scanning with step h and bisecting each sign change; the first `count`. */
export function roots(g, a, b, h, count = Infinity) {
  const out = [];
  let x = a, f = g(x);
  while (x < b && out.length < count) {
    const x2 = Math.min(b, x + h), f2 = g(x2);
    if (f * f2 < 0) {
      let lo = x, hi = x2, flo = f;
      for (let i = 0; i < 70; i++) {
        const mid = 0.5 * (lo + hi), fm = g(mid);
        if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; }
      }
      out.push(0.5 * (lo + hi));
    }
    x = x2; f = f2;
  }
  return out;
}

/**
 * The annulus a ≤ r ≤ b with b = 1 and inner radius q = a/b:
 * Dirichlet on both circles (a drum with a rigid hub, or TM modes of a coaxial guide):
 *   Fₘ(k) = Jₘ(kq)Yₘ(k) − Jₘ(k)Yₘ(kq) = 0;
 * Neumann on both (TE modes of a coaxial guide): Jₘ′(kq)Yₘ′(k) − Jₘ′(k)Yₘ′(kq) = 0.
 * Returns the first `count` roots k (in units of 1/b).
 */
export const crossD = (m, q, k) => besselJ(m, k * q) * besselY(m, k) - besselJ(m, k) * besselY(m, k * q);
export const crossN = (m, q, k) => besselJp(m, k * q) * besselYp(m, k) - besselJp(m, k) * besselYp(m, k * q);
const annCache = new Map();
export function annulusRoots(m, q, count = 3, kind = 'D') {
  const key = `${kind},${m},${q},${count}`;
  if (annCache.has(key)) return annCache.get(key);
  const g = kind === 'D' ? (k) => crossD(m, q, k) : (k) => crossN(m, q, k);
  // roots are spaced about π/(1 − q); scan finely enough to separate them
  const h = Math.min(0.05, (0.1 * PI) / (1 / (1 - q)));
  const out = roots(g, 1e-3, 400, h, count);
  annCache.set(key, out);
  return out;
}

/** The radial shape of the Dirichlet annulus mode with wavenumber k: R(r) = Yₘ(kq)Jₘ(kr) − Jₘ(kq)Yₘ(kr), zero at r = q and r = 1. */
export const annulusShape = (m, q, k, r) => besselY(m, k * q) * besselJ(m, k * r) - besselJ(m, k * q) * besselY(m, k * r);

/** Riemann ζ(s) for s > 1: direct sum plus the Euler–Maclaurin tail. */
export function zeta(s) {
  const N = 20;
  let sum = 0;
  for (let n = 1; n < N; n++) sum += n ** -s;
  // tail ∫_N^∞ + f(N)/2 − Σ B₂ₖ/(2k)! f^{(2k−1)}(N)
  sum += N ** (1 - s) / (s - 1) + 0.5 * N ** -s;
  const B = [1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66];
  let fac = 1, rising = s;                       // rising = s(s+1)…(s+2k−2)
  for (let k = 1; k <= 5; k++) {
    fac *= (2 * k - 1) * (2 * k);
    sum += (B[k - 1] / fac) * rising * N ** (-s - 2 * k + 1);
    rising *= (s + 2 * k - 1) * (s + 2 * k);
  }
  return sum;
}

/** Euler–Mascheroni constant from H_n − ln n − 1/2n + 1/12n² (n = 10⁶). */
export const EULER_GAMMA = (() => { const n = 1e6; let h = 0; for (let k = n; k >= 1; k--) h += 1 / k; return h - Math.log(n) - 1 / (2 * n) + 1 / (12 * n * n); })();
