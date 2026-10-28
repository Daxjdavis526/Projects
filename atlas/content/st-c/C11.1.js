// Riemannian metrics on manifolds: a smoothly varying, symmetric,
// positive-definite inner product on each tangent space, chosen rather than
// induced. Lengths of curves (chart- and parameter-independent), angles and
// areas from g alone; the 2D positivity test; metrics no embedding supplies
// (the flat torus, the hyperbolic half-plane); the stereographic sphere; the
// kinetic-energy metric of a two-link arm on its configuration torus; polar
// stereographic maps of Antarctica.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const A_EARTH = 6371.0;   // km, IUGG mean radius

// the two-link arm (unit masses at the ends of unit links): g = [[3 + 2cos θ₂, 1 + cos θ₂], [1 + cos θ₂, 1]] kg m²
const armG = (th2) => [3 + 2 * Math.cos(th2), 1 + Math.cos(th2), 1];
const armPic = (th2, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric: 'arm', mode: 'chart', P: [0, r6(th2)], drag: false, readout: false, cells: 7, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C11.1',
  title: 'Riemannian metrics',
  minutes: 14, difficulty: 3,
  equation: t`L[\gamma] = \int_{\lambda_0}^{\lambda_1}\sqrt{g_{\mu\nu}\big(x(\lambda)\big)\,\dot x^\mu\dot x^\nu}\;d\lambda`,
  intro: t`A **Riemannian metric** on a manifold $M$ gives every tangent space $T_pM$ an inner product $g_p$: symmetric, $g_p(U, V) = g_p(V, U)$; **positive-definite**, $g_p(V, V) > 0$ for every $V \ne 0$; and varying smoothly with $p$. In a chart it is the matrix $g_{\mu\nu} = g(\partial_\mu, \partial_\nu)$, and the line element $ds^2 = g_{\mu\nu}\,dx^\mu dx^\nu$ is its shorthand.

In C4 the metric of a surface was *induced* — the dot product of $\mathbb R^3$ restricted to tangent planes. On a manifold there is no $\mathbb R^3$: **the metric is extra structure you choose**, and the same manifold carries many. From $g$ alone come lengths (above), angles, $\cos\alpha = g(U, V)/\sqrt{g(U, U)\,g(V, V)}$, and areas, $dA = \sqrt{\det g}\;dx^1dx^2$.`,
  symbols: [
    { tex: t`\gamma`, text: t`a curve in $M$, given in a chart as $x^\mu(\lambda)$` },
    { tex: t`\lambda`, text: 'the curve’s parameter, from λ₀ to λ₁ (any parameter: the length does not depend on the choice)' },
    { tex: t`\dot x^\mu`, text: t`$dx^\mu/d\lambda$, the components of the curve’s velocity, a tangent vector` },
    { tex: t`g_{\mu\nu}`, text: t`the metric’s components in the chart, $g(\partial_\mu, \partial_\nu)$: a symmetric, positive-definite matrix at each point` },
    { tex: t`L[\gamma]`, text: 'the length of the curve, in whatever unit the metric carries' },
  ],
  why: t`Space at one instant around a star or a black hole is a Riemannian 3-manifold whose metric no embedding hands you — the Schwarzschild spatial metric is one. Every length, area and volume GR predicts is an integral of this kind.`,
  visual: {
    type: 'dg4-chart',
    title: 'A metric is a field of ellipses',
    lead: t`Three metrics, each drawn on its own coordinate chart. At every grid point the teal ellipse is the set of small steps of **one fixed true length** — the metric’s "unit circle" there. Where an ellipse is small, a short coordinate step is already long. Drag P to read $g_{\mu\nu}$ and the curvature $K$.`,
    tasks: [
      t`Stereographic sphere: the ellipses are circles (the chart keeps angles) that grow away from the centre — far out, a chart step covers little ground. $K = 1$ everywhere, although the chart is a flat plane of numbers.`,
      t`Two-link arm: the ellipses lean — $g_{\theta_1\theta_2} \ne 0$, so the coordinate directions are not perpendicular in this geometry — and they fatten where $\theta_2 = \pm 180^\circ$ (arm folded).`,
      t`Doughnut torus: the ellipses are widest across on the inner side ($v$ near $\pm\pi$), where a turn of $u$ covers least distance. $K$ changes sign between the outer and inner sides.`,
    ],
    params: { metric: 'stereo', metrics: ['stereo', 'arm', 'torus'], mode: 'chart', readout: ['P', 'g', 'K'], cells: 8 },
    caption: t`Coordinates drawn as a plain grid of numbers. Each ellipse is every step of one fixed metric length; near a coordinate singularity they are capped at the cell size. The arm’s metric is its kinetic energy (unit masses on unit links).`,
  },
  example: {
    prompt: t`A two-link arm swings freely in a plane: a 1 kg mass at the end of a 1 m link from a fixed pivot, and a second 1 kg mass at the end of a 1 m link from the first. Its configuration space is the torus of the joint angles $(\theta_1, \theta_2)$. Show that the kinetic energy defines a Riemannian metric, $T = \tfrac12 g_{\mu\nu}\dot\theta^\mu\dot\theta^\nu$, find $g_{\mu\nu}$, check it is positive-definite, and evaluate it at $\theta_2 = 60^\circ$ with $\dot\theta = (1, -2)$ rad/s.`,
    visual: armPic(Math.PI / 3, t`The arm’s metric on the $(\theta_1, \theta_2)$ chart; P at $\theta_2 = 60^\circ$. The ellipses lean because the two joints’ motions are not independent.`),
    steps: [
      { label: 'Velocities', text: t`Mass 1 moves at $|\dot\theta_1|$ (link length 1 m). Mass 2 adds a velocity of size $|\dot\theta_1 + \dot\theta_2|$ perpendicular to link 2, which meets link 1 at angle $\theta_2$: $v_2^2 = \dot\theta_1^2 + (\dot\theta_1 + \dot\theta_2)^2 + 2\cos\theta_2\,\dot\theta_1(\dot\theta_1 + \dot\theta_2)$.` },
      { label: 'Read off g', text: t`$2T = v_1^2 + v_2^2 = (3 + 2\cos\theta_2)\dot\theta_1^2 + 2(1 + \cos\theta_2)\dot\theta_1\dot\theta_2 + \dot\theta_2^2$, so $g_{11} = 3 + 2\cos\theta_2$, $g_{12} = g_{21} = 1 + \cos\theta_2$, $g_{22} = 1$, in $\text{kg m}^2$.` },
      { label: 'Positive-definite', text: t`A symmetric $2\times2$ matrix is positive-definite exactly when $g_{11} > 0$ and $\det g > 0$. Here $g_{11} \ge 1$ and $\det g = (3 + 2c)\cdot 1 - (1 + c)^2 = 2 - c^2 \ge 1$ with $c = \cos\theta_2$. It varies smoothly: a Riemannian metric on the whole torus.` },
      { label: 'At 60 degrees', text: t`$c = \tfrac12$: $g = \begin{pmatrix} 4 & 1.5 \\ 1.5 & 1\end{pmatrix}$, $\det g = 1.75$.` },
      { label: 'Feed it the velocity', text: t`$g_{\mu\nu}\dot\theta^\mu\dot\theta^\nu = 4(1)^2 + 2(1.5)(1)(-2) + 1(-2)^2 = 2$, so $T = 1$ J. Check directly: both masses move at 1 m/s, $T = \tfrac12(1 + 1) = 1$ J ✓.` },
      { label: 'Angle', text: t`$\cos\alpha = g_{12}/\sqrt{g_{11}g_{22}} = 1.5/2$: in this geometry $\partial_{\theta_1}$ and $\partial_{\theta_2}$ meet at $41.4^\circ$, not $90^\circ$ — moving joint 1 also carries mass 2, so the two motions share kinetic energy.` },
    ],
    answer: t`$g = \begin{pmatrix} 3 + 2\cos\theta_2 & 1 + \cos\theta_2 \\ 1 + \cos\theta_2 & 1\end{pmatrix}\ \text{kg m}^2$, $\det g = 2 - \cos^2\theta_2 > 0$; at $60^\circ$, $T = 1$ J and the coordinate directions meet at $41.4^\circ$.`,
  },
  practice: [
    mcq({
      id: 'which-metric', difficulty: 1,
      prompt: t`Which line element is a Riemannian metric on the region where it is defined?`,
      visual: { type: 'ten-metric', params: { mode: 'form', T: [[1, 2], [2, 1]], tname: 'g', showU: false, showV: false, feed: false, indicatrix: true, readout: false, axes: ['dx', 'dy'] }, caption: t`The "unit circle" $g(X, X) = 1$ of $dx^2 + 4\,dx\,dy + dy^2$: hyperbolae, not an ellipse, and dashed lines where $g(X, X) = 0$.` },
      choices: [t`$ds^2 = dx^2 + x^2\,dy^2$ on $x > 0$`, t`$ds^2 = dx^2 + 4\,dx\,dy + dy^2$`, t`$ds^2 = dx^2 - dy^2$`, t`$ds^2 = (dx + dy)^2$`],
      answer: 0,
      why: {
        1: t`The matrix $\begin{pmatrix}1 & 2\\ 2 & 1\end{pmatrix}$ has $\det = -3 < 0$: some steps have negative "length squared" (the picture’s hyperbolae).`,
        2: t`That is the Lorentzian metric of C11.2: $g(\partial_y, \partial_y) = -1$, not positive.`,
        3: t`$\det = 1\cdot1 - 1^2 = 0$: the step $(1, -1)$ has zero length although it is not zero. A metric must be non-degenerate.`,
      },
      hints: [t`Write each as a symmetric matrix; the $dx\,dy$ coefficient is split between $g_{12}$ and $g_{21}$.`, t`Positive-definite in 2D: $g_{11} > 0$ and $\det g > 0$.`],
      teach: 'A Riemannian metric is symmetric and positive-definite at every point: in 2D, g₁₁ > 0 and det g > 0.',
      explain: t`$dx^2 + x^2dy^2$ has $g = \mathrm{diag}(1, x^2)$, positive for $x > 0$ — it is the flat plane in polar coordinates with $(r, \theta)$ renamed. The others fail the test: indefinite, Lorentzian, degenerate.`,
    }),
    num({
      id: 'arm-energy', difficulty: 2,
      gen(r) {
        const d2 = r.pick([0, 45, 90, 120, 150]), w1 = r.pick([1, 2, -1]), w2 = r.pick([1, -1, 2, -2]);
        const [p, q, s] = armG(d2 * DEG);
        const T = 0.5 * (p * w1 * w1 + 2 * q * w1 * w2 + s * w2 * w2);
        const noTwo = 0.5 * (p * w1 * w1 + q * w1 * w2 + s * w2 * w2), diag = 0.5 * (p * w1 * w1 + s * w2 * w2);
        return {
          prompt: t`For the two-link arm of the worked example, $g_{11} = 3 + 2\cos\theta_2$, $g_{12} = 1 + \cos\theta_2$, $g_{22} = 1$ (kg m²). At $\theta_2 = ${d2}^\circ$ the joints turn at $\dot\theta_1 = ${w1}$ rad/s and $\dot\theta_2 = ${w2}$ rad/s. What is the kinetic energy $T = \tfrac12 g_{\mu\nu}\dot\theta^\mu\dot\theta^\nu$, in joules?`,
          visual: armPic(d2 * DEG, t`The arm’s metric on its chart, P at $\theta_2 = ${d2}^\circ$.`),
          answer: T, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: noTwo, feedback: t`The sum over $\mu$ and $\nu$ has two cross terms, $g_{12}\dot\theta^1\dot\theta^2$ and $g_{21}\dot\theta^2\dot\theta^1$.` }, { value: diag, feedback: t`Keep the cross terms: the metric is not diagonal, $g_{12} = ${nice(q)}$.` }, { value: 2 * T, feedback: t`$g_{\mu\nu}\dot\theta^\mu\dot\theta^\nu$ is $2T$; halve it.` }].filter((e) => Math.abs(e.value - T) > 0.01 * Math.max(1, Math.abs(T))),
          hints: [t`At $\theta_2 = ${d2}^\circ$: $g_{11} = ${nice(p, 4)}$, $g_{12} = ${nice(q, 4)}$, $g_{22} = 1$.`, t`$g_{\mu\nu}\dot\theta^\mu\dot\theta^\nu = g_{11}\dot\theta_1^2 + 2g_{12}\dot\theta_1\dot\theta_2 + g_{22}\dot\theta_2^2$.`],
          teach: t`A metric eats a velocity twice: the squared speed is $g_{\mu\nu}\dot x^\mu\dot x^\nu$, cross terms counted twice.`,
          explain: t`$2T = ${nice(p, 4)}(${w1})^2 + 2(${nice(q, 4)})(${w1})(${w2}) + (${w2})^2 = ${nice(2 * T, 4)}$, so $T = ${nice(T, 4)}$ J. The kinetic energy is the arm’s squared speed through its configuration space, measured with this metric.`,
        };
      },
    }),
    num({
      id: 'semicircle', difficulty: 3,
      gen(r) {
        const c = r.pick([0.5, 1, 1.5, 2]);
        const R = Math.hypot(c, 1), p1 = Math.atan2(1, c);
        const L = 2 * Math.log(1 / Math.tan(p1 / 2));
        return {
          prompt: t`In the hyperbolic half-plane, $ds^2 = (dx^2 + dy^2)/y^2$, join $(-${c}, 1)$ to $(${c}, 1)$ by the arc of the circle centred at the origin through both points. How long is the arc? (On it, $x = R\cos\varphi$, $y = R\sin\varphi$.)`,
          visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [0, 2.6], equal: true, xticks: 6, yticks: 4, curves: [{ param: [`${r6(R)}*cos(t)`, `${r6(R)}*sin(t)`], t: [r6(p1), r6(Math.PI - p1)], color: 'gold', width: 2.6, label: 'arc' }, { param: ['t', '1'], t: [-c, c], color: 'ink3', width: 1.6, dash: [5, 4] }], points: [{ x: -c, y: 1, color: 'ink' }, { x: c, y: 1, color: 'ink' }] }, caption: t`The arc (gold) and the straight chord (dashed) in the half-plane chart. Coordinate lengths here mean nothing: only $ds = \sqrt{dx^2 + dy^2}/y$ does.` },
          answer: L, tol: { rel: 0.005 },
          errors: [{ value: 2 * c, feedback: t`That is the chord at $y = 1$, length $\int dx/y = ${nice(2 * c)}$ — longer than the arc, which climbs to where steps are cheaper.` }, { value: R * (Math.PI - 2 * p1), feedback: 'That is the arc’s length in the flat picture. Divide each step by y.' }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`On the arc, $\sqrt{\dot x^2 + \dot y^2} = R$ and $y = R\sin\varphi$, so $ds = d\varphi/\sin\varphi$.`, t`$\int d\varphi/\sin\varphi = \ln\tan(\varphi/2)$; the ends are at $\varphi = ${nice(p1 / DEG, 4)}^\circ$ and $${nice(180 - p1 / DEG, 4)}^\circ$.`],
          teach: 'Length comes from the metric, not the picture: in the half-plane each step is divided by its height.',
          explain: t`$L = \ln\tan(\varphi_2/2) - \ln\tan(\varphi_1/2) = 2\ln\cot(\varphi_1/2) = ${nice(L, 4)}$, shorter than the chord’s $${nice(2 * c)}$. The arc is in fact the shortest path — a geodesic of this metric (C14.1).`,
        };
      },
    }),
    num({
      id: 'stereo-scale', difficulty: 2,
      gen(r) {
        const X = r.pick([0, 0.5, 1, 1.5]), Y = r.pick([0, 0.5, 1]), dX = r.pick([0.001, 0.002, 0.005]);
        const s = (2 * A_EARTH) / (1 + X * X + Y * Y), d = s * dX;
        return {
          prompt: t`The sphere of radius $a$ in stereographic coordinates has $ds^2 = \dfrac{4a^2\,(dX^2 + dY^2)}{(1 + X^2 + Y^2)^2}$. Two points of the Earth ($a = 6371$ km) sit at $(X, Y) = (${X}, ${Y})$ and $(${X} + ${dX}, ${Y})$ on the chart. How far apart are they, in km?`,
          visual: { type: 'dg4-chart', params: { metric: 'stereo', mode: 'chart', P: [X, Y], drag: false, readout: false, cells: 8 }, caption: t`The stereographic chart of a sphere: each circle is the same true distance, so they grow outward. P is the first point.` },
          answer: d, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: (4 * A_EARTH * A_EARTH * dX) / (1 + X * X + Y * Y) ** 2, feedback: t`That is $g_{XX}\,\Delta X$; the distance is $\sqrt{g_{XX}}\,\Delta X$.` }, { value: A_EARTH * dX, feedback: 'The chart is not a scaled copy of the sphere: the factor 2/(1 + X² + Y²) varies across it.' }].filter((e) => Math.abs(e.value - d) > 0.01 * d),
          hints: [t`For a small step $\Delta s = \sqrt{g_{XX}}\,\Delta X$, with $\sqrt{g_{XX}} = 2a/(1 + X^2 + Y^2)$.`],
          teach: t`For a short step along one coordinate, the true length is $\sqrt{g_{\mu\mu}}$ (no sum) times the coordinate change.`,
          explain: t`$\sqrt{g_{XX}} = 2(6371)/(1 + ${nice(X * X + Y * Y)}) = ${nice(s, 4)}$ km per chart unit, so $\Delta s = ${nice(d, 4)}$ km. The same chart step near the centre covers more ground than far out.`,
        };
      },
    }),
    num({
      id: 'arm-angle', difficulty: 3,
      gen(r) {
        const d2 = r.pick([30, 90, 120, 135, 150]);
        const [p, q, s] = armG(d2 * DEG), ang = Math.acos(q / Math.sqrt(p * s)) / DEG;
        return {
          prompt: t`In the arm’s metric, at $\theta_2 = ${d2}^\circ$, what angle (in degrees) do the coordinate vectors $\partial_{\theta_1}$ and $\partial_{\theta_2}$ make?`,
          visual: armPic(d2 * DEG, t`The arm’s metric on its chart, P at $\theta_2 = ${d2}^\circ$; the lean of the ellipse there is the angle asked for, seen in the chart.`),
          answer: ang, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 90, feedback: 'The chart’s axes look perpendicular, but the metric decides angles: g₁₂ ≠ 0.' }, { value: Math.acos(q / p) / DEG, feedback: t`Normalize both vectors: $\cos\alpha = g_{12}/\sqrt{g_{11}g_{22}}$.` }].filter((e) => Math.abs(e.value - ang) > 0.01 * ang),
          hints: [t`$\cos\alpha = \dfrac{g(\partial_1, \partial_2)}{\sqrt{g(\partial_1, \partial_1)\,g(\partial_2, \partial_2)}} = \dfrac{g_{12}}{\sqrt{g_{11}g_{22}}}$.`, t`At $${d2}^\circ$: $g_{11} = ${nice(p, 4)}$, $g_{12} = ${nice(q, 4)}$, $g_{22} = 1$.`],
          teach: 'Angles, like lengths, come from the metric: cos α = g(U, V)/√(g(U, U) g(V, V)).',
          explain: t`$\cos\alpha = ${nice(q, 4)}/\sqrt{${nice(p, 4)}} = ${nice(Math.cos(ang * DEG), 4)}$, so $\alpha = ${nice(ang, 4)}^\circ$. ${d2 >= 90 ? 'As the arm folds, the two joint motions grow more independent and the angle opens toward 90°.' : 'With the arm nearly straight, turning joint 1 moves everything joint 2 moves, so the directions nearly agree.'}`,
        };
      },
    }),
    order({
      id: 'invariance', difficulty: 3,
      prompt: t`Show that the length $\int\sqrt{g_{\mu\nu}\dot x^\mu\dot x^\nu}\,d\lambda$ of a curve is the same in any chart. Order the steps.`,
      visual: { type: 'ten-metric', params: { mode: 'chart', chart: 'polar', space: true, segment: [[1, 0.3], [2.6, 1.6]], dragProbe: false, readout: ['seg'] }, caption: 'One curve in the polar chart (right) and in the true plane (left). Measured with the polar metric, its length is its true length in the plane; adding up coordinate differences naively is not.' },
      items: [
        t`In new coordinates $x'^\alpha(x)$, the velocity transforms with the Jacobian: $\dot x'^\alpha = \dfrac{\partial x'^\alpha}{\partial x^\mu}\dot x^\mu$.`,
        t`The metric is a (0, 2) tensor: $g_{\mu\nu} = \dfrac{\partial x'^\alpha}{\partial x^\mu}\dfrac{\partial x'^\beta}{\partial x^\nu}\,g'_{\alpha\beta}$.`,
        t`Substituting, $g_{\mu\nu}\dot x^\mu\dot x^\nu = g'_{\alpha\beta}\dot x'^\alpha\dot x'^\beta$: the integrand is a scalar.`,
        t`The same parameter $\lambda$ runs over the same interval, so the two integrals are equal.`,
        t`Changing the parameter, $\lambda = \lambda(\sigma)$, multiplies $\sqrt{\cdots}$ by $|d\lambda/d\sigma|$ and $d\lambda$ by $d\sigma/d\lambda$: the length does not depend on the parameter either.`,
      ],
      hints: ['Track what each object does under a change of chart: the velocity is a vector, the metric a (0, 2) tensor.', 'Once the integrand is shown to be a scalar, nothing else in the integral depends on the chart.'],
      teach: t`$g_{\mu\nu}\dot x^\mu\dot x^\nu$ is a scalar, so lengths are the same in every chart and for every parameterization.`,
      explain: t`The Jacobians from the two lower indices of $g$ cancel those from the two upper indices of $\dot x$. That is why a length is geometry, and why the metric must transform as a (0, 2) tensor.`,
    }),
    mcq({
      id: 'flat-torus', difficulty: 2,
      prompt: t`On the torus $S^1\times S^1$ with angles $(u, v)$, take $ds^2 = du^2 + dv^2$. Which statement is true?`,
      visual: { type: 'dg4-chart', params: { metric: 'torus', mode: 'chart', P: [1, 2.6], drag: false, readout: ['K'], cells: 8 }, caption: t`For comparison: the doughnut’s induced metric $(2 + \cos v)^2du^2 + dv^2$ on the same chart — ellipses that change with $v$, and $K \ne 0$.` },
      choices: [
        t`It is a valid Riemannian metric with $K = 0$ everywhere, though no smooth surface in $\mathbb R^3$ has it`,
        t`It is the metric of the doughnut-shaped torus in $\mathbb R^3$`,
        t`It is not a metric: a torus is curved, so $K$ cannot vanish everywhere`,
        t`It only exists once the torus is embedded in $\mathbb R^4$`,
      ],
      answer: 0,
      why: {
        1: t`The doughnut’s metric is $(R + r\cos v)^2du^2 + r^2dv^2$; its $K$ changes sign (the picture).`,
        2: t`The metric is a choice on the manifold. $du^2 + dv^2$ is symmetric, positive-definite and smooth (it is periodic), so it is a metric — and a flat one.`,
        3: t`A metric needs no embedding at all. (This one happens to be induced by the Clifford torus in $\mathbb R^4$, but that is a coincidence, not a requirement.)`,
      },
      hints: [t`Check the three conditions: symmetric, positive-definite, smooth. Nothing in them mentions $\mathbb R^3$.`, t`Every closed surface in $\mathbb R^3$ has a point farthest from the origin, where it curves like a sphere: $K > 0$ there.`],
      teach: 'A metric is chosen on the manifold, not inherited: the flat torus is a perfectly good metric that no smooth surface in ℝ³ carries.',
      explain: t`$du^2 + dv^2$ is the flat square with opposite edges glued (C8.3), so $K = 0$. A smooth closed surface in $\mathbb R^3$ always has a point with $K > 0$, so this metric cannot be induced there (only by crumpled $C^1$ embeddings, the Nash–Kuiper theorem). Space in GR is the same: its metric is not the shadow of a bigger flat space.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-antarctica', difficulty: 3, transfer: true,
      gen(r) {
        const [site, lat] = r.pick([['McMurdo Station', 77.85], ['Vostok Station', 78.46], ['Halley Research Station', 75.58], ['Mawson Station', 67.6], ['Palmer Station', 64.77]]);
        const th = (90 + lat) * DEG, rho = 1 / Math.tan(th / 2), s = (2 * A_EARTH) / (1 + rho * rho);
        return {
          prompt: t`Polar charts of Antarctica use the stereographic chart, in which the sphere of radius $a$ has $ds^2 = \dfrac{4a^2(dX^2 + dY^2)}{(1 + X^2 + Y^2)^2}$ with the South Pole at the origin. A point at colatitude $\theta$ (from the North Pole) sits at chart radius $\sqrt{X^2 + Y^2} = \cot(\theta/2)$. How many km of ground does one chart unit cover at ${site}, latitude $${lat}^\circ$S ($a = 6371$ km)?`,
          visual: { type: 'dg4-chart', params: { metric: 'stereo', mode: 'chart', P: [r6(rho), 0], drag: false, readout: false, cells: 8, view: { a: [-1.2, 1.2], b: [-0.75, 0.75] } }, caption: 'The middle of the stereographic chart: the South Pole at the origin, the station at P. Each circle is the same true distance.' },
          answer: s, units: 'km', tol: { rel: 0.003 },
          errors: [{ value: 2 * A_EARTH, feedback: t`That is the scale at the pole itself. At the station, divide by $1 + X^2 + Y^2$.` }, { value: (2 * A_EARTH) / (1 + Math.tan(th / 2) ** 2), feedback: t`The chart radius is $\cot(\theta/2)$ for projection from the North Pole, not $\tan(\theta/2)$.` }].filter((e) => Math.abs(e.value - s) > 0.002 * s),
          hints: [t`$\theta = 90^\circ + ${lat}^\circ$, so the chart radius is $\cot(${nice((90 + lat) / 2, 4)}^\circ) = ${nice(rho, 4)}$.`, t`One chart unit covers $\sqrt{g_{XX}} = 2a/(1 + X^2 + Y^2)$.`],
          teach: t`A chart’s scale is read from its metric: $\sqrt{g_{XX}}$ is the true distance per unit of coordinate.`,
          explain: t`$2(6371)/(1 + ${nice(rho, 4)}^2) = ${nice(s, 5)}$ km, against $12\,742$ km at the pole: a $${nice(100 * (1 - s / (2 * A_EARTH)), 3)}\%$ change in scale over the chart, in every direction alike (the chart keeps angles, which is why navigators like it). Real polar maps project onto a plane through the pole or a standard parallel, which only rescales $X$ and $Y$.`,
        };
      },
    }),
    num({
      id: 'cp-arm-path', difficulty: 3,
      gen(r) {
        const end = r.pick([60, 90, 120]);
        const T = end * DEG, f = (x) => Math.sqrt(6 + 4 * Math.cos(x));
        let L = 0; const n = 2000;
        for (let i = 0; i < n; i++) { const x0 = (T * i) / n, x1 = (T * (i + 1)) / n; L += ((x1 - x0) / 6) * (f(x0) + 4 * f((x0 + x1) / 2) + f(x1)); }
        return {
          prompt: t`The arm moves from straight, $(\theta_1, \theta_2) = (0, 0)$, to $(${end}^\circ, ${end}^\circ)$ along the path $\theta_1 = \theta_2 = s$. How long is this path in the arm’s metric (unit $\sqrt{\text{kg}}\;\text{m}$)? Evaluate the integral numerically.`,
          visual: { type: 'dg4-chart', params: { metric: 'arm', mode: 'chart', P: [0, 0], drag: false, readout: false, cells: 7, curves: [{ pts: Array.from({ length: 41 }, (_, i) => [r6((T * i) / 40), r6((T * i) / 40)]), color: 'gold', width: 2.6 }] }, caption: 'The path (gold) on the arm’s configuration chart, from P (arm straight) along the diagonal.' },
          answer: L, tol: { rel: 0.005 },
          integrand: 'sqrt(6 + 4cos(s))', limits: [0, r6(T)], vars: { s: [0, 2] },
          errors: [{ value: Math.SQRT2 * T, feedback: t`That measures the path with the flat metric $d\theta_1^2 + d\theta_2^2$. Use the arm’s $g$.` }, { value: T * Math.sqrt(10), feedback: t`$g$ changes along the path: $\cos\theta_2$ is not 1 all the way.` }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`With $\dot\theta = (1, 1)$: $g_{\mu\nu}\dot\theta^\mu\dot\theta^\nu = g_{11} + 2g_{12} + g_{22} = 6 + 4\cos s$.`, t`$L = \int_0^{${nice(T, 4)}}\sqrt{6 + 4\cos s}\,ds$, by Simpson’s rule or a calculator.`],
          teach: t`The length of a curve is the integral of $\sqrt{g_{\mu\nu}\dot x^\mu\dot x^\nu}$, with $g$ evaluated along the curve.`,
          explain: t`$L = \int_0^{${end}^\circ}\sqrt{6 + 4\cos s}\,ds = ${nice(L, 4)}$. Physically, $L^2/(2\Delta t^2)$ is the least kinetic energy with which the arm can make this exact motion in time $\Delta t$ at steady speed along the path.`,
        };
      },
    }),
    expr({
      id: 'cp-horocyclic', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        return {
          prompt: t`In the hyperbolic half-plane, $ds^2 = (dx^2 + dy^2)/y^2$, change coordinates to $x = ${k === 1 ? '' : k}u$, $y = e^v$. Find $g_{uu}$ in the new chart.`,
          visual: { type: 'dg4-chart', params: { metric: 'halfplane', mode: 'chart', P: [0, 1], drag: false, readout: false, cells: 8, lines: [0.5, 1, 2].map((y) => ({ b: y, color: 'violet', dash: [5, 4] })) }, caption: t`The half-plane chart with three lines of constant $v$ (violet, at $y = e^v$ for $v = -0.69$, 0, 0.69). Along each, a unit of $u$ is a shorter true step the higher it sits.` },
          answer: `${k * k}*e^(-2*v)`, answerTeX: t`${k * k === 1 ? '' : k * k}e^{-2v}`, lhs: t`g_{uu}`,
          vars: { v: [-1, 1] },
          errors: [{ answer: `${k}*e^(-v)`, feedback: t`That is $\sqrt{g_{uu}}$, the length of $\partial_u$; the metric component is its square.` }, { answer: `${k * k}*e^(2*v)`, feedback: t`$g$ has $1/y^2 = e^{-2v}$ in it, not $y^2$.` }],
          hints: [t`$dx = ${k === 1 ? '' : k}\,du$ and $dy = e^v\,dv$.`, t`$ds^2 = \dfrac{${k * k === 1 ? '' : k * k}\,du^2 + e^{2v}dv^2}{e^{2v}}$.`],
          teach: t`To change coordinates, substitute $dx^\mu = (\partial x^\mu/\partial u^\alpha)\,du^\alpha$ into $ds^2$.`,
          explain: t`$ds^2 = ${k * k === 1 ? '' : k * k}e^{-2v}\,du^2 + dv^2$. The same hyperbolic plane now looks like a line $v$ times circles shrinking as $e^{-v}$ — the shape the space slices of de Sitter spacetime take in C11.3, with time in place of $v$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §2.5 (the metric) and §3.1', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Lee, Introduction to Riemannian Manifolds, ch. 2', url: 'https://link.springer.com/book/10.1007/978-3-319-91755-9' },
    { label: 'Needham, Visual Differential Geometry and Forms, Act II', url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms' },
  ],
});
