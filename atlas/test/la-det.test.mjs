// The geometry behind the la-det simulation (the determinant as signed area,
// its picture proof and Cramer's rule as a ratio of areas), checked headlessly.
//   node atlas/test/la-det.test.mjs

import * as D from '../src/viz/model/la-det.js';
import * as SIM from '../src/viz/sims/la-det.js';

const validate = (p) => SIM.validate({ ...SIM.defaults, ...p });
let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// the determinant is the shoelace area of the parallelogram, sign included
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647) * 8 - 4; };
let ok = true;
for (let k = 0; k < 200; k++) {
  const a1 = [rnd(), rnd()], a2 = [rnd(), rnd()];
  if (!near(D.polyArea(D.parallelogram(a1, a2)), D.det(a1, a2))) ok = false;
}
check('det [a₁ a₂] equals the signed (shoelace) area of the parallelogram', ok);
check('det [e₁ e₂] = 1 and swapping the columns flips the sign', D.det([1, 0], [0, 1]) === 1 && D.det([0, 1], [1, 0]) === -1);
check('a shear a₂ → a₂ + k a₁ keeps the determinant', near(D.det([3, 1], [1 + 2.5 * 3, 2 + 2.5 * 1]), D.det([3, 1], [1, 2])));

// the turning arrow's sign is the determinant's sign
ok = true;
for (let k = 0; k < 200; k++) {
  const a1 = [rnd(), rnd()], a2 = [rnd(), rnd()], o = D.orientArc(a1, a2), d = D.det(a1, a2);
  if (!o || Math.sign(o.sweep) !== Math.sign(d) || Math.abs(o.sweep) > Math.PI + 1e-12) ok = false;
}
check('the arc from a₁ to a₂ turns counterclockwise exactly when det > 0, by less than a half-turn', ok);
check('a zero column has no arc', D.orientArc([0, 0], [1, 2]) === null);
check('a₁ = (1, 0), a₂ = (0, 1): a quarter turn counterclockwise', near(D.orientArc([1, 0], [0, 1]).sweep, Math.PI / 2));

// the box picture: the box minus the six pieces is ad − bc
ok = true;
for (const [a1, a2] of [[[3, 1], [1, 2]], [[2, 0], [1, 3]], [[4, 1], [2, 3]], [[1, 0.2], [0.3, 2]], [[5, 2], [1, 1]]]) {
  const p = D.proofPieces(a1, a2), det = D.det(a1, a2);
  const cut = p.pieces.reduce((s, q) => s + q.area, 0);
  if (!near(p.W * p.H - cut, det)) ok = false;
}
check('box (a + b)(c + d) minus two ac/2 triangles, two bd/2 triangles and two bc rectangles leaves ad − bc', ok);
check('the box picture is refused outside the first quadrant or for det < 0', D.proofPieces([1, 2], [3, 1]) === null && D.proofPieces([-1, 1], [1, 2]) === null);
const pp = D.proofPieces([3, 1], [1, 2]);
check('the six pieces sit inside the box and outside the parallelogram (centroids)', pp.pieces.every((q) => {
  const c = q.pts.reduce((s, p) => [s[0] + p[0] / q.pts.length, s[1] + p[1] / q.pts.length], [0, 0]);
  const inBox = c[0] > 0 && c[0] < pp.W && c[1] > 0 && c[1] < pp.H;
  // inside the parallelogram 0, a₁, a₁ + a₂, a₂ ⇔ both coordinates in (0, 1)
  const s = D.det(c, [1, 2]) / D.det([3, 1], [1, 2]), t = D.det([3, 1], c) / D.det([3, 1], [1, 2]);
  return inBox && !(s > 0 && s < 1 && t > 0 && t < 1);
}));

// Cramer's rule
const cr = D.cramer([2, 1], [1, 3], [4, 7]);
check('Cramer: 2x + y = 4, x + 3y = 7 gives x = 1, y = 2', near(cr.x[0], 1) && near(cr.x[1], 2), JSON.stringify(cr));
check('Cramer: the slid parallelogram (x₁a₁, a₂) has the area of (b, a₂)', near(D.det([cr.x[0] * 2, cr.x[0] * 1], [1, 3]), cr.D1));
check('Cramer refuses a singular matrix', D.cramer([1, 2], [2, 4], [1, 1]) === null);

// the frame contains every point it was given
const f = D.frame([[3, 1], [1, 2], [4, 3]], 2);
check('the window holds the parallelogram', [[0, 0], [3, 1], [1, 2], [4, 3]].every(([x, y]) => Math.abs(x - f.centre[0]) <= 2 * f.half && Math.abs(y - f.centre[1]) <= f.half));

// validate
check('validate accepts the defaults', validate({}).length === 0, validate({}).join('; '));
check('validate accepts slider expressions', validate({ cols: [[3, 1], ['1 + k*3', '2 + k']], sliders: [{ key: 'k', label: 'k', min: -2, max: 2, value: 0 }] }).length === 0);
check('validate rejects an unknown name', validate({ cols: [[3, 1], ['q', 2]] }).length > 0);
check('validate rejects TeX in a canvas label', validate({ names: ['a_1', 'a₂'] }).length > 0);
check('validate rejects cramer without b', validate({ cramer: 1 }).length > 0);
check('validate rejects drag on expressions', validate({ drag: true, cols: [['k', 1], [1, 2]], sliders: [{ key: 'k', label: 'k', min: 0, max: 2, value: 1 }] }).length > 0);
check('validate rejects a bad readout key', validate({ readout: ['det', 'volume'] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
