// The four fundamental subspaces behind the la-subspaces simulation, checked
// headlessly: exact bases, the dimension counts, the perpendicularity of the
// pairs, the split x = x_r + x_n, and the sim's parameter checks.
//   node atlas/test/la-subspaces.test.mjs

import * as S from '../src/viz/model/la-subspaces.js';
import * as Q from '../src/viz/model/la-linear.js';
import * as SIM from '../src/viz/sims/la-subspaces.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const validate = (p) => SIM.validate({ ...SIM.defaults, ...p });
const zero = (v) => v.every(Q.qzero);
const qdot = (u, v) => u.reduce((s, a, k) => Q.qadd(s, Q.qmul(a, v[k])), Q.ZERO);
const T = (M) => M[0].map((_, j) => M.map((row) => row[j]));
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// a 3×4 matrix of rank 2 (row 3 = row 1 + row 2)
const A = [[1, 0, 2, 1], [0, 1, -1, 1], [1, 1, 1, 2]];
const s = S.fourSubspaces(A);
check('rank 2, shape 3×4', s.rank === 2 && s.m === 3 && s.n === 4);
check('pivot columns 1 and 2', s.pivotCols.join() === '0,1');
check('dimensions: r + (n − r) = n and r + (m − r) = m', s.col.length === 2 && s.row.length === 2 && s.null.length === 2 && s.left.length === 1);
const Aq = Q.qmatrix(A);
check('every null-space vector solves Ax = 0', s.null.every((v) => zero(S.qapply(Aq, v))));
check('the left null vector solves Aᵀy = 0', s.left.every((y) => zero(S.qapply(Q.qmatrix(T(A)), y))));
check('the left null vector is (1, 1, −1) up to scale', (() => { const y = s.left[0].map(Q.qval); return near(y[0] / y[2], -1) && near(y[1] / y[2], -1); })());
check('the column-space basis is the pivot columns of A itself', s.col[0].map(Q.qval).join() === '1,0,1' && s.col[1].map(Q.qval).join() === '0,1,1');
check('row space ⟂ null space', s.row.every((r) => s.null.every((v) => Q.qzero(qdot(r, v)))));
check('column space ⟂ left null space', s.col.every((c) => s.left.every((y) => Q.qzero(qdot(c, y)))));

// pivot columns of A, not of its RREF: here row operations change the columns
const B = [[1, 2], [2, 4], [3, 6]];
const sb = S.fourSubspaces(B);
check('a rank-1 3×2 matrix: C(A) is the line through (1, 2, 3)', sb.rank === 1 && sb.col[0].map(Q.qval).join() === '1,2,3');
check('… its null space is spanned by (−2, 1)', sb.null.length === 1 && sb.null[0].map(Q.qval).join() === '-2,1');
check('… and its left null space is a plane', sb.left.length === 2);

// full rank and the zero matrix
const I = S.fourSubspaces([[2, 0], [0, 3]]);
check('an invertible matrix: both null spaces are {0}', I.rank === 2 && !I.null.length && !I.left.length);
const Z = S.fourSubspaces([[0, 0, 0], [0, 0, 0]]);
check('the zero matrix: rank 0, N(A) = ℝ³, N(Aᵀ) = ℝ²', Z.rank === 0 && Z.null.length === 3 && Z.left.length === 2 && !Z.col.length);
check('fractions stay exact', (() => { const f = S.fourSubspaces([[2, 1, 0], [4, 2, 1]]); return f.null.length === 1 && Q.qeq(f.null[0][0], Q.Q(-1, 2)); })());

// a truss: the compatibility matrix of a square frame without its brace has one mechanism
const C = [[0, 0, 0, 1], [0, 1, 0, 0], [1, 0, -1, 0]];
const sc = S.fourSubspaces(C);
check('unbraced frame: one mechanism, the sway (1, 0, 1, 0)', sc.null.length === 1 && sc.null[0].map(Q.qval).join() === '1,0,1,0');
check('braced frame: no mechanism', S.fourSubspaces([...C, [1, 1, 0, 0]]).null.length === 0);

// the split x = x_r + x_n
const sp = S.split(A, [3, 1, 2, 0]);
check('x_r + x_n = x', sp.xr.every((v, k) => near(v + sp.xn[k], [3, 1, 2, 0][k])));
check('A x_n = 0', A.every((row) => near(Q.dotN(row, sp.xn), 0)));
check('x_r is a combination of the rows (perpendicular to the null space)', S.numbers(s.null).every((v) => near(Q.dotN(v, sp.xr), 0)));
check('Ax is unchanged by dropping x_n', A.every((row, i) => near(Q.dotN(row, sp.xr), sp.Ax[i])));
check('orthonormal() drops dependent vectors', S.orthonormal([[1, 0, 0], [2, 0, 0], [0, 1, 1]]).length === 2);
check('basisTeX writes {0} for the zero subspace', S.basisTeX([]) === '\\{\\mathbf 0\\}');
check('basisTeX writes fractions', S.basisTeX([[Q.Q(-1, 2), Q.Q(1)]]).includes('\\tfrac{1}{2}'));
check('dims() counts', JSON.stringify(S.dims(5, 7, 3)) === JSON.stringify({ col: 3, row: 3, null: 4, left: 2 }));

// the sim's parameter checks
check('a plain matrix validates', validate({ A }).length === 0);
check('slider entries validate', validate({ A: [[1, 'k'], [2, 4]], sliders: [{ key: 'k', label: '$k$', min: -3, max: 3, step: 1, value: 2 }] }).length === 0);
check('an unknown name in an entry is caught', validate({ A: [[1, 'q'], [2, 4]] }).length > 0);
check('a ragged matrix is caught', validate({ A: [[1, 2], [3]] }).length > 0);
check('the shape alone validates', validate({ m: 5, n: 7, r: 3, hide: ['null'] }).length === 0);
check('a rank bigger than the shape is caught', validate({ m: 2, n: 5, r: 3 }).length > 0);
check('a bad hide key is caught', validate({ m: 2, n: 3, r: 1, hide: ['kernel'] }).length > 0);
check('TeX in a name is caught', validate({ A, names: { null: '$N(A)$' } }).length > 0);
check('x must match the columns', validate({ A, x: [1, 2] }).length > 0 && validate({ A, x: [1, 2, 3, 4] }).length === 0);

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
