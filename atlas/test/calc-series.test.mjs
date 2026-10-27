// The sequence-and-series model behind sims/calc-series.js, checked against
// closed forms and the classical theorems it is used to illustrate.
//   node atlas/test/calc-series.test.mjs

import { terms, partialSums, settleIndex, ratios, roots, cobweb, integralRects } from '../src/viz/model/calc-series.js';
import { simpson } from '../src/viz/model/numeric.js';
import { validate, VIEWS } from '../src/viz/sims/calc-series.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// geometric series: S_n = a(1 − rⁿ)/(1 − r), summed from n = 0
for (const [a, r] of [[1, 0.5], [3, -0.6], [2, 0.9]]) {
  const S = partialSums(terms({ term: (n) => a * r ** n, n0: 0 }, 40));
  const ok = S.every((p) => near(p.s, (a * (1 - r ** (p.n + 1))) / (1 - r), 1e-12));
  check(`geometric partial sums a = ${a}, r = ${r}`, ok);
}

// harmonic series: S_n − ln n → γ, and S_n grows past any bound (slowly)
{
  const S = partialSums(terms({ term: (n) => 1 / n }, 10000));
  check('harmonic: S_10000 − ln 10000 ≈ γ + 1/(2n)', near(S[9999].s - Math.log(10000), 0.5772156649 + 1 / 20000, 1e-6), String(S[9999].s - Math.log(10000)));
  check('harmonic: S_10000 ≈ 9.7876', near(S[9999].s, 9.787606, 1e-5));
}

// alternating harmonic: the sum ln 2 always lies between S_N and S_{N+1},
// so |ln 2 − S_N| ≤ 1/(N+1), and the error changes sign at every step
{
  const S = partialSums(terms({ term: (n) => (-1) ** (n + 1) / n }, 401));
  let bounded = true, alternates = true;
  for (let i = 0; i < 400; i++) {
    const e = Math.log(2) - S[i].s;
    if (!(Math.abs(e) <= 1 / (S[i].n + 1))) bounded = false;
    if (Math.sign(e) === Math.sign(Math.log(2) - S[i + 1].s)) alternates = false;
    const lo = Math.min(S[i].s, S[i + 1].s), hi = Math.max(S[i].s, S[i + 1].s);
    if (!(lo <= Math.log(2) && Math.log(2) <= hi)) bounded = false;
  }
  check('alternating series bound |S − S_N| ≤ a_{N+1} (N ≤ 400)', bounded);
  check('alternating series error changes sign every step', alternates);
}

// p-series and the integral test: ∫_1^{N+1} x^{−p} dx ≤ S_N ≤ 1 + ∫_1^N x^{−p} dx
for (const p of [0.5, 1, 2, 3]) {
  const N = 60;
  const ts = terms({ term: (n) => n ** -p }, N);
  const SN = partialSums(ts)[N - 1].s;
  const f = (x) => x ** -p;
  const lo = simpson(f, 1, N + 1, 2000), hi = 1 + simpson(f, 1, N, 2000);
  check(`integral-test sandwich p = ${p}`, lo <= SN && SN <= hi, `${lo} ≤ ${SN} ≤ ${hi}`);
  const { upper, lower } = integralRects(ts);
  check(`upper rectangles add to S_N (p = ${p})`, near(upper.reduce((s, r) => s + r.h * (r.x1 - r.x0), 0), SN, 1e-12));
  check(`lower rectangles add to S_N − a_1 (p = ${p})`, near(lower.reduce((s, r) => s + r.h * (r.x1 - r.x0), 0), SN - 1, 1e-12));
}
{
  const S = partialSums(terms({ term: (n) => 1 / (n * n) }, 20000));
  check('Basel: Σ 1/n² → π²/6 (tail ≈ 1/N)', near(S[19999].s, Math.PI ** 2 / 6 - 1 / 20000, 2e-8), String(S[19999].s));
}

// telescoping: Σ 1/(n(n+1)) = 1 − 1/(N+1)
{
  const S = partialSums(terms({ term: (n) => 1 / (n * (n + 1)) }, 50));
  check('telescoping partial sums', S.every((p) => near(p.s, 1 - 1 / (p.n + 1), 1e-12)));
}

// ε-band index: 1/n < 0.1 from n = 11 on; (−1)ⁿ never settles near 0
{
  const ts = terms({ term: (n) => 1 / n }, 100);
  check('settleIndex 1/n, ε = 0.1', settleIndex(ts, 0, 0.1) === 11, String(settleIndex(ts, 0, 0.1)));
  check('settleIndex never for (−1)ⁿ', settleIndex(terms({ term: (n) => (-1) ** n }, 50), 0, 0.5) === null);
}

// recursion a_{n+1} = √(2 + a_n) from 0: increasing, bounded by 2, converging to 2
{
  const ts = terms({ rec: (a) => Math.sqrt(2 + a), a1: 0 }, 30);
  const early = ts.slice(0, 15);                      // before rounding makes a_n exactly 2
  check('recursion is increasing', early.every((p, i) => i === 0 || p.a > early[i - 1].a));
  check('recursion bounded by 2', ts.every((p) => p.a <= 2) && early.every((p) => p.a < 2));
  check('recursion → 2', near(ts[29].a, 2, 1e-12));
  const web = cobweb(ts.slice(0, 5));
  check('cobweb path has 1 + 2(N − 1) corners and ends on y = x', web.length === 9 && web[8][0] === web[8][1]);
}

// ratio and root sequences
{
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  const R = ratios(terms({ term: (n) => 1 / fact(n) }, 20));
  check('ratio of 1/n! is 1/(n+1)', R.every((p) => near(p.r, 1 / (p.n + 1), 1e-12)));
  const Q = roots(terms({ term: (n) => (n / (2 * n + 1)) ** n }, 200));
  check('root of (n/(2n+1))ⁿ → 1/2', near(Q[199].r, 0.5, 2e-3), String(Q[199].r));
}

// the simulation's parameter checks
check('views are listed', VIEWS.includes('sums') && VIEWS.includes('cobweb'));
check('validate accepts a good spec', validate({ view: 'sums', term: '(-1)^(n+1)/n^p', limit: 'ln(2)', bound: 'alt', N: { min: 1, max: 40, value: 8 }, sliders: [{ key: 'p', label: 'p', min: 0.5, max: 3, value: 1 }] }).length === 0);
check('validate rejects a bad expression', validate({ term: '1/(n^', N: 5 }).length > 0);
check('validate rejects a cobweb without a recursion', validate({ view: 'cobweb', term: '1/n', N: 5 }).length > 0);
check('validate rejects an eps that is not a slider', validate({ view: 'terms', term: '1/n', eps: 'e', N: 5 }).length > 0);
check('validate checks a guide curve', validate({ term: '1/n', N: 5, guide: { fn: 'ln(n) + 0.5772' } }).length === 0 && validate({ term: '1/n', N: 5, guide: { fn: 'ln(m)' } }).length === 1);
check('validate checks presets', validate({ term: '1/n', N: 5, presets: [{ label: 'ok', term: '1/n^2' }, { label: 'bad', term: 'q/n' }] }).length === 1);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
