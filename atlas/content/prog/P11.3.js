// Energy conservation as an accuracy check — the relative energy error of
// an orbit integrator, RK4's secular drift against the bounded error of the
// symplectic leapfrog over hundreds of orbits, why conservation is necessary
// but not sufficient (phase error, angular momentum conserved by
// construction), and Euler's exponential blow-up on an oscillator.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { rk4Step, leapfrogStep, kepler2d, orbitEnergy } from './_solvers.js';

const t = String.raw;

// ── an e = 0.6 orbit, GM = a = 1 (period 2π): RK4 with n steps per orbit against leapfrog with 4n (equal force evaluations) ──
function race(e, n, orbits, keep) {
  const rp = 1 - e, s0 = [rp, 0, 0, Math.sqrt((1 + e) / rp)], E0 = orbitEnergy(1, s0), f = kepler2d(1), T = 2 * Math.PI;
  let y = s0, z = s0; const out = {};
  for (let k = 1; k <= orbits; k++) {
    for (let i = 0; i < n; i++) y = rk4Step(f, 0, y, T / n);
    for (let i = 0; i < 4 * n; i++) z = leapfrogStep(1, z, T / (4 * n));
    if (keep.includes(k)) out[k] = { rk: (orbitEnergy(1, y) - E0) / E0, lf: (orbitEnergy(1, z) - E0) / E0, prk: Math.atan2(y[1], y[0]), plf: Math.atan2(z[1], z[0]) };
  }
  return out;
}
const R = race(0.6, 100, 1000, [1, 10, 100, 1000]);
const R200 = race(0.6, 200, 1, [1]);
const PSR = race(0.617, 100, 300, [300])[300];      // the checkpoint: Hulse–Taylor-like eccentricity
// the measured order of RK4's energy error per orbit, from n = 100 and 200
const P_OBS = Math.log2(R[1].rk / R200[1].rk);
const N_FOR = (target) => 200 * (R200[1].rk / target) ** (1 / P_OBS);

// ── the harmonic oscillator after 100 periods with h = T/100 (ω = 1): energy ratios ──
const SHO = (() => {
  const h = (2 * Math.PI) / 100; let xe = 1, ve = 0, xs = 1, vs = 0, xv = 1, vv = 0, y = [1, 0];
  const g = (tt, s) => [s[1], -s[0]];
  for (let i = 0; i < 10000; i++) { [xe, ve] = [xe + h * ve, ve - h * xe]; vs -= h * xs; xs += h * vs; vv -= (h / 2) * xv; xv += h * vv; vv -= (h / 2) * xv; y = rk4Step(g, 0, y, h); }
  return { euler: xe * xe + ve * ve, symp: xs * xs + vs * vs, verlet: xv * xv + vv * vv, rk4: y[0] ** 2 + y[1] ** 2 };
})();
const lg = Math.log10;
const fmtE = (x) => tex(x, 2);

