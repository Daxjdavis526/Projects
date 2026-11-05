// Boundary conditions side by side: the same rod, the same initial
// temperature, two different end conditions (Dirichlet, Neumann, Robin,
// periodic), run together so the difference is the boundary alone.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import type { Plot2D } from '../../engine/plot2d';
import { Heat1D, EndCond } from '../../core/numeric/pde';
import { fmt, pal, drawEnd, advance, csv, EndKind, P } from './common';

const N = 120;
type BCKey = 'dd' | 'dd1' | 'nn' | 'dn' | 'rr' | 'dr' | 'per';
const OPTIONS: [BCKey, string][] = [
  ['dd', 'both ends held at 0 (Dirichlet)'], ['dd1', 'left held at 1, right at 0 (Dirichlet)'], ['nn', 'both ends insulated (Neumann)'],
  ['dn', 'left at 0, right insulated'], ['rr', 'both ends cooled by convection (Robin)'], ['dr', 'nozzle wall: hot gas 1 | coolant (Robin)'], ['per', 'a ring (periodic)'],
];
const TEXT: Record<BCKey, string> = {
  dd: '$u(0) = u(1) = 0$: the ends are clamped to the temperature of a large bath. Heat leaves through both ends until the rod is at 0.',
  dd1: '$u(0) = 1,\\ u(1) = 0$: a steady flow of heat runs through the rod; the steady state is the straight line $1 - x$.',
  nn: '$u_x(0) = u_x(1) = 0$: no heat crosses the ends. Total heat is conserved; the rod tends to its average temperature.',
  dn: '$u(0) = 0,\\ u_x(1) = 0$: heat can only leave through the left end. The right end behaves like a mirror (the rod is half of a symmetric rod of length 2).',
  rr: '$\\mp u_x = -\\mathrm{Bi}\\,(u - 0)$ at the ends: heat leaves at a rate proportional to the end temperature (Newton cooling). $\\mathrm{Bi} \\to 0$ is insulated, $\\mathrm{Bi} \\to \\infty$ is clamped.',
  dr: 'A rocket-nozzle wall seen through its thickness: the hot-gas side held at $1$, the coolant side losing heat by convection, $-u_x(1) = \\mathrm{Bi}\\,(u(1) - 0)$. Steady state: $u = 1 - \\dfrac{\\mathrm{Bi}\\,x}{1 + \\mathrm{Bi}}$ — the coolant side stays hot when $\\mathrm{Bi}$ is small.',
  per: '$u(0) = u(1),\\ u_x(0) = u_x(1)$: the rod is bent into a ring. Heat flows around it; total heat is conserved.',
};
const ENDS: Record<BCKey, [EndKind, EndKind, string, string]> = {
  dd: ['dirichlet', 'dirichlet', 'u = 0', 'u = 0'], dd1: ['dirichlet', 'dirichlet', 'u = 1', 'u = 0'], nn: ['neumann', 'neumann', 'insulated', 'insulated'],
  dn: ['dirichlet', 'neumann', 'u = 0', 'insulated'], rr: ['robin', 'robin', 'convection', 'convection'], dr: ['dirichlet', 'robin', 'hot gas u = 1', 'coolant'], per: ['periodic', 'periodic', 'joined', 'joined'],
};

function solverFor(bc: BCKey, alphaV: number, Bi: number): Heat1D {
  const D = (v: number): EndCond => ({ kind: 'dirichlet', value: v }), Nn: EndCond = { kind: 'neumann', value: 0 }, R: EndCond = { kind: 'robin', bi: Bi, value: 0 };
  const map: Record<BCKey, [EndCond, EndCond]> = { dd: [D(0), D(0)], dd1: [D(1), D(0)], nn: [Nn, Nn], dn: [D(0), Nn], rr: [R, R], dr: [D(1), R], per: [Nn, Nn] };
  const [left, right] = map[bc];
  return new Heat1D({ L: 1, N, alpha: alphaV, left, right, periodic: bc === 'per' });
}

