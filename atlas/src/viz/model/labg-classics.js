// The simulated classic experiments behind sims/labg-classics.js and the lab
// course's lessons lab.E.18–E.26: the chaotic pendulum (a Lyapunov exponent
// from near-returns of one long record), single- and double-slit
// diffraction, fibre-optic cut-back attenuation and numerical aperture,
// radioactive decay of Ba-137m counted in bins, Johnson noise of resistors,
// electron diffraction in graphite, the Balmer lines and the Rydberg
// constant, the speed of sound in a resonance tube, and a torsion pendulum.
// DOM-free; checked by test/labg-classics.test.mjs. Same conventions as
// model/labe-rig.js (E.1–E.9).
//
// Each reading is the true value for the setting, plus noise made from
// standard normal deviates drawn from a seeded generator and kept with the
// row (z), rounded to the instrument's resolution — so a seed always gives the
// same data, and a systematic switched on or off re-reads the *same* scatter.
// Each experiment carries one real systematic as a flag, and the analyses a
// lab would compare as plot choices.
//
// Constants are CODATA 2022 (h, e, c, k_B, R exact in the 2019 SI). Line
// wavelengths and half-lives are NIST ASD and NNDC values. Apparatus numbers
// (slit widths, fibre losses, bulb sizes, wire gauges …) are illustrative
// values typical of teaching apparatus, not the specification of any product.

import { makeRng } from '../../core/rng.js';
import { gaussian, roundTo, fitLine, fitOrigin, pm } from './lab-bench.js';
import { normalCdf, chi2Sf } from './labx-stats.js';
import * as CH from './cm5-chaos.js';

export { gaussian, roundTo, pm, chi2Sf, fitLine, fitOrigin };
const TAU = 2 * Math.PI;
const D2R = Math.PI / 180;

// ─── fitting (as model/labe-rig.js, kept here so the two files stay independent) ─

/** The weighted mean as a fit of a constant (dof n − 1). */
export function fitMean(y, sy) {
  const w = y.map((_, i) => 1 / sy[i] ** 2);
  const S = w.reduce((s, v) => s + v, 0);
  const a = y.reduce((s, v, i) => s + w[i] * v, 0) / S;
  const chi2 = y.reduce((s, v, i) => s + w[i] * (v - a) ** 2, 0);
  const dof = y.length - 1;
  return { a, b: 0, sa: Math.sqrt(1 / S), sb: 0, cov: 0, chi2, dof, chi2r: dof > 0 ? chi2 / dof : NaN, n: y.length, residuals: y.map((v) => v - a), mean: true };
}
/** Solve A x = b (small dense system, partial pivoting). */
function solve(A, b) {
  const n = b.length, Mx = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(Mx[r][c]) > Math.abs(Mx[p][c])) p = r;
    [Mx[c], Mx[p]] = [Mx[p], Mx[c]];
    if (Math.abs(Mx[c][c]) < 1e-300) return null;
    for (let r = 0; r < n; r++) if (r !== c) { const f = Mx[r][c] / Mx[c][c]; for (let k = c; k <= n; k++) Mx[r][k] -= f * Mx[c][k]; }
  }
  return Mx.map((r, i) => r[n] / r[i]);
}
function inverse(A) {
  const n = A.length, cols = [];
  for (let j = 0; j < n; j++) { const e = Array(n).fill(0); e[j] = 1; const x = solve(A, e); if (!x) return null; cols.push(x); }
  return A.map((_, i) => cols.map((c) => c[i]));
}
/** Nonlinear weighted least squares by Levenberg–Marquardt; covariance (JᵀWJ)⁻¹ with the σ's taken as true. */
export function fitCurve(f, x, y, sy, p0, { scale = null, iters = 300 } = {}) {
  const n = x.length, m = p0.length;
  const sc = scale || p0.map((v) => Math.abs(v) || 1);
  let p = p0.slice();
  const chi = (q) => { let c = 0; for (let i = 0; i < n; i++) { const r = (y[i] - f(x[i], q)) / sy[i]; c += r * r; } return c; };
  const normal = (q) => {
    const J = x.map((xi, i) => { const f0 = f(xi, q); return q.map((_, j) => { const hq = q.slice(); const hh = 1e-6 * sc[j]; hq[j] += hh; return (f(xi, hq) - f0) / hh / sy[i]; }); });
    const r = x.map((xi, i) => (y[i] - f(xi, q)) / sy[i]);
    const A = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (_, b) => J.reduce((s, row) => s + row[a] * row[b], 0)));
    const g = Array.from({ length: m }, (_, a) => J.reduce((s, row, i) => s + row[a] * r[i], 0));
    return { A, g };
  };
  let c = chi(p), lam = 1e-3;
  for (let it = 0; it < iters; it++) {
    const { A, g } = normal(p);
    const d = solve(A.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lam) : v))), g);
    if (!d) { lam *= 10; continue; }
    const pt = p.map((v, j) => v + d[j]), ct = chi(pt);
    if (Number.isFinite(ct) && ct <= c) { const done = c - ct < 1e-10 * Math.max(1, c); p = pt; c = ct; lam = Math.max(1e-12, lam / 10); if (done) break; }
    else lam *= 10;
    if (lam > 1e12) break;
  }
  const cov = inverse(normal(p).A) || p.map(() => p.map(() => NaN));
  const dof = n - m;
  return { p, cov, sp: p.map((_, j) => Math.sqrt(cov[j][j])), chi2: c, dof, chi2r: dof > 0 ? c / dof : NaN, n, residuals: x.map((xi, i) => y[i] - f(xi, p)), f: (t) => f(t, p), curve: true };
}
/** Linear propagation: σ of g(p) from the covariance of p (numerical gradient). */
export function propagate(g, p, cov, scale = null) {
  const g0 = g(p);
  const grad = p.map((v, j) => { const q = p.slice(); const hh = 1e-6 * ((scale && scale[j]) || Math.abs(v) || 1); q[j] += hh; return (g(q) - g0) / hh; });
  let s2 = 0;
  for (let i = 0; i < p.length; i++) for (let j = 0; j < p.length; j++) s2 += grad[i] * cov[i][j] * grad[j];
  return { value: g0, sigma: Math.sqrt(Math.max(0, s2)) };
}

// ─── constants (CODATA 2022) ──────────────────────────────────────────────
export const K = {
  h: 6.62607015e-34,           // J s (exact)
  e: 1.602176634e-19,          // C (exact)
  c: 299792458,                // m/s (exact)
  kB: 1.380649e-23,            // J/K (exact)
  R: 8.314462618,              // J mol⁻¹ K⁻¹ (exact: N_A k_B)
  me: 9.1093837139e-31,        // kg
  meMp: 5.446170214889e-4,     // mₑ/mₚ
  Rinf: 10973731.568157,       // m⁻¹
  nAir: 1.000277,              // refractive index of laboratory air in the visible (dry, 15 °C, 101 kPa: Edlén)
};
K.RH = K.Rinf / (1 + K.meMp);  // the Rydberg constant for hydrogen's reduced mass, 10 967 758 m⁻¹
export const BA137M = 2.552;   // min: the half-life of Ba-137m (NNDC)
export const HENE = 632.816;   // nm: the He–Ne laser line in air (vacuum 632.991 nm, NIST ASD)
export const AIR = { gamma: 1.400, M: 0.0289647 };   // dry air: ratio of specific heats, molar mass (kg/mol)
/** The ideal-gas speed of sound in dry air at T (°C): √(γRT/M). */
export const vSound = (Tc) => Math.sqrt((AIR.gamma * K.R * (Tc + 273.15)) / AIR.M);
/** The Balmer line from level n: vacuum and air wavelengths (nm), Bohr levels with the reduced mass. */
export function balmer(n) {
  const vac = 1e9 / (K.RH * (0.25 - 1 / (n * n)));
  return { vac, air: vac / K.nAir };
}
/** An electron's de Broglie wavelength (m) after V volts, relativistic or not. */
export const lamE = (V, rel = true) => K.h / Math.sqrt(2 * K.me * K.e * V * (rel ? 1 + (K.e * V) / (2 * K.me * K.c ** 2) : 1));

/** A uniform deviate in (0, 1) made from a standard normal one. */
const unif = (z) => Math.min(1 - 1e-15, Math.max(1e-15, normalCdf(z)));
/** A Poisson deviate of mean mu from a uniform u (inverse CDF; normal approximation for big means). */
export function poisson(mu, u) {
  if (mu > 400) {
    let z = 0; // invert the normal CDF (bisection: plenty for the purpose)
    let lo = -9, hi = 9;
    for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (normalCdf(m) < u) lo = m; else hi = m; }
    z = (lo + hi) / 2;
    return Math.max(0, Math.round(mu + Math.sqrt(mu) * z));
  }
  let p = Math.exp(-mu), F = p, n = 0;
  while (F < u && n < 10000) { n++; p *= mu / n; F += p; }
  return n;
}
const lineP = (fit) => ({ p: [fit.a, fit.b], cov: [[fit.sa ** 2, fit.cov], [fit.cov, fit.sb ** 2]] });

