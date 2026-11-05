// Power series and the interval of convergence: partial sums S_N(x) across
// the line, the interval (with its endpoints decided one by one), and at a
// probe point the sequence S_0(x₀), S_1(x₀), … converging or not.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { integrate } from '../../core/numeric/quad';
import { logFactorial } from '../../core/numeric/taylor';
import { fmt, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, RED, VIOLET, FONT, safeTutorial } from './util';

interface Fam {
  label: string; tex: string; R0: number; n0: number;
  term: (n: number, u: number) => number;
  f?: (u: number) => number; fTeX: string;
  /** at u = +R0 and u = −R0 */
  ends: [{ conv: boolean; why: string }, { conv: boolean; why: string }];
}
const li2 = (u: number) => (u === 0 ? 0 : -integrate((t) => (t === 0 ? -1 : Math.log1p(-t) / t), 0, u, 1e-12).value);
const FAMS: Record<string, Fam> = {
  geo: { label: 'Σ uⁿ  (geometric)', tex: '\\sum_{n=0}^\\infty u^n', R0: 1, n0: 0, term: (n, u) => Math.pow(u, n), f: (u) => 1 / (1 - u), fTeX: '\\frac{1}{1-u}', ends: [{ conv: false, why: 'u = 1: terms are all 1' }, { conv: false, why: 'u = −1: terms ±1 do not → 0' }] },
  log: { label: 'Σ uⁿ/n  (= −ln(1 − u))', tex: '\\sum_{n=1}^\\infty \\frac{u^n}{n}', R0: 1, n0: 1, term: (n, u) => Math.pow(u, n) / n, f: (u) => -Math.log1p(-u), fTeX: '-\\ln(1-u)', ends: [{ conv: false, why: 'u = 1: the harmonic series' }, { conv: true, why: 'u = −1: alternating harmonic (→ −ln 2)' }] },
  li2: { label: 'Σ uⁿ/n²  (dilogarithm)', tex: '\\sum_{n=1}^\\infty \\frac{u^n}{n^2}', R0: 1, n0: 1, term: (n, u) => Math.pow(u, n) / (n * n), f: (u) => (u <= 1 ? li2(u) : NaN), fTeX: '\\operatorname{Li}_2(u)', ends: [{ conv: true, why: 'u = 1: Σ1/n² = π²/6 (p = 2)' }, { conv: true, why: 'u = −1: absolutely, by p = 2' }] },
  atan: { label: 'Σ (−1)ⁿ u²ⁿ⁺¹/(2n+1)  (= arctan u)', tex: '\\sum_{n=0}^\\infty \\frac{(-1)^n u^{2n+1}}{2n+1}', R0: 1, n0: 0, term: (n, u) => ((n % 2 ? -1 : 1) * Math.pow(u, 2 * n + 1)) / (2 * n + 1), f: Math.atan, fTeX: '\\arctan u', ends: [{ conv: true, why: 'u = 1: Leibniz series → π/4' }, { conv: true, why: 'u = −1: Leibniz series → −π/4' }] },
  exp: { label: 'Σ uⁿ/n!  (= eᵘ)', tex: '\\sum_{n=0}^\\infty \\frac{u^n}{n!}', R0: Infinity, n0: 0, term: (n, u) => (u === 0 ? (n === 0 ? 1 : 0) : Math.sign(u) ** n * Math.exp(n * Math.log(Math.abs(u)) - logFactorial(n))), f: Math.exp, fTeX: 'e^u', ends: [{ conv: true, why: '' }, { conv: true, why: '' }] },
  fact: { label: 'Σ n! uⁿ  (R = 0)', tex: '\\sum_{n=0}^\\infty n!\\,u^n', R0: 0, n0: 0, term: (n, u) => (u === 0 ? (n === 0 ? 1 : 0) : Math.sign(u) ** n * Math.exp(logFactorial(n) + n * Math.log(Math.abs(u)))), fTeX: '\\text{(no function)}', ends: [{ conv: false, why: '' }, { conv: false, why: '' }] },
};

