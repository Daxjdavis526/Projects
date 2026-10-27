// Geometry on the unit sphere: points, great-circle (geodesic) arcs, circles
// of latitude, and parallel transport of a tangent arrow along a path.
//
// Carrying an arrow along a great-circle arc without turning it is a rotation
// about that arc’s axis — the arrow keeps a fixed angle to the path — so
// transporting along a polyline of short great-circle steps is exact for
// that geodesic polygon, and converges to the smooth path as the steps
// shrink. Around a closed loop the arrow comes back rotated by the enclosed
// area (Gauss–Bonnet: on a sphere of radius R, by area/R² radians),
// anticlockwise for a loop that keeps the enclosed region on its left.
// DOM-free; tested in test/gr-foundations.test.mjs.

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => scale(a, 1 / (len(a) || 1));
const clamp1 = (x) => Math.max(-1, Math.min(1, x));

/** The point at colatitude θ (from the north pole) and longitude φ. */
export const sph = (theta, phi) => [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];

/** Great-circle distance (angle) between two unit vectors. */
export const arc = (p, q) => Math.atan2(len(cross(p, q)), dot(p, q));

/** Rotate v about the unit axis k by angle a (Rodrigues’ formula). */
export function rotate(v, k, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c)));
}

/** The point a fraction t of the way along the great-circle arc from p to q. */
export function slerp(p, q, t) {
  const w = arc(p, q);
  if (w < 1e-12) return p.slice();
  const a = Math.sin((1 - t) * w) / Math.sin(w), b = Math.sin(t * w) / Math.sin(w);
  return add(scale(p, a), scale(q, b));
}

/** A polyline of great-circle arcs through the vertices, closed back to the first. Returns { path, corners } (corner indices). */
export function geodesicPolygon(vertices, { closed = true, perRadian = 240 } = {}) {
  const path = [vertices[0]], corners = [0];
  const vs = closed ? [...vertices, vertices[0]] : vertices;
  for (let k = 0; k + 1 < vs.length; k++) {
    const n = Math.max(2, Math.ceil(arc(vs[k], vs[k + 1]) * perRadian));
    for (let j = 1; j <= n; j++) path.push(slerp(vs[k], vs[k + 1], j / n));
    corners.push(path.length - 1);
  }
  return { path, corners };
}

/** The circle of colatitude θ0, eastward from longitude φ0 to φ1. */
export function latitudeCircle(theta0, { phi0 = 0, phi1 = 2 * Math.PI, perRadian = 360 } = {}) {
  const n = Math.max(8, Math.ceil(Math.abs(phi1 - phi0) * perRadian));
  return Array.from({ length: n + 1 }, (_, k) => sph(theta0, phi0 + ((phi1 - phi0) * k) / n));
}

/** Parallel-transport the tangent arrow v0 along a path of unit vectors; returns the arrow at every point. */
export function transport(path, v0) {
  const size = len(v0);
  const out = [v0];
  let v = v0;
  for (let k = 0; k + 1 < path.length; k++) {
    const p = path[k], q = path[k + 1];
    const ax = cross(p, q), s = len(ax);
    if (s > 1e-15) v = rotate(v, scale(ax, 1 / s), Math.atan2(s, dot(p, q)));
    v = scale(unit(sub(v, scale(q, dot(v, q)))), size);        // stay tangent (removes round-off only)
    out.push(v);
  }
  return out;
}

/** Signed angle from tangent arrow a to tangent arrow b at point p: positive is anticlockwise seen from outside. */
export const tangentAngle = (p, a, b) => Math.atan2(dot(p, cross(a, b)), dot(a, b));

/** Unit tangent at p pointing along the great circle toward q. */
export const toward = (p, q) => unit(sub(q, scale(p, dot(p, q))));

/** Local north and east at p (not defined at the poles). */
export function northEast(p) {
  const east = unit(cross([0, 0, 1], p));
  return { north: cross(p, east), east };
}

/** Interior angles of the geodesic triangle a, b, c and its spherical excess (angle sum − π). */
export function triangle(a, b, c) {
  const at = (p, q, r) => Math.acos(clamp1(dot(toward(p, q), toward(p, r))));
  const angles = [at(a, b, c), at(b, c, a), at(c, a, b)];
  return { angles, excess: angles[0] + angles[1] + angles[2] - Math.PI };
}

/** Area of the cap above colatitude θ0 on the unit sphere. */
export const capArea = (theta0) => 2 * Math.PI * (1 - Math.cos(theta0));

/** The angle in [0, 2π) equivalent to a. */
export const wrap2pi = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