export const bc: DemoDef = {
  id: 'pde.bc', module: 'pde', title: 'Boundary conditions side by side',
  topic: 'Boundary and initial conditions · Dirichlet · Neumann · Robin · periodic',
  summary: 'Two identical rods with the same initial temperature and different end conditions, evolving together — what the boundary alone does to a solution.',
  tex: '\\text{Dirichlet } u = g,\\qquad \\text{Neumann } \\tfrac{\\partial u}{\\partial n} = h,\\qquad \\text{Robin } \\tfrac{\\partial u}{\\partial n} + \\mathrm{Bi}\\,(u - u_\\infty) = 0,\\qquad \\text{periodic } u(0) = u(L)',
  view: 'split2d', animated: true,
  params: [
    { key: 'alpha', label: 'diffusivity α', value: 1, min: 0.1, max: 2, step: 0.01 },
    { key: 'Bi', label: 'Biot number Bi (Robin: h·L/k)', value: 3, min: 0, max: 40, step: 0.1 },
  ],
  choices: [
    { key: 'bcA', label: 'Left panel: ends', value: 'dd', options: OPTIONS },
    { key: 'bcB', label: 'Right panel: ends', value: 'nn', options: OPTIONS },
    { key: 'ic', label: 'Initial temperature (both)', value: 'box', options: [['box', 'hot middle'], ['left', 'hot left part'], ['bump', 'off-centre bump'], ['cold', 'cold']] },
  ],
  toggles: [{ key: 'steady', label: 'Exact steady state', value: true }, { key: 'flux', label: 'Heat-flux arrows at the ends', value: true }],
  experiments: [
    'Compare held-at-0 (left) with insulated (right): one rod cools to 0, the other only evens out — its total heat (readout) never changes.',
    'Set both panels to convection and slide Bi from 0 to 40: the Robin rod moves from behaving insulated to behaving clamped.',
    'Choose the nozzle wall and a cold start: the wall heats up from the gas side toward 1 − Bi·x/(1 + Bi). Lower Bi (poorer cooling) and the coolant side runs hot.',
    'Compare the ring (periodic) with insulated ends: both conserve heat, but on the ring heat can flow “around the back”.',
    'Left at 0, right insulated: the insulated end acts like a mirror — the temperature profile meets it flat.',
  ],
  connections: ['pde.heat1d', 'pde.separation', 'pde.heat2d', 'pde.diffusion', 'pde.fourier'],
  accuracy: 'Both rods are solved numerically by Crank–Nicolson on 121 nodes (ghost nodes for Neumann and Robin ends, second order; a cyclic tridiagonal solve for the ring). The steady states drawn are exact formulas (for insulated ends and the ring: the conserved mean). The flux arrows show −α u_x at each end from the numerical solution.',
  create: (ctx) => bcDemo(ctx),
};

