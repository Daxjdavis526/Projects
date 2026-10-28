// Feynman diagrams and hadron pictures for the PHYS 3710 particle lessons
// (module P1), built as ordinary `graph` specs so the content test checks
// them like any other visual. Time runs left to right; a fermion line’s
// arrow follows the particle (an antiparticle’s arrow points back in time —
// a book-keeping convention, not motion); photons are wavy, W and Z bosons
// wavy in another colour, gluons tightly wound. Not a lesson: the leading
// underscore keeps it out of the registry.

import { r6, label } from '../phys2710/_diagrams.js';

const on = (when) => (when === undefined ? {} : { when });

/** A fermion line from (x0, y0) to (x1, y1), with an arrowhead at its middle pointing along it (or against it, for anti). */
export function fermion(x0, y0, x1, y1, { anti = false, color = 'accent', when } = {}) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), s = (anti ? -1 : 1) * 0.28 / L;
  return {
    curves: [{ param: [`${r6(x0)} + t*(${r6(dx)})`, `${r6(y0)} + t*(${r6(dy)})`], t: [0, 1], color, width: 2.4, ...on(when) }],
    arrows: [{ from: [r6(mx - s * dx), r6(my - s * dy)], to: [r6(mx + s * dx), r6(my + s * dy)], color, width: 2.4, ...on(when) }],
  };
}

/** A boson line: wavy (photon, W, Z) or tightly wound (gluon). */
export function boson(x0, y0, x1, y1, { kind = 'photon', color, when } = {}) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const waves = Math.max(2, Math.round(L * (kind === 'gluon' ? 3 : 1.6))), A = kind === 'gluon' ? 0.16 : 0.13;
  const col = color ?? (kind === 'photon' ? 'gold' : kind === 'gluon' ? 'good' : 'violet');
  return {
    curves: [{ param: [`${r6(x0)} + t*(${r6(dx)}) + ${r6(A * nx)}*sin(${r6(2 * Math.PI * waves)}*t)`, `${r6(y0)} + t*(${r6(dy)}) + ${r6(A * ny)}*sin(${r6(2 * Math.PI * waves)}*t)`], t: [0, 1], color: col, width: 2, ...on(when) }],
    arrows: [],
  };
}

/** A vertex dot. */
export const vertex = (x, y, when) => ({ curves: [], arrows: [], points: [{ x: r6(x), y: r6(y), r: 5, color: 'ink', ...on(when) }] });
/** A label (plain text: Unicode, no TeX). */
export const tag = (x, y, text, color = 'ink', dx = 0, dy = 0, align = 'center', when) => ({ curves: [], arrows: [], points: [{ ...label(x, y, text, color, dx, dy, align), ...on(when) }] });

/** Merge pieces into one graph spec. */
export function diagram(pieces, { caption, extra = {}, time = true } = {}) {
  const curves = [], arrows = [], points = [];
  for (const p of pieces) { curves.push(...(p.curves || [])); arrows.push(...(p.arrows || [])); points.push(...(p.points || [])); }
  if (time) { arrows.push({ from: [0.4, -0.35], to: [2.2, -0.35], color: 'ink3', width: 1.4 }); points.push(label(2.3, -0.35, 'time', 'ink3', 4, 0, 'left')); }
  return {
    type: 'graph',
    params: { x: [0, 10], y: [-0.7, 6.2], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points, ...extra },
    caption: caption ?? 'A Feynman diagram: time runs left to right; each dot is a vertex where one coupling acts. Lines are book-keeping for the terms of a calculation, not paths through space.',
  };
}

