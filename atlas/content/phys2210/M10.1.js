// Rotational kinematics: θ, ω and α for a body turning about a fixed axis,
// and the motion of each of its points.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { RPM, omegaGraph, wheel } from './_rotation.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');

// a static picture of a turning disk (or ring) from the rotor simulation
const disk = (params, caption) => ({ type: 'mech-rotor', params: { shape: 'disk', M: 1, R: 0.3, values: false, ...params }, caption });

export default lesson({
  id: 'phys2210.M10.1',
  title: 'Rotational kinematics',
  minutes: 10, difficulty: 2,
  intro: t`A rigid body turning about a fixed axis needs just one number to say where it is: the **angle** $\theta$ it has turned through. Its **angular velocity** $\omega = d\theta/dt$ and **angular acceleration** $\alpha = d\omega/dt$ play the parts of $v$ and $a$, and when $\alpha$ is constant the equations of straight-line motion carry over letter for letter:

$$\omega = \omega_0 + \alpha t, \qquad \theta = \theta_0 + \omega_0 t + \tfrac12\alpha t^2, \qquad \omega^2 = \omega_0^2 + 2\alpha\,\Delta\theta$$

Every point of the body shares the same $\theta$, $\omega$ and $\alpha$. But a point at distance $r$ from the axis moves round its circle with speed $v = r\omega$, has a tangential acceleration $a_t = r\alpha$ along its path, and a centripetal acceleration $a_c = \omega^2 r$ toward the axis.`,
  symbols: [
    { tex: '\\theta', text: 'the angle turned, in **radians**: one revolution is $2\\pi$ rad. Radians make $s = r\\theta$ true for the arc length $s$' },
    { tex: '\\omega', text: 'angular velocity, in rad/s (1 rpm $= 2\\pi/60$ rad/s); positive for anticlockwise' },
    { tex: '\\alpha', text: 'angular acceleration, in rad/s²: how fast $\\omega$ changes' },
    { tex: '\\omega_0,\\ \\theta_0', text: 'the values at $t = 0$' },
    { tex: 'v = r\\omega', text: 'the speed of a point a distance $r$ (m) from the axis, in m/s' },
    { tex: 'a_t = r\\alpha', text: 'that point’s tangential acceleration, along its circle (it changes the speed)' },
    { tex: 'a_c = \\omega^2 r', text: 'its centripetal acceleration, toward the axis (it turns the velocity) — lesson M4.4' },
  ],
  why: 'Wheels, turbines, centrifuges, turbopumps and the reaction wheels that point telescopes all run on these equations — and v = rω ties each one’s spin to the motion of every point on it.',
  visual: {
    type: 'mech-rotor',
    title: 'One spin, every point',
    lead: t`A wheel spins up with constant angular acceleration $\alpha$. The gold dot is a point on it: green is its velocity, red its centripetal acceleration, amber its tangential acceleration. Press **Play** or drag the time; the graph below is $\omega$ against $t$.`,
    tasks: [
      t`Set $\alpha = 0$: the amber arrow vanishes and only the inward red one is left — uniform circular motion, as in lesson M4.4.`,
      t`Move the marked point outward: $v$, $a_t$ and $a_c$ all grow in proportion to $r$, while $\theta$, $\omega$ and $\alpha$ belong to the whole wheel.`,
      t`Make $\alpha$ negative: the wheel slows, stops where the line crosses $\omega = 0$, and turns back the other way. The shaded area is the angle turned.`,
    ],
    params: {
      shape: 'disk', M: 1, R: 0.5, omega0: 1, alpha: 0.8, point: 0.4, plot: 'omega', T: 6, time: 2.2,
      sliders: ['omega0', 'alpha', { key: 'point', max: 0.5, label: 'Marked point at radius $r$', explain: 'Its distance from the axis (the wheel’s radius is 0.5 m).' }],
    },
  },
  example: {
    prompt: t`A satellite’s reaction wheel, radius 0.15 m, spins up from rest to 6,000 rpm in 120 s with constant angular acceleration. Find its angular acceleration, the number of turns it makes, and the speed and centripetal acceleration of its rim at full speed.`,
    visual: omegaGraph({ w0: 0, w1: 6000 * RPM, T: 120, caption: 'The spin-up: ω climbs steadily to 628 rad/s. The slope is α; the shaded area is the angle turned.' }),
    steps: [
      { label: 'Convert', text: t`$\omega = 6000\ \text{rev/min}\times\dfrac{2\pi\ \text{rad}}{60\ \text{s}} = 628.3$ rad/s.` },
      { label: 'Angular acceleration', text: t`$\alpha = \dfrac{\Delta\omega}{\Delta t} = \dfrac{628.3}{120} = 5.24\ \text{rad/s}^2$.` },
      { label: 'Turns', text: t`$\theta = \tfrac12\alpha t^2 = \tfrac12(5.236)(120)^2 = 3.77\times10^{4}$ rad $= 6{,}000$ revolutions. (Check: an average of 3,000 rpm for 2 minutes.)` },
      { label: 'The rim', text: t`$v = r\omega = (0.15)(628.3) = 94$ m/s and $a_c = \omega^2 r = (628.3)^2(0.15) = 5.9\times10^{4}\ \text{m/s}^2$ — about 6,000 $g$.` },
      { label: 'Sense check', text: t`A rim moving at 340 km/h, pulled inward at 6,000 $g$: why reaction wheels are machined from solid metal, balanced to fractions of a gram, and sealed inside housings.` },
    ],
    answer: t`$\alpha = 5.24\ \text{rad/s}^2$; 6,000 turns; rim speed 94 m/s with $a_c \approx 5.9\times10^4\ \text{m/s}^2$.`,
  },
  practice: [
    num({
      id: 'rpm', difficulty: 1,
      gen(r) {
        const [what, N] = r.pick([['A computer hard drive spins at', 7200], ['A washing machine’s drum spins at', 1200], ['A car engine idles at', 800], ['A turntable plays a record at', 33.3]]);
        const w = N * RPM;
        return {
          prompt: t`${what} ${comma(N)} rpm (revolutions per minute). What is its angular velocity in rad/s?`,
          answer: w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [
            { value: N * 2 * Math.PI, feedback: 'That is radians per minute: divide by 60 for radians per second.' },
            { value: N / 60, feedback: 'That is revolutions per second. Each revolution is 2π radians.' },
          ],
          hints: ['One revolution is 2π radians; one minute is 60 s.', t`$\omega = N\times\dfrac{2\pi}{60}$ rad/s.`],
          teach: 'To convert rpm to rad/s, multiply by 2π/60 (about 0.105).',
          explain: t`$\omega = ${comma(N)}\times\dfrac{2\pi}{60} = ${s3(w)}$ rad/s.`,
          visual: disk({ omega0: 2 }, 'Turning anticlockwise; the green arrow shows the sense of rotation.'),
        };
      },
    }),
    num({
      id: 'alpha', difficulty: 1,
      gen(r) {
        const w0 = r.pick([50, 100, 200]), dw = r.pick([150, 300, 450]), T = r.pick([5, 10, 15]);
        const a = dw / T;
        return {
          prompt: t`A gas-turbine rotor speeds up steadily from ${w0} rad/s to ${w0 + dw} rad/s in ${T} s. What is its angular acceleration?`,
          answer: a, units: 'rad/s^2', tol: { rel: 0.01 },
          errors: [{ value: (w0 + dw) / T, feedback: 'Use the change in ω: it started at ' + w0 + ' rad/s, not from rest.' }],
          hints: [t`$\alpha = \dfrac{\Delta\omega}{\Delta t}$.`],
          teach: 'Angular acceleration is the rate of change of angular velocity: the slope of the ω–t graph.',
          explain: t`$\alpha = \dfrac{${w0 + dw} - ${w0}}{${T}} = ${s3(a)}\ \text{rad/s}^2$.`,
          visual: omegaGraph({ w0, w1: w0 + dw, T, shade: false, caption: 'The rotor’s angular velocity during the spin-up.' }),
        };
      },
    }),
    num({
      id: 'revs', difficulty: 2,
      gen(r) {
        const N = r.pick([90, 120, 150, 180]), T = r.pick([20, 30, 40]);
        const w0 = N * RPM, theta = 0.5 * w0 * T, revs = theta / (2 * Math.PI);
        return {
          prompt: t`A ceiling fan turning at ${N} rpm is switched off and slows steadily to a stop in ${T} s. How many revolutions does it make while stopping?`,
          answer: revs, tol: { rel: 0.01 },
          errors: [
            { value: theta, feedback: 'That is the angle in radians. Divide by 2π for revolutions.' },
            { value: 2 * revs, feedback: 'The fan slows down: its average speed is half its starting speed, so θ = ½ω₀t.' },
          ],
          hints: [t`With steady slowing, the average angular velocity is $\tfrac12(\omega_0 + 0)$.`, t`Revolutions $= \tfrac12\times\dfrac{${N}}{60}\ \text{rev/s}\times ${T}$ s.`],
          teach: 'The angle turned is the area under the ω–t graph: for a steady stop, half of ω₀ t.',
          explain: t`Average rate $\tfrac12\times${N}$ rpm $= ${N / 2}$ rpm for ${T} s: $\dfrac{${N / 2}\times${T}}{60} = ${s3(revs)}$ revolutions (${s3(theta)} rad).`,
          visual: omegaGraph({ w0, w1: 0, T, caption: 'The fan’s angular velocity as it stops. The shaded triangle is the angle turned.' }),
        };
      },
    }),
    mcq({
      id: 'same-omega', difficulty: 1,
      prompt: 'Ana sits 1 m from the centre of a turning merry-go-round; Ben sits 3 m from the centre. Which is true?',
      choices: ['They have the same angular velocity, and Ben moves three times as fast', 'They move at the same speed', 'Ben has three times Ana’s angular velocity', 'Ana moves faster, because she is nearer the axis'],
      answer: 0,
      why: {
        1: 'In each turn Ben travels a circle three times longer than Ana’s, in the same time.',
        2: 'Both go round once in the same time — the whole merry-go-round shares one ω.',
        3: 'Nearer the axis means a smaller circle and a slower speed: v = rω.',
      },
      hints: ['How long does each child take for one turn?', t`$v = r\omega$.`],
      teach: 'Every point of a rigid body shares one ω; speed grows with distance from the axis, v = rω.',
      explain: t`Same $\omega$ — one rigid body. Speed $v = r\omega$: Ben, at three times the radius, moves three times as fast.`,
      visual: wheel({ R: 1, points: [{ r: 0.33, label: 'Ana', color: 'accent' }, { r: 1, label: 'Ben', color: 'violet' }], caption: 'The merry-go-round from above (radii to scale).' }),
    }),
    num({
      id: 'rim-accel', difficulty: 2,
      gen(r) {
        const R = r.pick([0.3, 0.4, 0.5]), w = r.pick([2, 3, 4]), a = r.pick([4, 6, 8]);
        const at = R * a, ac = w * w * R, tot = Math.hypot(at, ac);
        return {
          prompt: t`At one instant a wheel of radius ${R} m has angular velocity ${w} rad/s and angular acceleration ${a} rad/s². What is the size of the acceleration of a point on its rim?`,
          answer: tot, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: at, feedback: 'That is only the tangential part, rα. The rim point also accelerates toward the axis, ω²r.' },
            { value: ac, feedback: 'That is only the centripetal part. The wheel is speeding up too: add rα, at right angles.' },
            { value: at + ac, feedback: 'The two parts are perpendicular (along the rim and toward the axis): combine them with Pythagoras.' },
          ],
          hints: [t`Two perpendicular parts: $a_t = r\alpha$ along the rim and $a_c = \omega^2 r$ toward the axis.`, t`$a = \sqrt{a_t^2 + a_c^2}$.`],
          teach: 'A point on a speeding-up wheel has two perpendicular accelerations: rα along its path and ω²r toward the axis.',
          explain: t`$a_t = (${R})(${a}) = ${nice(at)}\ \text{m/s}^2$, $a_c = (${w})^2(${R}) = ${nice(ac)}\ \text{m/s}^2$, so $a = \sqrt{${nice(at)}^2 + ${nice(ac)}^2} = ${s3(tot)}\ \text{m/s}^2$.`,
          visual: { type: 'mech-rotor', params: { shape: 'ring', M: 1, R, omega0: w, alpha: a, point: R, values: false }, caption: 'The rim point (gold) with its velocity (green), tangential acceleration (amber) and centripetal acceleration (red). The two acceleration arrows share a scale; the velocity has its own.' },
        };
      },
    }),
    num({
      id: 'stop-angle', difficulty: 2,
      gen(r) {
        const N = r.pick([1800, 2400, 3000]), a = r.pick([4, 5, 8]);
        const w0 = N * RPM, theta = (w0 * w0) / (2 * a), revs = theta / (2 * Math.PI);
        return {
          prompt: t`A grinding wheel turning at ${comma(N)} rpm is switched off and slows with a constant angular deceleration of ${a} rad/s². How many revolutions does it make before it stops?`,
          answer: revs, tol: { rel: 0.01 },
          errors: [
            { value: theta, feedback: 'That is the angle in radians: divide by 2π.' },
            { value: w0 / a, feedback: 'That is the stopping time in seconds, not the number of turns.' },
          ],
          hints: [t`With no time given, use $\omega^2 = \omega_0^2 + 2\alpha\,\Delta\theta$ with $\omega = 0$ and $\alpha = -${a}\ \text{rad/s}^2$.`, t`Convert ${comma(N)} rpm to rad/s first; convert the answer back to revolutions.`],
          teach: 'When time is not given, ω² = ω₀² + 2αΔθ links speeds and angle directly.',
          explain: t`$\omega_0 = ${s3(w0)}$ rad/s; $\Delta\theta = \dfrac{\omega_0^2}{2|\alpha|} = \dfrac{(${s3(w0)})^2}{${2 * a}} = ${s3(theta)}$ rad $= ${s3(revs)}$ revolutions.`,
          visual: omegaGraph({ w0, w1: 0, T: w0 / a, numbers: false, caption: 'Angular velocity against time as the wheel slows. The shaded area is the angle turned (axes unnumbered).' }),
        };
      },
    }),
    mcq({
      id: 'omega-vector', difficulty: 2,
      prompt: 'Seen from above, a wheel lying flat turns anticlockwise. By the right-hand rule, which way does its angular velocity vector point?',
      choices: ['Straight up, along the axle, toward you', 'Straight down, along the axle', 'Along the velocity of a point on the rim', 'Outward from the axle, along a spoke'],
      answer: 0,
      why: {
        1: 'Curl the fingers of your right hand the way the wheel turns (anticlockwise from above): your thumb points up.',
        2: 'Each rim point’s velocity changes direction all the time; the angular velocity is one fixed vector along the axle.',
        3: 'Spokes point every which way, and turn; only the axle’s direction is the same for the whole wheel.',
      },
      hints: ['Curl the fingers of your right hand in the direction of rotation.', 'Your thumb gives the direction of ω — along the axis.'],
      teach: 'Angular velocity is a vector along the axis, given by the right-hand rule: fingers curl with the rotation, thumb points along ω.',
      explain: t`Fingers curled anticlockwise (as seen from above), thumb up: $\vec\omega$ points up along the axle. It is the same for every point of the wheel — the reason the axis, not the rim, carries the direction of a rotation (and later of angular momentum).`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2,
          curves: [{ param: ['1.6*cos(t)', '1.6*sin(t)', 0], t: [0, 6.2832], color: 'accent' }],
          vectors: [{ from: [1.6, 0, 0], to: [1.6, 1.3, 0], color: 'gold', label: '\\vec v' }],
          segments: [{ from: [0, 0, -1.2], to: [0, 0, 1.2], color: 'ink3', dash: true }],
        },
        caption: 'The wheel (blue) in the horizontal plane, the axle (dashed) and the velocity of one rim point (gold). Drag to rotate the view.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-turbopump', difficulty: 2, transfer: true,
      gen(r) {
        const N = r.pick([20000, 30000, 35000]), R = r.pick([0.06, 0.08, 0.1]);
        const v = R * N * RPM;
        return {
          prompt: t`Liquid-rocket turbopumps spin fast: the Space Shuttle main engine’s fuel pump ran at about 35,000 rpm. An impeller of radius ${R * 100} cm turns at ${comma(N)} rpm. How fast are the tips of its blades moving?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: R * N, feedback: 'Convert rpm to rad/s first (× 2π/60), and keep the radius in metres.' },
            { value: (R * N) / 60, feedback: 'That uses revolutions per second. Each revolution is 2π radians: v = rω with ω in rad/s.' },
          ],
          hints: [t`$\omega = N\times\dfrac{2\pi}{60}$; then $v = r\omega$ with $r$ in metres.`],
          teach: 'Tip speed is rω, with ω in rad/s and r in metres.',
          explain: t`$\omega = ${comma(N)}\times\dfrac{2\pi}{60} = ${s3(N * RPM)}$ rad/s, so $v = (${R})(${s3(N * RPM)}) = ${s3(v)}$ m/s. Tip speeds of hundreds of metres per second are why turbopump design is an exercise in materials strength.`,
          visual: disk({ omega0: 3, alpha: 0, point: 0.3, R: 0.3 }, 'The impeller seen along its shaft (a sketch): a blade tip (gold) with its velocity and inward acceleration.'),
        };
      },
    }),
    num({
      id: 'cp-time', difficulty: 3,
      gen(r) {
        const w0 = r.pick([2, 3, 4]), a = r.pick([1, 2]), th = r.pick([20, 30, 40]);
        const tt = (-w0 + Math.sqrt(w0 * w0 + 2 * a * th)) / a;
        return {
          prompt: t`A wheel turning at ${w0} rad/s starts to speed up with a constant angular acceleration of ${a} rad/s². How long does it take to turn through ${th} rad?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: th / w0, feedback: 'That ignores the acceleration: the wheel turns faster and faster, so it takes less time.' },
            { value: Math.sqrt((2 * th) / a), feedback: 'That would be the time from rest. It already turns at ω₀, so it takes less time.' },
          ],
          hints: [t`$\theta = \omega_0 t + \tfrac12\alpha t^2$ — a quadratic in $t$.`, t`$\tfrac{${a}}{2}t^2 + ${w0}t - ${th} = 0$.`, 'Take the positive root of the quadratic formula.'],
          teach: 'With constant α the angle is quadratic in time: solve θ = ω₀t + ½αt² for t.',
          explain: t`$\tfrac{${a}}{2}t^2 + ${w0}t - ${th} = 0 \Rightarrow t = \dfrac{-${w0} + \sqrt{${w0 * w0} + ${2 * a * th}}}{${a}} = ${s3(tt)}$ s.`,
          visual: omegaGraph({ w0, w1: w0 + a * 10, T: 10, shade: false, caption: 'ω against time for the first 10 s: the angle turned is the area under the line, starting at t = 0.' }),
        };
      },
    }),
    mcq({
      id: 'cp-steady', difficulty: 2,
      prompt: 'A wheel spins at a steady 300 rpm. What is the acceleration of a point on its rim?',
      choices: ['Toward the axis, of size ω²r, with no tangential part', 'Zero, because ω is constant', 'Along the rim, of size rω', 'It grows steadily as the wheel keeps turning'],
      answer: 0,
      why: {
        1: 'Constant ω means no angular acceleration, but the point still moves in a circle, so its velocity keeps turning: that needs an inward acceleration.',
        2: 'rω is the point’s speed, not an acceleration. With α = 0, the tangential acceleration rα is zero.',
        3: 'With ω constant, ω²r is constant too: the size never changes, only the direction (always toward the axis).',
      },
      hints: [t`$a_t = r\alpha$ and $a_c = \omega^2 r$. What is $\alpha$ here?`],
      teach: 'Steady spin: no tangential acceleration, but every point still has the centripetal acceleration ω²r.',
      explain: t`$\alpha = 0$, so $a_t = 0$; but the point moves in a circle at speed $r\omega$, so it has $a_c = \omega^2 r$ toward the axis — about $(31.4)^2 r \approx 990r\ \text{m/s}^2$ at 300 rpm.`,
      visual: wheel({ R: 1, points: [{ r: 1, label: 'rim point', color: 'gold' }], caption: 'The wheel seen face-on, turning steadily.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §10.1–10.3 Rotational variables and kinematics', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-1-rotational-variables' },
  ],
});
