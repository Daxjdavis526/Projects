// Expanding and factoring — products as rectangles, read in both directions.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, sgn, areaModel, bothSides } from './_m0kit.js';

const t = String.raw;

// the area model of (kx + p)(mx + q) for positive k, p, m, q; x is drawn 3 units long, numbers half a unit each
// labels: [corner x², strip px (along the bottom), strip qx (up the side), corner pq]
function boxModel({ k = 1, p, m = 1, q, labels, caption, X = 3, s = 0.5, qLabel }) {
  const w1 = k * X, w2 = p * s, h1 = m * X, h2 = qLabel ? 0.9 : q * s;   // an unknown side is drawn at a neutral height
  const xs = (c) => (c === 1 ? 'x' : `${c}x`);
  return areaModel({
    x: [-1.2, w1 + w2 + 0.6], y: [-0.9, h1 + h2 + 0.4],
    rects: [
      { x: 0, y: 0, w: w1, h: h1, color: 'accent', label: labels[0] },
      { x: w1, y: 0, w: w2, h: h1, color: 'gold', label: labels[1] },
      { x: 0, y: h1, w: w1, h: h2, color: 'gold', label: labels[2] },
      { x: w1, y: h1, w: w2, h: h2, color: 'teal', label: labels[3] },
    ],
    sides: [{ x: w1 / 2, y: -0.4, label: xs(k) }, { x: w1 + w2 / 2, y: -0.4, label: String(p) }, { x: -0.55, y: h1 / 2, label: xs(m) }, { x: -0.55, y: h1 + h2 / 2, label: qLabel ?? String(q) }],
    caption,
  });
}

