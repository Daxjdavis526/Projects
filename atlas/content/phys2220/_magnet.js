// Constants, number formats and picture builders for the PHYS 2220 magnetism
// and induction lessons (modules B1–B3). Not a lesson: the leading underscore
// keeps it out of the registry.
//
// Answers are computed with the same rounded constants the prompts give the
// learner (e = 1.602×10⁻¹⁹ C, m_p = 1.673×10⁻²⁷ kg, μ₀ = 4π×10⁻⁷ T·m/A …),
// as in the sibling helper _efield.js, so a learner who uses them lands on
// the key.
//
// Colours, the same in every picture of these modules: velocity green
// ('good'), magnetic field teal, magnetic force violet, electric field gold,
// current blue ('accent'), magnetic moment gold; positive charges red
// ('bad'), negative charges blue.

import { fmt } from '../../src/core/format.js';

export const QE = 1.602e-19;          // C
export const ME = 9.109e-31;          // kg
export const MP = 1.673e-27;          // kg
export const MALPHA = 6.645e-27;      // kg
export const U = 1.661e-27;           // kg (atomic mass unit)
export const MU0 = 4e-7 * Math.PI;    // T·m/A (CODATA 2022: 1.25663706127×10⁻⁶, the same to 9 figures)
export const G0 = 9.81;               // m/s²
export const DEG = Math.PI / 180;

export const COL = { v: 'good', B: 'teal', F: 'violet', E: 'gold', I: 'accent', mu: 'gold', pos: 'bad', neg: 'accent' };

/** The particles these lessons use, with the rounded constants the prompts quote. */
export const PARTICLES = {
  proton: { q: QE, m: MP, name: 'proton', a: 'a proton', An: 'A proton', qTeX: '+e', mTeX: 'm_p = 1.673\\times10^{-27}\\ \\text{kg}' },
  electron: { q: -QE, m: ME, name: 'electron', a: 'an electron', An: 'An electron', qTeX: '-e', mTeX: 'm_e = 9.109\\times10^{-31}\\ \\text{kg}' },
  alpha: { q: 2 * QE, m: MALPHA, name: 'alpha particle', a: 'an alpha particle', An: 'An alpha particle', qTeX: '+2e', mTeX: 'm_\\alpha = 6.645\\times10^{-27}\\ \\text{kg}' },
};

/** Plain text with n significant figures (prose, and labels drawn on a canvas). */
export const s3 = (x, n = 3) => fmt(x, n);

/** A number as TeX with n significant figures, with ×10ⁿ outside [10⁻³, 10⁴). */
export function tn(x, n = 3) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const r = +x.toPrecision(n), a = Math.abs(r);
  if (a >= 1e4 || a < 1e-3) {
    const [m, e] = r.toExponential(n - 1).split('e');
    return `${m} \\times 10^{${parseInt(e, 10)}}`;
  }
  const d = Math.max(0, n - 1 - Math.floor(Math.log10(a)));
  return r.toFixed(d);
}

/** Six significant figures, for numbers written into a visual's parameters. */
export const r6 = (v) => +(+v).toPrecision(6);
/** Four decimals, for coordinates. */
export const r4 = (v) => (Math.abs(v) < 5e-5 ? 0 : +(+v).toFixed(4));

// ─── vectors ───────────────────────────────────────────────────────────────
export const add = (a, b) => a.map((x, k) => x + b[k]);
export const sub = (a, b) => a.map((x, k) => x - b[k]);
export const scale = (a, s) => a.map((x) => x * s);
export const neg = (a) => a.map((x) => (x === 0 ? 0 : -x));
export const dot = (a, b) => a.reduce((s, x, k) => s + x * b[k], 0);
export const norm = (a) => Math.sqrt(dot(a, a));
export const unit = (a) => scale(a, 1 / (norm(a) || 1));
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The six axis directions, as [TeX name, unit vector]. */
export const AXES = [['+x', [1, 0, 0]], ['-x', [-1, 0, 0]], ['+y', [0, 1, 0]], ['-y', [0, -1, 0]], ['+z', [0, 0, 1]], ['-z', [0, 0, -1]]];
/** '+x', '-z', … for a vector along an axis (TeX: put it inside $…$). */
export function axisTeX(v) {
  const k = v.findIndex((c) => Math.abs(c) > 1e-12);
  return `${v[k] > 0 ? '+' : '-'}${'xyz'[k]}`;
}