// ─── E.18: the chaotic pendulum ───────────────────────────────────────────
// Taylor's driven damped pendulum φ̈ + 2βφ̇ + ω₀² sin φ = γω₀² cos ωt, with a
// 1 s drive period. The "pairs" are near-returns found in one long record:
// moments when the state nearly repeats, Δφ₀ apart, followed forward.
// Chaos amplifies rounding: a browser's Math.sin and Node's differ in the last
// bit for some arguments, and after a hundred drive periods the two would be
// on different trajectories. So the start states are stored here — 360 points
// on the γ = 1.105 attractor, two drive periods apart, at whole periods (drive
// phase 0), computed once from φ = −π/2 at rest after 200 periods of transient
// — and each pair is integrated for only 16 periods, over which a last-bit
// difference grows to about 10⁻¹¹ rad: the same data everywhere.
export const CHAOS_STATES = [
  -2.040248, 13.83951, -1.722126, 15.85268, -2.98069, 7.38563, -0.799623, 18.99399, -0.075444, 17.689, -0.034475, 16.22836, -3.032355, 7.01956, -0.253733, 18.78108, -1.916934, 14.58164, -2.437492, 11.33532, -1.457514, 17.19024, -1.102774, 18.30243,
  -0.040394, 17.01337, -0.441421, 19.1353, -2.072673, 13.63834, -1.551553, 16.74032, -1.961258, 14.33258, -2.19993, 12.95161, -1.198545, 18.27043, -0.041413, 17.05057, -0.360093, 19.03086, -2.372315, 11.67853, -1.195213, 18.28269, -0.040154, 17.00424,
  -0.463168, 19.15283, -1.929896, 14.50542, -2.364722, 11.83979, -1.192657, 18.29209, -0.03928, 16.96903, -0.553988, 19.18491, -1.210436, 17.94342, -0.166196, 18.42019, -0.650205, 19.14406, -0.499654, 19.16286, -1.566486, 16.4607, -2.483217, 10.93304,
  -1.717065, 15.88019, -2.969211, 7.46801, -0.952932, 18.701, -0.034807, 16.18862, -3.02463, 7.08141, -0.320908, 18.9574, -2.355441, 11.79312, -1.146603, 18.45712, -0.033529, 16.42557, -2.711031, 9.32469, -2.99386, 7.30921, -0.647952, 19.15694,
  -0.552122, 19.17442, -1.155022, 18.12901, -0.076387, 17.7171, -0.034313, 16.25822, -3.021286, 7.09593, -0.34592, 19.00747, -2.393749, 11.53234, -1.269464, 17.99887, -0.116328, 18.10254, -0.111426, 18.04957, -0.075819, 17.6938, -0.034461, 16.2311,
  -3.031934, 7.02224, -0.256875, 18.79088, -1.949547, 14.38904, -2.251078, 12.61148, -1.108944, 18.58595, -0.034801, 16.17722, -3.017698, 7.13347, -0.385915, 19.07277, -2.342055, 11.88372, -1.114226, 18.5682, -0.034613, 16.19824, -3.028986, 7.04831,
  -0.282889, 18.86581, -2.172658, 13.00357, -1.161986, 18.40294, -0.033866, 16.58395, -2.10884, 13.42544, -1.399917, 17.45121, -0.660215, 19.14781, -0.481972, 19.1542, -1.699549, 15.79101, -3.01325, 7.1531, -0.422548, 19.11825, -2.193881, 12.86617,
  -1.111384, 18.57778, -0.034717, 16.18631, -3.023491, 7.09, -0.331213, 18.97894, -2.378472, 11.63661, -1.215114, 18.20866, -0.050034, 17.28919, -0.076887, 17.72305, -0.034269, 16.26661, -3.015633, 7.1359, -0.398939, 19.09043, -2.29927, 12.17134,
  -1.047216, 18.78489, -0.034059, 16.32104, -2.952857, 7.5854, -1.182898, 18.04871, -0.107228, 18.02902, -0.069161, 17.60556, -0.034075, 16.27826, -3.005719, 7.20641, -0.500564, 19.17513, -1.658609, 16.00313, -2.928478, 7.761, -1.537012, 16.61327,
  -2.250324, 12.51195, -1.046325, 18.78766, -0.034033, 16.32844, -2.940891, 7.6715, -1.356225, 17.40637, -0.792013, 19.00438, -0.08363, 17.786, -0.03385, 16.39681, -2.793551, 8.73276, -2.907889, 7.91027, -1.830904, 15.08949, -2.850798, 8.36388,
  -2.535662, 10.56785, -2.058821, 13.8635, -1.798002, 15.43025, -3.013819, 7.16212, -0.424488, 19.1203, -2.183764, 12.93178, -1.133992, 18.5009, -0.033825, 16.31816, -2.956532, 7.55897, -1.13031, 18.21888, -0.052753, 17.34781, -0.053512, 17.36296,
  -0.049353, 17.27318, -0.085633, 17.82345, -0.034049, 16.53738, -2.311579, 12.10482, -1.066516, 18.72432, -0.03475, 16.19745, -3.0286, 7.05127, -0.286172, 18.87452, -2.194943, 12.85928, -1.109173, 18.58519, -0.034793, 16.17803, -3.018266, 7.12922,
  -0.380381, 19.06474, -2.356627, 11.78508, -1.149734, 18.44616, -0.033519, 16.45554, -2.615932, 10.00171, -2.591767, 10.24352, -2.415727, 11.4868, -1.361337, 17.61948, -0.432046, 19.12652, -2.128213, 13.28835, -1.306085, 17.85136, -0.206364, 18.60774,
  -1.270947, 17.72606, -0.354203, 19.02073, -2.376232, 11.65187, -1.20774, 18.23627, -0.045685, 17.18167, -0.159886, 18.38602, -0.559198, 19.17444, -1.100431, 18.29884, -0.040854, 17.03052, -0.402464, 19.09333, -2.269688, 12.3684, -1.032878, 18.82891,
  -0.033866, 16.45675, -2.614341, 10.01298, -2.582124, 10.31251, -2.351685, 11.9292, -1.162587, 18.40077, -0.033902, 16.59077, -2.078601, 13.61536, -1.539265, 16.80076, -1.849418, 14.98428, -2.780315, 8.87953, -2.96663, 7.48781, -0.989491, 18.61368,
  -0.034927, 16.16525, -3.007887, 7.20661, -0.48713, 19.16893, -1.764996, 15.44123, -3.006582, 7.21606, -0.501208, 19.17539, -1.653423, 16.02962, -2.912695, 7.87469, -1.763004, 15.46502, -3.012969, 7.16847, -0.433212, 19.12912, -2.135745, 13.24037,
  -1.278168, 17.96429, -0.133905, 18.2287, -0.247008, 18.74559, -1.709244, 15.74002, -3.023081, 7.08372, -0.330094, 18.97667, -2.376478, 11.65019, -1.208543, 18.23327, -0.046117, 17.19329, -0.14786, 18.31684, -0.400569, 19.08014, -2.169144, 13.02623,
  -1.171526, 18.36886, -0.034711, 16.69511, -1.601465, 16.30198, -2.676496, 9.57136, -2.895654, 8.03403, -2.024055, 13.95335, -1.831829, 15.23679, -2.950296, 7.63237, -1.243974, 17.83632, -0.245693, 18.75295, -1.806081, 15.21517, -2.919921, 7.85611,
  -1.68856, 15.86113, -2.992134, 7.30366, -0.656143, 19.15165, -0.506973, 19.16572, -1.509853, 16.72784, -2.060828, 13.72608, -1.629433, 16.34608, -2.57743, 10.27378, -2.344012, 11.9818, -1.147416, 18.45428, -0.033523, 16.43322, -2.687772, 9.49086,
  -2.934865, 7.74539, -1.470136, 16.92048, -1.698506, 15.8086, -3.008149, 7.18934, -0.474831, 19.16199, -1.858652, 14.9189, -2.729258, 9.25144, -3.014594, 7.154, -0.415259, 19.11022, -2.230002, 12.63033, -1.05368, 18.76478, -0.03428, 16.27188,
  -3.011584, 7.16465, -0.439157, 19.13473, -2.100782, 13.46205, -1.419015, 17.36596, -0.794458, 19.00078, -0.080721, 17.75286, -0.034059, 16.31326, -2.964483, 7.50182, -1.018154, 18.54074, -0.034145, 16.26121, -3.019196, 7.11069, -0.365089, 19.04092,
  -2.384952, 11.59242, -1.237303, 18.12435, -0.06904, 17.62087, -0.034257, 16.25099, -3.025167, 7.06867, -0.311723, 18.93706, -2.325824, 11.99319, -1.082291, 18.67371, -0.03512, 16.14955, -2.991207, 7.33036, -0.681668, 19.13251, -0.3817, 19.05416,
  -2.226253, 12.65492, -1.057973, 18.75133, -0.03444, 16.24352, -3.028546, 7.04517, -0.283508, 18.86747, -2.176956, 12.97581, -1.150761, 18.44259, -0.033523, 16.46554, -2.581889, 10.2423, -2.373924, 11.77625, -1.217046, 18.2014, -0.051321, 17.31765,
  -0.063983, 17.54645, -0.033573, 16.41089, -2.753838, 9.01803, -3.013006, 7.15736, -0.426467, 19.12236, -2.173225, 12.99991, -1.160477, 18.4083, -0.033783, 16.5672, -2.182048, 12.95768, -1.150564, 18.44328, -0.033522, 16.4636, -2.588589, 10.19503,
  -2.418393, 11.46825, -1.372364, 17.57191, -0.49127, 19.16968, -1.721144, 15.67703, -3.029894, 7.03678, -0.273094, 18.83886, -2.09844, 13.4768, -1.429439, 17.31889, -0.873256, 18.86756, -0.036002, 16.7597, -1.316678, 17.56285, -0.553868, 19.18496,
  -1.211738, 17.9389, -0.169159, 18.4357, -0.694071, 19.11037, -0.303297, 18.90423, -2.154165, 13.12255, -1.215826, 18.20602, -0.050494, 17.29952, -0.071837, 17.65871, -0.034476, 16.22439, -3.032749, 7.01725, -0.250902, 18.7721, -1.886512, 14.75882,
  -2.598298, 10.19698, -2.458329, 11.18934, -1.562283, 16.68707, -2.0569, 13.75045, -1.650073, 16.23844, -2.701958, 9.38962, -2.974529, 7.45254, -0.898732, 18.81837, -0.033977, 16.51311, -2.409124, 11.44399, -1.331591, 17.74566, -0.296189, 18.89819,
  -2.234905, 12.59812, -1.048668, 18.78039, -0.034105, 16.30935, -2.970113, 7.46137, -0.940468, 18.72929, -0.034493, 16.23417, -3.031339, 7.02615, -0.261398, 18.8047, -1.99436, 14.12002, -1.985618, 14.31998, -2.231747, 12.74059, -1.133837, 18.50143,
  -0.03383, 16.31699, -2.958312, 7.54617, -1.104987, 18.29651, -0.041015, 17.03637, -0.389756, 19.07652, -2.314062, 12.07224, -1.064139, 18.73186, -0.034668, 16.20886, -3.031819, 7.02623, -0.259223, 18.7981, -1.973129, 14.24809, -2.111628, 13.52708,
  -1.521859, 16.88554, -1.688129, 15.86279, -2.991606, 7.30744, -0.662528, 19.14724, -0.473448, 19.14912, -1.761121, 15.46229, -3.011617, 7.17856, -0.447241, 19.14186, -2.05051, 13.7761, -1.666365, 16.15257, -2.786521, 8.78339, -2.936059, 7.70748,
];
/** The model's long-run largest Lyapunov exponent at γ = 1.105 (s⁻¹): Benettin's method over 5 × 20 000 drive periods from stored states, 0.7227 ± 0.0026 (their standard error). */
export const CHAOS_LAMBDA = 0.7227;
const ensCache = new Map();
const lyapCache = new Map();
/** The largest Lyapunov exponent (s⁻¹): the stored long-run value at γ = 1.105, else Benettin's method over 600 periods (reproducible only for a periodic attractor). */
export function chaosLambda(gamma) {
  if (gamma === 1.105) return CHAOS_LAMBDA;
  if (!lyapCache.has(gamma)) lyapCache.set(gamma, CH.lyapunov({ gamma }, [-Math.PI / 2, 0], { skip: 50, periods: 600 }));
  return lyapCache.get(gamma);
}
/** K pairs of runs Δφ₀ apart, starting at stored states picked at random (by `ens`) from the whole record: the signed Δφ at each whole drive period, and finely sampled ln|Δφ| for pictures. */
export function chaosEnsemble(P) {
  const key = `${P.d0}|${P.pairs}|${P.ens}|${P.Ttot}`;
  if (ensCache.has(key)) return ensCache.get(key);
  const o = { gamma: 1.105 }, rng = makeRng(1000 + P.ens), nS = CHAOS_STATES.length / 2;
  const pick = [], used = new Set();
  while (pick.length < P.pairs) { const k = Math.floor(rng.next() * nS); if (!used.has(k)) { used.add(k); pick.push(k); } }
  const strobe = [], fine = [];
  for (const k0 of pick) {
    const s = [CHAOS_STATES[2 * k0], CHAOS_STATES[2 * k0 + 1]];
    const A = CH.run(o, s, { periods: P.Ttot, spp: 200, every: 20 }), B = CH.run(o, [s[0] + P.d0, s[1]], { periods: P.Ttot, spp: 200, every: 20 });
    const d = A.phi.map((p, i) => B.phi[i] - p);
    strobe.push(d.filter((_, i) => i % 10 === 0));
    fine.push({ t: A.t, ln: d.map((x) => Math.log(Math.max(Math.abs(x), 1e-12))) });
  }
  const out = { strobe, fine };
  ensCache.set(key, out);
  return out;
}

