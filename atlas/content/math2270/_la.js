// Shared helpers for the Linear Algebra lessons (math2270): exact small
// linear algebra, vectors and matrices as TeX, and ready-made pictures on the
// la-vectors, la-rowreduce, la-map2d, graph and calc-vectors3d simulations.
// Files whose names start with "_" are helpers, not lessons.

import { nice, frac } from '../../src/core/format.js';

// ── arithmetic (floats; the test checks every key) ──
export const dot = (u, v) => u.reduce((s, x, k) => s + x * v[k], 0);
export const norm = (u) => Math.sqrt(dot(u, u));
export const add = (u, v) => u.map((x, k) => x + v[k]);
export const sub = (u, v) => u.map((x, k) => x - v[k]);
export const scale = (u, s) => u.map((x) => x * s);
export const matvec = (A, x) => A.map((row) => dot(row, x));
export const matmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
export const transpose = (A) => A[0].map((_, j) => A.map((row) => row[j]));
export const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
export const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
export const deg = (r) => (r * 180) / Math.PI;
export const angleDeg = (u, v) => deg(Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (norm(u) * norm(v))))));
export const isInt = (x) => Math.abs(x - Math.round(x)) < 1e-9;

/** Solve a square system by Gaussian elimination with partial pivoting (floats). */
export function solve(A, b) {
  const n = A.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) { const f = M[i][c] / M[c][c]; for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) x[i] = (M[i][n] - M[i].slice(i + 1, n).reduce((s, v, k) => s + v * x[i + 1 + k], 0)) / M[i][i];
  return x;
}
/** The inverse of a square matrix (floats). */
export const inverse = (A) => { const n = A.length, cols = A.map((_, j) => solve(A, A.map((__, i) => (i === j ? 1 : 0)))); return Array.from({ length: n }, (_, i) => cols.map((c) => c[i])); };

