// Intrinsic geometry of surfaces of revolution, computed from the metric
// alone: the Christoffel symbols, the Gaussian curvature, geodesics (the
// geodesic equation integrated by RK4) and parallel transport of a tangent
// vector along any path. Every surface is X(u, v) = (ρ(v) cos u, ρ(v) sin u,
// z(v)): u is the angle around the axis, v runs along a meridian. Then
//
//   ds² = ρ² du² + h dv²,   h = ρ′² + z′²            (g_uv = 0)
//   Γ^u_uv = Γ^u_vu = ρ′/ρ,  Γ^v_uu = −ρρ′/h,  Γ^v_vv = (ρ′ρ″ + z′z″)/h,  all others 0
//   K = z′(ρ′z″ − ρ″z′) / (ρ h²),   and the Ricci scalar is R = 2K.
//
// Conventions as in the Road (Carroll): Γ^λ_μν = ½g^λσ(∂_μ g_νσ + ∂_ν g_μσ − ∂_σ g_μν).
// The 3D embedding is used only to draw; nothing here reads it to compute.
// DOM-free; tested in test/gr-surface.test.mjs.

const { sin, cos, sinh, cosh, sqrt, PI } = Math;
const TORUS_R = 2, TORUS_r = 1, CONE_A = PI / 6;

/**
 * The library. Each surface gives ρ, z and their first two derivatives in v,
 * the v range, whether v is periodic, its coordinate names (as TeX) and the
 * sign that makes e_u × e_v point outward. `vLabel` names the v slider.
 */
export const SURFACES = {
  sphere: {
    label: 'Sphere', u: '\\phi', v: '\\theta', vRange: [0.12, PI - 0.12], periodic: false, orient: -1, kScale: 1,
    vLabel: 'Colatitude $\\theta$ (from the north pole)', vUnit: 'rad',
    f: (v) => ({ r: sin(v), r1: cos(v), r2: -sin(v), z: cos(v), z1: -sin(v), z2: -cos(v) }),
  },
  torus: {
    label: 'Torus', u: 'u', v: 'v', vRange: [-PI, PI], periodic: true, orient: 1, kScale: 0.5,
    vLabel: 'Angle $v$ around the tube (0 = outer equator)', vUnit: 'rad', R: TORUS_R, r: TORUS_r,
    f: (v) => ({ r: TORUS_R + TORUS_r * cos(v), r1: -TORUS_r * sin(v), r2: -TORUS_r * cos(v), z: TORUS_r * sin(v), z1: TORUS_r * cos(v), z2: -TORUS_r * sin(v) }),
  },
  cylinder: {
    label: 'Cylinder', u: '\\phi', v: 'z', vRange: [-1.6, 1.6], periodic: false, orient: 1, kScale: 1,
    vLabel: 'Height $z$', vUnit: '',
    f: (v) => ({ r: 1, r1: 0, r2: 0, z: v, z1: 1, z2: 0 }),
  },
  cone: {
    label: 'Cone', u: '\\phi', v: 's', vRange: [0.15, 2.4], periodic: false, orient: -1, kScale: 1, alpha: CONE_A,
    vLabel: 'Distance $s$ from the tip, along the surface', vUnit: '',
    f: (v) => ({ r: v * sin(CONE_A), r1: sin(CONE_A), r2: 0, z: 1.2 - v * cos(CONE_A), z1: -cos(CONE_A), z2: 0 }),
  },
  catenoid: {
    label: 'Catenoid', u: '\\phi', v: 'z', vRange: [-1.35, 1.35], periodic: false, orient: 1, kScale: 0.5,
    vLabel: 'Height $z$', vUnit: '',
    f: (v) => ({ r: cosh(v), r1: sinh(v), r2: cosh(v), z: v, z1: 1, z2: 0 }),
  },
};

