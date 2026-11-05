// Nonlinear planar systems: equilibria found by Newton's method, the exact
// (symbolic) Jacobian at each, its eigenvalues and the resulting type, stable
// and unstable manifolds of saddles, nullclines, and the linearization drawn
// against the true flow near a chosen equilibrium (Hartman–Grobman).

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import { parse, compile, jacobian, toTeX, simplify, freeSymbols, Node, Fn } from '../../core/expr';
import { solveAdaptive, rk4Step } from '../../core/numeric/ode';
import { equilibria, eig2, classify2, expm2, apply2, M2 } from '../../core/numeric/dynamics';
import { fmt, tx, pal, csvOf, P, label, fmtRoot, texRoot, changed, thin } from './common';

interface Preset { name: string; f: string; g: string; a: number; view: [number, number, number, number]; note: string }

const PRESETS: Record<string, Preset> = {
  pendulum: { name: 'Damped pendulum', f: 'y', g: '-sin(x) - a*y', a: 0.3, view: [-7.5, 7.5, -3.5, 3.5], note: 'x is the angle, y the angular velocity. The bottom (0, 0) is a stable spiral when damped (a center when a = 0); the top (±π, 0) is a saddle whose manifolds separate swinging from going over the top.' },
  competition: { name: 'Competing species', f: 'x*(3 - x - 2*y)', g: 'y*(2 - x - y)', a: 0, view: [-0.4, 3.6, -0.4, 2.6], note: 'Two species competing for one resource (Lotka–Volterra competition). The coexistence point is a saddle: one species always wins, and the saddle’s stable manifold divides the plane by which one.' },
  predprey: { name: 'Predator–prey with a carrying capacity', f: 'x*(1 - x/3) - x*y', g: 'y*(x - a)', a: 1, view: [-0.3, 3.5, -0.3, 2] , note: 'Prey x grows logistically and is eaten; predators y need prey to survive. The interior equilibrium is a stable spiral: populations oscillate and settle. Raise a (predator death rate) past 3 and the predators die out.' },
  duffing: { name: 'Double-well (Duffing) oscillator', f: 'y', g: 'x - x^3 - a*y', a: 0.25, view: [-2.2, 2.2, -1.6, 1.6], note: 'A particle in the potential V = x⁴/4 − x²/2 with friction. Two stable wells at x = ±1, a saddle on the hump at 0. The stable manifolds of the saddle are the boundary between the two basins of attraction.' },
  saddlenode: { name: 'Saddle–node bifurcation', f: 'a + x^2', g: '-y', a: -1, view: [-2.5, 2.5, -1.8, 1.8], note: 'For a < 0 a node and a saddle sit at x = ±√(−a). As a rises to 0 they collide and annihilate; for a > 0 nothing is left. Equilibria are born and die in pairs.' },
  hopf: { name: 'Hopf bifurcation', f: 'a*x - y - x*(x^2 + y^2)', g: 'x + a*y - y*(x^2 + y^2)', a: 0.5, view: [-1.8, 1.8, -1.4, 1.4], note: 'At the origin the Jacobian has eigenvalues a ± i. For a < 0 it is a stable spiral; at a = 0 the pair crosses the imaginary axis and a stable limit cycle of radius √a is born (a supercritical Hopf bifurcation). The linearization alone cannot see the cycle.' },
  custom: { name: 'Custom (type it in the field)', f: '', g: '', a: 1, view: [-3, 3, -2.2, 2.2], note: 'Your system. Write it as “f; g” using x, y and the parameter a.' },
};

