// Curvature helpers for the st-c lessons C15–C18 and the boss: custom 2D
// metrics in the shape model/dg4-metric2d.js expects (so its Christoffel,
// curvature, transport and geodesic routines work on surfaces that are not
// in its list), holonomy of a coordinate rectangle measured by transport, the
// area it encloses, and a few physical constants. Answer keys that come from
// closed forms are checked against these numerics by scratch scripts.

import * as D from '../../src/viz/model/dg4-metric2d.js';

export { D };

// ---- constants (SI; IAU 2015 nominal values, CODATA 2018)
export const C = 299792458;              // m/s
export const G = 6.6743e-11;             // m³ kg⁻¹ s⁻²
export const GM_SUN = 1.32712440018e20;  // m³/s²
export const GM_EARTH = 3.986004418e14;  // m³/s²
export const GM_MOON = 4.9028e12;        // m³/s²
export const R_EARTH_M = 6.371e6;        // m, mean radius
export const D_MOON = 3.844e8;           // m, mean Earth–Moon distance
export const MSUN_LEN = GM_SUN / (C * C);   // GM☉/c², 1476.6 m
export const MSUN_TIME = GM_SUN / C ** 3;   // GM☉/c³, 4.9255 μs

/**
 * A 2D metric for the dg4 model from g(a, b) → [g_aa, g_ab, g_bb]; its
 * derivatives by central differences (step h, accurate to ~1e-9 for smooth g).
 */
export function custom(g, { lorentz = false, valid = () => true, h = 1e-5, label = 'custom' } = {}) {
  const dg = (a, b) => {
    const pa = g(a + h, b), ma = g(a - h, b), pb = g(a, b + h), mb = g(a, b - h);
    return [pa.map((x, i) => (x - ma[i]) / (2 * h)), pb.map((x, i) => (x - mb[i]) / (2 * h))];
  };
  return { label, lorentz, valid: (a, b) => valid(a, b), cyclic: [], g: (a, b) => g(a, b), dg };
}

const segs = (pts, n) => {
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [p, q] = [pts[i], pts[i + 1]];
    for (let j = 0; j < n; j++) out.push([p[0] + ((q[0] - p[0]) * j) / n, p[1] + ((q[1] - p[1]) * j) / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
};

/**
 * The turn (radians, anticlockwise from ê_a toward ê_b) of a vector carried
 * once round the coordinate rectangle from (a0, b0): first along +a by da,
 * then +b by db, then back. Also returns the vector's components before and after.
 */
export function loopTurn(M, a0, b0, da, db, k, V0 = null, n = 200) {
  const path = segs([[a0, b0], [a0 + da, b0], [a0 + da, b0 + db], [a0, b0 + db], [a0, b0]], n);
  const V = V0 || D.frame(M, a0, b0, k).e1;
  const T = D.transport(M, path, V, k, 4);
  const V1 = T[T.length - 1];
  return { turn: D.turn(M, a0, b0, k, V, V1), V0: V, V1 };
}

/** ∬√|det g| da db over the rectangle, by the midpoint rule. */
export function rectArea(M, a0, b0, da, db, k, N = 60) {
  let A = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const a = a0 + ((i + 0.5) * da) / N, b = b0 + ((j + 0.5) * db) / N;
    const [[p, q], [, r]] = D.gMat(M, a, b, k);
    A += Math.sqrt(Math.abs(p * r - q * q));
  }
  return (A * Math.abs(da * db)) / (N * N);
}

/** ∬K√|det g| da db over the rectangle (K from the model's finite-difference curvature). */
export function rectCurvature(M, a0, b0, da, db, k, N = 30) {
  let S = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const a = a0 + ((i + 0.5) * da) / N, b = b0 + ((j + 0.5) * db) / N;
    const [[p, q], [, r]] = D.gMat(M, a, b, k);
    S += D.curvature(M, a, b, k).K * Math.sqrt(Math.abs(p * r - q * q));
  }
  return (S * Math.abs(da * db)) / (N * N);
}

/** Round to n significant figures, as a number. */
export const sigNum = (x, n = 4) => +(+x).toPrecision(n);

/** A quiver of arrows for a `graph`: field (fx, fy) given as JS functions, drawn on a grid, lengths scaled by s. */
export function quiver(fx, fy, xs, ys, s = 0.25, color = 'ink3', width = 1.2) {
  const out = [];
  for (const x of xs) for (const y of ys) {
    const u = fx(x, y), v = fy(x, y);
    if (Math.hypot(u, v) < 1e-9) continue;
    out.push({ from: [r4(x), r4(y)], to: [r4(x + s * u), r4(y + s * v)], color, width });
  }
  return out;
}
export const r4 = (v) => Math.round(v * 1e4) / 1e4;
