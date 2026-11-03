// Matrices as transformations: the plane and space deforming, composition,
// determinants as signed area, and inverses that undo.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow, TutorialStep } from '../types';
import type { Graphics } from '../../engine/plot2d';
import type { V3 } from '../../engine/viewport3d';
import { Mat, det, inverse, eig, matmul, transpose, identity } from '../../core/numeric/linalg';
import { pathMatrix, rrefSteps, cond, rot2, rotAxis, axisAngle } from '../../core/numeric/linmap';
import {
  fmt, tnum, pal, Pal, alpha, apply2, lattice2, SHAPES, labeledArrow, orientationArc, snap2, smooth, texMat,
  matParams, readMat, writeMat, MatrixInput, P2, C3, lineSet, lattice3, parallelepiped, dragArrow, clipLineToBox, col3, dashed3,
  setCube,
} from './common';

const eigText = (A: Mat) => eig(A).map((e) => (Math.abs(e.im) < 1e-12 ? fmt(e.re) : `${fmt(e.re)} ${e.im < 0 ? '−' : '+'} ${fmt(Math.abs(e.im))}i`)).join(',  ');

/** Timeline helper: 0 → 1 over `run` seconds, hold, repeat. */
const cycle = (t: number, run: number, hold: number) => { const ph = t % (run + hold); return smooth(ph / run); };

/** The transformed plane: lattice, unit square, a shape and the images of î, ĵ. */
function scene2(g: Graphics, M: Mat, P: Pal, shape: string, opts: { N?: number; fill?: string; labels?: [string, string] } = {}) {
  lattice2(g, M, opts.N ?? 10, P.gridT, 1);
  g.polygon([[0, 0], [1, 0], [1, 1], [0, 1]].map((p) => apply2(M, p as P2)), { fill: alpha(P.v, 0.10), color: alpha(P.v, 0.7), width: 1.2, dash: [4, 3] });
  const pts = SHAPES[shape] ?? SHAPES.F;
  g.polygon(pts.map((p) => apply2(M, p)), { fill: opts.fill ?? alpha(P.res, 0.28), color: P.res, width: 2 });
  const [l1, l2] = opts.labels ?? ['Aî', 'Aĵ'];
  labeledArrow(g, [0, 0], [M[0][0], M[1][0]], P.c1, l1, 3);
  labeledArrow(g, [0, 0], [M[0][1], M[1][1]], P.c2, l2, 3);
}

/** Eigen-directions of a 2×2 matrix as dashed lines, and their images. */
function eigenLines2(g: Graphics, A: Mat, M: Mat, P: Pal) {
  const scalar = Math.abs(A[0][1]) < 1e-12 && Math.abs(A[1][0]) < 1e-12 && Math.abs(A[0][0] - A[1][1]) < 1e-12;
  if (scalar) return;
  for (const e of eig(A)) if (Math.abs(e.im) < 1e-12 && e.vector) {
    const d = e.vector;
    g.line([-d[0] * 30, -d[1] * 30], [d[0] * 30, d[1] * 30], { color: alpha(P.eig, 0.7), width: 1.5, dash: [7, 5] });
    g.point([d[0], d[1]], 3.5, { color: alpha(P.eig, 0.9) });
    g.arrow([0, 0], apply2(M, [d[0], d[1]]), { color: P.eig, width: 3.2 });
  }
}

const SHAPE_CHOICE = { key: 'shape', label: 'Shape', value: 'F', options: [['F', 'letter F'], ['house', 'house'], ['circle', 'unit circle']] as [string, string][] };
const PATH_CHOICE = { key: 'path', label: 'In-between frames', value: 'linear', options: [['linear', 'straight line (1−s)I + sA'], ['polar', 'rotate + stretch (polar)']] as [string, string][] };

const PRESETS2: Record<string, Mat> = {
  shear: [[1, 1], [0, 1]], rot90: [[0, -1], [1, 0]], rot30: rot2(Math.PI / 6).map((r) => r.map((v) => +v.toFixed(4))), stretch: [[2, 0], [0, 0.5]],
  reflect: [[0, 1], [1, 0]], project: [[1, 0], [0, 0]], squash: [[1, 2], [0.5, 1]], sym: [[2, 1], [1, 2]],
};
const PRESET2_OPTIONS: [string, string][] = [['custom', 'custom (sliders / typed)'], ['sym', 'symmetric [[2,1],[1,2]]'], ['shear', 'shear'], ['rot90', 'rotation 90°'], ['rot30', 'rotation 30°'], ['stretch', 'stretch'], ['reflect', 'reflection in y = x'], ['project', 'projection onto x-axis'], ['squash', 'squash onto a line (det 0)']];

/** Applies the preset choice (when it changes) and the typed matrix (when it changes) to the sliders. */
function presetWatcher(ctx: DemoCtx, presets: Record<string, Mat>, letter = 'a') {
  let last = ctx.choices.preset;
  return () => { const p = ctx.choices.preset; if (p !== last) { last = p; if (presets[p]) writeMat(ctx, presets[p], letter); } };
}

