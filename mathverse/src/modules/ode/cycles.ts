// Oscillations made by nonlinearity: Lotka–Volterra predator and prey (a
// conserved quantity, a family of closed orbits) and the van der Pol
// oscillator (one isolated, attracting limit cycle).

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveAdaptive, sample, Trajectory } from '../../core/numeric/ode';
import { fmt, pal, csvOf, P, label, loopTime, changed, seriesOf, thin } from './common';

/** Times of upward crossings of level c by component k (linear interpolation). */
function crossings(tr: Trajectory, k: number, c: number): number[] {
  const out: number[] = [];
  for (let i = 1; i < tr.t.length; i++) {
    const a = tr.y[i - 1][k] - c, b = tr.y[i][k] - c;
    if (a < 0 && b >= 0) out.push(tr.t[i - 1] + (tr.t[i] - tr.t[i - 1]) * (a / (a - b)));
  }
  return out;
}

// ── Lotka–Volterra ────────────────────────────────────────────────────────
export const lotka: DemoDef = {
  id: 'ode.lotka', module: 'ode', title: 'Predator and prey (Lotka–Volterra)',
  topic: 'Systems of ODEs · population models · conserved quantities · closed orbits',
  summary: 'Prey grow, predators eat them and starve without them. The populations cycle forever around an equilibrium because a hidden quantity V is conserved; add a carrying capacity and the cycles spiral in.',
  tex: "x' = \\alpha x - \\beta xy,\\qquad y' = \\delta xy - \\gamma y",
  view: 'split2d', animated: true,
  params: [
    { key: 'alpha', label: 'prey growth α', value: 1, min: 0.1, max: 3, step: 0.01 },
    { key: 'beta', label: 'predation β', value: 0.5, min: 0.05, max: 2, step: 0.01 },
    { key: 'delta', label: 'predator gain δ', value: 0.25, min: 0.05, max: 2, step: 0.01 },
    { key: 'gamma', label: 'predator death γ', value: 1, min: 0.1, max: 3, step: 0.01 },
    { key: 'K', label: 'carrying capacity K (if on)', value: 12, min: 2, max: 40, step: 0.1 },
    { key: 'x0', label: 'prey x(0)', value: 7, min: 0.05, max: 20, step: 0.01 },
    { key: 'y0', label: 'predators y(0)', value: 1, min: 0.05, max: 12, step: 0.01 },
    { key: 'T', label: 'time span T', value: 40, min: 5, max: 150, step: 1 },
  ],
  toggles: [{ key: 'logistic', label: 'Prey carrying capacity (logistic)', value: false }, { key: 'levels', label: 'Level curves of V', value: true }, { key: 'nullclines', label: 'Nullclines', value: true }],
  experiments: [
    'Drag the starting populations: every orbit is closed — a level curve of V. Starting farther from the equilibrium gives wilder swings and a longer period.',
    'Watch the right panel: predator peaks lag prey peaks by about a quarter period.',
    'Start near the equilibrium (γ/δ, α/β): small cycles with period close to 2π/√(αγ), the linearization’s center.',
    'Switch on the carrying capacity: V now decreases along orbits and the cycles spiral into a stable equilibrium.',
    'Raise γ until γ/δ > K (with the carrying capacity on): the predators cannot persist.',
  ],
  connections: ['ode.stability', 'ode.phase', 'ode.separable', 'ode.vanderpol'],
  accuracy: 'Trajectories and time series are numerical (Dormand–Prince 5(4), rtol 10⁻¹⁰); the drift of the conserved V measures their error. The level curves of V are exact (contoured from the formula). The period is measured from the computed solution.',
  create: (ctx) => lotkaInst(ctx),
};

