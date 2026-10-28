// Tangent lines and instantaneous rates — the derivative at a point as the
// limit of secant slopes, the tangent line it defines, and its units.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;

const ROCKET = '0.25*x^3 + 4*x^2';
const rocket = (x) => 0.25 * x ** 3 + 4 * x * x;

export default lesson({
  id: 'math1210.C1-3.1',
  title: 'Tangent lines and instantaneous rates',
  minutes: 9, difficulty: 2,
  intro: t`The **derivative** of $f$ at $a$ is the limit of the secant slopes as the second point slides into the first:

$$f'(a) = \lim_{h\to 0}\frac{f(a + h) - f(a)}{h}$$

When the limit exists it is the slope of the **tangent line** $y = f(a) + f'(a)(x - a)$ — the straight line the curve looks like when you zoom in on $a$. Physically it is an **instantaneous rate**: the velocity read off an altitude record at one instant, in metres per second. Its units are always the units of $f$ divided by the units of $x$.`,
  symbols: [
    { tex: "f'(a)", text: 'the derivative of $f$ at $a$: the instantaneous rate of change, in (units of $f$)/(units of $x$)' },
    { tex: 'a', text: 'the point where the rate is measured' },
    { tex: 'h', text: 'the step to the second point; it shrinks to zero but never equals it' },
    { tex: '\\frac{f(a+h) - f(a)}{h}', text: 'the difference quotient — the slope of a secant (lesson C1-1.1)' },
    { tex: "y = f(a) + f'(a)(x - a)", text: 'the **tangent line**: through $(a, f(a))$ with slope $f\'(a)$' },
  ],
  why: t`Velocity, current, power and every other “rate at an instant” in physics is a derivative; the tangent line is the first approximation behind small-angle physics and error propagation.`,
  visual: {
    type: 'graph',
    title: 'Secants closing in on the tangent',
    lead: t`The curve is a rocket’s altitude, $h(t) = 0.25t^3 + 4t^2$. Drag the gold point to choose the instant $t_1$; the slider sets the step $\Delta t$ to the second (violet) point. Watch the violet secant swing onto the gold tangent as $\Delta t \to 0$.`,
    tasks: [
      t`At $t_1 = 4$ s, shrink $\Delta t$ from $2$ to $0.05$ s: the secant slope falls from $59$ toward $44$ m/s, the tangent slope.`,
      t`Make $\Delta t$ negative: the secants approach the same slope from the other side. The two-sided limit exists.`,
      t`Move $t_1$ later: the tangent steepens because the rocket is speeding up — the derivative is itself changing.`,
    ],
    params: {
      x: [-0.4, 12.5], y: [-60, 1050], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)',
      sliders: [{ key: 'dt', label: t`Step $\Delta t$`, min: -3, max: 3, step: 0.05, value: 2, unit: t`\text{s}`, explain: t`The time from the gold point to the violet one.` }],
      curves: [{ fn: ROCKET, color: 'accent', domain: [0, 12] }],
      tangent: { fn: ROCKET, at: 4, secant: 'dt' },
      readouts: [
        { label: '$t_1$', expr: 'x0', unit: t`\text{s}`, digits: 3 },
        { label: 'secant slope (violet)', expr: 'secant', unit: t`\text{m/s}`, digits: 4 },
        { label: t`tangent slope $h'(t_1)$ (gold)`, expr: 'slope', unit: t`\text{m/s}`, digits: 4 },
      ],
    },
    caption: t`An illustrative altitude record, not a real vehicle’s: the acceleration $1.5t + 8\ \text{m/s}^2$ rises as propellant burns off. The tangent slope is computed numerically.`,
  },
  example: {
    prompt: t`For the rocket $h(t) = 0.25t^3 + 4t^2$ (m, s), find $h'(4)$ from the definition, write the tangent line at $t = 4$ s, and use it to predict the altitude at $t = 4.5$ s.`,
    visual: { type: 'graph', params: { x: [2, 6], y: [20, 200], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: ROCKET, color: 'accent' }, { fn: '80 + 44*(x - 4)', color: 'gold', dash: true, label: 'tangent', labelAt: 2.6, labelDy: 14 }], points: [{ x: 4, y: 80, color: 'gold', label: '(4, 80)', labelDx: -60 }, { x: 4.5, y: rocket(4.5), color: 'accent', label: 'h(4.5)' }] }, caption: t`The tangent at $t = 4$ s (dashed) hugs the curve nearby; half a second later it is under by $1.8$ m.` },
    steps: [
      { label: 'The value', text: t`$h(4) = 0.25(64) + 4(16) = 16 + 64 = 80$ m.` },
      { label: 'The quotient', text: t`Expand: $(4+\Delta)^3 - 64 = 48\Delta + 12\Delta^2 + \Delta^3$ and $(4+\Delta)^2 - 16 = 8\Delta + \Delta^2$. So $h(4 + \Delta) - h(4) = 0.25(48\Delta + 12\Delta^2 + \Delta^3) + 4(8\Delta + \Delta^2)$.` },
      { label: 'Divide and limit', text: t`Dividing by $\Delta$: $12 + 3\Delta + 0.25\Delta^2 + 32 + 4\Delta = 44 + 7\Delta + 0.25\Delta^2 \to 44$. So $h'(4) = 44$ m/s.` },
      { label: 'Tangent line', text: t`$y = 80 + 44(t - 4)$.` },
      { label: 'Predict and check', text: t`At $t = 4.5$: $80 + 44(0.5) = 102$ m. The true value is $h(4.5) = 103.8$ m. The tangent underestimates because the rocket is accelerating — the curve bends up away from it.` },
    ],
    answer: t`$h'(4) = 44$ m/s; tangent $y = 80 + 44(t - 4)$; predicted $h(4.5) \approx 102$ m (true $103.8$ m).`,
  },
  practice: [
    num({
      id: 'def-quad', difficulty: 1,
      gen(r) {
        const a = r.int(1, 4), b = r.intExcept(-6, 6, [0]), c = r.intExcept(-3, 3, [0]);
        const f = (x) => a * x * x + b * x, d = 2 * a * c + b;
        return {
          prompt: t`Use the definition to find $f'(${c})$ for $f(x) = ${a === 1 ? '' : a}x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x$.`,
          answer: d, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [...(f(c) !== d ? [{ value: f(c), feedback: t`That is the value $f(${c})$, the height of the curve. The derivative is the slope there.` }] : []), ...(a * c + b !== d ? [{ value: a * c + b, feedback: t`That is the slope of the secant from $0$ to $${c}$, not the tangent at $${c}$.` }] : [])],
          hints: [t`$\dfrac{f(${c} + h) - f(${c})}{h}$ simplifies to $${2 * a * c + b} + ${a}h$.`],
          teach: t`The derivative at a point is the limit of the difference quotient there; the leftover $h$ terms vanish in the limit.`,
          explain: t`$\dfrac{f(${c}+h) - f(${c})}{h} = ${d} + ${a}h \to ${d}$.`,
          visual: { type: 'graph', params: { x: [c - 2.5, c + 2.5], y: [Math.min(f(c - 2.5), f(c + 2.5), f(-b / (2 * a))) - 2, Math.max(f(c - 2.5), f(c + 2.5)) + 2], aspect: 'wide', curves: [{ fn: `${a}*x^2 + (${b})*x`, color: 'accent' }], points: [{ x: c, y: f(c), color: 'gold' }] }, caption: t`The parabola and the point $x = ${c}$ whose tangent slope you want.` },
        };
      },
    }),
    expr({
      id: 'tangent-cubic', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1, -2, 3]);
        const m = 3 * a * a, b = -2 * a ** 3;
        return {
          prompt: t`The derivative of $x^3$ at $x = a$ is $3a^2$. Write the equation of the tangent line to $y = x^3$ at $x = ${a}$.`,
          answer: `y = ${m}x + (${b})`, answerTeX: t`y = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`,
          vars: { x: [-2, 2], y: [-2, 2] }, mode: 'equation',
          errors: [{ answer: `y = ${m}x`, feedback: t`A tangent line passes through the point of tangency $(${a}, ${a ** 3})$, not through the origin: use $y = f(a) + f'(a)(x - a)$.` }, { answer: `y = ${a ** 3} + ${m}x`, feedback: t`Point–slope form is $f'(a)(x - a)$: the slope multiplies $x - ${a}$, not $x$.` }],
          hints: [t`Point: $(${a}, ${a ** 3})$. Slope: $3(${a})^2 = ${m}$.`, t`$y = ${a ** 3} + ${m}(x - (${a}))$; expand if you like.`],
          teach: t`The tangent line at $a$ is $y = f(a) + f'(a)(x - a)$: the point, and the slope.`,
          explain: t`$y = ${a ** 3} + ${m}(x ${a < 0 ? '+' : '-'} ${Math.abs(a)}) = ${m}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$.`,
          visual: { type: 'graph', params: { x: [a - 2.5, a + 2.5], y: [Math.min((a - 2.5) ** 3, a ** 3 - 10), Math.max((a + 2.5) ** 3, a ** 3 + 10)], aspect: 'wide', curves: [{ fn: 'x^3', color: 'accent' }], points: [{ x: a, y: a ** 3, color: 'gold', label: `(${a}, ${a ** 3})` }] }, caption: t`$y = x^3$ and the point of tangency.` },
        };
      },
    }),
    num({
      id: 'read-tangent', difficulty: 1,
      gen(r) {
        const t0 = r.pick([1, 2, 3, 4, 8, 9, 10]), m = 6 - t0;
        const x0 = 30 - 0.5 * (t0 - 6) ** 2;
        const P = [t0, x0], Q = [t0 + 2, x0 + 2 * m];
        return {
          prompt: t`The graph shows a cart’s position $x(t)$ on a straight track, with the tangent line at $t = ${t0}$ s drawn through the marked points. What is the cart’s velocity at $t = ${t0}$ s?`,
          answer: m, units: 'm/s', tol: { rel: 1e-6, abs: 0.01 },
          errors: [{ value: x0 / t0, feedback: t`Position divided by clock time is an average from $t = 0$ (and only if the cart started at $x = 0$). The velocity at an instant is the tangent’s slope.` }],
          hints: ['Slope = rise / run between the two marked points on the tangent.'],
          teach: 'Instantaneous velocity is the slope of the tangent to the position–time graph.',
          explain: t`$\dfrac{${nice(Q[1])} - ${nice(P[1])}}{${Q[0]} - ${P[0]}} = ${m}$ m/s${m < 0 ? ': negative, so the cart is moving back toward smaller $x$' : ''}.`,
          visual: { type: 'graph', params: { x: [0, 12.5], y: [10, 36], aspect: 'wide', xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: '30 - 0.5*(x - 6)^2', color: 'accent' }, { fn: `${x0} + (${m})*(x - ${t0})`, color: 'gold', dash: true, domain: [t0 - 3, t0 + 3] }], points: [{ x: P[0], y: P[1], color: 'gold', label: `(${P[0]}, ${nice(P[1])})` }, { x: Q[0], y: Q[1], color: 'gold', label: `(${Q[0]}, ${nice(Q[1])})` }] }, caption: 'Position against time (not the cart’s path, which is a straight line), with the tangent at the marked instant.' },
        };
      },
    }),
    mcq({
      id: 'iss-period', difficulty: 2,
      prompt: t`A satellite’s orbital period $T$ (in minutes) depends on its altitude $h$ (in km). For the International Space Station, $T(420) = 92.8$ min and $T'(420) = 0.0205$ min/km. What does $T'(420) = 0.0205$ min/km tell you?`,
      visual: { type: 'graph', params: { x: [200, 2000], y: [85, 130], aspect: 'wide', xlabel: 'altitude h (km)', ylabel: 'T (min)', curves: [{ fn: '2*pi*sqrt((6371 + x)^3/398600.4)/60', color: 'accent' }], points: [{ x: 420, y: 92.82, color: 'gold', label: 'ISS' }] }, caption: 'Period of a circular orbit around a spherical Earth against altitude (Kepler’s third law).' },
      choices: [t`Raising the orbit by $10$ km lengthens the period by about $0.2$ min ($12$ s)`, t`At $420$ km the period is $0.0205$ min`, t`The period grows by $0.0205$ min every minute`, t`Raising the orbit by $10$ km lengthens the period by $0.0205$ min`],
      answer: 0,
      why: { 1: t`That is a value of $T$; $T'$ is a rate: minutes of period per kilometre of altitude.`, 2: t`The rate is per kilometre of altitude, not per minute of time.`, 3: t`$0.0205$ min is the change for *one* kilometre; ten kilometres give about ten times as much.` },
      hints: ['Read the units: min/km.', t`Change in $T \approx T'(420)\times\Delta h$.`],
      teach: 'A derivative is a rate in units of output per unit of input: multiply it by a small input change to estimate the output change.',
      explain: t`$\Delta T \approx T'(420)\,\Delta h = 0.0205 \times 10 = 0.205$ min $\approx 12$ s. (Kepler: $T \propto a^{3/2}$, so $T' = \tfrac32 T/a = \tfrac32 \times 92.8/6791$.)`,
    }),
    mcq({
      id: 'tangent-crosses', difficulty: 2,
      prompt: t`Which statement about the tangent line to $y = x^3$ at $x = 0$ is correct?`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-2, 2], aspect: 'wide', curves: [{ fn: 'x^3', color: 'accent' }], points: [{ x: 0, y: 0, color: 'gold' }] }, caption: t`$y = x^3$ near the origin.` },
      choices: [t`It is the line $y = 0$, and it crosses the curve at the point of tangency`, t`There is no tangent at $0$, because any line through the origin crosses the curve there`, t`It is the vertical line $x = 0$`, t`It is the line $y = x$`],
      answer: 0,
      why: { 1: t`“Touches without crossing” is a property of circles, not the definition. The tangent is the limit of secants, and here that limit is the slope $0$.`, 2: t`A vertical line would need infinite slope, but $\frac{h^3}{h} = h^2 \to 0$.`, 3: t`The secant slopes are $h^2$, which tend to $0$, not $1$.` },
      hints: [t`Compute $\lim_{h\to0}\frac{h^3 - 0}{h}$.`],
      teach: 'A tangent line is defined by the limit of secant slopes; it may cross the curve.',
      explain: t`$f'(0) = \lim_{h\to 0} h^2 = 0$, so the tangent is $y = 0$. The cubic passes from below to above it at the origin: an inflection point.`,
    }),
    num({
      id: 'moon-throw', difficulty: 2,
      gen(r) {
        const v0 = r.pick([8, 10, 12]), tt = r.pick([2, 3, 4]);
        const v = v0 - 1.62 * tt;
        return {
          prompt: t`An astronaut on the Moon throws a rock straight up. Its height is $y(t) = ${v0}t - 0.81t^2$ metres. Using the definition of the derivative, find its velocity at $t = ${tt}$ s.`,
          answer: v, units: 'm/s', tol: { rel: 0.003 },
          errors: [{ value: v0 - 0.81 * tt, feedback: t`That is $y(${tt})/${tt}$, the *average* velocity since the throw. Take the limit of the difference quotient at $t = ${tt}$.` }],
          hints: [t`$\dfrac{y(${tt} + h) - y(${tt})}{h} = ${v0} - 0.81(${2 * tt} + h)$.`, 'Let h → 0.'],
          teach: t`The instantaneous velocity is the limit of the average velocity over $[t, t + h]$ as $h \to 0$.`,
          explain: t`$y'(${tt}) = ${v0} - 1.62(${tt}) = ${nice(v)}$ m/s${v < 0 ? ' — negative: the rock is already falling' : ' — still rising'}. The Moon’s surface gravity is $1.62\ \text{m/s}^2$.`,
          visual: { type: 'graph', params: { x: [-0.3, 2 * v0 / 1.62 + 0.5], y: [-2, v0 * v0 / 3.24 * 1.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'y (m)', curves: [{ fn: `${v0}*x - 0.81*x^2`, color: 'accent', domain: [0, 2 * v0 / 1.62] }], points: [{ x: tt, y: v0 * tt - 0.81 * tt * tt, color: 'gold' }] }, caption: 'Height against time on the Moon (no air). The gold point is the instant asked about.' },
        };
      },
    }),
    num({
      id: 'def-reciprocal', difficulty: 3,
      gen(r) {
        const k = r.int(2, 9), a = r.pick([2, 3, 4]);
        return {
          prompt: t`Use the definition to find $f'(${a})$ for $f(x) = \dfrac{${k}}{x}$.`,
          answer: -k / (a * a), tol: { rel: 0.002 },
          errors: [{ value: -k / a, feedback: t`After combining fractions the quotient is $-\frac{${k}}{${a}(${a} + h)}$; at $h = 0$ that has $${a}^2$ underneath.` }],
          hints: [t`$\dfrac{1}{h}\left(\dfrac{${k}}{${a} + h} - \dfrac{${k}}{${a}}\right) = \dfrac{1}{h}\cdot\dfrac{${k}\cdot ${a} - ${k}(${a} + h)}{${a}(${a} + h)}$.`, t`The numerator is $-${k}h$; cancel $h$ and let $h \to 0$.`],
          teach: t`For a reciprocal, combine the fractions in the difference quotient first; the $h$ then cancels.`,
          explain: t`$\dfrac{-${k}}{${a}(${a} + h)} \to -\dfrac{${k}}{${a * a}} = ${frac(-k / (a * a))}$.`,
          visual: { type: 'graph', params: { x: [0, 2 * a + 2], y: [0, 2.5 * k / a], aspect: 'wide', curves: [{ fn: `${k}/x`, color: 'accent', domain: [k / (2.5 * k / a), 2 * a + 2] }], points: [{ x: a, y: k / a, color: 'gold' }] }, caption: t`$y = ${k}/x$ and the point $x = ${a}$.` },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-tangent-sqrt', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 4, 9, 16]), s = Math.sqrt(a);
        return {
          prompt: t`The derivative of $\sqrt{x}$ at $x = a$ is $\dfrac{1}{2\sqrt a}$. Write the tangent line to $y = \sqrt{x}$ at $x = ${a}$.`,
          answer: `y = ${s} + (x - ${a})/${2 * s}`, answerTeX: t`y = ${s} + \frac{x - ${a}}{${2 * s}}`,
          vars: { x: [0, 10], y: [0, 4] }, mode: 'equation',
          errors: [{ answer: `y = (x - ${a})/${2 * s}`, feedback: t`The line must pass through $(${a}, ${s})$: add $f(${a}) = ${s}$.` }],
          hints: [t`Point $(${a}, ${s})$, slope $\frac{1}{${2 * s}}$.`, t`$y = f(a) + f'(a)(x - a)$.`],
          teach: 'Tangent line: the point of tangency plus the slope times the run from it.',
          explain: t`$y = ${s} + \frac{1}{${2 * s}}(x - ${a})$, or $y = \frac{x}{${2 * s}} + ${nice(s / 2)}$.`,
          visual: { type: 'graph', params: { x: [0, 2.2 * a + 2], y: [0, Math.sqrt(2.2 * a + 2) + 0.5], aspect: 'wide', curves: [{ fn: 'sqrt(x)', color: 'accent' }], points: [{ x: a, y: s, color: 'gold', label: `(${a}, ${s})` }] }, caption: t`$y = \sqrt{x}$ and the point of tangency.` },
        };
      },
    }),
    num({
      id: 'cp-lander', difficulty: 2, transfer: true,
      gen(r) {
        const h0 = r.pick([120, 150, 90]), v0 = r.pick([10, 12, 14]), tt = r.pick([2, 3, 4]);
        const v = -v0 + 1.6 * tt;
        return {
          prompt: t`In the last seconds of a powered descent, a lunar lander’s height is $h(t) = ${h0} - ${v0}t + 0.8t^2$ metres (its engine gives a net upward acceleration of $1.6\ \text{m/s}^2$). Find its vertical velocity at $t = ${tt}$ s.`,
          answer: v, units: 'm/s', tol: { rel: 0.003 },
          errors: [{ value: (h0 - v0 * tt + 0.8 * tt * tt - h0) / tt, feedback: t`That is the average velocity since $t = 0$. The instantaneous velocity is the limit of the difference quotient at $t = ${tt}$.` }],
          hints: [t`$\dfrac{h(${tt} + \Delta) - h(${tt})}{\Delta} = -${v0} + 0.8(${2 * tt} + \Delta)$.`],
          teach: 'Velocity is the derivative of height; a negative value means descending.',
          explain: t`$h'(${tt}) = -${v0} + 1.6(${tt}) = ${nice(v)}$ m/s: still descending, but slowing.`,
          visual: { type: 'graph', params: { x: [-0.3, 7], y: [h0 - 70, h0 + 5], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: `${h0} - ${v0}*x + 0.8*x^2`, color: 'accent', domain: [0, 7] }], points: [{ x: tt, y: h0 - v0 * tt + 0.8 * tt * tt, color: 'gold' }] }, caption: 'An illustrative descent profile with a constant net deceleration; a real lander throttles continuously.' },
        };
      },
    }),
    mcq({
      id: 'cp-units', difficulty: 2,
      prompt: t`A probe’s distance from a comet is $r(t)$ in km, with $t$ in seconds. At $t = 600$ s, $r'(600) = -3.2$. What does this mean?`,
      visual: { type: 'graph', params: { x: [0, 1200], y: [0, 6500], aspect: 'wide', xlabel: 't (s)', ylabel: 'r (km)', curves: [{ fn: '6000 - 4*x + 0.000667*x^2', color: 'accent' }, { fn: '3840.1 - 3.2*(x - 600)', color: 'gold', dash: true, domain: [300, 900] }], points: [{ x: 600, y: 3840.1, color: 'gold' }] }, caption: 'An illustrative approach, with the tangent at t = 600 s.' },
      choices: [t`At that instant the distance is shrinking at $3.2$ km/s`, t`At that instant the probe is $3.2$ km from the comet`, t`Over the first $600$ s the distance fell by $3.2$ km on average each second`, t`The probe is decelerating at $3.2\ \text{km/s}^2$`],
      answer: 0,
      why: { 1: 'That would be r(600), a distance; r′ is a rate.', 2: 'That describes an average rate over [0, 600]; r′(600) is the rate at one instant.', 3: t`Acceleration would be the derivative of the *velocity*, in km/s².` },
      hints: [t`$r'$ has units km per s.`],
      teach: 'The derivative at an instant is a rate at that instant, with units of output per unit input.',
      explain: t`$r'(600) = -3.2$ km/s: at $t = 600$ s the distance is decreasing at $3.2$ km each second — the probe is closing in.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §3.1 Defining the derivative', url: 'https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative' },
  ],
});
