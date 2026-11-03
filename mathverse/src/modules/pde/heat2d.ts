// Heat on a plate: a 3D temperature surface evolving in time, with initial
// shapes or draggable hot spots (optionally kept heated), insulated or held
// edges, FTCS or ADI, and the exact separable series where one exists.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { Heat2D, SideBC, heatSineSeries } from '../../core/numeric/pde';
import { integrate } from '../../core/numeric/quad';
import type { SurfaceHandle, PointHandle, V3 } from '../../engine/viewport3d';
import { fmt, clamp, advance, csv } from './common';

const KS = 60;          // series terms per direction
const SIG = 0.07;       // hot-spot width

export const heat2d: DemoDef = {
  id: 'pde.heat2d', module: 'pde', title: 'Heat on a plate',
  topic: 'Heat equation (2D) · initial and boundary conditions · ADI and FTCS · exact series',
  summary: 'A square plate whose temperature is the height of the surface. Place hot spots, pick the edges (held cold, insulated or heated) and watch heat spread, numerically and — where possible — exactly.',
  tex: 'u_t = \\alpha\\,(u_{xx} + u_{yy}) + q(x, y),\\qquad \\text{ADI: } \\left(I - \\tfrac r2\\delta_x^2\\right)u^{*} = \\left(I + \\tfrac r2\\delta_y^2\\right)u^n',
  view: '3d', animated: true,
  params: [
    { key: 'alpha', label: 'diffusivity α', value: 0.3, min: 0.02, max: 1, step: 0.01 },
    { key: 'n', label: 'grid n × n', value: 50, min: 10, max: 100, step: 2 },
    { key: 'r', label: 'r = αΔt/Δx²', value: 0.2, min: 0.02, max: 4, step: 0.01 },
    { key: 'heat', label: 'heater power (sources)', value: 20, min: 0, max: 80, step: 0.5 },
  ],
  choices: [
    { key: 'ic', label: 'Initial temperature', value: 'spots', options: [['spots', 'two hot spots (drag them)'], ['block', 'hot square'], ['ring', 'hot ring'], ['mode', 'mode sin 2πx sin πy'], ['cold', 'cold (use heaters)']] },
    { key: 'bc', label: 'Edges', value: 'cold', options: [['cold', 'all held at 0'], ['insulated', 'all insulated'], ['mixed', 'x-edges 0, y-edges insulated'], ['hotedge', 'left edge held at 1']] },
    { key: 'scheme', label: 'Scheme', value: 'adi', options: [['adi', 'ADI (implicit)'], ['ftcs', 'FTCS (explicit)']] },
  ],
  toggles: [{ key: 'heaters', label: 'Keep the spots heated (sources)', value: false }, { key: 'exact', label: 'Exact series wireframe (where it exists)', value: true }],
  experiments: [
    'Play with two hot spots and cold edges: each spot spreads as a widening Gaussian, then the edges drain the heat away.',
    'Insulate all edges: the total heat (readout) stays constant and the plate tends to a uniform temperature.',
    'Turn on the heaters and play long: a steady state appears — the solution of Poisson\'s equation α∇²u = −q.',
    'Choose FTCS and set r above ¼: the plate erupts into a checkerboard. ADI shrugs off r = 4.',
    'Drag a hot spot while paused: the clock restarts from your new initial condition.',
  ],
  connections: ['pde.heat1d', 'pde.poisson', 'pde.laplace', 'pde.diffusion', 'pde.stability'],
  accuracy: 'The surface is the numerical finite-difference solution on (n+1)² nodes. The wireframe is the exact double sine series, available for cold edges without heaters (spots: separable Gaussians with sine coefficients by adaptive quadrature to 1e−10, 60 terms per direction; the mode: exact). Readouts give their difference. FTCS in 2D needs r ≤ ¼.',
  create: (ctx) => heat2dDemo(ctx),
};

