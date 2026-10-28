// Cyclic coordinates and conserved momenta (Taylor §7.8): if a coordinate is
// missing from L (∂L/∂q = 0), Lagrange's equation says its generalized
// momentum p = ∂L/∂q̇ is constant. Worked: the spherical pendulum, φ cyclic,
// p_φ = mℓ² sin²θ φ̇ (the vertical angular momentum), which turns the θ
// motion into one dimension in U_eff(θ) = mgℓ(1 − cos θ) + p_φ²/(2mℓ² sin²θ)
// — explored in mech-energy — with the conical pendulum at its minimum.
// Traps: a coordinate absent from U but present in T is not cyclic (r for a
// free particle in polar coordinates); a generalized momentum need not be mv
// (p_x = mẋ − qBy in a magnetic field). Transfer: in Schwarzschild, t and φ
// are cyclic, giving the conserved E and L of every black-hole orbit.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct, G } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;

const UEFF = '9.8*(1 - cos(x)) + p^2/(2*sin(x)^2)';    // mgℓ(1 − cos θ) + p_φ²/(2mℓ² sin²θ), m = 1 kg, ℓ = 1 m
const sph = (p, extra = {}, caption) => ({
  type: 'mech-energy',
  params: { U: UEFF, constants: { p }, x: [0.08, 3.06], y: [0, 30], m: 1, lunit: 'rad', xlabel: 'θ (rad)', play: false, dragE: false, dragX: false, bars: false, force: false, readouts: [], particle: false, turning: false, ...extra },
  caption,
});