export const stability: DemoDef = {
  id: 'ode.stability', module: 'ode', title: 'Stability, equilibria and linearization',
  topic: 'Nonlinear systems · equilibria · Jacobian · eigenvalues · stable and unstable manifolds',
  summary: 'Near an equilibrium a nonlinear system looks like its linearization u′ = J u, where J is the Jacobian there. The eigenvalues of J decide stability — unless one has zero real part, when the nonlinear terms decide.',
  tex: "\\mathbf x' = \\mathbf F(\\mathbf x),\\; \\mathbf F(\\mathbf x^*) = 0,\\; J = \\frac{\\partial(f,g)}{\\partial(x,y)}\\Big|_{\\mathbf x^*}",
  view: '2d', animated: true,
  input: { label: 'Custom system  f(x, y); g(x, y)', value: 'y; -x + a*(1 - x^2)*y', placeholder: 'x′ and y′ separated by “;” — e.g. y; -sin(x) - a*y' },
  params: [
    { key: 'a', label: 'parameter a', value: 0.3, min: -2, max: 4, step: 0.01 },
    { key: 'x0', label: 'initial x', value: 2.5, min: -8, max: 8, step: 0.01 },
    { key: 'y0', label: 'initial y', value: 1.2, min: -4, max: 4, step: 0.01 },
    { key: 'T', label: 'integration time', value: 25, min: 2, max: 80, step: 0.5 },
  ],
  choices: [{ key: 'sys', label: 'System', value: 'pendulum', options: Object.entries(PRESETS).map(([k, p]) => [k, p.name]) }],
  toggles: [{ key: 'manifolds', label: 'Saddle manifolds (separatrices)', value: true }, { key: 'nullclines', label: 'Nullclines f = 0, g = 0', value: false }, { key: 'linear', label: 'Linearization at the selected equilibrium', value: false }, { key: 'flow', label: 'Particles in the flow', value: true }],
  experiments: [
    'Click near an equilibrium to select it: its Jacobian and eigenvalues appear, and the linearization toggle compares the linear flow (dashed) with the true one.',
    'Damped pendulum: the stable manifolds of the saddles (cyan) wind around the bottom; they separate initial conditions by how many times the pendulum goes over the top.',
    'Hopf: slide a through 0. The linearization switches from stable to unstable spiral, and a closed orbit — invisible to the linearization — appears.',
    'Saddle–node: slide a up to 0 and watch the two equilibria merge and vanish.',
    'Competing species: drag the initial point across the cyan stable manifold of the coexistence saddle and see the winner change.',
  ],
  connections: ['ode.phase', 'ode.pendulum', 'ode.lotka', 'ode.vanderpol'],
  accuracy: 'The Jacobian is the exact symbolic derivative of your expressions. Equilibria are found by Newton’s method from a 17×17 grid of seeds (converged to |F| < 10⁻¹²; ones outside the view are not searched). Manifolds and trajectories are numerical (Dormand–Prince 5(4), rtol 10⁻⁸), started 10⁻⁴ from the saddle along the exact eigenvectors. The linearization’s flow is exact (matrix exponential).',
  create: (ctx) => stabInst(ctx),
};

interface Eq { x: number; y: number; J: M2; kind: string; vals: ReturnType<typeof eig2> }

