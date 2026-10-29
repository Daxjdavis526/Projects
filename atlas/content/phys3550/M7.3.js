// Euler's equations (Taylor §10.7–10.8): Newton's law for rotation, dL/dt = Γ,
// written in the body's own principal axes with the rotating-frame rule of
// M6.2, (dL/dt)_space = (dL/dt)_body + ω × L, gives
//   λ₁ω̇₁ − (λ₂ − λ₃)ω₂ω₃ = Γ₁  (and cyclically).
// The ω × L terms couple the spins even with no torque. Linearizing about a
// steady spin gives ω̈ = −k ω with k = (λ₃ − λ₁)(λ₃ − λ₂)Ω²/(λ₁λ₂) for axis 3:
// stable (nutation at √k) about the largest or smallest axis, exponential
// growth about the middle one. Worked: a spacecraft (900, 1100, 1400 kg m²)
// at 5 rpm — nutation period about axis 3, e-folding time about axis 2.
// Explore: cm4-rigid (Euler's equations integrated, polhodes, ω(t)).
// Practice: derivation order, torque-free ω̇₂, thruster spin-up, the stability
// rule, nutation frequency, e-folding, reading ω(t). Transfer: a turbopump
// rotor with a product of inertia needing a rotating bearing torque ω × L.
// M7.4 takes the torque-free motion further (free precession, polhodes, energy sinks).
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { sci, r6, distinct } from './_cm.js';
import { boxFaces, rigidPic } from './_cm4.js';

const t = String.raw;

const EX = (() => {
  const l = [900, 1100, 1400], O = (5 * 2 * Math.PI) / 60;
  const k3 = ((l[2] - l[0]) * (l[2] - l[1])) / (l[0] * l[1]), wn = O * Math.sqrt(k3);
  const k2 = ((l[1] - l[0]) * (l[2] - l[1])) / (l[0] * l[2]), s = O * Math.sqrt(k2);
  return { l, O, k3, wn, Tn: (2 * Math.PI) / wn, k2, s, tau: 1 / s, t30: Math.log(300) / s };
})();

const growth = (l, ax, O) => {
  const k = ax - 1, a = l[k], b = l[(k + 1) % 3], c = l[(k + 2) % 3];
  return { k: ((a - b) * (a - c)) / (b * c), rate: O * Math.sqrt(Math.abs(((a - b) * (a - c)) / (b * c))) };
};

