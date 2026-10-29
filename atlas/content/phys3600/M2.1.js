// The potential and Poisson's equation (Griffiths §2.3.1–2.3.4): V from a
// curl-free field, the reference point, E = −∇V read off a landscape,
// V of a uniformly charged ball (the worked example), Poisson's equation
// from Gauss's differential form, and the documented slips "E = 0 ⇒ V = 0"
// and "V = 0 ⇒ E = 0". Transfer: the space-charge-limited (Child–Langmuir)
// gap between an ion thruster's grids. Builds on phys2220.E4.1–E4.4.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, KC, sf, field } from './_bvp.js';

const t = String.raw;

/** V(r) and E(r) of a uniformly charged ball, in units of their surface values (graph). */
const ballProfiles = (caption, { showV = true, showE = true, mark = null } = {}) => ({
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 1.7], aspect: 'wide', xlabel: 'r / R', ylabel: '',
    curves: [
      ...(showV ? [{ fn: '1.5 - 0.5*x^2', domain: [0, 1], color: 'accent', width: 2.6 }, { fn: '1/x', domain: [1, 3], color: 'accent', width: 2.6, label: 'V / V(R)', labelAt: 2.2, labelDy: -4 }] : []),
      ...(showE ? [{ fn: 'x', domain: [0, 1], color: 'gold', width: 2.2, dash: [6, 4] }, { fn: '1/x^2', domain: [1, 3], color: 'gold', width: 2.2, dash: [6, 4], label: 'E / E(R)', labelAt: 1.6, labelDy: 18 }] : []),
    ],
    vlines: [{ x: 1, label: 'surface', color: 'ink3' }],
    points: mark ? [{ x: mark, y: 0, r: 4, color: 'violet', label: 'here', labelDy: -4 }] : [],
  },
  caption,
});