function lotkaInst(ctx: DemoCtx): DemoInstance {
  const pp = ctx.plot!, ts = ctx.plot2!;
  pp.opts.xLabel = 'prey x'; pp.opts.yLabel = 'predators y';
  ts.opts.xLabel = 't'; ts.opts.yLabel = 'population';
  const reframe = changed();
  let tr: Trajectory = { t: [0], y: [[1, 1]], ok: true, steps: 0 };
  let tl = 0;

  function update() {
    const { alpha: a, beta: b, delta: d, gamma: g, K, x0, y0, T } = ctx.params;
    const logi = ctx.toggles.logistic;
    const C = pal(ctx);
    const rhs = (_t: number, Y: number[]) => [a * Y[0] * (logi ? 1 - Y[0] / K : 1) - b * Y[0] * Y[1], d * Y[0] * Y[1] - g * Y[1]];
    tr = solveAdaptive(rhs, [x0, y0], 0, T, { rtol: 1e-10, atol: 1e-12, maxStep: T / 1500 });
    const V = (x: number, y: number) => d * x - g * Math.log(x) + b * y - a * Math.log(y);
    const V0 = V(x0, y0), VN = V(tr.y[tr.y.length - 1][0], tr.y[tr.y.length - 1][1]);
    const ex = g / d, ey = a / b;
    const eqx = ex, eqy = logi ? (a / b) * (1 - ex / K) : ey;
    const xmax = Math.max(...tr.y.map((Y) => Y[0]), ex * 1.5, 1), ymax = Math.max(...tr.y.map((Y) => Y[1]), ey * 1.5, 1);
    if (reframe(`${a}|${b}|${d}|${g}|${logi}|${K}`) || xmax > pp.view.x1 || ymax > pp.view.y1) pp.setView({ x0: -xmax * 0.06, x1: xmax * 1.12, y0: -ymax * 0.06, y1: ymax * 1.12 });
    ts.setView({ x0: -T * 0.03, x1: T * 1.02, y0: -Math.max(xmax, ymax) * 0.05, y1: Math.max(xmax, ymax) * 1.12 });
    const path = thin(tr.y.map((Y) => [Y[0], Y[1]] as P), 700);
    pp.setDraw((gr) => {
      if (ctx.toggles.levels) {
        const Vmin = V(ex, ey);
        for (const dv of [0.08, 0.3, 0.7, 1.3, 2.2, 3.5]) gr.implicit((x, y) => (x > 0 && y > 0 ? V(x, y) - Vmin - dv : NaN), { color: C.faint, width: 1.2 }, 110);
      }
      if (ctx.toggles.nullclines) {
        gr.line([ex, gr.view.y0], [ex, gr.view.y1], { color: C.violet, width: 1.4, dash: [6, 5] });
        if (logi) gr.line([0, a / b], [K, 0], { color: C.green, width: 1.4, dash: [6, 5] }); else gr.line([gr.view.x0, ey], [gr.view.x1, ey], { color: C.green, width: 1.4, dash: [6, 5] });
        label(gr, [ex, gr.view.y1], "y′ = 0", C.violet, { dx: 5, dy: 12, size: 11 });
        label(gr, [gr.view.x1, logi ? Math.max(0, (a / b) * (1 - gr.view.x1 / K)) : ey], "x′ = 0", C.green, { align: 'right', dy: -10, size: 11 });
      }
      gr.path(path, { color: C.gold, width: 2.6 });
      if (eqy > 0) gr.point([eqx, eqy], 6, { fill: C.bg, color: C.ink, width: 2 });
      const s = sample(tr, tl);
      gr.point([s[0], s[1]], 6, { fill: C.orange });
      gr.handle({ id: 'ic', at: [x0, y0], color: C.gold, label: 'start', constrain: ([x, y]) => [Math.max(0.05, x), Math.max(0.05, y)], onDrag: ([x, y]) => { ctx.setParam('x0', Math.min(20, x)); ctx.setParam('y0', Math.min(12, y)); update(); } });
    });
    const xs = thin(tr.t.map((t, i) => [t, tr.y[i][0]] as P), 600), ys = thin(tr.t.map((t, i) => [t, tr.y[i][1]] as P), 600);
    ts.setDraw((gr) => {
      gr.path(xs, { color: C.blue, width: 2.4 });
      gr.path(ys, { color: C.red, width: 2.4 });
      gr.line([tl, gr.view.y0], [tl, gr.view.y1], { color: C.muted, width: 1, dash: [4, 4] });
      const s = sample(tr, tl);
      gr.point([tl, s[0]], 5, { fill: C.blue }); gr.point([tl, s[1]], 5, { fill: C.red });
      label(gr, [gr.view.x0 + (gr.view.x1 - gr.view.x0) * 0.04, gr.view.y1 - (gr.view.y1 - gr.view.y0) * 0.05], 'prey x(t)', C.blue, { bold: true });
      label(gr, [gr.view.x0 + (gr.view.x1 - gr.view.x0) * 0.04, gr.view.y1 - (gr.view.y1 - gr.view.y0) * 0.11], 'predators y(t)', C.red, { bold: true });
    });
    const up = crossings(tr, 0, ex);
    const per = up.length >= 2 ? (up[up.length - 1] - up[0]) / (up.length - 1) : NaN;
    const rows: Readout[] = [
      { label: 'coexistence equilibrium', value: eqy > 0 ? `(${fmt(eqx)}, ${fmt(eqy)})` : 'none — predators die out', tone: eqy > 0 ? undefined : 'warn' },
      { label: 'period (measured)', value: Number.isFinite(per) ? fmt(per) : 'needs a longer T' },
      { label: 'small-cycle period 2π/√(αγ)', value: fmt((2 * Math.PI) / Math.sqrt(a * g)), tone: 'muted' },
      { label: 'prey range', value: `${fmt(Math.min(...tr.y.map((Y) => Y[0])))} … ${fmt(Math.max(...tr.y.map((Y) => Y[0])))}` },
      { label: 'predator range', value: `${fmt(Math.min(...tr.y.map((Y) => Y[1])))} … ${fmt(Math.max(...tr.y.map((Y) => Y[1])))}` },
      logi ? { label: 'V(t = T) − V(0)', value: `${fmt(VN - V0)} (decreases: a Lyapunov function)`, tone: 'good' } : { label: 'drift of V (numerical error)', value: fmt(Math.abs(VN - V0), 2), tone: Math.abs(VN - V0) < 1e-7 ? 'good' : 'warn' },
    ];
    ctx.setReadouts(rows);
    ctx.setNote(logi
      ? 'With a carrying capacity, $\\frac{dV}{dt} = -\\frac{\\alpha\\delta}{K}(x - x^*)^2 \\le 0$ along orbits: the cycles shrink onto the equilibrium.'
      : 'Dividing $dy/dx = \\frac{y(\\delta x - \\gamma)}{x(\\alpha - \\beta y)}$ separates the variables and integrates to the conserved quantity $V = \\delta x - \\gamma\\ln x + \\beta y - \\alpha \\ln y$. Its level curves are the orbits — closed, so the populations cycle forever. (Lynx and hare pelts at the Hudson’s Bay Company are the classic, if imperfect, example.)');
  }
  return {
    update,
    tick() { tl = loopTime(ctx.time.t * 2, ctx.params.T); pp.render(); ts.render(); },
    reset() { tl = 0; },
    csv() { return csvOf(['t', 'prey x', 'predators y'], tr.t.map((t, i) => [t, tr.y[i][0], tr.y[i][1]])); },
    dispose() {},
  };
}

