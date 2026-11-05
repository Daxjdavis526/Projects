// Laplace's equation on a square: drag the boundary values (a wire frame) and
// the harmonic surface spanning it follows — the exact Fourier series solution
// and the finite-difference one, their difference, the maximum principle and
// the mean-value property on a draggable circle.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { LaplaceSquare, Grid2, solveRelax, sorOmegaOpt, circleAverage, PL } from '../../core/numeric/pde';
import type { SurfaceHandle, CurveHandle, PointHandle, V3 } from '../../engine/viewport3d';
import { fmt, clamp, csv } from './common';

// 16 boundary handles counter-clockwise from (0, 0): 4 per side, corners shared
const HPOS: [number, number][] = [];
for (let k = 0; k < 4; k++) HPOS.push([k / 4, 0]);
for (let k = 0; k < 4; k++) HPOS.push([1, k / 4]);
for (let k = 0; k < 4; k++) HPOS.push([1 - k / 4, 1]);
for (let k = 0; k < 4; k++) HPOS.push([0, 1 - k / 4]);

function preset(name: string): number[] {
  return HPOS.map(([x, y]) => {
    switch (name) {
      case 'hot': return y === 1 ? 1 : 0;
      case 'twist': return (1 - 2 * x) * (1 - 2 * y);
      case 'saddle': return 2 * ((x - 0.5) ** 2 - (y - 0.5) ** 2);
      default: return (y === 0 && x === 0.5 ? 1 : 0) + (x === 1 && y === 0.5 ? -0.6 : 0) + (y === 1 && x === 0.25 ? 0.7 : 0) + (x === 0 && y === 0.75 ? 0.4 : 0);
    }
  });
}
const sidesOf = (v: number[]): { bottom: PL; right: PL; top: PL; left: PL } => {
  const xs = [0, 0.25, 0.5, 0.75, 1];
  return { bottom: { xs, ys: [v[0], v[1], v[2], v[3], v[4]] }, right: { xs, ys: [v[4], v[5], v[6], v[7], v[8]] }, top: { xs, ys: [v[12], v[11], v[10], v[9], v[8]] }, left: { xs, ys: [v[0], v[15], v[14], v[13], v[12]] } };
};
const plAt = (p: PL, s: number) => { for (let j = 0; j + 1 < p.xs.length; j++) if (s <= p.xs[j + 1] + 1e-12) return p.ys[j] + ((p.ys[j + 1] - p.ys[j]) * (s - p.xs[j])) / (p.xs[j + 1] - p.xs[j]); return p.ys[p.ys.length - 1]; };

