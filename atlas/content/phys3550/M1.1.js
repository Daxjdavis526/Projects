// Newton's laws in polar and other coordinates: differentiate v = ṙ r̂ + rθ̇ θ̂
// once more to get a = (r̈ − rθ̇²) r̂ + (rθ̈ + 2ṙθ̇) θ̂; the centripetal and
// Coriolis-type terms are pure geometry (a straight line has them too, and
// they cancel). Applications: a bead on a spinning rod, a pendulum's string
// tension, a half-pipe's small oscillations, r²θ̇ conserved under a central
// force, and the sideways push on a climber in a spinning space station.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, polarPic, G } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the worked example: a bead on a frictionless rod spinning in a horizontal plane
const EX = (() => {
  const r0 = 0.1, w = 3.0, m = 0.05, T = 1.0;
  const r = r0 * Math.cosh(w * T), rd = r0 * w * Math.sinh(w * T), N = 2 * m * rd * w;
  return { r0, w, m, T, r, rd, N, vt: r * w, v: Math.hypot(rd, r * w) };
})();

// a pendulum drawn as a graph: pivot at the origin, angle th (rad) from straight down
function pendulumPic(th, caption, { arrows = true } = {}) {
  const L = 2, bx = L * Math.sin(th), by = -L * Math.cos(th);
  const ur = [Math.sin(th), -Math.cos(th)], ut = [Math.cos(th), Math.sin(th)];
  return gpic({
    x: [-2.4, 2.4], y: [-2.6, 0.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([-0.5, 0], [0.5, 0], 'ink2', 3), seg([0, 0], [bx, by], 'ink2', 1.6), seg([0, 0], [0, -2.3], 'ink4', 1, true), { param: ['0.6*sin(t)', '-0.6*cos(t)'], t: [0, r6(th)], color: 'ink3', width: 1.2 }],
    points: [{ x: r6(bx), y: r6(by), color: 'accent', r: 8 }, lab(0.32 * Math.sin(th / 2) + 0.08, -0.8 * Math.cos(th / 2), 'θ', 'ink2')],
    arrows: arrows ? [
      { from: [bx, by], to: [bx - 0.9 * ur[0], by - 0.9 * ur[1]], color: 'warn', label: 'T', labelDx: -14, labelDy: -2 },
      { from: [bx, by], to: [bx, by - 0.9], color: 'accent', label: 'mg', labelDx: 6, labelDy: 6 },
    ] : [],
  }, caption, 'A pendulum hanging at an angle, with the string tension and weight on its bob');
}

const PRESETS = [
  { label: 'Bead on a spinning rod', r: '0.1*cosh(1.5*t)', theta: '1.5*t', T: [0, 2.4], at: 1.6, scale: { v: 0.25, a: 0.1 }, explain: t`A frictionless rod turns at a steady 1.5 rad/s and the bead, released near the axle, slides out: $r = 0.1\cosh 1.5t$ m. Nothing pushes it outward — watch $a_r$.` },
  { label: 'Circle', r: '1.5', theta: '0.9*t', T: [0, 7], at: 1, scale: { v: 0.5, a: 0.5 }, explain: t`$r = 1.5$ m, $\theta = 0.9t$: only the centripetal term $-r\dot\theta^2$ survives.` },
  { label: 'Straight line', r: 'sqrt(1 + (0.8*t)^2)', theta: 'atan(0.8*t)', T: [-3, 3], at: -1, x: [-0.4, 2.8], y: [-2, 0.6], scale: { v: 0.5, a: 2.5 }, explain: t`$x = 1$ m, $y = 0.8t$ m: constant velocity, zero acceleration — yet every polar term is nonzero.` },
  { label: 'Spiral', r: '0.5 + 0.3*t', theta: '0.8*t', T: [0, 7], at: 2, scale: { v: 0.6, a: 0.5 }, explain: t`$\dot r = 0.3$ m/s and $\dot\theta = 0.8$ rad/s, both steady: centripetal plus the $2\dot r\dot\theta$ term.` },
];

