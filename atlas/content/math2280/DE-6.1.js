// The Laplace transform from its definition: an improper integral that weights
// f(t) by e^{−st}. The table built from the definition (1, e^{at}, tⁿ, and
// sin and cos together from e^{iωt}), linearity, the first shift theorem,
// which functions have a transform at all (exponential order), and reading
// the table backwards — one pole of F(s) for each term of f(t). Transfer: a
// motor's total impulse is its thrust curve's transform at s = 0.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co } from './_second.js';
import { fpic, splane } from './_laplace.js';

const t = String.raw;

// the Explore picture: f(t), the weight e^{−st} and their product, whose area is F(s)
const PICK = (k) => `step(0.5 - abs(c - ${k}))`;
const FT = `(${PICK(0)} + ${PICK(1)}*x + ${PICK(2)}*exp(-x) + ${PICK(3)}*sin(2x))`;
const PROD = `${FT}*exp(-s*x)`;
const TABLE = `${PICK(0)}/s + ${PICK(1)}/s^2 + ${PICK(2)}/(s + 1) + ${PICK(3)}*2/(s^2 + 4)`;

export default lesson({
  id: 'math2280.DE-6.1',
  title: 'The Laplace transform',
  minutes: 12, difficulty: 2,
  intro: t`The **Laplace transform** turns a function of time $f(t)$ into a function of a new variable $s$: weight $f$ by a decaying exponential and take the whole area under the product.

$$F(s) = \mathcal{L}\{f\}(s) = \int_0^\infty e^{-st}\,f(t)\,dt$$

Each value $F(s)$ is one number, an area; a larger $s$ discounts late times more steeply. Worked out once from the definition, a short **table** of transforms covers this whole module. The reason to bother comes next lesson: the transform turns a derivative into a multiplication by $s$, so a linear differential equation — initial values included — becomes algebra.`,
  symbols: [
    { tex: t`f(t)`, text: t`the function being transformed, for $t \ge 0$: a force, a voltage, a thrust. What it does before $t = 0$ is ignored` },
    { tex: t`t`, text: 'time, in s — the variable integrated away' },
    { tex: t`s`, text: t`the transform variable, in $\text{s}^{-1}$ (a rate, so that $st$ has no units). Real in this lesson; later its complex values carry the physics` },
    { tex: t`e^{-st}`, text: 'the weight: it discounts late times, and makes the integral converge for any $f$ that grows no faster than an exponential' },
    { tex: t`F(s)`, text: t`the transform. It carries the units of $f$ times seconds: for a force in N, $F$ is in N·s` },
    { tex: t`\mathcal{L}`, text: t`the transform as an operation on functions. It is **linear**: $\mathcal{L}\{af + bg\} = aF + bG$` },
  ],
  why: t`Filters, control loops and engine controllers are designed almost entirely in the $s$-domain, because there a linear system’s response is a product and solving its equation is division.`,
  visual: {
    type: 'graph',
    title: 'A transform is an area, one for each s',
    lead: t`The dashed curves are $f(t)$ and the weight $e^{-st}$; the solid curve is their product, and its shaded area is $F(s)$. Pick a function and slide $s$: the readout compares the area with the table’s formula.`,
    tasks: [
      'Raise s: the weight dies sooner and the area shrinks — F(s) → 0 as s → ∞, for every function that has a transform.',
      'Choose f = t and set s = 1: the area is 1/s² = 1. Halve s and it grows four times.',
      'Choose sin 2t: the lobes above and below the axis partly cancel, and the area matches 2/(s² + 4).',
    ],
    params: {
      x: [0, 8], y: [-1.1, 2.1], xlabel: 't (s)', ylabel: '',
      choices: [{ key: 'c', label: 'Function $f(t)$', options: [[0, '$1$'], [1, '$t$'], [2, '$e^{-t}$'], [3, '$\\sin 2t$']], value: 1 }],
      sliders: [{ key: 's', label: 'Transform variable $s$', min: 0.3, max: 3, step: 0.05, value: 1, unit: t`\text{s}^{-1}`, explain: t`How steeply the weight $e^{-st}$ discounts late times.` }],
      curves: [
        { fn: FT, color: 'ink3', dash: true, width: 1.6, label: 'f(t)', labelAt: 1.9, labelDx: 8, labelDy: -12 },
        { fn: 'exp(-s*x)', color: 'gold', dash: true, width: 1.6, label: 'e⁻ˢᵗ', labelAt: 0.35, labelDx: 8, labelDy: -12 },
        { fn: PROD, color: 'accent', width: 2.6 },
      ],
      shade: [{ fn: `max(${PROD}, 0)`, from: 0, to: 8, color: 'accent', alpha: 0.25 }, { fn: `min(${PROD}, 0)`, from: 0, to: 8, color: 'bad', alpha: 0.25 }],
      integral: { fn: PROD, from: 0, to: 40 },
      readouts: [
        { label: 'area $\\int_0^{40} e^{-st} f\\,dt$', expr: 'integral', digits: 4 },
        { label: 'table $F(s)$', expr: TABLE, digits: 4 },
      ],
    },
    caption: t`The area is computed numerically out to $t = 40$ s, where the weight has fallen below $e^{-12}$ of its start; the plot shows the first 8 s. Area below the axis (red) counts as negative. Only $t \ge 0$ enters.`,
  },
  example: {
    prompt: t`From the definition, find $\mathcal{L}\{e^{at}\}$. Then use it, with $e^{i\omega t} = \cos\omega t + i\sin\omega t$, to find $\mathcal{L}\{\cos\omega t\}$ and $\mathcal{L}\{\sin\omega t\}$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 8], y: [0, 4.2], xlabel: 't (s)', ylabel: '', aspect: 'wide',
        curves: [
          { fn: 'exp(-0.6x)', color: 'accent', label: 's − a = 0.6: area 1/0.6', labelAt: 2.2, labelDx: 8, labelDy: -12 },
          { fn: 'exp(0.18x)', color: 'bad', label: 's − a = −0.18: no finite area', labelAt: 3, labelDx: -60, labelDy: -34 },
        ],
        shade: [{ fn: 'exp(-0.6x)', from: 0, to: 8, color: 'accent', alpha: 0.22 }],
      },
      caption: t`The integrand $e^{-(s-a)t}$ for two values of $s - a$. When $s > a$ it decays and its area is $1/(s - a)$; when $s < a$ it grows and the integral diverges.`,
    },
    steps: [
      { label: 'Set up', text: t`$\mathcal{L}\{e^{at}\} = \displaystyle\int_0^\infty e^{-st}e^{at}\,dt = \int_0^\infty e^{-(s-a)t}\,dt$, an improper integral: the limit of $\int_0^b$ as $b \to \infty$.` },
      { label: 'Integrate', text: t`$\displaystyle\int_0^b e^{-(s-a)t}\,dt = \frac{1 - e^{-(s-a)b}}{s - a}$.` },
      { label: 'Take the limit', text: t`If $s > a$, then $e^{-(s-a)b} \to 0$ and $\mathcal{L}\{e^{at}\} = \dfrac{1}{s - a}$. If $s \le a$ the integral diverges: **the transform exists only for $s > a$**. With $a = 0$: $\mathcal{L}\{1\} = 1/s$.` },
      { label: 'A complex exponent', text: t`Nothing in those steps needed $a$ to be real. With $a = i\omega$ (and $s > 0$, so that $|e^{-(s - i\omega)b}| = e^{-sb} \to 0$): $\;\mathcal{L}\{e^{i\omega t}\} = \dfrac{1}{s - i\omega} = \dfrac{s + i\omega}{s^2 + \omega^2}$.` },
      { label: 'Real and imaginary parts', text: t`$\mathcal{L}$ is linear and $e^{i\omega t} = \cos\omega t + i\sin\omega t$, so the real part is the cosine’s transform and the imaginary part the sine’s: $\;\mathcal{L}\{\cos\omega t\} = \dfrac{s}{s^2 + \omega^2}$, $\;\mathcal{L}\{\sin\omega t\} = \dfrac{\omega}{s^2 + \omega^2}$.` },
      { label: 'Sense check', text: t`Let $\omega \to 0$: $\cos\omega t \to 1$ and $s/s^2 = 1/s = \mathcal{L}\{1\}$ ✓. Units: for $\sin\omega t$ (no units) $F$ should be a time, and $\omega/(s^2 + \omega^2)$ is $(\text{s}^{-1})/(\text{s}^{-2}) = \text{s}$ ✓.` },
    ],
    answer: t`$\mathcal{L}\{e^{at}\} = \dfrac{1}{s-a}$ for $s > a$; $\;\mathcal{L}\{\cos\omega t\} = \dfrac{s}{s^2+\omega^2}$ and $\mathcal{L}\{\sin\omega t\} = \dfrac{\omega}{s^2+\omega^2}$ for $s > 0$. With $\mathcal{L}\{t^n\} = \dfrac{n!}{s^{n+1}}$ (integrate by parts $n$ times) this is the table:

$$\begin{array}{c|c} f(t) & F(s) \\ \hline 1 & 1/s \\ t^n & n!/s^{n+1} \\ e^{at} & 1/(s-a) \\ \cos\omega t & s/(s^2+\omega^2) \\ \sin\omega t & \omega/(s^2+\omega^2) \\ e^{at}f(t) & F(s-a) \end{array}$$

The last line is the **first shift theorem**: $\int_0^\infty e^{-st}e^{at}f\,dt = \int_0^\infty e^{-(s-a)t}f\,dt = F(s - a)$.`,
  },
  practice: [
    num({
      id: 'const-force', difficulty: 1,
      gen(r) {
        const F0 = r.pick([200, 500, 1200, 2500]), s0 = r.pick([0.5, 2, 4, 5]);
        const T = Math.min(8, 6 / s0);
        return {
          prompt: t`A test-stand actuator pushes with a constant force $f(t) = ${F0}$ N from $t = 0$. From the definition, evaluate its Laplace transform at $s = ${s0}\ \text{s}^{-1}$.`,
          answer: F0 / s0, units: 'N s', tol: { rel: 0.005 },
          integrand: `${F0}*e^(-${s0}x)`, limits: [0, 'inf'],
          errors: [{ value: F0 * s0, feedback: t`$\int_0^\infty e^{-st}\,dt = 1/s$: divide by $s$, do not multiply.` }, { value: F0, feedback: 'That is the force itself. The transform is the area under the force times the weight $e^{-st}$.' }],
          hints: [t`$F(s) = \int_0^\infty e^{-st}\cdot ${F0}\,dt = ${F0}\int_0^\infty e^{-st}\,dt$.`, t`$\int_0^\infty e^{-st}\,dt = \Big[-\tfrac1s e^{-st}\Big]_0^\infty = \tfrac1s$.`],
          teach: t`The transform of a constant $c$ is $c/s$: the area under $c\,e^{-st}$.`,
          explain: t`$F(${s0}) = ${F0}/${s0} = ${nice(F0 / s0)}$ N·s — the area of the shaded region. A larger $s$ discounts the force sooner, so the area shrinks like $1/s$.`,
          visual: fpic(`${F0}*exp(-${s0}x)`, [0, T], [0, 1.18 * F0], t`The force (dashed) and the weighted force $${F0}\,e^{-${s0}t}$, whose area is $F(${s0})$.`, { ylabel: 'N', curves: [{ fn: String(F0), color: 'ink3', dash: true, width: 1.6 }], shade: [{ fn: `${F0}*exp(-${s0}x)`, from: 0, to: T, color: 'accent', alpha: 0.22 }] }),
        };
      },
    }),
    expr({
      id: 'poly', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), b = r.int(1, 6), c = r.int(1, 9);
        return {
          prompt: t`Find $\mathcal{L}\{${co(a)}t^2 - ${co(b)}t + ${c}\}$.`,
          answer: `${2 * a}/s^3 - ${b}/s^2 + ${c}/s`, answerTeX: t`\frac{${2 * a}}{s^3} - \frac{${b}}{s^2} + \frac{${c}}{s}`, lhs: 'F(s)',
          vars: { s: [0.5, 3] },
          errors: [
            { answer: `${a}/s^3 - ${b}/s^2 + ${c}/s`, feedback: t`$\mathcal{L}\{t^2\} = 2!/s^3 = 2/s^3$: the factorial is easy to drop.` },
            { answer: `${2 * a}/s^2 - ${b}/s + ${c}`, feedback: t`The power of $s$ is one more than the power of $t$: $\mathcal{L}\{t^n\} = n!/s^{n+1}$, and $\mathcal{L}\{1\} = 1/s$, not 1.` },
          ],
          hints: [t`The transform is linear: transform each term and add.`, t`$\mathcal{L}\{t^n\} = n!/s^{n+1}$: $\;\mathcal{L}\{t^2\} = 2/s^3$, $\mathcal{L}\{t\} = 1/s^2$, $\mathcal{L}\{1\} = 1/s$.`],
          teach: t`Linearity plus $\mathcal{L}\{t^n\} = n!/s^{n+1}$ transforms any polynomial term by term.`,
          explain: t`$${a}\cdot\dfrac{2}{s^3} - ${b}\cdot\dfrac{1}{s^2} + ${c}\cdot\dfrac{1}{s} = \dfrac{${2 * a}}{s^3} - \dfrac{${b}}{s^2} + \dfrac{${c}}{s}$.`,
          visual: fpic(`${a}x^2 - ${b}x + ${c}`, [0, 3], [Math.min(0, c - (b * b) / (4 * a)) - 1, a * 9 - 3 * b + c + 2], t`The function being transformed. Each power of $t$ becomes one more power of $1/s$.`),
        };
      },
    }),
    expr({
      id: 'trig', difficulty: 2,
      gen(r) {
        const A = r.int(2, 6), B = r.intExcept(-5, 5, [0]), w = r.int(2, 5);
        return {
          prompt: t`Find $\mathcal{L}\{${A}\cos ${w}t ${B < 0 ? '-' : '+'} ${co(Math.abs(B))}\sin ${w}t\}$.`,
          answer: `(${A}s + (${B * w}))/(s^2 + ${w * w})`, answerTeX: t`\frac{${A}s ${B < 0 ? '-' : '+'} ${Math.abs(B * w)}}{s^2 + ${w * w}}`, lhs: 'F(s)',
          vars: { s: [0.5, 3] },
          errors: [
            { answer: `(${A * w} + (${B})*s)/(s^2 + ${w * w})`, feedback: t`Cosine and sine are swapped: $\mathcal{L}\{\cos\omega t\} = s/(s^2 + \omega^2)$ has the $s$ on top; $\mathcal{L}\{\sin\omega t\} = \omega/(s^2 + \omega^2)$ has $\omega$.` },
            { answer: `(${A}s + (${B * w}))/(s^2 - ${w * w})`, feedback: t`That denominator, $s^2 - \omega^2$, belongs to $\cosh$ and $\sinh$. Sine and cosine have $s^2 + \omega^2$.` },
            { answer: `(${A}s + (${B}))/(s^2 + ${w * w})`, feedback: t`$\mathcal{L}\{\sin ${w}t\} = ${w}/(s^2 + ${w * w})$: the sine brings its $\omega$ to the numerator.` },
          ],
          hints: [t`Use linearity, then the table: $\mathcal{L}\{\cos\omega t\} = \dfrac{s}{s^2 + \omega^2}$, $\mathcal{L}\{\sin\omega t\} = \dfrac{\omega}{s^2 + \omega^2}$.`],
          teach: t`Cosine puts $s$ in the numerator and sine puts $\omega$; both share the denominator $s^2 + \omega^2$.`,
          explain: t`$${A}\cdot\dfrac{s}{s^2 + ${w * w}} ${B < 0 ? '-' : '+'} ${Math.abs(B)}\cdot\dfrac{${w}}{s^2 + ${w * w}} = \dfrac{${A}s ${B < 0 ? '-' : '+'} ${Math.abs(B * w)}}{s^2 + ${w * w}}$. Its poles are at $s = \pm ${w}i$: an undamped oscillation at $\omega = ${w}$ rad/s.`,
          visual: fpic(`${A}cos(${w}x) + (${B})sin(${w}x)`, [0, 4], [-1.25 * Math.hypot(A, B), 1.25 * Math.hypot(A, B)], t`The function: one sinusoid of angular frequency ${w} rad/s and amplitude $\sqrt{${A * A} + ${B * B}}$.`),
        };
      },
    }),
    expr({
      id: 'first-shift', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), w = r.int(2, 5), sin = r.bool(0.5);
        const ans = sin ? `${w}/((s + ${a})^2 + ${w * w})` : `(s + ${a})/((s + ${a})^2 + ${w * w})`;
        return {
          prompt: t`Find $\mathcal{L}\{e^{-${a}t}${sin ? '\\sin' : '\\cos'} ${w}t\}$.`,
          answer: ans, answerTeX: sin ? t`\frac{${w}}{(s + ${a})^2 + ${w * w}}` : t`\frac{s + ${a}}{(s + ${a})^2 + ${w * w}}`, lhs: 'F(s)',
          vars: { s: [0.5, 3] },
          errors: [
            { answer: sin ? `${w}/((s - ${a})^2 + ${w * w})` : `(s - ${a})/((s - ${a})^2 + ${w * w})`, feedback: t`Shift the right way: $e^{at}f$ has transform $F(s - a)$, and here $a = -${a}$, so $s$ becomes $s + ${a}$.` },
            { answer: sin ? `${w}/((s^2 + ${w * w})*(s + ${a}))` : `s/((s^2 + ${w * w})*(s + ${a}))`, feedback: t`The transform of a product is not the product of the transforms. Multiplying by $e^{-${a}t}$ **shifts** $F$: replace every $s$ by $s + ${a}$.` },
            ...(sin ? [] : [{ answer: `s/((s + ${a})^2 + ${w * w})`, feedback: t`Every $s$ shifts — the one in the numerator too: $\mathcal{L}\{\cos ${w}t\} = \frac{s}{s^2 + ${w * w}}$ becomes $\frac{s + ${a}}{(s + ${a})^2 + ${w * w}}$.` }]),
          ],
          hints: [t`First shift: $\mathcal{L}\{e^{at}f(t)\} = F(s - a)$.`, t`Start from $\mathcal{L}\{${sin ? '\\sin' : '\\cos'} ${w}t\} = \dfrac{${sin ? w : 's'}}{s^2 + ${w * w}}$ and replace every $s$ by $s + ${a}$.`],
          teach: t`Multiplying $f(t)$ by $e^{at}$ shifts its transform: $F(s)$ becomes $F(s - a)$, every $s$ included.`,
          explain: t`$F(s) = \dfrac{${sin ? w : 's'}}{s^2 + ${w * w}}$ shifted to $s + ${a}$: $\;${sin ? t`\dfrac{${w}}{(s + ${a})^2 + ${w * w}}` : t`\dfrac{s + ${a}}{(s + ${a})^2 + ${w * w}}`}$. The poles move from $\pm ${w}i$ to $-${a} \pm ${w}i$: the decay $e^{-${a}t}$ is the poles’ real part.`,
          visual: fpic(`exp(-${a}x)*${sin ? 'sin' : 'cos'}(${w}x)`, [0, 3], [-1.1, 1.15], t`The damped oscillation (blue) inside its envelope $\pm e^{-${a}t}$ (dashed).`, { curves: [{ fn: `exp(-${a}x)`, color: 'ink3', dash: true, width: 1.4 }, { fn: `-exp(-${a}x)`, color: 'ink3', dash: true, width: 1.4 }] }),
        };
      },
    }),
    mcq({
      id: 'product-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes

$$\mathcal{L}\{t\sin t\} = \mathcal{L}\{t\}\cdot\mathcal{L}\{\sin t\} = \frac{1}{s^2}\cdot\frac{1}{s^2 + 1}.$$

What is wrong?`,
      choices: [
        t`The transform of a product is not the product of the transforms; the right answer is $\dfrac{2s}{(s^2+1)^2}$`,
        'Nothing: the transform is linear, so it can be split across a product',
        t`Only the order: it should be $\mathcal{L}\{\sin t\}\cdot\mathcal{L}\{t\}$`,
        t`$\mathcal{L}\{t\}$ is $1/s$, not $1/s^2$, so the answer is $\dfrac{1}{s(s^2+1)}$`,
      ],
      answer: 0,
      why: {
        1: t`Linearity covers sums and constant multiples: $\mathcal{L}\{af + bg\} = aF + bG$. It says nothing about $f\cdot g$.`,
        2: 'Multiplication commutes, so the order changes nothing; the error is splitting the product at all.',
        3: t`$\mathcal{L}\{t\} = 1!/s^2 = 1/s^2$ is right. The mistake is the product.`,
      },
      hints: ['Linearity covers sums and constant multiples. Does it cover products of two functions of t?', t`Use the first shift instead: $t\,e^{it}$ has transform $\dfrac{1}{(s - i)^2}$, and $t\sin t$ is its imaginary part.`],
      teach: t`The transform is linear, but it does not turn a product $f(t)g(t)$ into $F(s)G(s)$ — that belongs to the convolution, met in DE-6.5.`,
      explain: t`$\mathcal{L}\{t\,e^{it}\} = \dfrac{1}{(s - i)^2} = \dfrac{(s + i)^2}{(s^2 + 1)^2} = \dfrac{s^2 - 1 + 2is}{(s^2 + 1)^2}$, whose imaginary part gives $\mathcal{L}\{t\sin t\} = \dfrac{2s}{(s^2 + 1)^2}$. The double pole at $\pm i$ is the signature of the growing amplitude $t$.`,
      visual: fpic('x*sin(x)', [0, 12], [-12, 12], t`$t\sin t$ (blue) and its factors, $t$ and $\sin t$ (dashed): a sinusoid whose amplitude grows linearly.`, { curves: [{ fn: 'x', color: 'ink3', dash: true, width: 1.4 }, { fn: 'sin(x)', color: 'gold', dash: true, width: 1.4 }] }),
    }),
    mcq({
      id: 'exists', difficulty: 2,
      prompt: t`Which of these functions has **no** Laplace transform?`,
      choices: [t`$e^{t^2}$`, t`$e^{5t}$`, t`$t^{10}$`, t`$1/\sqrt{t}$`],
      answer: 0,
      why: {
        1: t`It grows fast, but only exponentially: $\int_0^\infty e^{-st}e^{5t}\,dt$ converges for $s > 5$, giving $1/(s - 5)$.`,
        2: t`Every polynomial is of exponential order — eventually below $e^{ct}$ for any $c > 0$. $\mathcal{L}\{t^{10}\} = 10!/s^{11}$.`,
        3: t`It is infinite at $t = 0$, but integrably so ($\int_0^1 t^{-1/2}dt = 2$). Its transform is $\sqrt{\pi/s}$.`,
      },
      hints: [t`$F(s)$ exists when $e^{-st}f(t)$ eventually decays for some large enough $s$ — when $|f(t)| \le Me^{ct}$ for some constants $M$ and $c$.`, t`Compare $t^2$ with $ct$ for large $t$: which wins, whatever $c$ is?`],
      teach: t`A function has a Laplace transform when it grows no faster than some exponential $e^{ct}$ (and is integrable near $t = 0$); then $F(s)$ exists for $s > c$.`,
      explain: t`$e^{-st}e^{t^2} = e^{t(t - s)}$ grows without bound once $t > s$, however large $s$ is, so the integral diverges for every $s$. Every function in this module — polynomials, exponentials, sines, steps and pulses — is of exponential order.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 8], y: [-1, 30], ylog: true, xlabel: 't', ylabel: 'size', aspect: 'wide',
          curves: [
            { fn: '0.4343*x^2', color: 'bad', label: 'exp(t²)', labelAt: 6.6, labelDx: -66, labelDy: -6 },
            { fn: '2.1715*x', color: 'accent', label: 'exp(5t)', labelAt: 7.2, labelDx: -10, labelDy: -14 },
            { fn: '10*log10(x)', color: 'gold', domain: [0.8, 8], label: 't¹⁰', labelAt: 7.4, labelDx: 0, labelDy: -14 },
          ],
        },
        caption: t`Three fast-growing functions on a logarithmic scale, on which every exponential $e^{ct}$ is a straight line.`,
      },
    }),
    expr({
      id: 'inverse', difficulty: 2,
      gen(r) {
        const a = r.int(2, 6), b = r.int(1, 5), k = r.int(1, 4), w = r.int(2, 4), m = r.int(1, 3);
        return {
          prompt: t`Find $f(t)$ if $F(s) = \dfrac{${a}}{s} - \dfrac{${b}}{s + ${k}} + \dfrac{${m * w}}{s^2 + ${w * w}}$.`,
          answer: `${a} - ${b}*e^(-${k}t) + ${m}*sin(${w}t)`, answerTeX: t`${a} - ${co(b)}e^{-${k}t} + ${co(m)}\sin ${w}t`, lhs: 'f(t)',
          vars: { t: [0, 3] },
          errors: [
            { answer: `${a} - ${b}*e^(-${k}t) + ${m * w}*sin(${w}t)`, feedback: t`$\mathcal{L}\{\sin ${w}t\} = ${w}/(s^2 + ${w * w})$, so $${m * w}/(s^2 + ${w * w})$ is $${m}\sin ${w}t$: divide out the $\omega$.` },
            { answer: `${a} - ${b}*e^(${k}t) + ${m}*sin(${w}t)`, feedback: t`$1/(s - a)$ comes from $e^{at}$, so $1/(s + ${k})$ comes from $e^{-${k}t}$: the sign flips.` },
            { answer: `${a}t - ${b}*e^(-${k}t) + ${m}*sin(${w}t)`, feedback: t`$1/s$ is the transform of the constant 1; it is $1/s^2$ that comes from $t$.` },
          ],
          hints: [t`Read the table backwards, one term at a time (the inverse is linear too).`, t`$\dfrac1s \leftarrow 1$, $\;\dfrac{1}{s + ${k}} \leftarrow e^{-${k}t}$, $\;\dfrac{${w}}{s^2 + ${w * w}} \leftarrow \sin ${w}t$.`],
          teach: t`Inverting is reading the table backwards term by term; a function with a transform is fixed by it (for continuous $f$, uniquely).`,
          explain: t`$f(t) = ${a} - ${co(b)}e^{-${k}t} + ${co(m)}\sin ${w}t$. Each pole of $F$ is a term of $f$: the pole at $0$ is the constant, the one at $-${k}$ the decaying exponential, the pair at $\pm ${w}i$ the oscillation.`,
          visual: splane([[0, 0, 's = 0'], [-k, 0, `−${k}`], [0, w, `${w}i`], [0, -w, `−${w}i`]], t`The poles of $F(s)$, where its denominators vanish. Each pole will turn out to be one term of $f(t)$.`, { x: [-k - 1.5, 1.5], y: [-w - 1.2, w + 1.2] }),
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-table', difficulty: 2,
      gen(r) {
        const a = r.int(2, 7), b = r.pick([-3, -2, 2, 3]), c = r.int(1, 4);
        return {
          prompt: t`Find $\mathcal{L}\{${co(a)}e^{${b}t} - ${co(c)}t^3\}$.`,
          answer: `${a}/(s - (${b})) - ${6 * c}/s^4`, answerTeX: t`\frac{${a}}{s ${b < 0 ? '+' : '-'} ${Math.abs(b)}} - \frac{${6 * c}}{s^4}`, lhs: 'F(s)',
          vars: { s: [4, 7] },
          errors: [
            { answer: `${a}/(s + (${b})) - ${6 * c}/s^4`, feedback: t`$\mathcal{L}\{e^{at}\} = 1/(s - a)$: here $a = ${b}$.` },
            { answer: `${a}/(s - (${b})) - ${c}/s^4`, feedback: t`$\mathcal{L}\{t^3\} = 3!/s^4 = 6/s^4$.` },
          ],
          hints: [t`Linearity, then $\mathcal{L}\{e^{at}\} = 1/(s - a)$ and $\mathcal{L}\{t^n\} = n!/s^{n+1}$.`],
          teach: t`Transform term by term: exponentials give $1/(s - a)$, powers give $n!/s^{n+1}$.`,
          explain: t`$${a}\cdot\dfrac{1}{s ${b < 0 ? '+' : '-'} ${Math.abs(b)}} - ${c}\cdot\dfrac{6}{s^4}$, valid for $s > ${Math.max(b, 0)}$.`,
          visual: fpic(`${a}exp(${b}x) - ${c}x^3`, [0, 1.5], [Math.min(-0.5, a * Math.exp(b * 1.5) - c * 3.375) - 0.5, Math.max(a * Math.exp(b * 1.5) - c * 3.375, a) + 1], t`The function being transformed, over its first 1.5 s.`),
        };
      },
    }),
    num({
      id: 'cp-total-impulse', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([20, 30, 40, 60]), tau = r.pick([1.5, 2, 2.5, 3]);
        const I = A * tau * tau, Tmax = A * tau * Math.exp(-1);
        return {
          prompt: t`A small solid rocket motor’s thrust is modelled as $T(t) = A\,t\,e^{-t/\tau}$ with $A = ${A}$ kN/s and $\tau = ${tau}$ s: it rises from zero, peaks at $t = \tau$ and tails off. Use the first shift to find $\mathcal{L}\{T\}(s)$, then find the motor’s **total impulse** $I = \int_0^\infty T\,dt$.`,
          answer: I, units: 'kN s', tol: { rel: 0.005 },
          integrand: `${A}*x*e^(-x/${tau})`, limits: [0, 'inf'],
          errors: [{ value: A * tau, feedback: t`$\mathcal{L}\{t\,e^{-t/\tau}\}$ is $1/(s + 1/\tau)^2$ — squared, since it comes from $\mathcal{L}\{t\} = 1/s^2$.` }, { value: Tmax, feedback: 'That is the peak thrust, in kN. The total impulse is the area under the whole thrust curve.' }],
          hints: [t`$\mathcal{L}\{t\} = 1/s^2$, so by the first shift $\mathcal{L}\{t\,e^{-t/\tau}\} = \dfrac{1}{(s + 1/\tau)^2}$.`, t`At $s = 0$ the weight $e^{-st}$ is 1, so $F(0) = \int_0^\infty T\,dt$: the total impulse is the transform at $s = 0$.`],
          teach: t`Setting $s = 0$ removes the weight, so $F(0) = \int_0^\infty f\,dt$ — for a thrust curve, the total impulse.`,
          explain: t`$\mathcal{L}\{T\} = \dfrac{A}{(s + 1/\tau)^2}$, so $I = F(0) = A\tau^2 = ${A} \times ${tau}^2 = ${nice(I)}$ kN·s. Peak thrust is $A\tau/e = ${fmt(Tmax, 3)}$ kN, so the motor delivers its impulse in roughly $I/T_{\max} = e\tau \approx ${fmt(Math.E * tau, 2)}$ s of peak-equivalent burn. Real thrust curves are measured, not exponential; the model only captures rise, peak and tail-off.`,
          visual: {
            type: 'graph',
            params: { x: [0, 10 * tau / 2], y: [0, 1.2 * Tmax], xlabel: 't (s)', ylabel: 'kN', aspect: 'wide', curves: [{ fn: `${A}*x*exp(-x/${tau})`, color: 'accent', width: 2.6 }], shade: [{ fn: `${A}*x*exp(-x/${tau})`, from: 0, to: 5 * tau, color: 'accent', alpha: 0.22 }], vlines: [{ x: tau, label: 't = τ', color: 'gold' }] },
            caption: t`The model thrust curve; the shaded area is the total impulse. The tail continues past the plot, ever smaller.`,
          },
        };
      },
    }),
    mcq({
      id: 'cp-shift', difficulty: 2,
      prompt: t`What is $\mathcal{L}\{e^{2t}\cos 3t\}$?`,
      choices: [t`$\dfrac{s - 2}{(s-2)^2 + 9}$`, t`$\dfrac{s + 2}{(s+2)^2 + 9}$`, t`$\dfrac{s}{(s^2 + 9)(s - 2)}$`, t`$\dfrac{s - 2}{s^2 + 9}$`],
      answer: 0,
      why: {
        1: t`That is $e^{-2t}\cos 3t$. Multiplying by $e^{at}$ replaces $s$ by $s - a$, and here $a = +2$.`,
        2: t`That multiplies the two transforms, which is not what multiplying the functions does.`,
        3: t`Every $s$ must shift, including those in the denominator.`,
      },
      hints: [t`First shift: $\mathcal{L}\{e^{at}f\} = F(s - a)$, with every $s$ replaced.`],
      teach: t`Multiplying by $e^{at}$ shifts the whole transform to $F(s - a)$.`,
      explain: t`$\mathcal{L}\{\cos 3t\} = \dfrac{s}{s^2 + 9}$; replacing every $s$ by $s - 2$ gives $\dfrac{s - 2}{(s - 2)^2 + 9}$, with poles at $2 \pm 3i$ — in the right half-plane, as a growing oscillation’s must be.`,
      visual: fpic('exp(2x)*cos(3x)', [0, 2], [-40, 50], t`$e^{2t}\cos 3t$: an oscillation whose amplitude grows by a factor $e^2$ every second.`, { curves: [{ fn: 'exp(2x)', color: 'ink3', dash: true, width: 1.4 }, { fn: '-exp(2x)', color: 'ink3', dash: true, width: 1.4 }] }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §6.1 The Laplace transform', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Laplace transforms (definition and table)', url: 'https://tutorial.math.lamar.edu/Classes/DE/LaplaceIntro.aspx' },
  ],
});
