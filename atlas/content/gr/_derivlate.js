// Shared constants and picture builders for the Road's last ten Derivation-
// Mode lessons (gr.S28.d … gr.S37.d): linearized gravity, the field equations
// as PDEs, FLRW and Friedmann, the 3+1 split, energy conditions, exotic
// solutions, wormholes, warp drives and the open questions. Every symbolic
// result these lessons state was checked with SymPy, and every number a
// lesson prints is computed here or in the lesson, so a printed value and its
// answer key cannot disagree. SI units unless a name says otherwise. Not a
// lesson: files starting with "_" are skipped by tools/register.mjs.

import { tex } from '../../src/core/format.js';

const t = String.raw;

export const C = 299792458;                 // m/s, exact
export const G = 6.6743e-11;                // m³ kg⁻¹ s⁻² (CODATA 2018)
export const HBAR = 1.054571817e-34;        // J s (CODATA, exact)
export const KB = 1.380649e-23;             // J/K (exact)
export const GM_SUN = 1.32712440018e20;     // m³/s² (IAU)
export const GM_EARTH = 3.986004418e14;     // m³/s² (IERS)
export const M_SUN = GM_SUN / G;            // 1.988 × 10³⁰ kg
export const R_EARTH = 6.371e6;             // m, mean radius
export const R_SUN = 6.957e8;               // m (IAU nominal)
export const AU = 1.495978707e11;           // m, exact
export const PC = 3.0856775814913673e16;    // m
export const MPC = 1e6 * PC;                // m
export const LY = 9.4607304725808e15;       // m
export const YEAR = 365.25 * 86400;         // s (Julian year)
export const GYR = 1e9 * YEAR;              // s
export const M_PROTON = 1.67262192e-27;     // kg
export const KAPPA = (8 * Math.PI * G) / C ** 4;   // N⁻¹, Einstein's coupling
export const L_PLANCK = Math.sqrt((HBAR * G) / C ** 3);   // m

/** A number as TeX with n significant figures (×10ⁿ when large or small). */
export const sci = (x, n = 3) => tex(x, n);
/** Rounded to n significant figures, as a number (for picture coordinates). */
export const round = (x, n = 4) => {
  if (!x) return x;
  const p = 10 ** (n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * p) / p;
};

/** A number as plain text with n significant figures and a ×10ⁿ when large or small (canvas labels). */
export function plain(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e >= -3 && e < 5) return String(+x.toPrecision(n));
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  return `${+(x / 10 ** e).toPrecision(n)}×10${String(e).replace(/./g, (ch) => SUP[ch])}`;
}

/**
 * A 4 × 4 (or n × m) array of entries drawn with the graph simulation, with
 * brackets. cells[i][j] is canvas text (Unicode, not TeX); '' leaves a cell
 * empty and '0' prints faint. rowLabels / colLabels name the index values.
 */
export function grid4(cells, { colors, rowLabels = ['t', 'x', 'y', 'z'], colLabels = ['t', 'x', 'y', 'z'], caption, w = 1.35, h = 0.66, left } = {}) {
  const n = cells.length, m = cells[0].length;
  const points = [], curves = [];
  const at = (x, y, label, color, align = 'center') => points.push({ x: round(x), y: round(y), r: 0.01, color, label, labelDx: 0, labelDy: 0, labelAlign: align });
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const s = cells[i][j];
      if (s === '' || s == null) continue;
      at((j + 0.5) * w, -(i + 0.5) * h, String(s), s === '0' ? 'ink4' : colors?.[i]?.[j] || 'ink');
    }
  }
  rowLabels?.forEach((s, i) => at(-0.25, -(i + 0.5) * h, s, 'ink3', 'right'));
  colLabels?.forEach((s, j) => at((j + 0.5) * w, 0.38, s, 'ink3'));
  if (left) at(-0.95, -(n * h) / 2, left, 'ink', 'right');
  const top = 0.06, bot = round(-n * h - 0.06), k = 0.13;
  for (const [x, d] of [[0.03, k], [round(m * w - 0.03), -k]]) {
    curves.push({ param: [`${x}`, `${bot} + ${round(top - bot)}*t`], t: [0, 1], color: 'ink2', width: 1.6 });
    curves.push({ param: [`${x} + ${d}*t`, `${top}`], t: [0, 1], color: 'ink2', width: 1.6 });
    curves.push({ param: [`${x} + ${d}*t`, `${bot}`], t: [0, 1], color: 'ink2', width: 1.6 });
  }
  return {
    type: 'graph',
    params: {
      x: [left ? -2.4 : -1.0, round(m * w + 0.45)], y: [round(-n * h - 0.3), 0.75], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves, points,
    },
    ...(caption ? { caption } : {}),
  };
}

/** A small table of text rows drawn with the graph sim: [[left, right], …] (canvas text). */
export function rows(list, { caption, split = 0.5, width = 10, colors = [] } = {}) {
  const n = list.length;
  return {
    type: 'graph',
    params: {
      x: [0, width], y: [-n - 0.15, 0.35], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      points: list.flatMap(([a, b], k) => [
        { x: 0.15, y: -k - 0.5, r: 0.01, color: colors[k] || 'ink2', label: a, labelDx: 0, labelDy: 0 },
        ...(b ? [{ x: round(width * split, 4), y: -k - 0.5, r: 0.01, color: colors[k] || 'ink', label: b, labelDx: 0, labelDy: 0 }] : []),
      ]),
    },
    ...(caption ? { caption } : {}),
  };
}

export { t };
