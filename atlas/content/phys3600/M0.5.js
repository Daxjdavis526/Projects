// Helmholtz's theorem (Griffiths §1.6 and Appendix B): a field that vanishes
// at infinity is fixed by its divergence and its curl, and is built from them
// as −∇V + ∇×A with V and A Coulomb-like integrals of the sources. Uniqueness
// from the Laplacian; why boundary conditions matter (the uniform field);
// curl-free ⇔ gradient and divergence-free ⇔ curl; and the payoff for
// electrostatics: ∇·E = ρ/ε₀ with ∇×E = 0 is all of Coulomb's law.
import { lesson, mcq, num, expr, order, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { fieldPic, sf } from './_toolkit.js';

const t = String.raw;

// A source disk (divergence a inside) at (−1.3, 0) and a curl disk (curl b inside) at (1.3, 0), radius 0.6, plus a uniform c x̂.
const G1 = '0.18/max((x + 1.3)^2 + y^2, 0.36)', G2 = '0.18/max((x - 1.3)^2 + y^2, 0.36)';
const P = `a*(x + 1.3)*${G1} - b*y*${G2} + c`;
const Q = `a*y*${G1} + b*(x - 1.3)*${G2}`;

/** Profile of the rebuilt field: k r inside a ball of radius 1, k/r² outside. */
const profile = (caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [0, 4], y: [0, 1.25], aspect: 'wide', xlabel: 'r / a', ylabel: 'F / (Da/3)',
    curves: [{ fn: 'x', domain: [0, 1], color: 'accent', width: 2.6, label: 'inside: ∝ r', labelAt: 0.45, labelDx: 10, labelDy: -6 }, { fn: '1/x^2', domain: [1, 4], color: 'accent', width: 2.6, label: 'outside: ∝ 1/r²', labelAt: 2, labelDy: -12 }],
    vlines: [{ x: 1, label: 'r = a', color: 'ink3' }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M0.5',
  title: 'Helmholtz’s theorem',
  minutes: 13, difficulty: 3,
  equation: t`\vec F = -\nabla V + \nabla\times\vec A`,
  intro: t`Suppose you know only two things about a vector field everywhere: its divergence $D = \nabla\cdot\vec F$ (its sources) and its curl $\vec C = \nabla\times\vec F$ (its swirl). Is that enough to know the field? **Helmholtz’s theorem** says yes — provided the field dies away far off. Then $\vec F$ is unique, and it can be built from its sources by Coulomb-like integrals:

$$V(\vec r) = \frac{1}{4\pi}\int\frac{D(\vec r\,')}{\mathcal R}\,d\tau', \qquad \vec A(\vec r) = \frac{1}{4\pi}\int\frac{\vec C(\vec r\,')}{\mathcal R}\,d\tau'$$

That is why Maxwell’s equations are written as one divergence and one curl for each field: together with “zero at infinity” they leave nothing else to say. It also gives two working rules. A curl-free field is the gradient of a scalar; a divergence-free field is the curl of a vector.`,
  symbols: [
    { tex: 'D = \\nabla\\cdot\\vec F', text: 'the source density of the field (a scalar function of position)' },
    { tex: '\\vec C = \\nabla\\times\\vec F', text: t`the circulation density, or swirl, of the field; it must itself have $\nabla\cdot\vec C = 0$` },
    { tex: 'V', text: 'a scalar potential: the part of the field that spreads from sources' },
    { tex: '\\vec A', text: 'a vector potential: the part of the field that circulates' },
    { tex: '\\mathcal R', text: t`the distance $|\vec r - \vec r\,'|$ from the source point $\vec r\,'$ to the field point $\vec r$; $d\tau'$ is a volume element at the source` },
    { tex: '\\text{conditions}', text: t`$\vec F \to 0$ far away, and $D$ and $\vec C$ fall off faster than $1/r^2$, so the integrals converge` },
  ],
  why: t`Electrostatics is Helmholtz with $D = \rho/\varepsilon_0$ and $\vec C = 0$, which hands you Coulomb’s law; magnetostatics is $D = 0$ and $\vec C = \mu_0\vec J$, which hands you Biot–Savart.`,
  visual: {
    type: 'field2d',
    title: 'Sources and swirl, then a field they cannot see',
    lead: t`The left disk is a **source**: inside it $\nabla\cdot\vec F = a$. The right disk, ringed in gold, is a **swirl**: inside it the curl is $b$, and the readouts add its circulation. Everywhere else both are zero. Drag the probe and read them off; then add a uniform field.`,
    tasks: [
      t`Probe across the left disk: the divergence reads $a$ inside and $0$ outside, and the curl is $0$ throughout. The right disk is the mirror image for the curl.`,
      t`Turn up the uniform part $c$. The field changes everywhere, but no reading of divergence or curl changes. Only the condition $\vec F \to 0$ far away rules it out.`,
      t`Set $a = 0$: a pure swirl, curl without divergence — the pattern of $\vec B$ round a current-carrying wire. Set $b = 0$: a pure source, the pattern of $\vec E$ round a charged rod.`,
    ],
    params: {
      P, Q, x: [-3, 3], y: [-3, 3], probe: [-1.1, 0.3], loop: { r: 0.6, c: [1.3, 0] },
      sliders: [
        { key: 'a', label: t`Source strength $a$`, min: -2, max: 2, step: 0.1, value: 1, explain: 'The divergence inside the left disk: how strongly field lines start there (negative: end there).' },
        { key: 'b', label: t`Swirl strength $b$`, min: -2, max: 2, step: 0.1, value: 1, explain: 'The curl inside the right disk: how strongly the field circulates there (negative: clockwise).' },
        { key: 'c', label: t`Uniform part $c$`, min: 0, max: 0.6, step: 0.05, value: 0, explain: 'A constant field added everywhere. It has no divergence and no curl, and it does not vanish far away.' },
      ],
    },
    caption: t`A plane picture: the disks are long cylinders seen end-on, so the fields fall as $1/r$ outside them. Arrow lengths are compressed; divergence and curl at the probe are computed numerically (they blur slightly at the disks’ edges).`,
  },
  example: {
    prompt: t`A field $\vec F$ vanishes far away, has $\nabla\times\vec F = 0$ everywhere, and has $\nabla\cdot\vec F = D$ (a constant) inside a ball of radius $a$ centred on the origin, $0$ outside. Find $\vec F$.`,
    visual: profile(t`The rebuilt field’s size against distance: growing linearly inside the ball, falling as $1/r^2$ outside, continuous at $r = a$.`),
    steps: [
      { label: 'Uniqueness first', text: t`Helmholtz says at most one field fits. So any field you can find that fits is **the** answer; you may guess and check.` },
      { label: 'Symmetry', text: t`The sources are spherically symmetric and there is no swirl, so the answer can only be radial and depend only on $r$: $\vec F = F(r)\,\hat r$. (Such a field is automatically curl-free, as M0.1 showed.)` },
      { label: 'Divergence theorem', text: t`Over a sphere of radius $r$: $F(r)\cdot4\pi r^2 = \int D\,d\tau$. Inside, that is $D\cdot\tfrac43\pi r^3$, so $F = \tfrac{D}{3}r$. Outside, it is $D\cdot\tfrac43\pi a^3$, so $F = \tfrac{Da^3}{3r^2}$.` },
      { label: 'Check', text: t`Inside, $\nabla\cdot(\tfrac D3 r\,\hat r) = \tfrac D3\cdot3 = D$ ✓ (from $\nabla\cdot(r^n\hat r) = (n + 2)r^{n-1}$). Outside, $\nabla\cdot(\hat r/r^2) = 0$ ✓. The two agree at $r = a$, and $F \to 0$ far away ✓.` },
    ],
    answer: t`$\vec F = \tfrac{D}{3}\,r\,\hat r$ for $r < a$ and $\vec F = \tfrac{Da^3}{3r^2}\,\hat r$ for $r > a$ — the field of a uniformly charged ball, with $D = \rho/\varepsilon_0$.`,
  },
  practice: [
    mcq({
      id: 'which-gradient', difficulty: 2,
      prompt: t`Which of these fields can be written as $-\nabla V$ for some scalar $V$?`,
      visual: fieldPic('y', 'x', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, caption: t`One of the candidates, $\langle y, x, 0\rangle$, in the plane $z = 0$ (lengths compressed). Does it circulate?` }),
      choices: [t`$\langle y,\ x,\ 0\rangle$`, t`$\langle -y,\ x,\ 0\rangle$`, t`$\langle xy,\ 0,\ 0\rangle$`, t`$\langle 0,\ 0,\ x\rangle$`],
      answer: 0,
      why: {
        1: t`Its curl is $\langle 0, 0, 2\rangle$. A gradient’s curl is always zero, so no $V$ exists.`,
        2: t`Its curl is $\langle 0, 0, -x\rangle \ne 0$: the $x$-component grows with $y$, so a loop in the $xy$-plane has circulation.`,
        3: t`Its curl is $\langle 0, -1, 0\rangle$: a loop in the $xz$-plane has net circulation.`,
      },
      hints: ['A field is a gradient exactly when its curl is zero (in all of space).', t`Compute $\nabla\times\vec F$ for each; for $\langle y, x, 0\rangle$ it is $\langle 0, 0, 1 - 1\rangle$.`],
      teach: 'Curl-free (in all of space) and gradient are the same thing.',
      explain: t`$\nabla\times\langle y, x, 0\rangle = \vec 0$, and indeed $\langle y, x, 0\rangle = -\nabla(-xy)$, so $V = -xy$. The others have nonzero curl, so no potential exists for them.`,
    }),
    expr({
      id: 'find-V', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4]);
        const A = a === 1 ? '' : a, B = b === 1 ? '' : b;
        return {
          prompt: t`$\vec F = \langle ${2 * a}xy + ${B}z^3,\ \ ${A}x^2,\ \ ${3 * b}xz^2\rangle$ is curl-free. Find a potential $V(x, y, z)$ with $\vec F = -\nabla V$.`,
          visual: fieldPic(`${2 * a}*x*y`, `${a}*x^2`, { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, caption: t`A slice of $\vec F$ through the plane $z = 0$ (lengths compressed).` }),
          answer: `-(${a} x^2 y + ${b} x z^3)`, answerTeX: t`-\left(${A}x^2y + ${B}xz^3\right)`,
          lhs: 'V', vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2] }, mode: 'constant', wrt: '*',
          errors: [{ answer: `${a} x^2 y + ${b} x z^3`, feedback: t`That is a function whose **gradient** is $\vec F$. With the physicist’s sign, $\vec F = -\nabla V$, so $V$ is its negative.` }],
          hints: [t`Integrate $-F_x$ with respect to $x$: $V = -\left(${A}x^2y + ${B}xz^3\right) + g(y, z)$.`, t`Check $-\partial_y V$ and $-\partial_z V$ against $F_y$ and $F_z$: nothing more is needed, so $g$ is a constant.`],
          teach: t`To find $V$, integrate one component, then fix the leftover function of the other variables by checking the remaining components.`,
          explain: t`$V = -\left(${A}x^2y + ${B}xz^3\right) + \text{const}$: then $-\nabla V = \langle ${2 * a}xy + ${B}z^3,\ ${A}x^2,\ ${3 * b}xz^2\rangle$ ✓. Its curl being zero guaranteed this would work.`,
        };
      },
    }),
    mcq({
      id: 'uniform', difficulty: 2,
      prompt: t`The uniform field $\vec F = E_0\,\hat x$ has $\nabla\cdot\vec F = 0$ and $\nabla\times\vec F = 0$ everywhere, exactly like $\vec F = 0$. Does this contradict Helmholtz’s theorem?`,
      visual: fieldPic('1', '0', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 13, toScale: 0.35, caption: 'A uniform field: the same arrow everywhere, out to infinity.' }),
      choices: ['No: it does not vanish far away, so the theorem’s condition fails', 'Yes: two different fields share the same divergence and curl, so the theorem is false', 'No: a uniform field does have a small divergence', 'Yes, but only in two dimensions'],
      answer: 0,
      why: {
        1: 'The theorem is about fields that vanish at infinity. Drop that condition and you can add any field with zero divergence and curl — a uniform field, or any gradient of a harmonic function.',
        2: t`$\partial_x E_0 = 0$: its divergence is exactly zero.`,
        3: 'Dimension has nothing to do with it; the uniform field fails to vanish at infinity in any number of dimensions.',
      },
      hints: ['Read the theorem’s conditions, not just its conclusion.'],
      teach: 'Divergence and curl fix a field only together with a boundary condition — vanishing at infinity, or given values on a boundary.',
      explain: t`Helmholtz needs $\vec F \to 0$ far away. In a finite region you must give boundary conditions instead — which is why a capacitor’s field or a conductor in an applied field $E_0\hat x$ (module M4) needs more than $\rho$ alone.`,
    }),
    num({
      id: 'rebuild', difficulty: 2,
      gen(r) {
        const D = r.pick([3, 6, 9, 12]), a = r.pick([1, 2]), rr = r.pick([0.5, 1.5, 3, 4]);
        const inside = rr < a, ans = inside ? (D * rr) / 3 : (D * a ** 3) / (3 * rr * rr);
        return {
          prompt: t`A field vanishes far away and has zero curl everywhere. Its divergence is $D = ${D}$ (field units per metre) inside a ball of radius $a = ${a}$ m, and zero outside. How strong is the field at $r = ${rr}$ m from the centre?`,
          visual: profile(t`How such a field depends on distance (in units of its value at the surface). Where does $r = ${rr}$ m fall?`, { points: [{ x: rr / a, y: 0, color: 'gold', r: 5, label: `r = ${rr} m`, labelDy: -10 }], x: [0, 4.2] }),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: inside ? D * rr : (D * a ** 3) / (rr * rr), feedback: t`Divide by 3: the flux through a sphere is $F\cdot4\pi r^2$, and the enclosed source is $D\cdot\tfrac43\pi(\ldots)^3$.` },
            ...(inside ? [{ value: (D * a ** 3) / (3 * rr * rr), feedback: t`That is the outside formula. At $r = ${rr}$ m you are inside the ball, where only the source within radius $r$ counts.` }] : [{ value: (D * rr) / 3, feedback: t`That is the inside formula. Outside the ball all of the source is enclosed: $D\cdot\tfrac43\pi a^3$.` }]),
          ],
          hints: [t`By symmetry $\vec F = F(r)\hat r$, and the divergence theorem gives $F\cdot4\pi r^2 = \int D\,d\tau$ over the ball of radius $r$.`, t`Inside: $F = Dr/3$. Outside: $F = Da^3/(3r^2)$.`],
          teach: 'With symmetry and uniqueness, the divergence theorem rebuilds a curl-free field from its sources.',
          explain: t`${inside ? t`Inside: $F = Dr/3 = ${D}(${rr})/3 = ${nice(sf(ans, 4))}$.` : t`Outside: $F = Da^3/(3r^2) = ${D}(${a})^3/(3\cdot${rr}^2) = ${nice(sf(ans, 4))}$.`}`,
        };
      },
    }),
    order({
      id: 'uniqueness', difficulty: 3,
      prompt: t`Put the steps of the **uniqueness** proof in order: two fields $\vec F_1$ and $\vec F_2$ have the same divergence and curl everywhere and both vanish far away.`,
      items: [
        t`Let $\vec W = \vec F_1 - \vec F_2$; then $\nabla\cdot\vec W = 0$ and $\nabla\times\vec W = 0$`,
        t`Curl-free, so $\vec W = -\nabla\varphi$ for some scalar $\varphi$`,
        t`Divergence-free too, so $\nabla^2\varphi = 0$: $\varphi$ is harmonic`,
        t`$\vec W \to 0$ far away, so $\varphi$ tends to a constant there`,
        t`A harmonic function has no interior maxima or minima, so $\varphi$ is that constant everywhere`,
        t`Hence $\vec W = 0$ and $\vec F_1 = \vec F_2$`,
      ],
      visual: fieldPic('x', '-y', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, caption: t`A field with zero divergence and zero curl that does **not** vanish far away: $-\nabla\varphi$ for the harmonic $\varphi = \tfrac12(y^2 - x^2)$. Uniqueness is exactly the statement that the boundary condition kills every such field.` }),
      hints: ['Start from the difference of the two fields.', 'Curl-free gives a potential; divergence-free makes it satisfy Laplace’s equation; the condition at infinity finishes it.'],
      teach: 'Uniqueness: the difference of two solutions is harmonic and vanishes far away, so it is zero.',
      explain: t`The difference $\vec W$ has no sources and no swirl, so $\vec W = -\nabla\varphi$ with $\nabla^2\varphi = 0$. Harmonic functions take their extremes on the boundary (module M4 proves it); with $\varphi$ flat at infinity, it is constant, and $\vec W = 0$. This is the license for the guess-and-check in the worked example.`,
    }),
    match({
      id: 'potentials', difficulty: 2,
      prompt: t`For each field, which potentials can describe it? (Every field here vanishes far from its sources.)`,
      left: [t`$\vec E$ round static charges`, t`$\vec B$ round steady currents`, 'The velocity of water flowing smoothly round a submerged boulder, far from any eddy', 'The velocity of gas in a swirling, expanding cloud'],
      right: ['a scalar potential only (curl-free, with sources)', 'a vector potential only (divergence-free, with swirl)', 'either: it is both curl-free and divergence-free there', 'neither alone: it needs both, −∇V + ∇×A'],
      answer: [0, 1, 2, 3],
      visual: fieldPic('1 + (y^2 - x^2)/(x^2 + y^2)^2', '-2*x*y/(x^2 + y^2)^2', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 17, skip: (x, y) => Math.hypot(x, y) < 1, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.3], color: 'ink3', width: 2 }], caption: 'Ideal flow round a cylinder (the boulder, end-on): no swirl and no sources in the water. Lengths compressed.' }),
      hints: ['Curl-free ⇒ a scalar potential exists. Divergence-free ⇒ a vector potential exists.', t`Static $\vec E$: $\nabla\times\vec E = 0$ but $\nabla\cdot\vec E = \rho/\varepsilon_0$. Steady $\vec B$: $\nabla\cdot\vec B = 0$ but $\nabla\times\vec B = \mu_0\vec J$.`],
      teach: 'Curl-free fields are gradients and divergence-free fields are curls; a field with both sources and swirl needs both parts.',
      explain: t`$\vec E$ has sources but no curl: $-\nabla V$. $\vec B$ has curl but no sources: $\nabla\times\vec A$. Ideal water flow has neither (incompressible and irrotational), so either potential works — engineers use the velocity potential $\varphi$ with $\nabla^2\varphi = 0$. A swirling, expanding gas has both and needs the full decomposition.`,
    }),
    mcq({
      id: 'payoff', difficulty: 2,
      prompt: t`Feed Helmholtz’s theorem the electrostatic equations $\nabla\cdot\vec E = \rho/\varepsilon_0$ and $\nabla\times\vec E = 0$, with $\vec E \to 0$ far away. What comes out?`,
      visual: { type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], charges: [{ x: -3, y: 0, q: 2 }, { x: 3.5, y: 1, q: -1 }], fieldLines: true, arrows: false, probe: false, readouts: [], static: true }, caption: 'The field of two point charges, rebuilt from nothing but their charge density. Field lines only; spacing illustrative.' },
      choices: [t`$V = \dfrac{1}{4\pi\varepsilon_0}\displaystyle\int\frac{\rho(\vec r\,')}{\mathcal R}\,d\tau'$ and $\vec E = -\nabla V$: Coulomb’s law`, t`$\vec E = \dfrac{1}{4\pi\varepsilon_0}\displaystyle\int\frac{\rho\,d\tau'}{\mathcal R}$`, t`Nothing definite: $\vec E$ also needs a vector potential`, t`Laplace’s equation $\nabla^2 V = 0$ everywhere`],
      answer: 0,
      why: {
        1: t`That is a potential, not a field: it has units of V, and it lacks a direction. The field is minus its gradient.`,
        2: t`The vector potential is built from the curl, and here the curl is zero, so $\vec A = 0$.`,
        3: t`$\nabla^2V = -\rho/\varepsilon_0$, Poisson’s equation; it reduces to Laplace’s only where there is no charge.`,
      },
      hints: [t`With $D = \rho/\varepsilon_0$ and $\vec C = 0$, the theorem’s formulas give $V = \tfrac{1}{4\pi}\int\tfrac{\rho/\varepsilon_0}{\mathcal R}d\tau'$ and $\vec A = 0$.`],
      teach: t`Helmholtz with $D = \rho/\varepsilon_0$, $\vec C = 0$ is exactly Coulomb’s law, written as a potential.`,
      explain: t`$\vec A = 0$ and $V = \tfrac{1}{4\pi\varepsilon_0}\int\tfrac{\rho}{\mathcal R}d\tau'$; taking $-\nabla V$ with $\nabla(1/\mathcal R) = -\hat{\mathcal R}/\mathcal R^2$ gives $\vec E = \tfrac{1}{4\pi\varepsilon_0}\int\tfrac{\rho\,\hat{\mathcal R}}{\mathcal R^2}d\tau'$. The differential laws and Coulomb’s law say the same thing — the subject of the next module.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-geomagnetic', difficulty: 3, transfer: true,
      prompt: t`The International Geomagnetic Reference Field, used by spacecraft attitude systems and aircraft compasses, writes Earth’s magnetic field above the ground as $\vec B = -\nabla\Phi_M$ for a scalar potential $\Phi_M$ expanded in spherical harmonics. What fact licenses a **scalar** potential for a magnetic field?`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.9, 1.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [1.6, 2.4, 3.4].flatMap((c) => { const t0 = +Math.asin(Math.sqrt(1 / c)).toFixed(4), t1 = +(Math.PI - t0).toFixed(4); return [{ param: [`${c}*sin(t)^3`, `${c}*sin(t)^2*cos(t)`], t: [t0, t1], color: 'accent', width: 1.4 }, { param: [`-${c}*sin(t)^3`, `${c}*sin(t)^2*cos(t)`], t: [t0, t1], color: 'accent', width: 1.4 }]; }).concat([{ param: ['cos(t)', 'sin(t)'], t: [0, 6.3], color: 'teal', width: 2.5 }]) }, caption: 'Earth (teal) and its dipole-like field lines outside it, in a plane through the magnetic axis. Sketch, not to scale.' },
      choices: [t`Above the ground there is (almost) no current, so $\nabla\times\vec B = \mu_0\vec J \approx 0$ there`, t`$\nabla\cdot\vec B = 0$ everywhere`, t`Earth’s field is nearly static`, t`Earth is nearly a sphere`],
      answer: 0,
      why: {
        1: t`Zero divergence makes $\vec B$ the curl of a **vector** potential, $\vec B = \nabla\times\vec A$. A scalar potential needs zero curl.`,
        2: 'Static fields can still have curl — the steady field inside a current-carrying wire does.',
        3: 'Spherical shape makes spherical harmonics convenient; it does not make a scalar potential possible.',
      },
      hints: ['A field is a gradient where its curl vanishes.', t`Ampère: $\nabla\times\vec B = \mu_0\vec J$. Where is $\vec J$ small?`],
      teach: 'In a current-free region a magnetic field is curl-free, so it is locally the gradient of a scalar potential.',
      explain: t`The currents that make the field flow in the liquid core; between the ground and the ionosphere $\vec J \approx 0$, so $\nabla\times\vec B \approx 0$ and $\vec B = -\nabla\Phi_M$ there, with $\nabla^2\Phi_M = 0$ since $\nabla\cdot\vec B = 0$ too. The model fails where currents flow: in the ionosphere and magnetosphere, which IGRF does not try to describe.`,
    }),
    num({
      id: 'cp-shell-source', difficulty: 3,
      gen(r) {
        const s0 = r.pick([2, 4, 5]), a = r.pick([1, 2]), rr = r.pick([2.5, 3, 4]);
        const ans = (s0 * a * a) / (rr * rr);
        return {
          prompt: t`A curl-free field vanishing far away has its sources concentrated on a sphere: $\nabla\cdot\vec F = ${s0}\,\delta(r - ${a})$ (with $r$ in metres, field in arbitrary units). Find $|\vec F|$ at $r = ${rr}$ m.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [0, 3], aspect: 'wide', xlabel: 'r (m)', ylabel: 'source density', yticks: 0, arrows: [{ from: [a, 0], to: [a, 2.6], color: 'accent', width: 3, label: 'δ(r − a)', labelDx: 8 }], points: [{ x: rr, y: 0, color: 'gold', r: 5, label: 'field point', labelDy: -10 }] }, caption: t`All the source sits on the sphere $r = ${a}$ m, as a spike in $r$. The field point lies outside it.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: s0, feedback: t`That is the size of the source per area, not the field. The total source is $${s0}\cdot4\pi(${a})^2$, spread over a sphere of radius ${rr} m.` },
            { value: (s0 * a) / rr, feedback: t`Check the powers: total source $\propto a^2$ (the sphere’s area), field $\propto 1/r^2$.` },
          ],
          hints: [t`By symmetry $\vec F = F(r)\hat r$, and $F\cdot4\pi r^2 = \int\nabla\cdot\vec F\,d\tau = \int_0^r ${s0}\,\delta(r' - ${a})\,4\pi r'^2\,dr'$.`, t`For $r > ${a}$ the delta is enclosed: the integral is $${s0}\cdot4\pi(${a})^2$.`],
          teach: 'A source written with a delta is integrated like any other: enclosed or not, then the divergence theorem.',
          explain: t`$F\cdot4\pi r^2 = ${s0}\cdot4\pi(${a})^2$, so $F = ${s0}(${a})^2/(${rr})^2 = ${nice(sf(ans, 4))}$; inside the sphere $F = 0$. This is a charged shell with $\sigma/\varepsilon_0 = ${s0}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 2,
      prompt: t`A field has $\nabla\cdot\vec F = 0$ and $\nabla\times\vec F = 0$ everywhere in space, and $\vec F \to 0$ far away. What is $\vec F$?`,
      visual: fieldPic('x', '-y', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, caption: t`A field with zero divergence and curl everywhere: $\langle x, -y\rangle$. It grows without bound far away.` }),
      choices: [t`$\vec F = 0$ everywhere`, 'Any harmonic field, like the one drawn', 'A uniform field', 'It cannot be determined without more information'],
      answer: 0,
      why: {
        1: 'The field drawn has zero divergence and curl but grows far away; the condition at infinity excludes it.',
        2: t`A uniform field does not vanish far away unless it is zero.`,
        3: 'The theorem gives exactly the missing information: with no sources, no swirl and nothing at infinity, there is no field.',
      },
      hints: [t`Helmholtz: $V$ and $\vec A$ are integrals of the sources $D$ and $\vec C$.`],
      teach: 'No sources, no swirl and zero at infinity means no field: uniqueness with zero data.',
      explain: t`$D = 0$ and $\vec C = 0$ give $V = 0$ and $\vec A = 0$, so $\vec F = 0$ — and uniqueness says nothing else fits. Every nonzero static field owes its existence to a charge, a current, or something at the boundary.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.6 and Appendix B', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'NOAA NCEI: International Geomagnetic Reference Field', url: 'https://www.ncei.noaa.gov/products/international-geomagnetic-reference-field' },
  ],
});
