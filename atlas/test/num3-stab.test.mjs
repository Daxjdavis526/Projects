// The model behind the num3-stability simulation (Numerical Methods, st-f
// F9–F11): every stability function checked against one actual step of its
// method on y′ = λy (complex λ, so the whole plane is tested); Dormand–Prince's
// polynomial rebuilt from its Butcher tableau; the real- and imaginary-axis
// limits the lessons quote (Euler and RK2 2, RK3 2.5127 and √3, RK4 2.7853 and
// 2√2); A-stability of backward Euler and the trapezoid rule, and the
// trapezoid's |R| → 1 at −∞ against backward Euler's → 0; the method-of-lines
// eigenvalues of the heat equation against the matrix itself, and the limits
// they imply (FTCS r ≤ ½, RK4 r ≤ 0.696); and the sim's validate().
//   node atlas/test/num3-stab.test.mjs

import * as M from '../src/viz/model/num3-stab.js';
import { validate, defaults } from '../src/viz/sims/num3-stability.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const C = { add: M.cadd, mul: M.cmul, div: M.cdiv };
const sc = (s, a) => [s * a[0], s * a[1]];

// one step of each method on y′ = λy, y₀ = 1, h = 1 (so z = λ), done with its stages
const TAB = {
  euler: { A: [[]], b: [1] },
  heun: { A: [[], [1]], b: [0.5, 0.5] },
  rk3: { A: [[], [0.5], [-1, 2]], b: [1 / 6, 2 / 3, 1 / 6] },
  rk4: { A: [[], [0.5], [0, 0.5], [0, 0, 1]], b: [1 / 6, 1 / 3, 1 / 3, 1 / 6] },
  dp5: { A: [[], [1 / 5], [3 / 40, 9 / 40], [44 / 45, -56 / 15, 32 / 9], [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729], [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656], [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84]], b: [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84, 0] },
};
function rkStep(m, z) {
  const { A, b } = TAB[m], k = [];
  for (let i = 0; i < b.length; i++) {
    let y = [1, 0];
    for (let j = 0; j < i; j++) y = C.add(y, sc(A[i][j] || 0, k[j]));
    k.push(C.mul(z, y));
  }
  return b.reduce((y, bi, i) => C.add(y, sc(bi, k[i])), [1, 0]);
}
const ZS = [[-0.5, 0.3], [-2.7, 0], [0, 2.5], [-1.2, -1.9], [0.4, 0.4], [-3.1, 1.4]];
for (const m of ['euler', 'heun', 'rk3', 'rk4', 'dp5']) {
  let worst = 0;
  for (const z of ZS) { const a = rkStep(m, z), r = M.R(m, z); worst = Math.max(worst, Math.hypot(a[0] - r[0], a[1] - r[1])); }
  check(`${m}: R(z) equals one step of its tableau`, worst < 1e-12, `max difference ${worst}`);
}
// implicit: backward Euler y₁ = 1 + z y₁; trapezoid y₁ = 1 + z(1 + y₁)/2
for (const z of ZS) {
  const be = C.div([1, 0], [1 - z[0], -z[1]]), r = M.R('beuler', z);
  const res = C.add(be, sc(-1, C.add([1, 0], C.mul(z, be))));
  check(`backward Euler solves its step equation at z = ${z}`, Math.hypot(...res) < 1e-13 && Math.hypot(be[0] - r[0], be[1] - r[1]) < 1e-13);
  const tr = M.R('trap', z), res2 = C.add(tr, sc(-1, C.add([1, 0], sc(0.5, C.mul(z, C.add([1, 0], tr))))));
  check(`trapezoid solves its step equation at z = ${z}`, Math.hypot(...res2) < 1e-13);
}
// the dp5 polynomial's last coefficient: 1/600
check('Dormand–Prince: R has z⁶/600', close(M.coeffs('dp5')[6], 1 / 600, 1e-15));

