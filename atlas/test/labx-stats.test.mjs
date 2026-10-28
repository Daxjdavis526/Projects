// The statistics model behind the labx-stats simulation and the lab course's
// uncertainty lessons: special functions against SciPy 1.18 reference values,
// the seeded samplers' moments, linear propagation against exact results,
// Monte Carlo against linear propagation where the formula is linear and
// against exact moments where it is not, the weighted mean, and the sim's
// validator.
//   node atlas/test/labx-stats.test.mjs

import * as M from '../src/viz/model/labx-stats.js';
import { validate, defaults } from '../src/viz/sims/labx-stats.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-300, Math.abs(b));

// special functions (reference values from scipy.special / scipy.stats 1.18.1)
check('erf(1)', close(M.erf(1), 0.8427007929497149, 1e-13), M.erf(1));
check('within ±1σ', close(M.within(1), 0.6826894921370859, 1e-12));
check('within ±2σ', close(M.within(2), 0.9544997361036416, 1e-12));
check('within ±3σ', close(M.within(3), 0.9973002039367398, 1e-12));
check('one-sided 5σ tail', close(M.normalSf(5), 2.866515718791933e-7, 1e-9), M.normalSf(5));
check('two-sided p of z = 5', close(M.pTwo(5), 5.733031437583866e-7, 1e-9));
check('Φ⁻¹(0.975)', close(M.normalQuantile(0.975), 1.959963984540054, 1e-12), M.normalQuantile(0.975));
check('Φ⁻¹(1e-7)', close(M.normalQuantile(1e-7), -5.199337582187471, 1e-10), M.normalQuantile(1e-7));
check('χ² tail 18.3 at ν = 8', close(M.chi2Sf(18.3, 8), 0.019086430554643357, 1e-10), M.chi2Sf(18.3, 8));
check('χ² tail 3.2 at ν = 1', close(M.chi2Sf(3.2, 1), 0.07363827012030258, 1e-10));
check('χ² 2.5% point at ν = 10', close(M.chi2Cdf(3.24697278, 10), 0.025, 1e-7));
check('χ² 97.5% point at ν = 10', close(M.chi2Cdf(20.48317735, 10), 0.975, 1e-8));
check('χ² density integrates to 1 (ν = 5)', (() => { let s = 0; const h = 0.001; for (let x = h / 2; x < 80; x += h) s += M.chi2Pdf(x, 5) * h; return close(s, 1, 1e-5); })());
check('Poisson cdf P(N ≤ 3 | 5.5)', close(M.poissonCdf(3, 5.5), 0.20169919870252867, 1e-12));
check('Poisson pmf sums to 1', close(Array.from({ length: 80 }, (_, k) => M.poissonPmf(k, 12.5)).reduce((a, b) => a + b, 0), 1, 1e-13));
check('t 95% at ν = 4', close(M.tQuantile(0.95, 4), 2.7764451051977987, 1e-9), M.tQuantile(0.95, 4));
check('t 95% at ν = 9', close(M.tQuantile(0.95, 9), 2.2621571627409915, 1e-9));
check('ln Γ(10) = ln 9!', close(M.lnGamma(10), Math.log(362880), 1e-14));

// samplers: moments of 200 000 seeded draws
for (const [dist, P] of [['normal', { mu: 3, sigma: 0.5 }], ['uniform', { mu: 1, a: 2 }], ['triangular', { mu: -1, a: 3 }], ['poisson', { lam: 4.2 }], ['poisson', { lam: 250 }]]) {
  const xs = M.samples(dist, P, 200000, 7);
  const st = M.stats(xs), mo = M.moments(dist, P);
  check(`${dist} mean`, Math.abs(st.mean - mo.mean) < 5 * mo.sd / Math.sqrt(xs.length), `${st.mean} vs ${mo.mean}`);
  check(`${dist} sd`, close(st.sd, mo.sd, 0.01), `${st.sd} vs ${mo.sd}`);
}
check('samples are seeded', M.samples('normal', { mu: 0, sigma: 1 }, 5, 3).join() === M.samples('normal', { mu: 0, sigma: 1 }, 5, 3).join());
check('means of m draws narrow as 1/√m', (() => { const s = M.stats(M.samples('uniform', { mu: 0, a: 1 }, 40000, 2, 16)).sd; return close(s, 1 / Math.sqrt(3) / 4, 0.02); })());
check('Poisson fraction of zeros', close(M.samples('poisson', { lam: 1.5 }, 200000, 9).filter((k) => k === 0).length / 200000, Math.exp(-1.5), 0.02));
check('stats ddof', (() => { const s = M.stats([1, 2, 3, 4]); return close(s.sd, 1.2909944487358056, 1e-14) && close(s.sdPop, 1.118033988749895, 1e-14); })());

