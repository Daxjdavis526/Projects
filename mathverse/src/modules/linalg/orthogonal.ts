// Orthogonality: projection onto a line or a plane with the error vector at a
// right angle, least squares as a projection in data space, and Gram–Schmidt
// straightening a basis one subtraction at a time.

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow, TutorialStep } from '../types';
import type { V3 } from '../../engine/viewport3d';
import { Mat, matmul, transpose, dot } from '../../core/numeric/linalg';
import { leastSquares, projectionMatrix, gramSchmidtSteps } from '../../core/numeric/linmap';
import {
  fmt, tnum, pal, alpha, texMat, texVec, vecStr, smooth, clamp, readVec, vecParams, C3, lineSet, planePatch, dragArrow, rightAngle3, dashed3,
  clipLineToBox, clipPlaneToBox, sub3, mul3, dot3, cross3, len3, snapTo,
  setCube,
  segPts,
} from './common';

const GREY = '#9aa3b5';

// ── 1. projection onto a line or a plane ───────────────────────────────────
function projectionDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  const R = 3;
  setCube(view, R);
  const step = () => (ctx.toggles.snap ? 0.25 : 0);
  const mk = (name: string, color: string, label: string) => dragArrow(view, color, label, (p) => { ctx.setParam(`${name}x`, p[0]); ctx.setParam(`${name}y`, p[1]); ctx.setParam(`${name}z`, p[2]); update(); }, { snap: step });
  const bA = mk('b', C3.u, 'b'), a1A = mk('a1', C3.c1, 'a₁'), a2A = mk('a2', C3.c2, 'a₂');
  const pA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.res, label: 'p' });
  const eA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.err, label: 'e = b − p' });
  const plane = planePatch(view, C3.res, 0.2);
  const comp = planePatch(view, C3.err, 0.1);
  const lines = lineSet(view, 80, 0.95);
  let lineKey = '';
  let subLine: ReturnType<typeof view.addCurve> | null = null;
  const update = () => {
    const onto = ctx.choices.onto;
    const b = readVec(ctx, 'b', 3) as V3, a1 = readVec(ctx, 'a1', 3) as V3, a2 = readVec(ctx, 'a2', 3) as V3;
    bA.set([0, 0, 0], b); a1A.set([0, 0, 0], a1); a2A.set([0, 0, 0], a2); a2A.visible(onto === 'plane');
    const cols = onto === 'plane' ? [a1, a2] : [a1];
    const A: Mat = [0, 1, 2].map((i) => cols.map((c) => c[i]));
    const Pm = projectionMatrix(A);
    const degenerate = !Pm || len3(a1) < 1e-9 || (onto === 'plane' && len3(cross3(a1, a2)) < 1e-9 * Math.max(1, len3(a1) * len3(a2)));
    lines.begin();
    if (degenerate) {
      pA.visible(false); eA.visible(false); plane.visible(false); comp.visible(false); subLine?.dispose(); subLine = null; lineKey = ''; lines.end();
      ctx.setReadouts([{ label: 'subspace', value: onto === 'plane' ? 'a₁ and a₂ are parallel (or zero): they do not span a plane' : 'a₁ = 0 spans no line', tone: 'bad' }]);
      ctx.warn(onto === 'plane' ? 'a₁ and a₂ do not span a plane — AᵀA is singular. Separate them.' : 'a₁ is the zero vector.');
      ctx.setNote(''); ctx.setSteps([]);
      return;
    }
    const p = [0, 1, 2].map((i) => Pm![i].reduce((s, v, j) => s + v * b[j], 0)) as V3;
    const e = sub3(b, p);
    pA.set([0, 0, 0], p); pA.visible(true);
    eA.set(p, e); eA.visible(len3(e) > 1e-9);
    // the subspace
    if (onto === 'plane') { subLine?.dispose(); subLine = null; lineKey = ''; plane.setSpan(a1, a2, R); plane.visible(true); }
    else {
      plane.visible(false);
      const key = a1.join(',');
      if (key !== lineKey) { lineKey = key; subLine?.dispose(); const seg = clipLineToBox([0, 0, 0], a1, R); subLine = seg ? view.addCurve(segPts(seg), { color: C3.res, radius: 0.025 }) : null; }
    }
    // the orthogonal complement: a plane for a line, a line for a plane
    comp.visible(false);
    if (ctx.toggles.comp) {
      if (onto === 'line') { comp.set(clipPlaneToBox(a1, 0, R)); comp.visible(true); }
      else { const seg = clipLineToBox([0, 0, 0], cross3(a1, a2), R); if (seg) dashed3(lines, seg[0], seg[1], C3.err, 30); }
    }
    // right angle at p, and a dashed drop line from b
    const along: V3 = len3(p) > 1e-6 ? mul3(p, -1) : a1;
    rightAngle3(lines, p, along, e, 0.32, ctx.dark ? '#e6e9ef' : '#1b1f2a');
    lines.end();
    const Pt = transpose(Pm!), P2m = matmul(Pm!, Pm!);
    const sym = Pm!.every((r, i) => r.every((v, j) => Math.abs(v - Pt[i][j]) < 1e-9));
    const idem = Pm!.every((r, i) => r.every((v, j) => Math.abs(v - P2m[i][j]) < 1e-9));
    const rows: Readout[] = [
      { label: 'p = projection of b', value: vecStr(p), tone: 'good' },
      { label: 'e = b − p', value: vecStr(e) },
      { label: 'distance |e| from b to the ' + onto, value: fmt(len3(e)) },
      { label: 'e · a₁', value: fmt(dot3(e, a1)), tone: 'good' },
    ];
    if (onto === 'plane') rows.push({ label: 'e · a₂', value: fmt(dot3(e, a2)), tone: 'good' });
    rows.push({ label: 'P = A(AᵀA)⁻¹Aᵀ', value: texMat(Pm!), tex: true }, { label: 'P² = P,  Pᵀ = P', value: `${idem ? 'yes' : 'no'},  ${sym ? 'yes' : 'no'}` }, { label: 'trace P = dimension', value: fmt(Pm![0][0] + Pm![1][1] + Pm![2][2], 6) });
    ctx.setReadouts(rows);
    const steps: StepRow[] = onto === 'line'
      ? [
        { title: 'Ask for p = x̂ a₁ with the error perpendicular to a₁', tex: '\\mathbf a_1\\cdot(\\mathbf b - \\hat x\\,\\mathbf a_1) = 0 \\;\\Rightarrow\\; \\hat x = \\frac{\\mathbf a_1\\cdot\\mathbf b}{\\mathbf a_1\\cdot\\mathbf a_1}' },
        { title: 'Numbers', tex: `\\hat x = \\frac{${tnum(dot3(a1, b))}}{${tnum(dot3(a1, a1))}} = ${tnum(dot3(a1, b) / dot3(a1, a1))},\\qquad \\mathbf p = ${texVec(p)}` },
        { title: 'As a matrix', tex: `P = \\frac{\\mathbf a_1\\mathbf a_1^{\\mathsf T}}{\\mathbf a_1^{\\mathsf T}\\mathbf a_1} = ${texMat(Pm!)}`, detail: 'Rank 1: everything lands on the line.' },
      ]
      : (() => {
        const AtA = matmul(transpose(A), A), Atb = transpose(A).map((r) => dot(r, b));
        const xh = leastSquares(A, b)!.x;
        return [
          { title: 'The error must be perpendicular to both a₁ and a₂: Aᵀ(b − A x̂) = 0', tex: 'A^{\\mathsf T}A\\,\\hat{\\mathbf x} = A^{\\mathsf T}\\mathbf b' },
          { title: 'Normal equations', tex: `${texMat(AtA)}\\hat{\\mathbf x} = ${texVec(Atb)}` },
          { title: 'Solve', tex: `\\hat{\\mathbf x} = ${texVec(xh)},\\qquad \\mathbf p = ${tnum(xh[0])}\\,\\mathbf a_1 + ${tnum(xh[1])}\\,\\mathbf a_2 = ${texVec(p)}` },
          { title: 'As a matrix', tex: `P = A(A^{\\mathsf T}A)^{-1}A^{\\mathsf T} = ${texMat(Pm!)}` },
        ] as StepRow[];
      })();
    ctx.setSteps(steps);
    ctx.setNote(`The projection $\\mathbf p$ is the point of the ${onto === 'line' ? 'line' : 'plane'} **closest** to $\\mathbf b$, and the error $\\mathbf e = \\mathbf b - \\mathbf p$ meets it at a **right angle** (marked): any other point would be further away, by Pythagoras. Drag **b** — the error stays perpendicular. Projecting twice changes nothing ($P^2 = P$). In quantum mechanics a measurement projects the state onto an eigenspace, and the probability is $|P\\psi|^2$ for a unit state.`);
    ctx.warn('');
  };
  return { update, dispose() { view.clear(); } };
}

