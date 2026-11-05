// Numerical integration: trapezoid, Simpson and Gauss–Legendre drawn as the
// shapes they integrate exactly, and their errors against n on a log-log plot
// where the order of each rule is the slope of its line.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { compositeRule, gaussLegendre, logLogSlope, Rule } from '../../core/numeric/quadrules';
import { fmt, ink, muted, rgba, BLUE, GOLD, GREEN, RED, VIOLET, FONT, customAxes, safeTutorial } from './util';

interface Fn { label: string; f: (x: number) => number; a: number; b: number; exact: number; exactTeX: string; note: string }
const FNS: Record<string, Fn> = {
  exp: { label: 'eˣ on [0, 1]', f: Math.exp, a: 0, b: 1, exact: Math.E - 1, exactTeX: 'e - 1', note: 'A smooth integrand: every rule shows its textbook order — slopes −2, −4 and −6.' },
  sin: { label: 'sin x on [0, π]', f: Math.sin, a: 0, b: Math.PI, exact: 2, exactTeX: '2', note: 'Smooth: the textbook orders. (Simpson’s rule is exact for cubics, Gauss with 3 points for quintics.)' },
  runge: { label: '1/(1 + 25x²) on [−1, 1]', f: (x) => 1 / (1 + 25 * x * x), a: -1, b: 1, exact: 0.4 * Math.atan(5), exactTeX: '\\tfrac25\\arctan 5', note: 'Runge’s function has poles at ±i/5, close to the interval: the asymptotic orders appear only once the panels are small compared with 1/5.' },
  sqrt: { label: '√x on [0, 1]', f: Math.sqrt, a: 0, b: 1, exact: 2 / 3, exactTeX: '\\tfrac23', note: '√x has an infinite derivative at 0. Every rule slows to order 1.5 — high order only pays off when the integrand is smooth.' },
  kink: { label: '|x − 1/3| on [0, 1]', f: (x) => Math.abs(x - 1 / 3), a: 0, b: 1, exact: 5 / 18, exactTeX: '\\tfrac{5}{18}', note: 'A kink between nodes: no rule does better than order 2, and the error jumps around as nodes pass the corner.' },
  periodic: { label: 'e^(cos x) over a period [0, 2π]', f: (x) => Math.exp(Math.cos(x)), a: 0, b: 2 * Math.PI, exact: 2 * Math.PI * 1.2660658777520082, exactTeX: '2\\pi I_0(1)', note: 'A surprise: for a smooth periodic function over a whole period the humble trapezoid rule converges exponentially fast — faster than any power of n (the line plunges). This is why the FFT works.' },
};
const RULES: { key: Rule; label: string; color: string; order: number }[] = [
  { key: 'trap', label: 'trapezoid', color: BLUE, order: 2 },
  { key: 'simpson', label: 'Simpson', color: GOLD, order: 4 },
  { key: 'gauss2', label: 'Gauss, 2 points', color: VIOLET, order: 4 },
  { key: 'gauss3', label: 'Gauss, 3 points', color: RED, order: 6 },
];
const NS = Array.from(new Set(Array.from({ length: 41 }, (_, i) => Math.round(2 ** (i / 4))))).filter((n) => n <= 1024);

