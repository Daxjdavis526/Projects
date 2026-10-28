// Helpers for the DE-4 (linear systems) and DE-5 (nonlinear systems) lessons
// of MATH 2280: matrices and vectors as TeX, numbers for canvas labels, and
// phase-portrait pictures for problems (the de-plane and de-tracedet sims).
import { nice } from '../../src/core/format.js';
export { eig2, classify2, expm2, equilibria, jacobian, trajectory } from '../../src/viz/model/de-plane.js';

/** Round for a sim parameter or a printed key: 6 significant figures, as a number. */
export const r6 = (v) => +(+v).toPrecision(6);

/** A number in TeX: integers and short decimals exactly, otherwise 4 significant figures. */
export const n = (x) => nice(r6(x));

/** A 2×2 (or n×n) matrix in TeX: M([[1, 2], [3, 4]]) → \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}. */
export const M = (A, f = n) => `\\begin{bmatrix} ${A.map((row) => row.map((v) => (typeof v === 'number' ? f(v) : v)).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;

/** A column vector in TeX. */
export const V = (v, f = n) => `\\begin{bmatrix} ${v.map((x) => (typeof x === 'number' ? f(x) : x)).join(' \\\\ ')} \\end{bmatrix}`;

/** A number for a canvas label: a true minus sign, up to 3 significant figures. */
export const lab = (x, d = 3) => String(+(+x).toPrecision(d)).replace(/-/g, '−');

/** A signed TeX term " + 3t" / " - t" / " - 2" (body '' for a constant); zero gives ''. */
export function sg(c, body = '') {
  if (c === 0) return '';
  const mag = Math.abs(c);
  const m = body && mag === 1 ? '' : n(mag);
  return `${c < 0 ? ' - ' : ' + '}${m}${body}`;
}

/** The leading term of a TeX sum: "3t", "-t", "2". */
export function lead(c, body = '') {
  const mag = Math.abs(c);
  const m = body && mag === 1 ? '' : n(mag);
  return `${c < 0 ? '-' : ''}${m}${body}`;
}

/**
 * A static phase portrait of x′ = Ax for a problem: direction arrows,
 * trajectories from `seeds`, no readout (it would print the type).
 */
export function portrait(A, { x = [-3, 3], y = [-3, 3], seeds = [[2, 1], [-2, -1], [1, -2], [-1, 2]], eigen = false, points = [], curves = [], caption, xlabel = 'x₁', ylabel = 'x₂', aspect = 'wide', equal = true, grid = 17 } = {}) {
  return {
    type: 'de-plane',
    params: { matrix: A, x, y, seeds, eigen, points, curves, xlabel, ylabel, aspect, equal, grid, readout: false, click: false },
    caption: caption || 'The phase portrait: arrows show direction only; trajectories are traced numerically, arrowheads forward in time.',
  };
}

/** A static phase portrait of a nonlinear system for a problem. */
export function plane(fx, fy, { x = [-3, 3], y = [-3, 3], seeds = [], points = [], curves = [], nullclines = false, equilibria = false, levels = null, caption, xlabel = 'x', ylabel = 'y', aspect = 'wide', equal = true, grid = 17, T = 30, constants } = {}) {
  const params = { fx, fy, x, y, seeds, points, curves, nullclines, equilibria, xlabel, ylabel, aspect, equal, grid, T, readout: false, click: false };
  if (levels) params.levels = levels;
  if (constants) params.constants = constants;
  return { type: 'de-plane', params, caption: caption || 'Arrows show direction only; trajectories are traced numerically, arrowheads forward in time.' };
}
