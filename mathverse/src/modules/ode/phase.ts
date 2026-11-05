// Phase portraits of 2×2 linear systems x′ = A x, solved exactly with the
// matrix exponential, beside the trace–determinant plane: drag the matrix
// around the plane and watch the portrait change type.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import type { Graphics } from '../../engine/plot2d';
import { expm2, apply2, classify2, eig2, matrixFromTraceDet, matrixShape, M2 } from '../../core/numeric/dynamics';
import { fmt, tx, pal, csvOf, P, label, fmtRoot, Palette } from './common';

const R = 3.2;

export const phase: DemoDef = {
  id: 'ode.phase', module: 'ode', title: 'Phase portraits and the trace–determinant plane',
  topic: 'Systems of ODEs · phase portraits · eigenvalues · classification of equilibria',
  summary: 'Every 2×2 linear system x′ = Ax is one of a handful of pictures — saddle, node, spiral, center — decided by the trace τ and determinant Δ of A. Drag A around the (τ, Δ) plane and the portrait changes with it.',
  tex: "\\mathbf x' = A\\mathbf x,\\quad \\mathbf x(t) = e^{At}\\mathbf x_0,\\quad \\lambda^2 - \\tau\\lambda + \\Delta = 0",
  view: 'split2d', animated: true,
  params: [
    { key: 'a', label: 'A₁₁', value: -0.5, min: -3, max: 3, step: 0.01 },
    { key: 'b', label: 'A₁₂', value: 2, min: -3, max: 3, step: 0.01 },
    { key: 'c', label: 'A₂₁', value: -1.5, min: -3, max: 3, step: 0.01 },
    { key: 'd', label: 'A₂₂', value: -0.3, min: -3, max: 3, step: 0.01 },
    { key: 'x0', label: 'initial x₀', value: 2, min: -3, max: 3, step: 0.01 },
    { key: 'y0', label: 'initial y₀', value: 1, min: -3, max: 3, step: 0.01 },
  ],
  toggles: [{ key: 'field', label: 'Direction field', value: true }, { key: 'eig', label: 'Eigenvector lines', value: true }, { key: 'flow', label: 'Particles in the flow', value: true }, { key: 'family', label: 'Family of trajectories', value: true }],
  experiments: [
    'Drag the gold point on the right below the τ-axis (Δ < 0): a saddle. Trajectories come in along one eigenvector and leave along the other.',
    'Drag it above the parabola Δ = τ²/4: the eigenvalues become complex and the trajectories spiral — in for τ < 0, out for τ > 0.',
    'Put it on the positive Δ-axis (τ = 0): a center — closed orbits, like an undamped oscillator.',
    'Cross the parabola from spiral to node: that crossing is exactly critical damping for x″ + cx′ + kx = 0, where τ = −c and Δ = k.',
    'Drag the initial point on the left; the gold trajectory is e^{At}x₀ through it.',
  ],
  connections: ['ode.stability', 'ode.charroots', 'ode.spring', 'ode.lotka'],
  accuracy: 'Exact: trajectories are e^{At}x₀ from the closed-form 2×2 matrix exponential (cosh/sinh, cos/sin or polynomial, chosen by the sign of τ²/4 − Δ, with a series near the boundary). Eigenvalues by the quadratic formula. Dragging in the (τ, Δ) plane keeps the matrix’s “shape” (its symmetric and rotational parts) and changes only τ and Δ.',
  tutorial: [
    { text: 'A linear system $\\mathbf x\' = A\\mathbf x$ moves every point of the plane along a trajectory. Along an **eigenvector** $\\mathbf v$ the motion is a straight line: $\\mathbf x = e^{\\lambda t}\\mathbf v$. Every other solution is a combination $c_1e^{\\lambda_1 t}\\mathbf v_1 + c_2e^{\\lambda_2 t}\\mathbf v_2$.\n\nThis matrix has eigenvalues $2$ and $-2$: a **saddle**.', task: 'Drag the gold initial point on the left and watch its trajectory.', set: { params: { a: 1, b: 1, c: 3, d: -1, x0: 0.5, y0: -0.8 }, toggles: { eig: true } }, done: (c) => Math.abs(c.params.x0 - 0.5) > 0.3 || Math.abs(c.params.y0 + 0.8) > 0.3 },
    { text: 'The eigenvalues solve $\\lambda^2 - \\tau\\lambda + \\Delta = 0$ with $\\tau = \\operatorname{tr}A$ and $\\Delta = \\det A$. So $\\lambda_1\\lambda_2 = \\Delta$ and $\\lambda_1 + \\lambda_2 = \\tau$:\n\n$\\Delta < 0$: real roots of opposite sign — saddle.\n$\\Delta > 0$, $\\tau < 0$: both have negative real part — stable.', task: 'In the trace–determinant plane, drag the matrix into the upper-left quadrant (τ < 0, Δ > 0).', done: (c) => c.params.a + c.params.d < 0 && c.params.a * c.params.d - c.params.b * c.params.c > 0 },
    { text: 'The parabola $\\Delta = \\tau^2/4$ is where the discriminant vanishes. **Above** it the eigenvalues are complex, $\\alpha \\pm i\\beta$ with $\\alpha = \\tau/2$: trajectories rotate with angular frequency $\\beta$ while growing or shrinking like $e^{\\alpha t}$ — **spirals**.', task: 'Move the matrix above the parabola to make a stable spiral.', done: (c) => classify2(c.params.a + c.params.d, c.params.a * c.params.d - c.params.b * c.params.c) === 'stable spiral' },
    { text: 'On the positive $\\Delta$-axis ($\\tau = 0$) the eigenvalues are $\\pm i\\sqrt\\Delta$: closed elliptical orbits, a **center**. It is structurally fragile — the slightest $\\tau \\ne 0$ turns it into a spiral. Conservative physics (an undamped spring, a frictionless pendulum near the bottom) lives here.', task: 'Put the matrix on the positive Δ-axis (|τ| < 0.05).', done: (c) => Math.abs(c.params.a + c.params.d) < 0.05 && c.params.a * c.params.d - c.params.b * c.params.c > 0.05 },
    { text: '**Below** the parabola with $\\Delta > 0$, both eigenvalues are real with the same sign: a **node**. All trajectories (but two) arrive tangent to the slow eigenvector — the one whose eigenvalue is closer to zero.', task: 'Make an unstable node (τ > 0, 0 < Δ < τ²/4).', done: (c) => classify2(c.params.a + c.params.d, c.params.a * c.params.d - c.params.b * c.params.c) === 'unstable node' },
    { text: 'A damped spring $x\'\' + cx\' + kx = 0$ is the system $x\' = v,\\; v\' = -kx - cv$, with $A = \\begin{pmatrix}0 & 1\\\\ -k & -c\\end{pmatrix}$: $\\tau = -c$, $\\Delta = k$. Under-, critically and overdamped are exactly spiral, the parabola, and node.', task: 'Increase the damping by lowering A₂₂ (= −c) until the spiral becomes a stable node.', set: { params: { a: 0, b: 1, c: -2, d: -0.5, x0: 2, y0: 0 } }, done: (c) => classify2(c.params.a + c.params.d, c.params.a * c.params.d - c.params.b * c.params.c) === 'stable node' },
  ],
  create: (ctx) => phaseInst(ctx),
};

