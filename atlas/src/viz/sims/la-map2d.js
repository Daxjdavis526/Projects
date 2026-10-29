// A linear map of the plane, x ↦ Ax, drawn as what it does to everything at
// once: the grid (the plane's own grid faint, its image bold), the unit
// square and a lopsided “F” inside it (so a reflection shows), and the arrows
// Ae₁ and Ae₂ — the images of the two unit vectors, which are the columns of
// A. Entries may be numbers or expressions of slider keys (a rotation through
// a slider angle), or the columns' tips may be dragged. Several maps can be
// composed and shown stage by stage, in either order: the composite's matrix
// is their product written right to left. An input vector x can be drawn
// with its image Ax built tip to tail as x₁a₁ + x₂a₂ (the column picture),
// and a target b asks which x reaches it. Options add the inverse map, the
// real invariant lines (eigenvector directions) and a blend from I to A. The
// 2×2 algebra lives in model/la-linear.js (test/la-linear.test.mjs).
//
//   { type: 'la-map2d', params: {
//       A: [[2, 1], [0, 1]],            // the map: numbers, or expressions of slider keys ('cos(th)')
//       maps: null,                     // or a composition, applied first to last: [{ name: 'R', A: […] }, { name: 'S', A: […] }]
//                                       //   (name: one letter, shown as TeX; label: plain text for the stage buttons)
//       order: false,                   // with maps: also offer the opposite order
//       stage: null,                    // with maps: how many are applied at the start (default all)
//       stages: true,                   // with maps: a control to step through them
//       drag: false, snap: 0.5,         // drag the tips of Ae₁ and Ae₂ (a single map of plain numbers)
//       sliders: [], constants: {},
//       shape: 'F',                     // 'F' (inside the unit square) | 'square' | 'circle' | 'none'
//       grid: true, ghost: true,        // the image of the grid lines; the shape before the map, faint
//       columns: true, colNames: ['Ae₁', 'Ae₂'],   // the column arrows and their labels (plain text)
//       x: null,                        // an input vector [x₁, x₂] (numbers or expressions), drawn with its image Ax
//       xName: 'x', imageName: 'Ax',    // their labels (plain text)
//       combo: false,                   // build Ax tip to tail, x₁a₁ then x₂a₂ (the column picture)
//       target: null, targetName: 'b',  // a point to reach (numbers or expressions)
//       inverse: false,                 // a toggle that applies A⁻¹ after A, when it exists
//       eigen: false,                   // dashed lines the map sends onto themselves, with their stretch λ
//       morph: false,                   // a slider t: the picture of (1 − t)I + tA — a straight-line blend, not a motion
//       view: 3,                        // the window's half-height, in grid units (equal axes)
//       readout: true,                  // the matrix and det; false hides every number; or a list of 'A', 'det', 'x', 'Ax', 'inv'
//   } }

import { Plot } from '../plot.js';
import { fn } from '../model/exprfn.js';
import * as M from '../model/la-linear.js';

export const defaults = {
  A: [[1, 0], [0, 1]], maps: null, order: false, stage: null, stages: true, drag: false, snap: 0.5, sliders: [], constants: {},
  shape: 'F', grid: true, ghost: true, columns: true, colNames: ['Ae₁', 'Ae₂'], x: null, xName: 'x', imageName: 'Ax', combo: false, target: null, targetName: 'b',
  inverse: false, eigen: false, morph: false, view: 3, readout: true,
};

// an F that is not symmetric about any line, drawn inside the unit square
const F_SHAPE = [[0.15, 0.1], [0.15, 0.9], [0.78, 0.9], [0.78, 0.74], [0.33, 0.74], [0.33, 0.58], [0.64, 0.58], [0.64, 0.42], [0.33, 0.42], [0.33, 0.1]];
const SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];
const CIRCLE = Array.from({ length: 121 }, (_, k) => [Math.cos((2 * Math.PI * k) / 120), Math.sin((2 * Math.PI * k) / 120)]);

const keysOf = (P) => [...(P.sliders || []).map((s) => s.key), ...Object.keys(P.constants || {})];
const num = (x) => {
  if (!Number.isFinite(x)) return '\\text{—}';
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return String(r);
  return String(+x.toFixed(3));
};
const matTeX = (A) => `\\begin{bmatrix} ${num(A[0][0])} & ${num(A[0][1])} \\\\ ${num(A[1][0])} & ${num(A[1][1])} \\end{bmatrix}`;
const colTeX = (v) => `\\begin{bmatrix} ${num(v[0])} \\\\ ${num(v[1])} \\end{bmatrix}`;