export const powerseriesDemo: DemoDef = {
  id: 'calc2.powerseries', module: 'calc2', title: 'Power series and the interval of convergence', topic: 'Power series, radius and interval of convergence, endpoint tests',
  summary: 'A power series Σ cₙ(x − c)ⁿ converges on an interval centred at c: absolutely inside the radius R, never outside, and at the two endpoints — it depends. Find R with the ratio test, then test each endpoint separately.',
  tex: 'u = \\frac{x - c}{b},\\qquad R = b\\cdot\\lim_{n\\to\\infty}\\left|\\frac{c_n}{c_{n+1}}\\right|',
  view: 'split2d', animated: true,
  params: [
    { key: 'N', label: 'partial sum order N (play)', value: 8, min: 0, max: 80, step: 1 },
    { key: 'x0', label: 'probe x₀ (drag)', value: 0.7, min: -6, max: 6, step: 0.01 },
    { key: 'c', label: 'centre c', value: 0, min: -3, max: 3, step: 0.01 },
    { key: 'b', label: 'scale b  (u = (x − c)/b)', value: 1, min: 0.25, max: 3, step: 0.01 },
  ],
  choices: [{ key: 'f', label: 'Series', value: 'log', options: Object.entries(FAMS).map(([k, f]) => [k, f.label] as [string, string]) }],
  experiments: [
    'Σ uⁿ/n: drag the probe to x = −1 (converges, slowly, to −ln 2) and to x = 1 (diverges, like the harmonic series). Same radius, different endpoints.',
    'Σ uⁿ/n²: both endpoints converge — the interval is closed, [−1, 1].',
    'Σ uⁿ: neither endpoint converges — the interval is open, (−1, 1).',
    'Change the centre c and scale b: the interval becomes (c − b, c + b) — with the same endpoint behaviour.',
    'Σ n! uⁿ: R = 0. The series converges only at its centre: the partial sums at any other x explode.',
  ],
  connections: ['calc2.taylor', 'calc2.tests', 'calc2.series'],
  accuracy: 'Partial sums are exact sums (factorials through logarithms). Radii are exact (ratio test limits). The dilogarithm is −∫₀ᵘ ln(1 − t)/t dt by adaptive quadrature.',
  tutorial: safeTutorial([
    { text: '**A power series** is a polynomial that never ends: $\\sum c_n (x - c)^n$. For each $x$ it is an ordinary series — it converges or not. The set where it converges is always an interval centred at $c$.', set: { choices: { f: 'log' }, params: { N: 8, x0: 0.5, c: 0, b: 1 } }, task: 'Press play: the partial sums grow in order.' },
    { text: '**The radius.** Apply the ratio test to $\\sum \\frac{u^n}{n}$: $\\left|\\frac{a_{n+1}}{a_n}\\right| = |u|\\frac{n}{n+1} \\to |u|$. So it converges absolutely when $|u| < 1$ and diverges when $|u| > 1$: $R = 1$.', task: 'Drag the probe outside the interval (x₀ = 1.3): the partial sums at x₀ run away.', done: (c) => Math.abs(c.params.x0 - c.params.c) > 1.2 * c.params.b },
    { text: '**Endpoints** are where the ratio test gives $L = 1$ and says nothing. Test them directly: at $u = 1$, $\\sum \\frac1n$ diverges; at $u = -1$, $\\sum \\frac{(-1)^n}{n}$ converges. Interval: $[-1, 1)$.', task: 'Drag the probe to x = −1 and raise N to 80.', done: (c) => Math.abs(c.params.x0 + 1) < 0.03 && c.params.N >= 60 },
    { text: 'Changing the coefficients changes the endpoints but not the radius: $\\sum u^n$ is open at both ends, $\\sum u^n/n^2$ closed at both.', set: { choices: { f: 'li2' }, params: { x0: 1 } } },
    { text: '**Shifting and scaling.** With $u = (x - c)/b$ the interval becomes $(c - b, c + b)$ — the same picture moved and stretched. Every Taylor series is a power series centred at its centre.', set: { choices: { f: 'atan' }, params: { c: 1, b: 2, x0: 2 } } },
  ]),
  create: (ctx) => createPS(ctx),
};

