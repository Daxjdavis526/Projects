// Shared constants and picture builders for the Road's Derivation-Mode
// lessons on the classic tests and black holes (gr.S20.d … gr.S27.d).
// Geometric units (G = c = 1) inside the lessons; every number a lesson
// prints is computed from these, so a printed value and its answer key can
// never disagree. Every symbolic result these lessons state was checked with
// SymPy (Christoffels and Ricci of the static ansatz, R_μν = 0, Kretschmann
// 48M²/r⁶, the orbit equations, Eddington–Finkelstein and Kruskal forms, the
// Kerr surfaces and ISCO energies, the quadrupole chirp). Not a lesson: files
// starting with "_" are skipped by tools/register.mjs.

import { tex } from '../../src/core/format.js';

export const C = 299792458;                 // m/s, exact
export const G = 6.6743e-11;                // m³ kg⁻¹ s⁻² (CODATA 2018)
export const GM_SUN = 1.32712440018e20;     // m³/s² (IAU)
export const GM_EARTH = 3.986004418e14;     // m³/s² (IERS)
export const M_SUN_KG = 1.98841e30;         // kg (GM☉/G)
export const R_SUN = 6.957e8;               // m (IAU nominal)
export const R_EARTH = 6.371e6;             // m, mean radius
export const AU = 1.495978707e11;           // m, exact
export const PC = 3.0856775814913673e16;    // m
export const DAY = 86400;                   // s
export const YEAR = 365.25 * DAY;           // s (Julian year)
export const ARCSEC = Math.PI / 648000;      // rad
export const LAMBDA = 1.1e-52;              // m⁻², the measured cosmological constant (Planck 2018: 1.09e-52)

/** The Sun's and the Earth's masses as lengths, GM/c² (m), and the Sun's as a time, GM/c³ (s). */
export const M_SUN = GM_SUN / C ** 2;       // 1476.6 m
export const M_EARTH = GM_EARTH / C ** 2;   // 4.435 mm
export const T_SUN = GM_SUN / C ** 3;       // 4.9255 μs

/** A number as TeX with n significant figures (×10ⁿ when large or small). */
export const sci = (x, n = 3) => tex(x, n);
/** Rounded to n significant figures, as a number (for picture coordinates). */
export const round = (x, n = 4) => {
  if (!x) return x;
  const p = 10 ** (n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * p) / p;
};

// ─── Schwarzschild, G = c = 1, r in units of M ──────────────────────────────
/** Circular geodesic orbits: L², E and the coordinate angular velocity (exactly Kepler's). */
export const circ = {
  L2: (r) => (r * r) / (r - 3),
  E: (r) => (1 - 2 / r) / Math.sqrt(1 - 3 / r),
  Omega: (r) => Math.sqrt(1 / r ** 3),
};
/** Tortoise coordinate r* = r + 2M ln|r/2M − 1| (M = 1). */
export const tortoise = (r) => r + 2 * Math.log(Math.abs(r / 2 - 1));

/** Exact deflection of light with impact parameter b (units of M): integrate u'' + u = 3u² from u = 0, u' = 1/b until u returns to 0 (RK4). */
export function deflection(b, steps = 40000) {
  const f = (u, w) => [w, -u + 3 * u * u];
  let u = 0, w = 1 / b, phi = 0;
  const h = (2 * Math.PI) / steps;
  for (let i = 0; i < 4 * steps; i++) {
    const k1 = f(u, w), k2 = f(u + (h / 2) * k1[0], w + (h / 2) * k1[1]);
    const k3 = f(u + (h / 2) * k2[0], w + (h / 2) * k2[1]), k4 = f(u + h * k3[0], w + h * k3[1]);
    const un = u + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    const wn = w + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (i > 10 && un <= 0) return phi + h * (u / (u - un)) - Math.PI;   // linear interpolation of the zero
    u = un; w = wn; phi += h;
  }
  return NaN;                                                            // captured: b below 3√3
}

/**
 * The metric drawn as a 4 × 4 table of entries with the graph simulation:
 * cells[i][j] is canvas text (Unicode, not TeX), '' for a zero entry
 * (drawn faint as 0). colors[i][j] optionally colours an entry.
 */
export function metricTable(cells, { colors, labels = ['t', 'r', 'θ', 'φ'], caption, w = 1.55, h = 0.62 } = {}) {
  const points = [], curves = [];
  const at = (x, y, label, color) => points.push({ x: round(x), y: round(y), r: 0.01, color, label, labelDx: 0, labelDy: 0, labelAlign: 'center' });
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const s = cells[i][j];
      at((j + 0.5) * w, -(i + 0.5) * h, s === '' ? '0' : s, s === '' ? 'ink4' : colors?.[i]?.[j] || 'ink');
    }
    at(-0.3, -(i + 0.5) * h, labels[i], 'ink3');
    at((i + 0.5) * w, 0.36, labels[i], 'ink3');
  }
  const top = 0.06, bot = round(-4 * h - 0.06), k = 0.14;
  for (const [x, d] of [[0.03, k], [round(4 * w - 0.03), -k]]) {
    curves.push({ param: [`${x}`, `${bot} + ${round(top - bot)}*t`], t: [0, 1], color: 'ink2', width: 1.6 });
    curves.push({ param: [`${x} + ${d}*t`, `${top}`], t: [0, 1], color: 'ink2', width: 1.6 });
    curves.push({ param: [`${x} + ${d}*t`, `${bot}`], t: [0, 1], color: 'ink2', width: 1.6 });
  }
  return {
    type: 'graph',
    params: { x: [-0.9, round(4 * w + 0.5)], y: [round(-4 * h - 0.35), 0.75], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    ...(caption ? { caption } : {}),
  };
}
