// Lagrange's equations in practice (Taylor §7.5–7.6): the recipe — choose
// coordinates, write T and U, form L, differentiate — on an Atwood machine
// with a massive pulley, a pendulum whose support is accelerated (the support
// acts as a horizontal gravity, a plumb-bob accelerometer), and the bead on a
// rotating hoop: θ̈ = (ω² cos θ − g/R) sin θ, with the bottom stable only for
// ω² < g/R and a pair of off-axis equilibria cos θ₀ = g/(Rω²) beyond it — a
// pitchfork bifurcation, shown with mech-energy's U_eff and a θ₀(ω) diagram.
// The hoop's motor does work, so E is not conserved (h is: M4.5).
// Transfer: the centrifugal governor.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';
import { hoopPic, cartPendPic } from './_cm2.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the hoop of the Explore: m = 0.1 kg, R = 0.2 m, energies in mJ
const HOOP = { m: 0.1, R: 0.2 };
const UEFF = '196*(1 - cos(x)) - 2*w^2*sin(x)^2';      // mgR(1 − cos θ) − ½mR²ω² sin²θ, in mJ
const ueff = (w, extra = {}, caption) => ({
  type: 'mech-energy',
  params: { U: UEFF, constants: { w }, x: [-3.6, 3.6], y: [-260, 490], m: 4, unit: 'mJ', lunit: 'rad', xlabel: 'θ (rad)', play: false, dragE: false, dragX: false, bars: false, force: false, readouts: [], particle: false, turning: false, ...extra },
  caption,
});

// the bifurcation diagram θ₀(ω) for g/R = 49 s⁻², ω₀ = 7 rad/s
function bifurcation({ w = null, caption, marks = true }) {
  return gpic({
    x: [0, 14], y: [-100, 100], xlabel: 'ω (rad/s)', ylabel: 'θ₀ (degrees)',
    curves: [
      { fn: '0', domain: [0, 7], color: 'accent', width: 2.6 },
      { fn: '0', domain: [7, 14], color: 'accent', width: 2, dash: true },
      { fn: 'acos(49/x^2)*180/pi', domain: [7.0001, 14], color: 'good', width: 2.6 },
      { fn: '-acos(49/x^2)*180/pi', domain: [7.0001, 14], color: 'good', width: 2.6 },
    ],
    vlines: marks ? [{ x: 7, label: 'ω₀ = √(g/R)', color: 'ink3' }, ...(w ? [{ x: w, color: 'warn' }] : [])] : [],
    points: [lab(3.5, 9, 'bottom: stable', 'accent'), lab(10.5, 9, 'bottom: unstable', 'ink3'), lab(9.2, 72, 'off-axis: stable', 'good')],
  }, caption, 'Equilibrium angle of the bead against the hoop’s spin rate: one branch splits into three');
}

const EX = (() => {
  const R = 0.2, w = 10, w0 = Math.sqrt(G / R), c = G / (R * w * w);
  return { R, w, w0, th0: Math.acos(c) / DEG, Om: Math.sqrt(w * w - (G / R) ** 2 / (w * w)) };
})();