function heat2dDemo(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  let zMode = '';
  const fit = () => {
    const zm = ctx.choices.ic === 'mode' ? 'm' : 'p';
    if (zm === zMode) return;
    zMode = zm;
    v.setBounds({ x: [0, 1], y: [0, 1], z: zm === 'm' ? [-0.8, 0.8] : [-0.4, 1] });
    v.resetCamera();
  };
  let solver: Heat2D | null = null, surf: SurfaceHandle | null = null, wire: SurfaceHandle | null = null;
  const spots: [number, number][] = [[0.3, 0.35], [0.68, 0.62]];
  const spotH: PointHandle[] = [];
  let key = '', n = 0, blown = false, behind = false;
  const clock = { lag: 0 };
  // exact series data
  let exact: { bx: Float64Array[]; by: Float64Array[]; amp: number[] } | null = null;
  let ex = new Float64Array(0), exErr = NaN;
  const X = new Float64Array(201), Y = new Float64Array(201);

  const bcOf = (): { left: SideBC; right: SideBC; bottom: SideBC; top: SideBC } => {
    const z: SideBC = { kind: 'dirichlet', value: 0 }, ins: SideBC = { kind: 'neumann' };
    switch (ctx.choices.bc) {
      case 'insulated': return { left: ins, right: ins, bottom: ins, top: ins };
      case 'mixed': return { left: z, right: z, bottom: ins, top: ins };
      case 'hotedge': return { left: { kind: 'dirichlet', value: 1 }, right: z, bottom: z, top: z };
      default: return { left: z, right: z, bottom: z, top: z };
    }
  };
  const gauss = (x: number, y: number, s: [number, number]) => Math.exp(-((x - s[0]) ** 2 + (y - s[1]) ** 2) / (2 * SIG * SIG));
  const icFn = (): ((x: number, y: number) => number) => {
    switch (ctx.choices.ic) {
      case 'spots': return (x, y) => gauss(x, y, spots[0]) + 0.75 * gauss(x, y, spots[1]);
      case 'block': return (x, y) => (Math.abs(x - 0.5) < 0.18 && Math.abs(y - 0.5) < 0.18 ? 1 : 0);
      case 'ring': return (x, y) => Math.exp(-(((Math.hypot(x - 0.5, y - 0.5) - 0.25) / 0.05) ** 2));
      case 'mode': return (x, y) => Math.sin(2 * Math.PI * x) * Math.sin(Math.PI * y) * 0.8;
      default: return () => 0;
    }
  };
  const setSources = () => {
    const s = solver!, m = s.m, P = ctx.params.heat;
    s.q.fill(0);
    if (!ctx.toggles.heaters) return;
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) { const x = i * s.h, y = j * s.h; s.q[j * m + i] = P * (gauss(x, y, spots[0]) + 0.75 * gauss(x, y, spots[1])); }
  };
  const exactAvailable = () => ctx.choices.bc === 'cold' && !ctx.toggles.heaters && (ctx.choices.ic === 'spots' || ctx.choices.ic === 'mode');
  const buildExact = () => {
    exact = null;
    if (!exactAvailable()) return;
    if (ctx.choices.ic === 'mode') return;
    // each spot is a product g(x)g(y): its sine coefficients factor
    const coeff = (c: number) => { const b = new Float64Array(KS); for (let k = 1; k <= KS; k++) b[k - 1] = 2 * integrate((s) => Math.exp(-((s - c) ** 2) / (2 * SIG * SIG)) * Math.sin(k * Math.PI * s), 0, 1, 1e-11).value; return b; };
    exact = { bx: spots.map((s) => coeff(s[0])), by: spots.map((s) => coeff(s[1])), amp: [1, 0.75] };
  };
  const exactGrid = () => {
    const s = solver!, m = s.m, a = ctx.params.alpha, t = s.t;
    if (ex.length !== m * m) ex = new Float64Array(m * m);
    if (ctx.choices.ic === 'mode') {
      const d = Math.exp(-a * 5 * Math.PI * Math.PI * t);
      for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) ex[j * m + i] = 0.8 * d * Math.sin(2 * Math.PI * i * s.h) * Math.sin(Math.PI * j * s.h);
      return;
    }
    ex.fill(0);
    exact!.amp.forEach((A, sIdx) => {
      for (let i = 0; i < m; i++) { X[i] = heatSineSeries(exact!.bx[sIdx], a, 1, i * s.h, t); Y[i] = heatSineSeries(exact!.by[sIdx], a, 1, i * s.h, t); }
      for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) ex[j * m + i] += A * X[i] * Y[j];
    });
  };

  const rebuild = () => {
    n = Math.round(ctx.params.n);
    fit();
    solver = new Heat2D({ L: 1, n, alpha: ctx.params.alpha, ...bcOf() });
    solver.setInitial(icFn());
    setSources();
    buildExact();
    blown = false; behind = false; clock.lag = 0;
    if (surf) { surf.dispose(); surf = null; }
    if (wire) { wire.dispose(); wire = null; }
  };

  const zAt = (arr: Float64Array, x: number, y: number) => arr[Math.round(y * n) * (n + 1) + Math.round(x * n)];
  const fnNum = (x: number, y: number): V3 => [x, y, clamp(zAt(solver!.u, x, y), -2, 3)];
  const exactAt = (x: number, y: number) => {
    const a = ctx.params.alpha, t = solver!.t;
    if (ctx.choices.ic === 'mode') return 0.8 * Math.exp(-a * 5 * Math.PI * Math.PI * t) * Math.sin(2 * Math.PI * x) * Math.sin(Math.PI * y);
    let s = 0;
    exact!.amp.forEach((A, k) => { s += A * heatSineSeries(exact!.bx[k], a, 1, x, t) * heatSineSeries(exact!.by[k], a, 1, y, t); });
    return s;
  };
  const fnEx = (x: number, y: number): V3 => [x, y, exactAt(x, y) + 0.002];

  const draw = () => {
    const s = solver!;
    const opts = { uRange: [0, 1] as [number, number], vRange: [0, 1] as [number, number], res: n, colormap: 'turbo' as const, colorRange: [ctx.choices.ic === 'mode' ? -0.8 : 0, 1] as [number, number] };
    if (!surf) surf = v.addSurface(fnNum, opts); else surf.update(fnNum);
    exErr = NaN;
    if (exactAvailable() && ctx.toggles.exact) {
      exactGrid();
      if (!wire) wire = v.addSurface(fnEx, { ...opts, res: Math.min(n, 20), wireframe: true, colorBy: 'uniform', color: ctx.dark ? '#ffffff' : '#1b1f2a', opacity: 0.35 }); else wire.update(fnEx);
      wire.visible(true);
      exErr = 0;
      for (let k = 0; k < ex.length; k++) exErr = Math.max(exErr, Math.abs(s.u[k] - ex[k]));
    } else wire?.visible(false);
    const showSpots = ctx.choices.ic === 'spots' || ctx.toggles.heaters;
    spots.forEach((p, k) => {
      const at: V3 = [p[0], p[1], clamp(zAt(s.u, p[0], p[1]), -2, 3) + 0.03];
      if (!spotH[k]) spotH[k] = v.addPoint(at, { color: '#ffffff', size: 0.025, drag: { constrain: (q) => { const x = clamp(q[0], 0.08, 0.92), y = clamp(q[1], 0.08, 0.92); return [x, y, zAt(solver!.u, x, y) + 0.03]; }, onDrag: (q) => { spots[k] = [q[0], q[1]]; if (ctx.toggles.heaters && ctx.choices.ic !== 'spots') setSources(); else { rebuild(); } draw(); } } });
      else spotH[k].set(at);
      spotH[k].visible(showSpots);
    });
    const r = ctx.params.r;
    const rows: Readout[] = [
      { label: 't (simulated)', value: fmt(s.t, 4) },
      { label: 'r = αΔt/Δx²', value: fmt(r, 3) + (ctx.choices.scheme === 'ftcs' ? '  (FTCS needs ≤ ¼)' : '  (ADI: any r)'), tone: ctx.choices.scheme === 'ftcs' && r > 0.25 ? 'bad' : 'good' },
      { label: 'max temperature', value: blown ? 'blown up' : fmt(Math.max(...s.u), 4) },
      { label: 'total heat ∬u dA', value: fmt(s.heat(), 6) },
      { label: 'max |numerical − exact|', value: Number.isFinite(exErr) ? fmt(exErr, 3) : exactAvailable() ? '(wireframe off)' : 'no closed form here' },
    ];
    ctx.setReadouts(rows);
    const ftcsBad = ctx.choices.scheme === 'ftcs' && r > 0.25;
    ctx.warn(blown ? `FTCS blew up: in 2D it needs r ≤ ¼ (the checkerboard mode has G = 1 − 8r = ${fmt(1 - 8 * r, 3)}). Lower r or use ADI, then reset.` : ftcsBad ? `Unstable: 2D FTCS needs r ≤ ¼, and r = ${fmt(r, 3)}. A checkerboard will grow by |1 − 8r| per step.` : behind ? 'The solver cannot keep up at this resolution; the clock is slowed to match.' : '');
    const bcText: Record<string, string> = { cold: 'all edges held at $u = 0$ (Dirichlet)', insulated: 'all edges insulated, $\\partial u/\\partial n = 0$ (Neumann): no heat leaves', mixed: 'left and right edges held at 0, top and bottom insulated', hotedge: 'the left edge held at $u = 1$, the others at 0: a steady state is approached' };
    ctx.setNote(`Height and colour are temperature. Edges: ${bcText[ctx.choices.bc]}.${ctx.toggles.heaters ? ` Heaters add $q = ${fmt(ctx.params.heat, 3)}$ × (two Gaussians) per unit time.` : ''}${exactAvailable() ? ' The white wireframe is the exact series.' : ''}`);
  };

  const update = () => {
    const k = [ctx.choices.ic, ctx.choices.bc, ctx.params.n, ctx.params.alpha].join('|');
    if (k !== key || !solver) { key = k; rebuild(); }
    else { setSources(); buildExact(); }
    draw();
  };
  return {
    update,
    tick(dtReal) {
      if (!solver || blown) return;
      const s = solver, dt = (ctx.params.r * s.h * s.h) / ctx.params.alpha;
      behind = advance(dtReal, 0.02, dt, 60, () => s.step(dt, ctx.choices.scheme as 'adi' | 'ftcs'), clock).behind;
      for (let k = 0; k < s.u.length; k += 7) if (!(Math.abs(s.u[k]) < 1e6)) { blown = true; break; }
      draw();
    },
    reset() { rebuild(); draw(); },
    csv() { const s = solver!, m = s.m, xs: number[] = [], ys: number[] = [], us: number[] = []; for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) { xs.push(i * s.h); ys.push(j * s.h); us.push(s.u[j * m + i]); } return csv(['x', 'y', 'u'], [xs, ys, us]); },
    dispose() { v.clear(); },
  };
}
