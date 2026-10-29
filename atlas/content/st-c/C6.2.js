// Geodesics as straightest curves: the acceleration of a unit-speed curve
// split into normal and geodesic curvature; geodesics have κg = 0. Great
// circles, parallels (κg = cot θ/a), unrolling cylinders and cones,
// Clairaut's relation, great-circle flight routes.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_dg.js';
import { R_EARTH } from './_surf.js';

const t = String.raw;
const DEG = Math.PI / 180;
const TAU = r6(2 * Math.PI);

const sphereWith = (curves, caption, extra = {}) => ({ type: 'surface3d', params: { surface: ['sin(v)*cos(u)', 'sin(v)*sin(u)', 'cos(v)'], domain: [[0, TAU], [0.01, 3.13]], alpha: 0.45, pitch: 0.35, dist: 4.4, axes: false, curves, ...extra }, caption });
const latC = (l, color = 'gold', w = 2.6) => ({ param: [`${r6(Math.cos(l * DEG))}*cos(t)`, `${r6(Math.cos(l * DEG))}*sin(t)`, `${r6(Math.sin(l * DEG))}`], t: [0, TAU], color, width: w });
// the great circle through two points at latitude l, longitudes ±dphi/2, as a curve on the unit sphere
function gcArc(l, dphi) {
  const p = (lon) => [Math.cos(l * DEG) * Math.cos(lon), Math.cos(l * DEG) * Math.sin(lon), Math.sin(l * DEG)];
  const A = p((-dphi / 2) * DEG), B = p((dphi / 2) * DEG);
  const w = Math.acos(A[0] * B[0] + A[1] * B[1] + A[2] * B[2]);
  const comp = (i) => `(sin(${r6(w)}*(1 - t))*${r6(A[i])} + sin(${r6(w)}*t)*${r6(B[i])})/${r6(Math.sin(w))}`;
  return { param: [0, 1, 2].map(comp), t: [0, 1], color: 'accent', width: 3 };
}
function gcData(l, dphi) {
  const c = Math.sin(l * DEG) ** 2 + Math.cos(l * DEG) ** 2 * Math.cos(dphi * DEG);
  return { d: R_EARTH * Math.acos(c), par: R_EARTH * Math.cos(l * DEG) * dphi * DEG, vertex: Math.atan(Math.tan(l * DEG) / Math.cos((dphi / 2) * DEG)) / DEG };
}
const ROUTES = [['Madrid and New York', 40.5, 70.1], ['London and Calgary', 51.2, 113.9], ['Beijing and Madrid', 40.2, 120.1], ['Seoul and San Francisco', 37.6, 104.6]];

