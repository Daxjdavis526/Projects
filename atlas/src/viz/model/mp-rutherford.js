// Rutherford scattering, DOM-free (tested in test/mp-rutherford.test.mjs):
// an alpha particle of kinetic energy K passing a nucleus of charge Ze with
// impact parameter b follows one branch of a hyperbola. Everything scales
// with the head-on distance of closest approach (the "collision diameter")
// d = zZe²/(4πε₀K):
//   b = (d/2) cot(θ/2)                     impact parameter for scattering angle θ
//   r_min = (d/2)(1 + 1/sin(θ/2))          distance of closest approach
//   dσ/dΩ = (d/4)² / sin⁴(θ/2)            the Rutherford cross-section
// The nucleus is held fixed (its recoil ignored: a 2% effect for gold, more
// for light targets) and the motion is non-relativistic (an alpha of a few MeV
// moves at about 0.05c). Also: the deflection in J. J. Thomson's "plum
// pudding" atom, Geiger and Marsden's 1913 counts, and the fraction of a
// foil's alphas scattered beyond an angle. Used by the mp-rutherford
// simulation and the PHYS 2710 lesson on Rutherford scattering.

export const ALPHA_FS = 7.2973525643e-3;              // fine-structure constant (CODATA 2022)
export const HBARC = 197.3269804593;                  // MeV fm
export const KE2 = ALPHA_FS * HBARC;                  // e²/4πε₀ = 1.439 964 5 MeV fm
export const R0 = 1.2;                                // fm: nuclear radius R = R0·A^(1/3), a standard estimate
export const ATOM_R = 1e5;                            // fm: a Thomson atom's radius, 0.1 nm

export const TARGETS = {
  gold: { label: 'gold', symbol: 'Au', Z: 79, A: 197 },
  silver: { label: 'silver', symbol: 'Ag', Z: 47, A: 108 },
  copper: { label: 'copper', symbol: 'Cu', Z: 29, A: 64 },
  aluminium: { label: 'aluminium', symbol: 'Al', Z: 13, A: 27 },
};
export const ALPHA = { z: 2, A: 4 };

/** Nuclear radius (fm) from the mass number. */
export const nuclearRadius = (A) => R0 * Math.cbrt(A);
/** Head-on distance of closest approach, fm, for charges z and Z and kinetic energy K (MeV). */
export const collisionDiameter = (K, Z, z = 2) => (z * Z * KE2) / K;
/** Impact parameter (fm) that gives scattering angle θ (radians). */
export const impactParameter = (theta, d) => (d / 2) / Math.tan(theta / 2);
/** Scattering angle (radians) for impact parameter b: θ = 2 atan(d/2b); π for a head-on collision. */
export const angleFromB = (b, d) => (b <= 0 ? Math.PI : 2 * Math.atan(d / (2 * b)));
/** Distance of closest approach (fm) for impact parameter b. */
export const closestApproach = (b, d) => (d / 2) * (1 + Math.sqrt(1 + ((2 * b) / d) ** 2));
/** Rutherford differential cross-section, fm² per steradian. */
export const crossSection = (theta, d) => (d / 4) ** 2 / Math.sin(theta / 2) ** 4;
/** Fraction of alphas scattered beyond θ by a thin foil with n nuclei per m³ and thickness t (m): π n t b(θ)². */
export const fractionBeyond = (theta, d, n, t) => Math.PI * n * t * (impactParameter(theta, d) * 1e-15) ** 2;
/** Whether the alpha reaches the nucleus’s surface (Rutherford’s formula then fails): r_min below R_target + R_alpha. */
export const touches = (b, d, A) => closestApproach(b, d) < nuclearRadius(A) + nuclearRadius(ALPHA.A);
/** The alpha energy (MeV) at which a head-on alpha just touches a nucleus of charge Z and mass number A. */
export const touchingEnergy = (Z, A, z = 2) => (z * Z * KE2) / (nuclearRadius(A) + nuclearRadius(ALPHA.A));

/**
 * The orbit, nucleus at the origin, the alpha arriving from x = −∞ at height
 * b (fm; negative passes below and is pushed down). In polar form, with ψ the
 * angle from the incoming asymptote, 1/r = sin ψ / b + (d/2b²)(cos ψ − 1),
 * for 0 < ψ < π − θ. Returns points [x, y] (fm) reaching well beyond distance rmax.
 */
export function orbit(b, d, rmax = 300, n = 500) {
  if (Math.abs(b) < 1e-9) return [[-rmax, 0], [-d, 0], [-rmax, 0]];
  const s = Math.sign(b), B = Math.abs(b), D = d / (2 * B * B), th = angleFromB(B, d), psiMax = Math.PI - th;
  const pts = [], far = 6 * rmax;          // the hyperbola is followed well beyond the view, so its straight ends join smoothly
  for (let i = 1; i < n; i++) {
    const psi = (psiMax * i) / n, u = Math.sin(psi) / B + D * (Math.cos(psi) - 1);
    if (!(u > 0)) continue;
    const r = 1 / u;
    if (r > far) continue;
    pts.push([-r * Math.cos(psi), s * r * Math.sin(psi)]);
  }
  // the straight asymptotic ends, out to rmax: incoming along y = b, outgoing at angle θ
  const first = pts[0], last = pts[pts.length - 1];
  if (first) pts.unshift([Math.min(first[0], -far), b]);
  if (last) { const ux = Math.cos(th), uy = s * Math.sin(th), L = Math.max(0, far - Math.hypot(last[0], last[1])); pts.push([last[0] + ux * L, last[1] + uy * L]); }
  return pts;
}

/** Speed along the orbit as a fraction of the speed far away: energy conservation, v/v₀ = √(1 − d/r). */
export const speedFraction = (r, d) => Math.sqrt(Math.max(0, 1 - d / r));

/**
 * Deflection (radians) in Thomson's model: positive charge Ze spread evenly
 * through a sphere of radius R (fm), the electrons ignored (they are far too
 * light to turn an alpha). Inside, the sideways force is constant along the
 * chord, giving θ ≈ d·b·√(R² − b²)/R³; outside the neutral atom there is
 * none. Small-angle impulse approximation.
 */
export function thomsonDeflection(b, d, R = ATOM_R) {
  const B = Math.abs(b);
  if (B >= R) return 0;
  return (d * B * Math.sqrt(R * R - B * B)) / R ** 3;
}
/** The largest single-atom deflection in Thomson's model, d/2R (radians), at b = R/√2. */
export const thomsonMax = (d, R = ATOM_R) => d / (2 * R);

/**
 * Geiger & Marsden (1913, Phil. Mag. 25, 604): scintillations counted at each
 * angle from a gold foil, [angle (degrees), counts]. Rutherford’s law says
 * counts × sin⁴(θ/2) is constant.
 */
export const GM_GOLD = [[150, 33.1], [135, 43.0], [120, 51.9], [105, 69.5], [75, 211], [60, 477], [45, 1435], [37.5, 3300], [30, 7800], [22.5, 27300], [15, 132000]];
/** The constant counts × sin⁴(θ/2), averaged over the large-angle points (θ ≥ 45°), for drawing Rutherford’s curve through the data. */
export const GM_N0 = (() => {
  const big = GM_GOLD.filter(([a]) => a >= 45);
  return big.reduce((s, [a, n]) => s + n * Math.sin((a * Math.PI) / 360) ** 4, 0) / big.length;
})();
