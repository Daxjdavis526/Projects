// The photon helpers and the photoelectric model behind the qm-photoelectric simulation.
//   node atlas/test/qm-photoelectric.test.mjs

import * as L from '../src/viz/model/qm-light.js';
import * as P from '../src/viz/model/qm-photoelectric.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// exact constants of the 2019 SI and the numbers built from them
check('h, e and c are the exact SI values', L.H === 6.62607015e-34 && L.QE === 1.602176634e-19 && L.C === 299792458);
check('h = 4.135667696e-15 eV s', near(L.H_EVS, 4.135667696e-15, 1e-9), String(L.H_EVS));
check('hc = 1239.841984 eV nm', near(L.HC_EVNM, 1239.841984, 1e-9), String(L.HC_EVNM));
check('ħ = 1.054571817e-34 J s', near(L.HBAR, 1.054571817e-34, 1e-9));
// photon energies quoted in the research notes
check('a 400 nm photon carries 3.100 eV', near(L.photonEV(400), 3.0996, 1e-4));
check('a 500 nm photon carries 2.480 eV', near(L.photonEV(500), 2.4797, 1e-4));
check('a 700 nm photon carries 1.771 eV', near(L.photonEV(700), 1.7712, 1e-4));
check('λ and E invert each other', near(L.lambdaNm(L.photonEV(532)), 532, 1e-12));
check('green light is about 5.6e14 Hz', near(L.freqHz(532), 5.635e14, 1e-3));
check('bands: 121.6 nm is ultraviolet, 550 nm visible, 1064 nm infrared, 0.07 nm X-ray', L.bandOf(121.6) === 'ultraviolet' && L.bandOf(550) === 'visible' && L.bandOf(1064) === 'infrared' && L.bandOf(0.07) === 'X-ray');
// display colours: the Balmer lines look the way they should
const [r656, g656, b656] = L.wavelengthToRGB(656.3), [r486, g486, b486] = L.wavelengthToRGB(486.1), [r434, , b434] = L.wavelengthToRGB(434.0), [r410, , b410] = L.wavelengthToRGB(410.2);
check('Hα (656 nm) is red', r656 > 200 && g656 < 40 && b656 < 40, `${r656},${g656},${b656}`);
check('Hβ (486 nm) is blue-green', r486 < 40 && g486 > 150 && b486 > 200, `${r486},${g486},${b486}`);
check('Hγ (434 nm) is blue-violet: more blue than red', b434 > 200 && r434 < b434, `${r434},${b434}`);
check('Hδ (410 nm) is violet and dimmer', b410 < 255 && r410 > 50 && b410 > r410, `${r410},${b410}`);
check('every colour channel is an integer 0–255', [300, 380, 420, 500, 600, 700, 760, 900].every((nm) => L.wavelengthToRGB(nm).every((v) => Number.isInteger(v) && v >= 0 && v <= 255)));
check('CSS colour string', L.wavelengthCSS(550, 0.5).startsWith('rgba('));

// Einstein's equation
const K = P.METALS.potassium.phi, Zn = P.METALS.zinc.phi;
check('work functions: cesium lowest, platinum highest', Object.values(P.METALS).every((m) => m.phi >= P.METALS.cesium.phi && m.phi <= P.METALS.platinum.phi));
check('K_max = hf − φ for 254 nm on zinc: 0.558 eV', near(P.kmax(253.65, Zn), L.photonEV(253.65) - 4.33, 1e-12) && Math.abs(P.kmax(253.65, Zn) - 0.558) < 0.001, String(P.kmax(253.65, Zn)));
check('no electrons below threshold: red light on potassium', P.kmax(700, K) === 0 && !P.emits(700, K));
check('green light (530 nm) ejects electrons from potassium', P.emits(530, K) && P.kmax(530, K) > 0);
check('zinc threshold is 286.3 nm (ultraviolet)', Math.abs(P.thresholdNm(Zn) - 286.34) < 0.01, String(P.thresholdNm(Zn)));
check('threshold frequency × h = φ', near(P.thresholdHz(K) * L.H_EVS, K, 1e-12));
check('K_max rises linearly with frequency, slope h, for every metal', Object.values(P.METALS).every((m) => near((P.einstein(1.2e15, m.phi) - P.einstein(1.0e15, m.phi)) / 2e14, L.H_EVS, 1e-9)));
check('intercept of the K_max–f line is −φ', near(P.einstein(0, 2.3), -2.3));
check('stopping potential in volts equals K_max in eV', P.stoppingV(400, K) === P.kmax(400, K));

// the photocurrent model
check('current saturates for accelerating voltages', P.currentFraction(-2, 1) === 1 && P.currentFraction(0, 1) === 1);
check('current is zero at and beyond the stopping potential', P.currentFraction(1, 1) === 0 && P.currentFraction(1.5, 1) === 0);
check('current falls monotonically between 0 and V₀', [0, 0.2, 0.4, 0.6, 0.8, 1].every((v, i, a) => i === 0 || P.currentFraction(v, 1) < P.currentFraction(a[i - 1], 1)));
check('no current at all below threshold, whatever the voltage', P.currentFraction(-5, 0) === 0);
check('doubling intensity doubles the current but not the stopping potential', near(P.state({ nm: 450, phi: K, intensity: 2, V: 0.2 }).current, 2 * P.state({ nm: 450, phi: K, intensity: 1, V: 0.2 }).current) && P.state({ nm: 450, phi: K, intensity: 2 }).V0 === P.state({ nm: 450, phi: K, intensity: 1 }).V0);
// sampled electron energies reproduce the current law (inverse-CDF check on a grid of u)
{
  const Kmax = 1.3, n = 20000;
  let above = 0;
  for (let i = 0; i < n; i++) if (P.sampleK(Kmax, (i + 0.5) / n) > 0.4) above++;
  check('sampled energies match P(K > E) = (1 − E/K_max)²', Math.abs(above / n - P.currentFraction(0.4, Kmax)) < 1e-3, `${above / n} vs ${P.currentFraction(0.4, Kmax)}`);
  check('sampled energies lie in [0, K_max]', P.sampleK(Kmax, 0) === Kmax && P.sampleK(Kmax, 1) === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
