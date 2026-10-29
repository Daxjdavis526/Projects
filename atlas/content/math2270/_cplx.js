// Shared helpers for the complex-vector-space lessons (math2270 LA-13):
// complex numbers as [re, im] pairs, complex vectors and matrices as TeX, and
// ready-made pictures — phasor panels (each component of a complex vector as
// an arrow in its own complex plane) on the graph sim, the Bloch sphere of a
// spin-½ state on calc-vectors3d, and a beam-splitter interferometer drawn on
// the graph sim. Files whose names start with "_" are helpers, not lessons.

import { qt } from './_la.js';

// ── arithmetic ──
export const cx = (re, im = 0) => [re, im];
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const csub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cscale = (a, s) => [a[0] * s, a[1] * s];
export const conj = (a) => [a[0], -a[1]];
export const abs2 = (a) => a[0] * a[0] + a[1] * a[1];
export const cabs = (a) => Math.sqrt(abs2(a));
export const cexp = (th) => [Math.cos(th), Math.sin(th)];
/** ⟨u, v⟩ = Σ conj(u_k) v_k (conjugate-linear in the first slot, the physics convention). */
export const inner = (u, v) => u.reduce((s, z, k) => cadd(s, cmul(conj(z), v[k])), [0, 0]);
/** Σ u_k v_k with no conjugation (the wrong, "real" formula). */
export const naive = (u, v) => u.reduce((s, z, k) => cadd(s, cmul(z, v[k])), [0, 0]);
export const cnorm = (v) => Math.sqrt(v.reduce((s, z) => s + abs2(z), 0));
export const cmatvec = (A, x) => A.map((row) => row.reduce((s, a, k) => cadd(s, cmul(a, x[k])), [0, 0]));
export const cmatmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => cadd(s, cmul(a, B[k][j])), [0, 0])));
/** The conjugate transpose Aᴴ. */
export const dagger = (A) => A[0].map((_, j) => A.map((row) => conj(row[j])));

// ── TeX ──
const tiny = (x) => Math.abs(x) < 1e-12;
/** A complex number as TeX: 3 - 2i, i, -\frac{1}{2}i, 0 … (real and imaginary parts through qt). */
export function cTeX(z) {
  const [re, im] = z;
  if (tiny(im)) return qt(re);
  const m = Math.abs(im), ip = Math.abs(m - 1) < 1e-12 ? 'i' : `${qt(m)}i`;
  if (tiny(re)) return `${im < 0 ? '-' : ''}${ip}`;
  return `${qt(re)} ${im < 0 ? '-' : '+'} ${ip}`;
}
export const cvecTeX = (v) => `\\begin{bmatrix} ${v.map(cTeX).join(' \\\\ ')} \\end{bmatrix}`;
export const ctupleTeX = (v) => `(${v.map(cTeX).join(',\\ ')})`;
export const cmatTeX = (A) => `\\begin{bmatrix} ${A.map((row) => row.map(cTeX).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
/** A complex number as plain text for a canvas label (Unicode minus). */
export const cPlain = (z) => cTeX(z).replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/-/g, '−');

// ── pictures ──
const PANEL_COLORS = ['gold', 'accent', 'warn', 'violet'];
/**
 * Complex vectors drawn component by component: panel k is the complex plane
 * of component k, with each vector's k-th entry as an arrow from that panel's
 * origin. vectors: [{ name, v: [[re, im], …], color, dash }]; names: the
 * panels' titles (plain text). A dotted circle of radius `circle` is drawn in
 * every panel when it is given.
 */
export function phasors(vectors, { names, caption, circle = null, labels = true } = {}) {
  const n = vectors[0].v.length;
  const R = Math.max(1.2, circle || 0, ...vectors.flatMap((vec) => vec.v.map(cabs))) * 1.18;
  const gap = 0.35 * R, step = 2 * R + gap;
  const cxk = (k) => k * step;
  const curves = [], arrows = [], points = [];
  for (let k = 0; k < n; k++) {
    const c = cxk(k);
    curves.push({ param: [`${c} + t`, '0'], t: [-R, R], color: 'ink4', width: 1 });
    curves.push({ param: [`${c}`, 't'], t: [-R, R], color: 'ink4', width: 1 });
    if (circle) curves.push({ param: [`${c} + ${circle}*cos(t)`, `${circle}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1, dash: [2, 4] });
    points.push({ x: c - R * 0.98, y: R * 0.98, r: 0, label: names ? names[k] : `component ${k + 1}`, labelDx: 0, labelDy: 6, color: 'ink2' });
    points.push({ x: c + R * 0.9, y: 0, r: 0, label: 'Re', labelDx: -6, labelDy: 14, color: 'ink3' });
    points.push({ x: c, y: R * 0.92, r: 0, label: 'Im', labelDx: 6, labelDy: 4, color: 'ink3' });
    vectors.forEach((vec, j) => {
      const z = vec.v[k];
      if (cabs(z) < 1e-9) { points.push({ x: c, y: 0, r: 4, color: vec.color || PANEL_COLORS[j] }); return; }
      arrows.push({ from: [c, 0], to: [c + z[0], z[1]], color: vec.color || PANEL_COLORS[j], width: 2.6, dash: vec.dash, label: labels ? `${vec.name}${'₁₂₃₄'[k]}` : undefined });
    });
  }
  const W = cxk(n - 1) + R + 0.15 * R, H = Math.max(R * 1.08, (W + R * 1.15) / 4);
  return {
    type: 'graph',
    params: { x: [-R * 1.15, W], y: [-H, H], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points },
    caption: caption || 'Each component drawn as an arrow in its own complex plane (real part across, imaginary part up).',
  };
}

