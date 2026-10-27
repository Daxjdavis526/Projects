// The DOM-free molecular box behind the therm-gas simulation, and the
// kinetic-theory formulas the PHYS 2210 thermal lessons quote.
//   node atlas/test/therm-gas.test.mjs

import * as G from '../src/viz/model/therm-gas.js';
import { simpson } from '../src/viz/model/numeric.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 1e-12) => Math.abs(a - b) <= abs + rel * Math.abs(b);
const N2 = G.GASES.N2.M, He = G.GASES.He.M, Xe = G.GASES.Xe.M;

// ─── constants and formulas: numbers the lessons quote ─────────────────────
check('R = N_A k_B = 8.314 462 618 J/(mol K)', near(G.R, 8.314462618, 1e-10));
check('v_rms of N2 at 300 K is 516.8 m/s', near(G.vrms(300, N2), 516.8, 2e-4), G.vrms(300, N2));
check('v_rms of He at 300 K is 1367 m/s', near(G.vrms(300, He), 1367.3, 2e-4), G.vrms(300, He));
check('speeds in the ratio 1 : 1.128 : 1.225', near(G.vmean(300, N2) / G.vmp(300, N2), 2 / Math.sqrt(Math.PI)) && near(G.vrms(300, N2) / G.vmp(300, N2), Math.sqrt(1.5)));
check('mean kinetic energy at 300 K is 6.21e-21 J', near(G.meanKE(300), 6.2129e-21, 1e-4));
check('sound in N2 at 300 K: 353 m/s; in He: 1019 m/s', near(G.soundSpeed(300, N2, 1.4), 353.07, 1e-4) && near(G.soundSpeed(300, He, 5 / 3), 1019.13, 1e-4));
check('erfc(0) = 1, erfc(1) = 0.157299, erfc(−1) = 1.842701', near(G.erfc(0), 1, 1e-7) && near(G.erfc(1), 0.1572992070, 2e-7) && near(G.erfc(-1), 1.8427007930, 1e-7));
for (const [T, M] of [[77.355, N2], [300, N2], [300, He], [1000, Xe]]) {
  const top = 6 * G.vmp(T, M), f = (v) => G.mbPdf(v, T, M);
  check(`MB density at ${T} K, M = ${M}: integrates to 1`, near(simpson(f, 0, top, 4000), 1, 1e-7));
  check(`MB density at ${T} K, M = ${M}: mean speed`, near(simpson((v) => v * f(v), 0, top, 4000), G.vmean(T, M), 1e-7));
  check(`MB density at ${T} K, M = ${M}: mean square speed`, near(simpson((v) => v * v * f(v), 0, top, 4000), G.vrms(T, M) ** 2, 1e-7));
  let peak = 0;
  for (let k = 1; k < 4000; k++) if (f((k * top) / 4000) > f((peak * top) / 4000)) peak = k;
  check(`MB density at ${T} K, M = ${M}: peaks at v_p`, near((peak * top) / 4000, G.vmp(T, M), 2e-3));
  for (const v of [0.5, 1, 2, 2.37].map((x) => x * G.vmp(T, M))) {
    check(`MB tail above ${v.toFixed(0)} m/s equals the integral`, near(G.mbTail(v, T, M), simpson(f, v, top, 4000) + 0, 3e-6, 1e-8));
  }
}
check('MB tail: 1.06 % of N2 at 300 K is faster than 1000 m/s', near(G.mbTail(1000, 300, N2), 0.01059, 0.01), G.mbTail(1000, 300, N2));
check('ideal gas: 0.04 mol at 300 K in a litre is 99.8 kPa', near(G.idealPressure(0.04, 300, 1e-3), 99774, 1e-4));