// ── 1. 2×2 transformations ─────────────────────────────────────────────────
function transform2dDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -4, x1: 4, y0: -3, y1: 3.5 });
  const input = new MatrixInput(ctx);
  const preset = presetWatcher(ctx, PRESETS2);
  const update = () => {
    preset();
    input.applySquare(2);
    const P = pal(ctx.dark);
    const A = readMat(ctx, 2), s = ctx.params.s;
    const M = pathMatrix(A, s, ctx.choices.path as 'linear' | 'polar');
    const step = ctx.toggles.snap ? 0.5 : 0;
    const dA = det(A);
    plot.setDraw((g) => {
      scene2(g, M, P, ctx.choices.shape);
      if (ctx.toggles.eig) eigenLines2(g, A, M, P);
      if (s > 0.999) {
        g.handle({ id: 'c1', at: [A[0][0], A[1][0]], color: P.c1, onDrag: ([x, y]) => { ctx.setParam('a11', x); ctx.setParam('a21', y); update(); }, constrain: snap2(step) });
        g.handle({ id: 'c2', at: [A[0][1], A[1][1]], color: P.c2, onDrag: ([x, y]) => { ctx.setParam('a12', x); ctx.setParam('a22', y); update(); }, constrain: snap2(step) });
      }
    });
    const rows: Readout[] = [
      { label: 'A', value: texMat(A), tex: true },
      { label: 'progress s', value: fmt(s, 3) },
      { label: 'det A (area factor)', value: fmt(dA), tone: Math.abs(dA) < 1e-9 ? 'bad' : dA < 0 ? 'warn' : 'good' },
      { label: 'trace A', value: fmt(A[0][0] + A[1][1]) },
      { label: 'eigenvalues', value: eigText(A) },
    ];
    if (s < 0.999) rows.splice(2, 0, { label: 'matrix now', value: texMat(M), tex: true });
    ctx.setReadouts(rows);
    ctx.setSteps([
      { title: 'Where the basis vectors go', tex: `A\\hat\\imath = ${texMat([[A[0][0]], [A[1][0]]])},\\quad A\\hat\\jmath = ${texMat([[A[0][1]], [A[1][1]]])}`, detail: 'The columns of A are the images of the basis vectors.' },
      { title: 'Every other vector follows by linearity', tex: `A\\begin{bmatrix}x\\\\y\\end{bmatrix} = x\\,A\\hat\\imath + y\\,A\\hat\\jmath = \\begin{bmatrix}${tnum(A[0][0])}x ${A[0][1] < 0 ? '-' : '+'} ${tnum(Math.abs(A[0][1]))}y\\\\ ${tnum(A[1][0])}x ${A[1][1] < 0 ? '-' : '+'} ${tnum(Math.abs(A[1][1]))}y\\end{bmatrix}` },
    ]);
    ctx.setNote(Math.abs(dA) < 1e-9
      ? 'This matrix **squashes the plane onto a line** (or a point): its columns are parallel, the determinant is 0, and the transformation cannot be undone.'
      : `Grid lines stay **straight, parallel and evenly spaced** and the origin stays put — that is what *linear* means. Everything is decided by two arrows: the red $A\\hat\\imath$ and green $A\\hat\\jmath$ (the columns of $A$; drag them). Areas scale by $|\\det A| = ${tnum(Math.abs(dA))}$${dA < 0 ? ', and the negative sign means the plane has been **flipped** (the F is mirrored)' : ''}.`);
    ctx.warn(input.warning || (ctx.choices.path === 'polar' && dA <= 0 && s > 0 && s < 1 ? 'det A ≤ 0: no rotate-and-stretch path reaches a flip, so the straight-line path is used.' : ''));
  };
  return { update, tick() { ctx.setParam('s', cycle(ctx.time.t, 2.5, 1.2)); update(); }, dispose() {} };
}

// ── 2. 3×3 transformations: space, rotations, signed volume ────────────────
function presets3(angleDeg: number): Record<string, Mat> {
  const a = (angleDeg * Math.PI) / 180, r = (M: Mat) => M.map((row) => row.map((v) => +v.toFixed(5)));
  return {
    rotz: r(rotAxis([0, 0, 1], a)), rotaxis: r(rotAxis([1, 1, 1], a)), shear: [[1, 0, 1], [0, 1, 0.5], [0, 0, 1]], scale: [[1.5, 0, 0], [0, 0.75, 0], [0, 0, 1.25]],
    reflect: [[1, 0, 0], [0, 1, 0], [0, 0, -1]], project: [[1, 0, 0], [0, 1, 0], [0, 0, 0]], perm: [[0, 0, 1], [1, 0, 0], [0, 1, 0]], general: [[1.2, 0.6, 0], [0.2, 1.1, 0.5], [-0.4, 0.3, 1.3]],
  };
}

