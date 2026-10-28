// Shared helpers for the PHYS 4700 lessons (Quantum Mechanics I): constants
// the other helper files do not carry, small complex-number tools, and
// picture builders. Every picture is an ordinary sim spec, so the content
// test validates it like any other visual. Not a lesson: the leading
// underscore keeps it out of the registry.
//
// Exact constants are the 2019 SI's; measured ones are CODATA 2022 (Rev. Mod.
// Phys. 97, 025002, 2025); the rubidium-87 mass is AME2020 and its D2 line is
// Steck's "Rubidium 87 D Line Data" (rev. 2.3.3); the caesium hyperfine
// frequency is exact (it defines the second).

import { C, H, HBAR, QE, KB, ME, MP } from '../phys2710/_constants.js';
import { kets, braket, exact } from '../../src/viz/model/qm4-sg.js';

export { C, H, HBAR, QE, KB, ME, MP, kets, braket, exact };
export const MU_B = 9.2740100657e-24;            // J/T, Bohr magneton (CODATA 2022)
export const GE = 2.00231930436092;              // |g| of the free electron (CODATA 2022)
export const GAMMA_E = 1.76085962784e11;         // s⁻¹ T⁻¹, electron gyromagnetic ratio (CODATA 2022)
export const GAMMA_P = 2.6752218708e8;           // s⁻¹ T⁻¹, free proton (CODATA 2022)
export const GAMMA_P_HZ = GAMMA_P / (2 * Math.PI); // Hz/T: 42.577 478 46 MHz/T
export const U = 1.66053906892e-27;              // kg, atomic mass unit (CODATA 2022)
export const M_H = 1.00782503190 * U;            // kg, the hydrogen atom (AME2020)
export const M_RB87 = 86.909180531 * U;          // kg, rubidium-87 (AME2020)
export const RB_D2 = 780.241209686e-9;           // m, the Rb-87 D2 line in vacuum (Steck)
export const CS_HFS = 9192631770;                // Hz, the caesium-133 clock transition (exact)
export const G0 = 9.80665;                       // m/s², standard gravity (exact)
export const HBARC_EVNM = (HBAR * C / QE) * 1e9; // eV nm: 197.326 980 4…
export const HB2M_EVNM2 = (HBAR * HBAR / (2 * ME) / QE) * 1e18;   // ħ²/2mₑ in eV nm²: 0.038 099 82…

/** r6: a number trimmed to 6 significant figures, for picture coordinates. */
export const r6 = (v) => +(+v).toPrecision(6);

// ── complex numbers as [re, im] ──
export const cx = (re, im = 0) => [re, im];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const conj = (a) => [a[0], -a[1]];
export const abs2 = (a) => a[0] * a[0] + a[1] * a[1];
export const cscale = (a, s) => [a[0] * s, a[1] * s];
/** ⟨u|v⟩ = Σ uₖ* vₖ for complex vectors of any length. */
export const inner = (u, v) => u.reduce((s, z, k) => cadd(s, cmul(conj(z), v[k])), [0, 0]);
export const norm = (v) => Math.sqrt(v.reduce((s, z) => s + abs2(z), 0));

/** Bloch vector (x, y, z) of a 2-component state (normalised inside). */
export function blochVec(psi) {
  const n = norm(psi), a = cscale(psi[0], 1 / n), b = cscale(psi[1], 1 / n);
  const ab = cmul(conj(a), b);
  return [2 * ab[0], 2 * ab[1], abs2(a) - abs2(b)];
}

/**
 * The Bloch sphere on calc-vectors3d: the unit sphere, the ±x, ±y, ±z states
 * marked, optional state arrows [{ v: [x, y, z], label (TeX), color }] and
 * extra points [{ at, label, color }].
 */
export function blochPic({ states = [], points = [], caption, yaw = 0.55, pitch = 0.32, marks = true, extra = {} } = {}) {
  const P = marks ? [
    { at: [0, 0, 1], label: '+z', color: 'accent' }, { at: [0, 0, -1], label: '-z', color: 'accent' },
    { at: [1, 0, 0], label: '+x', color: 'warn' }, { at: [-1, 0, 0], label: '-x', color: 'warn' },
    { at: [0, 1, 0], label: '+y', color: 'good' }, { at: [0, -1, 0], label: '-y', color: 'good' },
  ] : [];
  return {
    type: 'calc-vectors3d',
    params: {
      range: 1.35, yaw, pitch,
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
      points: [...P, ...points],
      vectors: states.map((s) => ({ to: s.v.map(r6), color: s.color || 'gold', label: s.label || '\\psi' })),
      ...extra,
    },
    caption: caption || 'The Bloch sphere: each spin-½ state, up to an overall phase, is a point on it. States at opposite ends of a diameter are orthogonal. Drag to rotate.',
  };
}