function parseSystem(src: string): [Node, Node] {
  const parts = src.split(/;|\n/).map((s) => s.replace(/^\s*[xy]\s*['′]\s*=\s*/, '').trim()).filter(Boolean);
  if (parts.length !== 2) throw new Error('write two expressions separated by “;”, e.g. y; -sin(x)');
  const nodes = parts.map((p) => parse(p, { names: ['a'] })) as [Node, Node];
  for (const n of nodes) for (const s of freeSymbols(n)) if (!['x', 'y', 'a'].includes(s)) throw new Error(`“${s}” is not x, y or the parameter a`);
  return nodes;
}

interface Particle { x: number; y: number; life: number }

function stabInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  const reframe = changed();
  let f: Fn = () => 0, g: Fn = () => 0, Jf: Fn[][] = [];
  let eqs: Eq[] = [];
  let selected = 0;
  let traj: P[] = [], back: P[] = [], trajT: number[] = [];
  const parts: Particle[] = [];
  let FF = (x: number, y: number): [number, number] => [f([x, y]), g([x, y])];
  const rhs = (_t: number, Y: number[]) => FF(Y[0], Y[1]);
  const seed = (): Particle => { const v = plot.view; return { x: v.x0 + Math.random() * (v.x1 - v.x0), y: v.y0 + Math.random() * (v.y1 - v.y0), life: 1 + Math.random() * 3 }; };

  plot.onClick = ([x, y]) => {
    if (!eqs.length) return;
    let best = 0, bd = Infinity;
    eqs.forEach((e, i) => { const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; best = i; } });
    selected = best;
    update();
  };

  function update() {
    const key = ctx.choices.sys ?? 'pendulum';
    const pre = PRESETS[key] ?? PRESETS.pendulum;
    const a = ctx.params.a;
    let nodes: [Node, Node];
    try {
      nodes = key === 'custom' ? parseSystem(ctx.input || 'y; -x') : [parse(pre.f, { names: ['a'] }), parse(pre.g, { names: ['a'] })];
      ctx.warn('');
    } catch (e) {
      ctx.warn(`Could not read the system: ${(e as Error).message}`);
      return;
    }
    const J = jacobian(nodes, ['x', 'y']).map((r) => r.map((n) => simplify(n)));
    try {
      f = compile(nodes[0], ['x', 'y'], { a }); g = compile(nodes[1], ['x', 'y'], { a });
      Jf = J.map((r) => r.map((n) => compile(n, ['x', 'y'], { a })));
    } catch (e) { ctx.warn((e as Error).message); return; }
    FF = (x, y) => [f([x, y]), g([x, y])];
    if (reframe(key)) {
      const [x0, x1, y0, y1] = pre.view;
      plot.setView({ x0, x1, y0, y1 });
      selected = 0;
      for (let i = parts.length; i < 110; i++) parts.push(seed());
      for (let i = 0; i < parts.length; i++) parts[i] = seed();
    }
    const v = plot.view;
    const Jat = (x: number, y: number): M2 => [Jf[0][0]([x, y]), Jf[0][1]([x, y]), Jf[1][0]([x, y]), Jf[1][1]([x, y])];
    eqs = equilibria(FF, Jat, { x: [v.x0, v.x1], y: [v.y0, v.y1] }, 16).map((p) => {
      const M = Jat(p.x, p.y), tau = M[0] + M[3], D = M[0] * M[3] - M[1] * M[2];
      return { x: p.x, y: p.y, J: M, kind: classify2(tau, D, 1e-9, M), vals: eig2(M) };
    }).sort((p, q) => p.x - q.x || p.y - q.y);
    if (selected >= eqs.length) selected = 0;
    const { x0, y0, T } = ctx.params;
    const o = { rtol: 1e-8, atol: 1e-10, maxStep: 0.05, maxSteps: 30000 };
    const fw = solveAdaptive(rhs, [x0, y0], 0, T, o), bw = solveAdaptive(rhs, [x0, y0], 0, -Math.min(T, 6), o);
    traj = fw.y.map((Y) => [Y[0], Y[1]] as P); trajT = fw.t; back = bw.y.map((Y) => [Y[0], Y[1]] as P);
    const span = Math.max(v.x1 - v.x0, v.y1 - v.y0);
    const inside = (Y: number[]) => Math.abs(Y[0]) < 50 * span && Math.abs(Y[1]) < 50 * span;
    // manifolds of the saddles
    const man: { pts: P[]; stable: boolean }[] = [];
    if (ctx.toggles.manifolds) for (const e of eqs) {
      if (e.kind !== 'saddle') continue;
      e.vals.vectors.forEach((vec, i) => {
        if (!vec) return;
        const stable = e.vals.values[i].re < 0;
        for (const s of [1, -1]) {
          const st = [e.x + s * 1e-4 * vec[0] * span, e.y + s * 1e-4 * vec[1] * span];
          const tr = solveAdaptive(rhs, st, 0, stable ? -18 : 18, { ...o, maxSteps: 8000 });
          const pts: P[] = [[e.x, e.y]];
          for (const Y of tr.y) { if (!inside(Y)) break; pts.push([Y[0], Y[1]]); }
          man.push({ pts: thin(pts, 220), stable });
        }
      });
    }
    // linearization near the selected equilibrium
    const lin: { exact: P[]; true: P[] }[] = [];
    const sel = eqs[selected];
    const r0 = span * 0.09;
    if (ctx.toggles.linear && sel) {
      for (let i = 0; i < 10; i++) {
        const th = (2 * Math.PI * i) / 10 + 0.3, ux = r0 * Math.cos(th), uy = r0 * Math.sin(th);
        const ex: P[] = [];
        for (let k = 0; k <= 120; k++) { const t = -2.5 + (5 * k) / 120, u = apply2(expm2(sel.J, t), ux, uy); if (Math.hypot(...u) < 2.2 * r0) ex.push([sel.x + u[0], sel.y + u[1]]); }
        const tr1 = solveAdaptive(rhs, [sel.x + ux, sel.y + uy], 0, 2.5, { ...o, maxSteps: 3000 }), tr2 = solveAdaptive(rhs, [sel.x + ux, sel.y + uy], 0, -2.5, { ...o, maxSteps: 3000 });
        const tp = [...tr2.y.slice().reverse(), ...tr1.y].filter((Y) => Math.hypot(Y[0] - sel.x, Y[1] - sel.y) < 2.2 * r0).map((Y) => [Y[0], Y[1]] as P);
        lin.push({ exact: ex, true: tp });
      }
    }
    const C = pal(ctx);
    plot.setDraw((gr) => {
      gr.field((x, y) => FF(x, y), 22, 'viridis');
      if (ctx.toggles.nullclines) { gr.implicit((x, y) => f([x, y]), { color: C.pink, width: 1.8, dash: [6, 4] }, 220); gr.implicit((x, y) => g([x, y]), { color: C.green, width: 1.8, dash: [6, 4] }, 220); }
      for (const m of man) gr.path(m.pts, { color: m.stable ? C.cyan : C.red, width: 2.2 });
      if (ctx.toggles.flow) for (const p of parts) gr.point([p.x, p.y], 2, { fill: C.ink, alpha: Math.min(0.8, p.life) });
      gr.path(thin(back, 200), { color: C.gold, width: 1.4, alpha: 0.45 });
      gr.path(thin(traj, 600), { color: C.gold, width: 2.8 });
      if (sel && ctx.toggles.linear) {
        gr.parametric((s) => sel.x + 2.2 * r0 * Math.cos(s), (s) => sel.y + 2.2 * r0 * Math.sin(s), 0, 2 * Math.PI, { color: C.muted, width: 1, dash: [3, 3] }, 100);
        for (const l of lin) { gr.path(l.true, { color: C.ink, width: 1.6 }); gr.path(l.exact, { color: C.pink, width: 1.8, dash: [5, 4] }); }
      }
      eqs.forEach((e, i) => {
        const col = e.kind.startsWith('stable') ? C.green : e.kind === 'saddle' ? C.orange : e.kind === 'center' ? C.violet : e.kind.startsWith('unstable') ? C.red : C.muted;
        if (i === selected) gr.point([e.x, e.y], 11, { fill: 'rgba(0,0,0,0)', color: C.ink, width: 2 });
        gr.point([e.x, e.y], 6.5, { fill: e.kind.startsWith('stable') ? col : C.bg, color: col, width: 2.5 });
        label(gr, [e.x, e.y], e.kind.replace(' / degenerate node', ''), col, { dx: 10, dy: 12, size: 11 });
      });
      gr.handle({ id: 'ic', at: [x0, y0], color: C.gold, label: 'start', onDrag: ([x, y]) => { ctx.setParam('x0', x); ctx.setParam('y0', y); update(); } });
    });
    const rows: Readout[] = [
      { label: 'system', value: `x' = ${toTeX(nodes[0])},\\quad y' = ${toTeX(nodes[1])}`, tex: true },
      { label: 'Jacobian J(x, y)', value: `\\begin{pmatrix} ${toTeX(J[0][0])} & ${toTeX(J[0][1])} \\\\ ${toTeX(J[1][0])} & ${toTeX(J[1][1])} \\end{pmatrix}`, tex: true },
      { label: 'equilibria in view', value: String(eqs.length) },
    ];
    if (sel) {
      const [l1, l2] = sel.vals.values;
      const hyper = Math.abs(l1.re) > 1e-9 && Math.abs(l2.re) > 1e-9;
      rows.push(
        { label: 'selected (click to change)', value: `(${fmt(sel.x)}, ${fmt(sel.y)})` },
        { label: 'J at the equilibrium', value: `\\begin{pmatrix} ${tx(sel.J[0])} & ${tx(sel.J[1])} \\\\ ${tx(sel.J[2])} & ${tx(sel.J[3])} \\end{pmatrix}`, tex: true },
        { label: 'eigenvalues of J', value: `${fmtRoot(l1)},  ${fmtRoot(l2)}` },
        { label: 'type', value: hyper ? sel.kind : `${sel.kind} of the linearization — not hyperbolic, so nonlinear terms decide`, tone: hyper ? (sel.kind.startsWith('stable') ? 'good' : 'bad') : 'warn' },
      );
    }
    if (!fw.ok) rows.push({ label: 'trajectory', value: fw.warning ?? 'stopped', tone: 'warn' });
    ctx.setReadouts(rows);
    ctx.setSteps(eqs.map((e): StepRow => ({
      title: `Equilibrium (${fmt(e.x)}, ${fmt(e.y)})`,
      tex: `J = \\begin{pmatrix} ${tx(e.J[0])} & ${tx(e.J[1])} \\\\ ${tx(e.J[2])} & ${tx(e.J[3])} \\end{pmatrix},\\quad \\lambda = ${texRoot(e.vals.values[0])},\\; ${texRoot(e.vals.values[1])}`,
      detail: `${e.kind}. τ = ${fmt(e.J[0] + e.J[3])}, Δ = ${fmt(e.J[0] * e.J[3] - e.J[1] * e.J[2])}.`,
    })));
    ctx.setNote(`**${pre.name}.** ${pre.note} ${ctx.toggles.manifolds ? 'Cyan: stable manifolds of saddles; red: unstable manifolds.' : ''}`);
  }

  return {
    update,
    tick(dt) {
      if (ctx.toggles.flow) {
        const v = plot.view, h = dt * 0.8;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const n = rk4Step(rhs, 0, [p.x, p.y], h);
          p.x = n[0]; p.y = n[1]; p.life -= dt;
          if (p.life < 0 || !(p.x > v.x0 && p.x < v.x1 && p.y > v.y0 && p.y < v.y1)) parts[i] = seed();
        }
      }
      plot.render();
    },
    csv() { return csvOf(['t', 'x', 'y'], traj.map((p, i) => [trajT[i], p[0], p[1]])); },
    dispose() { plot.onClick = undefined; },
  };
}