// ─── E.19: slits ──────────────────────────────────────────────────────────
/** Relative intensity at screen position x (m) for slits of width a, centres d apart (d = 0: one slit), distance L. */
export function slitI(P, x, L = P.L) {
  const s = x / Math.hypot(x, L);
  const lam = P.lam * 1e-9;
  const b = (Math.PI * P.a * s) / lam;
  const env = Math.abs(b) < 1e-9 ? 1 : (Math.sin(b) / b) ** 2;
  return P.d ? env * Math.cos((Math.PI * P.d * s) / lam) ** 2 : env;
}
/** Screen position (m) of order m: a bright fringe of the double slit (d sin θ = mλ) or a zero of the single slit (a sin θ = mλ). */
export const fringeX = (sep, m, lam, L) => { const s = (m * lam * 1e-9) / sep; return L * Math.tan(Math.asin(s)); };

// ─── E.20: fibre ──────────────────────────────────────────────────────────
/** Power out (dBm) of a length L (m) of fibre: launched P0, loss αL, plus cladding light that dies away over Lc. */
export const fibreP = (P, L, clad = true) => P.P0 - P.alpha * L + (clad ? P.C * Math.exp(-L / P.Lc) : 0);
/** The numerical aperture √(n₁² − n₂²). */
export const naOf = (n1, n2) => Math.sqrt(n1 * n1 - n2 * n2);

// ─── E.22: Johnson noise ──────────────────────────────────────────────────
/** The bandwidth (Hz) a resistor R (Ω) actually delivers through a brick-wall band B when a capacitance C shunts it: f_c·atan(B/f_c). */
export function bandR(P, R, cap = true) {
  if (!cap || !P.C) return P.B;
  const fc = 1 / (TAU * R * P.C);
  return fc * Math.atan(P.B / fc);
}

// ─── E.23: electron diffraction ───────────────────────────────────────────
/** The two graphite spacings (m) from the lattice constant a: d₁₀ = a√3/2, d₁₁ = a/2. */
export const graphiteD = (a) => [(a * Math.sqrt(3)) / 2, a / 2];
/** The ring diameter (m) on a flat screen at L for spacing d at V volts: D = 2L tan 2θ, sin θ = λ/2d. */
export const ringD = (P, d, V) => 2 * P.L * Math.tan(2 * Math.asin(lamE(V) / (2 * d)));

// ─── E.24: grating ────────────────────────────────────────────────────────
/** Diffraction angle (deg) of an air wavelength (nm) in order m from a grating of N lines per mm. */
export const gratingTheta = (lamNm, N, m = 1) => Math.asin((m * lamNm * 1e-9 * N * 1e3)) / D2R;

// ─── E.26: torsion pendulum ───────────────────────────────────────────────
/** The torsion constant (N m/rad) of a wire of radius a, length l and shear modulus G: πGa⁴/(2l). */
export const kappaOf = (P) => (Math.PI * P.G * P.aw ** 4) / (2 * P.lw);
/** The bar's moment of inertia (kg m²) with its clamp, and each added mass's own (a cylinder about its axis, parallel to the wire). */
export const I0of = (P) => (P.Mb * P.Lb ** 2) / 12 + P.Icl;
export const Icm = (P) => (P.m * P.Rm ** 2) / 2;
/** The period (s) with the two masses at r (m). */
export const torsionT = (P, r) => TAU * Math.sqrt((I0of(P) + 2 * Icm(P) + 2 * P.m * r * r) / kappaOf(P));

// ─── the experiments ──────────────────────────────────────────────────────
//   (fields as in model/labe-rig.js)
//   title, note, defaults, flags, setting, options, nz, read(s, z, P, F), columns,
//   defaultAxes, axes { key: { label, xlabel, ylabel, fit, points, results, expect? } }, raw(R, P, F, i)

const d1 = (x) => x.toFixed(1), d2 = (x) => x.toFixed(2), d3 = (x) => x.toFixed(3);

