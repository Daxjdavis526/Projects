// Lagrange multipliers: at a constrained extremum a level curve of f just
// touches the constraint curve, so the gradients are parallel, ∇f = λ∇g.
// Optimal design (the best cylindrical tank), the meaning of λ, and Snell's
// law as a constrained minimum.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_partials.js';

const t = String.raw;

// the tank: a closed cylinder of radius r (x) and height h (y) holding V = 2π m³, so h = 2/r²
const AREA = '2*pi*x^2 + 2*pi*x*y';
const H = '(2/s^2)';
const GA = [`(4*pi*s + 2*pi*${H})`, '(2*pi*s)'], GV = [`(2*pi*s*${H})`, '(pi*s^2)'];
const unit = (g, len) => [`s + ${len}*${g[0]}/sqrt(${g[0]}^2 + ${g[1]}^2)`, `${H} + ${len}*${g[1]}/sqrt(${g[0]}^2 + ${g[1]}^2)`];

/** A contour map of f with a constraint curve and points, for a problem. */
const map = (f, { x, y, levels = 9, labels = true, curves = [], points = [], arrows = [], caption, ...rest }) => ({
  type: 'c3-contour', params: { f, x, y, levels, labels, curves: curves.map((c) => ({ color: 'violet', width: 2.6, ...c })), points, arrows, ...rest }, caption,
});

