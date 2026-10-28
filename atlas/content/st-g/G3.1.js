// Normed and inner-product spaces. A norm is a length obeying three axioms;
// an inner product is an angle-and-length machine whose norm obeys one more
// identity, the parallelogram law. Unit balls of ℓ¹, ℓ², ℓᵖ and ℓ^∞ in the
// plane; function norms (sup, L¹, L²) and the sequence xⁿ, which is far from 0
// in one norm and close in another — in infinite dimensions the choice of norm
// decides what converges. GR/GW ties: Minkowski's interval is not a norm; the
// matched-filter overlap is a normalized inner product.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;
const SG = (u) => `(2*step(${u}) - 1)`;
const BALL = (p) => [`${SG('cos(t)')}*abs(cos(t))^(2/${p})`, `${SG('sin(t)')}*abs(sin(t))^(2/${p})`];
const TWO_PI = 6.2832;

// the three classic unit balls, with optional extras
function balls({ arrows = [], points = [], caption, x = [-2.3, 2.3], y = [-1.5, 1.5], only = null, extraCurves = [] }) {
  const all = [
    { k: '1', param: BALL(1), color: 'gold', label: 'ℓ¹', labelAt: 0.785, labelDx: 2, labelDy: -4 },
    { k: '2', param: BALL(2), color: 'accent', label: 'ℓ²', labelAt: 1.2, labelDx: 4, labelDy: -6 },
    { k: 'inf', param: ['max(-1, min(1, 1.4142*cos(t)))', 'max(-1, min(1, 1.4142*sin(t)))'], color: 'good', label: 'ℓ∞', labelAt: 0.5, labelDx: 6, labelDy: 0 },
  ];
  return {
    type: 'graph',
    params: {
      x, y, equal: true, aspect: 'wide', xlabel: 'x₁', ylabel: 'x₂',
      curves: [...all.filter((c) => !only || only.includes(c.k)).map(({ k, ...c }) => ({ ...c, t: [0, TWO_PI], width: 2 })), ...extraCurves],
      arrows, points,
    },
    caption,
  };
}

