// Parameterized curves: a curve is a map, not its trace; velocity, regularity,
// singular points (cusps), self-intersections; the worldline seed.
import { lesson, mcq, multi, num, expr, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;

// a static picture of a plane curve (x(t), y(t)) on t ∈ T
const trace = (px, py, T, x, y, { points = [], arrows = [], caption, extra = [], equal = false } = {}) => ({
  type: 'graph',
  params: { x, y, equal, aspect: 'wide', curves: [{ param: [px, py], t: T, color: 'accent', width: 2.4 }, ...extra], points, arrows },
  caption,
});

export default lesson({
  id: 'st-c.C1.1',
  title: 'Parameterized curves',
  minutes: 11, difficulty: 3,
  intro: t`Differential geometry starts with a sharper definition of “curve”. A **parameterized curve** is a smooth map $\alpha: I \to \mathbb R^n$ from an interval of the real line: to each parameter value $t$ it assigns a point. The set of points it passes through — the **trace** — is not the curve; two different maps can draw the same trace, and one map can pass through a point twice. What calculus can see is the velocity

$$\alpha'(t) = \lim_{h\to0}\frac{\alpha(t+h) - \alpha(t)}{h},$$

and the curve is **regular** if $\alpha'(t) \ne 0$ for every $t$. Where the velocity vanishes the curve may stop, turn round and leave a cusp, and nothing in the rest of this course — tangent line, arc length, curvature — is defined there.`,
  symbols: [
    { tex: t`\alpha`, text: t`the curve: a map that takes a parameter value to a point of $\mathbb R^2$ or $\mathbb R^3$` },
    { tex: 't', text: t`the parameter — a time, an angle, any label; it runs over an interval $I$` },
    { tex: t`\alpha(t) = (x(t), y(t), z(t))`, text: 'the point reached at parameter t; its components are smooth (infinitely differentiable) functions' },
    { tex: t`\alpha'(t)`, text: t`the velocity (tangent vector) at $t$, in units of length per unit of $t$` },
    { tex: t`|\alpha'(t)|`, text: 'the speed: how fast the point moves through space per unit of parameter' },
  ],
  why: t`A particle’s history in relativity is exactly this: a worldline $x^\mu(\lambda)$, a map from a parameter into spacetime. The physics must not depend on the label $\lambda$ — which is why the next lesson finds the parameter a curve chooses for itself.`,
  visual: {
    type: 'calc-polar',
    title: 'Where the velocity vanishes',
    lead: t`Four curves, each with its velocity $\alpha'(t)$ drawn at the point (green arrow, half length) and the speed read out below. Slide the parameter and watch the arrow: wherever it shrinks to nothing, the trace may do something a smooth curve cannot.`,
    tasks: [
      t`Cycloid: slide $t$ to $2\pi$. The point on the rim touches the ground, its speed falls to 0, and the trace has a cusp.`,
      t`Slow line: the trace is the straight line $y = x$, yet at $t = 0$ the speed is 0. Regularity belongs to the map, not to the picture.`,
      t`Nodal cubic: find the two parameter values that land on the origin. One point, two velocities — the curve is a map.`,
    ],
    params: {
      grid: 'cartesian', aspect: 'wide',
      presetLabel: 'Curve',
      presetExplain: 'Each choice is a different map t ↦ α(t).',
      presets: [
        {
          label: 'Cycloid', show: ['tc'], x: [-0.8, 13.4], y: [-0.6, 3.4],
          curves: [{ param: ['t - sin(t)', '1 - cos(t)'], t: [0, '4*pi'], color: 'accent', width: 2.4 }, { param: ['tc + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.2, dash: true }],
          segments: [{ from: ['tc', 1], to: ['tc - sin(tc)', '1 - cos(tc)'], color: 'ink3' }],
          tangents: [{ param: ['t - sin(t)', '1 - cos(t)'], at: 'tc', velocity: 0.5, line: false, velocityLabel: 'α′/2' }],
        },
        {
          label: 'Cusp (t², t³)', show: ['tk'], x: [-0.6, 2.4], y: [-2.6, 2.6],
          curves: [{ param: ['t^2', 't^3'], t: [-1.4, 1.4], color: 'accent', width: 2.4 }],
          tangents: [{ param: ['t^2', 't^3'], at: 'tk', velocity: 0.5, line: false, velocityLabel: 'α′/2' }],
        },
        {
          label: 'Slow line (t³, t³)', show: ['tk'], x: [-3, 3], y: [-3, 3],
          curves: [{ param: ['t^3', 't^3'], t: [-1.4, 1.4], color: 'accent', width: 2.4 }],
          tangents: [{ param: ['t^3', 't^3'], at: 'tk', velocity: 0.5, line: false, velocityLabel: 'α′/2' }],
        },
        {
          label: 'Nodal cubic', show: ['tk'], x: [-1.4, 1.2], y: [-1.1, 1.1],
          curves: [{ param: ['t^2 - 1', 't^3 - t'], t: [-1.4, 1.4], color: 'accent', width: 2.4 }],
          tangents: [{ param: ['t^2 - 1', 't^3 - t'], at: 'tk', velocity: 0.5, line: false, velocityLabel: 'α′/2' }],
        },
      ],
      sliders: [
        { key: 'tc', label: 'parameter $t$', min: 0, max: 12.56, step: 0.01, value: 2, explain: 'The angle the wheel has turned through, in radians.' },
        { key: 'tk', label: 'parameter $t$', min: -1.4, max: 1.4, step: 0.01, value: 0.8, explain: 'The parameter value whose point is marked.' },
      ],
      readouts: [{ label: t`speed $|\alpha'(t)|$`, expr: 'speed', digits: 3 }],
    },
    caption: t`Velocity arrows are drawn at half length, to the scale of the axes. The cycloid is traced by a point on the rim of a wheel of radius 1 (dashed) rolling along the $x$-axis.`,
  },
  example: {
    prompt: t`A wheel of radius $R$ rolls without slipping along the $x$-axis. A point on its rim traces the cycloid $\alpha(t) = \big(R(t - \sin t),\ R(1 - \cos t)\big)$, where $t$ is the angle the wheel has turned. Find the speed $|\alpha'(t)|$, and the parameter values where $\alpha$ fails to be regular. What does the trace do there?`,
    visual: trace('t - sin(t)', '1 - cos(t)', [0, '4*pi'], [-0.8, 13.4], [-0.6, 3.4], {
      extra: [{ param: ['2 + cos(t)', '1 + sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.2, dash: true }],
      points: [{ x: r6(2 - Math.sin(2)), y: r6(1 - Math.cos(2)), color: 'gold', label: 't = 2' }, { x: r6(2 * Math.PI), y: 0, color: 'bad', label: 'cusp', labelDy: 14, labelDx: 6 }],
      caption: t`The cycloid with $R = 1$, and the wheel at $t = 2$. The axes share one scale.`, equal: true,
    }),
    steps: [
      { label: 'Differentiate', text: t`$\alpha'(t) = \big(R(1 - \cos t),\ R\sin t\big)$ — each component separately.` },
      { label: 'Speed', text: t`$|\alpha'(t)|^2 = R^2\big[(1-\cos t)^2 + \sin^2 t\big] = R^2(2 - 2\cos t) = 4R^2\sin^2\tfrac t2$, using $1 - \cos t = 2\sin^2\tfrac t2$. So $|\alpha'(t)| = 2R\,\big|\sin\tfrac t2\big|$.` },
      { label: 'Where it vanishes', text: t`$\sin\tfrac t2 = 0$ exactly at $t = 0, \pm2\pi, \pm4\pi, \dots$ — once per turn of the wheel, when the point is on the ground. The cycloid is regular everywhere else.` },
      { label: 'What the trace does', text: t`Write $\alpha'(t) = 2R\sin\tfrac t2\,\big(\sin\tfrac t2,\ \cos\tfrac t2\big)$. Just before $t = 2\pi$ the direction is close to $(0, -1)$, straight down; just after, the factor $\sin\tfrac t2$ has changed sign and the direction is close to $(0, +1)$. The point comes down vertically, stops, and goes back up: a **cusp**.` },
      { label: 'Sense check', text: t`Rolling without slipping means the contact point is momentarily at rest — speed 0 at $t = 2\pi k$ ✓. At the top, $t = \pi$, the speed is $2R$ per radian, twice the hub’s $R$ per radian ✓.` },
    ],
    answer: t`$|\alpha'(t)| = 2R\,|\sin(t/2)|$; the cycloid is singular at $t = 2\pi k$, where the rim touches the ground and the trace has cusps.`,
  },
  practice: [
    mcq({
      id: 'which-regular', difficulty: 2,
      prompt: t`Which of these parameterizations is regular for every $t \in \mathbb R$?`,
      visual: trace('t^3 + t', 't^2', [-1.3, 1.3], [-3.6, 3.6], [-0.4, 1.9], {
        extra: [{ param: ['t^3', 't^3'], t: [-1.2, 1.2], color: 'gold', width: 2 }],
        caption: t`Two traces that both look perfectly smooth: $(t^3 + t,\ t^2)$ in blue and $(t^3,\ t^3)$ in gold. Smoothness of the picture is not the test.`,
      }),
      choices: [t`$(t^3 + t,\ t^2)$`, t`$(t^3,\ t^3)$`, t`$(t^2,\ t^3)$`, t`$(\cos^3 t,\ \sin^3 t)$`],
      answer: 0,
      why: {
        1: t`Its trace is the straight line $y = x$, but $\alpha'(t) = (3t^2, 3t^2)$ vanishes at $t = 0$. Regularity is a property of the map, and this map stops dead at the origin.`,
        2: t`$\alpha'(t) = (2t, 3t^2)$ vanishes at $t = 0$, where the trace $y^2 = x^3$ has a cusp.`,
        3: t`This is the astroid: $\alpha'(t) = (-3\cos^2t\sin t,\ 3\sin^2t\cos t)$ vanishes at every multiple of $\pi/2$, at its four cusps.`,
      },
      hints: [t`Differentiate each one and ask whether both components can vanish at the same $t$.`, t`For $(t^3 + t, t^2)$ the first component of the velocity is $3t^2 + 1$.`],
      teach: t`A curve is regular when its velocity never vanishes; check the derivative, not the look of the trace.`,
      explain: t`$\alpha'(t) = (3t^2 + 1,\ 2t)$, and $3t^2 + 1 \ge 1$, so the velocity is never zero. Each of the others has a parameter value where every component of the velocity vanishes.`,
    }),
    num({
      id: 'ellipse-speed', difficulty: 1,
      gen(r) {
        const a = r.int(2, 5), b = r.intExcept(1, 4, [a]);
        const [t0, tt] = r.pick([[Math.PI / 6, t`\pi/6`], [Math.PI / 4, t`\pi/4`], [Math.PI / 3, t`\pi/3`], [2 * Math.PI / 3, t`2\pi/3`]]);
        const sp = Math.hypot(a * Math.sin(t0), b * Math.cos(t0));
        const p = [a * Math.cos(t0), b * Math.sin(t0)], d = [-a * Math.sin(t0), b * Math.cos(t0)], L = Math.hypot(...d);
        return {
          prompt: t`For the ellipse $\alpha(t) = (${a}\cos t,\ ${b}\sin t)$, find the speed $|\alpha'(t)|$ at $t = ${tt}$, to 3 significant figures.`,
          visual: trace(`${a}*cos(t)`, `${b}*sin(t)`, [0, '2*pi'], [-a - 1, a + 1], [-b - 1, b + 1], {
            points: [{ x: r6(p[0]), y: r6(p[1]), color: 'gold', label: 'P' }],
            arrows: [{ from: p.map(r6), to: [r6(p[0] + d[0] / L), r6(p[1] + d[1] / L)], color: 'good', label: 'direction of α′' }],
            caption: t`The ellipse and the direction of the velocity at the point (a unit arrow — direction only).`,
          }),
          answer: sp, tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(a * Math.cos(t0), b * Math.sin(t0)), feedback: t`That is $|\alpha(t)|$, the distance from the centre. The speed is the length of the derivative $\alpha'(t) = (-${a}\sin t,\ ${b}\cos t)$.` }].filter((e) => Math.abs(e.value - sp) > 0.02 * sp),
          hints: [t`$\alpha'(t) = (-${a}\sin t,\ ${b}\cos t)$.`, t`$|\alpha'(t)| = \sqrt{${a * a}\sin^2 t + ${b * b}\cos^2 t}$.`],
          teach: t`The speed of a parameterized curve is the length of its velocity vector, $|\alpha'(t)|$.`,
          explain: t`$|\alpha'(${tt})| = \sqrt{${a * a}\sin^2(${tt}) + ${b * b}\cos^2(${tt})} = ${nice(sp, 4)}$. The parameter $t$ is not an angle the point sweeps at constant rate, and the speed varies around the ellipse between ${Math.min(a, b)} and ${Math.max(a, b)}.`,
        };
      },
    }),
    num({
      id: 'singular-t', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, -1, -2, 1.5, -1.5]);
        const T = [r6(c - 1.6), r6(c + 1.6)];
        const X = `t^2 - (${2 * c})*t`, Y = `t^3 - ${3 * c * c}*t`;
        const xs = [], ys = [];
        for (let k = 0; k <= 60; k++) { const s = T[0] + ((T[1] - T[0]) * k) / 60; xs.push(s * s - 2 * c * s); ys.push(s ** 3 - 3 * c * c * s); }
        const pad = (v) => [Math.floor(Math.min(...v) - 0.6), Math.ceil(Math.max(...v) + 0.6)];
        return {
          prompt: t`At which parameter value is $\alpha(t) = \big(t^2 ${c < 0 ? '+' : '-'} ${nice(Math.abs(2 * c))}t,\ t^3 - ${nice(3 * c * c)}t\big)$ not regular?`,
          visual: trace(X, Y, T, pad(xs), pad(ys), { caption: t`The trace for $${T[0]} \le t \le ${T[1]}$. It has one cusp; finding the parameter value that lands on it is the question.` }),
          answer: c, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -c, feedback: t`At $t = ${-c}$ only the second component of the velocity vanishes; the first is $2t ${c < 0 ? '+' : '-'} ${nice(Math.abs(2 * c))} \ne 0$ there. Regularity fails only where **every** component vanishes.` }],
          hints: [t`Differentiate: $\alpha'(t) = \big(2t ${c < 0 ? '+' : '-'} ${nice(Math.abs(2 * c))},\ 3t^2 - ${nice(3 * c * c)}\big)$.`, t`The first component vanishes only at $t = ${c}$. Does the second vanish there too?`],
          teach: t`A curve is singular where the whole velocity vector is zero — all components at once.`,
          explain: t`$x'(t) = 0$ only at $t = ${c}$, and $y'(${c}) = 3(${c})^2 - ${nice(3 * c * c)} = 0$ as well, so $\alpha'(${c}) = 0$. The trace has its cusp at $\alpha(${c}) = (${nice(-c * c)}, ${nice(-2 * c ** 3)})$.`,
        };
      },
    }),
    multi({
      id: 'same-trace', difficulty: 2,
      prompt: t`Compare $\alpha(t) = (\cos t, \sin t)$, $\beta(t) = (\cos 2t, \sin 2t)$ and $\gamma(t) = (\cos t, -\sin t)$, each for $0 \le t \le 2\pi$. Select every true statement.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.2, 2.6], y: [-1.6, 2.4], equal: true, aspect: 'wide',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 2 }],
          arrows: [{ from: [1, 0], to: [1, 2], color: 'gold', width: 2, label: 'β′(0)' }, { from: [1, 0], to: [1, 1], color: 'accent', width: 3, label: 'α′(0)', labelDx: -60 }, { from: [1, 0], to: [1, -1], color: 'violet', label: 'γ′(0)' }],
          points: [{ x: 1, y: 0, color: 'ink', label: '' }],
        },
        caption: t`The common trace, and the three velocities at $t = 0$, to scale.`,
      },
      choices: [
        'All three have the same trace, the unit circle',
        t`$\alpha$ and $\beta$ are the same parameterized curve`,
        t`$\beta$ goes round the circle twice`,
        t`$\gamma$ moves at a different speed from $\alpha$`,
        t`$\gamma$ goes round in the opposite direction to $\alpha$`,
      ],
      answer: [0, 2, 4],
      why: {
        1: t`Same trace, different maps: $\beta$ moves twice as fast, $|\beta'| = 2$, and laps the circle twice. A parameterized curve is the map.`,
        3: t`$|\gamma'(t)| = |(-\sin t, -\cos t)| = 1$, the same as $|\alpha'|$; only the direction of travel differs.`,
      },
      hints: ['Compute each velocity and its length.', t`Where is each curve at $t = \pi$?`],
      teach: 'The trace forgets speed, direction and how many times a point is visited; the parameterized curve remembers all three.',
      explain: t`All three trace the unit circle. $|\alpha'| = |\gamma'| = 1$ and $|\beta'| = 2$; $\beta$ covers $2\pi \cdot 2$ of angle, so it laps twice; $\gamma$ runs clockwise. Speed, orientation and multiplicity are all invisible in the trace.`,
    }),
    expr({
      id: 'tangent-line', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1, -2]);
        const P = [a * a, a ** 3];
        return {
          prompt: t`Find the tangent line to $\alpha(t) = (t^2, t^3)$ at $t = ${a}$, as an equation in $x$ and $y$.`,
          visual: trace('t^2', 't^3', [-2.2, 2.2], [-0.5, 5], [-9.5, 9.5], { points: [{ x: P[0], y: P[1], color: 'gold', label: `t = ${a}` }], caption: t`The cusp $y^2 = x^3$ and the point at $t = ${a}$. The axes have different scales.` }),
          answer: `${3 * a}x - 2y = ${a ** 3}`, mode: 'equation', vars: { x: [-3, 3], y: [-3, 3] },
          answerTeX: t`${3 * a}x - 2y = ${a ** 3}`,
          errors: [{ answer: `2x + ${3 * a}y = ${2 * a * a + 3 * a ** 4}`, feedback: t`That line is perpendicular to the velocity — the normal line. The tangent line runs *along* $\alpha'(${a}) = (${2 * a}, ${3 * a * a})$.` }],
          hints: [t`The point is $\alpha(${a}) = (${P[0]}, ${P[1]})$ and the velocity is $\alpha'(${a}) = (2t, 3t^2) = (${2 * a}, ${3 * a * a})$.`, t`A line through $(x_0, y_0)$ along $(p, q)$ is $q(x - x_0) - p(y - y_0) = 0$.`],
          teach: t`At a regular point the tangent line passes through $\alpha(t_0)$ along $\alpha'(t_0)$.`,
          explain: t`$${3 * a * a}(x - ${P[0]}) - ${2 * a}(y - ${P[1]}) = 0$; dividing by $${a}$, $\;${3 * a}x - 2y = ${a ** 3}$. At $t = 0$ there is no tangent line from this recipe: $\alpha'(0) = 0$.`,
        };
      },
    }),
    order({
      id: 'sphere-proof', difficulty: 3,
      prompt: t`Prove: if a curve $\alpha(t)$ lies on the sphere $|\mathbf x| = R$, then its velocity is perpendicular to its position vector at every $t$. Put the steps in order.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2.5, grid: false,
          spheres: [{ centre: [0, 0, 0], radius: 2, color: 'ink3' }],
          curves: [{ param: ['1 + cos(t)', 'sin(t)', '2*sin(t/2)'], t: [0, '4*pi'], color: 'accent', width: 2.2, samples: 200 }],
          vectors: [
            { to: [r6(1 + Math.cos(2.5)), r6(Math.sin(2.5)), r6(2 * Math.sin(1.25))], color: 'ink2', label: t`\alpha` },
            { from: [r6(1 + Math.cos(2.5)), r6(Math.sin(2.5)), r6(2 * Math.sin(1.25))], to: [r6(1 + Math.cos(2.5) - Math.sin(2.5)), r6(Math.sin(2.5) + Math.cos(2.5)), r6(2 * Math.sin(1.25) + Math.cos(1.25))], color: 'good', label: t`\alpha'` },
          ],
        },
        caption: t`Viviani’s curve $(1 + \cos t,\ \sin t,\ 2\sin\tfrac t2)$ on the sphere of radius 2 (three great circles drawn), with its position and velocity at $t = 2.5$.`,
      },
      items: [
        t`On the sphere, $\alpha(t)\cdot\alpha(t) = R^2$ for every $t$.`,
        t`Differentiate both sides: $\alpha'(t)\cdot\alpha(t) + \alpha(t)\cdot\alpha'(t) = 0$.`,
        t`The dot product is symmetric, so $2\,\alpha(t)\cdot\alpha'(t) = 0$.`,
        t`Hence $\alpha'(t) \perp \alpha(t)$: the velocity is tangent to the sphere.`,
      ],
      hints: ['Start from what “lies on the sphere” says as an equation.', 'The product rule works for dot products: (a·b)′ = a′·b + a·b′.'],
      teach: 'Differentiating a constraint that holds for all t gives a statement about the velocity — the standard first move in curve proofs.',
      explain: t`A constant has zero derivative; the product rule for dot products turns $|\alpha|^2 = R^2$ into $\alpha\cdot\alpha' = 0$. The same move shows that a unit vector is perpendicular to its own derivative — the fact behind the Frenet frame in module C2.`,
    }),
    num({
      id: 'node-angle', difficulty: 3,
      gen(r) {
        const c = r.pick([0.5, 2, 3, 1.5]);
        const cosA = (c * c - 1) / (c * c + 1), ang = Math.acos(cosA) / DEG;
        const T = 1.3 * c;
        return {
          prompt: t`The curve $\alpha(t) = \big(t^2 - ${nice(c * c)},\ t^3 - ${nice(c * c)}\,t\big)$ passes through the origin twice. Find the angle between its two velocity vectors there, in degrees.`,
          visual: trace(`t^2 - ${c * c}`, `t^3 - ${c * c}*t`, [-T, T], [r6(-1.15 * c * c), r6(0.85 * c * c)], [r6(-1.05 * c ** 3), r6(1.05 * c ** 3)], {
            points: [{ x: 0, y: 0, color: 'gold', label: 'visited twice' }],
            caption: t`A nodal cubic. The axes have different scales, so angles in the picture are distorted — compute them.`,
          }),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 180 - ang, feedback: 'That is the supplementary angle — the other angle between the two tangent lines. The velocities point in definite directions: compute their dot product.' }],
          hints: [t`$\alpha(t) = 0$ when $t^2 = ${nice(c * c)}$: at $t = \pm${nice(c)}$.`, t`$\alpha'(t) = (2t,\ 3t^2 - ${nice(c * c)})$, so the velocities there are $(\pm${nice(2 * c)},\ ${nice(2 * c * c)})$.`, t`$\cos\varphi = \dfrac{\mathbf a\cdot\mathbf b}{|\mathbf a||\mathbf b|}$.`],
          teach: 'At a self-intersection a curve has two velocities at one point — one for each parameter value.',
          explain: t`$\cos\varphi = \dfrac{-${nice(4 * c * c)} + ${nice(4 * c ** 4)}}{${nice(4 * c * c)} + ${nice(4 * c ** 4)}} = ${nice(cosA, 4)}$, so $\varphi = ${nice(ang, 4)}^\circ$. A trace has no single tangent line at a crossing; the map has one at each passage.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rover', difficulty: 2, transfer: true,
      gen(r) {
        const th = r.pick([60, 90, 120, 150, 45]);
        const v = 4.2, sp = 2 * v * Math.sin((th * DEG) / 2);
        return {
          prompt: t`Perseverance’s wheels are 52.5 cm across, and on flat ground it drives at about $${v}\ \text{cm/s}$. A pebble jammed in a tread rides the cycloid traced by a point on the rim. What is the pebble’s speed when the wheel has turned $${th}^\circ$ since the pebble left the ground?`,
          visual: trace('t - sin(t)', '1 - cos(t)', [0, '2*pi'], [-0.6, 7], [-0.4, 2.6], {
            extra: [{ param: [`${r6(th * DEG)} + cos(t)`, '1 + sin(t)'], t: [0, '2*pi'], color: 'ink3', width: 1.2, dash: true }],
            points: [{ x: r6(th * DEG - Math.sin(th * DEG)), y: r6(1 - Math.cos(th * DEG)), color: 'gold', label: 'pebble' }, { x: r6(th * DEG), y: 1, color: 'ink3', label: 'hub', labelDx: 6 }],
            caption: t`The wheel (dashed) and the pebble’s cycloid, in units of the wheel’s radius, 26.25 cm.`, equal: true,
          }),
          answer: sp, units: 'cm/s', tol: { rel: 0.01 },
          errors: [{ value: v, feedback: 'That is the hub’s speed. A point on the rim also turns about the hub; add the two velocities, or use the cycloid’s speed formula.' }, { value: v * Math.sin((th * DEG) / 2), feedback: t`You dropped the factor 2: $|\alpha'(t)| = 2R|\sin\tfrac t2|$, and the hub moves at $R$ per radian.` }].filter((e) => Math.abs(e.value - sp) > 0.02 * sp),
          hints: [t`With $\alpha(t) = R(t - \sin t,\ 1 - \cos t)$, the speed is $|\alpha'(t)| = 2R|\sin\tfrac t2|$ per radian of turn.`, t`The hub moves $R$ per radian, at $${v}\ \text{cm/s}$; so the pebble’s speed is $${v}\times 2|\sin\tfrac t2|$ cm/s.`],
          teach: t`A rolling point’s speed is $2|\sin\tfrac t2|$ times the hub’s: zero at the ground, double at the top.`,
          explain: t`$|\dot\alpha| = 2 \times ${v} \times \sin ${th / 2}^\circ = ${nice(sp, 3)}$ cm/s. The wheel size cancels: it sets how much time a radian takes, not the ratio of speeds.`,
        };
      },
    }),
    mcq({
      id: 'cp-worldline', difficulty: 3,
      prompt: t`A particle sits at $x = 0$. Someone writes its worldline as $\big(t(\lambda), x(\lambda)\big) = (\lambda^3,\ 0)$ for $\lambda \in \mathbb R$. Is this a regular parameterization?`,
      visual: {
        type: 'graph',
        params: {
          x: [-1, 1], y: [-1.9, 1.9], aspect: 'wide', xlabel: 'x', ylabel: 't',
          curves: [{ param: ['0', 't'], t: [-1.9, 1.9], color: 'accent', width: 2 }],
          points: [-1.2, -1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1, 1.2].map((l) => ({ x: 0, y: r6(l ** 3), color: 'gold', r: 3.5 })),
        },
        caption: t`The worldline, with the events at $\lambda = -1.2, -1.0, \dots, 1.2$ in equal steps. Near $\lambda = 0$ the marks crowd together.`,
      },
      choices: [
        t`No: $dx^\mu/d\lambda = (3\lambda^2, 0)$ vanishes at $\lambda = 0$, although the worldline itself is a perfectly good straight line`,
        t`Yes: its trace is a straight line, so any parameterization of it is regular`,
        t`No: a particle at rest has no worldline to parameterize`,
        t`Yes: $t = \lambda^3$ increases steadily, so the parameter is a valid label`,
      ],
      answer: 0,
      why: {
        1: 'Regularity belongs to the map, not to its trace: this map stops at λ = 0 even though the line does not.',
        2: 'A particle at rest still moves through time: its worldline is the vertical line x = 0.',
        3: t`$\lambda^3$ is increasing, but its derivative is zero at $\lambda = 0$. A label is a good parameter only if it never stalls.`,
      },
      hints: [t`Differentiate $x^\mu(\lambda)$ with respect to $\lambda$.`, 'Regular means the velocity is never the zero vector.'],
      teach: 'A parameterization can be singular on a perfectly smooth trace; regularity is about the map.',
      explain: t`The tangent $(3\lambda^2, 0)$ is zero at $\lambda = 0$. Reparameterizing by $\sigma = \lambda^3$ gives $(\sigma, 0)$, which is regular — but $\lambda \mapsto \lambda^3$ is not an allowed change of parameter, since its inverse is not differentiable at 0. The next lesson says exactly which changes are allowed.`,
    }),
    num({
      id: 'cp-singular', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3, -1, -2]);
        const k = 3 - c * c, m = c ** 3;
        const T = [c - 1.5, c + 1.5];
        const sg = (v) => (v < 0 ? `- ${nice(-v)}` : `+ ${nice(v)}`);
        return {
          prompt: t`At which parameter value is $\alpha(t) = \big(t^2 ${sg(-2 * c)}t ${sg(3)},\ t^3 ${sg(-3 * c)}t^2 ${sg(3 * c * c)}t\big)$ not regular?`,
          visual: trace(`t^2 - (${2 * c})*t + 3`, `t^3 - (${3 * c})*t^2 + ${3 * c * c}*t`, T, [r6(k - 0.6), r6(k + 2.9)], [r6(m - 3.8), r6(m + 3.8)], { caption: 'The trace near its one cusp.' }),
          answer: c, tol: { rel: 0, abs: 0.01 },
          hints: [t`$\alpha'(t) = \big(2t ${sg(-2 * c)},\ 3t^2 ${sg(-6 * c)}t ${sg(3 * c * c)}\big)$.`],
          teach: 'Find where every component of the velocity vanishes at once.',
          explain: t`$\alpha'(t) = \big(2(t - ${c}),\ 3(t - ${c})^2\big)$, which vanishes only at $t = ${c}$. With $s = t - ${c}$ the curve is $(s^2, s^3)$ shifted — the standard cusp.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §1-2 and §1-3', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), ch. 1', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
