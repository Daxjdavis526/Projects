// The DOM-free model behind the rotating-body simulation (sims/mech-rotor.js):
// moments of inertia against direct numerical integration of ∫r² dm, the
// parallel-axis theorem, torque and lever arm, the hanging-block drum against
// Newton's laws, and constant-α kinematics.
//   node atlas/test/mech-rotor.test.mjs

import * as R from '../src/viz/model/mech-rotor.js';
import { validate } from '../src/viz/sims/mech-rotor.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ∫ r² dm by brute force (midpoint sums), about an axis at distance d from the centre along x
function numericI(shape, P, d) {
  let I = 0;
  const n = 400;
  if (shape === 'rod') for (let i = 0; i < n; i++) { const x = -P.L / 2 + ((i + 0.5) * P.L) / n; I += (P.M / n) * (x - d) ** 2; }
  if (shape === 'ring') for (let i = 0; i < n; i++) { const a = ((i + 0.5) * 2 * Math.PI) / n; I += (P.M / n) * ((P.R * Math.cos(a) - d) ** 2 + (P.R * Math.sin(a)) ** 2); }
  if (shape === 'disk' || shape === 'plate') {
    const m = 300;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
      const x = shape === 'disk' ? -P.R + ((i + 0.5) * 2 * P.R) / m : -P.L / 2 + ((i + 0.5) * P.L) / m;
      const y = shape === 'disk' ? -P.R + ((j + 0.5) * 2 * P.R) / m : -P.W / 2 + ((j + 0.5) * P.W) / m;
      if (shape === 'disk' && x * x + y * y > P.R * P.R) continue;
      const dA = shape === 'disk' ? ((2 * P.R) / m) ** 2 : (P.L / m) * (P.W / m);
      const sigma = P.M / (shape === 'disk' ? Math.PI * P.R * P.R : P.L * P.W);
      I += sigma * dA * ((x - d) ** 2 + y * y);
    }
  }
  if (shape === 'dumbbell') I = P.m * (P.s - d) ** 2 + P.m * (-P.s - d) ** 2;
  return I;
}
const P0 = { M: 2.5, R: 0.4, L: 1.6, W: 0.7, m: 1.5, s: 0.35 };
for (const shape of ['rod', 'ring', 'disk', 'plate', 'dumbbell']) for (const d of [0, 0.1, 0.35]) {
  const exact = R.inertia({ shape, ...P0, d }).I, num = numericI(shape, P0, d);
  check(`${shape}, d = ${d}: I matches ∫r² dm`, near(exact, num, shape === 'disk' ? 2e-3 : 1e-4), `${exact} vs ${num}`);
}
check('rod about its end: ML²/3', near(R.inertia({ shape: 'rod', M: 3, L: 2, d: 1 }).I, (3 * 4) / 3));
check('disk about a rim point: (3/2)MR²', near(R.inertia({ shape: 'disk', M: 2, R: 0.5, d: 0.5 }).I, 1.5 * 2 * 0.25));
check('hoop about a rim point: 2MR²', near(R.inertia({ shape: 'ring', M: 2, R: 0.5, d: 0.5 }).I, 2 * 2 * 0.25));
check('solid sphere: (2/5)MR²', near(R.inertia({ shape: 'sphere', M: 5, R: 0.2 }).I, 0.4 * 5 * 0.04));
check('thin shell: (2/3)MR²', near(R.inertia({ shape: 'shell', M: 3, R: 0.3 }).I, (2 / 3) * 3 * 0.09));
for (const shape of Object.keys(R.SHAPES)) {
  const In = R.inertia({ shape, ...P0, d: 0.2 });
  check(`${shape}: parallel axis I = Icm + Md²`, near(In.I, In.Icm + In.M * 0.04));
  check(`${shape}: the axis through the centre of mass gives the least I`, R.inertia({ shape, ...P0, d: 0 }).I < In.I);
}

