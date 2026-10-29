// The laser rate equations behind the mp-laser simulation.
//   node atlas/test/mp-laser.test.mjs

import * as L from '../src/viz/model/mp-laser.js';
import { makeRng } from '../src/core/rng.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-12);
const R = 0.95;

// populations always add up to NA and are never negative
for (const s of ['two', 'three', 'four']) for (const W of [0, 0.05, 0.5, 3]) for (const q of [0, 10, 300]) {
  const N = L.populationsAt(s, W, q), tot = Object.values(N).reduce((a, b) => a + b, 0);
  if (!close(tot, L.NA, 1e-9) || Object.values(N).some((v) => v < -1e-9)) check(`${s} W=${W} q=${q}: populations add to NA`, false, JSON.stringify(N));
}
check('populations are consistent (no failures above)', true);

// a two-level system can approach but never pass equal populations
for (const W of [0.1, 1, 10, 1000]) {
  const N = L.populationsAt('two', W, 0);
  check(`two-level, W = ${W}: no inversion`, N.u < N.g, JSON.stringify(N));
}
check('two-level: a strong pump brings the populations close to equal', close(L.populationsAt('two', 1e4, 0).u, L.NA / 2, 1e-3));
check('two-level: no threshold at all', L.thresholdPump('two', R) === Infinity);

// thresholds: the four-level scheme needs far less pumping than the three-level one
const th3 = L.thresholdPump('three', R), th4 = L.thresholdPump('four', R);
check('three-level threshold lies above W = 1/τ₂₁ (half the atoms pumped)', th3 > 1, String(th3));
check('four-level threshold is more than ten times lower', th4 < th3 / 10, `${th4} vs ${th3}`);
// analytic forms when the fast decays are instantaneous: four-level W = ΔN/(NA − ΔN), three-level W = (NA + ΔN)/(NA − ΔN)
const dN = L.thresholdInversion(R), fastP = { ...L.DEFAULTS, tauFast: 1e-6 };
check('four-level threshold matches ΔN/(NA − ΔN) with instant fast decays', close(L.thresholdPump('four', R, fastP), dN / (L.NA - dN), 1e-3), String(L.thresholdPump('four', R, fastP)));
check('three-level threshold matches (NA + ΔN)/(NA − ΔN)', close(L.thresholdPump('three', R, fastP), (L.NA + dN) / (L.NA - dN), 1e-3));
check('a better mirror lowers the threshold inversion', L.thresholdInversion(0.99) < L.thresholdInversion(0.9));

// steady states: below threshold almost no photons, above it the inversion clamps and the output grows linearly
for (const s of ['three', 'four']) {
  const th = L.thresholdPump(s, R);
  const below = L.steady(s, 0.5 * th, R), a = L.steady(s, 1.5 * th, R), c = L.steady(s, 3.5 * th, R);
  // linear when the pump band empties instantly (otherwise atoms parked in it bend the line slightly)
  const tf = L.thresholdPump(s, R, fastP), A1 = L.steady(s, 1.5 * tf, R, fastP), B1 = L.steady(s, 2.5 * tf, R, fastP), C1 = L.steady(s, 3.5 * tf, R, fastP);
  check(`${s}: few photons below threshold`, below.q < 0.05 * a.q, `${below.q} vs ${a.q}`);
  check(`${s}: inversion clamped near threshold above it`, close(a.inversion, dN, 0.03) && close(c.inversion, dN, 0.03), `${a.inversion} ${c.inversion} vs ${dN}`);
  check(`${s}: output rises linearly above threshold`, close(C1.output - B1.output, B1.output - A1.output, 0.01), `${A1.output} ${B1.output} ${C1.output}`);
  check(`${s}: more pump, more output`, c.output > a.output && a.output > below.output);
  // the photon balance closes: dq/dt = 0
  check(`${s}: the photon number is steady`, Math.abs(L.photonRate(s, a.N, a.q, R)) < 1e-6 * a.q);
}

// the time-dependent equations settle to the steady state
for (const s of ['three', 'four']) {
  const W = 2 * L.thresholdPump(s, R);
  let st = L.groundState(s);
  for (let i = 0; i < 40000; i++) st = L.rk4(s, st, W, R, 0.005);
  const ss = L.steady(s, W, R);
  check(`${s}: RK4 from the ground state reaches the steady photon number`, close(st.q, ss.q, 0.01), `${st.q} vs ${ss.q}`);
}

// the stochastic atoms average to the mean-field steady state
for (const s of ['two', 'three', 'four']) {
  const W = s === 'two' ? 1 : s === 'three' ? 2 * L.thresholdPump(s, R) : 8 * L.thresholdPump(s, R), A = new L.Atoms(s), rng = makeRng(7).next;
  const sum = {};
  let n = 0, qsum = 0;
  for (let i = 0; i < 120000; i++) {
    A.step(0.005, W, R, rng);
    if (i > 20000) { const c = A.counts(); for (const k in c) sum[k] = (sum[k] || 0) + c[k]; qsum += A.q; n++; }
  }
  const ss = L.steady(s, W, R), S = L.SCHEMES[s];
  const up = sum[S.upper] / n;
  check(`${s}: stochastic upper-level population averages to the steady state (within 8%)`, close(up, ss.N[S.upper], 0.08), `${up} vs ${ss.N[S.upper]}`);
  if (s !== 'two') check(`${s}: stochastic photon number averages to the steady state (within 12%)`, close(qsum / n, ss.q, 0.12), `${qsum / n} vs ${ss.q}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
