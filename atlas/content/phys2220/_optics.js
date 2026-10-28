// Constants, number formats and picture builders for the PHYS 2220 optics
// lessons (modules O1–O4). The builders return ordinary visual specs for the
// optics-rays, optics-waves and graph simulations, so the content test
// validates them like any other visual. Not a lesson: the leading underscore
// keeps it out of the registry.
//
// Answers are computed from the numbers the prompts quote (c = 3.00×10⁸ m/s
// where a prompt says so), so a learner who uses them lands on the key.

import { box } from './_waves.js';

export const C = 2.998e8;              // m/s
export const C3 = 3.0e8;               // m/s, the rounded value prompts quote
export const DEG = Math.PI / 180;
export const RAD2AS = 206264.806;      // arcseconds per radian
export const sind = (d) => Math.sin(d * DEG);
export const cosd = (d) => Math.cos(d * DEG);
export const tand = (d) => Math.tan(d * DEG);
export const asind = (x) => Math.asin(x) / DEG;
export const atand = (x) => Math.atan(x) / DEG;
export const acosd = (x) => Math.acos(x) / DEG;

/** A number as TeX with n significant figures: ×10ⁿ outside [10⁻³, 10⁵), thin-space thousands. */
export function tn(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = x.toExponential(n - 1).split('e');
    return `${m} \\times 10^{${parseInt(e, 10)}}`;
  }
  const p = Math.floor(Math.log10(a)), d = Math.max(0, n - 1 - p);
  const r = +x.toPrecision(n);
  const [int, dec] = r.toFixed(d).split('.');
  const sign = int.startsWith('-') ? '-' : '', digits = int.replace('-', '');
  const grouped = digits.length > 4 ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : digits;
  return `${sign}${grouped}${dec ? '.' + dec : ''}`;
}
/** n significant figures as plain text (prose and canvas labels). */
export const s3 = (x, n = 3) => {
  const r = +(+x).toPrecision(n), a = Math.abs(r);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return r.toExponential(n - 1).replace(/e([+-]?)(\d+)/, (m, s, e) => `×10${s === '-' ? '⁻' : ''}${String(+e).replace(/\d/g, (q) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[q])}`);
  return String(r);
};
/** Six significant figures, for numbers written into expressions and parameters. */
export const r6 = (v) => +(+v).toPrecision(6);

/** Keep only the slips whose value differs from the key by more than 2%. */
export const apart = (errs, key) => errs.filter((e) => Number.isFinite(e.value) && Math.abs(e.value - key) > 0.02 * Math.abs(key) + 1e-12);

// ─── pictures ──────────────────────────────────────────────────────────────

/** A ray meeting a flat boundary (optics-rays, interface mode), still. */
export const iface = (params, caption) => ({ type: 'optics-rays', params: { mode: 'interface', controls: false, readout: false, waves: false, ...params }, ...(caption ? { caption } : {}) });

