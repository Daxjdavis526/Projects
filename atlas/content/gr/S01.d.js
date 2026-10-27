// Newtonian gravity as a field theory — Derivation Mode. Gauss's law for
// gravity, made local by the divergence theorem, gives Poisson's equation
// ∇²Φ = 4πGρ; its second derivatives are the tides (the preview of the
// Riemann tensor); and it has no time derivative, so it acts instantly.
// Sums are written out: the summation convention arrives in step 3.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, GM_EARTH, R_EARTH, GM_MOON, D_MOON, GM_SUN, AU, sci, round, matrix } from './_deriv.js';

const t = String.raw;

const G_SURF = GM_EARTH / R_EARTH ** 2;                       // ≈ 9.82 m/s²
const TUNNEL = 2 * Math.PI * Math.sqrt(R_EARTH ** 3 / GM_EARTH);   // s, ≈ 84.3 min
const R_GOCE = R_EARTH + 255e3;
const GRAD_GOCE = (2 * GM_EARTH) / R_GOCE ** 3;               // s⁻², ≈ 2.74e-6

// ── pictures ────────────────────────────────────────────────────────────────
// Φ(r) for a uniform ball, in units of GM/R, against r/R
const ballPotential = (caption) => ({
  type: 'graph',
  params: {
    x: [0, 4], y: [-1.75, 0.35], xlabel: 'r / R', ylabel: 'Φ / (GM/R)',
    curves: [
      { fn: '-(3 - x^2)/2', domain: [0, 1], color: 'accent', label: 'inside: a parabola in r', labelAt: 0.12, labelDy: 16 },
      { fn: '-1/x', domain: [1, 4], color: 'gold', label: 'outside: −GM/r', labelAt: 2.3, labelDy: 16 },
    ],
    vlines: [{ x: 1, label: 'surface' }],
  },
  caption: caption ?? t`A graph of $\Phi(r)$ for a ball of uniform density — not a picture of space. Radius in units of the ball’s radius $R$, potential in units of $GM/R$.`,
});

// Φ along a line through a point mass, with the field drawn downhill
const pointPotential = {
  type: 'graph',
  params: {
    x: [-4, 4], y: [-3.3, 0.7], xlabel: 'x  (y = z = 0)', ylabel: 'Φ  (units with GM = 1)',
    curves: [{ fn: '-1/abs(x)', domain: [-4, -0.31], color: 'accent' }, { fn: '-1/abs(x)', domain: [0.31, 4], color: 'accent' }],
    arrows: [{ from: [2.6, -0.9], to: [1.6, -0.9], color: 'gold', label: 'g', labelDy: -10 }, { from: [-2.6, -0.9], to: [-1.6, -0.9], color: 'gold', label: 'g', labelDx: -18, labelDy: -10 }],
    points: [{ x: 0, y: 0, r: 4, color: 'ink', label: 'M at the origin', labelDx: 8, labelDy: 12 }],
  },
  caption: t`A graph of $\Phi = -GM/r$ along the $x$ axis through a point mass — not a picture of space. The field $\vec g = -\nabla\Phi$ (gold) points downhill, toward the mass.`,
};

// two Gauss spheres around one point mass, with the field drawn to scale
function gaussPicture(caption) {
  const arrows = [], curves = [];
  for (const [R, L, off, color] of [[1, 0.6, 0, 'accent'], [2, 0.15, Math.PI / 8, 'violet']]) {
    curves.push({ param: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 6.2832], color, width: 1.8, dash: true });
    for (let k = 0; k < 8; k++) {
      const a = off + (k * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a);
      arrows.push({ from: [round(R * c), round(R * s)], to: [round((R - L) * c), round((R - L) * s)], color: 'gold' });
    }
  }
  return {
    type: 'graph',
    params: {
      x: [-3.5, 3.5], y: [-2.3, 2.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows,
      points: [{ x: 0, y: 0, color: 'ink', r: 5, label: 'M' }, { x: 0.72, y: 0.72, r: 0.01, color: 'accent', label: 'r', labelDx: 4, labelDy: -2 }, { x: 1.45, y: 1.45, r: 0.01, color: 'violet', label: '2r', labelDx: 4, labelDy: -2 }],
    },
    caption: caption ?? t`Two spheres around a point mass, field arrows to scale. At twice the distance the field is a quarter as strong, but the sphere has four times the area: the flux $\oint\vec g\cdot d\vec A$ is $-4\pi GM$ through both.`,
  };
}

