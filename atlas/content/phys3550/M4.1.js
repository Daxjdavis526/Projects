// Generalized coordinates and constraints (Taylor §7.2–7.3): N particles have
// 3N Cartesian coordinates; k holonomic constraints (equations among the
// coordinates and t) leave n = 3N − k degrees of freedom, described by any n
// generalized coordinates q₁ … qₙ. Configuration space: a double pendulum's
// (θ₁, θ₂) as one point on a square whose edges are glued (a torus).
// Time-dependent constraints (the spinning hoop, a moving support) and a
// nonholonomic one (a skate). The working skill: kinetic energy in
// generalized coordinates — the rotating hoop's T = ½mR²(θ̇² + ω² sin²θ),
// which M4.3 turns into its equation of motion and bifurcation.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab } from './_cm.js';
import { hoopPic, dpendPic, cartPendPic } from './_cm2.js';

const t = String.raw;
const DEG = Math.PI / 180;

const EX = (() => {
  const m = 0.05, R = 0.25, w = 8, th = 40, thd = 3;
  const Tspin = 0.5 * m * R * R * w * w * Math.sin(th * DEG) ** 2, Tslide = 0.5 * m * R * R * thd * thd;
  return { m, R, w, th, thd, Tspin, Tslide, T: Tspin + Tslide };
})();

