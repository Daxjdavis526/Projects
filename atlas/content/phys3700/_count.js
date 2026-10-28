// Constants, counting and picture builders for the PHYS 3700 lessons (modules
// T0–T2). Counting comes from the tested model behind the th-einstein sim, so
// a lesson and its picture count the same way. Every picture builder returns an
// ordinary visual spec, which the content test validates like any other.
// Not a lesson: the leading underscore keeps it out of the lesson registry.

import { fmt } from '../../src/core/format.js';
import * as M from '../../src/viz/model/th-einstein.js';
export { KB, NA, R, MOLAR, LN2, LOX, ATM, C0, tag, apart } from '../phys2210/_thermal.js';
export const { lnFact, lnChoose, choose, lnOmega, omega, pairDist, stirling, stirling2, microstates } = M;

// ─── constants (exact SI values, or CODATA 2022) ───────────────────────────
export const H = 6.62607015e-34;          // J s
export const HBAR = H / (2 * Math.PI);
export const EV = 1.602176634e-19;        // J
export const AMU = 1.66053906892e-27;     // kg (CODATA 2022)
export const MU_B = 9.2740100657e-24;     // J/T, the Bohr magneton
export const G = 6.67430e-11;             // m³/(kg s²)
export const CL = 299792458;              // m/s
export const MSUN = 1.98841e30;           // kg (IAU nominal GM☉ / G)
/** Para-hydrogen at its normal boiling point (NIST Chemistry WebBook, rounded): K, J/kg, kg/m³. */
export const LH2 = { Tb: 20.3, Lv: 446e3, rho: 70.8 };
const KB_ = 1.380649e-23;

// ─── numbers as text ───────────────────────────────────────────────────────
export const r4 = (v) => +(+v).toFixed(4);
/** TeX for a positive number given by its log₁₀: plain while small, m × 10ⁿ, or 10^(m × 10ⁿ) when the exponent itself is huge. */
export function pow10TeX(l10, n = 3) {
  if (!Number.isFinite(l10)) return '0';
  if (l10 >= 1e5) return `10^{${texNum(l10, n)}}`;
  if (l10 < 5 && l10 > -3) return fmt(10 ** l10, n);
  let e = Math.floor(l10), m = 10 ** (l10 - e);
  if (+m.toFixed(n - 1) >= 10) { m = 1; e += 1; }
  return `${m.toFixed(n - 1)} \\times 10^{${e}}`;
}
/** TeX for an ordinary number with n significant figures: m × 10ⁿ outside 10⁻³ … 10⁵. */
export function texNum(x, n = 3) {
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) { const [m, e] = x.toExponential(n - 1).split('e'); return `${m} \\times 10^{${parseInt(e, 10)}}`; }
  return fmt(x, n);
}
/** A whole number with thin-space thousands, for TeX. */
export const thouTeX = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
/** A whole number with plain spaces, for prose and canvas labels. */
export const thou = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
/** A number for a canvas label: up to n significant figures, true minus sign. */
export const lab = (x, n = 4) => String(+(+x).toPrecision(n)).replace('-', '−');

// ─── pictures ──────────────────────────────────────────────────────────────

/**
 * A bar chart as a graph: data [{ x, y, color, label }] (y already in the
 * plotted units — log₁₀ for ylog), bars `width` wide, standing on `base`.
 */
export function bars(data, { x, y, width = 0.8, base = 0, color = 'accent', alpha = 0.55, xlabel = '', ylabel = '', ylog = false, xticks, yticks, points = [], curves = [], vlines = [], hlines = [], arrows = [], legend, legendAt, caption, alt, aspect = 'wide' } = {}) {
  const shade = data.map((d) => ({ fn: String(r4(d.y)), lower: String(r4(base)), from: r4(d.x - width / 2), to: r4(d.x + width / 2), color: d.color || color, alpha: d.alpha ?? alpha }));
  const labels = data.filter((d) => d.label).map((d) => ({ x: r4(d.x), y: r4(d.y), r: 0.01, color: d.labelColor || 'ink2', label: d.label, labelDx: -3.2 * [...d.label].length, labelDy: -10 }));
  return {
    type: 'graph',
    params: { x, y, aspect, xlabel, ylabel, ...(ylog ? { ylog: true } : {}), ...(xticks !== undefined ? { xticks } : {}), ...(yticks !== undefined ? { yticks } : {}), axesAt: 'edge', alt: alt || 'A bar chart', shade, points: [...labels, ...points], curves, vlines, hlines, arrows, ...(legend ? { legend, legendAt } : {}) },
    caption,
  };
}

