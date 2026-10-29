// The definite integral — the limit of Riemann sums. Net signed area, its
// properties, and the average value of a function.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig } from './_c1kit.js';
import { areaFig } from './_c1int.js';

const t = String.raw;

// the Explore curve: positive, then negative, then positive again
const EF = '0.5*(x - 1)*(x - 4)';

// right sums for ∫₀³ x² dx (worked example)
const R = (n) => 4.5 * (1 + 1 / n) * (2 + 1 / n);

export default lesson({
  id: 'math1210.C1-5.3',
  title: 'The definite integral',
  minutes: 10, difficulty: 2,
  intro: t`Let the strips of a Riemann sum get thinner and thinner. For a continuous function every sum — left, right, midpoint — closes in on the same number. That limit **is** the definite integral:

$$\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^{n} f(x_i^*)\,\Delta x$$

Where $f$ is negative its rectangles have negative height, so the integral is the **net signed area**: area above the axis minus area below. It splits over intervals ($\int_a^b + \int_b^c = \int_a^c$), reverses sign when the limits swap, and divided by $b - a$ gives the **average value** of $f$ on the interval.`,
  symbols: [
    { tex: '\\int_a^b', text: 'the integral sign — a stretched S for “sum” — from the lower limit $a$ to the upper limit $b$' },
    { tex: 'f(x)', text: 'the **integrand**: the height of each strip, which may be negative' },
    { tex: 'dx', text: 'the infinitesimal width that $\\Delta x$ becomes in the limit; it names the variable' },
    { tex: 'n \\to \\infty', text: 'the number of strips grows without bound, so $\\Delta x = (b - a)/n \\to 0$' },
  ],
  why: t`Every total built from a rate is a definite integral: displacement from velocity, charge from current, work from force, impulse from thrust. The units multiply: (units of $f$) × (units of $x$).`,
  visual: {
    type: 'graph',
    title: 'Area above minus area below',
    lead: t`The integrand is $f(x) = \tfrac12(x - 1)(x - 4)$. Blue area counts as positive, red as negative. Move the limits $a$ and $b$ and watch the integral — the net of the two colours — and the average value.`,
    tasks: [
      'With a = 0 and b = 5, a lot is shaded, yet the integral is only −0.42: the blue and red nearly cancel.',
      'Set b = 4: now the integral is −1.33, the 0.92 of blue minus the 2.25 of red.',
      'Set a = 1 and b = 4: the average value is −0.75. The curve passes through that height somewhere between — the Mean Value Theorem for integrals.',
    ],
    params: {
      x: [-0.4, 5.6], y: [-1.6, 2.6], aspect: 'wide',
      sliders: [
        { key: 'a', label: t`Lower limit $a$`, min: 0, max: 2.5, step: 0.05, value: 0, explain: 'Where the integral starts.' },
        { key: 'b', label: t`Upper limit $b$`, min: 2.6, max: 5.5, step: 0.05, value: 5, explain: 'Where the integral ends.' },
      ],
      curves: [{ fn: EF, color: 'accent' }],
      shade: [{ fn: `max(${EF}, 0)`, from: 'a', to: 'b', color: 'accent', alpha: 0.25 }, { fn: `min(${EF}, 0)`, from: 'a', to: 'b', color: 'bad', alpha: 0.25 }],
      integral: { fn: EF, from: 'a', to: 'b' },
      vlines: [{ x: 'a', label: 'a' }, { x: 'b', label: 'b' }],
      readouts: [
        { label: t`$\int_a^b f\,dx$`, expr: 'integral', digits: 3 },
        { label: 'average value', expr: 'integral/(b - a)', digits: 3 },
      ],
    },
    caption: 'The integral is computed numerically. Blue and red are drawn as areas, but the integral counts the red with a minus sign.',
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_0^3 x^2\,dx$ straight from the definition, as the limit of right sums. Use $\displaystyle\sum_{i=1}^{n} i^2 = \frac{n(n + 1)(2n + 1)}{6}$.`,
    visual: { type: 'graph', params: { x: [-0.2, 3.3], y: [-0.6, 9.8], aspect: 'wide', curves: [{ fn: 'x^2', color: 'accent' }], riemann: { fn: 'x^2', from: 0, to: 3, n: 12, rule: 'right' }, readouts: [{ label: t`$R_{12}$`, expr: 'riemann', digits: 5 }, { label: 'limit', expr: 'integral', digits: 4 }] }, caption: t`Twelve right-end rectangles overshoot the area under $x^2$ by about $13\%$; as $n$ grows the overshoot vanishes.` },
    steps: [
      { label: 'Strips', text: t`$\Delta x = \dfrac{3 - 0}{n} = \dfrac{3}{n}$, and the right ends are $x_i = \dfrac{3i}{n}$ for $i = 1, \ldots, n$.` },
      { label: 'The sum', text: t`$R_n = \displaystyle\sum_{i=1}^{n}\left(\frac{3i}{n}\right)^2\frac{3}{n} = \frac{27}{n^3}\sum_{i=1}^{n} i^2 = \frac{27}{n^3}\cdot\frac{n(n + 1)(2n + 1)}{6}$.` },
      { label: 'Tidy', text: t`$R_n = \dfrac{9}{2}\left(1 + \dfrac1n\right)\left(2 + \dfrac1n\right)$. For $n = 4$: $${nice(R(4), 5)}$; for $n = 100$: $${nice(R(100), 5)}$.` },
      { label: 'The limit', text: t`As $n \to \infty$, $\dfrac1n \to 0$: $\displaystyle\int_0^3 x^2\,dx = \frac92\cdot1\cdot2 = 9$.` },
      { label: 'Sense check', text: t`The region fits inside the $3\times9$ rectangle (area $27$), and $9$ is a third of it — Archimedes’ result for a parabola. The right sums all exceed $9$, as they must for an increasing function.` },
    ],
    answer: t`$\displaystyle\int_0^3 x^2\,dx = 9$.`,
  },
  practice: [
    num({
      id: 'line-geom', difficulty: 2,
      gen(r) {
        const root = r.int(1, 3), m = r.pick([1, 2]), d = r.pick([1, 2, 3, 4]), b = root + d === 2 * root ? root + d + 1 : root + d;
        const I = m * ((b - root) ** 2 - root ** 2) / 2;
        return {
          prompt: t`Use geometry (areas of triangles) to evaluate $\displaystyle\int_0^{${b}} ${m === 1 ? '' : m}(x - ${root})\,dx$.`,
          answer: I, tol: { rel: 0.002, abs: 0.001 },
          integrand: `${m}*(x - ${root})`, limits: [0, b],
          errors: [{ value: m * ((b - root) ** 2 + root ** 2) / 2, feedback: 'That is the total shaded area. The part below the axis counts as negative.' }],
          hints: [t`The line crosses the axis at $x = ${root}$. Left of it there is a triangle below the axis; right of it, one above.`, t`Below: base $${root}$, height $${m * root}$. Above: base $${b - root}$, height $${m * (b - root)}$.`],
          teach: 'A definite integral is net signed area: area above the axis minus area below.',
          explain: t`Above: $\tfrac12\cdot${b - root}\cdot${m * (b - root)} = ${nice(m * (b - root) ** 2 / 2)}$. Below: $\tfrac12\cdot${root}\cdot${m * root} = ${nice(m * root * root / 2)}$. Net: $${nice(I)}$.`,
          visual: areaFig({ fn: `${m}*(x - ${root})`, x: [-0.5, b + 0.6], y: [-m * root - 1, m * (b - root) + 1], from: 0, to: b, caption: t`$y = ${m === 1 ? '' : m}(x - ${root})$ from $0$ to $${b}$: blue counts positive, red negative.` }),
        };
      },
    }),
    num({
      id: 'semicircle', difficulty: 2,
      gen(r) {
        const R0 = r.int(2, 5), I = Math.PI * R0 * R0 / 2;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-${R0}}^{${R0}} \sqrt{${R0 * R0} - x^2}\;dx$ by recognising the region. Give 3 significant figures.`,
          answer: I, tol: { rel: 0.005 },
          integrand: `sqrt(${R0 * R0} - x^2)`, limits: [-R0, R0],
          errors: [{ value: 2 * I, feedback: t`$y = \sqrt{r^2 - x^2}$ is only the **upper** half of the circle.` }],
          hints: [t`Square both sides of $y = \sqrt{${R0 * R0} - x^2}$: $x^2 + y^2 = ${R0 * R0}$, with $y \ge 0$.`],
          teach: 'Some definite integrals are areas of shapes you already know — recognise the graph first.',
          explain: t`The graph is the upper half of the circle of radius $${R0}$: area $\tfrac12\pi\cdot${R0}^2 = ${nice(I, 4)}$.`,
          visual: areaFig({ fn: `sqrt(${R0 * R0} - x^2)`, x: [-R0 - 0.6, R0 + 0.6], y: [-0.6, R0 + 0.6], from: -R0, to: R0, domain: [-R0, R0], caption: t`$y = \sqrt{${R0 * R0} - x^2}$ on $[-${R0}, ${R0}]$. Both axes share one scale.`, more: { equal: true }, signed: false }),
        };
      },
    }),
    num({
      id: 'props', difficulty: 2,
      gen(r) {
        const A = r.int(2, 9), B = A + r.intExcept(-6, 8, [0]);
        return {
          prompt: t`Given $\displaystyle\int_0^2 f(x)\,dx = ${A}$ and $\displaystyle\int_0^5 f(x)\,dx = ${B}$, find $\displaystyle\int_5^2 f(x)\,dx$.`,
          answer: A - B, tol: { rel: 0, abs: 0.001 },
          errors: B === 0 ? [] : [{ value: A + B, feedback: t`$\int_0^5 = \int_0^2 + \int_2^5$, so the middle piece is a difference.` }],
          hints: [t`Additivity: $\int_0^5 f = \int_0^2 f + \int_2^5 f$, so $\int_2^5 f = ${B} - ${A}$.`, t`Swapping the limits changes the sign: $\int_5^2 f = -\int_2^5 f$.`],
          teach: t`Integrals add over adjacent intervals, and $\int_b^a f = -\int_a^b f$.`,
          explain: t`$\int_2^5 f = ${B} - ${A} = ${B - A}$, so $\int_5^2 f = ${A - B}$.`,
          visual: { type: 'graph', params: { x: [-0.3, 5.6], y: [-1.8, 3.2], aspect: 'wide', curves: [{ fn: '1 + 1.5*sin(1.3*x)', color: 'accent' }], shade: [{ fn: '1 + 1.5*sin(1.3*x)', from: 0, to: 2, color: 'violet', alpha: 0.22 }, { fn: '1 + 1.5*sin(1.3*x)', from: 2, to: 5, color: 'gold', alpha: 0.22 }], vlines: [{ x: 2, label: '2' }, { x: 5, label: '5' }] }, caption: t`A stand-in $f$ (the real one is not given): the piece from $0$ to $2$ (violet) and from $2$ to $5$ (gold) make up the whole from $0$ to $5$.` },
        };
      },
    }),
    num({
      id: 'avg-sin', difficulty: 2,
      gen(r) {
        const A = r.int(1, 4), avg = 2 * A / Math.PI;
        return {
          prompt: t`One arch of $\sin x$, from $0$ to $\pi$, has area exactly $2$ (you will prove it in the next lesson). What is the average value of $${A === 1 ? '' : A}\sin x$ on $[0, \pi]$? Give 3 significant figures.`,
          answer: avg, tol: { rel: 0.005 },
          errors: [{ value: A / 2, feedback: t`The average of the highest and lowest values, $(${A} + 0)/2$, is not the average value of a function. Use $\frac{1}{b - a}\int_a^b f\,dx$.` }, { value: 2 * A, feedback: t`That is the integral. Divide by the length of the interval, $\pi$.` }],
          hints: [t`Average value $= \dfrac{1}{b - a}\displaystyle\int_a^b f(x)\,dx$.`, t`$\displaystyle\int_0^\pi ${A === 1 ? '' : A}\sin x\,dx = ${2 * A}$; divide by $\pi$.`],
          teach: 'The average value is the height of the rectangle on the same base with the same area: the integral divided by the length of the interval.',
          explain: t`$\dfrac{${2 * A}}{\pi} = ${nice(avg, 4)}$ — about $64\%$ of the peak. A rectangle of that height over $[0, \pi]$ has the same area as the arch.`,
          visual: areaFig({ fn: `${A}*sin(x)`, x: [-0.2, 3.4], y: [-0.2 * A, 1.2 * A], from: 0, to: Math.PI, signed: false, caption: t`One arch of $${A === 1 ? '' : A}\sin x$.` }),
        };
      },
    }),
    mcq({
      id: 'zero-integral', difficulty: 1,
      prompt: t`$\displaystyle\int_0^{2\pi}\sin x\,dx = 0$. What does that mean?`,
      visual: areaFig({ fn: 'sin(x)', x: [-0.3, 6.6], y: [-1.3, 1.3], from: 0, to: 2 * Math.PI, caption: t`$\sin x$ from $0$ to $2\pi$: one blue arch, one red one.` }),
      choices: [
        'The area above the axis equals the area below, so they cancel',
        'The region under the curve has no area',
        t`$\sin x = 0$ on $[0, 2\pi]$`,
        'The integral does not exist for this function',
      ],
      answer: 0,
      why: {
        1: t`The shaded region plainly has area: $4$ in total. The integral counts the red part as negative.`,
        2: t`$\sin x$ is zero only at $0$, $\pi$ and $2\pi$ on this interval.`,
        3: t`$\sin x$ is continuous, so its integral exists; it just happens to be $0$.`,
      },
      hints: ['Which part of the shading counts as negative?'],
      teach: 'A zero integral means equal positive and negative areas, not an empty region.',
      explain: t`The arch above the axis has area $2$ and the arch below has area $2$; the signed total is $2 - 2 = 0$. The total area, $\int_0^{2\pi}|\sin x|\,dx$, is $4$.`,
    }),
    mcq({
      id: 'bounds', difficulty: 2,
      prompt: t`Without integrating, which interval must contain $\displaystyle\int_0^1 e^{-x^2}\,dx$?`,
      visual: curveFig({ fn: 'e^(-x^2)', x: [-0.15, 1.3], y: [-0.1, 1.2], domain: [0, 1.3], extra: { shade: [{ fn: 'e^(-x^2)', from: 0, to: 1, color: 'accent', alpha: 0.22 }], hlines: [{ y: 1, label: 'y = 1' }, { y: Math.exp(-1), label: 'y = 1/e' }] }, caption: t`$e^{-x^2}$ falls from $1$ to $1/e$ on $[0, 1]$.` }),
      choices: [t`$[1/e,\ 1]$`, t`$[0,\ 1/e]$`, t`$[1,\ e]$`, t`$[0.5,\ 0.6]$`],
      answer: 0,
      why: {
        1: t`The integrand is at least $1/e$ everywhere on $[0, 1]$, so the area is at least $1/e\times 1$.`,
        2: t`The integrand never exceeds $1$, so over an interval of length $1$ the area cannot exceed $1$.`,
        3: t`The true value is $0.7468$, outside this interval; the comparison bounds give $[1/e, 1]$.`,
      },
      hints: [t`If $m \le f(x) \le M$ on $[a, b]$, then $m(b - a) \le \int_a^b f \le M(b - a)$.`, t`On $[0, 1]$, $e^{-x^2}$ lies between $e^{-1}$ and $e^0$.`],
      teach: 'The comparison property: a function trapped between two heights has an integral trapped between the two rectangles.',
      explain: t`$e^{-1} \le e^{-x^2} \le 1$ on $[0, 1]$, so $0.368 \le \int_0^1 e^{-x^2}dx \le 1$. (It is $0.7468$ — and $e^{-x^2}$ has no elementary antiderivative, so bounds like these matter.)`,
    }),
    mcq({
      id: 'which-integral', difficulty: 3,
      prompt: t`Which definite integral equals $\displaystyle\lim_{n\to\infty}\sum_{i=1}^{n}\left(1 + \frac{2i}{n}\right)^2\frac{2}{n}$?`,
      visual: { type: 'graph', params: { x: [0.6, 3.3], y: [-0.6, 9.8], aspect: 'wide', curves: [{ fn: 'x^2', color: 'accent' }], riemann: { fn: 'x^2', from: 1, to: 3, n: 8, rule: 'right' } }, caption: 'A right sum with eight strips on a parabola. Read off the strip width and the first sample point from the formula.' },
      choices: [t`$\displaystyle\int_1^3 x^2\,dx$`, t`$\displaystyle\int_0^2 x^2\,dx$`, t`$\displaystyle\int_0^1 (1 + 2x)^2\,dx$`, t`$\displaystyle\int_1^3 (1 + 2x)^2\,dx$`],
      answer: 0,
      why: {
        1: t`The sample points $x_i = 1 + 2i/n$ run from just above $1$ to $3$, not from $0$ to $2$.`,
        2: t`With $x = i/n$ the widths would be $\tfrac1n$, not $\tfrac2n$; this integral is half the limit.`,
        3: t`If $x_i = 1 + 2i/n$, the height is $x_i^2$, not $(1 + 2x_i)^2$.`,
      },
      hints: [t`$\Delta x = \tfrac2n$ means an interval of length $2$.`, t`$x_i = 1 + \tfrac{2i}{n} = a + i\,\Delta x$ with $a = 1$; the height is $x_i^2$.`],
      teach: t`In $\sum f(a + i\Delta x)\Delta x$, read off $\Delta x$ (so $b - a$), the starting point $a$, and the function $f$.`,
      explain: t`$\Delta x = 2/n$, $x_i = 1 + i\Delta x$ runs from $1$ to $3$, and the height is $x_i^2$: the limit is $\int_1^3 x^2\,dx = \tfrac{26}{3}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tent', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3]), L = c + r.pick([1, 2]), I = 2 * c * L - L * L;
        return {
          prompt: t`Evaluate $\displaystyle\int_{-${L}}^{${L}} (${c} - |x|)\,dx$ using geometry.`,
          answer: I, tol: { rel: 0, abs: 0.001 },
          errors: [{ value: c * c + (L - c) ** 2, feedback: 'You added the areas below the axis. They count as negative.' }],
          hints: [t`The graph is a tent: peak $${c}$ at $x = 0$, crossing zero at $x = \pm${c}$.`, t`Above: one triangle of base $${2 * c}$ and height $${c}$. Below: two triangles, each of base $${L - c}$ and height $${L - c}$.`],
          teach: 'Split the region where the integrand changes sign, and give each piece its sign.',
          explain: t`Above: $\tfrac12\cdot${2 * c}\cdot${c} = ${c * c}$. Below: $2\cdot\tfrac12\cdot${L - c}^2 = ${(L - c) ** 2}$. Net: $${c * c} - ${(L - c) ** 2} = ${I}$.`,
          visual: areaFig({ fn: `${c} - abs(x)`, x: [-L - 0.6, L + 0.6], y: [-(L - c) - 0.6, c + 0.6], from: -L, to: L, caption: t`$y = ${c} - |x|$ on $[-${L}, ${L}]$.` }),
        };
      },
    }),
    num({
      id: 'cp-thrust-avg', difficulty: 3, transfer: true,
      gen(r) {
        const F = r.pick([20, 35, 50]), rr = r.pick([1, 2]), h = r.pick([4, 6, 8]), T = h + 2 * rr, J = F * (h + rr), avg = J / T;
        const fn = `min(${F}*x/${rr}, ${F}, ${F}*(${T} - x)/${rr})`;
        return {
          prompt: t`A solid motor’s thrust ramps up linearly from $0$ to $${F}$ kN in $${rr}$ s, holds at $${F}$ kN for $${h}$ s, then ramps down linearly to $0$ in $${rr}$ s. What is its average thrust over the whole $${T}$ s burn, in kN?`,
          answer: avg, units: 'kN', tol: { rel: 0.003 },
          errors: [{ value: F / 2, feedback: 'Half the peak is the average of the extreme values, not the average value of the thrust.' }, { value: J, feedback: t`That is the total impulse in kN·s. Divide by the burn time.` }],
          hints: [t`Total impulse $= \int_0^{${T}} F(t)\,dt$ = the area of the trapezoid: two triangles and a rectangle.`, t`Area $= 2\cdot\tfrac12\cdot${rr}\cdot${F} + ${h}\cdot${F} = ${J}$ kN·s. Divide by $${T}$ s.`],
          teach: 'Average value = integral ÷ length: for thrust, total impulse ÷ burn time.',
          explain: t`$\int F\,dt = ${J}$ kN·s, so $\bar F = ${J}/${T} = ${nice(avg, 4)}$ kN — below the plateau because of the ramps.`,
          visual: areaFig({ fn, x: [-0.6, T + 0.8], y: [-0.08 * F, 1.2 * F], from: 0, to: T, signed: false, xlabel: 't (s)', ylabel: 'F (kN)', caption: 'An idealized trapezoidal thrust curve. Real motors have an ignition spike and a ragged tail-off.' }),
        };
      },
    }),
    num({
      id: 'cp-linear', difficulty: 2,
      gen(r) {
        const A = r.int(2, 9), B = r.intExcept(-4, 6, [0]), p = r.int(2, 4), q = r.int(2, 3), ans = p * A - q * B;
        return {
          prompt: t`If $\displaystyle\int_a^b f(x)\,dx = ${A}$ and $\displaystyle\int_a^b g(x)\,dx = ${B}$, what is $\displaystyle\int_a^b \big(${p}f(x) - ${q}g(x)\big)\,dx$?`,
          answer: ans, tol: { rel: 0, abs: 0.001 },
          errors: [{ value: p * A + q * B, feedback: t`Keep the minus sign: $-${q}\int g = -${q}\times(${B})$.` }],
          hints: [t`Integrals are linear: $\int (pf - qg) = p\int f - q\int g$.`],
          teach: 'The definite integral is linear: constants come out, and sums split.',
          explain: t`$${p}\cdot${A} - ${q}\cdot(${B}) = ${ans}$.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §5.2 The definite integral', url: 'https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral' }],
});
