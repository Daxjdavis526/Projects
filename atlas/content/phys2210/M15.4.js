// SHM and uniform circular motion: the shadow of a point moving round a
// circle at constant speed is simple harmonic motion — ω is its angular
// speed, the phase is its angle, and Aω and Aω² are its speed and centripetal
// acceleration.
import { lesson, mcq, num } from '../../src/core/content.js';
import { s3, tn } from './_osc.js';

const t = String.raw;
const TAU = 2 * Math.PI;
const r4 = (v) => +(+v).toFixed(4);

/**
 * The reference circle as a static picture: radius A (drawn as 1), the x-axis, the point P at
 * `deg` degrees and its shadow. Options: ghost [{ deg, label }], vel (P's velocity and the
 * shadow's), arc (the angle from +x), shadowAt (a shadow with no P: { x, dir, label }).
 */
function refCircle({ deg = 30, P = true, ghost = [], vel = false, arc = false, shadowAt = null, caption } = {}) {
  const th = (deg * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  const curves = [
    { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 },
    { param: ['t', '0'], t: [-1.45, 1.45], color: 'ink4', width: 1.2 },
  ];
  const points = [{ x: 0, y: 0, color: 'ink3', r: 3 }, { x: -1.45, y: 0.13, r: 0.01, color: 'ink3', label: '−A', labelDx: 0, labelDy: 0 }, { x: 1.08, y: 0.13, r: 0.01, color: 'ink3', label: 'A', labelDx: 0, labelDy: 0 }];
  const arrows = [];
  if (P) {
    curves.push({ param: [`${r4(c)}*t`, `${r4(s)}*t`], t: [0, 1], color: 'ink4', width: 1.2 });
    curves.push({ param: [String(r4(c)), `${r4(s)}*t`], t: [0, 1], color: 'gold', width: 1.2, dash: true });
    points.push({ x: r4(c), y: r4(s), color: 'accent', r: 6, label: 'P' }, { x: r4(c), y: 0, color: 'gold', r: 5, label: 'shadow', labelDy: 14 });
    if (vel) {
      arrows.push({ from: [r4(c), r4(s)], to: [r4(c - 0.55 * s), r4(s + 0.55 * c)], color: 'accent' }, { from: [r4(c), 0], to: [r4(c - 0.55 * s), 0], color: 'good' });
    }
  }
  if (arc) curves.push({ param: ['0.3*cos(t)', '0.3*sin(t)'], t: [0, r4(th)], color: 'gold', width: 1.6 });
  for (const g of ghost) {
    const gt = (g.deg * Math.PI) / 180;
    points.push({ x: r4(Math.cos(gt)), y: r4(Math.sin(gt)), color: 'violet', r: 5, label: g.label });
    curves.push({ param: [String(r4(Math.cos(gt))), `${r4(Math.sin(gt))}*t`], t: [0, 1], color: 'violet', width: 1.1, dash: true });
  }
  if (shadowAt) {
    points.push({ x: r4(shadowAt.x), y: 0, color: 'gold', r: 5, label: shadowAt.label ?? 'shadow at t = 0', labelDy: 14 });
    arrows.push({ from: [r4(shadowAt.x), 0.08], to: [r4(shadowAt.x + 0.45 * shadowAt.dir), 0.08], color: 'good' });
  }
  return {
    type: 'graph',
    params: { aspect: 'wide', x: [-2.3, 2.3], y: [-1.25, 1.25], equal: true, xlabel: '', ylabel: '', axes: false, grid: false, curves, points, arrows },
    caption: caption ?? 'The reference circle: P goes round counter-clockwise at constant speed; its shadow on the x-axis is the oscillator. Radius A drawn as 1.',
  };
}

export default lesson({
  id: 'phys2210.M15.4',
  title: 'SHM and uniform circular motion',
  minutes: 9, difficulty: 2,
  intro: t`Picture a point P going round a circle of radius $A$ at constant angular speed $\omega$, counter-clockwise, starting at angle $\phi$. At time $t$ its angle is $\omega t + \phi$, so its shadow on the $x$-axis is at

$$x = A\cos(\omega t + \phi)$$

— exactly simple harmonic motion. The **reference circle** turns every SHM quantity into geometry: the angular frequency is P’s angular speed, the phase $\omega t + \phi$ is P’s angle, the shadow’s velocity is the $x$-part of P’s velocity (size $A\omega$), and its acceleration is the $x$-part of P’s centripetal acceleration $A\omega^2$, which points at the centre — so $a = -\omega^2 x$.`,
  symbols: [
    { tex: 'A', text: 'the circle’s radius: the oscillation’s amplitude, in m' },
    { tex: '\\omega', text: 'P’s angular speed, in rad/s: the oscillation’s angular frequency, $2\\pi/T$' },
    { tex: '\\omega t + \\phi', text: 'P’s angle from the $+x$ axis at time $t$: the phase of the oscillation, in rad' },
    { tex: '\\phi', text: 'P’s angle at $t = 0$: the phase constant' },
    { tex: 'A\\omega,\\ A\\omega^2', text: 'P’s speed and centripetal acceleration: the shadow’s greatest speed and greatest acceleration' },
  ],
  why: 'The reference circle turns trigonometry into pictures — the start of phasors, which electrical engineers use for every AC circuit — and it is literally what Galileo saw: Jupiter’s moons, orbiting in circles seen edge-on, slide back and forth in simple harmonic motion.',
  visual: {
    type: 'calc-polar',
    title: 'A shadow that oscillates',
    lead: t`P goes round the circle at constant speed. Below, its shadow on the $x$-axis is traced against time, which runs **downward**. Press **Play**, or drag the time slider.`,
    tasks: [
      'Watch the shadow: fastest as it crosses the middle, slowest at the ends — though P never changes speed.',
      'Compare the arrows: the shadow’s velocity (green) is just the horizontal part of P’s velocity (blue).',
      'Change φ: the whole trace slides along in time — the phase constant only sets where P starts.',
    ],
    params: {
      x: [-2.6, 2.6], y: [-3.95, 1.3], grid: 'none', aspect: '',
      sliders: [
        { key: 'tau', label: 'Time $t/T$', min: 0, max: 1, step: 0.005, value: 0.08, unit: '', explain: 'Time as a fraction of one period; Play runs it round.' },
        { key: 'phi', label: 'Phase constant $\\phi$', min: -180, max: 180, step: 5, value: 0, unit: '^\\circ', explain: 'P’s angle at $t = 0$.' },
      ],
      // Play drives the time slider (no orbit is drawn: the Kepler option is used only for its clock)
      kepler: { e: 0, p: 1, at: 'tau', play: true, period: 8, when: '0' },
      curves: [
        { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 },
        { param: ['t', '0'], t: [-1.5, 1.5], color: 'ink4', width: 1.2 },
        { param: ['cos(2*pi*t + phi*pi/180)', '-1.3 - 2.5*t'], t: [0, 1], color: 'ink4', width: 1.4, dash: true },
        { param: ['cos(2*pi*t + phi*pi/180)', '-1.3 - 2.5*t'], t: [0, 'tau'], color: 'gold', width: 2.6 },
      ],
      segments: [
        { from: [0, 0], to: ['cos(2*pi*tau + phi*pi/180)', 'sin(2*pi*tau + phi*pi/180)'], color: 'ink3', width: 1.2 },
        { from: ['cos(2*pi*tau + phi*pi/180)', 'sin(2*pi*tau + phi*pi/180)'], to: ['cos(2*pi*tau + phi*pi/180)', '-1.3 - 2.5*tau'], color: 'gold', width: 1, dash: true },
        { from: [-1.6, -1.3], to: [-1.45, -1.3], color: 'ink3' }, { from: [-1.6, -2.55], to: [-1.45, -2.55], color: 'ink3' }, { from: [-1.6, -3.8], to: [-1.45, -3.8], color: 'ink3' },
      ],
      arrows: [
        { from: ['cos(2*pi*tau + phi*pi/180)', 'sin(2*pi*tau + phi*pi/180)'], to: ['cos(2*pi*tau + phi*pi/180) - 0.55*sin(2*pi*tau + phi*pi/180)', 'sin(2*pi*tau + phi*pi/180) + 0.55*cos(2*pi*tau + phi*pi/180)'], color: 'accent' },
        { from: ['cos(2*pi*tau + phi*pi/180)', 0], to: ['cos(2*pi*tau + phi*pi/180) - 0.55*sin(2*pi*tau + phi*pi/180)', 0], color: 'good' },
      ],
      points: [
        { x: 'cos(2*pi*tau + phi*pi/180)', y: 'sin(2*pi*tau + phi*pi/180)', color: 'accent', label: 'P' },
        { x: 'cos(2*pi*tau + phi*pi/180)', y: 0, color: 'gold', label: 'shadow' },
        { x: 'cos(2*pi*tau + phi*pi/180)', y: '-1.3 - 2.5*tau', color: 'gold' },
      ],
      texts: [
        { text: 't = 0', x: -1.7, y: -1.3, color: 'ink3', align: 'right' }, { text: 'T/2', x: -1.7, y: -2.55, color: 'ink3', align: 'right' }, { text: 'T', x: -1.7, y: -3.8, color: 'ink3', align: 'right' },
        { text: 'time ↓', x: 1.6, y: -1.3, color: 'ink3' }, { text: 'x = A cos(ωt + φ)', x: 1.15, y: -2.2, color: 'gold' },
      ],
      readouts: [
        { label: 'angle $\\omega t + \\phi$', expr: '(360*tau + phi + 720) - 360*floor((360*tau + phi + 720)/360)', unit: '^\\circ', digits: 3 },
        { label: '$x/A$', expr: 'cos(2*pi*tau + phi*pi/180)', digits: 3 },
        { label: '$v/(A\\omega)$', expr: '-sin(2*pi*tau + phi*pi/180)', digits: 3 },
        { label: '$a/(A\\omega^2)$', expr: '-cos(2*pi*tau + phi*pi/180)', digits: 3 },
      ],
    },
    caption: 'One unit of length is the amplitude A; one turn of P is one period T. Arrows show P’s velocity (blue) and the shadow’s (green), on the same scale.',
  },
  example: {
    prompt: t`A peg on the rim of a wheel of radius $0.30$ m turns at a steady $2.0$ revolutions per second. A lamp far away casts its shadow on a wall, where it moves back and forth. Find the shadow’s amplitude, period, angular frequency, greatest speed and greatest acceleration — and the time it takes to go from one end to halfway back to the centre.`,
    visual: refCircle({ deg: 0, ghost: [{ deg: 60, label: 'P a little later' }], arc: false, caption: 'The peg at P (on the x-axis, shadow at x = A) and a moment later at 60°, when its shadow has moved to x = A/2. Radius drawn as 1.' }),
    steps: [
      { label: 'Amplitude and period', text: t`The shadow swings between $\pm0.30$ m, so $A = 0.30$ m; one turn takes $T = 1/2.0 = 0.50$ s.` },
      { label: 'Angular frequency', text: t`$\omega = 2\pi f = 2\pi(2.0) = 12.6$ rad/s — the wheel’s angular speed.` },
      { label: 'Greatest speed', text: t`At the centre the shadow moves with the whole of the peg’s speed: $v_\text{max} = A\omega = (0.30)(12.6) = 3.8$ m/s.` },
      { label: 'Greatest acceleration', text: t`At the ends the shadow’s acceleration is the peg’s whole centripetal acceleration: $a_\text{max} = A\omega^2 = (0.30)(12.6)^2 = 47$ m/s².` },
      { label: 'End to halfway', text: t`$x = A/2$ when $\cos\theta = \tfrac12$, at $\theta = 60^\circ$: one sixth of a turn, so $t = T/6 = 0.083$ s — not $T/8$: the shadow is slow near the end.` },
    ],
    answer: t`$A = 0.30$ m, $T = 0.50$ s, $\omega = 12.6$ rad/s, $v_\text{max} = 3.8$ m/s, $a_\text{max} = 47\ \text{m/s}^2$; end to halfway takes $T/6 = 0.083$ s.`,
  },
  practice: [
    mcq({
      id: 'top', difficulty: 1,
      prompt: t`At $t = 0$ the reference point P is at the top of its circle (angle $90^\circ$), going counter-clockwise. Where is the shadow, and which way is it moving?`,
      choices: [t`At $x = 0$, moving in the $-x$ direction`, t`At $x = 0$, moving in the $+x$ direction`, t`At $x = A$, at rest`, t`At $x = 0$, at rest`],
      answer: 0,
      why: {
        1: 'At the top, P moves to the left (counter-clockwise), and the shadow moves with P’s horizontal motion.',
        2: 'At the top, P is directly above the centre, so the shadow is at x = 0.',
        3: 'At the top, all of P’s velocity is horizontal: the shadow is moving at its fastest.',
      },
      hints: ['Drop a line from the top of the circle to the x-axis.', 'Which way does a counter-clockwise point move at the top?'],
      teach: 'P’s angle is the phase: at 90° the shadow is at the centre, moving at full speed.',
      explain: t`$x = A\cos90^\circ = 0$ and $v = -A\omega\sin90^\circ = -A\omega$: through the centre at top speed, heading in $-x$.`,
      visual: refCircle({ deg: 90, caption: 'P at the top of the reference circle (counter-clockwise). Radius A drawn as 1.' }),
    }),
    num({
      id: 'turntable', difficulty: 1,
      gen(r) {
        const R = r.pick([0.1, 0.15, 0.2]), rpm = r.pick([33, 45, 78]);
        const w = (TAU * rpm) / 60, v = R * w;
        return {
          prompt: t`A peg ${tn(R * 100)} cm from the centre of a turntable spinning at ${rpm} rpm casts a shadow that moves back and forth on a wall. What is the shadow’s greatest speed?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: (R * rpm) / 60, feedback: t`Convert revolutions to radians: $\omega = 2\pi\times$ (revolutions per second).` }, { value: R * w * w, feedback: 'That is Aω², the greatest acceleration.' }],
          hints: ['The shadow’s greatest speed equals the peg’s speed.', t`$\omega = 2\pi(${rpm}/60)$ rad/s; $v = A\omega$.`],
          teach: 'The shadow’s top speed is the reference point’s speed, Aω.',
          explain: t`$\omega = 2\pi(${rpm})/60 = ${tn(w)}$ rad/s, so $v_\text{max} = A\omega = ${R}\times${tn(w)} = ${tn(v)}\ \text{m/s}$, reached as the shadow crosses the middle.`,
          visual: refCircle({ deg: 35, vel: true, caption: 'The peg’s velocity (blue) and its shadow’s (green), the horizontal part of it. Radius drawn as 1.' }),
        };
      },
    }),
    num({
      id: 'end-to-half', difficulty: 2,
      gen(r) {
        const T = r.pick([1.2, 2.4, 3.0, 4.8]);
        return {
          prompt: t`A mass oscillates in SHM with period ${T} s. How long does it take to go from $x = +A$ to $x = +A/2$?`,
          answer: T / 6, units: 's', tol: { rel: 0.005 },
          errors: [{ value: T / 8, feedback: 'Half the distance is not half the time: near the end the motion is slow. Use the reference circle: cos θ = ½.' }, { value: T / 4, feedback: 'T/4 takes it all the way to the centre, x = 0.' }],
          hints: ['On the reference circle, through what angle must P turn for the shadow to move from A to A/2?', t`$\cos\theta = \tfrac12$ at $\theta = 60^\circ$: a sixth of a turn.`],
          teach: 'Time in SHM is P’s angle on the reference circle: a 60° turn takes a sixth of a period.',
          explain: t`P turns from $0^\circ$ to $60^\circ$, a sixth of a circle, so $t = T/6 = ${tn(T / 6)}\ \text{s}$. The second half of the trip, to $x = 0$, takes only $T/12$: the shadow speeds up.`,
          visual: refCircle({ deg: 0, ghost: [{ deg: 60, label: 'later' }], caption: 'P at 0° (shadow at x = A) and later, when the shadow has reached A/2. Radius drawn as 1.' }),
        };
      },
    }),
    num({
      id: 'phase', difficulty: 2,
      gen(r) {
        const [frac, ftex] = r.pick([[0.5, '\\tfrac12'], [-0.5, '-\\tfrac12']]), dir = r.pick([-1, 1]);
        // x = A cos φ; v = −Aω sin φ: moving in −x needs sin φ > 0 (φ in 0–180°)
        const base = (Math.acos(frac) * 180) / Math.PI;   // 60 or 120
        const phi = dir < 0 ? base : 360 - base;
        return {
          prompt: t`At $t = 0$ an oscillator is at $x = ${ftex}A$, moving in the ${dir < 0 ? '$-x$' : '$+x$'} direction. Writing $x = A\cos(\omega t + \phi)$, what is the phase constant $\phi$, in degrees between 0 and 360?`,
          answer: phi, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 360 - phi, feedback: t`That puts P on the other half of the circle, where the shadow moves the other way. Moving in $-x$ needs P in the upper half (0–180°).` }],
          hints: [t`The shadow’s position fixes $\cos\phi = ${frac}$: two angles fit.`, t`P goes counter-clockwise: in the upper half of the circle its shadow moves in $-x$; in the lower half, in $+x$.`],
          teach: 'The position fixes cos φ; the direction of motion picks which of the two angles is P’s.',
          explain: t`$\cos\phi = ${frac}$ gives $${tn(base)}^\circ$ or $${tn(360 - base)}^\circ$. Moving in ${dir < 0 ? '$-x$' : '$+x$'} needs P in the ${dir < 0 ? 'upper' : 'lower'} half, so $\phi = ${tn(phi)}^\circ$.`,
          visual: refCircle({ P: false, shadowAt: { x: frac, dir }, caption: 'The oscillator at t = 0, with its direction of motion. Where on the circle must P be? Radius A drawn as 1.' }),
        };
      },
    }),
    mcq({
      id: 'at-end', difficulty: 2,
      prompt: t`An oscillator with amplitude $A$ and angular frequency $\omega$ is at $x = +A$, momentarily at rest. What is its acceleration?`,
      choices: [t`$A\omega^2$, pointing toward $x = 0$`, 'Zero: it is momentarily at rest', t`$A\omega$, pointing toward $x = 0$`, t`$A\omega^2$, pointing away from $x = 0$`],
      answer: 0,
      why: {
        1: 'Being at rest for an instant does not mean no acceleration — a ball at the top of its flight is at rest with g still acting. Here the spring pulls hardest.',
        2: t`$A\omega$ is a speed (m/s), not an acceleration. The acceleration is $A\omega^2$.`,
        3: 'The restoring acceleration always points back toward equilibrium.',
      },
      hints: ['What is P’s acceleration on the reference circle, and which way does it point?', 'At x = +A, P is on the x-axis: its centripetal acceleration lies wholly along x.'],
      teach: 'The shadow’s acceleration is the x-part of P’s centripetal acceleration: largest, Aω², at the ends.',
      explain: t`At $x = A$, P’s centripetal acceleration $A\omega^2$ points straight at the centre, along $-x$: $a = -\omega^2 x = -A\omega^2$. Speed zero, acceleration greatest.`,
      visual: refCircle({ deg: 0, caption: 'P on the x-axis, its shadow at x = A. Radius A drawn as 1.' }),
    }),
    num({
      id: 'x-at-t', difficulty: 2,
      gen(r) {
        const A = r.pick([0.2, 0.15, 0.3]), w = r.pick([2.5, 3.0, 4.0]), phi = r.pick([0.4, 0.8, 1.2]), tt = r.pick([0.5, 0.9, 1.4]);
        const x = A * Math.cos(w * tt + phi);
        const xdeg = A * Math.cos(((w * tt + phi) * Math.PI) / 180);
        return {
          prompt: t`An oscillator moves as $x = (${A}\ \text{m})\cos(${w}t + ${phi})$, with $t$ in seconds and the phase in radians. Where is it at $t = ${tt}$ s?`,
          answer: x, units: 'm', tol: { rel: 0.01, abs: 0.002 },
          // a calculator in degree mode gives xdeg — unless that happens to land near the answer
          errors: Math.abs(xdeg - x) > 0.05 * A ? [{ value: xdeg, feedback: 'Your calculator is in degree mode: the phase ωt + φ is in radians here.' }] : [],
          hints: [t`The phase at that moment is $${w}(${tt}) + ${phi} = ${tn(w * tt + phi)}$ rad.`, 'Take the cosine in radian mode and multiply by the amplitude.'],
          teach: 'Evaluate the phase ωt + φ in radians, then x = A cos(phase).',
          explain: t`Phase $= ${tn(w * tt + phi)}$ rad ($= ${tn(((w * tt + phi) * 180) / Math.PI)}^\circ$ — P’s angle), so $x = ${A}\cos(${tn(w * tt + phi)}) = ${tn(x)}\ \text{m}$.`,
          visual: refCircle({ deg: (phi * 180) / Math.PI, arc: true, caption: t`P at $t = 0$, at angle $\phi = ${phi}$ rad. It turns ${w} rad every second. Radius A drawn as 1.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-amax', difficulty: 2,
      gen(r) {
        const R = r.pick([0.05, 0.08, 0.12]), f = r.pick([3, 5, 8]);
        const w = TAU * f, a = R * w * w;
        return {
          prompt: t`A point on a disc ${tn(R * 100)} cm from its axis turns at ${f} revolutions per second. Its shadow on a screen moves in SHM. What is the shadow’s greatest acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: R * w, feedback: 'That is Aω, the greatest speed. The greatest acceleration is Aω².' }, { value: R * f * f, feedback: t`Use $\omega = 2\pi f$ in rad/s.` }],
          hints: [t`$a_\text{max} = A\omega^2$ with $\omega = 2\pi f$.`],
          teach: 'The greatest acceleration in SHM is the reference point’s centripetal acceleration, Aω².',
          explain: t`$\omega = 2\pi(${f}) = ${tn(w)}$ rad/s, so $a_\text{max} = A\omega^2 = ${R}\times${tn(w)}^2 = ${tn(a)}\ \text{m/s}^2$.`,
          visual: refCircle({ deg: 50, caption: 'The point on the disc and its shadow. Radius drawn as 1.' }),
        };
      },
    }),
    mcq({
      id: 'cp-quarter', difficulty: 2,
      prompt: t`How long does an oscillator of period $T$ take to go from $x = 0$ to $x = +A$?`,
      choices: [t`$T/4$`, t`$T/2$`, t`$T/6$`, t`$T/8$`],
      answer: 0,
      why: { 1: t`$T/2$ takes it from one end all the way to the other.`, 2: t`$T/6$ is the time from an end to the halfway point.`, 3: 'Equal distances are not covered in equal times in SHM, but the quarter-turn is exact.' },
      hints: ['On the reference circle, how far does P turn as the shadow goes from the centre to the end?'],
      teach: 'Centre to end is a quarter turn of the reference point: T/4.',
      explain: t`P turns from $270^\circ$ to $360^\circ$ (or $-90^\circ$ to $0$): a quarter of a turn, $T/4$.`,
      visual: refCircle({ deg: -90, ghost: [{ deg: 0, label: 'at x = A' }], caption: 'P below the centre (shadow at x = 0, moving in +x) and a moment later at 0°. Radius drawn as 1.' }),
    }),
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const [name, R, Td] = r.pick([['Io', 421700, 1.769], ['Europa', 671000, 3.551], ['Ganymede', 1070000, 7.155], ['Callisto', 1883000, 16.69]]);
        const v = (TAU * R) / (Td * 86400);
        return {
          prompt: t`Through a telescope, Jupiter’s moon ${name} seems to slide back and forth beside the planet, because we see its nearly circular orbit almost edge-on. Its orbit has a radius of $${tn(R)}$ km and a period of ${Td} days. How fast does ${name} move across our line of sight as it passes in front of Jupiter, in km/s?`,
          answer: v, units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: R / (Td * 86400), feedback: t`The shadow’s greatest speed is $A\omega$ with $\omega = 2\pi/T$: keep the $2\pi$.` }, { value: (TAU * R) / Td, feedback: 'Convert the period to seconds: 1 day = 86 400 s.' }],
          hints: ['Seen edge-on, the moon’s position across the sky is the shadow of its circular motion.', t`Its greatest apparent speed, at the centre, is its full orbital speed $A\omega = 2\pi A/T$.`],
          teach: 'A circular orbit seen edge-on is SHM; the greatest apparent speed is the orbital speed.',
          explain: t`$v = \dfrac{2\pi(${tn(R)}\ \text{km})}{${Td}\times86\,400\ \text{s}} = ${tn(v)}\ \text{km/s}$. Galileo’s 1610 sketches of the moons’ positions trace exactly these back-and-forth sinusoids.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-2.6, 2.6], y: [-0.7, 0.7], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
              curves: [{ param: ['2*cos(t)', '0.12*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true }],
              shade: [{ fn: 'sqrt(max(0, 0.09 - x^2))', lower: '-sqrt(max(0, 0.09 - x^2))', from: -0.3, to: 0.3, color: 'warn', alpha: 0.8 }],
              points: [{ x: 0, y: -0.12, color: 'accent', r: 4, label: name, labelDy: 14 }, { x: 2, y: 0, color: 'ink3', r: 3, label: 'greatest elongation', labelDx: -60, labelDy: -14 }],
              arrows: [{ from: [0, -0.12], to: [-0.6, -0.12], color: 'good' }],
            },
            caption: 'The orbit seen almost edge-on from Earth (dashed), with Jupiter in the middle and the moon passing in front of it. Not to scale.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §15.3 Comparing Simple Harmonic Motion and Circular Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-3-comparing-simple-harmonic-motion-and-circular-motion' }],
});