// the limits the lessons quote
const L = (m) => [M.realLimit(m), M.imagLimit(m)];
check('Euler: real limit 2, unstable on the imaginary axis', close(L('euler')[0], 2, 1e-9) && L('euler')[1] === 0);
check('RK2: real limit 2, unstable on the imaginary axis', close(L('heun')[0], 2, 1e-9) && L('heun')[1] === 0);
check('RK3: real limit 2.5127, imaginary √3', close(L('rk3')[0], 2.512745, 1e-6) && close(L('rk3')[1], Math.sqrt(3), 1e-9));
check('RK4: real limit 2.7853, imaginary 2√2', close(L('rk4')[0], 2.785294, 1e-6) && close(L('rk4')[1], 2 * Math.SQRT2, 1e-9));
check('RK2 on the imaginary axis: |R(iy)|² = 1 + y⁴/4', [0.3, 1, 2].every((y) => close(M.absR('heun', [0, y]) ** 2, 1 + y ** 4 / 4, 1e-13)));
check('Euler on the imaginary axis: |R(iy)|² = 1 + y²', [0.3, 1, 2].every((y) => close(M.absR('euler', [0, y]) ** 2, 1 + y * y, 1e-13)));
// A-stability: |R| ≤ 1 on the whole left half-plane
for (const m of ['beuler', 'trap']) {
  let mx = 0;
  for (let i = 0; i <= 200; i++) for (let j = -100; j <= 100; j++) mx = Math.max(mx, M.absR(m, [-i * 0.5, j * 0.5]));
  check(`${m} is A-stable`, mx <= 1 + 1e-12, `max |R| ${mx}`);
}
check('trapezoid: |R(−10⁶)| → 1 (not L-stable)', M.absR('trap', [-1e6, 0]) > 0.999);
check('backward Euler: |R(−10⁶)| → 0 (L-stable)', M.absR('beuler', [-1e6, 0]) < 1e-5);
check('trapezoid on the imaginary axis is exactly neutral', [0.5, 3, 40].every((y) => close(M.absR('trap', [0, y]), 1, 1e-14)));

// method of lines: the eigenvalues against the matrix, by Rayleigh quotients of the sine modes
for (const N of [5, 20]) {
  const r = 0.37, Z = M.heatZ(N, r);
  let worst = 0;
  for (let k = 1; k <= N; k++) {
    const v = Array.from({ length: N }, (_, j) => Math.sin((k * (j + 1) * Math.PI) / (N + 1)));
    const Av = v.map((x, j) => r * ((j > 0 ? v[j - 1] : 0) - 2 * x + (j < N - 1 ? v[j + 1] : 0)));
    worst = Math.max(worst, ...Av.map((x, j) => Math.abs(x - Z[k - 1][0] * v[j])));
  }
  check(`heat MOL eigenvalues are exact for N = ${N}`, worst < 1e-13, `residual ${worst}`);
}
const molLimit = (m, N) => { let a = 0, b = 2; for (let i = 0; i < 60; i++) { const c = (a + b) / 2; if (M.heatZ(N, c).every((q) => M.absR(m, q) <= 1 + 1e-14)) a = c; else b = c; } return a; };
check('FTCS (Euler on the method of lines): r ≤ ½ as N grows', close(molLimit('euler', 200), 0.5, 1e-3) && molLimit('euler', 200) >= 0.5);
check('RK4 on the method of lines: r ≤ 2.7853/4 = 0.696', close(molLimit('rk4', 200), 2.785294 / 4, 1e-3));
check('logGrowth: n log₁₀|R|', close(M.logGrowth('euler', [-3, 0], 10).num, 10 * Math.log10(2), 1e-12));

// validate()
const v = (o) => validate({ ...defaults, ...o });
check('defaults validate', v({}).length === 0, v({}).join('; '));
check('eigs with labels validate', v({ eigs: [[-1, 0], [-1000, 0]], eigLabels: ['slow', 'fast'], hmin: 1e-4, hmax: 1, h: 0.01 }).length === 0);
check('mol validates', v({ mol: 20, r: 0.4, rmax: 1 }).length === 0);
check('an unknown method is rejected', v({ method: 'rk9' }).length > 0);
check('TeX in a label is rejected', v({ marks: [{ z: [0, 1], label: '$z$' }] }).length > 0);
check('eigs and mol together are rejected', v({ eigs: [[-1, 0]], mol: 10 }).length > 0);

console.log(`num3-stab: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
