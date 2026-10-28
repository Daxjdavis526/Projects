// The Mean Value Theorem — somewhere between two measurements the instantaneous
// rate equals the average one. An average-speed camera is the theorem in
// hardware.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig, fitY } from './_c1kit.js';
import { chordAt } from './_c1int.js';

const t = String.raw;

// the Explore curve: a cubic with a hump and a dip
const CUB = '0.15*x^3 - 1.35*x^2 + 3.3*x + 1';
const cub = (s) => `(${CUB.replace(/x/g, `(${s})`)})`;

// the worked example: a car between two average-speed cameras 12 km apart,
// position in km, time in minutes
const carX = (s) => 2 * s + 0.5 * Math.sin(Math.PI * s / 3);

// a curve, its chord over [a, b], and the end points (the chord is the setting, not the answer)
function chordFig({ fn, f, a, b, x, y, xlabel, ylabel, caption, domain, more = {} }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel, ylabel,
      curves: [{ fn, color: 'accent', domain }, { fn: chordAt(f, a, b), color: 'violet', dash: true, width: 1.8, domain: [a, b] }, ...(more.curves || [])],
      points: [{ x: a, y: f(a), color: 'violet' }, { x: b, y: f(b), color: 'violet' }, ...(more.points || [])],
      vlines: more.vlines,
    },
    caption,
  };
}

