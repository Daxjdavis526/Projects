// Mass, moments and moments of inertia — past Physics I: densities that vary
// from place to place, a satellite's principal moments, and the inertia
// tensor (L = Iω is not parallel to ω), a first rank-2 tensor for the GR track.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { boxesPic, regionPic, r6 } from './_integrals.js';

const t = String.raw;

// the box satellite of the Explore: 10 cm × 22.6 cm × 34 cm, 8 kg, uniform
const SAT = { a: 0.1, b: 0.226, c: 0.34, m: 8 };
const IX = (SAT.m * (SAT.b ** 2 + SAT.c ** 2)) / 12, IY = (SAT.m * (SAT.a ** 2 + SAT.c ** 2)) / 12, IZ = (SAT.m * (SAT.a ** 2 + SAT.b ** 2)) / 12;

// a box centred on the origin, half-sides hx, hy, hz (drawing units), as translucent faces
const boxFaces = (hx, hy, hz, color = 'accent', alpha = 0.1) => [
  { at: [-hx, -hy, -hz], u: [2 * hx, 0, 0], v: [0, 2 * hy, 0] }, { at: [-hx, -hy, hz], u: [2 * hx, 0, 0], v: [0, 2 * hy, 0] },
  { at: [-hx, -hy, -hz], u: [2 * hx, 0, 0], v: [0, 0, 2 * hz] }, { at: [-hx, hy, -hz], u: [2 * hx, 0, 0], v: [0, 0, 2 * hz] },
  { at: [-hx, -hy, -hz], u: [0, 2 * hy, 0], v: [0, 0, 2 * hz] }, { at: [hx, -hy, -hz], u: [0, 2 * hy, 0], v: [0, 0, 2 * hz] },
].map((f) => ({ ...f, color, alpha }));
// ω = (sin α cos β, sin α sin β, cos α) and L = (Ix ωx, Iy ωy, Iz ωz), as expressions of the sliders al, be (degrees)
const W = ['sin(al*pi/180)*cos(be*pi/180)', 'sin(al*pi/180)*sin(be*pi/180)', 'cos(al*pi/180)'];
const L = [`Ix*${W[0]}`, `Iy*${W[1]}`, `Iz*${W[2]}`];
const LDOTW = `(Ix*(${W[0]})^2 + Iy*(${W[1]})^2 + Iz*(${W[2]})^2)`;
const LMAG = `sqrt((Ix*${W[0]})^2 + (Iy*${W[1]})^2 + (Iz*${W[2]})^2)`;

