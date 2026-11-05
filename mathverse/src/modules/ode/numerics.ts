// Numerical methods: Euler, Heun and RK4 against exact solutions, with the
// global error against the step size on a log–log plot (orders 1, 2, 4); and
// adaptive step-size control on a Kepler orbit.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveFixed, solveAdaptive, sample, Trajectory, Rhs } from '../../core/numeric/ode';
import { fitOrder } from '../../core/numeric/dynamics';
import { fmt, pal, csvOf, P, label, changed, loopTime, thin } from './common';

type Method = 'euler' | 'heun' | 'rk4';
const METHODS: Method[] = ['euler', 'heun', 'rk4'];
const NAME: Record<Method, string> = { euler: 'Euler', heun: 'Heun (RK2)', rk4: 'RK4' };
const ORDER: Record<Method, number> = { euler: 1, heun: 2, rk4: 4 };
const EVALS: Record<Method, number> = { euler: 1, heun: 2, rk4: 4 };

interface Problem { name: string; f: Rhs; y0: number[]; T: number; exact: (t: number) => number; tex: string; lambda?: number; note: string }

const PROBLEMS: Record<string, Problem> = {
  exp: { name: "y′ = y (growth)", f: (_t, y) => [y[0]], y0: [1], T: 2, exact: (t) => Math.exp(t), tex: "y' = y,\\; y(0) = 1,\\; y = e^t", note: 'The simplest test: Euler’s $y_{n+1} = (1 + h)\\,y_n$ gives $(1 + h)^{T/h} \\to e^T$ as $h \\to 0$ — the limit that defines $e$.' },
  cos: { name: "y′ = y cos t", f: (t, y) => [y[0] * Math.cos(t)], y0: [1], T: 6, exact: (t) => Math.exp(Math.sin(t)), tex: "y' = y\\cos t,\\; y = e^{\\sin t}", note: 'A time-dependent equation with a smooth exact solution: every method shows its textbook order cleanly.' },
  logistic: { name: "y′ = y(1 − y) (logistic)", f: (_t, y) => [y[0] * (1 - y[0])], y0: [0.1], T: 8, exact: (t) => 1 / (1 + 9 * Math.exp(-t)), tex: "y' = y(1 - y),\\; y = \\frac{1}{1 + 9e^{-t}}", note: 'A nonlinear equation: the orders are the same, because they come from Taylor expansion, not linearity.' },
  osc: { name: "x″ = −x (oscillator)", f: (_t, y) => [y[1], -y[0]], y0: [1, 0], T: 4 * Math.PI, exact: (t) => Math.cos(t), tex: "x'' = -x,\\; x = \\cos t", note: 'Euler spirals outward: each step multiplies the energy by exactly 1 + h², so it grows like $e^{hT}$. RK4 loses a tiny amount of energy per step instead. Neither conserves it exactly — symplectic methods do.' },
  stiff: { name: "y′ = −50(y − cos t) (stiff)", f: (t, y) => [-50 * (y[0] - Math.cos(t))], y0: [0], T: 3, exact: (t) => (2500 * Math.cos(t) + 50 * Math.sin(t)) / 2501 - (2500 / 2501) * Math.exp(-50 * t), tex: "y' = -50(y - \\cos t)", lambda: -50, note: 'Stiff: the solution is smooth after a fast transient, but explicit methods are unstable unless |1 + hλ + …| ≤ 1 with λ = −50: Euler needs h < 0.04, RK4 h < 0.0557. Above that the error explodes, however smooth the solution. Implicit methods fix this.' },
};

const LIMIT: Record<Method, number> = { euler: 2, heun: 2, rk4: 2.785 };