function transform3dDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  setCube(view, 2);
  const input = new MatrixInput(ctx);
  const grid = lineSet(view, 200, 0.5);
  const ghost = lineSet(view, 20, 0.6);
  const eigLines = lineSet(view, 80, 0.95);
  const box = parallelepiped(view);
  const step = () => (ctx.toggles.snap ? 0.5 : 0);
  const cols = [C3.c1, C3.c2, C3.c3];
  const arrows = [0, 1, 2].map((j) => dragArrow(view, cols[j], ['Aî', 'Aĵ', 'Ak̂'][j], (p) => { ctx.setParam(`a1${j + 1}`, p[0]); ctx.setParam(`a2${j + 1}`, p[1]); ctx.setParam(`a3${j + 1}`, p[2]); ctx.setParam('s', 1); update(); }, { snap: step }));
  let lastPreset = ctx.choices.preset, lastAngle = ctx.params.angle;
  const update = () => {
    if (ctx.choices.preset !== lastPreset || (ctx.params.angle !== lastAngle && ctx.choices.preset.startsWith('rot'))) {
      lastPreset = ctx.choices.preset; lastAngle = ctx.params.angle;
      const M = presets3(ctx.params.angle)[ctx.choices.preset];
      if (M) writeMat(ctx, M);
    }
    input.applySquare(3);
    const A = readMat(ctx, 3), s = ctx.params.s;
    const M = pathMatrix(A, s, ctx.choices.path as 'linear' | 'polar');
    const dA = det(A), dM = det(M);
    if (ctx.toggles.lattice) { lattice3(grid, M, 1, ctx.dark ? ['#7a3b44', '#2f6b4c', '#355a96'] : ['#e9a2a8', '#9fd4b6', '#a6c2ef'], 0.5); grid.visible(true); } else grid.visible(false);
    // the original unit cube, faint
    ghost.begin();
    for (const [p, q] of [[[0, 0, 0], [1, 0, 0]], [[0, 0, 0], [0, 1, 0]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 1, 0]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [1, 1, 0]], [[0, 1, 0], [0, 1, 1]], [[0, 0, 1], [1, 0, 1]], [[0, 0, 1], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]]] as [V3, V3][]) dashed3(ghost, p, q, ctx.dark ? '#5b6375' : '#9aa3b5', 1);
    ghost.end();
    ghost.visible(!!ctx.toggles.cube);
    if (ctx.toggles.cube) { box.set(col3(M, 0), col3(M, 1), col3(M, 2), dM >= 0 ? C3.pos : C3.neg, 0.3); box.visible(true); } else box.visible(false);
    arrows.forEach((a, j) => a.set([0, 0, 0], col3(M, j)));
    eigLines.begin();
    const ev = eig(A);
    if (ctx.toggles.eig) for (const e of ev) if (Math.abs(e.im) < 1e-9 && e.vector) {
      const seg = clipLineToBox([0, 0, 0], e.vector as V3, 2);
      if (seg) dashed3(eigLines, seg[0], seg[1], C3.eig, 30);
    }
    eigLines.end();
    const orth = matmul(transpose(A), A).every((r, i) => r.every((v, j) => Math.abs(v - (i === j ? 1 : 0)) < 1e-4));
    const rows: Readout[] = [
      { label: 'A', value: texMat(A), tex: true },
      { label: 'det A = signed volume of the box', value: fmt(dA), tone: Math.abs(dA) < 1e-9 ? 'bad' : dA < 0 ? 'warn' : 'good' },
      { label: 'orientation', value: Math.abs(dA) < 1e-9 ? 'space flattened (det 0)' : dA > 0 ? 'preserved (right-handed stays right-handed)' : 'reversed (a mirror image)', tone: dA < 0 ? 'warn' : undefined },
      { label: 'eigenvalues', value: eigText(A) },
      { label: 'AᵀA = I ?', value: orth ? (dA > 0 ? 'yes — a rotation' : 'yes — a rotation with a reflection') : 'no' },
    ];
    if (s < 0.999) rows.splice(1, 0, { label: `det of the frame at s = ${fmt(s, 2)}`, value: fmt(dM) });
    if (orth && dA > 0) { const { axis, angle } = axisAngle(A); rows.push({ label: 'rotation angle, axis', value: `${fmt((angle * 180) / Math.PI, 4)}°, (${axis.map((x) => fmt(x, 3)).join(', ')})` }); }
    ctx.setReadouts(rows);
    ctx.setNote(orth && dA > 0
      ? 'A **rotation matrix**: its columns are orthonormal ($A^{\\mathsf T}A = I$) and $\\det A = +1$. Lengths and angles are preserved — this is how physics turns a vector between frames (the attitude of a spacecraft, a rigid body, a change of coordinates). The one real eigenvalue, 1, is the **axis** (dashed violet).'
      : `The cube becomes a parallelepiped spanned by the three columns. Its volume is $|\\det A| = ${tnum(Math.abs(dA))}$; the sign records orientation — **orange** means the image is a mirror image (a right hand becomes a left hand).${Math.abs(dA) < 1e-9 ? ' Here the box is flat: space is squashed onto a plane or line, and $A$ has no inverse.' : ''} Dashed violet lines are real eigen-directions: they are mapped into themselves.`);
    ctx.warn(input.warning || (ctx.choices.path === 'polar' && dA <= 0 && s > 0 && s < 1 ? 'det A ≤ 0: no rotation-and-stretch path reaches a reflection, so the straight-line path is used (watch the box flatten as it flips).' : ''));
  };
  return { update, tick() { ctx.setParam('s', cycle(ctx.time.t, 3, 1.5)); update(); }, dispose() { view.clear(); } };
}

// ── 3. composition: matrix multiplication ──────────────────────────────────
const PAIRS: Record<string, [Mat, Mat]> = {
  rotshear: [[[0, -1], [1, 0]], [[1, 1], [0, 1]]],
  scalerot: [[[2, 0], [0, 0.5]], [[0, -1], [1, 0]]],
  reflections: [[[1, 0], [0, -1]], [[0, 1], [1, 0]]],
  commuting: [[[2, 0], [0, 3]], [[0.5, 0], [0, 1.5]]],
};
function matmulDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -4, x1: 4, y0: -3, y1: 3.5 });
  const input = new MatrixInput(ctx);
  let lastPair = ctx.choices.preset;
  const update = () => {
    if (ctx.choices.preset !== lastPair) { lastPair = ctx.choices.preset; const pr = PAIRS[lastPair]; if (pr) { writeMat(ctx, pr[0], 'a'); writeMat(ctx, pr[1], 'b'); } }
    const got = input.poll();
    if (got) {
      if (got.length >= 2 && got.every((M) => M.length === 2 && M[0].length === 2)) { writeMat(ctx, got[0], 'a'); writeMat(ctx, got[1], 'b'); }
      else input.warning = 'Type two 2×2 matrices separated by a semicolon: A = [[0,-1],[1,0]]; B = [[1,1],[0,1]]';
    }
    const P = pal(ctx.dark);
    const A = readMat(ctx, 2, 'a'), B = readMat(ctx, 2, 'b'), s = ctx.params.s;
    const swap = ctx.choices.order === 'BA';
    const first = swap ? A : B, second = swap ? B : A;
    const firstName = swap ? 'A' : 'B', secondName = swap ? 'B' : 'A';
    const mode = ctx.choices.path as 'linear' | 'polar';
    const M = s <= 1 ? pathMatrix(first, s, mode) : matmul(pathMatrix(second, s - 1, mode), first);
    const AB = matmul(A, B), BA = matmul(B, A);
    const commute = AB.every((r, i) => r.every((v, j) => Math.abs(v - BA[i][j]) < 1e-9));
    plot.setDraw((g) => {
      if (ctx.toggles.ghost) {
        const other = swap ? AB : BA;
        g.polygon((SHAPES[ctx.choices.shape] ?? SHAPES.F).map((p) => apply2(other, p)), { color: alpha(P.err, 0.9), width: 1.6, dash: [5, 4] });
      }
      scene2(g, M, P, ctx.choices.shape);
    });
    const prod = swap ? BA : AB;
    ctx.setReadouts([
      { label: 'stage', value: s <= 1 ? `applying ${firstName} first (${fmt(s * 100, 3)}%)` : `then ${secondName} (${fmt((s - 1) * 100, 3)}%)` },
      { label: 'A', value: texMat(A), tex: true },
      { label: 'B', value: texMat(B), tex: true },
      { label: 'AB (B first, then A)', value: texMat(AB), tex: true },
      { label: 'BA (A first, then B)', value: texMat(BA), tex: true },
      { label: 'AB = BA ?', value: commute ? 'yes — these two commute' : 'no — order matters', tone: commute ? 'good' : 'warn' },
      { label: 'det(AB) = det A · det B', value: `${fmt(det(AB))} = ${fmt(det(A))} · ${fmt(det(B))}` },
    ]);
    const X = swap ? B : A, Y = swap ? A : B;          // product X·Y
    const steps: StepRow[] = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) steps.push({
      title: `Entry (${i + 1}, ${j + 1}) of ${swap ? 'BA' : 'AB'}: row ${i + 1} of ${swap ? 'B' : 'A'} · column ${j + 1} of ${swap ? 'A' : 'B'}`,
      tex: `${tnum(X[i][0])}\\cdot${tnum(Y[0][j])} + ${tnum(X[i][1])}\\cdot${tnum(Y[1][j])} = ${tnum(prod[i][j])}`,
    });
    steps.push({ title: 'Why this rule', detail: `Column $j$ of the product is ${swap ? 'B' : 'A'} applied to column $j$ of ${swap ? 'A' : 'B'} — where the second map sends the place the first map put $\\hat e_j$.` });
    ctx.setSteps(steps);
    ctx.setNote(`Play the timeline: the plane is transformed by **${firstName}** and then, from where it landed, by **${secondName}**. The combined map is the single matrix $${secondName}${firstName}$ — read right to left, like function composition $(${secondName}\\circ ${firstName})(\\mathbf x) = ${secondName}(${firstName}\\mathbf x)$.${ctx.toggles.ghost ? ` The dashed orange outline is where the shape ends up in the other order${commute ? ' — here the same place' : ', a different place: matrix multiplication is **not commutative**'}.` : ''}`);
    ctx.warn(input.warning);
  };
  return { update, tick() { ctx.setParam('s', 2 * cycle(ctx.time.t, 4.5, 1.2)); update(); }, dispose() {} };
}

