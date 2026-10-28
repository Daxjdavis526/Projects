// The first-order ODE model behind sims/de-slopefield.js and sims/de-stepper.js,
// checked against exact solutions and the theorems the lessons teach:
// Euler is first order, improved Euler and midpoint second, RK4 fourth;
// on y′ = f(t) improved Euler is the trapezoid rule and RK4 is Simpson's rule.
//   node atlas/test/de-ode.test.mjs

import { stages, step, solve, endValue, errorTable, observedOrder, reference, traceCurve, equilibria, METHODS, ORDER } from '../src/viz/model/de-ode.js';
import * as SF from '../src/viz/sims/de-slopefield.js';
import * as ST from '../src/viz/sims/de-stepper.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// one step on y′ = y from (0, 1) with h = 0.1, by hand
{
  const f = (t, y) => y, h = 0.1;
  check('Euler step: 1.1', near(step('euler', f, 0, 1, h), 1.1, 1e-15));
  check('Heun step: 1.105', near(step('heun', f, 0, 1, h), 1.105, 1e-15));
  check('midpoint step: 1.105', near(step('midpoint', f, 0, 1, h), 1.105, 1e-15));
  const s = stages('rk4', f, 0, 1, h);
  check('RK4 stage slopes 1, 1.05, 1.0525, 1.10525', [1, 1.05, 1.0525, 1.10525].every((k, i) => near(s.stages[i].k, k, 1e-14)), s.stages.map((q) => q.k).join(', '));
  check('RK4 stage times 0, h/2, h/2, h', [0, 0.05, 0.05, 0.1].every((tt, i) => near(s.stages[i].t, tt, 1e-15)));
  check('RK4 step 1.10517083…', near(s.y1, 1 + 0.1 + 0.005 + 0.1 ** 3 / 6 + 0.1 ** 4 / 24, 1e-15), String(s.y1));
}

// global errors on y′ = y, y(0) = 1, at T = 1 (exact e): the observed orders
{
  const f = (t, y) => y;
  for (const m of METHODS) {
    const tab = errorTable(m, f, 0, 1, 1, Math.E, { n0: 8, levels: 4 });
    const p = observedOrder(tab[2].error, tab[3].error);
    check(`${m} is order ${ORDER[m]} on y′ = y (observed ${p.toFixed(3)})`, near(p, ORDER[m], 0.08));
  }
  check('Euler with n steps gives (1 + 1/n)ⁿ', near(endValue('euler', f, 0, 1, 1, 10), (1.1) ** 10, 1e-12));
}

// a non-autonomous equation with a known solution: y′ = −2y + t, y(0) = 1 ⇒ y = t/2 − 1/4 + (5/4)e^(−2t)
{
  const f = (t, y) => -2 * y + t, Y = (t) => t / 2 - 0.25 + 1.25 * Math.exp(-2 * t);
  for (const m of METHODS) {
    const tab = errorTable(m, f, 0, 1, 2, Y(2), { n0: 16, levels: 3 });
    const p = observedOrder(tab[1].error, tab[2].error);
    check(`${m} is order ${ORDER[m]} on y′ = −2y + t (observed ${p.toFixed(3)})`, near(p, ORDER[m], 0.12));
  }
  check('the RK4 reference matches the exact y(2)', near(reference(f, 0, 1, 2), Y(2), 1e-12));
  const pts = solve('euler', f, 0, 1, 0.5, 4);
  check('solve returns n + 1 points ending at t = 2', pts.length === 5 && near(pts[4][0], 2, 1e-15));
  check('Euler by hand: y₁ = 0, y₂ = 0.25', near(pts[1][1], 0, 1e-15) && near(pts[2][1], 0.25, 1e-15));
}

// on y′ = f(t) the methods are quadrature rules
{
  const g = (t) => Math.exp(-t * t), f = (t) => g(t), a = 0, b = 2, n = 8, h = (b - a) / n;
  let trap = (g(a) + g(b)) / 2, simp = g(a) + g(b);
  for (let i = 1; i < n; i++) trap += g(a + i * h);
  trap *= h;
  for (let i = 1; i < 2 * n; i++) simp += (i % 2 ? 4 : 2) * g(a + (i * h) / 2);
  simp *= h / 6;
  check('improved Euler on y′ = f(t) is the trapezoid rule', near(endValue('heun', f, a, 0, b, n), trap, 1e-14));
  check('RK4 on y′ = f(t) is Simpson’s rule with step h/2', near(endValue('rk4', f, a, 0, b, n), simp, 1e-14));
}