// ── 2. least squares ───────────────────────────────────────────────────────
function leastSquaresDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, view = ctx.view3d!;
  plot.opts.equal = true;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot.setView({ x0: -2.5, x1: 3.5, y0: -1.5, y1: 3.5 });
  let R = 3;
  setCube(view, R);
  const col = planePatch(view, C3.res, 0.2);
  const a1A = view.addArrow([0, 0, 0], [1, 1, 1], { color: C3.c1, label: 'a₁ = (1,1,1)' });
  const a2A = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.c2, label: 'a₂ = (x₁,x₂,x₃)' });
  const bA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.u, label: 'b = (y₁,y₂,y₃)' });
  const pA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.res, label: 'p = Ax̂' });
  const eA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.err, label: 'e' });
  const lines = lineSet(view, 40, 0.95);
  let colLine: ReturnType<typeof view.addCurve> | null = null, colKey = '';
  const update = () => {
    const P = pal(ctx.dark);
    const xs = [ctx.params.x1, ctx.params.x2, ctx.params.x3], ys = [ctx.params.y1, ctx.params.y2, ctx.params.y3];
    const lineModel = ctx.choices.model === 'line';
    const A: Mat = xs.map((x) => (lineModel ? [1, x] : [1]));
    const ls = leastSquares(A, ys);
    const singular = !ls;
    const C = ls ? ls.x[0] : NaN, D = ls && lineModel ? ls.x[1] : 0;
    const e = ls ? ls.e : [0, 0, 0];
    const fit = (x: number) => C + D * x;
    plot.setDraw((g) => {
      if (!singular) g.fn(fit, { color: P.res, width: 2.6 });
      xs.forEach((x, i) => {
        if (singular) return;
        if (ctx.toggles.squares) {
          // the squared residual drawn as an actual square (in data units, so it looks square only on equal axes)
          const r = ys[i] - fit(x);
          g.polygon([[x, fit(x)], [x, ys[i]], [x - r, ys[i]], [x - r, fit(x)]], { fill: alpha(P.err, 0.16), color: alpha(P.err, 0.5), width: 1 });
        }
        g.line([x, fit(x)], [x, ys[i]], { color: P.err, width: 2.4 });
        g.text([x, (ys[i] + fit(x)) / 2], `e${'₁₂₃'[i]} = ${fmt(ys[i] - fit(x), 3)}`, { color: P.err, font: '12px Inter, sans-serif', align: 'right', baseline: 'middle' }, -8, 0);
      });
      xs.forEach((x, i) => g.handle({ id: `p${i}`, at: [x, ys[i]], color: P.u, label: `(x${'₁₂₃'[i]}, y${'₁₂₃'[i]})`, onDrag: ([px, py]) => { ctx.setParam(`x${i + 1}`, snapTo(px, 0.05)); ctx.setParam(`y${i + 1}`, snapTo(py, 0.05)); update(); } }));
      if (!singular) g.text([plot.view.x0, plot.view.y1], lineModel ? `best line: y = ${fmt(C, 4)} ${D < 0 ? '−' : '+'} ${fmt(Math.abs(D), 4)}x` : `best constant: y = ${fmt(C, 4)} (the mean)`, { color: P.res, font: '600 14px Inter, sans-serif', baseline: 'top' }, 12, 12);
    });
    // data space ℝ³
    const b = ys as V3, a1: V3 = [1, 1, 1], a2 = xs as V3;
    const need = Math.max(2, ...b.map(Math.abs), ...a2.map(Math.abs)) * 1.15;
    if (Math.abs(need - R) > 0.6 * R || need > R) { R = Math.ceil(need); view.setBounds({ x: [-R, R], y: [-R, R], z: [-R, R] }); }
    a1A.set([0, 0, 0], a1);
    a2A.set([0, 0, 0], a2); a2A.visible(lineModel);
    bA.set([0, 0, 0], b);
    const p = ls ? (ls.p as V3) : ([0, 0, 0] as V3);
    pA.set([0, 0, 0], p); pA.visible(!singular);
    eA.set(p, e as V3); eA.visible(!singular && len3(e as V3) > 1e-9);
    lines.begin();
    if (lineModel && !singular) { col.setSpan(a1, a2, R); col.visible(true); } else col.visible(false);
    const key = `${lineModel}|${R}`;
    if (key !== colKey) { colKey = key; colLine?.dispose(); colLine = null; if (!lineModel) { const seg = clipLineToBox([0, 0, 0], a1, R); if (seg) colLine = view.addCurve(segPts(seg), { color: C3.res, radius: 0.025 }); } }
    if (!singular) rightAngle3(lines, p, len3(p) > 1e-6 ? mul3(p, -1) : a1, e as V3, 0.25, ctx.dark ? '#e6e9ef' : '#1b1f2a');
    lines.end();
    const sse = e.reduce((s, v) => s + v * v, 0);
    ctx.setReadouts(singular ? [{ label: 'fit', value: 'the x-values coincide: no unique line', tone: 'bad' }] : [
      { label: lineModel ? 'intercept C, slope D' : 'constant C', value: lineModel ? `${fmt(C)}, ${fmt(D)}` : fmt(C) },
      { label: 'residuals e = b − p', value: vecStr(e) },
      { label: 'sum of squares |e|²', value: fmt(sse), tone: 'good' },
      { label: 'e · a₁ = Σ eᵢ', value: fmt(e[0] + e[1] + e[2]) },
      ...(lineModel ? [{ label: 'e · a₂ = Σ xᵢeᵢ', value: fmt(xs.reduce((s, x, i) => s + x * e[i], 0)) }] : []),
    ]);
    if (!singular) {
      const AtA = matmul(transpose(A), A), Atb = transpose(A).map((r) => dot(r, ys));
      ctx.setSteps([
        { title: 'Three equations, two unknowns (no exact solution in general)', tex: `\\begin{aligned}${xs.map((x, i) => lineModel ? `C + ${tnum(x)}D &= ${tnum(ys[i])}` : `C &= ${tnum(ys[i])}`).join('\\\\')}\\end{aligned}\\qquad A = ${texMat(A)},\\ \\mathbf b = ${texVec(ys)}` },
        { title: 'Normal equations AᵀA x̂ = Aᵀb', tex: `${texMat(AtA)}\\hat{\\mathbf x} = ${texVec(Atb)}`, rule: 'e ⟂ columns of A' },
        { title: 'Solution', tex: lineModel ? `\\hat C = ${tnum(C)},\\quad \\hat D = ${tnum(D)}` : `\\hat C = ${tnum(C)} = \\tfrac{y_1+y_2+y_3}{3}` },
        { title: 'Projection and error', tex: `\\mathbf p = A\\hat{\\mathbf x} = ${texVec(p)},\\quad \\mathbf e = ${texVec(e)},\\quad |\\mathbf e|^2 = ${tnum(sse)}` },
      ]);
    } else ctx.setSteps([]);
    ctx.setNote(`**Two pictures of one computation.** Left: the line minimizing the sum of squared vertical errors. Right: the three heights form one vector $\\mathbf b \\in \\mathbb R^3$; every line $C + Dx$ gives a vector $C\\mathbf a_1 + D\\mathbf a_2$ in the violet plane (the column space). The best line is the **projection** $\\mathbf p$ of $\\mathbf b$ onto that plane, and the residuals form the error $\\mathbf e$, perpendicular to it — so $\\sum e_i = 0$${lineModel ? ' and $\\sum x_i e_i = 0$' : ''}. With more data points the same holds in $\\mathbb R^n$; we can only draw $n = 3$.`);
    ctx.warn(singular ? 'All x-values coincide: the columns of A are dependent and the line is not unique.' : '');
  };
  return { update, dispose() { view.clear(); } };
}

