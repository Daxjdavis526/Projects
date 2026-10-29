// The light model behind the em-wave and em-spectrum simulations.
//   node atlas/test/em-light.test.mjs

import * as M from '../src/viz/model/em-light.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// constants
check('c = 1/√(μ₀ε₀) with the CODATA 2022 values', near(1 / Math.sqrt(M.MU0 * M.EPS0), M.C, 1e-9), String(1 / Math.sqrt(M.MU0 * M.EPS0)));
check('h and e are the exact SI values', M.H === 6.62607015e-34 && M.E_CHARGE === 1.602176634e-19);

// plane waves
for (const E0 of [1, 100, 1012.7, 5e5]) {
  const w = M.plane(E0);
  check(`E₀ = ${E0} V/m: B₀ = E₀/c`, near(w.B0 * M.C, E0, 1e-12));
  check(`E₀ = ${E0} V/m: the electric and magnetic energies are equal, ½ε₀E² = B²/2μ₀ on average`, near(w.uE, (w.B0 ** 2) / (4 * M.MU0), 1e-8));
  check(`E₀ = ${E0} V/m: I = cu = ½cε₀E₀² = E₀B₀/2μ₀ (the average Poynting flux)`, near(w.I, (E0 * w.B0) / (2 * M.MU0), 1e-8) && near(w.I, M.C * w.u, 1e-12));
  check(`E₀ = ${E0} V/m: a reflector feels twice an absorber’s pressure`, near(w.pRef, 2 * w.pAbs, 1e-12) && near(w.pAbs, w.u, 1e-12));
  check(`E₀ = ${E0} V/m: E0ofI inverts the intensity`, near(M.E0ofI(w.I), E0, 1e-12));
}
{
  const sun = M.plane(M.E0ofI(M.SOLAR_CONSTANT));
  check('sunlight at 1 AU: E₀ ≈ 1.01 kV/m', Math.abs(sun.E0 - 1012.7) < 1, String(sun.E0));
  check('sunlight at 1 AU: pressure on an absorber ≈ 4.54 µPa', Math.abs(sun.pAbs - 4.54e-6) < 0.01e-6, String(sun.pAbs));
  check('sunlight at 1 AU: B₀ ≈ 3.38 µT', Math.abs(sun.B0 - 3.378e-6) < 0.01e-6, String(sun.B0));
}

// wavelengths and photons
check('GPS L1: λ = 19.03 cm', Math.abs(M.lambdaOf(1.57542e9) - 0.19029) < 1e-4);
check('microwave oven: λ = 12.2 cm', Math.abs(M.lambdaOf(2.45e9) - 0.12236) < 1e-4);
check('green 532 nm: photon energy 2.33 eV', Math.abs(M.photonEV(M.freqOf(532e-9)) - 2.3305) < 1e-3);
check('1 eV ↔ 1240 nm', Math.abs(M.lambdaOf(M.E_CHARGE / M.H) - 1239.84e-9) < 0.01e-9);
check('CMB at 2.7255 K peaks near 160.2 GHz (Wien in frequency)', Math.abs(M.wienFreq(2.7255) - 160.2e9) < 0.1e9, String(M.wienFreq(2.7255)));
check('a 310 K body peaks near 9.35 µm', Math.abs(M.wienLambda(310) - 9.348e-6) < 0.005e-6);

// the spectrum tables
check('bands are contiguous and increasing', M.BANDS.every((b, k) => b.from < b.to && (k === 0 || b.from === M.BANDS[k - 1].to)));
check('visible light runs from 400 to 750 nm', near(M.lambdaOf(M.BANDS.find((b) => b.id === 'visible').from), 749.48e-9, 1e-3) && near(M.lambdaOf(M.BANDS.find((b) => b.id === 'visible').to), 399.72e-9, 1e-3));
for (const s of M.SOURCES) check(`${s.id} (${s.f.toPrecision(4)} Hz) lies in the ${s.band} band`, M.bandOf(s.f).id === s.band, M.bandOf(s.f).id);
check('sources are listed in increasing frequency', M.SOURCES.every((s, k) => k === 0 || s.f > M.SOURCES[k - 1].f));
check('cobalt-60’s 1.33 MeV gamma ray is 3.22×10²⁰ Hz', Math.abs(M.SOURCES.find((s) => s.id === 'co60').f - 3.222e20) < 0.002e20);
check('copper Kα (8.05 keV) is 0.154 nm', Math.abs(M.lambdaOf(M.SOURCES.find((s) => s.id === 'cuka').f) - 0.15406e-9) < 0.0003e-9);
check('size comparisons: 12 cm is not near any, 1 m is a person, 0.1 nm an atom', M.sizeOf(0.12) === null && M.sizeOf(1.1).text === 'a person' && M.sizeOf(1.5e-10).text === 'an atom');

// displacement current in a charging capacitor
{
  const I = 2, R = 0.05, g = M.chargingGap({ I, R });
  check('charging gap: ε₀ (dE/dt) πR² equals the conduction current', near(M.EPS0 * g.dEdt * Math.PI * R * R, I, 1e-12));
  check('charging gap: a disc wider than the plates catches all of it', near(g.Id(0.08), I, 1e-12) && near(g.Id(R), I, 1e-12));
  check('charging gap: inside, the displacement current grows as r²', near(g.Id(0.025), I / 4, 1e-12));
  check('charging gap: B grows linearly inside, μ₀Ir/2πR²', near(g.Bgap(0.03), (M.MU0 * I * 0.03) / (2 * Math.PI * R * R), 1e-12));
  check('charging gap: outside the plates B is the same as around the wire', near(g.Bgap(0.08), g.Bwire(0.08), 1e-12));
  check('charging gap: B at the plate edge ≈ 8.0 µT for 2 A and 5 cm', Math.abs(g.Bgap(R) - 8.0e-6) < 0.01e-6);
  // Ampère–Maxwell around a loop of radius r in the gap: ∮B·dl = μ₀ I_d(r)
  for (const r of [0.01, 0.04, 0.07]) check(`charging gap: ∮B·dl = μ₀I_d at r = ${r} m`, near(g.Bgap(r) * 2 * Math.PI * r, M.MU0 * g.Id(r), 1e-12));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
