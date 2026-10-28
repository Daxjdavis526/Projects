// The algebra behind the la-svd simulation (the 2×2 SVD as turn–stretch–turn,
// a one-sided Jacobi SVD, rank-k truncation and Eckart–Young, the synthetic
// pictures), checked headlessly.
//   node atlas/test/la-svd.test.mjs

import * as S from '../src/viz/model/la-svd.js';
import * as SIM from '../src/viz/sims/la-svd.js';

const validate = (p) => SIM.validate({ ...SIM.defaults, ...p });
let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const R = S.rng(11);
const rnd = () => R() * 8 - 4;
const maxAbsDiff = (A, B) => Math.max(...A.flatMap((row, i) => row.map((x, j) => Math.abs(x - B[i][j]))));
const matmul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
const T = (A) => A[0].map((_, j) => A.map((row) => row[j]));

// 2×2: A = U Σ Vᵀ, U and V orthogonal, V a rotation, σ₁ ≥ σ₂ ≥ 0, det U = sign det A
let ok = true, okOrder = true, okRot = true, okDet = true;
for (let k = 0; k < 500; k++) {
  const A = [[rnd(), rnd()], [rnd(), rnd()]];
  const { s, U, V, det } = S.svd2(A);
  const back = S.mul2(S.mul2(U, S.diag2(s)), S.T2(V));
  if (maxAbsDiff(back, A) > 1e-9) ok = false;
  if (!(s[0] >= s[1] - 1e-12 && s[1] >= 0)) okOrder = false;
  if (maxAbsDiff(S.mul2(S.T2(V), V), S.I2) > 1e-12 || maxAbsDiff(S.mul2(S.T2(U), U), S.I2) > 1e-9) okRot = false;
  if (!near(V[0][0] * V[1][1] - V[0][1] * V[1][0], 1)) okRot = false;
  const dU = U[0][0] * U[1][1] - U[0][1] * U[1][0];
  if (Math.abs(det) > 1e-9 && Math.sign(dU) !== Math.sign(det)) okDet = false;
}
check('2×2: U Σ Vᵀ reconstructs A (500 random matrices)', ok);
check('2×2: σ₁ ≥ σ₂ ≥ 0', okOrder);
check('2×2: U and V orthogonal, V a rotation', okRot);
check('2×2: U is a reflection exactly when det A < 0', okDet);
check('2×2: σ₁σ₂ = |det A| and σ₁² + σ₂² = ‖A‖²_F', (() => { const A = [[3, 0], [4, 5]], { s } = S.svd2(A); return near(s[0] * s[1], 15) && near(s[0] ** 2 + s[1] ** 2, 50) && near(s[0], 3 * Math.sqrt(5)) && near(s[1], Math.sqrt(5)); })());
check('2×2: a symmetric positive definite matrix has σ = its eigenvalues', (() => { const { s } = S.svd2([[2, 1], [1, 2]]); return near(s[0], 3) && near(s[1], 1); })());
check('2×2: a rotation has σ₁ = σ₂ = 1', (() => { const c = Math.cos(0.7), sn = Math.sin(0.7), { s } = S.svd2([[c, -sn], [sn, c]]); return near(s[0], 1) && near(s[1], 1); })());
check('2×2: a singular matrix has σ₂ = 0 and still factors', (() => { const A = [[1, 2], [2, 4]], { s, U, V } = S.svd2(A); return near(s[1], 0) && near(s[0], 5) && maxAbsDiff(S.mul2(S.mul2(U, S.diag2(s)), S.T2(V)), A) < 1e-9; })());
check('2×2: the stages end at A and pass through an axis-aligned ellipse', (() => {
  const A = [[1, 2], [-1, 3]], st = S.stages2(A);
  const SVt = st.maps[2], v1 = [st.V[0][0], st.V[1][0]], w = S.apply2(SVt, v1);
  return maxAbsDiff(st.maps[3], A) < 1e-9 && near(w[0], st.s[0]) && Math.abs(w[1]) < 1e-9;
})());
check('2×2: rank-1 part has rank 1 and ‖A − A₁‖ = σ₂', (() => {
  const A = [[2, 1], [0, 3]], A1 = S.rank1of2(A), { s } = S.svd2(A), D = [[A[0][0] - A1[0][0], A[0][1] - A1[0][1]], [A[1][0] - A1[1][0], A[1][1] - A1[1][1]]];
  return Math.abs(A1[0][0] * A1[1][1] - A1[0][1] * A1[1][0]) < 1e-9 && near(S.svd2(D).s[0], s[1]);
})());