// ─── 3D pictures (calc-vectors3d) ──────────────────────────────────────────
/** A vector arrow for calc-vectors3d. */
export const arrow3 = (to, color, label, from) => ({ to: to.map(r4), ...(from ? { from: from.map(r4) } : {}), color, ...(label ? { label } : {}) });

/** An arc of radius R from direction a toward direction b (the right-hand sweep, or an angle). */
export function arc3(a, b, { R = 0.7, color = 'gold', label, at = [0, 0, 0] } = {}) {
  const A = unit(a), Bu = unit(b), c = Math.max(-1, Math.min(1, dot(A, Bu)));
  const th = Math.acos(c);
  let e = sub(Bu, scale(A, c));
  if (norm(e) < 1e-9) e = Math.abs(A[2]) < 0.9 ? unit(cross(A, [0, 0, 1])) : unit(cross(A, [1, 0, 0]));
  e = unit(e);
  const comp = (k) => `${r4(at[k])} + ${r4(R * A[k])}*cos(t) + ${r4(R * e[k])}*sin(t)`;
  return { param: [comp(0), comp(1), comp(2)], t: [0, r4(th)], color, width: 2, ...(label ? { label, labelAt: 0.55 } : {}) };
}

/**
 * A 3D scene on calc-vectors3d. `charge`: +1 or −1 draws the particle at the
 * origin in its colour; arrows, curves, segments, points and planes pass on.
 */
export function scene3({ vectors = [], curves = [], segments = [], points = [], planes = [], parallelograms = [], charge = 0, range = 3, axisLabels, caption, aspect = 'wide', extra = {} }) {
  const pts = [...(charge ? [{ at: [0, 0, 0], color: charge > 0 ? COL.pos : COL.neg, r: 6.5 }] : []), ...points];
  return {
    type: 'calc-vectors3d',
    params: { range, aspect, ...(axisLabels ? { axisLabels } : {}), vectors, curves, segments, points: pts, planes, parallelograms, ...extra },
    caption,
  };
}

// ─── 2D pictures in the page (graph) ───────────────────────────────────────
/** A text label at (x, y): a point too small to see, its label centred on it. */
export const lab = (x, y, text, color = 'ink2', dx = 0, dy = 0, align = 'center') => ({ x: r6(x), y: r6(y), r: 0.01, color, label: text, labelDx: dx, labelDy: dy, labelAlign: align });