export default lesson({
  id: 'st-g.G3.1',
  title: 'Normed and inner-product spaces',
  minutes: 13, difficulty: 3,
  intro: t`A **norm** measures the size of a vector. Any rule $\lVert v\rVert$ qualifies if it obeys three axioms: $\lVert v\rVert \ge 0$ with equality only for $v = 0$; $\lVert cv\rVert = |c|\,\lVert v\rVert$; and the triangle inequality $\lVert u + v\rVert \le \lVert u\rVert + \lVert v\rVert$. The plane alone carries a whole family, the $\ell^p$ norms:

$$\begin{gathered}\lVert x\rVert_p = \bigl(|x_1|^p + |x_2|^p + \dots + |x_n|^p\bigr)^{1/p} \\ \lVert x\rVert_\infty = \max_i |x_i|\end{gathered}$$

An **inner product** $\langle u, v\rangle$ gives angles as well as lengths, with $\lVert v\rVert = \sqrt{\langle v, v\rangle}$ — that is $\ell^2$, the familiar dot product of [inner products and orthogonality](#/lesson/math2270.LA-10.1). The same definitions apply to **functions**, where they stop being interchangeable: a sequence can shrink to $0$ in one norm and stay put in another.`,
  symbols: [
    { tex: '\\lVert x\\rVert_p', text: t`the $\ell^p$ norm of $x = (x_1, \dots, x_n)$, for $1 \le p < \infty$; $p = 2$ is Euclidean length` },
    { tex: '\\lVert x\\rVert_\\infty', text: t`the largest component in absolute value — the limit of $\lVert x\rVert_p$ as $p \to \infty$` },
    { tex: 'p', text: t`the exponent; it must be at least $1$, or the triangle inequality fails` },
    { tex: '\\langle u, v\\rangle', text: t`an inner product: linear in each slot (conjugate-linear in one, for complex spaces), symmetric, and $\langle v, v\rangle > 0$ for $v \ne 0$` },
  ],
  why: 'Quantum states live in an inner-product space, the well-posedness theorems for Einstein’s equations are statements about norms of the initial data, and gravitational-wave searches rank templates by an inner product — the norm you pick decides what “close” means.',
  visual: {
    type: 'graph',
    title: 'Unit balls of the plane',
    lead: t`The blue curve is the unit “circle” $\lVert x\rVert_p = 1$; the dashed reference shapes are $\ell^1$ (diamond), $\ell^2$ (circle) and $\ell^\infty$ (square). Drag the white point to a vector $v$ and read its length in each norm. The last readout tests the parallelogram law with $u = (1, 0)$.`,
    tasks: [
      t`Slide $p$ from $1$ to $8$: the diamond swells through the circle toward the square. Every $\ell^p$ ball is convex — that is the triangle inequality, pictured.`,
      t`Put $v$ at $(1, 1)$: its lengths are $2$, $\sqrt2$ and $1$. Different norms, different numbers; but in the plane each is within a factor $2$ of the others.`,
      t`Watch the parallelogram defect: it vanishes for every $v$ only at $p = 2$. Only the Euclidean norm comes from an inner product.`,
    ],
    params: {
      x: [-2.3, 2.3], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: 'x₁', ylabel: 'x₂',
      sliders: [{ key: 'p', label: t`Exponent $p$`, min: 1, max: 8, step: 0.05, value: 1.5, explain: t`Which $\ell^p$ norm the blue curve shows: $p = 1$ is the diamond, $p = 2$ the circle, large $p$ approaches the square.` }],
      drag: [{ key: 'v', x: 1, y: 0.6 }],
      curves: [
        { param: BALL(1), t: [0, TWO_PI], color: 'gold', width: 1.2, dash: true },
        { param: BALL(2), t: [0, TWO_PI], color: 'ink3', width: 1.2, dash: true },
        { param: ['max(-1, min(1, 1.4142*cos(t)))', 'max(-1, min(1, 1.4142*sin(t)))'], t: [0, TWO_PI], color: 'good', width: 1.2, dash: true },
        { param: BALL('p'), t: [0, TWO_PI], color: 'accent', width: 2.6, label: 'ℓᵖ unit ball', labelAt: 2.3, labelDx: -96, labelDy: -6 },
      ],
      arrows: [{ from: [0, 0], to: ['vx', 'vy'], color: 'violet', width: 2.2, label: 'v', labelDx: 8 }],
      readouts: [
        { label: t`$\lVert v\rVert_1$`, expr: 'abs(vx) + abs(vy)', digits: 3 },
        { label: t`$\lVert v\rVert_2$`, expr: 'sqrt(vx^2 + vy^2)', digits: 3 },
        { label: t`$\lVert v\rVert_\infty$`, expr: 'max(abs(vx), abs(vy))', digits: 3 },
        { label: t`$\lVert v\rVert_p$`, expr: '(abs(vx)^p + abs(vy)^p)^(1/p)', digits: 3 },
        { label: t`parallelogram defect $\lVert u{+}v\rVert_p^2 + \lVert u{-}v\rVert_p^2 - 2\lVert u\rVert_p^2 - 2\lVert v\rVert_p^2$`, expr: '((abs(1 + vx)^p + abs(vy)^p)^(1/p))^2 + ((abs(1 - vx)^p + abs(vy)^p)^(1/p))^2 - 2 - 2*((abs(vx)^p + abs(vy)^p)^(1/p))^2', digits: 3, zero: 1e-9 },
      ],
    },
    caption: t`Each curve is the set of vectors of length $1$ in its norm. The blue curve is drawn from $|x_1|^p + |x_2|^p = 1$ exactly. A norm is fixed by its unit ball: a convex shape, symmetric through the origin.`,
  },
  example: {
    prompt: t`On $[0, 1]$ compare three norms of $f_n(x) = x^n$: the sup norm $\lVert f\rVert_\infty = \sup|f|$, the $L^1$ norm $\int_0^1 |f|\,dx$ and the $L^2$ norm $\bigl(\int_0^1 |f|^2dx\bigr)^{1/2}$. Does $f_n \to 0$?`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 1.02], y: [0, 1.08], aspect: 'wide', xlabel: 'x', ylabel: 'y',
        curves: [{ fn: 'x^10', color: 'accent', width: 2.2, label: 'x¹⁰', labelAt: 0.9, labelDx: -36, labelDy: -6 }, { fn: 'x^20', color: 'violet', width: 1.8, dash: true, label: 'x²⁰ squared', labelAt: 0.97, labelDx: -96, labelDy: 6 }],
        shade: [{ fn: 'x^20', from: 0, to: 1, color: 'violet', alpha: 0.25 }],
        points: [{ x: 1, y: 1, r: 5, color: 'gold', label: 'sup = 1', labelDx: -60, labelDy: -8 }],
      },
      caption: t`$f_{10} = x^{10}$ and its square $x^{20}$ (dashed), whose area is $\lVert f_{10}\rVert_2^2 = 1/21$. The height at $x = 1$ stays $1$; the area under the square shrinks.`,
    },
    steps: [
      { label: 'Sup norm', text: t`$\lVert x^n\rVert_\infty = \sup_{[0,1]} x^n = 1$ for every $n$ (at $x = 1$). In this norm $f_n$ never gets closer to $0$.` },
      { label: 'L1 norm', text: t`$\lVert x^n\rVert_1 = \int_0^1 x^n\,dx = \dfrac{1}{n + 1} \to 0$.` },
      { label: 'L2 norm', text: t`$\lVert x^n\rVert_2^2 = \int_0^1 x^{2n}\,dx = \dfrac{1}{2n + 1}$, so $\lVert x^n\rVert_2 = \dfrac{1}{\sqrt{2n + 1}}$: $${nice(1 / Math.sqrt(21), 3)}$ at $n = 10$, $${nice(1 / Math.sqrt(101), 3)}$ at $n = 50$. It tends to $0$.` },
      { label: 'The verdict depends on the norm', text: t`$f_n \to 0$ in $L^1$ and in $L^2$, not in the sup norm. In $\mathbb R^n$ this cannot happen — there all norms are **equivalent** ($\lVert x\rVert_\infty \le \lVert x\rVert_2 \le \sqrt n\,\lVert x\rVert_\infty$) — but no constant $C$ gives $\lVert f\rVert_\infty \le C\lVert f\rVert_2$ for all continuous $f$: the ratio here is $\sqrt{2n + 1}$, unbounded.` },
      { label: 'Sense check', text: t`The sup norm sees the worst point; $L^2$ sees energy — the mean of $f^2$. A thin spike carries little energy. The Gibbs overshoot of a Fourier series is the same story: its $L^2$ error goes to $0$ while its sup error does not.` },
    ],
    answer: t`$\lVert x^n\rVert_\infty = 1$, $\lVert x^n\rVert_1 = \frac{1}{n+1}$, $\lVert x^n\rVert_2 = \frac{1}{\sqrt{2n+1}}$. So $x^n \to 0$ in $L^1$ and $L^2$ but not uniformly: on function spaces, convergence is always “in a norm”.`,
  },
  practice: [
    num({
      id: 'p-norms', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[3, -4], [-2, 1], [1, 2], [-3, 1], [2, -2], [4, 3]]);
        const [which, name, val] = r.pick([[1, t`\lVert v\rVert_1`, Math.abs(a) + Math.abs(b)], [2, t`\lVert v\rVert_2`, Math.hypot(a, b)], [0, t`\lVert v\rVert_\infty`, Math.max(Math.abs(a), Math.abs(b))]]);
        const s = Math.max(Math.abs(a), Math.abs(b)) + 0.8;
        return {
          prompt: t`For $v = (${a}, ${b})$, find $${name}$.`,
          visual: { ...balls({ arrows: [{ from: [0, 0], to: [a, b], color: 'violet', width: 2.2, label: `v = (${a}, ${b})`, labelDx: 8 }], x: [-1.6 * s, 1.6 * s], y: [-s, s], caption: t`The vector $v$ beside the unit balls of $\ell^1$, $\ell^2$ and $\ell^\infty$. Its length in each norm is the factor by which that ball must be scaled to reach it.` }) },
          answer: val, tol: { rel: 0.005 },
          errors: [
            { value: Math.abs(a) + Math.abs(b), feedback: t`That is $\lVert v\rVert_1$, the sum of the absolute values.` },
            { value: Math.hypot(a, b), feedback: t`That is $\lVert v\rVert_2$, Euclidean length.` },
            { value: Math.max(Math.abs(a), Math.abs(b)), feedback: t`That is $\lVert v\rVert_\infty$, the largest component.` },
            { value: a + b, feedback: 'Take absolute values before adding.' },
          ].filter((e) => Math.abs(e.value - val) > 0.01 * val),
          hints: [t`$\lVert v\rVert_1 = |v_1| + |v_2|$, $\lVert v\rVert_2 = \sqrt{v_1^2 + v_2^2}$, $\lVert v\rVert_\infty = \max(|v_1|, |v_2|)$.`],
          teach: t`The $\ell^1$, $\ell^2$ and $\ell^\infty$ norms add, square-and-root, and take the largest component; always $\lVert v\rVert_\infty \le \lVert v\rVert_2 \le \lVert v\rVert_1$.`,
          explain: t`$\lVert v\rVert_1 = ${Math.abs(a) + Math.abs(b)}$, $\lVert v\rVert_2 = ${nice(Math.hypot(a, b), 4)}$, $\lVert v\rVert_\infty = ${Math.max(Math.abs(a), Math.abs(b))}$. The one asked for is $${nice(val, 4)}$.`,
        };
      },
    }),
    num({
      id: 'parallelogram', difficulty: 2,
      gen(r) {
        const [u, v] = r.pick([[[1, 0], [0, 1]], [[2, 1], [1, -1]], [[1, 2], [2, 0]], [[3, 1], [1, 2]]]);
        const [pn, pname] = r.pick([[1, t`\ell^1`], [0, t`\ell^\infty`]]);
        const N = (w) => (pn === 1 ? Math.abs(w[0]) + Math.abs(w[1]) : Math.max(Math.abs(w[0]), Math.abs(w[1])));
        const sum = [u[0] + v[0], u[1] + v[1]], dif = [u[0] - v[0], u[1] - v[1]];
        const ans = N(sum) ** 2 + N(dif) ** 2 - 2 * N(u) ** 2 - 2 * N(v) ** 2;
        const s = Math.max(...[...sum, ...dif].map(Math.abs)) + 0.6;
        return {
          prompt: t`The parallelogram law $\lVert u + v\rVert^2 + \lVert u - v\rVert^2 = 2\lVert u\rVert^2 + 2\lVert v\rVert^2$ holds for every norm that comes from an inner product. In the $${pname}$ norm, with $u = (${u[0]}, ${u[1]})$ and $v = (${v[0]}, ${v[1]})$, compute the defect $\lVert u + v\rVert^2 + \lVert u - v\rVert^2 - 2\lVert u\rVert^2 - 2\lVert v\rVert^2$.`,
          visual: { type: 'graph', params: { x: [-1.6 * s, 1.6 * s], y: [-s, s], equal: true, aspect: 'wide', arrows: [{ from: [0, 0], to: u, color: 'accent', width: 2.2, label: 'u' }, { from: [0, 0], to: v, color: 'gold', width: 2.2, label: 'v' }, { from: [0, 0], to: sum, color: 'violet', width: 1.6, dash: true, label: 'u + v' }, { from: v, to: u, color: 'bad', width: 1.6, dash: true, label: 'u − v' }], curves: [{ param: [`${u[0]} + ${v[0]}*t`, `${u[1]} + ${v[1]}*t`], t: [0, 1], color: 'ink4', width: 1 }, { param: [`${v[0]} + ${u[0]}*t`, `${v[1]} + ${u[1]}*t`], t: [0, 1], color: 'ink4', width: 1 }] }, caption: t`The parallelogram on $u$ and $v$ with its two diagonals, $u + v$ and $u - v$.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 0, feedback: t`Zero would mean the law holds, as it does in $\ell^2$. Compute the $${pname}$ lengths: ${pn === 1 ? 'add absolute values' : 'take the largest absolute component'}.` }].filter(() => ans !== 0),
          hints: [t`Find the four lengths: $\lVert u\rVert$, $\lVert v\rVert$, $\lVert u + v\rVert$ with $u + v = (${sum[0]}, ${sum[1]})$, and $\lVert u - v\rVert$ with $u - v = (${dif[0]}, ${dif[1]})$.`, t`In $${pname}$: $\lVert u\rVert = ${N(u)}$, $\lVert v\rVert = ${N(v)}$, $\lVert u + v\rVert = ${N(sum)}$, $\lVert u - v\rVert = ${N(dif)}$.`],
          teach: t`A nonzero parallelogram defect proves a norm does not come from any inner product; among the $\ell^p$ norms only $p = 2$ passes.`,
          explain: t`$${N(sum)}^2 + ${N(dif)}^2 - 2\cdot${N(u)}^2 - 2\cdot${N(v)}^2 = ${ans}$. ${ans !== 0 ? `Not zero, so the $${pname}$ norm has no inner product behind it: it has lengths but no angles.` : `Zero for this pair — but other pairs (try $(1, 0)$ and $(0, 1)$) break the law, so no inner product exists.`}`,
        };
      },
    }),
    multi({
      id: 'not-norms', difficulty: 2,
      prompt: t`Which of these are **not** norms on $\mathbb R^2$? Select **every** one that fails an axiom.`,
      visual: balls({ only: ['1'], extraCurves: [{ param: BALL(0.5), t: [0, TWO_PI], color: 'bad', width: 2.4, label: '(√|x₁| + √|x₂|)² = 1', labelAt: 0.785, labelDx: 6, labelDy: -6 }], caption: t`The “unit ball” of $(\sqrt{|x_1|} + \sqrt{|x_2|})^2$ (red) inside the $\ell^1$ diamond (gold). It is not convex.` }),
      choices: [t`$|x_1|$`, t`$\bigl(\sqrt{|x_1|} + \sqrt{|x_2|}\bigr)^2$`, t`$x_1^2 + x_2^2$`, t`$|x_1| + |x_2|$`, t`$\max(|x_1|, |x_2|)$`, t`$\sqrt{x_1^2 + 4x_2^2}$`],
      answer: [0, 1, 2],
      why: {
        3: t`The $\ell^1$ norm: all three axioms hold.`,
        4: t`The $\ell^\infty$ norm: all three axioms hold.`,
        5: t`A weighted Euclidean norm, from the inner product $x_1y_1 + 4x_2y_2$; its unit ball is an ellipse.`,
      },
      hints: [t`Test each axiom: is $(0, 1)$ given length $0$? Does doubling $v$ double the length? Is the unit ball convex?`, t`For the red curve, try $u = (1, 0)$, $v = (0, 1)$ in the triangle inequality.`],
      teach: t`A norm needs definiteness, homogeneity and the triangle inequality — equivalently, a unit ball that is convex, symmetric and bounded.`,
      explain: t`$|x_1|$ gives $(0, 1)$ length $0$ (definiteness fails). $x_1^2 + x_2^2$ quadruples when $v$ doubles (homogeneity fails). For the red one, $\lVert(1, 1)\rVert = 4 > 1 + 1$ (triangle inequality fails — the non-convex ball).`,
    }),
    num({
      id: 'l2-linear', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.int(1, 3);
        const sq = a * a / 3 + a * b + b * b, ans = Math.sqrt(sq);
        const hi = Math.max(b, a + b, 0) + 0.5, lo = Math.min(0, a + b) - 0.3;
        return {
          prompt: t`Find the $L^2$ norm of $f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x + ${b}$ on $[0, 1]$: $\lVert f\rVert_2 = \left(\int_0^1 f(x)^2\,dx\right)^{1/2}$. Give three significant figures.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [Math.min(lo, 0), Math.max(hi, (Math.max(b * b, (a + b) ** 2)) + 0.5)], aspect: 'wide', curves: [{ fn: `${a}x + ${b}`, color: 'accent', width: 2.2, label: 'f', labelAt: 0.8, labelDy: -8 }, { fn: `(${a}x + ${b})^2`, color: 'violet', width: 1.8, dash: true, label: 'f²', labelAt: 0.5, labelDy: -8 }], shade: [{ fn: `(${a}x + ${b})^2`, from: 0, to: 1, color: 'violet', alpha: 0.2 }] }, caption: t`$f$ and $f^2$ (dashed). The shaded area is $\lVert f\rVert_2^2$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: sq, feedback: t`That is $\lVert f\rVert_2^2$, the area. Take the square root.` }, { value: Math.abs(a / 2 + b), feedback: t`That is $\int_0^1 f\,dx$, the mean value, not the root-mean-square.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$f^2 = ${a * a}x^2 + ${2 * a * b}x + ${b * b}$.`, t`$\int_0^1 f^2\,dx = \frac{${a * a}}{3} + \frac{${2 * a * b}}{2} + ${b * b} = ${nice(sq, 5)}$.`],
          teach: t`The $L^2$ norm is the root-mean-square of $f$ over the interval: integrate the square, then take the root.`,
          explain: t`$\int_0^1 (${a}x + ${b})^2dx = ${nice(sq, 5)}$, so $\lVert f\rVert_2 = ${nice(ans, 4)}$. On $[0, 1]$ it lies between the mean of $|f|$ and the largest value of $|f|$.`,
        };
      },
    }),
    num({
      id: 'equivalence', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 4, 9, 16, 100]);
        return {
          prompt: t`In $\mathbb R^{${n}}$, what is the smallest constant $C$ with $\lVert x\rVert_2 \le C\,\lVert x\rVert_\infty$ for **every** vector $x$?`,
          visual: balls({ only: ['2', 'inf'], extraCurves: [{ param: ['1.4142*cos(t)', '1.4142*sin(t)'], t: [0, TWO_PI], color: 'accent', width: 1.2, dash: true, label: 'radius √2', labelAt: 0.6, labelDx: 6 }], points: [{ x: 1, y: 1, r: 5, color: 'gold', label: '(1, 1)', labelDx: 8 }], caption: t`In the plane: the $\ell^\infty$ unit square fits inside the $\ell^2$ circle of radius $\sqrt2$, touching it at the corners such as $(1, 1)$.` }),
          answer: Math.sqrt(n), tol: { rel: 0.005 },
          errors: [{ value: n, feedback: t`That is the constant for $\lVert x\rVert_1 \le C\lVert x\rVert_\infty$. For $\ell^2$, squares add: $\sqrt{${n}}$.` }, { value: 1, feedback: t`$1$ works the other way round, $\lVert x\rVert_\infty \le \lVert x\rVert_2$.` }].filter((e) => Math.abs(e.value - Math.sqrt(n)) > 0.01),
          hints: [t`The worst case is a corner of the cube: every component equal, $x = (1, 1, \dots, 1)$.`, t`Then $\lVert x\rVert_\infty = 1$ and $\lVert x\rVert_2 = \sqrt{${n}}$.`],
          teach: t`In $n$ dimensions $\lVert x\rVert_\infty \le \lVert x\rVert_2 \le \sqrt n\,\lVert x\rVert_\infty$; the constant grows with $n$, which is why it disappears in infinite dimensions.`,
          explain: t`Each $|x_i| \le \lVert x\rVert_\infty$, so $\lVert x\rVert_2^2 \le ${n}\lVert x\rVert_\infty^2$, with equality for $(1, \dots, 1)$: $C = \sqrt{${n}} = ${nice(Math.sqrt(n), 4)}$. On a space of functions no finite $C$ exists — the worked example’s $x^n$ needs $C \ge \sqrt{2n + 1}$.`,
        };
      },
    }),
    mcq({
      id: 'l2-pointwise', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “$\lVert g_n\rVert_2 \to 0$, so $g_n(x) \to 0$ at every $x$.” Test it with $g_n = $ the indicator of $[0, 1/n]$ ($1$ there, $0$ elsewhere on $[0, 1]$). What is wrong?`,
      visual: { type: 'graph', params: { x: [-0.05, 1.05], y: [-0.1, 1.3], aspect: 'wide', curves: [[1, 'gold'], [0.5, 'accent2'], [0.2, 'accent'], [0.1, 'violet']].map(([w, c]) => ({ fn: `step(${w} - x)`, color: c, width: 2, domain: [0, 1], samples: 2000 })), points: [{ x: 0, y: 1, r: 5, color: 'bad', label: 'gₙ(0) = 1 for every n', labelDx: 10, labelDy: -10 }] }, caption: t`$g_1, g_2, g_5, g_{10}$: boxes of height $1$ and width $1/n$.` },
      choices: [t`$\lVert g_n\rVert_2 = 1/\sqrt n \to 0$, yet $g_n(0) = 1$ for every $n$: $L^2$ convergence does not imply convergence at points`, t`The student is right: $g_n(x) \to 0$ at every $x$`, t`$\lVert g_n\rVert_2$ does not tend to $0$`, t`$L^2$ convergence implies uniform convergence, so the student should have concluded more`],
      answer: 0,
      why: {
        1: t`At $x = 0$ every $g_n$ equals $1$.`,
        2: t`$\lVert g_n\rVert_2^2 = \int_0^{1/n}1\,dx = 1/n$, which tends to $0$.`,
        3: t`The sup norm of every $g_n$ is $1$: no uniform convergence at all.`,
      },
      hints: [t`Compute $\lVert g_n\rVert_2^2 = \int_0^1 g_n^2\,dx$.`, t`Then look at the single point $x = 0$.`],
      teach: t`The $L^2$ norm is an average; it cannot see a single point, so $L^2$ convergence says nothing about values at points.`,
      explain: t`$\lVert g_n\rVert_2 = 1/\sqrt n \to 0$ while $g_n(0) = 1$. In $L^2$, functions that differ at a single point are the same vector — which is why the next lesson treats $L^2$ functions as equivalence classes.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-minkowski', difficulty: 3, transfer: true,
      prompt: t`Special relativity measures a displacement $(\Delta t, \Delta x)$ by the interval $\Delta s^2 = -\Delta t^2 + \Delta x^2$ (with $c = 1$). Why is $\sqrt{|\Delta s^2|}$ **not** a norm on spacetime?`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'x', color: 'gold', width: 1.6, dash: true, label: 'light: Δs² = 0', labelAt: 1.2, labelDx: 6, labelDy: 4 }, { fn: '-x', color: 'gold', width: 1.6, dash: true }, { param: ['sinh(t)', 'cosh(t)'], t: [-1.1, 1.1], color: 'accent', width: 2 }, { param: ['cosh(t)', 'sinh(t)'], t: [-1.1, 1.1], color: 'violet', width: 2 }], points: [{ x: -1.2, y: 1.2, r: 5, color: 'bad', label: 'nonzero, “length” 0', labelAlign: 'right', labelDx: -10, labelDy: 0 }] }, caption: t`The light cone (dashed) and the curves $|\Delta s^2| = 1$: hyperbolae, not a closed convex curve around the origin.` },
      choices: [t`Light-like displacements are nonzero but have $\Delta s^2 = 0$, so definiteness fails (and the triangle inequality fails too)`, t`It fails homogeneity: doubling a displacement does not double $\sqrt{|\Delta s^2|}$`, t`It is a norm; it is just written with a minus sign`, t`It fails only because time and space have different units`],
      answer: 0,
      why: {
        1: t`$\sqrt{|(2\Delta t)^2 - (2\Delta x)^2|} = 2\sqrt{|\Delta t^2 - \Delta x^2|}$: homogeneity holds.`,
        2: t`A norm must give every nonzero vector a positive length; the light cone is full of nonzero vectors of length zero.`,
        3: t`With $c = 1$ the units agree; the failure is the indefinite sign.`,
      },
      hints: [t`Try $\Delta t = \Delta x = 1$.`, 'Which norm axiom does a nonzero vector of length 0 break?'],
      teach: t`The Minkowski interval is an indefinite quadratic form, not an inner product: null vectors have zero “length”, and for timelike vectors the triangle inequality reverses (the twin paradox).`,
      explain: t`$(1, 1)$ is nonzero with $\Delta s^2 = 0$. And for two future timelike displacements, the proper time of the sum is *at least* the sum of proper times — a reversed triangle inequality. Spacetime geometry is built on a metric that is not a norm.`,
    }),
    num({
      id: 'cp-overlap', difficulty: 3, transfer: true,
      gen(r) {
        const O = r.pick([0.99, 0.97, 0.95, 0.9]);
        const ans = Math.acos(O) * 180 / Math.PI;
        return {
          prompt: t`A gravitational-wave search compares data with templates through an inner product $\langle a, b\rangle = \int_0^T a(t)\,b(t)\,dt$ (the white-noise case). For a signal $h = \sin(2\pi f t)$ and a template $\sin(2\pi f t + \phi)$, over a whole number of cycles, the normalized overlap $\dfrac{\langle h, g\rangle}{\lVert h\rVert\,\lVert g\rVert}$ equals $\cos\phi$. What is the largest phase error $\phi$, in degrees, that keeps the overlap at least $${O}$?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1.4, 1.4], aspect: 'wide', xlabel: 't (cycles)', ylabel: '', curves: [{ fn: 'sin(2*pi*x)', color: 'accent', width: 2, label: 'signal', labelAt: 0.25, labelDy: -8 }, { fn: 'sin(2*pi*x + 0.6)', color: 'gold', width: 2, dash: true, label: 'template, shifted', labelAt: 1.1, labelDy: -10 }] }, caption: t`A signal and a phase-shifted template over two cycles (the shift drawn is $0.6$ rad, for illustration). Cauchy–Schwarz guarantees the overlap is at most $1$.` },
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: Math.acos(O), feedback: 'That is the angle in radians; the question asks for degrees.' }],
          hints: [t`The overlap is the cosine of the angle between the two vectors: solve $\cos\phi = ${O}$.`, t`$\phi = \arccos ${O}$; convert radians to degrees with $180/\pi$.`],
          teach: t`Cauchy–Schwarz, $|\langle a, b\rangle| \le \lVert a\rVert\,\lVert b\rVert$, makes the normalized overlap a cosine: it measures an angle between waveforms.`,
          explain: t`$\phi = \arccos ${O} = ${nice(ans, 3)}^\circ$. Real searches use a noise-weighted inner product and maximize over phase and arrival time, but the overlap is still the cosine of an angle in a function space.`,
        };
      },
    }),
    multi({
      id: 'cp-inner-products', difficulty: 3,
      prompt: t`Which of these are inner products on the space of continuous real functions on $[0, 1]$? Select **every** one.`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.2, 1.2], aspect: 'wide', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2.2, label: 'f(x) = sin πx', labelAt: 0.5, labelDy: -10 }], points: [{ x: 0, y: 0, r: 5, color: 'bad', label: 'f(0) = 0', labelDx: 8, labelDy: -10 }] }, caption: t`A nonzero function that vanishes at $x = 0$ — a useful test case.` },
      choices: [t`$\langle f, g\rangle = \int_0^1 f(x)\,g(x)\,dx$`, t`$\langle f, g\rangle = \int_0^1 f(x)\,g(x)\,e^{x}\,dx$`, t`$\langle f, g\rangle = f(0)\,g(0)$`, t`$\langle f, g\rangle = \int_0^1 f(x)\,g'(x)\,dx$`, t`$\langle f, g\rangle = \max_{[0,1]}|f(x)\,g(x)|$`],
      answer: [0, 1],
      why: {
        2: t`$\sin\pi x$ is nonzero but $\langle f, f\rangle = f(0)^2 = 0$: not positive definite.`,
        3: t`Not symmetric: $\int f g' \ne \int f' g$ in general — and it needs $g$ differentiable.`,
        4: t`Not linear: $\max|(f_1 + f_2)g| \ne \max|f_1g| + \max|f_2g|$ in general.`,
      },
      hints: ['Check linearity, symmetry and positive definiteness one at a time.', t`For definiteness, try the function in the picture.`],
      teach: t`An inner product must be bilinear, symmetric and positive definite; a positive weight function keeps all three, so weighted $L^2$ products are inner products too.`,
      explain: t`$\int fg\,dx$ and $\int fg\,e^x\,dx$ are inner products; a positive weight is exactly what the noise-weighted gravitational-wave product and Sturm–Liouville problems use. The others fail definiteness, symmetry or linearity.`,
    }),
  ],
  sources: [
    { label: 'Kreyszig, Introductory Functional Analysis with Applications (Wiley, 1978), chs. 2–3', url: 'https://openlibrary.org/isbn/9780471504597' },
    { label: 'Lebl, Basic Analysis II, §8.1 (normed spaces; free online)', url: 'https://www.jirka.org/ra/' },
    { label: 'Allen et al., FINDCHIRP, Phys. Rev. D 85, 122006 (2012): the matched-filter inner product', url: 'https://arxiv.org/abs/gr-qc/0509116' },
  ],
});
