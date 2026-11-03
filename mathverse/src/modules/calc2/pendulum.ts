// The pendulum and its small-angle Taylor approximation: sin θ ≈ θ turns the
// true equation θ″ = −(g/L) sin θ into simple harmonic motion. Two pendulums
// swing side by side; the exact period (elliptic integral, by the AGM) is
// compared with 2π√(L/g) and with the period's own series in the amplitude.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { solveAdaptive, rk4Step, sample, Trajectory } from '../../core/numeric/ode';
import { pendulumPeriod } from '../../core/numeric/taylor';
import { fmt, ink, muted, rgba, BLUE, GOLD, GREEN, RED, VIOLET, FONT, safeTutorial } from './util';

const G = 9.81;
// T/T0 = 1 + θ²/16 + 11θ⁴/3072 + 173θ⁶/737280 + 22931θ⁸/1321205760 + …
const SERIES_C = [1, 1 / 16, 11 / 3072, 173 / 737280, 22931 / 1321205760];
const seriesRatio = (th: number, terms: number) => SERIES_C.slice(0, terms + 1).reduce((s, c, k) => s + c * th ** (2 * k), 0);

export const pendulumDemo: DemoDef = {
  id: 'calc2.pendulum', module: 'calc2', title: 'The pendulum: a Taylor approximation', topic: 'Physics: small-angle approximation, sin θ ≈ θ, period of a pendulum',
  summary: 'Every physics course replaces sin θ by θ — the first Taylor polynomial. Two pendulums, one exact and one linearised, swing side by side: watch how far the approximation can be trusted, and how the true period grows with the amplitude.',
  tex: '\\ddot\\theta = -\\frac{g}{L}\\sin\\theta \\;\\approx\\; -\\frac{g}{L}\\theta,\\qquad T = 4\\sqrt{\\tfrac{L}{g}}\\,K\\!\\left(\\sin\\tfrac{\\theta_0}{2}\\right) = T_0\\left(1 + \\tfrac{\\theta_0^2}{16} + \\tfrac{11\\theta_0^4}{3072} + \\cdots\\right)',
  view: 'split2d', animated: true,
  params: [
    { key: 'amp', label: 'amplitude θ₀ (degrees)', value: 60, min: 1, max: 175, step: 0.5 },
    { key: 'L', label: 'length L (m)', value: 1, min: 0.2, max: 5, step: 0.01 },
    { key: 'terms', label: 'terms of the period series', value: 1, min: 0, max: 4, step: 1 },
  ],
  choices: [{ key: 'plot', label: 'Right-hand plot', value: 'period', options: [['period', 'period against amplitude'], ['motion', 'θ(t): exact and linearised'], ['sine', 'sin θ and its Taylor polynomials']] }],
  experiments: [
    'Press play at 10°: the two pendulums stay together for many swings — the small-angle approximation is excellent (period error 0.2%).',
    'Raise the amplitude to 90°: the true pendulum lags visibly; its period is 18% longer than 2π√(L/g).',
    'Near 175° the exact pendulum hangs almost upside down and the period diverges (K → ∞), while the linear model knows nothing of it.',
    'Add terms to the period series: each one extends the range where it agrees with the exact curve — but at 180° every truncation fails.',
    'Change L: both periods scale as √L — the ratio T/T₀ depends only on the amplitude.',
  ],
  connections: ['calc2.taylor', 'calc2.series'],
  accuracy: 'The nonlinear motion is integrated with RK4 (small fixed steps in the animation; adaptive Dormand–Prince, rtol 1e−10, for the plotted curves). The exact period uses K(k) by the arithmetic–geometric mean (≈1e−15). g = 9.81 m/s². No friction or air resistance.',
  tutorial: safeTutorial([
    { text: '**The exact equation.** A pendulum of length $L$ obeys $\\ddot\\theta = -\\frac gL\\sin\\theta$ — not solvable with elementary functions. Replace $\\sin\\theta$ by its Maclaurin polynomial of order 1, $\\theta$, and it becomes $\\ddot\\theta = -\\frac gL\\theta$: simple harmonic motion with $T_0 = 2\\pi\\sqrt{L/g}$.', set: { params: { amp: 10, L: 1, terms: 1 }, choices: { plot: 'motion' } }, task: 'Press play: at 10° the two pendulums agree.' },
    { text: '**How good is sin θ ≈ θ?** The next Maclaurin term is $-\\theta^3/6$: at 10° (0.175 rad) the relative error is $\\theta^2/6 \\approx 0.5\\%$; at 60° it is 17%.', set: { choices: { plot: 'sine' } }, task: 'Raise the amplitude and watch sin θ and θ separate.' },
    { text: '**The real period** is $T = 4\\sqrt{L/g}\\,K(\\sin\\frac{\\theta_0}{2})$ with the complete elliptic integral $K$. It grows with amplitude — large swings take longer.', set: { choices: { plot: 'period' }, params: { amp: 90 } }, task: 'Read T/T₀ at 90°: about 1.18.' },
    { text: '**Its Taylor series** in the amplitude: $T \\approx T_0\\left(1 + \\frac{\\theta_0^2}{16} + \\frac{11\\theta_0^4}{3072} + \\dots\\right)$. One extra term already gives 1% accuracy up to about 90°.', task: 'Step the number of terms from 0 to 4 and compare the curves with the exact one.' },
    { text: 'Near 180° the pendulum balances on its head and $T \\to \\infty$ — a logarithmic singularity of $K$. Every truncated series stays finite there: the series converges for $\\theta_0 < 180°$ but ever more slowly. Approximations always come with a range of validity.', set: { params: { amp: 170, terms: 4 } } },
  ]),
  create: (ctx) => createPendulum(ctx),
};

