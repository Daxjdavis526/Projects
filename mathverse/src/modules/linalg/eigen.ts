// Eigenvectors as the directions a matrix only stretches; diagonalization as a
// change to the eigenbasis (and why powers become easy); the SVD as
// rotate–stretch–rotate turning the unit sphere into an ellipsoid.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow, TutorialStep } from '../types';
import type { V3 } from '../../engine/viewport3d';
import { Mat, eig, det, matmul, transpose } from '../../core/numeric/linalg';
import { diagonalize, pathMatrix, properSvd, svdPath, lerpMat, rot2 } from '../../core/numeric/linmap';
import {
  fmt, tnum, pal, alpha, apply2, lattice2, SHAPES, labeledArrow, texMat, texVec, vecStr, smooth, snap2,
  matParams, readMat, writeMat, MatrixInput, P2, C3, lineSet, mv3,
  setCube,
} from './common';

const eigStr = (e: { re: number; im: number }) => (Math.abs(e.im) < 1e-12 ? fmt(e.re) : `${fmt(e.re)} ${e.im < 0 ? '−' : '+'} ${fmt(Math.abs(e.im))}i`);

const EIG_PRESETS: Record<string, Mat> = {
  nonsym: [[1, 1], [0.5, 1.5]], sym: [[2, 1], [1, 2]], shear: [[1, 1], [0, 1]], rot: rot2(Math.PI / 3).map((r) => r.map((v) => +v.toFixed(4))),
  reflect: [[0, 1], [1, 0]], scalar: [[2, 0], [0, 2]], flip: [[-1, 0.5], [0, 1.5]],
};
const EIG_OPTIONS: [string, string][] = [['custom', 'custom'], ['nonsym', '[[1, 1], [0.5, 1.5]]'], ['sym', 'symmetric [[2, 1], [1, 2]]'], ['shear', 'shear (defective)'], ['rot', 'rotation 60° (complex)'], ['reflect', 'reflection (λ = ±1)'], ['scalar', '2I (every vector)'], ['flip', 'a negative eigenvalue']];

function presetWatcher(ctx: DemoCtx, presets: Record<string, Mat>) {
  let last = ctx.choices.preset;
  return () => { const p = ctx.choices.preset; if (p !== last) { last = p; if (presets[p]) writeMat(ctx, presets[p]); } };
}

/** Real eigen-directions of a 2×2 matrix, with a flag for "every direction" (λI). */
function eigDirs(A: Mat): { lambda: number; v: P2 }[] | 'all' {
  if (Math.abs(A[0][1]) < 1e-12 && Math.abs(A[1][0]) < 1e-12 && Math.abs(A[0][0] - A[1][1]) < 1e-12) return 'all';
  const out: { lambda: number; v: P2 }[] = [];
  for (const e of eig(A)) if (Math.abs(e.im) < 1e-12 && e.vector) {
    const v = e.vector as P2;
    if (!out.some((o) => Math.abs(o.v[0] * v[1] - o.v[1] * v[0]) < 1e-9)) out.push({ lambda: e.re, v });
  }
  return out;
}

