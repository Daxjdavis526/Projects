// Directional derivatives and the gradient: the rate of change in any
// direction is a dot product with ∇f, so ∇f points up the steepest slope,
// crosses level curves at right angles, and — as F = −∇U — gives the force.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { surf, r6 } from './_partials.js';

const t = String.raw;
const DEG = Math.PI / 180;

// a hill: height in metres, x and y in km
const HILL = '500*exp(-(x^2 - x*y + 2*y^2)/4)';
const HX = `((${HILL})*(-(2*px - py)/4))`.replace(/\bx\b/g, 'px').replace(/\by\b/g, 'py');
const HY = `((${HILL})*(-(4*py - px)/4))`.replace(/\bx\b/g, 'px').replace(/\by\b/g, 'py');

/** A contour map of f with a point P and arrows, for a problem (no readouts). */
const map = (f, { x = [-3, 3], y = [-2.6, 2.6], levels = 9, labels = true, points = [], arrows = [], caption, ...rest }) => ({
  type: 'c3-contour', params: { f, x, y, levels, labels, points, arrows, ...rest }, caption,
});
/** An arrow from P along v drawn `len` long (directions true). */
const arrow = (P, v, len, o = {}) => { const n = Math.hypot(...v) || 1; return { from: [r6(P[0]), r6(P[1])], to: [r6(P[0] + (v[0] * len) / n), r6(P[1] + (v[1] * len) / n)], ...o }; };

