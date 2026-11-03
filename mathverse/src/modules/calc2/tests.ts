// Convergence tests, visualised: the integral test (rectangles above and below
// the curve), direct and limit comparison (two series side by side), and the
// ratio test (the ratio sequence a_{n+1}/a_n approaching L, against 1).

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { zeta, logFactorial } from '../../core/numeric/taylor';
import { fmt, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, RED, VIOLET, FONT, safeTutorial, customAxes } from './util';

type Kind = 'integral' | 'compare' | 'ratio';
interface Case {
  label: string; kind: Kind; n0: number; a: (n: number, p: number) => number; tex: string;
  /** comparison series b_n, ratio limit L */
  b?: (n: number) => number; bTeX?: string; L?: number; LTeX?: string;
  conv: (p: number) => boolean; why: (p: number) => string; sum?: (p: number) => number | null; logA?: (n: number) => number;
}

const CASES: Record<string, Case> = {
  int: { label: 'integral test: Σ 1/nᵖ vs ∫ dx/xᵖ', kind: 'integral', n0: 1, a: (n, p) => Math.pow(n, -p), tex: '\\sum \\frac{1}{n^p} \\;\\text{vs}\\; \\int_1^\\infty \\frac{dx}{x^p}', conv: (p) => p > 1, why: (p) => (p > 1 ? `∫₁^∞ x^(−p) dx = 1/(p − 1) is finite, and S_N ≤ 1 + ∫₁^N: bounded and increasing` : `∫₁^N x^(−p) dx → ∞, and S_N ≥ ∫₁^(N+1): pushed to infinity`), sum: (p) => (p > 1 ? zeta(p) : null) },
  cmp1: { label: 'comparison: 1/(n² + n + 1) ≤ 1/n²', kind: 'compare', n0: 1, a: (n) => 1 / (n * n + n + 1), b: (n) => 1 / (n * n), tex: '\\sum \\frac{1}{n^2+n+1}', bTeX: '\\sum \\frac{1}{n^2} = \\frac{\\pi^2}{6}', conv: () => true, why: () => 'smaller than the terms of a convergent series: its partial sums are bounded by π²/6', sum: () => null },
  cmp2: { label: 'comparison: ln n / n ≥ 1/n', kind: 'compare', n0: 1, a: (n) => Math.log(n) / n, b: (n) => 1 / n, tex: '\\sum \\frac{\\ln n}{n}', bTeX: '\\sum \\frac1n = \\infty', conv: () => false, why: () => 'larger (for n ≥ 3) than the terms of the divergent harmonic series', sum: () => null },
  cmp3: { label: 'limit comparison: (n + 1)/(n³ + 2) ~ 1/n²', kind: 'compare', n0: 1, a: (n) => (n + 1) / (n ** 3 + 2), b: (n) => 1 / (n * n), tex: '\\sum \\frac{n+1}{n^3+2}', bTeX: '\\sum \\frac{1}{n^2}', L: 1, conv: () => true, why: () => 'a_n/b_n → 1, a positive finite limit: both converge or both diverge — and Σ1/n² converges', sum: () => null },
  r1: { label: 'ratio test: Σ 2ⁿ/n!', kind: 'ratio', n0: 0, a: (n) => Math.exp(n * Math.LN2 - logFactorial(n)), logA: (n) => n * Math.LN2 - logFactorial(n), tex: '\\sum \\frac{2^n}{n!}', L: 0, LTeX: '0', conv: () => true, why: () => 'a_{n+1}/a_n = 2/(n + 1) → 0 < 1 (the sum is e² = 7.389…)', sum: () => Math.exp(2) },
  r2: { label: 'ratio test: Σ n³/2ⁿ', kind: 'ratio', n0: 1, a: (n) => n ** 3 / 2 ** n, logA: (n) => 3 * Math.log(n) - n * Math.LN2, tex: '\\sum \\frac{n^3}{2^n}', L: 0.5, LTeX: '\\tfrac12', conv: () => true, why: () => 'a_{n+1}/a_n = ½(1 + 1/n)³ → ½ < 1: eventually like a geometric series with ratio ½ (sum 26)', sum: () => 26 },
  r3: { label: 'ratio test: Σ n!/nⁿ', kind: 'ratio', n0: 1, a: (n) => Math.exp(logFactorial(n) - n * Math.log(n)), logA: (n) => logFactorial(n) - n * Math.log(n), tex: '\\sum \\frac{n!}{n^n}', L: 1 / Math.E, LTeX: '\\tfrac1e', conv: () => true, why: () => 'a_{n+1}/a_n = (n/(n + 1))ⁿ → 1/e < 1', sum: () => null },
  r4: { label: 'ratio test fails: Σ 1/n²', kind: 'ratio', n0: 1, a: (n) => 1 / (n * n), logA: (n) => -2 * Math.log(n), tex: '\\sum \\frac{1}{n^2}', L: 1, LTeX: '1', conv: () => true, why: () => 'L = 1: the ratio test is inconclusive. (It converges — by the p-test.)', sum: () => Math.PI ** 2 / 6 },
  r5: { label: 'ratio test fails: Σ 1/n', kind: 'ratio', n0: 1, a: (n) => 1 / n, logA: (n) => -Math.log(n), tex: '\\sum \\frac{1}{n}', L: 1, LTeX: '1', conv: () => false, why: () => 'L = 1: inconclusive again. (It diverges — the harmonic series.) The ratio test only sees geometric rates.', sum: () => null },
  r6: { label: 'ratio test: Σ nⁿ/n!  (diverges)', kind: 'ratio', n0: 1, a: (n) => Math.exp(n * Math.log(n) - logFactorial(n)), logA: (n) => n * Math.log(n) - logFactorial(n), tex: '\\sum \\frac{n^n}{n!}', L: Math.E, LTeX: 'e', conv: () => false, why: () => 'a_{n+1}/a_n = (1 + 1/n)ⁿ → e > 1: the terms grow', sum: () => null },
};

