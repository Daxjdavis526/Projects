// Strategy: reading the shape of a series to choose the test that settles it.
import { lesson, mcq, multi, num, match } from '../../src/core/content.js';
import { frac, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-4.9',
  title: 'Choosing a convergence test',
  minutes: 12, difficulty: 3,
  intro: t`No single test settles every series, but the **shape of the terms** usually points to the right one. Always start with the cheapest check,

$$\lim_{n\to\infty} a_n \neq 0 \;\Longrightarrow\; \sum a_n \text{ diverges},$$

and if the terms do go to 0, match their shape to a test:

- a **known family** — geometric $\sum ar^n$ (converges iff $|r| < 1$), p-series $\sum 1/n^p$ (iff $p > 1$), or telescoping;
- **signs that alternate** — the alternating series test, then check $\sum |a_n|$ for absolute convergence;
- **factorials or exponentials**, such as $n!$ or $c^n$ — the ratio test; **a whole term raised to the n-th power** — the root test;
- a **rational or algebraic expression** — compare (or limit-compare) with the p-series made of its dominant terms;
- a **function you can integrate**, positive and decreasing — the integral test.

When a test returns “no decision” (a ratio limit of 1, an inequality pointing the wrong way), switch tests rather than force a verdict.`,
  symbols: [
    { tex: t`a_n`, text: 'the $n$-th term: its **shape** — powers, factorials, exponentials, signs — chooses the test' },
    { tex: t`\sum ar^n`, text: 'a geometric series: converges exactly when the ratio satisfies $|r| < 1$' },
    { tex: t`\sum \frac{1}{n^p}`, text: 'a p-series: converges exactly when $p > 1$ — the benchmark for comparisons' },
    { tex: t`L`, text: 'the ratio- or root-test limit: $L < 1$ converges absolutely, $L > 1$ diverges, $L = 1$ says nothing' },
  ],
  why: t`In physics you rarely meet a series labelled with its test; recognising the shape — exponential tails, power laws, alternating signs — is the skill that carries over to power series, Fourier series and perturbation theory.`,
  visual: {
    type: 'calc-series',
    title: 'Six series — which test, which verdict?',
    lead: t`Pick a series and decide, from the shape of its terms, which test settles it and what it says. Then look at the bars (terms) and dots (partial sums) — but do not let them vote: two of these pictures mislead.`,
    tasks: [
      'n/(n² + 1): the partial sums slow down and could pass for levelling off, yet the terms behave like 1/n — limit comparison says it diverges (it grows like ln N).',
      '1/(n ln² n): the partial sums creep upward for a long time, yet the integral test says it converges.',
      'cos(1/n): the terms approach 1, so the divergence test finishes it in one line — no picture needed.',
    ],
    params: {
      view: 'sums',
      N: { min: 1, max: 60, value: 30, label: 'Terms added $N$' },
      presetLabel: 'Series',
      presets: [
        { label: 'n/(n²+1)', term: 'n/(n^2 + 1)', limit: null },
        { label: '3ⁿ/n!', term: '3^n/n!', limit: 'exp(3) - 1', limitLabel: 'e³ − 1' },
        { label: '(−1)ⁿ/ln n', term: '(-1)^n/ln(n)', n0: 2, limit: null },
        { label: '(2n/(3n+1))ⁿ', term: '(2n/(3n + 1))^n', limit: null },
        { label: '1/(n ln² n)', term: '1/(n*ln(n)^2)', n0: 2, limit: null },
        { label: 'cos(1/n)', term: 'cos(1/n)', limit: null },
      ],
    },
    caption: t`Verdicts: diverges (limit comparison with $\frac1n$); converges to $e^3 - 1$ (ratio test, $L = 0$); converges conditionally (alternating series test); converges (root test, $L = \frac23$); converges, to about 2.11, but only at the pace of $\frac{1}{\ln N}$ (integral test); diverges (divergence test). Only $N$ terms are drawn — the tests, not the pictures, decide.`,
  },
  example: {
    prompt: t`Decide the fate of each series: (a) $\displaystyle\sum\frac{n^2 + 1}{2n^2 - 3}$, (b) $\displaystyle\sum n\,e^{-n}$, (c) $\displaystyle\sum (-1)^n\frac{\sqrt n}{n + 1}$.`,
    steps: [
      { label: '(a) Terms first', text: t`$\dfrac{n^2 + 1}{2n^2 - 3} \to \dfrac12 \neq 0$: **diverges** by the divergence test. Nothing else needed.` },
      { label: '(b) Spot the exponential', text: t`An $e^{-n}$ factor suggests the ratio test: $\left|\dfrac{a_{n+1}}{a_n}\right| = \dfrac{n + 1}{n}\,e^{-1} \to \dfrac1e < 1$, so it **converges** (absolutely). (The integral test works too: $\int_1^\infty xe^{-x}dx = \frac2e$.)` },
      { label: '(c) Signs alternate', text: t`Sizes $b_n = \dfrac{\sqrt n}{n + 1}$: they tend to 0, and they decrease for $n \ge 1$ (the derivative of $\frac{\sqrt x}{x + 1}$ is $\frac{1 - x}{2\sqrt x\,(x+1)^2} \le 0$). By the alternating series test it **converges**.` },
      { label: '(c) Absolutely?', text: t`$b_n \approx \dfrac{\sqrt n}{n} = \dfrac{1}{\sqrt n}$, and limit comparison with $\sum\frac{1}{\sqrt n}$ (which diverges, $p = \frac12$) gives $c = 1$. So $\sum|a_n|$ diverges: (c) converges only **conditionally**.` },
      { label: 'The pattern', text: t`Divergence test first; then let the shape choose: exponentials → ratio, alternating → AST and then absolute values, algebraic → limit comparison.` },
    ],
    answer: t`(a) diverges; (b) converges absolutely; (c) converges conditionally.`,
  },
  practice: [
    match({
      id: 'match-tests', difficulty: 2,
      prompt: 'Match each series with the test that settles it most directly.',
      left: [t`$\sum \dfrac{5^n}{n!}$`, t`$\sum \left(\dfrac{n}{2n + 1}\right)^n$`, t`$\sum \dfrac{1}{n^2 + 7}$`, t`$\sum \dfrac{(-1)^n}{\sqrt n}$`, t`$\sum \dfrac{n}{n + 3}$`, t`$\sum_{n\ge2} \dfrac{1}{n(\ln n)^2}$`],
      right: ['Ratio test', 'Root test', 'Comparison with Σ 1/n²', 'Alternating series test', 'Divergence test', 'Integral test'],
      answer: [0, 1, 2, 3, 4, 5],
      hints: ['Factorials → ratio; a whole term to the n-th power → root; terms that do not go to 0 → divergence test.', t`$\frac{1}{x(\ln x)^2}$ has an easy antiderivative: $-\frac{1}{\ln x}$.`],
      teach: 'Read the shape of the terms first; it usually names the test.',
      explain: t`$\frac{5^n}{n!}$: ratio $\to 0$. $\left(\frac{n}{2n+1}\right)^n$: root $\to \frac12$. $\frac1{n^2+7} < \frac1{n^2}$. $\frac{(-1)^n}{\sqrt n}$: sizes decrease to 0. $\frac{n}{n+3} \to 1 \neq 0$. $\int_2^\infty \frac{dx}{x(\ln x)^2} = \frac{1}{\ln 2}$, finite.`,
    }),
    mcq({
      id: 'split-geometric', difficulty: 2,
      prompt: t`What happens to $\displaystyle\sum_{n=0}^\infty \frac{2^n + 1}{3^n}$?`,
      choices: [t`It converges: it is $\sum\left(\frac23\right)^n + \sum\left(\frac13\right)^n$, two convergent geometric series`, t`It diverges, because $2^n + 1$ grows without bound`, 'The ratio test gives L = 1, so we cannot tell', t`It converges to $\frac{1}{1 - 2/3} = 3$`],
      answer: 0,
      why: {
        1: t`The top grows, but the bottom grows faster: the terms behave like $\left(\frac23\right)^n \to 0$.`,
        2: t`The ratio is $\frac{2^{n+1} + 1}{3(2^n + 1)} \to \frac23$, not 1.`,
        3: t`That forgets the second series, $\sum\left(\frac13\right)^n = \frac32$: the total is $3 + \frac32 = \frac92$.`,
      },
      hints: ['Split the fraction into two terms.'],
      teach: 'A sum of terms can be split into separate series when each one converges.',
      explain: t`$\frac{2^n + 1}{3^n} = \left(\frac23\right)^n + \left(\frac13\right)^n$, so the sum is $\frac{1}{1 - 2/3} + \frac{1}{1 - 1/3} = 3 + \frac32 = \frac92$.`,
      visual: { type: 'calc-series', params: { view: 'sums', term: '(2^n + 1)/3^n', n0: 0, N: 20, y: [0, 5] }, caption: 'The terms (bars) shrink like (2/3)ⁿ and the partial sums settle.' },
    }),
    mcq({
      id: 'log-over-square', difficulty: 2,
      prompt: t`Which argument shows that $\displaystyle\sum_{n=1}^\infty \frac{\ln n}{n^2}$ converges?`,
      choices: [
        t`For large $n$, $\ln n < \sqrt n$, so $\frac{\ln n}{n^2} < \frac{1}{n^{3/2}}$, a convergent p-series`,
        t`$\frac{\ln n}{n^2} < \frac{1}{n}$ for $n \ge 1$, and comparison finishes it`,
        t`The ratio test gives $L = 1$, which means convergence`,
        t`The terms go to 0, so it converges`,
      ],
      answer: 0,
      why: {
        1: t`True inequality, but $\sum\frac1n$ diverges: being smaller than a divergent series proves nothing.`,
        2: t`$L = 1$ is exactly the case where the ratio test says nothing.`,
        3: 'Terms going to 0 never proves convergence.',
      },
      hints: [t`$\ln n$ grows more slowly than any positive power of $n$ — say $\sqrt n$.`, t`Then $\frac{\ln n}{n^2} < \frac{\sqrt n}{n^2}$. Is $\sum n^{-3/2}$ convergent?`],
      teach: 'Logarithms grow slower than any power, so you can trade ln n for a small power of n and compare with a p-series.',
      explain: t`$\ln n < \sqrt n$ for all $n \ge 1$, so $0 \le \frac{\ln n}{n^2} < n^{-3/2}$, and $\sum n^{-3/2}$ converges ($p = \frac32 > 1$). (The integral test works too.)`,
      visual: { type: 'calc-series', params: { view: 'sums', term: 'ln(n)/n^2', compare: { term: 'n^(-1.5)', label: 'benchmark Σ n^(−3/2)' }, N: 40, y: [0, 2.8] }, caption: 'The series (blue) stays below the convergent benchmark (dashed).' },
    }),
    mcq({
      id: 'conditional-verdict', difficulty: 3,
      prompt: t`Classify $\displaystyle\sum_{n=1}^\infty (-1)^n\frac{n}{n^2 + 1}$.`,
      choices: ['Conditionally convergent', 'Absolutely convergent', 'Divergent', 'The tests cannot decide'],
      answer: 0,
      why: {
        1: t`$\sum\frac{n}{n^2 + 1}$ behaves like $\sum\frac1n$ (limit comparison, $c = 1$), so it diverges: not absolute.`,
        2: t`The sizes $\frac{n}{n^2+1}$ decrease to 0, so the alternating series test gives convergence.`,
        3: 'The alternating series test and limit comparison decide it between them.',
      },
      hints: ['Two questions: does it converge (signs included)? Does Σ|aₙ| converge?', t`For $\sum|a_n|$, compare $\frac{n}{n^2+1}$ with $\frac1n$.`],
      teach: 'For an alternating series, test convergence with the AST and absolute convergence with a positive-series test.',
      explain: t`The sizes $\frac{n}{n^2+1}$ decrease to 0 (for $n \ge 1$), so the series converges by the AST. But $\sum\frac{n}{n^2+1}$ diverges by limit comparison with $\sum\frac1n$. So it converges conditionally.`,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, term: '(-1)^n*n/(n^2 + 1)', compare: { term: 'n/(n^2 + 1)', label: 'Σ |aₙ|' }, N: 40, y: [-1, 3.5] }, caption: 'The series (blue) and the series of absolute values (dashed).' },
    }),
    multi({
      id: 'which-diverge', difficulty: 2,
      prompt: 'Which of these series diverge? Select all that do.',
      choices: [t`$\displaystyle\sum \frac{1}{n^{0.99}}$`, t`$\displaystyle\sum \left(1 - \frac1n\right)^n$`, t`$\displaystyle\sum \frac{n!}{n^{5}}$`, t`$\displaystyle\sum \frac{1}{n^2 - n + 1}$`, t`$\displaystyle\sum \frac{(-1)^n}{n^{0.99}}$`],
      answer: [0, 1, 2],
      why: {
        3: t`It behaves like $\frac1{n^2}$ (limit comparison, $c = 1$): converges.`,
        4: t`The sizes $n^{-0.99}$ decrease to 0, so the alternating series converges (conditionally).`,
      },
      hints: [t`$\left(1 - \frac1n\right)^n \to \frac1e$. And $n!$ beats any power of $n$.`],
      teach: 'Check the limit of the terms first; a p-series with p ≤ 1 diverges even when p is just below 1.',
      explain: t`$p = 0.99 \le 1$: diverges. $\left(1 - \frac1n\right)^n \to \frac1e \neq 0$: diverges. $\frac{n!}{n^5} \to \infty$: diverges. The other two converge.`,
    }),
    mcq({
      id: 'absolute-misused', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “For $\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n}$, the series of absolute values $\sum\frac1n$ diverges, so the series diverges.” What is wrong?`,
      choices: [
        t`Divergence of $\sum|a_n|$ only rules out **absolute** convergence; the series converges conditionally by the alternating series test`,
        'Nothing: if Σ|aₙ| diverges then Σaₙ diverges',
        t`$\sum\frac1n$ actually converges`,
        t`The series diverges, but because its terms do not go to 0`,
      ],
      answer: 0,
      why: {
        1: t`Only the other direction holds: if $\sum|a_n|$ converges then $\sum a_n$ converges.`,
        2: 'The harmonic series diverges; that part of the argument is right.',
        3: t`Its terms $\pm\frac1n$ do go to 0 — and it converges, to $\ln 2$.`,
      },
      hints: ['Which way does “absolute convergence implies convergence” go?', 'What does the alternating series test say here?'],
      teach: 'Absolute convergence implies convergence, but a divergent series of absolute values leaves the question open.',
      explain: t`The theorem is one-way: $\sum|a_n|$ convergent ⇒ $\sum a_n$ convergent. Here the sizes $\frac1n$ decrease to 0, so the series converges by the alternating series test — conditionally, to $\ln 2$.`,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, term: '(-1)^(n+1)/n', limit: 'ln(2)', limitLabel: 'ln 2', compare: { term: '1/n', label: 'Σ |aₙ| = Σ 1/n' }, N: 40, y: [0, 4.5] }, caption: 'The series settles at ln 2 while the series of absolute values keeps growing.' },
    }),
    num({
      id: 'two-geometric', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[2, 3, 5], [1, 2, 4], [2, 5, 7], [3, 4, 6], [1, 3, 4]]);
        const S = 1 / (1 - a / c) + 1 / (1 - b / c);
        return {
          prompt: t`Find $\displaystyle\sum_{n=0}^\infty \frac{${a === 1 ? '1' : `${a}^n`} + ${b}^n}{${c}^n}$.`,
          answer: S, tol: { rel: 1e-4 },
          errors: [{ value: 1 / (1 - (a + b) / c), feedback: t`$\frac{${a}^n + ${b}^n}{${c}^n}$ is not $\left(\frac{${a + b}}{${c}}\right)^n$: split it into two separate geometric series.` }].filter((e) => Number.isFinite(e.value) && e.value > 0),
          hints: [t`Split: $\left(\frac{${a}}{${c}}\right)^n + \left(\frac{${b}}{${c}}\right)^n$.`, 'Sum each geometric series (first term 1) and add.'],
          teach: 'Spot geometric pieces, split the series, and sum each piece.',
          explain: t`$\dfrac{1}{1 - ${frac(a / c)}} + \dfrac{1}{1 - ${frac(b / c)}} = ${frac(1 / (1 - a / c))} + ${frac(1 / (1 - b / c))} = ${frac(S)}${Number.isInteger(S) ? '' : t` \approx ${fmt(S, 4)}`}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-algebraic', difficulty: 2,
      prompt: t`What happens to $\displaystyle\sum_{n=1}^\infty \frac{n^2}{n^3 + 1}$?`,
      choices: [t`It diverges: limit comparison with $\sum\frac1n$ gives $c = 1$`, t`It converges: the terms go to 0`, t`It converges: limit comparison with $\sum\frac{1}{n^2}$`, 'It diverges by the divergence test'],
      answer: 0,
      why: { 1: 'Terms going to 0 is necessary, not sufficient.', 2: t`Dominant terms give $\frac{n^2}{n^3} = \frac1n$, not $\frac{1}{n^2}$.`, 3: t`The terms do go to 0; the divergence test is silent.` },
      hints: ['Keep the dominant power top and bottom.'],
      teach: 'Algebraic terms: keep dominant powers, then limit-compare with that p-series.',
      explain: t`$\frac{n^2/(n^3+1)}{1/n} = \frac{n^3}{n^3 + 1} \to 1$, and $\sum\frac1n$ diverges, so this series diverges.`,
    }),
    mcq({
      id: 'cp-exponential', difficulty: 2,
      prompt: t`What happens to $\displaystyle\sum_{n=1}^\infty \frac{3^n}{n\cdot 2^n}$?`,
      choices: [t`It diverges: the ratio test gives $L = \frac32$ (indeed the terms grow)`, t`It converges: the ratio test gives $L = \frac23$`, 'The ratio test gives L = 1, so we need another test', t`It converges, because of the $n$ in the denominator`],
      answer: 0,
      why: { 1: 'Upside down: the later term goes on top.', 2: t`$\frac{n}{n+1} \to 1$, but the factor $\frac32$ remains.`, 3: t`A factor $\frac1n$ cannot tame $\left(\frac32\right)^n$.` },
      hints: [t`$\frac{a_{n+1}}{a_n} = \frac{3}{2}\cdot\frac{n}{n + 1}$.`],
      teach: 'Exponentials in the terms call for the ratio test.',
      explain: t`$L = \frac32 > 1$: the series diverges. (Its terms $\frac{(3/2)^n}{n}$ grow without bound, so the divergence test also finishes it.)`,
    }),
    mcq({
      id: 'cp-panel', difficulty: 3, transfer: true,
      prompt: t`A satellite’s solar panel degrades. Model the energy it delivers on orbit $n$ as $E_n = \dfrac{50n}{n^2 + 1}$ kWh. Over infinitely many orbits, is the total energy finite?`,
      choices: [
        t`No: $E_n$ behaves like $\frac{50}{n}$, and $\sum\frac1n$ diverges — the total grows without bound, though only like $50\ln N$`,
        t`Yes: $E_n \to 0$, so the total is finite`,
        t`Yes: $E_n < \frac{50}{n}$, so comparison shows it converges`,
        t`No: the divergence test shows it, because $E_n$ does not go to 0`,
      ],
      answer: 0,
      why: {
        1: 'The energy per orbit does go to 0, but too slowly: terms going to 0 never guarantees a finite total.',
        2: t`$E_n < \frac{50}{n}$ is true, but $\sum\frac{50}{n}$ diverges: smaller than divergent proves nothing.`,
        3: t`$E_n \to 0$, so the divergence test is silent.`,
      },
      hints: ['What does E_n look like for large n?', t`Limit-compare $E_n$ with $\frac1n$.`],
      teach: 'Power-law decay like 1/n is too slow for a finite total; decay faster than 1/n^p with p > 1 is needed.',
      explain: t`$\frac{E_n}{1/n} = \frac{50n^2}{n^2 + 1} \to 50$, and $\sum\frac1n$ diverges, so $\sum E_n$ diverges: with this (idealised) model, a panel that never dies delivers unbounded energy — but only logarithmically, about $50\ln N$ kWh after $N$ orbits.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §5.6 Ratio and root tests (Choosing a convergence test)', url: 'https://openstax.org/books/calculus-volume-2/pages/5-6-ratio-and-root-tests' },
  ],
});
