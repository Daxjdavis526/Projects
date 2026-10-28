// Shared helpers for the first Calculus III lessons (C3-0 … C3-2): vector
// arithmetic and TeX (re-exported from the Calculus II vector helpers),
// points, planes and lines as TeX, static pictures of graphs z = f(x, y) on
// surface3d with their traces, and a way to pick one branch of an expression
// from a choice. Files whose names start with "_" are helpers, not lessons.

import { nice } from '../../src/core/format.js';
import { add, sub, scale, dot, cross, norm } from '../math1220/_vectors.js';

export { add, sub, scale, dot, cross, norm, deg, vecTeX, QUADS, TRIPLES, signed } from '../math1220/_vectors.js';

/** (1, −2, 3) as TeX; numbers pass through nice(). */
export const pointTeX = (p) => `(${p.map((x) => (typeof x === 'number' ? nice(x) : x)).join(', ')})`;

/** The unit vector along v. */
export const unit = (v) => scale(v, 1 / norm(v));

/** Scalar triple product a · (b × c). */
export const triple = (a, b, c) => dot(a, cross(b, c));

/**
 * 1 when the choice `key` equals j, else 0 — so one expression can hold
 * several branches. Every branch must stay finite when it is not picked:
 * 0 · NaN is still NaN.
 */
export const is = (key, j) => `step(0.5 - abs(${key} - ${j}))`;
export const pickExpr = (key, branches) => branches.map((b, j) => `${is(key, j)}*(${b})`).join(' + ');

/** a·x + b·y + c·z = d as text that is both TeX and answer syntax ("2x - y + 3z = 7"). */
export function planeEq(n, d, names = ['x', 'y', 'z']) {
  let s = '';
  n.forEach((c, k) => {
    if (!c) return;
    const v = names[k], mag = Math.abs(c), body = mag === 1 ? v : `${nice(mag)}${v}`;
    s += s ? ` ${c < 0 ? '-' : '+'} ${body}` : `${c < 0 ? '-' : ''}${body}`;
  });
  return `${s || '0'} = ${typeof d === 'number' ? nice(d) : d}`;
}

/** A signed term "+ 3x", "- x", "" for 0 (the first term without a leading plus). */
export function sterm(c, v, first = false) {
  if (!c) return '';
  const mag = Math.abs(c), body = v && mag === 1 ? v : `${nice(mag)}${v}`;
  return first ? `${c < 0 ? '-' : ''}${body}` : ` ${c < 0 ? '-' : '+'} ${body}`;
}

/** x = x₀ + at, … for a line through P along v, as TeX. */
export const lineTeX = (P, v, par = 't') => ['x', 'y', 'z'].map((name, k) => {
  const p = P[k], c = v[k];
  const tt = c === 0 ? '' : c === 1 ? par : c === -1 ? `-${par}` : `${nice(c)}${par}`;
  const rhs = p === 0 ? (tt || '0') : tt ? `${nice(p)} ${tt.startsWith('-') ? '-' : '+'} ${tt.replace(/^-/, '')}` : nice(p);
  return `${name} = ${rhs}`;
}).join(',\\quad ');

/**
 * A static picture of the graph z = f(x, y) on surface3d. `f` is a template
 * (x, y) => expression string, so a trace can substitute into it:
 * traces: [{ y: b }] draws the curve where the plane y = b cuts the graph
 * (gold), [{ x: a }] the cut by x = a (violet). zs scales every height
 * (the traces too, which surface3d itself does not scale).
 */
export function graphOf(f, { domain = [[-2, 2], [-2, 2]], disk = null, traces = [], zs = 1, curves = [], caption = 'Drag to rotate.', ...view } = {}) {
  const Z = (x, y) => (zs === 1 ? f(x, y) : `${zs}*(${f(x, y)})`);
  // a function defined only on a disk or ellipse (|x| ≤ A, |y| ≤ B) is drawn on a
  // polar grid, so the edge of the graph is smooth rather than a staircase
  const [A, B] = disk || [];
  const surf = disk
    ? { surface: [`${A}*u*cos(v)`, `${B}*u*sin(v)`, Z(`(${A}*u*cos(v))`, `(${B}*u*sin(v))`)], domain: [[0, 0.9995], [0, 2 * Math.PI]] }
    : { z: f('x', 'y'), zscale: zs, domain };
  const ext = disk ? [[-A, A], [-B, B]] : domain;
  return {
    type: 'surface3d',
    params: {
      ...surf, ...view,
      curves: [...traces.map((tr) => (tr.y !== undefined
        ? { param: ['t', `${tr.y}`, Z('t', `(${tr.y})`)], t: ext[0], color: tr.color || 'gold' }
        : { param: [`${tr.x}`, 't', Z(`(${tr.x})`, 't')], t: ext[1], color: tr.color || 'violet' })), ...curves],
    },
    caption,
  };
}

