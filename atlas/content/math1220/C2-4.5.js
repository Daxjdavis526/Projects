// The integral test, p-series, and the integral bounds on the remainder.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';

const t = String.raw;
const G = 6.674e-11;   // CODATA 2018 gravitational constant, m^3 kg^-1 s^-2 (6.67430e-11)
const pSum = (p, N) => { let s = 0; for (let n = 1; n <= N; n++) s += n ** -p; return s; };

export default lesson({
  id: 'math1220.C2-4.5',
  title: 'The integral test and p-series',
  minutes: 12, difficulty: 3,
  intro: t`A series of positive, decreasing terms $a_n = f(n)$ can be compared with the area under the curve $y = f(x)$. Rectangles of width 1 and height $a_n$ sit just above the curve on one side and just below it on the other, so the sum and the integral are trapped together:

$$\sum_{n=1}^{\infty} f(n) \text{ converges} \iff \int_1^{\infty} f(x)\,dx \text{ converges}$$

($f$ positive, continuous and decreasing). Applied to $f(x) = 1/x^p$ it settles the **p-series** for good: $\sum \frac{1}{n^p}$ converges exactly when $p > 1$. The same rectangles bound what is left after $N$ terms, which tells you how many terms an accurate sum needs.`,
  symbols: [
    { tex: t`f(x)`, text: 'a positive, continuous, **decreasing** function on $[1, \\infty)$ with $f(n) = a_n$ — the terms, joined into a curve' },
    { tex: t`\int_1^{\infty} f(x)\,dx`, text: 'the improper integral: the limit of $\\int_1^b f\\,dx$ as $b \\to \\infty$' },
    { tex: t`p`, text: 'the power in a p-series $\\sum 1/n^p$; the dividing line is $p = 1$ (the harmonic series, which diverges)' },
    { tex: t`R_N = S - S_N`, text: 'the **remainder** after $N$ terms, with $\\int_{N+1}^{\\infty} f\\,dx \\le R_N \\le \\int_N^{\\infty} f\\,dx$' },
  ],
  why: t`p-series are the benchmarks for every comparison test that follows, and the remainder bounds say how many terms a numerical sum needs — a question every simulation has to answer.`,
  visual: {
    type: 'calc-series',
    title: 'Rectangles above and below the curve',
    lead: t`The blue curve is $f(x) = 1/x^p$. Orange rectangles have heights $a_1, a_2, \dots, a_N$ on $[n, n + 1]$, so their total area is $S_N$ and they lie **above** the curve. Green ones are shifted left onto $[n - 1, n]$ and lie **below** it.`,
    tasks: [
      'At p = 1 the area under 1/x out to N + 1 is ln(N + 1), which grows without bound — and the orange rectangles hold even more area, so S_N does too.',
      'Set p = 2 and choose “Below”: the green rectangles (area S_N − 1) fit under a curve of finite total area 1, so S_N stays below 2 forever.',
      'Slide p across 1 and watch the readout for the area to infinity jump between finite and ∞.',
    ],
    params: {
      view: 'integral', term: '1/n^p', integralInf: '1/max(p - 1, 0)', y: [0, 1.15], rects: 'upper',
      N: { min: 1, max: 30, value: 8, label: 'Terms $N$' },
      sliders: [{ key: 'p', label: 'Power $p$', min: 0.5, max: 3, step: 0.05, value: 1, explain: 'The series is $\\sum 1/n^p$; the curve is $1/x^p$.' }],
    },
    caption: t`The rectangles are exact: each has width 1 and height $f(n)$. The integrals in the readout are computed numerically, except the area to infinity, $\int_1^\infty x^{-p}\,dx = \frac{1}{p - 1}$ for $p > 1$ (and $\infty$ otherwise). The test needs $f$ decreasing; for wiggly terms the rectangles no longer stay on one side of the curve.`,
  },
  example: {
    prompt: t`Show that $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2}$ converges, and use $S_{10}$ with the integral bounds to trap its sum.`,
    visual: { type: 'calc-series', params: { view: 'integral', term: '1/n^2', integralInf: 1, N: 10, y: [0, 1.15], rects: 'both' }, caption: 'Both sets of rectangles for 1/x² with N = 10.' },
    steps: [
      { label: 'Check the hypotheses', text: t`$f(x) = 1/x^2$ is positive, continuous and decreasing on $[1, \infty)$, and $f(n) = 1/n^2$.` },
      { label: 'The integral', text: t`$\displaystyle\int_1^\infty \frac{dx}{x^2} = \lim_{b\to\infty}\left[-\frac1x\right]_1^b = 1$: finite, so the series converges (a p-series with $p = 2 > 1$).` },
      { label: 'Ten terms', text: t`$S_{10} = 1 + \tfrac14 + \tfrac19 + \cdots + \tfrac{1}{100} \approx ${fmt(pSum(2, 10), 7)}$.` },
      { label: 'Bound the remainder', text: t`$\displaystyle\int_{11}^\infty \frac{dx}{x^2} = \frac{1}{11} \le R_{10} \le \int_{10}^\infty \frac{dx}{x^2} = \frac{1}{10}$.` },
      { label: 'Trap the sum', text: t`$${fmt(pSum(2, 10), 7)} + \tfrac1{11} \le S \le ${fmt(pSum(2, 10), 7)} + \tfrac1{10}$, that is $\;${fmt(pSum(2, 10) + 1 / 11, 5)} \le S \le ${fmt(pSum(2, 10) + 0.1, 5)}$.` },
      { label: 'Compare', text: t`Euler showed in 1734 that the exact sum is $\frac{\pi^2}{6} \approx ${fmt(Math.PI ** 2 / 6, 6)}$ — inside the bracket. Note the integral (1) is **not** the sum; it only bounds it.` },
    ],
    answer: t`The series converges, and $${fmt(pSum(2, 10) + 1 / 11, 5)} \le \sum \frac{1}{n^2} \le ${fmt(pSum(2, 10) + 0.1, 5)}$ (the exact value is $\pi^2/6$).`,
  },
  practice: [
    mcq({
      id: 'p-verdict', difficulty: 1,
      prompt: 'Which of these series converges?',
      choices: [t`$\displaystyle\sum_{n=1}^\infty \frac{1}{n^{1.01}}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{1}{\sqrt n}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{1}{n}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{1}{n^{0.999}}$`],
      answer: 0,
      why: {
        1: t`$\frac{1}{\sqrt n} = \frac{1}{n^{1/2}}$: a p-series with $p = \frac12 \le 1$, so it diverges.`,
        2: 'The harmonic series, p = 1: it diverges (slowly).',
        3: t`$p = 0.999 < 1$: it diverges — even more slowly than the harmonic series, but it does.`,
      },
      hints: ['Each is a p-series. Read off p.', 'Converges exactly when p > 1 — even by a hair.'],
      teach: 'A p-series Σ 1/nᵖ converges if and only if p > 1; the boundary case p = 1 diverges.',
      explain: t`$p = 1.01 > 1$, so it converges (its integral $\int_1^\infty x^{-1.01}dx = 100$ is finite). The others have $p \le 1$ and diverge.`,
      visual: { type: 'calc-series', params: { view: 'integral', term: '1/n^p', integralInf: '1/max(p - 1, 0)', y: [0, 1.15], N: { min: 1, max: 30, value: 10 }, sliders: [{ key: 'p', label: 'Power $p$', min: 0.5, max: 2, step: 0.01, value: 1, explain: 'Try each value of p from the choices.' }] }, caption: 'Set p to each choice and read the area to infinity.' },
    }),
    multi({
      id: 'hypotheses', difficulty: 2,
      prompt: t`For which series can the integral test be applied directly (the terms come from a positive, continuous, decreasing $f$)? Select all.`,
      choices: [t`$\displaystyle\sum_{n=1}^\infty \frac{1}{n^2 + 1}$`, t`$\displaystyle\sum_{n=1}^\infty n\,e^{-n^2}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{\sin^2 n}{n^2}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{n}$`, t`$\displaystyle\sum_{n=2}^\infty \frac{1}{n\ln n}$`],
      answer: [0, 1, 4],
      why: {
        2: t`$\frac{\sin^2 x}{x^2}$ is never negative, but it is not decreasing — it wiggles down, touching 0 wherever $\sin x = 0$. Use a comparison with $\frac{1}{n^2}$ instead.`,
        3: 'The terms are not positive. The integral test is for positive terms only.',
      },
      hints: [t`Check each hypothesis: positive? decreasing for large $x$?`, t`$\frac{d}{dx}\left(xe^{-x^2}\right) = e^{-x^2}(1 - 2x^2) < 0$ for $x \ge 1$.`],
      teach: 'The integral test needs a positive, continuous function that is decreasing (at least eventually).',
      explain: t`$\frac{1}{x^2+1}$, $xe^{-x^2}$ (for $x \ge 1$) and $\frac{1}{x\ln x}$ (for $x \ge 2$) are positive, continuous and decreasing. $\frac{\sin^2x}{x^2}$ is not decreasing, and $\frac{(-1)^n}{n}$ is not positive.`,
    }),
    num({
      id: 'improper', difficulty: 2,
      gen(r) {
        const F = r.pick([
          { s: t`\int_1^\infty \frac{dx}{x^{3}}`, v: 0.5, ser: t`\sum \frac{1}{n^3}`, how: t`\left[-\frac{1}{2x^2}\right]_1^\infty = \frac12` },
          { s: t`\int_1^\infty x\,e^{-x^2}\,dx`, v: Math.exp(-1) / 2, ser: t`\sum n e^{-n^2}`, how: t`\left[-\tfrac12 e^{-x^2}\right]_1^\infty = \tfrac{1}{2e}` },
          { s: t`\int_2^\infty \frac{dx}{x(\ln x)^2}`, v: 1 / Math.log(2), ser: t`\sum_{n\ge2} \frac{1}{n(\ln n)^2}`, how: t`\left[-\frac{1}{\ln x}\right]_2^\infty = \frac{1}{\ln 2}` },
          { s: t`\int_1^\infty \frac{dx}{1 + x^2}`, v: Math.PI / 4, ser: t`\sum \frac{1}{1 + n^2}`, how: t`\left[\arctan x\right]_1^\infty = \frac{\pi}{2} - \frac{\pi}{4}` },
        ]);
        return {
          prompt: t`To test $${F.ser}$ with the integral test, evaluate $\displaystyle${F.s}$. Give a decimal.`,
          answer: F.v, tol: { rel: 0.002 },
          hints: ['Find an antiderivative, evaluate at the lower limit and take the limit at infinity.', t`$${F.how}$.`],
          teach: 'An improper integral is the limit of ordinary integrals; when it is finite, the integral test says the matching series converges too.',
          explain: t`$${F.how} \approx ${fmt(F.v, 4)}$. Finite, so $${F.ser}$ converges — though its sum is not this number.`,
        };
      },
    }),
    num({
      id: 'remainder', difficulty: 3,
      gen(r) {
        const p = r.pick([2, 3, 4]), N = r.pick([5, 10, 20]);
        const up = N ** (1 - p) / (p - 1), lo = (N + 1) ** (1 - p) / (p - 1);
        return {
          prompt: t`You add the first ${N} terms of $\displaystyle\sum_{n=1}^\infty \frac{1}{n^{${p}}}$. Use the integral test to give an **upper bound** for the remainder $R_{${N}} = S - S_{${N}}$.`,
          answer: up, tol: { rel: 0.005 },
          errors: [{ value: lo, feedback: t`$\int_{${N + 1}}^\infty$ is the **lower** bound. For the upper bound, start the integral at $N = ${N}$.` }, { value: 1 / N ** p, feedback: 'That is only the size of the last term added. The remainder is the whole tail after it.' }, { value: 1 / (N + 1) ** p, feedback: 'That is just the first term of the tail — the remainder adds all the rest too.' }],
          hints: [t`$R_N \le \displaystyle\int_N^\infty \frac{dx}{x^{${p}}}$.`, t`$\displaystyle\int_N^\infty x^{-${p}}\,dx = \frac{N^{${1 - p}}}{${p - 1}}$.`],
          teach: 'The tail of a decreasing series is trapped between two integrals of the same function, starting at N + 1 and at N.',
          explain: t`$R_{${N}} \le \displaystyle\int_{${N}}^\infty x^{-${p}}\,dx = \frac{1}{${p - 1}\cdot ${N}^{${p - 1}}} = ${tex(up, 3)}$ (and $R_{${N}} \ge ${tex(lo, 3)}$). The true remainder is $${tex((p === 2 ? Math.PI ** 2 / 6 : p === 4 ? Math.PI ** 4 / 90 : 1.2020569031595942) - pSum(p, N), 3)}$.`,
        };
      },
    }),
    num({
      id: 'terms-needed', difficulty: 3,
      gen(r) {
        const [p, tol] = r.pick([[2, 0.003], [3, 0.001], [3, 0.0001], [4, 0.00001]]);
        let N = 1;
        while (!(N ** (1 - p) / (p - 1) < tol)) N++;
        const tolT = tol >= 0.001 ? String(tol) : tex(tol, 1);
        return {
          prompt: t`How many terms of $\displaystyle\sum_{n=1}^\infty \frac{1}{n^{${p}}}$ guarantee, by the integral bound $R_N \le \int_N^\infty x^{-${p}}\,dx$, that the remainder is less than $${tolT}$? Give the smallest such $N$.`,
          answer: N, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: N - 1, feedback: 'At that N the bound is still at least the tolerance. You need it strictly smaller.' }, { value: N + 1, feedback: 'One fewer term already works.' }],
          hints: [t`$\displaystyle\int_N^\infty x^{-${p}}\,dx = \frac{1}{${p - 1}N^{${p - 1}}}$.`, t`Solve $\dfrac{1}{${p - 1}N^{${p - 1}}} < ${tolT}$ for $N$, then take the next whole number.`],
          teach: 'The integral remainder bound turns an accuracy requirement into a number of terms.',
          explain: t`$\dfrac{1}{${p - 1}N^{${p - 1}}} < ${tolT} \iff N^{${p - 1}} > ${fmt(1 / ((p - 1) * tol), 5)} \iff N > ${fmt((1 / ((p - 1) * tol)) ** (1 / (p - 1)), 5)}$, so $N = ${N}$ terms.`,
        };
      },
    }),
    mcq({
      id: 'integral-is-not-sum', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “By the integral test, $\displaystyle\sum_{n=1}^\infty \frac{1}{n^2} = \int_1^\infty \frac{dx}{x^2} = 1$.” What is wrong?`,
      choices: [
        t`The test only says both converge; the sum is $\frac{\pi^2}{6} \approx 1.645$, and the integral merely bounds it: $1 \le S \le 2$`,
        'Nothing: the sum equals the integral',
        'The integral diverges, so the series diverges',
        t`The sum is $\frac12$, the integral of $x^{-2}$ from 1 to 2`,
      ],
      answer: 0,
      why: {
        1: t`The rectangles stick out above the curve: $S_N$ is always more than the area under it from 1 to $N + 1$. Already $S_2 = 1.25 > 1$.`,
        2: t`$\int_1^\infty x^{-2}dx = \left[-x^{-1}\right]_1^\infty = 1$: finite.`,
        3: 'Every term is positive and the first is 1, so the sum is more than 1.',
      },
      hints: ['Add the first two terms. Is the sum already past the integral?', 'What do the rectangles above the curve say?'],
      teach: 'The integral test decides convergence; it does not give the value of the sum.',
      explain: t`$1 + \frac14 = 1.25$ already exceeds 1. The integral test gives $\int_1^\infty f \le S \le f(1) + \int_1^\infty f$, here $1 \le S \le 2$; the exact sum $\frac{\pi^2}{6}$ needs other methods.`,
      visual: { type: 'calc-series', params: { view: 'integral', term: '1/n^2', integralInf: 1, N: 12, y: [0, 1.15], rects: 'upper' }, caption: 'The rectangles (total S_N) stick out above the area under the curve.' },
    }),
    mcq({
      id: 'n-log-n', difficulty: 2,
      prompt: t`Does $\displaystyle\sum_{n=2}^\infty \frac{1}{n\ln n}$ converge?`,
      choices: [
        t`No: $\int_2^\infty \frac{dx}{x\ln x} = \lim_{b\to\infty}\big[\ln(\ln x)\big]_2^b = \infty$`,
        t`Yes: its terms are smaller than $\frac1n$`,
        'Yes: its terms go to 0',
        t`No: its terms do not go to 0`,
      ],
      answer: 0,
      why: {
        1: t`Being smaller than a **divergent** series proves nothing — $\frac{1}{n^2}$ is smaller than $\frac1n$ too, and converges.`,
        2: 'Terms going to 0 never proves convergence.',
        3: t`$\frac{1}{n\ln n} \to 0$; the divergence test is silent here.`,
      },
      hints: [t`Try the substitution $u = \ln x$ in $\int \frac{dx}{x\ln x}$.`],
      teach: 'The integral test settles series that are just barely too big to converge, like 1/(n ln n).',
      explain: t`With $u = \ln x$, $\int \frac{dx}{x\ln x} = \ln|\ln x| + C$, which grows without bound. The series diverges — even more slowly than the harmonic series (about $\ln\ln N$).`,
      visual: { type: 'calc-series', params: { view: 'integral', term: '1/(n*ln(n))', n0: 2, N: 25, rects: 'upper', y: [0, 0.9] }, caption: t`The curve $\frac{1}{x\ln x}$ and the rectangles from $n = 2$.` },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-p', difficulty: 2,
      prompt: t`Does $\displaystyle\sum_{n=1}^\infty \frac{1}{n^2\sqrt n}$ converge?`,
      choices: [t`Yes: it is a p-series with $p = \frac52 > 1$`, t`No: $\sqrt n$ grows without bound`, t`Yes, because $p = \frac12 < 1$`, 'No: it is a p-series with p = 5/2, and p-series diverge'],
      answer: 0,
      why: { 1: t`$\sqrt n$ is in the denominator, which makes the terms smaller.`, 2: t`$n^2\sqrt n = n^{5/2}$, so $p = \frac52$; and $p < 1$ would mean divergence anyway.`, 3: 'p-series converge exactly when p > 1.' },
      hints: [t`Write $n^2\sqrt n$ as a single power of $n$.`],
      teach: 'Combine powers of n into one, then compare the exponent with 1.',
      explain: t`$n^2\sqrt n = n^{5/2}$, so the series is $\sum n^{-5/2}$ with $p = \frac52 > 1$: it converges.`,
    }),
    num({
      id: 'cp-remainder', difficulty: 3,
      gen(r) {
        const N = r.pick([4, 5, 8]);
        const up = 1 / (3 * N ** 3);
        return {
          prompt: t`After summing the first ${N} terms of $\displaystyle\sum_{n=1}^\infty \frac{1}{n^4}$, what upper bound does the integral test give for the remainder?`,
          answer: up, tol: { rel: 0.005 },
          errors: [{ value: 1 / (3 * (N + 1) ** 3), feedback: 'That integral starts at N + 1: it is the lower bound.' }, { value: 1 / N ** 4, feedback: 'That is just one term, not the tail.' }],
          hints: [t`$R_N \le \int_N^\infty x^{-4}\,dx = \frac{1}{3N^3}$.`, t`Put $N = ${N}$.`],
          teach: 'Upper bound on the remainder: integrate from N to infinity.',
          explain: t`$R_{${N}} \le \dfrac{1}{3\cdot ${N}^3} = ${tex(up, 3)}$.`,
        };
      },
    }),
    num({
      id: 'cp-chain', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([500, 1000, 2000]), d = r.pick([5, 10, 20]);
        const F = (G * m * m) / (d * d) * (Math.PI ** 2 / 6);
        return {
          prompt: t`An idealised line of identical ${m} kg point masses stretches to infinity, spaced ${d} m apart. Find the total gravitational force on the mass at the end, using $\sum_{n=1}^\infty \frac{1}{n^2} = \frac{\pi^2}{6}$ and $G = 6.674\times10^{-11}\ \text{N m}^2/\text{kg}^2$.`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: (G * m * m) / (d * d), feedback: t`That is only the nearest neighbour’s pull. Add every mass: the $n$-th is $nd$ away.` }],
          hints: [t`The $n$-th mass is $nd$ away and pulls with $\dfrac{Gm^2}{(nd)^2}$.`, t`$F = \dfrac{Gm^2}{d^2}\displaystyle\sum_{n=1}^\infty \frac{1}{n^2} = \frac{Gm^2}{d^2}\cdot\frac{\pi^2}{6}$.`],
          teach: 'An inverse-square law summed over an infinite chain is a p-series with p = 2, so the total force is finite.',
          explain: t`$F = \dfrac{(6.674\times10^{-11})(${m})^2}{${d}^2}\times${fmt(Math.PI ** 2 / 6, 4)} \approx ${tex(F, 3)}$ N. The potential energy, $-\sum \frac{Gm^2}{nd}$, is a harmonic series ($p = 1$) and diverges: the force converges but the energy does not.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §5.3 The divergence and integral tests', url: 'https://openstax.org/books/calculus-volume-2/pages/5-3-the-divergence-and-integral-tests' },
    { label: 'CODATA 2018: Newtonian constant of gravitation', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bg' },
  ],
});
