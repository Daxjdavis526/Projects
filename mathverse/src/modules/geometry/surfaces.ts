// Surfaces: tangent vectors and tangent spaces, the fundamental forms,
// Gaussian and mean curvature, and the Theorema Egregium (bending without
// stretching keeps K and changes H).

import type { DemoDef, DemoCtx, DemoInstance, Readout, StepRow } from '../types';
import type { V3, V2 } from '../../core/numeric/geometry';
import { localGeometry, traceGeodesic, curvatureIntegral, dot3, norm3, sub3 } from '../../core/numeric/geometry';
import { integrate } from '../../core/numeric/quad';
import { SERIES } from '../../engine/colors';
import {
  surfaceChoice, SHAPE_PARAMS, POINT_PARAMS, CUSTOM_INPUT, surfaceFromCtx, buildSurface, SurfaceMesh, ColorBar, ColorBy, Built, clampUV, liftedCurve,
  surfaceDragPoint, followSurfaceChange, fmt, tx, vecTeX, matTeX, COLORS, shapeNote, adhocSurface, geomAt, lift,
} from './lib';

type Arrow = ReturnType<NonNullable<DemoCtx['view3d']>['addArrow']>;
type Curve = ReturnType<NonNullable<DemoCtx['view3d']>['addCurve']>;
type Plane = ReturnType<NonNullable<DemoCtx['view3d']>['addPlane']>;
type Pt = ReturnType<NonNullable<DemoCtx['view3d']>['addPoint']>;

const scaleVec = (w: V3, k: number): V3 => [w[0] * k, w[1] * k, w[2] * k];

// ═══ Tangent vectors and tangent spaces ═══════════════════════════════════════
const surfacesDemo: DemoDef = {
  id: 'geometry.surfaces', module: 'geometry', title: 'Surfaces and tangent spaces',
  topic: 'Curves and surfaces · parametric surfaces · tangent vectors · tangent spaces · normal vectors',
  summary: 'A surface is a map r(u, v) from a parameter plane into space. At each point the velocities ∂r/∂u and ∂r/∂v of the coordinate curves span the tangent plane T_pS; every tangent vector is the velocity of some curve on the surface, and the metric measures it without leaving the surface.',
  tex: 'T_pS = \\operatorname{span}\\{\\mathbf r_u, \\mathbf r_v\\},\\quad \\mathbf n = \\frac{\\mathbf r_u \\times \\mathbf r_v}{|\\mathbf r_u \\times \\mathbf r_v|},\\quad |\\mathbf w|^2 = E\\alpha^2 + 2F\\alpha\\beta + G\\beta^2',
  view: '3d',
  params: [...SHAPE_PARAMS, ...POINT_PARAMS,
    { key: 'alpha', label: 'α (w = α r_u + β r_v)', value: 0.7, min: -2, max: 2, step: 0.01 },
    { key: 'beta', label: 'β', value: 0.5, min: -2, max: 2, step: 0.01 }],
  choices: [surfaceChoice('sphere')],
  toggles: [{ key: 'plane', label: 'Tangent plane T_pS', value: true }, { key: 'basis', label: 'Basis vectors ∂r/∂u, ∂r/∂v', value: true }, { key: 'normal', label: 'Unit normal n', value: true }, { key: 'curves', label: 'Coordinate curves through p', value: true }, { key: 'w', label: 'Tangent vector w and its curve', value: true }],
  input: CUSTOM_INPUT,
  experiments: [
    'Drag the white point. The red and green arrows are the velocities of the red and green coordinate curves through it.',
    'On the sphere, drag the point toward the north pole: **r_v** shrinks to zero and the normal becomes undefined. The sphere is perfectly smooth there — only the *chart* (u, v) fails. See *Coordinate charts*.',
    'Drag the orange tip: any vector in the tangent plane is α r_u + β r_v, the velocity of the orange curve r(u₀ + αt, v₀ + βt) at t = 0.',
    'Compare the two lengths of w in the readouts — one measured in space, one from E, F, G alone. They agree: the metric is all you need to measure on the surface.',
    'Choose **Your surface** and type one, e.g. Enneper’s minimal surface `(u - u^3/3 + u v^2, v - v^3/3 + v u^2, u^2 - v^2); u in [-1.5,1.5]; v in [-1.5,1.5]`.',
  ],
  connections: ['geometry.charts', 'geometry.forms', 'geometry.metric', 'geometry.curves'],
  accuracy: 'Every derivative is exact (symbolic differentiation of r(u, v), evaluated in floating point). Arrows are drawn to scale; when they would be very long a common factor shrinks them, stated in the readouts.',
  tutorial: [
    { text: '**A surface is a map.** Two parameters (u, v) — think latitude and longitude — are sent to points r(u, v) in space. The red curve is where only u changes; the green curve is where only v changes.\n\nRigorously: a *regular parametrized surface* is a smooth map r: U ⊂ ℝ² → ℝ³ whose partial derivatives r_u, r_v are linearly independent at every point.', task: 'Drag the white point somewhere else on the sphere.', set: { choices: { surface: 'sphere' }, params: { a: 1.5, pu: 1.05, pv: 0.5, alpha: 0.7, beta: 0.5 }, toggles: { plane: false, basis: true, normal: false, curves: true, w: false } },
      done: (c) => Math.abs(c.params.pu - 1.05) > 0.2 || Math.abs(c.params.pv - 0.5) > 0.2 },
    { text: '**Velocity vectors of coordinate curves.** The red arrow r_u = ∂r/∂u is the velocity of the red curve; the green arrow r_v = ∂r/∂v is the velocity of the green one. Their lengths depend on the parametrization, not only on the surface: on the sphere |r_v| = a sin u.', task: 'Drag the point close to the north pole (u < 0.2) and watch r_v shrink to nothing. The chart is singular there; the sphere is not.', set: { toggles: { basis: true, curves: true } }, done: (c) => c.params.pu < 0.2 },
    { text: '**The tangent plane.** At a regular point r_u and r_v span a plane: the tangent space T_pS, a 2-dimensional vector space attached at p. The unit normal n = r_u × r_v / |r_u × r_v| is perpendicular to it. Away from p the surface leaves the plane — how fast is what curvature measures.', task: 'Switch to the torus and find a point where the normal points straight up (n_z > 0.98).', set: { choices: { surface: 'torus' }, params: { a: 1.6, b: 0.6, pu: 0.4, pv: 0.9 }, toggles: { plane: true, normal: true } },
      done: (c) => { const b = buildSurface(c.choices.surface, c.params.a, c.params.b, c.input); return c.choices.surface === 'torus' && geomAt(b, c.params.pu, c.params.pv).n[2] > 0.98; } },
    { text: '**Tangent vectors are velocities.** The orange vector w = α r_u + β r_v is the velocity at t = 0 of the orange curve t ↦ r(u₀ + αt, v₀ + βt). Every curve through p has its velocity in T_pS, and every vector of T_pS is such a velocity — that is how a tangent space is *defined* on an abstract manifold, without any surrounding space.', task: 'Drag the orange tip until w points along r_v alone (α ≈ 0).', set: { choices: { surface: 'torus' }, params: { alpha: 0.8, beta: 0.4 }, toggles: { w: true } }, done: (c) => Math.abs(c.params.alpha) < 0.06 && Math.abs(c.params.beta) > 0.25 },
    { text: '**The metric measures tangent vectors.** E = r_u·r_u, F = r_u·r_v, G = r_v·r_v (the first fundamental form, the metric tensor g_ij) give |w|² = Eα² + 2Fαβ + Gβ² — a length computed from the coefficients alone, without looking at space. The readouts show both and they agree.', task: 'On the sphere with w = r_v (α = 0, β = 1), move the point to the equator (u = π/2 ≈ 1.571), where |r_v| is largest.', set: { choices: { surface: 'sphere' }, params: { a: 1.5, alpha: 0, beta: 1, pu: 0.6, pv: 0.4 } }, done: (c) => c.choices.surface === 'sphere' && Math.abs(c.params.pu - Math.PI / 2) < 0.05 && Math.abs(c.params.alpha) < 0.05 },
    { text: '**Your own surface.** Choose “Your surface” and type r(u, v) with an optional domain: e.g. `(u, v, sin(u) cos(v)); u in [-3,3]; v in [-3,3]` or the helicoid `(v cos(u), v sin(u), 0.4 u); u in [-6,6]; v in [-1.5,1.5]`. All derivatives are taken symbolically.', task: 'Choose “Your surface”.', done: (c) => c.choices.surface === 'custom' },
  ],
  create: (ctx) => createSurfaces(ctx),
};

