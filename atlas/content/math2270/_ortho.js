// Helpers for the orthogonality, symmetric-matrix and SVD lessons (math2270
// LA-10 to LA-12): projections, Gram–Schmidt, least squares, symmetric 2×2
// eigenproblems and quadratic forms, computed in floats (the content test
// checks every key), and ready-made pictures on the graph, calc-vectors3d,
// c3-contour and la-svd simulations. Files whose names start with "_" are
// helpers, not lessons.

import { dot, norm, sub, scale, add, solve, transpose, matmul, matvec } from './_la.js';

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** The projection of b onto the line through a. */
export const projLine = (a, b) => scale(a, dot(a, b) / dot(a, a));
/** The projection of b onto the column space of A (columns given as a list): x̂ from AᵀA x̂ = Aᵀb, p = A x̂. */
export function projCols(cols, b) {
  const A = transpose(cols), At = cols, xhat = solve(matmul(At, A), matvec(At, b));
  return { xhat, p: matvec(A, xhat), e: sub(b, matvec(A, xhat)) };
}
/** Classical Gram–Schmidt on a list of independent vectors: { Q (list of columns), R (rows) }. */
export function gramSchmidt(cols) {
  const Q = [], n = cols.length, R = Array.from({ length: n }, () => new Array(n).fill(0));
  cols.forEach((a, j) => {
    let w = a.slice();
    for (let i = 0; i < Q.length; i++) { R[i][j] = dot(Q[i], a); w = sub(w, scale(Q[i], R[i][j])); }
    R[j][j] = norm(w);
    Q.push(scale(w, 1 / R[j][j]));
  });
  return { Q, R };
}
/** Least squares: the design matrix rows, data b, optional weights w (1/σ²). Returns x̂, the normal matrix N = AᵀWA, the right side AᵀWb, residuals. */
export function lsq(rows, b, w = null) {
  const W = w || rows.map(() => 1);
  const n = rows[0].length;
  const N = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => rows.reduce((s, r, k) => s + W[k] * r[i] * r[j], 0)));
  const rhs = Array.from({ length: n }, (_, i) => rows.reduce((s, r, k) => s + W[k] * r[i] * b[k], 0));
  const xhat = solve(N, rhs);
  const res = rows.map((r, k) => b[k] - dot(r, xhat));
  return { xhat, N, rhs, res, ss: res.reduce((s, e, k) => s + W[k] * e * e, 0) };
}

/** Eigen of a symmetric 2×2 [[a, b], [b, c]]: { l: [λ₁ ≥ λ₂], q: [q₁, q₂] unit, theta (q₁'s angle, rad) }. */
export function eigSym2(A) {
  const [[a, b], [, c]] = A, m = (a + c) / 2, r = Math.hypot((a - c) / 2, b);
  const theta = 0.5 * Math.atan2(2 * b, a - c);
  return { l: [m + r, m - r], q: [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]], theta };
}
/**
 * A random symmetric integer 2×2 [[p, q], [q, r]] (q ≠ 0) with integer
 * eigenvalues: (p − r)² + 4q² must be a perfect square. opts: range of
 * entries, sign: 'pos' (positive definite), 'indef', or null.
 */
export function symInt2(r, { range = 6, sign = null, minQ = 1 } = {}) {
  for (let k = 0; k < 2000; k++) {
    const p = r.int(-range, range), s = r.int(-range, range), q = r.intExcept(-range, range, [0]);
    if (Math.abs(q) < minQ) continue;
    const D = (p - s) ** 2 + 4 * q * q, rt = Math.round(Math.sqrt(D));
    if (rt * rt !== D || (p + s + rt) % 2) continue;
    const l1 = (p + s + rt) / 2, l2 = (p + s - rt) / 2;
    if (sign === 'pos' && !(l2 > 0)) continue;
    if (sign === 'indef' && !(l1 > 0 && l2 < 0)) continue;
    if (l1 === 0 || l2 === 0) continue;
    return { A: [[p, q], [q, s]], l: [l1, l2] };
  }
  return sign === 'indef' ? { A: [[1, 2], [2, -2]], l: [2, -3] } : { A: [[5, -2], [-2, 8]], l: [9, 4] };
}
/** The simplest integer eigenvector of a symmetric integer 2×2 for the integer eigenvalue lam. */
export function intEigvec(A, lam) {
  const [[a, b]] = A;
  // (a − λ) x + b y = 0  →  (b, λ − a), reduced
  let v = [b, lam - a];
  if (v[0] === 0 && v[1] === 0) v = [A[1][1] - lam, -A[1][0]];
  const g = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) [x, y] = [y, x % y]; return x; };
  const k = g(v[0], v[1]) || 1;
  v = v.map((x) => x / k);
  return v[0] < 0 || (v[0] === 0 && v[1] < 0) ? v.map((x) => -x) : v;
}

