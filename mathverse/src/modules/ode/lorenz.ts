// The Lorenz system in 3D: the strange attractor, two trajectories that start
// 10⁻⁸ apart and separate exponentially, and the separation on a log scale
// whose slope estimates the largest Lyapunov exponent.

import * as THREE from 'three';
import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { solveAdaptive, sample } from '../../core/numeric/ode';
import { eig } from '../../core/numeric/linalg';
import { fitOrder } from '../../core/numeric/dynamics';
import { fmt, pal, csvOf, P, label, loopTime, fmtRoot } from './common';

const DT = 0.01, TRAIL = 1.6;

export const lorenz: DemoDef = {
  id: 'ode.lorenz', module: 'ode', title: 'The Lorenz attractor and chaos',
  topic: 'Nonlinear dynamical systems · strange attractors · sensitive dependence · Lyapunov exponents',
  summary: 'Three innocent-looking equations from a model of convection. Trajectories never repeat and never leave a butterfly-shaped attractor, and two that start a hair apart become completely different: deterministic chaos.',
  tex: "\\begin{aligned} x' &= \\sigma(y - x) \\\\ y' &= x(\\rho - z) - y \\\\ z' &= xy - \\beta z \\end{aligned}",
  view: 'split3d', animated: true,
  params: [
    { key: 'sigma', label: 'σ (Prandtl number)', value: 10, min: 1, max: 20, step: 0.01 },
    { key: 'rho', label: 'ρ (Rayleigh number)', value: 28, min: 0.5, max: 60, step: 0.01 },
    { key: 'beta', label: 'β (geometry)', value: 8 / 3, min: 0.5, max: 5, step: 0.001 },
    { key: 'eps', label: 'log₁₀ of the initial separation', value: -8, min: -14, max: -1, step: 0.1 },
    { key: 'x0', label: 'x(0)', value: 1, min: -20, max: 20, step: 0.01 },
    { key: 'y0', label: 'y(0)', value: 1, min: -25, max: 25, step: 0.01 },
    { key: 'z0', label: 'z(0)', value: 20, min: 0, max: 50, step: 0.01 },
    { key: 'T', label: 'time span T', value: 40, min: 5, max: 80, step: 1 },
  ],
  choices: [{ key: 'plot', label: 'Left plot', value: 'x', options: [['x', 'x(t) of both trajectories'], ['sep', 'log₁₀ separation (Lyapunov)']] }],
  toggles: [{ key: 'attractor', label: 'Whole attractor (faint)', value: true }],
  experiments: [
    'Press play: the gold and cyan points start 10⁻⁸ apart and stay together for a while, then suddenly go separate ways.',
    'Switch the left plot to the log separation: it grows along a straight line (exponential growth) until it saturates at the size of the attractor. The slope is the Lyapunov exponent, ≈ 0.9.',
    'Make the separation 10⁻¹⁴ instead of 10⁻⁸: the trajectories stay together only about 7 time units longer — each factor of 10 buys just ln 10 / 0.9 ≈ 2.6.',
    'Lower ρ below 24.74: the equilibria C± become stable and trajectories spiral into one of them. Below ρ = 1 everything decays to the origin.',
    'Drag the gold initial point in the 3D view: wherever it starts, it ends up on the same attractor.',
  ],
  connections: ['ode.vanderpol', 'ode.stability', 'ode.adaptive'],
  accuracy: 'Numerical (Dormand–Prince 5(4), rtol 10⁻¹¹), resampled every 0.01. Honest caveat: because of chaos, the computed trajectory itself departs from the true solution with that initial value after roughly 25–30 time units (rounding acts like a 10⁻¹⁵ perturbation), although it stays on the attractor (shadowing). The Lyapunov exponent is a least-squares slope of the separation on its exponential stretch — an estimate.',
  create: (ctx) => lorenzInst(ctx),
};

