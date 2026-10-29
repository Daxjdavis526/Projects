// The Baez–Bunn ball: a small ball of freely falling test particles, all at
// rest relative to one another at the moment of release. Gravity cannot be
// felt at the ball's centre (it falls with it), but the particles accelerate
// relative to the centre: along each principal axis i,
//
//     ξ̈_i = −k_i ξ_i,
//
// where the rates k_i (s⁻²) are the eigenvalues of the tidal tensor — in
// Newton's theory E_ij = ∂_i∂_jΦ; in general relativity c² times the curvature
// components R^i_0i0 in the ball's rest frame (equal to Newton's for a
// non-spinning mass, all the way to the horizon). Their sum is the Ricci
// part, which Einstein's equation ties to the matter at the ball:
//
//     V̈/V (at release) = −(k_x + k_y + k_z) = −4πG(ρ + 3p/c²) + Λc².
//
// What is left over (the traceless part) changes the ball's shape, not its
// volume: tides in empty space and gravitational waves (Weyl curvature).
// DOM-free; tested in test/gr-dustball.test.mjs.

export const G = 6.674e-11;              // m³ kg⁻¹ s⁻²
export const C = 2.998e8;                // m/s
export const M_SUN = 1.989e30;           // kg
export const LAMBDA = 1.1e-52;           // m⁻², the measured cosmological constant (Planck 2018: 1.09e-52)

/** Schwarzschild radius 2GM/c² for a given GM (m³/s²), m. */
export const horizon = (GM) => (2 * GM) / (C * C);

/**
 * Masses the ball can fall toward. `unit` is the length the distance slider
 * counts in (the body's radius, or its horizon), `range` the slider's range
 * in that unit.
 */
export const BODIES = {
  earth: { name: 'Earth', GM: 3.986004418e14, unit: 6.371e6, unitTeX: 'R_\\oplus', range: [1, 20], r: 1, color: 'teal', hole: false },
  bh: { name: '10 M☉ black hole', GM: 10 * G * M_SUN, unit: horizon(10 * G * M_SUN), unitTeX: 'r_s', range: [1, 300], r: 128, color: 'ink', hole: true },
  sgra: { name: 'Sagittarius A*', GM: 4.3e6 * G * M_SUN, unit: horizon(4.3e6 * G * M_SUN), unitTeX: 'r_s', range: [1, 300], r: 1, color: 'ink', hole: true },
};

/**
 * Principal relative-acceleration rates (s⁻²) at distance r (m) from a point
 * mass GM (m³/s²); x points along the line to the mass. A negative rate is a
 * stretch (the particles separate), a positive one a squeeze.
 */
export function tidalRates(GM, r) {
  const k = GM / r ** 3;
  return [-2 * k, k, k];
}

/**
 * The isotropic rate (s⁻²) from matter of density ρ (kg/m³) and pressure p
 * (Pa) at the ball, plus a cosmological constant Λ (m⁻²): the same on every
 * axis, so it changes the volume and not the shape.
 */
export function matterRate(rho, p = 0, lambda = 0) {
  return ((4 * Math.PI * G) / 3) * (rho + (3 * p) / (C * C)) - (lambda * C * C) / 3;
}

/** Rates for a ball at the centre of a uniform medium (ρ, p, Λ) and also in the tidal field of a distant mass. */
export function combinedRates({ GM = 0, r = Infinity, rho = 0, p = 0, lambda = 0 } = {}) {
  const t = GM > 0 && Number.isFinite(r) ? tidalRates(GM, r) : [0, 0, 0];
  const m = matterRate(rho, p, lambda);
  return t.map((x) => x + m);
}

/** V̈/V at the moment of release (s⁻²): minus the sum of the rates — the Ricci part. */
export const volumeAccel = (k) => -(k[0] + k[1] + k[2]);

/** The traceless (shape) part of the rates: what is left after the volume part is removed. */
export function shapeRates(k) {
  const mean = (k[0] + k[1] + k[2]) / 3;
  return k.map((x) => x - mean);
}

/**
 * Exact solution of ξ̈ = −kξ from rest, in a rate k held fixed: the factor by
 * which that axis of the ball has grown after time t (s).
 */
export function axisFactor(k, t) {
  if (k > 0) return Math.cos(Math.sqrt(k) * t);
  if (k < 0) return Math.cosh(Math.sqrt(-k) * t);
  return 1;
}

/** The ball's three axis factors after time t. */
export const ballAt = (k, t) => k.map((ki) => axisFactor(ki, t));

/** The ball's volume after time t, relative to the start. */
export const volumeAt = (k, t) => ballAt(k, t).reduce((a, b) => a * b, 1);

/** The natural time scale 1/√(max |k|), s (Infinity when nothing happens). */
export function timeScale(k) {
  const m = Math.max(...k.map(Math.abs));
  return m > 0 ? 1 / Math.sqrt(m) : Infinity;
}

/**
 * A gravitational wave of strain amplitude h travelling along z: the matrix
 * that maps the ball's (x, y) at rest to its shape at the given phase (rad).
 * Plus: x stretched by h/2 while y is squeezed by h/2; cross: the same
 * pattern turned by 45°. z (the direction of travel) is untouched.
 */
export function waveDeform(h, phase, pol = 'plus') {
  const s = 0.5 * h * Math.cos(phase);
  return pol === 'cross' ? [[1, s], [s, 1]] : [[1 + s, 0], [0, 1 - s]];
}

/** Area factor of a wave deformation (its determinant): 1 − s², second order in h. */
export const waveArea = (h, phase, pol = 'plus') => { const [[a, b], [c, d]] = waveDeform(h, phase, pol); return a * d - b * c; };

/**
 * Newtonian gravitational acceleration (m/s², a vector) at position x (m)
 * from a uniform sphere of mass GM/G and radius R centred at the origin:
 * linear in r inside, inverse-square outside. Used by the tests to check that
 * the tidal rates inside a uniform body are isotropic (pure volume change).
 */
export function uniformSphereAccel(GM, R, x) {
  const r = Math.hypot(x[0], x[1], x[2]);
  const f = r < R ? -GM / R ** 3 : -GM / r ** 3;
  return x.map((xi) => f * xi);
}

/**
 * A fixed set of n points filling the unit ball (a deterministic scatter, so
 * every drawing of the ball looks the same): [x, y, z] with |p| ≤ 1.
 */
export function dustPoints(n = 150) {
  let s = 12345;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const pts = [];
  while (pts.length < n) {
    const p = [2 * rnd() - 1, 2 * rnd() - 1, 2 * rnd() - 1];
    if (p[0] ** 2 + p[1] ** 2 + p[2] ** 2 <= 1) pts.push(p);
  }
  return pts;
}