// a cone (vertex down) seen side-on, half-angle a (rad), with a ball circling at slant distance s
function conePic({ a = 0.6, s = 1, caption }) {
  const x = s * Math.sin(a), y = s * Math.cos(a);
  return gpic({
    x: [-1.6, 1.6], y: [-0.1, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([0, 0], [r6(1.6 * Math.sin(a)), r6(1.6 * Math.cos(a))], 'ink2', 2.4), seg([0, 0], [r6(-1.6 * Math.sin(a)), r6(1.6 * Math.cos(a))], 'ink2', 2.4), seg([0, 0], [0, 1.45], 'ink4', 1, true), { param: [`${r6(x)}*cos(t)`, `${r6(y)} + ${r6(0.12 * x)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.4, dash: true }, { param: ['0.3*sin(t)', '0.3*cos(t)'], t: [0, r6(a)], color: 'ink3', width: 1.2 }],
    points: [{ x: r6(x), y: r6(y), color: 'warn', r: 7 }, lab(0.12, 0.38, 'α', 'ink2')],
  }, caption, 'A ball circling inside a cone with its vertex down');
}

const EX = (() => {
  const l = 1.2, th = 30, m = 0.5;
  const wd = Math.sqrt(G / (l * Math.cos(th * DEG))), pphi = m * l * l * Math.sin(th * DEG) ** 2 * wd;
  const th2 = 20, wd2 = (wd * Math.sin(th * DEG) ** 2) / Math.sin(th2 * DEG) ** 2;
  return { l, th, m, wd, pphi, P: (2 * Math.PI) / wd, th2, wd2 };
})();

export default lesson({
  id: 'phys3550.M4.4',
  title: 'Cyclic coordinates and conserved momenta',
  minutes: 16, difficulty: 3,
  intro: t`Lagrange's equation $\frac{d}{dt}\big(\partial L/\partial\dot q\big) = \partial L/\partial q$ hides a gift. If a coordinate $q$ does not appear in $L$ at all — only its rate $\dot q$ does — then the right side is zero and the **generalized momentum** $p_q = \partial L/\partial\dot q$ never changes. Such a coordinate is called **cyclic** (or ignorable). In polar coordinates with a central force, $\phi$ is cyclic and $p_\phi = mr^2\dot\phi$ — angular momentum — is conserved: Kepler's second law in one line ([M1.4](#/lesson/phys3550.M1.4)). Better still, a conserved momentum lets you eliminate its coordinate's rate and reduce the problem by one dimension, leaving an **effective potential**: the method of all of M5, and of every black-hole orbit.`,
  equation: t`\frac{\partial L}{\partial q} = 0 \quad\Longrightarrow\quad p_q \equiv \frac{\partial L}{\partial\dot q} = \text{constant}`,
  symbols: [
    { tex: 'q', text: 'a generalized coordinate that does not appear in $L$ — a **cyclic** coordinate (its rate $\\dot q$ may appear)' },
    { tex: 'L', text: 'the Lagrangian $T - U$, in J' },
    { tex: 'p_q', text: 'the generalized momentum conjugate to $q$: kg·m/s for a length, kg·m²/s (an angular momentum) for an angle' },
  ],
  why: t`Conserved momenta are how orbits are solved — around the Sun, around Earth, around a black hole, where the missing $t$ and $\phi$ give the conserved energy and angular momentum of every geodesic.`,
  visual: {
    type: 'mech-energy',
    title: 'The spherical pendulum, reduced to one dimension',
    lead: t`A 1 kg bob on a 1 m string, free to swing in any direction. Its azimuth $\phi$ is cyclic, so $p_\phi = m\ell^2\sin^2\theta\,\dot\phi$ is fixed; the polar angle $\theta$ then moves in the effective potential shown. Press Play.`,
    tasks: [
      t`With $p_\phi > 0$ the curve shoots up near $\theta = 0$: the bob can never pass under the pivot — the centrifugal barrier, made of angular momentum.`,
      t`Drag the energy line down to the well's floor: the bob circles at one angle — a **conical pendulum**.`,
      t`Raise $p_\phi$: the well moves outward. Spin faster, and a conical pendulum swings wider.`,
    ],
    params: {
      U: UEFF, x: [0.08, 3.06], y: [0, 30], m: 1, lunit: 'rad', xlabel: 'θ (rad)', E: 14, x0: 0.9,
      sliders: [{ key: 'p', label: 'Angular momentum $p_\\phi$', min: 0.3, max: 3, step: 0.05, value: 1.2, unit: '\\mathrm{kg\\,m^2/s}', explain: 'The conserved vertical angular momentum $m\\ell^2\\sin^2\\theta\\,\\dot\\phi$.' }],
      readouts: ['E', 'U', 'K'], bars: false, force: false,
    },
    caption: t`$m = 1$ kg, $\ell = 1$ m, $g = 9.8$ m/s², no friction. $U_{\text{eff}}(\theta) = mg\ell(1 - \cos\theta) + p_\phi^2/(2m\ell^2\sin^2\theta)$, in J; "kinetic" here means $\tfrac12m\ell^2\dot\theta^2$ only. The azimuth keeps turning throughout, at $\dot\phi = p_\phi/(m\ell^2\sin^2\theta)$.`,
  },
  example: {
    prompt: t`A ${EX.m} kg bob on a ${EX.l} m string swings as a spherical pendulum. Find its conserved momentum. Then: (a) how fast must it circle to ride steadily at $\theta = ${EX.th}^\circ$ (a conical pendulum)? (b) If, with that $p_\phi$, the bob's swing carries it in to $\theta = ${EX.th2}^\circ$, how fast is $\phi$ turning there?`,
    visual: sph(1.2, { equilibria: true }, t`The shape of $U_{\text{eff}}(\theta)$ for a 1 kg, 1 m pendulum (energies in J): its minimum is the conical pendulum.`),
    steps: [
      { label: 'Lagrangian', text: t`From [M4.1](#/lesson/phys3550.M4.1): $L = \tfrac12m\ell^2\big(\dot\theta^2 + \sin^2\theta\,\dot\phi^2\big) + mg\ell\cos\theta$.` },
      { label: 'Cyclic', text: t`$\phi$ itself is absent, so $p_\phi = \partial L/\partial\dot\phi = m\ell^2\sin^2\theta\,\dot\phi$ is constant: the angular momentum about the vertical through the pivot. (Gravity and the string exert no torque about that axis.)` },
      { label: 'Theta equation', text: t`$m\ell^2\ddot\theta = m\ell^2\sin\theta\cos\theta\,\dot\phi^2 - mg\ell\sin\theta$. Steady circling, $\ddot\theta = 0$, needs $\dot\phi^2 = g/(\ell\cos\theta)$.` },
      { label: 'Numbers (a)', text: t`$\dot\phi = \sqrt{9.8/(${EX.l}\cos${EX.th}^\circ)} = ${sci(EX.wd, 3)}$ rad/s — one turn every $${sci(EX.P, 3)}$ s — and $p_\phi = ${EX.m}(${EX.l})^2\sin^2${EX.th}^\circ\times${sci(EX.wd, 3)} = ${sci(EX.pphi, 3)}$ kg·m²/s.` },
      { label: 'Numbers (b)', text: t`$p_\phi$ is the same everywhere, so $\dot\phi\sin^2\theta$ is too: $\dot\phi = ${sci(EX.wd, 3)}\times\sin^2${EX.th}^\circ/\sin^2${EX.th2}^\circ = ${sci(EX.wd2, 3)}$ rad/s. Swinging in toward the axis, it whirls faster — a skater pulling in her arms.` },
      { label: 'Sense check', text: t`Eliminating $\dot\phi = p_\phi/(m\ell^2\sin^2\theta)$ from the $\theta$ equation leaves one-dimensional motion in $U_{\text{eff}}$; its minimum is the conical pendulum, and the barrier at small $\theta$ is why a spinning bob never passes directly under the pivot.` },
    ],
    answer: t`$p_\phi = m\ell^2\sin^2\theta\,\dot\phi$ is conserved; (a) $\dot\phi = ${sci(EX.wd, 3)}$ rad/s ($p_\phi = ${sci(EX.pphi, 3)}$ kg·m²/s); (b) $\dot\phi = ${sci(EX.wd2, 3)}$ rad/s at $${EX.th2}^\circ$.`,
  },
  practice: [
    multi({
      id: 'which-cyclic', difficulty: 2,
      prompt: t`Which of these coordinates are **cyclic** in the Lagrangian given?`,
      visual: { type: 'cm2-noether', params: { kind: 'rotation', eps: 0, sliders: [], play: false, panels: ['plane'] }, caption: t`A puck in a circularly symmetric potential well: nothing about the potential singles out a direction.` },
      choices: [
        t`$\phi$, in $L = \tfrac12m(\dot r^2 + r^2\dot\phi^2) - \tfrac12kr^2$`,
        t`$x$, in $L = \tfrac12m(\dot x^2 + \dot y^2) - mgy$`,
        t`$r$, in $L = \tfrac12m(\dot r^2 + r^2\dot\phi^2)$ (a free particle)`,
        t`$\theta$, in $L = \tfrac12m\ell^2\dot\theta^2 + mg\ell\cos\theta$`,
      ],
      answer: [0, 1],
      why: { 2: t`$r$ is absent from $U$ but present in $T$ through $r^2\dot\phi^2$: $\partial L/\partial r = mr\dot\phi^2 \ne 0$, so $p_r = m\dot r$ is not conserved.`, 3: t`$\theta$ appears in $\cos\theta$: gravity's torque changes $p_\theta$ — the pendulum swings.` },
      hints: [t`Look for a coordinate that appears **nowhere** in $L$ — neither in $U$ nor in $T$ — though its rate may.`],
      teach: t`A cyclic coordinate is missing from the whole Lagrangian, kinetic part included.`,
      explain: t`$\phi$ in the central spring (angular momentum $mr^2\dot\phi$ is conserved) and $x$ under uniform gravity ($m\dot x$ is conserved — a projectile's horizontal velocity). $r$ for the free particle is the classic trap: a free particle's distance from an arbitrary origin does change, at a varying rate.`,
    }),
    num({
      id: 'sph-whirl', difficulty: 2,
      gen(r) {
        const th1 = r.pick([40, 50, 60]), th2 = r.pick([15, 20, 25]), w1 = r.pick([1.5, 2, 2.5]);
        const w2 = (w1 * Math.sin(th1 * DEG) ** 2) / Math.sin(th2 * DEG) ** 2;
        return {
          prompt: t`A spherical pendulum's bob passes $\theta = ${th1}^\circ$ with $\dot\phi = ${w1}$ rad/s. Later its swing brings it to $\theta = ${th2}^\circ$. What is $\dot\phi$ there?`,
          answer: w2, units: 'rad/s', tol: { rel: 0.005 },
          errors: distinct([{ value: (w1 * Math.sin(th1 * DEG)) / Math.sin(th2 * DEG), feedback: t`The conserved quantity is $m\ell^2\sin^2\theta\,\dot\phi$: the sine is **squared** (the bob circles at radius $\ell\sin\theta$, and angular momentum goes as radius squared).` }, { value: (w1 * Math.sin(th2 * DEG) ** 2) / Math.sin(th1 * DEG) ** 2, feedback: t`Upside down: closer to the axis means faster whirling.` }], w2),
          hints: [t`$p_\phi = m\ell^2\sin^2\theta\,\dot\phi$ is the same at both angles.`, t`$\dot\phi_2 = \dot\phi_1\sin^2\theta_1/\sin^2\theta_2$.`],
          teach: t`With $\phi$ cyclic, $\sin^2\theta\,\dot\phi$ is fixed: a spherical pendulum whirls faster as it swings toward the vertical.`,
          explain: t`$\dot\phi_2 = ${w1}\times\sin^2${th1}^\circ/\sin^2${th2}^\circ = ${sci(w2, 3)}$ rad/s.`,
          visual: sph(1.5, { equilibria: false }, t`The effective potential for the $\theta$ motion (shape only; 1 kg, 1 m, $p_\phi = 1.5$ kg·m²/s).`),
        };
      },
    }),
    expr({
      id: 'cone-p', difficulty: 2,
      prompt: t`A particle slides on the inside of a cone whose axis is vertical (vertex down) and whose half-angle is $\alpha$. With $r$ the distance from the vertex along the surface and $\phi$ the azimuth, $T = \tfrac12m\big(\dot r^2 + r^2\sin^2\alpha\,\dot\phi^2\big)$ and $U = mgr\cos\alpha$. Find the conserved momentum $p_\phi$. Type $\dot\phi$ as $u$ and $\alpha$ as alpha.`,
      answer: 'm*r^2*sin(alpha)^2*u', answerTeX: t`mr^2\sin^2\alpha\,\dot\phi`,
      lhs: 'p_\\phi', vars: { m: [0.5, 2], r: [0.5, 2], alpha: [0.3, 1.2], u: [-2, 2], v: [-2, 2] }, derivativeOf: '(1/2)*m*(v^2 + r^2*sin(alpha)^2*u^2)', wrt: 'u',
      errors: [{ answer: 'm*r^2*u', feedback: t`The particle circles the axis at radius $r\sin\alpha$, not $r$.` }, { answer: 'm*r*sin(alpha)*u', feedback: t`That is the linear momentum round the circle. $\partial T/\partial\dot\phi$ carries one more factor of the radius $r\sin\alpha$.` }],
      hints: [t`$\phi$ appears nowhere in $L = T - U$. Differentiate $T$ with respect to $\dot\phi$.`],
      teach: t`The momentum conjugate to an azimuth is the angular momentum about the axis: mass × (distance from the axis)² × $\dot\phi$.`,
      explain: t`$p_\phi = \partial L/\partial\dot\phi = mr^2\sin^2\alpha\,\dot\phi$ — the angular momentum about the cone's axis, conserved because gravity and the cone's push exert no torque about it.`,
      visual: conePic({ caption: t`A particle circling inside a cone, vertex down. Not to scale.` }),
    }),
    mcq({
      id: 'magnetic-p', difficulty: 3,
      prompt: t`A charge $q$ moves in a uniform magnetic field $B\hat z$. With the vector potential $\vec A = (-By, 0, 0)$, its Lagrangian is $L = \tfrac12m(\dot x^2 + \dot y^2) - qB\,y\,\dot x$. The coordinate $x$ is cyclic. What is conserved?`,
      visual: gpic({ x: [-1.6, 1.6], y: [-1.2, 1.2], equal: true, axes: true, grid: false, xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2 }], points: [{ x: 0, y: 1, color: 'warn', r: 6 }, lab(1.25, 1.0, 'B out of page', 'ink3')], arrows: [{ from: [0, 1], to: [0.5, 1], color: 'warn', label: 'v', labelDx: 4, labelDy: -10 }] }, t`A positive charge circles clockwise at constant speed; its $\dot x$ keeps changing.`, 'A charged particle on a circle in a magnetic field'),
      choices: [
        t`$p_x = m\dot x - qBy$ — not $m\dot x$, which changes as the charge circles`,
        t`$m\dot x$, the $x$-component of ordinary momentum`,
        t`Nothing: a magnetic field is not a potential, so Lagrange's method fails`,
        t`$p_x = m\dot x + qBy$`,
      ],
      answer: 0,
      why: {
        1: t`On a circle $\dot x$ changes sign every half-turn: $m\dot x$ is plainly not conserved. A generalized momentum need not be mass times velocity.`,
        2: t`Velocity-dependent forces like $q\vec v\times\vec B$ fit perfectly well into a Lagrangian through $\vec A$; this $L$ gives the correct Lorentz force.`,
        3: t`Sign: $\partial L/\partial\dot x = m\dot x - qBy$, from the term $-qBy\dot x$.`,
      },
      hints: [t`Compute $\partial L/\partial\dot x$ from the Lagrangian as written.`, t`Then check: $\frac{d}{dt}(m\dot x - qBy) = m\ddot x - qB\dot y$, which is the $x$-component of $m\ddot{\vec r} - q\vec v\times\vec B$.`],
      teach: t`The conserved momentum is whatever $\partial L/\partial\dot q$ says — for a charge, $m\vec v + q\vec A$, not $m\vec v$.`,
      explain: t`$p_x = m\dot x - qBy$ is constant: Lagrange's $x$-equation $\frac{d}{dt}(m\dot x - qBy) = 0$ is exactly $m\ddot x = qB\dot y$, the Lorentz force. It says the orbit's centre stays put: $y_{\text{centre}} = -p_x/qB$. In quantum mechanics this "canonical" momentum, $m\vec v + q\vec A$, is the one that becomes $-i\hbar\nabla$.`,
    }),
    num({
      id: 'conical', difficulty: 2,
      gen(r) {
        const l = r.pick([0.5, 1, 1.5]), th = r.pick([20, 35, 50]);
        const wd = Math.sqrt(G / (l * Math.cos(th * DEG))), P = (2 * Math.PI) / wd;
        return {
          prompt: t`A conical pendulum: a bob on a ${l} m string circles steadily at $${th}^\circ$ from the vertical. From the $\theta$ equation $\ddot\theta = \sin\theta\cos\theta\,\dot\phi^2 - (g/\ell)\sin\theta$, find the time for one revolution.`,
          answer: P, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt(l / G), feedback: t`That is a small-swing pendulum's period. Steady circling at $\theta$ needs $\dot\phi^2 = g/(\ell\cos\theta)$.` }, { value: 2 * Math.PI * Math.sqrt((l * Math.sin(th * DEG)) / G), feedback: t`The condition has $\cos\theta$, from balancing gravity's torque against the whirling: $\dot\phi^2 = g/(\ell\cos\theta)$.` }], P),
          hints: [t`Steady circling: $\ddot\theta = 0$ with $\sin\theta \ne 0$.`, t`$\cos\theta\,\dot\phi^2 = g/\ell$, and the period is $2\pi/\dot\phi$.`],
          teach: t`A conical pendulum sits at the minimum of $U_{\text{eff}}$: $\dot\phi^2 = g/(\ell\cos\theta)$.`,
          explain: t`$\dot\phi = \sqrt{9.8/(${l}\cos${th}^\circ)} = ${sci(wd, 3)}$ rad/s, so the period is $2\pi\sqrt{\ell\cos\theta/g} = ${sci(P, 3)}$ s — shorter than the plane pendulum's $${sci(2 * Math.PI * Math.sqrt(l / G), 3)}$ s.`,
          visual: conePic({ a: th * DEG, s: 1.2, caption: t`The bob circling on its cone of string (the string is the cone's slant). Angle to scale.` }),
        };
      },
    }),
    mcq({
      id: 'p-not-mv', difficulty: 2,
      prompt: t`For a particle moving in a plane, written in polar coordinates, $L = \tfrac12m(\dot r^2 + r^2\dot\phi^2) - U(r)$. What are the generalized momenta $p_r$ and $p_\phi$?`,
      visual: { type: 'cm-polar', params: { r: '1 + 0.3*cos(1.3*t)', theta: '0.8*t + 0.2*sin(1.3*t)', T: [0, 6], at: 2, fixed: true, show: ['path', 'basis', 'v'], values: false, readouts: [], bars: false }, caption: t`A particle on an orbit with its polar unit vectors and velocity.` },
      choices: [
        t`$p_r = m\dot r$ (a linear momentum) and $p_\phi = mr^2\dot\phi$ (an angular momentum)`,
        t`$p_r = m\dot r$ and $p_\phi = mr\dot\phi$, the two components of $m\vec v$`,
        t`$p_r = m\dot r$ and $p_\phi = m\dot\phi$`,
        t`$p_r = mr\dot\phi^2$ and $p_\phi = 0$`,
      ],
      answer: 0,
      why: {
        1: t`$mr\dot\phi$ is the transverse component of $m\vec v$, but $\partial L/\partial\dot\phi = mr^2\dot\phi$: one more factor of $r$, making it the angular momentum.`,
        2: t`$m\dot\phi$ has the wrong units for any momentum. Differentiate $\tfrac12mr^2\dot\phi^2$ with respect to $\dot\phi$.`,
        3: t`$mr\dot\phi^2$ is $\partial L/\partial r$'s kinetic part — a generalized *force* (the centrifugal term), not a momentum.`,
      },
      hints: [t`$p_q = \partial L/\partial\dot q$. Treat $r$, $\dot r$, $\phi$, $\dot\phi$ as independent.`],
      teach: t`A generalized momentum takes the units its coordinate needs; for an angle it is an angular momentum.`,
      explain: t`$p_r = m\dot r$ and $p_\phi = mr^2\dot\phi$. Since $\phi$ is cyclic, $p_\phi$ is conserved — angular momentum — and eliminating $\dot\phi$ gives the radial effective potential $U + p_\phi^2/2mr^2$ of [M5.2](#/lesson/phys3550.M5.2).`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-schwarzschild', difficulty: 3, transfer: true,
      prompt: t`For a body orbiting a black hole in its equatorial plane, general relativity's geodesics come from $L = \tfrac12\Big[-\Big(1 - \dfrac{r_s}{r}\Big)\dot t^2 + \dfrac{\dot r^2}{1 - r_s/r} + r^2\dot\phi^2\Big]$, with dots meaning $d/d\tau$ and $c = 1$. Which quantities are conserved along every orbit?`,
      visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 20, L: 4.3, turns: 4, compare: true }, caption: t`An orbit around a black hole (radius in units of $GM/c^2$), with its effective potential. The Newtonian orbit from the same start is dashed.` },
      choices: [
        t`$E = (1 - r_s/r)\,\dot t$ and $\ell = r^2\dot\phi$, because $t$ and $\phi$ are both cyclic`,
        t`Only $\ell = r^2\dot\phi$; time is not a coordinate, so it cannot be cyclic`,
        t`$p_r = \dot r/(1 - r_s/r)$, because the orbit's radius is fixed`,
        t`None, because the Lagrangian depends on $r$`,
      ],
      answer: 0,
      why: {
        1: t`In relativity $t$ is a coordinate like any other, and here it is missing from $L$: its momentum $-\partial L/\partial\dot t$ is the conserved energy per unit mass.`,
        2: t`$r$ appears in $L$, so $p_r$ changes — the orbit's radius does vary (apart from circular orbits).`,
        3: t`Depending on $r$ spoils only $p_r$. Each missing coordinate brings its own conserved momentum.`,
      },
      hints: [t`List the coordinates $t, r, \phi$ and check which ones appear in $L$ (not just their rates).`, t`$\partial L/\partial\dot t = -(1 - r_s/r)\dot t$ and $\partial L/\partial\dot\phi = r^2\dot\phi$.`],
      teach: t`In curved spacetime too, a missing coordinate gives a conserved momentum: $t$ gives energy, $\phi$ angular momentum.`,
      explain: t`$t$ and $\phi$ are cyclic, so $E = (1 - r_s/r)\dot t$ and $\ell = r^2\dot\phi$ are constants. Using them to eliminate $\dot t$ and $\dot\phi$ leaves one-dimensional motion in $r$ with an effective potential — exactly this lesson's method, which gives the precession of orbits and the innermost stable orbit at $3r_s$. See [the geodesic equation from the action](#/lesson/gr.S12.d).`,
    }),
    num({
      id: 'cp-apogee-speed', difficulty: 2, transfer: true,
      gen(r) {
        const rp = r.pick([6700, 6800, 7000]), ra = r.pick([12000, 20000, 42164]);
        const vp = +Math.sqrt((2 * 398600.4418 * ra) / (rp * (rp + ra))).toPrecision(4);     // vis-viva, GM in km³/s²
        const va = (vp * rp) / ra;
        return {
          prompt: t`A satellite in an elliptical orbit passes perigee $${sci(rp, 4)}$ km from Earth's centre at ${vp} km/s. At apogee, $${sci(ra, 5)}$ km out, its velocity is again perpendicular to the radius. Using the conserved $p_\phi = mr^2\dot\phi$, how fast is it moving there?`,
          answer: va, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: (vp * rp * rp) / (ra * ra), feedback: t`$p_\phi = mr^2\dot\phi = mr\,(r\dot\phi) = mrv$ when the velocity is perpendicular: one factor of $r$ goes into the speed.` }, { value: (vp * ra) / rp, feedback: t`Upside down: farther out, slower.` }],
          hints: [t`At perigee and apogee $\dot r = 0$, so $v = r\dot\phi$ and $p_\phi = mrv$.`, t`$r_pv_p = r_av_a$.`],
          teach: t`Conserved $p_\phi = mrv_\perp$: at the ends of an orbit, speed is inversely proportional to distance.`,
          explain: t`$v_a = v_pr_p/r_a = ${vp}\times${rp}/${ra} = ${sci(va, 3)}$ km/s. (The perigee speed itself came from energy conservation, the vis-viva equation of [M5.3](#/lesson/phys3550.M5.3).)`,
          visual: gpic({ x: [-ra * 1.15, rp * 1.6], y: [-ra * 0.7, ra * 0.7], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ polar: `${r6((2 * rp * ra) / (rp + ra))}/(1 + ${r6((ra - rp) / (ra + rp))}*cos(theta))`, theta: [0, 6.2832], color: 'ink3', width: 1.6 }, { polar: '6371', theta: [0, 6.2832], color: 'accent', width: 2 }], points: [{ x: rp, y: 0, color: 'gold', label: 'perigee', labelDx: 6, labelDy: -10 }, { x: -ra, y: 0, color: 'gold', label: 'apogee', labelDx: 6, labelDy: -10 }] }, t`The orbit around Earth (blue), to scale.`, 'An elliptical orbit around Earth'),
        };
      },
    }),
    num({
      id: 'cp-funnel', difficulty: 3,
      gen(r) {
        const a = r.pick([45, 60, 70]), s = r.pick([0.2, 0.4, 0.6]);
        const v = Math.sqrt(G * s * Math.cos(a * DEG));
        return {
          prompt: t`A ball bearing slides without friction round the inside of a conical funnel (vertex down, half-angle $${a}^\circ$ from the vertical axis), in a horizontal circle ${s} m from the vertex measured along the surface. With $L = \tfrac12m(\dot r^2 + r^2\sin^2\alpha\,\dot\phi^2) - mgr\cos\alpha$, use the $r$ equation to find its speed.`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: distinct([{ value: Math.sqrt(G * s * Math.sin(a * DEG)), feedback: t`The $r$ equation is $m\ddot r = mr\sin^2\alpha\,\dot\phi^2 - mg\cos\alpha$; steady circling gives $v^2 = (r\sin\alpha\,\dot\phi)^2 = gr\cos\alpha$.` }, { value: Math.sqrt(G * s), feedback: t`Only the component of gravity along the slant, $g\cos\alpha$, enters the $r$ equation.` }], v),
          hints: [t`$\partial L/\partial r = mr\sin^2\alpha\,\dot\phi^2 - mg\cos\alpha$; steady circling means $\ddot r = 0$.`, t`So $r\sin^2\alpha\,\dot\phi^2 = g\cos\alpha$, and the speed is $v = r\sin\alpha\,\dot\phi$.`],
          teach: t`The cyclic $\phi$ gives a conserved $p_\phi$; the $r$ equation, with $\ddot r = 0$, fixes the speed of a circular orbit.`,
          explain: t`$v^2 = gr\cos\alpha = 9.8\times${s}\times\cos${a}^\circ$, so $v = ${sci(v, 3)}$ m/s. Give it a little more $p_\phi$ and $r$ oscillates about this circle in its effective potential — the same physics as a planet's orbit, which is why coin funnels make good gravity demonstrations (with the wrong force law).`,
          visual: conePic({ a: a * DEG, s: 1.1, caption: t`A ball circling inside a funnel. Not to scale.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §7.8: conservation laws and ignorable coordinates', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'S. M. Carroll, Lecture Notes on General Relativity (1997), ch. 7: Schwarzschild geodesics, arXiv gr-qc/9712019', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