function createPendulum(ctx: DemoCtx): DemoInstance {
  const Lp = ctx.plot!, Rp = ctx.plot2!;
  Lp.opts.equal = true; Lp.opts.axes = false; Lp.opts.grid = false; Lp.opts.pan = false;
  Lp.setView({ x0: -3.1, x1: 3.1, y0: -1.0, y1: 2.6 });
  let simT = 0, y = [0, 0], key = '';
  let traj: Trajectory | null = null;
  const draw = () => {
    const th0 = (ctx.params.amp * Math.PI) / 180, L = ctx.params.L, w0 = Math.sqrt(G / L);
    const thE = y[0], thL = th0 * Math.cos(w0 * simT);
    const t = ink(ctx), Ls = 1.3;
    Lp.setDraw((g) => {
      const piv: [number, number][] = [[-1.5, 1.2], [1.5, 1.2]];
      const items = [{ p: piv[0], th: thE, col: BLUE, lab: 'exact:  θ″ = −(g/L) sin θ' }, { p: piv[1], th: thL, col: GOLD, lab: 'linearised:  θ″ = −(g/L) θ' }];
      for (const it of items) {
        // swing arc and the amplitude marks
        const arc: [number, number][] = [];
        for (let i = 0; i <= 60; i++) { const a = -th0 + (2 * th0 * i) / 60; arc.push([it.p[0] + Ls * Math.sin(a), it.p[1] - Ls * Math.cos(a)]); }
        g.path(arc, { color: rgba(it.col, 0.35), width: 1.2, dash: [3, 4] });
        g.line(it.p, [it.p[0], it.p[1] - Ls * 1.08], { color: rgba('#8b93a7', 0.4), width: 1, dash: [2, 4] });
        const bob: [number, number] = [it.p[0] + Ls * Math.sin(it.th), it.p[1] - Ls * Math.cos(it.th)];
        g.line(it.p, bob, { color: t, width: 2 });
        g.point(it.p, 4, { fill: t });
        g.point(bob, 13, { fill: it.col, color: t, width: 1.5 });
        g.text([it.p[0], 2.45], it.lab, { color: it.col, font: FONT, align: 'center' });
        g.text([it.p[0], -0.55], `θ = ${fmt((it.th * 180) / Math.PI, 4)}°`, { color: it.col, font: FONT, align: 'center' });
      }
      g.line([-3, 1.2], [3, 1.2], { color: muted(ctx), width: 3 });
      g.text([0, -0.85], `t = ${fmt(simT, 4)} s`, { color: muted(ctx), font: FONT, align: 'center' });
    });
  };
  const update = () => {
    const th0 = (ctx.params.amp * Math.PI) / 180, L = ctx.params.L, terms = Math.round(ctx.params.terms);
    const T0 = 2 * Math.PI * Math.sqrt(L / G), T = pendulumPeriod(th0, L, G), Ts = T0 * seriesRatio(th0, terms);
    const k = `${ctx.params.amp}|${L}`;
    if (k !== key) { key = k; simT = 0; y = [th0, 0]; traj = null; }
    const t = ink(ctx);
    const plot = ctx.choices.plot;
    if (plot === 'period') {
      Rp.opts.xLabel = 'θ₀ (degrees)'; Rp.opts.yLabel = 'T / T₀';
      Rp.setView({ x0: -8, x1: 185, y0: 0.85, y1: 2.6 });
      Rp.setDraw((g) => {
        g.line([180, g.view.y0], [180, g.view.y1], { color: muted(ctx), width: 1, dash: [3, 4] });
        g.line([0, 1], [180, 1], { color: GOLD, width: 2, dash: [7, 5] });
        for (let m = 1; m <= 4; m++) g.fn((d) => (d >= 0 && d <= 180 ? seriesRatio((d * Math.PI) / 180, m) : NaN), { color: rgba(VIOLET, m === terms ? 1 : 0.3), width: m === terms ? 2.2 : 1.2, dash: [5, 3] }, [0, 180]);
        g.fn((d) => (d > 0 && d < 180 ? pendulumPeriod((d * Math.PI) / 180, 1, 1) / (2 * Math.PI) : NaN), { color: BLUE, width: 2.8 }, [0.5, 179.9]);
        g.point([ctx.params.amp, T / T0], 6, { fill: GREEN });
        g.text([g.view.x0, g.view.y1], 'blue: exact T/T₀ (elliptic integral)', { color: BLUE, font: FONT }, 50, 40);
        g.text([g.view.x0, g.view.y1], `violet: series with ${terms} correction term${terms === 1 ? '' : 's'} (bold)`, { color: VIOLET, font: FONT }, 50, 58);
        g.text([g.view.x0, g.view.y1], 'gold: small-angle T₀', { color: GOLD, font: FONT }, 50, 76);
      });
    } else if (plot === 'motion') {
      Rp.opts.xLabel = 't (s)'; Rp.opts.yLabel = 'θ (°)';
      const tEnd = 4 * T0;
      if (!traj) traj = solveAdaptive((_s, Y) => [Y[1], -(G / L) * Math.sin(Y[0])], [th0, 0], 0, tEnd, { rtol: 1e-10, maxStep: T0 / 60 });
      const tr = traj;
      const A = ctx.params.amp;
      Rp.setView({ x0: -0.03 * tEnd, x1: tEnd * 1.02, y0: -A * 1.4, y1: A * 1.5 });
      Rp.setDraw((g) => {
        g.fn((s) => A * Math.cos(Math.sqrt(G / L) * s), { color: GOLD, width: 2, dash: [6, 4] }, [0, tEnd]);
        g.path(tr.t.map((s, i) => [s, (tr.y[i][0] * 180) / Math.PI] as [number, number]), { color: BLUE, width: 2.6 });
        const tm = simT % tEnd;
        g.line([tm, g.view.y0], [tm, g.view.y1], { color: GREEN, width: 1, dash: [3, 4] });
        g.text([g.view.x0, g.view.y1], 'blue: exact (numerical)   gold: θ₀ cos(ω₀t)', { color: t, font: FONT }, 50, 22);
      });
    } else {
      Rp.opts.xLabel = 'θ (rad)'; Rp.opts.yLabel = '';
      Rp.setView({ x0: -3.4, x1: 3.4, y0: -2.2, y1: 2.2 });
      const th = th0;
      Rp.setDraw((g) => {
        g.fillBetween(() => g.view.y1, () => g.view.y0, -th, th, { fill: rgba(GREEN, 0.07) }, 4);
        g.fn((x) => x, { color: GOLD, width: 2.2 });
        g.fn((x) => x - x ** 3 / 6, { color: VIOLET, width: 1.8, dash: [6, 4] });
        g.fn(Math.sin, { color: BLUE, width: 2.8 });
        g.line([th, Math.sin(th)], [th, th], { color: RED, width: 2.4 });
        g.text([g.view.x0, g.view.y1], 'blue: sin θ   gold: θ (order 1)   violet: θ − θ³/6 (order 3)', { color: t, font: FONT }, 10, 22);
        g.text([g.view.x0, g.view.y1], 'green band: the swing, |θ| ≤ θ₀', { color: GREEN, font: FONT }, 10, 40);
      });
    }
    ctx.setReadouts([
      { label: 'small-angle period T₀ = 2π√(L/g)', value: `${fmt(T0, 8)} s` },
      { label: 'exact period T', value: `${fmt(T, 10)} s` },
      { label: 'T / T₀', value: fmt(T / T0, 10) },
      { label: 'error of the small-angle period', value: `${fmt(100 * (T - T0) / T, 4)} %`, tone: (T - T0) / T < 0.01 ? 'good' : 'warn' },
      { label: `series with ${terms} correction term${terms === 1 ? '' : 's'}`, value: `${fmt(Ts, 10)} s  (error ${fmt((100 * (Ts - T)) / T, 3)} %)` },
      { label: 'sin θ₀ vs θ₀', value: `${fmt(Math.sin(th0), 6)} vs ${fmt(th0, 6)}  (${fmt((100 * (th0 - Math.sin(th0))) / Math.sin(th0), 3)} %)` },
    ]);
    ctx.setNote(`At $\\theta_0 = ${fmt(ctx.params.amp, 4)}°$ the small-angle period is ${fmt((100 * (T - T0)) / T, 3)}% short. The linearisation is a first-order Maclaurin polynomial; its error $\\sin\\theta - \\theta \\approx -\\theta^3/6$ is what slows the real pendulum (the restoring force is weaker than $\\theta$).`);
    draw();
  };
  return {
    update,
    tick(dt) {
      const L = ctx.params.L, f = (_s: number, Y: number[]) => [Y[1], -(G / L) * Math.sin(Y[0])];
      const n = 8, h = dt / n;
      for (let i = 0; i < n; i++) y = rk4Step(f, simT + i * h, y, h);
      simT += dt;
      draw();
      if (ctx.choices.plot === 'motion') update();
    },
    reset() { simT = 0; y = [(ctx.params.amp * Math.PI) / 180, 0]; },
    dispose() {},
  };
}

void sample;
