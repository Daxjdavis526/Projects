// Angular momentum: L = r × p for a particle (about a chosen point), L = Iω
// for a rigid body about a fixed axis, and torque as its rate of change.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { circle, line } from './_spin.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const RPM = (2 * Math.PI) / 60;
const r4 = (v) => +(+v).toFixed(4);

// a disk seen in 3D, turning about the z-axis; `L` adds the angular-momentum arrow
const spinningDisk = ({ L = false, caption, spinArrow = true } = {}) => ({
  type: 'calc-vectors3d',
  params: {
    range: 2, aspect: 'wide', grid: false, yaw: 0.6, pitch: 0.45,
    curves: [{ param: ['1.4cos(t)', '1.4sin(t)', '0'], t: [0, 6.2832], color: 'accent', width: 2.6 }],
    segments: [{ from: [0, 0, -0.9], to: [0, 0, 0.9], color: 'ink3', width: 2.4 }, { from: [0, 0, 0], to: [1.4, 0, 0], color: 'ink3' }, { from: [0, 0, 0], to: [-0.7, 1.21, 0], color: 'ink3' }, { from: [0, 0, 0], to: [-0.7, -1.21, 0], color: 'ink3' }],
    vectors: [
      ...(spinArrow ? [{ from: [1.4, 0, 0], to: [1.4, 0.9, 0], color: 'gold', label: '\\vec v' }, { from: [-1.4, 0, 0], to: [-1.4, -0.9, 0], color: 'gold' }] : []),
      ...(L ? [{ to: [0, 0, 1.9], color: 'bad', label: '\\vec L' }] : []),
    ],
  },
  caption: caption ?? 'A disk turning about a vertical axle; the gold arrows are the velocities of two points on its rim. Drag to rotate the view.',
});

