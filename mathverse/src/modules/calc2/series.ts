// Sequences and series: the terms a_n (left) and the partial sums S_N
// (right), with the exact sum where one exists and a certified bound on the
// remaining error — geometric, harmonic and p-series, alternating series
// (with the alternating-series error band), telescoping and e.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { zeta, zetaTail, eta, EULER_GAMMA, logFactorial } from '../../core/numeric/taylor';
import { fmt, ink, muted, rgba, BLUE, GOLD, GREEN, RED, VIOLET, FONT, safeTutorial } from './util';

interface Ser {
  label: string; n0: number; a: (n: number, q: number) => number; tex: (q: number) => string;
  sum: (q: number) => number; sumTeX: (q: number) => string;
  /** a proven bound on |S − S_N|, with the reason */
  bound?: (N: number, q: number) => { v: number; why: string } | null;
  verdict: (q: number) => { conv: boolean; why: string }; alt?: boolean; usesQ: boolean;
}

const SERIES_LIST: Record<string, Ser> = {
  geom: {
    label: 'geometric Σ rⁿ', n0: 0, a: (n, r) => Math.pow(r, n), tex: () => '\\sum_{n=0}^\\infty r^n', usesQ: true,
    sum: (r) => (Math.abs(r) < 1 ? 1 / (1 - r) : NaN), sumTeX: (r) => (Math.abs(r) < 1 ? `\\frac{1}{1-r} = ${fmt(1 / (1 - r), 8)}` : '\\text{none}'),
    bound: (N, r) => (Math.abs(r) < 1 ? { v: Math.abs(r) ** (N + 1) / Math.abs(1 - r), why: 'exact: S − S_N = r^(N+1)/(1 − r)' } : null),
    verdict: (r) => (Math.abs(r) < 1 ? { conv: true, why: '|r| < 1: S_N = (1 − r^(N+1))/(1 − r) and r^(N+1) → 0' } : { conv: false, why: '|r| ≥ 1: the terms do not tend to 0 (n-th term test)' }),
  },
  harmonic: {
    label: 'harmonic Σ 1/n', n0: 1, a: (n) => 1 / n, tex: () => '\\sum_{n=1}^\\infty \\frac1n', usesQ: false,
    sum: () => Infinity, sumTeX: () => '\\infty',
    verdict: () => ({ conv: false, why: 'terms → 0, yet S_N ≈ ln N + γ → ∞ (integral test with ∫dx/x)' }),
  },
  p: {
    label: 'p-series Σ 1/nᵖ', n0: 1, a: (n, p) => Math.pow(n, -p), tex: () => '\\sum_{n=1}^\\infty \\frac{1}{n^p}', usesQ: true,
    sum: (p) => (p > 1 ? zeta(p) : Infinity), sumTeX: (p) => (p > 1 ? (Math.abs(p - 2) < 1e-9 ? `\\frac{\\pi^2}{6} = ${fmt(zeta(2), 9)}` : Math.abs(p - 4) < 1e-9 ? `\\frac{\\pi^4}{90} = ${fmt(zeta(4), 9)}` : `\\zeta(${fmt(p, 3)}) = ${fmt(zeta(p), 9)}`) : '\\infty'),
    bound: (N, p) => (p > 1 ? { v: Math.pow(N, 1 - p) / (p - 1), why: 'integral test: S − S_N ≤ ∫_N^∞ x^(−p) dx = N^(1−p)/(p − 1)' } : null),
    verdict: (p) => (p > 1 ? { conv: true, why: `p = ${fmt(p, 3)} > 1 (integral test / p-test)` } : { conv: false, why: `p = ${fmt(p, 3)} ≤ 1 (integral test / p-test)` }),
  },
  alt: {
    label: 'alternating Σ (−1)ⁿ⁺¹/nᵖ', n0: 1, a: (n, p) => (n % 2 ? 1 : -1) * Math.pow(n, -p), tex: () => '\\sum_{n=1}^\\infty \\frac{(-1)^{n+1}}{n^p}', usesQ: true, alt: true,
    sum: (p) => (p > 0 ? eta(p) : NaN), sumTeX: (p) => (p > 0 ? (Math.abs(p - 1) < 1e-9 ? `\\ln 2 = ${fmt(Math.LN2, 9)}` : `\\eta(${fmt(p, 3)}) = ${fmt(eta(p), 9)}`) : '\\text{none}'),
    bound: (N, p) => (p > 0 ? { v: Math.pow(N + 1, -p), why: 'alternating series test: |S − S_N| ≤ |a_(N+1)|' } : null),
    verdict: (p) => (p > 0 ? { conv: true, why: p > 1 ? 'absolutely (Σ1/nᵖ converges)' : 'conditionally: terms alternate and decrease to 0, but Σ|a_n| diverges' } : { conv: false, why: 'terms do not tend to 0' }),
  },
  leibniz: {
    label: 'Leibniz Σ (−1)ⁿ/(2n+1)', n0: 0, a: (n) => (n % 2 ? -1 : 1) / (2 * n + 1), tex: () => '\\sum_{n=0}^\\infty \\frac{(-1)^n}{2n+1}', usesQ: false, alt: true,
    sum: () => Math.PI / 4, sumTeX: () => `\\frac{\\pi}{4} = ${fmt(Math.PI / 4, 9)}`,
    bound: (N) => ({ v: 1 / (2 * N + 3), why: 'alternating series test: |S − S_N| ≤ |a_(N+1)|' }),
    verdict: () => ({ conv: true, why: 'conditionally (alternating, decreasing to 0); it is arctan 1' }),
  },
  tele: {
    label: 'telescoping Σ 1/(n(n+1))', n0: 1, a: (n) => 1 / (n * (n + 1)), tex: () => '\\sum_{n=1}^\\infty \\frac{1}{n(n+1)}', usesQ: false,
    sum: () => 1, sumTeX: () => '1',
    bound: (N) => ({ v: 1 / (N + 1), why: 'exact: 1/(n(n+1)) = 1/n − 1/(n+1), so S_N = 1 − 1/(N+1)' }),
    verdict: () => ({ conv: true, why: 'the partial sums telescope to 1 − 1/(N+1)' }),
  },
  e: {
    label: 'Σ 1/n!  (= e)', n0: 0, a: (n) => Math.exp(-logFactorial(n)), tex: () => '\\sum_{n=0}^\\infty \\frac{1}{n!}', usesQ: false,
    sum: () => Math.E, sumTeX: () => `e = ${fmt(Math.E, 9)}`,
    bound: (N) => ({ v: Math.exp(-logFactorial(N + 1)) * (N + 2) / (N + 1), why: 'tail < a_(N+1)·(1 + 1/(N+2) + 1/(N+2)² + …)' }),
    verdict: () => ({ conv: true, why: 'ratio test: a_{n+1}/a_n = 1/(n+1) → 0' }),
  },
  grandi: {
    label: 'Grandi Σ (−1)ⁿ', n0: 0, a: (n) => (n % 2 ? -1 : 1), tex: () => '\\sum_{n=0}^\\infty (-1)^n', usesQ: false, alt: true,
    sum: () => NaN, sumTeX: () => '\\text{none}',
    verdict: () => ({ conv: false, why: 'the terms do not tend to 0: S_N = 1, 0, 1, 0, … never settles' }),
  },
};

