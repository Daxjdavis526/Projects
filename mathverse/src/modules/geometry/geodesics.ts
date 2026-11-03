// Geodesics on surfaces (launch by dragging), flat vs curved geometry
// (triangle angle sums, circumference vs radius), and geodesic deviation —
// curvature as tidal acceleration, on surfaces and near a mass.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { parse } from '../../core/expr';
import {
  localGeometry, traceGeodesic, directionAt, geodesicBetween, geodesicTransport, curvatureOverPolygon, jacobiField, metricFromExprs, curvatureTensors,
  orthonormalFrame, metricDot, dot3, norm3, sub3, V2, V3, GeodesicResult, LocalGeometry,
} from '../../core/numeric/geometry';
import { rk4Step } from '../../core/numeric/ode';
import { SERIES } from '../../engine/colors';
import {
  surfaceChoice, SHAPE_PARAMS, POINT_PARAMS, CUSTOM_INPUT, surfaceFromCtx, SurfaceMesh, ColorBar, Built, clampUV, surfaceDragPoint, followSurfaceChange,
  fmt, deg, COLORS, shapeNote, lift,
} from './lib';

type View = NonNullable<DemoCtx['view3d']>;
type Arrow = ReturnType<View['addArrow']>;
type Curve = ReturnType<View['addCurve']>;
type Pt = ReturnType<View['addPoint']>;

/** 3D points of a geodesic, lifted a little off the surface so the tube is not buried in it */
function liftGeo(b: Built, r: GeodesicResult, k: number): V3[] {
  return r.points.map((q) => { const g = localGeometry(b.charts[q.chart].surface, q.u, q.v); return g.regular ? lift(q.p, g.n, k) : q.p; });
}
const to3 = (g: LocalGeometry, d: V2): V3 => [d[0] * g.ru[0] + d[1] * g.rv[0], d[0] * g.ru[1] + d[1] * g.rv[1], d[0] * g.ru[2] + d[1] * g.rv[2]];
const unit = (x: V3): V3 => { const l = norm3(x) || 1; return [x[0] / l, x[1] / l, x[2] / l]; };

// ═══ Geodesics ═══════════════════════════════════════════════════════════════
const geodesicsDemo: DemoDef = {
  id: 'geometry.geodesics', module: 'geometry', title: 'Geodesics',
  topic: 'Geodesics · the geodesic equation · Clairaut’s relation · focusing by curvature',
  summary: 'A geodesic is the straightest possible curve on a surface: its acceleration has no component along the surface. Launch one from any point in any direction — drag the point and the orange arrow — on spheres, tori, saddles, cones, minimal surfaces or your own surface.',
  tex: '\\ddot x^k + \\Gamma^k_{ij}\\,\\dot x^i \\dot x^j = 0,\\qquad g_{ij}\\dot x^i\\dot x^j = 1',
  view: '3d',
  params: [...SHAPE_PARAMS, ...POINT_PARAMS,
    { key: 'angle', label: 'initial direction (angle from r_u; drag the arrow)', value: 0.6, min: -Math.PI, max: Math.PI, step: 0.002 },
    { key: 'len', label: 'length (arc length)', value: 9, min: 0.2, max: 60, step: 0.01 },
    { key: 'spread', label: 'fan half-angle', value: 0.35, min: 0.02, max: 1.5, step: 0.01 }],
  choices: [surfaceChoice('torus'), { key: 'color', label: 'Colour the surface by', value: 'K', options: [['K', 'Gaussian curvature K'], ['uniform', 'plain']] }],
  toggles: [{ key: 'fan', label: 'Fan of neighbouring geodesics', value: false }, { key: 'arrow', label: 'Initial direction arrow', value: true }],
  input: CUSTOM_INPUT,
  experiments: [
    'Sphere: every geodesic is a great circle and closes after 2πa. Aim it over a pole — the computation switches to a second chart there, and the curve continues smoothly.',
    'Turn on the fan on the sphere with length πa: geodesics leaving a point meet again at the antipode. Positive curvature focuses.',
    'Saddle or pseudosphere: the fan spreads faster than straight lines would. Negative curvature defocuses — the root of chaos in geodesic flows.',
    'Torus: ρ cos ψ is conserved (Clairaut). Start on the outer equator at a shallow angle and the geodesic never reaches the inside; steepen it and it winds through the hole.',
    'Cone: geodesics are straight lines on the unrolled paper. A geodesic can wrap around the apex and cross itself.',
    'Gaussian bump: geodesics passing near the bump are deflected — a spatial cartoon of gravitational lensing (real lensing needs spacetime curvature; see *Embedding diagrams*).',
  ],
  connections: ['geometry.compare', 'geometry.deviation', 'geometry.transport', 'geometry.charts', 'geometry.flamm'],
  accuracy: 'Numerical: classical RK4 in arc length (step 0.005 × size) on the geodesic equation with exact Christoffel symbols. The speed g(ẋ, ẋ) should stay 1; its largest drift is shown. On the sphere the integration switches to a rotated chart near the poles (an atlas), so it never meets the coordinate singularity.',
  tutorial: [
    { text: '**Straightest curves.** Walk on a surface without ever turning left or right: your path is a geodesic. On a sphere these are the great circles — the routes aircraft fly. The gold curve starts at the white point in the direction of the orange arrow.', task: 'Drag the orange arrow tip to launch the geodesic in another direction.', set: { choices: { surface: 'sphere', color: 'K' }, params: { a: 1.5, pu: 1.1, pv: 0.3, angle: 0.6, len: 9.42 }, toggles: { fan: false, arrow: true } }, done: (c) => Math.abs(c.params.angle - 0.6) > 0.3 },
    { text: '**The geodesic equation.** In coordinates, “no sideways acceleration” reads ẍᵏ + Γᵏᵢⱼẋⁱẋʲ = 0. The Christoffel terms are needed because the coordinate lines themselves curve. The equation is solved numerically here, step by step.\n\nAt the poles the (u, v) chart breaks down, so MathVerse switches to a second, rotated chart — an atlas in action.', task: 'Aim the geodesic straight at a pole (along ±r_u, angle ≈ 0 or ±π).', done: (c) => c.choices.surface === 'sphere' && Math.abs(Math.sin(c.params.angle)) < 0.05 },
    { text: '**Positive curvature focuses.** Geodesics leaving one point in nearby directions start out diverging, but on the sphere they bend back together and meet at the antipode, a distance πa away. This is how curvature is *felt* without any outside view.', task: 'Turn on the fan.', set: { choices: { surface: 'sphere' }, params: { len: 4.71, spread: 0.5, angle: 0.3 } }, done: (c) => !!c.toggles.fan },
    { text: '**Negative curvature defocuses.** On a saddle-shaped surface (K < 0) the fan opens up faster than straight lines would — nearby geodesics separate exponentially. That is why geodesic flow on negatively curved surfaces is chaotic.', task: 'Switch to the pseudosphere (K = −1/a² everywhere) or the saddle.', set: { toggles: { fan: true }, params: { spread: 0.25 } }, done: (c) => c.choices.surface === 'pseudosphere' || c.choices.surface === 'saddle' },
    { text: '**Clairaut’s relation.** On a surface of revolution, ρ cos ψ is conserved along a geodesic (ρ = distance from the axis, ψ = angle with the parallel) — the analogue of conserved angular momentum. On a torus, a geodesic starting on the outer equator with |ρ cos ψ| > a − b can never reach the inner equator.', task: 'On the torus, start on the outer equator (v = 0) and steepen the angle until the geodesic passes through the hole.', set: { choices: { surface: 'torus' }, params: { a: 1.6, b: 0.6, pu: 0, pv: 0, angle: 0.25, len: 30 }, toggles: { fan: false } },
      done: (c) => c.choices.surface === 'torus' && Math.abs(Math.cos(c.params.angle)) * (c.params.a + c.params.b * Math.cos(c.params.pv)) < c.params.a - c.params.b - 0.02 },
    { text: '**A lens made of curvature.** Over a Gaussian bump, geodesics that pass close to the top are bent. It looks like gravitational lensing — and the analogy is honest only halfway: light in general relativity follows *spacetime* geodesics, and the bending of time matters as much as the bending of space (the true deflection is twice the “space-only” value).', task: 'Choose the Gaussian bump and launch geodesics past it with the fan on.', set: { choices: { surface: 'bump', color: 'K' }, params: { a: 2.5, b: 0.9, pu: -2.2, pv: -0.6, angle: 0.15, len: 5, spread: 0.12 }, toggles: { fan: true } }, done: (c) => c.choices.surface === 'bump' },
  ],
  create: (ctx) => createGeodesics(ctx),
};