// ── 1. eigenvectors ────────────────────────────────────────────────────────
function eigenDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -3.5, x1: 3.5, y0: -3, y1: 3 });
  const input = new MatrixInput(ctx);
  const preset = presetWatcher(ctx, EIG_PRESETS);
  const update = () => {
    preset();
    input.applySquare(2);
    const P = pal(ctx.dark);
    const A = readMat(ctx, 2);
    const th = (ctx.params.ang * Math.PI) / 180;
    const x: P2 = [Math.cos(th), Math.sin(th)], Ax = apply2(A, x);
    const crossXA = x[0] * Ax[1] - x[1] * Ax[0], dotXA = x[0] * Ax[0] + x[1] * Ax[1];
    const turn = (Math.atan2(crossXA, dotXA) * 180) / Math.PI;
    const aligned = Math.abs(crossXA) < 0.02 * Math.max(1e-9, Math.hypot(...Ax)) || Math.hypot(...Ax) < 1e-9;
    const dirs = eigDirs(A);
    const ev = eig(A);
    plot.setDraw((g) => {
      g.parametric(Math.cos, Math.sin, 0, 2 * Math.PI, { color: alpha(P.muted, 0.6), width: 1, dash: [4, 4] });
      if (ctx.toggles.ellipse) g.parametric((t) => A[0][0] * Math.cos(t) + A[0][1] * Math.sin(t), (t) => A[1][0] * Math.cos(t) + A[1][1] * Math.sin(t), 0, 2 * Math.PI, { color: alpha(P.v, 0.7), width: 1.4 });
      if (ctx.toggles.ring) {
        for (let k = 0; k < 32; k++) {
          const t = (k / 32) * 2 * Math.PI, u: P2 = [Math.cos(t), Math.sin(t)], Au = apply2(A, u);
          const L = Math.hypot(...Au);
          const sinA = L > 1e-12 ? Math.abs(u[0] * Au[1] - u[1] * Au[0]) / L : 0;
          const good = Math.max(0, 1 - sinA * 4);           // 1 when Au ∥ u
          g.line([0, 0], u, { color: alpha(P.muted, 0.35), width: 1 });
          g.arrow(u, [u[0] + (Au[0] - u[0]) * 0.999, u[1] + (Au[1] - u[1]) * 0.999], { color: good > 0.02 ? alpha(P.eig, 0.35 + 0.65 * good) : alpha(P.muted, 0.45), width: good > 0.5 ? 2.2 : 1.1 });
        }
      }
      if (ctx.toggles.eiglines) {
        if (dirs === 'all') g.text([0, 2.6], 'every direction is an eigen-direction', { color: P.eig, font: '600 14px Inter, sans-serif', align: 'center' });
        else for (const d of dirs) {
          g.line([-d.v[0] * 20, -d.v[1] * 20], [d.v[0] * 20, d.v[1] * 20], { color: alpha(P.eig, 0.8), width: 1.6, dash: [8, 5] });
          const tip: P2 = [d.v[0] * d.lambda, d.v[1] * d.lambda];
          g.text(tip, `λ = ${fmt(d.lambda, 3)}`, { color: P.eig, font: '600 13px Inter, sans-serif' }, 8, -8);
        }
      }
      // the probe and its image; the dashed line is the span of x
      g.line([-x[0] * 20, -x[1] * 20], [x[0] * 20, x[1] * 20], { color: alpha(aligned ? P.eig : P.u, 0.35), width: 1, dash: [3, 5] });
      labeledArrow(g, [0, 0], Ax, aligned ? P.eig : P.v, 'Ax', 3.2);
      labeledArrow(g, [0, 0], x, P.u, 'x', 2.6);
      g.handle({ id: 'x', at: x, color: P.u, onDrag: ([px, py]) => { let a = (Math.atan2(py, px) * 180) / Math.PI; if (a < 0) a += 360; ctx.setParam('ang', Math.round(a * 10) / 10); update(); }, constrain: ([px, py]) => { const l = Math.hypot(px, py) || 1; return [px / l, py / l]; } });
    });
    const tr = A[0][0] + A[1][1], dA = det(A), disc = tr * tr / 4 - dA;
    const rows: Readout[] = [
      { label: 'x (unit)', value: `(${fmt(x[0], 3)}, ${fmt(x[1], 3)})  at ${fmt(ctx.params.ang, 4)}°` },
      { label: 'Ax', value: `(${fmt(Ax[0], 3)}, ${fmt(Ax[1], 3)})` },
      { label: 'angle from x to Ax', value: `${fmt(turn, 3)}°`, tone: aligned ? 'good' : undefined },
      { label: aligned ? 'eigenvector! Ax = λx with λ' : '|Ax| / |x|', value: aligned ? fmt(dotXA, 4) : fmt(Math.hypot(...Ax), 4), tone: aligned ? 'good' : undefined },
      { label: 'eigenvalues', value: ev.map(eigStr).join(',  ') },
      { label: 'characteristic polynomial', value: `\\lambda^2 - ${tnum(tr)}\\lambda + ${tnum(dA)}`, tex: true },
    ];
    ctx.setReadouts(rows);
    const steps: StepRow[] = [
      { title: 'Eigenvectors solve (A − λI)x = 0 with x ≠ 0', detail: 'A nonzero solution exists exactly when A − λI squashes a direction to 0, i.e. when det(A − λI) = 0.' },
      { title: 'Characteristic equation', tex: `\\det\\begin{bmatrix}${tnum(A[0][0])}-\\lambda & ${tnum(A[0][1])}\\\\ ${tnum(A[1][0])} & ${tnum(A[1][1])}-\\lambda\\end{bmatrix} = \\lambda^2 - (${tnum(tr)})\\lambda + (${tnum(dA)}) = 0` },
      { title: 'Solve the quadratic', tex: disc >= 0 ? `\\lambda = \\tfrac{${tnum(tr)}}{2} \\pm \\sqrt{${tnum(disc)}} = ${ev.map((e) => tnum(e.re)).join(',\\ ')}` : `\\lambda = \\tfrac{${tnum(tr)}}{2} \\pm i\\sqrt{${tnum(-disc)}}\\quad\\text{(complex: no real eigenvectors)}` },
    ];
    if (dirs !== 'all') dirs.forEach((d, i) => steps.push({ title: `Eigenvector for λ${i + 1} = ${fmt(d.lambda)}`, tex: `\\mathbf v_{${i + 1}} = ${texVec(d.v)},\\qquad A\\mathbf v_{${i + 1}} = ${texVec(apply2(A, d.v))} = ${tnum(d.lambda)}\\,\\mathbf v_{${i + 1}}` }));
    ctx.setSteps(steps);
    let note: string;
    if (dirs === 'all') note = 'A multiple of the identity stretches **every** vector by the same factor, so every nonzero vector is an eigenvector.';
    else if (disc < -1e-12) note = 'No arrow keeps its direction: this matrix **rotates** every vector. Its eigenvalues are complex, $\\lambda = r e^{\\pm i\\theta}$ — the modulus is the stretch and the angle is the rotation.';
    else if (dirs.length === 1) note = 'Only **one** direction is preserved: the eigenvalue is repeated but there is only one line of eigenvectors. Such a matrix is **defective** and cannot be diagonalized.';
    else note = `Most arrows are knocked off their line. Along the two dashed **eigen-directions** the matrix only stretches: $A\\mathbf v = \\lambda\\mathbf v$ (a negative $\\lambda$ flips the arrow but keeps the line). Drag **x** around the circle — or play the timeline — and watch the violet image arrows: they line up with x exactly at the eigen-directions.${Math.abs(A[0][1] - A[1][0]) < 1e-12 ? ' This matrix is symmetric, so its eigenvectors are **perpendicular** (the spectral theorem).' : ''}`;
    ctx.setNote(note);
    ctx.warn(input.warning);
  };
  return { update, tick(dt) { ctx.setParam('ang', (ctx.params.ang + dt * 30) % 360); update(); }, dispose() {} };
}

