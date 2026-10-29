// Shared constants and helpers for the Intuition-Mode lessons of the Road's
// black-hole fast track (S05, S06, S12, S20–S25). Every number a lesson prints
// is computed from these, so a printed value and its answer key can never
// disagree. SI units unless a name says otherwise.

import { tex } from '../../src/core/format.js';

export const G = 6.674e-11;              // m³ kg⁻¹ s⁻²
export const C = 2.998e8;                // m/s
export const M_SUN = 1.989e30;           // kg
export const M_EARTH = 5.972e24;         // kg
export const R_EARTH = 6.371e6;          // m, mean radius
export const R_SUN = 6.957e8;            // m, IAU nominal
export const GM_EARTH = G * M_EARTH;     // m³/s²
export const g0 = 9.81;                  // m/s², standard surface gravity
export const DAY = 86400;                // s
export const YEAR = 365.25 * DAY;        // s (Julian year)
export const AU = 1.495978707e11;        // m
export const LY = 9.4607e15;             // m
export const PC = 3.0857e16;             // m
export const ARCSEC = Math.PI / 648000;  // rad per arcsecond

/** Schwarzschild radius r_s = 2GM/c², m. */
export const rs = (M) => (2 * G * M) / (C * C);
/** GM/c², the mass as a length, m. */
export const mLen = (M) => (G * M) / (C * C);
/** A number as TeX with n significant figures (×10ⁿ when large or small). */
export const sci = (x, n = 3) => tex(x, n);
/** Rounded to n significant figures, as a number. */
export const round = (x, n = 3) => {
  if (!x) return x;
  const p = 10 ** (n - 1 - Math.floor(Math.log10(Math.abs(x))));
  return Math.round(x * p) / p;
};
