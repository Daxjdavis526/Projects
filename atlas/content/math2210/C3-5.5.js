// Divergence and curl: outflow per unit volume and circulation per unit
// area, computed from partial derivatives. The pictures that mislead (shear
// has curl with straight arrows; the vortex has none with curved ones), the
// identities curl ∇f = 0 and div curl F = 0, and the Laplacian.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { fieldPic, boxSurface, r6, co } from './_fields.js';

const t = String.raw;
const PI = Math.PI;

/** A paddle wheel drawn on a graph at (x, y): a circle and four spokes. */
const paddle = (x, y, s = 0.32) => ({
  curves: [
    { param: [`${x} + ${s}*cos(t)`, `${y} + ${s}*sin(t)`], t: [0, 2 * PI], color: 'ink', width: 2 },
    ...[0, 1].map((k) => { const a = (k * PI) / 2 + 0.4, c = r6(s * Math.cos(a)), d = r6(s * Math.sin(a)); return { param: [`${x} + ${c}*t`, `${y} + ${d}*t`], t: [-1, 1], color: 'ink', width: 2 }; }),
  ],
});
/** Join graph parts (curves and arrows lists). */
const join = (...parts) => ({ curves: parts.flatMap((p) => p.curves || []), arrows: parts.flatMap((p) => p.arrows || []) });
/** A 3D picture of a point and arrows on calc-vectors3d. */
const scene = (pts, vecs, caption, range = 3.2) => ({ type: 'calc-vectors3d', params: { range, points: pts, vectors: vecs }, caption });

