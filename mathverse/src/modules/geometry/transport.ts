// Parallel transport around a closed loop and its holonomy, compared with the
// enclosed curvature (Gauss–Bonnet) and the geodesic curvature of the loop.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../types';
import { localGeometry, parallelTransport, signedAngle, curvatureIntegral, directionAt, cross3, dot3, norm3, V2, V3, TransportResult } from '../../core/numeric/geometry';
import { integrate } from '../../core/numeric/quad';
import {
  surfaceChoice, SHAPE_PARAMS, POINT_PARAMS, CUSTOM_INPUT, surfaceFromCtx, SurfaceMesh, Built, clampUV, surfaceDragPoint, followSurfaceChange,
  fmt, deg, COLORS, shapeNote, lift, wrapPi,
} from './lib';

type View = NonNullable<DemoCtx['view3d']>;
type Arrow = ReturnType<View['addArrow']>;
type Curve = ReturnType<View['addCurve']>;
type Pt = ReturnType<View['addPoint']>;
type Loop = { at(t: number): [number, number, number, number, number, number]; kind: 'circle' | 'parallel'; base: V2 };

const transportDemo: DemoDef = {
  id: 'geometry.transport', module: 'geometry', title: 'Parallel transport and holonomy',
  topic: 'Parallel transport · holonomy · Gauss–Bonnet · covariant derivative along a curve',
  summary: 'Carry a tangent vector around a closed loop without ever turning it relative to the surface. On a flat surface it comes back unchanged; on a curved one it comes back rotated — by exactly the curvature enclosed. Watch the vector travel; read off the holonomy angle and ∫∫K dA.',
  tex: '\\frac{DV^k}{dt} = \\dot V^k + \\Gamma^k_{ij}\\,\\dot x^i V^j = 0,\\qquad \\text{holonomy} = \\iint_D K\\,dA = 2\\pi - \\oint_{\\partial D}\\kappa_g\\,ds\\pmod{2\\pi}',
  view: '3d', animated: true,
  params: [...SHAPE_PARAMS, ...POINT_PARAMS.map((p) => ({ ...p, value: p.key === 'pu' ? 0.785 : 0 })),
    { key: 'rho', label: 'loop radius (circle loops, in u, v units)', value: 0.5, min: 0.02, max: 3, step: 0.005 },
    { key: 'alpha', label: 'initial vector: angle from r_u', value: 0.5, min: -Math.PI, max: Math.PI, step: 0.005 },
    { key: 'prog', label: 'progress around the loop (press play)', value: 1, min: 0, max: 1, step: 0.001 }],
  choices: [surfaceChoice('sphere', ['sphere', 'plane', 'saddle', 'torus', 'cone', 'cylinder', 'pseudosphere', 'bump', 'catenoid', 'custom']), { key: 'loop', label: 'Loop', value: 'parallel', options: [['parallel', 'A parallel (circle of latitude) through the point'], ['circle', 'A circle around the point (in u, v)']] }],
  toggles: [{ key: 'trail', label: 'Trail of transported vectors', value: true }, { key: 'region', label: 'Shade the enclosed region', value: true }],
  input: CUSTOM_INPUT,
  experiments: [
    'Sphere, parallel at colatitude θ₀: press play. The vector returns rotated by 2π(1 − cos θ₀) — the solid angle of the cap. At the equator (a geodesic) it comes back unchanged.',
    'Shrink a circle loop: holonomy / area → K at the centre. Curvature *is* holonomy per unit area.',
    'Saddle: the vector comes back rotated the other way — negative curvature.',
    'Cone, parallel loop: K = 0 everywhere on the cone, yet the vector rotates by the deficit angle 2π(1 − sin α). All the curvature sits at the apex (a cosmic string makes space look exactly like this).',
    'Plane, any loop: nothing happens. Cylinder, parallel loop: nothing either — it is flat.',
    'Foucault’s pendulum: its swing plane is parallel-transported around the latitude circle each day. Set θ₀ = 41.15° (Paris): the plane turns by 2π(1 − cos θ₀) ≡ −2π sin λ.',
  ],
  connections: ['geometry.covariant', 'geometry.compare', 'geometry.curvature', 'geometry.riemann', 'geometry.geodesics'],
  accuracy: 'Numerical: the transport ODE is solved by adaptive Dormand–Prince (relative tolerance 1e−10) with exact Christoffel symbols; |V| should be constant and its drift is shown. ∫∫K dA is Gauss–Legendre quadrature (with an error estimate); ∮κ_g ds is adaptive Gauss–Kronrod. Holonomy is defined modulo 2π; the comparisons are made modulo 2π.',
  tutorial: [
    { text: '**Carrying an arrow without turning it.** Walk around a closed path holding a spear pointing “straight ahead relative to yourself”, never twisting it within the ground you walk on. On a flat field you come home with the spear pointing the way it started. That is parallel transport: the covariant derivative of V along the curve is zero.', task: 'Press play on the flat plane and watch the vector come back unchanged.', set: { choices: { surface: 'plane', loop: 'circle' }, params: { a: 1.5, pu: 0.2, pv: 0, rho: 0.8, alpha: 0.5, prog: 0 }, toggles: { trail: true, region: true } }, done: (c) => c.params.prog > 0.95 },
    { text: '**On a sphere it comes back rotated.** Transport the vector around a circle of latitude at colatitude θ₀. It returns rotated by 2π(1 − cos θ₀). The vector never turned — the *surface* did.', task: 'Move the latitude (u of the point) until the holonomy vanishes: the equator, θ₀ = π/2 ≈ 1.571, which is a geodesic.', set: { choices: { surface: 'sphere', loop: 'parallel' }, params: { a: 1.5, pu: 0.785, pv: 0, alpha: 0.5, prog: 1 } }, done: (c) => c.choices.surface === 'sphere' && Math.abs(c.params.pu - Math.PI / 2) < 0.04 },
    { text: '**Holonomy equals enclosed curvature.** For a loop bounding a region D: holonomy = ∫∫_D K dA (mod 2π). This is the Gauss–Bonnet theorem, and it means the rotation of a vector carried around a *tiny* loop, divided by the loop’s area, is the curvature at that point.', task: 'Use a circle loop on the sphere and shrink the radius below 0.2: holonomy/area → K = 1/a².', set: { choices: { surface: 'sphere', loop: 'circle' }, params: { pu: 1.2, pv: 0.3, rho: 0.7, prog: 1 } }, done: (c) => c.choices.loop === 'circle' && c.params.rho < 0.2 },
    { text: '**Negative curvature turns it the other way.** On a saddle the vector returns rotated in the *opposite* sense to the loop. In the Riemann tensor language: R(X, Y)V measures the failure of transport around an infinitesimal parallelogram.', task: 'Switch to the saddle.', set: { choices: { loop: 'circle' }, params: { rho: 0.6, pu: 0, pv: 0 } }, done: (c) => c.choices.surface === 'saddle' },
    { text: '**Curvature you cannot see.** A cone is flat everywhere except its tip: roll it out and it is a piece of paper. Yet a vector transported around the apex comes back rotated by the deficit angle 2π(1 − sin α). The curvature is concentrated at the apex — the geometry around a straight cosmic string in general relativity is exactly such a cone.', task: 'Choose the cone with a parallel loop.', set: { choices: { loop: 'parallel' }, params: { a: 2, b: 1.2, pu: 0, pv: 1.2, prog: 1 } }, done: (c) => c.choices.surface === 'cone' && c.choices.loop === 'parallel' },
    { text: '**Foucault’s pendulum.** A pendulum’s swing plane is parallel-transported as the Earth carries it around its circle of latitude once a day. Its holonomy 2π(1 − cos θ₀) ≡ −2π sin λ (λ the latitude) is the daily turning of the swing plane relative to the ground: 270° a day in Paris. The same mathematics gives the Berry phase in quantum mechanics.', task: 'On the sphere, set the parallel at colatitude 41.15° (u ≈ 0.718), Paris.', set: { choices: { surface: 'sphere', loop: 'parallel' }, params: { a: 1.5, pu: 0.9, pv: 0, prog: 1 } }, done: (c) => c.choices.surface === 'sphere' && Math.abs(c.params.pu - 0.7182) < 0.01 },
  ],
  create: (ctx) => createTransport(ctx),
};