// ── van der Pol ───────────────────────────────────────────────────────────
export const vanderpol: DemoDef = {
  id: 'ode.vanderpol', module: 'ode', title: 'The van der Pol limit cycle',
  topic: 'Nonlinear dynamical systems · limit cycles · self-sustained oscillation · relaxation oscillations',
  summary: 'Negative damping at small amplitude pumps energy in; positive damping at large amplitude takes it out. Every trajectory (except the equilibrium) is drawn onto one isolated closed orbit: a limit cycle.',
  tex: "x'' - \\mu\\,(1 - x^2)\\,x' + x = 0",
  view: 'split2d', animated: true,
  params: [
    { key: 'mu', label: 'nonlinearity μ', value: 1.5, min: 0, max: 8, step: 0.01 },
    { key: 'x0', label: 'x(0)', value: 0.3, min: -4, max: 4, step: 0.01 },
    { key: 'v0', label: "x′(0)", value: 0, min: -10, max: 10, step: 0.01 },
    { key: 'T', label: 'time span T', value: 40, min: 10, max: 150, step: 1 },
  ],
  toggles: [{ key: 'family', label: 'More trajectories (inside and outside)', value: true }, { key: 'cycle', label: 'The limit cycle', value: true }],
  experiments: [
    'Start very close to the origin: the tiny oscillation grows until it reaches the cycle. Start far outside: it shrinks onto the same cycle.',
    'Set μ = 0: a harmonic oscillator, every circle is an orbit — no limit cycle. Any μ > 0 selects one, of amplitude ≈ 2.',
    'Raise μ to 6: relaxation oscillations — slow creeping alternating with fast jumps. The period grows like (3 − 2 ln 2)μ.',
    'Watch the right panel at large μ: a sawtooth-like waveform, the shape of a heartbeat model or a dripping tap.',
  ],
  connections: ['ode.lotka', 'ode.stability', 'ode.spring', 'ode.lorenz'],
  accuracy: 'Numerical (Dormand–Prince 5(4), rtol 10⁻¹⁰). The limit cycle is found by integrating 60 time units and keeping the last full period; period and amplitude are measured from it. The asymptotic formulas 2π(1 + μ²/16) (small μ) and (3 − 2 ln 2)μ (large μ) are shown for comparison and labelled as approximations.',
  create: (ctx) => vdpInst(ctx),
};