export default lesson({
  id: 'm0.M0-2.1',
  title: 'Expanding and factoring',
  minutes: 9, difficulty: 2,
  intro: t`A product of two sums is the area of a rectangle cut into pieces. **Expanding** adds up the pieces; **factoring** finds the rectangle’s sides from the pieces. The most-used case is a square:

$$(a + b)^2 = a^2 + 2ab + b^2$$

The middle term $2ab$ is the two strips that the most common algebra slip of all, $(a+b)^2 = a^2 + b^2$, forgets. Its partner is the difference of squares, $a^2 - b^2 = (a - b)(a + b)$.`,
  symbols: [
    { tex: 'a,\\ b', text: 'any two numbers or expressions — lengths of the two parts of each side in the picture' },
    { tex: 'a^2,\\ b^2', text: 'the two squares on the diagonal of the big square' },
    { tex: '2ab', text: 'the two $a$-by-$b$ strips: the **cross terms**' },
    { tex: '(a - b)(a + b)', text: 'the factored form of a difference of two squares; there are no cross terms because they cancel' },
  ],
  why: t`Factoring finds the zeros of a polynomial, expansion powers every series approximation, and the cross term $2ab$ is where interference lives — in optics, in quantum amplitudes, and in $|\vec a + \vec b|^2$.`,
  visual: {
    type: 'graph',
    title: 'The square of a sum, as an area',
    lead: t`The big square has side $a + b$, so its area is $(a + b)^2$. It is made of the square $a^2$ (blue), the square $b^2$ (teal) and two $a$-by-$b$ strips (gold). Change $a$ and $b$ and compare the readouts.`,
    tasks: [
      t`Whatever $a$ and $b$ are, $(a+b)^2$ and $a^2 + b^2$ differ by the gold strips, $2ab$.`,
      t`Shrink $b$ toward zero: the strips thin out, and $(a+b)^2 \approx a^2 + 2ab$ — the start of every linear approximation.`,
      t`Set $a = b$: the strips together have the same area as the two squares, so $a^2 + b^2$ misses half of the total.`,
    ],
    params: {
      x: [-0.8, 6.6], y: [-0.8, 6.3], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      sliders: [
        { key: 'a', label: t`Side part $a$`, min: 0.5, max: 4, step: 0.1, value: 3.5, explain: t`The longer part of each side of the big square.` },
        { key: 'b', label: t`Side part $b$`, min: 0.2, max: 2.5, step: 0.1, value: 1.5, explain: t`The shorter part of each side.` },
      ],
      shade: [
        { fn: 'a', lower: '0', from: 0, to: 'a', color: 'accent', alpha: 0.35 },
        { fn: 'a', lower: '0', from: 'a', to: 'a + b', color: 'gold', alpha: 0.35 },
        { fn: 'a + b', lower: 'a', from: 0, to: 'a', color: 'gold', alpha: 0.35 },
        { fn: 'a + b', lower: 'a', from: 'a', to: 'a + b', color: 'teal', alpha: 0.35 },
      ],
      curves: [
        { fn: '0', domain: [0, 'a + b'], color: 'ink3', width: 1.4 }, { fn: 'a', domain: [0, 'a + b'], color: 'ink3', width: 1.4 }, { fn: 'a + b', domain: [0, 'a + b'], color: 'ink3', width: 1.4 },
        { param: ['0', 't'], t: [0, 'a + b'], color: 'ink3', width: 1.4 }, { param: ['a', 't'], t: [0, 'a + b'], color: 'ink3', width: 1.4 }, { param: ['a + b', 't'], t: [0, 'a + b'], color: 'ink3', width: 1.4 },
      ],
      points: [
        { x: 'a/2', y: 'a/2', r: 0, label: 'a²', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 'a + b/2', y: 'a/2', r: 0, label: 'ab', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 'a/2', y: 'a + b/2', r: 0, label: 'ab', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 'a + b/2', y: 'a + b/2', r: 0, label: 'b²', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink' },
        { x: 'a/2', y: -0.4, r: 0, label: 'a', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
        { x: 'a + b/2', y: -0.4, r: 0, label: 'b', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
        { x: -0.4, y: 'a/2', r: 0, label: 'a', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
        { x: -0.4, y: 'a + b/2', r: 0, label: 'b', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
      ],
      readouts: [{ label: t`$(a+b)^2$`, expr: '(a + b)^2', digits: 3 }, { label: t`$a^2 + b^2$`, expr: 'a^2 + b^2', digits: 3 }, { label: t`$2ab$ (gold)`, expr: '2a b', digits: 3 }],
    },
    caption: t`An exact picture for positive $a$ and $b$. The algebra holds for negative numbers too, where “area” stops being a literal description.`,
  },
  example: {
    prompt: t`Factor $x^2 + 5x + 6$.`,
    visual: boxModel({ p: 2, q: 3, labels: ['x²', '2x', '3x', '6'], caption: t`The rectangle $(x + 2)$ by $(x + 3)$: one $x^2$, strips $2x$ and $3x$, and a corner of $6$. The length of $x$ is drawn arbitrarily.` }),
    steps: [
      { label: 'Picture the answer', text: t`We want a rectangle $(x + p)$ by $(x + q)$. Its pieces are $x^2$, two strips $px$ and $qx$, and the corner $pq$.` },
      { label: 'Match the pieces', text: t`The strips must add to $5x$, so $p + q = 5$; the corner must be $6$, so $pq = 6$.` },
      { label: 'Find the pair', text: t`Pairs with product $6$: $(1, 6)$, $(2, 3)$. Only $2 + 3 = 5$.` },
      { label: 'Write it', text: t`$x^2 + 5x + 6 = (x + 2)(x + 3)$.` },
      { label: 'Check by expanding', text: t`$(x+2)(x+3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6$ ✓. And the factored form tells you the zeros at once: $x = -2$ and $x = -3$.` },
    ],
    answer: t`$x^2 + 5x + 6 = (x + 2)(x + 3)$`,
  },
  practice: [
    mcq({
      id: 'expand-square', difficulty: 1,
      gen(r) {
        const k = r.pick([1, 2, 3]), p = r.pick([1, 3, 4, 5]);
        const kx = k === 1 ? 'x' : `${k}x`;
        const c2 = k * k === 1 ? '' : k * k;
        return {
          prompt: t`Expand $(${kx} + ${p})^2$.`,
          choices: [t`$${c2}x^2 + ${2 * k * p}x + ${p * p}$`, t`$${c2}x^2 + ${p * p}$`, t`$${c2}x^2 + ${k * p}x + ${p * p}$`, t`$${c2}x^2 + ${2 * k * p}x + ${2 * p}$`],
          answer: 0,
          why: {
            1: t`That is the classic slip $(a + b)^2 = a^2 + b^2$. It leaves out the two gold strips, $2 \cdot ${kx} \cdot ${p} = ${2 * k * p}x$.`,
            2: t`There are *two* cross strips, $${kx} \cdot ${p}$ each, so the middle term is $${2 * k * p}x$.`,
            3: t`The corner is $${p}$ times $${p}$, not $${p}$ plus $${p}$: $${p}^2 = ${p * p}$.`,
          },
          hints: [t`$(${kx} + ${p})^2 = (${kx} + ${p})(${kx} + ${p})$: four products.`],
          teach: t`$(a + b)^2 = a^2 + 2ab + b^2$: the square of a sum always has the cross term $2ab$.`,
          explain: t`$(${kx})^2 + 2(${kx})(${p}) + ${p}^2 = ${c2}x^2 + ${2 * k * p}x + ${p * p}$.`,
          visual: boxModel({ k, p, m: k, q: p, s: 0.45, X: 2.4, labels: [`${c2}x²`, `${k * p}x`, `${k * p}x`, String(p * p)], caption: t`The square of side $${kx} + ${p}$, cut into its four pieces.` }),
        };
      },
    }),
    expr({
      id: 'missing-factor', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6), b = r.intExcept(1, 7, [a]);
        const S = a + b, P = a * b;
        return {
          prompt: t`One factor of $x^2 + ${S}x + ${P}$ is $(x + ${a})$. Find the other.`,
          lhs: t`\dfrac{x^2 + ${S}x + ${P}}{x + ${a}}`,
          answer: `x + ${b}`, answerTeX: t`x + ${b}`,
          vars: { x: [0.5, 3] },
          errors: [{ answer: `x - ${b}`, feedback: t`Check the corner: $(x + ${a})(x - ${b})$ ends in $-${P}$, not $+${P}$.` }, { answer: `x + ${P}`, feedback: t`The constants in the two factors *multiply* to give $${P}$: the other one is $${P} / ${a}$.` }],
          hints: [t`The two constants multiply to $${P}$ and add to $${S}$.`, t`One of them is $${a}$.`],
          teach: t`In $(x + p)(x + q) = x^2 + (p + q)x + pq$ the constants add to the middle coefficient and multiply to the last.`,
          explain: t`$${P} / ${a} = ${b}$, and $${a} + ${b} = ${S}$ ✓, so $x^2 + ${S}x + ${P} = (x + ${a})(x + ${b})$.`,
          visual: boxModel({ p: a, q: b, s: 0.35, qLabel: '?', labels: ['x²', `${a}x`, '?', String(P)], caption: t`The known side is $x + ${a}$ (along the bottom). The corner has area $${P}$; what height must it have?` }),
        };
      },
    }),
    mcq({
      id: 'diff-squares', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]), m = r.intExcept(1, 7, [k, 2 * k]);
        const kt = `${k}t`;
        return {
          prompt: t`Factor $${k * k}t^2 - ${m * m}$.`,
          choices: [t`$(${kt} - ${m})(${kt} + ${m})$`, t`$(${kt} - ${m})^2$`, t`$(${kt} + ${m})^2$`, t`$${k * k}(t - ${m})(t + ${m})$`],
          answer: 0,
          why: {
            1: t`$(${kt} - ${m})^2 = ${k * k}t^2 - ${2 * k * m}t + ${m * m}$: it has a cross term and a $+${m * m}$.`,
            2: t`$(${kt} + ${m})^2 = ${k * k}t^2 + ${2 * k * m}t + ${m * m}$: a perfect square, not a difference.`,
            3: t`Taking $${k * k}$ out of both terms needs $${m * m}/${k * k}$ inside, not $${m * m}$: this expands to $${k * k}t^2 - ${k * k * m * m}$.`,
          },
          hints: [t`Both terms are perfect squares: $(${kt})^2$ and $${m}^2$.`, t`$a^2 - b^2 = (a - b)(a + b)$.`],
          teach: t`A difference of two squares factors as $(a - b)(a + b)$; the cross terms $\pm ab$ cancel.`,
          explain: t`$${k * k}t^2 - ${m * m} = (${kt})^2 - ${m}^2 = (${kt} - ${m})(${kt} + ${m})$. Check: the cross terms $+${k * m}t$ and $-${k * m}t$ cancel.`,
          visual: areaModel({
            x: [-0.8, 5.6], y: [-0.6, 5.4],
            rects: [{ x: 0, y: 0, w: 5, h: 3, color: 'accent', label: '' }, { x: 0, y: 3, w: 3, h: 2, color: 'accent', label: '' }, { x: 3, y: 3, w: 2, h: 2, color: 'ink4', alpha: 0.05, dashed: true, label: `${m * m} removed` }],
            sides: [{ x: 2.5, y: -0.3, label: kt }, { x: -0.45, y: 2.5, label: kt }, { x: 4, y: 5.25, label: String(m) }],
            caption: t`The shaded L is $${k * k}t^2 - ${m * m}$: a square of side $${kt}$ with a corner square of side $${m}$ removed. Cut off the top arm and lay it along the side: what rectangle do you get?`,
          }),
        };
      },
    }),
    num({
      id: 'expand-coef', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = r.int(1, 6), c = r.int(1, 3), d = r.intExcept(1, 6, [b]);
        const ans = a * d + b * c;
        const errors = [];
        for (const [v, f] of [[a * d, t`That is only one of the two cross strips. Add $${b} \cdot ${c}x$ as well.`], [b * c, t`That is only one of the two cross strips. Add $${a}x \cdot ${d}$ as well.`], [b * d, t`That is the constant term, $${b} \cdot ${d}$, with no $x$ in it.`]]) {
          if (v !== ans && !errors.some((e) => e.value === v)) errors.push({ value: v, feedback: f });
        }
        const ax = a === 1 ? 'x' : `${a}x`, cx = c === 1 ? 'x' : `${c}x`;
        return {
          prompt: t`Expand $(${ax} + ${b})(${cx} + ${d})$. What is the coefficient of $x$?`,
          answer: ans, tol: { rel: 0, abs: 1e-9 },
          errors,
          hints: [t`Four products: first × first, the two cross products, last × last.`, t`The $x$ terms come from $${ax} \cdot ${d}$ and $${b} \cdot ${cx}$.`],
          teach: t`The coefficient of $x$ in $(ax + b)(cx + d)$ is $ad + bc$ — both cross strips.`,
          explain: t`$(${ax} + ${b})(${cx} + ${d}) = ${a * c === 1 ? '' : a * c}x^2 + ${a * d}x + ${b * c}x + ${b * d}$: the coefficient of $x$ is $${a * d} + ${b * c} = ${ans}$.`,
          visual: boxModel({ k: c, p: d, m: a, q: b, X: 1.6, s: 0.4, labels: [`${a * c === 1 ? '' : a * c}x²`, '?', '?', String(b * d)], caption: t`The rectangle $(${cx} + ${d})$ along the bottom by $(${ax} + ${b})$ up the side. The two pieces marked ? hold the $x$ terms.` }),
        };
      },
    }),
    mcq({
      id: 'root-of-sum', difficulty: 2, kind: 'error',
      prompt: t`A student simplifies $\sqrt{x^2 + 9} = x + 3$. What is wrong?`,
      visual: bothSides({ lhs: 'sqrt(x^2 + 9)', rhs: 'x + 3', x: [-4, 5], y: [-1.5, 8.5], xticks: null, lhsLabel: 'y = √(x² + 9)', rhsLabel: 'y = x + 3', caption: t`The two sides as curves. If the simplification were right, they would be one curve.` }),
      choices: [
        t`A square root does not split over a sum: the two sides agree only at $x = 0$`,
        t`Nothing, for $x > 0$`,
        t`It should be $x - 3$`,
        t`Nothing: $x^2 + 9 = (x + 3)^2$`,
      ],
      answer: 0,
      why: {
        1: t`Try $x = 4$: $\sqrt{25} = 5$, but $x + 3 = 7$.`,
        2: t`Signs are not the issue: $x - 3$ is no closer, and at $x = 4$ it gives $1$ instead of $5$.`,
        3: t`$(x + 3)^2 = x^2 + 6x + 9$. The cross term $6x$ is missing from $x^2 + 9$ — the $(a+b)^2 = a^2 + b^2$ slip in reverse.`,
      },
      hints: [t`Test a value: $x = 4$.`, t`Does $(x + 3)^2$ equal $x^2 + 9$?`],
      teach: t`$\sqrt{a^2 + b^2} \ne a + b$ — the hypotenuse of a right triangle is not the sum of its legs.`,
      explain: t`$\sqrt{x^2 + 9}$ cannot be simplified. It equals $x + 3$ only where $x^2 + 9 = x^2 + 6x + 9$, i.e. at $x = 0$ — the one point where the curves touch.`,
    }),
    expr({
      id: 'common-factor', difficulty: 2,
      gen(r) {
        const v0 = r.pick([12, 15, 20, 24, 30]);
        const tl = 2 * v0 / 9.8;
        return {
          prompt: t`A stone is thrown straight up at $${v0}$ m/s; its height is $h(t) = ${v0}t - 4.9t^2$ metres. Factor out $t$: $\;${v0}t - 4.9t^2 = t\,(\ \ ?\ \ )$.`,
          lhs: t`\dfrac{${v0}t - 4.9t^2}{t}`,
          answer: `${v0} - 4.9t`, answerTeX: t`${v0} - 4.9t`,
          vars: { t: [0.5, 3] },
          errors: [{ answer: `${v0} - 4.9t^2`, feedback: t`Every term loses one factor of $t$: $4.9t^2 / t = 4.9t$.` }],
          hints: [t`Divide each term by $t$.`],
          teach: t`Factoring out a common factor divides every term by it.`,
          explain: t`$h = t(${v0} - 4.9t)$. The product is zero when $t = 0$ (launch) or when $${v0} - 4.9t = 0$, $t = ${nice(Math.round(tl * 100) / 100)}$ s (landing).`,
          visual: { type: 'graph', params: { x: [-0.3, tl * 1.15], y: [-0.08 * v0 * v0 / 19.6, v0 * v0 / 19.6 * 1.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: `${v0}x - 4.9x^2`, color: 'accent', domain: [0, tl] }] }, caption: t`Height against time, with no air resistance. The graph meets the axis twice — the two factors.` },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-square-diff', difficulty: 2,
      prompt: t`Expand $(2a - 3b)^2$.`,
      choices: [t`$4a^2 - 12ab + 9b^2$`, t`$4a^2 - 9b^2$`, t`$4a^2 - 6ab + 9b^2$`, t`$4a^2 - 12ab - 9b^2$`],
      answer: 0,
      why: {
        1: t`That is $(a - b)^2 = a^2 - b^2$, the square-of-a-sum slip; $4a^2 - 9b^2$ is $(2a - 3b)(2a + 3b)$.`,
        2: t`The cross term appears twice: $2 \cdot (2a)(-3b) = -12ab$.`,
        3: t`$(-3b)^2 = +9b^2$: a square is never negative.`,
      },
      hints: [t`$(u + v)^2 = u^2 + 2uv + v^2$ with $u = 2a$, $v = -3b$.`],
      teach: t`$(u - v)^2 = u^2 - 2uv + v^2$: only the cross term carries the minus sign.`,
      explain: t`$(2a)^2 + 2(2a)(-3b) + (-3b)^2 = 4a^2 - 12ab + 9b^2$.`,
    }),
    expr({
      id: 'cp-factor-quad', difficulty: 2,
      gen(r) {
        const p = r.int(1, 7), q = r.intExcept(1, 8, [p]);
        const B = p - q, P = p * q;
        const quad = t`x^2 ${B === 0 ? '' : sgn(B, 'x')} - ${P}`;
        return {
          prompt: t`One factor of $${quad}$ is $(x + ${p})$. Find the other.`,
          lhs: t`\dfrac{${quad}}{x + ${p}}`,
          answer: `x - ${q}`, answerTeX: t`x - ${q}`,
          vars: { x: [0.5, 3] },
          errors: [{ answer: `x + ${q}`, feedback: t`The constants multiply to $-${P}$, so one of them is negative.` }],
          hints: [t`The constants multiply to $-${P}$ and add to $${B}$.`],
          teach: t`When the constant term is negative, the two constants in the factors have opposite signs.`,
          explain: t`$(x + ${p})(x - ${q}) = x^2 ${B === 0 ? '' : sgn(B, 'x')} - ${P}$ ✓.`,
          visual: { type: 'graph', params: { x: [-9, 9], y: [-(((p + q) / 2) ** 2) * 1.25 - 1, P * 1.1 + 4], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: `x^2 + (${B})*x - ${P}`, color: 'accent' }] }, caption: t`$y = ${quad}$, scale hidden. Each factor is zero where the curve crosses the axis.` },
        };
      },
    }),
    num({
      id: 'cp-annulus', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([26, 51, 76, 102]), w = r.pick([1, 1.5, 2, 3]), ri = R - w;
        const ans = Math.PI * (R - ri) * (R + ri);
        return {
          prompt: t`A propellant feed line has outer radius $R = ${R}$ mm and inner radius $r = ${nice(ri)}$ mm. The cross-sectional area of its wall is $\pi R^2 - \pi r^2$. Factor it as a difference of squares and evaluate it.`,
          answer: ans, units: 'mm^2', tol: { rel: 0.005 },
          errors: [{ value: Math.PI * w * w, feedback: t`$R^2 - r^2 \ne (R - r)^2$ — that is the $(a-b)^2 = a^2 - b^2$ slip. Use $(R - r)(R + r)$.` }],
          hints: [t`$\pi R^2 - \pi r^2 = \pi(R - r)(R + r)$.`, t`$R - r$ is the wall thickness and $R + r$ is twice the average radius.`],
          teach: t`Factoring a difference of nearly equal squares replaces a small difference of big numbers with a product of easy ones.`,
          explain: t`$\pi(${R} - ${nice(ri)})(${R} + ${nice(ri)}) = \pi(${nice(w)})(${nice(R + ri)}) = ${nice(Math.round(ans * 10) / 10)}\ \text{mm}^2$ — the wall thickness times the mean circumference.`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.15, 1.15], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
            shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: 'sqrt(max(0.64 - x^2, 0))', from: -1, to: 1, color: 'teal', alpha: 0.45 }, { fn: '-sqrt(max(0.64 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'teal', alpha: 0.45 }],
            curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, '2pi'], color: 'ink3', width: 1.4 }, { param: ['0.8cos(t)', '0.8sin(t)'], t: [0, '2pi'], color: 'ink3', width: 1.4 }],
            arrows: [{ from: [0, 0], to: [1, 0], color: 'gold', label: 'R', labelDx: -30, labelDy: -12 }, { from: [0, 0], to: [0, -0.8], color: 'accent', label: 'r', labelDx: -14, labelDy: -34 }] },
            caption: t`The wall in cross-section; its thickness is exaggerated for visibility.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §1.4 Polynomials', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-4-polynomials' },
    { label: 'OpenStax Algebra and Trigonometry 2e, §1.5 Factoring Polynomials', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-5-factoring-polynomials' },
  ],
});
