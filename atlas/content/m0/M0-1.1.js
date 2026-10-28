// Reading Σ, Π and Greek letters — the notation every later formula is written in.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, sgn, lab, bars, numberLine, areaModel } from './_m0kit.js';

const t = String.raw;

export default lesson({
  id: 'm0.M0-1.1',
  title: 'Reading mathematical notation: Σ, Π, Greek letters',
  minutes: 7, difficulty: 1,
  intro: t`Physics compresses long sums and products into two capital Greek letters. **Σ (sigma) adds** one term for each value of an index; **Π (pi) multiplies** them:

$$\sum_{i=1}^{n} a_i = a_1 + a_2 + \cdots + a_n, \qquad \prod_{i=1}^{n} a_i = a_1\, a_2 \cdots a_n$$

Read the bottom as “start the index here”, the top as “stop here”, and the expression to the right as the recipe for each term. Greek letters are just more names — $\rho$ for density, $\lambda$ for wavelength — and a subscript says *which one* of several.`,
  symbols: [
    { tex: '\\sum', text: 'capital sigma: add up the terms' },
    { tex: '\\prod', text: 'capital pi: multiply the terms together (not the number $\\pi \\approx 3.14$)' },
    { tex: 'i', text: 'the **index**, a dummy name: $\\sum_{i=1}^{3} a_i$ and $\\sum_{k=1}^{3} a_k$ are the same sum' },
    { tex: '1,\\ n', text: 'the lower and upper limits: the index runs through every whole number from $1$ to $n$, so there are $n$ terms' },
    { tex: 'a_i', text: 'the $i$-th term, the recipe evaluated at that value of the index' },
    { tex: '\\cdots', text: '“and so on in the same pattern”' },
  ],
  why: t`Centre of mass, moment of inertia, every Riemann sum, and the index notation of general relativity are all Σ — in relativity the Σ is written so often that Einstein agreed to leave it out.`,
  visual: {
    type: 'graph',
    title: 'A sum as a stack of bars',
    lead: t`Each bar is one term $a_k$, standing at its index $k$. The readout adds the bars that the upper limit $n$ switches on. Change the recipe for $a_k$ with the buttons and the number of terms with the slider.`,
    tasks: [
      t`With $a_k = 2k - 1$ (the odd numbers), step $n$ through 1, 2, 3, 4: the sum is 1, 4, 9, 16 — always $n^2$.`,
      t`With $a_k = 3$ the index never appears in the term, yet the sum still grows: $3$ added $n$ times is $3n$.`,
      t`With $a_k = k$, check the readout against $n(n+1)/2$ for $n = 8$.`,
    ],
    params: {
      x: [0.2, 8.8], y: [-0.8, 16.5], xlabel: 'index k', ylabel: 'term aₖ', grid: false,
      sliders: [{ key: 'n', label: t`Upper limit $n$`, min: 1, max: 8, step: 1, value: 4, explain: t`The last value of the index: the sum has $n$ terms, $k = 1, 2, \ldots, n$.` }],
      choices: [{ key: 'm', label: t`Term $a_k$`, options: [[1, t`$a_k = k$`], [2, t`$a_k = 2k - 1$`], [3, t`$a_k = 3$`]], value: 2 }],
      riemann: { fn: 'step(0.5 - abs(m - 1))*x + step(0.5 - abs(m - 2))*(2x - 1) + step(0.5 - abs(m - 3))*3', from: 0.5, to: 'n + 0.5', n: 'n', rule: 'mid' },
      readouts: [{ label: t`$\sum_{k=1}^{n} a_k$`, expr: 'riemann', digits: 3 }],
    },
    caption: t`Each bar is one unit wide, so the total shaded area equals the sum. That is exactly why a Riemann sum, $\sum f(x_k)\,\Delta x$, approximates an integral.`,
  },
  example: {
    prompt: t`A launcher on the pad is modelled as three point masses along its axis: the first stage, $m_1 = 400$ t at height $x_1 = 20$ m; the second stage, $m_2 = 100$ t at $x_2 = 50$ m; the payload and fairing, $m_3 = 20$ t at $x_3 = 65$ m. Find the height of the centre of mass,
$$x_{\text{cm}} = \frac{\sum_{i=1}^{3} m_i x_i}{\sum_{i=1}^{3} m_i}.$$`,
    visual: numberLine({ x: [-4, 74], xlabel: 'height along the rocket (m)', points: [{ x: 20, label: '400 t' }, { x: 50, label: '100 t' }, { x: 65, label: '20 t' }, { x: 27.5, label: 'centre of mass', color: 'good', level: 1, r: 4 }], caption: t`Three masses on one axis and their centre of mass. A real rocket’s mass is spread out, not concentrated at three points: this is a teaching model.` }),
    steps: [
      { label: 'Read the top', text: t`$\sum_{i=1}^{3} m_i x_i$ says: for $i = 1, 2, 3$, multiply mass $i$ by its height, then add the three products.` },
      { label: 'Write it out', text: t`$m_1x_1 + m_2x_2 + m_3x_3 = (400)(20) + (100)(50) + (20)(65) = 8000 + 5000 + 1300 = 14\,300\ \text{t·m}$.` },
      { label: 'Read the bottom', text: t`$\sum_{i=1}^{3} m_i = 400 + 100 + 20 = 520\ \text{t}$ — the total mass.` },
      { label: 'Divide', text: t`$x_{\text{cm}} = \dfrac{14\,300\ \text{t·m}}{520\ \text{t}} = 27.5\ \text{m}$. The tonnes cancel, leaving metres, as a height must.` },
      { label: 'Sense check', text: t`The answer lies between the lowest and highest mass (20 m and 65 m), pulled hard toward the heavy first stage. A weighted average always lands inside the range of what it averages.` },
    ],
    answer: t`$x_{\text{cm}} = 27.5$ m above the base.`,
  },
  practice: [
    num({
      id: 'sum-linear', difficulty: 1,
      gen(r) {
        const a = r.int(2, 5), b = r.intExcept(-3, 4, [0]), n = r.int(4, 7);
        const terms = Array.from({ length: n }, (_, i) => a * (i + 1) + b);
        const ans = terms.reduce((s, v) => s + v, 0);
        const errors = [{ value: a * n * (n + 1) / 2 + b, feedback: t`The constant $${b}$ belongs to every term, so it is added $${n}$ times, not once.` }];
        if (a * n + b !== ans) errors.push({ value: a * n + b, feedback: t`That is only the last term, $a_{${n}}$. The sum adds every term from $k = 1$ to $k = ${n}$.` });
        return {
          prompt: t`Evaluate $\displaystyle\sum_{k=1}^{${n}} (${a}k ${sgn(b)})$.`,
          answer: ans, tol: { rel: 0, abs: 1e-9 },
          errors,
          hints: [t`Write the terms out: $k = 1$ gives $${a + b}$, $k = 2$ gives $${2 * a + b}$, and so on up to $k = ${n}$.`],
          teach: t`A sum means: evaluate the term at every value of the index between the limits, then add.`,
          explain: t`The terms are $${terms.join(', ')}$, which add to $${ans}$.`,
          visual: bars({ values: terms, labels: terms.map(lab), xlabel: 'index k', caption: t`The ${n} terms $a_k = ${a}k ${sgn(b)}$ as bars. The sum is their total height.` }),
        };
      },
    }),
    num({
      id: 'transmission', difficulty: 2,
      gen(r) {
        const T = [r.pick([0.98, 0.96, 0.95]), r.pick([0.92, 0.9, 0.88, 0.85]), r.pick([0.97, 0.94, 0.8])];
        const ans = T[0] * T[1] * T[2];
        return {
          prompt: t`Light reaching a star tracker’s detector passes a window, a filter and a lens, which transmit fractions $T_1 = ${T[0]}$, $T_2 = ${T[1]}$ and $T_3 = ${T[2]}$ of what reaches them. What fraction of the light gets through all three, $\prod_{i=1}^{3} T_i$?`,
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: T[0] + T[1] + T[2], feedback: t`That is $\sum T_i$ — it is bigger than 1, more light out than in. Π multiplies.` }, { value: (T[0] + T[1] + T[2]) / 3, feedback: t`That is the average transmission. Each element passes a fraction of what the previous one let through, so the fractions multiply.` }],
          hints: [t`$\prod_{i=1}^{3} T_i = T_1 T_2 T_3$.`],
          teach: t`Π multiplies the terms, which is what successive fractional losses do.`,
          explain: t`$${T[0]} \times ${T[1]} \times ${T[2]} = ${nice(ans)}$: about $${Math.round(ans * 100)}\%$ of the light survives.`,
          visual: bars({ values: T, labels: T.map(String), xlabel: 'element i', ylabel: 'Tᵢ', y: [0, 1.18], x: [0.3, 3.7], colors: ['teal'], caption: t`The three transmissions $T_i$. Each element passes that fraction of whatever arrives at it. Reflection and absorption are lumped into one number per element.` }),
        };
      },
    }),
    match({
      id: 'greek', difficulty: 1,
      prompt: t`Match each symbol to the quantity it most often names in physics.`,
      left: [t`$\lambda$ (lambda)`, t`$\rho$ (rho)`, t`$\omega$ (omega)`, t`$\mu$ (mu)`, t`$\Delta$ (capital delta)`],
      right: ['wavelength, in m', 'density, in kg/m³', 'angular frequency, in rad/s', 'coefficient of friction, no unit', 'change in a quantity: final minus initial', 'a sum over an index'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Δ is a capital letter used as an operator, not a quantity of its own.'],
      teach: t`Greek letters are names; the same letter can mean different things in different fields, so every formula should say what its symbols are.`,
      explain: t`$\lambda$ wavelength, $\rho$ density, $\omega$ angular frequency, $\mu$ friction coefficient (also the reduced mass, or the permeability in electromagnetism), $\Delta$ “change in”: $\Delta v = v_f - v_i$. A sum is $\Sigma$.`,
    }),
    mcq({
      id: 'index-shift', difficulty: 2,
      prompt: t`Which sum equals $\displaystyle\sum_{k=0}^{4} (k+1)^2$?`,
      visual: bars({ values: [1, 4, 9, 16, 25], k0: 0, labels: ['1', '4', '9', '16', '25'], xlabel: 'index k', caption: t`The five terms $(k+1)^2$ for $k = 0, 1, 2, 3, 4$.` }),
      choices: [t`$\displaystyle\sum_{j=1}^{5} j^2$`, t`$\displaystyle\sum_{k=1}^{4} k^2$`, t`$\displaystyle 1 + \sum_{k=0}^{4} k^2$`, t`$\displaystyle\sum_{k=1}^{5} (k+1)^2$`],
      answer: 0,
      why: {
        1: t`That drops a term: it has only four terms and stops at $4^2$, but $(k+1)^2$ reaches $5^2 = 25$ at $k = 4$.`,
        2: t`$(k+1)^2 \ne k^2 + 1$ — that is the $(a+b)^2 = a^2 + b^2$ slip. This sum is $31$; the original is $55$.`,
        3: t`You shifted the limits but kept the term $(k+1)^2$, so this adds $2^2$ through $6^2$.`,
      },
      hints: [t`Write the original out: $1^2 + 2^2 + 3^2 + 4^2 + 5^2$.`, t`Set $j = k + 1$: when $k = 0$, $j = 1$; when $k = 4$, $j = 5$.`],
      teach: t`Renaming the index ($j = k + 1$) shifts both limits by the same amount and changes the term to match.`,
      explain: t`With $j = k + 1$ the term $(k+1)^2$ becomes $j^2$ and the limits $0 \to 4$ become $1 \to 5$: both sums are $1 + 4 + 9 + 16 + 25 = 55$.`,
    }),
    num({
      id: 'centre-mass', difficulty: 2,
      gen(r) {
        const xs = [r.int(0, 2), r.int(4, 6), r.int(8, 10)];
        const ms = r.shuffle([r.int(1, 3), r.int(4, 6), r.int(7, 9)]);
        const smx = ms.reduce((s, m, i) => s + m * xs[i], 0), sm = ms[0] + ms[1] + ms[2];
        const ans = smx / sm, mean = (xs[0] + xs[1] + xs[2]) / 3;
        const errors = [{ value: smx, feedback: t`That is the numerator $\sum m_i x_i$ alone, in kg·m. Divide by the total mass $\sum m_i$.` }];
        if (Math.abs(mean - ans) > 0.02 * ans) errors.push({ value: mean, feedback: t`That is the plain average of the positions. The centre of mass weights each position by its mass.` });
        return {
          prompt: t`Three masses sit on a light rod: $${ms[0]}$ kg at $x = ${xs[0]}$ m, $${ms[1]}$ kg at $x = ${xs[1]}$ m and $${ms[2]}$ kg at $x = ${xs[2]}$ m. Find $x_{\text{cm}} = \dfrac{\sum m_i x_i}{\sum m_i}$.`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors,
          hints: [t`Numerator: $${ms[0]}\cdot${xs[0]} + ${ms[1]}\cdot${xs[1]} + ${ms[2]}\cdot${xs[2]}$.`, t`Denominator: $${ms[0]} + ${ms[1]} + ${ms[2]} = ${sm}$ kg.`],
          teach: t`The centre of mass is a weighted average: $\sum m_i x_i$ divided by $\sum m_i$.`,
          explain: t`$x_{\text{cm}} = \dfrac{${smx}\ \text{kg·m}}{${sm}\ \text{kg}} = ${nice(ans)}$ m.`,
          visual: numberLine({ x: [-1, 11], xlabel: 'x (m)', points: xs.map((x, i) => ({ x, label: `${ms[i]} kg` })), caption: t`The three masses on the rod. The rod’s own mass is neglected.` }),
        };
      },
    }),
    mcq({
      id: 'sum-of-products', difficulty: 3, kind: 'error',
      prompt: t`A student writes
$$\sum_{i=1}^{2} a_i b_i = \Big(\sum_{i=1}^{2} a_i\Big)\Big(\sum_{i=1}^{2} b_i\Big).$$
What is wrong?`,
      visual: areaModel({
        x: [-1.2, 6.4], y: [-0.9, 3.6],
        rects: [
          { x: 0, y: 0, w: 3, h: 2, color: 'accent', label: 'a₁b₁' }, { x: 3, y: 0, w: 2, h: 2, color: 'warn', label: 'a₂b₁' },
          { x: 0, y: 2, w: 3, h: 1.2, color: 'warn', label: 'a₁b₂' }, { x: 3, y: 2, w: 2, h: 1.2, color: 'accent', label: 'a₂b₂' },
        ],
        sides: [{ x: 1.5, y: -0.4, label: 'a₁' }, { x: 4, y: -0.4, label: 'a₂' }, { x: -0.45, y: 1, label: 'b₁' }, { x: -0.45, y: 2.6, label: 'b₂' }],
        caption: t`The product of the two sums is the whole rectangle, sides $a_1 + a_2$ and $b_1 + b_2$. Lengths are illustrative.`,
      }),
      choices: [
        t`The right side also contains the cross terms $a_1b_2 + a_2b_1$, so the two sides differ`,
        t`Nothing — a sum of products is always the product of the sums`,
        t`It holds whenever every $a_i$ and $b_i$ is positive`,
        t`The left side should read $\sum a_i + \sum b_i$`,
      ],
      answer: 0,
      why: {
        1: t`Try $a = (1, 1)$, $b = (1, 1)$: the left side is $2$, the right side is $2 \times 2 = 4$.`,
        2: t`Positive numbers make it worse, not better: the cross terms are then positive and the right side is strictly larger.`,
        3: t`$\sum a_i b_i$ is a sum of products, a perfectly good expression (it is the dot product of two vectors); it is the equals sign that is wrong.`,
      },
      hints: [t`Multiply out $(a_1 + a_2)(b_1 + b_2)$.`, t`It has four terms. How many does $a_1b_1 + a_2b_2$ have?`],
      teach: t`Σ distributes over addition, $\sum(a_i + b_i) = \sum a_i + \sum b_i$, but not over multiplication.`,
      explain: t`$(a_1 + a_2)(b_1 + b_2) = a_1b_1 + a_2b_2 + a_1b_2 + a_2b_1$: the blue diagonal pieces are $\sum a_i b_i$, and the amber cross pieces are extra.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-write-sum', difficulty: 2,
      prompt: t`Write $\;1 + \tfrac14 + \tfrac19 + \tfrac1{16} + \cdots + \tfrac1{100}\;$ in Σ notation.`,
      visual: bars({ values: Array.from({ length: 10 }, (_, i) => 1 / (i + 1) ** 2), xlabel: 'index k', y: [0, 1.15], caption: t`The terms of the sum, one bar per term.` }),
      choices: [t`$\displaystyle\sum_{k=1}^{10} \frac{1}{k^2}$`, t`$\displaystyle\sum_{k=1}^{100} \frac{1}{k^2}$`, t`$\displaystyle\sum_{k=0}^{10} \frac{1}{k^2}$`, t`$\displaystyle\sum_{k=1}^{10} \frac{1}{2k}$`],
      answer: 0,
      why: {
        1: t`The upper limit is the last value of $k$, not the last denominator: $1/100 = 1/10^2$, so $k$ stops at $10$.`,
        2: t`At $k = 0$ the term is $1/0$, which is not defined. The first term, $1$, is $1/1^2$.`,
        3: t`$1/(2k)$ gives $\tfrac12, \tfrac14, \tfrac16, \ldots$ — the denominators double rather than square.`,
      },
      hints: [t`Each denominator is a perfect square: $1, 4, 9, 16, \ldots, 100$.`],
      teach: t`To write a sum in Σ form, find the term as a function of the index, then the first and last index values.`,
      explain: t`The $k$-th term is $1/k^2$, from $k = 1$ ($1/1$) to $k = 10$ ($1/100$): ten terms.`,
    }),
    num({
      id: 'cp-telescope', difficulty: 3,
      gen(r) {
        const n = r.int(4, 9);
        return {
          prompt: t`Evaluate $\displaystyle\prod_{k=1}^{${n}} \frac{k+1}{k}$.`,
          answer: n + 1, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: n, feedback: t`Close: write the factors out — the last numerator, $${n + 1}$, survives.` }],
          hints: [t`Write it out: $\dfrac21 \cdot \dfrac32 \cdot \dfrac43 \cdots \dfrac{${n + 1}}{${n}}$.`, t`Each numerator cancels the next denominator. What is left?`],
          teach: t`In a product of ratios, look for cancellation between neighbouring factors before multiplying anything.`,
          explain: t`$\dfrac21 \cdot \dfrac32 \cdots \dfrac{${n + 1}}{${n}}$: every numerator but the last cancels the denominator after it, leaving $\dfrac{${n + 1}}{1} = ${n + 1}$.`,
          visual: bars({ values: Array.from({ length: n }, (_, i) => (i + 2) / (i + 1)), xlabel: 'index k', y: [0, 2.4], colors: ['violet'], caption: t`The ${n} factors $(k+1)/k$, all between 1 and 2.` }),
        };
      },
    }),
    num({
      id: 'cp-inertia', difficulty: 2, transfer: true,
      gen(r) {
        const ms = [r.int(2, 6), r.int(2, 6), r.int(2, 6), r.int(2, 6)];
        const rs = [r.pick([0.5, 0.6, 0.8]), r.pick([0.9, 1.0, 1.2]), r.pick([0.5, 0.7, 0.8]), r.pick([1.0, 1.2, 1.4])];
        const I = ms.reduce((s, m, i) => s + m * rs[i] ** 2, 0);
        const smr = ms.reduce((s, m, i) => s + m * rs[i], 0);
        const ang = [0, 90, 180, 270].map((d) => d * Math.PI / 180);
        return {
          prompt: t`A spin-stabilised satellite carries four equipment blocks, treated as point masses at distances $r_i$ from the spin axis: $${ms[0]}$ kg at $${rs[0]}$ m, $${ms[1]}$ kg at $${rs[1]}$ m, $${ms[2]}$ kg at $${rs[2]}$ m and $${ms[3]}$ kg at $${rs[3]}$ m. Their moment of inertia about the axis is $I = \sum_{i=1}^{4} m_i r_i^2$. Find it.`,
          answer: I, units: 'kg m^2', tol: { rel: 0.005 },
          errors: Math.abs(smr - I) > 0.03 * I ? [{ value: smr, feedback: t`That is $\sum m_i r_i$. Each distance is squared before multiplying by its mass.` }] : [],
          hints: [t`Compute $m_i r_i^2$ for each block, then add the four.`],
          teach: t`Inside a sum, the recipe ($m_i r_i^2$) is applied to each term before anything is added.`,
          explain: t`$${ms.map((m, i) => `${m}(${rs[i]})^2`).join(' + ')} = ${nice(I)}\ \text{kg·m}^2$.`,
          visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false,
            points: [{ x: 0, y: 0, label: 'spin axis', color: 'ink3', r: 3, labelDy: 16, labelAlign: 'center', labelDx: 0 },
              ...ms.map((m, i) => ({ x: N(rs[i] * Math.cos(ang[i])), y: N(rs[i] * Math.sin(ang[i])), label: `${m} kg`, color: 'gold', r: 3 + m })) ],
            curves: [{ param: ['1.5cos(t)', '1.5sin(t)'], t: [0, '2pi'], color: 'ink4', width: 1.2, dash: true }] },
            caption: t`Top view, looking down the spin axis; distances to scale. Real blocks have size, which adds a little to each term.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §11.4 Series and Their Notations', url: 'https://openstax.org/books/precalculus-2e/pages/11-4-series-and-their-notations' },
    { label: 'OpenStax University Physics Vol. 1, §9.6 Center of Mass', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-6-center-of-mass' },
  ],
});
