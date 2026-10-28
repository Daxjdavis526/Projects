// A matched filter on a toy gravitational-wave record, DOM-free. The signal is
// the leading-order (Newtonian, quadrupole) inspiral chirp of model/gr-waves.js,
// swept from F_LOW to F_HIGH and cut off there (no merger or ringdown), with
// amplitude ∝ f^(2/3) and its peak scaled to `amp` times the noise's standard
// deviation. The noise is white and Gaussian (σ = 1), from a seeded generator,
// so every picture is reproducible. Real detector noise is coloured and the
// real inner product is weighted by the noise spectrum; white noise is the
// special case where that weight is flat.
//
// The filter correlates the record with two quadrature templates (cosine and
// sine of the template's phase), so it maximizes over the unknown phase, and
// does so at every arrival time at once (by FFT). Its output is the SNR
// ρ(t) = the length of the data’s projection onto the plane of the two
// quadratures at that time (see quadSnr): with noise alone, ρ² at one time is χ²
// with 2 degrees of freedom (mean ρ = √(π/2) ≈ 1.25); with the exact template
// it is near ρ_opt = amp × ‖ĥ‖, where ĥ is the unit-peak signal.
// The chirp-mass "posterior" uses the likelihood maximized over amplitude,
// phase and time, exp(ρ²/2) — a shortcut: real analyses marginalize instead.
// Tested in test/sg2-matched.test.mjs.

import { tauOfF, phaseOfTau, fOfTau } from './gr-waves.js';

export const FS = 4096;          // samples per second
export const N = 4096;           // samples in the record: one second
export const F_LOW = 30, F_HIGH = 250;   // the template's band (Hz)
export const T_END = 0.85;       // the hidden signal reaches F_HIGH this far into the record (s)
export const MC_MIN = 15, MC_MAX = 60;   // chirp masses the record can hold (solar masses)
const NFFT = 2 * N;

/** A seeded uniform generator on [0, 1) (mulberry32). */
export function rng(seed) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** n standard normal numbers from a seed (Box–Muller). */
export function gaussian(n, seed) {
  const u = rng(seed), out = new Float64Array(n);
  for (let i = 0; i < n; i += 2) {
    const r = Math.sqrt(-2 * Math.log(1 - u())), th = 2 * Math.PI * u();
    out[i] = r * Math.cos(th);
    if (i + 1 < n) out[i + 1] = r * Math.sin(th);
  }
  return out;
}

/** In-place radix-2 FFT of (re, im); inverse when inv is true (scaled by 1/n). */
export function fft(re, im, inv = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inv ? 2 : -2) * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

/**
 * The unit-peak template for chirp mass Mc: quadratures c, s (length L), ending
 * at F_HIGH; norm = ‖c‖, and the Gram entries cc, cs, ss used to project the
 * data onto the plane the two quadratures span (they are nearly, not exactly,
 * orthogonal and equal in length).
 */
export function template(Mc) {
  const tau0 = tauOfF(F_LOW, Mc), tau1 = tauOfF(F_HIGH, Mc);
  const L = Math.floor((tau0 - tau1) * FS) + 1;
  const c = new Float64Array(L), s = new Float64Array(L), f = new Float64Array(L);
  for (let k = 0; k < L; k++) {
    const tau = tau1 + (L - 1 - k) / FS;          // time left before the cut-off
    const fk = fOfTau(tau, Mc), a = (fk / F_HIGH) ** (2 / 3), ph = -phaseOfTau(tau, Mc);
    c[k] = a * Math.cos(ph); s[k] = a * Math.sin(ph); f[k] = fk;
  }
  let cc = 0, cs = 0, ss = 0;
  for (let k = 0; k < L; k++) { cc += c[k] * c[k]; cs += c[k] * s[k]; ss += s[k] * s[k]; }
  return { Mc, L, c, s, f, cc, cs, ss, norm: Math.sqrt(cc), duration: L / FS };
}

const tplCache = new Map();
export function cachedTemplate(Mc) {
  const key = Mc.toFixed(4);
  if (!tplCache.has(key)) { if (tplCache.size > 400) tplCache.clear(); tplCache.set(key, template(Mc)); }
  return tplCache.get(key);
}