export default lesson({
  id: 'prog.P11.3',
  title: 'Energy conservation as an accuracy check',
  minutes: 12, difficulty: 3,
  intro: t`For most simulations you do not know the exact answer — but you often know something that must **not** change: energy, angular momentum, total charge. Printing its relative change is the cheapest test there is:

$$\frac{\Delta E}{E_0} = \frac{E(t) - E_0}{E_0}, \qquad E = \tfrac12 v^2 - \frac{GM}{r}$$

It reveals more than accuracy. A general-purpose method like RK4 lets the energy of an orbit **drift** steadily, a little every orbit. A **symplectic** method such as leapfrog (velocity Verlet) — kick the velocity by $\tfrac h2\vec a$, drift the position by $h\vec v$, kick again by $\tfrac h2\vec a$ at the new position — keeps the energy error **bounded** for ever, which is why planetary and N-body codes use it. But a conserved energy is a necessary check, not a sufficient one.`,
  symbols: [
    { tex: t`\Delta E/E_0`, text: 'the relative energy error; for a bound orbit $E_0 < 0$, so mind the sign' },
    { tex: 'E', text: 'the specific orbital energy (per unit mass), J/kg or, in units with $GM = 1$, dimensionless' },
    { tex: 'v,\\ r', text: 'the speed and the distance from the central mass' },
    { tex: 'GM', text: 'the gravitational parameter of the central body' },
    { tex: t`\vec a`, text: 'the acceleration, $-GM\\vec r/r^3$, evaluated at the current position' },
  ],
  why: 'Conserved quantities are free unit tests for a simulation: they cost one line, need no reference solution, and catch both bugs and slow numerical drift over long runs.',
  visual: {
    type: 'code-runner',
    title: 'Three hundred orbits, two integrators',
    lead: t`Press **Run**. An orbit of eccentricity 0.6 (units with $GM = 1$, period $2\pi$) is integrated for 300 orbits by RK4 with 100 steps per orbit and by leapfrog with 400 — the same number of force evaluations. The plot shows $\lvert\Delta E/E_0\rvert$ at the end of each orbit, on log–log axes.`,
    tasks: [
      'RK4’s error grows in a straight line of slope 1: the same drift every orbit. Leapfrog’s rises for a few dozen orbits, then levels off and never grows again.',
      'Read the printed angles: where should the body be after a whole number of orbits? Which method is closer after one orbit, and after 300?',
      'Halve both step sizes. RK4’s drift falls about 32-fold; leapfrog’s level falls about 4-fold (it is second order).',
    ],
    params: {
      rows: 26,
      code: t`import math
import matplotlib.pyplot as plt

e = 0.6                                       # units with GM = 1, a = 1: period 2π
s0 = (1 - e, 0.0, 0.0, math.sqrt((1 + e) / (1 - e)))   # x, y, vx, vy at perihelion

def accel(x, y):
    r3 = (x * x + y * y) ** 1.5
    return -x / r3, -y / r3

def energy(s):
    x, y, vx, vy = s
    return 0.5 * (vx * vx + vy * vy) - 1 / math.hypot(x, y)

def rk4_step(s, h):
    def f(s):
        ax, ay = accel(s[0], s[1])
        return (s[2], s[3], ax, ay)
    k1 = f(s)
    k2 = f(tuple(a + h / 2 * b for a, b in zip(s, k1)))
    k3 = f(tuple(a + h / 2 * b for a, b in zip(s, k2)))
    k4 = f(tuple(a + h * b for a, b in zip(s, k3)))
    return tuple(a + h / 6 * (p + 2 * q + 2 * r + w) for a, p, q, r, w in zip(s, k1, k2, k3, k4))

def leapfrog_step(s, h):                      # kick, drift, kick
    x, y, vx, vy = s
    ax, ay = accel(x, y)                      # (a real code reuses the last kick's value)
    vx += h / 2 * ax; vy += h / 2 * ay
    x += h * vx; y += h * vy
    ax, ay = accel(x, y)
    vx += h / 2 * ax; vy += h / 2 * ay
    return (x, y, vx, vy)

E0, orbits, n = energy(s0), 300, 100
fig, ax = plt.subplots()
for step, steps, name in [(rk4_step, n, "RK4"), (leapfrog_step, 4 * n, "leapfrog")]:
    s, h, err = s0, 2 * math.pi / steps, []
    for k in range(orbits):
        for i in range(steps):
            s = step(s, h)
        err.append(abs((energy(s) - E0) / E0))
    print(f"{name:9s} |ΔE/E| after 1, 300 orbits: {err[0]:.1e}, {err[-1]:.1e};"
          f"  angle now {math.degrees(math.atan2(s[1], s[0])):7.1f}° (exact: 0°)")
    ax.loglog(range(1, orbits + 1), err, label=f"{name}, {steps} steps/orbit")
ax.set_xlabel("orbits")
ax.set_ylabel("|ΔE / E₀| at the end of the orbit")
ax.legend()
plt.show()`,
    },
    caption: 'A two-body orbit with fixed steps and no perturbations. The error is sampled every 2π of time. Within each orbit leapfrog’s energy error swings up and down, largest near perihelion; as its phase slips, the samples land on different parts of that swing — hence the rise to a plateau, which is the swing’s bounded size.',
  },
  example: {
    prompt: t`Compare RK4 (100 steps per orbit) and leapfrog (400 steps per orbit, the same number of force evaluations) on the $e = 0.6$ orbit, by energy **and** by where the body is after a whole number of orbits — it should be back at perihelion, at angle 0.`,
    visual: {
      type: 'graph',
      params: { x: [-0.2, 3.2], y: [-5.5, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'orbits', ylabel: '|ΔE/E₀|',
        points: [1, 10, 100, 1000].flatMap((k) => [{ x: lg(k), y: lg(Math.abs(R[k].rk)), color: 'warn', r: 5 }, { x: lg(k), y: lg(Math.abs(R[k].lf)), color: 'good', r: 5 }]),
        legend: [{ label: 'RK4, 100 steps/orbit', color: 'warn', point: true }, { label: 'leapfrog, 400 steps/orbit', color: 'good', point: true }], legendAt: 'br' },
      caption: 'Energy errors after 1, 10, 100 and 1000 orbits, computed in double precision.',
    },
    steps: [
      { label: 'Measure', text: t`After each block of orbits print $\Delta E/E_0$ and the angle $\operatorname{atan2}(y, x)$:

$$\begin{array}{c|c|c|c|c} \text{orbits} & \Delta E/E_0\ \text{(RK4)} & \Delta E/E_0\ \text{(leapfrog)} & \text{angle (RK4)} & \text{angle (leapfrog)} \\ \hline ${[1, 10].map((k) => `${k} & ${fmtE(R[k].rk)} & ${fmtE(R[k].lf)} & ${R[k].prk.toFixed(3)} & ${R[k].plf.toFixed(3)}`).join(t` \\ `)} \\ ${[100, 1000].map((k) => t`${k} & ${fmtE(R[k].rk)} & ${fmtE(R[k].lf)} & \text{—} & \text{—}`).join(t` \\ `)} \end{array}$$

(angles in radians; after 100 orbits both phases have wandered too far to quote meaningfully).` },
      { label: 'Read the energy', text: t`RK4's error grows tenfold for every tenfold in time: a **secular drift** of about $${fmtE(R[1].rk)}$ per orbit, always the same sign: $\Delta E/E_0 > 0$ with $E_0 < 0$ means the energy is becoming more negative, so the orbit slowly loses energy and shrinks. Leapfrog's sits near $${fmtE(R[1000].lf)}$ whether you look after 100 orbits or 1000. Leapfrog is *symplectic*: it exactly conserves a slightly perturbed “shadow” energy, so the true energy can only oscillate about it.` },
      { label: 'Read the position', text: t`After **one** orbit RK4 is the more accurate: $${R[1].prk.toFixed(3)}$ rad from perihelion against $${R[1].plf.toFixed(3)}$ for leapfrog, a fourth-order method against a second-order one. Leapfrog's error is mostly a **phase** error — the body runs on an orbit of the right shape and energy, slightly ahead or behind schedule — and energy cannot see it. RK4's drift, meanwhile, shrinks the orbit and so shortens the period a little more every orbit; the body runs ever further ahead, and its phase error grows like the square of the time: after 10 orbits it is ${R[10].prk.toFixed(2)} rad.` },
      { label: 'Conclude', text: t`For a long run where the statistics matter — the stability of a planetary system over millions of orbits — use a symplectic method. For a short, accurate ephemeris use a high-order method with tight tolerances and check phase against something independent: a known period, a run with half the step, or another integrator.` },
    ],
    answer: t`RK4 drifts by about $${fmtE(R[1].rk)}$ per orbit (${(100 * R[1000].rk).toFixed(0)}% after 1000 orbits); leapfrog's energy error stays near $${fmtE(Math.abs(R[1000].lf))}$ — but it carries a larger phase error, which energy does not show.`,
  },
  practice: [
    num({
      id: 'rel-error', difficulty: 1,
      gen(r) {
        const E0 = -r.pick([0.5, 0.25, 0.3125]), d = r.pick([1, -1]) * r.pick([2e-5, 7e-6, 3e-4]);
        const E = E0 * (1 + d);
        return {
          prompt: t`A run starts with specific energy $E_0 = ${E0}$ (units with $GM = 1$) and ends with $E = ${E.toFixed(9)}$. What is $\Delta E/E_0$?

\`\`\`python
print((E - E0) / E0)
\`\`\``,
          visual: {
            type: 'graph',
            params: { x: [0, 10], y: [E0 * (1 + 3 * Math.abs(d)), E0 * (1 - 3 * Math.abs(d))].sort((a, b) => a - b), aspect: 'wide', axesAt: 'edge', xlabel: 'time (orbits)', ylabel: 'E', yticks: 4,
              curves: [{ fn: `${E0}`, color: 'ink3', dash: true }, { fn: `${E0} + ${E - E0}*x/10`, color: 'accent' }] },
            caption: 'The energy drifting from its starting value (dashed) over the run.',
          },
          answer: d, tol: { rel: 0.01 },
          errors: [{ value: E - E0, feedback: 'That is the absolute change ΔE. Divide by E₀.' }],
          hints: [t`$\Delta E/E_0 = (E - E_0)/E_0$, and $E_0$ is negative.`, t`$E - E_0 = ${tex(E - E0, 3)}$; divide by $${E0}$.`],
          teach: 'For a bound orbit E₀ < 0, so an energy that rises toward zero gives a negative ΔE/E₀; always quote the relative change with its sign convention.',
          explain: t`$(E - E_0)/E_0 = ${tex(E - E0, 3)}/(${E0}) = ${tex(d, 2)}$. ${E > E0 ? 'The energy rose (toward zero): the orbit is growing, and because E₀ is negative the ratio is negative.' : 'The energy fell (more negative): the orbit is shrinking, and because E₀ is negative the ratio is positive.'} Many codes print $\lvert\Delta E/E_0\rvert$ to sidestep the sign.`,
        };
      },
    }),
    num({
      id: 'euler-sho', difficulty: 2,
      gen(r) {
        const n = r.pick([50, 100, 200]), periods = r.pick([10, 100]);
        const h = (2 * Math.PI) / n, N = n * periods, factor = (1 + h * h) ** N;
        return {
          prompt: t`Euler's method on the oscillator $\dot x = v$, $\dot v = -x$ maps $(x, v) \to (x + hv,\ v - hx)$, which multiplies the energy $\tfrac12(x^2 + v^2)$ by exactly $1 + h^2$ every step. With ${n} steps per period, by what factor has the energy grown after ${periods} periods?`,
          visual: {
            type: 'graph',
            params: { x: [-3.4, 3.4], y: [-3.4, 3.4], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'v',
              curves: [{ param: ['cos(t)', '-sin(t)'], t: [0, 6.2832], color: 'ink3', dash: true }, { param: ['1.0311^(t/0.2513)*cos(t)', '-1.0311^(t/0.2513)*sin(t)'], t: [0, 10.2], color: 'warn' }] },
            caption: 'Phase space: the exact circle (dashed) and an Euler run spiralling outward — drawn with a large step (25 per period) so the spiral is visible.',
          },
          answer: factor, tol: { rel: 0.01 },
          errors: [{ value: 1 + N * h * h, feedback: 'The factor compounds: (1 + h²) multiplied N times is (1 + h²)ᴺ, not 1 + N h².' }],
          hints: [t`$h = 2\pi/${n}$ and $N = ${n}\times${periods}$ steps.`, t`The factor is $(1 + h^2)^N$ — use logarithms: $N\ln(1 + h^2)$.`],
          teach: 'Explicit Euler multiplies an oscillator’s energy by 1 + h² each step: an exponential blow-up that energy monitoring exposes at once.',
          explain: t`$(1 + ${(h * h).toPrecision(3)})^{${N}} = ${tex(factor, 3)}$. Halving $h$ does not cure it, only slows it; the symplectic Euler variant (update $v$ first, then $x$ with the new $v$) keeps the energy within a fraction of a percent instead — after 100 periods at 100 steps per period its ratio is ${SHO.symp.toFixed(5)}.`,
        };
      },
    }),
    code({
      id: 'leapfrog', difficulty: 3,
      prompt: t`Write \`leapfrog_step(x, v, h, accel)\` for NumPy arrays \`x\` and \`v\`: kick $\vec v$ by $\tfrac h2\vec a(\vec x)$, drift $\vec x$ by $h\vec v$, kick $\vec v$ again by $\tfrac h2\vec a$ at the new position, and return the new \`(x, v)\` without changing the inputs. The tests check an oscillator's energy over 100 periods and that the method is **time-reversible**: a step of $+h$ followed by $-h$ returns to the start.`,
      starter: t`import numpy as np

def leapfrog_step(x, v, h, accel):
    pass
`,
      answer: t`import numpy as np

def leapfrog_step(x, v, h, accel):
    v = v + h / 2 * accel(x)
    x = x + h * v
    v = v + h / 2 * accel(x)
    return x, v`,
      tests: [
        { name: t`oscillator, 100 periods at $h = T/100$: energy ratio ${SHO.verlet.toFixed(6)}`, code: '(lambda h: (lambda r: abs(float(np.sum(r[0]**2 + r[1]**2)) - ' + SHO.verlet + ') < 1e-9)(__import__("functools").reduce(lambda s, i: leapfrog_step(s[0], s[1], h, lambda x: -x), range(10000), (np.array([1.0]), np.array([0.0])))))(2 * np.pi / 100)' },
        { name: 'time-reversible: +h then −h returns to the start', code: '(lambda a: (lambda s: (lambda b: np.allclose(b[0], [1.0, 0.0]) and np.allclose(b[1], [0.0, 1.2]))(leapfrog_step(s[0], s[1], -0.05, a)))(leapfrog_step(np.array([1.0, 0.0]), np.array([0.0, 1.2]), 0.05, a)))(lambda x: -x / np.linalg.norm(x)**3)' },
        { name: 'the inputs are not modified', code: '(lambda x0, v0: (leapfrog_step(x0, v0, 0.1, lambda x: -x), x0[0] == 1.0 and v0[0] == 0.0)[1])(np.array([1.0]), np.array([0.0]))' },
      ],
      hints: ['Three lines: half kick, full drift, half kick.', '`v = v + h / 2 * accel(x)`, then `x = x + h * v`, then `v = v + h / 2 * accel(x)`.', 'Write `v = v + …` rather than `v += …` so the caller’s arrays are untouched; finish with `return x, v`.'],
      teach: 'Kick–drift–kick leapfrog is three lines, second order, time-reversible and symplectic — the workhorse of long orbit and molecular-dynamics runs.',
      explain: t`After 100 periods the energy ratio is ${SHO.verlet.toFixed(6)} (RK4, at four times the cost, gives ${SHO.rk4.toFixed(6)} and keeps drifting; Euler gives $${tex(SHO.euler, 3)}$). Reversibility is a structural property: running the step backwards undoes it exactly (to round-off), which is closely tied to why the energy cannot drift.`,
    }),
    mcq({
      id: 'phase', difficulty: 2,
      prompt: t`A leapfrog orbit code conserves energy to $10^{-6}$ over 1000 orbits, yet a satellite it predicts is 40° away from where tracking finds it. How can both be true?

\`\`\`python
print(abs((energy(s) - E0) / E0))     # 9.8e-07
print(math.degrees(angle_error(s)))   # 40.2
\`\`\``,
      choices: [
        'Energy fixes the size and shape of the orbit, not the timing along it: a small error in the period accumulates as a phase error that energy cannot detect',
        'The energy check must be wrong: an accurate energy guarantees an accurate position',
        'Leapfrog conserves energy exactly, so the error must come from round-off',
        'The satellite has left the orbit plane',
      ],
      answer: 0,
      why: {
        1: 'Energy is one number; the state has four (in a plane). Many wrong states share the right energy.',
        2: 'Leapfrog conserves a shadow energy, not E itself; and the phase error is truncation, not round-off.',
        3: 'A planar integration cannot leave its plane; and an angle error along the orbit is the simplest explanation.',
      },
      hints: ['How many numbers describe the state, and how many does the energy check constrain?', 'Which property of the orbit does the energy fix, by Kepler’s laws?'],
      teach: 'Conservation checks are necessary, not sufficient: they cannot see errors that keep the conserved quantity fixed, such as a drift in phase.',
      explain: t`For a Kepler orbit the energy fixes the semi-major axis, hence the period — but the numerical period differs from the true one by a tiny amount every orbit, and over 1000 orbits that adds up. Check timing independently: compare with a run at half the step (phase error falls 4-fold for leapfrog), or with the exact period.`,
    }),
    mcq({
      id: 'why-bounded', difficulty: 3,
      prompt: t`Why does leapfrog's energy error stay bounded over thousands of orbits while RK4's — though much smaller per step — grows steadily?`,
      visual: {
        type: 'graph',
        params: { x: [0, 20], y: [-0.6, 3.2], aspect: 'wide', axesAt: 'edge', xlabel: 'time (orbits)', ylabel: 'ΔE/E₀ (schematic)', yticks: 0,
          curves: [{ fn: '0.14*x', color: 'warn', label: 'RK4', labelAt: 17, labelDx: -30, labelDy: -12 }, { fn: '0.35*sin(6.2832*x)^2', color: 'good', label: 'leapfrog', labelAt: 18.3, labelDx: -10, labelDy: -22 }] },
        caption: 'Schematic: a steady drift against a bounded oscillation (not to scale).',
      },
      choices: [
        'Leapfrog is symplectic: each step is an exact area-preserving map, and it exactly conserves a nearby “shadow” energy, so the true energy can only oscillate about it; RK4 has no such structure, so its small errors accumulate',
        'Leapfrog is a higher-order method than RK4',
        'Leapfrog uses smaller steps, so its errors are always smaller',
        'Leapfrog includes the energy in its update formula and corrects it each step',
      ],
      answer: 0,
      why: {
        1: 'Leapfrog is second order, RK4 fourth. Over one orbit RK4 is the more accurate of the two.',
        2: 'Even at equal step size leapfrog’s energy stays bounded; it is the structure, not the step, that matters.',
        3: 'Nothing in kick–drift–kick refers to the energy; the conservation comes from the form of the map.',
      },
      hints: ['It is not about order: RK4 is the higher-order method.', 'Think about what a symplectic map preserves in phase space.'],
      teach: 'Symplectic integrators preserve the geometry of Hamiltonian motion, so energy errors oscillate instead of accumulating; general-purpose methods drift.',
      explain: t`Leapfrog is the exact flow of a slightly different Hamiltonian, $\tilde H = H + O(h^2)$. It conserves $\tilde H$ exactly, so $H$ can only wobble within $O(h^2)$ of its start — for exponentially long times. RK4 adds a small, same-signed energy error each orbit, and those add up linearly. That is why 10-billion-year solar-system integrations use symplectic schemes.`,
    }),
    num({
      id: 'budget', difficulty: 3,
      prompt: t`RK4's energy error after one orbit of the $e = 0.6$ orbit is $${fmtE(R[1].rk)}$ with 100 steps and $${fmtE(R200[1].rk)}$ with 200. Using the order these two runs reveal, how many steps per orbit would make it $10^{-10}$?

\`\`\`python
drift(100)    # ${R[1].rk.toExponential(2)}
drift(200)    # ${R200[1].rk.toExponential(2)}
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [1.9, 3.6], y: [-11, -3], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'steps per orbit', ylabel: 'ΔE/E₀ after one orbit',
          points: [{ x: 2, y: lg(R[1].rk), color: 'gold', r: 5 }, { x: lg(200), y: lg(R200[1].rk), color: 'gold', r: 5 }],
          hlines: [{ y: -10, color: 'ink3', label: 'target 10⁻¹⁰' }] },
        caption: 'The two measured runs, on log–log axes.',
      },
      answer: N_FOR(1e-10), tol: { rel: 0.03 },
      errors: [{ value: 200 * (R200[1].rk / 1e-10) ** (1 / 4), feedback: `The nominal order is 4, but these runs show ${P_OBS.toFixed(1)}: use the measured exponent.` }],
      hints: [t`The observed order is $p = \log_2(e_{100}/e_{200})$.`, t`$p \approx ${P_OBS.toFixed(2)}$; then $n = 200\times(e_{200}/10^{-10})^{1/p}$.`],
      teach: 'Measure the order rather than assume it: the energy error of a method need not scale like its position error.',
      explain: t`The ratio is ${(R[1].rk / R200[1].rk).toFixed(1)}, so $p = ${P_OBS.toFixed(2)}$ — the energy error of RK4 per orbit falls almost like $h^5$ here, faster than the nominal $h^4$ of its position error. Then $n = 200\times(${tex(R200[1].rk, 3)}/10^{-10})^{1/${P_OBS.toFixed(2)}} \approx ${Math.round(N_FOR(1e-10))}$ steps per orbit. Assuming order 4 would have asked for about ${Math.round(200 * (R200[1].rk / 1e-10) ** 0.25)}.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-pulsar', difficulty: 3, transfer: true,
      prompt: t`The Hulse–Taylor binary pulsar, whose slow orbital decay was the first evidence for gravitational waves, has eccentricity $e = 0.617$. Model its relative orbit as a Newtonian two-body problem (units with $GM = 1$, $a = 1$, period $2\pi$; no radiation) and integrate **300 orbits** from periastron with the provided steppers: RK4 with 100 steps per orbit and leapfrog with 400. Set \`drift_rk4\` and \`drift_lf\` to $\Delta E/E_0$ at the end of each run, and \`stable\` to the name (\`"rk4"\` or \`"leapfrog"\`) of the one whose energy error is smaller.`,
      visual: {
        type: 'graph',
        params: { x: [-1.8, 0.6], y: [-0.85, 0.85], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (units of a)', ylabel: 'y',
          curves: [{ param: ['-0.617 + cos(t)', `${Math.sqrt(1 - 0.617 ** 2)}*sin(t)`], t: [0, 6.2832], color: 'accent' }],
          points: [{ x: 0, y: 0, color: 'gold', r: 5, label: 'focus', labelDx: 6, labelDy: 14 }, { x: 0.383, y: 0, color: 'accent', r: 4, label: 'periastron', labelDx: -20, labelDy: -10 }] },
        caption: 'The relative orbit with e = 0.617, drawn in units of the semi-major axis. Its real decay — 76 µs a year in period — comes from gravitational radiation, not modelled here.',
      },
      starter: t`import math

e = 0.617
s0 = (1 - e, 0.0, 0.0, math.sqrt((1 + e) / (1 - e)))

def accel(x, y):
    r3 = (x * x + y * y) ** 1.5
    return -x / r3, -y / r3

def energy(s):
    x, y, vx, vy = s
    return 0.5 * (vx * vx + vy * vy) - 1 / math.hypot(x, y)

def rk4_step(s, h):
    def f(s):
        ax, ay = accel(s[0], s[1])
        return (s[2], s[3], ax, ay)
    k1 = f(s)
    k2 = f(tuple(a + h / 2 * b for a, b in zip(s, k1)))
    k3 = f(tuple(a + h / 2 * b for a, b in zip(s, k2)))
    k4 = f(tuple(a + h * b for a, b in zip(s, k3)))
    return tuple(a + h / 6 * (p + 2 * q + 2 * r + w) for a, p, q, r, w in zip(s, k1, k2, k3, k4))

def leapfrog_step(s, h):
    x, y, vx, vy = s
    ax, ay = accel(x, y)
    vx += h / 2 * ax; vy += h / 2 * ay
    x += h * vx; y += h * vy
    ax, ay = accel(x, y)
    vx += h / 2 * ax; vy += h / 2 * ay
    return (x, y, vx, vy)

drift_rk4 = None
drift_lf = None
stable = None
`,
      answer: t`import math

e = 0.617
s0 = (1 - e, 0.0, 0.0, math.sqrt((1 + e) / (1 - e)))

def accel(x, y):
    r3 = (x * x + y * y) ** 1.5
    return -x / r3, -y / r3

def energy(s):
    x, y, vx, vy = s
    return 0.5 * (vx * vx + vy * vy) - 1 / math.hypot(x, y)

def rk4_step(s, h):
    def f(s):
        ax, ay = accel(s[0], s[1])
        return (s[2], s[3], ax, ay)
    k1 = f(s)
    k2 = f(tuple(a + h / 2 * b for a, b in zip(s, k1)))
    k3 = f(tuple(a + h / 2 * b for a, b in zip(s, k2)))
    k4 = f(tuple(a + h * b for a, b in zip(s, k3)))
    return tuple(a + h / 6 * (p + 2 * q + 2 * r + w) for a, p, q, r, w in zip(s, k1, k2, k3, k4))

def leapfrog_step(s, h):
    x, y, vx, vy = s
    ax, ay = accel(x, y)
    vx += h / 2 * ax; vy += h / 2 * ay
    x += h * vx; y += h * vy
    ax, ay = accel(x, y)
    vx += h / 2 * ax; vy += h / 2 * ay
    return (x, y, vx, vy)

def run(step, steps_per_orbit, orbits=300):
    s, h = s0, 2 * math.pi / steps_per_orbit
    for _ in range(orbits * steps_per_orbit):
        s = step(s, h)
    return (energy(s) - energy(s0)) / energy(s0)

drift_rk4 = run(rk4_step, 100)
drift_lf = run(leapfrog_step, 400)
stable = "leapfrog" if abs(drift_lf) < abs(drift_rk4) else "rk4"
print(drift_rk4, drift_lf, stable)`,
      tests: [
        { name: t`RK4: $\Delta E/E_0 = ${fmtE(PSR.rk)}$ after 300 orbits`, code: `abs(drift_rk4 / ${PSR.rk} - 1) < 1e-5` },
        { name: t`leapfrog: $\Delta E/E_0 = ${fmtE(PSR.lf)}$`, code: `abs(drift_lf / ${PSR.lf} - 1) < 1e-5` },
        { name: 'the more stable integrator is identified', code: 'stable == "leapfrog"' },
      ],
      hints: ['Write one helper `run(step, steps_per_orbit)` that loops `300 * steps_per_orbit` times with `h = 2π / steps_per_orbit`.', 'Return `(energy(s) - energy(s0)) / energy(s0)`.', 'Compare the absolute values to choose `stable`.'],
      teach: 'Comparing integrators by a conserved quantity at equal cost is a quick, honest way to choose one for a long run.',
      explain: t`RK4 ends ${(100 * Math.abs(PSR.rk)).toFixed(1)}% off in energy, leapfrog ${(100 * Math.abs(PSR.lf)).toFixed(2)}%. Real pulsar-timing work integrates the post-Newtonian equations of motion, in which the energy *does* decrease — by gravitational radiation — so a numerical drift of the same order as the physical loss would be fatal to the measurement.`,
    }),
    mcq({
      id: 'cp-angmom', difficulty: 3,
      prompt: t`A student validates a leapfrog orbit code by checking angular momentum: $L = xv_y - yv_x$ stays constant to $10^{-15}$ over a million steps. What does that test prove?

\`\`\`python
print(abs(L(s) - L(s0)) / L(s0))      # 2.2e-15
\`\`\``,
      choices: [
        'Very little: for a central force leapfrog conserves angular momentum exactly by construction, so the check passes even with a wrong step size or a wrong force law',
        'That the trajectory is correct to 15 digits',
        'That the energy is also conserved to 15 digits',
        'That the code has no round-off error',
      ],
      answer: 0,
      why: {
        1: 'One conserved number constrains one combination of the state; positions can still be badly wrong.',
        2: 'Energy and angular momentum are separate checks; leapfrog keeps L exactly but E only approximately.',
        3: 'The tiny drift that remains is round-off: it is there, just small.',
      },
      hints: ['A kick changes v along r (a central force); does that change r × v?', 'Would a mistake in GM, or in h, change L?'],
      teach: 'A conservation test is informative only if the method does not enforce that quantity automatically; check quantities the scheme does not conserve by design.',
      explain: t`A kick adds a velocity parallel to $\vec r$, which leaves $\vec r\times\vec v$ unchanged; a drift moves $\vec r$ along $\vec v$, which also leaves it unchanged. So $L$ is conserved exactly for *any* step size and *any* central force — doubling $GM$ by mistake would pass. Test the energy, the period, or a run with half the step instead.`,
    }),
    mcq({
      id: 'cp-which', difficulty: 2,
      prompt: t`An orbit integrator logs $\Delta E/E_0$ at the end of every orbit. Which description fits a symplectic method such as leapfrog run with a fixed step?

\`\`\`
orbit      dE/E0
   10    ${R[10].lf.toExponential(2).replace(/e-(\d)$/, 'e-0$1')}
  100    ${R[100].lf.toExponential(2).replace(/e-(\d)$/, 'e-0$1')}
 1000    ${R[1000].lf.toExponential(2).replace(/e-(\d)$/, 'e-0$1')}
\`\`\``,
      choices: [
        'This log: an error that settles at a constant level and does not grow with the number of orbits',
        'An error that grows in proportion to the number of orbits',
        'An error that is exactly zero at every orbit',
        'An error that grows exponentially',
      ],
      answer: 0,
      why: {
        1: 'Linear growth is the signature of a non-symplectic method such as RK4.',
        2: 'Symplectic methods conserve a shadow energy, not E itself; a small bounded error remains.',
        3: 'Exponential growth is explicit Euler on an oscillator — an unstable method, not a symplectic one.',
      },
      hints: ['Compare the values after 100 and 1000 orbits.'],
      teach: 'A bounded, non-growing energy error over many orbits is the fingerprint of a symplectic integrator at fixed step.',
      explain: t`These are the leapfrog numbers from the worked example: $${fmtE(R[10].lf)}$, $${fmtE(R[100].lf)}$, $${fmtE(R[1000].lf)}$ — flat after the first hundred orbits. RK4 at the same cost went from $${fmtE(R[10].rk)}$ to $${fmtE(R[1000].rk)}$. Note that the symplectic property is lost if the step size is varied naively, as adaptive codes do.`,
    }),
  ],
  sources: [
    { label: 'Hairer, Lubich & Wanner (2003), Geometric numerical integration illustrated by the Störmer–Verlet method, Acta Numerica 12, 399', url: 'https://doi.org/10.1017/S0962492902000144' },
    { label: 'Newman, Computational Physics, §8.5: the leapfrog and Verlet methods', url: 'http://www-personal.umich.edu/~mejn/cp/' },
    { label: 'Weisberg & Huang (2016), Relativistic measurements from timing the binary pulsar PSR B1913+16, ApJ 829, 55', url: 'https://doi.org/10.3847/0004-637X/829/1/55' },
  ],
});