function createSurfaces(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  let b: Built = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, tip: Pt | null = null, plane: Plane | null = null;
  let aU: Arrow | null = null, aV: Arrow | null = null, aN: Arrow | null = null, aW: Arrow | null = null;
  let cU: Curve | null = null, cV: Curve | null = null, cW: Curve | null = null;
  let k = 1, P: V3 = [0, 0, 0], ru: V3 = [1, 0, 0], rv: V3 = [0, 1, 0], nrm: V3 = [0, 0, 1];
  const update = () => {
    b = surfaceFromCtx(ctx);
    ctx.warn(b.error);
    mesh.set(b, 'uniform', { opacity: ctx.toggles.plane ? 0.92 : 1, color: '#5f86c9' });
    const [u, w] = followSurfaceChange(ctx, st, b);
    const g = localGeometry(b.S, u, w);
    P = g.r; ru = g.ru; rv = g.rv; nrm = g.n;
    const s = b.scale;
    const big = Math.max(norm3(ru), norm3(rv));
    k = big > 0.9 * s ? (0.9 * s) / big : 1;
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(P);
    // tangent plane
    if (!plane) plane = v.addPlane(P, nrm, s * 1.1, { color: COLORS.plane, opacity: 0.38 });
    plane.set(P, g.regular ? nrm : [0, 0, 0]); plane.visible(!!ctx.toggles.plane && g.regular);
    const mk = (h: Arrow | null, vec: V3, color: string, label: string) => { if (!h) h = v.addArrow(P, vec, { color, label, radius: s * 0.011 }); else h.set(P, vec); return h; };
    aU = mk(aU, scaleVec(ru, k), COLORS.ru, 'r<sub>u</sub>'); aU.visible(!!ctx.toggles.basis);
    aV = mk(aV, scaleVec(rv, k), COLORS.rv, 'r<sub>v</sub>'); aV.visible(!!ctx.toggles.basis);
    aN = mk(aN, scaleVec(nrm, s * 0.45), COLORS.n, 'n'); aN.visible(!!ctx.toggles.normal && g.regular);
    // coordinate curves (lifted a hair off the surface)
    const off = s * 0.006;
    const line = (which: 'u' | 'v') => { const r = which === 'u' ? b.u : b.v; const out: V2[] = []; for (let i = 0; i <= 160; i++) { const t = r[0] + ((r[1] - r[0]) * i) / 160; out.push(which === 'u' ? [t, w] : [u, t]); } return liftedCurve(b, out, off); };
    const cu = line('u'), cv = line('v');
    if (!cU) cU = v.addCurve(cu, { color: COLORS.ru, radius: s * 0.006 }); else cU.set(cu);
    if (!cV) cV = v.addCurve(cv, { color: COLORS.rv, radius: s * 0.006 }); else cV.set(cv);
    cU.visible(!!ctx.toggles.curves); cV.visible(!!ctx.toggles.curves);
    // the tangent vector w and the curve whose velocity it is
    const al = ctx.params.alpha, be = ctx.params.beta;
    const W: V3 = [al * ru[0] + be * rv[0], al * ru[1] + be * rv[1], al * ru[2] + be * rv[2]];
    aW = mk(aW, scaleVec(W, k), COLORS.vec, 'w'); aW.visible(!!ctx.toggles.w);
    const wuv: V2[] = [];
    for (let i = -60; i <= 60; i++) { const t = (i / 60) * 0.6; wuv.push(clampUV(b, u + al * t, w + be * t)); }
    const wc = liftedCurve(b, wuv, off * 1.5);
    if (!cW) cW = v.addCurve(wc, { color: COLORS.vec, radius: s * 0.007 }); else cW.set(wc);
    cW.visible(!!ctx.toggles.w);
    const tipP: V3 = [P[0] + W[0] * k, P[1] + W[1] * k, P[2] + W[2] * k];
    if (!tip) tip = v.addPoint(tipP, { color: COLORS.vec, size: s * 0.035, drag: {
      constrain: (q) => { const d = sub3(q, P); const t = dot3(d, nrm); return [q[0] - t * nrm[0], q[1] - t * nrm[1], q[2] - t * nrm[2]]; },
      onDrag: (q) => {
        const d = scaleVec(sub3(q, P), 1 / k);
        const E = dot3(ru, ru), F = dot3(ru, rv), G = dot3(rv, rv), D = E * G - F * F;
        const a1 = dot3(d, ru), a2 = dot3(d, rv);
        ctx.setParam('alpha', Math.max(-2, Math.min(2, (G * a1 - F * a2) / D)));
        ctx.setParam('beta', Math.max(-2, Math.min(2, (E * a2 - F * a1) / D)));
        update();
      } } }); else tip.set(tipP);
    tip.visible(!!ctx.toggles.w && g.regular);
    const lenMetric = Math.sqrt(g.E * al * al + 2 * g.F * al * be + g.G * be * be);
    const rows: Readout[] = [
      { label: 'surface', value: b.tex, tex: true },
      { label: 'point (u, v)', value: `(${fmt(u)}, ${fmt(w)})` },
      { label: 'r(u, v)', value: `\\mathbf r = ${vecTeX(P)}`, tex: true },
      { label: 'r_u = ∂r/∂u', value: `${vecTeX(ru)},\\ |\\mathbf r_u| = ${tx(norm3(ru))}`, tex: true },
      { label: 'r_v = ∂r/∂v', value: `${vecTeX(rv)},\\ |\\mathbf r_v| = ${tx(norm3(rv))}`, tex: true },
      { label: 'unit normal n', value: g.regular ? vecTeX(nrm) : '\\text{undefined: } \\mathbf r_u \\times \\mathbf r_v = 0', tex: true, tone: g.regular ? undefined : 'warn' },
      { label: 'metric g = [[E, F], [F, G]]', value: `g_{ij} = ${matTeX([[g.E, g.F], [g.F, g.G]])}`, tex: true },
      { label: '|w| from the metric √(Eα²+2Fαβ+Gβ²)', value: fmt(lenMetric, 8) },
      { label: '|w| measured in space', value: fmt(norm3(W), 8), tone: 'muted' },
    ];
    if (k < 1) rows.push({ label: 'arrows drawn at', value: `${fmt(k, 3)} × true length`, tone: 'muted' });
    if (shapeNote(b)) rows.push({ label: 'shape', value: shapeNote(b), tone: 'muted' });
    ctx.setReadouts(rows);
    if (!g.regular) ctx.warn(b.error || 'Here r_u × r_v = 0: the parametrization is singular, so this chart has no tangent plane at this point. If the surface itself is smooth here (as at a pole of the sphere), another chart does.');
    ctx.setNote(`The tangent space at p is $T_pS = \\operatorname{span}\\{\\mathbf r_u, \\mathbf r_v\\}$. The orange vector $\\mathbf w = ${tx(al, 3)}\\,\\mathbf r_u + ${tx(be, 3)}\\,\\mathbf r_v$ is the velocity of the orange curve $t \\mapsto \\mathbf r(u_0 + \\alpha t, v_0 + \\beta t)$ at $t = 0$. Its length from the metric alone: $|\\mathbf w|^2 = E\\alpha^2 + 2F\\alpha\\beta + G\\beta^2 = ${tx(lenMetric ** 2, 6)}$.`);
  };
  return { update, dispose() { v.clear(); } };
}