// torque and lever arm
check('perpendicular push: τ = rF', near(R.torque({ F: 20, r: 0.8, phi: 90 }), 16));
check('push at 30°: τ = rF/2', near(R.torque({ F: 20, r: 0.8, phi: 30 }), 8));
check('push along the radius: no torque', Math.abs(R.torque({ F: 500, r: 0.8, phi: 0 })) < 1e-9 && Math.abs(R.torque({ F: 500, r: 0.8, phi: 180 })) < 1e-9);
check('clockwise push: negative torque', near(R.torque({ F: 10, r: 1, phi: -90 }), -10));
check('lever arm r|sin φ|', near(R.leverArm({ r: 2, phi: 150 }), 1));
check('a force on the other side (r < 0) pushing up turns it clockwise', near(R.torque({ F: 10, r: -1, phi: -90 }), -10));

// the drum and the hanging block: Newton for the block, τ = Iα for the drum, a = αR
for (const [I, Rd, m] of [[0.08, 0.2, 2], [0.5, 0.15, 0.3], [1e-6, 0.1, 1], [2, 0.3, 5]]) {
  const h = R.hang({ I, R: Rd, m });
  const tag = `drum I=${I} R=${Rd} m=${m}`;
  check(`${tag}: mg − T = ma`, near(m * R.G - h.T, m * h.a));
  check(`${tag}: TR = Iα`, near(h.T * Rd, I * h.alpha));
  check(`${tag}: a = αR`, near(h.a, h.alpha * Rd));
  check(`${tag}: 0 < a < g and T < mg`, h.a > 0 && h.a < R.G && h.T < m * R.G);
}
check('massless drum: the block falls freely', near(R.hang({ I: 1e-12, R: 0.2, m: 1 }).a, R.G, 1e-9));
check('2 kg on a 4 kg, 0.20 m disk: a = g/2', near(R.hang({ I: 0.5 * 4 * 0.04, R: 0.2, m: 2 }).a, 4.9));

// kinematics and the whole motion
{
  const s = R.spinAt({ omega0: 2, alpha: 1.5 }, 4);
  check('θ = ω0 t + ½αt²', near(s.theta, 8 + 12));
  check('ω = ω0 + αt', near(s.omega, 8));
  check('ω² = ω0² + 2αθ', near(s.omega ** 2, 4 + 2 * 1.5 * s.theta));
  const M = R.motion({ shape: 'disk', M: 2, R: 0.5, forces: [{ F: 10, r: 0.5, phi: 90 }] });
  check('disk pushed at its rim: α = τ/I = 5/0.25 = 20 rad/s²', near(M.alpha, 20));
  check('work–energy: K after t equals the work τθ', near(M.at(1.3).K, M.tau * M.at(1.3).theta));
  const H = R.motion({ shape: 'disk', M: 4, R: 0.2, hang: 2 });
  check('hanging block: the drum turns clockwise', H.alpha < 0 && near(H.alpha, -24.5));
  const t = 0.6, st = H.at(t);
  check('hanging block: energy is conserved (mg·drop = ½mv² + ½Iω²)', near(2 * R.G * st.drop, 0.5 * 2 * st.vBlock ** 2 + st.K, 1e-9));
  const P = R.pointKinematics(0.4, 3, 2);
  check('a point: v = rω, a_t = rα, a_c = ω²r', near(P.v, 1.2) && near(P.at, 0.8) && near(P.ac, 3.6) && near(P.a, Math.hypot(0.8, 3.6)));
}

// the simulation's parameter check
check('validate: defaults', validate({}).length === 0, validate({}).join('; '));
check('validate: unknown shape', validate({ shape: 'cube' }).length === 1);
check('validate: hanging block needs a round drum', validate({ shape: 'rod', hang: 1 }).length === 1);
check('validate: rF must be given to be a slider', validate({ F: 10, sliders: ['rF'] }).length === 1);
check('validate: slider in range', validate({ F: 10, rF: 0.3, sliders: ['F', 'rF', 'phi'] }).length === 0);
check('validate: slider out of range', validate({ d: 0.9, sliders: ['d'] }).length === 1 && validate({ d: 0.9, sliders: [{ key: 'd', max: 1 }] }).length === 0);
check('validate: shapes include the shape', validate({ shape: 'rod', shapes: ['disk', 'ring'] }).length === 1);
check('validate: unknown readout', validate({ readouts: ['torque'] }).length === 1);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