export const seriesDemo: DemoDef = {
  id: 'calc2.series', module: 'calc2', title: 'Sequences and series', topic: 'Infinite series, partial sums, geometric/harmonic/p-series, alternating series error bound',
  summary: 'A series is the limit of its partial sums S_N = a₁ + … + a_N. Watch the terms (left) and the partial sums (right): do the sums settle on a number?',
  tex: '\\sum_{n=1}^\\infty a_n = \\lim_{N\\to\\infty} S_N,\\qquad S_N = \\sum_{n=1}^N a_n',
  view: 'split2d', animated: true,
  params: [
    { key: 'N', label: 'number of terms N (play to add terms)', value: 10, min: 1, max: 400, step: 1 },
    { key: 'q', label: 'r (geometric) or p (p-series, alternating)', value: 0.6, min: -1.5, max: 3, step: 0.01 },
  ],
  choices: [{ key: 's', label: 'Series', value: 'geom', options: Object.entries(SERIES_LIST).map(([k, s]) => [k, s.label] as [string, string]) }],
  toggles: [{ key: 'band', label: 'Show the error bound around S_N', value: true }],
  experiments: [
    'Geometric with r = 0.6: the sums approach 1/(1 − r) = 2.5. With r = −0.6 they zig-zag in. With r = 1 they climb without bound.',
    'Harmonic: the terms go to 0 but the sums still diverge — like ln N. Terms tending to zero is necessary, not sufficient.',
    'p-series with p = 2: the sums approach π²/6 (Euler, 1734). Lower p toward 1 and watch convergence get slower, then fail.',
    'Alternating with p = 1: the sum is ln 2, and the true sum always lies between two consecutive partial sums — the band.',
    'Grandi’s series: 1 − 1 + 1 − … The partial sums never settle: no sum.',
  ],
  connections: ['calc2.tests', 'calc2.taylor', 'calc2.powerseries', 'calc2.improper'],
  accuracy: 'Partial sums are exact floating-point sums. Limits are exact where shown in closed form; ζ(p) is Euler–Maclaurin summation and η(p) the Cohen–Villegas–Zagier acceleration (both ≈1e−15). Error bounds are proven inequalities (integral test, alternating series test), not estimates.',
  tutorial: safeTutorial([
    { text: '**Partial sums.** An infinite sum means: add the first $N$ terms, $S_N$, and ask whether $S_N$ approaches a limit. Left: the terms $a_n$. Right: the running totals $S_N$.', set: { choices: { s: 'geom' }, params: { q: 0.6, N: 5 }, toggles: { band: true } }, task: 'Press play to add terms one at a time.' },
    { text: '**Geometric series.** $S_N = 1 + r + \\dots + r^N = \\frac{1 - r^{N+1}}{1 - r}$. If $|r| < 1$ then $r^{N+1}\\to 0$ and $S = \\frac{1}{1-r}$. Physics: a ball bouncing with restitution $r$ travels a finite total distance.', task: 'Set r = 1 and watch the sums grow without bound.', done: (c) => Math.abs(c.params.q - 1) < 0.02 },
    { text: '**The n-th term test.** If $a_n \\not\\to 0$ the series diverges. But $a_n \\to 0$ is *not enough*: the harmonic series $\\sum 1/n$ diverges, growing like $\\ln N$.', set: { choices: { s: 'harmonic' }, params: { N: 50 } }, task: 'Increase N to 400 and compare S_N with ln N + γ.', done: (c) => c.params.N >= 390 },
    { text: '**p-series.** $\\sum 1/n^p$ converges exactly when $p > 1$ — the same rule as $\\int_1^\\infty dx/x^p$ (the integral test). For $p = 2$ the sum is $\\pi^2/6$.', set: { choices: { s: 'p' }, params: { q: 2, N: 20 } }, task: 'Slide p down to 1.05: still convergent, but painfully slowly.' },
    { text: '**Alternating series.** If the terms alternate in sign and decrease to 0, the series converges, and the limit is trapped between consecutive partial sums: $|S - S_N| \\le |a_{N+1}|$. The band shows this guarantee.', set: { choices: { s: 'alt' }, params: { q: 1, N: 10 }, toggles: { band: true } }, task: 'Check that the true sum ln 2 stays inside the band for every N.' },
    { text: '**Conditional convergence.** $\\sum (-1)^{n+1}/n$ converges, but $\\sum 1/n$ does not: the convergence depends on cancellation. (Riemann: such a series can be rearranged to sum to any number you like.)' },
  ]),
  create: (ctx) => createSeries(ctx),
};

