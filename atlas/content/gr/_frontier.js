// Shared constants and helpers for the Intuition-Mode lessons at the far end
// of the Road (S26–S37): spinning black holes, waves, cosmology, numerical
// relativity, energy conditions, exotic solutions, wormholes, warp drives and
// the open questions. Every number a lesson prints is computed from these, so
// a printed value and its answer key can never disagree. SI units unless a
// name says otherwise. Not a lesson: files starting with "_" are skipped by
// tools/register.mjs.

import { G, C, M_SUN, AU, PC, LY, YEAR, DAY, rs, mLen, sci, round } from './_fasttrack.js';

export { G, C, M_SUN, AU, PC, LY, YEAR, DAY, rs, mLen, sci, round };

export const HBAR = 1.054571817e-34;       // J s (CODATA: h/2π, exact)
export const KB = 1.380649e-23;            // J/K (exact)
export const M_PROTON = 1.67262192e-27;    // kg (CODATA 2018)
export const M_JUP = 1.898e27;             // kg
export const M_EARTH = 5.972e24;           // kg
export const MPC = 1e6 * PC;               // m
export const GYR = 1e9 * YEAR;             // s
export const T_SUN = (G * M_SUN) / C ** 3; // GM☉/c³, s (4.93 μs)
export const GEV = 1.602176634e-10;        // J

/** A number as plain text with n significant figures and a ×10ⁿ when large or small (for canvas labels). */
export function plain(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -3 && e < 5) return String(+x.toPrecision(n)).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const m = +(x / 10 ** e).toPrecision(n);
  return `${m}×10${String(e).replace(/./g, (ch) => SUP[ch])}`;
}

// ─── Kerr black holes, in units of M = GM/c² (spin a = χM, 0 ≤ χ ≤ 1) ─────────
const Z1 = (a) => 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
const Z2 = (a) => Math.sqrt(3 * a * a + Z1(a) ** 2);
export const kerr = {
  /** Outer (event) horizon, Boyer–Lindquist r. */
  rPlus: (a) => 1 + Math.sqrt(1 - a * a),
  /** Inner horizon. */
  rMinus: (a) => 1 - Math.sqrt(1 - a * a),
  /** Edge of the ergosphere at angle th (rad) from the spin axis. */
  rErgo: (a, th) => 1 + Math.sqrt(1 - a * a * Math.cos(th) ** 2),
  /** Innermost stable circular orbit (Bardeen, Press & Teukolsky 1972), co-rotating (pro) or counter-rotating. */
  isco: (a, pro = true) => 3 + Z2(a) + (pro ? -1 : 1) * Math.sqrt((3 - Z1(a)) * (3 + Z1(a) + 2 * Z2(a))),
  /** Energy per unit rest energy of a circular orbit at the ISCO radius r: √(1 − 2/(3r)). */
  eIsco: (r) => Math.sqrt(1 - 2 / (3 * r)),
  /** Fraction of rest energy radiated by gas spiralling in through a thin disk to the ISCO. */
  efficiency: (a, pro = true) => 1 - Math.sqrt(1 - 2 / (3 * kerr.isco(a, pro))),
  /** Angular velocity of the horizon, in units of c³/(GM). */
  omegaH: (a) => a / (2 * (1 + Math.sqrt(1 - a * a))),
  /** Irreducible mass as a fraction of M: what is left after all rotational energy is extracted. */
  mIrr: (a) => Math.sqrt((1 + Math.sqrt(1 - a * a)) / 2),
};

/** The same Kerr formulas as Atlas expression strings of a spin variable v (for graph visuals). */
const z1 = (v) => `(1 + cbrt(1 - ${v}^2)*(cbrt(1 + ${v}) + cbrt(1 - ${v})))`;
const z2 = (v) => `sqrt(3*${v}^2 + ${z1(v)}^2)`;
export const kerrExpr = {
  rPlus: (v) => `(1 + sqrt(1 - ${v}^2))`,
  rMinus: (v) => `(1 - sqrt(1 - ${v}^2))`,
  isco: (v, pro = true) => `(3 + ${z2(v)} ${pro ? '-' : '+'} sqrt((3 - ${z1(v)})*(3 + ${z1(v)} + 2*${z2(v)})))`,
  efficiency: (v, pro = true) => `(1 - sqrt(1 - 2/(3*${kerrExpr.isco(v, pro)})))`,
};

/**
 * A dot plot on a logarithmic axis: one row per item, so labels never
 * collide. items: [[label, value, color?], …] (values > 0). The x axis is
 * log₁₀ of the value; vlines: [[value, label]] marks reference values.
 */
const SUPS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const pow10 = (k) => `10${String(k).replace(/./g, (ch) => SUPS[ch])}`;

export function logDots(items, { xlabel, caption, range, vlines = [], every } = {}) {
  const xs = items.map(([, v]) => Math.log10(v));
  const lo = range ? range[0] : Math.floor(Math.min(...xs)) - 1, hi = range ? range[1] : Math.ceil(Math.max(...xs)) + 3;
  const n = items.length, step = every || Math.max(1, Math.ceil((hi - lo) / 8));
  const decades = [];
  for (let k = Math.ceil(lo / step) * step; k <= hi; k += step) decades.push(k);
  return {
    type: 'graph',
    params: {
      x: [lo, hi], y: [-1.1, n + 0.1], axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        ...decades.map((k) => ({ param: [`${k}`, 't'], t: [-0.55, n - 0.45], color: 'ink4', width: 0.8 })),
        ...items.map((_, k) => ({ fn: `${k}`, color: 'ink4', width: 1, dash: true, domain: [lo, round(xs[k], 6)] })),
      ],
      points: [
        ...items.map(([label, v, color], k) => ({ x: round(Math.log10(v), 6), y: k, color: color || 'accent', label })),
        ...decades.map((k) => ({ x: k, y: -0.75, r: 0.5, color: 'ink3', label: pow10(k) })),
        ...(xlabel ? [{ x: lo, y: n - 0.15, r: 0.5, color: 'ink2', label: xlabel }] : []),
      ],
      vlines: vlines.map(([v, label, color]) => ({ x: round(Math.log10(v), 6), label, color: color || 'bad' })),
    },
    caption,
  };
}
