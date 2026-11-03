// Calculus III — vectors and curves in space: dot and cross products with
// lines and planes, and vector-valued functions (velocity, acceleration and
// its tangential/normal split, curvature, arc length, osculating circle).

import type { DemoDef, DemoCtx, Readout } from '../types';
import { Node, compile, toTeX } from '../../core/expr';
import { integrate } from '../../core/numeric/quad';
import type { V3 } from '../../engine/viewport3d';
import { fmt, fmtV, deg, clamp, paramSpecs, paramVals, readFormula, addSegments, addTris, dSym, showArrow, cross, dot, norm, unit, addV, scaleV, subV, fitBounds } from './common';

type View3 = NonNullable<DemoCtx['view3d']>;
type Arrow = ReturnType<View3['addArrow']>;
type Point = ReturnType<View3['addPoint']>;
type Plane = ReturnType<View3['addPlane']>;
type Curve = ReturnType<View3['addCurve']>;

// ── vectors: dot, cross, lines and planes ─────────────────────────────────
export const vectors: DemoDef = {
  id: 'calc3.vectors', module: 'calc3', title: 'Dot and cross products, lines and planes',
  topic: 'Vectors in space · dot product · cross product · lines and planes · triple product',
  summary: 'Drag the tips of u, v and w. The dot product measures how much one vector goes along another (projection, angle, work); the cross product is perpendicular to both with length equal to the parallelogram’s area (normal of a plane, torque). Together they build planes n · (r − P) = 0 and decide where lines meet them.',
  tex: '\\mathbf u\\cdot\\mathbf v = |\\mathbf u||\\mathbf v|\\cos\\theta,\\quad |\\mathbf u\\times\\mathbf v| = |\\mathbf u||\\mathbf v|\\sin\\theta,\\quad \\mathbf n\\cdot(\\mathbf r - \\mathbf P) = 0,\\quad \\mathbf r(t) = \\mathbf Q + t\\,\\mathbf w',
  view: '3d',
  params: [
    { key: 'ux', label: 'u_x (drag the red tip)', value: 2, min: -3, max: 3, step: 0.01 }, { key: 'uy', label: 'u_y', value: 0.3, min: -3, max: 3, step: 0.01 }, { key: 'uz', label: 'u_z', value: 0.2, min: -3, max: 3, step: 0.01 },
    { key: 'vx', label: 'v_x (drag the blue tip)', value: 0.8, min: -3, max: 3, step: 0.01 }, { key: 'vy', label: 'v_y', value: 1.8, min: -3, max: 3, step: 0.01 }, { key: 'vz', label: 'v_z', value: 0.6, min: -3, max: 3, step: 0.01 },
    { key: 'wx', label: 'w_x (drag the green tip)', value: -0.6, min: -3, max: 3, step: 0.01 }, { key: 'wy', label: 'w_y', value: 0.4, min: -3, max: 3, step: 0.01 }, { key: 'wz', label: 'w_z', value: 1.7, min: -3, max: 3, step: 0.01 },
    { key: 'h', label: 'height of the line’s base point Q = (0, 0, h)', value: 1.6, min: -3, max: 3, step: 0.01 },
  ],
  choices: [{ key: 'show', label: 'Show', value: 'dot', options: [['dot', 'Dot product: projection and angle'], ['cross', 'Cross product: area and normal'], ['plane', 'Plane spanned by u, v and a line along w'], ['triple', 'Triple product: volume']] }],
  toggles: [{ key: 'phys', label: 'Physics names (force, displacement, torque)', value: false }],
  experiments: [
    'Dot product: make u and v perpendicular — u·v = 0 and the projection shrinks to a point.',
    'Cross product: make v parallel to u — the parallelogram collapses and u × v = 0. Swap their roles to see u × v = −v × u.',
    'Plane and line: drag w until it lies in the plane — the line becomes parallel and never meets the plane (the triple product u × v · w is 0).',
    'Triple product: the volume |u · (v × w)| is unchanged if you cycle u → v → w; its sign tells whether (u, v, w) is right- or left-handed.',
    'Physics: with u = force and v = displacement, u · v is the work done; with v = lever arm r and u = force F, r × F is the torque.',
  ],
  connections: ['calc3.coords', 'calc3.vecfn', 'calc3.gradient'],
  accuracy: 'All quantities are exact formulas evaluated in floating point.',
  create(ctx) {
    const v = ctx.view3d!;
    v.setBounds({ x: [-3, 3], y: [-3, 3], z: [-3, 3] }); v.resetCamera();
    const P = (k: string): V3 => [ctx.params[k + 'x'], ctx.params[k + 'y'], ctx.params[k + 'z']];
    const tipDrag = (k: string) => ({ onDrag: (p: V3) => { ctx.setParam(k + 'x', clamp(p[0], -3, 3)); ctx.setParam(k + 'y', clamp(p[1], -3, 3)); ctx.setParam(k + 'z', clamp(p[2], -3, 3)); update(); } });
    const uA = v.addArrow([0, 0, 0], [1, 0, 0], { color: '#ef6b73', label: 'u' }), vA = v.addArrow([0, 0, 0], [0, 1, 0], { color: '#6aa9ff', label: 'v' }), wA = v.addArrow([0, 0, 0], [0, 0, 1], { color: '#6fcf97', label: 'w' });
    const uT = v.addPoint([1, 0, 0], { color: '#ef6b73', size: 0.1, drag: tipDrag('u') }), vT = v.addPoint([0, 1, 0], { color: '#6aa9ff', size: 0.1, drag: tipDrag('v') }), wT = v.addPoint([0, 0, 1], { color: '#6fcf97', size: 0.1, drag: tipDrag('w') });
    const projA = v.addArrow([0, 0, 0], [1, 0, 0], { color: '#f2c14e', label: 'proj' }), crossA = v.addArrow([0, 0, 0], [0, 0, 1], { color: '#b48cff', label: 'u × v' });
    const faces = addTris(v, '#b48cff', 0.3), lines = addSegments(v, '#e6e9ef');
    const plane: Plane = v.addPlane([0, 0, 0], [0, 0, 1], 6, { color: '#b48cff', opacity: 0.28 });
    const line: Curve = v.addCurve([], { color: '#6fcf97', radius: 0.03 });
    const hit: Point = v.addPoint([0, 0, 0], { color: '#ffffff', size: 0.09, label: 'meets the plane' }), base: Point = v.addPoint([0, 0, 0], { color: '#6fcf97', size: 0.07, label: 'Q' });
    const update = () => {
      const u = P('u'), w = P('v'), z = P('w'), show = ctx.choices.show, phys = ctx.toggles.phys;
      uA.set([0, 0, 0], u); vA.set([0, 0, 0], w); uT.set(u); vT.set(w); wT.set(z);
      const uw = dot(u, w), nu = norm(u), nv = norm(w), c = cross(u, w), area = norm(c);
      const th = nu > 0 && nv > 0 ? Math.acos(clamp(uw / (nu * nv), -1, 1)) : NaN;
      const useW = show === 'plane' || show === 'triple';
      wA.visible(useW); wT.visible(useW);
      if (useW) wA.set(show === 'plane' ? [0, 0, ctx.params.h] : [0, 0, 0], z);
      projA.visible(show === 'dot'); crossA.visible(show === 'cross' || show === 'plane');
      plane.visible(show === 'plane'); line.visible(show === 'plane'); hit.visible(false); base.visible(show === 'plane');
      const segs: number[] = [], tris: number[] = [];
      const rows: Readout[] = [{ label: phys ? 'u (force F)' : 'u', value: fmtV(u) }, { label: phys ? (show === 'cross' ? 'v (lever arm r)' : 'v (displacement d)') : 'v', value: fmtV(w) }];
      let note = '';
      if (show === 'dot') {
        const pr = nu > 0 ? scaleV(u, uw / (nu * nu)) : [0, 0, 0] as V3;
        projA.set([0, 0, 0], pr);
        segs.push(...w, ...pr);
        for (let i = 0; i < 20; i++) { const a = unit(u), b = unit(subV(w, scaleV(a, dot(w, a)))), r = 0.5; const t0 = (th * i) / 20, t1 = (th * (i + 1)) / 20; segs.push(...addV(scaleV(a, r * Math.cos(t0)), scaleV(b, r * Math.sin(t0))), ...addV(scaleV(a, r * Math.cos(t1)), scaleV(b, r * Math.sin(t1)))); }
        rows.push({ label: phys ? 'work W = F · d' : 'u · v', value: fmt(uw, 6), tone: Math.abs(uw) < 1e-9 ? 'good' : undefined },
          { label: '|u| |v| cos θ', value: fmt(nu * nv * Math.cos(th), 6) },
          { label: 'angle θ', value: `${fmt(deg(th), 5)}°` },
          { label: 'scalar projection of v on u', value: fmt(nu > 0 ? uw / nu : NaN, 6) },
          { label: 'vector projection (gold)', value: fmtV(nu > 0 ? scaleV(u, uw / (nu * nu)) : [NaN, NaN, NaN]) });
        note = phys ? 'Only the component of the displacement **along the force** does work: $W = \\mathbf F\\cdot\\mathbf d = |\\mathbf F|\\,|\\mathbf d|\\cos\\theta$. The gold arrow is that component.' : 'The gold arrow is the projection of $\\mathbf v$ onto $\\mathbf u$: $\\operatorname{proj}_{\\mathbf u}\\mathbf v = \\frac{\\mathbf u\\cdot\\mathbf v}{|\\mathbf u|^2}\\mathbf u$. The dot product is positive when the angle is acute, zero at 90°, negative when obtuse.';
      } else if (show === 'cross') {
        crossA.set([0, 0, 0], c);
        tris.push(0, 0, 0, ...u, ...addV(u, w), 0, 0, 0, ...addV(u, w), ...w);
        segs.push(...u, ...addV(u, w), ...w, ...addV(u, w));
        rows.push({ label: phys ? 'torque τ = r × F' : 'u × v', value: fmtV(phys ? scaleV(c, -1) : c) },
          { label: phys ? '|τ| = |r||F| sin θ' : '|u × v| = area of the parallelogram', value: fmt(area, 6) },
          { label: '|u| |v| sin θ', value: fmt(nu * nv * Math.sin(th), 6) },
          { label: '(u × v) · u  and  (u × v) · v', value: `${fmt(dot(c, u), 3)}, ${fmt(dot(c, w), 3)}`, tone: 'muted' });
        note = phys ? 'Torque about the origin is $\\boldsymbol\\tau = \\mathbf r\\times\\mathbf F$ (here $\\mathbf r = \\mathbf v$, $\\mathbf F = \\mathbf u$, so $\\boldsymbol\\tau = -\\mathbf u\\times\\mathbf v$): perpendicular to both, largest when the force is at right angles to the lever.' : '$\\mathbf u\\times\\mathbf v$ (violet) is perpendicular to both vectors, follows the right-hand rule, and its length is the area of the parallelogram they span. It is zero exactly when $\\mathbf u \\parallel \\mathbf v$.';
      } else if (show === 'plane') {
        const Q: V3 = [0, 0, ctx.params.h];
        crossA.set([0, 0, 0], area > 0 ? scaleV(c, 1.4 / area) : [0, 0, 0]);
        plane.set([0, 0, 0], c);
        base.set(Q);
        const nw = dot(c, z), nq = dot(c, Q);
        line.set([addV(Q, scaleV(z, -6 / Math.max(norm(z), 1e-9))), addV(Q, scaleV(z, 6 / Math.max(norm(z), 1e-9)))].map((p) => p.map((x) => clamp(x, -3.5, 3.5)) as V3));
        const dist = area > 0 ? Math.abs(nq) / area : NaN;
        rows.push({ label: 'normal n = u × v', value: fmtV(c) }, { label: 'plane', value: `${fmt(c[0], 4)} x + ${fmt(c[1], 4)} y + ${fmt(c[2], 4)} z = 0` }, { label: 'line', value: `r(t) = (0, 0, ${fmt(ctx.params.h, 3)}) + t ${fmtV(z)}` });
        if (Math.abs(nw) > 1e-9 * area * norm(z)) {
          const t = -nq / nw, X = addV(Q, scaleV(z, t));
          hit.set(X); hit.visible(true);
          const ang = deg(Math.asin(clamp(Math.abs(nw) / (area * norm(z)), 0, 1)));
          rows.push({ label: 'meets the plane at', value: `t = ${fmt(t, 5)}, ${fmtV(X, 4)}`, tone: 'good' }, { label: 'angle between line and plane', value: `${fmt(ang, 5)}°` });
        } else rows.push({ label: 'line vs plane', value: Math.abs(nq) < 1e-9 ? 'the line lies in the plane' : 'parallel — no intersection', tone: 'warn' });
        rows.push({ label: 'distance from Q to the plane |n·Q|/|n|', value: fmt(dist, 6) });
        if (area > 0) { const foot = subV(Q, scaleV(c, nq / (area * area))); segs.push(...Q, ...foot); }
        note = 'The plane through the origin spanned by $\\mathbf u$ and $\\mathbf v$ has normal $\\mathbf n = \\mathbf u\\times\\mathbf v$, so its equation is $n_1x + n_2y + n_3z = 0$. The line $\\mathbf Q + t\\mathbf w$ meets it where $\\mathbf n\\cdot(\\mathbf Q + t\\mathbf w) = 0$, i.e. $t = -\\mathbf n\\cdot\\mathbf Q/\\mathbf n\\cdot\\mathbf w$ — impossible exactly when $\\mathbf n\\cdot\\mathbf w = 0$, the line is parallel.';
      } else {
        const V = dot(u, cross(w, z));
        wA.set([0, 0, 0], z);
        const corners = (a: number, b: number, d: number): V3 => addV(addV(scaleV(u, a), scaleV(w, b)), scaleV(z, d));
        const quad = (p: V3, q: V3, r: V3, s: V3) => tris.push(...p, ...q, ...r, ...p, ...r, ...s);
        quad(corners(0, 0, 0), corners(1, 0, 0), corners(1, 1, 0), corners(0, 1, 0)); quad(corners(0, 0, 1), corners(1, 0, 1), corners(1, 1, 1), corners(0, 1, 1));
        quad(corners(0, 0, 0), corners(1, 0, 0), corners(1, 0, 1), corners(0, 0, 1)); quad(corners(0, 1, 0), corners(1, 1, 0), corners(1, 1, 1), corners(0, 1, 1));
        quad(corners(0, 0, 0), corners(0, 1, 0), corners(0, 1, 1), corners(0, 0, 1)); quad(corners(1, 0, 0), corners(1, 1, 0), corners(1, 1, 1), corners(1, 0, 1));
        for (const [a, b, d] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) for (const [p, q] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const s0 = a ? corners(0, p, q) : b ? corners(p, 0, q) : corners(p, q, 0), s1 = a ? corners(1, p, q) : b ? corners(p, 1, q) : corners(p, q, 1);
          segs.push(...s0, ...s1); void d;
        }
        rows.push({ label: 'w', value: fmtV(z) }, { label: 'u · (v × w)', value: fmt(V, 6), tone: V > 0 ? 'good' : V < 0 ? 'warn' : 'muted' }, { label: 'volume of the parallelepiped', value: fmt(Math.abs(V), 6) }, { label: 'det [u; v; w]', value: fmt(u[0] * (w[1] * z[2] - w[2] * z[1]) - u[1] * (w[0] * z[2] - w[2] * z[0]) + u[2] * (w[0] * z[1] - w[1] * z[0]), 6) }, { label: 'orientation', value: V > 0 ? 'right-handed' : V < 0 ? 'left-handed' : 'flat (coplanar)' });
        note = 'The scalar triple product $\\mathbf u\\cdot(\\mathbf v\\times\\mathbf w) = \\det[\\mathbf u;\\mathbf v;\\mathbf w]$ is the signed volume of the parallelepiped. It is zero exactly when the three vectors lie in one plane.';
      }
      faces.set(tris); faces.handle.visible(tris.length > 0);
      lines.set(segs);
      ctx.setReadouts(rows);
      ctx.setNote(note);
      ctx.warn(nu < 1e-9 || nv < 1e-9 ? 'A zero vector has no direction: the angle is undefined.' : '');
    };
    return { update, dispose() { v.clear(); } };
  },
};

