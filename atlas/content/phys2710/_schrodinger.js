// Helpers for the PHYS 2710 lessons on the Schrödinger equation and the
// hydrogen atom (modules MP7–MP8): a few constants the other helper files do
// not carry, the error function, and picture builders. Every picture is an
// ordinary `graph` or `mp-schrodinger` / `mp-orbitals` spec, so the content
// test validates it like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.
//
// Measured constants are CODATA 2022; the Bohr magneton is eħ/2mₑ.

import { HBAR, QE, ME, C, H } from './_constants.js';
import { r6, seg, label } from './_diagrams.js';

export { T0, HBARC, MEC2, HBAR_EVFS, H_EVFS } from '../../src/viz/model/mp-schrodinger.js';
export const HC = (H * C / QE) * 1e9;               // eV nm: 1239.841 984…
export const MU_B = (QE * HBAR) / (2 * ME);         // J/T: 9.274 010 08…e-24
export const MU_B_EV = MU_B / QE;                   // eV/T: 5.788 381 8…e-5
export const U_KG = 1.66053906892e-27;              // kg, the atomic mass unit (CODATA 2022)
export const KE2 = 1.439964548;                     // eV nm (= MeV fm): e²/4πε₀
export const ALPHA = 7.2973525643e-3;               // the fine-structure constant (CODATA 2022)

/** erf(x) to about 1e-14, by its Taylor series (|x| < 3) or continued fraction. */
export function erf(x) {
  const s = Math.sign(x), a = Math.abs(x);
  if (a < 3) {
    let sum = a, term = a;
    for (let n = 1; n < 200; n++) { term *= (-a * a) / n; const add = term / (2 * n + 1); sum += add; if (Math.abs(add) < 1e-17 * Math.abs(sum)) break; }
    return (s * 2 * sum) / Math.sqrt(Math.PI);
  }
  // erfc by a continued fraction (Lentz)
  let f = a, Cc = a, D = 0;
  for (let n = 1; n < 300; n++) {
    const an = n / 2;
    D = a + an * D; D = 1 / D; Cc = a + an / Cc;
    const del = Cc * D; f *= del;
    if (Math.abs(del - 1) < 1e-16) break;
  }
  const erfc = Math.exp(-a * a) / Math.sqrt(Math.PI) / f;
  return s * (1 - erfc);
}

/** A deterministic sampler: n positions drawn from a density on [a, b] (for pictures of detector hits). */
export function samples(density, a, b, n, seed = 7) {
  let st = seed >>> 0;
  const rnd = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let top = 0;
  for (let i = 0; i <= 400; i++) top = Math.max(top, density(a + ((b - a) * i) / 400));
  const out = [];
  while (out.length < n) { const x = a + (b - a) * rnd(), y = top * rnd(); if (y <= density(x)) out.push(x); }
  return out;
}

/** The mp-schrodinger simulation as a still picture for a question. */
export const well = (params, caption) => ({ type: 'mp-schrodinger', params: { controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/**
 * A static graph of a probability density with an optional shaded window.
 *   fn: |ψ|² as an Atlas expression of x; x, y: ranges; shade: [a, b] or null
 */
export function density({ fn, x, y, shade = null, xlabel = 'x (nm)', ylabel = '|ψ|² (nm⁻¹)', curves = [], points = [], vlines = [], label: lab = null, caption, extra = {} }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel, ylabel, axesAt: 'edge',
      curves: [{ fn, color: 'accent', width: 2.4, ...(lab ? { label: lab.text, labelAt: lab.at, labelDx: lab.dx ?? 8, labelDy: lab.dy ?? -10, ...(lab.align ? { labelAlign: lab.align } : {}) } : {}) }, ...curves],
      shade: [{ fn, from: x[0], to: x[1], color: 'accent', alpha: 0.12 }, ...(shade ? [{ fn, from: shade[0], to: shade[1], color: 'gold', alpha: 0.45 }] : [])],
      points, vlines, ...extra,
    },
    caption,
  };
}

/** Box states ψₙ = √2 sin(nπx) on 0 < x < 1 (x in units of L), as Atlas expressions. */
export const boxFn = (n) => `sqrt(2)*sin(${n}*pi*x)`;
export const boxProbFn = (n) => `2*sin(${n}*pi*x)^2`;

export { r6, seg, label };
