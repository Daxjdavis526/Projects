// Poisson's equation and gravity: ∇²Φ = 4πGρ. Harmonic outside the matter,
// curved by the density inside. The uniform sphere solved as a radial ODE,
// surface gravity from mean density, the hollow shell by the maximum
// principle, the sphere-average theorem, and the Newtonian limit of
// Einstein's equations as a labelled pointer.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const G = 6.6743e-11;                    // CODATA 2018 (unchanged in 2022), m³/(kg s²)
const C = 299792458;
// GM (m³/s²) and mean radius (m): IAU/JPL values
const BODIES = [
  { name: 'Earth', GM: 3.986004418e14, R: 6.3710e6 },
  { name: 'the Moon', GM: 4.9028e12, R: 1.7374e6 },
  { name: 'Mars', GM: 4.282837e13, R: 3.3895e6 },
  { name: 'Ceres', GM: 6.2628e10, R: 4.697e5 },
];
for (const b of BODIES) { b.rho = (3 * b.GM) / (4 * Math.PI * G * b.R ** 3); b.g = b.GM / b.R ** 2; }
const EARTH = BODIES[0];
const SUN = { GM: 1.32712440018e20, R: 6.957e8 };
const sig3 = (x) => +x.toPrecision(3);

// Φ and |g| of a uniform sphere of radius R in units G = M = 1
const phiU = (R) => `step(${R} - x)*(-(3*${R}^2 - x^2)/(2*${R}^3)) + step(x - ${R})*(-1/x)`;
const gU = (R) => `step(${R} - x)*(x/${R}^3) + step(x - ${R})/x^2`;

