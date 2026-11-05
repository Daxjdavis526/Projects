// Separable equations y′ = g(t) h(y), solved exactly by separating variables;
// the 3D view shows every solution at once as the surface y(t; y₀).

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import type { V3 } from '../../engine/viewport3d';
import { solveAdaptive, Trajectory } from '../../core/numeric/ode';
import { fmt, tx, pal, csvOf, P, drawRuns, loopTime, changed, label } from './common';

interface Sep {
  name: string;
  tex: string;
  rhs: (t: number, y: number, k: number, K: number) => number;
  y: (t: number, y0: number, k: number, K: number) => number;
  y0range: (K: number) => [number, number];
  zrange: (K: number) => [number, number];
  steps: (k: number, K: number, y0: number) => StepRow[];
  special: (k: number, K: number, y0: number) => Readout[];
  physics: string;
}

const NaNs = Number.NaN;

const SEPS: Record<string, Sep> = {
  growth: {
    name: 'Exponential growth / decay', tex: "y' = k\\,y",
    rhs: (_t, y, k) => k * y, y: (t, y0, k) => y0 * Math.exp(k * t),
    y0range: () => [-2, 2], zrange: () => [-4, 4],
    steps: (k, _K, y0) => [
      { title: 'Separate the variables (for y ≠ 0)', tex: `\\frac{dy}{y} = ${tx(k)}\\,dt` },
      { title: 'Integrate both sides', tex: `\\ln|y| = ${tx(k)}\\,t + C` },
      { title: 'Exponentiate; the sign and e^C combine into one constant', tex: `y = C e^{${tx(k)}t}` },
      { title: 'Apply y(0) = y₀', tex: `y = ${tx(y0)}\\,e^{${tx(k)}t}` },
      { title: 'The solution lost by dividing by y', detail: 'y ≡ 0 is also a solution (C = 0): dividing by h(y) silently drops every zero of h.' },
    ],
    special: (k) => [{ label: k >= 0 ? 'doubling time ln 2 / k' : 'half-life ln 2 / |k|', value: k === 0 ? '∞' : fmt(Math.LN2 / Math.abs(k)) }],
    physics: 'Radioactive decay (k < 0), unchecked population growth or compound interest (k > 0), the charge on a discharging capacitor.',
  },
  logistic: {
    name: 'Logistic growth', tex: "y' = k\\,y\\left(1 - \\frac{y}{K}\\right)",
    rhs: (_t, y, k, K) => k * y * (1 - y / K),
    y: (t, y0, k, K) => {
      if (y0 < 0 && k > 0 && t >= Math.log((K - y0) / -y0) / k) return NaNs;
      if (y0 > K && k < 0 && t >= Math.log((y0 - K) / y0) / k) return NaNs;
      return (K * y0) / (y0 + (K - y0) * Math.exp(-k * t));
    },
    y0range: (K) => [-0.15 * K, 1.8 * K], zrange: (K) => [-0.5 * K, 2 * K],
    steps: (k, K, y0) => [
      { title: 'Separate (for y ≠ 0, K)', tex: `\\frac{dy}{y(1 - y/${tx(K)})} = ${tx(k)}\\,dt` },
      { title: 'Partial fractions', tex: `\\left(\\frac{1}{y} + \\frac{1}{${tx(K)} - y}\\right) dy = ${tx(k)}\\,dt` },
      { title: 'Integrate', tex: `\\ln\\left|\\frac{y}{${tx(K)} - y}\\right| = ${tx(k)}\\,t + C` },
      { title: 'Solve for y and apply y(0) = y₀', tex: `y = \\frac{${tx(K)}\\cdot ${tx(y0)}}{${tx(y0)} + (${tx(K)} - ${tx(y0)})\\,e^{-${tx(k)}t}}` },
      { title: 'Lost solutions', detail: `The equilibria y ≡ 0 and y ≡ ${fmt(K)} were divided away; they are the y₀ = 0 and y₀ = K members of the family.` },
    ],
    special: (k, K, y0) => {
      const r: Readout[] = [{ label: 'equilibria', value: `0 (unstable), ${fmt(K)} (stable)` }];
      if (y0 > 0 && y0 < K / 2 && k > 0) r.push({ label: 'inflection (y = K/2) at t', value: fmt(Math.log((K - y0) / y0) / k) });
      if (y0 < 0 && k > 0) r.push({ label: 'blows down to −∞ at t', value: fmt(Math.log((K - y0) / -y0) / k), tone: 'warn' });
      return r;
    },
    physics: 'Population with a carrying capacity K (Verhulst), the spread of a rumour or an epidemic in its simplest form, autocatalytic reactions.',
  },
  cooling: {
    name: "Newton's law of cooling", tex: "T' = -k\\,(T - T_a)",
    rhs: (_t, y, k, K) => -k * (y - K), y: (t, y0, k, K) => K + (y0 - K) * Math.exp(-k * t),
    y0range: (K) => [K - 3, K + 3], zrange: (K) => [K - 3.5, K + 3.5],
    steps: (k, K, y0) => [
      { title: 'Separate (for T ≠ Tₐ)', tex: `\\frac{dT}{T - ${tx(K)}} = -${tx(k)}\\,dt` },
      { title: 'Integrate', tex: `\\ln|T - ${tx(K)}| = -${tx(k)}\\,t + C` },
      { title: 'Solve and apply T(0) = T₀', tex: `T = ${tx(K)} + (${tx(y0)} - ${tx(K)})\\,e^{-${tx(k)}t}` },
    ],
    special: (k) => [{ label: 'time constant 1/k', value: fmt(1 / k) }, { label: 'difference halves every', value: fmt(Math.LN2 / k) }],
    physics: 'A cooling cup of tea (Tₐ is the room temperature), a thermometer settling, an RC circuit charging toward its supply voltage.',
  },
  gauss: {
    name: 'Time-dependent rate', tex: "y' = -2k\\,t\\,y",
    rhs: (t, y, k) => -2 * k * t * y, y: (t, y0, k) => y0 * Math.exp(-k * t * t),
    y0range: () => [-2, 2], zrange: () => [-2.5, 2.5],
    steps: (k, _K, y0) => [
      { title: 'Separate: g(t) = −2kt, h(y) = y', tex: `\\frac{dy}{y} = -${tx(2 * k)}\\,t\\,dt` },
      { title: 'Integrate', tex: `\\ln|y| = -${tx(k)}\\,t^2 + C` },
      { title: 'Apply y(0) = y₀', tex: `y = ${tx(y0)}\\,e^{-${tx(k)}t^2}` },
    ],
    special: (k) => [{ label: 'width (y falls to y₀/e at t)', value: k > 0 ? fmt(1 / Math.sqrt(k)) : '—' }],
    physics: 'A decay rate that grows linearly in time; the Gaussian appears again as the heat kernel and in quantum mechanics.',
  },
  blowup: {
    name: 'Finite-time blow-up', tex: "y' = k\\,y^2",
    rhs: (_t, y, k) => k * y * y,
    y: (t, y0, k) => { const s = 1 - k * y0 * t; return k * y0 > 0 && s <= 0 ? NaNs : y0 / s; },
    y0range: () => [-2, 2], zrange: () => [-5, 5],
    steps: (k, _K, y0) => [
      { title: 'Separate (for y ≠ 0)', tex: `\\frac{dy}{y^2} = ${tx(k)}\\,dt` },
      { title: 'Integrate', tex: `-\\frac{1}{y} = ${tx(k)}\\,t + C` },
      { title: 'Apply y(0) = y₀', tex: `y = \\frac{${tx(y0)}}{1 - ${tx(k * y0)}\\,t}` },
      { title: 'Where it ends', detail: k * y0 > 0 ? `The denominator vanishes at t* = 1/(k y₀) = ${fmt(1 / (k * y0))}: the solution exists only on t < t*.` : 'The denominator never vanishes for t > 0: the solution exists for all t ≥ 0.' },
    ],
    special: (k, _K, y0) => [{ label: 'blow-up time 1/(k y₀)', value: k * y0 > 0 ? fmt(1 / (k * y0)) : 'none for t > 0', tone: k * y0 > 0 ? 'warn' : 'good' }],
    physics: 'A smooth right-hand side does not guarantee a global solution. Runaway processes (thermal runaway, gravitational collapse in simple models) behave this way.',
  },
  torricelli: {
    name: "Torricelli's law (draining tank)", tex: "h' = -k\\sqrt{h}",
    rhs: (_t, y, k) => -k * Math.sqrt(Math.max(0, y)),
    y: (t, y0, k) => { if (y0 < 0) return NaNs; const s = Math.sqrt(y0) - (k * t) / 2; return s > 0 ? s * s : 0; },
    y0range: () => [0, 4], zrange: () => [0, 4.4],
    steps: (k, _K, y0) => [
      { title: 'Separate (for h > 0)', tex: `\\frac{dh}{\\sqrt h} = -${tx(k)}\\,dt` },
      { title: 'Integrate', tex: `2\\sqrt h = -${tx(k)}\\,t + C` },
      { title: 'Apply h(0) = h₀', tex: `h = \\left(\\sqrt{${tx(y0)}} - ${tx(k / 2)}\\,t\\right)^2 \\;\\text{until it empties, then } h = 0` },
      { title: 'Non-uniqueness backwards', detail: 'Every tank that is empty now could have emptied at any earlier time: √h is not Lipschitz at h = 0, so solutions merge (look at the surface).' },
    ],
    special: (k, _K, y0) => [{ label: 'empties at t = 2√h₀ / k', value: k > 0 ? fmt((2 * Math.sqrt(Math.max(0, y0))) / k) : 'never (k ≤ 0)' }],
    physics: 'Water draining through a hole: the outflow speed is √(2gh) (Bernoulli), so the level falls like −k√h.',
  },
};