// a Gauss sphere inside a uniform Earth
const insidePicture = (f) => ({
  type: 'graph',
  params: {
    x: [-2.3, 2.3], y: [-1.3, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: `sqrt(${round(f * f)} - x^2)`, lower: `-sqrt(${round(f * f)} - x^2)`, from: round(-f * 0.999), to: round(f * 0.999), color: 'gold', alpha: 0.25 }],
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 },
      { param: [`${f}*cos(t)`, `${f}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2, dash: true },
    ],
    points: [{ x: 0, y: 0, color: 'ink', r: 3 }, { x: f, y: 0, color: 'gold', label: `r = ${f}R` }, { x: 0.78, y: 0.78, r: 0.01, color: 'teal', label: 'surface', labelDx: 6, labelDy: -4 }],
  },
  caption: t`A Gauss sphere (dashed) through the point at $r = ${f}R$. Only the shaded mass inside it pulls; the shell outside gives zero net flux.`,
});

// a cube around Earth with the Moon outside (half-side = 100 000 km = 1 unit)
const cubePicture = {
  type: 'graph',
  params: {
    x: [-1.7, 4.4], y: [-1.9, 1.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-1 + 2t', '-1'], t: [0, 1], color: 'violet', width: 2.2 }, { param: ['-1 + 2t', '1'], t: [0, 1], color: 'violet', width: 2.2 },
      { param: ['-1', '-1 + 2t'], t: [0, 1], color: 'violet', width: 2.2 }, { param: ['1', '-1 + 2t'], t: [0, 1], color: 'violet', width: 2.2 },
      { param: ['0.12*cos(t)', '0.12*sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 },
      { param: ['3.844 + 0.06*cos(t)', '0.06*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 },
    ],
    arrows: [[1.35, 0, 1.05, 0], [-1.35, 0, -1.05, 0], [0, 1.35, 0, 1.05], [0, -1.35, 0, -1.05]].map(([a, b, c, d]) => ({ from: [a, b], to: [c, d], color: 'gold' })),
    points: [{ x: 0, y: 0.12, r: 0.01, color: 'teal', label: 'Earth', labelDx: -14, labelDy: -12 }, { x: 3.844, y: 0.06, r: 0.01, color: 'ink2', label: 'Moon', labelDx: -14, labelDy: -12 }, { x: -1, y: -1, r: 0.01, color: 'violet', label: 'cube, 200 000 km across', labelDx: 8, labelDy: -10 }],
  },
  caption: 'Seen edge-on: the cube around Earth, with the Moon outside it. Distances to scale; Earth and the Moon are drawn larger than scale. Gold: the field pointing into the cube’s faces.',
};

// a pulse in Φ travelling outward at c, as a wave equation would send it
const wavePicture = {
  type: 'graph',
  params: {
    x: [0, 4.3], y: [-0.15, 1.35], xlabel: 'distance from the source (light-seconds)', ylabel: 'change in Φ',
    curves: [1, 2, 3].map((k) => ({ fn: `exp(-10(x - ${k})^2)`, color: ['accent', 'violet', 'gold'][k - 1], label: `t = ${k} s`, labelAt: k, labelDx: -16, labelDy: -14 })),
  },
  caption: t`A disturbance obeying a wave equation, drawn at three moments: it moves out at one light-second per second. Under Poisson’s equation the whole profile of $\Phi$ would change at once, at every distance.`,
};

// relative accelerations of test masses around a point in orbit: stretch along the vertical, squeeze across
function tidalRing(caption) {
  const arrows = [], points = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4, x = Math.cos(a), y = Math.sin(a);
    points.push({ x: round(x), y: round(y), color: 'accent', r: 4.5 });
    const ax = -0.42 * x, ay = 0.84 * y;
    if (Math.hypot(ax, ay) > 1e-6) arrows.push({ from: [round(x), round(y)], to: [round(x + ax), round(y + ay)], color: 'gold' });
  }
  return {
    type: 'graph',
    params: {
      x: [-3.2, 3.2], y: [-2.65, 2.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['4.5*sin(t)', '-6.9 + 4.5*cos(t)'], t: [-0.75, 0.75], color: 'teal', width: 3 }, { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }],
      arrows,
      points: [...points, { x: 0, y: 0, r: 3, color: 'ink' }, { x: 1.6, y: -2.25, r: 0.01, color: 'teal', label: 'toward Earth’s centre' }],
    },
    caption: caption ?? t`Test masses on a ring around one point, and their accelerations relative to it (gold): stretched along the line to Earth by $2GM/r^3$ per metre of separation, squeezed across it by $GM/r^3$. Arrow lengths are not on the distance scale.`,
  };
}

// the tidal stretch over Earth's surface from a distant body to the right
const tidePicture = (name) => ({
  type: 'graph',
  params: {
    x: [-2.6, 3.6], y: [-1.75, 1.75], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 }],
    arrows: [
      { from: [1, 0], to: [1.55, 0], color: 'gold' }, { from: [-1, 0], to: [-1.55, 0], color: 'gold' },
      { from: [0, 1], to: [0, 0.72], color: 'gold' }, { from: [0, -1], to: [0, -0.72], color: 'gold' },
      { from: [2.1, -1.35], to: [3.3, -1.35], color: 'ink3', label: `to the ${name}`, labelDx: -70, labelDy: -12 },
    ],
    points: [{ x: 0, y: 0, r: 3, color: 'ink', label: 'centre', labelDx: 6, labelDy: 10 }],
  },
  caption: t`The ${name}’s pull at points on Earth’s surface *minus* its pull at Earth’s centre: outward along the line to the ${name}, inward across it, half as strong. Arrows show directions and relative sizes only.`,
});

// a straight tunnel along Earth's axis, and a satellite skimming the surface
const tunnelPicture = {
  type: 'graph',
  params: {
    x: [-2.2, 2.2], y: [-1.3, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 }, { param: ['0', 't'], t: [-1, 1], color: 'ink3', width: 5 }],
    arrows: [{ from: [0, 0.62], to: [0, 0.32], color: 'gold', label: 'g ∝ r', labelDx: 8, labelDy: 0 }],
    points: [{ x: 0, y: 0.62, color: 'gold', r: 5, label: 'capsule', labelDx: -64, labelDy: 0 }, { x: round(Math.SQRT1_2 * 1.05), y: round(Math.SQRT1_2 * 1.05), color: 'violet', r: 4, label: 'satellite skimming the surface' }],
  },
  caption: 'Not to scale: a capsule dropped into a tunnel through the centre of a uniform Earth, and a satellite in a circular orbit just above the surface. No air, no friction, no spin.',
};

export default lesson({
  id: 'gr.S01.d',
  title: 'Newtonian gravity as a field theory: Poisson’s equation and instant action',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-obs'],
  intro: t`Newton’s inverse-square law can be rewritten as a **field theory**. A potential $\Phi(\vec x)$ fills space; mass density $\rho$ is its source; and every freely falling body, whatever it is made of, accelerates down its slope, $\vec g = -\nabla\Phi$. Gauss’s law turns the force between pairs of masses into the local equation above, which holds at every point separately.

One look at that equation shows the trouble it is in with relativity: **it contains no time derivative**. Given $\rho$ everywhere at one instant, it fixes $\Phi$ everywhere at the same instant — so moving a mass here changes gravity a light-year away at once.`,
  equation: t`\nabla^2\Phi = 4\pi G\rho, \qquad \vec g = -\nabla\Phi`,
  symbols: [
    { tex: '\\Phi', text: t`the gravitational potential: potential energy per kilogram, in $\text{J/kg} = \text{m}^2/\text{s}^2$. Zero far from all masses, negative near them: $-GM/r$ outside a round body` },
    { tex: '\\rho', text: t`the mass density at each point, in $\text{kg/m}^3$; zero in empty space` },
    { tex: 'G', text: t`Newton’s constant, $6.674\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$` },
    { tex: '\\vec g', text: t`the gravitational field: the acceleration of any freely falling body at that point, in $\text{m/s}^2$` },
    { tex: '\\nabla\\Phi', text: t`the gradient, the vector of slopes $\left(\dfrac{\partial\Phi}{\partial x}, \dfrac{\partial\Phi}{\partial y}, \dfrac{\partial\Phi}{\partial z}\right)$. It points uphill, so $\vec g = -\nabla\Phi$ points downhill` },
    { tex: '\\nabla^2\\Phi', text: t`the Laplacian, written out: $\dfrac{\partial^2\Phi}{\partial x^2} + \dfrac{\partial^2\Phi}{\partial y^2} + \dfrac{\partial^2\Phi}{\partial z^2}$, in $\text{s}^{-2}$. It compares $\Phi$ at a point with its average around it: positive where $\Phi$ dips, which is where mass sits` },
  ],
  why: t`This is the benchmark for everything ahead. For weak, slow gravity Einstein’s field equations must give back exactly $\nabla^2\Phi = 4\pi G\rho$ (step 19) — while replacing its instant action with changes that travel at the speed of light (step 28).`,
  visual: {
    type: 'field2d',
    title: 'Where the field has a source',
    lead: t`The field of a long, uniform rod seen end-on; the rod fills the unit circle. Nothing changes along the rod, so this slice is the whole field and the probe’s divergence is the full $\nabla\cdot\vec g$. Drag the gold probe in and out of the rod.`,
    tasks: [
      'Inside the rod the divergence reads −2 everywhere: here −4πGρ = −2. The source is the density, not the distance.',
      'Outside it reads 0, though the field there is far from zero: empty space has ρ = 0.',
      'The gold loop’s circulation is 0 wherever you look: gravity has no curl, which is why a potential Φ exists.',
    ],
    params: {
      P: '-x*min(1, 1/(x^2 + y^2))', Q: '-y*min(1, 1/(x^2 + y^2))', x: [-3, 3], y: [-3, 3], density: 15, particles: true,
      potential: 'min(x^2 + y^2, 1)/2 + max(0, 0.5*ln(x^2 + y^2))', loop: { r: 1.6, c: [0.3, 0.2] }, probe: [0.45, 0.3],
    },
    caption: t`Here the field $\vec F$ is $\vec g$, in units with $2\pi G\rho = 1$ inside the rod. A rod, not a ball, because a flat slice through a ball would hide the third term $\partial g_z/\partial z$ of the divergence. Arrow lengths are compressed; violet curves are levels of $\Phi$; dots drift along $\vec g$.`,
  },
  example: {
    prompt: t`Starting from Newton’s inverse-square law, derive the local field equation $\nabla^2\Phi = 4\pi G\rho$.`,
    visual: gaussPicture(),
    steps: [
      { label: 'Flux of one point mass', text: t`A mass $M$ at the origin has field $\vec g = -\dfrac{GM}{r^2}\hat r$, pointing straight in. Through a sphere of radius $r$ around it the flux is $\oint\vec g\cdot d\vec A = -\dfrac{GM}{r^2}\times4\pi r^2 = -4\pi GM$. **The radius cancels** — that is what an inverse square does.` },
      { label: 'Any surface, any masses', text: t`Each patch of a surface receives flux in proportion to the solid angle it covers, so every closed surface around $M$ gets the same $-4\pi GM$, and a mass outside the surface sends as much flux out as in. Fields add, so $\oint\vec g\cdot d\vec A = -4\pi G\,M_\text{enc}$, where $M_\text{enc}$ is the mass inside: **Gauss’s law for gravity**.` },
      { label: 'Make it local', text: t`The divergence theorem turns the flux into a volume integral, $\oint\vec g\cdot d\vec A = \int\nabla\cdot\vec g\,dV$, and $M_\text{enc} = \int\rho\,dV$. So $\int\left(\nabla\cdot\vec g + 4\pi G\rho\right)dV = 0$ for every volume, however small — which forces the integrand itself to vanish: $\nabla\cdot\vec g = -4\pi G\rho$ at each point.` },
      { label: 'Bring in the potential', text: t`Newtonian gravity does no work around a closed loop ($\nabla\times\vec g = 0$), so $\vec g = -\nabla\Phi$ for some $\Phi$. Then $\nabla\cdot\vec g = -\left(\dfrac{\partial^2\Phi}{\partial x^2} + \dfrac{\partial^2\Phi}{\partial y^2} + \dfrac{\partial^2\Phi}{\partial z^2}\right) = -\nabla^2\Phi$, and therefore $\nabla^2\Phi = 4\pi G\rho$.` },
      { label: 'Check the units', text: t`$\Phi$ is in $\text{m}^2/\text{s}^2$, so $\nabla^2\Phi$ is in $\text{s}^{-2}$; and $G\rho$ is in $(\text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2})(\text{kg/m}^3) = \text{s}^{-2}$ ✓. Inside the Earth, $4\pi G\rho \approx 4.6\times10^{-6}\ \text{s}^{-2}$.` },
      { label: 'What is missing', text: t`No $\partial/\partial t$ appears anywhere. The equation is solved afresh at each instant, from $\rho$ at that same instant: **instant action at a distance**. A theory that respects the speed of light needs a $-\dfrac{1}{c^2}\dfrac{\partial^2\Phi}{\partial t^2}$ term — a wave equation.` },
    ],
    answer: t`Gauss’s law $\oint\vec g\cdot d\vec A = -4\pi G M_\text{enc}$, the divergence theorem and $\vec g = -\nabla\Phi$ give $\nabla^2\Phi = 4\pi G\rho$ — an equation with no time derivative, so its gravity acts instantly.`,
  },
  practice: [
    expr({
      id: 'g-from-phi', difficulty: 2,
      prompt: t`A point mass $M$ sits at the origin, with potential $\Phi = -\dfrac{GM}{\sqrt{x^2 + y^2 + z^2}}$. Find the $x$-component of its field, $g_x = -\dfrac{\partial\Phi}{\partial x}$. (Type $G$ and $M$ as letters; use \`sqrt\` and \`^\`.)`,
      answer: '-G M x/(x^2 + y^2 + z^2)^(3/2)', answerTeX: t`-\frac{GMx}{(x^2 + y^2 + z^2)^{3/2}}`,
      lhs: 'g_x',
      vars: { x: [0.5, 2], y: [0.5, 2], z: [0.5, 2], G: [0.5, 2], M: [0.5, 2] },
      derivativeOf: 'G M/sqrt(x^2 + y^2 + z^2)',
      errors: [
        { answer: 'G M x/(x^2 + y^2 + z^2)^(3/2)', feedback: t`That is $+\partial\Phi/\partial x$, which points away from the mass. The field is *minus* the gradient: it points downhill, toward $M$.` },
        { answer: '-G M/(x^2 + y^2 + z^2)', feedback: t`That is the field’s size, $GM/r^2$, with no direction. Its $x$-component carries an extra factor $x/r$.` },
      ],
      hints: [t`Write $\Phi = -GM\,(x^2 + y^2 + z^2)^{-1/2}$ and use the chain rule on the bracket.`, t`$\dfrac{\partial}{\partial x}(x^2 + y^2 + z^2)^{-1/2} = -\tfrac12(x^2 + y^2 + z^2)^{-3/2}\cdot2x$.`],
      teach: 'The field is minus the gradient of the potential; each component brings down its own coordinate through the chain rule.',
      explain: t`$\dfrac{\partial\Phi}{\partial x} = -GM\cdot\left(-\tfrac12\right)(x^2 + y^2 + z^2)^{-3/2}\cdot2x = \dfrac{GMx}{r^3}$, so $g_x = -\dfrac{GMx}{r^3}$ with $r = \sqrt{x^2 + y^2 + z^2}$. With $g_y$ and $g_z$ alongside: $\vec g = -\dfrac{GM}{r^3}(x, y, z) = -\dfrac{GM}{r^2}\hat r$ — Newton’s inverse square, pointing at the mass.`,
      visual: pointPotential,
    }),
    num({
      id: 'laplacian-inside', difficulty: 2,
      gen(r) {
        const [name, rho] = r.pick([['Earth', 5514], ['the Moon', 3344], ['Mars', 3933], ['Mercury', 5427]]);
        const ans = 4 * Math.PI * G * rho;
        return {
          prompt: t`Inside a ball of uniform density $\rho$, the potential is $\Phi = \tfrac{2\pi}{3}G\rho\,(x^2 + y^2 + z^2) + \text{const}$. Add up the three second derivatives to find $\nabla^2\Phi$ for a uniform model of ${name}, with its mean density $\rho = ${rho}\ \text{kg/m}^3$.`,
          answer: ans, units: 's^-2', tol: { rel: 0.01 },
          errors: [
            { value: ans / 3, feedback: t`You took one second derivative. $\nabla^2$ adds three — $\partial^2/\partial x^2 + \partial^2/\partial y^2 + \partial^2/\partial z^2$ — and each gives the same $2$.` },
            { value: ans / 6, feedback: t`Differentiate twice: $\partial^2(x^2)/\partial x^2 = 2$, then add the $y$ and $z$ terms.` },
          ],
          hints: [t`$\dfrac{\partial^2}{\partial x^2}(x^2 + y^2 + z^2) = 2$, and the same for $y$ and for $z$.`, t`$\nabla^2\Phi = \tfrac{2\pi}{3}G\rho\times(2 + 2 + 2) = 4\pi G\rho$; now put in the numbers.`],
          teach: 'A potential quadratic in the coordinates has a constant Laplacian: a uniform ball’s potential satisfies Poisson’s equation with its density as the source.',
          explain: t`$\nabla^2\Phi = \tfrac{2\pi}{3}G\rho\,(2 + 2 + 2) = 4\pi G\rho = 4\pi(6.674\times10^{-11})(${rho}) = ${sci(ans)}\ \text{s}^{-2}$ — Poisson’s equation, satisfied. Outside the ball $\Phi = -GM/r$, and there $\nabla^2\Phi = 0$.`,
          visual: ballPotential(),
        };
      },
    }),
    num({
      id: 'gauss-inside', difficulty: 2,
      gen(r) {
        const f = r.pick([0.25, 0.5, 0.75, 0.9]);
        const ans = G_SURF * f;
        return {
          prompt: t`Model the Earth as a ball of uniform density (it is not: its core is about twice as dense as its crust). How fast does a body fall at the bottom of an imaginary shaft, at $r = ${f}R_\oplus$ from the centre? Use Gauss’s law, $GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and $R_\oplus = 6371$ km.`,
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: GM_EARTH / (f * R_EARTH) ** 2, feedback: t`That counts all of Earth’s mass. Only the mass inside your radius pulls: $M(r) = M_\oplus (r/R_\oplus)^3$.` },
            { value: G_SURF, feedback: 'That is the value at the surface. Below it, the mass inside shrinks as r³ while the sphere’s area shrinks only as r².' },
          ],
          hints: [t`Gauss’s law on a sphere of radius $r$: $g\cdot4\pi r^2 = 4\pi G\,M(r)$, with $M(r)$ the mass inside it.`, t`Uniform density: $M(r) = M_\oplus (r/R_\oplus)^3$, so $g = \dfrac{GM_\oplus}{R_\oplus^2}\cdot\dfrac{r}{R_\oplus}$.`],
          teach: 'Inside a uniform ball only the mass within your radius pulls — the shell outside sends zero net flux through your sphere — so g grows in proportion to r.',
          explain: t`$g\cdot4\pi r^2 = 4\pi GM_\oplus (r/R_\oplus)^3$ gives $g = \dfrac{GM_\oplus}{R_\oplus^2}\cdot\dfrac{r}{R_\oplus} = ${fmt(G_SURF, 3)}\times${f} = ${fmt(ans, 3)}\ \text{m/s}^2$. (In the real Earth, $g$ actually rises a little on the way down to the core, because the core is so dense.)`,
          visual: insidePicture(f),
        };
      },
    }),
    num({
      id: 'flux-cube', difficulty: 2,
      prompt: t`A cube 200,000 km on a side is centred on the Earth. The Moon, 384,400 km away, lies outside it. What is the flux $\oint\vec g\cdot d\vec A$ of the gravitational field of the Earth and the Moon through the cube’s surface? ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$.)`,
      answer: -4 * Math.PI * GM_EARTH, units: 'm^3/s^2', tol: { rel: 0.003 },
      errors: [
        { value: -4 * Math.PI * (GM_EARTH + GM_MOON), feedback: 'The Moon lies outside the cube: its field passes in through one side and out through another, adding nothing to the net flux.' },
        { value: -GM_EARTH, feedback: t`Gauss’s law has a $4\pi$ in it: the flux is $-4\pi G$ times the mass inside.` },
        { value: 4 * Math.PI * GM_EARTH, feedback: 'Gravity points inward, into the surface, so the outward flux is negative.' },
      ],
      hints: [t`Gauss’s law: the net flux through any closed surface is $-4\pi G$ times the mass **inside** it — shape and size do not matter.`, t`$-4\pi\times3.986\times10^{14}\ \text{m}^3/\text{s}^2$.`],
      teach: 'The flux of g through a closed surface counts only the mass enclosed; the surface’s shape, its size and the masses outside it are irrelevant.',
      explain: t`Only the Earth is inside, so $\oint\vec g\cdot d\vec A = -4\pi GM_\oplus = -4\pi(3.986\times10^{14}) = ${sci(-4 * Math.PI * GM_EARTH, 4)}\ \text{m}^3/\text{s}^2$. A sphere at any radius, or a potato-shaped surface, gives the same.`,
      visual: cubePicture,
    }),
    mcq({
      id: 'wave-operator', difficulty: 2,
      prompt: t`Poisson’s equation $\nabla^2\Phi = 4\pi G\rho$ makes gravity act instantly. Which modified equation would instead send changes in $\Phi$ outward at the speed of light $c$?`,
      choices: [
        t`$-\dfrac{1}{c^2}\dfrac{\partial^2\Phi}{\partial t^2} + \nabla^2\Phi = 4\pi G\rho$`,
        t`$\nabla^2\Phi = \dfrac{4\pi G\rho}{c^2}$`,
        t`$\dfrac{1}{c}\dfrac{\partial\Phi}{\partial t} = \nabla^2\Phi - 4\pi G\rho$`,
        t`$\nabla^2\Phi + \dfrac{1}{c}\,\dfrac{\partial\Phi}{\partial x} = 4\pi G\rho$`,
      ],
      answer: 0,
      why: {
        1: 'Dividing by c² changes the units, not the timing: with no time derivative, Φ still responds at once.',
        2: 'A single time derivative makes a diffusion equation, like heat flow: a disturbance reaches every distance immediately, only faintly. There is no speed limit in it.',
        3: 'Still no time derivative, so Φ is still fixed instant by instant from ρ at that instant.',
      },
      hints: ['An equation whose solutions travel at a fixed speed is a wave equation. What does the wave equation for a string look like?', t`The wave equation has a **second** time derivative divided by the speed squared: $\dfrac{1}{v^2}\dfrac{\partial^2 y}{\partial t^2} = \dfrac{\partial^2 y}{\partial x^2}$.`],
      teach: 'Only a second time derivative, balanced against the second space derivatives by c², makes disturbances travel at the finite speed c.',
      explain: t`The wave operator $-\dfrac{1}{c^2}\dfrac{\partial^2}{\partial t^2} + \nabla^2$ has solutions that move at $c$, so a change in $\rho$ reaches a distance $r$ only after $r/c$. In weak gravity, general relativity gives almost exactly this equation (step 28), and its waves are gravitational waves — whose speed matches light’s to about one part in $10^{15}$ (GW170817).`,
      visual: wavePicture,
    }),
    num({
      id: 'goce', difficulty: 3,
      prompt: t`Differentiate $\Phi = -GM/r$ twice along the line from Earth’s centre (the $x$ axis, where $y = z = 0$) and you get $\dfrac{\partial^2\Phi}{\partial x^2} = -\dfrac{2GM}{r^3}$: how fast $g$ changes with height, the vertical **gravity gradient**. ESA’s GOCE satellite measured such second derivatives of $\Phi$ from about 255 km up (2009–2013). Compute $2GM/r^3$ there, with $GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and $R_\oplus = 6371$ km.`,
      answer: GRAD_GOCE, units: 's^-2', tol: { rel: 0.01 },
      errors: [
        { value: GRAD_GOCE / 2, feedback: t`That is $GM/r^3$, the squeeze across the radius. Along it the gradient is $2GM/r^3$.` },
        { value: (2 * GM_EARTH) / R_EARTH ** 3, feedback: 'That is the gradient at the ground. Measure r from Earth’s centre to the satellite: 6371 + 255 km.' },
        { value: GM_EARTH / R_GOCE ** 2, feedback: t`That is $g$ itself, $GM/r^2$. The gradient is how fast $g$ changes per metre: one more power of $r$, and a 2.` },
      ],
      hints: [t`$r$ is measured from Earth’s centre: $r = 6371 + 255 = 6626$ km.`, t`$2GM/r^3 = 2(3.986\times10^{14})/(6.626\times10^{6})^3$.`],
      teach: 'Second derivatives of Φ — the tidal tensor — measure how gravity changes from place to place; in general relativity they become spacetime curvature.',
      explain: t`$\dfrac{2GM}{r^3} = \dfrac{2(3.986\times10^{14})}{(6.626\times10^{6})^3} = ${sci(GRAD_GOCE)}\ \text{s}^{-2}$, or about ${Math.round(GRAD_GOCE / 1e-9)} eötvös ($1\ \text{E} = 10^{-9}\ \text{s}^{-2}$): rising one metre, $g$ falls by $${sci(GRAD_GOCE)}\ \text{m/s}^2$. Two test masses one metre apart along the vertical drift apart at that rate — the start of the tidal stretching that step 14 calls curvature.`,
      solution: t`$\dfrac{\partial\Phi}{\partial x} = \dfrac{GMx}{r^3}$; then $\dfrac{\partial^2\Phi}{\partial x^2} = GM\left(\dfrac{1}{r^3} - \dfrac{3x^2}{r^5}\right)$, which on the $x$ axis ($x = r$) is $-\dfrac{2GM}{r^3}$.`,
      visual: tidalRing(),
    }),
    mcq({
      id: 'trace', difficulty: 3,
      prompt: t`At a point on the $x$ axis outside a planet, the nine second derivatives $\dfrac{\partial^2\Phi}{\partial x_i\,\partial x_j}$ (with $x_1 = x$, $x_2 = y$, $x_3 = z$) make the table drawn below: $GM/r^3$ times $-2$, $1$ and $1$ down the diagonal, and zeros elsewhere. Why do the three diagonal entries add up to zero?`,
      choices: [
        t`Their sum is $\nabla^2\Phi = 4\pi G\rho$, and $\rho = 0$ outside the planet`,
        'The diagonal of every symmetric 3 × 3 matrix adds up to zero',
        t`The field $\vec g$ is zero at that point`,
        t`$\Phi$ is negative there, which cancels the positive entries`,
      ],
      answer: 0,
      why: {
        1: t`Most symmetric matrices have a non-zero diagonal sum. Inside the planet this one’s is $4\pi G\rho > 0$.`,
        2: t`$\vec g$ is $GM/r^2$, toward the planet. The table records how $\vec g$ *changes* from point to point, not $\vec g$ itself.`,
        3: t`The value of $\Phi$ never enters its second derivatives: adding a constant to $\Phi$ changes none of them.`,
      },
      hints: ['Which combination of second derivatives appears in Poisson’s equation?', t`$\nabla^2\Phi = \dfrac{\partial^2\Phi}{\partial x^2} + \dfrac{\partial^2\Phi}{\partial y^2} + \dfrac{\partial^2\Phi}{\partial z^2}$ is exactly the diagonal sum.`],
      teach: 'The diagonal sum of the tidal tensor is ∇²Φ = 4πGρ: zero in empty space, so a stretch along one direction comes with squeezes across it.',
      explain: t`The diagonal sum is $\nabla^2\Phi = 4\pi G\rho$, and $\rho = 0$ outside the planet. So the stretch along the radius ($2GM/r^3$) is exactly paid for by the two squeezes across it ($GM/r^3$ each). Inside matter the sum is positive and a ball of free particles shrinks in volume. General relativity splits curvature the same way: Weyl curvature changes a ball’s shape, Ricci curvature its volume (steps 14–15).`,
      visual: matrix([['−2', '0', '0'], ['0', '1', '0'], ['0', '0', '1']], {
        colors: [['warn', 'ink3', 'ink3'], ['ink3', 'accent', 'ink3'], ['ink3', 'ink3', 'accent']],
        rowLabels: ['∂x', '∂y', '∂z'], colLabels: ['∂x', '∂y', '∂z'], left: 'GM/r³ ×', w: 1.2, h: 0.62,
        caption: t`The second derivatives $\partial^2\Phi/\partial x_i\,\partial x_j$ at a point on the $x$ axis outside a planet, in units of $GM/r^3$: row and column name the two derivatives.`,
      }),
    }),
    order({
      id: 'derive-poisson', difficulty: 2,
      prompt: t`Put the steps of the derivation of Poisson’s equation in order.`,
      items: [
        t`One point mass: the flux through a sphere around it is $-\dfrac{GM}{r^2}\cdot4\pi r^2 = -4\pi GM$, whatever the radius.`,
        t`Any closed surface, any masses: $\oint\vec g\cdot d\vec A = -4\pi G\,M_\text{enc}$.`,
        t`Divergence theorem: $\oint\vec g\cdot d\vec A = \int\nabla\cdot\vec g\,dV$, while $M_\text{enc} = \int\rho\,dV$.`,
        t`The volume is arbitrary, so the integrands match: $\nabla\cdot\vec g = -4\pi G\rho$.`,
        t`Substitute $\vec g = -\nabla\Phi$: $\nabla^2\Phi = 4\pi G\rho$.`,
      ],
      hints: ['Start from the field of a single point mass.', 'The potential Φ enters only at the very end.'],
      teach: 'Poisson’s equation is Gauss’s law made local by the divergence theorem, then written in terms of the potential.',
      explain: 'Inverse-square flux → Gauss’s law for any surface → divergence theorem → the local law ∇·g = −4πGρ → with g = −∇Φ, Poisson’s equation.',
      visual: gaussPicture(t`The first step: the same flux, $-4\pi GM$, through spheres of radius $r$ and $2r$ around a point mass. Field arrows to scale.`),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tunnel', difficulty: 3, transfer: true,
      prompt: t`Drill a straight tunnel through the centre of a uniform-density Earth and drop a capsule in (no air, no friction, no spin). Inside, Gauss’s law gives $g = -\dfrac{GM_\oplus}{R_\oplus^3}\,r$ along the tunnel: a restoring force proportional to the distance from the centre. How many minutes does one full oscillation, there and back, take? ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R_\oplus = 6371$ km.)`,
      answer: TUNNEL / 60, units: 'min', tol: { rel: 0.01 },
      errors: [
        { value: Math.sqrt(R_EARTH ** 3 / GM_EARTH) / 60, feedback: t`That is $1/\omega = \sqrt{R^3/GM}$. One period is $2\pi/\omega$.` },
        { value: TUNNEL / 120, feedback: 'That is half a period — one trip to the far side. The question asks for there and back.' },
      ],
      hints: [t`Compare with a mass on a spring: $\ddot r = -\omega^2 r$ with $\omega^2 = GM_\oplus/R_\oplus^3$.`, t`$T = 2\pi\sqrt{R_\oplus^3/GM_\oplus}$; convert seconds to minutes.`],
      teach: 'Inside a uniform ball gravity is a linear restoring force, so a fall through a tunnel is simple harmonic motion.',
      explain: t`$\omega^2 = GM_\oplus/R_\oplus^3 = ${sci(GM_EARTH / R_EARTH ** 3)}\ \text{s}^{-2}$, so $T = 2\pi/\omega = ${fmt(TUNNEL, 4)}$ s $= ${fmt(TUNNEL / 60, 3)}$ minutes. That is exactly the period of a satellite skimming the surface, $2\pi\sqrt{R^3/GM}$: the capsule’s motion is the shadow of that orbit on the tunnel.`,
      visual: tunnelPicture,
    }),
    expr({
      id: 'cp-laplacian', difficulty: 3,
      prompt: t`To show that $\Phi = -GM/r$ satisfies $\nabla^2\Phi = 0$ in empty space, start with one of the three terms. With $r = \sqrt{x^2 + y^2 + z^2}$, find $\dfrac{\partial^2}{\partial x^2}\left(\dfrac{1}{r}\right)$.`,
      answer: '(2x^2 - y^2 - z^2)/(x^2 + y^2 + z^2)^(5/2)', answerTeX: t`\frac{2x^2 - y^2 - z^2}{(x^2 + y^2 + z^2)^{5/2}}`,
      vars: { x: [0.5, 2], y: [0.5, 2], z: [0.5, 2] },
      derivativeOf: '-x/(x^2 + y^2 + z^2)^(3/2)',
      errors: [
        { answer: '-1/(x^2 + y^2 + z^2)^(3/2)', feedback: t`You differentiated only the $x$ in front. The bracket depends on $x$ too: use the product rule.` },
        { answer: '3x^2/(x^2 + y^2 + z^2)^(5/2)', feedback: t`That is only the second half of the product rule; add the $-1/r^3$ from differentiating the $x$ in front.` },
      ],
      hints: [t`First derivative: $\dfrac{\partial}{\partial x}\dfrac1r = -\dfrac{x}{r^3} = -x\,(x^2 + y^2 + z^2)^{-3/2}$.`, t`Product rule: $\dfrac{\partial}{\partial x}\left(-x\,r^{-3}\right) = -r^{-3} + 3x^2 r^{-5}$. Put both over $r^5$.`],
      teach: 'Each second derivative of 1/r is (3x² − r²)/r⁵; the three add to (3r² − 3r²)/r⁵ = 0, so 1/r solves Laplace’s equation away from the origin.',
      explain: t`$\dfrac{\partial^2}{\partial x^2}\dfrac1r = \dfrac{3x^2 - r^2}{r^5} = \dfrac{2x^2 - y^2 - z^2}{r^5}$. By symmetry the $y$ and $z$ terms are $\dfrac{2y^2 - x^2 - z^2}{r^5}$ and $\dfrac{2z^2 - x^2 - y^2}{r^5}$, and the three add to zero. So $\nabla^2(-GM/r) = 0$ wherever $r \neq 0$ — empty space, $\rho = 0$, exactly as Poisson’s equation requires.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4, 4], y: [0, 1.25], xlabel: 'x  (along the line y = 1, z = 0)', ylabel: '1/r',
          curves: [{ fn: '1/sqrt(x^2 + 1)', color: 'accent' }],
          points: [{ x: 0, y: 1, color: 'gold', label: 'curves down here' }, { x: 2.5, y: round(1 / Math.sqrt(7.25)), color: 'violet', label: 'curves up here' }],
        },
        caption: t`$1/r$ along a line passing one unit from the mass. Its curvature along $x$ changes sign, yet the three second derivatives always cancel away from the mass.`,
      },
    }),
    num({
      id: 'cp-tides', difficulty: 2, transfer: true,
      gen(r) {
        const B = r.pick([
          { name: 'Moon', GM: GM_MOON, d: D_MOON, GMt: t`4.905\times10^{12}`, dt: t`3.844\times10^{8}` },
          { name: 'Sun', GM: GM_SUN, d: AU, GMt: t`1.327\times10^{20}`, dt: t`1.496\times10^{11}` },
        ]);
        const ans = (2 * B.GM * R_EARTH) / B.d ** 3;
        const moon = (2 * GM_MOON * R_EARTH) / D_MOON ** 3, sun = (2 * GM_SUN * R_EARTH) / AU ** 3;
        return {
          prompt: t`Ocean tides come from the second derivatives of the ${B.name}’s potential across the Earth. Along the Earth–${B.name} line, the ${B.name}’s pull at the near side of Earth exceeds its pull at Earth’s centre by about $2GM R_\oplus/d^3$. Compute it, with $GM = ${B.GMt}\ \text{m}^3/\text{s}^2$, $d = ${B.dt}$ m and $R_\oplus = 6.371\times10^{6}$ m.`,
          answer: ans, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [
            { value: B.GM / B.d ** 2, feedback: t`That is the ${B.name}’s pull itself, which the whole Earth shares as it falls around the ${B.name}. Tides come from how that pull *varies* across the Earth.` },
            { value: (B.GM * R_EARTH) / B.d ** 3, feedback: 'Along the line to the body the stretch carries a factor 2 (across it, the squeeze has a factor 1).' },
          ],
          hints: [t`It is the gravity gradient along the line, $2GM/d^3$, times the distance $R_\oplus$ from Earth’s centre to its surface.`, t`$2\times${B.GMt}\times6.371\times10^{6}/(${B.dt})^3$.`],
          teach: 'Tides are the tidal tensor at work: a distant body’s pull differs across the Earth by about 2GMR/d³ along the line to it.',
          explain: t`$\dfrac{2GMR_\oplus}{d^3} = ${sci(ans)}\ \text{m/s}^2$, about $${sci(ans / G_SURF, 2)}\,g$. The Sun is ${Math.round(GM_SUN / GM_MOON / 1e6)} million times more massive than the Moon but ${Math.round(AU / D_MOON)} times farther away, and tides go as $M/d^3$: its tide is ${fmt(sun / moon, 2)} of the Moon’s.`,
          visual: tidePicture(B.name),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §4.1 (the Newtonian limit)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'OpenStax University Physics Vol. 2, ch. 6: Gauss’s law (the electric analogue)', url: 'https://openstax.org/books/university-physics-volume-2/pages/6-introduction' },
    { label: 'ESA Earth Online: the GOCE gravity-gradient mission', url: 'https://earth.esa.int/eogateway/missions/goce' },
    { label: 'LIGO–Virgo et al. (2017), GW170817 and GRB 170817A: the speed of gravity', url: 'https://arxiv.org/abs/1710.05834' },
  ],
});
