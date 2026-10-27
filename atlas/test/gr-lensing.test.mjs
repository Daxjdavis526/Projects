// The DOM-free model behind the gr-lensing simulation: point-mass
// gravitational lensing and the numbers quoted in the light-bending lesson.
//   node atlas/test/gr-lensing.test.mjs

import * as L from '../src/viz/model/gr-lensing.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));
const MAS = L.RAD_TO_ARCSEC * 1e3, UAS = L.RAD_TO_ARCSEC * 1e6;
const R_SUN = 6.957e8;

// the two images solve the lens equation β = θ − 1/θ, and the ring appears at β = 0
for (const u of [0.05, 0.3, 1, 2.5]) {
  const [a, b] = L.images(u);
  check(`u = ${u}: outer image solves the lens equation`, near(a - 1 / a, u, 1e-12));
  check(`u = ${u}: inner image solves the lens equation`, near(b - 1 / b, u, 1e-12));
  check(`u = ${u}: images on opposite sides, outer beyond the ring`, a > 1 && b < 0 && b > -1);
  const m = L.magnifications(u);
  check(`u = ${u}: total magnification is the sum of the two`, near(m.outer + m.inner, m.total, 1e-12));
  // magnification of each image = |θ/β · dθ/dβ| for a point lens
  const mu = (th) => Math.abs((th / u) / (1 + 1 / (th * th)));
  check(`u = ${u}: outer magnification from the lens map`, near(mu(a), m.outer, 1e-9));
  check(`u = ${u}: inner magnification from the lens map`, near(mu(b), m.inner, 1e-9));
}
{
  const [a, b] = L.images(0);
  check('aligned source: both images on the Einstein ring', near(a, 1, 1e-12) && near(b, -1, 1e-12));
}
// inverse ray shooting maps every point of the Einstein ring to the lens centre
for (const ang of [0, 1, 2.5, 4]) {
  const [bx, by] = L.lensMap(Math.cos(ang), Math.sin(ang));
  check(`ring point at ${ang} rad maps to β = 0`, Math.hypot(bx, by) < 1e-12);
}
check('the inverse map sends an image back to its source', near(L.lensMap(L.images(0.7)[0], 0)[0], 0.7, 1e-12));

// numbers quoted in the lesson (research notes Q2/Q4)
check('solar-limb bending 1.751″', near(L.bend(L.M_SUN, R_SUN) * L.RAD_TO_ARCSEC, 1.751, 0.002), String(L.bend(L.M_SUN, R_SUN) * L.RAD_TO_ARCSEC));
check('star at 90° from the Sun, seen from 1 AU: 4.07 mas', near(L.bendSeenFrom(L.M_SUN, L.AU, Math.PI / 2) * MAS, 4.07, 0.003), String(L.bendSeenFrom(L.M_SUN, L.AU, Math.PI / 2) * MAS));
check('bendSeenFrom tends to the full 4GM/c²b at the solar limb', near(L.bendSeenFrom(L.M_SUN, L.AU, R_SUN / L.AU), L.bend(L.M_SUN, R_SUN), 1e-4));
check('a star opposite the Sun is not bent at all', Math.abs(L.bendSeenFrom(L.M_SUN, L.AU, Math.PI - 1e-9)) < 1e-12);
{
  const tE = L.einsteinRadius(0.5 * L.M_SUN, 4e3 * L.PC, 8e3 * L.PC);
  check('Einstein radius of 0.5 M☉ at 4 kpc, source 8 kpc: 0.71 mas', near(tE * MAS, 0.71, 0.01), String(tE * MAS));
  check('…which is 2.85 AU at the lens', near((tE * 4e3 * L.PC) / L.AU, 2.85, 0.01), String((tE * 4e3 * L.PC) / L.AU));
}
check('the Sun focuses grazing light at 548 AU', near(L.focalDistance(L.M_SUN, R_SUN) / L.AU, 548, 0.003), String(L.focalDistance(L.M_SUN, R_SUN) / L.AU));
check('Sgr A* shadow 53.3 μas (4.30e6 M☉ at 8.275 kpc)', near(L.shadowDiameter(4.30e6 * L.M_SUN, 8275 * L.PC) * UAS, 53.3, 0.003), String(L.shadowDiameter(4.30e6 * L.M_SUN, 8275 * L.PC) * UAS));
check('M87* shadow 39.7 μas (6.5e9 M☉ at 16.8 Mpc)', near(L.shadowDiameter(6.5e9 * L.M_SUN, 16.8e6 * L.PC) * UAS, 39.7, 0.003), String(L.shadowDiameter(6.5e9 * L.M_SUN, 16.8e6 * L.PC) * UAS));
check('the shadow is √27/2 ≈ 2.6 times the horizon’s diameter', near(L.shadowDiameter(1, 1) / (4 * L.massLength(1)), Math.sqrt(27) / 2, 1e-12));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