export const euler: DemoDef = {
  id: 'ode.euler', module: 'ode', title: 'Euler versus Runge–Kutta: error and order',
  topic: 'Numerical methods · Euler · Heun · Runge–Kutta 4 · global error · order of convergence · stability',
  summary: 'Each method steps along slopes; how many slopes per step it samples decides how fast its error falls as h shrinks: like h for Euler, h² for Heun, h⁴ for RK4. The log–log plot makes the order a slope.',
  tex: "y_{n+1} = y_n + h\\,\\Phi(t_n, y_n; h),\\qquad |y_N - y(T)| \\approx C h^p",
  view: 'split2d',
  params: [{ key: 'logh', label: 'log₁₀ of the step size h', value: -0.7, min: -3, max: 0, step: 0.01 }],
  choices: [{ key: 'prob', label: 'Test problem', value: 'cos', options: Object.entries(PROBLEMS).map(([k, p]) => [k, p.name]) }],
  toggles: [{ key: 'euler', label: 'Euler (order 1)', value: true }, { key: 'heun', label: 'Heun (order 2)', value: true }, { key: 'rk4', label: 'RK4 (order 4)', value: true }],
  experiments: [
    'Drag the step size on the right: on the log–log plot each method moves along a straight line of slope 1, 2 or 4.',
    'Divide h by 10: Euler’s error falls 10×, Heun’s 100×, RK4’s 10 000×.',
    'Push RK4 to h = 10⁻³: the error stops falling near 10⁻¹⁴ and starts to rise — round-off, now larger than truncation error.',
    'Choose the oscillator: Euler’s solution grows in amplitude every cycle (energy pumped in by the method).',
    'Choose the stiff problem and increase h past 0.04: Euler explodes even though the true solution is perfectly calm.',
  ],
  connections: ['ode.adaptive', 'ode.linear1', 'ode.slopefield'],
  accuracy: 'The exact solutions are closed forms, so the errors shown are the true global errors at t = T. Each point on the right is a separate fixed-step run (h adjusted so that T/h is a whole number of steps). The fitted orders are least-squares slopes over h ≤ 0.1 where 10⁻¹³ < error < 10⁻¹ (the asymptotic range, away from round-off and from instability).',
  tutorial: [
    { text: '**Euler’s method** follows the tangent: $y_{n+1} = y_n + h f(t_n, y_n)$. Each step makes a local error of order $h^2$ (the Taylor term it ignores); over $T/h$ steps these add up to a **global error of order $h$**.', task: 'Show only Euler and drag the step size: watch the error point slide along a line of slope 1.', set: { params: { logh: -0.7 }, choices: { prob: 'cos' }, toggles: { euler: true, heun: false, rk4: false } }, done: (c) => c.params.logh < -1.5 },
    { text: '**Heun’s method** (improved Euler, RK2) takes an Euler step to predict, then averages the slopes at both ends: $y_{n+1} = y_n + \\tfrac h2[f(t_n, y_n) + f(t_{n+1}, y_n + hf_n)]$. The averaging cancels the $h^2$ term: global error $O(h^2)$.', task: 'Turn Heun on and compare slopes.', set: { toggles: { heun: false } }, done: (c) => c.toggles.heun },
    { text: '**Classical RK4** samples four slopes per step — at the start, twice at the middle, at the end — and combines them with weights $\\tfrac16, \\tfrac13, \\tfrac13, \\tfrac16$ (Simpson’s rule!). It matches Taylor to $h^4$: global error $O(h^4)$. Four evaluations per step is a bargain: to gain a factor 10⁴ in accuracy Euler would need 10⁴ times more steps.', task: 'Turn RK4 on.', set: { toggles: { rk4: false } }, done: (c) => c.toggles.rk4 },
    { text: 'At very small $h$ RK4’s error stops falling and rises again: each step adds round-off of about $10^{-16}|y|$, and there are $T/h$ steps. The best achievable accuracy balances truncation ($h^4$) against round-off ($1/h$).', task: 'Drag h down to 10⁻³ and find RK4’s floor.', done: (c) => c.params.logh < -2.6 },
    { text: 'Accuracy is not stability. On $y\' = -50(y - \\cos t)$ Euler multiplies errors by $1 - 50h$ each step: for $h > 0.04$ that is below $-1$, and they grow explosively. Such **stiff** problems need implicit methods (or tiny steps).', task: 'Choose the stiff problem and push h above 0.04.', set: { choices: { prob: 'stiff' }, params: { logh: -2 }, toggles: { euler: true, heun: true, rk4: true } }, done: (c) => c.choices.prob === 'stiff' && c.params.logh > Math.log10(0.04) },
  ],
  create: (ctx) => eulerInst(ctx),
};

