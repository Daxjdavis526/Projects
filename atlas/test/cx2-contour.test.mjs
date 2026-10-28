// The contour-integral model behind the cx2-contour simulation: the complex
// expression compiler, contours of every kind, ∮ f dz against the textbook
// values (∮dz/z = 2πi, ∮z̄ dz = 2πi, Cauchy's theorem, the integral formula,
// residues of poles and of an essential singularity), path independence for
// an analytic f, the Riemann sum closing in on the integral, winding numbers,
// the ML bound; and the simulation's parameter validator.
//   node atlas/test/cx2-contour.test.mjs

import * as C from '../src/viz/model/cx2-contour.js';
import { validate, defaults } from '../src/viz/sims/cx2-contour.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const cclose = (a, b, tol = 1e-9) => C.abs(C.sub(a, b)) <= tol * Math.max(1, C.abs(b));
const show = (z) => `${z[0]} + ${z[1]}i`;
const PI = Math.PI, I2 = [0, 2 * PI];
const circle = (r, c = [0, 0]) => ({ kind: 'circle', c, r });
const integ = (src, spec, E = {}) => { const g = C.compile(src, Object.keys(E)); return C.integrate((z) => g(z, E), spec); };

// ── the compiler ──
const at = (src, z, E = {}) => C.compile(src, Object.keys(E))(z, E);
check('i² = −1', cclose(at('i^2', [0, 0]), [-1, 0]));
check('implicit products: 2z, 3i, z(z + 1)', cclose(at('2z + 3i', [1, 1]), [2, 5]) && cclose(at('z(z + 1)', [1, 1]), [1, 3]));
check('precedence: −z² is −(z²); 2^−1 = ½', cclose(at('-z^2', [0, 1]), [1, 0]) && cclose(at('2^-1', [0, 0]), [0.5, 0]));
check('e^{iπ} = −1', cclose(at('exp(i pi)', [0, 0]), [-1, 0], 1e-15) && cclose(at('e^(i*pi)', [0, 0]), [-1, 0], 1e-12));
check('whole powers are exact: (1 + i)⁸ = 16', cclose(at('z^8', [1, 1]), [16, 0], 1e-15));
check('sin, cos, cosh agree: cos(iy) = cosh y', cclose(at('cos(i*2)', [0, 0]), [Math.cosh(2), 0]));
check('conj, re, im, abs', cclose(at('conj(z) + re(z) + i im(z) + abs(z)', [3, 4]), [3 + 3 + 5, -4 + 4]));
check('parameters are real numbers', cclose(at('a z', [1, 1], { a: 2 }), [2, 2]));
check('principal log and sqrt', cclose(at('log(z)', [-1, 0]), [0, PI]) && cclose(at('sqrt(z)', [-4, 0]), [0, 2]));
for (const bad of ['z +', 'foo(z)', 'sin z', '(z', 'q z']) {
  let threw = false; try { C.compile(bad); } catch { threw = true; }
  check(`“${bad}” is rejected`, threw);
}

// ── the archetypes ──
check('∮dz/z = 2πi on the unit circle', cclose(integ('1/z', circle(1)), I2, 1e-12));
check('∮z̄ dz = 2πi on the unit circle (z̄ = 1/z there)', cclose(integ('conj(z)', circle(1)), I2, 1e-12));
check('∮z̄ dz = 2πir² on a circle of radius r', cclose(integ('conj(z)', circle(1.5)), [0, 2 * PI * 2.25], 1e-12));
check('∮z² dz = 0', C.abs(integ('z^2', circle(1))) < 1e-12);
check('∮dz/z² = 0 (a pole without residue)', C.abs(integ('1/z^2', circle(0.7))) < 1e-12);
check('∮dz/z clockwise = −2πi', cclose(integ('1/z', { kind: 'circle', c: [0, 0], r: 1, ccw: false }), [0, -2 * PI], 1e-12));
check('∮dz/z round a square = 2πi', cclose(integ('1/z', { kind: 'rect', x: [-1, 2], y: [-0.5, 1] }), I2, 1e-10));
check('∮dz/z = 0 when 0 is outside', C.abs(integ('1/z', circle(0.5, [1.2, 0.3]))) < 1e-12);
check('∮e^z/(z − 1) dz = 2πie on |z| = 2', cclose(integ('exp(z)/(z - 1)', circle(2)), [0, 2 * PI * Math.E], 1e-12));
check('∮sin z/z² dz = 2πi on |z| = 1', cclose(integ('sin(z)/z^2', circle(1)), I2, 1e-12));
check('Res[e^{1/z}, 0] = 1', cclose(C.div(integ('exp(1/z)', circle(1)), I2), [1, 0], 1e-10));
check('Res[e^z/z³, 0] = ½', cclose(C.div(integ('exp(z)/z^3', circle(1)), I2), [0.5, 0], 1e-12));
check('Res[1/(z² + 1), i] = −i/2', cclose(C.div(integ('1/(z^2 + 1)', circle(0.5, [0, 1])), I2), [0, -0.5], 1e-12));
check('Res[cot πz, 0] = 1/π', cclose(C.div(integ('cot(pi z)', circle(0.5)), I2), [1 / PI, 0], 1e-10));
check('two poles inside: ∮dz/(z² + 1) = 0 on |z| = 2', C.abs(integ('1/(z^2 + 1)', circle(2))) < 1e-12);
check('Cauchy average: (1/2πi)∮cos z/(z − a) dz = cos a', cclose(C.div(integ('cos(z)/(z - 0.3 - 0.2i)', circle(0.8, [0.3, 0.2])), I2), [Math.cos(0.3) * Math.cosh(0.2), -Math.sin(0.3) * Math.sinh(0.2)], 1e-12));

