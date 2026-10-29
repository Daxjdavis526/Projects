// The simulated experiments behind the labg-classics simulation and the lab
// course's lessons lab.E.18–E.26: constants and reference values against
// numbers worked out independently (the Balmer lines in air, the speed of
// sound, de Broglie wavelengths, Johnson noise, slit minima, the fibre's NA,
// the torsion constant), the Poisson deviates, the chaotic pendulum's
// Lyapunov exponent, seeded data that re-read the same scatter under a
// systematic, and — over many seeds — results that scatter about the accepted
// value with the stated uncertainty when the systematic is off, and miss it
// when it is on. Plus the simulation's validate().
//   node atlas/test/labg-classics.test.mjs

import * as M from '../src/viz/model/labg-classics.js';
import { validate, defaults } from '../src/viz/sims/labg-classics.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b);
const X = M.EXPERIMENTS;

// constants and reference values
check('R_H = R∞/(1 + mₑ/mₚ) = 10 967 758.3 m⁻¹', close(M.K.RH, 10967758.34, 1e-9), `${M.K.RH}`);
const air = { 3: 656.279, 4: 486.135, 5: 434.0472, 6: 410.1734 };   // NIST ASD, air
for (const n of [3, 4, 5, 6]) check(`Balmer n = ${n} in air is ${air[n]} nm to 0.002%`, close(M.balmer(n).air, air[n], 2e-5), `${M.balmer(n).air}`);
check('dry air at 0 °C: 331.3 m/s', close(M.vSound(0), 331.32, 2e-4), `${M.vSound(0)}`);
check('dry air at 20 °C: 343.2 m/s', close(M.vSound(20), 343.22, 2e-4), `${M.vSound(20)}`);
check('a 4 kV electron: λ = 19.35 pm (relativistic)', close(M.lamE(4000), 19.35e-12, 5e-4), `${M.lamE(4000)}`);
check('… and 1.226/√V nm without the correction', close(M.lamE(4000, false), 1.2264e-9 / Math.sqrt(4000), 1e-3));
check('graphite d₁₀ = a√3/2 = 0.2131 nm, d₁₁ = 0.1231 nm', close(M.graphiteD(0.2461e-9)[0], 0.21313e-9, 1e-4) && close(M.graphiteD(0.2461e-9)[1], 0.12305e-9, 1e-4));
{
  const v2 = 4 * M.K.kB * 300 * 1e4 * 1e4;
  check('Johnson noise of 10 kΩ at 300 K in 10 kHz is 1.29 μV rms', close(Math.sqrt(v2), 1.287e-6, 1e-3), `${Math.sqrt(v2)}`);
  const P = X.johnson.defaults;
  check('a 50 pF shunt costs 100 kΩ about 3% of its bandwidth', close(M.bandR(P, 1e5) / P.B, 0.9685, 2e-3), `${M.bandR(P, 1e5) / P.B}`);
  check('… and 10 kΩ under 0.05%', M.bandR(P, 1e4) / P.B > 0.9995);
}
check('single slit 0.08 mm at 1 m: first zero at 7.91 mm', close(M.fringeX(0.08e-3, 1, 632.8, 1), 7.91e-3, 1e-3), `${M.fringeX(0.08e-3, 1, 632.8, 1)}`);
check('double slit d = 0.25 mm at 0.8 m: fringes 2.025 mm apart', close(M.fringeX(0.25e-3, 1, M.HENE, 0.8), 2.0250e-3, 1e-3));
check('the slit pattern is 1 at the centre and 0 at a sin θ = λ', close(M.slitI(X.slit1.defaults, 0), 1, 1e-12) && M.slitI(X.slit1.defaults, M.fringeX(0.08e-3, 1, M.HENE, 1)) < 1e-12);
check('NA of 1.492 / 1.402 is 0.510', close(M.naOf(1.492, 1.402), 0.5104, 1e-3));
{
  const P = X.torsion.defaults;
  check('κ = πGa⁴/2l = 5.36 mN m/rad', close(M.kappaOf(P), 5.3617e-3, 1e-3), `${M.kappaOf(P)}`);
  check('T² is linear in r² with slope 8π²m/κ', close((M.torsionT(P, 0.1) ** 2 - M.torsionT(P, 0) ** 2) / 0.01, (8 * Math.PI ** 2 * P.m) / M.kappaOf(P), 1e-9));
}
check('the grating sends Hα (air) to 23.29° at 603 lines/mm', close(M.gratingTheta(M.balmer(3).air, 603), 23.293, 1e-3), `${M.gratingTheta(M.balmer(3).air, 603)}`);

// Poisson deviates: mean and variance from a fine grid of u
for (const mu of [3.2, 40, 900]) {
  let s = 0, s2 = 0; const n = 4000;
  for (let k = 0; k < n; k++) { const x = M.poisson(mu, (k + 0.5) / n); s += x; s2 += x * x; }
  const m = s / n, v = s2 / n - m * m;
  check(`Poisson(${mu}): mean and variance`, close(m, mu, 0.01) && close(v, mu, 0.04), `${m} ${v}`);
}

