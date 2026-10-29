// The divergence theorem: the net outward flux through a closed surface is
// the integral of the divergence inside. Gauss's law as its consequence for
// 1/r² fields, with the delta function at the origin introduced honestly,
// the continuity equation, and why a theorem about closed surfaces cannot be
// used on an open one.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { boxSurface, sphereSurface, r6 } from './_fields.js';

const t = String.raw;
const PI = Math.PI;

/** A closed cylinder x² + y² ≤ R², z0 ≤ z ≤ z1, as three outward-oriented c3-flux pieces. */
const closedCylinder = (R, [z0, z1], label = 'Closed cylinder') => ({
  label,
  pieces: [
    { x: `${R}*cos(u)`, y: `${R}*sin(u)`, z: 'v', u: [0, '2*pi'], v: [z0, z1] },
    { x: 'u*cos(v)', y: 'u*sin(v)', z: `${z1}`, u: [0, R], v: [0, '2*pi'] },
    { x: 'v*cos(u)', y: 'v*sin(u)', z: `${z0}`, u: [0, '2*pi'], v: [0, R] },
  ],
  volume: { kind: 'cylinder', c: [0, 0], r: R, z: [z0, z1] },
});
const LUMPY = { label: 'Lumpy surface', x: '(1 + 0.2*cos(3*v)*sin(u)^2 + 0.15*cos(2*u))*sin(u)*cos(v)', y: '(1 + 0.2*cos(3*v)*sin(u)^2 + 0.15*cos(2*u))*sin(u)*sin(v)', z: '(1 + 0.2*cos(3*v)*sin(u)^2 + 0.15*cos(2*u))*cos(u)', u: [0, 'pi'], v: [0, '2*pi'] };
/** A closed-surface picture on c3-flux; no numbers. */
const closedPic = (F, surface, { caption, ...rest } = {}) => ({
  type: 'c3-flux',
  params: { F, surfaces: [surface], readouts: [], flipToggle: false, range: 1.4, ...rest },
  caption,
});
const SRC = '((x - sx)^2 + y^2 + (z - sz)^2)^1.5';