export const separable: DemoDef = {
  id: 'ode.separable', module: 'ode', title: 'Separable equations and the solution surface',
  topic: 'First-order equations · separation of variables · dependence on initial data',
  summary: 'When y′ = g(t)h(y), dividing by h(y) and integrating both sides gives the solution exactly. The 3D view plots every solution at once as a surface over (t, y₀).',
  tex: "\\frac{dy}{dt} = g(t)\\,h(y) \\;\\Longrightarrow\\; \\int \\frac{dy}{h(y)} = \\int g(t)\\,dt",
  view: 'split3d', animated: true,
  params: [
    { key: 'k', label: 'rate k', value: 1, min: -2, max: 2, step: 0.01 },
    { key: 'K', label: 'K (capacity / ambient temperature)', value: 2, min: 0.5, max: 4, step: 0.01 },
    { key: 'y0', label: 'initial value y₀', value: 0.4, min: -4, max: 6, step: 0.01 },
    { key: 'T', label: 'time span T', value: 4, min: 1, max: 8, step: 0.1 },
  ],
  choices: [{ key: 'eq', label: 'Equation', value: 'logistic', options: Object.entries(SEPS).map(([k, s]) => [k, s.name]) }],
  toggles: [{ key: 'family', label: 'Family of solutions', value: true }, { key: 'numeric', label: 'Numerical check (DP45 dots)', value: true }],
  experiments: [
    'Logistic: drag y₀ from just above 0 to above K. Every positive solution approaches K; on the surface they form a ridge flattening onto the plane y = K.',
    'Logistic with y₀ < 0: the solution runs off to −∞ in finite time — the surface tears.',
    'Torricelli: solutions from different heights reach h = 0 and merge into the floor. Going backwards, you cannot tell when an empty tank emptied.',
    'Blow-up y′ = ky²: double y₀ and the blow-up time halves.',
    'Open the Steps tab: the separation, the integration, and the solutions lost by dividing by h(y).',
  ],
  connections: ['ode.slopefield', 'ode.linear1', 'ode.ivp', 'ode.lotka'],
  accuracy: 'The curves and the surface are the exact closed-form solutions. The gold dots are an independent numerical solution (Dormand–Prince 5(4), rtol 10⁻¹⁰) and the readout shows the difference. Values far outside the box are cut from the surface.',
  create: (ctx) => separableDemo(ctx),
};

function separableDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, v = ctx.view3d!;
  plot.opts.xLabel = 't'; plot.opts.yLabel = 'y';
  const reframe = changed();
  let S = SEPS.logistic;
  let surf: ReturnType<typeof v.addSurface> | null = null;
  let hi: ReturnType<typeof v.addCurve> | null = null;
  let dot: ReturnType<typeof v.addPoint> | null = null;
  const fam: ReturnType<typeof v.addCurve>[] = [];
  let labels: ReturnType<typeof v.addLabel>[] = [];
  let num: Trajectory = { t: [], y: [], ok: true, steps: 0 };
  let tNow = 0;

  const Y = (t: number, y0: number) => S.y(t, y0, ctx.params.k, ctx.params.K);

  function y0Clamped() {
    const [lo, hi2] = S.y0range(ctx.params.K);
    return Math.min(hi2, Math.max(lo, ctx.params.y0));
  }

  function update() {
    S = SEPS[ctx.choices.eq] ?? SEPS.logistic;
    const { k, K, T } = ctx.params;
    const y0 = y0Clamped();
    if (y0 !== ctx.params.y0) ctx.setParam('y0', y0);
    const [lo, hiY] = S.y0range(K), [zlo, zhi] = S.zrange(K);
    const c = pal(ctx);
    // 3D: the solution surface over (t, y₀)
    const inBox = (z: number) => Number.isFinite(z) && z >= zlo - 1e-9 && z <= zhi + 1e-9;
    const fsurf = (u: number, w: number): V3 | null => { const z = Y(u, w); return inBox(z) ? [u, w, z] : null; };
    const opts = { uRange: [0, T] as [number, number], vRange: [lo, hiY] as [number, number], res: 70, colormap: 'viridis' as const, colorRange: [zlo, zhi] as [number, number], opacity: 0.88 };
    if (reframe(`${ctx.choices.eq}|${T}|${K}`)) {
      v.setBounds({ x: [0, T], y: [lo, hiY], z: [zlo, zhi] });
      v.resetCamera();
      labels.forEach((l) => l.dispose());
      const oy = Math.min(hiY, Math.max(lo, 0)), oz = Math.min(zhi, Math.max(zlo, 0));
      labels = [v.addLabel([T * 1.12, oy, oz], 't'), v.addLabel([0, hiY + (hiY - lo) * 0.12, oz], 'y₀'), v.addLabel([0, oy, zhi + (zhi - zlo) * 0.1], 'y')];
      plot.setView({ x0: -T * 0.04, x1: T * 1.04, y0: zlo - (zhi - zlo) * 0.04, y1: zhi + (zhi - zlo) * 0.04 });
    }
    if (!surf) surf = v.addSurface(fsurf, opts); else surf.update(fsurf, opts);
    const curveAt = (w: number): V3[] => { const out: V3[] = []; for (let i = 0; i <= 160; i++) { const t = (T * i) / 160, z = Y(t, w); out.push(inBox(z) ? [t, w, z] : [NaN, NaN, NaN]); } return out; };
    const famY0 = Array.from({ length: 9 }, (_, i) => lo + ((i + 0.5) / 9) * (hiY - lo));
    if (!fam.length) for (const w of famY0) fam.push(v.addCurve(curveAt(w), { color: c.ink, radius: 0, opacity: 0.6 }));
    else fam.forEach((h, i) => h.set(curveAt(famY0[i])));
    fam.forEach((h) => h.visible(ctx.toggles.family));
    if (!hi) hi = v.addCurve(curveAt(y0), { color: c.gold, radius: (zhi - zlo) * 0.008 }); else hi.set(curveAt(y0));
    // numerical check
    num = solveAdaptive((t, yy) => [S.rhs(t, yy[0], k, K)], [y0], 0, T, { rtol: 1e-10, atol: 1e-12, maxStep: T / 60 });
    const ex = Y(T, y0), nu = num.t[num.t.length - 1] >= T - 1e-9 ? num.y[num.y.length - 1][0] : NaN;
    const famPts = famY0.map((w) => Array.from({ length: 151 }, (_, i) => { const t = (T * i) / 150; return [t, Y(t, w)] as P; }));
    const mainPts = Array.from({ length: 401 }, (_, i) => { const t = (T * i) / 400; return [t, Y(t, y0)] as P; });
    plot.setDraw((g) => {
      if (ctx.toggles.family) for (const p of famPts) drawRuns(g, p, { color: c.faint, width: 1.3 }, 1e3);
      drawRuns(g, mainPts, { color: c.blue, width: 3 }, 1e3);
      if (ctx.toggles.numeric) { const step = Math.max(1, Math.floor(num.t.length / 40)); for (let i = 0; i < num.t.length; i += step) g.point([num.t[i], num.y[i][0]], 3, { fill: c.gold }); }
      const yNow = Y(tNow, y0);
      if (Number.isFinite(yNow)) { g.line([tNow, g.view.y0], [tNow, g.view.y1], { color: c.muted, width: 1, dash: [4, 4] }); g.point([tNow, yNow], 5, { fill: c.orange }); }
      if (S === SEPS.logistic || S === SEPS.cooling) { g.line([0, K], [T, K], { color: c.green, width: 1.5, dash: [8, 5] }); label(g, [T, K], S === SEPS.cooling ? 'Tₐ' : 'K', c.green, { align: 'right', dy: -10 }); }
      g.handle({ id: 'y0', at: [0, y0], color: c.gold, label: 'y₀', constrain: ([, y]) => [0, y], onDrag: ([, y]) => { ctx.setParam('y0', y); update(); } });
    });
    const err = Math.abs(ex - nu);
    ctx.setReadouts([
      { label: 'equation', value: S.tex, tex: true },
      { label: `y(${fmt(T, 3)}) exact`, value: fmt(ex, 8) },
      { label: `y(${fmt(T, 3)}) numerical`, value: Number.isFinite(nu) ? fmt(nu, 8) : 'stopped (blow-up)', tone: Number.isFinite(nu) ? undefined : 'warn' },
      { label: '|exact − numerical|', value: Number.isFinite(err) ? fmt(err, 2) : '—', tone: Number.isFinite(err) && err < 1e-6 ? 'good' : 'muted' },
      ...S.special(k, K, y0),
    ]);
    ctx.setSteps(S.steps(k, K, y0));
    ctx.warn(S === SEPS.torricelli && k <= 0 ? 'Torricelli’s law needs k > 0 (a tank that drains).' : '');
    ctx.setNote(`**${S.name}.** ${S.physics} The left plot is a slice of the surface on the right at fixed $y_0$ (gold); the faint curves are other slices. (3D axes: x is $t$, y is $y_0$, z is $y$.)`);
    placeDot();
  }

  function placeDot() {
    const y0 = y0Clamped(), z = Y(tNow, y0);
    const p: V3 = Number.isFinite(z) ? [tNow, y0, z] : [NaN, NaN, NaN];
    if (!dot) dot = v.addPoint([0, y0, Y(0, y0)], { color: pal(ctx).orange, size: 0.08 * Math.max(1, ctx.params.T / 4) });
    if (Number.isFinite(z)) { dot.visible(true); dot.set(p); } else dot.visible(false);
  }

  return {
    update,
    tick() { tNow = loopTime(ctx.time.t, ctx.params.T); placeDot(); plot.render(); },
    reset() { tNow = 0; },
    csv() {
      const y0 = y0Clamped();
      return csvOf(['t', 'y exact', 'y numerical (DP45)'], num.t.map((t, i) => [t, Y(t, y0), num.y[i][0]]));
    },
    dispose() { v.clear(); },
  };
}

