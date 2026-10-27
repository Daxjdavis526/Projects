// Parametric curves: both coordinates as functions of a parameter — tracing,
// orientation, eliminating the parameter, and the cycloid.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// a picture on Cartesian axes with equal scales (calc-polar in Cartesian mode)
const cart = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'cartesian', aspect: 'wide', x, y, ...params }, caption });
const round = (v, d = 4) => +v.toFixed(d);

// the thrown ball of the Explore and of a practice problem: x = u t, y = w t − 4.9 t²
const G2 = 4.9;
const ball = (u, w) => [`${u}*t`, `${w}*t - ${G2}*t^2`];
const ballTicks = (u, w, dt) => {
  const T = w / G2, out = [];
  for (let k = 0; k * dt <= T + 1e-9; k++) { const s = k * dt; out.push({ x: round(u * s), y: round(w * s - G2 * s * s), color: 'accent2', size: 3.2 }); }
  return out;
};

// the Explore: three curves, each traced by a point as its parameter runs
const EXPLORE = {
  presetLabel: 'Curve',
  presets: [
    {
      label: 'Thrown ball', show: ['tb'], x: [-3, 43], y: [-2, 16], xlabel: 'x (m)', ylabel: 'y (m)',
      curves: [
        { param: ball(12, 16), t: [0, 32 / 9.8], color: 'ink3', width: 1.4, dash: true },
        { param: ball(12, 16), t: [0, 'tb'], color: 'accent', width: 2.8 },
      ],
      points: ballTicks(12, 16, 0.5),
      tangents: [{ param: ball(12, 16), at: 'tb', line: false, velocity: 0.4, color: 'gold' }],
      texts: [{ text: 'dots every 0.5 s', x: 30, y: 14.5, color: 'ink3', size: 11.5 }],
      readouts: [{ label: '$x$', expr: 'tx', unit: t`\text{m}`, digits: 3 }, { label: '$y$', expr: 'ty', unit: t`\text{m}`, digits: 3 }, { label: 'speed', expr: 'speed', unit: t`\text{m/s}`, digits: 3 }],
    },
    {
      label: 'Orbit (ellipse)', show: ['te'], x: [-4.2, 4.2], y: [-2.8, 2.8],
      curves: [
        { param: ['3*cos(t)', '2*sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.4, dash: true },
        { param: ['3*cos(t)', '2*sin(t)'], t: [0, 'te'], color: 'accent', width: 2.8 },
      ],
      points: [{ x: 3, y: 0, label: 't = 0', color: 'ink2', size: 3.5, labelDx: 8, labelDy: 12 }],
      tangents: [{ param: ['3*cos(t)', '2*sin(t)'], at: 'te', line: false, velocity: 0.45, color: 'gold' }],
      readouts: [{ label: '$x$', expr: 'tx', digits: 3 }, { label: '$y$', expr: 'ty', digits: 3 }, { label: t`check: $\tfrac{x^2}{9} + \tfrac{y^2}{4}$`, expr: 'tx^2/9 + ty^2/4', digits: 4 }],
    },
    {
      label: 'Rolling wheel (cycloid)', show: ['tc'], x: [-0.6, 13.2], y: [-0.6, 2.6],
      curves: [
        { param: ['t - sin(t)', '1 - cos(t)'], t: [0, '4*pi'], color: 'ink3', width: 1.4, dash: true },
        { param: ['t - sin(t)', '1 - cos(t)'], t: [0, 'tc'], color: 'accent', width: 2.8 },
        { param: ['tc + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink2', width: 1.6 },
      ],
      segments: [{ from: ['tc', 1], to: ['tc - sin(tc)', '1 - cos(tc)'], color: 'ink2', width: 1.6 }],
      points: [{ x: 'tc', y: 1, color: 'ink2', size: 3.5 }],
      tangents: [{ param: ['t - sin(t)', '1 - cos(t)'], at: 'tc', line: false, velocity: 0.6, color: 'gold' }],
      readouts: [{ label: '$x$', expr: 'tx', digits: 3 }, { label: '$y$', expr: 'ty', digits: 3 }, { label: 'speed', expr: 'speed', digits: 3 }],
    },
  ],
  sliders: [
    { key: 'tb', label: 'Time $t$', min: 0, max: 3.26, step: 0.01, value: 1.2, unit: t`\text{s}`, explain: t`Seconds since launch: $x = 12t$, $y = 16t - 4.9t^2$ (metres).` },
    { key: 'te', label: 'Parameter $t$', min: 0, max: 6.28, step: 0.01, value: 1.1, explain: t`$x = 3\cos t$, $y = 2\sin t$; one lap is $0 \le t \le 2\pi$.` },
    { key: 'tc', label: 'Angle turned $t$', min: 0, max: 12.56, step: 0.01, value: 2.2, unit: t`\text{rad}`, explain: t`How far the wheel of radius 1 has turned: $x = t - \sin t$, $y = 1 - \cos t$.` },
  ],
};

export default lesson({
  id: 'math1220.C2-6.1',
  title: 'Parametric curves',
  minutes: 9, difficulty: 2,
  intro: t`A **parametric curve** gives both coordinates as functions of a third variable, the *parameter* $t$:

$$x = f(t), \qquad y = g(t), \qquad a \le t \le b$$

Think of $t$ as time and $(x, y)$ as a moving point. The curve is its path; the parametrization adds what a graph $y = f(x)$ cannot hold — **which way the point goes and when it gets there** — and it allows paths that loop back over themselves. Trajectories, orbits and the track of a point on a rolling wheel all arrive in this form.`,
  symbols: [
    { tex: 't', text: 'the **parameter** — often time, in seconds; each value of $t$ picks out one point of the curve' },
    { tex: 'x = f(t)', text: 'the horizontal coordinate of the point at parameter $t$ (in metres, for a trajectory)' },
    { tex: 'y = g(t)', text: 'the vertical coordinate of the point at parameter $t$' },
    { tex: 'a \\le t \\le b', text: 'the **parameter interval**: the curve starts at $(f(a), g(a))$ and ends at $(f(b), g(b))$; the direction of increasing $t$ is the curve’s **orientation**' },
  ],
  why: t`A path and its parametrization are different things: the same ellipse can be traced fast or slow, clockwise or counter-clockwise. Relativity builds on exactly this — a worldline is a curve in spacetime, parametrized by the proper time ticking along it.`,
  visual: {
    type: 'calc-polar',
    title: 'A point that traces its path',
    lead: t`Pick a curve and move the parameter. The bold part is the path traced so far, the dashed part what is still to come, and the gold arrow the velocity $\left(\tfrac{dx}{dt}, \tfrac{dy}{dt}\right)$.`,
    tasks: [
      t`**Thrown ball:** the dots are $0.5$ s apart — evenly spaced across, since $x$ grows steadily, but closer together along the path near the top, where the ball is slowest. That timing is not in the path itself.`,
      t`**Orbit:** run $t$ from $0$ to $2\pi$. The point goes round once, counter-clockwise, and the check $\tfrac{x^2}{9} + \tfrac{y^2}{4}$ stays exactly $1$.`,
      t`**Rolling wheel:** set $t = 2\pi$. The marked point touches the ground and the velocity arrow vanishes — it stops dead for an instant, although the wheel never stops.`,
    ],
    params: { grid: 'cartesian', x: [-3, 43], y: [-2, 16], ...EXPLORE },
    caption: t`The ball has no air resistance ($g = 9.8$ m/s²). The ellipse is traced at a steady rate in $t$; a real planet speeds up near the Sun (lesson C2-6.6). The wheel has radius 1 and rolls without slipping. Velocity arrows are scaled to fit.`,
  },
  example: {
    prompt: t`A wheel of radius $r$ rolls along the $x$-axis without slipping. A mark on its rim starts at the origin, touching the ground. Find the path of the mark, using the angle $t$ the wheel has turned through as the parameter.`,
    visual: cart([-0.4, 7.2], [-0.5, 2.6], {
      curves: [
        { param: ['t - sin(t)', '1 - cos(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.3, dash: true },
        { param: ['t - sin(t)', '1 - cos(t)'], t: [0, 2.2], color: 'accent', width: 2.6 },
        { param: ['2.2 + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink2', width: 1.6 },
        { param: ['2.2 + 0.3*cos(t)', '1 + 0.3*sin(t)'], t: ['-pi/2 - 2.2', '-pi/2'], color: 'gold', width: 1.6 },
      ],
      segments: [
        { from: [0, 0], to: [2.2, 0], color: 'gold', width: 4, label: 'rolled out: rt', labelDx: -40, labelDy: 14 },
        { from: [2.2, 1], to: [2.2 - Math.sin(2.2), 1 - Math.cos(2.2)], color: 'ink2', width: 1.6 },
        { from: [2.2, 1], to: [2.2, 0], color: 'ink3', width: 1.2, dash: true },
      ],
      points: [{ x: 2.2, y: 1, label: 'C = (rt, r)', color: 'ink2', size: 3.5, labelDx: 8, labelDy: -10 }, { x: round(2.2 - Math.sin(2.2)), y: round(1 - Math.cos(2.2)), label: 'P', color: 'gold', labelDx: -16, labelDy: -8 }],
      texts: [{ text: 't', x: 1.8, y: 0.8, color: 'gold', size: 13 }],
    }, t`Drawn with $r = 1$ after the wheel has turned through $t = 2.2$ rad. The gold stretch of ground has met the rim, so it equals the arc $rt$.`),
    steps: [
      { label: 'The centre', text: t`Rolling without slipping means every bit of ground the wheel has crossed was touched by the rim: the distance rolled equals the arc $rt$. So the centre is at $C = (rt,\ r)$ — always at height $r$.` },
      { label: 'The mark, seen from the centre', text: t`The mark starts straight below the centre, and a wheel rolling to the right turns clockwise. After turning through $t$, the mark sits at $(-r\sin t,\ -r\cos t)$ relative to $C$. (At $t = 0$ that is $(0, -r)$, straight down ✓.)` },
      { label: 'Add the two', text: t`$x = rt - r\sin t = r(t - \sin t)$ and $y = r - r\cos t = r(1 - \cos t)$.` },
      { label: 'Sense check', text: t`At $t = \pi$ the mark is on top of the wheel: $(\pi r,\ 2r)$ ✓. At $t = 2\pi$ it is back on the ground one circumference along, at $(2\pi r,\ 0)$ ✓. And $y = r(1 - \cos t) \ge 0$: it never goes underground ✓.` },
    ],
    answer: t`$x = r(t - \sin t),\quad y = r(1 - \cos t)$ — a **cycloid**, one arch for every turn of the wheel.`,
  },
  practice: [
    mcq({
      id: 'orientation', difficulty: 1,
      prompt: t`As $t$ increases from $0$, how does the point $(x, y) = (\sin t,\ \cos t)$ move?`,
      visual: cart([-1.8, 1.8], [-1.3, 1.3], { curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'accent' }], xticks: 6 }, t`The path $x^2 + y^2 = 1$. It is the same set of points for $(\cos t, \sin t)$ and $(\sin t, \cos t)$ — the parametrization decides where the point starts and which way it goes.`),
      choices: [
        'Clockwise round the unit circle, starting at (0, 1)',
        'Counter-clockwise round the unit circle, starting at (0, 1)',
        'Clockwise round the unit circle, starting at (1, 0)',
        'Counter-clockwise round the unit circle, starting at (1, 0)',
      ],
      answer: 0,
      why: {
        1: t`Try a small $t$: at $t = 0.1$ the point is $(0.10, 0.995)$ — it has moved right from $(0, 1)$, which is clockwise at the top of the circle.`,
        2: t`At $t = 0$ the point is $(\sin 0, \cos 0) = (0, 1)$, not $(1, 0)$.`,
        3: t`That is the standard $(\cos t, \sin t)$. Swapping sine and cosine changes both the start and the direction.`,
      },
      hints: [t`Put $t = 0$ to find the start, then try a small positive $t$ such as $0.1$.`],
      teach: 'Find the orientation by plotting the start and one nearby point: the path alone does not say which way it is traced.',
      explain: t`At $t = 0$ the point is $(0, 1)$. As $t$ grows, $x = \sin t$ increases and $y = \cos t$ decreases, so it moves right and down from the top: clockwise.`,
    }),
    expr({
      id: 'line-eliminate', difficulty: 2,
      gen(r) {
        const a = r.int(2, 4), b = r.intExcept(-3, 3, [0]);
        let c = r.intExcept(-5, 5, [0]);
        if (Math.abs(c) === a) c = c > 0 ? c + 1 : c - 1;
        const d = r.int(-4, 4);
        const pts = [0, 1, 2].map((s) => ({ x: a * s + b, y: c * s + d, label: `t = ${s}`, color: 'gold', size: 4, labelDx: 10, labelDy: c > 0 ? 12 : -12 }));
        const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
        const xlo = Math.min(...xs) - 2, xhi = Math.max(...xs) + 2, ylo = Math.min(...ys) - 2, yhi = Math.max(...ys) + 2;
        const sgn = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`);
        return {
          prompt: t`Eliminate the parameter from $x = ${a}t ${sgn(b)}$, $y = ${c}t ${sgn(d)}$: write $y$ as a function of $x$.`,
          visual: cart([xlo, xhi], [ylo, yhi], { curves: [{ param: [`${a}*t + ${b}`, `${c}*t + ${d}`], t: [-6, 6], color: 'accent' }], points: pts }, t`The line, with the points at $t = 0, 1, 2$: each step of $1$ in $t$ moves the point $${a}$ across and $${c}$ ${c > 0 ? 'up' : 'down'}.`),
          answer: `${c}/${a}*(x - ${b}) + ${d}`,
          answerTeX: t`y = \tfrac{${c}}{${a}}(x ${sgn(-b)}) ${sgn(d)}`,
          lhs: 'y', vars: { x: [-3, 3] },
          errors: [
            { answer: `${a}/${c}*(x - ${b}) + ${d}`, feedback: t`The slope is upside down. Solve $x = ${a}t ${sgn(b)}$ for $t$ first: $t = (x ${sgn(-b)})/${a}$.` },
            { answer: `${c}/${a}*(x + ${b}) + ${d}`, feedback: t`Check the sign when you solve for $t$: $t = \dfrac{x ${sgn(-b)}}{${a}}$.` },
          ],
          hints: [t`Solve the $x$-equation for $t$.`, t`$t = \dfrac{x ${sgn(-b)}}{${a}}$; substitute it into $y = ${c}t ${sgn(d)}$.`],
          teach: 'To eliminate the parameter, solve one equation for t and substitute it into the other.',
          explain: t`$t = (x ${sgn(-b)})/${a}$, so $y = ${c}\cdot\dfrac{x ${sgn(-b)}}{${a}} ${sgn(d)}$ — a line of slope $\tfrac{${c}}{${a}}$: the rise per unit $t$ over the run per unit $t$.`,
        };
      },
    }),
    expr({
      id: 'ball-path', difficulty: 2,
      gen(r) {
        const u = r.pick([5, 8, 10, 12, 15]), w = r.pick([10, 12, 15, 20]);
        const T = w / G2, X = u * T, H = (w * w) / (4 * G2);
        return {
          prompt: t`A ball is thrown from the ground with $x = ${u}t$, $y = ${w}t - 4.9t^2$ (metres, seconds; no air resistance). Eliminate $t$ to find the shape of its path: $y$ as a function of $x$.`,
          visual: cart([-0.06 * X, 1.08 * X], [-0.12 * H, 1.25 * H], { xlabel: 'x (m)', ylabel: 'y (m)', curves: [{ param: ball(u, w), t: [0, T], color: 'accent' }], points: ballTicks(u, w, 0.25 * Math.ceil(T / 2.5)) }, t`The trajectory, with dots at equal time steps. Equal steps in $t$ are equal steps in $x$, because $x$ grows at a steady ${u} m/s.`),
          answer: `${w}/${u}*x - 4.9*x^2/${u * u}`,
          answerTeX: t`y = \tfrac{${w}}{${u}}x - \tfrac{4.9}{${u * u}}x^2`,
          lhs: 'y', vars: { x: [0, X] },
          errors: [
            { answer: `${w}*x - 4.9*x^2`, feedback: t`You replaced $t$ by $x$. Since $x = ${u}t$, $t = x/${u}$.` },
            { answer: `${w}/${u}*x - 4.9*x^2/${u}`, feedback: t`Square the whole of $t = x/${u}$: $t^2 = x^2/${u * u}$.` },
          ],
          hints: [t`From $x = ${u}t$, $t = x/${u}$.`, t`Substitute: $y = ${w}\cdot\dfrac{x}{${u}} - 4.9\left(\dfrac{x}{${u}}\right)^2$.`],
          teach: 'A projectile without drag has x linear in t and y quadratic in t, so its path y(x) is a parabola.',
          explain: t`$t = x/${u}$ gives $y = \tfrac{${w}}{${u}}x - \tfrac{4.9}{${u * u}}x^2$: a downward parabola. It returns to $y = 0$ at $x = ${nice(X)}$ m, the range.`,
        };
      },
    }),
    expr({
      id: 'ellipse-eliminate', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 2], [4, 2], [5, 3], [4, 3], [2, 1], [5, 2]]);
        return {
          prompt: t`Eliminate the parameter from $x = ${a}\cos t$, $y = ${b}\sin t$. Give an equation in $x$ and $y$.`,
          visual: cart([-a - 1, a + 1], [-b - 0.8, b + 0.8], { curves: [{ param: [`${a}*cos(t)`, `${b}*sin(t)`], t: [0, '2*pi'], color: 'accent' }], tangents: [{ param: [`${a}*cos(t)`, `${b}*sin(t)`], at: 'pi/4', line: false, label: 't = π/4' }] }, t`The curve, with the point at $t = \pi/4$.`),
          answer: `x^2/${a * a} + y^2/${b * b} = 1`,
          answerTeX: t`\frac{x^2}{${a * a}} + \frac{y^2}{${b * b}} = 1`,
          mode: 'equation', vars: { x: [-a, a], y: [-b, b] },
          errors: [
            { answer: `x^2/${a} + y^2/${b} = 1`, feedback: t`Divide before you square: $\cos t = x/${a}$, so $\cos^2 t = x^2/${a * a}$.` },
            { answer: `x^2 + y^2 = ${a * a + b * b}`, feedback: t`Adding $x^2 = ${a * a}\cos^2 t$ and $y^2 = ${b * b}\sin^2 t$ does not use the identity — the coefficients differ. Isolate $\cos t$ and $\sin t$ first.` },
          ],
          hints: [t`Isolate the trig functions: $\cos t = x/${a}$ and $\sin t = y/${b}$.`, t`Use $\cos^2 t + \sin^2 t = 1$.`],
          teach: 'For sines and cosines, eliminate the parameter with cos²t + sin²t = 1 rather than by solving for t.',
          explain: t`$\left(\tfrac{x}{${a}}\right)^2 + \left(\tfrac{y}{${b}}\right)^2 = \cos^2 t + \sin^2 t = 1$: an ellipse with semi-axes ${a} and ${b}, traced once counter-clockwise as $t$ runs from $0$ to $2\pi$.`,
        };
      },
    }),
    num({
      id: 'rover-pebble', difficulty: 2,
      gen(r) {
        const deg = r.pick([60, 90, 120, 135, 150]), R = 0.2625, th = (deg * Math.PI) / 180;
        const x = R * (th - Math.sin(th));
        return {
          prompt: t`A Mars rover’s wheel has radius $R = 0.2625$ m. A pebble wedged in the tread starts on the ground. The wheel rolls forward without slipping and turns through ${deg}°. How far forward of its starting point is the pebble now? Give 3 significant figures.`,
          visual: cart([-0.4, 4.6], [-0.4, 2.4], {
            xlabel: 'x / R', ylabel: 'y / R',
            curves: [{ param: ['t - sin(t)', '1 - cos(t)'], t: [0, 4.6], color: 'ink3', width: 1.3, dash: true }, { param: ['t - sin(t)', '1 - cos(t)'], t: [0, th], color: 'accent' }, { param: [`${round(th)} + cos(t)`, '1 + sin(t)'], t: [0, '2*pi'], color: 'ink2', width: 1.5 }],
            segments: [{ from: [round(th), 1], to: [round(th - Math.sin(th)), round(1 - Math.cos(th))], color: 'ink2', width: 1.5 }],
            points: [{ x: round(th - Math.sin(th)), y: round(1 - Math.cos(th)), label: 'pebble', color: 'gold' }, { x: round(th), y: 1, color: 'ink2', size: 3 }],
          }, t`Distances in units of the wheel radius. The wheel’s centre has moved $R\theta$; the pebble lags behind it.`),
          answer: x, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: R * th, feedback: t`That is how far the rover (and the wheel’s centre) moved, $R\theta$. The pebble is behind the centre by $R\sin\theta$.` },
            { value: R * (deg - Math.sin(th)), feedback: 'Use the angle in radians inside x = R(θ − sin θ).' },
          ],
          hints: [t`The pebble traces the cycloid $x = R(\theta - \sin\theta)$, $y = R(1 - \cos\theta)$, with $\theta$ in radians.`, t`${deg}° $= ${nice(th)}$ rad, so $x = 0.2625\,(${nice(th)} - \sin ${deg}°)$.`],
          teach: 'A point on a rolling wheel follows a cycloid: x = R(θ − sin θ), with θ in radians.',
          explain: t`$x = 0.2625\,(${nice(th)} - ${nice(Math.sin(th))}) = ${fmt(x)}$ m, while the rover has moved $R\theta = ${fmt(R * th)}$ m. Near the ground a point on the rim lags far behind the wheel.`,
        };
      },
    }),
    mcq({
      id: 'clockwise-circle', difficulty: 3,
      prompt: t`Which parametrization traces the circle $x^2 + y^2 = 4$ exactly once, **clockwise**, starting at $(2, 0)$, as $t$ runs from $0$ to $2\pi$?`,
      visual: cart([-3.2, 3.2], [-2.6, 2.6], { curves: [{ param: ['2*cos(t)', '2*sin(t)'], t: [0, '2*pi'], color: 'accent' }], points: [{ x: 2, y: 0, label: 'start', color: 'gold', labelDx: 8, labelDy: -12 }], arrows: [{ from: [1.94, -0.45], to: [1.72, -1.03], color: 'gold' }] }, 'The circle of radius 2, with the required start and direction.'),
      choices: [t`$(2\cos t,\ -2\sin t)$`, t`$(2\cos t,\ 2\sin t)$`, t`$(2\cos 2t,\ -2\sin 2t)$`, t`$(2\sin t,\ 2\cos t)$`],
      answer: 0,
      why: {
        1: t`This goes counter-clockwise: just after $t = 0$, $y = 2\sin t$ is positive, so the point rises.`,
        2: t`The doubled angle sends it round **twice** as $t$ runs from $0$ to $2\pi$.`,
        3: t`This is clockwise, but at $t = 0$ it is at $(0, 2)$, not $(2, 0)$.`,
      },
      hints: ['Check each at t = 0 for the start, and at a small t to see which way it moves.', t`Clockwise from $(2, 0)$ means moving *down* first: $y$ must be negative just after $t = 0$.`],
      teach: 'Flipping the sign of y reverses the direction; scaling t changes the speed and how many laps a parameter interval covers.',
      explain: t`At $t = 0$, $(2\cos 0, -2\sin 0) = (2, 0)$; for small $t > 0$, $y = -2\sin t < 0$, so it moves down — clockwise — and one lap takes $t$ from $0$ to $2\pi$.`,
    }),
    num({
      id: 'self-crossing', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 3, 4, 5]), s = Math.sqrt(k), T = 1.25 * s + 0.3;
        return {
          prompt: t`The curve $x = t^2$, $y = t^3 - ${k}t$ passes through one point twice. At which **positive** value of $t$ does it reach that point (the other visit is at the matching negative $t$)? Give 3 significant figures.`,
          visual: cart([-0.4, T * T + 0.3], [-(T ** 3 - k * T) - 0.2, T ** 3 - k * T + 0.2], { curves: [{ param: ['t^2', `t^3 - ${k}*t`], t: [-T, T], color: 'accent' }] }, t`The curve for $-${nice(T)} \le t \le ${nice(T)}$. The loop closes where two different values of $t$ give the same point.`),
          answer: s, tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`That is the $x$-coordinate of the crossing point. The question asks for the parameter: $x = t^2$.` }],
          hints: [t`Two values $t_1 \ne t_2$ give the same $x = t^2$ only if $t_2 = -t_1$.`, t`Then the $y$-values must match too: $t^3 - ${k}t = -(t^3 - ${k}t)$, so $t^3 - ${k}t = 0$.`],
          teach: 'A curve crosses itself where two different parameter values give the same point.',
          explain: t`$t(t^2 - ${k}) = 0$ with $t \ne 0$ gives $t = \pm\sqrt{${k}} = \pm${nice(s)}$. Both land on $(${k}, 0)$: one point of the path, two moments of the motion.`,
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-circle', difficulty: 2,
      gen(r) {
        const h = r.intExcept(-3, 3, [0]), k = r.intExcept(-3, 3, [0]), R = r.int(2, 4);
        const sgn = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`);
        return {
          prompt: t`Eliminate the parameter from $x = ${h} + ${R}\cos t$, $y = ${k} + ${R}\sin t$. Give an equation in $x$ and $y$.`,
          visual: cart([h - R - 1.5, h + R + 1.5], [k - R - 1, k + R + 1], { curves: [{ param: [`${h} + ${R}*cos(t)`, `${k} + ${R}*sin(t)`], t: [0, '2*pi'], color: 'accent' }], points: [{ x: h, y: k, color: 'ink2', size: 3.5 }] }, 'The path, with its centre marked.'),
          answer: `(x - ${h})^2 + (y - ${k})^2 = ${R * R}`,
          answerTeX: t`(x ${sgn(-h)})^2 + (y ${sgn(-k)})^2 = ${R * R}`,
          mode: 'equation', vars: { x: [h - R, h + R], y: [k - R, k + R] },
          errors: [{ answer: `(x + ${h})^2 + (y + ${k})^2 = ${R * R}`, feedback: t`Check the signs: $\cos t = \dfrac{x ${sgn(-h)}}{${R}}$.` }],
          hints: [t`$\cos t = (x ${sgn(-h)})/${R}$ and $\sin t = (y ${sgn(-k)})/${R}$; then use $\cos^2 t + \sin^2 t = 1$.`],
          teach: 'Shifting x and y by constants moves the centre of the circle; the identity cos² + sin² = 1 removes t.',
          explain: t`$\left(\tfrac{x ${sgn(-h)}}{${R}}\right)^2 + \left(\tfrac{y ${sgn(-k)}}{${R}}\right)^2 = 1$, i.e. a circle of radius ${R} centred at $(${h}, ${k})$.`,
        };
      },
    }),
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const dt = r.pick([2, 3, 4, 5]), R = 26560, T = 11.967;
        const ang = (2 * Math.PI * dt) / T, chord = 2 * R * Math.sin(ang / 2);
        const S = 1 / 1000;   // draw in thousands of km
        const x1 = round(R * Math.cos(ang) * S, 3), y1 = round(R * Math.sin(ang) * S, 3);
        return {
          prompt: t`A GPS satellite moves on a circular orbit of radius $R = 26\,560$ km with period $T = 11.967$ h. Taking the Earth’s centre as origin, its position is $x = R\cos(2\pi t/T)$, $y = R\sin(2\pi t/T)$ with $t$ in hours. How far, in a straight line, is it from where it was ${dt} hours earlier? Give 3 significant figures.`,
          visual: cart([-33, 33], [-29, 29], {
            xlabel: 'x (1000 km)', ylabel: 'y (1000 km)',
            curves: [{ param: ['26.56*cos(t)', '26.56*sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.4, dash: true }, { param: ['26.56*cos(t)', '26.56*sin(t)'], t: [0, round(ang)], color: 'accent' }, { param: ['6.371*cos(t)', '6.371*sin(t)'], t: [0, '2*pi'], color: 'teal', width: 2 }],
            segments: [{ from: [26.56, 0], to: [x1, y1], color: 'gold', width: 2, label: '?', labelDx: -14, labelDy: -2 }],
            points: [{ x: 26.56, y: 0, label: 't = 0', color: 'ink2' }, { x: x1, y: y1, label: `t = ${dt} h`, color: 'gold' }],
          }, 'The orbit and the Earth (teal) to scale. GPS orbits are close to circular; this ignores the small eccentricity and the Earth’s rotation.'),
          answer: chord, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: (R * 2 * Math.PI * dt) / T, feedback: 'That is the distance along the orbit (the arc). The question asks for the straight-line distance between the two positions.' }],
          hints: [t`Find both positions: at $t = 0$ it is at $(R, 0)$; at $t = ${dt}$ the angle is $2\pi\cdot${dt}/11.967$.`, t`The straight-line distance between two points on a circle that subtend angle $\phi$ is $2R\sin(\phi/2)$ — or use the distance formula.`],
          teach: 'A parametrization turns “where is it at time t?” into arithmetic: evaluate x(t) and y(t), then measure.',
          explain: t`The angle swept is $\phi = 2\pi(${dt})/11.967 = ${nice(ang)}$ rad, so the distance is $2R\sin(\phi/2) = 2(26\,560)\sin(${nice(ang / 2)}) \approx ${fmt(chord)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'cp-back-and-forth', difficulty: 2,
      prompt: t`What path does $x = \cos t$, $y = \cos 2t$ trace as $t$ runs over all real numbers?`,
      visual: cart([-0.3, 6.6], [-1.5, 1.5], { xlabel: 't', ylabel: '', curves: [{ param: ['t', 'cos(t)'], t: [0, '2*pi'], color: 'accent', label: 'x(t) = cos t', labelAt: 0.35 }, { param: ['t', 'cos(2*t)'], t: [0, '2*pi'], color: 'warn', label: 'y(t) = cos 2t', labelAt: 3.1416, labelDx: -40, labelDy: -14 }] }, t`The two coordinates plotted against $t$ (not the path itself). Note the range of $x$.`),
      choices: [
        t`The arc of the parabola $y = 2x^2 - 1$ with $-1 \le x \le 1$, traced back and forth`,
        t`The whole parabola $y = 2x^2 - 1$`,
        t`The line $y = 2x - 1$`,
        t`The unit circle`,
      ],
      answer: 0,
      why: {
        1: t`$x = \cos t$ never leaves $[-1, 1]$, so only that piece of the parabola is ever reached.`,
        2: t`$\cos 2t = 2\cos^2 t - 1$, not $2\cos t - 1$.`,
        3: t`$x^2 + y^2 = \cos^2 t + \cos^2 2t$ is not constant.`,
      },
      hints: [t`Use the double-angle identity $\cos 2t = 2\cos^2 t - 1$.`],
      teach: 'Eliminating the parameter gives an equation, but the parametrization decides which part of that curve is actually traced.',
      explain: t`$y = \cos 2t = 2\cos^2 t - 1 = 2x^2 - 1$, and $x = \cos t$ stays in $[-1, 1]$, sweeping from $1$ to $-1$ and back every $2\pi$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §7.1 Parametric Equations', url: 'https://openstax.org/books/calculus-volume-2/pages/7-1-parametric-equations' },
    { label: 'GPS.gov: Space Segment (orbit radius and period)', url: 'https://www.gps.gov/systems/gps/space/' },
  ],
});
