// What a differential equation says: a rule for the slope, read as a slope field.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;
const co = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k));   // coefficient, with 1 and −1 silent

// the y-range a solution of y' = f(t, y) sweeps over [t0, t1], padded (RK4, fine steps)
function span(f, t0, y0, t1) {
  let lo = y0, hi = y0, y = y0, tt = t0;
  const n = 400, h = (t1 - t0) / n;
  for (let i = 0; i < n; i++) {
    const k1 = f(tt, y), k2 = f(tt + h / 2, y + (h * k1) / 2), k3 = f(tt + h / 2, y + (h * k2) / 2), k4 = f(tt + h, y + h * k3);
    y += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6; tt += h;
    lo = Math.min(lo, y); hi = Math.max(hi, y);
  }
  const pad = 0.15 * (hi - lo || 1);
  return [Math.floor(Math.min(0, lo - pad)), Math.ceil(hi + pad)];
}

export default lesson({
  id: 'math1220.C2-3.1',
  title: 'What a differential equation says; slope fields',
  minutes: 10, difficulty: 2,
  intro: t`A **differential equation** is a rule for how a quantity changes. It does not tell you the function — it tells you the *slope* of the function at every point:

$$\frac{dy}{dt} = f(t, y)$$

A **solution** is a function $y(t)$ that obeys the rule at every instant, and an *initial condition* $y(t_0) = y_0$ picks out one solution from a whole family. Drawing the slope $f(t, y)$ as a short segment at many points — a **slope field** — shows the shape of every solution before you solve anything. Physics is written this way: Newton’s second law, cooling, radioactive decay and RC circuits are all differential equations.`,
  symbols: [
    { tex: t`y(t)`, text: 'the unknown function — the quantity that changes: a temperature, a voltage, a velocity' },
    { tex: t`t`, text: 'the independent variable, usually time (here in hours or seconds)' },
    { tex: t`\frac{dy}{dt}`, text: 'the rate of change of $y$ — the slope of the graph of the solution, in units of $y$ per unit of $t$' },
    { tex: t`f(t, y)`, text: 'the rule: tell it where you are, $(t, y)$, and it returns how steep the solution must be there' },
    { tex: t`y(t_0) = y_0`, text: 'an **initial condition**: the solution’s value $y_0$ at a starting time $t_0$, which picks one curve out of the family' },
  ],
  why: t`Most equations in physics are rules for rates — $F = m\,\frac{dv}{dt}$ is one — so reading what a differential equation says is the first step to solving anything in dynamics.`,
  visual: {
    type: 'phase',
    title: 'Newton’s law of cooling as a slope field',
    lead: t`A hot drink in a room at temperature $A$ obeys $\dfrac{dy}{dt} = -k\,(y - A)$. Each short segment is the slope the equation demands at that point. Drag the ringed start point: the blue curve that threads the segments is the solution through it.`,
    tasks: [
      'Drag the start point above and below the room temperature A: every solution heads for the flat line y = A, an equilibrium.',
      'Raise k: the segments steepen and the drink reaches room temperature sooner.',
      'Set the Euler step h to 1: the orange polygon cuts corners and lands off the blue curve; shrink h and it closes in.',
    ],
    params: {
      slope: true, f: '-k*(y - A)', x: [0, 4], y: [0, 100], start: [0, 90], h: 0.5,
      sliders: [
        { key: 'k', label: 'Cooling constant $k$', min: 0.2, max: 1.5, step: 0.05, value: 0.8, unit: t`\text{h}^{-1}`, explain: 'How fast heat leaks out: a thin paper cup has a larger $k$ than an insulated mug.' },
        { key: 'A', label: 'Room temperature $A$', min: 0, max: 40, step: 1, value: 20, unit: t`{}^\circ\text{C}`, explain: 'The temperature the drink is heading towards.' },
      ],
    },
    caption: t`$y$ in °C, $t$ in hours. Segments show direction only; their length means nothing. Blue: an accurate (RK4) solution from the start point. Orange: Euler’s method with step $h$, which follows the slope at the start of each step. The model treats the drink as one well-mixed temperature with constant $k$; real cups also lose heat by evaporation, which makes early cooling faster.`,
  },
  example: {
    prompt: t`Show that $y = 20 + Ce^{-0.8t}$ solves $\dfrac{dy}{dt} = -0.8\,(y - 20)$ for every constant $C$, then find the solution with $y(0) = 90$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 4], y: [0, 120], xlabel: 't (hours)', ylabel: 'y (°C)',
        curves: [
          ...[-20, 0, 30, 100].map((C) => ({ fn: `20 + (${C})*exp(-0.8x)`, color: 'ink3', width: 1.4, dash: true })),
          { fn: '20 + 70*exp(-0.8x)', color: 'gold', label: 'C = 70', labelAt: 1.2 },
        ],
        points: [{ x: 0, y: 90, color: 'gold', label: 'y(0) = 90' }],
      },
      caption: t`The general solution is a family of curves, one for each $C$ (grey, dashed); the initial condition picks the gold one. Every member levels off at the room temperature, 20 °C.`,
    },
    steps: [
      { label: 'Differentiate the candidate', text: t`If $y = 20 + Ce^{-0.8t}$ then $\dfrac{dy}{dt} = -0.8\,Ce^{-0.8t}$ — the 20 is a constant and differentiates to zero.` },
      { label: 'Substitute into the right side', text: t`$-0.8\,(y - 20) = -0.8\,(20 + Ce^{-0.8t} - 20) = -0.8\,Ce^{-0.8t}$.` },
      { label: 'Compare', text: t`Both sides equal $-0.8\,Ce^{-0.8t}$ for every $t$ and every $C$, so the whole family solves the equation. This is the **general solution**.` },
      { label: 'Use the initial condition', text: t`At $t = 0$: $y(0) = 20 + Ce^{0} = 20 + C = 90$, so $C = 70$ and $y = 20 + 70e^{-0.8t}$.` },
      { label: 'Sense check', text: t`As $t \to \infty$, $e^{-0.8t} \to 0$ and $y \to 20$ °C — room temperature, the equilibrium. After one hour $y = 20 + 70e^{-0.8} \approx ${nice(20 + 70 * Math.exp(-0.8), 3)}$ °C, which is what the blue curve in the slope field shows with $k = 0.8$, $A = 20$ and the start at $(0, 90)$.` },
    ],
    answer: t`$y = 20 + 70e^{-0.8t}$ (°C, with $t$ in hours).`,
  },
  practice: [
    mcq({
      id: 'order', difficulty: 1,
      visual: { type: 'oscillator', params: { kind: 'spring', b: 0.4 }, caption: 'The damped spring this equation describes: the spring force −kx and the damping force −b dx/dt together produce the acceleration d²x/dt².' },
      prompt: t`A mass on a spring with damping obeys $m\dfrac{d^2x}{dt^2} + b\dfrac{dx}{dt} + kx = 0$. What is the **order** of this differential equation?`,
      choices: ['Second order', 'First order', 'Third order', 'Zeroth order, because t never appears explicitly'],
      answer: 0,
      why: {
        1: t`$\frac{dx}{dt}$ appears, but the order is set by the **highest** derivative, $\frac{d^2x}{dt^2}$.`,
        2: 'The order is the highest derivative, not the number of terms on the left.',
        3: t`An equation can be second order without $t$ appearing explicitly; that only makes it *autonomous*.`,
      },
      hints: ['Look for the highest derivative of x that appears anywhere in the equation.'],
      teach: 'The order of a differential equation is the order of the highest derivative in it.',
      explain: t`The highest derivative is $\frac{d^2x}{dt^2}$, so the equation is second order — as Newton’s second law always is, because acceleration is the second derivative of position.`,
    }),
    num({
      id: 'verify-r', difficulty: 2,
      gen(r) {
        const r1 = r.int(1, 4), r2 = -r.int(1, 4);
        const b = -(r1 + r2), c = r1 * r2;
        const bT = b === 0 ? '' : b > 0 ? ` + ${co(b)}y'` : ` - ${co(-b)}y'`;
        const eqT = t`y''${bT} - ${co(-c)}y = 0`;
        const polyT = t`r^2${b === 0 ? '' : b > 0 ? ` + ${co(b)}r` : ` - ${co(-b)}r`} - ${-c}`;
        return {
          prompt: t`For which **positive** constant $r$ is $y = e^{rt}$ a solution of $${eqT}$?`,
          answer: r1, tol: { abs: 0.01 },
          errors: [{ value: r2, feedback: t`$r = ${r2}$ also makes $e^{rt}$ a solution, but it is negative; the question asks for the positive one.` }],
          hints: [t`Substitute $y = e^{rt}$, $y' = re^{rt}$ and $y'' = r^2e^{rt}$ into the equation.`, t`Every term then carries a factor $e^{rt}$, which is never zero. Divide it out and solve the quadratic in $r$.`],
          teach: 'To test a proposed solution, substitute it and its derivatives into the equation and check that both sides agree for every t.',
          explain: t`Substituting gives $(${polyT})\,e^{rt} = 0$. Since $e^{rt} \neq 0$, we need $${polyT} = (r - ${r1})(r + ${-r2}) = 0$, so $r = ${r1}$ or $r = ${r2}$. The positive one is $r = ${r1}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, 1], y: [0, 6], xlabel: 't', ylabel: 'y',
              curves: [
                { fn: `exp(${r1}x)`, domain: [-1, Math.min(1, Math.log(6) / r1)], color: 'accent', label: 'a growing solution', labelAt: Math.min(0.9, Math.log(4) / r1), labelDx: -150 },
                { fn: `exp(${r2}x)`, domain: [Math.max(-1, Math.log(6) / r2), 1], color: 'warn', label: 'a decaying solution', labelAt: Math.max(-0.95, Math.log(4) / r2), labelDx: 10 },
              ],
            },
            caption: t`Both exponential solutions of the equation: one grows and one decays. Every solution is a combination of the two.`,
          },
        };
      },
    }),
    num({
      id: 'ivp-c', difficulty: 1,
      gen(r) {
        const A = r.pick([10, 15, 20, 25]), k = r.pick([0.5, 1, 1.5, 2]), y0 = A + r.pick([-10, 10, 30, 50, 70]);
        const fam = [-40, -20, 20, 40, 60, 80];
        const ys = [...fam.map((C) => A + C), y0, A];
        return {
          prompt: t`The general solution of $\dfrac{dy}{dt} = -${co(k)}(y - ${A})$ is $y = ${A} + Ce^{-${co(k)}t}$. Which value of $C$ gives the solution with $y(0) = ${y0}$?`,
          answer: y0 - A, tol: { abs: 1e-6 },
          errors: [{ value: y0, feedback: t`At $t = 0$, $e^{0} = 1$, so $y(0) = ${A} + C$: the ${A} does not vanish.` }, { value: y0 + A, feedback: t`Solve $${A} + C = ${y0}$ by *subtracting* ${A}.` }],
          hints: [t`Put $t = 0$ into the general solution. What is $e^{0}$?`],
          teach: 'An initial condition fixes the constant in the general solution: substitute the starting time and value, then solve for C.',
          explain: t`$y(0) = ${A} + C\,e^{0} = ${A} + C = ${y0}$, so $C = ${y0 - A}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3], y: [Math.min(0, ...ys) - 5, Math.max(...ys) + 10], xlabel: 't', ylabel: 'y',
              curves: fam.map((C) => ({ fn: `${A} + (${C})*exp(-${k}x)`, color: 'ink3', width: 1.3, dash: true })),
              points: [{ x: 0, y: y0, color: 'gold', label: `(0, ${y0})` }],
              hlines: [{ y: A, color: 'ink3' }],
            },
            caption: t`Grey: members of the family $y = ${A} + Ce^{-${co(k)}t}$ for a few values of $C$, all levelling off at $y = ${A}$. The gold dot is the initial condition; the solution you want passes through it.`,
          },
        };
      },
    }),
    mcq({
      id: 'match-field', difficulty: 2,
      prompt: 'Which differential equation produced this slope field?',
      choices: [t`$\dfrac{dy}{dt} = t - y$`, t`$\dfrac{dy}{dt} = y - t$`, t`$\dfrac{dy}{dt} = t + y$`, t`$\dfrac{dy}{dt} = ty$`],
      answer: 0,
      why: {
        1: t`It has the same flat line $y = t$, but the opposite sign: at $(0, 2)$, $y - t = 2$ would make the segment rise, and in the picture it falls.`,
        2: t`Its segments are flat along $y = -t$, not along $y = t$.`,
        3: t`Its segments are flat along *both* axes — the whole line $t = 0$ would be flat.`,
      },
      hints: [t`Find where the segments are horizontal: there $f(t, y) = 0$.`, t`The flat segments lie along $y = t$. Now check the sign at one point, say $(0, 2)$: is that segment rising or falling?`],
      teach: 'Read a slope field by finding where the slope is zero, then checking the sign of the slope on either side.',
      explain: t`The segments are flat along $y = t$ and fall above it, so $f(t, y) = 0$ when $y = t$ and $f < 0$ when $y > t$: that is $f = t - y$. (At $(0, 2)$, $t - y = -2$.)`,
      visual: { type: 'phase', params: { slope: true, f: 't - y', x: [-3, 3], y: [-3, 3], start: [-3, 2.5], h: 0.5 }, caption: 'Read the short segments; the blue curve is one solution and the orange dots one Euler approximation of it.' },
    }),
    mcq({
      id: 'equilibria', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = a + r.int(2, 4), mid = (a + b) / 2;
        return {
          prompt: t`What are the **equilibrium solutions** of $\dfrac{dy}{dt} = (y - ${a})(${b} - y)$?`,
          choices: [t`$y = ${a}$ and $y = ${b}$`, t`$y = -${a}$ and $y = -${b}$`, t`$t = ${a}$ and $t = ${b}$`, t`$y = ${nice(mid)}$ only`],
          answer: 0,
          why: {
            1: t`Sign slip: $y - ${a}$ is zero when $y = +${a}$.`,
            2: t`An equilibrium is a constant *function* $y(t) = c$ — a horizontal line in the slope field — not an instant of time.`,
            3: t`At $y = ${nice(mid)}$ the slope is at its *largest*: that is the vertex of the parabola $(y - ${a})(${b} - y)$, not a zero of it.`,
          },
          hints: ['An equilibrium is a constant solution, so its derivative is zero for all t.', t`Solve $(y - ${a})(${b} - y) = 0$ for $y$.`],
          teach: 'Equilibrium solutions are the constant values of y where the rate of change is zero: horizontal lines in the slope field.',
          explain: t`A constant $y$ has $\frac{dy}{dt} = 0$, so $(y - ${a})(${b} - y) = 0$: $y = ${a}$ or $y = ${b}$. Between them the slope is positive, so solutions climb from $${a}$ towards $${b}$; above $${b}$ they fall back to it. $y = ${b}$ attracts nearby solutions (stable) and $y = ${a}$ repels them (unstable).`,
          visual: { type: 'phase', params: { slope: true, f: `(y - ${a})*(${b} - y)`, x: [0, 4], y: [a - 2, b + 2], start: [0, mid], h: 0.25 }, caption: 'Flat segments mark where the slope is zero. Drag the start point to see which way solutions go.' },
        };
      },
    }),
    num({
      id: 'euler', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2]), q = r.pick([1, -1]), y0 = r.int(1, 3), h = 0.5;
        const f = (tt, y) => p * tt + q * y;
        const y1 = y0 + h * f(0, y0), y2 = y1 + h * f(h, y1);
        const z1 = y0 + f(0, y0), z2 = z1 + f(h, z1);           // forgot to multiply by h
        const big = y0 + 1 * f(0, y0);                          // one step of size 1
        const fT = `${co(p)}t ${q > 0 ? '+' : '-'} y`;
        const errors = [
          { value: big, feedback: 'That is a single step of size 1. With h = 0.5 you take two steps, recomputing the slope after the first.' },
          { value: z2, feedback: t`Each step adds $h$ times the slope, not the slope itself: $y_{n+1} = y_n + h\,f(t_n, y_n)$.` },
        ].filter((e) => Math.abs(e.value - y2) > 0.02 * Math.abs(y2));
        return {
          prompt: t`Use **Euler’s method** with step $h = 0.5$ to estimate $y(1)$ for $\dfrac{dy}{dt} = ${fT}$, $\;y(0) = ${y0}$.`,
          answer: y2, tol: { rel: 0.005, abs: 1e-6 },
          errors,
          hints: [t`Euler’s method: $y_{n+1} = y_n + h\,f(t_n, y_n)$, starting from $(t_0, y_0) = (0, ${y0})$.`, t`First step: $y_1 = ${y0} + 0.5\,f(0, ${y0}) = ${nice(y1)}$ at $t = 0.5$. Now take one more step from $(0.5, ${nice(y1)})$.`],
          teach: 'Euler’s method walks along the slope field in straight steps: each step adds h times the slope at the start of the step.',
          explain: t`$y_1 = ${y0} + 0.5\,(${nice(f(0, y0))}) = ${nice(y1)}$, then $y_2 = ${nice(y1)} + 0.5\,(${nice(f(h, y1))}) = ${nice(y2)}$. So $y(1) \approx ${nice(y2)}$.`,
          visual: { type: 'phase', params: { slope: true, f: `${p}*t ${q > 0 ? '+' : '-'} y`, x: [0, 1.5], y: span(f, 0, y0, 1.5), start: [0, y0], h: 0.25 }, caption: 'Orange: Euler’s method with the step set on the slider (it starts at h = 0.25; the question asks for h = 0.5). Blue: an accurate solution for comparison.' },
        };
      },
    }),
    mcq({
      id: 'add-constant', difficulty: 3, kind: 'error',
      visual: { type: 'graph', params: { x: [-1, 1], y: [0, 36], xlabel: 't', ylabel: '', curves: [{ fn: '4*exp(2x)', color: 'accent', label: 'left side y″', labelAt: 0.55, labelDy: 14 }, { fn: '4*exp(2x) + 4', color: 'warn', dash: true, label: 'right side 4y', labelAt: 0.2, labelDx: -100 }] }, caption: t`For the candidate $y = e^{2t} + 1$: the two sides of $y'' = 4y$, plotted against $t$.` },
      prompt: t`A student checks that $y = e^{2t}$ solves $y'' = 4y$, then writes: “So $y = e^{2t} + 1$ is a solution too, because adding a constant never changes a derivative.” What is wrong?`,
      choices: [
        t`The constant leaves $y''$ unchanged but adds 4 to the right side $4y$, so the two sides no longer match`,
        'Nothing: adding a constant to a solution always gives another solution',
        t`$y = e^{2t}$ was never a solution, because $y'' = 2e^{2t}$`,
        t`Only $y = e^{-2t}$ solves $y'' = 4y$`,
      ],
      answer: 0,
      why: {
        1: t`That is true only when $y$ itself does not appear in the equation, as in $y'' = \sin t$. Here the right side is $4y$, which feels the constant.`,
        2: t`Differentiate twice: $(e^{2t})' = 2e^{2t}$ and $(e^{2t})'' = 4e^{2t} = 4y$. It is a solution.`,
        3: t`$e^{-2t}$ is a solution, but so is $e^{2t}$: both give $y'' = 4y$.`,
      },
      hints: [t`Substitute $y = e^{2t} + 1$ into both sides separately.`, t`Left side: $y'' = 4e^{2t}$. Right side: $4y = 4e^{2t} + 4$. Are they equal?`],
      teach: 'A candidate solution must be checked in the whole equation; a constant that vanishes from the derivatives can still change the other terms.',
      explain: t`For $y = e^{2t} + 1$: $y'' = 4e^{2t}$, but $4y = 4e^{2t} + 4$. The sides differ by 4, so it is not a solution. (Multiplying by a constant *does* work here: $Ce^{2t}$ solves it for every $C$.)`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-long-run', difficulty: 2,
      visual: { type: 'graph', params: { x: [-1, 5], y: [-5, 5], xlabel: 'y', ylabel: 'dy/dt', curves: [{ fn: 'x*(4 - x)', color: 'accent' }], points: [{ x: 1, y: 3, color: 'gold', label: 'start: y = 1' }] }, caption: t`The rate $\frac{dy}{dt} = y(4 - y)$ as a function of $y$ (not of $t$).` },
      prompt: t`A solution of $\dfrac{dy}{dt} = y\,(4 - y)$ starts at $y(0) = 1$. What does it do as $t \to \infty$?`,
      choices: [
        t`It rises and levels off towards $y = 4$`,
        t`It rises without bound, because $\frac{dy}{dt} > 0$ at the start`,
        t`It rises, overshoots $y = 4$, then settles back down`,
        t`It falls towards $y = 0$`,
      ],
      answer: 0,
      why: {
        1: t`The slope is positive at the start, but it shrinks to zero as $y$ approaches 4, where $4 - y = 0$.`,
        2: t`It can never cross $y = 4$: that line is itself a solution, and solutions of $y' = f(y)$ cannot cross one another.`,
        3: t`Between 0 and 4 both factors are positive, so $\frac{dy}{dt} > 0$: the solution increases.`,
      },
      hints: ['Find the equilibria, then the sign of dy/dt between them.'],
      teach: 'For an equation y′ = f(y), a solution moves monotonically towards the next equilibrium in the direction of the slope and never crosses it.',
      explain: t`Equilibria are $y = 0$ and $y = 4$. For $0 < y < 4$, $\frac{dy}{dt} = y(4 - y) > 0$, so the solution climbs, and it can only approach the equilibrium line $y = 4$, never cross it.`,
    }),
    num({
      id: 'cp-rc', difficulty: 2, transfer: true,
      gen(r) {
        const Vs = r.pick([5, 9, 12]), tau = r.pick([0.5, 1, 2]), m = r.pick([0.5, 1, 1.5, 2]), t1 = m * tau;
        const V = Vs * (1 - Math.exp(-m));
        const errors = [{ value: Vs * Math.exp(-m), feedback: t`That is the voltage of a *discharging* capacitor. With $V(0) = 0$ the constant is $C = -${Vs}$, so $V = ${Vs}\,(1 - e^{-t/\tau})$.` }];
        if (tau !== 1) errors.push({ value: Vs * (1 - Math.exp(-t1 * tau)), feedback: t`The exponent is $-t/\tau$: divide by the time constant, do not multiply.` });
        return {
          prompt: t`A capacitor charges through a resistor from a ${Vs} V battery. Its voltage obeys $\dfrac{dV}{dt} = \dfrac{${Vs} - V}{\tau}$ with time constant $\tau = RC = ${tau}$ s, and the general solution is $V = ${Vs} + Ce^{-t/\tau}$. The capacitor starts uncharged. What is $V$ at $t = ${nice(t1)}$ s?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors,
          hints: [t`Use $V(0) = 0$ to find $C$.`, t`$0 = ${Vs} + C$, so $C = -${Vs}$ and $V = ${Vs}\,(1 - e^{-t/${tau}})$.`],
          teach: 'An RC circuit is a first-order differential equation; the initial charge fixes the constant in its general solution.',
          explain: t`$C = -${Vs}$, so $V(${nice(t1)}) = ${Vs}\,(1 - e^{-${nice(m)}}) = ${fmt(V, 3)}$ V. After one time constant a capacitor reaches $1 - e^{-1} \approx 63\%$ of the supply voltage.`,
          visual: { type: 'phase', params: { slope: true, f: `(${Vs} - y)/${tau}`, x: [0, 5 * tau], y: [0, Vs + 2], start: [0, 0], h: Math.min(1, tau / 2) }, caption: t`The slope field of $\frac{dV}{dt} = (${Vs} - V)/\tau$, with $t$ in seconds along the horizontal axis and $V$ in volts up the side.` },
        };
      },
    }),
    num({
      id: 'cp-drag-euler', difficulty: 3, transfer: true,
      gen(r) {
        const c = r.pick([0.1, 0.2, 0.25, 0.5]), g = 9.8;
        const v1 = g, v2 = v1 + (g - c * v1), exact = (g / c) * (1 - Math.exp(-2 * c));
        return {
          prompt: t`A skydiver falling with air drag (modelled as proportional to speed) obeys $\dfrac{dv}{dt} = 9.8 - ${c}\,v$, with $v$ in m/s and $t$ in s. Starting from rest, use Euler’s method with step $h = 1$ s to estimate $v(2)$.`,
          answer: v2, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: 2 * g, feedback: 'That is free fall for 2 s with no drag. At the second step the slope is smaller, because drag has started to act.' }],
          hints: [t`Step 1, from $v_0 = 0$: $v_1 = 0 + 1\times(9.8 - ${c}\times 0)$.`, t`Step 2 uses the slope at $v_1$: $v_2 = v_1 + 1\times(9.8 - ${c}\,v_1)$.`],
          teach: 'Euler’s method needs only the rule for the slope: recompute it from the latest value at every step.',
          explain: t`$v_1 = 9.8$ m/s; $v_2 = 9.8 + (9.8 - ${c}\times9.8) = ${nice(v2)}$ m/s. The exact solution gives $v(2) = \frac{9.8}{${c}}(1 - e^{-${nice(2 * c)}}) \approx ${fmt(exact, 3)}$ m/s: Euler overestimates, because the true slope keeps falling during each step while Euler holds it at its starting value.`,
          visual: { type: 'graph', params: { x: [0, Math.ceil((1.25 * g) / c)], y: [0, 10.5], xlabel: 'v (m/s)', ylabel: 'dv/dt', curves: [{ fn: `9.8 - ${c}*x`, color: 'accent' }], vlines: [{ x: g / c, label: 'terminal speed', color: 'ink3' }], points: [{ x: 0, y: g, color: 'gold', label: 'start' }] }, caption: t`The slope rule $\frac{dv}{dt} = 9.8 - ${c}v$ as a function of $v$: Euler’s method reads it at the start of each step.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §4.1 Basics of differential equations', url: 'https://openstax.org/books/calculus-volume-2/pages/4-1-basics-of-differential-equations' },
    { label: 'OpenStax Calculus Vol. 2, §4.2 Direction fields and numerical methods', url: 'https://openstax.org/books/calculus-volume-2/pages/4-2-direction-fields-and-numerical-methods' },
  ],
});
