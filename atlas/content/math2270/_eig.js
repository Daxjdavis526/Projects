// Shared helpers for the change-of-basis, determinant and eigenvalue lessons
// (math2270 LA-7 to LA-9): exact small integer matrices built from a chosen
// basis and eigenvalues, determinants and cofactors of any size, and
// ready-made pictures on the ten-basis, la-det, la-map2d, graph and
// calc-vectors3d simulations. Files whose names start with "_" are helpers,
// not lessons.

import { matmul, det2, det3 } from './_la.js';

export const SUBS = '₀₁₂₃₄₅₆₇₈₉';
export const sub = (n) => String(n).replace(/\d/g, (d) => SUBS[d]);
/** A number for a canvas label: plain text with a real minus sign. */
export const plain = (x) => {
  const r = Math.round(x);
  const s = Math.abs(x - r) < 1e-9 ? String(r) : String(+x.toFixed(2));
  return s.replace('-', '−');
};

// ── matrices ──
export const I2 = [[1, 0], [0, 1]];
export const inv2 = (A) => { const d = det2(A); return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; };
export const powM = (A, k) => { let R = A.map((row, i) => row.map((_, j) => (i === j ? 1 : 0))); for (let n = 0; n < k; n++) R = matmul(R, A); return R; };
export const trace = (A) => A.reduce((s, row, i) => s + row[i], 0);
export const col = (A, j) => A.map((row) => row[j]);
export const fromCols = (cols) => cols[0].map((_, i) => cols.map((c) => c[i]));
/** A with row i and column j deleted. */
export const minorMat = (A, i, j) => A.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
/** The determinant of any square matrix, by cofactor expansion along the first row (small n only). */
export function detN(A) {
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return det2(A);
  if (n === 3) return det3(A);
  return A[0].reduce((s, a, j) => s + (a === 0 ? 0 : (j % 2 ? -1 : 1) * a * detN(minorMat(A, 0, j))), 0);
}
export const minor = (A, i, j) => detN(minorMat(A, i, j));
export const cofactor = (A, i, j) => ((i + j) % 2 ? -1 : 1) * minor(A, i, j);
export const cofactorMatrix = (A) => A.map((row, i) => row.map((_, j) => cofactor(A, i, j)));

/** A random 2×2 integer matrix with determinant ±1 (so its inverse is integer too), not the identity or a plain swap. */
export function unimodular(r, { range = 3, det = null } = {}) {
  for (let k = 0; k < 500; k++) {
    const P = [[r.int(-range, range), r.int(-range, range)], [r.int(-range, range), r.int(-range, range)]];
    const d = det2(P);
    if (!(d === 1 || d === -1) || (det !== null && d !== det)) continue;
    if (P.flat().filter((v) => v !== 0).length < 3) continue;
    return P;
  }
  return [[2, 1], [1, 1]];
}

/**
 * A 2×2 integer matrix A = P D P⁻¹ with integer eigenvalues lams and integer
 * eigenvectors (the columns of P, det P = ±1). Returns { A, P, Pinv, D, lams, vecs }.
 */
export function withEigen(r, lams, opts = {}) {
  for (let k = 0; k < 500; k++) {
    const P = unimodular(r, opts), D = [[lams[0], 0], [0, lams[1]]], Pinv = inv2(P).map((row) => row.map((v) => Math.round(v)));
    const A = matmul(matmul(P, D), Pinv);
    if (Math.max(...A.flat().map(Math.abs)) > (opts.max ?? 9)) continue;
    if (A[0][1] === 0 && A[1][0] === 0) continue;
    return { A, P, Pinv, D, lams: lams.slice(), vecs: [col(P, 0), col(P, 1)] };
  }
  const P = [[1, 1], [0, 1]], Pinv = [[1, -1], [0, 1]], D = [[lams[0], 0], [0, lams[1]]];
  return { A: matmul(matmul(P, D), Pinv), P, Pinv, D, lams: lams.slice(), vecs: [[1, 0], [1, 1]] };
}