function bcDemo(ctx: DemoCtx): DemoInstance {
  const plots: Plot2D[] = [ctx.plot!, ctx.plot2!];
  plots.forEach((p) => { p.opts.xLabel = 'x'; p.opts.yLabel = 'u'; });
  let rods: Heat1D[] = [], key = '', Q0: number[] = [], behind = false;
  const clock = { lag: 0 };
  const DT = 0.0004;

  const ic = (x: number) => {
    switch (ctx.choices.ic) {
      case 'box': return x > 0.3 && x < 0.7 ? 1 : 0;
      case 'left': return x < 0.45 ? 0.8 : 0;
      case 'bump': return Math.exp(-(((x - 0.28) / 0.08) ** 2));
      default: return 0;
    }
  };
  const keys = () => [ctx.choices.bcA as BCKey, ctx.choices.bcB as BCKey];
  const steady = (bcK: BCKey, k: number): ((x: number) => number) | null => {
    const Bi = ctx.params.Bi;
    switch (bcK) {
      case 'dd': case 'dn': case 'rr': return () => 0;
      case 'dd1': return (x) => 1 - x;
      case 'dr': return (x) => 1 - (Bi * x) / (1 + Bi);
      case 'nn': case 'per': return () => Q0[k];
    }
  };

  const rebuild = () => {
    rods = keys().map((b) => { const h = solverFor(b, ctx.params.alpha, ctx.params.Bi); h.setInitial(ic, true); return h; });
    Q0 = rods.map((h) => h.heat());
    clock.lag = 0;
  };

  const draw = () => {
    const c = pal(ctx), rows: Readout[] = [];
    keys().forEach((bcK, k) => {
      const h = rods[k], plot = plots[k], color = k ? c.orange : c.blue;
      const st = steady(bcK, k);
      const xs = bcK === 'per' ? [...h.x, 1] : Array.from(h.x);
      const us = bcK === 'per' ? [...h.u, h.u[0]] : Array.from(h.u);
      // heat leaving through each end: from the boundary condition where it fixes the slope, else a second-order one-sided difference
      const [lk0, rk0] = ENDS[bcK], M = us.length - 1, Bi = ctx.params.Bi;
      const slope0 = lk0 === 'neumann' ? 0 : lk0 === 'robin' ? Bi * us[0] : (-3 * us[0] + 4 * us[1] - us[2]) / (2 * h.dx);
      const slope1 = rk0 === 'neumann' ? 0 : rk0 === 'robin' ? -Bi * us[M] : (3 * us[M] - 4 * us[M - 1] + us[M - 2]) / (2 * h.dx);
      const qL = ctx.params.alpha * slope0, qR = -ctx.params.alpha * slope1;
      plot.setView({ x0: -0.12, x1: 1.12, y0: -0.25, y1: 1.3 });
      plot.setDraw((g) => {
        const [lk, rk, ll, rl] = ENDS[bcK];
        drawEnd(g, lk, 0, -1, -0.1, 1.05, c, ll);
        drawEnd(g, rk, 1, 1, -0.1, 1.05, c, rl);
        g.fn(ic, { color: c.faint, width: 1.4, dash: [5, 5] }, [0, 1]);
        if (ctx.toggles.steady && st) g.fn(st, { color: c.green, width: 2, dash: [2, 4] }, [0, 1]);
        g.path(xs.map((x, i) => [x, us[i]] as P), { color, width: 3 });
        if (ctx.toggles.flux && bcK !== 'per') {
          // arrows: outward heat flux at each end, length ∝ √|flux|
          const ar = (x: number, dir: number, q: number) => { if (Math.abs(q) < 1e-4) return; const len = Math.min(0.11, 0.035 * Math.sqrt(Math.abs(q))); const out = q > 0 ? dir : -dir; const a: P = [x - out * len * 0.5, 1.16], b: P = [x + out * len * 0.5, 1.16]; g.arrow(a, b, { color: c.red, width: 2.4 }); };
          ar(0.02, -1, qL); ar(0.98, 1, qR);
        }
        g.text([0.5, 1.27], OPTIONS.find(([v]) => v === bcK)![1], { color, font: '600 13px Inter, system-ui, sans-serif', align: 'center', baseline: 'top' });
        if (ctx.toggles.steady && st) g.text([0.5, -0.2], '┅ exact steady state', { color: c.green, font: '12px Inter, sans-serif', align: 'center', baseline: 'bottom' });
      });
      let dist = 0;
      if (st) for (let i = 0; i < h.n; i++) dist = Math.max(dist, Math.abs(h.u[i] - st(h.x[i])));
      const tag = k ? 'right' : 'left';
      rows.push(
        { label: `${tag}: total heat ∫u dx`, value: fmt(h.heat(), 6) + (bcK === 'nn' || bcK === 'per' ? '  (conserved)' : '') },
        { label: `${tag}: heat out (left end, right end)`, value: bcK === 'per' ? 'none — the ends are joined' : `${fmt(qL, 3)}, ${fmt(qR, 3)}` },
        { label: `${tag}: max |u − steady state|`, value: fmt(dist, 3), tone: dist < 1e-3 ? 'good' : undefined },
      );
    });
    rows.unshift({ label: 't (simulated)', value: fmt(rods[0].t, 4) });
    ctx.setReadouts(rows);
    const [a, b] = keys();
    ctx.setNote(`**Left (blue):** ${TEXT[a]}\n\n**Right (orange):** ${TEXT[b]}`);
    ctx.warn(behind ? 'The solver cannot keep up at this speed; the clock is slowed to match.' : '');
  };

  const update = () => {
    const k = [ctx.choices.bcA, ctx.choices.bcB, ctx.choices.ic, ctx.params.alpha, ctx.params.Bi].join('|');
    if (k !== key || !rods.length) { key = k; rebuild(); }
    draw();
  };
  return {
    update,
    tick(dtReal) {
      behind = advance(dtReal, 0.03, DT, 400, () => { for (const r of rods) r.step(DT, 'cn'); }, clock).behind;
      draw();
    },
    reset() { rebuild(); },
    csv() { return csv(['x', 'u_left_panel', 'u_right_panel'], [rods[0].x, rods[0].u, rods[1].u]); },
    dispose() {},
  };
}

