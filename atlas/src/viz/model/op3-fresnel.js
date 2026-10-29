// Fresnel (near-field) diffraction, DOM-free: the physics behind
// sims/op3-fresnel.js, tested headlessly in test/op3-fresnel.test.mjs.
// Scalar, paraxial Fresnel–Kirchhoff theory with the obliquity factor taken
// as 1 (Hecht §10.3):
//
//   zones     a plane wave (or a point source at R0) on a circular aperture or
//             a disc, seen on the axis at distance L: the half-period zones of
//             radii ρ_m = √(mλ R0 L/(R0 + L)), the Fresnel number
//             N_F = a²(1/L + 1/R0)/λ (how many zones the aperture holds), the
//             on-axis irradiance 4 sin²(πN_F/2) behind a hole and exactly the
//             unobstructed value behind a disc (Arago/Poisson's spot); the
//             vibration curve U(φ) = 1 − e^{iφ}, φ = πρ²/(λL) in units of the
//             unobstructed field
//   cornu     the Fresnel integrals C(v), S(v) and the Cornu (Euler) spiral;
//             a straight edge, I/I₀ = ½[(½ + C(v))² + (½ + S(v))²], ¼ at the
//             geometric shadow and 1.37 at the first maximum; a slit,
//             I/I₀ = ½[(ΔC)² + (ΔS)²] between v₁ and v₂, with v = y√(2/(λL))
//   plates    a Fresnel zone plate's foci at f/m (odd m), f = ρ₁²/λ

const PI = Math.PI;

// 16-point Gauss–Legendre nodes and weights on [−1, 1]
const GL = [
  [0.0950125098376374, 0.1894506104550685], [0.2816035507792589, 0.1826034150449236],
  [0.4580167776572274, 0.1691565193950025], [0.6178762444026438, 0.1495959888165767],
  [0.7554044083550030, 0.1246289712555339], [0.8656312023878318, 0.0951585116824928],
  [0.9445750230732326, 0.0622535239386479], [0.9894009349916499, 0.0271524594117541],
];

/** The Fresnel integrals [C(x), S(x)] = ∫₀ˣ [cos, sin](πt²/2) dt, to about 1e-10. */
export function fresnelCS(x) {
  const s = Math.sign(x), a = Math.abs(x);
  if (a === 0) return [0, 0];
  let C, S;
  if (a <= 8) {
    // panels short enough that the phase πt²/2 turns by at most about 1.5 rad in each
    const n = Math.max(1, Math.ceil((a * a * PI) / 2 / 1.5));
    const h = a / n;
    C = 0; S = 0;
    for (let k = 0; k < n; k++) {
      const m = (k + 0.5) * h;
      for (const [u, w] of GL) for (const t of [m - (u * h) / 2, m + (u * h) / 2]) {
        const ph = (PI * t * t) / 2;
        C += (w * h) / 2 * Math.cos(ph); S += (w * h) / 2 * Math.sin(ph);
      }
    }
  } else {
    // asymptotic: C = ½ + f sin − g cos, S = ½ − f cos − g sin (Abramowitz & Stegun 7.3.9–10, 7.3.27–28)
    const z = (PI * a * a) / 2, pz2 = 1 / (PI * a * a) ** 2;
    const f = (1 / (PI * a)) * (1 - 3 * pz2 + 105 * pz2 * pz2), g = (1 / (PI * PI * a * a * a)) * (1 - 15 * pz2 + 945 * pz2 * pz2);
    C = 0.5 + f * Math.sin(z) - g * Math.cos(z);
    S = 0.5 - f * Math.cos(z) - g * Math.sin(z);
  }
  return [s * C, s * S];
}

// ─── zones ──────────────────────────────────────────────────────────────────
/** The scale factor 1/R0 + 1/L (1/m); R0 = Infinity for a plane wave. */
const inv = (L, R0 = Infinity) => 1 / L + (Number.isFinite(R0) ? 1 / R0 : 0);
/** Radius of the outer edge of the m-th half-period zone (same length unit as λ, L, R0). */
export const zoneRadius = (m, lambda, L, R0 = Infinity) => Math.sqrt((m * lambda) / inv(L, R0));
/** The Fresnel number of a circular opening of radius a: the number of half-period zones it holds. */
export const fresnelNumber = (a, lambda, L, R0 = Infinity) => (a * a * inv(L, R0)) / lambda;
/** On-axis irradiance behind a circular hole, in units of the unobstructed irradiance. */
export const holeOnAxis = (NF) => 4 * Math.sin((PI * NF) / 2) ** 2;
/** On-axis irradiance behind an opaque disc (Arago/Poisson's spot), paraxial: always the unobstructed value. */
export const discOnAxis = () => 1;
/** The vibration curve: field on the axis from the zones out to phase φ = πρ²(1/L + 1/R0)/λ, unobstructed field = 1. */
export const vibration = (phi) => [1 - Math.cos(phi), -Math.sin(phi)];
/** The phase φ at the rim of an opening of Fresnel number N_F. */
export const rimPhase = (NF) => PI * NF;

// ─── cornu ──────────────────────────────────────────────────────────────────
/** The Fresnel scale: v = y · scale, scale = √(2(1/L + 1/R0)/λ). */
export const vScale = (lambda, L, R0 = Infinity) => Math.sqrt((2 * inv(L, R0)) / lambda);
/** A straight edge, opaque for y < 0: I/I₀ at scaled position v (v > 0 is the lit side). */
export function edgeIntensity(v) {
  const [C, S] = fresnelCS(v);
  return ((0.5 + C) ** 2 + (0.5 + S) ** 2) / 2;
}
/** A slit open from y₁ to y₂ seen at y, in scaled units: v₁ = (y₁ − y)·scale, v₂ = (y₂ − y)·scale. */
export function slitIntensity(v1, v2) {
  const [C1, S1] = fresnelCS(v1), [C2, S2] = fresnelCS(v2);
  return ((C2 - C1) ** 2 + (S2 - S1) ** 2) / 2;
}
/** The first (brightest) fringe outside a straight edge: v ≈ 1.2172, I/I₀ ≈ 1.3704. */
export function edgeFirstMax() {
  // golden-section search on [0.8, 1.6]
  let a = 0.8, b = 1.6;
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 80; i++) {
    const c = b - g * (b - a), d = a + g * (b - a);
    if (edgeIntensity(c) > edgeIntensity(d)) b = d; else a = c;
  }
  const v = (a + b) / 2;
  return { v, I: edgeIntensity(v) };
}

// ─── zone plates ────────────────────────────────────────────────────────────
/** The primary focal length of a zone plate whose first zone has radius ρ₁ (plane wave in). */
export const zonePlateFocus = (rho1, lambda) => (rho1 * rho1) / lambda;
