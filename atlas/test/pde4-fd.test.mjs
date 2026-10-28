// The models behind the pde4-scheme and pde4-constraint simulations (PDE
// course, modules B13–B14): every amplification factor checked against one
// actual step of its scheme applied to a grid mode; the stability limits
// (upwind, Lax–Friedrichs, Lax–Wendroff and leapfrog ν ≤ 1, FTCS heat r ≤ ½,
// FTCS advection and downwind never); the research notes' numbers (FTCS
// advection |G| = √(1 + ν²) = 1.118 at ν = 0.5; upwind 1.02 and Lax–Wendroff
// 1.04 at ν = 1.01; heat 1.04 at r = 0.51); measured convergence orders
// (upwind 1, Lax–Wendroff 2); blow-up past the CFL limit; upwind's modified
// equation; the staggered Maxwell scheme keeping Gauss's law to round-off
// while the collocated one drifts by an amount ∝ Δx; and the wave toy's
// constraint decaying as e^(−γt).
//   node atlas/test/pde4-fd.test.mjs

import * as M from '../src/viz/model/pde4-fd.js';
import * as K from '../src/viz/model/pde4-constraint.js';
import { validate as vS, defaults as dS } from '../src/viz/sims/pde4-scheme.js';
import { validate as vC, defaults as dC } from '../src/viz/sims/pde4-constraint.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// G from one step applied to the mode e^(ijθ) (real and imaginary parts stepped separately)
for (const [eq, scheme] of [['advect', 'upwind'], ['advect', 'downwind'], ['advect', 'ftcs'], ['advect', 'laxf'], ['advect', 'lw'], ['heat', 'ftcs']]) {
  let worst = 0;
  const N = 64;
  for (const nu of [0.3, 0.8, 1.2]) for (const m of [1, 5, 16, 32]) {
    const th = (2 * Math.PI * m) / N;
    const re = Array.from({ length: N }, (_, j) => Math.cos(j * th)), im = Array.from({ length: N }, (_, j) => Math.sin(j * th));
    const a = M.step(scheme, eq, re, nu), b = M.step(scheme, eq, im, nu);
    const [g] = M.gain(M.gainKey(eq, scheme), th, nu);
    for (let j = 0; j < N; j++) {
      // (re + i im) after the step should be G·e^(ijθ)
      const wr = g[0] * Math.cos(j * th) - g[1] * Math.sin(j * th), wi = g[0] * Math.sin(j * th) + g[1] * Math.cos(j * th);
      worst = Math.max(worst, Math.abs(a[j] - wr), Math.abs(b[j] - wi));
    }
  }
  check(`${eq} ${scheme}: G matches one step of the scheme`, worst < 1e-12, worst.toExponential(2));
}
// leapfrog: G satisfies the three-level recurrence
{
  let worst = 0;
  for (const nu of [0.5, 1, 1.3]) for (const th of [0.3, 1.7, Math.PI]) for (const g of M.gain('leapfrog', th, nu)) {
    // G² − 2(1 − 2ν² sin²(θ/2))G + 1 = 0 in complex arithmetic
    const b = 1 - 2 * nu * nu * Math.sin(th / 2) ** 2;
    const re = g[0] * g[0] - g[1] * g[1] - 2 * b * g[0] + 1, im = 2 * g[0] * g[1] - 2 * b * g[1];
    worst = Math.max(worst, Math.hypot(re, im));
  }
  check('leapfrog: both roots satisfy the recurrence', worst < 1e-12, worst.toExponential(2));
}

