// The simulated classic experiments behind sims/labe-rig.js and the lab
// course's E lessons (lab.E.1–E.9): e/m in Helmholtz coils, Millikan's oil
// drops, the photoelectric effect (h/e), Franck–Hertz, Michelson and
// Fabry–Pérot interferometry, the Cavendish balance, coupled pendulums and the
// speed of light by time of flight. DOM-free; checked by test/labe-rig.test.mjs.
//
// Each reading is the true value for the setting, plus Gaussian noise drawn
// from a seeded generator (z, standard normal deviates kept with the row), and
// rounded to the instrument's resolution — so a seed always gives the same
// data, and a systematic error can be switched on and off over the *same*
// scatter. Every experiment carries one real systematic as a flag (the
// ambient field in e/m, air slip in Millikan's drag law, the contact
// potential, the mean-free-path stretch of Franck–Hertz spacings …), and the
// analysis a lab does: a weighted straight line (or a weighted mean, a line
// through the origin, or a nonlinear fit by Levenberg–Marquardt), χ², and the
// physical result with its uncertainty propagated from the fit's covariance.
//
// Physical constants are CODATA 2022 (e, h, c exact in the 2019 SI). Apparatus
// numbers (coil turns, plate gaps, lever ratios …) are illustrative values
// typical of teaching apparatus, not the specification of any one product.

import { makeRng } from '../../core/rng.js';
import { gaussian, roundTo, fitLine, fitOrigin, pm, amplitudeFactor } from './lab-bench.js';
import { normalCdf, chi2Sf } from './labx-stats.js';

export { gaussian, roundTo, pm, amplitudeFactor, chi2Sf };
const TAU = 2 * Math.PI;

// ─── constants (CODATA 2022) ──────────────────────────────────────────────
export const K = {
  e: 1.602176634e-19,          // C (exact)
  me: 9.1093837139e-31,        // kg
  h: 6.62607015e-34,           // J s (exact)
  c: 299792458,                // m/s (exact)
  kB: 1.380649e-23,            // J/K (exact)
  mu0: 1.25663706127e-6,       // N/A²
  G: 6.67430e-11, uG: 0.00015e-11,   // m³ kg⁻¹ s⁻²
  g: 9.80,                     // m/s²: the local value used at the bench (as model/lab-bench.js)
  nAir: 1.00028,               // refractive index of laboratory air (visible light)
};
K.em = K.e / K.me;             // 1.758 820 008…×10¹¹ C/kg
K.he = K.h / K.e;              // 4.135 667 696…×10⁻¹⁵ V s
K.hcEVcm = (K.h * K.c / K.e) * 100;          // eV per cm⁻¹
export const HG_3P1 = 39412.300 * K.hcEVcm;  // eV: mercury 6s6p ³P₁ (NIST ASD), the 253.7 nm resonance level
export const HG_LINES = [                    // mercury lines, air wavelengths in nm (NIST ASD)
  { lam: 365.015, name: 'UV 365.0 nm' }, { lam: 404.656, name: 'violet 404.7 nm' }, { lam: 435.833, name: 'blue 435.8 nm' },
  { lam: 546.074, name: 'green 546.1 nm' }, { lam: 576.960, name: 'yellow 577.0 nm' },
];
export const NA_D = (588.995 + 589.592) / 2;   // nm, the sodium D doublet's mean (air)

// ─── fitting ──────────────────────────────────────────────────────────────

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
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-300) return null;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}
/** The inverse of a small square matrix. */
export function inverse(A) {
  const n = A.length;
  const cols = [];
  for (let j = 0; j < n; j++) { const e = Array(n).fill(0); e[j] = 1; const x = solve(A, e); if (!x) return null; cols.push(x); }
  return A.map((_, i) => cols.map((c) => c[i]));
}

/**
 * Nonlinear weighted least squares by Levenberg–Marquardt: minimise
 * χ²(p) = Σ ((yᵢ − f(xᵢ, p))/σᵢ)². `scale` gives each parameter's typical
 * size (for the numerical derivatives). Returns p, its covariance (JᵀWJ)⁻¹
 * (the σ's taken as true), χ², the degrees of freedom and the residuals.
 */