// ---- the standard diagrams, each a list of pieces (pass `when` to show it only for one choice)
export const DIAGRAMS = {
  /** e⁻e⁺ → μ⁻μ⁺ through a virtual photon (s-channel). Also e⁺e⁻ → qq̄ with quark labels. */
  annihilate: (w, out = ['μ⁻', 'μ⁺'], boson_ = 'photon', mid = 'γ') => [
    fermion(1, 5.2, 3.5, 3, { when: w }), fermion(3.5, 3, 1, 0.8, { when: w }), boson(3.5, 3, 6.5, 3, { kind: boson_, when: w }),
    fermion(6.5, 3, 9, 5.2, { color: 'warn', when: w }), fermion(9, 0.8, 6.5, 3, { color: 'warn', when: w }), vertex(3.5, 3, w), vertex(6.5, 3, w),
    tag(1, 5.2, 'e⁻', 'accent', -8, 0, 'right', w), tag(1, 0.8, 'e⁺', 'accent', -8, 0, 'right', w), tag(9, 5.2, out[0], 'warn', 8, 0, 'left', w), tag(9, 0.8, out[1], 'warn', 8, 0, 'left', w), tag(5, 3, mid, 'gold', 0, -16, 'center', w),
  ],
  /** e⁻e⁻ → e⁻e⁻ by photon exchange (Møller scattering, t-channel). */
  moller: (w) => [
    fermion(1, 5, 5, 4.5, { when: w }), fermion(5, 4.5, 9, 5.4, { when: w }), fermion(1, 1, 5, 1.5, { when: w }), fermion(5, 1.5, 9, 0.6, { when: w }),
    boson(5, 4.5, 5, 1.5, { when: w }), vertex(5, 4.5, w), vertex(5, 1.5, w),
    tag(1, 5, 'e⁻', 'accent', -8, 0, 'right', w), tag(1, 1, 'e⁻', 'accent', -8, 0, 'right', w), tag(9, 5.4, 'e⁻', 'accent', 8, 0, 'left', w), tag(9, 0.6, 'e⁻', 'accent', 8, 0, 'left', w), tag(5, 3, 'γ', 'gold', 14, 0, 'left', w),
  ],
  /** Compton scattering e⁻γ → e⁻γ (s-channel). */
  compton: (w) => [
    fermion(1, 1.2, 3.5, 3, { when: w }), fermion(3.5, 3, 6.5, 3, { when: w }), fermion(6.5, 3, 9, 1.2, { when: w }),
    boson(1, 5.2, 3.5, 3, { when: w }), boson(6.5, 3, 9, 5.2, { when: w }), vertex(3.5, 3, w), vertex(6.5, 3, w),
    tag(1, 1.2, 'e⁻', 'accent', -8, 0, 'right', w), tag(1, 5.2, 'γ', 'gold', -8, 0, 'right', w), tag(9, 1.2, 'e⁻', 'accent', 8, 0, 'left', w), tag(9, 5.2, 'γ', 'gold', 8, 0, 'left', w), tag(5, 3, 'e⁻ (virtual)', 'accent', 0, 16, 'center', w),
  ],
  /** e⁺e⁻ → γγ by electron exchange. */
  twoPhoton: (w) => [
    fermion(1, 5, 5, 4.5, { when: w }), fermion(5, 4.5, 5, 1.5, { when: w }), fermion(5, 1.5, 1, 1, { when: w }),
    boson(5, 4.5, 9, 5.2, { when: w }), boson(5, 1.5, 9, 0.8, { when: w }), vertex(5, 4.5, w), vertex(5, 1.5, w),
    tag(1, 5, 'e⁻', 'accent', -8, 0, 'right', w), tag(1, 1, 'e⁺', 'accent', -8, 0, 'right', w), tag(9, 5.2, 'γ', 'gold', 8, 0, 'left', w), tag(9, 0.8, 'γ', 'gold', 8, 0, 'left', w),
  ],
  /** e⁺e⁻ → γγγ: three vertices. */
  threePhoton: (w) => [
    fermion(1, 5.4, 4, 5, { when: w }), fermion(4, 5, 4, 3, { when: w }), fermion(4, 3, 4, 1, { when: w }), fermion(4, 1, 1, 0.6, { when: w }),
    boson(4, 5, 9, 5.6, { when: w }), boson(4, 3, 9, 3, { when: w }), boson(4, 1, 9, 0.4, { when: w }), vertex(4, 5, w), vertex(4, 3, w), vertex(4, 1, w),
    tag(1, 5.4, 'e⁻', 'accent', -8, 0, 'right', w), tag(1, 0.6, 'e⁺', 'accent', -8, 0, 'right', w), tag(9, 5.6, 'γ', 'gold', 8, 0, 'left', w), tag(9, 3, 'γ', 'gold', 8, 0, 'left', w), tag(9, 0.4, 'γ', 'gold', 8, 0, 'left', w),
  ],
  /** Neutron beta decay at the quark level: d → u W⁻, W⁻ → e⁻ ν̄ₑ, with the spectator quarks. */
  beta: (w) => [
    fermion(1, 2.4, 4, 2.4, { color: 'warn', when: w }), fermion(4, 2.4, 9, 2.4, { color: 'warn', when: w }),
    fermion(1, 1.4, 9, 1.4, { color: 'warn', when: w }), fermion(1, 0.6, 9, 0.6, { color: 'warn', when: w }),
    boson(4, 2.4, 6.5, 4.3, { kind: 'W', when: w }), fermion(6.5, 4.3, 9, 5.6, { when: w }), fermion(9, 3.4, 6.5, 4.3, { when: w }), vertex(4, 2.4, w), vertex(6.5, 4.3, w),
    tag(1, 2.4, 'd', 'warn', -8, 0, 'right', w), tag(1, 1.4, 'u', 'warn', -8, 0, 'right', w), tag(1, 0.6, 'd', 'warn', -8, 0, 'right', w), tag(1, 1.4, 'n', 'ink2', -24, 0, 'right', w),
    tag(9, 2.4, 'u', 'warn', 8, 0, 'left', w), tag(9, 1.4, 'u', 'warn', 8, 0, 'left', w), tag(9, 0.6, 'd', 'warn', 8, 0, 'left', w), tag(9, 1.4, 'p', 'ink2', 24, 0, 'left', w),
    tag(9, 5.6, 'e⁻', 'accent', 8, 0, 'left', w), tag(9, 3.4, 'ν̄ₑ', 'accent', 8, 0, 'left', w), tag(5.25, 3.35, 'W⁻', 'violet', -10, -6, 'right', w),
  ],
  /** Muon decay: μ⁻ → ν_μ W⁻, W⁻ → e⁻ ν̄ₑ. */
  muon: (w, lead = 'μ⁻', nu = 'νμ', outs = ['e⁻', 'ν̄ₑ']) => [
    fermion(1, 2, 4.5, 2, { when: w }), fermion(4.5, 2, 9, 1.2, { when: w }), boson(4.5, 2, 6.7, 4.2, { kind: 'W', when: w }),
    fermion(6.7, 4.2, 9, 5.6, { color: 'warn', when: w }), fermion(9, 3.2, 6.7, 4.2, { color: 'warn', when: w }), vertex(4.5, 2, w), vertex(6.7, 4.2, w),
    tag(1, 2, lead, 'accent', -8, 0, 'right', w), tag(9, 1.2, nu, 'accent', 8, 0, 'left', w), tag(9, 5.6, outs[0], 'warn', 8, 0, 'left', w), tag(9, 3.2, outs[1], 'warn', 8, 0, 'left', w), tag(5.6, 3.1, 'W⁻', 'violet', -10, -6, 'right', w),
  ],
};

