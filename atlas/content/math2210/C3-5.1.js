// Vector fields: a vector attached to every point. Reading and sketching
// them, the radial, rotational and inverse-square families, gradient fields,
// and flow lines — the paths a dust grain would ride.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { fieldPic, fieldArrows, path, paths, r6 } from './_fields.js';

const t = String.raw;

// four plane fields that are easy to confuse, with what each does at (1, 0) and (0, 1)
const LOOKALIKES = [
  { P: '-y', Q: 'x', tex: t`\langle -y,\ x\rangle`, at: t`$\langle 0, 1\rangle$ at $(1, 0)$ and $\langle -1, 0\rangle$ at $(0, 1)$: it turns anticlockwise` },
  { P: 'y', Q: '-x', tex: t`\langle y,\ -x\rangle`, at: t`$\langle 0, -1\rangle$ at $(1, 0)$ and $\langle 1, 0\rangle$ at $(0, 1)$: it turns clockwise` },
  { P: 'x', Q: '-y', tex: t`\langle x,\ -y\rangle`, at: t`$\langle 1, 0\rangle$ at $(1, 0)$ and $\langle 0, -1\rangle$ at $(0, 1)$: out along the $x$-axis, in along the $y$-axis` },
  { P: 'y', Q: 'x', tex: t`\langle y,\ x\rangle`, at: t`$\langle 0, 1\rangle$ at $(1, 0)$ and $\langle 1, 0\rangle$ at $(0, 1)$: out along the diagonal $y = x$, in along $y = -x$` },
];
const WIDE = { x: [-3.2, 3.2], y: [-1.55, 1.55] };

