// Constants and picture builders for PHYS 2210 module M13 (gravitation).
// The constants agree with the Road to Einstein's first lessons (gr.S01.i,
// gr.S06.i) and with the Kepler-orbit model (src/viz/model/mech-kepler.js).
// Every visual is an ordinary `graph` (or `mech-kepler`) spec, so the content
// test validates it. Not a lesson: the leading underscore keeps it out of the registry.

import { GM_EARTH, GM_SUN, GM_MOON, R_EARTH, R_MOON, AU, DAY, YEAR, C } from '../../src/viz/model/mech-kepler.js';

export { GM_EARTH, GM_SUN, GM_MOON, R_EARTH, R_MOON, AU, DAY, YEAR, C };
export const G = 6.674e-11;                  // N·m²/kg², as quoted in prompts (CODATA: 6.674 30 × 10⁻¹¹)
export const M_EARTH = 5.972e24;             // kg
export const M_MOON = 7.342e22;              // kg
export const M_SUN = 1.989e30;               // kg
export const D_MOON = 3.844e8;               // m, mean Earth–Moon distance
export const T_MOON = 27.32 * DAY;           // s, sidereal month
export const g0 = 9.81;                      // m/s², measured surface gravity (with Earth's spin)
export const gN = GM_EARTH / R_EARTH ** 2;   // m/s², GM/R² for a round, non-spinning Earth (9.82)

const r4 = (v) => +(+v).toFixed(4);
/** A number with thousands separators, safe inside $…$ (KaTeX spaces a bare comma). */
export const grp = (x) => x.toLocaleString('en-US').replace(/,/g, '{,}');

/**
 * Two bodies, side by side, with the gravitational force on each drawn as an
 * arrow toward the other (equal lengths: Newton's third law). Options: names,
 * the drawn radii, and `accel: [aA, aB]` to draw acceleration arrows instead
 * (lengths proportional to the numbers given).
 */
export function twoBodies({ names = ['A', 'B'], radii = [0.55, 0.2], colors = ['teal', 'ink2'], gap = 4.4, accel, labels, caption }) {
  const xA = -gap / 2, xB = gap / 2, len = 1.1;
  const disk = (x, r, color) => {
    const s = `sqrt(max(0, ${r4(r * r)} - (x - ${r4(x)})^2))`;
    return { fn: s, lower: `-${s}`, from: r4(x - r), to: r4(x + r), color, alpha: 0.45 };
  };
  const [la, lb] = accel ? (() => { const m = Math.max(...accel); return accel.map((a) => (len * a) / m); })() : [len, len];
  const [ta, tb] = labels ?? (accel ? ['a_A', 'a_B'] : ['F', 'F']);
  return {
    type: 'graph',
    params: {
      x: [-3.6, 3.6], y: [-1.1, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'Two bodies attracting each other',
      shade: [disk(xA, radii[0], colors[0]), disk(xB, radii[1], colors[1])],
      arrows: [
        ...(la > 0.004 ? [{ from: [r4(xA + radii[0]), 0], to: [r4(xA + radii[0] + la), 0], color: 'bad', label: ta, labelDy: -12 }] : []),
        ...(lb > 0.004 ? [{ from: [r4(xB - radii[1]), 0], to: [r4(xB - radii[1] - lb), 0], color: 'bad', label: tb, labelDy: -12 }] : []),
      ],
      points: [{ x: r4(xA), y: r4(-radii[0] - 0.22), r: 0.01, color: colors[0], label: names[0], labelDx: -4 * names[0].length }, { x: r4(xB), y: r4(-radii[1] - 0.22), r: 0.01, color: 'ink2', label: names[1], labelDx: -4 * names[1].length }],
    },
    caption: caption ?? 'Each body pulls the other toward itself. Sizes and distances are not to scale.',
  };
}

/** g against distance from Earth's centre, in Earth radii: a uniform-density inside and 1/r² outside, with labelled marks. */
export function gProfile({ xmax = 7, marks = [], inside = true, caption, extra = {} } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0, xmax], y: [0, 11], xlabel: 'distance from Earth’s centre (Earth radii)', ylabel: 'g (m/s²)', aspect: 'wide',
      curves: [
        ...(inside ? [{ fn: `${r4(gN)}*x`, domain: [0, 1], color: 'ink3', width: 2, dash: true }] : []),
        { fn: `${r4(gN)}/x^2`, domain: [1, xmax], color: 'accent', width: 2.4 },
      ],
      vlines: [{ x: 1, label: 'surface', color: 'ink4' }],
      points: marks,
      ...extra,
    },
    caption: caption ?? 'Earth’s gravity against distance from its centre. Outside: GM/r². Inside (dashed): the uniform-density model, g ∝ r; the real Earth, with its dense core, differs there.',
  };
}

