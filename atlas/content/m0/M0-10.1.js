// Imaginary numbers and arithmetic — i² = −1, numbers a + bi, and adding, multiplying and dividing them.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sig, frac } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { circ, plane, dot, note } from './_m0geo.js';
import { M, cTeX, argand } from '../st-d/_cx.js';

const t = String.raw;
const ROOTS4 = [['1', [1, 0]], ['i', [0, 1]], ['-1', [-1, 0]], ['-i', [0, -1]]];
// the four powers of i on the unit circle
const powersPic = (caption, extra = {}) => plane({
  x: [-2.6, 2.6], y: [-1.45, 1.45], ticks: false, xlabel: 'Re', ylabel: 'Im',
  curves: [circ([0, 0], 1, { color: 'ink4', width: 1.2, dash: true })],
  points: ROOTS4.map(([l, p]) => dot(p, l.replace('-', '−'), { color: 'gold', labelDx: p[0] < 0 ? -18 : 8, labelDy: p[1] < 0 ? 14 : -10 })),
  caption, extra,
});

export default lesson({
  id: 'm0.M0-10.1',
  title: 'Imaginary numbers and arithmetic',
  minutes: 9, difficulty: 2,
  intro: t`No real number squares to $-1$. So invent one: the **imaginary unit** $i$, defined by

$$i^2 = -1, \qquad z = a + bi$$

A **complex number** $z = a + bi$ has a **real part** $a$ and an **imaginary part** $b$, both ordinary real numbers. The arithmetic is the algebra you already know, plus one rule. **Add** by collecting like parts. **Multiply** by expanding the brackets, then replace every $i^2$ by $-1$. **Divide** by multiplying top and bottom by the **conjugate** of the bottom, $\bar w = c - di$, because $(c + di)(c - di) = c^2 + d^2$ is real. With $i$, every quadratic has two roots: $x^2 + 4 = 0$ gives $x = \pm 2i$.`,
  symbols: [
    { tex: 'i', text: 'the imaginary unit, $i^2 = -1$ (electrical engineers write $j$, since $i$ is their current)' },
    { tex: 'z = a + bi', text: 'a complex number; it carries the units of whatever it describes (an impedance in Ω, a voltage in V)' },
    { tex: 'a = \\operatorname{Re} z', text: 'the **real part**' },
    { tex: 'b = \\operatorname{Im} z', text: 'the **imaginary part** — a real number, the coefficient of $i$' },
    { tex: '\\bar z = a - bi', text: 'the **conjugate**: the same number with the sign of the imaginary part flipped; $z\\bar z = a^2 + b^2$' },
  ],
  why: t`Complex numbers are not a curiosity: oscillations, AC circuits, waves and quantum mechanics are all written with them, because multiplying by $i$ turns out to be a quarter-turn — and turning is what oscillators do. The characteristic equation of a damped spring has complex roots, and the Schrödinger equation has an $i$ in it.`,
  visual: {
    type: 'graph',
    title: 'Multiplying by i, again and again',
    lead: t`Plot $z = a + bi$ as the point $(a, b)$. The blue arrow is $z$; the gold arrow is $i^n z$ — $z$ multiplied by $i$, $n$ times. The dots on the dashed circle are $1$, $i$, $-1$, $-i$.`,
    tasks: [
      t`Set $n = 1$: $i(2 + i) = 2i + i^2 = -1 + 2i$. The arrow has turned a quarter-turn anticlockwise.`,
      t`Set $n = 2$: the gold arrow points exactly opposite $z$. Two quarter-turns are a half-turn, so $i^2 z = -z$: that is $i^2 = -1$, seen.`,
      t`Set $n = 4$: back where you started. The powers of $i$ cycle $i, -1, -i, 1, i, \ldots$`,
    ],
    params: {
      x: [-6.4, 6.4], y: [-3.2, 3.2], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im',
      sliders: [
        { key: 'a', label: t`Real part $a$`, min: -3, max: 3, step: 0.5, value: 2, explain: t`How far $z$ is along the real axis.` },
        { key: 'b', label: t`Imaginary part $b$`, min: -3, max: 3, step: 0.5, value: 1, explain: t`How far $z$ is up the imaginary axis.` },
        { key: 'n', label: t`Power $n$ in $i^n z$`, min: 0, max: 4, step: 1, value: 1, explain: t`How many times $z$ is multiplied by $i$.` },
      ],
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2, dash: true }],
      arrows: [
        { from: [0, 0], to: ['a', 'b'], color: 'accent', width: 2.6, label: 'z' },
        { from: [0, 0], to: ['a*cos(n*pi/2) - b*sin(n*pi/2)', 'a*sin(n*pi/2) + b*cos(n*pi/2)'], color: 'gold', width: 3, label: 'iⁿz' },
      ],
      points: ROOTS4.map(([l, p]) => ({ x: p[0], y: p[1], r: 3.5, color: 'ink3', label: l.replace('-', '−'), labelDx: p[0] < 0 ? -18 : 6, labelDy: p[1] < 0 ? 13 : -8 })),
      readouts: [
        { label: t`$\operatorname{Re}(i^n z)$`, expr: 'a*cos(n*pi/2) - b*sin(n*pi/2)', digits: 3 },
        { label: t`$\operatorname{Im}(i^n z)$`, expr: 'a*sin(n*pi/2) + b*cos(n*pi/2)', digits: 3 },
      ],
    },
    caption: t`Each multiplication by $i$ turns the arrow $90^\circ$ anticlockwise about $0$ and keeps its length. Why that is so is the next two lessons.`,
  },
  example: {
    prompt: t`Let $z = 3 + 2i$ and $w = 1 - 4i$. Find $z + w$, $zw$ and $z/w$.`,
    visual: argand({ arrows: [{ to: [3, 2], color: 'accent', label: 'z' }, { to: [1, -4], color: 'warn', label: 'w' }], view: 4.6, caption: t`$z$ and $w$ as points (arrows) of the plane: real part across, imaginary part up.` }),
    steps: [
      { label: 'Add', text: t`Real with real, imaginary with imaginary: $z + w = (3 + 1) + (2 - 4)i = 4 - 2i$.` },
      { label: 'Expand', text: t`$zw = (3 + 2i)(1 - 4i) = 3 - 12i + 2i - 8i^2$.` },
      { label: 'Use i squared', text: t`$-8i^2 = -8(-1) = +8$, so $zw = (3 + 8) + (-12 + 2)i = 11 - 10i$.` },
      { label: 'Conjugate', text: t`For $z/w$ multiply top and bottom by $\bar w = 1 + 4i$: the bottom becomes $(1 - 4i)(1 + 4i) = 1 + 16 = 17$, a real number.` },
      { label: 'Divide', text: t`The top is $(3 + 2i)(1 + 4i) = 3 + 12i + 2i + 8i^2 = -5 + 14i$, so $\dfrac{z}{w} = -\dfrac{5}{17} + \dfrac{14}{17}i \approx ${sig(-5 / 17, 3)} + ${sig(14 / 17, 3)}i$.` },
      { label: 'Check', text: t`Multiply back: $w \cdot \tfrac{z}{w} = \tfrac{(1 - 4i)(-5 + 14i)}{17} = \tfrac{-5 + 14i + 20i - 56i^2}{17} = \tfrac{51 + 34i}{17} = 3 + 2i$ ✓.` },
    ],
    answer: t`$z + w = 4 - 2i$, $zw = 11 - 10i$, $z/w = -\tfrac{5}{17} + \tfrac{14}{17}i$.`,
  },
  practice: [
    mcq({
      id: 'power-i', difficulty: 1,
      gen(r) {
        const n = r.pick([2, 3, 5, 6, 7, 9, 10, 11, 14, 15, 23]), k = n % 4, ans = k;
        const why = {};
        [0, 1, 2, 3].forEach((j) => {
          if (j === k) return;
          why[j] = j === 0 ? t`$i^n = 1$ only when $n$ is a multiple of $4$. ${n === 2 ? t`And $i^2$ is $-1$ by definition — not $1$.` : ''}`
            : j === 1 ? t`$i^n = i$ when $n$ leaves remainder $1$ on division by $4$; $${n}$ leaves $${k}$.`
              : j === 2 ? t`$i^n = -1$ when $n$ leaves remainder $2$ on division by $4$; $${n}$ leaves $${k}$.`
                : t`$i^n = -i$ when $n$ leaves remainder $3$ on division by $4$; $${n}$ leaves $${k}$.`;
        });
        return {
          prompt: t`Simplify $i^{${n}}$.`,
          choices: ['$1$', '$i$', '$-1$', '$-i$'], fixedOrder: true,
          answer: ans, why,
          hints: [t`$i^4 = (i^2)^2 = (-1)^2 = 1$, so every four factors of $i$ cancel. Divide $${n}$ by $4$.`],
          teach: t`The powers of $i$ cycle with period $4$: $i, -1, -i, 1$.`,
          explain: t`$${n} = 4 \times ${Math.floor(n / 4)} + ${k}$, so $i^{${n}} = (i^4)^{${Math.floor(n / 4)}}\, i^{${k}} = ${['1', 'i', '-1', '-i'][k]}$ — ${k} quarter-turn${k === 1 ? '' : 's'} from $1$.`,
          visual: powersPic(t`The powers of $i$ on the unit circle: each extra factor of $i$ is a quarter-turn anticlockwise.`),
        };
      },
    }),
    num({
      id: 're-product', difficulty: 2,
      gen(r) {
        const z = [r.intExcept(-4, 5, [0]), r.intExcept(-4, 4, [0])], w = [r.intExcept(-3, 4, [0]), r.intExcept(-4, 4, [0])], p = M.mul(z, w), ans = p[0];
        return {
          prompt: t`Find the real part of $(${cTeX(z)})(${cTeX(w)})$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: z[0] * w[0] + z[1] * w[1], feedback: t`Sign slip: $(${z[1]}i)(${w[1]}i) = ${z[1] * w[1]}i^2 = ${-z[1] * w[1]}$, because $i^2 = -1$, not $+1$.` }, { value: z[0] * w[0], feedback: t`The product of the two imaginary parts is real too: $i \cdot i = -1$. Include it.` }, { value: p[1], feedback: t`That is the imaginary part. The real part collects the terms with no $i$ left in them.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Expand all four products, then replace $i^2$ by $-1$.`, t`Real part $= ac - bd$ for $(a + bi)(c + di)$.`],
          teach: t`$(a + bi)(c + di) = (ac - bd) + (ad + bc)i$: the $-bd$ is where $i^2 = -1$ does its work.`,
          explain: t`$(${cTeX(z)})(${cTeX(w)}) = ${z[0] * w[0]} + ${z[0] * w[1]}i + ${z[1] * w[0]}i + ${z[1] * w[1]}i^2 = ${cTeX(p)}$. Real part $${ans}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }], view: 5, caption: t`The two factors as points of the plane.` }),
        };
      },
    }),
    num({
      id: 'im-quotient', difficulty: 3,
      gen(r) {
        const z = r.pick([[2, 5], [7, 1], [3, -4], [-1, 6], [5, 5]]), w = r.pick([[1, 2], [3, 1], [2, -1], [1, -3]]), q = M.div(z, w), ans = q[1], D = w[0] ** 2 + w[1] ** 2;
        return {
          prompt: t`Write $\dfrac{${cTeX(z)}}{${cTeX(w)}}$ in the form $a + bi$. What is $b$, the imaginary part? Give a decimal to 3 significant figures if it is not whole.`,
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [
            { value: z[1] / w[1], feedback: t`Complex numbers do not divide part by part. Multiply top and bottom by the conjugate $${cTeX(M.conj(w))}$.` },
            { value: M.mul(z, w)[1] / D, feedback: t`You multiplied by $${cTeX(w)}$ itself. Use its **conjugate**, $${cTeX(M.conj(w))}$, so the bottom becomes real.` },
            { value: (z[1] * w[0] - z[0] * w[1]) / (w[0] ** 2 - w[1] ** 2), feedback: t`The bottom is $(c + di)(c - di) = c^2 - d^2i^2 = c^2 + d^2 = ${D}$, not $c^2 - d^2$.` },
          ].filter((e) => isFinite(e.value) && Math.abs(e.value - ans) > 0.01 * Math.max(1, Math.abs(ans))),
          hints: [t`Multiply top and bottom by $\overline{${cTeX(w)}} = ${cTeX(M.conj(w))}$.`, t`The bottom becomes $${w[0]}^2 + ${Math.abs(w[1])}^2 = ${D}$; expand the top and read off the coefficient of $i$.`],
          teach: t`Divide by multiplying top and bottom by the conjugate of the bottom: $c^2 + d^2$ is real.`,
          explain: t`Top: $(${cTeX(z)})(${cTeX(M.conj(w))}) = ${cTeX(M.mul(z, M.conj(w)))}$; bottom: $${D}$. So the quotient is $${frac(q[0])} ${q[1] < 0 ? '-' : '+'} ${frac(Math.abs(q[1]))}i$ and $b = ${frac(q[1])}${Number.isInteger(q[1]) ? '' : t` \approx ${sig(q[1], 3)}`}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }, { to: M.conj(w), color: 'warn', dash: [5, 4], label: 'conj w' }], view: 6.5, caption: t`Top ($z$), bottom ($w$) and the bottom’s conjugate $\bar w$ (dashed) — its mirror image in the real axis.` }),
        };
      },
    }),
    mcq({
      id: 'complex-roots', difficulty: 2,
      gen(r) {
        const al = r.intExcept(-3, 3, [0]), be = r.int(1, 3), p = -2 * al, q = al * al + be * be;
        const pm = (a, b, im = true) => t`$x = ${a} \pm ${b === 1 && im ? '' : b}${im ? 'i' : ''}$`;
        return {
          prompt: t`Solve $x^2 ${p < 0 ? '-' : '+'} ${Math.abs(p)}x + ${q} = 0$.`,
          choices: [pm(al, be), pm(-al, be), pm(al, be, false), pm(2 * al, 2 * be)],
          answer: 0,
          why: {
            1: t`Sign slip: $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ starts with $-b = ${-p}$, so the real part is $${al}$.`,
            2: t`$\sqrt{${p * p - 4 * q}}$ is not $\pm${2 * be}$: the square root of a negative number is imaginary, $\sqrt{${p * p - 4 * q}} = ${2 * be}i$.`,
            3: t`You forgot to divide the whole numerator by $2a = 2$.`,
          },
          hints: [t`The discriminant is $${p}^2 - 4(${q}) = ${p * p - 4 * q}$, negative.`, t`$\sqrt{${p * p - 4 * q}} = \sqrt{${4 * be * be}}\,\sqrt{-1} = ${2 * be}i$.`],
          teach: t`A negative discriminant gives a conjugate pair $\alpha \pm \beta i$ — the parabola never touches the axis.`,
          explain: t`$x = \dfrac{${-p} \pm ${2 * be}i}{2} = ${al} \pm ${be === 1 ? '' : be}i$. Check: the roots add to $${2 * al} = ${-p}$ and multiply to $${al * al} + ${be * be} = ${q}$ ✓.`,
          visual: { type: 'graph', params: { x: [al - 4, al + 4], y: [-1, q + 6], aspect: 'wide', curves: [{ fn: `x^2 + (${p})*x + ${q}`, color: 'accent', width: 2.4 }], points: [dot([al, be * be], 'vertex', { color: 'ink2', labelDy: 14 })] }, caption: t`$y = x^2 ${p < 0 ? '-' : '+'} ${Math.abs(p)}x + ${q}$ never meets the $x$-axis: no real roots.` },
        };
      },
    }),
    num({
      id: 'z-zbar', difficulty: 2,
      gen(r) {
        const z = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])], ans = z[0] ** 2 + z[1] ** 2;
        return {
          prompt: t`Compute $z\bar z$ for $z = ${cTeX(z)}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: z[0] ** 2 - z[1] ** 2, feedback: t`$(a + bi)(a - bi) = a^2 - b^2i^2 = a^2 + b^2$: the $i^2$ turns the minus into a plus.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\bar z = ${cTeX(M.conj(z))}$. Expand $(${cTeX(z)})(${cTeX(M.conj(z))})$.`],
          teach: t`$z\bar z = a^2 + b^2$, always real and never negative — the squared distance of $z$ from $0$.`,
          explain: t`$(${cTeX(z)})(${cTeX(M.conj(z))}) = ${z[0] ** 2} - (${z[1]}i)^2 = ${z[0] ** 2} + ${z[1] ** 2} = ${ans}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: M.conj(z), color: 'warn', label: 'conj z' }], view: 7, caption: t`$z$ and its conjugate $\bar z$, mirror images in the real axis.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ac-current', difficulty: 3, transfer: true,
      gen(r) {
        const [R, X] = r.pick([[30, 40], [60, 80], [9, 12], [24, 7], [5, 12]]), s = r.sign(), V = r.pick([120, 240]), Z = [R, s * X], I = M.div([V, 0], Z), ans = I[0];
        return {
          prompt: t`In AC circuit analysis a $${V}$ V source drives a load of complex **impedance** $Z = ${cTeX(Z)}\ \Omega$ (resistance $${R}\ \Omega$, reactance $${s * X}\ \Omega$). The current is $I = V/Z$, a complex number in amperes. What is its real part?`,
          answer: ans, units: 'A', tol: { rel: 0.005 },
          errors: [
            { value: V / R, feedback: t`$V/R$ ignores the reactance. Divide by the whole complex $Z$: multiply top and bottom by $\bar Z = ${cTeX(M.conj(Z))}$.` },
            { value: V / (R + X), feedback: t`$R$ and $X$ do not add as real numbers. Multiply top and bottom by the conjugate.` },
            { value: (V * R) / (R * R - X * X), feedback: t`The bottom is $R^2 + X^2 = ${R * R + X * X}$, not $R^2 - X^2$: $i^2 = -1$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$I = \dfrac{${V}}{${cTeX(Z)}} \cdot \dfrac{${cTeX(M.conj(Z))}}{${cTeX(M.conj(Z))}}$.`, t`The bottom is $${R}^2 + ${X}^2 = ${R * R + X * X}$.`],
          teach: t`Dividing by an impedance is dividing by a complex number: use the conjugate.`,
          explain: t`$I = \dfrac{${V}(${cTeX(M.conj(Z))})}{${R * R + X * X}} = ${cTeX(I, 4)}$ A. Real part $${sig(ans, 4)}$ A. (Its size, $${sig(M.abs(I), 3)}$ A, is $${V}/${sig(M.abs(Z), 3)}$ — the next lesson explains why.)`,
          visual: argand({ arrows: [{ to: [R, s * X], color: 'accent', label: 'Z' }], view: 1.25 * Math.max(R, X), caption: t`The impedance $Z$ as a point of the plane, in ohms: resistance across, reactance up (inductive) or down (capacitive).` }),
        };
      },
    }),
    mcq({
      id: 'cp-error', difficulty: 2, kind: 'error',
      prompt: t`A student writes: $(1 + 2i)^2 = 1 + 4i + 4 = 5 + 4i$. What went wrong?`,
      choices: [t`$(2i)^2 = 4i^2 = -4$, not $+4$: the answer is $-3 + 4i$`, t`$(a + b)^2 = a^2 + b^2$, so the answer is $1 + 4i^2 = -3$`, t`The middle term should be $2i$, so the answer is $5 + 2i$`, t`Nothing: $5 + 4i$ is right`],
      answer: 0,
      why: {
        1: t`The cross term $2ab$ does not vanish for complex numbers either: $(1 + 2i)^2 = 1 + 2(1)(2i) + (2i)^2$.`,
        2: t`The middle term is $2 \times 1 \times 2i = 4i$; that part was right.`,
        3: t`Check by squaring the arrow: $1 + 2i$ is in the first quadrant, and its square has a real part $1 - 4 < 0$.`,
      },
      hints: [t`Write out $(1 + 2i)(1 + 2i)$ term by term.`],
      teach: t`Every $i^2$ becomes $-1$ — including inside a square.`,
      explain: t`$(1 + 2i)^2 = 1 + 4i + 4i^2 = 1 + 4i - 4 = -3 + 4i$.`,
      visual: argand({ arrows: [{ to: [1, 2], color: 'accent', label: '1 + 2i' }], view: 2.8, caption: t`The number being squared.` }),
    }),
    num({
      id: 'cp-im-product', difficulty: 2,
      gen(r) {
        const z = [r.intExcept(-5, 5, [0]), r.intExcept(-5, 5, [0])], w = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])], p = M.mul(z, w), ans = p[1];
        return {
          prompt: t`Find the imaginary part of $(${cTeX(z)})(${cTeX(w)})$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: z[1] * w[1], feedback: t`$(bi)(di) = bd\,i^2$ is **real**. The imaginary part comes from the cross terms: $ad + bc$.` }, { value: p[0], feedback: t`That is the real part.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`For $(a + bi)(c + di)$ the imaginary part is $ad + bc$.`],
          teach: t`The cross terms carry one factor of $i$ each: they make the imaginary part.`,
          explain: t`$${z[0]}(${w[1]}) + (${z[1]})(${w[0]}) = ${ans}$; the whole product is $${cTeX(p)}$.`,
          visual: argand({ arrows: [{ to: z, color: 'accent', label: 'z' }, { to: w, color: 'warn', label: 'w' }], view: 5.5, caption: t`The two factors as points of the plane.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §3.1 Complex Numbers', url: 'https://openstax.org/books/precalculus-2e/pages/3-1-complex-numbers' },
    { label: 'OpenStax University Physics Vol. 2, §15.3 RLC Series Circuits with AC (impedance)', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-3-rlc-series-circuits-with-ac' },
  ],
});
void N; void note;
