// Antiderivatives and the Fundamental Theorem of Calculus — the bridge
// between rates and totals that every later application in MATH 1220 uses.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, polyTeX } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-0.1',
  title: 'Antiderivatives and the Fundamental Theorem',
  minutes: 9, difficulty: 2,
  intro: t`An **antiderivative** of $f$ is any function $F$ with $F' = f$. Antiderivatives of the same function differ only by a constant, which is why an indefinite integral carries a $+\,C$. The **Fundamental Theorem of Calculus** says that a definite integral — an accumulated, signed area — can be computed from any antiderivative:

$$\int_a^b f(x)\,dx = F(b) - F(a)$$

It also runs the other way: the area function $A(x) = \int_a^x f(t)\,dt$ has slope $A'(x) = f(x)$. This is how physics turns every rate into a total — displacement from velocity, impulse from force, charge from current.`,
  symbols: [
    { tex: 'f(x)', text: 'the **integrand**: the rate being accumulated (a velocity in m/s, a force in N, …)' },
    { tex: 'F(x)', text: 'an **antiderivative** of $f$: any function with $F\'(x) = f(x)$' },
    { tex: 'a,\\ b', text: 'the lower and upper **limits of integration** — where the accumulation starts and stops' },
    { tex: 'dx', text: 'the width of an infinitesimally thin slice; it also names the variable you integrate over' },
    { tex: '\\int_a^b f(x)\\,dx', text: 'the **definite integral**: the signed area between the graph of $f$ and the $x$-axis from $a$ to $b$ (area below the axis counts as negative). Its units are the units of $f$ times the units of $x$' },
    { tex: 'C', text: 'the **constant of integration** in an indefinite integral $\\int f\\,dx = F(x) + C$; it cancels in $F(b) - F(a)$' },
  ],
  why: t`Every “total from a rate” in this course — area, volume, work, hydrostatic force, mass — is a definite integral evaluated with this theorem.`,
  visual: {
    type: 'graph',
    title: 'The slope of the area function is the height of the curve',
    lead: t`The blue curve is $f(x) = \sin x + \tfrac12$. The violet curve is its area function $A(x) = \int_0^x f(t)\,dt$. Drag the gold point along $A$: the shading is the area that has accumulated from $0$ to $x_0$, and the gold line is the tangent to $A$ at $x_0$.`,
    tasks: [
      t`Compare the readouts: the slope of $A$ always equals $f(x_0)$ — that is Part 1 of the theorem.`,
      t`Drag to where $f$ crosses zero (near $x = 3.67$): $A$ peaks there and the tangent is flat.`,
      t`Where $f < 0$ the new shading is red, it counts as negative, and $A$ falls.`,
    ],
    params: {
      x: [-0.3, 7], y: [-1, 4.3],
      curves: [
        { fn: 'sin(x) + 0.5', color: 'accent', label: 'f(x)', labelAt: 4.75 },
        { fn: '1 - cos(x) + 0.5*x', color: 'violet', label: 'A(x)', labelAt: 6.3 },
      ],
      shade: [
        { fn: 'max(sin(x) + 0.5, 0)', from: 0, to: 'x0', color: 'good', alpha: 0.28 },
        { fn: 'min(sin(x) + 0.5, 0)', from: 0, to: 'x0', color: 'bad', alpha: 0.32 },
      ],
      tangent: { fn: '1 - cos(x) + 0.5*x', at: 2.2 },
      vlines: [{ x: 'x0', color: 'ink3' }],
      points: [{ x: 'x0', y: 'sin(x0) + 0.5', color: 'accent' }],
      readouts: [
        { label: t`shaded area $A(x_0)$`, expr: '1 - cos(x0) + 0.5*x0', digits: 3 },
        { label: t`slope of $A$ at $x_0$`, expr: 'slope', digits: 3 },
        { label: t`$f(x_0)$`, expr: 'sin(x0) + 0.5', digits: 3 },
      ],
    },
    caption: t`$A(x) = 1 - \cos x + \tfrac{x}{2}$ is computed exactly, not numerically. Green area counts as positive, red as negative.`,
  },
  example: {
    prompt: t`Evaluate $\displaystyle\int_1^4 \left(3\sqrt{x} + \frac{1}{x^2}\right)dx$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 4.6], y: [0, 7.5],
        curves: [{ fn: '3*sqrt(x) + 1/x^2', color: 'accent', label: 'y = 3√x + 1/x²', labelAt: 2.6 }],
        shade: [{ fn: '3*sqrt(x) + 1/x^2', from: 1, to: 4, color: 'accent', alpha: 0.22 }],
        vlines: [{ x: 1, label: 'a = 1' }, { x: 4, label: 'b = 4' }],
      },
      caption: 'The shaded area is the integral.',
    },
    steps: [
      { label: 'Rewrite as powers', text: t`$3\sqrt{x} + \dfrac{1}{x^2} = 3x^{1/2} + x^{-2}$, so the power rule $\int x^n\,dx = \dfrac{x^{n+1}}{n+1}$ ($n \ne -1$) applies to each term.` },
      { label: 'Antidifferentiate', text: t`$F(x) = 3\cdot\dfrac{x^{3/2}}{3/2} + \dfrac{x^{-1}}{-1} = 2x^{3/2} - \dfrac{1}{x}$. No $+C$ is needed: it would cancel in $F(4) - F(1)$.` },
      { label: 'Check by differentiating', text: t`$F'(x) = 2\cdot\tfrac32 x^{1/2} + x^{-2} = 3\sqrt{x} + \dfrac{1}{x^2}$ ✓` },
      { label: 'Evaluate', text: t`$F(4) - F(1) = \left(2\cdot 8 - \tfrac14\right) - \left(2 - 1\right) = 15.75 - 1 = 14.75$.` },
      { label: 'Sense check', text: t`On $[1, 4]$ the integrand runs from $4$ up to about $6.06$, so the area lies between $3 \times 4 = 12$ and $3 \times 6.06 \approx 18.2$. $14.75$ fits.` },
    ],
    answer: t`$\displaystyle\int_1^4 \left(3\sqrt{x} + \frac{1}{x^2}\right)dx = \frac{59}{4} = 14.75$`,
  },
  practice: [
    mcq({
      id: 'which-antiderivative', difficulty: 1,
      gen(r) {
        const a = r.int(1, 4), b = r.intExcept(-4, 4, [0]), c = r.int(1, 6);
        return {
          prompt: t`Which function is an antiderivative of $f(x) = ${polyTeX([c, 2 * b, 3 * a])}$?`,
          choices: [
            t`$${polyTeX([0, c, b, a])}$`,
            t`$${polyTeX([2 * b, 6 * a])}$`,
            t`$${polyTeX([0, c, 2 * b, 3 * a])}$`,
            t`$${polyTeX([0, 0, b, a])}$`,
          ],
          answer: 0,
          why: {
            1: t`That is the derivative $f'(x)$ — you differentiated instead of undoing a derivative.`,
            2: t`Each power went up by one but was not divided by the new power: $\int x^2\,dx = \tfrac{x^3}{3}$, not $x^3$.`,
            3: t`The constant term ${c} integrates to $${c}x$; it does not disappear.`,
          },
          hints: [t`An antiderivative $F$ must satisfy $F' = f$ — differentiate each choice and compare.`, t`Power rule backwards: $\int x^n\,dx = \dfrac{x^{n+1}}{n+1}$.`],
          teach: 'To antidifferentiate a polynomial, raise each power by one and divide by the new power.',
          explain: t`$\dfrac{d}{dx}\left(${polyTeX([0, c, b, a])}\right) = ${polyTeX([c, 2 * b, 3 * a])} = f(x)$. Adding any constant gives another antiderivative.`,
        };
      },
    }),
    expr({
      id: 'power-rule', difficulty: 2,
      gen(r) {
        const a = r.pick([3, 6, 9]), b = r.int(2, 6), k = (2 * a) / 3;
        return {
          prompt: t`Find $\displaystyle\int \left(${a}\sqrt{x} + \frac{${b}}{x^2}\right)dx$.`,
          answer: `${k}*x^(3/2) - ${b}/x`,
          answerTeX: t`${k}x^{3/2} - \frac{${b}}{x} + C`,
          vars: { x: [0.5, 3] }, mode: 'constant',
          errors: [
            { answer: `${k}*x^(3/2) + ${b}/x`, feedback: t`Check the sign of the second term: $\int x^{-2}\,dx = \dfrac{x^{-1}}{-1} = -\dfrac{1}{x}$.` },
            { answer: `${(3 * a) / 2}*x^(3/2) - ${b}/x`, feedback: t`You multiplied by $\tfrac32$ instead of dividing: $\int x^{1/2}\,dx = \dfrac{x^{3/2}}{3/2} = \tfrac23 x^{3/2}$.` },
          ],
          hints: [t`Write each term as a power of $x$: $\sqrt{x} = x^{1/2}$ and $\dfrac{1}{x^2} = x^{-2}$.`, t`Apply $\int x^n\,dx = \dfrac{x^{n+1}}{n+1}$ with $n = \tfrac12$ and with $n = -2$.`],
          teach: 'Rewrite roots and reciprocals as powers of x before applying the power rule.',
          explain: t`$${a}\cdot\dfrac{x^{3/2}}{3/2} + ${b}\cdot\dfrac{x^{-1}}{-1} = ${k}x^{3/2} - \dfrac{${b}}{x} + C$. Differentiate to check: $${k}\cdot\tfrac32 x^{1/2} + ${b}x^{-2}$ ✓`,
        };
      },
    }),
    expr({
      id: 'basic-table', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), b = r.int(2, 5), c = r.int(2, 5);
        return {
          prompt: t`Find $\displaystyle\int \left(${a}e^{x} + ${b}\cos x + \frac{${c}}{x}\right)dx$ for $x > 0$.`,
          answer: `${a}e^x + ${b}sin(x) + ${c}ln(x)`,
          answerTeX: t`${a}e^{x} + ${b}\sin x + ${c}\ln x + C`,
          vars: { x: [0.5, 3] }, mode: 'constant',
          errors: [
            { answer: `${a}e^x - ${b}sin(x) + ${c}ln(x)`, feedback: t`$\int\cos x\,dx = +\sin x$. The minus sign belongs to the *derivative* of $\cos x$.` },
            { answer: `${a}e^x + ${b}sin(x) - ${c}/x^2`, feedback: t`$-\dfrac{${c}}{x^2}$ is the derivative of $\dfrac{${c}}{x}$. You need the function whose derivative is $\dfrac{${c}}{x}$: that is $${c}\ln x$.` },
          ],
          hints: [t`Read the derivative table backwards: $(e^x)' = e^x$, $(\sin x)' = \cos x$, $(\ln x)' = \tfrac1x$.`, t`Integrate term by term; constant factors come along unchanged.`],
          teach: t`The basic antiderivatives — of $e^x$, $\cos x$, $\sin x$ and $1/x$ — are the derivative table read backwards.`,
          explain: t`$\int ${a}e^x\,dx = ${a}e^x$, $\int ${b}\cos x\,dx = ${b}\sin x$, $\int \tfrac{${c}}{x}\,dx = ${c}\ln|x| = ${c}\ln x$ for $x > 0$. Add $+C$.`,
        };
      },
    }),
    num({
      id: 'definite-sine', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), b = r.int(1, 3);
        const val = 2 * a + b * Math.PI;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\pi} \left(${a === 1 ? '' : a}\sin x + ${b}\right)dx$. Give a decimal to 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: b * Math.PI - 2 * a, feedback: t`Watch the signs: an antiderivative of $\sin x$ is $-\cos x$, and $-\cos\pi - (-\cos 0) = 1 + 1 = 2$.` }],
          hints: [t`An antiderivative is $F(x) = -${a === 1 ? '' : a}\cos x + ${b}x$.`, t`Compute $F(\pi) - F(0)$, remembering $\cos\pi = -1$.`],
          teach: 'Evaluate any antiderivative at the upper limit and subtract its value at the lower limit.',
          explain: t`$F(\pi) - F(0) = (${a} + ${b}\pi) - (-${a}) = ${2 * a} + ${b}\pi \approx ${fmt(val)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 3.6], y: [-0.5, a + b + 1], curves: [{ fn: `${a}*sin(x) + ${b}`, color: 'accent' }], shade: [{ fn: `${a}*sin(x) + ${b}`, from: 0, to: 'pi', color: 'accent', alpha: 0.22 }] }, caption: 'The shaded area is the integral.' },
        };
      },
    }),
    num({
      id: 'ftc-part1', difficulty: 2,
      gen(r) {
        const [a, c] = r.pick([[2, 5], [4, 9], [2, 12], [3, 16], [4, 20], [6, 13], [1, 8], [3, 7]]);
        const val = Math.sqrt(a * a + c);
        return {
          prompt: t`Let $G(x) = \displaystyle\int_0^x \sqrt{t^2 + ${c}}\;dt$. Find $G'(${a})$.`,
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: val - Math.sqrt(c), feedback: t`$G'(x)$ is the integrand at the moving upper limit only; nothing is subtracted at the fixed lower limit.` }],
          hints: [t`Part 1 of the Fundamental Theorem: if $G(x) = \int_0^x f(t)\,dt$ then $G'(x) = f(x)$.`, t`So $G'(${a})$ is the integrand evaluated at $t = ${a}$.`],
          teach: 'The rate at which area accumulates is the height of the curve at the moving edge.',
          explain: t`$G'(x) = \sqrt{x^2 + ${c}}$, so $G'(${a}) = \sqrt{${a * a} + ${c}} = ${nice(val)}$. You never needed $G$ itself — which is lucky, because it is not a simple function.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, a + 1.5], y: [0, val + 1.5], curves: [{ fn: `sqrt(x^2 + ${c})`, color: 'accent' }], shade: [{ fn: `sqrt(x^2 + ${c})`, from: 0, to: a, color: 'accent', alpha: 0.2 }], points: [{ x: a, y: val, color: 'gold', label: '?' }], vlines: [{ x: a }] }, caption: t`The shaded area is $G(${a})$; its rate of growth is the height of the curve at the right edge.` },
        };
      },
    }),
    expr({
      id: 'ftc-chain', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3]);
        const pow = n === 2 ? 'x' : 'x^2';
        return {
          prompt: t`Find $\displaystyle\frac{d}{dx}\int_0^{x^{${n}}} \cos t\;dt$.`,
          answer: `${n}${pow}*cos(x^${n})`,
          answerTeX: t`${n}${n === 2 ? 'x' : 'x^2'}\cos\left(x^{${n}}\right)`,
          vars: { x: [-1.4, 1.4] },
          errors: [
            { answer: `cos(x^${n})`, feedback: t`Part 1 gives $\cos(x^{${n}})$, but the upper limit is $x^{${n}}$, not $x$: the chain rule multiplies by its derivative.` },
            { answer: `sin(x^${n})`, feedback: t`That is the integral itself. Now differentiate it with respect to $x$.` },
          ],
          hints: [
            t`Let $u = x^{${n}}$. Part 1 says $\dfrac{d}{du}\int_0^{u}\cos t\,dt = \cos u$.`,
            t`Chain rule: $\dfrac{d}{dx} = \dfrac{d}{du}\cdot\dfrac{du}{dx}$, and $\dfrac{du}{dx} = ${n}${n === 2 ? 'x' : 'x^2'}$.`,
          ],
          teach: t`When the upper limit is a function $g(x)$, the derivative of $\int_a^{g(x)} f(t)\,dt$ is $f(g(x))\,g'(x)$.`,
          explain: t`$\dfrac{d}{dx}\int_0^{x^{${n}}}\cos t\,dt = \cos\left(x^{${n}}\right)\cdot ${n}${n === 2 ? 'x' : 'x^2'}$. Check: the integral equals $\sin(x^{${n}})$, whose derivative is the same thing.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes:

$$\int_{-1}^{1}\frac{dx}{x^2} = \left[-\frac{1}{x}\right]_{-1}^{1} = (-1) - (1) = -2.$$

What is wrong?`,
      choices: [
        t`$\dfrac{1}{x^2}$ is undefined at $x = 0$, inside $[-1, 1]$, so the theorem does not apply — and a positive integrand cannot give a negative area`,
        t`The antiderivative should be $+\dfrac1x$`,
        t`The subtraction is backwards; the answer is $+2$`,
        t`The $+\,C$ was left out`,
      ],
      answer: 0,
      why: {
        1: t`$\dfrac{d}{dx}\left(-\dfrac1x\right) = \dfrac{1}{x^2}$, so $-\dfrac1x$ is a correct antiderivative — on each side of $0$ separately.`,
        2: t`$F(b) - F(a)$ with $b = 1$, $a = -1$ is exactly what was computed; the order is fine.`,
        3: t`In a definite integral the constant cancels: $(F(b) + C) - (F(a) + C) = F(b) - F(a)$.`,
      },
      hints: ['The integrand is positive everywhere it is defined. Can the area be negative?', t`The theorem needs $f$ continuous on all of $[a, b]$. Is $\dfrac{1}{x^2}$ continuous at $x = 0$?`],
      teach: t`The Fundamental Theorem needs the integrand continuous on the whole interval $[a, b]$; a blow-up inside the interval breaks it.`,
      explain: t`$\dfrac{1}{x^2}$ blows up at $x = 0$, so $\int_{-1}^{1}\dfrac{dx}{x^2}$ is an *improper* integral, and in fact it diverges (the area is infinite). Plugging in endpoints blindly gave a nonsense negative number.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1.5, 1.5], y: [-0.5, 8], curves: [{ fn: '1/x^2', color: 'accent', label: 'y = 1/x²', labelAt: 0.55 }], vlines: [{ x: -1 }, { x: 1 }] }, caption: 'The curve shoots to infinity at x = 0, inside the interval.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-definite', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), b = r.int(1, 4);
        const val = a + (b * Math.PI ** 2) / 8;
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\pi/2} \left(${a}\cos x + ${b === 1 ? '' : b}x\right)dx$. Give 3 significant figures.`,
          answer: val, tol: { rel: 0.005 },
          hints: [t`An antiderivative is $${a}\sin x + \tfrac{${b}}{2}x^2$.`],
          teach: 'Find an antiderivative, then subtract its value at the lower limit from its value at the upper limit.',
          explain: t`$\left[${a}\sin x + \tfrac{${b}}{2}x^2\right]_0^{\pi/2} = ${a} + \tfrac{${b}}{2}\cdot\tfrac{\pi^2}{4} = ${a} + \tfrac{${b}\pi^2}{8} \approx ${fmt(val)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.2, 1.9], y: [0, a + b * 1.6 + 0.8], curves: [{ fn: `${a}*cos(x) + ${b}*x`, color: 'accent' }], shade: [{ fn: `${a}*cos(x) + ${b}*x`, from: 0, to: 'pi/2', color: 'accent', alpha: 0.22 }] }, caption: 'The shaded area is the integral.' },
        };
      },
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([3, 4, 5, 6]), q = r.pick([0.2, 0.3, 0.5]), T = r.pick([6, 8, 10]);
        const h = (p * T * T) / 2 + (q * T ** 3) / 3;
        return {
          prompt: t`A sounding rocket lifts off vertically. During its burn its velocity is $v(t) = ${p}t + ${q}t^2$ m/s, with $t$ in seconds. How high is it at $t = ${T}$ s?`,
          answer: h, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: (p * T + q * T * T) * T, feedback: t`That treats the speed at $t = ${T}$ s as if it had held for the whole flight. The speed grows, so integrate it.` }],
          hints: [t`Height gained is the integral of velocity: $h = \int_0^{${T}} v(t)\,dt$.`, t`An antiderivative of $v$ is $\tfrac{${p}}{2}t^2 + \tfrac{${q}}{3}t^3$.`],
          teach: 'Displacement is the definite integral of velocity over the time interval.',
          explain: t`$h = \left[\tfrac{${p}}{2}t^2 + \tfrac{${q}}{3}t^3\right]_0^{${T}} = ${nice((p * T * T) / 2)} + ${nice((q * T ** 3) / 3)} = ${fmt(h, 4)}$ m. Since $v > 0$ throughout, this is also the distance travelled.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, T + 1], y: [0, (p * T + q * T * T) * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${p}*x + ${q}*x^2`, color: 'accent' }], shade: [{ fn: `${p}*x + ${q}*x^2`, from: 0, to: T, color: 'accent', alpha: 0.22 }] }, caption: 'Velocity against time; the shaded area is the height gained.' },
        };
      },
    }),
    mcq({
      id: 'cp-area-max', difficulty: 3,
      prompt: t`The graph shows $f(x) = -(x - 1)(x - 4)$. Let $g(x) = \displaystyle\int_0^x f(t)\,dt$ for $0 \le x \le 5$. Where does $g$ reach its largest value?`,
      choices: ['x = 4', 'x = 2.5', 'x = 1', 'x = 5'],
      answer: 0,
      why: {
        1: t`$x = 2.5$ is where $f$ is largest — where $g$ is *climbing fastest*, not where it stops climbing.`,
        2: t`At $x = 1$, $f$ changes from negative to positive, so $g$ stops falling and starts rising: that is a minimum of $g$.`,
        3: t`After $x = 4$, $f < 0$, so $g$ is decreasing on $(4, 5]$: $g(5) < g(4)$.`,
      },
      hints: [t`By Part 1, $g'(x) = f(x)$. Where does $g'$ change from positive to negative?`, t`$g$ rises while $f > 0$ (between $1$ and $4$) and falls while $f < 0$.`],
      teach: t`The area function rises where the integrand is positive and falls where it is negative, so its peaks sit where $f$ crosses from $+$ to $-$.`,
      explain: t`$g' = f$ changes from $+$ to $-$ at $x = 4$. Checking the ends: $g(0) = 0$, $g(4) = \tfrac83 \approx 2.67$, $g(5) = \tfrac56 \approx 0.83$, so the largest value is at $x = 4$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 5.3], y: [-4.5, 3], curves: [{ fn: '-(x - 1)*(x - 4)', color: 'accent', label: 'f(x)', labelAt: 2.5 }], shade: [{ fn: 'max(-(x - 1)*(x - 4), 0)', from: 0, to: 5, color: 'good', alpha: 0.25 }, { fn: 'min(-(x - 1)*(x - 4), 0)', from: 0, to: 5, color: 'bad', alpha: 0.3 }] }, caption: 'Green area adds to g; red area subtracts from it.' },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §4.10 Antiderivatives', url: 'https://openstax.org/books/calculus-volume-1/pages/4-10-antiderivatives' },
    { label: 'OpenStax Calculus Vol. 2, §1.3 The Fundamental Theorem of Calculus', url: 'https://openstax.org/books/calculus-volume-2/pages/1-3-the-fundamental-theorem-of-calculus' },
  ],
});