/** Light through a prism (optics-rays, prism mode), still. */
export const prismPic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'prism', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A ray in a fibre (optics-rays, fibre mode), still. */
export const fibrePic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'fibre', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Looking through one refracting surface (optics-rays, surface mode), still. */
export const surfacePic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'surface', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A thin lens (optics-rays, lens mode), still. */
export const lensPic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'lens', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A mirror (optics-rays, mirror mode), still. */
export const mirrorPic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'mirror', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Two lenses (optics-rays, system mode), still. */
export const systemPic = (params, caption) => ({ type: 'optics-rays', params: { mode: 'system', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Slits (optics-waves, slits mode), still; no phasor panel unless asked. */
export const slitsPic = (params, caption) => ({ type: 'optics-waves', params: { mode: 'slits', controls: false, readout: false, phasors: false, ...params }, ...(caption ? { caption } : {}) });

/** A thin film (optics-waves, film mode), still. */
export const filmPic = (params, caption) => ({ type: 'optics-waves', params: { mode: 'film', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A Michelson interferometer (optics-waves, michelson mode), still. */
export const michelsonPic = (params, caption) => ({ type: 'optics-waves', params: { mode: 'michelson', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Two stars through an aperture (optics-waves, airy mode), still. */
export const airyPic = (params, caption) => ({ type: 'optics-waves', params: { mode: 'airy', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** Polarizers (optics-waves, polar mode), still. */
export const polarPic = (params, caption) => ({ type: 'optics-waves', params: { mode: 'polar', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

/** A text label placed at (x, y) on a graph (a point too small to see). */
export const label = (x, y, text, color = 'ink2', dx = 0, dy = 0) => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy });

/** A straight segment as a graph curve. */
export const seg = (a, b, { color = 'ink2', width = 2, dash = false } = {}) => ({
  param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width, dash,
});

/** Lengths (or speeds…) on a common scale as labelled horizontal arrows: [[label, value, colour], …]. */
export function bars(items, { unit = '', caption, max } = {}) {
  const top = max ?? Math.max(...items.map((i) => i[1])) * 1.05;
  const n = items.length;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r6(top * 1.42)], y: [-0.4, n - 0.1], axes: false, grid: false, xlabel: '', ylabel: '',
      arrows: items.map(([lab, v, color], i) => ({ from: [0, n - 1 - i], to: [r6(v), n - 1 - i], color: color || 'accent', label: `${lab}${unit ? '' : ''}`, labelDx: 8, labelDy: 0 })),
      points: [],
    },
    caption,
  };
}

const lab = (x, y, text, color = 'ink2', align = 'left', dy = 0) => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: 0, labelDy: dy, labelAlign: align });

/**
 * A Michelson interferometer from above as a graph (not to scale): laser, beam splitter, two arms, end mirrors and a
 * detector, with one addition chosen by `kind`:
 *   'cell'  a gas cell of length L in one arm, piped to a vacuum pump;
 *   'mm'    Michelson and Morley's apparatus: everything on one slab that turns slowly, and Earth's motion along arm 1;
 *   'ligo'  LIGO: each 4 km arm a Fabry–Pérot cavity between an input mirror and an end mirror, read by a photodetector.
 */
export function michelsonPlan({ kind = 'cell', caption } = {}) {
  const beam = { color: 'bad', width: 1.6 }, mirror = { color: 'ink', width: 4 };
  const curves = [
    ...box(-3.4, 0, 0.55, 0.3, 'bad'),                                                   // laser
    seg([-2.85, 0], [3.6, 0], beam), seg([0, 0], [0, 3.6], beam), seg([0, 0], [0, -2.4], beam),
    seg([-0.45, -0.45], [0.45, 0.45], { color: 'ink2', width: 3 }),                      // beam splitter
    seg([3.7, -0.6], [3.7, 0.6], mirror), seg([-0.6, 3.7], [0.6, 3.7], mirror),        // end mirrors
    ...box(0, -2.75, 0.45, 0.3, 'good'),                                                 // detector
  ];
  const points = [lab(-0.55, -0.62, 'beam splitter', 'ink2', 'right')];
  const arrows = [];
  let x = [-4.6, 6.6];
  if (kind === 'cell') {
    curves.push(...box(2.0, 0, 0.8, 0.42, 'accent'), seg([2.0, -0.42], [2.0, -1.6], { color: 'ink3', width: 2 }));
    points.push(lab(-4.0, 0.62, 'laser', 'bad'), lab(2.0, 0.85, 'gas cell, length L', 'accent', 'center'), lab(2.0, -1.9, 'to a vacuum pump', 'ink3', 'center'),
      lab(0.85, 3.7, 'mirror'), lab(3.95, 0.85, 'mirror'), lab(0.6, -2.75, 'detector', 'good'));
  } else if (kind === 'mm') {
    curves.push(seg([-4.25, -3.3], [4.35, -3.3], { color: 'ink3', width: 1.6, dash: true }), seg([4.35, -3.3], [4.35, 4.2], { color: 'ink3', width: 1.6, dash: true }),
      seg([4.35, 4.2], [-4.25, 4.2], { color: 'ink3', width: 1.6, dash: true }), seg([-4.25, 4.2], [-4.25, -3.3], { color: 'ink3', width: 1.6, dash: true }),
      { param: ['5*cos(t)', '0.4 + 5*sin(t)'], t: [-0.32, 0.3], color: 'gold', width: 2 });
    arrows.push({ from: [r6(5 * Math.cos(0.26)), r6(0.4 + 5 * Math.sin(0.26))], to: [r6(5 * Math.cos(0.34)), r6(0.4 + 5 * Math.sin(0.34))], color: 'gold', width: 2 },
      { from: [4.75, -2.95], to: [6.55, -2.95], color: 'accent', width: 2.2, label: 'Earth’s motion', labelDx: 0, labelDy: -14, labelAlign: 'right' });
    points.push(lab(-4.0, 0.62, 'source', 'bad'), lab(2.3, 0.4, 'arm 1', 'ink2', 'center'), lab(0.2, 2.3, 'arm 2'), lab(5.15, 0.4, 'slab turns', 'gold'),
      lab(0.6, -2.75, 'telescope', 'good'));
    x = [-4.6, 7.0];
  } else if (kind === 'ligo') {
    curves.push(seg([1.0, -0.6], [1.0, 0.6], mirror), seg([-0.6, 1.0], [0.6, 1.0], mirror),
      seg([1.0, 0.13], [3.7, 0.13], { color: 'bad', width: 1 }), seg([1.0, -0.13], [3.7, -0.13], { color: 'bad', width: 1 }),
      seg([0.13, 1.0], [0.13, 3.7], { color: 'bad', width: 1 }), seg([-0.13, 1.0], [-0.13, 3.7], { color: 'bad', width: 1 }));
    points.push(lab(-4.0, 0.62, '1064 nm laser', 'bad'), lab(1.0, -0.95, 'input mirror', 'ink2', 'center'), lab(3.7, -0.95, 'end mirror', 'ink2', 'center'),
      lab(2.35, 0.5, '4 km', 'gold', 'center'), lab(-0.8, 1.0, 'input mirror', 'ink2', 'right'), lab(-0.8, 3.7, 'end mirror', 'ink2', 'right'), lab(0.35, 2.35, '4 km', 'gold'),
      lab(0.6, -2.75, 'photodetector', 'good'));
  }
  return {
    type: 'graph',
    params: { aspect: 'wide', x, y: [-3.45, 4.35], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points, arrows },
    caption,
  };
}
