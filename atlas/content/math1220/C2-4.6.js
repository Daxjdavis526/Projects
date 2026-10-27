// Comparison and limit comparison: judging a series by a benchmark it resembles.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, frac, tex } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-4.6',
  title: 'Comparison and limit comparison tests',
  minutes: 12, difficulty: 3,
  intro: t`Most series cannot be summed or integrated, but they look like one you already know. For positive terms, partial sums only grow, so a series trapped under a convergent one must converge, and one sitting on top of a divergent one must diverge — the **comparison test**:

$$0 \le a_n \le b_n \ \text{ and } \ \sum b_n \text{ converges} \;\Longrightarrow\; \sum a_n \text{ converges}$$

(and if $\sum a_n$ diverges, so does $\sum b_n$). Finding an inequality that points the right way can be fiddly; the **limit comparison test** only asks whether the terms behave alike: if $\lim a_n/b_n = c$ with $0 < c < \infty$, both series converge or both diverge. The benchmarks $b_n$ are almost always p-series or geometric series, chosen by keeping only the dominant terms of $a_n$.`,
  symbols: [
    { tex: t`a_n`, text: 'the terms of the series you want to test (positive)' },
    { tex: t`b_n`, text: 'the terms of a **benchmark** series whose fate you know — usually $1/n^p$ or $r^n$' },
    { tex: t`a_n \le b_n`, text: 'term by term (at least from some $n$ on): the smaller series can only converge if the larger does — never the other way round' },
    { tex: t`c = \lim \frac{a_n}{b_n}`, text: 'the ratio of the terms in the long run; any finite positive $c$ means the two series share a verdict' },
  ],
  why: t`Comparison is how physicists decide whether a sum over infinitely many shells, modes or charges is finite — by asking which power law it behaves like at large $n$.`,
  visual: {
    type: 'calc-series',
    title: 'A series and its benchmark',
    lead: t`Violet bars are the terms $a_n$ and blue dots their partial sums; the dashed line of dots is the benchmark’s partial sums. With positive terms, partial sums never fall, so a ceiling or a floor decides everything.`,
    tasks: [
      'Smaller than convergent: every term of 1/(n² + 1) is below 1/n², so its sums stay under the benchmark’s, which never pass π²/6 ≈ 1.645.',
      'Same shape: (2n + 1)/(n³ + 5) behaves like 2/n² — watch the readout of the ratio a_N/b_N approach 1.',
      'No verdict: 1/n² is below 1/n, but being smaller than a divergent series proves nothing.',
    ],
    params: {
      view: 'sums',
      N: { min: 1, max: 60, value: 30, label: 'Terms added $N$' },
      presetLabel: 'Comparison',
      presets: [
        { label: 'below a convergent', term: '1/(n^2 + 1)', limit: '(pi*cosh(pi)/sinh(pi) - 1)/2', compare: { term: '1/n^2', label: 'benchmark Σ 1/n²' }, y: [0, 1.8] },
        { label: 'above a divergent', term: '1/sqrt(n)', limit: null, compare: { term: '1/n', label: 'benchmark Σ 1/n' }, y: [0, 14] },
        { label: 'same shape', term: '(2n + 1)/(n^3 + 5)', limit: null, compare: { term: '2/n^2', label: 'benchmark Σ 2/n²' }, y: [0, 3.6], readouts: [{ label: 'ratio $a_N/b_N$', expr: '((2N + 1)/(N^3 + 5))/(2/N^2)', digits: 5 }] },
        { label: 'no verdict', term: '1/n^2', limit: null, compare: { term: '1/n', label: 'Σ 1/n (diverges)' }, y: [0, 5] },
      ],
    },
    caption: t`Only finitely many terms are drawn; the tests use the inequalities for **all** $n$ (or all $n$ beyond some point). In the first panel the green line is the true sum, $\frac{\pi\coth\pi - 1}{2} \approx 1.077$, known from complex analysis — the comparison only guarantees it is below $\frac{\pi^2}{6}$.`,
  },
  example: {
    prompt: t`Does $\displaystyle\sum_{n=1}^{\infty}\frac{3n + 2}{n^3 - n + 1}$ converge?`,
    visual: { type: 'calc-series', params: { view: 'sums', term: '(3n + 2)/(n^3 - n + 1)', compare: { term: '3/n^2', label: 'benchmark Σ 3/n²' }, N: { min: 1, max: 40, value: 20 }, readouts: [{ label: 'ratio $a_N/b_N$', expr: '((3N + 2)/(N^3 - N + 1))/(3/N^2)', digits: 5 }] }, caption: 'The series (blue) and the benchmark 3/n² (dashed): different sums, the same fate.' },
    steps: [
      { label: 'Keep the dominant terms', text: t`For large $n$, $\;\dfrac{3n + 2}{n^3 - n + 1} \approx \dfrac{3n}{n^3} = \dfrac{3}{n^2}$. So compare with $b_n = \dfrac{1}{n^2}$.` },
      { label: 'Ratio of terms', text: t`$\dfrac{a_n}{b_n} = \dfrac{n^2(3n + 2)}{n^3 - n + 1} = \dfrac{3n^3 + 2n^2}{n^3 - n + 1} \to 3$.` },
      { label: 'Apply the test', text: t`$0 < 3 < \infty$ and $\sum\frac{1}{n^2}$ converges ($p = 2$), so $\sum a_n$ converges too.` },
      { label: 'Why not direct comparison?', text: t`The obvious inequality fails: $a_n > \frac{3}{n^2}$ for every $n$ (it reduces to $2n^2 + 3n - 3 > 0$). You could prove $a_n \le \frac{6}{n^2}$ instead — but limit comparison saves the hunt.` },
    ],
    answer: t`It converges, by limit comparison with $\sum \frac{1}{n^2}$ ($c = 3$).`,
  },
  practice: [
    mcq({
      id: 'direction', difficulty: 1,
      visual: { type: 'calc-series', params: { view: 'sums', showTerms: false, term: '1/n^2', compare: [{ term: '1/n', label: 'a larger series that diverges' }, { term: '2/n^2', label: 'a larger series that converges', color: 'teal' }], N: 40, y: [0, 4.6] }, caption: t`$\sum\frac{1}{n^2}$ (blue) converges, and two different larger series sit above it: one diverges, one converges. A convergent smaller series pins down nothing.` },
      prompt: t`Suppose $0 \le a_n \le b_n$ for all $n$, and $\sum a_n$ converges. What can you conclude about $\sum b_n$?`,
      choices: ['Nothing', t`$\sum b_n$ converges`, t`$\sum b_n$ diverges`, t`$\sum b_n \le \sum a_n$`],
      answer: 0,
      why: {
        1: t`The larger series is not held down by the smaller one: $\frac{1}{n^2} \le \frac{1}{n}$, the first converges, and the second diverges.`,
        2: t`It might converge: $\frac{1}{2n^2} \le \frac{1}{n^2}$ and both converge.`,
        3: 'The inequality goes the other way: if both converge, Σ aₙ ≤ Σ bₙ.',
      },
      hints: ['A ceiling helps the series below it; a floor helps the series above it. Which is Σ aₙ here?'],
      teach: 'Comparison gives information in two directions only: smaller than convergent, or larger than divergent.',
      explain: t`A convergent **smaller** series puts no ceiling on the larger one. Examples show both outcomes are possible, so nothing follows.`,
    }),
    mcq({
      id: 'benchmark', difficulty: 2,
      gen(r) {
        const a = r.int(1, 5), c = r.int(2, 4), d = r.int(1, 9);
        return {
          prompt: t`To test $\displaystyle\sum_{n=1}^\infty \frac{n + ${a}}{${c}n^3 + ${d}}$ by limit comparison, which benchmark $b_n$ is the natural choice?`,
          choices: [t`$\dfrac{1}{n^2}$`, t`$\dfrac{1}{n}$`, t`$\dfrac{1}{n^3}$`, t`$\dfrac{1}{n + ${a}}$`],
          answer: 0,
          why: {
            1: t`The ratio $a_n\big/\frac1n = \frac{n^2 + ${a}n}{${c}n^3 + ${d}} \to 0$, and with $c = 0$ a divergent benchmark tells you nothing.`,
            2: t`The ratio $a_n\big/\frac{1}{n^3} \to \infty$: $a_n$ is much bigger than $\frac1{n^3}$, so a convergent benchmark of this kind says nothing.`,
            3: t`That keeps only the numerator. The terms behave like (top’s leading term)/(bottom’s leading term).`,
          },
          hints: ['Keep only the highest power of n on the top and on the bottom.', t`$\dfrac{n}{${c}n^3} = \dfrac{1}{${c}n^2}$.`],
          teach: 'Choose the benchmark by keeping only the dominant power of n on top and bottom.',
          explain: t`$a_n \approx \frac{n}{${c}n^3} = \frac{1}{${c}n^2}$, so take $b_n = \frac1{n^2}$: $\frac{a_n}{b_n} \to \frac{1}{${c}}$, a finite positive number, and $\sum\frac{1}{n^2}$ converges — so the series converges.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(n + ${a})/(${c}n^3 + ${d})*n^2`, termLabel: 'aₙ ÷ (1/n²)', compare: [{ term: `(n + ${a})/(${c}n^3 + ${d})*n`, label: 'aₙ ÷ (1/n)' }, { term: `(n + ${a})/(${c}n^3 + ${d})*n^3`, label: 'aₙ ÷ (1/n³)', color: 'teal' }], N: 40, y: [0, 1.5] }, caption: 'Each sequence divides aₙ by a candidate benchmark. The right benchmark gives a ratio that levels off at a positive number; the others head to 0 or run off the top.' },
        };
      },
    }),
    num({
      id: 'ratio-c', difficulty: 2,
      gen(r) {
        const a = r.int(2, 7), b = r.intExcept(2, 6, [a]), k = r.int(1, 9), m = r.int(1, 9);
        const c = a / b;
        return {
          prompt: t`Compare $a_n = \dfrac{${a}n^2 + ${k}}{${b}n^4 - n + ${m}}$ with $b_n = \dfrac{1}{n^2}$. Find $c = \displaystyle\lim_{n\to\infty}\frac{a_n}{b_n}$. (Then: what does the test say?)`,
          answer: c, tol: { rel: 1e-3 },
          errors: [{ value: 0, feedback: t`Multiply $a_n$ by $n^2$ (dividing by $b_n = 1/n^2$): the top becomes degree 4, the same as the bottom.` }, { value: b / a, feedback: 'Upside down: the limit is (top leading coefficient)/(bottom leading coefficient).' }],
          hints: [t`$\dfrac{a_n}{b_n} = a_n \cdot n^2 = \dfrac{${a}n^4 + ${k}n^2}{${b}n^4 - n + ${m}}$.`, 'Divide top and bottom by n⁴.'],
          teach: 'Limit comparison: divide the terms, take the limit, and check that it is finite and positive.',
          explain: t`$c = \frac{${a}}{${b}} = ${frac(c)}$, which is finite and positive. Since $\sum\frac1{n^2}$ converges, so does $\sum a_n$.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(${a}n^2 + ${k})/(${b}n^4 - n + ${m})*n^2`, N: 6, termLabel: 'aₙ / bₙ' }, caption: 'The ratio of the terms for n = 1 … 6.' },
        };
      },
    }),
    multi({
      id: 'verdicts', difficulty: 2,
      visual: { type: 'calc-series', params: { view: 'sums', N: { min: 5, max: 60, value: 40 }, presetLabel: 'Series', presets: [{ label: '1/(2ⁿ+n)', term: '1/(2^n + n)' }, { label: 'ln n / n', term: 'ln(n)/n' }, { label: '1/(n²+5n)', term: '1/(n^2 + 5n)' }, { label: 'sin²n / n²', term: 'sin(n)^2/n^2' }, { label: '1/(√n+1)', term: '1/(sqrt(n) + 1)' }] }, caption: 'Partial sums of each series — suggestive, never proof: the comparisons decide.' },
      prompt: 'Which of these series converge? Select all that do.',
      choices: [t`$\displaystyle\sum_{n=1}^\infty \frac{1}{2^n + n}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{\ln n}{n}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{1}{n^2 + 5n}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{\sin^2 n}{n^2}$`, t`$\displaystyle\sum_{n=1}^\infty \frac{1}{\sqrt n + 1}$`],
      answer: [0, 2, 3],
      why: {
        1: t`For $n \ge 3$, $\ln n > 1$, so $\frac{\ln n}{n} > \frac1n$: larger than a divergent series — it diverges.`,
        4: t`Limit comparison with $\frac{1}{\sqrt n}$ gives $c = 1$, and $\sum \frac{1}{\sqrt n}$ diverges ($p = \frac12$).`,
      },
      hints: ['For each, guess a benchmark from the dominant terms, then check the inequality points the useful way.', t`$\frac{1}{2^n + n} < \frac{1}{2^n}$; $\;0 \le \sin^2 n \le 1$.`],
      teach: 'Pick a benchmark by dominant terms, then make sure the comparison runs in the useful direction.',
      explain: t`$\frac{1}{2^n + n} < \frac1{2^n}$ (geometric, converges); $\frac{1}{n^2 + 5n} < \frac{1}{n^2}$; $\frac{\sin^2 n}{n^2} \le \frac1{n^2}$. But $\frac{\ln n}{n} > \frac1n$ for $n \ge 3$ and $\frac{1}{\sqrt n + 1}$ behaves like $\frac{1}{\sqrt n}$ — both diverge.`,
    }),
    mcq({
      id: 'right-answer-wrong-reason', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “$\frac{1}{n + 1} \le \frac{1}{n}$ for every $n$, and $\sum \frac{1}{n}$ diverges, so $\sum \frac{1}{n + 1}$ diverges.” The conclusion is true. What is wrong with the argument?`,
      choices: [
        t`Being smaller than a divergent series proves nothing; use limit comparison with $\frac1n$ ($c = 1$) instead`,
        'Nothing is wrong with it',
        t`$\sum \frac{1}{n+1}$ actually converges`,
        t`The inequality is backwards: $\frac{1}{n+1} \ge \frac{1}{n}$`,
      ],
      answer: 0,
      why: {
        1: t`The same argument would “prove” that $\sum \frac{1}{n^2}$ diverges, since $\frac{1}{n^2} \le \frac1n$ too.`,
        2: t`It is the harmonic series without its first term, $\frac12 + \frac13 + \cdots$, which diverges.`,
        3: t`$n + 1 > n$, so $\frac{1}{n+1} < \frac1n$: the inequality is right. It just points the useless way.`,
      },
      hints: ['Would the same reasoning work for Σ 1/n², which is also smaller than Σ 1/n?', 'Which direction of comparison proves divergence?'],
      teach: 'To prove divergence by comparison you need to be larger than a divergent series, not smaller.',
      explain: t`“Smaller than divergent” carries no information. Correct arguments: $\frac{1}{n+1}\big/\frac1n \to 1$ (limit comparison), or simply note that $\sum_{n\ge1}\frac{1}{n+1}$ is the harmonic series missing its first term.`,
      visual: { type: 'calc-series', params: { view: 'sums', term: '1/(n + 1)', compare: [{ term: '1/n', label: 'Σ 1/n' }, { term: '1/n^2', label: 'Σ 1/n² (also smaller!)', color: 'teal' }], N: 40, showTerms: false }, caption: 'Both Σ 1/(n+1) and Σ 1/n² sit below Σ 1/n — one diverges and one converges.' },
    }),
    mcq({
      id: 'c-zero', difficulty: 3,
      prompt: t`To test $\displaystyle\sum_{n=1}^\infty \frac{\ln n}{n^3}$ you compare with $b_n = \frac{1}{n^2}$ and find $\displaystyle\lim_{n\to\infty}\frac{a_n}{b_n} = \lim_{n\to\infty}\frac{\ln n}{n} = 0$. What follows?`,
      choices: [
        t`It converges: $c = 0$ means $a_n$ is eventually smaller than $b_n$, and $\sum b_n$ converges`,
        t`Nothing: the limit comparison test needs $0 < c < \infty$`,
        t`It diverges, because $\ln n \to \infty$`,
        t`It converges to 0, the value of $c$`,
      ],
      answer: 0,
      why: {
        1: t`That is the basic form of the test. Its extension covers $c = 0$: when $a_n/b_n \to 0$, eventually $a_n < b_n$, so a convergent benchmark still forces convergence.`,
        2: t`$\ln n$ grows, but far more slowly than any power: $\frac{\ln n}{n^3}$ still shrinks faster than $\frac{1}{n^2}$.`,
        3: 'c compares the terms; it is not the sum of anything.',
      },
      hints: [t`If $a_n/b_n \to 0$, then for large $n$, $a_n < b_n$.`, 'Which way does that comparison point, and is the benchmark convergent?'],
      teach: 'If aₙ/bₙ → 0 and Σ bₙ converges, Σ aₙ converges; if aₙ/bₙ → ∞ and Σ bₙ diverges, Σ aₙ diverges.',
      explain: t`For large $n$, $\frac{\ln n}{n} < 1$, i.e. $a_n < \frac{1}{n^2}$; since $\sum\frac1{n^2}$ converges, so does $\sum\frac{\ln n}{n^3}$.`,
      visual: { type: 'calc-series', params: { view: 'sums', term: 'ln(n)/n^3', compare: { term: '1/n^2', label: 'benchmark Σ 1/n²' }, N: 40, y: [0, 1.8] }, caption: 'The series (blue) under the convergent benchmark (dashed).' },
    }),
    num({
      id: 'geometric-bound', difficulty: 2,
      gen(r) {
        const b = r.pick([2, 3, 4]), k = r.int(1, 5);
        const bound = 1 / (b - 1);
        return {
          prompt: t`Since $\dfrac{1}{${b}^n + ${k}} < \dfrac{1}{${b}^n}$, the series $\displaystyle\sum_{n=1}^{\infty}\frac{1}{${b}^n + ${k}}$ converges. What upper bound for its sum does this comparison give?`,
          answer: bound, tol: { rel: 1e-3 },
          errors: [{ value: b / (b - 1), feedback: t`The benchmark starts at $n = 1$: its first term is $\frac1{${b}}$, not 1.` }],
          hints: [t`Sum the benchmark: $\displaystyle\sum_{n=1}^\infty \frac{1}{${b}^n}$ is geometric.`, t`First term $\frac{1}{${b}}$, ratio $\frac{1}{${b}}$.`],
          teach: 'A comparison does more than decide convergence: the benchmark’s sum bounds the sum you could not compute.',
          explain: t`$\displaystyle\sum_{n=1}^\infty \frac{1}{${b}^n} = \frac{1/${b}}{1 - 1/${b}} = \frac{1}{${b - 1}}$, so the sum is less than $${frac(bound)}$.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `1/(${b}^n + ${k})`, compare: { term: `1/${b}^n`, label: `benchmark Σ 1/${b}ⁿ` }, N: 4 }, caption: 'The series (blue) under its geometric benchmark (dashed).' },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-sqrt', difficulty: 2,
      prompt: t`Does $\displaystyle\sum_{n=1}^\infty \frac{1}{\sqrt{n^2 + 1}}$ converge?`,
      choices: [t`No: limit comparison with $\frac1n$ gives $c = 1$, and $\sum \frac1n$ diverges`, t`Yes: its terms are smaller than $\frac1n$`, t`Yes: it is like a p-series with $p = 2$`, 'No: its terms do not go to 0'],
      answer: 0,
      why: { 1: 'Smaller than a divergent series proves nothing.', 2: t`The square root halves the power: $\sqrt{n^2 + 1} \approx n$, so this is like $p = 1$.`, 3: t`$\frac{1}{\sqrt{n^2+1}} \to 0$; the divergence test is silent.` },
      hints: [t`For large $n$, $\sqrt{n^2 + 1} \approx n$.`],
      teach: 'Under a square root, powers halve: √(n² + 1) behaves like n.',
      explain: t`$\frac{1/\sqrt{n^2+1}}{1/n} = \frac{n}{\sqrt{n^2 + 1}} \to 1$, a finite positive limit, and $\sum\frac1n$ diverges, so this series diverges too.`,
    }),
    mcq({
      id: 'cp-verdict', difficulty: 2,
      prompt: t`Does $\displaystyle\sum_{n=1}^\infty \frac{n^2 + 1}{n^4 + 3n}$ converge?`,
      choices: [t`Yes: it behaves like $\frac{1}{n^2}$ (limit comparison, $c = 1$)`, t`No: it behaves like $\frac{1}{n}$`, 'No: the top grows without bound', 'Yes: the divergence test shows it'],
      answer: 0,
      why: { 1: t`Dominant terms: $\frac{n^2}{n^4} = \frac{1}{n^2}$, not $\frac1n$.`, 2: 'The bottom grows faster, so the terms shrink like 1/n².', 3: 'The divergence test can never show convergence.' },
      hints: ['Keep only the dominant powers top and bottom.'],
      teach: 'Dominant terms set the benchmark; a p-series with p > 1 then settles convergence.',
      explain: t`$\frac{a_n}{1/n^2} = \frac{n^4 + n^2}{n^4 + 3n} \to 1$, and $\sum\frac{1}{n^2}$ converges, so the series converges.`,
    }),
    num({
      id: 'cp-network', difficulty: 3, transfer: true,
      gen(r) {
        const R0 = r.pick([10, 50, 100, 220]);
        const bound = (Math.PI ** 2 / 6) / R0;
        return {
          prompt: t`An idealised network connects infinitely many resistors in parallel; the $n$-th has resistance $R_n = (n^2 + 1)\times${R0}\ \Omega$. Conductances in parallel add, so the total conductance is $G = \displaystyle\sum_{n=1}^\infty \frac{1}{R_n}$. Compare with $\sum\frac{1}{n^2} = \frac{\pi^2}{6}$: what upper bound does that give for $G$?`,
          answer: bound, units: 'S', tol: { rel: 0.005 },
          errors: [{ value: 1 / (2 * R0), feedback: t`That is only the first resistor’s conductance. Sum the comparison series: $\frac{1}{${R0}}\cdot\frac{\pi^2}{6}$.` }, { value: (Math.PI ** 2 / 6) * R0, feedback: t`Conductance is 1/resistance: divide by the ${R0} Ω, do not multiply.` }],
          hints: [t`$\dfrac{1}{R_n} = \dfrac{1}{${R0}}\cdot\dfrac{1}{n^2 + 1} < \dfrac{1}{${R0}}\cdot\dfrac{1}{n^2}$.`, t`So $G < \dfrac{1}{${R0}}\cdot\dfrac{\pi^2}{6}$ siemens.`],
          teach: 'Comparison turns an infinite sum you cannot do into a guaranteed bound — here, a finite conductance for an infinite network.',
          explain: t`$G < \dfrac{1}{${R0}}\cdot\dfrac{\pi^2}{6} \approx ${tex(bound, 3)}$ S, so the equivalent resistance is more than $${fmt(1 / bound, 3)}\ \Omega$. (The exact sum, $\frac{\pi\coth\pi - 1}{2${R0 === 1 ? '' : '\\cdot ' + R0}} \approx ${tex((Math.PI / Math.tanh(Math.PI) - 1) / 2 / R0, 3)}$ S, needs more than comparison.)`,
          visual: { type: 'calc-series', params: { view: 'terms', term: '1/(n^2 + 1)', termLabel: 'conductance of resistor n, × R₀', compare: { term: '1/n^2', label: 'comparison 1/n²' }, N: 10, zero: true }, caption: t`The conductance of each resistor in units of $1/R_0$, each below the comparison value $1/n^2$.` },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.4 Comparison tests', url: 'https://openstax.org/books/calculus-volume-2/pages/5-4-comparison-tests' }],
});
