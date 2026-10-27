// Sequences and their limits: what it means for an infinite list to settle down.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;

// the first n with |a(n) − L| < eps, by brute force (the gaps used here shrink monotonically)
function firstInside(a, L, eps) {
  for (let n = 1; n < 1e7; n++) if (Math.abs(a(n) - L) < eps) return n;
  return null;
}

export default lesson({
  id: 'math1220.C2-4.1',
  title: 'Sequences and their limits',
  minutes: 11, difficulty: 2,
  intro: t`A **sequence** is an infinite list of numbers $a_1, a_2, a_3, \dots$, usually given by a formula for the $n$-th term. It **converges** to a limit $L$ when its terms get close to $L$ *and stay close*:

$$\lim_{n\to\infty} a_n = L$$

means: for every tolerance $\varepsilon > 0$, however small, there is an index $N$ beyond which every term lies within $\varepsilon$ of $L$. If no such $L$ exists the sequence **diverges** — by growing without bound or by never settling. Every infinite series in this module is judged by the limit of a sequence, and every iterative computation in physics — an orbit propagator, Newton’s method, a time-stepping simulation — is a sequence you hope converges.`,
  symbols: [
    { tex: t`a_n`, text: 'the $n$-th term of the sequence: a formula in $n$, or a rule for getting it from earlier terms' },
    { tex: t`n`, text: 'the index: a positive integer, $1, 2, 3, \\dots$ — never a fraction in between' },
    { tex: t`L`, text: 'the limit: the single number the terms close in on (if there is one)' },
    { tex: t`\varepsilon`, text: 'a tolerance: how close counts as close. The definition must work for **every** $\\varepsilon > 0$' },
    { tex: t`N`, text: 'an index after which every term is within $\\varepsilon$ of $L$; a smaller $\\varepsilon$ usually needs a larger $N$' },
  ],
  why: t`A series converges exactly when its sequence of partial sums does, so every convergence test that follows is a statement about a limit like this one.`,
  visual: {
    type: 'calc-series',
    title: 'Does the sequence settle into the band?',
    lead: t`Each dot is a term $a_n$. The green band holds every number within $\varepsilon$ of the limit $L$; dots inside it turn green. A sequence converges to $L$ when, however thin you make the band, the dots eventually enter it **and never leave**.`,
    tasks: [
      'Shrink ε: the dots take longer to settle into the band (the readout gives the index), but they always do.',
      'Switch to sin(n)/n: it wobbles, but it is squeezed between −1/n and 1/n, which both head to 0.',
      'Switch to (−1)ⁿn/(n+1): it keeps jumping between near 1 and near −1, so no band around a single number can hold it.',
    ],
    params: {
      view: 'terms', eps: 'eps',
      N: { min: 5, max: 60, value: 40, label: 'Terms shown $N$' },
      sliders: [{ key: 'eps', label: 'Tolerance $\\varepsilon$', min: 0.01, max: 0.5, step: 0.01, value: 0.2, explain: 'The half-width of the green band around the limit.' }],
      presetLabel: 'Sequence',
      presets: [
        { label: '(2n+1)/(n+3)', term: '(2n + 1)/(n + 3)', limit: 2, y: [0.5, 2.5] },
        { label: '(1+1/n)ⁿ', term: '(1 + 1/n)^n', limit: 'e', limitLabel: 'e', y: [1.9, 2.95] },
        { label: 'sin(n)/n', term: 'sin(n)/n', limit: 0, y: [-0.6, 1.1], compare: [{ term: '1/n', label: '±1/n', color: 'warn' }, { term: '-1/n', label: '', color: 'warn' }] },
        { label: '(−1)ⁿ n/(n+1)', term: '(-1)^n*n/(n + 1)', limit: null, y: [-1.3, 1.3], join: true },
      ],
    },
    caption: t`Only the first $N$ terms can be drawn, and the readout checks the band only up to the last term the slider allows. The definition is about **every** term beyond some point — infinitely many — which no picture can show; that is why limits are proved with algebra, not with plots.`,
  },
  example: {
    prompt: t`Find $\displaystyle\lim_{n\to\infty}\frac{3n^2 - n}{2n^2 + 5}$, then find the first index after which every term is within $\varepsilon = 0.01$ of the limit.`,
    visual: {
      type: 'calc-series',
      params: {
        view: 'terms', term: '(3n^2 - n)/(2n^2 + 5)', limit: 1.5, eps: 'eps', y: [0.2, 1.7],
        N: { min: 10, max: 80, value: 80 },
        sliders: [{ key: 'eps', label: 'Tolerance $\\varepsilon$', min: 0.005, max: 0.3, step: 0.005, value: 0.01, explain: 'Half-width of the band around $L = 3/2$.' }],
      },
      caption: 'The terms climb towards 3/2; with ε = 0.01 the readout confirms the index found below.',
    },
    steps: [
      { label: 'Divide by the top power', text: t`Divide numerator and denominator by $n^2$: $\;a_n = \dfrac{3 - 1/n}{2 + 5/n^2}$.` },
      { label: 'Take the limit', text: t`$1/n \to 0$ and $5/n^2 \to 0$, so $a_n \to \dfrac{3}{2}$.` },
      { label: 'Measure the gap', text: t`$a_n - \tfrac32 = \dfrac{2(3n^2 - n) - 3(2n^2 + 5)}{2(2n^2 + 5)} = \dfrac{-2n - 15}{2(2n^2 + 5)}$, so $\left|a_n - \tfrac32\right| = \dfrac{n + 7.5}{2n^2 + 5}$.` },
      { label: 'Solve for the index', text: t`$\dfrac{n + 7.5}{2n^2 + 5} < 0.01 \iff 0.02n^2 - n - 7.45 > 0 \iff n > \dfrac{1 + \sqrt{1.596}}{0.04} \approx 56.6$.` },
      { label: 'Check both sides', text: t`At $n = 56$ the gap is $\frac{63.5}{6277} \approx 0.0101$ (too big); at $n = 57$ it is $\frac{64.5}{6503} \approx 0.0099$. The gap shrinks as $n$ grows, so every term from $n = 57$ on is within 0.01.` },
    ],
    answer: t`$L = \dfrac32$; every term from $n = 57$ on is within $0.01$ of it.`,
  },
  practice: [
    num({
      id: 'rational-limit', difficulty: 1,
      gen(r) {
        const a = r.int(2, 6), c = r.intExcept(2, 5, [a]), b = r.intExcept(-3, 3, [0]), d = r.int(1, 7);
        const L = a / c;
        return {
          prompt: t`Find $\displaystyle\lim_{n\to\infty}\frac{${a}n^2 ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}n}{${c}n^2 + ${d}}$. Give a decimal or a fraction.`,
          answer: L, tol: { rel: 0.002 },
          errors: [{ value: b / d, feedback: 'That is the ratio of the lower-order coefficients — what matters as n grows is the highest power.' }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`Divide the top and the bottom by $n^2$, the highest power.`, t`Every term with $n$ left in a denominator goes to 0.`],
          teach: 'For a ratio of polynomials in n, the limit is decided by the highest powers top and bottom.',
          explain: t`Dividing by $n^2$: $\dfrac{${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}/n}{${c} + ${d}/n^2} \to \dfrac{${a}}{${c}} = ${frac(L)} \approx ${fmt(L, 4)}$.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(${a}n^2 + (${b})n)/(${c}n^2 + ${d})`, N: 40, limit: null }, caption: 'The first 40 terms. Where are they heading?' },
        };
      },
    }),
    multi({
      id: 'geometric', difficulty: 2,
      visual: { type: 'calc-series', params: { view: 'terms', N: { min: 5, max: 60, value: 30 }, presetLabel: 'Sequence', presets: [{ label: '0.9ⁿ', term: '0.9^n' }, { label: '(−0.9)ⁿ', term: '(-0.9)^n' }, { label: '(−1)ⁿ', term: '(-1)^n' }, { label: '1.01ⁿ', term: '1.01^n' }, { label: '(−1)ⁿ/n', term: '(-1)^n/n' }] }, caption: 'Each choice, term by term. A picture of finitely many terms suggests an answer; the rule for rⁿ decides it.' },
      prompt: 'Which of these sequences converge? Select all that do.',
      choices: [t`$a_n = 0.9^n$`, t`$a_n = (-0.9)^n$`, t`$a_n = (-1)^n$`, t`$a_n = 1.01^n$`, t`$a_n = \dfrac{(-1)^n}{n}$`],
      answer: [0, 1, 4],
      why: {
        2: t`$(-1)^n$ jumps between $-1$ and $1$ forever: no single number holds it.`,
        3: t`$1.01^n$ grows without bound — slowly at first, but it doubles about every 70 steps.`,
      },
      hints: [t`For $r^n$: what happens when $|r| < 1$? When $|r| > 1$? When $r = -1$?`, 'Alternating signs do not stop a sequence converging, as long as the size of the terms goes to 0.'],
      teach: 'A geometric sequence rⁿ converges to 0 when |r| < 1, to 1 when r = 1, and diverges otherwise.',
      explain: t`$|0.9| < 1$ and $|-0.9| < 1$, so both go to 0 (the second alternating in sign). $\left|\frac{(-1)^n}{n}\right| = \frac1n \to 0$, so it converges to 0 too. $(-1)^n$ oscillates and $1.01^n \to \infty$.`,
    }),
    num({
      id: 'e-limit', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, -1, 0.5]);
        const inner = k === -1 ? t`1 - \frac{1}{n}` : k === 0.5 ? t`1 + \frac{1}{2n}` : t`1 + \frac{${k}}{n}`;
        const ek = k === -1 ? t`e^{-1}` : k === 0.5 ? t`e^{1/2}` : t`e^{${k}}`;
        const L = Math.exp(k);
        return {
          prompt: t`Find $\displaystyle\lim_{n\to\infty}\left(${inner}\right)^{n}$ as a decimal.`,
          answer: L, tol: { rel: 0.002 },
          errors: [{ value: 1, feedback: t`“$1^\infty = 1$” is a trap: the base tends to 1 while the exponent grows, and the two effects balance at a finite number other than 1.` }, { value: Math.E, feedback: t`$\left(1 + \frac{1}{n}\right)^n \to e$, but here the numerator is not 1: $\left(1 + \frac{k}{n}\right)^n \to e^k$.` }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`The standard limit is $\left(1 + \frac{k}{n}\right)^n \to e^k$.`, t`Here $k = ${k}$.`],
          teach: 'The limit (1 + k/n)ⁿ → eᵏ is the bridge between compound growth and the exponential function.',
          explain: t`With $k = ${k}$: the limit is $${ek} \approx ${fmt(L, 4)}$. (Take logarithms: $n\ln\left(1 + \frac{k}{n}\right) \to k$.)`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(1 + ${k}/n)^n`, N: 50, limit: null }, caption: 'The first 50 terms — they creep up (or down) to their limit slowly.' },
        };
      },
    }),
    mcq({
      id: 'squeeze', difficulty: 2,
      prompt: t`What is $\displaystyle\lim_{n\to\infty}\frac{\cos n}{\sqrt n}$?`,
      choices: [t`0, because $-\frac{1}{\sqrt n} \le \frac{\cos n}{\sqrt n} \le \frac{1}{\sqrt n}$`, t`It does not exist, because $\cos n$ keeps oscillating`, t`1, because $\cos 0 = 1$`, t`$\infty$, because $\sqrt n \to \infty$`],
      answer: 0,
      why: {
        1: t`$\cos n$ does oscillate, but it is divided by something growing without bound. The oscillation is crushed to zero.`,
        2: t`$n$ is going to infinity, not to 0, so $\cos 0$ is irrelevant.`,
        3: t`$\sqrt n$ is in the denominator: a bounded numerator over a growing denominator shrinks.`,
      },
      hints: [t`$\cos n$ is always between $-1$ and $1$.`, 'Trap the sequence between two simpler sequences with the same limit.'],
      teach: 'The squeeze theorem: a sequence trapped between two sequences with the same limit has that limit too.',
      explain: t`Since $-1 \le \cos n \le 1$, dividing by $\sqrt n > 0$ gives $-\frac1{\sqrt n} \le a_n \le \frac1{\sqrt n}$. Both bounds go to 0, so $a_n \to 0$.`,
      visual: { type: 'calc-series', params: { view: 'terms', term: 'cos(n)/sqrt(n)', N: 60, compare: [{ term: '1/sqrt(n)', label: '±1/√n', color: 'warn' }, { term: '-1/sqrt(n)', label: '', color: 'warn' }] }, caption: 'The sequence (blue) between the two squeezing sequences (dashed).' },
    }),
    num({
      id: 'eps-index', difficulty: 3,
      gen(r) {
        let c, eps;
        do { c = r.pick([5, 7, 9]); eps = r.pick([0.015, 0.007, 0.012, 0.03]); } while (Math.abs((c - 2) / eps - Math.round((c - 2) / eps)) < 1e-9);
        const a = (n) => (2 * n + c) / (n + 1);
        const idx = firstInside(a, 2, eps);
        return {
          prompt: t`The sequence $a_n = \dfrac{2n + ${c}}{n + 1}$ converges to 2. What is the smallest $N$ such that $|a_n - 2| < ${eps}$ for every $n \ge N$?`,
          answer: idx, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: idx - 1, feedback: 'Check that index directly: the gap there is still at least ε. You need the gap strictly smaller.' }, { value: idx + 1, feedback: 'One too many: the term before already lies within ε.' }],
          hints: [t`First simplify the gap: $a_n - 2 = \dfrac{2n + ${c} - 2(n + 1)}{n + 1}$.`, t`$|a_n - 2| = \dfrac{${c - 2}}{n + 1}$, which shrinks as $n$ grows. Solve $\dfrac{${c - 2}}{n + 1} < ${eps}$ for $n$.`, t`$n + 1 > \dfrac{${c - 2}}{${eps}} \approx ${fmt((c - 2) / eps, 5)}$; take the smallest whole $n$ that works.`],
          teach: 'Turning the ε-definition into a number: simplify the gap |aₙ − L|, then solve gap < ε for n.',
          explain: t`$|a_n - 2| = \dfrac{${c - 2}}{n + 1} < ${eps} \iff n + 1 > ${fmt((c - 2) / eps, 5)} \iff n \ge ${idx}$. Since the gap only shrinks, every later term is inside too, so $N = ${idx}$.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(2n + ${c})/(n + 1)`, N: 40, limit: 2 }, caption: 'The first 40 terms closing in on 2 — far too few to see the answer, which is why you compute it.' },
        };
      },
    }),
    num({
      id: 'conjugate', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 5, 6]);
        return {
          prompt: t`Find $\displaystyle\lim_{n\to\infty}\left(\sqrt{n^2 + ${k}n} - n\right)$.`,
          answer: k / 2, tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`“$\infty - \infty = 0$” is not a rule: both terms grow, and their difference can approach anything. Multiply by the conjugate.` }, { value: k, feedback: t`Close — after multiplying by the conjugate the denominator is $\sqrt{n^2 + ${k}n} + n \approx 2n$, not $n$.` }],
          hints: [t`Multiply and divide by the conjugate $\sqrt{n^2 + ${k}n} + n$.`, t`The top becomes $(n^2 + ${k}n) - n^2 = ${k}n$, so $a_n = \dfrac{${k}n}{\sqrt{n^2 + ${k}n} + n}$. Now divide top and bottom by $n$.`],
          teach: 'A difference of two large terms (∞ − ∞) can approach any number; the conjugate turns it into a quotient you can evaluate.',
          explain: t`$\sqrt{n^2 + ${k}n} - n = \dfrac{${k}n}{\sqrt{n^2 + ${k}n} + n} = \dfrac{${k}}{\sqrt{1 + ${k}/n} + 1} \to \dfrac{${k}}{2} = ${nice(k / 2)}$.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `sqrt(n^2 + ${k}n) - n`, N: 40, limit: null }, caption: 'The first 40 terms: neither 0 nor growing.' },
        };
      },
    }),
    mcq({
      id: 'not-the-function', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “$\lim_{x\to\infty}\sin(\pi x)$ does not exist, because $\sin(\pi x)$ oscillates forever. So the sequence $a_n = \sin(\pi n)$ diverges.” What is wrong?`,
      choices: [
        t`Every term is $\sin(\pi n) = 0$, so the sequence converges to 0; a sequence only samples the function at whole numbers`,
        'Nothing: a sequence diverges whenever the matching function has no limit',
        t`The sequence converges to 1, the largest value of $\sin$`,
        t`$\sin(\pi x)$ does have a limit as $x\to\infty$: it is 0`,
      ],
      answer: 0,
      why: {
        1: t`The rule runs one way only: if $f(x) \to L$ then $f(n) \to L$. A function with no limit can still give a convergent sequence, because the integers may miss all its wiggles.`,
        2: t`At every integer the value is exactly 0, never 1.`,
        3: t`Between the integers $\sin(\pi x)$ swings between $-1$ and $1$ forever, so the *function* has no limit; only the sequence does.`,
      },
      hints: [t`Work out $a_1, a_2, a_3$: what is $\sin(\pi)$, $\sin(2\pi)$, $\sin(3\pi)$?`, 'Does a sequence ever look at the function between the integers?'],
      teach: 'If f(x) → L as x → ∞ then f(n) → L, but not conversely: a sequence sees the function only at the integers.',
      explain: t`$\sin(\pi n) = 0$ for every integer $n$, so $a_n = 0, 0, 0, \dots \to 0$. The function oscillates between the integers, which the sequence never visits.`,
      visual: { type: 'graph', params: { x: [0, 8.5], y: [-1.3, 1.3], xlabel: 'x (or n)', ylabel: 'y', curves: [{ fn: 'sin(pi*x)', color: 'ink3', width: 1.6 }], points: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ x: n, y: 0, color: 'accent' })) }, caption: t`Grey: the function $\sin(\pi x)$. Blue: the sequence, which samples it only at whole numbers.` },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rational', difficulty: 2,
      gen(r) {
        const a = r.int(2, 7), c = r.intExcept(2, 5, [a]), b = r.int(1, 9), d = r.int(1, 9);
        const L = -a / c;
        return {
          prompt: t`Find $\displaystyle\lim_{n\to\infty}\frac{${a}n^3 - ${b}n}{${d} - ${c}n^3}$. Give a decimal or a fraction.`,
          answer: L, tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: 'The top and bottom have the same degree, so the limit is the ratio of the leading coefficients — not 0.' }],
          hints: [t`Divide everything by $n^3$.`],
          teach: 'Equal degrees top and bottom: the limit is the ratio of the leading coefficients, sign included.',
          explain: t`Dividing by $n^3$: $\dfrac{${a} - ${b}/n^2}{${d}/n^3 - ${c}} \to \dfrac{${a}}{-${c}} = ${frac(L)} \approx ${fmt(L, 4)}$.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(${a}n^3 - ${b}n)/(${d} - ${c}n^3)`, n0: 2, N: 40 }, caption: 'The terms from n = 2 to 41.' },
        };
      },
    }),
    mcq({
      id: 'cp-diverges', difficulty: 2,
      prompt: 'Which of these sequences diverges?',
      choices: [t`$a_n = (-1)^n\,\dfrac{n}{n + 1}$`, t`$a_n = \dfrac{(-1)^n}{n}$`, t`$a_n = n\sin\dfrac1n$`, t`$a_n = \left(1 + \dfrac2n\right)^n$`],
      answer: 0,
      why: {
        1: t`$\left|\frac{(-1)^n}{n}\right| = \frac1n \to 0$, so it converges to 0.`,
        2: t`$n\sin\frac1n = \dfrac{\sin(1/n)}{1/n} \to 1$, the limit $\frac{\sin x}{x} \to 1$ with $x = 1/n$.`,
        3: t`$\left(1 + \frac2n\right)^n \to e^2$.`,
      },
      hints: ['Look for a sequence whose terms keep jumping between two different values.'],
      teach: 'An alternating sign is harmless when the size of the terms goes to 0, and fatal when it does not.',
      explain: t`For large $n$, $\frac{n}{n+1} \approx 1$, so $(-1)^n\frac{n}{n+1}$ is close to $+1$ for even $n$ and $-1$ for odd $n$ — two different values, so there is no limit.`,
    }),
    num({
      id: 'cp-euler-limit', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([0.5, 1, 2, 3]);
        const L = Math.exp(-m);
        return {
          prompt: t`A capacitor discharges by $\dfrac{dQ}{dt} = -\dfrac{Q}{\tau}$. Euler’s method with $n$ equal steps up to time $t = ${nice(m)}\tau$ gives $Q_n = Q_0\left(1 - \dfrac{${nice(m)}}{n}\right)^n$. As you take more and more steps, what does the fraction $Q_n/Q_0$ approach?`,
          answer: L, tol: { rel: 0.002 },
          errors: [{ value: 1, feedback: t`“$1^\infty = 1$” is the trap: the base tends to 1 while the exponent grows without bound.` }, { value: 0, feedback: t`Each factor is less than 1, but they approach 1 as $n$ grows; the product settles at a positive number.` }],
          hints: [t`Use $\left(1 + \frac{k}{n}\right)^n \to e^k$.`, t`Here $k = -${nice(m)}$.`],
          teach: 'Euler’s method for exponential decay converges, as the step count grows, to the exact exponential: (1 − k/n)ⁿ → e^{−k}.',
          explain: t`$\left(1 - \frac{${nice(m)}}{n}\right)^n \to e^{-${nice(m)}} \approx ${fmt(L, 4)}$ — exactly $Q(t)/Q_0$ for the true solution $Q = Q_0e^{-t/\tau}$. More steps, less error.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `(1 - ${m}/n)^n`, n0: 4, N: 40 }, caption: 'The Euler estimates Qₙ/Q₀ for n = 4 to 43 steps.' },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.1 Sequences', url: 'https://openstax.org/books/calculus-volume-2/pages/5-1-sequences' }],
});
