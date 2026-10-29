// The DOM-free FLRW model behind the gr-friedmann simulation, checked against
// exact solutions and the numbers quoted in the cosmology lessons (research
// notes step 30–31 and Q4: Planck 2018, ages, distances, critical density).
//   node atlas/test/gr-cosmology.test.mjs

import * as K from '../src/viz/model/gr-cosmology.js';
import { validate } from '../src/viz/sims/gr-friedmann.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));

const PLANCK = { Om: 0.315, OL: 0.685 }, H = 67.4;
check('Hubble time 14.5 Gyr for H₀ = 67.4', near(K.hubbleTime(67.4), 14.51, 0.002), K.hubbleTime(67.4).toFixed(3));
check('Hubble time 13.4 Gyr for H₀ = 73.0', near(K.hubbleTime(73), 13.39, 0.002), K.hubbleTime(73).toFixed(3));
check('Hubble radius 4448 Mpc', near(K.hubbleRadius(67.4), 4448, 0.001), K.hubbleRadius(67.4).toFixed(1));
check('critical density 8.53×10⁻²⁷ kg/m³', near(K.rhoCrit(67.4), 8.53e-27, 0.003), K.rhoCrit(67.4).toExponential(4));
check('…about 5.1 protons per cubic metre', near(K.rhoCrit(67.4) / K.M_PROTON, 5.1, 0.01), (K.rhoCrit(67.4) / K.M_PROTON).toFixed(3));
check('q₀ = −0.53 (Planck)', near(K.q0(PLANCK), -0.5275, 1e-9));
check('acceleration began at z = 0.63', near(K.zAccel(PLANCK), 0.632, 0.002), K.zAccel(PLANCK).toFixed(4));
check('matter–Λ equality at z = 0.30', near(K.zEqualLambda(PLANCK), 0.296, 0.005), K.zEqualLambda(PLANCK).toFixed(4));

// ages
check('Planck ΛCDM age 13.80 Gyr (closed form)', near(K.ageFlat(0.315, H), 13.797, 0.001), K.ageFlat(0.315, H).toFixed(4));
check('…the same by quadrature', near(K.ageIntegral(PLANCK, H), K.ageFlat(0.315, H), 1e-5), K.ageIntegral(PLANCK, H).toFixed(5));
check('…13.79 Gyr with radiation (Ω_r = 9.1×10⁻⁵)', near(K.ageIntegral({ Om: 0.315 - 9.1e-5, OL: 0.685, Or: 9.1e-5 }, H), 13.787, 0.001), K.ageIntegral({ Om: 0.315 - 9.1e-5, OL: 0.685, Or: 9.1e-5 }, H).toFixed(4));
check('Einstein–de Sitter age 2/(3H₀) = 9.67 Gyr', near(K.ageIntegral({ Om: 1, OL: 0 }, H), (2 / 3) * K.hubbleTime(H), 1e-6) && near((2 / 3) * K.hubbleTime(H), 9.67, 0.002));
check('empty (Milne) universe: age exactly 1/H₀', near(K.ageIntegral({ Om: 0, OL: 0 }, H), K.hubbleTime(H), 1e-6));
for (const P of [PLANCK, { Om: 1, OL: 0 }, { Om: 0.3, OL: 0 }, { Om: 2, OL: 0 }, { Om: 0.3, OL: 0.3 }]) {
  const hst = K.history(P, H);
  check(`history age matches quadrature for Ω_m = ${P.Om}, Ω_Λ = ${P.OL}`, near(hst.age, K.ageIntegral(P, H), 0.002), `${hst.age} vs ${K.ageIntegral(P, H)}`);
}
{
  // closed matter-only Ω = 2: a cycloid; today η = π/2, lifetime π Ω/(Ω − 1)^{3/2} = 2π Hubble times
  const tH = K.hubbleTime(H), hst = K.history({ Om: 2, OL: 0 }, H, { tFuture: 200 });
  check('Ω_m = 2: age (π/2 − 1)/H₀', near(hst.age, (Math.PI / 2 - 1) * tH, 0.002), `${hst.age}`);
  check('Ω_m = 2: Big Crunch 2π/H₀ after the Big Bang', hst.crunch !== null && near(hst.crunch + hst.age, 2 * Math.PI * tH, 0.003), `${hst.crunch}`);
  check('Ω_m = 2: maximum expansion at a = 2', hst.maxExpansion && near(hst.maxExpansion.a, 2, 0.002), JSON.stringify(hst.maxExpansion));
}
{
  const dS = K.history({ Om: 0, OL: 1 }, H, { tPast: 60 });
  check('de Sitter (Ω_Λ = 1): no Big Bang in the finite past', dS.age === null);
  const bounce = K.history({ Om: 0.2, OL: 2.2 }, H, { tPast: 60 });
  check('Ω_m = 0.2, Ω_Λ = 2.2: the past has a bounce, not a Big Bang', bounce.age === null && bounce.bounce !== null, JSON.stringify(bounce.bounce));
}
check('fate: Planck expands forever, ever faster', K.fate(PLANCK, H).kind === 'forever-accel');
check('fate: Ω_m = 0.3, Ω_Λ = 0 expands forever, slowing', K.fate({ Om: 0.3, OL: 0 }, H).kind === 'forever');
check('fate: Ω_m = 1.05 recollapses (thousands of Gyr out)', K.fate({ Om: 1.05, OL: 0 }, H).kind === 'crunch');
check('fate: negative Λ always recollapses', K.fate({ Om: 0.3, OL: -0.2 }, H).kind === 'crunch');

// distances and lookback times (flat, Planck)
check('comoving distance to z = 1: 3.40 Gpc', near(K.comovingDistance(1, PLANCK, H), 3400, 0.004), K.comovingDistance(1, PLANCK, H).toFixed(1));
check('lookback time to z = 1: 7.95 Gyr', near(K.lookbackTime(1, PLANCK, H), 7.95, 0.003), K.lookbackTime(1, PLANCK, H).toFixed(4));
{
  const R = { Om: 0.315 - 9.1e-5, OL: 0.685, Or: 9.1e-5 };
  const dp = K.comovingDistance(Infinity, R, H) * K.LY_PER_MPC / 1e9;
  check('particle horizon ≈ 46 billion light-years', dp > 45 && dp < 47.5, dp.toFixed(2));
}
check('lookback time to z = ∞ approaches the age', near(K.lookbackTime(1e7, PLANCK, H), K.ageFlat(0.315, H), 0.002));

// the simulation's parameter check
check('gr-friedmann accepts its defaults', validate({}).length === 0);
check('gr-friedmann rejects negative matter', validate({ Om: -0.1 }).length > 0);
check('gr-friedmann rejects an unknown H₀', validate({ H0: 'fast' }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
