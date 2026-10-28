// ε–δ arguments, written as proofs. The Calculus I lesson (math1210.C1-2.6)
// met the definition with x², linear functions and √x; here the proofs that
// need a technique: bounding a factor away from trouble (1/x, δ = min(1, …)),
// splitting ε in two (the sum rule), and the negation that kills sin(1/x).
// The Explore step is the game: the challenger slides ε, you drag δ.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const is = (k) => `step(0.5 - abs(fc - ${k}))`;
const D = 'max(px - 1, 0.002)';
// the largest |f(x) − L| over 0 < |x − 1| < δ, exactly: 1/x is worst on the left, x³ on the right, sin(1/(x − 1)) always reaches 1
const W0 = `(step(0.999 - ${D})*${D}/(1.000001 - ${D}) + step(${D} - 0.999)*1000)`;
const W1 = `((1 + ${D})^3 - 1)`;
const WORST = `(${is(0)}*${W0} + ${is(1)}*${W1} + ${is(2)})`;

// a static ε–δ picture: f near a, the band L ± ε and (optionally) the window a ± δ
function band({ fn, a, L, eps, delta, x, y, caption, samples, extra = {} }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide',
      shade: [
        { fn: `${L + eps}`, lower: `${L - eps}`, from: x[0], to: x[1], color: 'good', alpha: 0.16 },
        ...(delta ? [{ fn: `${y[1]}`, lower: `${y[0]}`, from: a - delta, to: a + delta, color: 'gold', alpha: 0.13 }] : []),
      ],
      curves: [{ fn, color: 'accent', width: 2.2, ...(samples ? { samples } : {}) }],
      points: [{ x: a, y: L, color: 'gold', r: 3.5, hollow: true }],
      ...extra,
    },
    caption,
  };
}