export function mount(F, P) {
  // a phone gets a taller 16:10 canvas, so the picture is not squeezed into a thin strip
  const narrow = (F.el.getBoundingClientRect().width || 800) < 560;
  const { canvas } = F.canvas({ aspect: narrow ? '' : 'wide', label: P.alt || 'A linear map of the plane: the grid and a shape before and after' });
  const W = P.view, across = narrow ? 1.6 : 2;
  const plot = new Plot(canvas, { x: [-across * W, across * W], y: [-W, W], equal: true, xlabel: '', ylabel: '', axes: true, grid: true });
  for (const s of P.sliders || []) F.slider(s);
  const keys = keysOf(P);
  const env = () => { const e = { ...(P.constants || {}) }; for (const s of P.sliders || []) e[s.key] = +F.params[s.key]; return e; };
  const ev = (src, E) => (typeof src === 'number' ? src : fn(src, keys)(E));
  const mat = (A, E) => A.map((row) => row.map((s) => ev(s, E)));

  // the maps: one, or a composition
  const maps = P.maps?.length ? P.maps.map((m, k) => ({ name: m.name || String.fromCharCode(65 + k), label: m.label || m.name || `map ${k + 1}`, A: m.A })) : null;
  const own = maps ? null : P.A.map((row) => row.slice());     // a single map's entries (dragging edits them)
  if (maps && P.order) F.choice({ key: 'order', label: 'Order', options: [['forward', `${maps.map((m) => m.label).join(', then ')}`], ['reverse', `${[...maps].reverse().map((m) => m.label).join(', then ')}`]], value: 'forward' });
  if (maps && P.stages) {
    const N = maps.length, WORD = ['', 'one', 'two', 'three', 'four', 'five'];
    const stageName = (k) => (k === 0 ? 'none yet' : k === N ? (N === 2 ? 'both' : `all ${WORD[N] || N}`) : k === 1 ? 'the first' : `the first ${WORD[k] || k}`);
    F.choice({ key: 'stage', label: 'Maps applied', options: Array.from({ length: N + 1 }, (_, k) => [k, stageName(k)]), value: P.stage ?? N });
  }
  if (P.morph) F.slider({ key: 't', label: 'How much of the map, $t$', min: 0, max: 1, step: 0.01, value: 1, explain: 'Draws $(1 - t)I + tA$: a straight-line blend from doing nothing to doing all of $A$ (a rotation blended this way shrinks on the way; it is not a physical motion).' });
  if (P.inverse) F.toggle({ key: 'inv', label: 'Then apply $A^{-1}$', value: false, explain: 'The inverse map, if there is one, sends every point back where it started.' });

  // draggable column tips
  if (P.drag && own) {
    const snap = (v) => (P.snap ? Math.round(v / P.snap) * P.snap : v);
    plot.handle(() => [own[0][0], own[1][0]], (x, y) => { own[0][0] = snap(x); own[1][0] = snap(y); }, { hollow: true });
    plot.handle(() => [own[0][1], own[1][1]], (x, y) => { own[0][1] = snap(x); own[1][1] = snap(y); }, { hollow: true });
    plot.onDrag = () => { draw(); F.notify('A'); };
  }
  F.onChange(() => draw());

  const path = (pts, A) => pts.map((p) => M.apply2(A, p));
  function sequence(E) {
    if (!maps) return { list: [{ name: 'A', A: mat(own, E) }], applied: 1 };
    const list = maps.map((m) => ({ name: m.name, A: mat(m.A, E) }));
    if (F.params.order === 'reverse') list.reverse();
    const applied = P.stages ? +(F.params.stage ?? maps.length) : P.stage ?? maps.length;
    return { list, applied };
  }

  function draw() {
    plot.clear();
    const g = plot.ctx, E = env();
    const { list, applied } = sequence(E);
    const done = list.slice(0, applied);
    let A = M.compose2(done.map((m) => m.A));
    const before = M.compose2(done.slice(0, -1).map((m) => m.A));
    if (P.morph) A = M.blend2(A, +F.params.t);
    const Ainv = M.inv2(A);
    const undo = P.inverse && F.params.inv;
    const shown = undo && Ainv ? M.I2 : A;                 // what the picture's final stage is

    g.save(); plot._clip();
    // the image of the grid lines
    if (P.grid) {
      const corners = [[plot.vx0, plot.vy0], [plot.vx1, plot.vy0], [plot.vx0, plot.vy1], [plot.vx1, plot.vy1]];
      const inv = M.inv2(shown);
      const K = Math.min(60, inv ? Math.ceil(Math.max(...corners.map((c) => Math.max(...M.apply2(inv, c).map(Math.abs))))) + 1 : 30);
      for (let k = -K; k <= K; k++) {
        const w = k === 0 ? 1.6 : 1, alpha = k === 0 ? 0.75 : 0.32;
        const a = M.apply2(shown, [k, -K]), b = M.apply2(shown, [k, K]);
        plot.line(a[0], a[1], b[0], b[1], { color: 'accent', width: w, alpha });
        const c = M.apply2(shown, [-K, k]), d = M.apply2(shown, [K, k]);
        plot.line(c[0], c[1], d[0], d[1], { color: 'accent', width: w, alpha });
      }
    }
    // the shape: before (faint), the stage before this one (dashed), and now
    const base = P.shape === 'circle' ? CIRCLE : P.shape === 'square' ? SQUARE : P.shape === 'F' ? F_SHAPE : null;
    const ring = P.shape === 'F' ? SQUARE : null;
    if (base && P.ghost) {
      plot.path(base, { close: true, color: 'ink3', width: 1.2, dash: [4, 4], fill: 'ink3', fillAlpha: 0.08 });
      if (ring) plot.path(ring, { close: true, color: 'ink4', width: 1, dash: [3, 4] });
    }
    if (base && maps && applied > 1 && !undo) plot.path(path(base, before), { close: true, color: 'violet', width: 1.4, dash: [6, 5], fill: 'violet', fillAlpha: 0.08 });
    if (base && undo && Ainv) plot.path(path(base, A), { close: true, color: 'ink3', width: 1.2, dash: [6, 5] });
    if (ring) plot.path(path(ring, shown), { close: true, color: 'gold', width: 1.6, fill: 'gold', fillAlpha: 0.1 });
    if (base) plot.path(path(base, shown), { close: true, color: undo && Ainv ? 'good' : 'accent', width: 2, fill: undo && Ainv ? 'good' : 'accent', fillAlpha: 0.32 });
    // invariant lines
    if (P.eigen) {
      const e = M.eigen2(shown);
      if (Array.isArray(e)) for (const { lambda, dir } of e) {
        const R = 6 * W;
        plot.line(-R * dir[0], -R * dir[1], R * dir[0], R * dir[1], { color: 'violet', width: 2, dash: [7, 5] });
        // label near the window's edge, on the side where the line leaves upward or rightward
        const s = dir[1] < 0 || (dir[1] === 0 && dir[0] < 0) ? -1 : 1;
        const t = Math.min(Math.abs(dir[0]) > 1e-9 ? (plot.vx1 - 0.3) / Math.abs(dir[0]) : Infinity, Math.abs(dir[1]) > 1e-9 ? (plot.vy1 - 0.25) / Math.abs(dir[1]) : Infinity) * 0.9;
        plot.text(`λ = ${num(lambda)}`, s * dir[0] * t, s * dir[1] * t, { color: 'violet', weight: 700, dx: 6, dy: -10 });
      }
    }
    g.restore();
    if (undo && !Ainv) plot.text('No inverse: this map squashes the plane onto a line, and nothing can undo that.', plot.vx0 + 0.15, plot.vy1 - 0.3, { color: 'bad', weight: 650 });
    // columns, input and target
    const a1 = [shown[0][0], shown[1][0]], a2 = [shown[0][1], shown[1][1]];
    if (P.columns) {
      plot.arrow(0, 0, a1[0], a1[1], { color: 'good', width: 2.8, label: P.colNames[0], ldx: 6, ldy: 12 });
      plot.arrow(0, 0, a2[0], a2[1], { color: 'warn', width: 2.8, label: P.colNames[1], ldx: 6, ldy: -10 });
    }
    let x = null;
    if (P.x) {
      x = P.x.map((s) => ev(s, E));
      const Ax = M.apply2(shown, x);
      if (P.combo) {
        const p1 = [x[0] * a1[0], x[0] * a1[1]];
        plot.arrow(0, 0, p1[0], p1[1], { color: 'good', width: 2, dash: [6, 4] });
        plot.arrow(p1[0], p1[1], Ax[0], Ax[1], { color: 'warn', width: 2, dash: [6, 4] });
      } else plot.arrow(0, 0, x[0], x[1], { color: 'ink3', width: 1.8, dash: [5, 4], label: P.xName, ldx: 6, ldy: -10 });
      plot.arrow(0, 0, Ax[0], Ax[1], { color: 'gold', width: 3, label: P.combo ? 'x₁a₁ + x₂a₂' : P.imageName, ldx: 8, ldy: -12 });
    }
    if (P.target) {
      const b = P.target.map((s) => ev(s, E));
      plot.point(b[0], b[1], { color: 'bad', r: 7, label: P.targetName, ldx: 10, ldy: -12 });
      plot.point(b[0], b[1], { color: 'panel', r: 4 });
    }
    plot.drawHandles();

    // readout
    const want = (k) => P.readout === true || (Array.isArray(P.readout) && P.readout.includes(k));
    const name = maps ? done.map((m) => m.name).reverse().join('') || 'I' : 'A';
    const rows = [];
    if (want('A')) rows.push([`$${maps ? name : 'A'}$`, `${matTeX(A)}`]);
    if (want('det')) rows.push([`$\\det ${maps ? (done.length > 1 ? `(${name})` : name) : 'A'}$`, num(M.det2(A))]);
    if (P.x && want('x')) rows.push(['$\\mathbf x$', colTeX(x)]);
    if (P.x && want('Ax')) rows.push([`$${maps ? name : 'A'}\\mathbf x$`, colTeX(M.apply2(A, x))]);
    if (P.inverse && want('inv')) rows.push(['$A^{-1}$', Ainv ? matTeX(Ainv) : '\\text{none: } \\det A = 0']);
    F.readout(P.readout === false ? [] : rows);
  }
  F.draw(draw);
  F.caption(P.caption || 'Faint: the plane before the map. Bold: after it — the grid, the unit square (gold) and the F. The arrows are where the map sends e₁ and e₂: the columns of the matrix.');
  return { get: (k) => (k === 'A' && own ? own.map((r) => r.slice()) : F.params[k]) };
}

