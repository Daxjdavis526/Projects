// Conservative fields: the fundamental theorem for line integrals, path
// independence and zero circulation, finding a potential, the mixed-partials
// test — and the hole in it: the vortex field, curl-free yet circulating 2π
// round the origin. Conservation of energy is the physics of it.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { fieldPic, path, paths, r6 } from './_fields.js';
import * as M from '../../src/viz/model/c3-vector.js';

const t = String.raw;
const PI = Math.PI;

/** A small picture on c3-lineint: field and path(s), no bead, no numbers. */
const linePic = (P, Q, ps, { x = [-3, 3], y = [-1.9, 1.9], caption, ...rest } = {}) => ({
  type: 'c3-lineint',
  params: { P, Q, x, y, paths: ps, bead: false, readout: false, compare: ps.length > 1, ...rest },
  caption,
});
const loop = (cx, cy, a, b) => path(`${cx} + ${a}*cos(t)`, `${cy} + ${b}*sin(t)`, [0, 2 * PI], { color: 'ink', width: 2, at: [0.12, 0.62], dash: true });

// the mixed-partials test, on fields where the wrong pair of partials gives the wrong verdict
const TEST = [
  { P: '2*x + 3*y', Q: '3*x - y', tex: t`\langle 2x + 3y,\ 3x - y\rangle`, Py: '3', Qx: '3', cons: true },
  { P: 'x - y', Q: 'x + y', tex: t`\langle x - y,\ x + y\rangle`, Py: '-1', Qx: '1', cons: false },
  { P: 'y*exp(x*y)', Q: 'x*exp(x*y)', tex: t`\langle y\,e^{xy},\ x\,e^{xy}\rangle`, Py: t`e^{xy} + xy\,e^{xy}`, Qx: t`e^{xy} + xy\,e^{xy}`, cons: true },
  { P: 'x + 2*y', Q: 'y', tex: t`\langle x + 2y,\ y\rangle`, Py: '2', Qx: '0', cons: false },
];