export default lesson({
  id: 'phys3600.M2.1',
  title: 'The potential and Poisson’s equation',
  minutes: 16, difficulty: 3,
  equation: t`V(\vec r) = -\int_{\mathcal O}^{\vec r}\vec E\cdot d\vec l, \qquad \vec E = -\nabla V, \qquad \nabla^2 V = -\frac{\rho}{\varepsilon_0}`,
  intro: t`Because $\nabla\times\vec E = 0$ ([M1.2](#/lesson/phys3600.M1.2)), the line integral of $\vec E$ between two points does not depend on the path — so one number per point, the **potential** $V$, carries everything. Pick a reference point $\mathcal O$ where $V = 0$ (infinity, when the charge is confined), and $V$ at any other point is minus the work per unit charge the field does on the way there. Then $\vec E = -\nabla V$: one scalar function instead of three components, and potentials of separate charges simply add, $V = \frac{1}{4\pi\varepsilon_0}\int\frac{\rho(\vec r\,')}{\mathscr r}\,d\tau'$. Put $\vec E = -\nabla V$ into Gauss’s law $\nabla\cdot\vec E = \rho/\varepsilon_0$ ([M1.3](#/lesson/phys3600.M1.3)) and you get **Poisson’s equation**, which becomes Laplace’s equation $\nabla^2 V = 0$ wherever there is no charge. You met $V$ in [Physics II](#/lesson/phys2220.E4.1); here it becomes the unknown of a differential equation — the subject of the next three modules.`,
  symbols: [
    { tex: 'V', text: 'the electric potential, in volts (J/C) — defined only up to an added constant, fixed by the reference point' },
    { tex: '\\mathcal O', text: t`the reference point where $V = 0$ (usually infinity)` },
    { tex: 'd\\vec l', text: 'a small step along any path from the reference point to the field point, in m' },
    { tex: '\\vec E', text: 'the electric field, in V/m (the same as N/C)' },
    { tex: '\\nabla V', text: t`the gradient of $V$: points uphill, with length the steepest slope — so $\vec E$ points **downhill**` },
    { tex: '\\nabla^2 V', text: t`the Laplacian, $\nabla\cdot\nabla V = \partial_x^2V + \partial_y^2V + \partial_z^2V$, in V/m² — how far $V$ at a point sits below the average of its surroundings` },
    { tex: '\\rho', text: 'the charge density, in C/m³' },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{F/m}$` },
    { tex: '\\mathscr r', text: t`the distance from the source point $\vec r\,'$ to the field point $\vec r$` },
  ],
  why: t`Every boundary-value method ahead — images, separation of variables, multipoles, relaxation on a grid — is a way of solving Poisson’s or Laplace’s equation for $V$, and so is the Newtonian limit of general relativity, where the time–time part of the metric obeys $\nabla^2\Phi = 4\pi G\rho$.`,
  visual: {
    type: 'surface3d',
    title: 'The potential as a landscape',
    lead: t`Height is $V$ in the plane of two point charges: one $+q$ at $x = 1$, the other $kq$ at $x = -1$. The gold point is a probe; the red arrow under it is $\nabla V$, pointing uphill. The field $\vec E = -\nabla V$ points the other way — downhill — and the level curves on the floor are equipotentials.`,
    tasks: [
      t`Leave $k = -1$ (a dipole) and put the probe at the origin: $V = 0$ there, yet the surface is steep — the field is far from zero.`,
      t`Set $k = +1$ (two equal charges): the origin becomes a saddle. The slope, and so $\vec E$, is zero there, but $V$ is not.`,
      t`Move the probe anywhere: the gradient arrow always crosses the floor’s level curves at right angles.`,
    ],
    params: {
      z: '1/sqrt((x - 1)^2 + y^2 + 0.04) + k/sqrt((x + 1)^2 + y^2 + 0.04)',
      domain: [[-2.6, 2.6], [-2, 2]], n: 60, zscale: 0.5, zclip: 3, levels: 22, tangentAt: ['px', 'py'], planeSize: 0.35,
      sliders: [
        { key: 'k', label: t`Second charge, in units of $q$`, min: -1, max: 1, step: 0.25, value: -1, explain: 'k = −1 makes a dipole; k = +1 two equal charges; k = 0 a lone charge.' },
        { key: 'px', label: t`Probe $x$`, min: -2.4, max: 2.4, step: 0.05, value: 0, explain: 'Where the gold probe stands, in units of half the separation.' },
        { key: 'py', label: t`Probe $y$`, min: -1.8, max: 1.8, step: 0.05, value: 0.6, explain: 'Where the gold probe stands, in units of half the separation.' },
      ],
      readouts: [
        { label: t`$V$`, expr: '1/sqrt((px - 1)^2 + py^2 + 0.04) + k/sqrt((px + 1)^2 + py^2 + 0.04)', digits: 3 },
        { label: t`$E_x = -\partial V/\partial x$`, expr: '(px - 1)/((px - 1)^2 + py^2 + 0.04)^1.5 + k*(px + 1)/((px + 1)^2 + py^2 + 0.04)^1.5', digits: 3 },
        { label: t`$E_y = -\partial V/\partial y$`, expr: 'py/((px - 1)^2 + py^2 + 0.04)^1.5 + k*py/((px + 1)^2 + py^2 + 0.04)^1.5', digits: 3 },
      ],
    },
    caption: t`Heights are $V$ in units of $q/(4\pi\varepsilon_0 s)$, with $s$ half the charges’ separation and $x, y$ in units of $s$. The spikes are softened (a true point charge’s potential grows without limit) and clipped; the plane is the slice $z = 0$ through both charges.`,
  },
  example: {
    prompt: t`A ball of radius $R = 4$ cm carries $Q = 8$ nC spread uniformly through its volume. Find $V(r)$ everywhere, with $V(\infty) = 0$, and the potential at its centre.`,
    visual: ballProfiles(t`Blue: $V(r)$ in units of $V(R) = kQ/R$. Dashed gold: the field, in units of its surface value. The field is zero at the centre; the potential is at its **highest** there.`),
    steps: [
      { label: 'Field first', text: t`Gauss’s law ([M1.3](#/lesson/phys3600.M1.3)): outside, $E = \dfrac{kQ}{r^2}$; inside, $E = \dfrac{kQr}{R^3}$, with $k = 1/4\pi\varepsilon_0$. Both point outward.` },
      { label: 'Outside', text: t`Integrate in from the reference point along a radius: $V(r) = -\int_\infty^r \dfrac{kQ}{r'^2}\,dr' = \dfrac{kQ}{r}$ for $r \ge R$.` },
      { label: 'Inside', text: t`Carry on past the surface — the path must start at the reference point, so the outside part is still there: $V(r) = -\int_\infty^R \dfrac{kQ}{r'^2}dr' - \int_R^r \dfrac{kQr'}{R^3}dr' = \dfrac{kQ}{R} + \dfrac{kQ}{2R^3}(R^2 - r^2) = \dfrac{kQ}{2R}\left(3 - \dfrac{r^2}{R^2}\right)$.` },
      { label: 'Poisson check', text: t`Inside, $\nabla^2V = \dfrac{1}{r^2}\dfrac{d}{dr}\!\left(r^2\dfrac{dV}{dr}\right) = \dfrac{1}{r^2}\dfrac{d}{dr}\!\left(-\dfrac{kQr^3}{R^3}\right) = -\dfrac{3kQ}{R^3} = -\dfrac{\rho}{\varepsilon_0}$ ✓, since $\rho = 3Q/4\pi R^3$.` },
      { label: 'Numbers', text: t`$V(R) = kQ/R = \dfrac{(8.988\times10^9)(8\times10^{-9})}{0.04} \approx ${nice(sf((KC * 8e-9) / 0.04, 4))}$ V, and the centre sits at $\tfrac32$ of that, $\approx ${nice(sf((1.5 * KC * 8e-9) / 0.04, 4))}$ V.` },
      { label: 'Sense check', text: t`$V$ is continuous at $r = R$ (both formulas give $kQ/R$), and so is its slope — no surface charge there. $V$ is largest where $E = 0$: zero field means a flat spot of the landscape, not zero height.` },
    ],
    answer: t`$V = kQ/r$ outside, $V = \dfrac{kQ}{2R}\left(3 - r^2/R^2\right)$ inside; $V(0) = \tfrac32 kQ/R \approx ${nice(sf((1.5 * KC * 8e-9) / 0.04, 3))}$ V.`,
  },
  practice: [
    num({
      id: 'centre-V', difficulty: 2,
      gen(r) {
        const Q = r.pick([2, 5, 8, 12]), R = r.pick([3, 5, 10]);
        const VR = (KC * Q * 1e-9) / (R / 100), ans = 1.5 * VR;
        return {
          prompt: t`A ball of radius ${R} cm holds $${Q}$ nC spread uniformly through its volume. Taking $V(\infty) = 0$, what is the potential at its centre?`,
          visual: ballProfiles(t`The field (dashed gold, in units of its surface value) is zero at the centre. What is the potential there? (The potential curve is hidden.)`, { showV: false, mark: 0.02 }),
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: VR, feedback: t`That is $kQ/R$, the surface value. Inside a uniform ball the field is not zero, so $V$ keeps rising as you go in: the centre sits at $\tfrac32 kQ/R$.` },
            { value: 0, feedback: t`$E = 0$ at the centre makes $V$ **flat** there, not zero. $V$ is the integral of $E$ all the way from infinity.` },
          ],
          hints: [t`Integrate $-\vec E\cdot d\vec l$ from infinity to the surface, then from the surface to the centre, with $E = kQr/R^3$ inside.`, t`$V(r) = \dfrac{kQ}{2R}\left(3 - \dfrac{r^2}{R^2}\right)$ inside, so $V(0) = \tfrac32\,kQ/R$.`],
          teach: 'The potential at a point is the integral of the field from the reference point, so a zero field at the centre leaves the potential flat, not zero.',
          explain: t`$V(0) = \tfrac32\dfrac{kQ}{R} = 1.5\times\dfrac{(8.988\times10^9)(${Q}\times10^{-9})}{${R / 100}} \approx ${nice(sf(ans, 3))}$ V.`,
        };
      },
    }),
    mcq({
      id: 'E-zero-V', difficulty: 2,
      prompt: t`Two equal positive charges sit 10 cm apart. At the midpoint between them, which is true? (Take $V(\infty) = 0$.)`,
      visual: field({ x: [-10, 10], y: [-6, 6], charges: [{ x: -5, y: 0, q: 3 }, { x: 5, y: 0, q: 3 }], equip: true, fieldLines: true, density: 10, probe: { x: 0, y: 0, label: 'M' } }, 'Two equal positive charges, their field lines and their equipotentials (violet). M is the midpoint.'),
      choices: [t`$\vec E = 0$, but $V \ne 0$`, t`$\vec E = 0$ and $V = 0$`, t`$\vec E \ne 0$, but $V = 0$`, t`$\vec E \ne 0$ and $V \ne 0$`],
      answer: 0,
      why: {
        1: t`The fields cancel, but potentials are scalars and **add**: each charge contributes $+kq/r$, so $V = 2kq/r > 0$.`,
        2: t`By symmetry the two fields at M are equal and opposite, so they cancel. $V = 0$ at a midpoint is the dipole’s case, with charges of opposite sign.`,
        3: 'The fields cancel at M: equal magnitudes, opposite directions.',
      },
      hints: ['Field is a vector: add the two arrows at M. Potential is a scalar: add two numbers.'],
      teach: 'E is the slope of V, not V itself: a zero field means a flat spot (here a saddle), at any height.',
      explain: t`The fields are equal and opposite, so $\vec E = 0$; the potentials are both $+kq/(5\ \text{cm})$, so $V = 2kq/(5\ \text{cm})$. The midpoint is a saddle of the landscape — flat, but high up.`,
    }),
    num({
      id: 'grad', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 5]), B = r.pick([4, 6, 10]), x = r.int(1, 3), y = r.int(1, 2), z = r.int(1, 3);
        const ans = -(A * x * x + B * z);
        return {
          prompt: t`In a region of space the potential is $V(x, y, z) = ${A}x^2y + ${B}yz$ volts, with $x, y, z$ in metres. Find the $y$-component of $\vec E$ at the point $(${x}, ${y}, ${z})$ m.`,
          visual: { type: 'c3-contour', params: { f: `${A}*x^2*y + ${B * z}*y`, x: [-0.5, 4], y: [-0.4, 2.8], levels: 8, labels: false, fill: true, xlabel: 'x (m)', ylabel: 'y (m)', points: [{ x, y, label: 'P', color: 'gold' }] }, caption: t`Equipotentials of $V$ in the plane $z = ${z}$ m, shaded low (blue) to high (gold). $\vec E$ crosses them at right angles, pointing downhill.` },
          answer: ans, units: 'V/m', tol: { rel: 0.001 },
          errors: [{ value: -A * x * x, feedback: t`$V$ depends on $y$ through **both** terms: $\partial V/\partial y = ${A}x^2 + ${B}z$.` }, { value: -2 * A * x * y, feedback: t`That is $-\partial V/\partial x$. You need $E_y = -\partial V/\partial y$.` }],
          hints: [t`$E_y = -\partial V/\partial y$, holding $x$ and $z$ fixed.`, t`$\partial V/\partial y = ${A}x^2 + ${B}z$; put in $x = ${x}$, $z = ${z}$ and keep the minus sign.`],
          teach: 'Each component of the field is minus the rate of change of V along that axis.',
          explain: t`$E_y = -\partial V/\partial y = -(${A}x^2 + ${B}z) = -(${A * x * x} + ${B * z}) = ${ans}$ V/m. It points in $-y$: downhill on the map.`,
        };
      },
    }),
    num({
      id: 'disk-axis', difficulty: 3,
      gen(r) {
        const sig = r.pick([20, 50, 80]), R = r.pick([5, 10]), z = r.pick([3, 5, 12]);
        const Rm = R / 100, zm = z / 100, ans = (sig * 1e-9 / (2 * EPS0)) * (Math.sqrt(zm * zm + Rm * Rm) - zm);
        const Q = sig * 1e-9 * Math.PI * Rm * Rm;
        return {
          prompt: t`A flat disk of radius ${R} cm carries a uniform surface charge $\sigma = ${sig}$ nC/m². Find the potential on its axis, ${z} cm from its centre, with $V(\infty) = 0$.`,
          visual: { type: 'graph', params: { x: [-1.6 * R, 1.6 * R], y: [-0.3 * R, z + 0.3 * R], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ fn: '0', domain: [-R, R], color: 'warn', width: 5 }, { param: [`${R * 0.55}*(1 - t)`, `${z}*t`], t: [0, 1], color: 'ink3', dash: [4, 4], width: 1.2 }, { param: [`${R * 0.55}*cos(t)`, `${R * 0.12}*sin(t)`], t: [0, 2 * Math.PI], color: 'gold', width: 1.4 }, { param: ['0', `${z}*t`], t: [0, 1], color: 'ink3', dash: [2, 4], width: 1 }], points: [{ x: 0, y: z, color: 'violet', label: 'P' }, { x: R * 0.55, y: 0, r: 0, label: 'ring of radius s′', labelDx: 6, labelDy: 18 }] }, caption: t`The disk edge-on (orange) with one thin ring (gold) of radius $s'$; every point of a ring is the same distance $\sqrt{s'^2 + z^2}$ from P. Not to scale.` },
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (KC * Q) / zm, feedback: t`That treats the disk as a point charge, $kQ/z$ — only valid far away, $z \gg R$. Here $z$ is comparable to $R$.` }],
          hints: [t`Cut the disk into rings of radius $s'$ and width $ds'$: charge $\sigma\,2\pi s'ds'$, all at distance $\sqrt{s'^2 + z^2}$. Potentials are scalars, so just add them.`, t`$V = \dfrac{\sigma}{4\pi\varepsilon_0}\int_0^R\dfrac{2\pi s'\,ds'}{\sqrt{s'^2 + z^2}} = \dfrac{\sigma}{2\varepsilon_0}\left(\sqrt{z^2 + R^2} - z\right)$.`],
          teach: 'For a potential you add scalars — no components, no cancelling directions — which is why V is usually the easier integral.',
          explain: t`$V = \dfrac{\sigma}{2\varepsilon_0}\left(\sqrt{z^2 + R^2} - z\right) = \dfrac{${sig}\times10^{-9}}{2(8.854\times10^{-12})}\left(\sqrt{${zm}^2 + ${Rm}^2} - ${zm}\right) \approx ${nice(sf(ans, 3))}$ V. Then $E_z = -dV/dz = \dfrac{\sigma}{2\varepsilon_0}\left(1 - \dfrac{z}{\sqrt{z^2 + R^2}}\right)$ — the field of [M1.1](#/lesson/phys3600.M1.1) with no vector bookkeeping.`,
        };
      },
    }),
    num({
      id: 'poisson-rho', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3, 5, 8]);
        const ans = -2 * EPS0 * c * 1e4 / 1e-9;
        return {
          prompt: t`Inside a thick slab the potential depends only on $x$: $V(x) = c\,x^2$ with $c = ${c}\times10^{4}\ \text{V/m}^2$. What charge density does the slab hold?`,
          visual: { type: 'graph', params: { x: [-1, 1], y: [-0.1, 1.1], aspect: 'wide', xlabel: 'x (in units of the half-thickness)', ylabel: 'V', yticks: 0, curves: [{ fn: 'x^2', color: 'accent', width: 2.6 }], shade: [{ fn: '1.1', lower: '-0.1', from: -1, to: 1, color: 'warn', alpha: 0.06 }], arrows: [{ from: [0.75, 0.12], to: [0.4, 0.12], color: 'gold', width: 2 }, { from: [-0.75, 0.12], to: [-0.4, 0.12], color: 'gold', width: 2, label: 'E', labelDx: -4 }] }, caption: t`The shape of $V(x) = cx^2$ across the slab (vertical scale arbitrary). $E_x = -dV/dx$ points toward the middle on both sides.` },
          answer: ans, units: 'nC/m^3', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`$d^2(cx^2)/dx^2 = 2c$, not $c$.` }, { value: (-2 * c * 1e4) / EPS0 / 1e-9, feedback: t`Poisson’s equation is $\nabla^2V = -\rho/\varepsilon_0$, so $\rho = -\varepsilon_0\nabla^2V$: multiply by $\varepsilon_0$, do not divide.` }],
          hints: [t`In one dimension Poisson’s equation is $\dfrac{d^2V}{dx^2} = -\dfrac{\rho}{\varepsilon_0}$.`, t`$d^2V/dx^2 = 2c$, so $\rho = -2\varepsilon_0c$.`],
          teach: 'Poisson’s equation turns a potential into its source: the charge density is minus ε₀ times the Laplacian of V.',
          explain: t`$\rho = -\varepsilon_0\dfrac{d^2V}{dx^2} = -2\varepsilon_0c = -2(8.854\times10^{-12})(${c}\times10^4) \approx ${nice(sf(ans, 3))}\ \text{nC/m}^3$. Negative: a potential that curves **up** (a valley) holds negative charge, which pulls the field lines in from both sides.`,
        };
      },
    }),
    mcq({
      id: 'line-ref', difficulty: 3,
      prompt: t`For an infinite straight line of charge $\lambda$, why can you not take the reference point at infinity?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [-2.6, 2.6], aspect: 'wide', xlabel: 's / s₀', ylabel: 'V', yticks: 0, curves: [{ fn: '-ln(x)', domain: [0.05, 10], color: 'accent', width: 2.6, label: 'V = −(λ/2πε₀) ln(s/s₀)', labelAt: 3, labelDy: -14 }], hlines: [{ y: 0, color: 'ink3' }] }, caption: t`The potential of an infinite line charge with $V = 0$ at $s = s_0$. It keeps falling, slowly but without limit, as $s$ grows.` },
      choices: [
        t`$\int_s^\infty \dfrac{\lambda}{2\pi\varepsilon_0 s'}\,ds'$ diverges, because the charge itself reaches to infinity`,
        t`The field of a line charge is not curl-free, so no potential exists`,
        t`The field is zero at infinity, so the potential there is undefined`,
        t`Potentials are only defined for point charges`,
      ],
      answer: 0,
      why: {
        1: t`Every static field is curl-free; the line’s field $\lambda/(2\pi\varepsilon_0 s)\,\hat s$ has a perfectly good potential, $-(\lambda/2\pi\varepsilon_0)\ln(s/s_0)$.`,
        2: t`A zero field at the reference point is fine — that is the usual case for a point charge. The trouble is the integral out to it.`,
        3: t`Potentials of continuous distributions are routine: $V = \frac{1}{4\pi\varepsilon_0}\int\rho/\mathscr r\,d\tau'$ — as long as the charge is confined.`,
      },
      hints: [t`Try it: $V(s) = -\int_\infty^s \vec E\cdot d\vec l$ with $E = \lambda/(2\pi\varepsilon_0 s')$.`, t`$\int ds'/s' = \ln s'$, which grows without bound.`],
      teach: 'Infinity works as a reference only when the charge is confined; an idealized infinite line or plane needs a finite reference point.',
      explain: t`The integral gives $\ln s'$, which has no limit as $s' \to \infty$: the field falls off too slowly because the charge never ends. Pick a finite $s_0$ instead. Real wires are finite, so for them infinity works again — the infinite line is an idealization with a cost.`,
    }),
    order({
      id: 'derive-poisson', difficulty: 2,
      prompt: 'Put the steps from Coulomb’s law to Poisson’s equation in order.',
      visual: { type: 'field2d', params: { P: 'x/(x^2 + y^2 + 0.05)^1.5 - (x - 1.6)/((x - 1.6)^2 + y^2 + 0.05)^1.5', Q: 'y/(x^2 + y^2 + 0.05)^1.5 - y/((x - 1.6)^2 + y^2 + 0.05)^1.5', x: [-1.5, 3.1], y: [-2, 2], potential: '1/sqrt(x^2 + y^2 + 0.05) - 1/sqrt((x - 1.6)^2 + y^2 + 0.05)', particles: false, probe: false, readout: false }, caption: 'A dipole’s field (arrows) and its equipotentials (violet): the field everywhere crosses them at right angles, which is what E = −∇V says. Charges softened.' },
      items: [
        t`Static fields have $\nabla\times\vec E = 0$`,
        t`So $\int\vec E\cdot d\vec l$ is path-independent, and $V$ exists`,
        t`$\vec E = -\nabla V$`,
        t`Gauss: $\nabla\cdot\vec E = \rho/\varepsilon_0$`,
        t`$\nabla\cdot(-\nabla V) = \rho/\varepsilon_0$, i.e. $\nabla^2 V = -\rho/\varepsilon_0$`,
      ],
      hints: ['The potential can only be defined once you know the line integral does not depend on the path.', 'Poisson’s equation is Gauss’s law with the field written as a gradient.'],
      teach: 'Curl-free gives the potential; divergence (Gauss) gives the equation it obeys.',
      explain: t`The two halves of electrostatics, $\nabla\times\vec E = 0$ and $\nabla\cdot\vec E = \rho/\varepsilon_0$, become one scalar equation: the first lets you write $\vec E = -\nabla V$, the second then reads $\nabla^2V = -\rho/\varepsilon_0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ion-grid', difficulty: 3, transfer: true,
      gen(r) {
        const V0 = r.pick([1000, 1100, 1500]), d = r.pick([0.6, 0.8, 1.0]), dm = d / 1000, x = dm / 2;
        const ans = ((4 / 9) * EPS0 * V0) / (dm ** (4 / 3) * x ** (2 / 3));
        return {
          prompt: t`In a gridded ion thruster, xenon ions cross the gap between the screen grid ($x = 0$, held at $V_0 = ${V0}$ V) and the accelerator grid ($x = d$, at 0 V), with $d = ${d}$ mm. When the beam is space-charge limited, the potential across the gap follows the Child–Langmuir profile $V(x) = V_0\left[1 - (x/d)^{4/3}\right]$. Treating the gap as one-dimensional, find the charge density halfway across, in mC/m³.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'x / d', ylabel: 'V / V₀', curves: [{ fn: '1 - x^(4/3)', domain: [0, 1], color: 'accent', width: 2.6, label: 'space-charge limited', labelAt: 0.55, labelDy: -8 }, { fn: '1 - x', domain: [0, 1], color: 'ink3', dash: [5, 4], width: 1.6, label: 'empty gap', labelAt: 0.3, labelDy: 20 }], vlines: [{ x: 0.5, color: 'violet' }] }, caption: t`The Child–Langmuir potential (blue) against the straight line of an empty gap (dashed), from the screen grid at $x = 0$ to the accelerator grid at $x = d$. The ions’ own charge bends $V(x)$. A real grid has holes; the one-dimensional gap is a model.` },
          answer: ans * 1000, units: 'mC/m^3', tol: { rel: 0.01 },
          errors: [{ value: ((4 / 3) * EPS0 * V0) / (dm ** (4 / 3) * x ** (-1 / 3)) * 1000, feedback: t`That uses $dV/dx$. Poisson’s equation needs the **second** derivative: $\rho = -\varepsilon_0\,d^2V/dx^2$.` }],
          hints: [t`$\rho = -\varepsilon_0\,d^2V/dx^2$.`, t`$\dfrac{d^2}{dx^2}\left[-V_0(x/d)^{4/3}\right] = -\tfrac49V_0\,d^{-4/3}x^{-2/3}$, so $\rho = \tfrac49\varepsilon_0V_0\,d^{-4/3}x^{-2/3}$. Use metres.`],
          teach: 'Poisson’s equation read backwards: the curvature of a measured or modelled potential tells you the charge that must be there.',
          explain: t`$\rho = \tfrac49\varepsilon_0V_0\,d^{-4/3}x^{-2/3} \approx ${nice(sf(ans, 3))}\ \text{C/m}^3 = ${nice(sf(ans * 1000, 3))}\ \text{mC/m}^3$ — positive, as it must be for xenon ions, about $${tex(ans / 1.602176634e-19, 2)}$ ions per m³. This space charge is what caps the current a grid pair can extract: the Child–Langmuir law, $J \propto V_0^{3/2}/d^2$.`,
        };
      },
    }),
    num({
      id: 'cp-half', difficulty: 3,
      gen(r) {
        const Q = r.pick([3, 6, 10]), R = r.pick([4, 6, 8]), f = r.pick([0.5, 0.25, 0.75]);
        const VR = (KC * Q * 1e-9) / (R / 100), ans = (VR / 2) * (3 - f * f);
        return {
          prompt: t`A ball of radius ${R} cm holds $${Q}$ nC uniformly through its volume. Find the potential at a point ${nice(f * R)} cm from its centre, with $V(\infty) = 0$.`,
          visual: ballProfiles(t`The field of the ball (dashed gold), in units of its surface value; the violet dot marks the point asked about. (The potential curve is hidden.)`, { showV: false, mark: f }),
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (KC * Q * 1e-9) / (f * R / 100), feedback: t`$kQ/r$ holds only outside the ball. Inside, only part of the charge is nearer than you, and the path in from infinity crosses the region outside first.` }, { value: VR, feedback: 'That is the surface value. Inside, V keeps rising toward the centre.' }],
          hints: [t`Inside a uniform ball, $V(r) = \dfrac{kQ}{2R}\left(3 - \dfrac{r^2}{R^2}\right)$.`, t`$r/R = ${f}$.`],
          teach: 'Inside a uniformly charged ball the potential is an inverted parabola that joins kQ/r smoothly at the surface.',
          explain: t`$V = \dfrac{kQ}{2R}\left(3 - ${f}^2\right) = \dfrac{${nice(sf(VR, 4))}\ \text{V}}{2}\times${nice(3 - f * f)} \approx ${nice(sf(ans, 3))}$ V.`,
        };
      },
    }),
    expr({
      id: 'cp-findV', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 4]), b = r.pick([5, 6, 7]);
        return {
          prompt: t`A static field is $\vec E = -${2 * a}xy\,\hat x - (${a}x^2 + ${b})\,\hat y$ (V/m, with $x, y$ in metres). Find a potential $V(x, y)$ for it (any additive constant is fine).`,
          visual: { type: 'field2d', params: { P: `-${2 * a}*x*y`, Q: `-(${a}*x^2 + ${b})`, x: [-2, 2], y: [-2, 2], particles: false, probe: false, readout: false }, caption: 'The field as arrows (lengths compressed, colour by strength).' },
          answer: `${a}x^2 y + ${b}y`, answerTeX: t`${a}x^2y + ${b}y`,
          vars: { x: [-2, 2], y: [-2, 2] }, mode: 'constant', wrt: '*',
          errors: [{ answer: `-${a}x^2 y - ${b}y`, feedback: t`Check the sign: $\vec E = -\nabla V$, so $\partial V/\partial x = -E_x = +${2 * a}xy$.` }, { answer: `${a}x^2 y`, feedback: t`$\partial V/\partial y$ must give $${a}x^2 + ${b}$: you are missing a term in $y$ alone.` }],
          hints: [t`$\partial V/\partial x = -E_x = ${2 * a}xy$: integrate in $x$, leaving an unknown $g(y)$.`, t`$V = ${a}x^2y + g(y)$; now match $\partial V/\partial y = -E_y = ${a}x^2 + ${b}$, so $g'(y) = ${b}$.`],
          teach: 'Recover V from E by integrating one component, then fixing the leftover function with the others — exactly the potential-function method of vector calculus.',
          explain: t`$V = ${a}x^2y + ${b}y$ (+ any constant). Check: $-\partial V/\partial x = -${2 * a}xy$ ✓ and $-\partial V/\partial y = -(${a}x^2 + ${b})$ ✓. The method is the potential-function recipe of [Calculus III](#/lesson/math2210.C3-5.3); it works because this $\vec E$ is curl-free.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Goebel & Katz, Fundamentals of Electric Propulsion: Ion and Hall Thrusters (JPL, 2008), ch. 5', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
  ],
});