export const numintDemo: DemoDef = {
  id: 'calc2.numint', module: 'calc2', title: 'Numerical integration', topic: 'Trapezoid, Simpson and Gaussian quadrature; error and order',
  summary: 'Replace the integrand on each panel by something you can integrate exactly — a line, a parabola, a polynomial through cleverly placed points. The error falls like n^(−p), and on a log-log plot p is the slope.',
  tex: 'T_n = h\\Big[\\tfrac12 f_0 + f_1 + \\dots + \\tfrac12 f_n\\Big],\\quad |E_T| \\le \\frac{(b-a)h^2}{12}\\max|f\'\'|',
  view: 'split2d',
  params: [{ key: 'n', label: 'number of panels n', value: 4, min: 1, max: 64, step: 1 }],
  choices: [
    { key: 'f', label: 'Integrand', value: 'exp', options: Object.entries(FNS).map(([k, f]) => [k, f.label] as [string, string]) },
    { key: 'rule', label: 'Rule drawn on the left', value: 'trap', options: RULES.map((r) => [r.key, r.label] as [string, string]) },
  ],
  toggles: [{ key: 'evals', label: 'Error per function evaluation (fairer)', value: false }],
  experiments: [
    'Double n for the trapezoid rule: the error drops by 4 (order 2). For Simpson it drops by 16 (order 4). Read the fitted slopes.',
    'Compare at equal cost: turn on “per function evaluation”. Gauss with 3 points wins easily for smooth integrands.',
    'Choose √x: every line bends to the same slope, −1.5. Smoothness, not cleverness, sets the order.',
    'Choose e^(cos x) over a period: the trapezoid line plunges straight to rounding error. Periodic + smooth = spectral accuracy.',
    'At very large n the lines flatten near 10⁻¹⁶: rounding error, not the rule, is now the limit.',
  ],
  connections: ['calc2.improper', 'calc2.arclength', 'calc2.taylor'],
  accuracy: 'Every point on the error plot is |rule − exact| with the exact value in closed form (I₀(1) for e^(cos x) to 16 digits). Slopes are least-squares fits for n from 4 to 32, ignoring errors below 10⁻¹³ (rounding).',
  tutorial: safeTutorial([
    { text: '**The trapezoid rule** joins the points by straight lines. On each panel of width $h$ the area is $\\tfrac h2(f_i + f_{i+1})$. Its error is about $\\frac{(b-a)h^2}{12}f\'\'$ — second order: halve $h$, quarter the error.', set: { choices: { f: 'exp', rule: 'trap' }, params: { n: 2 }, toggles: { evals: false } }, task: 'Increase n from 2 to 8 and watch the gaps between the trapezoids and the curve close.', done: (c) => c.params.n >= 8 },
    { text: '**Reading a log-log plot.** If error $\\approx C n^{-p}$ then $\\log E = \\log C - p\\log n$ — a straight line with slope $-p$. The dashed triangles show slopes −2, −4, −6 for comparison.', task: 'Check the fitted slope of the trapezoid line: ≈ −2.' },
    { text: '**Simpson’s rule** fits a parabola through each panel’s ends and midpoint: weights $\\tfrac h6(1, 4, 1)$. It is exact for cubics (by symmetry) and has order 4.', set: { choices: { rule: 'simpson' }, params: { n: 2 } }, task: 'Even with 2 panels the parabolas hug the curve.' },
    { text: '**Gauss–Legendre** chooses the points too: $m$ points at the roots of the Legendre polynomial $P_m$ integrate polynomials of degree $2m - 1$ exactly — twice what equally spaced points can. Three points per panel give order 6.', set: { choices: { rule: 'gauss3' }, params: { n: 1 } }, task: 'With one panel and 3 points, read the error — already tiny.' },
    { text: '**Fair comparison.** Simpson uses 2 evaluations per panel, Gauss-3 uses 3. Plot the error per evaluation: for smooth integrands Gauss is the clear winner — that is why MathVerse’s own integrator is a Gauss–Kronrod rule.', set: { toggles: { evals: true } } },
    { text: '**Smoothness matters.** For $\\sqrt x$ (infinite slope at 0) every rule falls to order 1.5. Adaptive integrators fix this by putting small panels only where they are needed.', set: { choices: { f: 'sqrt' }, toggles: { evals: false } }, task: 'Read the four fitted slopes — all ≈ −1.5.' },
  ]),
  create: (ctx) => createNumInt(ctx),
};