const wrapV = (S, v) => (S.periodic ? ((((v + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI : v);

/** Metric components at meridian position v. */
export function metric(S, v) {
  const q = S.f(v);
  return { guu: q.r * q.r, gvv: q.r1 * q.r1 + q.z1 * q.z1 };
}

/** The three independent non-zero Christoffel symbols: Γ^u_uv (= Γ^u_vu), Γ^v_uu, Γ^v_vv. */
export function christoffel(S, v) {
  const q = S.f(v), h = q.r1 * q.r1 + q.z1 * q.z1;
  return { uuv: q.r1 / q.r, vuu: (-q.r * q.r1) / h, vvv: (q.r1 * q.r2 + q.z1 * q.z2) / h };
}

/** Γ^a_bc as a full 2 × 2 × 2 array, index 0 = u, 1 = v. */
export function gammaArray(S, v) {
  const c = christoffel(S, v);
  return [[[0, c.uuv], [c.uuv, 0]], [[c.vuu, 0], [0, c.vvv]]];
}

/** Gaussian curvature K (the Ricci scalar is 2K). */
export function curvature(S, v) {
  const q = S.f(v), h = q.r1 * q.r1 + q.z1 * q.z1;
  return (q.z1 * (q.r1 * q.z2 - q.r2 * q.z1)) / (q.r * h * h);
}

/** A point of the surface in 3D. */
export function embed(S, u, v) {
  const q = S.f(v);
  return [q.r * cos(u), q.r * sin(u), q.z];
}

/** The coordinate basis vectors e_u = ∂X/∂u and e_v = ∂X/∂v, and the outward unit normal. */
export function basis(S, u, v) {
  const q = S.f(v);
  const eu = [-q.r * sin(u), q.r * cos(u), 0];
  const ev = [q.r1 * cos(u), q.r1 * sin(u), q.z1];
  const n = [eu[1] * ev[2] - eu[2] * ev[1], eu[2] * ev[0] - eu[0] * ev[2], eu[0] * ev[1] - eu[1] * ev[0]];
  const L = Math.hypot(n[0], n[1], n[2]) || 1;
  return { eu, ev, n: n.map((x) => (S.orient * x) / L) };
}

/** Coordinate components (V^u, V^v) as a 3D vector. */
export function toVec3(S, u, v, V) {
  const { eu, ev } = basis(S, u, v);
  return [V[0] * eu[0] + V[1] * ev[0], V[0] * eu[1] + V[1] * ev[1], V[0] * eu[2] + V[1] * ev[2]];
}

/** The length of a vector with components V, from the metric. */
export function norm(S, v, V) {
  const g = metric(S, v);
  return sqrt(g.guu * V[0] * V[0] + g.gvv * V[1] * V[1]);
}

// right-hand side of the geodesic equation, state [u, v, u̇, v̇]
function geoRHS(S, s) {
  const G = christoffel(S, s[1]);
  return [s[2], s[3], -2 * G.uuv * s[2] * s[3], -G.vuu * s[2] * s[2] - G.vvv * s[3] * s[3]];
}

/**
 * Integrate the geodesic equation ẍ^a + Γ^a_bc ẋ^b ẋ^c = 0 by RK4 from (u, v)
 * with unit speed, heading `heading` radians from the ê_u direction toward
 * ê_v. Returns the points [u, v], the Clairaut quantity ρ² u̇ (conserved
 * because u does not appear in the metric) and the speed² along the way.
 */
export function geodesic(S, { u, v, heading, length, steps = 600 }) {
  const g = metric(S, v);
  let s = [u, v, cos(heading) / sqrt(g.guu), sin(heading) / sqrt(g.gvv)];
  const h = length / steps, pts = [[s[0], s[1]]], clairaut = [], speed2 = [];
  const record = () => { const m = metric(S, s[1]); clairaut.push(m.guu * s[2]); speed2.push(m.guu * s[2] * s[2] + m.gvv * s[3] * s[3]); };
  record();
  for (let k = 0; k < steps; k++) {
    const k1 = geoRHS(S, s);
    const k2 = geoRHS(S, s.map((x, i) => x + (h / 2) * k1[i]));
    const k3 = geoRHS(S, s.map((x, i) => x + (h / 2) * k2[i]));
    const k4 = geoRHS(S, s.map((x, i) => x + h * k3[i]));
    s = s.map((x, i) => x + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    s[1] = wrapV(S, s[1]);
    if (!S.periodic && (s[1] < S.vRange[0] || s[1] > S.vRange[1])) break;
    pts.push([s[0], s[1]]);
    record();
  }
  return { pts, clairaut, speed2 };
}

/**
 * Parallel-transport the vector V0 (components V^u, V^v) along a path of
 * points [u, v], solving dV^a/dλ + Γ^a_bc (dx^b/dλ) V^c = 0 on each segment
 * by RK4 with the Christoffel symbols at interpolated points. Returns the
 * components at every point of the path.
 */
export function transport(S, path, V0, sub = 8) {
  const out = [V0.slice()];
  let V = V0.slice();
  const f = (x, dx, W) => {
    const G = gammaArray(S, x[1]);
    return [0, 1].map((a) => -(G[a][0][0] * dx[0] * W[0] + G[a][0][1] * dx[0] * W[1] + G[a][1][0] * dx[1] * W[0] + G[a][1][1] * dx[1] * W[1]));
  };
  for (let k = 0; k + 1 < path.length; k++) {
    const p = path[k], q = path[k + 1];
    let du = q[0] - p[0], dv = q[1] - p[1];
    if (S.periodic && Math.abs(dv) > PI) dv -= Math.sign(dv) * 2 * PI;
    const dx = [du, dv];
    for (let j = 0; j < sub; j++) {
      const t0 = j / sub, hs = 1 / sub;
      const at = (t) => [p[0] + du * t, p[1] + dv * t];
      const k1 = f(at(t0), dx, V);
      const k2 = f(at(t0 + hs / 2), dx, V.map((x, i) => x + (hs / 2) * k1[i]));
      const k3 = f(at(t0 + hs / 2), dx, V.map((x, i) => x + (hs / 2) * k2[i]));
      const k4 = f(at(t0 + hs), dx, V.map((x, i) => x + hs * k3[i]));
      V = V.map((x, i) => x + (hs / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }
    out.push(V.slice());
  }
  return out;
}

/** Signed angle (radians, anticlockwise seen from outside) from tangent vector A to B at (u, v). */
export function angleBetween(S, u, v, A, B) {
  const a = toVec3(S, u, v, A), b = toVec3(S, u, v, B), { n } = basis(S, u, v);
  const cr = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  return Math.atan2(cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2], a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}

/**
 * A small coordinate rectangle centred on (u0, v0), half-widths du and dv,
 * travelled anticlockwise as seen from outside, sampled with n points per
 * side. It starts (and ends) at the middle of the side v = v0 − dv.
 */
export function rectangle(S, u0, v0, du, dv, n = 60) {
  const c = S.orient > 0
    ? [[u0 - du, v0 - dv], [u0 + du, v0 - dv], [u0 + du, v0 + dv], [u0 - du, v0 + dv]]
    : [[u0 - du, v0 - dv], [u0 - du, v0 + dv], [u0 + du, v0 + dv], [u0 + du, v0 - dv]];
  const loop = [];
  for (let s = 0; s < 4; s++) {
    const p = c[s], q = c[(s + 1) % 4];
    for (let k = 0; k < n; k++) loop.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
  }
  const start = S.orient > 0 ? n / 2 : 3 * n + n / 2;          // the middle of the side v = v0 − dv
  const path = [...loop.slice(start), ...loop.slice(0, start)];
  path.push(path[0].slice());
  return path;
}

/** ∫ f(v) dv by composite Simpson's rule. */
function simpson(f, a, b, n = 200) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h);
  return (s * h) / 3;
}

/** Area and total curvature ∫K dA of the coordinate rectangle u0 ± du, v0 ± dv. */
export function rectangleIntegrals(S, v0, du, dv) {
  const dA = (v) => { const m = metric(S, v); return sqrt(m.guu * m.gvv); };
  return {
    area: 2 * du * simpson(dA, v0 - dv, v0 + dv),
    totalK: 2 * du * simpson((v) => curvature(S, v) * dA(v), v0 - dv, v0 + dv),
  };
}

/**
 * Carry the unit vector along ê_v once around the rectangle and report the
 * rotation (radians, anticlockwise from outside), the area and ∫K dA.
 */
export function loopHolonomy(S, u0, v0, du, dv) {
  const path = rectangle(S, u0, v0, du, dv);
  const [us, vs] = path[0];
  const V0 = [0, 1 / sqrt(metric(S, vs).gvv)];
  const Vs = transport(S, path, V0);
  const angle = angleBetween(S, us, vs, V0, Vs[Vs.length - 1]);
  return { path, Vs, angle, ...rectangleIntegrals(S, v0, du, dv) };
}

/** Points of the parallel (circle) v = v0, and of the meridian u = u0. */
export const parallel = (v0, n = 240) => Array.from({ length: n + 1 }, (_, k) => [(2 * PI * k) / n, v0]);
export const meridian = (S, u0, n = 240) => Array.from({ length: n + 1 }, (_, k) => [u0, S.vRange[0] + ((S.vRange[1] - S.vRange[0]) * k) / n]);
