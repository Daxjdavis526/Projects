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

/**
 * Infinite wells drawn as level ladders (graph): each box has walls, a floor
 * and its levels as horizontal lines. Energies are in the picture's own units.
 *   boxes: [{ x0, x1, levels: [E…], names: ['n = 1', …], color, highlight: [index…] }]
 *   arrows: [{ x, from, to, color, label }] — vertical jumps between levels
 */
export function ladder({ boxes, arrows = [], y, x, caption, extraPoints = [] }) {
  const curves = [], points = [...extraPoints], arr = [];
  for (const B of boxes) {
    const top = y[1] * 0.98;
    curves.push(seg(B.x0, 0, B.x0, top, 'ink2', 2.4), seg(B.x1, 0, B.x1, top, 'ink2', 2.4), seg(B.x0, 0, B.x1, 0, 'ink2', 2.4));
    B.levels.forEach((E, i) => {
      const hi = (B.highlight || []).includes(i);
      curves.push(seg(B.x0, E, B.x1, E, hi ? 'gold' : B.color || 'accent', hi ? 2.8 : 1.8));
      if (B.names?.[i]) points.push(label(B.x1, E, B.names[i], hi ? 'gold' : 'ink2', 8, 0, 'left'));
    });
    if (B.title) points.push(label((B.x0 + B.x1) / 2, top, B.title, 'ink2', 0, -10, 'center'));
  }
  for (const A of arrows) {
    arr.push({ from: [r6(A.x), r6(A.from)], to: [r6(A.x), r6(A.to)], color: A.color || 'bad', width: 2 });
    if (A.label) points.push(label(A.x, (A.from + A.to) / 2, A.label, A.color || 'bad', A.dx ?? 8, A.dy ?? 0, 'left'));
  }
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, points, arrows: arr },
    caption,
  };
}

/**
 * The graphical solution of a finite well of strength z₀ (graph): the left
 * sides tan z (even states) and −cot z (odd states) against the right side
 * √(z₀² − z²)/z; each crossing is a bound state.
 *   mark: { z, text } — a crossing to label; odd: false leaves out −cot z
 */
export function graphical(z0, { mark = null, odd = true, caption } = {}) {
  const top = 4.2, curves = [], zmax = r6(Math.max(z0 + 0.6, 2));
  for (let k = 0; k * Math.PI < zmax; k++) {
    curves.push({ fn: 'tan(x)', domain: [r6(k * Math.PI + 0.001), r6(Math.min(k * Math.PI + 1.5, zmax))], color: 'accent', width: 2, ...(k === 0 ? { label: 'tan z (even states)', labelAt: 1.0, labelDx: 10, labelDy: 8 } : {}) });
    if (odd) curves.push({ fn: '-1/tan(x)', domain: [r6(k * Math.PI + Math.PI / 2 + 0.07), r6(Math.min((k + 1) * Math.PI - 0.001, zmax))], color: 'violet', width: 2, dash: [6, 4], ...(k === 0 ? { label: '−cot z (odd states)', labelAt: 2.6, labelDx: 8, labelDy: -4 } : {}) });
  }
  curves.push({ fn: `sqrt(${r6(z0 * z0)} - x^2)/x`, domain: [0.05, r6(z0)], color: 'gold', width: 2.4, label: `√(z₀² − z²)/z, z₀ = ${r6(z0).toPrecision(3)}`, labelAt: r6(z0 / 1.9), labelDx: 10, labelDy: -12 });
  const points = mark ? [{ x: r6(mark.z), y: r6(Math.sqrt(z0 * z0 - mark.z * mark.z) / mark.z), r: 5.5, color: 'ink', label: mark.text, labelDx: 10, labelDy: -10 }] : [];
  return {
    type: 'graph',
    params: { x: [0, zmax], y: [0, top], aspect: 'wide', axesAt: 'edge', xlabel: 'z = ka', ylabel: '', vlines: [{ x: r6(z0), label: 'z₀', color: 'gold' }], curves, points },
    caption: caption ?? 'The graphical solution of a finite well: z = ka, where k is the wavenumber inside and a the half-width. Each crossing of the gold curve with a blue (even) or dashed violet (odd) branch is one bound state; there are none beyond z₀.',
  };
}

/**
 * A Coulomb barrier (graph): V(r) = k·Z₁Z₂e²/r outside the nuclear radius R,
 * a schematic well inside, the energy Q, and the forbidden stretch R … b shaded.
 */
export function coulomb({ Z1Z2, R, Q, unit = 'MeV', xmax, ymax, wellDepth = null, names = {}, caption }) {
  const b = (Z1Z2 * KE2) / Q, VR = (Z1Z2 * KE2) / R, xm = xmax ?? 1.3 * b, ym = ymax ?? 1.12 * VR, dep = wellDepth ?? 0.18 * ym;
  return {
    type: 'graph',
    params: {
      x: [0, r6(xm)], y: [r6(-dep * 1.4), r6(ym)], aspect: 'wide', axesAt: 'edge', xlabel: 'distance between the centres r (fm)', ylabel: `energy (${unit})`,
      shade: [{ fn: `${r6(Z1Z2 * KE2)}/x`, lower: String(r6(Q)), from: r6(R), to: r6(b), color: 'bad', alpha: 0.25 }],
      curves: [
        { fn: `${r6(Z1Z2 * KE2)}/x`, domain: [r6(R), r6(xm)], color: 'ink2', width: 2.4 },
        seg(R, -dep, R, VR, 'ink2', 2.4), seg(0, -dep, R, -dep, 'ink2', 2.4),
        seg(0, Q, xm, Q, 'gold', 2.4),
      ],
      points: [
        label(R, 0, names.R ?? `R = ${r6(R).toPrecision(3)} fm`, 'ink2', 6, 12, 'left'),
        label(b, Q, names.b ?? `b = ${r6(b).toPrecision(3)} fm`, 'bad', 0, 14, 'center'),
        label(xm * 0.98, Q, names.Q ?? `energy ${r6(Q)} ${unit}`, 'gold', 0, -12, 'right'),
        label(R * 1.1, VR, names.top ?? `barrier top ≈ ${r6(VR).toPrecision(3)} ${unit}`, 'ink2', 8, 0, 'left'),
        label(R + 0.3 * (b - R), Q + 0.3 * (Math.min(ym, (Z1Z2 * KE2) / (R + 0.3 * (b - R))) - Q), names.tunnel ?? 'tunnels through', 'bad', 0, 0, 'center'),
      ],
    },
    caption,
  };
}

export { r6, seg, label };
