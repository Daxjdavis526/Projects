// Surface theory for the st-c lessons C4–C6: closed-form parameterizations
// with their first and second partial derivatives, and the fundamental forms
// computed from them exactly as the lessons teach it (E = X_u·X_u, …,
// L = X_uu·n, …, K = (LN − M²)/(EG − F²)). Answer keys come from here; the
// derivatives are checked against finite differences in the lesson tests'
// spirit by a scratch script, not at runtime.
//
// Convention: n = X_u × X_v / |X_u × X_v| (as in C3.2); with it the sphere
// (θ, φ) and the torus (u around the axis, v around the tube) have outward
// normals, and the sphere's normal curvature is −1/a.

import { dot, cross, norm, scale } from './_dg.js';

const { sin, cos, sinh, cosh, sqrt } = Math;

/** Sphere of radius a in (θ, φ): θ from the +z pole, φ round the axis. */
export const sphere = (a) => ({
  X: (t, p) => [a * sin(t) * cos(p), a * sin(t) * sin(p), a * cos(t)],
  d: (t, p) => ({
    Xu: [a * cos(t) * cos(p), a * cos(t) * sin(p), -a * sin(t)],
    Xv: [-a * sin(t) * sin(p), a * sin(t) * cos(p), 0],
    Xuu: [-a * sin(t) * cos(p), -a * sin(t) * sin(p), -a * cos(t)],
    Xuv: [-a * cos(t) * sin(p), a * cos(t) * cos(p), 0],
    Xvv: [-a * sin(t) * cos(p), -a * sin(t) * sin(p), 0],
  }),
});

/** Torus: u round the central axis, v round the tube (0 = outer equator). */
export const torus = (R, r) => ({
  X: (u, v) => [(R + r * cos(v)) * cos(u), (R + r * cos(v)) * sin(u), r * sin(v)],
  d: (u, v) => ({
    Xu: [-(R + r * cos(v)) * sin(u), (R + r * cos(v)) * cos(u), 0],
    Xv: [-r * sin(v) * cos(u), -r * sin(v) * sin(u), r * cos(v)],
    Xuu: [-(R + r * cos(v)) * cos(u), -(R + r * cos(v)) * sin(u), 0],
    Xuv: [r * sin(v) * sin(u), -r * sin(v) * cos(u), 0],
    Xvv: [-r * cos(v) * cos(u), -r * cos(v) * sin(u), -r * sin(v)],
  }),
});

/** Catenoid (c cosh(v/c) cos u, c cosh(v/c) sin u, v). */
export const catenoid = (c) => ({
  X: (u, v) => [c * cosh(v / c) * cos(u), c * cosh(v / c) * sin(u), v],
  d: (u, v) => ({
    Xu: [-c * cosh(v / c) * sin(u), c * cosh(v / c) * cos(u), 0],
    Xv: [sinh(v / c) * cos(u), sinh(v / c) * sin(u), 1],
    Xuu: [-c * cosh(v / c) * cos(u), -c * cosh(v / c) * sin(u), 0],
    Xuv: [-sinh(v / c) * sin(u), sinh(v / c) * cos(u), 0],
    Xvv: [(cosh(v / c) / c) * cos(u), (cosh(v / c) / c) * sin(u), 0],
  }),
});

/** Helicoid in the coordinates that make it isometric to the catenoid: (c sinh(v/c) cos u, c sinh(v/c) sin u, c u). */
export const helicoid = (c) => ({
  X: (u, v) => [c * sinh(v / c) * cos(u), c * sinh(v / c) * sin(u), c * u],
  d: (u, v) => ({
    Xu: [-c * sinh(v / c) * sin(u), c * sinh(v / c) * cos(u), c],
    Xv: [cosh(v / c) * cos(u), cosh(v / c) * sin(u), 0],
    Xuu: [-c * sinh(v / c) * cos(u), -c * sinh(v / c) * sin(u), 0],
    Xuv: [-cosh(v / c) * sin(u), cosh(v / c) * cos(u), 0],
    Xvv: [(sinh(v / c) / c) * cos(u), (sinh(v / c) / c) * sin(u), 0],
  }),
});