export const testsDemo: DemoDef = {
  id: 'calc2.tests', module: 'calc2', title: 'Convergence tests', topic: 'Integral, comparison, limit comparison and ratio tests',
  summary: 'You rarely know a series’ sum — but you can often prove it converges. Compare it with an integral, with a series you know, or with a geometric series through the ratio of successive terms.',
  tex: 'L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|:\\quad L < 1 \\Rightarrow \\text{converges},\\ L > 1 \\Rightarrow \\text{diverges}',
  view: 'split2d',
  params: [
    { key: 'N', label: 'terms shown N', value: 12, min: 3, max: 120, step: 1 },
    { key: 'p', label: 'p (integral test)', value: 2, min: 0.3, max: 3, step: 0.01 },
  ],
  choices: [{ key: 'c', label: 'Test and series', value: 'int', options: Object.entries(CASES).map(([k, c]) => [k, c.label] as [string, string]) }],
  experiments: [
    'Integral test: the blue rectangles (heights a_n) sit above the curve on [n, n + 1] and below it on [n − 1, n]. So the sum and the integral converge or diverge together.',
    'Slide p through 1 in the integral test: the integral’s area and the partial sums both blow up.',
    'Comparison: the smaller series’ partial sums stay under the bigger one’s limit — bounded and increasing, so they converge.',
    'Ratio test on n³/2ⁿ: the ratios start above 1 (terms grow at first!) but settle at ½. Only the limit matters.',
    'Ratio test on 1/n² and 1/n: both give L = 1, yet one converges and one diverges. L = 1 decides nothing.',
  ],
  connections: ['calc2.series', 'calc2.improper', 'calc2.powerseries'],
  accuracy: 'Terms with factorials are computed through logarithms (exact to ~1e−13 relative). Sums shown as exact are closed forms (ζ(p) by Euler–Maclaurin); the rest are partial sums only — a test proves convergence without giving the value.',
  tutorial: safeTutorial([
    { text: '**The integral test.** For a positive decreasing $f$ with $a_n = f(n)$, the rectangles of height $a_n$ fit **above** the curve on $[n, n+1]$ and **below** it on $[n-1, n]$. Hence $\\int_1^{N+1} f \\le S_N \\le a_1 + \\int_1^N f$.', set: { choices: { c: 'int' }, params: { p: 2, N: 8 } }, task: 'Read the two bounds on S_N in the readouts.' },
    { text: 'So $\\sum f(n)$ and $\\int_1^\\infty f$ converge or diverge **together**. For $f = 1/x^p$ that gives the p-test: convergent iff $p > 1$.', task: 'Set p = 1: the lower bound ln(N + 1) grows without limit, dragging S_N along.', done: (c) => Math.abs(c.params.p - 1) < 0.02 },
    { text: '**Direct comparison.** If $0 \\le a_n \\le b_n$ and $\\sum b_n$ converges, so does $\\sum a_n$: its partial sums increase and are bounded. Divergence passes the other way: bigger than divergent diverges.', set: { choices: { c: 'cmp1' }, params: { N: 30 } } },
    { text: '**Limit comparison.** Inequalities can be awkward; a limit is easier. If $a_n/b_n \\to c$ with $0 < c < \\infty$, the two series share their fate. $\\frac{n+1}{n^3+2}$ behaves like $\\frac{1}{n^2}$ — keep the dominant powers.', set: { choices: { c: 'cmp3' } }, task: 'Watch the ratio a_n/b_n approach 1 (right plot).' },
    { text: '**The ratio test** compares with a geometric series: if $a_{n+1}/a_n \\to L < 1$, the terms eventually shrink at least as fast as $r^n$ for any $r$ between $L$ and 1. Factorials and exponentials make it shine. On the left, $\\log a_n$ — a geometric decay is a straight line.', set: { choices: { c: 'r2' }, params: { N: 40 } }, task: 'See the ratios approach ½ from above.' },
    { text: '**When it fails.** For every p-series the ratio tends to 1 — too slow to be geometric — so the ratio test cannot decide. Use the integral or comparison test instead.', set: { choices: { c: 'r4' } }, task: 'Switch between “Σ 1/n²” and “Σ 1/n”: same L, opposite verdicts.' },
  ]),
  create: (ctx) => createTests(ctx),
};

