// The determinant of a 2×2 matrix as a signed area. The two columns a₁ and a₂
// are arrows from the origin; the parallelogram they span is tinted blue when
// det [a₁ a₂] > 0 and red when it is negative, and a gold turning arrow goes
// from a₁ to a₂ the short way round — counterclockwise means positive. Drag
// the tips (or move sliders the columns are written in) and watch the sign
// flip as a₂ crosses the line of a₁, where the parallelogram collapses and the
// determinant is 0. Options: a faint “before” pair of columns (to compare an
// operation such as a shear, which keeps the area); the classic picture proof
// that the area is ad − bc (a box minus six pieces); and Cramer's rule as a
// ratio of areas — the parallelogram with column k replaced by b, slid along
// the other column (a shear) onto xₖaₖ. Geometry in model/la-det.js
// (test/la-det.test.mjs).
//
//   { type: 'la-det', params: {
//       cols: [[3, 1], [1, 2]],         // a₁ and a₂ — each [x, y], numbers or expressions of slider keys
//       drag: false, snap: 0.5,         // drag the two tips (columns of plain numbers only)
//       sliders: [], constants: {},
//       names: ['a₁', 'a₂'],            // canvas labels (plain text)
//       ghost: null,                    // a faint dashed pair [[x, y], [x, y]] to compare with (numbers or expressions)
//       ghostNames: null,               // their labels, plain text (default none)
//       arc: true,                      // the turning arrow from a₁ to a₂
//       tint: true,                     // colour by sign (false: a neutral gold fill and no arrow — a question about the sign)
//       proof: false,                   // the box (a + b) × (c + d) and the six pieces cut from it (columns in the first quadrant, det > 0)
//       b: null, cramer: 0,             // Cramer: a target b ([x, y]); cramer 1 or 2 draws the parallelogram with column k replaced by b and its shear onto xₖaₖ
//       label: false,                   // write the signed area inside the parallelogram
//       view: null, center: null,       // the window's half-height and centre (default: frame the columns at the start)
//       readout: true,                  // the matrix, det, area and orientation; false hides every number;
//                                       //   or a list of 'A', 'det', 'area', 'orient', 'cramer'
//   } }

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as D from '../model/la-det.js';

export const defaults = {
  cols: [[3, 1], [1, 2]], drag: false, snap: 0.5, sliders: [], constants: {}, names: ['a₁', 'a₂'], ghost: null, ghostNames: null,
  arc: true, tint: true, proof: false, b: null, cramer: 0, label: false, view: null, center: null, readout: true,
};

const SUB = ['', '₁', '₂'];
const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
const num = (x) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return String(r);
  return String(+x.toFixed(3));
};
const txt = (x) => num(x).replace('-', '−');

