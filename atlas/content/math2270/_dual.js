// Shared helpers for the duality lessons (math2270 LA-14): random integer
// bases with integer inverses (so dual bases and transformed components stay
// whole numbers), row vectors as TeX, and ready-made pictures — a basis of R³
// with the planes of one covector on calc-vectors3d, a basis of the plane with
// a covector's level lines on the graph sim, and the level curves B(x, x) = ±1
// of a symmetric bilinear form. Files whose names start with "_" are helpers,
// not lessons.

import { matmul, inverse, transpose, qt } from './_la.js';
import { plain } from './_eig.js';

export const round = (M) => M.map((row) => row.map((v) => Math.round(v)));
export const rowTeX = (v) => `\\begin{bmatrix} ${v.map(qt).join(' & ')} \\end{bmatrix}`;
export const congruent = (B, P) => matmul(matmul(transpose(P), B), P);
export const similar = (A, P) => matmul(matmul(inverse(P), A), P);
export const rowTimes = (w, P) => P[0].map((_, j) => w.reduce((s, x, i) => s + x * P[i][j], 0));

/** A random 3×3 integer matrix with determinant ±1 and small entries (so its inverse is integer too). */
export function unimod3(r, { max = 3, maxInv = 4 } = {}) {
  for (let k = 0; k < 500; k++) {
    const L = [[1, 0, 0], [r.int(-1, 1), 1, 0], [r.int(-1, 1), r.int(-1, 1), 1]];
    const U = [[1, r.int(-1, 2), r.int(-1, 1)], [0, 1, r.int(-1, 2)], [0, 0, 1]];
    let P = matmul(L, U);
    const perm = r.perm(3);
    P = P.map((row) => perm.map((j) => row[j]));
    if (r.bool(0.5)) P = P.map((row) => [row[0], row[1], -row[2]]);
    const Pi = round(inverse(P));
    if (P.flat().some((v) => Math.abs(v) > max) || Pi.flat().some((v) => Math.abs(v) > maxInv)) continue;
    if (P.flat().filter((v) => v !== 0).length < 5) continue;
    return { P, Pi };
  }
  return { P: [[1, 1, 1], [0, 1, 1], [0, 0, 1]], Pi: [[1, -1, 0], [0, 1, -1], [0, 0, 1]] };
}

/** A random 2×2 integer matrix with determinant ±1, not diagonal. */
export function unimod2(r, range = 2) {
  for (let k = 0; k < 500; k++) {
    const P = [[r.int(-range, range), r.int(-range, range)], [r.int(-range, range), r.int(-range, range)]];
    const d = P[0][0] * P[1][1] - P[0][1] * P[1][0];
    if (Math.abs(d) !== 1 || (P[0][1] === 0 && P[1][0] === 0)) continue;
    if (P.flat().filter((v) => v !== 0).length < 3) continue;
    return P;
  }
  return [[2, 1], [1, 1]];
}

const col = (P, j) => P.map((row) => row[j]);

/**
 * A basis of R³ (the columns of P) as arrows, with the planes ω(x) = 0, 1, …
 * of the covector ω (a row of numbers) on calc-vectors3d. levels: which
 * planes; name: ω's TeX name for the plane labels (labels: false hides them).
 */
export function planesPic(P, w, { levels = [0, 1], name = '\\omega', caption, labels = true, basisNames = ['\\mathbf b_1', '\\mathbf b_2', '\\mathbf b_3'], extra = {} } = {}) {
  const cols = [0, 1, 2].map((j) => col(P, j));
  const R = Math.max(2, Math.ceil(Math.max(...cols.flat().map(Math.abs)) + 0.5));
  const n2 = w.reduce((s, x) => s + x * x, 0);
  const planes = levels.map((c, k) => {
    // centre each patch at the point of the plane nearest the middle of the basis tips
    const mid = [0, 1, 2].map((i) => (cols[0][i] + cols[1][i] + cols[2][i]) / 4);
    const off = (c - w.reduce((s, x, i) => s + x * mid[i], 0)) / n2;
    return { normal: w, centre: mid.map((x, i) => x + off * w[i]), size: R * 0.6, color: k ? 'teal' : 'violet', alpha: k ? 0.12 : 0.2, ...(labels ? { label: `${name} = ${c}` } : {}) };
  });
  // a camera that sees the planes obliquely (about 40° from face-on), close to the textbook view
  const nn = Math.sqrt(n2), pitch = 0.38;
  let yaw = 0.55, best = -Infinity;
  for (let y = -0.7; y <= 1.5; y += 0.05) {
    const d = [Math.cos(pitch) * Math.cos(y), Math.cos(pitch) * Math.sin(y), Math.sin(pitch)];
    const c = Math.abs(d[0] * w[0] + d[1] * w[1] + d[2] * w[2]) / nn;
    const score = -Math.abs(c - 0.75) - 0.15 * Math.abs(y - 0.55);
    if (score > best) { best = score; yaw = y; }
  }
  return {
    type: 'calc-vectors3d',
    params: {
      range: R, yaw: +yaw.toFixed(2), pitch,
      vectors: cols.map((v, j) => ({ to: v, color: ['accent', 'warn', 'good'][j], label: basisNames[j] })),
      planes,
      ...extra,
    },
    caption: caption || 'The three basis vectors, and the planes where the covector takes the values marked: a covector on R³ is a stack of parallel planes. Patches of planes are drawn; planes go on for ever. Drag to rotate.',
  };
}