function createTests(ctx: DemoCtx): DemoInstance {
  const Lp = ctx.plot!, Rp = ctx.plot2!;
  const update = () => {
    const key = CASES[ctx.choices.c] ? ctx.choices.c : 'int';
    const C = CASES[key], N = Math.round(ctx.params.N), p = ctx.params.p;
    const t = ink(ctx);
    const conv = C.conv(p);
    let SN = 0; const sums: number[] = [];
    for (let n = C.n0; n <= N; n++) { SN += C.a(n, p); sums.push(SN); }
    const rows: { label: string; value: string; tex?: boolean; tone?: 'good' | 'bad' | 'warn' | 'muted' }[] = [{ label: 'series', value: C.tex, tex: true }, { label: `S_${N}`, value: fmt(SN, 10) }];
    Lp.opts.axes = true; Lp.opts.grid = true; Rp.opts.axes = true; Rp.opts.grid = true;

    if (C.kind === 'integral') {
      Lp.opts.xLabel = 'x'; Lp.opts.yLabel = 'y'; Rp.opts.xLabel = 'N'; Rp.opts.yLabel = 'S_N';
      const f = (x: number) => Math.pow(x, -p);
      const top = Math.min(N + 1, 30);
      Lp.setView({ x0: -0.3, x1: top + 0.6, y0: -0.12, y1: 1.25 });
      Lp.setDraw((g) => {
        for (let n = 1; n <= top; n++) {
          g.polygon([[n, 0], [n + 1, 0], [n + 1, f(n)], [n, f(n)]], { fill: rgba(BLUE, 0.22), color: BLUE, width: 1 });
          if (n >= 2) g.polygon([[n - 1, 0], [n, 0], [n, f(n)], [n - 1, f(n)]], { fill: rgba(GOLD, 0.18), color: rgba(GOLD, 0.6), width: 1, dash: [3, 3] });
        }
        g.fillBetween(f, () => 0, 1, top, { fill: rgba(VIOLET, 0.12) });
        g.fn(f, { color: t, width: 2.6 }, [0.35, top + 0.5]);
        g.text([g.view.x1, g.view.y1], 'blue: aₙ on [n, n+1] — above the curve', { color: BLUE, font: FONT, align: 'right' }, -12, 22);
        g.text([g.view.x1, g.view.y1], 'gold: aₙ on [n−1, n] — below the curve', { color: GOLD, font: FONT, align: 'right' }, -12, 40);
        g.text([g.view.x1, g.view.y1], `curve y = 1/x^${fmt(p, 3)}`, { color: t, font: FONT, align: 'right' }, -12, 58);
      });
      const I = (x: number) => (Math.abs(p - 1) < 1e-12 ? Math.log(x) : (Math.pow(x, 1 - p) - 1) / (1 - p));
      const lim = C.sum?.(p) ?? null;
      const hiB: [number, number][] = [], loB: [number, number][] = [];
      for (let n = 1; n <= N; n++) { loB.push([n, I(n + 1)]); hiB.push([n, 1 + I(n)]); }
      const ymax = Math.max(...hiB.map((q) => q[1]), lim ?? 0) * 1.15;
      Rp.setView({ x0: -0.5, x1: N + 1, y0: -0.1 * ymax, y1: ymax });
      Rp.setDraw((g) => {
        g.polygon([...hiB, ...loB.slice().reverse()], { fill: rgba(VIOLET, 0.18) });
        g.path(hiB, { color: VIOLET, width: 1.4, dash: [5, 4] }); g.path(loB, { color: VIOLET, width: 1.4, dash: [5, 4] });
        if (lim !== null) { g.line([g.view.x0, lim], [g.view.x1, lim], { color: GOLD, width: 1.6, dash: [7, 5] }); g.text([g.view.x0, lim], `ζ(${fmt(p, 3)}) = ${fmt(lim, 8)}`, { color: GOLD, font: FONT, baseline: 'bottom' }, 8, -6); }
        sums.forEach((s, i) => g.point([i + 1, s], 3.5, { fill: BLUE }));
        g.text([g.view.x0, g.view.y1], 'band: ∫₁^(N+1) f ≤ S_N ≤ a₁ + ∫₁^N f', { color: VIOLET, font: FONT }, 10, 22);
      });
      rows.push({ label: 'lower bound ∫₁^(N+1) x^(−p) dx', value: fmt(I(N + 1), 10) }, { label: 'upper bound 1 + ∫₁^N x^(−p) dx', value: fmt(1 + I(N), 10) });
      if (lim !== null) rows.push({ label: 'sum ζ(p)', value: fmt(lim, 12) });
    } else if (C.kind === 'compare') {
      Lp.opts.xLabel = 'n'; Lp.opts.yLabel = ''; Rp.opts.xLabel = 'N'; Rp.opts.yLabel = '';
      const b = C.b!;
      const as: number[] = [], bs: number[] = [];
      for (let n = 1; n <= N; n++) { as.push(C.a(n, p)); bs.push(b(n)); }
      const m = Math.max(...as, ...bs);
      Lp.setView({ x0: -0.5, x1: N + 1, y0: -0.1 * m, y1: m * 1.25 });
      Lp.setDraw((g) => {
        bs.forEach((v, i) => { g.line([i + 1 + 0.15, 0], [i + 1 + 0.15, v], { color: GOLD, width: 2 }); g.point([i + 1 + 0.15, v], 3, { fill: GOLD }); });
        as.forEach((v, i) => { g.line([i + 1 - 0.15, 0], [i + 1 - 0.15, v], { color: BLUE, width: 2 }); g.point([i + 1 - 0.15, v], 3, { fill: BLUE }); });
        g.text([g.view.x1, g.view.y1], 'blue: aₙ (the series under test)', { color: BLUE, font: FONT, align: 'right' }, -12, 22);
        g.text([g.view.x1, g.view.y1], 'gold: bₙ (the series we know)', { color: GOLD, font: FONT, align: 'right' }, -12, 40);
      });
      let SB = 0; const sb: number[] = []; for (const v of bs) { SB += v; sb.push(SB); }
      const lcmp = key === 'cmp3';
      if (lcmp) {
        const ratios = as.map((v, i) => v / bs[i]);
        Rp.setView({ x0: -0.5, x1: N + 1, y0: 0, y1: Math.max(...ratios, 1) * 1.3 });
        Rp.setDraw((g) => {
          g.line([g.view.x0, 1], [g.view.x1, 1], { color: GOLD, width: 1.6, dash: [7, 5] });
          ratios.forEach((r, i) => g.point([i + 1, r], 4, { fill: VIOLET }));
          g.text([g.view.x0, g.view.y1], 'aₙ / bₙ → 1', { color: VIOLET, font: FONT }, 10, 22);
        });
        rows.push({ label: `a_N / b_N`, value: fmt(as[N - 1] / bs[N - 1], 8) });
      } else {
        const bl = key === 'cmp1' ? Math.PI ** 2 / 6 : null;
        const top = Math.max(SB, SN, bl ?? 0) * 1.2;
        Rp.setView({ x0: -0.5, x1: N + 1, y0: -0.05 * top, y1: top });
        Rp.setDraw((g) => {
          if (bl !== null) { g.line([g.view.x0, bl], [g.view.x1, bl], { color: GOLD, width: 1.6, dash: [7, 5] }); g.text([g.view.x0, bl], 'π²/6: a ceiling for both', { color: GOLD, font: FONT, baseline: 'bottom' }, 8, -6); }
          sb.forEach((s, i) => g.point([i + 1, s], 3.5, { fill: GOLD }));
          sums.forEach((s, i) => g.point([i + 1, s], 3.5, { fill: BLUE }));
          g.text([g.view.x0, g.view.y1], key === 'cmp1' ? 'blue partial sums stay below gold ones' : 'blue partial sums stay above the divergent gold ones', { color: t, font: FONT }, 10, 22);
        });
        rows.push({ label: `known series: Σ b_n to N`, value: fmt(SB, 10) });
      }
      rows.push({ label: 'comparison series', value: C.bTeX!, tex: true });
    } else {
      // ratio test
      Lp.opts.axes = false; Lp.opts.grid = false; Lp.opts.xLabel = 'n';
      Rp.opts.xLabel = 'n'; Rp.opts.yLabel = 'aₙ₊₁ / aₙ';
      const logs: [number, number][] = [];
      for (let n = C.n0; n <= N; n++) logs.push([n, C.logA!(n) / Math.LN10]);
      const ly = logs.map((q) => q[1]);
      const lo = Math.min(...ly), hi = Math.max(...ly), sp = Math.max(hi - lo, 1);
      Lp.setView({ x0: C.n0 - 1, x1: N + 1, y0: lo - 0.1 * sp, y1: hi + 0.25 * sp });
      Lp.setDraw((g) => {
        customAxes(g, ctx.dark, { yLog: true, xLabel: 'n', yLabel: 'aₙ (log scale)' });
        g.path(logs, { color: rgba(BLUE, 0.5), width: 1.2 });
        logs.forEach((q) => g.point(q, 3.5, { fill: BLUE }));
        if (C.L !== undefined && C.L > 0) {
          // a geometric series with ratio L, matched at n = N: a straight line on this plot
          const last = logs[logs.length - 1], s = Math.log10(C.L);
          g.line([C.n0, last[1] - s * (N - C.n0)], [N, last[1]], { color: GOLD, width: 1.4, dash: [6, 4] });
          g.text([g.view.x1, g.view.y1], `dashed: geometric, ratio L = ${fmt(C.L, 4)}`, { color: GOLD, font: FONT, align: 'right' }, -12, 40);
        }
        g.text([g.view.x1, g.view.y1], 'log₁₀ aₙ: geometric decay is a straight line', { color: t, font: FONT, align: 'right' }, -12, 22);
      });
      const ratios: [number, number][] = [];
      for (let n = C.n0; n < N; n++) ratios.push([n, Math.exp(C.logA!(n + 1) - C.logA!(n))]);
      const rmax = Math.max(1.3, ...ratios.map((q) => q[1]), (C.L ?? 0) * 1.2);
      Rp.setView({ x0: C.n0 - 1, x1: N + 1, y0: -0.08 * rmax, y1: rmax * 1.12 });
      Rp.setDraw((g) => {
        g.fillBetween(() => Math.min(1, g.view.y1), () => 0, g.view.x0, g.view.x1, { fill: rgba(GREEN, 0.07) }, 4);
        g.line([g.view.x0, 1], [g.view.x1, 1], { color: RED, width: 1.6 });
        g.text([g.view.x1, 1], 'L = 1: no decision', { color: RED, font: FONT, align: 'right', baseline: 'bottom' }, -10, -6);
        g.text([g.view.x1, 0], 'L < 1: converges', { color: GREEN, font: FONT, align: 'right', baseline: 'bottom' }, -10, -6);
        if (C.L !== undefined) { g.line([g.view.x0, C.L], [g.view.x1, C.L], { color: GOLD, width: 1.6, dash: [7, 5] }); g.text([g.view.x0, C.L], `L = ${fmt(C.L, 5)}`, { color: GOLD, font: FONT, baseline: 'bottom' }, 8, -6); }
        ratios.forEach((q) => g.point(q, 4, { fill: VIOLET }));
      });
      const lastR = ratios.length ? ratios[ratios.length - 1][1] : NaN;
      rows.push({ label: `a_${N}/a_${N - 1}`, value: fmt(lastR, 8) }, { label: 'limit L', value: C.LTeX ?? '', tex: true });
      const s = C.sum?.(p);
      if (s != null) rows.push({ label: 'sum (closed form)', value: fmt(s, 10) });
    }
    rows.push({ label: 'verdict', value: `${conv ? 'converges' : 'diverges'}: ${C.why(p)}`, tone: conv ? 'good' : 'bad' });
    ctx.setReadouts(rows);
    ctx.warn(C.kind === 'integral' && N > 30 ? 'The left plot shows the first 30 rectangles; the sums use all N terms.' : '');
    ctx.setNote(C.kind === 'integral' ? 'The integral test turns a sum into an area you can compute. It needs $f$ positive and decreasing; it proves convergence but does not give the sum (only bounds).' : C.kind === 'compare' ? 'Comparison needs positive terms: $0 \\le a_n \\le b_n$. Keep the dominant powers of $n$ to choose $b_n$.' : 'The ratio test compares with a geometric series. It decides when $L \\ne 1$, and is the natural tool for factorials, exponentials and power series.');
    void clamp; void muted;
  };
  return { update, dispose() {} };
}
