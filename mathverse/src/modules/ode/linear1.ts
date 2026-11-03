// Linear first-order equations y′ + p(t) y = q(t): the integrating factor,
// the exact solution, and a fixed-step numerical solution compared with it.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { solveFixed, Trajectory } from '../../core/numeric/ode';
import { integrate } from '../../core/numeric/quad';
import { linear1, Linear1 } from '../../core/numeric/dynamics';
import { fmt, tx, pal, csvOf, P, label, fitView, range, changed } from './common';

const KINDS: [Linear1, string, (k: number, A: number, w: number) => string][] = [
  ['const', 'q = A (charging, cooling)', (k, A) => `y' + ${tx(k)}\\,y = ${tx(A)}`],
  ['exp', 'q = A e^(−ωt) (decaying input)', (k, A, w) => `y' + ${tx(k)}\\,y = ${tx(A)}\\,e^{-${tx(w)}t}`],
  ['sin', 'q = A sin ωt (AC input)', (k, A, w) => `y' + ${tx(k)}\\,y = ${tx(A)}\\sin ${tx(w)}t`],
  ['ramp', 'q = A t (ramp input)', (k, A) => `y' + ${tx(k)}\\,y = ${tx(A)}\\,t`],
  ['gauss', 'p = 2kt, q = 2kAt (variable p)', (k, A) => `y' + ${tx(2 * k)}\\,t\\,y = ${tx(2 * k * A)}\\,t`],
];

/** stability limit of z = h·λ on the negative real axis */
const LIMIT = { euler: 2, heun: 2, rk4: 2.785 } as const;
const ORDER = { euler: 1, heun: 2, rk4: 4 } as const;

export const linear1Demo: DemoDef = {
  id: 'ode.linear1', module: 'ode', title: 'Linear first-order equations: the integrating factor',
  topic: 'Linear first-order ODEs · integrating factor · exact versus numerical',
  summary: 'Multiplying y′ + p y = q by μ = exp(∫p dt) turns the left side into the derivative of μy, so one integration solves it. The exact solution is drawn against a fixed-step numerical one, with the error.',
  tex: "y' + p(t)\\,y = q(t),\\quad \\mu = e^{\\int p\\,dt}\\;\\Rightarrow\\; (\\mu y)' = \\mu q",
  view: 'split2d',
  params: [
    { key: 'k', label: 'k (p = k, or 2kt)', value: 1, min: -1, max: 4, step: 0.01 },
    { key: 'A', label: 'input strength A', value: 1, min: -3, max: 3, step: 0.01 },
    { key: 'w', label: 'ω (input frequency / decay)', value: 2, min: 0, max: 6, step: 0.01 },
    { key: 'y0', label: 'initial value y(0)', value: 2, min: -3, max: 3, step: 0.01 },
    { key: 'h', label: 'step size h', value: 0.25, min: 0.01, max: 1.2, step: 0.01 },
    { key: 'T', label: 'time span T', value: 8, min: 1, max: 20, step: 0.1 },
  ],
  choices: [
    { key: 'q', label: 'Equation', value: 'sin', options: KINDS.map(([k, l]) => [k, l]) },
    { key: 'method', label: 'Numerical method', value: 'euler', options: [['euler', 'Euler (order 1)'], ['heun', 'Heun (order 2)'], ['rk4', 'Runge–Kutta 4 (order 4)']] },
    { key: 'panel', label: 'Right panel', value: 'error', options: [['error', 'Error versus t (log scale)'], ['mu', 'μy versus ∫μq (the key identity)']] },
  ],
  toggles: [{ key: 'input', label: 'Show the input q(t)', value: true }],
  experiments: [
    'Halve h with Euler: the error curve on the right drops by log₁₀2 ≈ 0.3. With RK4 it drops by 4·0.3 = 1.2.',
    'Choose “q = A sin ωt” (an RC circuit on AC): after the transient e^{−kt} dies, every solution follows the same sinusoid, lagging the input.',
    'Push h·k above 2 with Euler: the numerical solution oscillates and explodes while the exact one decays — numerical instability, not physics.',
    'Switch the right panel to μy versus ∫μq: the two coincide — that identity is the whole method.',
    'Make k negative: the homogeneous part e^{−kt} now grows and dominates.',
  ],
  connections: ['ode.separable', 'ode.slopefield', 'ode.euler', 'ode.nonhomog'],
  accuracy: 'The blue curve is the exact solution from the integrating factor (closed form). The gold polyline is the fixed-step method you chose, so its error is real truncation error, shown on the right. In the μ panel, ∫μq is computed by adaptive Gauss–Kronrod quadrature (tolerance 10⁻¹⁰).',
  create: (ctx) => linear1Inst(ctx),
};

