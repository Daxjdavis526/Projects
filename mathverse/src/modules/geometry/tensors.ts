// The Riemann curvature tensor, Ricci curvature and scalar curvature —
// computed from a metric alone, for surfaces (verifying R₁₂₁₂ = K det g,
// Ricci = K g, R = 2K against the extrinsic K) and for 3- and 4-dimensional
// examples (the 3-sphere, the Schwarzschild spatial slice and spacetime).

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import { parse } from '../../core/expr';
import { metricFromExprs, metricOfSurface, curvatureTensors, localGeometry, Metric, CurvatureTensors, flammZ, V3 } from '../../core/numeric/geometry';
import { SERIES } from '../../engine/colors';
import {
  surfaceChoice, SHAPE_PARAMS, POINT_PARAMS, CUSTOM_INPUT, surfaceFromCtx, SurfaceMesh, ColorBar, Built, surfaceDragPoint, followSurfaceChange,
  fmt, tx, matTeX, COLORS, adhocSurface,
} from './lib';

type View = NonNullable<DemoCtx['view3d']>;
type Pt = ReturnType<View['addPoint']>;
type Curve = ReturnType<View['addCurve']>;

interface Space { id: string; label: string; coords: string[]; tex: string; metric?: (a: number, b: number) => Metric; point: (ctx: DemoCtx) => number[]; describe: string }

const GREEKTEX: Record<string, string> = { theta: '\\theta', phi: '\\phi', chi: '\\chi', t: 't', r: 'r', u: 'u', v: 'v', x: 'x', y: 'y' };
const mcache = new Map<string, Metric>();
const met = (key: string, rows: string[][], coords: string[], params: Record<string, number>) => {
  const k = `${key}|${JSON.stringify(params)}`;
  let m = mcache.get(k);
  if (!m) { m = metricFromExprs(rows.map((r) => r.map((e) => parse(e, { names: coords }))), coords, params); if (mcache.size > 40) mcache.clear(); mcache.set(k, m); }
  return m;
};
const clampR = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

const SPACES: Space[] = [
  { id: 'surface', label: '2D: a surface in space (choose below)', coords: ['u', 'v'], tex: 'g = \\mathbf r_i\\cdot\\mathbf r_j', point: (c) => [c.params.pu, c.params.pv], describe: 'the induced metric of the surface' },
  { id: 'polar', label: '2D: flat plane, polar coordinates', coords: ['r', 'theta'], tex: 'ds^2 = dr^2 + r^2 d\\theta^2', metric: () => met('polar', [['1', '0'], ['0', 'r^2']], ['r', 'theta'], {}), point: (c) => [clampR(c.params.r, 0.05, 50), c.params.pv], describe: 'the flat plane in curvilinear coordinates' },
  { id: 'hyper', label: '2D: hyperbolic plane (upper half-plane)', coords: ['x', 'y'], tex: 'ds^2 = a^2\\,\\frac{dx^2 + dy^2}{y^2}', metric: (a) => met('hyper', [['a^2/y^2', '0'], ['0', 'a^2/y^2']], ['x', 'y'], { a }), point: (c) => [c.params.pu, clampR(c.params.r / 5, 0.02, 20)], describe: 'the hyperbolic plane of radius a (K = −1/a²); no complete surface in ℝ³ has this metric (Hilbert)' },
  { id: 's3', label: '3D: the 3-sphere of radius a', coords: ['chi', 'theta', 'phi'], tex: 'ds^2 = a^2\\left[d\\chi^2 + \\sin^2\\chi\\,(d\\theta^2 + \\sin^2\\theta\\,d\\phi^2)\\right]', metric: (a) => met('s3', [['a^2', '0', '0'], ['0', 'a^2 sin(chi)^2', '0'], ['0', '0', 'a^2 sin(chi)^2 sin(theta)^2']], ['chi', 'theta', 'phi'], { a }), point: (c) => [clampR(c.params.r / 5, 0.03, Math.PI - 0.03), 1.1, 0.3], describe: 'the 3-sphere S³ (the space of a closed Friedmann universe at one instant)' },
  { id: 'schw3', label: '3D: Schwarzschild spatial slice (t = const)', coords: ['r', 'theta', 'phi'], tex: 'dl^2 = \\frac{dr^2}{1 - 2M/r} + r^2(d\\theta^2 + \\sin^2\\theta\\,d\\phi^2)', metric: (_a, b) => met('schw3', [['1/(1 - 2 m/r)', '0', '0'], ['0', 'r^2', '0'], ['0', '0', 'r^2 sin(theta)^2']], ['r', 'theta', 'phi'], { m: b }), point: (c) => [Math.max(c.params.r, 2 * c.params.b * 1.0005), 1.2, 0.3], describe: 'space around a black hole at one instant — Flamm’s paraboloid is its equatorial slice' },
  { id: 'schw4', label: '4D: Schwarzschild spacetime', coords: ['t', 'r', 'theta', 'phi'], tex: 'ds^2 = -\\Big(1 - \\frac{2M}{r}\\Big)dt^2 + \\frac{dr^2}{1 - 2M/r} + r^2 d\\Omega^2', metric: (_a, b) => met('schw4', [['-(1 - 2 m/r)', '0', '0', '0'], ['0', '1/(1 - 2 m/r)', '0', '0'], ['0', '0', 'r^2', '0'], ['0', '0', '0', 'r^2 sin(theta)^2']], ['t', 'r', 'theta', 'phi'], { m: b }), point: (c) => [0, Math.max(c.params.r, 2 * c.params.b * 1.0005), 1.2, 0.3], describe: 'the spacetime outside a spherical mass M (G = c = 1)' },
];
const spaceBy = new Map(SPACES.map((s) => [s.id, s]));

