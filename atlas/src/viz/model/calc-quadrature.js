// Numerical integration for sims/calc-quadrature.js: the composite midpoint,
// trapezoid and Simpson rules (on a function or on equally spaced samples),
// the parabolas Simpson's rule integrates, the textbook error bounds and the
// smallest n that meets a tolerance, and a high-accuracy reference integral.
// DOM-free and tested headlessly: node atlas/test/calc-quadrature.test.mjs

export const RULES = ['mid', 'trap', 'simpson'];
export const RULE_NAMES = { mid: 'Midpoint', trap: 'Trapezoid', simpson: 'Simpson' };

/** Composite midpoint rule M_n: n rectangles, each as tall as f at its centre. */
export function midpoint(f, a, b, n) {
  const h = (b - a) / n;
  let s = 0;
  for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h);
  return h * s;
}

/** Composite trapezoid rule T_n = (h/2)[f₀ + 2f₁ + … + 2fₙ₋₁ + fₙ]. */
export function trapezoid(f, a, b, n) {
  const h = (b - a) / n;
  let s = (f(a) + f(b)) / 2;
  for (let i = 1; i < n; i++) s += f(a + i * h);
  return h * s;
}

/** Composite Simpson rule S_n = (h/3)[f₀ + 4f₁ + 2f₂ + … + 4fₙ₋₁ + fₙ]; n must be even. */
export function simpsonRule(f, a, b, n) {
  if (!Number.isInteger(n) || n < 2 || n % 2) throw new Error('Simpson’s rule needs an even number of subintervals');
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (h / 3) * s;
}

/** Any of the three rules by name ('mid', 'trap', 'simpson'). */
export function applyRule(rule, f, a, b, n) {
  if (rule === 'mid') return midpoint(f, a, b, n);
  if (rule === 'trap') return trapezoid(f, a, b, n);
  if (rule === 'simpson') return simpsonRule(f, a, b, n);
  throw new Error(`unknown rule ${rule}`);
}

/** Simpson weights 1, 4, 2, 4, …, 4, 1 for n subintervals (n + 1 nodes). */
export function simpsonWeights(n) {
  return Array.from({ length: n + 1 }, (_, i) => (i === 0 || i === n ? 1 : i % 2 ? 4 : 2));
}

/** Trapezoid rule on equally spaced samples ys with spacing h. */
export function trapezoidData(ys, h) {
  let s = 0;
  for (let i = 0; i + 1 < ys.length; i++) s += (ys[i] + ys[i + 1]) / 2;
  return h * s;
}

/** Simpson's rule on equally spaced samples (an odd number of them: an even number of intervals). */
export function simpsonData(ys, h) {
  const n = ys.length - 1;
  if (n < 2 || n % 2) throw new Error('Simpson’s rule needs an odd number of samples');
  return (h / 3) * simpsonWeights(n).reduce((s, w, i) => s + w * ys[i], 0);
}

/** The parabola through three points with distinct x, as a function (Lagrange form). */
export function parabola(x0, y0, x1, y1, x2, y2) {
  return (x) => y0 * ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2))
    + y1 * ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2))
    + y2 * ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
}

/**
 * The textbook error bounds on [a, b] with n subintervals: K bounds |f″| for
 * the midpoint (K(b−a)³/24n²) and trapezoid (K(b−a)³/12n²) rules, and |f⁗|
 * for Simpson's rule (K(b−a)⁵/180n⁴).
 */
export function errorBound(rule, K, a, b, n) {
  const L = b - a;
  if (rule === 'mid') return (K * L ** 3) / (24 * n * n);
  if (rule === 'trap') return (K * L ** 3) / (12 * n * n);
  if (rule === 'simpson') return (K * L ** 5) / (180 * n ** 4);
  throw new Error(`unknown rule ${rule}`);
}

/** The smallest n (even, for Simpson) whose error bound is at most tol. */
export function nForTolerance(rule, K, a, b, tol) {
  const L = b - a;
  let n = rule === 'simpson'
    ? Math.ceil(((K * L ** 5) / (180 * tol)) ** 0.25)
    : Math.ceil(Math.sqrt((K * L ** 3) / ((rule === 'mid' ? 24 : 12) * tol)));
  n = Math.max(1, n);
  // undo floating-point overshoot or undershoot at an exact boundary
  while (n > 1 && errorBound(rule, K, a, b, n - 1) <= tol) n--;
  while (errorBound(rule, K, a, b, n) > tol) n++;
  if (rule === 'simpson' && n % 2) n++;
  return rule === 'simpson' ? Math.max(2, n) : n;
}

// 5-point Gauss–Legendre nodes and weights on [−1, 1]
const GL_X = [0, -0.5384693101056831, 0.5384693101056831, -0.9061798459386640, 0.9061798459386640];
const GL_W = [0.5688888888888889, 0.4786286704993665, 0.4786286704993665, 0.2369268850561891, 0.2369268850561891];

/** A reference value of ∫ₐᵇ f for smooth f: composite 5-point Gauss–Legendre (error ~ h¹⁰). */
export function reference(f, a, b, panels = 200) {
  const h = (b - a) / panels;
  let s = 0;
  for (let p = 0; p < panels; p++) {
    const c = a + (p + 0.5) * h;
    for (let k = 0; k < 5; k++) s += GL_W[k] * f(c + (h / 2) * GL_X[k]);
  }
  return (h / 2) * s;
}

/** Signed errors (estimate − exact) of the three rules for each n (Simpson only for even n). */
export function errorTable(f, a, b, exact, ns) {
  return ns.map((n) => ({
    n,
    mid: midpoint(f, a, b, n) - exact,
    trap: trapezoid(f, a, b, n) - exact,
    simpson: n % 2 ? NaN : simpsonRule(f, a, b, n) - exact,
  }));
}