export default lesson({
  id: 'math1210.C1-4.4',
  title: 'The Mean Value Theorem',
  minutes: 9, difficulty: 2,
  intro: t`If a function is continuous on $[a, b]$ and differentiable inside it, then at some point $c$ between $a$ and $b$ the tangent is parallel to the chord joining the ends — the instantaneous rate equals the average rate:

$$f'(c) = \frac{f(b) - f(a)}{b - a}$$

Read with $f$ as position and $x$ as time: if your average speed over a trip was $120$ km/h, then at some instant your speedometer read exactly $120$ km/h. The theorem says that such a $c$ **exists**; it does not say where. Its special case with $f(a) = f(b)$, where the tangent is flat, is **Rolle’s theorem**.`,
  symbols: [
    { tex: 'f', text: 'a function **continuous** on the closed interval $[a, b]$ and **differentiable** on the open interval $(a, b)$' },
    { tex: 'a,\\ b', text: 'the ends of the interval, with $a < b$' },
    { tex: '\\frac{f(b) - f(a)}{b - a}', text: 'the **average rate of change**: the slope of the chord from $(a, f(a))$ to $(b, f(b))$' },
    { tex: 'c', text: 'some point strictly between $a$ and $b$ — there may be several' },
    { tex: "f'(c)", text: 'the **instantaneous rate** at $c$: the slope of the tangent there' },
  ],
  why: t`It is the bridge from a derivative to the function itself: it proves that $f' = 0$ means constant, that $f' > 0$ means increasing, that two antiderivatives differ only by a constant — and it turns a bound on a rate into a bound on a change, which is how error estimates are made.`,
  visual: {
    type: 'graph',
    title: 'A tangent parallel to the chord',
    lead: t`The violet chord joins the curve at $x = a$ and $x = b$; its slope is the average rate of change. Drag the gold point along the curve until the tangent is parallel to the chord: the two readouts agree.`,
    tasks: [
      'With the starting a and b, find both points where the slopes match: the theorem promises at least one, and here there are two.',
      'Shrink the interval to a = 2.5, b = 4: only one matching point is left, and it is trapped between a and b.',
      'Set a = 1.2 and b = 5.5, two points at almost the same height: the chord is level, and the matching tangents are the flat ones at the hump and the dip — Rolle’s theorem.',
    ],
    params: {
      x: [-0.3, 6.8], y: [-0.5, 8.2], aspect: 'wide',
      sliders: [
        { key: 'a', label: t`Left end $a$`, min: 0, max: 3, step: 0.05, value: 0.5, explain: t`Where the interval starts.` },
        { key: 'b', label: t`Right end $b$`, min: 3.5, max: 6.5, step: 0.05, value: 6, explain: t`Where the interval ends.` },
      ],
      curves: [
        { fn: CUB, color: 'accent', domain: [0, 6.6] },
        { fn: `${cub('a')} + (${cub('b')} - ${cub('a')})/(b - a)*(x - a)`, color: 'violet', dash: true, width: 1.8, domain: ['a', 'b'] },
      ],
      points: [{ x: 'a', y: cub('a'), color: 'violet', label: 'a' }, { x: 'b', y: cub('b'), color: 'violet', label: 'b' }],
      tangent: { fn: CUB, at: 3 },
      readouts: [
        { label: 'chord slope (average rate)', expr: `(${cub('b')} - ${cub('a')})/(b - a)`, digits: 3 },
        { label: 'tangent slope at the gold point', expr: 'slope', digits: 3 },
        { label: 'gold point x', expr: 'x0', digits: 3 },
      ],
    },
    caption: t`$f(x) = 0.15x^3 - 1.35x^2 + 3.3x + 1$, smooth everywhere, so the theorem applies on every interval. The slopes are measured numerically.`,
  },
  example: {
    prompt: t`On a motorway with a $100$ km/h limit, two average-speed cameras stand $12.0$ km apart. A car passes the first at 14:02:10 and the second at 14:08:10. The driver says the speedometer never went over $100$. Prove otherwise.`,
    visual: chordFig({
      fn: '2*x + 0.5*sin(pi*x/3)', f: carX, a: 0, b: 6, x: [-0.3, 6.6], y: [-0.8, 13.2], xlabel: 't (min)', ylabel: 'x (km)', domain: [0, 6.3],
      more: {
        curves: [1.5, 4.5].map((c) => ({ fn: `${N(carX(c))} + 2*(x - ${c})`, color: 'gold', width: 1.8, domain: [c - 1.1, c + 1.1] })),
        points: [1.5, 4.5].map((c) => ({ x: c, y: carX(c), color: 'gold' })),
      },
      caption: t`One possible position record (blue) and the chord between the cameras (violet). Wherever the gold tangents touch, the car is doing exactly $120$ km/h. The theorem guarantees such an instant for **every** smooth record with these end points; this curve is only an illustration.`,
    }),
    steps: [
      { label: 'Name the function', text: t`Let $x(t)$ be the car’s distance past the first camera, in km, with $t$ in minutes from 14:02:10. A car’s position is continuous and differentiable: it cannot teleport or change speed instantly.` },
      { label: 'Average rate', text: t`It covered $12.0$ km in $6.00$ min: $\dfrac{x(6) - x(0)}{6 - 0} = \dfrac{12.0\ \text{km}}{6.00\ \text{min}} = 2.00$ km/min $= 120$ km/h.` },
      { label: 'Apply the theorem', text: t`The Mean Value Theorem gives an instant $c$ between $0$ and $6$ min where $x'(c) = 120$ km/h: the speedometer read $120$ at that instant.` },
      { label: 'Conclude', text: t`$120 > 100$, so the car broke the limit — and nobody needs to know *when*. That is the whole logic of an average-speed camera.` },
      { label: 'Sense check', text: t`If the speed had stayed at or below $100$ km/h throughout, $6$ minutes could cover at most $10$ km, not $12$. The theorem says the same thing in general form.` },
    ],
    answer: t`The average speed was $120$ km/h, so by the Mean Value Theorem the speed was exactly $120$ km/h at some instant — over the limit.`,
  },
  practice: [
    mcq({
      id: 'rolle-abs', difficulty: 1,
      prompt: t`$f(x) = |x|$ has $f(-1) = f(1) = 1$, yet $f'(c) = 0$ nowhere in $(-1, 1)$. Which hypothesis of Rolle’s theorem fails?`,
      visual: curveFig({ fn: 'abs(x)', x: [-1.6, 1.6], y: [-0.3, 1.5], points: [{ x: -1, y: 1, color: 'violet' }, { x: 1, y: 1, color: 'violet' }], curves: [{ fn: '1', color: 'violet', dash: true, width: 1.6, domain: [-1, 1] }], caption: t`$y = |x|$ on $[-1, 1]$ and the level chord between its ends. The slope is $-1$ on the left and $+1$ on the right; the corner at $0$ has no tangent.` }),
      choices: [
        t`$f$ is not differentiable at $x = 0$`,
        t`$f$ is not continuous on $[-1, 1]$`,
        t`$f(-1) \ne f(1)$`,
        'None — Rolle’s theorem is simply false for this function',
      ],
      answer: 0,
      why: {
        1: t`$|x|$ is continuous everywhere — you can draw it without lifting the pen. The trouble is the corner.`,
        2: t`Both ends are at height $1$, so that hypothesis holds.`,
        3: t`A theorem cannot fail when its hypotheses hold. Here one of them does not, so the theorem promises nothing.`,
      },
      hints: ['Rolle needs three things: continuity on [a, b], differentiability on (a, b), and equal end values. Check each.'],
      teach: 'The Mean Value Theorem and Rolle’s theorem need differentiability at every interior point: one corner is enough to break them.',
      explain: t`At $x = 0$ the slope jumps from $-1$ to $+1$, so $f'(0)$ does not exist. With a corner, the tangent can skip the horizontal direction altogether.`,
    }),
    num({
      id: 'c-for-cube', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 2, 3, 4]), c = b / Math.sqrt(3);
        const f = (x) => x ** 3;
        return {
          prompt: t`Find the number $c$ in $(0, ${b})$ that the Mean Value Theorem promises for $f(x) = x^3$ on $[0, ${b}]$. Give 3 significant figures.`,
          answer: c, tol: { rel: 0.005 },
          errors: [{ value: b / 2, feedback: t`The midpoint works only for a parabola. Solve $f'(c) = $ (chord slope) for $c$.` }, { value: b / 3, feedback: t`From $3c^2 = ${b * b}$ you get $c^2 = ${nice(b * b / 3)}$; take the square root.` }],
          hints: [t`The chord slope is $\dfrac{${b ** 3} - 0}{${b} - 0} = ${b * b}$.`, t`Solve $3c^2 = ${b * b}$ for $c > 0$.`],
          teach: 'To find c, compute the chord slope, then solve f′(c) = that slope and keep the solution inside (a, b).',
          explain: t`Chord slope $= ${b * b}$; $f'(c) = 3c^2 = ${b * b}$ gives $c = ${b}/\sqrt3 = ${nice(c, 4)}$, which lies in $(0, ${b})$. It is past the midpoint because $x^3$ steepens to the right.`,
          visual: chordFig({ fn: 'x^3', f, a: 0, b, x: [-0.15 * b, 1.15 * b], y: [-0.12 * b ** 3, 1.12 * b ** 3], caption: t`$y = x^3$ on $[0, ${b}]$ with its chord. Somewhere between the ends a tangent runs parallel to it.` }),
        };
      },
    }),
    num({
      id: 'c-for-sqrt', difficulty: 2,
      gen(r) {
        const a = r.int(1, 2), b = a + r.int(2, 4), A = a * a, B = b * b, c = ((a + b) / 2) ** 2;
        return {
          prompt: t`For $f(x) = \sqrt{x}$ on $[${A}, ${B}]$, find the value $c$ guaranteed by the Mean Value Theorem.`,
          answer: c, tol: { rel: 0.002 },
          errors: [{ value: (A + B) / 2, feedback: t`The midpoint of the interval is not the answer here: $\sqrt{x}$ is not a parabola. Solve $\dfrac{1}{2\sqrt c} = $ (chord slope).` }],
          hints: [t`The chord slope is $\dfrac{${b} - ${a}}{${B} - ${A}} = \dfrac{1}{${a + b}}$.`, t`Solve $\dfrac{1}{2\sqrt c} = \dfrac{1}{${a + b}}$: $\sqrt c = ${nice((a + b) / 2)}$.`],
          teach: t`Set $f'(c)$ equal to the chord slope and solve; for $\sqrt x$ that gives $\sqrt c$ = the average of $\sqrt a$ and $\sqrt b$.`,
          explain: t`$\dfrac{1}{2\sqrt c} = \dfrac{1}{${a + b}}$ gives $\sqrt c = ${nice((a + b) / 2)}$, so $c = ${nice(c)}$ — left of the midpoint $${nice((A + B) / 2)}$, because $\sqrt x$ flattens to the right.`,
          visual: chordFig({ fn: 'sqrt(x)', f: Math.sqrt, a: A, b: B, x: [-0.5, B + 2], y: [-0.3, b + 0.8], domain: [0, B + 2], caption: t`$y = \sqrt x$ and its chord from $x = ${A}$ to $x = ${B}$.` }),
        };
      },
    }),
    num({
      id: 'speed-trap', difficulty: 2,
      gen(r) {
        const d = r.pick([8, 10, 12, 15, 18]), target = r.pick([108, 114, 120, 126, 132]);
        const T = Math.round(d / target * 3600), avg = d / T * 3600;
        const m = Math.floor(T / 60), s = T % 60;
        const wig = (u) => avg / 60 * u + 0.4 * Math.sin(2 * Math.PI * u / (T / 60));
        return {
          prompt: t`Two average-speed cameras are $${d}$ km apart. A car takes ${m} min ${s} s between them. What speed does the Mean Value Theorem guarantee the car had **at some instant**, in km/h?`,
          answer: avg, units: 'km/h', tol: { rel: 0.005 },
          errors: [{ value: avg / 60, feedback: 'That is in km per minute. Multiply by 60 for km/h.' }],
          hints: [t`Convert the time to hours: ${m} min ${s} s $= ${nice(T / 3600, 4)}$ h.`, 'The theorem guarantees the average speed itself, at some instant.'],
          teach: 'The Mean Value Theorem turns an average speed into an instantaneous one: the speedometer must have shown the average at least once.',
          explain: t`$\bar v = \dfrac{${d}\ \text{km}}{${nice(T / 3600, 4)}\ \text{h}} = ${nice(avg, 4)}$ km/h. Position is differentiable, so at some instant the speed was exactly that.`,
          visual: chordFig({ fn: `${N(avg / 60)}*x + 0.4*sin(2*pi*x/${N(T / 60)})`, f: wig, a: 0, b: T / 60, x: [-0.3, T / 60 + 0.5], y: [-0.8, d + 1.2], xlabel: 't (min)', ylabel: 'x (km)', domain: [0, T / 60 + 0.3], caption: 'One possible position record between the cameras, and the chord whose slope is the average speed. The real record is unknown, and the theorem does not need it.' }),
        };
      },
    }),
    mcq({
      id: 'rolle-rocket', difficulty: 2,
      prompt: t`A model rocket leaves the ground at $t = 0$ and lands back on the ground (same height) at $t = 14$ s. Which statement do Rolle’s theorem and the Mean Value Theorem guarantee?`,
      visual: curveFig({ fn: '4.2*x*(14 - x)*e^(-x/20)', x: [-0.6, 15], y: [-10, 170], xlabel: 't (s)', ylabel: 'height (m)', domain: [0, 14], caption: 'A plausible height record. Drag makes the climb quicker than the fall, so the peak comes before the halfway time.' }),
      choices: [
        'At some instant its vertical velocity was zero',
        'At some instant its vertical acceleration was zero',
        'It reached its highest point at t = 7 s',
        'Its vertical velocity was zero at t = 7 s',
      ],
      answer: 0,
      why: {
        1: 'Rolle’s theorem is about the first derivative of the function you apply it to — here height, whose derivative is velocity. Gravity keeps the acceleration well away from zero at the top.',
        2: 'Only a symmetric flight peaks at the halfway time. With drag the climb is faster than the fall, and the peak comes early.',
        3: 'The theorem promises an instant somewhere in (0, 14), not where. In the plot the flat tangent is near 6 s.',
      },
      hints: ['Apply Rolle’s theorem to h(t) on [0, 14]: what are h(0) and h(14)?', 'Rolle gives a c with h′(c) = 0. What is h′?'],
      teach: 'Rolle’s theorem: equal values at the ends force a flat tangent somewhere between — existence, not location.',
      explain: t`$h(0) = h(14) = 0$, and height is differentiable, so $h'(c) = 0$ for some $c$ in $(0, 14)$: the vertical velocity is zero at the top. The theorem does not say when.`,
    }),
    num({
      id: 'fan-bound', difficulty: 3,
      gen(r) {
        const a = r.int(0, 2), b = a + r.int(3, 5), fa = r.int(5, 12), lo = r.int(1, 3), hi = lo + r.int(2, 4);
        const ans = fa + lo * (b - a);
        return {
          prompt: t`$f(${a}) = ${fa}$, and $${lo} \le f'(x) \le ${hi}$ for every $x$ in $[${a}, ${b}]$. What is the **smallest** value $f(${b})$ could have?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: fa + hi * (b - a), feedback: t`That is the largest possible value. The smallest uses the smallest slope, $${lo}$.` }, { value: lo * (b - a), feedback: t`That is the smallest possible *change*. Add the starting value $f(${a}) = ${fa}$.` }],
          hints: [t`By the Mean Value Theorem, $f(${b}) - f(${a}) = f'(c)\,(${b} - ${a})$ for some $c$.`, t`$f'(c)$ is at least $${lo}$, so $f(${b}) - ${fa} \ge ${lo}\times ${b - a}$.`],
          teach: 'Bounds on the derivative become bounds on the change: m(b − a) ≤ f(b) − f(a) ≤ M(b − a).',
          explain: t`$f(${b}) = ${fa} + f'(c)\cdot ${b - a}$ with $${lo} \le f'(c) \le ${hi}$, so $${ans} \le f(${b}) \le ${fa + hi * (b - a)}$. The smallest value is reached only if the slope is $${lo}$ all the way.`,
          visual: {
            type: 'graph',
            params: {
              x: [a - 0.5, b + 0.8], y: [fa - 2, fa + hi * (b - a) + 2], aspect: 'wide',
              curves: [
                { fn: `${fa} + ${hi}*(x - ${a})`, color: 'ink3', dash: true, width: 1.4, domain: [a, a + 1.5], label: `slope ${hi}`, labelAt: a + 1.5 },
                { fn: `${fa} + ${lo}*(x - ${a})`, color: 'ink3', dash: true, width: 1.4, domain: [a, a + 1.5], label: `slope ${lo}`, labelAt: a + 1.5, labelDy: 10 },
              ],
              shade: [{ fn: `${fa} + ${hi}*(x - ${a})`, lower: `${fa} + ${lo}*(x - ${a})`, from: a, to: a + 1.5, color: 'accent', alpha: 0.15 }],
              points: [{ x: a, y: fa, color: 'gold', label: `(${a}, ${fa})`, labelDx: -8, labelDy: 14, labelAlign: 'right' }],
              vlines: [{ x: b, label: `x = ${b}` }],
            },
            caption: t`Starting from the gold point with slopes between $${lo}$ and $${hi}$, the graph cannot leave the wedge between the two dashed lines (drawn here for the first $1.5$ units).`,
          },
        };
      },
    }),
    mcq({
      id: 'find-error-recip', difficulty: 3, kind: 'error',
      prompt: t`A student applies the Mean Value Theorem to $f(x) = 1/x$ on $[-1, 1]$: the chord slope is $\dfrac{1 - (-1)}{2} = 1$, but $f'(c) = -1/c^2$ is negative for every $c$, so no $c$ works. “The theorem is wrong.” What is the real problem?`,
      visual: curveFig({ fn: '1/x', x: [-1.6, 1.6], y: [-4, 4], domain: [-1.6, 1.6], points: [{ x: -1, y: -1, color: 'violet' }, { x: 1, y: 1, color: 'violet' }], curves: [{ fn: 'x', color: 'violet', dash: true, width: 1.6, domain: [-1, 1] }], caption: t`$y = 1/x$ falls on both sides of $0$, yet the chord from $(-1, -1)$ to $(1, 1)$ rises. The graph breaks at $x = 0$.` }),
      choices: [
        t`$f$ is not continuous on $[-1, 1]$: it is undefined at $x = 0$`,
        'The chord slope should be −1',
        t`$f'(c) = 1/c^2$, which equals $1$ at $c = \pm1$`,
        'The theorem only applies to polynomials',
      ],
      answer: 0,
      why: {
        1: t`$\frac{f(1) - f(-1)}{1 - (-1)} = \frac{1 - (-1)}{2} = +1$. The student’s arithmetic is right.`,
        2: t`The derivative of $x^{-1}$ is $-x^{-2}$; the minus sign is real. And $c = \pm1$ are the ends, not interior points.`,
        3: t`The theorem applies to any function that is continuous on $[a, b]$ and differentiable on $(a, b)$ — $\sqrt x$, $\sin x$, $e^x$ …`,
      },
      hints: ['Check the hypotheses before blaming the theorem.', t`Is $1/x$ defined, let alone continuous, everywhere on $[-1, 1]$?`],
      teach: 'Before using the Mean Value Theorem, check its hypotheses on the whole closed interval; a single break voids it.',
      explain: t`$1/x$ has an infinite break at $0$, inside the interval. Without continuity on $[-1, 1]$ the theorem promises nothing, and here nothing is what you get.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-c-exp', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 2, 3]), m = (Math.exp(b) - 1) / b, c = Math.log(m);
        return {
          prompt: t`Find the value $c$ that the Mean Value Theorem gives for $f(x) = e^{x}$ on $[0, ${b}]$, to 3 significant figures.`,
          answer: c, tol: { rel: 0.005 },
          errors: [{ value: b / 2, feedback: t`The midpoint is not special here. Solve $e^{c} = $ (chord slope).` }],
          hints: [t`Chord slope: $\dfrac{e^{${b}} - 1}{${b}}$.`, t`Solve $e^{c} = \dfrac{e^{${b}} - 1}{${b}}$ by taking $\ln$.`],
          teach: t`Solve $f'(c)$ = chord slope; for an exponential take the logarithm.`,
          explain: t`The chord slope is $\dfrac{e^{${b}} - 1}{${b}} = ${nice(m, 4)}$, and $e^{c} = ${nice(m, 4)}$ gives $c = \ln ${nice(m, 4)} = ${nice(c, 4)}$, inside $(0, ${b})$.`,
          visual: chordFig({ fn: 'e^x', f: Math.exp, a: 0, b, x: [-0.3, b + 0.3], y: fitY(Math.exp, -0.3, b + 0.2), caption: t`$y = e^x$ on $[0, ${b}]$ and its chord.` }),
        };
      },
    }),
    num({
      id: 'cp-launch', difficulty: 2, transfer: true,
      gen(r) {
        const V = r.pick([1.8, 2.1, 2.4, 2.7]), T = r.pick([120, 140, 150, 160]), a = V * 1000 / T;
        return {
          prompt: t`A launch vehicle’s telemetry shows a speed of $0$ at liftoff and $${V}$ km/s at $t = ${T}$ s, when the first stage shuts down. The Mean Value Theorem guarantees an instant at which the rate of change of its speed was exactly what, in m/s²?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: a / 9.81, feedback: 'That is the value in units of g. The question asks for m/s².' }],
          hints: ['Apply the theorem to the speed v(t) on [0, T].', t`$\dfrac{v(${T}) - v(0)}{${T} - 0}$, with the speed in m/s.`],
          teach: 'Applied to velocity, the Mean Value Theorem says the acceleration equals the average acceleration at some instant.',
          explain: t`$\dfrac{${V * 1000}\ \text{m/s}}{${T}\ \text{s}} = ${nice(a, 3)}\ \text{m/s}^2$, about $${nice(a / 9.81, 2)}g$. A real first stage’s acceleration starts small — at liftoff the thrust barely beats the weight — and climbs as propellant burns off, so it passes this value once, partway through the burn.`,
          visual: curveFig({ fn: `${N(V * 1000)}*((x/${T})^2*0.55 + (x/${T})*0.45)`, x: [-0.04 * T, 1.08 * T], y: [-0.06 * V * 1000, 1.12 * V * 1000], xlabel: 't (s)', ylabel: 'v (m/s)', domain: [0, T], points: [{ x: 0, y: 0, color: 'violet' }, { x: T, y: V * 1000, color: 'violet' }], curves: [{ fn: `${N(V * 1000 / T)}*x`, color: 'violet', dash: true, width: 1.6, domain: [0, T] }], caption: 'A schematic speed record: the acceleration grows as propellant burns off. Gravity losses and staging details are left out.' }),
        };
      },
    }),
    mcq({
      id: 'cp-antideriv', difficulty: 2,
      prompt: t`$F$ and $G$ are differentiable on an interval and $F'(x) = G'(x)$ at every point of it. What can you conclude?`,
      visual: curveFig({ fn: 'sin(x) + 0.3*x', x: [-0.3, 6.5], y: [-1, 4.3], curves: [{ fn: 'sin(x) + 0.3*x + 2', color: 'violet' }], caption: t`Two curves with equal slopes at every $x$: one is the other shifted up by a constant.` }),
      choices: [
        t`$F - G$ is constant on the interval`,
        t`$F = G$ on the interval`,
        t`$F - G$ is a linear function $kx + C$`,
        t`Nothing — equal derivatives say nothing about $F$ and $G$`,
      ],
      answer: 0,
      why: {
        1: t`$F = x^2$ and $G = x^2 + 5$ have the same derivative but are not equal. Equal slopes fix the shape, not the height.`,
        2: t`Then $(F - G)' = k$, which is $0$ only when $k = 0$: the difference has zero slope everywhere.`,
        3: t`Apply the Mean Value Theorem to $H = F - G$: it says a great deal.`,
      },
      hints: [t`Let $H = F - G$. What is $H'$?`, t`Apply the Mean Value Theorem to $H$ between any two points $x_1 < x_2$: $H(x_2) - H(x_1) = H'(c)(x_2 - x_1)$.`],
      teach: 'If two functions have the same derivative on an interval, they differ by a constant — the reason every antiderivative carries + C.',
      explain: t`$H' = 0$, so for any $x_1 < x_2$ the theorem gives $H(x_2) - H(x_1) = 0\cdot(x_2 - x_1) = 0$: $H$ is constant. This is why every antiderivative of $f$ is “one of them $+ C$”.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.4 The Mean Value Theorem', url: 'https://openstax.org/books/calculus-volume-1/pages/4-4-the-mean-value-theorem' }],
});
