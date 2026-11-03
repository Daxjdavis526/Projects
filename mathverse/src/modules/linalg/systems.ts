// Linear systems as intersecting lines and planes, solved by row reduction
// with every operation animated; rank, null space and column space as what a
// matrix squashes and what it reaches.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, StepRow } from '../types';
import type { V3 } from '../../engine/viewport3d';
import type { ParamSpec } from '../../core/input/classify';
import { Mat, rref } from '../../core/numeric/linalg';
import { rrefSteps, solveSystem, nullBasis, lerpMat, pathMatrix } from '../../core/numeric/linmap';
import { colormap } from '../../engine/colors';
import {
  fmt, tnum, smooth, clamp, texMat, texVec, vecStr, matParams, readMat, writeMat, MatrixInput, C3, planePatch, clipPlaneToBox, clipLineToBox,
  lineSet, dragArrow, dashed3, mv3, add3, mul3, cross3, len3,
  setCube,
  segPts,
} from './common';

const augTex = (M: Mat) => `\\left[\\begin{array}{${'c'.repeat(M[0].length - 1)}|c}${M.map((r) => r.map((v) => tnum(v)).join(' & ')).join(' \\\\ ')}\\end{array}\\right]`;

// ── 1. linear systems ──────────────────────────────────────────────────────
const SYS: Record<string, { size: string; Ab: Mat }> = {
  unique: { size: '3', Ab: [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]] },
  line: { size: '3', Ab: [[1, 1, 1, 3], [1, -1, 2, 2], [2, 0, 3, 5]] },
  none: { size: '3', Ab: [[1, 1, 1, 3], [1, -1, 2, 2], [2, 0, 3, 1]] },
  two3: { size: '23', Ab: [[1, 1, 1, 3], [1, -1, 2, 2]] },
  lines: { size: '2', Ab: [[1, 1, 3], [1, -1, 1]] },
  parallel: { size: '2', Ab: [[1, 2, 2], [2, 4, -2]] },
};

function sysParams(): ParamSpec[] {
  const out: ParamSpec[] = [];
  const Ab = SYS.unique.Ab;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) out.push({ key: `a${i + 1}${j + 1}`, label: `$a_{${i + 1}${j + 1}}$`, value: Ab[i][j], min: -6, max: 6, step: 0.01 });
    out.push({ key: `b${i + 1}`, label: `$b_{${i + 1}}$`, value: Ab[i][3], min: -15, max: 15, step: 0.01 });
  }
  out.push({ key: 'k', label: 'row operations applied', value: 0, min: 0, max: 12, step: 0.01 });
  return out;
}

function readSystem(ctx: DemoCtx, size: string): Mat {
  const m = size === '3' ? 3 : 2, n = size === '2' ? 2 : 3;
  return Array.from({ length: m }, (_, i) => [...Array.from({ length: n }, (_, j) => ctx.params[`a${i + 1}${j + 1}`]), ctx.params[`b${i + 1}`]]);
}
function writeSystem(ctx: DemoCtx, Ab: Mat) {
  Ab.forEach((r, i) => { r.slice(0, -1).forEach((v, j) => ctx.setParam(`a${i + 1}${j + 1}`, v)); ctx.setParam(`b${i + 1}`, r[r.length - 1]); });
}
const eqText = (r: number[], vars = ['x', 'y', 'z']) => {
  const terms = r.slice(0, -1).map((c, j) => ({ c, v: vars[j] })).filter((t) => Math.abs(t.c) > 1e-12);
  if (!terms.length) return `0 = ${tnum(r[r.length - 1])}`;
  return terms.map((t, i) => `${i === 0 ? (t.c < 0 ? '-' : '') : t.c < 0 ? ' - ' : ' + '}${Math.abs(Math.abs(t.c) - 1) < 1e-12 ? '' : tnum(Math.abs(t.c))}${t.v}`).join('') + ` = ${tnum(r[r.length - 1])}`;
};

function systemsDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  const R = 4;
  setCube(view, R);
  const cols = [C3.c1, C3.c2, C3.c3];
  const planes = cols.map((c) => planePatch(view, c, 0.26));
  const lines2: (ReturnType<typeof view.addCurve> | null)[] = [null, null];
  let solLine: ReturnType<typeof view.addCurve> | null = null;
  const solPt = view.addPoint([0, 0, 0], { color: '#ffffff', size: 0.13 });
  const solLabel = view.addLabel([0, 0, 0], '');
  const input = new MatrixInput(ctx);
  let lastPreset = ctx.choices.preset, lastSize = '', solKey = '';
  let typedSize: string | null = null;                 // a typed matrix decides its own size until the preset changes
  const sizeOf = () => typedSize ?? SYS[ctx.choices.preset]?.size ?? ctx.choices.preset.replace('custom', '');
  const update = () => {
    if (ctx.choices.preset !== lastPreset) {
      lastPreset = ctx.choices.preset; typedSize = null;
      const p = SYS[lastPreset];
      if (p) { writeSystem(ctx, p.Ab); ctx.setParam('k', 0); }
    }
    const got = input.poll();
    if (got) {
      const M = got[0];
      const ok = (M.length === 3 && M[0].length === 4) || (M.length === 2 && (M[0].length === 3 || M[0].length === 4));
      if (ok) { typedSize = M.length === 3 ? '3' : M[0].length === 3 ? '2' : '23'; writeSystem(ctx, M); ctx.setParam('k', 0); }
      else input.warning = 'Type the augmented matrix [A | b] row by row: 3×4 (three planes), 2×4 (two planes) or 2×3 (two lines).';
    }
    if (sizeOf() !== lastSize) { lastSize = sizeOf(); view.view(lastSize === '2' ? 'top' : 'iso'); }
    const size = sizeOf(), flat = size === '2';
    const Ab = readSystem(ctx, size);
    const { steps } = rrefSteps(Ab);
    const K = steps.length;
    const kk = clamp(ctx.params.k, 0, K), i = Math.floor(kk), f = kk - i;
    const before = i === 0 ? Ab : steps[i - 1].M;
    const cur = f > 1e-9 && i < K ? lerpMat(before, steps[i].M, smooth(f)) : before;
    // draw each row: a plane (3 unknowns) or a line in the xy-plane (2 unknowns)
    planes.forEach((pl, r) => {
      if (flat || r >= cur.length) { pl.visible(false); return; }
      const row = cur[r];
      pl.visible(true);
      pl.set(clipPlaneToBox([row[0], row[1], row[2]], row[3], R));
    });
    lines2.forEach((l, r) => {
      l?.dispose(); lines2[r] = null;
      if (!flat) return;
      const [a, b, c] = cur[r];
      const nl = Math.hypot(a, b);
      if (nl < 1e-9) return;
      const p0: V3 = [(a * c) / (nl * nl), (b * c) / (nl * nl), 0];
      const seg = clipLineToBox(p0, [-b, a, 0], R);
      if (seg) lines2[r] = view.addCurve(segPts(seg), { color: cols[r], radius: 0.045 });
    });
    // the solution set (it never changes under row operations)
    const sol = solveSystem(Ab);
    const key = `${size}|${Ab.flat().join(',')}`;
    if (key !== solKey) {
      solKey = key;
      solLine?.dispose(); solLine = null;
      if (sol.kind === 'infinite' && sol.dirs.length === 1) {
        const seg = clipLineToBox([...sol.x!, 0].slice(0, 3) as V3, [...sol.dirs[0], 0].slice(0, 3) as V3, R);
        if (seg) solLine = view.addCurve(segPts(seg), { color: '#ffffff', radius: 0.05 });
      }
    }
    const xs = sol.x ? ([...sol.x, 0].slice(0, 3) as V3) : null;
    solPt.visible(sol.kind === 'unique'); solLabel.visible(sol.kind === 'unique');
    if (sol.kind === 'unique' && xs) { solPt.set(xs); solLabel.set(add3(xs, flat ? [0.45, 0.4, 0] : [0, 0, 0.45]), `(${xs.slice(0, flat ? 2 : 3).map((v) => fmt(v, 3)).join(', ')})`); }
    const vars = ['x', 'y', 'z'];
    const solText = sol.kind === 'unique' ? `unique: (${sol.x!.map((v) => fmt(v, 4)).join(', ')})`
      : sol.kind === 'none' ? 'none — the system is inconsistent'
        : `infinitely many: ${vecStr(sol.x!)} + ${sol.dirs.map((d, q) => `t${sol.dirs.length > 1 ? q + 1 : ''}·${vecStr(d)}`).join(' + ')}`;
    ctx.setReadouts([
      { label: 'operation', value: i < K ? (f > 1e-9 ? `doing ${steps[i].op}` : i === 0 ? 'the original system' : `after ${steps[i - 1].op}`) : 'reduced row echelon form' },
      { label: `[A | b] after ${Math.min(i, K)} of ${K} steps`, value: augTex(cur), tex: true },
      { label: 'rank A', value: String(sol.rank) },
      { label: 'solutions', value: solText, tone: sol.kind === 'unique' ? 'good' : sol.kind === 'none' ? 'bad' : 'warn' },
    ]);
    const rows: StepRow[] = [{ title: `${i === 0 && f < 1e-9 ? '▶ ' : ''}The system`, tex: `\\begin{aligned}${Ab.map((r) => eqText(r, vars).replace('=', '&=')).join('\\\\')}\\end{aligned}\\quad ${augTex(Ab)}` }];
    steps.forEach((st, q) => rows.push({ title: `${q + 1 === i && f < 1e-9 ? '▶ ' : ''}${st.op}`, tex: augTex(st.M), rule: st.kind === 'swap' ? 'swap rows' : st.kind === 'scale' ? 'scale a row' : 'eliminate' }));
    rows.push({ title: 'Read off the solution', detail: solText });
    ctx.setSteps(rows);
    const what = flat ? 'line' : 'plane';
    const Rfin = K ? steps[K - 1].M : Ab;
    const badRow = Rfin.find((r) => r.slice(0, -1).every((v) => Math.abs(v) < 1e-9) && Math.abs(r[r.length - 1]) > 1e-9)?.[Ab[0].length - 1] ?? 0;
    ctx.setNote(`Each equation is a ${what}; a solution is a point on **all** of them. Row operations replace an equation by a combination of equations, so every new ${what} still passes through every solution — the ${what}s **turn about the solution set** until each is perpendicular to an axis and the answer can be read off. Play the timeline or drag *row operations applied*.${sol.kind === 'none' ? ` Here elimination produced the row $0 = ${tnum(badRow)}$: no point lies on all the ${what}s.` : ''}`);
    ctx.warn(input.warning || (sol.kind === 'none' ? 'Inconsistent system: the ' + what + 's have no common point.' : ''));
  };
  return {
    update,
    tick(dt) { const K = rrefSteps(readSystem(ctx, sizeOf())).steps.length; let k = ctx.params.k + dt * 0.6; if (k > K + 1.5) k = 0; ctx.setParam('k', Math.min(k, 12)); update(); },
    reset() { ctx.setParam('k', 0); },
    dispose() { view.clear(); },
  };
}

