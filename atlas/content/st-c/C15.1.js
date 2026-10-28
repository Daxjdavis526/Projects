// Curvature from transport around a loop: a vector carried round a small
// loop returns changed by an amount linear in the vector, proportional to the
// loop's area and dependent on its plane — the Riemann tensor. The same
// object is the commutator of covariant derivatives, which gives its
// component formula. Holonomy is measured numerically (dg4 transport on the
// stereographic chart), the first-order loop formula is applied to
// components, and the 2D additivity argument recovers ∬K dA.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { D, loopTurn, rectArea, sigNum } from './_curv.js';

const t = String.raw;
const DEG = Math.PI / 180, ARCSEC = Math.PI / (180 * 3600);

const tp = (metric, P, Q, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'transport', P, Q, drag: false, readout: false, field: false, sliders: [], ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C15.1',
  title: 'Curvature from transport around a loop',
  minutes: 15, difficulty: 3,
  equation: t`[\nabla_\mu, \nabla_\nu]\,V^\rho = R^\rho{}_{\sigma\mu\nu}\,V^\sigma`,
  intro: t`Carry a vector $V$ once round a small loop without turning it (C12) and it comes back changed. The change $\delta V$ is **linear in $V$**, **proportional to the loop’s area**, and depends on **which plane the loop lies in**. A quantity that eats a vector and a plane and returns a vector has four slots: the **Riemann tensor** $R^\rho{}_{\sigma\mu\nu}$. For a loop that runs first along $A^\mu$ for a parameter distance $\delta a$, then along $B^\nu$ for $\delta b$, and back,
$$\delta V^\rho \approx -R^\rho{}_{\sigma\mu\nu}\,V^\sigma A^\mu B^\nu\,\delta a\,\delta b.$$
The same tensor measures something you can compute at a single point: how much **covariant derivatives fail to commute** (the equation above, for the torsion-free connections of this course). Working out the commutator gives its components from the Christoffel symbols:
$$R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma} + \Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}.$$
On a surface you already know a scalar version: the turn is $K\times$ area (C6.3). Riemann is that idea for any dimension and any connection, with the bookkeeping that tells you which way the vector turns.`,
  symbols: [
    { tex: t`\nabla_\mu`, text: t`the covariant derivative along the coordinate direction $x^\mu$ (Levi-Civita, torsion-free)` },
    { tex: t`[\nabla_\mu, \nabla_\nu]`, text: t`the commutator $\nabla_\mu\nabla_\nu - \nabla_\nu\nabla_\mu$: differentiate in one order, subtract the other order` },
    { tex: t`V^\rho`, text: 'the components of a vector field' },
    { tex: t`R^\rho{}_{\sigma\mu\nu}`, text: t`the Riemann curvature tensor, in units of $1/\text{length}^2$ in coordinates measured in lengths: the last pair $\mu\nu$ names the plane of the loop, the first pair the linear map applied to the vector (Carroll’s index order)` },
    { tex: t`\Gamma^\rho{}_{\mu\nu}`, text: 'the Christoffel symbols of the connection (C13)' },
    { tex: t`A^\mu,\ B^\nu`, text: t`the two directions the loop runs along, first $A$ then $B$` },
    { tex: t`\delta a\,\delta b`, text: 'the parameter lengths of the two sides: their product sets the size of the loop' },
  ],
  why: t`Every curvature quantity in general relativity — Ricci, the Einstein tensor, the tidal tensor — is built from this one object, and gr.S14.d uses it as the part of gravity no choice of coordinates can remove.`,
  visual: {
    type: 'dg4-chart',
    title: 'Two routes, one loop',
    lead: t`One arrow at $P$ is carried to $Q$ along two routes round a coordinate rectangle: blue along the first coordinate first, violet along the second first. Out along one route and back along the other is a loop, so **the angle between the two arrivals is the turn picked up round the loop**. Compare it with $\iint K\,dA$ of the rectangle.`,
    tasks: [
      t`Sphere: drag $Q$ toward $P$. The angle and $\iint K\,dA$ shrink together and stay equal in size (the readout’s sign only says which arrival the angle is measured from) — for a small loop that is $K\times\text{area}$.`,
      t`Change the arrow’s starting angle: the turn does not change. In two dimensions the holonomy rotates every vector by the same angle, so one number, $K$, carries all of Riemann.`,
      t`Switch to the polar chart of the flat plane: its $\Gamma$s are not zero, yet both routes always agree. Then try the half-plane: the turn changes sign, because $K < 0$.`,
    ],
    params: { metric: 'sphere', metrics: ['sphere', 'stereo', 'torus', 'polar', 'halfplane'], mode: 'transport', P: [1.0, 0.9], Q: [2.6, 1.6], sliders: ['angle'], angle: 30, field: true, cells: 8, readout: ['turn', 'area'] },
    caption: t`Transport integrated step by step (RK4) from the Christoffel symbols; arrows drawn by their chart components, so their drawn lengths follow the ellipses. Readout: the angle between the arrivals, and $\iint K\,dA$ over the rectangle by the midpoint rule.`,
  },
  example: {
    prompt: t`Compute the commutator $[\nabla_\mu, \nabla_\nu]V^\rho$ for a torsion-free connection and read off $R^\rho{}_{\sigma\mu\nu}$. Why is the result a tensor, when the $\Gamma$s are not?`,
    visual: tp('polar', [1.0, 0.2], [2.4, 1.2], 'The polar chart of the flat plane: the Γs are not zero, but the two routes agree — the commutator, and so R, is zero.', { angle: 40, field: true }),
    steps: [
      { label: 'One derivative', text: t`$\nabla_\nu V^\rho = \partial_\nu V^\rho + \Gamma^\rho{}_{\nu\sigma}V^\sigma$ is a $(1,1)$ tensor; call it $T^\rho{}_\nu$.` },
      { label: 'Two derivatives', text: t`$\nabla_\mu T^\rho{}_\nu = \partial_\mu T^\rho{}_\nu + \Gamma^\rho{}_{\mu\lambda}T^\lambda{}_\nu - \Gamma^\lambda{}_{\mu\nu}T^\rho{}_\lambda$: one $+\Gamma$ for the upper index, one $-\Gamma$ for the lower (C13.2).` },
      { label: 'Drop the symmetric', text: t`Subtract the same with $\mu \leftrightarrow \nu$. Anything symmetric in $\mu\nu$ cancels: $\partial_\mu\partial_\nu V^\rho$; the term $\Gamma^\lambda{}_{\mu\nu}T^\rho{}_\lambda$ (zero torsion); and the pair $\Gamma^\rho{}_{\nu\sigma}\partial_\mu V^\sigma + \Gamma^\rho{}_{\mu\lambda}\partial_\nu V^\lambda$.` },
      { label: 'What survives', text: t`$[\nabla_\mu, \nabla_\nu]V^\rho = \big(\partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma} + \Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}\big)V^\sigma$. The bracket is $R^\rho{}_{\sigma\mu\nu}$.` },
      { label: 'Why a tensor', text: t`No derivative of $V$ survives: the commutator of two tensor operations acts on $V$ at one point, linearly. A linear map from vectors (and a pair of directions) to vectors is a tensor, whatever its parts look like. So if $R = 0$ in one chart — Cartesian coordinates on a plane — it is zero in every chart, polar included.` },
    ],
    answer: t`$R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma} + \Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}$; a tensor because the commutator involves no derivatives of $V$.`,
  },
  practice: [
    mcq({
      id: 'why-tensor', difficulty: 2,
      prompt: t`The Christoffel symbols are not the components of a tensor, yet $R^\rho{}_{\sigma\mu\nu}$, built from them and their derivatives, is. Why?`,
      visual: { type: 'dg4-chart', params: { metric: 'polar', mode: 'chart', P: [1.5, 0.5], drag: false, readout: ['gamma', 'K'], field: true }, caption: 'The polar chart of a flat plane: Christoffel symbols that are not zero, and a curvature that is.' },
      choices: [
        t`$R^\rho{}_{\sigma\mu\nu}V^\sigma$ equals $[\nabla_\mu, \nabla_\nu]V^\rho$, in which no derivative of $V$ survives: a linear map at a point`,
        t`The non-tensor parts cancel only in Cartesian coordinates, where $\Gamma = 0$`,
        t`It is not a tensor: only the scalar $K$ built from it is`,
        t`Two non-tensors multiplied together always make a tensor`,
      ],
      answer: 0,
      why: {
        1: t`The cancellation happens in every chart — the commutator is built from tensor operations, so the result transforms as a tensor everywhere.`,
        2: t`If $R$ were not a tensor, "$R = 0$" could hold in one chart and fail in another, and curvature would not be a fact about the space.`,
        3: t`Products of non-tensors are not tensors in general; the cancellation here is special to the commutator.`,
      },
      hints: [t`Look at what the commutator does to $V$: does any derivative of $V$ survive?`],
      teach: 'Riemann is a tensor because it is the commutator of covariant derivatives: the derivatives of the vector cancel, leaving a linear map at a point.',
      explain: t`$\nabla_\mu\nabla_\nu V^\rho$ is a tensor, and so is the difference of the two orders. That difference contains no $\partial V$ terms, so it is "a tensor times $V$", and that tensor is $R^\rho{}_{\sigma\mu\nu}$. The picture shows why it matters: polar coordinates have $\Gamma^r{}_{\theta\theta} = -r$, yet $K = 0$ — the $\Gamma$s describe the chart, $R$ describes the space.`,
    }),
    num({
      id: 'stereo-measure', difficulty: 3,
      gen(r) {
        const a = r.pick([0.6, 0.8, 1.2, 1.5, 1.8]);
        const [X, Y] = r.pick([[-0.6, -0.4], [0.2, -0.5], [-0.3, 0.1], [0.4, 0.2]]);
        const e = r.pick([0.4, 0.5, 0.6]);
        const M = D.METRICS.stereo;
        const turnDeg = sigNum(loopTurn(M, X, Y, e, e, a).turn / DEG, 4), A = sigNum(rectArea(M, X, Y, e, e, a), 4);
        const key = Math.sqrt(A / (turnDeg * DEG));
        return {
          prompt: t`A map of an unknown round world uses stereographic coordinates $(X, Y)$, with $ds^2 = \lambda(X, Y)^2(dX^2 + dY^2)$. A surveyor carries a vector round the coordinate square from $(X, Y) = (${X}, ${Y})$ to $(${nice(X + e)}, ${nice(Y + e)})$, never turning it, and finds it has turned anticlockwise by $${turnDeg}^\circ$. The metric measures lengths in thousands of km, and integrating it gives the square’s area as $${A}$ (thousand km)². Assuming the world is a sphere, what is its radius, in thousands of km?`,
          visual: tp('stereo', [X, Y], [X + e, Y + e], 'The two routes round the surveyed square on the stereographic chart (an arrow carried along each). The chart is drawn flat; the world is not.', { k: a, angle: 20, field: true, view: { a: [-1.6, 1.6], b: [-1.1, 1.1] } }),
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: Math.sqrt(A / turnDeg), feedback: 'The turn must be in radians: K is the turn per unit area only with angles in radians.' },
            { value: (turnDeg * DEG) / A, feedback: t`That is $K = \text{turn}/\text{area}$. The radius is $1/\sqrt K$.` },
            { value: A / (turnDeg * DEG), feedback: t`That is $1/K = a^2$. Take the square root for $a$.` },
          ].filter((x) => Math.abs(x.value - key) > 0.02 * key),
          hints: [t`The turn round a loop is $\iint K\,dA$; on a sphere $K = 1/a^2$ is the same everywhere, so the turn is exactly $\text{area}/a^2$.`, t`$a = \sqrt{\text{area}/\text{turn}}$, with the turn in radians: $${turnDeg}^\circ = ${nice(turnDeg * DEG, 4)}$ rad.`],
          teach: 'Holonomy measures curvature from inside: the turn per unit area of a loop is K, whatever chart the loop is drawn on.',
          explain: t`$K = \dfrac{${nice(turnDeg * DEG, 4)}}{${A}} = ${nice((turnDeg * DEG) / A, 4)}$ per (thousand km)², so $a = 1/\sqrt K = ${nice(key, 4)}$ thousand km. The coordinate square looks the same size anywhere on the map, but its true area depends on where it is ($\lambda$ varies); the turn per unit of *true* area does not. That ratio needs no outside view of the world — Gauss’s point, now with a vector instead of triangles.`,
        };
      },
    }),
    num({
      id: 'component-change', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 50, 70, 110]), dth = r.pick([0.02, 0.03, 0.05]), dph = r.pick([0.04, 0.06]), a = r.pick([2, 3, 5]);
        const key = dth * dph, ang = Math.sin(th * DEG) * dth * dph;
        return {
          prompt: t`On a sphere of radius $a = ${a}$ m, a small loop starts at colatitude $\theta_0 = ${th}^\circ$: it runs first along $\partial_\theta$ by $\delta\theta = ${dth}$ rad, then along $\partial_\varphi$ by $\delta\varphi = ${dph}$ rad, then back along the other two sides. The vector $V = \partial_\theta$ is carried round it. Using $\delta V^\rho \approx -R^\rho{}_{\sigma\mu\nu}V^\sigma A^\mu B^\nu\,\delta a\,\delta b$ and $R^\varphi{}_{\theta\varphi\theta} = 1$ for every radius, what is $\delta V^\varphi$?`,
          visual: tp('sphere', [0.4, th * DEG], [0.4 + dph, th * DEG + dth], 'The loop on the (φ, θ) chart of the sphere, greatly zoomed: the two routes and the arrow carried along each.', { angle: 90, view: { a: [0.4 - 0.06, 0.4 + dph + 0.06], b: [th * DEG - 0.04, th * DEG + dth + 0.04] } }),
          answer: key, tol: { rel: 0.005 },
          errors: [
            { value: -key, feedback: t`Watch the order of the last pair: here $A = \partial_\theta$, $B = \partial_\varphi$, so you need $R^\varphi{}_{\theta\theta\varphi} = -R^\varphi{}_{\theta\varphi\theta} = -1$, and the leading minus sign makes $\delta V^\varphi$ positive.` },
            { value: ang, feedback: t`That is the *angle* the vector turns, $K\times\text{area} = \sin\theta_0\,\delta\theta\,\delta\varphi$. The component $V^\varphi$ counts in units of $\partial_\varphi$, whose length is $a\sin\theta_0$.` },
            { value: a * a * key, feedback: t`$R^\varphi{}_{\theta\varphi\theta}$ is 1 for every radius: the $a^2$ lives in the lowered component $R_{\varphi\theta\varphi\theta}$, not in this one.` },
          ].filter((x) => Math.abs(x.value - key) > 0.02 * key),
          hints: [t`Only $\sigma = \theta$ (from $V$), $\mu = \theta$ (from $A$) and $\nu = \varphi$ (from $B$) contribute: $\delta V^\varphi = -R^\varphi{}_{\theta\theta\varphi}\,\delta\theta\,\delta\varphi$.`, t`Riemann is antisymmetric in its last pair: $R^\varphi{}_{\theta\theta\varphi} = -R^\varphi{}_{\theta\varphi\theta} = -1$.`],
          teach: 'The loop formula picks out one Riemann component per (vector, side, side) choice; the order of the sides fixes the sign.',
          explain: t`$\delta V^\varphi = -(-1)\times${dth}\times${dph} = ${nice(key, 4)}$. Check with the angle: the loop encloses area $a^2\sin\theta_0\,\delta\theta\,\delta\varphi$, so $V$ turns by $K\times\text{area} = ${tex(ang, 3)}$ rad toward $\hat e_\varphi$; $|V| = a$ and $|\partial_\varphi| = a\sin\theta_0$, so $\delta V^\varphi = a\cdot${tex(ang, 3)}/(a\sin ${th}^\circ) = ${nice(key, 4)}$ ✓. The radius and the colatitude both drop out.`,
        };
      },
    }),
    mcq({
      id: 'four-indices', difficulty: 2,
      prompt: t`In three dimensions, a small loop can lie in any plane through a point, and a vector carried round it comes back rotated. Why does the curvature need exactly four index slots, $R^\rho{}_{\sigma\mu\nu}$?`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2,
          parallelograms: [{ at: [0, 0, 0], u: [1.4, 0, 0], v: [0, 1.4, 0], color: 'accent', alpha: 0.25 }, { at: [0, 0, 0], u: [0, 1.4, 0], v: [0, 0, 1.4], color: 'violet', alpha: 0.25 }],
          vectors: [{ to: [0.9, 0.9, 0.9], color: 'gold', label: 'V' }],
        },
        caption: 'Two small loops through one point, in different planes (blue and violet), and a vector V to carry round either. The loops are drawn large for visibility.',
      },
      choices: [
        t`The last two name the plane of the loop ($A^\mu B^\nu$); the first two make a linear map taking $V^\sigma$ to $\delta V^\rho$`,
        'Because spacetime has four dimensions',
        'One index for each corner of a square loop',
        t`Two indices for where the loop starts and two for where it ends`,
      ],
      answer: 0,
      why: {
        1: 'The number of slots is the same in every dimension: a 2D surface also has R with four indices (with one independent component).',
        2: t`The loop formula needs only its two side directions, not its corners: the area element $A^\mu B^\nu\,\delta a\,\delta b$.`,
        3: 'A loop starts and ends at the same point; what matters is its plane and size.',
      },
      hints: [t`Count what the loop formula $\delta V^\rho = -R^\rho{}_{\sigma\mu\nu}V^\sigma A^\mu B^\nu\,\delta a\,\delta b$ feeds in and what it returns.`],
      teach: 'Riemann takes a plane (two slots) and returns a linear map on vectors (two slots).',
      explain: t`Two inputs describe the loop ($A$ and $B$), one is the vector, and one is the output: $\delta V^\rho$. Antisymmetry in $\mu\nu$ says only the plane and its orientation matter; C15.3 shows the first pair is antisymmetric too once lowered, so the map is an infinitesimal rotation.`,
    }),
    order({
      id: 'additive', difficulty: 3,
      prompt: t`On a surface, why is the turn round a *large* loop equal to $\iint K\,dA$, when the loop formula holds only for small loops? Order the argument.`,
      visual: { type: 'c3-cells', params: { mode: 'circ', P: '-y', Q: 'x', x: [-2.6, 2.6], y: [-1.8, 1.8], region: { kind: 'disk', c: [0, 0], r: 1.5 }, n: 3, nSlider: false, probe: null, arrows: false, readout: false }, caption: 'A region cut into cells, each walked anticlockwise: inner edges are walked twice, in opposite directions. (Drawn for Green’s theorem; the bookkeeping is the same.)' },
      items: [
        'Cut the region into many small cells and walk each one anticlockwise.',
        'Every inner edge is walked twice, in opposite directions, so walking all the cells in turn is the same as walking the outer loop.',
        'In two dimensions rotations commute, so the order in which the cells are walked does not change the total turn.',
        t`Each small cell turns the vector by $K\times$ its area, to first order.`,
        t`Adding the cells and shrinking them gives the total turn $\iint K\,dA$ — exact, because the first-order errors vanish in the limit.`,
      ],
      hints: ['Start by cutting up the region.', 'Which step uses the fact that the surface is two-dimensional?'],
      teach: 'In 2D, holonomies of cells add like circulations in Green’s theorem, so the small-loop formula integrates up to ∬K dA.',
      explain: t`This is the geometric heart of Gauss–Bonnet (C6.4). In higher dimensions the "rotations commute" step fails — holonomies are matrices that need not commute — which is why curvature there must be a tensor with a plane in it, not a single number.`,
    }),
    mcq({
      id: 'loop-shape', difficulty: 2,
      prompt: t`At one point of a surface, two tiny loops enclose the same area: a square, and a long thin rectangle. How do the turns they give a carried vector compare?`,
      visual: { type: 'dg4-chart', params: { metric: 'torus', mode: 'chart', P: [1.0, 0.3], drag: false, readout: false, field: true, probe: false, points: [{ a: 2, b: 0.3, label: 'P' }], curves: [{ pts: [[2, 0.3], [2.4, 0.3], [2.4, 0.7], [2, 0.7], [2, 0.3]], color: 'accent', label: 'square', labelAt: 2 }, { pts: [[2, 0.3], [2.8, 0.3], [2.8, 0.5], [2, 0.5], [2, 0.3]], color: 'violet', label: 'thin', labelAt: 1, labelDy: 14 }] }, caption: 'Two loops from the same point P on the torus chart, with equal coordinate areas (drawn large for visibility); ellipses show the metric.' },
      choices: ['The same, to first order in the area', 'The thin one turns it more: it has a longer perimeter', 'The square turns it more: it is rounder', 'It depends on which way the vector points'],
      answer: 0,
      why: {
        1: t`Perimeter does not enter: the loop formula contains only the area element $A^\mu B^\nu\,\delta a\,\delta b$.`,
        2: 'Shape enters only at higher order; to first order only the oriented area counts.',
        3: 'On a surface the holonomy is a rotation: every vector turns by the same angle.',
      },
      hints: [t`In the loop formula, what does the loop contribute besides $A^\mu B^\nu\,\delta a\,\delta b$?`],
      teach: 'For a small loop only its oriented area (in a given plane) matters, not its shape or perimeter.',
      explain: t`$A^\mu B^\nu\,\delta a\,\delta b$ antisymmetrized is the oriented area of the loop. Two loops in the same plane with the same area give the same $\delta V$ to first order — on a surface, the same angle $K\times\text{area}$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rover', difficulty: 3, transfer: true,
      gen(r) {
        const [body, R] = r.pick([['the Moon', 1737.4], ['Mars', 3389.5], ['Mercury', 2439.7], ['the dwarf planet Ceres', 469.7]]);
        const s = r.pick([20, 30, 50]);
        const turn = sigNum(((s * s) / (R * R)) / ARCSEC, 3);
        const key = s / Math.sqrt(turn * ARCSEC);
        return {
          prompt: t`A thought experiment: a rover on ${body} drives a square traverse with sides of $${s}$ km, carrying an ideal gyroscope that holds its axis parallel-transported along the surface. Back at the start, the axis has turned by $${turn}''$ (arcseconds) relative to its starting direction. Treating the body as a sphere and the square’s area as $(${s}\ \text{km})^2$, what radius does this give, in km?`,
          visual: tp('sphere', [1.0, 1.2], [1.3, 1.5], 'A small square loop on the (φ, θ) chart of a sphere, with the arrow carried along both routes (drawn large; the rover’s square is far smaller).', { angle: 0, field: true }),
          answer: key, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: s / Math.sqrt(turn), feedback: t`Convert the turn to radians first: $1'' = \pi/648\,000$ rad.` },
            { value: (s * s) / (turn * ARCSEC), feedback: t`That is $\text{area}/\text{turn} = R^2$, in km². Take its square root.` },
          ].filter((x) => Math.abs(x.value - key) > 0.02 * key),
          hints: [t`Turn $= K\times\text{area} = \text{area}/R^2$, with the turn in radians.`, t`$${turn}'' = ${tex(turn * ARCSEC, 4)}$ rad, so $R = ${s}/\sqrt{${tex(turn * ARCSEC, 4)}}$ km.`],
          teach: 'Holonomy round a known area measures K, and so the size of a sphere, from its surface alone.',
          explain: t`$R = \dfrac{${s}}{\sqrt{${tex(turn * ARCSEC, 4)}}} = ${nice(key, 4)}$ km (the mean radius is $${R}$ km; the difference is the rounding of the printed angle). This is a thought experiment: real navigation gyroscopes drift by degrees per hour, millions of times more than this. Gravity Probe B, whose gyroscopes were built to drift less than $10^{-11}$ degrees per hour, measured the far smaller holonomy of spacetime itself — the geodetic precession, $6.6''$ a year (gr.S13.d).`,
        };
      },
    }),
    mcq({
      id: 'cp-flat', difficulty: 2,
      prompt: t`On some two-dimensional space, every vector carried round every small loop comes back unchanged. Which conclusion is justified?`,
      visual: tp('cylinder', [1.0, -0.8], [3.0, 0.9], 'Transport on the chart of a cylinder: both routes always agree.', { angle: 50, field: true }),
      choices: [
        t`$R^\rho{}_{\sigma\mu\nu} = 0$ everywhere: near each point there are coordinates in which the metric is the flat one`,
        t`Every Christoffel symbol is zero in the chart being used`,
        'The space is a plane',
        'Vectors carried round large loops come back unchanged too, whatever the loop',
      ],
      answer: 0,
      why: {
        1: t`The polar chart of a plane has $R = 0$ but $\Gamma^r{}_{\theta\theta} = -r$: zero curvature says nothing about one chart’s $\Gamma$s.`,
        2: 'A cylinder is flat too, and so is a cone away from its tip: zero curvature is local, not global.',
        3: t`A loop round a cone’s tip, which is not small and encloses the tip, turns a vector by the cone’s deficit angle, even though $R = 0$ wherever the cone is smooth.`,
      },
      hints: ['What does a small loop measure, and how far does that knowledge reach?'],
      teach: 'Zero holonomy for small loops means R = 0: the space is locally flat, not necessarily a plane.',
      explain: t`Small loops measure $R$ at a point. $R = 0$ everywhere is the condition for the metric to be flat locally (a theorem; C18.3 uses it on Rindler and Milne spacetimes). Globally the space can still be a cylinder, a cone with its tip removed, or a torus made of a flat square — and loops that wrap round them can still turn vectors.`,
    }),
    num({
      id: 'cp-mixed', difficulty: 3,
      gen(r) {
        const th = r.pick([40, 60, 80, 120]), c = r.pick([1.5, 2.5, 3]), dth = r.pick([0.02, 0.04]), dph = r.pick([0.03, 0.05]);
        const s2 = Math.sin(th * DEG) ** 2, key = -c * s2 * dth * dph;
        return {
          prompt: t`On the unit sphere, take the same kind of loop as before: from colatitude $\theta_0 = ${th}^\circ$, first along $\partial_\theta$ by $\delta\theta = ${dth}$, then along $\partial_\varphi$ by $\delta\varphi = ${dph}$, then back. Carry $V = 2\,\partial_\theta + ${c}\,\partial_\varphi$ round it. Using $R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta$, what is $\delta V^\theta$?`,
          visual: tp('sphere', [0.4, th * DEG], [0.4 + dph, th * DEG + dth], 'The loop on the (φ, θ) chart, greatly zoomed, with the vector carried along both routes.', { angle: 40, view: { a: [0.4 - 0.06, 0.4 + dph + 0.06], b: [th * DEG - 0.04, th * DEG + dth + 0.04] } }),
          answer: key, tol: { rel: 0.01 },
          errors: [
            { value: -key, feedback: t`Sign: with $A = \partial_\theta$, $B = \partial_\varphi$, $\delta V^\theta = -R^\theta{}_{\varphi\theta\varphi}V^\varphi\,\delta\theta\,\delta\varphi$, which is negative.` },
            { value: -(2 + c) * s2 * dth * dph, feedback: t`Only $V^\varphi$ contributes to $\delta V^\theta$: $R^\theta{}_{\theta\theta\varphi} = 0$ (lowered, it would be antisymmetric in its first pair).` },
            { value: -c * dth * dph, feedback: t`Keep the factor $R^\theta{}_{\varphi\theta\varphi} = \sin^2\theta_0 = ${nice(s2, 4)}$.` },
          ].filter((x) => Math.abs(x.value - key) > 0.02 * Math.abs(key)),
          hints: [t`$\delta V^\theta = -R^\theta{}_{\sigma\theta\varphi}V^\sigma\,\delta\theta\,\delta\varphi$; which $\sigma$ gives a non-zero component?`, t`Only $\sigma = \varphi$: $\delta V^\theta = -\sin^2\theta_0\times${c}\times${dth}\times${dph}$.`],
          teach: 'The loop change is linear in V: each component of V feeds the Riemann components with its own index.',
          explain: t`$\delta V^\theta = -\sin^2 ${th}^\circ\times${c}\times${dth}\times${dph} = ${tex(key, 3)}$. The $2\,\partial_\theta$ part of $V$ changes only $V^\varphi$ (as in the practice problem); the $\partial_\varphi$ part changes only $V^\theta$. Together they make one small rotation of the whole vector by $\sin\theta_0\,\delta\theta\,\delta\varphi$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6 (the Riemann tensor from the commutator and from transport round a loop)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Needham, Visual Differential Geometry and Forms, Acts IV–V (holonomy as the meaning of curvature)', url: 'https://press.princeton.edu/books/hardcover/9780691203690/visual-differential-geometry-and-forms' },
    { label: 'Everitt et al. 2011, Gravity Probe B: final results, Phys. Rev. Lett. 106, 221101', url: 'https://doi.org/10.1103/PhysRevLett.106.221101' },
  ],
});