// ── 3. Gram–Schmidt ────────────────────────────────────────────────────────
function gramSchmidtDemo(ctx: DemoCtx): DemoInstance {
  const view = ctx.view3d!;
  setCube(view, 2);
  const step = () => (ctx.toggles.snap ? 0.25 : 0);
  const vA = [1, 2, 3].map((i) => dragArrow(view, GREY, `v${'₁₂₃'[i - 1]}`, (p) => { ctx.setParam(`v${i}x`, p[0]); ctx.setParam(`v${i}y`, p[1]); ctx.setParam(`v${i}z`, p[2]); update(); }, { snap: step }));
  const qcols = [C3.c1, C3.c2, C3.c3];
  const qA = [0, 1, 2].map((i) => view.addArrow([0, 0, 0], [1, 0, 0], { color: qcols[i], label: `q${'₁₂₃'[i]}`, radius: 0.045 }));
  const work = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.res, radius: 0.05 });
  const workLabel = view.addLabel([0, 0, 0], '');
  const projA = view.addArrow([0, 0, 0], [1, 0, 0], { color: C3.err, radius: 0.035 });
  const plane = planePatch(view, C3.res, 0.14);
  const lines = lineSet(view, 120, 0.9);
  const update = () => {
    const vs = [1, 2, 3].map((i) => readVec(ctx, `v${i}`, 3) as V3);
    vs.forEach((v, i) => vA[i].set([0, 0, 0], v));
    const gs = gramSchmidtSteps(vs);
    const s = clamp(ctx.params.s, 0, 6);
    const k = Math.min(5, Math.floor(s)), f = smooth(s - k);
    const done = s >= 6 ? 6 : k;                                        // steps fully completed
    const st = gs.steps;
    // which q's are finished
    const finished = [st[0], st[2], st[5]].map((x, i) => (done > [0, 2, 5][i] ? x.after : null));
    qA.forEach((a, i) => { const q = finished[i]; if (q && q.every(Number.isFinite)) { a.set([0, 0, 0], q as V3); a.visible(true); } else a.visible(false); });
    // the vector being worked on and the piece being removed
    const cur = st[Math.min(5, k)];
    lines.begin();
    projA.visible(false); plane.visible(false);
    if (s < 6) {
      let w: V3, label: string;
      if (cur.kind === 'normalize') {
        const l = len3(cur.before as V3);
        w = l > 1e-12 ? mul3(cur.before as V3, (1 - f) + f / l) : (cur.before as V3);
        label = f < 0.02 ? `w${'₁₂₃'[cur.k]}` : `w${'₁₂₃'[cur.k]} / |w${'₁₂₃'[cur.k]}|`;
      } else {
        const q = gs.Q[cur.j!] as V3;
        const piece = q.every(Number.isFinite) ? mul3(q, cur.coeff) : ([0, 0, 0] as V3);
        w = sub3(cur.before as V3, mul3(piece, f));
        projA.set(sub3(cur.before as V3, mul3(piece, f)), mul3(piece, 1 - f)); projA.visible(len3(piece) * (1 - f) > 1e-3);
        // the projection onto q, drawn as a dashed drop from the vector to the line of q
        dashed3(lines, cur.before as V3, piece, C3.err, 16);
        rightAngle3(lines, piece, mul3(piece, -1), sub3(cur.before as V3, piece), 0.18, ctx.dark ? '#e6e9ef' : '#1b1f2a');
        label = `v${'₁₂₃'[cur.k]} − (v${'₁₂₃'[cur.k]}·q${'₁₂₃'[cur.j!]})q${'₁₂₃'[cur.j!]}`;
      }
      if (cur.k === 2 && finished[0] && finished[1]) { plane.setSpan(finished[0] as V3, finished[1] as V3, 2); plane.visible(true); }
      if (!w.every(Number.isFinite)) w = [0, 0, 0];
      work.set([0, 0, 0], w); work.visible(true);
      workLabel.set(mul3(w, 1.12), `<span style="color:${C3.res}">${label}</span>`); workLabel.visible(true);
    } else { work.visible(false); workLabel.visible(false); }
    lines.end();
    const titles = ['normalize v₁ → q₁', 'remove from v₂ its q₁-component', 'normalize → q₂', 'remove from v₃ its q₁-component', 'remove its q₂-component', 'normalize → q₃'];
    const Q = gs.Q;
    const ok = gs.dependent.length === 0;
    const QtQ = ok ? matmul(Q, transpose(Q)) : null;
    const orthErr = QtQ ? Math.max(...QtQ.flat().map((v, i) => Math.abs(v - (i % 4 === 0 ? 1 : 0)))) : NaN;
    ctx.setReadouts([
      { label: 'step', value: s >= 6 ? 'done: an orthonormal basis' : `${k + 1} of 6 — ${titles[k]}` },
      ...Q.map((q, i) => ({ label: `q${'₁₂₃'[i]}`, value: q.every(Number.isFinite) ? vecStr(q) : '— (dependent)' })),
      { label: 'R (A = QR), rᵢⱼ = qᵢ·vⱼ', value: texMat(gs.R), tex: true },
      { label: 'max |QᵀQ − I|', value: ok ? orthErr.toExponential(1) : '—', tone: ok ? 'good' : 'bad' },
    ]);
    ctx.setSteps(st.map((x, i) => ({
      title: `${i === k && s < 6 ? '▶ ' : ''}${titles[i]}`,
      tex: x.kind === 'normalize'
        ? `\\mathbf q_{${x.k + 1}} = \\frac{\\mathbf w_{${x.k + 1}}}{|\\mathbf w_{${x.k + 1}}|} = \\frac{1}{${tnum(x.coeff)}}${texVec(x.before)} = ${texVec(x.after)}`
        : `\\mathbf w \\leftarrow \\mathbf w - (\\mathbf v_{${x.k + 1}}\\cdot\\mathbf q_{${x.j! + 1}})\\,\\mathbf q_{${x.j! + 1}} = ${texVec(x.before)} - (${tnum(x.coeff)})${texVec(gs.Q[x.j!])} = ${texVec(x.after)}`,
    })));
    ctx.setNote(ok
      ? 'Gram–Schmidt turns any basis into an **orthonormal** one spanning the same spaces step by step: $\\operatorname{span}(\\mathbf q_1) = \\operatorname{span}(\\mathbf v_1)$, $\\operatorname{span}(\\mathbf q_1,\\mathbf q_2) = \\operatorname{span}(\\mathbf v_1,\\mathbf v_2)$, … Each new vector loses its **projections** onto the earlier q’s (orange) — what is left is perpendicular to them — and is then scaled to length 1. The numbers removed and the lengths are the entries of $R$ in $A = QR$. Physics uses the same procedure to build orthonormal sets of states or modes.'
      : `v${'₁₂₃'[gs.dependent[0]]} lies in the span of the earlier vectors: after removing its projections nothing is left, so there is no new direction to normalize.`);
    ctx.warn(ok ? '' : 'The vectors are linearly dependent — Gram–Schmidt produces a zero vector.');
  };
  return { update, tick(dt) { let s = ctx.params.s + dt * 0.6; if (s > 7.2) s = 0; ctx.setParam('s', Math.min(6, s)); update(); }, reset() { ctx.setParam('s', 0); }, dispose() { view.clear(); } };
}

