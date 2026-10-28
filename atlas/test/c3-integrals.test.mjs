// The multiple-integral model behind the c3-slicer, c3-boxes and c3-jacobian
// simulations (iterated integrals over strips, Riemann sums of boxes, mapped
// cell areas and Jacobians) and the three simulations' validators, checked
// headlessly.
//   node atlas/test/c3-integrals.test.mjs

import * as M from '../src/viz/model/c3-integrals.js';
import { validate as vSlicer } from '../src/viz/sims/c3-slicer.js';
import { validate as vBoxes, defaults as dBoxes } from '../src/viz/sims/c3-boxes.js';
import { validate as vJac, defaults as dJac } from '../src/viz/sims/c3-jacobian.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// Simpson
check('Simpson: ∫₀¹ x² dx = 1/3', close(M.simpson((x) => x * x, 0, 1, 10), 1 / 3, 1e-12));
check('Simpson: a reversed interval changes sign', close(M.simpson((x) => x, 1, 0), -0.5, 1e-12));

// a region between y = x² and y = √x, both ways
{
  const I = [{ from: 0, to: 1, lo: (x) => x * x, hi: (x) => Math.sqrt(x) }];
  const II = [{ from: 0, to: 1, lo: (y) => y * y, hi: (y) => Math.sqrt(y) }];
  // (√x has an infinite slope at 0, which holds Simpson to about 1e-4 here: plenty for 4-figure readouts)
  check('area between y = x² and y = √x is 1/3 (dy dx)', close(M.iterated(I), 1 / 3, 5e-4), `${M.iterated(I)}`);
  check('… and 1/3 the other way (dx dy)', close(M.iterated(II), 1 / 3, 5e-4));
  const fI = M.iterated(I, (x, y) => x * y), fII = M.iterated(II, (y, x) => x * y);
  check('∬ xy dA over it is 1/12 both ways', close(fI, 1 / 12, 1e-5) && close(fII, 1 / 12, 1e-5), `${fI} ${fII}`);
}

// the classic reversal: ∫₀¹∫₀ˣ e^{x²} dy dx = (e − 1)/2
{
  const I = [{ from: 0, to: 1, lo: () => 0, hi: (x) => x }];
  check('∫₀¹∫₀ˣ e^{x²} dy dx = (e − 1)/2', close(M.iterated(I, (x) => Math.exp(x * x)), (Math.E - 1) / 2, 1e-8));
}

// a region that needs two pieces one way: between y = x² and y = x + 2
{
  const I = [{ from: -1, to: 2, lo: (x) => x * x, hi: (x) => x + 2 }];
  const II = [{ from: 0, to: 1, lo: (y) => -Math.sqrt(y), hi: (y) => Math.sqrt(y) }, { from: 1, to: 4, lo: (y) => y - 2, hi: (y) => Math.sqrt(y) }];
  check('parabola and line: area 9/2 (one piece)', close(M.iterated(I), 4.5, 1e-6));
  check('… and 9/2 in two pieces', close(M.iterated(II), 4.5, 1e-4), `${M.iterated(II)}`);
  const s = M.stripAt(II, 2);
  check('stripAt picks the second piece at y = 2', s && s.k === 1 && close(s.lo, 0, 1e-12) && close(s.hi, Math.SQRT2, 1e-12));
  check('stripAt is null outside the range', M.stripAt(II, 5) === null);
  check('swept integral: 0 at the start, the total at the end', close(M.sweptIntegral(II, 0), 0, 1e-12) && close(M.sweptIntegral(II, 4), M.iterated(II), 1e-4));
  check('swept integral at y = 1 is the first piece: 4/3', close(M.sweptIntegral(II, 1), 4 / 3, 1e-4));
  check('outerRange of the pieces is [0, 4]', M.outerRange(II).join() === '0,4');
  check('a good description has no problems', M.stripProblems(II).length === 0);
  const bad = [{ from: 0, to: 1, lo: (y) => Math.sqrt(y), hi: (y) => -Math.sqrt(y) }, { from: 1.5, to: 4, lo: (y) => y - 2, hi: (y) => Math.sqrt(y) }];
  const probs = M.stripProblems(bad);
  check('stripProblems flags lo above hi and a gap between pieces', probs.some((p) => /lower limit above/.test(p)) && probs.some((p) => /must start/.test(p)), probs.join('; '));
}

