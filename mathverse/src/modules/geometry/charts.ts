// Manifolds and charts (overlapping charts of the sphere, transition maps),
// the metric tensor drawn as Tissot ellipses in many charts (flat, spherical,
// hyperbolic — the same geometry in different coordinates), and the covariant
// derivative with its Christoffel symbols.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { parse } from '../../core/expr';
import { metricFromExprs, Metric, curvatureTensors, christoffel, geodesicRhs, localGeometry, metricOfSurface, V3 } from '../../core/numeric/geometry';
import { rk4Step } from '../../core/numeric/ode';
import { eigSymmetric } from '../../core/numeric/linalg';
import { SERIES } from '../../engine/colors';
import {
  fmt, tx, matTeX, vecTeX, COLORS, paintedSurface, rgb, surfaceChoice, SHAPE_PARAMS, POINT_PARAMS, CUSTOM_INPUT, surfaceFromCtx, SurfaceMesh,
  surfaceDragPoint, followSurfaceChange, shapeNote, Built,
} from './lib';

type View = NonNullable<DemoCtx['view3d']>;
type Arrow = ReturnType<View['addArrow']>;
type Curve = ReturnType<View['addCurve']>;
type Pt = ReturnType<View['addPoint']>;
type P2 = [number, number];

// ═══ Charts of the unit sphere ═══════════════════════════════════════════════
interface SphereChart {
  id: string; label: string; xName: string; yName: string;
  /** chart coordinates of a point of the unit sphere, or null outside the chart's domain */
  fwd(p: V3): P2 | null;
  inv(x: P2): V3 | null;
  view: { x0: number; x1: number; y0: number; y1: number };
  /** metric components in this chart, as text (for Tissot ellipses and K) */
  g: [string, string, string];
  domain: string;
}
const EPS = 1e-9;
const latlon = (p: V3) => [Math.asin(Math.max(-1, Math.min(1, p[2]))), Math.atan2(p[1], p[0])];
const CHARTS: SphereChart[] = [
  { id: 'll', label: 'Longitude–latitude (φ, λ)', xName: 'φ', yName: 'λ', fwd: (p) => { const [la, lo] = latlon(p); return Math.abs(p[2]) > 1 - 1e-12 || (p[1] === 0 && p[0] < 0) ? null : [lo, la]; }, inv: ([x, y]) => (Math.abs(x) < Math.PI && Math.abs(y) < Math.PI / 2 ? [Math.cos(y) * Math.cos(x), Math.cos(y) * Math.sin(x), Math.sin(y)] : null),
    view: { x0: -3.4, x1: 3.4, y0: -1.8, y1: 1.8 }, g: ['cos(y)^2', '0', '1'], domain: '−π < φ < π, −π/2 < λ < π/2: misses both poles and the date line φ = ±π' },
  { id: 'sn', label: 'Stereographic from the north pole', xName: 'X', yName: 'Y', fwd: (p) => (p[2] > 1 - EPS ? null : [p[0] / (1 - p[2]), p[1] / (1 - p[2])]), inv: ([x, y]) => { const d = 1 + x * x + y * y; return [(2 * x) / d, (2 * y) / d, (x * x + y * y - 1) / d]; },
    view: { x0: -3.2, x1: 3.2, y0: -3.2, y1: 3.2 }, g: ['4/(1 + x^2 + y^2)^2', '0', '4/(1 + x^2 + y^2)^2'], domain: 'the whole plane = the sphere minus the north pole' },
  { id: 'ss', label: 'Stereographic from the south pole', xName: 'X′', yName: 'Y′', fwd: (p) => (p[2] < -1 + EPS ? null : [p[0] / (1 + p[2]), p[1] / (1 + p[2])]), inv: ([x, y]) => { const d = 1 + x * x + y * y; return [(2 * x) / d, (2 * y) / d, (1 - x * x - y * y) / d]; },
    view: { x0: -3.2, x1: 3.2, y0: -3.2, y1: 3.2 }, g: ['4/(1 + x^2 + y^2)^2', '0', '4/(1 + x^2 + y^2)^2'], domain: 'the whole plane = the sphere minus the south pole' },
  { id: 'gr', label: 'Graph over the equator plane (upper hemisphere)', xName: 'x', yName: 'y', fwd: (p) => (p[2] > EPS ? [p[0], p[1]] : null), inv: ([x, y]) => { const r = x * x + y * y; return r < 1 ? [x, y, Math.sqrt(1 - r)] : null; },
    view: { x0: -1.3, x1: 1.3, y0: -1.3, y1: 1.3 }, g: ['1 + x^2/(1 - x^2 - y^2)', 'x y/(1 - x^2 - y^2)', '1 + y^2/(1 - x^2 - y^2)'], domain: 'the open unit disc = the open northern hemisphere z > 0' },
  { id: 'me', label: 'Mercator (φ, ln tan(π/4 + λ/2))', xName: 'φ', yName: 'm', fwd: (p) => { const [la, lo] = latlon(p); return Math.abs(p[2]) > 1 - 1e-12 || (p[1] === 0 && p[0] < 0) ? null : [lo, Math.log(Math.tan(Math.PI / 4 + la / 2))]; }, inv: ([x, y]) => { if (Math.abs(x) >= Math.PI) return null; const la = 2 * Math.atan(Math.exp(y)) - Math.PI / 2; return [Math.cos(la) * Math.cos(x), Math.cos(la) * Math.sin(x), Math.sin(la)]; },
    view: { x0: -3.4, x1: 3.4, y0: -3.2, y1: 3.2 }, g: ['1/cosh(y)^2', '0', '1/cosh(y)^2'], domain: '−π < φ < π, all m: the sphere minus the poles and the date line' },
];
const chartBy = new Map(CHARTS.map((c) => [c.id, c]));
const sph = (la: number, lo: number): V3 => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];