/** Real eigenvalues of a 2×2 (largest first), or null when they are complex. */
export function eigvals2(A) {
  const tr = A[0][0] + A[1][1], d = det2(A), disc = tr * tr - 4 * d;
  if (disc < -1e-12) return null;
  const s = Math.sqrt(Math.max(0, disc));
  return [(tr + s) / 2, (tr - s) / 2];
}

/** The simplest integer vector along v (divides out common factors; first nonzero entry positive). */
export function intDir(v) {
  const g = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const k = v.reduce((s, x) => g(s, Math.round(x)), 0) || 1;
  const w = v.map((x) => Math.round(x) / k), f = w.find((x) => x !== 0);
  return f < 0 ? w.map((x) => -x) : w;
}

// ── pictures ──
/** An arrow and a basis on ten-basis: numbers hidden, nothing draggable unless asked. */
export const basisPic = (basis, vector, { caption, names = ['b₁', 'b₂'], vname = 'x', readout = false, construction = false, grid = 'basis', drag = false, ...rest } = {}) => ({
  type: 'ten-basis',
  params: { mode: 'vector', basis, vector, names, vname, vtex: '\\mathbf x', readout, construction, grid, dragVector: drag, dragBasis: drag, ...rest },
  ...(caption ? { caption } : {}),
});

/** The determinant picture on la-det; numbers hidden unless asked. */
export const detPic = (cols, { caption, readout = false, ...rest } = {}) => ({
  type: 'la-det',
  params: { cols, readout, ...rest },
  ...(caption ? { caption } : {}),
});

/** The parallelepiped on edges u, v, w (from the origin) on calc-vectors3d: the three edge arrows and six faces. */
export function box3(u, v, w, { caption, color = 'accent', labels = ['\\mathbf u', '\\mathbf v', '\\mathbf w'], range, extra = {} } = {}) {
  const add = (a, b) => a.map((x, k) => x + b[k]);
  const faces = [[[0, 0, 0], u, v], [w, u, v], [[0, 0, 0], u, w], [v, u, w], [[0, 0, 0], v, w], [u, v, w]]
    .map(([at, a, b]) => ({ at, u: a, v: b, color, alpha: 0.13 }));
  const R = range ?? Math.max(2, Math.ceil(Math.max(...add(add(u, v), w).map(Math.abs), ...[u, v, w].flat().map(Math.abs)) + 0.5));
  return {
    type: 'calc-vectors3d',
    params: {
      range: R,
      vectors: [{ to: u, color: 'good', label: labels[0] }, { to: v, color: 'warn', label: labels[1] }, { to: w, color: 'violet', label: labels[2] }],
      parallelograms: faces, ...extra,
    },
    caption: caption || 'The parallelepiped on the three edge vectors (faces tinted). Drag to rotate.',
  };
}

/**
 * A matrix drawn as a board of numbers on the graph sim. cross: [i, j] strikes
 * out row i and column j (0-based) to show the minor; ring: [[i, j], …] rings
 * entries in gold; signs: true writes the cofactor checkerboard (+ −) beside
 * each entry.
 */
