// Vector geometry behind the calc-vectors3d simulation: dot and cross
// products, an orthonormal basis for a plane, and the point grids that draw
// planes, parallelograms, triangles and lines. DOM-free, so it is tested
// headlessly: node atlas/test/calc-vectors3d.test.mjs

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => { const l = length(a); return l > 0 ? scale(a, 1 / l) : [0, 0, 0]; };

/** Two unit vectors u, w with u ⟂ w and both ⟂ n (n need not be a unit vector). */
export function planeBasis(n) {
  const nn = unit(n);
  // start from the axis least aligned with n, so the cross product is never tiny
  const a = Math.abs(nn[0]) <= Math.abs(nn[1]) && Math.abs(nn[0]) <= Math.abs(nn[2]) ? [1, 0, 0]
    : Math.abs(nn[1]) <= Math.abs(nn[2]) ? [0, 1, 0] : [0, 0, 1];
  const u = unit(cross(nn, a));
  const w = cross(nn, u);
  return [u, w];
}

/** The point of the plane n·r = d nearest the origin. */
export const footOfPlane = (n, d) => scale(n, d / dot(n, n));

/** A square patch of the plane with normal n through `centre`, half-width `half`, as an (m+1)×(m+1) grid. */
export function planePatch(n, centre, half, m = 8) {
  const [u, w] = planeBasis(n);
  return Array.from({ length: m + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => {
    const s = -half + (2 * half * i) / m, t = -half + (2 * half * j) / m;
    return add(centre, add(scale(u, s), scale(w, t)));
  }));
}

/** The four corners of that patch, in order around it. */
export function planeCorners(n, centre, half) {
  const [u, w] = planeBasis(n);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => add(centre, add(scale(u, s * half), scale(w, t * half))));
}

/** The parallelogram at + s·u + t·v (0 ≤ s, t ≤ 1) as an (m+1)×(m+1) grid. */
export function parallelogramGrid(at, u, v, m = 6) {
  return Array.from({ length: m + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => add(at, add(scale(u, i / m), scale(v, j / m)))));
}

/** The triangle p0 p1 p2 as an (m+1)×(m+1) grid (the s = 0 row collapses onto p0). */
export function triangleGrid(p0, p1, p2, m = 6) {
  return Array.from({ length: m + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => {
    const s = i / m, t = j / m;
    return add(scale(p0, 1 - s), scale(add(scale(p1, 1 - t), scale(p2, t)), s));
  }));
}

/** Points p0 + t·dir for t from t0 to t1 in m steps (a line drawn in pieces, for depth sorting). */
export function linePoints(p0, dir, t0, t1, m = 24) {
  return Array.from({ length: m + 1 }, (_, k) => add(p0, scale(dir, t0 + ((t1 - t0) * k) / m)));
}

/** Parameter t where p0 + t·dir meets the plane n·r = d, or null if the line is parallel to it. */
export function linePlaneT(p0, dir, n, d) {
  const den = dot(n, dir);
  return Math.abs(den) < 1e-12 ? null : (d - dot(n, p0)) / den;
}

/** The orbiting camera's directions for a yaw and pitch, exactly as View3D builds them (z up; fwd runs from the eye to the target). */
export function cameraBasis(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const fwd = [-cp * cy, -cp * sy, -sp], right = [-sy, cy, 0];
  return { fwd, right, up: cross(right, fwd) };
}

/** Where points land in the frame, as tangents x/z and y/z from the view axis: { top, bot, lft, rgt }, or null if one is behind the eye. */
export function frameExtent(points, basis, target, dist) {
  let top = -Infinity, bot = Infinity, lft = Infinity, rgt = -Infinity;
  for (const p of points) {
    const d = sub(p, target), z = dot(d, basis.fwd) + dist;
    if (!(z > 1e-6)) return null;
    const x = dot(d, basis.right) / z, y = dot(d, basis.up) / z;
    top = Math.max(top, y); bot = Math.min(bot, y); lft = Math.min(lft, x); rgt = Math.max(rgt, x);
  }
  return { top, bot, lft, rgt };
}

/**
 * Frame a scene so every point is in view: starting from `target` and `dist`,
 * slide the aim (along z, and sideways only if needed) and back the camera off
 * until all points lie within ±halfW across and ±halfH up and down (tangents
 * of the half-angles of the frame). A scene that already fits is returned
 * unchanged. fixTarget / fixDist keep a lesson's own choice of either.
 */
export function frameScene(points, { yaw, pitch, target, dist, halfW, halfH, fixTarget = false, fixDist = false }) {
  const B = cameraBasis(yaw, pitch);
  let t = [...target], D = dist, recentred = 0;
  for (let k = 0; k < 80; k++) {
    const e = frameExtent(points, B, t, D);
    if (e && e.top <= halfH && e.bot >= -halfH && e.rgt <= halfW && e.lft >= -halfW) break;
    const spanFits = e && e.top - e.bot <= 2 * halfH && e.rgt - e.lft <= 2 * halfW;
    if (spanFits && !fixTarget && recentred < 8) {
      recentred++;
      const cy = (e.top + e.bot) / 2;
      if (e.top > halfH || e.bot < -halfH) {
        // slide the aim along z when that moves the picture up and down; from overhead, along the camera's up
        const cp = Math.cos(pitch);
        t = Math.abs(cp) > 0.3 ? add(t, [0, 0, (cy * D) / cp]) : add(t, scale(B.up, cy * D));
      }
      if (e.rgt > halfW || e.lft < -halfW) t = add(t, scale(B.right, ((e.lft + e.rgt) / 2) * D));
    } else if (!fixDist) { D *= 1.06; recentred = 0; }
    else break;
  }
  return { target: t, dist: D };
}
