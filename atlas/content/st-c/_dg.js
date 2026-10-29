// Shared helpers for the st-c (Differential Geometry) lessons: small vector
// algebra for computing answer keys, the Frenet apparatus from derivative
// vectors, and picture builders (a parametric surface drawn as a mesh of its
// coordinate curves for calc-vectors3d).

export const r6 = (x) => Math.round(x * 1e6) / 1e6;
export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => Math.sqrt(dot(a, a));
export const add = (a, b) => a.map((x, i) => x + b[i]);
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const scale = (a, k) => a.map((x) => x * k);
export const unit = (a) => scale(a, 1 / norm(a));

/** The Frenet apparatus of a space curve at a point, from r′, r″, r‴ (any parameter). */
export function frenet(d1, d2, d3) {
  const c = cross(d1, d2), v = norm(d1), cl = norm(c);
  const T = unit(d1), B = unit(c), N = cross(B, T);
  return { speed: v, T, N, B, kappa: cl / v ** 3, tau: dot(c, d3) / (cl * cl) };
}

/** Signed curvature of a plane curve from x′, y′, x″, y″. */
export const kappaSigned = (x1, y1, x2, y2) => (x1 * y2 - y1 * x2) / Math.pow(x1 * x1 + y1 * y1, 1.5);

/**
 * A parametric surface as a mesh of coordinate curves, for calc-vectors3d.
 * X(u, v) returns three expression strings; u and v are spliced in bracketed.
 */
export function mesh(X, [u0, u1], [v0, v1], { nu = 10, nv = 10, color = 'ink3', width = 1, when, closedU = false, closedV = false } = {}) {
  const out = [];
  const W = when ? { when } : {};
  const nU = closedU ? nu : nu + 1, nV = closedV ? nv : nv + 1;
  for (let i = 0; i < nU; i++) {
    const u = r6(u0 + ((u1 - u0) * i) / nu);
    out.push({ param: X(`(${u})`, 't'), t: [v0, v1], color, width, ...W });
  }
  for (let j = 0; j < nV; j++) {
    const v = r6(v0 + ((v1 - v0) * j) / nv);
    out.push({ param: X('t', `(${v})`), t: [u0, u1], color, width, ...W });
  }
  return out;
}
