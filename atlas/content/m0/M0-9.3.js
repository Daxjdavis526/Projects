// Parametric descriptions of motion — a path as two functions of time, x(t) and y(t); a projectile as the classic example.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { D2R, circ, plane, dot, note } from './_m0geo.js';

const t = String.raw;
const G = { Earth: 9.81, Moon: 1.62, Mars: 3.71 };
// a projectile path x = u t, y = h + w t − (g/2) t², with a dot every `dt` seconds
const pathPic = ({ u, w, g, h = 0, dt = 1, upto, caption, labels = false, extra = {}, xlabel = 'x (m)', ylabel = 'y (m)' }) => {
  const tf = (w + Math.sqrt(w * w + 2 * g * h)) / g, T = upto ?? tf, X = u * tf, H = h + (w * w) / (2 * g);
  const pts = [];
  for (let k = 0; k * dt <= T + 1e-9; k++) pts.push(dot([u * k * dt, h + w * k * dt - (g / 2) * (k * dt) ** 2], labels ? `${N(k * dt)} s` : '', { r: 4, labelDx: 4, labelDy: -10 }));
  const half = Math.max(X / 2 + X * 0.08, H * 1.15);
  return plane({
    x: [+(X / 2 - half).toFixed(3), +(X / 2 + half).toFixed(3)], y: [-0.06 * half, 0.94 * half],
    curves: [{ param: [`${N(u)}*t`, `${N(h)} + ${N(w)}*t - ${N(g / 2)}*t^2`], t: [0, N(tf)], color: 'accent', width: 2.4 }],
    points: pts, xlabel, ylabel, caption, extra,
  });
};