// ── 2. rank, null space and column space ───────────────────────────────────
const RANK: Record<string, Mat> = {
  rank3: [[1, 0.5, 0], [0, 1, 0.5], [0.5, 0, 1]],
  rank2: [[1, 0, 1], [0, 1, 1], [1, 1, 2]],
  rank1: [[0.5, 1, -0.5], [1, 2, -1], [-0.5, -1, 0.5]],
};
function rankDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  const R = 3;
  setCube(view, R);
  const input = new MatrixInput(ctx);
  // the domain cloud: lattice points of [−1, 1]³, coloured by original height
  const pts: V3[] = [];
  for (let a = -1; a <= 1.001; a += 0.5) for (let b = -1; b <= 1.001; b += 0.5) for (let c = -1; c <= 1.001; c += 0.5) pts.push([a, b, c]);
  const NULLN = 41;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((pts.length + NULLN * NULLN) * 3), colr = new Float32Array((pts.length + NULLN * NULLN) * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  pts.forEach((p, i) => { const c = colormap('viridis', (p[2] + 1) / 2); colr.set([c.r, c.g, c.b], i * 3); });
  const nullCol = new THREE.Color(C3.err);
  for (let i = pts.length; i < pts.length + NULLN * NULLN; i++) colr.set([nullCol.r, nullCol.g, nullCol.b], i * 3);
  const cloud = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, sizeAttenuation: true }));
  cloud.frustumCulled = false;
  view.addObject(cloud);
  const colPlane = planePatch(view, C3.res, 0.2);
  const lines = lineSet(view, 120, 0.95);
  const xArrow = dragArrow(view, C3.u, 'x', (p) => { ctx.setParam('xx', p[0]); ctx.setParam('xy', p[1]); ctx.setParam('xz', p[2]); update(); }, { snap: () => 0.25 });
  const axArrow = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.v, label: 'Ax' });
  let lastPreset = ctx.choices.preset;
  const update = () => {
    if (ctx.choices.preset !== lastPreset) { lastPreset = ctx.choices.preset; if (RANK[lastPreset]) writeMat(ctx, RANK[lastPreset]); }
    input.applySquare(3);
    const A = readMat(ctx, 3), s = ctx.params.s;
    const M = pathMatrix(A, s);
    const N = nullBasis(A, 1e-9);
    const rank = 3 - N.length;
    const { R: Rr, pivots } = rref(A, 1e-9 * Math.max(1e-300, ...A.flat().map(Math.abs)));
    const colBasis = pivots.map((j) => [A[0][j], A[1][j], A[2][j]] as V3);
    const show = ctx.choices.show;
    // move the cloud
    pts.forEach((p, i) => pos.set(mv3(M, p), i * 3));
    // the null space, sampled, also moving — it ends at the origin
    let n = pts.length;
    if (show !== 'col' && N.length) {
      const nb = N.map((v) => mul3(v as V3, 1 / len3(v as V3)));
      const m = N.length === 1 ? NULLN : 15;
      for (let a = 0; a < m; a++) for (let b = 0; b < (N.length >= 2 ? m : 1); b++) {
        const ta = -2 + (4 * a) / (m - 1), tb = N.length >= 2 ? -2 + (4 * b) / (m - 1) : 0;
        let q = mul3(nb[0], ta);
        if (N.length >= 2) q = add3(q, mul3(nb[1], tb));
        if (N.length === 3) q = add3(q, mul3(cross3(nb[0], nb[1]), 0));
        pos.set(mv3(M, q), n * 3); n++;
      }
    }
    geo.setDrawRange(0, n);
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    // the column space: where everything lands
    colPlane.visible(false);
    lines.begin();
    if (show !== 'null') {
      if (rank === 2) { colPlane.setSpan(colBasis[0], colBasis[1], R); colPlane.visible(true); }
      if (rank === 1) { const seg = clipLineToBox([0, 0, 0], colBasis[0], R); if (seg) { lines.seg(seg[0], seg[1], C3.res); dashed3(lines, seg[0], seg[1], C3.res, 2); } }
    }
    // x, Ax, and the whole affine set x + N(A) that lands on Ax
    const x = [ctx.params.xx, ctx.params.xy, ctx.params.xz] as V3;
    const Ax = mv3(A, x), Mx = mv3(M, x);
    xArrow.set([0, 0, 0], x);
    axArrow.set([0, 0, 0], Ax);
    if (N.length === 1 && show !== 'col') {
      const d = N[0] as V3;
      const seg = clipLineToBox(x, d, R);
      if (seg) {
        const a = mv3(M, seg[0]), b = mv3(M, seg[1]);
        dashed3(lines, a, b, C3.u, 40);
      }
    }
    if (s > 0.01) lines.seg(x, Mx, '#8b93a7');
    lines.end();
    const nullText = N.length ? N.map((v) => vecStr(v)).join(', ') : '{0} only';
    ctx.setReadouts([
      { label: 'A', value: texMat(A), tex: true },
      { label: 'rank A = dim C(A)', value: String(rank), tone: rank === 3 ? 'good' : 'warn' },
      { label: 'nullity = dim N(A)', value: String(N.length) },
      { label: 'rank + nullity', value: `${rank} + ${N.length} = 3 (number of columns)` },
      { label: 'null space basis', value: nullText },
      { label: 'column space basis', value: colBasis.length ? colBasis.map((v) => vecStr(v)).join(', ') : '{0} only' },
      { label: 'Ax', value: vecStr(Ax) },
    ]);
    const free = [0, 1, 2].filter((j) => !pivots.includes(j));
    ctx.setSteps([
      { title: 'Row reduce A', tex: `${texMat(A)} \\;\\longrightarrow\\; ${texMat(Rr)}` },
      { title: `Pivot columns: ${pivots.map((j) => j + 1).join(', ') || 'none'}; free variables: ${free.map((j) => ['x', 'y', 'z'][j]).join(', ') || 'none'}`, detail: `rank = number of pivots = ${rank}. The pivot columns **of A itself** are a basis of the column space.` },
      ...N.map((v, q) => ({ title: `Null-space vector ${q + 1}: set ${['x', 'y', 'z'][free[q]]} = 1, the other free variables 0, solve for the pivots`, tex: `\\mathbf n_{${q + 1}} = ${texVec(v)},\\qquad A\\mathbf n_{${q + 1}} = ${texVec(mv3(A, v as V3))}` })),
    ]);
    ctx.setNote(rank === 3
      ? 'Rank 3: nothing but the origin is sent to 0, and the cloud fills space again after the map — $A$ is invertible, $A\\mathbf x=\\mathbf b$ always has exactly one solution.'
      : `Play the timeline: the cube of points is squashed onto the **column space** (violet ${rank === 2 ? 'plane' : rank === 1 ? 'line' : 'point'}) — every $A\\mathbf x$ lands there, so $A\\mathbf x = \\mathbf b$ is solvable only for $\\mathbf b$ in it. The orange ${N.length === 1 ? 'line' : 'plane'} is the **null space**: all of it collapses to the origin. Drag **x**: the dashed line $\\mathbf x + N(A)$ is every vector with the same image — it collapses onto the single point $A\\mathbf x$. Dimensions add up: ${rank} + ${N.length} = 3.`);
    ctx.warn(input.warning);
  };
  return { update, tick() { const t = ctx.time.t % 4.5; ctx.setParam('s', smooth(t / 3)); update(); }, dispose() { view.clear(); } };
}

