// Curvature Explorer: drive a little rover over curved surfaces (keyboard or
// drag). It carries its tangent heading T and the surface normal n; the
// surface is painted by Gaussian curvature and the readouts give K, H, the
// principal curvatures and the normal curvature straight ahead.

import type { DemoDef, DemoCtx, DemoInstance, Readout } from '../modules/types';
import type { V3 } from '../engine/viewport3d';
import { SERIES } from '../engine/colors';
import { parse, compile, derivative, Node } from '../core/expr';
import {
  surfaceCurvature, normalCurvature, tangentToParams, pointType, roverStep, turn, RoverState, RoverSurface,
  add3, scale3, cross3, unit3, norm3, dot3, Curvature,
} from '../core/numeric/fidget';
import { addSegments, fmt, tx, ping, keyboard } from './common';

interface SurfDef {
  label: string;
  r: [string, string, string];
  u: [number, number]; v: [number, number];
  /** graph z = f(x, y): parameters are x and y */
  graph?: boolean;
  /** swap u and v when computing the normal (so it points outward) */
  swap?: boolean;
  project: (p: V3) => [number, number];
  bounds: { x: [number, number]; y: [number, number]; z: [number, number] };
  start: [number, number];
}

const PI = Math.PI;
const clampTo = (x: number, r: [number, number]) => Math.max(r[0], Math.min(r[1], x));
const G = 2.6;           // half-width of graph domains
const graph = (label: string, z: string, zr: number): SurfDef => ({
  label, r: ['u', 'v', z], u: [-G, G], v: [-G, G], graph: true,
  project: (p) => [clampTo(p[0], [-G, G]), clampTo(p[1], [-G, G])],
  bounds: { x: [-G, G], y: [-G, G], z: [-zr, zr] }, start: [0.9, -0.6],
});
const SURFS: Record<string, SurfDef> = {
  hill: graph('Gaussian hill  z = 1.6·exp(−(x² + y²)/2)', '1.6*exp(-(u^2+v^2)/2)', 2),
  bowl: graph('Bowl  z = (x² + y²)/3', '(u^2+v^2)/3', 2.5),
  saddle: graph('Saddle  z = (x² − y²)/3', '(u^2-v^2)/3', 2.5),
  monkey: graph('Monkey saddle  z = (x³ − 3xy²)/6', '(u^3-3*u*v^2)/6', 2.5),
  eggcrate: graph('Egg crate  z = 0.6 sin x sin y', '0.6*sin(u)*sin(v)', 2),
  torus: {
    label: 'Torus (R = 2, r = 0.8)', r: ['(2+0.8*cos(v))*cos(u)', '(2+0.8*cos(v))*sin(u)', '0.8*sin(v)'], u: [-PI, PI], v: [-PI, PI],
    project: (p) => [Math.atan2(p[1], p[0]), Math.atan2(p[2], Math.hypot(p[0], p[1]) - 2)],
    bounds: { x: [-3, 3], y: [-3, 3], z: [-1.5, 1.5] }, start: [0, 0.6],
  },
  sphere: {
    label: 'Sphere (R = 2)', r: ['2*sin(v)*cos(u)', '2*sin(v)*sin(u)', '2*cos(v)'], u: [-PI, PI], v: [0, PI], swap: true,
    project: (p) => [Math.atan2(p[1], p[0]), Math.acos(clampTo(p[2] / (Math.hypot(...p) || 1), [-1, 1]))],
    bounds: { x: [-2.5, 2.5], y: [-2.5, 2.5], z: [-2.5, 2.5] }, start: [0, 1.2],
  },
  cylinder: {
    label: 'Cylinder (R = 1.5)', r: ['1.5*cos(u)', '1.5*sin(u)', 'v'], u: [-PI, PI], v: [-2, 2],
    project: (p) => [Math.atan2(p[1], p[0]), clampTo(p[2], [-2, 2])],
    bounds: { x: [-2.5, 2.5], y: [-2.5, 2.5], z: [-2.5, 2.5] }, start: [0, 0],
  },
};

