// The model behind the labg-rig simulation and the lab course's advanced
// simulated experiments (lab.E.10–E.17): the constants and textbook numbers
// (Compton energies and edge, the etalon's free spectral range, μ_B/h and
// e/m), the binned Poisson fit (unbiased on a pure exponential), the μ⁺/μ⁻
// mixture's lifetime, and for every experiment: with its systematic switched
// off and the recommended analysis, the result agrees with the true value
// over many seeds; with the systematic on, the naive analysis is pulled the
// way the physics says and the recommended one is not. And the validator.
//   node atlas/test/labg-rig.test.mjs

import * as M from '../src/viz/model/labg-rig.js';
import { validate, defaults } from '../src/viz/sims/labg-rig.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b);
const mean = (xs) => xs.reduce((s, v) => s + v, 0) / xs.length;
const res = (id, key, o) => M.run(id, o).results.find((r) => r.key === key);
const seeds = (n) => Array.from({ length: n }, (_, i) => i + 1);

// constants and textbook numbers
check('4π μ_B/h = e/m_e', close(4 * Math.PI * M.K.muBh * 1e9, M.K.em, 1e-9));
check('Compton: E′(90°) = 288.3 keV for Cs-137', Math.abs(M.comptonE(90) - 288.3) < 0.05, M.comptonE(90));
check('Compton: E′(180°) = 184.3 keV', Math.abs(M.comptonE(180) - 184.3) < 0.05);
check('Compton edge 477.3 keV', Math.abs(M.LINES.cs137 - M.comptonE(180) - 477.3) < 0.05);
check('etalon FSR c/(2nd) = 34.29 GHz', Math.abs(M.zmFSR() - 34.29) < 0.01);
check('Zeeman shift at 0.5 T is 7.00 GHz', Math.abs(M.K.muBh * 0.5 - 7.00) < 0.005);
check('γ_p/2π: 21.29 MHz at 0.5 T', Math.abs(M.K.gp * 0.5 - 21.289) < 0.001);
check('blackbody: thermopile sees 17 mV at 1000 K', Math.abs(1000 * M.bbV(1000) - 17.09) < 0.02, 1000 * M.bbV(1000));
check('blackbody Type B ≈ 3.2 %', Math.abs(M.bbTypeB() - 0.0316) < 0.0005);
check('Hall: R_H = −5.20×10⁻³ m³/C', Math.abs(M.hallRH() + 5.2015e-3) < 2e-6, M.hallRH());
check('nmr: null of 1 − 2e^(−τ/T₁) at T₁ ln 2', Math.abs(M.nmrM(M.NM.T1 * Math.LN2)) < 1e-12);
check('muon: μ⁻ share of decays ≈ 0.42', Math.abs(M.muMinusShare() - 0.4207) < 0.001);
{ const t = M.muMixTau(1.0); check('muon: the mix gives ≈ 2.125 μs', Math.abs(t - 2.125) < 0.003, t); }

// the Poisson fit is unbiased on a pure exponential with background
{
  const taus = [];
  for (const s of seeds(40)) {
    const edges = Array.from({ length: 81 }, (_, i) => i * 0.25);
    let a = s * 7919 % 2147483647;
    const rnd = () => (a = (a * 48271) % 2147483647) / 2147483647;
    const counts = edges.slice(0, -1).map((t, i) => { const mu = 3000 * (Math.exp(-t / 2.2) - Math.exp(-edges[i + 1] / 2.2)) + 1.5; return M.poissonFrom(mu, rnd(), Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd())); });
    taus.push(M.muFit(edges, counts, 0).p[1]);
  }
  const m = mean(taus), sd = Math.sqrt(mean(taus.map((v) => (v - m) ** 2)));
  check('Poisson fit unbiased (40 runs)', Math.abs(m - 2.2) < 3 * sd / Math.sqrt(40) + 0.005, `${m} ± ${sd}`);
}

