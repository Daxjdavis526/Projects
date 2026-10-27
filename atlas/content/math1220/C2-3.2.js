// Separable equations: gather the y's with dy, the t's with dt, integrate both sides.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';

const t = String.raw;
const GM = 3.986004418e14, RE = 6.371e6;   // Earth: GM in m^3/s^2 and mean radius in m (NASA fact sheet)

export default lesson({
  id: 'math1220.C2-3.2',
  title: 'Separable equations',
  minutes: 11, difficulty: 2,
  intro: t`A first-order equation is **separable** when its right side is a function of $t$ times a function of $y$. Then you can gather every $y$ with $dy$, every $t$ with $dt$, and integrate each side on its own:

$$\frac{dy}{dt} = g(t)\,h(y) \quad\Longrightarrow\quad \int \frac{dy}{h(y)} = \int g(t)\,dt$$

That one move solves radioactive decay, Newton’s law of cooling, a draining tank and a coasting rocket. Every value where $h(y) = 0$ is also a constant solution, and dividing by $h(y)$ quietly loses it — check for those separately.`,
  symbols: [
    { tex: t`g(t)`, text: 'the factor that depends only on the independent variable $t$' },
    { tex: t`h(y)`, text: 'the factor that depends only on the unknown $y$; its zeros are the **equilibrium** (constant) solutions' },
    { tex: t`\int \frac{dy}{h(y)}`, text: 'an ordinary integral in $y$ alone — any technique from the last module may be needed here' },
    { tex: t`C`, text: 'the single constant of integration: the constants from the two sides combine into one, fixed later by the initial condition' },
  ],
  why: t`Separation turns a differential equation into two ordinary integrals, so every integration technique you have learned becomes a way to solve dynamics problems.`,
  visual: {
    type: 'phase',
    title: 'A draining tank empties in finite time',
    lead: t`A tank drains through a hole in its base. Torricelli’s law says water leaves at speed $\sqrt{2gy}$, so the depth $y$ obeys $\dfrac{dy}{dt} = -k\sqrt{y}$ — separable, with $g(t) = -k$ and $h(y) = \sqrt{y}$. Drag the ringed start point to set the initial depth.`,
    tasks: [
      'Start at a depth of 4 m: the curve meets y = 0 at a finite time. The tank really empties — exponential decay never does.',
      'Start at 1 m instead: a quarter of the depth drains in half the time, because the emptying time grows like the square root of the depth.',
      'Halve k (a smaller hole): it takes twice as long.',
    ],
    params: {
      slope: true, f: '-k*sqrt(max(y, 0))', x: [0, 8], y: [0, 5], start: [0, 4], h: 0.5,
      sliders: [{ key: 'k', label: 'Drain constant $k$', min: 0.2, max: 1.5, step: 0.05, value: 0.8, unit: t`\text{m}^{1/2}/\text{min}`, explain: 'Set by the ratio of hole area to tank area: a bigger hole drains faster.' }],
    },
    caption: t`Depth $y$ in metres, time $t$ in minutes. Torricelli’s law ignores viscosity and the narrowing of the jet; a real sharp-edged hole passes about 60% of the ideal flow, which is folded into $k$. Blue: an accurate (RK4) solution; orange: Euler’s method with step $h$.`,
  },
  example: {
    prompt: t`A tank’s depth obeys $\dfrac{dy}{dt} = -0.4\sqrt{y}$ ($y$ in m, $t$ in min) and starts at $y(0) = 4$ m. Find $y(t)$ and the time at which the tank is empty.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 14], y: [0, 4.5], xlabel: 't (min)', ylabel: 'y (m)',
        curves: [
          { fn: '4*exp(-0.2x)', color: 'ink3', dash: true, width: 1.6, label: 'decay ∝ y', labelAt: 9 },
          { fn: '(2 - 0.2x)^2', domain: [0, 10], color: 'gold', label: 'y = (2 − 0.2t)²', labelAt: 3 },
          { fn: '0', domain: [10, 14], color: 'gold' },
        ],
        points: [{ x: 10, y: 0, color: 'gold', label: 'empty at t = 10 min' }],
      },
      caption: t`Gold: the separable solution, which reaches zero at $t = 10$ min and stays there. Dashed: exponential decay with the same starting rate, which never reaches zero.`,
    },
    steps: [
      { label: 'Separate', text: t`Divide by $\sqrt{y}$ (allowed while $y > 0$) and multiply by $dt$: $\;\dfrac{dy}{\sqrt{y}} = -0.4\,dt$.` },
      { label: 'Why this is allowed', text: t`It is shorthand for the chain rule: the equation says $y^{-1/2}\,\frac{dy}{dt} = -0.4$, and integrating both sides in $t$ with the substitution $u = y(t)$ gives exactly $\int y^{-1/2}\,dy = \int -0.4\,dt$.` },
      { label: 'Integrate both sides', text: t`$\displaystyle\int y^{-1/2}\,dy = 2\sqrt{y}$ and $\displaystyle\int -0.4\,dt = -0.4t$, so $2\sqrt{y} = -0.4t + C$. One constant is enough.` },
      { label: 'Initial condition', text: t`At $t = 0$, $y = 4$: $\;2\sqrt{4} = C$, so $C = 4$ and $\sqrt{y} = 2 - 0.2t$, that is $y = (2 - 0.2t)^2$.` },
      { label: 'When is it empty?', text: t`$y = 0$ when $2 - 0.2t = 0$: $t = 10$ min. After that the tank stays empty, $y = 0$ — the formula $(2 - 0.2t)^2$ would climb again, but only while $2 - 0.2t \ge 0$ is it the square root we started from.` },
      { label: 'Check', text: t`$\dfrac{d}{dt}(2 - 0.2t)^2 = 2(2 - 0.2t)(-0.2) = -0.4\,(2 - 0.2t) = -0.4\sqrt{y}$ ✓` },
    ],
    answer: t`$y = (2 - 0.2t)^2$ m for $0 \le t \le 10$ min; the tank is empty at $t = 10$ min.`,
  },
  practice: [
    multi({
      id: 'which-separable', difficulty: 1,
      prompt: 'Which of these equations are separable? Select all that are.',
      choices: [t`$\dfrac{dy}{dt} = t\,y^2$`, t`$\dfrac{dy}{dt} = e^{t + y}$`, t`$\dfrac{dy}{dt} = t + y$`, t`$\dfrac{dy}{dt} = \sin(ty)$`, t`$\dfrac{dy}{dt} = \dfrac{y^2 - 1}{t}$`],
      answer: [0, 1, 4],
      why: {
        2: t`$t + y$ is a sum, and no rearrangement turns it into (function of $t$)·(function of $y$). It is a *linear* equation — next lesson but one.`,
        3: t`$\sin(ty)$ does not split into a factor of $t$ times a factor of $y$.`,
      },
      hints: ['Ask of each right side: can it be written as (something with only t) × (something with only y)?', t`Exponentials of sums are products in disguise: $e^{t+y} = e^t e^y$.`],
      teach: 'An equation is separable when its right side factors into a function of t times a function of y.',
      explain: t`$ty^2 = t\cdot y^2$, $\;e^{t+y} = e^t\cdot e^y$ and $\dfrac{y^2-1}{t} = \dfrac1t\cdot(y^2-1)$ all factor; $t + y$ and $\sin(ty)$ do not.`,
    }),
    expr({
      id: 'kty', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 4]), y0 = r.int(2, 4);
        const half = k / 2;
        const kt2 = half === 0.5 ? t`\tfrac12 t^2` : half === 1 ? t`t^2` : t`${half}t^2`;   // the integral of k t
        const eT = half === 0.5 ? t`e^{t^2/2}` : half === 1 ? t`e^{t^2}` : t`e^{${half}t^2}`;
        const kT = k === 1 ? '' : String(k);
        const yEnd = y0 * Math.exp(half);
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = ${kT}ty$ with $y(0) = ${y0}$.`,
          answer: `${y0}*exp(${half}*t^2)`, answerTeX: t`y = ${y0}${eT}`,
          vars: { t: [-1, 1] }, lhs: 'y',
          errors: [
            { answer: `${y0}*exp(${k}*t^2)`, feedback: t`Check the integral: $\int ${kT}t\,dt = ${kt2}$, not $${kT}t^2$.` },
            { answer: `exp(${half}*t^2) + ${y0 - 1}`, feedback: t`Exponentiating $\ln|y| = ${kt2} + C$ gives $y = e^{C}${eT}$: the constant **multiplies**, it does not add.` },
          ],
          hints: [t`Separate: $\dfrac{dy}{y} = ${kT}t\,dt$.`, t`Integrate: $\ln|y| = ${kt2} + C$, so $y = A${eT}$ with $A = \pm e^C$.`, t`Use $y(0) = ${y0}$: $e^0 = 1$, so $A = ${y0}$.`],
          teach: 'After separating and integrating, exponentiate: the constant of integration becomes a multiplying constant.',
          explain: t`$\int\frac{dy}{y} = \int ${kT}t\,dt$ gives $\ln|y| = ${kt2} + C$, so $y = A${eT}$, and $y(0) = A = ${y0}$.`,
          visual: { type: 'phase', params: { slope: true, f: `${k}*t*y`, x: [0, 1], y: [0, Math.ceil(yEnd * 1.15)], start: [0, y0], h: 0.25 }, caption: t`The slope field of $y' = ${kT}ty$ with the solution through $(0, ${y0})$.` },
        };
      },
    }),
    expr({
      id: 't-over-y', difficulty: 2,
      gen(r) {
        const a = r.int(2, 4);
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = \dfrac{t}{y}$ with $y(0) = ${a}$.`,
          answer: `sqrt(t^2 + ${a * a})`, answerTeX: t`y = \sqrt{t^2 + ${a * a}}`,
          vars: { t: [-2, 2] }, lhs: 'y',
          errors: [
            { answer: `t + ${a}`, feedback: t`$\sqrt{t^2 + ${a * a}}$ is not $t + ${a}$: a square root does not split over a sum.` },
            { answer: `sqrt(t^2 + ${a})`, feedback: t`The initial condition fixes $y^2$: at $t = 0$, $y^2 = ${a}^2 = ${a * a}$.` },
          ],
          hints: [t`Multiply both sides by $y\,dt$: $\;y\,dy = t\,dt$.`, t`Integrate: $\tfrac12 y^2 = \tfrac12 t^2 + C$, so $y^2 = t^2 + 2C$. Use $y(0) = ${a}$, then take the positive root.`],
          teach: 'Separation can give the solution implicitly first; solve for y at the end and use the initial condition to pick the right root.',
          explain: t`$y\,dy = t\,dt \Rightarrow y^2 = t^2 + K$; $y(0) = ${a}$ gives $K = ${a * a}$, and $y > 0$ picks $y = \sqrt{t^2 + ${a * a}}$ — a branch of a hyperbola.`,
          visual: { type: 'phase', params: { slope: true, f: 't/y', x: [0, 3], y: [0, a + 3], start: [0, a], h: 0.5 }, caption: t`The slope field of $y' = t/y$: segments are flat along $t = 0$ and steep near $y = 0$.` },
        };
      },
    }),
    num({
      id: 'cooling-time', difficulty: 2,
      gen(r) {
        const A = r.pick([18, 20, 22]), T0 = r.pick([85, 90, 95]), T1 = r.pick([40, 50, 60]), k = r.pick([0.03, 0.04, 0.05]);
        const time = Math.log((T0 - A) / (T1 - A)) / k;
        return {
          prompt: t`Coffee at ${T0} °C sits in a room at ${A} °C and cools by Newton’s law, $\dfrac{dT}{dt} = -${k}\,(T - ${A})$, with $t$ in minutes. Separate variables to find how long it takes to cool to ${T1} °C.`,
          answer: time, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: Math.log(T0 / T1) / k, feedback: t`You dropped the room temperature. The quantity that decays exponentially is the *difference* $T - ${A}$.` }],
          hints: [t`Separate: $\dfrac{dT}{T - ${A}} = -${k}\,dt$, so $\ln|T - ${A}| = -${k}t + C$.`, t`This gives $T - ${A} = (${T0} - ${A})e^{-${k}t}$. Set $T = ${T1}$ and solve for $t$ with a logarithm.`],
          teach: 'Newton’s law of cooling is separable: the temperature difference from the surroundings decays exponentially.',
          explain: t`$T - ${A} = ${T0 - A}\,e^{-${k}t}$. Setting $T = ${T1}$: $e^{-${k}t} = \frac{${T1 - A}}{${T0 - A}}$, so $t = \frac{1}{${k}}\ln\frac{${T0 - A}}{${T1 - A}} = ${fmt(time, 3)}$ min.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, Math.ceil(time * 1.6 / 10) * 10], y: [0, 100], xlabel: 't (min)', ylabel: 'T (°C)',
              curves: [{ fn: `${A} + ${T0 - A}*exp(-${k}x)`, color: 'accent' }],
              hlines: [{ y: T1, label: `${T1} °C`, color: 'gold' }, { y: A, label: `room ${A} °C`, color: 'ink3' }],
            },
            caption: 'The cooling curve and the target temperature (gold). The crossing is your answer — compute it, then check it against the picture.',
          },
        };
      },
    }),
    mcq({
      id: 'lost-solution', difficulty: 3, kind: 'error',
      prompt: t`A student solves $\dfrac{dy}{dt} = y^2$ like this: $\dfrac{dy}{y^2} = dt$, so $-\dfrac1y = t + C$, so $y = -\dfrac{1}{t + C}$. They conclude that **every** solution has this form. What did they miss?`,
      choices: [
        t`The constant solution $y = 0$, lost when they divided by $y^2$`,
        t`Nothing: $-\frac{1}{t + C} \to 0$ as $C \to \infty$, so $y = 0$ is included`,
        t`The antiderivative of $\frac{1}{y^2}$ is $\ln(y^2)$, not $-\frac1y$`,
        t`The constant should multiply: $y = -\frac{C}{t}$`,
      ],
      answer: 0,
      why: {
        1: t`For every finite $C$, $-\frac{1}{t + C}$ is nonzero. Getting close to 0 as $C$ grows is not the same as being 0: $y = 0$ is a separate solution.`,
        2: t`$\frac{d}{dy}\left(-\frac1y\right) = \frac{1}{y^2}$, so $-\frac1y$ is right; $\ln(y^2)$ differentiates to $\frac{2}{y}$.`,
        3: t`The constant enters through $\int dt = t + C$; it cannot be moved somewhere else afterwards.`,
      },
      hints: [t`Dividing by $y^2$ assumes $y^2 \neq 0$. What if $y$ is zero?`, t`Is $y(t) = 0$ for all $t$ a solution of $y' = y^2$? Can any finite $C$ produce it?`],
      teach: 'Dividing by h(y) assumes h(y) ≠ 0, so the constant solutions where h(y) = 0 must be added back by hand.',
      explain: t`$y = 0$ satisfies $y' = 0 = y^2$, but no finite $C$ gives it. The complete answer is $y = -\frac{1}{t + C}$ **or** $y = 0$. In the slope field it is the flat line of segments along $y = 0$.`,
      visual: { type: 'phase', params: { slope: true, f: 'y^2', x: [-2, 2], y: [-2, 2], start: [-2, -1], h: 0.25 }, caption: t`The slope field of $y' = y^2$. The segments along $y = 0$ are flat: that line is a solution too.` },
    }),
    num({
      id: 'drain-time', difficulty: 3,
      gen(r) {
        const k = r.pick([0.5, 0.8, 1]), y0 = r.pick([1, 2.25, 4]), s = Math.sqrt(y0);
        const T = (2 * s) / k;
        return {
          prompt: t`A tank’s depth obeys $\dfrac{dy}{dt} = -${k}\sqrt{y}$, with $y$ in m and $t$ in min, starting from $y(0) = ${y0}$ m. How long does the tank take to empty?`,
          answer: T, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: s / k, feedback: t`$\int y^{-1/2}\,dy = 2\sqrt{y}$ — you lost the factor of 2.` }, { value: y0 / k, feedback: t`The depth drains like $\sqrt{y}$, not $y$: integrate $y^{-1/2}$.` }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Separate: $y^{-1/2}\,dy = -${k}\,dt$.`, t`Integrate: $2\sqrt{y} = -${k}t + C$, and $y(0) = ${y0}$ gives $C = ${nice(2 * s)}$.`, t`Empty means $y = 0$: solve $0 = -${k}t + ${nice(2 * s)}$.`],
          teach: 'For a separable equation, an event such as “the tank is empty” is a value of y: put it into the implicit solution and solve for t.',
          explain: t`$2\sqrt{y} = ${nice(2 * s)} - ${k}t$, so $y = 0$ at $t = ${nice(2 * s)}/${k} = ${nice(T)}$ min.`,
          visual: { type: 'phase', params: { slope: true, f: `-${k}*sqrt(max(y, 0))`, x: [0, Math.ceil(1.5 * T)], y: [0, Math.ceil(y0 + 1)], start: [0, y0], h: 0.5 }, caption: 'The slope field of the draining tank, with the solution from the starting depth (blue).' },
        };
      },
    }),
    expr({
      id: 'exp-t-minus-y', difficulty: 3,
      gen(r) {
        const c = r.int(1, 3);
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = e^{t - y}$ with $y(0) = \ln ${c + 1}$.`,
          answer: `ln(e^t + ${c})`, answerTeX: t`y = \ln\!\left(e^t + ${c}\right)`,
          vars: { t: [-1, 2] }, lhs: 'y',
          errors: [{ answer: `t + ln(${c + 1})`, feedback: t`$\ln(e^t + ${c})$ is not $t + \ln ${c + 1}$: a logarithm does not split over a sum.` }, { answer: `t + ${c}`, feedback: t`$\ln(e^t + ${c}) \neq \ln(e^t) + ${c}$.` }],
          hints: [t`$e^{t - y} = e^t e^{-y}$, so multiply both sides by $e^{y}\,dt$: $\;e^y\,dy = e^t\,dt$.`, t`Integrate: $e^y = e^t + C$. At $t = 0$, $e^{y} = ${c + 1}$, so $C = ${c}$.`],
          teach: 'Split an exponential of a sum into a product before separating.',
          explain: t`$e^y\,dy = e^t\,dt \Rightarrow e^y = e^t + C$; $y(0) = \ln ${c + 1}$ gives $${c + 1} = 1 + C$, so $C = ${c}$ and $y = \ln(e^t + ${c})$.`,
          visual: { type: 'phase', params: { slope: true, f: 'exp(t - y)', x: [0, 2], y: [0, 3], start: [0, Math.log(c + 1)], h: 0.5 }, caption: t`The slope field of $y' = e^{t-y}$: steep where $y$ is small compared with $t$, flat where it is large.` },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-first-step', difficulty: 2,
      visual: { type: 'phase', params: { slope: true, f: 'y^2*sin(t)', x: [0, 6], y: [-2, 2], start: [0, 0.3], h: 0.5 }, caption: t`The slope field of $y' = y^2\sin t$: the slopes depend on both $t$ and $y$, but only through the product of a $t$-part and a $y$-part.` },
      prompt: t`To solve $\dfrac{dy}{dt} = y^2\sin t$ by separating variables, which first step is right?`,
      choices: [t`$\dfrac{dy}{y^2} = \sin t\,dt$`, t`$y^2\,dy = \sin t\,dt$`, t`$\dfrac{dy}{\sin t} = y^2\,dt$`, t`$y = \int y^2\sin t\,dt = -y^2\cos t + C$`],
      answer: 0,
      why: {
        1: t`To move $y^2$ to the $dy$ side you divide by it; multiplying puts it there squared twice over.`,
        2: t`That gathers $t$ with $dy$ and $y$ with $dt$ — exactly backwards.`,
        3: t`$y$ changes with $t$, so you cannot integrate $y^2\sin t$ in $t$ as if $y$ were a constant. Separate first.`,
      },
      hints: ['Every factor containing y goes with dy; every factor containing t goes with dt.'],
      teach: 'Separate before integrating: divide by the y-factor and multiply by dt.',
      explain: t`Dividing by $y^2$ and multiplying by $dt$ gives $y^{-2}\,dy = \sin t\,dt$; integrating, $-\frac1y = -\cos t + C$. (And $y = 0$ is a solution too.)`,
    }),
    expr({
      id: 'cp-tan', difficulty: 3,
      gen(r) {
        const k = r.int(2, 4);
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = ${k}\,(1 + y^2)$ with $y(0) = 0$.`,
          answer: `tan(${k}*t)`, answerTeX: t`y = \tan(${k}t)`,
          vars: { t: [-0.4 / k, 0.4 / k] }, lhs: 'y',
          errors: [{ answer: `${k}*tan(t)`, feedback: t`Solve $\arctan y = ${k}t$ by taking the tangent of both sides: the ${k} stays inside.` }, { answer: `atan(${k}*t)`, feedback: t`$\int\frac{dy}{1+y^2} = \arctan y$; to solve for $y$, apply $\tan$, the inverse of $\arctan$.` }, { answer: 'tan(t)', feedback: t`The right side integrates to $${k}t$, not $t$.` }],
          hints: [t`Separate: $\dfrac{dy}{1 + y^2} = ${k}\,dt$.`, t`$\int\frac{dy}{1+y^2} = \arctan y$, so $\arctan y = ${k}t + C$; $y(0) = 0$ gives $C = 0$.`],
          teach: 'An integral that gives an inverse function, such as arctan, is undone by applying the function itself.',
          explain: t`$\arctan y = ${k}t$, so $y = \tan(${k}t)$. It blows up at $t = \frac{\pi}{${2 * k}}$: a solution of a perfectly smooth equation can escape to infinity in finite time.`,
          visual: { type: 'phase', params: { slope: true, f: `${k}*(1 + y^2)`, x: [0, 1], y: [-1, 6], start: [0, 0], h: 0.1 }, caption: t`The slope field of $y' = ${k}(1 + y^2)$: the slope grows like $y^2$, so the solution shoots off to infinity.` },
        };
      },
    }),
    num({
      id: 'cp-coast', difficulty: 3, transfer: true,
      gen(r) {
        const v0 = r.pick([10, 10.5, 11, 12]), m = r.pick([2, 3, 4]);
        const v = Math.sqrt((v0 * 1e3) ** 2 - 2 * GM * (1 / RE - 1 / (m * RE))) / 1e3;
        const half = Math.sqrt((v0 * 1e3) ** 2 - GM * (1 / RE - 1 / (m * RE))) / 1e3;
        return {
          prompt: t`After burnout, a probe coasts straight up, away from Earth. Ignoring air drag and Earth’s rotation, its speed $v$ and its distance $r$ from Earth’s centre obey $v\,\dfrac{dv}{dr} = -\dfrac{GM}{r^2}$ (Newton’s gravity, with $\frac{dv}{dt} = v\frac{dv}{dr}$ by the chain rule), where $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$. At Earth’s surface, $r = R_E = 6.371\times10^{6}$ m, its speed is $${v0}$ km/s. Separate the variables to find its speed at $r = ${m}R_E$.`,
          answer: v, units: 'km/s', tol: { rel: 0.01 },
          errors: [{ value: half, feedback: t`$\int v\,dv = \tfrac12 v^2$: the $\tfrac12$ doubles the gravity term when you solve for $v^2$.` }, { value: v0 / m, feedback: t`Speed does not fall like $1/r$; integrate the equation.` }].filter((e) => Math.abs(e.value - v) > 0.03 * v),
          hints: [t`Separate: $v\,dv = -GM\,r^{-2}\,dr$, then integrate: $\tfrac12 v^2 = \dfrac{GM}{r} + C$.`, t`Fix $C$ with $v = ${v0}$ km/s at $r = R_E$ (work in m and m/s), so $v^2 = v_0^2 - 2GM\left(\dfrac{1}{R_E} - \dfrac{1}{${m}R_E}\right)$.`],
          teach: 'Separating v dv = −GM r⁻² dr is energy conservation in disguise: ½v² − GM/r stays constant.',
          explain: t`$v^2 = (${v0 * 1e3})^2 - 2(3.986\times10^{14})\left(1 - \tfrac1{${m}}\right)/(6.371\times10^{6}) = ${tex((v * 1e3) ** 2, 4)}\ \text{m}^2/\text{s}^2$, so $v \approx ${fmt(v, 3)}$ km/s. Multiplying $\tfrac12 v^2 - \frac{GM}{r} = \text{const}$ by the mass gives kinetic plus gravitational potential energy: conserved.`,
          visual: { type: 'graph', params: { x: [0.8, 4.6], y: [-70, 5], xlabel: 'r / R_E', ylabel: 'MJ/kg', curves: [{ fn: '-62.57/x', domain: [1, 4.5], color: 'accent', label: 'potential energy per kg, −GM/r', labelAt: 2.2, labelDy: 18 }], vlines: [{ x: 1, label: 'surface', color: 'ink3' }, { x: m, label: `r = ${m}R_E`, color: 'gold' }] }, caption: t`The gravitational potential energy per kilogram, $-GM/r$. The probe climbs this hill from the surface to the gold line, paying for it with kinetic energy.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §4.3 Separable equations', url: 'https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations' },
    { label: 'NASA Earth fact sheet (GM and mean radius)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
  ],
});
