// Limit cycles and conservative systems: x″ + f(x) = 0 conserves
// E = ½x′² + V(x), so it has only centres and saddles and no attractors; a
// limit cycle is an isolated closed orbit that neighbours approach, which
// needs energy fed in and drained out — the van der Pol oscillator, its
// amplitude 2 by averaging, relaxation oscillations, Poincaré–Bendixson and
// Bendixson's criterion by name, the Hopf crossing, and a combustion-
// instability caricature, honestly labelled.
import { lesson, mcq, multi, num, expr, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, n, r6, plane } from './_systems.js';

const t = String.raw;

const vdp = (mu) => [`y`, `${mu}*(1 - x^2)*y - x`];

export default lesson({
  id: 'math2280.DE-5.5',
  title: 'Limit cycles and conservative systems',
  minutes: 15, difficulty: 3,
  intro: t`For $x'' + f(x) = 0$ — a particle in a potential $V(x)$ with $V' = f$ — the energy $E = \tfrac12x'^2 + V(x)$ is conserved. Trajectories are its level curves, so a **conservative** system has centres at the minima of $V$, saddles at the maxima, and nothing that attracts: every closed orbit comes in a nested family. A **limit cycle** is different: a single, isolated closed orbit that neighbouring trajectories spiral toward. It needs energy fed in when the motion is small and drained when it is large. Van der Pol’s oscillator does exactly that:

$$x'' - \mu\,(1 - x^2)\,x' + x = 0.$$

For $|x| < 1$ the damping is negative and pumps energy in; for $|x| > 1$ it is positive and takes energy out. Whatever the start (except the origin), the motion settles onto one cycle of amplitude close to 2. In the plane, the **Poincaré–Bendixson theorem** says this is the most complicated thing a trajectory can do: approach an equilibrium, a closed orbit, or a chain of saddles — never chaos.`,
  symbols: [
    { tex: 'x', text: 'the oscillating quantity (dimensionless here): a voltage in van der Pol’s triode circuit, a pressure in an unstable combustor' },
    { tex: "x'", text: 'its rate of change; the phase plane plots $(x, x\')$' },
    { tex: '\\mu', text: 'the strength of the nonlinear damping, $\\mu > 0$: small $\\mu$ gives a nearly sinusoidal cycle, large $\\mu$ a jerky relaxation oscillation' },
    { tex: '\\mu(1 - x^2)', text: 'the damping coefficient’s negative: positive (energy in) for $|x| < 1$, negative (energy out) for $|x| > 1$' },
  ],
  why: t`Self-sustained oscillations are everywhere a steady source drives a nonlinear system: a heartbeat’s pacemaker, a violin string under the bow, a clock’s escapement, wing flutter, and the combustion instabilities that can shake a rocket engine apart.`,
  visual: {
    type: 'de-plane',
    title: 'One cycle that everything approaches',
    lead: t`Van der Pol’s equation as $x' = y$, $y' = \mu(1 - x^2)y - x$. Trajectories from inside and from outside the cycle are drawn; the bold one starts close to the origin, and the lower panel shows $x(t)$ and $y(t)$. Press Play, and change $\mu$.`,
    tasks: [
      t`At $\mu = 1$, trajectories from inside spiral out and those from outside spiral in, onto one closed loop that reaches $x \approx 2$: the limit cycle.`,
      t`Drop $\mu$ to 0.1: the cycle is almost a circle of radius 2 and the approach takes many turns — energy is gained and lost only slowly.`,
      t`Raise $\mu$ to 4: a **relaxation oscillation** — slow creeping along the cubic nullcline, then sudden jumps. The time panel shows the square-ish wave.`,
    ],
    params: {
      fx: 'y', fy: 'mu*(1 - x^2)*y - x', x: [-3.5, 3.5], y: [-6.5, 6.5], equal: false, aspect: 'square', xlabel: 'x', ylabel: 'y = x′',
      sliders: [{ key: 'mu', label: 'Nonlinear damping $\\mu$', min: 0.05, max: 4, step: 0.05, value: 1, explain: 'How strongly energy is pumped in at small amplitude and drained at large amplitude.' }],
      nullclines: true, equilibria: 'label', start: [0.3, 0], play: true, series: true, tmax: 40, seriesNames: ['x(t)', 'y(t)'], rate: 3,
      seeds: [{ x: 3.2, y: 5.5, dir: 'forward', color: 'violet', T: 40 }, { x: -3.2, y: -5.5, dir: 'forward', color: 'teal', T: 40 }, { x: 0.05, y: 0.05, dir: 'forward', color: 'gold', T: 40 }],
    },
    caption: 'Dimensionless units. Arrows show direction only. Dashed: nullclines (x′ = 0 violet, y′ = 0 teal). Trajectories traced numerically forward in time; arrowheads forward.',
  },
  example: {
    prompt: t`Why is the van der Pol amplitude close to 2? Use the energy $E = \tfrac12(x^2 + y^2)$ of the underlying oscillator $x'' + x = 0$, and assume $\mu$ is small.`,
    visual: { type: 'de-plane', params: { fx: 'y', fy: '0.2*(1 - x^2)*y - x', x: [-3, 3], y: [-3, 3], aspect: 'wide', xlabel: 'x', ylabel: 'y', seeds: [{ x: 0.5, y: 0, dir: 'forward', color: 'accent2', T: 60 }, { x: 3, y: 0, dir: 'forward', color: 'violet', T: 60 }], curves: [{ param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'gold', width: 1.6, dash: true, label: 'radius 2', labelAt: 0.6, labelDx: 6, labelDy: -6 }], readout: false, click: false, grid: 20 }, caption: 'μ = 0.2: one trajectory from inside and one from outside close in on the cycle; the dashed gold circle has radius 2.' },
    steps: [
      { label: 'Energy rate', text: t`$\dfrac{dE}{dt} = x\,x' + y\,y' = xy + y\big(\mu(1 - x^2)y - x\big) = \mu(1 - x^2)\,y^2.$ Energy flows in while $|x| < 1$ and out while $|x| > 1$.` },
      { label: 'Nearly a circle', text: t`For small $\mu$ the motion over one turn is almost that of $x'' + x = 0$: $x \approx A\cos t$, $y \approx -A\sin t$, with $E = \tfrac12A^2$ changing only slowly.` },
      { label: 'Average over a turn', text: t`$\left\langle(1 - x^2)y^2\right\rangle = \left\langle A^2\sin^2t - A^4\cos^2t\sin^2t\right\rangle = \dfrac{A^2}{2} - \dfrac{A^4}{8}$, using $\langle\sin^2\rangle = \tfrac12$ and $\langle\cos^2\sin^2\rangle = \tfrac18$.` },
      { label: 'Balance', text: t`So on average $\dfrac{dE}{dt} \approx \mu\,\dfrac{A^2}{8}\,(4 - A^2)$: zero when $A = 2$. For $A < 2$ the energy grows; for $A > 2$ it shrinks — so the cycle of amplitude 2 attracts from both sides. It is a **stable limit cycle**.` },
      { label: 'Check', text: t`Numerically, the amplitude is 2.0001 at $\mu = 0.1$ and 2.009 at $\mu = 1$, and even at $\mu = 4$ it is only 2.02 — the averaging result is excellent. The period, $2\pi$ for small $\mu$, grows to 6.66 at $\mu = 1$ and 10.2 at $\mu = 4$.` },
      { label: 'Why no family', text: t`A conservative system has $dE/dt = 0$ on every orbit, so each closed orbit has neighbours that are closed too. Here $dE/dt$ averages to zero on just one loop: an isolated orbit, which is what “limit cycle” means.` },
    ],
    answer: t`Averaging $dE/dt = \mu(1 - x^2)y^2$ over a near-circular turn gives $\mu\tfrac{A^2}{8}(4 - A^2)$, which vanishes at $A = 2$ and drives other amplitudes toward it.`,
  },
  practice: [
    mcq({
      id: 'conservative-types', difficulty: 2,
      prompt: t`For a conservative system $x'' + f(x) = 0$, which kinds of hyperbolic equilibrium can occur?`,
      choices: ['Saddles only: the centres it also has are not hyperbolic', 'Saddles and stable spirals', 'Stable and unstable nodes', 'Any kind, depending on f'],
      answer: 0,
      why: {
        1: t`A stable spiral would make energy decrease along nearby orbits, but $E$ is conserved.`,
        2: t`Nodes attract or repel, so $E$ would change along trajectories. Here the Jacobian $${M([[0, 1], ["-f'(x^*)", 0]])}$ has trace 0: it can only be a saddle or a centre.`,
        3: t`The trace of the Jacobian is always 0 for $x' = y$, $y' = -f(x)$, which rules out nodes and spirals.`,
      },
      hints: [t`Write the system as $x' = y$, $y' = -f(x)$ and compute its Jacobian.`, t`$J = ${M([[0, 1], ["-f'(x^*)", 0]])}$: $\tau = 0$ and $\Delta = f'(x^*) = V''(x^*)$.`],
      teach: 'Conservative systems x″ + f(x) = 0 have trace-zero Jacobians: saddles at maxima of the potential and centres at minima — no attractors at all.',
      explain: t`$\tau = 0$ always, so the only hyperbolic type is the saddle ($V'' < 0$, a hilltop). Minima of $V$ give linearized centres, and energy conservation makes them true centres. Conservative systems therefore have neither attracting equilibria nor limit cycles.`,
      visual: plane('y', '-x + x^3', { x: [-1.8, 1.8], y: [-1, 1], equal: false, levels: { fn: 'y^2/2 + x^2/2 - x^4/4', values: [0.03, 0.1, 0.18, 0.32], highlight: [0.25] }, caption: 'x″ + x − x³ = 0: energy levels, with the level through the hilltops in gold.' }),
    }),
    expr({
      id: 'potential', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 4]), b = r.pick([1, 2]);
        return {
          prompt: t`Write $x'' + ${a === 1 ? '' : a}x - ${b === 1 ? '' : b}x^3 = 0$ as $x'' = -V'(x)$. Find the potential $V(x)$ (any constant will do).`,
          answer: `${a}*x^2/2 - ${b}*x^4/4`, answerTeX: t`\tfrac{${a}}{2}x^2 - \tfrac{${b}}{4}x^4`, lhs: 'V(x)',
          vars: { x: [-1.5, 1.5] }, mode: 'constant', integrand: `${a}*x - ${b}*x^3`,
          errors: [{ answer: `-${a}*x^2/2 + ${b}*x^4/4`, feedback: t`Check the sign: $x'' = -V'(x)$ means $V' = ${a}x - ${b}x^3$, the force with its sign flipped.` }],
          hints: [t`$V'(x) = f(x) = ${a}x - ${b}x^3$.`, 'Integrate term by term.'],
          teach: 'For x″ + f(x) = 0 the potential is V(x) = ∫f dx, and E = ½x′² + V(x) is conserved.',
          explain: t`$V = \tfrac{${a}}{2}x^2 - \tfrac{${b}}{4}x^4$: a well at $x = 0$ between hilltops at $x = \pm\sqrt{${a}/${b}}$ of height $V = ${n(r6((a * a) / (4 * b)))}$. A particle with more energy than that escapes over a hilltop.`,
          visual: {
            type: 'graph',
            params: { x: [-2.2, 2.2], y: [-1, 1.5], aspect: 'wide', xlabel: 'x', ylabel: 'force', curves: [{ fn: `-(${a}*x - ${b}*x^3)`, color: 'accent', width: 2.4, label: 'force −f(x)', labelAt: -1.9, labelDx: 6, labelDy: -10 }] },
            caption: 'The force −f(x): restoring near the origin, pushing outward beyond the hilltops. V is minus its integral.',
          },
        };
      },
    }),
    num({
      id: 'escape', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 4]), b = r.pick([1, 2]), Vm = (a * a) / (4 * b), v = Math.sqrt(2 * Vm);
        return {
          prompt: t`A particle obeys $x'' = -${a === 1 ? '' : a}x + ${b === 1 ? '' : b}x^3$. It starts at the bottom of the well, $x = 0$. What is the smallest speed $x'$ that lets it escape over a hilltop?`,
          answer: v, tol: { rel: 0.005 },
          errors: [{ value: Vm, feedback: t`That is the hilltop’s height $V_{\max}$, an energy. Set $\tfrac12x'^2 = V_{\max}$ and solve for the speed.` }, { value: Math.sqrt(a / b), feedback: t`That is where the hilltops are, $x = \sqrt{${a}/${b}}$, not the speed needed.` }].filter((e) => Math.abs(e.value - v) > 0.01 * v),
          hints: [t`$V = \tfrac{${a}}{2}x^2 - \tfrac{${b}}{4}x^4$ peaks where $V' = 0$: $x^2 = ${a}/${b}$.`, t`$V_{\max} = \tfrac{${a}^2}{4\cdot${b}} = ${n(Vm)}$; energy: $\tfrac12x'^2 = V_{\max}$.`],
          teach: 'In a conservative system, escape is decided by energy alone: the separatrix through the saddles is the level E = V at the hilltop.',
          explain: t`$V_{\max} = ${n(Vm)}$, so $x' = \sqrt{2\times${n(Vm)}} = ${fmt(v, 4)}$. Exactly at that speed the particle creeps up to the saddle and takes forever to arrive.`,
          visual: plane('y', `-${a}*x + ${b}*x^3`, { x: [r6(-1.6 * Math.sqrt(a / b)), r6(1.6 * Math.sqrt(a / b))], y: [r6(-1.6 * v), r6(1.6 * v)], equal: false, field: true, levels: { fn: `y^2/2 + ${a}*x^2/2 - ${b}*x^4/4`, values: [0.2, 0.5, 0.8].map((q) => r6(q * Vm)), highlight: [] }, equilibria: true, caption: 'Energy levels inside the well (grey). The level that just escapes is for you to find.' }),
        };
      },
    }),
    num({
      id: 'scaled-amplitude', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 1.5, 3]), mu = r.pick([0.05, 0.1]);
        return {
          prompt: t`An oscillator obeys $x'' - ${mu}\left(1 - \dfrac{x^2}{${n(a * a)}}\right)x' + x = 0$. Repeat the averaging argument of the worked example: what amplitude does its limit cycle have?`,
          answer: 2 * a, tol: { rel: 0.01 },
          errors: [{ value: a, feedback: t`That is where the damping changes sign, $|x| = ${n(a)}$. The cycle reaches farther: energy gained inside $|x| < ${n(a)}$ must balance energy lost outside it.` }, { value: Math.sqrt(2) * a, feedback: t`Redo the average: $\langle(1 - A^2\cos^2t/a^2)\sin^2t\rangle = \tfrac12 - \tfrac{A^2}{8a^2}$.` }],
          hints: [t`With $x \approx A\cos t$, $\dfrac{dE}{dt} = ${mu}\left(1 - \dfrac{x^2}{${n(a * a)}}\right)y^2$.`, t`The average is $${mu}A^2\left(\tfrac12 - \tfrac{A^2}{8\cdot${n(a * a)}}\right)$, zero when $A^2 = 4\times${n(a * a)}$.`],
          teach: 'For x″ − μ(1 − x²/a²)x′ + x = 0 with small μ, the limit cycle has amplitude 2a: twice the amplitude at which the damping changes sign.',
          explain: t`$A^2 = 4a^2$, so $A = 2a = ${n(2 * a)}$. Rescaling $x = a\,u$ turns the equation into the standard van der Pol equation for $u$, whose amplitude is 2.`,
          visual: {
            type: 'graph',
            params: {
              x: [r6(-3 * a), r6(3 * a)], y: [-0.25, 0.12], aspect: 'wide', xlabel: 'x', ylabel: 'damping',
              curves: [{ fn: `-${mu}*(1 - x^2/${r6(a * a)})`, color: 'accent', width: 2.4 }],
              shade: [{ fn: `min(0, -${mu}*(1 - x^2/${r6(a * a)}))`, from: r6(-a), to: r6(a), color: 'good', alpha: 0.3 }, { fn: `max(0, -${mu}*(1 - x^2/${r6(a * a)}))`, from: r6(-3 * a), to: r6(3 * a), color: 'bad', alpha: 0.25 }],
            },
            caption: 'The damping coefficient −μ(1 − x²/a²) against x: negative (green, energy in) for small |x|, positive (red, energy out) beyond.',
          },
        };
      },
    }),
    mcq({
      id: 'which-limit', difficulty: 2,
      prompt: 'Which of these systems has a limit cycle?',
      choices: [t`$x'' - 0.5(1 - x^2)x' + x = 0$ (van der Pol)`, t`$x'' + x = 0$ (a frictionless spring)`, t`$x' = x(1 - 0.5y),\ y' = y(-0.75 + 0.25x)$ (Lotka–Volterra)`, t`$x'' + 0.2x' + x = 0$ (a damped spring)`],
      answer: 0,
      why: {
        1: 'Every orbit of x″ + x = 0 is a closed circle-like loop, but they come in a continuous family — none is isolated, and none attracts its neighbours.',
        2: 'Its closed orbits are nested level curves of a conserved quantity: a family, not an isolated cycle.',
        3: 'With damping everywhere, energy only decreases: every trajectory spirals into the origin and there are no closed orbits at all.',
      },
      hints: ['A limit cycle is an isolated closed orbit — its neighbours are not closed.', 'Which system gains energy at small amplitude and loses it at large amplitude?'],
      teach: 'A limit cycle is an isolated closed orbit; conservative and linear systems have families of closed orbits instead, and purely damped ones have none.',
      explain: t`Only van der Pol’s oscillator balances energy input at small $|x|$ against loss at large $|x|$, on one particular loop. The spring and Lotka–Volterra have families of closed orbits; the damped spring has none.`,
      visual: plane('x - 0.5*x*y', '-0.75*y + 0.25*x*y', { x: [0, 9], y: [0, 6], equal: false, seeds: [[4, 2], [5, 2], [6, 2]], T: 8, xlabel: 'x', ylabel: 'y', caption: 'The Lotka–Volterra orbits: closed, but a whole family of them, one inside another.' }),
    }),
    multi({
      id: 'no-cycles', difficulty: 3,
      prompt: t`Which of these can be **ruled out** from having any closed orbit at all? Select all.`,
      choices: [t`A linear system $\mathbf x' = A\mathbf x$ with $\tau \neq 0$`, t`$x' = y$, $y' = -x^3 - 2y$ (damping everywhere)`, t`A one-dimensional system $x' = g(x)$`, t`Van der Pol, $x'' - (1 - x^2)x' + x = 0$`, t`$x' = y$, $y' = -x + y(1 - x^2 - y^2)$`],
      answer: [0, 1, 2],
      why: {
        3: 'Van der Pol has a closed orbit — its limit cycle.',
        4: t`Here $\tfrac{d}{dt}(x^2 + y^2) = 2y^2(1 - x^2 - y^2)$: energy is pumped in inside the unit circle and drained outside — and the unit circle itself is a closed orbit (a limit cycle).`,
      },
      hints: ['Linear: closed orbits need purely imaginary eigenvalues, so τ = 0.', t`Bendixson’s criterion: if $\partial f/\partial x + \partial g/\partial y$ keeps one sign everywhere, there are no closed orbits. For the second system it is $-2$.`],
      teach: 'Closed orbits are ruled out for linear systems with nonzero trace, for systems whose divergence never changes sign (Bendixson’s criterion), and for any one-dimensional flow.',
      explain: t`A linear system with $\tau \neq 0$ has no closed orbits. For $x' = y$, $y' = -x^3 - 2y$ the divergence $0 + (-2) = -2 < 0$ everywhere, so areas always shrink and no closed orbit can exist (Bendixson). A 1D flow moves monotonically and can never return. Van der Pol and the last system both have limit cycles; their divergences change sign.`,
      visual: plane('y', '-x + y*(1 - x^2 - y^2)', { x: [-2, 2], y: [-1.6, 1.6], seeds: [{ x: 0.1, y: 0, dir: 'forward', color: 'accent2', T: 40 }, { x: 1.9, y: 1.4, dir: 'forward', color: 'violet', T: 40 }], caption: 'The last system: trajectories from inside and outside wind onto the unit circle.' }),
    }),
    code({
      id: 'vdp-cycle', difficulty: 3,
      prompt: t`Measure van der Pol’s limit cycle at $\mu = 1$. Integrate $x' = y$, $y' = \mu(1 - x^2)y - x$ from $(0.1, 0)$ for 200 time units with \`solve_ivp\`, discard the first 100 (the transient), and find the amplitude (the largest $x$) and the period (the spacing of the times at which $y$ crosses 0 going down).`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

mu = 1.0
def f(t, z):
    x, y = z
    return [y, mu*(1 - x**2)*y - x]

sol = solve_ivp(f, [0, 200], [0.1, 0.0], rtol=1e-9, atol=1e-12, max_step=0.01)
t, x, y = sol.t, sol.y[0], sol.y[1]
late = t > 100

amplitude = None   # replace: the largest x after t = 100

# times where y crosses 0 downward (x is at a maximum there), after t = 100
down = np.where(late[:-1] & (y[:-1] > 0) & (y[1:] <= 0))[0]
crossings = t[down] + y[down] / (y[down] - y[down + 1]) * (t[down + 1] - t[down])
period = None      # replace: the mean spacing of the crossings

print("amplitude", amplitude)
print("period", period)
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

mu = 1.0
def f(t, z):
    x, y = z
    return [y, mu*(1 - x**2)*y - x]

sol = solve_ivp(f, [0, 200], [0.1, 0.0], rtol=1e-9, atol=1e-12, max_step=0.01)
t, x, y = sol.t, sol.y[0], sol.y[1]
late = t > 100

amplitude = np.max(x[late])

# times where y crosses 0 downward (x is at a maximum there), after t = 100
down = np.where(late[:-1] & (y[:-1] > 0) & (y[1:] <= 0))[0]
crossings = t[down] + y[down] / (y[down] - y[down + 1]) * (t[down + 1] - t[down])
period = np.mean(np.diff(crossings))

print("amplitude", amplitude)
print("period", period)
`,
      tests: [
        { name: 'the amplitude is close to 2 (2.009 at μ = 1)', code: 'amplitude is not None and abs(amplitude - 2.0086) < 0.005' },
        { name: 'the period is about 6.66, longer than 2π', code: 'period is not None and abs(period - 6.6633) < 0.01' },
      ],
      hints: [t`\`np.max(x[late])\` picks the largest $x$ among the late samples.`, t`\`np.mean(np.diff(crossings))\` averages the gaps between successive crossings.`],
      teach: 'Discarding the transient and measuring the settled motion is how a limit cycle is characterized numerically — the start does not matter.',
      explain: t`The amplitude is 2.009 and the period 6.663 — close to the averaging estimates (2 and $2\pi = 6.283$), with the period stretched because at $\mu = 1$ the motion lingers near the turning points. Try $\mu = 4$: amplitude 2.02, period 10.2.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-combustion', difficulty: 3, transfer: true,
      gen(r) {
        const ps = r.pick([5, 8, 12]), f = r.pick([800, 1200, 2000]);
        return {
          prompt: t`One acoustic mode of a rocket combustion chamber is sometimes caricatured by a van der Pol equation: the flame feeds energy into small pressure oscillations $p$, and losses grow faster with amplitude, so $p'' - \varepsilon\,\omega\left(1 - \dfrac{p^2}{p_s^2}\right)p' + \omega^2p = 0$ with a small $\varepsilon$. For $p_s = ${ps}$ kPa and a ${f} Hz mode, what amplitude of pressure oscillation, in kPa, does the model predict?`,
          answer: 2 * ps, units: 'kPa', tol: { rel: 0.01 },
          errors: [{ value: ps, feedback: t`$p_s$ is where the net damping changes sign. The cycle swings farther, until gains inside $|p| < p_s$ balance losses outside: amplitude $2p_s$.` }],
          hints: [t`Rescale time by $\omega$ and pressure by $p_s$: $u = p/p_s$ obeys the standard van der Pol equation with $\mu = \varepsilon$.`, 'The standard van der Pol amplitude, for small μ, is 2.'],
          teach: 'A van der Pol-type balance of energy gain and loss predicts a limit cycle of twice the crossover amplitude, whatever the frequency and however fast it grows.',
          explain: t`$2p_s = ${2 * ps}$ kPa, oscillating at about ${f} Hz. This is a caricature, not a design tool: real combustion instabilities involve several coupled modes, the flame’s detailed response and nonlinear acoustics. But the picture — growth from small disturbances, saturation at a finite amplitude — is why such instabilities are so dangerous, and why the F-1 engine’s injector needed years of testing and baffles to tame them.`,
          visual: plane('y', '0.3*(1 - x^2)*y - x', { x: [-3, 3], y: [-3, 3], seeds: [{ x: 0.1, y: 0, dir: 'forward', color: 'accent2', T: 60 }], xlabel: 'p / pₛ', ylabel: 'p′ / (ω pₛ)', caption: 'In scaled units (ε = 0.3): a small pressure disturbance grows onto the limit cycle. A caricature of one acoustic mode.' }),
        };
      },
    }),
    mcq({
      id: 'cp-hopf', difficulty: 3,
      prompt: t`For $x'' - \mu(1 - x^2)x' + x = 0$, the origin’s Jacobian is $${M([[0, 1], [-1, '\\mu']])}$. As $\mu$ increases through 0, what happens?`,
      choices: [
        'The origin turns from a stable spiral into an unstable one, and a limit cycle (amplitude about 2) appears round it',
        'The origin turns from a saddle into a centre',
        'Nothing changes: the origin is a centre for every μ',
        'The origin turns from a stable node into a saddle',
      ],
      answer: 0,
      why: {
        1: t`$\Delta = 1 > 0$ for every $\mu$, so the origin is never a saddle.`,
        2: t`Only at $\mu = 0$ is the trace zero. For $\mu \neq 0$, $\tau = \mu$ makes it spiral in or out.`,
        3: t`Near $\mu = 0$, $\tau^2 - 4\Delta = \mu^2 - 4 < 0$: complex eigenvalues, so spirals, not nodes; and $\Delta > 0$ rules out a saddle.`,
      },
      hints: [t`$\tau = \mu$, $\Delta = 1$: follow the point $(\mu, 1)$ across the trace–determinant map.`, 'When the origin repels but trajectories far out are pulled in, something must lie between.'],
      teach: 'When a pair of complex eigenvalues crosses the imaginary axis, a stable spiral becomes unstable and a limit cycle appears — a Hopf bifurcation.',
      explain: t`The point $(\tau, \Delta) = (\mu, 1)$ crosses the centre line as $\mu$ passes 0. For $\mu > 0$ the origin repels, while large orbits still lose energy, so by Poincaré–Bendixson a closed orbit lies between: the limit cycle. This **Hopf bifurcation** is how flutter and combustion instabilities switch on as a speed or a flow rate crosses a threshold.`,
      visual: { type: 'de-tracedet', params: { drag: false, marker: false, panels: 'map', readout: false, paths: [{ tau: 't', Delta: '1', t: [-1.5, 1.5], color: 'violet', label: 'μ increasing' }] }, caption: 'The origin’s path on the trace–determinant map as μ runs from −1.5 to 1.5 (violet).' },
    }),
    num({
      id: 'cp-energy-rate', difficulty: 2,
      gen(r) {
        const mu = r.pick([0.2, 0.5, 1]), x = r.pick([0.5, 1.5, 2]), y = r.pick([1, -2]);
        const rate = mu * (1 - x * x) * y * y;
        return {
          prompt: t`For van der Pol’s oscillator with $\mu = ${mu}$, at the state $(x, x') = (${x}, ${y})$, at what rate is the energy $E = \tfrac12(x^2 + x'^2)$ changing?`,
          answer: rate, tol: { rel: 0.002, abs: 1e-6 },
          errors: [{ value: mu * (1 - x * x) * y, feedback: t`$dE/dt = \mu(1 - x^2)\,y^2$ — the velocity enters squared.` }].filter((e) => Math.abs(e.value - rate) > 1e-6),
          hints: [t`$\dfrac{dE}{dt} = xx' + x'x''$, and $x'' = \mu(1 - x^2)x' - x$.`, t`$\dfrac{dE}{dt} = \mu(1 - x^2)x'^2$.`],
          teach: 'Van der Pol’s energy changes at the rate μ(1 − x²)x′²: gained inside |x| < 1, lost outside.',
          explain: t`$dE/dt = ${mu}\,(1 - ${x}^2)\,(${y})^2 = ${n(r6(rate))}$: energy is being ${rate > 0 ? 'gained' : 'lost'}, because $|x| ${x < 1 ? '<' : '>'} 1$.`,
          visual: plane(...vdp(mu), { x: [-3, 3], y: [-4, 4], equal: false, seeds: [{ x: 0.1, y: 0, dir: 'forward', color: 'accent2', T: 60 }], points: [{ x, y, label: 'the state', color: 'gold' }], caption: 'The van der Pol limit cycle for this μ, and the state in question (gold).' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §8.4 Limit cycles', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'B. van der Pol, On relaxation-oscillations, Phil. Mag. 2 (1926) 978', url: 'https://doi.org/10.1080/14786442608564127' },
    { label: 'Wikipedia: Rocketdyne F-1 (combustion instability in its development)', url: 'https://en.wikipedia.org/wiki/Rocketdyne_F-1' },
  ],
});
