// The chain rule in several variables: a moving sensor in a temperature
// field reads the sum of (rate of change in each direction) × (speed in that
// direction). Tree diagrams, polar coordinates, implicit differentiation, and
// the thermodynamic partial derivatives that only the chain rule untangles.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { gasSurface, r6 } from './_partials.js';

const t = String.raw;

// the plate: a hot spot at (1, 0) cm on a 20 °C background; the probe circles
// x = 2 cos t, y = 2 sin t (cm, t in s) at 2 cm/s
const PLATE = '20 + 50*exp(-((x - 1)^2 + y^2)/2)';
const E = 'exp(-((2*cos(s) - 1)^2 + (2*sin(s))^2)/2)';
const TX = `(-50*(2*cos(s) - 1)*${E})`, TY = `(-50*2*sin(s)*${E})`;

/** A tree diagram on the graph sim: nodes [x, y, label], branches [from, to, label]. */
function tree(nodes, branches, caption, highlight = []) {
  return {
    type: 'graph',
    params: {
      x: [-2.4, 2.4], y: [-0.45, 2.45], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: branches.map(([a, b], k) => {
        const [x0, y0] = nodes[a], [x1, y1] = nodes[b];
        return { param: [`${x0} + ${r6(x1 - x0)}*t`, `${y0} + ${r6(y1 - y0)}*t`], t: [0.12, 0.88], color: highlight.includes(k) ? 'gold' : 'ink3', width: highlight.includes(k) ? 2.6 : 1.6 };
      }),
      points: [
        ...nodes.map(([x, y, label]) => ({ x, y, r: 0.01, color: 'ink', label, labelDx: -5, labelDy: 0 })),
        ...branches.map(([a, b, label]) => { const [x0, y0] = nodes[a], [x1, y1] = nodes[b]; return { x: r6((x0 + x1) / 2), y: r6((y0 + y1) / 2), r: 0.01, color: 'accent2', label, labelDx: x1 < x0 ? -64 : 8, labelDy: 0 }; }),
      ],
    },
    caption,
  };
}
// z depends on x and y; each depends on s and t
const TREE2 = [[0, 2.2, 'z'], [-1.2, 1.1, 'x'], [1.2, 1.1, 'y'], [-1.8, 0, 's'], [-0.6, 0, 't'], [0.6, 0, 's'], [1.8, 0, 't']];
const BR2 = [[0, 1, '∂z/∂x'], [0, 2, '∂z/∂y'], [1, 3, '∂x/∂s'], [1, 4, '∂x/∂t'], [2, 5, '∂y/∂s'], [2, 6, '∂y/∂t']];
// T depends on x and y; each depends on t alone
const TREE1 = [[0, 2.2, 'T'], [-1.2, 1.1, 'x'], [1.2, 1.1, 'y'], [-1.2, 0, 't'], [1.2, 0, 't']];
const BR1 = [[0, 1, '∂T/∂x'], [0, 2, '∂T/∂y'], [1, 3, 'dx/dt'], [2, 4, 'dy/dt']];