// ── 4. determinant: signed area ────────────────────────────────────────────
function determinantDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -3, x1: 4, y0: -2.5, y1: 3.5 });
  const input = new MatrixInput(ctx);
  const update = () => {
    input.applySquare(2);
    const P = pal(ctx.dark);
    const A = readMat(ctx, 2), s = ctx.params.s;
    const M = pathMatrix(A, s, 'linear');
    const dA = det(A), dM = det(M);
    const a1: P2 = [M[0][0], M[1][0]], a2: P2 = [M[0][1], M[1][1]];
    const step = ctx.toggles.snap ? 0.5 : 0;
    const col = Math.abs(dM) < 1e-9 ? P.muted : dM > 0 ? P.pos : P.neg;
    plot.setDraw((g) => {
      lattice2(g, M, 8, P.gridT, 1);
      if (ctx.toggles.cells) {
        // the images of unit cells: each has area |det|
        for (let i = -2; i < 2; i++) for (let j = -2; j < 2; j++) if (i || j) g.polygon([[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map((p) => apply2(M, p as P2)), { fill: alpha(col, (i + j) % 2 ? 0.07 : 0.13) });
      }
      g.polygon([[0, 0], [1, 0], [1, 1], [0, 1]], { color: alpha(P.muted, 0.9), width: 1.2, dash: [4, 4] });
      if (ctx.toggles.circle) {
        g.polygon(SHAPES.circle.map((p) => [p[0] * 0.5 + 0.5, p[1] * 0.5 + 0.5] as P2), { color: alpha(P.v, 0.6), width: 1.2, dash: [3, 3] });
        g.polygon(SHAPES.circle.map((p) => apply2(M, [p[0] * 0.5 + 0.5, p[1] * 0.5 + 0.5])), { fill: alpha(P.v, 0.22), color: P.v, width: 1.6 });
      }
      g.polygon([[0, 0], a1, [a1[0] + a2[0], a1[1] + a2[1]], a2], { fill: alpha(col, 0.32), color: col, width: 2 });
      const r = 0.35 * Math.min(Math.hypot(...a1), Math.hypot(...a2), 2);
      if (r > 0.05 && Math.abs(dM) > 1e-9) orientationArc(g, a1, a2, r, col);
      g.text([(a1[0] + a2[0]) / 2, (a1[1] + a2[1]) / 2], `det = ${fmt(dM, 3)}`, { color: P.ink, font: '600 15px Inter, sans-serif', align: 'center', baseline: 'middle' });
      labeledArrow(g, [0, 0], a1, P.c1, 'a₁', 3);
      labeledArrow(g, [0, 0], a2, P.c2, 'a₂', 3);
      g.handle({ id: 'a1', at: a1, color: P.c1, onDrag: ([x, y]) => { ctx.setParam('a11', x); ctx.setParam('a21', y); ctx.setParam('s', 1); update(); }, constrain: snap2(step) });
      g.handle({ id: 'a2', at: a2, color: P.c2, onDrag: ([x, y]) => { ctx.setParam('a12', x); ctx.setParam('a22', y); ctx.setParam('s', 1); update(); }, constrain: snap2(step) });
    });
    const circleArea = Math.PI * 0.25;
    const rows: Readout[] = [
      { label: 'det A = a₁₁a₂₂ − a₁₂a₂₁', value: `${fmt(A[0][0])}·${fmt(A[1][1])} − ${fmt(A[0][1])}·${fmt(A[1][0])} = ${fmt(dA)}`, tone: Math.abs(dA) < 1e-9 ? 'bad' : dA > 0 ? 'good' : 'warn' },
      { label: 'area of the parallelogram', value: fmt(Math.abs(dA)) },
      { label: 'orientation', value: Math.abs(dA) < 1e-9 ? 'collapsed — no area' : dA > 0 ? 'kept (a₁ → a₂ turns counter-clockwise)' : 'reversed (a₁ → a₂ turns clockwise)' },
    ];
    if (s < 0.999) rows.unshift({ label: `det at s = ${fmt(s, 2)}`, value: fmt(dM) });
    if (ctx.toggles.circle) rows.push({ label: 'disc area: before → after', value: `${fmt(circleArea)} → ${fmt(circleArea * Math.abs(dM))} (×${fmt(Math.abs(dM))})` });
    ctx.setReadouts(rows);
    ctx.setSteps([
      { title: 'The formula', tex: `\\det ${texMat(A)} = (${tnum(A[0][0])})(${tnum(A[1][1])}) - (${tnum(A[0][1])})(${tnum(A[1][0])}) = ${tnum(dA)}` },
      { title: 'As a cross product', detail: `$\\det A$ is the $z$-component of $\\mathbf a_1\\times\\mathbf a_2$ (with $z=0$ appended): positive when $\\mathbf a_2$ lies counter-clockwise of $\\mathbf a_1$.` },
      { title: 'Every region scales the same way', detail: `The unit square has area 1 and becomes the parallelogram; a region of area $S$ becomes one of area $|\\det A|\\,S$, because it is (in the limit) made of tiny squares.` },
    ]);
    ctx.setNote(Math.abs(dA) < 1e-9
      ? 'The columns are parallel: the square collapses onto a line, the area is **0**, and $A$ is not invertible.'
      : `The unit square (dashed) becomes the parallelogram on $\\mathbf a_1, \\mathbf a_2$ — the columns of $A$ — and its area is $|\\det A| = ${tnum(Math.abs(dA))}$. The **sign** says whether the turn from $\\mathbf a_1$ to $\\mathbf a_2$ is counter-clockwise like $\\hat\\imath \\to \\hat\\jmath$ (blue, +) or clockwise (orange, −, the plane is flipped).`);
    ctx.warn(input.warning);
  };
  return { update, tick() { ctx.setParam('s', cycle(ctx.time.t, 2.5, 1.2)); update(); }, dispose() {} };
}

// ── 5. the inverse undoes ──────────────────────────────────────────────────
const augTex = (M: Mat, split: number) => `\\left[\\begin{array}{${'c'.repeat(split)}|${'c'.repeat(M[0].length - split)}}${M.map((r) => r.map((v) => tnum(v)).join(' & ')).join(' \\\\ ')}\\end{array}\\right]`;

function inverseDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -4, x1: 4, y0: -3, y1: 3.5 });
  const input = new MatrixInput(ctx);
  const update = () => {
    input.applySquare(2);
    const P = pal(ctx.dark);
    const A = readMat(ctx, 2), s = ctx.params.s;
    const Ai = inverse(A), dA = det(A);
    const singular = !Ai || Math.abs(dA) < 1e-9;
    const M = s <= 1 ? pathMatrix(A, s) : singular ? A : matmul(pathMatrix(Ai!, s - 1), A);
    const x: P2 = [ctx.params.xx, ctx.params.xy];
    const b = apply2(A, x);
    plot.setDraw((g) => {
      scene2(g, M, P, ctx.choices.shape, { labels: ['', ''] });
      // x and b = Ax, both draggable
      labeledArrow(g, [0, 0], x, P.u, 'x', 2.4);
      labeledArrow(g, [0, 0], b, P.err, 'b = Ax', 2.4);
      g.line(x, b, { color: alpha(P.muted, 0.7), width: 1, dash: [3, 4] });
      g.handle({ id: 'x', at: x, color: P.u, onDrag: ([px, py]) => { ctx.setParam('xx', px); ctx.setParam('xy', py); update(); }, constrain: snap2(0) });
      if (!singular) g.handle({ id: 'b', at: b, color: P.err, onDrag: (q) => { const xn = apply2(Ai!, q); ctx.setParam('xx', Math.round(xn[0] * 1000) / 1000); ctx.setParam('xy', Math.round(xn[1] * 1000) / 1000); update(); } });
      if (singular) {
        // everything on x + null space lands on the same b
        const n: P2 = Math.abs(A[0][0]) + Math.abs(A[0][1]) > 1e-12 ? [-A[0][1], A[0][0]] : [-A[1][1], A[1][0]];
        const l = Math.hypot(...n);
        if (l > 1e-12) g.line([x[0] - (n[0] / l) * 30, x[1] - (n[1] / l) * 30], [x[0] + (n[0] / l) * 30, x[1] + (n[1] / l) * 30], { color: alpha(P.err, 0.7), width: 1.6, dash: [6, 4] });
      }
    });
    const rows: Readout[] = [
      { label: 'stage', value: s <= 1 ? `applying A (${fmt(s * 100, 3)}%)` : singular ? 'A⁻¹ does not exist' : `undoing with A⁻¹ (${fmt((s - 1) * 100, 3)}%)` },
      { label: 'A', value: texMat(A), tex: true },
      { label: 'A⁻¹', value: singular ? 'does not exist (det A = 0)' : texMat(Ai!), tex: !singular, tone: singular ? 'bad' : undefined },
      { label: 'det A, det A⁻¹', value: singular ? `${fmt(dA)}, —` : `${fmt(dA)}, ${fmt(1 / dA)}` },
      { label: 'x = A⁻¹b', value: `(${fmt(x[0])}, ${fmt(x[1])})` },
      { label: 'b = Ax', value: `(${fmt(b[0])}, ${fmt(b[1])})` },
    ];
    const k = singular ? Infinity : cond(A);
    rows.push({ label: 'condition number κ(A)', value: fmt(k), tone: k > 1e3 ? 'bad' : k > 30 ? 'warn' : undefined });
    ctx.setReadouts(rows);
    // Gauss–Jordan on [A | I]
    const aug = A.map((r, i) => [...r, ...identity(2)[i]]);
    const { steps } = rrefSteps(aug);
    const rowsS: StepRow[] = [{ title: 'Start from [A | I]', tex: augTex(aug, 2) }];
    for (const st of steps) rowsS.push({ title: st.op, tex: augTex(st.M, 2), rule: st.kind === 'swap' ? 'swap rows' : st.kind === 'scale' ? 'scale a row' : 'eliminate' });
    rowsS.push(singular ? { title: 'The left block cannot become I', detail: 'A row of zeros appeared on the left: A has no inverse.' } : { title: 'The right block is A⁻¹', tex: `A^{-1} = ${texMat(Ai!)}` });
    ctx.setSteps(rowsS);
    ctx.setNote(singular
      ? 'With $\\det A = 0$ the plane is squashed onto a line: every point on the dashed line through **x** lands on the same **b**. Information is lost, so nothing can undo it — **no inverse exists**, and $A\\mathbf x=\\mathbf b$ has either no solution or infinitely many.'
      : 'Play the timeline: $A$ deforms the plane, then $A^{-1}$ carries every point back — $A^{-1}A = I$. Drag **b** and watch **x** = $A^{-1}\\mathbf b$ follow: solving $A\\mathbf x = \\mathbf b$ is running the transformation backwards. The Steps tab shows Gauss–Jordan elimination turning $[A\\,|\\,I]$ into $[I\\,|\\,A^{-1}]$.');
    ctx.warn(input.warning || (singular ? 'det A = 0: A is not invertible.' : k > 1e3 ? `A is ill-conditioned (κ ≈ ${fmt(k, 2)}): small changes in b cause large changes in x.` : ''));
  };
  return { update, tick() { ctx.setParam('s', 2 * cycle(ctx.time.t, 4.5, 1.2)); update(); }, dispose() {} };
}