function linear1Inst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, p2 = ctx.plot2!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  const reframe = changed(), reframe2 = changed();
  let tr: Trajectory = { t: [], y: [], ok: true, steps: 0 };
  let exact: (t: number) => number = () => 0;

  function update() {
    const { k, A, w, y0, T } = ctx.params;
    const kind = (ctx.choices.q ?? 'sin') as Linear1;
    const method = (ctx.choices.method ?? 'euler') as 'euler' | 'heun' | 'rk4';
    const L = linear1(kind, k, A, w, y0);
    exact = L.y;
    const n = Math.max(1, Math.round(T / ctx.params.h)), h = T / n;
    const rhs = (t: number, y: number[]) => [L.q(t) - L.p(t) * y[0]];
    tr = solveFixed(rhs, [y0], 0, T, n, method);
    const c = pal(ctx);
    const ex = Array.from({ length: 501 }, (_, i) => { const t = (T * i) / 500; return [t, L.y(t)] as P; });
    const [lo, hi] = range([...ex.map((p) => p[1]), ...(ctx.toggles.input ? ex.map((p) => L.q(p[0])) : [])], 1e6);
    if (reframe(`${kind}|${T}`)) plot.setView(fitView([0, T], [Math.min(lo, -0.5), Math.max(hi, 0.5)], 0.08));
    const num = tr.t.map((t, i) => [t, tr.y[i][0]] as P);
    plot.setDraw((g) => {
      if (ctx.toggles.input) { g.fn(L.q, { color: c.violet, width: 1.6, dash: [6, 5] }, [0, T]); label(g, [T * 0.98, L.q(T * 0.98)], 'q(t)', c.violet, { align: 'right', dy: -12 }); }
      g.path(ex, { color: c.blue, width: 3 });
      g.path(num, { color: c.gold, width: 1.6 });
      if (num.length <= 400) for (const p of num) g.point(p, 2.8, { fill: c.gold });
      g.handle({ id: 'y0', at: [0, y0], color: c.gold, label: 'y(0)', constrain: ([, y]) => [0, y], onDrag: ([, y]) => { ctx.setParam('y0', Math.max(-3, Math.min(3, y))); update(); } });
    });
    // errors at the grid points, for all three methods
    const errs = (['euler', 'heun', 'rk4'] as const).map((m) => {
      const s = m === method ? tr : solveFixed(rhs, [y0], 0, T, n, m);
      return { m, pts: s.t.slice(1).map((t, i) => [t, Math.log10(Math.abs(s.y[i + 1][0] - L.y(t)) + 1e-17)] as P), end: Math.abs(s.y[s.y.length - 1][0] - L.y(s.t[s.t.length - 1])), max: Math.max(...s.t.map((t, i) => Math.abs(s.y[i][0] - L.y(t)))), ok: s.ok };
    });
    const mine = errs.find((e) => e.m === method)!;
    p2.opts.xLabel = 't';
    if (ctx.choices.panel === 'mu') {
      p2.opts.yLabel = 'μ(t) y(t)';
      // stop where μ becomes astronomically large
      let tEnd = T; for (let i = 0; i <= 400; i++) { const t = (T * i) / 400; if (Math.abs(L.mu(t) * L.y(t)) > 1e9) { tEnd = t; break; } }
      const muy = Array.from({ length: 301 }, (_, i) => { const t = (tEnd * i) / 300; return [t, L.mu(t) * L.y(t)] as P; });
      const quadPts = Array.from({ length: 31 }, (_, i) => { const t = (tEnd * i) / 30; return [t, y0 + integrate((s) => L.mu(s) * L.q(s), 0, t).value] as P; });
      const [a, b] = range(muy.map((p) => p[1]));
      if (reframe2(`mu|${kind}|${T}|${k}|${A}|${w}|${y0}`)) p2.setView(fitView([0, tEnd], [a, b], 0.08));
      p2.setDraw((g) => {
        g.path(muy, { color: c.blue, width: 3 });
        for (const p of quadPts) g.point(p, 3.5, { fill: c.gold });
        label(g, [g.view.x0 + (g.view.x1 - g.view.x0) * 0.04, g.view.y1 - (g.view.y1 - g.view.y0) * 0.06], 'blue: μ(t)·y(t)     gold dots: y(0) + ∫₀ᵗ μ q ds (quadrature)', c.ink);
      });
    } else {
      p2.opts.yLabel = 'log₁₀ |error|';
      if (reframe2(`err|${T}`)) p2.setView({ x0: -T * 0.04, x1: T * 1.04, y0: -16.5, y1: 1.5 });
      const cols = { euler: c.red, heun: c.green, rk4: c.cyan };
      p2.setDraw((g) => {
        for (const e of errs) g.path(e.pts, { color: cols[e.m], width: e.m === method ? 2.6 : 1.2, alpha: e.m === method ? 1 : 0.55 });
        const x = g.view.x0 + (g.view.x1 - g.view.x0) * 0.06;
        (['euler', 'heun', 'rk4'] as const).forEach((m, i) => label(g, [x, g.view.y0 + (g.view.y1 - g.view.y0) * (0.16 - 0.05 * i)], `${m === 'rk4' ? 'RK4' : m[0].toUpperCase() + m.slice(1)}${m === method ? '  (shown left)' : ''}`, cols[m], { bold: m === method }));
        label(g, [g.view.x1, -15.7], 'machine precision ≈ 10⁻¹⁶', c.muted, { align: 'right', size: 11 });
      });
    }
    const pmax = kind === 'gauss' ? 2 * k * T : k;
    const z = h * pmax;
    ctx.warn(z > LIMIT[method] ? `h·p = ${fmt(z, 3)} exceeds the stability limit ${LIMIT[method]} of ${method === 'rk4' ? 'RK4' : method}: the numerical solution oscillates and grows although the exact one decays. Make h smaller.` : !tr.ok ? tr.warning ?? '' : '');
    ctx.setReadouts([
      { label: 'equation', value: KINDS.find((x) => x[0] === kind)![2](k, A, w), tex: true },
      { label: 'integrating factor', value: L.muTeX, tex: true },
      { label: 'exact solution', value: L.tex, tex: true },
      { label: 'steps n, actual h', value: `${n},  h = ${fmt(h)}` },
      { label: `error at t = ${fmt(T, 3)} (${method})`, value: fmt(mine.end, 3), tone: mine.end < 1e-6 ? 'good' : mine.end > 0.1 ? 'warn' : undefined },
      { label: 'largest error on [0, T]', value: fmt(mine.max, 3) },
      { label: `error / h^${ORDER[method]} (≈ constant as h → 0)`, value: fmt(mine.max / h ** ORDER[method], 3), tone: 'muted' },
    ]);
    const muT = L.muTeX.replace('\\mu = ', '');
    ctx.setSteps([
      { title: 'Standard form', tex: KINDS.find((x) => x[0] === kind)![2](k, A, w), detail: kind === 'gauss' ? `Here $p(t) = ${tx(2 * k)}t$ and $q(t) = ${tx(2 * k * A)}t$.` : `Here $p = ${tx(k)}$ is constant.` },
      { title: 'Integrating factor', tex: `\\mu(t) = e^{\\int p\\,dt} = ${muT}` },
      { title: 'Multiply through: the left side is a product rule in reverse', tex: `\\mu y' + \\mu p\\,y = (\\mu y)' = \\mu\\,q` },
      { title: 'Integrate from 0 to t', tex: `\\mu(t)\\,y(t) - ${tx(y0)} = \\int_0^t \\mu(s)\\,q(s)\\,ds` },
      { title: 'Divide by μ', tex: L.tex, detail: 'The term multiplying the exponential decay is the transient (it remembers y(0)); the rest is the response to the input.' },
    ]);
    ctx.setNote(kind === 'sin'
      ? `**An RC circuit on AC.** With $k = 1/RC$ and $q = V_{in}(t)/RC$, $y$ is the capacitor voltage. After the transient $e^{-kt}$ dies, the response is a sinusoid of amplitude $A/\\sqrt{k^2+\\omega^2} = ${tx(Math.abs(A) / Math.hypot(k, w))}$, lagging by $\\arctan(\\omega/k) = ${tx(Math.atan2(w, k))}$ rad.`
      : kind === 'const' ? `**Charging and cooling.** $y$ relaxes to $A/k$ with time constant $1/k$: a capacitor charging to its supply, a cup reaching room temperature, a falling body reaching terminal velocity $v' + (c/m)v = g$.`
        : `The exact solution (blue) and the ${method === 'rk4' ? 'RK4' : method} approximation with step $h = ${tx(h)}$ (gold). Drag $y(0)$ on the left.`);
  }

  return {
    update,
    csv() { return csvOf(['t', 'y numerical', 'y exact', 'error'], tr.t.map((t, i) => [t, tr.y[i][0], exact(t), tr.y[i][0] - exact(t)])); },
    dispose() {},
  };
}