// ── tutorials ──────────────────────────────────────────────────────────────
const projectionTutorial: TutorialStep[] = [
  { text: 'Which point of a line through the origin is **closest** to a point $\\mathbf b$? Drop a perpendicular. The foot $\\mathbf p$ is the **projection** of $\\mathbf b$ onto the line.', set: { choices: { onto: 'line' }, toggles: { comp: false, snap: true } }, task: 'Drag the tip of b and watch p slide along the line.' },
  { text: 'The error $\\mathbf e = \\mathbf b - \\mathbf p$ is perpendicular to the line: $\\mathbf a_1\\cdot\\mathbf e = 0$. That one equation gives $\\hat x = \\dfrac{\\mathbf a_1\\cdot\\mathbf b}{\\mathbf a_1\\cdot\\mathbf a_1}$ and $\\mathbf p = \\hat x\\,\\mathbf a_1$.', task: 'Check e · a₁ = 0 in the panel, whatever you do with b.' },
  { text: 'Every vector splits uniquely as **(part along the line) + (part perpendicular)**. The perpendicular parts make up the **orthogonal complement**, a plane.', set: { toggles: { comp: true } }, task: 'Drag b into the orange plane: the projection becomes 0.', done: (c) => { const b = readVec(c, 'b', 3), a = readVec(c, 'a1', 3); return Math.abs(dot(a, b)) < 0.02 * Math.max(1, Math.hypot(...a) * Math.hypot(...b)); } },
  { text: 'Now project onto a **plane** spanned by $\\mathbf a_1, \\mathbf a_2$. The error must be perpendicular to *both*: $A^{\\mathsf T}(\\mathbf b - A\\hat{\\mathbf x}) = 0$, the **normal equations**.', set: { choices: { onto: 'plane' }, toggles: { comp: false } }, task: 'Drag b high above the plane and back: p stays in the plane, e stays perpendicular.' },
  { text: 'The projection matrix $P = A(A^{\\mathsf T}A)^{-1}A^{\\mathsf T}$ is symmetric and satisfies $P^2 = P$: projecting a second time changes nothing. Its trace is the dimension of the subspace.', task: 'Read P, P² = P and trace P in the panel.' },
  { text: 'This is **least squares**: when $A\\mathbf x = \\mathbf b$ has no solution, solve $A\\hat{\\mathbf x} = \\mathbf p$ instead — the closest reachable right-hand side. The *Least squares* demo shows a line fit as exactly this projection.', task: 'Drag a₂ onto a₁: the plane degenerates and AᵀA becomes singular.', done: (c) => { const a = readVec(c, 'a1', 3), b = readVec(c, 'a2', 3); return Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]) < 1e-6; } },
];

