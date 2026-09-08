/* =============================================================================
   CUBESPHERE — the quadtree's address space
   -----------------------------------------------------------------------------
   A sphere paved by six subdivided cube faces. This is how the whole Moon can
   be one seamless surface with no polar singularity and no seam at the date
   line: latitude/longitude only appears when a vertex asks the heightfield how
   high it is.

   Face coordinates u, v run -1..1. The tangent warp spreads the samples evenly
   over the sphere instead of bunching them at the face centres, which keeps the
   worst-case triangle size within a factor of 1.4 rather than 1.73.

   All six faces are laid out so that the cross product of the u and v tangents
   points outwards. Without that the two polar faces come out mirrored, their
   triangles face inwards, and half the Moon is quietly back-face culled.

   A tile is (face, level, i, j): at level L a face is 2^L tiles across, so a
   level-L tile spans (pi/2) * R / 2^L of arc. At level 18 that is 33 vertices
   across 10.4 m, or 33 cm between vertices.
   ========================================================================== */

import { R_MOON } from '../config.js';

export const FACES = 6;
const K = Math.PI / 4;

/** Face-local u,v in -1..1 -> unit vector on the sphere. */
export function faceUvToUnit(face, u, v, out = { x: 0, y: 0, z: 0 }) {
  const a = Math.tan(u * K), b = Math.tan(v * K);
  let x, y, z;
  switch (face) {
    case 0: x = 1; y = a; z = b; break;      // +X, through 0 N 0 E
    case 1: x = -1; y = -a; z = b; break;    // -X, through 0 N 180 E
    case 2: x = -a; y = 1; z = b; break;     // +Y, through 0 N 90 E
    case 3: x = a; y = -1; z = b; break;     // -Y, through 0 N 90 W
    case 4: x = a; y = b; z = 1; break;      // +Z, north pole
    default: x = a; y = -b; z = -1; break;   // -Z, south pole
  }
  const inv = 1 / Math.sqrt(x * x + y * y + z * z);
  out.x = x * inv; out.y = y * inv; out.z = z * inv;
  return out;
}

/** Unit vector -> { face, u, v }. */
export function unitToFaceUv(x, y, z, out = { face: 0, u: 0, v: 0 }) {
  const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
  let face, a, b;
  if (ax >= ay && ax >= az) {
    if (x > 0) { face = 0; a = y / x; b = z / x; }
    else { face = 1; a = y / x; b = -z / x; }
  } else if (ay >= az) {
    if (y > 0) { face = 2; a = -x / y; b = z / y; }
    else { face = 3; a = -x / y; b = -z / y; }
  } else {
    if (z > 0) { face = 4; a = x / z; b = y / z; }
    else { face = 5; a = -x / z; b = y / z; }
  }
  out.face = face;
  out.u = Math.atan(a) / K;
  out.v = Math.atan(b) / K;
  return out;
}

/** Arc length of one edge of a level-L tile, in metres. */
export function edgeArc(level) {
  return (Math.PI / 2) * R_MOON / (1 << level);
}

/** Vertex spacing inside a level-L tile with `verts` vertices per edge. */
export function vertexSpacing(level, verts) {
  return edgeArc(level) / (verts - 1);
}

/** u,v range covered by tile (level, i, j). */
export function tileBounds(level, i, j, out = { u0: 0, v0: 0, u1: 0, v1: 0 }) {
  const n = 1 << level, s = 2 / n;
  out.u0 = -1 + i * s; out.u1 = out.u0 + s;
  out.v0 = -1 + j * s; out.v1 = out.v0 + s;
  return out;
}

/** Position of vertex (a, b) of a `verts`-wide tile, in face coordinates. */
export function tileVertexUv(level, i, j, a, b, verts, out = { u: 0, v: 0 }) {
  const n = 1 << level, s = 2 / n, d = s / (verts - 1);
  out.u = -1 + i * s + a * d;
  out.v = -1 + j * s + b * d;
  return out;
}

/** Centre of a tile, as a unit vector. */
export function tileCentre(face, level, i, j, out = { x: 0, y: 0, z: 0 }) {
  const n = 1 << level, s = 2 / n;
  return faceUvToUnit(face, -1 + (i + 0.5) * s, -1 + (j + 0.5) * s, out);
}