// ── open paths ──
check('∫ z² dz from 0 to 1 + i = (1 + i)³/3 along a segment', cclose(integ('z^2', { kind: 'segment', from: [0, 0], to: [1, 1] }), [-2 / 3, 2 / 3], 1e-12));
check('… and along the L-shaped path through 1 (path independence)', cclose(integ('z^2', { kind: 'poly', pts: [[0, 0], [1, 0], [1, 1]], closed: false }), [-2 / 3, 2 / 3], 1e-12));
check('∫ z̄ dz depends on the path: segment gives 1, L-path gives 1 + i', cclose(integ('conj(z)', { kind: 'segment', from: [0, 0], to: [1, 1] }), [1, 0], 1e-12) && cclose(integ('conj(z)', { kind: 'poly', pts: [[0, 0], [1, 0], [1, 1]], closed: false }), [1, 1], 1e-12));
check('upper half circle: ∫dz/z from 1 to −1 = iπ', cclose(integ('1/z', { kind: 'arc', c: [0, 0], r: 1, from: 0, to: PI }), [0, PI], 1e-12));
check('a parametrised curve: the unit circle as (cos t, sin t)', cclose(integ('1/z', { kind: 'param', z: (t) => [Math.cos(t), Math.sin(t)], t: [0, 2 * PI] }), I2, 1e-6));
check('a path made of parts', cclose(integ('1/z', { kind: 'path', parts: [{ kind: 'arc', c: [0, 0], r: 1, from: 0, to: PI }, { kind: 'arc', c: [0, 0], r: 1, from: PI, to: 2 * PI }] }), I2, 1e-12));

// ── the Riemann sum ──
{
  const f = C.compile('1/z');
  const e = [8, 32, 128].map((N) => C.abs(C.sub(C.riemann(f, circle(1), N).chain.at(-1), I2)));
  check('the sum of N arrows closes in on 2πi as N grows', e[0] > e[1] && e[1] > e[2] && e[2] < 1e-3, e.join(', '));
  const R = C.riemann(f, circle(1), 24);
  check('24 pieces make 24 arrows and a chain of 25 points', R.arrows.length === 24 && R.chain.length === 25);
}

// ── winding, length, ML ──
check('winding numbers', C.winding(circle(1), [0.3, 0.2]) === 1 || Math.abs(C.winding(circle(1), [0.3, 0.2]) - 1) < 1e-9);
check('winding 0 outside, −1 clockwise', Math.abs(C.winding(circle(1), [2, 0])) < 1e-9 && Math.abs(C.winding({ kind: 'circle', c: [0, 0], r: 1, ccw: false }, [0, 0]) + 1) < 1e-9);
check('winding is NaN on the contour', Number.isNaN(C.winding({ kind: 'segment', from: [-1, 0], to: [1, 0] }, [0, 0])));
check('length of a circle of radius 2 is 4π', Math.abs(C.length(circle(2)) - 4 * PI) < 1e-10);
check('length of a 3-4-5 path', Math.abs(C.length({ kind: 'poly', pts: [[0, 0], [3, 0], [3, 4]], closed: false }) - 7) < 1e-12);
{
  const f = C.compile('1/z^2'), { M, at } = C.maxAbs(f, { kind: 'segment', from: [1, -1], to: [1, 1] });
  check('max |1/z²| on the segment x = 1, |y| ≤ 1 is 1, at z = 1', Math.abs(M - 1) < 1e-9 && Math.abs(at[1]) < 1e-9);
  const I = integ('1/z^2', { kind: 'segment', from: [1, -1], to: [1, 1] });
  check('|∫| ≤ ML', C.abs(I) <= M * 2 + 1e-12, show(I));
}
check('a contour through a pole is detected', C.hitsSingularity(C.compile('1/z'), { kind: 'segment', from: [-1, 0], to: [1, 0] }));
check('… and a clear one is not', !C.hitsSingularity(C.compile('1/z'), circle(1)));

// ── the validator ──
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('an unknown function is caught', validate({ ...defaults, f: 'foo(z)' }).length > 0);
check('a bad contour kind is caught', validate({ ...defaults, contour: { kind: 'blob' } }).length > 0);
check('a draggable contour must be numbers', validate({ ...defaults, sliders: [{ key: 'r', label: 'r', min: 0, max: 2, value: 1, explain: 'radius' }], contour: { kind: 'circle', c: [0, 0], r: 'r' } }).length > 0);
check('… which is fine when not dragged', validate({ ...defaults, drag: false, sliders: [{ key: 'r', label: 'r', min: 0.1, max: 2, value: 1, explain: 'radius' }], contour: { kind: 'circle', c: [0, 0], r: 'r' } }).length === 0);
check('TeX in a mark label is caught', validate({ ...defaults, marks: [{ x: 0, y: 0, label: 'z_0' }] }).length > 0);
check('fns validate', validate({ ...defaults, fns: [{ f: 'z^2', label: '$z^2$' }, { f: 'conj(z)', label: 'z̄' }] }).length === 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
