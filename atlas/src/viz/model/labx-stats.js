// The statistics behind sims/labx-stats.js and the lab course's uncertainty
// lessons (lab.A1–A4): seeded draws from the distributions a measurement
// meets (normal, rectangular, triangular, Poisson), the normal and χ² tail
// probabilities a test needs, linear (partial-derivative) and Monte Carlo
// propagation of uncertainty with correlated inputs, and the weighted mean
// with its χ² and Birge ratio. DOM-free; checked by test/labx-stats.test.mjs.
//
// Every random number comes from the Atlas's seeded generator (core/rng.js),
// so a seed always gives the same data in the browser and in Node.

import { makeRng } from '../../core/rng.js';

const TAU = 2 * Math.PI;

// ─── special functions ────────────────────────────────────────────────────

const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
/** ln Γ(x) for x > 0 (Lanczos, g = 7: about 15 significant figures). */
export function lnGamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lnGamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(TAU) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** The regularized lower incomplete gamma function P(a, x) and its complement Q = 1 − P. */
export function gammaPQ(a, x) {
  if (!(x > 0)) return { P: 0, Q: 1 };
  const lnPre = a * Math.log(x) - x - lnGamma(a);
  if (x < a + 1) {
    // series
    let sum = 1 / a, term = sum, ap = a;
    for (let n = 0; n < 1000; n++) { ap += 1; term *= x / ap; sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-17) break; }
    const P = sum * Math.exp(lnPre);
    return { P, Q: 1 - P };
  }
  // continued fraction (modified Lentz)
  const tiny = 1e-300;
  let b = x + 1 - a, c = 1 / tiny, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  const Q = Math.exp(lnPre) * h;
  return { P: 1 - Q, Q };
}

/** erf and erfc, accurate in the far tail (erfc through the incomplete gamma). */
export function erfc(x) {
  if (x < 0) return 2 - erfc(-x);
  return gammaPQ(0.5, x * x).Q;
}
export const erf = (x) => 1 - erfc(x);

/** The standard normal density, cumulative distribution and upper tail. */
export const normalPdf = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(TAU);
export const normalCdf = (z) => 0.5 * erfc(-z / Math.SQRT2);
export const normalSf = (z) => 0.5 * erfc(z / Math.SQRT2);
/** The probability that a normal variable lies within ±k standard deviations of its mean. */
export const within = (k) => erf(k / Math.SQRT2);
/** Two-sided p-value of a z-score: P(|Z| ≥ |z|). */
export const pTwo = (z) => erfc(Math.abs(z) / Math.SQRT2);

