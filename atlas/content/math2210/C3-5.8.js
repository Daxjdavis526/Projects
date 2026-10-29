// Stokes' theorem: the circulation round the edge of a surface equals the
// flux of the curl through it, with orientations tied by the right-hand
// rule. Surface independence ("butterfly nets"), closed surfaces, and the
// step from Faraday's and Ampère's integral laws to their differential form.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';

const t = String.raw;
const PI = Math.PI;

const EDGE = { x: 'cos(t)', y: 'sin(t)', z: '0', t: [0, '2*pi'] };
const NETS = [
  { label: 'Disk', x: 'u*cos(v)', y: 'u*sin(v)', z: '0', u: [0, 1], v: [0, '2*pi'], boundary: EDGE },
  { label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'], boundary: EDGE },
  { label: 'Bowl', x: 'u*cos(v)', y: 'u*sin(v)', z: '1 - u^2', u: [0, 1], v: [0, '2*pi'], boundary: EDGE },
  { label: 'Cone', x: 'u*cos(v)', y: 'u*sin(v)', z: '1 - u', u: [0, 1], v: [0, '2*pi'], boundary: EDGE },
  { label: 'Hanging net', x: 'u*cos(v)', y: 'u*sin(v)', z: '-(1 - u^2)*(0.8 + 0.5*u*cos(v))', u: [0, 1], v: [0, '2*pi'], boundary: EDGE },
];
/** A picture on c3-flux of the curl's flux through a surface and its edge; no numbers. */
const stokesPic = (F, curlF, surfaces, { caption, ...rest } = {}) => ({
  type: 'c3-flux',
  params: { F, curlF, surfaces, integrand: 'curl', readouts: [], flipToggle: false, range: 1.3, ...rest },
  caption,
});

export default lesson({
  id: 'math2210.C3-5.8',
  title: 'Stokes’ theorem',
  minutes: 13, difficulty: 3,
  intro: t`Stokes’ theorem is Green’s theorem for a surface that bends through space. The circulation of $\vec F$ round the edge of a surface $S$ equals the flux of its curl through $S$:

$$\oint_{\partial S}\vec F\cdot d\vec r = \iint_S (\nabla\times\vec F)\cdot d\vec S$$

The two orientations are tied by the **right-hand rule**: curl the fingers of your right hand along the edge, and your thumb gives the normal. The same cell-by-cell bookkeeping proves it — each little patch’s circulation is its curl flux, and the inner edges cancel. Two consequences follow at once: every surface with the same edge (every “butterfly net” on the same rim) carries the same flux of the curl, and the flux of a curl through a **closed** surface, which has no edge, is zero.`,
  symbols: [
    { tex: 'S', text: 'an oriented surface with an edge; it may be curved, and any shape, so long as it is smooth and two-sided' },
    { tex: '\\partial S', text: 'the boundary of $S$: its edge curve, walked so that the surface’s normal and the walk obey the right-hand rule' },
    { tex: '\\nabla\\times\\vec F', text: 'the curl of $\\vec F$: circulation per unit area, as a vector' },
    { tex: 'd\\vec S', text: 'the vector area element, $\\hat n\\,dS = (\\vec r_u\\times\\vec r_v)\\,du\\,dv$, on the chosen side' },
  ],
  why: t`Physics II’s Faraday’s law $\oint\vec E\cdot d\vec l = -d\Phi_B/dt$ and Ampère’s law $\oint\vec B\cdot d\vec l = \mu_0 I_\text{enc}$ hold for loops; Stokes’ theorem turns them into $\nabla\times\vec E = -\partial\vec B/\partial t$ and $\nabla\times\vec B = \mu_0\vec J$, the form Maxwell’s equations take at each point of space.`,
  visual: {
    type: 'c3-flux',
    title: 'One rim, many nets',
    lead: t`Five surfaces share one edge, the unit circle in the floor (green, walked anticlockwise seen from above). Each is tinted by the flux integrand of the **curl**, $(\nabla\times\vec F)\cdot\hat n$, and gold arrows show $\nabla\times\vec F$; violet arrows show $\vec F$ itself along the edge. Compare the two readouts as you change the surface and the field.`,
    tasks: [
      'Change the surface: the tint moves about, but the flux of the curl stays put — it is fixed by the edge.',
      'Flip the orientation: the normals turn over and the edge is walked the other way, so both numbers change sign together.',
      'Change the field: whatever the field, circulation round the edge = flux of the curl, for every net.',
    ],
    params: {
      F: [pickExpr('k', ['-y', 'z - 2*y', '-y^3']), pickExpr('k', ['x', 'x + z^2', 'x^3']), pickExpr('k', ['0', 'x*y', '0'])],
      curlF: [pickExpr('k', ['0', 'x - 2*z', '0']), pickExpr('k', ['0', '1 - y', '0']), pickExpr('k', ['2', '3', '3*x^2 + 3*y^2'])],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Swirl'], [1, 'Twisted'], [2, 'Cubic swirl']], value: 1, explain: t`Swirl $\langle -y, x, 0\rangle$, curl $\langle 0, 0, 2\rangle$. Twisted $\langle z - 2y,\ x + z^2,\ xy\rangle$, curl $\langle x - 2z,\ 1 - y,\ 3\rangle$. Cubic swirl $\langle -y^3, x^3, 0\rangle$, curl $\langle 0, 0, 3x^2 + 3y^2\rangle$.` }],
      surfaces: NETS, surface: 1, ghosts: true, integrand: 'curl',
      surfaceExplain: 'Each has its normals on the upper side, matching the anticlockwise edge by the right-hand rule.',
      readouts: ['circ', 'flux'], range: 1.3, yaw: 0.5, pitch: 0.38,
    },
    caption: t`Drag to rotate. The other nets are drawn faintly. Gold arrows show the curl (lengths compressed), white arrows the normals, violet arrows the field on the edge. Both integrals are computed numerically.`,
  },
  example: {
    prompt: t`Find $\oint_C\vec F\cdot d\vec r$ for $\vec F = \langle -y^2,\ x,\ z^2\rangle$, where $C$ is the curve in which the plane $y + z = 2$ cuts the cylinder $x^2 + y^2 = 1$, walked anticlockwise as seen from above.`,
    visual: stokesPic(['-y^2', 'x', 'z^2'], ['0', '0', '1 + 2*y'], [{ label: 'Plane piece', x: 'u*cos(v)', y: 'u*sin(v)', z: '2 - u*sin(v)', u: [0, 1], v: [0, '2*pi'], boundary: { x: 'cos(t)', y: 'sin(t)', z: '2 - sin(t)', t: [0, '2*pi'] } }], { readouts: ['circ', 'flux'], range: 2.4, caption: 'The tilted ellipse C (green) and the flat piece of the plane inside it, tinted by the flux of the curl. The readout gives both sides of Stokes’ theorem, computed numerically. Drag to rotate.' }),
    steps: [
      { label: 'Why Stokes', text: t`$C$ is a tilted ellipse; parametrizing it and integrating directly is possible but messy. Stokes lets us use any surface with edge $C$ — the simplest is the flat piece of the plane inside the cylinder.` },
      { label: 'Curl', text: t`$\nabla\times\vec F = \langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\rangle = \langle 0,\ 0,\ 1 + 2y\rangle$.` },
      { label: 'Orientation', text: t`Anticlockwise from above, by the right-hand rule, means the surface’s normal points **up**.` },
      { label: 'Surface element', text: t`The piece is the graph $z = 2 - y$ over the unit disk. With $\vec r(x, y) = \langle x, y, 2 - y\rangle$, $\vec r_x\times\vec r_y = \langle 0, 1, 1\rangle$ — upward, as needed. So $d\vec S = \langle 0, 1, 1\rangle\,dA$.` },
      { label: 'Integrate', text: t`$(\nabla\times\vec F)\cdot d\vec S = (1 + 2y)\,dA$, and over the unit disk $\iint(1 + 2y)\,dA = \pi + 0$: the $2y$ part cancels by symmetry.` },
      { label: 'Sense check', text: t`The readout agrees: the circulation round $C$ and the curl flux through the plane piece are both $\pi$. Any other surface with edge $C$ — a dome over it, a sock below — would give $\pi$ too.` },
    ],
    answer: t`$\oint_C\vec F\cdot d\vec r = \pi$`,
  },
  practice: [
    mcq({
      id: 'right-hand', difficulty: 1,
      prompt: t`The upper unit hemisphere is oriented with its normals pointing **up and out**. For Stokes’ theorem, which way must its edge, the unit circle in the $xy$-plane, be walked?`,
      visual: stokesPic(['-y', 'x', '0'], ['0', '0', '2'], [{ label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'] }], { arrows: false, tint: false, integrand: 'none', pitch: 0.35, caption: 'The hemisphere and its chosen normals (white). Its edge is the circle where it meets the floor. Drag to rotate.' }),
      choices: ['Anticlockwise, seen from above', 'Clockwise, seen from above', 'Either way: the circulation is the same', 'It cannot be told without knowing the field'],
      answer: 0,
      why: {
        1: 'That pairs with downward (inward) normals: thumb down, fingers clockwise seen from above.',
        2: 'Reversing the walk reverses the sign of the circulation, so the direction must match the normal.',
        3: 'Orientation is geometry: the normal alone decides the direction of the edge.',
      },
      hints: ['Point your right thumb along the normals near the edge (up and out) and look at which way your fingers curl.'],
      teach: 'Right-hand rule: thumb along the surface’s normal, fingers curl in the direction the boundary is walked.',
      explain: 'Thumb up, fingers curl anticlockwise as seen from above. Equivalently: walk the edge with your head along the normal, and the surface stays on your left.',
    }),
    num({
      id: 'use-edge', difficulty: 2,
      gen(r) {
        const [a, R] = r.pick([[2, 1], [3, 2], [1, 2], [2, 1.5]]);
        const val = 2 * PI * a * R * R;
        return {
          prompt: t`Find the upward flux of the curl of $\vec F = \langle -${a === 1 ? '' : a}y + z\cos x,\ \ ${a === 1 ? '' : a}x + z^2,\ \ xyz\rangle$ through the hemisphere $x^2 + y^2 + z^2 = ${R * R}$, $z \ge 0$.`,
          visual: stokesPic([`-${a}*y + z*cos(x)`, `${a}*x + z^2`, 'x*y*z'], null, [{ label: 'Hemisphere', x: `${R}*sin(u)*cos(v)`, y: `${R}*sin(u)*sin(v)`, z: `${R}*cos(u)`, u: [0, 'pi/2'], v: [0, '2*pi'], boundary: { x: `${R}*cos(t)`, y: `${R}*sin(t)`, z: '0', t: [0, '2*pi'] } }], { range: 1.3 * R, caption: 'The hemisphere tinted by the flux integrand of the curl (gold arrows: the curl), and its edge in the floor, walked anticlockwise. Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: -val, feedback: 'Upward normals pair with the edge walked anticlockwise from above; the other direction flips the sign.' }],
          hints: [t`By Stokes, this equals the circulation of $\vec F$ round the edge, the circle $x^2 + y^2 = ${R * R}$ in the plane $z = 0$, walked anticlockwise.`, t`On that circle $z = 0$, so $\vec F = \langle -${a === 1 ? '' : a}y,\ ${a === 1 ? '' : a}x,\ 0\rangle$: with $x = ${R}\cos t$, $y = ${R}\sin t$, $\vec F\cdot\vec r\,' = ${nice(a * R * R)}$.`],
          teach: 'Stokes lets you trade a hard surface integral of a curl for a line integral round the edge — or the other way round.',
          explain: t`Round the edge, $\vec F\cdot\vec r\,' = ${nice(a * R * R)}(\sin^2 t + \cos^2 t) = ${nice(a * R * R)}$, so the circulation — and the flux of the curl — is $2\pi\cdot${nice(a * R * R)} \approx ${nice(+val.toPrecision(4))}$. The messy $z$-terms never mattered: they vanish on the edge.`,
        };
      },
    }),
    mcq({
      id: 'two-nets', difficulty: 2,
      prompt: t`A field’s curl has upward flux $5$ through the hanging net drawn here. The flat disk across the same rim is also oriented upward. What is the curl’s upward flux through the disk?`,
      visual: stokesPic(['-y', 'x + z^2', 'x*y'], null, [NETS[4], NETS[0]], { ghosts: true, caption: 'A net hanging below the unit circle (solid) and the flat disk across the same rim (faint). Drag to rotate.' }),
      choices: ['5', '−5', '0', 'It depends on the field, so it cannot be told'],
      answer: 0,
      why: {
        1: 'Both surfaces have upward normals, so both pair with the same anticlockwise walk round the rim: no sign change.',
        2: 'Zero is the flux of a curl through a closed surface. The disk alone is not closed.',
        3: 'Stokes says both fluxes equal the same circulation round the shared edge, whatever the field.',
      },
      hints: ['Both fluxes equal the circulation round the same edge, walked the same way.'],
      teach: 'The flux of a curl depends only on the boundary curve and its orientation, not on which surface spans it.',
      explain: 'Each equals the circulation round the shared rim, walked anticlockwise from above: both are 5. Together, the net and the disk (with the disk’s normal reversed) enclose a region, and the flux of a curl out of a closed surface is 0 — the same fact.',
    }),
    mcq({
      id: 'closed', difficulty: 2,
      prompt: t`What is the outward flux of the curl of any smooth field $\vec F$ through a whole sphere?`,
      visual: stokesPic(['z - y', 'x + z', 'x*y'], ['x - 1', '1 - y', '2'], [{ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }], { caption: 'A sphere tinted by the flux integrand of a curl: where it enters (red) and leaves (blue). Drag to rotate.' }),
      choices: ['0', t`$4\pi$ times the curl at the centre`, 'It depends on the field', 'It is undefined, because a sphere has no edge'],
      answer: 0,
      why: {
        1: 'That has the wrong shape entirely: a curl’s flux is set by edges, and a sphere has none.',
        2: 'For every field the answer is the same: cut the sphere into two hemispheres along the equator, and their curl fluxes cancel.',
        3: 'The surface integral is perfectly defined; Stokes then says it equals a line integral round an empty edge — zero.',
      },
      hints: ['Cut the sphere along its equator into two caps. How do their edges and orientations compare?', t`Or: by the divergence theorem (next lesson) it is $\iiint\nabla\cdot(\nabla\times\vec F)\,dV$.`],
      teach: 'A closed surface has no boundary, so the flux of any curl through it is zero.',
      explain: 'Split the sphere along the equator. Outward normals on the two halves induce opposite walks round the equator, so the two curl fluxes are equal and opposite: the total is 0. (It is also ∭ div(curl F) dV = 0.)',
    }),
    num({
      id: 'faraday-local', difficulty: 2,
      gen(r) {
        const k = r.pick([0.15, 0.3, 0.45]);
        return {
          prompt: t`In a region of space the induced electric field is $\vec E = ${k}\,\langle y,\ -x,\ 0\rangle$ V/m, with $x$ and $y$ in metres. Faraday’s law in differential form — which Stokes’ theorem extracts from the loop law $\oint\vec E\cdot d\vec l = -d\Phi_B/dt$ — says $\nabla\times\vec E = -\partial\vec B/\partial t$. Find $\partial B_z/\partial t$.`,
          visual: { type: 'field2d', params: { P: `${k}*y`, Q: `-${k}*x`, x: [-2, 2], y: [-2, 2], readout: false, probe: false, density: 13 }, caption: 'The induced electric field in the xy-plane: it circulates clockwise. Arrow lengths compressed.' },
          answer: 2 * k, units: 'T/s', tol: { rel: 1e-3 },
          errors: [{ value: k, feedback: t`Both cross-partials contribute: $(\nabla\times\vec E)_z = \partial_x(-${k}x) - \partial_y(${k}y) = -${2 * k}$.` }],
          hints: [t`$(\nabla\times\vec E)_z = \dfrac{\partial E_y}{\partial x} - \dfrac{\partial E_x}{\partial y}$.`, t`That gives $-${k} - ${k} = -${nice(2 * k)}$ T/s, and $\partial B_z/\partial t = -(\nabla\times\vec E)_z$.`],
          teach: 'Faraday’s law point by point: the curl of E equals minus the rate of change of B.',
          explain: t`$(\nabla\times\vec E)_z = -${nice(2 * k)}$ T/s, so $\partial B_z/\partial t = +${nice(2 * k)}$ T/s: a uniform field along $+z$ growing at that rate. Check with the loop law: round a circle of radius $r$, $\oint\vec E\cdot d\vec l = -${nice(2 * k)}\pi r^2 = -d\Phi_B/dt$ ✓ (the clockwise circulation opposes the growing flux — Lenz).`,
        };
      },
    }),
    order({
      id: 'ampere-steps', difficulty: 3,
      prompt: t`Put in order the steps that turn Ampère’s law for loops (steady currents), $\oint_C\vec B\cdot d\vec l = \mu_0\iint_S\vec J\cdot d\vec S$ for every loop $C$ bounding a surface $S$, into its differential form $\nabla\times\vec B = \mu_0\vec J$.`,
      visual: stokesPic(['-y', 'x', '0'], ['0', '0', '2'], [{ label: 'Loop', x: '0.8*u*cos(v)', y: '0.8*u*sin(v)', z: '0', u: [0, 1], v: [0, '2*pi'], boundary: { x: '0.8*cos(t)', y: '0.8*sin(t)', z: '0', t: [0, '2*pi'] } }], { normals: false, arrowLen: 0.25, caption: t`Inside a wire carrying a uniform current along $z$, $\vec B \propto \langle -y, x, 0\rangle$: a loop (green) and a surface it bounds, tinted by the flux of $\nabla\times\vec B$. Drag to rotate.` }),
      items: [
        t`Start from Ampère’s law: $\oint_C\vec B\cdot d\vec l = \mu_0\iint_S\vec J\cdot d\vec S$ for every loop.`,
        t`Use Stokes on the left side: $\oint_C\vec B\cdot d\vec l = \iint_S(\nabla\times\vec B)\cdot d\vec S$.`,
        t`Subtract: $\iint_S(\nabla\times\vec B - \mu_0\vec J)\cdot d\vec S = 0$ for every surface $S$.`,
        t`Shrink $S$ to a tiny flat patch at any point, facing any direction: the integrand’s component along every normal must vanish.`,
        t`So $\nabla\times\vec B = \mu_0\vec J$ at every point.`,
      ],
      hints: ['Stokes’ theorem converts a circulation into a surface integral — that is the step that brings both sides under one integral.', 'An integral that vanishes over every tiny patch, in every orientation, has a zero integrand.'],
      teach: 'Integral law for every loop + Stokes + shrinking the surface = the same law at each point.',
      explain: t`Stokes puts both sides under one surface integral; since it vanishes for every surface, including arbitrarily small patches facing any way, the vector $\nabla\times\vec B - \mu_0\vec J$ must be zero everywhere. Faraday’s law becomes $\nabla\times\vec E = -\partial\vec B/\partial t$ in exactly the same way.`,
    }),
    mcq({
      id: 'error-lower', difficulty: 2, kind: 'error',
      prompt: t`For $\vec F = \langle -y, x, 0\rangle$ a student takes the **lower** unit hemisphere with its outward (downward) normals, computes $\iint(\nabla\times\vec F)\cdot d\vec S = -2\pi$, and pairs it with the circulation round the equator walked anticlockwise from above, $+2\pi$. “Stokes’ theorem fails,” they conclude. What is wrong?`,
      visual: stokesPic(['-y', 'x', '0'], ['0', '0', '2'], [{ label: 'Lower hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [PI / 2, PI].map((x) => +x.toFixed(6)), v: [0, '2*pi'] }], { pitch: 0.15, caption: 'The lower hemisphere with outward normals (white), tinted by the flux integrand of the curl: the curl points up, the normals down. Drag to rotate.' }),
      choices: [
        'Downward normals pair with the edge walked clockwise from above; walked that way the circulation is −2π, and Stokes holds',
        'Nothing: Stokes’ theorem only works for the upper hemisphere',
        'The curl is computed wrongly: it should point down',
        'The circulation round the equator is 0',
      ],
      answer: 0,
      why: {
        1: 'Stokes works for any oriented surface — but the edge’s direction must match the normals by the right-hand rule.',
        2: t`$\nabla\times\langle -y, x, 0\rangle = \langle 0, 0, 2\rangle$, up, wherever you are.`,
        3: t`Round the unit circle anticlockwise it is $2\pi$; clockwise $-2\pi$; never 0.`,
      },
      hints: ['Apply the right-hand rule to the downward normals at the equator.'],
      teach: 'Stokes pairs a surface’s normals with one particular direction round its edge; mismatching them flips a sign.',
      explain: 'Thumb down, fingers curl clockwise seen from above. With the edge walked that way the circulation is −2π, equal to the flux −2π. Both hemispheres satisfy Stokes; they just induce opposite walks round the equator.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ellipse', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), h = r.pick([2, 4, 5]);
        const val = 2 * PI * R * R;
        return {
          prompt: t`Use Stokes’ theorem to find $\oint_C\vec F\cdot d\vec r$ for $\vec F = \langle z,\ x,\ y\rangle$, where $C$ is where the plane $z = ${h} - y$ cuts the cylinder $x^2 + y^2 = ${R * R}$, walked anticlockwise as seen from above.`,
          visual: stokesPic(['z', 'x', 'y'], ['1', '1', '1'], [{ label: 'Plane piece', x: `${R}*u*cos(v)`, y: `${R}*u*sin(v)`, z: `${h} - ${R}*u*sin(v)`, u: [0, 1], v: [0, '2*pi'], boundary: { x: `${R}*cos(t)`, y: `${R}*sin(t)`, z: `${h} - ${R}*sin(t)`, t: [0, '2*pi'] } }], { range: 1.2 * Math.max(R, h), axes: false, caption: 'The tilted ellipse C and the piece of the plane inside it, tinted by the flux of the curl. Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: PI * R * R, feedback: t`On the tilted plane $d\vec S = \langle 0, 1, 1\rangle\,dA$, not $\hat k\,dA$: both the $y$- and $z$-components of the curl contribute.` }],
          hints: [t`$\nabla\times\vec F = \langle 1, 1, 1\rangle$, and on the plane $z = ${h} - y$, $d\vec S = \langle 0, 1, 1\rangle\,dA$ (upward).`],
          teach: 'Choose the simplest surface with the given edge, orient it by the right-hand rule, and integrate the curl’s flux.',
          explain: t`$(\nabla\times\vec F)\cdot\langle 0, 1, 1\rangle = 2$, so the circulation is $2\times(\text{area of the disk } x^2 + y^2 \le ${R * R}) = 2\pi\cdot${R * R} \approx ${nice(+val.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'cp-vortex', difficulty: 3, transfer: true,
      gen(r) {
        const [a, V] = r.pick([[0.5, 40], [1.2, 55], [0.3, 30]]);
        const w = (2 * V) / a;
        return {
          prompt: t`An aircraft’s wingtip leaves a trailing vortex. Model its core, radius $a = ${a}$ m, as rotating like a solid body: inside it $\vec v = \Omega\langle -y,\ x,\ 0\rangle$, with the air at the core’s edge moving at $${V}$ m/s. The **vorticity** is $\vec\omega = \nabla\times\vec v$. Use Stokes’ theorem on the disk of the core — the circulation round its edge equals the flux of the vorticity through it — to find $\omega_z$, the vorticity inside the core.`,
          visual: { type: 'field2d', params: { P: `-y*step(1 - x^2 - y^2) - y/(x^2 + y^2)*step(x^2 + y^2 - 1)`, Q: `x*step(1 - x^2 - y^2) + x/(x^2 + y^2)*step(x^2 + y^2 - 1)`, x: [-3, 3], y: [-3, 3], loop: { r: 1 }, readout: false, probe: false, density: 13 }, caption: 'A Rankine vortex, the standard model of a wingtip vortex, in the plane across it: solid-body rotation inside the core (gold circle), speed falling as 1/r outside. Distances in units of the core radius; arrow lengths compressed.' },
          answer: w, units: 's^-1', tol: { rel: 2e-3 },
          errors: [{ value: V / a, feedback: t`That is $\Omega$, the core’s angular velocity. The vorticity of solid-body rotation is **twice** it: $\nabla\times\Omega\langle -y, x, 0\rangle = \langle 0, 0, 2\Omega\rangle$.` }, { value: 2 * PI * a * V, feedback: t`That is the circulation $\Gamma$, in m²/s. Divide by the core’s area $\pi a^2$ to get the vorticity, the circulation per unit area.` }],
          hints: [t`The circulation round the core’s edge is speed × circumference: $\Gamma = 2\pi a\cdot${V}$.`, t`The vorticity is uniform in the core, so its flux is $\omega_z\cdot\pi a^2$. Set that equal to $\Gamma$.`],
          teach: 'Circulation round a loop = flux of vorticity through it; for solid-body rotation the vorticity is twice the angular velocity.',
          explain: t`$\Gamma = 2\pi(${a})(${V}) \approx ${nice(+(2 * PI * a * V).toPrecision(4))}$ m²/s, and $\omega_z = \Gamma/(\pi a^2) = 2(${V})/${a} = ${nice(w)}$ s⁻¹ — twice the core’s spin rate $\Omega = ${nice(V / a)}$ rad/s. Outside the core this model’s vorticity is zero, but the circulation round any larger loop stays $\Gamma$: the vortex field of the earlier lessons, with its curl packed into the core rather than a point.`,
        };
      },
    }),
    mcq({
      id: 'cp-net', difficulty: 2,
      prompt: t`You need the upward flux of $\nabla\times\vec F$ through a complicated dome whose edge is the unit circle in the $xy$-plane. Which surface can you use instead?`,
      visual: stokesPic(['-y', 'x', '0'], ['0', '0', '2'], [NETS[2], NETS[0]], { ghosts: true, arrows: false, caption: 'A dome over the unit circle (solid) and the flat disk across it (faint). Drag to rotate.' }),
      choices: ['The flat unit disk in the xy-plane, oriented upward', 'The flat unit disk, oriented downward', 'The whole unit sphere', 'The disk of radius 2 in the xy-plane, oriented upward'],
      answer: 0,
      why: {
        1: 'Downward normals pair with the opposite walk round the edge, giving the opposite sign.',
        2: 'The whole sphere has no edge: its curl flux is 0, not the dome’s.',
        3: 'A larger disk has a different edge, the circle of radius 2: the circulation round it differs in general.',
      },
      hints: ['The flux of a curl depends only on the edge and its direction.'],
      teach: 'Any surface with the same edge and a compatible orientation carries the same flux of a curl.',
      explain: 'The flat disk shares the dome’s edge, and with upward normals it induces the same anticlockwise walk round it. By Stokes both fluxes equal that circulation — so pick the surface that is easiest to integrate over.',
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.7 Stokes’ theorem', url: 'https://openstax.org/books/calculus-volume-3/pages/6-7-stokes-theorem' },
    { label: 'Anderson, Fundamentals of Aerodynamics (6th ed.), §2.12–2.13 (circulation and vorticity)', url: 'https://www.mheducation.com/highered/product/fundamentals-aerodynamics-anderson/M9781259129919.html' },
  ],
});