export default lesson({
  id: 'phys3550.M4.3',
  title: 'Lagrange’s equations in practice',
  minutes: 20, difficulty: 3,
  intro: t`The recipe never changes. **Choose** generalized coordinates that respect the constraints ([M4.1](#/lesson/phys3550.M4.1)). **Write** $T$ and $U$ in those coordinates. **Form** $L = T - U$. **Differentiate**: one Lagrange equation per coordinate ([M4.2](#/lesson/phys3550.M4.2)). Ropes, rods, wires and hoops never appear — their forces of constraint are taken care of by the coordinates. The payoff is largest where Newton is clumsiest: moving supports, rotating frames, several bodies joined together. The bead on a spinning hoop shows all of it, and something new besides: as the spin rises past $\sqrt{g/R}$, the bottom of the hoop stops being stable and two new resting places appear — a **bifurcation**.`,
  equation: t`L = \tfrac12mR^2\big(\dot\theta^2 + \omega^2\sin^2\theta\big) + mgR\cos\theta \;\Longrightarrow\; \ddot\theta = \Big(\omega^2\cos\theta - \frac gR\Big)\sin\theta`,
  symbols: [
    { tex: '\\theta', text: 'the bead’s angle round the hoop, from the bottom (rad) — the one generalized coordinate' },
    { tex: 'R', text: 'the hoop’s radius, in m' },
    { tex: '\\omega', text: 'the hoop’s steady spin about its vertical diameter, in rad/s, held fixed by a motor' },
    { tex: 'm', text: 'the bead’s mass, in kg (it cancels from the equation of motion)' },
    { tex: 'g', text: '9.8 m/s²' },
    { tex: 'mgR\\cos\\theta', text: '$-U$, with the zero of height at the hoop’s centre (J)' },
  ],
  why: t`Every mechanism from a robot arm to a gyroscope is solved this way; and the hoop's bifurcation — one state splitting into two mirror-image ones as a parameter crosses a threshold — is the simplest example of spontaneous symmetry breaking, the idea behind the Higgs mechanism.`,
  visual: {
    type: 'mech-energy',
    title: 'The hoop’s effective potential',
    lead: t`Lagrange's equation for $\theta$ is a one-dimensional motion in the **effective potential** $U_{\text{eff}} = mgR(1 - \cos\theta) - \tfrac12mR^2\omega^2\sin^2\theta$. Equilibria are marked; drag the energy line and press Play to watch the bead.`,
    tasks: [
      t`At $\omega = 5$ rad/s the bottom ($\theta = 0$) is the only well: the bead rocks about it.`,
      t`Raise $\omega$ past $7$ rad/s ($= \sqrt{g/R}$): the bottom turns into a hill and two wells open on either side — the bifurcation.`,
      t`At $\omega = 10$ rad/s the wells sit near $\pm 61^\circ$, where $\cos\theta_0 = g/(R\omega^2)$. Put the energy just above a well's floor and the bead oscillates about it.`,
    ],
    params: {
      U: UEFF, x: [-3.6, 3.6], y: [-260, 490], m: 4, unit: 'mJ', lunit: 'rad', xlabel: 'θ (rad)', E: 60, x0: 0.6,
      sliders: [{ key: 'w', label: 'Spin $\\omega$', min: 0, max: 12, step: 0.1, value: 5, unit: '\\mathrm{rad/s}', explain: 'The hoop’s spin rate, held steady by a motor. Critical value $\\sqrt{g/R} = 7$ rad/s.' }],
      readouts: ['E', 'U', 'K'], bars: false, force: false,
    },
    caption: t`A 0.1 kg bead on a frictionless hoop of radius 0.2 m. Energies in mJ, with $U_{\text{eff}} = 0$ at the bottom; the "kinetic energy" here is $\tfrac12mR^2\dot\theta^2$, the motion round the hoop only. This $E$ is conserved, but it is not the bead's true energy: see the worked example.`,
  },
  example: {
    prompt: t`A bead slides on a frictionless hoop of radius $R = ${EX.R}$ m spinning at $\omega = ${EX.w}$ rad/s about its vertical diameter. Find its equation of motion, its equilibria, which are stable, and the frequency of small oscillations about the stable ones.`,
    visual: bifurcation({ w: EX.w, caption: t`Where the bead can rest, against the spin (for $g/R = 49$ s⁻², as here). Solid: stable; dashed: unstable. The orange line marks $\omega = ${EX.w}$ rad/s. The top of the hoop, always unstable, is not drawn.` }),
    steps: [
      { label: 'Lagrangian', text: t`From [M4.1](#/lesson/phys3550.M4.1), $T = \tfrac12mR^2(\dot\theta^2 + \omega^2\sin^2\theta)$; with the centre as zero, $U = -mgR\cos\theta$. So $L = \tfrac12mR^2(\dot\theta^2 + \omega^2\sin^2\theta) + mgR\cos\theta$.` },
      { label: 'Lagrange', text: t`$\partial L/\partial\dot\theta = mR^2\dot\theta$; $\partial L/\partial\theta = mR^2\omega^2\sin\theta\cos\theta - mgR\sin\theta$. So $mR^2\ddot\theta = mR^2\omega^2\sin\theta\cos\theta - mgR\sin\theta$, i.e. $\ddot\theta = (\omega^2\cos\theta - g/R)\sin\theta$.` },
      { label: 'Equilibria', text: t`$\ddot\theta = 0$ needs $\sin\theta = 0$ (bottom or top) or $\cos\theta_0 = g/(R\omega^2)$. Here $g/R = ${sci(G / EX.R, 3)}$ s⁻² and $\omega^2 = ${EX.w * EX.w}$, so $\cos\theta_0 = ${sci(G / (EX.R * EX.w * EX.w), 3)}$ and $\theta_0 = \pm${sci(EX.th0, 3)}^\circ$. These exist only because $\omega > \sqrt{g/R} = ${sci(EX.w0, 3)}$ rad/s.` },
      { label: 'Stability', text: t`Near $\theta = 0$: $\ddot\theta \approx (\omega^2 - g/R)\theta$, positive coefficient — the bottom is **unstable**. Near $\theta_0$, put $\theta = \theta_0 + \epsilon$: $\ddot\epsilon \approx -\omega^2\sin^2\theta_0\,\epsilon$ — **stable**.` },
      { label: 'Frequency', text: t`$\Omega = \omega\sin\theta_0 = \sqrt{\omega^2 - (g/R)^2/\omega^2} = ${sci(EX.Om, 3)}$ rad/s, a period of $${sci((2 * Math.PI) / EX.Om, 3)}$ s.` },
      { label: 'Energy?', text: t`The bead's true energy $T + U$ is **not** conserved: the motor keeps $\omega$ fixed by pushing on the bead, doing work. What is conserved is $\tfrac12mR^2\dot\theta^2 + U_{\text{eff}}$ — the quantity $h$ of [M4.5](#/lesson/phys3550.M4.5).` },
    ],
    answer: t`$\ddot\theta = (\omega^2\cos\theta - g/R)\sin\theta$; at $\omega = ${EX.w}$ rad/s the bottom is unstable and the bead rests at $\theta_0 = \pm${sci(EX.th0, 3)}^\circ$, oscillating about it at $\Omega = ${sci(EX.Om, 3)}$ rad/s.`,
  },
  practice: [
    num({
      id: 'atwood', difficulty: 2,
      gen(r) {
        const m1 = r.pick([3, 4, 5]), m2 = r.pick([1, 2]), I = r.pick([0.01, 0.02, 0.05]), rr = r.pick([0.1, 0.2]);
        const a = ((m1 - m2) * G) / (m1 + m2 + I / (rr * rr));
        return {
          prompt: t`An Atwood machine has $m_1 = ${m1}$ kg and $m_2 = ${m2}$ kg on a non-slipping string over a pulley of radius ${rr} m and moment of inertia ${I} kg·m². With $x$ the distance $m_1$ has descended, $L = \tfrac12(m_1 + m_2 + I/r^2)\dot x^2 + (m_1 - m_2)gx$. What is $m_1$'s acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: distinct([{ value: ((m1 - m2) * G) / (m1 + m2), feedback: t`The pulley's inertia acts as an extra mass $I/r^2$ in the kinetic energy.` }, { value: ((m1 - m2) * G) / (m1 + m2 + I), feedback: t`The pulley's term is $\tfrac12I\omega^2 = \tfrac12(I/r^2)\dot x^2$: divide $I$ by $r^2$.` }], a),
          hints: [t`$\partial L/\partial\dot x = (m_1 + m_2 + I/r^2)\dot x$ and $\partial L/\partial x = (m_1 - m_2)g$.`, t`$\ddot x = \dfrac{(m_1 - m_2)g}{m_1 + m_2 + I/r^2}$.`],
          teach: t`One coordinate, one equation: Lagrange's method handles the whole machine without a single tension.`,
          explain: t`$I/r^2 = ${sci(I / (rr * rr), 3)}$ kg, so $\ddot x = \dfrac{${m1 - m2}\times9.8}{${m1 + m2} + ${sci(I / (rr * rr), 3)}} = ${sci(a, 3)}$ m/s². Newton's way needs three equations and two tensions to get here.`,
          visual: { type: 'mech-fbd', params: { scene: 'atwood', show: 'picture', quiet: true, m1, m2 }, caption: t`The Atwood machine (pulley drawn without its mass).` },
        };
      },
    }),
    num({
      id: 'critical-spin', difficulty: 2,
      gen(r) {
        const R = r.pick([0.1, 0.15, 0.25, 0.4]);
        return {
          prompt: t`A bead sits at the bottom of a hoop of radius ${R} m. Above what spin rate $\omega$ does the bottom become unstable, so that the bead climbs off it?`,
          answer: Math.sqrt(G / R), units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: G / R, feedback: t`That is $\omega^2$; take the square root.` }, { value: Math.sqrt(R / G), feedback: t`Upside down: near the bottom $\ddot\theta \approx (\omega^2 - g/R)\theta$.` }],
          hints: [t`Linearize about $\theta = 0$: $\ddot\theta \approx (\omega^2 - g/R)\,\theta$.`, t`Unstable once the coefficient is positive: $\omega^2 > g/R$.`],
          teach: t`The bottom of the spinning hoop loses its stability when the spin beats the hoop's pendulum frequency $\sqrt{g/R}$.`,
          explain: t`$\omega_0 = \sqrt{g/R} = \sqrt{9.8/${R}} = ${sci(Math.sqrt(G / R), 3)}$ rad/s — the angular frequency of small swings on the hoop when it is not spinning.`,
          visual: hoopPic({ th: 0, angle: false, caption: t`The bead at the bottom of the spinning hoop.` }),
        };
      },
    }),
    num({
      id: 'off-axis', difficulty: 2,
      gen(r) {
        const R = r.pick([0.1, 0.2, 0.3]), f = r.pick([1.3, 1.6, 2.2]);
        const w = Math.round(f * Math.sqrt(G / R) * 10) / 10, th = Math.acos(G / (R * w * w)) / DEG;
        return {
          prompt: t`A hoop of radius ${R} m spins at ${w} rad/s about its vertical diameter. At what angle from the bottom does a bead rest on it (relative to the hoop)?`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: Math.acos((R * w * w) / G) / DEG || 0, feedback: t`Upside down: $\cos\theta_0 = g/(R\omega^2)$.` }, { value: Math.asin(G / (R * w * w)) / DEG, feedback: t`The condition is on the **cosine**: $\omega^2\cos\theta_0 = g/R$.` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - th) > 0.5),
          hints: [t`Set $\ddot\theta = (\omega^2\cos\theta - g/R)\sin\theta = 0$ with $\sin\theta \ne 0$.`, t`$\cos\theta_0 = g/(R\omega^2) = 9.8/(${R}\times${w}^2)$.`],
          teach: t`Past the critical spin the bead rests off-axis at $\cos\theta_0 = g/(R\omega^2)$, where gravity and the spinning balance.`,
          explain: t`$\cos\theta_0 = ${sci(G / (R * w * w), 3)}$, so $\theta_0 = ${sci(th, 3)}^\circ$ (on either side). Faster spin pushes it toward $90^\circ$, never past.`,
          visual: hoopPic({ bead: false, caption: t`The spinning hoop. Not to scale.` }),
        };
      },
    }),
    expr({
      id: 'shaken-pendulum', difficulty: 3,
      prompt: t`A pendulum of length $\ell$ hangs from a support that moves horizontally with acceleration $a$ (the support's position $x_s(t)$ has $\ddot x_s = a$). Its Lagrangian is $L = \tfrac12m\big(\dot x_s^2 + 2\ell\dot x_s\dot\theta\cos\theta + \ell^2\dot\theta^2\big) + mg\ell\cos\theta$. Find $\ddot\theta$. Type $\ell$ as l.`,
      answer: '-(g*sin(theta) + a*cos(theta))/l', answerTeX: t`-\frac{g\sin\theta + a\cos\theta}{\ell}`,
      lhs: '\\ddot\\theta', vars: { g: [9, 10], a: [-3, 3], theta: [-1.2, 1.2], l: [0.5, 2] },
      errors: [{ answer: '-g*sin(theta)/l', feedback: t`The support's acceleration enters through $\frac{d}{dt}(m\ell\dot x_s\cos\theta)$, which contains $\ddot x_s = a$.` }, { answer: '-(g*sin(theta) - a*cos(theta))/l', feedback: t`Sign: $\frac{d}{dt}\partial L/\partial\dot\theta$ contains $+m\ell a\cos\theta$, which moves to the right side with a minus.` }],
      hints: [t`$\partial L/\partial\dot\theta = m\ell\dot x_s\cos\theta + m\ell^2\dot\theta$. Its time derivative is $m\ell a\cos\theta - m\ell\dot x_s\dot\theta\sin\theta + m\ell^2\ddot\theta$.`, t`$\partial L/\partial\theta = -m\ell\dot x_s\dot\theta\sin\theta - mg\ell\sin\theta$. The $\dot x_s\dot\theta\sin\theta$ terms cancel.`],
      teach: t`An accelerated support acts on the pendulum like an extra, horizontal gravity $-a$.`,
      explain: t`$m\ell^2\ddot\theta + m\ell a\cos\theta = -mg\ell\sin\theta$, so $\ddot\theta = -(g\sin\theta + a\cos\theta)/\ell$. The pendulum feels gravity $g$ down and an effective $a$ backward: it hangs at rest where $\tan\theta = -a/g$ — Einstein's equivalence of acceleration and gravity in miniature.`,
      visual: cartPendPic({ th: -0.35, xs: 0.3, caption: t`A pendulum hanging from an accelerating support (accelerating to the right; the bob lags behind). Not to scale.` }),
    }),
    mcq({
      id: 'gen-force', difficulty: 2,
      prompt: t`For the hoop, $\partial L/\partial\dot\theta = mR^2\dot\theta$ and $\partial L/\partial\theta = mR^2\omega^2\sin\theta\cos\theta - mgR\sin\theta$. What kind of quantities are these, physically?`,
      visual: hoopPic({ th: 0.7, caption: t`The bead on the spinning hoop. Its coordinate is an angle.` }),
      choices: [
        t`An angular momentum (about the hoop's centre, in the hoop's plane) and a torque: for an angle coordinate, Lagrange's equation reads $\dot L_\theta = \Gamma_\theta$`,
        t`A linear momentum and a force, since every generalized momentum is $m\times$ velocity`,
        t`An energy and a power`,
        t`They have no physical meaning; only the final equation does`,
      ],
      answer: 0,
      why: {
        1: t`A generalized momentum has whatever units its coordinate demands: for an angle, kg·m²/s — angular momentum. Assuming every $p$ is $mv$ is a classic slip (think of $p_\phi = mr^2\dot\phi$).`,
        2: t`$mR^2\dot\theta$ has units kg·m²/s, not J; and the torque is in N·m, not W.`,
        3: t`They do: Lagrange's equation is "rate of change of generalized momentum = generalized force", and both have direct readings.`,
      },
      hints: [t`Work out the units of $mR^2\dot\theta$.`, t`When the coordinate is an angle, the "force" that changes its momentum is a torque.`],
      teach: t`$p_q = \partial L/\partial\dot q$ and $Q = \partial L/\partial q$ take their meaning from the coordinate: for an angle they are an angular momentum and a torque.`,
      explain: t`$p_\theta = mR^2\dot\theta$ is the bead's angular momentum about the centre for motion round the hoop; $\partial L/\partial\theta$ is the torque from gravity plus the spin's effective (centrifugal) torque. [M4.4](#/lesson/phys3550.M4.4) uses exactly this: when $\partial L/\partial q = 0$, $p_q$ is conserved.`,
    }),
    num({
      id: 'bottom-frequency', difficulty: 3,
      gen(r) {
        const R = r.pick([0.2, 0.25]), w = r.pick([2, 3, 4, 5]);
        const Om = Math.sqrt(G / R - w * w);
        return {
          prompt: t`A hoop of radius ${R} m spins at ${w} rad/s — below the critical rate. What is the angular frequency of small oscillations of a bead about the bottom?`,
          answer: Om, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(G / R), feedback: t`That ignores the spin. Near the bottom $\ddot\theta \approx -(g/R - \omega^2)\theta$: spinning softens the restoring force.` }, { value: Math.sqrt(G / R + w * w), feedback: t`Sign: the spin flings the bead outward, **weakening** the restoring force: $\Omega^2 = g/R - \omega^2$.` }], Om),
          hints: [t`Linearize $\ddot\theta = (\omega^2\cos\theta - g/R)\sin\theta$ for small $\theta$.`, t`$\ddot\theta \approx -(g/R - \omega^2)\theta$, so $\Omega = \sqrt{g/R - \omega^2}$.`],
          teach: t`Below the critical spin the bead oscillates about the bottom at $\Omega = \sqrt{g/R - \omega^2}$, which falls to zero at the bifurcation.`,
          explain: t`$\Omega = \sqrt{${sci(G / R, 3)} - ${w * w}} = ${sci(Om, 3)}$ rad/s. As $\omega \to \sqrt{g/R}$ the oscillation slows to a stop — "critical slowing down", the signature of a bifurcation.`,
          visual: ueff(w, { equilibria: false }, t`The effective potential at this spin (energies in mJ, for 0.1 kg and 0.2 m).`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-governor', difficulty: 3, transfer: true,
      gen(r) {
        const l = r.pick([0.15, 0.2, 0.3]), rpm = r.pick([120, 150, 200]);
        const w = (rpm * 2 * Math.PI) / 60, c = G / (l * w * w), th = Math.acos(c) / DEG;
        return {
          prompt: t`A centrifugal governor — the flyball speed regulator once used on steam engines, and a cousin of the bob-weights in some turbopump overspeed trips — has two balls on light arms ${l} m long, hinged at the top of a spindle turning at ${rpm} rpm. Each ball is a bead on a spinning circle of radius $\ell$. At what angle from the spindle do the arms ride?`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: Math.acos(G / (l * rpm * rpm)) / DEG || 0, feedback: t`Convert rpm to rad/s first: $\omega = 2\pi\times\text{rpm}/60$.` }, { value: 90 - th, feedback: t`That is the angle from the horizontal. The arms hang from the hinge: measure from the spindle (straight down).` }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - th) > 0.5),
          hints: [t`$\omega = 2\pi\times${rpm}/60 = ${sci(w, 3)}$ rad/s. Check that $\omega > \sqrt{g/\ell}$.`, t`$\cos\theta_0 = g/(\ell\omega^2)$.`],
          teach: t`A flyball governor is the bead on a spinning hoop: its arm angle $\cos\theta_0 = g/(\ell\omega^2)$ measures the speed.`,
          explain: t`$\omega = ${sci(w, 3)}$ rad/s, $\cos\theta_0 = 9.8/(${l}\times${sci(w * w, 3)}) = ${sci(c, 3)}$, so $\theta_0 = ${sci(th, 3)}^\circ$. Spin faster and the balls fly out further, lifting a collar that throttles the steam — the first widespread feedback controller, analysed by Maxwell in 1868.`,
          visual: gpic({ x: [-1.5, 1.5], y: [-1.4, 0.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([0, 0.35], [0, -1.35], 'ink2', 3), seg([0, 0], [0.7, -0.71], 'ink2', 1.8), seg([0, 0], [-0.7, -0.71], 'ink2', 1.8), { param: ['0.4*cos(t)', '0.3 + 0.07*sin(t)'], t: [3.6, 8.9], color: 'accent', width: 1.6 }], points: [{ x: 0.7, y: -0.71, color: 'warn', r: 9 }, { x: -0.7, y: -0.71, color: 'warn', r: 9 }, { x: 0, y: 0, color: 'ink', r: 3, label: 'hinge', labelDx: 8, labelDy: -8 }, lab(0.5, 0.37, 'ω', 'accent')] }, t`A flyball governor: two balls on hinged arms round a turning spindle. Not to scale.`, 'A centrifugal governor with two flyballs'),
        };
      },
    }),
    num({
      id: 'cp-accelerometer', difficulty: 2, transfer: true,
      gen(r) {
        const a = r.pick([2.5, 3.2, 4.0, 5.5]);
        const th = Math.atan(a / G) / DEG;
        return {
          prompt: t`A plumb bob hangs in an airliner accelerating down the runway at ${a} m/s². Using $\ddot\theta = -(g\sin\theta + a\cos\theta)/\ell$, at what angle from the vertical does it hang steady (backward, toward the tail)?`,
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.2 },
          errors: [{ value: Math.asin(a / G) / DEG, feedback: t`Setting $\ddot\theta = 0$ gives $\tan\theta = -a/g$, a tangent, not a sine.` }, { value: Math.atan(G / a) / DEG, feedback: t`Upside down: $\tan\theta = a/g$, small when $a$ is small.` }],
          hints: [t`Steady means $\ddot\theta = 0$: $g\sin\theta + a\cos\theta = 0$.`, t`$\tan\theta = -a/g$ (the minus: it swings backward).`],
          teach: t`An accelerating support tilts a pendulum to $\tan\theta = a/g$: the bob hangs along the effective gravity.`,
          explain: t`$|\theta| = \arctan(${a}/9.8) = ${sci(th, 3)}^\circ$, toward the tail. The bob cannot tell this from gravity tilted by that angle — the equivalence principle, which [general relativity](#/lesson/gr.S05.i) takes seriously.`,
          visual: cartPendPic({ th: -(th * DEG), xs: 0, caption: t`The bob hanging back as its support accelerates to the right. The angle is drawn to scale.` }),
        };
      },
    }),
    mcq({
      id: 'cp-bottom-unstable', difficulty: 3,
      prompt: t`The hoop spins at $\omega = 10$ rad/s with $\sqrt{g/R} = 7$ rad/s. A bead is placed exactly at the bottom, at rest relative to the hoop. What happens?`,
      visual: ueff(10, {}, t`The effective potential at $\omega = 10$ rad/s (energies in mJ), with its equilibria marked.`),
      choices: [
        t`It can stay only in principle: the bottom is now a hill of $U_{\text{eff}}$, so the slightest nudge sends it sliding to one of the wells at $\pm61^\circ$, around which it then oscillates`,
        t`It stays at the bottom: gravity pulls it there and nothing pushes it sideways`,
        t`It flies outward to $\theta = 90^\circ$, since the spin flings it as far as possible`,
        t`It oscillates about the bottom with a faster frequency than without spin`,
      ],
      answer: 0,
      why: {
        1: t`The bottom is still an equilibrium ($\sin 0 = 0$), but an unstable one: near it $\ddot\theta \approx (\omega^2 - g/R)\theta$ grows exponentially.`,
        2: t`At $90^\circ$ gravity's torque is greatest and nothing balances it; the bead settles where $\cos\theta_0 = g/(R\omega^2)$.`,
        3: t`Spin softens, then destroys, the restoring force about the bottom: below $\sqrt{g/R}$ the frequency is $\sqrt{g/R - \omega^2}$, lower than without spin, and above it there is none.`,
      },
      hints: [t`Is the bottom a valley or a hill of $U_{\text{eff}}$ at this spin?`, t`Near $\theta = 0$: $\ddot\theta \approx (\omega^2 - g/R)\theta = 51\,\theta$.`],
      teach: t`Past the bifurcation the symmetric state survives but becomes unstable; the system falls into one of two mirror-image states.`,
      explain: t`With $\omega^2 - g/R = 51$ s⁻², a nudge grows like $e^{7.1t}$. The bead slides to one well — which one depends on the nudge — and rocks about $\pm61^\circ$. The symmetric bottom is a pitchfork's middle tine: still there, no longer stable.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §7.5–7.6 and Example 7.7: the bead on a spinning hoop', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'J. C. Maxwell, On governors, Proc. R. Soc. Lond. 16, 270 (1868)', url: 'https://doi.org/10.1098/rspl.1867.0055' },
  ],
});
