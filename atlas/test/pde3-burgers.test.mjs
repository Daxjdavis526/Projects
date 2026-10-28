// The model behind the pde3-burgers simulation: Burgers' equation solved by the
// Lax–Oleinik formula, checked against the characteristic solution before
// breaking, the closed-form breaking times (including the research notes'
// t* = √(e/2) at x = √2 for e^(−x²)), the two Riemann problems, the box's
// triangle wave, the Rankine–Hugoniot speed along computed shock paths,
// conservation of ∫u dx, and the two upwind schemes (the non-conservative one
// leaves the (1, 0) shock stuck at x = 0, as the notes report).
//   node atlas/test/pde3-burgers.test.mjs

import * as B from '../src/viz/model/pde3-burgers.js';
import { validate, defaults } from '../src/viz/sims/pde3-burgers.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// U0 differentiates to u0
for (const o of [{ profile: 'gauss', A: 1.3, w: 0.8 }, { profile: 'sine', A: -0.7, w: 1.5 }, { profile: 'nwave', A: 0.9, w: 1.2 }]) {
  let worst = 0;
  for (let x = -3; x <= 3; x += 0.173) worst = Math.max(worst, Math.abs((B.U0(o, x + 1e-5) - B.U0(o, x - 1e-5)) / 2e-5 - B.u0(o, x)), Math.abs((B.u0(o, x + 1e-6) - B.u0(o, x - 1e-6)) / 2e-6 - B.du0(o, x)));
  check(`${o.profile}: U0′ = u0 and du0 = u0′`, worst < 1e-6, worst.toExponential(2));
}

// breaking times: closed forms against −1/min u0′ sampled finely
for (const o of [{ profile: 'gauss', A: 1, w: 1 }, { profile: 'gauss', A: -0.6, w: 2 }, { profile: 'sine', A: 0.5, w: 1 }, { profile: 'sine', A: -1.2, w: 0.7 }, { profile: 'nwave', A: 1, w: 1 }, { profile: 'nwave', A: -0.8, w: 1.3 }]) {
  let m = Infinity, arg = 0;
  for (let x = -12; x <= 12; x += 1e-4) { const d = B.du0(o, x); if (d < m) { m = d; arg = x; } }
  const br = B.breaking(o);
  check(`${o.profile} A=${o.A}: t* = −1/min u0′`, close(br.t, -1 / m, 1e-6), `${br.t} vs ${-1 / m}`);
  check(`${o.profile} A=${o.A}: x = ξ + u0(ξ)t*`, close(br.x, br.xi + B.u0(o, br.xi) * br.t, 1e-12) && Math.abs(B.du0(o, br.xi) - m) < 1e-6, `${br.xi} vs ${arg}`);
}
const g = B.breaking({ profile: 'gauss', A: 1, w: 1 });
check('e^(−x²): t* = √(e/2) = 1.165822', close(g.t, Math.sqrt(Math.E / 2), 1e-12) && close(g.t, 1.165822, 1e-6));
check('e^(−x²): breaks at x = √2', close(g.x, Math.SQRT2, 1e-12));
check('sin x: t* = 1 at x = π', close(B.breaking({ profile: 'sine', A: 1, w: 1 }).t, 1, 1e-12) && close(B.breaking({ profile: 'sine', A: 1, w: 1 }).x, Math.PI, 1e-12));
check('a rising step never breaks', B.breaking({ profile: 'step', uL: 0, uR: 1 }) === null);

// before breaking, Lax–Oleinik = the characteristic solution
{
  const o = { profile: 'gauss', A: 1, w: 1 }, S = B.solver(o, -20, 20), t = 0.8 * g.t;
  let worst = 0;
  for (let x = -3; x <= 4; x += 0.11) {
    // the unique foot ξ with ξ + u0(ξ)t = x (monotone before breaking)
    let a = -20, b = 20;
    for (let k = 0; k < 80; k++) { const m = (a + b) / 2; if (B.charX(o, m, t) < x) a = m; else b = m; }
    worst = Math.max(worst, Math.abs(S.u(x, t) - B.u0(o, (a + b) / 2)));
  }
  check('gauss before breaking: u = u0(ξ) on characteristics', worst < 1e-6, worst.toExponential(2));
  check('gauss before breaking: no shocks', S.shocks(t, -5, 6).length === 0);
}

