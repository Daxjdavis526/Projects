// The Hamiltonian and Hamilton's equations (Taylor §13.1–13.4; Goldstein
// §8.1): trade the velocities q̇ for the momenta p = ∂L/∂q̇ by a Legendre
// transform, H(q, p, t) = Σ pq̇ − L, and Lagrange's n second-order equations
// become Hamilton's 2n first-order ones, q̇ = ∂H/∂p, ṗ = −∂H/∂q, with
// dH/dt = ∂H/∂t. H is the energy function h of M4.5 written in (q, p): equal
// to T + U for fixed constraints and time-independent U, but not for a driven
// hoop. Worked: a central force in polar coordinates — H = p_r²/2m +
// p_φ²/2mr² + U(r), φ cyclic so p_φ is constant, and the radial equation with
// numbers for a satellite at 7000 km, 8.0 km/s (r̈ = +1.01 m/s²: perigee).
// Explore: de-plane, the pendulum's (θ, p) flow with H's level curves.
// Practice: Legendre transform, ṗ for a quartic, H vs E, a charge's
// canonical momentum, the signs, dH/dt for a stiffening spring. Transfer:
// a satellite's radial acceleration from Hamilton's equations.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, gpic, distinct } from './_cm.js';
import { GM_E } from './_cm3.js';
import { hoopPic } from './_cm2.js';
import { planePic } from './_cm4.js';

const t = String.raw;

const EX = (() => {
  const r = 7.0e6, v = 8.0e3, h = r * v, eps = (v * v) / 2 - GM_E / r;
  const cent = (h * h) / r ** 3, grav = GM_E / r ** 2;
  return { r, v, h, eps, cent, grav, rdd: cent - grav };
})();

// the pendulum's phase plane: q = θ (rad), p in units of mℓ²√(g/ℓ)
const pend = (extra = {}) => ({ fx: 'y', fy: '-sin(x)', x: [-7, 7], y: [-3, 3], xlabel: 'q = θ (rad)', ylabel: 'p', levels: { fn: 'y^2/2 - cos(x)', values: [-0.8, -0.4, 0, 0.5, 1, 1.6, 2.5], highlight: [1] }, ...extra });