// ── 2. diagonalization ─────────────────────────────────────────────────────
const DIAG_PRESETS: Record<string, Mat> = { grow: [[1, 1], [0.5, 1.5]], markov: [[0.8, 0.3], [0.2, 0.7]], fib: [[1, 1], [1, 0]], sym: [[2, 1], [1, 2]], shear: [[1, 1], [0, 1]], rot: EIG_PRESETS.rot };

function diagonalizeDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  plot.setView({ x0: -4, x1: 4, y0: -3, y1: 3.5 });
  const input = new MatrixInput(ctx);
  const preset = presetWatcher(ctx, DIAG_PRESETS);
  const update = () => {
    preset();
    input.applySquare(2);
    const P = pal(ctx.dark);
    const A = readMat(ctx, 2);
    const dg = diagonalize(A);
    const mode = ctx.choices.view;
    if (!dg.ok) {
      plot.setDraw((g) => {
        lattice2(g, A, 8, P.gridT, 1);
        g.polygon(SHAPES.F.map((p) => apply2(A, p)), { fill: alpha(P.res, 0.25), color: P.res, width: 2 });
      });
      ctx.setReadouts([{ label: 'A', value: texMat(A), tex: true }, { label: 'eigenvalues', value: dg.values.map(eigStr).join(',  ') }, { label: 'diagonalizable over ℝ?', value: dg.reason === 'complex' ? 'no — complex eigenvalues' : 'no — too few eigenvectors', tone: 'bad' }]);
      ctx.setSteps([]);
      ctx.setNote(dg.reason === 'complex' ? 'This matrix turns every direction, so there is no real eigenbasis. (Over the complex numbers it *is* diagonalizable — its eigenvalues are a conjugate pair.)' : 'A **defective** matrix: the eigenvalue repeats but its eigenvectors fill only a line, not the plane — there is no basis of eigenvectors. The best one can do is the Jordan form $\\begin{bmatrix}\\lambda&1\\\\0&\\lambda\\end{bmatrix}$.');
      ctx.warn(input.warning || (dg.reason === 'complex' ? 'Complex eigenvalues: not diagonalizable over the reals.' : 'Defective matrix: not diagonalizable.'));
      return;
    }
    const { P: Pm, D, Pinv } = dg;
    const Dm = [[D[0], 0], [0, D[1]]];
    const p1: P2 = [Pm[0][0], Pm[1][0]], p2: P2 = [Pm[0][1], Pm[1][1]];
    if (mode === 'stages') {
      const s = ctx.params.s;
      const M = s <= 1 ? pathMatrix(Pinv, s) : s <= 2 ? matmul(lerpMat([[1, 0], [0, 1]], Dm, s - 1), Pinv) : matmul(pathMatrix(Pm, s - 2), matmul(Dm, Pinv));
      plot.setDraw((g) => {
        lattice2(g, M, 8, alpha(P.muted, 0.28), 1);
        lattice2(g, matmul(M, Pm), 8, alpha(P.eig, 0.55), 1.1);       // the eigen-grid, carried along
        g.polygon(SHAPES.F.map((p) => apply2(M, p)), { fill: alpha(P.res, 0.25), color: P.res, width: 2 });
        labeledArrow(g, [0, 0], apply2(M, p1), P.c1, s >= 0.999 && s < 2.001 ? 'e₁ (was p₁)' : 'p₁', 3);
        labeledArrow(g, [0, 0], apply2(M, p2), P.c2, s >= 0.999 && s < 2.001 ? 'e₂ (was p₂)' : 'p₂', 3);
      });
      const stage = s < 1 ? `P⁻¹: into eigen-coordinates (${fmt(s * 100, 3)}%)` : s < 2 ? `D: stretch the axes by ${fmt(D[0], 3)} and ${fmt(D[1], 3)}` : s < 3 ? `P: back to standard coordinates (${fmt((s - 2) * 100, 3)}%)` : 'done: PDP⁻¹ = A';
      ctx.setReadouts([
        { label: 'stage', value: stage },
        { label: 'P (eigenvectors)', value: texMat(Pm), tex: true },
        { label: 'D', value: texMat(Dm), tex: true },
        { label: 'P⁻¹', value: texMat(Pinv), tex: true },
        { label: 'PDP⁻¹', value: texMat(matmul(Pm, matmul(Dm, Pinv))), tex: true },
      ]);
      ctx.setNote('Play the timeline. First $P^{-1}$ straightens the violet **eigen-grid** into the ordinary square grid — we are now measuring in eigen-coordinates. In those coordinates $A$ is just $D$: stretch each axis by its eigenvalue, no mixing. Then $P$ puts the grid back. Three simple moves make one complicated one: $A = PDP^{-1}$.');
    } else {
      const n = Math.round(ctx.params.n);
      const x0: P2 = [ctx.params.x0, ctx.params.y0];
      const c = apply2(Pinv, x0);                                    // eigen-coordinates of x₀
      const orbit: P2[] = [x0];
      for (let k = 1; k <= n; k++) orbit.push(apply2(A, orbit[k - 1]));
      const viaEig = (k: number): P2 => [c[0] * D[0] ** k * p1[0] + c[1] * D[1] ** k * p2[0], c[0] * D[0] ** k * p1[1] + c[1] * D[1] ** k * p2[1]];
      plot.setDraw((g) => {
        for (const d of [p1, p2]) g.line([-d[0] * 40, -d[1] * 40], [d[0] * 40, d[1] * 40], { color: alpha(P.eig, 0.6), width: 1.4, dash: [8, 5] });
        g.path(orbit, { color: alpha(P.res, 0.8), width: 1.6 });
        orbit.forEach((q, k) => { g.point(q, k === n ? 5.5 : 3.5, { color: k === n ? P.res : alpha(P.res, 0.7) }); if (k <= 6 || k === n) g.text(q, k === 0 ? 'x₀' : `A${k > 1 ? superscript(k) : ''}x₀`, { color: P.ink, font: '12px Inter, sans-serif' }, 7, -7); });
        const k1: P2 = [c[0] * D[0] ** n * p1[0], c[0] * D[0] ** n * p1[1]];
        g.arrow([0, 0], k1, { color: alpha(P.c1, 0.85), width: 2, dash: [6, 4] });
        g.arrow(k1, viaEig(n), { color: alpha(P.c2, 0.85), width: 2, dash: [6, 4] });
        g.handle({ id: 'x0', at: x0, color: P.u, onDrag: ([px, py]) => { ctx.setParam('x0', px); ctx.setParam('y0', py); update(); }, constrain: snap2(0.25) });
      });
      const An = matmul(Pm, matmul([[D[0] ** n, 0], [0, D[1] ** n]], Pinv));
      let direct: Mat = [[1, 0], [0, 1]];
      for (let k = 0; k < n; k++) direct = matmul(A, direct);
      const err = Math.max(...An.flat().map((v, i) => Math.abs(v - direct.flat()[i])));
      const dom = Math.abs(D[0]) >= Math.abs(D[1]) ? 0 : 1;
      ctx.setReadouts([
        { label: 'n', value: String(n) },
        { label: 'Aⁿ = P Dⁿ P⁻¹', value: texMat(An), tex: true },
        { label: 'difference from multiplying n times', value: err.toExponential(1) + ' (rounding)' },
        { label: 'x₀ in eigen-coordinates', value: vecStr(c) },
        { label: 'Aⁿx₀', value: vecStr(orbit[n]) },
        { label: 'dominant eigenvalue', value: `${fmt(D[dom])} along ${vecStr([Pm[0][dom], Pm[1][dom]])}` },
      ]);
      const fib = Math.abs(A[0][0] - 1) < 1e-12 && Math.abs(A[0][1] - 1) < 1e-12 && Math.abs(A[1][0] - 1) < 1e-12 && Math.abs(A[1][1]) < 1e-12;
      ctx.setNote(`Write $\\mathbf x_0 = c_1\\mathbf p_1 + c_2\\mathbf p_2$ in the eigenbasis; then $A^n\\mathbf x_0 = c_1\\lambda_1^n\\mathbf p_1 + c_2\\lambda_2^n\\mathbf p_2$ (red and green dashed) — no repeated multiplication needed. The term with the larger $|\\lambda|$ wins, so the orbit swings onto the **dominant eigen-direction** (that is the power method, and why a Markov chain settles to its steady state).${fib ? ' With $A = [[1,1],[1,0]]$ and $\\mathbf x_0 = (1,0)$ the orbit is $(F_{n+1}, F_n)$ — the Fibonacci numbers, and $\\lambda = \\varphi, -1/\\varphi$ give Binet\'s formula.' : ''}`);
    }
    ctx.setSteps([
      { title: 'Eigenvalues', tex: `\\lambda_1 = ${tnum(D[0])},\\quad \\lambda_2 = ${tnum(D[1])}` },
      { title: 'Eigenvectors as the columns of P', tex: `P = ${texMat(Pm)}` },
      { title: 'Change of basis', tex: `A = P D P^{-1} = ${texMat(Pm)}${texMat(Dm)}${texMat(Pinv)}` },
      { title: 'Powers', tex: `A^n = P D^n P^{-1},\\quad D^n = \\begin{bmatrix}${tnum(D[0])}^n & 0\\\\ 0 & ${tnum(D[1])}^n\\end{bmatrix}` },
    ]);
    ctx.warn(input.warning);
  };
  return { update, tick() { if (ctx.choices.view === 'stages') { const t = ctx.time.t % 7.5; ctx.setParam('s', t < 6 ? 3 * smooth(t / 6) : 3); } else { ctx.setParam('n', Math.floor(ctx.time.t * 1.5) % 13); } update(); }, dispose() {} };
}
const superscript = (k: number) => String(k).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');