/** metric of a chart compiled once */
const chartMetrics = new Map<string, Metric>();
function chartMetric(c: { id: string; g: [string, string, string] }): Metric {
  let m = chartMetrics.get(c.id);
  if (!m) { const [a, b, d] = c.g.map((s) => parse(s)); m = metricFromExprs([[a, b], [b, d]], ['x', 'y']); chartMetrics.set(c.id, m); }
  return m;
}

/** the ellipse {x + δ : g(δ, δ) = ε²} (the image of a small metric circle — Tissot's indicatrix) */
function tissot(g: number[][], at: P2, eps: number, n = 40): P2[] {
  const { values, vectors } = eigSymmetric(g);
  const out: P2[] = [];
  const a = eps / Math.sqrt(values[0]), b = eps / Math.sqrt(values[1]);
  const e1 = [vectors[0][0], vectors[1][0]], e2 = [vectors[0][1], vectors[1][1]];
  for (let i = 0; i <= n; i++) { const t = (2 * Math.PI * i) / n; out.push([at[0] + a * Math.cos(t) * e1[0] + b * Math.sin(t) * e2[0], at[1] + a * Math.cos(t) * e1[1] + b * Math.sin(t) * e2[1]]); }
  return out;
}

const chartsDemo: DemoDef = {
  id: 'geometry.charts', module: 'geometry', title: 'Manifolds and coordinate charts',
  topic: 'Manifolds · coordinate charts · atlases · transition maps · stereographic vs spherical coordinates',
  summary: 'A manifold is a space that looks like ℝⁿ near each point. A chart is one such local picture; no single chart covers the whole sphere, so an atlas uses several that overlap, glued by smooth transition maps. The same point, the same great circle — very different coordinates.',
  tex: '\\varphi_\\alpha: U_\\alpha \\to \\mathbb R^2,\\qquad \\varphi_\\beta\\circ\\varphi_\\alpha^{-1}: \\varphi_\\alpha(U_\\alpha\\cap U_\\beta) \\to \\varphi_\\beta(U_\\alpha \\cap U_\\beta)\\ \\text{smooth}',
  view: 'split3d',
  params: [
    { key: 'lat', label: 'latitude λ of the point', value: 0.5, min: -Math.PI / 2, max: Math.PI / 2, step: 0.001 },
    { key: 'lon', label: 'longitude φ of the point', value: 0.6, min: -Math.PI, max: Math.PI, step: 0.001 },
    { key: 'heading', label: 'heading of the great circle', value: 0.7, min: -Math.PI, max: Math.PI, step: 0.001 },
  ],
  choices: [
    { key: 'chart', label: 'Chart A (drawn on the left)', value: 'sn', options: CHARTS.map((c) => [c.id, c.label] as [string, string]) },
    { key: 'chart2', label: 'Chart B (overlap shown on the sphere)', value: 'gr', options: CHARTS.map((c) => [c.id, c.label] as [string, string]) },
  ],
  toggles: [{ key: 'grid', label: 'Latitude/longitude grid', value: true }, { key: 'great', label: 'A great circle through the point', value: true }, { key: 'tissot', label: 'Distortion ellipses', value: false }],
  experiments: [
    'Drag the point in the chart (left) or on the sphere (right): one point, two coordinate descriptions. The readouts give both and the transition map between them.',
    'Stereographic charts map every circle on the sphere to a circle or a line — the great circle (gold) becomes a circle. Latitude–longitude bends it into a sine-like wave.',
    'Chart A = stereographic from N, chart B = from S: they overlap everywhere except the two poles. The transition map is the inversion X′ = X/(X² + Y²) — and its Jacobian determinant is negative: the two charts have opposite orientations.',
    'Move the point toward the north pole in the stereographic-from-N chart: its coordinates run off to infinity. Every chart of a compact manifold misses something.',
    'Try the graph chart: it only sees the open northern hemisphere. The gray area on the sphere is outside both charts.',
  ],
  connections: ['geometry.metric', 'geometry.surfaces', 'geometry.geodesics', 'geometry.riemann'],
  accuracy: 'Charts and their inverses are exact formulas. The transition-map Jacobian is by central differences (numerical, ~1e−8).',
  create: (ctx) => createCharts(ctx),
};