// ═══ First and second fundamental forms ═══════════════════════════════════════
const formsDemo: DemoDef = {
  id: 'geometry.forms', module: 'geometry', title: 'First and second fundamental forms',
  topic: 'First and second fundamental forms · normal curvature · principal curvatures · shape operator',
  summary: 'The first fundamental form I = E du² + 2F du dv + G dv² measures lengths on the surface (intrinsic). The second, II = L du² + 2M du dv + N dv², measures how the surface bends away from its tangent plane (extrinsic). Their ratio in a direction is the normal curvature; its extremes are the principal curvatures.',
  tex: 'k_n(\\mathbf t) = \\frac{\\mathrm{II}(\\mathbf t,\\mathbf t)}{\\mathrm{I}(\\mathbf t,\\mathbf t)} = k_1\\cos^2\\theta + k_2\\sin^2\\theta,\\qquad S = \\mathrm{I}^{-1}\\mathrm{II},\\ K = \\det S,\\ H = \\tfrac12\\operatorname{tr} S',
  view: 'split3d',
  params: [...SHAPE_PARAMS, ...POINT_PARAMS, { key: 'theta', label: 'direction θ from e₁ (drag on the plot)', value: 0.6, min: -Math.PI, max: Math.PI, step: 0.005 }],
  choices: [surfaceChoice('torus')],
  toggles: [{ key: 'circle', label: 'Osculating circle of the normal section', value: true }, { key: 'principal', label: 'Principal directions e₁, e₂', value: true }],
  input: CUSTOM_INPUT,
  experiments: [
    'Drag the handle on the plot: the orange direction turns in the tangent plane, and its normal section’s osculating circle grows and shrinks. The extremes are k₁ and k₂ — always in perpendicular directions (Euler).',
    'On the torus, compare a point on the outer equator (both k negative: bowl-like) with one on the inner equator (k₁ > 0 > k₂: saddle-like).',
    'At a saddle point the curve k_n(θ) crosses zero: those two directions are *asymptotic* — the surface does not bend there to second order.',
    'On the sphere the curve is flat: every direction is principal. The point is *umbilic*.',
    'Open the Steps tab: the full computation from r_u, r_v to K and H at this point.',
  ],
  connections: ['geometry.surfaces', 'geometry.curvature', 'geometry.egregium', 'geometry.geodesics'],
  accuracy: 'Exact symbolic derivatives; the fundamental forms, shape operator and curvatures are then computed in floating point (≈1e−13 relative). The orange curve on the surface is a short geodesic (numerical, RK4), whose curvature equals |k_n| because a geodesic has no sideways curvature.',
  create: (ctx) => createForms(ctx),
};

