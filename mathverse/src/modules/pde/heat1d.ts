// The heat equation on a rod: the exact Fourier-series solution beside a
// finite-difference solution (FTCS, BTCS or Crank–Nicolson), their difference,
// and a live convergence study. The initial temperature is chosen from shapes
// or drawn by dragging handles.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { Heat1D, Scheme1D, sineCoeffsPL, amplification } from '../../core/numeric/pde';
import { fmt, pal, alpha, drawEnd, advance, csv, clamp, P } from './common';

const K = 400;                      // series terms kept
const NS = 400;                     // samples for the exact curve
const SCHEME_NAME: Record<Scheme1D, string> = { ftcs: 'FTCS (explicit)', btcs: 'BTCS (implicit Euler)', cn: 'Crank–Nicolson' };

interface IC { f: (x: number) => number; b: Float64Array; desc: string }

function plFn(xs: number[], ys: number[]) {
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    for (let j = 0; j + 1 < xs.length; j++) if (x <= xs[j + 1]) { const w = xs[j + 1] - xs[j]; return w > 0 ? ys[j] + ((ys[j + 1] - ys[j]) * (x - xs[j])) / w : ys[j + 1]; }
    return ys[ys.length - 1];
  };
}
/** Initial conditions with exact sine coefficients (2K of them; the second K estimate the series tail). */
function makeIC(kind: string, drawn: number[]): IC {
  const modes = (m: [number, number][], desc: string): IC => {
    const b = new Float64Array(2 * K);
    for (const [k, a] of m) b[k - 1] = a;
    return { f: (x) => m.reduce((s, [k, a]) => s + a * Math.sin(k * Math.PI * x), 0), b, desc };
  };
  const pl = (xs: number[], ys: number[], desc: string): IC => ({ f: plFn(xs, ys), b: sineCoeffsPL(xs, ys, 2 * K), desc });
  switch (kind) {
    case 'sine': return modes([[1, 1]], '$u_0 = \\sin \\pi x$ — a single mode: the exact solution is $e^{-\\alpha\\pi^2 t}\\sin\\pi x$.');
    case 'modes': return modes([[1, 1], [3, 0.5], [8, 0.3]], '$u_0 = \\sin\\pi x + \\tfrac12\\sin 3\\pi x + 0.3\\sin 8\\pi x$: the wiggles die $64\\times$ faster than the hump.');
    case 'tri': return pl([0, 0.5, 1], [0, 1, 0], 'A tent: a kink at the middle, so $b_k \\sim 1/k^2$.');
    case 'box': return pl([0, 0.3, 0.3, 0.7, 0.7, 1], [0, 0, 1, 1, 0, 0], 'A hot middle section with jumps, so $b_k \\sim 1/k$; heat smooths the jumps instantly.');
    case 'spots': return pl([0, 0.12, 0.22, 0.32, 0.6, 0.7, 0.8, 1], [0, 0, 1, 0, 0, 0.6, 0, 0], 'Two hot spots of different temperature.');
    default: {
      const xs = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1], ys = [0, ...drawn, 0];
      return pl(xs, ys, 'Your drawing (piecewise linear through the handles). Drag the handles — the clock restarts.');
    }
  }
}

