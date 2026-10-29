// The nuclear model behind the qm-binding and qm-decay simulations.
//   node atlas/test/qm-nuclear.test.mjs

import * as Nu from '../src/viz/model/qm-nuclear.js';
import { makeRng } from '../src/core/rng.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// binding energy per nucleon against tabulated values (MeV): a wrong mass in the table would show up here
const TABLE = { 'H-2': 1.1123, 'He-4': 7.0739, 'Li-6': 5.3323, 'Li-7': 5.6063, 'Be-9': 6.4628, 'C-12': 7.6801, 'N-14': 7.4756, 'O-16': 7.9762, 'Ne-20': 8.0322, 'Si-28': 8.4477, 'Ca-40': 8.5513, 'Fe-56': 8.7903, 'Fe-58': 8.7922, 'Ni-62': 8.7945, 'Kr-84': 8.7173, 'Sn-120': 8.5045, 'Ba-138': 8.3934, 'Au-197': 7.9157, 'Pb-208': 7.8675, 'Bi-209': 7.8480, 'Ra-226': 7.6623, 'Th-232': 7.6151, 'U-235': 7.5909, 'U-238': 7.5701, 'Pu-239': 7.5603 };
for (const [name, ba] of Object.entries(TABLE)) check(`${name}: B/A = ${ba} MeV`, Math.abs(Nu.bindingPerNucleon(Nu.byName[name]) - ba) < 0.0015, String(Nu.bindingPerNucleon(Nu.byName[name])));
check('every nuclide has A = Z + N and a mass within 0.1 u of A', Nu.NUCLIDES.every((n) => n.A === n.Z + n.N && Math.abs(n.M - n.A) < 0.1));
check('every nuclide in the table is bound by 1 to 9 MeV per nucleon', Nu.NUCLIDES.every((n) => Nu.bindingPerNucleon(n) > 1 && Nu.bindingPerNucleon(n) < 9));
{
  const best = [...Nu.NUCLIDES].sort((a, b) => Nu.bindingPerNucleon(b) - Nu.bindingPerNucleon(a)).slice(0, 3).map((n) => n.name).join();
  check('the most tightly bound: nickel-62, then iron-58, then iron-56', best === 'Ni-62,Fe-58,Fe-56', best);
}
check('helium-4 is bound by 28.30 MeV in all', Math.abs(Nu.binding(Nu.byName['He-4']) - 28.296) < 0.002);
check('iron-56 is bound by 492.3 MeV', Math.abs(Nu.binding(Nu.byName['Fe-56']) - 492.26) < 0.01, String(Nu.binding(Nu.byName['Fe-56'])));
check('deuterium’s binding energy is 2.2246 MeV (the photodisintegration threshold)', Math.abs(Nu.binding(Nu.byName['H-2']) - 2.2246) < 0.0005);

// reactions
check('D + T → He-4 + n releases 17.59 MeV', Math.abs(Nu.qValue([Nu.byName['H-2'].M, Nu.byName['H-3'].M], [Nu.byName['He-4'].M, Nu.M_N]) - 17.589) < 0.002);
check('4 H → He-4 releases 26.73 MeV (the Sun’s net reaction, atomic masses)', Math.abs(Nu.qValue([4 * Nu.M_H], [Nu.byName['He-4'].M]) - 26.731) < 0.002);
check('Pu-238 → U-234 + α releases 5.593 MeV', Math.abs(Nu.qValue([Nu.byName['Pu-238'].M], [Nu.byName['U-234'].M, Nu.byName['He-4'].M]) - 5.593) < 0.002, String(Nu.qValue([Nu.byName['Pu-238'].M], [Nu.byName['U-234'].M, Nu.byName['He-4'].M])));
check('Ra-226 → Rn-222 + α releases 4.87 MeV', Math.abs(Nu.qValue([Nu.byName['Ra-226'].M], [Nu.byName['Rn-222'].M, Nu.byName['He-4'].M]) - 4.871) < 0.003);
check('C-14 → N-14 + e⁻ + ν̄ releases 0.156 MeV (atomic masses)', Math.abs(Nu.qValue([Nu.byName['C-14'].M], [Nu.byName['N-14'].M]) - 0.1565) < 0.001);

// liquid drop
check('the liquid drop gives B/A within 2% of iron-56 and uranium-238', Math.abs(Nu.semf(26, 56).B / 56 - 8.79) < 0.18 && Math.abs(Nu.semf(92, 238).B / 238 - 7.57) < 0.15, `${Nu.semf(26, 56).B / 56} ${Nu.semf(92, 238).B / 238}`);
check('its curve peaks near A = 60', (() => { let bestA = 0, best = 0; for (let A = 10; A <= 240; A++) { const v = Nu.semfCurve(A); if (v > best) { best = v; bestA = A; } } return bestA > 45 && bestA < 75; })());
check('surface and Coulomb terms both cost energy', Nu.semf(26, 56).surf > 0 && Nu.semf(26, 56).coul > 0);
check('nuclear radius: R = 1.2 fm × A^(1/3), 7.4 fm for U-238', Math.abs(Nu.radiusFm(238) - 7.437) < 0.001);

// decay
check('after one half-life half remains; after two, a quarter — not zero', Nu.remaining(1000, 5730, 5730) === 500 && Nu.remaining(1000, 11460, 5730) === 250);
check('λ = ln 2 / T, mean life = T / ln 2 = 1.443 T', near(Nu.decayConstant(10) * 10, Math.LN2) && Math.abs(Nu.meanLife(1) - 1.4427) < 1e-4);
check('a quarter of the carbon-14 left: 11 460 years', Math.abs(Nu.ageFromFraction(0.25, 5730) - 11460) < 1e-9);
check('activity A = λN', near(Nu.activity(1e6, 2), Math.LN2 * 5e5));
check('Pu-238 gives 0.57 W per gram', Math.abs(Nu.specificPower(87.7, 5.593, 238.0495601) - 0.568) < 0.002, String(Nu.specificPower(87.7, 5.593, 238.0495601)));
{
  // random decay times reproduce the exponential law (deterministic seed)
  const rng = makeRng(5), T = 3, n = 40000;
  let alive1 = 0, alive2 = 0;
  for (let i = 0; i < n; i++) { const t = Nu.decayTime(rng.next(), T); if (t > T) alive1++; if (t > 2 * T) alive2++; }
  check('sampled decay times: half survive one half-life, a quarter two', Math.abs(alive1 / n - 0.5) < 0.01 && Math.abs(alive2 / n - 0.25) < 0.01, `${alive1 / n} ${alive2 / n}`);
  // memorylessness: of those alive at T, half survive the next T
  const r2 = makeRng(6);
  let atT = 0, at2T = 0;
  for (let i = 0; i < n; i++) { const t = Nu.decayTime(r2.next(), T); if (t > T) { atT++; if (t > 2 * T) at2T++; } }
  check('no memory: survivors at one half-life are no likelier to decay next', Math.abs(at2T / atT - 0.5) < 0.012, String(at2T / atT));
}
check('isotope table: half-lives in their units', Nu.ISOTOPES.c14.T === 5730 && Nu.ISOTOPES.pu238.T === 87.7 && Nu.ISOTOPES.i131.unit === 'd' && Nu.ISOTOPES.tc99m.unit === 'h');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
