// The Compton-scattering model behind the qm-compton simulation.
//   node atlas/test/qm-compton.test.mjs

import * as K from '../src/viz/model/qm-compton.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

check('electron Compton wavelength is 2.42631 pm (CODATA 2022: 2.42631023538 pm)', near(K.LAMBDA_C_PM, 2.42631023538, 1e-9), String(K.LAMBDA_C_PM));
check('rest energy and mass agree: m_e c² = 510.999 keV', near(K.ME * 299792458 ** 2 / 1.602176634e-16, K.MEC2_KEV, 1e-9));
check('no shift at θ = 0', K.shiftPm(0) === 0);
check('shift at 90° is one Compton wavelength', near(K.shiftPm(90), K.LAMBDA_C_PM, 1e-12));
check('largest shift, at 180°, is 4.853 pm', near(K.shiftPm(180), 2 * K.LAMBDA_C_PM, 1e-12) && Math.abs(K.shiftPm(180) - 4.853) < 0.001);
check('the shift does not depend on the wavelength', near(K.scatter(71.07, 60).dlam, K.scatter(1.874, 60).dlam, 1e-12));
check('Mo Kα (71.07 pm) is 17.4 keV', Math.abs(K.keV(71.07) - 17.445) < 0.001, String(K.keV(71.07)));

for (const [pm, th] of [[71.07, 90], [71.07, 135], [K.SOURCES.cs.pm, 180], [K.SOURCES.cs.pm, 30], [20, 120], [532e3, 90], [K.SOURCES.ann.pm, 77]]) {
  const s = K.scatter(pm, th), tag = `λ = ${pm.toPrecision(4)} pm, θ = ${th}°`;
  // the electron's energy and momentum must belong to a particle of mass m_e
  const Ee = s.K + K.MEC2_KEV;
  check(`${tag}: electron E² − (pc)² = (mc²)²`, near(Ee * Ee - s.peMag * s.peMag, K.MEC2_KEV ** 2, 1e-7), `${Ee * Ee - s.peMag ** 2} vs ${K.MEC2_KEV ** 2}`);
  check(`${tag}: E′ agrees with E/(1 + (E/mc²)(1 − cos θ))`, near(s.E2, K.scatteredKeV(s.E, th), 1e-9));
  check(`${tag}: electron angle agrees with cot φ = (1 + E/mc²) tan(θ/2)`, Math.abs(s.phi - K.recoilAngle(pm, th)) < 1e-6, `${s.phi} vs ${K.recoilAngle(pm, th)}`);
  check(`${tag}: the photon always loses energy`, s.E2 <= s.E && s.K >= 0);
}
{
  const cs = K.scatter(K.SOURCES.cs.pm, 180);
  check('Cs-137 (661.7 keV) backscattered: 184.3 keV photon, 477.3 keV Compton edge', Math.abs(cs.E2 - 184.32) < 0.02 && Math.abs(cs.K - 477.34) < 0.02, `${cs.E2} ${cs.K}`);
  check('backscatter sends the electron straight ahead', Math.abs(cs.phi) < 1e-9);
  const pet = K.scatter(K.SOURCES.ann.pm, 180);
  check('511 keV backscattered is exactly a third: 170.3 keV', near(pet.E2, K.MEC2_KEV / 3, 1e-9));
  const mo = K.scatter(71.07, 90);
  check('Compton at 90°: 71.07 → 73.50 pm, electron gets 0.58 keV at 44°', Math.abs(mo.lam2 - 73.496) < 0.001 && Math.abs(mo.K - 0.576) < 0.001 && Math.abs(mo.phi - 44.0) < 0.1, `${mo.lam2} ${mo.K} ${mo.phi}`);
  const green = K.scatter(532e3, 180);
  check('visible light: the fractional shift is below 10⁻⁵', green.frac < 1e-5);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