// the chaotic pendulum: Taylor's γ = 1.105 is chaotic, λ ≈ 0.71 s⁻¹
const lam = M.chaosLambda(1.105);
check('the stored long-run λ at γ = 1.105 is 0.72 s⁻¹', Math.abs(lam - 0.7227) < 1e-9);
for (let k = 0; k < 6; k++) { const S = M.CHAOS_STATES, i = 60 * k; const st = [S[2 * i], S[2 * i + 1]]; check(`stored state ${i} lies on the chaotic attractor (600-period λ > 0.6)`, (await import('../src/viz/model/cm5-chaos.js')).lyapunov({ gamma: 1.105 }, st, { skip: 5, periods: 600 }) > 0.6); }

// the same rows re-read under a systematic: same z, different readings
{
  const rows = M.makeRows('cutback', { seed: 3 });
  const a = M.readRows('cutback', rows, { flags: { clad: false } }), b = M.readRows('cutback', rows, { flags: { clad: true } });
  check('cladding light raises only the short lengths', b[0].p - a[0].p < 0.02 && b[b.length - 1].p - a[a.length - 1].p > 0.5, `${b[0].p - a[0].p} ${b[b.length - 1].p - a[a.length - 1].p}`);
}

// over many seeds: z about 0 with the systematic handled; off it when not
const runs = [
  ['slit2', {}, null, 0], ['slit2', { Lref: true }, null, 1], ['slit1', {}, null, 0], ['slit1', { Lref: true }, null, -1],
  ['cutback', { clad: false }, null, 0], ['cutback', { clad: true }, null, 1], ['na', {}, null, 0], ['na', { eye: true }, null, -1],
  ['decay', {}, null, 0], ['decay', { bg: false }, null, 1], ['decay', {}, 'counts', 0],
  ['johnson', { cap: false }, null, 0], ['johnson', { cap: true }, null, -1],
  ['ediff', {}, 'exact', 0], ['ediff', {}, 'inner', 0], ['ediff', {}, 'outer', -1],
  ['rydberg', {}, null, 0], ['rydberg', { nominal: true }, null, -1],
  ['sound', {}, null, 0], ['sound', { warm: true }, null, 1], ['sound', {}, 'origin', -1],
  ['torsion', {}, null, 0],
];
for (const [id, flags, axes, sign] of runs) {
  const zs = [];
  for (let seed = 1; seed <= 60; seed++) zs.push(M.run(id, { seed, flags, axes }).results[0].z);
  const m = zs.reduce((a, b) => a + b, 0) / zs.length, sd = Math.sqrt(zs.reduce((a, b) => a + (b - m) ** 2, 0) / zs.length);
  const tag = `${id} ${JSON.stringify(flags)} ${axes || ''}`;
  if (sign === 0) check(`${tag}: results scatter about the accepted value (mean z ${m.toFixed(2)}, sd ${sd.toFixed(2)})`, Math.abs(m) < 0.45 && sd > 0.7 && sd < 1.35);
  else check(`${tag}: the systematic pulls the result ${sign > 0 ? 'high' : 'low'} (mean z ${m.toFixed(2)})`, sign * m > 2.5);
}
{
  const zs = []; for (let s = 1; s <= 30; s++) zs.push(M.run('chaos', { seed: s, params: { ens: s } }).results[0].z);
  const m = zs.reduce((a, b) => a + b, 0) / zs.length;
  check(`chaos: finite-time λ within 2σ of Benettin on average (mean z ${m.toFixed(2)})`, Math.abs(m) < 2);
  const zc = []; for (let s = 1; s <= 30; s++) zc.push(M.run('chaos', { seed: s, params: { ens: s }, flags: { coarse: true } }).results[0].z);
  check('chaos: a coarse encoder pulls λ low', zc.reduce((a, b) => a + b, 0) / zc.length < -2.5);
  const za = []; for (let s = 1; s <= 30; s++) za.push(M.run('chaos', { seed: s, params: { ens: s }, axes: 'all' }).results[0].z);
  check('chaos: fitting the saturated tail pulls λ low', za.reduce((a, b) => a + b, 0) / za.length < -3);
}
{
  const A = M.run('torsion', { seed: 5, flags: { own: false } }), B = M.run('torsion', { seed: 5 });
  check('forgetting the masses’ own inertia shifts I₀ by exactly 2·mR²/2', close(A.results[1].value - B.results[1].value, 2 * M.Icm(X.torsion.defaults), 1e-6));
}

// the simulation's validate
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
for (const id of Object.keys(X)) check(`${id} validates`, validate({ ...defaults, exp: id }).length === 0, validate({ ...defaults, exp: id }).join('; '));
check('an unknown experiment is caught', validate({ ...defaults, exp: 'warp' }).length > 0);
check('an unknown flag is caught', validate({ ...defaults, exp: 'decay', flags: { dead: true } }).length > 0);
check('a setting out of range is caught', validate({ ...defaults, exp: 'torsion', settings: [0.5] }).length > 0);
check('an unknown parameter is caught', validate({ ...defaults, exp: 'sound', params: { humidity: 50 } }).length > 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