/** exact r and its first and second partial derivatives, compiled */
function compileSurface(S: SurfDef) {
  const comps = S.r.map((s) => parse(s));
  const d = (n: Node, a: string) => derivative(n, a);
  const sets = comps.map((c) => {
    const cu = d(c, 'u'), cv = d(c, 'v');
    return [c, cu, cv, d(cu, 'u'), d(cu, 'v'), d(cv, 'v')].map((n) => compile(n, ['u', 'v']));
  });
  const buf = [0, 0];
  const ev = (k: number) => (u: number, v: number): V3 => { buf[0] = u; buf[1] = v; return [sets[0][k](buf), sets[1][k](buf), sets[2][k](buf)]; };
  const r = ev(0), ru = ev(1), rv = ev(2), ruu = ev(3), ruv = ev(4), rvv = ev(5);
  const curv = (u: number, v: number): Curvature => S.swap ? surfaceCurvature(rv(u, v), ru(u, v), rvv(u, v), ruv(u, v), ruu(u, v)) : surfaceCurvature(ru(u, v), rv(u, v), ruu(u, v), ruv(u, v), rvv(u, v));
  const normal = (u: number, v: number): V3 => {
    let n = S.swap ? cross3(rv(u, v), ru(u, v)) : cross3(ru(u, v), rv(u, v));
    if (norm3(n) < 1e-9) { const w = v + (v < (S.v[0] + S.v[1]) / 2 ? 1e-4 : -1e-4); n = S.swap ? cross3(rv(u, w), ru(u, w)) : cross3(ru(u, w), rv(u, w)); }
    return unit3(n);
  };
  return { r, ru, rv, curv, normal };
}

