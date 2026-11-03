// Fourier series: build a function from sines and cosines, watch the partial
// sums converge (and overshoot at jumps — the Gibbs phenomenon), compare
// full, sine and cosine series (the extensions behind Dirichlet and Neumann
// problems), and read the decay of the coefficients from their log–log plot.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { fourierCoeffs, fourierSum, GIBBS } from '../../core/numeric/pde';
import { integrate } from '../../core/numeric/quad';
import { parse, compile } from '../../core/expr';
import { fmt, pal, alpha, csv } from './common';

const NMAX = 200, PI = Math.PI;
type Kind = 'full' | 'sine' | 'cosine';

const TARGETS: Record<string, { f: (x: number) => number; name: string }> = {
  square: { f: (x) => (x > 0 ? 1 : x < 0 ? -1 : 0), name: 'square wave sgn x' },
  saw: { f: (x) => x / PI, name: 'sawtooth x/π' },
  tri: { f: (x) => 1 - (2 * Math.abs(x)) / PI, name: 'triangle 1 − 2|x|/π' },
  parab: { f: (x) => (x * x) / (PI * PI), name: 'parabola x²/π²' },
  smooth: { f: (x) => Math.exp(Math.cos(x)) / Math.E, name: 'smooth e^{cos x − 1}' },
};

export const fourier: DemoDef = {
  id: 'pde.fourier', module: 'pde', title: 'Fourier series and the Gibbs phenomenon',
  topic: 'Fourier series · sine and cosine series · Gibbs phenomenon · coefficient decay · Fejér sums',
  summary: 'Any reasonable function on (−π, π) is a sum of sines and cosines. Add terms one by one, see the partial sums converge, overshoot by 9% at every jump no matter how many terms, and how smoothness controls the decay of the coefficients.',
  tex: 'f(x) \\sim \\frac{a_0}{2} + \\sum_{n\\ge1} a_n\\cos nx + b_n\\sin nx,\\qquad a_n = \\frac1\\pi\\int_{-\\pi}^{\\pi} f(x)\\cos nx\\,dx,\\ \\ b_n = \\frac1\\pi\\int_{-\\pi}^{\\pi} f(x)\\sin nx\\,dx',
  view: 'split2d',
  params: [{ key: 'N', label: 'number of terms N', value: 9, min: 1, max: NMAX, step: 1 }],
  choices: [
    { key: 'target', label: 'Function', value: 'square', options: [['square', 'square wave'], ['saw', 'sawtooth'], ['tri', 'triangle'], ['parab', 'parabola'], ['smooth', 'smooth (e^cos x)'], ['expr', 'your f(x) below']] },
    { key: 'kind', label: 'Series', value: 'full', options: [['full', 'full on (−π, π)'], ['sine', 'sine series of f on (0, π)'], ['cosine', 'cosine series of f on (0, π)']] },
  ],
  toggles: [{ key: 'fejer', label: 'Fejér (Cesàro) mean instead of S_N', value: false }, { key: 'terms', label: 'Show the first six terms', value: false }],
  input: { label: 'Your f(x) on (−π, π) — choose “your f(x)”', value: 'x*(pi - abs(x))/2', placeholder: 'e.g. abs(sin(x)) or heaviside(x)*x' },
  experiments: [
    'Square wave, N = 1, 3, 9, 49, 199: the wiggle next to the jump gets narrower but its height stays about 9% of the jump.',
    'Turn on the Fejér mean: averaging the partial sums removes the overshoot entirely (at the cost of slower convergence).',
    'Compare the coefficient plots: jumps give slope −1 (b_n ~ 1/n), kinks slope −2 (~1/n²), the smooth function falls off a cliff (exponential decay).',
    'Take the triangle and choose the sine series on (0, π): the odd extension has jumps at ±π, so Gibbs appears where the full series had none.',
    'Type your own f(x), e.g. abs(sin(x)) or exp(x): an exponential is smooth inside but its periodic extension jumps at ±π.',
  ],
  connections: ['pde.heat1d', 'pde.separation', 'pde.wave', 'pde.bc'],
  accuracy: `Coefficients are computed by adaptive Gauss–Kronrod quadrature (tolerance 1e−10 each; the summed error estimate is reported). The overshoot readout measures max S_N above max f as a fraction of the range of f; for a jump it tends to the Gibbs constant ${GIBBS.toFixed(4)}… (the limit is exact: (1/π)Si(π) − ½). Your f(x) is parsed safely, never evaluated as code.`,
  create: (ctx) => fourierDemo(ctx),
};

function fourierDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'f, S_N';
  plot2.opts.xLabel = 'log₁₀ n'; plot2.opts.yLabel = 'log₁₀ |coefficient|';
  let key = '', A = new Float64Array(NMAX + 1), B = new Float64Array(NMAX + 1), qerr = 0, qok = true, f: (x: number) => number = TARGETS.square.f, fname = '', inputError = '', norm2 = 0;

  const ext = (x: number) => {
    const k = ctx.choices.kind as Kind, y = x - 2 * PI * Math.round(x / (2 * PI));
    if (k === 'full') return f(y);
    if (k === 'sine') return y >= 0 ? f(y) : -f(-y);
    return f(Math.abs(y));
  };
  const rebuild = () => {
    inputError = '';
    if (ctx.choices.target === 'expr') {
      try {
        const fn = compile(parse(ctx.input), ['x']);
        f = (x) => fn([x]);
        fname = ctx.input;
        if (!Number.isFinite(f(0.3)) && !Number.isFinite(f(-1.1))) throw new Error('it is not finite on (−π, π)');
      } catch (e) { inputError = `Your f(x) could not be used: ${(e as Error).message}`; f = TARGETS.square.f; fname = TARGETS.square.name; }
    } else { f = TARGETS[ctx.choices.target].f; fname = TARGETS[ctx.choices.target].name; }
    const r = fourierCoeffs(f, ctx.choices.kind as Kind, NMAX);
    A = r.a; B = r.b; qerr = r.error; qok = r.ok;
    const k = ctx.choices.kind as Kind;
    norm2 = k === 'full' ? integrate((x) => f(x) ** 2, -PI, PI, 1e-10).value : 2 * integrate((x) => f(x) ** 2, 0, PI, 1e-10).value;
  };

  const draw = () => {
    const c = pal(ctx), N = Math.round(ctx.params.N), fej = !!ctx.toggles.fejer;
    const S = (x: number) => fourierSum(A, B, N, x, fej);
    // ranges from the extension
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i <= 600; i++) { const v = ext(-PI + (2 * PI * i) / 600); if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
    const span = Math.max(hi - lo, 1e-6);
    let smax = -Infinity, smin = Infinity;
    for (let i = 0; i <= 4000; i++) { const v = S(-PI + (2 * PI * i) / 4000); smax = Math.max(smax, v); smin = Math.min(smin, v); }
    const over = Math.max(smax - hi, lo - smin) / span;
    plot.setView({ x0: -3 * PI, x1: 3 * PI, y0: lo - 0.35 * span, y1: hi + 0.4 * span });
    plot.setDraw((g) => {
      g.polygon([[-PI, lo - 1e3], [PI, lo - 1e3], [PI, hi + 1e3], [-PI, hi + 1e3]], { fill: alpha(c.blue, 0.05) });
      if (ctx.choices.kind !== 'full') g.polygon([[0, lo - 1e3], [PI, lo - 1e3], [PI, hi + 1e3], [0, hi + 1e3]], { fill: alpha(c.green, 0.07) });
      g.fn(ext, { color: c.faint, width: 2.2 });
      if (ctx.toggles.terms) {
        const cols = [c.red, c.green, c.violet, c.cyan, c.orange, c.pink];
        let k = 0;
        for (let n = 0; n <= Math.min(N, NMAX) && k < 6; n++) {
          const an = n === 0 ? A[0] / 2 : A[n], bn = n === 0 ? 0 : B[n];
          if (Math.abs(an) < 1e-12 && Math.abs(bn) < 1e-12) continue;
          const col = cols[k++];
          g.fn((x) => an * Math.cos(n * x) + bn * Math.sin(n * x), { color: alpha(col, 0.8), width: 1.3, dash: [4, 3] });
        }
      }
      g.fn(S, { color: fej ? c.green : c.gold, width: 2.6 });
      const ft = '12px Inter, system-ui, sans-serif';
      g.text([-3 * PI + 0.3, hi + 0.36 * span], `┅ f: ${fname}${ctx.choices.kind === 'full' ? '' : ctx.choices.kind === 'sine' ? ' — odd extension' : ' — even extension'}`, { color: c.muted, font: ft, baseline: 'top' });
      g.text([-3 * PI + 0.3, hi + 0.25 * span], `━ ${fej ? 'Fejér mean σ' : 'partial sum S'}_${N}`, { color: fej ? c.green : c.gold, font: ft, baseline: 'top' });
      g.text([PI, lo - 0.3 * span], ctx.choices.kind === 'full' ? 'one period (−π, π); repeated' : 'f is given on (0, π) (green); extended', { color: c.muted, font: '11px Inter, sans-serif', align: 'right', baseline: 'bottom' });
    });
    // spectrum
    const pts: { x: number; y: number; n: number; on: boolean; cos: boolean }[] = [];
    for (let n = 1; n <= NMAX; n++) {
      if (Math.abs(A[n]) > 1e-13) pts.push({ x: Math.log10(n), y: Math.log10(Math.abs(A[n])), n, on: n <= N, cos: true });
      if (Math.abs(B[n]) > 1e-13) pts.push({ x: Math.log10(n), y: Math.log10(Math.abs(B[n])), n, on: n <= N, cos: false });
    }
    const ys = pts.map((p) => p.y), y0 = Math.min(-6, ...ys) - 0.3, y1 = Math.max(0.5, ...ys) + 0.3;
    plot2.setView({ x0: -0.15, x1: 2.45, y0, y1 });
    // fitted slope over n = 20..200 (non-zero coefficients)
    const fit = pts.filter((p) => p.n >= 20);
    let slope = NaN;
    if (fit.length > 4) { const mx = fit.reduce((s, p) => s + p.x, 0) / fit.length, my = fit.reduce((s, p) => s + p.y, 0) / fit.length; slope = fit.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / fit.reduce((s, p) => s + (p.x - mx) ** 2, 0); }
    plot2.setDraw((g) => {
      const base = pts.length ? pts[0].y : 0;
      g.line([0, base], [2.3, base - 2.3], { color: c.faint, width: 1.2, dash: [6, 4] });
      g.line([0, base], [2.3, base - 4.6], { color: c.faint, width: 1.2, dash: [2, 4] });
      g.text([2.3, base - 2.3], '1/n', { color: c.muted, font: '11px Inter, sans-serif' }, 4, 0);
      g.text([2.3, base - 4.6], '1/n²', { color: c.muted, font: '11px Inter, sans-serif' }, 4, 0);
      for (const p of pts) g.point([p.x, p.y], p.on ? 3 : 2, { fill: p.on ? (p.cos ? c.cyan : c.gold) : alpha(c.muted, 0.6) });
      g.line([Math.log10(Math.max(N, 1)), y0], [Math.log10(Math.max(N, 1)), y1], { color: alpha(c.orange, 0.7), width: 1.4, dash: [3, 3] });
      g.text([-0.1, y1 - 0.2], '● |aₙ| (cosine)   ● |bₙ| (sine)   — lit: included in the sum', { color: c.muted, font: '11px Inter, sans-serif', baseline: 'top' });
    });
    // Parseval: ‖f − S_N‖² = ‖f‖² − π(a₀²/2 + Σ aₙ² + bₙ²) (full period of length 2π)
    let sum = A[0] * A[0] / 2;
    for (let n = 1; n <= N; n++) sum += A[n] * A[n] + B[n] * B[n];
    const l2 = Math.sqrt(Math.max(0, norm2 - PI * sum) / (2 * PI));
    const rows: Readout[] = [
      { label: 'overshoot beyond f (fraction of its range)', value: fmt(over, 4), tone: over > 0.05 ? 'warn' : 'good' },
      { label: 'Gibbs constant (for a jump)', value: GIBBS.toFixed(6) },
      { label: 'rms error ‖f − S_N‖ (Parseval)', value: fej ? '(for S_N only)' : fmt(l2, 4) },
      { label: 'coefficient decay (fitted slope, n ≥ 20)', value: Number.isFinite(slope) ? fmt(slope, 3) : 'faster than any power' },
      { label: 'first coefficients', value: Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (ctx.choices.kind === 'cosine' || (ctx.choices.kind === 'full' && Math.abs(A[n]) > Math.abs(B[n])) ? `a${n}=${fmt(A[n], 3)}` : `b${n}=${fmt(B[n], 3)}`)).join('  ') },
      { label: 'quadrature error (all coefficients)', value: fmt(qerr, 2), tone: qok ? 'good' : 'warn' },
    ];
    ctx.setReadouts(rows);
    ctx.setNote(`${ctx.choices.kind === 'sine' ? '**Sine series** = the odd extension: the natural expansion for **Dirichlet** ends ($u = 0$ at $0$ and $\\pi$), as in the heat equation on a rod.' : ctx.choices.kind === 'cosine' ? '**Cosine series** = the even extension: the natural expansion for **Neumann** (insulated) ends.' : '**Full series** on $(-\\pi, \\pi)$: the natural expansion for a **periodic** problem (a ring).'} Under the heat equation each term simply decays, $e^{-n^2 t}$ — Fourier's original reason for inventing these series.`);
    ctx.warn(inputError || (!qok ? 'Some coefficients did not reach the requested quadrature accuracy (a very rough or singular f); the error estimate is shown.' : ''));
  };

  const update = () => {
    const k = [ctx.choices.target, ctx.choices.kind, ctx.choices.target === 'expr' ? ctx.input : ''].join('|');
    if (k !== key) { key = k; rebuild(); }
    draw();
  };
  return {
    update,
    csv() { return csv(['n', 'a_n', 'b_n'], [Array.from({ length: NMAX + 1 }, (_, i) => i), A, B]); },
    dispose() {},
  };
}