// ── tutorials ──────────────────────────────────────────────────────────────
const near = (a: number, b: number, tol = 0.051) => Math.abs(a - b) <= tol;

const transformTutorial: TutorialStep[] = [
  { text: 'A $2\\times2$ matrix is a **machine that moves every point of the plane**. Start with the identity: nothing moves. The red and green arrows are where $\\hat\\imath = (1,0)$ and $\\hat\\jmath = (0,1)$ land.', set: { params: { a11: 1, a12: 0, a21: 0, a22: 1, s: 1 }, choices: { preset: 'custom', shape: 'F', path: 'linear' }, toggles: { eig: false, snap: true } }, task: 'Drag the red arrow to (2, 0).', done: (c) => near(c.params.a11, 2) && near(c.params.a21, 0) },
  { text: 'You stretched the plane horizontally: the **first column** of $A$ is now $(2, 0)$ — the columns of a matrix are exactly the images of the basis vectors. Everything else follows: $A(x, y) = x\\,A\\hat\\imath + y\\,A\\hat\\jmath$.', task: 'Drag the green arrow to (1, 1) to make a shear.', done: (c) => near(c.params.a12, 1) && near(c.params.a22, 1) },
  { text: 'Grid lines stayed **straight, parallel and evenly spaced**, and the origin did not move. That is the whole definition of a linear map: $A(\\mathbf u+\\mathbf v) = A\\mathbf u + A\\mathbf v$ and $A(c\\mathbf u) = cA\\mathbf u$.', task: 'Press play on the timeline (or drag the progress slider s) to watch the plane morph from I to A.', done: (c) => c.time.t > 0.5 || c.params.s < 0.9 },
  { text: 'Try a **rotation** by 90°: $\\hat\\imath \\to (0,1)$, $\\hat\\jmath \\to (-1,0)$. Switch “In-between frames” to *rotate + stretch* to see it turn rigidly.', set: { params: { s: 1 }, choices: { preset: 'rot90' } }, task: 'Make the matrix [[0, −1], [1, 0]] (the preset does it).', done: (c) => near(c.params.a11, 0) && near(c.params.a21, 1) && near(c.params.a12, -1) && near(c.params.a22, 0) },
  { text: 'Now a **reflection**: swap the roles of $\\hat\\imath$ and $\\hat\\jmath$. Look at the letter F — it is now mirror-written. The determinant became negative: orientation is reversed.', set: { choices: { preset: 'reflect' } }, task: 'Find a matrix with negative determinant by dragging (e.g. move the red arrow to (−1, 0)).', done: (c) => det(readMat(c, 2)) < -0.01 },
  { text: 'Finally, the most important special directions: **eigenvectors**, which the matrix only stretches. Turn on Eigenvectors with the symmetric matrix $[[2,1],[1,2]]$: the violet arrows stay on their dashed lines (stretched by 3 and by 1).', set: { choices: { preset: 'sym' }, toggles: { eig: true }, params: { s: 1 } }, task: 'Slide s from 0 to 1 and watch the violet arrows stay on their lines.', done: (c) => c.params.s < 0.5 },
  { text: 'Squash the plane: make the two columns parallel. The plane collapses onto a line, the determinant is 0, and no matrix can undo this. Next: **Determinant** and **Inverse** demos.', set: { choices: { preset: 'squash' }, toggles: { eig: false } }, task: 'Drag a column so that det A = 0 (the columns become parallel).', done: (c) => Math.abs(det(readMat(c, 2))) < 0.02 },
];

