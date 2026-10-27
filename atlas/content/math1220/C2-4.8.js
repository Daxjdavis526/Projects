// Absolute convergence, and the ratio and root tests that compare a series with a geometric one.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, frac } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-4.8',
  title: 'Absolute convergence: ratio and root tests',
  minutes: 12, difficulty: 3,
  intro: t`A series **converges absolutely** when $\sum |a_n|$ converges — and then $\sum a_n$ converges too, whatever its signs. To test that, compare the series with a geometric one: a geometric series has a constant ratio $r$ between neighbouring terms, so look at the ratio your terms settle into:

$$L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|: \qquad L < 1 \Rightarrow \sum a_n \text{ converges absolutely}, \quad L > 1 \Rightarrow \text{diverges}$$

and $L = 1$ **decides nothing**. The **root test** uses $L = \lim \sqrt[n]{|a_n|}$ with the same verdicts. The ratio test is made for factorials and exponentials; the root test for $n$-th powers. Neither can settle a p-series, where $L = 1$ every time.`,
  symbols: [
    { tex: t`|a_n|`, text: 'the size of the $n$-th term, ignoring its sign' },
    { tex: t`\left|\frac{a_{n+1}}{a_n}\right|`, text: 'how much bigger (or smaller) each term is than the one before — constant for a geometric series' },
    { tex: t`L`, text: 'the limiting ratio (or root): the common ratio of the geometric series the tail behaves like' },
    { tex: t`\sqrt[n]{|a_n|}`, text: 'the $n$-th root of the size of the term: for $|a_n| = r^n$ it is exactly $r$' },
    { tex: t`n!`, text: 'the factorial $1\\cdot 2\\cdot 3\\cdots n$; the ratio $\\frac{(n+1)!}{n!} = n + 1$ is what makes the ratio test work so well on it' },
  ],
  why: t`The ratio test is the tool that finds the interval where a power series converges — the next module — and so decides where a Taylor approximation in physics can be trusted.`,
  visual: {
    type: 'calc-series',
    title: 'Ratios that settle',
    lead: t`Each dot is the ratio $\left|a_{n+1}/a_n\right|$ of neighbouring terms. Below the red line at 1 the tail shrinks like a convergent geometric series; above it the terms grow. Exactly at 1 the test is silent.`,
    tasks: [
      '5ⁿ/n!: the ratios start above 1 (the terms grow at first), then fall towards 0 — only the limit matters, and the series converges.',
      '1/n² and 1/n: both ratio sequences creep up to 1, yet one series converges and the other diverges. L = 1 decides nothing.',
      'n!/nⁿ: the ratios approach 1/e ≈ 0.37, so the series converges even though no simple comparison is in sight.',
    ],
    params: {
      view: 'ratio',
      N: { min: 1, max: 40, value: 25, label: 'Terms $N$' },
      presetLabel: 'Series',
      presets: [
        { label: '5ⁿ/n!', term: '5^n/n!', limit: 0 },
        { label: 'n²/2ⁿ', term: 'n^2/2^n', limit: 0.5 },
        { label: 'n!/nⁿ', term: 'n!/n^n', limit: 'exp(-1)' },
        { label: '2ⁿ/n³', term: '2^n/n^3', limit: 2 },
        { label: '1/n²', term: '1/n^2', limit: 1 },
        { label: '1/n', term: '1/n', limit: 1 },
        { label: 'root of (n/(2n+1))ⁿ', view: 'root', term: '(n/(2n + 1))^n', limit: 0.5 },
      ],
    },
    caption: t`The verdict in the readout comes from the limit $L$, not from the dots: finitely many ratios can never prove where the sequence ends up. The last preset shows the root test, $\sqrt[n]{|a_n|}$, instead.`,
  },
  example: {
    prompt: t`Does $\displaystyle\sum_{n=1}^{\infty}\frac{n^3}{3^n}$ converge?`,
    visual: { type: 'calc-series', params: { view: 'ratio', term: 'n^3/3^n', limit: '1/3', N: { min: 1, max: 40, value: 25 } }, caption: 'The ratios start at 8/3 (the first terms grow) and settle down towards 1/3.' },
    steps: [
      { label: 'Form the ratio', text: t`$\left|\dfrac{a_{n+1}}{a_n}\right| = \dfrac{(n + 1)^3}{3^{n+1}}\cdot\dfrac{3^n}{n^3} = \dfrac13\left(\dfrac{n + 1}{n}\right)^3$.` },
      { label: 'Take the limit', text: t`$\left(1 + \frac1n\right)^3 \to 1$, so $L = \frac13$.` },
      { label: 'Verdict', text: t`$L = \frac13 < 1$: the series converges (absolutely). Its tail behaves like a geometric series with ratio about $\frac13$.` },
      { label: 'Sense check', text: t`The terms are $\frac13, \frac89, 1, \frac{64}{81}, \frac{125}{243}, \dots$: they rise for the first few $n$ while $(1 + \frac1n)^3 > 3$, then the $3^n$ wins. Early terms never decide convergence; the limit of the ratio does.` },
    ],
    answer: t`It converges, by the ratio test with $L = \frac13$.`,
  },
  practice: [
    mcq({
      id: 'abs-or-cond', difficulty: 1,
      prompt: t`How does $\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{n^2}$ converge?`,
      choices: ['Absolutely', 'Conditionally', 'It diverges', 'It cannot be decided'],
      answer: 0,
      why: {
        1: t`Conditional convergence means $\sum|a_n|$ diverges. Here $\sum|a_n| = \sum\frac{1}{n^2}$ converges.`,
        2: t`It converges: even ignoring the signs, $\sum\frac1{n^2}$ converges.`,
        3: t`Take absolute values: $\sum \frac1{n^2}$ is a p-series with $p = 2$.`,
      },
      hints: ['Drop the signs. Does the series of absolute values converge?'],
      teach: 'Check absolute convergence first: if Σ|aₙ| converges, Σaₙ converges, whatever the signs.',
      explain: t`$\sum\left|\frac{(-1)^n}{n^2}\right| = \sum\frac{1}{n^2}$ converges ($p = 2$), so the series converges absolutely.`,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, term: '(-1)^n/n^2', compare: { term: '1/n^2', label: 'Σ |aₙ| = Σ 1/n²' }, N: 30, y: [-1.1, 1.8] }, caption: 'The series (blue) and the series of absolute values (dashed): both settle.' },
    }),
    num({
      id: 'ratio-L', difficulty: 2,
      gen(r) {
        const fam = r.pick(['power', 'binomial', 'stirling']);
        let aT, L, term, why;
        if (fam === 'power') {
          const k = r.pick([2, 3, 5]), c = r.int(2, 5);
          aT = t`\frac{n^{${k}}}{${c}^n}`; L = 1 / c; term = `n^${k}/${c}^n`;
          why = t`\frac{(n+1)^{${k}}}{${c}^{n+1}}\cdot\frac{${c}^n}{n^{${k}}} = \frac{1}{${c}}\left(1 + \frac1n\right)^{${k}} \to \frac1{${c}}`;
        } else if (fam === 'binomial') {
          const c = r.pick([3, 5, 6, 8]);
          aT = t`\frac{(2n)!}{(n!)^2\,${c}^n}`; L = 4 / c; term = `(2n)!/((n!)^2*${c}^n)`;
          why = t`\frac{(2n+2)(2n+1)}{(n+1)^2\cdot ${c}} = \frac{2(2n+1)}{${c}(n+1)} \to \frac{4}{${c}}`;
        } else {
          const c = r.pick([1, 2, 3]);
          aT = t`\frac{${c === 1 ? '' : `${c}^n\\,`}n!}{n^n}`; L = c / Math.E; term = `${c}^n*n!/n^n`;
          why = t`${c === 1 ? '' : `${c}\\cdot`}\frac{(n+1)\,n^n}{(n+1)^{n+1}} = ${c === 1 ? '' : `${c}\\cdot`}\left(\frac{n}{n+1}\right)^n \to \frac{${c}}{e}`;
        }
        return {
          prompt: t`Find the ratio-test limit $L = \displaystyle\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|$ for $\displaystyle\sum_{n=1}^\infty ${aT}$. Give a decimal.`,
          answer: L, tol: { rel: 2e-3 },
          errors: [{ value: 1 / L, feedback: t`Upside down: the ratio is $a_{n+1}$ over $a_n$ — the later term on top.` }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: ['Write a_{n+1}/a_n, cancel what you can (powers and factorials), then let n → ∞.', t`$${why}$.`],
          teach: 'The ratio test cancels factorials and powers neatly: write a_{n+1}/a_n and simplify before taking the limit.',
          explain: t`$${why} = ${fmt(L, 4)}$. ${L < 1 ? 'Since L < 1, the series converges absolutely.' : 'Since L > 1, the series diverges.'}`,
          visual: { type: 'calc-series', params: { view: 'ratio', term, N: 15 }, caption: 'The first 15 ratios of neighbouring terms.' },
        };
      },
    }),
    mcq({
      id: 'L-equals-one', difficulty: 2,
      prompt: t`The ratio test applied to $\displaystyle\sum \frac{1}{n^2}$ gives $L = \lim \frac{n^2}{(n+1)^2} = 1$. What should you conclude?`,
      choices: [t`Nothing from the ratio test; it is a p-series with $p = 2$, so it converges`, t`It diverges, because $L$ is not less than 1`, t`It converges, because $L \le 1$`, 'It converges to 1'],
      answer: 0,
      why: {
        1: t`$L = 1$ is the undecided case: $\sum\frac1n$ also gives $L = 1$ and diverges, while this one converges.`,
        2: t`Convergence needs $L < 1$ strictly; $L = 1$ allows either outcome.`,
        3: 'L describes how the terms shrink, not what they add up to.',
      },
      hints: ['What does the ratio test give for Σ 1/n, which diverges?'],
      teach: 'When the ratio or root limit is exactly 1, the test is silent — switch tests.',
      explain: t`Every p-series gives $L = 1$, convergent or not, so the ratio test cannot decide. The p-series test (or the integral test) shows $\sum\frac{1}{n^2}$ converges.`,
      visual: { type: 'calc-series', params: { view: 'ratio', term: '1/n^2', limit: 1, N: 40 }, caption: 'The ratios n²/(n+1)² creep up to 1 and never get below it decisively.' },
    }),
    num({
      id: 'root-L', difficulty: 2,
      gen(r) {
        const a = r.int(1, 5), c = r.intExcept(2, 7, [a]), b = r.int(1, 9), d = r.int(1, 9);
        const L = a / c;
        return {
          prompt: t`Use the root test on $\displaystyle\sum_{n=1}^\infty \left(\frac{${a === 1 ? '' : a}n + ${b}}{${c}n + ${d}}\right)^{n}$: find $L = \displaystyle\lim_{n\to\infty}\sqrt[n]{|a_n|}$.`,
          answer: L, tol: { rel: 1e-3 },
          errors: [{ value: b / d, feedback: 'The constant terms do not matter as n grows: compare the coefficients of n.' }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`The $n$-th root undoes the power $n$: $\sqrt[n]{|a_n|} = \dfrac{${a === 1 ? '' : a}n + ${b}}{${c}n + ${d}}$.`, 'Now take the limit as n → ∞.'],
          teach: 'For a term that is an n-th power, the root test removes the power in one step.',
          explain: t`$\sqrt[n]{a_n} = \frac{${a === 1 ? '' : a}n + ${b}}{${c}n + ${d}} \to \frac{${a}}{${c}} = ${frac(L)}${L < 1 ? ' < 1' : ' > 1'}$, so the series ${L < 1 ? 'converges absolutely' : 'diverges'}.`,
          visual: { type: 'calc-series', params: { view: 'root', term: `((${a}n + ${b})/(${c}n + ${d}))^n`, N: 30 }, caption: t`The roots $\sqrt[n]{a_n}$ for $n = 1 \dots 30$.` },
        };
      },
    }),
    multi({
      id: 'which-absolute', difficulty: 2,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, N: { min: 5, max: 60, value: 40 }, presetLabel: 'Series of |aₙ|', presets: [{ label: 'n^(−3/2)', term: 'n^(-1.5)' }, { label: '1/√n', term: '1/sqrt(n)' }, { label: '2ⁿ/n!', term: '2^n/n!', n0: 0 }, { label: '|sin n|/n²', term: 'abs(sin(n))/n^2' }, { label: 'n/(n²+1)', term: 'n/(n^2 + 1)' }] }, caption: 'Partial sums of the absolute values |aₙ| for each choice — the series that decides absolute convergence.' },
      prompt: 'Which of these series converge absolutely? Select all that do.',
      choices: [t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{n^{3/2}}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{(-1)^n}{\sqrt n}$`, t`$\displaystyle\sum_{n=0}^\infty \frac{(-2)^n}{n!}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{\sin n}{n^2}$`, t`$\displaystyle\sum_{n=1}^\infty (-1)^n\frac{n}{n^2 + 1}$`],
      answer: [0, 2, 3],
      why: {
        1: t`It converges (alternating series test), but $\sum\frac{1}{\sqrt n}$ diverges: **conditionally** convergent.`,
        4: t`$\frac{n}{n^2+1}$ behaves like $\frac1n$, so the absolute series diverges; the alternating series converges, so this one is conditional.`,
      },
      hints: ['Take absolute values of each term and test that positive series.', t`$|\sin n| \le 1$; for $\frac{2^n}{n!}$ use the ratio test.`],
      teach: 'Absolute convergence asks about the series of sizes |aₙ| — a positive series, so every positive-series test applies.',
      explain: t`$\sum n^{-3/2}$ converges ($p = \frac32$); $\sum\frac{2^n}{n!}$ converges by the ratio test ($L = 0$) — it is $e^2$; $\frac{|\sin n|}{n^2} \le \frac{1}{n^2}$. The other two converge only conditionally.`,
    }),
    mcq({
      id: 'which-test', difficulty: 2,
      visual: { type: 'calc-series', params: { view: 'root', term: '(n/(3n - 1))^(2n)', limit: '1/9', N: 30 }, caption: 'The n-th roots of the terms settle quickly.' },
      prompt: t`Which test settles $\displaystyle\sum_{n=1}^\infty \left(\frac{n}{3n - 1}\right)^{2n}$ most directly?`,
      choices: ['The root test', 'The ratio test', 'The integral test', 'The alternating series test'],
      answer: 0,
      why: {
        1: 'It works, but the algebra of dividing two such powers is messy.',
        2: 'Integrating that function is hopeless.',
        3: 'Every term is positive; nothing alternates.',
      },
      hints: ['The whole term is raised to a power involving n.'],
      teach: 'Terms of the form (something)ⁿ call for the root test.',
      explain: t`$\sqrt[n]{a_n} = \left(\frac{n}{3n - 1}\right)^2 \to \frac19 < 1$: the series converges, in one line.`,
    }),
    mcq({
      id: 'L-one-claim', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “For $\displaystyle\sum\frac{1}{\sqrt n}$, the ratio test gives $L = \lim\sqrt{\frac{n}{n+1}} = 1$. Since $L \le 1$, the series converges.” What is wrong?`,
      choices: [
        t`$L = 1$ decides nothing; in fact $\sum\frac{1}{\sqrt n}$ is a p-series with $p = \frac12$ and diverges`,
        'Nothing: L ≤ 1 means convergence',
        t`The limit is $\frac12$, so it does converge`,
        t`$L = 1$ proves divergence, so only the conclusion is wrong`,
      ],
      answer: 0,
      why: {
        1: 'Convergence needs L < 1 strictly — and even then only from the test, not from L ≤ 1.',
        2: t`$\sqrt{\frac{n}{n+1}} \to 1$, not $\frac12$; the $\frac12$ is the exponent of $n$.`,
        3: t`$L = 1$ proves nothing either way: $\sum\frac{1}{n^2}$ also has $L = 1$ and converges.`,
      },
      hints: ['What are the three cases of the ratio test?', 'Which test handles Σ 1/nᵖ?'],
      teach: 'The ratio test has three outcomes, and L = 1 is the one that says nothing.',
      explain: t`With $L = 1$ the ratio test is inconclusive. As a p-series with $p = \frac12 \le 1$, $\sum\frac{1}{\sqrt n}$ diverges.`,
      visual: { type: 'calc-series', params: { view: 'ratio', term: '1/sqrt(n)', limit: 1, N: 40 }, caption: 'The ratios approach 1 from below — which says nothing about convergence.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ratio', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[2, 3], [3, 4], [3, 5], [4, 7], [5, 3]]);
        const L = p / q;
        return {
          prompt: t`Find the ratio-test limit $L$ for $\displaystyle\sum_{n=1}^\infty \frac{n\cdot ${p}^n}{${q}^n}$, and so decide its fate. Give $L$ as a decimal.`,
          answer: L, tol: { rel: 1e-3 },
          errors: [{ value: q / p, feedback: 'Upside down: put the (n+1)-th term on top.' }],
          hints: [t`$\dfrac{a_{n+1}}{a_n} = \dfrac{n + 1}{n}\cdot\dfrac{${p}}{${q}}$.`],
          teach: 'Polynomial factors tend to 1 in the ratio test; the exponential factors set L.',
          explain: t`$\frac{n+1}{n}\cdot\frac{${p}}{${q}} \to \frac{${p}}{${q}} = ${fmt(L, 4)}$, so the series ${L < 1 ? 'converges absolutely' : 'diverges'}.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `n*${p}^n/${q}^n`, N: 25, zero: true }, caption: 'The first 25 terms.' },
        };
      },
    }),
    mcq({
      id: 'cp-factorial', difficulty: 2,
      prompt: t`What happens to $\displaystyle\sum_{n=1}^\infty \frac{n!}{10^n}$?`,
      choices: [t`It diverges: $\frac{a_{n+1}}{a_n} = \frac{n + 1}{10} \to \infty$`, t`It converges: $10^n$ grows very fast`, 'The ratio test is inconclusive', 'It converges absolutely by the root test'],
      answer: 0,
      why: { 1: t`$10^n$ is fast, but $n!$ is faster: from $n = 10$ on each term is bigger than the last.`, 2: 'Inconclusive only when L = 1; here L = ∞.', 3: t`$\sqrt[n]{n!/10^n} \to \infty$ as well — no convergence.` },
      hints: ['Compute the ratio of neighbouring terms.'],
      teach: 'Factorials beat every exponential: the ratio test makes that precise.',
      explain: t`$\frac{a_{n+1}}{a_n} = \frac{(n+1)!}{10^{n+1}}\cdot\frac{10^n}{n!} = \frac{n+1}{10} \to \infty > 1$: the terms eventually grow, and the series diverges.`,
    }),
    num({
      id: 'cp-oscillator', difficulty: 3, transfer: true,
      gen(r) {
        const x = r.pick([0.5, 1, 2, 3]);
        const L = Math.exp(-x);
        return {
          prompt: t`In Planck’s treatment of thermal radiation, the mean energy of an oscillator involves $\displaystyle\sum_{n=0}^\infty n\,e^{-nx}$, where $x = \frac{\hbar\omega}{k_BT} > 0$ compares the energy step $\hbar\omega$ with the thermal energy $k_BT$. For $x = ${x}$, find the ratio-test limit $L$ (as a decimal).`,
          answer: L, tol: { rel: 2e-3 },
          errors: [{ value: Math.exp(x), feedback: t`Upside down: $\frac{a_{n+1}}{a_n} = \frac{n+1}{n}e^{-x}$.` }, { value: 1, feedback: t`The factor $\frac{n+1}{n} \to 1$, but $e^{-x}$ stays.` }],
          hints: [t`$\dfrac{a_{n+1}}{a_n} = \dfrac{(n+1)e^{-(n+1)x}}{n\,e^{-nx}} = \dfrac{n+1}{n}e^{-x}$.`, t`Let $n \to \infty$.`],
          teach: 'Boltzmann factors e^{−nx} make thermal sums behave like geometric series, which the ratio test confirms converge for any x > 0.',
          explain: t`$L = e^{-${x}} \approx ${fmt(L, 4)} < 1$, so the sum converges for every temperature (any $x > 0$). In fact $\sum n e^{-nx} = \frac{e^{-x}}{(1 - e^{-x})^2}$, which leads to Planck’s mean energy $\frac{\hbar\omega}{e^{x} - 1}$.`,
          visual: { type: 'graph', params: { x: [-0.5, 10.5], y: [0, 1.1], xlabel: 'n (number of quanta)', ylabel: 'weight', points: Array.from({ length: 11 }, (_, n) => ({ x: n, y: Math.exp(-n * x), color: 'accent' })) }, caption: t`The Boltzmann weights $e^{-nx}$ of the oscillator’s levels for $x = ${x}$: each is a fixed fraction of the one before.` },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.6 Ratio and root tests', url: 'https://openstax.org/books/calculus-volume-2/pages/5-6-ratio-and-root-tests' }],
});
