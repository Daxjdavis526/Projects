// Helpers for the Linear Algebra lessons on maps and subspaces (LA-4 to LA-6):
// exact subspace bases for generators (through model/la-subspaces.js), arrow
// pictures on the graph sim, and the la-subspaces “big picture”. Files whose
// names start with "_" are helpers, not lessons.

import * as SUB from '../../src/viz/model/la-subspaces.js';
import { qval } from '../../src/viz/model/la-linear.js';

/** The four subspaces with plain-number bases: { m, n, rank, pivotCols, freeCols, R, col, null, row, left }. */
export function spaces(M) {
  const s = SUB.fourSubspaces(M);
  const nums = (b) => b.map((v) => v.map(qval));
  return { ...s, R: s.R.map((row) => row.map(qval)), col: nums(s.col), null: nums(s.null), row: nums(s.row), left: nums(s.left) };
}
export const rank = (M) => SUB.fourSubspaces(M).rank;
/** The RREF as plain numbers. */
export const rrefOf = (M) => spaces(M).R;

/**
 * Arrows in the plane on the graph sim, equal axes, window fitted to them.
 * list: [{ to: [x, y], from: [x, y], color, label, dash (bool), width, labelDx, labelDy, labelAlign }]
 */
export function arrows2(list, { caption, points = [], curves = [], pad = 0.9, x, y, aspect = 'wide', grid = true, axes = true } = {}) {
  const xs = [0], ys = [0];
  for (const a of list) { xs.push(a.to[0], (a.from || [0, 0])[0]); ys.push(a.to[1], (a.from || [0, 0])[1]); }
  for (const p of points) { xs.push(p.x); ys.push(p.y); }
  const win = x && y ? { x, y } : { x: [Math.min(...xs) - pad, Math.max(...xs) + pad], y: [Math.min(...ys) - pad, Math.max(...ys) + pad] };
  return {
    type: 'graph',
    params: {
      ...win, aspect, equal: true, grid, axes, xlabel: '', ylabel: '',
      arrows: list.map(({ dash, ...a }) => ({ from: a.from || [0, 0], ...a, ...(dash ? { dash: [6, 4] } : {}) })),
      points, curves,
    },
    ...(caption ? { caption } : {}),
  };
}

/** The four-subspaces picture of a matrix (bases listed unless readout says otherwise). */
export const big = (A, { caption, ...rest } = {}) => ({ type: 'la-subspaces', params: { A, ...rest }, ...(caption ? { caption } : {}) });
/** The counting picture from a shape and rank alone. */
export const shape = (m, n, r, { caption, ...rest } = {}) => ({ type: 'la-subspaces', params: { m, n, r, readout: false, ...rest }, ...(caption ? { caption } : {}) });
