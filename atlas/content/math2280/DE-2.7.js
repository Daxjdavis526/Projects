// Euler's method: the algorithm, local against global error, first order
// measured by halving h, stability, Richardson extrapolation — and Python
// exercises that build the method and measure its order.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// Euler and RK4 in JS, so every number a learner reads is computed, never typed
function euler(f, t0, y0, h, n) { let y = y0; for (let i = 0; i < n; i++) y += h * f(t0 + i * h, y); return y; }
function rk4(f, t0, y0, h, n) {
  let y = y0;
  for (let i = 0; i < n; i++) {
    const tt = t0 + i * h, k1 = f(tt, y), k2 = f(tt + h / 2, y + (h / 2) * k1), k3 = f(tt + h / 2, y + (h / 2) * k2), k4 = f(tt + h, y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  }
  return y;
}
function heun(f, t0, y0, h, n) { let y = y0; for (let i = 0; i < n; i++) { const tt = t0 + i * h, k1 = f(tt, y), k2 = f(tt + h, y + h * k1); y += (h / 2) * (k1 + k2); } return y; }

// the worked example: a skydiver with quadratic drag, v′ = g(1 − (v/vₜ)²), v(0) = 0, to t = 6 s
const G = 9.8, VT = 55.2, TEND = 6;
const drag = (tt, v) => G * (1 - (v / VT) ** 2);
const EXACT = VT * Math.tanh((G * TEND) / VT);
const HS = [1, 0.5, 0.25, 0.125];
const RUNS = HS.map((h) => { const v = euler(drag, 0, 0, h, Math.round(TEND / h)); return { h, v, e: v - EXACT }; });
const pad = (s, n) => String(s).padStart(n);
const TABLE = RUNS.map((r) => `h = ${pad(r.h, 5)}  v(6) = ${r.v.toFixed(4)}  error = ${r.e >= 0 ? '+' : ''}${r.e.toFixed(4)}`).join('\n');

const EXAMPLE_CODE = t`import math

def euler(f, t0, y0, h, n):
    """n Euler steps of size h from (t0, y0); returns the lists of t and y."""
    t, y = t0, y0
    ts, ys = [t], [y]
    for i in range(n):
        y = y + h * f(t, y)          # follow the slope at the start of the step
        t = t0 + (i + 1) * h         # fresh each step: no rounding drift
        ts.append(t)
        ys.append(y)
    return ts, ys

g, vt = 9.8, 55.2                    # m/s², terminal speed in m/s
f = lambda t, v: g * (1 - (v / vt)**2)
exact = vt * math.tanh(g * 6 / vt)   # the separable solution, for comparison

for h in [1, 0.5, 0.25, 0.125]:
    ts, vs = euler(f, 0, 0, h, round(6 / h))
    print(f"h = {h:5}  v(6) = {vs[-1]:.4f}  error = {vs[-1] - exact:+.4f}")`;

export default lesson({
  id: 'math2280.DE-2.7',
  title: 'Euler’s method',
  minutes: 14, difficulty: 2,
  intro: t`When an equation has no formula for its solution — most do not — you can still walk along its slope field. **Euler’s method** takes straight steps of length $h$ in $t$, each along the slope at its starting point:

$$y_{n+1} = y_n + h\,f(t_n, y_n), \qquad t_{n+1} = t_n + h$$

Each step misses the curving solution by about $Ch^2$, the gap between a tangent line and a curve. Covering a fixed interval takes $T/h$ steps, so the misses add up to a **global error proportional to $h$**: Euler is a **first-order** method, and halving $h$ halves the error. That makes it slow to converge — but it is the loop on which every better method, and every simulation in physics, is built.`,
  symbols: [
    { tex: t`t_n,\ y_n`, text: t`the $n$th point of the numerical solution; $y_n$ approximates the true $y(t_n)$` },
    { tex: t`h`, text: 'the step size, in the units of t' },
    { tex: t`f(t_n, y_n)`, text: 'the slope the equation gives at the start of the step — the only information Euler’s method uses' },
    { tex: t`Ch^2,\ Ch`, text: t`the sizes of the error made in one step (local) and accumulated by a fixed time (global); $C$ depends on the equation, not on $h$` },
  ],
  why: t`Orbits with drag, re-entry heating and a rocket with varying thrust have no formula: a loop of steps like this one is how they are actually computed, and knowing its error order tells you how small a step to take.`,
  visual: {
    type: 'de-stepper',
    title: 'Euler’s method on a falling skydiver',
    lead: t`The skydiver of the separable-equations lesson, $v' = g\left(1 - (v/v_t)^2\right)$ with $v_t = 55.2$ m/s, solved by Euler’s method from rest to $t = 12$ s. Blue is the exact solution $v_t\tanh(gt/v_t)$.`,
    tasks: [
      'Halve h, then halve it again: the error at 12 s roughly halves each time — read the ratio in the readout.',
      'Switch to One step: the step follows the slope at its start, k₁, and overshoots the true curve, which is bending away.',
      'On the log–log panel Euler’s errors lie on a line of slope 1: first order.',
    ],
    params: {
      f: '9.8*(1 - (y/55.2)^2)', exact: '55.2*tanh(9.8*t/55.2)', t0: 0, y0: 0, T: 12, hs: [2, 1, 0.5, 0.25],
      methods: ['euler'], views: ['run', 'stage'], xlabel: 't (s)', ylabel: 'v (m/s)',
    },
    caption: t`Quadratic drag at constant air density, $g = 9.8\ \text{m/s}^2$. The error panel uses the exact solution; in real work you would compare two step sizes instead, as the exercises do.`,
  },
  example: {
    prompt: t`Write Euler’s method in Python, solve the skydiver’s equation $v' = 9.8\left(1 - (v/55.2)^2\right)$, $v(0) = 0$, up to $t = 6$ s with $h = 1,\ 0.5,\ 0.25,\ 0.125$ s, and use the errors to find the method’s order.`,
    visual: { type: 'code-runner', params: { code: EXAMPLE_CODE, rows: 22 }, caption: 'Press Run to execute the program; edit it and run it again. Python runs in your browser.' },
    steps: [
      { label: 'The loop', text: t`One line does the work: \`y = y + h * f(t, y)\`. Computing \`t = t0 + (i + 1) * h\` afresh, rather than adding \`h\` each time, keeps rounding errors from accumulating in the times.` },
      { label: 'The problem', text: t`\`f\` is the slope rule as a function of \`t\` and \`v\`; \`exact\` is $v_t\tanh(gt/v_t)$ at $t = 6$ s, $${fmt(EXACT, 6)}$ m/s, from the separable solution — available here only so that we can measure the error.` },
      { label: 'Run it', text: t`The program prints

\`\`\`
${TABLE}
\`\`\`` },
      { label: 'Read the order', text: t`Each halving of $h$ divides the error by ${RUNS.slice(1).map((r, i) => fmt(RUNS[i].e / r.e, 3)).join(', ')} — closing in on 2. Error $\propto h^1$: **first order**.` },
      { label: 'Sense check', text: t`Every error is positive: Euler overestimates. The solution is concave down — the drag grows as the diver speeds up — and a step along the starting slope overshoots a curve that is bending away beneath it.` },
    ],
    answer: t`Euler’s error at $t = 6$ s falls from ${fmt(RUNS[0].e, 3)} to ${fmt(RUNS[3].e, 3)} m/s as $h$ goes from 1 to 0.125 s, halving with each halving of $h$: first order.`,
  },
  practice: [
    num({
      id: 'three-steps', difficulty: 2,
      gen(r) {
        const y0 = r.pick([0.25, 0.5, 1.5]), h = r.pick([0.5, 0.25]);
        const f = (tt, y) => y * (2 - y);
        let y = y0;
        const ys = [y0];
        for (let i = 0; i < 3; i++) { y += h * f(0, y); ys.push(y); }
        const two = ys[2];
        return {
          prompt: t`Use Euler’s method with $h = ${h}$ for three steps to estimate $y(${nice(3 * h)})$ for $y' = y\,(2 - y)$, $\;y(0) = ${y0}$.`,
          answer: ys[3], tol: { rel: 0.002, abs: 1e-6 },
          errors: [{ value: two, feedback: 'That is after two steps; take one more.' }, { value: y0 + 3 * h * f(0, y0), feedback: 'The slope must be recomputed at every step from the newest y, not reused from the start.' }].filter((e) => Math.abs(e.value - ys[3]) > 0.005 * Math.abs(ys[3])),
          hints: [t`$y_{n+1} = y_n + ${h}\,y_n(2 - y_n)$.`, t`$y_1 = ${nice(ys[1], 5)}$, $\;y_2 = ${nice(ys[2], 5)}$; one more step.`],
          teach: 'Each Euler step uses the slope at the newest point, so the slope changes from step to step.',
          explain: t`$y_1 = ${nice(ys[1], 5)}$, $y_2 = ${nice(ys[2], 5)}$, $y_3 = ${nice(ys[3], 5)}$. The exact value is $\dfrac{2}{1 + (2/${y0} - 1)e^{-${nice(6 * h)}}} = ${fmt(2 / (1 + (2 / y0 - 1) * Math.exp(-6 * h)), 4)}$.`,
          visual: { type: 'de-stepper', params: { f: 'y*(2 - y)', exact: `2/(1 + (${2 / y0 - 1})*exp(-2t))`, t0: 0, y0, T: 3 * h, hs: [h], methods: ['euler'], views: ['run'], readout: false, x: [0, 3 * h * 1.05], y: [Math.min(y0, 1.9) - 0.2, 2.2] }, caption: 'Euler’s three steps (orange) against the exact logistic curve (blue). Find the numbers yourself.' },
        };
      },
    }),
    num({
      id: 'order-from-table', difficulty: 2,
      gen(r) {
        const m = r.pick([['euler', euler, 1], ['heun', heun, 2], ['rk4', rk4, 4]]);
        const f = (tt, y) => -y + Math.sin(tt), Y = (tt) => 1.5 * Math.exp(-tt) + (Math.sin(tt) - Math.cos(tt)) / 2;
        const hs = m[0] === 'rk4' ? [0.2, 0.1, 0.05] : [0.1, 0.05, 0.025];
        const E = hs.map((h) => Math.abs(m[1](f, 0, 1, h, Math.round(3 / h)) - Y(3)));
        const p = Math.log2(E[1] / E[2]);
        const row = (h, e) => t`$h = ${h}$: $\;|E| = ${tex4(e)}$`;
        return {
          prompt: t`An unknown one-step method solves $y' = -y + \sin t$, $y(0) = 1$, and its errors at $t = 3$ are

- ${row(hs[0], E[0])}
- ${row(hs[1], E[1])}
- ${row(hs[2], E[2])}

What is its order $p$ (the power with $|E| \propto h^p$)? Give a whole number.`,
          answer: m[2], tol: { rel: 0, abs: 0.45 },
          errors: [{ value: E[1] / E[2], feedback: t`That is the error ratio $E(h)/E(h/2)$. The order is its base-2 logarithm, since $2^p = E(h)/E(h/2)$.` }].filter((e) => Math.abs(e.value - m[2]) > 0.5),
          hints: [t`If $|E| = Ch^p$, halving $h$ divides the error by $2^p$.`, t`$p = \log_2\dfrac{E(h)}{E(h/2)}$ — use the last two rows, where the error is cleanest.`],
          teach: 'The order of a method is measured, not assumed: halve h and take log₂ of the error ratio.',
          explain: t`$E(${hs[1]})/E(${hs[2]}) = ${fmt(E[1] / E[2], 4)}$, and $\log_2 ${fmt(E[1] / E[2], 4)} = ${fmt(p, 3)} \approx ${m[2]}$. ${m[2] === 1 ? 'This is Euler’s method.' : m[2] === 2 ? 'A second-order method, such as improved Euler.' : 'Fourth order: RK4.'}`,
          visual: { type: 'graph', params: { x: [Math.log10(hs[2]) - 0.2, Math.log10(hs[0]) + 0.2], y: [Math.floor(Math.log10(E[2])) - 0.3, Math.ceil(Math.log10(E[0])) + 0.3], xlog: true, ylog: true, axesAt: 'edge', xlabel: 'step size h', ylabel: '|error|', points: hs.map((h, i) => ({ x: Math.log10(h), y: Math.log10(E[i]), color: 'gold' })) }, caption: 'The three errors on logarithmic axes. The slope of the line through them is the order.' },
        };
      },
    }),
    mcq({
      id: 'local-global', difficulty: 2,
      prompt: t`Each Euler step makes an error of roughly $Ch^2$. Why is the error at a fixed time $T$ proportional to $h$, not to $h^2$?`,
      choices: [
        t`Reaching $T$ takes $T/h$ steps, and $T/h$ errors of size about $Ch^2$ add up to about $CTh$`,
        t`The error per step is really $Ch$, not $Ch^2$`,
        t`Rounding errors in the computer add a term proportional to $h$`,
        t`The global error is $Ch^2$ too; the two are always the same order`,
      ],
      answer: 0,
      why: {
        1: t`One step along the tangent misses the curve by $\tfrac12 y''h^2$ — that is the Taylor remainder, of order $h^2$.`,
        2: t`Rounding errors grow as $h$ shrinks (more steps), the opposite trend; they matter only for very small $h$.`,
        3: t`Errors made in many steps accumulate: the global error is one power of $h$ lower than the local one.`,
      },
      hints: [t`How many steps does it take to reach $T$?`],
      teach: 'Global error is local error times the number of steps: one power of h lower.',
      explain: t`Number of steps × error per step $= \dfrac{T}{h}\times Ch^2 = CTh$. (The errors are also carried forward and amplified or damped by the equation, which changes $C$ but not the power of $h$.)`,
      visual: { type: 'de-stepper', params: { f: '9.8*(1 - (y/55.2)^2)', exact: '55.2*tanh(9.8*t/55.2)', t0: 0, y0: 0, T: 12, hs: [2], methods: ['euler'], views: ['run'], readout: false, xlabel: 't (s)', ylabel: 'v (m/s)' }, caption: 'Six Euler steps of 2 s each for the falling skydiver: a small miss at every step, adding up.' },
    }),
    num({
      id: 'stability', difficulty: 3,
      gen(r) {
        const lam = r.pick([20, 50, 200, 1000]);
        const hmax = 2 / lam;
        return {
          prompt: t`A fast thermal mode of a spacecraft component decays as $y' = -${lam}\,y$ (per second). Euler’s method gives $y_{n+1} = (1 - ${lam}h)\,y_n$. What is the largest step $h$ for which the numerical solution does not grow?`,
          answer: hmax, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 1 / lam, feedback: t`At $h = 1/${lam}$ the factor $1 - ${lam}h$ is 0. It may go down to $-1$ before the solution grows: $|1 - ${lam}h| \le 1$.` }, { value: lam / 2, feedback: t`Solve $|1 - ${lam}h| \le 1$ for $h$: $h \le 2/${lam}$.` }],
          hints: [t`$y_n = (1 - ${lam}h)^n y_0$. The numbers stay bounded only if $|1 - ${lam}h| \le 1$.`, t`$-1 \le 1 - ${lam}h$ gives $h \le 2/${lam}$.`],
          teach: 'For y′ = −λy Euler is stable only when h ≤ 2/λ: a stiff equation forces tiny steps even when the solution itself is smooth.',
          explain: t`$|1 - ${lam}h| \le 1$ requires $h \le 2/${lam} = ${nice(hmax)}$ s. Just above it the numbers flip sign and grow every step — a numerical instability, not physics. Equations with a fast decaying part like this are called **stiff**; implicit methods, such as those in \`solve_ivp(method='BDF')\`, handle them.`,
          visual: { type: 'graph', params: { x: [0, 12], y: [-3, 3], xlabel: 'step number n', ylabel: 'yₙ / y₀', points: Array.from({ length: 13 }, (_, n) => ({ x: n, y: (-1.1) ** n, color: 'bad', r: 3.5 })), hlines: [{ y: 0, label: 'true solution → 0', color: 'good' }] }, caption: t`An example of instability: with the factor $1 - \lambda h = -1.1$ the numerical solution flips sign and grows, while the true solution decays to zero.` },
        };
      },
    }),
    code({
      id: 'euler-code', difficulty: 2,
      prompt: t`Write \`euler(f, t0, y0, h, n)\` that takes \`n\` Euler steps of size \`h\` for $y' = f(t, y)$ from $(t_0, y_0)$ and **returns two lists**, the times and the values, each of length $n + 1$.`,
      starter: t`def euler(f, t0, y0, h, n):
    ts, ys = [t0], [y0]
    # take n steps: y ← y + h·f(t, y), t ← t + h
    return ts, ys
`,
      answer: t`def euler(f, t0, y0, h, n):
    ts, ys = [t0], [y0]
    t, y = t0, y0
    for i in range(n):
        y = y + h * f(t, y)
        t = t0 + (i + 1) * h
        ts.append(t)
        ys.append(y)
    return ts, ys`,
      tests: [
        { name: 'returns n + 1 times and n + 1 values', code: 'all(len(v) == 6 for v in euler(lambda t, y: y, 0, 1, 0.2, 5))' },
        { name: 'y′ = y, h = 0.1, 10 steps gives 1.1¹⁰ = 2.5937…', code: 'abs(euler(lambda t, y: y, 0, 1, 0.1, 10)[1][-1] - 1.1**10) < 1e-12' },
        { name: 'the slope is read at the start of each step (y′ = t, h = 0.5, 4 steps gives 1.5)', code: 'abs(euler(lambda t, y: t, 0, 0, 0.5, 4)[1][-1] - 1.5) < 1e-12' },
        { name: 'the last time is t₀ + nh', code: 'abs(euler(lambda t, y: 0, 2, 0, 0.25, 8)[0][-1] - 4) < 1e-12' },
      ],
      hints: ['Loop n times; inside the loop, update y first using the old t, then t.', '`y = y + h * f(t, y)`, then `t = t0 + (i + 1) * h`, then append both.'],
      teach: 'Euler’s method is a loop that adds h times the current slope, once per step.',
      explain: t`The loop updates \`y\` with the slope at the **old** point, then moves \`t\` on. For $y' = t$ with $h = 0.5$ the slopes used are $0, 0.5, 1, 1.5$, so $y = 0.5 \times 3 = 1.5$ — a left Riemann sum of $\int_0^2 t\,dt = 2$, the integral Euler’s method approximates when $f$ depends on $t$ alone.`,
    }),
    code({
      id: 'euler-order', difficulty: 3,
      prompt: t`Measure Euler’s order. For $y' = y$, $y(0) = 1$ the exact value at $t = 1$ is $e$. Using the \`euler\` function provided, fill the list \`errors\` with $|y_N - e|$ for $h = 0.1, 0.05, 0.025, 0.0125$, and set \`p\` to the observed order $\log_2\big(E(h)/E(h/2)\big)$ from the **last two** errors.`,
      starter: t`import math

def euler(f, t0, y0, h, n):
    y = y0
    for i in range(n):
        y = y + h * f(t0 + i * h, y)
    return y

hs = [0.1, 0.05, 0.025, 0.0125]
errors = []    # one error per step size
p = 0          # the observed order
`,
      answer: t`import math

def euler(f, t0, y0, h, n):
    y = y0
    for i in range(n):
        y = y + h * f(t0 + i * h, y)
    return y

hs = [0.1, 0.05, 0.025, 0.0125]
errors = [abs(euler(lambda t, y: y, 0, 1, h, round(1 / h)) - math.e) for h in hs]
p = math.log2(errors[-2] / errors[-1])
print(errors, p)`,
      tests: [
        { name: 'four errors, one per step size', code: 'len(errors) == 4' },
        { name: 'the error with h = 0.1 is about 0.1245', code: 'abs(errors[0] - (math.e - 1.1**10)) < 1e-9' },
        { name: 'each halving of h roughly halves the error', code: 'all(1.8 < errors[i] / errors[i + 1] < 2.1 for i in range(3))' },
        { name: 'the observed order p is close to 1', code: 'abs(p - 1) < 0.05' },
      ],
      hints: ['Use `round(1 / h)` steps so that the run ends exactly at t = 1.', 'A list comprehension: `errors = [abs(euler(lambda t, y: y, 0, 1, h, round(1 / h)) - math.e) for h in hs]`, then `p = math.log2(errors[-2] / errors[-1])`.'],
      teach: 'Halving h and comparing errors measures a method’s order directly, with no theory needed.',
      explain: t`The errors are about 0.125, 0.065, 0.033 and 0.017: each halving divides them by close to 2, so $p \approx 1$. (Exactly, Euler gives $(1 + h)^{1/h}$, which approaches $e$ like $e - \tfrac{e}{2}h$.)`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      prompt: t`Euler’s method on an orbit. With $GM = 1$, a body at $(1, 0)$ moving at $(0, 1)$ is on a circular orbit of radius 1 and period $2\pi$. Write \`orbit_energy(h)\` that takes Euler steps of size \`h\` for one period (\`round(2 * math.pi / h)\` steps) of
$$x' = v_x,\quad y' = v_y,\quad v_x' = -\frac{x}{r^3},\quad v_y' = -\frac{y}{r^3},$$
updating all four from the **old** values each step, and returns the final energy $E = \tfrac12(v_x^2 + v_y^2) - 1/r$. The true energy stays $-\tfrac12$.`,
      starter: t`import math

def orbit_energy(h):
    x, y, vx, vy = 1.0, 0.0, 0.0, 1.0
    # take round(2*pi/h) Euler steps, then return the energy
    return 0.0
`,
      answer: t`import math

def orbit_energy(h):
    x, y, vx, vy = 1.0, 0.0, 0.0, 1.0
    for _ in range(round(2 * math.pi / h)):
        r3 = (x * x + y * y) ** 1.5
        x, y, vx, vy = x + h * vx, y + h * vy, vx - h * x / r3, vy - h * y / r3
    return 0.5 * (vx * vx + vy * vy) - 1 / math.sqrt(x * x + y * y)

print(orbit_energy(0.01), orbit_energy(0.005))`,
      tests: [
        { name: 'with h = 0.01 the energy has risen above −½: Euler spirals outward', code: 'orbit_energy(0.01) > -0.5 + 1e-3' },
        { name: 'the energy error with h = 0.01 is about 0.05', code: '0.04 < orbit_energy(0.01) + 0.5 < 0.06' },
        { name: 'halving h roughly halves the energy error (first order)', code: '1.7 < (orbit_energy(0.01) + 0.5) / (orbit_energy(0.005) + 0.5) < 2.2' },
      ],
      hints: ['Compute `r3 = (x*x + y*y)**1.5` first, then update all four variables together with a tuple assignment, so each uses the old values.', '`x, y, vx, vy = x + h*vx, y + h*vy, vx - h*x/r3, vy - h*y/r3`'],
      teach: 'Euler’s method on an orbit gains energy every step, so the computed orbit spirals outward — an error that shrinks only in proportion to h.',
      explain: t`Each step moves along the tangent, slightly outside the circle, and the energy creeps up: after one period with $h = 0.01$ it is about $${fmt(eulerOrbit(0.01), 4)}$ instead of $-0.5$, and halving $h$ halves the error. A real mission integrator uses higher-order or energy-preserving (symplectic) methods — the next lesson.`,
    }),
    num({
      id: 'cp-richardson', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2]), Tq = r.pick([1, 2]);
        const f = (tt, y) => -k * y + 1, y0 = 2;
        const exact = 1 / k + (y0 - 1 / k) * Math.exp(-k * Tq);
        const h = 0.1, a = euler(f, 0, y0, h, Math.round(Tq / h)), b = euler(f, 0, y0, h / 2, Math.round((2 * Tq) / h));
        const R = 2 * b - a;
        return {
          prompt: t`Euler’s method for $y' = -${k === 1 ? '' : k}y + 1$, $y(0) = 2$, gives $y(${Tq}) \approx ${a.toFixed(6)}$ with $h = 0.1$ and $y(${Tq}) \approx ${b.toFixed(6)}$ with $h = 0.05$. Because Euler’s error is close to $Ch$, the combination $2y_{h/2} - y_h$ cancels most of it (**Richardson extrapolation**). What value does it give?`,
          answer: R, tol: { rel: 1e-4, abs: 1e-6 },
          errors: [{ value: (a + b) / 2, feedback: t`Averaging does not cancel an error proportional to $h$: if $y_h \approx y + Ch$ and $y_{h/2} \approx y + Ch/2$, then $2y_{h/2} - y_h \approx y$.` }, { value: b, feedback: 'That is just the finer run; combine it with the coarser one.' }],
          hints: [t`$y_h \approx y + Ch$ and $y_{h/2} \approx y + \tfrac12 Ch$. Which combination removes $C$?`, t`$2y_{h/2} - y_h$.`],
          teach: 'Two runs at h and h/2 give an error estimate and, by Richardson extrapolation, a better answer: 2y(h/2) − y(h) for a first-order method.',
          explain: t`$2(${b.toFixed(6)}) - ${a.toFixed(6)} = ${R.toFixed(6)}$. The exact value is $${exact.toFixed(6)}$: the error drops from $${tex4(Math.abs(b - exact))}$ to $${tex4(Math.abs(R - exact))}$. The difference $y_{h/2} - y_h$ also estimates the error of $y_{h/2}$ itself, which is how adaptive solvers choose their steps.`,
          visual: { type: 'de-stepper', params: { f: `-${k}*y + 1`, exact: `${1 / k} + ${y0 - 1 / k}*exp(-${k}t)`, t0: 0, y0, T: Tq, hs: [0.1, 0.05], methods: ['euler'], views: ['run'], readout: false, xlabel: 't', ylabel: 'y' }, caption: 'Euler with h = 0.1 (switch to 0.05 to compare) against the exact solution.' },
        };
      },
    }),
    mcq({
      id: 'cp-tiny-h', difficulty: 2,
      prompt: t`A student wants the most accurate Euler solution possible and takes $h = 10^{-12}$ over $0 \le t \le 1$. What goes wrong?`,
      choices: [
        t`$10^{12}$ steps take far too long, and each adds a rounding error of about $10^{-16}$ that piles up, so the answer is no better and may be worse`,
        'Nothing: the error is proportional to h, so it is now about 10⁻¹²',
        'Euler’s method becomes unstable for very small steps',
        'The computer cannot represent a step that small, so h is treated as zero',
      ],
      answer: 0,
      why: {
        1: t`The truncation error would be tiny, but $10^{12}$ rounding errors of order $10^{-16}$ relative accumulate to around $10^{-4}$ at worst — and the run takes hours.`,
        2: 'Stability is lost for steps that are too large (h > 2/λ), not too small.',
        3: t`$10^{-12}$ is a perfectly ordinary double-precision number; the trouble is the number of steps, not the size of one.`,
      },
      hints: ['Count the steps, and think about what each floating-point addition costs.'],
      teach: 'Shrinking h trades truncation error for rounding error and run time; a higher-order method is the cure, not a tiny step.',
      explain: t`Total error ≈ truncation $Ch$ + rounding $\approx \varepsilon/h$ (with $\varepsilon \approx 10^{-16}$ per step), smallest around $h \sim \sqrt{\varepsilon}$, about $10^{-8}$ — and even that is a hundred million steps. To get more accuracy you raise the order of the method, which is what Runge–Kutta methods do.`,
      visual: { type: 'graph', params: { x: [-13, -1], y: [-10, 0], xlog: true, ylog: true, axesAt: 'edge', xlabel: 'step size h', ylabel: 'error (model)', curves: [{ fn: 'log10(10^x + 1e-16/10^x)', color: 'accent', label: 'truncation + rounding', labelAt: -4, labelDx: 6, labelDy: -12 }, { fn: 'x', color: 'ink3', dash: true, width: 1.4, label: 'truncation ≈ h', labelAt: -2.5, labelDx: -100, labelDy: 6 }] }, caption: t`A simple model of Euler’s total error, $h + 10^{-16}/h$, on logarithmic axes (constants set to 1). Below about $h = 10^{-8}$ rounding takes over.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.7 Numerical methods: Euler’s method', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'E. Hairer, S. P. Nørsett and G. Wanner, Solving Ordinary Differential Equations I, §II.1–II.3', url: 'https://link.springer.com/book/10.1007/978-3-540-78862-1' },
  ],
});

// a small positive number as TeX
function tex4(x) {
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) { const [m, e] = x.toExponential(2).split('e'); return `${m}\\times10^{${+e}}`; }
  return fmt(x, 3);
}

// Euler's energy after one orbit (for the explanation's number)
function eulerOrbit(h) {
  let x = 1, y = 0, vx = 0, vy = 1;
  for (let i = 0; i < Math.round((2 * Math.PI) / h); i++) {
    const r3 = (x * x + y * y) ** 1.5;
    [x, y, vx, vy] = [x + h * vx, y + h * vy, vx - (h * x) / r3, vy - (h * y) / r3];
  }
  return 0.5 * (vx * vx + vy * vy) - 1 / Math.hypot(x, y);
}