export default lesson({
  id: 'math2210.C3-3.5',
  title: 'Directional derivatives and the gradient',
  minutes: 11, difficulty: 2,
  intro: t`Partial derivatives give the rate of change along the axes. In any other direction, given by a unit vector $\hat u$, the rate of change is the **directional derivative** — and it is a dot product with one vector, the **gradient** $\nabla f = \left(\tfrac{\partial f}{\partial x},\ \tfrac{\partial f}{\partial y}\right)$:

$$D_{\hat u} f = \nabla f \cdot \hat u = |\nabla f|\cos\theta$$

So $\nabla f$ points in the direction of **steepest ascent**, its length is that steepest rate, and along a level curve ($\theta = 90^\circ$) the rate is zero: **the gradient crosses level curves at right angles**. Physics runs on this. A force that comes from a potential energy points straight downhill in it, $\vec F = -\nabla U$; heat flows down the temperature gradient; the electric field is $\vec E = -\nabla V$.`,
  symbols: [
    { tex: '\\nabla f', text: 'the gradient (“del $f$”): the vector of partial derivatives, in units of $f$ per unit length. It lives in the $xy$-plane, the domain of $f$' },
    { tex: '\\hat u', text: 'a **unit** vector, $|\\hat u| = 1$, giving the direction you move in' },
    { tex: 'D_{\\hat u} f', text: 'the rate of change of $f$ per unit distance moved in the direction $\\hat u$' },
    { tex: '\\theta', text: 'the angle between $\\nabla f$ and $\\hat u$' },
  ],
  why: t`Most vector fields in physics are gradients — gravity $\vec g = -\nabla\Phi$, the electric field $\vec E = -\nabla V$, heat flux $\vec q = -k\nabla T$ — and every one of them crosses its own equipotentials at right angles.`,
  visual: {
    type: 'c3-contour',
    title: 'Which way is uphill, and how steep?',
    lead: t`A hill, mapped with level curves every 50 m. At the point $P$ you choose, the red arrow is the gradient $\nabla h$ and the gold arrow is a unit direction $\hat u$ that you turn. The readout $D_{\hat u}h$ is the slope you would climb walking that way, in metres per kilometre.`,
    tasks: [
      t`Turn $\hat u$ until $D_{\hat u}h$ is as large as it gets: the gold arrow lies along the red one, and the rate equals $|\nabla h|$.`,
      t`Turn $\hat u$ to run along the level curve through $P$: $D_{\hat u}h = 0$, and the angle to $\nabla h$ is $90^\circ$.`,
      t`Point $\hat u$ straight against $\nabla h$: $D_{\hat u}h = -|\nabla h|$, the steepest way down — the way water runs off the hill.`,
    ],
    params: {
      f: HILL, x: [-3, 3], y: [-2.6, 2.6], levels: { from: 50, to: 450, step: 50 }, xlabel: 'x (km)', ylabel: 'y (km)',
      sliders: [
        { key: 'px', label: 'Point $P$: $x$', min: -2.5, max: 2.5, step: 0.1, value: 1.2, unit: '\\mathrm{km}', explain: 'Where you stand, east–west.' },
        { key: 'py', label: 'Point $P$: $y$', min: -2.2, max: 2.2, step: 0.1, value: -0.6, unit: '\\mathrm{km}', explain: 'Where you stand, north–south.' },
        { key: 'phi', label: t`Direction of $\hat u$`, min: 0, max: 360, step: 5, value: 60, unit: '^\\circ', explain: t`Measured anticlockwise from the $+x$ axis: $\hat u = (\cos\varphi, \sin\varphi)$.` },
      ],
      points: [{ x: 'px', y: 'py', color: 'ink', label: 'P' }],
      arrows: [
        { from: ['px', 'py'], to: [`px + 0.004*${HX}`, `py + 0.004*${HY}`], color: 'bad', label: '∇h' },
        { from: ['px', 'py'], to: ['px + cos(phi*pi/180)', 'py + sin(phi*pi/180)'], color: 'gold', label: 'û' },
      ],
      readouts: [
        { label: '$|\\nabla h|$', expr: `sqrt(${HX}^2 + ${HY}^2)`, unit: '\\mathrm{m/km}', digits: 3 },
        { label: '$D_{\\hat u}h$', expr: `${HX}*cos(phi*pi/180) + ${HY}*sin(phi*pi/180)`, unit: '\\mathrm{m/km}', digits: 3 },
        { label: t`angle between them`, expr: `acos((${HX}*cos(phi*pi/180) + ${HY}*sin(phi*pi/180))/sqrt(${HX}^2 + ${HY}^2))*180/pi`, unit: '^\\circ', digits: 3 },
      ],
    },
    caption: t`The hill $h = 500\,e^{-(x^2 - xy + 2y^2)/4}$ m. The gold arrow $\hat u$ is 1 km long; the red arrow $\nabla h$ is drawn at 1 km per 250 m/km of slope. Both are vectors in the map’s plane.`,
  },
  example: {
    prompt: t`The temperature on a heated plate is $T(x, y) = 20 + x^2y + 2y$ °C, with $x$, $y$ in cm. At $P(1, 2)$, find (a) $\nabla T$; (b) the rate of change of $T$ in the direction of the point $Q(4, 6)$; (c) the greatest rate of change and its direction; (d) a direction in which $T$ does not change.`,
    visual: map('20 + x^2*y + 2*y', { x: [-0.5, 5], y: [-0.3, 6.5], levels: [22, 24, 26, 30, 35, 40, 50, 60], points: [{ x: 1, y: 2, color: 'ink', label: 'P' }, { x: 4, y: 6, color: 'violet', label: 'Q' }], arrows: [arrow([1, 2], [4, 3], 1.4, { color: 'bad', label: '∇T', labelDx: 8, labelDy: 12 }), arrow([1, 2], [3, 4], 1.4, { color: 'gold', label: 'toward Q', labelDx: -66, labelDy: -10 })], caption: t`Level curves of $T$ (°C). At $P$, the gradient (red) and the direction toward $Q$ (gold), both drawn 1.4 cm long.` }),
    steps: [
      { label: 'Gradient', text: t`$T_x = 2xy$ and $T_y = x^2 + 2$, so $\nabla T(1, 2) = (4,\ 3)$ °C/cm.` },
      { label: 'Make it a unit vector', text: t`From $P$ to $Q$ is $\vec v = (3, 4)$, of length $5$. The direction is $\hat u = \vec v/|\vec v| = (0.6,\ 0.8)$ — the dot product only gives a rate per centimetre if $|\hat u| = 1$.` },
      { label: 'Directional derivative', text: t`$D_{\hat u}T = \nabla T\cdot\hat u = 4(0.6) + 3(0.8) = 4.8$ °C/cm.` },
      { label: 'Steepest', text: t`The largest rate is $|\nabla T| = \sqrt{4^2 + 3^2} = 5$ °C/cm, in the direction of $\nabla T$ itself: $(0.8,\ 0.6)$.` },
      { label: 'No change', text: t`$D_{\hat u}T = 0$ when $\hat u \perp \nabla T$: $\hat u = \pm(0.6,\ -0.8)$, along the level curve through $P$.` },
      { label: 'Sense check', text: t`$4.8 < 5$: no direction can beat the gradient’s own. The angle between $\hat u$ and $\nabla T$ is $\arccos(4.8/5) = 16^\circ$ — the gold and red arrows nearly agree.` },
    ],
    answer: t`$\nabla T = (4, 3)$ °C/cm; $D_{\hat u}T = 4.8$ °C/cm toward $Q$; at most $5$ °C/cm, along $(0.8, 0.6)$; no change along $\pm(0.6, -0.8)$.`,
  },
  practice: [
    num({
      id: 'du-unit', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 1], [1, 1], [2, -1]]);
        const [vx, vy] = r.pick([[3, 4], [4, -3], [-3, 4], [5, 12], [12, 5]]);
        // f = x^2 + 3xy
        const gx = 2 * a + 3 * b, gy = 3 * a, L = Math.hypot(vx, vy), D = (gx * vx + gy * vy) / L;
        return {
          prompt: t`Find the rate of change of $f(x, y) = x^2 + 3xy$ at $P(${a}, ${b})$ in the direction of the vector $\vec v = (${vx},\ ${vy})$.`,
          visual: map('x^2 + 3*x*y', { x: [a - 2.5, a + 2.5], y: [b - 2, b + 2], labels: false, points: [{ x: a, y: b, color: 'ink', label: 'P' }], arrows: [arrow([a, b], [vx, vy], 1.3, { color: 'gold', label: 'v' })], caption: t`Level curves of $f$ (unlabelled) near $P$, and the direction of $\vec v$ (gold).` }),
          answer: D, tol: { rel: 1e-3, abs: 1e-6 },
          errors: [{ value: gx * vx + gy * vy, feedback: t`$\vec v$ has length $${L}$, not $1$, so $\nabla f\cdot\vec v$ is $${L}$ times too big. Divide by $|\vec v|$ first.` }],
          hints: [t`$\nabla f = (2x + 3y,\ 3x)$; evaluate it at $P$.`, t`Use the unit vector $\hat u = \vec v/|\vec v| = \tfrac{1}{${L}}(${vx},\ ${vy})$.`],
          teach: 'A directional derivative needs a unit vector: divide the given direction by its length before dotting.',
          explain: t`$\nabla f(${a}, ${b}) = (${gx},\ ${gy})$ and $\hat u = \tfrac{1}{${L}}(${vx},\ ${vy})$, so $D_{\hat u}f = \dfrac{${gx}(${vx}) + ${gy}(${vy})}{${L}} = ${nice(+D.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'max-rate', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[1, 1], [2, 1], [1, -1], [3, 1]]);
        // f = x^2 y + y^3 ; ∇f = (2xy, x^2 + 3y^2)
        const gx = 2 * a * b, gy = a * a + 3 * b * b, G = Math.hypot(gx, gy);
        return {
          prompt: t`What is the greatest rate of increase of $f(x, y) = x^2y + y^3$ at the point $(${a}, ${b})$?`,
          visual: map('x^2*y + y^3', { x: [a - 2.2, a + 2.2], y: [b - 1.8, b + 1.8], labels: false, points: [{ x: a, y: b, color: 'ink', label: `(${a}, ${b})` }], caption: t`Level curves of $f$ (unlabelled) around the point.` }),
          answer: G, tol: { rel: 1e-3 },
          errors: [{ value: gx + gy, feedback: t`Components do not simply add: the length of $(${gx},\ ${gy})$ is $\sqrt{${gx}^2 + ${gy}^2}$.` }, { value: gx * gx + gy * gy, feedback: 'Take the square root: that is the squared length.' }],
          hints: ['The greatest rate is the length of the gradient.', t`$\nabla f = (2xy,\ x^2 + 3y^2)$.`],
          teach: 'The steepest rate of increase is |∇f|, reached by moving along ∇f.',
          explain: t`$\nabla f(${a}, ${b}) = (${gx},\ ${gy})$, so the greatest rate is $|\nabla f| = \sqrt{${gx * gx} + ${gy * gy}} = ${nice(+G.toPrecision(4))}$, in the direction $\nabla f/|\nabla f|$.`,
        };
      },
    }),
    mcq({
      id: 'perp', difficulty: 1,
      prompt: t`At the point $P$ on this contour map, which numbered arrow points along $\nabla f$?`,
      visual: map('x^2 + 2*y^2', { x: [-3.2, 3.2], y: [-2.3, 2.3], levels: [1, 2, 4, 6, 8], points: [{ x: 1.6, y: 0.6, color: 'ink', label: 'P', labelDx: -16, labelDy: 12 }], arrows: [arrow([1.6, 0.6], [3.2, 2.4], 1, { color: 'gold', label: '1' }), arrow([1.6, 0.6], [-2.4, 3.2], 1, { color: 'accent', label: '2' }), arrow([1.6, 0.6], [-3.2, -2.4], 1, { color: 'violet', label: '3' }), arrow([1.6, 0.6], [1, 0], 1, { color: 'teal', label: '4' })], caption: t`Level curves of $f$, labelled with their values. Four candidate directions at $P$, each 1 unit long.` }),
      choices: ['Arrow 1', 'Arrow 2', 'Arrow 3', 'Arrow 4'],
      fixedOrder: true,
      answer: 0,
      why: {
        1: 'Arrow 2 runs along the level curve: f does not change that way, so it is perpendicular to the gradient.',
        2: 'Arrow 3 is perpendicular to the level curve but points downhill, toward lower values: that is −∇f.',
        3: 'Arrow 4 points in the +x direction, which only matches ∇f where the level curve happens to be vertical.',
      },
      hints: ['The gradient is perpendicular to the level curve through the point.', 'Of the two perpendicular directions, the gradient takes the one toward higher values.'],
      teach: '∇f crosses the level curve at right angles, toward higher values of f.',
      explain: t`For $f = x^2 + 2y^2$, $\nabla f(1.6, 0.6) = (3.2,\ 2.4)$ — arrow 1, square to the level curve and pointing outward, where the values grow.`,
    }),
    mcq({
      id: 'trap-force', difficulty: 2,
      prompt: t`An ion in a trap has potential energy $U(x, y) = \tfrac12(k_x x^2 + k_y y^2)$ with $k_y = 4k_x$, so its equipotentials are ellipses. The force on it is $\vec F = -\nabla U$. At the point $P(1, 1)$, which statement is true?`,
      visual: map('0.5*(x^2 + 4*y^2)', { x: [-2.6, 2.6], y: [-1.8, 1.8], levels: [0.5, 1, 1.5, 2.5, 3.5, 5], labels: false, points: [{ x: 1, y: 1, color: 'ink', label: 'P' }, { x: 0, y: 0, color: 'gold', label: 'centre', labelDx: 8, labelDy: 12 }], curves: [{ param: ['t', 't'], t: [0, 1], color: 'ink3', width: 1.4, dash: true }], caption: t`Equipotentials of $U$ (with $k_x = 1$), more closely spaced in $y$ because the trap is four times stiffer that way. The dashed line runs from $P$ to the centre.` }),
      choices: [
        t`$\vec F$ is perpendicular to the equipotential through $P$, so it does **not** point at the centre`,
        t`$\vec F$ points straight at the centre, like every restoring force`,
        t`$\vec F$ is tangent to the equipotential through $P$`,
        t`$\vec F$ points away from the centre, uphill in $U$`,
      ],
      answer: 0,
      why: {
        1: t`Only for a round trap ($k_x = k_y$). Here $\vec F = -(k_x,\ 4k_x)$ at $P$, which points much more steeply in $y$ than the line back to the centre.`,
        2: t`Along an equipotential $U$ does not change, so no work is done and no force acts that way: the force is perpendicular to it.`,
        3: t`The minus sign in $\vec F = -\nabla U$ makes the force point downhill in $U$, toward lower potential energy.`,
      },
      hints: [t`$\nabla U = (k_x x,\ k_y y)$. Evaluate it at $(1, 1)$ with $k_y = 4k_x$.`, t`Is $(k_x,\ 4k_x)$ parallel to the line from $P$ to the origin, $(1,\ 1)$?`],
      teach: 'A conservative force is −∇U: perpendicular to equipotentials and downhill — which need not be toward the centre.',
      explain: t`$\vec F(1, 1) = -(k_x,\ 4k_x)$, at right angles to the elliptical equipotential and four times steeper than the diagonal back to the centre. Released from rest at $P$, the ion would not fall straight in. (Real ion traps use oscillating fields; this static potential is the time-averaged picture.)`,
    }),
    expr({
      id: 'level-plane', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[1, 2, 2], [2, 1, 2], [2, 3, 6], [1, 2, 3], [3, 2, 6]]);
        const R2 = a * a + b * b + c * c;
        return {
          prompt: t`Find the tangent plane to the sphere $x^2 + y^2 + z^2 = ${R2}$ at the point $(${a}, ${b}, ${c})$.`,
          visual: { type: 'calc-vectors3d', params: { range: Math.ceil(Math.sqrt(R2)) + 1, spheres: [{ centre: [0, 0, 0], radius: r6(Math.sqrt(R2)), color: 'teal' }], points: [{ at: [a, b, c], color: 'gold', label: 'P' }] }, caption: t`The sphere of radius $\sqrt{${R2}}$ (three great circles) and the point $P$ on it. Drag to rotate.` },
          answer: `${a}*x + ${b}*y + ${c}*z = ${R2}`,
          answerTeX: t`${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y + ${c === 1 ? '' : c}z = ${R2}`,
          vars: { x: [-3, 3], y: [-3, 3], z: [-3, 3] }, mode: 'equation',
          errors: [{ answer: `${a}*x + ${b}*y + ${c}*z = 0`, feedback: 'That plane is parallel to the right one but passes through the origin. Make it pass through P.' }],
          hints: [t`The sphere is a level surface of $F = x^2 + y^2 + z^2$, and $\nabla F$ is perpendicular to it.`, t`$\nabla F(${a}, ${b}, ${c}) = (${2 * a},\ ${2 * b},\ ${2 * c})$ is a normal vector: the plane is $${2 * a}(x - ${a}) + ${2 * b}(y - ${b}) + ${2 * c}(z - ${c}) = 0$.`],
          teach: 'The gradient of F is normal to the level surface F = c, so it is the normal vector of the tangent plane.',
          explain: t`$\nabla F = (${2 * a},\ ${2 * b},\ ${2 * c})$ at $P$, so the plane is $${2 * a}(x - ${a}) + ${2 * b}(y - ${b}) + ${2 * c}(z - ${c}) = 0$, which simplifies to $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y + ${c === 1 ? '' : c}z = ${R2}$. For a sphere the normal is the radius, as it should be.`,
        };
      },
    }),
    mcq({
      id: 'error-nonunit', difficulty: 2, kind: 'error',
      prompt: t`At a point where $\nabla f = (3,\ 4)$, a student wants the rate of change of $f$ in the direction of $(3,\ 4)$ and writes $\nabla f\cdot(3,\ 4) = 9 + 16 = 25$. Then they notice that $|\nabla f| = 5$ should be the largest possible rate. What went wrong?`,
      visual: { type: 'graph', params: { x: [-1, 6], y: [-0.6, 5], equal: true, aspect: 'wide', arrows: [{ from: [0, 0], to: [3, 4], color: 'bad', label: '∇f = (3, 4)', labelDx: 8, labelDy: -6 }, { from: [0, 0], to: [0.6, 0.8], color: 'gold', label: 'û', labelDx: 8, labelDy: 6 }] }, caption: t`The gradient $(3, 4)$ (red) and the unit vector $\hat u$ in the same direction (gold), drawn to scale.` },
      choices: [
        t`The direction must be a unit vector: $\hat u = (0.6,\ 0.8)$ gives $D_{\hat u}f = 5$`,
        t`Nothing: 25 is right, and $|\nabla f|$ is not really the largest rate`,
        t`The dot product should be $3\cdot4 + 4\cdot3 = 24$`,
        t`The rate should be $\sqrt{25} = 5$ because a directional derivative is always a square root`,
      ],
      answer: 0,
      why: {
        1: t`$D_{\hat u}f = |\nabla f|\cos\theta \le |\nabla f|$, so no rate can exceed 5. A result of 25 is a warning sign.`,
        2: 'A dot product multiplies matching components: 3·3 + 4·4.',
        3: t`The square root here is a coincidence: dividing by $|\vec v| = 5$ is the real fix, and gives $25/5 = 5$.`,
      },
      hints: [t`What is the length of the vector $(3,\ 4)$?`, t`A rate per unit distance needs a direction of length 1.`],
      teach: 'Dotting with a non-unit vector scales the answer by that vector’s length.',
      explain: t`$(3,\ 4)$ has length 5, so it inflates the dot product fivefold. With $\hat u = (3,\ 4)/5 = (0.6,\ 0.8)$, $D_{\hat u}f = 3(0.6) + 4(0.8) = 5 = |\nabla f|$ — the steepest rate, as it must be in the gradient’s own direction.`,
    }),
    mcq({
      id: 'where-grad', difficulty: 2,
      prompt: t`For a function $z = f(x, y)$ with a hill-shaped graph, where does the gradient $\nabla f$ live?`,
      visual: surf((x, y) => `2.4*exp(-(${x}^2 + ${y}^2)/3)`, { tangentAt: [1, -0.6], readouts: [], planeSize: 0.6, dist: 8.5, alpha: 0.5, pitch: 0.35, caption: t`A hill $z = f(x, y)$ (drawn see-through) with its tangent plane at one point (gold) and, on the floor below, the gradient there (red). Drag to rotate.` }),
      choices: [
        t`In the $xy$-plane: a 2D vector at $(x, y)$ pointing in the uphill direction`,
        t`On the surface: a 3D arrow tangent to the graph, pointing up the slope`,
        t`It is the normal vector to the surface at the point`,
        t`It is a vertical arrow whose height is the slope`,
      ],
      answer: 0,
      why: {
        1: t`The uphill tangent vector to the graph is $(\nabla f,\ |\nabla f|^2)$ — it has a $z$-component. $\nabla f$ itself has only the two components $f_x$, $f_y$.`,
        2: t`The normal to the graph is $(f_x,\ f_y,\ -1)$: built from the gradient, but a 3D vector with a $z$-component.`,
        3: t`The gradient has no $z$-component at all; its length, not its height, gives the slope.`,
      },
      hints: [t`How many components does $\nabla f = (f_x,\ f_y)$ have?`, 'It points in the direction you would walk on a map to climb fastest.'],
      teach: 'For z = f(x, y), ∇f is a two-component vector in the domain — the map — not an arrow on the surface.',
      explain: t`$\nabla f = (f_x, f_y)$ has two components, one per input: it is a vector in the $xy$-plane, the map you walk on, pointing the way to walk for the steepest climb. Its length is that steepest slope.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-du', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 1], [-1, 2]]), ang = r.pick([30, 45, 60, 120, 135]);
        // f = x y^2
        const gx = b * b, gy = 2 * a * b, D = gx * Math.cos(ang * DEG) + gy * Math.sin(ang * DEG);
        return {
          prompt: t`Find the directional derivative of $f(x, y) = xy^2$ at $(${a}, ${b})$ in the direction making an angle of $${ang}^\circ$ with the positive $x$-axis.`,
          visual: map('x*y^2', { x: [a - 2.4, a + 2.4], y: [b - 1.9, b + 1.9], labels: false, points: [{ x: a, y: b, color: 'ink', label: 'P' }], arrows: [arrow([a, b], [Math.cos(ang * DEG), Math.sin(ang * DEG)], 1.1, { color: 'gold', label: 'û' })], caption: t`Level curves of $f$ (unlabelled) near the point, and the direction $\hat u$ at $${ang}^\circ$.` }),
          answer: D, tol: { rel: 2e-3, abs: 1e-6 },
          hints: [t`$\hat u = (\cos${ang}^\circ,\ \sin${ang}^\circ)$ and $\nabla f = (y^2,\ 2xy)$.`],
          teach: 'With the direction given as an angle, û = (cos θ, sin θ) is already a unit vector.',
          explain: t`$\nabla f(${a}, ${b}) = (${gx},\ ${gy})$, so $D_{\hat u}f = ${gx}\cos${ang}^\circ + ${gy}\sin${ang}^\circ = ${nice(+D.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'cp-heatflux', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([20, 30, 40]), B = r.pick([10, 15, 25]), x0 = r.pick([0.1, 0.2]), k = 205;
        // T = 300 + A x^2 - B y  (K, x and y in m): grad T = (2 A x, -B)
        const gx = 2 * A * x0, gy = -B, q = k * Math.hypot(gx, gy);
        return {
          prompt: t`Across an aluminium radiator panel on a satellite ($k = ${k}$ W/(m·K)) the temperature is $T(x, y) = 300 + ${A}x^2 - ${B}y$ K, with $x$ and $y$ in metres. Fourier’s law says the heat flux is $\vec q = -k\nabla T$. Find its magnitude at $(${x0},\ 0.2)$ m, in W/m².`,
          visual: map(`300 + ${A}*x^2 - ${B}*y`, { x: [-0.5, 0.5], y: [-0.42, 0.42], levels: 8, xlabel: 'x (m)', ylabel: 'y (m)', points: [{ x: x0, y: 0.2, color: 'ink', label: 'P' }], caption: t`Isotherms (K) across a 1 m wide piece of the panel, and the point $P$. Heat flows across the isotherms, from hot to cold.` }),
          answer: q, units: 'W/m^2', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(gx, gy), feedback: t`That is $|\nabla T|$ in K/m. Multiply by the conductivity $k$.` }, { value: k * (Math.abs(gx) + Math.abs(gy)), feedback: 'Add the components as a vector: the magnitude is the square root of the sum of squares.' }],
          hints: [t`$\nabla T = (${2 * A}x,\ -${B})$ K/m.`, t`$|\vec q| = k\,|\nabla T| = k\sqrt{T_x^2 + T_y^2}$.`],
          teach: 'Heat flows down the temperature gradient: q = −k∇T, with magnitude k|∇T|.',
          explain: t`$\nabla T = (${nice(gx)},\ -${B})$ K/m at the point, so $|\nabla T| = ${nice(+Math.hypot(gx, gy).toPrecision(4))}$ K/m and $|\vec q| = ${k}\times${nice(+Math.hypot(gx, gy).toPrecision(4))} = ${Math.round(q)}$ W/m², flowing straight across the isotherms toward colder metal.`,
        };
      },
    }),
    mcq({
      id: 'cp-normal', difficulty: 2,
      prompt: t`The graph $z = f(x, y)$ is the level surface $F(x, y, z) = f(x, y) - z = 0$. Which vector is normal to the graph at a point?`,
      visual: surf((x, y) => `2.4*exp(-(${x}^2 + ${y}^2)/3)`, { tangentAt: [0.9, -0.7], gradient: false, readouts: [], planeSize: 0.6, dist: 8.5, caption: t`A graph $z = f(x, y)$ and its tangent plane at one point. Drag to rotate.` }),
      choices: [t`$(f_x,\ f_y,\ -1)$`, t`$(f_x,\ f_y,\ 0)$`, t`$(f_x,\ f_y,\ 1)$, the only upward choice`, t`$(1,\ 1,\ f_x + f_y)$`],
      answer: 0,
      why: {
        1: t`$(f_x, f_y, 0)$ is the gradient of $f$ laid flat: it lies in a horizontal plane, so it cannot be normal to a tilted tangent plane.`,
        2: t`$\nabla F = (f_x, f_y, -1)$. Its negative, $(-f_x, -f_y, 1)$, points up and is normal too — but $(f_x, f_y, 1)$ is not parallel to either.`,
        3: t`That vector is not built from $\nabla F$ and is not perpendicular to the tangent plane in general.`,
      },
      hints: [t`Compute $\nabla F$ for $F = f(x, y) - z$.`],
      teach: t`Writing a graph as the level surface $F = f(x, y) - z = 0$ gives its normal: $\nabla F = (f_x,\ f_y,\ -1)$.`,
      explain: t`$\nabla F = (f_x,\ f_y,\ -1)$ is normal to the level surface $F = 0$, which is the graph. It is also the normal of the tangent plane $z = f(a, b) + f_x(x - a) + f_y(y - b)$ from the last lesson.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 3, §4.6 Directional derivatives and the gradient', url: 'https://openstax.org/books/calculus-volume-3/pages/4-6-directional-derivatives-and-the-gradient' }],
});
