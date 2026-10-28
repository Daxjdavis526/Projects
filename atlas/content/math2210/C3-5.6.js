// Parametric surfaces and surface area: a surface as a map (u, v) ↦ r(u, v),
// its grid curves and tangent vectors r_u, r_v, the normal r_u × r_v, and the
// area element |r_u × r_v| du dv — R² sin θ dθ dφ on a sphere, in the physics
// convention this course uses (θ from +z, φ round from +x).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_fields.js';

const t = String.raw;
const PI = Math.PI;
const DEG = PI / 180;

const SPHERE = { label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] };
const CYL = { label: 'Cylinder', x: 'cos(u)', y: 'sin(u)', z: 'v', u: [0, '2*pi'], v: [-1, 1] };
const CONE = { label: 'Cone', x: 'u*cos(v)', y: 'u*sin(v)', z: 'u - 0.6', u: [0, 1.2], v: [0, '2*pi'] };
const PARAB = { label: 'Paraboloid', x: 'u*cos(v)', y: 'u*sin(v)', z: 'u^2 - 0.5', u: [0, 1.1], v: [0, '2*pi'] };
const TORUS = { label: 'Torus', x: '(1 + 0.4*cos(u))*cos(v)', y: '(1 + 0.4*cos(u))*sin(v)', z: '0.4*sin(u)', u: [0, '2*pi'], v: [0, '2*pi'] };

/** A still picture of one surface on c3-flux, with no field and no numbers. */
const still = (surface, { patch = null, caption, ...rest } = {}) => ({
  type: 'c3-flux',
  params: { F: null, surfaces: [surface], integrand: 'none', normals: false, arrows: false, readouts: [], flipToggle: false, ...(patch ? { patch } : {}), ...rest },
  caption,
});