/** The record: white noise (σ = 1) plus the chirp of chirp mass Mc at peak amplitude amp, ending at T_END, with a seeded phase. */
export function record({ Mc = 30, amp = 0.5, seed = 1 } = {}) {
  const noise = gaussian(N, seed), unit = new Float64Array(N), sig = new Float64Array(N), d = Float64Array.from(noise);
  const phi0 = 2 * Math.PI * rng(seed + 7919)();
  const T = cachedTemplate(Mc), end = Math.round(T_END * FS);
  for (let k = 0; k < T.L; k++) {
    const i = end - T.L + 1 + k;
    if (i < 0 || i >= N) continue;
    unit[i] = T.c[k] * Math.cos(phi0) - T.s[k] * Math.sin(phi0);
    sig[i] = amp * unit[i];
    d[i] += sig[i];
  }
  let u2 = 0;
  for (let i = 0; i < N; i++) u2 += unit[i] * unit[i];
  return { d, noise, unit, sig, phi0, end, Mc, amp, seed, optimal: amp * Math.sqrt(u2) };
}

const specCache = new WeakMap();
function spectrum(x) {
  if (!specCache.has(x)) {
    const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
    re.set(x);
    fft(re, im);
    specCache.set(x, { re, im });
  }
  return specCache.get(x);
}

/**
 * Correlation of a series x with the complex template z = c + i s at every
 * lag (template starting at sample lag), by FFT: Σ x[n + lag] conj(z[n]).
 * Linear in x, so the record's correlation is the noise's plus amp × the signal's.
 */
export function correlate(x, T) {
  const D = spectrum(x);
  const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
  re.set(T.c); im.set(T.s);
  fft(re, im);
  const pr = new Float64Array(NFFT), pi = new Float64Array(NFFT);
  for (let k = 0; k < NFFT; k++) {
    pr[k] = D.re[k] * re[k] + D.im[k] * im[k];
    pi[k] = D.im[k] * re[k] - D.re[k] * im[k];
  }
  fft(pr, pi, true);
  return { re: pr.subarray(0, N), im: pi.subarray(0, N), L: T.L, T };
}

/**
 * The SNR from the two quadrature correlations a = ⟨d, c⟩, b = ⟨d, s⟩: the length
 * of the data’s projection onto span{c, s}, ρ² = (ss a² − 2cs ab + cc b²)/(cc ss − cs²).
 * It is the SNR maximized over amplitude and phase; with noise alone ρ² is χ² with
 * 2 degrees of freedom exactly.
 */
export function quadSnr(T, a, b) {
  const det = T.cc * T.ss - T.cs * T.cs;
  return Math.sqrt(Math.max(0, (T.ss * a * a - 2 * T.cs * a * b + T.cc * b * b) / det));
}

/** SNR series from correlations: rho[j] with the template ending at sample j (NaN where it would stick out of the record). Pass a second correlation and its weight to add them. */
export function snrFrom(A, B = null, w = 0) {
  const rho = new Float64Array(N).fill(NaN);
  for (let lag = 0; lag + A.L <= N; lag++) {
    const r = A.re[lag] + (B ? w * B.re[lag] : 0), i = A.im[lag] + (B ? w * B.im[lag] : 0);
    rho[lag + A.L - 1] = quadSnr(A.T, r, -i);   // the imaginary part is −⟨d, s⟩
  }
  return rho;
}

/** The SNR series of template T over the record d (both quadratures, so the phase is maximized over). */
export const snrSeries = (d, T) => snrFrom(correlate(d, T));

/** The direct (slow) SNR at one end sample j — for testing snrSeries. */
export function snrAt(d, T, j) {
  let a = 0, b = 0;
  for (let k = 0; k < T.L; k++) { const v = d[j - T.L + 1 + k]; a += v * T.c[k]; b += v * T.s[k]; }
  return quadSnr(T, a, b);
}

/** Largest value of a series and where it is. */
export function peak(rho) {
  let best = -Infinity, at = -1;
  for (let j = 0; j < rho.length; j++) if (rho[j] > best) { best = rho[j]; at = j; }
  return { rho: best, j: at, t: at / FS };
}

/**
 * ln Σⱼ exp(ρⱼ²/2): the likelihood (amplitude and phase maximized) summed over
 * every arrival time the template fits — marginalized over arrival time with a
 * flat prior, up to a constant. Summing, not maximizing, is what keeps the
 * posterior smooth: the noise makes the best arrival time jump about.
 */