function createNumInt(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  R.opts.axes = false; R.opts.grid = false;
  L.opts.xLabel = 'x';
  let lastF = '';
  let errCache: { key: string; data: { n: number; evals: number; err: number }[][] } | null = null;
  const update = () => {
    const key = FNS[ctx.choices.f] ? ctx.choices.f : 'exp';
    const F = FNS[key], rule = (RULES.find((r) => r.key === ctx.choices.rule) ?? RULES[0]);
    const n = Math.max(1, Math.round(ctx.params.n));
    const res = compositeRule(F.f, F.a, F.b, n, rule.key);
    if (key !== lastF) {
      lastF = key;
      let lo = 0, hi = 0;
      for (let i = 0; i <= 200; i++) { const y = F.f(F.a + ((F.b - F.a) * i) / 200); lo = Math.min(lo, y); hi = Math.max(hi, y); }
      const w = F.b - F.a;
      L.setView({ x0: F.a - 0.08 * w, x1: F.b + 0.08 * w, y0: lo - (hi - lo) * 0.12, y1: hi + (hi - lo) * 0.2 });
    }
    const t = ink(ctx);
    L.setDraw((g) => {
      const h = (F.b - F.a) / n;
      for (let i = 0; i < n; i++) {
        const x0 = F.a + i * h, x1 = x0 + h;
        let p: (x: number) => number, nodes: number[];
        if (rule.key === 'trap') { const y0 = F.f(x0), y1 = F.f(x1); p = (x) => y0 + ((y1 - y0) * (x - x0)) / h; nodes = [x0, x1]; }
        else if (rule.key === 'simpson') { nodes = [x0, x0 + h / 2, x1]; p = lagrange(nodes, nodes.map(F.f)); }
        else { const gl = gaussLegendre(rule.key === 'gauss2' ? 2 : 3); nodes = gl.x.map((u) => x0 + (h * (u + 1)) / 2); p = lagrange(nodes, nodes.map(F.f)); }
        g.fillBetween(p, () => 0, x0, x1, { fill: rgba(rule.color, i % 2 ? 0.22 : 0.32) }, 40);
        g.fn(p, { color: rule.color, width: 1.6 }, [x0, x1]);
        if (n <= 24) g.line([x1, 0], [x1, p(x1)], { color: rgba(rule.color, 0.6), width: 1 });
        for (const xn of nodes) g.point([xn, F.f(xn)], n > 24 ? 2 : 3.5, { fill: rule.color });
      }
      g.fn(F.f, { color: t, width: 2.4 }, [F.a - 0.05 * (F.b - F.a), F.b + 0.05 * (F.b - F.a)]);
      g.text([g.view.x1, g.view.y1], `${rule.label}, n = ${n}: ${fmt(res.value, 12)}`, { color: rule.color, font: FONT, align: 'right' }, -12, 22);
      g.text([g.view.x1, g.view.y1], `exact: ${fmt(F.exact, 12)}`, { color: t, font: FONT, align: 'right' }, -12, 40);
    });

    // the error table (cached per integrand)
    if (!errCache || errCache.key !== key) errCache = { key, data: RULES.map((r) => NS.map((m) => { const q = compositeRule(F.f, F.a, F.b, m, r.key); return { n: m, evals: q.evals, err: Math.abs(q.value - F.exact) }; })) };
    const perEval = !!ctx.toggles.evals;
    const floor = 1e-17;
    const X = (d: { n: number; evals: number }) => Math.log10(perEval ? d.evals : d.n);
    const Y = (e: number) => Math.log10(Math.max(e, floor));
    const slopes = errCache.data.map((rows) => { const sel = rows.filter((d) => d.n >= 4 && d.n <= 32 && d.err > 1e-13); return -logLogSlope(sel.map((d) => d.n), sel.map((d) => d.err)); });
    const xmax = Math.log10(perEval ? 1024 * 3 : 1024);
    R.setView({ x0: -0.15, x1: xmax + 0.15, y0: -17.2, y1: 1.2 });
    R.setDraw((g) => {
      customAxes(g, ctx.dark, { xLog: true, yLog: true, xLabel: perEval ? 'function evaluations' : 'panels n', yLabel: '|error|' });
      g.line([g.view.x0, -16 + Math.log10(Math.max(1, Math.abs(F.exact)))], [g.view.x1, -16 + Math.log10(Math.max(1, Math.abs(F.exact)))], { color: muted(ctx), width: 1, dash: [2, 4] });
      g.text([g.view.x1, -16], 'rounding error ~10⁻¹⁶', { color: muted(ctx), font: '11px Inter, sans-serif', align: 'right', baseline: 'bottom' }, -6, -4);
      // reference slopes
      for (const [p, y0] of [[2, -12], [4, -12], [6, -12]] as [number, number][]) {
        const x0 = 0.08 + (p - 2) * 0.2, dx = 0.3;
        g.path([[x0, y0], [x0 + dx, y0 - p * dx], [x0, y0 - p * dx]], { color: muted(ctx), width: 1, dash: [4, 3] }, true);
        g.text([x0 - 0.01, y0 - p * dx * 0.5], `−${p}`, { color: muted(ctx), font: '11px Inter, sans-serif', align: 'right', baseline: 'middle' });
      }
      errCache!.data.forEach((rows, i) => {
        const r = RULES[i];
        const pts = rows.map((d) => [X(d), Y(d.err)] as [number, number]);
        g.path(pts, { color: r.color, width: r.key === rule.key ? 3 : 1.8, alpha: r.key === rule.key ? 1 : 0.8 });
        for (const pnt of pts) g.point(pnt, r.key === rule.key ? 2.6 : 1.8, { fill: r.color });
        g.text([g.view.x1, g.view.y1], `${r.label}: slope ${Number.isFinite(slopes[i]) ? '−' + fmt(slopes[i], 3) : '—'}`, { color: r.color, font: FONT, align: 'right' }, -12, 58 + 18 * i);
      });
      const cur = errCache!.data[RULES.indexOf(rule)].find((d) => d.n === n);
      const xc = Math.log10(perEval ? res.evals : n), yc = Y(cur ? cur.err : Math.abs(res.value - F.exact));
      g.line([xc, g.view.y0], [xc, g.view.y1], { color: GREEN, width: 1, dash: [3, 4] });
      g.point([xc, yc], 6, { fill: GREEN });
    });
    const err = Math.abs(res.value - F.exact);
    ctx.setReadouts([
      { label: `${rule.label}, n = ${n}`, value: fmt(res.value, 14) },
      { label: 'exact', value: `${F.exactTeX} = ${fmt(F.exact, 14)}`, tex: false },
      { label: 'error', value: err === 0 ? '0' : err.toExponential(2), tone: err < 1e-10 ? 'good' : undefined },
      { label: 'function evaluations', value: String(res.evals) },
      ...RULES.map((r, i) => ({ label: `fitted order, ${r.label} (theory ${r.order})`, value: Number.isFinite(slopes[i]) ? fmt(slopes[i], 3) : 'at rounding level' })),
    ]);
    ctx.setNote(F.note);
  };
  return { update, dispose() {} };
}

/** The polynomial through the points (xs, ys), in Lagrange form. */
function lagrange(xs: number[], ys: number[]): (x: number) => number {
  return (x) => { let s = 0; for (let i = 0; i < xs.length; i++) { let w = ys[i]; for (let j = 0; j < xs.length; j++) if (j !== i) w *= (x - xs[j]) / (xs[i] - xs[j]); s += w; } return s; };
}
