// Improper integrals: a limit that moves out to infinity (or in toward a
// singularity) and the running value I(t) plotted against log t — it levels
// off at the integral's value, or keeps climbing for ever.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { integrate } from '../../core/numeric/quad';
import { fmt, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, RED, FONT, customAxes, safeTutorial, texNum } from './util';

interface Fam {
  label: string; kind: 'inf' | 'sing'; lower: number; view: [number, number, number, number];
  f: (x: number, p: number) => number;
  /** I(t) exactly where a formula exists (t is the moving limit) */
  I?: (t: number, p: number) => number;
  limit: (p: number) => number; limitTeX: (p: number) => string; tex: (p: number) => string;
  usesP: boolean; maxLog?: number; note: (p: number) => string; units?: string;
}

const GM_R = 3.986004418e14 / 6.371e6 / 1e6;   // GM/R for the Earth, in MJ/kg

const FAMS: Record<string, Fam> = {
  p1: {
    label: '∫₁^∞ dx / xᵖ', kind: 'inf', lower: 1, view: [-0.3, 12, -0.25, 1.6], usesP: true,
    f: (x, p) => (x > 0 ? Math.pow(x, -p) : NaN),
    I: (t, p) => (Math.abs(p - 1) < 1e-12 ? Math.log(t) : (Math.pow(t, 1 - p) - 1) / (1 - p)),
    limit: (p) => (p > 1 ? 1 / (p - 1) : Infinity), limitTeX: (p) => (p > 1 ? `\\frac{1}{p-1} = ${texNum(1 / (p - 1), 6)}` : '\\infty'),
    tex: () => '\\int_1^\\infty \\frac{dx}{x^p}',
    note: (p) => (p > 1 ? `$p = ${fmt(p, 3)} > 1$: the tail thins fast enough. $\\int_1^t x^{-p}dx = \\frac{1 - t^{1-p}}{p-1} \\to \\frac{1}{p-1}$.` : Math.abs(p - 1) < 1e-9 ? 'The harmonic case $p = 1$: $\\int_1^t \\frac{dx}{x} = \\ln t$ grows without bound — but only logarithmically: you need $t \\approx 10^{43}$ to reach 100.' : `$p = ${fmt(p, 3)} \\le 1$: $\\int_1^t x^{-p}dx = \\frac{t^{1-p} - 1}{1-p}$ grows like a power of $t$ — divergent.`),
  },
  p0: {
    label: '∫₀¹ dx / xᵖ  (singular at 0)', kind: 'sing', lower: 0, view: [-0.08, 1.25, -0.6, 10], usesP: true,
    f: (x, p) => (x > 0 ? Math.pow(x, -p) : NaN),
    I: (e, p) => (Math.abs(p - 1) < 1e-12 ? -Math.log(e) : (1 - Math.pow(e, 1 - p)) / (1 - p)),
    limit: (p) => (p < 1 ? 1 / (1 - p) : Infinity), limitTeX: (p) => (p < 1 ? `\\frac{1}{1-p} = ${texNum(1 / (1 - p), 6)}` : '\\infty'),
    tex: () => '\\int_0^1 \\frac{dx}{x^p}',
    note: (p) => (p < 1 ? `Near $0$ the spike is thin enough: $p = ${fmt(p, 3)} < 1$, and $\\int_\\varepsilon^1 x^{-p}dx \\to \\frac{1}{1-p}$. Exactly the opposite rule to $\\int_1^\\infty$.` : `$p = ${fmt(p, 3)} \\ge 1$: the area near $0$ is infinite. (At $p = 1$ both ends diverge — $\\int_0^\\infty dx/x$ fails twice.)`),
  },
  exp: {
    label: '∫₀^∞ e^(−kx) dx', kind: 'inf', lower: 0, view: [-0.3, 8, -0.15, 1.3], usesP: true,
    f: (x, k) => Math.exp(-k * x), I: (t, k) => (1 - Math.exp(-k * t)) / k,
    limit: (k) => 1 / k, limitTeX: (k) => `\\frac1k = ${texNum(1 / k, 6)}`, tex: () => '\\int_0^\\infty e^{-kx}dx',
    note: (k) => `Exponential decay beats every power: $\\int_0^t e^{-kx}dx = \\frac{1 - e^{-kt}}{k} \\to \\frac1k$ (here $k = ${fmt(k, 3)}$). Physics: the mean lifetime of a decaying nucleus is $\\int_0^\\infty t\\,k e^{-kt}dt = 1/k$.`,
  },
  lorentz: {
    label: '∫₀^∞ dx / (1 + x²)', kind: 'inf', lower: 0, view: [-0.3, 12, -0.12, 1.25], usesP: false,
    f: (x) => 1 / (1 + x * x), I: (t) => Math.atan(t), limit: () => Math.PI / 2, limitTeX: () => '\\frac{\\pi}{2}', tex: () => '\\int_0^\\infty \\frac{dx}{1+x^2}',
    note: () => '$\\int_0^t \\frac{dx}{1+x^2} = \\arctan t \\to \\frac{\\pi}{2}$. Comparison test: for $x \\ge 1$ the integrand is below $1/x^2$, whose integral converges — so this one must too.',
  },
  xlnx: {
    label: '∫₂^∞ dx / (x ln x)', kind: 'inf', lower: 2, view: [1.2, 30, -0.06, 0.8], usesP: false,
    f: (x) => (x > 1 ? 1 / (x * Math.log(x)) : NaN), I: (t) => (t > 2 ? Math.log(Math.log(t)) - Math.log(Math.log(2)) : 0),
    limit: () => Infinity, limitTeX: () => '\\infty', tex: () => '\\int_2^\\infty \\frac{dx}{x\\ln x}',
    note: () => 'Substituting $u = \\ln x$ gives $\\int du/u = \\ln\\ln t$: it diverges, but so slowly that $t = 10^{6}$ only reaches about 3. A graph alone cannot tell you a series or integral converges.',
  },
  dirichlet: {
    label: '∫₀^∞ sin x / x dx  (conditional)', kind: 'inf', lower: 0, view: [-0.5, 30, -0.35, 1.12], usesP: false, maxLog: 4,
    f: (x) => (x === 0 ? 1 : Math.sin(x) / x), limit: () => Math.PI / 2, limitTeX: () => '\\frac{\\pi}{2}', tex: () => '\\int_0^\\infty \\frac{\\sin x}{x}dx',
    note: () => 'The Dirichlet integral converges to $\\pi/2$ only because positive and negative lobes cancel: $\\int_0^\\infty |\\sin x|/x\\,dx$ diverges. $I(t)$ here is numerical (adaptive quadrature, cumulative).',
  },
  escape: {
    label: 'Escape from the Earth: ∫_R^∞ GM/r² dr', kind: 'inf', lower: 1, view: [0, 12, -6, 70], usesP: false, units: ' MJ/kg',
    f: (r) => (r >= 1 ? GM_R / (r * r) : NaN), I: (t) => GM_R * (1 - 1 / t),
    limit: () => GM_R, limitTeX: () => `\\frac{GM}{R} = ${texNum(GM_R, 4)}\\ \\text{MJ/kg}`, tex: () => 'W = \\int_R^\\infty \\frac{GMm}{r^2}\\,dr',
    note: () => `The work to lift 1 kg from the surface ($r = R$, in Earth radii on the x-axis) to infinity is finite: $\\frac{GM}{R} \\approx 62.6$ MJ. Setting $\\tfrac12 v^2 = GM/R$ gives the escape velocity $v = (2GM/R)^{1/2} \\approx 11.2$ km/s. Gravity weakens like $1/r^2$ — the $p = 2$ integral.`,
  },
};