const lsqTutorial: TutorialStep[] = [
  { text: 'Three measurements $(x_i, y_i)$ almost never lie on one line. Least squares picks the line $y = C + Dx$ that minimizes $e_1^2 + e_2^2 + e_3^2$, the sum of squared vertical misses.', set: { choices: { model: 'line' }, toggles: { squares: true } }, task: 'Drag a data point and watch the line and the orange squares respond.' },
  { text: 'Put the three heights in one vector $\\mathbf b = (y_1,y_2,y_3)$ — a point in the 3D view. A line $C + Dx$ predicts $C(1,1,1) + D(x_1,x_2,x_3)$: all predictions fill the violet plane, the **column space** of $A$.', task: 'Drag the points onto one straight line: b enters the plane and e = 0.' },
  { text: 'The best line is the **projection** of $\\mathbf b$ onto the plane: the error $\\mathbf e$ is perpendicular to both columns, which says $\\sum e_i = 0$ and $\\sum x_i e_i = 0$.', task: 'Check the two dot products in the panel stay 0 while you drag.' },
  { text: 'With the **constant** model the column space is just the line through $(1,1,1)$ and the projection is the mean $\\bar y$.', set: { choices: { model: 'const' } }, task: 'Check that C equals the average of the three heights.' },
];

const gsTutorial: TutorialStep[] = [
  { text: 'Three independent vectors $\\mathbf v_1, \\mathbf v_2, \\mathbf v_3$ (grey) span space, but they are skewed. Gram–Schmidt builds perpendicular unit vectors $\\mathbf q_1, \\mathbf q_2, \\mathbf q_3$ from them, one at a time.', set: { params: { s: 0 } }, task: 'Orbit the view to see the three grey vectors.' },
  { text: '**Step 1.** $\\mathbf q_1$ is just $\\mathbf v_1$ scaled to length 1.', task: 'Move s to 1.', done: (c) => c.params.s >= 1 && c.params.s < 1.5 },
  { text: '**Step 2.** From $\\mathbf v_2$ remove its shadow on $\\mathbf q_1$: $(\\mathbf v_2\\cdot\\mathbf q_1)\\mathbf q_1$ (orange). What remains is perpendicular to $\\mathbf q_1$ — note the right angle.', task: 'Move s to 2.', done: (c) => c.params.s >= 2 && c.params.s < 2.5 },
  { text: '**Step 3.** Normalize to get $\\mathbf q_2$. Now $\\mathbf q_1, \\mathbf q_2$ span the same plane as $\\mathbf v_1, \\mathbf v_2$ (violet).', task: 'Move s to 3.', done: (c) => c.params.s >= 3 && c.params.s < 3.5 },
  { text: '**Steps 4–6.** From $\\mathbf v_3$ remove its shadow on $\\mathbf q_1$, then on $\\mathbf q_2$ — it is now perpendicular to the violet plane — and normalize.', task: 'Play to the end (s = 6).', done: (c) => c.params.s >= 6 },
  { text: 'The coefficients you subtracted, and the lengths you divided by, form an upper-triangular $R$ with $A = QR$ (Steps tab). If one $\\mathbf v$ lies in the span of the earlier ones, nothing is left after subtracting — Gram–Schmidt detects dependence.', set: { toggles: { snap: true } }, task: 'Drag v₃ into the plane of v₁ and v₂ (try v₃ = v₁ + v₂) and watch the warning.', done: (c) => gramSchmidtSteps([1, 2, 3].map((i) => readVec(c, `v${i}`, 3))).dependent.length > 0 },
];

