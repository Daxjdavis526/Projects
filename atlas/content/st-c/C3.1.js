// Parameterized surfaces: patches X(u, v), coordinate curves, regularity
// X_u × X_v ≠ 0, coordinate singularities versus genuine ones, charts.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';

const t = String.raw;
const DEG = Math.PI / 180;
const PI = r6(Math.PI), TAU = r6(2 * Math.PI);

// a parametric surface for surface3d, with optional curves on it
const surf = (surface, domain, { curves = [], caption, sliders, readouts, zscale, dist, pitch, yaw, colorBy } = {}) => ({
  type: 'surface3d',
  params: { surface, domain, curves, ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}), ...(zscale ? { zscale } : {}), ...(dist ? { dist } : {}), ...(pitch != null ? { pitch } : {}), ...(yaw != null ? { yaw } : {}), ...(colorBy === false ? { colorBy: false } : {}), alpha: 0.82 },
  caption,
});
// the round sphere of radius 2 in physics coordinates (u = θ from +z, v = φ)
const SPH = (u, v) => [`2*sin(${u})*cos(${v})`, `2*sin(${u})*sin(${v})`, `2*cos(${u})`];

export default lesson({
  id: 'st-c.C3.1',
  title: 'Parameterized surfaces',
  minutes: 12, difficulty: 3,
  intro: t`A surface is described the way a map describes the Earth: by two coordinates. A **parameterized surface** (a patch) is a smooth map $\mathbf X: U \to \mathbb R^3$ from an open set $U$ of the $(u, v)$-plane. Holding $v$ fixed and varying $u$ traces a **coordinate curve**, with velocity $\mathbf X_u = \partial\mathbf X/\partial u$; likewise $\mathbf X_v$. The patch is **regular** when these two vectors are never parallel:

$$\mathbf X_u \times \mathbf X_v \ne \mathbf 0 \quad\text{at every point of } U.$$

Then a small coordinate rectangle $du\,dv$ maps to a genuine little parallelogram of area $|\mathbf X_u\times\mathbf X_v|\,du\,dv$. Where the cross product vanishes, the patch squashes a rectangle flat — and you must ask whether the **surface** is singular there, or only the **coordinates**.`,
  symbols: [
    { tex: t`\mathbf X(u, v)`, text: t`the patch: the point of space with coordinates $(u, v)$` },
    { tex: 'U', text: t`an open set of the $(u, v)$-plane: the coordinate domain` },
    { tex: t`\mathbf X_u,\ \mathbf X_v`, text: t`partial derivatives: the velocities of the coordinate curves, in length per unit of $u$ or $v$` },
    { tex: t`\mathbf X_u\times\mathbf X_v`, text: t`perpendicular to both; its length is the area stretch factor of the patch` },
  ],
  why: t`A patch is the first **chart**. Module C8 defines a manifold as a space covered by charts that overlap smoothly — and the sphere already shows why one chart is never enough for a closed surface, and why a coordinate singularity (the pole here, the horizon $r = 2M$ of Schwarzschild coordinates later) need not be a singularity of the space.`,
  visual: {
    type: 'surface3d',
    title: 'Coordinates on a sphere',
    lead: t`The sphere of radius 2 in the coordinates $(\theta, \varphi)$: $\theta$ measured from the north pole, $\varphi$ round the axis. The gold curve is the meridian $\varphi = \varphi_0$, the violet one the parallel $\theta = \theta_0$; they cross at the point $\mathbf X(\theta_0, \varphi_0)$, where short segments show $\mathbf X_\theta$ (gold) and $\mathbf X_\varphi$ (violet) at half length.`,
    tasks: [
      t`Slide $\theta_0$ toward 0. The parallel shrinks to a point, $|\mathbf X_\varphi| = 2\sin\theta_0 \to 0$ and the area factor goes to 0 — yet the sphere at its pole is as smooth as anywhere. The coordinates fail, not the surface.`,
      t`Set $\varphi_0 = 0$ and then $\varphi_0 = 2\pi$: the same meridian. To be one-to-one a patch must leave out a seam, so a single $(\theta, \varphi)$ patch never covers the whole sphere.`,
      t`At the equator, $\theta_0 = \pi/2$, the area factor is largest, 4: equal steps of $\theta$ and $\varphi$ cover the most area there.`,
    ],
    params: {
      surface: SPH('u', 'v'), domain: [[0, PI], [0, TAU]], alpha: 0.8,
      sliders: [
        { key: 'a', label: t`$\theta_0$`, min: 0, max: 3.14, step: 0.01, value: 1, explain: 'Angle from the north pole, in radians.' },
        { key: 'b', label: t`$\varphi_0$`, min: 0, max: 6.28, step: 0.01, value: 0.8, explain: 'Angle round the axis, in radians.' },
      ],
      curves: [
        { param: SPH('t', 'b'), t: [0, PI], color: 'gold', width: 2.6 },
        { param: SPH('a', 't'), t: [0, TAU], color: 'violet', width: 2.6 },
        { param: [`2*sin(a)*cos(b) + t*cos(a)*cos(b)`, `2*sin(a)*sin(b) + t*cos(a)*sin(b)`, `2*cos(a) - t*sin(a)`], t: [0, 1], color: 'gold', width: 4 },
        { param: [`2*sin(a)*cos(b) - t*sin(a)*sin(b)`, `2*sin(a)*sin(b) + t*sin(a)*cos(b)`, `2*cos(a)`], t: [0, 1], color: 'violet', width: 4 },
      ],
      readouts: [
        { label: t`$|\mathbf X_\theta|$`, expr: '2', digits: 3 },
        { label: t`$|\mathbf X_\varphi|$`, expr: '2*sin(a)', digits: 3 },
        { label: t`$|\mathbf X_\theta\times\mathbf X_\varphi|$`, expr: '4*sin(a)', digits: 3 },
      ],
    },
    caption: t`$\mathbf X(\theta, \varphi) = 2(\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)$, coloured by height. The two short thick segments are $\tfrac12\mathbf X_\theta$ and $\tfrac12\mathbf X_\varphi$, drawn without arrowheads.`,
  },
  example: {
    prompt: t`Rotate a profile curve $(f(v), g(v))$, with $f > 0$, about the $z$-axis: $\mathbf X(u, v) = \big(f(v)\cos u,\ f(v)\sin u,\ g(v)\big)$. Find $|\mathbf X_u\times\mathbf X_v|$ and decide when the surface of revolution is regular. Then apply it to the torus, with profile the circle $f = R + r\cos v$, $g = r\sin v$ ($R > r > 0$).`,
    visual: surf(['(2 + 0.8*cos(v))*cos(u)', '(2 + 0.8*cos(v))*sin(u)', '0.8*sin(v)'], [[0, TAU], [0, TAU]], {
      curves: [{ param: ['(2 + 0.8*cos(t))*cos(0.6)', '(2 + 0.8*cos(t))*sin(0.6)', '0.8*sin(t)'], t: [0, TAU], color: 'gold', width: 2.6 }, { param: ['(2 + 0.8*cos(1.2))*cos(t)', '(2 + 0.8*cos(1.2))*sin(t)', '0.8*sin(1.2)'], t: [0, TAU], color: 'violet', width: 2.6 }],
      caption: t`A torus with $R = 2$, $r = 0.8$: a profile circle (gold, $u$ fixed) and a parallel (violet, $v$ fixed).`, dist: 10, pitch: 0.7,
    }),
    steps: [
      { label: 'Partials', text: t`$\mathbf X_u = (-f\sin u,\ f\cos u,\ 0)$ and $\mathbf X_v = (f'\cos u,\ f'\sin u,\ g')$.` },
      { label: 'Cross product', text: t`$\mathbf X_u\times\mathbf X_v = \big(f g'\cos u,\ f g'\sin u,\ -f f'\big)$.` },
      { label: 'Length', text: t`$|\mathbf X_u\times\mathbf X_v| = |f|\sqrt{f'^2 + g'^2}$: the distance from the axis times the speed of the profile curve.` },
      { label: 'When regular', text: t`Regular exactly when $f \ne 0$ (the profile stays off the axis) and $(f', g') \ne 0$ (the profile curve is regular). Rotating a regular curve that never touches the axis gives a regular surface.` },
      { label: 'Torus', text: t`$f' = -r\sin v$, $g' = r\cos v$, so $\sqrt{f'^2 + g'^2} = r$ and $|\mathbf X_u\times\mathbf X_v| = r(R + r\cos v)$, which is at least $r(R - r) > 0$. Regular everywhere.` },
      { label: 'Sense check', text: t`The factor is largest on the outer equator ($v = 0$), $r(R + r)$, and smallest on the inner one, $r(R - r)$: the same $du\,dv$ covers more area on the outside, where the parallels are longer ✓.` },
    ],
    answer: t`$|\mathbf X_u\times\mathbf X_v| = |f|\sqrt{f'^2 + g'^2}$, regular when the profile is regular and off the axis; for the torus $r(R + r\cos v) > 0$ everywhere.`,
  },
  practice: [
    num({
      id: 'helicoid', difficulty: 2,
      gen(r) {
        const c = r.pick([0.5, 1, 2]), v0 = r.pick([0.5, 1, 1.5, 2]);
        const ans = Math.hypot(c, v0);
        return {
          prompt: t`The helicoid $\mathbf X(u, v) = (v\cos u,\ v\sin u,\ ${c}\,u)$ is the surface swept by a horizontal line turning as it climbs. Find $|\mathbf X_u\times\mathbf X_v|$ at a point with $v = ${v0}$.`,
          visual: surf(['v*cos(u)', 'v*sin(u)', `${c}*u`], [[-3.14, 3.14], [-2, 2]], { curves: [{ param: [`${v0}*cos(t)`, `${v0}*sin(t)`, `${c}*t`], t: [-3.14, 3.14], color: 'gold', width: 2.6 }], caption: t`The helicoid for $-\pi \le u \le \pi$, $-2 \le v \le 2$; the gold helix is the coordinate curve $v = ${v0}$.`, zscale: r6(Math.min(1, 0.9 / c)), pitch: 0.45 }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: v0, feedback: t`That is $|\mathbf X_u|$ without the climb: $\mathbf X_u = (-v\sin u,\ v\cos u,\ ${c})$ has a vertical part too.` }, { value: c * v0, feedback: t`The cross product is $(-${c}\sin u,\ ${c}\cos u,\ -v)$; its length is a square root of a sum of squares.` }],
          hints: [t`$\mathbf X_u = (-v\sin u,\ v\cos u,\ ${c})$ and $\mathbf X_v = (\cos u,\ \sin u,\ 0)$.`, t`$\mathbf X_u\times\mathbf X_v = (-${c}\sin u,\ ${c}\cos u,\ -v)$.`],
          teach: t`The area stretch factor of a patch is $|\mathbf X_u\times\mathbf X_v|$.`,
          explain: t`$|\mathbf X_u\times\mathbf X_v| = \sqrt{${c}^2 + v^2} = \sqrt{${nice(c * c)} + ${nice(v0 * v0)}} = ${nice(ans, 4)}$. It never vanishes (it is at least $${c}$, on the axis), so the helicoid is regular everywhere — even on the axis, unlike the cone.`,
        };
      },
    }),
    mcq({
      id: 'sphere-singular', difficulty: 1,
      prompt: t`Where does the patch $\mathbf X(\theta, \varphi) = R(\sin\theta\cos\varphi,\ \sin\theta\sin\varphi,\ \cos\theta)$ fail to be regular?`,
      visual: surf(SPH('u', 'v'), [[0, PI], [0, TAU]], { curves: [0.4, 0.8, 1.2, 1.57, 1.97, 2.37, 2.74].map((a) => ({ param: SPH(a, 't'), t: [0, TAU], color: 'violet', width: 1.6 })).concat([0, 1, 2, 3, 4, 5].map((b) => ({ param: SPH('t', b), t: [0, PI], color: 'gold', width: 1.6 }))), caption: 'Parallels (violet) and meridians (gold) at equal steps of θ and φ.' }),
      choices: [t`At the poles, $\theta = 0$ and $\theta = \pi$`, t`Along the seam $\varphi = 0$`, 'On the equator', 'Nowhere: the sphere is smooth'],
      answer: 0,
      why: {
        1: t`On the seam the patch is perfectly regular; the trouble there is that $\varphi = 0$ and $\varphi = 2\pi$ give the same points, so the domain must leave one of them out to be one-to-one.`,
        2: t`On the equator $|\mathbf X_\theta\times\mathbf X_\varphi| = R^2$, its largest value.`,
        3: t`The sphere is smooth, but this *parameterization* still fails at the poles: $\mathbf X_\varphi = 0$ there.`,
      },
      hints: [t`Compute $|\mathbf X_\varphi|$.`, t`$\mathbf X_\theta\times\mathbf X_\varphi = R^2\sin\theta\,(\sin\theta\cos\varphi, \sin\theta\sin\varphi, \cos\theta)$.`],
      teach: t`$|\mathbf X_\theta\times\mathbf X_\varphi| = R^2\sin\theta$ vanishes at the poles: a coordinate singularity of a smooth surface.`,
      explain: t`At $\theta = 0$ every $\varphi$ gives the north pole, so $\mathbf X_\varphi = 0$ and the cross product vanishes. Another patch — say spherical coordinates about the $x$-axis, or a stereographic projection — is regular there, which proves the sphere itself is fine.`,
    }),
    mcq({
      id: 'cone-vs-sphere', difficulty: 3,
      prompt: t`The cone $\mathbf X(u, v) = (v\cos u,\ v\sin u,\ v)$ with $v > 0$ and the sphere in $(\theta, \varphi)$ both have $\mathbf X_u\times\mathbf X_v \to 0$ at one special point: the apex $v \to 0$, and the pole $\theta = 0$. What is the difference?`,
      visual: surf(['v*cos(u)', 'v*sin(u)', 'v'], [[0, TAU], [0, 1.8]], { curves: [0.6, 1.2, 1.8].map((b) => ({ param: [`${b}*cos(t)`, `${b}*sin(t)`, `${b}`], t: [0, TAU], color: 'violet', width: 1.6 })), caption: 'The cone z = √(x² + y²), with three parallels. Near the apex every patch must squeeze its parallels to a point.', pitch: 0.35 }),
      choices: [
        'The apex is a genuine singular point of the surface: no regular patch covers it. The pole is only a failure of one set of coordinates',
        'Both are only coordinate artefacts: other coordinates would make both regular',
        'Both are genuine singularities, since in each case the cross product vanishes',
        'The cone is regular at the apex, because its parameterization is linear in v',
      ],
      answer: 0,
      why: {
        1: 'No coordinates can fix the apex: near it the cone is not even the graph of a differentiable function over any plane, and it has no tangent plane.',
        2: 'A vanishing cross product indicts the coordinates, not necessarily the surface — the sphere at its pole proves it.',
        3: t`At $v = 0$, $\mathbf X_u = (-v\sin u, v\cos u, 0) = 0$: this patch is singular there whatever its form.`,
      },
      hints: ['Can you find another patch of the sphere that is regular at the pole? Of the cone at the apex?', 'A regular surface has a tangent plane at every point. Does the cone have one at its apex?'],
      teach: 'A vanishing Xᵤ × Xᵥ can mean bad coordinates on a good surface, or a surface with a genuine singular point — check with other coordinates.',
      explain: 'Near the pole the sphere is the graph z = √(R² − x² − y²), a smooth patch; near the apex the cone is z = √(x² + y²), which is not differentiable at the origin, and there is no tangent plane there. General relativity faces the same question at r = 2M of Schwarzschild coordinates (a coordinate singularity) and at r = 0 (a genuine one), and settles it the same way: by changing coordinates and by computing invariants.',
    }),
    expr({
      id: 'graph-factor', difficulty: 2,
      gen(r) {
        const [f, fu, fv, ftex] = r.pick([
          ['u*v', 'v', 'u', t`uv`],
          ['u^2 - v^2', '2u', '-2v', t`u^2 - v^2`],
          ['0.5u^2 + v^2', 'u', '2v', t`\tfrac12u^2 + v^2`],
          ['u^2 + 2v', '2u', '2', t`u^2 + 2v`],
        ]);
        return {
          prompt: t`For the graph $\mathbf X(u, v) = \big(u,\ v,\ ${ftex}\big)$, find the area factor $|\mathbf X_u\times\mathbf X_v|$ as a function of $u$ and $v$.`,
          visual: { type: 'surface3d', params: { z: f.replace(/u/g, 'x').replace(/v/g, 'y').replace(/(\d)([xy])/g, '$1*$2'), domain: [[-1.5, 1.5], [-1.5, 1.5]], zscale: 0.6 }, caption: t`The graph over the square $-1.5 \le u, v \le 1.5$, heights scaled by 0.6.` },
          answer: `sqrt(1 + (${fu})^2 + (${fv})^2)`, answerTeX: t`\sqrt{1 + (${fu})^2 + (${fv})^2}`,
          vars: { u: [-2, 2], v: [-2, 2] },
          errors: [{ answer: `sqrt((${fu})^2 + (${fv})^2)`, feedback: t`You lost the 1: $\mathbf X_u\times\mathbf X_v = (-f_u,\ -f_v,\ 1)$, and its third component is always 1.` }],
          hints: [t`$\mathbf X_u = (1, 0, f_u)$ and $\mathbf X_v = (0, 1, f_v)$.`, t`$\mathbf X_u\times\mathbf X_v = (-f_u,\ -f_v,\ 1)$.`],
          teach: t`A graph is always regular: $|\mathbf X_u\times\mathbf X_v| = \sqrt{1 + f_u^2 + f_v^2} \ge 1$.`,
          explain: t`With $f_u = ${fu}$ and $f_v = ${fv}$, $|\mathbf X_u\times\mathbf X_v| = \sqrt{1 + (${fu})^2 + (${fv})^2}$. Its third component, 1, never vanishes, so every graph of a smooth function is a regular patch — and every regular surface is locally such a graph over one of the coordinate planes.`,
        };
      },
    }),
    num({
      id: 'reparam-det', difficulty: 3,
      gen(r) {
        const p = r.intExcept(-2, 2, [0]), q = r.pick([1, 2, -2]), rr = r.intExcept(-2, 2, [0]), s = r.intExcept(-2, 2, [0]);
        let det = p * s - q * rr, Q = q;
        if (det === 0) { Q = q + (q > 0 ? 1 : -1); det = p * s - Q * rr; }
        return {
          prompt: t`A patch $\mathbf X(u, v)$ is re-expressed in new coordinates by $u = ${p}\bar u ${Q < 0 ? '-' : '+'} ${Math.abs(Q)}\bar v$, $v = ${rr}\bar u ${s < 0 ? '-' : '+'} ${Math.abs(s)}\bar v$, giving $\bar{\mathbf X}(\bar u, \bar v) = \mathbf X(u, v)$. By what factor $c$ is $\bar{\mathbf X}_{\bar u}\times\bar{\mathbf X}_{\bar v} = c\,\mathbf X_u\times\mathbf X_v$?`,
          visual: { type: 'graph', params: { x: [-4.5, 4.5], y: [-3.2, 3.2], equal: true, aspect: 'wide', xlabel: 'u', ylabel: 'v', arrows: [{ from: [0, 0], to: [p, rr], color: 'accent', label: '∂/∂ū' }, { from: [0, 0], to: [Q, s], color: 'gold', label: '∂/∂v̄' }] }, caption: t`In the $(u, v)$-plane: the images of the new coordinate directions, $(\partial u/\partial\bar u, \partial v/\partial\bar u)$ and $(\partial u/\partial\bar v, \partial v/\partial\bar v)$.` },
          answer: det, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: p * s + Q * rr, feedback: t`A $2\times2$ determinant is $ps - qr$: the off-diagonal product is subtracted.` }].filter((e) => e.value !== det && e.value !== -det),
          hints: [t`Chain rule: $\bar{\mathbf X}_{\bar u} = ${p}\mathbf X_u + ${rr}\mathbf X_v$ and $\bar{\mathbf X}_{\bar v} = ${Q}\mathbf X_u + ${s}\mathbf X_v$.`, t`Expand the cross product: $\mathbf X_u\times\mathbf X_u = 0$ and $\mathbf X_v\times\mathbf X_u = -\mathbf X_u\times\mathbf X_v$.`],
          teach: t`Under a change of coordinates, $\mathbf X_u\times\mathbf X_v$ is multiplied by the Jacobian determinant $\partial(u, v)/\partial(\bar u, \bar v)$.`,
          explain: t`$(${p}\mathbf X_u + ${rr}\mathbf X_v)\times(${Q}\mathbf X_u + ${s}\mathbf X_v) = (${p}\cdot${s} - ${rr}\cdot${Q})\,\mathbf X_u\times\mathbf X_v = ${det}\,\mathbf X_u\times\mathbf X_v$. Since the determinant of an allowed change is never 0, regularity does not depend on the coordinates; ${det < 0 ? 'here it is negative, so the cross product — and the unit normal of the next lesson — points the other way' : 'its sign says whether the orientation, and so the direction of the normal, is kept'}.`,
        };
      },
    }),
    mcq({
      id: 'two-charts', difficulty: 3,
      prompt: 'Why can no single regular, one-to-one patch cover the whole sphere?',
      visual: { type: 'calc-vectors3d', params: { range: 2.2, spheres: [{ centre: [0, 0, 0], radius: 1.2, color: 'teal' }], planes: [{ normal: [0, 0, 1], d: 0, size: 2, color: 'violet', alpha: 0.15 }], points: [{ at: [0, 0, 1.2], color: 'bad', label: 'N' }, { at: [r6(1.2 * Math.sin(1.1)), 0, r6(1.2 * Math.cos(1.1))], color: 'gold', label: 'P' }, { at: [r6(1.2 * Math.sin(1.1) / (1 - Math.cos(1.1))), 0, 0], color: 'gold', label: '' }], segments: [{ from: [0, 0, 1.2], to: [r6(1.2 * Math.sin(1.1) / (1 - Math.cos(1.1))), 0, 0], color: 'ink2', dash: true }] }, caption: 'Stereographic projection from the north pole N: each point P maps to where the line NP meets the plane. It covers everything except N itself.' },
      choices: [
        'A patch is a homeomorphism from an open set of the plane; the sphere is compact and no open set of the plane is, so at least two patches are needed',
        'Because the poles are singular in spherical coordinates',
        'Because the sphere is curved; any curved surface needs two patches',
        'It can: stereographic projection covers the whole sphere',
      ],
      answer: 0,
      why: {
        1: 'That is one choice of coordinates. Stereographic projection has no singular poles, and still misses a point.',
        2: t`An infinite cylinder is curved in space, yet one patch covers it: $\mathbf X(p, q) = (p/\rho,\ q/\rho,\ \ln\rho)$ with $\rho = \sqrt{p^2 + q^2}$, on the punctured plane. Compactness, not curvature, is the obstruction.`,
        3: 'It misses the north pole, which goes off to infinity. Adding it back needs a second projection, from the south pole.',
      },
      hints: ['Think topologically: what property does the whole sphere have that no open subset of the plane has?', 'A one-to-one regular patch makes its image homeomorphic to its domain.'],
      teach: 'A closed surface needs at least two charts: one chart would make it homeomorphic to an open, non-compact piece of the plane.',
      explain: 'Two stereographic projections, from the north and the south pole, cover the sphere and overlap smoothly. That pair is the simplest atlas — the idea module C8 turns into the definition of a manifold.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-longitude', difficulty: 2, transfer: true,
      gen(r) {
        const lat = r.pick([60, 80, 89, 89.9, 45]);
        const L = (6371 * Math.cos(lat * DEG) * Math.PI) / 180;
        return {
          prompt: t`A GPS receiver reports latitude and longitude, which are spherical coordinates on the Earth (radius 6371 km, treated as a sphere): latitude is $90^\circ - \theta$. How far does one degree of longitude span at latitude $${lat}^\circ$, in km?`,
          visual: surf(['2*sin(u)*cos(v)', '2*sin(u)*sin(v)', '2*cos(u)'], [[0, PI], [0, TAU]], { curves: [{ param: SPH(r6((90 - lat) * DEG), 't'), t: [0, TAU], color: 'violet', width: 2.6 }, { param: SPH('t', 0), t: [0, PI], color: 'gold', width: 2 }, { param: SPH('t', r6(10 * DEG)), t: [0, PI], color: 'gold', width: 2 }], caption: t`The parallel at latitude $${lat}^\circ$ (violet) and two meridians $10^\circ$ apart (gold), on a sphere not to scale.` }),
          answer: L, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (6371 * Math.PI) / 180, feedback: t`That is the length of one degree on a great circle. A degree of longitude is along a parallel of radius $R\sin\theta = R\cos(\text{latitude})$: $|\mathbf X_\varphi| = R\sin\theta$.` }, { value: (6371 * Math.sin(lat * DEG) * Math.PI) / 180, feedback: t`$\theta$ is measured from the pole: $\sin\theta = \cos(\text{latitude})$, not $\sin(\text{latitude})$.` }].filter((e) => Math.abs(e.value - L) > 0.02 * L),
          hints: [t`A small step $d\varphi$ moves a distance $|\mathbf X_\varphi|\,d\varphi = R\sin\theta\,d\varphi$.`, t`$\theta = 90^\circ - ${lat}^\circ$ and $d\varphi = 1^\circ = \pi/180$ rad.`],
          teach: t`Coordinate steps are not distances: $|\mathbf X_\varphi| = R\sin\theta$ shrinks to 0 at the poles.`,
          explain: t`$6371\times\cos ${lat}^\circ\times\pi/180 = ${nice(L, 3)}$ km. ${lat >= 89 ? 'Near the pole longitude is almost meaningless — a few steps change it by tens of degrees — which is why polar navigation switches to a grid that is regular there.' : 'It falls to zero at the pole, where every longitude meets.'}`,
        };
      },
    }),
    num({
      id: 'cp-torus', difficulty: 2,
      gen(r) {
        const R = r.pick([3, 4, 5]), rr = r.pick([1, 2]), [v, vt] = r.pick([[0, '0'], [Math.PI / 2, t`\pi/2`], [Math.PI, t`\pi`], [Math.PI / 3, t`\pi/3`]]);
        const ans = rr * (R + rr * Math.cos(v));
        return {
          prompt: t`For the torus $\mathbf X(u, v) = \big((${R} + ${rr}\cos v)\cos u,\ (${R} + ${rr}\cos v)\sin u,\ ${rr}\sin v\big)$, find $|\mathbf X_u\times\mathbf X_v|$ at $v = ${vt}$.`,
          visual: surf([`(${R} + ${rr}*cos(v))*cos(u)`, `(${R} + ${rr}*cos(v))*sin(u)`, `${rr}*sin(v)`], [[0, TAU], [0, TAU]], { curves: [{ param: [`(${R} + ${rr}*cos(${r6(v)}))*cos(t)`, `(${R} + ${rr}*cos(${r6(v)}))*sin(t)`, `${rr}*sin(${r6(v)})`], t: [0, TAU], color: 'violet', width: 2.6 }], caption: t`The torus and the parallel $v = ${vt}$ (violet).`, dist: 3.2 * (R + rr), pitch: 0.7 }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: R + rr * Math.cos(v), feedback: t`That is $|\mathbf X_u|$, the radius of the parallel. Multiply by $|\mathbf X_v| = ${rr}$ (the two are perpendicular).` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`For a surface of revolution, $|\mathbf X_u\times\mathbf X_v| = f\sqrt{f'^2 + g'^2}$ with $f = ${R} + ${rr}\cos v$, $g = ${rr}\sin v$.`],
          teach: t`On the torus $|\mathbf X_u\times\mathbf X_v| = r(R + r\cos v)$: largest outside, smallest inside.`,
          explain: t`$${rr}\,(${R} + ${rr}\cos ${vt}) = ${nice(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-cuspidal', difficulty: 3,
      prompt: t`Where is the patch $\mathbf X(u, v) = (u,\ v^2,\ v^3)$ not regular?`,
      visual: surf(['u', 'v^2', 'v^3'], [[-1.5, 1.5], [-1.2, 1.2]], { curves: [{ param: ['t', '0', '0'], t: [-1.5, 1.5], color: 'bad', width: 3 }], caption: 'The surface: each slice x = const is the same cusp, z² = y³. One line on it is marked in red.', pitch: 0.3, yaw: -1.2 }),
      choices: [t`Along the whole line $v = 0$`, 'Nowhere', 'Only at the origin', t`Along the line $u = 0$`],
      answer: 0,
      why: {
        1: t`$\mathbf X_v = (0, 2v, 3v^2)$ vanishes whenever $v = 0$, for every $u$.`,
        2: t`Nothing special happens at $u = 0$: $\mathbf X_u = (1, 0, 0)$ everywhere.`,
        3: t`$\mathbf X_u = (1, 0, 0)$ never vanishes, and $u$ does not appear in $\mathbf X_v$.`,
      },
      hints: [t`$\mathbf X_u = (1, 0, 0)$, $\mathbf X_v = (0, 2v, 3v^2)$.`, t`$\mathbf X_u\times\mathbf X_v = (0,\ -3v^2,\ 2v)$.`],
      teach: t`Find where $\mathbf X_u\times\mathbf X_v = 0$ — it can fail along a whole curve.`,
      explain: t`$\mathbf X_u\times\mathbf X_v = (0, -3v^2, 2v)$ is zero exactly on $v = 0$. Every slice $u = \text{const}$ is the cusp $(v^2, v^3)$ of lesson C1.1, so the surface has a **cuspidal edge** along that line — a genuine singularity, not a coordinate one.`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §2-2 and §2-3', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), ch. 4', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
