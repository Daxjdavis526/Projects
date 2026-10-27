// The parallel-plate capacitor model behind the em-capacitor simulation.
//   node atlas/test/em-capacitor.test.mjs

import * as M from '../src/viz/model/em-capacitor.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-12) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

check('ε₀ is the CODATA 2022 value', M.EPS0 === 8.8541878188e-12);
check('1 m² plates 1 mm apart: C ≈ 8.85 nF', near(M.parallelPlate(1, 1e-3), 8.8541878188e-9));
check('a 100 cm², 1 mm air gap is about 88.5 pF', Math.abs(M.parallelPlate(0.01, 1e-3) - 88.54e-12) < 0.01e-12);
check('a full slab multiplies C by κ', near(M.partialFill(0.02, 2e-3, 3.7, 1), 3.7 * M.parallelPlate(0.02, 2e-3)));
check('no slab leaves C alone', near(M.partialFill(0.02, 2e-3, 3.7, 0), M.parallelPlate(0.02, 2e-3)));
check('a thin slab in series: t → d gives κC, t → 0 gives C', near(M.slabOfThickness(0.02, 2e-3, 5, 2e-3), 5 * M.parallelPlate(0.02, 2e-3)) && near(M.slabOfThickness(0.02, 2e-3, 5, 0), M.parallelPlate(0.02, 2e-3)));

for (const kappa of [1, 2.1, 3.7, 80]) for (const f of [0, 0.3, 1]) for (const mode of ['battery', 'isolated']) {
  const A = 0.015, d = 1.5e-3, s = M.state({ A, d, kappa, f, mode, V: 12, Q: 5e-9 });
  const tag = `κ=${kappa} f=${f} ${mode}`;
  check(`${tag}: Q = CV`, near(s.Q, s.C * s.V));
  check(`${tag}: U = ½QV = ½CV² = Q²/2C`, near(s.U, 0.5 * s.C * s.V ** 2) && near(s.U, s.Q ** 2 / (2 * s.C)));
  check(`${tag}: the energy is the field’s: ∫u dV over the gap equals U`, near(s.uVac * A * (1 - f) * d + s.uDiel * A * f * d, s.U));
  check(`${tag}: the free charges add up to Q`, near(s.sigmaVac * A * (1 - f) + s.sigmaDiel * A * f, s.Q));
  check(`${tag}: inside the slab, free minus bound charge gives the same field (Gauss)`, near((s.sigmaDiel - s.sigmaBound) / M.EPS0, s.E) && near(s.sigmaVac / M.EPS0, s.E));
}
{
  // sliding a slab in: isolated, the energy falls (the slab is pulled in); on a battery, Q and U rise
  const base = { A: 0.01, d: 1e-3, kappa: 4 };
  const Q0 = M.state({ ...base, f: 0, V: 100 }).Q;
  const iso = [0, 0.25, 0.5, 1].map((f) => M.state({ ...base, f, mode: 'isolated', Q: Q0 }));
  check('isolated: inserting the slab lowers V and U, keeps Q', iso.every((s, i) => i === 0 || (s.V < iso[i - 1].V && s.U < iso[i - 1].U && near(s.Q, Q0))));
  check('isolated: fully inserted, V and U fall by κ', near(iso[3].V, 100 / 4) && near(iso[3].U, iso[0].U / 4));
  const bat = [0, 0.5, 1].map((f) => M.state({ ...base, f, mode: 'battery', V: 100 }));
  check('battery: inserting the slab raises Q and U by up to κ, keeps V and E', near(bat[2].Q, 4 * bat[0].Q) && near(bat[2].U, 4 * bat[0].U) && near(bat[1].E, bat[0].E));
  // the battery does work QV for the extra charge, half of which is stored: the rest pulls the slab in
  const W = (bat[2].Q - bat[0].Q) * 100, dU = bat[2].U - bat[0].U;
  check('battery: the battery’s work is twice the stored energy gained', near(W, 2 * dU));
}
check('bound charge: σ_b = σ_f(1 − 1/κ) is zero for vacuum', M.state({ A: 1, d: 1, kappa: 1, f: 1, V: 1 }).sigmaBound === 0);
check('the dielectric table: air breaks down at 3 MV/m, Teflon at 60 MV/m', M.DIELECTRICS.air.strength === 3e6 && M.DIELECTRICS.teflon.strength === 60e6 && M.DIELECTRICS.water.kappa === 80);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