export default lesson({
  id: 'st-c.C6.2',
  title: 'Geodesics on surfaces',
  minutes: 14, difficulty: 3,
  equation: t`\gamma'' = \kappa_n\,\mathbf n + \kappa_g\,(\mathbf n\times\gamma')`,
  intro: t`A curve on a surface, travelled at unit speed, has an acceleration $\gamma''$ perpendicular to its velocity. Split it into the part along the normal $\mathbf n$ and the part lying in the tangent plane, sideways to the curve. The first is the **normal curvature** $\kappa_n$ of C5.1, forced on any curve that stays on the surface. The second, the **geodesic curvature** $\kappa_g$, is turning *within* the surface — steering. A **geodesic** is a curve with $\kappa_g = 0$: a curve that goes **straight ahead**, accelerating only as much as it must to stay on the surface. So $\kappa^2 = \kappa_n^2 + \kappa_g^2$, and for a geodesic $\kappa = |\kappa_n|$.

$\kappa_g$ is intrinsic — it can be computed from the metric — and in coordinates $\kappa_g = 0$ becomes the geodesic equation $\ddot u^k + \Gamma^k_{ij}\dot u^i\dot u^j = 0$ of lesson st-a A9.2 (and C14). Short pieces of geodesics are the shortest paths between their ends.`,
  symbols: [
    { tex: t`\gamma'',\ \gamma'`, text: 'the acceleration and the unit velocity of the curve, parameterized by arc length' },
    { tex: t`\kappa_n`, text: t`the normal curvature: bending forced by the surface (C5.1)` },
    { tex: t`\kappa_g`, text: t`the geodesic curvature: bending within the surface, in $\text{m}^{-1}$; zero for a geodesic` },
    { tex: t`\mathbf n\times\gamma'`, text: 'the unit vector in the tangent plane perpendicular to the curve — “to the left”' },
  ],
  why: t`In GR a freely falling body — a planet, a coasting spacecraft, a light ray — follows a geodesic of spacetime: no force pushes it sideways, so its “$\kappa_g$” is zero (gr.S12.i). Everything it seems to feel as gravity is the curvature of the space it goes straight in.`,
  visual: {
    type: 'gr-surface',
    title: 'Going straight on a curved surface',
    lead: t`Launch a geodesic from $P$ and follow it. Each one is computed from the metric alone by integrating the geodesic equation. The readout follows Clairaut’s quantity $\rho^2\dot u = \rho\cos\psi$ ($\rho$ the distance from the axis, $\psi$ the angle with the circle through the point).`,
    tasks: [
      t`Sphere: every launch gives a great circle. Launched at heading $0^\circ$ from a point off the equator, the curve does **not** follow the circle of latitude — it dips toward the equator, because the parallel is not straight.`,
      t`Cylinder: launch at $30^\circ$ — a helix. Unrolled it would be a straight line. Cone: geodesics swing round the tip and fly off again.`,
      t`Catenoid: launch from above the neck at about $-30^\circ$ (heading down). Clairaut’s quantity stays fixed, and where $\rho$ has shrunk to it the geodesic turns back without reaching the neck.`,
    ],
    params: { mode: 'geodesic', surface: 'sphere', surfaces: ['sphere', 'cylinder', 'cone', 'catenoid', 'torus'], pos: 0.3, heading: 0, length: 8 },
    caption: t`Each surface is a surface of revolution; its geodesics come from the geodesic equation, integrated numerically (RK4). Clairaut’s quantity is conserved because the metric does not depend on the angle round the axis.`,
  },
  example: {
    prompt: t`Show that the circle of latitude at colatitude $\theta_0$ on a sphere of radius $a$ is not a geodesic unless it is the equator, and find its geodesic curvature. Evaluate it at $45^\circ$N on the Earth.`,
    visual: sphereWith([latC(45), latC(0, 'accent')], t`The parallel at $45^\circ$N (gold) and the equator (blue) on a unit sphere.`),
    steps: [
      { label: 'Unit speed', text: t`$\gamma(s) = \big(\rho\cos\tfrac s\rho,\ \rho\sin\tfrac s\rho,\ a\cos\theta_0\big)$ with $\rho = a\sin\theta_0$, the circle’s radius in space.` },
      { label: 'Acceleration', text: t`$\gamma'' = -\tfrac1\rho\big(\cos\tfrac s\rho,\ \sin\tfrac s\rho,\ 0\big)$: length $\kappa = 1/(a\sin\theta_0)$, pointing at the axis.` },
      { label: 'Normal part', text: t`$\mathbf n = \gamma/a$ (outward). $\kappa_n = \gamma''\cdot\mathbf n = -\tfrac1\rho\cdot\tfrac{\rho}{a} = -\tfrac1a$, as for every direction on the sphere (C5.1).` },
      { label: 'Geodesic part', text: t`$\kappa_g^2 = \kappa^2 - \kappa_n^2 = \dfrac{1}{a^2\sin^2\theta_0} - \dfrac1{a^2} = \dfrac{\cos^2\theta_0}{a^2\sin^2\theta_0}$, so $\kappa_g = \dfrac{\cot\theta_0}{a}$. Zero only when $\theta_0 = 90^\circ$: the equator.` },
      { label: 'The Earth', text: t`At $45^\circ$N, $\cot 45^\circ = 1$: $\kappa_g = 1/6371\ \text{km}^{-1}$. A ship holding that parallel is steering continuously toward the pole, on a turn of radius 6371 km.` },
    ],
    answer: t`$\kappa_g = \cot\theta_0/a$, zero only on the equator; at $45^\circ$N it is $1/(6371\ \text{km})$.`,
  },
  practice: [
    multi({
      id: 'sphere-geodesics', difficulty: 1,
      prompt: 'Which of these curves on a sphere are geodesics? Select every one.',
      visual: sphereWith([latC(0, 'accent'), latC(50), { param: ['sin(t)*cos(0.7)', 'sin(t)*sin(0.7)', 'cos(t)'], t: [0, 3.1416], color: 'violet', width: 2.6 }], 'The equator (blue), a meridian (violet) and the parallel at 50°N (gold).'),
      choices: ['The equator', 'Any meridian', 'Any great circle, at any tilt', t`The parallel at $50^\circ$N`, 'A rhumb line (a course of constant compass heading other than due north or east)'],
      answer: [0, 1, 2],
      why: {
        3: t`It turns toward the pole all the time: $\kappa_g = \tan 50^\circ/R \ne 0$.`,
        4: 'A rhumb line spirals in toward the pole, crossing every meridian at the same angle; it is not straight on the sphere.',
      },
      hints: ['A geodesic’s acceleration points straight along the normal, which on a sphere is the radius.', 'Which circles have their centre at the centre of the sphere?'],
      teach: 'On a sphere the geodesics are exactly the great circles.',
      explain: t`Great circles — the equator, meridians and every tilted one — have their acceleration pointing at the centre, along $\mathbf n$. Other circles have centres off the sphere’s centre, so part of their acceleration lies in the tangent plane: $\kappa_g \ne 0$.`,
    }),
    num({
      id: 'kg-parallel', difficulty: 2,
      gen(r) {
        const lat = r.pick([20, 30, 50, 60, 70]);
        const Rg = R_EARTH / Math.tan(lat * DEG);
        return {
          prompt: t`A ship sails due east along the parallel at $${lat}^\circ$N. Its course has geodesic curvature $\kappa_g = \tan\lambda/R$ ($R = 6371$ km). What is the radius $1/\kappa_g$ of the turn it is making within the surface, in km?`,
          visual: sphereWith([latC(lat)], t`The parallel at $${lat}^\circ$N on a unit sphere.`),
          answer: Rg, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: R_EARTH * Math.cos(lat * DEG), feedback: t`$R\cos\lambda$ is the parallel’s radius in space, which includes the bending forced by the sphere. The turn *within* the surface has radius $R/\tan\lambda$.` }, { value: R_EARTH * Math.tan(lat * DEG), feedback: t`Invert: the radius is $1/\kappa_g = R/\tan\lambda$.` }].filter((e) => Math.abs(e.value - Rg) > 0.02 * Rg),
          hints: [t`$\kappa_g = \tan ${lat}^\circ/6371\ \text{km}^{-1}$.`],
          teach: t`A parallel at latitude $\lambda$ has $\kappa_g = \tan\lambda/R$: it is a turn toward the pole, tighter at higher latitudes.`,
          explain: t`$1/\kappa_g = 6371/\tan ${lat}^\circ = ${nice(Rg, 4)}$ km. Near the pole the parallel is a tight circle and the turn is obvious; near the equator it is almost straight. The great circle tangent to the parallel at the ship’s position drifts toward the equator on both sides of it.`,
        };
      },
    }),
    num({
      id: 'cyl-shortest', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 1.5, 2]), dphi = r.pick([90, 120, 180]), h = r.pick([2, 3, 4]);
        const L = Math.hypot(a * dphi * DEG, h);
        return {
          prompt: t`On a cylinder of radius $a = ${a}$ m, a cable must run along the surface between two points $${dphi}^\circ$ apart round the axis and $${h}$ m apart in height. How long is the shortest such cable, in metres?`,
          visual: { type: 'surface3d', params: { surface: [`${a}*cos(u)`, `${a}*sin(u)`, 'v'], domain: [[0, TAU], [-0.5, h + 0.5]], alpha: 0.45, pitch: 0.2, dist: r6(1.7 * (h + 2 * a)), target: [0, 0, h / 2], axes: false, curves: [{ param: [`${a}*cos(t*${r6(dphi * DEG)})`, `${a}*sin(t*${r6(dphi * DEG)})`, `${h}*t`], t: [0, 1], color: 'gold', width: 3.4 }] }, caption: 'The cylinder with the shortest cable in gold — a piece of a helix.' },
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: a * dphi * DEG + h, feedback: 'That is round and then up — two legs of a right triangle on the unrolled sheet. The straight hypotenuse is shorter.' }, { value: Math.hypot(a * dphi, h), feedback: t`Convert the angle to radians: the arc round the axis is $a\,\Delta\varphi$ with $\Delta\varphi$ in radians.` }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: ['Unroll the cylinder: geodesics become straight lines.', t`On the unrolled sheet the points are $a\,\Delta\varphi = ${nice(a * dphi * DEG, 4)}$ m apart sideways and ${h} m apart vertically.`],
          teach: 'An isometry carries geodesics to geodesics: unroll a cylinder and its shortest paths are straight lines.',
          explain: t`$L = \sqrt{${nice(a * dphi * DEG, 4)}^2 + ${h}^2} = ${nice(L, 4)}$ m, a helix on the cylinder. (Going round the other way, $360^\circ - ${dphi}^\circ$, gives another geodesic, longer.)`,
        };
      },
    }),
    num({
      id: 'cone-shortest', difficulty: 3,
      gen(r) {
        const alpha = r.pick([20, 30, 40]), s1 = r.pick([1, 1.5]), s2 = r.pick([2, 2.5]), dphi = r.pick([90, 150, 180]);
        const beta = dphi * DEG * Math.sin(alpha * DEG), L = Math.sqrt(s1 * s1 + s2 * s2 - 2 * s1 * s2 * Math.cos(beta));
        const flat = Math.sqrt(s1 * s1 + s2 * s2 - 2 * s1 * s2 * Math.cos(dphi * DEG));
        return {
          prompt: t`On a cone of half-angle $\alpha = ${alpha}^\circ$, point $P$ is $${s1}$ m from the tip along the surface and $Q$ is $${s2}$ m from it, $${dphi}^\circ$ apart round the axis. How long is the shortest path from $P$ to $Q$ on the cone, in metres?`,
          visual: { type: 'graph', params: { x: [-0.3, 2.8], y: [-0.4, 2.4], equal: true, axes: false, grid: false, curves: [{ param: [`${s2 + 0.3}*cos(t)`, `${s2 + 0.3}*sin(t)`], t: [0, r6(2 * Math.PI * Math.sin(alpha * DEG))], color: 'ink3' }, { param: [`t*${s2 + 0.3}`, '0'], t: [0, 1], color: 'ink3' }, { param: [`t*${r6((s2 + 0.3) * Math.cos(2 * Math.PI * Math.sin(alpha * DEG)))}`, `t*${r6((s2 + 0.3) * Math.sin(2 * Math.PI * Math.sin(alpha * DEG)))}`], t: [0, 1], color: 'ink3' }], points: [{ x: 0, y: 0, label: 'tip', r: 3 }, { x: s1, y: 0, label: 'P', color: 'gold' }, { x: r6(s2 * Math.cos(beta)), y: r6(s2 * Math.sin(beta)), label: 'Q', color: 'gold' }] }, caption: t`The cone cut along a ruling and unrolled: a sector of angle $360^\circ\sin\alpha$ (grey). $P$ and $Q$ are at their unrolled positions.` },
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: flat, feedback: t`On the unrolled sector the angle between $P$ and $Q$ is $\Delta\varphi\sin\alpha$, not $\Delta\varphi$: the sector is narrower than a full disc.` }, { value: s2 - s1 + s1 * dphi * DEG * Math.sin(alpha * DEG), feedback: 'That path goes round and then out; the straight line on the unrolled sector is shorter.' }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`Unroll the cone: an angle $\Delta\varphi$ round the axis becomes $\beta = \Delta\varphi\sin\alpha$ at the tip of the sector.`, t`$\beta = ${nice(beta / DEG, 4)}^\circ$; then the law of cosines: $L^2 = s_1^2 + s_2^2 - 2s_1s_2\cos\beta$.`],
          teach: 'Unroll a cone into a sector and its geodesics become straight lines.',
          explain: t`$\beta = ${dphi}^\circ\times\sin ${alpha}^\circ = ${nice(beta / DEG, 4)}^\circ$, and $L = \sqrt{${s1}^2 + ${s2}^2 - 2\cdot${s1}\cdot${s2}\cos\beta} = ${nice(L, 4)}$ m. (When $\beta > 180^\circ$ there is no straight line inside the sector; the shortest path then runs through the tip.)`,
        };
      },
    }),
    num({
      id: 'clairaut', difficulty: 3,
      gen(r) {
        let z0, psi, rho0, rmin;
        for (let i = 0; i < 40; i++) {
          z0 = r.pick([0.8, 1, 1.2]); psi = r.pick([20, 30, 40, 50]);
          rho0 = Math.cosh(z0); rmin = rho0 * Math.cos(psi * DEG);
          if (rmin > 1.05) break;
        }
        return {
          prompt: t`On the catenoid $(\cosh z\cos u,\ \cosh z\sin u,\ z)$ (neck radius 1 m), a geodesic starts at height $z = ${z0}$ m, where the radius is $\rho_0 = \cosh ${z0} = ${nice(rho0, 4)}$ m, heading toward the neck at $${psi}^\circ$ to the horizontal circle. Clairaut’s relation says $\rho\cos\psi$ is constant along it. At what radius $\rho$ does it turn back, in metres?`,
          visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'catenoid', v: z0, heading: -psi, length: 6, controls: false, readout: false }, caption: t`The catenoid and the geodesic launched at $${psi}^\circ$ below the horizontal circle. Colour: Gaussian curvature (all blue, $K < 0$).` },
          answer: rmin, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: rho0 * Math.sin(psi * DEG), feedback: t`$\psi$ is measured from the circle, so the conserved quantity is $\rho\cos\psi$.` }, { value: 1, feedback: 'It does not reach the neck: it turns where its heading becomes horizontal, ψ = 0, which happens before ρ falls to 1.'.replace('ψ = 0', '$\\psi = 0$') }].filter((e) => Math.abs(e.value - rmin) > 0.01 * rmin),
          hints: [t`At the turning point the geodesic runs along the circle: $\psi = 0$, $\cos\psi = 1$.`, t`So $\rho_{\min} = \rho_0\cos\psi_0 = ${nice(rho0, 4)}\cos ${psi}^\circ$.`],
          teach: t`On a surface of revolution, $\rho\cos\psi$ is constant along a geodesic (Clairaut); it turns where $\rho$ falls to that constant.`,
          explain: t`$\rho_{\min} = ${nice(rho0, 4)}\times${nice(Math.cos(psi * DEG), 4)} = ${nice(rmin, 4)}$ m, reached at height $\operatorname{arccosh}(${nice(rmin, 4)}) = ${nice(Math.acosh(rmin), 3)}$ m. Clairaut’s quantity is angular momentum per unit mass in disguise: the metric does not depend on $u$, and that symmetry conserves it (C18: Killing vectors).`,
        };
      },
    }),
    order({
      id: 'great-circle', difficulty: 3,
      prompt: t`Show that a great circle $\gamma(s) = a\big(\cos\tfrac sa\,\mathbf e_1 + \sin\tfrac sa\,\mathbf e_2\big)$ ($\mathbf e_1$, $\mathbf e_2$ orthonormal) is a geodesic of the sphere of radius $a$. Order the steps.`,
      visual: sphereWith([{ param: ['cos(t)', '0.6*sin(t)', '0.8*sin(t)'], t: [0, TAU], color: 'accent', width: 3 }], 'A tilted great circle on a unit sphere.'),
      items: [
        t`$\gamma' = -\sin\tfrac sa\,\mathbf e_1 + \cos\tfrac sa\,\mathbf e_2$ has length 1: $s$ is arc length.`,
        t`$\gamma'' = -\tfrac1a\big(\cos\tfrac sa\,\mathbf e_1 + \sin\tfrac sa\,\mathbf e_2\big) = -\gamma/a^2$.`,
        t`On the sphere the unit normal is $\mathbf n = \gamma/a$, so $\gamma'' = -\tfrac1a\,\mathbf n$.`,
        t`The acceleration is entirely normal: its component in the tangent plane, $\kappa_g$, is zero.`,
        'So the great circle is a geodesic.',
      ],
      hints: ['Differentiate twice, then compare the acceleration with the normal.', 'A geodesic is a curve whose acceleration has no tangential part.'],
      teach: 'A curve is a geodesic when its acceleration is parallel to the surface normal.',
      explain: t`The same argument shows the converse: any unit-speed geodesic on the sphere satisfies $\gamma'' = -\gamma/a^2$, the equation of uniform circular motion about the centre — so it is a great circle.`,
    }),
    mcq({
      id: 'not-shortest', difficulty: 2,
      prompt: 'Two points on the equator are 90° of longitude apart. Which statement is true?',
      visual: sphereWith([{ param: ['cos(t)', 'sin(t)', '0'], t: [0, 1.5708], color: 'gold', width: 3.4 }, { param: ['cos(t)', 'sin(t)', '0'], t: [1.5708, TAU], color: 'violet', width: 3 }], 'The equator split at the two points: the short arc (gold, 90°) and the long arc (violet, 270°).'),
      choices: ['Both arcs of the equator are geodesics, but only the short one is the shortest path', 'Only the short arc is a geodesic', 'Neither arc is a geodesic, because geodesics must be shortest', 'Every curve between them is a geodesic'],
      answer: 0,
      why: {
        1: t`The long arc is just as straight — $\kappa_g = 0$ along it. Being a geodesic is a local property.`,
        2: t`Geodesics are defined by $\kappa_g = 0$; they are shortest only between points close enough together.`,
        3: 'Most curves turn within the surface; only great-circle arcs go straight.',
      },
      hints: [t`“Geodesic” means $\kappa_g = 0$ at every point. Does the long arc turn anywhere?`],
      teach: 'Geodesics are locally shortest; a long geodesic arc can be beaten by another route.',
      explain: t`Both arcs are geodesics; the 270° one is not shortest, because it passes the antipode of its start. Between antipodal points there are infinitely many shortest geodesics. In relativity the same subtlety appears with proper time: timelike geodesics *maximize* proper time only locally.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-great-circle', difficulty: 3, transfer: true,
      gen(r) {
        const [pair, l, dphi] = r.pick(ROUTES);
        const g = gcData(l, dphi);
        return {
          prompt: t`Treat ${pair} as two airports both at latitude $${l}^\circ$N, $${dphi}^\circ$ apart in longitude, on a spherical Earth ($R = 6371$ km). The great-circle distance $d$ satisfies $\cos(d/R) = \sin^2\lambda + \cos^2\lambda\cos\Delta\varphi$. How long is the great-circle route, in km?`,
          visual: sphereWith([latC(l), gcArc(l, dphi)], t`The parallel at $${l}^\circ$N (gold) and the great-circle route between the two points (blue), on a unit sphere.`, { pitch: 0.6, yaw: 0 }),
          answer: g.d, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: g.par, feedback: t`That is the distance along the parallel, $R\cos\lambda\,\Delta\varphi$. The parallel is not a geodesic; the great circle is shorter.` }].filter((e) => Math.abs(e.value - g.d) > 0.01 * g.d),
          hints: [t`$\cos(d/R) = \sin^2 ${l}^\circ + \cos^2 ${l}^\circ\cos ${dphi}^\circ = ${nice(Math.cos(g.d / R_EARTH), 4)}$.`, t`$d = R\arccos(\ldots)$, with the angle in radians.`],
          teach: 'Airliners fly great circles because geodesics are the shortest routes on a sphere.',
          explain: t`$d = 6371\times\arccos(${nice(Math.cos(g.d / R_EARTH), 4)}) = ${nice(g.d, 4)}$ km, against $${nice(g.par, 4)}$ km along the parallel — a saving of $${nice(g.par - g.d, 3)}$ km. (Real routes also bend to use the jet stream; the Earth is slightly oblate, which changes these numbers by a few tenths of a percent.)`,
        };
      },
    }),
    num({
      id: 'cp-vertex', difficulty: 3, transfer: true,
      gen(r) {
        const [pair, l, dphi] = r.pick(ROUTES);
        const g = gcData(l, dphi);
        return {
          prompt: t`The great-circle route between ${pair} (both taken at $${l}^\circ$N, $${dphi}^\circ$ apart) bulges poleward. By symmetry its most northerly point is midway in longitude, and $\tan\lambda_{\max} = \tan\lambda/\cos(\Delta\varphi/2)$. What is the route’s highest latitude, in degrees?`,
          visual: sphereWith([latC(l), gcArc(l, dphi)], t`The parallel (gold) and the great-circle route (blue): the route rises above the parallel between the airports.`, { pitch: 0.6, yaw: 0 }),
          answer: g.vertex, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: l, feedback: 'The route does not follow the parallel: a great circle through two points at the same latitude climbs poleward between them.' }, { value: Math.atan(Math.tan(l * DEG) / Math.cos(dphi * DEG)) / DEG, feedback: t`Use half the longitude difference: the vertex is midway, $\Delta\varphi/2 = ${dphi / 2}^\circ$ from each end.` }].filter((e) => Math.abs(e.value - g.vertex) > 0.01 * g.vertex),
          hints: [t`$\Delta\varphi/2 = ${nice(dphi / 2)}^\circ$; compute $\tan ${l}^\circ/\cos ${nice(dphi / 2)}^\circ$.`, 'Take the arctangent.'],
          teach: 'A great circle through two points on a parallel climbs poleward; Clairaut’s relation fixes its highest latitude.',
          explain: t`$\lambda_{\max} = \arctan\big(\tan ${l}^\circ/\cos ${nice(dphi / 2)}^\circ\big) = ${nice(g.vertex, 4)}^\circ$N. That is why flights between Europe and North America pass over Greenland or Labrador. The formula is Clairaut’s: $\cos\lambda\cos\psi$ is constant along the route, and at the vertex $\psi = 0$.`,
        };
      },
    }),
    mcq({
      id: 'cp-coast', difficulty: 2, transfer: true,
      prompt: 'A spacecraft coasts with its engines off. In general relativity its worldline is a geodesic of spacetime. Which surface fact is the right analogy?',
      visual: { type: 'gr-surface', params: { mode: 'geodesic', surface: 'torus', v: 0.4, heading: 25, length: 18, controls: false, readout: false }, caption: 'A geodesic winding round a torus: it never steers, yet its path curves in space.' },
      choices: [
        t`A geodesic has no acceleration *within* the surface ($\kappa_g = 0$); its curving is entirely due to the surface — as the craft feels no force, and its curving path is due to spacetime`,
        'A geodesic is always a straight line in space, as the craft’s path is straight',
        'A geodesic always closes up, as orbits do',
        'A geodesic needs a sideways push to stay on the surface, like the engine’s thrust',
      ],
      answer: 0,
      why: {
        1: 'Geodesics on a sphere or torus curve in space; only their in-surface turning is zero. An orbit is curved too.',
        2: 'Most geodesics on a torus never close; neither do most orbits in GR (Mercury’s precesses).',
        3: t`The push that keeps a geodesic on the surface is normal to it ($\kappa_n$), not sideways; and a coasting craft has no thrust at all.`,
      },
      hints: [t`Split a geodesic’s acceleration into $\kappa_n$ and $\kappa_g$. Which one is zero?`],
      teach: 'A geodesic is “unforced” motion: all its curvature comes from the geometry it moves in.',
      explain: t`The accelerometer on a coasting craft reads zero, as $\kappa_g = 0$ along a geodesic. Its orbit curves only because spacetime does. Gravity, in GR, is not a force pushing it off a straight line; it is the shape of the straight lines (gr.S12.i).`,
    }),
  ],
  sources: [
    { label: 'do Carmo, Differential Geometry of Curves and Surfaces, §4-4', url: 'https://store.doverpublications.com/products/9780486806990' },
    { label: 'Pressley, Elementary Differential Geometry (2nd ed.), ch. 9', url: 'https://link.springer.com/book/10.1007/978-1-84882-891-9' },
  ],
});
