/* =============================================================================
   FRAMES — coordinates, the body-fixed basis, and the floating origin
   -----------------------------------------------------------------------------
   Pure maths. No DOM, no three.js: this file runs in the browser, in the terrain
   workers and in Node tests alike.

   All world positions are plain JS numbers (doubles) in metres, in the Mean
   Earth / Polar Axis frame of DE421 — the frame LOLA, SLDEM2015 and LROC
   products are archived in. Latitude is planetocentric, longitude positive east.

   Nothing here ever produces a Float32Array. The bridge to float32 (and to
   three.js) happens exactly once, in the renderer, by subtracting the current
   floating origin.
   ========================================================================== */

import { R_MOON, GM_MOON, FRAME } from '../config.js';

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

/* --- conversions ----------------------------------------------------------- */

/** Longitude/latitude in degrees + height in metres -> ME cartesian metres. */
export function llhToXyz(latDeg, lonDeg, h = 0, out = { x: 0, y: 0, z: 0 }) {
  const lat = latDeg * DEG, lon = lonDeg * DEG;
  const r = R_MOON + h, c = Math.cos(lat);
  out.x = r * c * Math.cos(lon);
  out.y = r * c * Math.sin(lon);
  out.z = r * Math.sin(lat);
  return out;
}

/** ME cartesian metres -> { lat, lon (deg), h (m above the 1737.4 km datum) }. */
export function xyzToLlh(x, y, z, out = { lat: 0, lon: 0, h: 0 }) {
  const r = Math.hypot(x, y, z);
  out.lat = Math.asin(r > 0 ? z / r : 0) * RAD;
  out.lon = Math.atan2(y, x) * RAD;
  /* Exactly 180 is a discontinuity: the sign of longitude flips across it, and
     anything that keys a lattice or a texture off longitude flickers between
     the two sides. A hundred-nanodegree nudge is four millimetres on the
     ground and puts the value on one side of the seam and keeps it there. */
  if (out.lon >= 179.9999999) out.lon = 179.9999999;
  out.h = r - R_MOON;
  return out;
}

/** Unit vector towards a lat/lon. */
export function llToUnit(latDeg, lonDeg, out = { x: 0, y: 0, z: 0 }) {
  const lat = latDeg * DEG, lon = lonDeg * DEG, c = Math.cos(lat);
  out.x = c * Math.cos(lon); out.y = c * Math.sin(lon); out.z = Math.sin(lat);
  return out;
}

/** Unit vector -> { lat, lon } in degrees. */
export function unitToLl(x, y, z, out = { lat: 0, lon: 0 }) {
  out.lat = Math.asin(Math.max(-1, Math.min(1, z))) * RAD;
  out.lon = Math.atan2(y, x) * RAD;
  return out;
}

/** Wrap a longitude into [-180, 180). */
export function wrapLon(lonDeg) {
  let l = (lonDeg + 180) % 360;
  if (l < 0) l += 360;
  return l - 180;
}

/* --- local basis ----------------------------------------------------------- */

/**
 * East / North / Up unit vectors at a surface point, in ME coordinates.
 * At the poles east is degenerate; we fall back to the +X meridian so the basis
 * stays orthonormal and continuous enough to stand on.
 */
export function enuBasis(latDeg, lonDeg, out = { e: {}, n: {}, u: {} }) {
  const lat = latDeg * DEG, lon = lonDeg * DEG;
  const sla = Math.sin(lat), cla = Math.cos(lat);
  const slo = Math.sin(lon), clo = Math.cos(lon);
  out.u = { x: cla * clo, y: cla * slo, z: sla };
  out.e = { x: -slo, y: clo, z: 0 };
  out.n = { x: -sla * clo, y: -sla * slo, z: cla };
  if (Math.abs(cla) < 1e-9) {           // exactly at a pole
    out.e = { x: 0, y: 1, z: 0 };
    out.n = { x: -Math.sign(sla || 1), y: 0, z: 0 };
  }
  return out;
}

/**
 * Azimuth (degrees east of north) and elevation (degrees above the local
 * horizontal) of a direction, seen from a point on the surface.
 * `dir` must be a unit vector in ME coordinates.
 */
export function azEl(latDeg, lonDeg, dir, out = { az: 0, el: 0 }) {
  const b = enuBasis(latDeg, lonDeg);
  const de = dir.x * b.e.x + dir.y * b.e.y + dir.z * b.e.z;
  const dn = dir.x * b.n.x + dir.y * b.n.y + dir.z * b.n.z;
  const du = dir.x * b.u.x + dir.y * b.u.y + dir.z * b.u.z;
  out.az = wrapAz(Math.atan2(de, dn) * RAD);
  out.el = Math.asin(Math.max(-1, Math.min(1, du))) * RAD;
  return out;
}

export function wrapAz(az) {
  let a = az % 360;
  if (a < 0) a += 360;
  return a;
}

/* --- great-circle geometry ------------------------------------------------- */