// ---- hadrons
const QCOL = { u: 'accent', d: 'warn', s: 'good', c: 'violet', b: 'teal' };
/** A hadron’s valence quarks as coloured discs in a ring (antiquarks dashed). qs: e.g. ['u', 'u', 'd'] or ['u', 's̄']. */
export function quarkRing(qs, name, { caption, spins = null } = {}) {
  const pts = [], curves = [], arrows = [];
  qs.forEach((q, i) => {
    const a = (2 * Math.PI * i) / qs.length + Math.PI / 2, x = 0.6 * Math.cos(a), y = 0.6 * Math.sin(a), anti = q.includes('̄');
    pts.push({ x: r6(x), y: r6(y), r: 15, color: QCOL[q[0]] || 'ink' }, label(x, y, q, 'ink', 0, 0, 'center'));
    if (anti) curves.push({ param: [`${r6(x)} + 0.24*cos(t)`, `${r6(y)} + 0.24*sin(t)`], t: [0, 6.2832], color: 'ink', width: 1.2, dash: true });
    if (spins) arrows.push({ from: [r6(x + 0.34), r6(y - 0.24 * spins[i])], to: [r6(x + 0.34), r6(y + 0.24 * spins[i])], color: 'ink', width: 2 });
  });
  return {
    type: 'graph',
    params: { x: [-2.6, 2.6], y: [-1.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['1.1*cos(t)', '1.1*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.4, dash: true }, ...curves],
      ...(arrows.length ? { arrows } : {}),
      points: [...pts, label(1.35, 0, name, 'ink', 0, 0, 'left')] },
    caption: caption ?? 'The hadron’s valence quarks (antiquarks ringed with a dashed circle). A sketch: inside, they are bound by gluons and a sea of quark–antiquark pairs.',
  };
}

/** The three SU(3) flavour multiplets in the (I₃, S) plane: 0 the baryon octet, 1 the baryon decuplet, 2 the pseudoscalar mesons. */
export const MULTIPLETS = [
  [['n', -0.5, 0, 939.6], ['p', 0.5, 0, 938.3], ['Σ⁻', -1, -1, 1197.4], ['Σ⁰', 0, -1, 1192.6], ['Λ', 0, -1, 1115.7], ['Σ⁺', 1, -1, 1189.4], ['Ξ⁻', -0.5, -2, 1321.7], ['Ξ⁰', 0.5, -2, 1314.9]],
  [['Δ⁻', -1.5, 0, 1232], ['Δ⁰', -0.5, 0, 1232], ['Δ⁺', 0.5, 0, 1232], ['Δ⁺⁺', 1.5, 0, 1232], ['Σ*⁻', -1, -1, 1387.2], ['Σ*⁰', 0, -1, 1383.7], ['Σ*⁺', 1, -1, 1382.8], ['Ξ*⁻', -0.5, -2, 1535.0], ['Ξ*⁰', 0.5, -2, 1531.8], ['Ω⁻', 0, -3, 1672.5]],
  [['K⁰', -0.5, 1, 497.6], ['K⁺', 0.5, 1, 493.7], ['π⁻', -1, 0, 139.6], ['π⁰', 0, 0, 135.0], ['η', 0, 0, 547.9], ['η′', 0, 0, 957.8], ['π⁺', 1, 0, 139.6], ['K⁻', -0.5, -1, 493.7], ['K̄⁰', 0.5, -1, 497.6]],
];
