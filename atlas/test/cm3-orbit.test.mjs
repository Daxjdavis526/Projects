// The central-force orbit model behind cm3-orbit (PHYS 3550, M5): turning
// points against the Kepler conic, the orbit lying on r = p/(1 + e cos φ),
// energy and angular momentum conserved along the integrated path, Kepler's
// third law from the integrated time, the apsidal angle π/√(3 + n) for nearly
// circular power-law orbits (closed for n = −2 and n = 1), and the GR
// correction's advance ≈ 6πδ/p per orbit.
//   node atlas/test/cm3-orbit.test.mjs

import * as O from '../src/viz/model/cm3-orbit.js';
import { validate, defaults } from '../src/viz/sims/cm3-orbit.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));

// Kepler: turning points and the conic
for (const [E, L] of [[-0.3, 1], [-0.45, 0.9], [-0.1, 1.2], [-0.2, 0.5]]) {
  const P = { force: 'kepler', E, L };
  const tp = O.turning(P), el = O.keplerElements(E, L);
  check(`kepler rp (E=${E}, L=${L})`, close(tp.rp, el.rp, 1e-9), `${tp.rp} vs ${el.rp}`);
  check(`kepler ra (E=${E}, L=${L})`, close(tp.ra, el.ra, 1e-9), `${tp.ra} vs ${el.ra}`);
  check(`kepler bound (E=${E})`, tp.fate === 'bound');
  const o = O.orbit(P, { turns: 2, steps: 2000 });
  let worst = 0, worstE = 0, worstL = 0;
  for (let i = 0; i < o.r.length; i++) {
    const conic = el.p / (1 + el.e * Math.cos(o.phi[i]));
    worst = Math.max(worst, Math.abs(o.r[i] - conic) / conic);
  }
  // energy and angular momentum from finite differences in time
  for (let i = 5; i < o.r.length - 5; i += 37) {
    const dt = o.t[i + 1] - o.t[i - 1];
    const rd = (o.r[i + 1] - o.r[i - 1]) / dt, pd = (o.phi[i + 1] - o.phi[i - 1]) / dt;
    const Lnum = o.r[i] ** 2 * pd, Enum = 0.5 * (rd * rd + (o.r[i] * pd) ** 2) - 1 / o.r[i];
    worstL = Math.max(worstL, Math.abs(Lnum - L) / L); worstE = Math.max(worstE, Math.abs(Enum - E) / Math.abs(E));
  }
  check(`kepler orbit on the conic (E=${E}, L=${L})`, worst < 1e-7, `${worst}`);
  check(`kepler ℓ conserved (E=${E})`, worstL < 1e-4, `${worstL}`);
  check(`kepler E conserved (E=${E})`, worstE < 1e-4, `${worstE}`);
  check(`kepler apsidal angle is π (E=${E})`, close(o.apsidal, Math.PI, 1e-6), `${o.apsidal}`);
  // period from the integrated time: one radial period = time to φ = 2π; T = 2π a^{3/2}
  const j = o.phi.findIndex((p) => p >= 2 * Math.PI - 1e-9);
  check(`kepler period 2πa^1.5 (E=${E})`, close(o.t[j], 2 * Math.PI * el.a ** 1.5, 1e-6), `${o.t[j]} vs ${2 * Math.PI * el.a ** 1.5}`);
}
// unbound Kepler: one turning point, escape
{
  const tp = O.turning({ force: 'kepler', E: 0.2, L: 1 });
  check('kepler E > 0 escapes', tp.fate === 'escape' && tp.ra === null && close(tp.rp, O.keplerElements(0.2, 1).rp, 1e-9));
  const o = O.orbit({ force: 'kepler', E: 0.2, L: 1 });
  check('escape orbit returned whole (inbound mirror)', o.phi[0] < 0 && o.phi[o.phi.length - 1] > 0);
}
// circular: E at the floor
{
  const P = { force: 'kepler', E: -0.5, L: 1 };
  const tp = O.turning(P);
  check('kepler circle at r = ℓ²', tp.fate === 'circle' && close(tp.rc, 1, 1e-12));
  check('E below the floor is raised to it', O.turning({ force: 'kepler', E: -2, L: 1 }).fate === 'circle');
}
// power laws: rc and the small-oscillation apsidal angle
for (const n of [-2.5, -2, -1.5, -1, 0, 1, 2]) {
  const L = 1.1, P0 = { force: 'power', n, L, E: 0 };
  const { rc } = O.circular(P0);
  const lw = O.law(P0);
  check(`power n=${n}: F balances ℓ²/r³ at rc`, close(-lw.F(rc), (L * L) / rc ** 3, 1e-9));
  const Emin = O.ueff(lw, L)(rc);
  const P = { ...P0, E: Emin + 1e-6 * Math.max(1, Math.abs(Emin)) };
  const o = O.orbit(P, { turns: 2, steps: 4000 });
  check(`power n=${n}: nearly circular apsidal = π/√(3+n)`, close(o.apsidal, O.apsidalFormula(n), 2e-3), `${o.apsidal} vs ${O.apsidalFormula(n)}`);
  check(`power n=${n}: smallApsidal formula`, close(O.smallApsidal(P, rc), O.apsidalFormula(n), 1e-6));
}
// Bertrand's closed cases at large eccentricity: n = −2 (π) and n = 1 (π/2)
{
  const L = 1, Ps = { force: 'power', n: 1, L, E: 3 };
  const o = O.orbit(Ps, { turns: 2, steps: 4000 });
  check('spring: apsidal angle π/2 at any amplitude', close(o.apsidal, Math.PI / 2, 1e-6), `${o.apsidal}`);
  const Pg = { force: 'power', n: -2.5, L, E: -0.3 };
  const og = O.orbit(Pg, { turns: 3, steps: 4000 });
  check('n = −2.5 orbit is bound and precesses', og.fate === 'bound' && Math.abs(og.advance) > 0.5);
}
// GR: advance ≈ 6πδ/p for small δ (p = ℓ²)
for (const [d, L, E] of [[1e-4, 1, -0.45], [3e-4, 1.2, -0.3], [1e-4, 0.9, -0.5]]) {
  const P = { force: 'gr', delta: d, L, E };
  const o = O.orbit(P, { turns: 2, steps: 20000 });
  const pred = (6 * Math.PI * d) / (L * L);
  check(`gr advance ≈ 6πδ/ℓ² (δ=${d}, ℓ=${L})`, o.fate === 'bound' && close(o.advance, pred, 0.02), `${o.advance} vs ${pred}`);
}
// GR: no stable circle when ℓ² < 12δ
check('gr: no well when ℓ² < 12δ', O.circular({ force: 'gr', delta: 0.1, L: 1 }).rc === null);
// GR: E above the barrier plunges
{
  const P = { force: 'gr', delta: 0.06, L: 1, E: -0.01 };
  const tp = O.turning(P);
  check('gr: above the barrier the body plunges', tp.fate === 'plunge' && tp.Ebar < P.E);
}
// the sim's defaults validate, bad params do not
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('unknown force rejected', validate({ ...defaults, force: 'yukawa' }).length > 0);
check('n ≤ −3 rejected', validate({ ...defaults, force: 'power', n: -3 }).length > 0);
check('unknown readout rejected', validate({ ...defaults, readouts: ['zz'] }).length > 0);

console.log(`cm3-orbit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