interface Study { hs: number[]; err: Record<Method, number[]>; order: Record<Method, number> }

function eulerInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, ll = ctx.plot2!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  ll.opts.xLabel = 'log₁₀ h'; ll.opts.yLabel = 'log₁₀ error at T';
  ll.setView({ x0: -3.25, x1: 1.0, y0: -17, y1: 2.5 });
  const reframe = changed();
  let study: Study | null = null, studyKey = '';
  let runs: Partial<Record<Method, Trajectory>> = {};
  let pr = PROBLEMS.cos;

  function convergence(p: Problem): Study {
    const hs: number[] = [], err = { euler: [], heun: [], rk4: [] } as Record<Method, number[]>;
    for (let i = 0; i <= 24; i++) {
      const n = Math.max(1, Math.round(p.T / Math.pow(10, -3 + (3 * i) / 24)));
      const h = p.T / n;
      hs.push(h);
      for (const m of METHODS) {
        const tr = solveFixed(p.f, p.y0, 0, p.T, n, m);
        const e = tr.ok ? Math.abs(tr.y[tr.y.length - 1][0] - p.exact(p.T)) : Infinity;
        err[m].push(Number.isFinite(e) ? e : Infinity);
      }
    }
    const order = {} as Record<Method, number>;
    for (const m of METHODS) {
      const sel = hs.map((h, i) => [h, err[m][i]]).filter(([h, e]) => e > 1e-13 && e < 1e-1 && h <= 0.1 && (!p.lambda || h * Math.abs(p.lambda) < LIMIT[m] * 0.8));
      order[m] = sel.length >= 3 ? fitOrder(sel.map((x) => x[0]), sel.map((x) => x[1])) : NaN;
    }
    return { hs, err, order };
  }

  function update() {
    const key = ctx.choices.prob ?? 'cos';
    pr = PROBLEMS[key] ?? PROBLEMS.cos;
    if (key !== studyKey) { study = convergence(pr); studyKey = key; }
    const S = study!;
    const n = Math.max(1, Math.round(pr.T / Math.pow(10, ctx.params.logh))), h = pr.T / n;
    runs = {};
    for (const m of METHODS) if (ctx.toggles[m]) runs[m] = solveFixed(pr.f, pr.y0, 0, pr.T, n, m);
    const C = pal(ctx);
    const col: Record<Method, string> = { euler: C.red, heun: C.green, rk4: C.cyan };
    const ex = Array.from({ length: 401 }, (_, i) => { const t = (pr.T * i) / 400; return [t, pr.exact(t)] as P; });
    const ys = ex.map((p) => p[1]);
    const lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.35 + 0.2;
    if (reframe(key)) plot.setView({ x0: -pr.T * 0.03, x1: pr.T * 1.03, y0: lo - pad, y1: hi + pad });
    plot.setDraw((g) => {
      g.path(ex, { color: C.blue, width: 3.2 });
      for (const m of METHODS) {
        const tr = runs[m];
        if (!tr) continue;
        const pts = tr.t.map((t, i) => [t, tr.y[i][0]] as P);
        g.path(thin(pts, 800), { color: col[m], width: 1.8 });
        if (n <= 120) for (const p of pts) g.point(p, 2.6, { fill: col[m] });
      }
      const x = g.view.x0 + (g.view.x1 - g.view.x0) * 0.78, top = g.view.y1, dy = (g.view.y1 - g.view.y0) * 0.055;
      label(g, [x, top - dy], 'exact', C.blue, { bold: true });
      METHODS.filter((m) => ctx.toggles[m]).forEach((m, i) => label(g, [x, top - dy * (i + 2)], `${NAME[m]}`, col[m], { bold: true }));
    });
    const lh = Math.log10(h);
    ll.setDraw((g) => {
      // a reference line of the expected slope under each method's data
      for (const m of METHODS) {
        if (!ctx.toggles[m]) continue;
        const i = S.hs.findIndex((hh) => Math.log10(hh) >= -1.6);
        const e = S.err[m][i];
        if (!(e > 1e-14 && e < 1)) continue;
        const xa = Math.log10(S.hs[i]), ya = Math.log10(e) - 0.8, p = ORDER[m];
        const xb = Math.max(-3, xa - 9 / p);
        g.line([xb, ya - p * (xa - xb)], [Math.min(0, xa + 0.9), ya + p * (Math.min(0, xa + 0.9) - xa)], { color: col[m], width: 1.1, dash: [5, 5], alpha: 0.55 });
        label(g, [Math.min(0, xa + 0.9), ya + p * (Math.min(0, xa + 0.9) - xa)], `slope ${p}`, col[m], { dx: 6, size: 11 });
      }
      if (pr.lambda) for (const m of METHODS) if (ctx.toggles[m]) { const hl = Math.log10(LIMIT[m] / Math.abs(pr.lambda)); g.line([hl, g.view.y0], [hl, g.view.y1], { color: col[m], width: 1, dash: [2, 4], alpha: 0.7 }); }
      for (const m of METHODS) {
        if (!ctx.toggles[m]) continue;
        const pts = S.hs.map((hh, i) => [Math.log10(hh), Math.log10(Math.max(1e-17, S.err[m][i]))] as P).filter((p) => p[1] < 2.2);
        g.path(pts, { color: col[m], width: 2.2 });
        for (const p of pts) g.point(p, 3, { fill: col[m] });
        const e = runs[m] ? Math.abs(runs[m]!.y[runs[m]!.y.length - 1][0] - pr.exact(pr.T)) : NaN;
        if (Number.isFinite(e)) g.point([lh, Math.max(-17, Math.min(2.2, Math.log10(Math.max(e, 1e-17))))], 6.5, { fill: col[m], color: C.ink, width: 1.5 });
      }
      g.line([lh, g.view.y0], [lh, g.view.y1], { color: C.gold, width: 1.4 });
      g.handle({ id: 'h', at: [lh, g.view.y0 + (g.view.y1 - g.view.y0) * 0.04], color: C.gold, label: `h = ${fmt(h, 3)}`, constrain: ([x]) => [Math.max(-3, Math.min(0, x)), g.view.y0 + (g.view.y1 - g.view.y0) * 0.04], onDrag: ([x]) => { ctx.setParam('logh', Math.max(-3, Math.min(0, x))); update(); } });
    });
    const rows: Readout[] = [{ label: 'problem', value: pr.tex, tex: true }, { label: 'steps n, step h', value: `${n},  h = ${fmt(h, 4)}` }];
    for (const m of METHODS) {
      const tr = runs[m];
      if (!tr) continue;
      const e = tr.ok ? Math.abs(tr.y[tr.y.length - 1][0] - pr.exact(pr.T)) : Infinity;
      rows.push({ label: `${NAME[m]}: error at T, evaluations`, value: `${fmt(e, 3)},  ${n * EVALS[m]}`, tone: e < 1e-8 ? 'good' : e > 1e-2 ? 'bad' : undefined });
    }
    for (const m of METHODS) if (ctx.toggles[m]) rows.push({ label: `${NAME[m]}: fitted order (expected ${ORDER[m]})`, value: Number.isFinite(S.order[m]) ? fmt(S.order[m], 3) : '—', tone: Math.abs(S.order[m] - ORDER[m]) < 0.25 ? 'good' : 'warn' });
    if (key === 'osc' && runs.euler) { const Y = runs.euler.y[runs.euler.y.length - 1]; rows.push({ label: 'Euler energy at T / initial', value: fmt(Y[0] ** 2 + Y[1] ** 2, 5), tone: 'warn' }); }
    if (pr.lambda) rows.push({ label: 'h·λ (λ = −50)', value: `${fmt(h * pr.lambda, 3)}  (Euler stable if |1 + hλ| ≤ 1)`, tone: Math.abs(1 + h * pr.lambda) > 1 ? 'bad' : 'good' });
    ctx.setReadouts(rows);
    const bad = METHODS.filter((m) => ctx.toggles[m] && pr.lambda && h * Math.abs(pr.lambda) > LIMIT[m]);
    ctx.warn(bad.length ? `Numerically unstable: h = ${fmt(h, 3)} is beyond the stability limit of ${bad.map((m) => NAME[m]).join(' and ')} for this stiff equation.` : '');
    ctx.setNote(pr.note);
  }
  return {
    update,
    csv() {
      const rows: number[][] = [];
      const ms = METHODS.filter((m) => runs[m]);
      const ref = runs[ms[0]];
      if (!ref) return '';
      ref.t.forEach((t, i) => rows.push([t, pr.exact(t), ...ms.map((m) => runs[m]!.y[i][0])]));
      const S = study!;
      return csvOf(['t', 'exact', ...ms.map((m) => NAME[m])], rows) + '\n\n' + csvOf(['h', 'error Euler', 'error Heun', 'error RK4'], S.hs.map((h, i) => [h, S.err.euler[i], S.err.heun[i], S.err.rk4[i]]));
    },
    dispose() {},
  };
}