// ── 3. the singular value decomposition ────────────────────────────────────
function svdDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  setCube(view, 1.8);
  const input = new MatrixInput(ctx);
  const wire = lineSet(view, 700, 0.55);
  const cols = [C3.c1, C3.c2, C3.c3];
  const vArrows = [0, 1, 2].map((i) => view.addArrow([0, 0, 0], [1, 0, 0], { color: cols[i] }));
  const vLabels = [0, 1, 2].map(() => view.addLabel([0, 0, 0], ''));
  let surf: ReturnType<typeof view.addSurface> | null = null;
  let lastDim = '';
  const update = () => {
    const dim = ctx.choices.dim === '2' ? 2 : 3;
    if (input.applySquare(dim)) ctx.setParam('s', 3);
    const A = readMat(ctx, dim), s = ctx.params.s;
    const f = properSvd(A);
    const M2 = svdPath(A, s, f);
    const M: Mat = dim === 3 ? M2 : [[M2[0][0], M2[0][1], 0], [M2[1][0], M2[1][1], 0], [0, 0, 1]];
    // the sphere (or disc), coloured by where each point started
    const F = dim === 3
      ? (u: number, v: number): V3 => mv3(M, [Math.sin(v) * Math.cos(u), Math.sin(v) * Math.sin(u), Math.cos(v)])
      : (u: number, v: number): V3 => mv3(M, [v * Math.cos(u), v * Math.sin(u), 0]);
    const opts = { uRange: [0, 2 * Math.PI] as [number, number], vRange: (dim === 3 ? [0, Math.PI] : [0, 1]) as [number, number], res: 44, colorBy: (_p: V3, u: number, v: number) => (dim === 3 ? -Math.cos(v) : v * Math.cos(u)), colormap: 'coolwarm' as const, opacity: 0.5 };
    if (!surf || lastDim !== String(dim)) { surf?.dispose(); surf = view.addSurface(F, opts); lastDim = String(dim); } else surf.update(F, opts);
    // latitude / longitude lines carried along, so the rotations are visible
    const W = (u: number, v: number) => F(u, v).map((x) => x * 1.006) as V3;      // just outside the surface
    wire.begin();
    const ink = ctx.dark ? '#e6e9ef' : '#1b1f2a';
    if (dim === 3) {
      for (let k = 1; k < 6; k++) { const v = (k * Math.PI) / 6; for (let i = 0; i < 48; i++) { const a = (i / 48) * 2 * Math.PI, b = ((i + 1) / 48) * 2 * Math.PI; wire.seg(W(a, v), W(b, v), ink); } }
      for (let k = 0; k < 12; k++) { const u = (k * Math.PI) / 6; for (let i = 0; i < 24; i++) wire.seg(W(u, (i / 24) * Math.PI), W(u, ((i + 1) / 24) * Math.PI), k === 0 ? '#f2c14e' : ink); }
    } else {
      for (let k = 1; k <= 4; k++) for (let i = 0; i < 64; i++) wire.seg(F((i / 64) * 2 * Math.PI, k / 4), F(((i + 1) / 64) * 2 * Math.PI, k / 4), ink);
      for (let k = 0; k < 12; k++) wire.seg(F((k * Math.PI) / 6, 0), F((k * Math.PI) / 6, 1), k === 0 ? '#f2c14e' : ink);
    }
    wire.end();
    // right singular vectors vᵢ, carried by the motion: they end as σᵢuᵢ
    const V = f.V, U = f.U, S = f.S;
    for (let i = 0; i < 3; i++) {
      if (i >= dim || !ctx.toggles.vecs) { vArrows[i].visible(false); vLabels[i].visible(false); continue; }
      const vi = (dim === 3 ? [V[0][i], V[1][i], V[2][i]] : [V[0][i], V[1][i], 0]) as V3;
      const img = mv3(M, vi);
      vArrows[i].set([0, 0, 0], img); vArrows[i].visible(true); vLabels[i].visible(true);
      const sub = '₁₂₃'[i];
      vLabels[i].set(mv3(M, vi).map((x) => x * 1.12 + 0) as V3, `<span style="color:${cols[i]}">${s < 0.02 ? `v${sub}` : s > 2.98 ? `σ${sub}u${sub}` : s < 1 ? `v${sub}` : s < 2 ? `σ${sub}e${sub}` : `σ${sub}u${sub}`}</span>`);
    }
    const stage = s < 1 ? `Vᵀ: rotate (${fmt(s * 100, 3)}%) — the vᵢ swing onto the axes` : s < 2 ? `Σ: stretch the axes by ${S.map((x) => fmt(x, 3)).join(', ')}` : s < 3 ? `U: rotate (${fmt((s - 2) * 100, 3)}%) — the axes swing onto the uᵢ` : 'done: UΣVᵀ = A';
    const Sigma = S.map((x, i) => S.map((_, j) => (i === j ? x : 0)));
    const sv = S.map(Math.abs);
    const rows: Readout[] = [
      { label: 'stage', value: stage },
      { label: 'singular values σᵢ', value: sv.map((x) => fmt(x)).join(',  ') },
      { label: 'U', value: texMat(U), tex: true },
      { label: 'Σ', value: texMat(Sigma), tex: true },
      { label: 'Vᵀ', value: texMat(transpose(V)), tex: true },
      { label: `${dim === 3 ? 'volume' : 'area'} factor |det A| = σ₁σ₂${dim === 3 ? 'σ₃' : ''}`, value: `${fmt(Math.abs(det(A)))} = ${sv.map((x) => fmt(x, 3)).join('·')}` },
      { label: 'rank (σ > 0)', value: String(sv.filter((x) => x > 1e-9 * Math.max(1, sv[0])).length) },
      { label: 'condition number σ₁/σₙ', value: sv[dim - 1] > 1e-12 ? fmt(sv[0] / sv[dim - 1]) : '∞' },
    ];
    ctx.setReadouts(rows);
    const AtA = matmul(transpose(A), A);
    ctx.setSteps([
      { title: 'Form AᵀA (symmetric, its eigenvalues are ≥ 0)', tex: `A^{\\mathsf T}A = ${texMat(AtA)}` },
      { title: 'Its eigenvalues are σᵢ², its orthonormal eigenvectors are the vᵢ', tex: `\\sigma_i^2 = ${sv.map((x) => tnum(x * x)).join(',\\ ')},\\qquad V = ${texMat(V)}` },
      { title: 'Each left singular vector is uᵢ = Avᵢ / σᵢ', tex: `U = ${texMat(U)}` },
      { title: 'So A = UΣVᵀ', tex: `${texMat(A)} = ${texMat(U)}${texMat(Sigma)}${texMat(transpose(V))}`, detail: det(A) < 0 ? 'Here det A < 0. To keep U and V as true rotations, the reflection is carried by a negative last entry of Σ (the usual convention puts it in U or V instead, with all σᵢ ≥ 0).' : undefined },
    ]);
    ctx.setNote(`Every matrix is **rotate → stretch → rotate**. Play the timeline: $V^{\\mathsf T}$ turns the sphere so that the orthogonal directions $\\mathbf v_i$ lie along the axes; $\\Sigma$ stretches the axes by the singular values — the sphere becomes an axis-aligned ellipsoid; $U$ turns it into place. The ellipsoid's semi-axes are $\\sigma_i\\mathbf u_i$. In continuum mechanics this is the polar decomposition of a deformation, and the $\\sigma_i$ are the **principal stretches**.${det(A) < 0 ? ' Since det A < 0, the stretch stage passes through a flat disc and comes out mirrored.' : ''}`);
    ctx.warn(input.warning || (sv[dim - 1] < 1e-9 ? 'A singular value is 0: the sphere is flattened (A is not invertible).' : ''));
  };
  return { update, tick() { const t = ctx.time.t % 8; ctx.setParam('s', t < 6.5 ? 3 * smooth(t / 6.5) : 3); update(); }, dispose() { view.clear(); } };
}