function createCharts(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!, plot = ctx.plot!;
  plot.opts.equal = true;
  v.setBounds({ x: [-1.25, 1.25], y: [-1.25, 1.25], z: [-1.25, 1.25] });
  v.resetCamera();
  const paint = paintedSurface(v, 120);
  let coverKey = '';
  let pt: Pt | null = null, great: Curve | null = null;
  const grid: Curve[] = [];
  const A_ONLY = rgb('#3d6fb6'), B_ONLY = rgb('#c9822f'), BOTH = rgb('#3fa66b'), NONE = rgb('#3a3f4b');
  const greatCircle = (la: number, lo: number, hd: number): V3[] => {
    const P = sph(la, lo), east: V3 = [-Math.sin(lo), Math.cos(lo), 0], north: V3 = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];
    const d: V3 = [Math.cos(hd) * east[0] + Math.sin(hd) * north[0], Math.cos(hd) * east[1] + Math.sin(hd) * north[1], Math.cos(hd) * east[2] + Math.sin(hd) * north[2]];
    const out: V3[] = [];
    for (let i = 0; i <= 720; i++) { const t = (2 * Math.PI * i) / 720; out.push([P[0] * Math.cos(t) + d[0] * Math.sin(t), P[1] * Math.cos(t) + d[1] * Math.sin(t), P[2] * Math.cos(t) + d[2] * Math.sin(t)]); }
    return out;
  };
  /** map a 3D curve into a chart, broken where it leaves the chart or jumps */
  const toChart = (c: SphereChart, pts: V3[], span: number): P2[][] => {
    const runs: P2[][] = []; let run: P2[] = [];
    for (const p of pts) {
      const q = c.fwd(p);
      if (!q || !q.every(Number.isFinite) || Math.abs(q[0]) > 50 || Math.abs(q[1]) > 50) { if (run.length > 1) runs.push(run); run = []; continue; }
      if (run.length && Math.hypot(q[0] - run[run.length - 1][0], q[1] - run[run.length - 1][1]) > span * 0.3) { if (run.length > 1) runs.push(run); run = []; }
      run.push(q);
    }
    if (run.length > 1) runs.push(run);
    return runs;
  };
  const update = () => {
    const A = chartBy.get(ctx.choices.chart) ?? CHARTS[1], B = chartBy.get(ctx.choices.chart2) ?? CHARTS[0];
    const la = ctx.params.lat, lo = ctx.params.lon, P = sph(la, lo);
    // the sphere, painted by which chart covers each point
    const ck = A.id + B.id;
    if (ck !== coverKey) {
      coverKey = ck;
      // (the excluded pole points and the date line are widened a little so they can be seen)
      const covers = (c: SphereChart, u: number, w: number) => { const p = sph(w, u); if (!c.fwd(p)) return false; if ((c.id === 'll' || c.id === 'me') && (Math.abs(u) > Math.PI - 0.035 || Math.abs(w) > Math.PI / 2 - 0.03)) return false; if (c.id === 'sn' && w > Math.PI / 2 - 0.05) return false; if (c.id === 'ss' && w < -Math.PI / 2 + 0.05) return false; return true; };
      paint.update((u, w) => sph(w, u), (u, w) => { const a = covers(A, u, w), b = covers(B, u, w); return a && b ? BOTH : a ? A_ONLY : b ? B_ONLY : NONE; }, [-Math.PI, Math.PI], [-Math.PI / 2, Math.PI / 2]);
      plot.setView(A.view);
    }
    if (!pt) pt = v.addPoint(P, { color: COLORS.point, size: 0.05, drag: { constrain: (q) => { const l = Math.hypot(...q) || 1; return [q[0] / l, q[1] / l, q[2] / l]; }, onDrag: (q) => { const [a, b] = latlon(q); ctx.setParam('lat', a); ctx.setParam('lon', b); update(); } } });
    else pt.set(P);
    const gc = greatCircle(la, lo, ctx.params.heading).map((p) => p.map((x) => x * 1.006) as V3);
    if (!great) great = v.addCurve(gc, { color: COLORS.geo, radius: 0.012 }); else great.set(gc);
    great.visible(!!ctx.toggles.great);
    // lat/long grid on the sphere (built once)
    if (!grid.length) {
      for (let k = -2; k <= 2; k++) { const l = (k * Math.PI) / 6; const pts: V3[] = []; for (let i = 0; i <= 120; i++) pts.push(sph(l, -Math.PI + (2 * Math.PI * i) / 120).map((x) => x * 1.003) as V3); grid.push(v.addCurve(pts, { color: '#c9cfdb', radius: 0 })); }
      for (let k = -6; k < 6; k++) { const l = (k * Math.PI) / 6; const pts: V3[] = []; for (let i = 0; i <= 60; i++) pts.push(sph(-Math.PI / 2 + (Math.PI * i) / 60, l).map((x) => x * 1.003) as V3); grid.push(v.addCurve(pts, { color: '#c9cfdb', radius: 0 })); }
    }
    grid.forEach((h) => h.visible(!!ctx.toggles.grid));
    // the chart
    const xa = A.fwd(P), xb = B.fwd(P);
    const spanA = A.view.x1 - A.view.x0;
    const gridCol = ctx.dark ? 'rgba(201,207,219,0.35)' : 'rgba(60,70,90,0.35)';
    const MA = chartMetric(A);
    plot.opts.xLabel = A.xName; plot.opts.yLabel = A.yName;
    plot.setDraw((g) => {
      if (ctx.toggles.grid) {
        for (let k = -5; k <= 5; k++) { const l = (k * Math.PI) / 12; const pts: V3[] = []; for (let i = 0; i <= 400; i++) pts.push(sph(l, -Math.PI + (2 * Math.PI * i) / 400)); for (const r of toChart(A, pts, spanA)) g.path(r, { color: gridCol, width: k === 0 ? 1.6 : 1 }); }
        for (let k = -12; k < 12; k++) { const l = (k * Math.PI) / 12; const pts: V3[] = []; for (let i = 0; i <= 300; i++) pts.push(sph(-Math.PI / 2 + (Math.PI * i) / 300, l)); for (const r of toChart(A, pts, spanA)) g.path(r, { color: gridCol, width: 1 }); }
      }
      if (A.id === 'gr') g.path(Array.from({ length: 121 }, (_, i) => [Math.cos((2 * Math.PI * i) / 120), Math.sin((2 * Math.PI * i) / 120)] as P2), { color: SERIES[2], width: 1.5, dash: [6, 4] });
      if (A.id === 'll' || A.id === 'me') { g.line([-Math.PI, A.view.y0], [-Math.PI, A.view.y1], { color: SERIES[2], width: 1.5, dash: [6, 4] }); g.line([Math.PI, A.view.y0], [Math.PI, A.view.y1], { color: SERIES[2], width: 1.5, dash: [6, 4] }); }
      if (ctx.toggles.tissot) {
        const { x0, x1, y0, y1 } = g.view, n = 9, h = (x1 - x0) / n;
        for (let i = 0; i <= n; i++) for (let j = 0; j <= Math.round(((y1 - y0) / (x1 - x0)) * n); j++) {
          const at: P2 = [x0 + i * h, y0 + j * h];
          if (!A.inv(at)) continue;
          const gm = MA.g(at);
          if (!gm.flat().every(Number.isFinite)) continue;
          g.polygon(tissot(gm, at, 0.12), { fill: 'rgba(242,193,78,0.28)', color: 'rgba(242,193,78,0.8)', width: 1 });
        }
      }
      if (ctx.toggles.great) for (const r of toChart(A, greatCircle(la, lo, ctx.params.heading), spanA)) g.path(r, { color: COLORS.geo, width: 2.4 });
      if (xa) g.handle({ id: 'p', at: xa, color: '#ffffff', label: 'p', onDrag: (q) => { const s = A.inv(q); if (!s) return; const [a, b] = latlon(s); ctx.setParam('lat', a); ctx.setParam('lon', b); update(); } });
    });
    // transition map B ∘ A⁻¹ at the point: Jacobian by central differences
    let jac: number[][] | null = null;
    if (xa && xb) {
      const h = 1e-6, f = (q: P2) => { const s = A.inv(q); return s ? B.fwd(s) : null; };
      const px = f([xa[0] + h, xa[1]]), mx = f([xa[0] - h, xa[1]]), py = f([xa[0], xa[1] + h]), my = f([xa[0], xa[1] - h]);
      if (px && mx && py && my) jac = [[(px[0] - mx[0]) / (2 * h), (py[0] - my[0]) / (2 * h)], [(px[1] - mx[1]) / (2 * h), (py[1] - my[1]) / (2 * h)]];
    }
    const det = jac ? jac[0][0] * jac[1][1] - jac[0][1] * jac[1][0] : NaN;
    const gA = xa ? MA.g(xa) : null;
    const KA = xa ? curvatureTensors(MA, xa).scalar / 2 : NaN;
    const rows: Readout[] = [
      { label: 'the point on the sphere', value: vecTeX(P), tex: true },
      { label: `chart A: (${A.xName}, ${A.yName})`, value: xa ? `(${fmt(xa[0], 6)}, ${fmt(xa[1], 6)})` : 'not covered by chart A', tone: xa ? 'good' : 'warn' },
      { label: `chart B: (${B.xName}, ${B.yName})`, value: xb ? `(${fmt(xb[0], 6)}, ${fmt(xb[1], 6)})` : 'not covered by chart B', tone: xb ? 'good' : 'warn' },
      { label: 'transition B∘A⁻¹: Jacobian', value: jac ? matTeX(jac) : '\\text{— (the point is not in the overlap)}', tex: true },
      { label: 'det of the Jacobian', value: jac ? `${fmt(det, 6)} ${det < 0 ? '(orientation-reversing)' : '(orientation-preserving)'} (numerical)` : '—', tone: det < 0 ? 'warn' : undefined },
      { label: 'metric in chart A at p', value: gA ? `g = ${matTeX(gA)}` : '—', tex: !!gA },
      { label: 'K from chart A’s metric alone', value: xa ? `${fmt(KA, 10)} (exact: 1)` : '—', tone: 'good' },
      { label: 'chart A covers', value: A.domain, tone: 'muted' },
    ];
    ctx.setReadouts(rows);
    ctx.warn('');
    ctx.setNote(`On the sphere: **blue** = only chart A, **orange** = only chart B, **green** = both (the overlap, where the transition map lives), **gray** = neither. Chart A ${A.id === 'sn' || A.id === 'ss' ? 'is stereographic: conformal (it preserves angles), and it maps circles to circles' : A.id === 'gr' ? 'is a graph chart: simple, but it only sees a hemisphere' : 'is a longitude–latitude type chart: it degenerates at the poles, where a whole line of coordinates collapses to one point'}. Whatever the chart, the curvature computed from its metric is the same $K = 1$: geometry does not depend on coordinates.`);
  };
  return { update, dispose() { v.clear(); } };
}