export default lesson({
  id: 'math2210.C3-5.3',
  title: 'Conservative fields and potentials',
  minutes: 12, difficulty: 3,
  intro: t`Some fields are gradients: $\vec F = \nabla f$ for a scalar function $f$, its **potential**. For them a line integral needs no parametrization at all — only the values of $f$ at the two ends:

$$\int_C \nabla f\cdot d\vec r = f\big(\vec r(b)\big) - f\big(\vec r(a)\big)$$

So every path between the same two points gives the same value, and every **closed** loop gives zero. Such fields are called **conservative**: for a force $\vec F = -\nabla U$ this is conservation of energy, the work done is the drop in potential energy $U$ whatever the route. On a region **without holes**, a plane field $\langle P, Q\rangle$ is conservative exactly when $\partial P/\partial y = \partial Q/\partial x$.`,
  symbols: [
    { tex: 'f', text: 'a **potential** of the field: a scalar function whose gradient is $\\vec F$. Any constant can be added to it' },
    { tex: '\\nabla f', text: 'its gradient, $\\langle f_x,\\ f_y\\rangle$ (with $f_z$ in space): the conservative field itself' },
    { tex: 'C', text: 'any smooth (or piecewise smooth) curve, parametrized by $\\vec r(t)$ for $a \\le t \\le b$' },
    { tex: '\\vec r(a),\\ \\vec r(b)', text: 'the start and the end of $C$ — the only things the answer depends on' },
    { tex: 'U = -f', text: 'potential energy, in physics’ sign convention: a force $\\vec F = -\\nabla U$ points downhill in $U$' },
  ],
  why: t`Potential energy, gravitational potential and electric potential (voltage) exist precisely because those forces are conservative; the test $\partial P/\partial y = \partial Q/\partial x$ returns in exact differential equations.`,
  visual: {
    type: 'c3-lineint',
    title: 'Three paths, one answer — or not',
    lead: t`Three paths run from the same start to the same end. The readout gives the line integral along each. Pick a field and compare them; the bead rides the path you choose.`,
    tasks: [
      t`The gradient field $\nabla(xy)$: all three paths give $2.88$, which is $xy$ at the end minus $xy$ at the start.`,
      'Rotation: three paths, three different answers — no potential can exist for this field.',
      t`Vortex: “under” and “wiggle” agree, but “over” differs from them by exactly $2\pi = 6.283$. The origin, where the field blows up, lies between them.`,
    ],
    params: {
      P: pickExpr('k', ['y', '-y', '-y/(x^2 + y^2)']), Q: pickExpr('k', ['x', 'x', 'x/(x^2 + y^2)']),
      x: [-3, 3], y: [-2.1, 1.9],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Gradient ∇(xy) = ⟨y, x⟩'], [1, 'Rotation ⟨−y, x⟩'], [2, 'Vortex ⟨−y, x⟩/r²']], value: 0, explain: t`The vortex is the rotation divided by $r^2 = x^2 + y^2$: it circles the origin with speed $1/r$.` }],
      paths: [
        { x: '1.8*cos(t)', y: '-0.8 + 2.4*sin(t)', t: [0, 'pi'], label: 'over', color: 'gold', labelAt: 0.3, labelDx: 8, labelDy: -8 },
        { x: '1.8*cos(t)', y: '-0.8 - 0.9*sin(t)', t: [0, 'pi'], label: 'under', color: 'violet', labelAt: 0.5, labelDx: 6, labelDy: 14 },
        { x: '1.8 - 3.6*t', y: '-0.8 + 0.45*sin(3*pi*t)', t: [0, 1], label: 'wiggle', color: 'teal', labelAt: 0.22, labelDx: 6, labelDy: -12 },
      ],
      compare: true, at: 0.4,
      points: [{ x: 0, y: 0, color: 'ink', label: 'origin', labelDx: 8, labelDy: 10 }],
    },
    caption: t`Field arrows show direction, lengths compressed; colour gives strength. Each path’s integral is computed numerically.`,
  },
  example: {
    prompt: t`Show that $\vec F = \langle 2xy + z,\ x^2,\ x\rangle$ is conservative, find a potential, and evaluate $\int_C \vec F\cdot d\vec r$ along any curve from $O(0, 0, 0)$ to $B(1, 2, 3)$.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 3.2,
        points: [{ at: [0, 0, 0], color: 'ink', label: 'O' }, { at: [1, 2, 3], color: 'gold', label: 'B' }],
        curves: [{ param: ['t', '2*t', '3*t'], t: [0, 1], color: 'gold' }, { param: ['t + 0.6*sin(pi*t)', '2*t - 0.9*sin(pi*t)', '3*t^2'], t: [0, 1], color: 'violet' }],
      },
      caption: t`Two of the infinitely many curves from $O$ to $B$. For this field every one of them gives the same line integral. Drag to rotate.`,
    },
    steps: [
      { label: 'Test', text: t`Compare mixed partials pairwise: $\partial P/\partial y = 2x = \partial Q/\partial x$; $\partial P/\partial z = 1 = \partial R/\partial x$; $\partial Q/\partial z = 0 = \partial R/\partial y$. All three agree (that is $\nabla\times\vec F = \vec 0$), and the field is defined on all of space, which has no holes: $\vec F$ is conservative.` },
      { label: 'Integrate P', text: t`We need $f_x = 2xy + z$, so $f = x^2y + xz + g(y, z)$ — the “constant” of an $x$-integration may depend on $y$ and $z$.` },
      { label: 'Match Q and R', text: t`$f_y = x^2 + g_y$ must equal $Q = x^2$, so $g_y = 0$. $f_z = x + g_z$ must equal $R = x$, so $g_z = 0$. Hence $g$ is a constant: $f = x^2y + xz$.` },
      { label: 'Evaluate', text: t`$\int_C \vec F\cdot d\vec r = f(1, 2, 3) - f(0, 0, 0) = (2 + 3) - 0 = 5$, along every curve from $O$ to $B$.` },
      { label: 'Check', text: t`Along the straight line $\vec r = \langle t, 2t, 3t\rangle$: $\vec F\cdot\vec r\,' = (4t^2 + 3t) + 2t^2 + 3t = 6t^2 + 6t$, and $\int_0^1 (6t^2 + 6t)\,dt = 2 + 3 = 5$ ✓.` },
    ],
    answer: t`$f = x^2y + xz$ (plus any constant), and the integral is $5$ along every path.`,
  },
  practice: [
    mcq({
      id: 'test', difficulty: 2,
      gen(r) {
        const k = r.int(0, 3), F = TEST[k];
        const ans = F.cons ? 0 : 1;
        const why = {
          0: t`Here $\partial P/\partial y = ${F.Py}$ but $\partial Q/\partial x = ${F.Qx}$: they differ, so the field has circulation somewhere and is not conservative.`,
          1: t`Compute them: $\partial P/\partial y = ${F.Py}$ and $\partial Q/\partial x = ${F.Qx}$ agree everywhere, and the plane has no holes.`,
          2: t`That compares the wrong pair. The test pairs each component with the **other** variable: $\partial P/\partial y$ with $\partial Q/\partial x$ (the two mixed partials of $f$, which must agree).`,
          3: t`Curved arrows prove nothing: a gradient field can bend, and a field with straight arrows can still circulate. Use the test.`,
        };
        delete why[ans];
        return {
          prompt: t`Is $\vec F = ${F.tex}$ conservative on the whole plane?`,
          visual: fieldPic(F.P, F.Q, { x: [-2.4, 2.4], y: [-1.15, 1.15], n: 15, ...paths(loop(0.4, 0, 1.2, 0.75)), caption: 'The field (lengths compressed) with a dashed test loop. A conservative field has zero circulation round every loop.' }),
          choices: [
            t`Yes: $\dfrac{\partial P}{\partial y} = \dfrac{\partial Q}{\partial x}$ everywhere`,
            t`No: $\dfrac{\partial P}{\partial y} \ne \dfrac{\partial Q}{\partial x}$`,
            F.cons ? t`No: $\dfrac{\partial P}{\partial x} \ne \dfrac{\partial Q}{\partial y}$` : t`Yes: $\dfrac{\partial P}{\partial x} = \dfrac{\partial Q}{\partial y}$`,
            F.cons ? 'No: its arrows bend, so it must circulate' : 'Yes: none of its arrows bend back on themselves',
          ],
          fixedOrder: true, answer: ans, why,
          hints: [t`If $\vec F = \nabla f$ then $P = f_x$ and $Q = f_y$, so $\partial P/\partial y = f_{xy}$ and $\partial Q/\partial x = f_{yx}$, which must be equal.`, t`Compute $\partial P/\partial y$ and $\partial Q/\partial x$ for this field.`],
          teach: 'On a region with no holes, ⟨P, Q⟩ is conservative exactly when ∂P/∂y = ∂Q/∂x.',
          explain: F.cons ? t`$\partial P/\partial y = ${F.Py} = \partial Q/\partial x$ everywhere, and the plane has no holes, so a potential exists.` : t`$\partial P/\partial y = ${F.Py}$ while $\partial Q/\partial x = ${F.Qx}$. Since they differ, no potential can exist: its mixed partials would have to agree.`,
        };
      },
    }),
    expr({
      id: 'find-potential', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), b = r.pick([2, 4, 6]);
        return {
          prompt: t`Find the potential $f$ of $\vec F = \langle 2xy + ${a},\ x^2 + ${b}y\rangle$ — the function with $\nabla f = \vec F$ — that has $f(0, 0) = 0$.`,
          visual: fieldPic(`2*x*y + ${a}`, `x^2 + ${b}*y`, { x: [-2.4, 2.4], y: [-1.15, 1.15], n: 15, caption: 'The field, lengths compressed: a gradient field, crossing the level curves of its potential at right angles.' }),
          answer: `x^2 y + ${a} x + ${b / 2} y^2`, answerTeX: t`x^2y + ${a === 1 ? '' : a}x + ${b / 2 === 1 ? '' : b / 2}y^2`,
          lhs: 'f(x, y)', vars: { x: [-2, 2], y: [-2, 2] },
          errors: [
            { answer: `x^2 y + ${a} x`, feedback: t`Check $f_y$: it gives only $x^2$. The part of $Q$ without an $x$, $${b}y$, still has to come from a function of $y$ alone: add $${b / 2 === 1 ? '' : b / 2}y^2$.` },
            { answer: `2x^2 y + ${a} x + ${b / 2} y^2`, feedback: t`The $x^2y$ term comes from both $P$ and $Q$, but it is one term of $f$: count it once.` },
          ],
          hints: [t`Integrate $P$ with respect to $x$: $f = x^2y + ${a}x + g(y)$.`, t`Differentiate that in $y$ and match it to $Q = x^2 + ${b}y$: $g'(y) = ${b}y$.`],
          teach: 'Integrate P in x, then fix the leftover function of y by matching ∂f/∂y to Q; a potential is unique up to a constant.',
          explain: t`$f = x^2y + ${a}x + g(y)$ and $f_y = x^2 + g'(y) = x^2 + ${b}y$ gives $g = ${b / 2 === 1 ? '' : b / 2}y^2$: $f = x^2y + ${a === 1 ? '' : a}x + ${b / 2 === 1 ? '' : b / 2}y^2$. Check: $f_x = 2xy + ${a}$ ✓.`,
        };
      },
    }),
    num({
      id: 'endpoints', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 4], [2, 3]]);
        const X = `${a} + ${b - a}*t + 0.5*sin(2*pi*t)`, Y = '(pi/3)*t + 0.35*sin(3*pi*t)';
        const val = (b * b) / 2 - a * a;
        // the endpoint rule, checked against a direct numerical integration along the curve
        const W = M.work((x, y) => [2 * x * Math.cos(y), -x * x * Math.sin(y)], { X: (s) => a + (b - a) * s + 0.5 * Math.sin(2 * PI * s), Y: (s) => (PI / 3) * s + 0.35 * Math.sin(3 * PI * s) }, 0, 1, 200);
        return {
          prompt: t`Evaluate $\displaystyle\int_C \vec F\cdot d\vec r$ for $\vec F = \langle 2x\cos y,\ -x^2\sin y\rangle$, where $C$ is the wiggly curve $\vec r(t) = \big\langle ${a} + ${b - a === 1 ? '' : b - a}t + \tfrac12\sin 2\pi t,\ \ \tfrac{\pi}{3}t + 0.35\sin 3\pi t\big\rangle$, $0 \le t \le 1$.`,
          visual: linePic('2*x*cos(y)', '-x^2*sin(y)', [{ x: X, y: Y, t: [0, 1], color: 'gold' }], { x: [-0.6, 5], y: [-0.55, 1.55], potential: 'x^2*cos(y)', points: [{ x: a, y: 0, label: 'start', labelDx: -8, labelDy: 12, labelAlign: 'right' }, { x: b, y: r6(PI / 3), label: 'end', labelDx: 8, labelDy: -8 }], caption: 'The field, the curve C, and (violet) level curves of a function whose gradient the field might be.' }),
          answer: val, tol: { rel: 1e-3, abs: 1e-6 },
          errors: [{ value: a * a - (b * b) / 2, feedback: 'That is the start minus the end. The theorem is f(end) − f(start).' }],
          hints: [t`Do not parametrize. Is $\vec F$ a gradient? Try $f = x^2\cos y$.`, t`$\nabla(x^2\cos y) = \langle 2x\cos y,\ -x^2\sin y\rangle$ ✓. Now find where $C$ starts ($t = 0$) and ends ($t = 1$).`],
          teach: 'For a gradient field, a line integral is the potential at the end minus the potential at the start, however the path wiggles.',
          explain: t`$C$ runs from $(${a}, 0)$ to $(${b}, \tfrac\pi3)$, and $\vec F = \nabla(x^2\cos y)$, so the integral is $${b}^2\cos\tfrac\pi3 - ${a}^2\cos 0 = ${nice(b * b / 2)} - ${a * a} = ${nice(val)}$. (Integrating along the wiggles numerically gives $${nice(+W.toPrecision(6))}$.)`,
        };
      },
    }),
    mcq({
      id: 'closed', difficulty: 1,
      prompt: t`$\vec F = \nabla f$, where $f$ has continuous partial derivatives everywhere. What is $\oint_C \vec F\cdot d\vec r$ round the closed curve $C$ drawn?`,
      visual: linePic('y*cos(x*y) + 0.4', 'x*cos(x*y)', [{ x: '0.3 + 1.6*cos(t) + 0.3*cos(3*t)', y: '1.1*sin(t)', t: [0, 2 * PI], color: 'gold' }], { potential: 'sin(x*y) + 0.4*x', caption: 'A gradient field, level curves of its potential (violet), and a closed curve C.' }),
      choices: ['0', 'The area enclosed by C', t`$2\pi$`, 'It depends on the shape of C'],
      answer: 0,
      why: {
        1: t`Areas come from fields that circulate, through Green’s theorem (next lesson). A gradient field does not circulate.`,
        2: t`$2\pi$ belongs to the vortex field round the origin — and the vortex is not the gradient of any $f$ that is smooth on a loop around the origin.`,
        3: t`For a gradient field only the end points matter, and a closed curve ends where it starts.`,
      },
      hints: [t`Use $\int_C \nabla f\cdot d\vec r = f(\text{end}) - f(\text{start})$.`],
      teach: 'Round a closed loop, a gradient field’s line integral is f(start) − f(start) = 0.',
      explain: t`The loop ends where it starts, so $\oint_C\nabla f\cdot d\vec r = f(P) - f(P) = 0$: the field’s uphill and downhill stretches cancel exactly.`,
    }),
    num({
      id: 'spring', difficulty: 2,
      gen(r) {
        const k = r.pick([6, 8, 10]);
        const [[xa, ya], [xb, yb]] = r.pick([[[0.5, 0.4], [0.1, -0.2]], [[-0.6, 0.3], [-0.1, 0.1]], [[0.4, -0.35], [0.2, 0.15]]]);
        const U = (x, y) => 0.5 * k * (x * x + y * y), W = U(xa, ya) - U(xb, yb);
        const rail = { x: `${xa} + ${r6(xb - xa)}*t + 0.18*sin(pi*t)`, y: `${ya} + ${r6(yb - ya)}*t + 0.1*sin(2*pi*t)` };
        return {
          prompt: t`A puck on an air table is tied to a spring anchored at the origin. The spring force is conservative, $\vec F = -\nabla U$, with potential energy $U = \tfrac12 k(x^2 + y^2)$ and $k = ${k}$ N/m (positions in m). The puck slides without friction along a curved rail from $A(${xa},\ ${ya})$ to $B(${xb},\ ${yb})$. How much work does the spring force do on it?`,
          visual: {
            type: 'c3-contour',
            params: {
              f: `${0.5 * k}*(x^2 + y^2)`, x: [-0.85, 0.85], y: [-0.5, 0.5], levels: 7, labels: false, aspect: 'wide', xlabel: 'x (m)', ylabel: 'y (m)',
              curves: [{ param: [rail.x, rail.y], t: [0, 1], color: 'gold', width: 3 }],
              points: [{ x: xa, y: ya, color: 'gold', label: 'A' }, { x: xb, y: yb, color: 'gold', label: 'B' }, { x: 0, y: 0, color: 'ink', label: 'anchor' }],
            },
            caption: 'Equipotentials of the spring’s potential energy (circles, shaded by height) and the rail from A to B.',
          },
          answer: W, units: 'J', tol: { rel: 2e-3 },
          errors: [{ value: -W, feedback: t`That is $U(B) - U(A)$, the **rise** in potential energy. The force does work equal to the **drop**: $W = U(A) - U(B)$.` }],
          hints: ['The rail’s shape does not matter for a conservative force: only the end points do.', t`$W = -\Delta U = U(A) - U(B)$.`],
          teach: 'A conservative force’s work is the drop in potential energy, W = U(start) − U(end), whatever the path.',
          explain: t`$U(A) = ${nice(0.5 * k)}(${nice(xa * xa + ya * ya)}) = ${nice(U(xa, ya))}$ J and $U(B) = ${nice(0.5 * k)}(${nice(xb * xb + yb * yb)}) = ${nice(U(xb, yb))}$ J, so $W = ${nice(+W.toPrecision(4))}$ J. Starting from rest, a 0.5 kg puck would arrive at $B$ with $v = \sqrt{2W/m} = ${nice(+Math.sqrt((2 * W) / 0.5).toPrecision(3))}$ m/s — Physics I’s energy conservation, now along any curved rail.`,
        };
      },
    }),
    mcq({
      id: 'vortex', difficulty: 3,
      prompt: t`The vortex field $\vec F = \left\langle \dfrac{-y}{x^2 + y^2},\ \dfrac{x}{x^2 + y^2}\right\rangle$ has $\dfrac{\partial P}{\partial y} = \dfrac{\partial Q}{\partial x} = \dfrac{y^2 - x^2}{(x^2 + y^2)^2}$ at every point except the origin, where it is undefined. Yet round the unit circle $\oint\vec F\cdot d\vec r = 2\pi$. How can both be true?`,
      visual: { type: 'field2d', params: { P: '-y/(x^2 + y^2)', Q: 'x/(x^2 + y^2)', x: [-2, 2], y: [-2, 2], loop: { r: 1 }, probe: [1.4, 0.6], density: 13 }, caption: t`The vortex field and the unit circle. The readout compares the circulation round the circle with the integral of $Q_x - P_y$ over the disk inside it, both computed numerically.` },
      choices: [
        'The test needs a region with no holes. The field’s domain, the plane minus the origin, has a hole — and the circle goes round it',
        'The circulation must really be 0: equal mixed partials always guarantee that',
        t`The partials are not really equal: $\partial P/\partial y$ has the opposite sign to $\partial Q/\partial x$`,
        'Line integrals round circles are never zero, whatever the field',
      ],
      answer: 0,
      why: {
        1: t`Parametrize it: on $x = \cos t$, $y = \sin t$, $\vec F\cdot\vec r\,' = \sin^2 t + \cos^2 t = 1$, so the circulation is $\int_0^{2\pi}1\,dt = 2\pi$, not $0$.`,
        2: t`Compute them: $P = -y/r^2$ gives $P_y = (y^2 - x^2)/r^4$, and $Q = x/r^2$ gives $Q_x = (y^2 - x^2)/r^4$. Equal.`,
        3: t`A gradient field circulates zero round every circle, so this cannot be a general rule.`,
      },
      hints: [t`The test $P_y = Q_x$ comes with a condition on the region. What is special about the origin?`, t`Locally $\vec F = \nabla\theta$, the gradient of the polar angle — but $\theta$ grows by $2\pi$ every time you go round the origin, so it is not a single-valued function on any loop that encircles it.`],
      teach: 'Equal mixed partials prove a field conservative only on a simply connected region — one with no holes.',
      explain: t`On any region that does not surround the origin, $\vec F = \nabla\theta$ and all is well. But round the origin $\theta$ cannot be made single-valued — it gains $2\pi$ per turn — so there is no potential there and the circulation is $2\pi$. The readout shows it: the circulation is $2\pi$ while the integral of $Q_x - P_y$ over the disk is $0$, because all the circulation is concentrated at the origin, where the field is not even defined.`,
    }),
    mcq({
      id: 'error-double', difficulty: 2, kind: 'error',
      prompt: t`To find a potential for $\vec F = \langle 2x + y,\ x + 3y^2\rangle$, a student integrates $P$ in $x$ to get $x^2 + xy$, integrates $Q$ in $y$ to get $xy + y^3$, and adds the two: $f = x^2 + 2xy + y^3$. What is wrong?`,
      visual: fieldPic('2*x + y', 'x + 3*y^2', { x: [-2.4, 2.4], y: [-1.15, 1.15], n: 15, caption: 'The field, lengths compressed.' }),
      choices: [
        t`The $xy$ term appears in both pieces but belongs in $f$ once: $f = x^2 + xy + y^3$`,
        t`$Q$ should have been integrated with respect to $x$, not $y$`,
        t`The field is not conservative, so no potential exists`,
        t`Nothing is wrong: $\nabla(x^2 + 2xy + y^3) = \vec F$`,
      ],
      answer: 0,
      why: {
        1: t`Integrating $Q = f_y$ with respect to $y$ is right; the slip is in how the two results were combined.`,
        2: t`$\partial P/\partial y = 1 = \partial Q/\partial x$ on the whole plane: it is conservative.`,
        3: t`Check: $\partial_x(x^2 + 2xy + y^3) = 2x + 2y$, not $2x + y$.`,
      },
      hints: [t`Differentiate the student’s $f$ with respect to $x$. Does it give $P$?`, t`Each integration recovers all of $f$ except a function of the other variable: combine them by taking every **different** term once.`],
      teach: 'The two partial integrations each recover f up to a function of the other variable; merge them, do not add them.',
      explain: t`Integrating $P$ gives $f = x^2 + xy + g(y)$; integrating $Q$ gives $f = xy + y^3 + h(x)$. Both hold when $g = y^3$, $h = x^2$: $f = x^2 + xy + y^3$. Adding them counts the shared $xy$ twice.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-potential', difficulty: 2,
      gen(r) {
        const c = r.int(1, 3);
        return {
          prompt: t`Find the potential $f$ of $\vec F = \langle y\,e^{xy} + ${c === 1 ? '' : c}x^2,\ \ x\,e^{xy}\rangle$ that has $f(0, 0) = 1$.`,
          visual: fieldPic(`y*exp(x*y) + ${c}*x^2`, 'x*exp(x*y)', { x: [-2, 2], y: [-0.95, 0.95], n: 15, caption: 'The field, lengths compressed.' }),
          answer: `exp(x y) + ${c} x^3/3`, answerTeX: t`e^{xy} + \tfrac{${c}}{3}x^3`,
          lhs: 'f(x, y)', vars: { x: [-1.5, 1.5], y: [-1.5, 1.5] },
          errors: [{ answer: 'exp(x y)', feedback: t`$\partial_x e^{xy} = y\,e^{xy}$ accounts for only part of $P$: the $${c === 1 ? '' : c}x^2$ needs a term of its own.` }],
          hints: [t`What function has $x$-derivative $y\,e^{xy}$ and $y$-derivative $x\,e^{xy}$?`],
          teach: 'Integrate P in x, then check ∂f/∂y against Q.',
          explain: t`$f = e^{xy} + \tfrac{${c}}{3}x^3$: $f_x = y\,e^{xy} + ${c === 1 ? '' : c}x^2$ and $f_y = x\,e^{xy}$ ✓.`,
        };
      },
    }),
    num({
      id: 'cp-climb', difficulty: 3, transfer: true,
      gen(r) {
        const GM = 3.986e14, Re = 6378e3;
        const m = r.pick([1500, 2200, 3500]), h = r.pick([300, 400, 550]);
        const r1 = Re + h * 1e3, r2 = 42164e3;
        const W = GM * m * (1 / r2 - 1 / r1);
        const rp = r1 / 1e6, ra = r2 / 1e6, a = (rp + ra) / 2;
        return {
          prompt: t`Earth’s gravity is conservative: $\vec F = -\nabla U$ with $U = -\dfrac{GMm}{r}$, where $r$ is the distance from Earth’s centre and $GM = 3.986\times10^{14}$ m³/s². A ${m} kg satellite is raised from a circular orbit ${h} km above the surface (Earth’s radius 6378 km) to geostationary orbit, $r = 42\,164$ km. The planners compare a quick two-burn transfer with a slow electric-propulsion spiral. How much work does **gravity** do on the satellite during the climb, in GJ?`,
          visual: {
            type: 'graph',
            params: {
              x: [-73, 73], y: [-45.5, 45.5], equal: true, aspect: '', xlabel: 'x (1000 km)', ylabel: 'y (1000 km)',
              curves: [
                { param: ['6.378*cos(t)', '6.378*sin(t)'], t: [0, 2 * PI], color: 'accent', width: 3 },
                { param: ['42.164*cos(t)', '42.164*sin(t)'], t: [0, 2 * PI], color: 'ink3', width: 1.5, dash: true },
                { param: [`${r6(rp - a)} + ${r6(a)}*cos(t)`, `${r6(Math.sqrt(rp * ra))}*sin(t)`], t: [0, PI], color: 'gold', width: 2.5, label: 'two-burn transfer', labelAt: 1.2, labelDx: 8, labelDy: -10 },
                { param: [`(${r6(rp)} + ${r6((ra - rp) / (10 * PI))}*t)*cos(t)`, `(${r6(rp)} + ${r6((ra - rp) / (10 * PI))}*t)*sin(t)`], t: [0, 10 * PI], color: 'violet', width: 1.6, label: 'spiral', labelAt: 9.6, labelDx: 8, labelDy: 12 },
              ],
              points: [{ x: r6(rp), y: 0, color: 'gold', r: 4 }],
            },
            caption: 'Earth (blue), the geostationary orbit (dashed) and two routes up: a half-ellipse transfer (gold) and a five-turn spiral (violet; real spirals take hundreds of turns). Distances to scale.',
          },
          answer: W / 1e9, units: 'GJ', tol: { rel: 0.01 },
          errors: [{ value: (GM * m * (1 / 35786e3 - 1 / (h * 1e3))) / 1e9, feedback: t`Measure $r$ from Earth’s **centre**, not from the surface: $r_1 = 6378 + ${h}$ km and $r_2 = 42\,164$ km.` }],
          hints: [t`Gravity is conservative, so the route does not matter: $W = -\Delta U = U(r_1) - U(r_2)$.`, t`$W = GMm\left(\dfrac{1}{r_2} - \dfrac{1}{r_1}\right)$, with $r_1 = ${nice(r1 / 1e3)}$ km — in metres!`],
          teach: 'For a conservative force the work is −ΔU along any route: two burns or a thousand-turn spiral give the same answer.',
          explain: t`$W = (3.986\times10^{14})(${m})\left(\dfrac{1}{4.2164\times10^{7}} - \dfrac{1}{${nice(+(r1 / 1e6).toPrecision(5))}\times10^{6}}\right) \approx ${nice(+(W / 1e9).toPrecision(3))}$ GJ. Negative: gravity pulls back on the way up. The engines must supply this (plus the change in orbital kinetic energy) whichever route is flown — the route changes how efficiently propellant is used, not this number.`,
        };
      },
    }),
    mcq({
      id: 'cp-loops', difficulty: 2,
      prompt: t`A force field $\vec F$ has $\oint_C\vec F\cdot d\vec r = 0$ round **every** closed curve $C$ in the plane. Which statement must then be true?`,
      visual: linePic('y + 0.3', 'x', [{ x: '1.8*cos(t)', y: '-0.6 + 1.6*sin(t)', t: [0, 'pi'], color: 'gold' }, { x: '1.8*cos(t)', y: '-0.6 - 0.9*sin(t)', t: [0, 'pi'], color: 'violet' }], { points: [{ x: 1.8, y: -0.6, color: 'ink', label: 'P', labelDx: 8 }, { x: -1.8, y: -0.6, color: 'ink', label: 'Q', labelDx: -10, labelAlign: 'right' }], caption: 'Two routes from P to Q. Run the first forward and the second backward, and together they make a closed loop.' }),
      choices: ['The work from any point P to any point Q is the same along every path', t`$\vec F = \vec 0$ everywhere`, t`$\vec F$ is constant`, 'The work between two points is zero along every path'],
      answer: 0,
      why: {
        1: t`Gravity near the ground, $\langle 0, -mg\rangle$, has zero circulation round every loop but is not zero.`,
        2: t`Any gradient field works, such as $\nabla(xy) = \langle y, x\rangle$, which varies from point to point.`,
        3: t`Only round a **closed** loop. Between different points the work is $f(Q) - f(P)$, usually not zero.`,
      },
      hints: [t`Path 1 from $P$ to $Q$, then path 2 back from $Q$ to $P$, is a closed loop. What does $\oint = 0$ say about the two works?`],
      teach: 'Zero circulation round every loop is the same as path independence: two paths between P and Q form a loop.',
      explain: t`Going out along path 1 and back along path 2 is a closed loop, so $W_1 - W_2 = 0$: every path from $P$ to $Q$ gives the same work. (On a connected region that makes $\vec F$ the gradient of $f(Q) = \int_P^Q\vec F\cdot d\vec r$.)`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.3 Conservative vector fields', url: 'https://openstax.org/books/calculus-volume-3/pages/6-3-conservative-vector-fields' },
    { label: 'OpenStax University Physics Vol. 1, §8.2 Conservative and non-conservative forces', url: 'https://openstax.org/books/university-physics-volume-1/pages/8-2-conservative-and-non-conservative-forces' },
  ],
});
