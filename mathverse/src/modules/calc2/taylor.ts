// Taylor and Maclaurin polynomials: an order slider (animated), any centre,
// the radius of convergence as a band — set by the nearest complex
// singularity — and the error |f − P_N| on a log scale with the Lagrange bound.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { TaylorFn, TAYLOR_F, TAYLOR_DOMAIN, taylorCoeffs, taylorRadius, evalTaylor, derivativeBound, logFactorial } from '../../core/numeric/taylor';
import { fmt, ink, muted, rgba, clamp, BLUE, GOLD, GREEN, RED, VIOLET, FONT, safeTutorial, customAxes, texNum } from './util';

const FNS: Record<TaylorFn, { label: string; tex: string; sing: string }> = {
  sin: { label: 'sin x', tex: '\\sin x', sing: 'none — entire: R = ∞' },
  cos: { label: 'cos x', tex: '\\cos x', sing: 'none — entire: R = ∞' },
  exp: { label: 'eˣ', tex: 'e^x', sing: 'none — entire: R = ∞' },
  cosh: { label: 'cosh x', tex: '\\cosh x', sing: 'none — entire: R = ∞' },
  gauss: { label: 'e^(−x²)', tex: 'e^{-x^2}', sing: 'none — entire: R = ∞' },
  log1p: { label: 'ln(1 + x)', tex: '\\ln(1+x)', sing: 'x = −1 (logarithmic)' },
  geom: { label: '1/(1 − x)', tex: '\\frac{1}{1-x}', sing: 'x = 1 (a pole)' },
  sqrt1p: { label: '√(1 + x)', tex: '\\sqrt{1+x}', sing: 'x = −1 (branch point)' },
  atan: { label: 'arctan x', tex: '\\arctan x', sing: 'x = ±i (complex! invisible on the real line)' },
  lorentz: { label: '1/(1 + x²)', tex: '\\frac{1}{1+x^2}', sing: 'x = ±i (complex poles — smooth on all of ℝ)' },
};