// ── adaptive step size on a Kepler orbit ──────────────────────────────────
/** Exact Kepler motion (GM = 1, a = 1), starting at perihelion at t = 0. */
function kepler(e: number, t: number): [number, number] {
  const M = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 50; i++) { const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); E -= d; if (Math.abs(d) < 1e-15) break; }
  return [Math.cos(E) - e, Math.sqrt(1 - e * e) * Math.sin(E)];
}

export const adaptive: DemoDef = {
  id: 'ode.adaptive', module: 'ode', title: 'Adaptive step size: an orbit',
  topic: 'Numerical methods · step-size control · embedded Runge–Kutta pairs · Kepler orbits',
  summary: 'An adaptive solver estimates its own error every step and shrinks h where the solution changes fast — here, a comet whipping around the Sun — and grows it where nothing happens. For the same work, a fixed step does far worse.',
  tex: "\\mathbf r'' = -\\frac{\\mathbf r}{|\\mathbf r|^3},\\qquad h_{new} = 0.9\\,h\\,(\\text{tol}/\\text{err})^{1/5}",
  view: 'split2d', animated: true,
  params: [
    { key: 'e', label: 'eccentricity e', value: 0.8, min: 0, max: 0.97, step: 0.001 },
    { key: 'ltol', label: 'log₁₀ tolerance', value: -6, min: -12, max: -2, step: 0.1 },
    { key: 'orbits', label: 'number of orbits', value: 2, min: 1, max: 10, step: 1 },
  ],
  toggles: [{ key: 'fixed', label: 'Fixed-step RK4 with the same number of steps', value: true }, { key: 'dots', label: 'Mark every accepted step', value: true }],
  experiments: [
    'Raise the eccentricity to 0.95: the accepted steps (dots) crowd together at perihelion, where the comet is fastest; the step-size plot on the right dips sharply once per orbit.',
    'With the same number of steps spaced evenly, fixed-step RK4 (red) misses perihelion badly and the orbit precesses or flies off.',
    'Tighten the tolerance by 10: the adaptive solver takes about 10^(1/5) ≈ 1.6 times more steps, as a 5th-order error estimate predicts.',
    'Kepler’s second law (equal areas in equal times) is why the steps must shrink near the Sun.',
  ],
  connections: ['ode.euler', 'ode.pendulum', 'ode.lorenz'],
  accuracy: 'The exact orbit comes from Kepler’s equation M = E − e sin E solved by Newton’s method to 10⁻¹⁵. The adaptive solver is Dormand–Prince 5(4) with rtol = atol = the tolerance shown (no maximum step besides one tenth of an orbit). Errors are true errors against Kepler’s solution.',
  create: (ctx) => adaptInst(ctx),
};