const determinantTutorial: TutorialStep[] = [
  { text: 'The determinant answers: **by how much does $A$ scale area?** The dashed unit square has area 1; its image is the parallelogram on the columns $\\mathbf a_1, \\mathbf a_2$.', set: { params: { a11: 2, a12: 0, a21: 0, a22: 1, s: 1 }, toggles: { snap: true, cells: false, circle: false } }, task: 'Drag a₂ up to (0, 2). What happens to the area?', done: (c) => near(c.params.a12, 0) && near(c.params.a22, 2) },
  { text: 'A diagonal matrix $\\mathrm{diag}(2, 2)$ multiplies area by $2\\cdot2 = 4$. Now **shear**: slide the top edge sideways. Base and height do not change, so neither does the area.', task: 'Drag a₂ to (1.5, 2) — det stays 4.', done: (c) => near(c.params.a12, 1.5) && near(c.params.a22, 2) },
  { text: 'Turn on **unit cells**: every little square of the grid turns into a copy of the parallelogram, so *every* region — even the disc — has its area multiplied by the same $|\\det A|$.', set: { toggles: { cells: true, circle: true } }, task: 'Read the disc area before → after in the panel; check the ratio equals |det A|.', done: (c) => c.toggles.circle },
  { text: 'Now the **sign**. Drag $\\mathbf a_2$ across the line of $\\mathbf a_1$. When $\\mathbf a_2$ ends up clockwise from $\\mathbf a_1$, the parallelogram turns orange and the determinant goes negative: the plane has been **flipped** like a page turned over.', set: { params: { a11: 2, a12: 1, a21: 0, a22: 1.5, s: 1 }, toggles: { cells: false, circle: false } }, task: 'Make the determinant negative.', done: (c) => det(readMat(c, 2)) < -0.01 },
  { text: 'There is no way to get from + to − without passing **through 0**: the parallelogram must flatten on the way. Play the timeline to watch $(1-s)I + sA$ go from area 1 to a negative area — at some instant the square is a segment.', task: 'Play the animation (or move s) and catch the moment det = 0.', done: (c) => c.params.s < 0.99 && Math.abs(det(pathMatrix(readMat(c, 2), c.params.s))) < 0.06 },
  { text: '**Determinant 0** means the columns are parallel: area is destroyed, a whole line of vectors is sent to 0, and the matrix has no inverse. In 3D the same story holds for volume — open *3×3 matrices in space*.', task: 'Make det A exactly 0 (snap helps).', done: (c) => Math.abs(det(readMat(c, 2))) < 1e-9 },
];