// general m×n: Jacobi SVD against reconstruction and orthogonality
for (const [m, n] of [[6, 4], [4, 7], [12, 12], [30, 20]]) {
  const A = Array.from({ length: m }, () => Array.from({ length: n }, rnd));
  const d = S.svd(A), p = Math.min(m, n);
  const back = S.rankK(d, p);
  check(`${m}×${n}: Σ σⱼuⱼvⱼᵀ reconstructs A`, maxAbsDiff(back, A) < 1e-9, String(maxAbsDiff(back, A)));
  const Um = T(d.U), Vm = T(d.V);   // columns as matrices
  const I = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => (i === j ? 1 : 0)));
  check(`${m}×${n}: UᵀU = I and VᵀV = I`, maxAbsDiff(matmul(T(Um), Um), I) < 1e-9 && maxAbsDiff(matmul(T(Vm), Vm), I) < 1e-9);
  check(`${m}×${n}: singular values descend`, d.s.every((x, i) => i === 0 || x <= d.s[i - 1] + 1e-12));
  check(`${m}×${n}: Σσ² = ‖A‖²_F`, near(d.s.reduce((t, x) => t + x * x, 0), S.frob(A) ** 2, 1e-9));
}

// Eckart–Young: the error of the rank-k truncation
{
  const A = Array.from({ length: 10 }, () => Array.from({ length: 8 }, rnd));
  const d = S.svd(A);
  let okF = true, okS = true;
  for (let k = 1; k < 8; k++) {
    const Ak = S.rankK(d, k), D = A.map((row, i) => row.map((x, j) => x - Ak[i][j]));
    const e = S.truncationError(d.s, k);
    if (!near(S.frob(D), e.frob, 1e-8)) okF = false;
    if (!near(S.svd(D).s[0], e.spectral, 1e-8) || !near(e.spectral, d.s[k])) okS = false;
  }
  check('Eckart–Young: ‖A − A_k‖_F = √(σ²ₖ₊₁ + …)', okF);
  check('Eckart–Young: the largest stretch of A − A_k is σₖ₊₁', okS);
  check('rank-k truncation of rank k: storage k(m + n + 1)', S.storage(48, 64, 5).kept === 565 && S.storage(48, 64, 5).full === 3072);
}

// the synthetic pictures
for (const name of S.IMAGES) {
  const A = S.image(name);
  check(`${name}: 48 × 64 with grey levels in [0, 1]`, A.length === 48 && A[0].length === 64 && A.flat().every((x) => x >= 0 && x <= 1));
}
check('checkerboard has rank 2', S.numRank(S.svd(S.image('checker')).s, 1e-10) === 2);
check('blocks has rank at most 4 (three rectangles on a background)', S.numRank(S.svd(S.image('blocks')).s, 1e-10) <= 4);
check('noise is full rank', S.numRank(S.svd(S.image('noise')).s, 1e-10) === 48);
check('satellite: a few terms carry most of it (rank 6 within 15%)', S.truncationError(S.svd(S.image('satellite')).s, 6).rel < 0.15, String(S.truncationError(S.svd(S.image('satellite')).s, 6).rel));
check('disc needs more terms than blocks for the same error', S.truncationError(S.svd(S.image('disc')).s, 3).rel > S.truncationError(S.svd(S.image('blocks')).s, 3).rel);
check('the same seed gives the same noise', JSON.stringify(S.image('satellite', { noise: 0.1 })) === JSON.stringify(S.image('satellite', { noise: 0.1 })));

// validate()
check('validate: the defaults pass', validate({}).length === 0, validate({}).join('; '));
check('validate: a slider-driven map passes', validate({ A: [['a', 1], [0, 2]], sliders: [{ key: 'a', label: 'a', min: 0, max: 3, step: 0.5, value: 1 }], x: 'th', constants: { th: 30 } }).length === 0);
check('validate: a bad expression is caught', validate({ A: [['zz', 1], [0, 2]] }).length > 0);
check('validate: a bad stage is caught', validate({ stage: 4 }).length > 0);
check('validate: image mode passes', validate({ mode: 'image', image: 'disc', k: 3 }).length === 0);
check('validate: an unknown picture is caught', validate({ mode: 'image', image: 'cat' }).length > 0);
check('validate: k out of range is caught', validate({ mode: 'image', k: 0 }).length > 0 && validate({ mode: 'image', size: [16, 16], k: 20 }).length > 0);

console.log(`la-svd: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