function createPS(ctx: DemoCtx): DemoInstance {
  const Lp = ctx.plot!, Rp = ctx.plot2!;
  Lp.opts.xLabel = 'x'; Rp.opts.xLabel = 'n'; Rp.opts.yLabel = 'S_n(x₀)';
  let lastKey = '';
  const update = () => {
    const key = FAMS[ctx.choices.f] ? ctx.choices.f : 'log';
    const F = FAMS[key], N = Math.round(ctx.params.N), { c, b } = ctx.params, x0 = ctx.params.x0;
    const U = (x: number) => (x - c) / b;
    const S = (x: number, n = N) => { const u = U(x); let s = 0; for (let k = F.n0; k <= n; k++) s += F.term(k, u); return s; };
    const R = b * F.R0;
    const lo = c - R, hi = c + R;
    const fx = (x: number) => { const u = U(x); if (!F.f) return NaN; if (Number.isFinite(F.R0) && Math.abs(u) > F.R0 + 1e-12) return NaN; if (Math.abs(u) === F.R0 && !(u > 0 ? F.ends[0].conv : F.ends[1].conv)) return NaN; return F.f(u); };
    const k = `${key}|${c}|${b}`;
    if (k !== lastKey) {
      lastKey = k;
      const w = Number.isFinite(R) && R > 0 ? R : 2;
      Lp.setView({ x0: c - 2.2 * w, x1: c + 2.2 * w, y0: -3, y1: 4 });
    }
    const t = ink(ctx);
    Lp.setDraw((g) => {
      // interval of convergence on the axis
      if (Number.isFinite(R)) {
        if (R > 0) g.fillBetween(() => g.view.y1, () => g.view.y0, lo, hi, { fill: rgba(GREEN, 0.07) }, 4);
        g.line([Math.max(lo, g.view.x0), 0], [Math.min(hi, g.view.x1), 0], { color: GREEN, width: 5, alpha: 0.8 });
        if (R > 0) [[hi, F.ends[0].conv], [lo, F.ends[1].conv]].forEach(([x, cv]) => g.point([x as number, 0], 6, cv ? { fill: GREEN } : { fill: ctx.dark ? '#0d1017' : '#f7f8fa', color: GREEN, width: 2 }));
        else g.point([c, 0], 6, { fill: GREEN });
      } else g.line([g.view.x0, 0], [g.view.x1, 0], { color: GREEN, width: 5, alpha: 0.8 });
      for (let n = Math.max(F.n0, N - 5); n < N; n++) g.fn((x) => S(x, n), { color: rgba(VIOLET, 0.15 + 0.08 * (n - N + 5)), width: 1.1 });
      if (F.f) g.fn(fx, { color: t, width: 3 });
      g.fn((x) => S(x), { color: GOLD, width: 2.4 });
      const sx = S(x0);
      g.line([x0, 0], [x0, clamp(sx, g.view.y0, g.view.y1)], { color: BLUE, width: 1.2, dash: [3, 4] });
      g.handle({ id: 'x0', at: [x0, Number.isFinite(sx) ? clamp(sx, g.view.y0, g.view.y1) : 0], color: BLUE, label: 'x₀', onDrag: ([x]) => ctx.setParam('x0', +x.toFixed(3)) });
      g.text([g.view.x0, g.view.y1], `${F.label}, u = (x − c)/b`, { color: t, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], `gold: S_${N}(x)${F.f ? '   thick: the sum, where it converges' : ''}`, { color: GOLD, font: FONT }, 10, 40);
      g.text([g.view.x0, g.view.y1], 'green: interval of convergence (● included, ○ excluded)', { color: GREEN, font: FONT }, 10, 58);
    });
    // the partial sums at the probe
    const seq: [number, number][] = [];
    for (let n = F.n0; n <= N; n++) seq.push([n, S(x0, n)]);
    const u0 = U(x0);
    const inside = !Number.isFinite(F.R0) ? true : F.R0 === 0 ? Math.abs(u0) < 1e-12 : Math.abs(u0) < F.R0 - 1e-9;
    const atEnd = Number.isFinite(F.R0) && F.R0 > 0 && Math.abs(Math.abs(u0) - F.R0) <= 1e-9;
    const endInfo = atEnd ? (u0 > 0 ? F.ends[0] : F.ends[1]) : null;
    const conv = inside || !!endInfo?.conv;
    const target = conv && F.f ? F.f(u0) : NaN;
    const vals = seq.map((q) => q[1]).filter(Number.isFinite);
    let ymin = Math.min(0, ...vals, Number.isFinite(target) ? target : 0), ymax = Math.max(0, ...vals, Number.isFinite(target) ? target : 0);
    ymin = Math.max(ymin, -50); ymax = Math.min(ymax, 50);
    const sp = Math.max(ymax - ymin, 0.5);
    Rp.setView({ x0: F.n0 - 1, x1: Math.max(N, 4) + 1, y0: ymin - 0.12 * sp, y1: ymax + 0.25 * sp });
    Rp.setDraw((g) => {
      if (Number.isFinite(target)) { g.line([g.view.x0, target], [g.view.x1, target], { color: t, width: 1.6, dash: [7, 5] }); g.text([g.view.x0, target], `sum = ${fmt(target, 8)}`, { color: t, font: FONT, baseline: 'bottom' }, 8, -6); }
      g.path(seq, { color: rgba(BLUE, 0.5), width: 1.2 });
      seq.forEach((q) => g.point(q, N > 50 ? 2.5 : 3.5, { fill: BLUE }));
      g.text([g.view.x0, g.view.y1], `partial sums at x₀ = ${fmt(x0, 4)}  (u = ${fmt(u0, 4)})`, { color: t, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], conv ? 'converging' : 'diverging', { color: conv ? GREEN : RED, font: '700 14px Inter, sans-serif' }, 10, 42);
    });
    const ival = !Number.isFinite(F.R0) ? '(−∞, ∞)' : F.R0 === 0 ? `{${fmt(c, 3)}} only` : `${F.ends[1].conv ? '[' : '('}${fmt(lo, 4)}, ${fmt(hi, 4)}${F.ends[0].conv ? ']' : ')'}`;
    ctx.setReadouts([
      { label: 'series', value: F.tex, tex: true },
      { label: 'radius R', value: Number.isFinite(R) ? fmt(R, 6) : '∞' },
      { label: 'interval of convergence', value: ival },
      ...(Number.isFinite(F.R0) && F.R0 > 0 ? [{ label: `right end x = ${fmt(hi, 4)}`, value: `${F.ends[0].conv ? 'converges' : 'diverges'} — ${F.ends[0].why}`, tone: (F.ends[0].conv ? 'good' : 'bad') as 'good' | 'bad' }, { label: `left end x = ${fmt(lo, 4)}`, value: `${F.ends[1].conv ? 'converges' : 'diverges'} — ${F.ends[1].why}`, tone: (F.ends[1].conv ? 'good' : 'bad') as 'good' | 'bad' }] : []),
      { label: `S_${N}(x₀)`, value: fmt(S(x0), 10) },
      ...(Number.isFinite(target) ? [{ label: `sum at x₀: ${F.fTeX}`, value: fmt(target, 10) }] : []),
      { label: 'at the probe', value: inside ? 'inside: converges absolutely' : endInfo ? `endpoint: ${endInfo.conv ? 'converges' : 'diverges'}` : 'outside: diverges (terms do not → 0)', tone: conv ? 'good' : 'bad' },
    ]);
    ctx.warn(atEnd && N < 60 && endInfo?.conv && key === 'log' ? 'At this endpoint convergence is slow (error ≈ 1/N): raise N to see it.' : '');
    ctx.setNote(key === 'fact' ? 'The ratio $|a_{n+1}/a_n| = (n+1)|u| \\to \\infty$ for every $u \\ne 0$: radius zero. Such series still appear in physics — as *asymptotic* series (e.g. perturbation theory in QED) — useful when truncated early, never summed.' : `Inside $|x - c| < R$ the series converges absolutely (ratio test). Outside, its terms do not tend to $0$. The endpoints need their own test.`);
    void muted;
  };
  let clock = 0;
  return {
    update,
    tick(dt) { clock += dt; if (clock < 0.25) return; clock = 0; const N = Math.round(ctx.params.N); ctx.setParam('N', N >= 80 ? 0 : N + 1); update(); },
    dispose() {},
  };
}
