// Picture builders and constants for the PHYS 2220 charge lessons (module E1:
// charge, conductors and insulators, Coulomb's law, superposition). They
// return ordinary visual specs for the em-coulomb and em-induction
// simulations, or plain graphs, so the content test validates them like any
// other visual. Not a lesson: the leading underscore keeps it out of the registry.
//
// Answers use the same rounded constants the prompts give (k = 8.99×10⁹ N·m²/C²,
// e = 1.602×10⁻¹⁹ C), so a learner who uses them lands on the key.

import { fmt } from '../../src/core/format.js';
export { tn } from '../phys2210/_fluids.js';

export const K = 8.99e9;             // N·m²/C², as the prompts give it
export const QE = 1.602e-19;         // C
export const ME = 9.109e-31;         // kg
export const MP = 1.673e-27;         // kg
export const G = 6.674e-11;          // N·m²/kg²
export const s3 = (x, n = 3) => fmt(x, n);
export const r6 = (v) => +(+v).toPrecision(6);
/** A value with floating-point noise near zero removed. */
export const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x);

/** Identical metal spheres on stands with charges q (nC), from the em-induction share scene. */
export const spheres = (q, caption, extra = {}) => ({ type: 'em-induction', params: { scene: 'share', q, controls: false, readout: false, ...extra }, ...(caption ? { caption } : {}) });
/** A charged ball near a neutral sphere (em-induction ball scene), static. */
export const ballNear = (params, caption) => ({ type: 'em-induction', params: { scene: 'ball', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });
/** Two charges on a line with their forces (em-coulomb pair mode), static. */
export const pairPic = (params, caption) => ({ type: 'em-coulomb', params: { mode: 'pair', static: true, readout: false, ...params }, ...(caption ? { caption } : {}) });
/** Point charges in a plane with the forces on one of them (em-coulomb free mode), static. */
export const chargesPic = (params, caption) => ({ type: 'em-coulomb', params: { mode: 'free', static: true, readout: false, sliders: false, ...params }, ...(caption ? { caption } : {}) });

const seg = (a, b, { color = 'ink2', width = 2, dash = false } = {}) => ({
  param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width, dash,
});
const ring = (cx, cy, rx, ry, color, width = 2) => ({ param: [`${r6(cx)} + ${r6(rx)}*cos(t)`, `${r6(cy)} + ${r6(ry)}*sin(t)`], t: [0, 6.2832], color, width });
const mark = (x, y, sign) => ({ x: r6(x), y: r6(y), r: 0.01, color: sign > 0 ? 'bad' : 'accent', label: sign > 0 ? '+' : '−', labelDx: -4, labelDy: 0 });

/**
 * Two objects after rubbing: one with + marks, one with − marks, and an arrow for the electrons
 * that moved. left/right: { name, sign, n } (n marks, sign ±1).
 */
export function rubbed({ left = { name: 'hair', sign: 1, n: 5 }, right = { name: 'balloon', sign: -1, n: 5 }, arrow = true, caption } = {}) {
  const pts = [];
  for (let k = 0; k < left.n; k++) { const a = (k / left.n) * 2 * Math.PI; pts.push(mark(-3 + 1.1 * Math.cos(a), 1.1 * Math.sin(a), left.sign)); }
  for (let k = 0; k < right.n; k++) { const a = (k / right.n) * 2 * Math.PI; pts.push(mark(3 + 1.25 * Math.cos(a), 1.5 * Math.sin(a), right.sign)); }
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-6, 6], y: [-2.6, 2.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [ring(-3, 0, 1.6, 1.6, 'ink3'), ring(3, 0, 1.8, 2.1, 'ink3')],
      // electrons go from the object left positive to the one left negative
      arrows: arrow && left.sign !== right.sign ? [left.sign > right.sign ? { from: [-1.2, 1.9], to: [1.2, 1.9], color: 'gold', label: 'electrons', labelDx: -80, labelDy: -12 } : { from: [1.2, 1.9], to: [-1.2, 1.9], color: 'gold', label: 'electrons', labelDx: 8, labelDy: -12 }] : [],
      points: [...pts, { x: -3, y: -2.2, r: 0.01, color: 'ink2', label: left.name, labelDx: -14, labelDy: 0 }, { x: 3, y: -2.45, r: 0.01, color: 'ink2', label: right.name, labelDx: -24, labelDy: 0 }],
    },
    caption: caption ?? 'After rubbing: some electrons have moved from one object to the other. Only the net charge is marked; each object still holds vast, almost equal numbers of + and − charges. Not to scale.',
  };
}
