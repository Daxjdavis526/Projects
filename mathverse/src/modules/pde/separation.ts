// Separation of variables and the boundary value problem it leaves behind:
// X'' + λρ(x)X = 0 with two end conditions has solutions only for special λ.
// Shoot from the left end with a trial λ and see whether the right condition
// is met; the eigenvalues are the zeros of the mismatch.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { shoot, slEigenvalues, SLBC } from '../../core/numeric/pde';
import { fmt, pal, alpha, clamp, csv, P } from './common';

const LMIN = -20, LMAX = 400, SAMPLES = 360;

export const separation: DemoDef = {
  id: 'pde.separation', module: 'pde', title: 'Separation of variables: eigenvalues by shooting',
  topic: 'Separation of variables · boundary value problems · Sturm–Liouville eigenvalues · the shooting method',
  summary: 'Substituting u = X(x)T(t) leaves the boundary value problem X″ + λρX = 0 with conditions at both ends. Pick a λ, shoot from the left, and see whether you hit the right-hand condition: only the eigenvalues do.',
  tex: 'u = X(x)T(t)\\ \\Rightarrow\\ \\frac{X\'\'}{\\rho X} = \\frac{T\'}{\\alpha T} = -\\lambda;\\qquad X\'\' + \\lambda\\rho(x)X = 0,\\ \\ \\text{BC at } x = 0,\\ 1',
  view: 'split2d',
  params: [
    { key: 'lambda', label: 'trial λ (drag on the right)', value: 30, min: LMIN, max: LMAX, step: 0.01 },
    { key: 'kappa', label: 'Robin coefficient κ', value: 2, min: 0, max: 20, step: 0.01 },
    { key: 'taper', label: 'density ρ(x) = 1 + a·x,  a', value: 0, min: 0, max: 5, step: 0.01 },
  ],
  choices: [
    { key: 'left', label: 'Left end x = 0', value: 'dirichlet', options: [['dirichlet', 'X = 0'], ['neumann', "X′ = 0"], ['robin', "X′ = κX"]] },
    { key: 'right', label: 'Right end x = 1', value: 'dirichlet', options: [['dirichlet', 'X = 0'], ['neumann', "X′ = 0"], ['robin', "X′ = −κX"]] },
  ],
  toggles: [{ key: 'modes', label: 'First four eigenfunctions', value: false }],
  experiments: [
    'Drag λ along the mismatch curve: the right end hits its condition (green) only at the zeros — λ = π², 4π², 9π², … for X = 0 at both ends.',
    'Make the right end insulated (X′ = 0): the eigenvalues move to ((n − ½)π)². Make both ends insulated: λ = 0 (a constant) becomes an eigenvalue.',
    'Robin end with κ from 0 to 20: the eigenvalues slide from the Neumann values to the Dirichlet values.',
    'Give the string a density gradient (a > 0): no formula exists any more, but shooting still finds the eigenvalues, and the modes crowd toward the heavy end.',
    'Count the zeros of the eigenfunctions: the n-th one has n − 1 interior zeros (Sturm oscillation).',
  ],
  connections: ['pde.heat1d', 'pde.wave', 'pde.fourier', 'pde.bc', 'pde.membrane'],
  accuracy: 'The trial solution is integrated by RK4 (400 steps, error ~1e−10 here). Eigenvalues are the zeros of the normalized mismatch, found by a scan and Brent\'s method to ~1e−12. For ρ = 1 and Dirichlet/Neumann ends the exact eigenvalues are shown beside them; Robin ends satisfy a transcendental equation and a ≠ 0 has no closed form, so those are numerical only.',
  create: (ctx) => separationDemo(ctx),
};

function exactEigs(l: string, r: string, n: number): number[] | null {
  const P2 = Math.PI * Math.PI;
  if (l === 'dirichlet' && r === 'dirichlet') return Array.from({ length: n }, (_, k) => (k + 1) ** 2 * P2);
  if (l === 'neumann' && r === 'neumann') return Array.from({ length: n }, (_, k) => k * k * P2);
  if ((l === 'dirichlet' && r === 'neumann') || (l === 'neumann' && r === 'dirichlet')) return Array.from({ length: n }, (_, k) => (k + 0.5) ** 2 * P2);
  return null;
}

function separationDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.xLabel = 'x'; plot.opts.yLabel = 'X(x)';
  plot2.opts.xLabel = 'λ'; plot2.opts.yLabel = 'mismatch at x = 1';
  let key = '', curve: P[] = [], eigs: number[] = [], modes: P[][] = [];
  const traj = { x: [] as number[], X: [] as number[] };

  const bcs = (): [SLBC, SLBC, (x: number) => number] => {
    const k = ctx.params.kappa, a = ctx.params.taper;
    return [{ kind: ctx.choices.left as SLBC['kind'], kappa: k }, { kind: ctx.choices.right as SLBC['kind'], kappa: k }, (x: number) => 1 + a * x];
  };
  const normalize = (xs: number[], Xs: number[]): P[] => { const m = Math.max(1e-300, ...Xs.map(Math.abs)); return xs.map((x, i) => [x, Xs[i] / m]); };

  const rebuild = () => {
    const [l, r, rho] = bcs();
    curve = [];
    for (let i = 0; i <= SAMPLES; i++) { const lam = LMIN + ((LMAX - LMIN) * i) / SAMPLES; curve.push([lam, shoot(lam, rho, 1, l, r, 200)]); }
    eigs = slEigenvalues(rho, 1, l, r, LMIN, LMAX, 240, 400);
    modes = eigs.slice(0, 4).map((lam) => { const o = { x: [] as number[], X: [] as number[] }; shoot(lam, rho, 1, l, r, 400, o); return normalize(o.x, o.X); });
  };

  const draw = () => {
    const c = pal(ctx), [l, r, rho] = bcs(), lam = ctx.params.lambda;
    const mis = shoot(lam, rho, 1, l, r, 400, traj);
    const prof = normalize(traj.x, traj.X);
    const hit = Math.abs(mis) < 2e-3;
    plot.setView({ x0: -0.08, x1: 1.1, y0: -1.35, y1: 1.45 });
    plot.setDraw((g) => {
      if (ctx.toggles.modes) modes.forEach((m, k) => g.path(m, { color: alpha([c.blue, c.green, c.violet, c.cyan][k], 0.55), width: 1.5, dash: [5, 4] }));
      g.path(prof, { color: hit ? c.green : c.gold, width: 3 });
      const end = prof[prof.length - 1];
      g.point([0, prof[0][1]], 5, { fill: c.green });
      g.point(end, 6, { fill: hit ? c.green : c.red });
      g.text([0.1, 1.4], `trial λ = ${fmt(lam, 6)}  —  ${hit ? 'the right-hand condition is met: an eigenvalue!' : 'shooting misses the right-hand condition'}`, { color: hit ? c.green : c.ink, font: '600 12px Inter, sans-serif', baseline: 'top' });
      g.text([0.02, -1.3], `start: ${l.kind === 'dirichlet' ? 'X(0) = 0, X′(0) = 1' : l.kind === 'neumann' ? 'X(0) = 1, X′(0) = 0' : `X(0) = 1, X′(0) = κ = ${fmt(l.kappa!, 3)}`}   ·   aim: ${r.kind === 'dirichlet' ? 'X(1) = 0' : r.kind === 'neumann' ? 'X′(1) = 0' : 'X′(1) + κX(1) = 0'}`, { color: c.muted, font: '12px Inter, sans-serif', baseline: 'bottom' });
      if (ctx.toggles.modes) g.text([0.6, 1.4], '┅ eigenfunctions X₁…X₄', { color: c.muted, font: '12px Inter, sans-serif', baseline: 'top' });
    });
    plot2.setView({ x0: LMIN - 10, x1: LMAX + 10, y0: -1.25, y1: 1.35 });
    plot2.setDraw((g) => {
      g.path(curve, { color: c.blue, width: 2.4 });
      eigs.forEach((e, k) => { g.point([e, 0], 4.5, { fill: c.green }); g.text([e, 0], `λ${k + 1}`, { color: c.green, font: '600 11px Inter, sans-serif', align: 'center', baseline: 'bottom' }, 0, -7); });
      g.line([lam, -1.2], [lam, 1.2], { color: alpha(c.gold, 0.5), width: 1, dash: [3, 3] });
      g.handle({ id: 'lam', at: [lam, mis], color: c.gold, onDrag: ([x]) => {
        let v = clamp(x, LMIN, LMAX);
        const near = eigs.find((e) => Math.abs(e - v) < (LMAX - LMIN) / 300);   // snap gently onto an eigenvalue
        if (near !== undefined) v = near;
        ctx.setParam('lambda', +v.toFixed(near !== undefined ? 10 : 3));
      }, constrain: ([x]) => { const v = clamp(x, LMIN, LMAX); return [v, shoot(v, rho, 1, l, r, 200)]; } });
      g.text([LMIN, -1.2], 'normalized mismatch of the right-hand condition; its zeros are the eigenvalues', { color: c.muted, font: '12px Inter, sans-serif', baseline: 'bottom' });
    });
    const ex = ctx.params.taper === 0 ? exactEigs(l.kind, r.kind, eigs.length) : null;
    let err = 0;
    if (ex) eigs.forEach((e, k) => { err = Math.max(err, Math.abs(e - ex[k])); });
    // orthogonality of X1 and X2 with weight ρ
    let orth = NaN;
    if (modes.length >= 2) {
      const a = modes[0], b = modes[1], h = 1 / (a.length - 1);
      let s12 = 0, s11 = 0, s22 = 0;
      for (let i = 0; i < a.length; i++) { const w = (i === 0 || i === a.length - 1 ? 0.5 : 1) * h * rho(a[i][0]); s12 += w * a[i][1] * b[i][1]; s11 += w * a[i][1] ** 2; s22 += w * b[i][1] ** 2; }
      orth = s12 / Math.sqrt(s11 * s22);
    }
    const near = eigs.reduce((best, e) => (Math.abs(e - lam) < Math.abs(best - lam) ? e : best), Infinity);
    const rows: Readout[] = [
      { label: 'mismatch at x = 1', value: fmt(mis, 4), tone: hit ? 'good' : undefined },
      { label: 'nearest eigenvalue', value: Number.isFinite(near) ? fmt(near, 10) : '—' },
      { label: 'eigenvalues λₙ (shooting)', value: eigs.slice(0, 6).map((e) => fmt(e, 6)).join(', ') || 'none in range' },
      { label: 'exact', value: ex ? ex.slice(0, 6).map((e) => fmt(e, 6)).join(', ') : ctx.params.taper ? 'no closed form (ρ varies)' : 'tan-type equation: numerical only', tone: ex ? 'good' : 'muted' },
    ];
    if (ex) rows.push({ label: 'max |shooting − exact|', value: fmt(err, 2) });
    rows.push({ label: '∫ρX₁X₂ dx / norms (orthogonality)', value: fmt(orth, 2) });
    ctx.setReadouts(rows);
    ctx.setNote(`With $u = X(x)T(t)$ the heat equation $\\rho u_t = u_{xx}$ splits into $T' = -\\lambda T$ and the **boundary value problem** for $X$. A trial $\\lambda$ fixes $X$ from the left end alone; the right-hand condition is met only for the eigenvalues $\\lambda_n$. Then $u = \\sum c_n X_n(x)\\,e^{-\\lambda_n t}$ (heat) or $\\sum c_n X_n(x)\\cos(\\lambda_n^{1/2}\\,t)$ (a string), with $c_n$ from the orthogonality $\\int_0^1 \\rho X_m X_n\\,dx = 0$.`);
  };

  const update = () => {
    const k = [ctx.choices.left, ctx.choices.right, ctx.params.kappa, ctx.params.taper].join('|');
    if (k !== key) { key = k; rebuild(); }
    draw();
  };
  return {
    update,
    csv() { return csv(['x', 'X_trial'], [traj.x, traj.X]); },
    dispose() {},
  };
}