// ═══ The metric tensor: Tissot ellipses ══════════════════════════════════════
interface MetricChart { id: string; label: string; g: [string, string, string]; view: { x0: number; x1: number; y0: number; y1: number }; inside: (x: number, y: number) => boolean; xName: string; yName: string; K: string; geometry: string; start: P2 }
const METRICS: MetricChart[] = [
  { id: 'cart', label: 'Flat plane, Cartesian (x, y)', g: ['1', '0', '1'], view: { x0: -3, x1: 3, y0: -3, y1: 3 }, inside: () => true, xName: 'x', yName: 'y', K: '0', geometry: 'flat', start: [0.8, 0.5] },
  { id: 'polar', label: 'Flat plane, polar (r, θ) drawn as a rectangle', g: ['1', '0', 'x^2'], view: { x0: -0.3, x1: 3.3, y0: -3.3, y1: 3.3 }, inside: (x, y) => x > 0 && Math.abs(y) < Math.PI, xName: 'r', yName: 'θ', K: '0', geometry: 'flat', start: [1.5, 0.6] },
  { id: 'll', label: 'Sphere, longitude–latitude (φ, λ)', g: ['cos(y)^2', '0', '1'], view: { x0: -3.4, x1: 3.4, y0: -1.8, y1: 1.8 }, inside: (x, y) => Math.abs(x) < Math.PI && Math.abs(y) < Math.PI / 2, xName: 'φ', yName: 'λ', K: '1', geometry: 'spherical', start: [0.4, 0.7] },
  { id: 'stereo', label: 'Sphere, stereographic (X, Y)', g: ['4/(1 + x^2 + y^2)^2', '0', '4/(1 + x^2 + y^2)^2'], view: { x0: -3, x1: 3, y0: -3, y1: 3 }, inside: () => true, xName: 'X', yName: 'Y', K: '1', geometry: 'spherical', start: [0.6, 0.4] },
  { id: 'merc', label: 'Sphere, Mercator (φ, m)', g: ['1/cosh(y)^2', '0', '1/cosh(y)^2'], view: { x0: -3.4, x1: 3.4, y0: -3, y1: 3 }, inside: (x) => Math.abs(x) < Math.PI, xName: 'φ', yName: 'm', K: '1', geometry: 'spherical', start: [0.4, 0.8] },
  { id: 'disk', label: 'Hyperbolic plane, Poincaré disc', g: ['4/(1 - x^2 - y^2)^2', '0', '4/(1 - x^2 - y^2)^2'], view: { x0: -1.15, x1: 1.15, y0: -1.15, y1: 1.15 }, inside: (x, y) => x * x + y * y < 1, xName: 'x', yName: 'y', K: '−1', geometry: 'hyperbolic', start: [0.3, 0.2] },
  { id: 'half', label: 'Hyperbolic plane, upper half-plane', g: ['1/y^2', '0', '1/y^2'], view: { x0: -2.5, x1: 2.5, y0: -0.2, y1: 3.2 }, inside: (_x, y) => y > 0, xName: 'x', yName: 'y', K: '−1', geometry: 'hyperbolic', start: [0.3, 1.0] },
];
const metricBy = new Map(METRICS.map((m) => [m.id, m]));