// a top view of a particle moving along a straight line past a point O
function passingPicture({ b, x, v = 1, labels = {}, extraPoints = [], caption, scale = 1 }) {
  const span = Math.max(Math.abs(x) + 1.2 * scale, 2.2 * scale);
  return {
    type: 'graph',
    params: {
      x: [r4(-span), r4(span)], y: [r4(-0.5 * scale), r4(b + 0.9 * scale)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
      alt: 'A particle moving in a straight line past a point O',
      curves: [{ fn: String(r4(b)), color: 'teal', width: 1.4, dash: true }, line([0, 0], [0, b], 'ink3', 1.4, true)],
      arrows: [
        { from: [0, 0], to: [r4(x), r4(b)], color: 'accent', label: labels.r ?? 'r' },
        { from: [r4(x), r4(b)], to: [r4(x - v * 0.9 * scale), r4(b)], color: 'gold', label: labels.v ?? 'v', labelDy: -12 },
      ],
      points: [
        { x: 0, y: 0, color: 'ink', label: labels.O ?? 'O', labelDx: 8, labelDy: 10 },
        { x: r4(x), y: r4(b), color: 'gold', r: 5 },
        { x: 0, y: r4(b / 2), r: 0.01, color: 'ink2', label: labels.b ?? 'r⊥', labelDx: 8 },
        ...extraPoints,
      ],
    },
    caption: caption ?? 'Seen from above. The particle moves left along the dashed line; r⊥ is the perpendicular distance from O to that line.',
  };
}

// Earth's two angular momenta (worked example)
const EARTH = { M: 5.972e24, R: 6.371e6, a: 1.496e11, v: 2.978e4, k: 0.3308, day: 86164 };
EARTH.Lorb = EARTH.M * EARTH.v * EARTH.a;
EARTH.I = EARTH.k * EARTH.M * EARTH.R ** 2;
EARTH.w = (2 * Math.PI) / EARTH.day;
EARTH.Lspin = EARTH.I * EARTH.w;

export default lesson({
  id: 'phys2210.M11.2',
  title: 'Angular momentum',
  minutes: 11, difficulty: 3,
  intro: t`Spin a bicycle wheel and it resists being tilted; a skater spins faster when she pulls in her arms. The quantity behind both is **angular momentum**. For a particle at position $\vec r$ — measured from a point O that you choose — with momentum $\vec p$, and for a rigid body turning about a fixed axis:

$$\vec L = \vec r\times\vec p,\qquad L = p\,r_\perp,\qquad L = I\omega,\qquad \vec\tau_\text{net} = \frac{d\vec L}{dt}$$

Its size is the momentum times the **perpendicular distance from O to the line of motion**, so even a particle moving in a straight line has angular momentum about a point off that line. Net torque changes angular momentum, just as net force changes momentum.`,
  symbols: [
    { tex: '\\vec L', text: 'angular momentum, in kg·m²/s (the same as J·s): a vector along the rotation axis, by the right-hand rule' },
    { tex: '\\vec r', text: 'the particle’s position measured from the chosen point O, in m — so $\\vec L$ depends on that choice' },
    { tex: '\\vec p = m\\vec v', text: 'the momentum: mass times velocity, in kg·m/s' },
    { tex: 'r_\\perp', text: 'the perpendicular distance from O to the line along which the particle moves (the lever arm of its momentum), in m' },
    { tex: 'I', text: 'the moment of inertia about the rotation axis, in kg·m²' },
    { tex: '\\omega', text: 'the angular speed, in rad/s' },
    { tex: '\\vec\\tau_\\text{net}', text: 'the net external torque about O, in N·m' },
  ],
  why: 'Angular momentum is the rotational twin of momentum: when no torque acts it is conserved (next lesson), which sets the spin of pulsars, the shape of orbits and the way every spacecraft turns.',
  visual: {
    type: 'calc-vectors3d',
    title: 'A particle that is not turning still has angular momentum',
    lead: t`A 1 kg particle moves left along the teal line, which passes $r_\perp$ from the point O. Blue is its position $\vec r$, gold its momentum $\vec p$, red their cross product $\vec L = \vec r\times\vec p$. Slide the particle along its line and watch $\vec L$.`,
    tasks: [
      'Slide the particle from right to left: r and the angle between r and p both change, but L stays exactly the same — its size is p r⊥.',
      'Set r⊥ to 0: a particle heading straight through O has no angular momentum about O.',
      'Double p: L doubles. Drag the picture to see that L stands perpendicular to both r and p.',
    ],
    params: {
      range: 2.6, aspect: 'wide', yaw: 0.35, pitch: 0.5,
      sliders: [
        { key: 'x', label: 'Position along the line, $x$', min: -2.4, max: 2.4, step: 0.05, value: 1.6, unit: '\\mathrm{m}', explain: 'The particle moves toward smaller $x$.' },
        { key: 'b', label: 'Distance of the line from O, $r_\\perp$', min: 0, max: 2, step: 0.05, value: 1.2, unit: '\\mathrm{m}', explain: 'The perpendicular distance — the lever arm of the momentum.' },
        { key: 'p', label: 'Momentum $p$', min: 0.4, max: 2, step: 0.1, value: 1, unit: '\\mathrm{kg\\,m/s}', explain: 'Mass times speed.' },
      ],
      lines: [{ point: [0, 'b', 0], dir: [1, 0, 0], t: [-2.6, 2.6], color: 'teal', width: 1.4 }],
      segments: [{ from: [0, 0, 0], to: [0, 'b', 0], color: 'ink3', dash: true }],
      vectors: [
        { to: ['x', 'b', 0], color: 'accent', label: '\\vec r' },
        { from: ['x', 'b', 0], to: ['x - p', 'b', 0], color: 'gold', label: '\\vec p' },
        { to: [0, 0, 'b*p'], color: 'bad', label: '\\vec L' },
      ],
      points: [{ at: [0, 0, 0], color: 'ink2', r: 4, label: 'O' }],
      readouts: [
        { label: '$|\\vec r|$', expr: 'sqrt(x^2 + b^2)', unit: '\\mathrm{m}' },
        { label: 'angle $\\phi$ from $\\vec r$ to $\\vec p$', expr: '180/pi*acos(-x/sqrt(x^2 + b^2))', unit: '^\\circ' },
        { label: '$|\\vec L| = rp\\sin\\phi$', expr: 'sqrt(x^2 + b^2)*p*sin(acos(-x/sqrt(x^2 + b^2)))', unit: '\\mathrm{kg\\,m^2/s}' },
      ],
    },
    caption: 'Arrows to scale in SI units: metres, kg·m/s and kg·m²/s share the axes’ unit. Drag to rotate the view.',
  },
  example: {
    prompt: t`Earth has two angular momenta: one from its orbit around the Sun, one from its daily spin. Compare their sizes. Data: $M = 5.972\times10^{24}$ kg; orbital radius $1.496\times10^{11}$ m at $29.78$ km/s; radius $R = 6.371\times10^{6}$ m; one turn every $86\,164$ s; moment of inertia $I = 0.3308\,MR^2$.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 2.6, aspect: 'wide', grid: false, axes: false, yaw: 0.9, pitch: 0.35,
        curves: [{ param: ['2.2cos(t)', '2.2sin(t)', '0'], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }],
        points: [{ at: [0, 0, 0], color: 'gold', r: 7, label: '\\text{Sun}' }, { at: [2.2, 0, 0], color: 'teal', r: 5 }],
        vectors: [
          { to: [2.2, 0, 0], color: 'accent', label: '\\vec r' },
          { from: [2.2, 0, 0], to: [2.2, 1.1, 0], color: 'gold', label: '\\vec v' },
          { to: [0, 0, 1.9], color: 'bad', label: '\\vec L_\\text{orbit}' },
          { from: [2.2, 0, 0], to: [2.2 + 0.9 * Math.sin(0.409), 0, 0.9 * Math.cos(0.409)], color: 'violet', label: '\\vec L_\\text{spin}' },
        ],
      },
      caption: 'Directions only, nothing to scale: Earth’s orbital angular momentum is millions of times its spin angular momentum. The spin axis is tilted 23.4° from the orbit’s.',
    },
    steps: [
      { label: 'The orbit: Earth as a particle', text: t`Seen from the Sun, Earth is a point mass moving almost in a circle, so $\vec v$ is perpendicular to $\vec r$ and $r_\perp = r$: $L_\text{orbit} = Mvr = (5.972\times10^{24})(2.978\times10^{4})(1.496\times10^{11}) = ${tex(EARTH.Lorb)}\ \text{kg·m}^2/\text{s}$.` },
      { label: 'The spin: Earth as a rigid body', text: t`$I = 0.3308MR^2 = ${tex(EARTH.I)}\ \text{kg·m}^2$ and $\omega = 2\pi/86\,164\ \text{s} = ${tex(EARTH.w)}$ rad/s, so $L_\text{spin} = I\omega = ${tex(EARTH.Lspin)}\ \text{kg·m}^2/\text{s}$.` },
      { label: 'Compare', text: t`$L_\text{orbit}/L_\text{spin} = ${tex(EARTH.Lorb / EARTH.Lspin, 2)}$. The orbit carries millions of times more, because Earth's distance from the Sun is so much larger than its own radius.` },
      { label: 'Sense check', text: t`Units: $\text{kg}\cdot\text{m/s}\cdot\text{m} = \text{kg·m}^2/\text{s}$ for both. And $0.3308 < 0.4$, the value for a uniform ball: Earth's dense iron core sits near the axis.` },
    ],
    answer: t`$L_\text{orbit} \approx ${tex(EARTH.Lorb)}$ and $L_\text{spin} \approx ${tex(EARTH.Lspin)}\ \text{kg·m}^2/\text{s}$ — about ${(Math.round(EARTH.Lorb / EARTH.Lspin / 1e5) / 10).toFixed(1)} million times smaller.`,
  },
  practice: [
    num({
      id: 'circle-L', difficulty: 1,
      gen(r) {
        const m = r.pick([0.1, 0.15, 0.2, 0.25]), R = r.pick([0.6, 0.8, 1.2, 1.5]), v = r.pick([3, 4, 5, 6]);
        const L = m * v * R;
        return {
          prompt: t`A ${m} kg ball on a string is whirled in a horizontal circle of radius ${R} m at ${v} m/s. What is its angular momentum about the centre of the circle?`,
          answer: L, units: 'kg m^2/s', tol: { rel: 0.01 },
          errors: [{ value: m * v, feedback: t`That is the momentum $p = mv$. Angular momentum multiplies it by the lever arm: $L = p\,r_\perp$.` }, { value: m * v * R * R, feedback: t`Only one factor of $r$: $L = mvr$. ($I\omega = mr^2\cdot v/r$ gives the same.)` }],
          hints: [t`In a circle the velocity is perpendicular to the radius, so $r_\perp = r$ and $L = mvr$.`],
          teach: 'For circular motion about the centre, L = mvr; the same as Iω with I = mr² and ω = v/r.',
          explain: t`$L = mvr = (${m})(${v})(${R}) = ${s3(L)}\ \text{kg·m}^2/\text{s}$, pointing along the axis of the circle.`,
          visual: {
            type: 'graph',
            params: {
              x: [r4(-1.7 * R), r4(1.9 * R)], y: [r4(-1.25 * R), r4(1.25 * R)], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
              curves: [circle(0, 0, R, 'ink3', 1.6)],
              arrows: [{ from: [0, 0], to: [R, 0], color: 'accent', label: `r = ${R} m` }, { from: [R, 0], to: [R, r4(0.75 * R)], color: 'gold', label: `${v} m/s` }],
              points: [{ x: 0, y: 0, color: 'ink2', r: 3 }, { x: R, y: 0, color: 'gold', r: 5.5 }],
            },
            caption: 'Seen from above, to scale.',
          },
        };
      },
    }),
    num({
      id: 'straight-line', difficulty: 2,
      gen(r) {
        const m = r.pick([900, 1200, 1500]), v = r.pick([15, 20, 25]), b = r.pick([30, 40, 50]);
        const [fx, fd] = r.pick([[0.75, 1.25], [4 / 3, 5 / 3], [2.4, 2.6]]);
        const x = fx * b, d = fd * b, L = m * v * b;
        return {
          prompt: t`A ${m} kg car drives along a straight road at ${v} m/s. The road passes ${b} m from a tree (its closest approach); right now the car is ${s3(d)} m from the tree. What is the car's angular momentum about the tree?`,
          answer: L, units: 'kg m^2/s', tol: { rel: 0.01 },
          errors: [{ value: m * v * d, feedback: t`The lever arm is the perpendicular distance from the tree to the road, ${b} m — not the car's current distance.` }],
          hints: [t`$L = p\,r_\perp$, where $r_\perp$ is the perpendicular distance from the point to the line of motion.`, t`$r_\perp = ${b}$ m, whatever the car's position along the road.`],
          teach: 'A body moving in a straight line has angular momentum p r⊥ about any point off its line — and it does not change as the body moves.',
          explain: t`$L = mv\,r_\perp = (${m})(${v})(${b}) = ${tex(L)}\ \text{kg·m}^2/\text{s}$. Equivalently $rp\sin\phi$ with $r = ${s3(d)}$ m and $\sin\phi = ${b}/${s3(d)}$.`,
          visual: passingPicture({ b, x, scale: b, v: 1.2, labels: { O: 'tree', r: `${s3(d)} m`, b: `${b} m`, v: `${v} m/s` }, caption: 'Seen from above, to scale: the car moves left along the road (dashed).' }),
        };
      },
    }),
    mcq({
      id: 'direction', difficulty: 2,
      prompt: 'A disk turns about a vertical axle, anticlockwise as seen from above. Which way does its angular momentum point?',
      choices: ['Straight up, along the axle', 'Straight down, along the axle', 'Horizontally, along the velocity of the rim', 'Nowhere: angular momentum has a size but no direction'],
      answer: 0,
      why: {
        1: 'Down would be a clockwise turn seen from above. Curl the fingers of your right hand the way the disk turns: your thumb points up.',
        2: 'Every rim point moves horizontally, but in a different direction; each one’s r × p points up, and so does their sum.',
        3: 'Angular momentum is a vector, pointing along the rotation axis by the right-hand rule.',
      },
      hints: ['Use the right-hand rule: curl your fingers in the direction of rotation.', t`Or take one rim point: $\vec r$ points outward, $\vec v$ along the rim. Which way does $\vec r\times\vec v$ point?`],
      teach: 'The angular momentum of a spinning body points along its axis, given by the right-hand rule.',
      explain: t`Curl the fingers of your right hand anticlockwise (seen from above) and your thumb points up. For each bit of the rim, $\vec r$ (outward) $\times\ \vec v$ (along the rim) points up too.`,
      visual: spinningDisk(),
    }),
    num({
      id: 'flywheel', difficulty: 2,
      gen(r) {
        const M = r.pick([3, 4, 5, 6]), R = r.pick([0.1, 0.125, 0.15]), n = r.pick([3000, 4500, 6000]);
        const I = 0.5 * M * R * R, w = n * RPM, L = I * w;
        return {
          prompt: t`A spacecraft's reaction wheel is a solid disk ($I = \tfrac12 MR^2$) of mass ${M} kg and radius ${R} m spinning at ${n.toLocaleString('en-US')} rpm. What is its angular momentum?`,
          answer: L, units: 'kg m^2/s', tol: { rel: 0.01 },
          errors: [{ value: 2 * L, feedback: t`A solid disk has $I = \tfrac12 MR^2$ — you used $MR^2$.` }, { value: I * n, feedback: 'Convert rpm to rad/s: multiply by 2π/60.' }, { value: L / (2 * Math.PI), feedback: 'That uses revolutions per second. Angular speed must be in radians per second: one revolution is 2π rad.' }],
          hints: [t`$\omega = ${n}\times\dfrac{2\pi}{60}$ rad/s.`, t`$L = I\omega = \tfrac12 MR^2\omega$.`],
          teach: 'For a body spinning about a fixed axis, L = Iω, with ω in radians per second.',
          explain: t`$I = \tfrac12(${M})(${R})^2 = ${s3(I)}\ \text{kg·m}^2$, $\omega = ${s3(w)}$ rad/s, so $L = ${s3(L)}\ \text{kg·m}^2/\text{s}$. Speeding the wheel up or slowing it down makes the spacecraft turn the other way.`,
          visual: spinningDisk({ L: true, caption: 'The reaction wheel and its angular momentum, along the axle. Drag to rotate the view; arrows not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'straight-not-zero', difficulty: 2,
      prompt: 'A puck slides in a straight line at constant velocity across frictionless ice. About a point O that is not on its line of motion, its angular momentum is:',
      choices: ['Constant, and not zero', 'Zero, because the puck is not rotating', 'Growing, because the puck gets farther from O', 'Constant in size but flipping direction as the puck passes O'],
      answer: 0,
      why: {
        1: 'Angular momentum about a point does not need any turning: L = p r⊥ is not zero when the line of motion misses O.',
        2: 'Its distance r grows, but the angle between r and p shrinks: r sin φ = r⊥ stays the same.',
        3: 'The puck goes round O in the same sense all the time — r × p keeps one direction.',
      },
      hints: [t`Write $L = rp\sin\phi$. What does $r\sin\phi$ equal for every point on a straight line?`],
      teach: 'Angular momentum depends on the chosen point; for straight-line motion it is p r⊥, constant and non-zero about any point off the line.',
      explain: t`No force acts, so no torque about O acts either, and $\vec L$ cannot change. Its size is $p\,r_\perp$, the same at every point of the path — the earliest form of Kepler's second law: a free body sweeps out equal areas about any point in equal times.`,
      visual: passingPicture({ b: 1.2, x: 1.5, labels: { r: 'r', v: 'p' }, extraPoints: [2.6, 0.4, -0.7, -1.8].map((px) => ({ x: px, y: 1.2, r: 3.5, color: 'ink3' })), caption: 'Seen from above: the puck’s positions at equal time intervals (grey dots) along its straight path.' }),
    }),
    num({
      id: 'torque-spinup', difficulty: 2,
      gen(r) {
        const I = r.pick([0.015, 0.02, 0.03]), n = r.pick([3000, 4000, 6000]), T = r.pick([20, 30, 60]);
        const L = I * n * RPM, tau = L / T;
        return {
          prompt: t`A motor spins a reaction wheel ($I = ${I}\ \text{kg·m}^2$) up from rest to ${n.toLocaleString('en-US')} rpm in ${T} s with a constant torque. How large is that torque?`,
          answer: tau, units: 'N m', tol: { rel: 0.01 },
          errors: [{ value: (I * n) / T, feedback: 'Convert rpm to rad/s (× 2π/60) before using L = Iω.' }, { value: L * T, feedback: t`Torque is the **rate** of change of angular momentum: divide $\Delta L$ by the time.` }],
          hints: [t`$\tau = \Delta L/\Delta t$, and the wheel starts with $L = 0$.`, t`Final $L = I\omega$ with $\omega = ${n}\times 2\pi/60$ rad/s.`],
          teach: 'Torque is the rate of change of angular momentum: a constant torque τ adds τΔt of angular momentum.',
          explain: t`$L = I\omega = (${I})(${s3(n * RPM)}) = ${s3(L)}\ \text{kg·m}^2/\text{s}$, so $\tau = L/\Delta t = ${s3(L)}/${T} = ${s3(tau)}$ N·m. By the third law the wheel pushes back on the spacecraft with the opposite torque.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, T * 1.15], y: [0, r4(L * 1.25)], xlabel: 'time (s)', ylabel: 'wheel’s L (kg·m²/s)', aspect: 'wide',
              curves: [{ fn: `${r4(L / T)}*x`, domain: [0, T], color: 'accent' }, { fn: String(r4(L)), domain: [T, T * 1.15], color: 'accent' }],
              points: [{ x: T, y: r4(L), color: 'gold', label: `${n} rpm reached` }],
            },
            caption: 'The wheel’s angular momentum climbs at a steady rate while the torque acts. The slope of this graph is the torque.',
          },
        };
      },
    }),
    num({
      id: 'components', difficulty: 3,
      gen(r) {
        let x, y, px, py, Lz;
        do { x = r.int(1, 4); y = r.int(1, 3); px = r.intExcept(-3, 3, [0]); py = r.intExcept(-3, 3, [0]); Lz = x * py - y * px; } while (Lz === 0);
        const errs = [{ value: x * py + y * px, feedback: t`Watch the sign: $L_z = xp_y - yp_x$, a difference.` }];
        if (x * px + y * py !== Lz) errs.push({ value: x * px + y * py, feedback: 'That is the dot product r · p, a scalar. The cross product’s z-component is x p_y − y p_x.' });
        return {
          prompt: t`A particle at $\vec r = (${x},\ ${y},\ 0)$ m has momentum $\vec p = (${px},\ ${py},\ 0)$ kg·m/s. What is the $z$-component of its angular momentum about the origin, $L_z$? (A negative answer means $\vec L$ points down.)`,
          answer: Lz, units: 'kg m^2/s', tol: { rel: 1e-6, abs: 0.01 },
          errors: errs,
          hints: [t`$\vec L = \vec r\times\vec p$. With both vectors in the $xy$-plane, only $L_z$ survives.`, t`$L_z = x\,p_y - y\,p_x$.`, t`$L_z = (${x})(${py}) - (${y})(${px})$.`],
          teach: 'For motion in the xy-plane, L = r × p points along z, with L_z = x p_y − y p_x.',
          explain: t`$L_z = (${x})(${py}) - (${y})(${px}) = ${Lz}\ \text{kg·m}^2/\text{s}$: ${Lz > 0 ? 'positive, so the particle is going round the origin anticlockwise seen from above' : 'negative, so the particle is going round the origin clockwise seen from above'}.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 4, aspect: 'wide', yaw: 0.25, pitch: 0.9,
              vectors: [{ to: [x, y, 0], color: 'accent', label: '\\vec r' }, { from: [x, y, 0], to: [r4(x + 0.6 * px), r4(y + 0.6 * py), 0], color: 'gold', label: '\\vec p' }],
              points: [{ at: [0, 0, 0], color: 'ink2', r: 4 }],
            },
            caption: 'Position (blue, to scale in m) and momentum (gold, drawn at 0.6 m per kg·m/s, from the particle). Drag to rotate the view.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-iss', difficulty: 2, transfer: true,
      prompt: t`The International Space Station (mass about $420\,000$ kg) circles Earth at 7.66 km/s, 6791 km from Earth's centre. What is its orbital angular momentum about Earth's centre?`,
      answer: 4.2e5 * 7660 * 6.791e6, units: 'kg m^2/s', tol: { rel: 0.01 },
      errors: [{ value: 4.2e5 * 7660 * 4.2e5, feedback: 'Use the distance from Earth’s centre (6791 km), not the height above the ground.' }],
      hints: [t`A circular orbit: $\vec v \perp \vec r$, so $L = mvr$ with everything in SI units.`],
      teach: 'An orbiting body has angular momentum mvr about the planet’s centre — and gravity, pulling straight toward that centre, cannot change it.',
      explain: t`$L = mvr = (4.2\times10^{5})(7660)(6.791\times10^{6}) = ${tex(4.2e5 * 7660 * 6.791e6)}\ \text{kg·m}^2/\text{s}$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-9e6, 9e6], y: [-7.6e6, 7.6e6], equal: true, xlabel: '', ylabel: '', axes: false, grid: false, aspect: 'wide',
          curves: [circle(0, 0, 6.371e6, 'teal', 2), circle(0, 0, 6.791e6, 'ink3', 1.4, { dash: true })],
          arrows: [{ from: [0, 0], to: [6.791e6, 0], color: 'accent', label: 'r' }, { from: [6.791e6, 0], to: [6.791e6, 4.2e6], color: 'gold', label: 'v' }],
          points: [{ x: 6.791e6, y: 0, color: 'gold', r: 5, label: 'ISS', labelDy: 14 }, { x: 0, y: 0, color: 'ink3', r: 3 }],
        },
        caption: 'Earth and the station’s orbit to scale, seen from above the orbit; the velocity arrow is not to scale.',
      },
    }),
    num({
      id: 'cp-roundabout', difficulty: 2,
      gen(r) {
        const M = r.pick([120, 150, 180]), R = r.pick([1.2, 1.5, 1.8]), w = r.pick([0.6, 0.8, 1.2]);
        const L = 0.5 * M * R * R * w;
        return {
          prompt: t`A playground roundabout is a uniform disk ($I = \tfrac12 MR^2$) of mass ${M} kg and radius ${R} m, turning at ${w} rad/s. What is its angular momentum?`,
          answer: L, units: 'kg m^2/s', tol: { rel: 0.01 },
          hints: [t`$L = I\omega = \tfrac12 MR^2\omega$.`],
          teach: 'A rigid body turning about a fixed axis has L = Iω.',
          explain: t`$L = \tfrac12(${M})(${R})^2(${w}) = ${s3(L)}\ \text{kg·m}^2/\text{s}$.`,
          visual: spinningDisk({ caption: 'The roundabout turning about its vertical axle; the gold arrows are rim velocities. Drag to rotate the view.' }),
        };
      },
    }),
    mcq({
      id: 'cp-origin', difficulty: 2,
      prompt: 'A puck slides east at constant velocity along the line y = 2 m. About which of these points is its angular momentum zero?',
      choices: ['P = (5, 2) m, on its line of motion', 'Q = (0, 0) m, the origin', 'R = (5, 0) m, directly beside its path', 'S = (0, 4) m, on the other side of its path'],
      answer: 0,
      why: {
        1: 'The line y = 2 m passes 2 m from the origin, so L = p × (2 m), not zero.',
        2: 'R is 2 m from the line of motion: L = p × (2 m) about R too.',
        3: 'S is also 2 m from the line. L there has the same size, pointing the opposite way — not zero.',
      },
      hints: ['L = p r⊥. For which point is the perpendicular distance to the puck’s line zero?'],
      teach: 'Angular momentum depends on the point it is measured from; about any point on the line of motion it is zero.',
      explain: t`About P, $\vec r$ is always parallel (or antiparallel) to $\vec p$, so $\vec r\times\vec p = 0$. About the other three points the line passes 2 m away, giving $|\vec L| = p\times(2\ \text{m})$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.5, 8], y: [-1, 5], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', aspect: 'wide',
          curves: [{ fn: '2', color: 'teal', width: 1.4, dash: true }],
          arrows: [{ from: [1.4, 2], to: [3, 2], color: 'gold', label: 'v' }],
          points: [{ x: 1.4, y: 2, color: 'gold', r: 6 }, { x: 5, y: 2, color: 'accent', label: 'P' }, { x: 0, y: 0, color: 'accent', label: 'Q' }, { x: 5, y: 0, color: 'accent', label: 'R' }, { x: 0, y: 4, color: 'accent', label: 'S' }],
        },
        caption: 'The puck’s straight path (dashed) and four candidate points, seen from above.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §11.2 Angular Momentum', url: 'https://openstax.org/books/university-physics-volume-1/pages/11-2-angular-momentum' },
    { label: 'NASA Earth Fact Sheet (mass, orbit, moment of inertia factor 0.3308)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
  ],
});