/** The binomial distribution for N trials with chance p, as bars (probabilities, or log₁₀ of them). */
export function binomBars(N, p, { hi = null, hiColor = 'gold', ylog = false, mean = false, sd = false, ask = null, xmax = null, caption, alt, ylabel, xlabel = 'number of successes' } = {}) {
  const data = [];
  let top = 0;
  for (let k = 0; k <= N; k++) {
    const lp = (lnChoose(N, k) + k * Math.log(p) + (N - k) * Math.log(1 - p)) / Math.LN10;
    const yv = ylog ? lp : 10 ** lp;
    top = Math.max(top, yv);
    data.push({ x: k, y: yv, color: hi !== null && (Array.isArray(hi) ? hi.includes(k) : hi === k) ? hiColor : undefined, alpha: hi !== null && (Array.isArray(hi) ? hi.includes(k) : hi === k) ? 0.85 : undefined });
  }
  const m = N * p, s = Math.sqrt(N * p * (1 - p));
  const vlines = [];
  if (mean) vlines.push({ x: r4(m), label: 'mean', color: 'ink2' });
  const arrows = sd ? [{ from: [r4(m), r4(0.55 * top)], to: [r4(m + s), r4(0.55 * top)], color: 'gold', label: 'σ', labelDx: 4, labelDy: -4 }] : [];
  const points = ask ? [{ x: r4(ask[0]), y: r4(ask[1] ?? top * 1.05), r: 0.01, color: 'gold', label: ask[2] || '?', labelDx: -4, labelDy: -8 }] : [];
  const lo = ylog ? Math.floor(Math.min(...data.map((d) => d.y))) : 0;
  return bars(data, {
    x: [-0.8, (xmax ?? N) + 0.8], y: ylog ? [lo, Math.ceil(top) + 0.3] : [0, r4(top * 1.18)], base: lo, width: N > 60 ? 0.9 : 0.8,
    xlabel, ylabel: ylabel || (ylog ? 'probability (log scale)' : 'probability'), ylog, vlines, arrows, points,
    caption, alt: alt || `The binomial distribution for ${N} trials`,
  });
}

/** A th-einstein visual. */
export const einPic = (params, caption) => ({ type: 'th-einstein', params: { readouts: false, play: false, ...params }, ...(caption ? { caption } : {}) });

