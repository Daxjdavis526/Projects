// Poynting flow in three quasistatic set-ups, DOM-free (tested in
// test/em4-poynting.test.mjs; drawn by sims/em4-poynting.js). SI units.
//
//   wire       a straight resistor of radius a and length L with a steady
//              current I and voltage V across it: at its surface E = V/L
//              along it, B = μ₀I/2πa round it, S = EB/μ₀ pointing straight
//              in; the inflow through the side, S·2πaL, is VI = I²R.
//   capacitor  circular plates (radius R, gap d) at voltage V, charging with
//              current I (negative: discharging): E = V/d uniform (fringing
//              ignored), B(s) = μ₀Is/2πR² inside the plates' radius, S(s) =
//              EB/μ₀ pointing toward the axis; the inflow through the rim,
//              S(R)·2πRd, is VI = d/dt(½CV²).
//   coax       a coaxial line (inner radius a, outer b) carrying I to a load
//              at voltage V: E = V/(s ln(b/a)), B = μ₀I/2πs, S = EB/μ₀ along
//              the line; ∫S·2πs ds from a to b is VI.

export const MU0 = 1.25663706127e-6;   // N/A², CODATA 2022
export const EPS0 = 8.8541878188e-12;  // F/m, CODATA 2022

/** The straight resistor. */
export function wire({ V, I, a, L }) {
  const E = V / L, B = (MU0 * I) / (2 * Math.PI * a), S = (E * B) / MU0;
  return { E, B, S, inflow: S * 2 * Math.PI * a * L, P: V * I, R: V / I };
}

/** The charging (I > 0) or discharging (I < 0) parallel-plate capacitor. */
export function capacitor({ V, I, R, d }) {
  const E = V / d, C = (EPS0 * Math.PI * R * R) / d;
  const B = (s) => (MU0 * I * Math.min(s, R)) / (2 * Math.PI * R * R) * (s > R ? R / s : 1);
  const S = (s) => (E * B(s)) / MU0;   // toward the axis when I > 0
  return { E, C, B, S, Brim: B(R), Srim: S(R), inflow: S(R) * 2 * Math.PI * R * d, dUdt: C * V * (I / C), U: 0.5 * C * V * V, dVdt: I / C };
}

/** The coaxial line. */
export function coax({ V, I, a, b }) {
  const ln = Math.log(b / a);
  const E = (s) => V / (s * ln), B = (s) => (MU0 * I) / (2 * Math.PI * s), S = (s) => (E(s) * B(s)) / MU0;
  // ∫ₐᵇ S(s) 2πs ds, by Simpson's rule on ln s (the integrand is VI/ln(b/a) per unit of ln s)
  const n = 200, h = ln / n;
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    const s = a * Math.exp(k * h), w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2;
    sum += w * S(s) * 2 * Math.PI * s * s;   // ds = s d(ln s)
  }
  return { E, B, S, flow: (sum * h) / 3, P: V * I };
}