// traced curves: y′ = y through (0, 1) reaches e at t = 1; y′ = y² through (0, 1) blows up before t = 1
{
  const c = traceCurve((t, y) => y, 0, 1, [-1, 1], [0, 3]);
  const last = c[c.length - 1], first = c[0];
  check('traceCurve y′ = y: ends at (1, e)', near(last[0], 1, 1e-12) && near(last[1], Math.E, 1e-6), JSON.stringify(last));
  check('traceCurve y′ = y: starts at (−1, 1/e)', near(first[0], -1, 1e-12) && near(first[1], 1 / Math.E, 1e-6), JSON.stringify(first));
  check('traceCurve points increase in t', c.every((p, i) => i === 0 || p[0] > c[i - 1][0]));
  const b = traceCurve((t, y) => y * y, 0, 1, [-2, 2], [-4, 4]);
  const end = b[b.length - 1];
  check('traceCurve y′ = y²: stops short of the blow-up at t = 1, above the window', end[0] < 1 && end[1] > 4, JSON.stringify(end));
  const e = traceCurve((t, y) => -t / y, 0, 2, [-3, 3], [-3, 3]);
  check('traceCurve y′ = −t/y: the half-circle ends where it turns vertical, never crossing y = 0', e.every((p) => p[1] > 0) && near(e[0][0], -2, 0.01) && near(e[e.length - 1][0], 2, 0.01), JSON.stringify([e[0], e[e.length - 1]]));
  const r = traceCurve((t, y) => 3 * Math.cbrt(y) ** 2, 0, 1, [-3, 3], [-3, 3]);
  const at = r.find((p) => p[0] >= 0.5);
  check('traceCurve y′ = 3y^(2/3) through (0, 1): the cubic (t + 1)³', near(at[1], (at[0] + 1) ** 3, 1e-5), JSON.stringify(at));
}

// equilibria and their stability
{
  const e1 = equilibria((y) => y * (1 - y), -1, 2);
  check('logistic: 0 unstable, 1 stable', e1.length === 2 && near(e1[0].y, 0, 1e-9) && e1[0].kind === 'unstable' && near(e1[1].y, 1, 1e-9) && e1[1].kind === 'stable', JSON.stringify(e1));
  const e2 = equilibria((y) => (y - 1) ** 2, -1, 3);
  check('(y − 1)²: one semi-stable equilibrium at 1', e2.length === 1 && near(e2[0].y, 1, 1e-6) && e2[0].kind === 'semi', JSON.stringify(e2));
  const e3 = equilibria((y) => y * (y - 2) * (y + 1) ** 2, -3, 3);
  check('y(y − 2)(y + 1)²: −1 semi, 0 stable, 2 unstable', e3.length === 3 && e3.map((e) => e.kind).join() === 'semi,stable,unstable', JSON.stringify(e3));
  const e4 = equilibria((y) => 0.5 * y * (1 - y / 10) - 1.25, 0, 12);
  check('harvested logistic at H = rK/4: one semi-stable equilibrium at K/2', e4.length === 1 && near(e4[0].y, 5, 1e-5) && e4[0].kind === 'semi', JSON.stringify(e4));
  check('no equilibria when g never vanishes', equilibria((y) => 1 + y * y, -5, 5).length === 0);
}

// the sims' validators accept good parameters and catch bad ones
{
  check('de-slopefield defaults validate', SF.validate({ ...SF.defaults }).length === 0, SF.validate({ ...SF.defaults }).join('; '));
  check('de-slopefield catches a bad expression', SF.validate({ ...SF.defaults, f: 'y^^2' }).length > 0);
  check('de-slopefield catches a curve with an unknown name', SF.validate({ ...SF.defaults, curves: [{ fn: 'q*t' }] }).length > 0);
  check('de-stepper defaults validate', ST.validate({ ...ST.defaults }).length === 0, ST.validate({ ...ST.defaults }).join('; '));
  check('de-stepper catches an unknown method', ST.validate({ ...ST.defaults, methods: ['euler', 'rk5'] }).length > 0);
  check('de-stepper catches a bad exact solution', ST.validate({ ...ST.defaults, exact: 'exp(' }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
