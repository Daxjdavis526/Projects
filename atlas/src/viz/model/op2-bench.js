// Ray-transfer (ABCD) matrices and exact meridional ray tracing for a
// sequence of optical elements on one axis, DOM-free: the physics behind
// sims/op2-bench.js (PHYS 4650 O4), tested headlessly in
// test/op2-bench.test.mjs.
//
// An element is one of
//   { kind: 'thin',   z, f, ap }                 an ideal thin lens of focal length f
//   { kind: 'surf',   z, R, n | mat, k, ap }     a refracting surface: vertex at z, centre of curvature
//                                                at z + R (R = Infinity: flat), conic constant k
//                                                (0 sphere, −1 paraboloid), and the medium after it
//                                                (an index n, or a material of model/optics-rays.js)
//   { kind: 'mirror', z, R, k, ap, hole }        a mirror: vertex at z, centre at z + R, conic k;
//                                                light reverses on it (a central hole of radius
//                                                `hole` lets light through on another pass)
//   { kind: 'stop',   z, ap }                    an aperture stop (does nothing paraxially)
//   { kind: 'screen', z, ap }                    a detector plane (does nothing to the light)
// listed in the order light meets them. Light starts travelling toward +z; after
// a mirror it travels the other way, so the next element must lie behind it.
//
// Paraxial rays are column vectors (y, θ): height and angle (rad) to the axis,
// θ measured relative to the direction of travel. Matrices (Hecht §6.2 uses
// the same physics with (nα, y) ordering; we use the ABCD convention of laser
// optics and most ray-tracing texts):
//   translation by d in any medium  [[1, d], [0, 1]]
//   thin lens                        [[1, 0], [−1/f, 1]]
//   refraction n₁ → n₂, radius R     [[1, 0], [−(n₂ − n₁)/(n₂R), n₁/n₂]]   (R > 0: centre ahead)
//   mirror of focal length f         [[1, 0], [−1/f, 1]]   (f = R/2 > 0 for a concave mirror)
// so det M = n_in/n_out, and 1 for a system in air. With M = [[A, B], [C, D]]
// from the first vertex to the last, for a system in air: effective focal
// length f = −1/C; back focal distance −A/C; the second principal plane H′ lies
// (1 − A)/C after the last vertex, the first H lies (D − 1)/C after the first
// vertex; the front focal point lies D/C after the first vertex (negative: before it).

import { indexOf } from './optics-rays.js';

export const DEG = Math.PI / 180;

// ─── 2×2 matrices ──────────────────────────────────────────────────────────
export const mul = (P, Q) => [
  [P[0][0] * Q[0][0] + P[0][1] * Q[1][0], P[0][0] * Q[0][1] + P[0][1] * Q[1][1]],
  [P[1][0] * Q[0][0] + P[1][1] * Q[1][0], P[1][0] * Q[0][1] + P[1][1] * Q[1][1]],
];
export const apply = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];
export const det = (M) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
export const I2 = [[1, 0], [0, 1]];
export const translate = (d) => [[1, d], [0, 1]];
export const thinLens = (f) => [[1, 0], [-1 / f, 1]];
export const refract = (n1, n2, R) => [[1, 0], [Number.isFinite(R) ? -(n2 - n1) / (n2 * R) : 0, n1 / n2]];
export const mirrorM = (f) => [[1, 0], [Number.isFinite(f) ? -1 / f : 0, 1]];

/** The index of the medium after a surface element, at a wavelength (nm). */
export function indexAfter(el, lambda = 587.56) {
  if (el.mat) return indexOf(el.mat, lambda);
  return el.n ?? 1;
}

/**
 * Walk the elements: for each, the direction of travel s (±1) when light meets
 * it, the index before and after, its matrix, and the distance from the
 * previous element. Throws if an element lies behind the light.
 */
