// The contouring behind the c3-contour simulation (marching squares, joined
// polylines, nice levels, label spots) and its parameter validator, checked
// headlessly.
//   node atlas/test/c3-contour.test.mjs

import * as M from '../src/viz/model/c3-contour.js';
import { validate, defaults } from '../src/viz/sims/c3-contour.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// sampling
{
  const g = M.sampleGrid((x, y) => x + 10 * y, [0, 1], [0, 2], 4, 8);
  check('grid has (nx+1) × (ny+1) values', g.z.length === 5 && g.z[0].length === 9);
  check('grid values are f at the nodes', g.z[4][8] === 21 && g.z[2][4] === 10.5);
  const h = M.sampleGrid((x, y) => Math.sqrt(1 - x * x - y * y), [-1, 1], [-1, 1], 10);
  check('undefined values become NaN', Number.isNaN(h.z[0][0]) && Number.isFinite(h.z[5][5]));
  check('range skips NaN', M.range(h)[1] === 1 && M.range(h)[0] >= 0);
}

// a circle: x² + y² = 1
{
  const g = M.sampleGrid((x, y) => x * x + y * y, [-2, 2], [-2, 2], 80);
  const segs = M.contourSegments(g, 1);
  const worst = Math.max(...segs.flat().map(([x, y]) => Math.abs(Math.hypot(x, y) - 1)));
  check('circle: every crossing lies on x² + y² = 1', worst < 2e-3, `worst ${worst}`);
  const lines = M.joinSegments(segs);
  check('circle: the pieces join into one curve', lines.length === 1, `${lines.length} pieces`);
  const L = lines[0], closed = Math.hypot(L[0][0] - L[L.length - 1][0], L[0][1] - L[L.length - 1][1]) < 1e-9;
  check('circle: the curve closes on itself', closed);
  check('circle: its length is 2π', Math.abs(M.length(L) - 2 * Math.PI) < 0.01, `${M.length(L)}`);
  check('a level above the range gives nothing', M.contourSegments(g, 100).length === 0);
}

// a saddle: x² − y² = c gives two branches; c = 0 two crossing lines
{
  const g = M.sampleGrid((x, y) => x * x - y * y, [-2, 2], [-2, 2], 81);
  const lines = M.joinSegments(M.contourSegments(g, 0.5));
  check('hyperbola: two branches', lines.length === 2, `${lines.length}`);
  const worst = Math.max(...lines.flat().map(([x, y]) => Math.abs(x * x - y * y - 0.5)));
  check('hyperbola: points satisfy x² − y² = 0.5', worst < 0.01, `${worst}`);
  check('every branch stays on one side (x > 0 or x < 0)', lines.every((l) => l.every((p) => p[0] > 0) || l.every((p) => p[0] < 0)));
  // the level through the saddle point itself: |x| = |y|
  const zero = M.contourSegments(g, 0);
  check('the saddle level lies along y = ±x', zero.length > 0 && zero.flat().every(([x, y]) => Math.abs(Math.abs(x) - Math.abs(y)) < 0.06));
}

// a level exactly at grid values (a plane z = y at y = 0, a grid line) is found once, without noise
{
  const g = M.sampleGrid((x, y) => y, [-1, 1], [-1, 1], 10);
  const lines = M.joinSegments(M.contourSegments(g, 0));
  check('a contour along a grid line is one straight piece', lines.length === 1 && lines[0].every(([, y]) => Math.abs(y) < 1e-9), JSON.stringify(lines.map((l) => l.length)));
}

// nice levels
{
  const L = M.niceLevels(-3.2, 7.9, 8);
  const step = L[1] - L[0];
  check('nice levels lie inside the range', L.every((c) => c > -3.2 && c < 7.9));
  check('nice levels are evenly spaced', L.every((c, k) => k === 0 || Math.abs(c - L[k - 1] - step) < 1e-9));
  const m = step / 10 ** Math.floor(Math.log10(step));
  check('the step is 1, 2, 2.5 or 5 × 10ⁿ', [1, 2, 2.5, 5].some((x) => Math.abs(m - x) < 1e-9), `${step}`);
  check('about the requested number of levels', L.length >= 5 && L.length <= 11, `${L.length}`);
  check('levels from a list', JSON.stringify(M.levelsFrom([1, 2, 4], 0, 9)) === '[1,2,4]');
  check('levels from { from, to, step }', JSON.stringify(M.levelsFrom({ from: -1, to: 1, step: 0.5 }, 0, 9)) === '[-1,-0.5,0,0.5,1]');
  check('an empty range gives no levels', M.niceLevels(2, 2).length === 0);
}

// labels
{
  const line = [[0, 0], [1, 0], [2, 0]];
  const p = M.labelSpot(line);
  check('a label sits at the middle of its curve', Math.abs(p[0] - 1) < 1e-9 && p[1] === 0);
  const q = M.labelSpot(line, { taken: [[1, 0]], gap: 0.5 });
  check('a label avoids one already placed', q && Math.abs(q[0] - 1) > 0.5);
  check('no label when nothing is inside', M.labelSpot(line, { inside: () => false }) === null);
  check('level text uses a true minus sign', M.levelText(-2) === '−2' && M.levelText(0.125) === '0.125' && M.levelText(2.0001) === '2');
}

// the validator
{
  const good = { ...defaults, f: 'x^2 - a*y^2', sliders: [{ key: 'a', label: 'a', min: 0, max: 2, value: 1 }], highlight: 'a', probe: [1, 1],
    points: [{ x: 1, y: 'a' }], curves: [{ param: ['cos(t)', 'a*sin(t)'], t: [0, 'pi'] }], arrows: [{ from: [0, 0], to: [1, 'a'] }],
    readouts: [{ label: 'f', expr: 'fp + px*py' }] };
  check('a good spec passes', validate(good).length === 0, validate(good).join('; '));
  check('a missing f is caught', validate({ ...good, f: undefined }).length > 0);
  check('a bad expression is caught', validate({ ...good, f: 'x^2 +* y' }).length > 0);
  check('an undeclared name is caught', validate({ ...good, highlight: 'b' }).length > 0);
  check('bad levels are caught', validate({ ...good, levels: { from: 0, to: 1, step: 0 } }).length > 0);
  check('a reversed window is caught', validate({ ...good, x: [2, -2] }).length > 0);
  check('a slider out of range is caught', validate({ ...good, sliders: [{ key: 'a', label: 'a', min: 0, max: 2, value: 3 }] }).length > 0);
  check('a curve with three coordinates is caught', validate({ ...good, curves: [{ param: ['t', 't', 't'], t: [0, 1] }] }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
