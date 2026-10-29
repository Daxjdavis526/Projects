// The Jones-calculus model behind sims/op2-jones.js (PHYS 4650 O6): Malus's
// law, the three-polarizer result, quarter- and half-wave plates (45° linear
// → circular with Hecht's handedness, a half-wave plate rotating linear light
// by twice its angle, two quarter-wave plates making a half-wave plate),
// Stokes parameters and the ellipse, unitarity of retarders, unpolarized
// input, the Poincaré-sphere path of a retarder, and the sim's validator.
//   node atlas/test/op2-jones.test.mjs

import * as J from '../src/viz/model/op2-jones.js';
import { validate, defaults } from '../src/viz/sims/op2-jones.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;
const D = J.DEG;

// Malus
for (const th of [0, 20, 45, 70, 90]) {
  const I = J.intensity(J.apply(J.polarizer(th * D), J.linear(0)));
  check(`Malus at ${th}°`, near(I, Math.cos(th * D) ** 2));
}
// three polarizers 0, 45, 90 with unpolarized input: 1/8
{
  const r = J.chain('unpolarized', [{ kind: 'pol', angle: 0 }, { kind: 'pol', angle: 45 }, { kind: 'pol', angle: 90 }]);
  check('three polarizers pass 1/8 of unpolarized light', near(r[3].I, 0.125));
  check('first polarizer passes half of unpolarized light', near(r[1].I, 0.5));
  const r2 = J.chain('unpolarized', [{ kind: 'pol', angle: 0 }, { kind: 'pol', angle: 90 }]);
  check('crossed polarizers pass nothing', near(r2[2].I, 0));
  const r3 = J.chain('unpolarized', [{ kind: 'qwp', angle: 0 }]);
  check('a wave plate leaves unpolarized light unpolarized', r3[1].v === null && near(r3[1].I, 1));
}
// quarter-wave plate: 45° linear → counterclockwise circular (Hecht's left) with fast axis along x
{
  const v = J.apply(J.qwp(0), J.linear(45 * D)), S = J.stokes(v);
  check('QWP(0) on 45° light gives circular light, S₃ = +1 (ccw, Hecht “left”)', near(S[3], 1, 1e-12) && near(S[1], 0) && near(S[2], 0, 1e-12));
  const w = J.apply(J.qwp(0), J.linear(-45 * D));
  check('QWP(0) on −45° light gives clockwise circular, S₃ = −1', near(J.stokes(w)[3], -1, 1e-12));
  const back = J.apply(J.qwp(0), J.CCW);
  check('QWP(0) turns ccw circular back to linear at −45°', near(J.stokes(back)[3], 0, 1e-12) && near(J.ellipse(back).psi / D, -45, 1e-9));
  // (1, i)/√2 turns counterclockwise facing the wave: at ωt = 0 the field is along x, a quarter period later along +y
  const f0 = J.fieldAt(J.CCW, 0), f1 = J.fieldAt(J.CCW, Math.PI / 2);
  check('(1, i)/√2 turns from +x to +y', f0[0] > 0.7 && near(f0[1], 0, 1e-12) && f1[1] > 0.7 && near(f1[0], 0, 1e-12));
}
// half-wave plate rotates linear light by 2θ
for (const th of [10, 22.5, 30, 60]) {
  const v = J.apply(J.hwp(th * D), J.linear(0));
  check(`HWP at ${th}° turns horizontal light to ${2 * th}°`, near(J.ellipse(v).psi / D, ((2 * th + 90) % 180) - 90, 1e-9) && near(J.stokes(v)[3], 0, 1e-12));
}
// two QWPs = HWP (up to a global phase): compare Stokes outputs
{
  const v0 = J.elliptical(0.8, 0.6, 0.7);
  const a = J.stokes(J.apply(J.mmul(J.qwp(0.3), J.qwp(0.3)), v0)), b = J.stokes(J.apply(J.hwp(0.3), v0));
  check('two quarter-wave plates make a half-wave plate', a.every((x, i) => near(x, b[i], 1e-12)));
}
// retarders are lossless; Stokes vectors stay on the sphere
{
  const v0 = J.elliptical(0.6, 0.8, 1.1);
  for (const G of [0.3, 1.5, 2.7]) {
    const v = J.apply(J.retarder(0.4, G), v0), S = J.stokes(v);
    check(`retarder Γ = ${G} conserves irradiance`, near(J.intensity(v), J.intensity(v0)));
    check(`S₁² + S₂² + S₃² = S₀² (Γ = ${G})`, near(S[1] ** 2 + S[2] ** 2 + S[3] ** 2, S[0] ** 2, 1e-12));
  }
  // a retarder turns the state about its axis: the component along (cos 2θ, sin 2θ, 0) is unchanged
  const th = 0.4, ax = [Math.cos(2 * th), Math.sin(2 * th)];
  const s0 = J.stokes(v0), s1 = J.stokes(J.apply(J.retarder(th, 1.3), v0));
  check('a retarder preserves the Stokes component along its axis', near(s0[1] * ax[0] + s0[2] * ax[1], s1[1] * ax[0] + s1[2] * ax[1], 1e-12));
  const path = J.retarderPath(v0, { kind: 'ret', angle: th / D, delta: 1.3 / D });
  check('retarder path ends at the output state', near(path[path.length - 1][2], s1[3] / s1[0], 1e-12));
}
// the ellipse of an elliptical state
{
  const e = J.ellipse(J.elliptical(2, 1, Math.PI / 2));
  check('E = (2, i): major axis along x, b/a = 1/2, counterclockwise', near(e.psi, 0, 1e-12) && near(Math.tan(e.chi), 0.5, 1e-12) && e.hand === 1);
}
// validator
check('validator accepts the defaults', validate(defaults).length === 0, validate(defaults).join('; '));
check('validator rejects an unknown element', validate({ elements: [{ kind: 'prism' }] }).length > 0);
check('validator rejects a bad control', validate({ elements: [{ kind: 'pol', angle: 0 }], controls: [{ key: 'a', label: 'a', min: 0, max: 1, value: 0, explain: 'x', set: [[2, 'angle']] }] }).length > 0);

console.log(`op2-jones: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