function create(ctx: DemoCtx): DemoInstance {
  const v = ctx.view3d!;
  let key = '';
  let S: SurfDef = SURFS.hill, C = compileSurface(S);
  let rover: RoverState = { u: 0, v: 0, p: [0, 0, 0], heading: [1, 0, 0] };
  let odometer = 0;
  const trail: V3[] = [];
  const TRAIL = 700;

  const surf = v.addSurface((a, b) => C.r(a, b), { uRange: S.u, vRange: S.v, res: 96, colormap: 'coolwarm' });
  const body = v.addPoint([0, 0, 0], {
    color: '#ffffff', size: 0.12,
    drag: {
      constrain: (p) => { const [a, b] = S.project(p); return C.r(a, b); },
      onDrag: (p) => {
        const [a, b] = S.project(p);
        const n = C.normal(a, b);
        const h = unit3(add3(rover.heading, scale3(n, -dot3(rover.heading, n))));
        rover = { u: a, v: b, p, heading: norm3(h) > 0.5 ? h : rover.heading };
        trail.length = 0; odometer = 0;
        refresh(true);
      },
    },
  });
  const Tarrow = v.addArrow([0, 0, 0], [1, 0, 0], { color: SERIES[1], label: 'T', radius: 0.03 });
  const Narrow = v.addArrow([0, 0, 0], [0, 0, 1], { color: SERIES[0], label: 'n', radius: 0.03 });
  const plane = v.addPlane([0, 0, 0], [0, 0, 1], 1.3, { color: '#b48cff', opacity: 0.28 });
  const princ = addSegments(v, 2, { color: SERIES[6] });
  const princ2 = addSegments(v, 2, { color: SERIES[5] });
  const circle = addSegments(v, 96, { color: SERIES[1], opacity: 0.8 });
  const trailLine = addSegments(v, TRAIL, { color: SERIES[1], opacity: 0.75 });

  const setSurface = (k: string, resetCam: boolean) => {
    S = SURFS[k] ?? SURFS.hill; C = compileSurface(S);
    v.setBounds(S.bounds);
    if (resetCam) v.resetCamera();
    // frame the surface closer than the default view
    v.camera.position.lerp(v.controls.target, 0.28); v.controls.update();
    // colour by K on a symmetric range (the 95th percentile of |K|, so a few spikes do not wash it out)
    const ks: number[] = [];
    for (let i = 0; i <= 40; i++) for (let j = 0; j <= 40; j++) {
      const K = C.curv(S.u[0] + ((S.u[1] - S.u[0]) * i) / 40, S.v[0] + ((S.v[1] - S.v[0]) * j) / 40).K;
      if (Number.isFinite(K)) ks.push(Math.abs(K));
    }
    ks.sort((a, b) => a - b);
    const m = Math.max(0.05, ks[Math.floor(ks.length * 0.95)] ?? 0.05);
    surf.update((a, b) => C.r(a, b), { uRange: S.u, vRange: S.v, colorBy: (_p, a, b) => C.curv(a, b).K, colorRange: [-m, m], colormap: 'coolwarm' });
    const [u0, v0] = S.start;
    const p = C.r(u0, v0), n = C.normal(u0, v0);
    const ru = S.swap ? C.rv(u0, v0) : C.ru(u0, v0);
    rover = { u: u0, v: v0, p, heading: turn(unit3(add3(ru, scale3(n, -dot3(ru, n)))), n, 0.5) };
    trail.length = 0; odometer = 0;
  };

  const surface: RoverSurface = { r: (a, b) => C.r(a, b), normal: (a, b) => C.normal(a, b), project: (p) => S.project(p) };

  let lastType = '';
  const refresh = (readouts: boolean) => {
    const { u, v: w, p, heading } = rover;
    const n = C.normal(u, w), c = C.curv(u, w);
    body.set(p);
    Tarrow.set(p, scale3(heading, 0.8)); Narrow.set(p, scale3(n, 0.8));
    plane.set(p, n); plane.visible(!!ctx.toggles.plane);
    const showP = !!ctx.toggles.principal && !!c.d1;
    princ.visible(showP); princ2.visible(showP);
    if (showP) {
      const lift = scale3(n, 0.01);
      princ.set([add3(add3(p, lift), scale3(c.d1!, -0.5)), add3(add3(p, lift), scale3(c.d1!, 0.5))]);
      princ2.set([add3(add3(p, lift), scale3(c.d2!, -0.5)), add3(add3(p, lift), scale3(c.d2!, 0.5))]);
    }
    // the normal section ahead: kn = II(T,T)/I(T,T); its osculating circle lies in the plane of T and n
    // components of T in the basis the curvature was computed in (r_v, r_u when swapped)
    const [t1, t2] = S.swap ? tangentToParams(C.rv(u, w), C.ru(u, w), heading) : tangentToParams(C.ru(u, w), C.rv(u, w), heading);
    const kn = normalCurvature(c, t1, t2);
    if (ctx.toggles.circle && Math.abs(kn) > 1e-3 && Math.abs(1 / kn) < 30) {
      const R = 1 / kn, ctr = add3(p, scale3(n, R));
      const pts: V3[] = [];
      for (let i = 0; i < 96; i++) {
        const a0 = (2 * PI * i) / 96, a1 = (2 * PI * (i + 1)) / 96;
        const at = (a: number): V3 => add3(ctr, add3(scale3(n, -R * Math.cos(a)), scale3(heading, Math.abs(R) * Math.sin(a))));
        pts.push(at(a0), at(a1));
      }
      circle.set(pts); circle.visible(true);
    } else circle.visible(false);
    trailLine.visible(!!ctx.toggles.trail);
    if (ctx.toggles.trail && trail.length > 1) {
      const pts: V3[] = [];
      for (let i = 1; i < trail.length; i++) if (Math.hypot(trail[i][0] - trail[i - 1][0], trail[i][1] - trail[i - 1][1], trail[i][2] - trail[i - 1][2]) < 0.5) pts.push(trail[i - 1], trail[i]);
      trailLine.set(pts);
    } else trailLine.set([]);
    const type = pointType(c);
    if (type !== lastType && lastType) ping(type === 'elliptic' ? 0.75 : type === 'hyperbolic' ? 0.3 : 0.5, 0.025);
    lastType = type;
    if (!readouts) return;
    // Euler: kn = k1 cos²φ + k2 sin²φ, φ the angle from the first principal direction
    const phi = c.d1 ? Math.atan2(dot3(cross3(c.d1, heading), n), dot3(c.d1, heading)) : NaN;
    const rows: Readout[] = [
      { label: 'Gaussian curvature K = κ₁κ₂', value: fmt(c.K, 5), tone: c.K > 1e-9 ? 'bad' : c.K < -1e-9 ? 'good' : 'muted' },
      { label: 'mean curvature H', value: fmt(c.H, 5) },
      { label: 'principal κ₁, κ₂', value: `${fmt(c.k1, 4)},  ${fmt(c.k2, 4)}` },
      { label: 'normal curvature ahead κₙ(T)', value: fmt(kn, 5) },
      { label: 'point type', value: type },
      { label: 'position', value: `(${fmt(p[0], 3)}, ${fmt(p[1], 3)}, ${fmt(p[2], 3)})` },
      { label: 'distance driven', value: fmt(odometer, 4) },
    ];
    if (Number.isFinite(phi)) rows.splice(4, 0, { label: `Euler κ₁cos²φ + κ₂sin²φ, φ = ${fmt((phi * 180) / PI, 3)}°`, value: fmt(c.k1 * Math.cos(phi) ** 2 + c.k2 * Math.sin(phi) ** 2, 5), tone: 'muted' });
    ctx.setReadouts(rows);
    ctx.setNote(`Under the rover $K = ${tx(c.K, 4)}$: ${c.K > 1e-9 ? 'the surface curves the **same way** in every direction (red — a cap or a bowl)' : c.K < -1e-9 ? 'it curves **up one way and down the other** (blue — a saddle)' : 'it is **flat in at least one direction**'}. Drive with **W A S D** or the arrow keys, or drag the white rover. Driving straight follows a **geodesic**; the yellow circle is the osculating circle of the surface’s cross-section straight ahead.`);
  };

  const keys = keyboard(['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  const update = () => {
    const k = ctx.choices.surface;
    if (k !== key) { const first = key === ''; key = k; setSurface(k, !first); }
    refresh(true);
    ctx.warn('');
  };

  let sinceReadout = 0;
  const stop = v.onFrame((dt) => {
    const H = keys.held;
    const fwd = (H.has('w') || H.has('ArrowUp') ? 1 : 0) - (H.has('s') || H.has('ArrowDown') ? 1 : 0) + (ctx.toggles.cruise ? 1 : 0);
    const rot = (H.has('a') || H.has('ArrowLeft') ? 1 : 0) - (H.has('d') || H.has('ArrowRight') ? 1 : 0);
    if (!fwd && !rot) return;
    if (rot) rover.heading = turn(rover.heading, C.normal(rover.u, rover.v), rot * 1.9 * dt);
    if (fwd) {
      const ds = Math.sign(fwd) * ctx.params.speed * dt;
      // bounce off the edges of a bounded domain
      const raw: V3 = add3(rover.p, scale3(rover.heading, ds * 4));
      if (S.graph) {
        if (Math.abs(raw[0]) > G) rover.heading = [-rover.heading[0], rover.heading[1], rover.heading[2]];
        if (Math.abs(raw[1]) > G) rover.heading = [rover.heading[0], -rover.heading[1], rover.heading[2]];
      } else if (key === 'cylinder' && Math.abs(raw[2]) > 2) rover.heading = [rover.heading[0], rover.heading[1], -rover.heading[2]];
      const n = C.normal(rover.u, rover.v);
      rover.heading = unit3(add3(rover.heading, scale3(n, -dot3(rover.heading, n))));
      rover = roverStep(surface, rover, ds, 6);
      odometer += Math.abs(ds);
      trail.push(rover.p);
      if (trail.length > TRAIL) trail.shift();
    }
    sinceReadout += dt;
    const doReadouts = sinceReadout > 0.1;
    if (doReadouts) sinceReadout = 0;
    refresh(doReadouts);
  });

  return { update, dispose() { stop(); keys.stop(); v.clear(); } };
}

export const curvatureExplorer: DemoDef = {
  id: 'fidget.curvature', module: 'fidget', title: 'Curvature Explorer', topic: 'Gaussian and mean curvature, principal directions, geodesics',
  summary: 'Drive a rover over hills, saddles, a torus and a sphere. The ground is painted by Gaussian curvature — red where it bulges, blue where it saddles — and the numbers under the wheels update as you go.',
  tex: 'K = \\kappa_1\\kappa_2 = \\frac{LN - M^2}{EG - F^2},\\quad H = \\tfrac12(\\kappa_1 + \\kappa_2)',
  view: '3d',
  params: [{ key: 'speed', label: 'rover speed', value: 1, min: 0.1, max: 3, step: 0.01 }],
  choices: [{ key: 'surface', label: 'Surface', value: 'hill', options: Object.entries(SURFS).map(([k, s]) => [k, s.label]) }],
  toggles: [
    { key: 'cruise', label: 'Cruise (drive forward by itself)', value: false },
    { key: 'trail', label: 'Leave a trail', value: true },
    { key: 'principal', label: 'Principal directions', value: true },
    { key: 'circle', label: 'Osculating circle straight ahead', value: false },
    { key: 'plane', label: 'Tangent plane', value: false },
  ],
  experiments: [
    'Drive over the top of the Gaussian hill: red (K > 0) on the cap, then blue (K < 0) on the flanks, with a ring of K = 0 between.',
    'On the **torus**, the outside is red and the inside blue. Cruise straight: the trail is a geodesic, and it wanders between them.',
    'On the **cylinder**, K = 0 everywhere although it is clearly curved — K only sees curvature in *both* directions. Its sheet can be unrolled flat.',
    'Turn on the osculating circle and turn on the spot on the saddle: the circle flips sides as T swings past a principal direction.',
    'On the sphere, cruise straight: you come back to where you started after 2πR ≈ 12.57 — a great circle.',
  ],
  connections: ['fidget.sculptor', 'fidget.vectors'],
  accuracy: 'K, H, the principal curvatures and directions, and κₙ use exact symbolic first and second partial derivatives of the surface (the fundamental forms), evaluated in floating point. Driving straight keeps the heading tangent by projecting it onto each new tangent plane — a first-order geodesic integrator, with six substeps per frame; the sphere test closes a great circle to 5·10⁻³. The surface colours are K at 97 × 97 points; the colour scale is symmetric, clipped at the 95th percentile of |K|.',
  tutorial: [
    { text: 'The white ball is a rover; the yellow arrow T is its heading, the blue arrow n the surface normal. The colours show the Gaussian curvature $K$: red positive, blue negative, pale zero.', task: 'Drive with W/A/S/D or the arrow keys (click the 3D view first if needed) — or drag the rover.', set: { choices: { surface: 'hill' }, toggles: { trail: true, principal: true } } },
    { text: 'At every point there are two **principal directions** (orange and cyan bars), perpendicular, in which the surface bends most and least: the principal curvatures $\\kappa_1, \\kappa_2$. Gauss’s $K = \\kappa_1\\kappa_2$ — positive when both bend the same way.', task: 'Find a blue (K < 0) point on the hill’s flank and read K.' },
    { text: 'Euler’s theorem: the normal curvature in a direction at angle φ from the first principal direction is $\\kappa_n = \\kappa_1\\cos^2\\varphi + \\kappa_2\\sin^2\\varphi$. The yellow osculating circle has radius $1/|\\kappa_n|$.', task: 'Choose the saddle, show the osculating circle, and turn on the spot.', set: { choices: { surface: 'saddle' }, toggles: { circle: true } }, done: (c) => c.choices.surface === 'saddle' && !!c.toggles.circle },
    { text: 'The cylinder looks curved but has $K = 0$: one principal curvature is zero. Gauss’s *Theorema Egregium* says K depends only on distances measured within the surface — and a cylinder unrolls onto a flat sheet without stretching.', task: 'Choose the cylinder and check K.', set: { choices: { surface: 'cylinder' }, toggles: { circle: false } }, done: (c) => c.choices.surface === 'cylinder' },
    { text: 'On a sphere, driving straight (never steering) traces a great circle — a **geodesic**. Its length is $2\\pi R \\approx 12.57$ for R = 2.', task: 'Choose the sphere and turn on cruise.', set: { choices: { surface: 'sphere' }, toggles: { trail: true } }, done: (c) => c.choices.surface === 'sphere' && !!c.toggles.cruise },
  ],
  create,
};
