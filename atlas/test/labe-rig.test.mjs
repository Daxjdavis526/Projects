// The simulated classic experiments behind the labe-rig simulation and the lab
// course's E lessons: the constants (CODATA 2022), each experiment's physics
// against numbers computed independently (an e/m beam radius, Millikan drop
// speeds, hν/e for mercury lines, the Franck–Hertz spacings, fringe counts,
// Fabry–Pérot rings, the Cavendish twist, normal modes, time of flight), the
// fitters (Levenberg–Marquardt, weighted mean), seeded data, systematics that
// re-read the same scatter, and — over many seeds — results that scatter about
// the true value with the stated uncertainty when the systematic is handled,
// and miss it when it is not. Plus the simulation's validate().
//   node atlas/test/labe-rig.test.mjs

import * as M from '../src/viz/model/labe-rig.js';
import { validate, defaults } from '../src/viz/sims/labe-rig.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b);
const X = M.EXPERIMENTS;

// constants
check('e/m is CODATA 2022’s 1.75882000838e11 C/kg', close(M.K.em, 1.75882000838e11, 1e-10), `${M.K.em}`);
check('h/e is 4.135667696e-15 V s', close(M.K.he, 4.135667696e-15, 1e-9));
check('mercury ³P₁ (39 412.300 cm⁻¹) is 4.8865 eV', close(M.HG_3P1, 4.88650, 2e-5), `${M.HG_3P1}`);