// Riemann sums of boxes
{
  const f = (x, y) => x + y;
  const mid = M.boxes(f, [0, 2], [0, 2], 2, 2, 'mid');
  check('midpoint boxes integrate a linear function exactly (8)', close(mid.sum, 8, 1e-12));
  check('there are m × n boxes', mid.list.length === 4 && close(mid.dx, 1) && close(mid.dy, 1));
  check('lower-left corners undershoot an increasing f (4)', close(M.boxes(f, [0, 2], [0, 2], 2, 2, 'll').sum, 4, 1e-12));
  check('upper-right corners overshoot it (12)', close(M.boxes(f, [0, 2], [0, 2], 2, 2, 'ur').sum, 12, 1e-12));
  const g = (x, y) => 4 - x * x / 2 - y * y / 4;
  check('∬ (4 − x²/2 − y²/4) over [0,2]×[0,3] = 15.5', close(M.rectIntegral(g, [0, 2], [0, 3]), 15.5, 1e-9));
  const fine = M.boxes(g, [0, 2], [0, 3], 64, 64, 'mid').sum;
  check('fine midpoint boxes approach it', Math.abs(fine - 15.5) < 1e-3, `${fine}`);
  const tri = M.boxes(() => 1, [0, 1], [0, 1], 40, 40, 'mid', (x, y) => y <= x);
  check('boxes only inside a triangle: area near 1/2', Math.abs(tri.sum - 0.5) < 0.02, `${tri.sum}`);
  check('rectIntegral with a region: ∬_D 1 dA over the triangle ≈ 1/2', Math.abs(M.rectIntegral(() => 1, [0, 1], [0, 1], (x, y) => y <= x) - 0.5) < 0.005);
  check('slice area A(1) = ∫₀³ g(1, y) dy = 8.25', close(M.sliceArea(g, 1, [0, 3]), 8.25, 1e-9));
}

// changes of variables
{
  const X = (r, t) => r * Math.cos(t), Y = (r, t) => r * Math.sin(t);
  check('polar cell [1, 1.5] × [0, 0.5] has area ½(1.5² − 1²)(0.5)', close(M.mappedArea(X, Y, 1, 1.5, 0, 0.5, 200), 0.3125, 1e-4), `${M.mappedArea(X, Y, 1, 1.5, 0, 0.5, 200)}`);
  check('polar Jacobian is r', close(M.jacobianAt(X, Y, 1.7, 0.3).det, 1.7, 1e-8));
  check('the image of [0, 2] × [0, 2π] has area 4π', close(M.imageArea(X, Y, [0, 2], [0, 2 * Math.PI]), 4 * Math.PI, 1e-6));
  const A = (u, v) => (u + v) / 2, B = (u, v) => (u - v) / 2;
  check('x = (u+v)/2, y = (u−v)/2 has J = −1/2', close(M.jacobianAt(A, B, 0.3, 0.8).det, -0.5, 1e-9));
  check('… and reverses orientation: signed image area −½ du dv', close(M.mappedArea(A, B, 0, 2, 0, 1), -1, 1e-9));
  check('shoelace of the unit square is 1', close(M.shoelace([[0, 0], [1, 0], [1, 1], [0, 1]]), 1, 1e-12));
}

// the simulations' validators
{
  const good = {
    x: [-1.5, 2.5], y: [-0.5, 4.5],
    dydx: [{ from: -1, to: 2, lo: 'x^2', hi: 'x + 2', loLabel: 'y = x²', hiLabel: 'y = x + 2' }],
    dxdy: [{ from: 0, to: 1, lo: '-sqrt(y)', hi: 'sqrt(y)' }, { from: 1, to: 4, lo: 'y - 2', hi: 'sqrt(y)' }],
    f: 'x*y + 1',
  };
  check('slicer: a correct pair of descriptions passes', vSlicer(good).length === 0, vSlicer(good).join('; '));
  const wrong = { ...good, dxdy: [{ from: 0, to: 4, lo: 'y - 2', hi: 'sqrt(y)' }] };
  check('slicer: a wrong reversal is caught', vSlicer(wrong).some((p) => /different regions/.test(p)), vSlicer(wrong).join('; '));
  const tex = { ...good, dydx: [{ ...good.dydx[0], hiLabel: '$y = x + 2$' }] };
  check('slicer: TeX in a canvas label is caught', vSlicer(tex).some((p) => /plain text/.test(p)));
  check('slicer: an unparsable boundary is caught', vSlicer({ ...good, dydx: [{ from: -1, to: 2, lo: 'x^^2', hi: 'x + 2' }] }).length > 0);
  check('slicer: one order alone is fine', vSlicer({ x: [0, 1], y: [0, 1], dydx: [{ from: 0, to: 1, lo: '0', hi: 'x' }] }).length === 0);
  check('boxes: the defaults pass', vBoxes(dBoxes).length === 0, vBoxes(dBoxes).join('; '));
  check('boxes: a bad rule is caught', vBoxes({ ...dBoxes, rule: 'left' }).length > 0);
  check('boxes: too many cells is caught', vBoxes({ ...dBoxes, m: 40 }).length > 0);
  const polar = { label: 'Polar', x: 'u*cos(v)', y: 'u*sin(v)', u: [0, 2], v: [0, 'pi'], uName: 'r', vName: 'θ' };
  check('jacobian: a polar map passes', vJac({ ...dJac, maps: [polar] }).length === 0, vJac({ ...dJac, maps: [polar] }).join('; '));
  check('jacobian: a backwards range is caught', vJac({ ...dJac, maps: [{ ...polar, u: [2, 0] }] }).length > 0);
  check('jacobian: TeX in a canvas name is caught', vJac({ ...dJac, maps: [{ ...polar, vName: '\\theta' }] }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
