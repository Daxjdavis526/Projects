// The geometry behind the calc-vectors3d simulation, and its parameter
// validator, checked headlessly.
//   node atlas/test/calc-vectors3d.test.mjs

import * as G from '../src/viz/model/calc-vectors3d.js';
import { validate } from '../src/viz/sims/calc-vectors3d.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;
const nearV = (a, b, tol = 1e-12) => a.every((v, k) => near(v, b[k], tol));

// products
check('i × j = k', nearV(G.cross([1, 0, 0], [0, 1, 0]), [0, 0, 1]));
check('j × i = −k', nearV(G.cross([0, 1, 0], [1, 0, 0]), [0, 0, -1]));
{
  const a = [1, 2, 3], b = [-4, 0.5, 2], c = G.cross(a, b);
  check('a × b is perpendicular to a and b', near(G.dot(c, a), 0, 1e-12) && near(G.dot(c, b), 0, 1e-12));
  const th = Math.acos(G.dot(a, b) / (G.length(a) * G.length(b)));
  check('|a × b| = |a||b| sin θ', near(G.length(c), G.length(a) * G.length(b) * Math.sin(th), 1e-12));
}

// plane bases, for normals along every axis and in awkward directions
for (const n of [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1], [0.3, -2, 0.01], [1e-3, 1e-3, -5]]) {
  const [u, w] = G.planeBasis(n);
  check(`plane basis for ${n} is orthonormal and perpendicular to n`,
    near(G.length(u), 1, 1e-12) && near(G.length(w), 1, 1e-12) && near(G.dot(u, w), 0, 1e-12) && near(G.dot(u, n), 0, 1e-12) && near(G.dot(w, n), 0, 1e-12));
}
{
  // every point of a drawn patch satisfies n·r = d
  const n = [2, -1, 3], d = 4, centre = G.footOfPlane(n, d);
  check('foot of the plane lies on it', near(G.dot(n, centre), d, 1e-12));
  check('foot of the plane is the point nearest the origin', near(G.length(centre), Math.abs(d) / G.length(n), 1e-12));
  const ok = G.planePatch(n, centre, 2.5, 8).flat().every((p) => near(G.dot(n, p), d, 1e-9));
  check('plane patch lies in the plane', ok);
  const c = G.planeCorners(n, centre, 2.5);
  check('patch corners lie in the plane and form a square', c.every((p) => near(G.dot(n, p), d, 1e-9)) && near(G.length(G.sub(c[1], c[0])), 5, 1e-9) && near(G.dot(G.sub(c[1], c[0]), G.sub(c[3], c[0])), 0, 1e-9));
}
{
  const g = G.parallelogramGrid([1, 1, 1], [2, 0, 0], [0, 3, 0], 4);
  check('parallelogram grid spans at + u + v', nearV(g[4][4], [3, 4, 1]) && nearV(g[0][0], [1, 1, 1]));
  const t = G.triangleGrid([0, 0, 0], [1, 0, 0], [0, 1, 0], 4);
  check('triangle grid stays inside the triangle', t.flat().every((p) => p[0] >= -1e-12 && p[1] >= -1e-12 && p[0] + p[1] <= 1 + 1e-12 && near(p[2], 0)));
}
{
  // a line meeting a plane: r = (1, 0, 0) + t(1, 2, 2) meets x + y + z = 6 at t = 1
  const tt = G.linePlaneT([1, 0, 0], [1, 2, 2], [1, 1, 1], 6);
  check('line meets plane at the right parameter', near(tt, 1));
  check('a parallel line never meets the plane', G.linePlaneT([0, 0, 1], [1, -1, 0], [1, 1, 1], 6) === null);
  const pts = G.linePoints([0, 0, 0], [1, 2, 3], -1, 1, 4);
  check('line points run from t0 to t1', nearV(pts[0], [-1, -2, -3]) && nearV(pts[4], [1, 2, 3]));
}

// the validator: a good scene passes, typos and malformed pieces are caught
const good = {
  range: 3,
  sliders: [{ key: 'ax', label: 'a', min: -3, max: 3, value: 1 }, { key: 'ay', label: 'b', min: -3, max: 3, value: 2 }],
  vectors: [{ to: ['ax', 'ay', 0], label: '\\vec a' }, { from: ['ax', 0, 0], to: ['ax', 'ay', 1], dash: true }],
  components: [{ to: ['ax', 'ay', 1] }],
  planes: [{ normal: [0, 0, 1], d: 'ax' }],
  lines: [{ point: [0, 0, 0], dir: [1, 'ay', 0], t: [-2, 2] }],
  parallelograms: [{ u: ['ax', 0, 0], v: [0, 'ay', 0] }],
  triangles: [{ pts: [[0, 0, 0], [1, 0, 0], [0, 1, 0]] }],
  readouts: [{ label: '|a|', expr: 'sqrt(ax^2 + ay^2)' }, { label: 'a', vec: ['ax', 'ay', 0] }],
};
check('a well-formed scene validates', validate(good).length === 0, validate(good).join('; '));
check('a typo in an expression is caught', validate({ ...good, vectors: [{ to: ['ax', 'ayy', 0] }] }).length > 0);
check('a vector with two coordinates is caught', validate({ ...good, vectors: [{ to: ['ax', 'ay'] }] }).length > 0);
check('a plane without a normal is caught', validate({ ...good, planes: [{ d: 1 }] }).length > 0);
check('a slider value outside its range is caught', validate({ ...good, sliders: [{ key: 'ax', label: 'a', min: 0, max: 1, value: 2 }] }).length > 0);
check('a bad readout is caught', validate({ ...good, readouts: [{ label: 'x', expr: 'sqrt(' }] }).length > 0);
check('curves in t and spheres validate', validate({ ...good, curves: [{ param: ['ax*cos(t)', 'sin(t)', 0], t: [0, 'pi'] }], spheres: [{ centre: [0, 0, 'ay'], radius: 2 }] }).length === 0);
check('a curve with two coordinates is caught', validate({ ...good, curves: [{ param: ['cos(t)', 'sin(t)'] }] }).length > 0);
check('a sphere without a radius is caught', validate({ ...good, spheres: [{ centre: [0, 0, 0] }] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