export default lesson({
  id: 'st-b.B5.2',
  title: 'Poisson’s equation and gravity',
  minutes: 14, difficulty: 3,
  intro: t`Newtonian gravity is a field equation. The gravitational potential $\Phi$ — energy per kilogram, with the field $\vec g = -\nabla\Phi$ — obeys **Poisson’s equation**

$$\nabla^2\Phi = 4\pi G\rho .$$

Where there is no matter, $\rho = 0$ and $\Phi$ is **harmonic**: everything from lesson B5.1 applies, including the mean-value property and the maximum principle. Inside matter, the density sets how sharply the potential curves upward. It is the same equation as electrostatics, $\nabla^2V = -\rho_q/\varepsilon_0$, with the sign flipped, because like masses attract. And it is where Einstein’s field equations land when gravity is weak and everything moves slowly.`,
  symbols: [
    { tex: t`\Phi`, text: 'the gravitational potential (J/kg = m²/s²): the potential energy of 1 kg, zero far away and negative near mass' },
    { tex: t`\nabla^2`, text: 'the Laplacian, $\\partial_x^2 + \\partial_y^2 + \\partial_z^2$; for a function of the radius only, $\\frac{1}{r^2}\\frac{d}{dr}\\big(r^2\\frac{d\\Phi}{dr}\\big)$' },
    { tex: 'G', text: t`Newton’s constant, $6.674\times10^{-11}\ \text{m}^3/(\text{kg s}^2)$` },
    { tex: t`\rho`, text: 'the mass density at that point (kg/m³)' },
    { tex: t`\vec g = -\nabla\Phi`, text: 'the gravitational field (m/s²): the force on 1 kg, pointing downhill in $\\Phi$' },
  ],
  why: t`The 00-component of Einstein’s equations, for weak fields and slow sources, reduces to exactly this equation with $g_{00} \approx -(1 + 2\Phi/c^2)$ — so Poisson’s equation is the piece of general relativity you already use whenever you compute an orbit. The constraint equations of numerical relativity (module B14) are its nonlinear descendants.`,
  visual: {
    type: 'graph',
    title: 'Inside and outside a uniform ball',
    lead: t`The potential (blue) and the field strength (orange) of a uniform ball of fixed mass, against the distance from its centre. Outside, both are those of a point mass (dashed). Inside, the potential is a parabola — the curvature that $4\pi G\rho$ demands — and the field grows linearly from zero.`,
    tasks: [
      'Shrink the radius R: the outside never changes (Newton’s shell theorem), but the well deepens and the field at the surface rises.',
      'Watch where the field is strongest: always exactly at the surface.',
      'The well’s depth at the centre is always 1.5 times the potential at the surface: −3/(2R) against −1/R.',
    ],
    params: {
      x: [0, 4], y: [-2.8, 3], aspect: 'wide', xlabel: 'r (distance from centre)', ylabel: '', axesAt: 'edge',
      sliders: [{ key: 'R', label: 'Ball radius $R$', min: 0.6, max: 2, step: 0.05, value: 1, explain: 'The same mass, packed into a ball of this radius (units with $G = M = 1$). A smaller ball is denser.' }],
      curves: [
        { fn: '-1/x', color: 'ink3', dash: [5, 4], width: 1.4, domain: [0.29, 4] },
        { fn: phiU('R'), color: 'accent', width: 2.6, label: 'Φ(r)', labelAt: 3.3, labelDy: 16 },
        { fn: gU('R'), color: 'warn', width: 2.4, label: '|g(r)|', labelAt: 2.6, labelDy: -12 },
      ],
      vlines: [{ x: 'R', label: 'surface', color: 'gold' }],
      readouts: [{ label: t`$\nabla^2\Phi = 4\pi G\rho$ inside`, expr: '3/R^3', digits: 3 }, { label: t`$\Phi$ at centre`, expr: '-1.5/R', digits: 3 }, { label: t`$|\vec g|$ at surface`, expr: '1/R^2', digits: 3 }],
    },
    caption: t`Exact solutions for a ball of uniform density, in units where $G = 1$ and the mass $M = 1$. Real planets are denser toward the middle, so their inside curves bend differently, but the outside is the same for any spherically symmetric body.`,
  },
  example: {
    prompt: t`Solve Poisson’s equation for a uniform ball of mass $M$ and radius $R$, with $\Phi \to 0$ far away. Then use it for Earth ($GM = ${tex(EARTH.GM)}\ \text{m}^3/\text{s}^2$, mean radius ${EARTH.R / 1e3} km): find its mean density, its surface gravity and the potential at its centre if it were uniform.`,
    visual: { type: 'graph', params: { x: [0, 3], y: [-1.7, 1.2], aspect: 'wide', xlabel: 'r / R', ylabel: '', axesAt: 'edge', curves: [{ fn: phiU(1), color: 'accent', width: 2.4, label: 'Φ / (GM/R)', labelAt: 2.2, labelDy: -14 }, { fn: gU(1), color: 'warn', width: 2.2, label: '|g| / (GM/R²)', labelAt: 1.6, labelDy: -14 }], vlines: [{ x: 1, label: 'surface', color: 'gold' }], points: [{ x: 0, y: -1.5, label: '−3/2', color: 'accent' }] }, caption: 'The uniform ball’s potential and field in units of their surface scales.' },
    steps: [
      { label: 'Radial Laplacian', text: t`By symmetry $\Phi = \Phi(r)$, and the Laplacian in spherical coordinates (Advanced Math A, lesson A9.1) reduces to $\dfrac{1}{r^2}\dfrac{d}{dr}\Big(r^2\dfrac{d\Phi}{dr}\Big) = 4\pi G\rho$, with $\rho = 3M/(4\pi R^3)$ inside and 0 outside.` },
      { label: 'Integrate once', text: t`Inside: $r^2\Phi' = \tfrac{4\pi}{3}G\rho\,r^3 + C$. A finite field at the centre needs $C = 0$, so $\Phi' = GMr/R^3$. Outside: $r^2\Phi' = \text{const} = GM$, matching at $r = R$. Since $|\vec g| = \Phi'$, that is $g = GM/r^2$ outside and $GMr/R^3$ inside.` },
      { label: 'Integrate again', text: t`Outside, $\Phi = -GM/r$ (zero at infinity). Inside, $\Phi = \dfrac{GM r^2}{2R^3} + K$, and continuity at $R$ gives $K = -\dfrac{3GM}{2R}$: $\;\Phi = -\dfrac{GM\,(3R^2 - r^2)}{2R^3}$.` },
      { label: 'Check the curvature', text: t`$\dfrac{1}{r^2}\big(r^2\cdot GMr/R^3\big)' = \dfrac{3GM}{R^3} = 4\pi G\rho$ ✓. Outside, $\big(r^2\cdot GM/r^2\big)' = 0$ ✓ — harmonic.` },
      { label: 'Earth’s numbers', text: t`$\rho = \dfrac{3\,GM}{4\pi G R^3} = ${Math.round(EARTH.rho)}\ \text{kg/m}^3$. $g = GM/R^2 = ${sig3(EARTH.g)}\ \text{m/s}^2$. $\Phi(R) = -GM/R = ${tex(-EARTH.GM / EARTH.R)}$ J/kg, and a uniform Earth would have $\Phi(0) = 1.5\,\Phi(R) = ${tex(-1.5 * EARTH.GM / EARTH.R)}$ J/kg.` },
      { label: 'Honesty', text: t`Earth is not uniform: its iron core is about twice as dense as its surface rocks, so real gravity first *rises* slightly as you go down, peaking near $10.7\ \text{m/s}^2$ at the core–mantle boundary (PREM model), instead of falling linearly. The outside solution does not care: it depends only on $M$.` },
    ],
    answer: t`$\Phi = -GM/r$ outside and $-GM(3R^2 - r^2)/(2R^3)$ inside. For Earth: $\rho \approx ${Math.round(EARTH.rho)}\ \text{kg/m}^3$, $g \approx ${sig3(EARTH.g)}\ \text{m/s}^2$, $\Phi(0) \approx ${tex(-1.5 * EARTH.GM / EARTH.R)}$ J/kg for a uniform model.`,
  },
  practice: [
    mcq({
      id: 'sign', difficulty: 1,
      prompt: t`Which equation correctly links Newtonian gravity to its sources, with $\vec g = -\nabla\Phi$?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-1.7, 0.3], aspect: 'wide', xlabel: 'r', ylabel: 'Φ', axesAt: 'edge', curves: [{ fn: phiU(1), color: 'accent', width: 2.4 }], vlines: [{ x: 1, label: 'surface', color: 'gold' }] }, caption: 'The potential well of a planet: it curves upward (positive second derivative) where there is mass.' },
      choices: [t`$\nabla^2\Phi = 4\pi G\rho$, equivalently $\nabla\cdot\vec g = -4\pi G\rho$`, t`$\nabla^2\Phi = -4\pi G\rho$`, t`$\nabla\cdot\vec g = 4\pi G\rho$`, t`$\nabla^2\Phi = 0$ everywhere, matter included`],
      answer: 0,
      why: {
        1: t`That is the electrostatic sign ($\nabla^2V = -\rho_q/\varepsilon_0$) carried over. Like charges repel; masses attract, so the sign flips: the potential well curves *upward* at its bottom.`,
        2: t`$\vec g$ points *into* the mass, so its field lines converge there: negative divergence.`,
        3: t`Only empty space is harmonic. Inside matter the density curves the potential.`,
      },
      hints: [t`At the bottom of the well (a planet’s centre) $\Phi$ is a minimum, so its second derivatives are positive.`],
      teach: 'Mass is a sink of the gravitational field: ∇·g = −4πGρ, so ∇²Φ = +4πGρ.',
      explain: t`At the centre of a planet $\Phi$ has a minimum, so $\nabla^2\Phi > 0$ where $\rho > 0$: $\nabla^2\Phi = 4\pi G\rho$. With $\vec g = -\nabla\Phi$, that is $\nabla\cdot\vec g = -4\pi G\rho$ — Gauss’s law for gravity, field lines ending on mass.`,
    }),
    num({
      id: 'density-from-curvature', difficulty: 2,
      gen(r) {
        const b = r.pick(BODIES), A = (2 * Math.PI / 3) * G * b.rho;
        return {
          prompt: t`Deep inside a uniform body the potential is $\Phi = \Phi_0 + A\,r^2$ with $A = ${tex(A)}\ \text{s}^{-2}$. What is the body’s density, in kg/m³?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'r / R', ylabel: '(Φ − Φ₀) / (A R²)', axesAt: 'edge', curves: [{ fn: 'x^2', color: 'accent', width: 2.4 }] }, caption: t`The parabolic potential inside a uniform body: its curvature measures the density.` },
          answer: b.rho, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: b.rho / 3, feedback: t`In three dimensions $\nabla^2(Ar^2) = 6A$, not $2A$: each of $x^2$, $y^2$ and $z^2$ contributes $2A$.` }],
          hints: [t`$\nabla^2(A r^2) = A\,\nabla^2(x^2 + y^2 + z^2)$.`, t`That is $6A$. Set $6A = 4\pi G\rho$ and solve: $\rho = 3A/(2\pi G)$.`],
          teach: 'The Laplacian of r² in 3D is 6: each coordinate contributes 2.',
          explain: t`$\nabla^2\Phi = 6A = 4\pi G\rho$, so $\rho = \dfrac{3A}{2\pi G} = ${Math.round(b.rho)}\ \text{kg/m}^3$ — the mean density of ${b.name}.`,
        };
      },
    }),
    num({
      id: 'surface-g', difficulty: 2,
      gen(r) {
        const b = r.pick(BODIES);
        return {
          prompt: t`${b.name[0].toUpperCase() + b.name.slice(1)} has mean density $${Math.round(b.rho)}\ \text{kg/m}^3$ and mean radius ${(b.R / 1e3).toFixed(1)} km. Treating it as a uniform ball, what is the gravitational field at its surface, in m/s²?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 1.15], aspect: 'wide', xlabel: 'r / R', ylabel: 'g / g(surface)', axesAt: 'edge', curves: [{ fn: gU(1), color: 'warn', width: 2.4 }], vlines: [{ x: 1, label: 'surface', color: 'gold' }] }, caption: 'The field of a uniform ball, relative to its surface value: linear inside (Gauss’s law encloses mass ∝ r³), inverse-square outside.' },
          answer: b.g, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: 4 * Math.PI * G * b.rho * b.R, feedback: t`Gauss’s law gives $4\pi R^2 g = 4\pi G M$ with $M = \tfrac43\pi R^3\rho$: you left out the factor $\tfrac13$.` }],
          hints: [t`Gauss’s law for gravity over the surface: $4\pi R^2\,g = 4\pi G M$.`, t`With $M = \tfrac43\pi R^3\rho$: $g = \tfrac43\pi G\rho R$.`],
          teach: 'Surface gravity of a uniform ball: g = (4π/3)GρR — proportional to density times size.',
          explain: t`$g = \tfrac43\pi G\rho R = \tfrac43\pi(${tex(G)})(${Math.round(b.rho)})(${tex(b.R)}) = ${sig3(b.g)}\ \text{m/s}^2$.`,
        };
      },
    }),
    expr({
      id: 'inside-potential', difficulty: 3,
      prompt: t`Inside a region of constant density $\rho$ around the centre of a star, solve $\dfrac{1}{r^2}\dfrac{d}{dr}\Big(r^2\dfrac{d\Phi}{dr}\Big) = 4\pi G\rho$ for the solution that is finite at $r = 0$ and has $\Phi(0) = \Phi_0$.`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-1.6, -0.9], aspect: 'wide', xlabel: 'r (inner region)', ylabel: 'Φ', axesAt: 'edge', curves: [{ fn: '-1.5 + 0.5*x^2', color: 'accent', width: 2.4 }], points: [{ x: 0, y: -1.5, label: 'Φ₀', color: 'gold' }] }, caption: 'A potential with its minimum at the centre and zero slope there (no field at the centre). Illustrative units.' },
      answer: 'Phi_0 + 2*pi*G*rho*r^2/3',
      answerTeX: t`\Phi_0 + \tfrac{2\pi}{3}G\rho\,r^2`,
      lhs: t`\Phi(r)`,
      vars: { r: [0.1, 2], G: [0.5, 2], rho: [0.5, 3], Phi_0: [-3, 3] },
      errors: [
        { answer: 'Phi_0 + 2*pi*G*rho*r^2', feedback: t`That solves $\Phi'' = 4\pi G\rho$ — the 1D Laplacian. In 3D the $\frac{2}{r}\Phi'$ term changes the factor to $\tfrac{2\pi}{3}$.` },
        { answer: 'Phi_0 + 4*pi*G*rho*r^2/3', feedback: t`Check: $r^2\Phi' = \tfrac{4\pi}{3}G\rho r^3$, so $\Phi' = \tfrac{4\pi}{3}G\rho r$, and integrating gives half of that times $r^2$.` },
      ],
      hints: [t`Multiply by $r^2$ and integrate once: $r^2\Phi' = \tfrac{4\pi}{3}G\rho r^3 + C$. Finiteness at $r = 0$ forces $C = 0$.`, t`Then $\Phi' = \tfrac{4\pi}{3}G\rho\,r$; integrate again and use $\Phi(0) = \Phi_0$.`],
      teach: 'A radial Poisson problem is two integrations: the first constant is fixed by regularity at the centre, the second by the potential’s value.',
      explain: t`$\Phi = \Phi_0 + \tfrac{2\pi}{3}G\rho r^2$. Check: $\tfrac{1}{r^2}\big(r^2\cdot\tfrac{4\pi}{3}G\rho r\big)' = \tfrac{1}{r^2}\cdot 4\pi G\rho r^2 = 4\pi G\rho$ ✓. The other solution, $C/r$, is the point-mass potential: it would need a mass sitting at the centre.`,
    }),
    mcq({
      id: 'sphere-average', difficulty: 3,
      prompt: t`Earth is not a perfect sphere: it bulges at the equator and has mountains and dense patches. Average its gravitational potential over a sphere of radius $r$, centred on Earth’s centre of mass and enclosing all of Earth. What is the average?`,
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.5, 1.5], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ polar: '1 + 0.12*cos(2*theta) + 0.05*sin(5*theta)', theta: [0, 6.2832], color: 'accent', width: 2.4 }, { param: ['1.45*cos(t)', '1.45*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2, dash: [6, 4] }], points: [{ x: 0, y: 0, label: 'centre of mass', color: 'ink2' }] }, caption: 'A lumpy planet (exaggerated) inside a sphere of radius r (dashed) that encloses all its mass.' },
      choices: [t`$-GM/r$, exactly, whatever the lumps`, t`the potential at Earth’s centre, by the mean-value property`, t`$-GM/R$, with $R$ Earth’s mean radius`, t`it depends on the shape of the lumps`],
      answer: 0,
      why: {
        1: 'The mean-value property needs the potential to be harmonic throughout the ball inside the sphere — and here that ball contains all of Earth’s mass.',
        2: t`$R$ is a property of Earth’s surface; the average over a sphere of radius $r$ must depend on $r$ (and tends to 0 as $r \to \infty$).`,
        3: t`Every lump’s contribution, averaged over a sphere enclosing it, is the same as if the lump sat at the centre (each point mass $m$ averages to $-Gm/r$ — the shell theorem read backwards).`,
      },
      hints: [t`Split Earth into point masses. For one mass $m$ at a point inside the sphere, what is the average of $-Gm/|\mathbf{x} - \mathbf{x}_m|$ over the sphere?`, t`Newton’s shell theorem: a uniform shell’s potential at an inside point is the same as at its centre, $-Gm/r$. By symmetry that number is also the average over the shell of a point mass’s potential.`],
      teach: 'Averaged over a sphere enclosing all the mass, any distribution’s potential is −GM/r: only the total mass survives the average.',
      explain: t`For each point mass $m$ inside, the average over the sphere of $-Gm/|\mathbf{x} - \mathbf{x}_m|$ equals the potential of a uniform shell of mass $m$ at the point $\mathbf{x}_m$, which is $-Gm/r$ everywhere inside a shell. Summing, $\langle\Phi\rangle = -GM/r$. The bulge and lumps add terms like $(R/r)^{\ell+1}P_\ell(\cos\theta)$ (lesson B7.3) that average to zero on a sphere.`,
    }),
    code({
      id: 'check-poisson', difficulty: 2,
      prompt: t`Check numerically that the uniform-ball potential $\Phi = -\dfrac{GM(3R^2 - r^2)}{2R^3}$ (inside) and $-\dfrac{GM}{r}$ (outside) satisfies $\nabla^2\Phi = 4\pi G\rho$ inside and $0$ outside. Use units $G = M = R = 1$, so $4\pi G\rho = 3$. Write \`phi(r)\`, and \`lap(r, h=1e-3)\` returning the radial Laplacian $\Phi'' + \tfrac{2}{r}\Phi'$ by central differences. Set \`inside\` to \`lap(0.5)\` and \`outside\` to \`lap(2.0)\`.`,
      starter: t`import numpy as np

def phi(r):
    # inside (r < 1): -(3 - r**2)/2 ; outside: -1/r
    pass

def lap(r, h=1e-3):
    # second derivative plus (2/r) times first derivative, by central differences
    pass

inside = None
outside = None
print(inside, outside)
`,
      answer: t`import numpy as np

def phi(r):
    return np.where(r < 1, -(3 - r**2) / 2, -1 / r)

def lap(r, h=1e-3):
    d1 = (phi(r + h) - phi(r - h)) / (2 * h)
    d2 = (phi(r + h) - 2 * phi(r) + phi(r - h)) / h**2
    return d2 + 2 / r * d1

inside = lap(0.5)
outside = lap(2.0)
print(inside, outside)`,
      tests: [
        { name: t`$\Phi$ is continuous at the surface`, code: 'abs(phi(1 - 1e-9) - phi(1 + 1e-9)) < 1e-6' },
        { name: t`inside, $\nabla^2\Phi = 3$ (that is, $4\pi G\rho$) to 4 decimals`, code: 'inside is not None and abs(inside - 3) < 1e-4' },
        { name: t`outside, $\nabla^2\Phi = 0$ to 4 decimals`, code: 'outside is not None and abs(outside) < 1e-4' },
        { name: t`at $r = 0.2$ it is 3 as well`, code: 'abs(lap(0.2) - 3) < 1e-4' },
      ],
      hints: ['`np.where(r < 1, inside_formula, outside_formula)` picks a branch.', 'First derivative: `(phi(r + h) - phi(r - h)) / (2*h)`; second: `(phi(r + h) - 2*phi(r) + phi(r - h)) / h**2`.', 'Return `d2 + 2/r * d1`.'],
      teach: 'For a function of r only, the 3D Laplacian is Φ″ + (2/r)Φ′; the 2/r term is what makes 1/r harmonic.',
      explain: t`Inside, $\Phi'' = 1$ and $\tfrac{2}{r}\Phi' = 2$: total 3 $= 4\pi G\rho$ with $\rho = 3/(4\pi)$. Outside, $\Phi'' = -2/r^3$ and $\tfrac{2}{r}\Phi' = 2/r^3$: they cancel. Note that $1/r$ is harmonic in 3D but not in 2D — where the 2D Laplacian has $\tfrac1r\Phi'$ and the harmonic radial function is $\ln r$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tunnel', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.pick(BODIES.slice(0, 3));
        const half = Math.PI * Math.sqrt(b.R ** 3 / b.GM) / 60;
        return {
          prompt: t`Drill a straight frictionless, airless tunnel through the centre of ${b.name} ($GM = ${tex(b.GM)}\ \text{m}^3/\text{s}^2$, $R = ${(b.R / 1e3).toFixed(1)}$ km), treated as a uniform ball. Inside, $g = GMr/R^3$ pulls back toward the centre. A capsule is dropped in at one end from rest. How long, in minutes, until it reaches the far end?`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1.1, 1.1], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.2 }, { param: ['t', '0'], t: [-1, 1], color: 'gold', width: 3 }], points: [{ x: -1, y: 0, label: 'drop', color: 'warn', labelDx: -36, labelDy: -12 }], arrows: [{ from: [-0.6, 0.15], to: [-0.25, 0.15], color: 'warn' }] }, caption: 'A tunnel through the centre (gold). A real planet is denser at its core, and hotter than any tunnel could survive: this is a thought experiment.' },
          answer: half, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: 2 * half, feedback: 'That is a full period, there and back. The capsule reaches the far end after half a period.' }, { value: half / 2, feedback: 'That is the time to the centre, a quarter period. Continue to the far end.' }],
          hints: [t`$\ddot r = -\dfrac{GM}{R^3}\,r$: simple harmonic motion with $\omega^2 = GM/R^3$.`, t`The far end is half a period away: $t = \pi/\omega = \pi\sqrt{R^3/GM}$.`],
          teach: 'Inside a uniform ball, gravity is a linear spring toward the centre: every straight tunnel takes the same half-period π√(R³/GM).',
          explain: t`$\omega = \sqrt{GM/R^3}$, so $t = \pi\sqrt{R^3/GM} = ${tex(half * 60)}$ s $\approx ${sig3(half)}$ min — the same as half of a grazing circular orbit’s period, and independent of where the straight tunnel runs.`,
        };
      },
    }),
    num({
      id: 'cp-weak-field', difficulty: 2, transfer: true,
      gen(r) {
        const s = r.pick([['Earth’s surface', EARTH.GM, EARTH.R], ['the Sun’s surface', SUN.GM, SUN.R], ['the surface of the white dwarf Sirius B (1.02 solar masses, radius 5 800 km)', 1.02 * SUN.GM, 5.8e6]]);
        const x = s[1] / (s[2] * C * C);
        const data = s[0].startsWith('Earth') ? t`$GM = ${tex(s[1])}\ \text{m}^3/\text{s}^2$, $R = ${tex(s[2])}$ m` : s[0].startsWith('the Sun') ? t`$GM_\odot = ${tex(SUN.GM)}\ \text{m}^3/\text{s}^2$, $R = ${tex(s[2])}$ m` : t`$GM_\odot = ${tex(SUN.GM)}\ \text{m}^3/\text{s}^2$`;
        return {
          prompt: t`Einstein’s equations reduce to $\nabla^2\Phi = 4\pi G\rho$ when $|\Phi|/c^2 \ll 1$ and matter moves slowly, with the metric’s time part $g_{00} \approx -(1 + 2\Phi/c^2)$. How small is $|\Phi|/c^2 = GM/(Rc^2)$ at ${s[0]}? (${data}, $c = ${tex(C)}$ m/s.)`,
          visual: { type: 'graph', params: { x: [0, 5], y: [-1.1, 0.1], aspect: 'wide', xlabel: 'r / R', ylabel: 'Φ / (GM/R)', axesAt: 'edge', curves: [{ fn: phiU(1), color: 'accent', width: 2.4 }], vlines: [{ x: 1, label: 'surface', color: 'gold' }] }, caption: 'The shape of the well; the question is how deep it is compared with c².' },
          answer: x, tol: { rel: 0.01 },
          hints: [t`Compute $GM/(R c^2)$ with everything in SI units.`],
          teach: 'Newtonian gravity is the weak-field limit: GM/(Rc²) measures how far a body is from needing general relativity.',
          explain: t`$GM/(Rc^2) = ${tex(x)}$. Clocks there run slow by about this fraction relative to clocks far away — tiny, yet GPS must correct for the difference in $\Phi/c^2$ between the ground and its orbits. This is a pointer, not a derivation: the reduction of the 00-component of Einstein’s equations to Poisson’s equation is done in Carroll, §4.1, and in the Road to Einstein.`,
        };
      },
    }),
    mcq({
      id: 'cp-shell', difficulty: 2,
      prompt: t`A hollow spherical shell of uniform density surrounds an empty cavity. Inside the cavity, $\nabla^2\Phi = 0$, and by symmetry $\Phi$ has the same value at every point of the cavity’s wall. What is the gravitational field inside the cavity?`,
      visual: { type: 'graph', params: { x: [-1.8, 1.8], y: [-1.15, 1.15], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 3 }, { param: ['0.85*cos(t)', '0.85*sin(t)'], t: [0, 6.2832], color: 'accent', width: 3 }], points: [{ x: 0.3, y: 0.2, label: 'P', color: 'gold' }] }, caption: 'A hollow shell (blue, thickness exaggerated) and a point P in its cavity.' },
      choices: ['Zero everywhere in the cavity', 'Pointing outward, toward the nearest part of the shell', 'Pointing to the centre, weaker near it', 'Zero only at the centre'],
      answer: 0,
      why: {
        1: 'The near part pulls harder per kilogram, but the far part has more mass in each cone of directions; they cancel exactly.',
        2: 'That would need mass at the centre; the cavity is empty.',
        3: 'Symmetry alone gives zero at the centre; the maximum principle extends it to every point.',
      },
      hints: ['A harmonic function with the same value all over the boundary: what does the maximum principle say about its largest and smallest values?'],
      teach: 'A harmonic function with constant boundary values is constant (maximum principle), so its gradient — the field — vanishes.',
      explain: t`Max and min of $\Phi$ are both on the wall, where $\Phi$ is constant, so $\Phi$ is that constant throughout the cavity and $\vec g = -\nabla\Phi = 0$: Newton’s shell theorem, proved with lesson B5.1’s maximum principle instead of Newton’s cones.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'S. M. Carroll, Lecture Notes on General Relativity, §4.1 (the Newtonian limit), arXiv:gr-qc/9712019', url: 'https://arxiv.org/abs/gr-qc/9712019' }, { label: 'Dziewonski & Anderson, Preliminary Reference Earth Model (PREM), Phys. Earth Planet. Inter. 25, 297 (1981)', url: 'https://doi.org/10.1016/0031-9201(81)90046-7' }, { label: 'IAU/JPL planetary constants (GM, radii)', url: 'https://ssd.jpl.nasa.gov/astro_par.html' }],
});