function createForms(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!, plot = ctx.plot!;
  const mesh = new SurfaceMesh(v);
  let b = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, plane: Plane | null = null, a1: Arrow | null = null, a2: Arrow | null = null, aT: Arrow | null = null, aN: Arrow | null = null;
  let circ: Curve | null = null, geo: Curve | null = null;
  plot.opts.xLabel = 'θ'; plot.opts.yLabel = 'k_n(θ)';
  const update = () => {
    b = surfaceFromCtx(ctx);
    mesh.set(b, 'uniform', { color: '#5f86c9' });
    const [u, w] = followSurfaceChange(ctx, st, b);
    const g = localGeometry(b.S, u, w);
    const s = b.scale, th = ctx.params.theta;
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(g.r);
    if (!plane) plane = v.addPlane(g.r, g.n, s * 0.9, { color: COLORS.plane, opacity: 0.3 }); else plane.set(g.r, g.n);
    // direction t = cos θ e1 + sin θ e2
    const d: V2 = [Math.cos(th) * g.dir1[0] + Math.sin(th) * g.dir2[0], Math.cos(th) * g.dir1[1] + Math.sin(th) * g.dir2[1]];
    const T: V3 = [d[0] * g.ru[0] + d[1] * g.rv[0], d[0] * g.ru[1] + d[1] * g.rv[1], d[0] * g.ru[2] + d[1] * g.rv[2]];
    const kn = g.L * d[0] * d[0] + 2 * g.M * d[0] * d[1] + g.N * d[1] * d[1];
    const euler = g.k1 * Math.cos(th) ** 2 + g.k2 * Math.sin(th) ** 2;
    const L = s * 0.55;
    const mk = (h: Arrow | null, vec: V3, color: string, label: string) => { if (!h) h = v.addArrow(g.r, vec, { color, label, radius: s * 0.01 }); else h.set(g.r, vec); return h; };
    a1 = mk(a1, scaleVec(g.e1, L), COLORS.ru, 'e<sub>1</sub>'); a2 = mk(a2, scaleVec(g.e2, L), COLORS.rv, 'e<sub>2</sub>');
    a1.visible(!!ctx.toggles.principal); a2.visible(!!ctx.toggles.principal);
    aT = mk(aT, scaleVec(T, L * 1.15), COLORS.vec, 't');
    aN = mk(aN, scaleVec(g.n, L * 0.7), COLORS.n, 'n');
    // a short geodesic in direction ±t: its curvature vector is normal, of size |k_n|
    const geoPts: V3[] = [];
    for (const sgn of [-1, 1]) {
      const r = traceGeodesic(b.charts, { chart: 0, u, v: w, du: d[0], dv: d[1] }, sgn * s * 0.9, { h: s * 0.004, maxPoints: 200 });
      const pts = r.points.map((q) => q.p);
      if (sgn < 0) geoPts.push(...pts.reverse()); else geoPts.push(...pts.slice(1));
    }
    if (!geo) geo = v.addCurve(geoPts, { color: COLORS.vec, radius: s * 0.007 }); else geo.set(geoPts);
    // osculating circle of the normal section: centre p + n / k_n, in the plane of t and n
    const circPts: V3[] = [];
    if (Math.abs(kn) > 1e-3 / s) {
      const R = 1 / kn, Tn = norm3(T), tt: V3 = [T[0] / Tn, T[1] / Tn, T[2] / Tn];
      const C: V3 = [g.r[0] + g.n[0] * R, g.r[1] + g.n[1] * R, g.r[2] + g.n[2] * R];
      const RR = Math.abs(R), span = Math.min(Math.PI, (3 * s) / RR);
      for (let i = 0; i <= 160; i++) { const a = -span + (2 * span * i) / 160; const c = Math.cos(a), sn = Math.sin(a); circPts.push([C[0] - g.n[0] * R * c + tt[0] * RR * sn, C[1] - g.n[1] * R * c + tt[1] * RR * sn, C[2] - g.n[2] * R * c + tt[2] * RR * sn]); }
    }
    if (!circ) circ = v.addCurve(circPts.length ? circPts : [g.r, g.r], { color: COLORS.alt, radius: s * 0.004 }); else circ.set(circPts.length ? circPts : [g.r, g.r]);
    circ.visible(!!ctx.toggles.circle && circPts.length > 0);
    // the plot: k_n(θ) by Euler's formula, and II/I computed directly
    const klo = Math.min(g.k2, 0), khi = Math.max(g.k1, 0), pad = Math.max(0.15, (khi - klo) * 0.25);
    plot.setView({ x0: -Math.PI * 1.06, x1: Math.PI * 1.06, y0: klo - pad, y1: khi + pad });
    plot.setDraw((G) => {
      G.line([-Math.PI, g.k1], [Math.PI, g.k1], { color: COLORS.ru, width: 1.2, dash: [6, 5] });
      G.line([-Math.PI, g.k2], [Math.PI, g.k2], { color: COLORS.rv, width: 1.2, dash: [6, 5] });
      G.line([-Math.PI, g.H], [Math.PI, g.H], { color: SERIES[4], width: 1.2, dash: [2, 4] });
      G.text([Math.PI, g.k1], 'k₁', { color: COLORS.ru, align: 'right', baseline: 'bottom' }, -4, -3);
      G.text([Math.PI, g.k2], 'k₂', { color: COLORS.rv, align: 'right', baseline: 'top' }, -4, 3);
      G.text([-Math.PI, g.H], 'H', { color: SERIES[4], align: 'left', baseline: 'bottom' }, 4, -3);
      G.fn((x) => g.k1 * Math.cos(x) ** 2 + g.k2 * Math.sin(x) ** 2, { color: SERIES[0], width: 2.4 }, [-Math.PI, Math.PI]);
      for (let i = -12; i <= 12; i++) {
        const x = (i / 12) * Math.PI, dd: V2 = [Math.cos(x) * g.dir1[0] + Math.sin(x) * g.dir2[0], Math.cos(x) * g.dir1[1] + Math.sin(x) * g.dir2[1]];
        G.point([x, g.L * dd[0] ** 2 + 2 * g.M * dd[0] * dd[1] + g.N * dd[1] ** 2], 3, { color: SERIES[1] });
      }
      G.handle({ id: 'th', at: [th, euler], color: COLORS.vec, label: 'k_n', onDrag: ([x]) => { ctx.setParam('theta', Math.max(-Math.PI, Math.min(Math.PI, x))); update(); }, constrain: ([x]) => [x, g.k1 * Math.cos(x) ** 2 + g.k2 * Math.sin(x) ** 2] });
    });
    const S = [[(g.G * g.L - g.F * g.M) / g.detg, (g.G * g.M - g.F * g.N) / g.detg], [(g.E * g.M - g.F * g.L) / g.detg, (g.E * g.N - g.F * g.M) / g.detg]];
    const umb = Math.abs(g.k1 - g.k2) < 1e-6 * (Math.abs(g.k1) + Math.abs(g.k2) + 1e-9);
    ctx.setReadouts([
      { label: 'I (metric, intrinsic)', value: `\\mathrm I = ${matTeX([[g.E, g.F], [g.F, g.G]])}`, tex: true },
      { label: 'II (extrinsic)', value: `\\mathrm{II} = ${matTeX([[g.L, g.M], [g.M, g.N]])}`, tex: true },
      { label: 'shape operator S = I⁻¹ II', value: matTeX(S), tex: true },
      { label: 'principal curvatures k₁, k₂', value: `${fmt(g.k1, 6)},  ${fmt(g.k2, 6)}${umb ? '  (umbilic)' : ''}` },
      { label: 'K = det S = k₁k₂  — intrinsic', value: fmt(g.K, 6), tone: g.K > 1e-12 ? 'good' : g.K < -1e-12 ? 'bad' : 'muted' },
      { label: 'H = ½ tr S  — extrinsic', value: fmt(g.H, 6) },
      { label: `k_n at θ = ${fmt(th, 3)}: II(t,t)/I(t,t)`, value: fmt(kn, 8) },
      { label: 'Euler: k₁cos²θ + k₂sin²θ', value: fmt(euler, 8), tone: 'muted' },
      { label: 'radius of the osculating circle 1/|k_n|', value: fmt(1 / Math.abs(kn)) },
    ]);
    const steps: StepRow[] = [
      { title: 'Tangent vectors', tex: `\\mathbf r_u = ${vecTeX(g.ru)},\\quad \\mathbf r_v = ${vecTeX(g.rv)}` },
      { title: 'First fundamental form', tex: `E = \\mathbf r_u\\cdot\\mathbf r_u = ${tx(g.E, 6)},\\ F = \\mathbf r_u\\cdot\\mathbf r_v = ${tx(g.F, 6)},\\ G = \\mathbf r_v\\cdot\\mathbf r_v = ${tx(g.G, 6)}` },
      { title: 'Unit normal', tex: `\\mathbf n = \\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|} = ${vecTeX(g.n)}` },
      { title: 'Second derivatives', tex: `\\mathbf r_{uu} = ${vecTeX(g.ruu)},\\ \\mathbf r_{uv} = ${vecTeX(g.ruv)},\\ \\mathbf r_{vv} = ${vecTeX(g.rvv)}` },
      { title: 'Second fundamental form', tex: `L = \\mathbf r_{uu}\\cdot\\mathbf n = ${tx(g.L, 6)},\\ M = \\mathbf r_{uv}\\cdot\\mathbf n = ${tx(g.M, 6)},\\ N = \\mathbf r_{vv}\\cdot\\mathbf n = ${tx(g.N, 6)}` },
      { title: 'Gaussian curvature', tex: `K = \\frac{LN - M^2}{EG - F^2} = \\frac{${tx(g.L * g.N - g.M * g.M, 6)}}{${tx(g.detg, 6)}} = ${tx(g.K, 6)}`, rule: 'intrinsic' },
      { title: 'Mean curvature', tex: `H = \\frac{EN - 2FM + GL}{2(EG - F^2)} = ${tx(g.H, 6)}`, rule: 'extrinsic' },
      { title: 'Principal curvatures', tex: `k_{1,2} = H \\pm \\sqrt{H^2 - K} = ${tx(g.k1, 6)},\\ ${tx(g.k2, 6)}` },
    ];
    ctx.setSteps(steps);
    ctx.warn(b.error || (!g.regular ? 'The parametrization is singular at this point (r_u × r_v = 0); move the point.' : ''));
    ctx.setNote(`The orange direction makes angle θ with the principal direction e₁. Its normal curvature is $k_n = \\mathrm{II}(\\mathbf t,\\mathbf t)/\\mathrm I(\\mathbf t,\\mathbf t) = ${tx(kn, 5)}$ — the curvature of the cyan **normal section** (the cut by the plane of t and n), drawn as its osculating circle. Euler's theorem: $k_n = k_1\\cos^2\\theta + k_2\\sin^2\\theta$, so the extremes $k_1, k_2$ occur in perpendicular directions. **I is intrinsic** (a creature living in the surface can measure it); **II is extrinsic** (it needs the normal, i.e. the surrounding space). Sign: II and H change sign if n is flipped; K does not.`);
  };
  return { update, dispose() { v.clear(); } };
}

