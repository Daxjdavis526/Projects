// Direct proof and contrapositive. A theorem P ⇒ Q is proved directly (assume
// P, chain to Q) or through its contrapositive ¬Q ⇒ ¬P, which is the same
// statement; the converse Q ⇒ P is a different one. Pictures: an Euler diagram
// of function classes (differentiable ⊂ continuous) with a draggable point and
// truth-value readouts; the jump whose secants blow up; AM–GM as a semicircle;
// parity dots for a contrapositive proof. GR: Birkhoff's theorem, read
// backwards, says a source of gravitational waves cannot be spherical.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;

// P = an ellipse inside Q = a larger ellipse (P ⇒ Q), labels and points configurable
const inP = (X, Y) => `step(1 - ((${X} + 0.6)^2 + (${Y} + 0.2)^2/0.81))`;
const inQ = (X, Y) => `step(1 - ((${X})^2/4.41 + (${Y})^2/4))`;
function euler({ pl = 'P', ql = 'Q', points = [], extra = {}, caption }) {
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-2.3, 2.3], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [
        { param: ['2.1*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'accent2', width: 2, label: ql, labelAt: 0.75, labelDx: 6, labelDy: -4 },
        { param: ['-0.6 + 1.0*cos(t)', '-0.2 + 0.9*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2, label: pl, labelAt: 1.75, labelDx: -40, labelDy: -6 },
      ],
      points,
      ...extra,
    },
    caption,
  };
}

const semi = (a, b, caption) => {
  const R = (a + b) / 2, h = Math.sqrt(a * b);
  return {
    type: 'graph',
    params: {
      x: [-0.5, a + b + 0.5], y: [-0.4, R + 0.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '',
      curves: [{ param: [`${R} + ${R}*cos(t)`, `${R}*sin(t)`], t: [0, 'pi'], color: 'accent', width: 2 }],
      arrows: [
        { from: [a, 0], to: [a, +h.toFixed(4)], color: 'gold', width: 2.2, label: '√(ab)', labelDx: 8 },
        { from: [R, 0], to: [R, R], color: 'accent2', width: 2.2, label: '(a + b)/2', labelDx: 8 },
      ],
      points: [{ x: a / 2, y: 0, r: 0, label: 'a', labelAlign: 'center', labelDx: 0, labelDy: 12 }, { x: a + b / 2, y: 0, r: 0, label: 'b', labelAlign: 'center', labelDx: 0, labelDy: 12 }],
      vlines: [],
    },
    caption,
  };
};

const CAP_EULER = t`Gold: the functions differentiable at $a$. Blue: those continuous at $a$. The theorem “differentiable $\Rightarrow$ continuous” is the gold region sitting inside the blue one.`;

export default lesson({
  id: 'st-g.G1.2',
  title: 'Direct proof and contrapositive',
  minutes: 12, difficulty: 2,
  intro: t`Most theorems have the shape $P \Rightarrow Q$: if the hypothesis $P$ holds, so does the conclusion $Q$. A **direct proof** assumes $P$ and walks a chain of true implications to $Q$. Sometimes it is easier to prove the **contrapositive**, $\neg Q \Rightarrow \neg P$, which is the *same statement* — both fail in exactly one situation, $P$ true and $Q$ false:

$$(P \Rightarrow Q) \iff (\neg Q \Rightarrow \neg P)$$

The **converse** $Q \Rightarrow P$ is a different statement, and confusing the two is the commonest error in proofs. The gentle version is [direct proof and counterexamples](#/lesson/m0.M0-14.2); here the theorems come from analysis and relativity.`,
  symbols: [
    { tex: 'P', text: 'the hypothesis: a statement assumed true for the sake of the argument' },
    { tex: 'Q', text: 'the conclusion: what the proof must establish' },
    { tex: '\\Rightarrow', text: t`implies: $P \Rightarrow Q$ is false only when $P$ is true and $Q$ false` },
    { tex: '\\neg Q \\Rightarrow \\neg P', text: t`the contrapositive: “if the conclusion fails, the hypothesis failed” — logically equivalent to $P \Rightarrow Q$` },
    { tex: '\\iff', text: 'if and only if: true in exactly the same situations' },
  ],
  why: 'Half of the theorems you will use in relativity are applied backwards: Birkhoff’s theorem, the singularity theorems and the energy conditions are most often quoted through their contrapositives.',
  visual: {
    ...euler({
      pl: 'differentiable at a', ql: 'continuous at a',
      points: [
        { x: -0.6, y: -0.25, color: 'gold', r: 4, label: 'x²', labelDx: 8 },
        { x: 1.2, y: 0.9, color: 'accent2', r: 4, label: '|x|', labelDx: 8 },
        { x: 2.65, y: -1.6, color: 'bad', r: 4, label: 'a jump', labelDx: -20, labelDy: 16 },
        { x: 'px', y: 'py', r: 0 },
      ],
      extra: {
        drag: [{ key: 'p', x: 1.4, y: -1.2 }],
        readouts: [
          { label: t`$P$: differentiable at $a$ (1 true, 0 false)`, expr: inP('px', 'py'), digits: 1, zero: 0.5 },
          { label: t`$Q$: continuous at $a$`, expr: inQ('px', 'py'), digits: 1, zero: 0.5 },
          { label: t`$P \Rightarrow Q$ at this point`, expr: `1 - ${inP('px', 'py')}*(1 - ${inQ('px', 'py')})`, digits: 1, zero: 0.5 },
          { label: t`$\neg Q \Rightarrow \neg P$ at this point`, expr: `1 - (1 - ${inQ('px', 'py')})*${inP('px', 'py')}`, digits: 1, zero: 0.5 },
          { label: t`converse $Q \Rightarrow P$ at this point`, expr: `1 - ${inQ('px', 'py')}*(1 - ${inP('px', 'py')})`, digits: 1, zero: 0.5 },
        ],
      },
    }),
    title: 'Differentiable inside continuous',
    lead: t`Each point stands for a function, judged at one point $a$. Drag the white handle anywhere: the first two readouts say whether that function is differentiable and continuous at $a$; the last three evaluate the implication, its contrapositive and its converse **for that one function**.`,
    tasks: [
      t`Drag outside the blue region: $Q$ is false, and so is $P$. The implication and the contrapositive read 1 everywhere — they are the same statement.`,
      t`Drag into the ring between the two regions (where $|x|$ lives): the converse reads 0. One such function refutes “continuous $\Rightarrow$ differentiable”.`,
      'Look for a place where the implication reads 0: there is none, because the gold region lies wholly inside the blue. That inclusion is the theorem.',
    ],
    caption: t`An Euler diagram is a picture of the logic, not of the functions: the regions’ shapes mean nothing, only which lies inside which. Readouts show 1 for true and 0 for false.`,
  },
  example: {
    prompt: t`Prove directly: **if $f$ is differentiable at $a$, then $f$ is continuous at $a$.** Then use the contrapositive to show the unit step $H(x)$ ($0$ for $x < 0$, $1$ for $x \ge 0$) is not differentiable at $0$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-1.2, 1.2], y: [-0.5, 1.6], aspect: 'wide', xlabel: 'x', ylabel: 'H(x)',
        curves: [{ fn: '0', color: 'accent', width: 2.4, domain: [-1.2, -0.005] }, { fn: '1', color: 'accent', width: 2.4, domain: [0, 1.2] }, { fn: '0.5*x + 1', color: 'gold', width: 1.4, dash: true, domain: [-1.2, 1.2] }, { fn: '2*x + 1', color: 'gold', width: 1.4, dash: true, domain: [-0.75, 0.3] }, { fn: '8*x + 1', color: 'gold', width: 1.4, dash: true, domain: [-0.19, 0.075] }],
        points: [{ x: 0, y: 1, r: 4, color: 'accent' }, { x: 0, y: 0, r: 4, hollow: true, color: 'accent' }, { x: -0.5, y: 0, r: 3.5, color: 'gold', label: 'h = −1/2', labelDx: -62, labelDy: 14 }, { x: -0.125, y: 0, r: 3.5, color: 'gold', label: 'h = −1/8', labelDx: 8, labelDy: 16 }],
      },
      caption: t`Secants from $(0, 1)$ to points $(h, H(h))$ on the left: their slopes are $1/|h|$ — $2$, $8$ and so on — growing without bound as $h \to 0^-$.`,
    },
    steps: [
      { label: 'Assume the hypothesis', text: t`Suppose $f'(a) = \displaystyle\lim_{x\to a}\frac{f(x) - f(a)}{x - a}$ exists. The goal is $\displaystyle\lim_{x\to a} f(x) = f(a)$.` },
      { label: 'Write the gap as a product', text: t`For $x \ne a$: $\;f(x) - f(a) = \dfrac{f(x) - f(a)}{x - a}\cdot(x - a)$. This is legal because $x - a \ne 0$, and it splits the gap into a factor with a known limit and a factor that shrinks.` },
      { label: 'Take the limit', text: t`By the product rule for limits, $\displaystyle\lim_{x\to a}\bigl(f(x) - f(a)\bigr) = f'(a)\cdot 0 = 0$, so $f(x) \to f(a)$. The conclusion is reached; the proof is direct.` },
      { label: 'Turn it around', text: t`The contrapositive, free of charge: **if $f$ is not continuous at $a$, it is not differentiable at $a$.** $H$ jumps at $0$: $H(x) = 0$ for every $x < 0$ while $H(0) = 1$, so $H(x) \not\to H(0)$. Hence $H$ is not differentiable at $0$ — no limit of slopes needed.` },
      { label: 'Check against the picture', text: t`Directly, the left secant slopes $\bigl(H(h) - H(0)\bigr)/h = -1/h = 1/|h|$ grow without bound, as the theorem predicted. The converse fails: $|x|$ is continuous at $0$ but its secant slopes are $\pm 1$ on the two sides.` },
    ],
    answer: t`Differentiable $\Rightarrow$ continuous, by writing $f(x) - f(a)$ as (difference quotient) $\times\,(x - a)$. Its contrapositive shows at once that a jump is never differentiable.`,
  },
  practice: [
    mcq({
      id: 'which-equivalent', difficulty: 1,
      prompt: t`Which statement is logically equivalent to “if $n$ is divisible by $6$, then $n$ is divisible by $3$”?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 19.5], y: [-0.6, 1.6], aspect: 'wide', xlabel: 'n', ylabel: '', yticks: 0, xticks: 10, points: [...[3, 9, 15].map((n) => ({ x: n, y: 0.5, r: 5, color: 'accent2' })), ...[6, 12, 18].map((n) => ({ x: n, y: 0.5, r: 7, color: 'gold' })), { x: 1, y: 1.2, r: 0, label: 'gold: multiples of 6;  blue: other multiples of 3' }] },
        caption: t`Multiples of $3$ up to $19$; those that are also multiples of $6$ are gold. Every gold dot is a multiple of $3$; not every multiple of $3$ is gold.`,
      },
      choices: [t`If $n$ is not divisible by $3$, then $n$ is not divisible by $6$.`, t`If $n$ is divisible by $3$, then $n$ is divisible by $6$.`, t`If $n$ is not divisible by $6$, then $n$ is not divisible by $3$.`, t`$n$ is divisible by $6$ and by $3$.`],
      answer: 0,
      why: {
        1: t`That is the converse — and false: $n = 9$.`,
        2: t`That is the inverse (equivalent to the converse) — false for $n = 9$, which is not divisible by $6$ but is divisible by $3$.`,
        3: t`That asserts both facts outright for this $n$; the original only says what follows *if* $n$ is divisible by $6$.`,
      },
      hints: [t`The contrapositive negates both parts and swaps them: $\neg Q \Rightarrow \neg P$.`],
      teach: t`$P \Rightarrow Q$ and $\neg Q \Rightarrow \neg P$ are the same statement; the converse $Q \Rightarrow P$ and the inverse $\neg P \Rightarrow \neg Q$ are a different one.`,
      explain: t`Contrapositive: not divisible by $3$ $\Rightarrow$ not divisible by $6$. It is true for the same reason as the original: $6 = 2\cdot 3$.`,
    }),
    order({
      id: 'contrapositive-proof', difficulty: 2,
      prompt: t`Prove by contrapositive: **if $x^2 - 6x + 5$ is even, then the integer $x$ is odd.** Put the steps in order.`,
      visual: {
        type: 'graph',
        params: { x: [-0.6, 8.6], y: [-6, 24], aspect: 'wide', xlabel: 'x', ylabel: 'x² − 6x + 5', curves: [{ fn: 'x^2 - 6x + 5', color: 'ink4', width: 1.2, dash: true }], points: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => ({ x, y: x * x - 6 * x + 5, r: 5, color: x % 2 ? 'gold' : 'accent', label: String(x * x - 6 * x + 5), labelDx: 8, labelDy: -2 })) },
        caption: t`The value of $x^2 - 6x + 5$ for $x = 0, \dots, 8$ (blue: $x$ even; gold: $x$ odd). Every blue value is odd. A table proves nothing for all $x$; the proof below does.`,
      },
      items: [
        t`State the contrapositive: if $x$ is even, then $x^2 - 6x + 5$ is odd.`,
        t`Assume $x$ is even: $x = 2a$ for some integer $a$.`,
        t`Substitute: $x^2 - 6x + 5 = 4a^2 - 12a + 5$.`,
        t`Rewrite: $4a^2 - 12a + 5 = 2(2a^2 - 6a + 2) + 1$.`,
        t`That is $2k + 1$ with $k$ an integer, so it is odd — which proves the contrapositive, and so the original.`,
      ],
      hints: ['Start by saying what you will prove instead.', 'An even x is 2a; an odd number is 2k + 1.'],
      teach: t`Use the contrapositive when $\neg Q$ gives you something concrete to work with — here “$x$ even” is the formula $x = 2a$.`,
      explain: t`Proving “$x$ is odd” directly from “$x^2 - 6x + 5$ is even” is awkward; assuming $x = 2a$ and computing is easy. Since the contrapositive is equivalent, proving it proves the theorem.`,
    }),
    mcq({
      id: 'converse-counterexample', difficulty: 2,
      prompt: t`Which function refutes the converse “if $f$ is continuous at $0$, then $f$ is differentiable at $0$”?`,
      visual: {
        type: 'graph',
        params: { x: [-1.6, 1.6], y: [-0.6, 1.8], aspect: 'wide', curves: [{ fn: 'abs(x)', color: 'accent', width: 2, label: 'f₁', labelAt: 1.3 }, { fn: 'x^2', color: 'gold', width: 2, label: 'f₂', labelAt: -1.2, labelDx: -18 }, { fn: '1.5', color: 'accent2', width: 2, domain: [0, 1.6], label: 'f₃', labelAt: 0.5 }, { fn: '-0.4', color: 'accent2', width: 2, domain: [-1.6, -0.005] }], points: [{ x: 0, y: 1.5, r: 4, color: 'accent2' }, { x: 0, y: -0.4, r: 4, hollow: true, color: 'accent2' }] },
        caption: t`Three of the candidates near $0$: $f_1 = |x|$, $f_2 = x^2$ and a jump $f_3$.`,
      },
      choices: [t`$f(x) = |x|$`, t`$f(x) = x^2$`, t`a jump: $f(x) = -0.4$ for $x < 0$, $1.5$ for $x \ge 0$`, t`$f(x) = 1/x$ (with $f(0) = 0$)`],
      answer: 0,
      why: {
        1: t`$x^2$ is both continuous and differentiable at $0$: it satisfies the converse, so it cannot refute it.`,
        2: t`The jump is not continuous at $0$, so the hypothesis of the converse fails; it says nothing about it.`,
        3: t`$1/x$ is not continuous at $0$ (it is unbounded nearby), so the converse’s hypothesis fails.`,
      },
      hints: [t`A counterexample to $Q \Rightarrow P$ must make $Q$ true and $P$ false.`, 'Look for a corner: continuous, with different slopes on the two sides.'],
      teach: t`A counterexample to an implication satisfies its hypothesis and violates its conclusion — nothing else will do.`,
      explain: t`$|x|$ is continuous at $0$, but its difference quotient is $+1$ for $h > 0$ and $-1$ for $h < 0$, so $f'(0)$ does not exist. Continuity does not imply differentiability.`,
    }),
    num({
      id: 'amgm', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 4], [1, 9], [2, 8], [4, 9], [1, 16], [9, 16], [4, 25]]);
        const ans = (a + b) / 2 - Math.sqrt(a * b);
        return {
          prompt: t`A direct proof that $\dfrac{a + b}{2} \ge \sqrt{ab}$ for $a, b > 0$ rewrites the gap as $\dfrac{a + b}{2} - \sqrt{ab} = \dfrac{(\sqrt a - \sqrt b)^2}{2} \ge 0$. For $a = ${a}$ and $b = ${b}$, what is the gap?`,
          visual: semi(a, b, t`The classical picture: in a semicircle on a diameter of length $a + b$, the radius is $(a + b)/2$ and the half-chord standing at the join of $a$ and $b$ is $\sqrt{ab}$. No half-chord is longer than the radius.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (Math.sqrt(a) - Math.sqrt(b)) ** 2, feedback: t`That is $(\sqrt a - \sqrt b)^2$; the gap is half of it.` }],
          hints: [t`$\sqrt{${a}} = ${Math.sqrt(a)}$ and $\sqrt{${b}} = ${Math.sqrt(b)}$.`],
          teach: t`A direct proof of an inequality often rewrites the difference as something manifestly non-negative, such as a square.`,
          explain: t`$\tfrac{${a} + ${b}}{2} - \sqrt{${a * b}} = ${nice((a + b) / 2)} - ${nice(Math.sqrt(a * b))} = ${nice(ans)}$, which is $(${Math.sqrt(a)} - ${Math.sqrt(b)})^2/2$. The gap is zero only when $a = b$.`,
        };
      },
    }),
    mcq({
      id: 'divergence-test', difficulty: 3,
      prompt: t`A theorem from Calculus II: **if $\sum a_n$ converges, then $a_n \to 0$.** Which statement is its contrapositive — the form you actually use as the divergence test?`,
      visual: { type: 'calc-series', params: { view: 'sums', term: '1/n', N: { min: 1, max: 60, value: 40 }, readout: false }, caption: t`The harmonic series: its terms $1/n$ go to $0$, yet its partial sums grow without bound (like $\ln n$). Only finitely many terms are drawn.` },
      choices: [t`If $a_n \not\to 0$, then $\sum a_n$ diverges.`, t`If $a_n \to 0$, then $\sum a_n$ converges.`, t`If $\sum a_n$ diverges, then $a_n \not\to 0$.`, t`If $\sum a_n$ diverges, then $a_n \to 0$.`],
      answer: 0,
      why: {
        1: t`That is the converse, and the picture refutes it: $1/n \to 0$ but $\sum 1/n$ diverges.`,
        2: t`That is the inverse (equivalent to the converse) — the harmonic series is again a counterexample.`,
        3: t`That is not a rearrangement of the theorem at all, and $\sum 1$ (terms constantly $1$) is a counterexample.`,
      },
      hints: [t`Negate both parts and swap them.`, t`$P$: “$\sum a_n$ converges”. $Q$: “$a_n \to 0$”.`],
      teach: t`The divergence test is the contrapositive of “convergent $\Rightarrow$ terms tend to $0$”; the converse is false, as the harmonic series shows.`,
      explain: t`$\neg Q \Rightarrow \neg P$: if the terms do not tend to $0$, the series diverges. When the terms do tend to $0$, the theorem is silent — see [the divergence test](#/lesson/math1220.C2-4.4).`,
    }),
    mcq({
      id: 'proved-converse', difficulty: 3, kind: 'error',
      prompt: t`Claim: **for every real $x$, if $x^2 > 4$ then $x > 2$.** A student writes: “Assume $x > 2$. Then $x^2 > 2x > 4$. Hence the claim.” What is wrong?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-1, 12], aspect: 'wide', curves: [{ fn: 'x^2', color: 'accent', width: 2 }], hlines: [{ y: 4, color: 'gold', label: 'y = 4' }], shade: [{ fn: 'x^2', lower: '4', from: -3.5, to: -2, color: 'bad', alpha: 0.25 }, { fn: 'x^2', lower: '4', from: 2, to: 3.5, color: 'good', alpha: 0.25 }] },
        caption: t`Where $x^2 > 4$: two pieces of the line, $x > 2$ (green) and $x < -2$ (red).` },
      choices: [t`They proved the converse; the claim itself is false, as $x = -3$ shows`, t`The step $x^2 > 2x$ needs $x > 0$, which was not assumed`, t`They should have used the contrapositive, but the claim is true`, t`Nothing: assuming the conclusion is a valid direct proof`],
      answer: 0,
      why: {
        1: t`$x > 2$ does give $x > 0$, so $x^2 > 2x$ is fine. The steps are correct; they prove the wrong statement.`,
        2: t`The claim is false, so no method can prove it: $(-3)^2 = 9 > 4$ but $-3 < 2$.`,
        3: t`A direct proof of $P \Rightarrow Q$ assumes $P$ ($x^2 > 4$), not $Q$.`,
      },
      hints: ['Which of the two statements did the student assume?', t`Test the claim at a negative number.`],
      teach: t`Assuming the conclusion and deriving the hypothesis proves the converse, which is a different statement.`,
      explain: t`The student showed $x > 2 \Rightarrow x^2 > 4$, the converse. The claim $x^2 > 4 \Rightarrow x > 2$ is false: $x = -3$ is a counterexample (the red region).`,
    }),
    multi({
      id: 'equivalent-forms', difficulty: 2,
      prompt: t`Select **every** statement logically equivalent to $P \Rightarrow Q$.`,
      visual: euler({ caption: t`$P \Rightarrow Q$ (for every case) says the region where $P$ holds lies inside the region where $Q$ holds.` }),
      choices: [t`$\neg Q \Rightarrow \neg P$`, t`$\neg P \vee Q$`, t`$\neg(P \wedge \neg Q)$`, t`$Q \Rightarrow P$`, t`$\neg P \Rightarrow \neg Q$`, t`$P \wedge Q$`],
      answer: [0, 1, 2],
      why: {
        3: t`The converse: false when $Q$ holds without $P$ (the ring in the picture).`,
        4: t`The inverse, equivalent to the converse, not to the original.`,
        5: t`$P \wedge Q$ is false whenever $P$ is false, but $P \Rightarrow Q$ is then true.`,
      },
      hints: [t`$P \Rightarrow Q$ is false in one case only: $P$ true, $Q$ false.`, t`Check each choice in that case and in the other three.`],
      teach: t`$P \Rightarrow Q$, $\neg Q \Rightarrow \neg P$, $\neg P \vee Q$ and $\neg(P \wedge \neg Q)$ all fail only when $P$ is true and $Q$ false.`,
      explain: t`The three equivalent forms are false only when $P$ is true and $Q$ false. The converse and inverse fail instead when $Q$ is true and $P$ false; $P \wedge Q$ also fails whenever $P$ is false.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-birkhoff', difficulty: 3, transfer: true,
      prompt: t`**Birkhoff’s theorem:** if a region of empty spacetime is spherically symmetric, then it is a piece of the static Schwarzschild solution. Static spacetime carries no gravitational waves. A detector records gravitational waves from a stellar collapse. What does the contrapositive let you conclude?`,
      visual: {
        type: 'graph',
        params: { x: [-1, 0], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'time before merger (s)', ylabel: 'strain (arb.)', yticks: 0, curves: [{ fn: '0.35*(0.02 - x)^(-0.25)*cos(60*(0.02 - x)^(0.625))', color: 'accent', width: 1.4, samples: 3000 }] },
        caption: t`A teaching sketch of a chirp: amplitude and frequency rising together. Its shape is schematic; real templates come from relativity and numerical simulations.`,
      },
      choices: ['The empty region around the source was not spherically symmetric, so the collapse was not spherical', 'Every non-spherical collapse produces gravitational waves', 'The star must have been static', 'Nothing: Birkhoff’s theorem is about empty space, and the waves are in empty space'],
      answer: 0,
      why: {
        1: t`That is a converse-type claim Birkhoff does not make. (A static non-spherical body, for instance, does not radiate.)`,
        2: t`Static exterior means no waves; waves were seen, so the exterior is not static — the opposite.`,
        3: t`Being in empty space is exactly why Birkhoff applies: waves out there make the region non-Schwarzschild.`,
      },
      hints: [t`$P$: spherically symmetric vacuum. $Q$: static Schwarzschild (no waves). Waves mean $\neg Q$.`, t`$\neg Q \Rightarrow \neg P$.`],
      teach: t`Birkhoff’s theorem, read as a contrapositive, says that only a departure from spherical symmetry can make gravitational waves.`,
      explain: t`Waves $\Rightarrow$ the exterior is not static Schwarzschild ($\neg Q$) $\Rightarrow$ it is not spherically symmetric ($\neg P$). A perfectly spherical collapse, however violent, is silent in gravitational waves.`,
    }),
    order({
      id: 'cp-compose', difficulty: 2,
      prompt: t`Prove directly: **if $f$ and $g$ are increasing functions on $\mathbb R$, then $f \circ g$ is increasing.** (Increasing: $x < y \Rightarrow h(x) < h(y)$.) Put the steps in order.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-3, 3], aspect: 'wide', curves: [{ fn: 'x + 0.3*x^3', color: 'accent', width: 2, label: 'g', labelAt: 1.5 }, { fn: '2*atan(x)', color: 'gold', width: 2, label: 'f', labelAt: -1.6, labelDy: 14 }, { fn: '2*atan(x + 0.3*x^3)', color: 'good', width: 2, dash: true, label: 'f ∘ g', labelAt: 0.6, labelDy: 18 }] }, caption: t`Two increasing functions and their composition (dashed): it rises too.` },
      items: [
        t`Let $x < y$ be any two real numbers.`,
        t`Since $g$ is increasing, $g(x) < g(y)$.`,
        t`Apply the definition for $f$ to the two numbers $g(x) < g(y)$: $f(g(x)) < f(g(y))$.`,
        t`So $(f \circ g)(x) < (f \circ g)(y)$; since $x < y$ were arbitrary, $f \circ g$ is increasing.`,
      ],
      hints: [t`A $\forall x\ \forall y$ statement starts by taking arbitrary $x$ and $y$.`],
      teach: 'A direct proof of a “for all” statement takes arbitrary objects satisfying the hypothesis and pushes them through the definitions.',
      explain: t`The definitions do the work: increasing $g$ moves the inequality to $g(x) < g(y)$, and increasing $f$ carries it through.`,
    }),
    mcq({
      id: 'cp-tollens', difficulty: 2, transfer: true,
      prompt: t`A propellant tank’s burst disc is rated so that **if the tank pressure exceeds $2.4$ MPa, the disc ruptures.** After a test the disc is intact. Assuming the rating is correct, what follows?`,
      visual: euler({ pl: 'pressure > 2.4 MPa', ql: 'disc ruptured', caption: t`The rating as an inclusion: every over-pressure case lies inside the ruptured-disc cases.` }),
      choices: ['The pressure never exceeded 2.4 MPa', 'The pressure stayed well below 2.4 MPa, with margin', 'Nothing can be concluded about the pressure', 'The pressure exceeded 2.4 MPa but the disc held'],
      answer: 0,
      why: {
        1: t`The contrapositive gives only “not above $2.4$ MPa”; it says nothing about how far below.`,
        2: t`An intact disc is $\neg Q$, and $\neg Q \Rightarrow \neg P$ does tell you something.`,
        3: t`That would make the rating wrong — it contradicts the assumption.`,
      },
      hints: [t`Intact disc is $\neg Q$.`],
      teach: t`From $P \Rightarrow Q$ and $\neg Q$, conclude $\neg P$ (the contrapositive, or *modus tollens*).`,
      explain: t`$P$: pressure $> 2.4$ MPa; $Q$: disc ruptures. Intact disc means $\neg Q$, so $\neg P$: the pressure never exceeded $2.4$ MPa.`,
    }),
  ],
  sources: [
    { label: 'Hammack, Book of Proof, chs. 4–5 (direct proof, contrapositive; free online)', url: 'https://www.people.vcu.edu/~rhammack/BookOfProof/' },
    { label: 'Abbott, Understanding Analysis, 2nd ed. (Springer, 2015), §5.2 (differentiable implies continuous)', url: 'https://doi.org/10.1007/978-1-4939-2712-8' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (Birkhoff’s theorem)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
