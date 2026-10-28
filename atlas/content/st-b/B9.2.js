// Green's functions for Poisson's equation: ∇²𝒢 = δ³ gives 𝒢 = −1/(4πr) (by
// Gauss's flux argument), so ∇²u = f is solved by u = ∫𝒢 f — for gravity,
// Φ = −G∫ρ/|x − x′|, the point mass −GM/r and every superposition of them.
// The 1D, 2D and 3D kernels; the far field of a spread-out mass; boundaries
// by images (the Dirichlet image has the opposite sign, the Neumann image
// the same) — shown with steady heat; the electrostatics stays in PHYS 3600 M4.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const G = 6.6743e-11;                                   // CODATA 2018, m³/(kg s²)
const EARTH = { GM: 3.986004418e14, R: 6.371e6 };       // IERS / IAU
const MOON = { GM: 4.9028e12, d: 3.844e8 };             // JPL DE440; mean distance
const SUN = { GM: 1.32712440018e20, AU: 1.495978707e11 };
// N equal point masses on a rod from x = −1 to 1 (total mass 1), as an expression; ε softens the plot near each mass
const rod = (n) => Array.from({ length: 12 }, (_, i) => `step(${n} - ${i + 0.5})/${n}/sqrt((x + 1 - (${2 * i + 1})/${n})^2 + y^2 + 0.0025)`).join(' + ');
// a source at (0, −d) under the surface y = 0, with its image at (0, d) of sign σ
const halfSpace = (d, sigma) => `1/sqrt(x^2 + (y + ${d})^2 + 0.004) ${sigma < 0 ? '-' : '+'} 1/sqrt(x^2 + (y - ${d})^2 + 0.004)`;
const surfaceLine = { param: ['-3.2 + 6.4*t', '0'], t: [0, 1], color: 'gold', width: 2.4 };