/** Stable string key for maps. */
export function tileKey(face, level, i, j) {
  return `${face}:${level}:${i}:${j}`;
}

export function parseKey(key) {
  const [face, level, i, j] = key.split(':').map(Number);
  return { face, level, i, j };
}

/**
 * Bounding sphere of a tile in world metres: centre on the datum plus a radius
 * generous enough for the terrain's relief. Elevations run from -9 to +11 km.
 */
export function tileBoundingSphere(face, level, i, j, rMin = -9500, rMax = 11500,
                                   out = { x: 0, y: 0, z: 0, r: 0 }) {
  const c = tileCentre(face, level, i, j);
  const arc = edgeArc(level);
  const mid = R_MOON + (rMin + rMax) / 2;
  out.x = c.x * mid; out.y = c.y * mid; out.z = c.z * mid;
  /* Half the diagonal of the tile, plus the elevation spread, plus the sagitta
     of the arc so the sphere still contains a curved tile at low levels. */
  const sag = R_MOON * (1 - Math.cos(arc / (2 * R_MOON)));
  out.r = Math.hypot(arc * 0.75, (rMax - rMin) / 2) + sag;
  return out;
}

/**
 * Is a tile hidden behind the limb? The standard ellipsoidal horizon-culling
 * test: a point is occluded when it lies beyond the plane tangent to the
 * smallest sphere that fits inside the terrain.
 *
 * @param {object} cam    camera position in world metres
 * @param {object} sphere tile bounding sphere from tileBoundingSphere
 * @param {number} rMin   radius of the guaranteed-interior sphere
 */
export function belowHorizon(cam, sphere, rMin = R_MOON - 9500) {
  const cd2 = cam.x * cam.x + cam.y * cam.y + cam.z * cam.z;
  if (cd2 <= rMin * rMin) return false;               // inside the terrain shell
  const vx = sphere.x - cam.x, vy = sphere.y - cam.y, vz = sphere.z - cam.z;
  const dotCV = cam.x * vx + cam.y * vy + cam.z * vz;
  const t = -dotCV / (cd2 || 1);
  if (t < 0) return false;                            // the tile is in front
  const distToHorizonPlane = dotCV + (cd2 - rMin * rMin);
  return distToHorizonPlane < -sphere.r * Math.sqrt(cd2);
}

/** The four children of a tile. */
export function children(face, level, i, j) {
  return [
    [face, level + 1, i * 2, j * 2],
    [face, level + 1, i * 2 + 1, j * 2],
    [face, level + 1, i * 2, j * 2 + 1],
    [face, level + 1, i * 2 + 1, j * 2 + 1],
  ];
}

export function parent(face, level, i, j) {
  return level > 0 ? [face, level - 1, i >> 1, j >> 1] : null;
}

/**
 * Which tile contains a direction, at a given level, and where inside it.
 * `a` and `b` are fractional vertex coordinates, so the caller can interpolate
 * the tile's height grid directly.
 */
export function tileForUnit(level, x, y, z, verts = 33, out = {}) {
  const f = unitToFaceUv(x, y, z);
  const n = 1 << level;
  const fu = (f.u + 1) * 0.5 * n, fv = (f.v + 1) * 0.5 * n;
  const i = Math.min(n - 1, Math.max(0, Math.floor(fu)));
  const j = Math.min(n - 1, Math.max(0, Math.floor(fv)));
  out.face = f.face; out.level = level; out.i = i; out.j = j;
  out.a = (fu - i) * (verts - 1);
  out.b = (fv - j) * (verts - 1);
  return out;
}

/** Same, from latitude and longitude in degrees. */
export function tileForLatLon(level, latDeg, lonDeg, verts = 33, out = {}) {
  const la = latDeg * Math.PI / 180, lo = lonDeg * Math.PI / 180, c = Math.cos(la);
  return tileForUnit(level, c * Math.cos(lo), c * Math.sin(lo), Math.sin(la), verts, out);
}

/**
 * The level whose vertex spacing is closest to (but not finer than) a target,
 * used to pick a streaming request that matches the source resolution.
 */
export function levelForSpacing(spacing, verts) {
  let level = 0;
  while (level < 24 && vertexSpacing(level, verts) > spacing) level++;
  return level;
}
