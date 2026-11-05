// Diffusion from random walks: thousands of independent walkers released at
// the origin; the histogram of their positions follows the heat kernel,
// including the image solutions for an absorbing or a reflecting wall.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { heatKernel, survival } from '../../core/numeric/pde';
import { fmt, pal, alpha, advance, csv } from './common';

const MAXW = 8000, DT = 0.002, XR = 4;

export const diffusion: DemoDef = {
  id: 'pde.diffusion', module: 'pde', title: 'Diffusion: random walkers and the heat kernel',
  topic: 'Diffusion · random walks · the heat kernel · method of images',
  summary: 'Release walkers at one point and let each take independent random steps. Their density obeys the heat equation: the histogram matches the Gaussian heat kernel, and a wall becomes a boundary condition.',
  tex: 'u_t = D\\,u_{xx},\\qquad u(x,t) = \\frac{1}{\\sqrt{4\\pi D t}}\\,e^{-x^2/4Dt},\\qquad \\langle x^2\\rangle = 2Dt',
  view: 'split2d', animated: true,
  params: [
    { key: 'D', label: 'diffusion coefficient D', value: 0.5, min: 0.05, max: 1.5, step: 0.01 },
    { key: 'M', label: 'number of walkers', value: 3000, min: 200, max: MAXW, step: 100 },
    { key: 'a', label: 'wall position x = a', value: 1.2, min: 0.3, max: 3, step: 0.01 },
    { key: 'bins', label: 'histogram bins', value: 40, min: 12, max: 100, step: 1 },
  ],
  choices: [
    { key: 'wall', label: 'Wall at x = a', value: 'none', options: [['none', 'no wall'], ['absorbing', 'absorbing (u = 0)'], ['reflecting', 'reflecting (uₓ = 0)']] },
    { key: 'step', label: 'Each step', value: 'gauss', options: [['gauss', 'Gaussian'], ['lattice', 'coin flip ±Δ']] },
  ],
  toggles: [{ key: 'kernel', label: 'Exact heat kernel', value: true }, { key: 'rms', label: 'rms circle √⟨r²⟩ = √(4Dt)', value: true }],
  experiments: [
    'Play: the cloud spreads like √t, not t — doubling the spread takes four times as long.',
    'Use coin-flip steps instead of Gaussian ones: after many steps the histogram is the same Gaussian (central limit theorem).',
    'Add an absorbing wall: walkers that touch it vanish. The histogram follows the kernel minus its mirror image, and the surviving fraction follows erf(a/√(4Dt)).',
    'Make the wall reflecting: the mirror image is added instead, and nothing is lost.',
    'Use few walkers (200): the histogram is noisy — the heat equation describes the average of many.',
  ],
  connections: ['pde.heat1d', 'pde.bc', 'pde.schrodinger', 'pde.heat2d'],
  accuracy: 'The walkers are a Monte Carlo simulation (time step 0.002; Gaussian or ±√(2DΔt) steps; a walker crossing an absorbing wall between steps is caught only if it ends past it, so absorption is very slightly underestimated). The curve is the exact heat kernel with the image term for the wall. Statistical noise in a bin of count k is about √k.',
  create: (ctx) => diffusionDemo(ctx),
};

function diffusionDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 'density';
  const X = new Float64Array(MAXW), Y = new Float64Array(MAXW), alive = new Uint8Array(MAXW);
  let M = 0, t = 0, key = '';
  const clock = { lag: 0 };
  const gauss = () => { let u = 0; while (u === 0) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };

  const reset = () => {
    M = Math.round(ctx.params.M);
    for (let i = 0; i < M; i++) { X[i] = 0; Y[i] = 0; alive[i] = 1; }
    t = 0; clock.lag = 0;
  };
  const step = () => {
    const s = Math.sqrt(2 * ctx.params.D * DT), wall = ctx.choices.wall, a = ctx.params.a, lattice = ctx.choices.step === 'lattice';
    for (let i = 0; i < M; i++) {
      if (!alive[i]) continue;
      X[i] += s * (lattice ? (Math.random() < 0.5 ? -1 : 1) : gauss());
      Y[i] += s * (lattice ? (Math.random() < 0.5 ? -1 : 1) : gauss());
      if (X[i] > a) { if (wall === 'absorbing') alive[i] = 0; else if (wall === 'reflecting') X[i] = 2 * a - X[i]; }
    }
    t += DT;
  };

  const draw = () => {
    const c = pal(ctx), D = ctx.params.D, a = ctx.params.a, wall = ctx.choices.wall as 'none' | 'absorbing' | 'reflecting';
    let n = 0, sx2 = 0, sr2 = 0;
    for (let i = 0; i < M; i++) if (alive[i]) { n++; sx2 += X[i] * X[i]; sr2 += X[i] * X[i] + Y[i] * Y[i]; }
    plot.setView({ x0: -XR, x1: XR, y0: -2.8, y1: 2.8 });
    plot.setDraw((g) => {
      if (wall !== 'none') { g.polygon([[a, -10], [a + 0.08, -10], [a + 0.08, 10], [a, 10]], { fill: wall === 'absorbing' ? alpha(c.red, 0.5) : alpha(c.muted, 0.6) }); g.text([a, g.view.y1 - 0.6], wall === 'absorbing' ? ' absorbing wall' : ' reflecting wall', { color: wall === 'absorbing' ? c.red : c.muted, font: '12px Inter, sans-serif', baseline: 'top' }, 10, 0); }
      for (let i = 0; i < M; i++) if (alive[i]) g.point([X[i], Y[i]], 1.6, { fill: alpha(c.gold, 0.75) });
      if (ctx.toggles.rms && t > 0) g.parametric((s) => Math.sqrt(4 * D * t) * Math.cos(s), (s) => Math.sqrt(4 * D * t) * Math.sin(s), 0, 2 * Math.PI, { color: c.cyan, width: 1.8, dash: [6, 4] }, 160);
      g.point([0, 0], 3.5, { fill: c.ink });
      g.text([g.view.x0 + 0.15, g.view.y1 - 0.15], `t = ${t.toFixed(3)}   walkers left: ${n} of ${M}`, { color: c.ink, font: '600 12px Inter, sans-serif', baseline: 'top' });
    });
    // histogram of x
    const B = Math.round(ctx.params.bins), w = (2 * XR) / B, hist = new Float64Array(B);
    for (let i = 0; i < M; i++) if (alive[i]) { const k = Math.floor((X[i] + XR) / w); if (k >= 0 && k < B) hist[k]++; }
    const dens = Array.from(hist, (h) => h / (M * w));
    const peak = t > 0 ? Math.max(heatKernel(0, t, D) * (wall === 'reflecting' ? 1.6 : 1.1), ...dens) : Math.max(1, ...dens);
    plot2.setView({ x0: -XR, x1: XR, y0: -0.04 * peak, y1: peak * 1.12 });
    let dev = 0, devZ = 0;
    plot2.setDraw((g) => {
      for (let k = 0; k < B; k++) {
        const x0 = -XR + k * w;
        if (dens[k] > 0) g.polygon([[x0, 0], [x0 + w, 0], [x0 + w, dens[k]], [x0, dens[k]]], { fill: alpha(c.gold, 0.45), color: alpha(c.gold, 0.9), width: 1 });
      }
      if (ctx.toggles.kernel && t > 0) {
        const K = (x: number) => (wall !== 'none' && x > a ? NaN : heatKernel(x, t, D, 0, wall, a));
        g.fn(K, { color: c.blue, width: 3 }, [-XR, wall === 'none' ? XR : Math.min(XR, a)]);
        if (wall !== 'none') g.fn((x) => (x > a ? NaN : heatKernel(x, t, D)), { color: c.muted, width: 1.4, dash: [4, 4] }, [-XR, Math.min(XR, a)]);
      }
      if (wall !== 'none') g.line([a, 0], [a, peak * 1.1], { color: wall === 'absorbing' ? c.red : c.muted, width: 2 });
      g.text([-XR + 0.15, peak * 1.08], `histogram of x (${M} walkers)`, { color: c.gold, font: '12px Inter, sans-serif', baseline: 'top' });
      if (ctx.toggles.kernel) g.text([-XR + 0.15, peak * 0.99], wall === 'none' ? '━ exact heat kernel' : `━ exact: kernel ${wall === 'absorbing' ? '−' : '+'} mirror image   ┅ no wall`, { color: c.blue, font: '12px Inter, sans-serif', baseline: 'top' });
    });
    if (t > 0) for (let k = 0; k < B; k++) {
      const xm = -XR + (k + 0.5) * w;
      if (wall !== 'none' && xm > a) continue;
      const e = heatKernel(xm, t, D, 0, wall, a) * M * w;
      dev = Math.max(dev, Math.abs(hist[k] - e));
      devZ = Math.max(devZ, Math.abs(hist[k] - e) / Math.sqrt(Math.max(e, 1)));
    }
    const rows = [
      { label: 't', value: fmt(t, 4) },
      { label: wall === 'none' ? '⟨x²⟩ measured vs 2Dt' : '⟨x²⟩ measured', value: `${fmt(n ? sx2 / n : 0, 4)}${wall === 'none' ? ` vs ${fmt(2 * D * t, 4)}` : ''}` },
      { label: '⟨r²⟩ measured vs 4Dt', value: wall === 'none' ? `${fmt(n ? sr2 / n : 0, 4)} vs ${fmt(4 * D * t, 4)}` : '(wall breaks the symmetry)' },
      { label: 'surviving fraction', value: wall === 'absorbing' ? `${fmt(n / M, 4)} vs erf(a/√4Dt) = ${fmt(survival(t, D, 0, a), 4)}` : '1 (nothing absorbed)' },
      { label: 'worst bin, in units of √(expected count)', value: t > 0 ? fmt(devZ, 3) : '—', tone: (devZ < 4 ? 'good' : 'warn') as 'good' | 'warn' },
    ];
    ctx.setReadouts(rows);
    ctx.setNote(`Each walker takes independent steps of variance $2D\\,\\Delta t$ in $x$ and in $y$. The *density* of walkers solves $u_t = D\\nabla^2 u$; a wall is a boundary condition: absorbing means $u = 0$ there (subtract the mirror image), reflecting means $u_x = 0$ (add it). *Analogy, not identity:* the Schrödinger equation $i\\hbar\\psi_t = -\\tfrac{\\hbar^2}{2m}\\psi_{xx}$ is a diffusion equation with an imaginary coefficient — see *Heat vs Schrödinger*.`);
  };

  const update = () => {
    const k = [ctx.params.M, ctx.choices.wall, ctx.params.a, ctx.choices.step, ctx.params.D].join('|');
    if (k !== key) { key = k; reset(); }
    draw();
  };
  return {
    update,
    tick(dtReal) { advance(dtReal, 0.4, DT, 40, step, clock); draw(); },
    reset() { reset(); draw(); },
    csv() { const xs: number[] = [], ys: number[] = []; for (let i = 0; i < M; i++) if (alive[i]) { xs.push(X[i]); ys.push(Y[i]); } return csv(['x', 'y'], [xs, ys]); },
    dispose() {},
  };
}
