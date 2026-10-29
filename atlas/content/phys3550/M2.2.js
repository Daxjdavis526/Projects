// Damped oscillators in Taylor's notation: ẍ + 2βẋ + ω₀²x = 0 with β = b/2m;
// underdamped, critical and overdamped motion; the energy budget
// dE/dt = −bẋ², averaging to E ∝ e^{−2βt} (twice the amplitude's rate); the
// quality factor Q = ω₀/2β as 2π × energy stored / energy lost per cycle and
// as Q/π cycles per e-fold; the phase-plane spiral; the power an escapement
// must supply; design damping for an accelerometer.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, distinct, G } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the worked example: a 440 Hz tuning fork whose amplitude halves in 4.0 s
const EX = (() => {
  const f0 = 440, th = 4.0, E0 = 1.0e-3;
  const w0 = 2 * Math.PI * f0, beta = Math.LN2 / th, Q = w0 / (2 * beta);
  const lost = 1 - Math.exp((-2 * beta) / f0);
  return { f0, th, E0, w0, beta, Q, lost, P: 2 * beta * E0, cyc: Q / Math.PI, shift: w0 - Math.sqrt(w0 * w0 - beta * beta) };
})();

const W1 = 'sqrt(w0^2 - b^2)';

export default lesson({
  id: 'phys3550.M2.2',
  title: 'Damped oscillators',
  minutes: 15, difficulty: 3,
  intro: t`Add a linear drag $-b\dot x$ to a spring and divide by $m$: $\ddot x + 2\beta\dot x + \omega_0^2x = 0$, with the **damping constant** $\beta = b/2m$. Trying $e^{rt}$ gives $r = -\beta \pm\sqrt{\beta^2 - \omega_0^2}$, and the sign under the root sorts the motion: underdamped ($\beta < \omega_0$), critically damped ($\beta = \omega_0$) or overdamped ($\beta > \omega_0$). This lesson is about the **energy**. The drag removes it at the rate $b\dot x^2$; averaged over a cycle that makes $E$ decay twice as fast as the amplitude. One number, the **quality factor** $Q$, says how many cycles a resonator rings. You have seen the [damping regimes](#/lesson/math2280.DE-3.5) and [damped oscillations](#/lesson/phys2210.M15.5) before.`,
  equation: t`x(t) = Ae^{-\beta t}\cos(\omega_1t - \delta), \qquad \omega_1 = \sqrt{\omega_0^2 - \beta^2}, \qquad Q = \frac{\omega_0}{2\beta}`,
  symbols: [
    { tex: '\\beta = b/2m', text: 'the damping constant, in s⁻¹: the amplitude falls by a factor $e$ in a time $1/\\beta$' },
    { tex: '\\omega_0 = \\sqrt{k/m}', text: 'the natural angular frequency without damping, in rad/s' },
    { tex: '\\omega_1', text: 'the angular frequency the damped system actually oscillates at, in rad/s — slightly below $\\omega_0$' },
    { tex: 'A,\\ \\delta', text: 'amplitude (m) and phase (rad), fixed by the initial conditions' },
    { tex: 'Q', text: 'the quality factor (dimensionless): for light damping, $2\\pi\\times$ energy stored / energy lost per cycle' },
  ],
  why: t`Every real oscillator loses energy, and $Q$ is how engineers and physicists specify it — from a car's shock absorbers ($Q \sim 1$) to quartz clocks ($Q \sim 10^5$) and LIGO's mirror suspensions.`,
  visual: {
    type: 'graph',
    title: 'Amplitude and energy decay',
    lead: t`Released from rest at $x = 1$: the position (blue) inside its envelope $\pm e^{-\beta t}$ (grey), and the energy as a fraction of the start (gold), which follows $e^{-2\beta t}$ (dashed) on average.`,
    tasks: [
      t`Halve $\beta$: the envelope stretches out, and $Q$ doubles.`,
      t`Look at the energy curve: it falls in steps, steepest where the mass moves fastest ($b\dot x^2$ is largest), flat at the turning points.`,
      t`Raise $\beta$ toward $\omega_0$: $\omega_1$ drops visibly and only a couple of swings survive — $Q$ near 1.`,
    ],
    params: {
      aspect: 'wide', x: [0, 15], y: [-1.1, 1.15], xlabel: 't (s)', ylabel: 'x, E/E₀',
      sliders: [
        { key: 'b', label: 'Damping $\\beta$', min: 0.05, max: 1.5, step: 0.01, value: 0.2, unit: '\\mathrm{s^{-1}}', explain: '$\\beta = b/2m$: the envelope is $e^{-\\beta t}$.' },
        { key: 'w0', label: 'Natural frequency $\\omega_0$', min: 2, max: 6, step: 0.1, value: 3, unit: '\\mathrm{rad/s}', explain: '$\\omega_0 = \\sqrt{k/m}$.' },
      ],
      curves: [
        { fn: 'e^(-b*x)', color: 'ink3', width: 1.2 }, { fn: '-e^(-b*x)', color: 'ink3', width: 1.2 },
        { fn: `e^(-b*x)*(cos(${W1}*x) + (b/${W1})*sin(${W1}*x))`, color: 'accent', width: 2.2, label: 'x(t)', labelAt: 0.6, labelDx: 6, labelDy: -6 },
        { fn: 'e^(-2*b*x)', color: 'gold', width: 1.2, dash: true },
        { fn: `e^(-2*b*x)*((w0/${W1})^2*sin(${W1}*x)^2 + (cos(${W1}*x) + (b/${W1})*sin(${W1}*x))^2)`, color: 'gold', width: 2.2, label: 'E/E₀', labelAt: 3.5, labelDy: -10 },
      ],
      readouts: [{ label: 'Q', expr: 'w0/(2*b)', digits: 3 }, { label: 'ω₁', expr: W1, unit: '\\mathrm{rad/s}', digits: 4 }, { label: 'amplitude e-fold time 1/β', expr: '1/b', unit: '\\mathrm{s}', digits: 3 }],
    },
    caption: t`Linear (viscous) damping, underdamped throughout the slider ranges. Position in units of the starting displacement; energy as a fraction of the starting energy.`,
  },
  example: {
    prompt: t`A ${EX.f0} Hz tuning fork, struck once, rings with its amplitude halving every ${EX.th.toFixed(1)} s. Find $\beta$, $Q$, how far $\omega_1$ sits below $\omega_0$, the fraction of energy lost per cycle, and the power it radiates and dissipates when it holds ${EX.E0 * 1000}.0 mJ.`,
    visual: gpic({ x: [0, 12], y: [-1.1, 1.1], xlabel: 't (s)', ylabel: 'x / x₀', curves: [{ fn: `e^(-${r6(EX.beta)}*x)`, color: 'ink3', width: 1.4, label: 'envelope', labelAt: 9, labelDy: -10 }, { fn: `-e^(-${r6(EX.beta)}*x)`, color: 'ink3', width: 1.4 }], shade: [{ fn: `e^(-${r6(EX.beta)}*x)`, lower: `-e^(-${r6(EX.beta)}*x)`, from: 0, to: 12, color: 'accent', alpha: 0.25 }], points: [{ x: 4, y: 0.5, color: 'gold', label: 'half', labelDx: 6 }, { x: 8, y: 0.25, color: 'gold', label: 'quarter', labelDx: 6 }] }, t`The envelope of the ring-down over 12 s. The 440 Hz oscillation itself, over 5000 cycles, fills the shaded band — far too fast to draw.`, 'An exponential envelope halving every 4 seconds'),
    steps: [
      { label: 'Damping constant', text: t`$e^{-\beta t_{1/2}} = \tfrac12$, so $\beta = \ln 2/t_{1/2} = ${sci(EX.beta, 4)}$ s⁻¹.` },
      { label: 'Quality factor', text: t`$\omega_0 = 2\pi\times${EX.f0} = ${sci(EX.w0, 4)}$ rad/s and $Q = \omega_0/2\beta = ${sci(EX.Q, 3)}$.` },
      { label: 'Frequency shift', text: t`$\omega_0 - \omega_1 \approx \beta^2/2\omega_0 = ${sci(EX.shift, 2)}$ rad/s: utterly negligible. Light damping changes the frequency at second order, the amplitude at first.` },
      { label: 'Energy budget', text: t`$\dfrac{dE}{dt} = -b\dot x^2 = -2m\beta\dot x^2$. Averaged over a cycle, $\langle m\dot x^2\rangle = 2\langle K\rangle = E$, so $\dfrac{dE}{dt} \approx -2\beta E$ and $E \propto e^{-2\beta t}$.` },
      { label: 'Loss per cycle', text: t`$1 - e^{-2\beta/f_0} = ${sci(EX.lost, 3)}$, which matches $2\pi/Q = ${sci((2 * Math.PI) / EX.Q, 3)}$ — the energy definition of $Q$.` },
      { label: 'Power', text: t`$P = 2\beta E = 2(${sci(EX.beta, 3)})(${sci(EX.E0)}\ \text{J}) = ${sci(EX.P * 1000, 3)}$ mW, mostly into the fork's mounting and the air.` },
    ],
    answer: t`$\beta = ${sci(EX.beta, 3)}$ s⁻¹, $Q \approx ${sci(EX.Q, 2)}$; $\omega_1$ is lower by only $${sci(EX.shift, 2)}$ rad/s; it loses $${sci(EX.lost, 2)}$ of its energy per cycle and $${sci(EX.P * 1000, 3)}$ mW at 1 mJ.`,
  },
  practice: [
    num({
      id: 'q-from-half', difficulty: 2,
      gen(r) {
        const [what, f0] = r.pick([['A guitar string’s lowest note', 82.4], ['A wine glass', 650], ['A bridge deck’s first mode', 1.2], ['A satellite antenna boom', 3.5]]), th = r.pick([0.8, 1.5, 3, 6]) * (f0 < 10 ? 10 : 1);
        const beta = Math.LN2 / th, Q = (2 * Math.PI * f0) / (2 * beta);
        return {
          prompt: t`${what} rings at ${f0} Hz, and its amplitude halves every ${th} s. What is its quality factor $Q$?`,
          answer: Q, tol: { rel: 0.01 },
          errors: distinct([{ value: f0 / (2 * beta), feedback: t`$Q = \omega_0/2\beta$ uses the angular frequency: $\omega_0 = 2\pi f_0$.` }, { value: (2 * Math.PI * f0) / (2 * (Math.LN2 / (2 * th))), feedback: t`The **amplitude** halves in ${th} s, so $\beta = \ln2/t_{1/2}$. (The energy halves in half that time.)` }], Q),
          hints: [t`$e^{-\beta t_{1/2}} = \tfrac12$ gives $\beta = \ln 2/t_{1/2}$.`, t`$Q = \omega_0/2\beta = \pi f_0/\beta$.`],
          teach: t`From a ring-down: $\beta = \ln 2/t_{1/2}$ for the amplitude, then $Q = \omega_0/2\beta$.`,
          explain: t`$\beta = \ln 2/${th} = ${sci(beta)}$ s⁻¹ and $\omega_0 = 2\pi\times${f0} = ${sci(2 * Math.PI * f0)}$ rad/s, so $Q = ${sci(Q)}$.`,
          visual: gpic({ x: [0, r6(3 * th)], y: [-1.1, 1.1], xlabel: 't (s)', ylabel: 'x / x₀', curves: [{ fn: `e^(-${r6(beta)}*x)`, color: 'ink3', width: 1.4 }, { fn: `-e^(-${r6(beta)}*x)`, color: 'ink3', width: 1.4 }], shade: [{ fn: `e^(-${r6(beta)}*x)`, lower: `-e^(-${r6(beta)}*x)`, from: 0, to: r6(3 * th), color: 'accent', alpha: 0.22 }], points: [{ x: th, y: 0.5, color: 'gold', label: 'half', labelDx: 6 }] }, t`The ring-down's envelope; the oscillation fills the band.`, 'An exponential envelope'),
        };
      },
    }),
    num({
      id: 'energy-half', difficulty: 2,
      gen(r) {
        const beta = r.pick([0.05, 0.1, 0.2, 0.5]);
        const tE = Math.LN2 / (2 * beta);
        return {
          prompt: t`A lightly damped oscillator has $\beta = ${beta}$ s⁻¹. How long does its energy take to fall to half?`,
          answer: tE, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Math.LN2 / beta, feedback: t`That is the amplitude's half-life. Energy goes as amplitude squared, $E \propto e^{-2\beta t}$: it halves twice as fast.` }],
          hints: [t`$E \propto A^2 \propto e^{-2\beta t}$.`, t`Solve $e^{-2\beta t} = \tfrac12$.`],
          teach: t`Energy decays at twice the amplitude's rate: $E \propto e^{-2\beta t}$.`,
          explain: t`$t = \ln 2/(2\beta) = ${sci(tE)}$ s — half the amplitude's half-life. After that time the amplitude is still $1/\sqrt2 \approx 71\%$ of its start.`,
          visual: gpic({ x: [0, r6(4 * tE)], y: [0, 1.1], xlabel: 't (s)', ylabel: 'fraction left', curves: [{ fn: `e^(-${r6(beta)}*x)`, color: 'accent', width: 2.2, label: 'amplitude', labelAt: r6(3.2 * tE), labelDy: -10 }, { fn: `e^(-${r6(2 * beta)}*x)`, color: 'gold', width: 2.2, label: 'energy', labelAt: r6(2.4 * tE), labelDy: 12 }], hlines: [{ y: 0.5, color: 'ink3' }] }, t`Amplitude and energy envelopes; the dashed line is one half.`, 'Two decaying exponentials'),
        };
      },
    }),
    mcq({
      id: 'regime', difficulty: 1,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), k = r.pick([8, 18, 32]);
        const w0 = Math.sqrt(k / m), kind = r.pick([0, 1, 2]);
        const beta = [0.3, 1, 2.5][kind] * w0, b = 2 * m * beta;
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${k}$ N/m has damping $b = ${sci(b)}$ kg/s. Displaced and released, how does it move?`,
          choices: ['It oscillates with a decaying amplitude (underdamped)', 'It returns as fast as possible without overshooting (critically damped)', 'It creeps back slowly without overshooting (overdamped)', 'It oscillates for ever (undamped)'],
          answer: kind,
          why: Object.fromEntries(Object.entries({
            0: t`Compare $\beta = b/2m = ${sci(beta)}$ s⁻¹ with $\omega_0 = \sqrt{k/m} = ${sci(w0)}$ rad/s: oscillation needs $\beta < \omega_0$.`,
            1: t`Critical damping needs $\beta$ exactly equal to $\omega_0$; here $\beta = ${sci(beta)}$ and $\omega_0 = ${sci(w0)}$.`,
            2: t`Overdamping needs $\beta > \omega_0$; here $\beta = ${sci(beta)}$ and $\omega_0 = ${sci(w0)}$.`,
            3: t`Any $b > 0$ removes energy, so the motion dies away.`,
          }).filter(([i]) => +i !== kind)),
          hints: [t`Find $\beta = b/2m$ and $\omega_0 = \sqrt{k/m}$, and compare them.`],
          teach: t`The regime depends on $\beta$ against $\omega_0$: below, at or above.`,
          explain: t`$\beta = ${sci(b)}/(2\times${m}) = ${sci(beta)}$ s⁻¹ and $\omega_0 = ${sci(w0)}$ rad/s, so it is ${['underdamped', 'critically damped', 'overdamped'][kind]}.`,
          visual: { type: 'c3-roots', params: { mode: 'free', zeta: [0.3, 1, 2.5][kind], w0: r6(w0), sliders: false, panels: 'top', readout: false }, caption: t`The two roots of $r^2 + 2\beta r + \omega_0^2 = 0$ in the complex plane, with the path they follow as damping grows (to scale).` },
        };
      },
    }),
    num({
      id: 'escapement', difficulty: 3, transfer: true,
      gen(r) {
        const Q = r.pick([5000, 10000, 20000]), deg = r.pick([2, 3, 4]), m = r.pick([0.5, 1.0]), L = 0.994;
        const E = m * G * L * (1 - Math.cos(deg * DEG)), w0 = Math.sqrt(G / L), P = (w0 * E) / Q;
        return {
          prompt: t`A pendulum clock's ${m} kg bob on a ${L} m rod swings ${deg}° each side, and its quality factor is $Q = ${sci(Q, 2)}$. How much power must the escapement feed in to keep the amplitude steady? Give it in µW.`,
          answer: P * 1e6, units: 'µW', tol: { rel: 0.01 },
          errors: [{ value: ((w0 * E) / Q) * 1e6 * 2, feedback: t`$Q = \omega_0/2\beta$ means $2\beta = \omega_0/Q$: the loss rate is $2\beta E = \omega_0E/Q$, not $2\omega_0E/Q$.` }, { value: (E / Q) * 1e6, feedback: t`$E/Q$ has units of energy; the power is $\omega_0E/Q$.` }],
          hints: [t`The energy is $E = mgL(1 - \cos\theta_0)$; it is lost at $P = 2\beta E$.`, t`$2\beta = \omega_0/Q$ with $\omega_0 = \sqrt{g/L}$.`],
          teach: t`A driven steady state replaces exactly the energy damping removes: $P = 2\beta E = \omega_0E/Q$.`,
          explain: t`$E = ${m}(9.8)(${L})(1 - \cos ${deg}^\circ) = ${sci(E)}$ J and $\omega_0 = ${sci(w0)}$ rad/s, so $P = \omega_0E/Q = ${sci(P * 1e6)}\ \mu$W. A falling 5 kg weight needs to drop only about $${sci((P * 604800) / (5 * G) * 100, 2)}$ cm a week to supply that (a real clock's gear train takes more).`,
          visual: gpic({ x: [-1.2, 1.2], y: [-1.15, 0.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.3, 0], [0.3, 0], 'ink2', 3), seg([0, 0], [Math.sin(0.25), -Math.cos(0.25)], 'ink2', 1.8), seg([0, 0], [-Math.sin(0.25), -Math.cos(0.25)], 'ink4', 1, true), { param: ['0.98*sin(t)', '-0.98*cos(t)'], t: [-0.25, 0.25], color: 'ink3', width: 1, dash: true }], points: [{ x: r6(Math.sin(0.25)), y: r6(-Math.cos(0.25)), color: 'gold', r: 8 }] }, t`The pendulum at the end of its swing (angle exaggerated).`, 'A pendulum at the end of its swing'),
        };
      },
    }),
    expr({
      id: 'critical', difficulty: 3,
      gen(r) {
        const be = r.pick([2, 3, 4]), x0 = r.pick([1, 2, 3]), v0 = r.pick([-6, -2, 1, 4].filter((v) => v + be * x0 !== 0));
        const c = v0 + be * x0;
        return {
          prompt: t`A critically damped oscillator has $\beta = \omega_0 = ${be}$ s⁻¹. It starts at $x(0) = ${x0}$ with $\dot x(0) = ${v0}$. Find $x(t)$.`,
          answer: `(${x0} + (${c})*t)*e^(-${be}t)`, answerTeX: t`\left(${x0} ${c < 0 ? '-' : '+'} ${Math.abs(c)}t\right)e^{-${be}t}`,
          vars: { t: [0, 3] }, lhs: 'x(t)',
          errors: [{ answer: `(${x0} + (${v0})*t)*e^(-${be}t)`, feedback: t`Check $\dot x(0)$: differentiating $(C_1 + C_2t)e^{-\beta t}$ gives $C_2 - \beta C_1$ at $t = 0$, so $C_2 = v_0 + \beta x_0$.` }, { answer: `${x0}*e^(-${be}t)`, feedback: t`At critical damping the two roots coincide, so the second solution is $te^{-\beta t}$: you need it to match the starting velocity.` }],
          hints: [t`With a double root $r = -\beta$, the general solution is $(C_1 + C_2t)e^{-\beta t}$.`, t`$x(0) = C_1$ and $\dot x(0) = C_2 - \beta C_1$.`],
          teach: t`A repeated root gives $(C_1 + C_2t)e^{-\beta t}$; fit $C_1$ to the position and $C_2$ to the velocity.`,
          explain: t`$C_1 = ${x0}$, $C_2 = ${v0} + ${be}\times${x0} = ${c}$: $x = (${x0} ${c < 0 ? '-' : '+'} ${Math.abs(c)}t)e^{-${be}t}$.`,
          visual: gpic({ x: [-0.2, 3], y: [-3, 4], xlabel: 't', ylabel: 'x', points: [{ x: 0, y: x0, color: 'accent', label: `x(0) = ${x0}`, labelDx: 8 }], arrows: [{ from: [0, x0], to: [0.3, x0 + 0.3 * v0], color: 'good', label: 'slope ẋ(0)', labelDx: 6, labelDy: v0 > 0 ? -6 : 12 }] }, t`The starting position and starting slope that pick out the solution.`, 'A starting point and slope'),
        };
      },
    }),
    num({
      id: 'cycles', difficulty: 2,
      gen(r) {
        const Q = r.pick([20, 50, 200, 1000]), w0 = 10;
        const beta = w0 / (2 * Q), w1 = Math.sqrt(w0 * w0 - beta * beta), n = w1 / (2 * Math.PI * beta);
        return {
          prompt: t`A resonator has $Q = ${Q}$. Struck once, about how many oscillations does it complete while its amplitude falls by a factor of $e$?`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: Q, feedback: t`$Q$ itself counts radians of the cycle, so to speak: the number of cycles is $Q/\pi$.` }, { value: Q / (2 * Math.PI), feedback: t`The amplitude's e-folding time is $1/\beta = 2Q/\omega_0$, which holds $Q/\pi$ cycles, not $Q/2\pi$ (that is for the energy).` }],
          hints: [t`The amplitude falls by $e$ in $1/\beta$ seconds, and $\beta = \omega_0/2Q$.`, t`Cycles $= \dfrac{1/\beta}{2\pi/\omega_1} \approx \dfrac{\omega_0}{2\pi\beta} = \dfrac{Q}{\pi}$.`],
          teach: t`A high-$Q$ resonator rings for about $Q/\pi$ cycles per factor $e$ of amplitude: $Q$ is literally how long it rings.`,
          explain: t`$\dfrac{\omega_1}{2\pi\beta} \approx \dfrac{Q}{\pi} = ${sci(n)}$ cycles.`,
          visual: gpic({ x: [0, r6(Math.min(4 * Q / Math.PI, 60))], y: [-1.1, 1.1], xlabel: 'cycles', ylabel: 'x / x₀', curves: [{ fn: `e^(-${r6(Math.PI / Q)}*x)*cos(2*pi*x)`, color: 'accent', width: 1.6, samples: 2000 }, { fn: `e^(-${r6(Math.PI / Q)}*x)`, color: 'ink3', width: 1.2 }] }, t`The ring-down against the number of cycles (the first ${Math.round(Math.min(4 * Q / Math.PI, 60))}).`, 'A decaying oscillation'),
        };
      },
    }),
    mcq({
      id: 'spiral', difficulty: 2,
      prompt: t`The phase portrait of a damped oscillator, $\ddot x + 2\beta\dot x + \omega_0^2x = 0$ with $\beta < \omega_0$, is drawn below (position across, velocity up). Click to add trajectories. What does the spiral show?`,
      visual: { type: 'phase', params: { fx: 'y', fy: '-4*x - 0.6*y', x: [-3, 3], y: [-5, 5], seeds: [[2.5, 0]], xlabel: 'x', ylabel: 'ẋ' }, caption: t`$\omega_0 = 2$ rad/s, $\beta = 0.3$ s⁻¹. Trajectories run clockwise and spiral into the origin.` },
      choices: [
        'Each turn is one oscillation; the shrinking radius is the energy being lost, and every start ends at rest at the origin',
        'The trajectory reaches the origin after a finite number of turns',
        'Trajectories from different starts eventually cross and merge',
        'The spiral shows the damping force growing as the motion slows',
      ],
      answer: 0,
      why: {
        1: t`The approach is exponential: the spiral winds round infinitely many times, each turn smaller by $e^{-2\pi\beta/\omega_1}$.`,
        2: 'Two trajectories of an autonomous system can never cross: the state (x, ẋ) fixes the whole future.',
        3: t`The damping force $-b\dot x$ shrinks with the speed; the spiral tightens because energy drains away.`,
      },
      hints: [t`In scaled axes $(x, \dot x/\omega_0)$ the distance from the origin is $\sqrt{2E/k}$.`],
      teach: t`In the phase plane a damped oscillator spirals into the equilibrium; the shrinking radius measures the lost energy.`,
      explain: t`Undamped, the orbit would be a closed ellipse of fixed energy. Damping makes each turn smaller by the factor $e^{-2\pi\beta/\omega_1}$, and the state approaches rest at the origin without ever quite reaching it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-afm', difficulty: 3, transfer: true,
      gen(r) {
        const [what, f0, Q] = r.pick([['An atomic-force-microscope cantilever in vacuum', 300e3, 30000], ['A quartz tuning-fork resonator in a satellite clock', 32768, 80000], ['A MEMS gyroscope’s drive mode', 20e3, 5000]]);
        const tau = (2 * Q) / (2 * Math.PI * f0);
        return {
          prompt: t`${what} resonates at $f_0 = ${sci(f0, 5)}$ Hz with $Q = ${sci(Q, 2)}$. After its drive is switched off, how long does its amplitude take to fall by a factor of $e$? Give milliseconds.`,
          answer: tau * 1e3, units: 'ms', tol: { rel: 0.01 },
          errors: [{ value: (tau / 2) * 1e3, feedback: t`That is the energy's e-folding time, $1/2\beta$. The amplitude's is $1/\beta = 2Q/\omega_0$.` }, { value: ((2 * Q) / f0) * 1e3, feedback: t`Use the angular frequency: $\omega_0 = 2\pi f_0$.` }],
          hints: [t`The amplitude goes as $e^{-\beta t}$, so its e-folding time is $1/\beta$.`, t`$\beta = \omega_0/2Q$, so $1/\beta = 2Q/\omega_0 = Q/(\pi f_0)$.`],
          teach: t`Ring-down time and $Q$ are two names for one number: $1/\beta = Q/(\pi f_0)$.`,
          explain: t`$1/\beta = Q/(\pi f_0) = ${sci(Q, 2)}/(\pi\times${sci(f0, 5)}) = ${sci(tau * 1e3)}$ ms. Measuring this ring-down is how such resonators' $Q$ is found — and why high $Q$ makes them slow to respond.`,
          visual: gpic({ x: [0, 4], y: [-1.1, 1.1], xlabel: 't / (e-fold time)', ylabel: 'x / x₀', curves: [{ fn: 'e^(-x)', color: 'ink3', width: 1.2 }, { fn: '-e^(-x)', color: 'ink3', width: 1.2 }], shade: [{ fn: 'e^(-x)', lower: '-e^(-x)', from: 0, to: 4, color: 'accent', alpha: 0.22 }], points: [{ x: 1, y: r6(Math.exp(-1)), color: 'gold', label: '1/e', labelDx: 6 }] }, t`A ring-down's envelope in units of its e-folding time; the oscillation, thousands of cycles, fills the band.`, 'An exponential envelope'),
        };
      },
    }),
    num({
      id: 'cp-accel', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([0.002, 0.005, 0.01]), f0 = r.pick([200, 500, 1000]), z = 0.7;
        const w0 = 2 * Math.PI * f0, b = 2 * m * z * w0;
        return {
          prompt: t`A spacecraft accelerometer's proof mass of ${m * 1000} g sits on a suspension with natural frequency ${f0} Hz. For a fast, nearly flat response it is designed with $\beta = 0.7\,\omega_0$. What damping coefficient $b$ does that need?`,
          answer: b, units: 'kg/s', tol: { rel: 0.01 },
          errors: [{ value: m * z * w0, feedback: t`$\beta = b/2m$, so $b = 2m\beta$.` }, { value: 2 * m * z * f0, feedback: t`Use $\omega_0 = 2\pi f_0$, in rad/s.` }],
          hints: [t`$\beta = 0.7\,\omega_0$ with $\omega_0 = 2\pi f_0$.`, t`$b = 2m\beta$.`],
          teach: t`Design damping by choosing $\beta/\omega_0$ (the damping ratio), then $b = 2m\beta$.`,
          explain: t`$\omega_0 = 2\pi\times${f0} = ${sci(w0)}$ rad/s, $\beta = ${sci(z * w0)}$ s⁻¹, so $b = 2m\beta = ${sci(b)}$ kg/s. At $\beta/\omega_0 \approx 0.7$ the response to a step overshoots by under 5% and settles fastest — the usual choice for instruments.`,
          visual: { type: 'c3-roots', params: { mode: 'free', zeta: 0.7, w0: 2, sliders: false, panels: 'motion', readout: false, T: 6 }, caption: t`The step-like response shape at $\beta = 0.7\,\omega_0$, released from rest (time scaled to $\omega_0 = 2$ rad/s).` },
        };
      },
    }),
    mcq({
      id: 'cp-rates', difficulty: 2,
      prompt: t`An oscillator's amplitude decays as $e^{-\beta t}$. Which statement about its energy is right?`,
      visual: gpic({ x: [0, 6], y: [0, 1.1], xlabel: 't (s)', ylabel: 'fraction left', curves: [{ fn: 'e^(-0.5*x)', color: 'accent', width: 2.2, label: 'amplitude', labelAt: 4.5, labelDy: -10 }, { fn: 'e^(-x)', color: 'gold', width: 2.2, label: 'energy', labelAt: 2.6, labelDy: 12 }] }, t`Envelope curves for $\beta = 0.5$ s⁻¹.`, 'Two decaying envelopes'),
      choices: [t`It decays as $e^{-2\beta t}$, losing power $2\beta E$ on average`, t`It decays as $e^{-\beta t}$, like the amplitude`, t`It decays as $e^{-\beta t/2}$, since $E = \tfrac12kA^2$`, t`It is constant: damping only changes the frequency`],
      answer: 0,
      why: { 1: t`$E = \tfrac12kA^2$: squaring $e^{-\beta t}$ doubles the rate.`, 2: t`The $\tfrac12$ in $\tfrac12kA^2$ is a constant factor; the square of $A$ is what matters for the rate.`, 3: t`Damping changes the frequency only slightly ($\omega_1 < \omega_0$); its main effect is the energy loss, $b\dot x^2$ per second.` },
      hints: [t`$E \propto A^2$.`],
      teach: t`Energy goes as amplitude squared, so it decays at $2\beta$ — and $dE/dt = -2\beta E$ on average.`,
      explain: t`$E = \tfrac12kA^2e^{-2\beta t}$ (averaging over the wiggles), so $\langle dE/dt\rangle = -2\beta E$.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 5: damped oscillations and Q', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 8.03SC Physics III: Vibrations and Waves — damped oscillators', url: 'https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/' },
  ],
});
