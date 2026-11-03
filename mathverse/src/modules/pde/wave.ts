// Waves on a string: d'Alembert's exact travelling-wave solution with
// reflections at fixed or free ends (by odd/even extension), its right- and
// left-moving parts, the x–t diagram with characteristics, and leapfrog as
// the numerical comparison.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { Wave1D, dalembert } from '../../core/numeric/pde';
import { fmt, pal, alpha, drawEnd, advance, csv, clamp, heatImage, divergingLut, P } from './common';

const IMG_W = 220, IMG_H = 170;

interface Shape { f: (x: number) => number; v: (x: number) => number; h: (x: number) => number; peak: P | null; desc: string }

function shapeFor(kind: string, x0: number, w: number, A: number, c: number, n: number, lf: boolean, rf: boolean): Shape {
  const a = Math.PI / (2 * w);
  const bump = (x: number) => (Math.abs(x - x0) < w ? A * Math.cos(a * (x - x0)) ** 2 : 0);
  const dbump = (x: number) => (Math.abs(x - x0) < w ? -A * a * Math.sin(2 * a * (x - x0)) : 0);
  // ∫₀ˣ bump / A
  const ibump = (x: number) => { const s = clamp(x - x0, -w, w); return (s + w) / 2 + Math.sin(2 * a * s) / (4 * a); };
  switch (kind) {
    case 'pluck': return { f: (x) => (x <= x0 ? (A * x) / x0 : (A * (1 - x)) / (1 - x0)), v: () => 0, h: () => 0, peak: [x0, A], desc: 'A plucked string: released from rest as a triangle. The kink splits into two kinks running apart.' };
    case 'gauss': return { f: bump, v: () => 0, h: () => 0, peak: [x0, A], desc: 'A bump released from rest splits into two half-height copies, one running each way: $u = \\tfrac12 f(x - ct) + \\tfrac12 f(x + ct)$.' };
    case 'moving': return { f: bump, v: (x) => -c * dbump(x), h: (x) => -bump(x), peak: [x0, A], desc: 'With $u_t(x, 0) = -c f\'(x)$ the whole bump moves right: $u = f(x - ct)$ until it meets an end.' };
    case 'hammer': return { f: () => 0, v: (x) => (c / w) * bump(x), h: (x) => (A / w) * ibump(x), peak: [x0, 0], desc: 'A hammer strike: the string starts flat but moving, $u_t(x,0) = g(x)$. The displacement spreads as a growing plateau $\\tfrac1{2c}\\int_{x-ct}^{x+ct} g$.' };
    default: {
      const k = lf && rf ? n * Math.PI : !lf && !rf ? n * Math.PI : (n - 0.5) * Math.PI;
      const f = lf ? (x: number) => A * Math.sin(k * x) : (x: number) => A * Math.cos(k * x);
      return { f, v: () => 0, h: () => 0, peak: null, desc: `A normal mode of this string, $${lf ? '\\sin' : '\\cos'}(${fmt(k / Math.PI, 3)}\\pi x)$: the two travelling halves add to a **standing wave** $\\cos(${fmt(k / Math.PI, 3)}\\pi c t)\\,${lf ? '\\sin' : '\\cos'}(\\ldots x)$ with fixed nodes.` };
    }
  }
}