export const improperDemo: DemoDef = {
  id: 'calc2.improper', module: 'calc2', title: 'Improper integrals', topic: 'Improper integrals, p-integrals, convergence and divergence',
  summary: 'An integral over an infinite interval (or across a singularity) is a limit. Move the limit outward and watch the running value I(t): it levels off (convergent) or climbs for ever (divergent).',
  tex: '\\int_1^\\infty \\frac{dx}{x^p} = \\lim_{t\\to\\infty}\\int_1^t \\frac{dx}{x^p} = \\begin{cases}\\frac{1}{p-1} & p > 1\\\\ \\infty & p \\le 1\\end{cases}',
  view: 'split2d', animated: true,
  params: [
    { key: 'logt', label: 'moving limit: log₁₀ t  (or log₁₀ 1/ε)', value: 0.8, min: 0, max: 6, step: 0.01 },
    { key: 'p', label: 'p  (exponent, or decay rate k)', value: 2, min: 0.2, max: 3, step: 0.01 },
  ],
  choices: [{ key: 'fam', label: 'Integral', value: 'p1', options: Object.entries(FAMS).map(([k, f]) => [k, f.label] as [string, string]) }],
  experiments: [
    'Press play: the limit sweeps out to t = 10⁶. For p = 2 the curve I(t) flattens at 1; set p = 1 and it climbs in a straight line on the log axis — that is ln t.',
    'Find the boundary: with p = 1.1 the integral converges (to 10), with p = 0.9 it diverges. The p-integral’s rule is p > 1.',
    'Switch to ∫₀¹ dx/xᵖ: now convergence needs p < 1. A spike at 0 and a tail at ∞ obey opposite rules.',
    'Try 1/(x ln x): it diverges, yet I(10⁶) is only about 3. A slow climb is still a climb.',
    'Escape from the Earth: the work integral converges to GM/R ≈ 62.6 MJ/kg — that finite number is why escape velocity exists.',
  ],
  connections: ['calc2.tests', 'calc2.series', 'calc2.partfrac'],
  accuracy: 'I(t) and the limits are exact closed forms, except for sin x / x, whose running value is cumulative adaptive quadrature (≈1e−9); its limit π/2 is exact. GM and R for the Earth: 3.986004×10¹⁴ m³/s² and 6371 km (mean radius).',
  tutorial: safeTutorial([
    { text: '**An integral to infinity is a limit.** $\\int_1^\\infty f = \\lim_{t\\to\\infty}\\int_1^t f$. The left plot shades the area up to $t$; the right plot records $I(t)$ against $\\log_{10} t$, so a whole range $1 \\le t \\le 10^6$ fits on the screen.', set: { choices: { fam: 'p1' }, params: { p: 2, logt: 0.5 } }, task: 'Press play (space) and watch I(t) level off at 1.' },
    { text: 'For $p = 2$: $\\int_1^t x^{-2}dx = 1 - \\frac1t \\to 1$. The infinitely long region has **finite area**. Physics uses this constantly — the work to escape a planet is exactly this integral.', task: 'Drag the moving limit to t = 10⁶ (log₁₀ t = 6).', done: (c) => c.params.logt > 5.95 },
    { text: 'Now $p = 1$: $\\int_1^t \\frac{dx}{x} = \\ln t$ — no limit. On the log axis $\\ln t$ is a straight line, rising for ever. The curve $1/x$ looks just like $1/x^2$ far out, but it does not thin quickly enough.', set: { params: { p: 1, logt: 6 } }, task: 'Find the dividing line: slide p between 0.9 and 1.1.' },
    { text: '**The p-test.** $\\int_1^\\infty x^{-p}dx$ converges exactly when $p > 1$. This is the yardstick for the **comparison test**: an integrand smaller than a convergent one converges; larger than a divergent one diverges.', set: { choices: { fam: 'lorentz' }, params: { logt: 3 } }, task: '1/(1 + x²) is below 1/x² — so it converges. Read the limit π/2.' },
    { text: '**Singular integrands.** $\\int_0^1 x^{-p}dx$ is improper at $0$; move $\\varepsilon \\to 0$. Now the rule flips: convergent for $p < 1$. A tall thin spike can have finite area.', set: { choices: { fam: 'p0' }, params: { p: 0.5, logt: 0.3 } }, task: 'Press play: I(ε) → 2 for p = ½.' },
    { text: '**Escape velocity.** Lifting 1 kg from the Earth’s surface to infinity takes $\\int_R^\\infty GM/r^2\\,dr = GM/R \\approx 62.6$ MJ — finite, because gravity falls off like $1/r^2$ ($p = 2$). Kinetic energy $\\tfrac12 v^2$ equal to that gives $v \\approx 11.2$ km/s.', set: { choices: { fam: 'escape' }, params: { logt: 0.3 } }, task: 'Play the animation to infinity.' },
  ]),
  create: (ctx) => createImproper(ctx),
};