/**
 * Two bases of the plane on the graph sim: the old one (faint, the standard
 * basis unless given) and the new one (bold, the columns of P), with optional
 * level lines ω(x) = k of a covector ω (a row [a, b] in old components) and an
 * arrow x (old components).
 */
export function basesPic(P, { w = null, x = null, old = [[1, 0], [0, 1]], caption, ks = [-3, -2, -1, 0, 1, 2, 3], names = ['b′₁', 'b′₂'], oldNames = ['e₁', 'e₂'], wName = 'ω', xName = 'x', levelLabels = true, view = null } = {}) {
  const b1 = col(P, 0), b2 = col(P, 1);
  const pts = [b1, b2, old[0], old[1], ...(x ? [x] : [])];
  const h = view ?? Math.max(2.2, ...pts.map((p) => Math.abs(p[1]) + 0.7), ...pts.map((p) => Math.abs(p[0]) / 2 + 0.7));
  const curves = [], points = [];
  if (w) {
    const [a, b] = w, n2 = a * a + b * b;
    for (const k of ks) {
      // the line a x + b y = k, through its foot point, along (−b, a)
      const fx = (a * k) / n2, fy = (b * k) / n2;
      curves.push({ param: [`${fx} + (${-b})*t`, `${fy} + (${a})*t`], t: [-30, 30], color: 'violet', width: k === 0 ? 1.6 : 1, dash: k === 0 ? [] : [4, 4] });
      if (levelLabels && k > 0) {
        // label where the line meets the edge region on the right
        const s = Math.hypot(a, b), ux = -b / s, uy = a / s;
        let tt = 0;
        for (const cand of [1.2 * h, -1.2 * h, 0.8 * h, -0.8 * h]) { const px = fx + ux * cand, py = fy + uy * cand; if (Math.abs(px) < 1.85 * h && Math.abs(py) < 0.88 * h) { tt = cand; break; } }
        points.push({ x: fx + ux * tt, y: fy + uy * tt, r: 0, label: `${wName} = ${k}`, color: 'violet', labelDx: 4, labelDy: -2 });
      }
    }
  }
  const arrows = [
    { from: [0, 0], to: old[0], color: 'ink3', width: 1.6, label: oldNames[0] },
    { from: [0, 0], to: old[1], color: 'ink3', width: 1.6, label: oldNames[1] },
    { from: [0, 0], to: b1, color: 'accent', width: 3, label: names[0] },
    { from: [0, 0], to: b2, color: 'warn', width: 3, label: names[1] },
  ];
  if (x) arrows.push({ from: [0, 0], to: x, color: 'gold', width: 3, label: xName });
  return {
    type: 'graph',
    params: { x: [-2 * h, 2 * h], y: [-h, h], aspect: 'wide', equal: true, xlabel: '', ylabel: '', curves, arrows, points },
    caption: caption || 'Old basis (grey), new basis (bold)' + (w ? `, and the level lines of the covector ${wName} (violet)` : '') + (x ? ` and the vector ${xName} (gold)` : '') + '.',
  };
}

/**
 * The level curves B(x, x) = 1 (solid) and = −1 (dashed) of the symmetric form
 * B = [[a, b], [b, c]] on the graph sim, drawn in polar form, with the null
 * lines B(x, x) = 0 when the form is indefinite, and optional basis arrows.
 */
export function conicPic(B, { arrows = [], caption, view = 2.2, labels = true } = {}) {
  const [[a, b], [, c]] = B;
  const q = `(${a})*cos(theta)^2 + 2*(${b})*sin(theta)*cos(theta) + (${c})*sin(theta)^2`;
  const curves = [
    { polar: `1/sqrt(${q})`, theta: [0, 6.2832], color: 'accent', width: 2.4, label: labels ? 'B(x, x) = 1' : undefined },
    { polar: `1/sqrt(-(${q}))`, theta: [0, 6.2832], color: 'warn', width: 2, dash: [5, 4], label: labels ? 'B(x, x) = −1' : undefined },
  ];
  const det = a * c - b * b;
  if (det < 0) {
    // null directions: a + 2b m + c m² = 0 for slope m (or vertical when c = 0)
    const dirs = Math.abs(c) > 1e-12 ? [(-b + Math.sqrt(-det)) / c, (-b - Math.sqrt(-det)) / c].map((m) => [1, m]) : [[0, 1], [2 * b, -a]];
    for (const [dx, dy] of dirs) curves.push({ param: [`(${dx})*t`, `(${dy})*t`], t: [-20, 20], color: 'ink3', width: 1, dash: [2, 4] });
  }
  return {
    type: 'graph',
    params: { x: [-2 * view, 2 * view], y: [-view, view], aspect: 'wide', equal: true, xlabel: '', ylabel: '', curves, arrows },
    caption: caption || 'The vectors with B(x, x) = 1 (solid) and B(x, x) = −1 (dashed)' + (det < 0 ? '; dotted: the null directions, B(x, x) = 0.' : '.'),
  };
}

export { plain };