function createSeries(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  L.opts.xLabel = 'n'; L.opts.yLabel = 'aₙ'; R.opts.xLabel = 'N'; R.opts.yLabel = 'S_N';
  const update = () => {
    const key = SERIES_LIST[ctx.choices.s] ? ctx.choices.s : 'geom';
    const S = SERIES_LIST[key], q = ctx.params.q, N = Math.max(1, Math.round(ctx.params.N));
    const terms: number[] = [], sums: number[] = [];
    let acc = 0;
    for (let n = S.n0; n <= N; n++) { const a = S.a(n, q); terms.push(a); acc += a; sums.push(acc); }
    const SN = acc, lim = S.sum(q), v = S.verdict(q), bd = S.bound?.(N, q) ?? null;
    const t = ink(ctx);
    // views: fit everything shown
    let amin = 0, amax = 0; terms.forEach((a) => { if (Number.isFinite(a)) { amin = Math.min(amin, a); amax = Math.max(amax, a); } });
    const aspan = Math.max(amax - amin, 1e-9);
    L.setView({ x0: S.n0 - 0.04 * (N - S.n0 + 2) - 0.5, x1: N + 0.04 * (N - S.n0 + 2) + 0.5, y0: amin - 0.12 * aspan, y1: amax + 0.18 * aspan });
    let smin = Math.min(0, ...sums.filter(Number.isFinite)), smax = Math.max(0, ...sums.filter(Number.isFinite));
    if (Number.isFinite(lim)) { smin = Math.min(smin, lim); smax = Math.max(smax, lim); }
    const sspan = Math.max(smax - smin, 1e-9);
    R.setView({ x0: S.n0 - 0.04 * (N - S.n0 + 2) - 0.5, x1: N + 0.04 * (N - S.n0 + 2) + 0.5, y0: smin - 0.12 * sspan, y1: smax + 0.22 * sspan });
    const r = N <= 60 ? 4 : N <= 150 ? 2.5 : 1.6;
    L.setDraw((g) => {
      terms.forEach((a, i) => { const n = S.n0 + i; g.line([n, 0], [n, a], { color: a >= 0 ? BLUE : RED, width: N <= 100 ? 2 : 1 }); g.point([n, a], r, { fill: a >= 0 ? BLUE : RED }); });
      g.text([g.view.x1, g.view.y1], `a_N = ${fmt(terms[terms.length - 1], 6)}`, { color: t, font: FONT, align: 'right' }, -12, 22);
      g.text([g.view.x1, g.view.y1], v.conv || key === 'harmonic' || key === 'p' ? 'terms → 0' : 'terms do NOT → 0', { color: muted(ctx), font: FONT, align: 'right' }, -12, 40);
    });
    R.setDraw((g) => {
      if (Number.isFinite(lim)) { g.line([g.view.x0, lim], [g.view.x1, lim], { color: GOLD, width: 1.8, dash: [7, 5] }); g.text([g.view.x0, lim], `S = ${fmt(lim, 8)}`, { color: GOLD, font: FONT, baseline: 'bottom' }, 8, -6); }
      if (key === 'harmonic') g.fn((x) => (x >= 1 ? Math.log(x) + EULER_GAMMA : NaN), { color: GOLD, width: 1.6, dash: [6, 4] }, [1, N]);
      if (ctx.toggles.band && bd) {
        // the guaranteed interval for S, at every N shown (for alternating series: [S_N − a_{N+1}, S_N + a_{N+1}] narrowed to the side the sum is on)
        const hi: [number, number][] = [], lo: [number, number][] = [];
        sums.forEach((s, i) => {
          const n = S.n0 + i, b = S.bound!(n, q); if (!b) return;
          if (S.alt) { const nxt = S.a(n + 1, q); hi.push([n, Math.max(s, s + nxt)]); lo.push([n, Math.min(s, s + nxt)]); }
          else { hi.push([n, s + b.v]); lo.push([n, s]); }
        });
        if (hi.length > 1) g.polygon([...hi, ...lo.reverse()], { fill: rgba(VIOLET, 0.18) });
      }
      g.path(sums.map((s, i) => [S.n0 + i, s] as [number, number]), { color: rgba(BLUE, 0.6), width: 1.2 });
      sums.forEach((s, i) => g.point([S.n0 + i, s], r, { fill: S.alt ? (i % 2 ? RED : BLUE) : BLUE }));
      g.point([N, SN], 6.5, { fill: GREEN });
      g.text([g.view.x1, g.view.y1], `S_${N} = ${fmt(SN, 10)}`, { color: GREEN, font: '700 14px Inter, sans-serif', align: 'right' }, -12, 58);
      g.text([g.view.x1, g.view.y1], v.conv ? 'converges' : 'diverges', { color: v.conv ? BLUE : RED, font: '700 14px Inter, sans-serif', align: 'right' }, -12, 78);
      g.handle({ id: 'N', at: [N, SN], color: GREEN, onDrag: ([x]) => ctx.setParam('N', Math.max(1, Math.min(400, Math.round(x)))) });
    });
    const err = Number.isFinite(lim) ? lim - SN : NaN;
    ctx.setReadouts([
      { label: 'series', value: S.tex(q), tex: true },
      { label: `S_${N}`, value: fmt(SN, 12) },
      { label: 'sum S', value: S.sumTeX(q), tex: true },
      ...(Number.isFinite(err) ? [{ label: 'actual error S − S_N', value: err === 0 ? '0' : err.toExponential(3) }] : []),
      ...(bd ? [{ label: 'guaranteed bound on |S − S_N|', value: bd.v.toExponential(3), tone: (Math.abs(err) <= bd.v * (1 + 1e-9) ? 'good' : 'bad') as 'good' | 'bad' }, { label: 'why', value: bd.why }] : []),
      ...(key === 'harmonic' ? [{ label: 'S_N − ln N  (→ γ = 0.5772…)', value: fmt(SN - Math.log(N), 8) }] : []),
      ...(key === 'p' && q > 1 ? [{ label: 'tail ζ(p) − S_N (Euler–Maclaurin)', value: zetaTail(q, N).toExponential(3) }] : []),
      { label: 'verdict', value: `${v.conv ? 'converges' : 'diverges'}: ${v.why}`, tone: v.conv ? 'good' : 'bad' },
    ]);
    ctx.setNote(S.usesQ ? '' : '(The r/p slider does not affect this series.)');
  };
  let clock = 0;
  return {
    update,
    tick(dt) { clock += dt; if (clock < 0.08) return; clock = 0; const N = Math.round(ctx.params.N); ctx.setParam('N', N >= 400 ? 1 : N + (N < 40 ? 1 : N < 150 ? 2 : 5)); update(); },
    dispose() {},
  };
}