export const laplace: DemoDef = {
  id: 'pde.laplace', module: 'pde', title: "Laplace's equation: a soap film on a wire",
  topic: "Laplace's equation · boundary value problems · maximum principle · mean-value property · series vs finite differences",
  summary: 'Bend the wire frame and the film spanning it settles into a harmonic surface: every point is the average of its surroundings, so no bump or dip can sit inside.',
  tex: '\\nabla^2 u = u_{xx} + u_{yy} = 0 \\text{ in } [0,1]^2,\\quad u = g \\text{ on the boundary};\\qquad u(\\mathbf x_0) = \\frac1{2\\pi}\\oint_{|\\mathbf x - \\mathbf x_0| = R} u\\, d\\theta',
  view: '3d',
  params: [
    { key: 'n', label: 'finite-difference grid n × n', value: 40, min: 8, max: 100, step: 2 },
    { key: 'K', label: 'series terms K per side', value: 60, min: 3, max: 200, step: 1 },
    { key: 'cx', label: 'circle centre x', value: 0.5, min: 0.05, max: 0.95, step: 0.005 },
    { key: 'cy', label: 'circle centre y', value: 0.45, min: 0.05, max: 0.95, step: 0.005 },
    { key: 'R', label: 'circle radius R', value: 0.25, min: 0.02, max: 0.49, step: 0.005 },
  ],
  choices: [
    { key: 'preset', label: 'Boundary values (then drag the orange handles)', value: 'hot', options: [['hot', 'hot top edge'], ['bumps', 'bumps on the sides'], ['saddle', 'saddle'], ['twist', 'twisted corners (bilinear)']] },
    { key: 'show', label: 'Surface shows', value: 'fd', options: [['fd', 'finite differences (SOR)'], ['series', 'exact series'], ['diff', 'their difference ×50']] },
  ],
  toggles: [{ key: 'circle', label: 'Mean-value circle', value: true }, { key: 'wire', label: 'Other solution as a wireframe', value: false }],
  experiments: [
    'Drag one boundary handle up: the whole film rises a little, most near the handle — an elliptic equation feels every boundary value everywhere.',
    'Try to make an interior peak: you cannot. The maximum and minimum are always on the boundary (maximum principle).',
    'Turn on the circle and drag its centre: the average of u around it always equals u at its centre.',
    'Show the difference ×50 and refine n: the finite-difference error falls like h².',
    'Choose “twisted corners”: u = (1 − 2x)(1 − 2y) is harmonic and bilinear, so the series has no terms and the finite differences are exact.',
  ],
  connections: ['pde.poisson', 'pde.relax', 'pde.heat2d', 'pde.classify', 'pde.separation'],
  accuracy: 'The exact solution is the Fourier series on the square (bilinear corner part plus four sine series with exact coefficients for the piecewise-linear wire), truncated at K terms per side: it converges exponentially inside and like 1/K on the boundary (reported). The finite-difference solution is the 5-point scheme relaxed by SOR to a change below 1e−10; its difference from the series is shown. The circle average uses the trapezoid rule with 256 points on the series.',
  tutorial: [
    { text: '**A soap film on a bent wire.** A film (or a stretched membrane at rest, or a steady temperature) minimizes area and satisfies Laplace\'s equation $u_{xx} + u_{yy} = 0$: no net curvature anywhere. The orange handles shape the wire; the surface spans it.', task: 'Rotate the view, then drag an orange handle up or down.', set: { choices: { preset: 'hot', show: 'fd' }, toggles: { circle: false, wire: false } } },
    { text: '**Global influence.** Moving one handle changes the film *everywhere* — less and less with distance, but never zero. That is the signature of an **elliptic** equation: no characteristics, no finite speed, every boundary value felt at every interior point.', task: 'Choose the “bumps on the sides” boundary and drag a handle again.', done: (c) => c.choices.preset === 'bumps' },
    { text: '**The maximum principle.** A harmonic function cannot have an interior maximum or minimum: the readouts compare the interior extremes with the boundary extremes. A hot plate in steady state is never hottest inside.', task: 'Compare interior and boundary max/min in the readouts.' },
    { text: '**The mean-value property.** For a harmonic $u$, the average around any circle equals the value at its centre. The discrete version — each grid value is the average of its four neighbours — is exactly the finite-difference equation.', task: 'Turn on the circle and enlarge it to R ≥ 0.35.', set: { toggles: { circle: true }, params: { R: 0.2, cx: 0.5, cy: 0.5 } }, done: (c) => !!c.toggles.circle && c.params.R >= 0.35 },
    { text: '**Exact versus numerical.** The series is built by separation of variables: $\\sin k\\pi x\\,\\sinh k\\pi y/\\sinh k\\pi$ and its rotations. The finite-difference surface solves the 5-point equations. Their difference is the discretization error, $O(h^2)$.', task: 'Show the difference ×50 and raise n to 80: it shrinks about 4× per halving of h.', set: { choices: { show: 'diff' }, params: { n: 20 } }, done: (c) => c.choices.show === 'diff' && c.params.n >= 80 },
    { text: '**Physics.** In a charge-free region the electrostatic potential obeys $\\nabla^2\\phi = 0$: the wire is a set of electrode voltages and the surface is the potential between them. Add charge and it becomes Poisson\'s equation — see *Poisson: point charges in a box*.' },
  ],
  create: (ctx) => laplaceDemo(ctx),
};