const riemannDemo: DemoDef = {
  id: 'geometry.riemann', module: 'geometry', title: 'Riemann, Ricci and scalar curvature',
  topic: 'The Riemann curvature tensor · Ricci curvature · scalar curvature · curvature in 2, 3 and 4 dimensions',
  summary: 'All the curvature of a space is in the Riemann tensor, computed here from the metric alone (no embedding). For a surface it collapses to one number: R₁₂₁₂ = K det g, Ricci = K g, R = 2K — checked against the extrinsic K. In 3 and 4 dimensions it has genuinely more to say: Schwarzschild spacetime is Ricci-flat yet curved.',
  tex: 'R^a{}_{bcd} = \\partial_c\\Gamma^a_{db} - \\partial_d\\Gamma^a_{cb} + \\Gamma^a_{ce}\\Gamma^e_{db} - \\Gamma^a_{de}\\Gamma^e_{cb},\\quad R_{bd} = R^a{}_{bad},\\quad R = g^{bd}R_{bd}',
  view: 'split3d',
  params: [...SHAPE_PARAMS.map((p) => (p.key === 'b' ? { ...p, label: 'shape b · mass M (Schwarzschild)', value: 1, min: 0.05, max: 2 } : p)), ...POINT_PARAMS,
    { key: 'r', label: 'radial coordinate (r; χ = r/5; y = r/5)', value: 6, min: 0.1, max: 20, step: 0.005 }],
  choices: [{ key: 'space', label: 'Space', value: 'surface', options: SPACES.map((s) => [s.id, s.label] as [string, string]) }, surfaceChoice('torus', ['sphere', 'torus', 'saddle', 'pseudosphere', 'catenoid', 'bump', 'custom'])],
  input: CUSTOM_INPUT,
  experiments: [
    'Surface: drag the point around the torus. R₁₂₁₂/det g (from the metric, intrinsic) and K from the second fundamental form (extrinsic) agree to rounding — Gauss’s Theorema Egregium, numerically.',
    'Flat plane in polar coordinates: Christoffel symbols are nonzero, but every component of the Riemann tensor vanishes. Curvature is a tensor; Γ is not.',
    '3-sphere: Ricci = (2/a²) g and R = 6/a² at every point — a space of constant curvature. Shrink a: the curvature grows as 1/a².',
    'Schwarzschild spacetime: every Ricci component is zero (vacuum Einstein equations R_ab = 0), yet R^t_rtr ≠ 0 and the Kretschmann invariant R_abcd R^abcd = 48M²/r⁶ blows up only at r = 0. The horizon r = 2M is not a curvature singularity.',
    'Schwarzschild spatial slice: scalar curvature R = 0 (a time-symmetric vacuum slice), but Ricci ≠ 0. In 3D, Ricci carries all of Riemann; in 2D, K alone does.',
  ],
  connections: ['geometry.curvature', 'geometry.transport', 'geometry.deviation', 'geometry.flamm', 'geometry.lightcones'],
  accuracy: 'Exact symbolic derivatives of the metric (for a surface: of r up to third order), then Christoffel symbols, their exact derivatives, Riemann, Ricci, scalar and Kretschmann in floating point. Differences shown are rounding (~1e−13). The plot samples the same computation.',
  create: (ctx) => createRiemann(ctx),
};

