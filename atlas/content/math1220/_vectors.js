// Shared helpers for the vector lessons (C2-7.x): vector arithmetic, vectors
// as TeX, integer vectors with whole-number lengths (so answers stay clean),
// and ready-made pictures — to-scale 2D arrows on the graph sim and 3D scenes
// on calc-vectors3d. Files whose names start with "_" are helpers, not lessons.

import { nice } from '../../src/core/format.js';

export const add = (a, b) => a.map((x, k) => x + b[k]);
export const sub = (a, b) => a.map((x, k) => x - b[k]);
export const scale = (a, s) => a.map((x) => x * s);
export const dot = (a, b) => a.reduce((s, x, k) => s + x * b[k], 0);
export const norm = (a) => Math.sqrt(dot(a, a));
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const deg = (r) => (r * 180) / Math.PI;

/** ⟨1, −2, 3⟩ as TeX; numbers pass through nice(), strings are used as written. */
export const vecTeX = (v) => `\\langle ${v.map((x) => (typeof x === 'number' ? nice(x) : x)).join(', ')} \\rangle`;

/** Integer 2D vectors with whole-number lengths: [x, y, length]. */
export const TRIPLES = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [6, 8, 10], [8, 6, 10], [7, 24, 25]];
/** Integer 3D vectors with whole-number lengths: [x, y, z, length]. */
export const QUADS = [[1, 2, 2, 3], [2, 1, 2, 3], [2, 3, 6, 7], [3, 6, 2, 7], [6, 2, 3, 7], [1, 4, 8, 9], [4, 4, 7, 9], [8, 4, 1, 9], [2, 6, 9, 11], [6, 6, 7, 11], [9, 2, 6, 11], [3, 4, 12, 13], [4, 12, 3, 13], [2, 10, 11, 15]];

/** A random sign pattern applied to a vector. */
export const signed = (r, v) => v.map((x) => x * r.sign());

/**
 * A to-scale 2D picture on the graph sim: arrows [{ from, to, color, label }],
 * with equal axes framing every arrow. Labels are plain text on the canvas.
 */
export function arrows2D(arrows, { caption, pad = 1, xlabel, ylabel, aspect } = {}) {
  const xs = arrows.flatMap((a) => [(a.from || [0, 0])[0], a.to[0]]), ys = arrows.flatMap((a) => [(a.from || [0, 0])[1], a.to[1]]);
  const span = (v) => [Math.min(0, ...v) - pad, Math.max(0, ...v) + pad];
  return {
    type: 'graph',
    params: {
      x: span(xs), y: span(ys), equal: true, aspect, xlabel, ylabel,
      arrows: arrows.map((a) => ({ from: a.from || [0, 0], to: a.to, color: a.color || 'accent', label: a.label })),
    },
    caption: caption || 'Arrows drawn to scale.',
  };
}

/** A 3D scene on calc-vectors3d showing fixed vectors from the origin (or from `from`). */
export function arrows3D(vectors, { caption, range, extra = {} } = {}) {
  const R = range || Math.max(2, Math.ceil(Math.max(...vectors.flatMap((v) => [...v.to, ...(v.from || [])].map(Math.abs))) + 0.5));
  return {
    type: 'calc-vectors3d',
    params: { range: R, vectors: vectors.map((v) => ({ color: 'accent', ...v })), ...extra },
    caption: caption || 'Drag to rotate. Arrows are to scale in the units of the axes.',
  };
}