// ── pictures ──
const r3 = (x) => Math.round(x * 1000) / 1000;
/**
 * Projection of b onto the line through a, on the graph sim: the line, a and b,
 * the projection p and the residual e = b − p with a right-angle mark.
 * show: which of 'p', 'e', 'a', 'mark' to draw.
 */
export function projPic(a, b, { show = ['a', 'p', 'e', 'mark'], names = { a: 'a', b: 'b', p: 'p', e: 'e' }, caption, x, y } = {}) {
  const p = projLine(a, b), e = sub(b, p), ua = scale(a, 1 / norm(a)), ue = norm(e) > 1e-9 ? scale(e, 1 / norm(e)) : [-ua[1], ua[0]];
  const pts = [[0, 0], a, b, p];
  const h = Math.max(1.6, ...pts.map((q) => Math.abs(q[1]) + 0.7), ...pts.map((q) => Math.abs(q[0]) / 2 + 0.7));
  const cx = (Math.min(...pts.map((q) => q[0])) + Math.max(...pts.map((q) => q[0]))) / 2, cy = (Math.min(...pts.map((q) => q[1])) + Math.max(...pts.map((q) => q[1]))) / 2;
  const s = 0.22 * Math.min(norm(b), 2);
  const c1 = add(p, scale(ua, -s)), c2 = add(c1, scale(ue, s)), c3 = add(p, scale(ue, s));
  const L = 4 * h;
  const arrows = [];
  if (show.includes('a')) arrows.push({ from: [0, 0], to: a.map(r3), color: 'good', width: 3, label: names.a });
  arrows.push({ from: [0, 0], to: b.map(r3), color: 'accent', width: 2.6, label: names.b });
  if (show.includes('p')) arrows.push({ from: [0, 0], to: p.map(r3), color: 'gold', width: 3, label: names.p, labelDy: 14 });
  if (show.includes('e')) arrows.push({ from: p.map(r3), to: b.map(r3), color: 'bad', width: 2.2, dash: [6, 4], label: names.e, labelDx: 8, labelDy: 10 });
  return {
    type: 'graph',
    params: {
      x: x || [cx - 2 * h, cx + 2 * h], y: y || [cy - h, cy + h], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
      curves: [
        { param: [`${r3(ua[0])}*t`, `${r3(ua[1])}*t`], t: [-L, L], color: 'good', width: 1.2, dash: [4, 4] },
        ...(show.includes('mark') && norm(e) > 1e-6 ? [{ param: [`${r3(c1[0])} + (${r3(c2[0] - c1[0])})*min(t, 1) + (${r3(c3[0] - c2[0])})*max(t - 1, 0)`, `${r3(c1[1])} + (${r3(c2[1] - c1[1])})*min(t, 1) + (${r3(c3[1] - c2[1])})*max(t - 1, 0)`], t: [0, 2], color: 'ink2', width: 1.4 }] : []),
      ],
      arrows,
    },
    caption: caption || 'The dashed line is every multiple of a. The projection p is the point of that line nearest the tip of b; the residual e = b − p meets the line at a right angle.',
  };
}