// Riemann problems
{
  const o = { profile: 'step', uL: 1, uR: 0 }, S = B.solver(o, -10, 10);
  const sh = S.shocks(2, -4, 4);
  check('(1, 0): one shock, at x = 1 when t = 2', sh.length === 1 && Math.abs(sh[0].x - 1) < 1e-4, JSON.stringify(sh));
  check('(1, 0): speed ½ by Rankine–Hugoniot', sh.length === 1 && close(sh[0].s, 0.5, 1e-6));
  check('(1, 0): u = 1 behind, 0 ahead', close(S.u(0.9, 2), 1, 1e-6) && Math.abs(S.u(1.1, 2)) < 1e-6);
  const R = B.solver({ profile: 'step', uL: 0, uR: 1 }, -10, 10);
  let worst = 0;
  for (let x = 0.05; x < 2; x += 0.05) worst = Math.max(worst, Math.abs(R.u(x, 2) - x / 2));
  check('(0, 1): the rarefaction fan u = x/t', worst < 1e-6, worst.toExponential(2));
  check('(0, 1): no shock', R.shocks(2, -4, 4).length === 0);
  const T = B.solver({ profile: 'step', uL: 2, uR: -1 }, -10, 10).shocks(1.5, -4, 4);
  check('(2, −1): shock speed ½, at x = 0.75 at t = 1.5', T.length === 1 && Math.abs(T[0].x - 0.75) < 1e-4);
}

// the box: shock at w + At/2, then −w + 2√(Awt) once the fan catches it; area 2Aw kept
{
  const o = { profile: 'box', A: 1, w: 1 }, S = B.solver(o, -12, 20);
  for (const t of [1, 3, 6, 12]) {
    const sh = S.shocks(t, -3, 10, 600);
    check(`box: shock at t = ${t}`, sh.length === 1 && Math.abs(sh[0].x - B.boxShock(1, 1, t)) < 2e-3, `${sh[0]?.x} vs ${B.boxShock(1, 1, t)}`);
    let area = 0;
    for (let x = -3; x < 10; x += 0.001) area += S.u(x + 0.0005, t) * 0.001;
    check(`box: ∫u dx = 2 at t = ${t}`, Math.abs(area - 2) < 3e-3, String(area));
  }
}

// Rankine–Hugoniot along computed paths: dx_s/dt = (u⁻ + u⁺)/2
for (const o of [{ profile: 'gauss', A: 1, w: 1 }, { profile: 'nwave', A: 1, w: 1 }, { profile: 'sine', A: 1, w: 1 }]) {
  const S = B.solver(o, -25, 25), t0 = 2.5 * B.breaking(o).t, dt = 1e-3;
  const a = S.shocks(t0 - dt, -6, 8), b = S.shocks(t0 + dt, -6, 8), c = S.shocks(t0, -6, 8);
  let worst = 0;
  c.forEach((s, i) => { worst = Math.max(worst, Math.abs((b[i].x - a[i].x) / (2 * dt) - s.s)); });
  check(`${o.profile}: shocks move at the Rankine–Hugoniot speed`, c.length > 0 && a.length === c.length && b.length === c.length && worst < 2e-3, `${c.length} shocks, worst ${worst.toExponential(2)}`);
  if (o.profile === 'nwave') check('N-wave: a front and a tail shock', c.length === 2 && c[0].x < 0 && c[1].x > 0, JSON.stringify(c));
}

// the schemes on the (1, 0) Riemann problem at t = 2
{
  const o = { profile: 'step', uL: 1, uR: 0 };
  const where = (r) => { for (let j = 0; j < r.u.length; j++) if (r.u[j] < 0.5) return r.xs[j]; return NaN; };
  const C = B.scheme(o, 2, -4, 4, 400, 'conservative'), N = B.scheme(o, 2, -4, 4, 400, 'nonconservative');
  check('conservative upwind: shock near x = 1', Math.abs(where(C) - 1) < 0.05, String(where(C)));
  check('non-conservative upwind: shock stuck at x = 0', Math.abs(where(N)) < 0.05, String(where(N)));
  let mass = 0; for (const v of C.u) mass += v * 0.02;
  check('conservative scheme keeps ∫u dx (4, plus the inflow ½·t = 1)', Math.abs(mass - 5) < 1e-9, String(mass));
}

check('pde3-burgers defaults valid', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('pde3-burgers rejects an unknown profile', validate({ ...defaults, profile: 'tri' }).length > 0);
check('pde3-burgers rejects t > tmax', validate({ ...defaults, t: 9, tmax: 4 }).length > 0);

console.log(`pde3-burgers: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