/** One Einstein-solid microstate as ● and | (stars and bars), drawn on a graph with the oscillators labelled. */
export function starsPic(occ, { caption, alt, title = null } = {}) {
  const points = [], curves = [];
  let x = 0;
  occ.forEach((nq, i) => {
    const x0 = x;
    for (let k = 0; k < nq; k++) { points.push({ x: r4(x + 0.5), y: 0, r: 7, color: 'accent' }); x += 1; }
    points.push({ x: r4((x0 + x) / 2 + (nq ? 0 : 0)), y: -0.9, r: 0.01, color: 'ink2', label: `osc ${i + 1}: ${nq}`, labelDx: -24, labelDy: 0 });
    if (i < occ.length - 1) { curves.push({ param: [String(r4(x + 0.5)), 't'], t: [-0.45, 0.45], color: 'warn', width: 3.5 }); x += 1; }
  });
  if (title) points.push({ x: r4(x / 2), y: 1.1, r: 0.01, color: 'ink', label: title, labelDx: -3.2 * [...title].length, labelDy: 0 });
  return {
    type: 'graph',
    params: { x: [-0.8, r4(x + 0.8)], y: [-1.5, 1.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', alt: alt || 'Quanta as dots and walls between oscillators as bars', points, curves },
    caption: caption ?? 'One microstate in stars and bars: each dot is a quantum, each orange bar a wall between neighbouring oscillators.',
  };
}

/** Molar entropy of a monatomic ideal gas (Sackur–Tetrode), J/(mol K), at T (K) and P (Pa), atomic mass m (u). */
export function sackurTetrode(mU, T, P) {
  const m = mU * AMU, vQ = (H / Math.sqrt(2 * Math.PI * m * KB_ * T)) ** 3, VperN = (KB_ * T) / P;
  return 8.31446261815324 * (Math.log(VperN / vQ) + 2.5);
}

// ─── diatomic heat capacities from quantum levels ──────────────────────────
// hc/k in cm·K (exact SI constants)
export const HCK = (H * CL * 100) / 1.380649e-23;
/** Molecular constants: θ_rot from the ground-state rotational constant B₀, θ_vib from the fundamental band (cm⁻¹, NIST Chemistry WebBook / Huber–Herzberg). */
export const DIATOMIC = {
  H2: { B: 59.322, nu: 4161.17, spin: [1, 3] },      // para (even J) : ortho (odd J) = 1 : 3 in normal hydrogen
  D2: { B: 29.904, nu: 2993.6, spin: [2, 1] },       // ortho (even J) : para (odd J) = 2 : 1 in normal deuterium
  N2: { B: 1.98957, nu: 2329.9, spin: [2, 1] },
  O2: { B: 1.4377, nu: 1556.4, spin: null },
};
export const thetaRot = (g) => DIATOMIC[g].B * HCK;
export const thetaVib = (g) => DIATOMIC[g].nu * HCK;

/** C_rot/R of a rigid rotor restricted to J of one parity (0 even, 1 odd, null both), at θ/T = b — computed numerically. */
function cRotNum(b, parity, Jmax = 60) {
  let Z = 0, E1 = 0, E2 = 0;
  for (let J = 0; J <= Jmax; J++) {
    if (parity !== null && J % 2 !== parity) continue;
    const e = J * (J + 1), w = (2 * J + 1) * Math.exp(-e * b);
    Z += w; E1 += w * e; E2 += w * e * e;
  }
  return b * b * (E2 / Z - (E1 / Z) ** 2);
}
/** C_vib/R of one harmonic vibration at θ/T = b (the Einstein function). */
const cVibNum = (b) => (b > 300 ? 0 : (b * b * Math.exp(b)) / (Math.exp(b) - 1) ** 2);
/** C_V/R of an ideal diatomic gas at T: translation + rotation (fixed spin mixture) + vibration. */
export function diatomicCv(g, T, { vib = true } = {}) {
  const d = DIATOMIC[g], br = thetaRot(g) / T;
  let rot;
  if (d.spin && br > 0.02) { const [we, wo] = d.spin; rot = (we * cRotNum(br, 0) + wo * cRotNum(br, 1)) / (we + wo); }
  else rot = br > 0.02 ? cRotNum(br, null) : 1;
  return 1.5 + rot + (vib ? cVibNum(thetaVib(g) / T) : 0);
}

/** The same C_V/R as expression text in the variable expression Tv (e.g. '10^x' or 'T'), for graph curves and readouts. */
export function diatomicCvExpr(g, Tv = '10^x', Jmax = 22) {
  const d = DIATOMIC[g], tr = r4(thetaRot(g)), tv = r4(thetaVib(g));
  const b = `(${tr}/(${Tv}))`;
  const sums = (par) => {
    const Js = [];
    for (let J = 0; J <= Jmax; J++) if (par === null || J % 2 === par) Js.push(J);
    const term = (J, p) => `${(2 * J + 1) * (J * (J + 1)) ** p}*e^(-${J * (J + 1)}*${b})`;
    const S = (p) => `(${Js.map((J) => term(J, p)).join(' + ')})`;
    return `${b}^2*(${S(2)}/${S(0)} - (${S(1)}/${S(0)})^2)`;
  };
  let rot;
  if (d.spin) { const [we, wo] = d.spin; rot = `(${we}*${sums(0)} + ${wo}*${sums(1)})/${we + wo}`; }
  else rot = sums(null);
  const bv = `(${tv}/(${Tv}))`;
  const vib = `${bv}^2*e^(${bv})/(e^(${bv}) - 1)^2`;
  // above T = θ_rot/0.04 the rotor is classical (C_rot/R = 1 to better than 0.1%)
  return `1.5 + step(${b} - 0.04)*${rot} + step(0.04 - ${b}) + ${vib}`;
}