export default lesson({
  id: 'math2210.C3-5.1',
  title: 'Vector fields',
  minutes: 9, difficulty: 2,
  intro: t`A **vector field** attaches a vector to every point of a region: the wind’s velocity at each point of a weather map, the gravitational field around a planet, the force on a test charge at each place near a wire. In the plane it is a pair of ordinary functions of position, its **components**:

$$\vec F(x, y) = P(x, y)\,\hat\imath + Q(x, y)\,\hat\jmath = \big\langle P(x, y),\ Q(x, y)\big\rangle$$

You draw one by putting an arrow at a sample of points. A few families recur all through physics: **radial** fields like gravity, **rotational** fields like a whirlpool, and **gradient** fields $\vec F = \nabla f$, which cross the level curves of $f$ at right angles. Following the arrows gives the **flow lines** — the paths a dust grain carried by the field would ride.`,
  symbols: [
    { tex: '\\vec F', text: 'the field: one vector for each point, in the units of whatever it measures (m/s for a velocity field, N/kg for gravity)' },
    { tex: '(x, y)', text: 'the point where the vector is attached: the arrow $\\vec F(x, y)$ is drawn with its tail there' },
    { tex: 'P,\\ Q', text: 'the component functions: the $x$- and $y$-components of the arrow at $(x, y)$' },
    { tex: '\\hat\\imath,\\ \\hat\\jmath', text: 'the unit vectors along the $x$- and $y$-axes' },
    { tex: '\\langle a,\\ b\\rangle', text: 'the vector with components $a$ and $b$ — angle brackets, so a vector is not confused with the point $(a, b)$' },
  ],
  why: t`Gravity, electric and magnetic fields, fluid velocity and heat flow are all vector fields; the rest of this module integrates them along curves and over surfaces, and differentiates them into divergence and curl.`,
  visual: {
    type: 'field2d',
    title: 'Six fields, and the paths they carry',
    lead: t`Pick a field. Each arrow is $\vec F$ at its tail’s point — lengths compressed, so weak and strong regions both show, and colour giving strength — and the drifting dots ride the **flow lines**. Drag the gold probe to read $\vec F$ anywhere. (It also reads two numbers, the divergence and the curl, which lesson 5 of this module is about.)`,
    tasks: [
      t`Rotation: the dots circle the origin. Drag the probe out along a ray and watch $\vec F$ grow in proportion to the distance.`,
      t`Inverse square: every arrow points at the origin. Double the probe’s distance and $|\vec F|$ drops to a quarter — gravity’s pattern.`,
      t`Shear: every arrow is horizontal, yet the layers slide past one another at different speeds.`,
    ],
    params: {
      P: pickExpr('k', ['1', 'x', '-y', 'x', '-x/(x^2 + y^2)^1.5', 'y']),
      Q: pickExpr('k', ['0.5', 'y', 'x', '-y', '-y/(x^2 + y^2)^1.5', '0']),
      x: [-3, 3], y: [-3, 3], probe: [1.5, 1],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Uniform'], [1, 'Radial'], [2, 'Rotation'], [3, 'Saddle'], [4, 'Inverse square'], [5, 'Shear']], value: 2, explain: t`Uniform $\langle 1, 0.5\rangle$; radial $\langle x, y\rangle$; rotation $\langle -y, x\rangle$; saddle $\langle x, -y\rangle$; inverse square $-\langle x, y\rangle/r^3$; shear $\langle y, 0\rangle$.` }],
    },
    caption: t`Arrow lengths are compressed so weak and strong regions both show; colour gives the strength. The dots move along $\vec F$ at a capped speed. The probe’s numbers are computed numerically.`,
  },
  example: {
    prompt: t`Sketch the field $\vec F(x, y) = \langle -y,\ x\rangle$ and find its flow lines.`,
    visual: fieldPic('-y', 'x', {
      ...WIDE, n: 15, ...paths(path('0.7*cos(t)', '0.7*sin(t)', [0, 2 * Math.PI], { at: [0.12, 0.62], width: 2.6 }), path('1.35*cos(t)', '1.35*sin(t)', [0, 2 * Math.PI], { at: [0.05, 0.3, 0.55, 0.8], width: 2.6 })),
      caption: t`The field $\langle -y, x\rangle$ (arrows compressed) and two of its flow lines, circles traced anticlockwise (gold).`,
    }),
    steps: [
      { label: 'Sample points', text: t`$\vec F(1, 0) = \langle 0, 1\rangle$ points up; $\vec F(0, 1) = \langle -1, 0\rangle$ points left; $\vec F(-1, 0) = \langle 0, -1\rangle$ points down; $\vec F(0, -1) = \langle 1, 0\rangle$ points right. Already it is turning anticlockwise.` },
      { label: 'Direction everywhere', text: t`Dot it with the position vector: $\vec F\cdot\langle x, y\rangle = -yx + xy = 0$. Every arrow is **perpendicular to the radius** through its point, so it is tangent to the circle about the origin through that point.` },
      { label: 'Size', text: t`$|\vec F| = \sqrt{(-y)^2 + x^2} = \sqrt{x^2 + y^2} = r$: the arrows grow in proportion to the distance from the origin, and vanish at the origin itself.` },
      { label: 'Flow lines', text: t`A flow line $\vec r(t) = \langle x(t), y(t)\rangle$ has velocity equal to the field at each point: $x' = -y$, $y' = x$. Try $x = R\cos t$, $y = R\sin t$: then $x' = -R\sin t = -y$ ✓ and $y' = R\cos t = x$ ✓. The flow lines are the circles $x^2 + y^2 = R^2$, traced anticlockwise.` },
      { label: 'What it is', text: t`This is the velocity field of a turntable spinning at 1 rad/s: $\vec v = \vec\omega\times\vec r$ with $\vec\omega = \hat k$. Every point goes round once in $2\pi$ seconds, and the rim moves fastest.` },
    ],
    answer: t`Arrows tangent to circles about the origin, anticlockwise, of length $r$; the flow lines are the circles $x^2 + y^2 = R^2$.`,
  },
  practice: [
    mcq({
      id: 'which-formula', difficulty: 1,
      gen(r) {
        const k = r.int(0, 3), F = LOOKALIKES[k];
        const why = {};
        LOOKALIKES.forEach((G, j) => { if (j !== k) why[j] = t`That field gives ${G.at}. Compare its arrows at those two points with the picture.`; });
        return {
          prompt: 'Which formula gives the vector field drawn here?',
          visual: fieldPic(F.P, F.Q, { ...WIDE, n: 15, points: [{ x: 1, y: 0, color: 'ink', r: 3, label: '(1, 0)', labelDx: 6, labelDy: 12 }, { x: 0, y: 1, color: 'ink', r: 3, label: '(0, 1)', labelDx: 6, labelDy: -10 }], caption: 'The field at a grid of points (lengths compressed, colour shows strength), with two points marked.' }),
          choices: LOOKALIKES.map((G) => t`$\vec F = ${G.tex}$`),
          answer: k, why,
          hints: [t`Find the arrows at $(1, 0)$ and at $(0, 1)$ in the picture.`, t`At $(1, 0)$ a formula $\langle P, Q\rangle$ gives $\langle P(1, 0),\ Q(1, 0)\rangle$: substitute $x = 1$, $y = 0$ into each candidate.`],
          teach: 'To identify a field, evaluate the candidate formulas at a few easy points and compare the arrows.',
          explain: t`$\vec F = ${F.tex}$ gives ${F.at}, which is what the picture shows.`,
        };
      },
    }),
    num({
      id: 'eval-mag', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[2, 1], [-1, 2], [3, 2], [2, -2], [-2, -1]]);
        const P = a * a - b, Q = a * b, m = Math.hypot(P, Q);
        return {
          prompt: t`For $\vec F(x, y) = \langle x^2 - y,\ xy\rangle$, how long is the arrow $\vec F(${a}, ${b})$?`,
          visual: fieldPic('x^2 - y', 'x*y', { x: [-4.5, 4.5], y: [-2.75, 2.75], aspect: '', n: 15, points: [{ x: a, y: b, color: 'ink', label: `(${a}, ${b})` }], caption: t`The field $\langle x^2 - y, xy\rangle$ with arrow lengths compressed (colour shows strength), and the point $(${a}, ${b})$.` }),
          answer: m, tol: { rel: 2e-3 },
          errors: [{ value: Math.abs(P) + Math.abs(Q), feedback: t`Lengths of components do not add: the length of $\langle ${P}, ${Q}\rangle$ is $\sqrt{${P}^2 + ${Q}^2}$, by Pythagoras.` }, { value: P * P + Q * Q, feedback: 'That is the squared length: take the square root.' }],
          hints: [t`First find the vector: $P(${a}, ${b}) = ${a}^2 - (${b})$ and $Q(${a}, ${b}) = (${a})(${b})$.`, t`Then $|\vec F| = \sqrt{P^2 + Q^2}$.`],
          teach: 'Evaluate each component at the point, then take the length of the resulting vector.',
          explain: t`$\vec F(${a}, ${b}) = \langle ${P},\ ${Q}\rangle$, so $|\vec F| = \sqrt{${P * P} + ${Q * Q}} = \sqrt{${P * P + Q * Q}} \approx ${nice(+m.toPrecision(4))}$.`,
        };
      },
    }),
    mcq({
      id: 'radial-power', difficulty: 2,
      prompt: t`A radial field $\vec F = -\dfrac{\vec r}{|\vec r|^{p}}$ points at the origin, where $\vec r = \langle x, y\rangle$ is the position vector. For which power $p$ does its strength fall off as an **inverse square**, $|\vec F| = 1/r^2$, like Newton’s gravity?`,
      visual: fieldPic('-x/(x^2 + y^2)^1.5', '-y/(x^2 + y^2)^1.5', { ...WIDE, n: 15, skip: (x, y) => Math.hypot(x, y) < 0.3, points: [{ x: 0, y: 0, color: 'ink', r: 4 }], caption: 'An inverse-square field pointing at the origin, lengths compressed: colour shows how fast its strength falls away.' }),
      choices: ['$p = 3$', '$p = 2$', '$p = 1$', '$p = -2$'],
      fixedOrder: true,
      answer: 0,
      why: {
        1: t`Then $|\vec F| = r/r^2 = 1/r$: an inverse-**first**-power field — the field of a long straight line charge, not of a point mass. The $\vec r$ on top carries one power of $r$ already.`,
        2: t`Then $|\vec F| = r/r = 1$: a field of unit vectors all pointing inward, the same strength everywhere.`,
        3: t`A negative power puts $|\vec r|^2$ on top: $|\vec F| = r^3$, growing with distance instead of falling off.`,
      },
      hints: [t`The size of $\vec r$ is $|\vec r| = r$.`, t`$|\vec F| = \dfrac{|\vec r|}{|\vec r|^{p}} = r^{1-p}$. Set $1 - p = -2$.`],
      teach: t`$\vec r/|\vec r|^3 = \hat r/r^2$: the unit vector $\hat r = \vec r/r$ gives the direction, and one more factor $1/r^2$ gives the inverse-square strength.`,
      explain: t`$|\vec F| = r^{1-p}$, so an inverse square needs $p = 3$: $\vec F = -\vec r/r^3 = -\hat r/r^2$. That is why gravity is written $\vec g = -GM\,\vec r/r^3$.`,
    }),
    expr({
      id: 'grad-Q', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4);
        const f = `x^2*y + sin(${k}*y)`;
        const lv = Array.from({ length: 9 }, (_, i) => -3 + 0.75 * i);
        return {
          prompt: t`The gradient field of $f(x, y) = x^2y + \sin(${k}y)$ is $\nabla f = \langle P, Q\rangle$. Find its $y$-component $Q(x, y)$.`,
          visual: {
            type: 'c3-contour',
            params: {
              f, x: [-2.4, 2.4], y: [-1.5, 1.5], levels: lv, labels: false, aspect: 'wide',
              arrows: fieldArrows(`2*x*y`, `x^2 + ${k}*cos(${k}*y)`, { x: [-2.4, 2.4], y: [-1.5, 1.5], n: 11, alpha: 0.95 }).map((a) => ({ from: a.from, to: a.to, color: 'ink' })),
            },
            caption: t`Level curves of $f$ (shaded by height) and its gradient field, lengths compressed. Every arrow crosses the level curve through its tail at right angles, pointing uphill.`,
          },
          answer: `x^2 + ${k} cos(${k} y)`, answerTeX: t`x^2 + ${k}\cos(${k}y)`,
          lhs: 'Q(x, y)', vars: { y: [-2, 2], x: [-2, 2] }, derivativeOf: f,
          errors: [
            { answer: '2x y', feedback: t`That is $\partial f/\partial x$, the $x$-component $P$. The $y$-component is $\partial f/\partial y$.` },
            { answer: `x^2 + cos(${k} y)`, feedback: t`The chain rule brings out a factor: $\dfrac{\partial}{\partial y}\sin(${k}y) = ${k}\cos(${k}y)$.` },
            { answer: `x^2 - ${k} cos(${k} y)`, feedback: t`The derivative of $\sin$ is $+\cos$; the minus sign belongs to the derivative of $\cos$.` },
          ],
          hints: [t`The components of $\nabla f$ are the partial derivatives: $Q = \partial f/\partial y$.`, t`Hold $x$ fixed: $\dfrac{\partial}{\partial y}(x^2 y) = x^2$.`],
          teach: 'A gradient field’s components are the partial derivatives of its potential: P = ∂f/∂x and Q = ∂f/∂y.',
          explain: t`$Q = \dfrac{\partial f}{\partial y} = x^2 + ${k}\cos(${k}y)$, and $P = 2xy$, so $\nabla f = \langle 2xy,\ x^2 + ${k}\cos(${k}y)\rangle$ — a field that crosses every level curve of $f$ at right angles.`,
        };
      },
    }),
    expr({
      id: 'flow-line', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3]), b = r.pick([1, -1, 0.5, 1.5]);
        return {
          prompt: t`Find the flow line of $\vec F(x, y) = \langle x,\ ${k}y\rangle$ through the point $(1, ${b})$, as $y$ in terms of $x$ (for $x > 0$).`,
          visual: fieldPic('x', `${k}*y`, { ...WIDE, n: 15, points: [{ x: 1, y: b, color: 'gold', r: 5, label: `(1, ${b})`, labelDx: 8, labelDy: b > 0 ? -10 : 12 }], caption: t`The field $\langle x, ${k}y\rangle$, lengths compressed, and the starting point. A flow line runs along the arrows through it.` }),
          answer: `${b} x^${k}`, answerTeX: t`${b === 1 ? '' : b === -1 ? '-' : b}x^{${k}}`,
          lhs: 'y', vars: { x: [0.3, 2] },
          errors: [
            { answer: `${b} x`, feedback: t`That is a flow line of the radial field $\langle x, y\rangle$. Here the slope of a flow line is $\dfrac{dy}{dx} = \dfrac{Q}{P} = \dfrac{${k}y}{x}$.` },
            { answer: `${b} x^(1/${k})`, feedback: t`That solves $\dfrac{dy}{dx} = \dfrac{P}{Q}$ — upside down. A flow line’s slope is $\dfrac{dy}{dx} = \dfrac{Q}{P}$, rise over run of the arrow.` },
          ],
          hints: [t`Along a flow line the curve points along $\vec F$, so its slope is $\dfrac{dy}{dx} = \dfrac{Q}{P} = \dfrac{${k}y}{x}$.`, t`Separate the variables: $\dfrac{dy}{y} = ${k}\dfrac{dx}{x}$, so $\ln|y| = ${k}\ln x + C$, i.e. $y = Ax^{${k}}$.`, t`Choose $A$ so the curve passes through $(1, ${b})$.`],
          teach: 'A flow line is tangent to the field everywhere, so its slope dy/dx equals Q/P — a separable differential equation.',
          explain: t`$\dfrac{dy}{y} = ${k}\dfrac{dx}{x}$ gives $y = Ax^{${k}}$, and $y(1) = ${b}$ makes $A = ${b}$: $y = ${b === 1 ? '' : b === -1 ? '-' : b}x^{${k}}$. Check: $y' = ${nice(k * b)}x^{${k - 1}}$ and $Q/P = ${k}y/x = ${nice(k * b)}x^{${k - 1}}$ ✓.`,
          solution: t`Or solve $x' = x$, $y' = ${k}y$ directly: $x = e^{t}$ and $y = ${b}e^{${k}t}$ pass through $(1, ${b})$ at $t = 0$, and $y = ${b}(e^t)^{${k}} = ${b}x^{${k}}$.`,
        };
      },
    }),
    mcq({
      id: 'no-crossing', difficulty: 2,
      prompt: t`In the saddle field $\vec F = \langle x,\ -y\rangle$ the flow lines are the hyperbolas $xy = c$ and the four half-axes, which come together at the origin. Can two different flow lines ever **cross** at a point where $\vec F \ne \vec 0$?`,
      visual: fieldPic('x', '-y', {
        ...WIDE, n: 15,
        ...paths(
          // each branch is walked the way the field carries it: away from the y-axis, toward the x-axis
          ...[0.35, 1].flatMap((c) => [path(`${c}/t`, 't', [1.5, c / 3.1], { color: 'gold', width: 2, at: [0.5] }), path(`-${c}/t`, '-t', [1.5, c / 3.1], { color: 'gold', width: 2, at: [0.5] }), path(`${c}/t`, '-t', [1.5, c / 3.1], { color: 'gold', width: 2, at: [0.5] }), path(`-${c}/t`, 't', [1.5, c / 3.1], { color: 'gold', width: 2, at: [0.5] })]),
          path('t', '0', [0.06, 3.1], { color: 'gold', width: 2, at: [0.6] }), path('-t', '0', [0.06, 3.1], { color: 'gold', width: 2, at: [0.6] }),
          path('0', 't', [1.5, 0.06], { color: 'gold', width: 2, at: [0.45] }), path('0', '-t', [1.5, 0.06], { color: 'gold', width: 2, at: [0.45] }),
        ),
        points: [{ x: 0, y: 0, color: 'ink', r: 4 }],
        caption: t`The saddle field $\langle x, -y\rangle$ with some of its flow lines (gold): in along the $y$-direction, out along the $x$-direction. At the origin the field is zero.`,
      }),
      choices: [
        t`No: at a crossing the field would have to point along both lines at once. Flow lines can only come together where $\vec F = \vec 0$, like the origin here`,
        'Yes: wherever two dust grains happen to arrive at the same moment',
        'Yes: wherever the field is strongest, lines can be forced across each other',
        'Yes, but only if the two lines just touch, tangent to each other, without crossing',
      ],
      answer: 0,
      why: {
        1: t`A flow line is a fixed curve of the field, not a moment in time. In a steady field any grain at a point moves along the one arrow there, so it continues along the same line as every other grain at that point.`,
        2: t`Strength sets how fast a grain moves along its line, not how many directions there are: each point carries one arrow.`,
        3: t`Even touching is ruled out: through each point where $\vec F \ne \vec 0$ runs exactly one flow line, and two tangent lines would be two lines through one point.`,
      },
      hints: ['How many arrows does the field attach to one point?', 'A flow line through a point must run along the arrow there.'],
      teach: 'Where F ≠ 0 there is exactly one flow line through each point, so flow lines never cross; they can only converge on zeros of the field.',
      explain: t`At a point with $\vec F \ne \vec 0$ the one arrow fixes the one direction a flow line can take, so two flow lines cannot pass through it. Only at a zero of the field — a **stagnation point** like this origin — can several flow lines head into the same point (and a grain placed exactly there never moves).`,
    }),
    mcq({
      id: 'error-swirl', difficulty: 2, kind: 'error',
      prompt: t`A student sketches $\vec F = \langle y,\ x\rangle$ and reasons: “At $(1, 0)$ the arrow is $\langle 0, 1\rangle$, straight up — perpendicular to the radius, just like the rotation field. So $\langle y, x\rangle$ swirls anticlockwise round the origin.” What is wrong?`,
      visual: fieldPic('y', 'x', { ...WIDE, n: 15, points: [{ x: 1, y: 0, color: 'ink', r: 3, label: '(1, 0)', labelDx: 6, labelDy: 12 }, { x: 0, y: 1, color: 'ink', r: 3, label: '(0, 1)', labelDx: 6, labelDy: -10 }], caption: t`The field $\langle y, x\rangle$ itself, lengths compressed.` }),
      choices: [
        t`One point is not enough: at $(0, 1)$ the arrow is $\langle 1, 0\rangle$, pointing right — a rotation would point left — and along $y = x$ the arrows point straight out. It is a saddle`,
        t`Nothing: $\langle y, x\rangle$ is the rotation field`,
        t`The arrow at $(1, 0)$ is $\langle 1, 0\rangle$, not $\langle 0, 1\rangle$`,
        'It swirls, but clockwise rather than anticlockwise',
      ],
      answer: 0,
      why: {
        1: t`The rotation field is $\langle -y, x\rangle$: at $(0, 1)$ it gives $\langle -1, 0\rangle$, pointing left. $\langle y, x\rangle$ gives $\langle 1, 0\rangle$ there.`,
        2: t`$P(1, 0) = y = 0$ and $Q(1, 0) = x = 1$: the student read that point correctly. The slip is concluding from one point.`,
        3: t`A clockwise swirl would point **down** at $(1, 0)$. This field does not swirl at all: on the line $y = x$ it gives $\langle x, x\rangle$, straight away from the origin.`,
      },
      hints: [t`Check the claim at a second point, such as $(0, 1)$ or $(1, 1)$.`, t`At $(1, 1)$, $\vec F = \langle 1, 1\rangle$: is that tangent to a circle about the origin?`],
      teach: 'One arrow cannot identify a field: check several points, including ones off the axes.',
      explain: t`$\langle y, x\rangle$ agrees with the rotation field only on the $x$-axis. At $(0, 1)$ it points right, and along $y = x$ it points radially outward: it is a saddle, stretching along $y = x$ and squeezing along $y = -x$.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-which', difficulty: 2,
      gen(r) {
        const opts = [
          { P: 'x', Q: '-y', tex: t`\langle x,\ -y\rangle` }, { P: '-x', Q: 'y', tex: t`\langle -x,\ y\rangle` },
          { P: '-y', Q: '-x', tex: t`\langle -y,\ -x\rangle` }, { P: 'x', Q: 'y', tex: t`\langle x,\ y\rangle` },
        ];
        const k = r.int(0, 1), F = opts[k];
        const desc = [t`out along the $x$-axis and in along the $y$-axis`, t`in along the $x$-axis and out along the $y$-axis`, t`in along $y = x$ and out along $y = -x$`, t`straight away from the origin everywhere`];
        const why = {};
        opts.forEach((G, j) => { if (j !== k) why[j] = t`$${G.tex}$ points ${desc[j]}.`; });
        return {
          prompt: 'Which formula gives the field drawn here?',
          visual: fieldPic(F.P, F.Q, { ...WIDE, n: 15, caption: 'A vector field at a grid of points (lengths compressed, colour shows strength).' }),
          choices: opts.map((G) => t`$${G.tex}$`),
          answer: k, why,
          hints: [t`Look at the arrows on the positive $x$-axis and on the positive $y$-axis.`],
          teach: 'Evaluate each candidate at a couple of easy points and compare with the picture.',
          explain: t`$${F.tex}$ points ${desc[k]}, as drawn.`,
        };
      },
    }),
    expr({
      id: 'cp-circle', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [1, 2], [-2, 1], [1, -3]]);
        const R2 = a * a + b * b, R = Math.sqrt(R2);
        return {
          prompt: t`Write an equation for the flow line of $\vec F = \langle -y,\ x\rangle$ through the point $(${a}, ${b})$.`,
          visual: fieldPic('-y', 'x', { x: [-9.4, 9.4], y: [-4.5, 4.5], n: 17, points: [{ x: a, y: b, color: 'gold', r: 5, label: `(${a}, ${b})` }], caption: t`The rotation field $\langle -y, x\rangle$ (lengths compressed) and the point the flow line passes through.` }),
          answer: `x^2 + y^2 = ${R2}`, answerTeX: t`x^2 + y^2 = ${R2}`,
          vars: { x: [-3, 3], y: [-3, 3] }, mode: 'equation',
          errors: [{ answer: `x^2 + y^2 = ${r6(R)}`, feedback: t`The right-hand side of a circle’s equation is the radius **squared**: $r^2 = ${a}^2 + ${b}^2 = ${R2}$.` }, { answer: `y = ${nice(b / a)} x`, feedback: 'That is a ray through the origin — a flow line of the radial field. The rotation field carries points round circles.' }],
          hints: ['The flow lines of the rotation field are circles about the origin.', t`Which circle about the origin passes through $(${a}, ${b})$?`],
          teach: 'The rotation field ⟨−y, x⟩ is perpendicular to every radius, so its flow lines are circles about the origin.',
          explain: t`The circle about the origin through $(${a}, ${b})$ has $r^2 = ${a}^2 + ${b}^2 = ${R2}$: $x^2 + y^2 = ${R2}$, traced anticlockwise.`,
        };
      },
    }),
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const GM = 4.903e12;
        const [xk, yk] = r.pick([[1200, 1300], [-900, 1600], [1500, -1100], [300, 1800]]);
        const x = xk * 1e3, y = yk * 1e3, R = Math.hypot(x, y), gx = (-GM * x) / R ** 3, g = GM / R ** 2;
        const u = [-x / R, -y / R];
        return {
          prompt: t`A lunar orbiter’s navigation software models the Moon’s gravity in the plane of the orbit as the inverse-square field
$$\vec g(x, y) = -\frac{GM\,\langle x,\ y\rangle}{(x^2 + y^2)^{3/2}},$$
with the Moon’s centre at the origin and $GM = 4.903\times10^{12}\ \text{m}^3/\text{s}^2$. The orbiter is at $(x, y) = (${xk},\ ${yk})$ km. Find the $x$-component $g_x$ of the field there.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4.4, 4.4], y: [-2.1, 2.1], equal: true, aspect: 'wide', xlabel: 'x (1000 km)', ylabel: 'y (1000 km)',
              curves: [{ param: ['1.7374*cos(t)', '1.7374*sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 2 }],
              points: [{ x: 0, y: 0, color: 'ink3', r: 3 }, { x: xk / 1000, y: yk / 1000, color: 'gold', r: 5, label: 'orbiter', labelDx: xk < 0 ? -10 : 10, labelAlign: xk < 0 ? 'right' : 'left' }],
              arrows: [{ from: [xk / 1000, yk / 1000], to: [r6(xk / 1000 + 0.75 * u[0]), r6(yk / 1000 + 0.75 * u[1])], color: 'bad', label: 'g', labelDx: 6, labelDy: 8 }],
            },
            caption: 'The Moon (grey circle, radius 1737 km) and the orbiter. The field arrow points at the Moon’s centre; its length here shows direction only.',
          },
          answer: gx, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: g, feedback: t`That is the field’s whole strength $GM/r^2$. Its $x$-component is that times $-x/r$.` },
            { value: (-GM * x) / R ** 2, feedback: t`One power of $r$ short: the strength is $GM/r^2$, and the direction’s $x$-component is $-x/r$, so $g_x = -GMx/r^3$.` },
          ],
          hints: [t`Work in metres: $x = ${xk}\times10^3$ m, and $r = \sqrt{x^2 + y^2}$.`, t`$g_x = -\dfrac{GM\,x}{r^3}$.`],
          teach: 'An inverse-square field’s x-component is its strength GM/r² times the direction’s x-component −x/r.',
          explain: t`$r = \sqrt{${xk}^2 + ${yk}^2}$ km $= ${nice(+(R / 1e3).toPrecision(5))}$ km, so $g_x = -\dfrac{(4.903\times10^{12})(${xk}\times10^{3})}{(${nice(+(R / 1e6).toPrecision(5))}\times10^{6})^3} = ${nice(+gx.toPrecision(3))}\ \text{m/s}^2$. The whole field there is $GM/r^2 = ${nice(+g.toPrecision(3))}\ \text{m/s}^2$, pointing at the centre.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.1 Vector fields', url: 'https://openstax.org/books/calculus-volume-3/pages/6-1-vector-fields' },
    { label: 'NASA Moon fact sheet (GM, radius)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html' },
  ],
});