/** The standard normal quantile z with Φ(z) = p (Acklam's rational fit, then two Newton steps). */
export function normalQuantile(p) {
  if (!(p > 0 && p < 1)) return p === 0 ? -Infinity : p === 1 ? Infinity : NaN;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let z;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  else { const q = p - 0.5, r = q * q; z = ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
  for (let i = 0; i < 2; i++) { const e = normalCdf(z) - p; z -= e / normalPdf(z); }
  return z;
}

/** The χ² density with ν degrees of freedom. */
export function chi2Pdf(x, nu) {
  if (x < 0) return 0;
  if (x === 0) return nu === 2 ? 0.5 : nu < 2 ? Infinity : 0;
  return Math.exp((nu / 2 - 1) * Math.log(x) - x / 2 - (nu / 2) * Math.log(2) - lnGamma(nu / 2));
}
/** P(χ²_ν ≥ x): the p-value of a χ² test. */
export const chi2Sf = (x, nu) => gammaPQ(nu / 2, x / 2).Q;
export const chi2Cdf = (x, nu) => gammaPQ(nu / 2, x / 2).P;

/** Student's t: the two-sided coverage P(|T| ≤ t) with ν degrees of freedom (via the incomplete beta as a gamma-free series). */
export function tWithin(t, nu) {
  // P(|T| ≤ t) = 1 − I_{ν/(ν+t²)}(ν/2, ½), the regularized incomplete beta, by continued fraction
  const x = nu / (nu + t * t);
  return 1 - betaI(x, nu / 2, 0.5);
}
/** The t value with P(|T| ≤ t) = p (bisection). */
export function tQuantile(p, nu) {
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (tWithin(m, nu) < p) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
function betaI(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lnBt = lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const cf = (xx, aa, bb) => {
    const tiny = 1e-300;
    let c = 1, d = 1 - ((aa + bb) * xx) / (aa + 1);
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    let h = d;
    for (let m = 1; m < 1000; m++) {
      const m2 = 2 * m;
      let an = (m * (bb - m) * xx) / ((aa + m2 - 1) * (aa + m2));
      d = 1 + an * d; if (Math.abs(d) < tiny) d = tiny; c = 1 + an / c; if (Math.abs(c) < tiny) c = tiny; d = 1 / d; h *= d * c;
      an = (-(aa + m) * (aa + bb + m) * xx) / ((aa + m2) * (aa + m2 + 1));
      d = 1 + an * d; if (Math.abs(d) < tiny) d = tiny; c = 1 + an / c; if (Math.abs(c) < tiny) c = tiny; d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return h;
  };
  if (x < (a + 1) / (a + b + 2)) return (Math.exp(lnBt) * cf(x, a, b)) / a;
  return 1 - (Math.exp(lnBt) * cf(1 - x, b, a)) / b;
}

/** The Poisson probability of k counts when λ are expected. */
export function poissonPmf(k, lam) {
  if (k < 0 || !Number.isInteger(k)) return 0;
  if (lam === 0) return k === 0 ? 1 : 0;
  return Math.exp(k * Math.log(lam) - lam - lnGamma(k + 1));
}
/** P(N ≤ k) for a Poisson count with mean λ. */
export const poissonCdf = (k, lam) => (k < 0 ? 0 : gammaPQ(k + 1, lam).Q);

// ─── seeded draws ─────────────────────────────────────────────────────────

/** A standard normal deviate (Box–Muller) from a seeded generator. */
export function gauss(rng) {
  let u = rng.next();
  while (u <= 1e-12) u = rng.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rng.next());
}
/** A Poisson count with mean λ (Knuth's product method, split into pieces of at most 30 for large λ). */
export function poisson(rng, lam) {
  let n = 0, left = lam;
  while (left > 0) {
    const piece = Math.min(left, 30);
    left -= piece;
    const L = Math.exp(-piece);
    let p = 1, k = -1;
    do { k++; p *= rng.next(); } while (p > L);
    n += k;
  }
  return n;
}

export const DISTS = ['normal', 'uniform', 'triangular', 'poisson'];

/**
 * One draw from a named distribution:
 *   normal(mu, sigma) · uniform(mu, a) of half-width a · triangular(mu, a) of half-width a · poisson(lam).
 */
export function draw(rng, dist, P) {
  switch (dist) {
    case 'normal': return P.mu + P.sigma * gauss(rng);
    case 'uniform': return P.mu + P.a * (2 * rng.next() - 1);
    case 'triangular': return P.mu + P.a * (rng.next() - rng.next());
    case 'poisson': return poisson(rng, P.lam);
    default: throw new Error(`unknown distribution ${dist}`);
  }
}
/** The true mean and standard deviation of a named distribution (σ = a/√3 rectangular, a/√6 triangular, √λ Poisson). */
export function moments(dist, P) {
  switch (dist) {
    case 'normal': return { mean: P.mu, sd: P.sigma };
    case 'uniform': return { mean: P.mu, sd: P.a / Math.sqrt(3) };
    case 'triangular': return { mean: P.mu, sd: P.a / Math.sqrt(6) };
    case 'poisson': return { mean: P.lam, sd: Math.sqrt(P.lam) };
    default: return { mean: NaN, sd: NaN };
  }
}
/** Its density (or, for Poisson, its probability at an integer). */
export function density(dist, P, x) {
  switch (dist) {
    case 'normal': return normalPdf((x - P.mu) / P.sigma) / P.sigma;
    case 'uniform': return Math.abs(x - P.mu) <= P.a ? 1 / (2 * P.a) : 0;
    case 'triangular': return Math.abs(x - P.mu) <= P.a ? (P.a - Math.abs(x - P.mu)) / (P.a * P.a) : 0;
    case 'poisson': return poissonPmf(Math.round(x), P.lam);
    default: return NaN;
  }
}

/**
 * n seeded samples. With `m` > 1 each sample is the mean of m draws (the
 * central limit theorem's view).
 */
export function samples(dist, P, n, seed = 1, m = 1) {
  const rng = makeRng(seed);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < m; j++) s += draw(rng, dist, P);
    out[i] = s / m;
  }
  return out;
}

// ─── descriptive statistics ───────────────────────────────────────────────

