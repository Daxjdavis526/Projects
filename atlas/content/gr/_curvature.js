// Shared constants and picture builders for the Road's curvature-and-field-
// equation lessons in Intuition Mode (S14–S19, S28, S29). Every number a
// lesson prints is computed from these, so a printed value and its answer key
// cannot disagree. SI units unless a name says otherwise. Not a lesson: files
// starting with "_" are skipped by tools/register.mjs.

import { tex } from '../../src/core/format.js';

export const G = 6.674e-11;                // m³ kg⁻¹ s⁻²
export const C = 2.998e8;                  // m/s
export const M_SUN = 1.989e30;             // kg
export const GM_SUN = 1.327e20;            // m³/s² (as printed in prompts)
export const GM_EARTH = 3.986e14;          // m³/s²
export const R_EARTH = 6.371e6;            // m, mean radius
export const M_EARTH = 5.972e24;           // kg
export const GM_MOON = 4.905e12;           // m³/s²
export const D_MOON = 3.844e8;             // m, mean Earth–Moon distance (centre to centre)
export const AU = 1.496e11;                // m
export const R_SUN = 6.957e8;              // m
export const g0 = 9.81;                    // m/s²
export const LAMBDA = 1.1e-52;             // m⁻², measured cosmological constant (Planck 2018: 1.09e-52)
export const YEAR = 3.156e7;               // s
export const KAPPA = (8 * Math.PI * G) / C ** 4;   // N⁻¹, Einstein's coupling

/** A number as TeX with n significant figures (×10ⁿ when large or small). */
export const sci = (x, n = 3) => tex(x, n);
/** Rounded to n significant figures, as a number. */
export const round = (x, n = 3) => {
  if (!x) return x;
  const p = 10 ** (n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * p) / p;
};
/** Thousands separators that survive inside $…$ (KaTeX spaces a bare comma). */
export const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');
export const log = Math.log10;

/**
 * A still picture of the falling ball of dust (sim gr-dustball) with no
 * numbers and no controls: a question's setting, not its answer.
 */
export const ball = (params, caption) => ({
  type: 'gr-dustball',
  params: { play: false, readout: false, rSlider: false, rhoSlider: false, ...params },
  ...(caption ? { caption } : {}),
});

/**
 * The tidal field of a distant mass over a planet's surface: arrows of the
 * tide relative to the planet's centre, (2 cos θ, −sin θ) × GM R/d³, and the
 * stretched shape free oceans would take. The mass lies far off to the right.
 */
export function tidalField({ caption, label = 'Moon', ellipse = true } = {}) {
  const arrows = [];
  for (let k = 0; k < 12; k++) {
    const th = (k * Math.PI) / 6, x = Math.cos(th), y = Math.sin(th), s = 0.24;
    arrows.push({ from: [round(x, 4), round(y, 4)], to: [round(x + s * 2 * x, 4), round(y - s * y, 4)], color: 'warn' });
  }
  return {
    type: 'graph',
    params: {
      x: [-2.0, 2.6], y: [-1.45, 1.45], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 },
        ...(ellipse ? [{ param: ['1.17cos(t)', '0.855sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6, dash: true }] : []),
      ],
      arrows,
      points: [{ x: 1.6, y: 0.2, color: 'ink2', label: `${label} →`, r: 0.5 }, { x: 0, y: 0, color: 'teal', r: 3 }],
    },
    caption: caption ?? `The ${label}’s tide over the Earth: at each point, how the ${label}’s pull differs from its pull on Earth’s centre. Arrows hugely exaggerated, and the ${label} is far off to the right.${ellipse ? ' Dashed: the stretched shape oceans would take if they could follow the tide freely.' : ''}`,
  };
}

/**
 * The stress–energy tensor as a 4 × 4 table of coloured cells (rows and
 * columns t, x, y, z). `cells` is a 4 × 4 array of labels: '' for a zero
 * entry (drawn faint), a string for a non-zero one; `colors` optionally
 * colours non-zero cells ('gold' by default; 'bad' marks a negative entry).
 */
export function stressTable(cells, { caption, colors = null } = {}) {
  const shade = [], points = [];
  const names = ['t', 'x', 'y', 'z'];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = cells[r][c], on = v !== '' && v !== 0 && v !== '0';
      const col = (colors && colors[r][c]) || 'gold';
      shade.push({ fn: `${-r - 0.04}`, lower: `${-r - 0.96}`, from: c + 0.54, to: c + 1.46, color: on ? col : 'ink4', alpha: on ? 0.32 : 0.1 });
      // a point's label starts about 9 px right of it and sits 9 px above it: shift the (invisible) point so the label is centred
      const label = on ? String(v) : '0';
      points.push({ x: round(c + 0.9 - 0.035 * label.length, 4), y: -r - 0.6, r: 0.01, color: on ? 'ink' : 'ink3', label });
    }
    points.push({ x: 0.12, y: -r - 0.6, r: 0.01, color: 'ink3', label: names[r] });
    points.push({ x: r + 0.865, y: 0.08, r: 0.01, color: 'ink3', label: names[r] });
  }
  return {
    type: 'graph',
    params: { x: [0, 4.6], y: [-4.15, 0.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade, points },
    ...(caption ? { caption } : {}),
  };
}
