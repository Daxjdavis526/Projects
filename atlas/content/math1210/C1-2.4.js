// Continuity and the Intermediate Value Theorem — no gaps, no jumps, no
// blow-ups, and the existence guarantee that powers every root-finder.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;

// n steps of bisection on [a, b]; returns the final interval and the rows of the search
function bisect(f, a, b, n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const m = (a + b) / 2;
    rows.push({ a, b, m, fm: f(m) });
    if (f(a) * f(m) <= 0) b = m; else a = m;
  }
  return { a, b, mid: (a + b) / 2, rows };
}
const rowsTeX = (rows) => rows.map((q, i) => t`\text{step ${i + 1}: } [${nice(q.a)}, ${nice(q.b)}],\ m = ${nice(q.m)},\ f(m) ${q.fm > 0 ? '>' : '<'} 0`).join(t` \\ `);

export default lesson({
  id: 'math1210.C1-2.4',
  title: 'Continuity and the Intermediate Value Theorem',
  minutes: 10, difficulty: 2,
  intro: t`A function is **continuous at** $a$ when three things hold: $f(a)$ is defined, $\lim_{x\to a} f(x)$ exists, and the two are equal —

$$\lim_{x\to a} f(x) = f(a).$$

Each way of failing has a name: a **removable** discontinuity (a hole, or a misplaced dot), a **jump** (the one-sided limits differ), an **infinite** discontinuity (a vertical asymptote), and an **oscillating** one like $\sin(1/x)$. Polynomials, roots, exponentials, sines and their sums, products, quotients and compositions are continuous wherever they are defined.

The payoff is the **Intermediate Value Theorem (IVT)**: if $f$ is continuous on $[a, b]$ and $N$ lies between $f(a)$ and $f(b)$, then $f(c) = N$ for at least one $c$ in $(a, b)$. A continuous quantity cannot get from one value to another without passing every value between.`,
  symbols: [
    { tex: 'f(a)', text: 'the value of the function at the point — it must exist' },
    { tex: '\\lim_{x\\to a} f(x)', text: 'where $f$ is heading near $a$ — it must exist and equal $f(a)$' },
    { tex: '[a, b]', text: 'in the IVT, the closed interval on which $f$ must be continuous' },
    { tex: 'N', text: 'any target value between $f(a)$ and $f(b)$' },
    { tex: 'c', text: 'a point in $(a, b)$ where $f(c) = N$ — the IVT says one exists, not where' },
  ],
  why: t`Continuity is the hypothesis behind every root-finder, every “it must cross zero somewhere” argument, and the Extreme and Mean Value Theorems to come.`,
  visual: {
    type: 'graph',
    title: 'A level line and a function that may jump',
    lead: t`The function is built from two pieces that meet at $x = 1$; the slider $k$ opens a jump there. The gold line is a level $N$ between $f(0)$ and $f(2)$. The IVT promises the line meets the graph — if $f$ is continuous.`,
    tasks: [
      t`With $k = 0$ the pieces join and $f$ is continuous. Slide $N$ anywhere between $f(0)$ and $f(2)$: the line always meets the curve.`,
      t`Set $k = 1$ and put $N$ near $1.6$, inside the gap: the line passes through the jump without touching the graph. The IVT’s conclusion fails because its hypothesis did.`,
      t`Set $k = -1$: now some levels are met *twice*, once by each piece. The IVT promises at least one $c$, not exactly one.`,
    ],
    params: {
      x: [-0.3, 2.4], y: [-0.6, 4.6], aspect: 'wide',
      sliders: [
        { key: 'k', label: t`Jump $k$ at $x = 1$`, min: -1.5, max: 1.5, step: 0.05, value: 1, explain: t`How far the right-hand piece is shifted up; $k = 0$ makes $f$ continuous.` },
        { key: 'N', label: t`Level $N$`, min: 0, max: 4.2, step: 0.05, value: 1.6, explain: t`The target value the IVT asks about.` },
      ],
      curves: [
        { fn: '0.2 + x^2', color: 'accent', domain: [0, 0.985] },
        { fn: '1.2 + k + 1.5*(x - 1)', color: 'accent', domain: [1, 2] },
      ],
      points: [{ x: 0, y: 0.2, color: 'accent', label: 'f(0)', labelDx: -36 }, { x: 1, y: '1.2 + k', color: 'accent' }, { x: 2, y: '2.7 + k', color: 'accent', label: 'f(2)' }],
      hlines: [{ y: 'N', label: 'N', color: 'gold' }],
      readouts: [
        { label: t`$\lim_{x\to1^-} f$`, expr: '1.2', digits: 3 },
        { label: t`$f(1) = \lim_{x\to1^+} f$`, expr: '1.2 + k', digits: 3 },
        { label: t`$f(2)$`, expr: '2.7 + k', digits: 3 },
      ],
    },
    caption: t`$f(x) = 0.2 + x^2$ on $[0, 1)$ and $f(x) = 1.2 + k + 1.5(x - 1)$ on $[1, 2]$. The small gap drawn before $x = 1$ marks where the left piece stops; it is part of the picture, not of $f$.`,
  },
  example: {
    prompt: t`For which $k$ is $f(x) = \begin{cases} x^2 - k, & x < 2 \\ kx + 1, & x \ge 2 \end{cases}$ continuous everywhere?`,
    visual: { type: 'graph', params: { x: [-1, 4], y: [-2, 7.5], aspect: 'wide', curves: [{ fn: 'x^2 - 1', color: 'accent', domain: [-1, 2] }, { fn: 'x + 1', color: 'gold', domain: [2, 4] }], points: [{ x: 2, y: 3, color: 'accent', label: '(2, 3)' }] }, caption: t`With $k = 1$ the two pieces (blue and gold) meet at $(2, 3)$.` },
    steps: [
      { label: 'Away from the seam', text: t`Each piece is a polynomial, continuous on its own interval. The only question is $x = 2$.` },
      { label: 'Value and right limit', text: t`$f(2) = 2k + 1$, and the right-hand limit is the same, since that piece includes $x = 2$.` },
      { label: 'Left limit', text: t`$\lim_{x\to2^-} (x^2 - k) = 4 - k$.` },
      { label: 'Match', text: t`Continuity needs $4 - k = 2k + 1$, so $3k = 3$ and $k = 1$.` },
      { label: 'Check', text: t`With $k = 1$: left $4 - 1 = 3$, right $2 + 1 = 3$. ✓ The graph has no break.` },
    ],
    answer: t`$k = 1$; then both pieces reach $3$ at $x = 2$.`,
  },
  practice: [
    mcq({
      id: 'removable', difficulty: 1,
      prompt: t`What kind of discontinuity does $f(x) = \dfrac{x^2 - 1}{x - 1}$ have at $x = 1$?`,
      visual: { type: 'graph', params: { x: [-2, 3], y: [-1.5, 4.5], aspect: 'wide', curves: [{ fn: 'x + 1', color: 'accent', domain: [-2, 0.95] }, { fn: 'x + 1', color: 'accent', domain: [1.05, 3] }] }, caption: t`The graph of $f$: a straight line with a hole at $x = 1$.` },
      choices: ['removable', 'jump', 'infinite', 'none: f is continuous at 1'],
      answer: 0,
      why: { 1: 'Both one-sided limits are 2; there is no jump.', 2: t`The numerator vanishes too, so nothing blows up: $f = x + 1$ away from $1$.`, 3: t`$f(1)$ is $0/0$ — undefined — so the first condition of continuity fails.` },
      hints: [t`Factor the numerator. Does the limit at $1$ exist? Is $f(1)$ defined?`],
      teach: 'A removable discontinuity is a point where the limit exists but f is undefined there or has the wrong value.',
      explain: t`$\lim_{x\to1} f = 2$ exists, but $f(1)$ is undefined: a hole. Defining $f(1) = 2$ “removes” it.`,
    }),
    match({
      id: 'classify', difficulty: 2,
      prompt: t`Classify the discontinuity of each function at $x = 0$.`,
      left: [t`$\dfrac{\sin x}{x}$`, t`$\dfrac{|x|}{x}$`, t`$\dfrac{1}{x^2}$`, t`$\sin\!\left(\dfrac1x\right)$`],
      right: ['removable', 'jump', 'infinite', 'oscillating', 'none — continuous'],
      answer: [0, 1, 2, 3],
      hints: ['For each, find the one-sided limits at 0.', t`$\frac{\sin x}{x} \to 1$; $\frac{|x|}{x}$ is $-1$ on the left and $1$ on the right.`],
      teach: 'The one-sided limits classify a discontinuity: equal (removable), finite but different (jump), infinite, or nonexistent through oscillation.',
      explain: t`$\frac{\sin x}{x}$ has limit $1$ but no value: removable. $|x|/x$ goes from $-1$ to $1$: jump. $1/x^2 \to \infty$: infinite. $\sin(1/x)$ oscillates with no limit from either side.`,
    }),
    num({
      id: 'choose-k', difficulty: 2,
      gen(r) {
        const c = r.int(3, 6);
        const k = c * c / (c - 1);
        return {
          prompt: t`Find $k$ so that $f(x) = \begin{cases} x^2 + k, & x < ${c} \\ kx, & x \ge ${c} \end{cases}$ is continuous at $x = ${c}$.`,
          answer: k, tol: { rel: 0.002 },
          errors: [{ value: c * c, feedback: t`Both pieces contain $k$: the equation is $${c * c} + k = ${c}k$, so collect the $k$ terms on one side.` }],
          hints: [t`Left limit: $${c * c} + k$. Value and right limit: $${c}k$.`, t`Solve $${c * c} + k = ${c}k$.`],
          teach: 'At the seam of a piecewise function, continuity means the one-sided limits match the value there.',
          explain: t`$${c * c} + k = ${c}k \Rightarrow ${c - 1}k = ${c * c} \Rightarrow k = ${frac(k)}$.`,
          visual: { type: 'graph', params: { x: [c - 2.5, c + 2], y: [-1, c * c + 4], aspect: 'wide', curves: [{ fn: 'x^2 + 1', color: 'accent', domain: [c - 2.5, c - 0.04] }, { fn: '1*x', color: 'gold', domain: [c, c + 2] }], vlines: [{ x: c, color: 'ink4' }] }, caption: t`The two pieces drawn with $k = 1$: they do not meet at $x = ${c}$. Your $k$ shifts and tilts them until they do.` },
        };
      },
    }),
    num({
      id: 'bisect', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        const f = (x) => x ** 3 - 2 * x - 5;
        const B = bisect(f, 2, 3, n);
        const last = B.rows[n - 1].m;
        return {
          prompt: t`$f(x) = x^3 - 2x - 5$ has $f(2) = -1$ and $f(3) = 16$, so by the IVT it has a root in $(2, 3)$. Apply **${n}** steps of bisection — each step halves the interval, keeping the half on which $f$ changes sign — and give the midpoint of the interval you are left with.`,
          answer: B.mid, tol: { rel: 1e-4 },
          errors: [{ value: last, feedback: t`That is the last midpoint you *tested*. After testing it, the interval is halved; give the midpoint of the new interval.` }],
          hints: [t`Step 1: $m = 2.5$, $f(2.5) = 5.625 > 0$, so the root lies in $[2, 2.5]$.`, t`Keep going: always keep the half whose ends have opposite signs.`],
          teach: 'Bisection uses the IVT repeatedly: a sign change guarantees a root in the half that keeps it.',
          explain: t`$$\begin{aligned} ${rowsTeX(B.rows)} \end{aligned}$$ The interval left is $[${nice(B.a)}, ${nice(B.b)}]$, with midpoint $${nice(B.mid)}$. (The root is $2.0946$.)`,
          visual: { type: 'graph', params: { x: [1.8, 3.1], y: [-4, 18], aspect: 'wide', curves: [{ fn: 'x^3 - 2*x - 5', color: 'accent' }], points: [{ x: 2, y: -1, color: 'gold', label: 'f(2) = −1', labelDy: 16 }, { x: 3, y: 16, color: 'gold', label: 'f(3) = 16', labelAlign: 'right', labelDx: -10 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: t`The starting bracket $[2, 3]$: one end below the axis, one above.` },
        };
      },
    }),
    mcq({
      id: 'ivt-fails', difficulty: 2,
      prompt: t`$f(x) = 1/x$ has $f(-1) = -1$ and $f(1) = 1$. Does the IVT guarantee a $c$ in $(-1, 1)$ with $f(c) = 0$?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-4, 4], aspect: 'wide', curves: [{ fn: '1/x', color: 'accent', domain: [-2, -0.03] }, { fn: '1/x', color: 'accent', domain: [0.03, 2] }], points: [{ x: -1, y: -1, color: 'gold', label: 'f(−1)', labelDy: 16 }, { x: 1, y: 1, color: 'gold', label: 'f(1)' }] }, caption: t`$y = 1/x$ on $[-1, 1]$: it never takes the value $0$.` },
      choices: [t`No: $f$ is not continuous on $[-1, 1]$, so the IVT does not apply — and indeed $1/x$ is never $0$`, t`Yes: $0$ is between $-1$ and $1$`, t`Yes, at $c = 0$`, t`No, because $f$ is decreasing`],
      answer: 0,
      why: { 1: 'That ignores the IVT’s hypothesis: continuity on the whole closed interval.', 2: t`$f(0)$ is undefined; $1/x$ has an infinite discontinuity there.`, 3: t`Decreasing or not is beside the point: the IVT’s hypothesis is continuity on $[-1, 1]$, and $1/x$ breaks it at $0$.` },
      hints: ['Check the hypotheses of the IVT before using its conclusion.'],
      teach: 'The IVT needs continuity on the whole closed interval; one discontinuity is enough to break it.',
      explain: t`$1/x$ is discontinuous at $0 \in [-1, 1]$, so the theorem says nothing. And in fact no $c$ works: $1/c = 0$ has no solution.`,
    }),
    mcq({
      id: 'ivt-existence', difficulty: 2,
      prompt: t`$f$ is continuous on $[0, 4]$ with $f(0) = -2$ and $f(4) = 3$. Which statement **must** be true?`,
      visual: { type: 'graph', params: { x: [-0.3, 4.4], y: [-3, 4.5], aspect: 'wide', curves: [{ fn: '-2 + 1.25*x + 1.8*sin(3*pi*x/4)', color: 'accent', domain: [0, 4] }], points: [{ x: 0, y: -2, color: 'gold', label: '(0, −2)' }, { x: 4, y: 3, color: 'gold', label: '(4, 3)', labelAlign: 'right', labelDx: -10 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'One continuous function with these end values. It is only an example: f could look very different.' },
      choices: [t`$f(c) = 0$ for at least one $c$ in $(0, 4)$`, t`$f(c) = 0$ for exactly one $c$ in $(0, 4)$`, t`$f(1.6) = 0$`, t`$f(2) = 0.5$, halfway between $f(0)$ and $f(4)$`],
      answer: 0,
      why: { 1: 'The example in the picture crosses zero three times. The IVT promises existence, not uniqueness.', 2: t`$1.6$ is where the straight line from $(0, -2)$ to $(4, 3)$ crosses zero. $f$ need not be a straight line.`, 3: t`Nothing forces the midpoint value; in the picture $f(2) = -1.3$.` },
      hints: [t`$0$ lies between $-2$ and $3$. What does the IVT conclude — and what does it not say?`],
      teach: 'The IVT guarantees that a value is reached at least once; it says nothing about how often or where.',
      explain: t`$0$ is between $f(0) = -2$ and $f(4) = 3$, and $f$ is continuous, so some $c \in (0, 4)$ has $f(c) = 0$. The rest are claims about one particular shape of $f$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-k', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4);
        const k = (a * a + 1) / a;
        return {
          prompt: t`Find $k$ so that $f(x) = \begin{cases} kx - 1, & x < ${a} \\ x^2, & x \ge ${a} \end{cases}$ is continuous at $x = ${a}$.`,
          answer: k, tol: { rel: 0.002 },
          errors: [{ value: (a * a - 1) / a, feedback: t`Check the sign when you move the $-1$ across: $${a}k - 1 = ${a * a}$ gives $${a}k = ${a * a + 1}$.` }],
          hints: [t`Set $\lim_{x\to${a}^-}(kx - 1) = ${a}k - 1$ equal to $f(${a}) = ${a * a}$.`],
          teach: 'Match the left limit to the value at the seam.',
          explain: t`$${a}k - 1 = ${a * a} \Rightarrow k = ${frac(k)}$.`,
          visual: { type: 'graph', params: { x: [a - 2.5, a + 1.5], y: [-3, (a + 1.5) ** 2 + 1], aspect: 'wide', curves: [{ fn: 'x - 1', color: 'accent', domain: [a - 2.5, a - 0.04] }, { fn: 'x^2', color: 'gold', domain: [a, a + 1.5] }], vlines: [{ x: a, color: 'ink4' }] }, caption: t`The pieces with $k = 1$, which leaves a jump at $x = ${a}$.` },
        };
      },
    }),
    num({
      id: 'cp-wien', difficulty: 3, transfer: true,
      prompt: t`The peak of a black body’s spectrum sits where $x = hc/(\lambda kT)$ solves $5(1 - e^{-x}) = x$. Let $g(x) = 5(1 - e^{-x}) - x$: $g(4) = 0.908 > 0$ and $g(5) = -0.034 < 0$. Apply **3** steps of bisection to $[4, 5]$ and give the midpoint of the interval you are left with.`,
      visual: { type: 'graph', params: { x: [3.8, 5.2], y: [-0.25, 1.05], aspect: 'wide', curves: [{ fn: '5*(1 - e^(-x)) - x', color: 'accent' }], points: [{ x: 4, y: 0.908, color: 'gold', label: 'g(4)' }, { x: 5, y: -0.0337, color: 'gold', label: 'g(5)', labelAlign: 'right', labelDx: -10, labelDy: 16 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: t`$g(x) = 5(1 - e^{-x}) - x$ on the starting bracket.` },
      answer: 4.9375, tol: { rel: 2e-4 },
      errors: [{ value: 4.875, feedback: t`That is the third midpoint you tested. After testing it, the interval shrinks to $[4.875, 5]$; give the midpoint of that.` }, { value: 4.965, feedback: t`That is the root itself. The question asks where three bisection steps leave you.` }],
      hints: [t`$g(4.5) = 0.444 > 0$: the root is in $[4.5, 5]$.`, t`$g(4.75) = 0.207 > 0$, then $g(4.875) = 0.087 > 0$.`],
      teach: 'Each bisection step uses the IVT on the half-interval with a sign change.',
      explain: t`$[4, 5] \to [4.5, 5] \to [4.75, 5] \to [4.875, 5]$, midpoint $4.9375$. The true root $x = 4.965$ gives Wien’s law $\lambda_{\max}T = hc/(4.965\,k) = 2.898\ \text{mm K}$ — the Sun’s $5772$ K surface peaks near $502$ nm.`,
    }),
    num({
      id: 'cp-patch', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5, 0.5, 4]);
        return {
          prompt: t`$f(x) = \dfrac{\sin(${k}x)}{x}$ is undefined at $x = 0$. What value should $f(0)$ be given to make $f$ continuous there?`,
          answer: k, tol: { rel: 0.002 },
          errors: [{ value: 0, feedback: t`$0/0$ is not $0$. The value must equal the limit as $x \to 0$.` }, ...(k !== 1 ? [{ value: 1, feedback: t`$\frac{\sin\theta}{\theta} \to 1$, but here the angle is $${k}x$ while the denominator is only $x$.` }] : [])],
          hints: [t`Write $\dfrac{\sin(${k}x)}{x} = ${k}\cdot\dfrac{\sin(${k}x)}{${k}x}$.`],
          teach: 'A removable discontinuity is repaired by defining the value to be the limit.',
          explain: t`$\lim_{x\to0}\frac{\sin(${k}x)}{x} = ${k}\cdot 1 = ${k}$, so set $f(0) = ${k}$.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-1.5, k + 1], aspect: 'wide', curves: [{ fn: `sin(${k}*x)/x`, color: 'accent', domain: [-3, -0.06] }, { fn: `sin(${k}*x)/x`, color: 'accent', domain: [0.06, 3] }] }, caption: t`$y = \sin(${k}x)/x$, with its hole at $x = 0$.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §2.4 Continuity', url: 'https://openstax.org/books/calculus-volume-1/pages/2-4-continuity' },
    { label: 'CODATA 2018: Wien wavelength displacement law constant', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bwien' },
  ],
});