export default lesson({
  id: 'math2210.C3-5.6',
  title: 'Parametric surfaces and surface area',
  minutes: 12, difficulty: 3,
  intro: t`A **parametric surface** is a map from a region $D$ of the $uv$-plane into space, $\vec r(u, v) = \langle x(u, v),\ y(u, v),\ z(u, v)\rangle$ — the way a curve was a map from an interval. Holding $v$ fixed and moving $u$ traces a **grid curve** with tangent $\vec r_u$; holding $u$ fixed gives tangent $\vec r_v$. A small rectangle $du \times dv$ of $D$ lands on a patch that is nearly the parallelogram spanned by $\vec r_u\,du$ and $\vec r_v\,dv$, of area $|\vec r_u\times\vec r_v|\,du\,dv$. Adding up the patches:

$$A = \iint_D |\vec r_u\times\vec r_v|\,du\,dv$$

The cross product $\vec r_u\times\vec r_v$ is also a **normal** to the surface — the start of flux, next lesson.`,
  symbols: [
    { tex: '\\vec r(u, v)', text: 'the parametrization: the point of the surface labelled by the two numbers $(u, v)$' },
    { tex: 'D', text: 'the region of parameter values that covers the surface once (a sphere: $0 \\le \\theta \\le \\pi$, $0 \\le \\phi \\le 2\\pi$)' },
    { tex: '\\vec r_u,\\ \\vec r_v', text: 'the partial derivatives $\\partial\\vec r/\\partial u$ and $\\partial\\vec r/\\partial v$: tangent vectors along the two grid curves' },
    { tex: '|\\vec r_u\\times\\vec r_v|', text: 'the area-stretching factor: how many square metres of surface one unit of $du\\,dv$ becomes there' },
    { tex: 'du\\,dv', text: 'a small rectangle of the parameter region $D$' },
  ],
  why: t`Every flux integral — Gauss’s law, the heat reaching a radiator, the propellant crossing a nozzle’s exit — is built on $\vec r_u\times\vec r_v$; and the stretching factor is the surface version of the $\sqrt{|g|}$ that turns coordinates into area in curved geometry.`,
  visual: {
    type: 'c3-flux',
    title: 'A small rectangle of parameters, a small patch of surface',
    lead: t`Each surface is drawn with its grid curves. The gold patch is the image of a small parameter rectangle; the blue and violet arrows are $\vec r_u\,\Delta u$ and $\vec r_v\,\Delta v$, and the white arrow the normal $\vec r_u\times\vec r_v$. Move the patch and watch its area, $|\vec r_u\times\vec r_v|\,\Delta u\,\Delta v$, change.`,
    tasks: [
      t`Sphere: slide the patch from the equator toward a pole — it shrinks to nothing, because $|\vec r_\theta\times\vec r_\phi| = \sin\theta$ there. The total area is $4\pi$.`,
      t`Cylinder: the patch has the same size everywhere — $|\vec r_u\times\vec r_v| = 1$, so the cylinder unrolls into a flat rectangle without stretching.`,
      'Torus: patches on the outer rim are larger than those on the inner rim.',
    ],
    params: {
      F: null, integrand: 'none', normals: false, arrows: false, flipToggle: false, range: 1.4,
      surfaces: [SPHERE, CYL, CONE, PARAB, TORUS],
      surfaceExplain: t`Sphere: $u = \theta$ (from $+z$), $v = \phi$. Cylinder: $u = \phi$, $v = z$. Cone and paraboloid: $u$ = distance from the axis, $v = \phi$. Torus: $u$ round the tube, $v$ round the hole.`,
      sliders: [
        { key: 'pu', label: 'Patch: $u$', min: 0, max: 1, step: 0.01, value: 0.5, explain: 'Where the patch sits, as a fraction of the way through the u range.' },
        { key: 'pv', label: 'Patch: $v$', min: 0, max: 1, step: 0.01, value: 0.15, explain: 'Where the patch sits along v.' },
        { key: 'ps', label: 'Patch size', min: 0.02, max: 0.2, step: 0.01, value: 0.1, explain: 'The side of the parameter rectangle, as a fraction of each range.' },
      ],
      patch: { u: 'pu', v: 'pv', du: 'ps', dv: 'ps', frac: true },
      readouts: ['area', 'patch'],
    },
    caption: t`Drag to rotate. The patch is the exact image of the parameter rectangle; the readout’s patch area is the parallelogram estimate $|\vec r_u\times\vec r_v|\,\Delta u\,\Delta v$. Areas are computed numerically.`,
  },
  example: {
    prompt: t`A capsule’s heat shield is modelled as a spherical cap: part of a sphere of radius $R = 4.7$ m, with a rim of radius $1.9$ m (close to the Apollo command module’s shield). Find its area. In this course’s convention, $\theta$ is measured from the $+z$-axis and $\phi$ round from $+x$.`,
    visual: still({ label: 'Cap', x: '4.7*sin(u)*cos(v)', y: '4.7*sin(u)*sin(v)', z: '4.7*cos(u)', u: [0, r6(Math.asin(1.9 / 4.7))], v: [0, '2*pi'] }, { axes: false, n: 18, patch: { u: 0.55, v: 0.1, du: 0.18, dv: 0.06, frac: true }, readouts: ['area'], pitch: 0.55, caption: 'The heat shield as a cap of a sphere, with one patch and its edge vectors. The readout is its area, computed numerically. Drag to rotate.' }),
    steps: [
      { label: 'Parametrize', text: t`$\vec r(\theta, \phi) = R\langle\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta\rangle$ with $0 \le \phi \le 2\pi$ and $0 \le \theta \le \theta_0$, where the rim has $R\sin\theta_0 = 1.9$ m: $\sin\theta_0 = 1.9/4.7$.` },
      { label: 'Tangents', text: t`$\vec r_\theta = R\langle\cos\theta\cos\phi,\ \cos\theta\sin\phi,\ -\sin\theta\rangle$ and $\vec r_\phi = R\langle -\sin\theta\sin\phi,\ \sin\theta\cos\phi,\ 0\rangle$.` },
      { label: 'Cross product', text: t`$\vec r_\theta\times\vec r_\phi = R^2\sin\theta\,\langle\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta\rangle$: the outward radial direction, of length $R^2\sin\theta$. So $dS = R^2\sin\theta\,d\theta\,d\phi$ — the outer two factors of the spherical volume element.` },
      { label: 'Integrate', text: t`$A = \displaystyle\int_0^{2\pi}\!\!\int_0^{\theta_0} R^2\sin\theta\,d\theta\,d\phi = 2\pi R^2(1 - \cos\theta_0)$.` },
      { label: 'Numbers', text: t`$\cos\theta_0 = \sqrt{1 - (1.9/4.7)^2} = 0.9147$, so $A = 2\pi(4.7)^2(0.0853) \approx 11.8\ \text{m}^2$.` },
      { label: 'Sense check', text: t`A flat disk of radius 1.9 m has area $\pi(1.9)^2 = 11.3$ m²: the shallow dome is only 4% more. And $2\pi R^2(1 - \cos\theta_0) = 2\pi R h$, where $h = 0.40$ m is the cap’s height — Archimedes’ result.` },
    ],
    answer: t`$A = 2\pi R^2(1 - \cos\theta_0) \approx 11.8\ \text{m}^2$.`,
  },
  practice: [
    mcq({
      id: 'grid-curve', difficulty: 1,
      prompt: t`The cylinder $\vec r(\phi, z) = \langle 2\cos\phi,\ 2\sin\phi,\ z\rangle$ is covered by two families of grid curves. What is the grid curve $\phi = \pi/2$?`,
      visual: still({ label: 'Cylinder', x: '2*cos(u)', y: '2*sin(u)', z: 'v', u: [0, '2*pi'], v: [-1.5, 1.5] }, { n: 16, range: 2.4, caption: 'The cylinder with its grid curves: lines of constant φ and of constant z. Drag to rotate.' }),
      choices: [t`A vertical line through $(0, 2, z)$, parallel to the $z$-axis`, 'A circle of radius 2', 'A helix winding round the cylinder', 'A single point'],
      answer: 0,
      why: {
        1: t`Circles are the grid curves $z = $ constant, where $\phi$ runs round.`,
        2: t`A helix needs both parameters to change together, like $\phi = z$.`,
        3: t`Fixing one parameter still leaves the other free to move: a curve, not a point.`,
      },
      hints: [t`Set $\phi = \pi/2$ and let $z$ vary: $\vec r = \langle 2\cos\tfrac\pi2,\ 2\sin\tfrac\pi2,\ z\rangle$.`],
      teach: 'Fixing one parameter of a surface and letting the other run traces a grid curve.',
      explain: t`With $\phi = \pi/2$, $\vec r = \langle 0,\ 2,\ z\rangle$: the vertical line through $(0, 2)$. Its tangent is $\vec r_z = \langle 0, 0, 1\rangle$.`,
    }),
    num({
      id: 'stretch', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, 2], [2, 1], [1, 1], [2, 2], [0, 1]]);
        const val = Math.sqrt(1 + 4 * a * a + 4 * b * b);
        return {
          prompt: t`The paraboloid $z = x^2 + y^2$ is parametrized by $\vec r(x, y) = \langle x,\ y,\ x^2 + y^2\rangle$. Find the area-stretching factor $|\vec r_x\times\vec r_y|$ at $(x, y) = (${a}, ${b})$.`,
          visual: still({ label: 'Paraboloid', x: 'u', y: 'v', z: 'u^2 + v^2', u: [-2.2, 2.2], v: [-2.2, 2.2] }, { n: 18, range: 2.4, patch: { u: a, v: b, du: 0.25, dv: 0.25 }, pitch: 0.5, caption: t`The paraboloid, with the patch over the square $${a} \le x \le ${a + 0.25}$, $${b} \le y \le ${b + 0.25}$: its edge vectors $\vec r_x\Delta x$, $\vec r_y\Delta y$ and its normal. Drag to rotate.` }),
          answer: val, tol: { rel: 2e-3 },
          errors: [{ value: 1 + 4 * a * a + 4 * b * b, feedback: 'That is the squared length: take the square root.' }, { value: Math.sqrt(1 + 2 * a + 2 * b), feedback: t`$f_x = 2x$ and $f_y = 2y$ get **squared**: the factor is $\sqrt{1 + f_x^2 + f_y^2}$.` }],
          hints: [t`$\vec r_x = \langle 1, 0, 2x\rangle$ and $\vec r_y = \langle 0, 1, 2y\rangle$.`, t`$\vec r_x\times\vec r_y = \langle -2x,\ -2y,\ 1\rangle$; take its length.`],
          teach: t`For a graph $z = f(x, y)$, $\vec r_x\times\vec r_y = \langle -f_x,\ -f_y,\ 1\rangle$, so the area factor is $\sqrt{1 + f_x^2 + f_y^2}$.`,
          explain: t`$\vec r_x\times\vec r_y = \langle -2x, -2y, 1\rangle$, whose length at $(${a}, ${b})$ is $\sqrt{1 + ${4 * a * a} + ${4 * b * b}} = \sqrt{${1 + 4 * a * a + 4 * b * b}} \approx ${nice(+val.toPrecision(4))}$: a small square of the floor there becomes a patch ${nice(+val.toPrecision(3))} times larger, because the surface is steep.`,
        };
      },
    }),
    num({
      id: 'tropics', difficulty: 2,
      prompt: t`Between the Tropic of Cancer and the Tropic of Capricorn lie all points of Earth within $23.44^\circ$ of the equator. Treating Earth as a sphere of radius $R = 6371$ km, use $dS = R^2\sin\theta\,d\theta\,d\phi$ ($\theta$ from the North Pole) to find the area of this band.`,
      visual: still({ label: 'Tropics', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [r6((90 - 23.44) * DEG), r6((90 + 23.44) * DEG)], v: [0, '2*pi'] }, { n: 18, range: 1.4, caption: 'The band between the tropics, drawn on a unit sphere (the rest of the sphere is not drawn). Drag to rotate.' }),
      answer: 4 * PI * 6371 ** 2 * Math.sin(23.44 * DEG), units: 'km^2', tol: { rel: 0.005 },
      errors: [{ value: 2 * PI * 6371 ** 2 * (2 * 23.44 * DEG), feedback: t`You integrated $R^2\,d\theta\,d\phi$ and dropped the $\sin\theta$: near the equator it is close to 1, but not equal.` }],
      hints: [t`In polar angle the band runs from $\theta_1 = 90^\circ - 23.44^\circ$ to $\theta_2 = 90^\circ + 23.44^\circ$.`, t`$A = 2\pi R^2(\cos\theta_1 - \cos\theta_2) = 2\pi R^2\cdot 2\sin 23.44^\circ$.`],
      teach: t`On a sphere $dS = R^2\sin\theta\,d\theta\,d\phi$: a band between two polar angles has area $2\pi R^2(\cos\theta_1 - \cos\theta_2)$.`,
      explain: t`$A = 4\pi R^2\sin 23.44^\circ = 4\pi(6371)^2(0.3978) \approx 2.03\times10^{8}$ km² — about 40% of Earth’s surface, though the band spans only 26% of the range of latitudes.`,
    }),
    num({
      id: 'tank', difficulty: 1,
      gen(r) {
        const [R, L] = r.pick([[1.85, 9], [2.6, 12], [1.5, 6]]);
        return {
          prompt: t`The cylindrical barrel of a propellant tank is $\vec r(\phi, z) = \langle ${R}\cos\phi,\ ${R}\sin\phi,\ z\rangle$ for $0 \le \phi \le 2\pi$, $0 \le z \le ${L}$ (m). Find $|\vec r_\phi\times\vec r_z|$ and use it to find the barrel’s area — how much insulation foam it needs.`,
          visual: still({ label: 'Barrel', x: `${R}*cos(u)`, y: `${R}*sin(u)`, z: 'v', u: [0, '2*pi'], v: [0, L] }, { n: 14, range: L / 2, axes: false, caption: 'The barrel of the tank (its domes not drawn). Drag to rotate.' }),
          answer: 2 * PI * R * L, units: 'm^2', tol: { rel: 2e-3 },
          errors: [{ value: PI * R * R * L, feedback: t`That is the barrel’s **volume** in m³. The area is $\int_0^{${L}}\!\int_0^{2\pi} ${R}\,d\phi\,dz$.` }, { value: 2 * PI * L, feedback: t`$|\vec r_\phi\times\vec r_z| = ${R}$, not 1: a step $d\phi$ moves $${R}\,d\phi$ m round the barrel.` }],
          hints: [t`$\vec r_\phi = \langle -${R}\sin\phi,\ ${R}\cos\phi,\ 0\rangle$ and $\vec r_z = \langle 0, 0, 1\rangle$.`],
          teach: 'A cylinder of radius R has area factor R: it unrolls flat into a rectangle 2πR by its length.',
          explain: t`$|\vec r_\phi\times\vec r_z| = ${R}$, so $A = \int_0^{${L}}\!\int_0^{2\pi}${R}\,d\phi\,dz = 2\pi(${R})(${L}) \approx ${nice(+(2 * PI * R * L).toPrecision(4))}$ m².`,
        };
      },
    }),
    num({
      id: 'nose-cone', difficulty: 2,
      gen(r) {
        const [Rb, H] = r.pick([[0.6, 1.5], [0.5, 1.8], [0.9, 2.4]]);
        const A = PI * Rb * Math.hypot(Rb, H);
        return {
          prompt: t`A rocket’s conical nose cone has base radius ${Rb} m and height ${H} m. Parametrize its surface by distance $\rho$ from the axis and angle $\phi$: $\vec r(\rho, \phi) = \big\langle \rho\cos\phi,\ \rho\sin\phi,\ ${H}\,(1 - \rho/${Rb})\big\rangle$, $0 \le \rho \le ${Rb}$, $0 \le \phi \le 2\pi$. Find its area.`,
          visual: still({ label: 'Nose cone', x: 'u*cos(v)', y: 'u*sin(v)', z: `${H}*(1 - u/${Rb})`, u: [0, Rb], v: [0, '2*pi'] }, { n: 14, axes: false, pitch: 0.3, caption: 'The nose cone, its grid curves: circles of constant ρ and straight lines of constant φ. Drag to rotate.' }),
          answer: A, units: 'm^2', tol: { rel: 2e-3 },
          errors: [{ value: PI * Rb * Rb, feedback: 'That is the area of the flat base, not of the cone’s slanted side.' }, { value: PI * Rb * H, feedback: t`Use the slant height $\sqrt{${Rb}^2 + ${H}^2}$, not the height: the factor is $\rho\sqrt{1 + (${H}/${Rb})^2}$.` }],
          hints: [t`$\vec r_\rho = \langle\cos\phi,\ \sin\phi,\ -${nice(H / Rb)}\rangle$ and $\vec r_\phi = \langle -\rho\sin\phi,\ \rho\cos\phi,\ 0\rangle$.`, t`$|\vec r_\rho\times\vec r_\phi| = \rho\sqrt{1 + ${nice(H / Rb)}^2}$.`],
          teach: 'A cone’s area factor grows in proportion to ρ; its area is π × radius × slant height.',
          explain: t`$A = \displaystyle\int_0^{2\pi}\!\!\int_0^{${Rb}}\rho\sqrt{1 + (${H}/${Rb})^2}\,d\rho\,d\phi = \pi(${Rb})\sqrt{${Rb}^2 + ${H}^2} \approx ${nice(+A.toPrecision(4))}$ m² — $\pi\times$ radius $\times$ slant height.`,
        };
      },
    }),
    num({
      id: 'torus', difficulty: 3,
      gen(r) {
        const [R, a] = r.pick([[2, 0.5], [3, 1], [1.5, 0.4]]);
        const A = 4 * PI * PI * R * a;
        return {
          prompt: t`A torus (the shape of a ring habitat) is $\vec r(u, v) = \big\langle (${R} + ${a}\cos u)\cos v,\ (${R} + ${a}\cos u)\sin v,\ ${a}\sin u\big\rangle$, with $u$ running round the tube and $v$ round the hole, each from $0$ to $2\pi$. Given that $|\vec r_u\times\vec r_v| = ${a}(${R} + ${a}\cos u)$, find its area.`,
          visual: still({ label: 'Torus', x: `(${R} + ${a}*cos(u))*cos(v)`, y: `(${R} + ${a}*cos(u))*sin(v)`, z: `${a}*sin(u)`, u: [0, '2*pi'], v: [0, '2*pi'] }, { n: 22, axes: false, pitch: 0.7, caption: 'The torus with its grid curves: circles round the tube (constant v) and round the hole (constant u). Drag to rotate.' }),
          answer: A, tol: { rel: 2e-3 },
          errors: [{ value: 4 * PI * PI * a * a, feedback: t`Integrate the whole factor $${a}(${R} + ${a}\cos u)$: its constant part $${nice(a * R)}$ gives the whole area, and the $\cos u$ part integrates to zero.` }],
          hints: [t`$A = \displaystyle\int_0^{2\pi}\!\!\int_0^{2\pi} ${a}(${R} + ${a}\cos u)\,du\,dv$.`, t`$\int_0^{2\pi}\cos u\,du = 0$, so the inner integral is $${a}\cdot${R}\cdot2\pi$.`],
          teach: 'The torus’s area is (2πa)(2πR): a tube of circumference 2πa times the length of its centre circle.',
          explain: t`$A = ${a}\cdot ${R}\cdot(2\pi)^2 = ${nice(4 * a * R)}\pi^2 \approx ${nice(+A.toPrecision(4))}$ — the tube’s circumference $2\pi(${a})$ times the length of the centre circle $2\pi(${R})$. The outer rim’s extra area exactly balances the inner rim’s deficit (Pappus’s theorem).`,
        };
      },
    }),
    mcq({
      id: 'error-flat', difficulty: 2, kind: 'error',
      prompt: t`A student finds the area of the unit sphere from its parameter region $0 \le \theta \le \pi$, $0 \le \phi \le 2\pi$: “$A = \displaystyle\int_0^{2\pi}\!\!\int_0^{\pi} d\theta\,d\phi = 2\pi^2$.” But the area should be $4\pi$. What went wrong?`,
      visual: still(SPHERE, { n: 20, patch: { u: 0.06, v: 0.3, du: 0.12, dv: 0.12, frac: true }, caption: 'The unit sphere and a patch near the pole, made from the same size of parameter rectangle as every other — but much smaller in area. Drag to rotate.' }),
      choices: [
        t`The parameter rectangle is not the surface: each $d\theta\,d\phi$ must be stretched by $|\vec r_\theta\times\vec r_\phi| = \sin\theta$, which gives $4\pi$`,
        t`$\theta$ should run from $0$ to $2\pi$`,
        t`$2\pi^2$ is right; $4\pi$ is the area of a circle`,
        t`$\phi$ should run from $0$ to $\pi$`,
      ],
      answer: 0,
      why: {
        1: t`Then every point would be covered twice: $\theta$ from $0$ to $\pi$ already reaches from pole to pole.`,
        2: t`A circle of radius 1 has area $\pi$. The sphere’s $4\pi$ is the integral of $\sin\theta$ against $d\theta\,d\phi$.`,
        3: t`Then only half the sphere would be covered: $\phi$ must go all the way round.`,
      },
      hints: [t`Is a small parameter rectangle near $\theta = 0$ the same size on the sphere as one near $\theta = \pi/2$?`, t`The area element is $|\vec r_\theta\times\vec r_\phi|\,d\theta\,d\phi$.`],
      teach: t`The area of a surface is not the area of its parameter region: every $du\,dv$ is stretched by $|\vec r_u\times\vec r_v|$.`,
      explain: t`$A = \int_0^{2\pi}\!\int_0^\pi\sin\theta\,d\theta\,d\phi = 2\pi\cdot2 = 4\pi$. Near the poles the circles of latitude shrink, so a parameter rectangle there covers little area; the factor $\sin\theta$ accounts for it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dish', difficulty: 3,
      gen(r) {
        const h = r.pick([1, 2, 3]);
        const A = (PI / 6) * ((1 + 4 * h) ** 1.5 - 1);
        return {
          prompt: t`Find the area of the part of the paraboloid $z = x^2 + y^2$ below the plane $z = ${h}$. (Parametrize it by $\vec r(\rho, \phi) = \langle\rho\cos\phi,\ \rho\sin\phi,\ \rho^2\rangle$.)`,
          visual: still({ label: 'Bowl', x: 'u*cos(v)', y: 'u*sin(v)', z: 'u^2', u: [0, r6(Math.sqrt(h))], v: [0, '2*pi'] }, { n: 16, range: 1.2 * Math.sqrt(h) + 0.6, caption: t`The paraboloid up to $z = ${h}$. Drag to rotate.` }),
          answer: A, tol: { rel: 2e-3 },
          errors: [{ value: PI * h, feedback: t`That is the area of the disk under the bowl, $\pi\rho^2$ at $\rho = \sqrt{${h}}$. The bowl is steeper, so larger: the factor is $\rho\sqrt{1 + 4\rho^2}$.` }],
          hints: [t`$|\vec r_\rho\times\vec r_\phi| = \rho\sqrt{1 + 4\rho^2}$, and the rim $z = ${h}$ is at $\rho = \sqrt{${h}}$.`, t`Substitute $w = 1 + 4\rho^2$.`],
          teach: t`Surface area: find $|\vec r_u\times\vec r_v|$, set the parameter limits, integrate.`,
          explain: t`$A = \displaystyle\int_0^{2\pi}\!\!\int_0^{\sqrt{${h}}}\rho\sqrt{1 + 4\rho^2}\,d\rho\,d\phi = 2\pi\cdot\frac{(1 + 4\rho^2)^{3/2}}{12}\Big|_0^{\sqrt{${h}}} = \frac{\pi}{6}\left(${1 + 4 * h}^{3/2} - 1\right) \approx ${nice(+A.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'cp-coverage', difficulty: 3, transfer: true,
      gen(r) {
        const Re = 6378;
        const [name, rr] = r.pick([['a geostationary satellite', 42164], ['a GPS satellite', 26560], ['the International Space Station', 6778]]);
        const c = Re / rr, frac = (1 - c) / 2, th = Math.acos(c);
        const tx = (Re * Math.sin(th)) / 1000, ty = (Re * c) / 1000, S = rr / 1000;
        const xr = rr > 10000 ? [-0.55 * S, 1.08 * S] : [-14.7, 14.7], yh = (xr[1] - xr[0]) / 4.2;
        const view = { x: xr.map(r6), y: [-yh, yh].map(r6) };
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} orbits ${rr.toLocaleString('en-US').replace(/,/g, ' ')} km from Earth’s centre. The part of Earth it can see is a spherical cap round the point beneath it, reaching out to polar angle $\theta_0$ where its line of sight grazes the surface: $\cos\theta_0 = R/r$, with $R = 6378$ km. What **fraction** of Earth’s surface can it see at one moment?`,
          visual: {
            type: 'graph',
            params: {
              ...view, equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0,
              curves: [
                { param: ['6.378*cos(t)', '6.378*sin(t)'], t: [0, 2 * PI], color: 'accent', width: 2 },
                { param: ['6.378*cos(t)', '6.378*sin(t)'], t: [-th, th].map(r6), color: 'gold', width: 5 },
                { param: [`${r6(S)} + (${r6(ty)} - ${r6(S)})*t`, `${r6(tx)}*t`], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
                { param: [`${r6(S)} + (${r6(ty)} - ${r6(S)})*t`, `-${r6(tx)}*t`], t: [0, 1], color: 'ink3', width: 1.2, dash: true },
              ],
              points: [{ x: r6(S), y: 0, color: 'ink', r: 5, label: 'satellite', labelDx: -10, labelDy: -12, labelAlign: 'right' }],
            },
            caption: 'A cross-section through Earth’s centre (blue) and the satellite: the dashed lines of sight graze the surface, and the gold arc is the visible cap. Distances in thousands of km, to scale.',
          },
          answer: frac, tol: { rel: 0.005 },
          errors: [{ value: 1 - c, feedback: t`The cap’s area is $2\pi R^2(1 - \cos\theta_0)$, and the whole sphere’s is $4\pi R^2$: the fraction is $(1 - \cos\theta_0)/2$.` }, { value: th / PI, feedback: t`Area is not proportional to the angle: use $\int_0^{\theta_0}\sin\theta\,d\theta = 1 - \cos\theta_0$.` }],
          hints: [t`The cap’s area is $\int_0^{2\pi}\!\int_0^{\theta_0} R^2\sin\theta\,d\theta\,d\phi = 2\pi R^2(1 - \cos\theta_0)$.`, t`Divide by $4\pi R^2$: the fraction is $\tfrac12(1 - R/r)$.`],
          teach: 'A cap of polar half-angle θ₀ covers the fraction (1 − cos θ₀)/2 of a sphere.',
          explain: t`$\cos\theta_0 = 6378/${rr} = ${nice(+c.toPrecision(4))}$, so the fraction is $\tfrac12(1 - ${nice(+c.toPrecision(4))}) \approx ${nice(+frac.toPrecision(3))}$. ${rr > 40000 ? 'Even from geostationary height a satellite sees less than half the globe — three, spaced round the equator, are needed to cover the populated world.' : rr > 20000 ? 'Each GPS satellite sees well over a third of the globe, which is why about 24 suffice for four to be in view almost everywhere.' : 'From 400 km up the station sees only about 3% of Earth at a time.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-pole', difficulty: 2,
      prompt: t`On a sphere of radius $R$, $|\vec r_\theta\times\vec r_\phi| = R^2\sin\theta$. Why does the area factor contain $\sin\theta$?`,
      visual: still({ label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] }, { n: 20, patch: { u: 0.08, v: 0.4, du: 0.12, dv: 0.12, frac: true }, caption: 'The sphere’s grid: circles of latitude shrink toward the poles. A parameter rectangle there makes a thin sliver. Drag to rotate.' }),
      choices: [
        t`A step $d\phi$ moves round a circle of latitude of radius $R\sin\theta$, so it covers $R\sin\theta\,d\phi$, while a step $d\theta$ always covers $R\,d\theta$`,
        t`Because the sphere is curved, every area on it is reduced by $\sin\theta$ compared with a flat one`,
        t`It converts the angles from degrees to radians`,
        t`It makes the normal point outward rather than inward`,
      ],
      answer: 0,
      why: {
        1: t`Near the equator $\sin\theta \approx 1$ and patches are full size. The factor depends on where you are, because of how the coordinates are laid out, not because of curvature as such.`,
        2: 'Angles in calculus are already in radians; the factor is geometric.',
        3: t`Orientation is about the **direction** of $\vec r_\theta\times\vec r_\phi$; $\sin\theta \ge 0$ only affects its length.`,
      },
      hints: [t`How long is a circle of latitude at polar angle $\theta$?`],
      teach: 'dS = R² sin θ dθ dφ: a step in θ covers R dθ, a step in φ covers R sin θ dφ round a shrinking circle of latitude.',
      explain: t`The circle of latitude at polar angle $\theta$ has radius $R\sin\theta$, so $d\phi$ moves $R\sin\theta\,d\phi$ along it, while $d\theta$ moves $R\,d\theta$ along a meridian. The patch is nearly a rectangle with those sides: $dS = R^2\sin\theta\,d\theta\,d\phi$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.6 Surface integrals (parametric surfaces and surface area)', url: 'https://openstax.org/books/calculus-volume-3/pages/6-6-surface-integrals' },
    { label: 'NASA, Apollo Command Module heat shield', url: 'https://www.nasa.gov/history/afj/ap11fj/csm.html' },
  ],
});