/** Bloch-sphere coordinates of the state (cos(θ/2), e^{iφ} sin(θ/2)): (sin θ cos φ, sin θ sin φ, cos θ). */
export const blochOf = (psi) => {
  const n = cnorm(psi), a = cscale(psi[0], 1 / n), b = cscale(psi[1], 1 / n);
  const ab = cmul(conj(a), b);                      // conj(a)·b = ½ sin θ e^{iφ}
  return [2 * ab[0], 2 * ab[1], abs2(a) - abs2(b)];
};

/**
 * The Bloch sphere on calc-vectors3d: the unit sphere (three great circles),
 * the poles of the three Pauli axes marked, a state arrow, optional extra
 * points, a rotation axis and a path (a circle the state sweeps).
 * state: [x, y, z] or null; path: { axis: [x, y, z], from: [x, y, z] } draws
 * the full circle the state sweeps turning about that axis.
 */
export function bloch({ state = null, stateLabel = '\\psi', marks = ['z', 'x', 'y'], points = [], axis = null, path = null, caption, extra = {} } = {}) {
  const P = {
    '+z': { at: [0, 0, 1], label: '\\uparrow', color: 'accent' }, '-z': { at: [0, 0, -1], label: '\\downarrow', color: 'accent' },
    '+x': { at: [1, 0, 0], label: '+x', color: 'warn' }, '-x': { at: [-1, 0, 0], label: '-x', color: 'warn' },
    '+y': { at: [0, 1, 0], label: '+y', color: 'good' }, '-y': { at: [0, -1, 0], label: '-y', color: 'good' },
  };
  const pts = marks.flatMap((m) => [P[`+${m}`], P[`-${m}`]]).concat(points);
  const curves = [];
  if (path) {
    const a = path.axis, n = Math.hypot(...a), u = a.map((x) => x / n), s = path.from;
    const along = s.reduce((acc, x, k) => acc + x * u[k], 0);
    const c = u.map((x) => x * along), r1 = s.map((x, k) => x - c[k]);
    const r2 = [u[1] * r1[2] - u[2] * r1[1], u[2] * r1[0] - u[0] * r1[2], u[0] * r1[1] - u[1] * r1[0]];
    curves.push({ param: [0, 1, 2].map((k) => `(${c[k]}) + (${r1[k]})*cos(t) + (${r2[k]})*sin(t)`), t: [0, 6.2832], color: 'gold' });
  }
  return {
    type: 'calc-vectors3d',
    params: {
      range: 1.35,
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
      points: pts,
      vectors: state ? [{ to: state, color: 'gold', label: stateLabel }] : [],
      lines: axis ? [{ point: [0, 0, 0], dir: axis, t: [-1.3, 1.3], color: 'violet' }] : [],
      curves,
      ...extra,
    },
    caption: caption || 'The Bloch sphere: every spin-½ state (up to an overall phase) is a point on it. Orthogonal states sit at opposite ends of a diameter, not at right angles. Drag to rotate.',
  };
}