export default lesson({
  id: 'phys3550.M1.1',
  title: 'Newton’s laws in polar and other coordinates',
  minutes: 16, difficulty: 3,
  intro: t`Differentiate the polar velocity $\dot r\,\hat r + r\dot\theta\,\hat\theta$ (from [M0.1](#/lesson/phys3550.M0.1)) once more, letting $\hat r$ and $\hat\theta$ turn, and you get the polar acceleration. Newton's second law then splits into a **radial** and a **transverse** equation, $F_r = m(\ddot r - r\dot\theta^2)$ and $F_\theta = m(r\ddot\theta + 2\dot r\dot\theta)$. The extra terms are not forces: they are what $\ddot{\vec r}$ looks like when the basis rotates. $-r\dot\theta^2$ is the familiar centripetal acceleration; $2\dot r\dot\theta$ appears whenever the distance and the angle change together.`,
  equation: t`\vec a = \big(\ddot r - r\dot\theta^2\big)\,\hat r + \big(r\ddot\theta + 2\dot r\dot\theta\big)\,\hat\theta`,
  symbols: [
    { tex: '\\vec a', text: 'the particle’s acceleration, in m/s² — the same vector Cartesian coordinates give, written in the rotating basis' },
    { tex: '\\ddot r', text: 'the second derivative of the distance $r$ (m/s²): the radial acceleration you would naively expect' },
    { tex: '-r\\dot\\theta^2', text: 'the **centripetal** term (m/s²): a particle circling at angular velocity $\\dot\\theta$ accelerates inward by $r\\dot\\theta^2$' },
    { tex: 'r\\ddot\\theta', text: 'the **angular-acceleration** term (m/s²): speeding up the turn at fixed $r$' },
    { tex: '2\\dot r\\dot\\theta', text: 'the **Coriolis-type** term (m/s²): moving outward while turning means the transverse speed $r\\dot\\theta$ must grow' },
    { tex: '\\hat r,\\ \\hat\\theta', text: 'the outward and anticlockwise unit vectors at the particle' },
  ],
  why: t`Orbits, pendulums, centrifuges and rotating stations are all solved in these two equations — and the $2\dot r\dot\theta$ term is the seed of the Coriolis force of module M6.`,
  visual: {
    type: 'cm-polar',
    title: 'The four terms of the polar acceleration',
    lead: t`The dashed arrows are the four terms, drawn head to tail from the particle: $\ddot r\,\hat r$, then $-r\dot\theta^2\,\hat r$, then $r\ddot\theta\,\hat\theta$, then $2\dot r\dot\theta\,\hat\theta$. They end where the true acceleration (orange) ends. The bars below give their sizes.`,
    tasks: [
      t`**Bead on a spinning rod:** $\ddot r$ exactly cancels $-r\dot\theta^2$, so $a_r = 0$ — no outward force. All the acceleration is $2\dot r\dot\theta$, supplied by the rod pushing sideways.`,
      t`**Straight line:** all four terms are there, yet they cancel in pairs and $\vec a = 0$. They describe the coordinates, not the motion.`,
      t`**Circle:** only $-r\dot\theta^2$ is left — the centripetal acceleration.`,
    ],
    params: { presets: PRESETS, show: ['path', 'basis', 'v', 'a', 'terms'], bars: true, readouts: ['t', 'r', 'rd', 'thd', 'ar', 'at'] },
    caption: t`Point particle in a plane; derivatives computed numerically. Each preset has its own arrow scales (stated nowhere on the picture: compare arrows within one picture). The four dashed term arrows share the acceleration's scale.`,
  },
  example: {
    prompt: t`A long, frictionless rod turns in a horizontal plane at a steady $\omega = ${EX.w.toFixed(1)}$ rad/s. A ${EX.m * 1000} g bead starts at rest on the rod (that is, turning with it) $r_0 = ${EX.r0.toFixed(2)}$ m from the axle. Find $r(t)$, and the sideways force the rod exerts on the bead at $t = ${EX.T.toFixed(1)}$ s.`,
    visual: polarPic({ r: `${EX.r0}*cosh(${EX.w}*t)`, theta: `${EX.w}*t`, T: [0, 1.15], at: EX.T, show: ['path', 'basis', 'v', 'a'], scale: { v: 0.12, a: 0.025 }, caption: t`The bead's path in the room (spiralling out) and its velocity and acceleration at $t = ${EX.T}$ s: the acceleration is perpendicular to the rod.` }),
    steps: [
      { label: 'Forces', text: t`The rod is frictionless, so it can push only perpendicular to itself — along $\hat\theta$. There is no radial force: $F_r = 0$, $F_\theta = N$.` },
      { label: 'Radial equation', text: t`$m(\ddot r - r\dot\theta^2) = 0$ with $\dot\theta = \omega$: $\ddot r = \omega^2 r$. Solutions $e^{\pm\omega t}$; from rest at $r_0$, $r = r_0\cosh\omega t$.` },
      { label: 'Read it physically', text: t`The bead flies outward with no outward force: it is trying to go straight, and a straight line drifts away from a rotating rod. In the rod's frame this looks like a "centrifugal force" (M6).` },
      { label: 'Transverse equation', text: t`$N = m(r\ddot\theta + 2\dot r\dot\theta) = 2m\dot r\omega$, since $\ddot\theta = 0$. With $\dot r = r_0\omega\sinh\omega t$: $N = 2mr_0\omega^2\sinh\omega t$.` },
      { label: 'Numbers', text: t`At $t = ${EX.T}$ s: $r = ${EX.r0}\cosh 3 = ${sci(EX.r, 4)}$ m, $\dot r = ${sci(EX.rd, 4)}$ m/s, and $N = 2(${EX.m})(${sci(EX.rd, 4)})(${EX.w}) = ${sci(EX.N)}$ N.` },
      { label: 'Sense check', text: t`Energy: $N$ does work at rate $N\cdot r\omega$, raising the kinetic energy $\tfrac12m(\dot r^2 + r^2\omega^2)$ — the motor keeping $\omega$ fixed pays for it. Check: $\frac{d}{dt}\tfrac12m(\dot r^2 + \omega^2r^2) = 2m\omega^2r\dot r = N r\omega$. ✓` },
    ],
    answer: t`$r = r_0\cosh\omega t$; at $t = ${EX.T}$ s, $r = ${sci(EX.r)}$ m and the rod pushes sideways with $N = 2m\dot r\omega = ${sci(EX.N)}$ N.`,
  },
  practice: [
    multi({
      id: 'which-terms', difficulty: 2,
      prompt: t`A child walks straight outward along a radius of a merry-go-round that turns at a steady rate, keeping a steady pace along the radius. Which terms of the polar acceleration (seen from the ground, origin at the axle) are **nonzero**?`,
      visual: polarPic({ r: '0.4 + 0.5*t', theta: '0.6*t', T: [0, 5], at: 2.5, show: ['path', 'basis', 'v', 'rvec'], caption: t`The child's path seen from the ground: a spiral, since the radius she walks along keeps turning.` }),
      choices: [t`$\ddot r$`, t`$-r\dot\theta^2$`, t`$r\ddot\theta$`, t`$2\dot r\dot\theta$`],
      answer: [1, 3],
      why: { 0: t`Her pace along the radius is steady: $\dot r$ is constant, so $\ddot r = 0$.`, 2: t`The merry-go-round turns at a steady rate: $\ddot\theta = 0$.` },
      hints: ['Which of r, ṙ, θ̇ are constant here, and which are not zero?', t`$\dot r$ and $\dot\theta$ are both nonzero constants.`],
      teach: t`Read each term off the motion: steady rates kill $\ddot r$ and $r\ddot\theta$, but $-r\dot\theta^2$ and $2\dot r\dot\theta$ need only nonzero rates.`,
      explain: t`$\ddot r = 0$ and $\ddot\theta = 0$, but $\dot r \ne 0$ and $\dot\theta \ne 0$: she has a centripetal acceleration $r\dot\theta^2$ inward and a transverse one $2\dot r\dot\theta$ — friction from the floor must supply both.`,
    }),
    num({
      id: 'walker-force', difficulty: 3,
      gen(r) {
        const m = r.pick([30, 40, 50]), R = r.pick([1.0, 1.5, 2.0]), rd = r.pick([0.6, 0.8, 1.0]), w = r.pick([0.8, 1.0, 1.2]);
        const ar = R * w * w, at = 2 * rd * w, F = m * Math.hypot(ar, at);
        return {
          prompt: t`A ${m} kg child walks straight outward along a radius of a playground roundabout turning at a steady $\omega = ${w}$ rad/s, at a steady ${rd} m/s along the radius. When she is ${R} m from the axle, what horizontal force must friction from the floor exert on her?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: m * ar, feedback: t`That is only the centripetal part. Walking outward on a turning platform also needs the transverse $2\dot r\dot\theta$.` }, { value: m * (ar + at), feedback: t`The two parts are perpendicular ($\hat r$ and $\hat\theta$): combine them with Pythagoras.` }, { value: m * Math.hypot(ar, rd * w), feedback: t`The transverse term is $2\dot r\dot\theta$ — with a 2.` }],
          hints: [t`Find $a_r = \ddot r - r\dot\theta^2$ and $a_\theta = r\ddot\theta + 2\dot r\dot\theta$ with $\ddot r = \ddot\theta = 0$.`, t`$F = m\sqrt{a_r^2 + a_\theta^2}$, with $a_r = -${R}\times${w}^2$ and $a_\theta = 2\times${rd}\times${w}$.`],
          teach: t`Friction is the only horizontal force, so it must supply the whole polar acceleration — centripetal and $2\dot r\dot\theta$ together.`,
          explain: t`$a_r = -r\omega^2 = ${sci(-ar)}$ m/s² and $a_\theta = 2\dot r\omega = ${sci(at)}$ m/s², so $F = ${m}\sqrt{${sci(ar)}^2 + ${sci(at)}^2} = ${sci(F)}$ N, pointing inward and forward (in the direction of rotation).`,
          visual: polarPic({ r: `${R} + ${rd}*t`, theta: `${w}*t`, T: [-r6(0.8 * R / rd), r6(1.2)], at: 0, show: ['path', 'basis', 'v'], caption: t`Her path seen from the ground, with $\hat r$, $\hat\theta$ and her velocity at the moment in question.` }),
        };
      },
    }),
    num({
      id: 'pendulum-tension', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1.0, 2.0]), L = r.pick([0.8, 1.2, 1.5]), th = r.pick([20, 30, 40]), thd = r.pick([1.0, 1.5, 2.0]);
        const T = m * G * Math.cos(th * DEG) + m * L * thd * thd;
        return {
          prompt: t`A ${m} kg pendulum bob hangs on a ${L} m string. Use polar coordinates centred on the pivot, with $\theta$ measured from straight down. At the moment $\theta = ${th}^\circ$ and $\dot\theta = ${thd}$ rad/s, what is the string's tension?`,
          answer: T, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: m * G * Math.cos(th * DEG), feedback: t`That balances the radial forces as if the bob were at rest. It is circling: $r\dot\theta^2 \ne 0$.` }, { value: m * G + m * L * thd * thd, feedback: t`Only the component of gravity along the string, $mg\cos\theta$, enters the radial equation.` }, { value: m * G * Math.cos(th * DEG) - m * L * thd * thd, feedback: t`Sign: the radial acceleration $-L\dot\theta^2$ points toward the pivot, so the tension must exceed $mg\cos\theta$.` }],
          hints: [t`With $r = L$ fixed, $a_r = -L\dot\theta^2$ ($\hat r$ points from the pivot along the string, toward the bob).`, t`Radial forces: $mg\cos\theta$ outward along $\hat r$, tension $T$ inward. So $mg\cos\theta - T = -mL\dot\theta^2$.`],
          teach: t`For a pendulum, $r = L$ is fixed, so the radial equation gives the tension: $T = mg\cos\theta + mL\dot\theta^2$.`,
          explain: t`$T = mg\cos\theta + mL\dot\theta^2 = ${m}(9.8)\cos ${th}^\circ + ${m}(${L})(${thd})^2 = ${sci(m * G * Math.cos(th * DEG))} + ${sci(m * L * thd * thd)} = ${sci(T)}$ N. The transverse equation, $mL\ddot\theta = -mg\sin\theta$, is the pendulum's equation of motion.`,
          visual: pendulumPic(th * DEG, t`The bob at $\theta = ${th}^\circ$ with the tension $T$ (toward the pivot) and its weight. $\hat r$ points from the pivot through the bob; $\hat\theta$ is perpendicular, toward increasing $\theta$. Arrows not to scale.`),
        };
      },
    }),
    mcq({
      id: 'straight-line', difficulty: 2,
      prompt: t`A puck slides at constant velocity in a straight line that misses the origin. In polar coordinates, $\ddot r \ne 0$ and $\dot r\dot\theta \ne 0$ along most of its path. How can that be, when no force acts?`,
      visual: { type: 'cm-polar', params: { r: 'sqrt(1 + (0.8*t)^2)', theta: 'atan(0.8*t)', T: [-3, 3], at: -1, fixed: true, show: ['path', 'basis', 'terms'], bars: true, values: false, readouts: [], x: [-0.4, 2.8], y: [-2, 0.6], scale: { a: 2.5 } }, caption: t`The puck at one moment, with the four acceleration terms drawn head to tail (dashed) and as bars. Arrows to scale with one another.` },
      choices: [
        t`The terms cancel in pairs: $\ddot r = r\dot\theta^2$ and $r\ddot\theta = -2\dot r\dot\theta$, so $\vec a = 0$`,
        t`A force is needed after all: a straight line is a curve in polar coordinates`,
        t`$\ddot r$ must really be zero; the nonzero value is a numerical artefact`,
        t`Polar coordinates only apply to curved motion, so the terms mean nothing here`,
      ],
      answer: 0,
      why: {
        1: t`Forces do not depend on the coordinates you choose. The second law is $\vec F = m\vec a$, and $\vec a$ is zero for constant velocity whatever basis you write it in.`,
        2: t`Check directly: $r = \sqrt{b^2 + v^2t^2}$ has $\ddot r = b^2v^2/r^3 \ne 0$. The distance from the origin falls and then rises, and that is not uniform.`,
        3: t`Polar coordinates describe any motion. They are just inconvenient for this one — every term is nonzero and they cancel.`,
      },
      hints: ['Is the acceleration vector zero? Then what must the radial and transverse components be?'],
      teach: t`The polar terms are pieces of one vector, $\vec a$; for force-free motion they must add to zero, whatever each is on its own.`,
      explain: t`$\vec a = 0$, so $a_r = \ddot r - r\dot\theta^2 = 0$ and $a_\theta = r\ddot\theta + 2\dot r\dot\theta = 0$, even though each term is nonzero. The picture's dashed arrows return to the puck. The "extra" terms are bookkeeping for a rotating basis.`,
    }),
    num({
      id: 'central-r2thetadot', difficulty: 2,
      gen(r) {
        const r1 = r.pick([7000, 7500, 8000]), r2 = r.pick([10000, 12000, 15000]), w1 = r.pick([1.0, 1.1, 1.2]);
        const w2 = w1 * (r1 / r2) ** 2;
        const e = (r2 - r1) / (r2 + r1), p = (2 * r1 * r2) / (r1 + r2);
        return {
          prompt: t`A satellite moves under Earth's gravity alone, a **central** force. At perigee it is $${sci(r1, 4)}$ km from Earth's centre with $\dot\theta = ${w1.toFixed(1)}\times10^{-3}$ rad/s. What is $\dot\theta$ at apogee, $${sci(r2, 4)}$ km out? Give it in units of $10^{-3}$ rad/s.`,
          answer: w2, tol: { rel: 0.01 },
          errors: [{ value: w1 * (r1 / r2), feedback: t`It is $r^2\dot\theta$ that stays fixed, not $r\dot\theta$.` }, { value: w1 * (r2 / r1) ** 2, feedback: t`Upside down: farther out, it turns more slowly.` }],
          hints: [t`A central force has $F_\theta = 0$, so $m(r\ddot\theta + 2\dot r\dot\theta) = 0$.`, t`That is $\dfrac{1}{r}\dfrac{d}{dt}\big(r^2\dot\theta\big) = 0$: $r^2\dot\theta$ is constant.`],
          teach: t`For any central force the transverse equation says $\frac{d}{dt}(r^2\dot\theta) = 0$ — angular momentum per unit mass is conserved.`,
          explain: t`$r_1^2\dot\theta_1 = r_2^2\dot\theta_2$, so $\dot\theta_2 = ${w1.toFixed(1)}\times(${r1}/${r2})^2 = ${sci(w2)}\times10^{-3}$ rad/s. This is Kepler's second law in disguise (M1.4).`,
          visual: gpic({
            x: [-r2 * 1.15, r1 * 1.4], y: [-r2 * 0.75, r2 * 0.75], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
            curves: [{ polar: `${r6(p)}/(1 + ${r6(e)}*cos(theta))`, theta: [0, 6.2832], color: 'ink3', width: 1.6 }, { polar: '6371', theta: [0, 6.2832], color: 'accent', width: 2 }],
            points: [{ x: r1, y: 0, color: 'gold', label: 'perigee', labelDx: 6, labelDy: -10 }, { x: -r2, y: 0, color: 'gold', label: 'apogee', labelDx: 6, labelDy: -10 }],
          }, t`The orbit (grey) round Earth (blue), to scale.`, 'An elliptical orbit around Earth with perigee and apogee marked'),
        };
      },
    }),
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Put the steps of deriving the polar acceleration in order.`,
      visual: polarPic({ r: '0.5 + 0.3*t', theta: '0.8*t', T: [0, 6], at: 2.5, show: ['path', 'basis', 'a', 'terms'], scale: { a: 0.6 }, caption: t`Where the derivation ends: the four terms, head to tail, summing to $\vec a$ (orange), for a spiral with steady $\dot r$ and $\dot\theta$.` }),
      items: [
        t`Write the position as $\vec r = r\,\hat r$.`,
        t`Differentiate once: $\vec v = \dot r\,\hat r + r\dot\theta\,\hat\theta$.`,
        t`Differentiate each product in $\vec v$ with the product rule.`,
        t`Replace $\dot{\hat r}$ by $\dot\theta\,\hat\theta$ and $\dot{\hat\theta}$ by $-\dot\theta\,\hat r$.`,
        t`Collect: $(\ddot r - r\dot\theta^2)\,\hat r + (r\ddot\theta + 2\dot r\dot\theta)\,\hat\theta$.`,
      ],
      hints: [t`You need the velocity before you can differentiate it.`, t`The $2\dot r\dot\theta$ comes from two places: $\dot r\,\dot{\hat r}$ and $\dot r\dot\theta\,\hat\theta$ from the product $r\dot\theta\hat\theta$.`],
      teach: t`The derivation is the product rule twice, plus the two rules for the turning unit vectors.`,
      explain: t`$\dot{\vec v} = \ddot r\hat r + \dot r\dot\theta\hat\theta + (\dot r\dot\theta + r\ddot\theta)\hat\theta - r\dot\theta^2\hat r$. One $\dot r\dot\theta$ comes from the turning of $\hat r$, the other from the growth of $r\dot\theta$ — hence the 2.`,
    }),
    num({
      id: 'half-pipe', difficulty: 3,
      gen(r) {
        const R = r.pick([2.0, 3.0, 4.5, 6.0]);
        const T = 2 * Math.PI * Math.sqrt(R / G);
        return {
          prompt: t`A skateboarder (treat as a point, no friction) rolls back and forth near the bottom of a half-pipe whose cross-section is a circle of radius ${R} m. Using polar coordinates centred on the circle's centre, find the period of small oscillations.`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * Math.sqrt(G / R), feedback: t`Upside down: $\omega = \sqrt{g/R}$ and $T = 2\pi/\omega = 2\pi\sqrt{R/g}$.` }, { value: Math.PI * Math.sqrt(R / G), feedback: t`A full period is there and back: $2\pi/\omega$.` }],
          hints: [t`$r = R$ is fixed, so the transverse equation is $mR\ddot\theta = F_\theta$. Gravity's $\hat\theta$-component is $-mg\sin\theta$ ($\theta$ from straight down).`, t`$\ddot\theta = -(g/R)\sin\theta \approx -(g/R)\theta$ for small $\theta$: simple harmonic with $\omega = \sqrt{g/R}$.`],
          teach: t`On a circular track the transverse equation alone gives the motion; it is a pendulum of length $R$, with the normal force playing the string.`,
          explain: t`$mR\ddot\theta = -mg\sin\theta$, so for small angles $\omega = \sqrt{g/R} = ${sci(Math.sqrt(G / R))}$ rad/s and $T = 2\pi\sqrt{R/g} = ${sci(T)}$ s. (The radial equation gives the normal force, $N = mg\cos\theta + mR\dot\theta^2$.)`,
          visual: gpic({
            x: [-1.3, 1.3], y: [-1.15, 0.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: ['cos(t)', 'sin(t)'], t: [3.1416, 6.2832], color: 'ink2', width: 3 }, seg([0, 0], [0, -1], 'ink4', 1, true), seg([0, 0], [Math.sin(0.35), -Math.cos(0.35)], 'ink3', 1.2)],
            points: [{ x: r6(0.93 * Math.sin(0.35)), y: r6(-0.93 * Math.cos(0.35)), color: 'gold', r: 7 }, { x: 0, y: 0, color: 'ink3', r: 3, label: 'centre', labelDx: 6, labelDy: -8 }, lab(0.08, -0.45, 'θ', 'ink2'), lab(-0.55, -0.3, `R = ${R} m`, 'ink3')],
          }, t`The half-pipe's circular cross-section and the skater (gold), a small angle $\theta$ from the bottom. Not to scale.`, 'A circular half-pipe with a skater near the bottom'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-station', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([56, 100, 225]), m = r.pick([70, 80, 90]), rd = r.pick([0.5, 0.8, 1.0]);
        const w = Math.sqrt(G / R), F = 2 * m * rd * w;
        return {
          prompt: t`A space station is a ring of radius ${R} m spinning so that the rim feels $1g$: $\omega = \sqrt{g/R}$. A ${m} kg astronaut climbs a ladder along a spoke, straight toward the hub, at a steady ${rd} m/s along the ladder. Seen from an inertial frame, how hard must the ladder push on her **sideways** (along $\hat\theta$) to keep her on it?`,
          answer: F, units: 'N', tol: { rel: 0.01 },
          errors: [{ value: m * rd * w, feedback: t`The transverse acceleration is $2\dot r\dot\theta$ — don't drop the 2.` }, { value: m * G, feedback: t`That is the radial force at the rim. The question asks for the sideways push along $\hat\theta$.` }],
          hints: [t`On the ladder $\dot\theta = \omega$ (steady) and $\dot r = -${rd}$ m/s (steady): which polar terms survive in $a_\theta$?`, t`$a_\theta = r\ddot\theta + 2\dot r\dot\theta = 2\dot r\omega$, with $\omega = \sqrt{9.8/${R}}$.`],
          teach: t`Moving radially in a rotating system needs a transverse force $2m\dot r\omega$; in the station's own frame it is felt as the Coriolis force.`,
          explain: t`$\omega = \sqrt{9.8/${R}} = ${sci(w)}$ rad/s, so $|F_\theta| = 2m|\dot r|\omega = 2(${m})(${rd})(${sci(w)}) = ${sci(F)}$ N, pushing against the direction of rotation (since $\dot r < 0$). Her transverse speed $r\omega$ must shrink as she climbs in, and the ladder takes it away.`,
          visual: gpic({
            x: [-1.3, 1.3], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
            curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 4 }, seg([0, 0], [1, 0], 'ink3', 2), seg([0, 0], [-0.5, 0.866], 'ink3', 2), seg([0, 0], [-0.5, -0.866], 'ink3', 2), { param: ['0.25*cos(t)', '0.25*sin(t)'], t: [0.3, 1.6], color: 'accent', width: 1.6 }],
            points: [{ x: 0.6, y: 0, color: 'gold', r: 6, label: 'astronaut', labelDx: -10, labelDy: 14 }, { x: 0, y: 0, color: 'ink2', r: 4, label: 'hub', labelDx: -30, labelDy: -10 }, lab(0.18, 0.32, 'ω', 'accent')],
            arrows: [{ from: [0.6, 0], to: [0.32, 0], color: 'good', label: 'climbing', labelDx: -20, labelDy: -12 }, { from: [0.06, 0.24], to: [0.0, 0.25], color: 'accent' }],
          }, t`The station from above (not to scale): the astronaut on a spoke, climbing toward the hub while everything turns anticlockwise.`, 'A ring space station with spokes and an astronaut climbing a spoke'),
        };
      },
    }),
    num({
      id: 'cp-rod-time', difficulty: 3,
      gen(r) {
        const r0 = r.pick([0.05, 0.1, 0.2]), L = r.pick([1.0, 1.5, 2.0]), w = r.pick([2.0, 4.0, 5.0]);
        const T = Math.acosh(L / r0) / w;
        return {
          prompt: t`A bead starts at rest relative to a frictionless rod, $${r0}$ m from its axle; the rod turns in a horizontal plane at a steady ${w.toFixed(1)} rad/s and is ${L} m long. How long until the bead flies off the end?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Math.log(L / r0) / w, feedback: t`Close, but $r = r_0\cosh\omega t$, not $r_0e^{\omega t}$: from rest relative to the rod both exponentials are present.` }],
          hints: [t`The radial equation $\ddot r = \omega^2 r$ with $r(0) = r_0$, $\dot r(0) = 0$ gives $r = r_0\cosh\omega t$.`, t`Solve $\cosh\omega t = L/r_0$: $t = \text{arcosh}(L/r_0)/\omega$.`],
          teach: t`With no radial force, $\ddot r = r\dot\theta^2$: on a steadily turning rod the distance grows like $\cosh\omega t$.`,
          explain: t`$\cosh\omega t = ${L}/${r0} = ${sci(L / r0)}$, so $\omega t = ${sci(Math.acosh(L / r0))}$ and $t = ${sci(T)}$ s.`,
          visual: polarPic({ r: `${r0}*cosh(${w}*t)`, theta: `${w}*t`, T: [0, r6(T)], at: r6(T * 0.6), show: ['path', 'basis', 'rvec'], caption: t`The bead's path in the room as it slides out along the turning rod (the rod is the line from O through the bead). It leaves at the end of the dashed curve.` }),
        };
      },
    }),
    mcq({
      id: 'cp-puck-string', difficulty: 2,
      prompt: t`A puck circles on frictionless ice, tied to a string that runs down through a hole at the centre. You pull the string from below, slowly shortening the radius. Why does the puck's angular velocity $\dot\theta$ increase?`,
      visual: polarPic({ r: '1.6 - 0.18*t', theta: '0.5*t + 0.04*t^2 + 0.004*t^3', T: [0, 6], at: 4, show: ['path', 'basis', 'v', 'rvec'], caption: t`The puck spiralling in as the string shortens; the string pulls along $-\hat r$ only.` }),
      choices: [
        t`The string pulls only along $-\hat r$, so $a_\theta = 0$: $r\ddot\theta = -2\dot r\dot\theta$, and with $\dot r < 0$ that makes $\ddot\theta > 0$`,
        t`The string's pull has a small component along $\hat\theta$ that speeds the puck up`,
        t`The centripetal term $-r\dot\theta^2$ grows, and that pushes the puck faster round`,
        t`$\dot\theta$ increases only because the puck's speed is constant and the circle is smaller`,
      ],
      answer: 0,
      why: {
        1: t`A string through the centre can only pull toward the centre. With no transverse force, the change in $\dot\theta$ must come from the $2\dot r\dot\theta$ term.`,
        2: t`The centripetal term is radial; it cannot change motion along $\hat\theta$. Mixing the two equations is the slip.`,
        3: t`The speed is not constant: the string does work (it pulls inward while the puck moves inward), so the puck speeds up. $r^2\dot\theta$ is what stays fixed.`,
      },
      hints: [t`Which equation governs $\dot\theta$ — the radial or the transverse one? What is $F_\theta$ here?`],
      teach: t`With $F_\theta = 0$, $\frac{d}{dt}(r^2\dot\theta) = 0$: pulling a body inward spins it up.`,
      explain: t`$F_\theta = 0$ gives $r\ddot\theta + 2\dot r\dot\theta = \frac{1}{r}\frac{d}{dt}(r^2\dot\theta) = 0$. As $r$ shrinks, $\dot\theta \propto 1/r^2$ grows — conservation of angular momentum, from the transverse equation.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 1: Newton’s second law in polar coordinates', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 8.01 Classical Mechanics: circular motion and polar coordinates', url: 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/' },
  ],
});