const metricDemo: DemoDef = {
  id: 'geometry.metric', module: 'geometry', title: 'The metric tensor: Tissot ellipses',
  topic: 'Metric tensors · first fundamental form · coordinates vs geometry · flat, spherical and hyperbolic geometry',
  summary: 'The metric g_ij tells you how long a small coordinate step really is. Draw, at many points of a chart, the set of steps of true length ε: circles where the chart is faithful, ellipses where it distorts. Flat geometry in polar coordinates, the sphere in three charts, the hyperbolic plane in two.',
  tex: 'ds^2 = g_{ij}\\,dx^i dx^j,\\qquad \\{\\,\\delta x : g_{ij}\\,\\delta x^i \\delta x^j = \\varepsilon^2\\,\\}\\ \\text{(Tissot’s indicatrix)}',
  view: '2d',
  params: [
    { key: 'px', label: 'probe x (drag it)', value: 0.6, min: -4, max: 4, step: 0.001 },
    { key: 'py', label: 'probe y', value: 0.4, min: -4, max: 4, step: 0.001 },
    { key: 'eps', label: 'ellipse size (× automatic ε)', value: 1, min: 0.3, max: 2.5, step: 0.01 },
    { key: 'rho', label: 'geodesic circle radius ρ', value: 0.6, min: 0.05, max: 2.5, step: 0.01 },
  ],
  choices: [{ key: 'metric', label: 'Geometry and chart', value: 'stereo', options: METRICS.map((m) => [m.id, m.label] as [string, string]) }],
  toggles: [{ key: 'field', label: 'Ellipses across the chart', value: true }, { key: 'circle', label: 'True geodesic circle of radius ρ', value: true }],
  experiments: [
    'Flat plane, polar coordinates: the ellipses are squashed in θ near r = 0 and stretched far out — yet K = 0. Coordinates can look curved while the geometry is flat.',
    'Sphere: compare longitude–latitude (ellipses flatten toward the poles), stereographic and Mercator (circles everywhere — conformal — but growing). Three charts, three metrics, one K = 1.',
    'Poincaré disc: the circles shrink toward the rim. The rim is infinitely far away: the hyperbolic plane is infinite, squeezed into a disc.',
    'Turn up ρ: the true geodesic circle (gold) has circumference less than 2πρ on the sphere and more on the hyperbolic plane. The readouts compare.',
    'Drag the probe and read off g_ij, its eigenvalues (stretch factors²) and √det g (the area factor).',
  ],
  connections: ['geometry.charts', 'geometry.covariant', 'geometry.compare', 'geometry.riemann'],
  accuracy: 'Metrics are exact; K comes from the metric alone by exact symbolic second derivatives (Riemann tensor). The geodesic circle is numerical (64 geodesics, classical RK4, 80 steps each), and its circumference is the metric length of that polygon.',
  create: (ctx) => createMetric(ctx),
};

