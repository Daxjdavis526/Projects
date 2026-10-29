// The DOM-free model behind the gr-timewarp simulation: proper time of
// worldlines near Earth's surface, and free fall as the path of maximal aging.
//   node atlas/test/gr-aging.test.mjs

import * as A from '../src/viz/model/gr-aging.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));

// the exact budgets agree with numerical integration, for every shape
for (const shape of Object.keys(A.SHAPES)) {
  const S = A.SHAPES[shape], H = 3.7, T = 1.9;
  const ex = A.budget(shape, H, T), nu = A.budgetNumeric((t) => S.h(H, T, t), (t) => S.v(H, T, t), T, A.G_EARTH, A.C, 60000);   // fine grid: the tent and hover speeds jump
  check(`${shape}: height bonus matches Simpson`, near(ex.bonus, nu.bonus, 1e-4), `${ex.bonus} vs ${nu.bonus}`);
  check(`${shape}: speed penalty matches Simpson`, near(ex.penalty, nu.penalty, 1e-4), `${ex.penalty} vs ${nu.penalty}`);
  check(`${shape}: the path starts and ends on the ground and peaks at H`, S.h(H, T, 0) === 0 && Math.abs(S.h(H, T, T)) < 1e-12 && near(S.h(H, T, T / 2), H, 1e-12));
  // the apex that maximizes the net really is a maximum
  const Hs = A.bestApex(shape, T), n0 = A.budget(shape, Hs, T).net;
  check(`${shape}: best apex is a maximum`, n0 > A.budget(shape, Hs * 1.05, T).net && n0 > A.budget(shape, Hs * 0.95, T).net);
}

// free fall is the arc whose apex maximizes the net, and it beats every shape
for (const T of [0.8, 2, 3.5]) {
  check(`T = ${T} s: the best arc is the free-fall parabola (apex gT²/8)`, near(A.bestApex('arc', T), A.freeFall.apex(T), 1e-12));
  const best = A.freeFall.gain(T);
  check(`T = ${T} s: free-fall gain g²T³/(24c²) equals the best arc's`, near(A.budget('arc', A.freeFall.apex(T), T).net, best, 1e-12));
  for (const shape of ['tent', 'hover']) check(`T = ${T} s: free fall beats the best ${shape} path`, A.budget(shape, A.bestApex(shape, T), T).net < best);
}

// random wiggles added to free fall (keeping the endpoints) always lose proper time
{
  const T = 2.2;
  let worst = -Infinity;
  for (const k of [1, 2, 3, 5]) for (const eps of [-0.8, -0.2, 0.05, 0.3, 1.1]) {
    const h = (t) => A.freeFall.h(T, t) + eps * Math.sin((k * Math.PI * t) / T);
    const v = (t) => A.freeFall.v(T, t) + eps * ((k * Math.PI) / T) * Math.cos((k * Math.PI * t) / T);
    worst = Math.max(worst, A.budgetNumeric(h, v, T).net - A.freeFall.gain(T));
  }
  check('every wiggled path between the same events ages less than free fall', worst < 0, String(worst));
}

// at the optimum the height bonus is exactly twice the speed penalty
{
  const b = A.budget('arc', A.freeFall.apex(2), 2);
  check('free fall: height bonus = 2 × speed penalty', near(b.bonus, 2 * b.penalty, 1e-12));
}
// the research notes' number: a ball thrown up at 10 m/s gains v₀³/(3gc²) = 3.78e-16 s
{
  const v0 = 10, T = (2 * v0) / A.G_EARTH;
  check('ball thrown at 10 m/s gains 3.78e-16 s over the ground clock', near(A.freeFall.gain(T), 3.78e-16, 0.003), String(A.freeFall.gain(T)));
  check('…which is v₀³/(3gc²)', near(A.freeFall.gain(T), v0 ** 3 / (3 * A.G_EARTH * A.C ** 2), 1e-12));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
