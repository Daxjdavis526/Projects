// The derivative as a function — slopes collected into a new function,
// read off a graph, computed from the definition, and the points where it
// fails to exist.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;

const F = '0.2*x^3 - 1.2*x^2 + 1.5*x + 1';
const DF = '0.6*x^2 - 2.4*x + 1.5';

export default lesson({
  id: 'math1210.C1-3.2',
  title: 'The derivative as a function',
  minutes: 10, difficulty: 2,
  intro: t`Compute the tangent slope at every $x$ and you get a new function, the **derivative**:

$$f'(x) = \lim_{h\to 0}\frac{f(x + h) - f(x)}{h}$$

Where $f$ rises, $f' > 0$; where it falls, $f' < 0$; at a smooth peak or trough, $f' = 0$. A function is **differentiable** at $x$ when this limit exists. Every differentiable function is continuous, but not conversely: a **corner** ($|x|$), a **cusp** ($x^{2/3}$) or a **vertical tangent** ($\sqrt[3]{x}$) is continuous with no derivative. Differentiating again gives $f''$, and in mechanics the chain runs position $x(t)$, velocity $v = \dot x = dx/dt$, acceleration $a = \ddot x = d^2x/dt^2$, and **jerk** $da/dt$.`,
  symbols: [
    { tex: "f'(x)", text: 'the derivative function: the slope of $f$ at each $x$. Also written $\\dfrac{df}{dx}$, $\\dfrac{d}{dx}f$, or $\\dot f$ when the variable is time' },
    { tex: 'h', text: 'the step in the difference quotient, which tends to $0$' },
    { tex: "f''(x)", text: 'the second derivative, the derivative of $f\'$: $\\dfrac{d^2f}{dx^2}$' },
    { tex: '\\dot x,\\ \\ddot x', text: 'Newton’s dot notation: one dot per time derivative — velocity and acceleration' },
  ],
  why: t`Newton’s second law, $F = m\ddot x$, is a statement about the second derivative of position: you cannot read it without the derivative as a function.`,
  visual: {
    type: 'graph',
    title: 'Tracing the derivative',
    lead: t`Drag the gold point along $f$. The violet dot plots the tangent’s slope at the same $x$ — so as you drag, it traces out $f'$. Reveal the dashed curve to check the trace.`,
    tasks: [
      t`Park the gold point on the peak near $x = 0.78$ and the trough near $x = 3.2$: the slope is $0$ and the violet dot sits on the axis.`,
      t`Between the two turning points $f$ falls, so the violet dot is below the axis. Where is $f$ falling fastest? (At $x = 2$, where $f'$ is lowest.)`,
      'Show the derivative curve: it is exactly the path the violet dot traces.',
    ],
    params: {
      x: [-0.6, 5.2], y: [-1.6, 4.8], aspect: 'wide',
      choices: [{ key: 'show', label: t`Curve of $f'$`, options: [[0, 'hidden'], [1, 'shown']], value: 0, explain: t`Draw the derivative $f'(x)$ as a dashed curve.` }],
      curves: [
        { fn: F, color: 'accent', label: 'f', labelAt: 4.75, labelDx: 8 },
        { fn: DF, color: 'violet', dash: true, width: 1.6, when: 'show', label: "f′", labelAt: 4.3, labelDx: 8 },
      ],
      tangent: { fn: F, at: 1.6 },
      points: [{ x: 'x0', y: 'slope', color: 'violet', r: 5 }],
      hlines: [{ y: 0, color: 'ink4' }],
      readouts: [{ label: '$x$', expr: 'x0', digits: 3 }, { label: t`$f(x)$`, expr: 'y0', digits: 3 }, { label: t`slope $f'(x)$`, expr: 'slope', digits: 3 }],
    },
    caption: t`$f(x) = 0.2x^3 - 1.2x^2 + 1.5x + 1$ and its derivative $0.6x^2 - 2.4x + 1.5$. The violet dot uses the same vertical scale as $f$, but its numbers are slopes, not heights.`,
  },
  example: {
    prompt: t`Find $f'(x)$ for $f(x) = \sqrt{x}$ from the definition. Where is $f$ differentiable?`,
    visual: { type: 'graph', params: { x: [-0.3, 4.5], y: [-0.3, 2.6], aspect: 'wide', curves: [{ fn: 'sqrt(x)', color: 'accent', domain: [0, 4.5], label: 'y = √x', labelAt: 3.6, labelDy: -14 }, { fn: '1/(2*sqrt(x))', color: 'violet', dash: true, domain: [0.04, 4.5], label: "y = f′(x)", labelAt: 0.6, labelDx: 10 }] }, caption: t`$\sqrt{x}$ and its derivative. At $x = 0$ the tangent is vertical and $f'$ blows up.` },
    steps: [
      { label: 'Set up', text: t`$\dfrac{\sqrt{x + h} - \sqrt{x}}{h}$, which is $0/0$ at $h = 0$.` },
      { label: 'Rationalize', text: t`Multiply by $\dfrac{\sqrt{x+h} + \sqrt{x}}{\sqrt{x+h} + \sqrt{x}}$: the top becomes $(x + h) - x = h$, which cancels, leaving $\dfrac{1}{\sqrt{x + h} + \sqrt{x}}$.` },
      { label: 'Take the limit', text: t`For $x > 0$: $h \to 0$ gives $f'(x) = \dfrac{1}{2\sqrt{x}}$.` },
      { label: 'At zero', text: t`At $x = 0$ the quotient is $\dfrac{\sqrt h}{h} = \dfrac{1}{\sqrt h} \to +\infty$: a vertical tangent. $\sqrt{x}$ is continuous at $0$ but not differentiable there.` },
      { label: 'Sense check', text: t`$f'(4) = \tfrac14$: near $x = 4$, raising $x$ by $0.4$ raises $\sqrt{x}$ by about $0.1$ — and indeed $\sqrt{4.4} = 2.098$.` },
    ],
    answer: t`$\dfrac{d}{dx}\sqrt{x} = \dfrac{1}{2\sqrt{x}}$ for $x > 0$; there is no derivative at $x = 0$ (vertical tangent).`,
  },
  practice: [
    {
      type: 'point', id: 'steepest-fall', difficulty: 2,
      prompt: t`The graph shows $f(x) = x^3 - 6x^2 + 9x + 1$. Drag the marker along the axis to the $x$ where $f$ is **decreasing fastest**.`,
      visual: { type: 'graph', params: { x: [-0.3, 4.4], y: [-2.5, 6.5], aspect: 'wide', curves: [{ fn: 'x^3 - 6*x^2 + 9*x + 1', color: 'accent' }], hlines: [{ y: 0, color: 'ink4' }], drag: [{ key: 'p', x: 0.4, y: 0, lockY: true, snap: 0.05 }] }, caption: 'The marker slides along the x-axis only.' },
      answer: { x: 2, y: 0 }, tol: { x: 0.15, y: 0.5 },
      instruction: 'Drag the marker to where the curve falls most steeply, then check.',
      hints: [t`“Decreasing fastest” means $f'$ is most negative: the steepest downhill stretch.`, t`$f$ falls between its peak at $x = 1$ and its trough at $x = 3$; by symmetry the steepest point is halfway.`],
      teach: t`The steepest descent of $f$ is where $f'$ reaches its minimum — for a cubic, the inflection point midway between the turning points.`,
      explain: t`$f'(x) = 3x^2 - 12x + 9$, a parabola with its minimum at $x = 2$, where $f'(2) = -3$. That is where $f$ falls fastest.`,
    },
    expr({
      id: 'def-quadratic-fn', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-4, 4, [0]), b = r.intExcept(-7, 7, [0]), c = r.intExcept(-5, 5, [0]);
        const fT = `${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
        const ys = [-3, 3, -b / (2 * a)].map((x) => a * x * x + b * x + c);
        return {
          prompt: t`Use the definition of the derivative to find $f'(x)$ for $f(x) = ${fT}$.`,
          lhs: "f'(x)",
          answer: `${2 * a}x + (${b})`, answerTeX: t`${2 * a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`,
          vars: { x: [-3, 3] }, derivativeOf: `${a}x^2 + (${b})x + (${c})`,
          errors: [{ answer: `${2 * a}x + (${b}) + (${c})`, feedback: t`The constant $${c}$ cancels in $f(x + h) - f(x)$: shifting a graph up does not change its slopes.` }, { answer: `${a}x + (${b})`, feedback: t`$(x+h)^2 - x^2 = 2xh + h^2$: the factor $2$ comes from the cross term.` }],
          hints: [t`$f(x+h) - f(x) = ${a}(2xh + h^2) ${b < 0 ? '-' : '+'} ${Math.abs(b)}h$.`, 'Divide by h and let h → 0.'],
          teach: t`The definition, applied at a general $x$, produces the whole derivative function at once.`,
          explain: t`$\dfrac{f(x+h) - f(x)}{h} = ${2 * a}x + ${a}h ${b < 0 ? '-' : '+'} ${Math.abs(b)} \to ${2 * a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$.`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [Math.min(...ys) - 2, Math.max(...ys) + 2], aspect: 'wide', curves: [{ fn: `${a}*x^2 + (${b})*x + (${c})`, color: 'accent' }] }, caption: t`$y = f(x)$. Its slope changes linearly with $x$ — so expect $f'$ to be a line.` },
        };
      },
    }),
    expr({
      id: 'def-sqrt-shift', difficulty: 3,
      gen(r) {
        const k = r.int(1, 6);
        return {
          prompt: t`Use the definition of the derivative to find $f'(x)$ for $f(x) = \sqrt{x + ${k}}$.`,
          lhs: "f'(x)",
          answer: `1/(2 sqrt(x + ${k}))`, answerTeX: t`\frac{1}{2\sqrt{x + ${k}}}`,
          vars: { x: [0.5, 4] }, derivativeOf: `sqrt(x + ${k})`,
          errors: [{ answer: `1/sqrt(x + ${k})`, feedback: t`After rationalizing, the denominator is $\sqrt{x + h + ${k}} + \sqrt{x + ${k}}$, which tends to *twice* $\sqrt{x + ${k}}$.` }, { answer: `sqrt(x + ${k})/2`, feedback: t`The root belongs in the denominator: the slope of a square root *decreases* as $x$ grows.` }],
          hints: [t`Multiply the difference quotient by $\dfrac{\sqrt{x + h + ${k}} + \sqrt{x + ${k}}}{\sqrt{x + h + ${k}} + \sqrt{x + ${k}}}$.`, t`The numerator becomes $h$; cancel it and let $h \to 0$.`],
          teach: 'For a square root, rationalize the difference quotient, cancel h, then take the limit.',
          explain: t`$\dfrac{1}{\sqrt{x + h + ${k}} + \sqrt{x + ${k}}} \to \dfrac{1}{2\sqrt{x + ${k}}}$, valid for $x > -${k}$.`,
          visual: { type: 'graph', params: { x: [-k - 0.5, 6], y: [-0.3, Math.sqrt(6 + k) + 0.5], aspect: 'wide', curves: [{ fn: `sqrt(x + ${k})`, color: 'accent', domain: [-k, 6] }] }, caption: t`$y = \sqrt{x + ${k}}$: the square-root curve shifted left by $${k}$.` },
        };
      },
    }),
    multi({
      id: 'not-diff', difficulty: 3,
      prompt: t`Which functions are **not** differentiable at $x = 0$? Select all that apply.`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.4, 1.6], aspect: 'wide', curves: [
        { fn: 'abs(x)', color: 'accent', label: '|x|', labelAt: 1.25, labelDx: 6 },
        { fn: 'cbrt(x)', color: 'gold', label: '∛x', labelAt: -1.3, labelDy: 16 },
        { fn: 'x*abs(x)', color: 'good', label: 'x|x|', labelAt: -0.95, labelDx: 10 },
        { fn: 'cbrt(x)^2', color: 'violet', label: 'x²ᐟ³', labelAt: -1.5, labelDx: 4, labelDy: -14 },
      ] }, caption: t`Four of the functions near $x = 0$, drawn on one set of axes ($\sin x$ is not shown).` },
      choices: [t`$|x|$`, t`$\sqrt[3]{x}$`, t`$x|x|$`, t`$x^{2/3}$`, t`$\sin x$`],
      answer: [0, 1, 3],
      why: { 2: t`$\frac{h|h|}{h} = |h| \to 0$, so $x|x|$ is differentiable at $0$ with slope $0$ — it is smooth, just flat there.`, 4: t`$\sin x$ is smooth everywhere; its slope at $0$ is $1$.` },
      hints: [t`For each, compute the difference quotient at $0$, $\frac{f(h) - f(0)}{h}$, from both sides.`, t`Look for a corner (different one-sided slopes), a cusp, or a vertical tangent (infinite slope).`],
      teach: 'A continuous function fails to be differentiable at a corner, a cusp or a vertical tangent.',
      explain: t`$|x|$: one-sided slopes $\pm1$ — a corner. $\sqrt[3]{x}$: $h^{1/3}/h = h^{-2/3} \to \infty$ — a vertical tangent. $x^{2/3}$: $h^{-1/3} \to \pm\infty$ with opposite signs — a cusp. $x|x|$ and $\sin x$ are differentiable.`,
    }),
    mcq({
      id: 'cont-vs-diff', difficulty: 2,
      prompt: 'Which statement is true?',
      visual: { type: 'graph', params: { x: [-1, 3], y: [-0.4, 2.6], aspect: 'wide', curves: [{ fn: 'abs(x - 1) + 0.5', color: 'accent' }], points: [{ x: 1, y: 0.5, color: 'gold', label: 'corner' }] }, caption: t`$y = |x - 1| + 0.5$: unbroken, but with a corner at $x = 1$.` },
      choices: ['Every differentiable function is continuous, but not every continuous function is differentiable', 'Every continuous function is differentiable', 'Continuous and differentiable mean the same thing', 'A function with a corner is not continuous there'],
      answer: 0,
      why: { 1: t`$|x - 1|$ is continuous at $1$, but its one-sided slopes are $-1$ and $+1$, so it has no derivative there.`, 2: 'The corner in the picture is continuous but not differentiable: the two ideas differ.', 3: 'The graph has no break at the corner; it is continuous. Only the slope jumps.' },
      hints: [t`Test the claims on $|x - 1|$ at $x = 1$.`],
      teach: 'Differentiable implies continuous; continuous does not imply differentiable.',
      explain: t`If $f'(a)$ exists then $f(a + h) - f(a) = h\cdot\frac{f(a+h) - f(a)}{h} \to 0\cdot f'(a) = 0$, so $f$ is continuous at $a$. The corner shows the converse fails.`,
    }),
    num({
      id: 'slope-from-vt', difficulty: 2,
      gen(r) {
        const a2 = r.pick([-1.5, -2, -1, 1.5, 0.5]);
        const v1 = 6, v2 = v1 + 4 * a2;
        return {
          prompt: t`The graph shows a drone’s velocity along a straight line. What is its acceleration between $t = 3$ s and $t = 7$ s?`,
          answer: a2, units: 'm/s^2', tol: { rel: 1e-6, abs: 0.01 },
          errors: [{ value: v2 / 7, feedback: t`That divides a velocity by a clock time. Acceleration is the *slope* of the velocity graph: change in $v$ over change in $t$.` }],
          hints: ['Acceleration is the slope of the v–t graph.', t`Use the two marked points: $\dfrac{${nice(v2)} - ${v1}}{7 - 3}$.`],
          teach: t`The derivative of velocity is acceleration: read it as the slope of the $v$–$t$ graph.`,
          explain: t`$a = \dfrac{\Delta v}{\Delta t} = \dfrac{${nice(v2)} - ${v1}}{4} = ${nice(a2)}\ \text{m/s}^2$${a2 < 0 ? ' — the drone is slowing down while still moving forward' : ''}.`,
          visual: { type: 'graph', params: { x: [-0.3, 10.5], y: [-0.8, 10], aspect: 'wide', xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `step(3 - x)*2*x + step(x - 3)*step(7 - x)*(6 + (${a2})*(x - 3)) + step(x - 7)*${v2}`, color: 'accent', domain: [0, 10] }], points: [{ x: 3, y: v1, color: 'gold', label: `(3, ${v1})` }, { x: 7, y: v2, color: 'gold', label: `(7, ${nice(v2)})` }] }, caption: 'Velocity against time, made of straight segments; real changes of acceleration take a moment, so real corners are slightly rounded.' },
        };
      },
    }),
    mcq({
      id: 'notation', difficulty: 1,
      prompt: t`A body’s position is $x(t)$ and its velocity is $v(t)$. Which expression is **not** its acceleration?`,
      choices: [t`$\left(\dfrac{dx}{dt}\right)^2$`, t`$\ddot x$`, t`$\dfrac{d^2x}{dt^2}$`, t`$v'(t)$`],
      answer: 0,
      why: { 1: t`Two dots mean two time derivatives: $\ddot x$ is the acceleration.`, 2: t`$\frac{d^2x}{dt^2}$ is the derivative of $\frac{dx}{dt}$ — the acceleration.`, 3: t`The derivative of velocity is the acceleration.` },
      hints: ['Acceleration is the derivative of the derivative of position.'],
      teach: t`$\ddot x$, $\frac{d^2x}{dt^2}$ and $v'$ all name the second derivative; squaring the first derivative is something else.`,
      explain: t`$\left(\frac{dx}{dt}\right)^2 = v^2$, the speed squared (in $\text{m}^2/\text{s}^2$). The other three are the second derivative of position, in $\text{m/s}^2$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-def-recip', difficulty: 3,
      gen(r) {
        const k = r.int(1, 5);
        return {
          prompt: t`Use the definition of the derivative to find $f'(x)$ for $f(x) = \dfrac{1}{x + ${k}}$.`,
          lhs: "f'(x)",
          answer: `-1/(x + ${k})^2`, answerTeX: t`-\frac{1}{(x + ${k})^2}`,
          vars: { x: [0, 3] }, derivativeOf: `1/(x + ${k})`,
          errors: [{ answer: `1/(x + ${k})^2`, feedback: t`Watch the sign: $\frac{1}{x+h+${k}} - \frac{1}{x+${k}} = \frac{-h}{(x+h+${k})(x+${k})}$.` }],
          hints: [t`Combine $\dfrac{1}{x + h + ${k}} - \dfrac{1}{x + ${k}}$ over a common denominator.`, 'The numerator is −h; cancel h and let h → 0.'],
          teach: 'Combine fractions, cancel h, take the limit.',
          explain: t`$\dfrac{1}{h}\cdot\dfrac{-h}{(x + h + ${k})(x + ${k})} \to -\dfrac{1}{(x + ${k})^2}$.`,
          visual: { type: 'graph', params: { x: [-k + 0.2, 5], y: [0, 3], aspect: 'wide', curves: [{ fn: `1/(x + ${k})`, color: 'accent', domain: [-k + 0.35, 5] }] }, caption: t`$y = 1/(x + ${k})$: always falling, so expect $f' < 0$.` },
        };
      },
    }),
    mcq({
      id: 'cp-staging', difficulty: 3, transfer: true,
      prompt: t`A two-stage rocket climbs vertically. The first stage cuts off at $t = 4$ s; the rocket coasts for $2$ s, then the second stage ignites. At the instant of first-stage cutoff, which is true?`,
      visual: { type: 'mech-graphlink', params: { segments: [{ a: 25, dt: 4 }, { a: -9.8, dt: 2 }, { a: 15, dt: 4 }], panels: ['v', 'a'], track: false, marks: [{ t: 4, label: 'cutoff' }, { t: 6, label: 'ignition' }], readouts: ['t', 'v', 'a'], time: 4 }, caption: t`Idealized staging: thrust switches off and on instantly, and drag is ignored. Real engines tail off over a fraction of a second, rounding the corners.` },
      choices: [t`$v$ is continuous but has a corner, so $v$ has no derivative there and $a$ jumps`, t`$v$ jumps, because the thrust stops suddenly`, t`$v$ is differentiable there, because it is continuous`, t`$a$ is continuous, because $v$ is`],
      answer: 0,
      why: { 1: 'Velocity cannot jump: that would take an infinite force. Only its slope changes suddenly.', 2: t`Continuity does not give differentiability: the one-sided slopes of $v$ are $25$ and $-9.8\ \text{m/s}^2$.`, 3: t`$a$ jumps from $25$ to $-9.8\ \text{m/s}^2$ — the corner in $v$ is that jump.` },
      hints: [t`What are the slopes of $v(t)$ just before and just after $t = 4$ s?`, t`A corner means the left and right derivatives differ.`],
      teach: 'A sudden change in force puts a corner in v(t): v stays continuous, but its derivative a(t) jumps.',
      explain: t`Left of $t = 4$ s the slope of $v$ is $25\ \text{m/s}^2$; right of it, $-9.8\ \text{m/s}^2$ (free fall while coasting upward). So $v$ is continuous with a corner, $v'(4)$ does not exist, and $a(t)$ has a jump discontinuity.`,
    }),
    {
      type: 'point', id: 'cp-flat', difficulty: 2,
      prompt: t`The graph shows $f(x) = 4x\,e^{-x/1.5}$. Drag the marker along the axis to the $x$ where $f'(x) = 0$.`,
      visual: { type: 'graph', params: { x: [-0.3, 7], y: [-0.6, 2.8], aspect: 'wide', curves: [{ fn: '4*x*e^(-x/1.5)', color: 'accent' }], hlines: [{ y: 0, color: 'ink4' }], drag: [{ key: 'p', x: 5, y: 0, lockY: true, snap: 0.05 }] }, caption: 'The marker slides along the x-axis only.' },
      answer: { x: 1.5, y: 0 }, tol: { x: 0.15, y: 0.5 },
      instruction: 'Drag the marker to where the tangent would be horizontal, then check.',
      hints: [t`$f' = 0$ where the tangent is flat: at the top of the hump.`, t`The peak of $x e^{-x/\tau}$ is at $x = \tau$.`],
      teach: 'A horizontal tangent — f′ = 0 — marks a smooth peak or trough.',
      explain: t`The curve peaks at $x = 1.5$, where the tangent is horizontal. (Later: $f'(x) = 4e^{-x/1.5}(1 - x/1.5)$, zero at $x = 1.5$.)`,
    },
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §3.2 The derivative as a function', url: 'https://openstax.org/books/calculus-volume-1/pages/3-2-the-derivative-as-a-function' },
  ],
});
