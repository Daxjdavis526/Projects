// Smooth manifolds: Hausdorff, second countable, with an atlas whose
// transition maps are C^∞. Smooth functions are those smooth in every chart —
// well defined because transitions are smooth. Compatibility both ways (x and
// x³ are each fine charts on ℝ but not compatible), Jacobians of transition
// maps, non-examples (figure eight, double cone, line with two origins), and
// Euler angles on the rotation group degenerating at gimbal lock.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);
const PI = r6(Math.PI);
const DEG = Math.PI / 180;
const SEL = (k) => `step(0.5 - abs(m - ${k}))`;

export default lesson({
  id: 'st-c.C8.2',
  title: 'Smooth manifolds',
  minutes: 14, difficulty: 3,
  equation: t`\varphi_\beta\circ\varphi_\alpha^{-1} \in C^\infty\big(\varphi_\alpha(U_\alpha\cap U_\beta)\big)`,
  intro: t`Charts give coordinates; calculus needs more. A **smooth $n$-manifold** is a Hausdorff space (with a countable basis of open sets — a technical condition every space in this course meets) together with an atlas of $n$-dimensional charts whose transition maps are all **smooth**: infinitely differentiable, as maps between open subsets of $\mathbb R^n$, in both directions.

That one demand pays for everything that follows. A function $f: M \to \mathbb R$ is **smooth** if $f\circ\varphi^{-1}$ is smooth in every chart — and if it is smooth in one chart it is smooth in any overlapping one, because $f\circ\varphi_\beta^{-1} = (f\circ\varphi_\alpha^{-1})\circ(\varphi_\alpha\circ\varphi_\beta^{-1})$ is a composition of smooth maps. The same goes for derivatives of curves, tangent vectors and every tensor to come: **smooth transitions make calculus chart-independent**.`,
  symbols: [
    { tex: t`(U_\alpha, \varphi_\alpha),\ (U_\beta, \varphi_\beta)`, text: 'two charts of the atlas: open patches of the manifold and their coordinate maps' },
    { tex: t`U_\alpha \cap U_\beta`, text: 'the overlap, where a point has both sets of coordinates' },
    { tex: t`\varphi_\alpha(U_\alpha\cap U_\beta)`, text: t`the overlap as seen in the first chart: an open subset of $\mathbb R^n$` },
    { tex: t`\varphi_\beta\circ\varphi_\alpha^{-1}`, text: 'the transition map: first chart’s coordinates in, second chart’s out' },
    { tex: t`C^\infty`, text: 'smooth: partial derivatives of every order exist and are continuous' },
  ],
  why: t`Spacetime is a smooth 4-manifold. The Einstein equation is a differential equation for the metric, so it needs derivatives that mean the same thing in every chart — which is exactly what smooth transition maps guarantee.`,
  visual: {
    type: 'graph',
    title: 'Are these two charts compatible?',
    lead: t`Each scene plots a transition map: the coordinate a point has in one chart (across) against its coordinate in the other (up), over the overlap. The gold point and line show the slope at the point you choose.`,
    tasks: [
      t`Two angle charts on the circle: the overlap is two arcs, and the transition is $\theta' = \theta$ on one and $\theta - 2\pi$ on the other. Slope 1 everywhere — smooth, though not one formula.`,
      t`Stereographic charts on the circle: $X' = 1/X$ on the overlap $X \ne 0$. Steep near 0, but 0 is not in the overlap, so it is smooth where it needs to be.`,
      t`The charts $x$ and $x^3$ on the line: the transition $y \mapsto y^{1/3}$ has slope $\tfrac13|y|^{-2/3}$, which blows up at $y = 0$. Not smooth: these two charts are not compatible, though each alone is a fine chart.`,
    ],
    params: {
      x: [-3.4, 6.6], y: [-3.6, 3.6], aspect: 'wide', xticks: 8, yticks: 6, xlabel: 'first chart', ylabel: 'second chart',
      choices: [{ key: 'm', label: 'Charts', options: [[1, t`angles $\theta$, $\theta'$ on a circle`], [2, t`stereographic $X$, $X'$ on a circle`], [3, t`$x$ and $x^3$ on a line`]], value: 1, explain: 'Three pairs of charts and the transition map between them.' }],
      sliders: [{ key: 'a', label: 'point on the overlap (first chart)', min: -2.975, max: 6.225, step: 0.05, value: 1.025, explain: 'Where to measure the slope of the transition map. Values outside a scene’s overlap show nothing.' }],
      curves: [
        { fn: 'x', domain: [0.02, r6(Math.PI - 0.02)], color: 'accent', width: 2.6, when: SEL(1) },
        { fn: `x - ${TAU}`, domain: [r6(Math.PI + 0.02), r6(2 * Math.PI - 0.02)], color: 'accent', width: 2.6, when: SEL(1) },
        { fn: '1/x', domain: [-3.4, -0.28], color: 'accent', width: 2.6, when: SEL(2) },
        { fn: '1/x', domain: [0.28, 6.6], color: 'accent', width: 2.6, when: SEL(2) },
        { fn: 'cbrt(x)', color: 'accent', width: 2.6, when: SEL(3), label: 'y ↦ y^(1/3)', labelAt: 5.2, labelDy: 18 },
        { fn: 'x^3', domain: [-1.5, 1.5], color: 'violet', width: 1.6, dash: [5, 4], when: SEL(3), label: 'inverse x ↦ x³', labelAt: 1.4, labelDx: 8 },
        { param: ['a + t', `a - ${TAU}*step(a - ${PI}) + t`], t: [-0.6, 0.6], color: 'gold', width: 2, when: `${SEL(1)}*step(a)*step(${TAU} - a)*step(abs(a - ${PI}) - 0.02)` },
        { param: ['a + t', '1/a - t/a^2'], t: [-0.6, 0.6], color: 'gold', width: 2, when: `${SEL(2)}*step(abs(a) - 0.28)` },
        { param: ['a + t', 'cbrt(a) + t/(3*cbrt(a)^2)'], t: [-0.3, 0.3], color: 'gold', width: 2, when: SEL(3) },
      ],
      points: [
        { x: 'a', y: `a - ${TAU}*step(a - ${PI})`, color: 'gold', when: `${SEL(1)}*step(a)*step(${TAU} - a)*step(abs(a - ${PI}) - 0.02)` },
        { x: 'a', y: '1/a', color: 'gold', when: `${SEL(2)}*step(abs(a) - 0.28)` },
        { x: 'a', y: 'cbrt(a)', color: 'gold', when: SEL(3) },
        { x: PI, y: 0, r: 0, label: 'θ = π: not in the overlap', labelAlign: 'center', labelDx: 0, labelDy: -60, when: SEL(1) },
      ],
      readouts: [
        { label: 'slope of the transition', expr: '1', digits: 3, when: `${SEL(1)}*step(a)*step(${TAU} - a)` },
        { label: 'slope of the transition', expr: '-1/a^2', digits: 3, when: SEL(2) },
        { label: 'slope of the transition', expr: '1/(3*abs(a)^(2/3))', digits: 3, when: SEL(3) },
      ],
    },
    caption: t`Exact transition maps. Angle charts: $\theta \in (0, 2\pi)$ and $\theta' \in (-\pi, \pi)$, overlapping on the circle minus the points at $0$ and $\pi$. Stereographic: $X = x/(1 - y)$, $X' = x/(1 + y)$. The steep part of $1/X$ near 0 is cut off.`,
  },
  example: {
    prompt: t`Show that the two stereographic charts of the sphere are smoothly compatible: compute the Jacobian matrix of $T(X, Y) = (X, Y)/(X^2 + Y^2)$ and its determinant, and evaluate both at $(X, Y) = (2, 1)$.`,
    visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-2, 2], equal: true, aspect: 'wide', xticks: 7, yticks: 5, xlabel: 'X', ylabel: 'Y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 1.6 }, { param: ['2 + 0.4*t', '1'], t: [0, 1], color: 'gold', width: 2 }, { param: ['2', '1 + 0.4*t'], t: [0, 1], color: 'gold', width: 2 }, { param: ['0.4 - 0.24*t', '0.2 - 0.32*t'], t: [0, 1], color: 'violet', width: 2 }, { param: ['0.4 - 0.32*t', '0.2 + 0.24*t'], t: [0, 1], color: 'violet', width: 2 }], points: [{ x: 2, y: 1, color: 'gold', label: '(2, 1)' }, { x: 0.4, y: 0.2, color: 'violet', label: 'T(2, 1)', labelDx: 10, labelDy: 14 }, { x: 0, y: 0, r: 4, hollow: true, color: 'ink2' }] }, caption: t`Two small steps $0.4$ along $X$ and $Y$ at $(2, 1)$ (gold) and their images under $T$ (violet, from the Jacobian, drawn 5 times longer than they are): shrunk by $1/5$, and with the turn from one to the other reversed — the determinant is negative.` },
    steps: [
      { label: 'Write it out', text: t`With $\rho^2 = X^2 + Y^2$: $T = (X/\rho^2,\ Y/\rho^2)$, defined on $\mathbb R^2\setminus\{0\}$ — exactly the overlap.` },
      { label: 'Differentiate', text: t`$\partial_X(X/\rho^2) = (Y^2 - X^2)/\rho^4$, $\partial_Y(X/\rho^2) = -2XY/\rho^4$, and symmetrically for the second component: $J = \dfrac{1}{\rho^4}\begin{pmatrix} Y^2 - X^2 & -2XY \\ -2XY & X^2 - Y^2\end{pmatrix}$.` },
      { label: 'Smooth', text: t`Every entry is a rational function whose denominator $\rho^4$ never vanishes on the overlap, so all derivatives of all orders exist: $T \in C^\infty$. $T$ is its own inverse, so the other direction is smooth too.` },
      { label: 'Determinant', text: t`$\det J = \dfrac{-(X^2 - Y^2)^2 - 4X^2Y^2}{\rho^8} = -\dfrac{1}{(X^2 + Y^2)^2}$, never zero: $T$ is invertible near every point, as a transition map must be.` },
      { label: 'At the point', text: t`$\rho^2 = 5$: $J = \tfrac{1}{25}\begin{pmatrix} -3 & -4 \\ -4 & 3\end{pmatrix}$ and $\det J = -\tfrac{1}{25} = -0.04$.` },
      { label: 'Sense check', text: t`$J/\!\det$ is $\tfrac15$ times a reflection matrix: near $(2, 1)$, $T$ shrinks by $1/\rho^2 = 1/5$ and flips orientation. Flipping the sign of $Y'$ in the south chart would make the determinant positive — an *oriented* atlas.` },
    ],
    answer: t`$J = \rho^{-4}\begin{pmatrix} Y^2 - X^2 & -2XY \\ -2XY & X^2 - Y^2\end{pmatrix}$, $\det J = -1/(X^2 + Y^2)^2$; at $(2, 1)$, $J = \tfrac1{25}\begin{pmatrix} -3 & -4 \\ -4 & 3\end{pmatrix}$ and $\det J = -0.04$. Smooth with smooth inverse: compatible.`,
  },
  practice: [
    mcq({
      id: 'x-cubed', difficulty: 2,
      prompt: t`On the real line, $\varphi_1(x) = x$ and $\varphi_2(x) = x^3$ are both charts (each a homeomorphism of $\mathbb R$ onto $\mathbb R$). Are they smoothly compatible?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.7, 1.7], aspect: 'wide', xticks: 7, yticks: 5, xlabel: 'y = x³', ylabel: 'x', curves: [{ fn: 'cbrt(x)', color: 'accent', width: 2.4 }], points: [{ x: 0, y: 0, color: 'gold' }] }, caption: t`The transition $\varphi_1\circ\varphi_2^{-1}(y) = y^{1/3}$; its tangent at 0 is vertical.` },
      choices: [
        t`No: $\varphi_1\circ\varphi_2^{-1}(y) = y^{1/3}$ is not differentiable at $y = 0$`,
        t`Yes: $\varphi_2\circ\varphi_1^{-1}(x) = x^3$ is smooth`,
        'Yes: both are homeomorphisms, and that is all compatibility asks',
        t`No: $x^3$ is not a homeomorphism`,
      ],
      answer: 0,
      why: {
        1: 'Compatibility needs the transition smooth in both directions. One direction is fine; the other is not.',
        2: 'Homeomorphism gives a topological manifold. A smooth structure demands smooth transitions.',
        3: t`$x^3$ is continuous and strictly increasing with continuous inverse $y^{1/3}$: a homeomorphism.`,
      },
      hints: ['Write both transition maps, from chart 1 to chart 2 and back.', t`$\frac{d}{dy}y^{1/3} = \tfrac13 y^{-2/3}$. What happens at $y = 0$?`],
      teach: 'Two charts are compatible only when the transition maps both ways are smooth.',
      explain: t`$y^{1/3}$ has an infinite slope at 0, so the atlas $\{\varphi_1, \varphi_2\}$ is not smooth. Each chart on its own defines a smooth structure on $\mathbb R$; they are different smooth structures (though the map $x \mapsto x^{1/3}$ shows the two resulting manifolds are diffeomorphic).`,
    }),
    num({
      id: 'jac-det', difficulty: 2,
      gen(r) {
        const [X, Y] = r.pick([[1, 1], [1, 2], [2, 2], [3, 1], [0.5, 0.5], [1, -1], [2, -3]]);
        const d = -1 / (X * X + Y * Y) ** 2;
        return {
          prompt: t`Find the Jacobian determinant of the stereographic transition map $T(X, Y) = (X, Y)/(X^2 + Y^2)$ at $(X, Y) = (${X}, ${Y})$.`,
          visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-3.6, 3.6], equal: true, aspect: 'wide', xticks: 7, yticks: 7, xlabel: 'X', ylabel: 'Y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, TAU], color: 'teal', width: 1.6 }], points: [{ x: X, y: Y, color: 'gold', label: `(${X}, ${Y})` }, { x: 0, y: 0, r: 4, hollow: true, color: 'ink2' }] }, caption: 'The point in the north chart; the unit circle is the equator, the origin (excluded) the south pole.' },
          answer: d, tol: { rel: 0.002 },
          errors: [{ value: -d, feedback: t`Check the sign: inversion reverses orientation, $\det J = -1/(X^2 + Y^2)^2$.` }, { value: -1 / (X * X + Y * Y), feedback: t`Square the denominator: lengths shrink by $1/\rho^2$ in both directions, so areas by $1/\rho^4$.` }],
          hints: [t`$\det J = -1/(X^2 + Y^2)^2$ (worked example).`, t`$X^2 + Y^2 = ${X * X + Y * Y}$.`],
          teach: 'The stereographic transition has Jacobian determinant −1/(X² + Y²)²: never zero on the overlap, negative because it reverses orientation.',
          explain: t`$\det J = -1/${nice(X * X + Y * Y)}^2 = ${nice(d, 4)}$. Small areas near this point shrink by $${nice(-d, 4)}$ and are mirrored.`,
        };
      },
    }),
    mcq({
      id: 'figure-eight', difficulty: 2,
      prompt: t`The figure eight (two loops meeting at one point $c$) is not a manifold of any dimension. Which observation proves it is not a 1-manifold?`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-0.75, 0.75], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ param: ['1.3*sin(t)', '1.1*sin(t)*cos(t)'], t: [0, TAU], color: 'accent', width: 2.4 }, { param: ['0.25*cos(t)', '0.25*sin(t)'], t: [0, TAU], color: 'gold', width: 1.4, dash: [4, 4] }], points: [{ x: 0, y: 0, color: 'gold', label: 'c', labelDy: -6 }] }, caption: 'The figure eight and a small neighbourhood of the crossing point c (dashed).' },
      choices: [
        t`Every small connected neighbourhood of $c$, with $c$ removed, falls into 4 pieces; an open interval with a point removed falls into 2`,
        t`It is not compact`,
        t`It has a sharp corner at $c$`,
        t`It cannot be drawn without lifting the pen`,
      ],
      answer: 0,
      why: {
        1: 'It is compact (closed and bounded in the plane). Being compact does not stop a space being a manifold — the sphere is compact.',
        2: t`Corners are a smoothness issue for an *embedded* curve; a square’s outline has corners and is still a topological circle. The problem at $c$ is topological.`,
        3: 'It can be drawn in one stroke — and that is irrelevant anyway.',
      },
      hints: ['Near an ordinary point of a 1-manifold the space looks like an open interval. Compare pieces after removing the centre point.'],
      teach: 'A space is a manifold only if every point has a neighbourhood like ℝⁿ; counting the pieces left when the point is removed detects a crossing.',
      explain: t`Near $c$ four arms meet; removing $c$ leaves four pieces. A homeomorphism to an interval would leave two. (Removing $c$ cannot leave the single piece a 2-dimensional disc would leave either, so no dimension works.)`,
    }),
    num({
      id: 'smooth-function', difficulty: 2,
      gen(r) {
        const X = r.pick([0.5, 2, -1.5, 3, 0.25, -0.5]);
        const fX = 2 * X / (1 + X * X), d = (2 * (1 - X * X)) / (1 + X * X) ** 2;
        return {
          prompt: t`On the unit circle, the function $f(x, y) = x$ is smooth. In the stereographic chart $X = x/(1 - y)$ it reads $f = \dfrac{2X}{X^2 + 1}$. Find $df/dX$ at $X = ${X}$.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-1.3, 1.3], aspect: 'wide', xticks: 9, yticks: 5, xlabel: 'X', ylabel: 'f', curves: [{ fn: '2*x/(x^2 + 1)', color: 'accent', width: 2.4 }], points: [{ x: X, y: r6(fX), color: 'gold' }] }, caption: t`$f = x$ written in the stereographic coordinate: it rises to 1 at $X = 1$, the point $(1, 0)$, and dies away toward the north pole ($X \to \pm\infty$).` },
          answer: d, tol: { rel: 0.002, abs: 1e-6 },
          errors: [{ value: 2 / (1 + X * X), feedback: 'Use the quotient rule: the denominator depends on X too.' }].filter((e) => Math.abs(e.value - d) > 0.01 * Math.abs(d)),
          hints: [t`Quotient rule: $\dfrac{d}{dX}\dfrac{2X}{X^2 + 1} = \dfrac{2(X^2 + 1) - 2X\cdot 2X}{(X^2 + 1)^2}$.`, t`That simplifies to $\dfrac{2(1 - X^2)}{(1 + X^2)^2}$.`],
          teach: 'A function on a manifold is differentiated through a chart: write it in coordinates, then use ordinary calculus.',
          explain: t`$\dfrac{df}{dX} = \dfrac{2(1 - X^2)}{(1 + X^2)^2} = ${nice(d, 4)}$ at $X = ${X}$. In the angle chart $f = \cos\theta$; the two derivatives differ by the transition’s derivative $d\theta/dX$, which is exactly why “smooth in one chart” implies “smooth in all”.`,
        };
      },
    }),
    multi({
      id: 'which-manifolds', difficulty: 2,
      prompt: 'Which of these are smooth manifolds? Select every one.',
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.25, 1.25], equal: true, aspect: 'wide', grid: false, xticks: 5, yticks: 5, xlabel: 'x', ylabel: 'z', curves: [{ fn: 'x', domain: [-1.2, 1.2], color: 'accent', width: 2.4 }, { fn: '-x', domain: [-1.2, 1.2], color: 'accent', width: 2.4 }], points: [{ x: 0, y: 0, color: 'gold', label: 'apex', labelDx: 10 }] }, caption: t`A slice through the double cone $x^2 + y^2 = z^2$: two cones meeting at the apex.` },
      choices: ['the sphere', 'the torus', t`the open disc $x^2 + y^2 < 1$`, t`the double cone $x^2 + y^2 = z^2$`, 'the figure eight', 'the line with two origins'],
      answer: [0, 1, 2],
      why: {
        3: 'Near the apex the double cone is two discs touching at a point: removing the apex leaves two pieces, but a disc minus a point is still one piece. Not even a topological manifold.',
        4: 'Four arms meet at the crossing; no neighbourhood there looks like an interval.',
        5: t`Locally it is a line and its transition maps are smooth (identities), but it is not Hausdorff — the definition excludes it on purpose.`,
      },
      hints: ['For each, look for a bad point: a crossing, an apex, or two points that cannot be separated.', 'The open disc is a single chart all by itself.'],
      teach: 'A smooth manifold is locally like ℝⁿ everywhere, Hausdorff, and has smooth transition maps.',
      explain: t`The sphere (two stereographic charts), the torus (C8.3) and the open disc (one chart, the identity) are smooth manifolds. The double cone and figure eight fail at one point each; the line with two origins fails Hausdorff.`,
    }),
    order({
      id: 'chart-independent', difficulty: 3,
      prompt: t`Show that if $f$ is smooth in the chart $\varphi_\alpha$ near a point $p$, it is smooth in any other chart $\varphi_\beta$ of the atlas near $p$. Order the steps.`,
      visual: { type: 'graph', params: { x: [-0.5, 6.6], y: [-3.6, 3.6], aspect: 'wide', xticks: 8, yticks: 6, xlabel: 'θ', ylabel: 'θ′', curves: [{ fn: 'x', domain: [0.02, r6(Math.PI - 0.02)], color: 'accent', width: 2.6 }, { fn: `x - ${TAU}`, domain: [r6(Math.PI + 0.02), r6(2 * Math.PI - 0.02)], color: 'accent', width: 2.6 }] }, caption: 'A transition map of the circle (the two angle charts): smooth on the overlap.' },
      items: [
        t`On the overlap, $f\circ\varphi_\beta^{-1} = (f\circ\varphi_\alpha^{-1})\circ(\varphi_\alpha\circ\varphi_\beta^{-1})$, because $\varphi_\alpha^{-1}\circ\varphi_\alpha$ is the identity.`,
        t`$f\circ\varphi_\alpha^{-1}$ is smooth near $\varphi_\alpha(p)$ by assumption.`,
        t`$\varphi_\alpha\circ\varphi_\beta^{-1}$ is a transition map, smooth because the atlas is smooth.`,
        t`A composition of smooth maps is smooth (chain rule, applied over and over), so $f\circ\varphi_\beta^{-1}$ is smooth near $\varphi_\beta(p)$.`,
      ],
      hints: [t`Insert the identity $\varphi_\alpha^{-1}\circ\varphi_\alpha$ in the middle.`, 'Then name what each of the two factors is.'],
      teach: 'Smoothness of a function does not depend on the chart, because changing chart composes with a smooth transition map.',
      explain: t`Without smooth transitions this fails — with the charts $x$ and $x^3$ on $\mathbb R$, the function $f(x) = x$ is smooth in the first and equals $y^{1/3}$, not smooth, in the second.`,
    }),
    mcq({
      id: 'piecewise-transition', difficulty: 2,
      prompt: t`For the two angle charts of the circle, $\theta \in (0, 2\pi)$ and $\theta' \in (-\pi, \pi)$, the transition map is $\theta' = \theta$ on $(0, \pi)$ and $\theta' = \theta - 2\pi$ on $(\pi, 2\pi)$. Is it smooth?`,
      visual: { type: 'graph', params: { x: [-0.5, 6.6], y: [-3.6, 3.6], aspect: 'wide', xticks: 8, yticks: 6, xlabel: 'θ', ylabel: 'θ′', curves: [{ fn: 'x', domain: [0.02, r6(Math.PI - 0.02)], color: 'accent', width: 2.6 }, { fn: `x - ${TAU}`, domain: [r6(Math.PI + 0.02), r6(2 * Math.PI - 0.02)], color: 'accent', width: 2.6 }], points: [{ x: PI, y: r6(Math.PI), r: 4, hollow: true, color: 'accent' }, { x: PI, y: r6(-Math.PI), r: 4, hollow: true, color: 'accent' }] }, caption: t`The transition map over the overlap $(0, \pi) \cup (\pi, 2\pi)$.` },
      choices: [
        t`Yes: the overlap is two separate open arcs, and on each the map is a shift with every derivative continuous`,
        t`No: it jumps by $2\pi$ at $\theta = \pi$`,
        t`No: a transition map must be a single formula`,
        t`Yes, but only because the circle is one-dimensional`,
      ],
      answer: 0,
      why: {
        1: t`$\theta = \pi$ is the point $(-1, 0)$, which $\theta'$ does not cover — it is not in the overlap, so there is no jump *on the overlap*.`,
        2: 'Smoothness is checked point by point on an open set; any formula, or several, will do.',
        3: 'Dimension has nothing to do with it; the same happens for angle charts on a torus or a sphere.',
      },
      hints: [t`Which points of the circle are covered by both charts?`, t`Is $\theta = \pi$ among them?`],
      teach: 'Transition maps need only be smooth on the overlap, which may have several pieces.',
      explain: t`The derivative is 1 on both pieces and every higher derivative is 0. The overlap’s two pieces are a hint of the circle’s topology: two charts can only overlap in two arcs.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gimbal', difficulty: 3, transfer: true,
      gen(r) {
        const pitch = r.pick([60, 75, 85, 88, 89.5]), rr = r.pick([1, 2, 0.5]);
        const psi = rr / Math.cos(pitch * DEG);
        return {
          prompt: t`The orientations of a spacecraft form a smooth 3-manifold, the rotation group. Yaw–pitch–roll Euler angles $(\psi, \theta, \phi)$ are a chart on part of it. With roll $\phi = 0$, a steady body yaw rate $r$ (about the craft’s own $z$-axis, other body rates zero) needs $\dot\psi = r/\cos\theta$. At pitch $\theta = ${pitch}^\circ$, what yaw-angle rate $\dot\psi$ does a body rate $r = ${rr}^\circ$/s require, in degrees per second?`,
          visual: { type: 'graph', params: { x: [0, 108], y: [0, 40], aspect: 'wide', xticks: 7, yticks: 5, xlabel: 'pitch θ (°)', ylabel: 'ψ̇ per unit r', curves: [{ fn: '1/cos(x*pi/180)', domain: [0, 88.6], color: 'accent', width: 2.4 }], vlines: [{ x: 90, color: 'bad', label: 'gimbal lock' }] }, caption: t`$1/\cos\theta$: how much the yaw angle must spin per unit of real body rotation. The chart breaks at $\theta = 90^\circ$; the spacecraft does not.` },
          answer: psi, units: 'deg/s', tol: { rel: 0.003 },
          errors: [{ value: rr * Math.cos(pitch * DEG), feedback: t`Divide by $\cos\theta$: near $90^\circ$ the yaw angle must spin *faster* than the craft does.` }, { value: rr / Math.sin(pitch * DEG), feedback: t`The factor is $1/\cos\theta$, which blows up at $90^\circ$ pitch, not $1/\sin\theta$.` }].filter((e) => Math.abs(e.value - psi) > 0.005 * psi),
          hints: [t`$\dot\psi = r/\cos\theta$.`, t`$\cos ${pitch}^\circ = ${nice(Math.cos(pitch * DEG), 4)}$.`],
          teach: 'Euler angles are a chart on the rotation group that degenerates at ±90° pitch (gimbal lock): a coordinate failure, not a physical one.',
          explain: t`$\dot\psi = ${rr}/${nice(Math.cos(pitch * DEG), 4)} = ${nice(psi, 4)}^\circ$/s (with $\dot\phi = r\tan\theta$ as well). The matrix from angle rates to body rates has determinant $\cos\theta$, so at $\theta = 90^\circ$ this chart stops being a chart. The rotation group is a perfectly smooth compact manifold that, like the sphere, no single chart covers — so attitude software switches Euler sequences or uses quaternions.`,
        };
      },
    }),
    num({
      id: 'cp-latlong-jac', difficulty: 3,
      gen(r) {
        const thd = r.pick([45, 60, 90, 120, 150]);
        const th = thd * DEG, d = -0.5 / Math.sin(th / 2) ** 2 / Math.tan(th / 2);
        return {
          prompt: t`Colatitude–longitude $(\theta, \varphi)$ and the north stereographic chart $(X, Y)$ overlap on most of the sphere, where $X = \cot(\theta/2)\cos\varphi$ and $Y = \cot(\theta/2)\sin\varphi$. The Jacobian determinant of this transition is $\det\dfrac{\partial(X, Y)}{\partial(\theta, \varphi)} = -\tfrac12\csc^2(\theta/2)\cot(\theta/2)$. Evaluate it at $\theta = ${thd}^\circ$.`,
          visual: { type: 'graph', params: { x: [0, 180], y: [-12, 1], aspect: 'wide', xticks: 7, yticks: 5, xlabel: 'θ (°)', ylabel: 'det', curves: [{ fn: '-0.5/(sin(x*pi/360)^2*tan(x*pi/360))', domain: [40, 179], color: 'accent', width: 2.4 }], hlines: [{ y: 0, color: 'ink3' }], vlines: [{ x: thd, color: 'gold' }] }, caption: t`The determinant against colatitude: never zero for $0 < \theta < 180^\circ$, so the two charts are compatible there.` },
          answer: d, tol: { rel: 0.003 },
          errors: [{ value: -d, feedback: 'Keep the minus sign: increasing θ moves the point toward the chart’s centre.' }, { value: -0.5 / Math.sin(th) ** 2 / Math.tan(th), feedback: t`Use half the angle: $\theta/2 = ${nice(thd / 2)}^\circ$.` }].filter((e) => Math.abs(e.value - d) > 0.005 * Math.abs(d)),
          hints: [t`$\theta/2 = ${nice(thd / 2)}^\circ$: $\csc^2 = 1/\sin^2$ and $\cot = 1/\tan$.`, t`$\sin(${nice(thd / 2)}^\circ) = ${nice(Math.sin(th / 2), 4)}$ and $\tan(${nice(thd / 2)}^\circ) = ${nice(Math.tan(th / 2), 4)}$.`],
          teach: 'Two charts are compatible where the transition and its inverse are smooth; a nonzero Jacobian determinant guarantees a smooth inverse nearby.',
          explain: t`$-\tfrac12 \times ${nice(1 / Math.sin(th / 2) ** 2, 4)} \times ${nice(1 / Math.tan(th / 2), 4)} = ${nice(d, 4)}$. The determinant is finite and nonzero on $0 < \theta < \pi$, so by the inverse function theorem the inverse transition is smooth too. At $\theta = \pi$ (the south pole) it vanishes — a failure of the $(\theta, \varphi)$ chart, which has no business there.`,
        };
      },
    }),
    mcq({
      id: 'cp-two-origins', difficulty: 2,
      prompt: t`The line with two origins has an atlas of two charts — the line with $0_1$ and the line with $0_2$ — and both transition maps are the identity on $\mathbb R\setminus\{0\}$, which is smooth. Why is it still not a smooth manifold?`,
      visual: { type: 'graph', params: { x: [-3.6, 3.6], y: [-1, 1], equal: true, aspect: 'wide', grid: false, axes: false, xticks: 0, yticks: 0, curves: [{ fn: '0', domain: [-3.4, -0.06], color: 'accent', width: 2.4 }, { fn: '0', domain: [0.06, 3.4], color: 'accent', width: 2.4 }], points: [{ x: 0, y: 0.45, color: 'gold', label: '0₁', labelDx: -8, labelDy: -16 }, { x: 0, y: -0.45, color: 'violet', label: '0₂', labelDx: -8, labelDy: 20 }, { x: 0, y: 0, r: 3.5, hollow: true, color: 'accent' }] }, caption: 'The line with two origins (drawn with its two origins pulled apart).' },
      choices: ['It is not Hausdorff, and the definition requires Hausdorff separately', 'Its transition maps are not smooth at 0', 'It is not locally Euclidean at the origins', 'It needs infinitely many charts'],
      answer: 0,
      why: {
        1: 'The transition maps live on the overlap, ℝ minus 0; there is no 0 there to be non-smooth at.',
        2: 'Each origin has a neighbourhood that is an open interval in disguise.',
        3: 'Two charts cover it.',
      },
      hints: ['Smooth transitions and local charts are both fine here. Which remaining condition in the definition fails?'],
      teach: 'Smooth transition maps alone do not make a manifold: the Hausdorff condition is part of the definition precisely to exclude spaces like the line with two origins.',
      explain: t`Every local test passes; the failure is global — $0_1$ and $0_2$ cannot be separated, so limits are not unique. That is why “Hausdorff” is written into the definition rather than left to follow.`,
    }),
  ],
  sources: [
    { label: 'Lee, Introduction to Smooth Manifolds (2nd ed.), ch. 1–2', url: 'https://link.springer.com/book/10.1007/978-1-4419-9982-5' },
    { label: 'Carroll, Spacetime and Geometry, §2.2', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Stevens, Lewis & Johnson, Aircraft Control and Simulation (3rd ed.), §1.3 (Euler kinematics)', url: 'https://onlinelibrary.wiley.com/doi/book/10.1002/9781119174882' },
  ],
});