export default lesson({
  id: 'm0.M0-9.3',
  title: 'Parametric descriptions of motion',
  minutes: 10, difficulty: 2,
  intro: t`A graph $y = f(x)$ shows the shape of a path, but not **when** you are where. A parametric description gives both coordinates as functions of a third variable, the **parameter** — for motion, the time $t$:

$$x = x(t), \qquad y = y(t)$$

Each value of $t$ is one instant and one point; as $t$ runs, the point traces the path. A projectile launched at speed $v_0$ and angle $\alpha$ is the classic case: steady motion across, uniformly decelerated motion up,
$$x = v_0\cos\alpha\; t, \qquad y = v_0\sin\alpha\; t - \tfrac12 g t^2.$$
To get the **shape** alone, **eliminate the parameter**: solve one equation for $t$ and substitute into the other. Here that gives a parabola.`,
  symbols: [
    { tex: 't', text: 'the parameter — here the time since launch, in s' },
    { tex: 'x(t),\\ y(t)', text: 'the horizontal and vertical position at time $t$, in m' },
    { tex: 'v_0', text: 'the launch speed, in m/s' },
    { tex: '\\alpha', text: 'the launch angle above the horizontal' },
    { tex: 'v_0\\cos\\alpha,\\ v_0\\sin\\alpha', text: 'the horizontal and vertical parts of the launch velocity, in m/s' },
    { tex: 'g', text: 'the acceleration due to gravity: $9.81\\ \\text{m/s}^2$ on Earth, $3.71$ on Mars, $1.62$ on the Moon' },
  ],
  why: t`Physics describes motion this way from Physics I onward: a position vector $\vec r(t) = (x(t),\ y(t))$, whose rate of change is the velocity. Orbits, charged particles in fields and a point on a rolling wheel are all parametric curves, and [Calculus II](#/lesson/math1220.C2-6.1) differentiates and measures them.`,
  visual: {
    type: 'graph',
    title: 'A projectile, frame by frame',
    lead: t`The dashed curve is the whole path; the solid part and the gold point are where the projectile has got to by time $t$. The dots are one tenth of the flight time apart. Change the launch and slide the time.`,
    tasks: [
      t`Look at the dots: they are **evenly spaced across** — $x$ grows at a steady $v_0\cos\alpha$ — but bunch up near the top, where the vertical speed is small.`,
      t`Slide the time to half the flight: the projectile is exactly at the top. Up and down take equal times.`,
      t`Try $\alpha = 30^\circ$ and $\alpha = 60^\circ$ at the same speed: the same range (complementary angles), but very different heights and flight times.`,
    ],
    params: {
      x: [-2, 44], y: [-1.5, 21.5], equal: true, aspect: 'wide', xlabel: 'x (m)', ylabel: 'y (m)',
      sliders: [
        { key: 'v', label: t`Launch speed $v_0$`, min: 5, max: 20, step: 0.5, value: 16, unit: '\\text{m/s}', explain: 'How fast it leaves the ground.' },
        { key: 'a', label: t`Launch angle $\alpha$`, min: 10, max: 80, step: 1, value: 50, unit: '^\\circ', explain: 'Above the horizontal.' },
        { key: 's', label: 'Time, as a fraction of the flight', min: 0, max: 1, step: 0.01, value: 0.3, explain: t`$0$ is launch, $1$ is landing; the flight lasts $2v_0\sin\alpha/g$.` },
      ],
      curves: [
        { param: ['v*cos(a*pi/180)*t*2*v*sin(a*pi/180)/9.81', 'v*sin(a*pi/180)*t*2*v*sin(a*pi/180)/9.81 - 4.905*(t*2*v*sin(a*pi/180)/9.81)^2'], t: [0, 1], color: 'ink3', width: 1.4, dash: true },
        { param: ['v*cos(a*pi/180)*t*s*2*v*sin(a*pi/180)/9.81', 'v*sin(a*pi/180)*t*s*2*v*sin(a*pi/180)/9.81 - 4.905*(t*s*2*v*sin(a*pi/180)/9.81)^2'], t: [0, 1], color: 'accent', width: 2.8 },
      ],
      points: [
        ...Array.from({ length: 11 }, (_, k) => ({ x: `v*cos(a*pi/180)*${k / 10}*2*v*sin(a*pi/180)/9.81`, y: `v*sin(a*pi/180)*${k / 10}*2*v*sin(a*pi/180)/9.81 - 4.905*(${k / 10}*2*v*sin(a*pi/180)/9.81)^2`, r: 3, color: 'ink3' })),
        { x: 'v*cos(a*pi/180)*s*2*v*sin(a*pi/180)/9.81', y: 'v*sin(a*pi/180)*s*2*v*sin(a*pi/180)/9.81 - 4.905*(s*2*v*sin(a*pi/180)/9.81)^2', r: 6, color: 'gold' },
      ],
      readouts: [
        { label: t`$t$ (s)`, expr: 's*2*v*sin(a*pi/180)/9.81', digits: 3 },
        { label: t`$x(t)$ (m)`, expr: 'v*cos(a*pi/180)*s*2*v*sin(a*pi/180)/9.81', digits: 3 },
        { label: t`$y(t)$ (m)`, expr: 'v*sin(a*pi/180)*s*2*v*sin(a*pi/180)/9.81 - 4.905*(s*2*v*sin(a*pi/180)/9.81)^2 + 0', digits: 3 },
        { label: 'flight time (s)', expr: '2*v*sin(a*pi/180)/9.81', digits: 3 },
      ],
    },
    caption: t`To scale, on Earth ($g = 9.81\ \text{m/s}^2$), launched from the ground, with **no air resistance** — a real ball falls short of this path, and a fast one by a lot.`,
  },
  example: {
    prompt: t`On the Moon an astronaut kicks a rock, which then moves as $x = 3t$, $y = 5t - 0.81t^2$ (metres, seconds). When and where does it land, how high does it go, and what is the shape of its path?`,
    visual: pathPic({ u: 3, w: 5, g: 1.62, labels: true, caption: t`The rock’s path, with its position each second. To scale; the Moon has no air, so this is exact apart from the ground’s bumps.` }),
    steps: [
      { label: 'Read the motion', text: t`$x = 3t$: across at a steady $3$ m/s. $y = 5t - 0.81t^2$: up at $5$ m/s at first, slowed by the Moon’s $g = 1.62\ \text{m/s}^2$ (half of it is $0.81$).` },
      { label: 'Landing time', text: t`Landing means $y = 0$: $t(5 - 0.81t) = 0$, so $t = 0$ (the kick) or $t = \tfrac{5}{0.81} = ${sig(5 / 0.81, 4)}$ s.` },
      { label: 'Where', text: t`$x = 3 \times ${sig(5 / 0.81, 4)} = ${sig(15 / 0.81, 4)}$ m from the kick.` },
      { label: 'Top', text: t`By symmetry the top is halfway through the flight, $t = ${sig(2.5 / 0.81, 4)}$ s: $y = 5(${sig(2.5 / 0.81, 4)}) - 0.81(${sig(2.5 / 0.81, 4)})^2 = ${sig(25 / 3.24, 4)}$ m.` },
      { label: 'Eliminate t', text: t`From $x = 3t$, $t = x/3$. Substitute: $y = 5\cdot\tfrac{x}{3} - 0.81\cdot\tfrac{x^2}{9} = \tfrac53 x - 0.09x^2$ — a downward parabola.` },
      { label: 'Check', text: t`At $x = ${sig(15 / 0.81, 4)}$: $\tfrac53(${sig(15 / 0.81, 4)}) - 0.09(${sig(15 / 0.81, 4)})^2 \approx 0$ ✓. On Earth the same kick would land after only $${sig(10 / 9.81, 3)}$ s, $${sig(30 / 9.81, 3)}$ m away.` },
    ],
    answer: t`Lands after $${sig(5 / 0.81, 3)}$ s, $${sig(15 / 0.81, 3)}$ m away; peaks at $${sig(25 / 3.24, 3)}$ m; path $y = \tfrac53 x - 0.09x^2$.`,
  },
  practice: [
    num({
      id: 'height-at-t', difficulty: 1,
      gen(r) {
        const u = r.int(6, 12), w = r.int(10, 18), h = r.pick([0, 2, 5]), T = r.pick([1, 1.5, 2, 2.5]), ans = h + w * T - 4.9 * T * T;
        return {
          prompt: t`A ball moves as $x = ${u}t$, $y = ${h ? `${h} + ` : ''}${w}t - 4.9t^2$ (metres, seconds). How high is it at $t = ${T}$ s?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: h + w * T - 4.9 * T, feedback: t`The last term is $4.9t^2$: square the time first, $${T}^2 = ${T * T}$.` }, { value: u * T, feedback: t`That is $x$, the horizontal position. Height is $y$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`Substitute $t = ${T}$ into $y(t)$ only.`],
          teach: t`A parametric description is a recipe: give it a time, it gives you both coordinates.`,
          explain: t`$y(${T}) = ${h ? `${h} + ` : ''}${w}(${T}) - 4.9(${T})^2 = ${sig(ans, 4)}$ m, while $x = ${u * T}$ m.`,
          visual: pathPic({ u, w, g: 9.8, h, dt: 0.5, caption: t`The ball’s path, with a dot every half second (time labels omitted). No air resistance.` }),
        };
      },
    }),
    num({
      id: 'speed-linear', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [5, 12], [8, 6], [7, 24], [2, 5], [6, 3]]), sa = r.sign(), sb = r.sign(), x0 = r.intExcept(-5, 5, [0]), y0 = r.int(1, 8), ans = Math.hypot(a, b);
        return {
          prompt: t`A drone flies so that $x = ${x0} ${sa < 0 ? '-' : '+'} ${a}t$ and $y = ${y0} ${sb < 0 ? '-' : '+'} ${b}t$ (metres, seconds). How fast is it moving?`,
          answer: ans, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: a + b, feedback: t`Each second it moves $${a}$ m across **and** $${b}$ m up or down, at right angles: combine them with Pythagoras, not by adding.` }, { value: Math.hypot(x0, y0), feedback: t`That is the distance of the start point from the origin. The speed comes from the coefficients of $t$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`In one second $x$ changes by $${sa * a}$ m and $y$ by $${sb * b}$ m.`, t`The distance covered in that second is $\sqrt{(${sa * a})^2 + (${sb * b})^2}$.`],
          teach: t`For $x = x_0 + at$, $y = y_0 + bt$ the motion is a straight line at constant speed $\sqrt{a^2 + b^2}$.`,
          explain: t`Each second the drone moves $(${sa * a},\ ${sb * b})$ m, a step of length $\sqrt{${a * a} + ${b * b}} = ${sig(ans, 4)}$ m: speed $${sig(ans, 4)}$ m/s.`,
          visual: plane({
            x: [x0 - 2.6 * Math.max(a, b), x0 + 2.6 * Math.max(a, b)], y: [y0 - 1.3 * Math.max(a, b), y0 + 1.3 * Math.max(a, b)], ticks: false,
            curves: [{ param: [`${x0} + ${sa * a}*t`, `${y0} + ${sb * b}*t`], t: [-1, 1], color: 'ink3', width: 1.4, dash: true }],
            arrows: [{ from: [x0, y0], to: [x0 + sa * a, y0], color: 'accent2', width: 2.2, label: 'across' }, { from: [x0 + sa * a, y0], to: [x0 + sa * a, y0 + sb * b], color: 'warn', width: 2.2, label: 'up/down' }, { from: [x0, y0], to: [x0 + sa * a, y0 + sb * b], color: 'gold', width: 2.8 }],
            points: [dot([x0, y0], 't = 0', { labelDx: -8, labelAlign: 'right' })],
            caption: t`The drone’s straight track (dashed) and its displacement in one second (gold), split into across and up/down parts.`,
          }),
        };
      },
    }),
    expr({
      id: 'eliminate', difficulty: 3,
      gen(r) {
        const u = r.pick([2, 4, 5]), w = r.pick([3, 6, 8]), half = 1.855, k = half / (u * u);
        return {
          prompt: t`On Mars ($g = 3.71\ \text{m/s}^2$) a rover’s sampling arm flicks a pebble so that $x = ${u}t$, $y = ${w}t - ${half}t^2$. Eliminate $t$: write the height $y$ as a function of $x$.`,
          answer: `${w}/${u}*x - ${half}*x^2/${u * u}`, answerTeX: t`y = \tfrac{${w}}{${u}}x - ${sig(k, 4)}\,x^2`, lhs: 'y', vars: { x: [0, 5] },
          errors: [
            { answer: `${w * u}*x - ${half}*${u * u}*x^2`, feedback: t`You substituted $t = ${u}x$. From $x = ${u}t$ the time is $t = x/${u}$.` },
            { answer: `${w}/${u}*x - ${half}*x/${u}`, feedback: t`The $t^2$ becomes $(x/${u})^2 = x^2/${u * u}$ — square the whole fraction.` },
          ],
          hints: [t`Solve $x = ${u}t$ for $t$.`, t`Substitute $t = x/${u}$ into $y$: $y = ${w}\cdot\tfrac{x}{${u}} - ${half}\cdot\left(\tfrac{x}{${u}}\right)^2$.`],
          teach: t`To eliminate the parameter, solve the simpler equation for $t$ and substitute it into the other.`,
          explain: t`$t = x/${u}$, so $y = \tfrac{${w}}{${u}}x - \tfrac{${half}}{${u * u}}x^2 = ${sig(w / u, 4)}x - ${sig(k, 4)}x^2$: a downward parabola, as every drag-free trajectory is.`,
          visual: pathPic({ u, w, g: 3.71, dt: 0.5, caption: t`The pebble’s path on Mars, a dot every half second. Mars’s thin air barely slows a slow pebble; drag is ignored.` }),
        };
      },
    }),
    num({
      id: 'flight-time', difficulty: 2,
      gen(r) {
        const [body, g] = r.pick([['Earth', 9.81], ['Mars', 3.71], ['the Moon', 1.62]]), w = r.pick([6, 8, 10, 12]), u = r.pick([4, 5, 7]), ans = (2 * w) / g;
        return {
          prompt: t`On ${body} ($g = ${g}\ \text{m/s}^2$) a probe’s spring-loaded ejector throws a cover off level ground with $x = ${u}t$, $y = ${w}t - ${N(g / 2)}t^2$. How long is the cover in the air?`,
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: w / g, feedback: t`That is the time to the **top** of the arc, where the vertical motion stops. It takes as long again to come down.` }, { value: (2 * w) / g * u, feedback: t`That is how far it travels, $x$ at landing. The question asks for the time.` }],
          hints: [t`It lands when $y = 0$ again.`, t`Factor: $t(${w} - ${N(g / 2)}t) = 0$.`],
          teach: t`Landing on level ground means $y(t) = 0$; the nonzero root is $2v_y/g$.`,
          explain: t`$t(${w} - ${N(g / 2)}t) = 0$ gives $t = ${w}/${N(g / 2)} = ${sig(ans, 4)}$ s — twice the $${sig(w / g, 3)}$ s it takes to reach the top.`,
          visual: pathPic({ u, w, g, dt: ans / 8, caption: t`The cover’s arc, with dots at equal time intervals; no air resistance.` }),
        };
      },
    }),
    {
      type: 'slider', id: 'top-slider', difficulty: 2,
      gen(r) {
        const v = r.pick([12, 15, 18]), a = r.pick([35, 45, 60, 70]), tf = (2 * v * Math.sin(a * D2R)) / 9.81, tp = tf / 2;
        const X = `${N(v * Math.cos(a * D2R))}*T`, Y = `${N(v * Math.sin(a * D2R))}*T - 4.905*T^2`;
        return {
          prompt: t`A ball leaves the ground at $${v}$ m/s, $${a}^\circ$ above the horizontal. Use $y = v_0\sin\alpha\,t - \tfrac12 g t^2$ to find when it is highest, then set the time slider to that moment.`,
          visual: plane({
            x: [-1, 36], y: [-1, 17.5], xlabel: 'x (m)', ylabel: 'y (m)',
            extra: { sliders: [{ key: 'T', label: 'Time $t$', min: 0, max: +tf.toFixed(2), step: 0.01, value: 0, unit: '\\text{s}', explain: 'Seconds since launch.' }] },
            curves: [{ param: [`${N(v * Math.cos(a * D2R))}*t`, `${N(v * Math.sin(a * D2R))}*t - 4.905*t^2`], t: [0, N(tf)], color: 'ink3', width: 1.4, dash: true }],
            points: [{ x: X, y: Y, r: 6, color: 'gold' }],
            caption: t`The path (dashed) and the ball at the slider’s time. Earth gravity, no air resistance.`,
          }),
          param: 'T', answer: [tp - 0.04, tp + 0.04],
          instruction: 'Set the time to the top of the arc, then check.',
          hints: [t`At the top the vertical motion has stopped: the upward speed $v_0\sin\alpha$ has been used up by gravity.`, t`That takes $t = v_0\sin\alpha/g = ${v}\sin ${a}^\circ / 9.81$.`],
          teach: t`The top of a drag-free arc is at $t = v_0\sin\alpha/g$ — half the flight time on level ground.`,
          explain: t`$t = ${v}\sin ${a}^\circ/9.81 = ${sig(tp, 3)}$ s, where $y = ${sig((v * Math.sin(a * D2R)) ** 2 / (2 * 9.81), 3)}$ m.`,
        };
      },
    },
    mcq({
      id: 'circle-param', difficulty: 2,
      gen(r) {
        const h = r.intExcept(-2, 2, [0]), k = r.intExcept(-2, 2, [0]), R = r.pick([3, 4]);
        const s = (c) => `${c < 0 ? '-' : '+'} ${Math.abs(c)}`;
        return {
          prompt: t`A point moves round the circle of radius $${R}$ centred at $(${h}, ${k})$. Which parametric equations describe it?`,
          choices: [t`$x = ${h} + ${R}\cos t,\ \ y = ${k} + ${R}\sin t$`, t`$x = ${R} ${s(h)}\cos t,\ \ y = ${R} ${s(k)}\sin t$`, t`$x = ${h} + ${R * R}\cos t,\ \ y = ${k} + ${R * R}\sin t$`, t`$x = ${-h} + ${R}\cos t,\ \ y = ${-k} + ${R}\sin t$`],
          answer: 0,
          why: {
            1: t`Centre and radius swapped: the constant added is the centre, and the multiplier of $\cos t$ and $\sin t$ is the radius.`,
            2: t`The multiplier is the radius itself, not its square: $(x - h)^2 + (y - k)^2 = R^2(\cos^2 t + \sin^2 t) = R^2$ already.`,
            3: t`The signs of the centre are flipped. In parametric form there is no minus sign to undo: $x = h + R\cos t$ is centred at $x = h$.`,
          },
          hints: [t`Start from the unit circle $(\cos t,\ \sin t)$: stretch it by $R$, then shift it to the centre.`],
          teach: t`$x = h + R\cos t$, $y = k + R\sin t$ traces the circle of radius $R$ about $(h, k)$, anticlockwise.`,
          explain: t`$(x - ${h})^2 + (y - ${k})^2 = ${R}^2(\cos^2 t + \sin^2 t) = ${R * R}$ ✓.`,
          visual: plane({ x: [-7, 7], y: [-6.5, 6.5], curves: [circ([h, k], R, { width: 2.4 })], points: [dot([h, k], '', { color: 'ink2', r: 4 })], caption: t`The circle on a square grid, with its centre marked.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-drop', difficulty: 2, transfer: true,
      gen(r) {
        const u = r.pick([4, 5, 6]), H = r.pick([6, 8, 10]), g = 3.71, tf = Math.sqrt((2 * H) / g), ans = u * tf;
        return {
          prompt: t`A Mars helicopter flying level at $${u}$ m/s, $${H}$ m up, releases a sensor package. Taking the release point above the origin, the package moves as $x = ${u}t$, $y = ${H} - 1.855t^2$ (metres, seconds; $g = 3.71\ \text{m/s}^2$). How far ahead of the release point does it land?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: tf, feedback: t`That is the fall time in seconds. Multiply by the steady $${u}$ m/s to get the distance.` }, { value: u * Math.sqrt(H / g), feedback: t`Landing means $y = 0$: $1.855t^2 = ${H}$, so $t = \sqrt{${H}/1.855}$ — the $1.855$ is already $g/2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Find $t$ when $y = 0$, then put it into $x(t)$.`],
          teach: t`Solve the vertical equation for the landing time; the horizontal one then gives where.`,
          explain: t`$${H} - 1.855t^2 = 0$ gives $t = ${sig(tf, 4)}$ s, so $x = ${u}(${sig(tf, 4)}) = ${sig(ans, 4)}$ m. On Earth it would land after only $${sig(Math.sqrt((2 * H) / 9.81), 3)}$ s, $${sig(u * Math.sqrt((2 * H) / 9.81), 3)}$ m ahead.`,
          visual: pathPic({ u, w: 0, g, h: H, dt: tf / 6, caption: t`The package’s path from release, dots at equal times. Mars’s thin air is ignored.` }),
        };
      },
    }),
    mcq({
      id: 'cp-semicircle', difficulty: 2,
      prompt: t`What does $x = 2\cos t$, $y = 2\sin t$ trace as $t$ runs from $0$ to $\pi$?`,
      choices: ['The upper half of the circle of radius 2, anticlockwise from (2, 0) to (−2, 0)', 'The whole circle of radius 2, once', 'The lower half of the circle of radius 2, clockwise from (2, 0) to (−2, 0)', 'The upper half of the circle of radius 4, anticlockwise'],
      answer: 0,
      why: {
        1: t`A full turn needs $t$ to run over $2\pi$; from $0$ to $\pi$ is half a turn.`,
        2: t`For $0 < t < \pi$, $\sin t > 0$, so $y > 0$: the upper half, and increasing $t$ turns anticlockwise.`,
        3: t`$x^2 + y^2 = 4(\cos^2 t + \sin^2 t) = 4$: radius $\sqrt4 = 2$, not $4$.`,
      },
      hints: [t`Check a few values: $t = 0$, $\tfrac{\pi}{2}$, $\pi$.`],
      teach: t`The parameter’s range decides how much of the curve is traced, and in which direction.`,
      explain: t`$t = 0$: $(2, 0)$; $t = \tfrac{\pi}{2}$: $(0, 2)$; $t = \pi$: $(-2, 0)$. The point climbs over the top: the upper semicircle, anticlockwise.`,
      visual: plane({ x: [-4, 4], y: [-2.6, 2.6], curves: [circ([0, 0], 2, { color: 'ink3', width: 1.4, dash: true })], points: [dot([2, 0], 't = 0', { labelDx: 8, labelDy: 14 })], caption: t`The circle $x^2 + y^2 = 4$ (dashed) and the starting point. Which part is traced?` }),
    }),
    num({
      id: 'cp-height-at-x', difficulty: 3,
      gen(r) {
        const u = r.pick([10, 12, 15]), w = r.pick([14, 16, 20]), X = r.pick([10, 15, 20, 24]), T = X / u, ans = w * T - 4.9 * T * T;
        return {
          prompt: t`A ball follows $x = ${u}t$, $y = ${w}t - 4.9t^2$ (metres, seconds). A wall stands $${X}$ m away. How high is the ball as it reaches the wall?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: w * X - 4.9 * X * X, feedback: t`$${X}$ is a distance, not a time. First find **when** $x = ${X}$: $t = ${X}/${u}$.` }, { value: w * T - 4.9 * T, feedback: t`Square the time in the last term.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`Find the time when $x = ${X}$ m.`, t`$t = ${X}/${u} = ${sig(T, 4)}$ s; put that into $y(t)$.`],
          teach: t`To ask “where is it when $x = X$?”, go through the parameter: find $t$ from $x$, then $y$ from $t$.`,
          explain: t`$t = ${sig(T, 4)}$ s, so $y = ${w}(${sig(T, 4)}) - 4.9(${sig(T, 4)})^2 = ${sig(ans, 4)}$ m${ans < 0 ? ' — negative: the ball has already landed' : ''}.`,
          visual: pathPic({ u, w, g: 9.8, dt: 0.5, caption: t`The ball’s path, a dot every half second; the dashed line is the wall. No air resistance.`, extra: { vlines: [{ x: X, color: 'warn', label: 'wall' }] } }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §8.6 Parametric Equations and §8.7 Parametric Equations: Graphs', url: 'https://openstax.org/books/precalculus-2e/pages/8-6-parametric-equations' },
    { label: 'NASA Planetary Fact Sheet (surface gravity of the Moon and Mars)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
  ],
});
void note; void G;