export default lesson({
  id: 'phys3550.M7.3',
  title: 'Euler’s equations',
  minutes: 18, difficulty: 4,
  intro: t`Newton's law for rotation, $d\vec L/dt = \vec\Gamma$, holds in an inertial frame — but there the inertia tensor keeps changing as the body turns. In the body's own principal axes the moments are constant and $\vec L = (\lambda_1\omega_1, \lambda_2\omega_2, \lambda_3\omega_3)$ is simple, but the axes rotate. The rotating-frame rule of [M6.2](#/lesson/phys3550.M6.2) pays for the switch with one extra term, $\vec\omega\times\vec L$, and the result is **Euler's equations**. That term couples the three spin components to one another: even with **no torque at all**, $\omega_1$, $\omega_2$, $\omega_3$ can trade back and forth. Whether a steady spin survives a small knock depends on which principal moment its axis has.`,
  equation: t`\begin{aligned} \lambda_1\dot\omega_1 - (\lambda_2 - \lambda_3)\,\omega_2\omega_3 &= \Gamma_1 \\ \lambda_2\dot\omega_2 - (\lambda_3 - \lambda_1)\,\omega_3\omega_1 &= \Gamma_2 \\ \lambda_3\dot\omega_3 - (\lambda_1 - \lambda_2)\,\omega_1\omega_2 &= \Gamma_3 \end{aligned}`,
  symbols: [
    { tex: '\\lambda_1,\\ \\lambda_2,\\ \\lambda_3', text: 'the principal moments of inertia (kg·m²), constant because the axes move with the body' },
    { tex: '\\omega_1,\\ \\omega_2,\\ \\omega_3', text: 'the components of the angular velocity along the body’s principal axes (rad/s)' },
    { tex: '\\dot\\omega_i', text: 'their rates of change, $d\\omega_i/dt$ (rad/s²), as seen in the body' },
    { tex: '\\Gamma_1,\\ \\Gamma_2,\\ \\Gamma_3', text: 'the components of the external torque about the centre of mass, along the same body axes (N·m)' },
    { tex: '(\\lambda_2 - \\lambda_3)\\,\\omega_2\\omega_3', text: 'the coupling term, from $\\vec\\omega\\times\\vec L$: zero when the two other moments are equal, or when the body spins about a single principal axis' },
  ],
  why: t`Every attitude-control system — reaction wheels, thrusters, spin stabilization — is designed with these three equations, and they explain why a spinning satellite, a thrown phone and a tumbling asteroid behave as they do ([M7.4](#/lesson/phys3550.M7.4)).`,
  visual: {
    type: 'cm4-rigid',
    title: 'Euler’s equations, integrated',
    lead: t`A torque-free box with principal moments $1 : 2 : 2.6$ (kg·m²). Left (top, on a phone): the body turning in space with its fixed $\vec L$ (gold) and its $\vec\omega$ (red). Right (below it): the tip of $\vec L$ as seen from the body, on the sphere $|\vec L| = $ const. Below: $\omega_1$, $\omega_2$, $\omega_3$ from Euler's equations. Choose an axis and press Play.`,
    tasks: [
      t`Axis 3 (largest moment): $\omega_3$ stays near 2 rad/s while $\omega_1$ and $\omega_2$ wobble gently — a stable spin, with $\vec L$ circling axis 3 on the sphere.`,
      t`Axis 1 (smallest moment): stable too. Now axis 2: after a quiet start, $\omega_2$ swings all the way to $-2$ and back — the body flips over again and again.`,
      t`Make the tilt tiny (0.5°): the flips come later but still come. Instability does not need a big knock.`,
    ],
    params: { I: [1, 2, 2.6], axis: 2, tilt: 3, w: 2, T: 40, controls: ['axis', 'tilt'], panels: ['body', 'sphere', 'omega'], hide: [] },
    caption: t`Torque-free Euler's equations integrated numerically (RK4) for a uniform box with principal moments 1, 2 and 2.6 kg·m²; $|\vec\omega|$ starts at 2 rad/s. Vectors show directions only.`,
  },
  example: {
    prompt: t`A spacecraft has principal moments $\lambda_1 = ${EX.l[0]}$, $\lambda_2 = ${EX.l[1]}$, $\lambda_3 = ${EX.l[2]}$ kg·m² and spins at $\Omega = 5$ rpm with no torque. (a) Spinning about axis 3, it is knocked slightly: at what period do $\omega_1$ and $\omega_2$ oscillate? (b) What if it spins about axis 2 instead?`,
    visual: rigidPic({ I: EX.l, axis: 3, tilt: 6, w: EX.O, T: 120, panels: ['sphere', 'omega'] }, t`(a) The spin about axis 3 after a $6^\circ$ knock: $\vec L$ circles axis 3 (top) and $\omega_1$, $\omega_2$ oscillate (below). Euler's equations integrated numerically.`),
    steps: [
      { label: 'Steady spin', text: t`With $\Gamma = 0$ and $\vec\omega = (0, 0, \Omega)$ every coupling term vanishes: a spin about any principal axis is a solution. The question is whether it survives a knock.` },
      { label: 'Linearize', text: t`Let $\omega_1, \omega_2$ be small and $\omega_3 \approx \Omega$. The third equation says $\lambda_3\dot\omega_3 = (\lambda_1 - \lambda_2)\omega_1\omega_2$ — second order in small things, so $\omega_3$ stays $\Omega$. The first two become $\lambda_1\dot\omega_1 = (\lambda_2 - \lambda_3)\Omega\,\omega_2$ and $\lambda_2\dot\omega_2 = (\lambda_3 - \lambda_1)\Omega\,\omega_1$.` },
      { label: 'Combine', text: t`Differentiate the first and substitute the second: $$\ddot\omega_1 = -\frac{(\lambda_3 - \lambda_1)(\lambda_3 - \lambda_2)}{\lambda_1\lambda_2}\,\Omega^2\,\omega_1.$$ A harmonic oscillator when the coefficient is negative, exponential growth when it is positive.` },
      { label: '(a) numbers', text: t`$\Omega = 5\times2\pi/60 = ${sci(EX.O, 4)}$ rad/s and $\frac{(500)(300)}{(900)(1100)} = ${sci(EX.k3, 4)}$, so $\omega_1$ oscillates at $${sci(EX.O, 4)}\times\sqrt{${sci(EX.k3, 4)}} = ${sci(EX.wn, 3)}$ rad/s: a period of $${sci(EX.Tn, 3)}$ s. Bounded: axis 3 is stable.` },
      { label: '(b) axis 2', text: t`Relabel so the spin is about axis 2: $\ddot\omega_1 = -\frac{(\lambda_2 - \lambda_1)(\lambda_2 - \lambda_3)}{\lambda_1\lambda_3}\Omega^2\omega_1 = +${sci(EX.k2, 3)}\,\Omega^2\omega_1$. Now the coefficient is **positive** (one factor of each sign), and $\omega_1 \propto e^{st}$ with $s = ${sci(EX.s, 3)}\ \text{s}^{-1}$.` },
      { label: 'Sense check', text: t`The e-folding time is $1/s = ${sci(EX.tau, 3)}$ s, so a $0.1^\circ$ wobble reaches $30^\circ$ (300 times bigger) in about $\ln 300/s = ${sci(EX.t30, 2)}$ s — about four turns at 5 rpm — and the spacecraft is tumbling. Rates scale with $\Omega$, so spinning faster does not help — it only fails sooner.` },
    ],
    answer: t`(a) Stable: $\omega_1$ and $\omega_2$ oscillate with period $${sci(EX.Tn, 3)}$ s. (b) Unstable: small departures grow as $e^{t/${sci(EX.tau, 3)}\,\text{s}}$.`,
  },
  practice: [
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Put the steps of the derivation of Euler's equations in order.`,
      visual: rigidPic({ I: [1, 2, 2.6], axis: 3, tilt: 15, w: 1.5, T: 10, panels: ['body'], vectors: ['L', 'w'] }, t`A body turning in space, with its principal axes (1, 2, 3) carried along. Drag to turn the view.`),
      items: [t`In an inertial frame, $d\vec L/dt = \vec\Gamma$`, t`Switch to the body frame: $(d\vec L/dt)_{\text{space}} = (d\vec L/dt)_{\text{body}} + \vec\omega\times\vec L$`, t`In principal axes, $\vec L = (\lambda_1\omega_1, \lambda_2\omega_2, \lambda_3\omega_3)$ with every $\lambda$ constant`, t`Take the first component: $\lambda_1\dot\omega_1 + (\lambda_3 - \lambda_2)\omega_2\omega_3 = \Gamma_1$, then the others by cycling $1 \to 2 \to 3$`],
      hints: [t`Start from what you know holds (inertial frames), then change frame, then choose the axes that make $\vec L$ simple.`],
      teach: t`Euler's equations are $d\vec L/dt = \vec\Gamma$ moved into the rotating principal-axis frame.`,
      explain: t`The rotating-frame rule is the same one that produced the Coriolis and centrifugal terms in [M6.2](#/lesson/phys3550.M6.2); here it acts on $\vec L$. In the body frame the moments are constant, which is the whole point of the switch. The $\vec\omega\times\vec L$ component along axis 1 is $\omega_2L_3 - \omega_3L_2 = (\lambda_3 - \lambda_2)\omega_2\omega_3$.`,
    }),
    expr({
      id: 'omega2-dot', difficulty: 2,
      prompt: t`With no torque, solve Euler's second equation for $\dot\omega_2$. Type $\lambda_i$ as \`lambda_1\` etc. and $\omega_i$ as \`omega_1\` etc.`,
      answer: '(lambda_3 - lambda_1)*omega_3*omega_1/lambda_2', answerTeX: t`\frac{(\lambda_3 - \lambda_1)\,\omega_3\omega_1}{\lambda_2}`, lhs: '\\dot\\omega_2',
      vars: { lambda_1: [1, 2], lambda_2: [2.5, 3.5], lambda_3: [4, 5], omega_1: [0.2, 1], omega_3: [0.5, 2] },
      errors: [{ answer: '(lambda_1 - lambda_3)*omega_3*omega_1/lambda_2', feedback: t`Sign: the equation is $\lambda_2\dot\omega_2 - (\lambda_3 - \lambda_1)\omega_3\omega_1 = 0$, cycled from the first by $1 \to 2 \to 3 \to 1$.` }, { answer: '(lambda_3 - lambda_1)*omega_3*omega_1', feedback: t`Divide by $\lambda_2$: the equation is for $\lambda_2\dot\omega_2$.` }],
      hints: [t`Cycle the indices of $\lambda_1\dot\omega_1 - (\lambda_2 - \lambda_3)\omega_2\omega_3 = \Gamma_1$: $1 \to 2$, $2 \to 3$, $3 \to 1$.`],
      teach: t`Each of Euler's equations is the previous one with the indices cycled.`,
      explain: t`$\lambda_2\dot\omega_2 = (\lambda_3 - \lambda_1)\omega_3\omega_1$, so $\dot\omega_2 = (\lambda_3 - \lambda_1)\omega_3\omega_1/\lambda_2$. Note the cyclic order: for $\dot\omega_2$ the difference is $\lambda_3 - \lambda_1$, not $\lambda_1 - \lambda_3$.`,
      visual: rigidPic({ I: [1, 2, 2.6], axis: 1, tilt: 20, w: 1.5, T: 20, panels: ['omega'] }, t`Torque-free $\omega_1$, $\omega_2$, $\omega_3$ for a body with moments 1, 2, 2.6 kg·m²: none of them is constant, though no torque acts.`),
    }),
    num({
      id: 'spin-up', difficulty: 1,
      gen(r) {
        const l3 = r.pick([600, 800, 1200]), F = r.pick([5, 10, 22]), d = r.pick([1.2, 1.5, 2]), rpm = r.pick([5, 10, 15]);
        const G = F * d, tt = (l3 * rpm * 2 * Math.PI) / 60 / G;
        return {
          prompt: t`A spacecraft at rest has $\lambda_3 = ${l3}$ kg·m² about its symmetry axis. Two thrusters, each $${F}\ \text{N}$, fire tangentially in opposite directions on opposite sides, $${d / 2}\ \text{m}$ from the axis, making a pure torque about axis 3. How long until it spins at ${rpm} rpm?`,
          answer: tt, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: (l3 * rpm) / G, feedback: t`Convert rpm to rad/s: multiply by $2\pi/60$.` }, { value: (l3 * rpm * 2 * Math.PI) / 60 / (F * d / 2), feedback: t`Both thrusters push: the torque is $2F\times(d/2) = Fd$.` }], tt),
          hints: [t`With $\omega_1 = \omega_2 = 0$ the coupling terms vanish: $\lambda_3\dot\omega_3 = \Gamma_3$.`, t`$\Gamma_3 = 2\times${F}\times${d / 2}$ N·m; $\omega = ${rpm}\times2\pi/60$ rad/s.`],
          teach: t`A torque along a principal axis, with no other spin, is the one case where Euler's equations reduce to $\lambda\dot\omega = \Gamma$.`,
          explain: t`$\Gamma_3 = ${sci(G, 3)}$ N·m and $\omega = ${sci((rpm * 2 * Math.PI) / 60, 3)}$ rad/s, so $t = \lambda_3\omega/\Gamma_3 = ${sci(tt, 3)}$ s. If the torque were off-axis, or the body already spinning about another axis, the $\omega\omega$ terms would join in.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.8, grid: false, axes: false, scale: 1.3, parallelograms: boxFaces([1.6, 1.6, 1.2], [0, 0, 0], 'accent', 0.2), vectors: [{ from: [0.8, 0, 0], to: [0.8, 0.9, 0], color: 'warn', label: '\\vec F' }, { from: [-0.8, 0, 0], to: [-0.8, -0.9, 0], color: 'warn', label: '\\vec F' }, { to: [0, 0, 1.6], color: 'gold', label: '\\hat e_3' }] }, caption: t`Two thrusters firing in opposite directions on opposite sides: a couple about axis 3. Schematic. Drag to turn.` },
        };
      },
    }),
    mcq({
      id: 'stability-rule', difficulty: 2,
      prompt: t`From $\ddot\omega_1 = -\frac{(\lambda_3 - \lambda_1)(\lambda_3 - \lambda_2)}{\lambda_1\lambda_2}\Omega^2\omega_1$ for a spin about axis 3, when is that spin stable?`,
      visual: rigidPic({ I: [1, 2, 2.6], axis: 1, tilt: 4, w: 2, T: 30, panels: ['sphere'] }, t`$\vec L$ seen from the body: loops around axes 1 and 3 (grey) and, through axis 2, the separatrix (violet). The gold path started near axis 1.`),
      choices: [t`When $\lambda_3$ is the largest or the smallest of the three`, t`Only when $\lambda_3$ is the largest`, t`When $\lambda_3$ is the middle one`, t`Always, if $\Omega$ is large enough`],
      answer: 0,
      why: { 1: t`If $\lambda_3$ is the smallest, both factors are negative and their product is positive — the coefficient of $\omega_1$ is negative and the motion oscillates. (With energy dissipation, the smallest axis does become unstable: [M7.4](#/lesson/phys3550.M7.4).)`, 2: t`Then one factor is positive and one negative: $\ddot\omega_1 = +k\omega_1$, exponential growth. That is the tennis-racket instability.`, 3: t`$\Omega$ multiplies both the stable and the unstable cases equally; it sets how fast, not whether.` },
      hints: [t`Stable means the coefficient in front of $\omega_1$ is negative, i.e. the product $(\lambda_3 - \lambda_1)(\lambda_3 - \lambda_2)$ is positive.`],
      teach: t`A rigid body spins stably about its largest or smallest principal axis, and unstably about the middle one.`,
      explain: t`The product is positive when both differences have the same sign — $\lambda_3$ largest or smallest. With $\lambda_3$ in the middle, the spin is a saddle: tiny departures grow exponentially. The sphere shows it: closed loops around axes 1 and 3, a crossing at axis 2.`,
    }),
    num({
      id: 'nutation', difficulty: 3,
      gen(r) {
        const l = [r.pick([400, 500]), r.pick([600, 700]), r.pick([800, 900])], rpm = r.pick([3, 6, 10]), ax = r.pick([1, 3]);
        const O = (rpm * 2 * Math.PI) / 60, g = growth(l, ax, O), T = (2 * Math.PI) / g.rate;
        return {
          prompt: t`A torque-free satellite with principal moments $\lambda_1 = ${l[0]}$, $\lambda_2 = ${l[1]}$, $\lambda_3 = ${l[2]}$ kg·m² spins at ${rpm} rpm about axis ${ax} and is nudged. What is the period of the small oscillation of the other two components of $\vec\omega$?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: (2 * Math.PI) / O, feedback: t`That is the spin period. The wobble runs at $\Omega\sqrt{k}$, with $k = \frac{(\lambda_a - \lambda_b)(\lambda_a - \lambda_c)}{\lambda_b\lambda_c}$ for spin axis $a$.` }, { value: 1 / (g.rate / (2 * Math.PI)) / (2 * Math.PI), feedback: t`Period $= 2\pi/(\text{angular frequency})$.` }], T),
          hints: [t`Spin axis $a = ${ax}$; the other two are $b$ and $c$. The wobble's angular frequency is $\Omega\sqrt{\frac{(\lambda_a - \lambda_b)(\lambda_a - \lambda_c)}{\lambda_b\lambda_c}}$.`, t`$\Omega = ${rpm}\times2\pi/60$ rad/s.`],
          teach: t`About a stable axis, a knocked spin wobbles at $\Omega\sqrt{(\lambda_a - \lambda_b)(\lambda_a - \lambda_c)/(\lambda_b\lambda_c)}$.`,
          explain: t`$k = ${sci(g.k, 3)}$, so the wobble's angular frequency is $${sci(O, 3)}\times\sqrt{${sci(g.k, 3)}} = ${sci(g.rate, 3)}$ rad/s and its period $${sci(T, 3)}$ s. In body axes this is the satellite's nutation; seen from space the spin axis cones around the fixed $\vec L$.`,
          visual: rigidPic({ I: l.map((x) => x / 100), axis: ax, tilt: 8, w: 1.5, T: 30, panels: ['sphere'] }, t`$\vec L$ seen from the body, circling the spin axis (moments drawn to scale; time not).`),
        };
      },
    }),
    num({
      id: 'efold', difficulty: 3,
      gen(r) {
        const l = [r.pick([300, 350]), r.pick([450, 500]), r.pick([600, 700])], rpm = r.pick([4, 8, 12]);
        const O = (rpm * 2 * Math.PI) / 60, g = growth(l, 2, O), tau = 1 / g.rate;
        return {
          prompt: t`The same kind of satellite — $\lambda_1 = ${l[0]}$, $\lambda_2 = ${l[1]}$, $\lambda_3 = ${l[2]}$ kg·m² — is spun at ${rpm} rpm about axis 2 by mistake. What is the e-folding time of a small wobble?`,
          answer: tau, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: 1 / (O * Math.sqrt(((l[1] - l[0]) * (l[2] - l[1])) / (l[0] * l[1]))), feedback: t`The denominator is the product of the **other two** moments, $\lambda_1\lambda_3$.` }, { value: (2 * Math.PI) / g.rate, feedback: t`That is $2\pi/s$. Exponential growth $e^{st}$ e-folds in $1/s$.` }], tau),
          hints: [t`For spin about axis 2: $\ddot\omega_1 = +\frac{(\lambda_2 - \lambda_1)(\lambda_3 - \lambda_2)}{\lambda_1\lambda_3}\Omega^2\omega_1$.`, t`The growth rate is $s = \Omega\sqrt{\cdots}$, and the e-folding time is $1/s$.`],
          teach: t`About the middle axis a wobble grows as $e^{st}$, with $s$ set by the spin rate and the moments.`,
          explain: t`$s = ${sci(O, 3)}\times\sqrt{\frac{(${l[1] - l[0]})(${l[2] - l[1]})}{${l[0]}\times${l[2]}}} = ${sci(g.rate, 3)}\ \text{s}^{-1}$, so $\tau = ${sci(tau, 3)}$ s. A few $\tau$ and the satellite is tumbling end over end.`,
          visual: rigidPic({ I: l.map((x) => x / 100), axis: 2, tilt: 1, w: 1.5, T: 40, panels: ['sphere'] }, t`$\vec L$ seen from the body, started $1^\circ$ from axis 2: it runs out along the separatrix (moments drawn to scale; time not).`),
        };
      },
    }),
    mcq({
      id: 'read-plot', difficulty: 2,
      prompt: t`A torque-free box with principal moments 1, 2 and 2.6 kg·m² was started spinning near one of its principal axes. Its body-frame $\vec\omega$ is plotted. Near which axis did it start?`,
      visual: rigidPic({ I: [1, 2, 2.6], axis: 2, tilt: 2, w: 2, T: 40, panels: ['omega'] }, t`The body-frame components of $\vec\omega$ over 40 s, from Euler's equations.`),
      choices: [t`Axis 2, the middle one: $\omega_2$ starts near 2 rad/s and repeatedly reverses — the body flips`, t`Axis 1: $\omega_1$ swings the furthest`, t`Axis 3, the largest: a stable spin`, t`None: a torque must be acting, since the components change`],
      answer: 0,
      why: { 1: t`$\omega_1$ starts at zero. The component that starts large is the spin axis, and here it flips sign.`, 2: t`About axis 3, $\omega_3$ would stay near its start, with only a small wobble in the others.`, 3: t`Euler's equations change $\omega_1$, $\omega_2$, $\omega_3$ even with no torque, through the $\vec\omega\times\vec L$ terms; $\vec L$ itself is constant in space.` },
      hints: [t`Which component starts large? What does it do over time?`],
      teach: t`In $\omega(t)$, an intermediate-axis spin shows up as its component reversing sign again and again.`,
      explain: t`$\omega_2$ starts near 2 rad/s, holds, then swings to $-2$ and back: each reversal is the body turning over. $\omega_1$ and $\omega_3$ pulse during each flip. Nothing outside acts; $\vec L$ is fixed in space throughout.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turbopump', difficulty: 3, transfer: true,
      gen(r) {
        const rpm = r.pick([20000, 30000, 36000]), Ixz = r.pick([1, 2, 4]) * 1e-6, d = r.pick([0.12, 0.15, 0.2]);
        const w = (rpm * 2 * Math.PI) / 60, G = Ixz * w * w, F = G / d;
        return {
          prompt: t`A rocket turbopump rotor is held by two bearings ${d} m apart and driven at a steady ${rpm.toLocaleString('en-US').replace(',', ' ')} rpm about its shaft ($z$). A slight assembly error leaves a product of inertia $I_{xz} = ${sci(Ixz, 2)}$ kg·m² in axes fixed to the rotor. With $\vec\omega$ constant in the rotor frame, Euler's equations in their general form give $\vec\Gamma = \vec\omega\times\vec L$. How big is the rotating force each bearing must supply (the torque divided by the spacing), in newtons?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: distinct([{ value: Ixz * w * w, feedback: t`That is the torque, in N·m. Each bearing supplies a force; the pair makes a couple of size $F\,d$.` }, { value: (Ixz * rpm * rpm) / d, feedback: t`Convert rpm to rad/s before squaring: $\omega = \text{rpm}\times2\pi/60$.` }, { value: (Ixz * w) / d, feedback: t`$\vec L$ is proportional to $\omega$, and $\vec\omega\times\vec L$ to $\omega^2$.` }], F),
          hints: [t`$\vec L = \mathbf I\vec\omega$ with $\vec\omega = \omega\hat z$: $L_x = I_{xz}\omega$, $L_z = I_{zz}\omega$.`, t`$\vec\omega\times\vec L = \omega\hat z\times I_{xz}\omega\hat x = I_{xz}\omega^2\hat y$: size $|I_{xz}|\omega^2$, turning with the rotor.`],
          teach: t`A rotor spun about a non-principal axis needs a torque $\vec\omega\times\vec L$ just to keep turning steadily; it rotates with the shaft and shakes the bearings.`,
          explain: t`$\omega = ${sci(w, 4)}$ rad/s, so $\Gamma = I_{xz}\omega^2 = ${sci(G, 3)}$ N·m and each bearing pushes with $${sci(F, 3)}$ N, sweeping round once per revolution — a vibration at the shaft frequency. That is why turbomachinery is dynamically balanced: a product of inertia of a few grams times square centimetres is enough to matter at these speeds.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.8, grid: false, axes: false, scale: 1.25, curves: [{ param: ['0.7*cos(t)', '0.7*sin(t)', 0.15], t: [0, 6.2832], color: 'accent' }, { param: ['0.7*cos(t)', '0.7*sin(t)', -0.15], t: [0, 6.2832], color: 'accent' }], segments: [{ from: [0, 0, -1.6], to: [0, 0, 1.6], color: 'ink2' }, { from: [-0.25, 0, -1.2], to: [0.25, 0, -1.2], color: 'ink3' }, { from: [-0.25, 0, 1.2], to: [0.25, 0, 1.2], color: 'ink3' }], vectors: [{ to: [0, 0, 1.5], color: 'gold', label: '\\vec\\omega' }] }, caption: t`A rotor disc on a shaft between two bearings (grey bars). Schematic; the imbalance is too small to see. Drag to turn.` },
        };
      },
    }),
    num({
      id: 'cp-efold', difficulty: 3,
      gen(r) {
        const l = [r.pick([50, 60]), r.pick([80, 90]), r.pick([110, 120])], rpm = r.pick([10, 20, 30]);
        const O = (rpm * 2 * Math.PI) / 60, g = growth(l, 2, O), t30 = Math.log(300) / g.rate;
        return {
          prompt: t`A small satellite ($\lambda = ${l[0]}, ${l[1]}, ${l[2]}$ kg·m²) is spun at ${rpm} rpm about its intermediate axis with a $0.1^\circ$ error. Roughly how long until the error reaches $30^\circ$? (Treat the growth as exponential all the way.)`,
          answer: t30, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: 300 / g.rate, feedback: t`Exponential growth: the time to grow by a factor 300 is $\ln 300/s$, not $300/s$.` }, { value: Math.log(300) / O, feedback: t`The growth rate is $s = \Omega\sqrt{(\lambda_2 - \lambda_1)(\lambda_3 - \lambda_2)/(\lambda_1\lambda_3)}$, not the spin rate itself.` }], t30),
          hints: [t`$s = \Omega\sqrt{\frac{(\lambda_2 - \lambda_1)(\lambda_3 - \lambda_2)}{\lambda_1\lambda_3}}$.`, t`From $0.1^\circ$ to $30^\circ$ is a factor of 300: $t = \ln(300)/s$.`],
          teach: t`Exponential growth turns a tiny error into a tumble in a few e-folding times.`,
          explain: t`$s = ${sci(g.rate, 3)}\ \text{s}^{-1}$ and $t = \ln 300/s = ${sci(t30, 3)}$ s. (Past a few tens of degrees the linear treatment fails, and the body completes its flip along the separatrix.)`,
          visual: rigidPic({ I: l.map((x) => x / 20), axis: 2, tilt: 0.5, w: 1.5, T: 40, panels: ['omega'] }, t`A spin started near the middle axis: the components of $\vec\omega$ in the body (moments to scale, time not).`),
        };
      },
    }),
    mcq({
      id: 'cp-symmetric', difficulty: 2,
      prompt: t`For a torque-free body with $\lambda_1 = \lambda_2$ (a symmetric top, such as a cylinder or the Earth), what does Euler's third equation say about $\omega_3$?`,
      visual: rigidPic({ I: [1, 1, 1.6], axis: 3, tilt: 15, w: 2, T: 20, panels: ['omega'] }, t`The body-frame $\omega_1$, $\omega_2$, $\omega_3$ of a symmetric body ($\lambda_1 = \lambda_2 = 1$, $\lambda_3 = 1.6$ kg·m²), no torque.`),
      choices: [t`It is constant: $\lambda_3\dot\omega_3 = (\lambda_1 - \lambda_2)\omega_1\omega_2 = 0$`, t`It oscillates, because $\omega_1$ and $\omega_2$ do`, t`It decays, because the body precesses`, t`It is zero, because a symmetric body cannot spin about its axis`],
      answer: 0,
      why: { 1: t`$\omega_1$ and $\omega_2$ do oscillate, but they enter $\dot\omega_3$ only through $(\lambda_1 - \lambda_2)$, which is zero.`, 2: t`Nothing removes energy in Euler's torque-free equations; $\omega_3$ is exactly constant.`, 3: t`A symmetric body spins about its axis perfectly well — a spinning top, the Earth.` },
      hints: [t`Set $\Gamma_3 = 0$ and $\lambda_1 = \lambda_2$ in $\lambda_3\dot\omega_3 - (\lambda_1 - \lambda_2)\omega_1\omega_2 = \Gamma_3$.`],
      teach: t`For a symmetric body the spin about the symmetry axis is constant; only the perpendicular part of $\vec\omega$ moves.`,
      explain: t`$\dot\omega_3 = 0$, so $\omega_3$ is constant (the flat gold line), and the first two equations make $(\omega_1, \omega_2)$ turn round at the steady rate $(\lambda_3 - \lambda_1)\omega_3/\lambda_1$ — free precession, the subject of [M7.4](#/lesson/phys3550.M7.4).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §10.7–10.8: Euler’s equations; Euler’s equations with zero torque', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'P. C. Hughes, Spacecraft Attitude Dynamics (Wiley, 1986; Dover 2004), ch. 3–5: torque-free motion and spin stability', url: 'https://store.doverpublications.com/products/9780486439259' },
  ],
});
