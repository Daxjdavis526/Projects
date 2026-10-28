// The curve-from-curvature-and-torsion model behind the dg-frenet simulation,
// checked headlessly: constant κ and τ give the helix with radius κ/(κ²+τ²)
// and pitch 2πτ/(κ²+τ²); τ = 0 gives a planar curve (a circle that closes);
// the frame stays orthonormal and right-handed; and the sim's validate().
//   node atlas/test/dg-frenet.test.mjs

import * as M from '../src/viz/model/dg-frenet.js';
import { validate } from '../src/viz/sims/dg-frenet.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// constant κ, τ: the helix (a cos t, a sin t, b t) with a = κ/w², b = τ/w², t = w s
for (const [k, t] of [[1, 0.5], [0.4, 0.3], [2, 1]]) {
  const w2 = k * k + t * t, a = k / w2, b = t / w2, w = Math.sqrt(w2);
  const L = 4 * Math.PI / w;
  const res = M.integrate(() => k, () => t, L, 800);
  let worst = 0;
  res.p.forEach((p, i) => {
    const th = w * res.s[i];
    worst = Math.max(worst, Math.hypot(p[0] - a * Math.cos(th), p[1] - a * Math.sin(th), p[2] - b * th));
  });
  check(`κ=${k}, τ=${t}: integrated curve is the helix of radius κ/(κ²+τ²)`, worst < 1e-6, worst);
  const end = res.p[res.p.length - 1];
  check(`κ=${k}, τ=${t}: two turns rise 2 × 2πτ/(κ²+τ²)`, near(end[2], 4 * Math.PI * b, 1e-6), end[2]);
}

// τ = 0, constant κ: a planar circle that closes after length 2π/κ
{
  const k = 0.8, res = M.integrate(() => k, () => 0, 2 * Math.PI / k, 600);
  const zs = res.p.map((p) => p[2]);
  check('τ = 0: the curve stays in a plane', Math.max(...zs.map(Math.abs)) < 1e-12);
  const e = res.p[res.p.length - 1], s0 = res.p[0];
  check('τ = 0, κ constant: the circle closes after 2π/κ', Math.hypot(e[0] - s0[0], e[1] - s0[1]) < 1e-8);
}

// variable κ and τ: the frame stays orthonormal and right-handed; |α′| = 1
{
  const res = M.integrate((s) => 1 + 0.5 * Math.sin(s), (s) => 0.3 * s - 0.5, 12, 1200);
  let worst = 0;
  for (let i = 0; i < res.s.length; i += 50) {
    const { T, N, B } = { T: res.T[i], N: res.N[i], B: res.B[i] };
    worst = Math.max(worst, Math.abs(dot(T, T) - 1), Math.abs(dot(N, N) - 1), Math.abs(dot(B, B) - 1), Math.abs(dot(T, N)), Math.abs(dot(N, B)), Math.abs(dot(T, B)));
    const c = cross(T, N);
    worst = Math.max(worst, Math.hypot(c[0] - B[0], c[1] - B[1], c[2] - B[2]));
  }
  check('variable κ, τ: frame orthonormal and B = T × N', worst < 1e-8, worst);
  // the curve's curvature, measured from its points, matches κ(s)
  const i = 600, h = res.s[1] - res.s[0];
  const p0 = res.p[i - 1], p1 = res.p[i], p2 = res.p[i + 1];
  const acc = [0, 1, 2].map((k) => (p2[k] - 2 * p1[k] + p0[k]) / (h * h));
  check('curvature recovered from the points', near(Math.hypot(...acc), 1 + 0.5 * Math.sin(res.s[i]), 1e-4), Math.hypot(...acc));
}

// sampleAt and bounds
{
  const res = M.integrate(() => 1, () => 0, 2 * Math.PI, 400);
  const q = M.sampleAt(res, Math.PI);
  check('sampleAt finds the half-way point', near(q.s, Math.PI, 1e-9) && near(q.p[0], -1, 1e-8));
  const b = M.bounds(res.p);
  check('bounds of the unit circle', near(b.size, 2, 1e-4) && near(b.centre[0], 0, 1e-4));
}

// validate()
check('validate accepts a good spec', validate({ kappa: '1 + 0.2*s', tau: 'c', length: 10, sliders: [{ key: 'c', min: -1, max: 1, value: 0.5 }], at: 2 }).length === 0);
check('validate rejects a bad expression', validate({ kappa: '1 +', tau: '0', length: 5 }).length > 0);
check('validate rejects at outside the length', validate({ kappa: '1', tau: '0', length: 5, at: 9 }).length > 0);
check('validate rejects an unknown readout', validate({ kappa: '1', tau: '0', length: 5, readouts: ['speed'] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