export default lesson({
  id: 'math2210.C3-3.8',
  title: 'Lagrange multipliers',
  minutes: 12, difficulty: 3,
  intro: t`To find the largest (or smallest) value of $f(x, y)$ while staying on a constraint curve $g(x, y) = c$, walk along the curve and watch the level curves of $f$ you cross. At the best point a level curve of $f$ **just touches** the constraint without crossing it. Touching curves share a tangent line, so their normals — the gradients — are parallel:

$$\nabla f = \lambda\,\nabla g, \qquad g(x, y) = c$$

That is three equations for three unknowns: $x$, $y$ and the **Lagrange multiplier** $\lambda$. Engineers use it to size tanks, beams and trajectories at fixed mass or cost, and $\lambda$ has a meaning of its own: it is how fast the best value changes as the constraint is relaxed.`,
  symbols: [
    { tex: 'f(x, y)', text: 'the **objective**: the quantity to make as large or as small as possible' },
    { tex: 'g(x, y) = c', text: 'the **constraint**: only points on this curve are allowed' },
    { tex: '\\nabla f,\\ \\nabla g', text: 'their gradients, each perpendicular to its own level curves' },
    { tex: '\\lambda', text: 'the Lagrange multiplier: the scale factor between the gradients, equal to $dM/dc$, the rate at which the best value $M$ changes with $c$ — in units of $f$ per unit of $g$' },
  ],
  why: t`Conservation laws make physics full of constrained extremes: a hanging cable minimises its energy at fixed length, and the Boltzmann distribution maximises entropy at fixed energy — where the multiplier turns out to be $1/(k_B T)$.`,
  visual: {
    type: 'c3-contour',
    title: 'The best tank touches the constraint',
    lead: t`Every point of the violet curve is a closed cylindrical tank of radius $r$ and height $h$ holding the same volume, $V = \pi r^2h = 2\pi \approx 6.28\ \text{m}^3$. The level curves give its surface area $A = 2\pi r^2 + 2\pi rh$ in m² — the metal you must make it from. Slide the design along the constraint; the gold curve is the level of $A$ through it.`,
    tasks: [
      'Where the gold level curve crosses the violet constraint, there are designs on the constraint with less area on one side: not optimal yet.',
      t`At $r = 1.00$ m, $h = 2.00$ m the gold curve just touches the constraint, the arrows line up and $A$ is least: $6\pi \approx 18.8\ \text{m}^2$. The best tank is exactly as tall as it is wide.`,
      t`Read $\lambda$ there: $2\ \text{m}^{-1}$. Each extra cubic metre of volume would cost about 2 m² more metal.`,
    ],
    params: {
      f: AREA, x: [0, 3.2], y: [0, 3.4], levels: { from: 15, to: 50, step: 5 }, fill: false, aspect: 'square', xlabel: 'radius r (m)', ylabel: 'height h (m)', highlight: '2*pi*s^2 + 4*pi/s',
      sliders: [{ key: 's', label: 'Radius $r$', min: 0.8, max: 2.4, step: 0.02, value: 1.6, unit: '\\mathrm{m}', explain: t`The height follows from the fixed volume: $h = V/(\pi r^2) = 2/r^2$.` }],
      curves: [{ param: ['t', '2/t^2'], t: [0.77, 3.2], color: 'violet', width: 2.6, label: 'V = 2π m³', labelAt: 0.9, labelDx: -40, labelDy: -12 }],
      points: [{ x: 's', y: H, color: 'ink', label: 'design', labelDx: -54, labelDy: 14 }],
      arrows: [
        { from: ['s', H], to: unit(GA, 0.6), color: 'bad', label: '∇A' },
        { from: ['s', H], to: unit(GV, 0.6), color: 'teal', label: '∇V' },
      ],
      readouts: [
        { label: '$h$', expr: H, unit: '\\mathrm{m}', digits: 3 },
        { label: '$A$', expr: '2*pi*s^2 + 4*pi/s', unit: '\\mathrm{m^2}', digits: 4 },
        { label: 'angle between the gradients', expr: `acos((${GA[0]}*${GV[0]} + ${GA[1]}*${GV[1]})/sqrt((${GA[0]}^2 + ${GA[1]}^2)*(${GV[0]}^2 + ${GV[1]}^2)))*180/pi`, unit: '^\\circ', digits: 2 },
        { label: t`$\lambda = \dfrac{\nabla A\cdot\nabla V}{|\nabla V|^2}$`, expr: `(${GA[0]}*${GV[0]} + ${GA[1]}*${GV[1]})/(${GV[0]}^2 + ${GV[1]}^2)`, unit: '\\mathrm{m^{-1}}', digits: 3 },
      ],
    },
    caption: t`The arrows show only the directions of $\nabla A$ (red) and $\nabla V$ (teal); their sizes differ. Wall thickness, end-cap shape and welds are ignored: real tanks often use domed ends, which shift the optimum.`,
  },
  example: {
    prompt: t`Find the largest rectangle, with sides parallel to the axes, that fits inside the ellipse $\dfrac{x^2}{4} + y^2 = 1$.`,
    visual: map('4*x*y', {
      x: [-2.6, 2.6], y: [-1.5, 1.5], levels: [1, 2, 3, 4, 6], labels: true, highlight: 4,
      curves: [
        { param: ['2*cos(t)', 'sin(t)'], t: [0, 6.2832] },
        { param: ['1.4142', 't'], t: [-0.7071, 0.7071], color: 'gold', width: 2 }, { param: ['-1.4142', 't'], t: [-0.7071, 0.7071], color: 'gold', width: 2 },
        { param: ['t', '0.7071'], t: [-1.4142, 1.4142], color: 'gold', width: 2 }, { param: ['t', '-0.7071'], t: [-1.4142, 1.4142], color: 'gold', width: 2 },
      ],
      points: [{ x: 1.4142, y: 0.7071, color: 'ink', label: '(√2, 1/√2)' }],
      caption: t`Level curves of the area $4xy$ (hyperbolas), the ellipse (violet), and the best rectangle (gold): its corner is where the level $4xy = 4$ touches the ellipse.`,
    }),
    steps: [
      { label: 'Set up', text: t`A corner $(x, y)$ in the first quadrant gives area $A = 4xy$. The constraint is $g = \dfrac{x^2}{4} + y^2 = 1$.` },
      { label: 'Gradients', text: t`$\nabla A = (4y,\ 4x)$ and $\nabla g = \left(\dfrac{x}{2},\ 2y\right)$.` },
      { label: 'Lagrange equations', text: t`$4y = \lambda\dfrac{x}{2}$ and $4x = 2\lambda y$. The first gives $\lambda = 8y/x$; putting it in the second, $4x = 16y^2/x$, so $x^2 = 4y^2$ and $x = 2y$.` },
      { label: 'Use the constraint', text: t`With $x = 2y$: $\dfrac{4y^2}{4} + y^2 = 1$, so $y = \dfrac{1}{\sqrt2}$ and $x = \sqrt2$. Area: $A = 4\sqrt2\cdot\dfrac{1}{\sqrt2} = 4$.` },
      { label: 'The multiplier', text: t`$\lambda = 8y/x = 4$. Enlarge the ellipse to $\dfrac{x^2}{4} + y^2 = c$ and the best area becomes $4c$, so $\dfrac{dA}{dc} = 4 = \lambda$. ✓` },
      { label: 'Sense check', text: t`The best rectangle fills $\dfrac{4}{2\pi} = 64\%$ of the ellipse’s area $\pi\cdot2\cdot1$ — the same fraction as the best square in a circle.` },
    ],
    answer: t`Corner at $(\sqrt2, 1/\sqrt2)$: a $2\sqrt2 \times \sqrt2$ rectangle of area 4, with $\lambda = 4$.`,
  },
  practice: [
    mcq({
      id: 'tangency', difficulty: 1,
      prompt: t`At the point where $f$ is largest along a constraint curve $g = c$ (and $\nabla g \ne \vec 0$), how is the level curve of $f$ through that point related to the constraint curve?`,
      visual: map('x + y', { x: [-2.6, 2.6], y: [-1.9, 1.9], levels: [-2, -1, 0, 1, 2, 3], curves: [{ param: ['1.5*cos(t)', 'sin(t)'], t: [0, 6.2832] }], caption: t`Level curves of $f = x + y$ (straight lines) and a constraint curve (violet). Only points on the violet curve are allowed.` }),
      choices: [
        t`They are tangent: they touch without crossing, so $\nabla f$ is parallel to $\nabla g$`,
        t`They cross at right angles, so $\nabla f$ is perpendicular to $\nabla g$`,
        t`They cross, and $\nabla f = \vec 0$ there`,
        t`They do not meet at all`,
      ],
      answer: 0,
      why: {
        1: t`If they crossed, you could slide along the constraint into higher levels of $f$ — so the point would not be the best.`,
        2: t`$\nabla f = \vec 0$ is the condition without a constraint. On a constraint, $\nabla f$ only has to be perpendicular to the constraint curve.`,
        3: t`The level curve through the point passes through the point, which lies on the constraint, so they always meet there.`,
      },
      hints: ['Suppose the level curve crossed the constraint. Could you move along the constraint to a larger value of f?'],
      teach: 'At a constrained extremum the level curve of f is tangent to the constraint, so ∇f = λ∇g.',
      explain: t`A crossing would let you move along the constraint into higher (or lower) values of $f$. At the best point the level curve just touches, sharing the tangent line; both gradients are perpendicular to it, so $\nabla f = \lambda\nabla g$.`,
    }),
    num({
      id: 'closest', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[3, 4, 25], [3, 4, 10], [5, 12, 26], [6, 8, 30], [8, 6, 20]]);
        const d = Math.abs(c) / Math.hypot(a, b);
        const P = [(c * a) / (a * a + b * b), (c * b) / (a * a + b * b)];
        const span = d + 1.5;
        return {
          prompt: t`Use Lagrange multipliers to find the shortest distance from the origin to the line $${a}x + ${b}y = ${c}$. (Minimise $f = x^2 + y^2$, the squared distance.)`,
          visual: map('x^2 + y^2', { x: [r6(-0.3 * span), r6(span)], y: [r6(-0.3 * span), r6(span)], levels: 8, labels: false, curves: [{ param: [`t`, `(${c} - ${a}*t)/${b}`], t: [r6(-0.3 * span), r6(span)] }], points: [{ x: 0, y: 0, color: 'ink', label: 'O' }], caption: t`Circles $x^2 + y^2 = $ const (unlabelled) and the line (violet).` }),
          answer: d, tol: { rel: 1e-3 },
          errors: [{ value: d * d, feedback: t`That is the minimum of $f = x^2 + y^2$, the squared distance. Take the square root.` }],
          hints: [t`$\nabla f = (2x,\ 2y)$ and $\nabla g = (${a},\ ${b})$, so $(x, y)$ is parallel to $(${a},\ ${b})$: $x = ${a}k$, $y = ${b}k$.`, t`Put that into the line: $${a * a}k + ${b * b}k = ${c}$.`],
          teach: 'The closest point on a line is where a circle around the origin just touches it: the radius is perpendicular to the line.',
          explain: t`$(x, y) = k(${a}, ${b})$ with $k = \dfrac{${c}}{${a * a + b * b}}$, giving $(${nice(P[0])}, ${nice(P[1])})$ and distance $\dfrac{${c}}{\sqrt{${a * a + b * b}}} = ${nice(d)}$. The general result: $|c|/\sqrt{a^2 + b^2}$.`,
        };
      },
    }),
    num({
      id: 'lambda-use', difficulty: 2,
      gen(r) {
        const dc = r.pick([0.05, 0.1, 0.2]);
        return {
          prompt: t`The largest rectangle inside $\dfrac{x^2}{4} + y^2 = 1$ has area $M = 4$, with multiplier $\lambda = 4$. Using $\dfrac{dM}{dc} = \lambda$, estimate the largest area inside the slightly bigger ellipse $\dfrac{x^2}{4} + y^2 = ${nice(1 + dc)}$.`,
          visual: map('4*x*y', { x: [-2.6, 2.6], y: [-1.5, 1.5], levels: [2, 4, 6], labels: true, curves: [{ param: ['2*cos(t)', 'sin(t)'], t: [0, 6.2832] }, { param: [`${r6(2 * Math.sqrt(1 + dc))}*cos(t)`, `${r6(Math.sqrt(1 + dc))}*sin(t)`], t: [0, 6.2832], color: 'teal', width: 2 }], caption: t`The original ellipse (violet), the enlarged one (teal) and level curves of the area $4xy$.` }),
          answer: 4 + 4 * dc, tol: { rel: 1e-3 },
          errors: [{ value: 4 * dc, feedback: t`That is the **change** in the best area. Add it to the original $M = 4$.` }, { value: 4 + dc, feedback: t`Multiply the change in $c$ by $\lambda = 4$.` }],
          hints: [t`$\Delta M \approx \lambda\,\Delta c$ with $\Delta c = ${nice(dc)}$.`],
          teach: 'The multiplier is the sensitivity of the optimum: ΔM ≈ λΔc.',
          explain: t`$M \approx 4 + \lambda\,\Delta c = 4 + 4(${nice(dc)}) = ${nice(4 + 4 * dc)}$. Here it is exact, since the best area is $4c$: linear in $c$.`,
        };
      },
    }),
    num({
      id: 'tank-r', difficulty: 3,
      gen(r) {
        const V = r.pick([10, 25, 80]);
        const R = Math.cbrt(V / (2 * Math.PI));
        return {
          prompt: t`A closed cylindrical tank must hold $V = ${V}\ \text{m}^3$ using as little sheet metal as possible. Minimise $A = 2\pi r^2 + 2\pi rh$ subject to $\pi r^2 h = ${V}$: what radius should it have?`,
          visual: map('2*pi*x^2 + 2*pi*x*y', { x: [0.3, r6(3 * R)], y: [0, r6(4.5 * R)], levels: 9, labels: false, xlabel: 'r (m)', ylabel: 'h (m)', curves: [{ param: ['t', `${V}/(pi*t^2)`], t: [r6(0.5 * R), r6(3 * R)] }], caption: t`Level curves of the area (unlabelled) and the constraint $\pi r^2h = ${V}$ (violet), in the $(r, h)$ plane.` }),
          answer: R, units: 'm', tol: { rel: 2e-3 },
          errors: [{ value: Math.sqrt(V / Math.PI), feedback: t`That makes $h = 1$ m. Find the optimum shape first: the Lagrange equations give $h = 2r$.` }, { value: Math.cbrt(V / Math.PI), feedback: t`That is the radius when $h = r$. The equations give $h = 2r$, so $V = 2\pi r^3$.` }],
          hints: [t`$\nabla A = (4\pi r + 2\pi h,\ 2\pi r)$ and $\nabla V = (2\pi rh,\ \pi r^2)$.`, t`From the second components, $2\pi r = \lambda\pi r^2$, so $\lambda = 2/r$. Put that in the first: $4\pi r + 2\pi h = 4\pi h$, so $h = 2r$.`, t`Then $V = \pi r^2(2r) = 2\pi r^3$.`],
          teach: 'For a closed cylinder of fixed volume the least surface area has h = 2r — height equal to diameter.',
          explain: t`The Lagrange equations give $h = 2r$, so $${V} = 2\pi r^3$ and $r = \left(\dfrac{${V}}{2\pi}\right)^{1/3} = ${R.toFixed(3)}$ m, with $h = ${(2 * R).toFixed(3)}$ m and $A = 6\pi r^2 = ${(6 * Math.PI * R * R).toFixed(1)}\ \text{m}^2$.`,
        };
      },
    }),
    num({
      id: 'open-box', difficulty: 3,
      prompt: t`An open-topped box (no lid) must hold $32\ \text{m}^3$. Its material area is $A = xy + 2xz + 2yz$, with base $x \times y$ and height $z$. Use Lagrange multipliers with the constraint $xyz = 32$ to find the least possible area.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 4.5,
          segments: [
            [[0, 0, 0], [4, 0, 0]], [[4, 0, 0], [4, 4, 0]], [[4, 4, 0], [0, 4, 0]], [[0, 4, 0], [0, 0, 0]],
            [[0, 0, 2], [4, 0, 2]], [[4, 0, 2], [4, 4, 2]], [[4, 4, 2], [0, 4, 2]], [[0, 4, 2], [0, 0, 2]],
            [[0, 0, 0], [0, 0, 2]], [[4, 0, 0], [4, 0, 2]], [[4, 4, 0], [4, 4, 2]], [[0, 4, 0], [0, 4, 2]],
          ].map(([from, to], k) => ({ from, to, color: k >= 4 && k < 8 ? 'ink3' : 'accent', dash: k >= 4 && k < 8 })),
        },
        caption: t`An open box with base $x \times y$ and height $z$; the dashed rim has no lid. (Drawn with $x = y = 4$, $z = 2$.) Drag to rotate.`,
      },
      answer: 48, units: 'm^2', tol: { rel: 1e-3 },
      errors: [{ value: 6 * Math.cbrt(32) ** 2, feedback: t`That is the area of a closed cube. With no lid, the optimum is a box twice as wide as it is tall.` }],
      hints: [t`$\nabla A = (y + 2z,\ x + 2z,\ 2x + 2y)$ and $\nabla(xyz) = (yz,\ xz,\ xy)$.`, t`Multiply the three Lagrange equations by $x$, $y$ and $z$: $xy + 2xz = xy + 2yz = 2xz + 2yz = 32\lambda$.`, t`The first two give $x = y$; the last gives $z = x/2$. Then $x\cdot x\cdot \tfrac{x}{2} = 32$.`],
      teach: 'With three variables, ∇f = λ∇g is three equations; together with the constraint they fix x, y, z and λ.',
      explain: t`The equations force $x = y$ and $z = x/2$, so $x^3/2 = 32$: $x = y = 4$ m and $z = 2$ m. Then $A = 16 + 16 + 16 = 48\ \text{m}^2$. Without a lid, the best box is half as tall as it is wide.`,
    }),
    mcq({
      id: 'error-no-lambda', difficulty: 2, kind: 'error',
      prompt: t`To maximise $f = xy$ subject to $x + y = 10$, a student writes $\nabla f = (y,\ x)$ and $\nabla g = (1,\ 1)$, sets $\nabla f = \nabla g$ to get $x = y = 1$, and concludes that the maximum is $f(1, 1) = 1$. What went wrong?`,
      visual: map('x*y', { x: [-1, 11], y: [-1, 11], levels: [5, 10, 15, 20, 25], labels: true, curves: [{ param: ['t', '10 - t'], t: [-1, 11] }], points: [{ x: 1, y: 1, color: 'bad', label: '(1, 1)' }], caption: t`Level curves of $xy$, the constraint line $x + y = 10$ (violet) and the student’s point (red).` }),
      choices: [
        t`They dropped $\lambda$ and never used the constraint: $\nabla f = \lambda\nabla g$ gives $x = y$, and $x + y = 10$ then gives $x = y = 5$, $f = 25$`,
        t`$\nabla g$ should be $\vec 0$, since $g$ is constant on the constraint`,
        t`Nothing: $(1, 1)$ is where the two gradients match`,
        t`They should have set $\nabla f = \vec 0$ instead`,
      ],
      answer: 0,
      why: {
        1: t`$g$ is constant **along** the curve, but it changes across it: $\nabla g = (1, 1)$ is the curve’s normal, not zero.`,
        2: t`$(1, 1)$ is not even on the constraint line: $1 + 1 \ne 10$.`,
        3: t`$\nabla f = (y, x) = \vec 0$ only at the origin, which is not on the constraint either. The constraint changes the condition.`,
      },
      hints: [t`The condition is $\nabla f = \lambda\nabla g$, with an unknown $\lambda$ — parallel, not equal.`, 'Did the student’s point satisfy x + y = 10?'],
      teach: 'Solve ∇f = λ∇g together with g = c: the gradients need only be parallel, and the point must lie on the constraint.',
      explain: t`$y = \lambda$ and $x = \lambda$ give $x = y$; the constraint then gives $x = y = 5$, $f = 25$, with $\lambda = 5$. In the picture the level curve $xy = 25$ touches the line there.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-circle', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [1, 2], [2, 1], [5, 12]]), R = r.pick([1, 2, 3]);
        const M = R * Math.hypot(a, b);
        return {
          prompt: t`Find the maximum of $f(x, y) = ${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y$ on the circle $x^2 + y^2 = ${R * R}$.`,
          visual: map(`${a}*x + ${b}*y`, { x: [-R - 1, R + 1], y: [-R - 0.8, R + 0.8], levels: 9, labels: false, curves: [{ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832] }], caption: t`Level lines of $f$ (unlabelled) and the circle of radius ${R} (violet).` }),
          answer: M, tol: { rel: 1e-3 },
          errors: [{ value: -M, feedback: 'That is the minimum: the other point where a level line touches the circle.' }, { value: M * M, feedback: 'Check the last step: the maximum is R times the length of (a, b), not its square.' }],
          hints: [t`$\nabla f = (${a},\ ${b})$ and $\nabla g = (2x,\ 2y)$, so $(x, y)$ is parallel to $(${a},\ ${b})$.`],
          teach: 'A linear function on a circle is largest where the radius points along its gradient.',
          explain: t`$(x, y) = \dfrac{${R}}{\sqrt{${a * a + b * b}}}(${a},\ ${b})$, so $f_{\max} = ${R}\sqrt{${a * a + b * b}} = ${nice(+M.toPrecision(5))}$. The minimum, at the opposite point, is $-${nice(+M.toPrecision(5))}$.`,
        };
      },
    }),
    num({
      id: 'cp-tank', difficulty: 3, transfer: true,
      gen(r) {
        const V = r.pick([25, 50, 80]), dV = r.pick([1, 2, 3]);
        const R = Math.cbrt(V / (2 * Math.PI)), lam = 2 / R;
        return {
          prompt: t`A launcher’s cylindrical propellant tank is designed for least wall area at its volume, ${V} m³, which makes $h = 2r$ and the multiplier $\lambda = 2/r$ (in $\text{m}^{-1}$). Late in the design the engine’s needs grow and the tank must hold ${dV} m³ more. Using $dA_{\min} \approx \lambda\,dV$, about how much more wall area will the re-optimised tank have?`,
          visual: map('2*pi*x^2 + 2*pi*x*y', { x: [0.3, r6(3 * R)], y: [0, r6(4.5 * R)], levels: 9, labels: false, xlabel: 'r (m)', ylabel: 'h (m)', curves: [{ param: ['t', `${V}/(pi*t^2)`], t: [r6(0.55 * R), r6(3 * R)] }, { param: ['t', `${V + dV}/(pi*t^2)`], t: [r6(0.55 * R), r6(3 * R)], color: 'teal', width: 2 }], caption: t`Level curves of the wall area (unlabelled) and the two volume constraints, ${V} m³ (violet) and ${V + dV} m³ (teal), in the $(r, h)$ plane.` }),
          answer: lam * dV, units: 'm^2', tol: { rel: 0.01 },
          errors: [{ value: 6 * Math.PI * R * R, feedback: 'That is the whole wall area of the current tank. The question asks for the extra area.' }, { value: dV / lam, feedback: t`Multiply by $\lambda$, don’t divide: $\lambda$ is area per unit volume.` }].filter((e) => Math.abs(e.value - lam * dV) > 0.02 * lam * dV),
          hints: [t`First find $r$ from $V = 2\pi r^3$.`, t`$r = (${V}/2\pi)^{1/3} = ${R.toFixed(3)}$ m, so $\lambda = 2/r$.`],
          teach: 'The multiplier prices the constraint: the least area grows by about λ for each extra unit of volume.',
          explain: t`$r = ${R.toFixed(3)}$ m and $\lambda = 2/r = ${lam.toFixed(3)}\ \text{m}^{-1}$, so $dA \approx ${lam.toFixed(3)}\times${dV} = ${(lam * dV).toFixed(2)}\ \text{m}^2$. Bigger tanks pay less per cubic metre ($\lambda$ falls as $1/r$) — one reason launchers favour a few large tanks over many small ones.`,
        };
      },
    }),
    mcq({
      id: 'cp-snell', difficulty: 3, transfer: true,
      prompt: t`Light goes from a point at height $a$ in air (speed $v_1$) to a point at depth $b$ in water (speed $v_2$), crossing the surface. With horizontal runs $x_1$ in air and $x_2$ in water, the travel time is $T = \dfrac{\sqrt{a^2 + x_1^2}}{v_1} + \dfrac{\sqrt{b^2 + x_2^2}}{v_2}$, and the constraint is $x_1 + x_2 = W$, the fixed horizontal separation. What do the Lagrange equations $\partial T/\partial x_1 = \lambda = \partial T/\partial x_2$ say?`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 2.3], y: [-1.25, 1.25], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ fn: '0', color: 'accent2', width: 1.6, label: 'surface', labelAt: 2.05, labelDy: -10 }, { param: ['t*1.27', '1 - t'], t: [0, 1], color: 'gold', width: 2.6 }, { param: ['1.27 + t*0.73', '-t'], t: [0, 1], color: 'gold', width: 2.6 }],
          points: [{ x: 0, y: 1, color: 'ink', label: 'source (air)', labelDx: 8, labelDy: -8 }, { x: 2, y: -1, color: 'ink', label: 'target (water)', labelDx: -90, labelDy: 12 }],
          hlines: [{ y: -1.2, color: 'ink4' }],
        },
        caption: 'A ray from a source in air to a target in water, bending toward the vertical as it enters the slower medium; drawn for water’s refractive index, 1.33. Angles are measured from the vertical.',
      },
      choices: [
        t`$\dfrac{\sin\theta_1}{v_1} = \dfrac{\sin\theta_2}{v_2}$ — Snell’s law, with $\lambda$ the common value`,
        t`$\theta_1 = \theta_2$: light goes straight across`,
        t`$v_1\sin\theta_1 = v_2\sin\theta_2$`,
        t`$x_1 = x_2$: the ray crosses the surface halfway along`,
      ],
      answer: 0,
      why: {
        1: t`That would need $v_1 = v_2$. With different speeds the two derivatives balance only with different angles.`,
        2: t`$\partial T/\partial x_1 = \dfrac{x_1}{v_1\sqrt{a^2 + x_1^2}} = \dfrac{\sin\theta_1}{v_1}$: the speed divides, it does not multiply.`,
        3: t`Only if the two media and depths were mirror images. The condition balances the angles over the speeds, not the distances.`,
      },
      hints: [t`$\dfrac{\partial T}{\partial x_1} = \dfrac{x_1}{v_1\sqrt{a^2 + x_1^2}}$. What is $\dfrac{x_1}{\sqrt{a^2 + x_1^2}}$ in terms of the angle from the vertical?`, t`It is $\sin\theta_1$; likewise for the water side.`],
      teach: 'Least time at a fixed horizontal separation is a Lagrange problem whose condition is Snell’s law.',
      explain: t`$\dfrac{\partial T}{\partial x_1} = \dfrac{\sin\theta_1}{v_1}$ and $\dfrac{\partial T}{\partial x_2} = \dfrac{\sin\theta_2}{v_2}$, so the Lagrange condition is $\dfrac{\sin\theta_1}{v_1} = \dfrac{\sin\theta_2}{v_2}$: Snell’s law, $n_1\sin\theta_1 = n_2\sin\theta_2$ with $n = c/v$. Fermat’s principle of least time is a constrained minimum, and $\lambda$ is the quantity conserved across the surface.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §4.8 Lagrange multipliers', url: 'https://openstax.org/books/calculus-volume-3/pages/4-8-lagrange-multipliers' },
  ],
});