export const systemDemos: DemoDef[] = [
  {
    id: 'linalg.systems', module: 'linalg', title: 'Linear systems: intersecting planes and row reduction', topic: 'Linear systems; Gaussian elimination; row operations; solution sets',
    summary: 'Each equation is a plane (or a line); the solutions are where they all meet. Row reduction is shown one operation at a time — the planes turn, but always about the same solution set.',
    tex: 'A\\mathbf x = \\mathbf b \\;\\xrightarrow{\\text{row ops}}\\; R\\,\\mathbf x = \\mathbf c\\quad(\\text{same solutions})',
    view: '3d', animated: true,
    params: sysParams(),
    choices: [{ key: 'preset', label: 'System', value: 'unique', options: [['unique', '3 planes, one point'], ['line', '3 planes through a line'], ['none', '3 planes, no common point'], ['two3', '2 planes in space (a line)'], ['lines', '2 lines, one point'], ['parallel', '2 parallel lines'], ['custom3', 'custom: 3 equations, 3 unknowns'], ['custom23', 'custom: 2 equations, 3 unknowns'], ['custom2', 'custom: 2 equations, 2 unknowns']] }],
    input: { label: 'Augmented matrix [A | b]', value: '[[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]', placeholder: '[[a11, a12, a13, b1], …]' },
    experiments: [
      'Play the unique system: three planes turn one at a time until they are x = 2, y = 3, z = −1.',
      'Choose “3 planes through a line”: the third equation is the sum of the first two, so one row becomes 0 = 0.',
      'Change b₃ slightly in that system: the three planes no longer share a line and the system becomes inconsistent.',
      'Two lines: make them parallel by matching the slopes; then make them the same line.',
    ],
    connections: ['linalg.inverse', 'linalg.rank', 'linalg.leastsquares'],
    accuracy: 'Row reduction uses partial pivoting with a tolerance of 1e−10 (the same algorithm as the library rref; steps are its exact operations). In-between frames blend the row before and after an operation — still a combination of the original rows, so still through the solutions.',
    create: systemsDemo,
  },
  {
    id: 'linalg.rank', module: 'linalg', title: 'Rank, null space and column space', topic: 'Rank; null space; column space; rank–nullity',
    summary: 'Watch a 3×3 matrix act on a cube of points: the null space (orange) is squashed to the origin and everything lands in the column space (violet). Drag x to see every vector with the same image.',
    tex: 'N(A) = \\{\\mathbf x : A\\mathbf x = \\mathbf 0\\},\\quad C(A) = \\{A\\mathbf x\\},\\quad \\operatorname{rank}A + \\dim N(A) = n',
    view: '3d', animated: true,
    params: [...matParams(RANK.rank2, 'a', 3), { key: 'xx', label: '$x_1$', value: 1, min: -2, max: 2, step: 0.01 }, { key: 'xy', label: '$x_2$', value: 0.5, min: -2, max: 2, step: 0.01 }, { key: 'xz', label: '$x_3$', value: 0, min: -2, max: 2, step: 0.01 }, { key: 's', label: 'progress s (I → A)', value: 0, min: 0, max: 1, step: 0.01 }],
    choices: [{ key: 'preset', label: 'Matrix', value: 'rank2', options: [['rank3', 'rank 3 (invertible)'], ['rank2', 'rank 2'], ['rank1', 'rank 1'], ['custom', 'custom']] }, { key: 'show', label: 'Show', value: 'both', options: [['both', 'both'], ['null', 'null space'], ['col', 'column space']] }],
    input: { label: 'Matrix', value: 'A = [[1, 0, 1], [0, 1, 1], [1, 1, 2]]', placeholder: 'A = [[…], […], […]]' },
    experiments: [
      'Play rank 2: the cube flattens into the violet plane while the orange null-space line shrinks to a point.',
      'Rank 1: the null space is a whole plane and the column space a line. Check rank + nullity = 3.',
      'Drag x along the dashed line: Ax does not move. Why does this mean Ax = b has infinitely many solutions when it has one?',
      'Is the column space of the rank-2 matrix the plane spanned by its first two columns? What about the third column?',
    ],
    connections: ['linalg.systems', 'linalg.span', 'linalg.transform3d', 'linalg.svd'],
    accuracy: 'Rank, the null space and the pivot columns come from row reduction with a relative tolerance of 1e−9 (a matrix that is merely close to singular counts as full rank). The animation is the straight path (1−s)I + sA.',
    create: rankDemo,
  },
];
