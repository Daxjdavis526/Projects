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

/**
 * A "constraint counter" graph: one stacked bar of phase-space dimensions for
 * the chosen system — physical (green), removed by second-class constraints
 * (gold), removed by first-class constraints (red: the constraint surface) and
 * by the gauge freedom they generate (violet). systems: [{ label, N, F, S }]
 * with N configuration variables (per point, for a field), F first-class and
 * S second-class constraints. Returns graph params with a choice 'sys'.
 */
export function counterParams(systems, { value = 0, choice = true, hideDof = false } = {}) {
  const pick = (f) => systems.map((s, k) => `${f(s)}*step(0.5 - abs(sys - ${k}))`).join(' + ');
  const N2 = `(${pick((s) => 2 * s.N)})`, F = `(${pick((s) => s.F)})`, S = `(${pick((s) => s.S)})`;
  const phys = `(${N2} - 2*${F} - ${S})`;
  const top = Math.max(...systems.map((s) => 2 * s.N));
  const x0 = 1, x1 = 3;
  const seg = (lo, hi, color, alpha) => ({ fn: hi, lower: lo, from: x0, to: x1, color, alpha });
  const params = {
    x: [0, 8], y: [0, top + 1.5], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'phase-space dimensions', xticks: 0, yticks: Math.min(top + 1, 10),
    shade: [
      seg('0', phys, 'good', 0.7),
      seg(phys, `${phys} + ${S}`, 'gold', 0.6),
      seg(`${phys} + ${S}`, `${phys} + ${S} + ${F}`, 'bad', 0.6),
      seg(`${phys} + ${S} + ${F}`, N2, 'violet', 0.6),
    ],
    points: [
      { x: 3.2, y: `${phys}/2`, r: 0, label: 'physical: 2 × (degrees of freedom)', color: 'good', when: `step(${phys} - 0.5)` },
      { x: 3.2, y: `${phys} + ${S}/2`, r: 0, label: 'second-class constraints', color: 'gold', when: `step(${S} - 0.5)` },
      { x: 3.2, y: `${phys} + ${S} + ${F}/2`, r: 0, label: 'first-class constraints', color: 'bad', when: `step(${F} - 0.5)` },
      { x: 3.2, y: `${phys} + ${S} + 1.5*${F}`, r: 0, label: 'gauge directions they generate', color: 'violet', when: `step(${F} - 0.5)` },
    ],
    readouts: [
      { label: 'phase-space dimensions $2N$', expr: N2, digits: 2 },
      { label: 'first-class $F$', expr: F, digits: 2 },
      { label: 'second-class $S$', expr: S, digits: 2 },
      ...(hideDof ? [] : [{ label: 'degrees of freedom $(2N - 2F - S)/2$', expr: `${phys}/2`, digits: 2, zero: 0.01 }]),
    ],
  };
  if (choice) params.choices = [{ key: 'sys', label: 'System', options: systems.map((s, k) => [k, s.label]), value, explain: 'Each system’s variables (per point of space, for a field) and its constraints.' }];
  else params.constants = { sys: value };
  return params;
}