export function board(M, { cross = null, ring = [], signs = false, caption, dim = [] } = {}) {
  const n = M.length, m = M[0].length, gap = 1;
  const X = (j) => j * gap, Y = (i) => (n - 1 - i) * gap * 0.8;
  const struck = (i, j) => cross && (i === cross[0] || j === cross[1]);
  const points = [];
  M.forEach((row, i) => row.forEach((v, j) => {
    const faint = struck(i, j) || dim.some(([a, b]) => a === i && b === j);
    points.push({ x: X(j), y: Y(i), r: 0, label: plain(v), labelAlign: 'center', labelDx: 0, labelDy: 0, color: faint ? 'ink4' : 'ink' });
    if (signs) points.push({ x: X(j) + 0.32, y: Y(i) + 0.22, r: 0, label: (i + j) % 2 ? '−' : '+', labelAlign: 'center', labelDx: 0, labelDy: 0, color: (i + j) % 2 ? 'bad' : 'good' });
  }));
  for (const [i, j] of ring) points.push({ x: X(j), y: Y(i), r: 15, color: 'gold' }, { x: X(j), y: Y(i), r: 12.5, color: 'panel' }, { x: X(j), y: Y(i), r: 0, label: plain(M[i][j]), labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' });
  const curves = [];
  if (cross) {
    curves.push({ param: [`t`, `${Y(cross[0])}`], t: [-0.45, X(m - 1) + 0.45], color: 'bad', width: 2.5, dash: [6, 4] });
    curves.push({ param: [`${X(cross[1])}`, `t`], t: [-0.4, Y(0) + 0.4], color: 'bad', width: 2.5, dash: [6, 4] });
  }
  // brackets
  const top = Y(0) + 0.45, bot = -0.45, L = -0.6, R = X(m - 1) + 0.6;
  for (const [x, dx] of [[L, 0.15], [R, -0.15]]) {
    curves.push({ param: [`${x}`, 't'], t: [bot, top], color: 'ink3', width: 1.6 });
    curves.push({ param: ['t', `${top}`], t: dx > 0 ? [x, x + dx] : [x + dx, x], color: 'ink3', width: 1.6 });
    curves.push({ param: ['t', `${bot}`], t: dx > 0 ? [x, x + dx] : [x + dx, x], color: 'ink3', width: 1.6 });
  }
  const w = R - L, h = top - bot;
  const half = Math.max(w / 2 / 2, h / 2) + 0.35;          // a 2:1 window holding the board
  const cx = (L + R) / 2, cy = (top + bot) / 2;
  return {
    type: 'graph',
    params: { x: [cx - 2 * half, cx + 2 * half], y: [cy - half, cy + half], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0, points, curves },
    caption: caption || 'The matrix, entry by entry.',
  };
}

/** The lattice of a basis b₁, b₂ on the graph sim: lines c₁ = const and c₂ = const, the two basis arrows, optional extra arrows and points. */
export function latticePic(b1, b2, { k = 5, fit = [], arrows = [], points = [], caption, names = ['b₁', 'b₂'] } = {}) {
  // a 2:1 window centred on the origin that holds the basis and whatever else must fit
  const pts = [b1, b2, ...fit, ...arrows.flatMap((a) => [a.from, a.to]), ...points.map((p) => [p.x, p.y])];
  const h = Math.max(2.5, ...pts.map((p) => Math.abs(p[1]) + 0.8), ...pts.map((p) => Math.abs(p[0]) / 2 + 0.8));
  const x = [-2 * h, 2 * h], y = [-h, h];
  const curves = [];
  for (let i = -k; i <= k; i++) {
    curves.push({ param: [`${i}*(${b1[0]}) + t*(${b2[0]})`, `${i}*(${b1[1]}) + t*(${b2[1]})`], t: [-3 * k, 3 * k], color: 'accent', width: i === 0 ? 1.4 : 0.8, dash: i === 0 ? [] : [3, 4] });
    curves.push({ param: [`t*(${b1[0]}) + ${i}*(${b2[0]})`, `t*(${b1[1]}) + ${i}*(${b2[1]})`], t: [-3 * k, 3 * k], color: 'violet', width: i === 0 ? 1.4 : 0.8, dash: i === 0 ? [] : [3, 4] });
  }
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', equal: true, xlabel: '', ylabel: '', grid: false, curves,
      arrows: [{ from: [0, 0], to: b1, color: 'good', width: 3, label: names[0] }, { from: [0, 0], to: b2, color: 'warn', width: 3, label: names[1] }, ...arrows],
      points,
    },
    caption: caption || 'The b-lattice: blue lines have a fixed first coordinate, violet ones a fixed second coordinate.',
  };
}