function lorenzInst(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, v = ctx.view3d!;
  plot.opts.xLabel = 't';
  v.setBounds({ x: [-25, 25], y: [-30, 30], z: [0, 55] });
  const c0 = new THREE.Vector3(0, 27, 0), dir = new THREE.Vector3(1, 0.35, 0.9).normalize();
  v.setCamera({ position: [c0.x + dir.x * 105, c0.y + dir.y * 105, c0.z + dir.z * 105], target: [c0.x, c0.y, c0.z], projection: 'perspective' });
  const P0 = pal(ctx);
  const NMAX = Math.ceil(80 / DT) + 2;
  // the faint attractor, two bright trails and two heads, with preallocated buffers
  const mk = (color: string, opacity: number) => {
    const pos = new Float32Array(NMAX * 3), geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
    line.frustumCulled = false;
    v.addObject(line);
    return { pos, geo, line };
  };
  const att = mk(P0.blue, 0.35), tr1 = mk(P0.gold, 1), tr2 = mk(P0.cyan, 1);
  const h1 = v.addPoint([0, 0, 0], { color: P0.gold, size: 0.9 }), h2 = v.addPoint([0, 0, 0], { color: P0.cyan, size: 0.9 });
  const eqs = [v.addPoint([0, 0, 0], { color: '#ffffff', size: 0.6 }), v.addPoint([0, 0, 0], { color: '#ffffff', size: 0.6 }), v.addPoint([0, 0, 0], { color: '#ffffff', size: 0.6 })];
  const eqLabels = [v.addLabel([0, 0, 0], 'C₊'), v.addLabel([0, 0, 0], 'C₋')];
  const start = v.addPoint([1, 1, 20], {
    color: P0.gold, size: 1.3, label: 'start',
    drag: { onDrag: ([x, y, z]) => { ctx.setParam('x0', clamp(x, -20, 20)); ctx.setParam('y0', clamp(y, -25, 25)); ctx.setParam('z0', clamp(z, 0, 50)); }, onEnd: () => update() },
  });
  let A: Float64Array = new Float64Array(0), B: Float64Array = new Float64Array(0), N = 0;
  let tl = 0, lyap = NaN;
  let sepPts: P[] = [];

  function update() {
    const { sigma: s, rho: r, beta: b, eps, x0, y0, z0, T } = ctx.params;
    const rhs = (_t: number, Y: number[]) => [s * (Y[1] - Y[0]), Y[0] * (r - Y[2]) - Y[1], Y[0] * Y[1] - b * Y[2]];
    const o = { rtol: 1e-11, atol: 1e-12, maxStep: 0.01 };
    const d0 = Math.pow(10, eps);
    const t1 = solveAdaptive(rhs, [x0, y0, z0], 0, T, o), t2 = solveAdaptive(rhs, [x0 + d0, y0, z0], 0, T, o);
    N = Math.floor(T / DT) + 1;
    A = new Float64Array(N * 3); B = new Float64Array(N * 3);
    for (let i = 0; i < N; i++) {
      const p = sample(t1, i * DT), q = sample(t2, i * DT);
      A.set(p, 3 * i); B.set(q, 3 * i);
    }
    for (let i = 0; i < N; i++) { att.pos[3 * i] = A[3 * i]; att.pos[3 * i + 1] = A[3 * i + 1]; att.pos[3 * i + 2] = A[3 * i + 2]; }
    att.geo.setDrawRange(0, N); att.geo.attributes.position.needsUpdate = true;
    att.line.visible = ctx.toggles.attractor;
    start.set([x0, y0, z0]);
    // equilibria
    const ce = r > 1 ? Math.sqrt(b * (r - 1)) : NaN;
    eqs[0].set([0, 0, 0]);
    if (Number.isFinite(ce)) { eqs[1].set([ce, ce, r - 1]); eqs[2].set([-ce, -ce, r - 1]); eqLabels[0].set([ce + 2, ce, r + 1]); eqLabels[1].set([-ce - 2, -ce, r + 1]); }
    [eqs[1], eqs[2], eqLabels[0], eqLabels[1]].forEach((h) => h.visible(Number.isFinite(ce)));
    const Jc = Number.isFinite(ce) ? eig([[-s, s, 0], [1, -1, -ce], [ce, ce, -b]]) : [];
    const J0 = eig([[-s, s, 0], [r, -1, 0], [0, 0, -b]]);
    // separation and the Lyapunov estimate
    sepPts = [];
    for (let i = 0; i < N; i += 2) {
      const dx = A[3 * i] - B[3 * i], dy = A[3 * i + 1] - B[3 * i + 1], dz = A[3 * i + 2] - B[3 * i + 2];
      sepPts.push([i * DT, Math.log10(Math.hypot(dx, dy, dz) || 1e-300)]);
    }
    const lin = sepPts.filter(([t, l]) => t > 1 && l > eps + 1 && l < -0.5);
    lyap = lin.length > 20 ? fitOrder(lin.map(([t]) => Math.exp(t)), lin.map(([, l]) => Math.pow(10, l))) : NaN;   // slope of ln(sep) against t
    const C = pal(ctx);
    const isSep = ctx.choices.plot === 'sep';
    plot.opts.yLabel = isSep ? 'log₁₀ |separation|' : 'x';
    plot.setView(isSep ? { x0: -T * 0.03, x1: T * 1.02, y0: eps - 1.5, y1: 2.6 } : { x0: -T * 0.03, x1: T * 1.02, y0: -25, y1: 25 });
    const xa: P[] = [], xb: P[] = [];
    for (let i = 0; i < N; i += 2) { xa.push([i * DT, A[3 * i]]); xb.push([i * DT, B[3 * i]]); }
    plot.setDraw((g) => {
      if (isSep) {
        g.path(sepPts, { color: C.violet, width: 2 });
        if (Number.isFinite(lyap)) {
          const t0 = lin[0][0], l0 = lin[0][1];
          g.line([t0 - 2, l0 - (2 * lyap) / Math.LN10], [t0 + (-0.5 - l0) * Math.LN10 / lyap + 2, -0.5 + (2 * lyap) / Math.LN10], { color: C.gold, width: 1.6, dash: [6, 4] });
          label(g, [t0 + 1, l0 + 0.6], `slope: λ ≈ ${fmt(lyap, 3)} per unit time`, C.gold);
        }
      } else {
        g.path(xb, { color: C.cyan, width: 1.6 });
        g.path(xa, { color: C.gold, width: 1.6 });
      }
      g.line([tl, g.view.y0], [tl, g.view.y1], { color: C.muted, width: 1, dash: [4, 4] });
    });
    placeTrails();
    const rows: Readout[] = [
      { label: 'equilibria', value: Number.isFinite(ce) ? `origin, C± = (±${fmt(ce)}, ±${fmt(ce)}, ${fmt(r - 1)})` : 'only the origin (ρ ≤ 1)' },
      { label: 'eigenvalues of J at the origin', value: J0.map((e) => fmtRoot(e, 3)).join(', ') },
    ];
    if (Jc.length) {
      const unstable = Jc.some((e) => e.re > 1e-9);
      rows.push({ label: 'eigenvalues of J at C±', value: Jc.map((e) => fmtRoot(e, 3)).join(', ') }, { label: 'C± are', value: unstable ? 'unstable (ρ above the Hopf value)' : 'stable', tone: unstable ? 'bad' : 'good' });
    }
    if (s > b + 1) rows.push({ label: 'Hopf value ρ_H = σ(σ+β+3)/(σ−β−1)', value: fmt((s * (s + b + 3)) / (s - b - 1)), tone: 'muted' });
    rows.push({ label: 'largest Lyapunov exponent (estimate)', value: Number.isFinite(lyap) ? `${fmt(lyap, 3)}` : 'no exponential growth seen', tone: Number.isFinite(lyap) && lyap > 0 ? 'warn' : 'muted' });
    if (Number.isFinite(lyap) && lyap > 0) rows.push({ label: 'predictability horizon ln(1/δ₀)/λ', value: fmt(Math.log(1 / d0) / lyap, 3) });
    ctx.setReadouts(rows);
    ctx.setNote('Lorenz (1963) cut a model of a convecting fluid layer down to three modes: $x$ the circulation, $y$ and $z$ temperature variations. Volumes in phase space shrink at the rate $\\sigma + 1 + \\beta$ — yet nearby trajectories separate exponentially: the attractor is a fractal (dimension ≈ 2.06). This is why weather is unpredictable beyond about two weeks, although its equations are deterministic.');
  }

  function placeTrails() {
    const i = Math.min(N - 1, Math.round(tl / DT)), w = Math.round(TRAIL / DT), j0 = Math.max(0, i - w);
    for (const [buf, src] of [[tr1, A], [tr2, B]] as const) {
      for (let k = j0; k <= i; k++) { buf.pos[3 * (k - j0)] = src[3 * k]; buf.pos[3 * (k - j0) + 1] = src[3 * k + 1]; buf.pos[3 * (k - j0) + 2] = src[3 * k + 2]; }
      buf.geo.setDrawRange(0, i - j0 + 1); buf.geo.attributes.position.needsUpdate = true;
    }
    if (N) { h1.set([A[3 * i], A[3 * i + 1], A[3 * i + 2]]); h2.set([B[3 * i], B[3 * i + 1], B[3 * i + 2]]); }
    v.requestRender();
  }

  return {
    update,
    tick() { tl = loopTime(ctx.time.t, ctx.params.T); placeTrails(); plot.render(); },
    reset() { tl = 0; },
    csv() {
      const rows: number[][] = [];
      for (let i = 0; i < N; i++) rows.push([i * DT, A[3 * i], A[3 * i + 1], A[3 * i + 2], B[3 * i], B[3 * i + 1], B[3 * i + 2]]);
      return csvOf(['t', 'x1', 'y1', 'z1', 'x2', 'y2', 'z2'], rows);
    },
    dispose() { v.clear(); },
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
