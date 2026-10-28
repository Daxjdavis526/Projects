// The four fundamental subspaces of a matrix — Strang's “big picture”. On the
// left, ℝⁿ, where the inputs x live: the row space C(Aᵀ) and the null space
// N(A), drawn as two squares meeting at the origin at a right angle (the two
// subspaces are perpendicular and share only 0). On the right, ℝᵐ, where the
// outputs Ax live: the column space C(A) and the left null space N(Aᵀ). Each
// square's area is proportional to the subspace's dimension, so the two
// counts r + (n − r) = n and r + (m − r) = m can be seen. Arrows: A carries
// the row space onto the column space, and sends the whole null space to 0.
// With an input x, the picture splits it as x = x_r + x_n and follows each
// part (A x_r = Ax, A x_n = 0). The matrix's entries may be numbers or
// expressions of slider keys, so moving an entry can change the rank; below
// the picture the exact bases of all four subspaces are listed. Without a
// matrix, a shape and rank alone (m, n, r) draw the counting picture, and
// `hide` turns chosen dimensions into “?” for a problem. The exact algebra is
// in model/la-subspaces.js (test/la-subspaces.test.mjs).
//
//   { type: 'la-subspaces', params: {
//       A: [[1, 2, 0], [2, 4, 1]],     // rows; numbers, 'p/q' strings, or expressions of slider keys
//       m: null, n: null, r: null,     // or the shape and rank alone (no matrix): the counting picture
//       sliders: [], constants: {},
//       names: null,                   // plain-text names for the four: { row, null, col, left } (e.g. 'mechanisms')
//       titles: null,                  // plain-text titles for the two spaces: ['ℝ⁴: bar forces', 'ℝ³: joint loads']
//       hide: [],                      // dimensions drawn as “?”: any of 'row', 'null', 'col', 'left'
//       arrows: true,                  // A: row space → column space, null space → 0
//       x: null,                       // an input [x₁, …, xₙ] (numbers or expressions): drawn split as x_r + x_n
//       readout: true,                 // the matrix, its rank and the four bases; false hides every number;
//                                      //   or a list of 'A', 'rank', 'bases', 'x'
//   } }

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as S from '../model/la-subspaces.js';

export const defaults = { A: null, m: null, n: null, r: null, sliders: [], constants: {}, names: null, titles: null, hide: [], arrows: true, x: null, readout: true };

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (k) => String(k).replace(/\d/g, (d) => SUP[d]);
const NAMES = { row: 'row space', null: 'null space', col: 'column space', left: 'left null space' };
const SYM = { row: 'C(Aᵀ)', null: 'N(A)', col: 'C(A)', left: 'N(Aᵀ)' };
const COLOR = { row: 'accent', null: 'warn', col: 'good', left: 'violet' };
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
const num = (x) => { const r = Math.round(x); return Math.abs(x - r) < 1e-9 ? String(r) : String(+x.toFixed(3)); };
const tupleTeX = (v) => `(${v.map(num).join(',\\ ')})`;

