// Heat versus Schrödinger: the free Schrödinger equation is the heat equation
// with an imaginary diffusion constant. A Gaussian wave packet solved by
// Crank–Nicolson beside its exact formula, and beside what real diffusion
// would do to the same initial density — ballistic versus diffusive spreading.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { Schrodinger1D, freePacket } from '../../core/numeric/pde';
import { fmt, pal, alpha, advance, csv, P } from './common';

const X0 = -20, X1 = 20, START = -6, BW = 0.5, TMAX = 10;

export const schrodinger: DemoDef = {
  id: 'pde.schrodinger', module: 'pde', title: 'Heat vs Schrödinger: a diffusion-like PDE',
  topic: 'The Schrödinger equation as a diffusion-like PDE · Crank–Nicolson · wave packets · analogy and its limits',
  summary: 'Replace the diffusion constant D by iħ/2m and the heat equation becomes the free Schrödinger equation. The same Crank–Nicolson method solves it — but the physics differs: a wave packet spreads ballistically (σ ∝ t), heat diffusively (σ ∝ √t).',
  tex: 'u_t = D\\,u_{xx}\\quad\\longleftrightarrow\\quad \\psi_t = \\frac{i\\hbar}{2m}\\,\\psi_{xx} - \\frac{i}{\\hbar}V\\psi;\\qquad \\sigma_{\\text{heat}}^2 = \\sigma_0^2 + 2Dt,\\quad \\sigma_{\\psi}^2 = \\sigma_0^2 + \\left(\\frac{\\hbar t}{2m\\sigma_0}\\right)^2',
  view: 'split2d', animated: true,
  params: [
    { key: 'k0', label: 'momentum k₀ (ħ = m = 1)', value: 2, min: -4, max: 4, step: 0.01 },
    { key: 'sigma', label: 'initial width σ₀', value: 0.8, min: 0.3, max: 2, step: 0.01 },
    { key: 'V0', label: 'barrier height V₀', value: 2, min: 0, max: 8, step: 0.01 },
    { key: 'N', label: 'grid intervals N', value: 1600, min: 300, max: 4000, step: 50 },
    { key: 'dt', label: 'time step Δt', value: 0.01, min: 0.001, max: 0.1, step: 0.001 },
  ],
  choices: [{ key: 'V', label: 'Potential', value: 'free', options: [['free', 'free particle (exact solution known)'], ['barrier', 'barrier at x = 0 (numerical only)']] }],
  toggles: [{ key: 'reim', label: 'Re ψ and Im ψ', value: true }, { key: 'heat', label: 'Heat-equation density for comparison', value: true }],
  experiments: [
    'Play with k₀ = 0: the packet stays put and spreads. Compare with the heat curve: early on they look alike, then the quantum packet outruns diffusion (σ ∝ t vs √t).',
    'Make σ₀ small: a narrow packet spreads fast (uncertainty principle: Δp ≥ ħ/2σ₀).',
    'Watch Re ψ and Im ψ: the fast wiggles are the phase e^{ik₀x}; |ψ|² is smooth.',
    'Switch on the barrier with V₀ above and below k₀²/2: part of the packet tunnels through even when its energy is too low.',
    'Raise Δt to 0.1: Crank–Nicolson stays stable and keeps the norm exactly, but the phase becomes wrong and the error grows — stability is not accuracy.',
  ],
  connections: ['pde.diffusion', 'pde.heat1d', 'pde.stability', 'pde.wave'],
  accuracy: 'Numerical: Crank–Nicolson on [−20, 20] with ψ = 0 at the ends (unitary — the norm is conserved to rounding; second order in Δx and Δt). Exact: the free Gaussian packet formula, valid until the packet reaches the walls (a warning appears). The heat curve is the exact solution of u_t = ½u_xx from the initial density |ψ₀|², shifted with the packet\'s centre for comparison. The equation is the same form with D → i/2; |ψ|² itself does not obey a diffusion equation — that is the analogy\'s limit.',
  create: (ctx) => schrodingerDemo(ctx),
};

function schrodingerDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'ψ';
  plot2.opts.xLabel = 't'; plot2.opts.yLabel = 'width σ(t)';
  let s: Schrodinger1D | null = null, key = '', hist: P[] = [];
  const clock = { lag: 0 };

  const rebuild = () => {
    const p = ctx.params, bar = ctx.choices.V === 'barrier';
    s = new Schrodinger1D(X0, X1, Math.round(p.N), bar ? (x) => (Math.abs(x) < BW / 2 ? p.V0 : 0) : undefined);
    s.set((x) => freePacket(x, 0, START, p.k0, p.sigma));
    hist = []; clock.lag = 0;
  };
  const moments = () => {
    const S = s!; let m0 = 0, m1 = 0, m2 = 0, right = 0;
    for (let i = 0; i < S.n; i++) { const d = S.re[i] ** 2 + S.im[i] ** 2, x = S.x[i]; m0 += d; m1 += d * x; m2 += d * x * x; if (x > BW / 2) right += d; }
    const mean = m1 / m0; return { mean, sd: Math.sqrt(Math.max(0, m2 / m0 - mean * mean)), right: right * S.dx };
  };

  const draw = () => {
    const c = pal(ctx), S = s!, p = ctx.params, t = S.t, free = ctx.choices.V === 'free';
    const sig = p.sigma, peak = 1 / Math.sqrt(2 * Math.PI * sig * sig);
    const amp = Math.pow(2 * Math.PI * sig * sig, -0.25);
    const { mean, sd, right } = moments();
    let err = 0;
    if (free) for (let i = 0; i < S.n; i += 3) { const [a, b] = freePacket(S.x[i], t, START, p.k0, sig); err = Math.max(err, Math.hypot(S.re[i] - a, S.im[i] - b)); }
    const ym = Math.max(peak, amp) * 1.15;
    plot.setView({ x0: X0 - 0.5, x1: X1 + 0.5, y0: -ym, y1: ym * 1.15 });
    const step = Math.max(1, Math.floor(S.n / 1500));
    const pts = (f: (i: number) => number) => { const o: P[] = []; for (let i = 0; i < S.n; i += step) o.push([S.x[i], f(i)]); return o; };
    plot.setDraw((g) => {
      if (!free) g.polygon([[-BW / 2, 0], [BW / 2, 0], [BW / 2, Math.min(ym, (p.V0 / 8) * ym)], [-BW / 2, Math.min(ym, (p.V0 / 8) * ym)]], { fill: alpha(c.violet, 0.35), color: c.violet, width: 1 });
      if (ctx.toggles.reim) { g.path(pts((i) => S.re[i]), { color: alpha(c.blue, 0.7), width: 1.2 }); g.path(pts((i) => S.im[i]), { color: alpha(c.red, 0.6), width: 1.2 }); }
      if (ctx.toggles.heat) { const v = sig * sig + t, cx = START + p.k0 * t; g.fn((x) => Math.exp(-((x - cx) ** 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v), { color: c.green, width: 2, dash: [6, 4] }); }
      if (free) g.fn((x) => { const [a, b] = freePacket(x, t, START, p.k0, sig); return a * a + b * b; }, { color: c.ink, width: 1.5, dash: [2, 3] });
      g.path(pts((i) => S.re[i] ** 2 + S.im[i] ** 2), { color: c.gold, width: 3 });
      const f = '12px Inter, system-ui, sans-serif';
      g.text([X0, ym * 1.1], `━ |ψ|² (Crank–Nicolson)${free ? '   ┅ exact |ψ|²' : ''}`, { color: c.gold, font: f, baseline: 'top' });
      if (ctx.toggles.reim) g.text([X0, ym * 0.98], '━ Re ψ   ━ Im ψ', { color: c.muted, font: f, baseline: 'top' });
      if (ctx.toggles.heat) g.text([X0, ym * 0.86], '┅ heat equation (D = ½) from |ψ₀|², moved with the packet', { color: c.green, font: f, baseline: 'top' });
      g.text([X1, ym * 1.1], `t = ${t.toFixed(2)}`, { color: c.ink, font: '600 13px Inter, sans-serif', align: 'right', baseline: 'top' });
    });
    const tm = Math.max(TMAX, t);
    const sq = (tt: number) => sig * Math.sqrt(1 + (tt / (2 * sig * sig)) ** 2), sh = (tt: number) => Math.sqrt(sig * sig + tt);
    plot2.setView({ x0: -0.3, x1: tm * 1.03, y0: 0, y1: Math.max(sq(tm), sh(tm)) * 1.1 });
    plot2.setDraw((g) => {
      g.fn(sq, { color: c.gold, width: 2.6 }, [0, tm]);
      g.fn(sh, { color: c.green, width: 2.2, dash: [6, 4] }, [0, tm]);
      for (const q of hist) g.point(q, 2.4, { fill: c.ink });
      const y1 = Math.max(sq(tm), sh(tm)) * 1.05;
      g.text([0.1, y1], `━ quantum: σ₀√(1 + (t/2σ₀²)²)  ~ t`, { color: c.gold, font: '12px Inter, sans-serif', baseline: 'top' });
      g.text([0.1, y1 * 0.92], '┅ diffusion: √(σ₀² + t)  ~ √t', { color: c.green, font: '12px Inter, sans-serif', baseline: 'top' });
      g.text([0.1, y1 * 0.84], '● measured from the numerical |ψ|²', { color: c.ink, font: '12px Inter, sans-serif', baseline: 'top' });
    });
    const edge = (() => { let e = 0; for (let i = 0; i < S.n; i++) if (Math.abs(S.x[i]) > 16) e += (S.re[i] ** 2 + S.im[i] ** 2) * S.dx; return e; })();
    const rows: Readout[] = [
      { label: 't', value: fmt(t, 4) },
      { label: '‖ψ‖² (conserved)', value: fmt(S.norm(), 12) },
      { label: '⟨x⟩ numerical' + (free ? ' vs x₀ + k₀t' : ''), value: free ? `${fmt(mean, 5)} vs ${fmt(START + p.k0 * t, 5)}` : fmt(mean, 5) },
      { label: 'σ numerical' + (free ? ' vs exact' : ''), value: free ? `${fmt(sd, 5)} vs ${fmt(sq(t), 5)}` : fmt(sd, 5) },
    ];
    if (free) rows.push({ label: 'max |ψ_num − ψ_exact|', value: fmt(err, 3), tone: err < 0.01 ? 'good' : 'warn' });
    else rows.push({ label: 'probability past the barrier', value: fmt(right, 4) }, { label: 'packet energy k₀²/2 + ⟨kinetic spread⟩ vs V₀', value: `${fmt(p.k0 ** 2 / 2 + 1 / (8 * sig * sig), 4)} vs ${fmt(p.V0, 3)}` });
    ctx.setReadouts(rows);
    ctx.setNote(`Same algebra, different physics. With $D = \\tfrac{i}{2}$ the heat kernel becomes the free propagator, and the substitution $t \\to -i\\tau$ (imaginary time) turns one equation into the other — a formal identity used in quantum Monte Carlo. But $\\psi$ is complex: its phase carries momentum, the packet *moves*, and $|\\psi|^2$ spreads like $t$, not $\\sqrt t$.`);
    ctx.warn(edge > 1e-4 ? `The packet has reached the walls at x = ±20 (ψ = 0 there): it reflects, so ${free ? 'the free-space exact solution no longer applies' : 'what you see includes reflections from the box'}. Press reset.` : p.dt > 0.05 ? 'Large Δt: Crank–Nicolson is still stable and unitary, but phase errors grow — compare with the exact solution.' : '');
  };

  const update = () => {
    const p = ctx.params, k = [p.k0, p.sigma, p.V0, p.N, ctx.choices.V].join('|');
    if (k !== key || !s) { key = k; rebuild(); }
    draw();
  };
  return {
    update,
    tick(dtReal) {
      const S = s!, dt = ctx.params.dt;
      advance(dtReal, 1, dt, 200, () => S.step(dt), clock);
      const last = hist[hist.length - 1];
      if (!last || S.t - last[0] > 0.1) hist.push([S.t, moments().sd]);
      draw();
    },
    reset() { rebuild(); draw(); },
    csv() { const S = s!; return csv(['x', 're_psi', 'im_psi'], [S.x, S.re, S.im]); },
    dispose() {},
  };
}