function vdpInst(ctx: DemoCtx): DemoInstance {
  const pp = ctx.plot!, ts = ctx.plot2!;
  pp.opts.xLabel = 'x'; pp.opts.yLabel = "x′";
  ts.opts.xLabel = 't'; ts.opts.yLabel = 'x';
  let trs: Trajectory[] = [], main: Trajectory = { t: [0], y: [[0, 0]], ok: true, steps: 0 }, cycle: P[] = [];
  let tl = 0;

  function update() {
    const { mu, x0, v0, T } = ctx.params;
    const C = pal(ctx), S = seriesOf(C);
    const rhs = (_t: number, Y: number[]) => [Y[1], mu * (1 - Y[0] * Y[0]) * Y[1] - Y[0]];
    const o = { rtol: 1e-10, atol: 1e-12, maxStep: 0.02 };
    main = solveAdaptive(rhs, [x0, v0], 0, T, o);
    const starts = ctx.toggles.family ? [[0.05, 0], [-0.1, 0.2], [3.5, 0], [-3, -2], [0, 6], [1.5, -5]] : [];
    trs = starts.map((s) => solveAdaptive(rhs, s, 0, T, o));
    // the limit cycle: integrate, discard the transient, keep the last period
    const long = solveAdaptive(rhs, [2, 0], 0, 60 + 3 * mu, o);
    const up = crossings(long, 0, 0);
    let per = NaN, amp = NaN, vmax = 3;
    cycle = [];
    if (up.length >= 3) {
      const t1 = up[up.length - 1], t0 = up[up.length - 2];
      per = t1 - t0;
      for (let i = 0; i < long.t.length; i++) if (long.t[i] >= t0 && long.t[i] <= t1) cycle.push([long.y[i][0], long.y[i][1]]);
      amp = Math.max(...cycle.map((p) => p[0]));
      vmax = Math.max(...cycle.map((p) => Math.abs(p[1])));
    }
    const trPaths = trs.map((tr) => thin(tr.y.map((Y) => [Y[0], Y[1]] as P), 300));
    const mainPath = thin(main.y.map((Y) => [Y[0], Y[1]] as P), 700);
    cycle = thin(cycle, 300);
    const ym = Math.max(vmax * 1.25, 3.2, Math.abs(v0) * 1.1);
    pp.setView({ x0: -4.2, x1: 4.2, y0: -ym, y1: ym });
    ts.setView({ x0: -T * 0.03, x1: T * 1.02, y0: -Math.max(3, Math.abs(x0) + 0.5), y1: Math.max(3, Math.abs(x0) + 0.5) });
    pp.setDraw((g) => {
      g.field((x, y) => { const r = rhs(0, [x, y]); return [r[0], r[1]]; }, 20, 'viridis');
      g.fn((x) => (Math.abs(1 - x * x) > 1e-9 && mu > 0 ? x / (mu * (1 - x * x)) : NaN), { color: C.faint, width: 1.2, dash: [4, 4] });
      trPaths.forEach((pts, i) => g.path(pts, { color: S[(i + 2) % S.length], width: 1.4, alpha: 0.7 }));
      if (ctx.toggles.cycle && cycle.length) g.path(cycle, { color: C.blue, width: 4, alpha: 0.85 });
      g.path(mainPath, { color: C.gold, width: 2.4 });
      trs.forEach((tr, i) => { const s = sample(tr, tl); g.point([s[0], s[1]], 4.5, { fill: S[(i + 2) % S.length] }); });
      const s = sample(main, tl);
      g.point([s[0], s[1]], 6, { fill: C.orange });
      g.handle({ id: 'ic', at: [x0, v0], color: C.gold, label: 'start', onDrag: ([x, y]) => { ctx.setParam('x0', Math.max(-4, Math.min(4, x))); ctx.setParam('v0', Math.max(-10, Math.min(10, y))); update(); } });
    });
    const xs = thin(main.t.map((t, i) => [t, main.y[i][0]] as P), 700);
    ts.setDraw((g) => {
      g.line([g.view.x0, 2], [g.view.x1, 2], { color: C.faint, width: 1, dash: [3, 4] }); g.line([g.view.x0, -2], [g.view.x1, -2], { color: C.faint, width: 1, dash: [3, 4] });
      g.path(xs, { color: C.gold, width: 2.2 });
      g.point([tl, sample(main, tl)[0]], 5, { fill: C.orange });
      g.line([tl, g.view.y0], [tl, g.view.y1], { color: C.muted, width: 1, dash: [4, 4] });
    });
    const rows: Readout[] = [
      { label: 'limit cycle period (measured)', value: mu === 0 ? 'no limit cycle at μ = 0' : fmt(per, 6) },
      { label: 'amplitude max x on the cycle', value: mu === 0 ? '—' : fmt(amp, 6), tone: 'muted' },
      { label: 'small-μ estimate 2π(1 + μ²/16)', value: `${fmt(2 * Math.PI * (1 + (mu * mu) / 16))} (approximation)`, tone: 'muted' },
      { label: 'large-μ estimate (3 − 2 ln 2)μ', value: `${fmt((3 - 2 * Math.LN2) * mu)} (approximation)`, tone: 'muted' },
      { label: 'origin', value: mu > 0 ? `unstable ${mu < 2 ? 'spiral' : 'node'} (eigenvalues of J: (μ ± √(μ² − 4))/2)` : 'center', tone: mu > 0 ? 'bad' : 'muted' },
    ];
    ctx.setReadouts(rows);
    ctx.warn(mu === 0 ? 'At μ = 0 the equation is the harmonic oscillator: every circle is an orbit and none attracts.' : '');
    ctx.setNote('Energy $E = \\tfrac12(x^2 + x\'^2)$ changes at the rate $\\mu(1 - x^2)x\'^2$: it grows while $|x| < 1$ and shrinks while $|x| > 1$. The balance over one loop is the limit cycle (blue). Van der Pol found it in vacuum-tube circuits (1920s); the same mechanism drives heartbeats, violin strings and flutter.');
  }
  return {
    update,
    tick() { tl = loopTime(ctx.time.t * 1.5, ctx.params.T); pp.render(); ts.render(); },
    reset() { tl = 0; },
    csv() { return csvOf(['t', 'x', "x'"], main.t.map((t, i) => [t, main.y[i][0], main.y[i][1]])); },
    dispose() {},
  };
}