export const wave: DemoDef = {
  id: 'pde.wave', module: 'pde', title: 'Waves on a string',
  topic: "Wave equation · d'Alembert's solution · characteristics · reflections at fixed and free ends · leapfrog",
  summary: "A string under tension: d'Alembert's exact solution as two travelling waves, reflecting inverted from a fixed end and upright from a free one, with its x–t diagram and the leapfrog scheme beside it.",
  tex: 'u_{tt} = c^2 u_{xx},\\qquad u(x,t) = \\tfrac12\\left[F(x - ct) + F(x + ct)\\right] + \\tfrac1{2c}\\int_{x-ct}^{x+ct} G(s)\\,ds',
  view: 'split2d', animated: true,
  params: [
    { key: 'c', label: 'wave speed c', value: 1, min: 0.25, max: 2, step: 0.01 },
    { key: 'x0', label: 'position x₀ (drag the peak)', value: 0.3, min: 0.05, max: 0.95, step: 0.005 },
    { key: 'A', label: 'amplitude A', value: 0.6, min: -1, max: 1, step: 0.01 },
    { key: 'w', label: 'pulse half-width', value: 0.1, min: 0.03, max: 0.3, step: 0.005 },
    { key: 'n', label: 'mode number (standing wave)', value: 2, min: 1, max: 8, step: 1 },
    { key: 'N', label: 'grid intervals N', value: 120, min: 20, max: 400, step: 1 },
    { key: 'C', label: 'Courant number C = cΔt/Δx', value: 0.9, min: 0.1, max: 1.2, step: 0.005 },
  ],
  choices: [
    { key: 'ic', label: 'Initial state', value: 'gauss', options: [['pluck', 'plucked (triangle)'], ['gauss', 'bump at rest'], ['moving', 'right-moving pulse'], ['hammer', 'hammer strike (velocity)'], ['mode', 'standing wave (mode n)']] },
    { key: 'left', label: 'Left end', value: 'fixed', options: [['fixed', 'fixed'], ['free', 'free']] },
    { key: 'right', label: 'Right end', value: 'fixed', options: [['fixed', 'fixed'], ['free', 'free']] },
  ],
  toggles: [
    { key: 'parts', label: 'Travelling parts R(x − ct), L(x + ct)', value: false },
    { key: 'num', label: 'Numerical (leapfrog)', value: true },
    { key: 'chars', label: 'Characteristics x ± ct', value: true },
  ],
  experiments: [
    'Release the bump at rest: it splits in two. Turn on the travelling parts to see them separately.',
    'Send the right-moving pulse into a fixed end (it returns upside down), then make that end free (it returns upright).',
    'Pluck the string near one end and play: the kinks bounce and the triangle re-forms after one period 2L/c.',
    'Set C = 1 exactly: leapfrog becomes exact on the grid. At C = 1.01 it explodes.',
    'Make both ends free and strike with the hammer: the whole string drifts away — the zero-frequency mode has momentum.',
  ],
  connections: ['pde.stability', 'pde.membrane', 'pde.classify', 'pde.separation', 'pde.fourier'],
  accuracy: "The gold curve and the x–t diagram are d'Alembert's formula evaluated exactly (the initial shapes have closed-form antiderivatives; reflections by odd/even extension). The blue dots are the leapfrog finite-difference solution with a second-order Taylor first step; its error and its exactly conserved discrete energy are reported.",
  tutorial: [
    { text: '**A string under tension.** $u_{tt} = c^2u_{xx}$: where the string is curved, tension accelerates it back toward straight; $c = (T/\\mu)^{1/2}$ (tension over mass per length). Press **play** and watch the plucked string.', task: 'Play for a few seconds.', set: { choices: { ic: 'pluck', left: 'fixed', right: 'fixed' }, params: { x0: 0.3, A: 0.6, c: 1, C: 0.9 }, toggles: { parts: false, num: true, chars: true } }, done: (c) => c.time.t > 3 },
    { text: "**d'Alembert.** Every solution on the infinite line is $u = R(x - ct) + L(x + ct)$: one shape moving right, one moving left, both unchanged. A bump released at rest splits into two halves.", task: 'Turn on the travelling parts.', set: { choices: { ic: 'gauss' }, params: { x0: 0.5, w: 0.1 } }, done: (c) => !!c.toggles.parts },
    { text: '**Characteristics.** In the $x$–$t$ diagram (right), information travels along the lines $x \\pm ct = $ const. The value at a point depends only on the initial data between the two characteristics through it — its *domain of dependence*.', task: 'Double the wave speed: the characteristics get steeper.', done: (c) => c.params.c >= 1.9 },
    { text: '**A fixed end reflects upside down.** At $x = L$, $u = 0$ for all time. The trick: extend the string past the end with an *inverted mirror image* (odd extension); the image arrives as the real pulse leaves.', task: 'Play the right-moving pulse until it has bounced off the right end.', set: { choices: { ic: 'moving', left: 'fixed', right: 'fixed' }, params: { x0: 0.3, c: 1, w: 0.1 } }, done: (c) => c.time.t > 3.5 },
    { text: '**A free end reflects upright.** A free end (a massless ring sliding on a pole) has $u_x = 0$: the mirror image is upright (even extension), and for an instant the end swings to twice the amplitude.', task: 'Make the right end free and watch the reflection.', done: (c) => c.choices.right === 'free' },
    { text: '**Leapfrog.** $u_j^{n+1} = 2u_j^n - u_j^{n-1} + C^2(u_{j-1}^n - 2u_j^n + u_{j+1}^n)$ with Courant number $C = c\\Delta t/\\Delta x$. It is stable for $C \\le 1$ (CFL) — and at exactly $C = 1$ it is *exact* on the grid, because the characteristics then pass through grid points.', task: 'Set C to exactly 1 with the plucked string: the error drops to rounding level.', set: { choices: { ic: 'pluck', right: 'fixed' }, params: { C: 0.8 } }, done: (c) => Math.abs(c.params.C - 1) < 1e-9 },
    { text: '**Physics.** A guitar string is this equation: plucking near the bridge excites many harmonics (a bright tone), plucking near the middle mostly the first (a mellow one) — compare the triangle\'s Fourier series in *Fourier series*. Real strings also have stiffness, which makes high harmonics slightly sharp; this model leaves it out.' },
  ],
  create: (ctx) => waveDemo(ctx),
};

function waveDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'u';
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 't';
  let shape: Shape, sol: ReturnType<typeof dalembert>, num: Wave1D | null = null;
  let key = '', simT = 0, E0 = 0, blown = false, behind = false, img: ImageData | null = null, imgKey = '', umax = 1;
  const clock = { lag: 0 };

  const rebuild = () => {
    const p = ctx.params, lf = ctx.choices.left === 'fixed', rf = ctx.choices.right === 'fixed';
    const w = p.w, x0 = clamp(p.x0, w + 0.005, 1 - w - 0.005);
    shape = shapeFor(ctx.choices.ic, ctx.choices.ic === 'pluck' ? clamp(p.x0, 0.05, 0.95) : x0, w, p.A, p.c, Math.round(p.n), lf, rf);
    sol = dalembert(shape.f, shape.h, 1, p.c, lf, rf);
    const N = Math.round(p.N);
    num = new Wave1D(1, N, p.c, lf, rf);
    num.init(shape.f, shape.v, (p.C / N) / p.c);
    E0 = num.energy();
    simT = 0; clock.lag = 0; blown = false; behind = false; imgKey = '';
  };

  const period = () => (ctx.choices.left === ctx.choices.right ? 2 : 4) / ctx.params.c;

  const draw = () => {
    const c = pal(ctx), p = ctx.params, lf = ctx.choices.left === 'fixed', rf = ctx.choices.right === 'fixed';
    const T = period(), win = Math.floor(simT / T), t0 = win * T;
    // x–t image for this window (exact)
    const ik = `${key}|${win}|${ctx.dark}`;
    if (ik !== imgKey) {
      umax = 1e-9;
      const vals = new Float64Array(IMG_W * IMG_H);
      for (let j = 0; j < IMG_H; j++) for (let i = 0; i < IMG_W; i++) { const v = sol.u((i + 0.5) / IMG_W, t0 + ((j + 0.5) / IMG_H) * T); vals[j * IMG_W + i] = v; umax = Math.max(umax, Math.abs(v)); }
      img = heatImage(IMG_W, IMG_H, (i, j) => vals[j * IMG_W + i], -umax, umax, divergingLut(ctx.dark), img);
      imgKey = ik;
    }
    const ym = Math.max(umax, Math.abs(p.A), 0.2) * 1.25;
    plot.setView({ x0: -0.07, x1: 1.07, y0: -ym, y1: ym * 1.1 });
    const ex = (x: number) => sol.u(x, simT);
    let emax = 0;
    const U = num ? (simT === 0 ? num.uOld : num.u) : null;
    if (num && U && !blown) for (let i = 0; i < num.n; i++) emax = Math.max(emax, Math.abs(U[i] - ex(num.x[i])));
    plot.setDraw((g) => {
      drawEnd(g, lf ? 'fixed' : 'free', 0, -1, -ym * 0.85, ym * 0.85, c, lf ? 'fixed' : 'free');
      drawEnd(g, rf ? 'fixed' : 'free', 1, 1, -ym * 0.85, ym * 0.85, c, rf ? 'fixed' : 'free');
      if (ctx.toggles.parts) {
        g.fn((x) => sol.right(x, simT), { color: alpha(c.red, 0.9), width: 1.6, dash: [6, 4] }, [0, 1]);
        g.fn((x) => sol.left(x, simT), { color: alpha(c.green, 0.9), width: 1.6, dash: [6, 4] }, [0, 1]);
      }
      g.fn(ex, { color: c.gold, width: 3.2 }, [0, 1]);
      if (ctx.toggles.num && num && !blown) {
        const step = Math.max(1, Math.round(num.n / 120));
        for (let i = 0; i < num.n; i += step) g.point([num.x[i], clamp(U![i], -ym * 3, ym * 3)], 2.6, { fill: c.blue });
      }
      for (const end of [0, 1]) g.point([end, ex(end)], 4.5, { fill: c.ink });
      if (shape.peak && simT === 0) g.handle({ id: 'peak', at: shape.peak, color: c.orange, onDrag: ([x, y]) => { ctx.setParam('x0', clamp(+x.toFixed(3), 0.05, 0.95)); if (ctx.choices.ic !== 'hammer') ctx.setParam('A', clamp(+y.toFixed(3), -1, 1)); } });
      const f = '12px Inter, system-ui, sans-serif';
      g.text([0.1, ym * 1.06], "━ exact (d'Alembert)", { color: c.gold, font: f, baseline: 'top' });
      if (ctx.toggles.num) g.text([0.1, ym * 0.93], `● leapfrog, N = ${Math.round(p.N)}, C = ${fmt(p.C, 3)}`, { color: c.blue, font: f, baseline: 'top' });
      if (ctx.toggles.parts) g.text([0.55, ym * 1.06], '┅ R(x − ct)   ┅ L(x + ct)', { color: c.muted, font: f, baseline: 'top' });
      g.text([0.97, -ym * 0.95], `t = ${simT.toFixed(3)}`, { color: c.ink, font: '600 13px Inter, sans-serif', align: 'right', baseline: 'bottom' });
    });
    // the x–t diagram
    plot2.setView({ x0: -0.05, x1: 1.05, y0: t0 - 0.03 * T, y1: t0 + T * 1.03 });
    plot2.setDraw((g) => {
      if (img) g.image(img, 0, 1, t0, t0 + T);
      if (ctx.toggles.chars && shape.peak) {
        const xs = shape.peak[0];
        const fold = (q: number) => { const m = ((q % 2) + 2) % 2; return m <= 1 ? m : 2 - m; };
        for (const dir of [1, -1]) g.path(Array.from({ length: 241 }, (_, k) => { const tt = t0 + (k / 240) * T; return [fold(xs + dir * p.c * tt), tt] as P; }).filter((q, k, arr) => k === 0 || Math.abs(q[0] - arr[k - 1][0]) < 0.5), { color: dir > 0 ? c.red : c.green, width: 1.6, dash: [5, 4] });
      }
      g.line([0, simT], [1, simT], { color: c.ink, width: 2 });
      g.text([0.02, simT], 'now', { color: c.ink, font: '600 12px Inter, sans-serif', baseline: 'bottom' }, 0, -3);
      g.text([0.5, t0 + T * 1.025], `x–t diagram (exact), one period 0 ≤ t − ${fmt(t0, 3)} ≤ ${fmt(T, 3)}`, { color: c.muted, font: '11px Inter, sans-serif', align: 'center', baseline: 'top' });
    });
    const E = num ? num.energy() : 0, drift = E0 > 0 ? Math.abs(E - E0) / E0 : 0;
    const C = p.C;
    ctx.setReadouts([
      { label: 't', value: fmt(simT, 4) },
      { label: 'period of the motion', value: `${fmt(T, 4)}  (${ctx.choices.left === ctx.choices.right ? '2L/c' : '4L/c'})` },
      { label: 'Courant number C = cΔt/Δx', value: fmt(C, 4), tone: C > 1 + 1e-12 ? 'bad' : Math.abs(C - 1) < 1e-9 ? 'good' : undefined },
      { label: 'max |leapfrog − exact|', value: blown ? 'blown up' : fmt(emax, 3), tone: blown ? 'bad' : emax < 1e-3 ? 'good' : 'warn' },
      { label: 'discrete energy drift', value: blown ? '—' : fmt(drift, 2), tone: drift < 1e-9 ? 'good' : undefined },
      { label: 'u at the ends (exact)', value: `${fmt(ex(0), 3)}, ${fmt(ex(1), 3)}` },
    ]);
    ctx.setNote(`${shape.desc}\n\nEnds: a **fixed** end reflects the pulse **inverted** (odd extension of the data); a **free** end reflects it **upright** (even extension).`);
    ctx.warn(blown ? `Leapfrog blew up: C = ${fmt(C, 3)} > 1 violates the CFL condition (the scheme's domain of dependence no longer contains the true one). Lower C and press reset.`
      : C > 1 + 1e-12 ? `Unstable: the CFL condition needs C = cΔt/Δx ≤ 1; C = ${fmt(C, 3)}. The highest grid modes will grow.`
      : behind ? 'The solver cannot keep up at this resolution and speed; the clock is slowed to match.' : '');
  };

  const update = () => {
    const p = ctx.params;
    const k = [ctx.choices.ic, ctx.choices.left, ctx.choices.right, p.c, p.x0, p.A, p.w, p.n, p.N, p.C].join('|');
    if (k !== key || !num) { key = k; rebuild(); }
    draw();
  };
  return {
    update,
    tick(dtReal) {
      if (!num || blown) return;
      const n = num;
      behind = advance(dtReal, 0.25, n.dt, 4000, () => n.step(), clock).behind;
      simT = n.t;
      for (let i = 0; i < n.n; i += 3) if (!(Math.abs(n.u[i]) < 1e6)) { blown = true; break; }
      draw();
    },
    reset() { rebuild(); },
    csv() { const n = num!; return csv(['x', 'u_leapfrog', 'u_exact', 't'], [n.x, n.u, Array.from(n.x, (x) => sol.u(x, n.t)), [n.t]]); },
    dispose() {},
  };
}
