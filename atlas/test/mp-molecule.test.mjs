// The diatomic-molecule model behind the mp-molecule simulation.
//   node atlas/test/mp-molecule.test.mjs

import * as M from '../src/viz/model/mp-molecule.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

const co = M.constants('CO'), co13 = M.constants('CO13');
const rot = M.rotation(co, 30);
// measured CO lines (CDMS): 115.2712018, 230.5380000, 345.7959899 GHz; ¹³CO J = 1–0 110.2013543 GHz
check('CO J = 1–0 at 115.271 GHz', near(rot[0].ghz, 115.2712, 0.01), String(rot[0].ghz));
check('CO J = 2–1 at 230.538 GHz', near(rot[1].ghz, 230.538, 0.02), String(rot[1].ghz));
check('CO J = 3–2 at 345.796 GHz', near(rot[2].ghz, 345.796, 0.03), String(rot[2].ghz));
check('¹³CO J = 1–0 at 110.201 GHz', near(M.rotation(co13, 30)[0].ghz, 110.2014, 0.03), String(M.rotation(co13, 30)[0].ghz));
check('CO fundamental band origin 2143.27 cm⁻¹', near(M.origin(co), 2143.27, 0.1), String(M.origin(co)));
check('CO bond length from B₀: about 113.1 pm (r₀, a little above rₑ = 112.8)', near(M.bondLengthPm(M.Bv(co, 0), co.mu), 113.09, 0.05), String(M.bondLengthPm(M.Bv(co, 0), co.mu)));
check('CO rₑ from Bₑ is 112.83 pm', near(M.bondLengthPm(co.Be, co.mu), 112.83, 0.02), String(M.bondLengthPm(co.Be, co.mu)));

// HCl fundamental: measured lines (H³⁵Cl), cm⁻¹
const h35 = M.constants('HCl35'), b = M.band(h35, 300);
const line = (br, J, c = b) => c.find((x) => x.branch === br && x.J === J).nu;
const MEAS = [['R', 0, 2906.25], ['R', 1, 2925.90], ['R', 2, 2944.91], ['R', 3, 2963.29], ['P', 1, 2865.10], ['P', 2, 2843.62], ['P', 3, 2821.56], ['P', 4, 2798.94]];
for (const [br, J, nu] of MEAS) check(`H³⁵Cl ${br}(${J}) at ${nu} cm⁻¹ (within 0.3)`, near(line(br, J), nu, 0.3), String(line(br, J)));
check('no line at the band origin: the gap between P(1) and R(0) is about 4B', near(line('R', 0) - line('P', 1), 4 * M.Bv(h35, 0), 2));
check('R-branch spacing shrinks, P-branch spacing grows (B₁ < B₀)', line('R', 3) - line('R', 2) < line('R', 1) - line('R', 0) && line('P', 3) - line('P', 4) > line('P', 1) - line('P', 2));
const h37 = M.constants('HCl37');
check('H³⁷Cl lines lie about 2.1 cm⁻¹ below H³⁵Cl’s', near(line('R', 0) - line('R', 0, M.band(h37, 300)), 2.1, 0.2), String(line('R', 0) - line('R', 0, M.band(h37, 300))));
check('H³⁷Cl lines are about a third as strong (abundance)', near(M.band(h37, 300).find((x) => x.branch === 'R' && x.J === 0).I / b.find((x) => x.branch === 'R' && x.J === 0).I, 0.2424 / 0.7576, 0.01));
const d35 = M.constants('DCl35');
check('D³⁵Cl band origin about 2090.8 cm⁻¹ (within 0.6)', near(M.origin(d35), 2090.78, 0.6), String(M.origin(d35)));
check('DCl ωₑ is 2145.2 cm⁻¹ (isotope scaling)', near(d35.we, 2145.16, 0.3), String(d35.we));
check('HCl force constant from ωₑ: about 516 N/m', near(M.forceConstant(h35.we, h35.mu), 516.3, 1), String(M.forceConstant(h35.we, h35.mu)));
check('HCl rₑ from Bₑ: 127.46 pm', near(M.bondLengthPm(h35.Be, h35.mu), 127.46, 0.05), String(M.bondLengthPm(h35.Be, h35.mu)));
// populations
let s = 0; for (let J = 0; J < 60; J++) s += M.population(co, J, 300);
check('populations add to 1', near(s, 1, 1e-9));
const peak = (c, T) => { let best = 0; for (let J = 1; J < 60; J++) if (M.population(c, J, T) > M.population(c, best, T)) best = J; return best; };
check('at 300 K, HCl’s most populated level is J = 3 and CO’s J = 7', peak(h35, 300) === 3 && peak(co, 300) === 7, `${peak(h35, 300)} ${peak(co, 300)}`);
check('the strongest HCl lines at 300 K are R(3) and P(4) or near', ['R3', 'R2', 'P4', 'P3'].includes((() => { const x = b.filter((l) => l.I === Math.max(...b.map((y) => y.I)))[0]; return x.branch + x.J; })()));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