// ── TeX ──
/** A number as TeX: an integer, a fraction if it is a simple one, else a short decimal. */
export const qt = (x) => (isInt(x) ? String(Math.round(x)) : frac(x, 200).includes('frac') ? frac(x, 200) : nice(x));
export const colTeX = (v) => `\\begin{bmatrix} ${v.map(qt).join(' \\\\ ')} \\end{bmatrix}`;
export const tupleTeX = (v) => `(${v.map(qt).join(',\\ ')})`;
export const matTeX = (A) => `\\begin{bmatrix} ${A.map((row) => row.map(qt).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
/** An augmented matrix [A | b] from rows that end with the right-hand side (rhs: how many columns after the bar). */
export const augTeX = (M, rhs = 1) => `\\left[\\begin{array}{${'r'.repeat(M[0].length - rhs)}|${'r'.repeat(rhs)}} ${M.map((row) => row.map(qt).join(' & ')).join(' \\\\ ')} \\end{array}\\right]`;
/** One equation a₁x + a₂y + … = c as TeX, terms in order, zeros left out. */
export function eqTeX(row, vars = ['x', 'y', 'z']) {
  const n = row.length - 1;
  let s = '';
  for (let j = 0; j < n; j++) {
    const c = row[j];
    if (Math.abs(c) < 1e-12) continue;
    const mag = Math.abs(c), body = isInt(mag) && Math.round(mag) === 1 ? vars[j] : `${qt(mag)}${vars[j]}`;
    s += s ? (c < 0 ? ` - ${body}` : ` + ${body}`) : c < 0 ? `-${body}` : body;
  }
  return `${s || '0'} = ${qt(row[n])}`;
}
/** A whole system, aligned at the equals signs. */
export const sysTeX = (M, vars) => `\\begin{aligned} ${M.map((row) => eqTeX(row, vars).replace(' = ', ' &= ')).join(' \\\\ ')} \\end{aligned}`;
/** The same equation in the Atlas answer syntax (for expr items in 'equation' mode). */
export function eqText(row, vars = ['x', 'y', 'z']) {
  const n = row.length - 1;
  let s = '';
  for (let j = 0; j < n; j++) {
    const c = row[j];
    if (Math.abs(c) < 1e-12) continue;
    const mag = Math.abs(c), body = mag === 1 ? vars[j] : `${nice(mag)}*${vars[j]}`;
    s += s ? (c < 0 ? ` - ${body}` : ` + ${body}`) : c < 0 ? `-${body}` : body;
  }
  return `${s || '0'} = ${nice(row[n])}`;
}

// ── pictures ──
/** Stem plots of vectors in Rⁿ on la-vectors; plane: false and readout: false unless asked. */
export const stems = (vectors, { caption, labels, plane = false, readout = false, xlabel, ...rest } = {}) => ({
  type: 'la-vectors',
  params: { vectors: vectors.map(([name, values, color]) => ({ name, values, color })), labels, plane, readout, xlabel: xlabel ?? 'component', ...rest },
  caption: caption || 'One stem per component: its height is that component’s value.',
});

/** A matrix on la-rowreduce as a still picture (no stepping, nothing solved) unless asked. */
export const rr = (M, { caption, stepper = false, solution = false, readout = false, ...rest } = {}) => ({
  type: 'la-rowreduce',
  params: { M, stepper, solution, readout, ...rest },
  ...(caption ? { caption } : {}),
});

/** A 2×2 map on la-map2d, numbers hidden unless asked. */
export const map2d = (A, { caption, readout = false, ...rest } = {}) => ({
  type: 'la-map2d',
  params: { A, readout, ...rest },
  ...(caption ? { caption } : {}),
});

const LINE_COLORS = ['accent', 'warn', 'good', 'violet'];
/**
 * Rows [a, b, c] (a x + b y = c) as lines on the graph sim, with labels and an
 * optional marked point; x, y: the window.
 */
export function lines2(rows, { x = [-5, 5], y = [-3.5, 3.5], point = null, names, caption, xlabel = 'x', ylabel = 'y', aspect = 'wide' } = {}) {
  const curves = rows.map(([a, b, c], k) => {
    const color = LINE_COLORS[k % LINE_COLORS.length], label = names ? names[k] : `R${'₁₂₃₄'[k]}`;
    if (Math.abs(b) > 1e-12) {
      // label near the right end of the window, kept inside it
      let at = x[0] + 0.86 * (x[1] - x[0]);
      const yAt = (t) => (c - a * t) / b;
      if (yAt(at) > y[1] - 0.3 || yAt(at) < y[0] + 0.3) { const target = yAt(at) > y[1] ? y[1] - 0.6 : y[0] + 0.6; at = (c - b * target) / a; }
      return { fn: `(${c} - (${a})*x)/(${b})`, color, label, labelAt: at };
    }
    return { param: [`${c / a}`, 't'], t: [y[0], y[1]], color, label, labelAt: y[0] + 0.85 * (y[1] - y[0]) };
  });
  return {
    type: 'graph',
    params: { x, y, aspect, equal: true, xlabel, ylabel, curves, points: point ? [{ x: point[0], y: point[1], color: 'gold', r: 5.5 }] : [] },
    caption: caption || 'Each equation is a line; a solution is a point on every line at once.',
  };
}

const PLANE_COLORS = ['accent', 'warn', 'good', 'violet'];
/** Rows [a, b, c, d] (a x + b y + c z = d) as planes on calc-vectors3d, patches centred near `centre`. */
export function planes3(rows, { centre = [0, 0, 0], size = 2.6, range = 3, point = null, line = null, caption, extra = {} } = {}) {
  const planes = rows.map(([a, b, c, d], k) => {
    const n = [a, b, c], t = (d - dot(n, centre)) / dot(n, n);
    return { normal: n, centre: add(centre, scale(n, t)), size, color: PLANE_COLORS[k % PLANE_COLORS.length], alpha: 0.24, label: `R_${k + 1}` };
  });
  return {
    type: 'calc-vectors3d',
    params: { range, planes, points: point ? [{ at: point, color: 'gold' }] : [], lines: line ? [{ point: line[0], dir: line[1], t: [-3, 3], color: 'gold' }] : [], ...extra },
    caption: caption || 'Each equation is a plane (a square patch of it is drawn; planes go on for ever). Drag to rotate.',
  };
}
