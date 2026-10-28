// Small numerical helpers for the st-g G4–G6 lessons (probability, matched
// filtering, variations, constraints). Pure functions, no DOM.

/** erfc(x), fractional error below 1.2×10⁻⁷ everywhere (Numerical Recipes’ erfcc). */
export function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

/** One-sided Gaussian tail P(Z > z). */
export const normalSf = (z) => 0.5 * erfc(z / Math.SQRT2);

/** P(|Z| < z): the fraction of a Gaussian within ±z standard deviations. */
export const normalWithin = (z) => 1 - erfc(z / Math.SQRT2);

/** The standard normal density. */
export const phi = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);

/** Round to n significant figures, as a number. */
export const sigNum = (x, n = 3) => +x.toPrecision(n);