// ── tutorials ──────────────────────────────────────────────────────────────
const eigenTutorial: TutorialStep[] = [
  { text: 'Apply a matrix to a vector and it usually **changes direction**. Drag the blue unit vector $\\mathbf x$ around the circle and watch where the orange $A\\mathbf x$ points.', set: { choices: { preset: 'nonsym' }, toggles: { eiglines: false, ring: false, ellipse: false }, params: { ang: 20 } }, task: 'Drag x around the full circle once.', done: (c) => c.params.ang > 180 },
  { text: 'At a few special angles $A\\mathbf x$ lands **on the line of x** — the matrix only stretches it. Such an $\\mathbf x$ is an **eigenvector**: $A\\mathbf x = \\lambda\\mathbf x$, and the stretch factor $\\lambda$ is its eigenvalue.', task: 'Find a direction where the panel says “eigenvector!”.', done: (c) => { const A = readMat(c, 2), t = (c.params.ang * Math.PI) / 180, x = [Math.cos(t), Math.sin(t)], Ax = [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]]; return Math.abs(x[0] * Ax[1] - x[1] * Ax[0]) < 0.02 * Math.hypot(Ax[0], Ax[1]); } },
  { text: 'Show all directions at once: each grey spoke carries an arrow to its image. The arrows turn **violet** where image and spoke line up. For this matrix there are two such lines.', set: { toggles: { ring: true } }, task: 'Turn on the eigen-directions to check your hunt.', done: (c) => c.toggles.eiglines },
  { text: 'Algebra finds them: $A\\mathbf x = \\lambda\\mathbf x$ means $(A-\\lambda I)\\mathbf x = 0$ for a nonzero $\\mathbf x$, so $A-\\lambda I$ must squash a direction — $\\det(A-\\lambda I) = 0$. Open the **Steps** tab for the characteristic polynomial.', task: 'Read λ₁ and λ₂ in Steps, and check them against the labels on the dashed lines.' },
  { text: 'A **rotation** keeps no direction. Its characteristic polynomial has no real roots; the eigenvalues are complex, $e^{\\pm i\\theta}$.', set: { choices: { preset: 'rot' } }, task: 'Look for a violet arrow — there is none.' },
  { text: 'A **shear** keeps exactly one line, even though $\\lambda = 1$ is a double root: too few eigenvectors (a *defective* matrix). A **symmetric** matrix always has perpendicular eigenvectors — the reason principal axes of inertia and of stress are orthogonal.', set: { choices: { preset: 'sym' }, toggles: { eiglines: true, ellipse: true } }, task: 'With the symmetric preset, check that the two dashed lines are perpendicular and are the axes of the orange ellipse (the image of the circle).' },
];