export function logSumTime(rho) {
  let top = -Infinity;
  for (const v of rho) if (v > top) top = v;
  const t2 = (top * top) / 2;
  let s = 0;
  for (const v of rho) if (Number.isFinite(v)) s += Math.exp((v * v) / 2 - t2);
  return t2 + Math.log(s);
}

/** The template bank: chirp masses evenly spaced from lo to hi. */
export const bank = (lo = MC_MIN, hi = MC_MAX, n = 91) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));

/**
 * A bank fine enough for the posterior: 91 masses across the whole range, plus
 * 121 packed within ±w of `around` (w grows as Mc^(8/3), like the posterior’s
 * width), sorted. A numerical device only: the posterior must be resolved
 * wherever it is not negligible, and for a detectable signal that is near the
 * true value; far from it, the coarse grid suffices because the posterior is broad.
 */
export function bankFor(around) {
  const w = Math.min(20, 3 * (around / 30) ** (8 / 3));
  const fine = bank(Math.max(MC_MIN, around - w), Math.min(MC_MAX, around + w), 121);
  return [...new Set([...bank(MC_MIN, MC_MAX, 91), ...fine].map((m) => +m.toFixed(4)))].sort((a, b) => a - b);
}

/** Peak SNR (over arrival time and phase) for every template in the bank. */
export function scan(d, masses) {
  return masses.map((m) => peak(snrSeries(d, cachedTemplate(m))).rho);
}

/** The bank's correlations with the noise and with the unit signal, kept so that any amplitude can be scanned cheaply. */
export function scanParts(rec, masses) {
  return masses.map((m) => { const T = cachedTemplate(m); return { n: correlate(rec.noise, T), u: correlate(rec.unit, T) }; });
}

/** Peak SNR for every template when the signal has peak amplitude amp. */
export const scanAt = (parts, amp) => parts.map((p) => peak(snrFrom(p.n, p.u, amp)).rho);

/** Peak SNR and time-marginalized log-likelihood for every template, in one pass. */
export function scanBoth(parts, amp) {
  const rho = [], logL = [];
  for (const p of parts) { const r = snrFrom(p.n, p.u, amp); rho.push(peak(r).rho); logL.push(logSumTime(r)); }
  return { rho, logL };
}

/** Posterior on a grid from log-likelihoods: prior(m) × e^(logL), normalized to unit area (trapezoid rule). */
export function posteriorLog(masses, logL, prior = () => 1) {
  const top = Math.max(...logL);
  const w = masses.map((m, i) => prior(m) * Math.exp(logL[i] - top));
  let area = 0;
  for (let i = 1; i < masses.length; i++) area += ((w[i] + w[i - 1]) / 2) * (masses[i] - masses[i - 1]);
  return w.map((v) => v / area);
}

/** Posterior on a grid with the arrival time maximized: prior(m) × exp(ρ(m)²/2), normalized to unit area. */
export function posterior(masses, rhos, prior = () => 1) {
  const top = Math.max(...rhos);
  const w = masses.map((m, i) => prior(m) * Math.exp((rhos[i] * rhos[i] - top * top) / 2));
  let area = 0;
  for (let i = 1; i < masses.length; i++) area += ((w[i] + w[i - 1]) / 2) * (masses[i] - masses[i - 1]);
  return w.map((v) => v / area);
}

/** The central credible interval holding `level` of the posterior (linear interpolation of the cumulative). */
export function credible(masses, post, level = 0.9) {
  const cum = [0];
  for (let i = 1; i < masses.length; i++) cum.push(cum[i - 1] + ((post[i] + post[i - 1]) / 2) * (masses[i] - masses[i - 1]));
  const tot = cum[cum.length - 1];
  const inv = (q) => {
    const target = q * tot;
    for (let i = 1; i < cum.length; i++) if (cum[i] >= target) {
      const f = (target - cum[i - 1]) / Math.max(1e-300, cum[i] - cum[i - 1]);
      return masses[i - 1] + f * (masses[i] - masses[i - 1]);
    }
    return masses[masses.length - 1];
  };
  return { lo: inv((1 - level) / 2), mid: inv(0.5), hi: inv((1 + level) / 2) };
}