/** n, mean, sample SD (n − 1), SEM, and the population SD (n), as numpy's ddof = 1 and ddof = 0. */
export function stats(xs) {
  const n = xs.length;
  let mean = 0;
  for (const x of xs) mean += x;
  mean /= n;
  let ss = 0;
  for (const x of xs) ss += (x - mean) ** 2;
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : NaN;
  return { n, mean, sd, sem: sd / Math.sqrt(n), sdPop: Math.sqrt(ss / n), ss };
}
/** The q-quantile (0–1) of a sample by linear interpolation (numpy's default). */
export function quantile(xs, q) {
  const s = Float64Array.from(xs).sort();
  const pos = (s.length - 1) * q, i = Math.floor(pos), f = pos - i;
  return i + 1 < s.length ? s[i] + f * (s[i + 1] - s[i]) : s[i];
}
/** Counts in nb equal bins over [lo, hi); values outside are counted as under/over. */
export function histogram(xs, lo, hi, nb) {
  const counts = new Array(nb).fill(0), w = (hi - lo) / nb;
  let under = 0, over = 0;
  for (const x of xs) {
    const k = Math.floor((x - lo) / w);
    if (k < 0) under++; else if (k >= nb) over++; else counts[k]++;
  }
  return { counts, w, under, over };
}

// ─── propagation ──────────────────────────────────────────────────────────

/**
 * Linear propagation of uncertainty for f(x₁ … xₙ): the partial derivatives
 * by central differences, then σ_f² = Σ cᵢ²σᵢ² + 2 Σ_{i<j} cᵢcⱼ ρᵢⱼ σᵢσⱼ.
 * rho: a correlation matrix, or a single ρ for two inputs.
 */
export function linear(f, mu, sigma, rho = 0) {
  const n = mu.length;
  const R = (i, j) => (i === j ? 1 : Array.isArray(rho) ? rho[i][j] : rho);
  const c = mu.map((m, i) => {
    const h = 1e-6 * (Math.abs(m) || 1) + 1e-9 * (sigma[i] || 0);
    const up = mu.slice(), dn = mu.slice();
    up[i] = m + h; dn[i] = m - h;
    return (f(up) - f(dn)) / (2 * h);
  });
  let v = 0;
  const terms = [];
  for (let i = 0; i < n; i++) { const ti = (c[i] * sigma[i]) ** 2; terms.push(ti); v += ti; }
  let cross = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) cross += 2 * c[i] * c[j] * R(i, j) * sigma[i] * sigma[j];
  v += cross;
  return { value: f(mu), sigma: Math.sqrt(Math.max(v, 0)), partials: c, terms, cross };
}

/**
 * Monte Carlo propagation (the GUM Supplement 1 idea): N seeded draws of
 * normal inputs (two may be correlated with coefficient ρ, by a Cholesky
 * factor), f evaluated at each, and the output's mean, SD and percentiles.
 */
export function monteCarlo(f, mu, sigma, { rho = 0, N = 20000, seed = 1 } = {}) {
  const rng = makeRng(seed);
  const n = mu.length;
  const out = new Float64Array(N), ins = mu.map(() => new Float64Array(N));
  const s = Math.sqrt(Math.max(0, 1 - rho * rho));
  const x = new Array(n);
  for (let k = 0; k < N; k++) {
    const z = mu.map(() => gauss(rng));
    for (let i = 0; i < n; i++) {
      const zi = i === 1 && n >= 2 ? rho * z[0] + s * z[1] : z[i];
      x[i] = mu[i] + sigma[i] * zi;
      ins[i][k] = x[i];
    }
    out[k] = f(x);
  }
  const ok = Array.from(out).filter(Number.isFinite);
  const st = stats(ok);
  return {
    samples: out, inputs: ins, mean: st.mean, sd: st.sd,
    median: quantile(ok, 0.5), lo: quantile(ok, 0.15865525393145707), hi: quantile(ok, 0.8413447460685429),
    lo95: quantile(ok, 0.025), hi95: quantile(ok, 0.975), bad: N - ok.length,
  };
}

// ─── comparing and combining results ─────────────────────────────────────

/** How many combined standard uncertainties apart two results are (cov: their covariance, e.g. a shared systematic). */
export const zscore = (a, ua, b, ub, cov = 0) => Math.abs(a - b) / Math.sqrt(ua * ua + ub * ub - 2 * cov);

/** The inverse-variance weighted mean, its uncertainty, χ² about it, ν = N − 1, the Birge ratio √(χ²/ν) and the p-value. */
export function weightedMean(x, s) {
  let W = 0, WX = 0;
  for (let i = 0; i < x.length; i++) { const w = 1 / (s[i] * s[i]); W += w; WX += w * x[i]; }
  const mean = WX / W, sigma = 1 / Math.sqrt(W);
  let chi2 = 0;
  for (let i = 0; i < x.length; i++) chi2 += ((x[i] - mean) / s[i]) ** 2;
  const dof = x.length - 1;
  return { mean, sigma, chi2, dof, birge: dof > 0 ? Math.sqrt(chi2 / dof) : NaN, p: dof > 0 ? chi2Sf(chi2, dof) : NaN, weights: s.map((si) => 1 / (si * si) / W) };
}
