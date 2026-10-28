// Shared helpers for PHYS 4600 modules M5 and M6 (radiation and relativistic
// electrodynamics): CODATA 2022 constants (re-exported from the course's
// _em4b.js), radiated powers (electric and magnetic dipoles, Larmor, Liénard),
// synchrotron loss per turn, the Abraham–Lorentz time, radiation resistances
// (from model/em4c-dipole.js), the field tensor and its boosts (from
// model/em4c-fields.js), and builders for static pictures: the em4c-dipole
// and em4c-boost simulations without controls, a radiation-pattern polar
// plot, and a 4×4 tensor drawn as a table. Files whose names start with "_"
// are helpers, not lessons.

import { MU0, EPS0, C, QE, ME, PI, Z0 } from './_em4b.js';
import { radResistance } from '../../src/viz/model/em4c-dipole.js';

export { MU0, EPS0, C, QE, ME, PI, DEG, sf, tag, Z0 } from './_em4b.js';
export { Fup, Gup, lower, mixed, Lambda, boostTensor, boostFields, fieldsOf, invariants, stressEnergy, energyFlux, contract, gamma } from '../../src/viz/model/em4c-fields.js';
export { pattern, beltFraction } from '../../src/viz/model/em4c-dipole.js';

/** Proton mass, kg (CODATA 2022). */
export const MP = 1.67262192595e-27;
/** Rest energies in GeV, from the CODATA masses. */
export const MEC2 = (ME * C * C) / QE / 1e9;     // 0.000510999 GeV
export const MPC2 = (MP * C * C) / QE / 1e9;     // 0.938272 GeV

/** Time-averaged power (W) of an electric dipole p₀ cos ωt: μ₀p₀²ω⁴/12πc. */
export const dipoleP = (p0, w) => (MU0 * p0 * p0 * w ** 4) / (12 * PI * C);
/** Time-averaged power (W) of a magnetic dipole m₀ cos ωt: μ₀m₀²ω⁴/12πc³. */
export const magP = (m0, w) => (MU0 * m0 * m0 * w ** 4) / (12 * PI * C ** 3);
/** Larmor power (W) of a slow charge q with acceleration a: μ₀q²a²/6πc. */
export const larmor = (q, a) => (MU0 * q * q * a * a) / (6 * PI * C);
/** Liénard power for circular motion (a ⟂ v): μ₀q²a²γ⁴/6πc. */
export const lienardCirc = (q, a, g) => larmor(q, a) * g ** 4;
/** Liénard power for straight-line acceleration (a ∥ v): μ₀q²a²γ⁶/6πc. */
export const lienardLin = (q, a, g) => larmor(q, a) * g ** 6;

/** Energy (eV) a charge e of energy E (GeV) and rest energy m (GeV) radiates per turn on a bend of radius rho (m): e²β³γ⁴/3ε₀ρ. */
export function lossPerTurn(E, m, rho) {
  const g = E / m, b = Math.sqrt(1 - 1 / (g * g));
  return ((QE * QE) / (3 * EPS0 * rho)) * b ** 3 * g ** 4 / QE;
}

/** The Abraham–Lorentz time τ = μ₀q²/6πmc (s): 6.27 × 10⁻²⁴ s for an electron. */
export const tauAL = (q = QE, m = ME) => (MU0 * q * q) / (6 * PI * m * C);

/** Radiation resistance (Ω): a half-wave antenna (73.08 Ω), or a short one of length d (Griffiths: 789 (d/λ)²). */
export const R_HALF = radResistance('half', Z0);
export const rShort = (dOverLambda) => radResistance('short', Z0, dOverLambda);

// ── pictures ──

const r4 = (v) => +(+v).toPrecision(4);

/** An em4c-dipole still with no controls or readouts. */
export const dipolePic = (params, caption) => ({ type: 'em4c-dipole', params: { controls: false, readout: false, play: false, ...params }, caption });

/** An em4c-boost still with no controls or readouts. */
export const boostPic = (params, caption) => ({ type: 'em4c-boost', params: { controls: false, readout: false, ...params }, caption });