/** The ruled helicoid (u cos v, u sin v, c v) of C3.2. */
export const helicoidRuled = (c) => ({
  X: (u, v) => [u * cos(v), u * sin(v), c * v],
  d: (u, v) => ({
    Xu: [cos(v), sin(v), 0],
    Xv: [-u * sin(v), u * cos(v), c],
    Xuu: [0, 0, 0],
    Xuv: [-sin(v), cos(v), 0],
    Xvv: [-u * cos(v), -u * sin(v), 0],
  }),
});

/** A graph z = f(u, v), from f's partial derivatives fu, fv, fuu, fuv, fvv (functions of u, v). */
export const graph = (f) => ({
  X: (u, v) => [u, v, f.f(u, v)],
  d: (u, v) => ({
    Xu: [1, 0, f.fu(u, v)], Xv: [0, 1, f.fv(u, v)],
    Xuu: [0, 0, f.fuu(u, v)], Xuv: [0, 0, f.fuv(u, v)], Xvv: [0, 0, f.fvv(u, v)],
  }),
});

/** The saddle z = k u v. */
export const saddle = (k) => graph({ f: (u, v) => k * u * v, fu: (u, v) => k * v, fv: (u) => k * u, fuu: () => 0, fuv: () => k, fvv: () => 0 });

/** Cylinder of radius a: (a cos u, a sin u, v). */
export const cylinder = (a) => ({
  X: (u, v) => [a * cos(u), a * sin(u), v],
  d: (u) => ({ Xu: [-a * sin(u), a * cos(u), 0], Xv: [0, 0, 1], Xuu: [-a * cos(u), -a * sin(u), 0], Xuv: [0, 0, 0], Xvv: [0, 0, 0] }),
});

/** A surface of revolution (ρ(v) cos u, ρ(v) sin u, z(v)) from p = { r, r1, r2, z, z1, z2 } as functions of v. */
export const revolution = (p) => ({
  X: (u, v) => [p.r(v) * cos(u), p.r(v) * sin(u), p.z(v)],
  d: (u, v) => ({
    Xu: [-p.r(v) * sin(u), p.r(v) * cos(u), 0],
    Xv: [p.r1(v) * cos(u), p.r1(v) * sin(u), p.z1(v)],
    Xuu: [-p.r(v) * cos(u), -p.r(v) * sin(u), 0],
    Xuv: [-p.r1(v) * sin(u), p.r1(v) * cos(u), 0],
    Xvv: [p.r2(v) * cos(u), p.r2(v) * sin(u), p.z2(v)],
  }),
});

/** First and second fundamental forms, K, H and the principal curvatures (κ1 ≥ κ2) at (u, v). */
export function forms(S, u, v) {
  const { Xu, Xv, Xuu, Xuv, Xvv } = S.d(u, v);
  const E = dot(Xu, Xu), F = dot(Xu, Xv), G = dot(Xv, Xv);
  const c = cross(Xu, Xv), n = scale(c, 1 / norm(c));
  const L = dot(Xuu, n), M = dot(Xuv, n), N = dot(Xvv, n);
  const W = E * G - F * F;
  const K = (L * N - M * M) / W, H = (E * N - 2 * F * M + G * L) / (2 * W);
  const disc = Math.sqrt(Math.max(0, H * H - K));
  return { E, F, G, L, M, N, n, W, K, H, k1: H + disc, k2: H - disc, Xu, Xv };
}

/** Normal curvature in the tangent direction a X_u + b X_v. */
export function kn(fm, a, b) {
  return (fm.L * a * a + 2 * fm.M * a * b + fm.N * b * b) / (fm.E * a * a + 2 * fm.F * a * b + fm.G * b * b);
}

/** Angle in radians between the tangent vectors (a1, b1) and (a2, b2), measured with the first fundamental form. */
export function angleI(fm, [a1, b1], [a2, b2]) {
  const ip = (p, q, r, s) => fm.E * p * r + fm.F * (p * s + q * r) + fm.G * q * s;
  return Math.acos(ip(a1, b1, a2, b2) / Math.sqrt(ip(a1, b1, a1, b1) * ip(a2, b2, a2, b2)));
}

/** Earth and Moon radii (km): IUGG mean Earth radius; IAU/LOLA mean lunar radius. */
export const R_EARTH = 6371.0, R_MOON = 1737.4;