function nonzero(T: CurvatureTensors, names: string[]): { rows: StepRow[]; list: string[] } {
  const n = names.length, R = T.Rdown;
  const big = Math.max(1e-300, ...R.flat(3).map(Math.abs));
  const rows: StepRow[] = [], list: string[] = [];
  const nm = (i: number) => GREEKTEX[names[i]] ?? names[i];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = 0; c < n; c++) for (let d = c + 1; d < n; d++) {
    if (a * n + b > c * n + d) continue;
    const x = R[a][b][c][d];
    if (Math.abs(x) <= 1e-11 * big) continue;
    const t = `R_{${nm(a)}${nm(b)}${nm(c)}${nm(d)}} = ${tx(x, 8)}`;
    const U: Record<string, string> = { chi: 'χ', theta: 'θ', phi: 'φ' };
    const un = (i: number) => U[names[i]] ?? names[i];
    list.push(t); rows.push({ title: `R_${un(a)}${un(b)}${un(c)}${un(d)}`, tex: t });
  }
  return { rows, list };
}

function createRiemann(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!, plot = ctx.plot!;
  const mesh = new SurfaceMesh(v);
  const bar = new ColorBar(v);
  let b: Built = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, ring: Curve | null = null, lastSpace = '';
  const plotCache: { key: string; samples: [number, number][]; exact: [number, number][]; xl: string; yl: string } = { key: '', samples: [], exact: [], xl: '', yl: '' };
  const update = () => {
    const sp = spaceBy.get(ctx.choices.space) ?? SPACES[0];
    if (sp.id !== lastSpace) { lastSpace = sp.id; mesh.reset(); pt?.dispose(); pt = null; }
    const a = ctx.params.a, M = ctx.params.b;
    let metric: Metric, x: number[];
    let K2 = NaN, detg = NaN;
    // the 3D picture: the surface itself, or an embedded 2D slice, honestly labelled
    if (sp.id === 'surface') {
      b = surfaceFromCtx(ctx);
      const range = mesh.set(b, 'K', { res: 90, clipK: 4 });
      bar.set('Gaussian curvature K', range[0], range[1]);
      const [u, w] = followSurfaceChange(ctx, st, b);
      metric = metricOfSurface(b.S); x = [u, w];
      const lg = localGeometry(b.S, u, w); K2 = lg.K; detg = lg.detg;
      if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(lg.r);
      pt.visible(true); ring?.visible(false);
    } else {
      metric = sp.metric!(a, M); x = sp.point(ctx);
      bar.hide();
      let slice: Built, P: V3;
      if (sp.id === 'schw3' || sp.id === 'schw4') {
        const rs = 2 * M;
        slice = adhocSurface('flamm', 'Flamm', '(u cos(v), u sin(v), 2 sqrt(b (u - b)))', { b: rs }, [rs * 1.0005, Math.max(rs * 6, 12)], [-Math.PI, Math.PI], { periodicV: true });
        const r = sp.id === 'schw3' ? x[0] : x[1];
        P = [r, 0, flammZ(rs, r)];
        const pts: V3[] = Array.from({ length: 121 }, (_, i) => [r * Math.cos((2 * Math.PI * i) / 120), r * Math.sin((2 * Math.PI * i) / 120), flammZ(rs, r) + 0.02] as V3);
        if (!ring) ring = v.addCurve(pts, { color: COLORS.geo, radius: 0.05 }); else ring.set(pts);
        ring.visible(true);
      } else if (sp.id === 's3') {
        slice = adhocSurface('s3slice', 'S2', '(a sin(u) cos(v), a sin(u) sin(v), a cos(u))', { a }, [0, Math.PI], [-Math.PI, Math.PI], { periodicV: true });
        P = slice.S.r(x[0], 0.3); ring?.visible(false);
      } else if (sp.id === 'hyper') {
        slice = adhocSurface('pseudo', 'pseudosphere', '(a cos(v) / cosh(u), a sin(v) / cosh(u), a (u - tanh(u)))', { a }, [0.06, 3.2], [-Math.PI, Math.PI], { periodicV: true });
        P = slice.S.r(Math.max(0.06, Math.log(Math.max(1.0001, x[1] / 1))), x[0]); ring?.visible(false);
      } else {
        slice = adhocSurface('polarp', 'plane', '(u cos(v), u sin(v), 0)', {}, [0, 6], [-Math.PI, Math.PI], { periodicV: true });
        P = slice.S.r(Math.min(6, x[0]), x[1]); ring?.visible(false);
      }
      mesh.set(slice, sp.id === 'polar' ? 'uniform' : 'checker', { res: 70, color: '#5f86c9' });
      if (!pt) pt = v.addPoint(P, { color: COLORS.point, size: slice.scale * 0.04 }); else pt.set(P);
      pt.visible(true);
    }
    const T = curvatureTensors(metric, x);
    const n = metric.dim, names = metric.coords;
    const { rows: steps, list } = nonzero(T, names);
    const rows: Readout[] = [
      { label: 'metric', value: sp.id === 'surface' ? b.tex : sp.tex, tex: true },
      { label: 'at the point', value: `(${names.map((c, i) => `${c} = ${fmt(x[i], 5)}`).join(', ')})` },
      { label: 'g_ab', value: matTeX(T.g, 4), tex: true },
      { label: `independent components (${n === 2 ? 1 : n === 3 ? 6 : 20} in ${n}D); nonzero:`, value: list.length ? list.slice(0, 6).join(',\\ ') + (list.length > 6 ? ',\\ \\dots' : '') : '\\text{all zero: flat}', tex: true },
      { label: 'Ricci R_ab', value: matTeX(T.ricci, 5), tex: true },
      { label: 'scalar curvature R', value: fmt(Math.abs(T.scalar) < 1e-12 ? 0 : T.scalar, 10) },
    ];
    const big = Math.max(1e-300, ...T.Rdown.flat(3).map(Math.abs));
    if (n === 2) {
      const Kint = T.Rdown[0][1][0][1] / (T.g[0][0] * T.g[1][1] - T.g[0][1] ** 2);
      rows.push({ label: 'K = R₁₂₁₂ / det g (intrinsic, from the metric)', value: fmt(Kint, 12), tone: 'good' });
      if (sp.id === 'surface') {
        rows.push({ label: 'K = det II / det I (extrinsic)', value: fmt(K2, 12), tone: 'good' });
        rows.push({ label: 'checks: R₁₂₁₂ − K det g,  R − 2K', value: `${(T.Rdown[0][1][0][1] - K2 * detg).toExponential(1)},  ${(T.scalar - 2 * K2).toExponential(1)}` });
      } else rows.push({ label: 'exact', value: sp.id === 'hyper' ? `K = −1/a² = ${fmt(-1 / (a * a), 8)}` : 'K = 0' , tone: 'muted' });
      const ricErr = Math.max(...T.ricci.flat().map((r, i) => Math.abs(r - Kint * T.g[Math.floor(i / 2)][i % 2])));
      rows.push({ label: 'Ricci − K g (max entry)', value: ricErr.toExponential(1), tone: 'muted' });
    } else if (sp.id === 's3') {
      rows.push({ label: 'exact: Ricci = (2/a²) g, R = 6/a²', value: `6/a² = ${fmt(6 / (a * a), 10)};  max|Ricci − (2/a²)g| = ${Math.max(...T.ricci.flat().map((r, i) => Math.abs(r - (2 / (a * a)) * T.g[Math.floor(i / 3)][i % 3]))).toExponential(1)}`, tone: 'good' });
    } else if (sp.id === 'schw4') {
      const r = x[1];
      rows.push({ label: 'max |R_ab| (vacuum: Ricci-flat)', value: Math.max(...T.ricci.flat().map(Math.abs)).toExponential(1), tone: 'good' });
      rows.push({ label: 'Kretschmann R_abcd R^abcd', value: `${fmt(T.kretschmann, 10)}  vs 48M²/r⁶ = ${fmt((48 * M * M) / r ** 6, 10)}`, tone: 'good' });
      rows.push({ label: 'R^t_rtr (tidal, radial)', value: `${fmt(T.Rup[0][1][0][1], 8)}  vs 2M/(r²(r − 2M)) = ${fmt((2 * M) / (r * r * (r - 2 * M)), 8)}`, tone: 'muted' });
    } else if (sp.id === 'schw3') {
      const r = x[0];
      rows.push({ label: 'R_rr', value: `${fmt(T.ricci[0][0], 8)}  vs −2M/(r²(r − 2M)) = ${fmt((-2 * M) / (r * r * (r - 2 * M)), 8)}`, tone: 'muted' });
    }
    ctx.setReadouts(rows);
    ctx.setSteps(steps.length ? steps : [{ title: 'Riemann tensor', tex: 'R_{abcd} = 0', detail: 'Every component vanishes: the space is flat here.' }]);
    // the plot: a curvature invariant along a line through the point, computed two ways where possible
    const samples: [number, number][] = [], exact: [number, number][] = [];
    let plotX = NaN;
    let xl = 'u', yl = 'K';
    if (sp.id === 'surface') {
      // sample along whichever coordinate line K varies more on
      const spread = (which: 0 | 1) => { let lo = Infinity, hi = -Infinity; for (let i = 0; i <= 20; i++) { const c = which === 0 ? b.u[0] + ((b.u[1] - b.u[0]) * i) / 20 : b.v[0] + ((b.v[1] - b.v[0]) * i) / 20; const K = which === 0 ? localGeometry(b.S, c, x[1]).K : localGeometry(b.S, x[0], c).K; if (Number.isFinite(K)) { lo = Math.min(lo, K); hi = Math.max(hi, K); } } return hi - lo; };
      const along: 0 | 1 = spread(1) > spread(0) * 1.01 ? 1 : 0;
      const rng = along === 0 ? b.u : b.v;
      const pnt = (c: number) => (along === 0 ? [c, x[1]] : [x[0], c]);
      xl = along === 0 ? 'u (v fixed)' : 'v (u fixed)'; yl = 'K';
      for (let i = 0; i <= 60; i++) {
        const c = rng[0] + ((rng[1] - rng[0]) * (i + 0.5)) / 61;
        const Tm = curvatureTensors(metric, pnt(c));
        const g = Tm.g; samples.push([c, Tm.Rdown[0][1][0][1] / (g[0][0] * g[1][1] - g[0][1] ** 2)]);
      }
      for (let i = 0; i <= 300; i++) { const c = rng[0] + ((rng[1] - rng[0]) * i) / 300; const q = pnt(c); exact.push([c, localGeometry(b.S, q[0], q[1]).K]); }
      plotX = along === 0 ? x[0] : x[1];
    } else if (plotCache.key === `${sp.id}|${a}|${M}`) {
      samples.push(...plotCache.samples); exact.push(...plotCache.exact); xl = plotCache.xl; yl = plotCache.yl;
    } else if (sp.id === 'schw4' || sp.id === 'schw3') {
      xl = 'r'; yl = sp.id === 'schw4' ? 'log₁₀ Kretschmann' : 'R_rr';
      const r0 = 2 * M * 1.02, r1 = Math.max(12, 8 * M);
      for (let i = 0; i <= 40; i++) {
        const r = r0 + ((r1 - r0) * i) / 40;
        const Tm = curvatureTensors(metric, sp.id === 'schw4' ? [0, r, 1.2, 0.3] : [r, 1.2, 0.3]);
        samples.push([r, sp.id === 'schw4' ? Math.log10(Tm.kretschmann) : Tm.ricci[0][0]]);
      }
      for (let i = 0; i <= 300; i++) { const r = r0 + ((r1 - r0) * i) / 300; exact.push([r, sp.id === 'schw4' ? Math.log10((48 * M * M) / r ** 6) : (-2 * M) / (r * r * (r - 2 * M))]); }
    } else {
      xl = sp.id === 's3' ? 'χ' : sp.id === 'hyper' ? 'y' : 'r'; yl = 'scalar curvature R';
      const [lo, hi] = sp.id === 's3' ? [0.05, Math.PI - 0.05] : sp.id === 'hyper' ? [0.05, 4] : [0.1, 8];
      for (let i = 0; i <= 40; i++) {
        const c = lo + ((hi - lo) * i) / 40;
        const pnt = sp.id === 's3' ? [c, 1.1, 0.3] : sp.id === 'hyper' ? [x[0], c] : [c, 0.3];
        samples.push([c, curvatureTensors(metric, pnt).scalar]);
      }
      const ex = sp.id === 's3' ? 6 / (a * a) : sp.id === 'hyper' ? -2 / (a * a) : 0;
      exact.push([lo, ex], [hi, ex]);
    }
    if (sp.id !== 'surface') Object.assign(plotCache, { key: `${sp.id}|${a}|${M}`, samples: samples.slice(), exact: exact.slice(), xl, yl });
    const ys = [...samples, ...exact].map((p) => p[1]).filter(Number.isFinite);
    let y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
    if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
    const pad = (y1 - y0) * 0.18;
    const xs = exact.map((p) => p[0]);
    plot.opts.xLabel = xl; plot.opts.yLabel = yl;
    plot.setView({ x0: Math.min(...xs), x1: Math.max(...xs), y0: y0 - pad, y1: y1 + pad });
    plot.setDraw((G) => {
      G.path(exact, { color: SERIES[0], width: 2.4 });
      for (const p of samples) if (Number.isFinite(p[1])) G.point(p, 3.2, { color: SERIES[1] });
      const cx = sp.id === 'surface' ? plotX : sp.id === 'schw4' ? x[1] : sp.id === 'schw3' ? x[0] : sp.id === 's3' ? x[0] : sp.id === 'hyper' ? x[1] : x[0];
      G.line([cx, y0 - pad], [cx, y1 + pad], { color: COLORS.vec, width: 1.4, dash: [5, 4] });
      G.text([Math.min(...xs), y0 - pad], sp.id === 'surface' ? ' line: K from II (extrinsic) · dots: R₁₂₁₂/det g from the metric (intrinsic)' : ' line: exact formula · dots: computed from the metric', { color: ctx.dark ? '#c9cfdb' : '#2a3040', baseline: 'bottom' }, 4, -6);
    });
    ctx.warn(b.error && sp.id === 'surface' ? b.error : big > 1e12 ? 'The curvature is enormous here — close to a singularity.' : '');
    ctx.setNote(`${sp.id === 'surface' ? 'For a surface' : `For ${sp.describe}`}: the Riemann tensor is built from the metric and its first two derivatives only — a creature inside the space could measure it (parallel transport around small loops, geodesic deviation). ${n === 2 ? 'In 2D it has one independent component: $R_{1212} = K\\det g$, hence $R_{ab} = K g_{ab}$ and $R = 2K$.' : n === 3 ? 'In 3D it has 6 independent components — exactly as many as Ricci, which therefore determines it.' : 'In 4D it has 20 independent components; Ricci holds 10 of them. Einstein’s vacuum equations $R_{ab} = 0$ fix Ricci but leave the other 10 (the Weyl tensor: tides and gravitational waves) free — which is why empty space around a star can still be curved.'} The Steps tab lists every nonzero independent component.`);
  };
  return { update, dispose() { bar.dispose(); v.clear(); } };
}

export const tensorDemos: DemoDef[] = [riemannDemo];
