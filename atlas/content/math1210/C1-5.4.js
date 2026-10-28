// The Fundamental Theorem of Calculus — accumulation is the inverse of
// differentiation. Displacement from a velocity log; work and impulse as
// integrals.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig } from './_c1kit.js';
import { areaFig, thou } from './_c1int.js';

const t = String.raw;

// the worked example: an airliner’s take-off roll, v(t) = 3.0t − 0.025t² m/s
const vTO = (s) => 3 * s - 0.025 * s * s, xTO = (s) => 1.5 * s * s - 0.025 / 3 * s ** 3;

export default lesson({
  id: 'math1210.C1-5.4',
  title: 'The Fundamental Theorem of Calculus',
  minutes: 11, difficulty: 3,
  intro: t`Two ideas that look unrelated — the slope of a curve and the area under one — are inverse operations. **Part 1:** if you accumulate the area under a continuous $f$ from $a$ up to a moving point $x$, the rate at which that area grows is the height of $f$ there: $\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt = f(x)$. **Part 2**, the one you compute with: if $F$ is any antiderivative of $f$,

$$\int_a^b f(x)\,dx = F(b) - F(a)$$

So a limit of Riemann sums can be evaluated with two subtractions. Read physically: the total change in a quantity is the integral of its rate — displacement from velocity, work from force over distance, impulse from force over time.`,
  symbols: [
    { tex: 'f', text: 'a continuous function on $[a, b]$ — a rate, such as a velocity or a force' },
    { tex: 'F', text: 'any antiderivative of $f$: $F\' = f$ (the $+C$ cancels in the subtraction)' },
    { tex: 'F(b) - F(a)', text: 'the net change of $F$ over the interval, written $\\big[F(x)\\big]_a^b$' },
    { tex: '\\int_a^x f(t)\\,dt', text: 'the **accumulation function**: the area so far, as a function of the upper limit $x$ ($t$ is a dummy variable)' },
  ],
  why: t`It is the reason physics can work with rates: Newton’s laws give accelerations, and the FTC turns them into the velocities, displacements, work and impulse you can measure.`,
  visual: {
    type: 'graph',
    title: 'The area so far, and its slope',
    lead: t`Blue is a velocity $v(t) = 4t - t^2$ m/s; violet is the position $x(t) = 2t^2 - \tfrac13t^3$ m, an antiderivative with $x(0) = 0$. Drag the gold point along $x(t)$: the shading is the signed area under $v$ from $0$ to that moment.`,
    tasks: [
      'Compare the first two readouts: the accumulated area always equals x(t) − x(0). That is Part 2.',
      'Compare the last two: the slope of the violet curve equals the height of the blue one. That is Part 1.',
      'Drag past t = 4: v turns negative, the new area is red, and the position starts to fall back. At t = 6 the net area is 0 — the object is back where it began.',
    ],
    params: {
      x: [-0.3, 6.6], y: [-13, 12.5], aspect: 'wide', xlabel: 't (s)', ylabel: '',
      curves: [
        { fn: '4*x - x^2', color: 'accent', label: 'v (m/s)', labelAt: 1.2, labelDx: -66, labelDy: -6 },
        { fn: '2*x^2 - x^3/3', color: 'violet', label: 'x (m)', labelAt: 5.3, labelDx: 8, labelDy: -2 },
      ],
      shade: [{ fn: 'max(4*x - x^2, 0)', from: 0, to: 'x0', color: 'accent', alpha: 0.25 }, { fn: 'min(4*x - x^2, 0)', from: 0, to: 'x0', color: 'bad', alpha: 0.25 }],
      integral: { fn: '4*x - x^2', from: 0, to: 'x0' },
      tangent: { fn: '2*x^2 - x^3/3', at: 2.5 },
      readouts: [
        { label: t`area $\int_0^t v\,dt$`, expr: 'integral', unit: t`\mathrm{m}`, digits: 4 },
        { label: t`$x(t) - x(0)$`, expr: '2*x0^2 - x0^3/3', unit: t`\mathrm{m}`, digits: 4 },
        { label: t`slope of $x$`, expr: 'slope', unit: t`\mathrm{m/s}`, digits: 4 },
        { label: t`$v(t)$`, expr: '4*x0 - x0^2', unit: t`\mathrm{m/s}`, digits: 4 },
      ],
    },
    caption: 'Velocity and position share one set of axes, in different units. The area is computed numerically, the position from the formula — they agree.',
  },
  example: {
    prompt: t`A flight-data recorder’s airspeed log for an airliner’s take-off roll is fitted well by $v(t) = 3.0t - 0.025t^2$ m/s, from brake release ($t = 0$) to rotation at $t = 35$ s. How much runway does the roll use?`,
    visual: areaFig({ fn: '3*x - 0.025*x^2', x: [-1, 38], y: [-4, 85], from: 0, to: 35, signed: false, xlabel: 't (s)', ylabel: 'v (m/s)', domain: [0, 36], caption: t`The fitted velocity. The shaded area is the distance rolled. Wind and runway slope are ignored; airspeed equals ground speed only in still air.` }),
    steps: [
      { label: 'Set up', text: t`Displacement is the integral of velocity: $\Delta x = \displaystyle\int_0^{35} (3.0t - 0.025t^2)\,dt$. Since $v > 0$ throughout, this is also the distance.` },
      { label: 'Antiderivative', text: t`$F(t) = 1.5t^2 - \dfrac{0.025}{3}t^3$. Any $+C$ would cancel, so leave it out.` },
      { label: 'Evaluate', text: t`$F(35) - F(0) = 1.5(1225) - \dfrac{0.025}{3}(42\,875) - 0 = 1837.5 - 357.3 = ${thou(xTO(35))}$ m.` },
      { label: 'Sense check', text: t`Rotation speed $v(35) = ${nice(vTO(35), 4)}$ m/s ($\approx 145$ knots) and about $1.5$ km of runway are typical of an A320-class jet. A constant acceleration reaching the same speed would roll $\tfrac12\cdot 74.4\cdot 35 = 1302$ m; this roll accelerates harder at first, so it covers more ground.` },
    ],
    answer: t`About $${thou(xTO(35))}$ m of runway.`,
  },
  practice: [
    num({
      id: 'cos-k', difficulty: 1,
      gen(r) {
        const k = r.int(2, 5);
        return {
          prompt: t`Evaluate $\displaystyle\int_0^{\pi/${2 * k}} \cos(${k}x)\,dx$.`,
          answer: 1 / k, tol: { rel: 0.002 },
          integrand: `cos(${k}*x)`, limits: [0, Math.PI / (2 * k)],
          errors: [{ value: k, feedback: t`An antiderivative of $\cos(${k}x)$ is $\tfrac1{${k}}\sin(${k}x)$: divide by $${k}$.` }],
          hints: [t`$F(x) = \tfrac1{${k}}\sin(${k}x)$.`, t`$F\!\left(\tfrac{\pi}{${2 * k}}\right) - F(0) = \tfrac1{${k}}\sin\tfrac\pi2 - 0$.`],
          teach: 'FTC Part 2: find any antiderivative, evaluate at the top limit, subtract its value at the bottom.',
          explain: t`$\left[\tfrac1{${k}}\sin(${k}x)\right]_0^{\pi/${2 * k}} = \tfrac1{${k}}(1 - 0) = ${nice(1 / k, 4)}$.`,
          visual: areaFig({ fn: `cos(${k}*x)`, x: [-0.1, 2.2 * Math.PI / (2 * k) + 0.2], y: [-1.2, 1.25], from: 0, to: Math.PI / (2 * k), caption: t`$y = \cos(${k}x)$, shaded from $0$ to its first zero.` }),
        };
      },
    }),
    num({
      id: 'inv-sqrt', difficulty: 2,
      gen(r) {
        const n = r.int(2, 5), b = n * n;
        return {
          prompt: t`Evaluate $\displaystyle\int_1^{${b}} \frac{dx}{\sqrt{x}}$.`,
          answer: 2 * (n - 1), tol: { rel: 0.002 },
          integrand: '1/sqrt(x)', limits: [1, b],
          errors: [{ value: (n - 1) / 2, feedback: t`$\int x^{-1/2}dx = \dfrac{x^{1/2}}{1/2} = 2\sqrt x$: dividing by $\tfrac12$ doubles.` }],
          hints: [t`Write $\dfrac1{\sqrt x} = x^{-1/2}$; an antiderivative is $2x^{1/2}$.`],
          teach: 'Rewrite roots as powers, apply the power rule backwards, then evaluate between the limits.',
          explain: t`$\left[2\sqrt x\right]_1^{${b}} = 2\cdot${n} - 2\cdot1 = ${2 * (n - 1)}$.`,
          visual: areaFig({ fn: '1/sqrt(x)', x: [0, b + 1], y: [-0.1, 1.3], from: 1, to: b, domain: [0.25, b + 1], caption: t`$y = 1/\sqrt x$ from $1$ to $${b}$.` }),
        };
      },
    }),
    expr({
      id: 'lower-limit', difficulty: 3,
      prompt: t`Let $G(x) = \displaystyle\int_x^{3} e^{-t^2}\,dt$. Find $G'(x)$.`,
      lhs: "G'(x)",
      answer: '-e^(-x^2)', answerTeX: t`-e^{-x^2}`,
      vars: { x: [-2, 2] }, derivativeOf: 'sqrt(pi)/2*(erf(3) - erf(x))',
      errors: [{ answer: 'e^(-x^2)', feedback: t`The variable is the **lower** limit. Flip it first: $G(x) = -\int_3^x e^{-t^2}dt$.` }, { answer: 'e^(-9) - e^(-x^2)', feedback: t`The upper limit $3$ is a constant; it contributes nothing to the derivative.` }],
      hints: [t`Swap the limits: $\int_x^3 = -\int_3^x$.`, t`By Part 1, $\dfrac{d}{dx}\int_3^x e^{-t^2}dt = e^{-x^2}$.`],
      teach: t`$\frac{d}{dx}\int_x^b f(t)\,dt = -f(x)$: moving the lower limit right removes area.`,
      explain: t`$G(x) = -\int_3^x e^{-t^2}dt$, so $G'(x) = -e^{-x^2}$. Even though $e^{-t^2}$ has no elementary antiderivative, the FTC gives this derivative at once.`,
      visual: areaFig({ fn: 'e^(-x^2)', x: [-1, 3.4], y: [-0.1, 1.15], from: 0.6, to: 3, signed: false, more: { vlines: [{ x: 0.6, label: 'x' }, { x: 3, label: '3' }] }, caption: t`$G(x)$ is the shaded area from $x$ to $3$. Slide $x$ to the right and the area shrinks at the rate $e^{-x^2}$.` }),
    }),
    num({
      id: 'isothermal-work', difficulty: 2,
      gen(r) {
        const C = r.pick([800, 1200, 2000]), V1 = r.pick([1, 2]), k = r.pick([2, 3, 4]), V2 = V1 * k, W = C * Math.log(k);
        return {
          prompt: t`Nitrogen in a cylinder expands slowly at constant temperature, so $pV$ stays at $${C}$ J. The work it does is $W = \displaystyle\int_{V_1}^{V_2} p\,dV$. Find $W$ as it expands from $${V1}$ L to $${V2}$ L.`,
          answer: W, units: 'J', tol: { rel: 0.003 },
          integrand: `${C}/x`, limits: [V1, V2],
          errors: [{ value: C * (V2 - V1), feedback: t`$p = ${C}/V$ is not constant: integrate $\dfrac{${C}}{V}$, which gives a logarithm.` }],
          hints: [t`$p = \dfrac{${C}}{V}$, so $W = ${C}\displaystyle\int_{${V1}}^{${V2}} \frac{dV}{V}$.`, t`$\int\frac{dV}{V} = \ln V$; only the ratio $V_2/V_1$ matters, so litres are fine.`],
          teach: t`Work is the area under the $p$–$V$ curve; for an isothermal ideal gas it is $pV\ln(V_2/V_1)$.`,
          explain: t`$W = ${C}\,[\ln V]_{${V1}}^{${V2}} = ${C}\ln ${k} = ${thou(W)}$ J. Doubling the volume always yields $pV\ln 2$, whatever the starting size.`,
          visual: areaFig({ fn: `${C}/x`, x: [0, V2 + 1], y: [0, 1.1 * C / V1], from: V1, to: V2, signed: false, xlabel: 'V (L)', ylabel: 'p (J/L = kPa)', domain: [0.6 * V1, V2 + 1], caption: 'The isotherm p = C/V; the shaded area is the work done. An ideal gas, expanding slowly enough to stay at one temperature.' }),
        };
      },
    }),
    num({
      id: 'half-sine-impulse', difficulty: 2,
      gen(r) {
        const F = r.pick([60, 80, 120]), T = r.pick([0.05, 0.08, 0.1]), J = 2 * F * T / Math.PI;
        return {
          prompt: t`A spring separation system pushes a small satellite away from its upper stage with force $F(t) = ${F}\sin(\pi t/${T})$ N for $0 \le t \le ${T}$ s. What impulse $J = \displaystyle\int_0^{${T}} F\,dt$ does it deliver, in N·s?`,
          answer: J, units: 'N s', tol: { rel: 0.003 },
          integrand: `${F}*sin(pi*x/${T})`, limits: [0, T],
          errors: [{ value: F * T, feedback: 'That is peak force × time, a rectangle. The force is only at its peak for an instant.' }, { value: F * T / Math.PI, feedback: t`$\left[-\cos(\pi t/${T})\right]_0^{${T}} = -(-1) + 1 = 2$, not $1$.` }],
          hints: [t`An antiderivative of $\sin(\pi t/T)$ is $-\dfrac{T}{\pi}\cos(\pi t/T)$.`, t`$J = ${F}\cdot\dfrac{${T}}{\pi}\left[-\cos(\pi t/${T})\right]_0^{${T}} = ${F}\cdot\dfrac{${T}}{\pi}\cdot 2$.`],
          teach: 'Impulse is the area under the force–time curve; for a half-sine pulse it is 2/π ≈ 64% of peak force × duration.',
          explain: t`$J = \dfrac{2\cdot${F}\cdot${T}}{\pi} = ${nice(J, 4)}$ N·s. For a $4$ kg CubeSat that is a separation speed of $${nice(J / 4, 3)}$ m/s.`,
          visual: areaFig({ fn: `${F}*sin(pi*x/${T})`, x: [-0.05 * T, 1.1 * T], y: [-0.06 * F, 1.15 * F], from: 0, to: T, signed: false, xlabel: 't (s)', ylabel: 'F (N)', domain: [0, T], caption: 'An idealized half-sine push; real separation springs give a force that falls off as they extend.' }),
        };
      },
    }),
    mcq({
      id: 'find-error-discont', difficulty: 3, kind: 'error',
      prompt: t`A student writes $\displaystyle\int_{-1}^{1}\frac{dx}{x^2} = \left[-\frac1x\right]_{-1}^{1} = -1 - 1 = -2.$ What is wrong?`,
      visual: curveFig({ fn: '1/x^2', x: [-1.6, 1.6], y: [-0.5, 9], domain: [-1.6, 1.6], caption: t`$y = 1/x^2$ is positive everywhere and blows up at $x = 0$, inside the interval.` }),
      choices: [
        t`$1/x^2$ is not continuous on $[-1, 1]$, so Part 2 of the FTC does not apply`,
        t`The antiderivative should be $\ln(x^2)$`,
        t`The arithmetic: $-1 - (-1) = 0$, so the integral is $0$`,
        'Nothing; integrals can be negative',
      ],
      answer: 0,
      why: {
        1: t`$\frac{d}{dx}\ln(x^2) = \frac2x$; the student’s $-\frac1x$ is a correct antiderivative wherever it is defined.`,
        2: t`$\left[-\frac1x\right]_{-1}^{1} = (-1) - (1) = -2$; the arithmetic is right. The method is not.`,
        3: t`A positive integrand cannot have a negative integral. That contradiction is the red flag.`,
      },
      hints: ['Can the integral of a positive function be negative?', 'What does the FTC require of f on the whole interval?'],
      teach: 'Check that the integrand is continuous on the whole interval before using F(b) − F(a).',
      explain: t`The FTC needs $f$ continuous on $[-1, 1]$, and $1/x^2$ is infinite at $0$. In fact the area is infinite: the integral diverges (an improper integral — Calculus II).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-poly', difficulty: 2,
      gen(r) {
        const b = r.int(2, 4), c = r.int(2, 5), F = (x) => x ** 3 - 2 * x * x + c * x, I = F(b) - F(1);
        return {
          prompt: t`Evaluate $\displaystyle\int_1^{${b}} (3x^2 - 4x + ${c})\,dx$.`,
          answer: I, tol: { rel: 0.002 },
          integrand: `3x^2 - 4x + ${c}`, limits: [1, b],
          errors: [{ value: F(b), feedback: t`Subtract $F(1)$ too: the lower limit is $1$, not $0$.` }],
          hints: [t`$F(x) = x^3 - 2x^2 + ${c}x$.`],
          teach: 'Evaluate the antiderivative at both limits; the lower one matters unless F there is 0.',
          explain: t`$F(${b}) - F(1) = ${F(b)} - ${F(1)} = ${I}$.`,
          visual: areaFig({ fn: `3*x^2 - 4*x + ${c}`, x: [0, b + 0.4], y: [-0.5, 3 * b * b - 4 * b + c + 2], from: 1, to: b, caption: t`$y = 3x^2 - 4x + ${c}$ from $1$ to $${b}$.` }),
        };
      },
    }),
    num({
      id: 'cp-cubesat-dv', difficulty: 3, transfer: true,
      gen(r) {
        const Fm = r.pick([0.05, 0.08, 0.12]), T = r.pick([1.5, 2, 3]), m = r.pick([3, 4, 6]), J = 2 * Fm * T / 3, dv = J / m * 1000;
        return {
          prompt: t`A CubeSat of mass $${m}$ kg fires a cold-gas thruster whose force rises and falls as $F(t) = ${nice(4 * Fm / (T * T), 4)}\,t\,(${T} - t)$ N for $0 \le t \le ${T}$ s (peak $${Fm}$ N). Using $\Delta v = \dfrac{1}{m}\displaystyle\int F\,dt$, find its change in speed, in mm/s.`,
          answer: dv, units: 'mm/s', tol: { rel: 0.004 },
          errors: [{ value: Fm * T / m * 1000, feedback: 'That uses the peak force for the whole pulse. Integrate the actual force.' }, { value: J * 1000, feedback: t`That is the impulse in mN·s. Divide by the mass, $${m}$ kg.` }],
          hints: [t`$\displaystyle\int_0^{${T}} t(${T} - t)\,dt = \left[\tfrac{${T}}{2}t^2 - \tfrac13t^3\right]_0^{${T}} = \tfrac{${T}^3}{6}$.`, t`Impulse $J = ${nice(4 * Fm / (T * T), 4)}\times\tfrac{${T}^3}{6} = ${nice(J, 4)}$ N·s; then $\Delta v = J/m$.`],
          teach: 'Impulse = ∫F dt = change in momentum; divide by the mass for the change in velocity.',
          explain: t`$J = \tfrac23\cdot${Fm}\cdot${T} = ${nice(J, 4)}$ N·s, so $\Delta v = ${nice(J, 4)}/${m} = ${nice(dv / 1000, 3)}$ m/s $= ${nice(dv, 3)}$ mm/s — a typical attitude or spacing trim. The propellant used is ignored; it is a tiny fraction of the mass.`,
          visual: areaFig({ fn: `${N(4 * Fm / (T * T))}*x*(${T} - x)`, x: [-0.05 * T, 1.1 * T], y: [-0.06 * Fm, 1.2 * Fm], from: 0, to: T, signed: false, xlabel: 't (s)', ylabel: 'F (N)', domain: [0, T], caption: 'The modelled thrust pulse. Real valve openings are closer to a square pulse with soft edges.' }),
        };
      },
    }),
    expr({
      id: 'cp-ftc1-both', difficulty: 3,
      prompt: t`Find $\dfrac{d}{dx}\displaystyle\int_x^{2x} e^{-t^2}\,dt$.`,
      answer: '2e^(-4x^2) - e^(-x^2)', answerTeX: t`2e^{-4x^2} - e^{-x^2}`,
      vars: { x: [-1.5, 1.5] }, derivativeOf: 'sqrt(pi)/2*(erf(2x) - erf(x))',
      errors: [{ answer: 'e^(-4x^2) - e^(-x^2)', feedback: t`The chain rule on the upper limit $2x$ brings a factor $2$.` }, { answer: '2e^(-4x^2)', feedback: 'The lower limit moves too; it contributes −f(x).' }],
      hints: [t`Split at a constant: $\int_x^{2x} = \int_0^{2x} - \int_0^{x}$.`, t`$\dfrac{d}{dx}\int_0^{2x} e^{-t^2}dt = e^{-(2x)^2}\cdot 2$ (chain rule).`],
      teach: t`$\frac{d}{dx}\int_{g(x)}^{h(x)} f(t)\,dt = f(h(x))\,h'(x) - f(g(x))\,g'(x)$.`,
      explain: t`$e^{-4x^2}\cdot2 - e^{-x^2}\cdot1 = 2e^{-4x^2} - e^{-x^2}$: what enters at the top minus what leaves at the bottom.`,
      visual: areaFig({ fn: 'e^(-x^2)', x: [-0.3, 2.2], y: [-0.08, 1.15], from: 0.6, to: 1.2, signed: false, more: { vlines: [{ x: 0.6, label: 'x' }, { x: 1.2, label: '2x' }] }, caption: t`The area from $x$ to $2x$ (here $x = 0.6$). Both edges move as $x$ changes, the right one twice as fast.` }),
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §5.3 The Fundamental Theorem of Calculus', url: 'https://openstax.org/books/calculus-volume-1/pages/5-3-the-fundamental-theorem-of-calculus' }],
});