// a rigid dumbbell drawn in perspective-free 2D
const dumbbell = gpic({ x: [-1.6, 1.6], y: [-0.9, 0.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [seg([-0.8, -0.4], [0.8, 0.4], 'ink2', 3)], points: [{ x: -0.8, y: -0.4, color: 'accent', r: 9 }, { x: 0.8, y: 0.4, color: 'accent', r: 9 }, lab(0.1, 0.25, 'rigid rod', 'ink3')] }, t`Two masses joined by a light rigid rod, free to move and turn in space.`, 'Two masses joined by a rod');

const SYSTEMS = [
  { what: 'a double pendulum swinging in a vertical plane (two masses on two light rigid rods)', n: 2, why: t`$2\times3 = 6$ coordinates; staying in the plane removes 2, the two rod lengths remove 2: $6 - 4 = 2$, for instance $(\theta_1, \theta_2)$.`, pic: dpendPic({ caption: t`The double pendulum.` }) },
  { what: 'a rigid dumbbell — two masses joined by a light rigid rod — moving freely in space', n: 5, why: t`$6$ coordinates, one constraint (the rod's length): $5$ — three for the centre of mass, two angles for the rod's direction. Spin about the rod's own axis does not count for point masses.`, pic: dumbbell },
  { what: 'a bead sliding on a circular hoop that a motor spins about its vertical diameter', n: 1, why: t`3 coordinates; staying on the hoop's circle is 2 constraints (time-dependent, since the hoop turns): $3 - 2 = 1$, the angle $\theta$ round the hoop.`, pic: hoopPic({ caption: t`The bead on the spinning hoop.` }) },
  { what: 'an Atwood machine: two masses hanging on a string over a fixed pulley, each moving only vertically', n: 1, why: t`6 coordinates; each mass confined to a vertical line (2 constraints each, 4 in all) and the string's fixed length (1): $6 - 5 = 1$.`, pic: { type: 'mech-fbd', params: { scene: 'atwood', show: 'picture', quiet: true }, caption: t`The Atwood machine.` } },
];

export default lesson({
  id: 'phys3550.M4.1',
  title: 'Generalized coordinates and constraints',
  minutes: 15, difficulty: 2,
  intro: t`A pendulum bob has three Cartesian coordinates, but only one number — the angle $\theta$ — is free: the string and the plane of swing fix the rest. Each equation that ties coordinates together (a rod's fixed length, a bead's wire) is a **holonomic constraint**; $k$ of them leave $n = 3N - k$ **degrees of freedom** for $N$ particles. Any $n$ numbers $q_1, \dots, q_n$ that pin down every particle — angles, distances, whatever is convenient — are **generalized coordinates**, and the space of their values is the **configuration space**. Lagrangian mechanics ([M4.2](#/lesson/phys3550.M4.2)) works directly in these coordinates, and its first task is always the same: write the kinetic and potential energies in terms of the $q$'s and their rates $\dot q$. Constraint forces never appear: the coordinates obey the constraints automatically ([M3.5](#/lesson/phys3550.M3.5) shows how to get the forces back when you want them).`,
  equation: t`\vec r_\alpha = \vec r_\alpha(q_1, \dots, q_n, t), \qquad n = 3N - k`,
  symbols: [
    { tex: '\\vec r_\\alpha', text: 'the position of particle $\\alpha$ (one of $N$), in m' },
    { tex: 'q_1, \\dots, q_n', text: 'the generalized coordinates: any $n$ numbers that fix every position — angles in rad, lengths in m' },
    { tex: 't', text: 'time, which appears explicitly when a constraint moves (a spinning hoop, a shaken pivot)' },
    { tex: 'n', text: 'the number of degrees of freedom' },
    { tex: 'N', text: 'the number of particles; $3N$ is the number of Cartesian coordinates' },
    { tex: 'k', text: 'the number of holonomic constraints: equations $f(\\vec r_1, \\dots, \\vec r_N, t) = 0$' },
  ],
  why: t`A satellite with hinged panels, a robot arm, a spinning top, a planet near a black hole — choosing good generalized coordinates is how each becomes solvable; in general relativity the coordinates are spacetime's own, and the kinetic energy becomes the metric.`,
  visual: {
    type: 'graph',
    title: 'Two numbers for a double pendulum',
    lead: t`Left: a double pendulum. Right: its **configuration space** — every pair of angles $(\theta_1, \theta_2)$ is one point. Move the sliders and watch one point carry the whole configuration.`,
    tasks: [
      t`Four Cartesian coordinates locate the two bobs (the readouts show the lower bob's two), yet two angles fix all of them: two degrees of freedom.`,
      t`Set $\theta_1 = 180^\circ$, then $-180^\circ$: the same configuration, at opposite edges of the square. The edges are glued — the configuration space is really a **torus**.`,
      t`Fold the pendulum straight up ($\theta_1 = \theta_2 = 180^\circ$): the corner of the square, an ordinary point of the torus.`,
    ],
    params: {
      x: [-2.3, 7.3], y: [-2.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      sliders: [
        { key: 't1', label: 'Upper angle $\\theta_1$', min: -180, max: 180, step: 1, value: 35, unit: '^\\circ', explain: 'The upper rod’s angle from straight down.' },
        { key: 't2', label: 'Lower angle $\\theta_2$', min: -180, max: 180, step: 1, value: -20, unit: '^\\circ', explain: 'The lower rod’s angle from straight down (not from the upper rod).' },
      ],
      curves: [
        { param: ['-0.4 + 0.8*t', '0.6'], t: [0, 1], color: 'ink2', width: 3 },
        { param: ['t*sin(t1*pi/180)', '0.6 - t*cos(t1*pi/180)'], t: [0, 1], color: 'ink2', width: 1.8 },
        { param: ['sin(t1*pi/180) + t*sin(t2*pi/180)', '0.6 - cos(t1*pi/180) - t*cos(t2*pi/180)'], t: [0, 1], color: 'ink2', width: 1.8 },
        { param: ['3.5 + 3.4*t', '-2.2'], t: [0, 1], color: 'ink3', width: 1.6 },
        { param: ['3.5 + 3.4*t', '1.2'], t: [0, 1], color: 'ink3', width: 1.6 },
        { param: ['3.5', '-2.2 + 3.4*t'], t: [0, 1], color: 'ink3', width: 1.6 },
        { param: ['6.9', '-2.2 + 3.4*t'], t: [0, 1], color: 'ink3', width: 1.6 },
        { param: ['5.2', '-2.2 + 3.4*t'], t: [0, 1], color: 'ink4', width: 1, dash: true },
        { param: ['3.5 + 3.4*t', '-0.5'], t: [0, 1], color: 'ink4', width: 1, dash: true },
      ],
      points: [
        { x: 'sin(t1*pi/180)', y: '0.6 - cos(t1*pi/180)', color: 'accent', r: 7 },
        { x: 'sin(t1*pi/180) + sin(t2*pi/180)', y: '0.6 - cos(t1*pi/180) - cos(t2*pi/180)', color: 'warn', r: 7 },
        { x: '5.2 + 1.7*t1/180', y: '-0.5 + 1.7*t2/180', color: 'gold', r: 7 },
        { x: 5.2, y: 1.42, r: 0, label: 'configuration space', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 },
        { x: 6.9, y: -2.42, r: 0, label: 'θ₁ = 180°', color: 'ink3', labelAlign: 'right', labelDx: 0, labelDy: 0 },
        { x: 3.5, y: -2.42, r: 0, label: '−180°', color: 'ink3', labelDx: 0, labelDy: 0 },
        { x: 3.42, y: 1.2, r: 0, label: 'θ₂ = 180°', color: 'ink3', labelAlign: 'right', labelDx: 0, labelDy: 0 },
      ],
      readouts: [
        { label: 'lower bob x', expr: 'sin(t1*pi/180) + sin(t2*pi/180)', unit: '\\mathrm{m}', digits: 3, zero: 1e-9 },
        { label: 'lower bob y', expr: '-cos(t1*pi/180) - cos(t2*pi/180)', unit: '\\mathrm{m}', digits: 3, zero: 1e-9 },
      ],
    },
    caption: t`Rods 1 m long and rigid; both angles measured from straight down. The bob heights are measured from the pivot. The square is the configuration space drawn flat: its left and right edges are the same configurations, and so are its top and bottom.`,
  },
  example: {
    prompt: t`A bead of mass $${EX.m * 1000}$ g slides on a frictionless circular hoop of radius $${EX.R}$ m, which a motor spins at a steady $\omega = ${EX.w}$ rad/s about its vertical diameter. Choose a generalized coordinate and write the bead's kinetic energy. Evaluate it when the bead is $${EX.th}^\circ$ from the bottom and sliding at $\dot\theta = ${EX.thd}$ rad/s.`,
    visual: hoopPic({ th: EX.th * DEG, caption: t`The hoop spins about the dashed vertical axis; $\theta$ is measured from the bottom. Not to scale.` }),
    steps: [
      { label: 'Count', text: t`One particle: 3 coordinates. Staying on the hoop's circle is 2 constraints, and they move with time because the hoop turns. One degree of freedom remains: take $q = \theta$, the angle from the bottom.` },
      { label: 'Position', text: t`With the hoop's plane at angle $\omega t$: $\vec r = R\big(\sin\theta\cos\omega t,\ \sin\theta\sin\omega t,\ -\cos\theta\big)$. Time appears explicitly — a **time-dependent** (rheonomic) constraint.` },
      { label: 'Velocity', text: t`Differentiate: $\dot{\vec r} = R\dot\theta\big(\cos\theta\cos\omega t,\ \cos\theta\sin\omega t,\ \sin\theta\big) + R\omega\sin\theta\big(-\sin\omega t,\ \cos\omega t,\ 0\big)$. The two vectors are perpendicular.` },
      { label: 'Kinetic energy', text: t`So $v^2 = R^2\dot\theta^2 + R^2\omega^2\sin^2\theta$ and $T = \tfrac12mR^2\big(\dot\theta^2 + \omega^2\sin^2\theta\big)$: sliding round the hoop, plus being carried round the axis on a circle of radius $R\sin\theta$.` },
      { label: 'Numbers', text: t`$\tfrac12(${EX.m})(${EX.R})^2(${EX.thd})^2 = ${sci(EX.Tslide, 3)}$ J from sliding and $\tfrac12(${EX.m})(${EX.R})^2(${EX.w})^2\sin^2${EX.th}^\circ = ${sci(EX.Tspin, 3)}$ J from the spin: $T = ${sci(EX.T, 3)}$ J.` },
      { label: 'Sense check', text: t`At the bottom ($\theta = 0$) the spin term vanishes — the bead sits on the axis. With $U = -mgR\cos\theta$, this $T$ is all [M4.3](#/lesson/phys3550.M4.3) needs to find the bead's motion, with no normal force anywhere in sight.` },
    ],
    answer: t`$q = \theta$; $T = \tfrac12mR^2(\dot\theta^2 + \omega^2\sin^2\theta) = ${sci(EX.T, 3)}$ J at the moment given.`,
  },
  practice: [
    num({
      id: 'dof', difficulty: 1,
      gen(r) {
        const S = r.pick(SYSTEMS);
        return {
          prompt: t`How many degrees of freedom has ${S.what}?`,
          answer: S.n, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: S.n + 1, feedback: t`Count the constraints again: each fixed length, each surface or curve a particle must stay on, removes coordinates.` }].filter((e) => e.value !== S.n),
          hints: [t`Start from $3N$ Cartesian coordinates and subtract one for every constraint equation.`],
          teach: t`Degrees of freedom $= 3N -$ (number of holonomic constraints).`,
          explain: S.why,
          visual: S.pic,
        };
      },
    }),
    expr({
      id: 'spherical-T', difficulty: 2,
      prompt: t`A spherical pendulum (a bob of mass $m$ on a string of length $L$, free to swing in any direction) uses the polar angle $\theta$ from straight down and the azimuth $\phi$. Write its kinetic energy. Type $\dot\theta$ as $w$ and $\dot\phi$ as $u$.`,
      answer: '(1/2)*m*L^2*(w^2 + sin(theta)^2*u^2)', answerTeX: t`\tfrac12mL^2\big(\dot\theta^2 + \sin^2\theta\,\dot\phi^2\big)`,
      lhs: 'T', vars: { m: [0.5, 2], L: [0.5, 2], theta: [0.2, 2.8], w: [-2, 2], u: [-2, 2] },
      errors: [{ answer: '(1/2)*m*L^2*(w^2 + u^2)', feedback: t`Swinging round in $\phi$ carries the bob on a circle of radius $L\sin\theta$, not $L$: the term is $L^2\sin^2\theta\,\dot\phi^2$.` }, { answer: '(1/2)*m*(w^2 + sin(theta)^2*u^2)', feedback: t`Angles need lengths to become speeds: each term carries $L^2$.` }],
      hints: [t`In spherical coordinates $v^2 = \dot r^2 + r^2\dot\theta^2 + r^2\sin^2\theta\,\dot\phi^2$.`, t`Here $r = L$ is fixed, so $\dot r = 0$.`],
      teach: t`Kinetic energy in generalized coordinates: write $v^2$ in those coordinates, then $T = \tfrac12mv^2$.`,
      explain: t`$T = \tfrac12mL^2(\dot\theta^2 + \sin^2\theta\,\dot\phi^2)$. Two degrees of freedom, and $T$ has no $\phi$ in it — a hint of the conserved angular momentum of [M4.4](#/lesson/phys3550.M4.4).`,
      visual: { type: 'c3-coords', params: { system: 'spherical', sliders: false, readouts: [], element: true, edgeLabels: false }, caption: t`Spherical coordinates (with $\theta$ from the $+z$ axis here; for the pendulum, from straight down): on the sphere $r = L$ the bob has two free coordinates, $\theta$ and $\phi$.` },
    }),
    mcq({
      id: 'nonholonomic', difficulty: 3,
      prompt: t`An ice skate can glide along its blade but not sideways: its velocity must point along the blade's heading $\phi$, so $\dot y\cos\phi - \dot x\sin\phi = 0$. Why is this constraint **nonholonomic**?`,
      visual: gpic({ x: [-0.3, 6.3], y: [-1.5, 2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0.8*sin(x)', domain: [0, 6], color: 'accent', width: 2 }, { fn: '0', domain: [0, 6], color: 'ink4', width: 1, dash: true }], points: [{ x: 0, y: 0, color: 'ink', label: 'start', labelDx: -10, labelDy: 14 }, { x: 6, y: 0, color: 'ink', label: 'same place', labelDx: -40, labelDy: 14 }], arrows: [{ from: [6, 0], to: [6.25, 0.24], color: 'warn', label: 'blade', labelDx: 4, labelDy: -8 }] }, t`The skate weaves (blue) from the start back to the dashed line and arrives with its blade at an angle: by weaving it can reach any position with any heading. Schematic.`, 'A weaving skate path'),
      choices: [
        t`It restricts velocities, not positions: by weaving, the skate can still reach every position $(x, y)$ with every heading $\phi$, so no equation $f(x, y, \phi) = 0$ can express it`,
        t`Because it contains time derivatives, which holonomic constraints may never contain`,
        t`Because the skate has friction`,
        t`Because the constraint changes with time`,
      ],
      answer: 0,
      why: {
        1: t`A constraint like $\dot x = \dot y$ contains derivatives yet integrates to $x - y = \text{const}$: holonomic. The test is whether it can be integrated into a relation among coordinates.`,
        2: t`The blade's sideways grip is idealized as a perfect constraint; friction along the blade is separate and irrelevant here.`,
        3: t`Nothing in $\dot y\cos\phi - \dot x\sin\phi = 0$ depends on $t$. Time dependence makes a constraint rheonomic, not nonholonomic.`,
      },
      hints: [t`A holonomic constraint shrinks the set of reachable configurations. Can the skate reach any $(x, y, \phi)$?`, t`Parallel parking: a car cannot move sideways, yet can end up anywhere, pointing any way.`],
      teach: t`A nonholonomic constraint limits how you may move, not where you may be — it cannot be used to eliminate a coordinate.`,
      explain: t`Configuration space keeps all three dimensions $(x, y, \phi)$, but the allowed velocities at each point form only a 2D set. Parallel parking and rolling balls are the same. Such constraints need multipliers ([M3.5](#/lesson/phys3550.M3.5)) — the subject of [constrained dynamical systems](#/lesson/st-g.G6.1).`,
    }),
    num({
      id: 'hoop-T', difficulty: 2,
      gen(r) {
        const m = r.pick([0.02, 0.05, 0.1]), R = r.pick([0.1, 0.2, 0.3]), w = r.pick([5, 10, 15]), th = r.pick([30, 60, 90]), thd = r.pick([0, 2, 4]);
        const T = 0.5 * m * R * R * (thd * thd + w * w * Math.sin(th * DEG) ** 2);
        return {
          prompt: t`A ${m * 1000} g bead is on a hoop of radius ${R} m spinning at $\omega = ${w}$ rad/s about its vertical diameter. At $\theta = ${th}^\circ$ from the bottom, sliding round the hoop at $\dot\theta = ${thd}$ rad/s, what is its kinetic energy (in an inertial frame)? Give it in mJ.`,
          answer: T * 1000, units: 'mJ', tol: { rel: 0.005 },
          errors: [{ value: 0.5 * m * R * R * thd * thd * 1000, feedback: t`That is the energy of sliding round the hoop only. The hoop also carries the bead round the axis at speed $\omega R\sin\theta$.` }, { value: 0.5 * m * R * R * (thd * thd + w * w) * 1000, feedback: t`The bead circles the axis at radius $R\sin\theta$, not $R$.` }].filter((e) => Math.abs(e.value - T * 1000) > 0.01 * T * 1000),
          hints: [t`$T = \tfrac12mR^2\big(\dot\theta^2 + \omega^2\sin^2\theta\big)$.`],
          teach: t`On a moving constraint the kinetic energy has a part from moving along it and a part from being carried by it.`,
          explain: t`$T = \tfrac12(${m})(${R})^2\big(${thd}^2 + ${w}^2\sin^2${th}^\circ\big) = ${sci(T * 1000, 3)}$ mJ.`,
          visual: hoopPic({ th: th * DEG, caption: t`The bead at $\theta = ${th}^\circ$ on the spinning hoop. Not to scale.` }),
        };
      },
    }),
    multi({
      id: 'time-dependent', difficulty: 2,
      prompt: t`In which of these systems does the constraint depend explicitly on **time**, so that $\vec r = \vec r(q, t)$?`,
      visual: cartPendPic({ th: 0.5, caption: t`A pendulum hung from a support that is moved back and forth.` }),
      choices: [
        t`A pendulum whose support a motor shakes horizontally as $x_s = A\cos\Omega t$`,
        t`A bead on a hoop spun at a fixed rate $\omega$ by a motor`,
        t`A pendulum hanging from a fixed pivot`,
        t`A bead on a fixed, frictionless parabolic wire`,
      ],
      answer: [0, 1],
      why: { 2: t`A fixed pivot gives $\vec r = L(\sin\theta, -\cos\theta)$: no $t$.`, 3: t`A fixed wire gives $\vec r = (x, ax^2)$: no $t$.` },
      hints: [t`Write the position in terms of the generalized coordinate. Does a prescribed motion — something a motor imposes — appear?`],
      teach: t`A constraint whose motion is prescribed from outside puts $t$ explicitly into $\vec r(q, t)$.`,
      explain: t`The shaken support gives $\vec r = (A\cos\Omega t + L\sin\theta,\ -L\cos\theta)$ and the spun hoop gives the example's $\vec r(\theta, t)$. Such constraints can do work — energy flows in from the motor — which [M4.5](#/lesson/phys3550.M4.5) will connect to the explicit $t$.`,
    }),
    expr({
      id: 'atwood-T', difficulty: 2,
      prompt: t`An Atwood machine has masses $m_1$ and $m_2$ on a string over a pulley of radius $r$ and moment of inertia $I$; the string does not slip. With the single coordinate $x$ (how far $m_1$ has descended), write the total kinetic energy. Type $\dot x$ as $v$.`,
      answer: '(1/2)*(m_1 + m_2 + I/r^2)*v^2', answerTeX: t`\tfrac12\Big(m_1 + m_2 + \frac{I}{r^2}\Big)\dot x^2`,
      lhs: 'T', vars: { m_1: [0.5, 3], m_2: [0.5, 3], I: [0.01, 0.2], r: [0.05, 0.3], v: [-2, 2] },
      errors: [{ answer: '(1/2)*(m_1 + m_2)*v^2', feedback: t`The pulley turns too: it has kinetic energy $\tfrac12I\omega^2$ with $\omega = \dot x/r$.` }, { answer: '(1/2)*(m_1 - m_2)*v^2', feedback: t`Kinetic energies add whatever the directions: $m_2$ rises at the same speed as $m_1$ falls.` }],
      hints: [t`Both masses move at speed $|\dot x|$; the pulley turns at $\omega = \dot x/r$.`, t`$T = \tfrac12m_1\dot x^2 + \tfrac12m_2\dot x^2 + \tfrac12I(\dot x/r)^2$.`],
      teach: t`One coordinate describes all three bodies, so every kinetic energy is written with the same $\dot x$.`,
      explain: t`$T = \tfrac12(m_1 + m_2 + I/r^2)\dot x^2$: the pulley acts as an extra mass $I/r^2$. No tension appears anywhere — the string's constraint is built into the coordinate.`,
      visual: { type: 'mech-fbd', params: { scene: 'atwood', show: 'picture', quiet: true }, caption: t`The Atwood machine (pulley drawn without its mass).` },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-station-arm', difficulty: 2, transfer: true,
      gen(r) {
        const j = r.pick([3, 6, 7]);
        return {
          prompt: t`A free-flying space station (a rigid body) carries a robotic arm with ${j} revolute joints — each a hinge turning about one fixed axis — holding a payload rigidly in its gripper. Treat every link, the station and the payload as rigid bodies. How many degrees of freedom has the whole system?`,
          answer: 6 + j, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: j, feedback: t`The station itself floats freely: 3 position and 3 orientation coordinates before any joint is counted.` }, { value: 6 * (j + 2), feedback: t`That counts every body as free. Each hinge leaves only 1 relative freedom between neighbours, removing 5.` }],
          hints: [t`A free rigid body has 6 degrees of freedom. A hinge allows 1 relative motion between the two bodies it joins.`, t`Station: 6. Each joint adds 1. The payload, gripped rigidly, adds nothing.`],
          teach: t`Count a chain of rigid bodies as 6 for the free base plus 1 per hinge.`,
          explain: t`$6 + ${j} = ${6 + j}$. The ISS's Canadarm2 has 7 joints; with a free-flying base the system's configuration space has ${6 + j} dimensions — which is why its Lagrangian is written in joint angles, not Cartesian coordinates.`,
          visual: gpic({ x: [-1, 5], y: [-0.6, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', shade: [{ fn: '0.6', lower: '-0.4', from: -0.8, to: 1, color: 'ink3', alpha: 0.3 }], curves: [seg([1, 0.3], [2, 1.2], 'ink2', 3), seg([2, 1.2], [3.2, 1.5], 'ink2', 3), seg([3.2, 1.5], [3.9, 0.8], 'ink2', 3)], points: [{ x: 1, y: 0.3, color: 'accent', r: 5 }, { x: 2, y: 1.2, color: 'accent', r: 5 }, { x: 3.2, y: 1.5, color: 'accent', r: 5 }, { x: 3.9, y: 0.8, color: 'warn', r: 9, label: 'payload', labelDx: 10, labelDy: 0 }, lab(0.1, 0.1, 'station', 'ink2')] }, t`A station, an arm (joints in blue) and its payload. Schematic: joint count not drawn to match.`, 'A space station with a jointed robotic arm holding a payload'),
        };
      },
    }),
    num({
      id: 'cp-dpend-height', difficulty: 2,
      gen(r) {
        const L1 = r.pick([0.5, 1.0]), L2 = r.pick([0.4, 0.8]), t1 = r.pick([30, 50, 70]), t2 = r.pick([-40, 20, 60, 110]);
        const h = -L1 * Math.cos(t1 * DEG) - L2 * Math.cos(t2 * DEG);
        return {
          prompt: t`A double pendulum has rods $L_1 = ${L1}$ m and $L_2 = ${L2}$ m. With $\theta_1 = ${t1}^\circ$ and $\theta_2 = ${t2}^\circ$ (each measured from straight down), how high is the lower bob above the pivot? (Negative means below.)`,
          answer: h, units: 'm', tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: -L1 * Math.cos(t1 * DEG) - L2 * Math.cos((t1 + t2) * DEG), feedback: t`$\theta_2$ is measured from straight down, not from the upper rod: use $\cos\theta_2$, not $\cos(\theta_1 + \theta_2)$.` }, { value: L1 * Math.cos(t1 * DEG) + L2 * Math.cos(t2 * DEG), feedback: t`Sign: at $\theta = 0$ a bob hangs **below** the pivot.` }].filter((e) => Math.abs(e.value - h) > 0.01),
          hints: [t`$y_2 = -L_1\cos\theta_1 - L_2\cos\theta_2$.`],
          teach: t`Generalized coordinates fix every Cartesian coordinate: $\vec r = \vec r(q)$.`,
          explain: t`$y_2 = -${L1}\cos${t1}^\circ - ${L2}\cos(${t2}^\circ) = ${sci(h, 3)}$ m. This is the function $U = m_1gy_1 + m_2gy_2$ needs.`,
          visual: dpendPic({ t1: t1 * DEG, t2: t2 * DEG, caption: t`The double pendulum at the angles given (arms drawn equal, angles to scale).` }),
        };
      },
    }),
    mcq({
      id: 'cp-cart-T', difficulty: 3,
      prompt: t`A pendulum (bob $m$, length $L$) hangs from a support that a motor moves horizontally as $x_s(t)$. With $\theta$ from straight down, the bob is at $\big(x_s + L\sin\theta,\ -L\cos\theta\big)$. What is the bob's kinetic energy?`,
      visual: cartPendPic({ th: 0.45, xs: -0.5, caption: t`The moving support and the pendulum. Not to scale.` }),
      choices: [
        t`$\tfrac12m\big(\dot x_s^2 + 2L\dot x_s\dot\theta\cos\theta + L^2\dot\theta^2\big)$`,
        t`$\tfrac12m\big(\dot x_s^2 + L^2\dot\theta^2\big)$`,
        t`$\tfrac12mL^2\dot\theta^2$`,
        t`$\tfrac12m\big(\dot x_s^2 - 2L\dot x_s\dot\theta\cos\theta + L^2\dot\theta^2\big)$`,
      ],
      answer: 0,
      why: {
        1: t`The cross term is missing: the support's velocity and the swinging velocity are not perpendicular. Square the sum of the components honestly.`,
        2: t`That is the kinetic energy relative to the support, valid only if the support is at rest.`,
        3: t`Sign slip: $\dot x = \dot x_s + L\cos\theta\,\dot\theta$, and squaring gives $+2L\dot x_s\dot\theta\cos\theta$.`,
      },
      hints: [t`Differentiate: $\dot x = \dot x_s + L\cos\theta\,\dot\theta$ and $\dot y = L\sin\theta\,\dot\theta$.`, t`Then $\dot x^2 + \dot y^2 = \dot x_s^2 + 2L\dot x_s\dot\theta\cos\theta + L^2\dot\theta^2(\cos^2\theta + \sin^2\theta)$.`],
      teach: t`Find $T$ by differentiating $\vec r(q, t)$ — prescribed motions bring cross terms.`,
      explain: t`$v^2 = \dot x_s^2 + 2L\dot x_s\dot\theta\cos\theta + L^2\dot\theta^2$. The cross term couples the shaking to the swinging — it is how a shaken support drives a pendulum. (Shake the support fast enough **vertically** instead, and it can even hold a pendulum upside down: Kapitza's pendulum.)`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §7.2–7.3: generalized coordinates and constraints', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'H. Goldstein, C. Poole, J. Safko, Classical Mechanics, 3rd ed. (2002), §1.3: constraints', url: 'https://www.pearson.com/en-us/subject-catalog/p/classical-mechanics/P200000006453' },
  ],
});
