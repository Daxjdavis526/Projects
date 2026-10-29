// Hydrogen's wave functions behind the mp-orbitals simulation.
//   node atlas/test/mp-orbitals.test.mjs

import * as O from '../src/viz/model/mp-orbitals.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));
const simpson = (f, a, b, N = 4000) => { const h = (b - a) / N; let s = f(a) + f(b); for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return (s * h) / 3; };

// closed forms
check('R₁₀ = 2e^{−r}', near(O.radial(1, 0, 0.7), 2 * Math.exp(-0.7), 1e-12));
check('R₂₀ = (2 − r)e^{−r/2}/(2√2)', near(O.radial(2, 0, 0.7), ((2 - 0.7) * Math.exp(-0.35)) / (2 * Math.SQRT2), 1e-12));
check('R₂₁ = r e^{−r/2}/(2√6)', near(O.radial(2, 1, 0.7), (0.7 * Math.exp(-0.35)) / (2 * Math.sqrt(6)), 1e-12));
check('R₃₂ = 4r²e^{−r/3}/(81√30)', near(O.radial(3, 2, 2.2), (4 * 2.2 * 2.2 * Math.exp(-2.2 / 3)) / (81 * Math.sqrt(30)), 1e-12));

// normalisation, ⟨r⟩, nodes, peaks
for (let n = 1; n <= 5; n++) for (let l = 0; l < n; l++) {
  const top = 6 * n * n + 30;
  check(`R${n}${l} is normalised`, near(simpson((r) => O.radialP(n, l, r), 0, top, 8000), 1, 1e-8));
  check(`⟨r⟩ for n = ${n}, l = ${l} is [3n² − l(l+1)]/2`, near(simpson((r) => r * O.radialP(n, l, r), 0, top, 8000), O.meanR(n, l), 1e-7));
  // radial nodes: sign changes of R for r > 0
  let nodes = 0, prev = O.radial(n, l, 1e-6);
  for (let i = 1; i <= 20000; i++) { const v = O.radial(n, l, (top * i) / 20000); if (v * prev < 0) nodes++; if (v !== 0) prev = v; }
  check(`R${n}${l} has n − l − 1 = ${n - l - 1} radial nodes`, nodes === n - l - 1, String(nodes));
}
check('the 1s electron is most likely found at a₀', near(O.peakR(1, 0), 1, 1e-6));
check('2p peaks at 4a₀, 3d at 9a₀ (n² when l = n − 1)', near(O.peakR(2, 1), 4, 1e-6) && near(O.peakR(3, 2), 9, 1e-6));
check('2s peaks at (3 + √5)a₀', near(O.peakR(2, 0), 3 + Math.sqrt(5), 1e-6));
check('P(r < a₀) for 1s is 1 − 5e⁻²', near(O.probInside(1, 0, 1), 1 - 5 * Math.exp(-2), 1e-9));
check('99% of the 1s probability lies within about 4.2a₀', Math.abs(O.enclosingR(1, 0) - 4.2) < 0.05, String(O.enclosingR(1, 0)));

// spherical harmonics
check('Y₀₀ = 1/√(4π)', near(O.ylm(0, 0, 1, 2).re, 1 / Math.sqrt(4 * Math.PI), 1e-12));
check('Y₁₀ = √(3/4π) cos θ', near(O.ylm(1, 0, 0.6, 0).re, Math.sqrt(3 / (4 * Math.PI)) * Math.cos(0.6), 1e-12));
const y11 = O.ylm(1, 1, 0.6, 0.9);
check('Y₁₁ = −√(3/8π) sin θ e^{iφ} (Condon–Shortley, as SciPy)', near(y11.re, -Math.sqrt(3 / (8 * Math.PI)) * Math.sin(0.6) * Math.cos(0.9), 1e-12) && near(y11.im, -Math.sqrt(3 / (8 * Math.PI)) * Math.sin(0.6) * Math.sin(0.9), 1e-12));
const y1m = O.ylm(1, -1, 0.6, 0.9);
check('Y₁,₋₁ = +√(3/8π) sin θ e^{−iφ}', near(y1m.re, Math.sqrt(3 / (8 * Math.PI)) * Math.sin(0.6) * Math.cos(0.9), 1e-12) && near(y1m.im, -Math.sqrt(3 / (8 * Math.PI)) * Math.sin(0.6) * Math.sin(0.9), 1e-12));
check('Y₂₀ = √(5/16π)(3cos²θ − 1)', near(O.ylm(2, 0, 0.4, 0).re, Math.sqrt(5 / (16 * Math.PI)) * (3 * Math.cos(0.4) ** 2 - 1), 1e-12));
check('|Y₃₂|² = (105/32π) sin⁴θ cos²θ', near(O.ylm2(3, 2, 0.8), (105 / (32 * Math.PI)) * Math.sin(0.8) ** 4 * Math.cos(0.8) ** 2, 1e-12));
for (let l = 0; l <= 4; l++) for (let m = -l; m <= l; m++) {
  const I = simpson((th) => 2 * Math.PI * O.ylm2(l, m, th) * Math.sin(th), 0, Math.PI, 2000);
  check(`∫|Y${l},${m}|² dΩ = 1`, near(I, 1, 1e-9));
  // the real orbitals are normalised too
  const J = simpson((th) => Math.sin(th) * simpson((ph) => O.realY(l, m, th, ph) ** 2, 0, 2 * Math.PI, 200), 0, Math.PI, 200);
  check(`the real orbital l = ${l}, m = ${m} is normalised`, near(J, 1, 1e-6));
}
check('px is √(3/4π) x/r', near(O.realY(1, 1, 0.7, 0.3), Math.sqrt(3 / (4 * Math.PI)) * Math.sin(0.7) * Math.cos(0.3), 1e-12));
check('py is √(3/4π) y/r', near(O.realY(1, -1, 0.7, 0.3), Math.sqrt(3 / (4 * Math.PI)) * Math.sin(0.7) * Math.sin(0.3), 1e-12));
check('dxy ∝ xy is positive in the first quadrant', O.realY(2, -2, Math.PI / 2, 0.5) > 0 && O.realY(2, -2, Math.PI / 2, 2) < 0);
check('names', O.realName(3, 2, -2) === '3dxy' && O.realName(2, 1, 0) === '2pz' && O.letter(3) === 'f');
check('a slice of py lies in the yz-plane', near(O.slicePhi(-1, true), Math.PI / 2, 1e-12) && O.slicePhi(-1, false) === 0);
check('the 2pz slice is zero in the xy-plane and has opposite signs above and below', Math.abs(O.sliceValue(2, 1, 0, 3, 0, true)) < 1e-12 && O.sliceValue(2, 1, 0, 0, 2, true) > 0 && O.sliceValue(2, 1, 0, 0, -2, true) < 0);
check('energies: E₁ = −13.6 eV, E₂ = −3.40 eV', near(O.energy(1), -13.6057, 1e-5) && near(O.energy(2), -3.4014, 1e-4));
check('quantum numbers are clamped into range', JSON.stringify(O.clampQN(2, 3, -4)) === JSON.stringify({ n: 2, l: 1, m: -1 }));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