// ─── the box: set-up ───────────────────────────────────────────────────────
{
  const a = G.createGas({ N: 200, T: 300, gas: 'N2', seed: 3 }), b = G.createGas({ N: 200, T: 300, gas: 'N2', seed: 3 });
  check('same seed, same gas', a.x.every((v, i) => v === b.x[i]) && a.vz.every((v, i) => v === b.vz[i]));
  const c = G.createGas({ N: 200, T: 300, gas: 'N2', seed: 4 });
  check('a different seed, a different gas', c.x.some((v, i) => v !== a.x[i]));
  check('kinetic temperature equals T exactly', near(G.kineticTemperature(a), 300, 1e-12));
  check('no drift: total momentum zero', G.momentum(a).every((p) => Math.abs(p) < 1e-9));
  check('200 dots stand for 0.04 mol', near(G.moles(a), 0.04));
  for (const [N, V] of [[250, 0.5], [300, 1], [40, 0.5], [250, 1]]) {
    const s = G.createGas({ N, V, T: 300, gas: 'He', seed: 9 });
    let overlap = 0, outside = 0;
    for (let i = 0; i < N; i++) {
      if (s.x[i] < 0 || s.x[i] > V || s.y[i] < 0 || s.y[i] > 1 || s.z[i] < 0 || s.z[i] > 1) outside++;
      for (let j = i + 1; j < N; j++) if ((s.x[i] - s.x[j]) ** 2 + (s.y[i] - s.y[j]) ** 2 + (s.z[i] - s.z[j]) ** 2 < s.d ** 2) overlap++;
    }
    check(`${N} dots in V = ${V}: none overlap or sit outside`, overlap === 0 && outside === 0, `${overlap} overlaps, ${outside} outside`);
  }
  const e = G.createGas({ N: 200, T: 250, gas: 'N2', start: 'equal', seed: 5 });
  const sp = Array.from({ length: e.N }, (_, i) => G.speedOf(e, i));
  check('equal start: every dot at v_rms, total energy right', sp.every((v) => near(v, G.vrms(250, N2), 1e-9)) && near(G.kineticTemperature(e), 250, 1e-12));
  const mix = G.createGas({ N: 200, T: 300, gas: 'He+Xe', start: 'equal', seed: 5 });
  const KHe = G.meanKineticEnergy(mix, 0), KXe = G.meanKineticEnergy(mix, 1);
  check('mixture, equal speeds: xenon starts with M_Xe/M_He times the energy', near(KXe / KHe, Xe / He, 1e-9) && near(G.kineticTemperature(mix), 300, 1e-12));
}

