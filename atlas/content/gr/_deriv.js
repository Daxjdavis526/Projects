// Shared constants and picture builders for the Road's Derivation-Mode
// lessons of steps 1–9 (gr.S01.d … gr.S09.d). Every number a lesson prints
// is computed from these, so a printed value and its answer key can never
// disagree. SI units unless a name says otherwise. Not a lesson: files
// starting with "_" are skipped by tools/register.mjs.

import { tex } from '../../src/core/format.js';

export const C = 299792458;              // m/s, exact
export const G = 6.6743e-11;             // m³ kg⁻¹ s⁻² (CODATA 2018)
export const GM_EARTH = 3.986004418e14;  // m³/s² (IERS)
export const R_EARTH = 6.371e6;          // m, mean radius
export const GM_SUN = 1.32712440018e20;  // m³/s² (IAU nominal)
export const R_SUN = 6.957e8;            // m (IAU nominal)
export const GM_MOON = 4.9048695e12;     // m³/s²
export const D_MOON = 3.844e8;           // m, mean Earth–Moon distance
export const AU = 1.495978707e11;        // m (exact)
export const LY = 9.4607304725808e15;    // m
export const DAY = 86400;                // s
export const YEAR = 365.25 * DAY;        // s (Julian year)
export const g0 = 9.81;                  // m/s², surface gravity used in prompts

// particle masses as rest energies, MeV (PDG 2024), and the muon lifetime
export const M_PI = 139.57039;           // π±
export const M_PI0 = 134.9768;           // π⁰
export const M_MU = 105.6583755;         // μ±
export const M_K = 493.677;              // K±
export const M_E = 0.51099895;           // e±
export const M_P = 938.27208816;         // proton
export const M_TAU = 1776.86;            // τ±
export const TAU_MU = 2.1969811e-6;      // s, muon mean lifetime at rest

/** A number as TeX with n significant figures (×10ⁿ when large or small). */
export const sci = (x, n = 3) => tex(x, n);
/** Rounded to n significant figures, as a number (for picture coordinates). */
export const round = (x, n = 4) => {
  if (!x) return x;
  const p = 10 ** (n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * p) / p;
};
/** Thousands separators that survive inside $…$ (KaTeX spaces a bare comma). */
export const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');

/**
 * A matrix (or a table of entries) drawn with the graph simulation. Entries
 * are canvas text — Unicode, not TeX. cells[i][j] is a string ('' leaves the
 * cell empty); colors[i][j] its colour. rowLabels and colLabels name the
 * index values; brackets draws the matrix brackets; left is a label set
 * before the left bracket (“Λ =”).
 */
export function matrix(cells, { colors, rowLabels, colLabels, caption, left, w = 1.3, h = 0.7, brackets = true, alt } = {}) {
  const n = cells.length, m = cells[0].length;
  const points = [], curves = [];
  const at = (x, y, label, color, align = 'center') => points.push({ x: round(x), y: round(y), r: 0.01, color, label, labelDx: 0, labelDy: 0, labelAlign: align });
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const s = cells[i][j];
      if (s !== '' && s != null) at((j + 0.5) * w, -(i + 0.5) * h, String(s), colors?.[i]?.[j] || 'ink');
    }
  }
  if (rowLabels) rowLabels.forEach((s, i) => at(-0.22, -(i + 0.5) * h, s, 'ink3', 'right'));
  if (colLabels) colLabels.forEach((s, j) => at((j + 0.5) * w, 0.42, s, 'ink3'));
  if (left) at(rowLabels ? -0.95 : -0.2, -(n * h) / 2, left, 'ink', 'right');
  if (brackets) {
    const top = 0.06, bot = round(-n * h - 0.06), k = 0.13;
    for (const [x, d] of [[0.03, k], [round(m * w - 0.03), -k]]) {
      curves.push({ param: [`${x}`, `${bot} + ${round(top - bot)}*t`], t: [0, 1], color: 'ink2', width: 1.6 });
      curves.push({ param: [`${x} + ${d}*t`, `${top}`], t: [0, 1], color: 'ink2', width: 1.6 });
      curves.push({ param: [`${x} + ${d}*t`, `${bot}`], t: [0, 1], color: 'ink2', width: 1.6 });
    }
  }
  const x0 = left ? (rowLabels ? -2.3 : -1.6) : rowLabels ? -1.1 : -0.5;
  return {
    type: 'graph',
    params: {
      x: [x0, round(m * w + 0.45)], y: [round(-n * h - 0.35), colLabels ? 0.8 : 0.4], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves, points, ...(alt ? { alt } : {}),
    },
    ...(caption ? { caption } : {}),
  };
}