function adaptInst(ctx: DemoCtx): DemoInstance {
  const op = ctx.plot!, hp = ctx.plot2!;
  op.opts.equal = true; op.opts.xLabel = 'x'; op.opts.yLabel = 'y';
  hp.opts.xLabel = 't'; hp.opts.yLabel = 'log₁₀ step size h';
  let ad: Trajectory = { t: [0], y: [[1, 0, 0, 1]], ok: true, steps: 0 }, fx: Trajectory | null = null;
  let tl = 0;

  function update() {
    const { e, ltol, orbits } = ctx.params;
    const tol = Math.pow(10, ltol), T = 2 * Math.PI * orbits;
    const f: Rhs = (_t, Y) => { const r3 = Math.pow(Y[0] * Y[0] + Y[1] * Y[1], 1.5); return [Y[2], Y[3], -Y[0] / r3, -Y[1] / r3]; };
    const y0 = [1 - e, 0, 0, Math.sqrt((1 + e) / (1 - e))];
    ad = solveAdaptive(f, y0, 0, T, { rtol: tol, atol: tol, maxStep: (2 * Math.PI) / 10, maxSteps: 200000 });
    const nSteps = ad.t.length - 1;
    fx = ctx.toggles.fixed ? solveFixed(f, y0, 0, T, nSteps, 'rk4') : null;
    const C = pal(ctx);
    const exEnd = kepler(e, T);
    const errA = Math.hypot(ad.y[nSteps][0] - exEnd[0], ad.y[nSteps][1] - exEnd[1]);
    const errF = fx ? (fx.ok ? Math.hypot(fx.y[fx.y.length - 1][0] - exEnd[0], fx.y[fx.y.length - 1][1] - exEnd[1]) : Infinity) : NaN;
    const energy = (Y: number[]) => 0.5 * (Y[2] ** 2 + Y[3] ** 2) - 1 / Math.hypot(Y[0], Y[1]);
    const E0 = energy(y0), dEA = Math.abs(energy(ad.y[nSteps]) - E0), dEF = fx && fx.ok ? Math.abs(energy(fx.y[fx.y.length - 1]) - E0) : NaN;
    op.setView({ x0: -2.2, x1: 0.6, y0: -1.1, y1: 1.1 });
    const ell = Array.from({ length: 361 }, (_, i) => { const E = (2 * Math.PI * i) / 360; return [Math.cos(E) - e, Math.sqrt(1 - e * e) * Math.sin(E)] as P; });
    const adPts = ad.y.map((Y) => [Y[0], Y[1]] as P);
    const fxPts = fx ? thin(fx.y.map((Y) => [Y[0], Y[1]] as P).filter((p) => Math.abs(p[0]) < 10 && Math.abs(p[1]) < 10), 1500) : [];
    op.setDraw((g) => {
      g.path(ell, { color: C.faint, width: 6 });
      if (fxPts.length) g.path(fxPts, { color: C.red, width: 1.6 });
      g.path(thin(adPts, 1500), { color: C.blue, width: 1.8 });
      if (ctx.toggles.dots && adPts.length < 3000) for (const p of adPts) g.point(p, 2.4, { fill: C.gold });
      g.point([0, 0], 9, { fill: C.gold });
      label(g, [0, 0], 'Sun', C.gold, { dx: 12, dy: -10 });
      const ex = kepler(e, tl), nu = sample(ad, tl);
      g.point(ex, 6, { fill: C.ink });
      g.point([nu[0], nu[1]], 4, { fill: C.blue });
      label(g, [g.view.x0 + 0.05, g.view.y1 - 0.08], `faint: exact ellipse   blue: adaptive DP45 (${nSteps} steps)${fx ? '   red: fixed RK4, same steps' : ''}`, C.muted, { size: 11 });
    });
    const hs: P[] = [];
    for (let i = 1; i < ad.t.length; i++) hs.push([ad.t[i - 1], Math.log10(ad.t[i] - ad.t[i - 1])]);
    const lo = Math.min(...hs.map((p) => p[1]), Math.log10(T / Math.max(1, nSteps))) - 0.3, hi = Math.max(...hs.map((p) => p[1])) + 0.3;
    hp.setView({ x0: -T * 0.03, x1: T * 1.02, y0: lo, y1: hi + 0.4 });
    hp.setDraw((g) => {
      g.path(thin(hs, 2000), { color: C.gold, width: 1.6 });
      if (hs.length < 1500) for (const p of hs) g.point(p, 2, { fill: C.gold });
      if (fx) { const hf = Math.log10(T / nSteps); g.line([0, hf], [T, hf], { color: C.red, width: 1.6, dash: [6, 4] }); label(g, [T, hf], 'fixed step', C.red, { align: 'right', dy: -9 }); }
      for (let k = 0; k <= ctx.params.orbits; k++) { g.line([2 * Math.PI * k, g.view.y0], [2 * Math.PI * k, g.view.y1], { color: C.faint, width: 1, dash: [2, 4] }); }
      label(g, [g.view.x0 + T * 0.03, g.view.y1 - 0.15], 'perihelion passages at t = 0, 2π, 4π, … (dotted)', C.muted, { size: 11 });
      g.line([tl, g.view.y0], [tl, g.view.y1], { color: C.muted, width: 1, dash: [4, 4] });
    });
    const rows: Readout[] = [
      { label: 'accepted / rejected steps', value: `${nSteps} / ${ad.rejected ?? 0}` },
      { label: 'smallest / largest step', value: `${fmt(Math.pow(10, Math.min(...hs.map((p) => p[1]))), 3)} / ${fmt(Math.pow(10, Math.max(...hs.map((p) => p[1]))), 3)}` },
      { label: 'perihelion speed / aphelion speed', value: e > 0 ? fmt((1 + e) / (1 - e), 4) : '1' },
      { label: 'adaptive: position error at the end', value: fmt(errA, 3), tone: errA < 1e-3 ? 'good' : 'warn' },
      { label: 'adaptive: energy error', value: fmt(dEA, 3) },
    ];
    if (fx) rows.push({ label: 'fixed RK4 (same steps): position error', value: Number.isFinite(errF) ? fmt(errF, 3) : 'escaped', tone: 'bad' }, { label: 'fixed RK4: energy error', value: Number.isFinite(dEF) ? fmt(dEF, 3) : '—', tone: 'muted' });
    if (fx && Number.isFinite(errF) && errA > 0) rows.push({ label: 'error ratio fixed / adaptive', value: fmt(errF / errA, 3), tone: 'warn' });
    ctx.setReadouts(rows);
    ctx.warn(ad.ok ? '' : ad.warning ?? '');
    ctx.setNote('Each Dormand–Prince step computes two answers, of orders 5 and 4, from the same seven slopes; their difference estimates the error. The step is accepted if that estimate is below the tolerance and the next $h$ is scaled by $0.9(\\text{tol}/\\text{err})^{1/5}$. Near perihelion the comet moves $\\frac{1+e}{1-e}$ times faster than at aphelion (Kepler’s second law), so the steps shrink there.');
  }
  return {
    update,
    tick() { tl = loopTime(ctx.time.t * 1.5, 2 * Math.PI * ctx.params.orbits); op.render(); hp.render(); },
    reset() { tl = 0; },
    csv() { return csvOf(['t', 'x', 'y', 'vx', 'vy', 'step h', 'x exact', 'y exact'], ad.t.map((t, i) => { const k = kepler(ctx.params.e, t); return [t, ...ad.y[i], i < ad.t.length - 1 ? ad.t[i + 1] - t : NaN, k[0], k[1]]; })); },
    dispose() {},
  };
}