function createMetric(ctx: DemoCtx): DemoInstance {
  const plot = ctx.plot!;
  plot.opts.equal = true;
  let last = '';
  const update = () => {
    const mc = metricBy.get(ctx.choices.metric) ?? METRICS[0];
    const M = chartMetric({ id: 'metric:' + mc.id, g: mc.g });
    if (last !== mc.id) {
      if (last) { ctx.setParam('px', mc.start[0]); ctx.setParam('py', mc.start[1]); }
      last = mc.id; plot.setView(mc.view);
    }
    let x = ctx.params.px, y = ctx.params.py;
    if (!mc.inside(x, y)) { x = mc.start[0]; y = mc.start[1]; }
    const g = M.g([x, y]);
    const T = curvatureTensors(M, [x, y]);
    const ev = eigSymmetric(g).values;
    // the true geodesic circle: unit-speed geodesics from the probe, length ρ
    const rho = ctx.params.rho;
    let circle: P2[] = [], circ = NaN, ok = true;
    if (ctx.toggles.circle) {
      const rhs = geodesicRhs(M);
      const { values, vectors } = eigSymmetric(g);
      for (let k = 0; k <= 64; k++) {
        const a = (2 * Math.PI * k) / 64;
        // a unit vector in the metric
        const c1 = Math.cos(a) / Math.sqrt(values[0]), c2 = Math.sin(a) / Math.sqrt(values[1]);
        let Y = [x, y, c1 * vectors[0][0] + c2 * vectors[0][1], c1 * vectors[1][0] + c2 * vectors[1][1]];
        const n = 80, h = rho / n;
        for (let i = 0; i < n; i++) { Y = rk4Step(rhs, 0, Y, h); if (!Y.every(Number.isFinite) || !mc.inside(Y[0], Y[1])) { ok = false; break; } }
        circle.push([Y[0], Y[1]]);
      }
      circ = 0;
      for (let k = 0; k < 64; k++) { const m: P2 = [(circle[k][0] + circle[k + 1][0]) / 2, (circle[k][1] + circle[k + 1][1]) / 2]; const gm = M.g(m); const d = [circle[k + 1][0] - circle[k][0], circle[k + 1][1] - circle[k][1]]; circ += Math.sqrt(gm[0][0] * d[0] * d[0] + 2 * gm[0][1] * d[0] * d[1] + gm[1][1] * d[1] * d[1]); }
      if (!ok) circle = [];
    }
    const K = T.scalar / 2;
    let eps = 0.1;
    plot.opts.xLabel = mc.xName; plot.opts.yLabel = mc.yName;
    plot.setDraw((G) => {
      if (mc.id === 'disk') G.path(Array.from({ length: 181 }, (_, i) => [Math.cos((2 * Math.PI * i) / 180), Math.sin((2 * Math.PI * i) / 180)] as P2), { color: SERIES[2], width: 1.6 });
      if (mc.id === 'half') G.line([-10, 0], [10, 0], { color: SERIES[2], width: 1.6 });
      if (mc.id === 'polar') { G.line([0, -Math.PI], [0, Math.PI], { color: SERIES[2], width: 1.4, dash: [5, 4] }); G.line([0, Math.PI], [4, Math.PI], { color: SERIES[2], width: 1, dash: [5, 4] }); G.line([0, -Math.PI], [4, -Math.PI], { color: SERIES[2], width: 1, dash: [5, 4] }); }
      if (ctx.toggles.field) {
        const { x0, x1, y0, y1 } = G.view, n = 12, hx = (x1 - x0) / n;
        const cells: { at: P2; gm: number[][]; r: number }[] = [];
        for (let i = 0; i <= n; i++) for (let j = 0; j <= Math.ceil((y1 - y0) / hx); j++) {
          const at: P2 = [x0 + (i + 0.5) * hx, y0 + (j + 0.5) * hx];
          if (!mc.inside(at[0], at[1])) continue;
          const gm = M.g(at);
          if (!gm.flat().every(Number.isFinite)) continue;
          cells.push({ at, gm, r: 1 / Math.sqrt(Math.min(...eigSymmetric(gm).values)) });
        }
        // one ε for the whole chart, so that a typical ellipse fills a third of a cell
        const rs = cells.map((c) => c.r).sort((a, b2) => a - b2);
        eps = rs.length ? (0.3 * hx * ctx.params.eps) / rs[Math.floor(rs.length / 2)] : 0.1;
        for (const c of cells) {
          if (eps * c.r > 0.55 * hx) { G.point(c.at, 2, { color: 'rgba(106,169,255,0.6)' }); continue; }
          const el = tissot(c.gm, c.at, eps);
          if (el.some((p) => !mc.inside(p[0], p[1]))) continue;
          G.polygon(el, { fill: 'rgba(106,169,255,0.22)', color: 'rgba(106,169,255,0.75)', width: 1 });
        }
      }
      if (circle.length) G.polygon(circle, { color: COLORS.geo, width: 2.4 });
      { const hx = (G.view.x1 - G.view.x0) / 12, lmin = Math.min(...eigSymmetric(g).values); G.polygon(tissot(g, [x, y], 0.45 * hx * Math.sqrt(lmin)), { fill: 'rgba(255,159,90,0.35)', color: COLORS.vec, width: 2 }); }
      G.handle({ id: 'p', at: [x, y], color: '#ffffff', onDrag: ([a, b]) => { if (!mc.inside(a, b)) return; ctx.setParam('px', a); ctx.setParam('py', b); update(); } });
    });
    const conformal = Math.abs(g[0][1]) < 1e-12 && Math.abs(g[0][0] - g[1][1]) < 1e-12 * Math.abs(g[0][0]);
    const exactC = mc.geometry === 'flat' ? 2 * Math.PI * rho : mc.geometry === 'spherical' ? 2 * Math.PI * Math.sin(rho) : 2 * Math.PI * Math.sinh(rho);
    const rows: Readout[] = [
      { label: 'metric', value: `ds^2 = ${metricTeX(mc)}`, tex: true },
      { label: `g_ij at (${fmt(x, 4)}, ${fmt(y, 4)})`, value: matTeX(g), tex: true },
      { label: 'eigenvalues of g (squared stretch factors)', value: `${fmt(ev[0], 6)}, ${fmt(ev[1], 6)}${conformal ? '  — equal: conformal here' : ''}` },
      { label: '√det g (area of a coordinate square)', value: fmt(Math.sqrt(g[0][0] * g[1][1] - g[0][1] ** 2), 6) },
      { label: 'K computed from g alone', value: `${fmt(Math.abs(K) < 1e-12 ? 0 : K, 10)}  (exact: ${mc.K})`, tone: 'good' },
    ];
    if (ctx.toggles.circle) {
      if (circle.length) rows.push({ label: `circumference of the geodesic circle, ρ = ${fmt(rho, 3)}`, value: `${fmt(circ, 7)} (numerical)` }, { label: mc.geometry === 'flat' ? 'flat: 2πρ' : mc.geometry === 'spherical' ? 'exact on the unit sphere: 2π sin ρ' : 'exact for K = −1: 2π sinh ρ', value: fmt(exactC, 7), tone: 'muted' }, { label: '2πρ (flat comparison)', value: fmt(2 * Math.PI * rho, 7), tone: 'muted' });
      else rows.push({ label: 'geodesic circle', value: 'leaves the chart — make ρ smaller', tone: 'warn' });
    }
    ctx.setReadouts(rows);
    ctx.warn(ctx.toggles.circle && mc.geometry === 'spherical' && rho > Math.PI - 0.2 ? 'On the unit sphere geodesics from p meet again at the antipode (ρ = π): the circle collapses there.' : '');
    ctx.setNote(`Each blue ellipse is the set of coordinate steps $\\delta x$ with the same true length $\\varepsilon$ (dots: too large to draw): $g_{ij}\\delta x^i\\delta x^j = \\varepsilon^2$. Where it is a circle the chart is faithful to angles (conformal); where it is large, one coordinate unit is short. **The metric is the geometry; the chart is only a description.** This chart describes ${mc.geometry === 'flat' ? 'the flat plane (K = 0)' : mc.geometry === 'spherical' ? 'the unit sphere (K = +1)' : 'the hyperbolic plane (K = −1), which has no smooth isometric embedding in ℝ³ as a whole (Hilbert) — only an intrinsic description like this one'}.`);
  };
  return { update, dispose() {} };
}