interface Particle { x: number; y: number; life: number }

function phaseInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, td = ctx.plot2!;
  plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot.setView({ x0: -R, x1: R, y0: -R, y1: R });
  td.opts.xLabel = 'τ = tr A'; td.opts.yLabel = 'Δ = det A';
  td.setView({ x0: -4.2, x1: 4.2, y0: -3.2, y1: 5.2 });
  let A: M2 = [0, 0, 0, 0];
  let phi = 0;
  let bold: P[] = [];
  let tNow = 0;
  const parts: Particle[] = [];
  const seed = (): Particle => ({ x: (Math.random() * 2 - 1) * R, y: (Math.random() * 2 - 1) * R, life: 1 + Math.random() * 3 });
  for (let i = 0; i < 90; i++) parts.push(seed());
  let stepM: M2 = [1, 0, 0, 1], stepDt = -1;

  const traj = (x0: number, y0: number, t0 = -10, t1 = 10, n = 160): P[] => {
    const out: P[] = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n, E = expm2(A, t), p = apply2(E, x0, y0);
      if (Math.abs(p[0]) < 40 && Math.abs(p[1]) < 40) out.push(p); else if (out.length && t > 0) break; else out.length = 0;
    }
    return out;
  };

  function drawRegions(g: Graphics, c: Palette) {
    const v = g.view;
    g.polygon([[v.x0, v.y0], [v.x1, v.y0], [v.x1, 0], [v.x0, 0]], { fill: c.fill(c.orange, 0.1) });
    const para = (s: number) => (s * s) / 4;
    g.fillBetween(para, () => v.y1, v.x0, v.x1, { fill: c.fill(c.violet, 0.1) });
    g.fillBetween(() => 0, para, v.x0, v.x1, { fill: c.fill(c.blue, 0.08) });
    g.fn(para, { color: c.violet, width: 2 });
    g.line([0, 0], [0, v.y1], { color: c.green, width: 2.2 });
    const lab = (at: P, s: string, col: string) => label(g, at, s, col, { align: 'center', size: 12, bold: true });
    lab([-2.6, 4.4], 'stable spiral', c.violet); lab([2.6, 4.4], 'unstable spiral', c.violet);
    lab([-3.2, 1.2], 'stable node', c.blue); lab([3.2, 1.2], 'unstable node', c.blue);
    lab([0, -1.8], 'saddle', c.orange); label(g, [0.12, 4.65], 'center (τ = 0)', c.green, { size: 12, bold: true });
    label(g, [3.6, para(3.6)], 'Δ = τ²/4', c.violet, { align: 'right', dx: -8, dy: -2, size: 11 });
  }

  function update() {
    const { a, b, c, d, x0, y0 } = ctx.params;
    A = [a, b, c, d];
    const sh = matrixShape(A, phi); phi = sh.phi;
    const tau = a + d, D = a * d - b * c;
    const kind = classify2(tau, D, 1e-9, A);
    const E = eig2(A);
    const C = pal(ctx);
    bold = traj(x0, y0, -12, 12, 600);
    const fam: P[][] = [];
    if (ctx.toggles.family) for (let i = 0; i < 14; i++) { const th = (2 * Math.PI * i) / 14 + 0.2; fam.push(traj(2.9 * Math.cos(th), 2.9 * Math.sin(th))); }
    const eigLines = ctx.toggles.eig ? E.vectors.filter((v): v is [number, number] => !!v) : [];
    stepDt = -1;
    plot.setDraw((g) => {
      if (ctx.toggles.field) g.field((x, y) => apply2(A, x, y), 17, 'viridis');
      for (const f of fam) g.path(f, { color: C.faint, width: 1.4 });
      eigLines.forEach((v, i) => g.line([-v[0] * 10, -v[1] * 10], [v[0] * 10, v[1] * 10], { color: i ? C.cyan : C.pink, width: 2, dash: [8, 5] }));
      if (ctx.toggles.flow) for (const p of parts) g.point([p.x, p.y], 2.2, { fill: C.cyan, alpha: Math.min(1, p.life) });
      g.path(bold, { color: C.gold, width: 3 });
      const now = apply2(expm2(A, tNow), x0, y0);
      if (Math.abs(now[0]) < 2 * R && Math.abs(now[1]) < 2 * R) g.point(now, 5.5, { fill: C.orange });
      g.point([0, 0], 4, { fill: C.ink });
      g.handle({ id: 'x0', at: [x0, y0], color: C.gold, label: 'x₀', onDrag: ([x, y]) => { ctx.setParam('x0', clamp(x, -3, 3)); ctx.setParam('y0', clamp(y, -3, 3)); tNow = 0; update(); } });
    });
    td.setDraw((g) => {
      drawRegions(g, C);
      g.handle({ id: 'td', at: [tau, D], color: C.gold, label: `A: (${fmt(tau, 3)}, ${fmt(D, 3)})`, onDrag: ([t2, d2]) => {
        const M = matrixFromTraceDet(clamp(t2, -6, 6), clamp(d2, -9, 9), { phi, e: sh.e });
        ['a', 'b', 'c', 'd'].forEach((k, i) => ctx.setParam(k, +M[i].toFixed(4)));
        update();
      } });
    });
    const [l1, l2] = E.values;
    const rows: Readout[] = [
      { label: 'A', value: `\\begin{pmatrix} ${tx(a)} & ${tx(b)} \\\\ ${tx(c)} & ${tx(d)} \\end{pmatrix}`, tex: true },
      { label: 'trace τ, determinant Δ', value: `${fmt(tau)},  ${fmt(D)}` },
      { label: 'discriminant τ² − 4Δ', value: fmt(tau * tau - 4 * D) },
      { label: 'eigenvalues', value: `${fmtRoot(l1)},  ${fmtRoot(l2)}` },
      { label: 'type', value: kind, tone: kind.startsWith('stable') ? 'good' : kind === 'center' ? 'muted' : kind.startsWith('saddle') || kind.startsWith('unstable') ? 'bad' : 'warn' },
    ];
    if (l1.im === 0 && E.vectors[0] && E.vectors[1]) {
      const [v1, v2] = E.vectors as [number, number][];
      const det = v1[0] * v2[1] - v2[0] * v1[1];
      if (Math.abs(det) > 1e-9) {
        const c1 = (x0 * v2[1] - v2[0] * y0) / det, c2 = (v1[0] * y0 - x0 * v1[1]) / det;
        rows.push({ label: 'solution', value: `\\mathbf x = ${tx(c1, 3)}\\,e^{${tx(l1.re, 3)}t}\\binom{${tx(v1[0], 3)}}{${tx(v1[1], 3)}} ${c2 < 0 ? '-' : '+'} ${tx(Math.abs(c2), 3)}\\,e^{${tx(l2.re, 3)}t}\\binom{${tx(v2[0], 3)}}{${tx(v2[1], 3)}}`, tex: true });
      }
    } else if (l1.im !== 0) {
      rows.push({ label: 'rotation period 2π/β', value: fmt((2 * Math.PI) / Math.abs(l1.im)) }, { label: 'growth per turn e^(2πα/β)', value: fmt(Math.exp((2 * Math.PI * l1.re) / Math.abs(l1.im))) });
    }
    ctx.setReadouts(rows);
    ctx.setNote(`**${kind[0].toUpperCase() + kind.slice(1)}.** ${describe(kind)} The gold curve is $e^{At}\\mathbf x_0$ for $t \\in [-12, 12]$; the orange dot is where it is at the current time.`);
  }

  return {
    update,
    tick(dt) {
      tNow += dt * 0.6;
      if (tNow >= 6) tNow -= 12;   // the dot loops over [−6, 6) around x₀
      if (ctx.toggles.flow) {
        const h = dt * 0.6;
        if (Math.abs(h - stepDt) > 1e-6) { stepM = expm2(A, h); stepDt = h; }
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const [x, y] = apply2(stepM, p.x, p.y);
          p.x = x; p.y = y; p.life -= dt;
          if (p.life < 0 || Math.abs(x) > R * 1.3 || Math.abs(y) > R * 1.3 || Math.hypot(x, y) < 0.02) parts[i] = seed();
        }
      }
      plot.render();
    },
    reset() { tNow = 0; },
    csv() {
      const { x0, y0 } = ctx.params;
      return csvOf(['t', 'x', 'y'], Array.from({ length: 601 }, (_, i) => { const t = -6 + (12 * i) / 600; const p = apply2(expm2(A, t), x0, y0); return [t, p[0], p[1]]; }));
    },
    dispose() {},
  };
}

function describe(kind: string): string {
  if (kind === 'saddle') return 'Eigenvalues of opposite sign: solutions approach along one eigenvector and leave along the other. Unstable.';
  if (kind.endsWith('node')) return 'Two real eigenvalues of one sign: no rotation; trajectories leave or arrive tangent to the slower eigenvector.';
  if (kind.endsWith('spiral')) return 'Complex eigenvalues α ± iβ: rotation at rate β while the distance changes like e^{αt}.'.replace('e^{αt}', '$e^{\\alpha t}$');
  if (kind === 'center') return 'Purely imaginary eigenvalues: closed orbits. A borderline case — any trace makes it a spiral.';
  if (kind.includes('star')) return 'A repeated eigenvalue: the borderline between node and spiral (critical damping).';
  if (kind.includes('line')) return 'A zero eigenvalue: a whole line of equilibria.';
  return 'A degenerate case.';
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
