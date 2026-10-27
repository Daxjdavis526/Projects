// Shared constants and picture builders for the Road's equation dissections
// (gr.EQ.2 – gr.EQ.14). Every number a dissection prints is computed from
// these, so a printed value and its answer key cannot disagree. SI units
// unless a name says otherwise. Not a lesson: files starting with "_" are
// skipped by tools/register.mjs.

import { G, C, M_SUN, YEAR, PC, round } from './_fasttrack.js';

export { G, C, M_SUN, M_EARTH, R_EARTH, R_SUN, AU, LY, PC, YEAR, DAY, ARCSEC, rs, mLen, sci, round } from './_fasttrack.js';

export const GM_EARTH = 3.986e14;            // m³/s²
export const GM_SUN = 1.327e20;              // m³/s²
export const MPC = 1e6 * PC;                 // m
export const GYR = 1e9 * YEAR;               // s
export const H0 = 67.4;                      // km/s/Mpc, Planck 2018
export const OM = 0.315, OL = 0.685;         // Planck 2018 matter and Λ density parameters (flat)
export const LAMBDA = 1.1e-52;               // m⁻², the measured cosmological constant
export const M_P = 1.6726e-27;               // proton mass, kg
export const log = Math.log10;

/** H₀ in s⁻¹ from km/s/Mpc. */
export const hubble = (h0 = H0) => (h0 * 1e3) / MPC;
/** Critical density 3H²/(8πG), kg/m³. */
export const rhoCrit = (h0 = H0) => (3 * hubble(h0) ** 2) / (8 * Math.PI * G);

/**
 * Flat matter + Λ universe (radiation neglected), with the scale factor
 * normalised to a = 1 today: a(t) = (Ωm/ΩΛ)^{1/3} sinh^{2/3}(3/2 √ΩΛ H₀ t),
 * an exact solution of the Friedmann equation for that content.
 */
export const lcdm = {
  age: (om = OM, ol = OL, h0 = H0) => (2 / (3 * hubble(h0) * Math.sqrt(ol))) * Math.asinh(Math.sqrt(ol / om)),
  a: (t, om = OM, ol = OL, h0 = H0) => Math.cbrt(om / ol) * Math.sinh(1.5 * Math.sqrt(ol) * hubble(h0) * t) ** (2 / 3),
  /** the same as a graph expression of x = time in Gyr */
  expr: (om = OM, ol = OL, h0 = H0) => `${round(Math.cbrt(om / ol), 6)}*sinh(${round(1.5 * Math.sqrt(ol) * hubble(h0) * GYR, 6)}*x)^(2/3)`,
};
/** Matter only (Einstein–de Sitter): a = (t/t₀)^{2/3} with t₀ = 2/(3H₀). */
export const eds = {
  age: (h0 = H0) => 2 / (3 * hubble(h0)),
  expr: (h0 = H0) => `(x/${round(2 / (3 * hubble(h0)) / GYR, 6)})^(2/3)`,
};

/** Kerr, G = c = 1, lengths in units of M; chi = a/M. */
export const kerr = {
  rPlus: (chi) => 1 + Math.sqrt(1 - chi * chi),
  rMinus: (chi) => 1 - Math.sqrt(1 - chi * chi),
  ergo: (chi, th) => 1 + Math.sqrt(1 - chi * chi * Math.cos(th) ** 2),
  /** horizon angular velocity, in units of c³/(GM) */
  omegaH: (chi) => chi / (2 * (1 + Math.sqrt(1 - chi * chi))),
};

/**
 * A 4×4 table drawn with the graph simulation: cells[i][j] is the text in
 * row i, column j (canvas text, so Unicode, not TeX); colors[i][j] its colour.
 * rows/cols label the index values down the side and along the top.
 */
export function table4({ cells, colors, rowName = 'μ', colName = 'ν', rowLabels, colLabels, caption, dx = -12 }) {
  const curves = [];
  for (let k = 0; k <= 4; k++) {
    curves.push({ param: [`${k}`, '4*t'], t: [0, 1], color: 'ink4', width: 1.2 });
    curves.push({ param: ['4*t', `${k}`], t: [0, 1], color: 'ink4', width: 1.2 });
  }
  const points = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (cells[i][j]) points.push({ x: j + 0.5, y: 3.5 - i, r: 0.01, color: colors?.[i]?.[j] || 'ink', label: cells[i][j], labelDx: dx, labelDy: 0 });
    }
    points.push({ x: -0.45, y: 3.5 - i, r: 0.01, color: 'ink3', label: rowLabels ? rowLabels[i] : `${rowName}=${i}`, labelDx: -14, labelDy: 0 });
    points.push({ x: i + 0.5, y: 4.3, r: 0.01, color: 'ink3', label: colLabels ? colLabels[i] : `${colName}=${i}`, labelDx: -16, labelDy: 0 });
  }
  return {
    type: 'graph',
    params: { x: [-1.2, 4.3], y: [-0.2, 4.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    ...(caption ? { caption } : {}),
  };
}

/**
 * A planet (the circle) with arrows of the free-fall acceleration around it,
 * −c²Γⁱ₀₀ = −∇Φ: inward, shrinking as 1/r². Lengths to scale with each other.
 */
export function fallField({ caption, label = 'planet' } = {}) {
  const arrows = [];
  for (const R of [1.6, 2.25, 2.95]) {
    for (let k = 0; k < 8; k++) {
      const th = (k * Math.PI) / 4 + (R > 2 && R < 2.5 ? Math.PI / 8 : 0), L = 0.9 / (R * R);
      arrows.push({ from: [round(R * Math.cos(th), 4), round(R * Math.sin(th), 4)], to: [round((R - L) * Math.cos(th), 4), round((R - L) * Math.sin(th), 4)], color: 'warn' });
    }
  }
  return {
    type: 'graph',
    params: {
      x: [-5.2, 5.2], y: [-3.15, 3.15], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.6 }],
      arrows,
      points: [{ x: 0, y: 0, r: 0.01, color: 'teal', label, labelDx: -20, labelDy: 0 }],
    },
    caption: caption ?? 'Arrows: the acceleration the geodesic equation gives a body momentarily at rest, $-c^2\\Gamma^i{}_{00}$ — Newton’s $g$, pointing inward and falling off as $1/r^2$. Arrow lengths are to scale with one another; the circle is the surface.',
  };
}

/** A still picture of the falling ball of dust (sim gr-dustball) with no numbers and no controls. */
export const dustBall = (params, caption) => ({
  type: 'gr-dustball',
  params: { play: false, readout: false, rSlider: false, rhoSlider: false, ...params },
  ...(caption ? { caption } : {}),
});