// ═══ Gaussian and mean curvature ══════════════════════════════════════════════
const curvatureDemo: DemoDef = {
  id: 'geometry.curvature', module: 'geometry', title: 'Gaussian and mean curvature',
  topic: 'Gaussian curvature · mean curvature · principal curvatures · Gauss–Bonnet',
  summary: 'Colour a surface by its Gaussian curvature K = k₁k₂ (intrinsic: red > 0, blue < 0) or its mean curvature H = (k₁ + k₂)/2 (extrinsic). Change the shape and watch the colours respond; integrate K over a closed surface and get 2π times its Euler characteristic, whatever the shape.',
  tex: 'K = k_1k_2 = \\frac{LN - M^2}{EG - F^2}\\ \\text{(intrinsic)},\\quad H = \\frac{k_1 + k_2}{2}\\ \\text{(extrinsic)},\\quad \\iint_S K\\,dA = 2\\pi\\chi(S)',
  view: '3d',
  params: [...SHAPE_PARAMS, ...POINT_PARAMS],
  choices: [surfaceChoice('torus'), { key: 'color', label: 'Colour by', value: 'K', options: [['K', 'Gaussian curvature K (intrinsic)'], ['H', 'Mean curvature H (extrinsic)'], ['k1', 'Principal curvature k₁'], ['k2', 'Principal curvature k₂']] }],
  toggles: [{ key: 'principal', label: 'Principal directions at the point', value: true }, { key: 'bar', label: 'Colour bar', value: true }],
  input: CUSTOM_INPUT,
  experiments: [
    'Torus: the outer half is red (K > 0, bowl-shaped), the inner half blue (K < 0, saddle-shaped), and the top and bottom circles white (K = 0). Change a and b — the total curvature stays exactly 0.',
    'Sphere: shrink it. K = 1/a² grows, but ∫∫K dA stays 4π: Gauss–Bonnet makes the total a topological invariant.',
    'Catenoid: switch to H. It is white everywhere — H = 0, a minimal surface (a soap film between two rings) — yet K < 0.',
    'Cylinder: K = 0 (you can unroll it onto a page without stretching) but H ≠ 0. That is the difference between intrinsic and extrinsic curvature.',
    'Gaussian bump: the top is red, the ring around it blue. The blue ring is what bends geodesics around the bump — see *Geodesics*.',
  ],
  connections: ['geometry.forms', 'geometry.egregium', 'geometry.riemann', 'geometry.transport'],
  accuracy: 'K, H, k₁, k₂ are computed from exact symbolic derivatives (floating point, ≈1e−13). The total curvature and area are numerical (tensor Gauss–Legendre, 40×40 nodes) with an error estimate; at the cone apex K is a delta function the mesh cannot show — see *Parallel transport*.',
  tutorial: [
    { text: '**Curvature as a colour.** Red means K > 0: near such a point the surface lies on one side of its tangent plane, like a bowl. Blue means K < 0: it crosses its tangent plane, like a saddle. On a sphere of radius a every point has K = 1/a².', task: 'Change the radius a of the sphere and watch K = 1/a² in the readouts.', set: { choices: { surface: 'sphere', color: 'K' }, params: { a: 1.5, pu: 1.0, pv: 0.4 } }, done: (c) => Math.abs(c.params.a - 1.5) > 0.3 },
    { text: '**A surface with both signs.** On the torus the outer half is curved like a sphere (K > 0) and the inner half like a saddle (K < 0). On the top and bottom circles one principal curvature vanishes, so K = 0.', task: 'Drag the point to the inner side of the torus, where K < 0.', set: { choices: { surface: 'torus', color: 'K' }, params: { a: 1.6, b: 0.6, pu: 0.4, pv: 0.3 } }, done: (c) => { const b = buildSurface('torus', c.params.a, c.params.b); return c.choices.surface === 'torus' && geomAt(b, c.params.pu, c.params.pv).K < -0.05; } },
    { text: '**Gauss–Bonnet.** Add up K over the whole closed surface: ∫∫K dA = 2πχ, where χ = 2 − 2·(number of holes) is the Euler characteristic. Deform the shape all you like — the red and blue areas trade off exactly. For the torus the total is 0; for any sphere-shaped surface, 4π.', task: 'Change the tube radius b of the torus and check that the total curvature stays 0.', set: { choices: { surface: 'torus' } }, done: (c) => c.choices.surface === 'torus' && Math.abs(c.params.b - 0.6) > 0.15 },
    { text: '**Negative curvature everywhere.** The hyperbolic paraboloid z = b(u² − v²) is a saddle at every point: K = −4b²/(1 + 4b²(u² + v²))². It is most negative at the centre and flattens out far away.', task: 'Drag the point to the centre of the saddle (|u|, |v| < 0.1).', set: { choices: { surface: 'saddle', color: 'K' }, params: { a: 1.5, b: 0.6, pu: 0.8, pv: 0.6 } }, done: (c) => c.choices.surface === 'saddle' && Math.abs(c.params.pu) < 0.1 && Math.abs(c.params.pv) < 0.1 },
    { text: '**Mean curvature is extrinsic.** H = (k₁ + k₂)/2 depends on how the surface sits in space, and its sign flips with the normal. A soap film spanning two rings minimizes area and therefore has H = 0: the catenoid. Note that its K is still negative.', task: 'Colour the catenoid by H.', set: { choices: { surface: 'catenoid', color: 'H' }, params: { a: 0.9, pu: 0.3, pv: 0.35 } }, done: (c) => c.choices.surface === 'catenoid' && c.choices.color === 'H' },
    { text: '**Intrinsic versus extrinsic.** The cylinder has H = −1/(2a) ≠ 0 but K = 0: one principal curvature is zero. You can roll a sheet of paper into a cylinder without stretching it, and K (which only depends on lengths) cannot tell the difference. This is Gauss’s *Theorema Egregium*, the next demonstration.', task: 'Show the cylinder coloured by K, then by H.', set: { choices: { surface: 'cylinder', color: 'K' }, params: { a: 1, pu: 0.3, pv: -0.6 } }, done: (c) => c.choices.surface === 'cylinder' && c.choices.color === 'H' },
  ],
  create: (ctx) => createCurvature(ctx),
};