export const orthogonalDemos: DemoDef[] = [
  {
    id: 'linalg.projection', module: 'linalg', title: 'Orthogonality and projection in space', topic: 'Orthogonality; orthogonal complements; projection onto a line and a plane',
    summary: 'Project b onto a line or a plane through the origin. The error vector b − p is perpendicular to the subspace, which is exactly what makes p the closest point.',
    tex: '\\mathbf p = A\\hat{\\mathbf x},\\quad A^{\\mathsf T}(\\mathbf b - A\\hat{\\mathbf x}) = \\mathbf 0,\\quad P = A(A^{\\mathsf T}A)^{-1}A^{\\mathsf T}',
    view: '3d',
    params: [...vecParams('b', [1, 1.5, 2], 3), ...vecParams('a1', [2, 0.5, 0], 3, 'a_1'), ...vecParams('a2', [0.25, 2, 0.5], 3, 'a_2')],
    choices: [{ key: 'onto', label: 'Project onto', value: 'plane', options: [['line', 'the line of a₁'], ['plane', 'the plane of a₁, a₂']] }],
    toggles: [{ key: 'comp', label: 'Orthogonal complement', value: false }, { key: 'snap', label: 'Snap tips to ¼-grid', value: true }],
    experiments: [
      'Drag b anywhere: the right-angle mark never breaks.',
      'Put b in the plane: p = b and e = 0. Put b on the normal line: p = 0.',
      'Turn on the orthogonal complement for a line: a plane. For a plane: a line. Dimensions add to 3.',
      'Make a₁ ⟂ a₂: then P is the sum of the two one-dimensional projections. Why?',
    ],
    connections: ['linalg.leastsquares', 'linalg.gramschmidt', 'linalg.vectors', 'linalg.basis'],
    tutorial: projectionTutorial,
    accuracy: 'Exact up to rounding: P from the 2×2 (or 1×1) normal equations solved by LU.',
    create: projectionDemo,
  },
  {
    id: 'linalg.leastsquares', module: 'linalg', title: 'Least squares as a projection', topic: 'Least squares; normal equations; projections in data space',
    summary: 'Fit a line to three points. On the left the usual picture; on the right the same fit as the projection of the data vector b ∈ ℝ³ onto the plane of all possible predictions.',
    tex: '\\min_{C,D}\\ \\sum_i (y_i - C - Dx_i)^2 \\iff A^{\\mathsf T}A\\hat{\\mathbf x} = A^{\\mathsf T}\\mathbf b',
    view: 'split3d',
    params: [{ key: 'x1', label: '$x_1$', value: -1, min: -3, max: 3, step: 0.05 }, { key: 'y1', label: '$y_1$', value: 0.4, min: -3, max: 3, step: 0.05 }, { key: 'x2', label: '$x_2$', value: 0.5, min: -3, max: 3, step: 0.05 }, { key: 'y2', label: '$y_2$', value: 2, min: -3, max: 3, step: 0.05 }, { key: 'x3', label: '$x_3$', value: 2, min: -3, max: 3, step: 0.05 }, { key: 'y3', label: '$y_3$', value: 1.6, min: -3, max: 3, step: 0.05 }],
    choices: [{ key: 'model', label: 'Model', value: 'line', options: [['line', 'line y = C + Dx'], ['const', 'constant y = C']] }],
    toggles: [{ key: 'squares', label: 'Draw the squared errors', value: true }],
    experiments: [
      'Drag the three points onto a line: b enters the column-space plane, e = 0.',
      'Drag one point far away (an outlier): how much does the line move? Squares punish big misses.',
      'Constant model: the best constant is the mean, and the column space is the line through (1, 1, 1).',
      'Give two points the same x but different y: still a unique best line? Now all three the same x.',
    ],
    connections: ['linalg.projection', 'linalg.systems', 'linalg.svd'],
    tutorial: lsqTutorial,
    accuracy: 'Exact up to rounding: the 2×2 normal equations are solved by LU. (For large or ill-conditioned problems QR or the SVD is preferred; for three points the normal equations are fine.)',
    create: leastSquaresDemo,
  },
  {
    id: 'linalg.gramschmidt', module: 'linalg', title: 'Gram–Schmidt, step by step', topic: 'Gram–Schmidt process; orthonormal bases; QR factorization',
    summary: 'Straighten three skewed vectors into an orthonormal basis: normalize, subtract projections, normalize — each move animated, each number in the Steps tab.',
    tex: '\\mathbf w_k = \\mathbf v_k - \\sum_{j<k} (\\mathbf v_k\\cdot\\mathbf q_j)\\,\\mathbf q_j,\\qquad \\mathbf q_k = \\frac{\\mathbf w_k}{|\\mathbf w_k|},\\qquad A = QR',
    view: '3d', animated: true,
    params: [...vecParams('v1', [2, 0.5, 0.25], 2.5, 'v_1'), ...vecParams('v2', [1, 1.75, 0.25], 2.5, 'v_2'), ...vecParams('v3', [0.5, 0.75, 1.75], 2.5, 'v_3'), { key: 's', label: 'step s (0 → 6)', value: 0, min: 0, max: 6, step: 0.01 }],
    toggles: [{ key: 'snap', label: 'Snap tips to ¼-grid', value: true }],
    experiments: [
      'Play the whole process; then drag v₂ and play it again.',
      'Make v₂ already perpendicular to v₁: step 2 removes nothing.',
      'Make v₃ = v₁ + v₂: Gram–Schmidt reports the dependence.',
      'Swap the roles: does starting from a different v₁ give a different orthonormal basis? Which q stays the same?',
    ],
    connections: ['linalg.projection', 'linalg.basis', 'linalg.span', 'linalg.svd'],
    tutorial: gsTutorial,
    accuracy: 'Classical Gram–Schmidt, exactly as taught. In floating point it can lose orthogonality for nearly dependent vectors (modified Gram–Schmidt or Householder QR are used in practice); the panel reports max |QᵀQ − I|.',
    create: gramSchmidtDemo,
  },
];