function createImproper(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  R.opts.axes = false; R.opts.grid = false;
  let lastFam = '';
  // cumulative I(t) for families without a closed form, on a log grid of t
  const cumCache = new Map<string, { lt: number[]; I: number[] }>();
  const cumulative = (key: string, fam: Fam, p: number) => {
    const ck = `${key}|${p}`;
    let c = cumCache.get(ck);
    if (!c) {
      const maxL = fam.maxLog ?? 6, n = 400, lt: number[] = [], I: number[] = [];
      let acc = integrate((x) => fam.f(x, p), fam.lower, 1, 1e-12).value, prevT = 1;
      for (let i = 0; i <= n; i++) { const l = (maxL * i) / n, t = 10 ** l; if (i) acc += integrate((x) => fam.f(x, p), prevT, t, 1e-11, 400000).value; prevT = t; lt.push(l); I.push(acc); }
      c = { lt, I }; cumCache.clear(); cumCache.set(ck, c);
    }
    return c;
  };
  const Iof = (key: string, fam: Fam, p: number, l: number) => {
    const t = fam.kind === 'inf' ? 10 ** l : 10 ** -l;
    if (fam.I) return fam.I(t, p);
    const c = cumulative(key, fam, p), i = clamp(Math.floor((l / (fam.maxLog ?? 6)) * (c.lt.length - 1)), 0, c.lt.length - 2);
    const s = (l - c.lt[i]) / (c.lt[i + 1] - c.lt[i]);
    return c.I[i] + (c.I[i + 1] - c.I[i]) * s;
  };

  const update = () => {
    const key = FAMS[ctx.choices.fam] ? ctx.choices.fam : 'p1';
    const fam = FAMS[key], p = ctx.params.p;
    const maxL = fam.maxLog ?? 6;
    const l = clamp(ctx.params.logt, 0, maxL);
    const t = fam.kind === 'inf' ? 10 ** l : 10 ** -l;
    if (key !== lastFam) {
      lastFam = key;
      const [x0, x1, y0, y1] = fam.view;
      L.setView({ x0, x1, y0, y1 });
      L.opts.xLabel = key === 'escape' ? 'r  (Earth radii)' : 'x';
    }
    const I = Iof(key, fam, p, l), lim = fam.limit(p);
    const conv = Number.isFinite(lim);
    const tcol = ink(ctx);
    L.setDraw((g) => {
      const f = (x: number) => fam.f(x, p);
      const lo = fam.kind === 'inf' ? fam.lower : t, hi = fam.kind === 'inf' ? Math.min(t, g.view.x1) : 1;
      if (hi > lo) g.fillBetween(f, () => 0, lo, hi, { fill: rgba(conv ? BLUE : RED, 0.32) }, 600);
      g.fn(f, { color: tcol, width: 2.6 }, [fam.kind === 'sing' ? 1e-4 : fam.lower, g.view.x1]);
      if (fam.kind === 'inf') {
        if (t <= g.view.x1) { g.line([t, 0], [t, f(t)], { color: GREEN, width: 2 }); g.handle({ id: 't', at: [t, 0], color: GREEN, label: `t = ${fmt(t, 4)}`, onDrag: ([x]) => ctx.setParam('logt', +clamp(Math.log10(Math.max(x, fam.lower + 1e-3, 1)), 0, maxL).toFixed(3)) }); }
        else g.text([g.view.x1, (g.view.y0 + g.view.y1) * 0.25], `shading continues to t = ${fmt(t, 4)} →`, { color: GREEN, font: FONT, align: 'right' }, -10, 0);
      } else {
        g.line([t, 0], [t, Math.min(f(t), g.view.y1)], { color: GREEN, width: 2 });
        g.handle({ id: 'e', at: [t, 0], color: GREEN, label: `ε = ${fmt(t, 3)}`, onDrag: ([x]) => ctx.setParam('logt', +clamp(-Math.log10(Math.max(x, 1e-6)), 0, maxL).toFixed(3)) });
      }
      g.text([g.view.x1, g.view.y1], fam.label, { color: tcol, font: FONT, align: 'right' }, -12, 22);
    });

    // I(t) against log10 t
    const N = 300, pts: [number, number][] = [];
    let ymax = conv ? lim : 0, ymin = 0;
    for (let i = 0; i <= N; i++) { const ll = (maxL * i) / N, v = Iof(key, fam, p, ll); pts.push([ll, v]); if (Number.isFinite(v)) { ymax = Math.max(ymax, v); ymin = Math.min(ymin, v); } }
    const span = Math.max(ymax - ymin, 1e-6);
    R.setView({ x0: -maxL * 0.04, x1: maxL * 1.04, y0: ymin - span * 0.12, y1: ymax + span * 0.15 });
    R.setDraw((g) => {
      customAxes(g, ctx.dark, { xLog: true, xLabel: fam.kind === 'inf' ? 't' : '1/ε', yLabel: 'I(t)' });
      g.line([g.view.x0, 0], [g.view.x1, 0], { color: muted(ctx), width: 1 });
      if (conv) { g.line([g.view.x0, lim], [g.view.x1, lim], { color: GOLD, width: 1.6, dash: [7, 5] }); g.text([g.view.x1, lim], `limit = ${fmt(lim, 6)}${fam.units ?? ''}`, { color: GOLD, font: FONT, align: 'right', baseline: 'bottom' }, -8, -6); }
      g.path(pts, { color: conv ? BLUE : RED, width: 2.6 });
      g.point([l, I], 6, { fill: GREEN });
      g.text([g.view.x0, g.view.y1], conv ? 'levels off: convergent' : 'keeps climbing: divergent', { color: conv ? BLUE : RED, font: '700 14px Inter, sans-serif' }, 50, 26);
      g.handle({ id: 'tt', at: [l, I], color: GREEN, onDrag: ([x]) => ctx.setParam('logt', +clamp(x, 0, maxL).toFixed(3)) });
    });
    const gap = conv ? lim - I : NaN;
    ctx.setReadouts([
      { label: fam.kind === 'inf' ? 'moving limit t' : 'moving limit ε', value: fmt(t, 6) },
      { label: `I(${fam.kind === 'inf' ? 't' : 'ε'})${fam.I ? '  (exact)' : '  (numerical)'}`, value: fmt(I, 10) + (fam.units ?? '') },
      { label: 'the improper integral', value: `${fam.tex(p)} = ${fam.limitTeX(p)}`, tex: true },
      { label: 'verdict', value: conv ? 'converges' : 'diverges', tone: conv ? 'good' : 'bad' },
      ...(conv ? [{ label: 'still missing (the tail)', value: fmt(gap, 6) }] : []),
      ...(key === 'escape' ? [{ label: 'escape velocity √(2GM/R)', value: `${fmt(Math.sqrt(2 * GM_R * 1e6) / 1000, 5)} km/s` }] : []),
    ]);
    ctx.warn(fam.maxLog && ctx.params.logt > fam.maxLog ? `For sin x / x the running value is computed numerically up to t = 10^${fam.maxLog}.` : '');
    ctx.setNote(fam.note(p) + (fam.usesP ? '' : ' (The p slider does not affect this integral.)'));
  };
  let dir = 1;
  return {
    update,
    tick(dt) {
      const fam = FAMS[ctx.choices.fam] ?? FAMS.p1, maxL = fam.maxLog ?? 6;
      let v = ctx.params.logt + dir * dt * maxL / 8;
      if (v >= maxL) { v = maxL; dir = -1; } else if (v <= 0) { v = 0; dir = 1; }
      ctx.setParam('logt', v); update();
    },
    dispose() {},
  };
}
