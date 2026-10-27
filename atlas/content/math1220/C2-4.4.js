// The divergence (n-th term) test, the harmonic series, and telescoping series.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const GAMMA = 0.5772156649015329;
const harmonic = (N) => { let s = 0; for (let n = 1; n <= N; n++) s += 1 / n; return s; };
const firstAbove = (k) => { let s = 0, n = 0; while (s < k) { n++; s += 1 / n; } return n; };

export default lesson({
  id: 'math1220.C2-4.4',
  title: 'The divergence test and telescoping series',
  minutes: 11, difficulty: 2,
  intro: t`If a series converges, its terms must shrink to zero: each term is the gap between two partial sums, $a_n = S_n - S_{n-1}$, and both partial sums approach the same $S$. Turned around, that is the **divergence test**:

$$\sum a_n \text{ converges} \;\Longrightarrow\; \lim_{n\to\infty} a_n = 0, \qquad\text{so}\qquad \lim_{n\to\infty} a_n \neq 0 \;\Longrightarrow\; \sum a_n \text{ diverges}$$

It works **one way only**. The harmonic series $1 + \frac12 + \frac13 + \cdots$ has terms that go to 0 and still diverges. For a few special series you can find the partial sums exactly: in a **telescoping** series each term cancels part of the next, so $\sum (b_n - b_{n+1})$ collapses to $b_1 - \lim b_{N+1}$.`,
  symbols: [
    { tex: t`a_n`, text: 'the $n$-th term of the series' },
    { tex: t`S_N`, text: 'the $N$-th partial sum $a_1 + \\cdots + a_N$; the series converges when $S_N$ does' },
    { tex: t`\lim_{n\to\infty} a_n`, text: 'where the **terms** are heading — a different question from where the **sum** is heading' },
    { tex: t`b_n - b_{n+1}`, text: 'a telescoping term: consecutive terms cancel, leaving $S_N = b_1 - b_{N+1}$' },
  ],
  why: t`Checking that the terms go to zero is the first move in every convergence problem — and the harmonic series is the standard warning that it is never the last.`,
  visual: {
    type: 'calc-series',
    title: 'Terms that shrink, sums that do not',
    lead: t`Violet bars are the terms, blue dots the partial sums. Compare where the bars are heading with where the dots are heading — they are different questions.`,
    tasks: [
      'Harmonic series: the bars shrink towards 0, yet the dots keep climbing, following ln n + γ. Terms going to 0 is not enough.',
      'Telescoping 1/(n(n+1)): the partial sums are exactly 1 − 1/(N+1), closing in on 1.',
      'n/(n+1): the bars approach 1, not 0, so the sums grow by about 1 per term — the divergence test catches this at once.',
    ],
    params: {
      view: 'sums',
      N: { min: 1, max: 100, value: 40, label: 'Terms added $N$' },
      presetLabel: 'Series',
      presets: [
        { label: 'harmonic 1/n', term: '1/n', limit: null, y: [-0.2, 6], guide: { fn: 'ln(n) + 0.5772', label: 'ln n + γ (grows forever)' } },
        { label: '1/(n(n+1))', term: '1/(n(n + 1))', limit: 1, y: [-0.05, 1.2] },
        { label: 'n/(n+1)', term: 'n/(n + 1)', limit: null },
        { label: 'ln(n/(n+1))', term: 'ln(n/(n + 1))', limit: null, y: [-5, 0.3], guide: { fn: '-ln(n + 1)', label: '−ln(N + 1), exactly' } },
      ],
    },
    caption: t`The harmonic sums grow like $\ln N + \gamma$, with $\gamma \approx 0.5772$ (Euler’s constant). Passing 10 takes 12 367 terms; adding a billion terms a second for the age of the universe would bring the sum only to about 62 — yet every number is passed eventually. No finite picture can show divergence; the arguments below do.`,
  },
  example: {
    prompt: t`Find the sum of $\displaystyle\sum_{n=1}^{\infty}\frac{2}{n^2 + 2n}$.`,
    visual: { type: 'calc-series', params: { view: 'sums', term: '2/(n^2 + 2n)', limit: 1.5, N: { min: 1, max: 40, value: 12 }, y: [0, 1.7] }, caption: 'The partial sums 1 + 1/2 − 1/(N+1) − 1/(N+2) closing in on 3/2.' },
    steps: [
      { label: 'Check the terms', text: t`$\dfrac{2}{n^2 + 2n} \to 0$, so the divergence test says nothing. We need the partial sums.` },
      { label: 'Partial fractions', text: t`$\dfrac{2}{n(n + 2)} = \dfrac{1}{n} - \dfrac{1}{n + 2}$.` },
      { label: 'Write out the partial sum', text: t`$S_N = \left(1 - \tfrac13\right) + \left(\tfrac12 - \tfrac14\right) + \left(\tfrac13 - \tfrac15\right) + \cdots + \left(\tfrac1N - \tfrac{1}{N+2}\right)$.` },
      { label: 'Cancel', text: t`Every $-\frac{1}{k}$ cancels a $+\frac1k$ two terms later. What survives: $S_N = 1 + \tfrac12 - \dfrac{1}{N + 1} - \dfrac{1}{N + 2}$.` },
      { label: 'Take the limit', text: t`As $N \to \infty$ the last two terms vanish: $S = 1 + \tfrac12 = \tfrac32$.` },
      { label: 'Check', text: t`$S_{10} = 1.5 - \tfrac1{11} - \tfrac1{12} \approx ${fmt(1.5 - 1 / 11 - 1 / 12, 4)}$, and adding the ten terms directly gives the same.` },
    ],
    answer: t`$\displaystyle\sum_{n=1}^{\infty}\frac{2}{n^2 + 2n} = \frac32$.`,
  },
  practice: [
    mcq({
      id: 'one-way', difficulty: 1,
      prompt: t`For a series $\sum a_n$ you find $\lim_{n\to\infty} a_n = 0$. What does the divergence test tell you?`,
      choices: ['Nothing: the series may converge or diverge', 'The series converges', 'The series diverges', 'The series converges to 0'],
      answer: 0,
      why: {
        1: t`The harmonic series has $a_n = \frac1n \to 0$ and diverges. Terms going to 0 is necessary, not sufficient.`,
        2: 'The test can only ever prove divergence, and only when the terms do not go to 0.',
        3: t`The limit of the terms is not the sum. $\sum \frac{1}{2^n} = 1$ although $\frac{1}{2^n} \to 0$.`,
      },
      hints: ['The test says: if the terms do not go to 0, the series diverges. What does it say when they do?'],
      teach: 'The divergence test can prove divergence; it can never prove convergence.',
      explain: t`The theorem is “converges ⇒ terms → 0”. Its contrapositive is the test. “Terms → 0 ⇒ converges” is the converse, which is false: $\sum \frac1n$ diverges and $\sum\frac1{n^2}$ converges, and both have terms going to 0.`,
    }),
    multi({
      id: 'which-fail', difficulty: 2,
      prompt: 'Which of these series does the divergence test show to diverge? Select all.',
      choices: [t`$\displaystyle\sum_{n=1}^\infty \cos\frac1n$`, t`$\displaystyle\sum_{n=1}^\infty \left(1 + \frac1n\right)^n$`, t`$\displaystyle\sum_{n=1}^\infty n\sin\frac1n$`, t`$\displaystyle\sum_{n=1}^\infty \frac{1}{\sqrt n}$`, t`$\displaystyle\sum_{n=1}^\infty e^{-n}$`],
      answer: [0, 1, 2],
      why: {
        3: t`$\frac{1}{\sqrt n} \to 0$, so the test is silent. (This series does diverge — but the test cannot show it; the integral test will.)`,
        4: t`$e^{-n} \to 0$, so the test is silent; this one is a convergent geometric series.`,
      },
      hints: ['Find the limit of each term. The test applies only when that limit is not 0.', t`$\cos\frac1n \to \cos 0$; $\left(1 + \frac1n\right)^n \to e$; $n\sin\frac1n = \frac{\sin(1/n)}{1/n}$.`],
      teach: 'Apply the divergence test by computing the limit of the terms: anything other than 0 means divergence.',
      explain: t`The terms tend to $\cos 0 = 1$, to $e$, and to 1, so those three series diverge. For $\frac1{\sqrt n}$ and $e^{-n}$ the terms go to 0 and the test says nothing.`,
    }),
    num({
      id: 'telescope-sum', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), m = r.int(1, 4), c = k * m;
        let Hk = 0; for (let j = 1; j <= k; j++) Hk += 1 / j;
        const S = m * Hk;
        const tail = k === 1 ? t`\frac{1}{N+1}` : k === 2 ? t`\frac{1}{N+1} - \frac{1}{N+2}` : t`\frac{1}{N+1} - \frac{1}{N+2} - \frac{1}{N+3}`;
        const head = k === 1 ? '1' : k === 2 ? t`1 + \tfrac12` : t`1 + \tfrac12 + \tfrac13`;
        return {
          prompt: t`Find $\displaystyle\sum_{n=1}^{\infty}\frac{${c}}{n(n + ${k})}$.`,
          answer: S, tol: { rel: 1e-4 },
          errors: [{ value: c, feedback: t`Partial fractions first: $\frac{${c}}{n(n+${k})} = ${m === 1 ? '' : m}\left(\frac1n - \frac{1}{n+${k}}\right)$${k > 1 ? ' — the cancellation skips ' + (k - 1) + ' term' + (k > 2 ? 's' : '') + ', so more than one term survives' : ''}.` }, { value: m, feedback: t`Only the first term survives when consecutive terms cancel; here they cancel ${k} apart, so ${k} terms survive.` }].filter((e) => Math.abs(e.value - S) > 1e-3 * S),
          hints: [t`Partial fractions: $\dfrac{${c}}{n(n + ${k})} = ${m === 1 ? '' : m}\left(\dfrac1n - \dfrac{1}{n + ${k}}\right)$.`, t`Write out $S_N$: everything cancels except $${m === 1 ? '' : m}\left(${head}\right)$ at the start and ${k} small terms at the end, which go to 0.`],
          teach: 'In a telescoping series, write out the partial sum, cancel, and see what survives at the two ends.',
          explain: t`$S_N = ${m === 1 ? '' : m}\left(${head} - ${tail}\right) \to ${frac(S)}${Number.isInteger(S) ? '' : t` \approx ${fmt(S, 4)}`}$.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `${c}/(n*(n + ${k}))`, N: 25 }, caption: 'The first 25 partial sums.' },
        };
      },
    }),
    num({
      id: 'telescope-partial', difficulty: 2,
      gen(r) {
        const N = r.pick([3, 8, 15, 24, 99]);
        const SN = 1 - 1 / Math.sqrt(N + 1);
        return {
          prompt: t`For $\displaystyle\sum_{n=1}^{\infty}\left(\frac{1}{\sqrt n} - \frac{1}{\sqrt{n + 1}}\right)$, find the partial sum $S_{${N}}$.`,
          answer: SN, tol: { rel: 1e-4 },
          errors: [{ value: 1, feedback: 'That is the sum of the whole series. The partial sum keeps the last surviving term.' }, { value: 1 - 1 / Math.sqrt(N), feedback: t`The last term subtracts $\frac{1}{\sqrt{${N} + 1}}$, not $\frac{1}{\sqrt{${N}}}$.` }],
          hints: [t`Write out the first three terms and watch $-\frac{1}{\sqrt2}$ cancel $+\frac{1}{\sqrt2}$.`, t`$S_N = 1 - \dfrac{1}{\sqrt{N + 1}}$.`],
          teach: 'A telescoping partial sum keeps only the first piece of the first term and the last piece of the last term.',
          explain: t`$S_{${N}} = 1 - \dfrac{1}{\sqrt{${N + 1}}} = ${nice(SN)}$. As $N \to \infty$ the series sums to 1.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: '1/sqrt(n) - 1/sqrt(n + 1)', N: Math.min(N + 10, 100), limit: 1, y: [0, 1.1] }, caption: 'The partial sums creep up to 1 — slowly, because the last term is only 1/√(N+1).' },
        };
      },
    }),
    mcq({
      id: 'telescope-trap', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “$\displaystyle\sum_{n=1}^{\infty}\ln\frac{n}{n+1} = \sum_{n=1}^{\infty}\big(\ln n - \ln(n + 1)\big)$ telescopes, so it converges, to $\ln 1 = 0$.” What is wrong?`,
      choices: [
        t`The partial sums are $S_N = -\ln(N + 1) \to -\infty$: the series telescopes, but diverges`,
        t`Nothing: it converges to 0`,
        t`It converges, but to $-\ln 2$, the first term`,
        t`It converges because its terms $\ln\frac{n}{n+1} \to 0$`,
      ],
      answer: 0,
      why: {
        1: t`The surviving end term, $-\ln(N + 1)$, does not go to 0. Telescoping tells you the partial sums, not that they converge.`,
        2: t`$-\ln 2$ is $S_1$, only the first partial sum.`,
        3: t`Terms going to 0 never proves convergence; the harmonic series is the warning.`,
      },
      hints: ['Write out S₃ and cancel.', t`What survives at the far end, and does it go to 0?`],
      teach: 'Telescoping gives the partial sums exactly; the series converges only if the surviving end term has a limit.',
      explain: t`$S_N = \ln 1 - \ln(N + 1) = -\ln(N + 1)$, which decreases without bound. The series diverges to $-\infty$, even though its terms go to 0.`,
      visual: { type: 'calc-series', params: { view: 'sums', term: 'ln(n/(n + 1))', N: 60, y: [-4.5, 0.3] }, caption: 'The partial sums keep falling, like −ln(N + 1).' },
    }),
    num({
      id: 'harmonic-slow', difficulty: 3,
      gen(r) {
        const k = r.pick([10, 15, 20, 25]);
        const est = Math.exp(k - GAMMA);
        return {
          prompt: t`The harmonic partial sums grow like $H_N = 1 + \frac12 + \cdots + \frac1N \approx \ln N + 0.5772$. Estimate how many terms you must add before the partial sum reaches ${k}.`,
          answer: est, tol: { rel: 0.03 },
          errors: [{ value: Math.exp(k), feedback: t`Subtract Euler’s constant first: $\ln N \approx ${k} - 0.5772$.` }, { value: k / 0.5772, feedback: t`Solve $\ln N + 0.5772 = ${k}$ with an exponential: $N = e^{${k} - 0.5772}$.` }],
          hints: [t`Set $\ln N + 0.5772 = ${k}$.`, t`$N = e^{${k} - 0.5772} = e^{${fmt(k - GAMMA, 5)}}$.`],
          teach: 'The harmonic series diverges, but only logarithmically: each extra unit of sum costs about e ≈ 2.7 times as many terms.',
          explain: t`$N \approx e^{${k} - 0.5772} \approx ${fmt(est, 3)}$ terms. The series does diverge — every number is eventually passed — but astonishingly slowly.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: '1/n', N: { min: 10, max: 400, value: 400 }, showTerms: false, guide: { fn: 'ln(n) + 0.5772', label: 'ln n + 0.5772' }, y: [0, 7] }, caption: 'The first few hundred partial sums hug ln N + 0.5772.' },
        };
      },
    }),
    num({
      id: 'apply-test', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6), b = r.int(1, 9), c = r.intExcept(2, 7, [a]), d = r.int(1, 9);
        return {
          prompt: t`For $\displaystyle\sum_{n=1}^{\infty}\frac{${a}n^2 + ${b}}{${c}n^2 + ${d}n}$, compute $\lim_{n\to\infty} a_n$. (Then decide what the divergence test says.)`,
          answer: a / c, tol: { rel: 1e-3 },
          errors: [{ value: 0, feedback: 'Top and bottom have the same degree: the terms approach the ratio of leading coefficients, not 0.' }],
          hints: [t`Divide the top and bottom by $n^2$.`],
          teach: 'Terms with equal degrees top and bottom approach a nonzero constant, so such a series diverges by the divergence test.',
          explain: t`$a_n \to \frac{${a}}{${c}} = ${frac(a / c)} \neq 0$, so the series **diverges** by the divergence test: its partial sums grow by roughly ${fmt(a / c, 3)} per term.`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-verdict', difficulty: 2,
      prompt: t`What can you say about $\displaystyle\sum_{n=1}^{\infty}\frac{2n - 1}{3n + 4}$?`,
      choices: [t`It diverges, because its terms approach $\frac23$, not 0`, t`It converges to $\frac23$`, 'It converges, because its terms are bounded', 'The divergence test is inconclusive'],
      answer: 0,
      why: {
        1: t`$\frac23$ is the limit of the **terms**. A series whose terms approach $\frac23$ adds about $\frac23$ at every step.`,
        2: t`Bounded terms are not enough: $1 + 1 + 1 + \cdots$ has bounded terms.`,
        3: 'Inconclusive only when the terms go to 0. Here they do not.',
      },
      hints: ['Find the limit of the terms.'],
      teach: 'If the terms approach anything other than 0, the series diverges.',
      explain: t`$\frac{2n - 1}{3n + 4} \to \frac23 \neq 0$, so the series diverges by the divergence test.`,
    }),
    num({
      id: 'cp-telescope', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 4, 8]);
        return {
          prompt: t`Find $\displaystyle\sum_{n=2}^{\infty}\frac{${c}}{n^2 - 1}$.`,
          answer: (3 * c) / 4, tol: { rel: 1e-4 },
          errors: [{ value: c, feedback: t`The partial fractions are $\frac{${c}}{n^2-1} = ${c / 2}\left(\frac{1}{n-1} - \frac{1}{n+1}\right)$; the cancellation skips a term, so two terms survive.` }, { value: c / 2, feedback: t`Two terms survive at the start: $\frac{1}{1}$ and $\frac{1}{2}$.` }],
          hints: [t`$\dfrac{1}{n^2 - 1} = \dfrac12\left(\dfrac{1}{n - 1} - \dfrac{1}{n + 1}\right)$.`, t`Write out the terms from $n = 2$: which pieces never cancel?`],
          teach: 'Factor, split into partial fractions, then telescope.',
          explain: t`$${c / 2}\left[\left(1 - \tfrac13\right) + \left(\tfrac12 - \tfrac14\right) + \left(\tfrac13 - \tfrac15\right) + \cdots\right] = ${c / 2}\left(1 + \tfrac12\right) = ${nice((3 * c) / 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-books', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([2, 2.5, 3]);
        const N = firstAbove(2 * k);
        return {
          prompt: t`Identical books of length $L$ are stacked at the edge of a table, each pushed out as far as the centre of mass of everything above it allows. With $N$ books the top one overhangs the table edge by $\dfrac{L}{2}\left(1 + \dfrac12 + \cdots + \dfrac1N\right)$. What is the smallest $N$ for an overhang of at least ${nice(k)}L$? (Use $H_N \approx \ln N + 0.5772$ if you like.)`,
          answer: N, tol: { rel: 0.025 },
          errors: [{ value: firstAbove(k), feedback: t`The overhang is $\frac{L}{2}H_N$, so you need $H_N \ge ${nice(2 * k)}$, not $${nice(k)}$.` }],
          hints: [t`You need $\frac12 H_N \ge ${nice(k)}$, that is $H_N \ge ${nice(2 * k)}$.`, t`$\ln N + 0.5772 \approx ${nice(2 * k)}$ gives $N \approx e^{${fmt(2 * k - GAMMA, 4)}}$.`],
          teach: 'The harmonic series diverges, so a stack of books can overhang as far as you like — at the price of exponentially many books.',
          explain: t`$H_N \ge ${nice(2 * k)}$ first happens at $N = ${N}$ ($H_{${N}} \approx ${fmt(harmonic(N), 5)}$). Because $\sum \frac1n$ diverges, any overhang is possible in principle — in practice friction, wobble and the size of the table win long before.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.2 Infinite series and §5.3 The divergence and integral tests', url: 'https://openstax.org/books/calculus-volume-2/pages/5-3-the-divergence-and-integral-tests' }],
});