export default lesson({
  id: 'phys3550.M9.1',
  title: 'The Hamiltonian and Hamilton’s equations',
  minutes: 18, difficulty: 3,
  intro: t`Lagrange's equations are $n$ second-order equations in the coordinates $q_i$. Hamilton rewrote them as $2n$ **first-order** equations by promoting the momenta $p_i = \partial L/\partial\dot q_i$ to equal partners of the coordinates. The tool is a **Legendre transform**: swap each $\dot q_i$ for its $p_i$ and build $H = \sum p_i\dot q_i - L$, written entirely in $q$, $p$ and $t$. Then the motion is a flow: at every point $(q, p)$ the equations say which way the state moves next. $H$ is [M4.5](#/lesson/phys3550.M4.5)'s energy function in new clothes — usually the total energy — and it is conserved whenever it has no explicit $t$. Quantum mechanics, statistical mechanics and the canonical formulation of general relativity all start from $H$, not $L$.`,
  equation: t`H(q, p, t) = \sum_i p_i\dot q_i - L,\qquad \dot q_i = \frac{\partial H}{\partial p_i},\qquad \dot p_i = -\frac{\partial H}{\partial q_i},\qquad \frac{dH}{dt} = \frac{\partial H}{\partial t}`,
  symbols: [
    { tex: 'H', text: 'the Hamiltonian, J — a function of the coordinates, the momenta and possibly time, never of the velocities' },
    { tex: 'q_i', text: 'the generalized coordinates (m, rad, …)' },
    { tex: 'p_i = \\partial L/\\partial\\dot q_i', text: 'the **canonical** (generalized) momenta: $mv$ for a free particle, $mr^2\\dot\\phi$ for an angle, $mv + qA$ for a charge in a magnetic field' },
    { tex: 'L', text: 'the Lagrangian $T - U$, J' },
    { tex: '\\partial H/\\partial t', text: 'any explicit time dependence of $H$ (a driven or moving system); when it is zero, $H$ is conserved' },
  ],
  why: t`Hamilton's equations are what numerical orbit propagators integrate (symplectic integrators are built on them), what quantum mechanics quantizes ($H \to$ the Hamiltonian operator), and the language of phase space and Liouville's theorem ([M9.2](#/lesson/phys3550.M9.2)) on which statistical mechanics rests.`,
  visual: {
    type: 'de-plane',
    title: 'Hamilton’s equations as a flow',
    lead: t`A pendulum, $H = \frac{p^2}{2m\ell^2} - mg\ell\cos q$, in units where $m\ell^2 = 1$ and $g/\ell = 1$. Arrows: the direction of $(\dot q, \dot p) = (\partial H/\partial p, -\partial H/\partial q)$ at each point. Grey curves: constant $H$; gold: the separatrix, $H = mg\ell$. Drag the start point and press Play.`,
    tasks: [
      t`Above the axis ($p > 0$) every arrow points right: $\dot q = \partial H/\partial p = p > 0$. Below it they point left.`,
      t`The arrows run **along** the curves of constant $H$, never across: $\dot H = \frac{\partial H}{\partial q}\dot q + \frac{\partial H}{\partial p}\dot p = 0$.`,
      t`Start inside the gold eye: the pendulum swings back and forth. Start outside: it goes over the top and $q$ keeps growing.`,
    ],
    params: pend({ equal: false, aspect: 'wide', field: true, grid: 21, start: [1.2, 0], play: true, series: true, tmax: 20, pendulum: true, seriesNames: ['q', 'p'], heads: true, click: true }),
    caption: t`An ideal pendulum (no friction), $m\ell^2 = 1$ and $g/\ell = 1$, so $p$ is in units of $m\ell^2\sqrt{g/\ell}$. Trajectories integrated numerically (RK4). Arrows show direction only.`,
  },
  example: {
    prompt: t`Write the Hamiltonian of a particle of mass $m$ moving in a central potential $U(r)$, using polar coordinates $(r, \phi)$, and Hamilton's four equations. Then apply them to a satellite $${sci(EX.r / 1e3, 4)}$ km from Earth's centre moving at ${EX.v / 1e3} km/s at right angles to the radius: is $r$ about to grow or shrink? ($GM = 3.986\times10^{14}$ m³/s².)`,
    visual: gpic({ x: [-1.7, 1.7], y: [-1.2, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 0.83 - x^2))', lower: '-sqrt(max(0, 0.83 - x^2))', from: -0.911, to: 0.911, color: 'accent', alpha: 0.5 }], curves: [{ polar: '1.1/(1 + 0.12*cos(theta))', theta: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }], points: [{ x: 0.982, y: 0, color: 'warn', r: 6, label: 'r', labelDx: 8, labelDy: 12 }], arrows: [{ from: [0.982, 0], to: [0.982, 0.75], color: 'warn', label: 'v', labelDx: 8 }] }, t`The satellite, its velocity at right angles to the radius. Earth to scale; the dashed orbit is a sketch, not the answer.`, 'A satellite beside Earth with its velocity perpendicular to the radius'),
    steps: [
      { label: 'Lagrangian', text: t`$L = \tfrac12m(\dot r^2 + r^2\dot\phi^2) - U(r)$.` },
      { label: 'Momenta', text: t`$p_r = \partial L/\partial\dot r = m\dot r$ and $p_\phi = \partial L/\partial\dot\phi = mr^2\dot\phi$, the angular momentum. Invert: $\dot r = p_r/m$, $\dot\phi = p_\phi/mr^2$.` },
      { label: 'Legendre', text: t`$H = p_r\dot r + p_\phi\dot\phi - L$, and with the velocities replaced by momenta: $$H = \frac{p_r^2}{2m} + \frac{p_\phi^2}{2mr^2} + U(r).$$ It is $T + U$, written in $r$, $p_r$ and $p_\phi$.` },
      { label: 'Hamilton', text: t`$\dot r = \frac{\partial H}{\partial p_r} = \frac{p_r}{m}$, $\dot\phi = \frac{\partial H}{\partial p_\phi} = \frac{p_\phi}{mr^2}$, $\dot p_r = -\frac{\partial H}{\partial r} = \frac{p_\phi^2}{mr^3} - U'(r)$, $\dot p_\phi = -\frac{\partial H}{\partial\phi} = 0$.` },
      { label: 'Cyclic', text: t`$H$ does not contain $\phi$, so $p_\phi$ is constant ([M4.4](#/lesson/phys3550.M4.4)) and $r$, $p_r$ alone obey a one-dimensional Hamiltonian $\frac{p_r^2}{2m} + U_{\text{eff}}(r)$ — the effective potential of [M5.2](#/lesson/phys3550.M5.2), now in two lines.` },
      { label: 'Numbers', text: t`Per unit mass, $p_\phi/m = rv = ${sci(EX.h, 3)}$ m²/s, and $\dot p_r/m = \frac{(p_\phi/m)^2}{r^3} - \frac{GM}{r^2} = ${sci(EX.cent, 4)} - ${sci(EX.grav, 4)} = +${sci(EX.rdd, 3)}$ m/s². With $\dot r = 0$ and $\ddot r > 0$, $r$ is at a minimum: the satellite is at **perigee** and about to climb.` },
    ],
    answer: t`$H = \frac{p_r^2}{2m} + \frac{p_\phi^2}{2mr^2} + U(r)$; $\dot r = p_r/m$, $\dot\phi = p_\phi/mr^2$, $\dot p_r = p_\phi^2/mr^3 - U'$, $\dot p_\phi = 0$. For the satellite $\ddot r = +${sci(EX.rdd, 3)}$ m/s²: it is at perigee.`,
  },
  practice: [
    expr({
      id: 'legendre-sho', difficulty: 1,
      prompt: t`For a mass on a spring, $L = \tfrac12m\dot x^2 - \tfrac12kx^2$. Find $p$, then write $H$ as a function of $x$ and $p$.`,
      answer: 'p^2/(2m) + k*x^2/2', answerTeX: t`\frac{p^2}{2m} + \tfrac12kx^2`, lhs: 'H', vars: { p: [-2, 2], m: [0.5, 3], k: [1, 10], x: [-1, 1] },
      errors: [{ answer: 'p^2/(2m) - k*x^2/2', feedback: t`$H = p\dot x - L$: subtracting $L$ flips the sign of $-U$, so $U$ enters with a plus.` }, { answer: 'p^2/m + k*x^2/2', feedback: t`$p\dot x = p^2/m$, but subtracting $\tfrac12m\dot x^2 = p^2/2m$ leaves $p^2/2m$.` }, { answer: 'm*p^2/2 + k*x^2/2', feedback: t`$\dot x = p/m$, so the kinetic part is $p^2/2m$.` }],
      hints: [t`$p = \partial L/\partial\dot x = m\dot x$, so $\dot x = p/m$.`, t`$H = p\dot x - L = p\cdot\frac{p}{m} - \frac12m\left(\frac{p}{m}\right)^2 + \frac12kx^2$.`],
      teach: t`The Legendre transform $H = p\dot q - L$, written in $p$, turns $T - U$ into $T + U$ for ordinary systems.`,
      explain: t`$H = \frac{p^2}{m} - \frac{p^2}{2m} + \frac12kx^2 = \frac{p^2}{2m} + \frac12kx^2$: the energy. Hamilton's equations give $\dot x = p/m$ and $\dot p = -kx$ — Newton's law split into two first-order steps.`,
      visual: planePic({ fx: 'y', fy: '-x', x: [-2.2, 2.2], y: [-2, 2], xlabel: 'x', ylabel: 'p', levels: { fn: 'x^2/2 + y^2/2', values: [0.2, 0.8, 1.8] }, grid: 15, equal: true, aspect: '' }, t`The oscillator's phase plane (units with $m = k = 1$): the arrows show which way each state moves, and the grey curves are the paths it follows.`),
    }),
    expr({
      id: 'quartic', difficulty: 2,
      prompt: t`An anharmonic oscillator has $H = \frac{p^2}{2m} + \tfrac12kq^2 + \beta q^4$. Write Hamilton's equation for $\dot p$. Type $\beta$ as \`beta\`.`,
      answer: '-k*q - 4*beta*q^3', answerTeX: t`-kq - 4\beta q^3`, lhs: '\\dot p', vars: { k: [1, 5], q: [-1.5, 1.5], beta: [0.1, 1], m: [0.5, 2], p: [-1, 1] },
      errors: [{ answer: 'k*q + 4*beta*q^3', feedback: t`$\dot p = -\partial H/\partial q$: the minus sign makes it a restoring force.` }, { answer: 'p/m', feedback: t`That is $\dot q = \partial H/\partial p$.` }],
      hints: [t`$\dot p = -\partial H/\partial q$. Differentiate the potential terms.`],
      teach: t`$\dot p = -\partial H/\partial q$ is Newton's second law: the force is minus the slope of the potential.`,
      explain: t`$\dot p = -(kq + 4\beta q^3)$. For $\beta > 0$ the spring stiffens at large $q$; the period then depends on amplitude, unlike the linear oscillator's.`,
      visual: gpic({ x: [-1.8, 1.8], y: [-0.2, 3], xlabel: 'q', ylabel: 'U', curves: [{ fn: 'x^2/2 + 0.3*x^4', color: 'accent', width: 2.2, label: 'with q⁴', labelAt: 1.45, labelDx: -70 }, { fn: 'x^2/2', color: 'ink3', width: 1.4, dash: true, label: 'harmonic', labelAt: 1.6, labelDy: 14 }] }, t`The potential $\tfrac12kq^2 + \beta q^4$ (blue) against the harmonic one (dashed), for $k = 1$, $\beta = 0.3$.`, 'A potential steeper than a parabola'),
    }),
    mcq({
      id: 'h-vs-e', difficulty: 3,
      prompt: t`A bead slides on a hoop forced to spin at constant $\omega$ about its vertical diameter ([M4.5](#/lesson/phys3550.M4.5)): $L = \tfrac12mR^2(\dot\theta^2 + \omega^2\sin^2\theta) + mgR\cos\theta$. What is true of its Hamiltonian?`,
      visual: hoopPic({ th: 0.9, caption: t`The bead on the spinning hoop (not to scale).` }),
      choices: [t`$H = \frac{p_\theta^2}{2mR^2} - \tfrac12mR^2\omega^2\sin^2\theta - mgR\cos\theta$ is conserved, but it is not the bead's energy $T + U$`, t`$H = T + U$ is conserved, because $H$ is always the energy`, t`$H$ is not conserved, because the motor does work`, t`$H$ does not exist, because the constraint moves`],
      answer: 0,
      why: { 1: t`$H = T + U$ needs fixed constraints. Here the spin term in $T$ is independent of $\dot\theta$, so it ends up in $H$ with a minus sign.`, 2: t`$H$ has no explicit $t$, so $dH/dt = \partial H/\partial t = 0$. What the motor's work changes is $T + U$, not $H$.`, 3: t`A Legendre transform needs only $p_\theta = \partial L/\partial\dot\theta$ to be invertible, which it is.` },
      hints: [t`Find $p_\theta = mR^2\dot\theta$ and compute $H = p_\theta\dot\theta - L$. Which terms of $L$ change sign?`, t`Then ask whether $H$ depends explicitly on $t$.`],
      teach: t`$H$ is conserved when it has no explicit $t$, but equals $T + U$ only when the constraints are fixed.`,
      explain: t`$H = p_\theta\dot\theta - L$ reverses the sign of every term in $L$ that is not quadratic in $\dot\theta$, including the spin energy. $H$ is M4.5's energy function $h$: conserved, while $E = H + mR^2\omega^2\sin^2\theta$ changes as the motor works.`,
    }),
    expr({
      id: 'charge', difficulty: 3,
      prompt: t`A charge $q$ moving along $x$ in a vector potential $A(x)$ has $L = \tfrac12m\dot x^2 + qA\dot x$ (one dimension, no electric field). Its canonical momentum is $p = m\dot x + qA$. Write $H$ in terms of $p$ and $x$. Type $A(x)$ as \`A\`.`,
      answer: '(p - q*A)^2/(2m)', answerTeX: t`\frac{(p - qA)^2}{2m}`, lhs: 'H', vars: { p: [-2, 2], q: [0.5, 2], A: [-1, 1], m: [0.5, 2] },
      errors: [{ answer: 'p^2/(2m)', feedback: t`$p$ here is $m\dot x + qA$, not $m\dot x$: the kinetic energy is $(p - qA)^2/2m$.` }, { answer: '(p + q*A)^2/(2m)', feedback: t`$m\dot x = p - qA$: subtract.` }, { answer: 'p^2/(2m) - q*A*p/m', feedback: t`Complete the square: $p\dot x - L = \frac{(p - qA)^2}{2m}$.` }],
      hints: [t`$\dot x = (p - qA)/m$.`, t`$H = p\dot x - \tfrac12m\dot x^2 - qA\dot x = (p - qA)\dot x - \tfrac12m\dot x^2$; substitute.`],
      teach: t`For a charge in a magnetic field the canonical momentum is $m\vec v + q\vec A$, and $H = (\vec p - q\vec A)^2/2m$.`,
      explain: t`$H = \frac{(p - qA)^2}{2m} = \tfrac12m\dot x^2$: the magnetic field does no work, so it adds nothing to the energy, yet it changes which momentum is canonical. This "minimal coupling" $\vec p \to \vec p - q\vec A$ is exactly how electromagnetism enters quantum mechanics.`,
      visual: gpic({ x: [-1, 3], y: [-1.2, 1.2], xlabel: 'x', ylabel: 'A(x)', curves: [{ fn: '0.6*sin(1.5*x)', color: 'violet', width: 2, label: 'A(x)', labelAt: 0.9, labelDy: -6 }], points: [{ x: 1.8, y: 0, color: 'warn', r: 6, label: 'charge', labelDx: 8, labelDy: 14 }], arrows: [{ from: [1.8, 0], to: [2.4, 0], color: 'warn', label: 'v', labelDx: 4, labelDy: -8 }] }, t`A charge moving along $x$ through a region with a vector potential $A(x)$ (illustrative profile).`, 'A charge moving along a line beneath a wavy curve'),
    }),
    mcq({
      id: 'signs', difficulty: 1,
      prompt: t`Which pair is Hamilton's equations?`,
      visual: planePic(pend({ field: true, grid: 17, x: [-4, 4], y: [-2.5, 2.5] }), t`The pendulum's flow in the $(q, p)$ plane: arrows give the direction of $(\dot q, \dot p)$.`),
      choices: [t`$\dot q = \partial H/\partial p$ and $\dot p = -\partial H/\partial q$`, t`$\dot q = -\partial H/\partial p$ and $\dot p = \partial H/\partial q$`, t`$\dot q = \partial H/\partial q$ and $\dot p = \partial H/\partial p$`, t`$\dot q = \partial H/\partial p$ and $\dot p = +\partial H/\partial q$`],
      answer: 0,
      why: { 1: t`Then $\dot q = -p/m$ for a free particle: it would move backwards.`, 2: t`$\partial H/\partial q$ is minus the force; $\partial H/\partial p$ is the velocity. Each rate pairs with the derivative by the **other** variable.`, 3: t`Then $\dot p = +kq$ for a spring: the force would push away from equilibrium.` },
      hints: [t`Test on $H = p^2/2m + \tfrac12kq^2$: you need $\dot q = p/m$ and $\dot p = -kq$.`],
      teach: t`$\dot q = \partial H/\partial p$ (velocity), $\dot p = -\partial H/\partial q$ (force).`,
      explain: t`On the spring: $\dot q = p/m$ and $\dot p = -kq$. The minus sign sits on $\dot p$, and the cross-pairing is what makes the flow run along curves of constant $H$.`,
    }),
    num({
      id: 'stiffening', difficulty: 2,
      gen(r) {
        const kdot = r.pick([0.5, 1, 2]), q = r.pick([0.1, 0.2, 0.3]);
        const ans = 0.5 * kdot * q * q;
        return {
          prompt: t`A mass oscillates on a spring whose stiffness is slowly being increased: $H = \frac{p^2}{2m} + \tfrac12k(t)q^2$ with $\dot k = ${kdot}$ N/(m·s). At an instant when $q = ${q}$ m, how fast is $H$ changing?`,
          answer: ans, units: 'W', tol: { rel: 0.005 },
          errors: distinct([{ value: 0, feedback: t`$H$ depends on $t$ through $k(t)$, so $dH/dt = \partial H/\partial t \ne 0$.` }, { value: kdot * q * q, feedback: t`$\partial H/\partial t = \tfrac12\dot kq^2$: keep the $\tfrac12$.` }, { value: 0.5 * kdot * q, feedback: t`$q$ enters squared.` }], ans),
          hints: [t`$\frac{dH}{dt} = \frac{\partial H}{\partial t}$ along the motion.`, t`$\partial H/\partial t = \tfrac12\dot kq^2$.`],
          teach: t`Along the motion $dH/dt = \partial H/\partial t$: only explicit time dependence changes $H$.`,
          explain: t`$\frac{dH}{dt} = \tfrac12\dot kq^2 = \tfrac12(${kdot})(${q})^2 = ${sci(ans, 3)}$ W: the agent stiffening the spring does work on it. Averaged over a cycle, a slow change makes $H/\omega$ (an adiabatic invariant) stay nearly constant.`,
          visual: planePic({ fx: 'y', fy: '-x', x: [-2.2, 2.2], y: [-2, 2], xlabel: 'q', ylabel: 'p', levels: { fn: 'x^2/2 + y^2/2', values: [0.5, 1.2] }, grid: 15, start: [1, 0] }, t`An oscillator's orbit in phase space (units with $m = k = 1$). As $k$ grows the orbit's shape changes and $H$ is no longer constant.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radial', difficulty: 3, transfer: true,
      gen(r) {
        const rr = r.pick([6.8, 7.2, 8.0]) * 1e6, v = r.pick([7.2, 7.6, 8.2]) * 1e3;
        const a = (v * v) / rr - GM_E / rr ** 2;
        return {
          prompt: t`A satellite is $${sci(rr / 1e3, 3)}$ km from Earth's centre, moving at ${v / 1e3} km/s at right angles to the radius. From Hamilton's equations for $H = \frac{p_r^2}{2m} + \frac{p_\phi^2}{2mr^2} - \frac{GMm}{r}$, find $\ddot r = \dot p_r/m$ at this instant (positive outward). ($GM = 3.986\times10^{14}$ m³/s².)`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01, abs: 0.005 },
          errors: distinct([{ value: -GM_E / rr ** 2, feedback: t`That is gravity alone. $-\partial H/\partial r$ also contains $+p_\phi^2/mr^3$, the centrifugal term.` }, { value: (v * v) / rr, feedback: t`That is the centrifugal term alone; add gravity's $-GM/r^2$.` }], a),
          hints: [t`$\dot p_r = -\partial H/\partial r = \frac{p_\phi^2}{mr^3} - \frac{GMm}{r^2}$, with $p_\phi = mrv$.`, t`So $\ddot r = v^2/r - GM/r^2$.`],
          teach: t`Hamilton's radial equation balances the centrifugal term $p_\phi^2/mr^3$ against gravity.`,
          explain: t`$\ddot r = \frac{v^2}{r} - \frac{GM}{r^2} = ${sci((v * v) / rr, 4)} - ${sci(GM_E / rr ** 2, 4)} = ${sci(a, 3)}$ m/s². ${a > 0 ? 'Positive: the satellite is at perigee, about to climb.' : 'Negative: it is at apogee, about to fall inward.'} (Zero would be a circular orbit: $v = \sqrt{GM/r} = ${sci(Math.sqrt(GM_E / rr) / 1e3, 3)}$ km/s.)`,
          visual: gpic({ x: [-1.7, 1.7], y: [-1.2, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: 'sqrt(max(0, 0.75 - x^2))', lower: '-sqrt(max(0, 0.75 - x^2))', from: -0.866, to: 0.866, color: 'accent', alpha: 0.5 }], points: [{ x: 1.05, y: 0, color: 'warn', r: 6 }], arrows: [{ from: [1.05, 0], to: [1.05, 0.75], color: 'warn', label: 'v', labelDx: 8 }] }, t`The satellite with its velocity at right angles to the radius (schematic).`, 'A satellite beside a planet'),
        };
      },
    }),
    num({
      id: 'cp-legendre', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4]), b = r.pick([1, 2]), c = r.pick([5, 8]), q = r.pick([0.5, 1]), qd = r.pick([1, 2, 3]);
        const H = 0.5 * a * qd * qd + c * q * q, p = a * qd + b;
        return {
          prompt: t`A system has $L = \tfrac12a\dot q^2 + b\dot q - cq^2$ with $a = ${a}$, $b = ${b}$, $c = ${c}$ (SI units). At an instant when $q = ${q}$ and $\dot q = ${qd}$, what is the value of $H$?`,
          answer: H, units: 'J', tol: { rel: 0.005 },
          errors: distinct([{ value: 0.5 * a * qd * qd + b * qd - c * q * q, feedback: t`That is $L$ itself. $H = p\dot q - L$ with $p = a\dot q + b$.` }, { value: 0.5 * a * qd * qd + b * qd + c * q * q, feedback: t`The $b\dot q$ term cancels: $p\dot q = a\dot q^2 + b\dot q$, and $L$ subtracts $b\dot q$ back off.` }, { value: (p * p) / (2 * a) + c * q * q, feedback: t`In terms of $p$, $H = (p - b)^2/2a + cq^2$: the shift by $b$ matters.` }], H),
          hints: [t`$p = \partial L/\partial\dot q = a\dot q + b$.`, t`$H = p\dot q - L = \tfrac12a\dot q^2 + cq^2$ — the linear term drops out.`],
          teach: t`Terms linear in $\dot q$ change the canonical momentum but drop out of $H$'s value.`,
          explain: t`$p = ${p}$ and $H = p\dot q - L = \tfrac12(${a})(${qd})^2 + ${c}(${q})^2 = ${sci(H, 3)}$ J. Written properly in $q$ and $p$: $H = (p - b)^2/2a + cq^2$ — like the charge's $(p - qA)^2/2m$.`,
          visual: planePic({ fx: `y/${a}`, fy: `-${2 * c}*x`, x: [-2, 2], y: [-6, 6], xlabel: 'q', ylabel: 'p − b', levels: { fn: `y^2/${2 * a} + ${c}*x^2`, values: [2, 8, 18] }, grid: 15 }, t`Curves of constant $H$ in the $(q,\ p - b)$ plane for these constants: ellipses.`),
        };
      },
    }),
    mcq({
      id: 'cp-conserved', difficulty: 2,
      prompt: t`For $H = \frac{p_r^2}{2m} + \frac{p_\phi^2}{2mr^2} - \frac{k}{r}$ (Kepler's problem), which quantities are constant along every motion?`,
      visual: { type: 'cm3-orbit', params: { force: 'kepler', L: 1, E: -0.3, view: 4.2, r: [0, 4.6], y: [-1, 0.5], sliders: [], play: false, dragE: false, readouts: [] }, caption: t`A Kepler orbit beside its effective potential (units with $GM = m = 1$).` },
      choices: [t`$H$ and $p_\phi$`, t`$H$, $p_\phi$ and $p_r$`, t`Only $H$`, t`$p_r$ and $p_\phi$`],
      answer: 0,
      why: { 1: t`$\dot p_r = p_\phi^2/mr^3 - k/r^2$, zero only on a circular orbit.`, 2: t`$\phi$ is missing from $H$, so $\dot p_\phi = -\partial H/\partial\phi = 0$ too.`, 3: t`$p_r$ changes whenever $r$ does; $H$ is the one with no explicit $t$.` },
      hints: [t`$\dot p_i = -\partial H/\partial q_i$: which coordinate is absent from $H$? And does $H$ contain $t$?`],
      teach: t`A coordinate absent from $H$ has a conserved momentum; a Hamiltonian free of $t$ is itself conserved.`,
      explain: t`$\phi$ is cyclic, so $p_\phi$ (the angular momentum) is constant; $\partial H/\partial t = 0$, so $H$ (the energy) is constant. Kepler's problem has a third, hidden conserved quantity, the Laplace–Runge–Lenz vector, which [M9.3](#/lesson/phys3550.M9.3) meets through Poisson brackets.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §13.1–13.4: Hamilton’s equations in one and several dimensions; ignorable coordinates', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole and J. Safko, Classical Mechanics, 3rd ed. (2002), §8.1: Legendre transformations and Hamilton’s equations', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006389' },
  ],
});