// linear propagation
{
  const r = M.linear(([L, T]) => (4 * Math.PI ** 2 * L) / T ** 2, [1.000, 2.006], [0.002, 0.004]);
  check('pendulum g value', close(r.value, 9.8107, 1e-4), r.value);
  check('pendulum g sigma', close(r.sigma, 0.0438, 3e-3), r.sigma);
  const d = M.linear(([a, b]) => a - b, [10, 4], [0.3, 0.4], 0.5);
  check('difference with ρ = 0.5', close(d.sigma, Math.sqrt(0.09 + 0.16 - 2 * 0.5 * 0.12), 1e-8), d.sigma);
  const p = M.linear(([a, b]) => a * b, [3, 5], [0.03, 0.1]);
  check('product: relative in quadrature', close(p.sigma / 15, Math.hypot(0.01, 0.02), 1e-8));
}
// Monte Carlo
{
  const lin = M.linear(([L, T]) => (4 * Math.PI ** 2 * L) / T ** 2, [1, 2.006], [0.002, 0.004]);
  const mc = M.monteCarlo(([L, T]) => (4 * Math.PI ** 2 * L) / T ** 2, [1, 2.006], [0.002, 0.004], { N: 200000, seed: 4 });
  check('MC agrees with linear for small errors', close(mc.sd, lin.sigma, 0.01) && close(mc.mean, lin.value, 1e-4), `${mc.sd} ${lin.sigma}`);
  const sq = M.monteCarlo(([x]) => x * x, [0], [0.5], { N: 200000, seed: 5 });
  check('x² at 0: mean σ², SD √2 σ²', close(sq.mean, 0.25, 0.01) && close(sq.sd, Math.SQRT2 * 0.25, 0.015), `${sq.mean} ${sq.sd}`);
  const cor = M.monteCarlo(([a, b]) => a - b, [10, 4], [0.3, 0.4], { rho: 0.5, N: 200000, seed: 6 });
  check('MC honours ρ', close(cor.sd, Math.sqrt(0.13), 0.01), cor.sd);
  const inv = M.monteCarlo(([p]) => 1000 / p, [10], [2], { N: 200000, seed: 8 });
  check('1/p is skewed: median below mean', inv.median < inv.mean && close(inv.median, 100, 0.01), `${inv.median} ${inv.mean}`);
}
// weighted mean
{
  const w = M.weightedMean([10, 12], [1, 1]);
  check('equal weights: plain mean', close(w.mean, 11, 1e-12) && close(w.sigma, Math.SQRT1_2, 1e-12) && close(w.chi2, 2, 1e-12));
  const h = M.weightedMean([67.4, 73.04], [0.5, 1.04]);
  check('Planck–SH0ES z', close(M.zscore(67.4, 0.5, 73.04, 1.04), 4.88, 0.01) && close(h.birge, 4.88, 0.01));
}

// instrument readings and specifications
{
  const xs = M.instrumentReadings({ truth: 5, bias: 0.002, sd: 0.0004, res: 0.001, n: 4000, seed: 3 });
  check('readings are rounded to the display step', xs.every((x) => Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6));
  check('readings centre on truth + bias', Math.abs(M.stats(xs).mean - 5.002) < 1e-4);
  check('readings are seeded', M.instrumentReadings({ truth: 1, sd: 0.1, n: 5, seed: 2 }).join() === M.instrumentReadings({ truth: 1, sd: 0.1, n: 5, seed: 2 }).join());
  check('spec ±(0.05 % + 1 digit) at 5.000 V', close(M.specLimit(5, { pct: 0.05, digits: 1, res: 0.001 }), 0.0035, 1e-12));
  check('spec of full scale', close(M.specLimit(100, { fsPct: 0.25, fullScale: 3000 }), 7.5, 1e-12));
}

// the simulation's validator
check('defaults validate', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
for (const mode of ['target', 'readings', 'hist', 'mc', 'tail']) check(`mode ${mode} validates`, validate({ ...defaults, mode }).length === 0, validate({ ...defaults, mode }).join('; '));
check('bad mode rejected', validate({ ...defaults, mode: 'nope' }).length > 0);
check('bad distribution rejected', validate({ ...defaults, mode: 'hist', dist: 'cauchy' }).length > 0);
check('bad mc expression rejected', validate({ ...defaults, mode: 'mc', f: 'x +* y' }).length > 0);
check('unknown control rejected', validate({ ...defaults, mode: 'hist', controls: ['zzz'] }).length > 0);

console.log(`labx-stats: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
