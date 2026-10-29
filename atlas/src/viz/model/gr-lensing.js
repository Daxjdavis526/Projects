// Gravitational lensing by a point mass, DOM-free. Weak-field bending
// α = 4GM/(c²b) (gravity.js), the thin-lens equation in units of the Einstein
// radius, β = θ − θ/|θ|², its two images and magnifications, the Einstein
// radius of a real lens, the bending seen from Earth for a star at angle Φ
// from the Sun, the focal distance of the Sun as a lens, and the shadow of a
// non-spinning black hole (critical impact parameter 3√3 GM/c²).
// Tested in test/gr-lensing.test.mjs.

import { deflection } from './gravity.js';

export const G = 6.674e-11, C = 2.998e8, M_SUN = 1.989e30;
export const AU = 1.495978707e11, PC = 3.0857e16;
export const RAD_TO_ARCSEC = (180 / Math.PI) * 3600;

/** GM/c², the mass as a length (m). */
export const massLength = (M) => (G * M) / (C * C);

/** Bending angle (rad) of a light ray passing mass M (kg) at impact parameter b (m), weak field. */
export const bend = (M, b) => deflection(b, massLength(M));

/**
 * Bending (rad) of starlight seen by an observer a distance d (m) from the
 * Sun, for a star at angle Φ (rad) from the Sun's centre: only the part of
 * the bending that happens before the light reaches the observer counts.
 * With b = d sin Φ the ray's closest approach: (4GM/c²b)(1 + cos Φ)/2.
 */
export function bendSeenFrom(M, d, phi) {
  const b = d * Math.sin(phi);
  return bend(M, b) * (1 + Math.cos(phi)) / 2;
}

/** Einstein radius (rad) of a point lens of mass M at distance DL with the source at DS (flat space: DLS = DS − DL). */
export const einsteinRadius = (M, DL, DS) => Math.sqrt((4 * massLength(M) * (DS - DL)) / (DL * DS));

/** The two images, in Einstein radii along the source's direction, for a source offset u = β/θ_E: [outer, inner]; the inner one is on the far side (negative). */
export function images(u) {
  const s = Math.sqrt(u * u + 4);
  return [(u + s) / 2, (u - s) / 2];
}

/** Brightening of the two images of a point source and their total, for offset u > 0. */
export function magnifications(u) {
  const total = (u * u + 2) / (u * Math.sqrt(u * u + 4));
  return { outer: (total + 1) / 2, inner: (total - 1) / 2, total };
}

/** Inverse ray shooting: the source-plane point β = θ − θ/|θ|² seen at sky position θ (Einstein radii). */
export function lensMap(tx, ty) {
  const r2 = tx * tx + ty * ty;
  return r2 === 0 ? [NaN, NaN] : [tx - tx / r2, ty - ty / r2];
}

/** Where light grazing a body of mass M and radius R comes to a focus behind it (m): b²c²/(4GM) with b = R. */
export const focalDistance = (M, R) => (R * R) / (4 * massLength(M));

/** Angular diameter (rad) of the shadow of a non-spinning black hole of mass M at distance D: 2·3√3·GM/(c²D). */
export const shadowDiameter = (M, D) => (2 * Math.sqrt(27) * massLength(M)) / D;
