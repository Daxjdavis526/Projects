// Iterative solution of Laplace/Poisson: Jacobi, Gauss–Seidel and SOR relax
// a grid toward the solution. Watch the iterate (or its error) evolve sweep by
// sweep, and compare how fast each method's residual falls with the
// spectral-radius predictions.

import type { DemoDef, DemoCtx, DemoInstance } from '../types';
import { Grid2, RelaxMethod, relaxSweep, residual, solveRelax, sorOmegaOpt } from '../../core/numeric/pde';
import { fmt, pal, alpha, heatImage, divergingLut, csv, P } from './common';

const IMAX = 1500, TOL = 1e-6;
const NAME: Record<RelaxMethod, string> = { jacobi: 'Jacobi', gs: 'Gauss–Seidel', sor: 'SOR' };

export const relax: DemoDef = {
  id: 'pde.relax', module: 'pde', title: 'Relaxation: Jacobi, Gauss–Seidel and SOR',
  topic: 'Numerical methods for elliptic PDEs · Jacobi · Gauss–Seidel · successive over-relaxation · convergence rates',
  summary: 'The 5-point equations say each value is the average of its neighbours. Enforce that over and over and the grid relaxes to the solution — slowly (Jacobi), twice as fast (Gauss–Seidel), or dramatically faster with the right over-relaxation (SOR).',
  tex: 'u_{ij}^{\\text{new}} = (1 - \\omega)\\,u_{ij} + \\frac{\\omega}{4}\\left(u_{i-1,j} + u_{i+1,j} + u_{i,j-1} + u_{i,j+1} - h^2 f_{ij}\\right),\\qquad \\omega_{\\text{opt}} = \\frac{2}{1 + \\sin(\\pi h)}',
  view: 'split2d', animated: true,
  params: [
    { key: 'n', label: 'grid n × n', value: 32, min: 8, max: 64, step: 2 },
    { key: 'omega', label: 'SOR factor ω', value: 1.8, min: 1, max: 1.99, step: 0.005 },
    { key: 'speed', label: 'sweeps per second', value: 20, min: 1, max: 200, step: 1 },
  ],
  choices: [
    { key: 'method', label: 'Left panel: method', value: 'gs', options: [['jacobi', 'Jacobi'], ['gs', 'Gauss–Seidel'], ['sor', 'SOR (ω)']] },
    { key: 'problem', label: 'Problem', value: 'hot', options: [['hot', 'Laplace: hot top edge'], ['charge', 'Poisson: point source']] },
    { key: 'show', label: 'Left panel shows', value: 'u', options: [['u', 'the iterate'], ['err', 'its error']] },
  ],
  experiments: [
    'Play with Jacobi on a 32 × 32 grid: the heat creeps in from the top edge one cell per sweep — information moves only one neighbour per iteration.',
    'Switch to the error view: the jagged parts of the error vanish at once, the smooth hump lingers. Relaxation is a smoother; multigrid exploits exactly this.',
    'Slide ω and read the SOR curve: the iteration count is smallest near ω_opt = 2/(1 + sin πh) and climbs steeply on either side.',
    'Double n: Jacobi and Gauss–Seidel need about 4× more sweeps, optimal SOR only about 2× more.',
  ],
  connections: ['pde.laplace', 'pde.poisson', 'pde.stability'],
  accuracy: 'All three methods run exactly as written on the 5-point equations; the residual plotted is max |∇²_h u − f| over the interior. The reference solution for the error view is SOR iterated to a change below 1e−12. Spectral radii are the exact model-problem values: Jacobi cos πh, Gauss–Seidel cos² πh, optimal SOR ω_opt − 1.',
  create: (ctx) => relaxDemo(ctx),
};