// e/m: research notes' check, V = 200 V, I = 1.4 A, N = 130, R = 0.15 m → B = 1.091 mT, r = 4.37 cm
{
  const P = X.em.defaults;
  check('Helmholtz field at 1.4 A is 1.091 mT', close(M.helmholtzK(P) * 1.4, 1.091e-3, 2e-3), `${M.helmholtzK(P) * 1.4}`);
  check('beam radius at 1.4 A is 4.37 cm', close(M.emRadius(P, 1.4), 0.0437, 3e-3), `${M.emRadius(P, 1.4)}`);
  const r = M.emRadius(P, 1.4);
  check('e/m = 2V/(B²r²) inverts the radius', close((2 * P.V) / (M.helmholtzK(P) * 1.4 * r) ** 2, M.K.em, 1e-12));
}
// Millikan: Stokes + slip speeds, and the inverse analysis
{
  const P = X.millikan.defaults;
  const a = 1e-6, C = M.slip(P, a);
  const vStokes = (2 * a * a * P.rho * P.g) / (9 * P.eta);
  const { vf, vr } = M.dropSpeeds(P, a, 10);
  check('fall speed is Stokes’s × the slip factor', close(vf, vStokes * C, 1e-12));
  check('a 1 μm drop falls at about 114 μm/s', close(vf, 114e-6, 0.02), `${vf}`);
  const back = M.dropCharge(P, vf, vr, true);
  check('the slip-corrected analysis recovers the radius', close(back.a, a, 1e-9), `${back.a}`);
  check('… and the charge 10 e', close(back.q, 10 * M.K.e, 1e-9), `${back.q}`);
  const un = M.dropCharge(P, vf, vr, false);
  check('the uncorrected charge is q·C^{3/2} exactly', close(un.q, 10 * M.K.e * C ** 1.5, 1e-9));
  const A = M.assignN([1, 2, 3, 5, 4].map((n) => n * M.K.e * (1 + 0.004 * Math.sin(n))), [1, 1, 1, 1, 1].map(() => 0.02e-19));
  check('the e-scan assigns 1, 2, 3, 5, 4', A.n.join() === '1,2,3,5,4', A.n.join());
}
// photoelectric: hν/e for the 365.0 nm line ≈ 3.397 V (research notes)
{
  const R = M.readRows('photo', [{ s: 365.015, z: [0] }], { flags: { contact: false } })[0];
  check('hν/e at 365.0 nm is 3.396 V', close(R.V + X.photo.defaults.phiC, 3.3958, 3e-4), `${R.V + X.photo.defaults.phiC}`);
  const A = M.run('photo', { seed: 1, params: { sV: 1e-9 }, flags: { contact: true } });
  check('noiseless slope is h/e (to rounding)', close(A.results[0].value, M.K.he, 6e-4), `${A.results[0].value}`);
  check('… the intercept gives the anode’s work function', close(-A.fit.a, X.photo.defaults.phiA, 2e-3), `${-A.fit.a}`);
}
// Franck–Hertz spacings E(1 + (2n − 1)λ/L)
{
  const P = X.fh.defaults;
  for (const n of [1, 3, 6]) check(`FH spacing ${n} is E(1 + (2n − 1)λ/L)`, close(M.fhPeak(P, n) - M.fhPeak(P, n - 1), P.Ea * (1 + (2 * n - 1) * P.lam), 1e-12));
  const A = M.run('fh', { seed: 2, axes: 'gap', params: { sV: 1e-6 } });
  check('the spacing line at n = ½ gives E (readings rounded to 0.01 V)', close(A.results[0].value, M.HG_3P1, 1.5e-3), `${A.results[0].value}`);
}
// Michelson: 10 μm of mirror travel at 632.8 nm is 31.6 fringes
check('10 μm at 632.8 nm is 31.6 fringes', close((2 * 10000) / 632.8, 31.6, 2e-3));
{
  const R = M.readRows('michelson', [{ s: 50, z: [0] }], { flags: { lever: false } })[0];
  check('50 μm on the dial (10 μm of mirror) counts 32 fringes', R.N === 32, `${R.N}`);
}
// Fabry–Pérot: rings follow r² = f²λ(p − 1 + ε)/d to the paraxial approximation
{
  const P = X.fp.defaults;
  for (const p of [1, 5, 10]) {
    const { r, eps } = M.fpRing(P, p);
    check(`ring ${p} radius matches the paraxial formula to 0.3%`, close(r * r, (P.f ** 2 * P.lam * 1e-9 * (p - 1 + eps)) / P.d, 3e-3));
  }
  check('finesse at R = 0.85 is 19.3', close((Math.PI * Math.sqrt(0.85)) / 0.15, 19.3, 3e-3));
}
// Cavendish: research notes' numbers θ = 8.44 mrad, ΔS = 16.9 cm (no far-sphere correction)
{
  const P = X.cavendish.defaults;
  const th = M.cavTheta(P, M.K.G, false);
  check('Cavendish equilibrium twist is 8.44 mrad', close(th, 8.44e-3, 2e-3), `${th}`);
  check('… the spot moves 4Lθ = 16.9 cm', close(4 * P.L * th, 0.169, 3e-3));
  check('far-sphere factor β is about 0.075', close(M.farBeta(P), 0.0750, 0.01), `${M.farBeta(P)}`);
  // noiseless fit returns G
  const A = M.run('cavendish', { seed: 1, params: { sS: 0.001 }, flags: { drift: true, fitdrift: true, far: true } });
  check('a near-noiseless swing fitted returns G', close(A.results[0].value, M.K.G, 2e-3), `${A.results[0].value}`);
}
// coupled pendulums
{
  const P = X.coupled.defaults;
  const { w1, w2 } = M.modes(P, 0.6);
  check('in-phase mode ω² = g/L', close(w1, 9.8, 1e-12));
  check('out-of-phase ω² = g/L + 2kℓ²/(mL²)', close(w2, 9.8 + 2 * 2 * 0.36, 1e-12));
  check('15° amplitude lengthens the period 0.43%', close(M.amplitudeFactor((15 * Math.PI) / 180), 1.00431, 2e-5), `${M.amplitudeFactor((15 * Math.PI) / 180)}`);
}
// speed of light: 10 m extra round trip is 33.36 ns
check('2 × 5 m of extra path is 33.36 ns', close((M.lightDelay(X.light.defaults, 5) - X.light.defaults.t0), 33.356, 1e-4));