function metricTeX(m: MetricChart): string {
  switch (m.id) {
    case 'cart': return 'dx^2 + dy^2';
    case 'polar': return 'dr^2 + r^2\\,d\\theta^2';
    case 'll': return `\\cos^2\\lambda\\,d\\varphi^2 + d\\lambda^2`;
    case 'stereo': return '\\dfrac{4\\,(dX^2 + dY^2)}{(1 + X^2 + Y^2)^2}';
    case 'merc': return '\\operatorname{sech}^2 m\\,(d\\varphi^2 + dm^2)';
    case 'disk': return '\\dfrac{4\\,(dx^2 + dy^2)}{(1 - x^2 - y^2)^2}';
    default: return '\\dfrac{dx^2 + dy^2}{y^2}';
  }
}

// ═══ Covariant derivative and Christoffel symbols ═════════════════════════════
const covariantDemo: DemoDef = {
  id: 'geometry.covariant', module: 'geometry', title: 'Covariant derivative and Christoffel symbols',
  topic: 'Covariant derivatives · Christoffel symbols · the Gauss formula',
  summary: 'Differentiate a basis vector of the surface and the result sticks out of the tangent plane. Its tangential part is the covariant derivative ∇_i ∂_j = Γᵏ_ij ∂_k — the Christoffel symbols — and its normal part is the second fundamental form. The same Γ follow from the metric alone.',
  tex: '\\partial_i \\mathbf r_j = \\underbrace{\\Gamma^k_{ij}\\,\\mathbf r_k}_{\\nabla_i \\partial_j\\ (\\text{intrinsic})} + \\underbrace{h_{ij}\\,\\mathbf n}_{\\text{extrinsic}},\\qquad \\Gamma^k_{ij} = \\tfrac12 g^{kl}(\\partial_i g_{lj} + \\partial_j g_{li} - \\partial_l g_{ij})',
  view: '3d',
  params: [...SHAPE_PARAMS, ...POINT_PARAMS],
  choices: [surfaceChoice('polarplane'), { key: 'which', label: 'Differentiate', value: 'vv', options: [['uu', '∂_u r_u'], ['uv', '∂_u r_v = ∂_v r_u'], ['vv', '∂_v r_v']] }],
  toggles: [{ key: 'parts', label: 'Split into tangential + normal parts', value: true }, { key: 'basis', label: 'Basis r_u, r_v', value: true }],
  input: CUSTOM_INPUT,
  experiments: [
    'Plane in polar coordinates: the surface is flat and has no normal part, yet ∂_v r_v = −r r_u ≠ 0. Γ^r_θθ = −r and Γ^θ_rθ = 1/r: Christoffel symbols measure the *coordinates*, not curvature. In Cartesian coordinates they all vanish.',
    'Sphere: ∂_v r_v has both a tangential part (Γ^u_vv r_u, pointing toward the pole) and a normal part (pointing to the centre).',
    'Compare the two tables in the readouts: Γ from the embedding (tangential part of r_ij) and Γ from the metric formula agree to rounding. The Christoffel symbols are intrinsic.',
    'Because Γ is not a tensor, “∇V = 0” and “∂V = 0” differ: in polar coordinates the constant vector field ∂_x has varying components. The covariant derivative ∇_i V^k = ∂_i V^k + Γ^k_ij V^j fixes that.',
  ],
  connections: ['geometry.transport', 'geometry.geodesics', 'geometry.metric', 'geometry.forms'],
  accuracy: 'Both Γ tables use exact symbolic derivatives (of r for the embedding, of g_ij — via r — for the metric formula); they are evaluated in floating point.',
  create: (ctx) => createCovariant(ctx),
};