export function mount(F, P) {
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const { canvas } = F.canvas({ aspect: narrow ? '' : 'wide', label: P.alt || 'Two column vectors and the parallelogram they span, tinted by the sign of the determinant' });
  for (const s of P.sliders || []) F.slider(s);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const s of P.sliders || []) e[s.key] = +F.params[s.key]; return e; };
  const ev = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const vec = (v, E) => v.map((s) => ev(s, E));
  const own = P.cols.map((c) => c.slice());

  // the window: framed on the starting picture unless the lesson fixes it
  const across = narrow ? 1.6 : 2;
  const E0 = env();
  const start = [vec(own[0], E0), vec(own[1], E0)];
  const pts = [...start, [start[0][0] + start[1][0], start[0][1] + start[1][1]]];
  if (P.ghost) { const g = P.ghost.map((c) => vec(c, E0)); pts.push(...g, [g[0][0] + g[1][0], g[0][1] + g[1][1]]); }
  if (P.b) {
    const b = vec(P.b, E0);
    pts.push(b);
    // Cramer's picture: the parallelogram with column k replaced by b reaches b + (the other column)
    if (P.cramer) { const o = start[2 - P.cramer]; pts.push([b[0] + o[0], b[1] + o[1]]); }
  }
  const fr = D.frame(pts, across);
  const half = P.view || fr.half, centre = P.center || fr.centre;
  const plot = new Plot(canvas, { x: [centre[0] - across * half, centre[0] + across * half], y: [centre[1] - half, centre[1] + half], equal: true, xlabel: '', ylabel: '', axes: true, grid: true });

  if (P.drag) {
    const snap = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
    for (const k of [0, 1]) plot.handle(() => own[k].slice(), (x, y) => { own[k][0] = snap(x); own[k][1] = snap(y); }, { hollow: true });
    plot.onDrag = () => { draw(); F.notify('cols'); };
  }
  F.onChange(() => draw());

  function draw() {
    plot.clear();
    const E = env();
    const a1 = vec(own[0], E), a2 = vec(own[1], E);
    const det = D.det(a1, a2), scale = Math.max(Math.hypot(...a1), Math.hypot(...a2), 1e-9);
    const flat = Math.abs(det) < 1e-9 * scale * scale;
    const tint = flat ? 'ink3' : !P.tint ? 'gold' : det > 0 ? 'accent' : 'bad';
    const g = plot.ctx;

    g.save(); plot._clip();
    // the picture proof: the box, the six pieces cut away from it
    let proof = null;
    if (P.proof) {
      proof = D.proofPieces(a1, a2);
      if (proof) {
        plot.path(proof.box, { close: true, color: 'ink3', width: 1.4, dash: [5, 4] });
        for (const p of proof.pieces) plot.path(p.pts, { close: true, color: 'ink4', width: 1, fill: p.kind === 'rect' ? 'violet' : 'teal', fillAlpha: 0.16 });
      }
    }
    // the faint “before” columns
    if (P.ghost) {
      const [g1, g2] = P.ghost.map((c) => vec(c, E));
      plot.path(D.parallelogram(g1, g2), { close: true, color: 'ink3', width: 1.2, dash: [4, 4], fill: 'ink3', fillAlpha: 0.07 });
      plot.arrow(0, 0, g1[0], g1[1], { color: 'ink3', width: 1.6, dash: [5, 4], label: P.ghostNames?.[0], ldx: 6, ldy: 12 });
      plot.arrow(0, 0, g2[0], g2[1], { color: 'ink3', width: 1.6, dash: [5, 4], label: P.ghostNames?.[1], ldx: -18, ldy: -10 });
    }
    // the parallelogram, by sign
    plot.path(D.parallelogram(a1, a2), { close: true, color: tint, width: 2, fill: tint, fillAlpha: flat ? 0 : 0.28 });
    // Cramer: column k replaced by b, and its shear back onto xₖaₖ
    let cr = null;
    if (P.b && P.cramer) {
      const b = vec(P.b, E);
      cr = D.cramer(a1, a2, b);
      if (cr) {
        const k = P.cramer, other = k === 1 ? a2 : a1, xk = cr.x[k - 1], ak = k === 1 ? a1 : a2;
        const foot = [xk * ak[0], xk * ak[1]];
        const repl = k === 1 ? D.parallelogram(b, a2) : D.parallelogram(a1, b);
        const slid = k === 1 ? D.parallelogram(foot, a2) : D.parallelogram(a1, foot);
        plot.path(repl, { close: true, color: 'warn', width: 1.8, fill: 'warn', fillAlpha: 0.2 });
        plot.path(slid, { close: true, color: 'warn', width: 1.6, dash: [6, 4] });
        // the slide: b moves along the other column to xₖaₖ (and the far corner with it)
        plot.line(b[0], b[1], foot[0], foot[1], { color: 'warn', width: 1.4, dash: [2, 4] });
        plot.line(b[0] + other[0], b[1] + other[1], foot[0] + other[0], foot[1] + other[1], { color: 'warn', width: 1.4, dash: [2, 4] });
        plot.point(foot[0], foot[1], { color: 'warn', r: 4.5, label: `x${SUB[k]}a${SUB[k]}`, ldx: 8, ldy: 14 });
      }
    }
    // the turning arrow from a₁ to a₂
    if (P.arc && P.tint && !flat) {
      const o = D.orientArc(a1, a2);
      if (o) {
        const rho = 0.32 * Math.min(Math.hypot(...a1), Math.hypot(...a2), 2 * half);
        const end = o.from + 0.86 * o.sweep;
        plot.curve((t) => rho * Math.cos(t), (t) => rho * Math.sin(t), o.from + 0.08 * o.sweep, end, { color: 'gold', width: 2.2 });
        const t1 = o.from + o.sweep * 0.97;
        plot.arrow(rho * Math.cos(end), rho * Math.sin(end), rho * Math.cos(t1), rho * Math.sin(t1), { color: 'gold', width: 2.2, head: 9 });
      }
    }
    g.restore();

    // columns and b
    plot.arrow(0, 0, a1[0], a1[1], { color: 'good', width: 2.8, label: P.names[0], ldx: 6, ldy: 12 });
    plot.arrow(0, 0, a2[0], a2[1], { color: 'warn', width: 2.8, label: P.names[1], ldx: 6, ldy: -10 });
    if (P.b) {
      const b = vec(P.b, E);
      plot.arrow(0, 0, b[0], b[1], { color: 'gold', width: 2.6, label: 'b', ldx: 8, ldy: -10 });
    }
    if (P.label && !flat) {
      const c = [(a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2];
      plot.text(`${txt(det)}`, c[0], c[1], { color: tint, weight: 750, size: 15, align: 'center' });
    }
    if (flat) plot.text('det = 0: the columns lie on one line and the parallelogram is flat', plot.vx0 + 0.1, plot.vy1 - 0.25, { color: 'bad', weight: 650, screen: false });
    if (P.proof && !proof) plot.text('The box picture is drawn for columns in the first quadrant with det > 0.', plot.vx0 + 0.1, plot.vy1 - 0.25, { color: 'ink3', weight: 600 });
    plot.drawHandles();

    // readout
    const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
    const rows = [];
    if (want('A')) rows.push(['$A = [\\,\\mathbf a_1\\ \\mathbf a_2\\,]$', `\\begin{bmatrix} ${num(a1[0])} & ${num(a2[0])} \\\\ ${num(a1[1])} & ${num(a2[1])} \\end{bmatrix}`]);
    if (want('det')) rows.push(['$\\det A$', num(det)]);
    if (want('area')) rows.push(['area $= |\\det A|$', num(Math.abs(det))]);
    if (want('orient')) rows.push(['$\\mathbf a_1 \\to \\mathbf a_2$', flat ? '\\text{no turn: flat}' : det > 0 ? '\\text{counterclockwise} \\;(+)' : '\\text{clockwise} \\;(-)']);
    if (P.b && P.cramer && want('cramer')) {
      const k = P.cramer;
      rows.push([`$\\det A_${k}$ ($\\mathbf b$ in column ${k})`, cr ? num(k === 1 ? cr.D1 : cr.D2) : '\\text{—}']);
      rows.push([`$x_${k} = \\det A_${k} / \\det A$`, cr ? num(cr.x[k - 1]) : '\\text{none: } \\det A = 0']);
    }
    F.readout(P.readout === false ? [] : rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'The parallelogram spanned by the columns: blue when det > 0, red when det < 0. The gold arrow turns from a₁ to a₂ the short way: counterclockwise is positive.');
  return { get: (k) => (k === 'cols' ? own.map((c) => c.slice()) : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where) => {
    if (typeof src === 'number') { if (!Number.isFinite(src)) problems.push(`la-det ${where}: not a finite number`); return; }
    if (typeof src !== 'string') { problems.push(`la-det ${where}: expected a number or an expression`); return; }
    try { fn(src, keys); } catch (e) { problems.push(`la-det ${where}: “${src}” — ${e.message}`); }
  };
  const pair = (C, where) => {
    if (!Array.isArray(C) || C.length !== 2 || !C.every((c) => Array.isArray(c) && c.length === 2)) { problems.push(`la-det ${where} must be two columns [[x, y], [x, y]]`); return; }
    C.forEach((c, i) => c.forEach((s, j) => check(s, `${where}[${i}][${j}]`)));
  };
  pair(P.cols, 'cols');
  if (P.ghost) pair(P.ghost, 'ghost');
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`la-det slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`la-det slider ${s.key} needs a label`);
  }
  if (P.drag && !P.cols.flat().every((v) => typeof v === 'number')) problems.push('la-det: drag needs columns of plain numbers');
  if (P.b) { if (!Array.isArray(P.b) || P.b.length !== 2) problems.push('la-det: b must be [x, y]'); else P.b.forEach((s, i) => check(s, `b[${i}]`)); }
  if (![0, 1, 2].includes(P.cramer)) problems.push('la-det: cramer must be 0, 1 or 2');
  if (P.cramer && !P.b) problems.push('la-det: cramer needs a target b');
  if (P.view != null && !(P.view > 0)) problems.push('la-det: view must be a positive number');
  if (P.center != null && !(Array.isArray(P.center) && P.center.length === 2 && P.center.every(Number.isFinite))) problems.push('la-det: center must be [x, y]');
  for (const s of [...(P.names || []), ...(P.ghostNames || [])]) if (s && /[$\\_^]/.test(String(s))) problems.push(`la-det: label “${s}” is plain text: use Unicode (a₁, e₂), not TeX`);
  if (!(P.readout === true || P.readout === false || (Array.isArray(P.readout) && P.readout.every((k) => ['A', 'det', 'area', 'orient', 'cramer'].includes(k))))) problems.push('la-det: readout must be true, false or a list of A, det, area, orient, cramer');
  return problems;
}