// stability limits
const below = (k, lim) => M.maxGain(k, lim - 0.01) <= 1 + 1e-12, above = (k, lim) => M.maxGain(k, lim + 0.01) > 1 + 1e-6;
for (const k of ['upwind', 'laxf', 'lw', 'leapfrog']) check(`${k}: stable to ν = 1, unstable past it`, below(k, 1) && M.maxGain(k, 1) <= 1 + 1e-12 && above(k, 1));
check('FTCS heat: stable to r = ½, unstable past it', below('ftcs', 0.5) && M.maxGain('ftcs', 0.5) <= 1 + 1e-12 && above('ftcs', 0.5));
for (const k of ['ftcs-adv', 'downwind']) check(`${k}: unstable for every ν > 0`, [0.05, 0.3, 0.9].every((n) => M.maxGain(k, n) > 1 + 1e-4));
check('FTCS advection |G| = √(1 + ν²): 1.118 at ν = 0.5', close(M.maxGain('ftcs-adv', 0.5), Math.sqrt(1.25), 1e-6) && Math.abs(M.maxGain('ftcs-adv', 0.5) - 1.118) < 5e-4);
check('upwind 1.02 and Lax–Wendroff 1.04 at ν = 1.01', Math.abs(M.maxGain('upwind', 1.01) - 1.02) < 1e-9 && Math.abs(M.maxGain('lw', 1.01) - 1.0402) < 1e-4);
check('FTCS heat |G| = 1.04 at r = 0.51', Math.abs(M.maxGain('ftcs', 0.51) - 1.04) < 1e-9);
check('upwind |G(π)| = |1 − 2ν|', Math.abs(M.cabs(M.gain('upwind', Math.PI, 1.2)[0]) - 1.4) < 1e-12);

// convergence orders, one period of a smooth bump
const order = (scheme) => {
  const e = [200, 400].map((N) => M.error({ eq: 'advect', scheme, N, nu: 0.5, profile: 'gauss', w: 1.5, t: 10 }).err);
  return Math.log2(e[0] / e[1]);
};
const oU = order('upwind'), oL = order('lw');
check('upwind converges at first order', oU > 0.85 && oU < 1.15, oU.toFixed(3));
check('Lax–Wendroff converges at second order', oL > 1.85 && oL < 2.15, oL.toFixed(3));
{
  const e = [100, 200].map((N) => M.error({ eq: 'heat', scheme: 'ftcs', N, nu: 0.4, profile: 'gauss', w: 1, D: 0.1, t: 2 }).err);
  const p = Math.log2(e[0] / e[1]);
  check('FTCS heat at fixed r converges at second order in Δx', p > 1.85 && p < 2.15, p.toFixed(3));
}
{
  const e = [100, 200].map((N) => M.error({ eq: 'wave', scheme: 'leapfrog', N, nu: 0.5, profile: 'gauss', w: 1, t: 3 }).err);
  const p = Math.log2(e[0] / e[1]);
  check('leapfrog waves converge at second order', p > 1.8 && p < 2.2, p.toFixed(3));
}
// exact solutions: heat exact solution conserves the integral; wave exact at t = 0 is the profile
{
  const o = { eq: 'heat', profile: 'box', w: 1, D: 0.1, L: 10, XL: 0 };
  let s0 = 0, s1 = 0; for (let i = 0; i < 2000; i++) { const x = (i + 0.5) * 0.005; s0 += M.exact(o, x, 0) * 0.005; s1 += M.exact(o, x, 3) * 0.005; }
  check('heat exact solution conserves ∫u dx (periodic)', close(s0, s1, 1e-3), `${s0} ${s1}`);
}