export default lesson({
  id: 'st-b.B9.2',
  title: 'Green’s functions for Poisson’s equation',
  minutes: 15, difficulty: 3,
  intro: t`In three dimensions the point source is a single point, and the response to it falls off with distance. The Green’s function of the Laplacian — written $\mathcal G$ here, to keep $G$ for Newton’s constant — solves $\nabla^2\mathcal G = \delta^3(\mathbf x - \mathbf x')$ and vanishes far away:

$$\mathcal G(\mathbf x, \mathbf x') = -\frac{1}{4\pi\,|\mathbf x - \mathbf x'|}, \qquad u(\mathbf x) = \int \mathcal G(\mathbf x, \mathbf x')\,f(\mathbf x')\,d^3x' \ \text{ solves } \ \nabla^2 u = f .$$

For gravity, $\nabla^2\Phi = 4\pi G\rho$, so $\Phi(\mathbf x) = -G\displaystyle\int\frac{\rho(\mathbf x')}{|\mathbf x - \mathbf x'|}\,d^3x'$: **every gravitational potential is a sum of point-mass potentials** $-GM/r$. Near a boundary the free-space $\mathcal G$ is not enough, and an **image** source behind the boundary fixes it.`,
  symbols: [
    { tex: t`\mathcal G(\mathbf x, \mathbf x')`, text: 'the Green’s function: the response at $\\mathbf x$ to a unit point source at $\\mathbf x\'$ (units 1/m)' },
    { tex: t`\mathbf x,\ \mathbf x'`, text: 'where you look (the field point) and where the source sits (the source point), in metres' },
    { tex: t`\delta^3(\mathbf x - \mathbf x')`, text: 'the 3D Dirac delta: a unit spike at $\\mathbf x\'$ whose integral over any volume containing it is 1 (units 1/m³)' },
    { tex: 'f', text: 'the source density in $\\nabla^2u = f$; for gravity $f = 4\\pi G\\rho$' },
    { tex: t`\Phi`, text: 'the gravitational potential (J/kg), with $\\rho$ the mass density (kg/m³)' },
    { tex: 'G', text: t`Newton’s constant, $6.674\times10^{-11}\ \text{m}^3/(\text{kg s}^2)$` },
  ],
  why: t`The same kernel, multiplied by $4G/c^4$, gives the metric perturbation of a slowly moving mass in linearized general relativity; let the source move and it becomes the retarded Green’s function of the next lesson, the one behind gravitational-wave emission.`,
  visual: {
    type: 'c3-contour',
    title: 'A potential built from point masses',
    lead: t`The gravitational potential (in the plane of a rod) of a total mass split into $N$ equal point masses along the rod. Each contributes its own $-m/r$; the map is their sum. The probe compares the true potential with that of a single point mass at the centre.`,
    tasks: [
      'N = 1: one point mass — circular contours, the Green’s function itself.',
      'Raise N: the masses spread along the rod and the near contours stretch into ovals hugging it.',
      'Drag the probe far away: the true potential and the point-mass value agree ever better — from far off, every lump looks like a point.',
    ],
    params: {
      f: `-(${rod('N')})`, x: [-3.2, 3.2], y: [-2, 2], levels: [-4, -2.5, -1.6, -1.1, -0.8, -0.6, -0.45, -0.35], labels: true, probe: [2.4, 1.2],
      sliders: [{ key: 'N', label: 'Number of masses $N$', min: 1, max: 12, step: 1, value: 4, explain: 'The rod’s mass (total 1) split into $N$ equal point masses spread evenly from $x = -1$ to $1$.' }],
      readouts: [
        { label: 'Φ at the probe (sum of N kernels)', expr: 'fp', digits: 4 },
        { label: 'point mass at the centre, −1/r', expr: '-1/sqrt(px^2 + py^2)', digits: 4 },
      ],
    },
    caption: t`Units with $G = 1$ and total mass 1. Each kernel is softened within about 0.05 of its mass so the map stays finite; the true $-1/r$ dives to $-\infty$ there. Contours are drawn in the plane containing the rod.`,
  },
  example: {
    prompt: t`Find the Green’s function of $\nabla^2$ in three dimensions from the flux of its gradient, then use it to write down the potential of a point mass. Check the result for Earth ($GM = ${tex(EARTH.GM)}\ \text{m}^3/\text{s}^2$, $R = 6371$ km): what is $\Phi$ at the surface, and what escape speed does it imply?`,
    visual: { type: 'graph', params: { x: [0, 5], y: [-1.15, 0.15], aspect: 'wide', xlabel: 'r (Earth radii)', ylabel: 'Φ (10⁸ J/kg)', axesAt: 'edge', curves: [{ fn: `-${(EARTH.GM / EARTH.R / 1e8).toFixed(5)}/x`, color: 'accent', width: 2.6, domain: [1, 5] }], points: [{ x: 1, y: -EARTH.GM / EARTH.R / 1e8, color: 'gold', label: 'surface', labelDx: 10 }], shade: [{ fn: '0.15', lower: '-1.15', from: 0, to: 1, color: 'ink4', alpha: 0.15 }] }, caption: t`Earth’s potential outside its surface, $-GM/r$; inside (shaded) the point-mass form no longer holds (lesson B5.2). A non-rotating spherical Earth is assumed.` },
    steps: [
      { label: 'Use the symmetry', text: t`Put the source at the origin. Nothing picks a direction, so $\mathcal G$ depends only on $r = |\mathbf x|$, and away from $r = 0$ it is harmonic.` },
      { label: 'Integrate the delta', text: t`Integrate $\nabla^2\mathcal G = \delta^3$ over a ball of radius $r$. By the divergence theorem the left side is the flux of $\nabla\mathcal G$ through the sphere: $4\pi r^2\,\mathcal G'(r) = 1$.` },
      { label: 'Solve for the kernel', text: t`$\mathcal G'(r) = \dfrac{1}{4\pi r^2}$, so $\mathcal G = -\dfrac{1}{4\pi r}$, the constant chosen so that $\mathcal G \to 0$ far away.` },
      { label: 'A point mass', text: t`$\rho = M\,\delta^3(\mathbf x)$ makes the source $f = 4\pi GM\,\delta^3$, so $\Phi = 4\pi GM\,\mathcal G = -\dfrac{GM}{r}$ — Newton’s potential, from nothing but $\nabla^2\Phi = 4\pi G\rho$.` },
      { label: 'Numbers for Earth', text: t`$\Phi(R) = -\dfrac{${tex(EARTH.GM)}}{${tex(EARTH.R)}} = ${tex(EARTH.GM / EARTH.R)}$ J/kg. Escape needs kinetic energy per kilogram $\tfrac12v^2 = |\Phi|$: $v = \sqrt{2GM/R} = ${r3(Math.sqrt(2 * EARTH.GM / EARTH.R) / 1000)}$ km/s. ✓ (the familiar 11.2 km/s).` },
    ],
    answer: t`$\mathcal G = -1/(4\pi r)$; a point mass has $\Phi = -GM/r$. At Earth’s surface $\Phi \approx ${tex(EARTH.GM / EARTH.R)}$ J/kg, and the escape speed is $${r3(Math.sqrt(2 * EARTH.GM / EARTH.R) / 1000)}$ km/s.`,
  },
  practice: [
    match({
      id: 'dimensions', difficulty: 2,
      prompt: t`Match each dimension with the Green’s function of $\nabla^2$ there, the solution of $\nabla^2\mathcal G = \delta(\mathbf x)$ (up to an added constant).`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'distance r from the source', ylabel: '', axesAt: 'edge', curves: [{ fn: 'x/2', color: 'accent', width: 2.2, label: '1D', labelAt: 2.6, labelDy: -12 }, { fn: 'ln(x)/(2*pi)', color: 'gold', width: 2.2, domain: [0.02, 3], label: '2D', labelAt: 2.6, labelDy: 14 }, { fn: '-1/(4*pi*x)', color: 'violet', width: 2.2, domain: [0.05, 3], label: '3D', labelAt: 2.5, labelDy: -12 }] }, caption: 'The three kernels against distance: only in 3D does the response die away at large distance.' },
      left: ['one dimension (a line)', 'two dimensions (a plane)', 'three dimensions (space)'],
      right: ['|x| / 2', '(1/2π) ln r', '−1/(4π r)', '−1/(2π r)'],
      answer: [0, 1, 2],
      hints: [t`In $n$ dimensions the flux argument gives $\mathcal G'(r)\times(\text{area of a sphere of radius } r) = 1$.`, t`The “sphere” has area 2 (two end points) in 1D, $2\pi r$ in 2D and $4\pi r^2$ in 3D.`],
      teach: 'The flux of ∇𝒢 through any surface around the source is 1; spreading it over a surface of area ∝ r^(n−1) gives the kernel in n dimensions.',
      explain: t`1D: $\mathcal G' = \tfrac12$ (half the flux out of each end) so $\mathcal G = |x|/2$ — the tent of lesson B9.1 without its ends. 2D: $2\pi r\,\mathcal G' = 1$, $\mathcal G = \frac{1}{2\pi}\ln r$ — the potential of a long rod. 3D: $-\frac{1}{4\pi r}$. Only the 3D kernel vanishes at infinity; in 1D and 2D the potential keeps growing with distance.`,
    }),
    num({
      id: 'earth-moon', difficulty: 2,
      gen(r) {
        const x = r.pick([2.0e8, 3.0e8, 3.26e8, 3.5e8]);
        const phi = -EARTH.GM / x - MOON.GM / (MOON.d - x);
        return {
          prompt: t`A spacecraft is on the line from Earth to the Moon, $${tex(x)}$ m from Earth’s centre. Treating both as point masses ($GM_E = ${tex(EARTH.GM)}$, $GM_M = ${tex(MOON.GM)}\ \text{m}^3/\text{s}^2$, separation $${tex(MOON.d)}$ m), what is the gravitational potential there, in MJ/kg?`,
          visual: { type: 'graph', params: { x: [0.5, 3.9], y: [-8, 0.4], aspect: 'wide', xlabel: 'distance from Earth (10⁸ m)', ylabel: 'Φ (MJ/kg)', axesAt: 'edge', yticks: 0, curves: [{ fn: `-(${EARTH.GM / 1e14}/x + ${MOON.GM / 1e14}/abs(3.844 - x))`, color: 'accent', width: 2.4 }], vlines: [{ x: x / 1e8, label: 'spacecraft', color: 'gold' }, { x: 3.844, label: 'Moon', color: 'ink3' }] }, caption: 'The sum of the two point-mass potentials along the Earth–Moon line. Their orbital motion is ignored (no centrifugal term).' },
          answer: phi / 1e6, units: 'MJ/kg', tol: { rel: 0.005 },
          errors: [{ value: -EARTH.GM / x / 1e6, feedback: 'Add the Moon’s term: potentials of separate masses simply add.' }, { value: (-EARTH.GM / x + MOON.GM / (MOON.d - x)) / 1e6, feedback: 'Both terms are negative: mass always lowers the potential.' }],
          hints: ['Superposition: Φ = Φ(Earth) + Φ(Moon).', t`$\Phi = -\dfrac{GM_E}{r} - \dfrac{GM_M}{d - r}$.`],
          teach: 'Potentials of separate masses add: each contributes its own point-mass Green’s function.',
          explain: t`$-\dfrac{${tex(EARTH.GM)}}{${tex(x)}} - \dfrac{${tex(MOON.GM)}}{${tex(MOON.d - x)}} = ${tex(phi)}$ J/kg $= ${r3(phi / 1e6)}$ MJ/kg. The Moon’s share is ${r3((100 * MOON.GM / (MOON.d - x)) / -phi)}% — small, but it is what bends a trajectory near the Moon.`,
        };
      },
    }),
    num({
      id: 'line-mass', difficulty: 2,
      gen(r) {
        const lam = r.pick([1.5e9, 2.7e9, 4e9]), r1 = r.pick([1, 2]), r2 = r.pick([5, 8, 10]);
        const dPhi = 2 * G * lam * Math.log(r2 / r1);
        return {
          prompt: t`A long, straight mountain ridge is modelled as a line mass with $\lambda = ${tex(lam)}$ kg per metre of length. In 2D the Green’s function is $\frac{1}{2\pi}\ln r$, so $\Phi = 2G\lambda\ln r + \text{const}$. How much higher is the potential ${r2} km from the ridge than ${r1} km from it, in J/kg?`,
          visual: { type: 'graph', params: { x: [0, 11], y: [-0.4, 1.4], aspect: 'wide', xlabel: 'distance from the ridge (km)', ylabel: 'Φ − Φ(1 km) (J/kg)', axesAt: 'edge', yticks: 0, curves: [{ fn: `${(2 * G * lam).toPrecision(5)}*ln(x)`, color: 'accent', width: 2.4, domain: [0.3, 11] }], vlines: [{ x: r1, color: 'gold' }, { x: r2, color: 'gold' }] }, caption: 'The logarithmic potential of a line mass: it keeps rising with distance, never levelling off. A real ridge is finite and not a line.' },
          answer: dPhi, units: 'J/kg', tol: { rel: 0.005 },
          errors: [{ value: G * lam * Math.log(r2 / r1), feedback: t`$4\pi G\lambda\times\frac{1}{2\pi} = 2G\lambda$: keep the 2.` }, { value: 2 * G * lam * (r2 - r1) * 1000, feedback: t`The potential grows like $\ln r$, not linearly: use $\ln(r_2/r_1)$.` }],
          hints: [t`$\Delta\Phi = 2G\lambda\,\ln(r_2/r_1)$ — units cancel inside the logarithm.`],
          teach: 'In 2D the Green’s function is logarithmic: a line mass’s potential rises as ln r without bound.',
          explain: t`$2\times(6.674\times10^{-11})\times${tex(lam)}\times\ln(${r2}/${r1}) = ${r3(dPhi)}$ J/kg. The field $|\vec g| = 2G\lambda/r$ falls as $1/r$, not $1/r^2$ — a line spreads its flux over a cylinder, not a sphere.`,
        };
      },
    }),
    mcq({
      id: 'image-sign', difficulty: 2,
      prompt: t`A small heat source sits at depth $d$ under the flat ground, whose surface is held at a fixed temperature by the air (a Dirichlet condition: temperature rise 0 on the surface). Below ground the steady temperature rise is $\Delta T = \frac{Q}{4\pi k}\Big(\frac{1}{r_1} + \sigma\,\frac{1}{r_2}\Big)$, where $r_1$ is the distance to the source and $r_2$ the distance to its mirror image a height $d$ above the surface. What is $\sigma$?`,
      visual: { type: 'c3-contour', params: { f: halfSpace(1, -1), x: [-3.2, 3.2], y: [-3.8, 0.2], levels: [0.08, 0.15, 0.25, 0.4, 0.7, 1.2], labels: false, curves: [surfaceLine], points: [{ x: 0, y: -1, label: 'source', color: 'warn' }] }, caption: 'Contours of the steady temperature rise below ground (the surface, gold, is at the top). Uniform conductivity assumed; the picture is a vertical slice through the source.' },
      choices: [t`$\sigma = -1$: an equal heat sink as the image`, t`$\sigma = +1$: an equal heat source as the image`, t`$\sigma = 0$: the free-space solution already works`, t`$\sigma = -\tfrac12$`],
      answer: 0,
      why: {
        1: 'A same-sign image makes the surface’s normal flux vanish — that is an insulated (Neumann) surface, the opposite situation.',
        2: t`Free space gives $\Delta T = Q/(4\pi k\,r_1) > 0$ everywhere, so the surface would warm up — it does not meet the condition.`,
        3: t`On the surface $r_1 = r_2$, so the bracket is $(1 + \sigma)/r_1$; only $\sigma = -1$ makes it zero everywhere on the surface.`,
      },
      hints: [t`On the surface every point is equally far from the source and its image: $r_1 = r_2$.`],
      teach: 'An image of opposite sign makes the potential vanish on a plane (Dirichlet); an image of the same sign makes its normal derivative vanish (Neumann).',
      explain: t`With $\sigma = -1$ the bracket $1/r_1 - 1/r_2$ is zero on the surface and the sum still solves Poisson’s equation below ground (the image lies outside that region). By uniqueness (lesson B6.2) it is *the* solution. $\frac{1}{4\pi}\big(\frac{1}{r_2} - \frac{1}{r_1}\big)$ is the **Dirichlet Green’s function** of the half-space — the same construction as the grounded plane of [the method of images](#/lesson/phys3600.M4.2).`,
    }),
    num({
      id: 'buried-heater', difficulty: 3,
      gen(r) {
        const Q = r.pick([20, 50, 80]), k = r.pick([0.8, 1.2, 2.0]), d = r.pick([0.8, 1, 1.5]);
        const r1 = d / 2, r2 = 1.5 * d, dT = (Q / (4 * Math.PI * k)) * (1 / r1 - 1 / r2);
        return {
          prompt: t`An instrument box buried ${d} m deep in soil ($k = ${k}$ W/(m K)) dissipates $Q = ${Q}$ W. The ground surface is held at a fixed temperature by the air. Treating the box as a point source, find the steady temperature rise of the soil **halfway between the box and the surface**, directly above the box, in kelvin.`,
          visual: { type: 'c3-contour', params: { f: halfSpace(1, -1), x: [-3.2, 3.2], y: [-3.8, 0.2], levels: [0.08, 0.15, 0.25, 0.4, 0.7, 1.2], labels: false, curves: [surfaceLine], points: [{ x: 0, y: -1, label: 'box', color: 'warn' }, { x: 0, y: -0.5, label: 'halfway', color: 'gold', labelDx: 10 }] }, caption: 'The steady temperature rise in a vertical slice (shape only; no values shown). Uniform soil, a point source, and a surface at fixed temperature are assumed.' },
          answer: dT, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: Q / (4 * Math.PI * k * r1), feedback: 'Without the image the surface would warm up. Subtract the image sink’s contribution, at distance 3d/2.' }, { value: (Q / (4 * Math.PI * k)) * (1 / r1 + 1 / r2), feedback: 'A fixed-temperature surface needs an image of the opposite sign: a sink.' }],
          hints: [t`$\Delta T = \dfrac{Q}{4\pi k}\Big(\dfrac{1}{r_1} - \dfrac{1}{r_2}\Big)$ with $r_1$ to the box and $r_2$ to the image a height $d$ above the surface.`, t`Halfway up: $r_1 = d/2$, and the image is $d/2 + d = 3d/2$ away.`],
          teach: 'With an image sink above a fixed-temperature surface, the steady temperature is the difference of two point-source kernels.',
          explain: t`$\Delta T = \dfrac{${Q}}{4\pi(${k})}\Big(\dfrac{1}{${r3(r1)}} - \dfrac{1}{${r3(r2)}}\Big) = ${r3(dT)}$ K. The image takes away a third of what the box alone would give there ($1/r_2 = \tfrac13\cdot1/r_1$). Near the box itself the image barely matters; near the surface it cancels the source completely.`,
        };
      },
    }),
    code({
      id: 'ball-sum', difficulty: 3,
      prompt: t`Check the shell theorem by brute force: build a uniform ball of radius 1 and total mass 1 from point masses on a cubic grid, and add up their point-mass potentials (units $G = 1$).

1. Cell centres \`c = -1 + h*(np.arange(n) + 0.5)\` with $n = 40$, $h = 2/n$; keep the points with $x^2 + y^2 + z^2 \le 1$, each with mass $1/(\text{number kept})$.
2. Write \`phi(p)\` returning $-\sum_i m_i/|\mathbf p - \mathbf x_i|$ at the point \`p\`.

Outside, the answer should be $-1/r$; at the centre it should be $-\tfrac32$ (lesson B5.2).`,
      starter: t`import numpy as np

n = 40
h = 2 / n
c = -1 + h * (np.arange(n) + 0.5)
X, Y, Z = np.meshgrid(c, c, c, indexing='ij')
# keep the cells inside the ball; give each mass 1/(number kept)

def phi(p):
    pass

print(phi((2, 0, 0)), phi((0, 0, 0)))
`,
      answer: t`import numpy as np

n = 40
h = 2 / n
c = -1 + h * (np.arange(n) + 0.5)
X, Y, Z = np.meshgrid(c, c, c, indexing='ij')
inside = X**2 + Y**2 + Z**2 <= 1
xs, ys, zs = X[inside], Y[inside], Z[inside]
m = 1 / xs.size

def phi(p):
    r = np.sqrt((xs - p[0])**2 + (ys - p[1])**2 + (zs - p[2])**2)
    return -np.sum(m / r)

print(phi((2, 0, 0)), phi((0, 0, 0)))`,
      tests: [
        { name: t`outside, at $r = 2$: within $10^{-4}$ of $-1/2$`, code: 'phi((2, 0, 0)) is not None and abs(phi((2, 0, 0)) + 0.5) < 1e-4' },
        { name: t`outside, in another direction ($r = 3$): within $10^{-4}$ of $-1/3$`, code: 'abs(phi((0, 3, 0)) + 1/3) < 1e-4 and abs(phi((1.5, 1.0, 0.3)) + 1/np.sqrt(1.5**2 + 1 + 0.09)) < 1e-4' },
        { name: t`at the centre: within 0.3% of $-3/2$`, code: 'abs(phi((0, 0, 0)) + 1.5) < 0.0045' },
      ],
      hints: ['`inside = X**2 + Y**2 + Z**2 <= 1`, then `xs, ys, zs = X[inside], Y[inside], Z[inside]`.', 'Each kept point has mass `m = 1 / xs.size`.', 'In `phi`, the distances are `np.sqrt((xs - p[0])**2 + (ys - p[1])**2 + (zs - p[2])**2)`; return `-np.sum(m / r)`.'],
      teach: 'A solution of Poisson’s equation is a sum of point-source Green’s functions — and summing them on a computer works.',
      explain: t`About 33 500 point masses reproduce $-1/r$ outside to about $10^{-5}$ — the shell theorem, here an output rather than an input — and give $-1.4989$ at the centre against the exact $-1.5$. The small error comes from the cells nearest the centre, where $1/r$ varies fastest across a cell. N-body codes and the potential solvers of galaxy simulations do this sum (made fast by tree or FFT methods).`,
    }),
    mcq({
      id: 'far-field', difficulty: 2,
      prompt: t`A lumpy asteroid of mass $M$ has a complicated shape. Far away — at distances much larger than its size — what does its potential look like?`,
      visual: { type: 'c3-contour', params: { f: `-(${rod(5)})`, x: [-3.2, 3.2], y: [-2, 2], levels: [-2.5, -1.6, -1.1, -0.8, -0.6, -0.45, -0.35], labels: false }, caption: 'The potential of five point masses in a row (units G = total mass = 1): ovals close in, nearly circles farther out.' },
      choices: [t`$-GM/r$, as if all the mass were at its centre of mass, with corrections that fall off faster with distance`, 'It keeps the shape of the asteroid at every distance', t`It falls off as $1/r^2$`, t`Exactly $-GM/r$ at every distance outside the asteroid`],
      answer: 0,
      why: {
        1: t`Each point mass contributes $-Gm/|\mathbf x - \mathbf x'|$; when $|\mathbf x| \gg |\mathbf x'|$ every term tends to $-Gm/|\mathbf x|$ whatever $\mathbf x'$ is, so the shape fades out of the sum.`,
        2: t`$1/r^2$ is how the *field* falls off; the potential falls off as $1/r$.`,
        3: 'Exactness outside holds only for spherical symmetry (the shell theorem). A lumpy body has quadrupole and higher terms that matter close in.',
      },
      hints: [t`In $\Phi = -G\int\rho(\mathbf x')/|\mathbf x - \mathbf x'|\,d^3x'$, what does $|\mathbf x - \mathbf x'|$ become when $|\mathbf x|$ is huge?`],
      teach: 'Far from any lump of mass, the Green’s-function sum is dominated by its total: Φ ≈ −GM/r, the monopole.',
      explain: t`For $r \gg$ the size $a$, $\dfrac{1}{|\mathbf x - \mathbf x'|} = \dfrac{1}{r} + \dfrac{\hat{\mathbf x}\cdot\mathbf x'}{r^2} + \ldots$; the first term sums to $-GM/r$, the dipole term vanishes about the centre of mass, and the quadrupole correction is of relative size $(a/r)^2$. This is the **multipole expansion** ([PHYS 3600](#/lesson/phys3600.M4.5)), the reason spacecraft navigating near an asteroid must map its gravity field close in.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-anomaly', difficulty: 3, transfer: true,
      gen(r) {
        const half = r.pick([1.5, 2.4, 3, 6]);
        const d = half / Math.sqrt(2 ** (2 / 3) - 1);
        return {
          prompt: t`A gravity survey crosses a buried dense body, modelled as a point excess mass $\Delta M$ at depth $d$. Its pull adds $\Delta g(x) = \dfrac{G\,\Delta M\,d}{(x^2 + d^2)^{3/2}}$ to the vertical gravity at horizontal distance $x$ — the vertical derivative of the point-mass potential. The anomaly falls to half its peak value at $x = ${half}$ km from the peak. How deep is the body, in kilometres?`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-0.05, 1.15], aspect: 'wide', xlabel: 'x (in units of the half-width)', ylabel: 'Δg / peak', axesAt: 'edge', curves: [{ fn: `1/(1 + (0.7664*x)^2)^1.5`, color: 'accent', width: 2.6 }], hlines: [{ y: 0.5, color: 'gold' }], vlines: [{ x: -1, color: 'gold' }, { x: 1, label: 'half-width', color: 'gold' }] }, caption: 'The anomaly of a buried point mass against horizontal distance, scaled to its peak. A real body has a size and a density contrast; the point model fits only when the body is small compared with its depth.' },
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: half, feedback: t`The half-width is not the depth: solve $(x^2 + d^2)^{3/2} = 2d^3$.` }, { value: half / Math.sqrt(Math.SQRT2 - 1), feedback: t`The exponent is 3/2: $(x^2 + d^2) = 2^{2/3}d^2$, not $\sqrt2\,d^2$.` }],
          hints: [t`The peak is at $x = 0$: $\Delta g(0) = G\Delta M/d^2$. Set $\Delta g(x) = \tfrac12\Delta g(0)$.`, t`$\dfrac{d^3}{(x^2 + d^2)^{3/2}} = \dfrac12$ gives $x^2 + d^2 = 2^{2/3}d^2$.`, t`$d = x_{1/2}/\sqrt{2^{2/3} - 1} = x_{1/2}/0.766$.`],
          teach: 'The shape of a gravity anomaly encodes the depth of its source: the deeper the point mass, the wider and flatter the bump.',
          explain: t`$d = \dfrac{${half}}{\sqrt{2^{2/3} - 1}} = \dfrac{${half}}{0.766} = ${r3(d)}$ km. The same rule of thumb is used on the Moon: GRAIL’s maps of the lunar field show **mascons**, dense lumps under the maria, whose anomaly widths constrain their depths.`,
        };
      },
    }),
    mcq({
      id: 'cp-neumann', difficulty: 2,
      prompt: t`A heat source sits a distance $d$ from a flat **insulated** wall (no heat crosses it: the normal derivative of the temperature vanishes there). Which image reproduces that condition?`,
      visual: { type: 'c3-contour', params: { f: halfSpace(1, 1), x: [-3.2, 3.2], y: [-3.8, 0.2], levels: [0.3, 0.45, 0.6, 0.8, 1.1, 1.6], labels: false, curves: [surfaceLine], points: [{ x: 0, y: -1, label: 'source', color: 'warn' }] }, caption: 'Contours of the steady temperature rise on the source’s side of the wall (gold, at the top). Uniform conductivity assumed.' },
      choices: ['an equal source at the mirror point', 'an equal sink at the mirror point', 'no image: an insulated wall changes nothing', 'a source of half the strength at the mirror point'],
      answer: 0,
      why: {
        1: 'An opposite image sets the temperature rise to zero on the wall — a wall held at fixed temperature, where heat pours out.',
        2: 'Without an image, heat would flow straight through the wall’s position; the wall reflects it back.',
        3: 'The two contributions to the normal derivative cancel only if they are equal and of the same sign.',
      },
      hints: ['On the wall, the source’s flux points away from it; the image’s must point back by the same amount.'],
      teach: 'A same-sign image makes the normal derivative vanish on the mirror plane: the Neumann Green’s function.',
      explain: t`By symmetry the sum of a source and its equal mirror twin has zero gradient across the mirror plane: no heat crosses it. The wall traps the heat on one side, so near the wall it is **twice** as warm as the source alone would make it — contours meet the wall at right angles.`,
    }),
    num({
      id: 'cp-l1-sun', difficulty: 2,
      gen(r) {
        const x = r.pick([1.5e9, 3e9, 1e9]);
        const phi = -SUN.GM / (SUN.AU - x) - EARTH.GM / x;
        return {
          prompt: t`The space telescope SOHO watches the Sun from near the Sun–Earth L1 point. Treat a spacecraft $${tex(x)}$ m sunward of Earth as sitting on the line between point masses ($GM_\odot = ${tex(SUN.GM)}$, $GM_E = ${tex(EARTH.GM)}\ \text{m}^3/\text{s}^2$, 1 AU $= ${tex(SUN.AU)}$ m). What is its gravitational potential, in MJ/kg?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.15, 0.1], aspect: 'wide', xlabel: 'from the Sun to Earth (fraction of 1 AU)', ylabel: 'Φ (scaled)', axesAt: 'edge', yticks: 0, curves: [{ fn: '-0.12/max(x, 0.08) - 0.0006/max(abs(1 - x), 0.0005)', color: 'accent', width: 2.4 }], vlines: [{ x: 1 - x / SUN.AU, label: 'spacecraft', color: 'gold' }] }, caption: 'The potential along the Sun–Earth line, scaled; Earth’s dip is too narrow to see at this scale. Orbital motion (the centrifugal term that makes L1 an equilibrium) is left out.' },
          answer: phi / 1e6, units: 'MJ/kg', tol: { rel: 0.005 },
          errors: [{ value: -SUN.GM / (SUN.AU - x) / 1e6, feedback: 'Add Earth’s term too: every mass contributes its own −GM/r.' }, { value: -SUN.GM / SUN.AU / 1e6 - EARTH.GM / x / 1e6, feedback: 'The spacecraft is nearer the Sun than Earth is: its distance from the Sun is 1 AU minus its distance from Earth.' }].filter((e) => Math.abs(e.value - phi / 1e6) > 0.006 * Math.abs(phi / 1e6)),
          hints: [t`$\Phi = -\dfrac{GM_\odot}{1\,\text{AU} - x} - \dfrac{GM_E}{x}$.`],
          teach: 'Superposition of point-mass potentials: each body adds its own Green’s function.',
          explain: t`$-\dfrac{${tex(SUN.GM)}}{${tex(SUN.AU - x)}} - \dfrac{${tex(EARTH.GM)}}{${tex(x)}} = ${tex(phi)}$ J/kg $\approx ${r3(phi / 1e6)}$ MJ/kg. The Sun’s term dominates by a factor of about ${Math.round((SUN.GM / (SUN.AU - x)) / (EARTH.GM / x))}, yet Earth’s small share, with the orbital motion, is what makes L1 a place a spacecraft can stay.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'J. D. Jackson, Classical Electrodynamics, 3rd ed. (Wiley, 1999), §1.7–1.10 and ch. 2', url: 'https://openlibrary.org/isbn/9780471309321' }, { label: 'Zuber et al., Gravity field of the Moon from the GRAIL mission, Science 339, 668 (2013)', url: 'https://doi.org/10.1126/science.1231507' }],
});
