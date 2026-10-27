// Monotone and bounded sequences, and the recursions they tame.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';

const t = String.raw;
const GM = 398600.4418;   // Earth, km^3/s^2

export default lesson({
  id: 'math1220.C2-4.2',
  title: 'Monotone and bounded sequences',
  minutes: 11, difficulty: 3,
  intro: t`Often you cannot find a formula for $a_n$ — only a rule for the next term, $a_{n+1} = f(a_n)$, as in every iterative algorithm. You can still prove it converges. A sequence that only ever moves one way (**monotone**) and can never pass some fixed number (**bounded**) has nowhere to go but to settle down:

$$a_n \le a_{n+1} \le M \ \text{ for every } n \quad\Longrightarrow\quad \lim_{n\to\infty} a_n = L \text{ exists, with } L \le M$$

This **monotone convergence theorem** (and its mirror image for decreasing sequences bounded below) is how you show that a recursion converges *before* you look for its limit. Only then may you solve $L = f(L)$.`,
  symbols: [
    { tex: t`a_n \le a_{n+1}`, text: 'each term is at least the one before: the sequence is **increasing** (monotone). For **decreasing**, flip the inequality' },
    { tex: t`M`, text: 'an **upper bound**: a number no term ever exceeds. The limit is at most $M$ — usually smaller' },
    { tex: t`L`, text: 'the limit — for an increasing sequence, the smallest number that bounds every term' },
    { tex: t`a_{n+1} = f(a_n)`, text: 'a **recursion**: the rule that produces each term from the previous one, starting from $a_1$' },
  ],
  why: t`Every numerical method that iterates — Newton’s method, orbit propagators, solvers that refine a guess — produces a recursive sequence, and this theorem is the first tool for proving that it converges.`,
  visual: {
    type: 'calc-series',
    title: 'Watching a recursion converge',
    lead: t`A **cobweb diagram**: the curve is $y = f(x)$ and the dashed line is $y = x$. From $a_1$ go up to the curve — that height is $a_2 = f(a_1)$ — then across to the diagonal, so that $a_2$ becomes the next input. The gold ticks on the axis are the terms.`,
    tasks: [
      'With √(2 + aₙ), start below 2: the staircase climbs, never past 2 — increasing and bounded, so it converges. Start above 2: it walks down instead.',
      'Switch to Heron’s rule for √2: after the first step, the terms decrease towards √2 — and astonishingly fast.',
      'Switch to cos aₙ: the path spirals in. That sequence is not monotone, yet it converges: monotone and bounded is enough, but not necessary.',
    ],
    params: {
      view: 'cobweb', a1: 's',
      N: { min: 1, max: 20, value: 6, label: 'Terms shown $N$' },
      sliders: [{ key: 's', label: 'Starting value $a_1$', min: 0.5, max: 3.5, step: 0.05, value: 0.5, explain: 'Where the sequence begins.' }],
      presetLabel: 'Rule $a_{n+1} = f(a_n)$',
      presets: [
        { label: '√(2 + aₙ)', rec: 'sqrt(2 + a)', limit: 2, x: [0, 3.6], curveLabel: 'y = √(2 + x)' },
        { label: 'Heron (aₙ + 2/aₙ)/2', rec: '(a + 2/a)/2', limit: 'sqrt(2)', x: [0, 3.6], curveLabel: 'y = (x + 2/x)/2' },
        { label: 'cos aₙ', rec: 'cos(a)', limit: 0.7390851332151607, x: [-1.1, 3.6], curveLabel: 'y = cos x' },
      ],
    },
    caption: t`Where the curve crosses the diagonal, $f(L) = L$: those crossings are the only possible limits. Heron’s rule is Newton’s method for $x^2 = 2$ — the number of correct digits roughly doubles at every step.`,
  },
  example: {
    prompt: t`Show that the sequence $a_1 = 0$, $a_{n+1} = \sqrt{2 + a_n}$ converges, and find its limit.`,
    visual: { type: 'calc-series', params: { view: 'terms', rec: 'sqrt(2 + a)', a1: 0, limit: 2, limitLabel: 'bound and limit', N: 12, y: [0, 2.3], join: true }, caption: 'The first 12 terms: always rising, never reaching 2.' },
    steps: [
      { label: 'Bounded above by 2', text: t`If $a_n < 2$ then $a_{n+1} = \sqrt{2 + a_n} < \sqrt{4} = 2$. Since $a_1 = 0 < 2$, every term is below 2 (by induction).` },
      { label: 'Increasing', text: t`$a_{n+1}^2 - a_n^2 = 2 + a_n - a_n^2 = (2 - a_n)(1 + a_n) > 0$ for $0 \le a_n < 2$, and both terms are non-negative, so $a_{n+1} > a_n$.` },
      { label: 'Apply the theorem', text: t`Increasing and bounded above by 2, so the sequence converges to some limit $L \le 2$. **Only now** is it legitimate to look for $L$.` },
      { label: 'Find the limit', text: t`Let $n \to \infty$ in $a_{n+1} = \sqrt{2 + a_n}$: $L = \sqrt{2 + L}$, so $L^2 - L - 2 = (L - 2)(L + 1) = 0$. The terms are positive, so $L = 2$.` },
      { label: 'Check with numbers', text: t`$a_2 = \sqrt2 \approx 1.414$, $a_3 \approx 1.848$, $a_4 \approx 1.962$, $a_5 \approx 1.990$ — climbing towards 2, and the gap shrinks about fourfold each step.` },
    ],
    answer: t`The sequence is increasing and bounded above by 2, so it converges; its limit is $L = 2$.`,
  },
  practice: [
    mcq({
      id: 'classify', difficulty: 1,
      prompt: t`Describe the sequence $a_n = \dfrac{n}{n + 1}$, $\;n = 1, 2, 3, \dots$`,
      choices: ['Increasing and bounded above by 1, so it converges', 'Increasing, so it diverges to infinity', 'Decreasing and bounded below by 0', 'Bounded but not monotone, so we cannot tell'],
      answer: 0,
      why: {
        1: t`Increasing sequences can converge: $\frac{n}{n+1} = 1 - \frac{1}{n+1}$ is always below 1.`,
        2: t`$a_1 = \frac12$, $a_2 = \frac23$, $a_3 = \frac34$: the terms are growing.`,
        3: t`It is monotone: $1 - \frac{1}{n+1}$ increases, since $\frac{1}{n+1}$ shrinks.`,
      },
      hints: [t`Write $\dfrac{n}{n+1} = 1 - \dfrac{1}{n + 1}$.`],
      teach: 'Rewrite a term to see at a glance whether it rises or falls and what it can never pass.',
      explain: t`$a_n = 1 - \frac{1}{n+1}$: the subtracted part shrinks, so $a_n$ increases, and it stays below 1. By the monotone convergence theorem it converges — here to exactly 1.`,
      visual: { type: 'calc-series', params: { view: 'terms', term: 'n/(n + 1)', N: 20, y: [0, 1.2] }, caption: 'The first 20 terms.' },
    }),
    multi({
      id: 'which-true', difficulty: 2,
      visual: { type: 'calc-series', params: { view: 'terms', join: true, N: 30, presetLabel: 'Test case', presets: [{ label: '(−1)ⁿ', term: '(-1)^n', y: [-1.3, 1.3] }, { label: '(−1)ⁿ/n', term: '(-1)^n/n', y: [-1.1, 0.6] }, { label: 'n/(n+1)', term: 'n/(n + 1)', y: [0, 5.5], compare: { term: '5 + 0*n', label: 'the bound 5', join: true } }] }, caption: 'Three test cases to check each statement against: bounded but not convergent; convergent but not monotone; increasing, bounded by 5, with a limit of 1.' },
      prompt: 'Which statements are true? Select all that are.',
      choices: ['Every bounded, monotone sequence converges', 'Every convergent sequence is bounded', 'Every bounded sequence converges', 'Every convergent sequence is monotone', 'An increasing sequence whose terms are all below 5 converges to 5'],
      answer: [0, 1],
      why: {
        2: t`$(-1)^n$ is bounded (between $-1$ and $1$) and never converges.`,
        3: t`$\frac{(-1)^n}{n}$ converges to 0 while alternating up and down.`,
        4: t`It converges to *something* at most 5. $\frac{n}{n+1}$ is increasing and below 5, and its limit is 1.`,
      },
      hints: ['Test each statement against (−1)ⁿ, (−1)ⁿ/n and n/(n + 1).'],
      teach: 'Monotone plus bounded guarantees convergence; boundedness alone does not, and the bound is not necessarily the limit.',
      explain: t`The theorem is “bounded **and** monotone ⇒ convergent”. Conversely a convergent sequence must be bounded (its terms eventually crowd near $L$), but need not be monotone. A bound is only a ceiling, not the limit.`,
    }),
    num({
      id: 'eventually', difficulty: 2,
      gen(r) {
        const [k, b] = r.pick([[2, 2], [3, 2], [2, 3], [3, 3]]);
        const a = (n) => n ** k / b ** n;
        let m = 1;
        while (!(a(m + 1) < a(m))) m++;                // first n with a_{n+1} < a_n (decreasing from then on)
        const nT = k === 2 ? t`n^2` : t`n^3`;
        return {
          prompt: t`The terms of $a_n = \dfrac{${nT}}{${b}^n}$ rise at first and then fall. From which $n$ on is the sequence decreasing, that is, what is the smallest $n$ with $a_{n+1} < a_n$?`,
          answer: m, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: m + 1, feedback: 'Compare the two neighbouring terms at your answer minus one: the drop already starts there.' }, { value: m - 1, feedback: t`At that $n$ the next term is still larger. Check $\frac{a_{n+1}}{a_n} < 1$.` }],
          hints: [t`Use the ratio: $\dfrac{a_{n+1}}{a_n} = \dfrac{(n+1)^{${k}}}{${b}\,n^{${k}}} = \dfrac{1}{${b}}\left(1 + \dfrac1n\right)^{${k}}$.`, t`The sequence decreases once $\left(1 + \frac1n\right)^{${k}} < ${b}$, that is, $1 + \frac1n < ${b}^{1/${k}} \approx ${fmt(b ** (1 / k), 4)}$.`],
          teach: 'For positive terms, a ratio a_{n+1}/a_n below 1 means the next term is smaller; a sequence that is eventually monotone and bounded still converges.',
          explain: t`$\frac{a_{n+1}}{a_n} = \frac{1}{${b}}\left(1 + \frac1n\right)^{${k}} < 1 \iff n > \frac{1}{${fmt(b ** (1 / k), 4)} - 1} \approx ${fmt(1 / (b ** (1 / k) - 1), 3)}$, so the terms decrease from $n = ${m}$ on: $a_{${m}} = ${fmt(a(m), 4)} > a_{${m + 1}} = ${fmt(a(m + 1), 4)}$. What happens to the first few terms never affects convergence.`,
          visual: { type: 'calc-series', params: { view: 'terms', term: `n^${k}/${b}^n`, N: 15, zero: true }, caption: 'The first 15 terms: a hump, then a steady decline to 0.' },
        };
      },
    }),
    num({
      id: 'fixed-point', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 6, 12, 20]), L = (1 + Math.sqrt(1 + 4 * c)) / 2;
        return {
          prompt: t`The sequence $a_1 = 1$, $a_{n+1} = \sqrt{${c} + a_n}$ is increasing and bounded, so it converges. Find its limit.`,
          answer: L, tol: { rel: 0.001 },
          errors: [{ value: Math.sqrt(c), feedback: t`$\sqrt{${c}}$ leaves out the term inside the root: the limit satisfies $L = \sqrt{${c} + L}$.` }, { value: (1 - Math.sqrt(1 + 4 * c)) / 2, feedback: 'That root is negative, but every term is positive — so the limit cannot be negative.' }],
          hints: [t`Let $n \to \infty$ on both sides: $L = \sqrt{${c} + L}$.`, t`Square: $L^2 - L - ${c} = 0$. Keep the root that fits the terms.`],
          teach: 'Once convergence is known, the limit of a recursion a_{n+1} = f(a_n) solves L = f(L).',
          explain: t`$L^2 = ${c} + L \Rightarrow L^2 - L - ${c} = 0 \Rightarrow L = \frac{1 \pm ${Math.sqrt(1 + 4 * c)}}{2}$. The terms are positive, so $L = ${fmt(L, 4)}$.`,
          visual: { type: 'calc-series', params: { view: 'cobweb', rec: `sqrt(${c} + a)`, a1: 1, N: 8, x: [0, Math.ceil(L + 1.5)] }, caption: t`The cobweb of $a_{n+1} = \sqrt{${c} + a_n}$ from $a_1 = 1$.` },
        };
      },
    }),
    mcq({
      id: 'doubling-trap', difficulty: 3, kind: 'error',
      prompt: t`For $a_1 = 1$, $a_{n+1} = 2a_n$, a student writes: “Let $L = \lim a_n$. Then $L = 2L$, so $L = 0$.” What is wrong?`,
      choices: [
        t`The sequence $1, 2, 4, 8, \dots$ diverges, so there is no $L$; solving $L = f(L)$ only finds a limit that is known to exist`,
        t`$L = 2L$ should give $L = 2$`,
        t`The limit is 1, the first term`,
        'Nothing: the limit is 0',
      ],
      answer: 0,
      why: {
        1: t`$L = 2L$ means $L - 2L = 0$, so $L = 0$ — the algebra is fine. The error is assuming $L$ exists.`,
        2: 'The first term does not determine the limit; the terms double forever.',
        3: t`The terms are $2^{n-1}$, which grow without bound. They do not approach 0.`,
      },
      hints: ['Write out the first five terms.', t`The step “let $L = \lim a_n$” assumes something. What?`],
      teach: 'Solving L = f(L) gives the candidates for a limit, but only after convergence has been established.',
      explain: t`The terms are $1, 2, 4, 8, 16, \dots = 2^{n-1} \to \infty$. Writing $L = \lim a_n$ assumed the limit exists; it does not, so the equation $L = 2L$ says nothing about this sequence. Prove monotone **and bounded** first — here the bound fails.`,
      visual: { type: 'calc-series', params: { view: 'terms', rec: '2a', a1: 1, N: 10, zero: true }, caption: 'The first 10 terms. The “limit” 0 is nowhere near them.' },
    }),
    num({
      id: 'heron', difficulty: 2,
      gen(r) {
        const A = r.pick([3, 5, 7, 10]), x1 = r.pick([1, 2, 4]);
        const step = (x) => (x + A / x) / 2;
        const x2 = step(x1), x3 = step(x2);
        return {
          prompt: t`Heron’s method finds $\sqrt{${A}}$ with $x_{n+1} = \dfrac12\left(x_n + \dfrac{${A}}{x_n}\right)$. Starting from $x_1 = ${x1}$, compute $x_3$ to 4 decimal places.`,
          answer: x3, tol: { rel: 0, abs: 6e-5 },
          errors: [{ value: x2, feedback: 'That is x₂. Apply the rule once more.' }, { value: Math.sqrt(A), feedback: t`That is the limit $\sqrt{${A}}$; $x_3$ is close to it but not equal.` }].filter((e) => Math.abs(e.value - x3) > 6e-5),
          hints: [t`$x_2 = \tfrac12\left(${x1} + \tfrac{${A}}{${x1}}\right) = ${fmt(x2, 6)}$.`, t`Now $x_3 = \tfrac12\left(x_2 + \tfrac{${A}}{x_2}\right)$.`],
          teach: 'A recursion is computed one step at a time, each new term from the one before.',
          explain: t`$x_2 = ${fmt(x2, 6)}$, $x_3 = \tfrac12\left(${fmt(x2, 6)} + \tfrac{${A}}{${fmt(x2, 6)}}\right) = ${x3.toFixed(4)}$. Compare $\sqrt{${A}} = ${Math.sqrt(A).toFixed(6)}$: after the first step the terms decrease towards it and are bounded below by it, so the sequence converges.`,
          visual: { type: 'calc-series', params: { view: 'cobweb', rec: `(a + ${A}/a)/2`, a1: x1, N: 4, x: [0, Math.max(4.5, Math.ceil(x2 + 1))] }, caption: t`The cobweb of Heron’s rule: the curve touches the diagonal at $x = \sqrt{${A}}$.` },
        };
      },
    }),
    mcq({
      id: 'bounded-cycle', difficulty: 3,
      prompt: t`The sequence $a_1 = 0.2$, $a_{n+1} = 3.2\,a_n(1 - a_n)$ stays between 0 and 1 forever. Does it converge?`,
      choices: [
        'No: bounded is not enough — it settles into a cycle, jumping between two values forever',
        'Yes: every bounded sequence converges',
        t`Yes, to $L = 0.6875$, where $f(L) = L$`,
        'No: it grows without bound',
      ],
      answer: 0,
      why: {
        1: t`Bounded sequences can oscillate forever — $(-1)^n$ does. The theorem needs **monotone** as well.`,
        2: t`$L = 0.6875$ does solve $L = 3.2L(1 - L)$, but the terms never approach it: solving $L = f(L)$ finds candidates, not a guarantee.`,
        3: 'The problem says the terms stay between 0 and 1 — and they do.',
      },
      hints: ['Look at the cobweb: does the path close in on one point?', 'Compute a few terms: they alternate between about 0.51 and 0.80.'],
      teach: 'Bounded without monotone guarantees nothing: a bounded recursion can cycle forever.',
      explain: t`The terms approach the two-cycle $0.5130, 0.7995, 0.5130, 0.7995, \dots$ — two different values, so there is no limit. The fixed point $0.6875$ exists but repels nearby terms, because the curve there is steeper than the diagonal (slope $-1.2$).`,
      visual: { type: 'calc-series', params: { view: 'cobweb', rec: '3.2a*(1 - a)', a1: 0.2, N: 30, x: [0, 1] }, caption: 'The cobweb of the logistic map with rate 3.2: the path ends up circling a rectangle.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-limit', difficulty: 2,
      gen(r) {
        const k = r.pick([3, 5, 8]);
        return {
          prompt: t`The sequence $a_1 = 1$, $a_{n+1} = \sqrt{${k}\,a_n}$ is increasing and bounded above by ${k}. Find its limit.`,
          answer: k, tol: { rel: 0.001 },
          errors: [{ value: 0, feedback: t`$L = 0$ solves $L = \sqrt{${k}L}$, but the terms start at 1 and increase, so they cannot approach 0.` }],
          hints: [t`Solve $L = \sqrt{${k}L}$ and keep the root consistent with $a_n \ge 1$.`],
          teach: 'Choose among the solutions of L = f(L) using what you know about the terms.',
          explain: t`$L^2 = ${k}L \Rightarrow L = 0$ or $L = ${k}$. The terms increase from 1, so $L = ${k}$.`,
          visual: { type: 'calc-series', params: { view: 'cobweb', rec: `sqrt(${k}*a)`, a1: 1, N: 8, x: [0, k + 2] }, caption: t`The cobweb of $a_{n+1} = \sqrt{${k}a_n}$ from $a_1 = 1$.` },
        };
      },
    }),
    mcq({
      id: 'cp-ceiling', difficulty: 2,
      prompt: 'An increasing sequence has every term below 10. What can you conclude?',
      choices: [t`It converges to some limit $L \le 10$`, 'It converges to 10', 'It may diverge', 'Nothing, unless it is also decreasing'],
      answer: 0,
      why: { 1: 'The limit is at most 10 but can be smaller: 10 is only a ceiling.', 2: 'Increasing and bounded above is exactly the hypothesis of the monotone convergence theorem.', 3: 'Increasing is one kind of monotone — it is enough.' },
      hints: ['Recall the monotone convergence theorem.'],
      teach: 'An increasing sequence that is bounded above converges, to a limit no larger than the bound.',
      explain: t`By the monotone convergence theorem it converges, and its limit $L$ cannot exceed the bound: $L \le 10$. For example $10 - \frac1n \to 10$ but $5 - \frac1n \to 5$.`,
    }),
    num({
      id: 'cp-orbit-speed', difficulty: 3, transfer: true,
      gen(r) {
        const [rk, name] = r.pick([[6778, 'the International Space Station’s orbit'], [7000, 'a low Earth orbit'], [26560, 'a GPS satellite’s orbit'], [42164, 'geostationary orbit']]);
        const A = GM / rk, v = Math.sqrt(A);
        return {
          prompt: t`A flight computer finds the circular orbital speed $v = \sqrt{GM/r}$ by Heron’s iteration $x_{n+1} = \dfrac12\left(x_n + \dfrac{A}{x_n}\right)$ with $A = GM/r$. For ${name}, $r = ${rk}$ km and $GM = 398\,600\ \text{km}^3/\text{s}^2$. The iteration (from any positive start) converges. What is its limit?`,
          answer: v, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: A, feedback: t`That is $A = GM/r$ itself. The limit solves $L = \tfrac12(L + A/L)$, that is $L^2 = A$.` }, { value: A / 2, feedback: t`Solve $L = \tfrac12(L + A/L)$ for $L$: it gives $L^2 = A$.` }],
          hints: [t`At the limit, $L = \tfrac12\left(L + \dfrac{A}{L}\right)$.`, t`Multiply by $2L$: $2L^2 = L^2 + A$, so $L = \sqrt{A}$ with $A = ${fmt(A, 4)}\ \text{km}^2/\text{s}^2$.`],
          teach: 'The fixed point of Heron’s rule is √A — which is why the flight computer’s iteration returns the square root it needs.',
          explain: t`$L = \sqrt{A} = \sqrt{398\,600/${rk}} = \sqrt{${fmt(A, 4)}} \approx ${fmt(v, 4)}$ km/s.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §5.1 Sequences (bounded and monotone sequences)', url: 'https://openstax.org/books/calculus-volume-2/pages/5-1-sequences' }],
});
