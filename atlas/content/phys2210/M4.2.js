// Projectile motion: constant horizontal velocity, free fall vertically, one clock.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, s3, D2R } from './_kinematics.js';

const t = String.raw;

// y as a function of x for a launch from height h at speed v0 and angle th (degrees): a parabola
const traj = (v0, th, h = 0) => `${h} + ${Math.tan(th * D2R)}*x - ${G / (2 * (v0 * Math.cos(th * D2R)) ** 2)}*x^2`;

export default lesson({
  id: 'phys2210.M4.2',
  title: 'Projectile motion',
  minutes: 11, difficulty: 2,
  intro: t`A **projectile** is anything moving under gravity alone: a thrown ball, a released supply package, a shell — whenever air resistance is small. Its acceleration is $g$ straight down. Nothing acts sideways, so **the horizontal velocity never changes**, while the vertical motion is ordinary free fall. The two components share only the clock:

$$x = x_0 + (v_0\cos\theta)\,t, \qquad y = y_0 + (v_0\sin\theta)\,t - \tfrac12 g t^2$$

The usual method: solve the vertical motion for the time, then use that time in the horizontal motion.`,
  symbols: [
    { tex: 'v_0', text: 'launch speed, in m/s' },
    { tex: '\\theta', text: 'launch angle, measured up from the horizontal' },
    { tex: 'v_0\\cos\\theta', text: 'the horizontal velocity $v_x$, in m/s — the same for the whole flight' },
    { tex: 'v_0\\sin\\theta', text: 'the initial vertical velocity $v_{0y}$, in m/s; afterwards $v_y = v_0\\sin\\theta - gt$' },
    { tex: 'x_0,\\ y_0', text: 'the launch position, in m ($y$ is height, up positive)' },
    { tex: 'g', text: '9.8 m/s², the free-fall acceleration, pointing down' },
    { tex: 't', text: 'time since launch, in s — the one thing the two motions share' },
  ],
  why: 'The same split — steady sideways motion, free fall downward — drops supplies from aircraft, aims a water jet, and leads straight to orbits: a satellite is a projectile moving sideways fast enough to keep missing the ground.',
  visual: {
    type: 'projectile',
    title: 'Two motions, one clock',
    lead: t`Set a launch speed, angle and height, then press **Launch**. The gold arrow is the velocity; the green arrows are its horizontal and vertical components. Watch the readouts as it flies.`,
    tasks: [
      'Launch and watch the readouts: vₓ stays the same all the way, while v_y falls by 9.8 m/s every second.',
      'At the top the velocity arrow is horizontal: its vertical part is zero, its horizontal part is not.',
      'Turn on air drag: now the horizontal velocity shrinks too and the path is no longer a parabola — the no-air model of this lesson is an idealisation.',
    ],
    params: { v0: 20, angle: 40, h0: 0 },
    caption: 'A point mass over flat ground in uniform gravity. Without drag the path is an exact parabola; the drag option uses a fixed quadratic drag coefficient for a dense ball, integrated numerically. Both axes in metres.',
  },
  example: {
    prompt: t`A football is kicked from level ground at 20.0 m/s, 30.0° above the horizontal. Ignoring air resistance, find how long it is in the air, how far away it lands, and how high it goes.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 38], y: [0, 7], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
        curves: [{ fn: traj(20, 30), domain: [0, (400 * Math.sin(60 * D2R)) / G], color: 'accent' }],
        points: [{ x: (400 * Math.sin(60 * D2R)) / G / 2, y: 100 / (2 * G), color: 'warn', label: 'top' }, { x: (400 * Math.sin(60 * D2R)) / G, y: 0, color: 'gold', label: 'lands' }],
      },
      caption: 'The ball’s path, drawn to scale: a parabola.',
    },
    steps: [
      { label: 'Split the launch velocity', text: t`$v_x = 20.0\cos 30.0^\circ = 17.3$ m/s and $v_{0y} = 20.0\sin 30.0^\circ = 10.0$ m/s.` },
      { label: 'Vertical: time of flight', text: t`It lands when $y = 0$: $0 = 10.0t - 4.9t^2$, so $t = 10.0/4.9 = 2.04$ s (the other root, $t = 0$, is the kick).` },
      { label: 'Horizontal: range', text: t`$v_x$ is constant, so $x = v_x t = (17.3)(2.04) = 35.3$ m.` },
      { label: 'Maximum height', text: t`At the top $v_y = 0$: $h = \dfrac{v_{0y}^2}{2g} = \dfrac{10.0^2}{2(9.8)} = 5.10$ m, reached at $t = 1.02$ s — halfway through the flight.` },
      { label: 'Sense check', text: t`At the top the ball still moves at 17.3 m/s, horizontally. A real football, with drag and spin, falls noticeably short of 35 m.` },
    ],
    answer: t`2.04 s in the air; it lands 35.3 m away after rising 5.10 m.`,
  },
  practice: [
    mcq({
      id: 'top-velocity', difficulty: 1,
      prompt: 'Ignoring air resistance, what is a projectile’s velocity at the highest point of its path?',
      choices: [t`Horizontal, equal to $v_0\cos\theta$`, 'Zero', 'Vertical', t`Equal to the launch velocity $v_0$`],
      answer: 0,
      why: {
        1: 'Only the vertical component is zero at the top. The horizontal component is unchanged from the launch.',
        2: 'At the top the vertical velocity is zero, so the velocity is horizontal, not vertical.',
        3: t`The vertical part has gone, so the speed at the top, $v_0\cos\theta$, is less than $v_0$ (unless the launch was horizontal).`,
      },
      hints: ['Treat the two components separately: what happens to each at the top?'],
      teach: 'At the top of a projectile’s path the vertical velocity is zero but the horizontal velocity is unchanged.',
      explain: t`$v_y = 0$ at the top while $v_x = v_0\cos\theta$ throughout, so the velocity is $v_0\cos\theta$, horizontal.`,
      visual: {
        type: 'graph',
        params: { x: [0, 35], y: [0, 12], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', curves: [{ fn: '1.19175359259421*x - 0.03660294896530836*x^2', domain: [0, 32.559], color: 'accent' }], points: [{ x: 16.2795, y: 9.7006, color: 'warn', label: 'top' }] },
        caption: 'A projectile’s path, launched at 18 m/s and 50°.',
      },
    }),
    mcq({
      id: 'horizontal-constant', difficulty: 1,
      prompt: 'A ball is thrown at an angle. Ignoring air resistance, what happens to its horizontal velocity during the flight?',
      choices: ['It stays constant', 'It decreases steadily as the force of the throw wears off', 'It increases as the ball falls', 'It drops to zero at the top'],
      answer: 0,
      why: {
        1: 'Once the ball leaves the hand, the throw exerts no force at all. Nothing horizontal acts, so nothing changes the horizontal velocity.',
        2: 'Falling speeds up the vertical motion only; gravity has no horizontal part.',
        3: 'At the top only the vertical velocity is zero.',
      },
      hints: ['Which forces act on the ball in flight, and which way do they point?'],
      teach: 'With gravity the only force, the horizontal velocity of a projectile is constant.',
      explain: t`Gravity points straight down, so $a_x = 0$ and $v_x = v_0\cos\theta$ for the whole flight. Real air drag does slow it a little.`,
      visual: {
        type: 'graph',
        params: { x: [-1, 26], y: [0, 10], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', points: [{ x: 0.0, y: 0.0, color: 'accent' }, { x: 2.294, y: 2.97, color: 'accent' }, { x: 4.589, y: 5.328, color: 'accent' }, { x: 6.883, y: 7.074, color: 'accent' }, { x: 9.177, y: 8.206, color: 'accent' }, { x: 11.472, y: 8.727, color: 'accent' }, { x: 13.766, y: 8.635, color: 'accent' }, { x: 16.06, y: 7.93, color: 'accent' }, { x: 18.354, y: 6.613, color: 'accent' }, { x: 20.649, y: 4.683, color: 'accent' }, { x: 22.943, y: 2.141, color: 'accent' }] },
        caption: 'Positions of a thrown ball every 0.25 s, as a strobe photograph would record them (no air resistance).',
      },
    }),
    num({
      id: 'components', difficulty: 1,
      gen(r) {
        const v0 = r.pick([12, 15, 18, 20, 25]), th = r.pick([25, 30, 35, 40, 50, 55, 60]);
        const vy = v0 * Math.sin(th * D2R);
        return {
          prompt: t`A ball is launched at ${v0} m/s, ${th}° above the horizontal. What is the vertical component of its launch velocity?`,
          answer: vy, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v0 * Math.cos(th * D2R), feedback: t`That is the horizontal component. The vertical one is opposite the angle: $v_0\sin\theta$.` }],
          hints: [t`The vertical component is $v_0\sin\theta$ when $\theta$ is measured from the horizontal.`],
          teach: 'With the angle measured from the horizontal, vₓ = v₀ cos θ and v_y = v₀ sin θ.',
          explain: t`$v_{0y} = ${v0}\sin ${th}^\circ = ${s3(vy)}$ m/s (and $v_x = ${v0}\cos ${th}^\circ = ${s3(v0 * Math.cos(th * D2R))}$ m/s).`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, v0 + 2], y: [-1, v0 * 1.05], equal: true, xlabel: 'horizontal (m/s)', ylabel: 'vertical',
              arrows: [
                { from: [0, 0], to: [v0 * Math.cos(th * D2R), v0 * Math.sin(th * D2R)], color: 'gold', label: `${v0} m/s` },
                { from: [0, 0], to: [v0 * Math.cos(th * D2R), 0], color: 'accent', label: 'vx' },
                { from: [v0 * Math.cos(th * D2R), 0], to: [v0 * Math.cos(th * D2R), v0 * Math.sin(th * D2R)], color: 'good', label: 'vy' },
              ],
            },
            caption: `The launch velocity at ${th}° and its two components.`,
          },
        };
      },
    }),
    num({
      id: 'off-table', difficulty: 2,
      gen(r) {
        const u = r.pick([1.5, 2, 2.5, 3, 4]), h = r.pick([0.8, 1.0, 1.2, 1.5]);
        const tt = Math.sqrt((2 * h) / G), d = u * tt;
        return {
          prompt: t`A marble rolls off the edge of a ${nice(h)} m high table at ${nice(u)} m/s. Ignoring air resistance, how far from the foot of the table does it land?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: tt, feedback: 'That is the time of the fall, in seconds. Multiply by the horizontal speed.' },
            { value: u * Math.sqrt(h / G), feedback: t`Check the fall time: $h = \tfrac12 g t^2$ gives $t = \sqrt{2h/g}$.` },
          ],
          hints: ['The vertical motion starts from rest: v_y = 0 at the edge.', t`Fall time $t = \sqrt{2h/g}$; then $x = v_x t$.`],
          teach: 'For a horizontal launch, the fall time comes from the height alone; the distance is the horizontal speed times that time.',
          explain: t`$t = \sqrt{2(${nice(h)})/9.8} = ${s3(tt)}$ s, so $x = (${nice(u)})(${s3(tt)}) = ${s3(d)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.3, d * 1.35 + 0.2], y: [0, h * 1.3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ fn: `${h} - ${G / (2 * u * u)}*x^2`, domain: [0, d], color: 'accent' }],
              hlines: [{ y: h, label: 'table top', color: 'ink4' }],
              points: [{ x: 0, y: h, color: 'gold' }],
            },
            caption: 'The marble’s path from the table edge to the floor, to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'drop-vs-fire', difficulty: 2,
      prompt: 'Over level ground, one bullet is fired horizontally from a rifle while another is dropped from the same height at the same instant. Ignoring air resistance, which hits the ground first?',
      choices: ['They land at the same time', 'The dropped bullet', 'The fired bullet, because it is moving faster', 'The fired bullet lands much later, because its speed keeps it up'],
      answer: 0,
      why: {
        1: 'The fired bullet’s horizontal speed does not change its vertical motion: both start with zero vertical velocity and fall with g.',
        2: 'Speed along the horizontal does not speed up the fall — the vertical motions are identical.',
        3: 'Horizontal speed provides no upward force. (Over a curved Earth, at about 8 km/s, it would — that is an orbit — but not for a bullet over a field.)',
      },
      hints: ['Compare only the vertical motions of the two bullets.'],
      teach: 'Horizontal and vertical motions are independent: an object’s horizontal speed does not change how fast it falls.',
      explain: t`Both start with $v_y = 0$ at the same height and accelerate down at $g$, so they hit the ground together. The fired one just lands far away.`,
      visual: {
        type: 'graph',
        params: { x: [-0.8, 7.5], y: [0, 5.6], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', points: [{ x: 0, y: 5.0, color: 'warn' }, { x: 0, y: 4.951, color: 'warn' }, { x: 0, y: 4.804, color: 'warn' }, { x: 0, y: 4.559, color: 'warn' }, { x: 0, y: 4.216, color: 'warn' }, { x: 0, y: 3.775, color: 'warn' }, { x: 0, y: 3.236, color: 'warn' }, { x: 0, y: 2.599, color: 'warn' }, { x: 0, y: 1.864, color: 'warn' }, { x: 0, y: 1.031, color: 'warn' }, { x: 0, y: 0.1, color: 'warn' }, { x: 0.0, y: 5.0, color: 'accent' }, { x: 0.6, y: 4.951, color: 'accent' }, { x: 1.2, y: 4.804, color: 'accent' }, { x: 1.8, y: 4.559, color: 'accent' }, { x: 2.4, y: 4.216, color: 'accent' }, { x: 3.0, y: 3.775, color: 'accent' }, { x: 3.6, y: 3.236, color: 'accent' }, { x: 4.2, y: 2.599, color: 'accent' }, { x: 4.8, y: 1.864, color: 'accent' }, { x: 5.4, y: 1.031, color: 'accent' }, { x: 6.0, y: 0.1, color: 'accent' }] },
        caption: 'A slow-motion version: one ball dropped (amber) and one launched sideways at 6 m/s (blue), shown every 0.1 s.',
      },
    }),
    num({
      id: 'flight-time', difficulty: 2,
      gen(r) {
        const v0 = r.pick([15, 20, 25, 30]), th = r.pick([20, 30, 40, 50, 60, 70]);
        const T = (2 * v0 * Math.sin(th * D2R)) / G;
        return {
          prompt: t`A ball is launched from level ground at ${v0} m/s, ${th}° above the horizontal. Ignoring air resistance, how long is it in the air?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: T / 2, feedback: 'That is the time to the top. The flight down takes as long again.' },
            { value: (2 * v0 * Math.cos(th * D2R)) / G, feedback: t`The time in the air depends on the vertical velocity, $v_0\sin\theta$.` },
          ].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: ['Only the vertical motion decides when it lands.', t`$0 = (v_0\sin\theta)t - \tfrac12 g t^2$, so $t = 2v_0\sin\theta/g$.`],
          teach: 'Over level ground, the time of flight is 2v₀ sin θ / g — set by the vertical motion alone.',
          explain: t`$t = \dfrac{2v_0\sin\theta}{g} = \dfrac{2(${v0})\sin ${th}^\circ}{9.8} = ${s3(T)}$ s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, v0 * Math.cos(th * D2R) * T * 1.1], y: [0, (v0 * Math.sin(th * D2R)) ** 2 / (2 * G) * 1.3], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ fn: traj(v0, th), domain: [0, v0 * Math.cos(th * D2R) * T], color: 'accent' }],
            },
            caption: 'The ball’s path over level ground, to scale.',
          },
        };
      },
    }),
    num({
      id: 'from-cliff', difficulty: 3,
      gen(r) {
        const v0 = r.pick([15, 20, 25]), th = r.pick([20, 30, 40]), h = r.pick([20, 30, 45]);
        const vx = v0 * Math.cos(th * D2R), vy = v0 * Math.sin(th * D2R);
        const T = (vy + Math.sqrt(vy * vy + 2 * G * h)) / G, R = vx * T;
        return {
          prompt: t`A stone is thrown at ${v0} m/s, ${th}° above the horizontal, from the top of a cliff ${h} m above the sea. Ignoring air resistance, how far from the foot of the cliff does it hit the water?`,
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: (v0 * v0 * Math.sin(2 * th * D2R)) / G, feedback: t`That is the range back to the launch height. The stone keeps falling the extra ${h} m.` },
            { value: vx * Math.sqrt((2 * h) / G), feedback: 'That ignores the upward part of the launch velocity: the stone rises before it falls.' },
          ],
          hints: [t`Vertical: $0 = ${h} + (${v0}\sin ${th}^\circ)t - 4.9t^2$. Solve for the positive $t$.`, t`$t = \dfrac{v_{0y} + \sqrt{v_{0y}^2 + 2gh}}{g}$; then $x = (v_0\cos\theta)\,t$.`],
          teach: 'For a launch above the landing level, get the time from the vertical quadratic, then multiply by the horizontal velocity.',
          explain: t`$v_{0y} = ${s3(vy)}$ m/s, $v_x = ${s3(vx)}$ m/s. The positive root of $0 = ${h} + ${s3(vy)}t - 4.9t^2$ is $t = ${s3(T)}$ s, so $x = (${s3(vx)})(${s3(T)}) = ${s3(R)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2, R * 1.12], y: [0, (h + (vy * vy) / (2 * G)) * 1.2], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ fn: traj(v0, th, h), domain: [0, R], color: 'accent' }],
              hlines: [{ y: h, label: 'cliff top', color: 'ink4' }],
            },
            caption: 'The stone’s path above the sea (y = 0), to scale.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-airdrop', difficulty: 3, transfer: true,
      gen(r) {
        const u = r.pick([50, 60, 70, 80]), H = r.pick([100, 120, 150, 200]);
        const tt = Math.sqrt((2 * H) / G), d = u * tt;
        return {
          prompt: t`A relief aircraft flying level at ${u} m/s, ${H} m above flat ground, releases a supply package. Ignoring air resistance, how far ahead of the release point (measured along the ground) does the package land?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: tt, feedback: 'That is the fall time in seconds. The package keeps the aircraft’s horizontal speed while it falls.' },
            { value: (u * 2 * H) / G, feedback: t`Check the fall time: $t = \sqrt{2H/g}$.` },
          ],
          hints: ['The package leaves with the aircraft’s horizontal velocity and zero vertical velocity.', t`$t = \sqrt{2H/g}$, then $d = ut$.`],
          teach: 'A released object keeps the carrier’s horizontal velocity and falls freely from rest vertically.',
          explain: t`$t = \sqrt{2(${H})/9.8} = ${s3(tt)}$ s and $d = (${u})(${s3(tt)}) = ${s3(d)}$ m. Real drops use parachutes and drag-corrected release points.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.1 * d, d * 1.25], y: [0, H * 1.4], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              hlines: [{ y: 0, color: 'ink3' }],
              points: [{ x: 0, y: H, color: 'accent', r: 6, label: 'release' }],
              arrows: [{ from: [0, H], to: [u * 1.5, H], color: 'gold', label: `${u} m/s` }],
            },
            caption: 'The aircraft at the moment of release; the velocity arrow shows 1.5 s of travel.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-below', difficulty: 2, transfer: true,
      prompt: 'In that drop, the aircraft keeps flying straight and level at constant speed. Ignoring air resistance, where is the aircraft when the package hits the ground?',
      choices: ['Directly above the package', 'Some way ahead of the package', 'Some way behind the package', 'Directly above the point where the package was released'],
      answer: 0,
      why: {
        1: 'Both have the same horizontal velocity the whole time, so neither gets ahead of the other horizontally. (With real air drag, the package does lag behind.)',
        2: 'The package cannot outrun the aircraft horizontally: their horizontal velocities are equal.',
        3: 'The package does not stop moving forward when released; it keeps the aircraft’s horizontal velocity.',
      },
      hints: ['Compare the horizontal velocities of the aircraft and the package after release.'],
      teach: 'A released object shares its carrier’s horizontal velocity, so (without air) it stays directly below a carrier flying at constant velocity.',
      explain: t`The package’s horizontal velocity stays equal to the aircraft’s, so it is always directly beneath it, falling. From the cockpit it would seem to drop straight down.`,
      visual: {
        type: 'graph',
        params: {
          x: [-30, 420], y: [0, 210], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
          hlines: [{ y: 0, color: 'ink3' }],
          points: [{ x: 0, y: 150, color: 'accent', r: 6, label: 'release' }],
          arrows: [{ from: [0, 150], to: [105, 150], color: 'gold', label: 'v' }],
        },
        caption: 'The moment of release: aircraft and package have the same velocity.',
      },
    }),
    num({
      id: 'cp-height', difficulty: 2,
      gen(r) {
        const v0 = r.pick([20, 25, 30]), th = r.pick([30, 45, 60]);
        const H = (v0 * Math.sin(th * D2R)) ** 2 / (2 * G);
        return {
          prompt: t`A water jet leaves a nozzle at ${v0} m/s, ${th}° above the horizontal. Ignoring air resistance, how high above the nozzle does it rise?`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v0 * v0) / (2 * G), feedback: t`That would be for a jet straight up. Only the vertical part, $v_0\sin\theta$, carries it upward.` }],
          hints: [t`Use the vertical motion only: $h = \dfrac{(v_0\sin\theta)^2}{2g}$.`],
          teach: 'A projectile’s maximum height depends only on the vertical part of its launch velocity.',
          explain: t`$h = \dfrac{(${v0}\sin ${th}^\circ)^2}{2(9.8)} = ${s3(H)}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2, v0 + 4], y: [-1.5, v0 * 0.95], equal: true, xlabel: 'horizontal (m/s)', ylabel: 'vertical',
              arrows: [{ from: [0, 0], to: [v0 * Math.cos(th * D2R), v0 * Math.sin(th * D2R)], color: 'gold', label: `${v0} m/s` }],
              points: [{ x: 0, y: 0, color: 'ink', r: 5 }, { x: 1.4, y: -1.2, r: 0.1, color: 'ink2', label: `${th}°` }],
            },
            caption: 'The jet’s velocity as it leaves the nozzle.',
          },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §4.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion' }],
});