function createCovariant(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  let b: Built = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null;
  const arrows: Record<string, Arrow> = {};
  let link: Curve | null = null;
  const update = () => {
    b = surfaceFromCtx(ctx);
    mesh.set(b, 'uniform', { color: '#5f86c9', opacity: 0.9 });
    const [u, w] = followSurfaceChange(ctx, st, b);
    const g = localGeometry(b.S, u, w);
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(g.r);
    const which = ctx.choices.which ?? 'vv';
    const idx = which === 'uu' ? 0 : which === 'uv' ? 1 : 2;
    const rij = which === 'uu' ? g.ruu : which === 'uv' ? g.ruv : g.rvv;
    const Gu = g.gamma[idx], Gv = g.gamma[3 + idx];
    const tang: V3 = [Gu * g.ru[0] + Gv * g.rv[0], Gu * g.ru[1] + Gv * g.rv[1], Gu * g.ru[2] + Gv * g.rv[2]];
    const h = which === 'uu' ? g.L : which === 'uv' ? g.M : g.N;
    const nor: V3 = [h * g.n[0], h * g.n[1], h * g.n[2]];
    const s = b.scale;
    const big = Math.max(Math.hypot(...rij), Math.hypot(...g.ru), Math.hypot(...g.rv), 1e-9), k = big > s ? s / big : 1;
    const S = (x: V3): V3 => [x[0] * k, x[1] * k, x[2] * k];
    const set = (key: string, o: V3, vec: V3, color: string, label: string, on: boolean) => { if (!arrows[key]) arrows[key] = v.addArrow(o, vec, { color, label, radius: s * 0.01 }); else arrows[key].set(o, vec); arrows[key].visible(on); };
    set('ru', g.r, S(g.ru), COLORS.ru, 'r<sub>u</sub>', !!ctx.toggles.basis);
    set('rv', g.r, S(g.rv), COLORS.rv, 'r<sub>v</sub>', !!ctx.toggles.basis);
    const lab = which === 'uu' ? '∂<sub>u</sub>r<sub>u</sub>' : which === 'uv' ? '∂<sub>u</sub>r<sub>v</sub>' : '∂<sub>v</sub>r<sub>v</sub>';
    set('rij', g.r, S(rij), COLORS.geo, lab, true);
    set('tan', g.r, S(tang), COLORS.vec, '∇ (tangential)', !!ctx.toggles.parts);
    const tipT: V3 = [g.r[0] + S(tang)[0], g.r[1] + S(tang)[1], g.r[2] + S(tang)[2]];
    set('nor', tipT, S(nor), COLORS.n, 'h n (normal)', !!ctx.toggles.parts && Math.abs(h) > 1e-12);
    if (!link) link = v.addCurve([tipT, [g.r[0] + S(rij)[0], g.r[1] + S(rij)[1], g.r[2] + S(rij)[2]]], { color: '#9aa3b5', radius: 0 }); else link.set([tipT, [g.r[0] + S(rij)[0], g.r[1] + S(rij)[1], g.r[2] + S(rij)[2]]]);
    // Γ from the metric alone, for comparison
    const Mg = metricOfSurface(b.S);
    const G2 = christoffel(Mg, [u, w]);
    const tab = (G: (k: number, i: number, j: number) => number) => `\\Gamma^u = ${matTeX([[G(0, 0, 0), G(0, 0, 1)], [G(0, 1, 0), G(0, 1, 1)]], 5)},\\ \\Gamma^v = ${matTeX([[G(1, 0, 0), G(1, 0, 1)], [G(1, 1, 0), G(1, 1, 1)]], 5)}`;
    const fromJet = (kk: number, i: number, j: number) => g.gamma[3 * kk + (i + j)];
    let maxDiff = 0;
    for (let kk = 0; kk < 2; kk++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) maxDiff = Math.max(maxDiff, Math.abs(fromJet(kk, i, j) - G2[kk][i][j]));
    const rows: Readout[] = [
      { label: 'surface', value: b.tex, tex: true },
      { label: 'point (u, v)', value: `(${fmt(u)}, ${fmt(w)})` },
      { label: `Γ at p (from the embedding: tangential part of r_ij)`, value: tab(fromJet), tex: true },
      { label: 'Γ at p from the metric: ½g^{kl}(∂g + ∂g − ∂g)', value: tab((kk, i, j) => G2[kk][i][j]), tex: true },
      { label: 'largest difference between the two', value: `${maxDiff.toExponential(1)} (rounding)`, tone: 'good' },
      { label: `decomposition of ${which === 'uu' ? '∂_u r_u' : which === 'uv' ? '∂_u r_v' : '∂_v r_v'}`, value: `${vecTeX(rij)} = ${tx(Gu, 4)}\\,\\mathbf r_u + ${tx(Gv, 4)}\\,\\mathbf r_v + ${tx(h, 4)}\\,\\mathbf n`, tex: true },
    ];
    if (k < 1) rows.push({ label: 'arrows drawn at', value: `${fmt(k, 3)} × true length`, tone: 'muted' });
    if (shapeNote(b)) rows.push({ label: 'shape', value: shapeNote(b), tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.warn(b.error || (!g.regular ? 'The parametrization is singular here; Christoffel symbols blow up (a coordinate singularity). Move the point.' : ''));
    ctx.setNote(`Gauss formula: $\\partial_i \\mathbf r_j = \\Gamma^k_{ij}\\mathbf r_k + h_{ij}\\mathbf n$. The **orange** arrow is the tangential part — what a creature in the surface sees as the rate of change of the basis vector: $\\nabla_{\\partial_i}\\partial_j = \\Gamma^k_{ij}\\partial_k$. The **blue** arrow is the normal part $h_{ij}\\mathbf n$ (the second fundamental form), invisible from inside. For any tangent field, $\\nabla_i V^k = \\partial_i V^k + \\Gamma^k_{ij}V^j$: the Christoffel terms correct for the turning of the basis. Γ is *not a tensor*: it can be nonzero on a flat plane (polar coordinates) and is zero at any point in suitable (normal) coordinates — the principle behind the equivalence principle in GR.`);
  };
  return { update, dispose() { v.clear(); } };
}

export const chartDemos: DemoDef[] = [chartsDemo, metricDemo, covariantDemo];
