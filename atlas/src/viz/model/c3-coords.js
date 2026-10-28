// Cylindrical and spherical coordinates, DOM-free. The physics convention
// (ISO 80000-2) throughout: cylindrical (ρ, φ, z), spherical (r, θ, φ) with θ
// the polar angle from +z and φ the azimuth from +x toward +y. Many calculus
// texts write spherical as (ρ, θ, φ) with θ the azimuth and φ the polar
// angle; mathToPhysics converts. Angles are in radians here. Used by the
// c3-coords simulation; tested headlessly in test/c3-coords.test.mjs.

const { sin, cos, atan2, hypot, acos, PI } = Math;

export const cylToCart = (rho, phi, z) => [rho * cos(phi), rho * sin(phi), z];
export const sphToCart = (r, th, phi) => [r * sin(th) * cos(phi), r * sin(th) * sin(phi), r * cos(th)];

/** (x, y, z) → (ρ, φ, z), with φ in [0, 2π). */
export function cartToCyl(x, y, z) {
  let phi = atan2(y, x);
  if (phi < 0) phi += 2 * PI;
  return [hypot(x, y), phi, z];
}

/** (x, y, z) → (r, θ, φ): θ in [0, π] from +z, φ in [0, 2π). At the origin θ = φ = 0. */
export function cartToSph(x, y, z) {
  const r = hypot(x, y, z);
  let phi = atan2(y, x);
  if (phi < 0) phi += 2 * PI;
  return [r, r > 0 ? acos(Math.max(-1, Math.min(1, z / r))) : 0, phi];
}

/** A calculus text's spherical (ρ, θ_azimuth, φ_polar) as physics (r, θ_polar, φ_azimuth). */
export const mathToPhysics = (rho, thetaAz, phiPolar) => [rho, phiPolar, thetaAz];

/** Local unit vectors of cylindrical coordinates at azimuth φ: [ρ̂, φ̂, ẑ]. */
export const cylBasis = (phi) => [[cos(phi), sin(phi), 0], [-sin(phi), cos(phi), 0], [0, 0, 1]];

/** Local unit vectors of spherical coordinates at (θ, φ): [r̂, θ̂, φ̂]. */
export const sphBasis = (th, phi) => [
  [sin(th) * cos(phi), sin(th) * sin(phi), cos(th)],
  [cos(th) * cos(phi), cos(th) * sin(phi), -sin(th)],
  [-sin(phi), cos(phi), 0],
];

/** Scale factors: how far one unit of each coordinate moves you. Cylindrical (1, ρ, 1); spherical (1, r, r sin θ). */
export const cylScale = (rho) => [1, rho, 1];
export const sphScale = (r, th) => [1, r, r * sin(th)];

// a grid (m+1) × (k+1) of points f(s, t) for s, t running over [s0, s1] × [t0, t1]
function grid(f, [s0, s1], [t0, t1], m, k) {
  return Array.from({ length: m + 1 }, (_, i) => Array.from({ length: k + 1 }, (_, j) => f(s0 + ((s1 - s0) * i) / m, t0 + ((t1 - t0) * j) / k)));
}

/** The coordinate surfaces, as point grids for drawing. R: how far out to draw; H: half-height. */
export const surfaces = {
  cylinder: (rho, H, m = 40, k = 8) => grid((phi, z) => cylToCart(rho, phi, z), [0, 2 * PI], [-H, H], m, k),
  halfPlane: (phi, R, H, m = 6, k = 8) => grid((s, z) => cylToCart(s, phi, z), [0, R], [-H, H], m, k),
  disc: (z, R, m = 6, k = 40) => grid((s, phi) => cylToCart(s, phi, z), [0, R], [0, 2 * PI], m, k),
  sphere: (r, m = 18, k = 36) => grid((th, phi) => sphToCart(r, th, phi), [0, PI], [0, 2 * PI], m, k),
  cone: (th, R, m = 6, k = 40) => grid((s, phi) => sphToCart(s, th, phi), [0, R], [0, 2 * PI], m, k),
};

/** Points along a curve f(s) for s in [s0, s1]. */
export const curve = (f, s0, s1, n = 64) => Array.from({ length: n + 1 }, (_, i) => f(s0 + ((s1 - s0) * i) / n));

/**
 * The small "box" of a coordinate system at a point: its 8 corners, indexed
 * [i][j][k] for the three coordinates increased by 0 or by d, and its 12 edges
 * as point lists (arcs where an angle changes). sys: 'cylindrical' | 'spherical';
 * q: the point's coordinates; d: the three increments.
 */
export function element(sys, q, d, n = 8) {
  const at = sys === 'cylindrical' ? (a, b, c) => cylToCart(a, b, c) : (a, b, c) => sphToCart(a, b, c);
  const edges = [];
  for (let axis = 0; axis < 3; axis++) {
    for (const u of [0, 1]) for (const w of [0, 1]) {
      const pts = [];
      for (let s = 0; s <= n; s++) {
        const c = q.slice();
        c[axis] += (d[axis] * s) / n;
        const others = [0, 1, 2].filter((k) => k !== axis);
        c[others[0]] += d[others[0]] * u;
        c[others[1]] += d[others[1]] * w;
        pts.push(at(...c));
      }
      edges.push({ axis, pts });
    }
  }
  return edges;
}

/** Length of a polyline. */
export const length = (pts) => pts.reduce((s, p, i) => (i ? s + hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) : 0), 0);