/**
 * A Mach–Zehnder interferometer on the graph sim: light enters at the lower
 * left, a beam splitter, two mirrors, a phase shifter φ in the upper arm, a
 * second beam splitter and two detectors (plain-text labels).
 */
export function machZehnder({ caption, phase = 'φ', d1 = 'D1', d2 = 'D2', source = 'light in' } = {}) {
  const beam = (x0, y0, x1, y1, color = 'gold') => ({ param: [`${x0} + (${x1 - x0})*t`, `${y0} + (${y1 - y0})*t`], t: [0, 1], color, width: 2.2 });
  const plate = (x, y, color = 'accent', w = 3.5) => ({ param: [`${x} - 0.32 + 0.64*t`, `${y} - 0.32 + 0.64*t`], t: [0, 1], color, width: w });
  const curves = [
    beam(-3.6, 0, 0, 0), beam(0, 0, 4, 0), beam(0, 0, 0, 2.6), beam(0, 2.6, 4, 2.6), beam(4, 0, 4, 2.6), beam(4, 2.6, 6.6, 2.6), beam(4, 2.6, 4, 4.0),
    plate(0, 0), plate(4, 2.6), plate(4, 0, 'ink2', 5), plate(0, 2.6, 'ink2', 5),
    { param: ['1.7 + 0.6*t', '2.25'], t: [0, 1], color: 'violet', width: 2 }, { param: ['1.7 + 0.6*t', '2.95'], t: [0, 1], color: 'violet', width: 2 },
    { param: ['1.7', '2.25 + 0.7*t'], t: [0, 1], color: 'violet', width: 2 }, { param: ['2.3', '2.25 + 0.7*t'], t: [0, 1], color: 'violet', width: 2 },
  ];
  const points = [
    { x: 6.8, y: 2.6, r: 6, color: 'good', label: d1, labelDx: 10, labelDy: 4 },
    { x: 4, y: 4.2, r: 6, color: 'good', label: d2, labelDx: 10, labelDy: 0 },
    { x: 2, y: 3.15, r: 0, label: phase, labelAlign: 'center', labelDx: 0, labelDy: -2, color: 'violet' },
    { x: -3.5, y: 0, r: 0, label: source, labelDx: 0, labelDy: -10, color: 'ink2' },
    { x: 0.35, y: -0.15, r: 0, label: 'BS1', labelDx: 4, labelDy: 14, color: 'accent' },
    { x: 4.35, y: 2.45, r: 0, label: 'BS2', labelDx: 4, labelDy: 14, color: 'accent' },
    { x: 4.3, y: -0.2, r: 0, label: 'mirror', labelDx: 4, labelDy: 14, color: 'ink2' },
    { x: -0.3, y: 2.9, r: 0, label: 'mirror', labelDx: -52, labelDy: -2, color: 'ink2' },
  ];
  return {
    type: 'graph',
    params: { x: [-4.4, 8.4], y: [-1.6, 4.8], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    caption: caption || 'A Mach–Zehnder interferometer, schematic and not to scale: two 50:50 beam splitters (BS1, BS2), two mirrors, and a phase shift φ in the upper arm.',
  };
}
