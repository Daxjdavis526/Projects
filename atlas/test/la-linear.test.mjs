// The exact arithmetic behind the linear-algebra simulations (la-rowreduce,
// la-map2d, la-vectors), checked headlessly.
//   node atlas/test/la-linear.test.mjs

import * as M from '../src/viz/model/la-linear.js';
import { validate as validateRR } from '../src/viz/sims/la-rowreduce.js';
import { validate as validateMap } from '../src/viz/sims/la-map2d.js';
import { validate as validateVec } from '../src/viz/sims/la-vectors.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const qm = M.qmatrix;
const same = (A, B) => A.length === B.length && A.every((row, i) => row.length === B[i].length && row.every((v, j) => M.qeq(v, B[i][j])));
const show = (A) => A.map((r) => r.map(M.qtext).join(' ')).join(' | ');

// rationals
check('1/2 + 1/3 = 5/6', M.qeq(M.qadd(M.Q(1, 2), M.Q(1, 3)), M.Q(5, 6)));
check('fractions reduce and keep the sign upstairs', M.qeq(M.Q(4, -6), [-2, 3]));
check('qparse reads 3/4, −2, 0.25 and "1.5"', M.qeq(M.qparse('3/4'), [3, 4]) && M.qeq(M.qparse(-2), [-2, 1]) && M.qeq(M.qparse(0.25), [1, 4]) && M.qeq(M.qparse('1.5'), [3, 2]));
check('qtex writes fractions as \\tfrac', M.qtex(M.Q(-1, 2)) === '-\\tfrac{1}{2}' && M.qtex(M.Q(3)) === '3');
check('qtext writes −1/2', M.qtext(M.Q(-1, 2)) === '−1/2');
check('zero has denominator 1', M.qeq(M.qsub(M.Q(1, 3), M.Q(2, 6)), M.ZERO));
let threw = false; try { M.qparse(Math.PI); } catch { threw = true; }
check('π is not read as a simple fraction', threw);

