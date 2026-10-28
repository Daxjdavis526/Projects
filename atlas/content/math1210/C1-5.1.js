// Antiderivatives — run differentiation backwards; one condition fixes the +C.
// Acceleration to velocity to position is the physicist’s version.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { curveFig, fitY } from './_c1kit.js';

const t = String.raw;

// a family of antiderivatives F + C, faint, with one highlighted
const family = (F, x, y, Cs, hi, caption, { curves = [], ...more } = {}) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide',
    curves: [...Cs.map((c) => ({ fn: `${F} + (${c})`, color: 'ink3', width: 1.2, dash: true })), ...(hi !== undefined ? [{ fn: `${F} + (${hi})`, color: 'accent' }] : []), ...curves],
    ...more,
  },
  caption,
});

// the worked example: a small helicopter’s climb, a(t) = 1.2 − 0.4t
const hAt = (s) => 0.6 * s * s - s ** 3 / 15, vAt = (s) => 1.2 * s - 0.2 * s * s;

export default lesson({
  id: 'math1210.C1-5.1',
  title: 'Antiderivatives',
  minutes: 9, difficulty: 2,
  intro: t`An antiderivative of $f$ is a function $F$ whose derivative is $f$. Since constants differentiate to zero, there is a whole family of them, all the same curve shifted up or down — and by the Mean Value Theorem, on an interval there are no others:

$$\int f(x)\,dx = F(x) + C, \qquad \text{where } F'(x) = f(x)$$

Every derivative rule read backwards is an antiderivative rule: $\int x^n\,dx = \dfrac{x^{n+1}}{n+1} + C$ for $n \ne -1$, $\int \frac{dx}{x} = \ln|x| + C$, $\int\cos x\,dx = \sin x + C$. One extra fact — a starting value — picks out a single member of the family. That is how velocity is recovered from acceleration, and position from velocity.`,
  symbols: [
    { tex: '\\int f(x)\\,dx', text: 'the **indefinite integral**: the whole family of antiderivatives of $f$' },
    { tex: 'F(x)', text: 'any one antiderivative: $F\'(x) = f(x)$' },
    { tex: 'C', text: 'an arbitrary constant; a single condition such as $F(0) = 5$ fixes it' },
    { tex: 'dx', text: 'names the variable you integrate with respect to' },
  ],
  why: t`Newton’s second law gives acceleration; antiderivatives turn it into velocity and position. Every trajectory, from a falling apple to an orbit, starts as an antiderivative with initial conditions.`,
  visual: {
    type: 'graph',
    title: 'Same slopes, a family of curves',
    lead: t`The dashed curves are antiderivatives of $f(x) = x^2 - 1$: $F(x) = \tfrac13x^3 - x + C$ for several $C$. The blue one has the $C$ on the slider. Drag the gold point: at any $x$, every member of the family has the same slope, $f(x)$.`,
    tasks: [
      'Move the gold point: the slope readout always equals f(x), whatever C is.',
      'Change C: the blue curve slides up and down without changing shape.',
      'Find the C that makes the blue curve pass through (0, 1): an initial condition picks one member of the family.',
    ],
    params: {
      x: [-2.6, 2.6], y: [-3.2, 3.2], aspect: 'wide',
      sliders: [{ key: 'C', label: t`Constant $C$`, min: -2, max: 2, step: 0.1, value: -0.5, explain: 'The arbitrary constant: it shifts the antiderivative vertically.' }],
      curves: [
        ...[-2, -1, 0, 1, 2].map((c) => ({ fn: `x^3/3 - x + (${c})`, color: 'ink3', width: 1.1, dash: true })),
        { fn: 'x^3/3 - x + C', color: 'accent' },
      ],
      tangent: { fn: 'x^3/3 - x + C', at: 1.6 },
      points: [{ x: 0, y: 1, color: 'violet', label: '(0, 1)' }],
      readouts: [
        { label: t`$x$`, expr: 'x0', digits: 3 },
        { label: 'slope of the blue curve', expr: 'slope', digits: 3 },
        { label: t`$f(x) = x^2 - 1$`, expr: 'x0^2 - 1', digits: 3 },
      ],
    },
    caption: 'The dashed curves have C = −2, −1, 0, 1, 2. Any antiderivative of x² − 1 on the real line is one of this family.',
  },
  example: {
    prompt: t`A small test helicopter lifts off from rest. For the first $3$ s its vertical acceleration is modelled as $a(t) = 1.2 - 0.4t\ \text{m/s}^2$. How high is it, and how fast is it climbing, at $t = 3$ s?`,
    visual: { type: 'mech-graphlink', params: { a: '1.2 - 0.4*t', T: 3, track: 'vertical', pos: 'h', ground: true, panels: ['x', 'v', 'a'], readouts: ['t', 'x', 'v', 'a'], time: 3 }, caption: 'The modelled climb: acceleration falling linearly, velocity rising and levelling off, height curving upward. An illustrative model, not flight data.' },
    steps: [
      { label: 'Velocity', text: t`$v(t) = \int (1.2 - 0.4t)\,dt = 1.2t - 0.2t^2 + C_1$. It starts from rest, $v(0) = 0$, so $C_1 = 0$.` },
      { label: 'Height', text: t`$h(t) = \int (1.2t - 0.2t^2)\,dt = 0.6t^2 - \tfrac{0.2}{3}t^3 + C_2$. It starts on the ground, $h(0) = 0$, so $C_2 = 0$.` },
      { label: 'Evaluate', text: t`$v(3) = 3.6 - 1.8 = ${nice(vAt(3))}$ m/s and $h(3) = 5.4 - 1.8 = ${nice(hAt(3))}$ m.` },
      { label: 'Check by differentiating', text: t`$\frac{d}{dt}(0.6t^2 - \tfrac{1}{15}t^3) = 1.2t - 0.2t^2 = v$ ✓, and $\frac{d}{dt}(1.2t - 0.2t^2) = 1.2 - 0.4t = a$ ✓.` },
      { label: 'Sense check', text: t`At a constant $1.2\ \text{m/s}^2$ it would reach $5.4$ m; the falling acceleration costs it a third of that. Units: $\text{m/s}^2\cdot\text{s} = \text{m/s}$, then $\text{m/s}\cdot\text{s} = \text{m}$.` },
    ],
    answer: t`At $t = 3$ s: $h = 3.6$ m, climbing at $1.8$ m/s.`,
  },
  practice: [
    expr({
      id: 'table-mix', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 4, 6]), b = r.int(2, 5);
        return {
          prompt: t`Find $\displaystyle\int\left(\frac{${a}}{x^3} + ${b}\sin x\right)dx$ for $x > 0$.`,
          answer: `-${a / 2}/x^2 - ${b}cos(x)`, answerTeX: t`-\frac{${a / 2}}{x^2} - ${b}\cos x`,
          vars: { x: [0.5, 3] }, mode: 'constant', integrand: `${a}/x^3 + ${b}*sin(x)`,
          errors: [{ answer: `-${a / 2}/x^2 + ${b}cos(x)`, feedback: t`$\frac{d}{dx}\cos x = -\sin x$, so an antiderivative of $\sin x$ is $-\cos x$.` }, { answer: `-${3 * a}/x^4 + ${b}cos(x)`, feedback: 'That is the derivative. Raise the power by one and divide by the new power.' }, { answer: `${a}*ln(x^3) - ${b}cos(x)`, feedback: t`Only $x^{-1}$ integrates to a logarithm. Write $\frac{${a}}{x^3} = ${a}x^{-3}$ and use the power rule.` }],
          hints: [t`$\dfrac{${a}}{x^3} = ${a}x^{-3}$: power rule, $\dfrac{x^{-2}}{-2}$.`, t`$\int\sin x\,dx = -\cos x$.`],
          teach: t`Power rule for any power but $-1$: add one to the power, divide by the new power — negative powers included.`,
          explain: t`$${a}\cdot\dfrac{x^{-2}}{-2} = -\dfrac{${a / 2}}{x^2}$, and $${b}\cdot(-\cos x)$: the answer is $-\dfrac{${a / 2}}{x^2} - ${b}\cos x + C$. Differentiate it to check.`,
          visual: curveFig({ fn: `${a}/x^3 + ${b}*sin(x)`, x: [0, 4], y: [-1, 12], domain: [0.55, 4], caption: t`The integrand $f(x) = ${a}/x^3 + ${b}\sin x$ for $x > 0$. Any antiderivative has this as its slope.` }),
        };
      },
    }),
    expr({
      id: 'ivp-poly', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = r.int(1, 4), c = r.int(-3, 5), C = c - a + 2 * b;
        return {
          prompt: t`Find $f(x)$ if $f'(x) = ${3 * a}x^2 - ${2 * b}$ and $f(1) = ${c}$.`,
          lhs: 'f(x)',
          answer: `${a}x^3 - ${2 * b}x + ${C}`, answerTeX: t`${a === 1 ? '' : a}x^3 - ${2 * b}x${C === 0 ? '' : ` ${C < 0 ? '-' : '+'} ${Math.abs(C)}`}`,
          vars: { x: [-2, 2] }, integrand: `${3 * a}x^2 - ${2 * b}`,
          errors: [...(C !== 0 ? [{ answer: `${a}x^3 - ${2 * b}x`, feedback: t`That has $C = 0$, but then $f(1) = ${a - 2 * b}$, not $${c}$. Use the condition to find $C$.` }] : []), ...(C !== c ? [{ answer: `${a}x^3 - ${2 * b}x + ${c}`, feedback: t`$C$ is not $f(1)$; it is what makes $f(1) = ${c}$: solve $${a} - ${2 * b} + C = ${c}$.` }] : [])],
          hints: [t`Antidifferentiate: $f(x) = ${a === 1 ? '' : a}x^3 - ${2 * b}x + C$.`, t`Set $x = 1$: $${a} - ${2 * b} + C = ${c}$.`],
          teach: 'An initial-value problem: antidifferentiate, then use the given value to solve for C.',
          explain: t`$f(x) = ${a === 1 ? '' : a}x^3 - ${2 * b}x + C$ and $f(1) = ${a - 2 * b} + C = ${c}$, so $C = ${C}$.`,
          visual: family(`${a}*x^3 - ${2 * b}*x`, [-2.2, 2.2], fitY((x) => a * x ** 3 - 2 * b * x, -1.8, 1.8).map((v, i) => v + (i ? 5 : -5)), [-4, -2, 0, 2, 4], undefined, t`Some antiderivatives of $${3 * a}x^2 - ${2 * b}$ (dashed) and the point $(1, ${c})$ your $f$ must pass through.`, { points: [{ x: 1, y: c, color: 'gold', label: `(1, ${c})` }] }),
        };
      },
    }),
    mcq({
      id: 'one-over-x2', difficulty: 1,
      prompt: t`Which is an antiderivative of $\dfrac{1}{x^2}$ for $x > 0$?`,
      visual: curveFig({ fn: '1/x^2', x: [0, 4], y: [-0.3, 4.5], domain: [0.45, 4], caption: t`$y = 1/x^2$: positive everywhere, so its antiderivatives are increasing.` }),
      choices: [t`$-\dfrac{1}{x}$`, t`$\ln(x^2)$`, t`$-\dfrac{2}{x^3}$`, t`$\dfrac{1}{x}$`],
      answer: 0,
      why: {
        1: t`Only $x^{-1}$ integrates to a logarithm; $\frac{d}{dx}\ln(x^2) = \frac{2}{x}$, not $\frac1{x^2}$.`,
        2: t`That is the **derivative** of $x^{-2}$, not an antiderivative.`,
        3: t`$\frac{d}{dx}\frac1x = -\frac{1}{x^2}$: the sign is wrong. The antiderivatives must increase, since $1/x^2 > 0$.`,
      },
      hints: [t`Write $\frac{1}{x^2} = x^{-2}$ and use the power rule backwards.`],
      teach: t`$\int x^{-2}\,dx = \dfrac{x^{-1}}{-1} = -\dfrac1x$ — check the sign by differentiating.`,
      explain: t`$\dfrac{d}{dx}\left(-x^{-1}\right) = x^{-2} = \dfrac{1}{x^2}$ ✓. So $\int x^{-2}dx = -\dfrac1x + C$.`,
    }),
    num({
      id: 'braking', difficulty: 2,
      gen(r) {
        const v0 = r.pick([20, 25, 30]), d = r.pick([5, 6, 8]), T = v0 / d, D = v0 * v0 / (2 * d);
        return {
          prompt: t`A car at $${v0}$ m/s brakes with a constant deceleration of $${d}\ \text{m/s}^2$. Using $v(t) = \int a\,dt$ and $x(t) = \int v\,dt$, find its stopping distance.`,
          answer: D, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: v0 * v0 / d, feedback: t`$\int (v_0 - dt)\,dt = v_0t - \tfrac12 dt^2$: keep the $\tfrac12$.` }, { value: T, feedback: 'That is the stopping time in seconds. Now use it in x(t).' }],
          hints: [t`$v(t) = ${v0} - ${d}t$, which is $0$ at $t = ${nice(T, 4)}$ s.`, t`$x(t) = ${v0}t - ${d / 2}t^2$ (taking $x(0) = 0$). Evaluate at the stopping time.`],
          teach: 'Integrate acceleration to get velocity, find when it reaches zero, then integrate velocity to get the distance.',
          explain: t`$v = ${v0} - ${d}t$ stops at $t = ${nice(T, 4)}$ s; $x = ${v0}(${nice(T, 4)}) - ${d / 2}(${nice(T, 4)})^2 = ${nice(D, 4)}$ m — the same as $v_0^2/2d$.`,
          visual: { type: 'mech-graphlink', params: { a: -d, v0, T, panels: ['v', 'a'], readouts: ['t', 'v', 'a'], play: false }, caption: 'Braking with constant deceleration: v falls in a straight line to zero. Real braking is not quite constant.' },
        };
      },
    }),
    expr({
      id: 'v-from-a', difficulty: 2,
      gen(r) {
        const A = r.pick([6, 12, 18]), k = r.pick([2, 3]), v0 = r.int(1, 5);
        const q = A / k;
        return {
          prompt: t`A vibration table moves with acceleration $a(t) = ${A}\cos(${k}t)\ \text{m/s}^2$, and $v(0) = ${v0}$ m/s. Find $v(t)$.`,
          lhs: 'v(t)',
          answer: `${q}sin(${k}t) + ${v0}`, answerTeX: t`${nice(q)}\sin(${k}t) + ${v0}`,
          vars: { t: [0, 4] }, integrand: `${A}cos(${k}t)`,
          errors: [{ answer: `${A * k}sin(${k}t) + ${v0}`, feedback: t`An antiderivative of $\cos(${k}t)$ is $\tfrac1{${k}}\sin(${k}t)$: divide by $${k}$, do not multiply.` }, { answer: `${q}sin(${k}t)`, feedback: t`At $t = 0$ that gives $v = 0$, not $${v0}$: add the constant.` }],
          hints: [t`$\int\cos(${k}t)\,dt = \tfrac1{${k}}\sin(${k}t) + C$ (check by differentiating).`, t`$v(0) = ${nice(q)}\sin 0 + C = C$, so $C = ${v0}$.`],
          teach: t`$\int\cos(kt)\,dt = \tfrac1k\sin(kt) + C$; the initial velocity fixes $C$.`,
          explain: t`$v(t) = \dfrac{${A}}{${k}}\sin(${k}t) + C$, and $v(0) = C = ${v0}$: $v(t) = ${nice(q)}\sin(${k}t) + ${v0}$ m/s.`,
          visual: curveFig({ fn: `${A}*cos(${k}*x)`, x: [0, 4], y: [-1.15 * A, 1.15 * A], xlabel: 't (s)', ylabel: 'a (m/s²)', caption: t`The acceleration $a(t) = ${A}\cos(${k}t)$: the slope of the $v(t)$ you are looking for.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-product', difficulty: 2, kind: 'error',
      prompt: t`A student writes $\displaystyle\int x(x + 1)\,dx = \frac{x^2}{2}\left(\frac{x^2}{2} + x\right) + C$. What is wrong?`,
      visual: curveFig({ fn: 'x^2 + x', x: [-1.6, 1.6], y: [-1, 5], label: 'x² + x', labelAt: 1.1, labelDx: -50, curves: [{ fn: 'x^3 + 1.5*x^2', color: 'violet', dash: true, width: 1.8, label: 'derivative of the student’s answer', labelAt: 1.25, labelDx: 6 }], caption: 'The integrand (blue) and the derivative of the student’s answer (violet). They should be the same curve.' }),
      choices: [
        'An antiderivative of a product is not the product of antiderivatives: expand first, giving x³/3 + x²/2 + C',
        t`The constant should be $C^2$`,
        t`They should have used $\ln x$ for the factor $x$`,
        'Nothing; it differentiates back to x(x + 1)',
      ],
      answer: 0,
      why: {
        1: 'A product of two arbitrary constants is just another arbitrary constant; that is not the issue.',
        2: t`Only $x^{-1}$ integrates to $\ln x$; $\int x\,dx = \tfrac12x^2$.`,
        3: t`Differentiate it: the product rule gives $x^3 + \tfrac32x^2$, not $x^2 + x$ — the violet curve.`,
      },
      hints: ['Differentiate the student’s answer with the product rule. Do you get x(x + 1)?', 'There is no product rule for antiderivatives you can apply blindly; multiply out first.'],
      teach: 'There is no simple product rule for integrals: expand products of polynomials first, then integrate term by term.',
      explain: t`$x(x + 1) = x^2 + x$, so $\int(x^2 + x)\,dx = \tfrac13x^3 + \tfrac12x^2 + C$. The student’s answer differentiates to $x^3 + \tfrac32x^2$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-exp-mix', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]), c = r.pick([3, 4, 5]);
        return {
          prompt: t`Find $\displaystyle\int\left(e^{${k}x} + \frac{${c}}{\sqrt{x}}\right)dx$ for $x > 0$.`,
          answer: `e^(${k}x)/${k} + ${2 * c}sqrt(x)`, answerTeX: t`\frac{e^{${k}x}}{${k}} + ${2 * c}\sqrt{x}`,
          vars: { x: [0.3, 2] }, mode: 'constant', integrand: `e^(${k}x) + ${c}/sqrt(x)`,
          errors: [{ answer: `${k}e^(${k}x) + ${2 * c}sqrt(x)`, feedback: t`Differentiating $e^{${k}x}$ multiplies by $${k}$; integrating divides by it.` }, { answer: `e^(${k}x)/${k} + ${c / 2}sqrt(x)`, feedback: t`$\int x^{-1/2}dx = \dfrac{x^{1/2}}{1/2} = 2\sqrt x$.` }],
          hints: [t`$\int e^{kx}dx = \tfrac1k e^{kx}$; $\dfrac{${c}}{\sqrt x} = ${c}x^{-1/2}$.`],
          teach: t`Integrate term by term; $\int e^{kx}dx = \tfrac1ke^{kx} + C$ and $\int x^{-1/2}dx = 2x^{1/2} + C$.`,
          explain: t`$\dfrac{e^{${k}x}}{${k}} + ${c}\cdot 2x^{1/2} + C = \dfrac{e^{${k}x}}{${k}} + ${2 * c}\sqrt x + C$.`,
          visual: curveFig({ fn: `e^(${k}*x) + ${c}/sqrt(x)`, x: [0, 1.6], y: [0, fitY((x) => Math.exp(k * x) + c / Math.sqrt(x), 0.2, 1.5)[1]], domain: [0.08, 1.6], caption: t`The integrand for $x > 0$: it blows up at $0$ (the $1/\sqrt x$) and grows fast (the exponential).` }),
        };
      },
    }),
    num({
      id: 'cp-sled', difficulty: 3, transfer: true,
      gen(r) {
        const v0 = r.pick([200, 240, 300]), j = r.pick([24, 30, 48]), ts = Math.sqrt(2 * v0 / j), D = v0 * ts - j * ts ** 3 / 6;
        return {
          prompt: t`A rocket sled enters a water brake at $${v0}$ m/s. As it ploughs deeper the braking grows: its acceleration is $a(t) = -${j}t\ \text{m/s}^2$. How far does it travel before stopping?`,
          answer: D, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: v0 * ts, feedback: t`That is $v_0 t_s$, as if no braking acted. Integrate $v(t)$ instead.` }, { value: ts, feedback: 'That is the stopping time in seconds. Now find the distance.' }],
          hints: [t`$v(t) = ${v0} - ${j / 2}t^2$; it stops when $t_s^2 = \dfrac{${v0}}{${j / 2}}$.`, t`$x(t) = ${v0}t - \dfrac{${j}}{6}t^3$. Evaluate at $t_s = ${nice(ts, 4)}$ s.`],
          teach: 'Integrate twice, using the initial speed for the first constant and the starting position for the second.',
          explain: t`$v = ${v0} - ${j / 2}t^2 = 0$ at $t_s = ${nice(ts, 4)}$ s; $x(t_s) = ${v0}(${nice(ts, 4)}) - ${j / 6}(${nice(ts, 4)})^3 = ${nice(D, 4)}$ m — exactly $\tfrac23 v_0 t_s$.`,
          visual: { type: 'mech-graphlink', params: { a: `-${j}*t`, v0, T: ts, panels: ['v', 'a'], readouts: ['t', 'v', 'a'], play: false }, caption: 'The modelled water-brake run: deceleration growing linearly in time. A real brake’s force depends on speed and depth.' },
        };
      },
    }),
    expr({
      id: 'cp-ivp2', difficulty: 3,
      gen(r) {
        const p = r.intExcept(-3, 4, [0]), q = r.intExcept(-3, 4, [0]);
        return {
          prompt: t`Find $f(x)$ if $f''(x) = 6x$, $f'(0) = ${p}$ and $f(0) = ${q}$.`,
          lhs: 'f(x)',
          answer: `x^3 + ${p}x + ${q}`, answerTeX: t`x^3 ${p < 0 ? '-' : '+'} ${Math.abs(p)}x ${q < 0 ? '-' : '+'} ${Math.abs(q)}`,
          vars: { x: [-2, 2] }, integrand: `3x^2 + ${p}`,
          errors: [{ answer: `x^3 + ${q}`, feedback: t`Integrating $f''$ gives $f' = 3x^2 + C_1$ with $C_1 = ${p}$; integrating again, $C_1$ becomes $${p}x$.` }, { answer: `x^3 + ${p + q}`, feedback: t`The first constant becomes $${p}x$ after the second integration, not a constant.` }],
          hints: [t`$f'(x) = 3x^2 + C_1$, and $f'(0) = ${p}$ gives $C_1$.`, t`$f(x) = x^3 + ${p}x + C_2$, and $f(0) = ${q}$ gives $C_2$.`],
          teach: 'A second derivative needs two integrations and two conditions — like acceleration needing an initial velocity and an initial position.',
          explain: t`$f' = 3x^2 + ${p}$, then $f = x^3 + ${p}x + ${q}$.`,
          visual: family('x^3', [-2.2, 2.2], [-8, 8], [-4, 0, 4], undefined, t`Dashed: a few functions with $f'' = 6x$, all with slope $0$ at $x = 0$. Yours must pass through the gold point with the gold slope: two conditions for two constants.`, { points: [{ x: 0, y: q, color: 'gold', label: `(0, ${q})` }], curves: [{ fn: `${q} + ${p}*x`, color: 'gold', width: 1.6, domain: [-0.7, 0.7] }] }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.10 Antiderivatives', url: 'https://openstax.org/books/calculus-volume-1/pages/4-10-antiderivatives' }],
});
