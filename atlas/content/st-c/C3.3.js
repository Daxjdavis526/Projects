// A gallery of the four model surfaces: sphere, torus, saddle, cylinder —
// parameterizations, normals, how each sits against its tangent planes, and
// where its normals point (a first look at the Gauss map).
import { lesson, mcq, num, match, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const TAU = r6(2 * Math.PI);

// The gallery, each surface on the unit square (u, v) ∈ [0, 1]², with its unit
// normal n and two unit tangent directions e1, e2 — all expression builders.
const G = [
  { // sphere of radius 1.6
    X: (u, v) => [`1.6*sin(pi*${v})*cos(2*pi*${u})`, `1.6*sin(pi*${v})*sin(2*pi*${u})`, `1.6*cos(pi*${v})`],
    n: (u, v) => [`sin(pi*${v})*cos(2*pi*${u})`, `sin(pi*${v})*sin(2*pi*${u})`, `cos(pi*${v})`],
    e1: (u) => [`-sin(2*pi*${u})`, `cos(2*pi*${u})`, '0'],
    e2: (u, v) => [`-cos(pi*${v})*cos(2*pi*${u})`, `-cos(pi*${v})*sin(2*pi*${u})`, `sin(pi*${v})`],
  },
  { // torus R = 1.7, r = 0.7
    X: (u, v) => [`(1.7 + 0.7*cos(2*pi*${v}))*cos(2*pi*${u})`, `(1.7 + 0.7*cos(2*pi*${v}))*sin(2*pi*${u})`, `0.7*sin(2*pi*${v})`],
    n: (u, v) => [`cos(2*pi*${v})*cos(2*pi*${u})`, `cos(2*pi*${v})*sin(2*pi*${u})`, `sin(2*pi*${v})`],
    e1: (u) => [`-sin(2*pi*${u})`, `cos(2*pi*${u})`, '0'],
    e2: (u, v) => [`-sin(2*pi*${v})*cos(2*pi*${u})`, `-sin(2*pi*${v})*sin(2*pi*${u})`, `cos(2*pi*${v})`],
  },
  { // saddle z = (x² − y²)/3 over |x|, |y| ≤ 1.8
    X: (u, v) => [`(3.6*${u} - 1.8)`, `(3.6*${v} - 1.8)`, `((3.6*${u} - 1.8)^2 - (3.6*${v} - 1.8)^2)/3`],
    n: (u, v) => { const a = `(-2*(3.6*${u} - 1.8)/3)`, b = `(2*(3.6*${v} - 1.8)/3)`, L = `sqrt(1 + ${a}^2 + ${b}^2)`; return [`${a}/${L}`, `${b}/${L}`, `1/${L}`]; },
    e1: (u) => { const a = `(2*(3.6*${u} - 1.8)/3)`; return ['1', '0', a].map((c) => `${c}/sqrt(1 + ${a}^2)`); },
    e2: (u, v) => { const b = `(-2*(3.6*${v} - 1.8)/3)`; return ['0', '1', b].map((c) => `${c}/sqrt(1 + ${b}^2)`); },
  },
  { // cylinder of radius 1.2, |z| ≤ 1.8
    X: (u, v) => [`1.2*cos(2*pi*${u})`, `1.2*sin(2*pi*${u})`, `(3.6*${v} - 1.8)`],
    n: (u) => [`cos(2*pi*${u})`, `sin(2*pi*${u})`, '0'],
    e1: (u) => [`-sin(2*pi*${u})`, `cos(2*pi*${u})`, '0'],
    e2: () => ['0', '0', '1'],
  },
];
const W = (k) => `step(0.5 - abs(s - ${k}))`;
const sum = (f) => [0, 1, 2].map((i) => G.map((g, k) => `${W(k)}*(${f(g)[i]})`).join(' + '));

// curves for one surface k at the point (a, b): its two coordinate curves, the
// normal line, and the outline of a patch of its tangent plane
function extras(k) {
  const g = G[k], when = W(k), P = g.X('a', 'b'), n = g.n('a', 'b'), e1 = g.e1('a', 'b'), e2 = g.e2('a', 'b'), h = 0.55;
  const at = (c1, c2) => P.map((p, i) => `${p} + (${c1})*(${e1[i]}) + (${c2})*(${e2[i]})`);
  return [
    { param: g.X('t', 'b'), t: [0, 1], color: 'violet', width: 2.2, when },
    { param: g.X('a', 't'), t: [0, 1], color: 'gold', width: 2.2, when },
    { param: P.map((p, i) => `${p} + 0.9*t*(${n[i]})`), t: [0, 1], color: 'bad', width: 3.4, when },
    { param: at(`${h}*t`, h), t: [-1, 1], color: 'accent', width: 1.8, when },
    { param: at(`${h}*t`, -h), t: [-1, 1], color: 'accent', width: 1.8, when },
    { param: at(h, `${h}*t`), t: [-1, 1], color: 'accent', width: 1.8, when },
    { param: at(-h, `${h}*t`), t: [-1, 1], color: 'accent', width: 1.8, when },
  ];
}

const surf = (params, caption) => ({ type: 'surface3d', params: { alpha: 0.82, ...params }, caption });
const one = (k, extra = {}, caption) => surf({ surface: G[k].X('u', 'v'), domain: [[0, 1], [0, 1]], ...extra }, caption);

export default lesson({
  id: 'st-c.C3.3',
  title: 'A gallery: sphere, torus, saddle, cylinder',
  minutes: 12, difficulty: 3,
  intro: t`Four surfaces will serve as reference points for the rest of the course, because between them they show every way a surface can sit against its tangent plane:

$$\begin{array}{l|l}
\text{sphere} & a(\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)\\
\text{cylinder} & (a\cos\varphi,\ a\sin\varphi,\ z)\\
\text{saddle} & (x,\ y,\ x^2 - y^2)\ \text{or}\ (x,\ y,\ xy)\\
\text{torus} & \big((R + r\cos v)\cos u,\ (R + r\cos v)\sin u,\ r\sin v\big)
\end{array}$$

Near a point $p$, a sphere bends away from its tangent plane in every direction and touches it only at $p$. A cylinder bends one way only and touches along a whole straight line. A saddle bends up in some directions and down in others, so its tangent plane cuts through it. The torus does all three: sphere-like outside, saddle-like inside, cylinder-like along its top and bottom circles. Watching **where the normals point** tells the cases apart.`,
  symbols: [
    { tex: 'a', text: 'the radius of the sphere or cylinder' },
    { tex: t`\theta,\ \varphi`, text: t`angle from the $+z$ pole and angle round the axis (physics convention)` },
    { tex: 'R,\\ r', text: t`the torus’s distance from the axis to the tube’s centre, and the tube’s radius, $R > r$` },
    { tex: t`\mathbf n`, text: 'the unit normal, which this lesson follows around each surface' },
  ],
  why: t`These are the test cases for every curvature in modules C4–C6: the sphere (curved, and intrinsically so), the cylinder (bent but intrinsically flat — it unrolls), the saddle (negative curvature) and the torus (both signs, total zero). Where the normals point is the **Gauss map**; how much of the sphere of directions they cover, per unit area, will be the Gaussian curvature.`,
  visual: {
    type: 'surface3d',
    title: 'Four surfaces, one tangent plane',
    lead: t`Pick a surface and move the point. You see the two coordinate curves through it (violet, gold), the unit normal (red) and the outline of a patch of the tangent plane (blue). Turn the picture to look along the plane’s edge.`,
    tasks: [
      t`Sphere: wherever the point is, the surface falls away below the tangent plane in every direction. Cylinder: the plane touches along a whole vertical line, and every normal is horizontal.`,
      t`Saddle: put the point near the centre and look along the plane — the surface rises above it in one direction and dips below in the other.`,
      t`Torus: on the outer equator ($v = 0$) it behaves like the sphere; on the inner one ($v = 0.5$) like the saddle; on the top circle ($v = 0.25$) the plane touches along the whole circle, like the cylinder.`,
    ],
    params: {
      surface: sum((g) => g.X('u', 'v')), domain: [[0, 1], [0, 1]], n: 40, alpha: 0.78, dist: 8.5, pitch: 0.4, yaw: 0.3,
      choices: [{ key: 's', label: 'Surface', options: [[0, 'sphere'], [1, 'torus'], [2, 'saddle'], [3, 'cylinder']], value: 0, explain: 'Each is drawn from its own parameterization on the unit square of (u, v).' }],
      sliders: [
        { key: 'a', label: '$u$', min: 0, max: 1, step: 0.005, value: 0.08, explain: 'First coordinate, scaled to run from 0 to 1 on every surface.' },
        { key: 'b', label: '$v$', min: 0.02, max: 0.98, step: 0.005, value: 0.3, explain: 'Second coordinate, scaled the same way (the sphere’s poles are left out).' },
      ],
      curves: [0, 1, 2, 3].flatMap(extras),
      readouts: [{ label: t`$n_z$`, expr: sum((g) => g.n('a', 'b'))[2], digits: 3 }],
    },
    caption: t`Sphere of radius 1.6; torus with $R = 1.7$, $r = 0.7$; saddle $z = (x^2 - y^2)/3$ over $|x|, |y| \le 1.8$; cylinder of radius 1.2. Parameters are rescaled to the unit square, so for the sphere $\theta = \pi v$ and $\varphi = 2\pi u$. The normal is drawn 0.9 long; the readout is its vertical component.`,
  },
  example: {
    prompt: t`For the torus with $R = 2$, $r = 1$, compare three points: the outer equator $p_1 = (3, 0, 0)$, the inner equator $p_2 = (1, 0, 0)$ and the top $p_3 = (2, 0, 1)$. At each, find $\mathbf n$ (pointing out of the tube) and decide how the torus sits against the tangent plane, using the height $h = (\mathbf X - p)\cdot\mathbf n$ of nearby points above the plane.`,
    visual: one(1, { curves: [{ param: G[1].X('t', 0), t: [0, 1], color: 'gold', width: 2.4 }, { param: G[1].X('t', 0.5), t: [0, 1], color: 'violet', width: 2.4 }, { param: G[1].X('t', 0.25), t: [0, 1], color: 'accent', width: 2.4 }], pitch: 0.55, dist: 8 }, t`The outer equator (gold), inner equator (violet) and top circle (blue) of a torus (drawn with $R = 1.7$, $r = 0.7$).`),
    steps: [
      { label: 'Normals', text: t`$\mathbf n = (\cos v\cos u,\ \cos v\sin u,\ \sin v)$, so at $p_1$ ($u = 0$, $v = 0$) $\mathbf n = (1, 0, 0)$; at $p_2$ ($v = \pi$) $\mathbf n = (-1, 0, 0)$, toward the axis; at $p_3$ ($v = \pi/2$) $\mathbf n = (0, 0, 1)$.` },
      { label: 'Outer point', text: t`$h = (2 + \cos v)\cos u - 3 \approx -\tfrac32u^2 - \tfrac12v^2$ for small $u, v$. Negative in every direction: the torus lies on one side, touching at $p_1$ alone — like a sphere.` },
      { label: 'Inner point', text: t`With $v = \pi + w$: $h = 1 - (2 - \cos w)\cos u \approx \tfrac12u^2 - \tfrac12w^2$. Positive along the inner equator ($w = 0$), negative across it ($u = 0$): the plane cuts through — like a saddle.` },
      { label: 'Top point', text: t`With $v = \tfrac\pi2 + w$: $h = \sin v - 1 \approx -\tfrac12w^2$, with no $u$ term at all. The plane $z = 1$ touches along the whole top circle and the torus lies below it — like a cylinder along its ruling.` },
      { label: 'Read the pattern', text: t`The quadratic part of $h$ decides: definite (one sign), indefinite (both signs), or degenerate (zero in one direction). Module C5 names that quadratic form the **second fundamental form** — and it is built from $\mathbf n$.` },
    ],
    answer: t`Outer equator: $\mathbf n = (1, 0, 0)$, one side, sphere-like. Inner equator: $\mathbf n = (-1, 0, 0)$, both sides, saddle-like. Top: $\mathbf n = (0, 0, 1)$, one side, touching along a circle, cylinder-like.`,
  },
  practice: [
    match({
      id: 'param-gallery', difficulty: 1,
      prompt: 'Match each parameterization to its surface.',
      left: [t`$(2\sin u\cos v,\ 2\sin u\sin v,\ 2\cos u)$`, t`$(2\cos u,\ 2\sin u,\ v)$`, t`$(u,\ v,\ uv)$`, t`$\big((3 + \cos v)\cos u,\ (3 + \cos v)\sin u,\ \sin v\big)$`],
      right: ['sphere of radius 2', 'cylinder of radius 2', 'saddle', 'torus', 'cone'],
      answer: [0, 1, 2, 3],
      visual: one(0, { curves: [] }, 'One of the four surfaces, coloured by height.'),
      hints: ['Compute |X| for the first, and x² + y² for the second.', 'In the last one, the distance from the z-axis is 3 + cos v: a circle of radius 1 swept around the axis.'],
      teach: 'Recognize a surface from its parameterization by finding an equation its points satisfy.',
      explain: t`$|\mathbf X|^2 = 4$; $x^2 + y^2 = 4$ with $z$ free; $z = xy$; and $(\sqrt{x^2 + y^2} - 3)^2 + z^2 = 1$ — the torus with $R = 3$, $r = 1$.`,
    }),
    mcq({
      id: 'saddle-plane', difficulty: 2,
      prompt: t`Where does the tangent plane at the origin meet the saddle $z = x^2 - y^2$?`,
      visual: { type: 'surface3d', params: { z: 'x^2 - y^2', domain: [[-1.5, 1.5], [-1.5, 1.5]], zscale: 0.5, alpha: 0.85 }, caption: t`The saddle $z = x^2 - y^2$, heights scaled by 0.5.` },
      choices: [t`Along the two lines $y = x$ and $y = -x$`, 'Only at the origin', t`Along the $x$-axis`, 'Along a circle round the origin'],
      answer: 0,
      why: {
        1: 'That is how a sphere meets its tangent plane. A saddle crosses its plane, so they share more than a point.',
        2: t`On the $x$-axis $z = x^2 > 0$: the surface is above the plane there.`,
        3: t`On a circle $x^2 + y^2 = \rho^2$ the height $x^2 - y^2 = \rho^2\cos2\varphi$ changes sign four times; it is zero only at four points of it.`,
      },
      hints: [t`At the origin $z_x = z_y = 0$, so the tangent plane is $z = 0$.`, t`Solve $x^2 - y^2 = 0$.`],
      teach: 'At a saddle point the tangent plane meets the surface in two crossing curves, and the surface lies on both sides.',
      explain: t`The tangent plane is $z = 0$, and $x^2 - y^2 = 0$ on the lines $y = \pm x$. Between them the surface is alternately above ($|x| > |y|$) and below ($|x| < |y|$) the plane.`,
    }),
    mcq({
      id: 'cylinder-normals', difficulty: 2,
      prompt: t`Draw every unit normal of the cylinder $x^2 + y^2 = a^2$ from one common origin. Where do their tips lie on the unit sphere?`,
      visual: one(3, { curves: [0, 0.25, 0.5, 0.75].flatMap((u) => [0.2, 0.8].map((v) => ({ param: G[3].X(u, v).map((p, i) => `${p} + 0.8*t*(${G[3].n(u)[i]})`), t: [0, 1], color: 'bad', width: 3 }))), pitch: 0.5 }, 'A cylinder with some of its unit normals (red).'),
      choices: ['On the equator: a single circle', 'All over the sphere', 'At a single point', 'On a band around the equator of non-zero width'],
      answer: 0,
      why: {
        1: 'That is the sphere’s Gauss map. A cylinder’s normals never tilt up or down.',
        2: 'Only a plane has a single normal direction; the cylinder’s normal turns as you go round.',
        3: t`$\mathbf n = (\cos\varphi, \sin\varphi, 0)$ has no vertical part at all, so there is no band — just the circle.`,
      },
      hints: [t`$\mathbf n = (\cos\varphi, \sin\varphi, 0)$, the same for every $z$.`],
      teach: 'The normals of a cylinder sweep out only a curve on the sphere of directions — the image of its Gauss map has zero area.',
      explain: t`The Gauss map sends the whole cylinder onto the equator, a curve of zero area. A sphere’s Gauss map covers all $4\pi$ steradians. In module C5 that area ratio becomes the Gaussian curvature: 0 for the cylinder, $1/a^2$ for the sphere.`,
    }),
    mcq({
      id: 'torus-cuts', difficulty: 2,
      prompt: t`At which points of a torus does the tangent plane cut through the surface, with points of the torus on both sides arbitrarily close to the point of contact?`,
      visual: one(1, { pitch: 0.6, dist: 8 }, 'A torus. Imagine its tangent plane at the outer rim, on top, and in the hole.'),
      choices: ['Only on the inner half, the side facing the hole', 'Only on the outer half', 'On the top and bottom circles', 'Nowhere: a torus is convex'],
      answer: 0,
      why: {
        1: 'On the outer half the torus curves away from the plane in every direction, like a sphere.',
        2: 'There the plane touches along the whole circle and the torus lies below (or above) it.',
        3: 'A torus is not convex: the hole makes its inner side saddle-shaped.',
      },
      hints: ['Recall the worked example: the height h ≈ ½u² − ½w² at the inner equator.'],
      teach: 'A torus has sphere-like points outside, saddle-like points inside, and cylinder-like circles on top and bottom.',
      explain: t`On the inner half ($\cos v < 0$) the torus bends round the axis one way and round the tube the other way, so the plane cuts it. The top and bottom circles separate the two regions — exactly where the normal is vertical.`,
    }),
    num({
      id: 'unroll', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 0.75, 1.2, 1.6]), h = r.pick([2, 3, 5]);
        const L = Math.hypot(2 * Math.PI * a, h);
        return {
          prompt: t`A cable is routed once round a cylindrical propellant tank of radius $${a}\ \text{m}$, climbing $${h}\ \text{m}$ as it goes round, lying flat on the tank wall. What is the shortest length of cable that does this?`,
          visual: one(3, { curves: [{ param: [`1.2*cos(2*pi*t)`, `1.2*sin(2*pi*t)`, `-1.6 + 3.2*t`], t: [0, 1], color: 'gold', width: 2.8 }], pitch: 0.35 }, 'A cylinder with a helix that goes once round while climbing (not to scale).'),
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * a + h, feedback: 'Going round and then straight up is longer. Unroll the tank wall into a flat rectangle: the shortest path is its diagonal.' }, { value: h, feedback: 'That would not go round the tank. The cable must wrap once.' }],
          hints: ['Cut the cylinder along a vertical line and unroll it flat — lengths on the surface do not change.', t`The unrolled wall is a rectangle $2\pi a$ wide; the cable joins opposite corners of a $2\pi a \times ${h}$ rectangle.`],
          teach: 'A cylinder unrolls onto a plane without stretching, so its shortest paths are straight lines in the unrolled picture — helices.',
          explain: t`$L = \sqrt{(2\pi\times${a})^2 + ${h}^2} = ${nice(L, 4)}$ m. Unrolling preserves every length on the surface — the cylinder is **intrinsically flat**, though bent in space. Module C4 calls this an isometry; the sphere has none onto the plane, which is why every flat map of the Earth distorts.`,
        };
      },
    }),
    order({
      id: 'saddle-sides', difficulty: 3,
      prompt: t`Show that the saddle $z = xy$ has points on both sides of its tangent plane arbitrarily close to the origin. Order the steps.`,
      visual: { type: 'surface3d', params: { z: 'x*y', domain: [[-1.5, 1.5], [-1.5, 1.5]], zscale: 0.6, alpha: 0.85, curves: [{ param: ['t', 't', 't^2'], t: [-1.2, 1.2], color: 'gold', width: 2.6 }, { param: ['t', '-t', '-t^2'], t: [-1.2, 1.2], color: 'violet', width: 2.6 }] }, caption: t`The saddle $z = xy$ (heights × 0.6) with the curves above $y = x$ (gold) and $y = -x$ (violet).` },
      items: [
        t`At the origin $z_x = y = 0$ and $z_y = x = 0$, so the tangent plane is $z = 0$ and $\mathbf n = (0, 0, 1)$.`,
        t`The height of a nearby surface point above the plane is $h = xy$.`,
        t`Along $y = x$: $h = x^2 > 0$ for every $x \ne 0$.`,
        t`Along $y = -x$: $h = -x^2 < 0$ for every $x \ne 0$.`,
        'Both signs occur at points as close to the origin as you like: the plane cuts through the surface.',
      ],
      hints: ['First find the tangent plane at the origin.', 'Then look for one direction in which the surface rises and one in which it falls.'],
      teach: 'To show a surface crosses its tangent plane, exhibit two curves through the point that leave the plane on opposite sides.',
      explain: t`$z = xy$ is $z = x^2 - y^2$ turned through $45^\circ$ (and scaled): $xy = \tfrac12(x'^2 - y'^2)$ with $x' = (x + y)/\sqrt2$, $y' = (x - y)/\sqrt2$. The same saddle, in rotated coordinates.`,
    }),
    mcq({
      id: 'coord-sing', difficulty: 2,
      prompt: 'Which of the four standard parameterizations in the table has a coordinate singularity — a point where the surface is smooth but the patch is not regular?',
      visual: one(0, { curves: [0.05, 0.1, 0.15].map((v) => ({ param: G[0].X('t', v), t: [0, 1], color: 'violet', width: 1.6 })), pitch: 0.7 }, 'Three parallels close to the north pole, crowding together.'),
      choices: [t`The sphere’s $(\theta, \varphi)$, at its poles`, t`The torus’s $(u, v)$, on its inner equator`, t`The cylinder’s $(\varphi, z)$, along its seam`, t`The saddle’s graph patch $(x, y)$, at its centre`],
      answer: 0,
      why: {
        1: t`On the torus $|\mathbf X_u\times\mathbf X_v| = r(R + r\cos v) \ge r(R - r) > 0$ everywhere, the inner equator included.`,
        2: t`$|\mathbf X_\varphi\times\mathbf X_z| = a$ everywhere. The seam only matters for being one-to-one.`,
        3: 'A graph patch is always regular: its cross product has third component 1.',
      },
      hints: [t`Where does $|\mathbf X_u\times\mathbf X_v|$ vanish in each case?`],
      teach: 'Of the four, only the sphere’s standard coordinates break down, at the poles — a flaw of the coordinates, not of the sphere.',
      explain: t`$|\mathbf X_\theta\times\mathbf X_\varphi| = a^2\sin\theta = 0$ at the poles. The torus, cylinder and graph patches are regular everywhere; the torus and cylinder are not one-to-one on the closed square, but that is a different issue.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-heat-shield', difficulty: 3, transfer: true,
      gen(r) {
        const [R, rho] = r.pick([[4.7, 1.95], [4.7, 1.5], [6, 2.5], [3.5, 1.2]]);
        const al = Math.asin(rho / R), om = 2 * Math.PI * (1 - Math.cos(al));
        return {
          prompt: t`A capsule’s heat shield is a spherical cap: part of a sphere of radius $${R}\ \text{m}$, with a circular rim of radius $${rho}\ \text{m}$. Its outward normals point into a cone of directions. What solid angle do they cover — the area of the shield’s Gauss image on the unit sphere — in steradians?`,
          visual: one(0, { domain: [[0, 1], [r6(1 - al / Math.PI), 1]], curves: [{ param: G[0].X('t', r6(1 - al / Math.PI)), t: [0, 1], color: 'gold', width: 2.4 }, ...[0, 0.33, 0.67].map((u) => ({ param: G[0].X(u, r6(1 - al / Math.PI)).map((q, i) => `${q} + 0.9*t*(${G[0].n(u, r6(1 - al / Math.PI))[i]})`), t: [0, 1], color: 'bad', width: 2.6 }))], pitch: 0.25, dist: 4.2, target: [0, 0, -1.45] }, 'The shield’s true shape, scaled down, facing the flow below it, with its rim (gold) and the normals at three rim points (red).'),
          answer: om, units: 'sr', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * R * R * (1 - Math.cos(al)), feedback: t`That is the shield’s area in $\text{m}^2$. The Gauss image lives on the *unit* sphere: divide by $R^2$.` }, { value: Math.PI * al * al, feedback: t`A small flat disc of angular radius $\alpha$ would cover about $\pi\alpha^2$; the exact cap area is $2\pi(1 - \cos\alpha)$.` }].filter((e) => Math.abs(e.value - om) > 0.03 * om),
          hints: [t`On a sphere $\mathbf n$ is the radial direction, so the normals fill a cone of half-angle $\alpha$ with $\sin\alpha = ${rho}/${R}$.`, t`A cap of half-angle $\alpha$ on the unit sphere has area $2\pi(1 - \cos\alpha)$.`],
          teach: 'The Gauss image of a spherical cap is the same cap, shrunk onto the unit sphere: area divided by R².',
          explain: t`$\alpha = \arcsin(${rho}/${R}) = ${nice((al * 180) / Math.PI, 3)}^\circ$, so the normals cover $2\pi(1 - \cos\alpha) = ${nice(om, 3)}$ sr. The shield’s own area is $${nice(2 * Math.PI * R * R * (1 - Math.cos(al)), 3)}\ \text{m}^2$; their ratio is $1/R^2 = ${nice(1 / (R * R), 3)}\ \text{m}^{-2}$ — the Gaussian curvature of the sphere, as module C5 will define it. A flatter shield (larger $R$) turns its normals less.`,
        };
      },
    }),
    mcq({
      id: 'cp-ruling', difficulty: 3,
      prompt: 'Both the cylinder and the saddle z = xy contain straight lines. Along which of these lines does the unit normal stay the same?',
      visual: { type: 'surface3d', params: { z: 'x*y', domain: [[-1.5, 1.5], [-1.5, 1.5]], zscale: 0.6, alpha: 0.85, curves: [{ param: ['0.8', 't', '0.8*t'], t: [-1.5, 1.5], color: 'gold', width: 2.8 }] }, caption: t`The saddle $z = xy$ (heights × 0.6) and one of its straight lines, $x = 0.8$ (gold).` },
      choices: ['Along a vertical line of the cylinder, but not along a line of the saddle', 'Along a line of the saddle, but not along the cylinder’s', 'Along both', 'Along neither'],
      answer: 0,
      why: {
        1: t`On the line $x = c$ of $z = xy$, $\mathbf n \propto (-y, -c, 1)$: it turns as $y$ changes. The saddle twists along its rulings.`,
        2: t`The saddle’s normal changes along its lines, as $(-y, -c, 1)$ shows.`,
        3: t`On the cylinder $\mathbf n = (\cos\varphi, \sin\varphi, 0)$ does not depend on $z$: constant along each vertical line.`,
      },
      hints: [t`Write the unit normal of each surface and restrict it to one of its straight lines.`, t`Cylinder: $\mathbf n = (\cos\varphi, \sin\varphi, 0)$. Saddle $z = xy$: $\mathbf n \propto (-z_x, -z_y, 1) = (-y, -x, 1)$.`],
      teach: 'Along the rulings of a cylinder the tangent plane stays fixed — the mark of a surface that unrolls flat; a saddle’s tangent plane twists along its lines.',
      explain: 'Surfaces whose tangent plane is constant along each ruling are the developable ones (cylinders, cones, tangent developables): they unroll onto a plane. The saddle is ruled but not developable, and module C6 will show why it cannot be: its Gaussian curvature is negative.',
    }),
    num({
      id: 'cp-torus-gauss', difficulty: 3,
      prompt: t`The outward normal of the torus is $\mathbf n = (\cos v\cos u,\ \cos v\sin u,\ \sin v)$. On the **outer half** ($-\pi/2 \le v \le \pi/2$), what area of the unit sphere do the normals cover, in steradians?`,
      visual: one(1, { domain: [[0, 1], [-0.25, 0.25]], pitch: 0.6, dist: 8 }, 'The outer half of the torus.'),
      answer: 4 * Math.PI, units: 'sr', tol: { rel: 0.01 },
      errors: [{ value: 2 * Math.PI, feedback: t`With $v$ from $-\pi/2$ to $\pi/2$ and $u$ all the way round, $\mathbf n$ runs over every latitude and every longitude of the unit sphere.` }, { value: 0, feedback: t`The outer half bends in two directions, like a sphere: its normals spread over an area, not a curve.` }],
      hints: [t`Compare $\mathbf n(u, v)$ with spherical coordinates on the unit sphere: $v$ plays the role of latitude.`, 'As u goes round and v runs from −π/2 to π/2, how much of the unit sphere is reached, and how many times?'],
      teach: 'The outer half of a torus has the same Gauss image as a whole sphere.',
      explain: t`$\mathbf n(u, v)$ is the point of latitude $v$ and longitude $u$ on the unit sphere, so the outer half covers it exactly once: $4\pi$ sr. The inner half covers it once more with the orientation reversed. Counted with sign the total is $4\pi - 4\pi = 0$ — the torus’s total Gaussian curvature, as the Gauss–Bonnet theorem (C6) will require of any surface shaped like a doughnut.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §2-2 (examples) and §3-2 (the Gauss map)', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Needham, Visual Differential Geometry and Forms, Act II', url: 'https://press.princeton.edu/books/hardcover/9780691203690/visual-differential-geometry-and-forms' },
  ],
});
