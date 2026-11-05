// The pendulum θ″ = −(g/L) sin θ − γθ′: its phase portrait with energy
// levels and the separatrix, the exact period from the elliptic integral, and
// the swinging pendulum itself (drag the bob and let go), with the
// small-angle linear pendulum as a ghost for comparison.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveAdaptive, sample, Trajectory } from '../../core/numeric/ode';
import { ellipticK, homog2 } from '../../core/numeric/dynamics';
import { fmt, pal, csvOf, P, label, loopTime, thin } from './common';

const G = 9.81;
const wrap = (th: number) => th - 2 * Math.PI * Math.round(th / (2 * Math.PI));

export const pendulum: DemoDef = {
  id: 'ode.pendulum', module: 'ode', title: 'The pendulum: phase portrait and separatrix',
  topic: 'Nonlinear dynamical systems · conservation of energy · separatrix · nonlinear period',
  summary: 'The pendulum is the simplest truly nonlinear oscillator. Its phase portrait has closed orbits (swinging), open ones (going over the top), and the separatrix between them; its period grows with amplitude, without bound.',
  tex: "\\theta'' + \\gamma\\,\\theta' + \\frac{g}{L}\\sin\\theta = 0",
  view: 'split2d', animated: true,
  params: [
    { key: 'L', label: 'length L (m)', value: 1, min: 0.2, max: 5, step: 0.01 },
    { key: 'gamma', label: 'damping γ (1/s)', value: 0, min: 0, max: 1.5, step: 0.01 },
    { key: 'th0', label: 'initial angle θ₀ (rad)', value: 2, min: -3.14, max: 3.14, step: 0.001 },
    { key: 'om0', label: "initial angular velocity θ′₀ (rad/s)", value: 0, min: -10, max: 10, step: 0.01 },
    { key: 'T', label: 'time window T (s)', value: 20, min: 4, max: 60, step: 0.5 },
  ],
  toggles: [{ key: 'levels', label: 'Energy levels', value: true }, { key: 'separatrix', label: 'Separatrix', value: true }, { key: 'linear', label: 'Small-angle pendulum (ghost)', value: false }, { key: 'trail', label: 'Trail of the bob', value: true }],
  experiments: [
    'Start at θ₀ = 0.3: the orbit is nearly an ellipse and the period is 2π√(L/g). Now try θ₀ = 2.5 — the period is 50% longer.',
    'Drag the starting point in the phase plane above the separatrix: the pendulum goes over the top and keeps rotating.',
    'Start just inside the separatrix (θ₀ = 3.1): the pendulum lingers near the top — the period tends to infinity.',
    'Turn on damping: rotations become swings, and swings spiral into the bottom equilibrium.',
    'Turn on the small-angle ghost and compare: it keeps the period 2π/ω₀ however far it swings.',
  ],
  connections: ['ode.stability', 'ode.spring', 'ode.phase', 'ode.adaptive'],
  accuracy: 'The motion is numerical (Dormand–Prince 5(4), rtol 10⁻¹⁰; the energy drift readout measures its error). Energy levels and the separatrix ω = ±2ω₀cos(θ/2) are exact. The period is exact: 4K(k²)/ω₀ for swings and 2K(1/k²)/(ω₀k) per revolution, with K the complete elliptic integral computed by the arithmetic–geometric mean. The ghost is the exact solution of the linearized equation.',
  tutorial: [
    { text: 'With $\\omega_0 = \\sqrt{g/L}$ the pendulum obeys $\\theta\'\' = -\\omega_0^2\\sin\\theta$. For small angles $\\sin\\theta \\approx \\theta$ and it is a harmonic oscillator with period $2\\pi/\\omega_0$ — the phase orbit is an ellipse.', task: 'Press play and watch the bob and the phase point move together.', set: { params: { L: 1, gamma: 0, th0: 0.3, om0: 0 }, toggles: { levels: true, separatrix: true } }, done: (c) => c.time.playing },
    { text: 'Energy is conserved: $E = \\tfrac12\\theta\'^2 - \\omega_0^2\\cos\\theta$ (per $mL^2$). Each orbit is a level curve of $E$. At larger amplitude the orbit is no longer an ellipse and the period grows:\n$$T = \\frac{4K(k^2)}{\\omega_0},\\quad k = \\sin\\frac{\\theta_{max}}{2},$$ where $K$ is the complete elliptic integral of the first kind.', task: 'Raise θ₀ to above 2.8 and read the period ratio.', set: { params: { th0: 1.5 } }, done: (c) => Math.abs(c.params.th0) > 2.8 },
    { text: 'If the pendulum has enough energy, $E > \\omega_0^2$, it goes over the top: the orbit is no longer closed in $\\theta$ but wraps around the cylinder — **rotation**.', task: 'Give it a push: set θ′₀ large enough (or drag the start above the separatrix).', set: { params: { th0: 0, om0: 4 } }, done: (c) => 0.5 * c.params.om0 ** 2 - (G / c.params.L) * Math.cos(c.params.th0) > G / c.params.L },
    { text: 'Between swinging and rotating lies the **separatrix**, $E = \\omega_0^2$: $\\theta\' = \\pm 2\\omega_0\\cos(\\theta/2)$. On it the pendulum takes infinite time to reach the top (the saddle at $\\theta = \\pi$). Close to it the period grows like $\\ln(1/|E - \\omega_0^2|)$.', task: 'Start close to the top from rest (θ₀ > 3.1).', set: { params: { om0: 0, th0: 3.0 } }, done: (c) => Math.abs(c.params.th0) > 3.1 && Math.abs(c.params.om0) < 0.05 },
    { text: 'With damping, energy decreases monotonically: $dE/dt = -\\gamma\\theta\'^2 \\le 0$. Every orbit crosses the levels inward and spirals into the stable equilibrium at the bottom; a rotating pendulum first slows into swings.', task: 'Turn up the damping γ.', set: { params: { om0: 7, th0: 0, gamma: 0 } }, done: (c) => c.params.gamma > 0.1 },
    { text: 'Compare with the linearized pendulum $\\theta\'\' = -\\omega_0^2\\theta$ (ghost). It agrees for small angles and drifts out of phase at large ones, because its period never changes. Physically, a grandfather clock keeps its swing small for exactly this reason (and Huygens’ cycloidal pendulum removes the effect altogether).', task: 'Turn on the small-angle ghost.', set: { params: { gamma: 0, om0: 0, th0: 2 } }, done: (c) => c.toggles.linear },
  ],
  create: (ctx) => pendInst(ctx),
};