const svdTutorial: TutorialStep[] = [
  { text: 'Feed the **unit sphere** to a matrix. Linear maps send spheres to **ellipsoids** (possibly flat). The singular value decomposition explains exactly which one.', set: { choices: { dim: '3' }, params: { s: 3 }, toggles: { vecs: true } }, task: 'Orbit the camera (left-drag) and look at the ellipsoid from several sides.' },
  { text: 'Start over at the sphere and take the motion one stage at a time. Stage 1 is $V^{\\mathsf T}$, a pure **rotation**: three special perpendicular directions $\\mathbf v_1, \\mathbf v_2, \\mathbf v_3$ swing onto the coordinate axes. The sphere itself looks unchanged — watch the gold meridian.', set: { params: { s: 0 } }, task: 'Drag s from 0 to 1.', done: (c) => c.params.s >= 0.99 && c.params.s <= 1.2 },
  { text: 'Stage 2 is $\\Sigma$: **stretch** each axis by a singular value $\\sigma_i \\ge 0$. The sphere becomes an ellipsoid aligned with the axes.', task: 'Drag s from 1 to 2.', done: (c) => c.params.s >= 1.99 && c.params.s <= 2.2 },
  { text: 'Stage 3 is $U$, another **rotation**, carrying the axes onto $\\mathbf u_1, \\mathbf u_2, \\mathbf u_3$. Done: $A = U\\Sigma V^{\\mathsf T}$, and the semi-axes of the ellipsoid are $\\sigma_i\\mathbf u_i$.', task: 'Drag s to 3 (or press play to see all three stages).', done: (c) => c.params.s >= 2.99 },
  { text: 'Make the matrix **singular**: a zero singular value flattens the ellipsoid into an ellipse (rank 2) or a segment (rank 1). The number of nonzero $\\sigma_i$ is the rank; $\\sigma_1/\\sigma_n$ is the condition number.', set: { params: { a11: 1, a12: 0.5, a13: 1.5, a21: 0, a22: 1, a23: 1, a31: 0.5, a32: 0.25, a33: 0.75, s: 3 } }, task: 'Check that the smallest singular value in the panel is 0.' },
  { text: 'In the plane the same story turns the **unit circle into an ellipse**. Every 2×2 matrix — shear included — is a rotation, an axis stretch and another rotation.', set: { choices: { dim: '2' }, params: { a11: 1, a12: 1, a21: 0, a22: 1, s: 0 } }, task: 'Play the shear [[1, 1], [0, 1]] and read off σ₁ = φ ≈ 1.618 and σ₂ = 1/φ.', done: (c) => c.params.s > 2.9 && c.choices.dim === '2' },
];