/** The plate map with the probe at time s0 (or the slider s), for a problem. */
const plateMap = (s0, caption, extra = {}) => ({
  type: 'c3-contour',
  params: {
    f: PLATE, x: [-2.8, 2.8], y: [-2.6, 2.6], levels: { from: 25, to: 65, step: 10 }, xlabel: 'x (cm)', ylabel: 'y (cm)',
    curves: [{ param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'violet', width: 1.8 }],
    points: [{ x: r6(2 * Math.cos(s0)), y: r6(2 * Math.sin(s0)), color: 'gold', label: 'probe' }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'math2210.C3-3.4',
  title: 'The chain rule in several variables',
  minutes: 11, difficulty: 3,
  intro: t`Carry a thermometer along a path $x(t),\ y(t)$ through a temperature field $T(x, y)$ and its reading changes for two reasons at once: you move in $x$ and you move in $y$. The **chain rule** adds the two effects:

$$\frac{dT}{dt} = \frac{\partial T}{\partial x}\,\frac{dx}{dt} + \frac{\partial T}{\partial y}\,\frac{dy}{dt}$$

Each term is how fast the field changes in one direction times how fast you travel in that direction. It is why an aircraft’s thermometer sees the temperature fall as it climbs through still air, and it is the bookkeeping that untangles thermodynamics, where the same symbol $\partial P/\partial V$ means different things depending on what is held fixed.`,
  symbols: [
    { tex: 'T(x, y)', text: 'the temperature field: a temperature at every point, here in °C' },
    { tex: 'x(t),\\ y(t)', text: 'the sensor’s position at time $t$ — its path through the field' },
    { tex: '\\dfrac{dT}{dt}', text: 'how fast the sensor’s reading changes, in °C/s: an ordinary derivative, since along the path everything depends on $t$ alone' },
    { tex: '\\dfrac{\\partial T}{\\partial x},\\ \\dfrac{\\partial T}{\\partial y}', text: 'how fast the field changes in each direction at the sensor, in °C per unit length' },
    { tex: '\\dfrac{dx}{dt},\\ \\dfrac{dy}{dt}', text: 'the sensor’s velocity components' },
  ],
  why: t`For a field that also changes in time it becomes the **material derivative** $\dfrac{DT}{Dt} = \dfrac{\partial T}{\partial t} + \vec v\cdot\nabla T$ of fluid mechanics; written with matrices it is the rule that transforms vector and tensor components between coordinate systems in relativity.`,
  visual: {
    type: 'c3-contour',
    title: 'A probe reads a changing temperature',
    lead: t`A metal plate has a hot spot; the map shows its temperature in °C. A probe (gold) slides round the violet circle at 2 cm/s. The gold arrow is its velocity; the red arrow collects the two partial derivatives $(\partial T/\partial x,\ \partial T/\partial y)$ into one vector. The readouts show both terms of the chain rule and their sum.`,
    tasks: [
      t`Slide the time to $t \approx 2.1$ s: moving left cools the probe ($\tfrac{\partial T}{\partial x}\tfrac{dx}{dt} < 0$) while moving down warms it ($\tfrac{\partial T}{\partial y}\tfrac{dy}{dt} > 0$). The reading changes at the sum of the two.`,
      t`Find the two times when $dT/dt = 0$ ($t = 0$ and $t \approx 3.14$ s): there the velocity runs along a level curve, at the hottest and coldest points of the loop.`,
      'Watch the angle between the two arrows: the reading rises while it is acute, falls while it is obtuse, and holds still when it is a right angle.',
    ],
    params: {
      f: PLATE, x: [-2.8, 2.8], y: [-2.6, 2.6], levels: { from: 25, to: 65, step: 5 }, xlabel: 'x (cm)', ylabel: 'y (cm)',
      sliders: [{ key: 's', label: 'Time $t$', min: 0, max: 6.28, step: 0.02, value: 2.1, unit: '\\mathrm{s}', explain: t`The probe is at $x = 2\cos t$, $y = 2\sin t$ (cm): once round every $2\pi \approx 6.28$ s.` }],
      curves: [{ param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'violet', width: 1.8 }],
      points: [{ x: '2*cos(s)', y: '2*sin(s)', color: 'gold' }],
      arrows: [
        { from: ['2*cos(s)', '2*sin(s)'], to: ['2*cos(s) - 0.4*2*sin(s)', '2*sin(s) + 0.4*2*cos(s)'], color: 'gold', label: 'v' },
        { from: ['2*cos(s)', '2*sin(s)'], to: [`2*cos(s) + 0.8*${TX}/sqrt(${TX}^2 + ${TY}^2)`, `2*sin(s) + 0.8*${TY}/sqrt(${TX}^2 + ${TY}^2)`], color: 'bad', label: '∇T' },
      ],
      readouts: [
        { label: '$T$', expr: `20 + 50*${E}`, unit: '^\\circ\\mathrm{C}', digits: 3 },
        { label: t`$\tfrac{\partial T}{\partial x}\tfrac{dx}{dt}$`, expr: `${TX}*(-2*sin(s))`, unit: '^\\circ\\mathrm{C/s}', digits: 3 },
        { label: t`$\tfrac{\partial T}{\partial y}\tfrac{dy}{dt}$`, expr: `${TY}*(2*cos(s))`, unit: '^\\circ\\mathrm{C/s}', digits: 3 },
        { label: t`$\tfrac{dT}{dt}$`, expr: `${TX}*(-2*sin(s)) + ${TY}*(2*cos(s))`, unit: '^\\circ\\mathrm{C/s}', digits: 3 },
      ],
    },
    caption: t`The plate’s temperature is $T = 20 + 50\,e^{-((x - 1)^2 + y^2)/2}$ °C, with $x$ and $y$ in cm: a hot spot at $(1, 0)$. The gold velocity arrow is to scale (0.4 s of travel); the red arrow shows only the direction of $(\partial T/\partial x,\ \partial T/\partial y)$, whose size varies thirtyfold round the loop. The plate is idealised as steady.`,
  },
  example: {
    prompt: t`On the plate $T(x, y) = 20 + 50\,e^{-((x - 1)^2 + y^2)/2}$ (°C, with $x$, $y$ in cm), the probe moves as $x = 2\cos t$, $y = 2\sin t$. Find $dT/dt$ at $t = 2\pi/3$ s.`,
    visual: plateMap(2 * Math.PI / 3, t`The probe at $t = 2\pi/3$ s, at $(-1, \sqrt3)$ cm on its circle. Level curves every 10 °C.`),
    steps: [
      { label: 'Where and how fast', text: t`At $t = 2\pi/3$: $x = 2\cos\tfrac{2\pi}{3} = -1$, $y = 2\sin\tfrac{2\pi}{3} = \sqrt3 \approx 1.732$ cm. Velocity: $\dfrac{dx}{dt} = -2\sin t = -1.732$ cm/s, $\dfrac{dy}{dt} = 2\cos t = -1$ cm/s.` },
      { label: 'The field’s slopes there', text: t`With $E = e^{-((x-1)^2 + y^2)/2} = e^{-(4 + 3)/2} = e^{-3.5} = 0.0302$: $\dfrac{\partial T}{\partial x} = -50(x - 1)E = 3.02$ °C/cm and $\dfrac{\partial T}{\partial y} = -50\,y\,E = -2.62$ °C/cm.` },
      { label: 'Chain rule', text: t`$\dfrac{dT}{dt} = (3.02)(-1.732) + (-2.62)(-1) = -5.23 + 2.62 = -2.62$ °C/s. Moving left (away from the hot spot in $x$) cools the probe; moving down (toward it in $y$) warms it; cooling wins.` },
      { label: 'Check another way', text: t`On the circle, $(x - 1)^2 + y^2 = 5 - 4\cos t$, so $T = 20 + 50\,e^{-(5 - 4\cos t)/2}$ and $\dfrac{dT}{dt} = -100\sin t\; e^{-(5 - 4\cos t)/2} = -100(0.866)(0.0302) = -2.62$ °C/s. ✓` },
    ],
    answer: t`$dT/dt \approx -2.62$ °C/s: the probe is cooling.`,
  },
  practice: [
    mcq({
      id: 'tree', difficulty: 1,
      prompt: t`$z = f(x, y)$, where $x$ and $y$ both depend on two variables $s$ and $t$. Which formula gives $\dfrac{\partial z}{\partial s}$?`,
      visual: tree(TREE2, BR2, 'The tree diagram: z depends on x and y; each of them depends on s and t. Each branch carries the derivative of the upper variable with respect to the lower one.'),
      choices: [
        t`$\dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s} + \dfrac{\partial z}{\partial y}\dfrac{\partial y}{\partial s}$`,
        t`$\dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s}$`,
        t`$\dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s} + \dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial t}$`,
        t`$\left(\dfrac{\partial z}{\partial x} + \dfrac{\partial z}{\partial y}\right)\left(\dfrac{\partial x}{\partial s} + \dfrac{\partial y}{\partial s}\right)$`,
      ],
      answer: 0,
      why: {
        1: t`That follows only the path through $x$. Changing $s$ also changes $y$, which changes $z$: there are two routes from $z$ down to $s$.`,
        2: t`The second term follows a route to $t$, not to $s$. Every term must end at the variable you differentiate by.`,
        3: t`Expanding this gives cross terms like $\dfrac{\partial z}{\partial x}\dfrac{\partial y}{\partial s}$, which follow no route in the tree.`,
      },
      hints: ['Follow every route in the tree from z down to an s.', 'Multiply the derivatives along each route, then add the routes.'],
      teach: 'Each route from the top of the tree to the variable contributes the product of its branch derivatives; the routes add.',
      explain: t`Two routes lead from $z$ to $s$: through $x$ and through $y$. Multiply along each and add: $\dfrac{\partial z}{\partial s} = \dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s} + \dfrac{\partial z}{\partial y}\dfrac{\partial y}{\partial s}$.`,
      solution: t`In matrix form the chain rule is a product of Jacobian matrices: $\begin{pmatrix} z_s & z_t \end{pmatrix} = \begin{pmatrix} z_x & z_y \end{pmatrix}\begin{pmatrix} x_s & x_t \\ y_s & y_t \end{pmatrix}$. Every rule for transforming components between coordinate systems is this product in disguise.`,
    }),
    num({
      id: 'dzdt', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]), t0 = r.pick([1, 2]);
        // z = x^2 y, x = 1 + t^2, y = k - t
        const x = 1 + t0 * t0, y = k - t0, xd = 2 * t0, yd = -1;
        const ans = 2 * x * y * xd + x * x * yd;
        return {
          prompt: t`Let $z = x^2 y$, with $x = 1 + t^2$ and $y = ${k} - t$. Use the chain rule to find $\dfrac{dz}{dt}$ at $t = ${t0}$.`,
          visual: {
            type: 'c3-contour',
            params: {
              f: 'x^2*y', x: [-0.5, 5.5], y: [-2.6, 3.6], levels: 9, xlabel: 'x', ylabel: 'y',
              curves: [{ param: ['1 + t^2', `${k} - t`], t: [0, 2.3], color: 'violet', width: 2.2 }],
              points: [{ x, y, color: 'gold', label: `t = ${t0}` }],
            },
            caption: t`Level curves of $z = x^2 y$ and the path $(1 + t^2,\ ${k} - t)$ for $0 \le t \le 2.3$, with the point at $t = ${t0}$.`,
          },
          answer: ans, tol: { rel: 1e-6, abs: 1e-9 },
          errors: [
            { value: 2 * x * y * xd, feedback: t`That is only the $x$-route. $y$ changes with $t$ too: add $\dfrac{\partial z}{\partial y}\dfrac{dy}{dt} = x^2(-1)$.` },
            ...(2 * x * y + x * x * yd !== ans ? [{ value: 2 * x * y + x * x * yd, feedback: t`Each partial must be multiplied by its own rate: $\dfrac{dx}{dt} = 2t = ${xd}$.` }] : []),
          ],
          hints: [t`$\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt} = 2xy\,(2t) + x^2\,(-1)$.`, t`At $t = ${t0}$: $x = ${x}$, $y = ${y}$.`],
          teach: 'Evaluate each partial derivative at the point the path has reached, multiply by that coordinate’s rate, and add.',
          explain: t`At $t = ${t0}$: $x = ${x}$, $y = ${y}$, $\dfrac{dx}{dt} = ${xd}$, $\dfrac{dy}{dt} = -1$. So $\dfrac{dz}{dt} = 2(${x})(${y})(${xd}) + (${x})^2(-1) = ${2 * x * y * xd} - ${x * x} = ${ans}$. Substituting first, $z = (1 + t^2)^2(${k} - t)$, gives the same.`,
        };
      },
    }),
    expr({
      id: 'polar-r', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3, 4]);
        // f = x^2 + c x y; ∂f/∂r = f_x cosθ + f_y sinθ = 2r cos²θ + 2c r sinθ cosθ
        return {
          prompt: t`For $f(x, y) = x^2 + ${c}xy$, with $x = r\cos\theta$ and $y = r\sin\theta$, find $\dfrac{\partial f}{\partial r}$ as a function of $r$ and $\theta$.`,
          visual: {
            type: 'c3-contour',
            params: {
              f: `x^2 + ${c}*x*y`, x: [-2.5, 2.5], y: [-2, 2], levels: 9, fill: true, labels: false,
              curves: [{ param: ['t*cos(0.6)', 't*sin(0.6)'], t: [0, 2.3], color: 'gold', width: 2.4, label: 'θ fixed, r grows', labelAt: 0.95, labelDx: -40, labelDy: -14 }],
            },
            caption: t`Level curves of $f$ (unlabelled). Moving outward along a ray, with $\theta$ fixed, is what $\partial/\partial r$ measures.`,
          },
          answer: `2r*cos(theta)^2 + ${2 * c}*r*sin(theta)*cos(theta)`,
          answerTeX: t`2r\cos^2\theta + ${2 * c}r\sin\theta\cos\theta`,
          vars: { r: [0.3, 2.5], theta: [-3, 3] }, derivativeOf: `r^2*cos(theta)^2 + ${c}*r^2*cos(theta)*sin(theta)`, wrt: 'r', lhs: t`\dfrac{\partial f}{\partial r}`,
          errors: [{ answer: `2*r*cos(theta) + ${c}*r*sin(theta)`, feedback: t`That is $f_x$ written in polar form. The chain rule multiplies it by $\dfrac{\partial x}{\partial r} = \cos\theta$, and adds $f_y\,\dfrac{\partial y}{\partial r} = f_y\sin\theta$.` }],
          hints: [t`$\dfrac{\partial f}{\partial r} = f_x\dfrac{\partial x}{\partial r} + f_y\dfrac{\partial y}{\partial r} = f_x\cos\theta + f_y\sin\theta$.`, t`$f_x = 2x + ${c}y$ and $f_y = ${c}x$; now put $x = r\cos\theta$, $y = r\sin\theta$.`, t`Check by substituting first: $f = r^2\cos^2\theta + ${c}r^2\cos\theta\sin\theta$.`],
          teach: t`In polar coordinates $\partial f/\partial r = f_x\cos\theta + f_y\sin\theta$: the rate of change of $f$ along the outward ray.`,
          explain: t`$f_x\cos\theta + f_y\sin\theta = (2r\cos\theta + ${c}r\sin\theta)\cos\theta + ${c}r\cos\theta\sin\theta = 2r\cos^2\theta + ${2 * c}r\sin\theta\cos\theta$. Substituting first gives the same: $\partial_r\big(r^2\cos^2\theta + ${c}r^2\cos\theta\sin\theta\big)$.`,
        };
      },
    }),
    num({
      id: 'implicit', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 1], [2, -3], [-1, 3]]);
        const c = a * a + a * b + b * b;
        const slope = -(2 * a + b) / (a + 2 * b);
        return {
          prompt: t`The curve $x^2 + xy + y^2 = ${c}$ passes through $(${a}, ${b})$. Find the slope $\dfrac{dy}{dx}$ of the curve there.`,
          visual: { type: 'c3-contour', params: { f: 'x^2 + x*y + y^2', x: [-3.6, 3.6], y: [-3.2, 3.2], levels: [c], labels: false, fill: false, highlight: c, points: [{ x: a, y: b, color: 'bad', label: `(${a}, ${b})` }] }, caption: t`The curve $x^2 + xy + y^2 = ${c}$ (gold): an ellipse tilted at 45°.` },
          answer: slope, tol: { rel: 1e-3 },
          errors: [{ value: -1 / slope, feedback: t`Upside down: $\dfrac{dy}{dx} = -\dfrac{F_x}{F_y}$, with $F_x$ on top.` }, { value: -slope, feedback: t`Keep the minus sign: $\dfrac{dy}{dx} = -\dfrac{F_x}{F_y}$.` }],
          hints: [t`Let $F(x, y) = x^2 + xy + y^2$. Along the curve $F$ is constant, so $F_x + F_y\dfrac{dy}{dx} = 0$.`, t`$F_x = 2x + y$ and $F_y = x + 2y$.`],
          teach: t`On a level curve $F(x, y) = c$ the chain rule gives $F_x + F_y\,\tfrac{dy}{dx} = 0$, so $\tfrac{dy}{dx} = -F_x/F_y$.`,
          explain: t`$F_x = 2(${a}) + ${b < 0 ? `(${b})` : b} = ${2 * a + b}$ and $F_y = ${a} + 2(${b}) = ${a + 2 * b}$, so $\dfrac{dy}{dx} = -\dfrac{${2 * a + b}}{${a + 2 * b}} = ${nice(+slope.toPrecision(4))}$.`,
        };
      },
    }),
    mcq({
      id: 'cyclic', difficulty: 3,
      prompt: t`For a fixed amount of ideal gas, $P$, $V$ and $T$ are tied by $PV = nRT$, so any one is a function of the other two. What is the product $\left(\dfrac{\partial P}{\partial V}\right)_T\left(\dfrac{\partial V}{\partial T}\right)_P\left(\dfrac{\partial T}{\partial P}\right)_V$?`,
      visual: gasSurface({ V: 25, T: 300, caption: t`The ideal-gas surface. Each factor in the product is a slope taken with a different variable held fixed. Drag to rotate.` }),
      choices: ['−1', '+1', '0', 'It depends on n and T'],
      answer: 0,
      why: {
        1: t`Cancelling the $\partial V$, $\partial T$ and $\partial P$ as if they were fractions gives $+1$ — but each factor holds a different variable fixed, so they are not fractions that cancel.`,
        2: t`None of the three factors is zero for a gas at finite pressure and temperature.`,
        3: t`Work it out: every $n$, $R$, $P$, $V$ and $T$ cancels, leaving a pure number.`,
      },
      hints: [t`$\left(\tfrac{\partial P}{\partial V}\right)_T = -\tfrac{nRT}{V^2} = -\tfrac{P}{V}$; find the other two the same way.`, t`$\left(\tfrac{\partial V}{\partial T}\right)_P = \tfrac{nR}{P} = \tfrac{V}{T}$ and $\left(\tfrac{\partial T}{\partial P}\right)_V = \tfrac{V}{nR} = \tfrac{T}{P}$.`],
      teach: 'Partial derivatives with different variables held fixed are not fractions: the cyclic relation has a minus sign.',
      explain: t`$\left(-\dfrac{P}{V}\right)\left(\dfrac{V}{T}\right)\left(\dfrac{T}{P}\right) = -1$. This **triple product rule** holds for any three quantities tied by one equation $F(P, V, T) = 0$: it follows from the chain rule, since $\left(\tfrac{\partial P}{\partial V}\right)_T = -\tfrac{F_V}{F_P}$ and so on.`,
    }),
    mcq({
      id: 'error-branch', difficulty: 2, kind: 'error',
      prompt: t`A drone flies through the air-temperature field $T(x, y)$ along $x(t)$, $y(t)$. Its engineer writes $\dfrac{dT}{dt} = \dfrac{\partial T}{\partial x}\dfrac{dx}{dt}$, reasoning that the drone is “flying in the $x$ direction”. The drone’s heading is $30^\circ$ from the $x$-axis. What is wrong?`,
      visual: tree(TREE1, BR1, 'The tree for T(x(t), y(t)): two routes lead from T down to t. The engineer followed only the highlighted one.', [0, 2]),
      choices: [
        t`The $y$-route is missing: at a $30^\circ$ heading $dy/dt \ne 0$, so $\dfrac{\partial T}{\partial y}\dfrac{dy}{dt}$ must be added`,
        t`Nothing: the $y$-term is always negligible`,
        t`The formula should use $\dfrac{\partial T}{\partial t}$, which is zero for a steady field`,
        t`$\dfrac{\partial T}{\partial x}$ should be divided by $\dfrac{dx}{dt}$, not multiplied`,
      ],
      answer: 0,
      why: {
        1: t`It is negligible only when $\dfrac{\partial T}{\partial y}\dfrac{dy}{dt}$ is small — and at a $30^\circ$ heading $dy/dt$ is half the speed.`,
        2: t`For a steady field $\partial T/\partial t = 0$, yet the drone still sees $T$ change because it moves: that is what $dT/dt$ measures.`,
        3: t`The units decide it: $(\text{K/m})\times(\text{m/s}) = \text{K/s}$. Dividing gives K·s/m², not a rate.`,
      },
      hints: ['Draw the tree: how many routes lead from T to t?', t`At a $30^\circ$ heading the velocity has a $y$-component, $v\sin 30^\circ$.`],
      teach: 'Every route from the top of the tree to the variable must appear in the chain rule, or the result is wrong.',
      explain: t`$T$ depends on both $x$ and $y$, and both change with $t$, so $\dfrac{dT}{dt} = \dfrac{\partial T}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial T}{\partial y}\dfrac{dy}{dt}$, with $\dfrac{dx}{dt} = v\cos30^\circ$ and $\dfrac{dy}{dt} = v\sin30^\circ$. Dropping a branch is the commonest chain-rule slip.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-probe', difficulty: 2,
      gen(r) {
        const s0 = r.pick([Math.PI / 2, (5 * Math.PI) / 6, (4 * Math.PI) / 3, (3 * Math.PI) / 2]);
        const x = 2 * Math.cos(s0), y = 2 * Math.sin(s0), Ex = Math.exp(-((x - 1) ** 2 + y * y) / 2);
        const Tx = -50 * (x - 1) * Ex, Ty = -50 * y * Ex, vx = -2 * Math.sin(s0), vy = 2 * Math.cos(s0);
        const ans = Tx * vx + Ty * vy;
        const lab = { [Math.PI / 2]: t`\pi/2`, [(5 * Math.PI) / 6]: t`5\pi/6`, [(4 * Math.PI) / 3]: t`4\pi/3`, [(3 * Math.PI) / 2]: t`3\pi/2` }[s0];
        return {
          prompt: t`The probe on the plate $T = 20 + 50\,e^{-((x - 1)^2 + y^2)/2}$ °C moves as $x = 2\cos t$, $y = 2\sin t$ (cm, s). At $t = ${lab}$ s it is at $(${nice(+x.toFixed(3))}, ${nice(+y.toFixed(3))})$ cm, where $\dfrac{\partial T}{\partial x} = ${Tx.toFixed(3)}$ and $\dfrac{\partial T}{\partial y} = ${Ty.toFixed(3)}$ °C/cm. Find $dT/dt$ there.`,
          visual: plateMap(s0, t`The probe’s position at $t = ${lab}$ s on its circle. Level curves every 10 °C.`),
          answer: ans, units: '°C/s', difference: true, tol: { rel: 0.01, abs: 1e-4 },
          hints: [t`$\dfrac{dx}{dt} = -2\sin t$ and $\dfrac{dy}{dt} = 2\cos t$.`],
          teach: 'dT/dt is the sum of each partial derivative times the matching velocity component.',
          explain: t`$\dfrac{dx}{dt} = ${nice(+vx.toFixed(3))}$, $\dfrac{dy}{dt} = ${nice(+vy.toFixed(3))}$ cm/s, so $\dfrac{dT}{dt} = (${Tx.toFixed(3)})(${nice(+vx.toFixed(3))}) + (${Ty.toFixed(3)})(${nice(+vy.toFixed(3))}) = ${ans.toFixed(3)}$ °C/s.`,
        };
      },
    }),
    num({
      id: 'cp-climb', difficulty: 3, transfer: true,
      gen(r) {
        const w = r.pick([8, 10, 12, 15]), v = r.pick([200, 220, 240]), gy = r.pick([0.5, 0.8, 1.0]);
        const perMin = 60 * (-0.0065 * w - (gy / 1e5) * v);
        return {
          prompt: t`An airliner climbs at $${w}$ m/s while flying due north at ${v} m/s. In this air mass the temperature falls 6.5 K per km of altitude (the standard lapse rate) and falls ${gy} K per 100 km northward; it does not change with time. At what rate does the outside-air thermometer’s reading change, in K per minute?`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 120], y: [0, 12], aspect: 'wide', xlabel: 'distance north (km)', ylabel: 'altitude (km)', axesAt: 'edge',
              curves: [0, 2, 4, 6, 8, 10].map((z0) => ({ fn: `${z0} - ${r6(gy / 6.5 / 100)}*x`, color: 'accent2', width: 1.2 })),
              arrows: [{ from: [10, 3], to: [110, r6(3 + (100 * w) / v)], color: 'gold', label: 'flight path', labelDx: -90, labelDy: -14 }],
            },
            caption: t`Isotherms (blue lines, every 13 K) in a vertical slice of this air mass, and the climb-out drawn to scale. The isotherms tilt only slightly: the vertical change dominates.`,
          },
          answer: perMin, units: 'K/min', difference: true, tol: { rel: 0.01 },
          errors: [{ value: 60 * -0.0065 * w, feedback: t`You kept only the climb. The northward term is small but still there: $-\tfrac{${gy}\ \text{K}}{10^5\ \text{m}}\times ${v}$ m/s.` }, { value: -0.0065 * w - (gy / 1e5) * v, feedback: 'That is per second. Multiply by 60 for per minute.' }],
          hints: [t`$\dfrac{dT}{dt} = \dfrac{\partial T}{\partial z}\dfrac{dz}{dt} + \dfrac{\partial T}{\partial y}\dfrac{dy}{dt}$, with $z$ the altitude and $y$ the distance north.`, t`$\dfrac{\partial T}{\partial z} = -6.5\times10^{-3}$ K/m and $\dfrac{\partial T}{\partial y} = -${gy}\times10^{-5}$ K/m.`],
          teach: 'An instrument moving through a steady field reads the field’s change along its own velocity, term by term.',
          explain: t`$\dfrac{dT}{dt} = (-6.5\times10^{-3})(${w}) + (-${gy}\times10^{-5})(${v}) = ${(-0.0065 * w).toFixed(4)} ${(-(gy / 1e5) * v).toFixed(5)}$ K/s $= ${perMin.toFixed(2)}$ K/min. Climbing at a few metres per second changes the temperature far faster than crossing hundreds of kilometres of weather.`,
        };
      },
    }),
    num({
      id: 'cp-dtheta', difficulty: 3,
      gen(r) {
        const R = r.pick([1.5, 2, 3]), [th, lab] = r.pick([[Math.PI / 6, t`\pi/6`], [Math.PI / 8, t`\pi/8`], [Math.PI / 3, t`\pi/3`]]);
        const ans = R * R * Math.cos(2 * th);
        return {
          prompt: t`For $f(x, y) = xy$, use the chain rule to find $\dfrac{\partial f}{\partial \theta}$ at $r = ${R}$, $\theta = ${lab}$, where $x = r\cos\theta$, $y = r\sin\theta$.`,
          visual: { type: 'c3-contour', params: { f: 'x*y', x: [-3.6, 3.6], y: [-3.4, 3.4], levels: 9, labels: false, curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color: 'violet', width: 1.8 }], points: [{ x: r6(R * Math.cos(th)), y: r6(R * Math.sin(th)), color: 'gold', label: 'P' }] }, caption: t`Level curves of $xy$ and the circle $r = ${R}$: changing $\theta$ moves $P$ around the circle.` },
          answer: ans, tol: { rel: 1e-3, abs: 1e-6 },
          errors: [{ value: Math.cos(2 * th), feedback: t`$\dfrac{\partial x}{\partial \theta} = -r\sin\theta$ and $\dfrac{\partial y}{\partial \theta} = r\cos\theta$ each carry a factor $r$, so the answer carries $r^2$.` }],
          hints: [t`$\dfrac{\partial f}{\partial\theta} = f_x\dfrac{\partial x}{\partial\theta} + f_y\dfrac{\partial y}{\partial\theta} = y(-r\sin\theta) + x(r\cos\theta)$.`, t`That simplifies to $r^2(\cos^2\theta - \sin^2\theta) = r^2\cos 2\theta$.`],
          teach: t`In polar coordinates $\partial f/\partial\theta = -f_x\,r\sin\theta + f_y\,r\cos\theta$: the rate of change of $f$ per radian around the circle.`,
          explain: t`$\dfrac{\partial f}{\partial\theta} = -y\,r\sin\theta + x\,r\cos\theta = r^2\cos2\theta = ${R * R}\cos\left(2\cdot${lab}\right) = ${nice(+ans.toPrecision(4))}$. Its units are those of $f$ per radian — not per metre: keep that in mind for the next lesson.`,
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 3, §4.5 The chain rule', url: 'https://openstax.org/books/calculus-volume-3/pages/4-5-the-chain-rule' }],
});