/** The potential-energy well U(r) = −GMm/r in units of GMm/R, against r/R, with optional energy lines. */
export function uWell({ xmax = 8, energies = [], points = [], caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0, xmax], y: [-1.15, 0.5], xlabel: 'r / R', ylabel: 'U in units of GMm/R', aspect: 'wide',
      curves: [{ fn: '-1/x', domain: [1, xmax], color: 'accent', width: 2.4 }],
      hlines: energies.map((e) => ({ y: e.E, label: e.label, color: e.color || 'gold' })),
      vlines: [{ x: 1, label: 'surface', color: 'ink4' }],
      points,
    },
    caption: caption ?? 'The gravitational potential energy U = −GMm/r outside a planet of radius R; zero is at infinite distance.',
  };
}

/**
 * Tidal arrows round the Earth (radius 1) from a mass at distance d Earth
 * radii to the right. view 'lab': each point's acceleration toward the mass
 * (in units of the pull at Earth's centre); view 'tidal': the same minus the
 * pull at the centre, exaggerated ×X.
 */
export function tidalArrows({ d = 60.3, view = 'tidal', X = 15, n = 12, caption, moonLabel = 'Moon' } = {}) {
  const arrows = [];
  for (let k = 0; k < n; k++) {
    const th = (2 * Math.PI * k) / n, c = Math.cos(th), s = Math.sin(th);
    const dx = d - c, dy = -s, q = (dx * dx + dy * dy) ** 1.5;
    const ax = (d * d * dx) / q, ay = (d * d * dy) / q;
    const [vx, vy] = view === 'lab' ? [ax, ay] : [X * (ax - 1), X * ay];
    arrows.push({ from: [r4(c), r4(s)], to: [r4(c + 0.6 * vx), r4(s + 0.6 * vy)], color: view === 'lab' ? 'gold' : 'bad' });
  }
  const mx = Math.min(d, 4.6);
  return {
    type: 'graph',
    params: {
      x: [-2.6, 5.2], y: [-1.9, 1.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'Arrows round the Earth showing a distant mass’s pull',
      shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'teal', alpha: 0.35 }],
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.6 }],
      arrows,
      points: [{ x: r4(mx), y: 0, color: 'ink2', r: 6, label: d > 4.6 ? `${moonLabel} (${Math.round(d)} Earth radii away) →` : moonLabel, labelDx: d > 4.6 ? -150 : 10, labelDy: d > 4.6 ? -16 : -10 }],
    },
    caption: caption ?? (view === 'lab' ? 'The pull on each part of the Earth (gold), in units of the pull at its centre. Arrows to scale; distances not.' : `What is left after subtracting the pull at Earth’s centre: the tidal stretch, exaggerated ${X}×.`),
  };
}

/** A static Kepler-orbit picture of a preset (no controls, no readout), drawn at fraction t of a period after periapsis. */
export const keplerPicture = (preset, { t = 0.12, sectors = 12, caption } = {}) => ({
  type: 'mech-kepler',
  params: { presets: [preset], readout: false, play: false, time: false, sweep: false, sectors, t },
  ...(caption ? { caption } : {}),
});