export default lesson({
  id: 'math2210.C3-5.5',
  title: 'Divergence and curl',
  minutes: 12, difficulty: 3,
  intro: t`Two derivatives of a vector field say what it does near a point. The **divergence** is the net outflow per unit volume — positive where the field springs from a source, negative at a sink. The **curl** is the circulation per unit area, a vector along the axis that a tiny paddle wheel would spin about. With the operator $\nabla = \langle \partial_x,\ \partial_y,\ \partial_z\rangle$:

$$\nabla\cdot\vec F = \frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y} + \frac{\partial R}{\partial z} \qquad \nabla\times\vec F = \left\langle R_y - Q_z,\ \ P_z - R_x,\ \ Q_x - P_y\right\rangle$$

In the plane only the last component survives: $Q_x - P_y$, Green’s integrand. Neither can be read off the shape of the arrows alone — a shear flow with perfectly straight arrows has curl, and a vortex whose arrows curve round has none.`,
  symbols: [
    { tex: '\\vec F = \\langle P, Q, R\\rangle', text: 'a vector field in space, with components $P$, $Q$, $R$ (in the plane, $R = 0$ and nothing depends on $z$)' },
    { tex: '\\nabla', text: '“del”, the vector of partial-derivative operators $\\langle \\partial_x, \\partial_y, \\partial_z\\rangle$; $\\partial_x$ is short for $\\partial/\\partial x$' },
    { tex: '\\nabla\\cdot\\vec F', text: 'the divergence: a **scalar**, net outflow per unit volume (per unit area in the plane)' },
    { tex: '\\nabla\\times\\vec F', text: 'the curl: a **vector**; its size is the circulation per unit area round a small loop facing the best way, and it points along the spin axis by the right-hand rule' },
    { tex: 'R_y', text: 'shorthand for $\\partial R/\\partial y$, and so on' },
  ],
  why: t`Maxwell’s equations, whose integral forms you use in Physics II, are in differential form one divergence and one curl each for $\vec E$ and $\vec B$; and the divergence of a gradient, $\nabla^2\Phi = 4\pi G\rho$, is the Newtonian gravity that Einstein’s equations reduce to for weak fields.`,
  visual: {
    type: 'field2d',
    title: 'Spread and spin, at a point',
    lead: t`The probe reads the divergence $\nabla\cdot\vec F$ and the curl $(\nabla\times\vec F)_z = Q_x - P_y$ where it stands. Before you drag it, guess from the picture: does the field spread out here, or swirl? Several of these fields are chosen to fool the eye.`,
    tasks: [
      t`Shear: every arrow points the same way, yet the curl is $-1$ everywhere — a paddle wheel turns, because the flow above it is faster than the flow below.`,
      t`Vortex: the arrows curve round the origin, yet away from it the curl is $0$ — a paddle wheel is carried round without turning.`,
      t`Line source: the arrows spread apart, yet away from the origin the divergence is $0$: they weaken as $1/r$, just fast enough. Stretch: parallel arrows, divergence $1$.`,
    ],
    params: {
      P: pickExpr('k', ['x', '-y', 'y', 'x', 'x/(x^2 + y^2)', '-y/(x^2 + y^2)']),
      Q: pickExpr('k', ['y', 'x', '0', '0', 'y/(x^2 + y^2)', 'x/(x^2 + y^2)']),
      x: [-3, 3], y: [-3, 3], probe: [1.2, 1],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Source'], [1, 'Whirl'], [2, 'Shear'], [3, 'Stretch'], [4, 'Line source'], [5, 'Vortex']], value: 2, explain: t`Source $\langle x, y\rangle$; whirl $\langle -y, x\rangle$; shear $\langle y, 0\rangle$; stretch $\langle x, 0\rangle$; line source $\langle x, y\rangle/r^2$ (the field of a long charged wire seen end-on); vortex $\langle -y, x\rangle/r^2$.` }],
    },
    caption: t`Arrow lengths are compressed so weak and strong regions both show; colour gives strength. The probe’s divergence and curl are computed numerically from the field.`,
  },
  example: {
    prompt: t`For $\vec F = \langle xz,\ xyz,\ -y^2\rangle$, find $\nabla\cdot\vec F$ and $\nabla\times\vec F$, and evaluate both at $(1, 2, 3)$.`,
    visual: scene([{ at: [1, 2, 3], color: 'gold', label: '(1, 2, 3)' }], [{ from: [1, 2, 3], to: [1 + 3 * 0.25, 2 + 6 * 0.25, 3 - 4 * 0.25], color: 'gold', label: '\\vec F' }, { from: [1, 2, 3], to: [1 - 6 * 0.25, 2 + 1 * 0.25, 3 + 6 * 0.25], color: 'violet', label: '\\nabla\\times\\vec F' }], t`At $(1, 2, 3)$: the field $\vec F = \langle 3, 6, -4\rangle$ (gold) and its curl $\langle -6, 1, 6\rangle$ (violet), both drawn at a quarter scale. A small paddle wheel there would spin fastest with its axle along the violet arrow. Drag to rotate.`, 4),
    steps: [
      { label: 'Name the parts', text: t`$P = xz$, $Q = xyz$, $R = -y^2$.` },
      { label: 'Divergence', text: t`$\nabla\cdot\vec F = \partial_x(xz) + \partial_y(xyz) + \partial_z(-y^2) = z + xz + 0$. At $(1, 2, 3)$: $3 + 3 = 6$ — a source there.` },
      { label: 'Curl, x', text: t`$R_y - Q_z = -2y - xy$.` },
      { label: 'Curl, y', text: t`$P_z - R_x = x - 0 = x$. (This middle component is where sign slips hide: it is $P_z - R_x$, not $R_x - P_z$.)` },
      { label: 'Curl, z', text: t`$Q_x - P_y = yz - 0 = yz$. So $\nabla\times\vec F = \langle -2y - xy,\ x,\ yz\rangle$, which at $(1, 2, 3)$ is $\langle -6,\ 1,\ 6\rangle$.` },
      { label: 'Sense check', text: t`The divergence of any curl is zero: $\partial_x(-2y - xy) + \partial_y(x) + \partial_z(yz) = -y + 0 + y = 0$ ✓.` },
    ],
    answer: t`$\nabla\cdot\vec F = z + xz = 6$ and $\nabla\times\vec F = \langle -2y - xy,\ x,\ yz\rangle = \langle -6, 1, 6\rangle$ at $(1, 2, 3)$.`,
  },
  practice: [
    expr({
      id: 'div', difficulty: 1,
      gen(r) {
        const [a, b, c] = r.pick([[1, 2, 3], [2, 1, 1], [3, 2, 1], [1, 3, 2]]);
        return {
          prompt: t`Find the divergence of $\vec F = \langle ${co(a, 'x^2y')},\ ${co(b, 'yz')},\ ${co(c, 'xz^2')}\rangle$.`,
          visual: {
            type: 'c3-flux',
            params: { F: [`${a}*x^2*y`, `${b}*y*z`, `${c}*x*z^2`], surfaces: [boxSurface([0.6, 1.4], [0.6, 1.4], [0.6, 1.4], 'Box')], readouts: [], range: 1.6, n: 8, arrowLen: 0.22, arrowGrid: [2, 2], normals: false },
            caption: 'A small box in the field. Each face is tinted by where the field leaves (blue) or enters (red); gold arrows show the field, lengths compressed. The divergence is the net outflow per unit volume as such a box shrinks. Drag to rotate.',
          },
          answer: `${2 * a} x y + ${b} z + ${2 * c} x z`, answerTeX: t`${co(2 * a, 'xy')} + ${co(b, 'z')} + ${co(2 * c, 'xz')}`,
          lhs: '\\nabla\\cdot\\vec F', vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2] },
          errors: [{ answer: `${2 * a} x y + ${b} y + ${2 * c} z`, feedback: t`Each component is differentiated with respect to **its own** variable: $P$ by $x$, $Q$ by $y$, $R$ by $z$. Check $\partial_y(${co(b, 'yz')})$ and $\partial_z(${co(c, 'xz^2')})$.` }],
          hints: [t`$\nabla\cdot\vec F = \partial_x P + \partial_y Q + \partial_z R$.`],
          teach: 'Divergence: differentiate each component with respect to its own coordinate and add — a scalar.',
          explain: t`$\partial_x(${co(a, 'x^2y')}) = ${co(2 * a, 'xy')}$, $\partial_y(${co(b, 'yz')}) = ${co(b, 'z')}$, $\partial_z(${co(c, 'xz^2')}) = ${co(2 * c, 'xz')}$: $\nabla\cdot\vec F = ${co(2 * a, 'xy')} + ${co(b, 'z')} + ${co(2 * c, 'xz')}$.`,
        };
      },
    }),
    expr({
      id: 'curl2d', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        return {
          prompt: t`Find the scalar curl $Q_x - P_y$ of the plane field $\vec F = \langle ${co(k, 'x^2y')},\ ${co(k, 'xy^2')}\rangle$.`,
          visual: { type: 'c3-cells', params: { P: `${k}*x^2*y`, Q: `${k}*x*y^2`, region: { kind: 'rect', x: [-1.6, 1.6], y: [-1.2, 1.2] }, x: [-2.5, 2.5], y: [-1.6, 1.6], n: 4, readout: false, probe: null }, caption: 'Small cells tinted by their circulation per unit area (blue anticlockwise, red clockwise): a picture of the scalar curl. Field arrows show direction only.' },
          answer: `${k} (y^2 - x^2)`, answerTeX: t`${k === 1 ? '' : k}${k === 1 ? 'y^2 - x^2' : '(y^2 - x^2)'}`,
          lhs: '(\\nabla\\times\\vec F)_z', vars: { x: [-2, 2], y: [-2, 2] },
          errors: [{ answer: `${k} (x^2 - y^2)`, feedback: t`The order is $Q_x - P_y$: the $x$-derivative of the **second** component minus the $y$-derivative of the first.` }, { answer: `${2 * k} x y + ${2 * k} x y`, feedback: t`That adds $P_x + Q_y$, the divergence. Curl crosses over: $Q_x - P_y$.` }],
          hints: [t`$Q_x = \partial_x(${co(k, 'xy^2')})$ and $P_y = \partial_y(${co(k, 'x^2y')})$.`],
          teach: t`In the plane the curl is the scalar $Q_x - P_y$: the cross-partials, second component’s minus first’s.`,
          explain: t`$Q_x = ${co(k, 'y^2')}$ and $P_y = ${co(k, 'x^2')}$, so $Q_x - P_y = ${k === 1 ? '' : k}${k === 1 ? 'y^2 - x^2' : '(y^2 - x^2)'}$: positive (anticlockwise) near the $y$-axis, negative near the $x$-axis — the blue and red cells.`,
        };
      },
    }),
    num({
      id: 'curl-y', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[1, 2, 3], [3, 1, 2], [2, 3, 1], [1, 3, 2]]);
        const [p, q, s] = r.pick([[1, 2, 3], [2, -1, 1], [-1, 1, 2], [3, 1, -2]]);
        const val = (a - c) * q;
        return {
          prompt: t`For $\vec F = \langle ${co(a, 'yz')},\ ${co(b, 'xz')},\ ${co(c, 'xy')}\rangle$, find the $y$-component of $\nabla\times\vec F$ at the point $(${p}, ${q}, ${s})$.`,
          visual: scene([{ at: [p, q, s], color: 'gold', label: `(${p}, ${q}, ${s})` }], [{ from: [p, q, s], to: [p + 0.15 * a * q * s, q + 0.15 * b * p * s, s + 0.15 * c * p * q].map(r6), color: 'gold', label: '\\vec F' }], t`The point and the field there, drawn at 0.15 scale. Drag to rotate.`, 3.4),
          answer: val, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: -val, feedback: t`Sign slip: the $y$-component is $P_z - R_x$, not $R_x - P_z$ — in the determinant it carries a minus sign, so the order flips.` }, ...((b - a) * s !== val && (b - a) * s !== -val ? [{ value: (b - a) * s, feedback: t`That is the $z$-component, $Q_x - P_y$. The $y$-component is $P_z - R_x$.` }] : [])],
          hints: [t`$(\nabla\times\vec F)_y = \dfrac{\partial P}{\partial z} - \dfrac{\partial R}{\partial x}$.`, t`$P_z = ${co(a, 'y')}$ and $R_x = ${co(c, 'y')}$.`],
          teach: t`The curl’s $y$-component is $P_z - R_x$: the cyclic pattern $x \to y \to z \to x$ keeps every component’s order straight.`,
          explain: t`$P_z - R_x = ${co(a, 'y')} - ${co(c, 'y')} = ${co(a - c, 'y')}$, which at $y = ${q}$ is $${val}$. (The whole curl is $\langle ${co(c - b, 'x')},\ ${co(a - c, 'y')},\ ${co(b - a, 'z')}\rangle$.)`,
        };
      },
    }),
    mcq({
      id: 'paddle', difficulty: 2,
      prompt: t`A river near its bank flows with velocity $\vec v = \langle y,\ 0\rangle$ (m/s, $y$ in m from the bank): every arrow points downstream. A small paddle wheel is held at the point $(0, 1)$. What does it do?`,
      visual: fieldPic('y', '0', { x: [-3.2, 3.2], y: [-0.05, 3.0], n: 15, aspect: '', ...join(paddle(0, 1)), caption: 'The flow (arrow lengths compressed: faster further from the bank, which is the x-axis) and the paddle wheel at (0, 1).' }),
      choices: ['It spins clockwise: the water above it moves faster than the water below', 'It does not spin: every arrow points the same way', 'It spins anticlockwise', t`It spins only if it is moved off the line $y = 1$`],
      answer: 0,
      why: {
        1: t`Straight, parallel arrows can still have curl. What matters is how the speed changes **across** the flow: here $Q_x - P_y = 0 - 1 = -1$.`,
        2: 'The top of the wheel is pushed downstream harder than the bottom, which turns it clockwise. Negative curl means clockwise.',
        3: t`The curl $Q_x - P_y = -1$ is the same everywhere: a wheel anywhere in this flow spins the same way at the same rate.`,
      },
      hints: [t`Compute $Q_x - P_y$ for $\vec v = \langle y, 0\rangle$.`, 'Compare the push on the top of the wheel with the push on its bottom.'],
      teach: 'Curl measures how a small paddle wheel turns: in shear flow the arrows are parallel, but the speed varies across them, so it spins.',
      explain: t`$Q_x - P_y = 0 - 1 = -1 < 0$: clockwise. The water at the top of the wheel moves faster than at the bottom, so the wheel turns. (A fluid element spins at angular velocity $\tfrac12|\nabla\times\vec v|$, here $0.5$ rad/s.)`,
    }),
    mcq({
      id: 'vortex-curl', difficulty: 2,
      prompt: t`Away from the origin, the vortex field $\vec F = \dfrac{\langle -y,\ x\rangle}{x^2 + y^2}$ circles round the origin. What is its curl $Q_x - P_y$ at $(1.5, 0)$?`,
      visual: fieldPic('-y/(x^2 + y^2)', 'x/(x^2 + y^2)', { x: [-3.2, 3.2], y: [-1.55, 1.55], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.25, ...join(paddle(1.5, 0, 0.3)), points: [{ x: 0, y: 0, color: 'bad', r: 4 }], caption: 'The vortex field (lengths compressed) and a paddle wheel at (1.5, 0). At the origin (red) the field is undefined.' }),
      choices: ['0: the wheel is carried round the origin without turning', 'Positive: the arrows curve anticlockwise', t`$2/r^2$, like the whirl field $\langle -y, x\rangle$ scaled down`, 'It cannot be computed: the field is undefined at the origin'],
      answer: 0,
      why: {
        1: t`Curving arrows are not curl. The flow just outside the wheel is **slower** (speed $1/r$) than just inside, and that exactly cancels the turning from the curve.`,
        2: t`Dividing by $r^2$ changes the derivatives: compute $\partial_x\big(x/(x^2 + y^2)\big) - \partial_y\big(-y/(x^2 + y^2)\big)$ — it is $0$.`,
        3: 'Only the origin is excluded; at (1.5, 0) the field is perfectly smooth.',
      },
      hints: [t`$Q_x = \partial_x\dfrac{x}{x^2 + y^2} = \dfrac{y^2 - x^2}{(x^2 + y^2)^2}$. Compute $P_y$ the same way.`, t`$P_y = \partial_y\dfrac{-y}{x^2 + y^2} = \dfrac{y^2 - x^2}{(x^2 + y^2)^2}$ too.`],
      teach: 'Curved flow lines do not imply curl: the vortex’s speed falls as 1/r exactly fast enough to cancel the turning.',
      explain: t`$Q_x - P_y = \dfrac{y^2 - x^2}{r^4} - \dfrac{y^2 - x^2}{r^4} = 0$ everywhere except the origin. All the vortex’s circulation, $2\pi$, is concentrated at that one point — which is why Green’s theorem failed on a disk round it.`,
    }),
    mcq({
      id: 'identity', difficulty: 3,
      prompt: t`Which of these is zero for **every** smooth function $f$ and smooth vector field $\vec F$?`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 10.5], y: [-1.2, 1.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          points: [{ x: 0.6, y: 0, color: 'accent', r: 7, label: 'scalar', labelDx: -22, labelDy: 22 }, { x: 3.6, y: 0, color: 'gold', r: 7, label: 'vector field', labelDx: -36, labelDy: 22 }, { x: 6.6, y: 0, color: 'gold', r: 7, label: 'vector field', labelDx: -36, labelDy: 22 }, { x: 9.6, y: 0, color: 'accent', r: 7, label: 'scalar', labelDx: -22, labelDy: 22 }],
          arrows: [{ from: [0.95, 0], to: [3.25, 0], color: 'ink', label: 'grad ∇', labelDx: -64, labelDy: -14 }, { from: [3.95, 0], to: [6.25, 0], color: 'ink', label: 'curl ∇×', labelDx: -64, labelDy: -14 }, { from: [6.95, 0], to: [9.25, 0], color: 'ink', label: 'div ∇·', labelDx: -60, labelDy: -14 }],
        },
        caption: 'The three derivatives of vector calculus, and the kind of object each takes in and gives out.',
      },
      choices: [t`$\nabla\cdot(\nabla\times\vec F)$`, t`$\nabla\cdot(\nabla f)$`, t`$\nabla\times\vec F$`, t`$\nabla\times(\nabla\cdot\vec F)$`],
      answer: 0,
      why: {
        1: t`$\nabla\cdot\nabla f = f_{xx} + f_{yy} + f_{zz}$, the **Laplacian** $\nabla^2 f$. It vanishes only for special (harmonic) $f$ — for $f = x^2$ it is $2$.`,
        2: t`Only conservative fields have zero curl; the whirl $\langle -y, x, 0\rangle$ has curl $\langle 0, 0, 2\rangle$.`,
        3: t`$\nabla\cdot\vec F$ is a scalar, and curl acts on vector fields: this expression means nothing. Follow the arrows in the picture.`,
      },
      hints: ['Check which expressions even make sense: what kind of object does each operator take in?', t`Two steps along the chain in a row: $\nabla\times(\nabla f) = \vec 0$ and $\nabla\cdot(\nabla\times\vec F) = 0$, because mixed partial derivatives are equal.`],
      teach: 'Two steps of grad → curl → div in a row always give zero: curl ∇f = 0 and div(curl F) = 0.',
      explain: t`$\nabla\cdot(\nabla\times\vec F) = \partial_x(R_y - Q_z) + \partial_y(P_z - R_x) + \partial_z(Q_x - P_y) = 0$, because the mixed partials cancel in pairs ($R_{yx} = R_{xy}$ and so on). Its twin is $\nabla\times\nabla f = \vec 0$. The last lesson of this module shows both are one fact.`,
    }),
    mcq({
      id: 'error-spread', difficulty: 2, kind: 'error',
      prompt: t`The electric field round a long, thin charged wire, seen end-on, is $\vec E = k\,\dfrac{\langle x,\ y\rangle}{x^2 + y^2}$ (with $k > 0$). A student says: “The field lines spread apart as you go out, so $\nabla\cdot\vec E > 0$ everywhere.” What is wrong?`,
      visual: fieldPic('x/(x^2 + y^2)', 'y/(x^2 + y^2)', { x: [-3.2, 3.2], y: [-1.55, 1.55], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.25, points: [{ x: 0, y: 0, color: 'warn', r: 5, label: 'wire', labelDx: 8, labelDy: 10 }], caption: 'The field of the wire (lengths compressed; colour shows strength).' }),
      choices: [
        'Spreading is offset by weakening: the field falls as 1/r just fast enough that the divergence is 0 everywhere except at the wire',
        'Nothing: spreading field lines always mean positive divergence',
        'The divergence is negative, because the field gets weaker going outward',
        'Divergence is defined only for fields in three dimensions',
      ],
      answer: 0,
      why: {
        1: t`Compute it: $\partial_x\dfrac{x}{x^2 + y^2} + \partial_y\dfrac{y}{x^2 + y^2} = \dfrac{y^2 - x^2}{r^4} + \dfrac{x^2 - y^2}{r^4} = 0$.`,
        2: 'Weakening alone does not make it negative: the outflow through a small loop’s far side is weaker, but that side is longer, and the two exactly balance.',
        3: t`In the plane it is $P_x + Q_y$, the same idea one dimension down.`,
      },
      hints: [t`Compute $P_x + Q_y$ for $\langle x, y\rangle/(x^2 + y^2)$.`],
      teach: 'Field lines spreading apart do not by themselves mean positive divergence; you must also account for how the strength changes.',
      explain: t`Away from the wire $\nabla\cdot\vec E = 0$: there is no charge there. All the divergence is at the wire itself, where the charge is — Gauss’s law, $\nabla\cdot\vec E = \rho/\varepsilon_0$, in action.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-div', difficulty: 2,
      gen(r) {
        const [p, q, s] = r.pick([[1, 2, 3], [2, -1, 1], [-1, 2, 2], [3, 1, -1]]);
        const val = 2 * p * q + 2 * q * s + 2 * s * p;
        return {
          prompt: t`Find the divergence of $\vec F = \langle x^2y,\ y^2z,\ z^2x\rangle$ at the point $(${p}, ${q}, ${s})$.`,
          visual: scene([{ at: [p, q, s], color: 'gold', label: `(${p}, ${q}, ${s})` }], [{ from: [p, q, s], to: [p + 0.12 * p * p * q, q + 0.12 * q * q * s, s + 0.12 * s * s * p].map(r6), color: 'gold', label: '\\vec F' }], t`The point and the field there, drawn at 0.12 scale. Drag to rotate.`, 3.4),
          answer: val, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: p * p + q * q + s * s, feedback: t`Differentiate each component by its own variable: $\partial_x(x^2y) = 2xy$, not $x^2$.` }],
          hints: [t`$\nabla\cdot\vec F = 2xy + 2yz + 2zx$.`],
          teach: 'Divergence is the sum ∂P/∂x + ∂Q/∂y + ∂R/∂z.',
          explain: t`$\nabla\cdot\vec F = 2xy + 2yz + 2zx = 2(${p * q}) + 2(${q * s}) + 2(${s * p}) = ${val}$${val > 0 ? ': a source there.' : val < 0 ? ': a sink there.' : '.'}`,
        };
      },
    }),
    num({
      id: 'cp-poisson', difficulty: 3, transfer: true,
      gen(r) {
        const G = 6.674e-11;
        const [name, rho] = r.pick([['Earth', 5514], ['the Moon', 3344], ['Mars', 3934]]);
        const val = 4 * PI * G * rho;
        return {
          prompt: t`Inside a ball of uniform density $\rho$, Newtonian gravity has potential $\Phi = \tfrac{2\pi}{3}G\rho\,(x^2 + y^2 + z^2) + C$, and the gravitational field is $\vec g = -\nabla\Phi$. Treating ${name} as uniform, with its mean density $\rho = ${rho}$ kg/m³, compute the Laplacian $\nabla^2\Phi = \nabla\cdot\nabla\Phi = \Phi_{xx} + \Phi_{yy} + \Phi_{zz}$. ($G = 6.674\times10^{-11}$ N·m²/kg².)`,
          visual: {
            type: 'c3-flux',
            params: { F: ['-x*step(1 - x^2 - y^2 - z^2)', '-y*step(1 - x^2 - y^2 - z^2)', '-z*step(1 - x^2 - y^2 - z^2)'], surfaces: [{ label: 'Planet', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }], integrand: 'none', arrowsOn: 'grid', grid: 5, range: 1.3, normals: false, readouts: [], alpha: 0.25, arrowLen: 0.35, arrowColor: 'accent' },
            caption: t`Inside a uniform planet (the translucent ball), $\vec g = -\nabla\Phi$ points to the centre and grows in proportion to the distance from it. Arrows to scale with one another. Drag to rotate.`,
          },
          answer: val, units: 's^-2', tol: { rel: 0.01 },
          errors: [{ value: val / 3, feedback: t`That is only $\Phi_{xx}$. The Laplacian adds three such terms, one per direction.` }, { value: 2 * PI * G * rho / 3, feedback: t`Differentiate twice: $\partial_x^2\big(\tfrac{2\pi}{3}G\rho\,x^2\big) = \tfrac{4\pi}{3}G\rho$.` }],
          hints: [t`$\Phi_{xx} = \tfrac{2\pi}{3}G\rho\cdot 2 = \tfrac{4\pi}{3}G\rho$, and the same for $y$ and $z$.`, t`$\nabla^2\Phi = 3\cdot\tfrac{4\pi}{3}G\rho = 4\pi G\rho$.`],
          teach: 'Inside matter, Newtonian gravity obeys Poisson’s equation ∇²Φ = 4πGρ — the divergence of g counts the mass, as divergence of E counts charge.',
          explain: t`$\nabla^2\Phi = 4\pi G\rho = 4\pi(6.674\times10^{-11})(${rho}) \approx ${nice(+(val * 1e6).toPrecision(3))}\times10^{-6}\ \text{s}^{-2}$. This is **Poisson’s equation** $\nabla^2\Phi = 4\pi G\rho$, equivalently $\nabla\cdot\vec g = -4\pi G\rho$ — Gauss’s law for gravity, point by point. General relativity had to reproduce exactly this equation for weak fields, and it fixes the $8\pi G/c^4$ in Einstein’s equations.`,
        };
      },
    }),
    mcq({
      id: 'cp-read', difficulty: 2,
      prompt: t`At the marked point $P$, is the divergence of the field drawn here positive, negative or zero?`,
      visual: fieldPic('x', '0', { x: [-0.2, 4.2], y: [-1.05, 1.05], n: 9, toScale: 0.1, points: [{ x: 2, y: 0.4, color: 'gold', r: 5, label: 'P', labelDx: 8, labelDy: -10 }], caption: 'A plane field drawn with arrows to scale: every arrow is horizontal, and they lengthen toward the right.' }),
      choices: ['Positive: each arrow is longer than the one before it, so more leaves a small box than enters', 'Zero: the arrows are parallel, so nothing spreads out', 'Negative: the arrows are crowded together', 'It depends on the size of the box you imagine'],
      answer: 0,
      why: {
        1: 'Parallel arrows can still diverge: what matters is that the flow speeds up along its direction, so a small box loses more through its right side than it gains through its left.',
        2: 'Crowding of drawn arrows is a choice of grid, not a property of the field.',
        3: 'Divergence is a limit as the box shrinks: it is a property of the point, not of the box.',
      },
      hints: ['Imagine a small box around P. Compare the flow in through its left side with the flow out through its right side.', t`For $\vec F = \langle P, 0\rangle$, the divergence is $\partial P/\partial x$: does $P$ grow to the right?`],
      teach: 'Divergence measures net outflow: parallel arrows that lengthen along their own direction give positive divergence.',
      explain: t`The field is $\langle x, 0\rangle$ (the picture’s arrows lengthen in proportion to $x$), so $\nabla\cdot\vec F = \partial_x x = 1 > 0$. Flow speeding up along its direction — gas accelerating down a rocket nozzle, for instance, where its density must fall — has positive divergence.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.5 Divergence and curl', url: 'https://openstax.org/books/calculus-volume-3/pages/6-5-divergence-and-curl' },
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
  ],
});
