// Arc length: an inscribed polyline whose length approaches the curve's, and
// the observation that the polyline's length is exactly a Riemann sum of
// √(1 + f′²) — so the limit is the integral.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { derivative, compile, toTeX, Node } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import { polylineLength } from '../../core/numeric/revolution';
import { fmt, ink, muted, rgba, BLUE, GOLD, GREEN, RED, VIOLET, FONT, compileInput, safeTutorial, rangeOf, clamp } from './util';

export const arclengthDemo: DemoDef = {
  id: 'calc2.arclength', module: 'calc2', title: 'Arc length', topic: 'Arc length of a graph',
  summary: 'Inscribe a polyline in the curve. Each segment has length √(Δx² + Δy²) = √(1 + (Δy/Δx)²)·Δx, so the polyline’s length is a Riemann sum of √(1 + f′²) — and the arc length is its integral.',
  tex: 'L = \\int_a^b \\sqrt{1 + f\'(x)^2}\\,dx',
  view: 'split2d',
  input: { label: 'f(x) =', value: 'x^2', placeholder: 'e.g. cosh(x), sqrt(1 - x^2), x^(3/2)' },
  params: [
    { key: 'a', label: 'a', value: 0, min: -5, max: 5, step: 0.01 },
    { key: 'b', label: 'b', value: 2, min: -5, max: 5, step: 0.01 },
    { key: 'n', label: 'segments n', value: 4, min: 1, max: 200, step: 1 },
    { key: 'x0', label: 'magnified point (drag)', value: 1.2, min: -5, max: 5, step: 0.01 },
  ],
  experiments: [
    'Increase n: the polyline’s length creeps up to L from below (a chord is never longer than its arc). The error falls like 1/n².',
    'On the right, the bars have exactly the polyline’s segment lengths as their areas: it is a Riemann sum, with each bar’s height the slope-factor √(1 + m²) of its chord.',
    'Type sqrt(1 - x^2) with a = −1, b = 1: the length of a semicircle is π. The polyline is an inscribed polygon — Archimedes’ method.',
    'Type cosh(x): a hanging chain (catenary). Its arc length from 0 to x is exactly sinh x — check the readout.',
    'Drag the magnified point: the little triangle dx, dy, ds is Pythagoras at the scale where the curve looks straight.',
  ],
  connections: ['calc2.surface', 'calc2.parametric', 'calc2.numint'],
  accuracy: 'f′ is exact (symbolic differentiation). L is adaptive Gauss–Kronrod quadrature with its error estimate; the polyline length is exact arithmetic on the sampled points.',
  tutorial: safeTutorial([
    { text: '**Chords first.** The straight segment from $(x_i, y_i)$ to $(x_{i+1}, y_{i+1})$ has length $\\sqrt{\\Delta x^2 + \\Delta y^2}$. Adding $n$ of them gives a length a little shorter than the curve.', set: { input: 'x^2', params: { a: 0, b: 2, n: 2, x0: 1.2 } }, task: 'Increase n to 16 and watch the polyline length approach L.', done: (c) => c.params.n >= 16 },
    { text: '**Factor out Δx:** $\\sqrt{\\Delta x^2 + \\Delta y^2} = \\sqrt{1 + (\\Delta y/\\Delta x)^2}\\,\\Delta x$. By the mean value theorem, $\\Delta y/\\Delta x = f\'(c_i)$ somewhere in the segment. So the polyline length is a **Riemann sum** of $\\sqrt{1 + f\'^2}$ — the bars on the right.', task: 'Compare the bars with the smooth curve √(1 + f′²) on the right.' },
    { text: 'As $n \\to \\infty$ the Riemann sum becomes the integral: $L = \\int_a^b \\sqrt{1+f\'(x)^2}\\,dx$. In the limit, $ds = \\sqrt{dx^2 + dy^2}$ — the magnified triangle.', task: 'Drag the magnified point along the curve.' },
    { text: '**A circle.** For $y = \\sqrt{1-x^2}$ on $[-1, 1]$ the integrand is $1/\\sqrt{1-x^2}$, infinite at the ends, but the integral is finite: $\\pi$. The inscribed polygon is Archimedes’ approximation of $\\pi$.', set: { input: 'sqrt(1 - x^2)', params: { a: -1, b: 1, n: 6, x0: 0.3 } }, task: 'Set n = 96 (Archimedes’ polygon) and read the length.', done: (c) => c.params.n >= 96 },
    { text: '**Physics: the catenary.** A hanging chain takes the shape $y = \\cosh x$ (in units of its tension-to-weight ratio). Since $1 + \\sinh^2 = \\cosh^2$, its arc length from 0 to $x$ is exactly $\\sinh x$ — one of the very few graphs with an elementary arc length.', set: { input: 'cosh(x)', params: { a: 0, b: 1.5, n: 8, x0: 0.8 } } },
  ]),
  create: (ctx) => createArc(ctx),
};

