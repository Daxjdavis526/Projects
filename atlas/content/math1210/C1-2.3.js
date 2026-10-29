// One-sided limits and infinite limits — approaching from one side only, and
// the language for values that grow without bound (vertical asymptotes).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt, frac, tex } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1210.C1-2.3',
  title: 'One-sided limits and infinite limits',
  minutes: 9, difficulty: 2,
  intro: t`Sometimes a function can only be approached from one side, or does different things on each side. The **left-hand limit** $\lim_{x\to a^-} f(x)$ uses only $x < a$; the **right-hand limit** $\lim_{x\to a^+} f(x)$ only $x > a$. The two-sided limit exists exactly when both do and agree:

$$\lim_{x\to a} f(x) = L \iff \lim_{x\to a^-} f(x) = L = \lim_{x\to a^+} f(x)$$

If the values grow without bound we write $\lim f = +\infty$ (or $-\infty$): the limit does not exist as a number, but it fails in a useful, specific way, and the line $x = a$ is a **vertical asymptote**. The Lorentz factor $\gamma = 1/\sqrt{1 - v^2/c^2}$ is the physicist’s example: as $v \to c^-$, $\gamma \to +\infty$, and nothing with mass gets to $c$.`,
  symbols: [
    { tex: 'x \\to a^-', text: '$x$ approaches $a$ from the **left**, through values less than $a$' },
    { tex: 'x \\to a^+', text: '$x$ approaches $a$ from the **right**, through values greater than $a$' },
    { tex: 'L', text: 'the common value of the two one-sided limits, when they agree' },
    { tex: '+\\infty', text: '“grows without bound”: a description of how the limit fails to exist, not a number' },
  ],
  why: t`Physics is full of one-sided approaches: speeds approach $c$ from below, distances approach a horizon or a point charge from outside, and switches jump at an instant.`,
  visual: {
    type: 'graph',
    title: 'The Lorentz factor as v approaches c',
    lead: t`The curve is $\gamma(\beta) = 1/\sqrt{1 - \beta^2}$, with $\beta = v/c$. Push the speed slider toward $1$ and watch $\gamma$ and how far you still are from $c$.`,
    tasks: [
      t`Set $\beta = 0.9$, $0.99$, $0.999$: $\gamma$ goes $2.29$, $7.09$, $22.4$ — each extra nine roughly triples it.`,
      t`At $\beta = 0.5$, $\gamma$ is only $1.15$: relativity is a small correction until $v$ is a large fraction of $c$.`,
      t`There is no curve to the right of $\beta = 1$: $\gamma$ is undefined there, so only the left-hand limit makes sense, and it is $+\infty$.`,
    ],
    params: {
      x: [-0.03, 1.12], y: [-1, 26], aspect: 'wide', xlabel: 'β = v/c', ylabel: 'γ',
      sliders: [{ key: 'b', label: t`Speed $\beta = v/c$`, min: 0, max: 0.999, step: 0.001, value: 0.6, explain: t`The speed as a fraction of the speed of light.` }],
      curves: [{ fn: '1/sqrt(1 - x^2)', color: 'accent', domain: [0, 0.9993] }],
      points: [{ x: 'b', y: '1/sqrt(1 - b^2)', color: 'gold' }],
      vlines: [{ x: 1, label: 'v = c', color: 'bad' }],
      hlines: [{ y: 1, color: 'ink4' }],
      readouts: [
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`$1 - \beta$`, expr: '1 - b', digits: 3 },
      ],
    },
    caption: t`Special relativity, exact. The vertical asymptote at $\beta = 1$ is approached from the left only; for $\beta > 1$ the square root has no real value.`,
  },
  example: {
    prompt: t`Find the one-sided limits of $f(x) = \dfrac{x + 1}{x^2 - 4}$ at $x = 2$ and at $x = -2$.`,
    visual: { type: 'graph', params: { x: [-5, 5], y: [-6, 6], aspect: 'wide', curves: [{ fn: '(x + 1)/(x^2 - 4)', color: 'accent', domain: [-5, -2.02] }, { fn: '(x + 1)/(x^2 - 4)', color: 'accent', domain: [-1.98, 1.98] }, { fn: '(x + 1)/(x^2 - 4)', color: 'accent', domain: [2.02, 5] }], vlines: [{ x: -2, label: 'x = −2' }, { x: 2, label: 'x = 2' }] }, caption: t`The graph has vertical asymptotes at $x = \pm 2$, where the denominator is zero and the numerator is not.` },
    steps: [
      { label: 'Substitute', text: t`At $x = 2$: numerator $3$, denominator $0$. A nonzero number over something tending to $0$ means the function blows up; the sign decides which way.` },
      { label: 'Sign near 2', text: t`Write $x^2 - 4 = (x - 2)(x + 2)$. Just left of $2$, $x - 2 < 0$ and $x + 2 \approx 4 > 0$, so the denominator is a tiny negative number: $\frac{3}{0^-} \to -\infty$. Just right of $2$ it is tiny and positive: $+\infty$.` },
      { label: 'Sign near −2', text: t`The numerator is $-1$. For $x < -2$ both factors are negative, so the denominator is positive: $\frac{-1}{0^+} \to -\infty$. For $-2 < x < 2$ the denominator is negative: $\frac{-1}{0^-} \to +\infty$.` },
      { label: 'Conclude', text: t`At each point the one-sided limits are infinite with opposite signs, so neither two-sided limit exists, even as $\pm\infty$. Both lines are vertical asymptotes. Check against the graph.` },
    ],
    answer: t`$\lim_{x\to2^-} f = -\infty$, $\lim_{x\to2^+} f = +\infty$; $\lim_{x\to-2^-} f = -\infty$, $\lim_{x\to-2^+} f = +\infty$.`,
  },
  practice: [
    mcq({
      id: 'read-left', difficulty: 1,
      prompt: t`For the function in the graph, what is $\displaystyle\lim_{x\to 1^-} f(x)$?`,
      visual: { type: 'graph', params: { x: [-1, 3], y: [-2.2, 3.2], aspect: 'wide', curves: [{ fn: '2 - 0.6*(x - 1)^2', color: 'accent', domain: [-1, 0.97] }, { fn: '-1 + 0.8*(x - 1)', color: 'accent', domain: [1.03, 3] }], points: [{ x: 1, y: 0.5, color: 'accent', label: 'f(1)' }] }, caption: t`Gaps mark where each piece stops short of $x = 1$; the lone dot is $f(1)$.` },
      choices: ['2', '−1', '0.5', 'It does not exist'],
      answer: 0,
      why: { 1: t`$-1$ is where the right-hand piece is heading. The minus sign in $1^-$ means approach from the left.`, 2: t`$0.5$ is the value $f(1)$, which a limit ignores.`, 3: 'The two-sided limit does not exist, but the left-hand limit does.' },
      hints: [t`Only look at the part of the graph with $x < 1$.`],
      teach: t`The left-hand limit $x \to a^-$ reads the graph only to the left of $a$.`,
      explain: t`Coming from the left, the curve heads for height $2$. From the right it heads for $-1$, so the two-sided limit fails — but the left-hand one is $2$.`,
    }),
    num({
      id: 'jump-size', difficulty: 2,
      gen(r) {
        const c = r.int(1, 3), p = r.int(1, 4), q = r.int(2, 6);
        const L = c * c + p;
        const qq = q * c === L ? q + 1 : q, RR = qq * c;     // never a zero jump
        return {
          prompt: t`Let $f(x) = x^2 + ${p}$ for $x < ${c}$ and $f(x) = ${qq}x$ for $x \ge ${c}$. Find the size of the jump at $x = ${c}$: $\displaystyle\lim_{x\to ${c}^+} f(x) - \lim_{x\to ${c}^-} f(x)$.`,
          answer: RR - L, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: 0, feedback: t`The two pieces are different formulas; evaluate each at $x = ${c}$ before deciding they match.` }],
          hints: [t`From the left use $x^2 + ${p}$; from the right use $${qq}x$. Each is a polynomial, so substitute $x = ${c}$.`],
          teach: 'For a piecewise function, each one-sided limit comes from the piece on that side.',
          explain: t`Right: $${qq}(${c}) = ${RR}$. Left: $${c}^2 + ${p} = ${L}$. The jump is $${RR} - ${L} = ${RR - L}$.`,
          visual: { type: 'graph', params: { x: [c - 2.5, c + 2.5], y: [Math.min(0, L, RR) - 2, Math.max(L, RR, (c + 2.5) * qq) + 1], aspect: 'wide', curves: [{ fn: `x^2 + ${p}`, color: 'accent', domain: [c - 2.5, c - 0.04] }, { fn: `${qq}*x`, color: 'accent', domain: [c, c + 2.5] }], vlines: [{ x: c, color: 'ink4' }] }, caption: t`The two pieces of $f$ meeting (or not) at $x = ${c}$.` },
        };
      },
    }),
    mcq({
      id: 'sign-inf', difficulty: 2,
      prompt: t`Find $\displaystyle\lim_{x\to 3^+}\frac{x - 5}{(x - 3)^2}$.`,
      visual: { type: 'graph', params: { x: [0, 7], y: [-4, 4], aspect: 'wide', curves: [{ fn: 'x - 5', color: 'accent', label: 'numerator x − 5', labelAt: 1.6, labelDx: 6, labelDy: 16 }, { fn: '(x - 3)^2', color: 'gold', label: 'denominator (x − 3)²', labelAt: 4.7, labelDx: 8 }], vlines: [{ x: 3, color: 'ink4' }] }, caption: 'The numerator and the denominator plotted separately — the sign chart you need.' },
      choices: [t`$-\infty$`, t`$+\infty$`, t`$0$`, t`It does not exist, because the left and right limits differ`],
      answer: 0,
      why: { 1: t`The denominator is positive, but the numerator is near $-2$: negative over tiny positive is very negative.`, 2: t`The numerator does not tend to $0$; only the denominator does, so the quotient blows up.`, 3: t`A square is positive on both sides, so both one-sided limits are $-\infty$. The left and right agree here.` },
      hints: ['Find the sign of the numerator and of the denominator near x = 3.', t`Near $3$ the numerator is about $-2$ and $(x - 3)^2$ is a tiny positive number.`],
      teach: 'Nonzero over zero blows up; the signs of numerator and denominator decide whether to +∞ or −∞.',
      explain: t`$\frac{-2}{0^+} \to -\infty$. Because the denominator is squared it is positive from both sides, so the two-sided limit is $-\infty$ as well.`,
    }),
    num({
      id: 'gamma-close', difficulty: 3,
      gen(r) {
        const [what, g] = r.pick([[t`$\gamma = 10$`, 10], [t`$\gamma = 100$`, 100], [t`$\gamma = 1000$`, 1000], [t`a $6.8$ TeV proton at the LHC, $\gamma = 7250$`, 7250]]);
        const ans = 1 - Math.sqrt(1 - 1 / (g * g));
        return {
          prompt: t`How close to $c$ must a particle travel to reach ${what}? Find $1 - \beta$, where $\beta = v/c$ and $\gamma = 1/\sqrt{1 - \beta^2}$.`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 / g, feedback: t`Solve $\gamma = 1/\sqrt{1 - \beta^2}$ for $\beta$ first: $\beta = \sqrt{1 - 1/\gamma^2}$.` }],
          hints: [t`$\beta = \sqrt{1 - 1/\gamma^2}$.`, t`For large $\gamma$, $\sqrt{1 - \epsilon} \approx 1 - \epsilon/2$, so $1 - \beta \approx \dfrac{1}{2\gamma^2}$.`],
          teach: t`As $\gamma \to \infty$, $1 - \beta$ shrinks like $1/(2\gamma^2)$: the speed creeps toward $c$ from below and never arrives.`,
          explain: t`$1 - \beta = 1 - \sqrt{1 - 1/${g}^2} = ${tex(ans)}$, very nearly $1/(2\gamma^2)$.`,
          visual: { type: 'graph', params: { x: [0.9, 1.004], y: [0, 50], aspect: 'wide', xlabel: 'β = v/c', ylabel: 'γ', curves: [{ fn: '1/sqrt(1 - x^2)', color: 'accent', domain: [0.9, 0.99978] }], vlines: [{ x: 1, label: 'v = c', color: 'bad' }] }, caption: t`The Lorentz factor for $0.9 \le \beta < 1$; it rises off the top of the picture long before $\beta$ reaches $1$.` },
        };
      },
    }),
    mcq({
      id: 'abs-ratio', difficulty: 2,
      prompt: t`What is $\displaystyle\lim_{x\to 0}\frac{|x|}{x}$?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.8, 1.8], aspect: 'wide', curves: [{ fn: '-1', color: 'accent', domain: [-3, -0.05] }, { fn: '1', color: 'accent', domain: [0.05, 3] }] }, caption: t`$y = |x|/x$: undefined at $x = 0$.` },
      choices: ['It does not exist', '0', '1', '−1'],
      answer: 0,
      why: { 1: t`The left side tends to $-1$ and the right side to $+1$; they do not average to a limit.`, 2: 'That is only the right-hand limit.', 3: 'That is only the left-hand limit.' },
      hints: [t`For $x > 0$, $|x| = x$; for $x < 0$, $|x| = -x$.`],
      teach: 'Two different one-sided limits mean no two-sided limit.',
      explain: t`$\lim_{x\to0^-} = -1$ and $\lim_{x\to0^+} = 1$. They differ, so the two-sided limit does not exist.`,
    }),
    multi({
      id: 'blowups', difficulty: 3,
      prompt: t`For which functions is $\displaystyle\lim_{x\to 0^+} f(x) = +\infty$? Select all that apply.`,
      choices: [t`$\dfrac{1}{x}$`, t`$\ln x$`, t`$\dfrac{1}{x^2}$`, t`$e^{1/x}$`, t`$e^{-1/x}$`],
      answer: [0, 2, 3],
      why: { 1: t`$\ln x \to -\infty$ as $x \to 0^+$: logs of tiny numbers are large and negative.`, 4: t`$-1/x \to -\infty$, and $e^{-\infty} \to 0$: this one tends to $0$, extremely flat.` },
      hints: ['Substitute a small positive x such as 0.01 into each.', t`For the exponentials, find the limit of the exponent first: $1/x \to +\infty$ and $-1/x \to -\infty$.`],
      teach: 'Decide an infinite limit by the sign and size of each piece as x → 0⁺.',
      explain: t`$1/x$, $1/x^2$ and $e^{1/x}$ all grow without bound from the right. $\ln x \to -\infty$, and $e^{-1/x} \to 0$.`,
    }),
    num({
      id: 'abs-quad', difficulty: 3,
      gen(r) {
        const a = r.int(1, 5);
        return {
          prompt: t`Find $\displaystyle\lim_{x\to ${a}^-}\frac{x^2 - ${a * a}}{|x - ${a}|}$.`,
          answer: -2 * a, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: 0, feedback: t`$0/0$ is undecided. Remove the absolute value first, using the side you approach from.` }],
          hints: [t`For $x < ${a}$, $|x - ${a}| = -(x - ${a})$.`, t`Then $\dfrac{(x - ${a})(x + ${a})}{-(x - ${a})} = -(x + ${a})$.`],
          teach: 'An absolute value near its zero becomes ±(its inside), depending on the side: one-sided limits handle it cleanly.',
          explain: t`From the left, $|x - ${a}| = ${a} - x$, so the expression is $-(x + ${a}) \to ${-2 * a}$. From the right it tends to $${2 * a}$, so the two-sided limit does not exist.`,
          visual: { type: 'graph', params: { x: [a - 3, a + 3], y: [-2 * a - 4, 2 * a + 4], aspect: 'wide', curves: [{ fn: `-(x + ${a})`, color: 'accent', domain: [a - 3, a - 0.06] }, { fn: `x + ${a}`, color: 'accent', domain: [a + 0.06, a + 3] }], vlines: [{ x: a, color: 'ink4' }] }, caption: t`$y = \frac{x^2 - ${a * a}}{|x - ${a}|}$, which is undefined at $x = ${a}$.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-abs-right', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3, 5]);
        return {
          prompt: t`Find $\displaystyle\lim_{x\to ${c}^+}\frac{|x - ${c}|}{x^2 - ${c * c}}$.`,
          answer: 1 / (2 * c), tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`$0/0$ is undecided. For $x > ${c}$, replace $|x - ${c}|$ by $x - ${c}$ and cancel.` }],
          hints: [t`For $x > ${c}$, $|x - ${c}| = x - ${c}$.`],
          teach: 'On one side of its zero, an absolute value is a plain expression with a fixed sign.',
          explain: t`For $x > ${c}$: $\frac{x - ${c}}{(x - ${c})(x + ${c})} = \frac{1}{x + ${c}} \to \frac{1}{${2 * c}}$.`,
          visual: { type: 'graph', params: { x: [-0.5, 2 * c + 1], y: [-0.8 / c, 0.8 / c], aspect: 'wide', curves: [{ fn: `abs(x - ${c})/(x^2 - ${c * c})`, color: 'accent', domain: [-0.5, c - 0.05] }, { fn: `abs(x - ${c})/(x^2 - ${c * c})`, color: 'accent', domain: [c + 0.05, 2 * c + 1] }], vlines: [{ x: c, color: 'ink4' }] }, caption: t`The function on both sides of $x = ${c}$, where it is undefined.` },
        };
      },
    }),
    mcq({
      id: 'cp-horizon', difficulty: 3, transfer: true,
      prompt: t`A clock hovering at radius $r$ outside a non-rotating black hole runs slow compared with a distant clock by the factor $\dfrac{1}{\sqrt{1 - r_s/r}}$, where $r_s$ is the Schwarzschild radius (the horizon). What is $\displaystyle\lim_{r\to r_s^+}\frac{1}{\sqrt{1 - r_s/r}}$?`,
      visual: { type: 'graph', params: { x: [0, 6], y: [0, 6], aspect: 'wide', xlabel: 'r / rₛ', ylabel: 'slow-down factor', curves: [{ fn: '1/sqrt(1 - 1/x)', color: 'accent', domain: [1.03, 6] }], vlines: [{ x: 1, label: 'horizon', color: 'bad' }], hlines: [{ y: 1, color: 'ink4' }] }, caption: t`The factor for hovering clocks, from the Schwarzschild solution. Hovering needs ever stronger rockets near the horizon, and no static clock exists inside it. A freely falling observer notices nothing special at the horizon.` },
      choices: [t`$+\infty$: a clock hovering ever closer to the horizon runs ever slower`, t`$1$`, t`$0$`, t`$-\infty$, because $r - r_s$ is negative`],
      answer: 0,
      why: { 1: t`$1$ is the limit far away, as $r \to \infty$.`, 2: t`As $r \to r_s^+$, $1 - r_s/r \to 0^+$; one over a tiny positive root is huge, not $0$.`, 3: t`The approach is from outside, $r > r_s$, so $r - r_s > 0$ and $1 - r_s/r$ is a small positive number.` },
      hints: [t`For $r$ slightly bigger than $r_s$, is $1 - r_s/r$ small and positive, or negative?`, t`$\sqrt{0^+} \to 0^+$, and $1/0^+ \to +\infty$.`],
      teach: 'A one-sided infinite limit names both the side of approach and the direction of blow-up.',
      explain: t`For $r > r_s$, $0 < 1 - r_s/r \to 0^+$, so the factor $\to +\infty$. This is the gravitational redshift that makes a hovering source near a horizon fade from view.`,
    }),
    mcq({
      id: 'cp-sign', difficulty: 2,
      prompt: t`Find $\displaystyle\lim_{x\to -1^-}\frac{x - 2}{x + 1}$.`,
      visual: { type: 'graph', params: { x: [-4, 3], y: [-5, 3], aspect: 'wide', curves: [{ fn: 'x - 2', color: 'accent', label: 'numerator x − 2', labelAt: -3.6, labelDy: 16 }, { fn: 'x + 1', color: 'gold', label: 'denominator x + 1', labelAt: 1.2, labelDx: 10 }], vlines: [{ x: -1, color: 'ink4' }] }, caption: 'The numerator and denominator plotted separately.' },
      choices: [t`$+\infty$`, t`$-\infty$`, t`$-\tfrac32$`, 'It does not exist, even as ±∞'],
      answer: 0,
      why: { 1: t`To the left of $-1$ the denominator is *negative*: negative over negative is positive.`, 2: t`The numerator is $-3$ there, but the denominator is $-1 + 1 = 0$, not $2$ (a sign slip). Nonzero over something tending to $0$ blows up.`, 3: t`The two-sided limit fails, but the one-sided limit asked for is $+\infty$.` },
      hints: [t`Near $x = -1$ the numerator is about $-3$.`, t`For $x < -1$, $x + 1$ is a tiny *negative* number.`],
      teach: 'Fix the sign of each factor on the side of approach, then read off ±∞.',
      explain: t`$\frac{-3}{0^-} \to +\infty$. (From the right it is $-\infty$.)`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §2.2 The limit of a function', url: 'https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function' },
    { label: 'CERN: LHC Run 3 beam energy (6.8 TeV)', url: 'https://home.cern/news/news/accelerators/large-hadron-collider-run-3-physics-unprecedented-energy' },
  ],
});
