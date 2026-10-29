// The DOM-free models behind the simulations: orbits in Newtonian gravity and
// Schwarzschild spacetime, special relativity, and the numerical routines.
//   node atlas/test/models.test.mjs

import * as G from '../src/viz/model/gravity.js';
import * as R from '../src/viz/model/relativity.js';
import { simpson, rk4, integrate, bisect, ellipK, deriv } from '../src/viz/model/numeric.js';
import { validate as validateGraph } from '../src/viz/sims/graph.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));

// ─── Schwarzschild ─────────────────────────────────────────────────────────
check('ISCO angular momentum is 2√3 M', near(G.Lcirc(6), 2 * Math.sqrt(3), 1e-12));
check('ISCO energy is √(8/9)', near(G.Ecirc(6), Math.sqrt(8 / 9), 1e-12));
check('binding efficiency at the ISCO ≈ 5.72%', near(1 - G.Ecirc(6), 0.0572, 0.002));
check('marginally bound orbit at 4M has E = 1', near(G.Ecirc(4), 1, 1e-12));
{
  // the light potential (1 − 2M/r)/r² peaks at the photon sphere, 3M
  let best = 0, rb = 0;
  for (let r = 2.01; r < 10; r += 0.0005) { const v = G.vEffLight(r); if (v > best) { best = v; rb = r; } }
  check('photon sphere at 3M', Math.abs(rb - 3) < 1e-3, rb.toFixed(4));
  check('critical impact parameter b = 3√3 M', near(1 / Math.sqrt(best), 3 * Math.sqrt(3), 1e-6));
}
{
  // for L < 2√3 M there is no maximum/minimum pair: no circular orbits
  const L = 3.3, dV = (r) => (G.vEffMassive(r + 1e-6, L) - G.vEffMassive(r - 1e-6, L)) / 2e-6;
  let signChanges = 0, prev = Math.sign(dV(2.5));
  for (let r = 2.6; r < 80; r += 0.05) { const s = Math.sign(dV(r)); if (s !== prev) signChanges++; prev = s; }
  check('below L = 2√3 M the effective potential has no extrema', signChanges === 0, String(signChanges));
}
{
  // weak field: perihelion advance per orbit → 6πM/p for a large orbit
  const r0 = 2000, L = Math.sqrt(1500);   // p = L²/M = 1500 M
  const res = G.orbitSchwarzschild({ r0, L, turns: 3, steps: 60000 });
  const adv = res.peri[1] - res.peri[0] - 2 * Math.PI;
  check('perihelion advance matches 6πM/p in the weak field', near(adv, G.advanceWeak(1500), 0.01), `${adv} vs ${G.advanceWeak(1500)}`);
  const newt = G.orbitSchwarzschild({ r0, L, turns: 3, steps: 60000, newtonian: true });
  const advN = newt.peri[1] - newt.peri[0] - 2 * Math.PI;
  check('Newtonian orbits close (no advance)', Math.abs(advN) < 1e-6, String(advN));
}
check('a low-angular-momentum orbit plunges', G.orbitSchwarzschild({ r0: 10, L: 3.2, turns: 3 }).captured);
check('static clock at r = 4M ticks at √(1/2)', near(G.staticClockRate(4), Math.SQRT1_2, 1e-12));
check('solar-limb deflection 1.751″', near(G.deflection(696340e3, 1476.625) * 206264.806, 1.751, 0.002), String(G.deflection(696340e3, 1476.625) * 206264.806));

// ─── special relativity ────────────────────────────────────────────────────
check('γ(0.6) = 1.25', near(R.gamma(0.6), 1.25, 1e-12));
for (const b of [0.3, -0.7, 0.95]) {
  const [t, x] = R.boost(3, 1.2, b);
  check(`a boost at β = ${b} preserves the interval`, near(R.interval(t, x), R.interval(3, 1.2), 1e-12));
}
check('velocity addition never exceeds c', R.addVelocities(0.9, 0.9) < 1 && near(R.addVelocities(0.5, 0.5), 0.8, 1e-12));
check('rapidities add', near(Math.tanh(R.rapidity(0.5) + R.rapidity(0.5)), R.addVelocities(0.5, 0.5), 1e-12));
check('Doppler factor at β = 0.6 is 1/2', near(R.doppler(0.6), 0.5, 1e-12));

// ─── numerics ──────────────────────────────────────────────────────────────
check('Simpson is exact for cubics', near(simpson((x) => x ** 3 - 2 * x + 1, 0, 2, 2), 4 - 4 + 2, 1e-12));
check('Simpson error falls like h⁴', (() => { const e1 = Math.abs(simpson(Math.sin, 0, Math.PI, 8) - 2), e2 = Math.abs(simpson(Math.sin, 0, Math.PI, 16) - 2); return e1 / e2 > 14 && e1 / e2 < 18; })());
check('RK4 solves y′ = y to 1e-10 over [0, 1]', near(integrate((t, y) => [y[0]], [1], 0, 1, 200).pop()[1], Math.E, 1e-10));
check('RK4 is fourth order', (() => { const err = (n) => Math.abs(integrate((t, y) => [y[0]], [1], 0, 1, n).pop()[1] - Math.E); const r = err(20) / err(40); return r > 14 && r < 18; })());
check('bisection finds √2', near(bisect((x) => x * x - 2, 0, 2), Math.SQRT2, 1e-12));
check('K(0) = π/2', near(ellipK(0), Math.PI / 2, 1e-14));
check('K(1/2) = 1.854074677301372', near(ellipK(0.5), 1.854074677301372, 1e-13));
check('central difference', near(deriv(Math.sin, 0.3), Math.cos(0.3), 1e-9));
void rk4;

// ─── graph spec validation ─────────────────────────────────────────────────
check('graph: a good spec validates', validateGraph({ sliders: [{ key: 'a', label: 'a', min: 0, max: 2, value: 1 }], curves: [{ fn: 'a*sin(x)' }], tangent: { fn: 'a*sin(x)', at: 1 }, readouts: [{ label: 's', expr: 'slope' }] }).length === 0);
check('graph: an unknown name is caught', validateGraph({ curves: [{ fn: 'b*sin(x)' }] }).length === 1);
check('graph: a slider outside its range is caught', validateGraph({ sliders: [{ key: 'a', label: 'a', min: 0, max: 2, value: 3 }] }).length === 1);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