export function walk(elements, { n0 = 1, lambda = 587.56 } = {}) {
  let s = 1, n = n0, prevZ = null;
  const out = [];
  for (const el of elements) {
    const d = prevZ === null ? 0 : s * (el.z - prevZ);
    if (prevZ !== null && d < -1e-12) throw new Error(`element at z = ${el.z} lies behind the light (travelling ${s > 0 ? '+z' : '−z'})`);
    let M = I2, n2 = n, sOut = s, f = null;
    if (el.kind === 'thin') { M = thinLens(el.f); f = el.f; }
    else if (el.kind === 'surf') {
      n2 = indexAfter(el, lambda);
      M = refract(n, n2, s * (el.R ?? Infinity));
    } else if (el.kind === 'mirror') {
      f = Number.isFinite(el.R) ? (-s * el.R) / 2 : Infinity;
      M = mirrorM(f);
      sOut = -s;
    }
    out.push({ el, s, sOut, d, nIn: n, nOut: n2, M, f });
    s = sOut; n = n2; prevZ = el.z;
  }
  return { steps: out, sEnd: s, nEnd: n };
}

/** The system matrix from the first element's vertex plane to the last's, and the step list. */
export function system(elements, opts = {}) {
  const w = walk(elements, opts);
  let M = I2;
  for (const st of w.steps) M = mul(st.M, mul(translate(st.d), M));
  return { M, ...w };
}

/**
 * Cardinal points of a system in air on both sides (det M = 1), as distances
 * along the direction of travel (positive: in the direction light goes) and as
 * z positions. Returns null for an afocal system (C = 0).
 */
export function cardinal(elements, opts = {}) {
  const sys = system(elements, opts);
  const [[A], [C, D]] = [sys.M[0], sys.M[1]];
  if (Math.abs(C) < 1e-15) return { ...sys, afocal: true };
  const z1 = elements[0].z, z2 = elements[elements.length - 1].z, s1 = 1, s2 = sys.sEnd;
  const f = -1 / C, bfd = -A / C, ffd = D / C, h2 = (1 - A) / C, h1 = (D - 1) / C;
  return {
    ...sys, afocal: false, f, bfd, ffd, h1, h2,
    zF: z1 + s1 * ffd, zH: z1 + s1 * h1, zF2: z2 + s2 * bfd, zH2: z2 + s2 * h2,
  };
}

/**
 * Paraxial image of an object a distance `so` before the first element (so > 0
 * for a real object to the left), in a system in air: the image distance `si`
 * after the last element along the direction of travel, the magnification m,
 * and the image's z.
 */
export function image(elements, so, opts = {}) {
  const sys = system(elements, opts);
  const T = mul(sys.M, translate(so));
  const [[A, B], [C, D]] = T;
  if (Math.abs(D) < 1e-15) return { si: Infinity, m: Infinity, z: NaN, sEnd: sys.sEnd };
  const si = -B / D;
  const m = A + C * si;          // A' = A + si C once B' = 0
  const zl = elements[elements.length - 1].z;
  return { si, m, z: zl + sys.sEnd * si, sEnd: sys.sEnd };
}

/** A paraxial ray (y, θ) at the first element, traced: its height and angle at each element. */
export function paraxialRay(elements, y0, th0, opts = {}) {
  const w = walk(elements, opts);
  let v = [y0, th0];
  const pts = [];
  for (let i = 0; i < w.steps.length; i++) {
    const st = w.steps[i];
    if (i > 0) v = apply(translate(st.d), v);
    pts.push({ z: st.el.z, y: v[0], thIn: v[1], s: st.s });
    v = apply(st.M, v);
    pts[i].thOut = v[1];
    pts[i].sOut = st.sOut;
  }
  return { pts, y: v[0], th: v[1], sEnd: w.sEnd };
}

/** Lensmaker's formula for a thick lens in air: index n, radii R1 and R2 (Hecht's signs), thickness t. */
export function thickLensF(n, R1, R2, t) {
  const P = (n - 1) * (1 / R1 - 1 / R2 + ((n - 1) * t) / (n * R1 * R2));
  return 1 / P;
}