// ── vector-valued functions ────────────────────────────────────────────────
export const vecfn: DemoDef = {
  id: 'calc3.vecfn', module: 'calc3', title: 'Vector-valued functions: velocity, acceleration, curvature',
  topic: 'Vector-valued functions · derivatives and integrals of curves · arc length · curvature',
  summary: 'A particle moving along r(t) has velocity r′(t), tangent to the path, and acceleration r″(t). The acceleration splits into a tangential part (speeding up) and a normal part v²κ pointing toward the centre of the osculating circle (turning).',
  tex: '\\mathbf a = \\frac{d|\\mathbf v|}{dt}\\,\\mathbf T + \\kappa|\\mathbf v|^2\\,\\mathbf N,\\qquad \\kappa = \\frac{|\\mathbf r\'\\times\\mathbf r\'\'|}{|\\mathbf r\'|^3},\\qquad s(t) = \\int_{t_0}^{t}|\\mathbf r\'(\\tau)|\\,d\\tau',
  view: '3d', animated: true,
  params: [
    { key: 't', label: 't (now; press play)', value: 1, min: -20, max: 20, step: 0.001 },
    { key: 't0', label: 't from', value: 0, min: -20, max: 20, step: 0.01 },
    { key: 't1', label: 't to', value: 12.566, min: -20, max: 20, step: 0.01 },
    ...paramSpecs(0.25, 1),
  ],
  toggles: [{ key: 'split', label: 'Split a into tangential and normal parts', value: true }, { key: 'circle', label: 'Osculating circle', value: true }],
  input: { label: 'r(t) = (x(t), y(t), z(t))', value: '(b cos(t), b sin(t), a t)', placeholder: '(cos t, sin t, t/4)' },
  experiments: [
    'On the helix the speed is constant: the tangential acceleration is 0 and all acceleration points to the axis.',
    'Projectile: (t, 0, 3t - t^2) — the acceleration is constant (0, 0, −2), but its split into T and N parts changes along the path.',
    'Trefoil knot: (sin(t) + 2 sin(2t), cos(t) - 2 cos(2t), -sin(3t)) — watch the osculating circle shrink in the tight turns.',
    'Circular motion check: on (b cos t, b sin t, 0), a_N = v²/R with R = b.',
  ],
  connections: ['calc3.chain', 'calc3.lineint', 'calc3.vectors'],
  accuracy: 'r′, r″ are exact symbolic derivatives; T, N, κ, a_T, a_N follow from them by exact formulas. Arc length is adaptive Gauss–Kronrod quadrature (error shown). Arrows are drawn at one common scale (stated in the note).',
  create(ctx) {
    const v = ctx.view3d!;
    let src = '', comp: { r: Node[]; d1: (Node | null)[]; d2: (Node | null)[] } | null = null, err = '';
    const st = { fitted: false };
    let o: { curve: Curve; pt: Point; vA: Arrow; aA: Arrow; aT: Arrow; aN: Arrow; circ: Curve } | null = null;
    let curveKey = '';
    const update = () => {
      if (ctx.input !== src) {
        src = ctx.input;
        const r = readFormula(src, ['t'], 3, 'a space curve (x(t), y(t), z(t))');
        if (r.items) { const d1 = r.items.map((n) => dSym(n, 't')); comp = { r: r.items, d1, d2: d1.map((n) => dSym(n, 't')) }; err = ''; } else err = r.error;
      }
      ctx.warn(err);
      if (!comp) return;
      const pv = paramVals(ctx.params);
      const R = comp.r.map((n) => compile(n, ['t'], pv));
      const h = 1e-4;
      const D1 = comp.d1.map((n, k) => (n ? compile(n, ['t'], pv) : (a: ArrayLike<number>) => (R[k]([a[0] + h]) - R[k]([a[0] - h])) / (2 * h)));
      const D2 = comp.d2.map((n, k) => (n ? compile(n, ['t'], pv) : (a: ArrayLike<number>) => (D1[k]([a[0] + h]) - D1[k]([a[0] - h])) / (2 * h)));
      const at = (fs: typeof R, s: number): V3 => [fs[0]([s]), fs[1]([s]), fs[2]([s])];
      const t0 = Math.min(ctx.params.t0, ctx.params.t1), t1 = Math.max(ctx.params.t0, ctx.params.t1), t = clamp(ctx.params.t, t0, t1);
      const pts: V3[] = [];
      let m = 1, vmax = 1e-9, amax = 1e-9;
      for (let i = 0; i <= 600; i++) {
        const s = t0 + ((t1 - t0) * i) / 600, p = at(R, s);
        pts.push(p);
        if (p.every(Number.isFinite)) m = Math.max(m, ...p.map(Math.abs));
        if (i % 6 === 0) { const a = norm(at(D1, s)), b = norm(at(D2, s)); if (Number.isFinite(a)) vmax = Math.max(vmax, a); if (Number.isFinite(b)) amax = Math.max(amax, b); }
      }
      fitBounds(v, { x: [-m * 1.15, m * 1.15], y: [-m * 1.15, m * 1.15], z: [-m * 1.15, m * 1.15] }, st);
      const P = at(R, t), V = at(D1, t), A = at(D2, t);
      const sp = norm(V), T = unit(V), vxa = cross(V, A), kap = norm(vxa) / sp ** 3;
      const aT = dot(A, T), aNv = subV(A, scaleV(T, aT)), aN = norm(aNv), N = unit(aNv);
      const sc = (0.55 * m) / Math.max(vmax, amax);
      if (!o) o = {
        curve: v.addCurve(pts, { color: '#6aa9ff' }), pt: v.addPoint(P, { color: '#ffffff' }),
        vA: v.addArrow(P, V, { color: '#4fd1d9', label: 'v' }), aA: v.addArrow(P, A, { color: '#ef6b73', label: 'a' }),
        aT: v.addArrow(P, A, { color: '#ff9f5a', label: 'a_T T' }), aN: v.addArrow(P, A, { color: '#e879c6', label: 'a_N N' }),
        circ: v.addCurve([], { color: '#f2c14e', radius: m * 0.006 }),
      };
      if (curveKey !== `${src}|${pv.a}|${pv.b}|${t0}|${t1}`) { curveKey = `${src}|${pv.a}|${pv.b}|${t0}|${t1}`; o.curve.set(pts); }
      o.pt.set(P);
      showArrow(o.vA, P, scaleV(V, sc)); showArrow(o.aA, P, scaleV(A, sc));
      showArrow(o.aT, P, scaleV(T, aT * sc), !!ctx.toggles.split); showArrow(o.aN, P, scaleV(N, aN * sc), !!ctx.toggles.split);
      if (ctx.toggles.circle && kap > 1e-9 && 1 / kap < 20 * m) {
        const C = addV(P, scaleV(N, 1 / kap)), rr = 1 / kap;
        const circ: V3[] = [];
        for (let i = 0; i <= 120; i++) { const q = (2 * Math.PI * i) / 120; circ.push(addV(C, addV(scaleV(T, rr * Math.sin(q)), scaleV(N, -rr * Math.cos(q))))); }
        o.circ.set(circ); o.circ.visible(true);
      } else o.circ.visible(false);
      const L = integrate((s) => norm(at(D1, s)), t0, t, 1e-10);
      const tau = norm(vxa) > 1e-12 ? dot(vxa, at(D2.map((_, k) => (a: ArrayLike<number>) => (D2[k]([a[0] + h]) - D2[k]([a[0] - h])) / (2 * h)), t)) / norm(vxa) ** 2 : 0;
      const rows: Readout[] = [
        { label: 'r(t)', value: fmtV(P, 4) },
        { label: 'v = r′(t)', value: fmtV(V, 4) },
        { label: 'speed |v|', value: fmt(sp, 6) },
        { label: 'a = r″(t)', value: fmtV(A, 4) },
        { label: 'tangential a_T = v·a/|v|', value: fmt(aT, 6), tone: Math.abs(aT) < 1e-9 ? 'muted' : aT > 0 ? 'good' : 'warn' },
        { label: 'normal a_N = |v × a|/|v|', value: fmt(aN, 6) },
        { label: 'κ|v|²  (should equal a_N)', value: fmt(kap * sp * sp, 6), tone: 'muted' },
        { label: 'curvature κ  /  radius 1/κ', value: `${fmt(kap, 5)}  /  ${fmt(1 / kap, 5)}` },
        { label: 'torsion τ (numerical r‴)', value: fmt(tau, 4), tone: 'muted' },
        { label: `arc length from t = ${fmt(t0, 3)}`, value: `${fmt(L.value, 10)} ± ${L.error.toExponential(1)}` },
      ];
      if (comp.d1.every(Boolean)) rows.push({ label: 'r′(t)', value: `\\left(${comp.d1.map((n) => toTeX(n!)).join(',\\ ')}\\right)`, tex: true });
      ctx.setReadouts(rows);
      ctx.setNote(`Velocity (cyan) is tangent to the path; acceleration (red) splits into $a_T\\mathbf T$ (orange, changes the speed) and $a_N\\mathbf N$ (pink, turns the motion toward the centre of the gold osculating circle of radius $1/\\kappa = ${fmt(1 / kap, 4)}$). All arrows are drawn at ${fmt(sc, 3)}× their true length.`);
      if (sp < 1e-10) ctx.warn('The velocity is zero here: the curve has a cusp or the particle stops, and T, N, κ are undefined.');
    };
    let dir = 1;
    return {
      update,
      tick(dt) { const t0 = Math.min(ctx.params.t0, ctx.params.t1), t1 = Math.max(ctx.params.t0, ctx.params.t1); let t = ctx.params.t + dir * dt * (t1 - t0) / 14; if (t > t1) { t = t1; dir = -1; } if (t < t0) { t = t0; dir = 1; } ctx.setParam('t', t); update(); },
      dispose() { v.clear(); },
    };
  },
};