export const eigenDemos: DemoDef[] = [
  {
    id: 'linalg.eigen', module: 'linalg', title: 'Eigenvectors: directions that only stretch', topic: 'Eigenvalues and eigenvectors; characteristic polynomial',
    summary: 'Drag a unit vector around the circle and compare it with its image. Where they line up, you have found an eigenvector; the stretch factor is the eigenvalue.',
    tex: 'A\\mathbf v = \\lambda\\mathbf v,\\qquad \\det(A - \\lambda I) = \\lambda^2 - (\\operatorname{tr}A)\\lambda + \\det A = 0',
    view: '2d', animated: true,
    params: [...matParams(EIG_PRESETS.nonsym), { key: 'ang', label: 'direction of x (°)', value: 20, min: 0, max: 360, step: 0.1 }],
    choices: [{ key: 'preset', label: 'Matrix', value: 'nonsym', options: EIG_OPTIONS }],
    toggles: [{ key: 'ring', label: 'All directions', value: true }, { key: 'eiglines', label: 'Eigen-directions', value: true }, { key: 'ellipse', label: 'Image of the circle', value: false }],
    input: { label: 'Matrix', value: 'A = [[1, 1], [0.5, 1.5]]', placeholder: 'A = [[a, b], [c, d]]' },
    experiments: [
      'With the eigen-directions hidden, hunt for them by dragging x.',
      'Pick “a negative eigenvalue”: along one line Ax points backwards. Is that still an eigenvector?',
      'The shear has a double eigenvalue 1 but only one eigen-line. Why can it not have two?',
      'Symmetric preset: are the eigen-lines perpendicular? Turn on the image of the circle — they are its axes.',
      'Rotation: no violet arrows at all. What are its eigenvalues?',
    ],
    connections: ['linalg.diagonalize', 'linalg.transform2d', 'linalg.normalmodes', 'linalg.inertia', 'linalg.svd'],
    tutorial: eigenTutorial,
    accuracy: 'Eigenvalues of a 2×2 matrix from the exact quadratic formula; eigenvectors from the null space of A − λI. “Eigenvector!” is declared when the angle between x and Ax is below about 1°.',
    create: eigenDemo,
  },
  {
    id: 'linalg.diagonalize', module: 'linalg', title: 'Diagonalization: changing to the eigenbasis', topic: 'Diagonalization; similarity; powers of a matrix',
    summary: 'A = PDP⁻¹: change to eigen-coordinates, stretch the axes, change back. In the eigenbasis powers are trivial, so Aⁿx follows the dominant eigenvector.',
    tex: 'A = PDP^{-1},\\qquad A^n = PD^nP^{-1},\\qquad A^n\\mathbf x = c_1\\lambda_1^n\\mathbf p_1 + c_2\\lambda_2^n\\mathbf p_2',
    view: '2d', animated: true,
    params: [...matParams(DIAG_PRESETS.grow), { key: 's', label: 'stage s (P⁻¹ · D · P)', value: 0, min: 0, max: 3, step: 0.01 }, { key: 'n', label: 'power n', value: 4, min: 0, max: 12, step: 1 }, { key: 'x0', label: '$x_0$', value: 1, min: -3, max: 3, step: 0.01 }, { key: 'y0', label: '$y_0$', value: -0.25, min: -3, max: 3, step: 0.01 }],
    choices: [{ key: 'view', label: 'Show', value: 'stages', options: [['stages', 'A = PDP⁻¹ in three moves'], ['powers', 'powers Aⁿx₀']] }, { key: 'preset', label: 'Matrix', value: 'grow', options: [['custom', 'custom'], ['grow', 'λ = 2 and ½'], ['markov', 'Markov chain'], ['fib', 'Fibonacci [[1,1],[1,0]]'], ['sym', 'symmetric'], ['shear', 'shear (defective)'], ['rot', 'rotation (complex)']] }],
    input: { label: 'Matrix', value: 'A = [[1, 1], [0.5, 1.5]]', placeholder: 'A = [[a, b], [c, d]]' },
    experiments: [
      'Play the stages and pause at s = 1: the violet eigen-grid has become the square grid.',
      'Switch to powers and drag x₀: whatever you start with, the orbit turns towards the eigenvector with |λ| = 2.',
      'Markov chain: powers converge to the steady state (the eigenvector for λ = 1). Why does the other component die out?',
      'Fibonacci with x₀ = (1, 0): read Fₙ off the orbit and compare with φⁿ/√5.',
      'Try the shear and the rotation: why does the method break?',
    ],
    connections: ['linalg.eigen', 'linalg.basis', 'linalg.normalmodes', 'linalg.matmul'],
    accuracy: 'P from eigenvectors (null spaces of A − λI with tolerance 1e−7), P⁻¹ by LU. Aⁿ by PDⁿP⁻¹ is compared with direct multiplication; the difference shown is rounding error.',
    create: diagonalizeDemo,
  },
  {
    id: 'linalg.svd', module: 'linalg', title: 'The SVD: sphere to ellipsoid', topic: 'Singular value decomposition; rotation–stretch–rotation',
    summary: 'Any matrix maps the unit sphere to an ellipsoid. Play the decomposition A = UΣVᵀ as three motions — rotate, stretch the axes, rotate — and read the singular values off the semi-axes.',
    tex: 'A = U\\Sigma V^{\\mathsf T},\\qquad A\\mathbf v_i = \\sigma_i\\mathbf u_i,\\qquad \\sigma_i^2 = \\lambda_i(A^{\\mathsf T}A)',
    view: '3d', animated: true,
    params: [...matParams([[1.2, 0.6, 0.2], [0.1, 0.9, 0.7], [-0.3, 0.2, 0.6]], 'a', 3), { key: 's', label: 'stage s (Vᵀ · Σ · U)', value: 3, min: 0, max: 3, step: 0.01 }],
    choices: [{ key: 'dim', label: 'Dimension', value: '3', options: [['3', '3×3: sphere → ellipsoid'], ['2', '2×2: circle → ellipse (uses a₁₁…a₂₂)']] }],
    toggles: [{ key: 'vecs', label: 'Singular vectors', value: true }],
    input: { label: 'Matrix', value: 'A = [[1.2, 0.6, 0.2], [0.1, 0.9, 0.7], [-0.3, 0.2, 0.6]]', placeholder: 'A = [[…], […], […]]' },
    experiments: [
      'Play the timeline and name each stage as it happens.',
      'Pause at s = 2: the ellipsoid is aligned with the axes and its semi-axes are σ₁, σ₂, σ₃.',
      'Make a column a combination of the others: one σ drops to 0 and the ellipsoid goes flat.',
      'Type a rotation matrix: all σᵢ = 1 — a rotation is its own SVD with Σ = I.',
      'For a symmetric positive definite matrix, compare the σᵢ with its eigenvalues.',
    ],
    connections: ['linalg.eigen', 'linalg.transform3d', 'linalg.rank', 'linalg.inertia', 'linalg.leastsquares'],
    tutorial: svdTutorial,
    accuracy: 'The SVD comes from the symmetric eigenproblem of AᵀA (Jacobi, converged to ~1e−12) — accurate for these well-scaled matrices, but it squares the condition number, so tiny singular values of ill-conditioned matrices lose relative accuracy. U and V are made proper rotations, so a reflection (det A < 0) appears as a negative last σ in the motion.',
    create: svdDemo,
  },
];
