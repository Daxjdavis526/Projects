// Acceleration: the rate of change of velocity, the slope of the v–t graph,
// and what its sign does (and does not) mean.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { G, par, s3 } from './_kinematics.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M3.2',
  title: 'Acceleration',
  minutes: 9, difficulty: 2,
  intro: t`**Acceleration** is the rate at which velocity changes:

$$a_\text{avg} = \frac{\Delta v}{\Delta t}, \qquad a = \frac{dv}{dt}$$

It is the slope of the velocity–time graph, measured in metres per second per second (m/s²). Its sign gives a direction — it does not mean “speeding up”. An object **speeds up** when $v$ and $a$ have the same sign and **slows down** when their signs are opposite. Pilots and launch engineers often quote acceleration in multiples of $g = 9.8\ \text{m/s}^2$.`,
  symbols: [
    { tex: 'a_\\text{avg}', text: 'average acceleration over an interval, in m/s²' },
    { tex: '\\Delta v = v_f - v_i', text: 'change in velocity, in m/s: final minus initial velocity, with signs kept' },
    { tex: '\\Delta t', text: 'elapsed time, in s' },
    { tex: 'a = \\dfrac{dv}{dt}', text: 'instantaneous acceleration, in m/s²: the slope of the $v$–$t$ graph, and the second derivative of position, $d^2x/dt^2$' },
    { tex: '\\text{m/s}^2', text: '“metres per second, per second”: $a = 2\\ \\text{m/s}^2$ means the velocity changes by 2 m/s every second' },
    { tex: 'g', text: '9.8 m/s², the free-fall acceleration near Earth’s surface, often used as a unit: $3g \\approx 29\\ \\text{m/s}^2$' },
  ],
  why: t`Acceleration is where kinematics meets force: Newton’s second law, $\vec F_\text{net} = m\vec a$, says forces produce acceleration — not velocity.`,
  visual: {
    type: 'mech-graphlink',
    title: 'Velocity, acceleration, speeding up and slowing down',
    lead: t`A cart on a long straight track starts at $x = 0$ with velocity $v_0$ and has a constant acceleration $a$. Press **Play** or drag the time slider. The **green** arrow on the cart is its velocity and the **amber** arrow its acceleration; the three graphs share one time axis.`,
    tasks: [
      'Keep v₀ = +8 m/s and a = −2 m/s²: the cart slows, stops at t = 4 s, then speeds up backwards — while a never changes.',
      'Watch the arrows: when green and amber point the same way the speed grows, when they point opposite ways it shrinks — whatever the signs.',
      'Turn on Tangent lines: the slope of the v–t graph equals the value on the a–t graph.',
    ],
    params: {
      a: 'acc', v0: 'v0', T: 8,
      sliders: [
        { key: 'v0', label: 'Initial velocity $v_0$', min: -10, max: 10, step: 0.5, value: 8, unit: '\\mathrm{m/s}', explain: 'Positive means moving in $+x$ (to the right) at $t = 0$.' },
        { key: 'acc', label: 'Acceleration $a$', min: -4, max: 4, step: 0.25, value: -2, unit: '\\mathrm{m/s^2}', explain: 'Constant here; positive points in $+x$.' },
      ],
      ranges: { a: [-4.5, 4.5] },
      readouts: ['t', 'x', 'v', 'speed', 'a'],
    },
    caption: 'A point-like cart with a constant acceleration, as if pushed by a steady net force. The arrows show the directions of v and a, with lengths relative to the largest values in this motion; the grey dots mark where the cart was at equal time steps.',
  },
  example: {
    prompt: t`A car is driving west — the $-x$ direction — at 15 m/s. The driver brakes steadily, and 2.5 s later the car is still moving west, at 5.0 m/s. Find its average acceleration. Is it speeding up or slowing down?`,
    visual: {
      type: 'mech-graphlink',
      params: { a: 4, v0: -15, T: 2.5, panels: ['v', 'a'], readouts: ['t', 'v', 'a'], ranges: { v: [-17, 3], a: [-1, 5] } },
      caption: 'The braking car: v is negative throughout, a is positive, and the speed falls.',
    },
    steps: [
      { label: 'Signs first', text: t`With east as $+x$, $v_i = -15$ m/s and $v_f = -5.0$ m/s.` },
      { label: 'Change in velocity', text: t`$\Delta v = v_f - v_i = -5.0 - (-15) = +10$ m/s.` },
      { label: 'Divide by the time', text: t`$a_\text{avg} = \dfrac{\Delta v}{\Delta t} = \dfrac{+10\ \text{m/s}}{2.5\ \text{s}} = +4.0\ \text{m/s}^2$.` },
      { label: 'Interpret', text: t`$a$ is positive (it points east) while $v$ is negative (the car moves west). Opposite signs: the car **slows down**. A positive acceleration does not mean speeding up, and a negative one does not mean slowing down.` },
      { label: 'Sense check', text: t`The speed fell from 15 m/s to 5.0 m/s, so slowing is right. $4.0\ \text{m/s}^2 \approx 0.41g$: firm, ordinary braking.` },
    ],
    answer: t`$a_\text{avg} = +4.0\ \text{m/s}^2$ (pointing east). The car slows down because $a$ and $v$ point in opposite directions.`,
  },
  practice: [
    num({
      id: 'avg-accel', difficulty: 1,
      gen(r) {
        const v1 = r.int(2, 8), a = r.pick([0.5, 0.8, 1.2, 1.5, 2]), dt = r.int(3, 8), v2 = v1 + a * dt;
        return {
          prompt: t`A cyclist on a straight road speeds up steadily from ${v1} m/s to ${nice(v2)} m/s in ${dt} s. What is her acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: v2 / dt, feedback: 'You divided the final velocity by the time — that ignores the velocity she started with. Use the change in velocity, Δv = v_f − v_i.' }],
          hints: [t`$a = \Delta v/\Delta t$, with $\Delta v = v_f - v_i$.`],
          teach: 'Acceleration is the change in velocity divided by the time it took: the slope of the v–t graph.',
          explain: t`$a = \dfrac{${nice(v2)} - ${v1}}{${dt}} = \dfrac{${nice(v2 - v1)}\ \text{m/s}}{${dt}\ \text{s}} = ${nice(a)}\ \text{m/s}^2$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, dt + 1], y: [0, (v2 + 1) * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${v1} + ${a}*x`, domain: [0, dt], color: 'good' }],
              points: [{ x: 0, y: v1, color: 'gold' }, { x: dt, y: v2, color: 'gold' }],
            },
            caption: 'The cyclist’s velocity against time: a straight line, because the acceleration is constant.',
          },
        };
      },
    }),
    mcq({
      id: 'slowing-left', difficulty: 2,
      prompt: 'A car moving in the −x direction is slowing down. What is the sign of its acceleration?',
      choices: ['Positive', 'Negative', 'Zero', 'It depends on how hard the driver brakes'],
      answer: 0,
      why: {
        1: 'Negative acceleration with negative velocity would make the car go faster in the −x direction. Slowing means a points opposite to v.',
        2: 'Its velocity is changing, so the acceleration cannot be zero.',
        3: 'Braking harder changes the size of a, not its sign.',
      },
      hints: ['Slowing down means the acceleration points opposite to the velocity.', 'The velocity points in −x.'],
      teach: 'An object slows down when its acceleration and velocity have opposite signs.',
      explain: t`$v < 0$ and the speed is falling, so $v$ is getting less negative: $\Delta v > 0$, so $a > 0$. The acceleration points in $+x$, opposite to the motion.`,
    }),
    match({
      id: 'sign-table', difficulty: 2,
      prompt: 'Match each moment to what the object is doing.',
      left: [t`$v = +5$ m/s, $a = +2$ m/s²`, t`$v = +5$ m/s, $a = -2$ m/s²`, t`$v = -5$ m/s, $a = -2$ m/s²`, t`$v = -5$ m/s, $a = +2$ m/s²`],
      right: ['speeding up, moving in +x', 'slowing down, moving in +x', 'speeding up, moving in −x', 'slowing down, moving in −x', 'moving at constant speed'],
      answer: [0, 1, 2, 3],
      hints: ['The sign of v gives the direction of motion.', 'Same signs: speeding up. Opposite signs: slowing down.'],
      teach: 'Speeding up or slowing down depends on whether v and a share a sign, not on the sign of a alone.',
      explain: t`Same signs (rows 1 and 3): the speed grows. Opposite signs (rows 2 and 4): the speed shrinks. None of them has constant speed, because $a \ne 0$ is parallel to the motion.`,
    }),
    {
      type: 'slider', id: 'set-rest', difficulty: 2, param: 'time',
      instruction: 'Drag the time slider to the right moment, then check.',
      gen(r) {
        const [v0, a] = r.pick([[6, -1.5], [8, -2], [9, -3], [5, -2.5], [6, -2], [4, -1], [9, -1.5], [7.5, -2.5], [6, -1]]);
        const ts = -v0 / a;
        return {
          prompt: t`A cart starts at $x = 0$ moving at $${nice(v0)}$ m/s in the $+x$ direction, with a constant acceleration of $${nice(a)}\ \text{m/s}^2$. Set the time slider to the instant when the cart is **momentarily at rest**.`,
          answer: [ts - 0.15, ts + 0.15],
          hints: ['At rest means v = 0: find where the v–t graph crosses the time axis.', 'On the x–t graph it is where the tangent is flat — the turning point.'],
          teach: 'An object is momentarily at rest where its v–t graph crosses zero, which is where its x–t graph has a flat tangent.',
          explain: t`$v = v_0 + at = 0$ gives $t = -v_0/a = ${nice(v0)}/${nice(-a)} = ${nice(ts)}$ s. There the x–t graph peaks and the v–t graph crosses zero; the acceleration is still $${nice(a)}\ \text{m/s}^2$.`,
          visual: {
            type: 'mech-graphlink',
            params: { a, v0, T: 2 * ts, panels: ['x', 'v'], readouts: ['t'], play: false },
            caption: 'Drag the time slider; the dashed line marks the instant on both graphs.',
          },
        };
      },
    },
    num({
      id: 'read-slope', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 1.5, 2, 2.5, -1, -0.5]), t1 = r.int(1, 3), t2 = t1 + r.pick([2, 4]), T = t2 + 3;
        const v0 = a > 0 ? r.int(3, 8) : Math.ceil(-a * T) + r.int(2, 5);     // the train never stops
        const v1 = v0 + a * t1, v2 = v0 + a * t2, vs = [v0, v0 + a * T];
        return {
          prompt: t`The graph shows a train’s velocity along a straight track. Using the two marked points, find its acceleration.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: v2 / t2, feedback: 'You divided one velocity by one time — the slope of a line through the origin. The graph does not pass through the origin: use the changes between the two points.' },
            { value: v2, feedback: 'That is a velocity read off the graph (its height). Acceleration is the slope: Δv/Δt.' },
          ].filter((e) => Math.abs(e.value - a) > 0.05 * Math.abs(a)),
          hints: ['Acceleration is the slope of the v–t graph: rise over run between the two points.', t`$a = \dfrac{${nice(v2)} - ${nice(v1)}}{${t2} - ${t1}}$.`],
          teach: 'A slope is a ratio of changes: use two points on the line, not one point and the origin.',
          explain: t`$a = \dfrac{\Delta v}{\Delta t} = \dfrac{${nice(v2)} - ${nice(v1)}}{${t2} - ${t1}} = \dfrac{${nice(v2 - v1)}}{${t2 - t1}} = ${nice(a)}\ \text{m/s}^2$${a < 0 ? ' — negative, and the train is slowing because its velocity is positive' : ''}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, T], y: [0, Math.max(...vs) * 1.3], xlabel: 't (s)', ylabel: 'v (m/s)',
              curves: [{ fn: `${v0} + ${a}*x`, color: 'good' }],
              points: [{ x: t1, y: v1, color: 'gold', label: `(${t1} s, ${nice(v1)} m/s)` }, { x: t2, y: v2, color: 'gold', label: `(${t2} s, ${nice(v2)} m/s)` }],
            },
            caption: 'Velocity against time for a train. The line does not start at zero velocity.',
          },
        };
      },
    }),
    mcq({
      id: 'rest-not-zero-a', difficulty: 3,
      prompt: 'This cart’s velocity is zero at t = 4 s, where its v–t line crosses the axis. What is its acceleration at that instant?',
      choices: ['−1.5 m/s², the same as at every other moment', 'Zero, because the cart is momentarily at rest', '+1.5 m/s², because the cart is about to reverse', 'Undefined, because the velocity changes sign there'],
      answer: 0,
      why: {
        1: 'Zero velocity is not zero acceleration. If a were zero at t = 4 s, the velocity would stay zero and the cart would never reverse.',
        2: 'The slope of the line does not change sign at the crossing — only the velocity does. The slope is −1.5 m/s² throughout.',
        3: 'The v–t line is smooth and straight through the crossing, so its slope is perfectly well defined there.',
      },
      hints: ['Acceleration is the slope of the v–t graph, not its height.', 'Is the slope of the line any different at t = 4 s?'],
      teach: 'Acceleration is the slope of v–t, so it can be non-zero at an instant when the velocity is zero.',
      explain: t`The line is $v = 6 - 1.5t$, so its slope is $-1.5\ \text{m/s}^2$ everywhere, including at $t = 4$ s. The velocity passes through zero and keeps changing: the cart turns round.`,
      visual: {
        type: 'graph',
        params: { x: [0, 8], y: [-7, 7], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: '6 - 1.5*x', color: 'good' }], points: [{ x: 4, y: 0, color: 'gold' }] },
        caption: 'Velocity against time for a cart on a straight track.',
      },
    }),
    num({
      id: 'parachute', difficulty: 2,
      gen(r) {
        const v1 = r.pick([50, 55, 60]), v2 = r.pick([5, 6]), dt = r.pick([2, 2.5, 3]);
        const aMag = (v1 - v2) / dt;
        return {
          prompt: t`When her parachute opens, a skydiver slows from ${v1} m/s to ${v2} m/s in ${dt} s. What is the magnitude of her average acceleration, in units of $g$ ($g = 9.8\ \text{m/s}^2$)?`,
          answer: aMag / G, tol: { rel: 0.01 },
          errors: [{ value: aMag, feedback: 'That is the acceleration in m/s². To express it in g, divide by 9.8 m/s².' }],
          hints: [t`Find $|\Delta v|/\Delta t$ in m/s² first.`, 'Then divide by 9.8 m/s² to count how many g that is.'],
          teach: 'An acceleration in units of g is the acceleration in m/s² divided by 9.8 m/s².',
          explain: t`$|a| = \dfrac{${v1} - ${v2}}{${dt}} = ${s3(aMag)}\ \text{m/s}^2$, and $${s3(aMag)}/9.8 = ${s3(aMag / G)}$, so about ${s3(aMag / G)} g. Peak loads during an opening are higher than this average.`,
          visual: {
            type: 'mech-graphlink',
            params: { a: aMag, v0: -v1, T: dt, track: false, panels: ['v'], readouts: ['t', 'v'], labels: { v: 'v (m/s), up positive' } },
            caption: 'Up is positive, so her velocity is negative while she falls; its slope is her acceleration. Drawn with the acceleration held at its average value — the real opening is jerkier.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-abort', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([120, 150, 180]), dt = r.pick([2.5, 3, 4]);
        const a = v / dt;
        return {
          prompt: t`In a pad-abort test, a crew capsule’s escape motor takes it from rest to ${v} m/s in ${dt} s. What is its average acceleration?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: a / G, feedback: 'That is the acceleration in units of g. The question asks for m/s².' }, { value: v * dt, feedback: 'Divide the change in velocity by the time — do not multiply.' }],
          hints: [t`$a_\text{avg} = \Delta v/\Delta t$.`, 'It starts from rest, so Δv is the final speed.'],
          teach: 'Average acceleration is the change in velocity over the time taken, whatever pushes the object.',
          explain: t`$a_\text{avg} = \dfrac{${v} - 0}{${dt}} = ${s3(a)}\ \text{m/s}^2$, about ${s3(a / G)} g. The crew lie on their backs so that this load pushes them into their seats.`,
        };
      },
    }),
    mcq({
      id: 'cp-coast', difficulty: 2,
      prompt: 'After its motor burns out, a sounding rocket coasts upward: its velocity is +300 m/s (up positive) and decreasing. Ignoring air resistance, what is its acceleration?',
      choices: ['About −9.8 m/s²: it points down while the rocket moves up, so the rocket slows', 'Zero, because the engine is off', 'Positive, because the rocket is still moving upward', 'Negative now, but it turns positive once the rocket starts to fall'],
      answer: 0,
      why: {
        1: 'With the engine off, gravity still acts — and the velocity is changing, so the acceleration cannot be zero.',
        2: 'Acceleration does not have to point along the motion. Here the velocity is decreasing, so a points opposite to v.',
        3: 'Gravity pulls down the whole time, rising or falling: a stays −9.8 m/s² while v changes sign at the top.',
      },
      hints: ['The velocity is decreasing. What does that say about the sign of a?', 'What force still acts on the rocket after burnout?'],
      teach: 'A coasting rocket’s acceleration points down throughout: it slows on the way up and speeds up on the way down.',
      explain: t`With no thrust and no air, only gravity acts, so $a = -9.8\ \text{m/s}^2$ throughout. Since $v > 0$ and $a < 0$, the rocket slows; after the top, both are negative and it speeds up downward.`,
    }),
    num({
      id: 'cp-docking', difficulty: 2,
      gen(r) {
        const v1 = r.pick([-0.4, -0.3, -0.25]), v2 = r.pick([-0.1, -0.05]), dt = r.pick([10, 20, 25]);
        const a = (v2 - v1) / dt;
        return {
          prompt: t`A spacecraft approaches a space station along a line, with the station at the origin and the craft on the $+x$ side. Its velocity is $${nice(v1)}$ m/s. After a ${dt} s thruster burn it is $${nice(v2)}$ m/s. What was its average acceleration (with its sign)?`,
          answer: a, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: (Math.abs(v2) - Math.abs(v1)) / dt, feedback: 'You subtracted speeds. Subtract velocities, keeping their signs: Δv = v_f − v_i.' }],
          hints: ['Keep the signs: both velocities are negative.', t`$\Delta v = ${nice(v2)} - ${par(v1)}$.`],
          teach: 'Acceleration comes from the change in velocity with signs kept; its sign is a direction.',
          explain: t`$a = \dfrac{${nice(v2)} - ${par(v1)}}{${dt}} = \dfrac{${nice(v2 - v1)}}{${dt}} = ${nice(a)}\ \text{m/s}^2$. Positive while the craft moves in $-x$: the burn is braking the approach.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §3.3', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration' }],
});