// blow-up
{
  const R = M.run({ eq: 'advect', scheme: 'upwind', N: 100, nu: 1.2, profile: 'gauss', t: 40, cap: 10 });
  check('upwind at ν = 1.2 blows up', R.blown > 0 && R.blown < 200, String(R.blown));
  const S = M.run({ eq: 'advect', scheme: 'upwind', N: 100, nu: 0.9, profile: 'gauss', t: 40, cap: 10 });
  check('upwind at ν = 0.9 does not', !S.blown && S.maxu <= 1 + 1e-12);
  const F = M.run({ eq: 'advect', scheme: 'ftcs', N: 100, nu: 0.5, profile: 'gauss', t: 200, cap: 10 });
  check('FTCS advection blows up even at ν = 0.5', F.blown > 0);
  const W = M.run({ eq: 'wave', scheme: 'leapfrog', N: 200, nu: 1.05, profile: 'gauss', w: 0.5, t: 50, cap: 1e6 });
  check('leapfrog waves at ν = 1.05 blow up within a few hundred steps', W.blown > 0 && W.blown < 400, String(W.blown));
}
// modified equation: upwind spreads a Gaussian's variance by 2 D_num t
{
  const N = 400, nu = 0.5, w = 1, t = 2, o = { eq: 'advect', scheme: 'upwind', N, nu, profile: 'gauss', w, t };
  const R = M.run(o), dx = 10 / N;
  let m0 = 0, m1 = 0, m2 = 0;
  R.x.forEach((x, j) => { m0 += R.u[j]; m1 += R.u[j] * x; });
  const mu = m1 / m0; R.x.forEach((x, j) => { m2 += R.u[j] * (x - mu) ** 2; });
  const v = m2 / m0, pred = w * w / 2 + 2 * M.upwindDiffusivity(1, dx, nu) * R.time;
  check('upwind smears like diffusion with D = cΔx(1 − ν)/2', close(v, pred, 2e-3), `${v} vs ${pred}`);
}

// constraints
{
  const S = [50, 100].map((N) => K.runMaxwell({ N, scheme: 'staggered', tmax: 10 }));
  check('staggered Maxwell keeps Gauss’s law to round-off', S.every((R) => Math.max(...R.hist.map((h) => h[1])) < 1e-12));
  const C = [100, 200, 400].map((N) => K.runMaxwell({ N, scheme: 'collocated', tmax: 5 }));
  check('collocated Maxwell starts with Gauss’s law satisfied to round-off', C.every((R) => R.hist[0][1] < 1e-12));
  const end = C.map((R) => R.hist[R.hist.length - 1][1]);
  check('collocated Maxwell drifts far above round-off', end[0] > 1e-2, end[0].toExponential(2));
  check('the collocated drift halves as Δx halves (first order)', end.slice(1).every((e, i) => Math.abs(Math.log2(end[i] / e) - 1) < 0.25), end.map((e) => e.toExponential(3)).join(' '));
  for (const g of [0, 1, 3]) {
    const R = K.runWave({ N: 100, gamma: g, eps: 0.1, tmax: 2 });
    const [tf, cf] = R.hist[R.hist.length - 1], ratio = cf / R.hist[0][1];
    check(`wave toy: ‖C‖ falls by e^(−γt) at γ = ${g}`, close(ratio, Math.exp(-g * tf), 1e-4) && Math.abs(tf - 2) < 0.02, `${ratio} vs ${Math.exp(-g * tf)}`);
  }
  const Rn = K.runWave({ N: 100, gamma: -0.5, eps: 0.1, tmax: 4 });
  check('wave toy: γ < 0 makes the violation grow as e^(|γ|t)', close(Rn.hist[Rn.hist.length - 1][1] / Rn.hist[0][1], Math.exp(0.5 * Rn.hist[Rn.hist.length - 1][0]), 2e-3));
  const c0 = [50, 100, 200].map((N) => K.runWave({ N, gamma: 0, eps: 0, tmax: 1 }).hist[0][1]);
  check('consistent data: the violation is the truncation error, second order', c0.slice(1).every((e, i) => Math.abs(Math.log2(c0[i] / e) - 2) < 0.1), c0.map((e) => e.toExponential(3)).join(' '));
}

// sims validate their defaults
check('pde4-scheme defaults validate', vS({ ...dS }).length === 0, vS({ ...dS }).join('; '));
check('pde4-scheme rejects a heat upwind scheme', vS({ ...dS, eq: 'heat', scheme: 'upwind' }).length > 0);
check('pde4-constraint defaults validate', vC({ ...dC }).length === 0, vC({ ...dC }).join('; '));

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