export const EXPERIMENTS = {
  // ── E.18: the chaotic pendulum ─────────────────────────────────────────
  chaos: {
    title: 'A driven damped pendulum: near-returns pulled apart',
    defaults: { gamma: 1.105, d0: 2e-4, pairs: 20, ens: 1, enc: 0.022, encCoarse: 0.36, Ttot: 16, dt: 1, tmin: 1, ysat: -3.5 },
    // γ (drive strength); rad (separation at a near-return); pairs averaged; which stretch of the record; deg per encoder count (fine: 16 384 counts per turn; coarse: 1000); s; s; s (the fit starts after the separations have lined up); ln|Δφ| where the fit stops (Δφ ≈ 0.03 rad, well before saturation)
    note: 'Taylor’s pendulum (drive period 1 s, ω₀ = 1.5ω, β = ω₀/4) integrated by RK4; each pair starts Δφ₀ = 0.2 mrad apart in angle only, and each angle is read by an encoder whose quantization is treated as Gaussian.',
    flags: [{ key: 'coarse', label: 'Coarse encoder (0.36° per count)', value: false, explain: 'With 1000 counts per turn (0.36° each) the encoder cannot resolve a 0.2 mrad separation: the early separations read as the noise of the encoder, which lifts the start of the curve and flattens the fitted slope.' }],
    setting: { kind: 'sequence', label: 'time', series: null },
    nz: 20,
    read(t, z, P, F) {
      const E = chaosEnsemble(P), i = Math.round(t / P.dt);
      const sig = ((F.coarse ? P.encCoarse : P.enc) * D2R) / Math.sqrt(12) * Math.SQRT2;
      const lns = E.strobe.map((d, k) => Math.log(Math.max(Math.abs(d[i] + sig * z[k % z.length]), 1e-9)));
      const n = lns.length, mu = lns.reduce((s, v) => s + v, 0) / n;
      const sd = Math.sqrt(lns.reduce((s, v) => s + (v - mu) ** 2, 0) / (n - 1));
      return { t, y: roundTo(mu, 0.01), sy: sd / Math.sqrt(n), n };
    },
    columns: [{ head: 't (s)', get: (q) => String(q.t) }, { head: 'mean ln|Δφ|', get: (q) => d2(q.y) }, { head: 'σ (mean)', get: (q) => d2(q.sy) }],
    defaultAxes: 'growth',
    axes: {
      growth: {
        label: 'fit the growth only', xlabel: 't (s)', ylabel: 'mean ln|Δφ|', fit: 'line',
        points(R, P) {
          const keep = []; for (const q of R) { if (q.t < P.tmin) continue; if (q.y > P.ysat) break; keep.push(q); }
          return { x: keep.map((q) => q.t), y: keep.map((q) => q.y), sy: keep.map((q) => q.sy) };
        },
        results: (fit, P) => [{ key: 'lambda', label: '$\\lambda$ = slope', value: fit.b, sigma: fit.sb, scale: 1, unit: '\\mathrm{s^{-1}}', accepted: chaosLambda(P.gamma) }],
      },
      all: {
        label: 'fit the whole record', xlabel: 't (s)', ylabel: 'mean ln|Δφ|', fit: 'line',
        points: (R) => ({ x: R.map((q) => q.t), y: R.map((q) => q.y), sy: R.map((q) => q.sy) }),
        results: (fit, P) => [{ key: 'lambda', label: '$\\lambda$ = slope', value: fit.b, sigma: fit.sb, scale: 1, unit: '\\mathrm{s^{-1}}', accepted: chaosLambda(P.gamma) }],
      },
    },
    raw(R, P, F, i) {
      const E = chaosEnsemble(P);
      const q = R[i];
      const paths = E.fine.map((f, k) => ({ pts: f.t.map((t, j) => [t, Math.max(-11, f.ln[j])]), color: k % 2 ? 'violet' : 'accent', width: 0.9, alpha: 0.45 }));
      return {
        x: [0, P.Ttot], y: [-11, 1.5], xlabel: 't (s)', ylabel: 'ln|Δφ| of each pair',
        paths, hlines: [{ y: P.ysat, color: 'ink3', dash: [5, 4] }],
        vlines: q ? [{ x: q.t, color: 'gold' }] : [],
        texts: [{ s: `${P.pairs} pairs, Δφ₀ = ${P.d0 * 1000} mrad`, x: 0.2, y: 1.2, color: 'ink2', size: 11 }, { s: 'the fit stops here', x: P.Ttot - 0.2, y: P.ysat, color: 'ink3', size: 10, align: 'right', dy: 12 }],
      };
    },
  },

  // ── E.19: double slit (λ from known d) ─────────────────────────────────
  slit2: {
    title: 'A He–Ne laser through a double slit, fringes scanned with a photodiode',
    defaults: { lam: HENE, a: 0.040e-3, d: 0.250e-3, L: 0.800, dL: 0.012, sx: 0.06 },
    // nm; m (each slit's width); m (centre-to-centre); m (the distance you measured); m (the slits sit this far behind the holder's front face); mm (σ of a fringe centre)
    note: 'Fraunhofer pattern sinc²β·cos²α on a flat screen; each bright fringe is located at d sin θ = mλ (the envelope moves the maxima by far less than the scatter).',
    flags: [{ key: 'Lref', label: 'L measured to the holder’s front face', value: false, explain: 'The slits are etched on a slide that sits 12 mm behind the front of its holder. A tape run to the front face reads L 12 mm short — a 1.5% scale error in λ that no fit can see.' }],
    setting: { kind: 'slider', key: 'm', label: 'Fringe order $m$', unit: '', min: -5, max: 5, step: 1, value: 3, series: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], explain: 'Which bright fringe the photodiode is scanned across: 0 is the centre, ±1 the next on each side.' },
    nz: 1,
    read(m, z, P, F) {
      const L = P.L + (F.Lref ? P.dL : 0);
      return { m, x: roundTo(1000 * fringeX(P.d, m, P.lam, L) + P.sx * z[0], 0.01), sx: P.sx };
    },
    columns: [{ head: 'm', get: (q) => String(q.m) }, { head: 'x (mm)', get: (q) => d2(q.x) }],
    defaultAxes: 'xm',
    axes: {
      xm: {
        label: '$x$ against $m$', xlabel: 'fringe order m', ylabel: 'x (mm)', fit: 'line', integerX: true,
        points: (R) => ({ x: R.map((q) => q.m), y: R.map((q) => q.x), sy: R.map((q) => q.sx) }),
        expect: (P) => (m) => (1000 * m * P.lam * 1e-9 * P.L) / P.d,
        results(fit, P) {
          return [
            { key: 'lam', label: '$\\lambda = d\\,b/L$', value: (fit.b * 1e-3 * P.d) / P.L * 1e9, sigma: (fit.sb * 1e-3 * P.d) / P.L * 1e9, scale: 1, unit: '\\mathrm{nm}', accepted: HENE },
            { key: 'x0', label: 'centre offset (intercept)', value: fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{mm}', accepted: null },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const L = P.L + (F.Lref ? P.dL : 0);
      const pts = []; for (let k = 0; k <= 1500; k++) { const x = -14 + (28 * k) / 1500; pts.push([x, slitI(P, x / 1000, L)]); }
      const env = []; for (let k = 0; k <= 300; k++) { const x = -14 + (28 * k) / 300; env.push([x, slitI({ ...P, d: 0 }, x / 1000, L)]); }
      return {
        x: [-14, 14], y: [-0.05, 1.2], xlabel: 'x on the screen (mm)', ylabel: 'intensity', yticks: 3,
        paths: [{ pts: env, color: 'ink3', width: 1, dash: [4, 4] }, { pts, color: 'bad', width: 1.6 }],
        vlines: q ? [{ x: q.x, color: 'gold' }] : [],
        texts: [{ s: 'dashed: one slit’s envelope', x: 13.6, y: 1.12, color: 'ink3', size: 10.5, align: 'right' }, q ? { s: `m = ${q.m}`, x: q.x, y: 1.12, color: 'gold', size: 11, align: 'center' } : null].filter(Boolean),
      };
    },
  },

  // ── E.19: single slit (a from known λ) ─────────────────────────────────
  slit1: {
    title: 'A He–Ne laser through one slit: the dark fringes located',
    defaults: { lam: HENE, a: 0.080e-3, d: 0, L: 1.000, dL: 0.012, sx: 0.12 },
    note: 'Fraunhofer pattern sinc²β on a flat screen; the zeros sit at a sin θ = nλ. The slit’s nominal width is 0.080 mm.',
    flags: [{ key: 'Lref', label: 'L measured to the holder’s front face', value: false, explain: 'The slit sits 12 mm behind the front of its holder: a tape run to the front face reads L short, and the width comes out 1.2% small.' }],
    setting: { kind: 'slider', key: 'n', label: 'Dark fringe $n$', unit: '', min: -4, max: 4, step: 1, value: 2, series: [-4, -3, -2, -1, 1, 2, 3, 4], explain: 'Which zero of the pattern is located: ±1 on each side of the bright centre, then ±2 …' },
    nz: 1,
    read(n, z, P, F) {
      const L = P.L + (F.Lref ? P.dL : 0);
      return { m: n, x: roundTo(1000 * fringeX(P.a, n, P.lam, L) + P.sx * z[0], 0.01), sx: P.sx };
    },
    columns: [{ head: 'n', get: (q) => String(q.m) }, { head: 'x (mm)', get: (q) => d2(q.x) }],
    defaultAxes: 'xn',
    axes: {
      xn: {
        label: '$x$ against $n$', xlabel: 'dark fringe n', ylabel: 'x (mm)', fit: 'line', integerX: true,
        points: (R) => ({ x: R.map((q) => q.m), y: R.map((q) => q.x), sy: R.map((q) => q.sx) }),
        expect: (P) => (n) => (1000 * n * P.lam * 1e-9 * P.L) / P.a,
        results(fit, P) {
          const { p, cov } = lineP(fit);
          return [{ key: 'a', label: '$a = \\lambda L/b$', ...propagate((q) => (P.lam * 1e-9 * P.L) / (q[1] * 1e-3) * 1e3, p, cov), scale: 1, unit: '\\mathrm{mm}', accepted: P.a * 1e3 }];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const L = P.L + (F.Lref ? P.dL : 0);
      const pts = []; for (let k = 0; k <= 1200; k++) { const x = -36 + (72 * k) / 1200; pts.push([x, Math.sqrt(slitI(P, x / 1000, L))]); }
      return {
        x: [-36, 36], y: [-0.05, 1.15], xlabel: 'x on the screen (mm)', ylabel: '√intensity', yticks: 3,
        paths: [{ pts, color: 'bad', width: 1.6 }],
        vlines: q ? [{ x: q.x, color: 'gold' }] : [],
        texts: [{ s: 'square root of the intensity, so the side lobes show', x: 35, y: 1.08, color: 'ink3', size: 10.5, align: 'right' }, q ? { s: `n = ${q.m}`, x: q.x, y: 0.9, color: 'gold', size: 11, align: 'center' } : null].filter(Boolean),
      };
    },
  },

  // ── E.20: fibre cut-back ───────────────────────────────────────────────
  cutback: {
    title: 'Cutting back a plastic optical fibre at 650 nm',
    defaults: { P0: -3.00, alpha: 0.180, C: 0.90, Lc: 3.0, sP: 0.08 },
    // dBm launched into the core; dB/m; dB of cladding light at the launch; m (its decay length); dB (σ of a re-cleave and re-seat)
    note: 'Loss is taken as uniform along the fibre; each cut is re-cleaved and re-seated in the meter, which scatters the reading. Without a mode stripper, light launched into the cladding adds power that dies away over the first few metres.',
    flags: [{ key: 'clad', label: 'No cladding-mode stripper', value: true, explain: 'An overfilled launch puts some light into the cladding, where it leaks away over a few metres. At short lengths the meter sees it as extra power, which bends the line up at the left and steepens the fitted slope. A stripper (index-matching gel on a stretch of bare fibre) removes it.' }],
    setting: { kind: 'slider', key: 'L', label: 'Fibre length $L$', unit: '\\mathrm{m}', min: 1, max: 50, step: 1, value: 50, series: [50, 40, 32, 25, 18, 12, 8, 5, 3, 1], explain: 'How much fibre is left after each cut. A real cut-back goes from long to short: you cannot uncut a fibre.' },
    nz: 1,
    read(L, z, P, F) { return { L, p: roundTo(fibreP(P, L, F.clad) + P.sP * z[0], 0.01), sp: P.sP }; },
    columns: [{ head: 'L (m)', get: (q) => String(q.L) }, { head: 'P (dBm)', get: (q) => d2(q.p) }],
    defaultAxes: 'dB',
    axes: {
      dB: {
        label: 'power (dBm) against $L$', xlabel: 'L (m)', ylabel: 'P (dBm)', fit: 'line', zeroX: true,
        points: (R) => ({ x: R.map((q) => q.L), y: R.map((q) => q.p), sy: R.map((q) => q.sp) }),
        expect: (P) => (L) => fibreP(P, L, false),
        results: (fit, P) => [
          { key: 'alpha', label: '$\\alpha = -$slope', value: -fit.b, sigma: fit.sb, scale: 1, unit: '\\mathrm{dB/m}', accepted: P.alpha },
          { key: 'P0', label: 'launched (intercept)', value: fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{dBm}', accepted: P.P0 },
        ],
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const L = q ? q.L : 50;
      const turns = Math.max(1, Math.round(L / 5));
      const circles = []; for (let k = 0; k < Math.min(turns, 10); k++) circles.push({ x: 0, y: 0, r: 1.2 + 0.09 * k, color: 'teal', width: 1.4, alpha: 0.75 });
      return {
        x: [-6.5, 6.5], y: [-2.6, 2.6], equal: true, axes: false, circles,
        paths: [{ pts: [[-6, 0.8], [-4.2, 0.8], [-4.2, -0.8], [-6, -0.8], [-6, 0.8]], color: 'bad', width: 1.6 }, { pts: [[-4.2, 0], [-1.25, 0]], color: 'teal', width: 1.4 }, { pts: [[1.25 + 0.09 * Math.min(turns, 10), 0], [3.8, 0]], color: 'teal', width: 1.4 }, { pts: [[3.8, 1.0], [6.3, 1.0], [6.3, -1.0], [3.8, -1.0], [3.8, 1.0]], color: 'ink2', width: 1.6 }],
        texts: [
          { s: '650 nm', x: -5.1, y: 0, color: 'bad', size: 11, align: 'center' }, { s: 'source', x: -5.1, y: -1.25, color: 'ink3', size: 10, align: 'center' },
          { s: `${L} m of fibre`, x: 0, y: -2.2, color: 'teal', size: 11, align: 'center' },
          { s: q ? `${d2(q.p)} dBm` : '— dBm', x: 5.05, y: 0, color: 'gold', size: 12, align: 'center' }, { s: 'power meter', x: 5.05, y: -1.4, color: 'ink3', size: 10, align: 'center' },
        ],
      };
    },
  },

  // ── E.20: numerical aperture from the far-field spot ───────────────────
  na: {
    title: 'The far-field spot of the same fibre on a card',
    defaults: { n1: 1.492, n2: 1.402, rc: 0.49, sr: 0.25, eye: 0.92 },
    // core and cladding indices (PMMA, fluorinated polymer: typical); mm (core radius); mm (σ of a radius read on the card); edge-judging factor on tan θ
    note: 'A fully filled step-index fibre throws a cone of half-angle θ with sin θ = NA; the spot radius is the core radius plus z tan θ. Judging the edge by eye finds where the spot looks dim, not where it ends.',
    flags: [{ key: 'eye', label: 'Edge judged by eye', value: false, explain: 'The spot fades gradually toward its rim. By eye you mark where it looks dim — inside the true cone — so every radius reads short and the NA comes out low. The standard marks the radius where the intensity falls to 5% of the centre, with a scanned detector.' }],
    setting: { kind: 'slider', key: 'z', label: 'Card distance $z$', unit: '\\mathrm{mm}', min: 5, max: 40, step: 1, value: 20, series: [5, 10, 15, 20, 25, 30, 35, 40], explain: 'How far from the fibre’s end the card stands.' },
    nz: 1,
    read(z, w, P, F) {
      const tn = Math.tan(Math.asin(naOf(P.n1, P.n2))) * (F.eye ? P.eye : 1);
      return { z, r: roundTo(P.rc + z * tn + P.sr * w[0], 0.1), sr: P.sr };
    },
    columns: [{ head: 'z (mm)', get: (q) => String(q.z) }, { head: 'spot radius (mm)', get: (q) => d1(q.r) }],
    defaultAxes: 'rz',
    axes: {
      rz: {
        label: 'spot radius against $z$', xlabel: 'z (mm)', ylabel: 'spot radius (mm)', fit: 'line', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => q.z), y: R.map((q) => q.r), sy: R.map((q) => q.sr) }),
        expect: (P) => (z) => P.rc + z * Math.tan(Math.asin(naOf(P.n1, P.n2))),
        results(fit, P) {
          const { p, cov } = lineP(fit);
          return [
            { key: 'NA', label: '$\\mathrm{NA} = \\sin(\\arctan b)$', ...propagate((q) => Math.sin(Math.atan(q[1])), p, cov), scale: 1, unit: '', accepted: naOf(P.n1, P.n2) },
            { key: 'rc', label: 'core radius (intercept)', value: fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{mm}', accepted: P.rc },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const z = q ? q.z : 20;
      const tn = Math.tan(Math.asin(naOf(P.n1, P.n2)));
      const r = P.rc + z * tn, re = P.rc + z * tn * P.eye;
      return {
        x: [-6, 46], y: [-26, 26], equal: true, axes: false,
        paths: [
          { pts: [[-6, P.rc], [0, P.rc]], color: 'teal', width: 2 }, { pts: [[-6, -P.rc], [0, -P.rc]], color: 'teal', width: 2 },
          { pts: [[0, P.rc], [z, r]], color: 'bad', width: 1.2, dash: [4, 3] }, { pts: [[0, -P.rc], [z, -r]], color: 'bad', width: 1.2, dash: [4, 3] },
          { pts: [[z, -24], [z, 24]], color: 'ink2', width: 3 },
          { pts: [[z + 1.5, -r], [z + 1.5, r]], color: 'gold', width: 2 },
          ...(F.eye ? [{ pts: [[z + 3.5, -re], [z + 3.5, re]], color: 'warn', width: 2 }] : []),
        ],
        texts: [
          { s: 'fibre', x: -3, y: P.rc + 3, color: 'teal', size: 10.5, align: 'center' },
          { s: `card at z = ${z} mm`, x: z, y: 24.5, color: 'ink2', size: 11, align: 'center', dy: -6 },
          { s: 'cone edge', x: z + 2.5, y: r, color: 'gold', size: 10.5, dy: -2 },
          ...(F.eye ? [{ s: 'where it looks dim', x: z + 4.5, y: -re, color: 'warn', size: 10.5, dy: 10 }] : []),
          { s: 'side view, to scale', x: -5.5, y: -24, color: 'ink3', size: 10 },
        ],
      };
    },
  },

  // ── E.21: radioactive decay of Ba-137m ─────────────────────────────────
  decay: {
    title: 'Ba-137m eluted from a Cs-137 generator, counted in 30 s bins',
    defaults: { R0: 120, half: BA137M, bg: 0.60, bgT: 600, bgN: 351, bin: 0.5, Ttot: 14.5, dt: 0.5 },
    // counts/s at t = 0 from the sample; min; counts/s background (true); s (background run); counts seen in that run; min (bin width); min; min
    note: 'Counts are Poisson in every bin; the background (cosmic rays, the room) was counted for 10 minutes before the elution: 351 counts. Dead time is negligible at these rates.',
    flags: [{ key: 'bg', label: 'Subtract the background', value: true, explain: 'The counter also sees about 0.6 counts per second from cosmic rays and the room. Leave it in and the late bins, where the sample is nearly gone, level off: the line of ln N bends, and the fitted half-life comes out long.' }],
    setting: { kind: 'sequence', label: 'time', series: null },
    nz: 1,
    read(t, z, P) {
      const lam = Math.LN2 / (P.half * 60), T = P.bin * 60;
      const mu = (P.R0 / lam) * Math.exp(-lam * t * 60) * (1 - Math.exp(-lam * T)) + P.bg * T;
      return { t, N: poisson(mu, unif(z[0])), mu };
    },
    columns: [{ head: 'bin starts (min)', get: (q) => d1(q.t) }, { head: 'counts', get: (q) => String(q.N) }],
    defaultAxes: 'log',
    axes: {
      log: {
        label: '$\\ln N$ against $t$', xlabel: 't (min)', ylabel: 'ln(counts per bin)', fit: 'line',
        points(R, P, F) {
          const B = F.bg ? (P.bgN / P.bgT) * P.bin * 60 : 0, sB = F.bg ? (Math.sqrt(P.bgN) / P.bgT) * P.bin * 60 : 0;
          const keep = R.filter((q) => q.N - B > 2);
          return { x: keep.map((q) => q.t + P.bin / 2), y: keep.map((q) => Math.log(q.N - B)), sy: keep.map((q) => Math.sqrt(Math.max(q.N, 1) + sB * sB) / (q.N - B)) };
        },
        expect: (P) => (t) => { const lam = Math.LN2 / (P.half * 60), T = P.bin * 60; return Math.log((P.R0 / lam) * (1 - Math.exp(-lam * T)) * Math.exp(-lam * (t - P.bin / 2) * 60)); },
        results(fit) {
          const { p, cov } = lineP(fit);
          return [{ key: 'half', label: '$T_{1/2} = -\\ln 2/\\text{slope}$', ...propagate((q) => -Math.LN2 / q[1], p, cov), scale: 1, unit: '\\mathrm{min}', accepted: BA137M }];
        },
      },
      counts: {
        label: 'counts with a fitted exponential + background', xlabel: 't (min)', ylabel: 'counts per bin', fit: 'curve', min: 4,
        points: (R, P) => ({ x: R.map((q) => q.t + P.bin / 2), y: R.map((q) => q.N), sy: R.map((q) => Math.sqrt(Math.max(q.N, 1))) }),
        curve(d, P) {
          const f = (t, p) => p[0] * Math.exp(-p[1] * t) + p[2];
          const B0 = P.bg * P.bin * 60;
          return fitCurve(f, d.x, d.y, d.sy, [d.y[0] || 100, Math.LN2 / P.half, B0], { scale: [d.y[0] || 100, 0.27, Math.max(1, B0)] });
        },
        results(fit) {
          return [
            { key: 'half', label: '$T_{1/2} = \\ln 2/\\lambda$', ...propagate((q) => Math.LN2 / q[1], fit.p, fit.cov), scale: 1, unit: '\\mathrm{min}', accepted: BA137M },
            { key: 'B', label: 'background per bin', value: fit.p[2], sigma: fit.sp[2], scale: 1, unit: '', accepted: null },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const n = R.length, hi = Math.max(10, ...R.map((q) => q.N)) * 1.1;
      const paths = R.map((q, k) => ({ pts: [[q.t + 0.04, 0], [q.t + 0.04, q.N], [q.t + P.bin - 0.04, q.N], [q.t + P.bin - 0.04, 0]], color: k === i ? 'gold' : 'teal', width: k === i ? 2.2 : 1.4 }));
      const B = (P.bgN / P.bgT) * P.bin * 60;
      return {
        x: [0, P.Ttot + P.bin], y: [0, hi], xlabel: 't (min)', ylabel: 'counts per bin',
        paths, hlines: [{ y: B, color: 'warn', dash: [5, 4] }],
        texts: [{ s: n ? `${n} bins of ${P.bin * 60} s` : 'press Record to count', x: P.Ttot, y: hi * 0.92, color: 'ink2', size: 11, align: 'right' }, { s: 'background level', x: P.Ttot, y: B, color: 'warn', size: 10.5, align: 'right', dy: -10 }],
      };
    },
  },

  // ── E.22: Johnson noise ────────────────────────────────────────────────
  johnson: {
    title: 'The noise voltage of resistors at room temperature',
    defaults: { T: 295.0, B: 10000, en: 4.0e-9, C: 50e-12, tau: 10 },
    // K; Hz (the filter's equivalent noise bandwidth); V/√Hz (the amplifier's own noise, referred to its input); F (cable and input capacitance); s (averaging time per reading)
    note: 'Mean-square voltage referred to the amplifier input, averaged for 10 s; the filter is treated as a brick wall of 10 kHz noise bandwidth; the amplifier adds its own uncorrelated noise. Gain is taken as calibrated exactly.',
    flags: [{ key: 'cap', label: '50 pF of cable and input capacitance', value: true, explain: 'The capacitance across the resistor makes a low-pass RC filter. For 100 kΩ its corner is 32 kHz — not far enough above the 10 kHz band — so the biggest resistors lose some of their noise, the points sag below the line, and the slope (and k_B) comes out low. Mounting the resistor at the amplifier input (off) removes it.' }],
    setting: { kind: 'slider', key: 'R', label: 'Resistance $R$', unit: '\\mathrm{k\\Omega}', min: 1, max: 100, step: 1, value: 50, series: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], explain: 'The resistor across the amplifier input.' },
    nz: 1,
    read(Rk, z, P, F) {
      const R = Rk * 1e3;
      const v2 = 4 * K.kB * P.T * R * bandR(P, R, F.cap) + P.en ** 2 * P.B;     // V²
      const rel = 1 / Math.sqrt(P.B * P.tau);
      const meas = v2 * (1 + rel * z[0]);
      return { R: Rk, v2: roundTo(meas * 1e12, 0.001), sv2: v2 * rel * 1e12 };
    },
    columns: [{ head: 'R (kΩ)', get: (q) => String(q.R) }, { head: '⟨V²⟩ (μV²)', get: (q) => d3(q.v2) }, { head: 'V rms (μV)', get: (q) => d3(Math.sqrt(q.v2)) }],
    defaultAxes: 'v2R',
    axes: {
      v2R: {
        label: '$\\langle V^2\\rangle$ against $R$', xlabel: 'R (kΩ)', ylabel: '⟨V²⟩ (μV²)', fit: 'line', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => q.R), y: R.map((q) => q.v2), sy: R.map((q) => q.sv2) }),
        expect: (P) => (Rk) => (4 * K.kB * P.T * Rk * 1e3 * P.B + P.en ** 2 * P.B) * 1e12,
        results(fit, P) {
          const k = (b) => (b * 1e-12) / 1e3 / (4 * P.T * P.B);
          return [
            { key: 'kB', label: '$k_B = b/(4T\\Delta f)$', value: k(fit.b), sigma: k(fit.sb), scale: 1e-23, unit: '\\times10^{-23}\\ \\mathrm{J/K}', accepted: K.kB },
            { key: 'en', label: 'amplifier $e_n$ (intercept)', ...propagate((q) => Math.sqrt(Math.max(q[0], 0) * 1e-12 / P.B) * 1e9, [fit.a, fit.b], [[fit.sa ** 2, fit.cov], [fit.cov, fit.sb ** 2]]), scale: 1, unit: '\\mathrm{nV/\\sqrt{Hz}}', accepted: P.en * 1e9 },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const Rk = q ? q.R : 50;
      const v2 = 4 * K.kB * P.T * Rk * 1e3 * bandR(P, Rk * 1e3, F.cap) + P.en ** 2 * P.B;
      const vr = Math.sqrt(v2) * 1e6;
      const g = makeRng(77 + Rk);
      // white noise through a two-pole low-pass at about B: 2 ms at 1 MS/s
      const pts = []; let a = 0, b = 0;
      const k = 1 - Math.exp((-TAU * P.B) / 1e6);
      const norm = Math.sqrt(2 / k) * Math.sqrt(2);
      for (let n = 0; n < 2000; n++) { a += k * (gaussian(g) - a); b += k * (a - b); if (n >= 50) pts.push([(n - 50) / 1000, b * norm * vr * 0.5]); }
      const m = pts.reduce((s, p) => s + p[1] * p[1], 0) / pts.length;
      const sc = vr / Math.sqrt(m || 1);
      const P2 = pts.map(([t, v]) => [t, v * sc]);
      return {
        x: [0, 1.95], y: [-14, 14], xlabel: 't (ms)', ylabel: 'V at the input (μV)', yticks: 4,
        paths: [{ pts: P2, color: 'teal', width: 1 }],
        hlines: [{ y: vr, color: 'gold', dash: [5, 4] }, { y: -vr, color: 'gold', dash: [5, 4] }],
        texts: [{ s: `R = ${Rk} kΩ: V rms = ${d2(vr)} μV`, x: 1.9, y: 12.5, color: 'gold', size: 11, align: 'right' }],
      };
    },
  },

  // ── E.23: electron diffraction ─────────────────────────────────────────
  ediff: {
    title: 'Electrons through a graphite film: two rings on the screen',
    defaults: { a: 0.2461e-9, L: 0.135, sD: 0.4 },
    // m (graphite's lattice constant); m (film to screen); mm (σ of a diameter read with a calliper)
    note: 'A flat screen at L = 13.5 cm: D = 2L tan 2θ with the Bragg condition 2d sin θ = λ and the relativistic de Broglie λ. The film is polycrystalline, so each spacing makes a cone and a ring.',
    flags: [],
    setting: { kind: 'slider', key: 'V', label: 'Accelerating voltage $V$', unit: '\\mathrm{kV}', min: 2.5, max: 5.0, step: 0.1, value: 4.0, series: [2.5, 3.0, 3.5, 4.0, 4.5, 5.0], explain: 'The voltage that accelerates the electrons: higher V, shorter wavelength, smaller rings.' },
    nz: 2,
    read(V, z, P) {
      const [d10, d11] = graphiteD(P.a);
      return { V, D1: roundTo(1000 * ringD(P, d10, V * 1e3) + P.sD * z[0], 0.1), D2: roundTo(1000 * ringD(P, d11, V * 1e3) + P.sD * z[1], 0.1), sD: P.sD };
    },
    columns: [{ head: 'V (kV)', get: (q) => d1(q.V) }, { head: 'D inner (mm)', get: (q) => d1(q.D1) }, { head: 'D outer (mm)', get: (q) => d1(q.D2) }],
    defaultAxes: 'inner',
    axes: {
      inner: {
        label: 'inner ring: $D$ against $1/\\sqrt V$', xlabel: '1/√V (kV⁻¹ᐟ²)', ylabel: 'D inner (mm)', fit: 'origin', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => 1 / Math.sqrt(q.V)), y: R.map((q) => q.D1), sy: R.map((q) => q.sD) }),
        expect: (P) => (x) => (2 * P.L * lamE(1e3 / (x * x), false) / graphiteD(P.a)[0]) * 1000,
        results: (fit, P) => [{ key: 'd10', label: '$d = 2Lh/(b\\sqrt{2m_ee})$', ...dFromSlope(fit, P), scale: 1e-9, unit: '\\mathrm{nm}', accepted: graphiteD(P.a)[0] }],
      },
      outer: {
        label: 'outer ring: $D$ against $1/\\sqrt V$', xlabel: '1/√V (kV⁻¹ᐟ²)', ylabel: 'D outer (mm)', fit: 'origin', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => 1 / Math.sqrt(q.V)), y: R.map((q) => q.D2), sy: R.map((q) => q.sD) }),
        expect: (P) => (x) => (2 * P.L * lamE(1e3 / (x * x), false) / graphiteD(P.a)[1]) * 1000,
        results: (fit, P) => [{ key: 'd11', label: '$d = 2Lh/(b\\sqrt{2m_ee})$', ...dFromSlope(fit, P), scale: 1e-9, unit: '\\mathrm{nm}', accepted: graphiteD(P.a)[1] }],
      },
      exact: {
        label: 'inner ring, exact: $2\\sin\\theta$ against $\\lambda$', xlabel: 'λ, relativistic (pm)', ylabel: '2 sin θ (inner ring)', fit: 'origin', zeroX: true, zeroY: true,
        points(R, P) {
          const y = R.map((q) => 2 * Math.sin(Math.atan(q.D1 / 1000 / (2 * P.L)) / 2));
          const sy = R.map((q) => { const u = q.D1 / 1000 / (2 * P.L); return (Math.cos(Math.atan(u) / 2) / (1 + u * u)) * (q.sD / 1000 / (2 * P.L)); });
          return { x: R.map((q) => lamE(q.V * 1e3) * 1e12), y, sy };
        },
        results(fit, P) {
          const d = 1e-12 / fit.b;
          return [{ key: 'd10', label: '$d = 1/\\text{slope}$', value: d, sigma: d * (fit.sb / fit.b), scale: 1e-9, unit: '\\mathrm{nm}', accepted: graphiteD(P.a)[0] }];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const V = q ? q.V : 4;
      const [d10, d11] = graphiteD(P.a);
      const r1 = 500 * ringD(P, d10, V * 1e3), r2 = 500 * ringD(P, d11, V * 1e3);
      return {
        x: [-34, 34], y: [-28, 28], equal: true, axes: false,
        circles: [{ x: 0, y: 0, r: 27, color: 'ink4', width: 1.5, fill: 'void', alpha: 0.9 }, { x: 0, y: 0, r: 1.6, color: 'good', width: 1, fill: 'good', alpha: 0.9 },
          { x: 0, y: 0, r: r1, color: 'good', width: 4, alpha: 0.55 }, { x: 0, y: 0, r: r2, color: 'good', width: 4, alpha: 0.4 }],
        paths: [{ pts: [[-r1, -0.6], [r1, -0.6]], color: 'gold', width: 1.2, dash: [3, 3] }],
        texts: [
          { s: q ? `D inner = ${d1(q.D1)} mm` : 'inner ring', x: 0, y: -r1, color: 'gold', size: 11, align: 'center', dy: 14 },
          { s: `V = ${d1(V)} kV`, x: 33, y: 26, color: 'ink2', size: 11, align: 'right' },
          { s: 'the screen, face on', x: -33, y: -26, color: 'ink3', size: 10 },
        ],
      };
    },
  },

  // ── E.24: the Balmer lines ─────────────────────────────────────────────
  rydberg: {
    title: 'Hydrogen’s Balmer lines through a grating spectrometer',
    defaults: { N: 603.0, Nnom: 600, sTh: 1 / 60 },
    // lines/mm (the grating's true ruling, found by calibrating on mercury’s 546.07 nm line); lines/mm (the label); deg (σ of one angle read on the vernier)
    note: 'First order; each angle is half the difference of the left and right readings (which cancels the table’s zero). Wavelengths are Bohr levels with the reduced mass, shifted into air; fine structure (parts in 10⁵) is below this resolution.',
    flags: [
      { key: 'nominal', label: 'Use the label’s 600 lines/mm', value: false, explain: 'The grating’s label says 600 lines per mm, but calibrating on mercury’s green line (546.07 nm) gives 603.0. Using the label scales every wavelength by 0.5% — a systematic invisible to the fit.' },
      { key: 'air', label: 'Convert air wavelengths to vacuum', value: true, explain: 'The spectrometer works in air, where wavelengths are shorter than in vacuum by the refractive index, 1.000 277. The Rydberg formula is for vacuum.' },
    ],
    setting: { kind: 'choice', label: 'Line', choices: [[3, 'Hα (red), n = 3'], [4, 'Hβ (cyan), n = 4'], [5, 'Hγ (violet), n = 5'], [6, 'Hδ (violet), n = 6']], value: 3, series: [3, 4, 5, 6], explain: 'Which Balmer line the telescope is set on: the transition from level n down to level 2.' },
    nz: 1,
    read(n, z, P) {
      const th = gratingTheta(balmer(n).air, P.N);
      return { n, th: roundTo(th + (P.sTh / Math.SQRT2) * z[0], 0.001), sth: P.sTh / Math.SQRT2 };
    },
    columns: [{ head: 'n', get: (q) => String(q.n) }, { head: 'θ (deg)', get: (q) => d3(q.th) }],
    defaultAxes: 'ryd',
    axes: {
      ryd: {
        label: '$1/\\lambda$ against $1/4 - 1/n^2$', xlabel: '1/4 − 1/n²', ylabel: '1/λ (μm⁻¹)', fit: 'line', zeroX: true, zeroY: true,
        points(R, P, F) {
          const dd = 1e-3 / (F.nominal ? P.Nnom : P.N) * 1e6;          // μm
          const nf = F.air ? K.nAir : 1;
          const inv = R.map((q) => 1 / (dd * Math.sin(q.th * D2R) * nf));
          return { x: R.map((q) => 0.25 - 1 / (q.n * q.n)), y: inv, sy: R.map((q, i) => inv[i] * (q.sth * D2R) / Math.tan(q.th * D2R)) };
        },
        expect: () => (x) => (K.RH * x) / 1e6,
        results: (fit) => [
          { key: 'RH', label: '$R_H$ = slope', value: fit.b * 1e6, sigma: fit.sb * 1e6, scale: 1e7, unit: '\\times10^{7}\\ \\mathrm{m^{-1}}', accepted: K.RH },
          { key: 'a', label: 'intercept', value: fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{\\mu m^{-1}}', accepted: 0 },
        ],
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const cols = { 3: 'bad', 4: 'teal', 5: 'violet', 6: 'violet' };
      const vl = [3, 4, 5, 6].map((n) => ({ x: gratingTheta(balmer(n).air, P.N), color: cols[n] }));
      return {
        x: [12, 25], y: [0, 1], xlabel: 'θ, first order (deg)', ylabel: '', yticks: 0,
        vlines: vl,
        paths: q ? [{ pts: [[q.th, 0.05], [q.th, 0.95]], color: 'gold', width: 3, alpha: 0.6 }] : [],
        texts: [
          ...[3, 4, 5, 6].map((n) => ({ s: ['', '', '', 'Hα', 'Hβ', 'Hγ', 'Hδ'][n], x: gratingTheta(balmer(n).air, P.N), y: 0.08, color: cols[n], size: 11, align: 'center', dx: n === 6 ? -12 : n === 5 ? 10 : 0 })),
          { s: 'the lines seen through the telescope', x: 24.8, y: 0.92, color: 'ink3', size: 10.5, align: 'right' },
        ],
      };
    },
  },

  // ── E.25: the speed of sound ───────────────────────────────────────────
  sound: {
    title: 'A resonance tube with tuning forks: the first two resonances',
    defaults: { Tc: 22.0, warm: 4.0, rt: 0.020, sL: 1.0 },
    // °C (the thermometer); °C (how much warmer the air in the tube is, with the systematic on); m (tube radius); mm (σ of a resonance length)
    note: 'Air columns closed by a water surface, resonating at L = (2n − 1)λ/4 − e with the end correction e = 0.61r of an unflanged tube; dry air treated as an ideal gas.',
    flags: [{ key: 'warm', label: 'Tube air 4 °C warmer than the thermometer', value: false, explain: 'The thermometer hangs by a draughty window; the air in the tube sits by a lamp. The data follow the tube’s air, but the comparison value is worked out from the thermometer’s reading — and v grows as √T, by 0.17% per °C.' }],
    setting: { kind: 'choice', label: 'Tuning fork', choices: [[256, '256 Hz'], [288, '288 Hz'], [320, '320 Hz'], [341.3, '341.3 Hz'], [384, '384 Hz'], [426.7, '426.7 Hz'], [480, '480 Hz'], [512, '512 Hz']], value: 384, series: [256, 288, 320, 341.3, 384, 426.7, 480, 512], explain: 'The fork struck over the tube’s mouth (a C-major set).' },
    nz: 2,
    read(f, z, P, F) {
      const v = vSound(P.Tc + (F.warm ? P.warm : 0)), e = 0.61 * P.rt;
      const L = (n) => ((2 * n - 1) * v) / (4 * f) - e;
      return { f, L1: roundTo(1000 * L(1) + P.sL * z[0], 1), L2: roundTo(1000 * L(2) + P.sL * z[1], 1), sL: P.sL };
    },
    columns: [{ head: 'f (Hz)', get: (q) => String(q.f) }, { head: 'L₁ (mm)', get: (q) => String(q.L1) }, { head: 'L₂ (mm)', get: (q) => String(q.L2) }],
    defaultAxes: 'line',
    axes: {
      line: {
        label: '$L$ against $(2n-1)/4f$', xlabel: '(2n − 1)/4f (ms)', ylabel: 'L (mm)', fit: 'line', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.flatMap((q) => [250 / q.f, 750 / q.f]), y: R.flatMap((q) => [q.L1, q.L2]), sy: R.flatMap((q) => [q.sL, q.sL]) }),
        expect: (P) => (x) => vSound(P.Tc) * x - 610 * P.rt,
        results: (fit, P) => [
          { key: 'v', label: '$v$ = slope', value: fit.b, sigma: fit.sb, scale: 1, unit: '\\mathrm{m/s}', accepted: vSound(P.Tc) },
          { key: 'e', label: 'end correction $= -$intercept', value: -fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{mm}', accepted: 610 * P.rt },
        ],
      },
      origin: {
        label: 'the same, forced through 0', xlabel: '(2n − 1)/4f (ms)', ylabel: 'L (mm)', fit: 'origin', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.flatMap((q) => [250 / q.f, 750 / q.f]), y: R.flatMap((q) => [q.L1, q.L2]), sy: R.flatMap((q) => [q.sL, q.sL]) }),
        expect: (P) => (x) => vSound(P.Tc) * x - 610 * P.rt,
        results: (fit, P) => [{ key: 'v', label: '$v$ = slope (through 0)', value: fit.b, sigma: fit.sb, scale: 1, unit: '\\mathrm{m/s}', accepted: vSound(P.Tc) }],
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const f = q ? q.f : 384;
      const v = vSound(P.Tc + (F.warm ? P.warm : 0)), e = 0.61 * P.rt, lam = v / f;
      const L2 = (3 * lam) / 4 - e, H = 1.1, w = 0.06;
      const env = []; for (let k = 0; k <= 200; k++) { const y = (L2 * k) / 200; env.push([w * 0.9 * Math.abs(Math.cos((TAU * (y + e)) / lam)), -y]); }
      return {
        x: [-0.35, 0.35], y: [-H, 0.08], equal: true, axes: false,
        paths: [
          { pts: [[-w, 0], [-w, -H]], color: 'ink2', width: 2 }, { pts: [[w, 0], [w, -H]], color: 'ink2', width: 2 },
          { pts: [[-w, -L2], [w, -L2]], color: 'teal', width: 3 },
          { pts: env, color: 'gold', width: 1.4 }, { pts: env.map(([x, y]) => [-x, y]), color: 'gold', width: 1.4 },
          { pts: [[-w - 0.01, -(lam / 4 - e)], [-w - 0.05, -(lam / 4 - e)]], color: 'warn', width: 2 },
        ],
        texts: [
          { s: `${f} Hz fork`, x: 0, y: 0.04, color: 'ink2', size: 11, align: 'center' },
          { s: q ? `L₂ = ${q.L2} mm` : 'second resonance', x: w + 0.02, y: -L2, color: 'teal', size: 11 },
          { s: q ? `L₁ = ${q.L1} mm` : 'first resonance', x: -w - 0.06, y: -(lam / 4 - e), color: 'warn', size: 11, align: 'right' },
          { s: 'water', x: 0, y: -L2, color: 'teal', size: 10, align: 'center', dy: 14 },
          { s: 'gold: air’s motion (antinodes wide)', x: 0.34, y: -H + 0.04, color: 'ink3', size: 10, align: 'right' },
        ],
      };
    },
  },

  // ── E.26: the torsion pendulum ─────────────────────────────────────────
  torsion: {
    title: 'A bar on a steel wire, with two masses slid along it',
    defaults: { G: 80.0e9, aw: 0.40e-3, lw: 0.600, Mb: 0.120, Lb: 0.300, Icl: 1.0e-5, m: 0.100, Rm: 0.020, sT10: 0.05 },
    // Pa (the wire's shear modulus); m (wire radius); m (wire length); kg, m (the bar); kg m² (its clamp); kg (each mass); m (each mass's radius: a cylinder, axis vertical); s (σ of timing ten swings)
    note: 'A linear torsion spring (the period does not depend on amplitude), no damping; the masses are solid cylinders standing upright on the bar.',
    flags: [{ key: 'own', label: 'Subtract the masses’ own inertia', value: true, explain: 'Each mass is a cylinder 2 cm in radius, so it has its own moment of inertia about its centre, mR²/2, besides the mr² of its position. Those two terms ride in the intercept: forget them and the bar’s inertia comes out about 4% high.' }],
    setting: { kind: 'slider', key: 'r', label: 'Mass position $r$', unit: '\\mathrm{m}', min: 0.03, max: 0.14, step: 0.01, value: 0.10, series: [0.04, 0.06, 0.08, 0.10, 0.12, 0.14], explain: 'How far each mass sits from the wire, the two placed symmetrically.' },
    nz: 1,
    read(r, z, P) { return { r, T: roundTo(torsionT(P, r) + (P.sT10 / 10) * z[0], 0.001), sT: P.sT10 / 10 }; },
    columns: [{ head: 'r (m)', get: (q) => d2(q.r) }, { head: 'T (s)', get: (q) => d3(q.T) }],
    defaultAxes: 'T2',
    axes: {
      T2: {
        label: '$T^2$ against $r^2$', xlabel: 'r² (m²)', ylabel: 'T² (s²)', fit: 'line', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => q.r * q.r), y: R.map((q) => q.T * q.T), sy: R.map((q) => 2 * q.T * q.sT) }),
        expect: (P) => (x) => (4 * Math.PI ** 2 * (I0of(P) + 2 * Icm(P) + 2 * P.m * x)) / kappaOf(P),
        results(fit, P, F) {
          const { p, cov } = lineP(fit);
          return [
            { key: 'kappa', label: '$\\kappa = 8\\pi^2 m/b$', ...propagate((q) => (8 * Math.PI ** 2 * P.m) / q[1], p, cov), scale: 1e-3, unit: '\\times10^{-3}\\ \\mathrm{N\\,m/rad}', accepted: kappaOf(P) },
            { key: 'I0', label: '$I_0 = 2ma/b$' + (F.own ? ' $- 2I_{cm}$' : ''), ...propagate((q) => (2 * P.m * q[0]) / q[1] - (F.own ? 2 * Icm(P) : 0), p, cov), scale: 1e-4, unit: '\\times10^{-4}\\ \\mathrm{kg\\,m^2}', accepted: I0of(P) },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const r = q ? q.r : 0.10;
      const Rm = P.Rm;
      return {
        x: [-0.19, 0.19], y: [-0.09, 0.09], equal: true, axes: false,
        paths: [{ pts: [[-P.Lb / 2, 0], [P.Lb / 2, 0]], color: 'ink2', width: 7 }, { pts: [[-r, -0.075], [r, -0.075]], color: 'gold', width: 1.2, dash: [3, 3] }],
        circles: [{ x: 0, y: 0, r: 0.008, color: 'ink', width: 2, fill: 'ink', alpha: 1 }, { x: -r, y: 0, r: Rm, color: 'accent', width: 2, fill: 'accent', alpha: 0.45 }, { x: r, y: 0, r: Rm, color: 'accent', width: 2, fill: 'accent', alpha: 0.45 }],
        texts: [
          { s: 'wire', x: 0, y: 0.012, color: 'ink', size: 10.5, align: 'center', dy: -6 },
          { s: `r = ${d2(r)} m`, x: r / 2, y: -0.075, color: 'gold', size: 11, align: 'center', dy: -10 },
          { s: q ? `T = ${d3(q.T)} s` : 'time ten swings', x: 0.185, y: 0.08, color: 'ink2', size: 11, align: 'right' },
          { s: 'top view, to scale', x: -0.185, y: 0.08, color: 'ink3', size: 10 },
        ],
      };
    },
  },
};

/** d (m) from the slope of D (mm) against 1/√V (V in kV), small-angle and non-relativistic: D = 2Lh/(d√(2mₑeV)). */
function dFromSlope(fit, P) {
  const k = (2 * P.L * K.h) / Math.sqrt(2 * K.me * K.e * 1e3) * 1e3;     // mm·kV^½·m (D in mm, V in kV)
  const d = k / fit.b;
  return { value: d, sigma: d * (fit.sb / fit.b) };
}

// ─── running an experiment (as model/labe-rig.js) ─────────────────────────

/** The experiment with its parameters (defaults overridden) and flags (defaults overridden). */
export function experiment(id, params = {}, flags = {}) {
  const E = EXPERIMENTS[id];
  if (!E) throw new Error(`labg-classics: no experiment “${id}”`);
  const P = { ...E.defaults, ...params };
  const F = {};
  for (const f of E.flags) F[f.key] = flags[f.key] ?? f.value;
  return { E, P, F };
}

/** The standard settings of a series: the slider or choice series, or the sequence's times. */
export function seriesOf(E, P) {
  if (E.setting.kind === 'sequence') { const out = []; for (let t = 0; t <= P.Ttot + 1e-9; t += P.dt) out.push(+t.toFixed(6)); return out; }
  return E.setting.series.slice();
}

/** Rows { s, z } at the given settings from a seeded generator (or a generator `rng` to continue). */
export function makeRows(id, { seed = 1, settings = null, params = {}, rng = null } = {}) {
  const { E, P } = experiment(id, params);
  const g = rng || makeRng(seed);
  return (settings || seriesOf(E, P)).map((s) => ({ s, z: Array.from({ length: E.nz }, () => gaussian(g)) }));
}

/** Readings for rows under the flags. */
export function readRows(id, rows, { params = {}, flags = {} } = {}) {
  const { E, P, F } = experiment(id, params, flags);
  return rows.map((r) => E.read(r.s, r.z, P, F));
}

/** The analysis: points, the fit and the results (each with its z against the accepted value). */
export function analyse(id, rows, { axes = null, params = {}, flags = {} } = {}) {
  const { E, P, F } = experiment(id, params, flags);
  const R = rows.map((r) => E.read(r.s, r.z, P, F));
  const key = axes && E.axes[axes] ? axes : E.defaultAxes;
  const A = E.axes[key];
  const d = A.points(R, P, F);
  const need = A.min || (A.fit === 'mean' || A.fit === 'origin' ? 2 : 3);
  let fit = null;
  if (d.x.length >= need) {
    fit = A.fit === 'origin' ? fitOrigin(d.x, d.y, d.sy) : A.fit === 'mean' ? fitMean(d.y, d.sy) : A.fit === 'curve' ? A.curve(d, P, F) : fitLine(d.x, d.y, d.sy);
    if (fit && !fit.f) { const { a, b } = fit; fit.f = (x) => a + b * x; }
    if (fit) fit.p = fit.p || [fit.a, fit.b];
    if (fit && !fit.residuals) fit.residuals = d.x.map((x, i) => d.y[i] - fit.f(x));
  }
  const results = fit ? A.results(fit, P, F, d).map((r) => ({ ...r, z: r.accepted !== null && r.accepted !== undefined && r.sigma > 0 ? (r.value - r.accepted) / r.sigma : null })) : [];
  if (fit) fit.pval = fit.dof > 0 ? chi2Sf(fit.chi2, fit.dof) : NaN;
  return { E, P, F, A, key, R, d, fit, results };
}

/** Convenience: make seeded data and analyse it. */
export function run(id, { seed = 1, settings = null, params = {}, flags = {}, axes = null } = {}) {
  const rows = makeRows(id, { seed, settings, params });
  return { rows, ...analyse(id, rows, { axes, params, flags }) };
}