/** Node-side check used by the content tests. */
export function validate(P) {
  const problems = [];
  const keys = keysOf(P);
  const check = (src, where) => {
    if (typeof src === 'number') { if (!Number.isFinite(src)) problems.push(`${where}: not a finite number`); return; }
    if (typeof src !== 'string') { problems.push(`${where}: expected a number or an expression`); return; }
    try { fn(src, keys); } catch (e) { problems.push(`la-map2d ${where}: “${src}” — ${e.message}`); }
  };
  const mat = (A, where) => {
    if (!Array.isArray(A) || A.length !== 2 || !A.every((r) => Array.isArray(r) && r.length === 2)) { problems.push(`${where} must be a 2×2 matrix [[a, b], [c, d]]`); return; }
    A.forEach((r, i) => r.forEach((s, j) => check(s, `${where}[${i}][${j}]`)));
  };
  for (const s of P.sliders || []) {
    if (!(s.min < s.max) || s.value < s.min || s.value > s.max) problems.push(`slider ${s.key}: value must lie in [min, max]`);
    if (!s.label) problems.push(`slider ${s.key} needs a label`);
  }
  if (P.maps?.length) P.maps.forEach((m, k) => mat(m.A, `maps[${k}].A`));
  else mat(P.A, 'A');
  if (P.drag && (P.maps?.length || !P.A.flat().every((v) => typeof v === 'number'))) problems.push('drag needs a single map of plain numbers');
  for (const [k, v] of [['x', P.x], ['target', P.target]]) if (v) { if (!Array.isArray(v) || v.length !== 2) problems.push(`${k} must be [x₁, x₂]`); else v.forEach((s, i) => check(s, `${k}[${i}]`)); }
  if (!['F', 'square', 'circle', 'none'].includes(P.shape)) problems.push('shape must be F, square, circle or none');
  if (!(P.view > 0)) problems.push('view must be a positive number');
  if (P.stage != null && P.maps && !(P.stage >= 0 && P.stage <= P.maps.length)) problems.push('stage must be between 0 and the number of maps');
  for (const s of [...(P.colNames || []), P.targetName, P.xName, P.imageName, ...(P.maps || []).map((m) => m.label)]) if (s && /[$\\_^]/.test(String(s))) problems.push(`label “${s}” is plain text: use Unicode (a₁, e₂), not TeX`);
  return problems;
}
