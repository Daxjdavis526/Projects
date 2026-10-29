// Signals and noise for the lab course's noise, averaging, lock-in and data-
// acquisition lessons (lab.A8–A9) and the labf-signal simulation: seeded
// white, flicker (1/f) and random-walk noise; the overlapping Allan
// deviation; a lock-in amplifier (mix with a reference, low-pass with 1–4
// cascaded RC stages) and its equivalent noise bandwidth; aliasing; and an
// ideal ADC. DOM-free; checked by test/labf-signal.test.mjs.
//
// Flicker noise is built as a sum of first-order (AR(1)) processes with
// equal variances and time constants spaced evenly in log τ — each has a
// Lorentzian spectrum, and the sum is close to 1/f between the shortest and
// longest τ (a standard construction). It is a teaching model of 1/f noise,
// not a physical model of any particular device.

import { makeRng } from '../../core/rng.js';

const TAU = 2 * Math.PI;

/** A seeded standard-normal source (Box–Muller). */
export function normal(seed) {
  const rng = makeRng(seed);
  let spare = null;
  return () => {
    if (spare !== null) { const s = spare; spare = null; return s; }
    let u = rng.next();
    while (u <= 1e-12) u = rng.next();
    const v = rng.next(), r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(TAU * v);
    return r * Math.cos(TAU * v);
  };
}

/**
 * n samples at rate fs of white (σ per sample), flicker (total standard
 * deviation `flicker`, built from `k` AR(1) terms with τ from 2/fs to n/fs)
 * and random-walk (step σ per sample `walk`) noise, summed.
 */
export function noise({ n, fs, white = 0, flicker = 0, walk = 0, seed = 1, k = 10 }) {
  const z = normal(seed), x = new Float64Array(n);
  const dt = 1 / fs;
  const terms = [];
  if (flicker > 0) {
    const t0 = 2 * dt, t1 = n * dt;
    for (let j = 0; j < k; j++) {
      const tau = t0 * (t1 / t0) ** (j / (k - 1));
      const phi = Math.exp(-dt / tau);
      const s = flicker / Math.sqrt(k);                      // each term's stationary σ
      terms.push({ phi, q: s * Math.sqrt(1 - phi * phi), v: s * z() });
    }
  }
  let w = 0;
  for (let i = 0; i < n; i++) {
    let f = 0;
    for (const T of terms) { T.v = T.phi * T.v + T.q * z(); f += T.v; }
    if (walk) w += walk * z();
    x[i] = (white ? white * z() : 0) + f + w;
  }
  return x;
}

/** The overlapping Allan deviation of samples x at averaging length m (τ = m/fs). */
export function allan(x, m) {
  const n = x.length;
  if (2 * m >= n) return NaN;
  const c = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) c[i + 1] = c[i] + x[i];
  let s = 0, cnt = 0;
  for (let i = 0; i + 2 * m <= n; i++) {
    const a = (c[i + m] - c[i]) / m, b = (c[i + 2 * m] - c[i + m]) / m;
    s += (b - a) ** 2; cnt++;
  }
  return Math.sqrt(s / (2 * cnt));
}

/** Allan deviations at m = 1, 2, 4, … while 2m ≤ n/4: [{ m, tau, adev }]. */
export function allanCurve(x, fs) {
  const out = [];
  for (let m = 1; 8 * m <= x.length; m *= 2) out.push({ m, tau: m / fs, adev: allan(x, m) });
  return out;
}

/** Equivalent noise bandwidth (Hz) of n cascaded RC low-pass stages of time constant τ. */
export function enbw(tau, poles = 1) {
  // ∫₀^∞ |H|² df with |H|² = (1 + (2πfτ)²)^(−n):  Γ(n − ½) / (4√π τ Γ(n))
  const g = { 1: Math.sqrt(Math.PI), 2: Math.sqrt(Math.PI) / 2, 3: (3 * Math.sqrt(Math.PI)) / 4, 4: (15 * Math.sqrt(Math.PI)) / 8 }[poles];
  const gn = [1, 1, 1, 2, 6][poles];
  return g / (4 * Math.sqrt(Math.PI) * tau * gn);
}

/**
 * A lock-in amplifier run on a simulated input
 *   v(t) = A sin(2π f t + φ) + hum·sin(2π fh t) + white noise (σ per sample) + random-walk drift,
 * mixed with 2 sin(2π f t + θ) and 2 cos(2π f t + θ) and low-passed by `poles` RC
 * stages of time constant τ. X → A cos(φ − θ), Y → A sin(φ − θ), R → A (amplitude, not rms).
 * Returns the outputs decimated to about `keep` points, the last values, the
 * input's rms, a short stretch of the input, and the predicted σ of X and Y.
 */
export function lockin({ fs = 20000, T = 10, f = 1000, A = 1, phi = 0, theta = 0, white = 10, hum = 0, fh = 60, drift = 0, tau = 0.3, poles = 2, seed = 1, keep = 600, show = 0.05 }) {
  const n = Math.round(fs * T), dt = 1 / fs, z = normal(seed);
  const al = 1 - Math.exp(-dt / tau);
  const sx = new Float64Array(poles), sy = new Float64Array(poles);
  const every = Math.max(1, Math.floor(n / keep));
  const t = [], X = [], Y = [], snip = [], sig = [];
  const nShow = Math.round(show * fs);
  let w = 0, ss = 0;
  for (let i = 0; i < n; i++) {
    const ti = i * dt, ph = TAU * f * ti;
    if (drift) w += drift * z();
    const s = A * Math.sin(ph + phi);
    const v = s + hum * Math.sin(TAU * fh * ti) + (white ? white * z() : 0) + w;
    ss += v * v;
    let ix = 2 * v * Math.sin(ph + theta), iy = 2 * v * Math.cos(ph + theta);
    for (let p = 0; p < poles; p++) { sx[p] += al * (ix - sx[p]); ix = sx[p]; sy[p] += al * (iy - sy[p]); iy = sy[p]; }
    if (i % every === 0) { t.push(ti); X.push(ix); Y.push(iy); }
    if (i < nShow) { snip.push(v); sig.push(s); }
  }
  const x = sx[poles - 1], y = sy[poles - 1];
  const B = enbw(tau, poles);
  // white noise of σ per sample has one-sided density 2σ²/fs; mixing by 2·sin doubles its variance
  const sigmaOut = Math.sqrt((4 * white * white / fs) * B);
  return { t, X, Y, x, y, R: Math.hypot(x, y), rms: Math.sqrt(ss / n), snip, sig, dtSnip: dt, enbw: B, sigmaOut, n };
}

/** The frequency a tone at f appears at when sampled at fs: signed, in (−fs/2, fs/2]. */
export function alias(f, fs) {
  let a = f - fs * Math.round(f / fs);
  if (a <= -fs / 2) a += fs;
  return a;
}

/** An ideal N-bit ADC over [−range, range): the code's voltage (mid-tread rounding, clipped). */
export function quantize(v, bits, range) {
  const lsb = (2 * range) / 2 ** bits;
  const k = Math.max(-(2 ** (bits - 1)), Math.min(2 ** (bits - 1) - 1, Math.round(v / lsb)));
  return k * lsb;
}
export const lsbOf = (bits, range) => (2 * range) / 2 ** bits;