export const transformDemos: DemoDef[] = [
  {
    id: 'linalg.transform2d', module: 'linalg', title: 'Matrices as transformations of the plane', topic: 'Matrix transformations; linearity; columns as images of basis vectors',
    summary: 'A 2×2 matrix moves every point of the plane. Drag the images of î and ĵ (the columns) and watch the grid, the unit square and a shape deform; eigen-directions stay on their own lines.',
    tex: 'A\\begin{bmatrix}x\\\\y\\end{bmatrix} = x\\begin{bmatrix}a_{11}\\\\a_{21}\\end{bmatrix} + y\\begin{bmatrix}a_{12}\\\\a_{22}\\end{bmatrix}',
    view: '2d', animated: true,
    params: [...matParams([[2, 1], [0.5, 1.5]]), { key: 's', label: 'progress s (I → A)', value: 1, min: 0, max: 1, step: 0.01 }],
    choices: [{ key: 'preset', label: 'Preset', value: 'custom', options: PRESET2_OPTIONS }, SHAPE_CHOICE, PATH_CHOICE],
    toggles: [{ key: 'eig', label: 'Eigenvectors', value: true }, { key: 'snap', label: 'Snap to ½-grid', value: true }],
    input: { label: 'Matrix', value: 'A = [[2, 1], [0.5, 1.5]]', placeholder: 'A = [[cos(pi/6), -sin(pi/6)], [sin(pi/6), cos(pi/6)]]' },
    experiments: [
      'Pick each preset and predict where î and ĵ go before you look.',
      'Rotation 90° with the straight-line path: the plane shrinks half-way. Switch to rotate + stretch.',
      'Type A = [[cos(pi/6), -sin(pi/6)], [sin(pi/6), cos(pi/6)]] — a rotation by 30°. What are its eigenvalues?',
      'Make the two columns parallel. Which points end up at the origin?',
    ],
    connections: ['linalg.determinant', 'linalg.matmul', 'linalg.eigen', 'linalg.transform3d', 'linalg.inverse'],
    tutorial: transformTutorial,
    accuracy: 'The transformation is exact. The in-between frames are a choice of path from I to A — the straight line (1−s)I + sA or a polar rotate-then-stretch path; only s = 1 is the matrix itself.',
    create: transform2dDemo,
  },
  {
    id: 'linalg.transform3d', module: 'linalg', title: '3×3 matrices in space: rotations and signed volume', topic: 'Matrix transformations in 3D; determinants as signed volume; rotation matrices',
    summary: 'A 3×3 matrix deforms all of space. The lattice and the unit cube follow; the cube becomes a parallelepiped whose signed volume is det A. Drag the three column arrows, or pick a rotation, shear, reflection or projection.',
    tex: '\\det A = \\mathbf a_1\\cdot(\\mathbf a_2\\times\\mathbf a_3),\\qquad R^{\\mathsf T}R = I,\\ \\det R = 1',
    view: '3d', animated: true,
    params: [...matParams(presets3(60).general, 'a', 3), { key: 'angle', label: 'rotation angle (°)', value: 60, min: -180, max: 180, step: 1 }, { key: 's', label: 'progress s (I → A)', value: 1, min: 0, max: 1, step: 0.01 }],
    choices: [{ key: 'preset', label: 'Preset', value: 'general', options: [['general', 'a general matrix'], ['rotz', 'rotation about z'], ['rotaxis', 'rotation about (1,1,1)'], ['shear', 'shear'], ['scale', 'axis scaling'], ['reflect', 'reflection in the xy-plane'], ['project', 'projection onto the xy-plane'], ['perm', 'cyclic permutation of axes']] }, { ...PATH_CHOICE, value: 'polar' }],
    toggles: [{ key: 'lattice', label: 'Lattice', value: true }, { key: 'cube', label: 'Unit cube → box', value: true }, { key: 'eig', label: 'Eigen-directions', value: true }, { key: 'snap', label: 'Snap tips to ½-grid', value: true }],
    input: { label: 'Matrix', value: 'A = [[1.2, 0.6, 0], [0.2, 1.1, 0.5], [-0.4, 0.3, 1.3]]', placeholder: 'A = [[0,-1,0],[1,0,0],[0,0,1]]' },
    experiments: [
      'Rotation about z: change the angle. The z-axis is the dashed eigen-direction (λ = 1); det stays exactly 1.',
      'Cyclic permutation of axes: it is a rotation by 120° about (1, 1, 1) — check the readout.',
      'Reflection in the xy-plane: the box turns orange (det −1). Can any rotation produce this?',
      'Projection onto the xy-plane: the box is flat, det = 0. Which vectors are sent to 0?',
      'Drag one column into the plane of the other two and watch the volume vanish.',
    ],
    connections: ['linalg.transform2d', 'linalg.determinant', 'linalg.rank', 'linalg.inertia', 'linalg.svd'],
    accuracy: 'Exact transformation; eigenvalues by shifted QR (numerical, ~1e−12). In-between frames are a chosen path from I to A (polar by default for det A > 0).',
    create: transform3dDemo,
  },
  {
    id: 'linalg.matmul', module: 'linalg', title: 'Matrix multiplication as composition', topic: 'Matrix operations; products as consecutive transformations; non-commutativity',
    summary: 'Watch B act first and A second — the result is the single matrix AB. Swap the order to see BA, usually somewhere else entirely.',
    tex: '(AB)\\mathbf x = A(B\\mathbf x),\\qquad (AB)_{ij} = \\sum_k a_{ik}b_{kj},\\qquad AB \\ne BA',
    view: '2d', animated: true,
    params: [...matParams(PAIRS.rotshear[0], 'a', 3), ...matParams(PAIRS.rotshear[1], 'b', 3), { key: 's', label: 'progress s (0 → first → second)', value: 2, min: 0, max: 2, step: 0.01 }],
    choices: [{ key: 'order', label: 'Order', value: 'AB', options: [['AB', 'AB: B first, then A'], ['BA', 'BA: A first, then B']] }, { key: 'preset', label: 'Pair', value: 'rotshear', options: [['rotshear', 'A rotation, B shear'], ['scalerot', 'A stretch, B rotation'], ['reflections', 'two reflections'], ['commuting', 'two diagonal (commute)'], ['custom', 'custom']] }, SHAPE_CHOICE, PATH_CHOICE],
    toggles: [{ key: 'ghost', label: 'Outline of the other order', value: true }],
    input: { label: 'Matrices', value: 'A = [[0, -1], [1, 0]]; B = [[1, 1], [0, 1]]', placeholder: 'A = [[…]]; B = [[…]]' },
    experiments: [
      'Play AB, then switch the order to BA. The orange outline shows the other order\'s result.',
      'Two reflections compose to a rotation: which angle?',
      'Diagonal matrices commute. Why does stretching along the axes not care about order?',
      'Check det(AB) = det A · det B for every pair: areas scale twice.',
    ],
    connections: ['linalg.transform2d', 'linalg.inverse', 'linalg.diagonalize'],
    accuracy: 'Exact products. The animation shows the first map, then the second map applied to the result (each along the chosen in-between path).',
    create: matmulDemo,
  },
  {
    id: 'linalg.determinant', module: 'linalg', title: 'The determinant as signed area', topic: 'Determinants; signed area; orientation',
    summary: 'The determinant of a 2×2 matrix is the signed area of the parallelogram on its columns: how much the matrix scales every area, and whether it flips the plane.',
    tex: '\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix} = ad - bc = \\pm\\,\\text{area}(\\mathbf a_1,\\mathbf a_2)',
    view: '2d', animated: true,
    params: [...matParams([[2, 0.5], [0.5, 1.5]], 'a', 4), { key: 's', label: 'progress s (I → A)', value: 1, min: 0, max: 1, step: 0.01 }],
    toggles: [{ key: 'snap', label: 'Snap to ½-grid', value: true }, { key: 'cells', label: 'Images of unit cells', value: true }, { key: 'circle', label: 'A disc (area check)', value: false }],
    input: { label: 'Matrix', value: 'A = [[2, 0.5], [0.5, 1.5]]', placeholder: 'A = [[a, b], [c, d]]' },
    experiments: [
      'Shear the parallelogram (move a₂ parallel to a₁): the area does not change.',
      'Drag a₂ across the line of a₁ and watch the sign flip — and the colour change.',
      'Play the timeline with a negative-determinant matrix: the area must pass through 0.',
      'Make the columns parallel: det = 0. Why can such a matrix not be inverted?',
    ],
    connections: ['linalg.transform2d', 'linalg.transform3d', 'linalg.inverse', 'linalg.eigen'],
    tutorial: determinantTutorial,
    accuracy: 'Exact (ad − bc in floating point). The animation uses the straight-line path (1−s)I + sA, whose determinant is a quadratic in s.',
    create: determinantDemo,
  },
  {
    id: 'linalg.inverse', module: 'linalg', title: 'Inverse matrices: undoing a transformation', topic: 'Inverse matrices; solving Ax = b; Gauss–Jordan',
    summary: 'A moves the plane, A⁻¹ moves it back. Drag x or b = Ax; the Steps tab row-reduces [A | I] to [I | A⁻¹]. When det A = 0, a whole line collapses to one point and nothing can undo it.',
    tex: 'A^{-1}A = AA^{-1} = I,\\qquad A^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}',
    view: '2d', animated: true,
    params: [...matParams([[1.5, 1], [0.5, 1.5]], 'a', 4), { key: 'xx', label: '$x_1$', value: 1, min: -4, max: 4, step: 0.01 }, { key: 'xy', label: '$x_2$', value: 1, min: -4, max: 4, step: 0.01 }, { key: 's', label: 'progress s (A, then A⁻¹)', value: 1, min: 0, max: 2, step: 0.01 }],
    choices: [SHAPE_CHOICE],
    input: { label: 'Matrix', value: 'A = [[1.5, 1], [0.5, 1.5]]', placeholder: 'A = [[a, b], [c, d]]' },
    experiments: [
      'Play the timeline: the F is carried away by A and brought home by A⁻¹.',
      'Drag b around and watch x = A⁻¹b move — that is solving the system.',
      'Type A = [[1, 2], [0.5, 1]] (det 0). Drag x along the dashed line: b does not move.',
      'Try A = [[1, 1], [1, 1.001]]: nearly singular, huge condition number — a tiny change of b moves x far.',
    ],
    connections: ['linalg.determinant', 'linalg.systems', 'linalg.matmul', 'linalg.rank'],
    accuracy: 'A⁻¹ by LU with partial pivoting (exact up to rounding); the Gauss–Jordan steps use the same pivoting as the library rref. κ(A) is the 2-norm condition number from the SVD.',
    create: inverseDemo,
  },
];