function pendInst(ctx: DemoCtx): DemoInstance {
  const pp = ctx.plot!, pv = ctx.plot2!;
  pp.opts.xLabel = 'θ'; pp.opts.yLabel = "θ′";
  pv.opts.equal = true; pv.opts.axes = false; pv.opts.grid = false; pv.opts.pan = false;
  let tr: Trajectory = { t: [0], y: [[0, 0]], ok: true, steps: 0 };
  let lin: (t: number) => number = () => 0;
  let tl = 0, tShift = 0, w0 = Math.sqrt(G);

  function update() {
    const { L, gamma, th0, om0, T } = ctx.params;
    w0 = Math.sqrt(G / L);
    const C = pal(ctx);
    tr = solveAdaptive((_t, y) => [y[1], -w0 * w0 * Math.sin(y[0]) - gamma * y[1]], [th0, om0], 0, T, { rtol: 1e-10, atol: 1e-12, maxStep: 0.01 });
    lin = homog2(gamma, w0 * w0, th0, om0).y;
    const E0 = 0.5 * om0 * om0 - w0 * w0 * Math.cos(th0);
    const ymax = Math.max(2.4 * w0, Math.abs(om0) * 1.15);
    pp.setView({ x0: -2 * Math.PI - 0.5, x1: 2 * Math.PI + 0.5, y0: -ymax, y1: ymax });
    pv.setView({ x0: -1.35, x1: 1.35, y0: -1.35, y1: 1.35 });
    // the phase path, wrapped onto (−π, π] and broken at the wraps
    const runs: P[][] = [[]];
    let prev = NaN;
    for (const Y of tr.y) {
      const th = wrap(Y[0]);
      if (Number.isFinite(prev) && Math.abs(th - prev) > Math.PI) runs.push([]);
      runs[runs.length - 1].push([th, Y[1]]);
      prev = th;
    }
    // energy levels E = ½θ′² − ω₀² cos θ, exactly, as runs of points
    const X0 = -2 * Math.PI - 0.5, X1 = 2 * Math.PI + 0.5, NS = 240;
    const levels: P[][] = [];
    for (const e of [-0.95, -0.75, -0.45, -0.1, 0.3, 0.65, 1.35, 2, 2.9]) for (const sgn of [1, -1]) {
      let run: P[] = [];
      for (let i = 0; i <= NS; i++) {
        const th = X0 + ((X1 - X0) * i) / NS, s = 2 * (e * w0 * w0 + w0 * w0 * Math.cos(th));
        if (s >= 0) run.push([th, sgn * Math.sqrt(s)]); else { if (run.length > 1) levels.push(run); run = []; }
      }
      if (run.length > 1) levels.push(run);
    }
    const sep = Array.from({ length: NS + 1 }, (_, i) => { const th = X0 + ((X1 - X0) * i) / NS; return [th, 2 * w0 * Math.abs(Math.cos(th / 2))] as P; });
    pp.setDraw((g) => {
      if (ctx.toggles.levels) for (const l of levels) g.path(l, { color: C.faint, width: 1.2 });
      if (ctx.toggles.separatrix) {
        g.path(sep, { color: C.red, width: 2.2 });
        g.path(sep.map(([a, b]) => [a, -b] as P), { color: C.red, width: 2.2 });
        label(g, [Math.PI, 0], 'saddle (inverted)', C.red, { dx: 8, dy: 12, size: 11 });
        label(g, [-0.2, 2 * w0], 'separatrix', C.red, { align: 'right', dy: -10, size: 11 });
      }
      for (const k of [-2, -1, 0, 1, 2]) g.point([k * Math.PI, 0], 4.5, { fill: k % 2 ? C.bg : C.green, color: k % 2 ? C.red : C.green, width: 2 });
      if (ctx.toggles.linear) g.parametric((t) => wrap(lin(t)), (t) => (lin(t + 1e-4) - lin(t - 1e-4)) / 2e-4, 0, T, { color: C.violet, width: 1.4, dash: [5, 4] }, 800);
      for (const r of runs) g.path(thin(r, 500), { color: C.gold, width: 2.6 });
      const s = sample(tr, tl);
      g.point([wrap(s[0]), s[1]], 6, { fill: C.orange });
      g.handle({ id: 'ic', at: [th0, om0], color: C.gold, label: 'start', constrain: ([a, b]) => [Math.max(-3.14, Math.min(3.14, a)), Math.max(-10, Math.min(10, b))], onDrag: ([a, b]) => { ctx.setParam('th0', a); ctx.setParam('om0', b); tShift = ctx.time.t; tl = 0; update(); } });
    });
    pv.setDraw((g) => {
      const s = sample(tr, tl);
      const r = 1; // drawn length (the plot is in units of L)
      g.parametric((u) => r * Math.sin(u), (u) => -r * Math.cos(u), 0, 2 * Math.PI, { color: C.faint, width: 1, dash: [3, 4] }, 160);
      g.line([-0.35, 0], [0.35, 0], { color: C.muted, width: 5 });
      if (ctx.toggles.trail) {
        const pts: P[] = [];
        for (let i = 0; i <= 40; i++) { const t = tl - (0.8 * i) / 40; if (t < 0) break; const q = sample(tr, t); pts.push([r * Math.sin(q[0]), -r * Math.cos(q[0])]); }
        g.path(pts, { color: C.orange, width: 3, alpha: 0.35 });
      }
      if (ctx.toggles.linear) { const q = lin(tl); g.line([0, 0], [r * Math.sin(q), -r * Math.cos(q)], { color: C.violet, width: 2, alpha: 0.6 }); g.point([r * Math.sin(q), -r * Math.cos(q)], 10, { fill: C.violet, alpha: 0.45 }); }
      const bx = r * Math.sin(s[0]), by = -r * Math.cos(s[0]);
      g.line([0, 0], [bx, by], { color: C.ink, width: 2.5 });
      g.point([0, 0], 4, { fill: C.ink });
      g.handle({ id: 'bob', at: [bx, by], r: 13, color: C.orange, onDrag: ([x, y]) => { const th = Math.atan2(x, -y); ctx.setParam('th0', Math.max(-3.14, Math.min(3.14, th))); ctx.setParam('om0', 0); tShift = ctx.time.t; tl = 0; update(); } });
      label(g, [g.view.x0 + 0.05, g.view.y1 - 0.08], `θ = ${fmt(wrap(s[0]), 3)} rad   θ′ = ${fmt(s[1], 3)} rad/s`, C.muted);
      if (ctx.toggles.linear) label(g, [g.view.x0 + 0.05, g.view.y1 - 0.2], 'violet: small-angle pendulum', C.violet);
    });
    // energies and the exact period
    const sN = tr.y[tr.y.length - 1];
    const EN = 0.5 * sN[1] ** 2 - w0 * w0 * Math.cos(sN[0]);
    const w02 = w0 * w0, k2 = (E0 + w02) / (2 * w02);
    const rows: Readout[] = [
      { label: 'ω₀ = √(g/L)', value: `${fmt(w0)} rad/s` },
      { label: 'small-angle period 2π/ω₀', value: `${fmt((2 * Math.PI) / w0)} s` },
      { label: 'energy E = ½θ′² − ω₀² cos θ', value: `${fmt(E0)}  (separatrix: ${fmt(w02)})` },
    ];
    let regime: string;
    if (gamma > 0) regime = 'damped — energy decreases';
    else if (Math.abs(E0 - w02) < 1e-9 * w02) regime = 'on the separatrix';
    else regime = E0 < w02 ? 'libration (swinging)' : 'rotation (over the top)';
    rows.push({ label: 'motion', value: regime, tone: regime.startsWith('rot') ? 'warn' : regime.startsWith('lib') ? 'good' : undefined });
    if (gamma === 0) {
      if (E0 < w02 && E0 > -w02) {
        const Tex = (4 * ellipticK(k2)) / w0, thmax = 2 * Math.asin(Math.min(1, Math.sqrt(k2)));
        rows.push({ label: 'amplitude θ_max', value: `${fmt(thmax)} rad (${fmt((thmax * 180) / Math.PI, 3)}°)` }, { label: 'exact period 4K(k²)/ω₀', value: `${fmt(Tex, 8)} s` }, { label: 'period / small-angle period', value: fmt(Tex / ((2 * Math.PI) / w0), 6), tone: 'muted' });
      } else if (E0 > w02) {
        const k = Math.sqrt(k2);
        rows.push({ label: 'time per revolution 2K(1/k²)/(ω₀k)', value: `${fmt((2 * ellipticK(1 / k2)) / (w0 * k), 8)} s` });
      } else if (E0 >= w02) rows.push({ label: 'period', value: '∞ (approaches the top forever)', tone: 'warn' });
      rows.push({ label: 'energy drift over T (numerical error)', value: fmt(Math.abs(EN - E0) / w02, 2), tone: Math.abs(EN - E0) / w02 < 1e-7 ? 'good' : 'warn' });
    } else rows.push({ label: 'energy lost by t = T', value: `${fmt(E0 - EN)} (of ${fmt(E0 + w02)} above the bottom)` });
    ctx.setReadouts(rows);
    ctx.setNote(`Left: the phase plane (θ on the circle, shown on $(-\\pi, \\pi]$ and repeated). Right: the pendulum — drag the bob to set $\\theta_0$ and let go. Physical analogues: a Josephson junction, a charged particle in a standing wave, and a planet’s spin-orbit resonance obey the same equation.`);
  }

  return {
    update,
    tick() { tl = loopTime(ctx.time.t - tShift, ctx.params.T); pp.render(); pv.render(); },
    reset() { tShift = 0; tl = 0; },
    csv() { return csvOf(['t', 'theta', "theta'", 'theta small-angle'], tr.t.map((t, i) => [t, tr.y[i][0], tr.y[i][1], lin(t)])); },
    dispose() {},
  };
}
