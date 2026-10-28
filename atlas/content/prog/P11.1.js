// Euler and RK4 by hand — the code, not the calculus (that is math2280
// DE-2.7 and DE-2.8): a state vector in a NumPy array, the physics in one
// function, the method in another, a driver that takes both; a Molniya orbit
// as the test case, checked by returning to perigee after one period, with
// the order measured by halving the step; and the aliasing bug that ruins a
// trajectory list.
import { lesson, mcq, num, code, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { rk4Step, eulerStep, kepler2d, thou } from './_solvers.js';

const t = String.raw;

// ── a Molniya orbit, in km and s ──
const MU = 398600.4418, RE = 6378.137;
const RP = RE + 600, RA = RE + 39700, A = (RP + RA) / 2, ECC = (RA - RP) / (RA + RP);
const PER = 2 * Math.PI * Math.sqrt(A ** 3 / MU), VP = Math.sqrt(MU * (2 / RP - 1 / A));
const S0 = [RP, 0, 0, VP], F = kepler2d(MU);
function run(step, n) { const h = PER / n; let y = S0; const pts = [y]; for (let i = 0; i < n; i++) { y = step(F, i * h, y, h); pts.push(y); } return pts; }
const NS = [100, 200, 400, 800, 1600, 3200];
const missRK4 = (n) => { const y = run(rk4Step, n).at(-1); return Math.hypot(y[0] - RP, y[1]); };
const ERR = Object.fromEntries(NS.map((n) => [n, missRK4(n)]));
const ERR_EU = Object.fromEntries([400, 3200].map((n) => { const y = run(eulerStep, n).at(-1); return [n, Math.hypot(y[0] - RP, y[1])]; }));
const N_NEEDED = NS.find((n) => ERR[n] < 1);
const lg = Math.log10;
// fixed-time-step points around the orbit, for a picture of where the steps fall
const ORBIT24 = run(rk4Step, 3200).filter((_, i) => i % 133 === 0);

export default lesson({
  id: 'prog.P11.1',
  title: 'Euler and RK4 by hand',
  minutes: 13, difficulty: 3,
  intro: t`The differential-equations course built Euler's method and RK4 and measured their orders ([Euler’s method](#/lesson/math2280.DE-2.7), [RK4](#/lesson/math2280.DE-2.8)). Here you write them the way simulation codes do. Any system of ODEs — an orbit, a circuit, a rocket — becomes $\dot{\vec y} = \vec f(t, \vec y)$ for a **state vector** $\vec y$ held in one NumPy array; the physics lives in one function \`f(t, y)\`, the method in another, and a driver loops. RK4 samples the slope four times per step:

$$\vec y_{n+1} = \vec y_n + \frac h6\left(\vec k_1 + 2\vec k_2 + 2\vec k_3 + \vec k_4\right)$$

with $\vec k_1 = \vec f(t_n, \vec y_n)$, $\vec k_2 = \vec f(t_n + \tfrac h2, \vec y_n + \tfrac h2\vec k_1)$, $\vec k_3 = \vec f(t_n + \tfrac h2, \vec y_n + \tfrac h2\vec k_2)$, $\vec k_4 = \vec f(t_n + h, \vec y_n + h\vec k_3)$. Because NumPy adds and scales whole arrays, the same five lines work for one equation or a thousand.`,
  symbols: [
    { tex: t`\vec y_n`, text: 'the state vector at step $n$ — for an orbit in a plane, $(x, y, v_x, v_y)$ in one array' },
    { tex: t`\vec f(t, \vec y)`, text: 'the right-hand side: the time derivative of every state component (velocities, then accelerations)' },
    { tex: 'h', text: 'the time step (s)' },
    { tex: t`\vec k_1 \ldots \vec k_4`, text: 'four slope samples: at the start, twice at the midpoint, and at the end of the step' },
    { tex: 't_n', text: 'the time at step $n$, $t_0 + nh$' },
  ],
  why: 'Writing a stepper once, cleanly, is how every orbit propagator, circuit simulator and flight model starts — and the structure (state, physics, method, driver, check) carries over unchanged to the library solvers.',
  visual: {
    type: 'code-runner',
    title: 'One driver, two methods, a Molniya orbit',
    lead: t`Press **Run**. A Molniya communications orbit (600 km by 39 700 km, period ${(PER / 3600).toFixed(2)} h) is integrated for exactly one period with Euler and with RK4. Left: the orbits after 400 steps. Right: how far each ends from its starting point, the perigee, against the number of steps.`,
    tasks: [
      'Read the RK4 errors: each doubling of the steps divides the error by about 16 — fourth order.',
      'Euler with 400 steps flings the satellite out of orbit: its crude perigee steps add energy. Even 1600 steps leave it tens of thousands of kilometres off.',
      'Swap `kepler` for a function with drag, or add a third body: the steppers and the driver need no change.',
    ],
    params: {
      rows: 26,
      code: t`import numpy as np
import matplotlib.pyplot as plt

mu = 398600.4418                          # Earth's GM, km³/s²
rp, ra = 6378.137 + 600, 6378.137 + 39700 # perigee and apogee radii, km
a = (rp + ra) / 2
T = 2 * np.pi * np.sqrt(a**3 / mu)        # period, s
s0 = np.array([rp, 0, 0, np.sqrt(mu * (2 / rp - 1 / a))])   # x, y, vx, vy at perigee

def kepler(t, s):                         # the physics: ds/dt
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return np.array([vx, vy, -mu * x / r3, -mu * y / r3])

def euler_step(f, t, y, h):
    return y + h * f(t, y)

def rk4_step(f, t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def integrate(step, f, y0, t1, n):        # any method, any physics
    h = t1 / n
    Y = np.empty((n + 1, len(y0)))
    Y[0] = y0
    for i in range(n):
        Y[i + 1] = step(f, i * h, Y[i], h)
    return Y

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4))
ns = [100, 200, 400, 800, 1600]
for step, name in [(euler_step, "Euler"), (rk4_step, "RK4")]:
    Y = integrate(step, kepler, s0, T, 400)
    ax1.plot(Y[:, 0] / 1e3, Y[:, 1] / 1e3, label=f"{name}, 400 steps")
    errs = [np.hypot(*(integrate(step, kepler, s0, T, n)[-1, :2] - s0[:2])) for n in ns]
    ax2.loglog(ns, errs, "o-", label=name)
    print(name, "error after one orbit (km):", ", ".join(f"{e:.3g}" for e in errs))
ax1.plot(0, 0, "o", color="gray")
ax1.set_xlim(-60, 20); ax1.set_ylim(-30, 30); ax1.set_aspect("equal")
ax1.set_xlabel("x (1000 km)"); ax1.set_ylabel("y (1000 km)"); ax1.legend(fontsize=8)
ax2.set_xlabel("steps per orbit"); ax2.set_ylabel("miss distance at perigee (km)"); ax2.legend()
plt.tight_layout()
plt.show()`,
    },
    caption: 'A point-mass Earth: the real Molniya orbit is shaped by Earth’s oblateness (its 63.4° inclination is chosen so that the perigee does not drift). The orbit is drawn in its own plane.',
  },
  example: {
    prompt: t`Integrate the Molniya orbit (perigee radius $${thou(RP)}$ km, apogee $${thou(RA)}$ km, $GM = 398\,600.4418$ km³/s²) for one period with RK4, and **check the code** before trusting it: after exactly one period the satellite must be back at perigee.`,
    visual: {
      type: 'graph',
      params: { x: [-50, 12], y: [-22, 22], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (1000 km)', ylabel: 'y (1000 km)',
        curves: [{ param: [`${(A * (-ECC)) / 1e3} + ${A / 1e3}*cos(t)`, `${(A * Math.sqrt(1 - ECC * ECC)) / 1e3}*sin(t)`], t: [0, 6.2832], color: 'ink3', dash: true }],
        points: [{ x: 0, y: 0, color: 'accent', r: 6, label: 'Earth', labelDx: 8, labelDy: 14 }, ...ORBIT24.map((s) => ({ x: s[0] / 1e3, y: s[1] / 1e3, color: 'gold', r: 3 }))] },
      caption: 'The orbit (dashed) with dots every 133 steps of 3200 — equal intervals of time. The satellite lingers near apogee and races through perigee.',
    },
    steps: [
      { label: 'State and physics', text: t`The state is $(x, y, v_x, v_y)$ in km and km/s; its derivative is $(v_x, v_y, a_x, a_y)$ with $\vec a = -GM\vec r/r^3$. Start at perigee, $(r_p, 0)$, moving at the vis-viva speed $v_p = \sqrt{GM(2/r_p - 1/a)} = ${VP.toFixed(3)}$ km/s along $+y$.

\`\`\`python
def kepler(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return np.array([vx, vy, -mu * x / r3, -mu * y / r3])
\`\`\`` },
      { label: 'Method and driver', text: t`\`rk4_step(f, t, y, h)\` takes **any** right-hand side and returns the next state; \`integrate(step, f, y0, t1, n)\` takes **any** stepper. Neither knows about orbits. The driver fills a preallocated array \`Y\` row by row — row $i$ is the state at $t_i$ — so nothing is overwritten by accident (see the aliasing problem below).` },
      { label: 'Test against physics', text: t`One period is $T = 2\pi\sqrt{a^3/GM} = ${thou(PER)}$ s. After it, the miss distance from perigee is ${NS.map((n) => `${ERR[n] >= 1000 ? `$${thou(ERR[n])}$` : ERR[n] >= 1 ? ERR[n].toFixed(1) : `$${tex(ERR[n], 2)}$`} km with ${n} steps`).join(', ')}.` },
      { label: 'Measure the order', text: t`The ratios of successive errors are ${NS.slice(1).map((n) => (ERR[n / 2] / ERR[n]).toFixed(1)).join(', ')}, tending to $2^4 = 16$: the code is fourth order, as RK4 must be. A ratio of 2 would betray a bug that degraded it to first order — a typo such as \`k3 = f(t + h/2, y + h/2 * k1)\` changes the order without changing anything else visible. With few steps the ratio is above 16 because the error is not yet in its asymptotic regime.` },
      { label: 'Sense check', text: t`Euler with 400 steps misses by $${tex(ERR_EU[400], 2)}$ km — more than the orbit's size — and still by $${thou(Math.round(ERR_EU[3200] / 1000) * 1000)}$ km with 3200. Perigee, where the satellite moves at ${VP.toFixed(1)} km/s and the path bends sharply, is where a fixed step does its damage.` },
    ],
    answer: t`RK4 needs about ${N_NEEDED} steps per orbit to return within 1 km of perigee; the error falls 16-fold per halving of $h$.`,
  },
  practice: [
    order({
      id: 'rk4-order', difficulty: 1,
      prompt: t`Put the lines of an RK4 step in an order that works.

\`\`\`python
def rk4_step(f, t, y, h):
    ...
\`\`\``,
      items: ['`k1 = f(t, y)`', '`k2 = f(t + h/2, y + h/2 * k1)`', '`k3 = f(t + h/2, y + h/2 * k2)`', '`k4 = f(t + h, y + h * k3)`', '`return y + h/6 * (k1 + 2*k2 + 2*k3 + k4)`'],
      hints: ['Each stage uses the slope computed just before it.', 'k2 needs k1, k3 needs k2, k4 needs k3; the weighted average comes last.'],
      teach: 'RK4’s stages form a chain: each trial point is built from the previous slope, so they must be computed in order.',
      explain: t`k1 at the start; k2 at the midpoint reached with k1; k3 at the midpoint reached with k2; k4 at the end reached with k3; then the weights 1, 2, 2, 1 over 6. Swapping k1 for k2 inside k3 still runs, still converges — but only to second order.`,
    }),
    mcq({
      id: 'rhs', difficulty: 2,
      prompt: t`For a planar orbit with state \`s = [x, y, vx, vy]\`, what must \`f(t, s)\` return?

\`\`\`python
def f(t, s):
    x, y, vx, vy = s
    r3 = (x*x + y*y) ** 1.5
    return ...
\`\`\``,
      choices: [
        '`np.array([vx, vy, -mu*x/r3, -mu*y/r3])`',
        '`np.array([x, y, -mu*x/r3, -mu*y/r3])`',
        '`np.array([-mu*x/r3, -mu*y/r3])`',
        '`np.array([vx, vy, -mu/r3, -mu/r3])`',
      ],
      answer: 0,
      why: {
        1: 'The derivative of a position is the velocity, not the position itself.',
        2: 'The derivative must have one entry per state component — four here — or the step cannot add it to the state.',
        3: 'Each acceleration component needs its own coordinate: aₓ = −μx/r³, not −μ/r³.',
      },
      hints: ['f returns d/dt of each entry of s, in the same order.', 'd/dt of (x, y) is (vx, vy); d/dt of (vx, vy) is the acceleration.'],
      teach: 'A second-order equation becomes first order by putting velocities in the state: f returns (velocities, accelerations), entry for entry.',
      explain: t`$\dot x = v_x$, $\dot y = v_y$, $\dot v_x = -\mu x/r^3$, $\dot v_y = -\mu y/r^3$. The array \`f\` returns lines up entry by entry with the state, which is what lets \`y + h * k\` mean “advance every component”.`,
    }),
    code({
      id: 'rk4-step', difficulty: 2,
      prompt: t`Write \`rk4_step(f, t, y, h)\` that takes **one** RK4 step for a system: \`y\` is a NumPy array, \`f(t, y)\` returns an array of the same shape, and the function returns the new state (without changing \`y\`). The tests use exponential decay and a harmonic oscillator, whose state is the pair $(x, v)$.`,
      starter: t`import numpy as np

def rk4_step(f, t, y, h):
    pass
`,
      answer: t`import numpy as np

def rk4_step(f, t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)`,
      tests: [
        { name: t`one step of $y' = -y$ from 1 with $h = 0.1$ gives $0.9048375$`, code: 'abs(rk4_step(lambda t, y: -y, 0.0, np.array([1.0]), 0.1)[0] - 0.9048375) < 1e-7' },
        { name: t`an oscillator $(x, v)' = (v, -x)$ stepped 100 times by $h = 2\pi/100$ returns to $(1, 0)$`, code: '(lambda f: (lambda Y: np.allclose(Y, [1, 0], atol=1e-6))(__import__("functools").reduce(lambda y, i: rk4_step(f, i * 2 * np.pi / 100, y, 2 * np.pi / 100), range(100), np.array([1.0, 0.0]))))(lambda t, s: np.array([s[1], -s[0]]))' },
        { name: 'the input state is left unchanged', code: '(lambda y0: (rk4_step(lambda t, y: -y, 0.0, y0, 0.1), y0[0] == 1.0)[1])(np.array([1.0]))' },
        { name: t`$t$ is passed to $f$: $y' = t$ from 0 to 0.2 gives 0.02 exactly`, code: 'abs(rk4_step(lambda t, y: np.array([t]), 0.0, np.array([0.0]), 0.2)[0] - 0.02) < 1e-15' },
      ],
      hints: ['Four slope evaluations, then one weighted average.', '`k2 = f(t + h / 2, y + h / 2 * k1)` — NumPy scales and adds the whole array.', 'Return `y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)`; writing `y += …` would change the caller’s array.'],
      teach: 'Written with array arithmetic, one RK4 step serves any system size; returning a new array (not y += …) keeps the caller’s state intact.',
      explain: t`The four stages and the 1–2–2–1 average. One step of decay gives $0.9048375$ against $e^{-0.1} = 0.9048374$, and the oscillator returns to $(1, 0)$ after a period to about $10^{-7}$. The expression \`y + …\` builds a new array; \`y += …\` would modify the array the caller still holds.`,
    }),
    num({
      id: 'order-from-errors', difficulty: 2,
      gen(r) {
        const [n1, method, p] = r.pick([[200, 'your RK4 orbit code', 4], [400, 'your RK4 orbit code', 4], [200, 'a colleague’s “RK4” orbit code', 2], [1000, 'a pendulum code using Euler’s method', 1]]);
        const e1 = (p === 1 ? 0.84 : ERR[n1]) * r.pick([1, 1.3]);
        const e2 = e1 / 2 ** p * r.pick([0.97, 1.03]);
        const pObs = Math.log2(e1 / e2);
        return {
          prompt: t`${method[0].toUpperCase() + method.slice(1)} ends ${e1 >= 1 ? e1.toFixed(1) : `$${tex(e1, 3)}$`} ${p === 1 ? 'mm' : 'km'} from the exact answer with ${n1} steps, and ${e2 >= 1 ? e2.toFixed(2) : `$${tex(e2, 3)}$`} ${p === 1 ? 'mm' : 'km'} with ${2 * n1} steps. What is the observed order $p$, where error $\propto h^p$?`,
          visual: {
            type: 'graph',
            params: { x: [lg(n1) - 0.15, lg(2 * n1) + 0.15], y: [lg(e2) - 0.6, lg(e1) + 0.6], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'steps', ylabel: 'error',
              points: [{ x: lg(n1), y: lg(e1), color: 'gold', r: 5 }, { x: lg(2 * n1), y: lg(e2), color: 'gold', r: 5 }],
              curves: [{ fn: `${lg(e1)} - (x - ${lg(n1)})*${pObs}`, color: 'ink3', dash: true, domain: [lg(n1), lg(2 * n1)] }] },
            caption: 'The two runs on log–log axes; the order is minus the slope.',
          },
          answer: pObs, tol: { rel: 0, abs: 0.15 },
          errors: [{ value: e1 / e2, feedback: 'That is the error ratio. The order is its base-2 logarithm, because the step was halved.' }],
          hints: [t`Halving $h$ divides the error by $2^p$.`, t`$p = \log_2(e_1/e_2)$.`],
          teach: 'Halve the step and take log₂ of the error ratio: about 4 for working RK4, 1 for Euler — anything else means a bug or a non-smooth problem.',
          explain: t`$p = \log_2(${(e1 / e2).toFixed(2)}) = ${pObs.toFixed(2)}$. ${p === 4 ? 'Fourth order: the RK4 code is behaving.' : p === 2 ? 'Second order from code that claims to be RK4 means a mistake in the stages — typically a stage built from the wrong k, or a weight of 2 missing.' : 'First order: Euler, as expected.'}`,
        };
      },
    }),
    mcq({
      id: 'alias', difficulty: 3,
      prompt: t`This driver returns a trajectory in which **every** row is the final state. Why?

\`\`\`python
y = y0.copy()
traj = [y]
for i in range(n):
    y += h * f(t, y)        # an Euler step, in place
    traj.append(y)
\`\`\``,
      visual: {
        type: 'py-memory',
        params: {
          code: ['y = y0.copy()', 'traj = [y]', 'y += h * f(t, y)', 'traj.append(y)'],
          steps: [{ line: 3, note: 'After two passes: `traj` holds three references to one array, which `+=` keeps changing.',
            frames: [{ name: 'Global frame', vars: [['y', '@A1'], ['traj', '@L1']] }],
            objects: { L1: { type: 'list', items: ['@A1', '@A1', '@A1'] }, A1: { type: 'array', items: [6.91, 1.12], dtype: 'float64' } },
            highlight: ['A1'] }],
        },
        caption: 'Names and objects after two steps, for a state of two numbers (values illustrative).',
      },
      choices: [
        '`+=` changes the one array in place, and `traj` stores references to that same array, so every entry shows its latest value',
        'Euler’s method converges to a fixed point, so all states become equal',
        '`append` copies only the first element of an array',
        'The loop variable `i` is not used, so the time never advances',
      ],
      answer: 0,
      why: {
        1: 'The rows are not merely close: they are identical, because they are one object.',
        2: '`append` stores a reference to the whole array — the same array each time.',
        3: 'Not using i (with f independent of t) is harmless here; the bug is the aliasing.',
      },
      hints: ['How many array objects does this loop ever create?', '`y += …` modifies the existing array; `y = y + …` creates a new one.'],
      teach: 'An in-place update on an array you have already stored changes the stored copy too; build a new array each step (y = y + …) or write into a preallocated Y[i + 1].',
      explain: t`Only one array exists: \`y += …\` mutates it, and \`traj\` holds $n + 1$ references to it, which all show the final state. Fix it with \`y = y + h * f(t, y)\` (a new array each step), \`traj.append(y.copy())\`, or — best — a preallocated \`Y = np.empty((n + 1, len(y0)))\` filled row by row, as in the Explore code. Lesson P1.4 met the same aliasing with lists.`,
    }),
    code({
      id: 'driver', difficulty: 3,
      prompt: t`Write the driver \`integrate(step, f, y0, t0, t1, n)\`: take \`n\` steps of size $h = (t_1 - t_0)/n$ with the stepper \`step(f, t, y, h)\`, and return **two arrays**: the times \`t\` (length $n + 1$) and the states \`Y\` (shape $(n + 1, \text{len}(y_0))$, row $i$ the state at time $t_i$). An \`euler_step\` and an \`rk4_step\` are provided; the tests use both.`,
      starter: t`import numpy as np

def euler_step(f, t, y, h):
    return y + h * f(t, y)

def rk4_step(f, t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def integrate(step, f, y0, t0, t1, n):
    pass
`,
      answer: t`import numpy as np

def euler_step(f, t, y, h):
    return y + h * f(t, y)

def rk4_step(f, t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def integrate(step, f, y0, t0, t1, n):
    h = (t1 - t0) / n
    t = t0 + h * np.arange(n + 1)
    Y = np.empty((n + 1, len(y0)))
    Y[0] = y0
    for i in range(n):
        Y[i + 1] = step(f, t[i], Y[i], h)
    return t, Y`,
      tests: [
        { name: 'shapes: 11 times and an 11 × 2 state array for n = 10', code: '(lambda r: r[0].shape == (11,) and r[1].shape == (11, 2))(integrate(euler_step, lambda t, y: -y, np.array([1.0, 2.0]), 0, 1, 10))' },
        { name: t`Euler on $y' = -y$: row $i$ is $0.9^i$`, code: 'np.allclose(integrate(euler_step, lambda t, y: -y, np.array([1.0]), 0, 1, 10)[1][:, 0], 0.9 ** np.arange(11))' },
        { name: t`times run from $t_0$ to $t_1$ (here 2 to 3)`, code: 'np.allclose(integrate(euler_step, lambda t, y: -y, np.array([1.0]), 2, 3, 4)[0], [2, 2.25, 2.5, 2.75, 3])' },
        { name: t`RK4 on $y' = \cos t$ from $t_0 = 1$ uses the right times: $y(3) - y(1) = \sin 3 - \sin 1$`, code: 'abs(integrate(rk4_step, lambda t, y: np.array([np.cos(t)]), np.array([0.0]), 1, 3, 40)[1][-1, 0] - (np.sin(3) - np.sin(1))) < 1e-8' },
      ],
      hints: ['`h = (t1 - t0) / n` and `t = t0 + h * np.arange(n + 1)`.', 'Preallocate `Y = np.empty((n + 1, len(y0)))` and set `Y[0] = y0`.', 'Loop `for i in range(n): Y[i + 1] = step(f, t[i], Y[i], h)`, then `return t, Y`.'],
      teach: 'A driver that takes the stepper and the physics as arguments, and fills a preallocated array, is reusable, testable and immune to aliasing.',
      explain: t`Passing functions as arguments separates the three concerns: physics (\`f\`), method (\`step\`) and bookkeeping (\`integrate\`). Each can be tested alone — Euler on $y' = -y$ gives exactly $0.9^i$ with $h = 0.1$ — and swapped without touching the others. The last test catches a driver that always starts its clock at 0.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-molniya', difficulty: 3, transfer: true,
      prompt: t`Mission design wants the Molniya orbit propagated to better than 1 km per revolution. Using the provided \`kepler\` and \`rk4_step\`, write \`miss(n)\`: integrate one period $T$ with \`n\` equal RK4 steps from perigee and return the distance (km) between the final position and the starting one. Then set \`n_needed\` to the smallest $n$ in \`[100, 200, 400, 800, 1600, 3200]\` with \`miss(n) < 1\`.`,
      starter: t`import numpy as np

mu = 398600.4418
rp, ra = 6378.137 + 600, 6378.137 + 39700
a = (rp + ra) / 2
T = 2 * np.pi * np.sqrt(a**3 / mu)
s0 = np.array([rp, 0, 0, np.sqrt(mu * (2 / rp - 1 / a))])

def kepler(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return np.array([vx, vy, -mu * x / r3, -mu * y / r3])

def rk4_step(f, t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def miss(n):
    pass

n_needed = None
`,
      answer: t`import numpy as np

mu = 398600.4418
rp, ra = 6378.137 + 600, 6378.137 + 39700
a = (rp + ra) / 2
T = 2 * np.pi * np.sqrt(a**3 / mu)
s0 = np.array([rp, 0, 0, np.sqrt(mu * (2 / rp - 1 / a))])

def kepler(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return np.array([vx, vy, -mu * x / r3, -mu * y / r3])

def rk4_step(f, t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def miss(n):
    h = T / n
    s = s0.copy()
    for i in range(n):
        s = rk4_step(kepler, i * h, s, h)
    return np.hypot(s[0] - s0[0], s[1] - s0[1])

n_needed = next(n for n in [100, 200, 400, 800, 1600, 3200] if miss(n) < 1)
print(n_needed, miss(n_needed))`,
      tests: [
        { name: t`with 400 steps the miss is $${ERR[400].toFixed(2)}$ km`, code: `abs(miss(400) - ${ERR[400]}) < 1e-3` },
        { name: t`${N_NEEDED} steps per orbit are needed`, code: `n_needed == ${N_NEEDED}` },
      ],
      hints: ['Inside `miss`, loop n times with `h = T / n`, updating the state with `rk4_step`.', 'The miss distance is `np.hypot(s[0] - s0[0], s[1] - s0[1])`.', '`n_needed = next(n for n in [...] if miss(n) < 1)` — or an ordinary loop with `break`.'],
      teach: 'Converge a simulation on the quantity you care about: halve the step until it changes by less than your tolerance.',
      explain: t`The misses are ${NS.map((n) => (ERR[n] >= 1 ? ERR[n].toFixed(1) : ERR[n].toFixed(3))).join(', ')} km, so ${N_NEEDED} steps — a step of ${(PER / N_NEEDED).toFixed(0)} s — is the first under 1 km. Without an exact answer to compare with, you would compare runs with $n$ and $2n$ steps: for a fourth-order method their difference is $15/16$ of the coarser run's error, a fine error estimate.`,
    }),
    mcq({
      id: 'cp-fixed-step', difficulty: 2,
      prompt: t`The dots mark where a fixed-step integrator puts its steps on the Molniya orbit. Why is a fixed step wasteful here?`,
      visual: {
        type: 'graph',
        params: { x: [-50, 12], y: [-22, 22], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (1000 km)', ylabel: 'y (1000 km)',
          curves: [{ param: [`${(A * (-ECC)) / 1e3} + ${A / 1e3}*cos(t)`, `${(A * Math.sqrt(1 - ECC * ECC)) / 1e3}*sin(t)`], t: [0, 6.2832], color: 'ink3', dash: true }],
          points: [{ x: 0, y: 0, color: 'accent', r: 6 }, ...ORBIT24.map((s) => ({ x: s[0] / 1e3, y: s[1] / 1e3, color: 'gold', r: 3 }))] },
        caption: 'Equal time steps around one Molniya orbit (every 133rd step of 3200).',
      },
      choices: [
        'The step is set by the brief, sharp perigee passage, so the long slow arc near apogee gets many more steps than its accuracy needs',
        'Fixed steps cannot integrate elliptical orbits at all',
        'The steps near apogee are too large and cause most of the error',
        'RK4 needs equal steps in space, not in time',
      ],
      answer: 0,
      why: {
        1: 'They can — the worked example did, with 800 steps for 1 km.',
        2: 'Near apogee the satellite moves slowly on a gently curving path: steps there are short in distance and the error per step is tiny.',
        3: 'RK4 steps in the independent variable, here time; equal time steps are what it was built for.',
      },
      hints: ['Where are the dots crowded, and where is the path most sharply curved?', 'The step has to be small enough for the hardest part of the orbit.'],
      teach: 'A fixed step must suit the hardest part of the trajectory; an adaptive solver changes h as it goes, which the next lesson’s solve_ivp does automatically.',
      explain: t`The satellite spends most of its ${(PER / 3600).toFixed(0)}-hour period near apogee, so most fixed steps land there, where the motion is slow and smooth; perigee, where the error is made, gets only a few. An adaptive method takes long steps near apogee and short ones at perigee, reaching the same accuracy with far fewer evaluations of $\vec f$ — see [solve_ivp](#/lesson/prog.P11.2).`,
    }),
    num({
      id: 'cp-predict', difficulty: 2,
      gen(r) {
        const n0 = r.pick([400, 800]), k = r.pick([2, 3, 4]);
        const e0 = ERR[n0], e = e0 / k ** 4;
        return {
          prompt: t`An RK4 run with ${n0} steps per orbit misses by ${e0 >= 1 ? e0.toFixed(2) : `$${tex(e0, 3)}$`} km. Estimate the miss with ${k * n0} steps, assuming the error is in its fourth-order regime.

\`\`\`python
miss(${n0})       # ${e0 >= 1 ? e0.toFixed(2) : e0.toPrecision(3)}
miss(${k * n0})   # ?
\`\`\``,
          answer: e, units: 'km', tol: { rel: 0.03 },
          errors: [{ value: e0 / k, feedback: 'That would be first order. RK4’s error scales as h⁴.' }, ...(k === 2 ? [] : [{ value: e0 / 2 ** 4, feedback: `The step shrinks by a factor of ${k}, not 2: divide by ${k}⁴.` }])],
          hints: [t`Error $\propto h^4$; the step shrinks by a factor of ${k}.`, t`Divide by $${k}^4 = ${k ** 4}$.`],
          teach: 'With a fourth-order method, k times more steps buy k⁴ times less error — while the error is in its asymptotic regime.',
          explain: t`$${e0 >= 1 ? e0.toFixed(2) : tex(e0, 3)}/${k ** 4} \approx ${tex(e, 2)}$ km. The actual run gives $${tex(missRK4(k * n0), 2)}$ km — close, because the error is already nearly in its $h^4$ regime. At far smaller errors round-off, not truncation, sets the floor.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Newman, Computational Physics, §8.1–8.3: Euler, Runge–Kutta, systems of equations', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Hairer, Nørsett & Wanner, Solving Ordinary Differential Equations I, §II.1', url: 'https://doi.org/10.1007/978-3-540-78862-1' },
    { label: 'Vallado, Fundamentals of Astrodynamics and Applications: Molniya orbits and numerical propagation', url: 'https://celestrak.org/software/vallado-sw.php' },
  ],
});