/**
 * A graph z = f(x, y) over any rectangle [x0, x1] × [y0, y1], drawn on a
 * display box [0, 4] × [0, 4] with heights scaled so the top is at `top`:
 * for physical functions whose units do not fit one cube. The axes start at
 * the corner (x0, y0). traces as in graphOf, in the function's own units.
 */
export function boxGraph(f, [x0, x1], [y0, y1], { zmax, top = 3, traces = [], labels = ['x', 'y', 'z'], caption = 'Drag to rotate.', ...view } = {}) {
  const k = top / zmax;
  const X = (u) => `(${x0} + ${x1 - x0}*${u}/4)`, Y = (v) => `(${y0} + ${y1 - y0}*${v}/4)`;
  return {
    type: 'surface3d',
    params: {
      surface: ['u', 'v', `${k}*(${f(X('u'), Y('v'))})`], domain: [[0, 4], [0, 4]],
      axisLen: 4.6, axisLabels: labels, target: [2, 2, top / 3], dist: 11, yaw: -2.8, pitch: 0.35, ...view,
      curves: traces.map((tr) => (tr.y !== undefined
        ? { param: ['t', `${(4 * (tr.y - y0)) / (y1 - y0)}`, `${k}*(${f(X('t'), `(${tr.y})`)})`], t: [0, 4], color: tr.color || 'gold' }
        : { param: [`${(4 * (tr.x - x0)) / (x1 - x0)}`, 't', `${k}*(${f(`(${tr.x})`, Y('t'))})`], t: [0, 4], color: tr.color || 'violet' })),
    },
    caption,
  };
}

/** The distance between two points. */
export const dist = (P, Q) => norm(sub(Q, P));

/** The point a fraction s of the way from P to Q. */
export const lerp = (P, Q, s) => add(P, scale(sub(Q, P), s));

/** Component-wise sum of two vectors whose entries may be numbers or expression strings. */
export const vsum = (u, v) => u.map((x, k) => (typeof x === 'number' && typeof v[k] === 'number' ? x + v[k] : `(${x}) + (${v[k]})`));

/**
 * calc-vectors3d params for the parallelepiped spanned by a, b, c (numbers or
 * expressions): the three faces at the origin, the three opposite faces
 * fainter, and the three edge vectors with labels.
 */
export function box(a, b, c, { labels = ['\\vec a', '\\vec b', '\\vec c'], colors = ['accent', 'warn', 'good'], face = 'gold' } = {}) {
  return {
    parallelograms: [
      { u: a, v: b, color: face, alpha: 0.22 }, { u: b, v: c, color: 'violet', alpha: 0.14 }, { u: a, v: c, color: 'violet', alpha: 0.14 },
      { at: c, u: a, v: b, color: face, alpha: 0.1 }, { at: a, u: b, v: c, color: 'violet', alpha: 0.07 }, { at: b, u: a, v: c, color: 'violet', alpha: 0.07 },
    ],
    vectors: [a, b, c].map((to, k) => ({ to, color: colors[k], label: labels[k] })),
  };
}

/** a · (b × c) as an expression, for entries that may be numbers or expression strings. */
export const tripleExpr = (a, b, c) => {
  const m = (x, y) => `(${x})*(${y})`;
  return `(${a[0]})*(${m(b[1], c[2])} - ${m(b[2], c[1])}) - (${a[1]})*(${m(b[0], c[2])} - ${m(b[2], c[0])}) + (${a[2]})*(${m(b[0], c[1])} - ${m(b[1], c[0])})`;
};