function classify(K: number, H: number, k1: number, k2: number, scale: number): string {
  const e = 1e-9 / (scale * scale);
  if (Math.abs(k1 - k2) < 1e-7 * (Math.abs(k1) + Math.abs(k2)) + 1e-12) return Math.abs(k1) < e ? 'planar (k₁ = k₂ = 0)' : 'umbilic (k₁ = k₂): sphere-like';
  if (K > e) return 'elliptic (K > 0): bowl-like';
  if (K < -e) return 'hyperbolic (K < 0): saddle-like';
  return Math.abs(H) > e ? 'parabolic (K = 0, H ≠ 0): cylinder-like' : 'planar';
}

function createCurvature(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  const bar = new ColorBar(v);
  let b = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, a1: Arrow | null = null, a2: Arrow | null = null;
  let totKey = '', tot = { K: 0, area: 0, errK: 0 };
  const update = () => {
    b = surfaceFromCtx(ctx);
    const cb = (ctx.choices.color ?? 'K') as ColorBy;
    const range = mesh.set(b, cb, { res: 100, clipK: b.def.id === 'cone' ? 4 : undefined });
    const names: Record<string, string> = { K: 'Gaussian curvature K', H: 'Mean curvature H', k1: 'Principal curvature k₁', k2: 'Principal curvature k₂' };
    if (ctx.toggles.bar) bar.set(names[cb], range[0], range[1], 'coolwarm', cb === 'K' ? 'intrinsic · blue < 0 < red' : 'extrinsic · sign depends on n'); else bar.hide();
    const [u, w] = followSurfaceChange(ctx, st, b);
    const g = localGeometry(b.S, u, w);
    const s = b.scale;
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(g.r);
    const L = s * 0.4;
    if (!a1) a1 = v.addArrow(g.r, scaleVec(g.e1, L), { color: '#ffd166', label: 'e<sub>1</sub>', radius: s * 0.009 }); else a1.set(g.r, scaleVec(g.e1, L));
    if (!a2) a2 = v.addArrow(g.r, scaleVec(g.e2, L), { color: '#9ef0a9', label: 'e<sub>2</sub>', radius: s * 0.009 }); else a2.set(g.r, scaleVec(g.e2, L));
    a1.visible(!!ctx.toggles.principal && g.regular); a2.visible(!!ctx.toggles.principal && g.regular);
    if (totKey !== b.key) { totKey = b.key; tot = curvatureIntegral(b.S, { kind: 'rect', u0: b.u[0], u1: b.u[1], v0: b.v[0], v1: b.v[1] }, 40); }
    const exactK = b.def.K ? b.def.K(u, w, b.a, b.b) : NaN;
    const rows: Readout[] = [
      { label: 'surface', value: b.tex, tex: true },
      { label: 'K at the point (intrinsic)', value: fmt(g.K, 8), tone: g.K > 1e-12 ? 'good' : g.K < -1e-12 ? 'bad' : 'muted' },
    ];
    if (b.def.Ktex) rows.push({ label: 'exact formula', value: `${b.def.Ktex}${Number.isFinite(exactK) ? ` = ${tx(exactK, 8)}` : ''}`, tex: true });
    rows.push(
      { label: 'H at the point (extrinsic)', value: fmt(g.H, 8) },
      { label: 'k₁, k₂', value: `${fmt(g.k1, 6)}, ${fmt(g.k2, 6)}` },
      { label: 'type of point', value: classify(g.K, g.H, g.k1, g.k2, s) },
      { label: '∫∫ K dA over the drawn surface', value: `${fmt(tot.K, 9)} ± ${tot.errK.toExponential(0)} (numerical)` },
      { label: 'area', value: `${fmt(tot.area, 7)} (numerical)`, tone: 'muted' },
    );
    if (b.def.closed) rows.push({ label: 'Gauss–Bonnet: χ = ∫∫K dA / 2π', value: `${fmt(tot.K / (2 * Math.PI), 7)} — exact χ = ${b.def.closed.chi} (genus ${b.def.closed.genus})`, tone: 'good' });
    if (shapeNote(b)) rows.push({ label: 'shape', value: shapeNote(b), tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.warn(b.error || (!g.regular ? 'The parametrization is singular here (r_u × r_v = 0), so curvature cannot be computed in this chart. Move the point.' : ''));
    const cone = b.def.id === 'cone' ? ' The cone is flat (K = 0) everywhere except its apex, where all its curvature is concentrated — the angle deficit 2π(1 − sin α). *Parallel transport* measures it.' : '';
    ctx.setNote(`**K is intrinsic**: it depends only on the metric (Gauss's Theorema Egregium), so a creature confined to the surface can measure it, e.g. from triangle angle sums. **H is extrinsic**: it depends on how the surface sits in space, and changes sign if the normal is flipped. ${b.def.closed ? `This surface is closed, so Gauss–Bonnet gives $\\iint K\\,dA = 2\\pi\\chi = ${b.def.closed.chi === 0 ? '0' : `${b.def.closed.chi * 2}\\pi`}$ whatever a and b are.` : 'This patch has a boundary; Gauss–Bonnet then adds the boundary’s geodesic curvature: $\\iint K\\,dA + \\oint \\kappa_g\\,ds = 2\\pi\\chi$.'}${cone}`);
  };
  return { update, dispose() { bar.dispose(); v.clear(); } };
}

// ═══ Theorema Egregium: bending without stretching ═══════════════════════════
const egregiumDemo: DemoDef = {
  id: 'geometry.egregium', module: 'geometry', title: 'Theorema Egregium: bending without stretching',
  topic: 'Intrinsic vs extrinsic geometry · isometries · Gaussian curvature is intrinsic',
  summary: 'Bend a surface without stretching it — a sheet of paper rolled into a cylinder, a catenoid twisted into a helicoid. Lengths, angles, the metric and K never change; the shape in space, the chord distances and H do.',
  tex: '\\text{isometry: } E, F, G \\text{ unchanged} \\;\\Longrightarrow\\; K = \\frac{\\det \\mathrm{II}}{\\det \\mathrm I} \\text{ unchanged (Gauss, 1827)}',
  view: '3d', animated: true,
  params: [{ key: 't', label: 'bend t (press play)', value: 0.5, min: 0, max: 1, step: 0.001 }, ...POINT_PARAMS.map((p) => ({ ...p, value: p.key === 'pu' ? 0.9 : 0.5 }))],
  choices: [{ key: 'family', label: 'Deformation', value: 'roll', options: [['roll', 'Sheet of paper → cylinder'], ['cathel', 'Catenoid → helicoid']] }, { key: 'color', label: 'Colour by', value: 'checker', options: [['checker', 'Painted grid (follows the material)'], ['K', 'Gaussian curvature K'], ['H', 'Mean curvature H']] }],
  toggles: [{ key: 'pair', label: 'Two marked points: distance along vs through', value: true }],
  experiments: [
    'Press play. The painted squares bend but never stretch: the deformation is an isometry.',
    'Watch E, F, G and K at the white point: constant for every t. H changes (paper) — extrinsic.',
    'The distance between the two marked points *along the surface* stays fixed; the straight-line distance *through space* shrinks. Only the first is intrinsic.',
    'Catenoid → helicoid: every intermediate surface is a minimal surface (H = 0) with the same K at each painted point. Colour by K to see the pattern ride along unchanged.',
  ],
  connections: ['geometry.curvature', 'geometry.forms', 'geometry.metric', 'geometry.riemann'],
  accuracy: 'The families are exact isometries (E, F, G are independent of t, verified in the readouts to ~1e−15). K and H from exact symbolic derivatives. The distance along the surface is the length of the painted coordinate segment, by adaptive quadrature.',
  create: (ctx) => createEgregium(ctx),
};

function egregiumSurface(ctx: DemoCtx): Built {
  const t = ctx.params.t;
  if (ctx.choices.family === 'cathel') {
    const th = (1 - t) * Math.PI / 2;
    return adhocSurface('cathel', 'Catenoid–helicoid', `(cos(b) sinh(v) sin(u) + sin(b) cosh(v) cos(u), -cos(b) sinh(v) cos(u) + sin(b) cosh(v) sin(u), cos(b) u + sin(b) v)`, { b: +th.toFixed(6) }, [-Math.PI, Math.PI], [-1.25, 1.25]);
  }
  const W = 2.6, c = Math.max(1e-4, t * (Math.PI / W) * 0.985);
  return adhocSurface('roll', 'Rolled sheet', '(sin(a u)/a, v, (1 - cos(a u))/a)', { a: +c.toFixed(6) }, [-W, W], [-1.4, 1.4]);
}

function createEgregium(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  const bar = new ColorBar(v);
  let b = egregiumSurface(ctx);
  let fam = '';
  let pt: Pt | null = null, q1: Pt | null = null, q2: Pt | null = null, chord: Curve | null = null, along: Curve | null = null;
  const update = () => {
    b = egregiumSurface(ctx);
    if (fam !== ctx.choices.family) {
      fam = ctx.choices.family;
      mesh.reset();
      v.setBounds(fam === 'roll' ? { x: [-2.8, 2.8], y: [-2.8, 2.8], z: [-0.6, 3.2] } : { x: [-2, 2], y: [-2, 2], z: [-3.2, 3.2] });
    }
    const cb = (ctx.choices.color ?? 'checker') as ColorBy;
    const range = mesh.set(b, cb, { res: 72, fit: false });
    if (cb === 'checker') bar.hide(); else bar.set(cb === 'K' ? 'Gaussian curvature K' : 'Mean curvature H', range[0], range[1], 'coolwarm', cb === 'K' ? 'intrinsic: does not change' : 'extrinsic: changes as it bends');
    const [u, w] = clampUV(b, ctx.params.pu, ctx.params.pv);
    const g = localGeometry(b.S, u, w);
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update, { size: 0.08 }); else pt.set(g.r);
    // two marked points on a u-line: distance along the surface vs through space
    const A: V2 = fam === 'roll' ? [-2.2, -0.9] : [-2.4, 0.6], B: V2 = fam === 'roll' ? [2.2, -0.9] : [2.4, 0.6];
    const pa = b.S.r(...A), pb = b.S.r(...B);
    const len = integrate((x) => { const gg = localGeometry(b.S, x, A[1]); return Math.sqrt(gg.E); }, A[0], B[0], 1e-10);
    const chordLen = norm3(sub3(pb, pa));
    if (!q1) { q1 = v.addPoint(pa, { color: COLORS.vec, size: 0.07 }); q2 = v.addPoint(pb, { color: COLORS.vec, size: 0.07 }); } else { q1.set(pa); q2!.set(pb); }
    const alongPts: V3[] = [];
    for (let i = 0; i <= 120; i++) { const x = A[0] + ((B[0] - A[0]) * i) / 120; const gg = localGeometry(b.S, x, A[1]); alongPts.push(lift(gg.r, gg.n, 0.015)); }
    if (!along) along = v.addCurve(alongPts, { color: COLORS.vec, radius: 0.02 }); else along.set(alongPts);
    if (!chord) chord = v.addCurve([pa, pb], { color: COLORS.alt, radius: 0.012 }); else chord.set([pa, pb]);
    for (const h of [q1, q2!, along, chord]) h.visible(!!ctx.toggles.pair);
    ctx.setReadouts([
      { label: 'bend t', value: fmt(ctx.params.t, 3) },
      { label: 'metric at the white point', value: `E = ${tx(g.E, 10)},\\ F = ${tx(Math.abs(g.F) < 1e-14 ? 0 : g.F, 4)},\\ G = ${tx(g.G, 10)}`, tex: true },
      { label: 'K at the point (intrinsic)', value: fmt(Math.abs(g.K) < 1e-13 ? 0 : g.K, 10), tone: 'good' },
      { label: 'H at the point (extrinsic)', value: fmt(Math.abs(g.H) < 1e-13 ? 0 : g.H, 10), tone: 'warn' },
      { label: 'distance along the surface (orange)', value: `${fmt(len.value, 10)} (numerical)`, tone: 'good' },
      { label: 'distance through space (cyan chord)', value: fmt(chordLen, 10), tone: 'warn' },
    ]);
    ctx.setNote(fam === 'roll'
      ? `$\\mathbf r_t(u, v) = (\\sin(cu)/c,\\ v,\\ (1 - \\cos cu)/c)$ with $c$ growing with t: for every $c$, $E = G = 1$, $F = 0$ — the flat metric of the page. So $K = 0$ throughout, as on the flat sheet, while $H = c/2$ (half the curvature of a cylinder of radius $1/c$) changes. **You cannot roll a sheet into a sphere**: that would change K from 0 to positive, which needs stretching — which is why every flat map of the Earth distorts something.`
      : `$\\mathbf r_\\theta = \\cos\\theta\\,(\\sinh v\\sin u, -\\sinh v\\cos u, u) + \\sin\\theta\\,(\\cosh v\\cos u, \\cosh v\\sin u, v)$. For every θ: $E = G = \\cosh^2 v$, $F = 0$, so $K = -1/\\cosh^4 v$ at each painted point, and $H = 0$ (all minimal). The catenoid (a soap film between rings) and the helicoid (a spiral ramp) are *locally the same surface*, bent differently in space.`);
  };
  let dir = 1;
  return {
    update,
    tick(dt) { let t = ctx.params.t + dir * dt * 0.18; if (t > 1) { t = 1; dir = -1; } if (t < 0) { t = 0; dir = 1; } ctx.setParam('t', t); update(); },
    dispose() { bar.dispose(); v.clear(); },
  };
}

export const surfaceDemos: DemoDef[] = [surfacesDemo, formsDemo, curvatureDemo, egregiumDemo];