/** A straight segment as a graph curve. */
export const seg2 = (a, b, { color = 'ink2', width = 2, dash = false } = {}) => ({
  param: [`${r6(a[0])} + t*${r6(b[0] - a[0])}`, `${r6(a[1])} + t*${r6(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}),
});

/** A circle (or an arc from a0 to a1, radians) as a graph curve. */
export const circ2 = (cx, cy, R, { color = 'ink2', width = 2, dash = false, a0 = 0, a1 = 2 * Math.PI } = {}) => ({
  param: [`${r6(cx)} + ${r6(R)}*cos(t)`, `${r6(cy)} + ${r6(R)}*sin(t)`], t: [r6(a0), r6(a1)], color, width, ...(dash ? { dash: true } : {}),
});

/**
 * Marks for a uniform field perpendicular to the page: × (into the page) or
 * • (out of it), on an nx × ny grid filling the box x0…x1, y0…y1. `skip(x, y)`
 * leaves a mark out (to keep it off a particle or a label).
 */
export function fieldMarks(x0, x1, y0, y1, nx, ny, dir = 'in', { color = COL.B, skip = () => false } = {}) {
  const out = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = nx === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (nx - 1), y = ny === 1 ? (y0 + y1) / 2 : y0 + ((y1 - y0) * j) / (ny - 1);
    if (!skip(x, y)) out.push(lab(x, y, dir === 'in' ? '×' : '•', color));
  }
  return out;
}

/** A plain picture in the page: equal axes, no grid, no numbers. */
export function page({ x, y, curves = [], points = [], arrows = [], shade = [], caption, aspect = 'wide', alt, extra = {} }) {
  return {
    type: 'graph',
    params: { x, y, aspect, equal: true, axes: false, grid: false, xlabel: '', ylabel: '', ...(alt ? { alt } : {}), curves, points, arrows, shade, ...extra },
    caption,
  };
}

/**
 * A bar magnet along x, centred at the origin (N on the right unless
 * nRight is false), with its field lines: outside, the lines of two poles at
 * ±a (exact for poles concentrated at the ends — a good picture outside a long
 * thin magnet), each launched from the N pole at an angle in `launch`
 * (degrees); inside, B runs from S back to N, closing every line.
 * Returns { curves, arrows, points, shade } to merge into a page().
 */
export function barMagnetParts({ a = 1, h = 0.3, cx = 0, cy = 0, nRight = true, launch = [50, 62, 76, 92, 112, 135], color = COL.B, labels = true, body = 'ink3' } = {}) {
  const s = nRight ? 1 : -1, half = 1.2 * a;
  const curves = [], arrows = [], points = [], shade = [];
  shade.push({ fn: `${r6(cy + h)}`, lower: `${r6(cy - h)}`, from: r6(cx - half), to: r6(cx + half), color: body, alpha: 0.5 });
  for (const d of launch) {
    const t0 = d * DEG, K = r6(1 - Math.cos(t0));
    const P = (t) => { const ts = Math.acos(Math.min(1, K + Math.cos(t))); const s1 = (2 * a * Math.sin(ts)) / Math.sin(t - ts); return [a + s1 * Math.cos(t), s1 * Math.sin(t)]; };
    const inside = ([px, py]) => Math.abs(px) <= half && Math.abs(py) <= h;
    const N = 800, ts = Array.from({ length: N + 1 }, (_, k) => t0 + ((Math.PI - t0) * k) / N);
    const out = ts.filter((t) => !inside(P(t)));
    if (!out.length) continue;
    const t1 = out[0], t2 = out[out.length - 1];
    let top = ts[0], ymax = -1;
    for (const t of out) { const [, y] = P(t); if (y > ymax) { ymax = y; top = t; } }
    const sx = `sin(acos(${K} + cos(t)))/sin(t - acos(${K} + cos(t)))`;
    for (const sy of [1, -1]) {
      curves.push({ param: [`${r6(cx)} + ${s}*(${a} + ${2 * a}*${sx}*cos(t))`, `${r6(cy)} + ${sy}*(${2 * a}*${sx}*sin(t))`], t: [r6(t1), r6(t2)], color, width: 1.8 });
      const [xm, ym] = P(top), dx = 0.16 * a;
      arrows.push({ from: [r6(cx + s * xm + s * dx), r6(cy + sy * ym)], to: [r6(cx + s * xm - s * dx), r6(cy + sy * ym)], color });
    }
  }
  // inside: from S back to N
  for (const yy of [-0.55 * h, 0.55 * h]) {
    curves.push(seg2([cx - s * half * 0.92, cy + yy], [cx + s * half * 0.92, cy + yy], { color, width: 1.6 }));
    arrows.push({ from: [r6(cx + s * 0.15 * a), r6(cy + yy)], to: [r6(cx + s * 0.45 * a), r6(cy + yy)], color });
  }
  if (labels) points.push(lab(cx + s * 0.85 * a, cy, 'N', 'ink'), lab(cx - s * 0.85 * a, cy, 'S', 'ink'));
  return { curves, arrows, points, shade };
}
