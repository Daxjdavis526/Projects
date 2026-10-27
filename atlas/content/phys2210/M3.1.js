// Position, displacement and velocity: where an object is, how its position
// changes, and velocity as the slope of the position–time graph.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { par, s3, span, lineDomain, co } from './_kinematics.js';

const t = String.raw;

export default lesson({
  id: 'phys2210.M3.1',
  title: 'Position, displacement and velocity',
  minutes: 9, difficulty: 1,
  intro: t`**Position** $x$ says where an object is along a line, measured from an origin you choose; its sign says which side of the origin. **Displacement** is the change in position, $\Delta x = x_f - x_i$: it depends only on where the motion starts and ends, not on the route. Velocity is the rate at which position changes:

$$v_\text{avg} = \frac{\Delta x}{\Delta t}, \qquad v = \frac{dx}{dt}$$

On a graph of $x$ against $t$, the average velocity is the slope of a **secant** line between two moments, and the instantaneous velocity is the slope of the **tangent** at one moment. Radar tracks, GPS fixes and a rocket’s navigation computer all start here.`,
  symbols: [
    { tex: 'x', text: 'position along the line, in metres (m), measured from a chosen origin; negative means the other side of it' },
    { tex: '\\Delta x = x_f - x_i', text: 'displacement, in m: final position minus initial position; its sign gives the direction of the change' },
    { tex: '\\Delta t = t_f - t_i', text: 'elapsed time, in seconds (s)' },
    { tex: 'v_\\text{avg}', text: 'average velocity over an interval, in m/s: displacement divided by elapsed time' },
    { tex: 'v = \\dfrac{dx}{dt}', text: 'instantaneous velocity, in m/s: the limit of $v_\\text{avg}$ as $\\Delta t \\to 0$, the slope of the $x$–$t$ graph. Its sign is the direction of motion; its size $|v|$ is the **speed**' },
    { tex: 'd', text: 'distance travelled: the total length of path covered, in m. It is never negative and never less than $|\\Delta x|$; average speed is $d/\\Delta t$' },
  ],
  why: 'Velocity is the derivative of position, and acceleration is the derivative of velocity: that chain runs through all of mechanics, from braking distances to orbits.',
  visual: {
    type: 'graph',
    title: 'Secant and tangent on a position graph',
    lead: t`A cart is launched up a long, smooth ramp and rolls back down past its starting point: $x = 12t - 2t^2$ (metres and seconds), with $x$ measured up the ramp from the launch point. **Drag the gold point** to choose a time $t_1$; the slider sets an interval $\Delta t$. The violet secant’s slope is the **average** velocity over $[t_1,\ t_1 + \Delta t]$. The gold tangent’s slope is the **instantaneous** velocity at $t_1$.`,
    tasks: [
      'Shrink Δt toward zero: the violet secant swings onto the gold tangent, and the average velocity becomes the instantaneous velocity.',
      'Drag the point to t₁ ≈ 3 s: the tangent is flat, so the cart is momentarily at rest at the top of its climb.',
      'Put t₁ near 1 s and set Δt = 4 s: the average velocity is about zero although the cart travelled 16 m, because its displacement was zero.',
    ],
    params: {
      x: [0, 7.2], y: [-18, 21], xlabel: 't (s)', ylabel: 'x (m)',
      sliders: [{ key: 'h', label: 'Interval $\\Delta t$', min: 0.02, max: 5, step: 0.02, value: 2, unit: '\\mathrm{s}', explain: 'The length of the time interval for the average velocity.' }],
      curves: [{ fn: '12*x - 2*x^2', color: 'accent' }],
      tangent: { fn: '12*x - 2*x^2', at: 1, secant: 'h' },
      readouts: [
        { label: '$t_1$', expr: 'x0', unit: '\\mathrm{s}', digits: 3 },
        { label: '$x(t_1)$', expr: 'y0', unit: '\\mathrm{m}', digits: 3 },
        { label: 'average velocity (violet)', expr: 'secant', unit: '\\mathrm{m/s}', digits: 3 },
        { label: 'instantaneous velocity (gold)', expr: 'slope', unit: '\\mathrm{m/s}', digits: 3 },
      ],
    },
    caption: t`A frictionless ramp, so the cart’s acceleration is constant: $-4\ \text{m/s}^2$ along the ramp. Here $x$ is the position along the ramp, not the height. The graph is not a picture of the path — the cart moves back and forth along one straight line.`,
  },
  example: {
    prompt: t`A delivery drone flies along a straight corridor, with east as $+x$. At $t = 2.0$ s it is at $x = 5.0$ m. It flies east and reaches $x = 9.0$ m at $t = 3.0$ s, turns round, and at $t = 6.0$ s it is at $x = -3.0$ m. Over these 4.0 s, find its displacement, the distance it travelled, its average velocity and its average speed.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 7], y: [-5, 11], xlabel: 't (s)', ylabel: 'x (m)',
        curves: [
          { fn: '5 + 4*(min(x, 3) - 2) - 4*max(0, x - 3)', domain: [2, 6], color: 'accent', label: 'x(t)', labelAt: 4.4 },
          { fn: '5 - 2*(x - 2)', domain: [2, 6], color: 'violet', dash: true, label: 'secant', labelAt: 2.6 },
        ],
        points: [{ x: 2, y: 5, color: 'gold' }, { x: 3, y: 9, color: 'accent2' }, { x: 6, y: -3, color: 'gold' }],
      },
      caption: t`The drone’s $x$–$t$ graph. The dashed secant joins the start and the end: its slope is the average velocity.`,
    },
    steps: [
      { label: 'Displacement', text: t`Only the ends matter: $\Delta x = x_f - x_i = -3.0 - 5.0 = -8.0$ m, that is, 8.0 m west.` },
      { label: 'Distance', text: t`Follow the route: 4.0 m east (from 5.0 m to 9.0 m), then 12.0 m west (from 9.0 m to $-3.0$ m). So $d = 16.0$ m.` },
      { label: 'Average velocity', text: t`$v_\text{avg} = \dfrac{\Delta x}{\Delta t} = \dfrac{-8.0\ \text{m}}{4.0\ \text{s}} = -2.0\ \text{m/s}$ — the slope of the dashed secant.` },
      { label: 'Average speed', text: t`$\dfrac{d}{\Delta t} = \dfrac{16.0\ \text{m}}{4.0\ \text{s}} = 4.0\ \text{m/s}$.` },
      { label: 'Sense check', text: t`Average speed (4.0 m/s) is larger than $|v_\text{avg}|$ (2.0 m/s) because the drone doubled back. The two agree only for motion in one direction.` },
    ],
    answer: t`$\Delta x = -8.0$ m, $d = 16.0$ m, $v_\text{avg} = -2.0$ m/s (west), average speed $4.0$ m/s.`,
  },
  practice: [
    mcq({
      id: 'pool', difficulty: 1,
      prompt: 'A swimmer swims one 50 m length of a pool and straight back, finishing where she started, in 60 s. What is her average velocity over the 60 s?',
      choices: ['0 m/s', '1.7 m/s', '0.83 m/s', 'It cannot be found without knowing her velocity at every moment'],
      answer: 0,
      why: {
        1: 'That is her average *speed*: 100 m of distance in 60 s. Average velocity uses displacement, and she ended where she began.',
        2: 'That treats one 50 m length as the displacement. After the return length she is back at the start, so the displacement is zero.',
        3: t`An average needs only the start, the finish and the elapsed time: $v_\text{avg} = \Delta x/\Delta t$.`,
      },
      hints: ['What is her displacement when she finishes where she started?', 'Displacement is final position minus initial position.'],
      teach: 'Average velocity is displacement over elapsed time, so a round trip has zero average velocity however far it goes.',
      explain: t`$\Delta x = 0$, so $v_\text{avg} = 0/60\ \text{s} = 0$. Her average speed is $100\ \text{m}/60\ \text{s} \approx 1.7$ m/s.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 72], y: [0, 60], xlabel: 't (s)', ylabel: 'x (m)',
          curves: [{ fn: '50 - abs(50 - 5*x/3)', domain: [0, 60], color: 'accent' }],
          points: [{ x: 0, y: 0, color: 'gold', label: 'start' }, { x: 60, y: 0, color: 'gold', label: 'finish' }],
        },
        caption: 'Her distance from the starting wall against time, drawn with a steady speed.',
      },
    }),
    num({
      id: 'avg-velocity', difficulty: 1,
      gen(r) {
        const v = r.pick([-4, -3, -2.5, -2, -1.5, 1.5, 2, 2.5, 3, 4]);
        const dt = r.int(2, 6), t1 = r.int(1, 4), t2 = t1 + dt;
        let x1 = r.int(-8, 8);
        if (x1 === v * t1) x1 += x1 >= 0 ? -3 : 3;     // keep the slope-through-the-origin slip distinct
        const x2 = x1 + v * dt;
        return {
          prompt: t`A cart on a straight track is at $x = ${nice(x1)}$ m at $t = ${t1}$ s and at $x = ${nice(x2)}$ m at $t = ${t2}$ s. What is its average velocity over this interval?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: x2 / t2, feedback: 'You divided a position by a time — that is the slope of a line from the origin. Average velocity uses the changes: Δx/Δt.' },
            { value: (x1 + x2) / 2, feedback: 'That is the average of the two positions, not a velocity. Divide the change in position by the change in time.' },
          ].filter((e) => Math.abs(e.value - v) > 0.05 * Math.abs(v)),
          hints: [t`Use $v_\text{avg} = \dfrac{x_f - x_i}{t_f - t_i}$, keeping every sign.`],
          teach: 'Average velocity is the change in position divided by the change in time — the slope of the secant between the two points.',
          explain: t`$v_\text{avg} = \dfrac{${nice(x2)} - ${par(x1)}}{${t2} - ${t1}} = \dfrac{${nice(x2 - x1)}\ \text{m}}{${dt}\ \text{s}} = ${nice(v)}$ m/s${v < 0 ? ': the cart moved in the $-x$ direction' : ''}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, t2 + 1], y: span([x1, x2], 0.2), xlabel: 't (s)', ylabel: 'x (m)',
              curves: [{ fn: `${x1} + ${v}*(x - ${t1})`, domain: [t1, t2], color: 'violet', dash: true }],
              points: [{ x: t1, y: x1, color: 'gold' }, { x: t2, y: x2, color: 'gold' }],
            },
            caption: 'Only the two measured positions are known. The slope of the dashed secant between them is the average velocity.',
          },
        };
      },
    }),
    num({
      id: 'there-and-back', difficulty: 2,
      gen(r) {
        const d1 = r.int(60, 150), d2 = r.int(20, d1 - 15), T = r.pick([40, 50, 60, 80, 100]);
        const v = (d1 - d2) / T;
        return {
          prompt: t`A test rover drives ${d1} m east along a straight track, then reverses ${d2} m west. The whole trip takes ${T} s. Taking east as positive, what is its average velocity?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (d1 + d2) / T, feedback: 'That is the average speed: you used the distance travelled. Average velocity uses the displacement, and the two legs partly cancel.' }],
          hints: ['Find the displacement first: the two legs point in opposite directions.', t`$\Delta x = (+${d1}\ \text{m}) + (-${d2}\ \text{m})$; then divide by the total time.`],
          teach: 'Displacements in opposite directions subtract; distances always add.',
          explain: t`$\Delta x = ${d1} - ${d2} = ${d1 - d2}$ m east, so $v_\text{avg} = ${d1 - d2}/${T} = ${s3(v)}$ m/s. (The average speed is $${d1 + d2}/${T} = ${s3((d1 + d2) / T)}$ m/s.)`,
          visual: {
            type: 'mech-graphlink',
            params: { v: `${(d1 + d2) / T}*sgn(${(d1 * T) / (d1 + d2)} - t)`, breaks: [(d1 * T) / (d1 + d2)], T, panels: ['x'], readouts: ['t'] },
            caption: 'The trip drawn with the same speed on both legs (the question does not say; the answer does not depend on it). Press Play.',
          },
        };
      },
    }),
    mcq({
      id: 'negative-velocity', difficulty: 2,
      prompt: 'The graph shows a cart’s position along a straight track. During which interval is its velocity negative?',
      choices: ['From 6 s to 10 s', 'From 0 s to 2 s', 'From 9 s to 10 s only', 'From 4 s to 6 s'],
      answer: 0,
      why: {
        1: 'There the *position* is negative, but the line slopes upward: the cart is moving in the +x direction. Velocity is the slope, not the height.',
        2: 'The cart moves in the −x direction from 6 s onward, not only after it passes the origin. The sign of x says where the cart is; the sign of v says which way it is going.',
        3: 'The line is flat there: the cart is at rest, so its velocity is zero, not negative.',
      },
      hints: ['Velocity is the slope of the x–t graph, not its height.', 'Look for where the line slopes downward.'],
      teach: 'On an x–t graph the sign of the velocity is the sign of the slope; the sign of x only says which side of the origin the object is on.',
      explain: t`From 6 s to 10 s the line falls 8 m in 4 s: $v = -2$ m/s. From 0 to 4 s it rises ($v = +3$ m/s) — even while $x$ is negative — and from 4 s to 6 s it is flat ($v = 0$).`,
      visual: {
        type: 'graph',
        params: { x: [0, 10.4], y: [-7, 7.5], xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: '-6 + 3*min(x, 4) - 2*max(0, x - 6)', color: 'accent' }] },
        caption: 'Position against time for a cart on a straight track.',
      },
    }),
    num({
      id: 'derivative', difficulty: 2,
      gen(r) {
        const b = r.pick([10, 12, 14, 16, 18, 20]), c = r.pick([1, 1.5, 2, 2.5]);
        const t1 = r.pick([1, 2, 3, 4].filter((k) => b - 2 * c * k !== 0));
        const v = b - 2 * c * t1, x1 = b * t1 - c * t1 * t1;
        const T = Math.max(t1 + 2, 6);
        const xs = []; for (let k = 0; k <= 40; k++) { const tt = (T * k) / 40; xs.push(b * tt - c * tt * tt); }
        const yr = span(xs, 0.15);
        return {
          prompt: t`A cart’s position is $x(t) = ${b}t - ${co(c)}t^2$, with $x$ in metres and $t$ in seconds. What is its velocity at $t = ${t1}$ s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: b - c * t1, feedback: t`That is the *average* velocity from $t = 0$ to $t = ${t1}$ s, the slope of a secant from the origin. The velocity at one instant is the derivative.` },
            { value: x1, feedback: t`That is the cart’s *position* at $t = ${t1}$ s. Velocity is how fast the position changes: differentiate.` },
          ],
          hints: [t`Instantaneous velocity is the derivative: $v = dx/dt$.`, t`$v(t) = ${b} - ${nice(2 * c)}t$; substitute $t = ${t1}$ s.`],
          teach: 'Instantaneous velocity is the derivative of position — the slope of the tangent to the x–t graph.',
          explain: t`$v = \dfrac{dx}{dt} = ${b} - ${nice(2 * c)}t$, so $v(${t1}) = ${b} - ${nice(2 * c * t1)} = ${nice(v)}$ m/s${v < 0 ? ', moving back toward the origin' : ''}. It is the slope of the gold tangent line.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, T], y: yr, xlabel: 't (s)', ylabel: 'x (m)',
              curves: [{ fn: `${b}*x - ${c}*x^2`, color: 'accent' }, { fn: `${x1} + ${v}*(x - ${t1})`, domain: lineDomain(x1, v, t1, [0, T], yr), color: 'gold', dash: true }],
              points: [{ x: t1, y: x1, color: 'gold' }],
            },
            caption: t`The cart’s $x$–$t$ graph, with the tangent at $t = ${t1}$ s dashed.`,
          },
        };
      },
    }),
    mcq({
      id: 'crossing', difficulty: 2,
      prompt: 'The x–t graphs of two cars on a straight road cross at t = 4 s. What is true at that instant?',
      choices: ['They are at the same position', 'They have the same velocity', 'They have the same speed but move in opposite directions', 'Car B is about to overtake car A'],
      answer: 0,
      why: {
        1: 'Equal *heights* on an x–t graph mean equal positions. Velocity is the slope, and A’s line is twice as steep as B’s.',
        2: 'Both lines slope upward, so both cars move in +x — and at different speeds.',
        3: 'It is the other way round: A’s line is steeper, so A is faster and pulls ahead of B after t = 4 s.',
      },
      hints: ['What does the height of an x–t graph tell you? What does its slope tell you?'],
      teach: 'Where two x–t graphs cross, the objects are at the same place — their velocities are the slopes, which can differ.',
      explain: t`At the crossing $x_A = x_B = 8$ m: the cars are side by side. A’s slope is 2 m/s and B’s is 1 m/s, so A is the faster car and is overtaking B.`,
      visual: {
        type: 'graph',
        params: { x: [0, 8], y: [0, 16.5], xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: '2*x', color: 'accent', label: 'A', labelAt: 6.6 }, { fn: '4 + x', color: 'warn', label: 'B', labelAt: 7.2 }] },
        caption: 'Positions of cars A and B against time.',
      },
    }),
    mcq({
      id: 'sign-slip', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “The car moved from $x = -30$ m to $x = 10$ m, so its displacement is $10 - 30 = -20$ m.” What is wrong?`,
      choices: [
        t`$x_i$ is $-30$ m, so $\Delta x = 10 - (-30) = +40$ m`,
        t`Displacement is initial minus final: $-30 - 10 = -40$ m`,
        t`Displacement is the final distance from the origin, $10$ m`,
        'Nothing: a car that crosses the origin has a negative displacement',
      ],
      answer: 0,
      why: {
        1: 'Displacement is always final minus initial. Reversing the order flips the sign — and the car moved toward +x.',
        2: 'That is the final *position*. Displacement is the change in position, so it depends on where the car started.',
        3: 'Crossing the origin says nothing about the sign of Δx. The car moved toward +x, so Δx is positive.',
      },
      hints: [t`Write $\Delta x = x_f - x_i$ and substitute the values with their signs.`, 'Subtracting a negative number adds its size.'],
      teach: 'Displacement is final minus initial position, with every sign kept.',
      explain: t`$\Delta x = x_f - x_i = 10 - (-30) = +40$ m: the car moved 40 m in the $+x$ direction.`,
      visual: {
        type: 'graph',
        params: {
          x: [-40, 22], y: [-1.3, 1.5], axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '0', color: 'ink3', width: 1.5 }],
          points: [
            { x: -30, y: 0, color: 'accent' }, { x: 0, y: 0, color: 'ink3' }, { x: 10, y: 0, color: 'gold' },
            { x: -32, y: -0.55, r: 0.1, color: 'accent', label: 'start, −30 m' }, { x: -1, y: -0.55, r: 0.1, color: 'ink3', label: '0' }, { x: 8, y: -0.55, r: 0.1, color: 'gold', label: 'end, 10 m' },
          ],
          arrows: [{ from: [-30, 0.6], to: [10, 0.6], color: 'warn', label: 'Δx' }],
        },
        caption: 'The car’s start and end positions on the x axis.',
      },
    }),
    {
      type: 'slider', id: 'zero-average', difficulty: 2, param: 'h',
      instruction: 'Drag the Δt slider until the average velocity is zero, then check.',
      gen(r) {
        const t1 = r.pick([0.5, 1, 1.5, 2]);
        const x1 = 12 * t1 - 2 * t1 * t1, target = 6 - 2 * t1;
        const start = target > 3 ? 1 : 4.6;
        const xe = `12*(${t1} + h) - 2*(${t1} + h)^2`;
        return {
          prompt: t`The cart from the explore step has $x = 12t - 2t^2$. Starting at $t_1 = ${t1}$ s, set the interval $\Delta t$ so that the cart’s **average velocity** over $[t_1,\ t_1 + \Delta t]$ is zero.`,
          answer: [target - 0.15, target + 0.15],
          hints: ['Average velocity is zero when the displacement is zero.', 'Make the violet secant horizontal: both of its ends at the same height.'],
          teach: 'Zero average velocity means zero displacement: the object ends where it began, even if it travelled a long way.',
          explain: t`The secant is flat when $x(t_1 + \Delta t) = x(t_1) = ${nice(x1)}$ m. The parabola is symmetric about its peak at $t = 3$ s, so the cart returns to that position at $t = ${nice(6 - t1)}$ s: $\Delta t = ${nice(target)}$ s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 7.2], y: [-18, 21], xlabel: 't (s)', ylabel: 'x (m)',
              sliders: [{ key: 'h', label: 'Interval $\\Delta t$', min: 0.5, max: 5.5, step: 0.05, value: start, unit: '\\mathrm{s}', explain: 'The end of the interval is at $t_1 + \\Delta t$.' }],
              curves: [
                { fn: '12*x - 2*x^2', color: 'accent' },
                { fn: `${x1} + ((${xe} - ${x1})/h)*(x - ${t1})`, domain: [Math.max(0, t1 - 0.6), `${t1} + h + 0.6`], color: 'violet', dash: true },
              ],
              points: [{ x: t1, y: x1, color: 'gold' }, { x: `${t1} + h`, y: xe, color: 'violet' }],
            },
            caption: 'The violet secant joins the cart’s positions at the start and end of the interval.',
          },
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([2, 2.5, 3, 4]), B = r.pick([0.05, 0.1, 0.2]), t1 = r.pick([5, 8, 10, 12]);
        const v = 2 * A * t1 + 3 * B * t1 * t1, h1 = A * t1 * t1 + B * t1 ** 3;
        return {
          prompt: t`For the first seconds after lift-off, a sounding rocket’s altitude is well described by $h(t) = ${nice(A)}t^2 + ${nice(B)}t^3$, with $h$ in metres and $t$ in seconds. What is its vertical velocity at $t = ${t1}$ s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: h1 / t1, feedback: t`That is the average velocity over the first ${t1} s. The velocity at an instant is the derivative $dh/dt$.` },
            { value: h1, feedback: 'That is the altitude, not the velocity. Differentiate h(t).' },
          ],
          hints: [t`Velocity is $v = dh/dt$.`, t`Differentiate term by term: $\dfrac{d}{dt}t^n = n\,t^{n-1}$.`],
          teach: 'The vertical velocity is the time derivative of the altitude.',
          explain: t`$v = \dfrac{dh}{dt} = ${nice(2 * A)}t + ${nice(3 * B)}t^2$, so $v(${t1}) = ${nice(2 * A * t1)} + ${nice(3 * B * t1 * t1)} = ${nice(v)}$ m/s. (The altitude then is ${nice(h1)} m.)`,
          visual: {
            type: 'graph',
            params: {
              x: [0, t1 + 3], y: [0, (A * (t1 + 3) ** 2 + B * (t1 + 3) ** 3) * 1.08], xlabel: 't (s)', ylabel: 'h (m)',
              curves: [{ fn: `${A}*x^2 + ${B}*x^3`, color: 'accent' }],
              points: [{ x: t1, y: h1, color: 'gold' }],
            },
            caption: 'The rocket’s altitude against time in the first seconds of flight (a fit, valid only early in the burn).',
          },
        };
      },
    }),
    mcq({
      id: 'cp-speed-bound', difficulty: 2,
      prompt: 'Over some interval, an object moving along a line has an average velocity of −3 m/s. Its average speed over the same interval could be:',
      choices: ['5 m/s', '2 m/s', '−3 m/s', '0 m/s'],
      answer: 0,
      why: {
        1: 'Average speed can never be less than the size of the average velocity: the distance travelled is at least |Δx|.',
        2: 'Speed is a magnitude, so it is never negative.',
        3: 'If the average speed were zero, the object never moved — then the average velocity would be zero too.',
      },
      hints: [t`Compare the distance $d$ with $|\Delta x|$.`, t`Average speed $= d/\Delta t$ and $d \ge |\Delta x|$.`],
      teach: 'Distance travelled is never less than the size of the displacement, so average speed is never less than the size of the average velocity.',
      explain: t`$d \ge |\Delta x|$, so the average speed is at least $|v_\text{avg}| = 3$ m/s. 5 m/s is possible, for example if the object doubled back during the interval.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4.3], y: [-9, 10], xlabel: 't (s)', ylabel: 'x (m)',
          curves: [{ fn: '6 - 3*x + 4*sin(pi*x/2)', domain: [0, 4], color: 'accent' }, { fn: '6 - 3*x', domain: [0, 4], color: 'violet', dash: true }],
          points: [{ x: 0, y: 6, color: 'gold' }, { x: 4, y: -6, color: 'gold' }],
        },
        caption: 'One motion with an average velocity of −3 m/s over 4 s: the dashed secant has slope −3 m/s, but the object doubles back along the way.',
      },
    }),
    num({
      id: 'cp-approach', difficulty: 2,
      gen(r) {
        const xa = r.pick([4.2, 4.8, 5.4, 6.0]), xb = r.pick([1.2, 1.5, 1.8]), T = r.pick([30, 40, 45]);
        const v = ((xb - xa) * 1000) / T;
        return {
          prompt: t`A radar tracks an aircraft on its final approach along a straight line. Its position $x$ is measured from the runway threshold, positive away from the runway. At $t = 0$ it is at $x = ${xa}$ km; ${T} s later it is at $x = ${xb}$ km. What is its average velocity, in m/s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (xb - xa) / T, feedback: 'Convert kilometres to metres before dividing: 1 km = 1000 m.' }],
          hints: ['Find Δx in metres, keeping its sign.', t`$v_\text{avg} = \Delta x/\Delta t$ with $\Delta x = (${xb} - ${xa})\times 1000$ m.`],
          teach: 'Average velocity is Δx/Δt in consistent units, and its sign shows the direction of travel.',
          explain: t`$\Delta x = (${xb} - ${xa})$ km $= ${nice((xb - xa) * 1000)}$ m, so $v_\text{avg} = ${nice((xb - xa) * 1000)}/${T} = ${s3(v)}$ m/s. The minus sign means it is closing on the runway.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.8, 6.8], y: [-1.3, 1.4], axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ fn: '0', color: 'ink3', width: 1.5 }],
              points: [
                { x: 0, y: 0, color: 'ink' }, { x: xa, y: 0, color: 'accent' }, { x: xb, y: 0, color: 'gold' },
                { x: -0.45, y: -0.55, r: 0.1, color: 'ink2', label: 'runway, x = 0' }, { x: xa - 0.3, y: 0.55, r: 0.1, color: 'accent', label: 't = 0' }, { x: xb - 0.3, y: 0.55, r: 0.1, color: 'gold', label: `t = ${T} s` },
              ],
              arrows: [{ from: [xa, -0.55], to: [xb, -0.55], color: 'warn' }],
            },
            caption: 'The approach path, with positions measured from the runway threshold (horizontal scale only).',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §3.1', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-1-position-displacement-and-average-velocity' },
    { label: 'OpenStax University Physics Vol. 1, §3.2', url: 'https://openstax.org/books/university-physics-volume-1/pages/3-2-instantaneous-velocity-and-speed' },
  ],
});
