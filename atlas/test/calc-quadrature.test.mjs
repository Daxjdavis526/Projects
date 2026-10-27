// The numerical-integration model behind sims/calc-quadrature.js, checked
// against exact values, textbook examples and the theorems it illustrates.
//   node atlas/test/calc-quadrature.test.mjs

import { midpoint, trapezoid, simpsonRule, applyRule, simpsonWeights, trapezoidData, simpsonData, parabola, errorBound, nForTolerance, reference, errorTable } from '../src/viz/model/calc-quadrature.js';
import { validate, defaults } from '../src/viz/sims/calc-quadrature.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const sq = (x) => x * x, cube = (x) => x ** 3;

// OpenStax Calculus Vol. 2 §3.6: ∫₀¹ x² dx with n = 4 gives M₄ = 21/64 and T₄ = 11/32
check('M₄ for x² on [0, 1] is 21/64', near(midpoint(sq, 0, 1, 4), 21 / 64, 1e-15));
check('T₄ for x² on [0, 1] is 11/32', near(trapezoid(sq, 0, 1, 4), 11 / 32, 1e-15));

// Simpson's rule is exact for cubics (S₂ already)
check('S₂ for x³ on [0, 1] is exactly 1/4', near(simpsonRule(cube, 0, 1, 2), 0.25, 1e-15));
{
  const p = (x) => 2 * x ** 3 - x ** 2 + 3 * x - 5, P = (x) => x ** 4 / 2 - x ** 3 / 3 + 1.5 * x * x - 5 * x;
  check('Simpson exact for a general cubic, n = 2 and 6', [2, 6].every((n) => near(simpsonRule(p, -1, 2, n), P(2) - P(-1), 1e-12)));
}
let threw = false;
try { simpsonRule(sq, 0, 1, 3); } catch { threw = true; }
check('Simpson refuses an odd n', threw);
check('Simpson weights 1 4 2 4 1', simpsonWeights(4).join(' ') === '1 4 2 4 1');

// the identities linking the rules: T₂ₙ = (Tₙ + Mₙ)/2 and S₂ₙ = (2Mₙ + Tₙ)/3
for (const [f, a, b] of [[Math.exp, 0, 1], [Math.sin, 0, 2], [(x) => 1 / (1 + x * x), -1, 3]]) {
  const ok1 = [1, 2, 3, 5, 8].every((n) => near(trapezoid(f, a, b, 2 * n), (trapezoid(f, a, b, n) + midpoint(f, a, b, n)) / 2, 1e-13));
  const ok2 = [1, 2, 3, 5, 8].every((n) => near(simpsonRule(f, a, b, 2 * n), (2 * midpoint(f, a, b, n) + trapezoid(f, a, b, n)) / 3, 1e-13));
  check(`T₂ₙ = (Tₙ + Mₙ)/2 on [${a}, ${b}]`, ok1);
  check(`S₂ₙ = (2Mₙ + Tₙ)/3 on [${a}, ${b}]`, ok2);
}

// convergence orders: doubling n divides the error by about 4 (M, T) and 16 (S)
{
  const f = Math.exp, I = Math.E - 1;
  const ratio = (rule) => (applyRule(rule, f, 0, 1, 8) - I) / (applyRule(rule, f, 0, 1, 16) - I);
  check('trapezoid error ratio ≈ 4', near(ratio('trap'), 4, 0.02), String(ratio('trap')));
  check('midpoint error ratio ≈ 4', near(ratio('mid'), 4, 0.02), String(ratio('mid')));
  check('Simpson error ratio ≈ 16', near(ratio('simpson'), 16, 0.1), String(ratio('simpson')));
  // midpoint error ≈ −½ × trapezoid error
  const em = midpoint(f, 0, 1, 16) - I, et = trapezoid(f, 0, 1, 16) - I;
  check('midpoint error ≈ −½ trapezoid error', near(em / et, -0.5, 0.01), String(em / et));
}

// concavity: concave up → T over, M under; concave down → the reverse
check('eˣ (concave up): T overestimates, M underestimates', trapezoid(Math.exp, 0, 1, 6) > Math.E - 1 && midpoint(Math.exp, 0, 1, 6) < Math.E - 1);
check('sin x on [0, π] (concave down): T under, M over', trapezoid(Math.sin, 0, Math.PI, 6) < 2 && midpoint(Math.sin, 0, Math.PI, 6) > 2);