/**
 * A radiation pattern as a polar plot about a vertical axis (graph): the curve
 * fn(t) (an expression of the polar angle t from the axis; default sin²t),
 * optional rays at angles (degrees) from the axis, each { deg, label, color },
 * and an optional second curve. The source sits at the centre.
 */
export function patternPic(caption, { fn = 'sin(t)^2', rays = [], second = null, curve = true, labels = [], axisLabel = 'axis' } = {}) {
  const curves = [{ param: ['0', 't'], t: [-1.15, 1.15], color: 'ink4', width: 1, dash: [3, 4] }];
  if (curve) curves.push({ param: [`(${fn})*sin(t)`, `(${fn})*cos(t)`], t: [0, 6.2832], color: 'gold', width: 2.6 });
  if (second) curves.push({ param: [`(${second.fn})*sin(t)`, `(${second.fn})*cos(t)`], t: [0, 6.2832], color: second.color || 'accent', width: 2.2, dash: second.dash || [6, 4] });
  curves.push({ param: ['0', 't'], t: [-0.09, 0.09], color: 'ink2', width: 3 });
  const arrows = rays.map((r) => {
    const a = (r.deg * PI) / 180, L = r.len ?? 1.12;
    return { from: [0, 0], to: [r4(L * Math.sin(a)), r4(L * Math.cos(a))], color: r.color || 'accent', width: 2, ...(r.label ? { label: r.label } : {}) };
  });
  return {
    type: 'graph',
    params: {
      x: [-1.35, 1.35], y: [-1.2, 1.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves, arrows,
      points: [{ x: 0, y: 1.12, r: 0, label: axisLabel, color: 'ink3', labelDx: 6, labelDy: 0 }, ...labels],
    },
    caption,
  };
}

/**
 * A 4×4 tensor drawn as a table (graph): cells[r][c] are plain-text entries
 * ('' or 0 for an empty cell), colors[r][c] optional shading colours, rows
 * and columns labelled 0–3 (or by `names`).
 */
export function tensorTable(cells, { caption, colors = null, names = ['0', '1', '2', '3'], hide = [] } = {}) {
  const shade = [], points = [];
  const hidden = new Set(hide.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = cells[r][c], on = v !== '' && v !== 0 && v !== '0', q = hidden.has(`${r},${c}`);
      const col = (colors && colors[r][c]) || 'gold';
      shade.push({ fn: `${-r - 0.04}`, lower: `${-r - 0.96}`, from: c + 0.54, to: c + 1.46, color: q ? 'accent' : on ? col : 'ink4', alpha: q ? 0.25 : on ? 0.3 : 0.1 });
      points.push({ x: c + 1, y: r4(-r - 0.5), r: 0, color: q ? 'accent' : on ? 'ink' : 'ink3', label: q ? '?' : on ? String(v) : '0', labelAlign: 'center', labelDx: 0, labelDy: 0 });
    }
    points.push({ x: 0.25, y: r4(-r - 0.5), r: 0, color: 'ink3', label: names[r], labelAlign: 'center', labelDx: 0, labelDy: 0 });
    points.push({ x: r + 1, y: 0.2, r: 0, color: 'ink3', label: names[r], labelAlign: 'center', labelDx: 0, labelDy: 0 });
  }
  return {
    type: 'graph',
    params: { x: [-0.1, 4.6], y: [-4.15, 0.45], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, shade, points },
    ...(caption ? { caption } : {}),
  };
}

/** Plain-text labels for F^{μν} (contravariant, −+++, F^{0i} = E_i/c). */
export const F_CELLS = [
  ['', 'Ex/c', 'Ey/c', 'Ez/c'],
  ['−Ex/c', '', 'Bz', '−By'],
  ['−Ey/c', '−Bz', '', 'Bx'],
  ['−Ez/c', 'By', '−Bx', ''],
];
/** Colours for F: electric entries gold, magnetic entries teal. */
export const F_COLORS = [
  ['', 'gold', 'gold', 'gold'],
  ['gold', '', 'teal', 'teal'],
  ['gold', 'teal', '', 'teal'],
  ['gold', 'teal', 'teal', ''],
];