/** Great-circle distance in metres between two lat/lon pairs on the datum. */
export function surfaceDistance(lat1, lon1, lat2, lon2) {
  const p1 = lat1 * DEG, p2 = lat2 * DEG, dl = (lon2 - lon1) * DEG;
  const s = Math.sin((p2 - p1) / 2) ** 2 +
            Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_MOON * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Initial bearing in degrees east of north from point 1 to point 2. */
export function bearing(lat1, lon1, lat2, lon2) {
  const p1 = lat1 * DEG, p2 = lat2 * DEG, dl = (lon2 - lon1) * DEG;
  return wrapAz(Math.atan2(Math.sin(dl) * Math.cos(p2),
    Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) * RAD);
}

/** Move `dist` metres from a point along a bearing, staying on the great circle. */
export function offsetLatLon(latDeg, lonDeg, bearingDeg, dist, out = { lat: 0, lon: 0 }) {
  const p1 = latDeg * DEG, l1 = lonDeg * DEG, b = bearingDeg * DEG, d = dist / R_MOON;
  const sp = Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b);
  const p2 = Math.asin(Math.max(-1, Math.min(1, sp)));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1),
                             Math.cos(d) - Math.sin(p1) * sp);
  out.lat = p2 * RAD; out.lon = wrapLon(l2 * RAD);
  return out;
}

/**
 * Distance to the visible horizon from an eye height, on a sphere of radius R.
 * On the Moon this is why the ground drops away so fast: 2.4 km at eye level,
 * against 4.7 km on Earth.
 */
export function horizonDistance(eyeHeight, R = R_MOON) {
  return Math.sqrt(Math.max(0, eyeHeight * (2 * R + eyeHeight)));
}

/* --- gravity --------------------------------------------------------------- */

/** Gravitational acceleration vector at a position (radial, GM/r^2). */
export function gravityAt(x, y, z, out = { x: 0, y: 0, z: 0 }) {
  const r2 = x * x + y * y + z * z;
  const r = Math.sqrt(r2);
  const a = -GM_MOON / (r2 * r);
  out.x = a * x; out.y = a * y; out.z = a * z;
  return out;
}

/** Scalar gravity at a radius. 1.6246 m/s^2 at the datum. */
export function gravityMagnitude(r = R_MOON) {
  return GM_MOON / (r * r);
}

/* --- vector helpers (plain objects, doubles) ------------------------------- */
export const v3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const add = (a, b, o = v3()) => (o.x = a.x + b.x, o.y = a.y + b.y, o.z = a.z + b.z, o);
export const sub = (a, b, o = v3()) => (o.x = a.x - b.x, o.y = a.y - b.y, o.z = a.z - b.z, o);
export const mul = (a, s, o = v3()) => (o.x = a.x * s, o.y = a.y * s, o.z = a.z * s, o);
export const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a, b, o = v3()) => {
  const x = a.y * b.z - a.z * b.y, y = a.z * b.x - a.x * b.z, z = a.x * b.y - a.y * b.x;
  o.x = x; o.y = y; o.z = z; return o;
};
export const len = (a) => Math.hypot(a.x, a.y, a.z);
export const norm = (a, o = v3()) => {
  const l = len(a) || 1;
  o.x = a.x / l; o.y = a.y / l; o.z = a.z / l; return o;
};
export const clone = (a) => ({ x: a.x, y: a.y, z: a.z });

/* --- 3x3 matrices (row-major arrays of 9) ---------------------------------- */

export function matMulVec(m, v, o = v3()) {
  const x = m[0] * v.x + m[1] * v.y + m[2] * v.z;
  const y = m[3] * v.x + m[4] * v.y + m[5] * v.z;
  const z = m[6] * v.x + m[7] * v.y + m[8] * v.z;
  o.x = x; o.y = y; o.z = z; return o;
}

export function matTransposeMulVec(m, v, o = v3()) {
  const x = m[0] * v.x + m[3] * v.y + m[6] * v.z;
  const y = m[1] * v.x + m[4] * v.y + m[7] * v.z;
  const z = m[2] * v.x + m[5] * v.y + m[8] * v.z;
  o.x = x; o.y = y; o.z = z; return o;
}

export function matMul(a, b) {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
    }
  }
  return o;
}

/* --- floating origin -------------------------------------------------------- */

/**
 * Keeps the renderer's coordinates small. World positions stay in doubles; the
 * renderer draws everything relative to `origin`, which is snapped to a lattice
 * so the procedural detail keyed to world position never shifts when it moves.
 */
export class FloatingOrigin {
  constructor() {
    this.origin = v3();
    /* How far the origin moved on the last re-base. Anything holding positions
       in render space has to be shifted by this, or it teleports. */
    this.lastShift = v3();
    this.version = 0;
  }

  /** Re-base if the point has drifted too far. Returns true if it moved. */
  update(x, y, z) {
    const dx = x - this.origin.x, dy = y - this.origin.y, dz = z - this.origin.z;
    if (dx * dx + dy * dy + dz * dz < FRAME.originRadius * FRAME.originRadius && this.version) {
      return false;
    }
    const L = FRAME.originLattice;
    const px = this.origin.x, py = this.origin.y, pz = this.origin.z;
    this.origin.x = Math.round(x / L) * L;
    this.origin.y = Math.round(y / L) * L;
    this.origin.z = Math.round(z / L) * L;
    this.lastShift.x = this.origin.x - px;
    this.lastShift.y = this.origin.y - py;
    this.lastShift.z = this.origin.z - pz;
    this.version++;
    return true;
  }

  /** World (double) -> render-relative (safe for float32). */
  toLocal(p, o = v3()) {
    o.x = p.x - this.origin.x;
    o.y = p.y - this.origin.y;
    o.z = p.z - this.origin.z;
    return o;
  }

  /** Render-relative -> world (double). */
  toWorld(p, o = v3()) {
    o.x = p.x + this.origin.x;
    o.y = p.y + this.origin.y;
    o.z = p.z + this.origin.z;
    return o;
  }
}