// each experiment: unbiased with the systematic off, the naive analysis pulled with it on
const S = seeds(12);
const z = (id, key, o) => S.map((s) => res(id, key, { ...o, seed: s }).z);
const avgv = (id, key, o) => mean(S.map((s) => res(id, key, { ...o, seed: s }).value));
const okZ = (zs) => mean(zs.map(Math.abs)) < 1.3 && Math.max(...zs.map(Math.abs)) < 3.5;
check('blackbody: σ agrees (no gradient)', okZ(z('blackbody', 'sigma', { flags: { gradient: false } })));
check('blackbody: the thermocouple gradient raises σ by ~5 %', close(avgv('blackbody', 'sigma', { flags: { gradient: true } }) / M.K.sigma, 1.055, 0.015));
check('blackbody: ln V against ln T gives n > 4.1 even without the gradient', avgv('blackbody', 'n', { analysis: 'loglog', flags: { gradient: false } }) > 4.1);
check('zeeman: μ_B/h agrees (lamp centred)', okZ(z('zeeman', 'muB', { flags: { gradient: false } })));
check('zeeman: gradient pulls μ_B/h 3 % low', close(avgv('zeeman', 'muB', { flags: { gradient: true } }) / M.K.muBh, 0.97, 0.008));
check('zeeman: the field map removes it', okZ(z('zeeman', 'muB', { analysis: 'mapped', flags: { gradient: true } })));
check('compton: m_ec² agrees (no drift)', okZ(z('compton', 'mc2', { flags: { drift: false } })));
check('compton: drift pulls m_ec² low', avgv('compton', 'mc2', { flags: { drift: true } }) < 500);
check('compton: recalibrating at each angle removes it', okZ(z('compton', 'mc2', { analysis: 'each', flags: { drift: true } })));
check('gamma: unknown is Mn-54 (no gain shift)', okZ(z('gamma', 'E', { flags: { drift: false } })));
check('gamma: gain shift pushes it ~1.5 % high', close(avgv('gamma', 'E', { flags: { drift: true } }) / M.LINES.mn54, 1.015, 0.003));
check('gamma: K-40 correction restores it', okZ(z('gamma', 'E', { analysis: 'k40', flags: { drift: true } })));
check('nmr: three-parameter fit agrees, bad pulse or not', okZ(z('nmr', 'T1', { flags: { angle: true } })) && okZ(z('nmr', 'T1', { flags: { angle: false } })));
check('nmr: semilog agrees with a bad pulse', okZ(z('nmr', 'T1', { analysis: 'semilog', flags: { angle: true } })));
check('nmr: semilog intercept finds k ≈ 1.94', Math.abs(avgv('nmr', 'k', { analysis: 'semilog', flags: { angle: true } }) - (1 - Math.cos(160 * Math.PI / 180))) < 0.01);
check('nmr: null point 4.4 % low with a 160° pulse', close(avgv('nmr', 'T1', { analysis: 'null', flags: { angle: true } }) / M.NM.T1, Math.log(1 - Math.cos(160 * Math.PI / 180)) / Math.LN2, 0.015));
{
  const t = mean(seeds(30).map((s) => M.run('muon', { seed: s, analysis: 'cut', N: 20000 }).fit.p[1]));
  check('muon: the cut fit finds the mix (20 000 events, 30 runs)', Math.abs(t - M.muMixTau(1.0)) < 0.012, t);
  const ta = mean(seeds(30).map((s) => M.run('muon', { seed: s, analysis: 'all', N: 20000, flags: { afterpulse: true } }).fit.p[1]));
  check('muon: afterpulses pull an all-bins fit low', ta < t - 0.05, ta);
}
check('hall: reversal agrees (drifting sample)', okZ(z('hall', 'RH', { flags: { drift: true } })));
check('hall: one polarity with drift is ~5 % low in |R_H|', close(avgv('hall', 'RH', { analysis: 'single', flags: { drift: true } }) / M.hallRH(), 0.947, 0.01));
{
  const r = M.run('tc', { seed: 3, flags: { emf: false } });
  check('tc: sweeps straddle T_c by the lag', Math.abs(r.warm.mid - r.cool.mid - 2 * (M.TC.rate / 60) * M.TC.lag) < 0.15, `${r.warm.mid} ${r.cool.mid}`);
  check('tc: their mean is T_c', Math.abs((r.warm.mid + r.cool.mid) / 2 - M.TC.Tc) < 0.1);
  check('tc: width 10–90 % ≈ 2 ln 9 · w', Math.abs(r.warm.width - 2 * Math.log(9) * M.TC.w) < 0.2, r.warm.width);
  const e = M.run('tc', { seed: 3, flags: { emf: true } }), er = M.run('tc', { seed: 3, flags: { emf: true, rev: true } });
  check('tc: thermal EMF leaves a 60 μΩ floor', Math.abs(e.warm.floor - 6e-5) < 6e-6, e.warm.floor);
  check('tc: current reversal removes it', Math.abs(er.warm.floor) < 3e-6, er.warm.floor);
}

// the validator
for (const exp of Object.keys(M.RIGS)) check(`labg-rig ${exp} defaults are valid`, validate({ ...defaults, exp }).length === 0, validate({ ...defaults, exp }).join('; '));
check('labg-rig rejects an unknown flag', validate({ exp: 'muon', flags: { drift: true } }).length > 0);
check('labg-rig rejects a bad analysis', validate({ exp: 'nmr', analysis: 'cut' }).length > 0);
check('labg-rig rejects at out of range', validate({ exp: 'compton', at: 9 }).length > 0);

console.log(`labg-rig: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