export const heat1d: DemoDef = {
  id: 'pde.heat1d', module: 'pde', title: 'Heat equation on a rod',
  topic: 'Heat equation (1D) · exact series vs finite differences · convergence',
  summary: 'A rod with its ends held at 0: the exact Fourier-series temperature beside a finite-difference solution, with their difference and the order of convergence.',
  tex: 'u_t = \\alpha\\, u_{xx},\\quad u(0,t) = u(1,t) = 0,\\qquad u(x,t) = \\sum_{k\\ge1} b_k\\, e^{-\\alpha k^2\\pi^2 t}\\sin k\\pi x',
  view: 'split2d', animated: true,
  params: [
    { key: 'alpha', label: 'diffusivity α', value: 1, min: 0.1, max: 2, step: 0.01 },
    { key: 'N', label: 'grid intervals N (Δx = 1/N)', value: 40, min: 6, max: 200, step: 1 },
    { key: 'r', label: 'r = αΔt/Δx²', value: 0.4, min: 0.05, max: 4, step: 0.01 },
  ],
  choices: [
    { key: 'ic', label: 'Initial temperature', value: 'box', options: [['sine', 'one sine mode'], ['modes', 'three modes'], ['tri', 'tent'], ['box', 'hot middle (jumps)'], ['spots', 'two hot spots'], ['drawn', 'draw your own']] },
    { key: 'scheme', label: 'Numerical scheme', value: 'cn', options: [['ftcs', 'FTCS'], ['btcs', 'BTCS'], ['cn', 'Crank–Nicolson']] },
    { key: 'panel', label: 'Right panel', value: 'diff', options: [['diff', 'numerical − exact'], ['conv', 'convergence study']] },
  ],
  toggles: [{ key: 'exact', label: 'Exact series solution', value: true }, { key: 'num', label: 'Numerical solution', value: true }, { key: 'init', label: 'Initial temperature', value: true }],
  experiments: [
    'Play with “three modes”: the sin 8πx ripple is gone almost at once — mode k decays like e^{−αk²π²t}.',
    'Choose FTCS and push r past ½: a zigzag appears and explodes. Crank–Nicolson and BTCS never do.',
    'With the hot box and Crank–Nicolson at r = 4, watch the jumps flicker: CN damps the highest modes only by G ≈ −1.',
    'Open the convergence study: FTCS and CN have slope −2 (second order), BTCS with Δt ∝ Δx only −1.',
    'Draw your own initial temperature: no matter how jagged, it is smooth an instant later.',
  ],
  connections: ['pde.stability', 'pde.bc', 'pde.heat2d', 'pde.fourier', 'pde.separation', 'pde.diffusion'],
  accuracy: 'The exact solution is the Fourier sine series with exact coefficients (closed form for these piecewise-linear and modal shapes), truncated at 400 terms; the readout gives the size of the next 400 terms. The numerical solution is a finite-difference approximation on N + 1 nodes; its difference from the series is shown, not hidden. Discontinuous shapes are sampled by cell averages.',
  tutorial: [
    { text: '**Heat flows downhill.** In $u_t = \\alpha u_{xx}$ the temperature rises where the profile is curved up (a cold dip between warm neighbours) and falls where it is curved down. The ends are held at $0$ (Dirichlet). Press **play** and watch the hot middle section spread and sink.', task: 'Press play and let the rod cool for a few seconds.', set: { choices: { ic: 'box', scheme: 'cn', panel: 'diff' }, params: { alpha: 1, N: 40, r: 0.4 }, toggles: { exact: true, num: true, init: true } }, done: (c) => c.time.t > 2 },
    { text: '**Separation of variables.** Trying $u = X(x)T(t)$ splits the PDE into $X\'\' = -\\lambda X$ and $T\' = -\\alpha\\lambda T$. With $X(0) = X(1) = 0$ the modes are $\\sin k\\pi x$ with $\\lambda = k^2\\pi^2$, so mode $k$ decays like $e^{-\\alpha k^2\\pi^2 t}$. With three modes, the $k = 8$ ripple dies $64\\times$ faster than the $k = 1$ hump.', task: 'Make the rod conduct faster: raise α to 2.', set: { choices: { ic: 'modes' }, params: { alpha: 1 } }, done: (c) => c.params.alpha >= 1.9 },
    { text: '**Exact versus numerical.** The gold curve is the exact series; the blue dots are the finite-difference solution on $N + 1$ nodes. The right panel shows their difference — the numerical error, which is real and measurable.', task: 'Refine the grid to N ≥ 100 and watch the error in the right panel shrink.', set: { choices: { ic: 'tri', scheme: 'cn', panel: 'diff' }, params: { N: 20 } }, done: (c) => c.params.N >= 100 },
    { text: '**The explicit scheme (FTCS)** updates each node from its neighbours: $u_i^{n+1} = u_i^n + r\\,(u_{i-1}^n - 2u_i^n + u_{i+1}^n)$ with $r = \\alpha\\Delta t/\\Delta x^2$. It is cheap, but stable only for $r \\le \\tfrac12$.', task: 'Push r above ½ and play: the zigzag mode explodes.', set: { choices: { scheme: 'ftcs', ic: 'tri' }, params: { r: 0.45, N: 40 } }, done: (c) => c.choices.scheme === 'ftcs' && c.params.r > 0.5 },
    { text: '**Implicit schemes** solve a tridiagonal system each step. Crank–Nicolson, $\\left(I - \\tfrac r2 A\\right)u^{n+1} = \\left(I + \\tfrac r2 A\\right)u^n$, is second order in time and stable for every $r$.', task: 'Switch to Crank–Nicolson and take a big step: r > 1.', set: { params: { r: 0.45 } }, done: (c) => c.choices.scheme === 'cn' && c.params.r > 1 },
    { text: '**Convergence.** Halving $\\Delta x$ should cut the error by $4$ for a second-order method. The convergence study solves the single-mode problem on $N = 10 \\ldots 160$ and plots the error on log–log axes: the slope is the order.', task: 'Open the convergence study and compare the measured slopes of the three schemes.', set: { choices: { panel: 'conv' } }, done: (c) => c.choices.panel === 'conv' },
    { text: '**Physics.** This rod is also the wall of a rocket nozzle seen through its thickness: the hot-gas side is held hot, the coolant side loses heat by convection — a Robin condition. Open *Boundary conditions side by side* to see that wall. (The nozzle wall is the same equation; the real wall also has temperature-dependent conductivity, which this linear model leaves out.)' },
  ],
  create: (ctx) => heat1dDemo(ctx),
};