// Strang's elimination example: pivots 2, 1, 4 and the solution (−1, 2, 2)
{
  const A = qm([[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]]);
  const r = M.reduce(A, { nvar: 3, mode: 'ref' });
  check('three elimination steps', r.steps.length === 4, `${r.steps.length - 1} steps`);
  check('the steps are R₂ − 2R₁, R₃ + R₁, R₃ − R₂', r.steps.slice(1).map((s) => M.opText(s.op)).join('; ') === 'R2 ← R2 − 2·R1; R3 ← R3 + R1; R3 ← R3 − R2', r.steps.slice(1).map((s) => M.opText(s.op)).join('; '));
  check('the echelon form is right', same(r.steps[3].M, qm([[2, 4, -2, 2], [0, 1, 1, 4], [0, 0, 4, 8]])), show(r.steps[3].M));
  check('op TeX', M.opTeX(r.steps[1].op) === 'R_{2} \\leftarrow R_{2} - 2R_{1}' && M.opTeX(r.steps[2].op) === 'R_{3} \\leftarrow R_{3} + R_{1}');
  const g = M.reduce(A, { nvar: 3, mode: 'rref' }), R = g.steps[g.steps.length - 1].M;
  check('Gauss–Jordan reaches [I | (−1, 2, 2)]', same(R, qm([[1, 0, 0, -1], [0, 1, 0, 2], [0, 0, 1, 2]])), show(R));
  const s = M.solutionSet(A, 3);
  check('one solution, rank 3', s.consistent && s.rank === 3 && s.freeCols.length === 0 && s.particular.map(M.qval).join() === '-1,2,2');
}
// a zero pivot forces a swap (but not in LU, which reports it)
{
  const A = qm([[0, 1, 1], [1, 1, 2]]);
  const r = M.reduce(A, { nvar: 2 });
  check('a zero pivot is swapped away', r.steps[1].op.kind === 'swap' && r.steps.length === 2);
  check('LU stops at the zero pivot', M.reduce(qm([[0, 1], [1, 1]]), { mode: 'lu' }).stuck?.row === 0);
}
// LU: Strang's A = [[2,1,1],[4,−6,0],[−2,7,2]]
{
  const A = qm([[2, 1, 1], [4, -6, 0], [-2, 7, 2]]);
  const r = M.reduce(A, { mode: 'lu' });
  const U = r.steps[r.steps.length - 1].M, L = r.L;
  check('L holds the multipliers 2, −1, −1', same(L, qm([[1, 0, 0], [2, 1, 0], [-1, -1, 1]])), show(L));
  check('U is the echelon form', same(U, qm([[2, 1, 1], [0, -8, -2], [0, 0, 1]])), show(U));
  check('L U = A', same(M.qmatmul(L, U), A));
  check('L fills as elimination goes', r.steps[1].L[1][0] && M.qeq(r.steps[1].L[1][0], M.Q(2)) && r.steps[1].L[2][1] === null);
}
// solution sets: a line of solutions, and none
{
  const A = qm([[1, 2, -1, 3], [2, 4, 1, 9], [3, 6, 0, 12]]);
  const s = M.solutionSet(A, 3);
  check('rank 2, one free variable (y)', s.consistent && s.rank === 2 && s.freeCols.join() === '1', JSON.stringify(s.freeCols));
  const Af = M.toNumbers(A), x = s.particular.map(M.qval), d = s.directions[0].map(M.qval);
  check('the particular solution solves it', Af.every((row) => near(row[0] * x[0] + row[1] * x[1] + row[2] * x[2], row[3])));
  check('the direction solves the homogeneous system', Af.every((row) => near(row[0] * d[0] + row[1] * d[1] + row[2] * d[2], 0)));
  const B = qm([[1, 1, 1, 1], [1, 1, 1, 2], [0, 1, 2, 0]]);
  check('parallel planes: no solution', !M.solutionSet(B, 3).consistent);
}
// random systems: RREF structure, solutions that check, LU that multiplies back
{
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  let bad = 0, badSol = 0, badLU = 0, tried = 0;
  for (let k = 0; k < 300; k++) {
    const m = ri(2, 4), n = ri(2, 4);
    const A = qm(Array.from({ length: m }, () => Array.from({ length: n + 1 }, () => (rnd() < 0.2 ? 0 : ri(-5, 5)))));
    if (k % 3 === 0 && m > 2) A[m - 1] = A[0].map((v, j) => M.qadd(v, A[1][j]));   // a dependent row, sometimes
    const R = M.rref(A, n);
    // every pivot is 1, alone in its column, and pivots step to the right
    let last = -1, ok = true;
    R.forEach((row) => {
      const c = row.slice(0, n).findIndex((v) => !M.qzero(v));
      if (c < 0) return;
      if (c <= last || !M.qeq(row[c], M.ONE) || R.some((r2) => r2 !== row && !M.qzero(r2[c]))) ok = false;
      last = c;
    });
    if (!ok) bad++;
    const s = M.solutionSet(A, n), Af = M.toNumbers(A);
    if (s.consistent) {
      const x = s.particular.map(M.qval);
      if (!Af.every((row) => near(row.slice(0, n).reduce((t, v, j) => t + v * x[j], 0), row[n]))) badSol++;
      for (const d of s.directions) if (!Af.every((row) => near(row.slice(0, n).reduce((t, v, j) => t + v * M.qval(d[j]), 0), 0))) badSol++;
    }
    // LU of square A whenever no zero pivot appears
    const S = qm(Array.from({ length: m }, () => Array.from({ length: m }, () => ri(-6, 6))));
    const lu = M.reduce(S, { mode: 'lu' });
    if (!lu.stuck) { tried++; if (!same(M.qmatmul(lu.L, lu.steps[lu.steps.length - 1].M), S)) badLU++; }
  }
  check('300 random RREFs have the right structure', bad === 0, `${bad} wrong`);
  check('their solution sets check out', badSol === 0, `${badSol} wrong`);
  check(`LU multiplies back to A (${tried} cases)`, badLU === 0 && tried > 100, `${badLU} wrong`);
}
// explicit operations replay
{
  const A = qm([[1, 2, 5], [3, 4, 6]]);
  const r = M.replay(A, [['add', 2, 1, -3], ['scale', 2, '-1/2']]);
  check('explicit operations replay in order', same(r.steps[2].M, qm([[1, 2, 5], [0, 1, 4.5]])), show(r.steps[2].M));
  check('scale TeX', M.opTeX(r.steps[2].op) === 'R_{2} \\leftarrow -\\tfrac{1}{2}R_{2}');
}