export const taylorDemo: DemoDef = {
  id: 'calc2.taylor', module: 'calc2', title: 'Taylor and Maclaurin series', topic: 'Taylor polynomials, Taylor series, remainder, radius of convergence',
  summary: 'Match a function’s value, slope, curvature… at one point and you get a polynomial that hugs it nearby. Raise the order: inside the radius of convergence the hugging region grows; outside, the polynomials fly away.',
  tex: 'P_N(x) = \\sum_{n=0}^N \\frac{f^{(n)}(a)}{n!}(x-a)^n,\\qquad R_N(x) = \\frac{f^{(N+1)}(\\xi)}{(N+1)!}(x-a)^{N+1}',
  view: 'split2d', animated: true,
  params: [
    { key: 'N', label: 'order N (play to animate)', value: 3, min: 0, max: 40, step: 1 },
    { key: 'a', label: 'centre a', value: 0, min: -3, max: 3, step: 0.01 },
    { key: 'x0', label: 'probe x (drag)', value: 1.2, min: -8, max: 8, step: 0.01 },
  ],
  choices: [{ key: 'f', label: 'Function', value: 'sin', options: (Object.keys(FNS) as TaylorFn[]).map((k) => [k, FNS[k].label]) }],
  toggles: [{ key: 'ghost', label: 'Show lower orders faintly', value: true }, { key: 'bound', label: 'Lagrange error bound', value: true }],
  experiments: [
    'Play with sin x: each new odd order adds a turn of the wave. The error at a fixed x falls faster than any power once N passes x.',
    'ln(1 + x) about 0: R = 1. Inside, the error plot plunges with N; beyond x = 1 the polynomials diverge wildly — no matter how high N goes.',
    'Now 1/(1 + x²): perfectly smooth on the whole real line, yet R = 1 about 0. The culprits are the complex singularities ±i. Move the centre a: R = √(1 + a²).',
    'Move the centre of ln(1 + x) to a = 1.5: R = 2.5, the distance to the singularity at −1.',
    'Pendulum: sin θ ≈ θ is the order-1 Maclaurin polynomial. At θ = 0.5 rad its error is about 0.02 — see the Pendulum demo for what that does to the period.',
  ],
  connections: ['calc2.powerseries', 'calc2.pendulum', 'calc2.series', 'calc2.parts'],
  accuracy: 'Coefficients are exact formulas or exact recurrences (complex arithmetic for 1/(1 + x²) and arctan, the ODE f′ = −2xf for e^(−x²)) — no numerical differentiation. The radius is the distance to the nearest complex singularity (exact). The Lagrange bound uses the exact sup of |f^(N+1)| for sin, cos, eˣ and cosh; for the others it is not drawn.',
  tutorial: safeTutorial([
    { text: '**Matching derivatives.** The tangent line $P_1$ matches $f(a)$ and $f\'(a)$. Add a term $\\tfrac{f\'\'(a)}{2}(x-a)^2$ to match the curvature too; keep going. The $n!$ makes the $n$-th derivative of the polynomial equal $f^{(n)}(a)$.', set: { choices: { f: 'sin' }, params: { N: 1, a: 0, x0: 1.2 }, toggles: { ghost: true, bound: true } }, task: 'Step N from 1 to 7 and watch the polynomial follow the sine further out.', done: (c) => c.params.N >= 7 },
    { text: '**For sin x:** $\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$, valid for every $x$. The right plot shows $\\log_{10}|f - P_N|$: where it is very negative the polynomial is excellent.', task: 'Press play to animate the order.' },
    { text: '**The remainder.** Taylor’s theorem: $f(x) - P_N(x) = \\frac{f^{(N+1)}(\\xi)}{(N+1)!}(x-a)^{N+1}$ for some $\\xi$ between $a$ and $x$. For sine, $|f^{(N+1)}| \\le 1$, giving the dashed bound — the true error always lies below it.', set: { params: { N: 5 } }, task: 'Drag the probe x and compare the error with the bound in the readouts.' },
    { text: '**Radius of convergence.** For $\\ln(1+x)$ about 0 the series converges only for $-1 < x \\le 1$. Outside the shaded band, raising $N$ makes things *worse*.', set: { choices: { f: 'log1p' }, params: { N: 8, a: 0, x0: 0.6 } }, task: 'Drag the probe to x = 1.5 and raise N: the error grows.', done: (c) => c.params.x0 > 1.3 && c.params.N >= 12 },
    { text: '**Complex singularities.** $\\frac{1}{1+x^2}$ is smooth on all of ℝ, yet its Maclaurin series $1 - x^2 + x^4 - \\dots$ stops converging at $|x| = 1$. The reason is off the real line: the poles at $x = \\pm i$, at distance 1 from 0. From centre $a$ the radius is $\\sqrt{1 + a^2}$.', set: { choices: { f: 'lorentz' }, params: { N: 12, a: 0, x0: 0.8 } }, task: 'Move the centre to a = 1: the band widens to √2.', done: (c) => Math.abs(c.params.a - 1) < 0.03 },
    { text: '**Physics.** Small-angle approximations are Taylor polynomials: $\\sin\\theta \\approx \\theta$ (the pendulum), $\\cos\\theta \\approx 1 - \\theta^2/2$ (potential energy near equilibrium — every minimum looks like a spring), $\\sqrt{1 + x} \\approx 1 + x/2$ (relativistic energy $mc^2\\sqrt{1 + p^2/m^2c^2} \\approx mc^2 + p^2/2m$).', set: { choices: { f: 'sqrt1p' }, params: { N: 1, a: 0, x0: 0.3 } } },
  ]),
  create: (ctx) => createTaylor(ctx),
};

