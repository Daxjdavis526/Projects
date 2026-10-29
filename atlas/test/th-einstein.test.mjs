// The counting model behind the th-einstein simulation and the PHYS 3700
// counting lessons: log-factorials against exact products, binomial
// coefficients against BigInt, Einstein-solid multiplicities against
// Schroeder's tables, the two-solid distribution against Vandermonde's
// identity and its symmetry, the microstate list against Ω, the random
// exchange against the exact distribution, and the sim's validator.
//   node atlas/test/th-einstein.test.mjs

import * as M from '../src/viz/model/th-einstein.js';
import { validate, defaults, bigTeX } from '../src/viz/sims/th-einstein.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ln n! exact for small n, Lanczos beyond
let lf = 0;
for (let n = 1; n <= 400; n++) { lf += Math.log(n); if (n % 37 === 0 || n > 395) check(`ln ${n}! by sum`, close(M.lnFact(n), lf, 1e-13), `${M.lnFact(n)} vs ${lf}`); }
check('ln Γ(½) = ½ ln π', close(M.lnGamma(0.5), 0.5 * Math.log(Math.PI), 1e-13));
check('ln 10^6 ! (Stirling series)', close(M.lnFact(1e6), 1e6 * Math.log(1e6) - 1e6 + 0.5 * Math.log(2 * Math.PI * 1e6) + 1 / 12e6, 1e-14));
// binomials
check('C(52, 5) = 2 598 960', M.choose(52, 5) === 2598960n);
check('C(100, 50) exactly', M.choose(100, 50) === 100891344545564193334812497256n);
check('ln C(100, 50)', close(M.lnChoose(100, 50), Math.log(1.00891344545564193e29), 1e-12));
check('C(n, k) outside is 0', M.choose(5, 7) === 0n && M.lnChoose(5, 7) === -Infinity);
// Einstein solid: Schroeder's small cases
check('Ω(N=3, q=3) = 10', M.omega(3, 3) === 10n);
check('Ω(N=3, q=4) = 15', M.omega(3, 4) === 15n);
check('Ω(N=1, q) = 1', M.omega(1, 7) === 1n);
check('Ω(N, 0) = 1', M.omega(9, 0) === 1n);
check('ln Ω matches BigInt for N=50, q=80', close(M.lnOmega(50, 80), Math.log(Number(M.omega(50, 80))), 1e-12));
// microstates
for (const [N, q] of [[3, 3], [4, 5], [2, 6], [1, 4], [5, 0]]) {
  const L = M.microstates(N, q);
  check(`microstates(${N}, ${q}) count = Ω`, BigInt(L.length) === M.omega(N, q));
  check(`microstates(${N}, ${q}) each sums to q`, L.every((s) => s.length === N && s.reduce((a, b) => a + b, 0) === q));
  check(`microstates(${N}, ${q}) all distinct`, new Set(L.map((s) => s.join(','))).size === L.length);
}
// two solids: Schroeder Table 2.2 (N_A = N_B = 3, q = 6) has Ω_total = 462 with q_A = 3 at 100
const T = M.pairDist(3, 3, 6);
check('pair 3,3,6: total 462', close(Math.exp(T.lnTotal), 462, 1e-12));
check('pair 3,3,6: q_A = 3 has 100', close(Math.exp(T.lnW[3]), 100, 1e-12));
check('pair 3,3,6: peak at 3', T.peak === 3);
check('pair 3,3,6: probabilities sum to 1', close(T.p.reduce((a, b) => a + b, 0), 1, 1e-12));
// Vandermonde: Σ Ω_A Ω_B = Ω(N_A + N_B, q)
for (const [a, b, q] of [[300, 200, 100], [10, 40, 25], [1000, 1000, 2000], [1, 1, 5]]) {
  const d = M.pairDist(a, b, q);
  check(`Vandermonde ${a},${b},${q}`, close(d.lnTotal, M.lnOmega(a + b, q), 1e-11), `${d.lnTotal} vs ${M.lnOmega(a + b, q)}`);
}
// Schroeder: N_A = 300, N_B = 200, q = 100 peaks at q_A = 60
check('Schroeder 300/200/100 peaks at 60', M.pairDist(300, 200, 100).peak === 60);
// equal solids: mean q/2, and the relative width falls like 1/√N
const w1 = M.pairDist(100, 100, 200), w2 = M.pairDist(10000, 10000, 20000);
check('equal solids: mean q/2', close(w1.mean, 100, 1e-9) && close(w2.mean, 10000, 1e-9));
const ratio = (w1.sd / 200) / (w2.sd / 20000);
check('width ∝ 1/√N (×100 in N → ÷10 in width)', Math.abs(ratio - 10) < 0.2, `ratio ${ratio}`);
// the random exchange visits macrostates in proportion to Ω_A Ω_B
const S = M.makePair(3, 3, 6, 'A', 7);
check('start all in A', S.qA === 6 && S.n.slice(0, 3).reduce((a, b) => a + b, 0) === 6);
M.exchange(S, 400000);
check('quanta conserved', S.n.reduce((a, b) => a + b, 0) === 6);
let worst = 0;
for (let a = 0; a <= 6; a++) worst = Math.max(worst, Math.abs(S.visits[a] / S.moves - T.p[a]));
check('exchange: long-run visits match the exact distribution', worst < 0.01, `worst ${worst}`);
const qAcheck = S.n.slice(0, 3).reduce((a, b) => a + b, 0);
check('q_A bookkeeping', qAcheck === S.qA);
// big-number TeX
check('bigTeX small', bigTeX(Math.log(462)) === '462');
check('bigTeX thousands', bigTeX(Math.log(12870)) === '12\\,870');
check('bigTeX huge', bigTeX(100 * Math.LN10 + Math.log(2.5)) === '2.50 \\times 10^{100}');
// validator
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('list mode validates', validate({ ...defaults, mode: 'list', N: 4, q: 5 }).length === 0);
check('bad N rejected', validate({ ...defaults, mode: 'list', N: 9 }).length > 0);
check('tie validates', validate({ ...defaults, tie: [10, 100, 1000], NA: 10, NB: 10, q: 20, x: 'fraction' }).length === 0);
check('unknown hide rejected', validate({ ...defaults, hide: ['nope'] }).length > 0);

console.log(`th-einstein: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