// the error bounds hold (eˣ on [0, 2]: |f″| = |f⁗| ≤ e²)
{
  const f = Math.exp, I = Math.exp(2) - 1, K = Math.exp(2);
  let ok = true;
  for (let n = 2; n <= 40; n += 2) {
    for (const r of ['mid', 'trap', 'simpson']) if (Math.abs(applyRule(r, f, 0, 2, n) - I) > errorBound(r, K, 0, 2, n)) ok = false;
  }
  check('|error| ≤ bound for all three rules, n = 2…40', ok);
}

// choosing n: OpenStax's trapezoid exercise (∫₁⁴ (5x² + 8) dx, error < 0.0001) needs n = 475
check('trapezoid n for 5x² + 8 on [1, 4], tol 1e-4 is 475', nForTolerance('trap', 10, 1, 4, 1e-4) === 475, String(nForTolerance('trap', 10, 1, 4, 1e-4)));
{
  const n = nForTolerance('simpson', 24, 1, 2, 1e-6);
  check('Simpson n for 1/x on [1, 2], tol 1e-6 is 20 (even, minimal)', n === 20 && errorBound('simpson', 24, 1, 2, n) <= 1e-6 && errorBound('simpson', 24, 1, 2, n - 2) > 1e-6, String(n));
  const m = nForTolerance('mid', 2, 0, 1, 1e-3);
  check('midpoint n is minimal', errorBound('mid', 2, 0, 1, m) <= 1e-3 && errorBound('mid', 2, 0, 1, m - 1) > 1e-3, String(m));
}

// the same rules on sampled data agree with the function versions
{
  const f = (x) => 3 + Math.sin(x) * x, a = 0.5, h = 0.25, n = 8;
  const ys = Array.from({ length: n + 1 }, (_, i) => f(a + i * h));
  check('trapezoidData = trapezoid on the same nodes', near(trapezoidData(ys, h), trapezoid(f, a, a + n * h, n), 1e-13));
  check('simpsonData = simpsonRule on the same nodes', near(simpsonData(ys, h), simpsonRule(f, a, a + n * h, n), 1e-13));
}

// the parabola through three points: it passes through them, and its exact area is one Simpson panel
{
  const p = parabola(1, 2, 1.5, 0.5, 2, 3);
  check('parabola passes through its points', near(p(1), 2, 1e-14) && near(p(1.5), 0.5, 1e-14) && near(p(2), 3, 1e-14));
  const area = reference(p, 1, 2, 4), panel = (0.5 / 3) * (2 + 4 * 0.5 + 3);
  check('area under the parabola = (h/3)(y₀ + 4y₁ + y₂)', near(area, panel, 1e-13));
}

// the reference integral
check('reference ∫₀¹ e^(−x²) = 0.7468241328124270', near(reference((x) => Math.exp(-x * x), 0, 1), 0.746824132812427, 1e-13));
check('reference ∫₀^π sin x = 2', near(reference(Math.sin, 0, Math.PI), 2, 1e-13));
{
  const tab = errorTable(Math.exp, 0, 1, Math.E - 1, [2, 3, 4]);
  check('errorTable: Simpson NaN for odd n, signs as expected', Number.isNaN(tab[1].simpson) && tab[0].trap > 0 && tab[0].mid < 0);
}

// the simulation's parameter checks
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('a bad expression is reported', validate({ ...defaults, functions: [{ fn: 'exp(-x^', a: 0, b: 1 }] }).length > 0);
check('an odd n is reported', validate({ ...defaults, n: 3 }).length > 0);
check('a < b is required', validate({ ...defaults, functions: [{ fn: 'x', a: 2, b: 1 }] }).length > 0);
check('Simpson on an even number of samples is reported', validate({ data: { y: [1, 2, 3, 4] }, rules: ['trap', 'simpson'] }).length > 0);
check('trapezoid-only data with any count is fine', validate({ data: { y: [1, 2, 3, 4], h: 0.5 }, rules: ['trap'] }).length === 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