function createArc(ctx: DemoCtx): DemoInstance {
  const L = ctx.plot!, R = ctx.plot2!;
  L.opts.equal = true; L.opts.xLabel = 'x'; R.opts.xLabel = 'x';
  let lastKey = '';
  const update = () => {
    const parsed = compileInput(ctx.input, 'x');
    if ('error' in parsed) { ctx.warn(`Cannot read f(x): ${parsed.error}`); return; }
    const f = parsed.f;
    let dnode: Node | null = null;
    try { dnode = derivative(parsed.node, 'x'); } catch { dnode = null; }
    const dfc = dnode ? compile(dnode, ['x']) : null;
    const df = (x: number) => (dfc ? dfc([x]) : (f(x + 1e-6) - f(x - 1e-6)) / 2e-6);
    const a = Math.min(ctx.params.a, ctx.params.b), b = Math.max(ctx.params.a, ctx.params.b);
    const n = Math.max(1, Math.round(ctx.params.n));
    const x0 = clamp(ctx.params.x0, a, b);
    const g = (x: number) => Math.sqrt(1 + df(x) ** 2);
    const q = integrate(g, a, b, 1e-10);
    const Ln = polylineLength(f, a, b, n);
    const key = `${ctx.input}|${a}|${b}`;
    if (key !== lastKey) {
      lastKey = key;
      const [ylo, yhi] = rangeOf([f], a, b, 0.2);
      const w = b - a;
      L.setView({ x0: a - 0.15 * w, x1: b + 0.15 * w, y0: Math.min(ylo, 0) - 0.1 * w, y1: Math.max(yhi, 0) + 0.1 * w });
      const [glo, ghi] = rangeOf([g], a + 1e-6 * w, b - 1e-6 * w, 0.1);
      R.setView({ x0: a - 0.1 * w, x1: b + 0.1 * w, y0: Math.min(0, glo) - 0.1, y1: Math.min(ghi, 12) * 1.15 });
    }
    const t = ink(ctx);
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; pts.push([x, f(x)]); }
    L.setDraw((gr) => {
      gr.fn(f, { color: muted(ctx), width: 1.4 }, [gr.view.x0, gr.view.x1]);
      gr.fn(f, { color: t, width: 2.6 }, [a, b]);
      for (let i = 0; i < n; i++) gr.line(pts[i], pts[i + 1], { color: i % 2 ? GOLD : BLUE, width: 3 });
      if (n <= 60) for (const p of pts) gr.point(p, 3.5, { fill: GOLD });
      // the magnified triangle at x0
      const span = (gr.view.x1 - gr.view.x0) * 0.08, y0 = f(x0), s = df(x0);
      if (Number.isFinite(y0) && Number.isFinite(s)) {
        const dx = span / Math.sqrt(1 + s * s) * 1.4, dy = s * dx;
        gr.polygon([[x0, y0], [x0 + dx, y0], [x0 + dx, y0 + dy]], { fill: rgba(VIOLET, 0.25), color: VIOLET, width: 1.5 });
        gr.text([x0 + dx / 2, y0], 'dx', { color: VIOLET, font: FONT, align: 'center', baseline: dy >= 0 ? 'top' : 'bottom' }, 0, dy >= 0 ? 4 : -4);
        gr.text([x0 + dx, y0 + dy / 2], 'dy', { color: VIOLET, font: FONT, baseline: 'middle' }, 5, 0);
        gr.text([x0 + dx / 2, y0 + dy / 2], 'ds', { color: RED, font: '700 13px Inter, sans-serif', align: 'right', baseline: 'bottom' }, -4, -4);
        gr.line([x0, y0], [x0 + dx, y0 + dy], { color: RED, width: 2.5 });
      }
      gr.handle({ id: 'x0', at: [x0, f(x0)], color: RED, constrain: ([px]) => [clamp(px, a, b), f(clamp(px, a, b))], onDrag: ([px]) => ctx.setParam('x0', +clamp(px, a, b).toFixed(3)) });
      gr.handle({ id: 'a', at: [a, f(a)], color: GREEN, label: 'a', onDrag: ([px]) => ctx.setParam('a', +px.toFixed(3)) });
      gr.handle({ id: 'b', at: [b, f(b)], color: GREEN, label: 'b', onDrag: ([px]) => ctx.setParam('b', +px.toFixed(3)) });
    });
    R.setDraw((gr) => {
      for (let i = 0; i < n; i++) {
        const [xa, ya] = pts[i], [xb, yb] = pts[i + 1];
        const h = Math.hypot(xb - xa, yb - ya) / (xb - xa);
        gr.polygon([[xa, 0], [xb, 0], [xb, h], [xa, h]], { fill: rgba(i % 2 ? GOLD : BLUE, 0.35), color: i % 2 ? GOLD : BLUE, width: 1 });
      }
      gr.fn(g, { color: t, width: 2.4 }, [a, b]);
      gr.text([gr.view.x0, gr.view.y1], 'y = √(1 + f′(x)²)   — its area from a to b is L', { color: t, font: FONT }, 10, 22);
      gr.text([gr.view.x0, gr.view.y1], 'bars: chord slopes √(1 + (Δy/Δx)²); total bar area = polyline length', { color: muted(ctx), font: FONT }, 10, 40);
    });
    const err = q.value - Ln;
    ctx.warn(q.warning && !q.ok ? `Quadrature: ${q.warning}.` : !Number.isFinite(Ln) ? 'f is not defined everywhere on [a, b].' : '');
    ctx.setReadouts([
      ...(dnode ? [{ label: 'f′(x)', value: toTeX(dnode), tex: true }] : []),
      { label: `polyline, n = ${n}`, value: fmt(Ln, 12) },
      { label: 'arc length L  (quadrature)', value: `${fmt(q.value, 12)}  ±${q.error.toExponential(0)}` },
      { label: 'L − polyline', value: err.toExponential(3), tone: err >= -1e-12 ? 'good' : 'warn' },
      { label: 'n² × (L − polyline)  (≈ constant: order 2)', value: fmt(err * n * n, 5) },
      { label: `ds/dx at x = ${fmt(x0, 3)}`, value: fmt(g(x0), 6) },
    ]);
    ctx.setNote(`The polyline is always shorter than the curve — a chord never exceeds its arc — and $L - L_n \\approx C/n^2$. Here $L = \\int_{${fmt(a, 3)}}^{${fmt(b, 3)}} (1+f'(x)^2)^{1/2}dx = ${fmt(q.value, 10)}$.`);
  };
  return { update, dispose() {} };
}
