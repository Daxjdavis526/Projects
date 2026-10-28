// Shared helpers for PHYS 4600 modules M0–M2 (induction, Maxwell's equations
// and the conservation laws): CODATA 2022 constants (re-exported from
// PHYS 3600's helpers), material conductivities with their sources, complete
// elliptic integrals by the arithmetic–geometric mean, the mutual inductance
// of two coaxial circular loops (closed form, and Neumann's double integral
// done numerically as a check), and builders for static graph pictures:
// out-of-page and into-page markers, a solenoid seen end-on, a parallel-plate
// capacitor seen from the side. Files whose names start with "_" are helpers,
// not lessons.

import { MU0, PI, gauss } from '../phys3600/_mag.js';

export { MU0, EPS0, QE, ME, PI, DEG, KM, sf, th, circle, polygon, bare, gauss, arrowsAt, grid, is } from '../phys3600/_mag.js';

/** Speed of light, m/s (exact). */
export const C = 299792458;

/**
 * Conductivities σ in S/m at 20 °C, from the resistivities in Griffiths,
 * Introduction to Electrodynamics (4th ed.), Table 7.1 (CRC Handbook), except
 * seawater (about 4.8 S/m at 20 °C and salinity 35 — it varies with both).
 */
export const SIGMA = {
  copper: { name: 'copper', sigma: 1 / 1.68e-8 },
  aluminium: { name: 'aluminium', sigma: 1 / 2.65e-8 },
  silver: { name: 'silver', sigma: 1 / 1.59e-8 },
  iron: { name: 'iron', sigma: 1 / 9.61e-8 },
  seawater: { name: 'seawater', sigma: 4.8 },
};

/** The arithmetic–geometric mean of a and b. */
function agm(a, b) {
  for (let k = 0; k < 40 && Math.abs(a - b) > 1e-15 * a; k++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return a;
}

/** Complete elliptic integrals K(k) and E(k) (modulus k, 0 ≤ k < 1), by the AGM. */
export function ellipKE(k) {
  let a = 1, b = Math.sqrt(1 - k * k), c = k, sum = 0.5 * c * c, p = 0.5;
  for (let n = 1; n < 40 && Math.abs(c) > 1e-16; n++) {
    c = (a - b) / 2;
    [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
    p *= 2;
    sum += p * c * c;
  }
  const K = PI / (2 * a);
  return { K, E: K * (1 - sum) };
}

/** Mutual inductance (H) of two coaxial circular loops of radii a and b (m), a distance z (m) apart: Maxwell's closed form. */
export function mutualLoops(a, b, z) {
  const k2 = (4 * a * b) / ((a + b) ** 2 + z * z), k = Math.sqrt(k2);
  const { K, E } = ellipKE(k);
  return MU0 * Math.sqrt(a * b) * ((2 / k - k) * K - (2 / k) * E);
}

/** The same mutual inductance from Neumann's formula, (μ₀/4π)∮∮ dl₁·dl₂ / |r₁ − r₂|, by quadrature (a check). */
export function neumannLoops(a, b, z) {
  // by symmetry the double integral is 2π times the single integral over the angle between the two points
  const f = (p) => (a * b * Math.cos(p)) / Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(p) + z * z);
  return (MU0 / (4 * PI)) * 2 * PI * gauss(f, 0, 2 * PI, 32);
}

/** Far-apart coaxial loops (z ≫ a, b): M ≈ μ₀πa²b²/2z³. */
export const mutualFar = (a, b, z) => (MU0 * PI * a * a * b * b) / (2 * z ** 3);

// ── pictures ──

const r4 = (v) => +(+v).toPrecision(4);

/** A ⊙ marker (out of the page) as graph points: a ring and a dot. */
export const outOf = (x, y, color = 'accent', r = 6) => [{ x: r4(x), y: r4(y), r, color, hollow: true }, { x: r4(x), y: r4(y), r: 1.8, color }];

/** A ⊗ marker (into the page) as graph points: a ring with a × centred in it. */
export const into = (x, y, color = 'accent', r = 6) => [{ x: r4(x), y: r4(y), r, color, hollow: true }, { x: r4(x), y: r4(y), r: 0, label: '×', labelAlign: 'center', labelDx: 0, labelDy: 0, color }];

/** A label with no dot. */
export const tag = (x, y, label, color = 'ink2', extra = {}) => ({ x: r4(x), y: r4(y), r: 0, label, color, ...extra });

/** Circling arrows (counterclockwise if sense > 0) on a circle of radius s about (cx, cy): n short arrows. */
export function circArrows(s, n = 4, sense = 1, color = 'warn', cx = 0, cy = 0, len = 0.5, phase = 0.4) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = phase + (2 * PI * k) / n, x = cx + s * Math.cos(a), y = cy + s * Math.sin(a);
    const tx = -Math.sin(a) * sense, ty = Math.cos(a) * sense, h = (len / 2);
    out.push({ from: [r4(x - tx * h), r4(y - ty * h)], to: [r4(x + tx * h), r4(y + ty * h)], color, width: 2 });
  }
  return out;
}