/** Two thin lenses a distance d apart: f = f1 f2 / (f1 + f2 − d). */
export const twoLensF = (f1, f2, d) => (f1 * f2) / (f1 + f2 - d);

// ─── exact meridional tracing ──────────────────────────────────────────────

/** Sag of a conic surface of curvature c (= 1/R) and conic constant k at height y. */
export function sag(c, k, y) {
  if (!c) return 0;
  const q = 1 - (1 + k) * c * c * y * y;
  if (q < 0) return NaN;
  return (c * y * y) / (1 + Math.sqrt(q));
}
/** d(sag)/dy. */
export function sagSlope(c, k, y) {
  if (!c) return 0;
  const q = 1 - (1 + k) * c * c * y * y;
  if (q <= 0) return NaN;
  return (c * y) / Math.sqrt(q);
}

/** Where a ray (point p = [z, y], unit direction d) meets an element's surface; null if it misses. */
export function hit(el, p, d) {
  if (Math.abs(d[0]) < 1e-12) return null;
  const c = Number.isFinite(el.R) ? 1 / el.R : 0, k = el.k ?? 0;
  let t = (el.z - p[0]) / d[0];
  if (el.kind === 'surf' || el.kind === 'mirror') {
    for (let it = 0; it < 60; it++) {
      const y = p[1] + t * d[1], zs = el.z + sag(c, k, y);
      if (!Number.isFinite(zs)) return null;
      const g = p[0] + t * d[0] - zs;
      const dg = d[0] - sagSlope(c, k, y) * d[1];
      if (!Number.isFinite(dg) || Math.abs(dg) < 1e-14) return null;
      const dt = g / dg;
      t -= dt;
      if (Math.abs(dt) < 1e-13 * (1 + Math.abs(t))) break;
    }
  }
  if (!(t > -1e-9)) return null;
  const q = [p[0] + t * d[0], p[1] + t * d[1]];
  // the surface normal (unnormalized: (1, −sag′))
  let nrm = [1, 0];
  if (el.kind === 'surf' || el.kind === 'mirror') { const m = sagSlope(c, k, q[1]); nrm = [1, -m]; }
  const L = Math.hypot(nrm[0], nrm[1]);
  return { t, q, nrm: [nrm[0] / L, nrm[1] / L] };
}

/** Reflect a direction about a unit normal. */
export const reflect = (d, n) => { const k = 2 * (d[0] * n[0] + d[1] * n[1]); return [d[0] - k * n[0], d[1] - k * n[1]]; };
/** Refract a direction through a unit normal from index n1 into n2; null on total internal reflection. */
export function refractDir(d, nrm, n1, n2) {
  let n = nrm, ci = -(d[0] * n[0] + d[1] * n[1]);
  if (ci < 0) { n = [-n[0], -n[1]]; ci = -ci; }
  const r = n1 / n2, k = 1 - r * r * (1 - ci * ci);
  if (k < 0) return null;
  const ct = Math.sqrt(k);
  return [r * d[0] + (r * ci - ct) * n[0], r * d[1] + (r * ci - ct) * n[1]];
}

/**
 * Trace one exact ray from point p with direction d (unit) through the
 * elements. Returns { pts: [[z, y], …] at each element met, d: final
 * direction, ok: false if blocked (outside an aperture, or total internal
 * reflection) with `at` the index where it stopped }.
 */