// 2×2 maps
{
  const A = [[2, 1], [1, 3]], Ai = M.inv2(A), P = M.mul2(A, Ai);
  check('A A⁻¹ = I', near(P[0][0], 1) && near(P[1][1], 1) && near(P[0][1] + 1, 1) && near(P[1][0] + 1, 1));
  check('a singular matrix has no inverse', M.inv2([[2, 4], [1, 2]]) === null);
  const R = [[0, -1], [1, 0]], S = [[1, 0], [0, -1]];
  const RS = M.compose2([S, R]), SR = M.compose2([R, S]);   // compose2 applies first to last
  check('rotate then reflect is S R = reflection in y = −x', RS.flat().join() === M.mul2(R, S).flat().join() && SR.flat().join() === M.mul2(S, R).flat().join() && M.mul2(S, R).flat().join() === '0,-1,-1,0');
  const e = M.eigen2(A);
  check('a symmetric matrix has two perpendicular invariant lines', e.length === 2 && near(e[0].dir[0] * e[1].dir[0] + e[0].dir[1] * e[1].dir[1] + 1, 1, 1e-9));
  check('their eigenvalues are (5 ± √5)/2', near(e[0].lambda, (5 + Math.sqrt(5)) / 2) && near(e[1].lambda, (5 - Math.sqrt(5)) / 2));
  check('a rotation has no real invariant line', M.eigen2(R).length === 0);
  check('a multiple of I fixes every line', M.eigen2([[3, 0], [0, 3]]) === 'all');
  const sh = M.eigen2([[1, 1], [0, 1]]);
  check('a shear keeps one line, the x-axis', sh.length === 1 && near(Math.abs(sh[0].dir[0]), 1));
  for (const { lambda, dir } of M.eigen2([[1, 2], [3, -4]])) {
    const Av = M.apply2([[1, 2], [3, -4]], dir);
    check(`A v = λ v for λ = ${lambda.toFixed(3)}`, near(Av[0], lambda * dir[0], 1e-9) && near(Av[1], lambda * dir[1], 1e-9));
  }
  check('the blend at t = 1 is A', M.blend2(A, 1).flat().join() === A.flat().join() && M.blend2(A, 0).flat().join() === '1,0,0,1');
}
// the plane of two vectors in Rⁿ keeps lengths and the angle
{
  const u = [1, 2, 0, 2, 4], v = [2, 1, 2, 4, 0];
  const p = M.planeOf(u, v);
  check('|u| = 5 along the first axis', near(p.u[0], 5) && p.u[1] === 0);
  check('|v| = 5 in the plane', near(Math.hypot(...p.v), 5));
  check('cos θ = 12/25', near(Math.cos(M.angleN(u, v)), 0.48) && near(p.v[0] / 5, 0.48));
  check('centring subtracts the mean', M.centred([1, 2, 3]).join() === '-1,0,1');
  check('the zero vector has no angle', Number.isNaN(M.angleN([0, 0], [1, 2])));
}

// the simulations' parameter checks
check('la-rowreduce accepts a 3×3 system', validateRR({ M: [[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]] }).length === 0, validateRR({ M: [[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]] }).join('; '));
check('la-rowreduce rejects a ragged matrix', validateRR({ M: [[1, 2, 3], [1, 2]] }).length > 0);
check('la-rowreduce rejects an unreadable entry', validateRR({ M: [[1, 'x', 3], [1, 2, 3]] }).length > 0);
check('la-rowreduce rejects a step past the end', validateRR({ M: [[1, 2, 3], [2, 1, 3]], step: 9 }).length > 0);
check('la-rowreduce accepts explicit operations', validateRR({ M: [[1, 2, 3], [2, 1, 3]], ops: [['add', 2, 1, -2]] }).length === 0);
check('la-map2d accepts a slider expression', validateMap({ A: [['cos(th)', '-sin(th)'], ['sin(th)', 'cos(th)']], sliders: [{ key: 'th', label: 'θ', min: 0, max: 6.3, value: 1 }] }).length === 0);
check('la-map2d rejects an unknown name', validateMap({ A: [['cos(q)', 0], [0, 1]] }).length > 0);
check('la-map2d rejects a 3×2 matrix', validateMap({ A: [[1, 0], [0, 1], [1, 1]] }).length > 0);
check('la-map2d accepts a composition', validateMap({ maps: [{ name: 'R', A: [[0, -1], [1, 0]] }, { name: 'S', A: [[1, 0], [0, -1]] }] }).length === 0);
check('la-vectors accepts two vectors', validateVec({ vectors: [{ name: 'u', values: [1, 2, 3] }, { name: 'v', values: [3, 2, 1] }] }).length === 0);
check('la-vectors rejects vectors of different lengths', validateVec({ vectors: [{ name: 'u', values: [1, 2, 3] }, { name: 'v', values: [3, 2] }] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