function makeLoop(b: Built, kind: string, u: number, w: number, rho: number): Loop | null {
  if (kind === 'parallel' && b.def.rot) {
    if (b.def.rot === 'v') return { kind: 'parallel', base: [u, w], at: (t) => [u, w + t, 0, 1, 0, 0] };
    // travel toward −u so that the cap (smaller v: the apex side) lies on the left
    return { kind: 'parallel', base: [u, w], at: (t) => [u - t, w, -1, 0, 0, 0] };
  }
  return { kind: 'circle', base: [u + rho, w], at: (t) => [u + rho * Math.cos(t), w + rho * Math.sin(t), -rho * Math.sin(t), rho * Math.cos(t), -rho * Math.cos(t), -rho * Math.sin(t)] };
}

function createTransport(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  const mesh = new SurfaceMesh(v);
  let b = surfaceFromCtx(ctx);
  const st: { id?: string; pu?: number; pv?: number } = {};
  let pt: Pt | null = null, loopC: Curve | null = null, cur: Arrow | null = null, a0: Arrow | null = null, a1: Arrow | null = null, arc: Curve | null = null;
  let region: ReturnType<View['addSurface']> | null = null;
  const trail: Arrow[] = [];
  let tr: TransportResult | null = null, loop: Loop | null = null, key = '';
  const vec3 = (u: number, w: number, V: V2, L: number): { o: V3; d: V3 } => {
    const g = localGeometry(b.S, u, w);
    const d: V3 = [V[0] * g.ru[0] + V[1] * g.rv[0], V[0] * g.ru[1] + V[1] * g.rv[1], V[0] * g.ru[2] + V[1] * g.rv[2]];
    return { o: g.regular ? lift(g.r, g.n, b.scale * 0.01) : g.r, d: [d[0] * L, d[1] * L, d[2] * L] };
  };
  const at = (t: number): { x: V2; V: V2 } => {
    const T = tr!.t, n = T.length;
    if (t <= T[0]) return { x: tr!.x[0], V: tr!.V[0] };
    if (t >= T[n - 1]) return { x: tr!.x[n - 1], V: tr!.V[n - 1] };
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
    const f = (t - T[lo]) / (T[hi] - T[lo]);
    const p = loop!.at(t);
    return { x: [p[0], p[1]], V: [tr!.V[lo][0] + f * (tr!.V[hi][0] - tr!.V[lo][0]), tr!.V[lo][1] + f * (tr!.V[hi][1] - tr!.V[lo][1])] };
  };
  const drawMoving = () => {
    if (!tr || !loop) return;
    const L = b.scale * 0.32;
    const t = 2 * Math.PI * ctx.params.prog;
    const s = at(t), q = vec3(s.x[0], s.x[1], s.V, L);
    if (!cur) cur = v.addArrow(q.o, q.d, { color: COLORS.vec, label: 'V', radius: b.scale * 0.011 }); else cur.set(q.o, q.d);
    const nT = ctx.toggles.trail ? 24 : 0;
    while (trail.length < 24) trail.push(v.addArrow([0, 0, 0], [0, 0, 0.001], { color: '#a8794f', radius: b.scale * 0.006 }));
    trail.forEach((h, i) => {
      const ti = (2 * Math.PI * i) / 24;
      const on = i < nT && ti <= t + 1e-9;
      h.visible(on);
      if (on) { const si = at(ti), qi = vec3(si.x[0], si.x[1], si.V, L * 0.75); h.set(qi.o, qi.d); }
    });
    a1?.visible(ctx.params.prog > 0.999);
    arc?.visible(ctx.params.prog > 0.999);
  };
  const update = () => {
    b = surfaceFromCtx(ctx);
    mesh.set(b, 'K', { res: 90, clipK: 4, opacity: 0.96 });
    const [u, w] = followSurfaceChange(ctx, st, b);
    const kind = ctx.choices.loop === 'parallel' && b.def.rot ? 'parallel' : 'circle';
    const rho = ctx.params.rho;
    loop = makeLoop(b, kind, u, w, rho);
    const s = b.scale;
    if (!pt) pt = surfaceDragPoint(v, ctx, () => b, update); else pt.set(b.S.r(u, w));
    const base = clampUV(b, loop!.base[0], loop!.base[1]);
    const lgB = localGeometry(b.S, loop!.base[0], loop!.base[1]);
    const V0 = directionAt(b.S, loop!.base[0], loop!.base[1], ctx.params.alpha);
    const k2 = `${b.key}|${kind}|${u}|${w}|${rho}|${ctx.params.alpha}`;
    if (k2 !== key) {
      key = k2;
      tr = parallelTransport(b.S, (t) => { const p = loop!.at(t); return [p[0], p[1], p[2], p[3]]; }, V0, 0, 2 * Math.PI, { maxStep: 2 * Math.PI / 240 });
      // the loop
      const pts: V3[] = [];
      for (let i = 0; i <= 240; i++) { const p = loop!.at((2 * Math.PI * i) / 240); const g = localGeometry(b.S, p[0], p[1]); pts.push(g.regular ? lift(g.r, g.n, s * 0.006) : g.r); }
      if (!loopC) loopC = v.addCurve(pts, { color: COLORS.geo, radius: s * 0.008 }); else loopC.set(pts);
      // the enclosed region: a disc in (u, v) for circle loops; the cap for a parallel on a sphere/cone/polar plane
      const reg = (pp: number, q: number): V3 | null => {
        let uu: number, vv: number;
        if (kind === 'circle') { uu = u + rho * pp * Math.cos(q); vv = w + rho * pp * Math.sin(q); }
        else if (b.def.rot === 'v') { const lo = b.u[0]; uu = lo + (u - lo) * pp; vv = q; }
        else { const lo = b.v[0]; uu = q; vv = lo + (w - lo) * pp; }
        const g = localGeometry(b.S, uu, vv);
        return g.regular ? lift(g.r, g.n, s * 0.004) : g.r;
      };
      const capOk = kind === 'circle' || ['sphere', 'cone', 'polarplane'].includes(b.def.id);
      const ro = { uRange: [0, 1] as [number, number], vRange: [0, 2 * Math.PI] as [number, number], res: 40, colorBy: 'uniform' as const, color: '#ffd166', opacity: 0.35 };
      if (!region) region = v.addSurface(reg, ro); else region.update(reg, ro);
      region.visible(!!ctx.toggles.region && capOk);
    }
    region?.visible(!!ctx.toggles.region && (kind === 'circle' || ['sphere', 'cone', 'polarplane'].includes(b.def.id)));
    // initial and final vectors at the base, and the angle between them
    const L = s * 0.32;
    const Vend = tr!.V[tr!.V.length - 1];
    const q0 = vec3(base[0], base[1], V0, L), q1 = vec3(base[0], base[1], Vend, L);
    if (!a0) a0 = v.addArrow(q0.o, q0.d, { color: '#e6e9ef', label: 'V₀', radius: s * 0.009 }); else a0.set(q0.o, q0.d);
    if (!a1) a1 = v.addArrow(q1.o, q1.d, { color: COLORS.pink, label: 'V(end)', radius: s * 0.009 }); else a1.set(q1.o, q1.d);
    const hol = signedAngle(lgB, V0, Vend);
    const arcPts: V3[] = [];
    const e1 = norm3(q0.d) > 0 ? q0.d.map((x) => x / norm3(q0.d)) as V3 : [1, 0, 0] as V3, nn = lgB.n, e2 = cross3(nn, e1);
    for (let i = 0; i <= 40; i++) { const a = (hol * i) / 40, r = L * 0.55; arcPts.push([q0.o[0] + r * (Math.cos(a) * e1[0] + Math.sin(a) * e2[0]), q0.o[1] + r * (Math.cos(a) * e1[1] + Math.sin(a) * e2[1]), q0.o[2] + r * (Math.cos(a) * e1[2] + Math.sin(a) * e2[2])]); }
    if (!arc) arc = v.addCurve(arcPts, { color: COLORS.pink, radius: s * 0.004 }); else arc.set(arcPts);
    drawMoving();
    // comparisons
    const kg = integrate((t) => {
      const [uu, vv, du, dv, ddu, ddv] = loop!.at(t);
      const g = localGeometry(b.S, uu, vv);
      const c1: V3 = [g.ru[0] * du + g.rv[0] * dv, g.ru[1] * du + g.rv[1] * dv, g.ru[2] * du + g.rv[2] * dv];
      const c2: V3 = [0, 1, 2].map((i) => g.ruu[i] * du * du + 2 * g.ruv[i] * du * dv + g.rvv[i] * dv * dv + g.ru[i] * ddu + g.rv[i] * ddv) as V3;
      const sp = norm3(c1);
      return sp > 0 ? dot3(c2, cross3(g.n, c1)) / (sp * sp) : 0;    // κ_g |c′|
    }, 0, 2 * Math.PI, 1e-10);
    const boundary = wrapPi(2 * Math.PI - kg.value);
    const rows: Readout[] = [
      { label: 'holonomy: angle from V₀ to V(end)', value: `${fmt(hol, 9)} rad = ${deg(hol)}  (numerical)`, tone: 'good' },
      { label: '2π − ∮ κ_g ds  (mod 2π)', value: `${fmt(boundary, 9)}  (∮κ_g ds = ${fmt(kg.value, 8)})` },
    ];
    let area: { K: number; area: number; errK: number } | null = null;
    if (kind === 'circle') area = curvatureIntegral(b.S, { kind: 'disc', cu: u, cv: w, rho }, 32);
    else if (b.def.id === 'sphere') area = curvatureIntegral(b.S, { kind: 'rect', u0: 0, u1: u, v0: 0, v1: 2 * Math.PI }, 32);
    if (area) {
      rows.push({ label: '∫∫ K dA over the enclosed region', value: `${fmt(area.K, 9)} ± ${area.errK.toExponential(0)}  (mod 2π: ${fmt(wrapPi(area.K), 9)})` });
      rows.push({ label: 'holonomy / area  (→ K for small loops)', value: `${fmt(hol / area.area, 6)}   K at the centre: ${fmt(localGeometry(b.S, u, w).K, 6)}`, tone: 'muted' });
    }
    if (kind === 'parallel' && b.def.id === 'sphere') rows.push({ label: 'exact: 2π(1 − cos θ₀)  (mod 2π)', value: `${fmt(2 * Math.PI * (1 - Math.cos(u)), 9)}  (${fmt(wrapPi(2 * Math.PI * (1 - Math.cos(u))), 9)})`, tone: 'muted' });
    if (kind === 'parallel' && b.def.id === 'cone') { const sa = 1 / Math.sqrt(1 + b.b * b.b); rows.push({ label: 'cone: K = 0 on the surface; apex deficit 2π(1 − sin α)', value: `${fmt(2 * Math.PI * (1 - sa), 9)}  (mod 2π: ${fmt(wrapPi(2 * Math.PI * (1 - sa)), 9)})`, tone: 'muted' }); }
    rows.push({ label: '|V| drift (should be 0)', value: `${tr!.normDrift.toExponential(1)} (numerical)`, tone: tr!.normDrift < 1e-7 ? 'good' : 'warn' });
    if (shapeNote(b)) rows.push({ label: 'shape', value: shapeNote(b), tone: 'muted' });
    ctx.setReadouts(rows);
    const notCap = kind === 'parallel' && !['sphere', 'cone', 'polarplane'].includes(b.def.id);
    ctx.warn(b.error || (!lgB.regular ? 'The loop starts at a singular point of the parametrization; move it.' : !tr!.ok ? (tr!.warning ?? 'The transport stopped early.') : ctx.choices.loop === 'parallel' && !b.def.rot ? 'This surface is not a surface of revolution here; using a circle loop instead.' : ''));
    ctx.setNote(`The orange vector is carried around the gold loop with $DV/dt = 0$: in coordinates $\\dot V^k = -\\Gamma^k_{ij}\\dot x^i V^j$. It ends (pink) rotated from where it began (white) by the holonomy. ${kind === 'circle' || b.def.id === 'sphere' ? 'Gauss–Bonnet: for a loop around a region D, holonomy $= \\iint_D K\\,dA = 2\\pi - \\oint \\kappa_g\\,ds$ (mod 2π).' : notCap ? 'This loop goes around the surface rather than around a disc, so there is no enclosed region; still the vector turns relative to the loop’s own tangent by $-\\oint\\kappa_g\\,ds$, and the tangent comes back to itself.' : 'The region bounded by this parallel contains the apex, where all the cone’s curvature sits.'} The same construction defines the Riemann tensor: $R(X,Y)V$ is the holonomy of a tiny loop spanned by X and Y.`);
  };
  let dir = 1;
  return {
    update,
    tick(dt) { let p = ctx.params.prog + dir * dt * 0.12; if (p > 1) { p = 1; dir = -1; } if (p < 0) { p = 0; dir = 1; } ctx.setParam('prog', p); drawMoving(); },
    reset() { ctx.setParam('prog', 0); },
    dispose() { v.clear(); },
  };
}

export const transportDemos: DemoDef[] = [transportDemo];