export function exactRay(elements, p, d, { n0 = 1, lambda = 587.56, clip = true } = {}) {
  let n = n0, P = p.slice(), D = d.slice();
  const pts = [P.slice()];
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const h = hit(el, P, D);
    if (!h) return { pts, d: D, ok: false, at: i };
    P = h.q; pts.push(P.slice());
    if (clip && el.ap && Math.abs(P[1]) > el.ap * (1 + 1e-9)) return { pts, d: D, ok: false, at: i };
    if (el.kind === 'thin') {
      // an ideal thin lens: the slope relative to the direction of travel changes by −y/f
      const s = Math.sign(D[0]), m = D[1] / D[0] * s - P[1] / el.f;
      const L = Math.hypot(1, m);
      D = [s / L, m / L];
    } else if (el.kind === 'surf') {
      const n2 = indexAfter(el, lambda);
      const nd = refractDir(D, h.nrm, n, n2);
      if (!nd) return { pts, d: D, ok: false, at: i, tir: true };
      D = nd; n = n2;
    } else if (el.kind === 'mirror') {
      if (el.hole && Math.abs(P[1]) < el.hole) continue;
      D = reflect(D, h.nrm);
    }
  }
  return { pts, d: D, ok: true, n };
}

/** Where a ray (point, direction) crosses the axis y = 0: its z (NaN if parallel). */
export function axisCrossing(p, d) {
  if (Math.abs(d[1]) < 1e-15) return NaN;
  return p[0] - (p[1] * d[0]) / d[1];
}

/**
 * Longitudinal aberration of a system for a ray parallel to the axis entering
 * at height h: the z where it crosses the axis after the last element, minus
 * the paraxial back focal point, measured along the final direction of travel.
 * Negative: the edge ray focuses short (back toward the system), as a single
 * converging lens or a spherical mirror does (undercorrected).
 */
export function longitudinal(elements, h, opts = {}) {
  const lambda = opts.lambda ?? 587.56;
  const z0 = elements[0].z - 1;
  const r = exactRay(elements, [z0, h], [1, 0], { ...opts, clip: false });
  if (!r.ok) return NaN;
  const cp = cardinal(elements, { ...opts, lambda });
  return (axisCrossing(r.pts[r.pts.length - 1], r.d) - cp.zF2) * cp.sEnd;
}

/** Third-order longitudinal spherical aberration of a thin lens in air (object at infinity), for a ray at height h. */
export function thinLensLSA3(n, R1, R2, h) {
  // Hecht eq. 6.46 in the form of the Coddington shape factor q = (R2 + R1)/(R2 − R1), object at infinity (p = −1)
  const f = 1 / ((n - 1) * (1 / R1 - 1 / R2));
  const c1 = 1 / R1, c2 = 1 / R2, q = (c1 + c2) / (c1 - c2), p = -1;
  const A = ((n + 2) / (n - 1)) * q * q + 4 * (n + 1) * p * q + (3 * n + 2) * (n - 1) * p * p + (n ** 3) / (n - 1);
  // the shift of the marginal focus from the paraxial one (negative: closer to the lens)
  return (-(h * h) / (8 * f * n * (n - 1))) * A;
}

/** Numerical aperture and acceptance half-angle (deg) of a step-index fibre, in a medium of index n0. */
export function fibreNA(n1, n2, n0 = 1) {
  const NA = Math.sqrt(n1 * n1 - n2 * n2);
  return { NA, theta: Math.asin(Math.min(1, NA / n0)) / DEG };
}

/** Modal (intermodal) dispersion of a step-index fibre: the spread in arrival time per length, Δt/L = n1Δ/c with n1 Δ = n1(n1 − n2)/n2. */
export const modalSpread = (n1, n2, c = 299792458) => (n1 * (n1 - n2)) / (n2 * c);

/** Minimum deviation of a prism of apex A (rad) and index n in air (rad). */
export const minDeviation = (A, n) => 2 * Math.asin(Math.min(1, n * Math.sin(A / 2))) - A;
/** Deviation of a prism of apex A for a ray entering at θ1 (rad) from the first face's normal; NaN if it cannot leave. */
export function prismDeviation(A, n, th1) {
  const t2 = Math.asin(Math.sin(th1) / n), t3 = A - t2, s4 = n * Math.sin(t3);
  if (Math.abs(s4) > 1) return NaN;
  return th1 + Math.asin(s4) - A;
}