// rings that each enclose an equal extra share of a disk's mass: uniform (r ∝ √k) or σ ∝ r (r ∝ ∛k)
const massRings = (cx, R, power, n = 6, color = 'accent') => Array.from({ length: n }, (_, k) => {
  const r = r6(R * ((k + 1) / n) ** power);
  return { param: [`${cx} + ${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color, width: k === n - 1 ? 2.2 : 1.1 };
});

export default lesson({
  id: 'math2210.C3-4.7',
  title: 'Mass, moments and moments of inertia',
  minutes: 14, difficulty: 3,
  intro: t`A body's mass, centre of mass and moment of inertia are integrals of its density $\rho$ — and the density need not be uniform:

$$m = \iiint_E \rho\,dV, \qquad \bar x = \frac{1}{m}\iiint_E x\,\rho\,dV, \qquad I_z = \iiint_E (x^2 + y^2)\,\rho\,dV$$

(for a thin plate, use the areal density $\sigma$ and $dA$). Physics I found these for uniform rods, disks and spheres. Here the density varies — a planet is denser at its core — and the body need not be symmetric about the spin axis. Then **the moment of inertia is more than one number**: spin a box-shaped satellite about a tilted axis and its angular momentum $\vec L$ does not point along its angular velocity $\vec\omega$. The moments and "products" of inertia form a $3\times3$ array, the **inertia tensor**, with $L_x = I_{xx}\omega_x + I_{xy}\omega_y + I_{xz}\omega_z$ and so on — the first rank-2 tensor most physicists meet.`,
  symbols: [
    { tex: '\\rho(x, y, z)', text: 'the density, in kg/m³ (for a plate, the areal density σ in kg/m²); it may vary from point to point' },
    { tex: 'm', text: t`the mass, in kg: the density added up over the body` },
    { tex: '\\bar x', text: t`the $x$-coordinate of the **centre of mass**: the density-weighted average of $x$ ($\bar y$, $\bar z$ likewise)` },
    { tex: 'I_z', text: t`the moment of inertia about the $z$-axis, in kg·m²: each bit of mass times the square of its distance from the axis, $x^2 + y^2$` },
    { tex: 'I_{ij}', text: t`the **inertia tensor**: $I_{xx} = \iiint \rho\,(y^2 + z^2)\,dV$ on the diagonal, the **products of inertia** $I_{xy} = -\iiint \rho\,xy\,dV$ off it. It turns $\vec\omega$ into $\vec L$` },
  ],
  why: t`Every satellite's attitude control, every planet's precession and every spinning top is governed by the inertia tensor — the same kind of object, a symmetric array of components, as general relativity's metric and stress–energy tensor.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'Spin is not angular momentum',
    lead: t`A box-shaped satellite, 10 cm × 22.6 cm × 34 cm and 8 kg, treated as uniform. Its principal moments are $I_{xx} = ${fmt(IX, 3)}$, $I_{yy} = ${fmt(IY, 3)}$ and $I_{zz} = ${fmt(IZ, 4)}$ kg·m². Aim its spin $\vec\omega$ (gold, $1$ rad/s) with the sliders: the angular momentum $\vec L = (I_{xx}\omega_x,\ I_{yy}\omega_y,\ I_{zz}\omega_z)$ (blue) leans toward the axes where the moment of inertia is larger.`,
    tasks: [
      t`Point $\vec\omega$ along an axis of the box ($\alpha = 0$, or $\alpha = 90^\circ$ with $\beta = 0$ or $90^\circ$): $\vec L$ lies exactly along $\vec\omega$. These are the **principal axes**, the only directions in which $\vec L \parallel \vec\omega$.`,
      t`Tilt $\vec\omega$ halfway between the long $z$-axis and the $x$-axis ($\alpha = 45^\circ$, $\beta = 0$): $\vec L$ swings about $25^\circ$ toward $x$, where the mass is spread farthest from the axis. In space $\vec L$ is what stays fixed, so a satellite spun like this wobbles.`,
      t`Compare $|\vec L|$ for a spin about $x$ and about $z$: the same $1$ rad/s carries almost three times the angular momentum about $x$.`,
    ],
    params: {
      range: 2.3, scale: 1.5, grid: false,
      constants: { Ix: r6(IX), Iy: r6(IY), Iz: r6(IZ) },
      sliders: [
        { key: 'al', label: 'Tilt from the long axis, $\\alpha$', min: 0, max: 90, step: 1, value: 45, unit: '^\\circ', explain: 'The angle between $\\vec\\omega$ and the box’s long ($z$) axis.' },
        { key: 'be', label: 'Direction around it, $\\beta$', min: 0, max: 90, step: 1, value: 0, unit: '^\\circ', explain: 'From the $x$-axis ($0$, the thin side) round to the $y$-axis ($90^\\circ$).' },
      ],
      parallelograms: boxFaces(0.5, 1.13, 1.7),
      vectors: [
        { to: W.map((w) => `2*${w}`), color: 'gold', label: '\\vec\\omega' },
        { to: L.map((l) => `2*(${l})/Ix`), color: 'accent', label: '\\vec L' },
      ],
      readouts: [
        { label: 'angle between $\\vec L$ and $\\vec\\omega$', expr: `acos(${LDOTW}/${LMAG})*180/pi`, unit: '^\\circ', digits: 3 },
        { label: '$|\\vec L|$ for $|\\vec\\omega| = 1$ rad/s', expr: LMAG, unit: '\\mathrm{kg\\,m^2/s}', digits: 3 },
      ],
    },
    caption: 'Drag to rotate. The box is drawn to scale (one unit = 10 cm); the arrows are scaled so that ω and L have the same length when ω points along x. A uniform box is a model: a real satellite’s mass sits in batteries, tanks and electronics.',
  },
  example: {
    prompt: t`(a) Show that for a ball whose density depends only on $r$, $I_z = \dfrac{8\pi}{3}\displaystyle\int_0^R \rho(r)\,r^4\,dr$, and that a uniform ball has $I = \tfrac25 MR^2$. (b) For the Earth model of lesson C3-4.5 — density falling linearly from $13\,000$ kg/m³ at the centre to $3000$ kg/m³ at the surface — find the **moment-of-inertia factor** $I/(MR^2)$.`,
    visual: { type: 'graph', params: { x: [0, 1.04], y: [-0.05, 1.12], aspect: 'wide', xlabel: 'r / R', ylabel: '', curves: [{ fn: '1 - 10*x/13', domain: [0, 1], color: 'accent', label: 'density ρ(r) / ρc', labelAt: 0.1, labelDx: 6, labelDy: -12 }, { fn: 'x^4*(13 - 10*x)/3', domain: [0, 1], color: 'violet', label: 'contribution to I per shell (scaled)', labelAt: 0.55, labelDx: 8, labelDy: 16 }] }, caption: t`The linear Earth model (blue) and how much each thin shell adds to $I$, $\propto r^4\rho(r)\,dr$ (violet, scaled to peak at 1): the moment of inertia is made almost entirely in the outer half. A teaching model, not the measured profile.` },
    steps: [
      { label: 'Symmetry', text: t`Add the three moments: $I_x + I_y + I_z = \iiint \rho\,\big[(y^2 + z^2) + (x^2 + z^2) + (x^2 + y^2)\big]dV = 2\iiint \rho\,r^2\,dV$. For a spherically symmetric body all three are equal, so $I_z = \tfrac23\iiint \rho\,r^2\,dV$.` },
      { label: 'Shells', text: t`With $dV = 4\pi r^2\,dr$ for a shell, $I_z = \tfrac23\displaystyle\int_0^R \rho\,r^2\cdot4\pi r^2\,dr = \frac{8\pi}{3}\int_0^R \rho(r)\,r^4\,dr$.` },
      { label: 'Uniform ball', text: t`$I = \frac{8\pi}{3}\rho\frac{R^5}{5} = \frac25\left(\frac{4\pi}{3}\rho R^3\right)R^2 = \frac25 MR^2$ — Physics I's result, now derived.` },
      { label: 'The Earth model', text: t`With $\rho = \rho_c - \Delta\,\frac{r}{R}$, $\Delta = 10\,000$: $\displaystyle\int_0^R \rho\,r^4\,dr = R^5\left(\frac{\rho_c}{5} - \frac{\Delta}{6}\right) = 933.3\,R^5$, and from lesson C3-4.5, $M = 4\pi(1833.3)R^3$. So
$$\frac{I}{MR^2} = \frac{\frac{8\pi}{3}\,933.3}{4\pi\,(1833.3)} = 0.339.$$` },
      { label: 'Sense check', text: t`A uniform ball gives $0.4$; concentrating mass toward the centre lowers the factor. Earth's measured value, from its precession and from satellite gravity data, is $0.331$ — lower still, because the real core is denser than this smooth model allows.` },
    ],
    answer: t`$I_z = \tfrac{8\pi}{3}\int_0^R \rho\,r^4\,dr$; a uniform ball has $I = \tfrac25 MR^2$; the linear Earth model gives $I/(MR^2) \approx 0.339$ (measured: $0.331$).`,
  },
  practice: [
    num({
      id: 'lamina-mass', difficulty: 1,
      gen(r) {
        const c = r.pick([2, 3, 5]), a = r.pick([1, 2]), b = r.pick([1, 1.5, 2]);
        const m = (c * a * a * b * b) / 4;
        return {
          prompt: t`A thin plate covers $0 \le x \le ${a}$ m, $0 \le y \le ${b}$ m, and its areal density is $\sigma(x, y) = ${c}\,xy$ kg/m² — heaviest at the corner $(${a}, ${b})$. What is its mass?`,
          answer: m, units: 'kg', tol: { rel: 1e-3 },
          errors: [{ value: c * a * b * a * b, feedback: t`That is the density at the heavy corner times the area. The density varies: integrate it.` }],
          hints: [t`$m = \displaystyle\iint_R ${c}\,xy\,dA$, and over a rectangle the product splits.`],
          teach: 'Mass is density integrated over the body; a density that varies is not the same as its largest value times the size.',
          explain: t`$m = ${c}\left(\int_0^{${a}} x\,dx\right)\left(\int_0^{${b}} y\,dy\right) = ${c}\cdot\frac{${a * a}}{2}\cdot\frac{${nice(b * b)}}{2} = ${nice(m)}$ kg — a quarter of what the plate would weigh at its corner density throughout.`,
          visual: boxesPic(`${c}*x*y`, [0, a], [0, b], { m: 6, n: 6, top: 0.8 * Math.max(a, b), caption: t`The areal density drawn as height (scaled to fit), standing on $6 \times 6$ cells of the plate. Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'com-triangle', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3, 4]);
        const xbar = (3 * a) / 4;
        return {
          prompt: t`A triangular plate occupies $0 \le y \le x \le ${a}$ m, and its areal density grows with $x$: $\sigma = kx$. Find $\bar x$, the $x$-coordinate of its centre of mass.`,
          answer: xbar, units: 'm', tol: { rel: 2e-3 },
          errors: [
            { value: (2 * a) / 3, feedback: t`That is the centroid of a **uniform** triangle. The density increases with $x$, pulling the centre of mass further out.` },
            { value: a / 2, feedback: t`That is the middle of the $x$-range. Both the triangle's shape and its density put more mass at large $x$.` },
          ],
          hints: [t`$m = \displaystyle\int_0^{${a}}\!\!\int_0^{x} kx\,dy\,dx$ and $M_y = \displaystyle\int_0^{${a}}\!\!\int_0^{x} x\cdot kx\,dy\,dx$; $k$ cancels.`, t`$m = \frac{k\cdot${a}^3}{3}$ and $M_y = \frac{k\cdot${a}^4}{4}$.`],
          teach: 'The centre of mass is the density-weighted average position: ∬ x σ dA divided by ∬ σ dA.',
          explain: t`$\bar x = \dfrac{k\,${a}^4/4}{k\,${a}^3/3} = \tfrac34\cdot${a} = ${nice(xbar)}$ m, beyond the uniform triangle's $\tfrac23\cdot${a} = ${nice(r6((2 * a) / 3))}$ m.`,
          visual: regionPic({ x: [-0.3 * a, 1.3 * a], y: [-0.2 * a, 1.15 * a],
            shade: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ fn: 'x', lower: '0', from: r6((k * a) / 8), to: r6(((k + 1) * a) / 8), color: 'accent', alpha: r6(0.08 + 0.07 * k) })),
            curves: [{ param: [`${a}*t`, `${a}*t`], t: [0, 1], color: 'accent' }, { param: [`${a}*t`, '0'], t: [0, 1], color: 'accent' }, { param: [`${a}`, `${a}*t`], t: [0, 1], color: 'accent' }],
            caption: t`The plate, shaded darker where it is denser. Equal scales.` }),
        };
      },
    }),
    mcq({
      id: 'which-larger', difficulty: 1,
      prompt: t`Two disks have the same mass $M$ and radius $R$. One is uniform; the other's areal density grows outward, $\sigma \propto r$. Which has the larger moment of inertia about its central axis?`,
      choices: ['The disk whose density grows outward', 'The uniform disk', 'Neither: same mass and radius, same moment of inertia', 'It cannot be told without the value of the density'],
      answer: 0,
      why: {
        1: 'The uniform disk keeps more of its mass near the axis, where it counts least.',
        2: t`$I$ depends on where the mass is, not only on how much: each bit counts with the square of its distance from the axis.`,
        3: t`Both have mass $M$ — that fixes the density's scale. Only its shape matters, and that is given.`,
      },
      hints: ['Which disk has more of its mass far from the axis?'],
      teach: 'Moving mass outward at fixed total mass raises the moment of inertia.',
      explain: t`With $\sigma \propto r$ the mass sits farther out, and $I = \iint r^2\sigma\,dA$ weights it by $r^2$. The next problem finds $I = \tfrac35 MR^2$, against $\tfrac12 MR^2$ for the uniform disk.`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.25, 1.35], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [...massRings(-1.3, 1, 0.5), ...massRings(1.3, 1, 1 / 3)], points: [{ x: -1.3, y: 1.2, r: 0.01, color: 'ink2', label: 'uniform', labelDx: -24 }, { x: 1.3, y: 1.2, r: 0.01, color: 'ink2', label: 'σ ∝ r', labelDx: -14 }, { x: -1.3, y: 0, r: 3, color: 'gold' }, { x: 1.3, y: 0, r: 3, color: 'gold' }] }, caption: 'The two disks, face on, with the axis through the gold dots. Each ring encloses one more sixth of the disk’s mass: the closer the rings crowd, the more mass lies there.' },
    }),
    num({
      id: 'disk-sigma-r', difficulty: 2,
      gen(r) {
        const M = r.pick([2, 5, 8]), R = r.pick([0.2, 0.3, 0.5]);
        const I = 0.6 * M * R * R;
        return {
          prompt: t`A ${M} kg disk of radius ${R} m has areal density $\sigma = \sigma_0\,r/R$, growing outward from its axis. Find its moment of inertia about that axis. (First find $\sigma_0$ from the mass.)`,
          answer: I, units: 'kg m^2', tol: { rel: 2e-3 },
          errors: [
            { value: 0.5 * M * R * R, feedback: t`That is the uniform disk, $\tfrac12 MR^2$. Here more mass lies far out.` },
            { value: M * R * R, feedback: t`That would put all the mass on the rim, like a hoop. The density grows outward, but there is still mass inside.` },
          ],
          hints: [
            t`In polar coordinates: $M = \displaystyle\int_0^{2\pi}\!\!\int_0^R \sigma_0\frac{r}{R}\,r\,dr\,d\theta = \frac{2\pi\sigma_0R^2}{3}$.`,
            t`$I = \displaystyle\int_0^{2\pi}\!\!\int_0^R r^2\cdot\sigma_0\frac{r}{R}\,r\,dr\,d\theta = \frac{2\pi\sigma_0R^4}{5}$. Divide one by the other.`,
          ],
          teach: 'For a radial density, I and M are both one-variable integrals in r, and their ratio needs no σ₀.',
          explain: t`$\dfrac{I}{M} = \dfrac{2\pi\sigma_0R^4/5}{2\pi\sigma_0R^2/3} = \tfrac35R^2$, so $I = \tfrac35 MR^2 = 0.6\times${M}\times${R}^2 = ${fmt(I, 3)}$ kg·m². Between the uniform disk ($0.5$) and the hoop ($1$).`,
          visual: { type: 'calc-polar', params: { grid: 'none', aspect: 'wide', x: [-1.4, 1.4], y: [-1.15, 1.15], fills: [0, 1, 2, 3, 4, 5].map((k) => ({ polar: `${r6((k + 1) / 6)}`, inner: `${r6(k / 6)}`, theta: [0, 6.2832], color: 'accent', alpha: r6(0.06 + 0.1 * k) })), curves: [{ polar: '1', theta: [0, 6.2832], color: 'accent' }], points: [{ x: 0, y: 0, color: 'gold', size: 4 }] }, caption: 'The disk face on, shaded darker where it is denser (σ ∝ r). The axis passes through the gold dot.' },
        };
      },
    }),
    num({
      id: 'cubesat', difficulty: 2,
      gen(r) {
        const m = r.pick([3, 4, 5]), axis = r.pick(['long', 'short']);
        const a = 0.1, c = 0.34;
        const I = axis === 'long' ? (m * (a * a + a * a)) / 12 : (m * (a * a + c * c)) / 12;
        return {
          prompt: t`A 3U CubeSat is roughly a ${m} kg box, 10 cm × 10 cm × 34 cm. Treating it as uniform, find its moment of inertia about the axis through its centre ${axis === 'long' ? 'along its **long** side' : 'parallel to one of its **short** sides'}.`,
          answer: I, units: 'kg m^2', tol: { rel: 2e-3 },
          errors: axis === 'long'
            ? [{ value: (m * (a * a + c * c)) / 12, feedback: t`That is the moment about a short axis. About the long axis, only the two short dimensions are distances from the axis: $\tfrac{m}{12}(a^2 + b^2)$ with $a = b = 0.1$ m.` }, { value: (m * (2 * a * a + c * c)) / 12, feedback: t`Only the two dimensions perpendicular to the axis enter: $x^2 + y^2$ is the squared distance from a $z$-axis.` }]
            : [{ value: (m * (2 * a * a)) / 12, feedback: t`That is the moment about the long axis. A short axis is perpendicular to the long side, so the 34 cm length counts.` }, { value: (m * (2 * a * a + c * c)) / 12, feedback: t`Only the two dimensions perpendicular to the axis enter, not all three.` }],
          hints: [t`For a uniform box with sides $a$, $b$, $c$ along $x$, $y$, $z$: $I_{zz} = \displaystyle\iiint \rho\,(x^2 + y^2)\,dV = \frac{m}{12}(a^2 + b^2)$.`, t`Use the two sides perpendicular to the axis, in metres.`],
          teach: 'About an axis through a uniform box’s centre, I = m(a² + b²)/12, with a and b the two sides perpendicular to the axis.',
          explain: t`$I = \tfrac{${m}}{12}\left(${axis === 'long' ? '0.1^2 + 0.1^2' : '0.1^2 + 0.34^2'}\right) = ${fmt(I, 3)}$ kg·m². ${axis === 'long' ? 'This is the smallest of its three principal moments: about the long axis, every bit of the CubeSat lies within 7 cm of the axis.' : 'That is more than six times the moment about the long axis, about which every bit of the CubeSat lies within 7 cm.'}`,
          visual: { type: 'mech-rotor', params: { shape: 'plate', M: m, L: axis === 'long' ? 0.1 : 0.34, W: 0.1, readouts: false, values: false, play: false, omega0: 0, lever: false }, caption: t`The CubeSat seen along the chosen axis (into the screen, through the centre): its cross-section is ${axis === 'long' ? '10 cm × 10 cm' : '34 cm × 10 cm'}.` },
        };
      },
    }),
    num({
      id: 'product', difficulty: 3,
      gen(r) {
        const m = r.pick([1, 2, 4]), a = r.pick([0.4, 0.6]), b = r.pick([0.2, 0.3, 0.5]);
        const Ixy = -(m * a * b) / 4;
        return {
          prompt: t`A uniform ${m} kg plate fills the rectangle $0 \le x \le ${a}$ m, $0 \le y \le ${b}$ m, so its corner is at the origin. Find the inertia-tensor entry $I_{xy} = -\displaystyle\iint \sigma\,xy\,dA$ for axes through that corner.`,
          answer: Ixy, units: 'kg m^2', tol: { rel: 2e-3 },
          errors: [{ value: -m * a * b, feedback: t`$\int_0^{${a}} x\,dx = \tfrac{${a}^2}{2}$: with $\sigma = m/(ab)$, the result is $-\tfrac{m\,ab}{4}$.` }],
          hints: [t`The density is $\sigma = \dfrac{m}{ab}$, constant.`, t`$\displaystyle\iint xy\,dA = \frac{a^2}{2}\cdot\frac{b^2}{2}$; multiply by $\sigma$ and change the sign.`],
          teach: 'A product of inertia measures how mass is spread off the axes; it vanishes for axes of symmetry and not otherwise.',
          explain: t`$I_{xy} = -\frac{${m}}{${a}\times${b}}\cdot\frac{${a}^2}{2}\cdot\frac{${b}^2}{2} = -\frac{m\,ab}{4} = ${fmt(Ixy, 3)}$ kg·m². It is not zero, so the corner's $x$- and $y$-axes are not principal axes: spun about the $x$-axis through the corner, the plate's $\vec L$ tilts out of line with $\vec\omega$. Through the plate's centre, $\iint xy\,dA = 0$ by symmetry.`,
          visual: regionPic({ x: [-0.15, a + 0.2], y: [-0.15, b + 0.15], shade: [{ fn: String(b), lower: '0', from: 0, to: a, alpha: 0.3 }], points: [{ x: 0, y: 0, color: 'gold', r: 4, label: 'corner', labelDx: 8, labelDy: 14 }], caption: t`The plate in the $xy$-plane, with the axes through its corner. Equal scales.` }),
        };
      },
    }),
    mcq({
      id: 'tensor', difficulty: 3,
      prompt: t`A rigid body spins with angular velocity $\vec\omega$ along a direction that is **not** one of its principal axes. Which statement is right?`,
      choices: [
        t`$\vec L$ is not parallel to $\vec\omega$; with no torque, $\vec L$ stays fixed and $\vec\omega$ moves: the body wobbles`,
        t`$\vec L = I\vec\omega$ is parallel to $\vec\omega$, with $I$ the moment about the spin axis, as for a wheel on an axle`,
        t`$\vec L$ is zero, because the products of inertia cancel the principal moments exactly`,
        t`$\vec L$ is parallel to $\vec\omega$, with $I$ the average of the three principal moments`,
      ],
      answer: 0,
      why: {
        1: 'A wheel on an axle spins about a principal axis — its axle is a symmetry axis, so L happens to be parallel to ω. Off a principal axis the products of inertia tip L away.',
        2: 'The moments on the diagonal are positive and dominate; L vanishes only if ω does.',
        3: 'No single number turns ω into L in a general direction: that takes the whole 3 × 3 array.',
      },
      hints: [t`In general $L_i = \sum_j I_{ij}\,\omega_j$. In principal axes that is $\vec L = (I_1\omega_1, I_2\omega_2, I_3\omega_3)$: when is it a multiple of $(\omega_1, \omega_2, \omega_3)$?`, t`Only when $\vec\omega$ lies along one principal axis (or the moments involved are equal). Otherwise the components are stretched by different amounts.`],
      teach: 'The inertia tensor maps ω to L by stretching different directions by different amounts, so L and ω are parallel only along principal axes.',
      explain: t`In principal axes $\vec L = (I_1\omega_1, I_2\omega_2, I_3\omega_3)$, which points along $\vec\omega$ only if the stretch factors are equal. The inertia tensor is a linear map, a symmetric $3\times3$ array — a **rank-2 tensor**. Its second moments of mass, $\iiint \rho\,x_ix_j\,dV$, reappear in the quadrupole formula for gravitational waves (equation dissection EQ.13), and general relativity's metric $g_{\mu\nu}$ is a symmetric array of the same kind, $4\times4$.`,
      visual: { type: 'calc-vectors3d', params: { range: 2.3, scale: 1.5, grid: false, parallelograms: boxFaces(0.5, 1.13, 1.7), vectors: [{ to: [1.414, 0, 1.414], color: 'gold', label: '\\vec\\omega' }, { to: [r6(2 * Math.SQRT1_2), 0, r6((2 * Math.SQRT1_2 * IZ) / IX)], color: 'accent', label: '\\vec L' }] }, caption: 'The Explore’s satellite spinning about an axis halfway between two of its principal axes, with ω and L drawn from its centre. Drag to rotate.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-core', difficulty: 3, transfer: true,
      gen(r) {
        const q = r.pick([0.3, 0.4, 0.5, 0.55]), k = r.pick([2, 2.5, 3]);
        const f = (0.4 * (1 + (k - 1) * q ** 5)) / (1 + (k - 1) * q ** 3);
        return {
          prompt: t`A rocky planet is modelled as a uniform core of radius ${q}$R$ and density ${k}$\rho_m$, inside a uniform mantle of density $\rho_m$. Find its moment-of-inertia factor $I/(MR^2)$.`,
          answer: f, tol: { rel: 2e-3 },
          errors: [{ value: 0.4, feedback: t`$0.4$ is a uniform ball. A dense core puts mass near the axis and lowers the factor.` }],
          hints: [
            t`Think of the planet as a uniform ball of density $\rho_m$ plus an extra ball of density $(${k} - 1)\rho_m$ and radius ${q}$R$: masses and moments add.`,
            t`$M \propto R^3\left[1 + (${k} - 1)(${q})^3\right]$ and $I \propto \tfrac25 R^5\left[1 + (${k} - 1)(${q})^5\right]$, with the same constant.`,
          ],
          teach: 'Moments of inertia add, so a layered body is a sum of uniform balls; a dense centre lowers I/(MR²) below 0.4.',
          explain: t`$\dfrac{I}{MR^2} = 0.4\cdot\dfrac{1 + (${k} - 1)(${q})^5}{1 + (${k} - 1)(${q})^3} = ${fmt(f, 3)}$. Measured factors: about $0.331$ for Earth (iron core, about half its radius) and about $0.393$ for the Moon (a small core) — this is how we know their insides without going there.`,
          visual: { type: 'calc-polar', params: { grid: 'none', aspect: 'wide', x: [-1.4, 1.4], y: [-1.15, 1.15], fills: [{ polar: '1', inner: `${q}`, theta: [0, 6.2832], color: 'warn', alpha: 0.18 }, { polar: `${q}`, theta: [0, 6.2832], color: 'warn', alpha: r6(0.18 * k) }], curves: [{ polar: '1', theta: [0, 6.2832], color: 'warn' }, { polar: `${q}`, theta: [0, 6.2832], color: 'warn', width: 1.6 }] }, caption: t`The model planet in cross-section: a core ${k} times as dense as the mantle, ${q} of the way out. Not a measured profile.` },
        };
      },
    }),
    mcq({
      id: 'cp-explorer', difficulty: 3, transfer: true,
      prompt: t`America's first satellite, Explorer 1 (1958), was a long, thin cylinder with four flexible wire antennas. It was spun about its long axis — the axis of **smallest** moment of inertia. Soon after launch it was found tumbling end over end. Why?`,
      choices: [
        t`The flexing antennas dissipated energy while $L$ stayed fixed; at fixed $L$ the kinetic energy $L^2/2I$ is least for the axis of largest $I$, so the spin drifted there`,
        'Air drag at its altitude exerted a torque that flipped it',
        'The long axis was its intermediate axis, which is always unstable',
        'Flexing antennas changed its angular momentum',
      ],
      answer: 0,
      why: {
        1: 'Drag would slow the spin, not move it to another axis — and the change was quick and complete.',
        2: 'A long thin cylinder’s long axis is its axis of smallest moment, not the intermediate one. (Spin about an intermediate axis is unstable even without losses: the "tennis racket" effect.)',
        3: 'Internal forces cannot change a body’s total angular momentum; they can only trade energy into heat.',
      },
      hints: [t`With no external torque, which quantity is conserved exactly: $L$ or the kinetic energy?`, t`$K = \dfrac{L^2}{2I}$: if $K$ drains away while $L$ is fixed, which way must $I$ go?`],
      teach: 'With energy loss and no torque, a body ends up spinning about its axis of largest moment of inertia — the major-axis rule.',
      explain: t`$L$ is conserved, but internal flexing turns rotational energy into heat. At fixed $L$, $K = L^2/(2I)$ falls only if $I$ rises, so the spin migrates to the axis of largest moment — for a long cylinder, an axis across its middle: a flat spin. Spin-stabilised satellites since have been designed to spin about their major axis, or carry dampers that work with this rule.`,
      visual: { type: 'calc-vectors3d', params: { range: 2.4, scale: 1.45, grid: false, axes: false,
        curves: [...[-1.2, -0.4, 0.4, 1.2].map((z) => ({ param: ['0.3*cos(t)', '0.3*sin(t)', `${z}`], t: [0, 6.2832], color: 'accent', width: z === -1.2 || z === 1.2 ? 2 : 1 })), ...[0, 1.5708, 3.1416, 4.7124].map((p) => ({ param: [`0.3*cos(${p})`, `0.3*sin(${p})`, 't'], t: [-1.2, 1.2], color: 'accent', width: 1 }))],
        segments: [0.785, 2.356, 3.927, 5.498].map((p) => ({ from: [r6(0.3 * Math.cos(p)), r6(0.3 * Math.sin(p)), 0], to: [r6(1.6 * Math.cos(p)), r6(1.6 * Math.sin(p)), -0.5], color: 'ink3' })),
        vectors: [{ from: [0, 0, 1.25], to: [0, 0, 2.1], color: 'gold', label: '\\text{spun here}' }, { from: [0.35, 0, 0], to: [1.5, 0, 0], color: 'violet', label: '\\text{ended here}' }] },
        caption: 'A sketch of Explorer 1 (not to scale): the cylinder, its four whip antennas, the axis it was spun about (gold) and an axis of largest moment (violet). Drag to rotate.' },
    }),
    num({
      id: 'cp-nosecone', difficulty: 2,
      gen(r) {
        const h = r.pick([0.6, 0.9, 1.2, 1.5]);
        return {
          prompt: t`A solid nose cone of uniform density stands on its circular base, height $h = ${h}$ m. How far above the base is its centre of mass?`,
          answer: h / 4, units: 'm', tol: { rel: 2e-3 },
          errors: [
            { value: h / 3, feedback: t`$\tfrac{h}{3}$ is the centroid of a triangle — the cone's outline in a side view. In the solid cone, more mass sits near the base: the slices have area $\propto (1 - z/h)^2$.` },
            { value: h / 2, feedback: 'That is halfway up; the cone is much heavier near its base.' },
          ],
          hints: [t`Slice horizontally: at height $z$ the slice is a disk of radius $R(1 - z/h)$, with area $\pi R^2(1 - z/h)^2$.`, t`$\bar z = \dfrac{\int_0^h z\,(1 - z/h)^2\,dz}{\int_0^h (1 - z/h)^2\,dz}$.`],
          teach: 'For a solid of revolution, slice it into disks: the centre of mass is the slice-area-weighted average height.',
          explain: t`$\displaystyle\int_0^h z\left(1 - \tfrac{z}{h}\right)^2 dz = \frac{h^2}{12}$ and $\displaystyle\int_0^h \left(1 - \tfrac{z}{h}\right)^2 dz = \frac{h}{3}$, so $\bar z = \frac{h}{4} = ${nice(h / 4)}$ m above the base, whatever the base radius.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, scale: 1.5, grid: false, curves: [{ param: ['0.7*cos(t)', '0.7*sin(t)', '0'], t: [0, 6.2832], color: 'accent', width: 2 }, ...[0.25, 0.5, 0.75].map((f) => ({ param: [`${r6(0.7 * (1 - f))}*cos(t)`, `${r6(0.7 * (1 - f))}*sin(t)`, `${r6(1.5 * f)}`], t: [0, 6.2832], color: 'accent', width: 1 })), ...[0, 1.5708, 3.1416, 4.7124].map((p) => ({ param: [`0.7*(1 - t)*cos(${p})`, `0.7*(1 - t)*sin(${p})`, '1.5*t'], t: [0, 1], color: 'accent', width: 1.2 }))] }, caption: 'The solid cone, drawn as a wireframe with a few horizontal slices. Drag to rotate.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §5.6 Calculating centers of mass and moments of inertia', url: 'https://openstax.org/books/calculus-volume-3/pages/5-6-calculating-centers-of-mass-and-moments-of-inertia' },
    { label: 'NASA Earth fact sheet (moment of inertia factor 0.3308)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
    { label: 'Bracewell & Garriott (1958), Rotation of artificial Earth satellites, Nature 182, 760 — the Explorer 1 tumble', url: 'https://doi.org/10.1038/182760a0' },
    { label: 'NASA JPL: Explorer 1', url: 'https://www.jpl.nasa.gov/missions/explorer-1' },
  ],
});
