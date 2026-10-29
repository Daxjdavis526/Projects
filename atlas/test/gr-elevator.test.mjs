// The DOM-free model behind the gr-elevator simulation (Einstein's elevator).
//   node atlas/test/gr-elevator.test.mjs

import * as E from '../src/viz/model/gr-elevator.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));

// the equivalence principle: the pairs are indistinguishable from inside
check('rocket and Earth: a dropped ball falls at g relative to the box', E.relativeAcceleration('rocket') === -E.G_EARTH && E.relativeAcceleration('earth') === -E.G_EARTH);
check('free fall and deep space: a released ball floats', E.relativeAcceleration('falling') === 0 && E.relativeAcceleration('space') === 0);
check('from outside, the rocket box accelerates and the ball does not', E.boxAcceleration('rocket') === E.G_EARTH && E.fieldAcceleration('rocket') === 0);
check('from outside, the falling box and the ball fall together', E.boxAcceleration('falling') === E.fieldAcceleration('falling'));

// numbers quoted in the lesson
check('light drops 4.9e-16 m across a 3 m box at 1 g', near(E.lightDrop(3), 4.91e-16, 0.005), String(E.lightDrop(3)));
check('Pound–Rebka: gh/c² = 2.46e-15 over 22.5 m', near(E.gravShift(22.5), 2.456e-15, 0.002), String(E.gravShift(22.5)));
check('optical clocks 33 cm apart: 3.6e-17', near(E.gravShift(0.33), 3.60e-17, 0.005));

// the first-order tidal formula agrees with the exact Newtonian difference
for (const [dx, dy] of [[1, 0], [0, 1], [100, 0], [0, -50], [30, 40]]) {
  const exact = E.newtonAcceleration(dx, dy), centre = E.newtonAcceleration(0, 0);
  const diff = [exact[0] - centre[0], exact[1] - centre[1]];
  const lin = E.tidalAcceleration(dx, dy);
  const scale = Math.hypot(...lin);
  check(`tidal acceleration at (${dx}, ${dy}) m matches the exact difference`, Math.hypot(diff[0] - lin[0], diff[1] - lin[1]) < 1e-3 * scale, `${diff} vs ${lin}`);
}
check('tides: vertical stretch is twice the sideways squeeze', near(E.tidalAcceleration(0, 1)[1], -2 * E.tidalAcceleration(1, 0)[0], 1e-12));
check('tidal squeeze across 1 m at Earth’s surface ≈ 1.5e-6 m/s²', near(-E.tidalAcceleration(1, 0)[0], 1.54e-6, 0.01));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
