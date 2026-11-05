// Stability: von Neumann's amplification factor G(θ) for the heat schemes
// (FTCS, BTCS, Crank–Nicolson) and leapfrog for the wave equation, beside the
// scheme actually running on a grid, seeded with rounding-sized noise so an
// unstable choice of r (or of the Courant number C) visibly blows up.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { Heat1D, Wave1D, amplification, Scheme1D } from '../../core/numeric/pde';
import { fmt, pal, alpha, drawEnd, advance, csv, clamp, P } from './common';

type S = Scheme1D | 'leapfrog';
const NAME: Record<S, string> = { ftcs: 'FTCS', btcs: 'BTCS', cn: 'Crank–Nicolson', leapfrog: 'leapfrog (wave)' };
const GTEX: Record<S, string> = {
  ftcs: 'G(\\theta) = 1 - 4r\\sin^2\\tfrac\\theta2',
  btcs: 'G(\\theta) = \\dfrac{1}{1 + 4r\\sin^2\\tfrac\\theta2}',
  cn: 'G(\\theta) = \\dfrac{1 - 2r\\sin^2\\tfrac\\theta2}{1 + 2r\\sin^2\\tfrac\\theta2}',
  leapfrog: 'G^2 - 2\\left(1 - 2C^2\\sin^2\\tfrac\\theta2\\right)G + 1 = 0',
};
const NOISE = 1e-6;

export const stability: DemoDef = {
  id: 'pde.stability', module: 'pde', title: 'Stability, von Neumann and the CFL condition',
  topic: 'Stability and convergence · von Neumann analysis · CFL condition · Lax equivalence',
  summary: 'Every Fourier mode is multiplied by an amplification factor G(θ) each step. If |G| > 1 for any mode the grid can hold, rounding errors grow without bound — watch it happen.',
  tex: 'u_j^n = G^n e^{ij\\theta}\\ \\Rightarrow\\ \\text{stable} \\iff |G(\\theta)| \\le 1\\ \\ \\forall\\theta;\\qquad \\text{FTCS: } r = \\tfrac{\\alpha\\Delta t}{\\Delta x^2} \\le \\tfrac12,\\quad \\text{leapfrog: } C = \\tfrac{c\\Delta t}{\\Delta x} \\le 1',
  view: 'split2d', animated: true,
  params: [
    { key: 'r', label: 'r = αΔt/Δx²  (wave: C = cΔt/Δx)', value: 0.4, min: 0.05, max: 1.5, step: 0.005 },
    { key: 'N', label: 'grid intervals N', value: 30, min: 8, max: 80, step: 1 },
  ],
  choices: [{ key: 'scheme', label: 'Scheme', value: 'ftcs', options: [['ftcs', 'FTCS'], ['btcs', 'BTCS'], ['cn', 'Crank–Nicolson'], ['leapfrog', 'Leapfrog (wave)']] }],
  toggles: [{ key: 'noise', label: 'Seed rounding-size noise (10⁻⁶ zigzag)', value: true }, { key: 'exact', label: 'Exact solution', value: true }],
  experiments: [
    'FTCS at r = 0.49: calm. At r = 0.52: after a few dozen steps a zigzag erupts — the mode θ = π has |G| = |1 − 4r| > 1.',
    'Drag the orange handle on the G-curve down past −1 and watch the left panel react.',
    'Crank–Nicolson at r = 1.5: stable, but G(π) ≈ −0.5 means the zigzag flips sign every step as it decays.',
    'Leapfrog: C = 1 is stable (and exact); C = 1.02 explodes. The numerical domain of dependence must contain the physical one.',
    'Turn the noise off: even an unstable scheme looks fine for a while — until rounding error alone seeds the bad mode.',
  ],
  connections: ['pde.heat1d', 'pde.wave', 'pde.relax', 'pde.schrodinger'],
  accuracy: 'G(θ) is exact for each scheme (von Neumann analysis of the constant-coefficient problem; with Dirichlet ends the grid holds the modes θ = kπ/N, marked on the curve). The left panel runs the actual scheme; the noise is deliberately added at 10⁻⁶ to stand in for rounding error so growth is visible in seconds.',
  tutorial: [
    { text: '**What stability means.** A scheme is stable when errors — from rounding, from the initial data — do not grow. Von Neumann\'s idea: try one Fourier mode $u_j^n = G^n e^{ij\\theta}$. Each step multiplies it by the **amplification factor** $G(\\theta)$; stability needs $|G(\\theta)| \\le 1$ for every $\\theta$ the grid can carry.', task: 'Press play: FTCS at r = 0.4 follows the exact decay.', set: { choices: { scheme: 'ftcs' }, params: { r: 0.4, N: 30 }, toggles: { noise: true, exact: true } }, done: (c) => c.time.t > 1.5 },
    { text: '**FTCS.** Substituting into $u_j^{n+1} = u_j^n + r(u_{j-1}^n - 2u_j^n + u_{j+1}^n)$ gives $G = 1 - 4r\\sin^2\\tfrac\\theta2$. The worst mode is the zigzag $\\theta = \\pi$ with $G = 1 - 4r$, which drops below $-1$ exactly when $r > \\tfrac12$.', task: 'Push r just above ½ (or drag the orange handle below −1) and play.', set: { params: { r: 0.45 } }, done: (c) => c.choices.scheme === 'ftcs' && c.params.r > 0.5 },
    { text: '**Why it explodes slowly, then suddenly.** The zigzag starts at $10^{-6}$ and grows by $|1 - 4r|$ per step: at $r = 0.52$ that is $1.08$, so it needs about $180$ steps to reach size 1 — and then a few more to swamp everything. Growth is geometric.', task: 'Compare the measured growth per step with |G(π)| in the readouts.' },
    { text: '**Lax equivalence theorem.** For a consistent linear scheme, *stable ⇔ convergent*. Consistency alone is not enough: FTCS at $r = 0.52$ is consistent but its answers are worthless.', task: 'Reset and lower r below ½ again.', done: (c) => c.choices.scheme === 'ftcs' && c.params.r <= 0.5 },
    { text: '**Implicit schemes** are unconditionally stable: BTCS has $G = 1/(1 + 4r\\sin^2\\tfrac\\theta2) \\in (0, 1]$ and Crank–Nicolson $|G| \\le 1$ for every $r$. But CN\'s $G(\\pi) \\to -1$ as $r \\to \\infty$: sharp features decay slowly while flipping sign each step.', task: 'Choose Crank–Nicolson with r ≥ 1.', set: { params: { r: 1.2 } }, done: (c) => c.choices.scheme === 'cn' && c.params.r >= 1 },
    { text: '**Waves and the CFL condition.** For $u_{tt} = c^2u_{xx}$ by leapfrog, $G$ solves $G^2 - 2(1 - 2C^2\\sin^2\\tfrac\\theta2)G + 1 = 0$: $|G| = 1$ for $C \\le 1$, but for $C > 1$ one root exceeds 1. Courant–Friedrichs–Lewy: information must not travel more than one cell per step.', task: 'Choose leapfrog and set C above 1.', set: { choices: { scheme: 'leapfrog' }, params: { r: 0.9 } }, done: (c) => c.choices.scheme === 'leapfrog' && c.params.r > 1 },
    { text: '**The magic step.** At exactly $C = 1$ leapfrog is not just stable but *exact* for the 1D wave equation on the grid — every characteristic passes through grid points. Try it in *Waves on a string*.', set: { params: { r: 1 } } },
  ],
  create: (ctx) => stabilityDemo(ctx),
};

function stabilityDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'u';
  plot2.opts.xLabel = 'θ = kΔx'; plot2.opts.yLabel = ctx.choices.scheme === 'leapfrog' ? '|G|' : 'G';
  let heat: Heat1D | null = null, wave: Wave1D | null = null;
  let key = '', steps = 0, blown = false, err = 0, errPrev = 0, growth = NaN;
  const clock = { lag: 0 };
  let exact = new Float64Array(0);

  const scheme = () => ctx.choices.scheme as S;
  const rebuild = () => {
    const N = Math.round(ctx.params.N), noise = ctx.toggles.noise ? NOISE : 0;
    // the zigzag (−1)^j is cos(Nπx) on the grid; tapered by sin πx so it vanishes at the ends
    if (scheme() === 'leapfrog') {
      heat = null;
      wave = new Wave1D(1, N, 1, true, true);
      wave.init((x) => Math.sin(Math.PI * x) + noise * Math.cos(N * Math.PI * x) * Math.sin(Math.PI * x), () => 0, ctx.params.r / N);
    } else {
      wave = null;
      heat = new Heat1D({ L: 1, N, alpha: 1 });
      heat.setInitial((x) => Math.sin(Math.PI * x) + noise * Math.cos(N * Math.PI * x) * Math.sin(Math.PI * x));
    }
    exact = new Float64Array(N + 1);
    steps = 0; blown = false; err = errPrev = 0; growth = NaN; clock.lag = 0;
  };
  const dt = () => { const N = Math.round(ctx.params.N); return scheme() === 'leapfrog' ? ctx.params.r / N : ctx.params.r / (N * N); };
  const tNow = () => (heat ? heat.t : wave!.t);
  const uNow = () => (heat ? heat.u : wave!.u);

  const Gpi = (r: number) => amplification(scheme() === 'leapfrog' ? 'leapfrog' : scheme(), r, Math.PI);
  const rFromG = (G: number): number | null => {
    switch (scheme()) {
      case 'ftcs': return (1 - G) / 4;
      case 'btcs': return G > 0.02 ? (1 / G - 1) / 4 : null;
      case 'cn': return G > -0.98 ? (1 - G) / (2 * (1 + G)) : null;
      case 'leapfrog': { const g = Math.max(G, 1); return Math.sqrt((1 + (g + 1 / g) / 2) / 2); }
    }
  };

  const draw = () => {
    const c = pal(ctx), N = Math.round(ctx.params.N), t = tNow(), u = uNow(), s = scheme(), r = ctx.params.r;
    const isWave = s === 'leapfrog';
    for (let j = 0; j <= N; j++) exact[j] = (isWave ? Math.cos(Math.PI * t) : Math.exp(-Math.PI * Math.PI * t)) * Math.sin((Math.PI * j) / N);
    plot.setView({ x0: -0.08, x1: 1.08, y0: -1.35, y1: 1.45 });
    plot.setDraw((g) => {
      drawEnd(g, 'dirichlet', 0, -1, -0.12, 0.12, c);
      drawEnd(g, 'dirichlet', 1, 1, -0.12, 0.12, c);
      if (ctx.toggles.exact) g.path(Array.from({ length: 201 }, (_, i) => { const x = i / 200; return [x, (isWave ? Math.cos(Math.PI * t) : Math.exp(-Math.PI * Math.PI * t)) * Math.sin(Math.PI * x)] as P; }), { color: c.gold, width: 3 });
      const pts = Array.from({ length: N + 1 }, (_, j) => [j / N, clamp(u[j], -50, 50)] as P);
      g.path(pts, { color: blown ? c.red : c.blue, width: 1.6 });
      for (const p of pts) g.point(p, 3.2, { fill: blown ? c.red : c.blue });
      const f = '12px Inter, system-ui, sans-serif';
      g.text([0.03, 1.4], `● ${NAME[s]}   step ${steps}   t = ${fmt(t, 4)}`, { color: c.blue, font: f, baseline: 'top' });
      if (ctx.toggles.exact) g.text([0.03, 1.28], `━ exact  ${isWave ? 'cos(πt) sin(πx)' : 'e^(−π²t) sin(πx)'}`, { color: c.gold, font: f, baseline: 'top' });
    });
    // the amplification factor
    const y0 = isWave ? 0 : -2.2, y1 = isWave ? 3 : 1.5;
    plot2.opts.yLabel = isWave ? '|G|' : 'G';
    plot2.setView({ x0: -0.15, x1: Math.PI + 0.25, y0, y1 });
    const Gf = (th: number) => amplification(isWave ? 'leapfrog' : s, r, th);
    let gmax = 0;
    for (let k = 1; k < N; k++) gmax = Math.max(gmax, Math.abs(Gf((k * Math.PI) / N)));
    plot2.setDraw((g) => {
      g.polygon([[0, 1], [Math.PI, 1], [Math.PI, y1], [0, y1]], { fill: alpha(c.red, 0.1) });
      if (!isWave) g.polygon([[0, -1], [Math.PI, -1], [Math.PI, y0], [0, y0]], { fill: alpha(c.red, 0.1) });
      g.line([0, 1], [Math.PI, 1], { color: alpha(c.red, 0.7), width: 1.2, dash: [5, 4] });
      if (!isWave) g.line([0, -1], [Math.PI, -1], { color: alpha(c.red, 0.7), width: 1.2, dash: [5, 4] });
      g.text([0.05, y1 - 0.05 * (y1 - y0)], '|G| > 1: unstable', { color: c.red, font: '12px Inter, sans-serif', baseline: 'top' });
      if (!isWave) g.fn((th) => amplification('exact', r, th), { color: c.gold, width: 2, dash: [6, 4] }, [0, Math.PI]);
      else g.line([0, 1], [Math.PI, 1], { color: c.gold, width: 2, dash: [6, 4] });
      g.fn(Gf, { color: c.blue, width: 3 }, [0, Math.PI]);
      for (let k = 1; k < N; k++) { const th = (k * Math.PI) / N; g.point([th, Gf(th)], 2.2, { fill: Math.abs(Gf(th)) > 1 + 1e-12 ? c.red : c.blue }); }
      g.text([Math.PI, Gf(Math.PI)], 'zigzag θ = π', { color: c.orange, font: '12px Inter, sans-serif', align: 'right' }, -12, Gf(Math.PI) > (y0 + y1) / 2 ? 18 : -12);
      g.text([0.05, y0 + 0.11 * (y1 - y0)], `━ ${NAME[s]}`, { color: c.blue, font: '12px Inter, sans-serif', baseline: 'top' });
      g.text([0.05, y0 + 0.05 * (y1 - y0)], isWave ? '┅ exact |G| = 1 (no growth, no decay)' : '┅ exact e^(−rθ²) (one step of the true decay)', { color: c.gold, font: '12px Inter, sans-serif', baseline: 'top' });
      g.handle({ id: 'G', at: [Math.PI, clamp(Gf(Math.PI), y0, y1)], color: c.orange, onDrag: ([, G]) => { const nr = rFromG(G); if (nr !== null && Number.isFinite(nr)) ctx.setParam('r', clamp(+nr.toFixed(3), 0.05, 1.5)); }, constrain: ([, G]) => [Math.PI, G] });
    });
    const crit = s === 'ftcs' ? 0.5 : s === 'leapfrog' ? 1 : Infinity;
    const unstable = r > crit + 1e-12;
    ctx.setReadouts([
      { label: 'step n, time t', value: `${steps}, ${fmt(t, 4)}` },
      { label: isWave ? 'Courant number C' : 'r = αΔt/Δx²', value: fmt(r, 4), tone: unstable ? 'bad' : 'good' },
      { label: 'stability limit', value: Number.isFinite(crit) ? `${isWave ? 'C' : 'r'} ≤ ${crit}` : 'none (unconditionally stable)' },
      { label: 'G(π)  zigzag mode', value: fmt(Gpi(r), 4), tone: Math.abs(Gpi(r)) > 1 + 1e-12 ? 'bad' : undefined },
      { label: 'max |G| over the grid modes', value: fmt(gmax, 5), tone: gmax > 1 + 1e-12 ? 'bad' : 'good' },
      { label: 'max |numerical − exact|', value: blown ? '> 10⁶ (blown up)' : fmt(err, 3), tone: blown ? 'bad' : err > 0.05 ? 'warn' : undefined },
      { label: 'measured error growth per step', value: Number.isFinite(growth) ? fmt(growth, 4) : '—', tone: growth > 1.0001 ? 'bad' : undefined },
    ]);
    ctx.setNote(`**${NAME[s]}:** $${GTEX[s]}$. The blue dots on the right are the modes $\\theta = k\\pi/N$ the grid actually carries; any of them above the red line grows every step.${isWave ? ' For the wave equation $|G| = 1$ is ideal: neither growth nor artificial damping.' : ''}`);
    ctx.warn(blown ? `Blown up after ${steps} steps. ${isWave ? `C = ${fmt(r, 3)} > 1 violates the CFL condition` : `r = ${fmt(r, 3)} > ½`}: the zigzag mode grew by ${fmt(Math.abs(Gpi(r)), 3)} per step. Lower it and press reset.`
      : unstable ? (isWave ? `Unstable: the CFL condition needs C = cΔt/Δx ≤ 1; C = ${fmt(r, 3)}. High-frequency modes grow by up to ${fmt(gmax, 3)} per step.` : `Unstable: FTCS needs r ≤ ½; r = ${fmt(r, 3)}. The zigzag mode is multiplied by ${fmt(Gpi(r), 3)} each step.`) : '');
  };

  const update = () => {
    const k = `${ctx.choices.scheme}|${ctx.params.N}|${ctx.toggles.noise}|${ctx.choices.scheme === 'leapfrog' ? ctx.params.r : ''}`;
    if (k !== key || (!heat && !wave)) { key = k; rebuild(); }
    draw();
  };
  return {
    update,
    tick(dtReal) {
      if (blown) return;
      advance(dtReal, 24, 1, 8, () => {
        if (heat) heat.step(dt(), scheme() as Scheme1D); else wave!.step();
        steps++;
        const u = uNow(), t = tNow(), N = u.length - 1, isWave = !!wave;
        errPrev = err; err = 0;
        const amp = isWave ? Math.cos(Math.PI * t) : Math.exp(-Math.PI * Math.PI * t);
        for (let j = 0; j <= N; j++) err = Math.max(err, Math.abs(u[j] - amp * Math.sin((Math.PI * j) / N)));
        if (errPrev > 0 && steps > 3) growth = Number.isFinite(growth) ? 0.7 * growth + 0.3 * (err / errPrev) : err / errPrev;
        if (!(err < 1e6)) blown = true;
      }, clock);
      draw();
    },
    reset() { rebuild(); },
    csv() { const u = uNow(); return csv(['x', 'u_numerical', 'u_exact'], [Array.from(u, (_, j) => j / (u.length - 1)), u, exact]); },
    dispose() {},
  };
}
