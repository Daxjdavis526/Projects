// Simple harmonic motion revisited: any smooth potential is a parabola near a
// minimum, with k = U″(x₀); the four equivalent forms of the solution and the
// complex amplitude C = Ae^{−iδ}; energy shared equally on average; two-
// dimensional oscillators and Lissajous figures; anharmonic wells where the
// linearization fails. Taylor ch. 5.
import { lesson, mcq, num } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, distinct, G } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;
const KB = 1.380649e-23, M_RB = 86.909 * 1.66053906892e-27;

// the worked example: a bistable MEMS beam modelled as a double well
const EX = (() => {
  const U0 = 5.0e-13, a = 2.0e-6, m = 2.0e-9;
  const k = (8 * U0) / (a * a), w = Math.sqrt(k / m);
  return { U0, a, m, k, w, f: w / (2 * Math.PI), kc: (-4 * U0) / (a * a) };
})();

export default lesson({
  id: 'phys3550.M2.1',
  title: 'Simple harmonic motion revisited',
  minutes: 15, difficulty: 3,
  intro: t`Expand any smooth potential about a minimum $x_0$: $U \approx U(x_0) + \tfrac12U''(x_0)(x - x_0)^2$, since $U'(x_0) = 0$. So **every** stable equilibrium is, for small displacements, a mass on a spring with $k = U''(x_0)$ — which is why the harmonic oscillator is everywhere, from bridges to molecules. Its equation $\ddot x = -\omega_0^2x$ is linear with constant coefficients, so $e^{\pm i\omega_0t}$ solves it, and the physical motion is the real part of one complex exponential. You know [simple harmonic motion](#/lesson/phys2210.M15.1) already; here it becomes a tool.`,
  equation: t`x(t) = \operatorname{Re}\big[C\,e^{i\omega_0 t}\big] = A\cos(\omega_0t - \delta), \qquad \omega_0 = \sqrt{k/m},\ \ k = U''(x_0)`,
  symbols: [
    { tex: 'x(t)', text: 'displacement from equilibrium, in m' },
    { tex: 'C = Ae^{-i\\delta}', text: 'the **complex amplitude**: one complex number holding both the amplitude $A$ (m) and the phase $\\delta$ (rad)' },
    { tex: '\\omega_0', text: 'the natural angular frequency, in rad/s; the period is $2\\pi/\\omega_0$' },
    { tex: "k = U''(x_0)", text: 'the effective spring constant, in N/m: the curvature of the potential at its minimum' },
    { tex: 'm', text: 'the mass that moves, in kg' },
  ],
  why: t`Linearizing about equilibrium is the first move in normal modes (M8), orbital stability (M5) and chaos (M10) — and the complex amplitude turns every driven problem in this module into algebra.`,
  visual: {
    type: 'graph',
    title: 'Two oscillations at right angles: Lissajous figures',
    lead: t`A particle oscillates in $x$ as $\cos t$ and in $y$ as $\cos(\omega_yt - \delta)$ — a two-dimensional oscillator with different spring constants along the axes. Trace its path.`,
    tasks: [
      t`Set $\omega_y = 1$: an **isotropic** oscillator. $\delta = 0$ gives a line, $\delta = \pi/2$ a circle, anything else an ellipse centred on the origin.`,
      t`Set $\omega_y = 2$ and $\delta = \pi/2$: a figure eight. A rational ratio $p/q$ closes the curve after $2\pi q$ seconds.`,
      t`Set $\omega_y = 1.41$ (close to $\sqrt2$) and trace for 60 s: the path never quite closes and slowly fills the box.`,
    ],
    params: {
      aspect: 'wide', x: [-1.9, 1.9], y: [-1.2, 1.2], equal: true, xlabel: 'x', ylabel: 'y',
      sliders: [
        { key: 'wy', label: 'Ratio $\\omega_y/\\omega_x$', min: 0.5, max: 3, step: 0.01, value: 2, unit: '', explain: 'The y-spring is stiffer than the x-spring when this exceeds 1: $\\omega_y/\\omega_x = \\sqrt{k_y/k_x}$.' },
        { key: 'd', label: 'Phase $\\delta$', min: 0, max: 3.14, step: 0.01, value: 1.57, unit: '\\mathrm{rad}', explain: 'How far the y-oscillation lags the x-oscillation.' },
        { key: 'tt', label: 'Trace time', min: 0.5, max: 60, step: 0.1, value: 6.3, unit: '\\mathrm{s}', explain: 'How long a stretch of the path to draw (with $\\omega_x = 1$ rad/s).' },
      ],
      curves: [{ param: ['cos(t)', 'cos(wy*t - d)'], t: [0, 'tt'], color: 'accent', width: 2, samples: 2400 }],
      points: [{ x: 'cos(tt)', y: 'cos(wy*tt - d)', color: 'gold', r: 5 }],
    },
    caption: t`Amplitudes 1 in both directions; no damping. With $\omega_x = 1$ rad/s, one $x$-oscillation takes $2\pi \approx 6.3$ s.`,
  },
  example: {
    prompt: t`A bistable MEMS switch is a buckled beam whose tip moves in a double-well potential $U(x) = U_0\big[(x/a)^4 - 2(x/a)^2\big]$, with $U_0 = 5.0\times10^{-13}$ J, $a = 2.0\ \mu\text{m}$ and effective mass $m = 2.0\times10^{-9}$ kg. Find the equilibria, their stability, and the frequency of small oscillations about a stable one.`,
    visual: { type: 'mech-energy', params: { U: '(x^4 - 2*x^2)', x: [-1.8, 1.8], y: [-1.3, 1.6], E: -0.6, x0: 0.7, dragE: true, readouts: [], bars: false, xlabel: 'x / a', ylabel: 'U / U₀', unit: 'U₀', lunit: 'a' }, caption: t`The double well in units of $U_0$ and $a$. Near each minimum it looks like a parabola; drag the energy line up to see the motion stop being small. Play runs it.` },
    steps: [
      { label: 'Equilibria', text: t`$U'(x) = \dfrac{4U_0}{a^2}\left(\dfrac{x^3}{a^2} - x\right) = 0$ at $x = 0$ and $x = \pm a$.` },
      { label: 'Stability', text: t`$U''(x) = \dfrac{U_0}{a^2}\left(\dfrac{12x^2}{a^2} - 4\right)$: at $\pm a$ it is $8U_0/a^2 > 0$ (stable, the two switch states); at 0 it is $-4U_0/a^2 < 0$ (unstable, the top of the barrier).` },
      { label: 'Effective spring', text: t`$k = U''(a) = \dfrac{8U_0}{a^2} = \dfrac{8\times5.0\times10^{-13}}{(2.0\times10^{-6})^2} = ${sci(EX.k)}$ N/m.` },
      { label: 'Frequency', text: t`$\omega_0 = \sqrt{k/m} = ${sci(EX.w)}$ rad/s, so $f = \omega_0/2\pi = ${sci(EX.f)}$ Hz.` },
      { label: 'Sense check', text: t`"Small" means small compared with $a$: the parabola fits only near the bottom. With energy above the barrier ($U_0$ above a minimum) the tip flips between wells, and the switch changes state.` },
    ],
    answer: t`Stable at $x = \pm a$ ($k = 8U_0/a^2 = ${sci(EX.k)}$ N/m), unstable at 0; small oscillations at $f \approx ${sci(EX.f)}$ Hz.`,
  },
  practice: [
    num({
      id: 'tweezer', difficulty: 3,
      gen(r) {
        const mK = r.pick([0.5, 1.0, 2.0]), aum = r.pick([0.7, 1.0, 1.5]);
        const U0 = mK * 1e-3 * KB, a = aum * 1e-6;
        const w = Math.sqrt((2 * U0) / (M_RB * a * a)), f = w / (2 * Math.PI) / 1e3;
        return {
          prompt: t`An optical tweezer holds a rubidium-87 atom ($m = 1.443\times10^{-25}$ kg) in a potential well that, across the beam, is roughly $U(x) = -U_0e^{-x^2/a^2}$, with depth $U_0 = k_B\times${mK}$ mK $= ${sci(U0)}$ J and $a = ${aum}\ \mu\text{m}$. What is the frequency $f$ of small oscillations across the beam, in kHz?`,
          answer: f, units: 'kHz', tol: { rel: 0.01 },
          errors: distinct([{ value: w / 1e3, feedback: t`That is $\omega_0$ in units of $10^3$ rad/s; divide by $2\pi$ for $f$.` }, { value: Math.sqrt(U0 / (M_RB * a * a)) / (2 * Math.PI) / 1e3, feedback: t`$U''(0) = 2U_0/a^2$: differentiating $e^{-x^2/a^2}$ twice brings down $2/a^2$.` }], f),
          hints: [t`$k = U''(0)$. Expand: $-U_0e^{-x^2/a^2} \approx -U_0 + U_0x^2/a^2$.`, t`So $k = 2U_0/a^2$ and $f = \dfrac{1}{2\pi}\sqrt{\dfrac{2U_0}{ma^2}}$.`],
          teach: t`Near the bottom of any smooth well the motion is harmonic with $k = U''(x_0)$ — here the curvature of a Gaussian.`,
          explain: t`$k = 2U_0/a^2 = ${sci((2 * U0) / (a * a))}$ N/m, so $\omega_0 = \sqrt{k/m} = ${sci(w)}$ rad/s and $f = ${sci(f)}$ kHz. Real tweezers trap atoms at tens of kHz like this; atoms near the top of the well feel the anharmonic flanks.`,
          visual: gpic({ x: [-3, 3], y: [-1.15, 0.35], xlabel: 'x / a', ylabel: 'U / U₀', curves: [{ fn: '-e^(-x^2)', color: 'accent', width: 2.4, label: 'Gaussian well', labelAt: 1.6, labelDy: -10 }, { fn: '-1 + x^2', color: 'gold', width: 1.6, dash: true, domain: [-1.1, 1.1], label: 'parabola, same curvature', labelAt: -1.05, labelDx: -10, labelDy: -14 }] }, t`The trap's Gaussian well (blue) and the parabola that matches it at the bottom (gold). Small oscillations cannot tell them apart.`, 'A Gaussian well with a matching parabola at its bottom'),
        };
      },
    }),
    num({
      id: 'amplitude', difficulty: 2,
      gen(r) {
        const w = r.pick([2, 4, 5, 10]), x0 = r.pick([2, 3, 5]) * r.sign(), v0 = r.pick([10, 20, 30]) * r.sign();
        const A = Math.hypot(x0, v0 / w);
        return {
          prompt: t`An oscillator with $\omega_0 = ${w}$ rad/s starts at $x_0 = ${x0}$ cm with velocity $v_0 = ${v0}$ cm/s. What is its amplitude, in cm?`,
          answer: A, tol: { rel: 0.01 },
          errors: distinct([{ value: Math.abs(x0) + Math.abs(v0) / w, feedback: t`$x_0$ and $v_0/\omega_0$ are the real and imaginary parts of $C$: combine them in quadrature, $A = |C|$.` }, { value: Math.hypot(x0, v0), feedback: t`$v_0$ needs dividing by $\omega_0$ to be a length.` }], A),
          hints: [t`Write $x = B_1\cos\omega_0t + B_2\sin\omega_0t$ with $B_1 = x_0$, $B_2 = v_0/\omega_0$.`, t`$A = \sqrt{B_1^2 + B_2^2}$.`],
          teach: t`The amplitude is $|C| = \sqrt{x_0^2 + (v_0/\omega_0)^2}$: the initial speed adds to the swing.`,
          explain: t`$B_2 = v_0/\omega_0 = ${sci(v0 / w)}$ cm, so $A = \sqrt{(${x0})^2 + (${sci(v0 / w)})^2} = ${sci(A)}$ cm. Energy says the same: $\tfrac12kA^2 = \tfrac12kx_0^2 + \tfrac12mv_0^2$.`,
          visual: gpic({ x: [-r6(1.3 * Math.max(Math.abs(x0), Math.abs(v0 / w))), r6(1.3 * Math.max(Math.abs(x0), Math.abs(v0 / w)))], y: [-r6(1.3 * Math.max(Math.abs(x0), Math.abs(v0 / w))), r6(1.3 * Math.max(Math.abs(x0), Math.abs(v0 / w)))], equal: true, xlabel: 'x (cm)', ylabel: 'v/ω₀ (cm)', curves: [seg([x0, 0], [x0, v0 / w], 'ink3', 1, true), seg([0, v0 / w], [x0, v0 / w], 'ink3', 1, true)], points: [{ x: x0, y: r6(v0 / w), color: 'gold', r: 5, label: 'start', labelDx: 8 }] }, t`Phase space scaled by $\omega_0$: the start (gold) sits at $(x_0, v_0/\omega_0)$. In these axes the motion is a circle about the origin.`, 'A point in scaled phase space'),
        };
      },
    }),
    mcq({
      id: 'complex-amp', difficulty: 2,
      prompt: t`An oscillator with $\omega_0 = 2$ rad/s starts at $x_0 = 3$ cm moving with $v_0 = 8$ cm/s. Writing $x = \text{Re}\big[Ce^{i\omega_0t}\big]$, what is $C$ (in cm)?`,
      visual: gpic({ x: [-1, 6], y: [-5, 2], equal: true, xlabel: 'Re (cm)', ylabel: 'Im (cm)', points: [{ x: 3, y: 0, color: 'ink2', r: 3.5, label: 'x₀ = 3', labelDx: -10, labelDy: 14 }] }, t`The complex plane. The motion is the shadow on the real axis of $Ce^{i\omega_0t}$, which turns anticlockwise about the origin; at $t = 0$ that shadow is $x_0$.`, 'A complex plane with the starting position marked'),
      choices: [t`$3 - 4i$`, t`$3 + 4i$`, t`$3 - 8i$`, t`$5$`],
      answer: 0,
      why: {
        1: t`$\dot x(0) = \text{Re}[i\omega_0C] = -\omega_0\,\text{Im}\,C$. For a positive $v_0$ the imaginary part must be negative.`,
        2: t`$v_0$ must be divided by $\omega_0$: $\text{Im}\,C = -v_0/\omega_0 = -4$.`,
        3: t`$5$ is $|C|$, the amplitude. $C$ also carries the phase.`,
      },
      hints: [t`$x(0) = \text{Re}\,C$ and $\dot x(0) = \text{Re}\big[i\omega_0C\big] = -\omega_0\,\text{Im}\,C$.`],
      teach: t`$C = x_0 - i\,v_0/\omega_0$: real part from the start position, imaginary part from the start velocity.`,
      explain: t`$\text{Re}\,C = 3$ and $\text{Im}\,C = -v_0/\omega_0 = -4$, so $C = 3 - 4i = 5e^{-i\,53.1^\circ}$: amplitude 5 cm, phase $\delta = 53.1^\circ$, and $x = 5\cos(2t - 53.1^\circ)$ cm.`,
    }),
    mcq({
      id: 'lissajous', difficulty: 2,
      prompt: t`A small mass oscillates in two dimensions, $x = \cos\omega_xt$ and $y = \cos(\omega_yt - \delta)$. The closed path it traces is drawn below. What is $\omega_y/\omega_x$?`,
      visual: gpic({ x: [-1.9, 1.9], y: [-1.2, 1.2], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', 'cos(1.5*t - 0.5)'], t: [0, 12.5664], color: 'accent', width: 2, samples: 1600 }] }, t`The closed path. Count how many times it touches the right edge and how many times the top edge.`, 'A Lissajous figure'),
      choices: ['3/2', '2/3', '3', '5/2'],
      answer: 0,
      why: { 1: 'Upside down: the y-motion is the faster one here — the path touches the top and bottom edges more often than the sides.', 2: 'Count the touches on each edge and take the ratio: 3 on top, 2 on the side.', 3: 'Count again: the curve meets the top edge 3 times and the side edge twice.' },
      hints: ['In one closed loop, each touch of the right edge is one x-oscillation and each touch of the top edge is one y-oscillation.'],
      teach: 'A Lissajous figure closes when the frequency ratio is rational; the ratio is the number of touches on the top edge to touches on the side edge.',
      explain: t`The path touches the top edge 3 times and the right edge twice before closing: $\omega_y/\omega_x = 3/2$.`,
    }),
    num({
      id: 'buoy', difficulty: 2,
      gen(r) {
        const d = r.pick([1.5, 2.0, 3.0, 5.0]);
        const T = 2 * Math.PI * Math.sqrt(d / G);
        return {
          prompt: t`A cylindrical spar buoy floats upright with ${d} m of its length under water. Pushed down a little and released, it bobs. Ignoring the water's drag and the water dragged along with it, what is the period?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * Math.sqrt(G / d), feedback: t`Upside down: $\omega_0 = \sqrt{g/d}$, and the period is $2\pi\sqrt{d/g}$.` }],
          hints: [t`Pushing it down by $x$ adds a buoyant force $\rho gAx$: an effective spring $k = \rho gA$.`, t`Floating, its mass equals the displaced water: $m = \rho Ad$. So $\omega_0^2 = k/m = g/d$.`],
          teach: t`Find the restoring force for a small displacement, read off $k$, and divide by the mass: $\omega_0^2 = k/m$.`,
          explain: t`$k = \rho gA$ and $m = \rho Ad$, so $\omega_0 = \sqrt{g/d}$ and $T = 2\pi\sqrt{${d}/9.8} = ${sci(T)}$ s — the same as a pendulum of length $d$, and independent of the buoy's width. (The water that moves with the buoy, ignored here, lengthens it somewhat.)`,
          visual: gpic({
            x: [-2, 2], y: [-2.6, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            shade: [{ fn: '0', lower: '-2.6', from: -2, to: 2, color: 'accent', alpha: 0.18 }, { fn: '0.9', lower: '-1.6', from: -0.25, to: 0.25, color: 'ink3', alpha: 0.55 }],
            curves: [seg([-2, 0], [2, 0], 'accent', 1.6)],
            points: [lab(0.35, -0.8, `${d} m under water`, 'ink2'), lab(-1.8, 0.15, 'water line', 'accent')],
          }, t`The buoy floating upright (not to scale).`, 'A cylinder floating upright in water'),
        };
      },
    }),
    mcq({
      id: 'energy-share', difficulty: 2,
      prompt: t`For an undamped harmonic oscillator with total energy $E$, what are the time averages of its kinetic and potential energies over a cycle?`,
      visual: gpic({ x: [0, 12.57], y: [0, 1.15], xlabel: 't (s)', ylabel: 'energy / E', curves: [{ fn: 'sin(x)^2', color: 'accent', width: 2.2, label: 'K', labelAt: 1.6, labelDy: -10 }, { fn: 'cos(x)^2', color: 'gold', width: 2.2, label: 'U', labelAt: 3.2, labelDy: -10 }, { fn: '1', color: 'ink3', dash: true, label: 'E', labelAt: 11.5, labelDy: -10 }] }, t`$K$ and $U$ for $x = A\cos t$ ($\omega_0 = 1$ rad/s), as fractions of $E$.`, 'Kinetic and potential energy curves swapping over time'),
      choices: [t`$\langle K\rangle = \langle U\rangle = E/2$`, t`$\langle K\rangle = E$, $\langle U\rangle = 0$`, t`$\langle K\rangle = \langle U\rangle = E$`, t`It depends on the amplitude`],
      answer: 0,
      why: { 1: 'The energy sloshes between the two: half the time most of it is potential.', 2: t`They must add to $E$ at every instant, so their averages add to $E$.`, 3: t`Both are proportional to $A^2$, as is $E$: the split is the same for every amplitude.` },
      hints: [t`$K = E\sin^2(\omega_0t - \delta)$ and $U = E\cos^2(\omega_0t - \delta)$. What is the average of $\sin^2$?`],
      teach: t`In simple harmonic motion the energy is shared equally on average: $\langle\sin^2\rangle = \langle\cos^2\rangle = \tfrac12$.`,
      explain: t`$\langle\sin^2\rangle = \langle\cos^2\rangle = \tfrac12$, so $\langle K\rangle = \langle U\rangle = E/2$ — a special case of the virial theorem for a quadratic potential.`,
    }),
    mcq({
      id: 'quartic-error', difficulty: 3, kind: 'error',
      prompt: t`A student analyses a particle in $U = \alpha x^4$ ($\alpha > 0$): "The equilibrium is at $x = 0$, and $k = U''(0) = 0$. So $\omega_0 = 0$: the particle does not oscillate." What is wrong?`,
      visual: { type: 'mech-energy', params: { U: 'x^4', x: [-1.6, 1.6], y: [-0.3, 2.2], E: 1, x0: -1, dragE: true, readouts: [], bars: false, equilibria: false, force: false }, caption: t`The quartic well $U = x^4$ with an energy line: the particle is trapped between two turning points and swings back and forth.` },
      choices: [
        t`It does oscillate, but not harmonically: with $U''(0) = 0$ the parabola approximation fails, and the period depends on amplitude`,
        t`Nothing: with no linear restoring force, there is no oscillation`,
        t`$U''(0)$ should be $12\alpha$, so $\omega_0 = \sqrt{12\alpha/m}$`,
        t`The equilibrium is unstable, because $U''(0) = 0$`,
      ],
      answer: 0,
      why: {
        1: t`The energy diagram shows the particle trapped between turning points: it moves back and forth. A zero second derivative only means the motion is not *simple* harmonic.`,
        2: t`$U'' = 12\alpha x^2$, which is zero at $x = 0$; the slip is differentiating once too few times.`,
        3: t`$x = 0$ is a minimum ($U$ rises on both sides), so it is stable — the test $U'' > 0$ is sufficient, not necessary.`,
      },
      hints: [t`Look at the energy diagram: is the particle trapped?`, t`What does $U''(x_0) = 0$ say about the parabola approximation?`],
      teach: t`$k = U''(x_0)$ linearizes only when $U'' \ne 0$; otherwise the motion is periodic but anharmonic.`,
      explain: t`The quartic well traps the particle, so it oscillates, but the force $-4\alpha x^3$ is not linear. The period, from the energy integral (M1.3), is $T \propto 1/A$: big swings are faster.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tunnel', difficulty: 3, transfer: true,
      gen(r) {
        const [name, R, g] = r.pick([['Earth', 6.371e6, 9.82], ['the Moon', 1.7374e6, 1.62], ['Mars', 3.3895e6, 3.71]]);
        const T = 2 * Math.PI * Math.sqrt(R / g), one = T / 2 / 60;
        return {
          prompt: t`Imagine a straight, airless, frictionless tunnel through the centre of ${name} (radius $${sci(R / 1e3, 4)}$ km, surface gravity ${g} m/s²), treated as a sphere of uniform density. Inside, gravity is $F = -mg\,r/R$. A capsule dropped in at one end falls through to the other. How long does the one-way trip take, in minutes?`,
          answer: one, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: T / 60, feedback: t`That is the full period, there and back. One way is half of it.` }, { value: one * 60, feedback: t`That is in seconds; give minutes.` }],
          hints: [t`$F = -(mg/R)\,r$ is a spring force with $k = mg/R$.`, t`$\omega_0 = \sqrt{g/R}$, and one way is half a period: $\pi\sqrt{R/g}$.`],
          teach: t`A linear restoring force anywhere means simple harmonic motion — even inside a planet.`,
          explain: t`$\omega_0 = \sqrt{g/R}$, so the trip takes $\pi\sqrt{R/g} = ${sci(one * 60, 4)}$ s $= ${sci(one)}$ min. The full period, $2\pi\sqrt{R/g}$, equals the period of a circular orbit skimming the surface — the same motion seen edge-on. (Real planets are denser toward the centre, which shortens the trip.)`,
          visual: gpic({
            x: [-1.7, 1.7], y: [-1.15, 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, seg([-1, 0], [1, 0], 'ink2', 4)],
            shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'accent', alpha: 0.15 }],
            points: [{ x: -0.95, y: 0, color: 'gold', r: 5, label: 'capsule', labelDx: -20, labelDy: -14 }, { x: 0, y: 0, color: 'ink3', r: 3 }],
          }, t`The planet and the tunnel through its centre (not to scale).`, 'A planet with a straight tunnel through its centre'),
        };
      },
    }),
    num({
      id: 'cp-phase', difficulty: 3,
      gen(r) {
        const w = r.pick([2, 4, 5]), x0 = r.pick([2, 3, 4]) * r.sign(), v0 = r.pick([6, 10, 12]) * r.sign();
        let dl = Math.atan2(v0 / w, x0) / DEG;
        if (dl < 0) dl += 360;
        return {
          prompt: t`An oscillator with $\omega_0 = ${w}$ rad/s starts at $x_0 = ${x0}$ cm with $v_0 = ${v0}$ cm/s. Writing $x = A\cos(\omega_0t - \delta)$ with $A > 0$ and $0 \le \delta < 360^\circ$, find $\delta$ in degrees.`,
          answer: dl, units: 'deg', tol: { rel: 0, abs: 0.6 },
          errors: distinct([{ value: (Math.atan((v0 / w) / x0) / DEG + 360) % 360, feedback: t`$\arctan$ alone cannot tell opposite quadrants apart. Use the signs: $\cos\delta \propto x_0$, $\sin\delta \propto v_0$.` }, { value: (360 - dl) % 360, feedback: t`Sign: $\dot x(0) = A\omega_0\sin\delta$, so $\sin\delta$ has the sign of $v_0$.` }], dl, 0.005),
          hints: [t`At $t = 0$: $x_0 = A\cos\delta$ and $v_0 = A\omega_0\sin\delta$.`, t`So $(\cos\delta, \sin\delta) \propto (x_0,\ v_0/\omega_0)$: find the angle of that point, in the right quadrant.`],
          teach: t`$\delta$ is the angle of the point $(x_0, v_0/\omega_0)$ — equivalently, $C = Ae^{-i\delta} = x_0 - iv_0/\omega_0$.`,
          explain: t`$(x_0, v_0/\omega_0) = (${x0}, ${sci(v0 / w)})$ lies at angle $\delta = ${sci(dl)}^\circ$, with $A = ${sci(Math.hypot(x0, v0 / w))}$ cm.`,
          visual: gpic({ x: [-7, 7], y: [-7, 7], equal: true, xlabel: 'x (cm)', ylabel: 'v/ω₀ (cm)', curves: [{ param: [`${r6(Math.hypot(x0, v0 / w))}*cos(t)`, `${r6(Math.hypot(x0, v0 / w))}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }], points: [{ x: x0, y: r6(v0 / w), color: 'gold', r: 5, label: 'start', labelDx: 8 }] }, t`The starting point in scaled phase space.`, 'A point on a dashed circle in phase space'),
        };
      },
    }),
    mcq({
      id: 'cp-isotropic', difficulty: 2,
      prompt: t`A puck on a frictionless table is tied to the centre by springs pulling equally in all directions ($\vec F = -k\vec r$). What shapes can its orbits have?`,
      visual: gpic({ x: [-1.9, 1.9], y: [-1.2, 1.2], equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', '0.6*cos(t - 1.0)'], t: [0, 6.2832], color: 'accent', width: 2 }], points: [{ x: 0, y: 0, color: 'gold', r: 4, label: 'centre', labelDx: 6, labelDy: 12 }] }, t`One orbit of the puck, with the anchor point (gold).`, 'An ellipse centred on the origin'),
      choices: ['Ellipses centred on the anchor point (including circles and straight lines)', 'Ellipses with the anchor point at one focus', 'Spirals that close only for special starts', 'Any closed curve, depending on the start'],
      answer: 0,
      why: { 1: t`That is the inverse-square law (Kepler). For $\vec F = -k\vec r$, $x$ and $y$ oscillate independently at the same frequency, which gives an ellipse **centred** on the anchor.`, 2: 'Without damping nothing spirals: energy is conserved and the motion is periodic.', 3: t`Each coordinate obeys $\ddot x = -\omega_0^2x$ with the same $\omega_0$, so the possible paths are only ellipses.` },
      hints: [t`Write $\vec F = -k\vec r$ in components. What do $x(t)$ and $y(t)$ do?`],
      teach: t`An isotropic oscillator is two identical oscillators at right angles: same frequency, any phase, so every orbit is a centred ellipse.`,
      explain: t`$x = A_x\cos(\omega_0t - \delta_x)$ and $y = A_y\cos(\omega_0t - \delta_y)$: a Lissajous figure with ratio 1, an ellipse centred on the origin. Only two central forces give closed orbits for every start: this one and the inverse-square law (Bertrand's theorem, M5).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 5: oscillations', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'NIST CODATA 2018: Boltzmann constant and atomic mass constant', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