function createTaylor(ctx: DemoCtx): DemoInstance {
  const Lp = ctx.plot!, Rp = ctx.plot2!;
  Lp.opts.xLabel = 'x'; Rp.opts.axes = false; Rp.opts.grid = false;
  let lastF = '';
  const update = () => {
    const fn = (FNS[ctx.choices.f as TaylorFn] ? ctx.choices.f : 'sin') as TaylorFn;
    const F = TAYLOR_F[fn], dom = TAYLOR_DOMAIN[fn];
    const N = Math.round(ctx.params.N);
    let a = ctx.params.a;
    const warn: string[] = [];
    if (!(a > dom[0] + 0.05 && a < dom[1] - 0.05)) { const aa = clamp(a, dom[0] + 0.05, dom[1] - 0.05); warn.push(`${FNS[fn].label} is not smooth at a = ${fmt(a, 3)}; the centre is moved to ${fmt(aa, 3)}.`); a = aa; }
    const c = taylorCoeffs(fn, a, Math.max(N, 40));
    const P = (x: number, n = N) => evalTaylor(c, a, x, n);
    const R = taylorRadius(fn, a);
    const x0 = ctx.params.x0;
    if (fn !== lastF) {
      lastF = fn;
      const yr = fn === 'exp' ? [-1, 8] : fn === 'cosh' ? [-0.5, 6] : fn === 'geom' ? [-4, 6] : fn === 'log1p' ? [-3, 2.5] : fn === 'sqrt1p' ? [-0.5, 3] : [-2, 2];
      Lp.setView({ x0: -6, x1: 6, y0: yr[0], y1: yr[1] });
    }
    const t = ink(ctx);
    Lp.setDraw((g) => {
      if (Number.isFinite(R)) {
        g.fillBetween(() => g.view.y1, () => g.view.y0, Math.max(a - R, g.view.x0), Math.min(a + R, g.view.x1), { fill: rgba(GREEN, 0.07) }, 4);
        for (const e of [a - R, a + R]) g.line([e, g.view.y0], [e, g.view.y1], { color: rgba(GREEN, 0.7), width: 1.4, dash: [6, 5] });
        g.text([a + R, g.view.y1], `a + R`, { color: GREEN, font: FONT }, 6, 40);
      }
      if (ctx.toggles.ghost) for (let n = Math.max(0, N - 6); n < N; n++) g.fn((x) => P(x, n), { color: rgba(VIOLET, 0.12 + 0.08 * (n - N + 6)), width: 1.2 });
      g.fn(F, { color: t, width: 3 }, [Math.max(dom[0] + 1e-9, g.view.x0), Math.min(dom[1] - 1e-9, g.view.x1)]);
      g.fn((x) => P(x), { color: GOLD, width: 2.6 });
      g.point([a, F(a)], 5, { fill: RED });
      g.line([x0, F(x0)], [x0, P(x0)], { color: RED, width: 2 });
      g.handle({ id: 'x0', at: [x0, Number.isFinite(P(x0)) ? clamp(P(x0), g.view.y0, g.view.y1) : 0], color: BLUE, label: 'probe', onDrag: ([x]) => ctx.setParam('x0', +x.toFixed(3)) });
      g.handle({ id: 'a', at: [a, F(a)], color: RED, label: 'centre a', onDrag: ([x]) => ctx.setParam('a', +clamp(x, -3, 3).toFixed(3)) });
      g.text([g.view.x0, g.view.y1], `f(x) = ${FNS[fn].label}`, { color: t, font: FONT }, 10, 22);
      g.text([g.view.x0, g.view.y1], `P_${N}(x), centre a = ${fmt(a, 3)}`, { color: GOLD, font: FONT }, 10, 40);
      g.text([g.view.x0, g.view.y1], Number.isFinite(R) ? `green band: |x − a| < R = ${fmt(R, 4)}` : 'R = ∞: converges everywhere', { color: GREEN, font: FONT }, 10, 58);
    });
    // error plot: log10 |f − P_N|
    Rp.setView({ x0: Lp.view.x0, x1: Lp.view.x1, y0: -17, y1: 4 });
    const bnd = (x: number) => { const M = derivativeBound(fn, a, x, N); return M === null ? NaN : M * Math.exp((N + 1) * Math.log(Math.abs(x - a)) - logFactorial(N + 1)); };
    Rp.setDraw((g) => {
      customAxes(g, ctx.dark, { yLog: true, xLabel: 'x', yLabel: '|f(x) − P_N(x)|' });
      if (Number.isFinite(R)) { g.fillBetween(() => g.view.y1, () => g.view.y0, Math.max(a - R, g.view.x0), Math.min(a + R, g.view.x1), { fill: rgba(GREEN, 0.07) }, 4); }
      g.line([g.view.x0, -16], [g.view.x1, -16], { color: muted(ctx), width: 1, dash: [2, 4] });
      if (ctx.toggles.bound && derivativeBound(fn, a, a + 1, N) !== null) g.fn((x) => { const v = bnd(x); return v > 0 ? Math.log10(v) : NaN; }, { color: RED, width: 1.6, dash: [6, 4] });
      if (ctx.toggles.ghost) for (let n = Math.max(0, N - 6); n < N; n++) g.fn((x) => { const e = Math.abs(F(x) - P(x, n)); return e > 0 ? Math.max(-17, Math.log10(e)) : -17; }, { color: rgba(VIOLET, 0.12 + 0.08 * (n - N + 6)), width: 1.1 });
      g.fn((x) => { const e = Math.abs(F(x) - P(x)); return e > 0 ? Math.max(-17, Math.log10(e)) : -17; }, { color: GOLD, width: 2.4 });
      const e0 = Math.abs(F(x0) - P(x0));
      if (Number.isFinite(e0)) g.point([x0, e0 > 0 ? Math.max(-17, Math.log10(e0)) : -17], 6, { fill: BLUE });
      g.line([x0, g.view.y0], [x0, g.view.y1], { color: rgba(BLUE, 0.5), width: 1, dash: [3, 4] });
      g.text([g.view.x1, g.view.y1], 'gold: error of P_N (log scale)', { color: GOLD, font: FONT, align: 'right' }, -12, 58);
      if (ctx.toggles.bound && derivativeBound(fn, a, a + 1, N) !== null) g.text([g.view.x1, g.view.y1], 'red dashed: Lagrange bound', { color: RED, font: FONT, align: 'right' }, -12, 76);
    });
    const e0 = F(x0) - P(x0), b0 = bnd(x0);
    const terms = c.slice(0, Math.min(N, 6) + 1).map((v, n) => ({ v, n })).filter((q) => Math.abs(q.v) > 1e-15);
    const shift = a === 0 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${fmt(Math.abs(a), 3)})`;
    // coefficients as exact fractions when they are (to 1e−13) — e.g. 1/3! — otherwise as decimals marked ≈
    let approx = false;
    const coefTeX = (m: number, n: number) => {
      const r = rational(m);
      if (r) return r[1] === 1 ? (r[0] === 1 && n > 0 ? '' : String(r[0])) : `\\tfrac{${r[0]}}{${r[1]}}`;
      approx = true; return texNum(m, 6);
    };
    const polyTeX = terms.map((q, i) => { const s = q.v < 0 ? '-' : i ? '+' : ''; return `${s}${coefTeX(Math.abs(q.v), q.n)}${q.n === 0 ? '' : q.n === 1 ? shift : `${shift}^{${q.n}}`}`; }).join(' ') + (N > 6 ? ' + \\cdots' : '');
    const inside = !Number.isFinite(R) || Math.abs(x0 - a) < R;
    ctx.warn(warn.join(' '));
    ctx.setReadouts([
      { label: `P_${N}(x)${approx ? '  (coefficients rounded)' : '  (exact coefficients)'}`, value: polyTeX || '0', tex: true },
      { label: `f(${fmt(x0, 4)})`, value: fmt(F(x0), 12) },
      { label: `P_${N}(${fmt(x0, 4)})`, value: fmt(P(x0), 12) },
      { label: 'error f − P_N', value: Number.isFinite(e0) ? (e0 === 0 ? '0' : e0.toExponential(3)) : '—', tone: Math.abs(e0) < 1e-6 ? 'good' : undefined },
      ...(Number.isFinite(b0) && ctx.toggles.bound ? [{ label: 'Lagrange bound', value: b0.toExponential(3), tone: (Math.abs(e0) <= b0 * (1 + 1e-9) + 1e-15 ? 'good' : 'bad') as 'good' | 'bad' }] : []),
      { label: 'radius of convergence R', value: Number.isFinite(R) ? fmt(R, 6) : '∞' },
      { label: 'nearest singularity', value: FNS[fn].sing },
      { label: 'probe position', value: inside ? 'inside the radius: P_N → f' : 'outside the radius: P_N diverges', tone: inside ? 'good' : 'bad' },
    ]);
    ctx.setNote(fn === 'lorentz' || fn === 'atan' ? 'Why does a function that is smooth everywhere on ℝ have a finite radius? A power series converges in a **disc** in the complex plane, and the disc cannot reach past the poles at $\\pm i$. The radius from centre $a$ is their distance, $(1 + a^2)^{1/2}$.' : `$${FNS[fn].tex.replace('\\sqrt{1+x}', '(1+x)^{1/2}')} \\approx P_{${N}}(x)$ near $x = ${fmt(a, 3)}$. Inside the radius of convergence the error falls to zero as $N$ grows; outside, it grows.`);
  };
  let clock = 0;
  return {
    update,
    tick(dt) { clock += dt; if (clock < 0.6) return; clock = 0; const N = Math.round(ctx.params.N); ctx.setParam('N', N >= 25 ? 0 : N + 1); update(); },
    dispose() {},
  };
}

/** p/q with q ≤ 100000 when x equals it to 1e−13 (continued fractions), else null. */
function rational(x: number): [number, number] | null {
  if (!Number.isFinite(x)) return null;
  let h0 = 0, h1 = 1, k0 = 1, k1 = 0, v = x;
  for (let i = 0; i < 25; i++) {
    const a = Math.floor(v);
    [h0, h1] = [h1, a * h1 + h0]; [k0, k1] = [k1, a * k1 + k0];
    if (k1 > 100000) return null;
    if (Math.abs(x - h1 / k1) <= 1e-13 * Math.max(1, Math.abs(x))) return [h1, k1];
    const f = v - a; if (f < 1e-15) return null; v = 1 / f;
  }
  return null;
}
