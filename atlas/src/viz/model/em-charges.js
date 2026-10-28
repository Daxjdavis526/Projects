// The DOM-free electrostatics behind sims/em-coulomb.js and sims/em-charging.js:
// Coulomb forces between point charges and their superposition; a conducting
// sphere near a point charge, solved exactly by image charges (its surface
// charge, its net charge when grounded, the force on it); a small insulating
// sphere in the dipole approximation; identical spheres sharing charge.
// Tested headlessly by test/em-charges.test.mjs.

/** Coulomb's constant k = 1/(4πε₀), N·m²/C², from CODATA 2022 ε₀ = 8.854 187 8188 × 10⁻¹² F/m. */
export const K = 8.98755178617e9;
/** The elementary charge, C (exact in the 2019 SI). */
export const E_CHARGE = 1.602176634e-19;

// ─── point charges ─────────────────────────────────────────────────────────

/** Magnitude of the Coulomb force between charges q1, q2 (C) a distance r (m) apart, N. */
export const coulomb = (q1, q2, r) => (K * Math.abs(q1 * q2)) / (r * r);

/**
 * The force on charge i from charge j, as a vector [Fx, Fy] in N: k q_i q_j r̂/r², with r̂ pointing
 * from j to i (so like charges push i away from j).
 */
export function forceFrom(ci, cj) {
  const dx = ci.x - cj.x, dy = ci.y - cj.y, r = Math.hypot(dx, dy);
  if (r === 0) return [NaN, NaN];
  const s = (K * ci.q * cj.q) / (r * r * r);
  return [s * dx, s * dy];
}

/**
 * Every force on charge `i` from the others, and their sum.
 * charges: [{ x, y, q }] (m, C). Returns { parts: [{ j, F: [Fx, Fy] }], net: [Fx, Fy] }.
 */
export function forcesOn(i, charges) {
  const parts = [];
  let fx = 0, fy = 0;
  charges.forEach((c, j) => {
    if (j === i) return;
    const F = forceFrom(charges[i], c);
    parts.push({ j, F });
    fx += F[0]; fy += F[1];
  });
  return { parts, net: [fx, fy] };
}

/**
 * Where on the line through two charges q1 (at 0) and q2 (at d) a third charge feels no force:
 * between them for like charges, outside on the side of the smaller one for unlike charges.
 * Returns the x coordinate (m), or null when q1 = −q2 (no such point).
 */
export function zeroForcePoint(q1, q2, d) {
  const s = Math.sqrt(Math.abs(q2 / q1));
  if (q1 * q2 > 0) return d / (1 + s);
  if (Math.abs(s - 1) < 1e-12) return null;
  return d / (1 - s);                        // outside: x < 0 if |q2| > |q1|, x > d if |q2| < |q1|
}

// ─── a conducting sphere near a point charge (image charges) ────────────────

/**
 * A conducting sphere of radius a, centred at the origin, with total charge qNet, and a point
 * charge Q on the +x axis at distance d > a from the centre. Its exterior field is that of an image
 * charge q' = −Qa/d at b = a²/d (toward Q) plus (qNet − q') at the centre.
 */
export function sphereImages({ Q, d, a, qNet = 0 }) {
  const qi = (-Q * a) / d, b = (a * a) / d;
  return { qi, b, qc: qNet - qi };
}

/**
 * Surface charge density (C/m²) on that sphere at polar angle θ from the +x axis (θ = 0 faces Q).
 */
export function sphereSigma(theta, { Q, d, a, qNet = 0 }) {
  const grounded = (-Q * (d * d - a * a)) / (4 * Math.PI * a * (a * a + d * d - 2 * a * d * Math.cos(theta)) ** 1.5);
  return grounded + (qNet + (Q * a) / d) / (4 * Math.PI * a * a);
}

/** The net charge a grounded conducting sphere takes up near Q: −Qa/d. */
export const groundedCharge = (Q, d, a) => (-Q * a) / d;

/**
 * The force on the sphere toward Q (positive = attraction), N. For qNet = 0 this is the attraction
 * kQ²a³(2d² − a²)/(d³(d² − a²)²) of a neutral conductor, whatever the sign of Q.
 */
export function forceOnSphere({ Q, d, a, qNet = 0 }) {
  const { qi, b, qc } = sphereImages({ Q, d, a, qNet });
  // The force on Q from the images, along +x (positive = pushed away from the sphere). By Newton's
  // third law the sphere feels the same size of force the other way: when Q is pushed away (+),
  // the sphere is pushed away from Q too, i.e. toward −x. So the sphere's force *toward* Q is −onQ.
  const onQ = K * Q * (qi / ((d - b) ** 2) + qc / (d * d));
  return -onQ;
}

/**
 * The force on a small insulating (dielectric) sphere of radius a and dielectric constant κ a
 * distance d from Q, toward Q, N — the dipole approximation (a ≪ d): the field polarizes it into a
 * dipole p = 4πε₀a³(κ − 1)/(κ + 2) E, which the non-uniform field pulls toward Q.
 */
export function forceOnDielectric({ Q, d, a, kappa }) {
  const f = (kappa - 1) / (kappa + 2);
  return (2 * f * K * Q * Q * a ** 3) / d ** 5;
}

// ─── sharing ───────────────────────────────────────────────────────────────

/** Two identical conducting spheres touched together end up with half the total each. */
export const share = (qa, qb) => [(qa + qb) / 2, (qa + qb) / 2];
/** A charge as a whole number of elementary charges (the sign kept): q/e, rounded. */
export const elementary = (q) => Math.round(q / E_CHARGE);
