// The plane-polar kinematics model behind cm-polar (PHYS 3550): the four
// acceleration terms against analytic motions, the polar components against
// the Cartesian second derivative, and the simulation's validator.
//   node atlas/test/cm-polar.test.mjs

import * as M from '../src/viz/model/cm-polar.js';
import { validate, defaults } from '../src/viz/sims/cm-polar.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// uniform circular motion: only the centripetal term, −Rω²
{
  const R = 2, w = 1.5, k = M.kin(() => R, (t) => w * t, 0.7);
  check('circle: centripetal term is −Rω²', close(k.terms.cent, -R * w * w, 1e-6));
  check('circle: the other three terms vanish', Math.abs(k.terms.rdd) + Math.abs(k.terms.tang) + Math.abs(k.terms.cor) < 1e-5);
  check('circle: speed Rω', close(k.speed, R * w, 1e-8));
}
// a bead sliding freely on a rod turning at ω: r = r0 cosh ωt, so a_r = 0 and a_θ = 2ṙω
{
  const r0 = 0.3, w = 2, t = 0.8, k = M.kin((s) => r0 * Math.cosh(w * s), (s) => w * s, t);
  check('bead on a rod: radial acceleration is zero', Math.abs(k.ar) < 1e-5, `${k.ar}`);
  check('bead on a rod: transverse acceleration is 2ṙω', close(k.at, 2 * r0 * w * Math.sinh(w * t) * w, 1e-6));
}
// a straight line at constant velocity, seen in polar coordinates: every term cancels
{
  const b = 1, v = 2, k = M.kin((s) => Math.hypot(b, v * s), (s) => Math.atan2(v * s, b), 0.9);
  check('straight line: r̈ = rθ̇² (radial terms cancel)', Math.abs(k.ar) < 1e-5, `${k.ar}`);
  check('straight line: rθ̈ = −2ṙθ̇ (transverse terms cancel)', Math.abs(k.at) < 1e-5, `${k.at}`);
  check('straight line: the terms themselves are not zero', Math.abs(k.terms.cent) > 0.1 && Math.abs(k.terms.cor) > 0.1);
}
// any motion: the polar components equal the Cartesian second derivative, rotated
for (const [rs, ths] of [[(t) => 1 + 0.4 * t, (t) => 0.8 * t], [(t) => 2 + Math.sin(3 * t), (t) => t * t / 2], [(t) => Math.exp(0.2 * t), (t) => Math.cos(t)]]) {
  const t = 1.3, h = 1e-3;
  const X = (s) => rs(s) * Math.cos(ths(s)), Y = (s) => rs(s) * Math.sin(ths(s));
  const ax = (X(t + h) - 2 * X(t) + X(t - h)) / (h * h), ay = (Y(t + h) - 2 * Y(t) + Y(t - h)) / (h * h);
  const k = M.kin(rs, ths, t);
  check('polar acceleration equals the Cartesian one', Math.hypot(k.a[0] - ax, k.a[1] - ay) < 1e-4, `${k.a} vs ${[ax, ay]}`);
  const vx = (X(t + h) - X(t - h)) / (2 * h), vy = (Y(t + h) - Y(t - h)) / (2 * h);
  check('polar velocity equals the Cartesian one', Math.hypot(k.v[0] - vx, k.v[1] - vy) < 1e-5);
}
{
  const f = M.fit([[1, 2], [-3, 0.5]]);
  check('fit contains the points and the origin', f.x[0] < -3 && f.x[1] > 1 && f.y[0] < 0 && f.y[1] > 2);
}
check('cm-polar defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('cm-polar rejects a bad expression', validate({ ...defaults, r: '1 + * t' }).length > 0);
check('cm-polar rejects an unknown show key', validate({ ...defaults, show: ['velocity'] }).length > 0);
check('cm-polar rejects a reserved slider key', validate({ ...defaults, sliders: [{ key: 't', label: 'x', explain: 'y', min: 0, max: 1, value: 0 }] }).length > 0);

console.log(`cm-polar: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