// ─── the box: dynamics ─────────────────────────────────────────────────────
// a time average of f over t seconds of animation at 60 frames a second
function run(S, t, f = null) {
  let acc = 0, n = 0, coll = 0;
  for (let k = 0; k < Math.round(t * 60); k++) { coll += G.advance(S, 1 / 60).collisions; if (f) { acc += f(S); n++; } }
  return { mean: n ? acc / n : null, coll };
}
const ratio = (S) => { let s1 = 0, s2 = 0; for (let i = 0; i < S.N; i++) { const v = G.speedOf(S, i); s1 += v; s2 += v * v; } return (s2 / S.N) / (s1 / S.N) ** 2; };
{
  const S = G.createGas({ N: 200, T: 300, gas: 'N2', start: 'equal', seed: 11 });
  const K0 = G.kinetic(S);
  const early = run(S, 1, ratio);
  check('equal start: the spread grows from ⟨v²⟩/⟨v⟩² = 1', early.mean > 1.005 && early.mean < 1.1, early.mean);
  run(S, 9);
  const late = run(S, 30, ratio);
  check('collisions spread one speed into Maxwell–Boltzmann: ⟨v²⟩/⟨v⟩² → 3π/8 = 1.178', near(late.mean, (3 * Math.PI) / 8, 0.015), late.mean);
  check('elastic everything: total kinetic energy conserved', near(G.kinetic(S), K0, 1e-10), G.kinetic(S) / K0 - 1);
  check('temperature unchanged by the relaxation', near(G.kineticTemperature(S), 300, 1e-10));
  let outside = 0;
  for (let i = 0; i < S.N; i++) if (S.x[i] < -1e-9 || S.x[i] > S.V + 1e-9 || S.y[i] < -1e-9 || S.y[i] > 1 + 1e-9 || S.z[i] < -1e-9 || S.z[i] > 1 + 1e-9) outside++;
  check('every dot still inside the box', outside === 0, outside);
  // the running histogram against the Maxwell–Boltzmann density
  S.tau = 1e9; for (const h of S.hist) h.fill(0); S.histT = 0;
  run(S, 40);
  const dens = G.histDensity(S), bw = S.vmax / S.bins;
  let l1 = 0;
  dens.forEach((p, b) => { const v0 = b * bw; l1 += Math.abs(p * bw - simpson((v) => G.mbPdf(v, 300, N2), v0, v0 + bw, 20)); });
  check('time-averaged speed histogram matches the MB curve (L1 distance < 0.06)', l1 < 0.06, l1.toFixed(4));
}
{
  // pressure from wall impacts against nRT/V: equal within the hard-sphere correction and the noise
  const S = G.createGas({ N: 200, T: 300, gas: 'N2', seed: 21 });
  S.tau = 1e9;
  run(S, 30);
  const P = G.measuredPressure(S), ideal = G.idealPressure(G.moles(S), 300, G.volumeM3(S)), Z = G.hardSphereZ(S).Z;
  check('pressure from impacts ≈ nRT/V × Z (hard spheres), within 3 %', near(P, ideal * Z, 0.03), `${P.toFixed(0)} vs ${(ideal * Z).toFixed(0)}`);
  check('the dots’ size adds under 2 % at full volume', Z > 1 && Z < 1.02, Z);
  // Boyle: half the volume, twice the pressure (the squeeze leaves T alone)
  G.setVolume(S, 0.5);
  check('squeezing the box leaves the temperature alone', near(G.kineticTemperature(S), 300, 1e-12));
  S.tau = 1e9; run(S, 30);
  const P2 = G.measuredPressure(S);
  check('half the volume: about twice the pressure', near(P2 / P, 2 * G.hardSphereZ(S).Z / Z, 0.04), (P2 / P).toFixed(3));
  check('the smallest box still under 4 % from ideal', G.hardSphereZ(S).Z < 1.04);
  // Gay-Lussac: four times the absolute temperature, four times the pressure, twice the speeds
  const v1 = G.measuredVrms(S);
  G.setTemperature(S, 1200);
  check('four times T: v_rms doubles', near(G.measuredVrms(S), 2 * v1, 1e-9));
  S.tau = 1e9; run(S, 20);
  check('four times T: four times the pressure', near(G.measuredPressure(S) / P2, 4, 0.05), (G.measuredPressure(S) / P2).toFixed(3));
}
{
  // the same N, T and V: light helium and heavy xenon push equally hard
  const P = {};
  for (const gas of ['He', 'Xe']) { const S = G.createGas({ N: 200, T: 300, gas, seed: 31 }); S.tau = 1e9; run(S, gas === 'He' ? 12 : 30); P[gas] = G.measuredPressure(S); }
  check('helium and xenon at the same N, T, V: the same pressure (within 4 %)', near(P.He, P.Xe, 0.04), `${P.He.toFixed(0)} vs ${P.Xe.toFixed(0)}`);
}
{
  // equipartition: a helium–xenon mixture started at one speed shares its energy until each kind has (3/2)kT on average
  const S = G.createGas({ N: 200, T: 300, gas: 'He+Xe', start: 'equal', seed: 41 });
  run(S, 40);
  const He_ = run(S, 30, (s) => G.meanKineticEnergy(s, 0)).mean, Xe_ = run(S, 30, (s) => G.meanKineticEnergy(s, 1)).mean;
  check('mixture: helium and xenon end with the same mean kinetic energy (within 10 %)', near(He_ / Xe_, 1, 0.1), (He_ / Xe_).toFixed(3));
  check('mixture: each near (3/2) k_B T', near(He_, G.meanKE(300), 0.1) && near(Xe_, G.meanKE(300), 0.1));
  check('mixture: helium atoms are about √(M_Xe/M_He) = 5.7 times faster', near(G.measuredVrms(S, 0) / G.measuredVrms(S, 1), Math.sqrt(Xe / He), 0.25));
}
{
  // equipartition among directions: each of ½ m v_x², ½ m v_y², ½ m v_z² averages ½ k_B T
  // (they always add to (3/2) k_B T, so they fluctuate against each other; 200 dots give a few per cent)
  const S = G.createGas({ N: 200, T: 300, gas: 'N2', start: 'equal', seed: 51 });
  run(S, 10);
  const acc = [0, 0, 0];
  run(S, 60, (s) => { G.componentKE(s).forEach((k, i) => { acc[i] += k / (0.5 * G.KB * 300); }); return 0; });
  const comp = acc.map((a) => a / (60 * 60));
  check('equipartition among directions: each ⟨½ m v_i²⟩ within 6 % of ½ k_B T', comp.every((c) => near(c, 1, 0.06)), comp.map((c) => c.toFixed(3)).join(', '));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