function heat1dDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'u';
  plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 'u_num − u_exact';
  const drawn = [0.2, 0.9, 0.4, 0.15, 0.6];
  let ic: IC = makeIC('box', drawn), solver: Heat1D | null = null, key = '';
  const clock = { lag: 0 };
  let blown = false, behind = false, simT = 0;
  // exact series on fixed samples, with a sine table (built once per N)
  const xsS = Float64Array.from({ length: NS + 1 }, (_, i) => i / NS);
  const tabS = new Float64Array((NS + 1) * K);
  for (let s = 0; s <= NS; s++) for (let k = 0; k < K; k++) tabS[s * K + k] = Math.sin((k + 1) * Math.PI * xsS[s]);
  let tabN = new Float64Array(0), tabNfor = -1;
  const bd = new Float64Array(K);
  const exS = new Float64Array(NS + 1);
  let exN = new Float64Array(0), errN = new Float64Array(0);
  let tail = 0, kUsed = K;
  let conv: { N: number[]; err: number[]; slope: number; rule: string } | null = null, convKey = '';

  const decayed = (t: number) => {
    const a = ctx.params.alpha;
    kUsed = 0;
    for (let k = 0; k < K; k++) { const d = Math.exp(-a * ((k + 1) * Math.PI) ** 2 * t); bd[k] = ic.b[k] * d; if (d > 1e-17) kUsed = k + 1; }
    tail = 0;
    for (let k = K; k < 2 * K; k++) tail += Math.abs(ic.b[k]) * Math.exp(-a * ((k + 1) * Math.PI) ** 2 * t);
  };
  const evalTab = (tab: Float64Array, n: number, out: Float64Array, t: number, xs: ArrayLike<number>) => {
    if (t === 0) { for (let s = 0; s < n; s++) out[s] = ic.f(xs[s]); return; }
    for (let s = 0; s < n; s++) { let v = 0; const o = s * K; for (let k = 0; k < kUsed; k++) v += bd[k] * tab[o + k]; out[s] = v; }
  };

  const rebuild = () => {
    const N = Math.round(ctx.params.N), a = ctx.params.alpha;
    ic = makeIC(ctx.choices.ic, drawn);
    solver = new Heat1D({ L: 1, N, alpha: a });
    solver.setInitial(ic.f, true);
    if (tabNfor !== N) {
      tabN = new Float64Array((N + 1) * K); exN = new Float64Array(N + 1); errN = new Float64Array(N + 1);
      for (let i = 0; i <= N; i++) for (let k = 0; k < K; k++) tabN[i * K + k] = Math.sin(((k + 1) * Math.PI * i) / N);
      tabNfor = N;
    }
    simT = 0; clock.lag = 0; blown = false; behind = false;
  };

  const dt = () => (ctx.params.r * solver!.dx * solver!.dx) / ctx.params.alpha;

  const convergence = () => {
    const scheme = ctx.choices.scheme as Scheme1D, a = ctx.params.alpha;
    const T = 0.05 / a;
    const rr = scheme === 'ftcs' ? Math.min(ctx.params.r, 0.5) : 0;
    const Ns = [10, 20, 40, 80, 160], err: number[] = [];
    for (const N of Ns) {
      const h = new Heat1D({ L: 1, N, alpha: a });
      h.setInitial((x) => Math.sin(Math.PI * x));
      const steps = scheme === 'ftcs' ? Math.ceil(T / ((rr * h.dx * h.dx) / a)) : N / 2;
      const d = T / steps;
      for (let k = 0; k < steps; k++) h.step(d, scheme);
      let e = 0;
      for (let i = 0; i < h.n; i++) e = Math.max(e, Math.abs(h.u[i] - Math.exp(-a * Math.PI * Math.PI * T) * Math.sin(Math.PI * h.x[i])));
      err.push(e);
    }
    const slope = Math.log(err[3] / err[4]) / Math.log(2);
    conv = { N: Ns, err, slope, rule: scheme === 'ftcs' ? `r = ${fmt(rr, 3)} fixed, so Δt ∝ Δx²` : 'Δt = 2T/N, so Δt ∝ Δx' };
  };

  const draw = () => {
    const c = pal(ctx), h = solver!, N = h.n - 1;
    const scheme = ctx.choices.scheme as Scheme1D;
    decayed(simT);
    evalTab(tabS, NS + 1, exS, simT, xsS);
    evalTab(tabN, N + 1, exN, simT, h.x);
    let emax = 0;
    for (let i = 0; i <= N; i++) { errN[i] = h.u[i] - exN[i]; emax = Math.max(emax, Math.abs(errN[i])); }
    // the view: from the initial shape
    let lo = 0, hi = 0;
    for (let s = 0; s <= NS; s += 4) { const v = ic.f(xsS[s]); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    const span = Math.max(hi - lo, 0.2);
    const v = { x0: -0.08, x1: 1.08, y0: lo - 0.18 * span, y1: hi + 0.2 * span };
    if (Math.abs(plot.view.y1 - v.y1) > 1e-9 || Math.abs(plot.view.y0 - v.y0) > 1e-9) plot.setView(v);
    plot.setDraw((g) => {
      drawEnd(g, 'dirichlet', 0, -1, -0.08 * span, 0.08 * span, c, 'u = 0');
      drawEnd(g, 'dirichlet', 1, 1, -0.08 * span, 0.08 * span, c, 'u = 0');
      if (ctx.toggles.init) g.path(Array.from(xsS, (x) => [x, ic.f(x)] as P), { color: c.faint, width: 1.5, dash: [5, 5] });
      if (ctx.toggles.exact) g.path(Array.from(xsS, (x, s) => [x, exS[s]] as P), { color: c.gold, width: 3 });
      if (ctx.toggles.num && !blown) {
        const pts = Array.from(h.x, (x, i) => [x, h.u[i]] as P);
        g.path(pts, { color: c.blue, width: 1.5, alpha: 0.85 });
        if (N <= 100) for (const p of pts) g.point(p, N <= 50 ? 3.4 : 2.4, { fill: c.blue });
      }
      if (ctx.choices.ic === 'drawn' && simT === 0) drawn.forEach((y, k) => g.handle({ id: `d${k}`, at: [(k + 1) / 6, y], color: c.orange, onDrag: ([, yy]) => { drawn[k] = clamp(yy, -1, 1.5); rebuild(); draw(); }, constrain: ([, yy]) => [(k + 1) / 6, clamp(yy, -1, 1.5)] }));
      const f = '12px Inter, system-ui, sans-serif';
      let ly = v.y1 - 0.04 * (v.y1 - v.y0);
      if (ctx.toggles.exact) { g.text([0.03, ly], '━ exact (Fourier series, 400 terms)', { color: c.gold, font: f, baseline: 'top' }); ly -= 0.065 * (v.y1 - v.y0); }
      if (ctx.toggles.num) g.text([0.03, ly], `● numerical: ${SCHEME_NAME[scheme]}, N = ${N}`, { color: c.blue, font: f, baseline: 'top' });
      g.text([v.x1 - 0.03, v.y1 - 0.04 * (v.y1 - v.y0)], `t = ${simT.toFixed(4)}`, { color: c.ink, font: '600 13px Inter, system-ui, sans-serif', align: 'right', baseline: 'top' });
    });
    if (ctx.choices.panel === 'diff') {
      const m = blown ? 1 : Math.max(emax * 1.35, 1e-14);
      plot2.opts.xLabel = 'x'; plot2.opts.yLabel = 'u_num − u_exact';
      plot2.setView({ x0: -0.05, x1: 1.05, y0: -m, y1: m });
      plot2.setDraw((g) => {
        if (blown) { g.text([0.5, 0], 'the numerical solution has blown up', { color: c.red, font: '600 14px Inter, system-ui, sans-serif', align: 'center' }); return; }
        g.path(Array.from(h.x, (x, i) => [x, errN[i]] as P), { color: c.red, width: 2 });
        if (N <= 100) for (let i = 0; i <= N; i++) g.point([h.x[i], errN[i]], 2.6, { fill: c.red });
        g.text([0.03, m * 0.92], `numerical − exact   (max ${fmt(emax, 3)})`, { color: c.red, font: '12px Inter, system-ui, sans-serif', baseline: 'top' });
      });
    } else {
      if (!conv) convergence();
      const cv = conv!;
      plot2.opts.xLabel = 'log₁₀ N'; plot2.opts.yLabel = 'log₁₀ max error';
      const ly = cv.err.map((e) => Math.log10(Math.max(e, 1e-16))), lx = cv.N.map((n) => Math.log10(n));
      const yl = Math.min(...ly) - 0.6, yh = Math.max(...ly) + 0.6;
      plot2.setView({ x0: 0.85, x1: 2.4, y0: yl, y1: yh });
      plot2.setDraw((g) => {
        // reference slopes through the first point
        g.line([lx[0], ly[0]], [lx[4], ly[0] - 2 * (lx[4] - lx[0])], { color: c.faint, width: 1.2, dash: [6, 4] });
        g.line([lx[0], ly[0]], [lx[4], ly[0] - 1 * (lx[4] - lx[0])], { color: c.faint, width: 1.2, dash: [2, 4] });
        g.text([lx[4], ly[0] - 2 * (lx[4] - lx[0])], 'slope −2', { color: c.muted, font: '11px Inter, sans-serif', align: 'right', baseline: 'top' }, -4, 4);
        g.text([lx[4], ly[0] - (lx[4] - lx[0])], 'slope −1', { color: c.muted, font: '11px Inter, sans-serif', align: 'right', baseline: 'bottom' }, -4, -4);
        g.path(lx.map((x, i) => [x, ly[i]] as P), { color: c.blue, width: 2.4 });
        lx.forEach((x, i) => g.point([x, ly[i]], 4.5, { fill: c.blue }));
        g.line([Math.log10(N), yl], [Math.log10(N), yh], { color: alpha(c.orange, 0.6), width: 1.5, dash: [3, 3] });
        g.text([0.9, yh - 0.05 * (yh - yl)], `${SCHEME_NAME[scheme]}: measured order ${cv.slope.toFixed(2)}`, { color: c.ink, font: '600 12px Inter, sans-serif', baseline: 'top' });
        g.text([0.9, yh - 0.12 * (yh - yl)], `single mode sin πx to T = 0.05/α; ${cv.rule}`, { color: c.muted, font: '11px Inter, sans-serif', baseline: 'top' });
      });
    }
    // readouts
    const r = ctx.params.r, rMax = h.rMax, unstable = scheme === 'ftcs' && r > rMax;
    const Ghi = amplification(scheme, r, Math.PI * (N - 1) / N);
    const rows: Readout[] = [
      { label: 't (simulated)', value: fmt(simT, 4) },
      { label: 'Δx, Δt', value: `${fmt(h.dx, 3)}, ${fmt(dt(), 3)}` },
      { label: 'r = αΔt/Δx²', value: fmt(r, 3) + (scheme === 'ftcs' ? `  (FTCS needs ≤ ${fmt(rMax, 3)})` : '  (any r is stable)'), tone: unstable ? 'bad' : 'good' },
      { label: 'max |numerical − exact|', value: blown ? 'blown up' : fmt(emax, 3), tone: blown ? 'bad' : emax < 1e-3 ? 'good' : 'warn' },
      { label: 'G for the zigzag mode', value: fmt(Ghi, 4), tone: Math.abs(Ghi) > 1 ? 'bad' : Ghi < -0.8 ? 'warn' : undefined },
      { label: 'mode-1 factor e^{−απ²t}', value: fmt(Math.exp(-ctx.params.alpha * Math.PI * Math.PI * simT), 4) },
      { label: 'heat ∫u dx (numerical)', value: fmt(h.heat(), 5) },
      { label: 'series: terms used, tail', value: simT === 0 ? 'u₀ itself at t = 0' : `${kUsed}, < ${fmt(tail + 1e-17, 2)}` },
    ];
    if (ctx.choices.panel === 'conv' && conv) rows.push({ label: 'measured order of accuracy', value: conv.slope.toFixed(2), tone: 'good' });
    ctx.setReadouts(rows);
    ctx.warn(blown ? `The FTCS solution blew up: r = ${fmt(r, 3)} exceeds ½, so the zigzag mode is multiplied by |1 − 4r| = ${fmt(Math.abs(1 - 4 * r), 3)} every step. Lower r (or choose BTCS / Crank–Nicolson) and press reset.`
      : unstable ? `Unstable: FTCS needs r = αΔt/Δx² ≤ ½, and r = ${fmt(r, 3)}. Rounding errors in the zigzag mode will grow by |1 − 4r| = ${fmt(Math.abs(1 - 4 * r), 3)} per step.`
      : behind ? 'The solver cannot keep up with this speed at this resolution; the clock is slowed to match.' : '');
  };

  const noteFor = () => {
    const s = ctx.choices.scheme as Scheme1D;
    const step = s === 'ftcs' ? 'u_i^{n+1} = u_i^n + r\\,\\delta^2 u_i^n' : s === 'btcs' ? 'u_i^{n+1} - r\\,\\delta^2 u_i^{n+1} = u_i^n' : 'u_i^{n+1} - \\tfrac r2\\delta^2 u_i^{n+1} = u_i^n + \\tfrac r2 \\delta^2 u_i^n';
    const order = s === 'ftcs' ? 'first order in time, second in space; stable for $r \\le \\tfrac12$' : s === 'btcs' ? 'first order in time, second in space; stable for every $r$, strongly damping' : 'second order in time and space; stable for every $r$, but the highest modes are damped only by $G \\to -1$ as $r \\to \\infty$';
    ctx.setNote(`${ic.desc}\n\n**${SCHEME_NAME[s]}:** $${step}$, with $\\delta^2 u_i = u_{i-1} - 2u_i + u_{i+1}$ — ${order}.`);
  };

  const update = () => {
    const k = `${ctx.choices.ic}|${ctx.params.N}|${ctx.params.alpha}`;
    if (k !== key || !solver) { key = k; rebuild(); }
    const ck = `${ctx.choices.scheme}|${ctx.params.alpha}|${ctx.choices.scheme === 'ftcs' ? ctx.params.r : ''}`;
    if (ck !== convKey) { convKey = ck; conv = null; }
    noteFor();
    draw();
  };

  return {
    update,
    tick(dtReal) {
      if (!solver || blown) return;
      const res = advance(dtReal, 0.025, dt(), 600, () => {
        solver!.step(dt(), ctx.choices.scheme as Scheme1D);
      }, clock);
      behind = res.behind;
      simT = solver.t;
      for (let i = 0; i < solver.n; i++) if (!(Math.abs(solver.u[i]) < 1e6)) { blown = true; break; }
      draw();
    },
    reset() { rebuild(); },
    csv() { const h = solver!; return csv(['x', 'u_numerical', 'u_exact', 't'], [h.x, h.u, exN.slice(0, h.n), [simT]]); },
    dispose() {},
  };
}
