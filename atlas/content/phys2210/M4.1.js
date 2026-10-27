// Position, displacement and velocity as vectors: each component is its own
// one-dimensional motion, and the velocity is tangent to the path.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { s3, D2R, span } from './_kinematics.js';

const t = String.raw;

// the explore drone: x = 2t, y = 5 + 4 sin(0.8 t)
const XP = (s) => `2*(${s})`, YP = (s) => `5 + 4*sin(0.8*(${s}))`;

export default lesson({
  id: 'phys2210.M4.1',
  title: 'Position and velocity vectors',
  minutes: 9, difficulty: 2,
  intro: t`In two or three dimensions, **position** is a vector from the origin to the object, $\vec r = x\,\hat\imath + y\,\hat\jmath$. **Displacement** is the change $\Delta\vec r = \vec r_2 - \vec r_1$, and **velocity** is the rate of change of position:

$$\vec v = \frac{d\vec r}{dt} = \frac{dx}{dt}\,\hat\imath + \frac{dy}{dt}\,\hat\jmath$$

Each component is a one-dimensional motion of its own: $v_x$ depends only on how $x$ changes, and $v_y$ only on how $y$ changes. The velocity always points along the path — **tangent** to it, in the direction of motion — and its length is the speed.`,
  symbols: [
    { tex: '\\vec r = x\\,\\hat\\imath + y\\,\\hat\\jmath', text: 'position vector, in m: the arrow from the origin to the object, with components $x$ and $y$' },
    { tex: '\\hat\\imath,\\ \\hat\\jmath', text: 'unit vectors along $+x$ and $+y$: length 1, no units — they only carry direction' },
    { tex: '\\Delta\\vec r = \\vec r_2 - \\vec r_1', text: 'displacement vector, in m: from where the object was to where it is' },
    { tex: '\\vec v = \\dfrac{d\\vec r}{dt}', text: 'velocity vector, in m/s: tangent to the path, pointing the way the object moves' },
    { tex: 'v_x = \\dfrac{dx}{dt},\\ v_y = \\dfrac{dy}{dt}', text: 'velocity components, in m/s — each found from its own coordinate' },
    { tex: '|\\vec v| = \\sqrt{v_x^2 + v_y^2}', text: 'the speed, in m/s' },
  ],
  why: 'Splitting motion into independent components is the move that solves projectiles, orbits and crosswind landings — and later, four-vectors in relativity.',
  visual: {
    type: 'graph',
    title: 'Position, displacement and velocity arrows',
    lead: t`A drone flies along the curve shown, from left to right: $x = 2t$, $y = 5 + 4\sin(0.8t)$ (metres and seconds). The slider $t_1$ moves it along the path; $\Delta t$ sets a later time $t_2 = t_1 + \Delta t$. Blue: the position vectors. Amber: the displacement $\Delta\vec r$. Violet: the average velocity $\Delta\vec r/\Delta t$. Gold: the velocity $\vec v$ at $t_1$.`,
    tasks: [
      'Move t₁: the gold velocity stays tangent to the path, while the blue position vector always starts at the origin.',
      'Shrink Δt: the violet average velocity Δr/Δt swings onto the gold velocity — the same limit as in one dimension.',
      'Watch the readouts: the x-component of velocity never changes (the drone moves east at a steady 2 m/s); all the turning happens in the y-component.',
    ],
    params: {
      x: [0, 17], y: [0, 10.5], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
      sliders: [
        { key: 'T', label: 'Time $t_1$', min: 0, max: 6, step: 0.05, value: 1.5, unit: '\\mathrm{s}', explain: 'Where the drone is on its path.' },
        { key: 'h', label: 'Interval $\\Delta t$', min: 0.05, max: 2.5, step: 0.05, value: 1.5, unit: '\\mathrm{s}', explain: 'The time from $t_1$ to $t_2$.' },
      ],
      curves: [{ param: [XP('t'), YP('t')], t: [0, 8], color: 'ink3', width: 1.6 }],
      arrows: [
        { from: [0, 0], to: [XP('T'), YP('T')], color: 'accent', label: 'r₁' },
        { from: [0, 0], to: [XP('T + h'), YP('T + h')], color: 'accent2', label: 'r₂' },
        { from: [XP('T'), YP('T')], to: [XP('T + h'), YP('T + h')], color: 'warn' },
        { from: [XP('T'), YP('T')], to: [`${XP('T')} + 2`, `${YP('T')} + (4*sin(0.8*(T + h)) - 4*sin(0.8*T))/h`], color: 'violet' },
        { from: [XP('T'), YP('T')], to: [`${XP('T')} + 2`, `${YP('T')} + 3.2*cos(0.8*T)`], color: 'gold', label: 'v' },
      ],
      points: [{ x: `(${XP('T')} + ${XP('T + h')})/2`, y: `(${YP('T')} + ${YP('T + h')})/2`, r: 0.1, color: 'warn', label: 'Δr' }],
      readouts: [
        { label: '$x$', expr: '2*T', unit: '\\mathrm{m}', digits: 3 },
        { label: '$y$', expr: '5 + 4*sin(0.8*T)', unit: '\\mathrm{m}', digits: 3 },
        { label: '$v_x$', expr: '2', unit: '\\mathrm{m/s}', digits: 3 },
        { label: '$v_y$', expr: '3.2*cos(0.8*T)', unit: '\\mathrm{m/s}', digits: 3 },
        { label: 'speed $|\\vec v|$', expr: 'sqrt(4 + (3.2*cos(0.8*T))^2)', unit: '\\mathrm{m/s}', digits: 3 },
        { label: '$|\\Delta\\vec r|/\\Delta t$', expr: 'sqrt((2*h)^2 + (4*sin(0.8*(T + h)) - 4*sin(0.8*T))^2)/h', unit: '\\mathrm{m/s}', digits: 3 },
      ],
    },
    caption: 'A made-up flight path. The velocity arrows are drawn as the displacement the drone would make in 1 s at that velocity, so they share the metre scale of the plot.',
  },
  example: {
    prompt: t`A drone’s position is $\vec r(t) = (3.0t)\,\hat\imath + (12 - 1.0t^2)\,\hat\jmath$, in metres with $t$ in seconds. Find its displacement and average velocity from $t = 0$ to $t = 2.0$ s, and its velocity, speed and direction of motion at $t = 2.0$ s.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 9.5], y: [0, 13], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
        curves: [{ param: ['3*t', '12 - t^2'], t: [0, 3], color: 'ink3', width: 1.6 }],
        arrows: [
          { from: [0, 0], to: [0, 12], color: 'accent', label: 'r(0)' },
          { from: [0, 0], to: [6, 8], color: 'accent2', label: 'r(2)' },
          { from: [0, 12], to: [6, 8], color: 'warn' },
          { from: [6, 8], to: [9, 4], color: 'gold', label: 'v(2)' },
        ],
        points: [{ x: 3, y: 10, r: 0.1, color: 'warn', label: 'Δr' }],
      },
      caption: 'The path (grey), the two position vectors, the displacement, and the velocity at 2.0 s drawn as its displacement in 1 s.',
    },
    steps: [
      { label: 'Positions', text: t`$\vec r(0) = (0,\ 12)$ m and $\vec r(2.0) = (6.0,\ 8.0)$ m.` },
      { label: 'Displacement', text: t`$\Delta\vec r = (6.0 - 0)\,\hat\imath + (8.0 - 12)\,\hat\jmath = (6.0\,\hat\imath - 4.0\,\hat\jmath)$ m, of size $\sqrt{6.0^2 + 4.0^2} = 7.2$ m.` },
      { label: 'Average velocity', text: t`$\vec v_\text{avg} = \Delta\vec r/\Delta t = (3.0\,\hat\imath - 2.0\,\hat\jmath)$ m/s — along the chord.` },
      { label: 'Velocity', text: t`Differentiate each component: $\vec v = 3.0\,\hat\imath - 2.0t\,\hat\jmath$, so $\vec v(2.0) = (3.0\,\hat\imath - 4.0\,\hat\jmath)$ m/s.` },
      { label: 'Speed and direction', text: t`$|\vec v| = \sqrt{3.0^2 + 4.0^2} = 5.0$ m/s, at $\theta = \arctan(-4.0/3.0) = -53^\circ$: 53° below the $+x$ axis.` },
      { label: 'Sense check', text: t`The average velocity equals the velocity at the midpoint, $t = 1.0$ s, where $\vec v = (3.0,\ -2.0)$ m/s. That works whenever the acceleration is constant — here it is $(0,\ -2.0)\ \text{m/s}^2$.` },
    ],
    answer: t`$\Delta\vec r = (6.0\,\hat\imath - 4.0\,\hat\jmath)$ m; $\vec v_\text{avg} = (3.0\,\hat\imath - 2.0\,\hat\jmath)$ m/s; $\vec v(2.0) = (3.0\,\hat\imath - 4.0\,\hat\jmath)$ m/s, a speed of 5.0 m/s at 53° below $+x$.`,
  },
  practice: [
    num({
      id: 'disp-size', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [5, 12], [6, 8], [8, 15], [9, 12]]);
        const sx = r.sign(), sy = r.sign(), swap = r.bool(0.5);
        const dx = sx * (swap ? b : a), dy = sy * (swap ? a : b);
        const x1 = r.int(-4, 6), y1 = r.int(-3, 6), x2 = x1 + dx, y2 = y1 + dy;
        const d = Math.hypot(dx, dy);
        const xs = [0, x1, x2], ys = [0, y1, y2];
        return {
          prompt: t`A rover moves from $(${x1},\ ${y1})$ m to $(${x2},\ ${y2})$ m. How large is its displacement?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [
            { value: Math.abs(dx) + Math.abs(dy), feedback: 'You added the components. They are perpendicular: combine them with Pythagoras.' },
            { value: Math.abs(Math.hypot(x2, y2) - Math.hypot(x1, y1)), feedback: 'That is the change in distance from the origin. Displacement is the change in position: subtract the vectors first, then take the size.' },
          ].filter((e) => Math.abs(e.value - d) > 0.02 * d),
          hints: [t`$\Delta\vec r = (x_2 - x_1)\,\hat\imath + (y_2 - y_1)\,\hat\jmath$.`, t`Its size is $\sqrt{\Delta x^2 + \Delta y^2}$.`],
          teach: 'The size of a displacement comes from its components by Pythagoras.',
          explain: t`$\Delta\vec r = (${dx},\ ${dy})$ m, so $|\Delta\vec r| = \sqrt{${dx * dx} + ${dy * dy}} = ${d}$ m.`,
          visual: {
            type: 'graph',
            params: {
              x: [Math.min(...xs) - 2, Math.max(...xs) + 3], y: [Math.min(...ys) - 2, Math.max(...ys) + 2], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              arrows: [{ from: [0, 0], to: [x1, y1], color: 'accent', label: 'r₁' }, { from: [0, 0], to: [x2, y2], color: 'accent2', label: 'r₂' }, { from: [x1, y1], to: [x2, y2], color: 'warn' }],
              points: [{ x: (x1 + x2) / 2, y: (y1 + y2) / 2, r: 0.1, color: 'warn', label: 'Δr' }],
            },
            caption: 'The two position vectors and the displacement between them.',
          },
        };
      },
    }),
    num({
      id: 'speed-from-r', difficulty: 2,
      gen(r) {
        const a = r.pick([3, 4, 6]), b = r.pick([0.5, 1, 1.5, 2]), t1 = r.pick([1, 2, 3]);
        const vy = 2 * b * t1, v = Math.hypot(a, vy);
        return {
          prompt: t`A drone’s position is $\vec r(t) = (${a}t)\,\hat\imath + (${nice(b)}t^2)\,\hat\jmath$, in m with $t$ in s. What is its speed at $t = ${t1}$ s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: Math.hypot(a, b * t1), feedback: t`Check $v_y$: the derivative of $${nice(b)}t^2$ is $${nice(2 * b)}t$.` },
            { value: Math.hypot(a * t1, b * t1 * t1) / t1, feedback: 'That is the average speed from t = 0, along the chord. The speed at an instant comes from the derivative.' },
            { value: a + vy, feedback: t`Speeds in perpendicular directions do not add: use $\sqrt{v_x^2 + v_y^2}$.` },
          ].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: ['Differentiate each component separately.', t`$v_x = ${a}$ m/s and $v_y = ${nice(2 * b)}t$; then the speed is $\sqrt{v_x^2 + v_y^2}$.`],
          teach: 'Differentiate each component of the position to get the velocity components, then combine them for the speed.',
          explain: t`$v_x = ${a}$ m/s, $v_y = ${nice(2 * b)}(${t1}) = ${nice(vy)}$ m/s, so $|\vec v| = \sqrt{${a}^2 + ${nice(vy)}^2} = ${s3(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, a * (t1 + 1.2)], y: [0, b * (t1 + 1.2) ** 2], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ param: [`${a}*t`, `${b}*t^2`], t: [0, t1 + 1.2], color: 'ink3', width: 1.6 }],
              points: [{ x: a * t1, y: b * t1 * t1, color: 'gold', label: `t = ${t1} s` }],
            },
            caption: 'The drone’s path. Its velocity at the marked point is tangent to this curve.',
          },
        };
      },
    }),
    mcq({
      id: 'tangent', difficulty: 2,
      prompt: 'A drone flies from left to right along the grey path. At the marked point, which arrow shows the direction of its velocity?',
      choices: ['Arrow A', 'Arrow B', 'Arrow C', 'Arrow D'],
      answer: 0,
      why: {
        1: 'B points along the line from the origin through the drone: that is the direction of the position vector, not the velocity.',
        2: 'C points toward the inside of the curve. For a turning object that is the direction the velocity is *changing* — the acceleration has a part along it — not the velocity itself.',
        3: 'D is tangent to the path but points backward, against the motion.',
      },
      hints: ['Velocity is the direction the drone is moving at that instant.', 'Which arrow follows the path forward?'],
      teach: 'Velocity is always tangent to the path, pointing in the direction of motion.',
      explain: t`$\vec v = d\vec r/dt$ points along the path, the way the drone is going: arrow A, tangent and forward.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 12], y: [0, 8.5], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
          curves: [{ fn: '6 - 0.15*(x - 6)^2', domain: [0.2, 11.8], color: 'ink3', width: 1.6 }],
          points: [{ x: 7, y: 5.85, color: 'ink' }],
          arrows: [
            { from: [7, 5.85], to: [9.299, 5.16], color: 'gold', label: 'A' },
            { from: [7, 5.85], to: [8.842, 7.389], color: 'accent', label: 'B' },
            { from: [7, 5.85], to: [6.31, 3.551], color: 'violet', label: 'C' },
            { from: [7, 5.85], to: [4.701, 6.54], color: 'warn', label: 'D' },
          ],
        },
        caption: 'The drone’s path; it moves from left to right.',
      },
    }),
    num({
      id: 'avg-velocity', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [6, 8], [5, 12], [9, 12]]), k = r.pick([1, 2, 3]), dt = r.pick([2, 4, 5]);
        const dx = a * k, dy = -b * k, x1 = r.int(1, 5) * 10, y1 = r.int(5, 9) * 10;
        const vavg = Math.hypot(dx, dy) / dt;
        return {
          prompt: t`A tracked survey drone flies from $(${x1},\ ${y1})$ m to $(${x1 + dx},\ ${y1 + dy})$ m in ${dt} s. What is the size of its average velocity?`,
          answer: vavg, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (Math.abs(dx) + Math.abs(dy)) / dt, feedback: 'Combine the components with Pythagoras before dividing by the time.' }],
          hints: [t`$\vec v_\text{avg} = \Delta\vec r/\Delta t$: find $\Delta\vec r$ first.`, t`$|\Delta\vec r| = \sqrt{${dx}^2 + ${dy}^2}$.`],
          teach: 'Average velocity is the displacement vector divided by the elapsed time.',
          explain: t`$\Delta\vec r = (${dx},\ ${dy})$ m, of size $${nice(Math.hypot(dx, dy))}$ m, so $|\vec v_\text{avg}| = ${nice(Math.hypot(dx, dy))}/${dt} = ${s3(vavg)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [x1 - 12, x1 + dx + 18], y: [y1 + dy - 8, y1 + 8], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              points: [{ x: x1, y: y1, color: 'accent', label: 'start' }, { x: x1 + dx, y: y1 + dy, color: 'accent', label: 'end' }, { x: x1 + dx / 2, y: y1 + dy / 2, r: 0.1, color: 'warn', label: 'Δr' }],
              arrows: [{ from: [x1, y1], to: [x1 + dx, y1 + dy], color: 'warn' }],
            },
            caption: 'The two tracked positions; the drone’s actual route between them is not known.',
          },
        };
      },
    }),
    num({
      id: 'direction', difficulty: 2,
      gen(r) {
        const vx = r.pick([3, 4, 5, 6, 8]), vy = r.pick([-6, -4, -3, -2, 2, 3, 4, 6]);
        const th = Math.atan2(vy, vx) / D2R;
        return {
          prompt: t`An aircraft’s velocity has components $v_x = ${vx}$ m/s (east) and $v_y = ${vy}$ m/s (north) relative to the ground, as seen from above. At what angle is it moving, measured from east toward north? (Give a negative angle if it is south of east.)`,
          answer: th, units: 'deg', tol: { rel: 0.01, abs: 0.2 },
          errors: [{ value: Math.atan2(vx, Math.abs(vy)) / D2R * Math.sign(vy), feedback: t`That angle is measured from the north–south line. From east, $\theta = \arctan(v_y/v_x)$.` }].filter((e) => Math.abs(e.value - th) > 1),
          hints: [t`$\tan\theta = v_y/v_x$.`, t`$\theta = \arctan(${vy}/${vx})$ — negative because the motion is ${vy < 0 ? 'south' : 'north'} of east.`],
          teach: t`The direction of a velocity follows from its components: $\tan\theta = v_y / v_x$.`,
          explain: t`$\theta = \arctan\dfrac{${vy}}{${vx}} = ${nice(Math.round(th * 10) / 10)}^\circ$${th < 0 ? ', south of east' : ', north of east'}.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, 10], y: [Math.min(0, vy) - 1.5, Math.max(0, vy) + 1.5], equal: true, xlabel: 'east (m/s)', ylabel: 'north',
              arrows: [{ from: [0, 0], to: [vx, 0], color: 'accent', label: 'vx' }, { from: [vx, 0], to: [vx, vy], color: 'good', label: 'vy' }, { from: [0, 0], to: [vx, vy], color: 'gold', label: 'v' }],
            },
            caption: 'The velocity and its two components, seen from above.',
          },
        };
      },
    }),
    expr({
      id: 'vy-expr', difficulty: 2,
      gen(r) {
        const p = r.pick([2, 3, 4]), q = r.pick([6, 8, 10]), c = r.pick([0.5, 1, 2]);
        return {
          prompt: t`A particle moves with $\vec r(t) = (${p}t)\,\hat\imath + (${q}t - ${nice(c)}t^3)\,\hat\jmath$ (in m, with $t$ in s). Find $v_y(t)$.`,
          answer: `${q} - ${3 * c}*t^2`, answerTeX: t`${q} - ${nice(3 * c)}t^2`, lhs: 'v_y(t)',
          vars: { t: [0.5, 3] },
          errors: [
            { answer: `${p}`, feedback: 'That is vₓ. The y-component comes from differentiating y(t).' },
            { answer: `${q} - ${c}*t^2`, feedback: t`Differentiate $t^3$ properly: $3t^2$.` },
            { answer: `${p} + ${q} - ${3 * c}*t^2`, feedback: t`Keep the components separate: $v_y$ depends only on $y(t)$.` },
          ],
          hints: [t`$v_y = dy/dt$ with $y(t) = ${q}t - ${nice(c)}t^3$.`],
          teach: 'Each velocity component is the derivative of its own coordinate.',
          explain: t`$v_y = \dfrac{d}{dt}(${q}t - ${nice(c)}t^3) = ${q} - ${nice(3 * c)}t^2$ m/s, while $v_x = ${p}$ m/s on its own.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, p * Math.sqrt(q / c) * 1.1], y: [0, 1.25 * (2 * q / 3) * Math.sqrt(q / (3 * c))], xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ param: [`${p}*t`, `${q}*t - ${c}*t^3`], t: [0, Math.sqrt(q / c)], color: 'ink3', width: 1.8 }],
            },
            caption: 'The particle’s path from t = 0 until it is back at y = 0.',
          },
        };
      },
    }),
    mcq({
      id: 'vy-zero', difficulty: 2,
      prompt: t`At one instant a moving object has $v_y = 0$ and $v_x = 3$ m/s. What must be true at that instant?`,
      choices: ['Its velocity is horizontal, with a speed of 3 m/s', 'It is at rest', 'It is at the highest point of its path', 'Its acceleration is zero'],
      answer: 0,
      why: {
        1: 'Only one component is zero. With vₓ = 3 m/s it is still moving.',
        2: t`$v_y = 0$ means $y$ is not changing at that instant. That could be a highest point, a lowest point, or just a pause in a climb — not necessarily a peak.`,
        3: t`A zero velocity component says nothing about the acceleration: a ball at the top of a throw has $v_y = 0$ and $a = -g$.`,
      },
      hints: ['Build the velocity vector from its components.'],
      teach: 'A zero component only removes that direction from the velocity; the other component still sets the motion.',
      explain: t`$\vec v = 3\,\hat\imath + 0\,\hat\jmath$ m/s: horizontal, speed 3 m/s. Nothing more is guaranteed about $y$ or the acceleration.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 12.5], y: [-2.5, 6.5], equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
          curves: [{ param: ['3*t', '2 + (t - 2)^3/2'], t: [0, 4], color: 'ink3', width: 1.8 }],
          points: [{ x: 6, y: 2, color: 'ink' }],
          arrows: [{ from: [6, 2], to: [9, 2], color: 'gold', label: 'v' }],
        },
        caption: t`One path on which $v_y = 0$ at the marked point: the object pauses its climb there, then climbs again.`,
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-speed', difficulty: 2,
      gen(r) {
        const a = r.pick([5, 6, 8]), b = r.pick([2, 3, 4]), c = r.pick([1, 1.5, 2]), t1 = r.pick([2, 3]);
        const vx = a, vy = b - 2 * c * t1, v = Math.hypot(vx, vy);
        return {
          prompt: t`A puck slides with $\vec r(t) = (${a}t)\,\hat\imath + (${b}t - ${nice(c)}t^2)\,\hat\jmath$ (in m, with $t$ in s). What is its speed at $t = ${t1}$ s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.abs(vx) + Math.abs(vy), feedback: 'Combine perpendicular components with Pythagoras.' }].filter((e) => Math.abs(e.value - v) > 0.02 * v),
          hints: ['Differentiate each component, then combine.'],
          teach: 'Speed is the size of the velocity vector, built from the derivatives of the coordinates.',
          explain: t`$v_x = ${a}$, $v_y = ${b} - ${nice(2 * c)}t = ${nice(vy)}$ m/s at $t = ${t1}$ s, so $|\vec v| = \sqrt{${a}^2 + (${nice(vy)})^2} = ${s3(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1, a * (t1 + 1) + 1], y: span([...Array(21)].map((_, k) => { const tt = ((t1 + 1) * k) / 20; return b * tt - c * tt * tt; }), 0.15), equal: true, xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ param: [`${a}*t`, `${b}*t - ${c}*t^2`], t: [0, t1 + 1], color: 'ink3', width: 1.8 }],
              points: [{ x: a * t1, y: b * t1 - c * t1 * t1, color: 'gold', label: `t = ${t1} s` }],
            },
            caption: 'The puck’s path across the ice, seen from above.',
          },
        };
      },
    }),
    num({
      id: 'cp-radar', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([0.6, 0.9, 1.2]), dt = r.pick([20, 30, 40]), x1 = r.pick([10, 12, 15]), y1 = r.pick([4, 5, 8]);
        const dx = 3 * k, dy = 4 * k, v = (5 * k * 1000) / dt;
        return {
          prompt: t`An air-traffic radar logs an aircraft at $(${x1}.0,\ ${y1}.0)$ km, and ${dt} s later at $(${nice(x1 + dx)},\ ${nice(y1 + dy)})$ km, in a flat east–north grid. What was its average speed along the straight line between the two fixes, in m/s?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: (5 * k) / dt, feedback: 'Convert kilometres to metres.' },
            { value: (7 * k * 1000) / dt, feedback: 'You added the east and north changes. Use Pythagoras for the straight-line distance.' },
          ],
          hints: ['Find the displacement components in km, then its size.', t`$|\Delta\vec r| = \sqrt{${nice(dx)}^2 + ${nice(dy)}^2}$ km; convert to metres and divide by ${dt} s.`],
          teach: 'Average velocity in 2D is the displacement vector over the time; its size uses Pythagoras.',
          explain: t`$\Delta\vec r = (${nice(dx)},\ ${nice(dy)})$ km, of size $${nice(5 * k)}$ km $= ${nice(5000 * k)}$ m, so $v = ${nice(5000 * k)}/${dt} = ${s3(v)}$ m/s.`,
          visual: {
            type: 'graph',
            params: {
              x: [x1 - 3, x1 + dx + 3], y: [y1 - 2, y1 + dy + 2], equal: true, xlabel: 'east (km)', ylabel: 'north (km)',
              points: [{ x: x1, y: y1, color: 'accent', label: 'fix 1' }, { x: x1 + dx, y: y1 + dy, color: 'accent', label: 'fix 2' }],
              arrows: [{ from: [x1, y1], to: [x1 + dx, y1 + dy], color: 'warn' }],
            },
            caption: 'The two radar fixes on a flat east–north grid (the curvature of the Earth is negligible here).',
          },
        };
      },
    }),
    mcq({
      id: 'cp-orbit', difficulty: 2,
      prompt: 'A satellite in a circular orbit returns to the same point after one 92-minute orbit, moving at a steady 7.7 km/s. What is its average velocity over that one orbit?',
      choices: ['Zero', '7.7 km/s', 'It cannot be found without the orbit’s radius', 'The same as its velocity at the start'],
      answer: 0,
      why: {
        1: '7.7 km/s is its speed, and its average speed. Average velocity uses the displacement, which is zero for a closed orbit.',
        2: 'You need only the displacement and the time — and the displacement is zero.',
        3: 'Its velocity at any one point is 7.7 km/s along the orbit, not zero. The average of the velocity vector over a full circle cancels out.',
      },
      hints: ['What is the satellite’s displacement after one full orbit?'],
      teach: 'Average velocity is displacement over time, so any closed path gives zero, however fast the motion.',
      explain: t`After one orbit $\Delta\vec r = \vec 0$, so $\vec v_\text{avg} = \vec 0$. The average speed is still 7.7 km/s.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 2], y: [-1.8, 1.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['1.5*cos(t)', '1.5*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true }],
          points: [{ x: 1.5, y: 0, color: 'gold', label: 'start = end' }],
          arrows: [{ from: [1.5, 0], to: [1.5, 0.75], color: 'gold', label: 'v' }],
        },
        caption: 'One orbit, drawn schematically: the real orbit is only about 6% wider than the Earth.',
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §4.1', url: 'https://openstax.org/books/university-physics-volume-1/pages/4-1-displacement-and-velocity-vectors' }],
});
