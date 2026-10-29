// The DOM-free model behind the motor/generator simulation (sims/em-generator.js):
// Faraday's law checked numerically (the emf is −d(NΦ)/dt by a finite
// difference of the flux linkage), the peak NBAω and the rms, the torque
// μ × B against the sum of r × F over the coil's four sides, zero net force,
// the commutator's one-signed torque and its average (2/π)NIAB, and Lenz's
// law (a generator's induced current brakes the rotation).
//   node atlas/test/em-generator.test.mjs

import * as M from '../src/viz/model/em-generator.js';
import { validate, defaults } from '../src/viz/sims/em-generator.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const mag = (v) => Math.hypot(...v);

// ─── Faraday's law, numerically ────────────────────────────────────────────
{
  const N = 100, B = 0.2, A = 0.1 * 0.08, rpm = 3000, w = M.omegaOf(rpm);
  check('3000 rpm is 314.16 rad/s and 50 Hz', near(w, 314.159265, 1e-8) && near(rpm / 60, 50, 1e-12));
  let worst = 0;
  for (let k = 0; k <= 40; k++) {
    const t = (k / 40) * (2 / 50), h = 1e-7;
    const dPhi = (M.linkage(N, B, A, w * (t + h)) - M.linkage(N, B, A, w * (t - h))) / (2 * h);
    worst = Math.max(worst, Math.abs(-dPhi - M.emf(N, B, A, w, t)));
  }
  check('the emf equals −d(NΦ)/dt, by a numerical derivative of the flux', worst < 1e-5 * M.peakEmf(N, B, A, w), `worst ${worst}`);
  check('the peak emf is NBAω = 50.3 V for 100 turns of 10 × 8 cm in 0.2 T at 3000 rpm', near(M.peakEmf(N, B, A, w), 50.265, 1e-4));
  let maxE = 0, sum2 = 0;
  const n = 20000;
  for (let k = 0; k < n; k++) { const e = M.emf(N, B, A, w, (k / n) / 50); maxE = Math.max(maxE, Math.abs(e)); sum2 += e * e; }
  check('…reached when the coil lies along the field (sin ωt = ±1), where the flux is zero', near(maxE, M.peakEmf(N, B, A, w), 1e-6) && Math.abs(M.linkage(N, B, A, Math.PI / 2)) < 1e-15);
  check('the rms emf over a turn is peak/√2', near(Math.sqrt(sum2 / n), M.rmsEmf(M.peakEmf(N, B, A, w)), 1e-6));
  check('a split ring delivers |ε|: never negative', Array.from({ length: 50 }, (_, k) => M.output(N, B, A, w, k * 7.3e-4, 'split')).every((x) => x >= 0));
  check('doubling the rate doubles the peak emf and the frequency', near(M.peakEmf(N, B, A, 2 * w), 2 * M.peakEmf(N, B, A, w), 1e-12));
}

// ─── the motor: torque from the forces on the sides ────────────────────────
{
  const N = 50, I = 2, a = 0.1, b = 0.08, B = 0.3, A = a * b;
  let worst = 0, worstF = 0;
  for (let k = 0; k < 36; k++) {
    const th = (k * Math.PI) / 18 + 0.01;
    const forces = M.sideForces(th, I, a, b, B, N);
    const tq = M.torqueFromForces(forces);
    const mu = M.coil(th, a, b).n.map((c) => c * N * I * A), muxB = M.cross(mu, [0, B, 0]);
    worst = Math.max(worst, mag(tq.map((c, i) => c - muxB[i])) / (N * I * A * B));
    worst = Math.max(worst, Math.abs(tq[0] - M.torque(N, I, A, B, th)) / (N * I * A * B));
    worstF = Math.max(worstF, mag(forces.reduce((s, f) => s.map((c, i) => c + f.F[i]), [0, 0, 0])) / (N * I * a * B));
  }
  check('Σ r × F over the four sides equals μ × B, with μ = NIA n̂', worst < 1e-12, `${worst}`);
  check('the net force on the loop in a uniform field is zero', worstF < 1e-12, `${worstF}`);
  check('the torque is largest, NIAB, when μ is at 90° to B, and zero when μ is along B', near(Math.abs(M.torque(N, I, A, B, Math.PI / 2)), N * I * A * B, 1e-12) && Math.abs(M.torque(N, I, A, B, 0)) < 1e-15);
  check('the torque turns μ toward B (θ shrinks)', M.torque(N, I, A, B, 0.4) < 0 && M.torque(N, I, A, B, -0.4) > 0);
  const sides = M.sideForces(0.7, I, a, b, B, N);
  check('the forces on the long sides are vertical, NIaB each; the short sides are pushed along the axle', sides.every((f, k) => (k % 2 === 0 ? near(Math.abs(f.F[2]), N * I * a * B, 1e-12) && Math.abs(f.F[0]) < 1e-12 : Math.abs(f.F[2]) < 1e-12)));
  const tqs = Array.from({ length: 3600 }, (_, k) => M.torque(N, I, A, B, (k * M.TAU) / 3600, 'split'));
  check('with a commutator the torque never reverses', tqs.every((x) => x >= -1e-15));
  check('…and averages (2/π)NIAB over a turn', near(tqs.reduce((s, x) => s + x, 0) / tqs.length, M.averageTorque(N, I, A, B, 'split'), 1e-3));
  check('with slip rings it averages zero', Math.abs(Array.from({ length: 3600 }, (_, k) => M.torque(N, I, A, B, (k * M.TAU) / 3600)).reduce((s, x) => s + x, 0)) < 1e-9);
}

// ─── Lenz's law: a generator's own current brakes it ───────────────────────
{
  const N = 100, B = 0.2, a = 0.1, b = 0.08, A = a * b, w = 100, R = 5;
  let worst = -Infinity, power = 0;
  for (let k = 1; k < 200; k++) {
    const t = (k / 200) * (M.TAU / w), th = w * t, I = M.emf(N, B, A, w, t) / R;
    const tq = M.torque(N, I, A, B, th);          // the induced current flows round n̂ when ε > 0
    worst = Math.max(worst, tq * Math.sign(w));
    power += -tq * w;
  }
  check('the induced current’s torque always opposes the turning', worst <= 1e-15);
  check('so the turning hand does positive work, which the load turns into heat', power > 0);
}

// ─── the simulation's parameter check ──────────────────────────────────────
check('defaults are valid', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('an unknown mode is caught', validate({ ...defaults, mode: 'dynamo' }).length > 0);
check('an unknown ring is caught', validate({ ...defaults, ring: 'brush' }).length > 0);
check('a slider out of range is caught', validate({ ...defaults, sliders: [{ key: 'N', min: 1, max: 10, value: 50 }] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