export default lesson({
  id: 'math2210.C3-5.9',
  title: 'The divergence theorem',
  minutes: 13, difficulty: 3,
  intro: t`The **divergence theorem** (Gauss’s theorem) says that the net flux out of a closed surface equals the total divergence inside it:

$$\oiint_{\partial E}\vec F\cdot d\vec S = \iiint_E \nabla\cdot\vec F\,dV$$

Cut the solid $E$ into small boxes: each box’s outward flux is about $\nabla\cdot\vec F$ times its volume, and two neighbouring boxes share a face whose flux leaves one and enters the other, so every inner face cancels and only the outer surface is left. Net flux out means sources inside. For the inverse-square field of a point charge the divergence is zero everywhere except at the charge, where it is all concentrated — which is **Gauss’s law**, and the reason the flux is the same through every surface round the charge.`,
  symbols: [
    { tex: 'E', text: 'a solid region of space, bounded by a closed surface' },
    { tex: '\\partial E', text: 'its boundary: a **closed** surface, oriented with normals pointing **out**' },
    { tex: '\\oiint', text: 'a surface integral over a closed surface' },
    { tex: '\\nabla\\cdot\\vec F', text: 'the divergence: net outflow per unit volume at each point — a source density' },
    { tex: 'dV', text: 'an element of volume, as in any triple integral' },
  ],
  why: t`It turns Gauss’s law $\oiint\vec E\cdot d\vec S = Q_\text{enc}/\varepsilon_0$ into $\nabla\cdot\vec E = \rho/\varepsilon_0$, gives every conservation law its local form $\partial\rho/\partial t + \nabla\cdot\vec J = 0$, and in relativity conservation of energy and momentum is a four-dimensional version, $\nabla_\mu T^{\mu\nu} = 0$.`,
  visual: {
    type: 'c3-flux',
    title: 'What comes out is what is made inside',
    lead: t`A closed surface in a field, tinted by the flux integrand: blue where the field leaves, red where it enters. The readouts compare the net flux out with the integral of the divergence over the solid inside. Try the point source and move it in and out.`,
    tasks: [
      'Radial field ⟨x, y, z⟩: divergence 3 everywhere, so the flux is 3 × the volume — for every surface.',
      t`Point source, inside: the flux is $4\pi = 12.57$ wherever the source sits, yet the readout of $\iiint\nabla\cdot\vec F\,dV$ is $0$ — the divergence is zero everywhere except at the source itself, where all of it is concentrated.`,
      'Move the source outside: what flows in on one side flows out on the other, and the flux drops to 0.',
    ],
    params: {
      F: [pickExpr('k', ['x', 'x^2', `(x - sx)/${SRC}`]), pickExpr('k', ['y', 'y^2', `y/${SRC}`]), pickExpr('k', ['z', 'z^2', `(z - sz)/${SRC}`])],
      divF: pickExpr('k', ['3', '2*x + 2*y + 2*z', '0']),
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Radial'], [1, 'Squares'], [2, 'Point source']], value: 2, explain: t`Radial $\langle x, y, z\rangle$ (divergence 3); squares $\langle x^2, y^2, z^2\rangle$ (divergence $2x + 2y + 2z$); a point source at $(s_x, 0, s_z)$, the inverse-square field $(\vec r - \vec s)/|\vec r - \vec s|^3$ (divergence 0 except at the source).` }],
      sliders: [
        { key: 'sx', label: 'Source: $s_x$', min: -1.55, max: 1.55, step: 0.1, value: 0.45, explain: 'Where the point source sits (point-source field only).' },
        { key: 'sz', label: 'Source: $s_z$', min: -1.55, max: 1.55, step: 0.1, value: 0.25, explain: 'Its height.' },
      ],
      surfaces: [sphereSurface(1, [0, 0, 0], 'Sphere'), boxSurface([-0.9, 0.9], [-0.9, 0.9], [-0.9, 0.9], 'Box'), closedCylinder(1, [-0.8, 0.8])],
      points: [{ at: ['sx', 0, 'sz'], label: 'source', color: 'bad', r: 5 }],
      readouts: ['flux', 'volume'], quad: 32, range: 1.6, yaw: 0.7, pitch: 0.35, n: 20, alpha: 0.6,
    },
    caption: t`Drag to rotate. Gold arrows show the field, lengths compressed. The flux is integrated numerically (less accurately when a point source is within a few hundredths of the surface); the divergence integral uses the exact divergence. The source marker shows only where the point source would sit.`,
  },
  example: {
    prompt: t`Find the outward flux of $\vec F = \langle xy,\ yz,\ zx\rangle$ through the surface of the unit cube $0 \le x, y, z \le 1$.`,
    visual: closedPic(['x*y', 'y*z', 'z*x'], boxSurface([0, 1], [0, 1], [0, 1], 'Cube'), { readouts: ['flux', 'volume'], range: 1.3, caption: 'The cube tinted by the flux integrand, with the field (gold). The readouts give both sides of the divergence theorem, computed numerically. Drag to rotate.' }),
    steps: [
      { label: 'Why the theorem', text: t`Six faces mean six surface integrals. The divergence theorem replaces them with one triple integral.` },
      { label: 'Divergence', text: t`$\nabla\cdot\vec F = \partial_x(xy) + \partial_y(yz) + \partial_z(zx) = y + z + x$.` },
      { label: 'Integrate', text: t`$\displaystyle\iiint_{[0,1]^3}(x + y + z)\,dV = \tfrac12 + \tfrac12 + \tfrac12 = \tfrac32$, since $\iiint x\,dV = \int_0^1 x\,dx = \tfrac12$ on the unit cube, and likewise for $y$ and $z$.` },
      { label: 'Check one face', text: t`On the face $x = 1$ the outward normal is $\hat\imath$ and $\vec F\cdot\hat\imath = xy = y$, giving $\int_0^1\!\int_0^1 y\,dy\,dz = \tfrac12$. On the opposite face $x = 0$, $\vec F\cdot(-\hat\imath) = -xy = 0$. By symmetry the other two pairs do the same: $3\times\tfrac12 = \tfrac32$ ✓.` },
    ],
    answer: t`$\oiint\vec F\cdot d\vec S = \tfrac32$`,
  },
  practice: [
    num({
      id: 'ball', difficulty: 1,
      gen(r) {
        const [a, b, c] = r.pick([[2, 3, 1], [1, 1, 4], [3, 2, 2]]), R = r.pick([1, 2]);
        const val = (a + b + c) * (4 / 3) * PI * R ** 3;
        return {
          prompt: t`Find the outward flux of $\vec F = \langle ${a === 1 ? '' : a}x,\ ${b === 1 ? '' : b}y,\ ${c === 1 ? '' : c}z\rangle$ through the sphere of radius ${R} about the origin.`,
          visual: closedPic([`${a}*x`, `${b}*y`, `${c}*z`], sphereSurface(R), { range: 1.4 * R, caption: 'The sphere, tinted by the flux integrand: the field leaves through every part of it. Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: (a + b + c) * 4 * PI * R * R, feedback: 'That multiplies the divergence by the sphere’s area. The theorem integrates it over the volume inside.' }],
          hints: [t`$\nabla\cdot\vec F = ${a} + ${b} + ${c} = ${a + b + c}$, a constant.`, t`So the flux is $${a + b + c}$ times the ball’s volume, $\tfrac43\pi(${R})^3$.`],
          teach: 'With constant divergence, the outward flux is the divergence times the enclosed volume.',
          explain: t`$\oiint\vec F\cdot d\vec S = \iiint ${a + b + c}\,dV = ${a + b + c}\cdot\tfrac43\pi\cdot${R ** 3} = ${nice(4 * (a + b + c) * R ** 3 / 3)}\pi \approx ${nice(+val.toPrecision(4))}$ — no surface integral needed.`,
        };
      },
    }),
    num({
      id: 'can', difficulty: 2,
      gen(r) {
        const [R, h] = r.pick([[1, 2], [2, 1], [1, 3]]);
        const val = h * 2 * PI * ((3 * R ** 4) / 4 + (R * R) / 2);
        return {
          prompt: t`Find the outward flux of $\vec F = \langle x^3,\ y^3,\ z\rangle$ through the closed cylinder $x^2 + y^2 \le ${R * R}$, $0 \le z \le ${h}$ — side, top and bottom together.`,
          visual: closedPic(['x^3', 'y^3', 'z'], closedCylinder(R, [0, h]), { range: 1.3 * Math.max(R, h), caption: 'The closed cylinder tinted by the flux integrand. Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: h * 2 * PI * (R ** 3 + (R * R) / 2), feedback: t`In cylindrical coordinates $dV = r\,dr\,d\phi\,dz$: the extra $r$ turns $\int 3r^2\,dr$ into $\int 3r^3\,dr$.` }],
          hints: [t`$\nabla\cdot\vec F = 3x^2 + 3y^2 + 1 = 3r^2 + 1$.`, t`$\displaystyle\int_0^{${h}}\!\!\int_0^{2\pi}\!\!\int_0^{${R}}(3r^2 + 1)\,r\,dr\,d\phi\,dz$.`],
          teach: 'For a closed surface, integrate the divergence over the solid instead of the flux over three separate pieces.',
          explain: t`$${h}\cdot2\pi\left(\frac{3\cdot${R ** 4}}{4} + \frac{${R * R}}{2}\right) \approx ${nice(+val.toPrecision(4))}$: one triple integral instead of three surface integrals.`,
        };
      },
    }),
    mcq({
      id: 'gauss', difficulty: 2,
      prompt: t`The inverse-square field $\vec F = \hat r/r^2 = \vec r/r^3$ has $\nabla\cdot\vec F = 0$ at every point except the origin, where it is undefined. What is its outward flux through the lumpy closed surface drawn, which encloses the origin?`,
      visual: closedPic(['x/(x^2 + y^2 + z^2)^1.5', 'y/(x^2 + y^2 + z^2)^1.5', 'z/(x^2 + y^2 + z^2)^1.5'], LUMPY, { points: [{ at: [0, 0, 0], color: 'bad', r: 5 }], alpha: 0.7, caption: 'A lumpy closed surface round the origin (red dot), tinted by the flux integrand, and the inverse-square field. Drag to rotate.' }),
      choices: [t`$4\pi$, whatever the shape, as for a sphere round the origin`, t`$0$, because the divergence is $0$`, t`$4\pi$ times the surface’s area`, 'It depends on the shape of the surface'],
      answer: 0,
      why: {
        1: t`The divergence is $0$ only **away from** the origin. The theorem needs $\vec F$ smooth throughout $E$, and here $E$ contains the origin, where all the divergence is concentrated.`,
        2: t`For a sphere of radius $R$ the flux is $\frac{1}{R^2}\cdot4\pi R^2 = 4\pi$: the area grows exactly as fast as the field weakens.`,
        3: t`Between this surface and a small sphere round the origin the divergence is $0$, so the two fluxes are equal: the shape does not matter.`,
      },
      hints: [t`Surround the origin with a tiny sphere inside the lumpy surface. In the region between the two, the field is smooth and $\nabla\cdot\vec F = 0$.`, t`So the flux out of the lumpy surface equals the flux out of the tiny sphere, which is $\frac{1}{\varepsilon^2}\cdot4\pi\varepsilon^2$.`],
      teach: 'Through any closed surface that encloses the origin, r̂/r² has flux 4π; through any that does not, 0 — Gauss’s law.',
      explain: t`Apply the theorem to the region between the lumpy surface and a tiny sphere of radius $\varepsilon$ round the origin, where the field is smooth and divergence-free: the two outward fluxes are equal. The sphere’s is $4\pi$, so the lumpy surface’s is $4\pi$ too. For a charge, $\vec E = \frac{q}{4\pi\varepsilon_0}\frac{\hat r}{r^2}$, so the flux is $q/\varepsilon_0$: Gauss’s law.`,
    }),
    order({
      id: 'continuity', difficulty: 3,
      prompt: t`Put in order the steps that turn conservation of mass into the **continuity equation** $\dfrac{\partial\rho}{\partial t} + \nabla\cdot(\rho\vec v) = 0$, for a fluid of density $\rho$ moving with velocity $\vec v$.`,
      visual: closedPic(['1 + 0.4*x', '0.3*sin(2*z)', '0.2*y'], boxSurface([-0.6, 0.6], [-0.6, 0.6], [-0.6, 0.6], 'Box'), { range: 1.3, caption: t`Any fixed box in a flowing fluid, tinted by the outflow of the mass current $\rho\vec v$ through its faces. Drag to rotate.` }),
      items: [
        t`The mass inside any fixed region $E$ is $m = \iiint_E\rho\,dV$.`,
        t`Mass can change only by flowing through the boundary: $\dfrac{dm}{dt} = -\oiint_{\partial E}\rho\vec v\cdot d\vec S$.`,
        t`By the divergence theorem, $\oiint_{\partial E}\rho\vec v\cdot d\vec S = \iiint_E\nabla\cdot(\rho\vec v)\,dV$.`,
        t`So $\iiint_E\left(\dfrac{\partial\rho}{\partial t} + \nabla\cdot(\rho\vec v)\right)dV = 0$ for every region $E$.`,
        t`Shrink $E$ round any point: the integrand must vanish there, so $\dfrac{\partial\rho}{\partial t} + \nabla\cdot(\rho\vec v) = 0$.`,
      ],
      hints: ['Start from what mass is, then say how it can change.', 'The divergence theorem turns the boundary flux into a volume integral, so everything sits under one integral sign.'],
      teach: 'A conservation law for every region, plus the divergence theorem, gives a local law: ∂ρ/∂t + ∇·(ρv) = 0.',
      explain: t`Mass is lost only through the boundary; the divergence theorem moves that loss inside the volume; an integral that vanishes over every region must have a zero integrand. Electric charge obeys the same equation with $\rho\vec v$ replaced by the current density $\vec J$.`,
    }),
    num({
      id: 'charge-density', difficulty: 2,
      gen(r) {
        const k = r.pick([0.6, 1.2, 2.5]);
        const rho = 3 * k * 1e5 * 8.854e-12;
        return {
          prompt: t`Inside a uniformly charged ball, the electric field is $\vec E = k\,\langle x,\ y,\ z\rangle$ with $k = ${k}\times10^{5}$ V/m² (positions in m). Gauss’s law in differential form — the divergence theorem applied to $\oiint\vec E\cdot d\vec S = Q_\text{enc}/\varepsilon_0$ — is $\nabla\cdot\vec E = \rho/\varepsilon_0$. Find the charge density $\rho$, in μC/m³. ($\varepsilon_0 = 8.854\times10^{-12}$ F/m.)`,
          visual: { type: 'c3-flux', params: { F: ['x*step(1 - x^2 - y^2 - z^2)', 'y*step(1 - x^2 - y^2 - z^2)', 'z*step(1 - x^2 - y^2 - z^2)'], surfaces: [sphereSurface(1, [0, 0, 0], 'Ball')], integrand: 'none', arrowsOn: 'grid', grid: 5, readouts: [], normals: false, alpha: 0.25, flipToggle: false, range: 1.3, arrowLen: 0.35 }, caption: 'The field inside the charged ball (translucent): pointing outward, growing in proportion to the distance from the centre. Arrows to scale with one another. Drag to rotate.' },
          answer: rho * 1e6, units: 'uC/m^3', tol: { rel: 0.005 },
          errors: [{ value: k * 1e5 * 8.854e-12 * 1e6, feedback: t`$\nabla\cdot\langle kx, ky, kz\rangle = k + k + k = 3k$: each of the three components contributes.` }],
          hints: [t`$\nabla\cdot\vec E = 3k$.`, t`$\rho = \varepsilon_0\nabla\cdot\vec E = 3k\varepsilon_0$.`],
          teach: 'Gauss’s law point by point: the charge density is ε₀ times the divergence of E.',
          explain: t`$\rho = 3k\varepsilon_0 = 3(${k}\times10^{5})(8.854\times10^{-12}) \approx ${nice(+(rho * 1e6).toPrecision(3))}$ μC/m³, the same everywhere inside, as a uniform ball should be. Outside the ball $\vec E \propto \hat r/r^2$ and $\nabla\cdot\vec E = 0$: no charge there.`,
        };
      },
    }),
    mcq({
      id: 'error-open', difficulty: 2, kind: 'error',
      prompt: t`A student wants the upward flux of $\vec F = \langle x,\ y,\ z + 1\rangle$ through the upper unit **hemisphere** (no lid) and writes: “By the divergence theorem, it is $\iiint 3\,dV$ over the half-ball, $3\cdot\tfrac23\pi = 2\pi$.” The true flux is $3\pi$. What went wrong?`,
      visual: closedPic(['x', 'y', 'z + 1'], { ...sphereSurface(1, [0, 0, 0], 'Hemisphere', 'pi/2') }, { caption: 'The open hemisphere, tinted by the flux integrand. Its rim is a hole: there is no bottom. Drag to rotate.' }),
      choices: [
        t`The theorem is for closed surfaces: $2\pi$ is the flux out of hemisphere **plus** the bottom disk. The disk’s outward flux is $-\pi$, so the hemisphere carries $2\pi - (-\pi) = 3\pi$`,
        t`The divergence should be $4$, because of the $+1$`,
        t`The half-ball’s volume is $\tfrac43\pi$, not $\tfrac23\pi$`,
        t`Nothing: $2\pi$ is right and the “true” value is wrong`,
      ],
      answer: 0,
      why: {
        1: t`A constant has zero derivative: $\partial_z(z + 1) = 1$, so $\nabla\cdot\vec F = 3$.`,
        2: t`$\tfrac43\pi$ is the whole ball. Half of it is $\tfrac23\pi$.`,
        3: t`Close the surface with the disk at $z = 0$ (outward normal $-\hat k$): there $\vec F\cdot(-\hat k) = -1$, so the disk carries $-\pi$, and the hemisphere must carry $3\pi$.`,
      },
      hints: ['What kind of surface does the divergence theorem need?', t`Close it off with the unit disk at $z = 0$, normal pointing down. What is the flux through that disk?`],
      teach: 'The divergence theorem needs a closed surface: to use it on an open one, add a lid and subtract the lid’s flux.',
      explain: t`For the closed half-ball, $\oiint = 2\pi$. The bottom disk, oriented outward (down), has $\vec F\cdot(-\hat k) = -(0 + 1) = -1$, flux $-\pi$. So the hemisphere’s flux is $2\pi + \pi = 3\pi$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cube', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]);
        return {
          prompt: t`Find the outward flux of $\vec F = \langle x^2,\ y^2,\ z^2\rangle$ through the surface of the cube $0 \le x, y, z \le ${a}$.`,
          visual: closedPic(['x^2', 'y^2', 'z^2'], boxSurface([0, a], [0, a], [0, a], 'Cube'), { range: 1.3 * a, caption: 'The cube tinted by the flux integrand: the field leaves through the far faces and barely touches the near ones. Drag to rotate.' }),
          answer: 3 * a ** 4, tol: { rel: 1e-3 },
          errors: a === 1 ? [] : [{ value: 3 * a ** 3, feedback: t`That treats $\nabla\cdot\vec F$ as $3$, as for $\langle x, y, z\rangle$. Here it is $2x + 2y + 2z$, which must be integrated over the cube.` }],
          hints: [t`$\nabla\cdot\vec F = 2x + 2y + 2z$, and $\iiint_{\text{cube}} 2x\,dV = ${a}^2\cdot${a}^2 = ${a ** 4}$.`],
          teach: 'Outward flux through a closed surface = the triple integral of the divergence inside.',
          explain: t`$\iiint(2x + 2y + 2z)\,dV = 3\cdot2\cdot\frac{${a}^2}{2}\cdot${a}^2 = ${3 * a ** 4}$.`,
        };
      },
    }),
    num({
      id: 'cp-wind', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([5, 6, 7]), v = r.pick([400, 450]);
        const AU = 1.496e11, mp = 1.6726e-27;
        const mdot = 4 * PI * AU * AU * n * 1e6 * mp * v * 1e3;
        return {
          prompt: t`At 1 AU from the Sun ($1.496\times10^{11}$ m), the solar wind carries about ${n} protons per cm³ (proton mass $1.673\times10^{-27}$ kg) flowing straight outward at ${v} km/s. Between the Sun and the Earth the wind is steady and nothing creates or destroys it, so its mass current $\rho\vec v$ has $\nabla\cdot(\rho\vec v) = 0$ there. By the divergence theorem, the flux of $\rho\vec v$ is then the same through **every** closed surface round the Sun — and that flux is the Sun’s mass loss rate. Treating the wind as the same in all directions, find it.`,
          visual: closedPic(['x/(x^2 + y^2 + z^2)^1.5', 'y/(x^2 + y^2 + z^2)^1.5', 'z/(x^2 + y^2 + z^2)^1.5'], sphereSurface(1, [0, 0, 0], '1 AU'), { points: [{ at: [0, 0, 0], color: 'gold', r: 7, label: 'Sun' }], alpha: 0.5, caption: 'A sphere of radius 1 AU round the Sun, tinted by the outward flux of the wind (spreading as 1/r²). Not to scale. Drag to rotate.' }),
          answer: mdot, units: 'kg/s', tol: { rel: 0.01 },
          errors: [{ value: mdot / 1e6, feedback: 'Convert the density: 1 per cm³ is 10⁶ per m³.' }, { value: mdot / 1e3, feedback: 'Convert the speed to m/s.' }],
          hints: [t`Choose the sphere of radius 1 AU: there $\rho\vec v$ is perpendicular to the surface and the same everywhere on it.`, t`$\dot m = 4\pi r^2\,\rho v$ with $\rho = ${n}\times10^{6}\ \text{m}^{-3}\times1.673\times10^{-27}$ kg and $v = ${v}\times10^{3}$ m/s.`],
          teach: 'Where a mass current has zero divergence, its flux through every closed surface round the source is the same.',
          explain: t`$\dot m = 4\pi(1.496\times10^{11})^2(${n}\times10^{6})(1.673\times10^{-27})(${v}\times10^{3}) \approx ${nice(+(mdot / 1e9).toPrecision(3))}\times10^{9}$ kg/s — about a billion kilograms a second, yet only $10^{-14}$ of the Sun’s mass per year. The same zero divergence says the density falls as $1/r^2$: at Mars (1.52 AU) it is $1/1.52^2 \approx 43\%$ of Earth’s. (Simplified: helium adds roughly 15% to the mass, and the real wind is faster and thinner above the Sun’s poles.)`,
        };
      },
    }),
    mcq({
      id: 'cp-delta', difficulty: 3,
      prompt: t`Smear a point source into a small ball of radius $a$: inside it the field is $\vec F = \vec r/a^3$ (so $\nabla\cdot\vec F = 3/a^3$), and outside it is $\hat r/r^2$ as before. As $a \to 0$, what happens to $\iiint\nabla\cdot\vec F\,dV$ over any region containing the ball?`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.1, 1.6], y: [-2, 27], aspect: 'wide', xlabel: 'distance from the centre r', ylabel: 'div F',
          curves: [1, 0.7, 0.5].map((a, k) => ({ fn: `${r6(3 / a ** 3)}*step(${a} - x)`, domain: [0, 1.5], color: ['accent', 'violet', 'gold'][k], width: 2.4, label: `a = ${a}`, labelAt: 0.3 * a, labelDy: -12 })),
        },
        caption: t`The divergence inside balls of radius 1, 0.7 and 0.5: $3/a^3$ inside, $0$ outside. Taller and narrower as $a$ shrinks; the volume each encloses, $\tfrac43\pi a^3$, shrinks just as fast.`,
      },
      choices: [t`It stays $4\pi$: the divergence becomes an ever taller, narrower spike with the same integral — written $4\pi\,\delta^3(\vec r)$`, t`It tends to $0$, because the ball shrinks away`, t`It tends to infinity, because $3/a^3 \to \infty$`, t`It was $0$ all along, because $\nabla\cdot(\hat r/r^2) = 0$`],
      answer: 0,
      why: {
        1: t`The ball’s volume shrinks as $a^3$, but the divergence inside grows as $1/a^3$: the product stays $\tfrac{3}{a^3}\cdot\tfrac43\pi a^3 = 4\pi$.`,
        2: 'The height grows without bound, but the width shrinks to match: the integral, not the height, is what stays fixed.',
        3: t`Only away from the origin. The flux through any surface round the source is $4\pi$, so the divergence theorem demands $4\pi$ of divergence inside, concentrated at the point.`,
      },
      hints: [t`Compute $\iiint\nabla\cdot\vec F\,dV$ for one value of $a$: it is $(3/a^3)$ times the ball’s volume.`, 'Does your answer depend on a?'],
      teach: 'The divergence of a point source is a delta function: zero everywhere but one point, with a finite total — ∇·(r̂/r²) = 4πδ³(r).',
      explain: t`For every $a$, $\iiint\nabla\cdot\vec F\,dV = \tfrac{3}{a^3}\cdot\tfrac43\pi a^3 = 4\pi$. In the limit the divergence is zero everywhere except the origin and still integrates to $4\pi$. No ordinary function does that: $\delta^3(\vec r)$ is shorthand for this limit — a recipe for “all of it at one point” — and $\nabla\cdot(\hat r/r^2) = 4\pi\delta^3(\vec r)$ is the precise form of Gauss’s law for a point charge, $\nabla\cdot\vec E = q\,\delta^3(\vec r)/\varepsilon_0$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.8 The divergence theorem', url: 'https://openstax.org/books/calculus-volume-3/pages/6-8-the-divergence-theorem' },
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.5 (the Dirac delta function)', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NASA Space Physics Data Facility, OMNIWeb (solar wind at 1 AU)', url: 'https://omniweb.gsfc.nasa.gov/' },
  ],
});