function laplaceDemo(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  let vals = preset(ctx.choices.preset), presetName = ctx.choices.preset, edited = false;
  let surf: SurfaceHandle | null = null, wire: SurfaceHandle | null = null, frame: CurveHandle | null = null, circle: CurveHandle | null = null, centre: PointHandle | null = null;
  const handles: PointHandle[] = [];
  let n = 0, grid: Grid2 | null = null, tmp = new Float64Array(0), ser = new Float64Array(0), series: LaplaceSquare | null = null;
  let iters = 0, surfRes = -1, fitted = false;

  const zb = () => { const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals); return { lo: lo - 0.15, hi: hi + 0.15 }; };

  const solve = () => {
    const sides = sidesOf(vals);
    series = new LaplaceSquare(sides, Math.round(ctx.params.K));
    const m = n + 1;
    if (!grid || grid.n !== n) {
      grid = { n, h: 1 / n, u: new Float64Array(m * m), fixed: new Uint8Array(m * m) };
      tmp = new Float64Array(m * m); ser = new Float64Array(m * m);
    }
    const g = grid;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const id = j * m + i, x = i / n, y = j / n;
      if (i === 0 || j === 0 || i === n || j === n) {
        g.fixed[id] = 1;
        g.u[id] = j === 0 ? plAt(sides.bottom, x) : j === n ? plAt(sides.top, x) : i === 0 ? plAt(sides.left, y) : plAt(sides.right, y);
      }
    }
    iters = solveRelax(g, 'sor', sorOmegaOpt(n), 1e-10, 20000, tmp).iterations;
    series.grid(n, ser);
  };

  const valueAt = (which: 'fd' | 'series' | 'diff', i: number, j: number) => {
    const id = j * (n + 1) + i;
    return which === 'fd' ? grid!.u[id] : which === 'series' ? ser[id] : 50 * (grid!.u[id] - ser[id]);
  };

  const redraw = () => {
    const show = ctx.choices.show as 'fd' | 'series' | 'diff';
    const { lo, hi } = zb();
    const f = (which: 'fd' | 'series' | 'diff') => (x: number, y: number): V3 => [x, y, valueAt(which, Math.round(x * n), Math.round(y * n))];
    const opts = { uRange: [0, 1] as [number, number], vRange: [0, 1] as [number, number], res: n, colormap: (show === 'diff' ? 'coolwarm' : 'turbo') as 'coolwarm' | 'turbo', colorRange: (show === 'diff' ? [-0.05, 0.05] : [Math.min(...vals), Math.max(...vals) + 1e-9]) as [number, number] };
    if (!surf || surfRes !== n) { surf?.dispose(); wire?.dispose(); surf = v.addSurface(f(show), opts); wire = null; surfRes = n; }
    else surf.update(f(show), opts);
    if (ctx.toggles.wire && show !== 'diff') {
      const other = show === 'fd' ? 'series' : 'fd';
      const wo = { ...opts, wireframe: true, colorBy: 'uniform' as const, color: ctx.dark ? '#ffffff' : '#1b1f2a', opacity: 0.55 };
      if (!wire) wire = v.addSurface(f(other), wo); else wire.update(f(other), wo);
      wire.visible(true);
    } else wire?.visible(false);
    // the wire frame and its handles
    const sides = sidesOf(vals), pts: V3[] = [];
    for (let k = 0; k <= 200; k++) { const s = (k / 200) * 4, side = Math.min(3, Math.floor(s)), q = s - side; pts.push(side === 0 ? [q, 0, plAt(sides.bottom, q)] : side === 1 ? [1, q, plAt(sides.right, q)] : side === 2 ? [1 - q, 1, plAt(sides.top, 1 - q)] : [0, 1 - q, plAt(sides.left, 1 - q)]); }
    if (!frame) frame = v.addCurve(pts, { color: '#ff9f5a', radius: 0.008 }); else frame.set(pts);
    HPOS.forEach(([x, y], k) => {
      const p: V3 = [x, y, vals[k]];
      if (!handles[k]) handles[k] = v.addPoint(p, { color: '#ff9f5a', size: 0.028, drag: { constrain: (q) => [x, y, clamp(q[2], -1.5, 1.5)], onDrag: (q) => { vals[k] = q[2]; edited = true; solve(); redraw(); report(); } } });
      else handles[k].set(p);
    });
    // the mean-value circle on the exact surface
    const { cx, cy, R } = circleParams();
    if (ctx.toggles.circle && show !== 'diff') {
      const cp: V3[] = [];
      for (let k = 0; k <= 128; k++) { const a = (2 * Math.PI * k) / 128, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); cp.push([x, y, series!.at(x, y) + 0.004]); }
      if (!circle) circle = v.addCurve(cp, { color: '#ffffff', radius: 0.006 }); else circle.set(cp);
      const c0: V3 = [cx, cy, series!.at(cx, cy)];
      if (!centre) centre = v.addPoint(c0, { color: '#ffffff', size: 0.025, drag: { constrain: (q) => { const r = ctx.params.R; const X = clamp(q[0], r + 0.005, 1 - r - 0.005), Y = clamp(q[1], r + 0.005, 1 - r - 0.005); return [X, Y, series!.at(X, Y)]; }, onDrag: (q) => { ctx.setParam('cx', +q[0].toFixed(3)); ctx.setParam('cy', +q[1].toFixed(3)); redraw(); report(); } } });
      else centre.set(c0);
      circle.visible(true); centre.visible(true);
    } else { circle?.visible(false); centre?.visible(false); }
    const b = v.getBounds();
    if (!fitted || Math.abs(b.z[0] - lo) > 0.2 || Math.abs(b.z[1] - hi) > 0.2) { v.setBounds({ x: [0, 1], y: [0, 1], z: [lo, hi] }); if (!fitted) v.resetCamera(); fitted = true; }
  };

  const circleParams = () => {
    const R = ctx.params.R;
    return { R, cx: clamp(ctx.params.cx, R + 0.005, 1 - R - 0.005), cy: clamp(ctx.params.cy, R + 0.005, 1 - R - 0.005) };
  };

  const report = () => {
    const S = series!, g = grid!, m = n + 1;
    let dmax = 0, imax = -Infinity, imin = Infinity, bmax = -Infinity, bmin = Infinity;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const id = j * m + i;
      if (g.fixed[id]) { bmax = Math.max(bmax, g.u[id]); bmin = Math.min(bmin, g.u[id]); continue; }
      dmax = Math.max(dmax, Math.abs(g.u[id] - ser[id]));
      imax = Math.max(imax, g.u[id]); imin = Math.min(imin, g.u[id]);
    }
    // the series on the boundary (truncation error, ~1/K)
    const sides = sidesOf(vals);
    let berr = 0;
    for (let k = 1; k < 64; k++) { const s = k / 64; berr = Math.max(berr, Math.abs(S.at(s, 0) - plAt(sides.bottom, s)), Math.abs(S.at(1, s) - plAt(sides.right, s)), Math.abs(S.at(s, 1) - plAt(sides.top, s)), Math.abs(S.at(0, s) - plAt(sides.left, s))); }
    const { cx, cy, R } = circleParams();
    const uc = S.at(cx, cy), avg = circleAverage((x, y) => S.at(x, y), cx, cy, R);
    ctx.setReadouts([
      { label: 'u(centre)  (series)', value: fmt(uc, 8) },
      { label: 'average of u on the circle', value: fmt(avg, 8) },
      { label: '|average − centre value|', value: fmt(Math.abs(avg - uc), 2), tone: Math.abs(avg - uc) < 1e-8 ? 'good' : 'warn' },
      { label: 'interior max / min (FD)', value: `${fmt(imax, 4)} / ${fmt(imin, 4)}` },
      { label: 'boundary max / min', value: `${fmt(bmax, 4)} / ${fmt(bmin, 4)}`, tone: imax <= bmax + 1e-12 && imin >= bmin - 1e-12 ? 'good' : 'bad' },
      { label: 'max |FD − series| inside', value: fmt(dmax, 3) },
      { label: 'series error on the wire (1/K)', value: fmt(berr, 2) },
      { label: 'SOR sweeps (ω = ω_opt)', value: `${iters}  (ω = ${fmt(sorOmegaOpt(n), 4)})` },
    ]);
    ctx.setNote(`${edited ? '**Your wire.** ' : ''}The surface is ${ctx.choices.show === 'fd' ? 'the finite-difference solution (5-point Laplacian, SOR)' : ctx.choices.show === 'series' ? `the exact Fourier series with ${Math.round(ctx.params.K)} terms per side` : 'the difference (finite differences − series), magnified 50×'}. Orange: the wire (piecewise linear through the handles)${ctx.toggles.circle ? '; white: a circle on the exact surface — its average equals the centre value' : ''}.`);
    ctx.warn(Math.round(ctx.params.K) < 10 ? 'Few series terms: the exact series is truncated hard, so it misses the wire by up to the amount shown — this is truncation, not a property of the solution.' : '');
  };

  const update = () => {
    if (ctx.choices.preset !== presetName) { presetName = ctx.choices.preset; vals = preset(presetName); edited = false; }
    n = Math.round(ctx.params.n);
    solve();
    redraw();
    report();
  };
  return {
    update,
    csv() { const m = n + 1, xs: number[] = [], ys: number[] = [], fd: number[] = [], se: number[] = []; for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { xs.push(i / n); ys.push(j / n); fd.push(grid!.u[j * m + i]); se.push(ser[j * m + i]); } return csv(['x', 'y', 'u_fd', 'u_series'], [xs, ys, fd, se]); },
    dispose() { v.clear(); },
  };
}
