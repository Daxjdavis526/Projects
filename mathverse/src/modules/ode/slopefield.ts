// Direction fields: y′ = f(t, y) typed by the learner, a draggable initial
// point, a family of solutions, the zero-slope isocline, the phase line of an
// autonomous equation, and tracers that flow along the solutions.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { parse, compile, derivative, toTeX, freeSymbols, Node, Fn } from '../../core/expr';
import { solveAdaptive, rk4Step, Trajectory } from '../../core/numeric/ode';
import { findRoots } from '../../core/numeric/roots';
import type { Graphics } from '../../engine/plot2d';
import { fmt, pal, csvOf, P, drawRuns, label, seriesOf, Palette, thin } from './common';

/** Parse "y' = …" / "dy/dt = …" / "…" into a right-hand side f(t, y) (x is accepted for t). */
export function parseRhs(src: string): { node: Node; indep: string } {
  const body = src.replace(/^\s*(y\s*['′]|dy\s*\/\s*d[tx])\s*=\s*/i, '');
  const node = parse(body, { names: ['a'] });
  const syms = freeSymbols(node);
  const indep = syms.has('x') && !syms.has('t') ? 'x' : 't';
  for (const s of syms) if (![indep, 'y', 'a'].includes(s)) throw new Error(`“${s}” is not t, y or the parameter a`);
  return { node, indep };
}

export const slopefield: DemoDef = {
  id: 'ode.slopefield', module: 'ode', title: 'Direction fields and solution curves',
  topic: 'First-order equations · direction fields · equilibria and the phase line',
  summary: 'A first-order equation assigns a slope to every point of the (t, y) plane. Solutions are the curves that follow those slopes everywhere; drag the initial point and the solution through it redraws.',
  tex: "y' = f(t, y),\\qquad y(t_0) = y_0",
  view: '2d', animated: true,
  input: { label: 'y′ = f(t, y)', value: 't - y^2', placeholder: 'e.g. y*(1 - y),  sin(t) - y,  a*y - y^3' },
  params: [
    { key: 't0', label: 'initial time t₀', value: 0, min: -6, max: 6, step: 0.01 },
    { key: 'y0', label: 'initial value y₀', value: 0.5, min: -4, max: 4, step: 0.01 },
    { key: 'a', label: 'parameter a (write “a” in f)', value: 1, min: -3, max: 3, step: 0.01 },
    { key: 'density', label: 'field density', value: 26, min: 10, max: 44, step: 1 },
  ],
  toggles: [
    { key: 'family', label: 'Family of solutions', value: true },
    { key: 'iso', label: 'Zero-slope isocline f = 0', value: false },
    { key: 'flow', label: 'Tracers flowing along solutions', value: true },
    { key: 'phase', label: 'Equilibria and phase line (autonomous f)', value: true },
  ],
  experiments: [
    'Drag the gold initial point. Solutions never cross where f is smooth — watch two of them squeeze together but never meet.',
    'Type `y*(1 - y)` (logistic). Which horizontal lines attract nearby solutions and which repel them?',
    'Type `a*y - y^3` and slide a through 0: one equilibrium splits into three (a pitchfork bifurcation).',
    'Type `y^2` and start at y₀ = 1: the solution reaches infinity at t = 1 even though f is perfectly smooth.',
    'Click anywhere to pin another solution through that point.',
  ],
  connections: ['ode.ivp', 'ode.separable', 'ode.linear1', 'ode.euler'],
  accuracy: 'Solutions are numerical (Dormand–Prince 5(4), relative tolerance 10⁻⁸), integrated across the visible window in both directions. ∂f/∂y is the exact symbolic derivative. Equilibria of autonomous equations are located by bisection to about 10⁻¹² and classified by the sign of f′(y) (a tangential, semi-stable root is not detected). Tracers move by RK4 steps of one frame.',
  tutorial: [
    { text: 'A **direction field** draws, at each point $(t, y)$, a short segment of slope $f(t, y)$. A solution of $y\' = f(t,y)$ is a curve tangent to every segment it passes through.\n\nThis is $y\' = t - y^2$: no formula for its solutions exists in elementary functions, yet the picture tells you how they behave.', task: 'Drag the gold initial point and watch the solution through it redraw.', set: { input: 't - y^2', params: { t0: 0, y0: 0.5, a: 1 }, toggles: { family: true, flow: true } }, done: (c) => Math.abs(c.params.y0 - 0.5) > 0.3 || Math.abs(c.params.t0) > 0.3 },
    { text: 'When $f$ does not depend on $t$ the equation is **autonomous**: the field is the same in every column. The zeros of $f$ are **equilibria** — constant solutions. For the logistic equation $y\' = y(1-y)$ they are $y = 0$ and $y = 1$.\n\nAn equilibrium is **stable** when $f\'(y^*) < 0$ (solutions nearby move toward it) and **unstable** when $f\'(y^*) > 0$.', task: 'Start a solution below y = 0. Where does it go?', set: { input: 'y*(1 - y)', params: { t0: -4, y0: 0.2 }, toggles: { phase: true } }, done: (c) => c.params.y0 < 0 },
    { text: 'Fields can depend on a parameter. In $y\' = a y - y^3$, for $a < 0$ there is one stable equilibrium at $0$; as $a$ passes $0$ it becomes unstable and two new stable ones appear at ±√a — a **pitchfork bifurcation**.', task: 'Slide a from negative to positive and watch the equilibria split.', set: { input: 'a*y - y^3', params: { a: -1, t0: -4, y0: 1.5 } }, done: (c) => c.params.a > 0.3 },
    { text: 'Where the field is horizontal, $f(t, y) = 0$: that curve is the **zero-slope isocline** (nullcline). A solution crossing it has a horizontal tangent there — a maximum or a minimum.\n\nFor $y\' = t - y^2$ it is the parabola $t = y^2$. Solutions in its lower branch are pushed away (an anti-funnel); in the upper branch they are pulled together (a funnel).', task: 'Turn on the zero-slope isocline.', set: { input: 't - y^2', params: { t0: -2, y0: 1 }, toggles: { iso: false } }, done: (c) => c.toggles.iso },
    { text: '**Existence is only local.** $y\' = y^2$ has a perfectly smooth right-hand side, but its solution $y = y_0 / (1 - y_0 t)$ reaches infinity at $t = 1/y_0$. The solver stops there and says so.', task: 'Start at t₀ = 0 and move y₀ to 2: the blow-up time moves to t = 1/2.', set: { input: 'y^2', params: { t0: 0, y0: 1 } }, done: (c) => Math.abs(c.params.y0 - 2) < 0.15 && Math.abs(c.params.t0) < 0.2 },
    { text: 'A stable, forced equation forgets where it started: for $y\' = -2y + \\sin 3t$ every solution approaches the same oscillation (the **steady state**), because the difference of two solutions decays like $e^{-2t}$.\n\nThis is the first-order version of the transient-plus-steady-state picture of a driven oscillator.', task: 'Drag the initial point far up or down — the solutions still converge.', set: { input: '-2*y + sin(3*t)', params: { t0: -5, y0: 0.5 } }, done: (c) => Math.abs(c.params.y0) > 2.5 },
  ],
  create: (ctx) => slopefieldDemo(ctx),
};

interface Tracer { t: number; y: number; life: number }

function slopefieldDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  plot.setView({ x0: -6, x1: 6, y0: -4, y1: 4 });
  let f: Fn = () => 0, dfdy: Fn | null = null, dTeX = '', autonomous = false, indep = 't';
  let lastGood = '';
  const pins: P[] = [];
  const tracers: Tracer[] = [];
  let main: Trajectory[] = [], family: Trajectory[] = [], pinned: Trajectory[][] = [];
  let cacheKey = '';
  let markerS = 0;

  plot.onClick = (p) => { pins.push(p); if (pins.length > 6) pins.shift(); cacheKey = ''; plot.render(); };

  const F = (t: number, y: number) => f([t, y]);
  const rhs = (t: number, Y: number[]) => [F(t, Y[0])];

  function both(t0: number, y0: number, x0: number, x1: number, span: number): Trajectory[] {
    const o = { maxStep: (x1 - x0) / 250, maxSteps: 6000, rtol: 1e-8, atol: 1e-10 };
    const out: Trajectory[] = [];
    if (x1 > t0) out.push(solveAdaptive(rhs, [y0], t0, x1, o));
    if (x0 < t0) out.push(solveAdaptive(rhs, [y0], t0, x0, o));
    // keep only what is near the view (huge values are clipped when drawn)
    void span;
    return out;
  }

  function recompute() {
    const v = plot.view, span = v.y1 - v.y0;
    const key = [v.x0, v.x1, v.y0, v.y1, ctx.params.t0, ctx.params.y0, ctx.params.a, lastGood, pins.length, pins.map(String).join(';'), ctx.toggles.family].join('|');
    if (key === cacheKey) return;
    cacheKey = key;
    main = both(ctx.params.t0, ctx.params.y0, v.x0, v.x1, span);
    family = [];
    if (ctx.toggles.family) {
      const tc = (v.x0 + v.x1) / 2;
      for (let i = 0; i < 15; i++) family.push(...both(tc, v.y0 + ((i + 0.5) / 15) * span, v.x0, v.x1, span));
    }
    pinned = pins.map(([t, y]) => both(t, y, v.x0, v.x1, span));

  }

  const draw = () => plot.setDraw((g) => {
    const c = pal(ctx), S = seriesOf(c);
    recompute();
    const v = g.view, lim = (v.y1 - v.y0) * 20 + Math.abs(v.y0) + Math.abs(v.y1);
    g.slopeField(F, Math.round(ctx.params.density), { color: c.field, width: 1.2, alpha: 0.75 });
    if (ctx.toggles.iso) g.implicit(F, { color: c.violet, width: 2, dash: [6, 4] }, 200);
    if (ctx.toggles.phase && autonomous) drawPhaseLine(g, c);
    for (const tr of family) drawRuns(g, thin(tr.t.map((s, k) => [s, tr.y[k][0]] as P), 140), { color: c.faint, width: 1.3 }, lim);
    pinned.forEach((pair, i) => { for (const tr of pair) drawRuns(g, thin(tr.t.map((s, k) => [s, tr.y[k][0]] as P), 250), { color: S[(i + 2) % S.length], width: 2 }, lim); g.point(pins[i], 4, { fill: S[(i + 2) % S.length] }); });
    for (const tr of main) drawRuns(g, tr.t.map((s, k) => [s, tr.y[k][0]] as P), { color: c.blue, width: 3 }, lim);
    if (ctx.toggles.flow) for (const p of tracers) g.point([p.t, p.y], 2.4, { fill: c.cyan, alpha: Math.min(1, p.life) });
    // the moving point on the main solution, with its tangent segment
    const fwd = main[0];
    if (fwd && fwd.t.length > 1) {
      const n = fwd.t.length, k = Math.min(n - 1, Math.floor(markerS * (n - 1)));
      const tt = fwd.t[k], yy = fwd.y[k][0], m = F(tt, yy);
      if (Number.isFinite(yy) && Number.isFinite(m) && yy > v.y0 && yy < v.y1) {
        const L = (v.x1 - v.x0) * 0.06, dx = L / Math.sqrt(1 + (m * (v.x1 - v.x0) / (v.y1 - v.y0)) ** 2);
        g.line([tt - dx, yy - m * dx], [tt + dx, yy + m * dx], { color: c.orange, width: 3 });
        g.point([tt, yy], 4.5, { fill: c.orange });
      }
    }
    g.handle({ id: 'ic', at: [ctx.params.t0, ctx.params.y0], color: c.gold, label: '(t₀, y₀)', onDrag: ([t, y]) => { ctx.setParam('t0', clamp(t, -6, 6)); ctx.setParam('y0', clamp(y, -4, 4)); update(); } });
  });

  function drawPhaseLine(g: Graphics, c: Palette) {
    const v = g.view;
    const fy = (y: number) => F(0, y);
    const roots = findRoots(fy, v.y0, v.y1, 600);
    const xL = v.x0 + (v.x1 - v.x0) * 0.025;
    // arrows on the phase line at the left edge
    const n = 16;
    for (let i = 0; i < n; i++) {
      const y = v.y0 + ((i + 0.5) / n) * (v.y1 - v.y0), s = fy(y);
      if (!Number.isFinite(s) || Math.abs(s) < 1e-9) continue;
      const d = (v.y1 - v.y0) * 0.018 * Math.sign(s);
      g.arrow([xL, y - d], [xL, y + d], { color: c.muted, width: 1.6 });
    }
    g.line([xL, v.y0], [xL, v.y1], { color: c.muted, width: 1, alpha: 0.5 });
    for (const r of roots) {
      const d = dfdy ? dfdy([0, r]) : (fy(r + 1e-6) - fy(r - 1e-6)) / 2e-6;
      const col = d < 0 ? c.green : d > 0 ? c.red : c.violet;
      g.line([v.x0, r], [v.x1, r], { color: col, width: 1.8, dash: [8, 5], alpha: 0.9 });
      g.point([xL, r], 5, { fill: d < 0 ? col : c.bg, color: col, width: 2 });
      label(g, [xL, r], `y* = ${fmt(r, 3)} ${d < 0 ? 'stable' : d > 0 ? 'unstable' : 'semi-stable'}`, col, { dx: 10, dy: -9, size: 11 });
    }
  }

  function update() {
    try {
      const { node, indep: ind } = parseRhs(ctx.input || 't - y^2');
      indep = ind;
      f = compile(node, [indep, 'y'], { a: ctx.params.a });
      autonomous = !freeSymbols(node).has(indep);
      try { const d = derivative(node, 'y'); dfdy = compile(d, [indep, 'y'], { a: ctx.params.a }); dTeX = toTeX(d); } catch { dfdy = null; dTeX = ''; }
      lastGood = ctx.input + '|' + ctx.params.a;
      ctx.warn('');
    } catch (e) {
      ctx.warn(`Could not read the equation: ${(e as Error).message}`);
    }
    plot.opts.xLabel = indep;
    cacheKey = '';
    recompute();
    const { t0, y0 } = ctx.params;
    const s0 = F(t0, y0), d0 = dfdy ? dfdy([t0, y0]) : NaN;
    const rows: Readout[] = [
      { label: 'slope f(t₀, y₀)', value: fmt(s0) },
      { label: '∂f/∂y', value: dTeX || '—', tex: !!dTeX },
      { label: '∂f/∂y at (t₀, y₀)', value: fmt(d0), tone: Number.isFinite(d0) ? undefined : 'bad' },
      { label: 'uniqueness (Picard–Lindelöf)', value: Number.isFinite(s0) && Number.isFinite(d0) ? 'guaranteed near (t₀, y₀)' : 'not guaranteed: ∂f/∂y is not finite', tone: Number.isFinite(s0) && Number.isFinite(d0) ? 'good' : 'warn' },
    ];
    const v = plot.view;
    const fwd = main.find((tr) => tr.t[tr.t.length - 1] > t0), bwd = main.find((tr) => tr.t[tr.t.length - 1] < t0);
    const endOf = (tr: Trajectory | undefined, edge: number) => (!tr ? edge : tr.t[tr.t.length - 1]);
    const left = endOf(bwd, v.x0), right = endOf(fwd, v.x1);
    const blewL = bwd && !bwd.ok, blewR = fwd && !fwd.ok;
    rows.push({ label: 'solution exists on (in view)', value: `${blewL ? '(' + fmt(left, 4) : '[' + fmt(left, 3)}, ${blewR ? fmt(right, 4) + ')' : fmt(right, 3) + ']'}`, tone: blewL || blewR ? 'warn' : undefined });
    if (blewL || blewR) rows.push({ label: 'blow-up', value: `|y| → ∞ near ${indep} = ${[blewL ? fmt(left, 4) : '', blewR ? fmt(right, 4) : ''].filter(Boolean).join(' and ')} (numerical)`, tone: 'warn' });
    if (fwd?.ok) rows.push({ label: `y at ${indep} = ${fmt(right, 3)}`, value: fmt(fwd.y[fwd.y.length - 1][0]) });
    if (autonomous) {
      const roots = findRoots((y) => F(0, y), v.y0, v.y1, 600);
      rows.push({ label: 'equilibria in view', value: roots.length ? roots.map((r) => fmt(r, 4)).join(', ') : 'none' });
    }
    ctx.setReadouts(rows);
    ctx.setNote(autonomous
      ? `Autonomous equation: the field repeats in every column, so every solution is a horizontal shift of another. Equilibria (dashed) are **stable** in green ($f'(y^*) < 0$) and **unstable** in red. Click to pin more solutions.`
      : `Each segment has the slope $f(${indep}, y)$ prescribes there; the blue curve is the solution through $(${indep}_0, y_0)$ and the orange segment its tangent as it moves. Click to pin more solutions.`);
    draw();
  }

  const seed = (t?: number): Tracer => { const v = plot.view; return { t: t ?? v.x0 + Math.random() * (v.x1 - v.x0), y: v.y0 + Math.random() * (v.y1 - v.y0), life: 1 + Math.random() * 4 }; };
  for (let i = 0; i < 70; i++) tracers.push(seed());

  return {
    update,
    tick(dt) {
      const v = plot.view, w = v.x1 - v.x0;
      markerS = (markerS + dt / 8) % 1;
      if (ctx.toggles.flow) {
        const h = (dt * w) / 7;     // cross the window in about 7 s
        for (let i = 0; i < tracers.length; i++) {
          const p = tracers[i];
          const y = rk4Step(rhs, p.t, [p.y], h)[0];
          p.t += h; p.y = y; p.life -= dt;
          if (p.life < 0 || !Number.isFinite(y) || p.t > v.x1 || y < v.y0 - 0.2 * w || y > v.y1 + 0.2 * w) tracers[i] = seed(v.x0 + Math.random() * w * 0.3);
        }
      }
      plot.render();
    },
    reset() { markerS = 0; },
    csv() {
      const rows: number[][] = [];
      const b = main[1], fw = main[0];
      if (b) for (let k = b.t.length - 1; k > 0; k--) rows.push([b.t[k], b.y[k][0]]);
      if (fw) for (let k = 0; k < fw.t.length; k++) rows.push([fw.t[k], fw.y[k][0]]);
      return csvOf([indep, 'y (numerical, DP45)'], rows);
    },
    dispose() { plot.onClick = undefined; },
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
