// Surface integrals and flux: ∬ F · dS = ∬ F(r(u, v)) · (r_u × r_v) du dv
// through an oriented surface; orientation and its sign; scalar surface
// integrals ∬ f dS (the mass of a shell); one-sided surfaces.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { pickExpr } from './_space.js';
import { co } from './_fields.js';

const t = String.raw;
const PI = Math.PI;

/** A picture on c3-flux: a field through one surface, no numbers, no flip toggle. */
const fluxPic = (F, surface, { caption, ...rest } = {}) => ({
  type: 'c3-flux',
  params: { F, surfaces: [surface], readouts: [], flipToggle: false, ...rest },
  caption,
});
const HEMI = { label: 'Hemisphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'] };
const SPHERE = { label: 'Sphere', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi'], v: [0, '2*pi'] };

export default lesson({
  id: 'math2210.C3-5.7',
  title: 'Surface integrals and flux',
  minutes: 13, difficulty: 3,
  intro: t`The **flux** of a vector field through a surface measures how much of it passes through — the volume of water per second crossing a net, or the electric flux of Gauss’s law. Each small patch contributes $\vec F\cdot\hat n\,dS$: only the component of the field **across** the surface counts. That needs a choice of **orientation** — which side’s normal $\hat n$ counts as “through”. With a parametrization, $\hat n\,dS = (\vec r_u\times\vec r_v)\,du\,dv$, so

$$\iint_S \vec F\cdot d\vec S = \iint_D \vec F\big(\vec r(u, v)\big)\cdot(\vec r_u\times\vec r_v)\,du\,dv$$

If $\vec r_u\times\vec r_v$ points to the wrong side, flip its sign. A **scalar** surface integral $\iint_S f\,dS = \iint_D f\,|\vec r_u\times\vec r_v|\,du\,dv$ simply adds up an amount per unit area — the mass of a shell, the charge on a plate.`,
  symbols: [
    { tex: 'S', text: 'an **oriented** surface: a surface with a chosen side, the one its normals point to' },
    { tex: '\\hat n', text: 'the unit normal on the chosen side; for a closed surface, by convention, pointing **out**' },
    { tex: 'd\\vec S = \\hat n\\,dS', text: 'the vector area of a small patch: its area $dS$, pointing along $\\hat n$' },
    { tex: '\\vec F\\cdot d\\vec S', text: 'the flux through one patch: positive where $\\vec F$ crosses toward the chosen side, negative where it crosses the other way, zero where it skims along' },
    { tex: '\\vec r_u\\times\\vec r_v', text: 'the normal from the parametrization, already scaled by the area factor — use it, or its negative, as $d\\vec S/(du\\,dv)$' },
  ],
  why: t`Gauss’s law, the mass flowing out of a rocket nozzle, the sunlight a solar panel collects and the radiation a planet intercepts are all flux integrals; the divergence theorem (two lessons on) turns closed-surface flux into a volume integral.`,
  visual: {
    type: 'c3-flux',
    title: 'What gets through',
    lead: t`A field (gold arrows) and a surface tinted by the flux integrand $\vec F\cdot\hat n$: blue where the field crosses toward the side the white normals point to, red where it crosses the other way, grey where it only skims along. The readout is the total flux. Tilt the disk, change field and surface, and flip the orientation.`,
    tasks: [
      t`Uniform upward field through the disk: tilt it, and the flux falls as $\cos(\text{tilt})$ — to zero edge-on, where the field skims along the disk.`,
      'Radial field through the hemisphere: flip the orientation, and the flux changes sign. Orientation is part of the question.',
      'Swirl through any of the round surfaces: the flux is zero — the field circles round the axis and never crosses them.',
    ],
    params: {
      F: [pickExpr('k', ['0', 'x', '-y', '0']), pickExpr('k', ['0', 'y', 'x', '1']), pickExpr('k', ['1', 'z', '0', '0'])],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'Uniform up'], [1, 'Radial'], [2, 'Swirl'], [3, 'Sideways']], value: 0, explain: t`Uniform $\langle 0, 0, 1\rangle$; radial $\langle x, y, z\rangle$; swirl $\langle -y, x, 0\rangle$; sideways $\langle 0, 1, 0\rangle$.` }],
      sliders: [{ key: 'tilt', label: 'Disk tilt', min: 0, max: 90, step: 1, value: 35, unit: '^\\circ', explain: 'How far the disk is turned from horizontal, about the x-axis.' }],
      surfaces: [
        { label: 'Disk', x: 'u*cos(v)', y: 'u*sin(v)*cos(tilt*pi/180)', z: 'u*sin(v)*sin(tilt*pi/180)', u: [0, 1], v: [0, '2*pi'] },
        HEMI,
        { label: 'Bowl cap', x: 'u*cos(v)', y: 'u*sin(v)', z: '1 - u^2', u: [0, 1], v: [0, '2*pi'] },
        { label: 'Cylinder', x: 'cos(u)', y: 'sin(u)', z: 'v', u: [0, '2*pi'], v: [-0.8, 0.8] },
      ],
      surfaceExplain: t`Each with its normal $\vec r_u\times\vec r_v$: the disk’s points up (at zero tilt), the hemisphere’s, bowl’s and cylinder’s point away from the axis or up.`,
      readouts: ['flux', 'area'], range: 1.3,
    },
    caption: t`Drag to rotate. Gold arrows show the field, lengths compressed; white arrows the chosen normals. The tint is $\vec F\cdot\hat n$ (blue along the normal, red against it). The flux is computed numerically.`,
  },
  example: {
    prompt: t`Find the flux of $\vec F = \langle x,\ y,\ z\rangle$ upward through the paraboloid cap $z = 4 - x^2 - y^2$, $z \ge 0$.`,
    visual: fluxPic(['x', 'y', 'z'], { label: 'Cap', x: 'u*cos(v)', y: 'u*sin(v)', z: '4 - u^2', u: [0, 2], v: [0, '2*pi'] }, { readouts: ['flux'], range: 2.6, n: 18, caption: 'The cap, tinted by the flux integrand, with the field (gold) and upward normals (white). The readout is the flux, computed numerically. Drag to rotate.' }),
    steps: [
      { label: 'Parametrize', text: t`$\vec r(\rho, \phi) = \langle\rho\cos\phi,\ \rho\sin\phi,\ 4 - \rho^2\rangle$, $0 \le \rho \le 2$, $0 \le \phi \le 2\pi$ (the cap meets $z = 0$ at $\rho = 2$).` },
      { label: 'Normal', text: t`$\vec r_\rho = \langle\cos\phi,\ \sin\phi,\ -2\rho\rangle$, $\vec r_\phi = \langle -\rho\sin\phi,\ \rho\cos\phi,\ 0\rangle$, so $\vec r_\rho\times\vec r_\phi = \langle 2\rho^2\cos\phi,\ 2\rho^2\sin\phi,\ \rho\rangle$.` },
      { label: 'Orientation', text: t`Its $z$-component $\rho$ is positive: it points **up**, the side we want. (Had it pointed down, we would use its negative.)` },
      { label: 'Field on the surface', text: t`$\vec F(\vec r) = \langle\rho\cos\phi,\ \rho\sin\phi,\ 4 - \rho^2\rangle$, so $\vec F\cdot(\vec r_\rho\times\vec r_\phi) = 2\rho^3 + \rho(4 - \rho^2) = \rho^3 + 4\rho$.` },
      { label: 'Integrate', text: t`$\displaystyle\int_0^{2\pi}\!\!\int_0^2 (\rho^3 + 4\rho)\,d\rho\,d\phi = 2\pi(4 + 8) = 24\pi \approx 75.4$.` },
      { label: 'Sense check', text: t`Positive, as it should be: the radial field points outward and upward through every patch of the cap. The divergence theorem (two lessons on) gets $24\pi$ again with no surface integral at all.` },
    ],
    answer: t`$\iint_S\vec F\cdot d\vec S = 24\pi \approx 75.4$`,
  },
  practice: [
    mcq({
      id: 'flip', difficulty: 1,
      prompt: t`You parametrize the unit sphere and find that your $\vec r_u\times\vec r_v$ points **into** the sphere. You want the **outward** flux of a field $\vec F$. What should you do?`,
      visual: fluxPic(['x', 'y', 'z'], SPHERE, { flip: true, arrows: false, tint: false, integrand: 'none', normalGrid: [4, 5], caption: 'A sphere with the normals of an inward-pointing parametrization (white). Drag to rotate.' }),
      choices: [t`Use $-(\vec r_u\times\vec r_v)$ instead — the same integral with its sign changed`, 'Nothing: flux does not depend on which way the normal points', 'Take the absolute value of the integrand at every point', t`Normalize $\vec r_u\times\vec r_v$ to a unit vector`],
      answer: 0,
      why: {
        1: 'Flux counts what crosses toward the chosen side: reversing the side reverses every contribution.',
        2: 'That would count inflow as outflow: a field flowing in through one part and out through another would not cancel.',
        3: t`Normalizing changes the length, not the direction — and $d\vec S$ needs the length $|\vec r_u\times\vec r_v|$ anyway.`,
      },
      hints: ['What happens to each patch’s F · n dS when n is reversed?'],
      teach: 'Orientation is part of a flux integral: reversing the normal reverses the sign of the flux.',
      explain: t`Reversing the normal reverses every $\vec F\cdot d\vec S$, so the outward flux is minus the integral computed with your inward normal. (Swapping the order of $u$ and $v$ does the same.)`,
    }),
    num({
      id: 'square', difficulty: 2,
      gen(r) {
        const [a, b, L] = r.pick([[3, 2, 1], [1, 4, 2], [2, 1, 1.5], [3, 1, 2]]);
        const val = (a * L ** 4) / 3 + (b * L ** 3) / 2;
        return {
          prompt: t`Find the upward flux of $\vec F = \langle 0,\ 0,\ ${co(a, 'x^2')} + ${co(b, 'y')}\rangle$ through the square $0 \le x \le ${L}$, $0 \le y \le ${L}$ in the plane $z = 0$.`,
          visual: fluxPic(['0', '0', `${a}*x^2 + ${b}*y`], { label: 'Square', x: 'u', y: 'v', z: '0', u: [0, L], v: [0, L] }, { range: L * 1.3, n: 14, arrowGrid: [4, 4], normalGrid: [2, 2], caption: 'The square, tinted by the flux integrand (deeper blue where more crosses), with the field (gold) and the upward normals (white). Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          hints: [t`With $\vec r(x, y) = \langle x, y, 0\rangle$, $\vec r_x\times\vec r_y = \langle 0, 0, 1\rangle$ — upward already.`, t`So the flux is $\displaystyle\int_0^{${L}}\!\!\int_0^{${L}} (${co(a, 'x^2')} + ${co(b, 'y')})\,dy\,dx$.`],
          teach: 'For a flat horizontal surface with upward normal, the flux is just the double integral of the field’s z-component.',
          explain: t`$\displaystyle\iint (${co(a, 'x^2')} + ${co(b, 'y')})\,dA = ${co(a, '')}\frac{${L}^4}{3} + ${co(b, '')}\frac{${L}^3}{2} = ${nice(+val.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'z-sphere', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]);
        const val = (4 * PI * R ** 3) / 3;
        return {
          prompt: t`Find the outward flux of $\vec F = \langle 0,\ 0,\ z\rangle$ through the sphere of radius ${R} about the origin. Use $\vec r(\theta, \phi) = ${R}\langle\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta\rangle$, for which $\vec r_\theta\times\vec r_\phi = ${R * R}\sin\theta\,\langle\sin\theta\cos\phi,\ \sin\theta\sin\phi,\ \cos\theta\rangle$ points outward.`,
          visual: fluxPic(['0', '0', 'z'], { label: 'Sphere', x: `${R}*sin(u)*cos(v)`, y: `${R}*sin(u)*sin(v)`, z: `${R}*cos(u)`, u: [0, 'pi'], v: [0, '2*pi'] }, { range: R * 1.3, caption: 'The sphere, tinted by the flux integrand: the field points up in the top half and down in the bottom half, so it leaves through both. Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: 0, feedback: t`The two halves do not cancel: in the bottom half $z < 0$ and the outward normal points down too, so $F_z n_z > 0$ there as well.` }],
          hints: [t`$\vec F\cdot(\vec r_\theta\times\vec r_\phi) = (${R}\cos\theta)(${R * R}\sin\theta\cos\theta) = ${R ** 3}\cos^2\theta\sin\theta$.`, t`$\int_0^\pi\cos^2\theta\sin\theta\,d\theta = \tfrac23$, and $\phi$ contributes $2\pi$.`],
          teach: t`On a sphere use the outward $\vec r_\theta\times\vec r_\phi = R^2\sin\theta\,\hat r$, put the field in, and integrate over $\theta$ and $\phi$.`,
          explain: t`$\displaystyle\int_0^{2\pi}\!\!\int_0^\pi ${R ** 3}\cos^2\theta\sin\theta\,d\theta\,d\phi = ${R ** 3}\cdot\tfrac23\cdot2\pi = \tfrac{${4 * R ** 3}}{3}\pi \approx ${nice(+val.toPrecision(4))}$ — exactly the ball’s volume, because $\nabla\cdot\vec F = 1$ (the divergence theorem, two lessons on).`,
        };
      },
    }),
    num({
      id: 'radome', difficulty: 2,
      gen(r) {
        const [s0, R] = r.pick([[4, 2.5], [6, 2], [3, 3]]);
        const m = 3 * PI * s0 * R * R;
        return {
          prompt: t`A hemispherical radome of radius ${R} m is thicker near its base: its mass per unit area is $\sigma = ${s0}\,(2 - z/${R})$ kg/m², where $z$ is the height above the base. Find its mass, $m = \iint_S \sigma\,dS$.`,
          visual: { type: 'c3-flux', params: { F: null, surfaces: [{ label: 'Radome', x: `${R}*sin(u)*cos(v)`, y: `${R}*sin(u)*sin(v)`, z: `${R}*cos(u)`, u: [0, 'pi/2'], v: [0, '2*pi'] }], integrand: 'none', normals: false, arrows: false, readouts: [], flipToggle: false, range: R * 1.3 }, caption: 'The radome, a hemispherical shell. Drag to rotate.' },
          answer: m, units: 'kg', tol: { rel: 2e-3 },
          errors: [{ value: 2 * PI * R * R * s0, feedback: t`That uses $\sigma = ${s0}$ everywhere. The density varies: $\sigma = ${s0}(2 - \cos\theta)$ on the shell.` }],
          hints: [t`On the shell $z = ${R}\cos\theta$, so $\sigma = ${s0}(2 - \cos\theta)$, and $dS = ${R}^2\sin\theta\,d\theta\,d\phi$ with $0 \le \theta \le \pi/2$.`, t`$\int_0^{\pi/2}(2 - \cos\theta)\sin\theta\,d\theta = 2 - \tfrac12 = \tfrac32$.`],
          teach: 'A scalar surface integral weights each patch’s area dS by an amount per area: here, kilograms per square metre.',
          explain: t`$m = \displaystyle\int_0^{2\pi}\!\!\int_0^{\pi/2} ${s0}(2 - \cos\theta)\,${R * R}\sin\theta\,d\theta\,d\phi = ${s0}\cdot${R * R}\cdot\tfrac32\cdot2\pi = ${nice(3 * s0 * R * R)}\pi \approx ${nice(+m.toPrecision(4))}$ kg. No orientation is involved: a mass does not depend on which side you call out.`,
        };
      },
    }),
    mcq({
      id: 'swirl', difficulty: 2,
      prompt: t`What is the upward flux of the swirl $\vec F = \langle -y,\ x,\ 0\rangle$ through the upper half of the unit sphere?`,
      visual: fluxPic(['-y', 'x', '0'], HEMI, { caption: 'The swirl field (gold) on the hemisphere, which is tinted by the flux integrand — grey everywhere. Drag to rotate.' }),
      choices: ['0: the field is tangent to the sphere everywhere, so nothing crosses it', t`$2\pi$`, t`$\pi$`, 'It depends on which way the normal points'],
      answer: 0,
      why: {
        1: t`$2\pi$ is the swirl’s **circulation** round the unit circle at the rim — a line integral, not a flux.`,
        2: t`Nothing crosses at any point: $\vec F\cdot\hat n = 0$ everywhere, so the flux is $0$, not $\pi$.`,
        3: t`Flipping the normal flips the sign of the flux, and $-0 = 0$.`,
      },
      hints: [t`On the unit sphere $\hat n = \langle x, y, z\rangle$. Compute $\vec F\cdot\hat n$.`],
      teach: 'Where a field is tangent to a surface, F · n = 0 and it contributes no flux.',
      explain: t`$\vec F\cdot\hat n = -yx + xy + 0 = 0$ at every point: the swirl circles round the $z$-axis along the sphere and never crosses it. Flux and circulation measure different things.`,
    }),
    mcq({
      id: 'error-dS', difficulty: 2, kind: 'error',
      prompt: t`To find the outward flux of $\vec F = \langle x, y, z\rangle$ through the unit sphere, a student uses the unit normal $\hat n = \langle x, y, z\rangle$, gets $\vec F\cdot\hat n = x^2 + y^2 + z^2 = 1$, and writes
$$\iint_S\vec F\cdot\hat n\,dS = \int_0^{2\pi}\!\!\int_0^\pi 1\,d\theta\,d\phi = 2\pi^2.$$
The right answer is $4\pi$. What went wrong?`,
      visual: fluxPic(['x', 'y', 'z'], SPHERE, { caption: 'The radial field leaving the unit sphere: the same flux integrand, 1, at every point. Drag to rotate.' }),
      choices: [
        t`$dS$ is not $d\theta\,d\phi$: it is $|\vec r_\theta\times\vec r_\phi|\,d\theta\,d\phi = \sin\theta\,d\theta\,d\phi$, which gives $4\pi$`,
        t`$\hat n$ should be $\vec r_\theta\times\vec r_\phi$ without normalizing`,
        t`$\vec F\cdot\hat n$ should be $x + y + z$`,
        t`The $\theta$ limits should be $0$ to $2\pi$`,
      ],
      answer: 0,
      why: {
        1: t`Using the unit normal is fine — but then the area element must be $dS = |\vec r_\theta\times\vec r_\phi|\,d\theta\,d\phi$. The two ways agree: $\hat n\,dS = (\vec r_\theta\times\vec r_\phi)\,d\theta\,d\phi$.`,
        2: t`A dot product multiplies matching components and adds: $x\cdot x + y\cdot y + z\cdot z$.`,
        3: t`$\theta$ from $0$ to $\pi$ already runs pole to pole; $0$ to $2\pi$ would cover the sphere twice.`,
      },
      hints: [t`Is a small rectangle $d\theta\,d\phi$ near a pole the same area on the sphere as one at the equator?`],
      teach: t`With the unit normal, flux is $\iint\vec F\cdot\hat n\,dS$, and $dS = |\vec r_u\times\vec r_v|\,du\,dv$ — not $du\,dv$.`,
      explain: t`The integrand is $1$ per unit **area**, so the flux is the sphere’s area: $\int_0^{2\pi}\!\int_0^\pi\sin\theta\,d\theta\,d\phi = 4\pi$. The student integrated over the parameter rectangle, whose area $2\pi^2$ is not the sphere’s.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cap', difficulty: 2,
      gen(r) {
        const h = r.pick([1, 2, 4]);
        const val = (PI * h * h) / 2;
        return {
          prompt: t`Find the upward flux of $\vec F = \langle 0,\ 0,\ z\rangle$ through the cap $z = ${h} - x^2 - y^2$, $z \ge 0$. (With $\vec r = \langle\rho\cos\phi,\ \rho\sin\phi,\ ${h} - \rho^2\rangle$, $\vec r_\rho\times\vec r_\phi = \langle 2\rho^2\cos\phi,\ 2\rho^2\sin\phi,\ \rho\rangle$.)`,
          visual: fluxPic(['0', '0', 'z'], { label: 'Cap', x: 'u*cos(v)', y: 'u*sin(v)', z: `${h} - u^2`, u: [0, Math.sqrt(h)], v: [0, '2*pi'] }, { range: Math.max(1.4, h * 0.7), n: 16, caption: 'The cap, tinted by the flux integrand, with the field and the upward normals. Drag to rotate.' }),
          answer: val, tol: { rel: 1e-3 },
          errors: [{ value: PI * h * h, feedback: t`Check the integral $\int_0^{\sqrt{${h}}}(${h}\rho - \rho^3)\,d\rho = \tfrac{${h * h}}{2} - \tfrac{${h * h}}{4}$.` }],
          hints: [t`$\vec F\cdot(\vec r_\rho\times\vec r_\phi) = z\rho = (${h} - \rho^2)\rho$.`],
          teach: 'Flux: parametrize, check the normal’s direction, dot with the field, integrate.',
          explain: t`$\displaystyle\int_0^{2\pi}\!\!\int_0^{\sqrt{${h}}}(${h}\rho - \rho^3)\,d\rho\,d\phi = 2\pi\left(\frac{${h * h}}{2} - \frac{${h * h}}{4}\right) = \frac{${h * h}\pi}{2} \approx ${nice(+val.toPrecision(4))}$.`,
        };
      },
    }),
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const [rho, v0, R] = r.pick([[0.08, 3000, 0.5], [0.1, 2700, 0.46], [0.05, 3300, 0.9]]);
        const mdot = 0.9 * rho * v0 * PI * R * R;
        return {
          prompt: t`At the exit plane of a rocket nozzle — a disk of radius $R = ${R}$ m — the exhaust has density $\rho = ${rho}$ kg/m³ and flows straight out with a speed that falls toward the rim, $v(r) = ${v0}\,(1 - 0.2\,r^2/R^2)$ m/s, where $r$ is the distance from the axis. The mass flow rate is the flux of $\rho\vec v$ through the exit: $\dot m = \iint_S \rho\,\vec v\cdot d\vec S$. Find $\dot m$.`,
          visual: fluxPic(['0', '0', '1 - 0.2*(x^2 + y^2)'], { label: 'Exit plane', x: 'u*cos(v)', y: 'u*sin(v)', z: '0', u: [0, 1], v: [0, '2*pi'] }, { range: 1.3, n: 14, arrowGrid: [3, 8], normalGrid: [1, 1], pitch: 0.25, caption: 'The nozzle’s exit plane (scaled to radius 1) and the exhaust velocity across it, tinted by the flux integrand: strongest on the axis. Drag to rotate.' }),
          answer: mdot, units: 'kg/s', tol: { rel: 0.005 },
          errors: [{ value: rho * v0 * PI * R * R, feedback: 'That assumes the full speed all the way to the rim. The speed falls toward the edge: integrate the profile over the disk.' }, { value: 0.8 * rho * v0 * PI * R * R, feedback: t`The rim value $1 - 0.2 = 0.8$ is not the average: weight by area, $\int_0^R (1 - 0.2r^2/R^2)\,2\pi r\,dr$.` }],
          hints: [t`In polar coordinates on the disk, $d\vec S = \hat k\,r\,dr\,d\phi$ and $\rho\vec v\cdot\hat k = ${rho}\cdot${v0}(1 - 0.2r^2/R^2)$.`, t`$\displaystyle\int_0^{2\pi}\!\!\int_0^R \left(1 - 0.2\frac{r^2}{R^2}\right)r\,dr\,d\phi = 2\pi\left(\frac{R^2}{2} - 0.05R^2\right) = 0.9\,\pi R^2$.`],
          teach: 'A mass flow rate is the flux of the mass current ρv through a surface: kilograms per second crossing it.',
          explain: t`$\dot m = ${rho}\cdot${v0}\cdot0.9\,\pi(${R})^2 \approx ${nice(+mdot.toPrecision(4))}$ kg/s. The momentum it carries off, $\iint\rho v^2\,dS$, is most of the engine’s thrust — the same kind of integral, weighted by speed once more.`,
        };
      },
    }),
    mcq({
      id: 'cp-mobius', difficulty: 2,
      prompt: t`Why can no flux be defined through a Möbius strip?`,
      visual: { type: 'c3-flux', params: { F: null, surfaces: [{ label: 'Möbius strip', x: '(1 + (v/2)*cos(u/2))*cos(u)', y: '(1 + (v/2)*cos(u/2))*sin(u)', z: '(v/2)*sin(u/2)', u: [0, '2*pi'], v: [-0.5, 0.5] }], integrand: 'none', arrows: false, normalGrid: [9, 1], readouts: [], flipToggle: false, n: 24, range: 1.3, pitch: 0.7 }, caption: t`A Möbius strip with the normal $\vec r_u\times\vec r_v$ at nine points along its middle. Follow them round: they come back pointing the opposite way. Drag to rotate.` },
      choices: [
        'It has only one side: carry a normal once round the strip and it returns pointing the other way, so no consistent “through” exists',
        t`Its $\vec r_u\times\vec r_v$ is zero at some point`,
        'It is not a closed surface',
        'It has an edge, and surfaces with edges have no flux',
      ],
      answer: 0,
      why: {
        1: t`The cross product is never zero on this strip; the trouble is its **direction** after a full trip round.`,
        2: 'Most surfaces we take flux through are not closed: a disk, a hemisphere, a nozzle exit.',
        3: 'A disk has an edge too, and its flux is perfectly well defined.',
      },
      hints: ['Follow the white normals along the strip, once round.'],
      teach: 'Flux needs an orientable surface — one with two sides; a Möbius strip has only one.',
      explain: 'Going once round, the normal turns into its own negative: the strip has one side. With no consistent choice of “through”, a flux integral has no meaning — every surface in this course is orientable.',
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §6.6 Surface integrals', url: 'https://openstax.org/books/calculus-volume-3/pages/6-6-surface-integrals' },
    { label: 'Sutton & Biblarz, Rocket Propulsion Elements (9th ed.), ch. 3', url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements%2C+9th+Edition-p-9781118753910' },
  ],
});
