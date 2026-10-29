// solve_ivp — SciPy's adaptive integrators: error control by rtol and atol,
// what the result object holds (y is components × times), events that
// locate apogee, perigee and impact to round-off, dense output, and the
// stiff-problem methods. The Molniya orbit of P11.1 again, a sounding
// rocket's coast with drag, and a shell's range.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { thou } from './_solvers.js';

const t = String.raw;

// ── what solve_ivp reports for the Molniya orbit in this Pyodide build (SciPy 1.18), checked by running the Explore code ──
const RUNS = [
  { rtol: '10^{-3}', nfev: 140, steps: 20, miss: 1785.9 },
  { rtol: '10^{-6}', nfev: 410, steps: 53, miss: 5.59 },
  { rtol: '10^{-9}', nfev: 1202, steps: 190, miss: 2.47e-3 },
  { rtol: '10^{-12}', nfev: 4550, steps: 750, miss: 1.19e-6 },
];
const MU = 398600.4418, RP = 6378.137 + 600, RA = 6378.137 + 39700, A = (RP + RA) / 2;
const PER = 2 * Math.PI * Math.sqrt(A ** 3 / MU), VP = Math.sqrt(MU * (2 / RP - 1 / A));
const APO_EVENT = { t: 21500.13132492, r: 46078.13701803 };   // solve_ivp, rtol = atol = 1e-10, event r·v = 0 falling
// the sounding rocket's coast (rtol 1e-10): apogee and impact
const ROCKET = { tApo: 142.2683287, hApo: 116958.48159, tHit: 306.17428616, xHit: 35401.64334 };
const VAC = 20e3 + (1500 * Math.sin((85 * Math.PI) / 180)) ** 2 / (2 * 9.80665);
// the shell with drag k = 0.0011 /m, 300 m/s, at 30°: range (rtol 1e-10)
const SHELL = { range: 1532.7083261, t: 17.1200971 };