function relaxDemo(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!, plot2 = ctx.plot2!;
  plot.opts.equal = true; plot.opts.xLabel = 'x'; plot.opts.yLabel = 'y';
  plot2.opts.xLabel = 'sweep k'; plot2.opts.yLabel = 'log₁₀ residual';
  let n = 0, key = '', sorKey = '', live: Grid2 | null = null, ref: Float64Array = new Float64Array(0), tmp = new Float64Array(0), k = 0, lag = 0;
  const hist: Record<string, number[]> = { jacobi: [], gs: [], sor: [], opt: [] };
  let img: ImageData | null = null;

  const fresh = (): Grid2 => {
    const m = n + 1, u = new Float64Array(m * m), fixed = new Uint8Array(m * m), f = ctx.choices.problem === 'charge' ? new Float64Array(m * m) : null;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) if (i === 0 || j === 0 || i === n || j === n) { fixed[j * m + i] = 1; u[j * m + i] = ctx.choices.problem === 'hot' && j === n ? 1 : 0; }
    if (f) f[Math.round(n * 0.6) * m + Math.round(n * 0.4)] = -1 / (1 / n) ** 2 * 1;   // −∇²u = δ at (0.4, 0.6)
    return { n, h: 1 / n, u, fixed, f };
  };
  const history = (method: RelaxMethod, omega: number) => {
    const g = fresh(), out = [residual(g)];
    for (let it = 0; it < IMAX && out[out.length - 1] > TOL * 1e-2; it++) { relaxSweep(g, method, omega, tmp); out.push(residual(g)); }
    return out;
  };
  const rebuild = () => {
    n = Math.round(ctx.params.n);
    tmp = new Float64Array((n + 1) ** 2);
    const r = fresh(); solveRelax(r, 'sor', sorOmegaOpt(n), 1e-12, 50000, tmp); ref = r.u;
    hist.jacobi = history('jacobi', 1); hist.gs = history('gs', 1); hist.opt = history('sor', sorOmegaOpt(n));
    sorKey = '';
    restart();
  };
  const restart = () => { live = fresh(); k = 0; lag = 0; };
  const firstBelow = (h: number[]) => { const r0 = h[0]; const i = h.findIndex((v) => v <= TOL * r0); return i < 0 ? `> ${h.length - 1}` : String(i); };
  const rate = (h: number[]) => { const L = h.length; if (L < 30) return NaN; const a = Math.max(5, L - 60), b = L - 5; return Math.pow(h[b] / h[a], 1 / (b - a)); };

  const draw = () => {
    const c = pal(ctx), g = live!, m = n + 1, err = ctx.choices.show === 'err';
    let emax = 1e-12, umax = 1e-12;
    for (let q = 0; q < m * m; q++) { emax = Math.max(emax, Math.abs(g.u[q] - ref[q])); umax = Math.max(umax, Math.abs(ref[q])); }
    img = heatImage(m, m, (i, j) => (err ? g.u[j * m + i] - ref[j * m + i] : g.u[j * m + i]), err ? -emax : 0, err ? emax : umax, err ? divergingLut(ctx.dark) : 'turbo', img);
    plot.setView({ x0: -0.05, x1: 1.05, y0: -0.12, y1: 1.1 });
    plot.setDraw((gr) => {
      gr.image(img!, -0.5 / n, 1 + 0.5 / n, -0.5 / n, 1 + 0.5 / n);
      gr.text([0, 1.07], `${NAME[ctx.choices.method as RelaxMethod]}${ctx.choices.method === 'sor' ? ` (ω = ${fmt(ctx.params.omega, 4)})` : ''}, sweep ${k}: ${err ? `error, colour range ±${fmt(emax, 2)}` : 'the iterate'}`, { color: c.ink, font: '600 12px Inter, sans-serif', baseline: 'bottom' });
      if (ctx.choices.problem === 'charge') gr.point([0.4, 0.6], 3, { fill: c.ink });
    });
    const curves: [string, number[], string][] = [['Jacobi', hist.jacobi, c.red], ['Gauss–Seidel', hist.gs, c.gold], [`SOR ω = ${fmt(ctx.params.omega, 3)}`, hist.sor, c.blue], [`SOR ω_opt = ${fmt(sorOmegaOpt(n), 4)}`, hist.opt, c.green]];
    const r0 = Math.log10(hist.jacobi[0]);
    const ymin = Math.min(r0 - 8.5, ...curves.map(([, h]) => Math.log10(h[h.length - 1])));
    plot2.setView({ x0: -IMAX * 0.03, x1: IMAX * 1.02, y0: ymin, y1: r0 + 1.2 });
    plot2.setDraw((gr) => {
      gr.line([0, r0 - 6], [IMAX, r0 - 6], { color: c.faint, width: 1, dash: [4, 4] });
      gr.text([IMAX, r0 - 6], 'tolerance: residual reduced 10⁶×', { color: c.muted, font: '11px Inter, sans-serif', align: 'right', baseline: 'bottom' }, 0, -3);
      curves.forEach(([name, h, col], q) => {
        gr.path(h.map((v, i) => [i, Math.log10(Math.max(v, 1e-300))] as P), { color: col, width: q === 2 ? 2.8 : 2 });
        gr.text([IMAX * 0.55, r0 + 1.05 - q * 0.42], `━ ${name}: ${firstBelow(h)} sweeps`, { color: col, font: '12px Inter, sans-serif', baseline: 'top' });
      });
      gr.line([k, r0 + 1.2], [k, ymin], { color: alpha(c.ink, 0.4), width: 1, dash: [2, 3] });
    });
    const res = residual(g);
    const h = Math.PI / n;
    ctx.setReadouts([
      { label: 'sweep k (left panel)', value: String(k) },
      { label: 'residual now', value: fmt(res, 3) },
      { label: 'max |u − solution| now', value: fmt(emax, 3) },
      { label: 'ρ Jacobi: cos πh  (measured)', value: `${fmt(Math.cos(h), 6)}  (${fmt(rate(hist.jacobi), 6)})` },
      { label: 'ρ Gauss–Seidel: cos² πh  (measured)', value: `${fmt(Math.cos(h) ** 2, 6)}  (${fmt(rate(hist.gs), 6)})` },
      { label: 'ρ SOR at ω_opt: ω_opt − 1  (measured)', value: `${fmt(sorOmegaOpt(n) - 1, 6)}  (${fmt(rate(hist.opt), 6)})` },
    ]);
    ctx.setNote(`Each sweep replaces every interior value by the average of its four neighbours (Jacobi uses only old values; Gauss–Seidel uses new ones as soon as they exist; SOR overshoots the Gauss–Seidel update by the factor $\\omega$). The error shrinks by about the spectral radius $\\rho$ per sweep, so the number of sweeps is about $\\ln 10^{-6}/\\ln\\rho$ — roughly $n^2$ for Jacobi and Gauss–Seidel, but only $n$ for optimal SOR.`);
    ctx.warn(ctx.params.omega > 1.98 ? 'ω close to 2: SOR still converges (for 0 < ω < 2) but very slowly and with large oscillations.' : '');
  };

  const update = () => {
    const kk = [ctx.params.n, ctx.choices.problem].join('|');
    if (kk !== key) { key = kk; rebuild(); }
    const sk = `${kk}|${ctx.params.omega}`;
    if (sk !== sorKey) { sorKey = sk; hist.sor = history('sor', ctx.params.omega); }
    draw();
  };
  return {
    update,
    tick(dt) {
      lag += dt * ctx.params.speed;
      let s = 0;
      while (lag >= 1 && s < 50) { relaxSweep(live!, ctx.choices.method as RelaxMethod, ctx.params.omega, tmp); k++; lag -= 1; s++; }
      if (s >= 50) lag = 0;
      if (s) draw();
    },
    reset() { restart(); draw(); },
    csv() { return csv(['sweep', 'res_jacobi', 'res_gs', 'res_sor', 'res_sor_opt'], [Array.from({ length: IMAX + 1 }, (_, i) => i), hist.jacobi, hist.gs, hist.sor, hist.opt]); },
    dispose() {},
  };
}