function createGeodesics(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  const bar = new ColorBar(v);
  let b = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, tip: Pt | null = null, arrow: Arrow | null = null, main: Curve | null = null;
  const fan: Curve[] = [];
  let P: V3 = [0, 0, 0], g0: LocalGeometry | null = null;
  const update = () => {
    b = surfaceFromCtx(ctx);
    const range = mesh.set(b, (ctx.choices.color ?? 'K') === 'K' ? 'K' : 'uniform', { res: 90, color: '#5f86c9', clipK: 4 });
    if (ctx.choices.color === 'K') bar.set('Gaussian curvature K', range[0], range[1], 'coolwarm'); else bar.hide();
    const [u, w] = followSurfaceChange(ctx, st, b);
    const g = localGeometry(b.S, u, w);
    g0 = g; P = g.r;
    const s = b.scale;
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(P);
    const th = ctx.params.angle, d = directionAt(b.S, u, w, th);
    const D3 = unit(to3(g, d)), L = s * 0.45;
    const tipP: V3 = [P[0] + D3[0] * L, P[1] + D3[1] * L, P[2] + D3[2] * L];
    if (!arrow) arrow = v.addArrow(P, [D3[0] * L, D3[1] * L, D3[2] * L], { color: COLORS.vec, radius: s * 0.01 }); else arrow.set(P, [D3[0] * L, D3[1] * L, D3[2] * L]);
    if (!tip) tip = v.addPoint(tipP, { color: COLORS.vec, size: s * 0.035, drag: {
      constrain: (q) => { const gg = g0!; const dd = sub3(q, gg.r); const t = dot3(dd, gg.n); return [q[0] - t * gg.n[0], q[1] - t * gg.n[1], q[2] - t * gg.n[2]]; },
      onDrag: (q) => {
        const gg = g0!, dd = sub3(q, gg.r);
        const [e1, e2] = orthonormalFrame(gg);
        const a1 = dot3(dd, to3(gg, e1)), a2 = dot3(dd, to3(gg, e2));
        ctx.setParam('angle', Math.atan2(a2, a1)); update();
      } } }); else tip.set(tipP);
    arrow.visible(!!ctx.toggles.arrow); tip.visible(!!ctx.toggles.arrow && g.regular);
    const h = s * 0.005, len = ctx.params.len;
    const r = traceGeodesic(b.charts, { chart: 0, u, v: w, du: d[0], dv: d[1] }, len, { h, maxPoints: 2500 });
    const pts = liftGeo(b, r, s * 0.006);
    if (!main) main = v.addCurve(pts.length > 1 ? pts : [P, P], { color: COLORS.geo, radius: s * 0.009 }); else main.set(pts.length > 1 ? pts : [P, P]);
    // the fan
    const nf = ctx.toggles.fan ? 8 : 0;
    while (fan.length < nf) fan.push(v.addCurve([P, P], { color: COLORS.alt, radius: s * 0.005 }));
    fan.forEach((c, i) => {
      c.visible(i < nf);
      if (i >= nf) return;
      const k = i < 4 ? i - 4 : i - 3;
      const dd = directionAt(b.S, u, w, th + (k * ctx.params.spread) / 4);
      const rr = traceGeodesic(b.charts, { chart: 0, u, v: w, du: dd[0], dv: dd[1] }, len, { h: h * 1.6, maxPoints: 900 });
      const pp = liftGeo(b, rr, s * 0.005);
      c.set(pp.length > 1 ? pp : [P, P]);
    });
    const rows: Readout[] = [
      { label: 'surface', value: b.tex, tex: true },
      { label: 'start (u, v), direction', value: `(${fmt(u)}, ${fmt(w)}),  ${deg(th)} from r_u` },
      { label: 'length traced', value: `${fmt(r.length, 6)} of ${fmt(len, 6)}`, tone: r.stop === 'done' ? undefined : 'warn' },
      { label: 'speed drift max |g(ẋ,ẋ) − 1|', value: `${r.speedDrift.toExponential(1)} (numerical)`, tone: r.speedDrift < 1e-6 ? 'good' : 'warn' },
    ];
    if (b.charts.length > 1) rows.push({ label: 'chart switches (atlas)', value: String(r.switches) });
    if (b.def.rot && b.def.rho) {
      // Clairaut: ρ² dφ/ds is conserved (φ the angle of rotation)
      const c0 = clairaut(b, u, w, d), endOk = r.end.chart === 0;
      const c1 = endOk ? clairaut(b, r.end.u, r.end.v, [r.end.du, r.end.dv]) : NaN;
      rows.push({ label: 'Clairaut ρ cos ψ = ρ² dφ/ds: start → end', value: endOk ? `${fmt(c0, 8)} → ${fmt(c1, 8)}` : `${fmt(c0, 8)} (end in chart 2)`, tone: 'good' });
      if (b.def.id === 'torus') rows.push({ label: 'reaches the inner equator?', value: Math.abs(c0) < b.a - b.b ? `yes: |c| < a − b = ${fmt(b.a - b.b, 4)}` : `no: |c| ≥ a − b = ${fmt(b.a - b.b, 4)}`, tone: 'muted' });
    }
    if (b.def.id === 'sphere') rows.push({ label: 'great circle: closes after 2πa', value: fmt(2 * Math.PI * b.a, 6), tone: 'muted' });
    if (b.def.id === 'cone') rows.push({ label: 'unrolled cone: a sector of angle', value: `2π/√(1+b²) = ${deg((2 * Math.PI) / Math.sqrt(1 + b.b * b.b))}`, tone: 'muted' });
    if (shapeNote(b)) rows.push({ label: 'shape', value: shapeNote(b), tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.warn(b.error || (!g.regular ? 'The starting point is a singular point of the parametrization. Move it.' : r.stop !== 'done' ? `${r.warning} after s = ${fmt(r.length, 4)}.` : ''));
    ctx.setNote(`The gold curve solves $\\ddot x^k = -\\Gamma^k_{ij}\\dot x^i\\dot x^j$ from the white point, at unit speed. Its acceleration in space is entirely normal to the surface — it does not turn *within* the surface (geodesic curvature 0). Locally a geodesic is the shortest path between its points; globally not always (on the sphere, past the antipode it is the long way round).`);
  };
  return { update, dispose() { bar.dispose(); v.clear(); } };
}

function clairaut(b: Built, u: number, w: number, d: V2): number {
  const rho = b.def.rho!(u, w, b.a, b.b);
  const dphi = b.def.rot === 'u' ? d[0] : d[1];
  const g = localGeometry(b.S, u, w), sp = Math.sqrt(metricDot(g, d, d));
  return (rho * rho * dphi) / sp;
}

// ═══ Flat vs curved: triangles and circles ═══════════════════════════════════
const compareDemo: DemoDef = {
  id: 'geometry.compare', module: 'geometry', title: 'Flat vs curved: triangles and circles',
  topic: 'Comparing flat and curved geometries · angle sums · Gauss–Bonnet · circumference vs radius',
  summary: 'Draw a geodesic triangle and add its angles: π on the plane, more on a sphere, less on a saddle — and the excess is exactly the curvature enclosed. Draw a geodesic circle and compare its circumference with 2πρ. Curvature is something you can measure without leaving the surface.',
  tex: '\\alpha + \\beta + \\gamma - \\pi = \\iint_\\triangle K\\,dA,\\qquad C(\\rho) = 2\\pi\\rho\\Big(1 - \\frac{K\\rho^2}{6} + \\dots\\Big)',
  view: '3d',
  params: [...SHAPE_PARAMS,
    { key: 't1u', label: 'vertex A: u', value: 0.9, min: -3.2, max: 3.2, step: 0.005 }, { key: 't1v', label: 'vertex A: v', value: -0.4, min: -3.2, max: 3.2, step: 0.005 },
    { key: 't2u', label: 'vertex B: u', value: 1.5, min: -3.2, max: 3.2, step: 0.005 }, { key: 't2v', label: 'vertex B: v', value: 0.6, min: -3.2, max: 3.2, step: 0.005 },
    { key: 't3u', label: 'vertex C: u', value: 0.5, min: -3.2, max: 3.2, step: 0.005 }, { key: 't3v', label: 'vertex C: v', value: 0.5, min: -3.2, max: 3.2, step: 0.005 },
    { key: 'rho', label: 'circle radius ρ', value: 0.8, min: 0.05, max: 3, step: 0.005 }],
  choices: [surfaceChoice('sphere', ['sphere', 'plane', 'saddle', 'pseudosphere', 'torus', 'bump', 'cylinder', 'cone']), { key: 'mode', label: 'Figure', value: 'triangle', options: [['triangle', 'Geodesic triangle (drag the vertices)'], ['circle', 'Geodesic circle about A']] }],
  toggles: [{ key: 'spokes', label: 'Show the radial geodesics (circle)', value: true }],
  experiments: [
    'Sphere: drag the vertices apart. The angle sum exceeds π by exactly the enclosed area / a² (Girard’s theorem).',
    'Plane: whatever you do, the sum is π. Cylinder: also π — it is flat (K = 0) although bent.',
    'Pseudosphere or saddle: the sum falls short of π. The deficit equals −∫∫K dA.',
    'Circle mode on the sphere: C = 2πa sin(ρ/a) < 2πρ. On the pseudosphere C > 2πρ. From C(ρ) alone a surveyor could compute K (Bertrand–Diguet–Puiseux).',
    'Torus: place the triangle on the outside (excess > 0) and then the inside (excess < 0).',
  ],
  connections: ['geometry.transport', 'geometry.curvature', 'geometry.metric', 'geometry.geodesics'],
  accuracy: 'Sphere and plane edges are exact (great-circle arcs, straight lines). Other edges are found by shooting (Newton on the initial direction and length of an RK4 geodesic; residual ≤ 1e−9). Angles come from the edge tangents; ∫∫K dA is Gauss–Legendre quadrature over the triangle in the parameter plane. Circle: 120 radial geodesics; the circumference is the polygon length (relative error ~1e−4).',
  create: (ctx) => createCompare(ctx),
};

function createCompare(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  let b = surfaceFromCtx(ctx);
  const verts: Pt[] = [];
  const edges: Curve[] = [];
  let circle: Curve | null = null;
  const spokes: Curve[] = [];
  let lastId = '';
  const keys: [string, string][] = [['t1u', 't1v'], ['t2u', 't2v'], ['t3u', 't3v']];
  const DEF: Record<string, V2[]> = { sphere: [[0.9, -0.4], [1.5, 0.6], [0.5, 0.5]], plane: [[-0.8, -0.6], [0.9, -0.3], [0, 0.9]], saddle: [[-0.7, -0.6], [0.8, -0.4], [0, 0.8]], pseudosphere: [[0.6, -0.6], [0.6, 0.6], [1.6, 0]], torus: [[-0.4, -0.3], [0.4, -0.3], [0, 0.5]], bump: [[-1, -0.8], [1, -0.8], [0, 1]], cylinder: [[-0.4, -0.5], [0.5, -0.4], [0, 0.6]], cone: [[-0.5, 0.6], [0.5, 0.6], [0, 1.4]] };
  const update = () => {
    b = surfaceFromCtx(ctx);
    if (lastId && lastId !== b.def.id) { const d = DEF[b.def.id]; if (d) d.forEach((p, i) => { ctx.setParam(keys[i][0], p[0]); ctx.setParam(keys[i][1], p[1]); }); }
    lastId = b.def.id;
    mesh.set(b, b.def.id === 'plane' || b.def.id === 'cylinder' || b.def.id === 'cone' ? 'uniform' : 'K', { res: 90, color: '#5f86c9', opacity: 0.95, clipK: 4 });
    const s = b.scale;
    const V: V2[] = keys.map(([ku, kv]) => clampUV(b, ctx.params[ku], ctx.params[kv]));
    keys.forEach(([ku, kv], i) => {
      const p = b.S.r(...V[i]);
      if (!verts[i]) verts.push(surfaceDragPoint(v, ctx, () => b, update, { keys: [ku, kv], color: [COLORS.ru, COLORS.rv, COLORS.n][i], size: s * 0.04, label: 'ABC'[i] }));
      else verts[i].set(p);
    });
    const tri = ctx.choices.mode !== 'circle';
    verts.forEach((h, i) => h.visible(tri || i === 0));
    const rows: Readout[] = [{ label: 'surface', value: b.tex, tex: true }];
    let warn = b.error;
    if (tri) {
      // edges
      const lines: { pts: V3[]; uv: V2[]; d0: V3; d1: V3 }[] = [];
      let failed = false;
      for (let i = 0; i < 3; i++) {
        const A = V[i], B = V[(i + 1) % 3];
        const e = edge(b, A, B);
        if (!e) { failed = true; break; }
        lines.push(e);
      }
      edges.forEach((h) => h.visible(false));
      if (failed) warn = warn || 'No geodesic between two of the vertices was found from the straight-line guess (they may be too far apart, or the geodesic leaves the patch). Move them closer.';
      else {
        lines.forEach((l, i) => { const pts = l.pts.map((p, k) => { const g = localGeometry(b.S, l.uv[k][0], l.uv[k][1]); return g.regular ? lift(p, g.n, s * 0.006) : p; }); if (!edges[i]) edges.push(v.addCurve(pts, { color: COLORS.geo, radius: s * 0.009 })); else edges[i].set(pts); edges[i].visible(true); });
        const ang = [0, 1, 2].map((i) => Math.acos(Math.max(-1, Math.min(1, dot3(lines[i].d0, scaleN(lines[(i + 2) % 3].d1, -1))))));
        const sum = ang[0] + ang[1] + ang[2];
        const poly: V2[] = [];
        lines.forEach((l) => poly.push(...l.uv.slice(0, -1)));
        // unwrap periodic coordinates so the polygon is continuous
        for (let k = 1; k < poly.length; k++) for (const c of [0, 1] as const) { const per = c === 0 ? b.def.periodicU : b.def.periodicV; if (!per) continue; const P = (c === 0 ? b.u : b.v)[1] - (c === 0 ? b.u : b.v)[0]; while (poly[k][c] - poly[k - 1][c] > P / 2) poly[k][c] -= P; while (poly[k][c] - poly[k - 1][c] < -P / 2) poly[k][c] += P; }
        const tot = curvatureOverPolygon(b.S, poly, 4);
        rows.push(
          { label: 'angles A, B, C', value: `${deg(ang[0])}, ${deg(ang[1])}, ${deg(ang[2])}` },
          { label: 'angle sum', value: `${deg(sum)}  (flat: 180°)`, tone: Math.abs(sum - Math.PI) < 1e-6 ? 'muted' : sum > Math.PI ? 'good' : 'bad' },
          { label: 'excess α + β + γ − π', value: `${fmt(sum - Math.PI, 8)} rad` },
          { label: '∫∫ K dA over the triangle', value: `${fmt(tot.K, 8)} (numerical)`, tone: 'good' },
          { label: 'area of the triangle', value: `${fmt(tot.area, 7)} (numerical)`, tone: 'muted' },
        );
        if (b.def.id === 'sphere') rows.push({ label: 'Girard (exact on a sphere): area = a² × excess', value: fmt(b.a * b.a * (sum - Math.PI), 8), tone: 'muted' });
      }
      circle?.visible(false); spokes.forEach((h) => h.visible(false));
    } else {
      edges.forEach((h) => h.visible(false));
      const rho = ctx.params.rho, n = 120;
      const [u, w] = V[0];
      const ring: V3[] = [], ringUV: V2[] = [];
      let ok = true;
      const spk: V3[][] = [];
      for (let k = 0; k <= n; k++) {
        const d = directionAt(b.S, u, w, (2 * Math.PI * k) / n);
        const r = traceGeodesic(b.charts, { chart: 0, u, v: w, du: d[0], dv: d[1] }, rho, { h: Math.min(rho / 40, s * 0.01), maxPoints: 60 });
        if (r.stop !== 'done' || r.end.chart !== 0) { ok = false; }
        const q = r.points[r.points.length - 1];
        ring.push(q.p); ringUV.push([q.u, q.v]);
        if (k % 10 === 0) spk.push(r.points.map((x) => x.p));
      }
      let C = 0; for (let k = 0; k < n; k++) C += norm3(sub3(ring[k + 1], ring[k]));
      const lifted = ring.map((p, k) => { const g = localGeometry(b.S, ringUV[k][0], ringUV[k][1]); return g.regular ? lift(p, g.n, s * 0.006) : p; });
      if (!circle) circle = v.addCurve(lifted, { color: COLORS.geo, radius: s * 0.009 }); else circle.set(lifted);
      circle.visible(true);
      while (spokes.length < spk.length) spokes.push(v.addCurve([[0, 0, 0], [0, 0, 0]], { color: COLORS.alt, radius: 0 }));
      spokes.forEach((h, i) => { if (i < spk.length) h.set(spk[i]); h.visible(!!ctx.toggles.spokes && i < spk.length); });
      const K0 = localGeometry(b.S, u, w).K;
      const area = ok ? curvatureOverPolygon(b.S, ringUV.slice(0, -1), 4).area : NaN;
      rows.push(
        { label: 'radius ρ (geodesic distance)', value: fmt(rho, 5) },
        { label: 'circumference C (numerical)', value: fmt(C, 7) },
        { label: 'flat: 2πρ', value: fmt(2 * Math.PI * rho, 7), tone: 'muted' },
        { label: 'C / 2πρ', value: fmt(C / (2 * Math.PI * rho), 6), tone: C < 2 * Math.PI * rho * (1 - 1e-4) ? 'good' : C > 2 * Math.PI * rho * (1 + 1e-4) ? 'bad' : 'muted' },
      );
      if (b.def.id === 'sphere') rows.push({ label: 'exact on a sphere: 2πa sin(ρ/a)', value: fmt(2 * Math.PI * b.a * Math.sin(rho / b.a), 7), tone: 'muted' });
      if (b.def.id === 'pseudosphere') rows.push({ label: 'exact for K = −1/a²: 2πa sinh(ρ/a)', value: fmt(2 * Math.PI * b.a * Math.sinh(rho / b.a), 7), tone: 'muted' });
      rows.push(
        { label: 'area A (numerical)', value: `${fmt(area, 7)}  vs πρ² = ${fmt(Math.PI * rho * rho, 7)}` },
        { label: 'K estimated from C: 3(2πρ − C)/(πρ³)', value: fmt((3 * (2 * Math.PI * rho - C)) / (Math.PI * rho ** 3), 5) },
        { label: 'K at the centre', value: fmt(K0, 5), tone: 'muted' },
      );
      if (!ok) warn = warn || 'Some radial geodesics left the drawn surface (or switched charts): make ρ smaller.';
    }
    if (shapeNote(b)) rows.push({ label: 'shape', value: shapeNote(b), tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.warn(warn);
    ctx.setNote(tri
      ? 'Each side is a geodesic. **Gauss–Bonnet** for a geodesic triangle: $\\alpha + \\beta + \\gamma = \\pi + \\iint_\\triangle K\\,dA$. On a sphere the excess is the area over $a^2$ (Girard); on a saddle the angles add to less than π. A surveyor measuring angles could detect the curvature of the Earth — Gauss tried it with three mountain peaks.'
      : 'The gold curve is the set of points at geodesic distance ρ from A. For small ρ, $C = 2\\pi\\rho\\,(1 - K\\rho^2/6 + \\dots)$ and $A = \\pi\\rho^2(1 - K\\rho^2/12 + \\dots)$, so $K = \\lim 3(2\\pi\\rho - C)/(\\pi\\rho^3)$ (Bertrand–Diguet–Puiseux). Positive curvature: less room than in the plane; negative: more.');
  };
  return { update, dispose() { v.clear(); } };
}
const scaleN = (x: V3, k: number): V3 => [x[0] * k, x[1] * k, x[2] * k];

/** a geodesic edge A → B: 3D points, (u, v) points, unit tangent at A and at B (direction of travel) */
function edge(b: Built, A: V2, B: V2): { pts: V3[]; uv: V2[]; d0: V3; d1: V3 } | null {
  const id = b.def.id;
  if (id === 'sphere' || id === 'plane') {
    const P = b.S.r(...A), Q = b.S.r(...B), pts: V3[] = [], uv: V2[] = [];
    const n = 100;
    if (id === 'plane') {
      for (let i = 0; i <= n; i++) { const t = i / n; uv.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); pts.push(b.S.r(...uv[i])); }
      const d = unit(sub3(Q, P));
      return { pts, uv, d0: d, d1: d };
    }
    const a = b.a, om = Math.acos(Math.max(-1, Math.min(1, dot3(P, Q) / (a * a))));
    if (om < 1e-9 || Math.abs(om - Math.PI) < 1e-6) return null;
    let last = A[1];
    for (let i = 0; i <= n; i++) {
      const t = i / n, c0 = Math.sin((1 - t) * om) / Math.sin(om), c1 = Math.sin(t * om) / Math.sin(om);
      const X: V3 = [c0 * P[0] + c1 * Q[0], c0 * P[1] + c1 * Q[1], c0 * P[2] + c1 * Q[2]];
      pts.push(X);
      let vv = Math.atan2(X[1], X[0]); while (vv - last > Math.PI) vv -= 2 * Math.PI; while (vv - last < -Math.PI) vv += 2 * Math.PI; last = vv;
      uv.push([Math.acos(Math.max(-1, Math.min(1, X[2] / a))), vv]);
    }
    const tan = (X: V3, Y: V3, sgn: number) => { const d = dot3(X, Y) / (a * a); return unit(scaleN([Y[0] - d * X[0], Y[1] - d * X[1], Y[2] - d * X[2]], sgn)); };
    return { pts, uv, d0: tan(P, Q, 1), d1: tan(Q, P, -1) };
  }
  const r = geodesicBetween(b.charts[0], A, B);
  if (!r) return null;
  const g0 = localGeometry(b.S, A[0], A[1]);
  const d = directionAt(b.S, A[0], A[1], r.theta);
  const e = r.result.end, g1 = localGeometry(b.S, e.u, e.v);
  return { pts: r.result.points.map((q) => q.p), uv: r.result.points.map((q) => [q.u, q.v] as V2), d0: unit(to3(g0, d)), d1: unit(to3(g1, [e.du, e.dv])) };
}

// ═══ Geodesic deviation: curvature as tidal acceleration ═════════════════════
const deviationDemo: DemoDef = {
  id: 'geometry.deviation', module: 'geometry', title: 'Geodesic deviation and tides',
  topic: 'Geodesic deviation · the Jacobi equation · tidal acceleration · Riemann tensor in general relativity',
  summary: 'Two geodesics that start parallel do not stay parallel on a curved surface: their separation obeys ξ″ + Kξ = 0. In general relativity the same equation, with the Riemann tensor, is the tidal acceleration between freely falling bodies — curvature is what a falling observer can actually feel.',
  tex: '\\frac{D^2\\xi}{ds^2} + K\\,\\xi = 0\\quad\\longrightarrow\\quad \\frac{D^2\\xi^a}{d\\tau^2} = -R^a{}_{bcd}\\,u^b\\xi^c u^d',
  view: 'split3d', animated: true,
  params: [...SHAPE_PARAMS, ...POINT_PARAMS.map((p) => ({ ...p, value: p.key === 'pu' ? 1.5708 : 0 })),
    { key: 'angle', label: 'direction (angle from r_u)', value: 3.1416, min: -Math.PI, max: Math.PI, step: 0.002 },
    { key: 'len', label: 'length', value: 4.2, min: 0.5, max: 30, step: 0.01 },
    { key: 'xi', label: 'initial separation ξ₀', value: 0.08, min: 0.005, max: 0.4, step: 0.001 },
    { key: 'time', label: 'fall time (tides) — press play', value: 0.6, min: 0, max: 1, step: 0.001 }],
  choices: [{ key: 'scene', label: 'Scene', value: 'surface', options: [['surface', 'Two geodesics on a surface'], ['tides', 'A ring of dust falling toward a mass']] }, surfaceChoice('sphere', ['sphere', 'plane', 'saddle', 'pseudosphere', 'torus', 'bump', 'catenoid', 'custom'])],
  input: CUSTOM_INPUT,
  experiments: [
    'Sphere: two geodesics leaving the equator side by side, both heading north, meet at the pole — although neither ever turned. ξ(s) = ξ₀ cos(s/a).',
    'Plane: the separation stays constant. Pseudosphere: it grows like cosh(s/a).',
    'Torus: the geodesics cross regions of positive and negative K; the separation wobbles accordingly and the Jacobi prediction (dashed) follows it.',
    'Tides: a ring of dust released at rest above a mass is stretched along the radial direction and squeezed sideways — that is the Moon’s tidal pull on the oceans. The readouts compute the same tidal numbers from the Riemann tensor of the Schwarzschild metric.',
  ],
  connections: ['geometry.geodesics', 'geometry.riemann', 'geometry.lightcones', 'geometry.compare'],
  accuracy: 'Surface: both geodesics are RK4 integrations; the neighbour starts ξ₀ away along a perpendicular geodesic with its direction parallel-transported. The measured separation is the straight-line distance between corresponding points (equal to the geodesic distance to O(ξ³)). The Jacobi curve solves ξ″ + K(s)ξ = 0 with K sampled along the central geodesic (linear theory). Tides: each dust grain is integrated in exact Newtonian gravity (RK4); the dashed ellipse is the linear tidal prediction; the Schwarzschild Riemann components are computed from the metric by exact symbolic derivatives.',
  create: (ctx) => createDeviation(ctx),
};

function createDeviation(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!, plot = ctx.plot!;
  const mesh = new SurfaceMesh(v);
  let b = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, c0: Curve | null = null, c1: Curve | null = null, c2: Curve | null = null;
  const rungs: Curve[] = [];
  let scene = '';
  // tides
  let mass: ReturnType<View['addSurface']> | null = null, dust: ReturnType<View['addParticles']> | null = null;
  const schw = metricFromExprs([['-(1 - 2 m/r)', '0', '0', '0'], ['0', '1/(1 - 2 m/r)', '0', '0'], ['0', '0', 'r^2', '0'], ['0', '0', '0', 'r^2 sin(theta)^2']].map((r) => r.map((e) => parse(e, { names: ['theta'] }))), ['t', 'r', 'theta', 'phi'], { m: 1 });
  const surfaceScene = () => {
    b = surfaceFromCtx(ctx);
    mesh.visible(true);
    mesh.set(b, 'K', { res: 90, clipK: 4 });
    const [u, w] = followSurfaceChange(ctx, st, b);
    const g = localGeometry(b.S, u, w), s = b.scale;
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(g.r);
    pt.visible(true);
    const th = ctx.params.angle, d = directionAt(b.S, u, w, th), dp = directionAt(b.S, u, w, th + Math.PI / 2);
    const len = ctx.params.len, xi0 = ctx.params.xi * s, h = s * 0.006;
    const main = traceGeodesic(b.charts, { chart: 0, u, v: w, du: d[0], dv: d[1] }, len, { h, maxPoints: 600 });
    // neighbours: walk ±ξ₀ along the perpendicular geodesic, carrying the direction by parallel transport
    const nb = (sgn: number) => {
      const q = geodesicTransport(b.S, { u, v: w, du: dp[0], dv: dp[1] }, d, sgn * xi0, 40);
      if (!q.ok) return null;
      return traceGeodesic(b.charts, { chart: 0, u: q.u, v: q.v, du: q.V[0], dv: q.V[1] }, len, { h, maxPoints: 600 });
    };
    const n1 = nb(1), n2 = nb(-1);
    const L3 = (r: GeodesicResult | null) => (r ? liftGeo(b, r, s * 0.006) : [g.r, g.r]);
    if (!c0) c0 = v.addCurve(L3(main), { color: COLORS.geo, radius: s * 0.008 }); else c0.set(L3(main));
    if (!c1) c1 = v.addCurve(L3(n1), { color: COLORS.alt, radius: s * 0.006 }); else c1.set(L3(n1));
    if (!c2) c2 = v.addCurve(L3(n2), { color: COLORS.alt, radius: s * 0.006 }); else c2.set(L3(n2));
    for (const c of [c0, c1, c2]) c.visible(true);
    // separation vs s (half the distance between the two neighbours, at equal s)
    const sep: [number, number][] = [];
    const m = Math.min(main.points.length, n1?.points.length ?? 0, n2?.points.length ?? 0);
    // signed: the separation vector flips direction when the neighbours cross
    let sign = 1, prev: V3 | null = null;
    for (let i = 0; i < m; i++) {
      const dv = sub3(n1!.points[i].p, n2!.points[i].p);
      if (prev && dot3(dv, prev) < 0) sign = -sign;
      prev = dv;
      sep.push([main.points[i].s, (sign * norm3(dv)) / 2]);
    }
    rungs.forEach((r) => r.visible(false));
    for (let i = 0, k = 0; i < m; i += Math.max(1, Math.floor(m / 14)), k++) {
      const pts: V3[] = [n1!.points[i].p, n2!.points[i].p];
      if (!rungs[k]) rungs.push(v.addCurve(pts, { color: '#e6e9ef', radius: 0 })); else rungs[k].set(pts);
      rungs[k].visible(true);
    }
    // Jacobi prediction with K along the central geodesic
    const Ks = main.points.map((q) => localGeometry(b.S, q.u, q.v).K), Ss = main.points.map((q) => q.s);
    const Kat = (x: number) => { let i = 0; while (i < Ss.length - 2 && Ss[i + 1] < x) i++; const f = (x - Ss[i]) / ((Ss[i + 1] - Ss[i]) || 1); return Ks[i] + f * ((Ks[i + 1] ?? Ks[i]) - Ks[i]); };
    const jac = main.length > 0.01 ? jacobiField(Kat, xi0, 0, main.length, 300) : { s: [0], xi: [xi0], ok: true };
    const ymax = Math.max(xi0 * 1.3, ...sep.map((p) => Math.abs(p[1])), ...jac.xi.map((x) => Math.min(Math.abs(x), 20 * xi0))) * 1.15;
    plot.opts.xLabel = 's'; plot.opts.yLabel = 'ξ(s)';
    plot.setView({ x0: -main.length * 0.04, x1: Math.max(0.1, main.length) * 1.04, y0: -ymax, y1: ymax });
    plot.setDraw((G) => {
      G.line([0, xi0], [main.length, xi0], { color: SERIES[3], width: 1.2, dash: [4, 4] });
      G.text([main.length, xi0], 'flat: ξ₀', { color: SERIES[3], align: 'right', baseline: 'bottom' }, -4, -3);
      G.path(sep, { color: COLORS.alt, width: 4, alpha: 0.75 });
      G.path(jac.s.map((x, i) => [x, jac.xi[i]] as [number, number]), { color: SERIES[4], width: 2, dash: [7, 5] });
      G.text([main.length * 0.02, -ymax * 0.92], 'measured separation (cyan) · Jacobi ξ″ + Kξ = 0 (violet, dashed)', { color: ctx.dark ? '#c9cfdb' : '#2a3040' });
    });
    const sEnd = sep.length ? sep[sep.length - 1] : [0, xi0];
    const jEnd = jac.xi[jac.xi.length - 1];
    const rows: Readout[] = [
      { label: 'K at the start', value: fmt(g.K, 6) },
      { label: `separation at s = ${fmt(sEnd[0], 4)}`, value: `${fmt(sEnd[1], 6)} (measured)` },
      { label: 'Jacobi (linear) prediction', value: fmt(jEnd, 6), tone: 'muted' },
      { label: 'ratio ξ(s)/ξ₀', value: fmt(sEnd[1] / xi0, 6) },
    ];
    if (b.def.id === 'sphere') rows.push({ label: 'exact on a sphere: ξ₀ cos(s/a)', value: fmt(xi0 * Math.cos(sEnd[0] / b.a), 6), tone: 'muted' });
    if (b.def.id === 'pseudosphere') rows.push({ label: 'for K = −1/a²: ξ₀ cosh(s/a)', value: fmt(xi0 * Math.cosh(sEnd[0] / b.a), 6), tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.warn(b.error || (main.stop !== 'done' ? `${main.warning} — the plot ends there.` : ''));
    ctx.setNote('The gold geodesic and its two cyan neighbours start **parallel** (same direction, transported sideways by ξ₀). Nothing pushes them, yet on a curved surface they converge (K > 0) or diverge (K < 0): $\\xi\'\' = -K\\xi$. In general relativity a falling observer feels exactly this — not “gravity”, which free fall cancels, but the *relative* acceleration of nearby free-falling things: $D^2\\xi^a/d\\tau^2 = -R^a{}_{bcd}u^b\\xi^c u^d$. Choose the tides scene to see it.');
  };
  const tidesScene = () => {
    mesh.visible(false); pt?.visible(false); c0?.visible(false); c1?.visible(false); c2?.visible(false); rungs.forEach((r) => r.visible(false));
    const M = 1, r0 = 6, eps = 0.6, N = 48;
    if (!mass) {
      v.setBounds({ x: [-4, 4], y: [-4, 4], z: [-1.5, 7.5] });
      v.resetCamera();
      mass = v.addSurface((a, c) => [Math.sin(a) * Math.cos(c), Math.sin(a) * Math.sin(c), Math.cos(a)], { uRange: [0, Math.PI], vRange: [0, 2 * Math.PI], res: 40, colorBy: 'uniform', color: '#6f7f9a' });
      dust = v.addParticles(N + 1, { color: '#ffe08a', size: 0.12 });
    }
    mass.visible(true); dust!.visible(true);
    // free fall from rest at r0: time to reach r = 1.6 (just above the "surface")
    const tFall = (Math.PI / 2) * Math.sqrt(r0 ** 3 / (2 * M));
    const T = ctx.params.time * 0.93 * tFall;
    const acc = (p: number[]) => { const r = Math.hypot(p[0], p[1], p[2]), k = -M / r ** 3; return [k * p[0], k * p[1], k * p[2]]; };
    const rhs = (_t: number, y: number[]) => { const a = acc(y); return [y[3], y[4], y[5], a[0], a[1], a[2]]; };
    const steps = 400, h = T / steps;
    const run = (p0: V3) => { let y = [p0[0], p0[1], p0[2], 0, 0, 0]; for (let i = 0; i < steps && h > 0; i++) y = rk4Step(rhs, i * h, y, h); return y; };
    const centre = run([0, 0, r0]);
    const pos = new Float32Array((N + 1) * 3), rel: [number, number][] = [];
    for (let k = 0; k < N; k++) {
      const a = (2 * Math.PI * k) / N, p0: V3 = [eps * Math.cos(a), 0, r0 + eps * Math.sin(a)];
      const y = run(p0);
      pos.set([y[0], y[1], y[2]], 3 * k);
      rel.push([(y[0] - centre[0]) / eps, (y[2] - centre[2]) / eps]);
    }
    pos.set([centre[0], centre[1], centre[2]], 3 * N);
    dust!.set(pos, N + 1);
    // linear tidal prediction along the centre's fall: ξ_r″ = 2M/r³ ξ_r, ξ_⊥″ = −M/r³ ξ_⊥
    let lin = [1, 0, 1, 0], yc = [0, 0, r0, 0, 0, 0];
    const rhsC = (_t: number, y: number[]) => { const a = acc(y); return [y[3], y[4], y[5], a[0], a[1], a[2]]; };
    for (let i = 0; i < steps && h > 0; i++) {
      const r = Math.hypot(yc[0], yc[1], yc[2]);
      lin = rk4Step((_t, z) => [z[1], (2 * M / r ** 3) * z[0], z[3], (-M / r ** 3) * z[2]], 0, lin, h);
      yc = rk4Step(rhsC, i * h, yc, h);
    }
    const rNow = Math.hypot(centre[0], centre[1], centre[2]);
    plot.opts.equal = true; plot.opts.xLabel = 'sideways (× ring radius)'; plot.opts.yLabel = 'radial';
    plot.setView({ x0: -2.2, x1: 2.2, y0: -2.2, y1: 2.2 });
    plot.setDraw((G) => {
      G.path(Array.from({ length: 101 }, (_, i) => [Math.cos((2 * Math.PI * i) / 100), Math.sin((2 * Math.PI * i) / 100)] as [number, number]), { color: SERIES[3], width: 1, dash: [3, 4] });
      G.path(Array.from({ length: 101 }, (_, i) => [lin[2] * Math.cos((2 * Math.PI * i) / 100), lin[0] * Math.sin((2 * Math.PI * i) / 100)] as [number, number]), { color: SERIES[4], width: 2, dash: [7, 5] });
      for (const p of rel) G.point(p, 3.5, { color: '#ffe08a' });
      G.arrow([0, -1.9], [0, -1.4], { color: SERIES[2], width: 2 }); G.text([0.08, -1.75], 'toward the mass', { color: SERIES[2] });
    });
    // the same numbers from the Riemann tensor of Schwarzschild spacetime, in the static orthonormal frame
    const Tn = curvatureTensors(schw, [0, rNow, Math.PI / 2, 0]);
    const f = 1 - 2 / rNow;
    const Rr = Tn.Rup[1][0][1][0] / f, Rth = Tn.Rup[2][0][2][0] / f;
    ctx.setReadouts([
      { label: 'distance from the mass r (units GM/c² = 1)', value: fmt(rNow, 5) },
      { label: 'ring: radial stretch, sideways squeeze', value: `${fmt(Math.max(...rel.map((p) => p[1])), 5)},  ${fmt(Math.max(...rel.map((p) => p[0])), 5)}` },
      { label: 'linear tidal prediction', value: `${fmt(lin[0], 5)},  ${fmt(lin[2], 5)}`, tone: 'muted' },
      { label: 'Newton: −∂²Φ/∂r² = +2M/r³ (stretch)', value: fmt(2 / rNow ** 3, 6) },
      { label: 'GR: −R^r̂_t̂r̂t̂ from the metric', value: `${fmt(-Rr, 6)} (exact symbolic)`, tone: 'good' },
      { label: 'Newton: −M/r³ (squeeze)', value: fmt(-1 / rNow ** 3, 6) },
      { label: 'GR: −R^θ̂_t̂θ̂t̂ from the metric', value: `${fmt(-Rth, 6)} (exact symbolic)`, tone: 'good' },
      { label: 'Ricci R_t̂t̂ = Σ R^î_t̂ît̂ (vacuum)', value: fmt(Tn.ricci[0][0], 3), tone: 'muted' },
    ]);
    ctx.warn('');
    ctx.setNote('Dust released at rest on a small ring above a mass (Newtonian gravity, each grain integrated exactly) is **stretched along the radial direction and squeezed sideways** while the whole ring falls. That deformation is all a freely falling observer can detect — the tidal tensor. In general relativity it is the Riemann tensor: in the static orthonormal frame of Schwarzschild spacetime, $R^{\\hat r}{}_{\\hat t\\hat r\\hat t} = -2M/r^3$ and $R^{\\hat\\theta}{}_{\\hat t\\hat\\theta\\hat t} = R^{\\hat\\phi}{}_{\\hat t\\hat\\phi\\hat t} = M/r^3$ — the Newtonian values, computed here from the metric. Their sum (the Ricci component) is zero: in vacuum the ring keeps its volume to first order. (The falling frame differs from the static one by a radial boost, which leaves these components unchanged.)');
  };
  const update = () => {
    if (scene !== ctx.choices.scene) {
      scene = ctx.choices.scene;
      plot.opts.equal = false;
      if (scene === 'surface') { mesh.reset(); mass?.visible(false); dust?.visible(false); }
    }
    if (scene === 'tides') tidesScene(); else surfaceScene();
  };
  let dir = 1;
  return {
    update,
    tick(dt) { if (ctx.choices.scene !== 'tides') return; let t = ctx.params.time + dir * dt * 0.15; if (t > 1) { t = 1; dir = -1; } if (t < 0) { t = 0; dir = 1; } ctx.setParam('time', t); update(); },
    dispose() { v.clear(); },
  };
}

export const geodesicDemos: DemoDef[] = [geodesicsDemo, compareDemo, deviationDemo];
