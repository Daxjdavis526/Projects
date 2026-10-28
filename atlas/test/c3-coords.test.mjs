// Cylindrical and spherical coordinates behind the c3-coords simulation
// (physics convention: θ from +z, φ from +x), and its parameter validator,
// checked headlessly.
//   node atlas/test/c3-coords.test.mjs

import * as M from '../src/viz/model/c3-coords.js';
import { validate, defaults } from '../src/viz/sims/c3-coords.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;
const nearV = (a, b, tol = 1e-12) => a.every((v, k) => near(v, b[k], tol));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const D = Math.PI / 180;

// conversions
check('spherical (1, 90°, 0) is +x', nearV(M.sphToCart(1, 90 * D, 0), [1, 0, 0]));
check('spherical (2, 0, φ) is on +z for any φ', nearV(M.sphToCart(2, 0, 1.3), [0, 0, 2]));
check('spherical (1, 90°, 90°) is +y', nearV(M.sphToCart(1, 90 * D, 90 * D), [0, 1, 0]));
check('cylindrical (2, 90°, −1) is (0, 2, −1)', nearV(M.cylToCart(2, 90 * D, -1), [0, 2, -1]));
for (const p of [[1, 2, 3], [-1, 0.5, -2], [0.3, -4, 0], [-2, -2, 1], [0, 0, 5], [0, 0, -5]]) {
  const s = M.cartToSph(...p), c = M.cartToCyl(...p);
  check(`round trip through spherical: ${p}`, nearV(M.sphToCart(...s), p, 1e-12));
  check(`round trip through cylindrical: ${p}`, nearV(M.cylToCart(...c), p, 1e-12));
  check(`angles in range for ${p}`, s[1] >= 0 && s[1] <= Math.PI && s[2] >= 0 && s[2] < 2 * Math.PI && c[1] >= 0 && c[1] < 2 * Math.PI);
  check(`ρ = r sin θ and z = r cos θ for ${p}`, near(c[0], s[0] * Math.sin(s[1]), 1e-12) && near(p[2], s[0] * Math.cos(s[1]), 1e-12));
}
check('a calculus text’s (ρ, θ, φ) = (5, 60°, 30°) is physics (5, 30°, 60°)', JSON.stringify(M.mathToPhysics(5, 60, 30)) === JSON.stringify([5, 30, 60]));

// unit vectors: orthonormal, right-handed, and along the directions each coordinate moves
for (const [th, ph] of [[0.3, 0.2], [1.2, 2.5], [2.8, 4.9], [Math.PI / 2, 0]]) {
  const [er, et, ep] = M.sphBasis(th, ph);
  check(`spherical basis orthonormal at (${th}, ${ph})`, [er, et, ep].every((u) => near(dot(u, u), 1, 1e-12)) && near(dot(er, et), 0, 1e-12) && near(dot(er, ep), 0, 1e-12) && near(dot(et, ep), 0, 1e-12));
  check(`r̂ × θ̂ = φ̂ at (${th}, ${ph})`, nearV(cross(er, et), ep, 1e-12));
  const h = 1e-6, r = 2, p0 = M.sphToCart(r, th, ph);
  const dth = M.sphToCart(r, th + h, ph).map((v, k) => (v - p0[k]) / h), dph = M.sphToCart(r, th, ph + h).map((v, k) => (v - p0[k]) / h);
  check(`moving θ goes along θ̂ with speed r at (${th}, ${ph})`, nearV(dth, et.map((v) => v * r), 1e-5));
  check(`moving φ goes along φ̂ with speed r sin θ at (${th}, ${ph})`, nearV(dph, ep.map((v) => v * r * Math.sin(th)), 1e-5));
}
check('at the equator on +x, θ̂ points down (−z)', nearV(M.sphBasis(Math.PI / 2, 0)[1], [0, 0, -1], 1e-12));
{
  const [er, ep, ez] = M.cylBasis(0.7);
  check('cylindrical basis: ρ̂ × φ̂ = ẑ', nearV(cross(er, ep), ez, 1e-12));
}
check('scale factors', JSON.stringify(M.cylScale(2)) === '[1,2,1]' && nearV(M.sphScale(2, Math.PI / 6), [1, 2, 1], 1e-12));

// surfaces: every grid point satisfies its equation
{
  const ok = (g, f) => g.flat().every((p) => near(f(p), 0, 1e-9));
  check('cylinder ρ = 1.5', ok(M.surfaces.cylinder(1.5, 2), (p) => Math.hypot(p[0], p[1]) - 1.5));
  check('sphere r = 2', ok(M.surfaces.sphere(2), (p) => Math.hypot(...p) - 2));
  check('cone θ = 40°', ok(M.surfaces.cone(40 * D, 3), (p) => (Math.hypot(...p) < 1e-12 ? 0 : Math.acos(p[2] / Math.hypot(...p)) - 40 * D)));
  check('half-plane φ = 120°', ok(M.surfaces.halfPlane(120 * D, 3, 2), (p) => p[0] * Math.sin(120 * D) - p[1] * Math.cos(120 * D)) && M.surfaces.halfPlane(120 * D, 3, 2).flat().every((p) => p[0] * Math.cos(120 * D) + p[1] * Math.sin(120 * D) >= -1e-12));
  check('disc z = −0.5', ok(M.surfaces.disc(-0.5, 3), (p) => p[2] + 0.5));
}

// the coordinate box: 12 edges, whose lengths approach the scale factors times the increments
{
  const q = [2, 1.0, 0.7], d = [1e-3, 1e-3, 1e-3];
  const E = M.element('spherical', q, d);
  check('the box has 12 edges, 4 along each coordinate', E.length === 12 && [0, 1, 2].every((a) => E.filter((e) => e.axis === a).length === 4));
  const base = (a) => M.length(E.find((e) => e.axis === a).pts);
  check('spherical edges: dr, r dθ, r sin θ dφ', near(base(0), 1e-3, 1e-9) && near(base(1), 2e-3, 1e-8) && near(base(2), 2 * Math.sin(1.0) * 1e-3, 1e-8));
  const C = M.element('cylindrical', [1.5, 0.4, 0], d);
  const cb = (a) => M.length(C.find((e) => e.axis === a).pts);
  check('cylindrical edges: dρ, ρ dφ, dz', near(cb(0), 1e-3, 1e-9) && near(cb(1), 1.5e-3, 1e-8) && near(cb(2), 1e-3, 1e-9));
}

// the validator
{
  const good = { ...defaults, system: 'spherical', point: [2, 60, 45], readouts: ['x', 'r', 'theta'] };
  check('a good spec passes', validate(good).length === 0, validate(good).join('; '));
  check('an unknown system is caught', validate({ ...good, system: 'polar' }).length > 0);
  check('a polar angle over 180° is caught', validate({ ...good, point: [2, 200, 45] }).length > 0);
  check('a cylindrical point beyond the range is caught', validate({ ...good, system: 'cylindrical', point: [5, 30, 0] }).length > 0);
  check('an unknown surface is caught', validate({ ...good, surfaces: ['rho'] }).length > 0);
  check('an unknown readout is caught', validate({ ...good, readouts: ['w'] }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