/**
 * A Stern–Gerlach chain as a still picture for a question: no controls, no
 * buttons, no counts and no predicted fractions unless asked for.
 */
export const sgPic = (analysers, { source = 'oven', st, sp, caption, exact: ex = false, counts = false, N = 0, controls = false, extra = {} } = {}) => ({
  type: 'qm4-sg',
  params: { source, analysers, exact: ex, counts, N, controls, send: [], bars: false, readout: false, ...(st !== undefined ? { st } : {}), ...(sp !== undefined ? { sp } : {}), ...extra },
  ...(caption ? { caption } : {}),
});

/** A short horizontal or vertical segment as a graph curve. */
export const seg = (x0, y0, x1, y1, color = 'ink2', width = 2, dash) => ({
  param: [`${r6(x0)} + (${r6(x1 - x0)})*t`, `${r6(y0)} + (${r6(y1 - y0)})*t`], t: [0, 1], color, width, ...(dash ? { dash } : {}),
});
/** A text label with no dot. */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0, align) => ({ x: r6(x), y: r6(y), r: 0, color, label: text, labelDx: dx, labelDy: dy, ...(align ? { labelAlign: align } : {}) });

/**
 * Complex numbers drawn as arrows in their own complex planes, side by side.
 * panels: [{ title, arrows: [{ z: [re, im], from?: [re, im], color, label, dash }] }]
 */
export function argand(panels, { R = 1.2, caption, gap = 0.45 } = {}) {
  const step = 2 * R + gap, curves = [], arrows = [], points = [];
  panels.forEach((pn, k) => {
    const c = k * step;
    curves.push({ param: [`${r6(c)} + t`, '0'], t: [-R, R], color: 'ink4', width: 1 });
    curves.push({ param: [`${r6(c)}`, 't'], t: [-R, R], color: 'ink4', width: 1 });
    if (pn.circle) curves.push({ param: [`${r6(c)} + ${pn.circle}*cos(t)`, `${pn.circle}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1, dash: [2, 4] });
    points.push(label(c - R * 0.98, R * 0.98, pn.title, 'ink2', 0, 6));
    points.push(label(c + R * 0.92, 0, 'Re', 'ink3', -6, 13));
    points.push(label(c, R * 0.9, 'Im', 'ink3', 6, 4));
    for (const a of pn.arrows) {
      const f = a.from || [0, 0];
      if (abs2(a.z) < 1e-12) { points.push({ x: r6(c + f[0]), y: r6(f[1]), r: 4, color: a.color || 'gold', label: a.label }); continue; }
      arrows.push({ from: [r6(c + f[0]), r6(f[1])], to: [r6(c + f[0] + a.z[0]), r6(f[1] + a.z[1])], color: a.color || 'gold', width: 2.6, ...(a.dash ? { dash: a.dash } : {}), ...(a.label ? { label: a.label, labelDx: a.ldx ?? 6, labelDy: a.ldy ?? -6 } : {}) });
    }
  });
  const W = (panels.length - 1) * step + R * 1.1, Hh = Math.max(R * 1.1, (W + R * 1.15) / 4);
  return {
    type: 'graph',
    params: { x: [r6(-R * 1.15), r6(W)], y: [r6(-Hh), r6(Hh)], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points },
    caption: caption || 'Each complex number drawn as an arrow in its own complex plane: real part across, imaginary part up.',
  };
}

/** A probability density (or any real curve) on its own axes, with an optional shaded window. */
export function curvePic({ fn, x, y, xlabel = 'x (nm)', ylabel = '|ψ|² (nm⁻¹)', shade = null, curves = [], points = [], vlines = [], color = 'accent', caption, extra = {}, fill = true }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel, ylabel, axesAt: 'edge',
      curves: [...(fn ? [{ fn, color, width: 2.4 }] : []), ...curves],
      shade: [...(fn && fill ? [{ fn, from: x[0], to: x[1], color, alpha: 0.12 }] : []), ...(shade ? [{ fn: shade.fn || fn, from: shade[0], to: shade[1], color: 'gold', alpha: 0.45 }] : [])],
      points, vlines, ...extra,
    },
    caption,
  };
}