export function fitCurve(f, x, y, sy, p0, { scale = null, iters = 300 } = {}) {
  const n = x.length, m = p0.length;
  const sc = scale || p0.map((v) => Math.abs(v) || 1);
  let p = p0.slice();
  const chi = (q) => { let c = 0; for (let i = 0; i < n; i++) { const r = (y[i] - f(x[i], q)) / sy[i]; c += r * r; } return c; };
  const normal = (q) => {
    const J = x.map((xi, i) => {
      const f0 = f(xi, q);
      return q.map((_, j) => { const hq = q.slice(); const hh = 1e-6 * sc[j]; hq[j] += hh; return (f(xi, hq) - f0) / hh / sy[i]; });
    });
    const r = x.map((xi, i) => (y[i] - f(xi, q)) / sy[i]);
    const A = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (_, b) => J.reduce((s, row) => s + row[a] * row[b], 0)));
    const g = Array.from({ length: m }, (_, a) => J.reduce((s, row, i) => s + row[a] * r[i], 0));
    return { A, g };
  };
  let c = chi(p), lam = 1e-3;
  for (let it = 0; it < iters; it++) {
    const { A, g } = normal(p);
    const Ad = A.map((row, i) => row.map((v, j) => (i === j ? v * (1 + lam) : v)));
    const d = solve(Ad, g);
    if (!d) { lam *= 10; continue; }
    const pt = p.map((v, j) => v + d[j]);
    const ct = chi(pt);
    if (Number.isFinite(ct) && ct <= c) {
      const done = c - ct < 1e-10 * Math.max(1, c);
      p = pt; c = ct; lam = Math.max(1e-12, lam / 10);
      if (done) break;
    } else lam *= 10;
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
/** A line fit's (a, b) as a parameter vector and covariance matrix. */
const lineP = (fit) => ({ p: [fit.a, fit.b], cov: [[fit.sa ** 2, fit.cov], [fit.cov, fit.sb ** 2]] });

/** A uniform deviate in (0, 1) made from a standard normal one. */
const unif = (z) => normalCdf(z);

// ─── e/m: an electron beam in Helmholtz coils ─────────────────────────────
/** Field per ampere at the centre of a Helmholtz pair: (4/5)^{3/2} μ₀N/R. */
export const helmholtzK = (P) => 0.8 ** 1.5 * K.mu0 * P.N / P.R;
/** The beam radius (m) for current I with an ambient axial field Be (T). */
export const emRadius = (P, I, Be = 0) => Math.sqrt((2 * P.V) / K.em) / (helmholtzK(P) * I + Be);

// ─── Millikan ─────────────────────────────────────────────────────────────
/** Cunningham's slip factor 1 + b/(p a). */
export const slip = (P, a) => 1 + P.b / (P.p * a);
/** Fall and rise speeds (m/s) of a drop of radius a carrying n charges. */
export function dropSpeeds(P, a, n) {
  const m = (4 / 3) * Math.PI * a ** 3 * P.rho;
  const C = slip(P, a), E = P.V / P.d;
  const drag = (6 * Math.PI * P.eta * a) / C;
  return { vf: (m * P.g) / drag, vr: (n * K.e * E - m * P.g) / drag, m, C, E };
}
/** The analysis of one drop: radius and charge from its two speeds, with or without the slip correction. */
export function dropCharge(P, vf, vr, corrected = true) {
  const E = P.V / P.d;
  const aU = Math.sqrt((9 * P.eta * vf) / (2 * P.rho * P.g));
  let a = aU;
  if (corrected) for (let k = 0; k < 60; k++) a = aU / Math.sqrt(slip(P, a));
  const C = corrected ? slip(P, a) : 1;
  return { a, aU, q: (6 * Math.PI * P.eta * a * (vf + vr)) / (E * C) };
}
/** Assign each charge an integer by scanning e over [lo, hi] for the lowest χ² of q − n e. */
export function assignN(qs, sqs, lo = 1.2e-19, hi = 2.4e-19, steps = 2400) {
  let best = { e: NaN, chi: Infinity };
  for (let k = 0; k <= steps; k++) {
    const e = lo + ((hi - lo) * k) / steps;
    let c = 0;
    for (let i = 0; i < qs.length; i++) { const n = Math.max(1, Math.round(qs[i] / e)); c += ((qs[i] - n * e) / sqs[i]) ** 2; }
    if (c < best.chi) best = { e, chi: c };
  }
  return { e: best.e, n: qs.map((q) => Math.max(1, Math.round(q / best.e))) };
}

// ─── Franck–Hertz ─────────────────────────────────────────────────────────
/** The n-th current peak (V): offset + n E (+ the mean-free-path stretch n² E λ/L, after Rapior et al. 2006). */
export const fhPeak = (P, n, mfp = true) => P.Vc + n * P.Ea + (mfp ? n * n * P.Ea * P.lam : 0);

// ─── Fabry–Pérot ──────────────────────────────────────────────────────────
/** The order at the centre 2d/λ and the radius (m) of the p-th bright ring (p = 1 innermost) for an air-spaced etalon. */
export function fpRing(P, p) {
  const mc = (2 * P.d) / (P.lam * 1e-9);
  const m = Math.floor(mc) - (p - 1);
  const th = Math.acos(m / mc);
  return { r: P.f * Math.tan(th), mc, eps: mc - Math.floor(mc) };
}

// ─── Cavendish ────────────────────────────────────────────────────────────
/** The far-sphere factor β = b³/(b² + 4d²)^{3/2}: the far large sphere's counter-torque as a fraction. */
export const farBeta = (P) => P.b ** 3 / (P.b ** 2 + 4 * P.d ** 2) ** 1.5;
/** The equilibrium twist (rad) for the given G, with or without the far sphere's pull. */
export const cavTheta = (P, G = K.G, far = true) => ((G * P.M * P.T0 ** 2) / (4 * Math.PI ** 2 * P.d * P.b ** 2)) * (far ? 1 - farBeta(P) : 1);
/** The spot position (cm) at t minutes after the large spheres are swung, from S1 toward S2 = S1 − ΔS. */
export function cavSpot(P, tMin, drift = false) {
  const dS = 400 * P.L * cavTheta(P);           // cm: ΔS = 4Lθ
  const S2 = P.S1 - dS;
  const t = tMin * 60, w0 = TAU / P.T0, wd = Math.sqrt(w0 * w0 - 1 / P.tau ** 2);
  return S2 + dS * Math.exp(-t / P.tau) * (Math.cos(wd * t) + Math.sin(wd * t) / (wd * P.tau)) + (drift ? P.drift * tMin : 0);
}
/** The fit model: p = [S1, S2, τ (min), Td (min), drift (cm/min)?] — the damped swing released from rest at S1. */
export function cavModel(t, p) {
  const [S1, S2, tau, Td, D = 0] = p;
  const wd = TAU / Td;
  return S2 + (S1 - S2) * Math.exp(-t / tau) * (Math.cos(wd * t) + Math.sin(wd * t) / (wd * tau)) + D * t;
}
/** G from the fitted swing: G = π² b² d ΔS / (M L T₀²), T₀ the undamped period, ÷ (1 − β) if corrected. */
export function cavG(P, p, far = true) {
  const [S1, S2, tau, Td] = p;
  const wd = TAU / (Td * 60), w0 = Math.sqrt(wd * wd + 1 / (tau * 60) ** 2), T0 = TAU / w0;
  const dS = (S1 - S2) / 100;
  return (Math.PI ** 2 * P.b ** 2 * P.d * dS) / (P.M * P.L * T0 ** 2) / (far ? 1 - farBeta(P) : 1);
}

// ─── coupled pendulums ────────────────────────────────────────────────────
/** The two normal-mode ω² (s⁻²) with the spring attached ℓ below the pivots (amplitude factor on gravity's part). */
export function modes(P, l, amp = false) {
  const F = amp ? amplitudeFactor((P.theta0 * Math.PI) / 180) : 1;
  const w1 = P.g / P.L / (F * F);
  return { w1, w2: w1 + (2 * P.k * l * l) / (P.m * P.L * P.L), F };
}

// ─── speed of light ───────────────────────────────────────────────────────
/** The return pulse's height (reference pulse = 1) after an extra path 2x. */
export const lightAmp = (P, x) => 1 / (1 + (x / P.xd) ** 2);
/** Leading-edge timing: a Gaussian pulse of width w crosses the threshold this many ns before its peak. */
export const leadEdge = (P, A) => P.w * Math.sqrt(2 * Math.log(A / P.thr));
/** The delay (ns) the scope reads between the reference and return pulses. */
export function lightDelay(P, x, walk = false) {
  const peak = (2 * x) / K.c * 1e9 + P.t0;
  return walk ? peak - leadEdge(P, lightAmp(P, x)) + leadEdge(P, 1) : peak;
}

// ─── the experiments ──────────────────────────────────────────────────────
//
//   title, method, note        what is measured, and what the model leaves out
//   defaults                   physical parameters (a lesson may override any)
//   flags [{ key, label, explain, value }]   switches: systematics present, corrections applied
//   setting { kind: 'slider' | 'choice' | 'random' | 'sequence', label, unit (TeX), min, max, step, value, choices, series, explain }
//   options [{ key, label, choices, explain }]   experiment controls held in the parameters
//   nz                          normal deviates per reading
//   read(s, z, P, F)            → a reading (an object of numbers)
//   columns [{ head, get }]     the data table (plain-text heads)
//   axes { key: { label, xlabel, ylabel, fit: 'line'|'origin'|'mean'|'curve', points(R, P, F), results(fit, P, F, d), expect?(P, F) } }
//   raw(R, P, F, i)             → a plain picture spec of the raw signal behind reading i

const d2 = (x) => x.toFixed(2), d3 = (x) => x.toFixed(3), d1 = (x) => x.toFixed(1);

export const EXPERIMENTS = {
  // ── E.1: e/m ───────────────────────────────────────────────────────────
  em: {
    title: 'An electron beam bent into a circle by Helmholtz coils',
    defaults: { V: 200, N: 130, R: 0.150, Be: -25e-6, sD: 1.0 },   // V; turns; m; T (axial ambient field, opposing the coils); mm (σ of a diameter reading)
    note: 'The coils’ field is taken as uniform at its centre value, the beam energy as exactly eV, and the ambient field as a constant axial component.',
    flags: [{ key: 'earth', label: 'Ambient field along the coil axis', value: true, explain: 'The Earth’s field (and the building’s steel) adds a steady component along the coils’ axis — here 25 μT against the coils’ field.' }],
    setting: { kind: 'slider', key: 'I', label: 'Coil current $I$', unit: '\\mathrm{A}', min: 1.0, max: 2.0, step: 0.05, value: 1.5, series: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0], explain: 'The current through both coils (in series): the field at the centre is proportional to it.' },
    nz: 1,
    read(I, z, P, F) {
      const r = emRadius(P, I, F.earth ? P.Be : 0);
      const D = roundTo(2000 * r + P.sD * z[0], 0.5);
      return { I, D, r: D / 2000, sr: P.sD / 2000 };
    },
    columns: [{ head: 'I (A)', get: (q) => d2(q.I) }, { head: 'D (mm)', get: (q) => d1(q.D) }, { head: 'r (cm)', get: (q) => (100 * q.r).toFixed(2) }],
    defaultAxes: 'inv',
    axes: {
      inv: {
        label: '$1/r$ against $I$', xlabel: 'I (A)', ylabel: '1/r (m⁻¹)', fit: 'line', zeroX: true,
        points: (R) => ({ x: R.map((q) => q.I), y: R.map((q) => 1 / q.r), sy: R.map((q) => q.sr / q.r ** 2) }),
        expect: (P) => (I) => 1 / emRadius(P, I, 0),
        results(fit, P) {
          const k = helmholtzK(P), { p, cov } = lineP(fit);
          const em = propagate((q) => (2 * P.V * q[1] ** 2) / k ** 2, p, cov);
          const Be = propagate((q) => (k * q[0]) / q[1] * 1e6, p, cov);
          return [
            { key: 'em', label: '$e/m$', ...em, scale: 1e11, unit: '\\times10^{11}\\ \\mathrm{C/kg}', accepted: K.em },
            { key: 'Be', label: 'ambient field', ...Be, scale: 1, unit: '\\mu\\mathrm{T}', accepted: null },
          ];
        },
      },
      pp: {
        label: '$e/m$ point by point', xlabel: 'I (A)', ylabel: 'e/m (10¹¹ C/kg)', fit: 'mean',
        points(R, P) {
          const k = helmholtzK(P);
          const y = R.map((q) => (2 * P.V) / (k * q.I * q.r) ** 2 / 1e11);
          return { x: R.map((q) => q.I), y, sy: R.map((q, i) => 2 * (q.sr / q.r) * y[i]) };
        },
        expect: () => () => K.em / 1e11,
        results: (fit) => [{ key: 'em', label: 'mean $e/m$', value: fit.a * 1e11, sigma: fit.sa * 1e11, scale: 1e11, unit: '\\times10^{11}\\ \\mathrm{C/kg}', accepted: K.em }],
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const r = q ? 100 * q.r : 4;
      const ticks = [];
      for (let k = 0; k <= 14; k++) ticks.push({ pts: [[-0.35, k], [k % 2 ? -0.05 : 0.25, k]], color: 'ink3', width: 1.2 });
      return {
        x: [-9, 9], y: [-2, 15.4], equal: true, axes: false,
        circles: [{ x: 0, y: 6.6, r: 8.0, color: 'ink4', width: 1.5 }, { x: 0, y: r, r, color: 'teal', width: 3, alpha: 0.85 }],
        paths: [{ pts: [[-0.35, 0], [-0.35, 14]], color: 'ink3', width: 1.2 }, ...ticks, { pts: [[-1.6, -0.3], [0, -0.3], [0, 0.3], [-1.6, 0.3]], color: 'ink2', width: 1.5 }],
        texts: [
          ...[0, 4, 8, 12].map((k) => ({ s: `${k}`, x: -0.6, y: k, align: 'right', color: 'ink3', size: 10 })),
          { s: 'cm', x: -0.6, y: 14, align: 'right', color: 'ink3', size: 10 },
          { s: 'electron gun', x: -1.8, y: 0, align: 'right', color: 'ink2', size: 11 },
          q ? { s: `D = ${d1(q.D)} mm`, x: 0.5, y: 2 * r, color: 'teal', size: 12, dy: -10 } : null,
          q ? { s: `I = ${d2(q.I)} A, V = ${P.V} V`, x: 8.2, y: -1.2, align: 'right', color: 'ink2', size: 11 } : null,
        ].filter(Boolean),
      };
    },
  },

  // ── E.2: Millikan ──────────────────────────────────────────────────────
  millikan: {
    title: 'Charged oil drops timed between two plates',
    defaults: { eta: 1.83e-5, rho: 886, b: 8.20e-3, p: 101325, T: 296, d: 6.0e-3, V: 500, s: 0.50e-3, g: 9.80, tReact: 0.1, transits: 5, aMin: 0.45e-6, aMax: 0.80e-6 },
    note: 'The slip correction is Cunningham’s first-order form 1 + b/(pa), used both to make the data and to analyse it; air buoyancy, evaporation and charge changes mid-run are left out.',
    flags: [{ key: 'slip', label: 'Apply Cunningham’s slip correction', value: true, explain: 'A drop under a micrometre is not much bigger than the mean free path of air molecules, so Stokes’s drag law overestimates the drag. The correction divides the drag by 1 + b/(pa).' }],
    setting: { kind: 'random', label: 'a drop', series: 12 },
    nz: 4,
    read(_, z, P, F) {
      const a = P.aMin + (P.aMax - P.aMin) * unif(z[0]);
      const mg = (4 / 3) * Math.PI * a ** 3 * P.rho * P.g, eE = (K.e * P.V) / P.d;
      const nMin = Math.ceil((1.15 * mg) / eE);
      const n = nMin + Math.min(2, Math.floor(3 * unif(z[1])));
      const { vf, vr, C } = dropSpeeds(P, a, n);
      const D = (K.kB * P.T * C) / (6 * Math.PI * P.eta * a);
      const frac = (t) => Math.sqrt((P.tReact / t) ** 2 + (2 * D * t) / P.s ** 2) / Math.sqrt(P.transits);
      const tf0 = P.s / vf, tr0 = P.s / vr;
      const ff = frac(tf0), fr = frac(tr0);
      const tf = roundTo(tf0 * (1 + ff * z[2]), 0.01), tr = roundTo(tr0 * (1 + fr * z[3]), 0.01);
      const vfm = P.s / tf, vrm = P.s / tr;
      const C1 = dropCharge(P, vfm, vrm, true), C0 = dropCharge(P, vfm, vrm, false);
      // σ of q from the two timings (numerical derivatives)
      const sq = (corr) => {
        const q0 = dropCharge(P, vfm, vrm, corr).q;
        const dqf = (dropCharge(P, P.s / (tf * 1.0001), vrm, corr).q - q0) / (tf * 0.0001);
        const dqr = (dropCharge(P, vfm, P.s / (tr * 1.0001), corr).q - q0) / (tr * 0.0001);
        return Math.hypot(dqf * ff * tf, dqr * fr * tr);
      };
      return { a, n, tf, tr, sf: ff * tf, sr: fr * tr, q: C1.q, sq: sq(true), aC: C1.a, qU: C0.q, sqU: sq(false), aU: C0.a, brown: Math.sqrt(2 * D * tf0) };
    },
    columns: [
      { head: 'fall (s)', get: (q) => d2(q.tf) }, { head: 'rise (s)', get: (q) => d2(q.tr) },
      { head: 'q (10⁻¹⁹ C)', get: (q, F) => d3((F.slip ? q.q : q.qU) / 1e-19) },
    ],
    defaultAxes: 'qn',
    axes: {
      qn: {
        label: '$q$ against $n$', xlabel: 'n (assigned)', ylabel: 'q (10⁻¹⁹ C)', fit: 'origin', zeroX: true, zeroY: true, integerX: true,
        points(R, P, F) {
          const q = R.map((r) => (F.slip ? r.q : r.qU)), sq = R.map((r) => (F.slip ? r.sq : r.sqU));
          const A = assignN(q, sq);
          return { x: A.n, y: q.map((v) => v / 1e-19), sy: sq.map((v) => v / 1e-19), eScan: A.e };
        },
        expect: () => (n) => K.e / 1e-19 * n,
        results: (fit) => [{ key: 'e', label: '$e$', value: fit.b * 1e-19, sigma: fit.sb * 1e-19, scale: 1e-19, unit: '\\times10^{-19}\\ \\mathrm{C}', accepted: K.e }],
      },
      mill: {
        label: 'Millikan’s plot', xlabel: '1/(p a) (Pa⁻¹ m⁻¹)', ylabel: '(q/n)^⅔ (10⁻¹⁹ C)^⅔', fit: 'line', zeroX: true,
        points(R, P) {
          const q = R.map((r) => r.qU), sq = R.map((r) => r.sqU);
          const A = assignN(q, sq, 1.2e-19, 2.6e-19);
          const y = q.map((v, i) => (v / A.n[i] / 1e-19) ** (2 / 3));
          return { x: R.map((r) => 1 / (P.p * r.aU)), y, sy: sq.map((s, i) => (2 / 3) * y[i] * (s / q[i])) };
        },
        expect: (P) => (x) => (K.e / 1e-19) ** (2 / 3) * (1 + P.b * x),
        results(fit, P) {
          const { p, cov } = lineP(fit);
          return [
            { key: 'e', label: '$e$ (intercept$^{3/2}$)', ...propagate((q) => q[0] ** 1.5 * 1e-19, p, cov), scale: 1e-19, unit: '\\times10^{-19}\\ \\mathrm{C}', accepted: K.e },
            { key: 'b', label: 'slip constant $b$', ...propagate((q) => q[1] / q[0], p, cov), scale: 1e-3, unit: '\\times10^{-3}\\ \\mathrm{Pa\\,m}', accepted: P.b },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      if (!q) return null;
      const rng = makeRng(Math.floor(Math.abs(q.tf * 1000 + q.tr * 7)) + 1);
      const D = q.brown ** 2 / (2 * (q.tf || 1));
      const pts = []; let t = 0, y = 0.5;
      const leg = (v, T) => { const n = 60; for (let k = 1; k <= n; k++) { const dt = T / n; t += dt; y += v * dt + Math.sqrt(2 * D * dt) * 1000 * gaussian(rng); pts.push([t, y]); } };
      pts.push([0, 0.5]);
      for (let k = 0; k < 3; k++) { leg(-0.5 / q.tf, q.tf); leg(0.5 / q.tr, q.tr); }
      const T = t;
      return {
        x: [0, T], y: [-0.08, 0.6], xlabel: 't (s)', ylabel: 'height (mm)',
        paths: [{ pts, color: 'gold', width: 1.8 }],
        hlines: [{ y: 0, color: 'ink3', dash: [5, 4] }, { y: 0.5, color: 'ink3', dash: [5, 4] }],
        texts: [{ s: `field off: falls in ${d2(q.tf)} s · field on: rises in ${d2(q.tr)} s (means of ${P.transits})`, x: T, y: 0.6, align: 'right', color: 'ink2', size: 11, dy: 10 }],
      };
    },
  },

  // ── E.3: photoelectric effect ─────────────────────────────────────────
  photo: {
    title: 'Stopping voltages for five mercury lines',
    defaults: { phiC: 1.90, phiA: 1.40, sV: 0.02 },   // eV: the cathode’s and the anode’s work functions (illustrative); V: σ of a stopping-voltage reading
    note: 'The stopping voltage is taken as sharp; real photocells have a soft knee, a reverse anode current and stray light, which bias where V₀ is read.',
    flags: [{ key: 'contact', label: 'Contact potential between cathode and anode', value: true, explain: 'The electrons climb to the anode, whose work function differs from the cathode’s: the stopping voltage measures hν − φ(anode), so the intercept is not the cathode’s work function.' }],
    setting: { kind: 'choice', key: 'line', label: 'Mercury line', choices: HG_LINES.map((L) => [L.lam, L.name]), value: 435.833, series: HG_LINES.map((L) => L.lam), explain: 'A filter picks one line of the mercury lamp: its frequency is ν = c/λ.' },
    nz: 1,
    read(lam, z, P, F) {
      const nu = K.c / (lam * 1e-9 * K.nAir);
      const V0 = (K.h * nu) / K.e - (F.contact ? P.phiA : P.phiC);
      return { lam, nu, V: roundTo(V0 + P.sV * z[0], 0.001), sV: P.sV };
    },
    columns: [{ head: 'λ (nm)', get: (q) => d1(q.lam) }, { head: 'ν (10¹⁴ Hz)', get: (q) => (q.nu / 1e14).toFixed(4) }, { head: 'V₀ (V)', get: (q) => d3(q.V) }],
    defaultAxes: 'fv',
    axes: {
      fv: {
        label: '$V_0$ against $\\nu$', xlabel: 'ν (10¹⁴ Hz)', ylabel: 'V₀ (V)', fit: 'line', zeroY: true,
        points: (R) => ({ x: R.map((q) => q.nu / 1e14), y: R.map((q) => q.V), sy: R.map((q) => q.sV) }),
        expect: (P) => (x) => K.he * x * 1e14 - P.phiC,
        results(fit, P) {
          return [
            { key: 'he', label: '$h/e$', value: fit.b * 1e-14, sigma: fit.sb * 1e-14, scale: 1e-15, unit: '\\times10^{-15}\\ \\mathrm{V\\,s}', accepted: K.he },
            { key: 'phi', label: 'work function from the intercept', value: -fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{eV}', accepted: P.phiC },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      if (!q) return null;
      const V0 = q.V, I = (V) => (V < V0 ? 1.6 * ((V0 - V) / 2) ** 2 : 0) - 0.03 * (1 - Math.exp(-(V - V0 + 0.6) / 0.4)) * (V > V0 - 0.6 ? 1 : 0);
      const pts = []; for (let k = 0; k <= 300; k++) { const V = -1 + (4.5 * k) / 300; pts.push([V, Math.min(1.25, I(V))]); }
      return {
        x: [-1, 3.5], y: [-0.12, 1.2], xlabel: 'retarding voltage V (V)', ylabel: 'photocurrent',
        paths: [{ pts, color: 'violet', width: 2 }], hlines: [{ y: 0, color: 'ink3' }],
        vlines: [{ x: V0, color: 'gold', dash: [6, 4] }],
        texts: [{ s: `V₀ = ${d3(V0)} V`, x: V0, y: 1.0, color: 'gold', size: 12, dx: 6 }, { s: `${q.lam.toFixed(1)} nm`, x: 3.4, y: 1.1, align: 'right', color: 'ink2', size: 11 }],
      };
    },
  },

  // ── E.4: Franck–Hertz ──────────────────────────────────────────────────
  fh: {
    title: 'Peaks in a mercury Franck–Hertz tube’s current',
    defaults: { Ea: HG_3P1, Vc: 2.10, lam: 0.006, sV: 0.06 },   // eV; V (offset: contact potential); λ/L (illustrative); V (σ of locating a peak)
    note: 'A teaching model: peaks at V꜀ + nE + n²Eλ/L (the mean-free-path stretch to first order, after Rapior, Sengstock & Baev 2006); the curve’s shape between peaks is drawn, not computed.',
    flags: [{ key: 'mfp', label: 'Mean-free-path stretch of the spacings', value: true, explain: 'An electron reaches the excitation energy, then travels on (about one mean free path) gaining more energy before it collides. The extra grows with the field, so the spacings grow with the order n.' }],
    setting: { kind: 'slider', key: 'n', label: 'Peak number $n$', unit: '', min: 1, max: 7, step: 1, value: 3, series: [1, 2, 3, 4, 5, 6, 7], explain: 'Which current maximum to locate, counting from the lowest voltage.' },
    nz: 1,
    read(n, z, P, F) { return { n, V: roundTo(fhPeak(P, n, F.mfp) + P.sV * z[0], 0.01), sV: P.sV }; },
    columns: [{ head: 'n', get: (q) => String(q.n) }, { head: 'peak V (V)', get: (q) => d2(q.V) }],
    defaultAxes: 'pos',
    axes: {
      pos: {
        label: 'peak voltage against $n$', xlabel: 'n', ylabel: 'peak voltage (V)', fit: 'line', zeroX: true, integerX: true,
        points: (R) => ({ x: R.map((q) => q.n), y: R.map((q) => q.V), sy: R.map((q) => q.sV) }),
        expect: (P) => (n) => P.Vc + n * P.Ea,
        results: (fit, P) => [
          { key: 'E', label: 'spacing (slope)', value: fit.b, sigma: fit.sb, scale: 1, unit: '\\mathrm{V}', accepted: P.Ea },
          { key: 'Vc', label: 'offset (intercept)', value: fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{V}', accepted: null },
        ],
      },
      gap: {
        label: 'spacing against $n$', xlabel: 'n (spacing from peak n − 1 to n)', ylabel: 'spacing (V)', fit: 'line', zeroX: true, integerX: true,
        points(R) {
          const byN = new Map();
          for (const q of R) { if (!byN.has(q.n)) byN.set(q.n, []); byN.get(q.n).push(q); }
          const mean = (L) => ({ V: L.reduce((s, q) => s + q.V, 0) / L.length, s: L[0].sV / Math.sqrt(L.length) });
          const x = [], y = [], sy = [];
          for (const n of [...byN.keys()].sort((a, b) => a - b)) {
            if (!byN.has(n - 1)) continue;
            const A = mean(byN.get(n)), B = mean(byN.get(n - 1));
            x.push(n); y.push(A.V - B.V); sy.push(Math.hypot(A.s, B.s));
          }
          return { x, y, sy };
        },
        expect: (P) => (n) => P.Ea * (1 + (2 * n - 1) * P.lam),
        results(fit) {
          const { p, cov } = lineP(fit);
          return [
            { key: 'E', label: '$E$ (the line at $n = \\tfrac12$)', ...propagate((q) => q[0] + q[1] / 2, p, cov), scale: 1, unit: '\\mathrm{eV}', accepted: HG_3P1 },
            { key: 'lam', label: '$\\lambda/L$ (slope ÷ 2E)', ...propagate((q) => q[1] / (2 * (q[0] + q[1] / 2)), p, cov), scale: 1, unit: '', accepted: null },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      // the current: a rising envelope × a periodic modulation with maxima at the model's peaks (shape illustrative)
      const nOf = (V) => {   // continuous order with Vc + nE + n²Eλ = V
        const a = F.mfp ? P.Ea * P.lam : 0, b = P.Ea, c = P.Vc - V;
        return a > 0 ? (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a) : -c / b;
      };
      const I = (V) => { const n = nOf(V); if (n < 0) return 0.02 * Math.max(0, V) / P.Vc; const u = n - Math.floor(n); const saw = u < 0.18 ? Math.cos((Math.PI / 2) * (u / 0.18)) ** 2 : Math.sin((Math.PI / 2) * ((u - 0.18) / 0.82)) ** 2; /* a maximum at each whole n, a sharp drop just after */ return (V / 40) ** 1.4 * (0.35 + 0.65 * saw) + 0.02; };
      const pts = []; for (let k = 0; k <= 800; k++) { const V = (42 * k) / 800; pts.push([V, I(V)]); }
      const marks = R.map((r, j) => ({ x: r.V, y: I(fhPeak(P, r.n, F.mfp)), color: j === i ? 'gold' : 'accent', r: j === i ? 5 : 3.5 }));
      return {
        x: [0, 42], y: [0, 1.25], xlabel: 'accelerating voltage (V)', ylabel: 'anode current',
        paths: [{ pts, color: 'violet', width: 2 }], points: marks,
        texts: q ? [{ s: `peak ${q.n} located at ${d2(q.V)} V`, x: 1, y: 1.2, color: 'gold', size: 12, dy: 8 }] : [],
      };
    },
  },

  // ── E.5: Michelson ─────────────────────────────────────────────────────
  michelson: {
    title: 'Counting fringes as a micrometer moves one mirror',
    defaults: { ratio: 5, leverErr: 0.02, sN: 0.4, source: 'hene' },   // lever reduction (nominal); its true fractional error; σ of a count before rounding
    note: 'Fringes are counted by eye at the centre of the pattern; backlash, vibration and the sodium doublet’s fading visibility are left out.',
    flags: [{ key: 'lever', label: 'Lever ratio 2% off its nominal 5 : 1', value: true, explain: 'The micrometer drives the mirror through a lever. If its true ratio is 5.1 : 1, every mirror travel you infer from the dial is 2% too big.' }],
    options: [{ key: 'source', label: 'Light source', choices: [['hene', 'He–Ne laser'], ['na', 'sodium lamp']], explain: 'The He–Ne line, 632.8 nm, is known: use it to calibrate. The sodium D lines average 589.3 nm.' }],
    setting: { kind: 'slider', key: 'dm', label: 'Micrometer travel', unit: '\\mu\\mathrm{m}', min: 25, max: 200, step: 5, value: 100, series: [25, 50, 75, 100, 125, 150, 175, 200], explain: 'How far the micrometer screw has turned. The mirror moves this ÷ 5 (the nominal lever ratio).' },
    nz: 1,
    read(dm, z, P, F) {
      const lam = P.source === 'na' ? NA_D : 632.8;
      const d = dm / (P.ratio * (F.lever ? 1 + P.leverErr : 1));
      return { dm, d: dm / P.ratio, dTrue: d, lam, N: Math.round((2000 * d) / lam + P.sN * z[0]), sN: 0.5 };
    },
    columns: [{ head: 'micrometer (μm)', get: (q) => String(q.dm) }, { head: 'mirror d (μm)', get: (q) => d1(q.d) }, { head: 'fringes N', get: (q) => String(q.N) }],
    defaultAxes: 'Nd',
    axes: {
      Nd: {
        label: '$N$ against $d$', xlabel: 'mirror travel d (μm, from the dial)', ylabel: 'fringes counted N', fit: 'line', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => q.d), y: R.map((q) => q.N), sy: R.map((q) => q.sN) }),
        expect: (P) => (d) => (2000 * d) / (P.source === 'na' ? NA_D : 632.8),
        results(fit, P) {
          const lam = P.source === 'na' ? NA_D : 632.8;
          return [{ key: 'lam', label: '$\\lambda = 2/\\text{slope}$', value: 2000 / fit.b, sigma: (2000 / fit.b) * (fit.sb / fit.b), scale: 1, unit: '\\mathrm{nm}', accepted: lam }];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      if (!q) return null;
      // the last 3 μm of the travel, so single fringes can be seen
      const w = Math.min(3, q.d), x0 = q.d - w, pts = [], n = 600;
      for (let k = 0; k <= n; k++) { const xd = x0 + (w * k) / n; pts.push([xd, Math.cos((TAU * 2 * xd * (q.dTrue / q.d) * 1000) / q.lam) ** 2]); }
      return {
        x: [x0, q.d], y: [-0.05, 1.35], xlabel: 'mirror travel from the dial (μm)', ylabel: 'detector',
        paths: [{ pts, color: q.lam > 600 ? 'bad' : 'gold', width: 1.8 }],
        texts: [{ s: `${q.N} fringes counted over ${d1(q.d)} μm (the last ${w} μm shown)`, x: x0, y: 1.35, color: 'ink', size: 12, dx: 4, dy: 10 }],
      };
    },
  },

  // ── E.6: Fabry–Pérot ───────────────────────────────────────────────────
  fp: {
    title: 'Ring radii of a Fabry–Pérot etalon',
    defaults: { d: 2.000e-3, f: 0.200, lam: 632.8, sr: 0.03, delta: 0.25, R: 0.85 },   // m (gap); m (lens); nm; mm (σ of a radius); mm (centre misplaced); mirror reflectance
    note: 'An air-spaced etalon at normal incidence, rings on the focal plane of a lens of known focal length. Ring radii are measured from a ring-profile fit; mirror flatness and finite aperture are left out.',
    flags: [{ key: 'centre', label: 'Radii measured from a misplaced centre', value: false, explain: 'Measure each ring’s radius on one side from where you think the centre is. Off by 0.25 mm, every radius is off — differently in r². Measuring diameters (both sides) cancels it.' }],
    setting: { kind: 'slider', key: 'p', label: 'Ring number $p$', unit: '', min: 1, max: 10, step: 1, value: 3, series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], explain: 'Which bright ring, counting outward from the centre.' },
    nz: 1,
    read(p, z, P, F) {
      const { r } = fpRing(P, p);
      const rmm = 1000 * r - (F.centre ? P.delta : 0);
      const rm = roundTo(rmm + P.sr * z[0], 0.01);
      return { p, r: rm, sr: P.sr };
    },
    columns: [{ head: 'ring p', get: (q) => String(q.p) }, { head: 'r (mm)', get: (q) => d2(q.r) }, { head: 'r² (mm²)', get: (q) => (q.r ** 2).toFixed(1) }],
    defaultAxes: 'r2',
    axes: {
      r2: {
        label: '$r^2$ against $p$', xlabel: 'ring number p', ylabel: 'r² (mm²)', fit: 'line', zeroX: true, integerX: true,
        points: (R) => ({ x: R.map((q) => q.p), y: R.map((q) => q.r ** 2), sy: R.map((q) => 2 * q.r * q.sr) }),
        expect: (P) => (p) => (1e6 * P.f ** 2 * P.lam * 1e-9 * (p - 1 + fpRing(P, 1).eps)) / P.d,
        results(fit, P) {
          const { p, cov } = lineP(fit);
          return [
            { key: 'd', label: 'gap $d = f^2\\lambda/\\text{slope}$', ...propagate((q) => (P.f ** 2 * P.lam * 1e-9 * 1e6) / q[1] * 1000, p, cov), scale: 1, unit: '\\mathrm{mm}', accepted: P.d * 1000 },
            { key: 'eps', label: 'fraction of an order at the centre', ...propagate((q) => 1 + q[0] / q[1], p, cov), scale: 1, unit: '', accepted: fpRing(P, 1).eps },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const rings = []; for (let p = 1; p <= 10; p++) rings.push(1000 * fpRing(P, p).r);
      const fin = (Math.PI * Math.sqrt(P.R)) / (1 - P.R);
      const circles = rings.map((r, k) => ({ x: 0, y: 0, r, color: 'bad', width: Math.max(1.2, 6 / fin * 4), alpha: 0.85 - 0.04 * k }));
      const cx = F.centre ? P.delta : 0;
      const paths = [{ pts: [[cx - 0.5, 0], [cx + 0.5, 0]], color: 'ink', width: 1.5 }, { pts: [[cx, -0.5], [cx, 0.5]], color: 'ink', width: 1.5 }];
      if (q) paths.push({ pts: [[cx, 0], [cx + q.r, 0]], color: 'gold', width: 2 });
      return {
        x: [-13, 13], y: [-12, 12], equal: true, axes: false, circles, paths,
        texts: [
          { s: F.centre ? 'centre as marked (0.25 mm off)' : 'centre', x: cx, y: -0.6, color: 'ink2', size: 10.5, align: 'center', dy: 10 },
          q ? { s: `ring ${q.p}: r = ${d2(q.r)} mm`, x: 12.5, y: 11.5, align: 'right', color: 'gold', size: 12 } : null,
          { s: `finesse ${fin.toFixed(1)} (mirrors R = ${P.R}); ring widths not to scale`, x: -12.5, y: -11.5, color: 'ink3', size: 10.5 },
        ].filter(Boolean),
      };
    },
  },

  // ── E.7: Cavendish ─────────────────────────────────────────────────────
  cavendish: {
    title: 'A torsion balance’s light spot after the large spheres are swung',
    defaults: { M: 1.5, m: 0.015, d: 0.050, b: 0.0465, T0: 600, tau: 1500, L: 5.0, S1: 30.0, drift: 0.04, sS: 0.2, dt: 0.5, Ttot: 45 },
    // kg, kg, m (half the beam), m (sphere centres), s (undamped period), s (damping time), m (mirror to scale), cm, cm/min, cm (σ of a reading), min, min
    note: 'The beam is massless, the spheres are points, and the fibre is a perfect linear spring; the light lever doubles the beam’s turn. Seismic and air-current torques are left out.',
    flags: [
      { key: 'drift', label: 'The fibre’s zero drifts', value: true, explain: 'A torsion fibre relaxes slowly after a load change, and the room’s temperature changes: the equilibrium creeps along the scale, here at 0.04 cm per minute.' },
      { key: 'fitdrift', label: 'Fit a drift term', value: true, explain: 'Add a straight-line drift to the fitted model, so the fit can tell creep from the shift you are measuring.' },
      { key: 'far', label: 'Correct for the far sphere', value: true, explain: 'Each large sphere also pulls, weakly and the other way, on the small sphere at the far end of the beam. Dividing by 1 − β, β = b³/(b² + 4d²)^{3/2}, corrects for it.' },
    ],
    setting: { kind: 'sequence', label: 'time', unit: '\\mathrm{min}' },
    nz: 1,
    read(t, z, P, F) { return { t, S: roundTo(cavSpot(P, t, F.drift) + P.sS * z[0], 0.05), sS: P.sS }; },
    columns: [{ head: 't (min)', get: (q) => d1(q.t) }, { head: 'spot S (cm)', get: (q) => d2(q.S) }],
    defaultAxes: 'St',
    axes: {
      St: {
        label: 'spot against time', xlabel: 't (min)', ylabel: 'spot position S (cm)', fit: 'curve', min: 8,
        points: (R) => ({ x: R.map((q) => q.t), y: R.map((q) => q.S), sy: R.map((q) => q.sS) }),
        curve(d, P, F) {
          const y0 = d.y[0], tail = d.y.slice(Math.floor((2 * d.y.length) / 3));
          const p0 = [y0, tail.reduce((s, v) => s + v, 0) / tail.length, 20, P.T0 / 60, ...(F.fitdrift ? [0] : [])];
          return fitCurve(cavModel, d.x, d.y, d.sy, p0, { scale: [10, 10, 10, 5, 0.05].slice(0, p0.length) });
        },
        expect: (P) => (t) => cavSpot(P, t, false),
        results(fit, P, F) {
          const sc = [10, 10, 10, 5, 0.05].slice(0, fit.p.length);
          return [
            { key: 'G', label: '$G$', ...propagate((q) => cavG(P, q, F.far), fit.p, fit.cov, sc), scale: 1e-11, unit: '\\times10^{-11}\\ \\mathrm{m^3\\,kg^{-1}\\,s^{-2}}', accepted: K.G },
            { key: 'dS', label: 'shift $\\Delta S = S_1 - S_2$', ...propagate((q) => q[0] - q[1], fit.p, fit.cov, sc), scale: 1, unit: '\\mathrm{cm}', accepted: 400 * P.L * cavTheta(P) },
            { key: 'T0', label: 'undamped period', ...propagate((q) => { const wd = TAU / (q[3] * 60); return TAU / Math.sqrt(wd * wd + 1 / (q[2] * 60) ** 2) / 60; }, fit.p, fit.cov, sc), scale: 1, unit: '\\mathrm{min}', accepted: P.T0 / 60 },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      // top view: the beam turned by the latest reading's angle (exaggerated), small and large spheres
      const q = R[i];
      const S2 = P.S1 - 400 * P.L * cavTheta(P);
      const th = q ? ((q.S - (P.S1 + S2) / 2) / 100 / (4 * P.L)) * 10 : 0;   // ×10 so it shows
      const c = Math.cos(th), s = Math.sin(th), L = 5;
      const ends = [[L * c, L * s], [-L * c, -L * s]];
      return {
        x: [-9, 9], y: [-4.8, 4.8], equal: true, axes: false,
        paths: [{ pts: [ends[1], ends[0]], color: 'ink2', width: 2.5 }],
        circles: [
          ...ends.map(([x, y]) => ({ x, y, r: 0.45, color: 'gold', fill: 'gold', alpha: 0.95 })),
          { x: L, y: -2.6, r: 1.6, color: 'accent', fill: 'accent', alpha: 0.55 }, { x: -L, y: 2.6, r: 1.6, color: 'accent', fill: 'accent', alpha: 0.55 },
          { x: 0, y: 0, r: 0.25, color: 'ink', fill: 'ink' },
        ],
        texts: [
          { s: 'fibre and mirror', x: 0, y: 0, color: 'ink2', size: 10.5, dx: 8, dy: 14 },
          { s: 'large sphere', x: L + 1.8, y: -2.6, color: 'accent', size: 10.5 },
          { s: 'small sphere', x: ends[0][0] + 0.7, y: ends[0][1] + 0.5, color: 'gold', size: 10.5 },
          { s: 'top view, not to scale; the turn drawn ×10', x: -8.8, y: -4.4, color: 'ink3', size: 10.5 },
        ],
      };
    },
  },

  // ── E.8: coupled pendulums ─────────────────────────────────────────────
  coupled: {
    title: 'Two pendulums joined by a spring',
    defaults: { L: 1.000, m: 1.00, k: 2.00, g: 9.80, theta0: 15, sT10: 0.06 },   // m; kg; N/m; m/s²; degrees (the large release); s (σ of timing ten swings)
    note: 'Point bobs on massless rods; a massless spring that stays horizontal; no damping. The large-amplitude stretch is applied to gravity’s part of each mode only.',
    flags: [{ key: 'amp', label: 'Released at 15° instead of 3°', value: false, explain: 'A pendulum’s period grows with amplitude (about 0.43% at 15°): the small-angle formula ω² = g/L then overstates ω².' }],
    setting: { kind: 'slider', key: 'l', label: 'Spring height $\\ell$ below the pivots', unit: '\\mathrm{m}', min: 0.2, max: 0.9, step: 0.05, value: 0.6, series: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], explain: 'Where the spring is clipped to the two rods. Its torque grows as ℓ², so the out-of-phase mode stiffens.' },
    nz: 2,
    read(l, z, P, F) {
      const { w1, w2 } = modes(P, l, F.amp);
      const T1 = roundTo(TAU / Math.sqrt(w1) + (P.sT10 / 10) * z[0], 0.001), T2 = roundTo(TAU / Math.sqrt(w2) + (P.sT10 / 10) * z[1], 0.001);
      return { l, T1, T2, sT: P.sT10 / 10 };
    },
    columns: [{ head: 'ℓ (m)', get: (q) => d2(q.l) }, { head: 'T in phase (s)', get: (q) => d3(q.T1) }, { head: 'T out of phase (s)', get: (q) => d3(q.T2) }],
    defaultAxes: 'w2',
    axes: {
      w2: {
        label: '$\\omega_2^2$ against $\\ell^2$', xlabel: 'ℓ² (m²)', ylabel: 'ω₂² (s⁻²)', fit: 'line', zeroX: true,
        points(R) { const y = R.map((q) => (TAU / q.T2) ** 2); return { x: R.map((q) => q.l * q.l), y, sy: R.map((q, i) => 2 * y[i] * (q.sT / q.T2)) }; },
        expect: (P) => (x) => P.g / P.L + (2 * P.k * x) / (P.m * P.L * P.L),
        results(fit, P) {
          return [
            { key: 'g', label: '$g = L \\times$ intercept', value: fit.a * P.L, sigma: fit.sa * P.L, scale: 1, unit: '\\mathrm{m/s^2}', accepted: P.g },
            { key: 'k', label: '$k = mL^2 \\times$ slope $/2$', value: (fit.b * P.m * P.L * P.L) / 2, sigma: (fit.sb * P.m * P.L * P.L) / 2, scale: 1, unit: '\\mathrm{N/m}', accepted: P.k },
          ];
        },
      },
      w1: {
        label: '$\\omega_1^2$ against $\\ell^2$', xlabel: 'ℓ² (m²)', ylabel: 'ω₁² (s⁻²)', fit: 'line', zeroX: true,
        points(R) { const y = R.map((q) => (TAU / q.T1) ** 2); return { x: R.map((q) => q.l * q.l), y, sy: R.map((q, i) => 2 * y[i] * (q.sT / q.T1)) }; },
        expect: (P) => () => P.g / P.L,
        results: (fit, P) => [{ key: 'g', label: '$g = L \\times$ intercept', value: fit.a * P.L, sigma: fit.sa * P.L, scale: 1, unit: '\\mathrm{m/s^2}', accepted: P.g }],
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const l = q ? q.l : 0.6;
      const { w1, w2 } = modes(P, l, F.amp);
      const a = Math.sqrt(w1), b = Math.sqrt(w2), Tb = TAU / (b - a);
      const Tw = Math.min(Tb * 1.1, 400);
      const n = 2400, p1 = [], p2 = [];
      for (let k = 0; k <= n; k++) { const t = (Tw * k) / n; p1.push([t, 0.5 * (Math.cos(a * t) + Math.cos(b * t))]); p2.push([t, 0.5 * (Math.cos(a * t) - Math.cos(b * t)) - 2.6]); }
      return {
        x: [0, Tw], y: [-3.8, 1.3], xlabel: 't (s)', ylabel: '', yticks: 0,
        paths: [{ pts: p1, color: 'accent', width: 1.2 }, { pts: p2, color: 'warn', width: 1.2 }],
        vlines: Tb <= Tw ? [{ x: Tb, color: 'gold', dash: [6, 4] }] : [],
        texts: [
          { s: 'pendulum 1 (pulled aside, released)', x: 0, y: 1.3, color: 'accent', size: 11, dx: 4, dy: 8 },
          { s: 'pendulum 2 (released at rest)', x: 0, y: -1.3, color: 'warn', size: 11, dx: 4, dy: 8 },
          Tb <= Tw ? { s: `beat period ${d1(Tb)} s`, x: Tb, y: -3.7, color: 'gold', size: 11, align: 'right', dx: -4 } : null,
          { s: `ℓ = ${d2(l)} m`, x: Tw, y: 1.3, color: 'ink2', size: 11, align: 'right', dy: 8 },
        ].filter(Boolean),
      };
    },
  },

  // ── E.9: speed of light ────────────────────────────────────────────────
  light: {
    title: 'Laser pulses timed to a movable retroreflector',
    defaults: { t0: 12.0, st: 0.4, xd: 8, w: 2.0, thr: 0.1 },   // ns (electronics and cable offset); ns (σ of a delay reading); m (return height halves at…); ns (pulse width); threshold (× the reference pulse)
    note: 'Pulses are Gaussian; the return weakens as 1/(1 + (x/8 m)²) from beam spread. Air slows light by 0.03%, below this resolution, and is left out.',
    flags: [{ key: 'walk', label: 'Leading-edge timing (time walk)', value: false, explain: 'The scope times each pulse where its leading edge crosses a fixed threshold. A weaker pulse crosses later relative to its peak — so far returns read late. A constant-fraction trigger (off) times every pulse at the same fraction of its height.' }],
    setting: { kind: 'slider', key: 'x', label: 'Reflector distance $x$', unit: '\\mathrm{m}', min: 0.5, max: 10, step: 0.5, value: 5, series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], explain: 'How far the retroreflector stands beyond the reference point: the light travels 2x more.' },
    nz: 1,
    read(x, z, P, F) { return { x, t: roundTo(lightDelay(P, x, F.walk) + P.st * z[0], 0.1), st: P.st }; },
    columns: [{ head: 'x (m)', get: (q) => d1(q.x) }, { head: 'delay (ns)', get: (q) => d1(q.t) }],
    defaultAxes: 'tx',
    axes: {
      tx: {
        label: 'delay against $x$', xlabel: 'x (m)', ylabel: 'delay (ns)', fit: 'line', zeroX: true, zeroY: true,
        points: (R) => ({ x: R.map((q) => q.x), y: R.map((q) => q.t), sy: R.map((q) => q.st) }),
        expect: (P) => (x) => lightDelay(P, x, false),
        results(fit, P) {
          const { p, cov } = lineP(fit);
          return [
            { key: 'c', label: '$c = 2/\\text{slope}$', ...propagate((q) => 2e9 / q[1], p, cov), scale: 1e8, unit: '\\times10^{8}\\ \\mathrm{m/s}', accepted: K.c },
            { key: 't0', label: 'offset (intercept)', value: fit.a, sigma: fit.sa, scale: 1, unit: '\\mathrm{ns}', accepted: P.t0 },
          ];
        },
      },
    },
    raw(R, P, F, i) {
      const q = R[i];
      const x = q ? q.x : 5;
      const A = lightAmp(P, x), tr = 20, tret = tr + lightDelay(P, x, false);
      const g = (t, t1, a) => a * Math.exp(-(((t - t1) / P.w) ** 2) / 2);
      const pts = []; for (let k = 0; k <= 1200; k++) { const t = (120 * k) / 1200; pts.push([t, g(t, tr, 1) + g(t, tret, A)]); }
      const ret = F.walk ? tret - leadEdge(P, A) : tret, ref = F.walk ? tr - leadEdge(P, 1) : tr;
      return {
        x: [0, 120], y: [-0.08, 1.25], xlabel: 't (ns)', ylabel: 'photodiode',
        paths: [{ pts, color: 'bad', width: 1.8 }],
        hlines: F.walk ? [{ y: P.thr, color: 'ink3', dash: [5, 4] }] : [],
        points: [{ x: ref, y: F.walk ? P.thr : 1, color: 'gold', r: 4.5 }, { x: ret, y: F.walk ? P.thr : A, color: 'gold', r: 4.5 }],
        texts: [
          { s: 'reference', x: tr, y: 1.1, color: 'ink2', size: 11, align: 'center' },
          { s: `return from x = ${d1(x)} m`, x: tret, y: A + 0.12, color: 'ink2', size: 11, align: 'center' },
          { s: F.walk ? 'timed where each pulse crosses the threshold' : 'timed at each pulse’s peak (constant fraction)', x: 119, y: 1.2, color: 'gold', size: 11, align: 'right', dy: 8 },
        ],
      };
    },
  },
};

// ─── running an experiment ────────────────────────────────────────────────

/** The experiment with its parameters (defaults overridden) and flags (defaults overridden). */
export function experiment(id, params = {}, flags = {}) {
  const E = EXPERIMENTS[id];
  if (!E) throw new Error(`labe-rig: no experiment “${id}”`);
  const P = { ...E.defaults, ...params };
  const F = {};
  for (const f of E.flags) F[f.key] = flags[f.key] ?? f.value;
  return { E, P, F };
}

/** The standard settings of a series: the slider series, every choice, the sequence's times, or n random drops. */
export function seriesOf(E, P) {
  const st = E.setting;
  if (st.kind === 'sequence') { const out = []; for (let t = 0; t <= P.Ttot + 1e-9; t += P.dt) out.push(+t.toFixed(6)); return out; }
  if (st.kind === 'random') return Array(st.series).fill(null);
  return st.series.slice();
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