// fitters
{
  const x = [0, 1, 2, 3, 4, 5, 6, 7, 8], y = x.map((t) => 3 + 5 * Math.exp(-t / 2.5)), sy = x.map(() => 0.01);
  const f = M.fitCurve((t, p) => p[0] + p[1] * Math.exp(-t / p[2]), x, y, sy, [2, 4, 1.5]);
  check('Levenberg–Marquardt recovers an exponential', close(f.p[0], 3, 1e-6) && close(f.p[1], 5, 1e-6) && close(f.p[2], 2.5, 1e-6), f.p.join());
  const m = M.fitMean([1, 2, 3], [1, 1, 2]);
  check('weighted mean of 1, 2, 3 with σ 1, 1, 2', close(m.a, (1 + 2 + 0.75) / 2.25, 1e-12));
}
// seeded, and systematics re-read the same scatter
{
  const a = M.run('em', { seed: 7 }), b = M.run('em', { seed: 7 });
  check('the same seed gives the same data', a.R.map((r) => r.D).join() === b.R.map((r) => r.D).join());
  const c = M.analyse('em', a.rows, { flags: { earth: false } });
  const diffs = a.R.map((r, i) => r.D - c.R[i].D);
  check('the opposing ambient field widens every circle (same scatter)', diffs.every((v) => v > 0), diffs.join());
}
// over many seeds: honest results scatter about the truth with the stated σ; systematics bias them
function zs(id, opts, key, N = 120) {
  const z = [];
  for (let s = 1; s <= N; s++) { const A = M.run(id, { seed: s, ...opts }); z.push(A.results.find((r) => r.key === key).z); }
  const m = z.reduce((p, v) => p + v, 0) / z.length;
  return { m, sd: Math.sqrt(z.reduce((p, v) => p + (v - m) ** 2, 0) / (z.length - 1)) };
}
const honest = [
  ['em', { axes: 'inv' }, 'em'], ['millikan', { axes: 'qn' }, 'e'], ['photo', {}, 'he'], ['fh', { axes: 'gap' }, 'E'],
  ['michelson', { flags: { lever: false } }, 'lam'], ['fp', {}, 'eps'], ['coupled', {}, 'k'], ['light', {}, 'c'],
];
for (const [id, opts, key] of honest) {
  const r = zs(id, opts, key);
  check(`${id}: ${key} unbiased (mean z ${r.m.toFixed(2)})`, Math.abs(r.m) < 0.3);
  check(`${id}: ${key} σ honest (sd of z ${r.sd.toFixed(2)})`, r.sd > 0.6 && r.sd < 1.3);
}
{
  const r = zs('cavendish', {}, 'G', 25);
  check(`cavendish: G unbiased with drift fitted (mean z ${r.m.toFixed(2)})`, Math.abs(r.m) < 0.5);
}
const biased = [
  ['em', { axes: 'pp', flags: { earth: true } }, 'em', -3], ['millikan', { flags: { slip: false } }, 'e', 5], ['fh', { axes: 'pos', flags: { mfp: true } }, 'E', 5],
  ['michelson', { flags: { lever: true } }, 'lam', 2], ['fp', { flags: { centre: true } }, 'd', 5], ['photo', { flags: { contact: true } }, 'phi', -4],
];
for (const [id, opts, key, want] of biased) {
  const r = zs(id, opts, key, 40);
  check(`${id}: the systematic biases ${key} (mean z ${r.m.toFixed(1)})`, Math.sign(r.m) === Math.sign(want) && Math.abs(r.m) > Math.abs(want));
}
{
  const r = zs('cavendish', { flags: { far: false } }, 'G', 10);
  check(`cavendish: no far-sphere correction biases G low (mean z ${r.m.toFixed(1)})`, r.m < -5);
}

// the simulation's validate()
for (const exp of Object.keys(X)) check(`labe-rig ${exp} defaults are valid`, validate({ ...defaults, exp }).length === 0, validate({ ...defaults, exp }).join('; '));
check('labe-rig rejects an unknown experiment', validate({ exp: 'zeeman' }).length > 0);
check('labe-rig rejects an unknown flag', validate({ exp: 'em', flags: { slip: true } }).length > 0);
check('labe-rig rejects an unknown axes', validate({ exp: 'em', axes: 'qn' }).length > 0);
check('labe-rig rejects a setting off the slider', validate({ exp: 'em', settings: [5] }).length > 0);
check('labe-rig rejects a line the lamp lacks', validate({ exp: 'photo', settings: [500] }).length > 0);
check('labe-rig rejects an unknown source', validate({ exp: 'michelson', params: { source: 'cd' } }).length > 0);

console.log(`labe-rig: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
