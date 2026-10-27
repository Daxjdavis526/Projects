// Infinite series as limits of partial sums; the geometric series.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

export default lesson({
  id: 'math1220.C2-4.3',
  title: 'Series, partial sums and geometric series',
  minutes: 12, difficulty: 2,
  intro: t`An **infinite series** $\sum a_n = a_1 + a_2 + a_3 + \cdots$ is not a sum you can finish. It is defined through its **partial sums** $S_N = a_1 + \cdots + a_N$: the series **converges** to $S$ when the sequence $S_1, S_2, S_3, \dots$ converges to $S$, and otherwise it diverges. The one series you can always sum exactly is the **geometric series**, where each term is the previous one times a fixed ratio $r$:

$$\sum_{n=0}^{\infty} a\,r^n = a + ar + ar^2 + \cdots = \frac{a}{1 - r} \qquad \text{when } |r| < 1$$

For $|r| \ge 1$ it diverges. Geometric series give the total distance of a bouncing ball, the steady level of a drug taken in repeated doses, and the resolution of Zeno’s paradox — and, in the next module, every power series is built on them.`,
  symbols: [
    { tex: t`a`, text: 'the first term (the $n = 0$ term)' },
    { tex: t`r`, text: 'the **common ratio**: each term divided by the one before. Its size decides everything' },
    { tex: t`S_N`, text: t`the $N$-th **partial sum**: the total of the first $N$ terms. For a geometric series, $S_N = a\dfrac{1 - r^N}{1 - r}$ ($r \neq 1$)` },
    { tex: t`\sum_{n=0}^{\infty}`, text: 'add the terms for $n = 0, 1, 2, \\dots$ forever — meaning: take the limit of the partial sums' },
    { tex: t`\frac{a}{1 - r}`, text: 'the **sum** $S$: the limit of $S_N$, which exists exactly when $|r| < 1$' },
  ],
  why: t`Every convergence question in this module is a question about partial sums, and the geometric series is the yardstick the comparison and ratio tests measure everything else against.`,
  visual: {
    type: 'calc-series',
    title: 'Partial sums of a geometric series',
    lead: t`The violet bars are the terms $a, ar, ar^2, \dots$; the blue dots are the partial sums — each one is the previous dot plus the next bar. When $|r| < 1$ the dots close in on the green line, $\dfrac{a}{1 - r}$.`,
    tasks: [
      'Set r = 0.5: each bar is half the last, and the partial sums close in on a/(1 − r) = 2a.',
      'Set r = −0.5: the bars alternate in sign and the partial sums zig-zag around the sum, now a/1.5.',
      'Push r to 1 or beyond: the bars stop shrinking, the dots run off the chart, and there is no sum.',
    ],
    params: {
      view: 'sums', term: 'a*r^(n-1)', limit: 'a/(1 - r)', limitWhen: '1 - abs(r)', y: [-2, 8.5],
      N: { min: 1, max: 30, value: 8, label: 'Terms added $N$' },
      sliders: [
        { key: 'a', label: 'First term $a$', min: 0.5, max: 2, step: 0.1, value: 1, explain: 'The first bar.' },
        { key: 'r', label: 'Ratio $r$', min: -1.1, max: 1.1, step: 0.05, value: 0.5, explain: 'Each term is the previous one times $r$.' },
      ],
    },
    caption: t`The green line appears only when $|r| < 1$, where the sum exists. Only $N$ terms can be drawn; convergence is a statement about all the rest, which is why the formula, not the picture, decides it.`,
  },
  example: {
    prompt: t`A ball is dropped from 2 m and each bounce reaches 60% of the height before. Ignoring air resistance, how far does it travel in total?`,
    visual: { type: 'calc-series', params: { view: 'sums', term: '4*0.6^(n-1) - 2*0^(n-1)', limit: 8, limitLabel: 'total', N: { min: 1, max: 20, value: 10 }, y: [0, 9] }, caption: 'Bars: the drop, then each up-and-down trip. Dots: the distance travelled so far, closing in on 8 m.' },
    steps: [
      { label: 'List the distances', text: t`The first drop is 2 m. After that the ball rises $2(0.6) = 1.2$ m and falls 1.2 m, then $0.72$ m up and down, and so on: $\;D = 2 + 2(1.2) + 2(0.72) + 2(0.432) + \cdots$` },
      { label: 'Spot the geometric series', text: t`After the first drop, the terms $2.4, 1.44, 0.864, \dots$ form a geometric series with first term $2.4$ and ratio $r = 0.6$.` },
      { label: 'Sum it', text: t`$|r| = 0.6 < 1$, so $\;2.4 + 1.44 + \cdots = \dfrac{2.4}{1 - 0.6} = 6$ m.` },
      { label: 'Add the first drop', text: t`$D = 2 + 6 = 8$ m.` },
      { label: 'Sense check', text: t`The partial sums $2, 4.4, 5.84, 6.70, \dots$ climb towards 8. The bounce times form a geometric series too (ratio $\sqrt{0.6}$), so the infinitely many bounces finish in about 5.0 s — a real ball stops sooner, because it does not keep exactly 60% of its height on tiny bounces.` },
    ],
    answer: t`8 m in total.`,
  },
  practice: [
    num({
      id: 'geo-sum', difficulty: 1,
      gen(r) {
        const a = r.int(1, 6), [p, q] = r.pick([[1, 2], [1, 3], [-1, 2], [2, 3], [-1, 3], [3, 4], [-2, 5]]);
        const ratio = p / q, S = a / (1 - ratio);
        return {
          prompt: t`Find $\displaystyle\sum_{n=0}^{\infty} ${a}\left(${frac(ratio)}\right)^n$.`,
          answer: S, tol: { rel: 1e-4 },
          errors: [{ value: a / (1 + ratio), feedback: t`The formula is $\frac{a}{1 - r}$; with $r = ${frac(ratio)}$ watch the sign.` }, { value: (a * ratio) / (1 - ratio), feedback: t`The series starts at $n = 0$, so its first term is $${a}\cdot(${frac(ratio)})^0 = ${a}$.` }].filter((e) => Math.abs(e.value - S) > 1e-3 * Math.abs(S)),
          hints: [t`Identify the first term $a$ (the $n = 0$ term) and the ratio $r$.`, t`$a = ${a}$, $r = ${frac(ratio)}$, and $|r| < 1$, so the sum is $\frac{a}{1 - r}$.`],
          teach: 'A geometric series with |r| < 1 sums to (first term)/(1 − ratio).',
          explain: t`$\dfrac{${a}}{1 - (${frac(ratio)})} = ${frac(S)}${Number.isInteger(S) ? '' : t` \approx ${fmt(S, 4)}`}$.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `${a}*(${ratio})^n`, n0: 0, N: 12, showTerms: true }, caption: 'The first 12 partial sums.' },
        };
      },
    }),
    num({
      id: 'geo-later-start', difficulty: 2,
      gen(r) {
        const c = r.int(2, 5), ratio = r.pick([0.4, 0.5, 0.2, 0.25]), k = r.pick([2, 3]);
        const first = c * ratio ** k, S = first / (1 - ratio);
        return {
          prompt: t`Find $\displaystyle\sum_{n=${k}}^{\infty} ${c}\,(${ratio})^n$.`,
          answer: S, tol: { rel: 1e-3 },
          errors: [{ value: c / (1 - ratio), feedback: t`That sums from $n = 0$. Here the first term is the $n = ${k}$ term, $${c}(${ratio})^{${k}}$.` }, { value: c * ratio / (1 - ratio), feedback: t`That starts at $n = 1$; this series starts at $n = ${k}$.` }],
          hints: [t`The formula is (first term)/(1 − ratio) — whatever index the series starts at.`, t`The first term is $${c}(${ratio})^{${k}} = ${nice(first)}$.`],
          teach: 'For a geometric series starting anywhere, the sum is (first term actually present)/(1 − r).',
          explain: t`First term $${c}(${ratio})^{${k}} = ${nice(first)}$, ratio ${ratio}: $\;\dfrac{${nice(first)}}{1 - ${ratio}} = ${fmt(S, 4)}$.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `${c}*${ratio}^n`, n0: k, N: 10 }, caption: t`Partial sums starting from the $n = ${k}$ term.` },
        };
      },
    }),
    mcq({
      id: 'which-diverges', difficulty: 2,
      prompt: 'Which of these geometric series diverges?',
      choices: [t`$\displaystyle\sum_{n=0}^{\infty}\left(\frac{3}{e}\right)^n$`, t`$\displaystyle\sum_{n=0}^{\infty}(-0.99)^n$`, t`$\displaystyle\sum_{n=0}^{\infty}5\left(\frac{\pi}{4}\right)^n$`, t`$\displaystyle\sum_{n=1}^{\infty}\frac{10}{2^n}$`],
      answer: 0,
      why: {
        1: t`$|r| = 0.99 < 1$: it converges (to $\frac{1}{1.99}$), even though the terms alternate and shrink slowly.`,
        2: t`$\frac{\pi}{4} \approx 0.785 < 1$, so it converges; the 5 in front only scales the sum.`,
        3: t`$r = \frac12$: it converges, to 10.`,
      },
      hints: ['For each series find |r| and compare it with 1.', t`$e \approx 2.718$, so $\frac{3}{e} \approx 1.10$.`],
      teach: 'A geometric series converges exactly when |r| < 1; the first term and the sign of r do not matter.',
      explain: t`$\frac{3}{e} \approx 1.104 > 1$, so the terms grow and the series diverges. The others have $|r| = 0.99$, $0.785$ and $0.5$, all below 1.`,
    }),
    num({
      id: 'repeating', difficulty: 2,
      gen(r) {
        let d;
        do { d = r.int(10, 98); } while (d % 11 === 0);
        const g = gcd(d, 99), p = d / g, q = 99 / g;
        const dd = String(d).padStart(2, '0');
        return {
          prompt: t`Write the repeating decimal $0.${dd}${dd}${dd}\ldots$ (the block “${dd}” repeating forever) as a fraction.`,
          answer: d / 99, tol: { rel: 1e-7 },
          errors: [{ value: d / 100, feedback: 'That is only the first block. The rest of the blocks add more.' }],
          hints: [t`$0.${dd}${dd}\ldots = \dfrac{${d}}{100} + \dfrac{${d}}{100^2} + \dfrac{${d}}{100^3} + \cdots$`, t`A geometric series with first term $\frac{${d}}{100}$ and ratio $\frac{1}{100}$.`],
          teach: 'A repeating decimal is a geometric series in disguise, with ratio 1/10 to the length of the repeating block.',
          explain: t`$\dfrac{${d}/100}{1 - 1/100} = \dfrac{${d}}{99}${g > 1 ? t` = \dfrac{${p}}{${q}}` : ''}$. (Type it as ${p}/${q}; a decimal has to be exact to 7 digits.)`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `${d}/100^n`, N: 6, showTerms: false, y: [0, 1] }, caption: 'Partial sums 0.dd, 0.dddd, …: they settle after a couple of terms.' },
        };
      },
    }),
    num({
      id: 'partial', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), ratio = r.pick([2, 3, 0.5, -2]), N = r.pick([5, 6]);
        const S = (a * (1 - ratio ** N)) / (1 - ratio);
        return {
          prompt: t`Find the partial sum $S_{${N}} = \displaystyle\sum_{n=1}^{${N}} ${a}\,(${ratio})^{n-1}$ (the first ${N} terms).`,
          answer: S, tol: { rel: 1e-4 },
          errors: [{ value: a / (1 - ratio), feedback: t`$\frac{a}{1 - r}$ is the sum of *all* the terms (and only exists when $|r| < 1$). A partial sum adds just the first ${N}: $S_N = a\frac{1 - r^N}{1 - r}$.` }, { value: (a * (1 - ratio ** (N + 1))) / (1 - ratio), feedback: 'One term too many — count the terms from n = 1.' }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - S) > 1e-3 * Math.abs(S)),
          hints: [t`Use $S_N = a\dfrac{1 - r^N}{1 - r}$, or simply add the ${N} terms.`, t`Here $a = ${a}$, $r = ${ratio}$, $N = ${N}$.`],
          teach: 'Every partial sum is finite — even of a divergent series; divergence is about the limit of the partial sums.',
          explain: t`$S_{${N}} = ${a}\cdot\dfrac{1 - (${ratio})^{${N}}}{1 - (${ratio})} = ${nice(S)}$.${Math.abs(ratio) >= 1 ? t` The partial sums are perfectly good numbers, but they grow without bound: the series itself diverges.` : ''}`,
        };
      },
    }),
    num({
      id: 'doses', difficulty: 3,
      gen(r) {
        const D = r.pick([100, 200, 250]), f = r.pick([0.2, 0.25, 0.4, 0.5]), T = r.pick([6, 8, 12]);
        const peak = D / (1 - f);
        return {
          prompt: t`A patient takes ${D} mg of a drug every ${T} hours. By the time of the next dose, only ${Math.round(f * 100)}% of the drug in the body remains. After many doses, how much drug is in the body **just after** a dose?`,
          answer: peak, units: 'mg', tol: { rel: 0.005 },
          errors: [{ value: D, feedback: 'The earlier doses have not all gone: some of each one is still there when the next arrives.' }, { value: (D * f) / (1 - f), feedback: t`That is the level just *before* a dose (the trough). Just after, add the new ${D} mg.` }],
          hints: [t`Just after the $N$-th dose the amount is $${D} + ${D}(${f}) + ${D}(${f})^2 + \cdots + ${D}(${f})^{N-1}$.`, t`As $N \to \infty$ that is a geometric series with first term ${D} and ratio ${f}.`],
          teach: 'Repeated doses with first-order elimination build up to a steady level given by a geometric series.',
          explain: t`$${D}\left(1 + ${f} + ${f}^2 + \cdots\right) = \dfrac{${D}}{1 - ${f}} = ${fmt(peak, 4)}$ mg. The level rises dose by dose towards this value but never exceeds it.`,
          visual: { type: 'calc-series', params: { view: 'sums', term: `${D}*${f}^(n-1)`, N: 10 }, caption: 'Dots: the amount just after doses 1, 2, 3, …; bars: what is left of each separate dose.' },
        };
      },
    }),
    mcq({
      id: 'minus-one', difficulty: 3, kind: 'error',
      prompt: t`A student writes: $\;1 + 2 + 4 + 8 + \cdots = \displaystyle\sum_{n=0}^{\infty} 2^n = \frac{1}{1 - 2} = -1.$ What is wrong?`,
      choices: [
        t`The formula $\frac{a}{1-r}$ needs $|r| < 1$; here $r = 2$ and the partial sums $1, 3, 7, 15, \dots$ grow without bound`,
        t`Only the sign: the sum is $+1$`,
        t`The formula is $\frac{a}{1 + r}$, so the sum is $\frac13$`,
        'Nothing: it is a famous result, and adding positive numbers can give a negative total',
      ],
      answer: 0,
      why: {
        1: 'Any finite answer is wrong: the partial sums pass every number.',
        2: t`$\frac{a}{1 - r}$ is the right formula — when it applies. Here it does not.`,
        3: t`Positive terms give increasing partial sums: they can only diverge to $+\infty$ or converge to a positive number. (Results like “−1” come from other, non-standard summation methods, not from limits of partial sums.)`,
      },
      hints: ['Write out the partial sums.', t`The derivation of $\frac{a}{1-r}$ uses $r^N \to 0$. Does $2^N \to 0$?`],
      teach: 'Check |r| < 1 before using a/(1 − r); the formula comes from rᴺ → 0.',
      explain: t`$S_N = 2^N - 1 \to \infty$, so the series diverges. The formula $S = \frac{a}{1 - r}$ is derived from $S_N = a\frac{1 - r^N}{1 - r}$ by letting $r^N \to 0$, which happens only when $|r| < 1$.`,
      visual: { type: 'calc-series', params: { view: 'sums', term: '2^(n-1)', N: 8, y: [-2, 260] }, caption: 'The partial sums 1, 3, 7, 15, … run away.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-geo', difficulty: 2,
      gen(r) {
        const c = r.int(2, 6), [p, q] = r.pick([[-2, 3], [-1, 2], [1, 3], [-3, 4], [2, 5]]);
        const ratio = p / q, first = c * ratio, S = first / (1 - ratio);
        return {
          prompt: t`Find $\displaystyle\sum_{n=1}^{\infty} ${c}\left(${frac(ratio)}\right)^n$.`,
          answer: S, tol: { rel: 1e-3 },
          errors: [{ value: c / (1 - ratio), feedback: t`That sum starts at $n = 0$. This one starts at $n = 1$, with first term $${c}\cdot${frac(ratio)}$.` }],
          hints: ['First term over one minus the ratio — the first term is the n = 1 term.'],
          teach: 'Find the first term that is actually present before using a/(1 − r).',
          explain: t`First term $${frac(first)}$, ratio $${frac(ratio)}$: $\;\dfrac{${frac(first)}}{1 - (${frac(ratio)})} = ${frac(S)}${Number.isInteger(S) ? '' : t` \approx ${fmt(S, 4)}`}$.`,
        };
      },
    }),
    num({
      id: 'cp-bounce', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([1, 1.5, 2, 3]), f = r.pick([0.5, 0.6, 0.75, 0.8]);
        const D = (h * (1 + f)) / (1 - f);
        return {
          prompt: t`A test capsule dropped from ${h} m onto a pad rebounds to ${Math.round(f * 100)}% of its previous height on every bounce. Treating the bounces as continuing forever, what total distance does it travel?`,
          answer: D, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: h / (1 - f), feedback: 'Each rebound height is travelled twice — up and down — except the first drop.' }, { value: (2 * h) / (1 - f), feedback: 'The first drop happens only once: it is not a round trip.' }],
          hints: [t`$D = ${h} + 2\left(${h}(${f}) + ${h}(${f})^2 + \cdots\right)$.`, t`The bracket is geometric: first term $${nice(h * f)}$, ratio ${f}.`],
          teach: 'In a bouncing problem, every height after the first drop is travelled twice.',
          explain: t`$D = ${h} + 2\cdot\dfrac{${nice(h * f)}}{1 - ${f}} = ${fmt(D, 4)}$ m.`,
        };
      },
    }),
    num({
      id: 'cp-zeno', difficulty: 3, transfer: true,
      gen(r) {
        const t1 = r.pick([20, 30, 40, 60]), q = r.pick([0.5, 0.6, 0.75]);
        const T = t1 / (1 - q);
        return {
          prompt: t`A docking autopilot closes the gap to a space station in a sequence of burns. Each burn closes most of the remaining gap, and each lasts ${Math.round(q * 100)}% as long as the one before; the first lasts ${t1} s. Infinitely many burns are planned — how long do they take in total?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: t1 / q, feedback: t`Divide by $1 - r$, not by $r$.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: ['The burn times form a geometric series.', t`First term ${t1} s, ratio ${q}.`],
          teach: 'Infinitely many steps can take a finite total time when the durations form a convergent geometric series — Zeno’s paradox resolved.',
          explain: t`$${t1} + ${t1}(${q}) + ${t1}(${q})^2 + \cdots = \dfrac{${t1}}{1 - ${q}} = ${nice(T)}$ s. (Real autopilots stop after a few burns, once the gap is inside the docking tolerance.)`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.2 Infinite series', url: 'https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series' }],
});