export default lesson({
  id: 'st-g.G1.4',
  title: 'ε–δ arguments',
  minutes: 14, difficulty: 3,
  intro: t`The definition of a limit is a game with three moves: the challenger names a tolerance $\varepsilon$, you answer with a $\delta$, and then **every** $x$ in your window must pass. Written out, quantifiers and all:

$$\lim_{x\to a} f(x) = L \iff \forall\varepsilon > 0\ \exists\delta > 0\ \forall x:\ 0 < |x - a| < \delta \Rightarrow |f(x) - L| < \varepsilon$$

[The ε–δ definition](#/lesson/math1210.C1-2.6) met it with polynomials. A proof needs a few techniques beyond those: **bound the troublesome factor** by first promising $\delta \le 1$, **split $\varepsilon$** when two things must be small at once, and, to show a limit fails, play the **negation** $\exists\varepsilon\ \forall\delta\ \exists x$.`,
  symbols: [
    { tex: '\\varepsilon', text: 'the output tolerance, chosen first by the challenger, as small as they like' },
    { tex: '\\delta', text: t`your input tolerance; it may depend on $\varepsilon$ and on $a$, never on $x$` },
    { tex: 'a', text: t`the point approached; $f(a)$ itself plays no part, which is why the window is $0 < |x - a|$` },
    { tex: 'L', text: t`the claimed limit` },
    { tex: '\\forall x', text: t`the hidden third quantifier, usually written “whenever”: every $x$ in the window must pass, not most of them` },
  ],
  why: 'The same ∀ε ∃δ shape defines continuity, convergence, Lyapunov stability of an orbit and the well-posedness of Einstein’s equations; reading and writing it fluently is the entry ticket to all of them.',
  visual: {
    type: 'graph',
    title: 'The ε–δ game',
    lead: t`The challenger sets $\varepsilon$ with the slider: the green band is $L \pm \varepsilon$. You answer by dragging the white handle sideways: the gold strip is the window $1 \pm \delta$. Inside it the curve turns green if **every** point stays in the band, red if any escapes.`,
    tasks: [
      t`$1/x$ with $\varepsilon = 0.5$: the largest $\delta$ that works is $\varepsilon/(1 + \varepsilon) = 1/3$. Shrink $\varepsilon$ and you must shrink $\delta$ — but there is always one.`,
      t`$x^3$: the right side is the binding one, $\delta = (1 + \varepsilon)^{1/3} - 1$. For a small $\varepsilon$ that is about $\varepsilon/3$, the slope at $1$ talking.`,
      t`$\sin\bigl(1/(x - 1)\bigr)$, claimed limit $0$: with any $\varepsilon \le 1$ no $\delta$ turns it green. The challenger has a winning move, so there is no limit.`,
    ],
    params: {
      x: [0, 2.2], y: [-1.6, 3.4], aspect: 'wide', xlabel: 'x', ylabel: 'f(x)',
      choices: [{ key: 'fc', label: 'Function (limit claimed at x = 1)', options: [[0, t`$1/x$, $L = 1$`], [1, t`$x^3$, $L = 1$`], [2, t`$\sin\frac{1}{x - 1}$, $L = 0$`]], value: 0, explain: t`The function and the limit $L$ claimed for it as $x \to 1$.` }],
      sliders: [{ key: 'eps', label: t`Challenge $\varepsilon$`, min: 0.05, max: 1.5, step: 0.01, value: 0.5, explain: t`The output tolerance: $|f(x) - L|$ must stay below it.` }],
      drag: [{ key: 'p', x: 1.5, y: -1.35, lockY: true }],
      shade: [
        { fn: `(1 - ${is(2)}) + eps`, lower: `(1 - ${is(2)}) - eps`, from: 0, to: 2.2, color: 'good', alpha: 0.16 },
        { fn: '3.4', lower: '-1.6', from: `1 - ${D}`, to: `1 + ${D}`, color: 'gold', alpha: 0.13 },
      ],
      curves: [
        { fn: '1/x', color: 'accent', width: 2, domain: [0.25, 2.2], when: is(0) },
        { fn: 'x^3', color: 'accent', width: 2, when: is(1) },
        { fn: 'sin(1/(x - 1))', color: 'accent', width: 1.4, samples: 5000, when: is(2) },
        { fn: '1/x', color: 'good', width: 4, domain: [`max(1 - ${D}, 0.25)`, `1 + ${D}`], when: `${is(0)}*step(eps - ${W0})` },
        { fn: '1/x', color: 'bad', width: 4, domain: [`max(1 - ${D}, 0.25)`, `1 + ${D}`], when: `${is(0)}*step(${W0} - eps)` },
        { fn: 'x^3', color: 'good', width: 4, domain: [`1 - ${D}`, `1 + ${D}`], when: `${is(1)}*step(eps - ${W1})` },
        { fn: 'x^3', color: 'bad', width: 4, domain: [`1 - ${D}`, `1 + ${D}`], when: `${is(1)}*step(${W1} - eps)` },
        { fn: 'sin(1/(x - 1))', color: 'bad', width: 2.4, samples: 5000, domain: [`1 - ${D}`, `1 + ${D}`], when: `${is(2)}*step(1 - eps)` },
        { fn: 'sin(1/(x - 1))', color: 'good', width: 2.4, samples: 5000, domain: [`1 - ${D}`, `1 + ${D}`], when: `${is(2)}*step(eps - 1.0001)` },
      ],
      points: [{ x: 'px', y: -1.35, r: 0, label: 'drag: 1 + δ', labelDx: 10, labelDy: 0 }],
      readouts: [
        { label: t`your $\delta$`, expr: D, digits: 3 },
        { label: t`largest $|f(x) - L|$ in the window`, expr: `min(${WORST}, 999)`, digits: 3 },
      ],
    },
    caption: t`The window leaves out $x = 1$ itself. The largest deviation is exact: $1/x$ is worst at the left end, $x^3$ at the right end, and $\sin\frac{1}{x - 1}$ reaches $\pm 1$ in every window. Its curve is sampled, so near $x = 1$ the drawing cannot show every oscillation.`,
  },
  example: {
    prompt: t`Prove that $\displaystyle\lim_{x\to2}\frac1x = \frac12$. Then test the $\delta$ you find with $\varepsilon = 0.1$.`,
    visual: band({ fn: '1/x', a: 2, L: 0.5, eps: 0.1, delta: 0.2, x: [0.8, 3.2], y: [0.2, 1.1], caption: t`$\varepsilon = 0.1$ (green band) and the recipe’s $\delta = 0.2$ (gold strip): the curve stays inside the band across the strip. The left side, where $1/x$ is steeper, is the tighter one.` }),
    steps: [
      { label: 'Rewrite the gap', text: t`$\left|\dfrac1x - \dfrac12\right| = \dfrac{|2 - x|}{2|x|} = \dfrac{|x - 2|}{2|x|}$. The numerator is what $\delta$ controls; the denominator is the trouble — near $x = 0$ it would make the gap huge.` },
      { label: 'Promise delta at most 1', text: t`Agree in advance that $\delta \le 1$. Then $|x - 2| < 1$ puts $x$ in $(1, 3)$, so $|x| > 1$ and $\dfrac{1}{2|x|} < \dfrac12$. The bad factor is now tamed.` },
      { label: 'Choose delta', text: t`Now $\left|\dfrac1x - \dfrac12\right| < \dfrac{|x - 2|}{2} < \dfrac{\delta}{2}$. This is at most $\varepsilon$ when $\delta \le 2\varepsilon$. Both promises hold with $\delta = \min(1,\ 2\varepsilon)$.` },
      { label: 'Write the proof', text: t`Let $\varepsilon > 0$ and set $\delta = \min(1, 2\varepsilon)$. If $0 < |x - 2| < \delta$, then $|x| > 1$ and $\left|\frac1x - \frac12\right| = \frac{|x - 2|}{2|x|} < \frac{\delta}{2} \le \varepsilon$. Every $\varepsilon$ has its $\delta$, so the limit is $\tfrac12$.` },
      { label: 'Test it', text: t`$\varepsilon = 0.1$ gives $\delta = 0.2$. The worst point is the left end, $x \to 1.8$: $\frac{1}{1.8} - \frac12 = ${nice(1 / 1.8 - 0.5, 3)} < 0.1$. ✓ The largest $\delta$ that works is $2 - \frac{1}{0.6} = ${nice(2 - 1 / 0.6, 3)}$: a proof needs *a* $\delta$, not the best one.` },
    ],
    answer: t`$\delta = \min(1, 2\varepsilon)$ works for every $\varepsilon > 0$, so $\lim_{x\to2} 1/x = \tfrac12$.`,
  },
  practice: [
    num({
      id: 'largest-delta-inv', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 4, 5]), eps = r.pick([0.02, 0.05, 0.1]);
        const ans = a * a * eps / (1 + a * eps), right = a * a * eps / (1 - a * eps);
        return {
          prompt: t`For $f(x) = 1/x$ near $a = ${a}$ (so $L = ${nice(1 / a)}$) and the challenge $\varepsilon = ${eps}$, what is the **largest** $\delta$ for which $0 < |x - ${a}| < \delta$ guarantees $\left|\frac1x - \frac1{${a}}\right| < ${eps}$? Give three significant figures.`,
          visual: band({ fn: '1/x', a, L: 1 / a, eps, x: [a * 0.5, a * 1.5], y: [1 / a - 4 * eps, 1 / a + 4 * eps], caption: t`$1/x$ near $x = ${a}$ with the band $\frac1{${a}} \pm ${eps}$. The curve leaves the band sooner on one side than on the other.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: right, feedback: t`That is how far you can go to the **right** (where $1/x$ falls below the band). The window is symmetric, so the steeper left side decides: $\frac{1}{${a} - \delta} = \frac1{${a}} + ${eps}$.` },
            { value: a * a * eps, feedback: t`That is the linear estimate $\varepsilon/|f'(a)| = ${a}^2\varepsilon$. It overshoots slightly on the left; solve $\frac{1}{${a} - \delta} = \frac1{${a}} + ${eps}$ exactly.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$1/x$ is decreasing and steeper on the left, so the left edge of the window is where it first leaves the band.`, t`Solve $\dfrac{1}{${a} - \delta} = \dfrac1{${a}} + ${eps}$ for $\delta$.`],
          teach: t`The largest $\delta$ is decided by whichever side of $a$ the function leaves the band first — for $1/x$, the steeper left side.`,
          explain: t`$${a} - \delta = \dfrac{1}{1/${a} + ${eps}}$ gives $\delta = \dfrac{a^2\varepsilon}{1 + a\varepsilon} = ${nice(ans, 4)}$. On the right one could go to $${nice(right, 4)}$, but the window is symmetric.`,
        };
      },
    }),
    order({
      id: 'sum-rule', difficulty: 3,
      prompt: t`Prove the sum rule: if $f(x) \to L$ and $g(x) \to M$ as $x \to a$, then $f(x) + g(x) \to L + M$. Put the steps in order.`,
      visual: {
        type: 'graph',
        params: {
          x: [0.4, 1.6], y: [-0.6, 3.6], aspect: 'wide',
          shade: [{ fn: '1.25', lower: '0.75', from: 0.4, to: 1.6, color: 'accent', alpha: 0.12 }, { fn: '0.25', lower: '-0.25', from: 0.4, to: 1.6, color: 'gold', alpha: 0.12 }, { fn: '3.4', lower: '2.4', from: 0.4, to: 1.6, color: 'good', alpha: 0.12 }],
          curves: [{ fn: 'x^2', color: 'accent', width: 2, label: 'f → 1', labelAt: 1.45, labelDx: 6 }, { fn: 'sin(x - 1)', color: 'gold', width: 2, label: 'g → 0', labelAt: 1.45, labelDx: 6, labelDy: 14 }, { fn: 'x^2 + sin(x - 1) + 1.9', color: 'good', width: 2, label: 'f + g (shifted up 1.9)', labelAt: 0.55, labelDx: 4, labelDy: -12 }],
        },
        caption: t`Two bands of half-width $\varepsilon/2$ (here $\varepsilon = 0.5$) around $L$ and $M$ give a band of half-width $\varepsilon$ around $L + M$. The sum is drawn shifted up to keep the curves apart.`,
      },
      items: [
        t`Let $\varepsilon > 0$.`,
        t`Choose $\delta_1 > 0$ so that $0 < |x - a| < \delta_1 \Rightarrow |f(x) - L| < \varepsilon/2$.`,
        t`Choose $\delta_2 > 0$ so that $0 < |x - a| < \delta_2 \Rightarrow |g(x) - M| < \varepsilon/2$.`,
        t`Set $\delta = \min(\delta_1, \delta_2)$ and take any $x$ with $0 < |x - a| < \delta$.`,
        t`Then $|f + g - (L + M)| \le |f - L| + |g - M| < \varepsilon$.`,
      ],
      hints: ['The challenge comes first; each hypothesis is then used with a smaller tolerance.', t`$\delta$ must satisfy both requirements at once: take the smaller one. The last step is the triangle inequality.`],
      teach: t`When two quantities must be small together, ask each for $\varepsilon/2$ and take the smaller $\delta$.`,
      explain: t`Each hypothesis is a $\forall\varepsilon$ statement, so it may be fed $\varepsilon/2$. The minimum of the two $\delta$s serves both, and the triangle inequality adds the halves back to $\varepsilon$.`,
    }),
    num({
      id: 'largest-delta-cube', difficulty: 3,
      gen(r) {
        const [a, eps] = r.pick([[1, 0.1], [1, 0.2], [1, 0.3], [1, 0.5], [2, 0.5], [2, 1]]);
        const ans = Math.cbrt(a ** 3 + eps) - a, left = a - Math.cbrt(a ** 3 - eps);
        return {
          prompt: t`For $f(x) = x^3$ near $a = ${a}$ ($L = ${a ** 3}$) and $\varepsilon = ${eps}$, what is the **largest** $\delta$ for which $0 < |x - ${a}| < \delta$ guarantees $|x^3 - ${a ** 3}| < ${eps}$? Give three significant figures.`,
          visual: band({ fn: 'x^3', a, L: a ** 3, eps, x: [a - 0.4 * a, a + 0.4 * a], y: [a ** 3 - 4 * eps, a ** 3 + 4 * eps], caption: t`$x^3$ near $x = ${a}$ with the band $${a ** 3} \pm ${eps}$.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: left, feedback: t`That is the room on the **left**, where $x^3$ is flatter. The curve leaves the band first on the right: solve $(${a} + \delta)^3 = ${a ** 3 + eps}$.` }, { value: eps / (3 * a * a), feedback: t`That is the linear estimate $\varepsilon/f'(a)$; the curve bends up, so the exact $\delta$ is smaller. Solve $(${a} + \delta)^3 = ${a ** 3 + eps}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$x^3$ is increasing and gets steeper to the right, so the right edge decides.`, t`$\delta = \sqrt[3]{${a ** 3 + eps}} - ${a}$.`],
          teach: t`For an increasing function the binding edge is the side where it is steeper; for $x^3$ near a positive $a$, the right.`,
          explain: t`$\delta = \sqrt[3]{${a ** 3 + eps}} - ${a} = ${nice(ans, 4)}$. On the left there is more room, $${a} - \sqrt[3]{${a ** 3 - eps}} = ${nice(left, 4)}$, but the window is symmetric.`,
        };
      },
    }),
    mcq({
      id: 'why-min', difficulty: 2,
      prompt: t`In the proof that $1/x \to \tfrac12$ as $x \to 2$, why is $\delta = \min(1, 2\varepsilon)$ and not simply $\delta = 2\varepsilon$?`,
      visual: band({ fn: '1/x', a: 2, L: 0.5, eps: 1.5, delta: 3, x: [-1.4, 5.4], y: [-2.5, 3.5], extra: { curves: [{ fn: '1/x', color: 'accent', width: 2, domain: [0.05, 5.4] }, { fn: '1/x', color: 'accent', width: 2, domain: [-1.4, -0.05] }] }, caption: t`A generous challenge, $\varepsilon = 1.5$: then $2\varepsilon = 3$, and the window $(-1, 5)$ contains $x = 0$, where $1/x$ has no value and nearby values are unbounded.` }),
      choices: [t`The estimate $\frac{1}{2|x|} < \frac12$ needs $|x| > 1$, which only $\delta \le 1$ guarantees; for a large $\varepsilon$, $\delta = 2\varepsilon$ would let $x$ reach $0$`, t`The definition of a limit requires $\delta \le 1$`, t`Taking the minimum makes $\delta$ independent of $\varepsilon$`, t`It does not matter: $\delta = 2\varepsilon$ works for every $\varepsilon$`],
      answer: 0,
      why: {
        1: t`The definition allows any $\delta > 0$. The cap $1$ is this proof’s own promise, made to bound $1/|x|$.`,
        2: t`$\min(1, 2\varepsilon)$ still depends on $\varepsilon$ — for small $\varepsilon$ it *is* $2\varepsilon$.`,
        3: t`For $\varepsilon = 1.5$ the window $(-1, 5)$ contains points near $0$ where $1/x$ is enormous.`,
      },
      hints: [t`Which inequality in the proof used $|x - 2| < 1$?`, t`What happens to $1/x$ if the window around $2$ is wider than $2$?`],
      teach: t`“Promise $\delta \le 1$” bounds the troublesome factor; the $\min$ keeps that promise for large $\varepsilon$ too.`,
      explain: t`The step $\frac{|x - 2|}{2|x|} < \frac{|x - 2|}{2}$ used $|x| > 1$, which came from $\delta \le 1$. For small $\varepsilon$ the minimum is $2\varepsilon$ anyway; the cap only matters when the challenger is generous.`,
    }),
    mcq({
      id: 'sin-inverse', difficulty: 3,
      prompt: t`Someone claims $\displaystyle\lim_{x\to0}\sin\frac1x = L$ for some number $L$. The negation of the limit is $\exists\varepsilon > 0\ \forall\delta > 0\ \exists x:\ 0 < |x| < \delta$ and $|\sin\frac1x - L| \ge \varepsilon$. Which challenge $\varepsilon$ defeats **every** $\delta$, whatever $L$ is?`,
      visual: { type: 'graph', params: { x: [-0.5, 0.5], y: [-1.5, 1.5], aspect: 'wide', curves: [{ fn: 'sin(1/x)', color: 'accent', width: 1.2, samples: 5000 }], hlines: [{ y: 1, color: 'ink3' }, { y: -1, color: 'ink3' }] }, caption: t`$\sin\frac1x$ swings between $-1$ and $1$ infinitely often in every window around $0$. The drawing is sampled, so close to $0$ it cannot show every swing.` },
      choices: [t`$\varepsilon = 1$`, t`$\varepsilon = 2$`, t`$\varepsilon = 0$`, t`None: the limit is $L = 0$, the average value`],
      answer: 0,
      why: {
        1: t`A band of half-width $2$ around $L = 0$ contains all of $[-1, 1]$; then every $\delta$ works and the challenger loses.`,
        2: t`The challenge must be positive: $\varepsilon > 0$.`,
        3: t`Averaging is not limiting: in every window there are points with $\sin\frac1x = \pm1$, a distance $1$ from $0$.`,
      },
      hints: [t`In every window $0 < |x| < \delta$ there are points with $\sin\frac1x = 1$ and points with $\sin\frac1x = -1$.`, t`Those two values are $2$ apart, so one of them is at least $1$ from any $L$.`],
      teach: t`To defeat a claimed limit, find one $\varepsilon$ such that every window contains a point outside the band.`,
      explain: t`For any $L$, one of $\pm1$ is at least $1$ away from it. Every window contains $x = \frac{1}{\pi/2 + 2\pi k}$ and $x = \frac{1}{3\pi/2 + 2\pi k}$ for large $k$, so with $\varepsilon = 1$ the challenger wins every round: no limit exists.`,
    }),
    {
      type: 'point', id: 'drag-delta', difficulty: 2,
      prompt: t`Play one round. The function is $x^3$ near $1$ ($L = 1$) and the challenge is $\varepsilon = 0.3$. Drag the handle to $1 + \delta$ for **some** $\delta$ that wins: every $x$ with $0 < |x - 1| < \delta$ must have $|x^3 - 1| < 0.3$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0.6, 1.4], y: [-0.2, 2.2], aspect: 'wide',
          drag: [{ key: 'p', x: 1.3, y: 0, lockY: true, snap: 0.005 }],
          shade: [{ fn: '1.3', lower: '0.7', from: 0.6, to: 1.4, color: 'good', alpha: 0.16 }, { fn: '2.2', lower: '-0.2', from: '2 - px', to: 'px', color: 'gold', alpha: 0.13 }],
          curves: [{ fn: 'x^3', color: 'accent', width: 2.2 }],
          points: [{ x: 1, y: 1, r: 3.5, hollow: true, color: 'gold' }],
        },
        caption: t`Green: the band $1 \pm 0.3$. Gold: your window $(1 - \delta, 1 + \delta)$, set by the handle at $x = 1 + \delta$.`,
      },
      answer: { x: 1.048, y: 0 }, tol: { x: 0.043, y: 0.05 },
      instruction: 'Drag the handle to 1 + δ, then check.',
      hints: [t`$x^3$ is steeper on the right of $1$, so the right edge decides: you need $(1 + \delta)^3 \le 1.3$.`, t`$\sqrt[3]{1.3} = 1.0914$, so any handle position between about $1.005$ and $1.09$ wins.`],
      teach: t`A proof needs a $\delta$ that works, not the largest one: anything from a tiny window up to the binding edge wins the round.`,
      explain: t`Any $\delta$ up to $\sqrt[3]{1.3} - 1 = ${nice(Math.cbrt(1.3) - 1, 3)}$ wins. Smaller windows are always safe; the proof only has to name one.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-period', difficulty: 3, transfer: true,
      gen(r) {
        const MU = 398600.4418;
        const [what, a0] = r.pick([['a space station at 400 km altitude', 6778], ['an imaging satellite at 500 km altitude', 6878], ['a weather satellite at 800 km altitude', 7178], ['a GPS satellite', 26560]]);
        const eps = r.pick([0.5, 1, 2]);
        const T0 = 2 * Math.PI * Math.sqrt(a0 ** 3 / MU);
        const ans = Math.cbrt(MU * ((T0 + eps) / (2 * Math.PI)) ** 2) - a0;
        return {
          prompt: t`The period of a circular orbit is $T = 2\pi\sqrt{a^3/\mu}$, with $\mu = 398{,}600.4$ km³/s² for Earth. For ${what}, $a_0 = ${a0}$ km. Mission design demands $|T - T_0| < ${eps}$ s. What is the largest tolerance $\delta$ on the orbit radius — $|a - a_0| < \delta$ — that guarantees it? Give $\delta$ in km to three significant figures.`,
          visual: { type: 'graph', params: { x: [a0 - 3, a0 + 3], y: [T0 - 4.5 * (T0 / a0), T0 + 4.5 * (T0 / a0)], aspect: 'wide', xlabel: 'orbit radius a (km)', ylabel: 'period T (s)', shade: [{ fn: `${(T0 + eps).toFixed(4)}`, lower: `${(T0 - eps).toFixed(4)}`, from: a0 - 3, to: a0 + 3, color: 'good', alpha: 0.16 }], curves: [{ fn: `2*pi*sqrt(x^3/${MU})`, color: 'accent', width: 2.2 }] }, caption: t`The period near $a_0$ with the band $T_0 \pm ${eps}$ s. Over a few kilometres the curve is almost straight, slightly steeper on the right.` },
          answer: ans, units: 'km', tol: { rel: 0.005 },
          hints: [t`$T$ increases with $a$, slightly faster on the right, so solve $T(a_0 + \delta) = T_0 + ${eps}$ s.`, t`$a = \bigl(\mu\,(T/2\pi)^2\bigr)^{1/3}$ with $T_0 = ${nice(T0, 6)}$ s.`],
          teach: t`An ε–δ tolerance is an engineering spec: $\varepsilon$ is what the mission needs, $\delta$ is what the launcher must deliver.`,
          explain: t`$T_0 = ${nice(T0, 6)}$ s. Solving $T(a_0 + \delta) = T_0 + ${eps}$ s gives $\delta = ${nice(ans, 3)}$ km. Close to the linear estimate $\varepsilon/T'(a_0) = \frac{2a_0\varepsilon}{3T_0}$: over such a narrow window the curve is almost a line.`,
        };
      },
    }),
    mcq({
      id: 'cp-delta-a', difficulty: 3,
      prompt: t`For $1/x$ at a point $a$ in $(0, 1)$, the same method as the worked example gives $\delta = \min\bigl(\tfrac a2,\ \tfrac{a^2\varepsilon}{2}\bigr)$. Fix $\varepsilon = 1$. What does the graph of this $\delta$ against $a$ tell you?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 0.55], aspect: 'wide', xlabel: 'a', ylabel: 'δ(a) for ε = 1', curves: [{ fn: 'min(x/2, x^2/2)', color: 'accent', width: 2.2 }] }, caption: t`The proof’s $\delta$ for $1/x$ at each point $a$ of $(0, 1)$, with $\varepsilon = 1$.` },
      choices: [t`Every $a$ has a $\delta$, but $\delta \to 0$ as $a \to 0$: no single $\delta$ serves every $a$ in $(0, 1)$`, t`$1/x$ is not continuous at points near $0$`, t`A single $\delta = \tfrac12$ serves every $a$ in $(0, 1)$`, t`The method fails near $0$, so a cleverer proof would give one $\delta$ for all $a$`],
      answer: 0,
      why: {
        1: t`At each $a > 0$ a $\delta$ exists, so $1/x$ is continuous there; only the *uniformity* fails.`,
        2: t`$\delta = \tfrac12$ fails at $a = 0.1$: the window $(-0.4, 0.6)$ contains points near $0$, where $1/x$ is huge.`,
        3: t`No proof can do better: near $0$ the curve is so steep that any fixed window around a small enough $a$ produces a change in $1/x$ larger than $1$.`,
      },
      hints: [t`Compare “$\forall a\ \forall\varepsilon\ \exists\delta$” with “$\forall\varepsilon\ \exists\delta\ \forall a$”.`, 'Read the height of the curve near a = 0.'],
      teach: t`When $\delta$ must depend on the point $a$ and shrinks to $0$, the function is continuous but not *uniformly* continuous — the subject of [G2.2](#/lesson/st-g.G2.2).`,
      explain: t`The order $\forall a\ \exists\delta$ allows $\delta$ to depend on $a$, and it must: $\delta(a) \to 0$. Asking for one $\delta$ for all $a$ ($\exists\delta\ \forall a$) is a stronger property, uniform continuity, which $1/x$ lacks on $(0, 1)$.`,
    }),
    mcq({
      id: 'cp-lyapunov', difficulty: 3, transfer: true,
      prompt: t`An equilibrium $x_*$ of a system (a satellite at a Lagrange point, say) is **Lyapunov stable** when $\forall\varepsilon > 0\ \exists\delta > 0$: every motion starting within $\delta$ of $x_*$ stays within $\varepsilon$ of it for all $t \ge 0$. Which statement says that $x_*$ is **unstable**?`,
      visual: { type: 'graph', params: { x: [0, 5], y: [-0.2, 1.4], aspect: 'wide', xlabel: 't', ylabel: 'distance from x*', shade: [{ fn: '0.8', lower: '0', from: 0, to: 5, color: 'good', alpha: 0.14 }], curves: [0.1, 0.05, 0.02].map((d, i) => ({ fn: `${d}*cosh(x)`, color: ['accent', 'gold', 'violet'][i], width: 2 })), hlines: [{ y: 0.8, color: 'good', label: 'ε' }] }, caption: t`Motions near a saddle-type equilibrium, starting $0.1$, $0.05$ and $0.02$ away: each eventually leaves the band. Distances follow $\delta\cosh t$, a linearized model.` },
      choices: [t`$\exists\varepsilon > 0\ \forall\delta > 0$: some motion starting within $\delta$ of $x_*$ is, at some time, at least $\varepsilon$ away`, t`$\forall\varepsilon > 0\ \forall\delta > 0$: every motion starting within $\delta$ is, at some time, at least $\varepsilon$ away`, t`$\exists\varepsilon > 0\ \exists\delta > 0$: some motion starting within $\delta$ leaves the $\varepsilon$ band`, t`$\forall\varepsilon > 0\ \exists\delta > 0$: some motion starting within $\delta$ leaves the $\varepsilon$ band`],
      answer: 0,
      why: {
        1: t`Too strong: a motion starting exactly at $x_*$ stays there, and many unstable points have some motions that stay close.`,
        2: t`Too weak: with a large $\delta$, even a stable equilibrium has motions starting far away that are far away.`,
        3: t`Only the inner part was negated; the quantifiers on $\varepsilon$ and $\delta$ must flip too.`,
      },
      hints: ['Flip every quantifier, then negate the innermost statement.', t`“Every motion stays close for all $t$” negates to “some motion, at some $t$, is far”.`],
      teach: t`Instability is the negation of a $\forall\varepsilon\ \exists\delta\ \forall$ motion $\forall t$ statement: one $\varepsilon$ that no starting tolerance can protect.`,
      explain: t`Negating $\forall\varepsilon\ \exists\delta\ \forall x_0\ \forall t$ gives $\exists\varepsilon\ \forall\delta\ \exists x_0\ \exists t$: however close you start, some motion eventually gets $\varepsilon$ away — as the three curves do for the band shown.`,
    }),
  ],
  sources: [
    { label: 'Abbott, Understanding Analysis, 2nd ed. (Springer, 2015), §4.2 (functional limits)', url: 'https://doi.org/10.1007/978-1-4939-2712-8' },
    { label: 'Lebl, Basic Analysis I, §3.1 (free online)', url: 'https://www.jirka.org/ra/' },
    { label: 'NASA Earth Fact Sheet: GM = 398 600 km³/s²', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
  ],
});