export function mount(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const { canvas } = F.canvas({ aspect: narrow ? '' : 'wide', label: P.alt || 'The four fundamental subspaces: row space and null space in the input space, column space and left null space in the output space' });
  const plot = new Plot(canvas, { x: [0, 20], y: [-5, 5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', pad: { l: 4, r: 4, t: 4, b: 4 } });
  for (const s of P.sliders || []) F.slider(s);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const s of P.sliders || []) e[s.key] = +F.params[s.key]; return e; };
  const ev = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const clean = (v) => Math.round(v * 1e6) / 1e6;
  F.onChange(() => draw());

  const names = { ...NAMES, ...(P.names || {}) };
  const hidden = new Set(P.hide || []);

  function draw() {
    plot.clear();
    const E = env();
    let A = null, sub = null, m, n, r;
    if (P.A) {
      A = P.A.map((row) => row.map((s) => clean(ev(s, E))));
      sub = S.fourSubspaces(A);
      ({ m, n, rank: r } = sub);
    } else ({ m, n, r } = P);
    const d = S.dims(m, n, r);
    const compact = plot.R - plot.L < 560;

    // sizes: a square's area ∝ its dimension; everything fits under the titles
    const lowMax = Math.max(Math.sqrt(d.null), Math.sqrt(d.left));
    // (a phone's 16:10 canvas is taller in world units, so its squares may grow; each space keeps 9 units of width)
    const rt = Math.sqrt(r), tall = plot.vy1 - plot.vy0 - (compact ? 2.1 : 1.8);
    const k = Math.min(compact ? 3.2 : 2.6, tall / Math.max(1e-9, rt + lowMax), 9 / Math.max(1e-9, rt + Math.sqrt(d.null)), 9 / Math.max(1e-9, rt + Math.sqrt(d.left)));
    const side = (key) => (hidden.has(key) ? k * 1.1 : k * Math.sqrt(d[key]));
    const top = plot.vy1 - (compact ? 1.5 : 1.2), bottom = plot.vy0 + 0.35;
    const up = side('row'), low = Math.max(side('null'), side('left'));
    const oy = (top + bottom) / 2 + (low - up) / 2;
    const OL = [5.4, oy], OR = [14.6, oy];

    // a square at origin O spanning directions u and v (unit), side s
    const square = (O, u, v, s) => [O, [O[0] + s * u[0], O[1] + s * u[1]], [O[0] + s * (u[0] + v[0]), O[1] + s * (u[1] + v[1])], [O[0] + s * v[0], O[1] + s * v[1]]];
    const at = (O, u, v, a, b) => [O[0] + a * u[0] + b * v[0], O[1] + a * u[1] + b * v[1]];
    const L = [-1, 0], R = [1, 0], U = [0, 1], D = [0, -1];
    // left space: row space up-left of 0, null space down-right; the right space mirrors it
    const blocks = {
      row: { O: OL, u: U, v: L, s: side('row'), dim: d.row, outer: -1 },
      null: { O: OL, u: D, v: R, s: side('null'), dim: d.null, outer: 1 },
      col: { O: OR, u: U, v: R, s: side('col'), dim: d.col, outer: 1 },
      left: { O: OR, u: D, v: L, s: side('left'), dim: d.left, outer: -1 },
    };
    const sym = (key) => SYM[key];
    const dimText = (key) => {
      const v = hidden.has(key) ? '?' : String(d[key]);
      const expr = key === 'null' ? 'n − r' : key === 'left' ? 'm − r' : 'r';
      return compact ? `dim ${v}` : `dim ${expr} = ${v}`;
    };
    for (const [key, B] of Object.entries(blocks)) {
      const col = COLOR[key];
      if (B.dim === 0 && !hidden.has(key)) {
        // the zero subspace: just the origin
        const p = at(B.O, B.u, B.v, 0.55, 0.55);
        plot.text(`${sym(key)} = {0}`, p[0], p[1], { color: col, weight: 700, size: compact ? 11 : 12.5, align: B.outer < 0 ? 'right' : 'left', dx: 0 });
        continue;
      }
      plot.path(square(B.O, B.u, B.v, B.s), { close: true, color: col, width: 2, fill: col, fillAlpha: 0.16, dash: hidden.has(key) ? [6, 5] : [] });
      // labels: inside a big enough square, else just outside it — below a
      // lower square, above an upper one — clear of the arrows between them
      const c = at(B.O, B.u, B.v, B.s / 2, B.s / 2);
      const px = Math.abs(plot.X(B.s) - plot.X(0));
      const fs = compact ? 10.5 : 12;
      if (px > (compact ? 58 : 92)) {
        if (!compact) plot.text(names[key], c[0], c[1], { color: col, weight: 700, size: fs, align: 'center', dy: -16 });
        // on a phone a lesson's own name for the subspace replaces its symbol
        const own = compact && P.names?.[key];
        plot.text(own ? names[key] : sym(key), c[0], c[1], { color: own ? col : 'ink', weight: 700, size: own ? fs - 0.5 : fs + 0.5, align: 'center', dy: compact ? -7 : 0 });
        plot.text(dimText(key), c[0], c[1], { color: 'ink2', weight: 600, size: fs, align: 'center', dy: compact ? 8 : 16 });
      } else {
        const below = B.u[1] < 0, edge = at(B.O, B.u, B.v, B.s, B.s / 2);
        const lines = compact ? [`${P.names?.[key] ? names[key] : sym(key)}  ${dimText(key)}`] : [names[key], `${sym(key)}  ${dimText(key)}`];
        lines.forEach((line, i) => plot.text(line, edge[0], edge[1], { color: i === 0 && !compact ? col : 'ink', weight: 700, size: fs, align: 'center', dy: below ? 12 + 15 * i : -12 - 15 * (lines.length - 1 - i) }));
      }
    }
    // right-angle marks at both origins, and the origins themselves
    for (const [O, a, b] of [[OL, blocks.row, blocks.null], [OR, blocks.col, blocks.left]]) {
      if (a.dim && b.dim) {
        const e = Math.min(0.42, 0.3 * Math.min(a.s, b.s));
        // the corner between the upper square's vertical edge and the lower square's horizontal edge
        const s1 = [a.v[0] * -1, 0], s2 = [0, a.u[1]];
        plot.path([[O[0] + e * s1[0], O[1]], [O[0] + e * s1[0], O[1] + e * s2[1]], [O[0], O[1] + e * s2[1]]], { color: 'ink2', width: 1.3 });
      }
      plot.point(O[0], O[1], { color: 'ink', r: 3.5 });
    }
    plot.text('0', OL[0], OL[1], { color: 'ink2', size: 11, dx: -6, dy: 10, align: 'right' });
    plot.text('0', OR[0], OR[1], { color: 'ink2', size: 11, dx: 6, dy: 10 });

    // titles
    const titles = P.titles || [`ℝ${sup(n)}: inputs x`, `ℝ${sup(m)}: outputs Ax`];
    const ty = plot.vy1 - (compact ? 0.62 : 0.55);
    plot.text(titles[0], OL[0], ty, { color: 'ink', weight: 700, size: compact ? 11.5 : 13.5, align: 'center' });
    plot.text(titles[1], OR[0], ty, { color: 'ink', weight: 700, size: compact ? 11.5 : 13.5, align: 'center' });

    // what A does
    const xr = blocks.row.dim ? at(OL, U, L, 0.7 * blocks.row.s, 0.3 * blocks.row.s) : OL;
    const xn = blocks.null.dim ? at(OL, D, R, 0.3 * blocks.null.s, 0.7 * blocks.null.s) : OL;
    const bpt = blocks.col.dim ? at(OR, U, R, 0.7 * blocks.col.s, 0.3 * blocks.col.s) : OR;
    let xs = null;
    if (P.x && A) {
      const x = P.x.map((s) => ev(s, E));
      xs = { x, ...S.split(A, x) };
      const X = [xr[0] + xn[0] - OL[0], xr[1] + xn[1] - OL[1]];
      plot.line(xr[0], xr[1], X[0], X[1], { color: 'ink3', width: 1.2, dash: [4, 4] });
      plot.line(xn[0], xn[1], X[0], X[1], { color: 'ink3', width: 1.2, dash: [4, 4] });
      plot.arrow(X[0], X[1], bpt[0], bpt[1], { color: 'gold', width: 2.2 });
      if (blocks.row.dim) plot.arrow(xr[0], xr[1], bpt[0], bpt[1], { color: 'gold', width: 1.6, dash: [6, 4] });
      if (blocks.null.dim) plot.arrow(xn[0], xn[1], OR[0] - 0.12, OR[1] - 0.02, { color: 'warn', width: 1.6, dash: [6, 4] });
      plot.point(X[0], X[1], { color: 'gold', r: 5, label: 'x', ldx: -4, ldy: -12 });
      if (blocks.row.dim) plot.point(xr[0], xr[1], { color: 'accent', r: 4.5, label: 'xᵣ', ldx: -10, ldy: -12, lalign: 'right' });
      if (blocks.null.dim) plot.point(xn[0], xn[1], { color: 'warn', r: 4.5, label: 'xₙ', ldx: -10, ldy: 12, lalign: 'right' });
      plot.point(bpt[0], bpt[1], { color: 'gold', r: 5, label: 'Ax', ldx: 8, ldy: -12 });
    } else if (P.arrows) {
      // A: row space → column space, across the upper squares (above their labels)
      if (blocks.row.dim && blocks.col.dim) {
        const y = oy + 0.84 * Math.min(blocks.row.s, blocks.col.s);
        plot.arrow(OL[0] - 0.25 * blocks.row.s, y, OR[0] + 0.25 * blocks.col.s, y, { color: 'gold', width: 2.2 });
        plot.text(compact ? 'A' : 'A: row space onto column space', 10, y, { color: 'gold', weight: 700, size: compact ? 11 : 12, align: 'center', dy: -11 });
      }
      // A sends the null space to 0: along the seam between the squares, from the null space to the right-hand origin
      if (blocks.null.dim) {
        plot.arrow(OL[0] + 0.5 * blocks.null.s, oy - Math.min(0.3, 0.2 * blocks.null.s), OR[0] - 0.15, oy - 0.04, { color: 'warn', width: 1.8, dash: [6, 4] });
        plot.text(compact ? 'A → 0' : 'A sends it to 0', 10, oy, { color: 'warn', weight: 650, size: compact ? 10.5 : 12, align: 'center', dy: -11 });
      }
    }

    // readout
    const want = (k2) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k2));
    const rows = [];
    if (A && want('A')) rows.push(['$A$', `\\begin{bmatrix} ${A.map((row) => row.map(num).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`]);
    if (want('rank') && !hidden.has('row') && !hidden.has('col')) rows.push(['rank $r$', String(r)]);
    if (sub && want('bases')) {
      const T = { row: 'C(A^{\\mathsf T})', null: 'N(A)', col: 'C(A)', left: 'N(A^{\\mathsf T})' };
      for (const key of ['col', 'null', 'row', 'left']) if (!hidden.has(key)) rows.push([`$${T[key]}$`, S.basisTeX(sub[key])]);
    }
    if (xs && want('x')) {
      rows.push(['$\\mathbf x_r$', tupleTeX(xs.xr)], ['$\\mathbf x_n$', tupleTeX(xs.xn)], ['$A\\mathbf x$', tupleTeX(xs.Ax)]);
    }
    F.readout(P.readout === false ? [] : rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'A schematic, not to scale: each subspace is a square whose area is proportional to its dimension, and the right angles stand for perpendicular subspaces. The bases listed below are exact.');
  return { get: (k2) => F.params[k2] };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where) => {
    if (typeof src === 'number') { if (!Number.isFinite(src)) problems.push(`la-subspaces ${where}: not a finite number`); return; }
    if (typeof src !== 'string') { problems.push(`la-subspaces ${where}: expected a number or an expression`); return; }
    try { fn(src, keys); } catch (e) { problems.push(`la-subspaces ${where}: “${src}” — ${e.message}`); }
  };
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`la-subspaces slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`la-subspaces slider ${s.key} needs a label`);
  }
  if (P.A) {
    if (!Array.isArray(P.A) || !P.A.length || !P.A.every((r) => Array.isArray(r) && r.length === P.A[0].length && r.length > 0)) problems.push('la-subspaces: A must be a rectangular list of rows');
    else {
      if (P.A.length > 8 || P.A[0].length > 8) problems.push('la-subspaces: A may be at most 8×8');
      P.A.forEach((r, i) => r.forEach((s, j) => check(s, `A[${i}][${j}]`)));
      // the starting values must make a readable matrix (numbers with short decimals)
      try {
        const E = { ...(P.constants || {}) };
        for (const s of P.sliders || []) E[s.key] = s.value;
        S.fourSubspaces(P.A.map((r) => r.map((s) => Math.round((typeof s === 'number' ? s : fn(s, keys)(E)) * 1e6) / 1e6)));
      } catch (e) { problems.push(`la-subspaces: A at the starting values — ${e.message}`); }
      if (P.x && (!Array.isArray(P.x) || P.x.length !== P.A[0].length)) problems.push('la-subspaces: x must have one entry per column of A');
      else if (P.x) P.x.forEach((s, i) => check(s, `x[${i}]`));
    }
  } else {
    const { m, n, r } = P;
    if (![m, n, r].every((v) => Number.isInteger(v) && v >= 0)) problems.push('la-subspaces: give A, or whole numbers m, n and r');
    else if (r > Math.min(m, n) || m < 1 || n < 1) problems.push('la-subspaces: the rank r cannot exceed m or n');
    if (P.x) problems.push('la-subspaces: x needs a matrix A');
  }
  for (const h of P.hide || []) if (!['row', 'null', 'col', 'left'].includes(h)) problems.push(`la-subspaces: hide “${h}” — use row, null, col or left`);
  const plain = [...Object.values(P.names || {}), ...(P.titles || [])];
  for (const s of plain) if (/[$\\_^]/.test(String(s))) problems.push(`la-subspaces: label “${s}” is plain text: use Unicode (ℝ³, Aᵀ), not TeX`);
  for (const k2 of Object.keys(P.names || {})) if (!['row', 'null', 'col', 'left'].includes(k2)) problems.push(`la-subspaces: names.${k2} — use row, null, col or left`);
  if (P.titles && (!Array.isArray(P.titles) || P.titles.length !== 2)) problems.push('la-subspaces: titles must be two strings');
  return problems;
}
