// The torque-free rigid body behind cm4-rigid (PHYS 3550, M7.3–M7.4):
// Euler's equations conserve |L| and E; spins about the largest and smallest
// axes stay close, a spin near the middle axis flips (the tennis-racket
// theorem) at the growth rate the linearized equations predict; a symmetric
// body's ω circles its axis at Ω = (I₃ − I₁)ω₃/I₁; the teaching-model energy
// sink keeps |L|, drains E and ends at the largest axis with E = L²/2I_max;
// every polhode lies on both the sphere and the energy ellipsoid; L stays
// fixed in space; and the sim's validate() accepts its defaults.
//   node atlas/test/cm4-rigid.test.mjs

import * as R from '../src/viz/model/cm4-rigid.js';
import { validate, defaults } from '../src/viz/sims/cm4-rigid.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));
const angle = (a, b) => Math.acos(Math.min(1, Math.abs(R.dot(a, b)) / (Math.hypot(...a) * Math.hypot(...b))));

// box moments and their inverse
{
  const I = R.boxMoments(2, 0.3, 0.2, 0.1), d = R.boxFromMoments(I, 2);
  check('boxFromMoments inverts boxMoments', close(d[0], 0.3, 1e-12) && close(d[1], 0.2, 1e-12) && close(d[2], 0.1, 1e-12), d.join(', '));
}

// conservation and space-fixed L, each axis
const I = [1, 2, 2.6];
for (const ax of [1, 2, 3]) {
  const r = R.run(I, { w0: R.startOmega(ax, 4, 2), T: 40, steps: 4000 }), n = r.t.length - 1;
  check(`axis ${ax}: energy conserved`, close(r.E[n], r.E[0], 1e-8), `${r.E[n]} vs ${r.E[0]}`);
  check(`axis ${ax}: |L| conserved`, close(r.Lmag[n], r.Lmag[0], 1e-8));
  let drift = 0;
  for (let m = 0; m <= n; m += 50) { const Ls = R.qrot(r.q[m], r.L[m]); drift = Math.max(drift, Math.hypot(Ls[0], Ls[1]) / r.Lmag[m]); }
  check(`axis ${ax}: L fixed in space (along +z)`, drift < 1e-6, String(drift));
  let far = 0;
  for (let m = 0; m <= n; m++) { const e = [0, 0, 0]; e[ax - 1] = 1; far = Math.max(far, angle(r.L[m], e)); }
  if (ax === 2) check('middle axis: the spin leaves the axis (a flip)', far > 1.2, `max angle ${far}`);
  else check(`axis ${ax}: the spin stays near its axis`, far < 0.3, `max angle ${far}`);
}

// the middle axis: flips, and the early growth matches the linearized rate
{
  const w = 2, r = R.run(I, { w0: R.startOmega(2, 0.05, w), T: 30, steps: 6000 });
  const s = R.axisStability(I, 2, w);
  check('middle axis predicted unstable', !s.stable);
  // while small, the off-axis part grows as e^{st}: compare its size at two early times
  const off = (m) => Math.hypot(r.w[m][0], r.w[m][2]);
  const t1 = 2, t2 = 4, m1 = Math.round((t1 / 30) * 6000), m2 = Math.round((t2 / 30) * 6000);
  const meas = Math.log(off(m2) / off(m1)) / (t2 - t1);
  check('middle axis: growth rate = ω√((I₂−I₁)(I₃−I₂)/(I₁I₃))', close(meas, s.rate, 0.03), `${meas} vs ${s.rate}`);
  check('middle axis: ω₂ changes sign', R.flipTimes(r, I).length >= 1);
  const s1 = R.axisStability(I, 1, w), s3 = R.axisStability(I, 3, w);
  check('largest and smallest axes predicted stable', s1.stable && s3.stable);
}

// a symmetric body: ω circles the symmetry axis at Ω = (I₃ − I₁)ω₃/I₁
{
  const Is = [1, 1, 1.6], r = R.run(Is, { w0: R.startOmega(3, 15, 2), T: 20, steps: 8000 });
  const w3 = r.w[0][2], Om = R.bodyPrecession(1, 1.6, w3);
  // the angle of (ω₁, ω₂) turns at Ω
  let turned = 0;
  for (let m = 1; m < r.t.length; m++) {
    let d = Math.atan2(r.w[m][1], r.w[m][0]) - Math.atan2(r.w[m - 1][1], r.w[m - 1][0]);
    if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
    turned += d;
  }
  check('symmetric body: body-frame precession rate (I₃ − I₁)ω₃/I₁', close(Math.abs(turned / 20), Om, 1e-4), `${turned / 20} vs ${Om}`);
  check('symmetric body: ω₃ constant', Math.max(...r.w.map((w) => Math.abs(w[2] - w3))) < 1e-9);
}

// the energy sink: |L| kept, E drained, the spin ends on the largest axis
{
  const r = R.run(I, { w0: R.startOmega(1, 5, 2), kappa: 0.08, T: 300, steps: 30000 }), n = r.t.length - 1;
  check('sink: |L| conserved', close(r.Lmag[n], r.Lmag[0], 1e-8));
  let mono = true;
  for (let m = 1; m <= n; m++) if (r.E[m] > r.E[m - 1] + 1e-12) mono = false;
  check('sink: energy never rises', mono);
  check('sink: ends at E = L²/2I_max', close(r.E[n], r.Lmag[0] ** 2 / (2 * 2.6), 2e-3), `${r.E[n]} vs ${r.Lmag[0] ** 2 / 5.2}`);
  check('sink: ends spinning about axis 3', angle(r.L[n], [0, 0, 1]) < 0.05);
}

// polhodes lie on the sphere and on the energy ellipsoid
for (const h of [0.39, 0.42, 0.5, 0.6, 0.9]) {
  let err = 0;
  for (const c of R.polhode(I, h, 1.7)) for (const v of c) err = Math.max(err, Math.abs(Math.hypot(...v) - 1.7), Math.abs(v[0] ** 2 / I[0] + v[1] ** 2 / I[1] + v[2] ** 2 / I[2] - h * 1.7 ** 2));
  check(`polhode h = ${h} on sphere and ellipsoid`, err < 1e-12, String(err));
}
// a run's L stays on its own polhode
{
  const r = R.run(I, { w0: R.startOmega(3, 20, 1.5), T: 30, steps: 3000 }), n = r.t.length - 1;
  const h = (2 * r.E[0]) / r.Lmag[0] ** 2;
  check('a run keeps ΣLᵢ²/Iᵢ / |L|² constant', close((2 * r.E[n]) / r.Lmag[n] ** 2, h, 1e-9));
}

// the sim's validate()
check('validate accepts the defaults', validate({}).length === 0, validate({}).join('; '));
check('validate rejects an impossible body', validate({ I: [1, 1, 3] }).length > 0);
check('validate rejects an unknown panel', validate({ panels: ['x'] }).length > 0);
check('defaults are a physical body', defaults.I[0] + defaults.I[1] >= defaults.I[2]);

console.log(`cm4-rigid: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
