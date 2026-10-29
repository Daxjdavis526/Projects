// The hydrogen model behind the qm-hydrogen simulation.
//   node atlas/test/qm-hydrogen.test.mjs

import * as Hy from '../src/viz/model/qm-hydrogen.js';
import { HC_EVNM } from '../src/viz/model/qm-light.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

check('R_H = 1.0967758e7 per metre (reduced mass included)', Math.abs(Hy.RH - 1.096775834e7) < 1, String(Hy.RH));
check('ground state: −13.598 eV (−13.606 eV for an infinitely heavy nucleus)', Math.abs(Hy.energy(1) + 13.59829) < 0.00001 && Math.abs(Hy.energyIon(1, 1) + 13.6057) < 0.0001, String(Hy.energy(1)));
check('E₂ = E₁/4, E₃ = E₁/9', near(Hy.energy(2), Hy.energy(1) / 4) && near(Hy.energy(3), Hy.energy(1) / 9));
check('He⁺ ground state is 4 × 13.6 = 54.4 eV deep', Math.abs(Hy.energyIon(1, 2) + 54.42) < 0.01);
// vacuum wavelengths quoted in the research notes (Bohr energies with reduced mass)
const want = [[3, 2, 656.470], [4, 2, 486.274], [2, 1, 121.568], [Infinity, 2, 364.705], [Infinity, 1, 91.176]];
for (const [ni, nf, nm] of want) check(`${ni} → ${nf}: ${nm} nm in vacuum`, Math.abs(Hy.lineNm(ni, nf) - nm) < 0.002, String(Hy.lineNm(ni, nf)));
check('photon energy and wavelength agree: E = hc/λ', near(Hy.lineEV(3, 2), HC_EVNM / Hy.lineNm(3, 2), 1e-9));
check('Hα in air is 656.28–656.29 nm', Math.abs(Hy.airNm(Hy.lineNm(3, 2)) - 656.285) < 0.01, String(Hy.airNm(Hy.lineNm(3, 2))));
check('Hβ in air is 486.13 nm', Math.abs(Hy.airNm(Hy.lineNm(4, 2)) - 486.13) < 0.02, String(Hy.airNm(Hy.lineNm(4, 2))));
check('air wavelengths are shorter by about 0.03%', Hy.airNm(500) < 500 && Hy.airNm(500) > 499.8);
// the Balmer series: four visible lines, the rest ultraviolet
const balmer = Hy.seriesLines(2, 9);
check('Balmer lines from n = 3 to 6 lie in 380–700 nm; n = 7 and up lie below 400 nm', balmer.filter((l) => l.nm > 400 && l.nm < 700).map((l) => l.ni).join() === '3,4,5,6', balmer.map((l) => l.nm.toFixed(1)).join(' '));
check('Lyman lines are all ultraviolet, Paschen lines all infrared', Hy.seriesLines(1).every((l) => l.nm < 125) && Hy.seriesLines(3).every((l) => l.nm > 800));
check('series lines crowd toward the limit', balmer.every((l, i) => i === 0 || l.nm < balmer[i - 1].nm) && balmer[balmer.length - 1].nm > Hy.lineNm(Infinity, 2));
// orbits and clouds
check('Bohr radius of n = 3 is 9 a₀ (with reduced mass, 4.765e-10 m)', Math.abs(Hy.bohrRadius(3) - 4.7651e-10) < 1e-13, String(Hy.bohrRadius(3)));
for (const n of [1, 2, 3, 5]) {
  let best = 0, rb = 0;
  for (let k = 1; k < 20000; k++) { const r = k * 0.005 * n; const p = Hy.radialP(r, n); if (p > best) { best = p; rb = r; } }
  check(`n = ${n}: the cloud is most likely at r = n² (in units of a₀/μ) and peaks at 1`, Math.abs(rb - n * n) < 0.01 * n * n && Math.abs(best - 1) < 1e-6, `${rb} ${best}`);
}
check('the cloud reaches inside and outside Bohr’s radius', Hy.radialP(0.5 * 9, 3) > 0.05 && Hy.radialP(1.6 * 9, 3) > 0.05);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