/** b, the plane spanned by a1 and a2, its projection p and the residual e, on calc-vectors3d. show: 'p', 'e', 'a'. */
export function planePic(a1, a2, b, { show = ['a', 'p', 'e'], caption, size, names = ['\\mathbf a_1', '\\mathbf a_2'], extra = {} } = {}) {
  const { p, e } = projCols([a1, a2], b), nrm = cross(a1, a2);
  const R = Math.max(2, Math.ceil(Math.max(...[a1, a2, b, p].flat().map(Math.abs)) + 0.5));
  return {
    type: 'calc-vectors3d',
    params: {
      range: R,
      planes: [{ normal: nrm, point: [0, 0, 0], size: size || R * 0.9, color: 'violet', alpha: 0.2 }],
      vectors: [
        ...(show.includes('a') ? [{ to: a1, color: 'good', label: names[0] }, { to: a2, color: 'warn', label: names[1] }] : []),
        { to: b, color: 'accent', label: '\\mathbf b' },
        ...(show.includes('p') ? [{ to: p.map(r3), color: 'gold', label: '\\mathbf p' }] : []),
        ...(show.includes('e') ? [{ from: p.map(r3), to: b, color: 'bad', dash: true }] : []),
      ],
      points: show.includes('e') ? [{ at: add(p, scale(e, 0.5)).map(r3), color: 'bad', r: 0.01, label: '\\mathbf e' }] : [],
      ...extra,
    },
    caption: caption || 'The violet patch is part of the plane spanned by the two columns (it goes on for ever). The residual e = b − p stands straight up from it. Drag to rotate.',
  };
}

/**
 * Data points with a fitted curve and the vertical residuals, on the graph sim.
 * fn: the curve (Atlas syntax in x) or null; at: the same curve as a JS function
 * (for the residual segments); sy: error bars (σ) or null.
 */
export function fitPic(xs, ys, { fn = null, at = null, sy = null, residuals = !!at, x, y, xlabel = 'x', ylabel = 'y', caption, label, labelAt, extraCurves = [], color = 'gold', points = [] } = {}) {
  const lo = Math.min(...xs), hi = Math.max(...xs), span = hi - lo || 1;
  const ylo = Math.min(...ys.map((v, i) => v - (sy ? sy[i] : 0))), yhi = Math.max(...ys.map((v, i) => v + (sy ? sy[i] : 0))), yspan = yhi - ylo || 1;
  const curves = [];
  if (fn) curves.push({ fn, color, width: 2.4, label, labelAt });
  curves.push(...extraCurves);
  if (sy) xs.forEach((xi, i) => curves.push({ param: [`${xi}`, `${ys[i]} + ${sy[i]}*t`], t: [-1, 1], color: 'ink3', width: 1.4 }));
  if (at && residuals) xs.forEach((xi, i) => curves.push({ param: [`${xi}`, `${ys[i]} + t*(${r3(at(xi) - ys[i])})`], t: [0, 1], color: 'bad', width: 1.6, dash: [4, 3] }));
  return {
    type: 'graph',
    params: {
      x: x || [lo - 0.12 * span, hi + 0.12 * span], y: y || [ylo - 0.18 * yspan, yhi + 0.18 * yspan], aspect: 'wide', axesAt: 'edge', xlabel, ylabel,
      curves, points: [...xs.map((xi, i) => ({ x: xi, y: ys[i], color: 'accent', r: 5 })), ...points],
    },
    caption: caption || (fn ? 'Blue: the data. Gold: the fitted curve. Red dashes: the residuals, data minus fit — least squares makes the sum of their squares as small as it can be.' : 'The data.'),
  };
}

/** A quadratic form q(x, y) = a x² + 2b xy + c y² as a contour map, optionally with its eigenvector axes. */
export function formPic(A, { axes = true, levels, x = [-4, 4], y = [-2, 2], caption, highlight = null, labels = true, view = '2d', toggle3d = false, arrowNames = ['q₁', 'q₂'] } = {}) {
  const [[a, b], [, c]] = A;
  const f = `${a}*x^2 + ${2 * b}*x*y + ${c}*y^2`;
  const { q } = eigSym2(A);
  const arrows = axes ? q.map((v, k) => ({ from: [0, 0], to: v.map(r3), color: k ? 'warn' : 'good', label: arrowNames[k] })) : [];
  return {
    type: 'c3-contour',
    params: { f, x, y, levels: levels ?? 9, labels, highlight, arrows, view, toggle3d, aspect: 'wide' },
    caption: caption || 'Level curves of the quadratic form. Arrows: unit eigenvectors of its symmetric matrix — the principal axes.',
  };
}

/** The la-svd map picture of a 2×2 matrix; numbers hidden unless asked. */
export const svdPic = (A, { caption, readout = false, ...rest } = {}) => ({ type: 'la-svd', params: { mode: 'map', A, readout, ...rest }, ...(caption ? { caption } : {}) });