export default lesson({
  id: 'prog.P11.2',
  title: 'solve_ivp',
  minutes: 13, difficulty: 3,
  intro: t`\`scipy.integrate.solve_ivp(f, (t0, t1), y0)\` is the hand-written RK4 of the last lesson grown up. Its default method, RK45, takes each step twice — with a 4th- and a 5th-order formula sharing the same slopes — and uses the difference as an estimate of the step's error. It accepts the step only if, for every component $i$,

$$\lvert e_i\rvert \;\le\; \text{atol} + \text{rtol}\times\lvert y_i\rvert$$

and otherwise shrinks $h$ and retries; when the error is comfortably small it lengthens $h$. So the step adapts to the problem — short at perigee, long at apogee. It also locates **events** (an apogee, an impact) to full precision, and offers implicit methods for stiff problems. The price: you must choose \`rtol\` and \`atol\`, because the defaults ($10^{-3}$ and $10^{-6}$) are loose.`,
  symbols: [
    { tex: 'e_i', text: 'the estimated local error of component $i$ in one step (the 4th–5th-order difference)' },
    { tex: t`\text{rtol}`, text: 'the relative tolerance: roughly how many correct digits you ask for per step (default $10^{-3}$)' },
    { tex: t`\text{atol}`, text: 'the absolute tolerance, in the units of each component: what counts as negligible when $y_i$ is near zero (default $10^{-6}$; may be an array, one per component)' },
    { tex: 'y_i', text: 'component $i$ of the state' },
  ],
  why: 'Almost every trajectory, reaction network or circuit you will simulate in research goes through an adaptive solver like this one; its tolerances and events decide whether the answer means anything.',
  visual: {
    type: 'code-runner',
    title: 'Adaptive steps around a Molniya orbit',
    lead: t`Press **Run**. The Molniya orbit of the last lesson, now with \`solve_ivp\` at four tolerances. The plot shows the step size the solver chose against time: tiny at perigee (the start and end), hundreds of times larger near apogee.`,
    tasks: [
      `Compare the cost: RK4 with fixed steps needed 800 steps × 4 = 3200 evaluations for a 1 km miss; rtol = 10⁻⁹ gets 2 metres for ${RUNS[2].nfev}.`,
      'Run with the default tolerances (delete rtol and atol): the satellite misses by almost 2000 km.',
      'Add method="DOP853" (an 8th-order pair): fewer evaluations for the same tight tolerance.',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

mu = 398600.4418                          # km³/s²
rp, ra = 6378.137 + 600, 6378.137 + 39700
a = (rp + ra) / 2
T = 2 * np.pi * np.sqrt(a**3 / mu)
s0 = np.array([rp, 0, 0, np.sqrt(mu * (2 / rp - 1 / a))])

def kepler(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3, -mu * y / r3]

fig, ax = plt.subplots()
for rtol in [1e-3, 1e-6, 1e-9, 1e-12]:
    sol = solve_ivp(kepler, (0, T), s0, rtol=rtol, atol=rtol * 1e-3)
    miss = np.hypot(sol.y[0, -1] - rp, sol.y[1, -1])
    print(f"rtol {rtol:.0e}: {sol.nfev:5d} evaluations, {len(sol.t) - 1:4d} steps, miss {miss:.2e} km")
    ax.semilogy(sol.t[1:] / 3600, np.diff(sol.t), ".-", ms=3, label=f"rtol = {rtol:.0e}")
ax.set_xlabel("time since perigee (h)")
ax.set_ylabel("step size (s)")
ax.set_ylim(1, 3e4)                       # the very first steps are cautious guesses, far smaller
ax.legend()
plt.show()`,
    },
    caption: 'A point-mass Earth, as before. The solver’s first few trial steps (below the plotted range) are tiny guesses it quickly enlarges. The miss distance is the true error here only because the exact orbit is known; in general you estimate it by tightening the tolerance and comparing.',
  },
  example: {
    prompt: t`Find when the Molniya satellite reaches apogee and how high it is there, by an **event**: apogee is where the radial velocity $\vec r\cdot\vec v$ crosses zero from positive to negative. Check both against the exact answers, $T/2$ and $r_a = ${thou(RA)}.137$ km.`,
    visual: {
      type: 'graph',
      params: { x: [0, 1.5 * PER / 3600], y: [-9, 9], aspect: 'wide', axesAt: 'edge', xlabel: 'time since perigee (h)', ylabel: 'r·v (10⁴ km²/s)',
        curves: [{ param: [`${PER / 3600}*(E - ${(RA - RP) / (RA + RP)}*sin(E))/(2*pi)`, `${(Math.sqrt(MU * A) * ((RA - RP) / (RA + RP))) / 1e4}*sin(E)`].map((s) => s.replace(/E/g, 't')), t: [0, 3 * Math.PI], color: 'accent' }],
        hlines: [{ y: 0, color: 'ink3' }],
        points: [{ x: PER / 2 / 3600, y: 0, color: 'gold', r: 6, label: 'apogee: falling through zero', labelDx: 8, labelDy: -10 }, { x: PER / 3600, y: 0, color: 'ink3', r: 5, label: 'perigee: rising', labelDx: 8, labelDy: 16 }] },
      caption: 'The radial velocity r·v over one and a half orbits (computed from the exact Kepler solution). Events fire where it crosses zero, in the chosen direction.',
    },
    steps: [
      { label: 'Write the event', text: t`An event is a function of \`(t, y)\` whose **zero** marks the moment. Attributes on the function set the options: \`direction = -1\` fires only when it falls through zero (apogee, not perigee); \`terminal = True\` would also stop the integration there.

\`\`\`python
def apogee(t, s):
    x, y, vx, vy = s
    return x * vx + y * vy          # r · v
apogee.direction = -1
\`\`\`` },
      { label: 'Solve with it', text: t`\`\`\`python
sol = solve_ivp(kepler, (0, 1.5 * T), s0, rtol=1e-10, atol=1e-10,
                events=apogee)
t_apo = sol.t_events[0][0]                   # one list per event function
r_apo = np.hypot(*sol.y_events[0][0][:2])
\`\`\`

The solver watches the event function's sign across each step; when it changes, it root-finds on the step's interpolating polynomial (dense output) to pin the moment down.` },
      { label: 'Compare', text: t`It reports $t = ${APO_EVENT.t.toFixed(5)}$ s against $T/2 = ${(PER / 2).toFixed(5)}$ s, and $r = ${APO_EVENT.r.toFixed(5)}$ km against ${RA.toFixed(3)} km: a timing error of about $${tex(APO_EVENT.t - PER / 2, 1)}$ s and a radius error of ${((APO_EVENT.r - RA) * 1e5).toFixed(0)} cm — the event is located as accurately as the orbit itself is computed.` },
      { label: 'Sense check', text: t`Half a period, ${(PER / 7200).toFixed(2)} h after perigee: of course — but the same five lines find apogee for an orbit perturbed by drag or a third body, where no formula exists. The perigee, at $t = T$, was not reported because of \`direction = -1\`.` },
    ],
    answer: t`Apogee at $t \approx ${APO_EVENT.t.toFixed(2)}$ s ($= T/2$) and $r \approx ${APO_EVENT.r.toFixed(3)}$ km, both correct to the integration's accuracy.`,
  },
  practice: [
    mcq({
      id: 'shape', difficulty: 1,
      prompt: t`After \`sol = solve_ivp(kepler, (0, T), [x0, y0, vx0, vy0])\`, which expression is the **array of x positions** over time?

\`\`\`python
sol = solve_ivp(kepler, (0, T), [x0, y0, vx0, vy0])
print(sol.y.shape)      # (4, 191)
\`\`\``,
      choices: ['`sol.y[0]`', '`sol.y[:, 0]`', '`sol.t`', '`sol.y[0, 0]`'],
      answer: 0,
      why: {
        1: 'That is the whole state (x, y, vx, vy) at the first time — one column.',
        2: '`sol.t` holds the times of the steps, not positions.',
        3: 'That is one number: x at the first time.',
      },
      hints: ['The shape is (number of components, number of times).', 'A row is one component through time; a column is the whole state at one time.'],
      teach: 'solve_ivp returns y with shape (components, times): sol.y[i] is component i through time, sol.y[:, k] the state at time sol.t[k] — the transpose of the P11.1 driver’s layout.',
      explain: t`\`sol.y[0]\` is the first row: $x$ at every time in \`sol.t\`. Note this is the transpose of the \`Y\` built in the last lesson (rows = times); \`sol.y.T\` converts. The times themselves are wherever the adaptive steps landed — unequally spaced — unless you ask for \`t_eval\`.`,
    }),
    num({
      id: 'tol', difficulty: 2,
      gen(r) {
        const [what, y, unit] = r.pick([['a position of 42 164 km', 42164, 'km'], ['a speed of 3.07 km/s', 3.07, 'km/s'], ['a position of 6978 km', 6978, 'km']]);
        const rtol = r.pick([1e-6, 1e-8, 1e-10]), atol = r.pick([1e-6, 1e-9]);
        const allowed = atol + rtol * y;
        return {
          prompt: t`With \`rtol=${rtol.toExponential().replace('e-', 'e-')}\` and \`atol=${atol.toExponential()}\`, how large a local error per step does \`solve_ivp\` accept on a component holding ${what}? Answer in ${unit}.

\`\`\`python
solve_ivp(f, t_span, y0, rtol=${rtol.toExponential()}, atol=${atol.toExponential()})
\`\`\``,
          answer: allowed, units: unit, tol: { rel: 0.01 },
          errors: [{ value: rtol, feedback: 'rtol is relative: multiply it by the size of the component.' }, ...(Math.abs(atol / allowed - 1) > 0.05 ? [{ value: atol, feedback: 'atol is only the floor; the relative part rtol × |y| adds to it.' }] : [])],
          hints: [t`The test is $\lvert e\rvert \le \text{atol} + \text{rtol}\,\lvert y\rvert$.`, t`$${tex(atol)} + ${tex(rtol)}\times${y}$.`],
          teach: 'The accepted error per step is atol + rtol·|y|, in the units of that component; whichever term is larger sets the accuracy.',
          explain: t`$${tex(atol)} + ${tex(rtol)}\times${y} = ${tex(allowed, 2)}$ ${unit}${unit === 'km' ? ` — about $${tex(allowed * 1e5, 2)}$ cm` : ''}. ${rtol * y > atol ? 'The relative term dominates, as it should for a component far from zero.' : 'Here atol dominates: the absolute floor sets the accuracy.'} Errors also accumulate over many steps, so the global error is usually larger than one step's tolerance.`,
        };
      },
    }),
    mcq({
      id: 'defaults', difficulty: 2,
      prompt: t`Integrating the Molniya orbit with the defaults returns this. What went wrong?

\`\`\`python
sol = solve_ivp(kepler, (0, T), s0)          # no rtol, atol
print(sol.success, sol.nfev, miss(sol))
True 140 1785.87
\`\`\``,
      choices: [
        'Nothing failed: the default rtol = 10⁻³ asks for only about three digits per step, and the errors add up to a 1786 km miss',
        'RK45 cannot integrate eccentric orbits',
        'sol.success is True, so the result is accurate and the miss must be a bug in miss()',
        'The solver ran out of steps; increasing `max_step` would fix it',
      ],
      answer: 0,
      why: {
        1: 'It handles them well with a sensible tolerance — 2 m for 1202 evaluations at rtol = 10⁻⁹.',
        2: '`success` only means the solver reached t1 without breaking down. It says nothing about accuracy.',
        3: 'There is no step limit, and `max_step` only caps the step size — it would add steps, not fix the tolerance.',
      },
      hints: ['What are solve_ivp’s default rtol and atol?', 'Does success = True mean accurate?'],
      teach: 'Always set rtol and atol for physics: the defaults (10⁻³, 10⁻⁶) are meant for a quick look, and success = True only means the run finished.',
      explain: t`With \`rtol=1e-3\` each step may be wrong in the third digit; around perigee those errors are amplified. \`success\` is \`True\` because nothing broke. Choose \`rtol\` from the accuracy you need (say $10^{-9}$), set \`atol\` to what is negligible in each component's units, and confirm by tightening both until the answer stops changing.`,
    }),
    code({
      id: 'range', difficulty: 3,
      prompt: t`A shell leaves the ground at 300 m/s, ${30}° above horizontal, with quadratic drag: $\dot{\vec v} = -k\lvert\vec v\rvert\vec v - g\hat y$, $k = 0.0011\ \text{m}^{-1}$, $g = 9.81\ \text{m/s}^2$. Write a **terminal** event \`hit\` that stops the integration when $y$ falls through 0, solve with \`rtol=1e-10, atol=1e-10\` over $0 \le t \le 100$ s, and set \`rng\` to the horizontal range (m) and \`t_flight\` to the flight time (s).`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

k, g = 0.0011, 9.81

def shell(t, s):
    x, y, vx, vy = s
    v = np.hypot(vx, vy)
    return [vx, vy, -k * v * vx, -g - k * v * vy]

a = np.radians(30)
s0 = [0, 0, 300 * np.cos(a), 300 * np.sin(a)]

rng = None
t_flight = None
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

k, g = 0.0011, 9.81

def shell(t, s):
    x, y, vx, vy = s
    v = np.hypot(vx, vy)
    return [vx, vy, -k * v * vx, -g - k * v * vy]

a = np.radians(30)
s0 = [0, 0, 300 * np.cos(a), 300 * np.sin(a)]

def hit(t, s):
    return s[1]
hit.terminal = True
hit.direction = -1

sol = solve_ivp(shell, (0, 100), s0, events=hit, rtol=1e-10, atol=1e-10)
t_flight = sol.t_events[0][0]
rng = sol.y_events[0][0][0]
print(rng, t_flight)`,
      tests: [
        { name: t`range ${SHELL.range.toFixed(2)} m`, code: `abs(rng - ${SHELL.range}) < 0.01` },
        { name: t`flight time ${SHELL.t.toFixed(3)} s`, code: `abs(t_flight - ${SHELL.t}) < 1e-4` },
        { name: 'the event fires on the way down, not at launch', code: 't_flight > 1' },
      ],
      hints: ['The event function returns the height `s[1]`; its zero is the impact.', 'Set `hit.terminal = True` and `hit.direction = -1` (falling) — otherwise the launch, where y starts at 0, may count.', '`sol.t_events[0][0]` is the impact time; `sol.y_events[0][0][0]` is x at that moment.'],
      teach: 'A terminal event with a direction ends the integration exactly at the physical moment, instead of overshooting to t1 and interpolating by hand.',
      explain: t`Range ${SHELL.range.toFixed(1)} m after ${SHELL.t.toFixed(2)} s. Without drag the shell would travel $v^2\sin 2\theta/g = ${((300 ** 2 * Math.sin(Math.PI / 3)) / 9.81).toFixed(0)}$ m — drag this strong takes away more than 80% of it, and moves the best launch angle well below 45°. \`direction = -1\` matters: at $t = 0$ the height is exactly 0, and the event must not fire there.`,
    }),
    mcq({
      id: 'stiff', difficulty: 3,
      prompt: t`A two-temperature model of a heated panel couples a thin coating that equilibrates in 1 ms to a structure that warms over minutes. Integrating 600 s with \`rtol=atol=1e-6\`:

\`\`\`python
def f(t, y):
    Tc, Ts = y                       # coating and structure, K
    return [(Ts - Tc) / 1e-3 + 50.0, (Tc - Ts) / 120.0]

solve_ivp(f, (0, 600), [300, 300], method="RK45").nfev    # 1268420
solve_ivp(f, (0, 600), [300, 300], method="Radau").nfev   # 86
\`\`\`

Why does RK45 work so hard?`,
      choices: [
        'The problem is stiff: an explicit method must keep h below about the fastest time constant for stability, long after that fast mode has died out; implicit methods such as Radau and BDF are stable with large steps',
        'RK45 is a low-order method and Radau a high-order one',
        'RK45 needs smaller steps because it is less accurate on smooth solutions',
        'Radau skips the fast mode entirely and is therefore less accurate',
      ],
      answer: 0,
      why: {
        1: 'Radau IIA here is 5th order — the same as RK45. Order is not the issue.',
        2: 'The solution is smooth; it is stability, not accuracy, that pins RK45’s step near 1 ms.',
        3: 'Radau resolves the fast mode while it matters and then takes long steps; both meet the same tolerance.',
      },
      hints: ['How small must an explicit step be to stay stable for a mode decaying in 1 ms?', 'Recall the stability limit of Euler’s method on y′ = −λy: h < 2/λ.'],
      teach: 'Stiffness — widely separated time scales — forces explicit methods to tiny steps for stability; switch to method="Radau", "BDF" or "LSODA".',
      explain: t`An explicit method on a mode with rate $\lambda = 1000\ \text{s}^{-1}$ is unstable unless $h \lesssim 3/\lambda$, a few milliseconds — so 600 s costs hundreds of thousands of steps, even after the fast mode has decayed. Implicit methods solve a small linear system each step and stay stable at any $h$; their steps follow the slow physics. A sign of stiffness: RK45's step size stays tiny while the solution looks smooth.`,
    }),
    code({
      id: 'molniya-ivp', difficulty: 2,
      prompt: t`Redo the last lesson's checkpoint with \`solve_ivp\`: integrate the Molniya orbit for one period with \`method="DOP853"\` and equal \`rtol\` and \`atol\` chosen by you, so that the satellite returns within **1 km** of perigee using **fewer than 800** evaluations of the right-hand side (fixed-step RK4 needed 3200). Store the result in \`sol\`.`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

mu = 398600.4418
rp, ra = 6378.137 + 600, 6378.137 + 39700
a = (rp + ra) / 2
T = 2 * np.pi * np.sqrt(a**3 / mu)
s0 = np.array([rp, 0, 0, np.sqrt(mu * (2 / rp - 1 / a))])

def kepler(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3, -mu * y / r3]

sol = solve_ivp(kepler, (0, T), s0)
print(sol.nfev, np.hypot(sol.y[0, -1] - rp, sol.y[1, -1]))
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

mu = 398600.4418
rp, ra = 6378.137 + 600, 6378.137 + 39700
a = (rp + ra) / 2
T = 2 * np.pi * np.sqrt(a**3 / mu)
s0 = np.array([rp, 0, 0, np.sqrt(mu * (2 / rp - 1 / a))])

def kepler(t, s):
    x, y, vx, vy = s
    r3 = (x * x + y * y) ** 1.5
    return [vx, vy, -mu * x / r3, -mu * y / r3]

sol = solve_ivp(kepler, (0, T), s0, method="DOP853", rtol=1e-8, atol=1e-8)
print(sol.nfev, np.hypot(sol.y[0, -1] - rp, sol.y[1, -1]))`,
      tests: [
        { name: 'it ends within 1 km of perigee', code: 'np.hypot(sol.y[0, -1] - rp, sol.y[1, -1]) < 1' },
        { name: 'it uses fewer than 800 evaluations', code: 'sol.nfev < 800' },
        { name: 'it reaches one full period', code: 'abs(sol.t[-1] - T) < 1e-6' },
      ],
      hints: ['Add `method="DOP853"` and tolerances to the call.', 'Try `rtol=1e-8, atol=1e-8`, print the miss and nfev, and adjust by factors of 10.'],
      teach: 'A high-order adaptive method with a tolerance chosen for the job beats a fixed-step method by an order of magnitude in cost.',
      explain: t`Tolerances around $10^{-8}$ do it with a few hundred evaluations: the 8th-order DOP853 takes long steps through the slow arc and short ones at perigee. Looser, and the miss exceeds 1 km; much tighter, and the cost passes 800. Comparing runs at two tolerances is the honest way to estimate the error when there is no exact answer.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-sounding', difficulty: 3, transfer: true,
      prompt: t`A sounding rocket burns out at 20 km altitude moving at 1500 m/s, $85°$ above horizontal. It then coasts: gravity $g = g_0\,(R/(R + h))^2$ ($g_0 = 9.80665\ \text{m/s}^2$, $R = 6371$ km) and drag $-k\lvert\vec v\rvert\vec v$ with $k = \rho(h)\,C_DA/(2m)$, $\rho = 1.225\,e^{-h/8500\ \text{m}}$ kg/m³, $C_DA = 0.01\ \text{m}^2$, $m = 50$ kg (flat Earth otherwise). The coast function is written. Add two events — **apogee** (vertical velocity falling through 0) and **impact** (terminal, height falling through 0) — solve with \`rtol=1e-10, atol=1e-9\` over 2000 s, and set \`h_apo\` (m), \`t_apo\` (s) and \`x_impact\` (m, downrange).`,
      visual: {
        type: 'graph',
        params: { x: [0, 40], y: [0, 140], aspect: 'wide', axesAt: 'edge', xlabel: 'downrange (km)', ylabel: 'altitude (km)',
          curves: [{ fn: `20 + x*tan(85*pi/180) - 9.80665*x^2/(2*1.5^2*cos(85*pi/180)^2*1000)`, color: 'ink3', dash: true, domain: [0, 2 * 1.5 ** 2 * Math.cos((85 * Math.PI) / 180) * Math.sin((85 * Math.PI) / 180) * 1000 / 9.80665 + 0.1] }],
          points: [{ x: 0, y: 20, color: 'gold', r: 5, label: 'burnout', labelDx: 8, labelDy: 4 }] },
        caption: 'For comparison only: the vacuum, constant-g arc from burnout (dashed). Drag and weakening gravity change both its height and its range.',
      },
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

g0, R = 9.80665, 6371e3

def coast(t, s, m=50.0, CdA=0.01):
    x, h, vx, vh = s
    rho = 1.225 * np.exp(-h / 8500)
    v = np.hypot(vx, vh)
    k = 0.5 * rho * CdA / m
    g = g0 * (R / (R + h)) ** 2
    return [vx, vh, -k * v * vx, -g - k * v * vh]

th = np.radians(85)
s0 = [0, 20e3, 1500 * np.cos(th), 1500 * np.sin(th)]

h_apo = None
t_apo = None
x_impact = None
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

g0, R = 9.80665, 6371e3

def coast(t, s, m=50.0, CdA=0.01):
    x, h, vx, vh = s
    rho = 1.225 * np.exp(-h / 8500)
    v = np.hypot(vx, vh)
    k = 0.5 * rho * CdA / m
    g = g0 * (R / (R + h)) ** 2
    return [vx, vh, -k * v * vx, -g - k * v * vh]

th = np.radians(85)
s0 = [0, 20e3, 1500 * np.cos(th), 1500 * np.sin(th)]

def apogee(t, s):
    return s[3]
apogee.direction = -1

def impact(t, s):
    return s[1]
impact.terminal = True
impact.direction = -1

sol = solve_ivp(coast, (0, 2000), s0, events=[apogee, impact], rtol=1e-10, atol=1e-9)
t_apo, h_apo = sol.t_events[0][0], sol.y_events[0][0][1]
x_impact = sol.y_events[1][0][0]
print(h_apo, t_apo, x_impact)`,
      tests: [
        { name: t`apogee ${(ROCKET.hApo / 1e3).toFixed(3)} km`, code: `abs(h_apo - ${ROCKET.hApo}) < 1` },
        { name: t`reached ${ROCKET.tApo.toFixed(2)} s after burnout`, code: `abs(t_apo - ${ROCKET.tApo}) < 0.01` },
        { name: t`impact ${(ROCKET.xHit / 1e3).toFixed(2)} km downrange`, code: `abs(x_impact - ${ROCKET.xHit}) < 1` },
      ],
      hints: ['Two event functions: `apogee` returns `s[3]` (vertical velocity), `impact` returns `s[1]` (height).', 'Set `apogee.direction = -1`; set `impact.terminal = True` and `impact.direction = -1`.', 'Pass `events=[apogee, impact]`; then `sol.t_events[0]`, `sol.y_events[0]` belong to apogee and index `[1]` to impact.'],
      teach: 'Several events can be watched at once; each gets its own list in `t_events` and `y_events`, and only terminal ones stop the run.',
      explain: t`Apogee is ${(ROCKET.hApo / 1e3).toFixed(1)} km at ${ROCKET.tApo.toFixed(1)} s, and the payload lands ${(ROCKET.xHit / 1e3).toFixed(1)} km downrange after ${ROCKET.tHit.toFixed(0)} s. In vacuum with constant $g$ the apogee would be ${(VAC / 1e3).toFixed(1)} km: drag in the first few kilometres of thick air costs about ${((VAC - ROCKET.hApo) / 1e3).toFixed(0)} km of height. Even \`rtol=1e-3\` gets the apogee within a few metres here — but you only know that by trying both.`,
    }),
    mcq({
      id: 'cp-missed', difficulty: 3,
      prompt: t`A satellite's event \`in_eclipse(t, s)\` changes sign when it enters Earth's shadow. Over a 30-day run with \`rtol=1e-9\`, \`sol.t_events\` lists far fewer eclipses than there are orbits. Why, and what fixes it?

\`\`\`python
sol = solve_ivp(f, (0, 30 * 86400), s0, rtol=1e-9, events=in_eclipse)
len(sol.t_events[0])     # far too few
\`\`\``,
      choices: [
        'The solver checks the sign only at the ends of each step; if the function crosses zero and back within one long step, the event is missed. Cap the step with `max_step` (here, a fraction of the eclipse length)',
        'rtol is too tight, so the solver rejects the steps where eclipses happen',
        'Events can be found only once per solve_ivp call',
        'Event functions must be terminal to be reported',
      ],
      answer: 0,
      why: {
        1: 'Tighter tolerances only make steps shorter, which helps.',
        2: 'A non-terminal event is reported every time it occurs.',
        3: 'Non-terminal events are recorded and the run continues; that is the default.',
      },
      hints: ['When does the solver look at the event function?', 'An eclipse lasts about half an hour; how long can an adaptive step on a smooth orbit become?'],
      teach: 'Events are detected by a sign change between step ends, so an event shorter than a step can be missed; bound the step with `max_step`.',
      explain: t`On a smooth orbit the adaptive step can grow to many minutes. An entry and exit within one step leave the event function with the same sign at both ends, and nothing is found. Setting \`max_step\` below the shortest event duration (or writing the event so that it crosses zero once per orbit, such as a shadow-entry angle) makes detection reliable.`,
    }),
    mcq({
      id: 'cp-teval', difficulty: 2,
      prompt: t`To get a smoother, more accurate orbit, a student adds 10 000 output times:

\`\`\`python
sol = solve_ivp(kepler, (0, T), s0, t_eval=np.linspace(0, T, 10_000))
\`\`\`

What changes?`,
      choices: [
        'Only the output: the solver takes the same steps and interpolates its answer at the requested times, so the accuracy is unchanged',
        'The solver now takes 10 000 steps, so the answer is far more accurate',
        'The default tolerances are tightened in proportion to the number of points',
        'The run fails, because `t_eval` must match the steps the solver takes',
      ],
      answer: 0,
      why: {
        1: 'The steps are still chosen by the error control; `t_eval` does not touch them.',
        2: 'Tolerances are only what you pass (or the defaults).',
        3: 'Interpolation (dense output) handles any times inside the span.',
      },
      hints: ['What decides the step size in solve_ivp?'],
      teach: '`t_eval` and `dense_output` change where you see the solution, not how accurately it is computed; accuracy is rtol and atol.',
      explain: t`The orbit is computed exactly as before (with the default, loose tolerances — still a ~1800 km miss) and then evaluated at 10 000 times from each step's interpolating polynomial. The plot looks smoother; it is no more correct. For accuracy, tighten \`rtol\` and \`atol\`; for smooth plots or events, use \`t_eval\` or \`dense_output=True\`.`,
    }),
  ],
  sources: [
    { label: 'SciPy reference: scipy.integrate.solve_ivp (methods, rtol/atol, events, dense output)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html' },
    { label: 'Dormand & Prince (1980), A family of embedded Runge–Kutta formulae, J. Comput. Appl. Math. 6, 19', url: 'https://doi.org/10.1016/0771-050X(80)90013-3' },
    { label: 'Hairer & Wanner, Solving Ordinary Differential Equations II: Stiff Problems, §IV.1', url: 'https://doi.org/10.1007/978-3-642-05221-7' },
  ],
});
