// Divergence and curl of E (Griffiths §2.2.2–2.2.4): ∇·E = ρ/ε₀ derived
// from Coulomb's law with ∇·(𝓡̂/𝓡²) = 4πδ³, ∇×E = 0 for static charges, and
// what each says: the divergence reads the charge density at a point (not
// the field's strength, not the enclosed charge), and the curl test decides
// whether a field could be electrostatic at all. Reading ρ off a given E.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, fieldPic, pickExpr, scene3, sf, boxSurface } from './_toolkit.js';

const t = String.raw;
const E_CHARGE = 1.602176634e-19;

// Long uniformly charged rods seen end-on (ρ/ε₀ = 1 inside, radius 0.8): E = s/2 inside, 0.32/s outside.
const rod = (cx) => `0.32/max((x - ${cx})^2 + y^2, 0.64)`;
const PX = pickExpr('k', [`x*${rod(0)}`, `(x + 1.3)*${rod(-1.3)} - (x - 1.3)*${rod(1.3)}`, `-y*0.5*e^(-(x^2 + y^2)/2)`]);
const QY = pickExpr('k', [`y*${rod(0)}`, `y*${rod(-1.3)} - y*${rod(1.3)}`, `x*0.5*e^(-(x^2 + y^2)/2)`]);

/** A uniformly charged ball (em-field) with field lines, nothing measured. */
const ballPic = (caption, extra = {}) => ({ type: 'em-field', params: { unit: 'cm', qunit: 'nC', x: [-10, 10], y: [-6, 6], balls: [{ x: 0, y: 0, R: 3, Q: 4 }], fieldLines: true, arrows: false, readouts: [], static: true, ...extra }, caption });

export default lesson({
  id: 'phys3600.M1.2',
  title: 'Divergence and curl of E',
  minutes: 14, difficulty: 3,
  equation: t`\nabla\cdot\vec E = \frac{\rho}{\varepsilon_0}, \qquad \nabla\times\vec E = \vec 0`,
  intro: t`Coulomb’s integral gives $\vec E$; these two equations say what $\vec E$ does at each point. Take the divergence of $\vec E = \tfrac{1}{4\pi\varepsilon_0}\int\rho(\vec r\,')\,\hat{\mathcal R}/\mathcal R^2\,d\tau'$. The derivative acts on the field point only, so it passes inside the integral and lands on $\hat{\mathcal R}/\mathcal R^2$, which by [lesson M0.4](#/lesson/phys3600.M0.4) is $4\pi\delta^3(\vec r - \vec r\,')$. The delta sifts out $\rho$ **at the field point**: $\nabla\cdot\vec E = \rho(\vec r)/\varepsilon_0$. The curl is zero because each point charge’s field is central, $f(r)\hat r$, and central fields are curl-free; superposition does the rest. So the divergence of $\vec E$ is a local charge detector, and the curl test tells you whether a field could be electrostatic at all.`,
  symbols: [
    { tex: '\\nabla\\cdot\\vec E', text: t`the divergence of the field at a point, in (N/C)/m = V/m²` },
    { tex: '\\rho', text: t`the charge density **at that same point**, in C/m³` },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{C}^2/(\text{N·m}^2)$` },
    { tex: '\\nabla\\times\\vec E', text: t`the curl of the field, zero for any field made by charges at rest (in general $-\partial\vec B/\partial t$)` },
  ],
  why: t`$\nabla\times\vec E = 0$ is what makes the potential $V$ exist (module M2), and $\nabla\cdot\vec E = \rho/\varepsilon_0$ with it becomes Poisson’s equation, $\nabla^2V = -\rho/\varepsilon_0$, the equation every boundary-value technique in this course solves.`,
  visual: {
    type: 'field2d',
    title: 'A charge detector at the tip of a probe',
    lead: t`Long charged rods seen end-on, with $\rho/\varepsilon_0 = 1$ inside each rod (radius 0.8). Drag the probe: the readout $\nabla\cdot\vec E$ is the charge density where the probe is. The third field is not made by charges at all.`,
    tasks: [
      t`One rod: inside, $\nabla\cdot\vec E = 1$ wherever the probe sits. Just outside the surface the field is at its strongest, yet $\nabla\cdot\vec E = 0$: the divergence counts charge **here**, not field strength.`,
      t`Two rods, $+$ and $-$: the divergence reads $+1$, $-1$ or $0$, and the curl is $0$ everywhere, as it is for every field of static charges.`,
      t`Induced field: the curl is not zero, so no arrangement of static charges could make it. (This is the field a changing magnetic field drives round itself.)`,
    ],
    params: {
      P: PX, Q: QY, x: [-3, 3], y: [-3, 3], probe: [0.3, 0.4],
      choices: [{ key: 'k', label: 'Field', options: [[0, 'One charged rod'], [1, 'Rods + and −'], [2, 'Induced (not static)']], value: 0, explain: t`Rods of uniform charge density; the third field circulates and has no charges at all.` }],
    },
    caption: t`Units with $\rho/\varepsilon_0 = \pm1$ inside the rods. Arrow lengths compressed; the readouts are numerical derivatives at the probe, so they blur within a hair of a rod’s surface, where $\rho$ jumps.`,
  },
  example: {
    prompt: t`Inside a sphere of radius $a = 10$ cm the field is $\vec E = c\,r^2\,\hat r$ with $c = 5000\ \text{V/m}^3$. Find the charge density $\rho(r)$, and check it against the total charge from Gauss’s law.`,
    visual: { type: 'graph', params: { x: [0, 1.15], y: [0, 1.25], aspect: 'wide', xlabel: 'r / a', ylabel: 'scaled', curves: [{ fn: 'x^2', domain: [0, 1], color: 'accent', width: 2.4, label: 'E ∝ r²', labelAt: 0.75, labelDx: -50, labelDy: -10 }, { fn: 'x', domain: [0, 1], color: 'gold', width: 2.4, label: 'ρ ∝ r', labelAt: 0.5, labelDy: -12 }], vlines: [{ x: 1, label: 'r = a', color: 'ink3' }] }, caption: t`Inside the sphere: the field (blue) grows as $r^2$; the charge density it implies (gold) grows as $r$. Both scaled to 1 at the surface.` },
    steps: [
      { label: 'Divergence in spherical', text: t`For a radial field, $\nabla\cdot\vec E = \dfrac{1}{r^2}\dfrac{\partial}{\partial r}\left(r^2E_r\right) = \dfrac{1}{r^2}\dfrac{d}{dr}\left(c\,r^4\right) = 4cr$.` },
      { label: 'Charge density', text: t`$\rho = \varepsilon_0\nabla\cdot\vec E = 4\varepsilon_0 c\,r$: zero at the centre, growing outward. At the surface, $4(8.854\times10^{-12})(5000)(0.1) \approx ${tex(4 * EPS0 * 5000 * 0.1, 3)}\ \text{C/m}^3$.` },
      { label: 'Total charge', text: t`$Q = \int_0^a 4\varepsilon_0 c\,r\cdot4\pi r^2\,dr = 4\pi\varepsilon_0 c\,a^4 \approx ${tex(4 * Math.PI * EPS0 * 5000 * 1e-4, 3)}$ C.` },
      { label: 'Cross-check', text: t`Gauss’s law at the surface: $E(a)\cdot4\pi a^2 = c a^2\cdot4\pi a^2 = Q/\varepsilon_0$ gives the same $Q = 4\pi\varepsilon_0 c a^4$ ✓. The differential and integral forms agree, as the divergence theorem promises.` },
    ],
    answer: t`$\rho = 4\varepsilon_0 c\,r$, reaching $${tex(4 * EPS0 * 5000 * 0.1, 3)}$ C/m³ at the surface; total $Q = 4\pi\varepsilon_0 c a^4 \approx ${tex(4 * Math.PI * EPS0 * 5000 * 1e-4, 3)}$ C.`,
  },
  practice: [
    num({
      id: 'rho-cart', difficulty: 2,
      gen(r) {
        const k = r.pick([100, 200, 500]), [al, be, ga] = r.pick([[1, 2, 3], [2, -1, 3], [3, 1, 1], [1, 1, -1], [4, -2, 1]]);
        const ans = (EPS0 * k * (al + be + ga)) / 1e-9;
        const cx = (c, v) => (c === 1 ? v : c === -1 ? `-${v}` : `${c}${v}`);
        return {
          prompt: t`In some region the field is $\vec E = k\,\langle ${cx(al, 'x')},\ ${cx(be, 'y')},\ ${cx(ga, 'z')}\rangle$ with $k = ${k}\ \text{V/m}^2$. What is the charge density there?`,
          visual: { type: 'c3-flux', params: { F: [`${al}*x`, `${be}*y`, `${ga}*z`], surfaces: [boxSurface([-0.5, 0.5], [-0.5, 0.5], [-0.5, 0.5], 'Box')], readouts: [], flipToggle: false, normals: false, range: 1.2, arrowLen: 0.2 }, caption: 'A small box in the field, tinted where the field leaves (blue) or enters (red). Arrows show direction only. Drag to rotate.' },
          answer: ans, units: 'nC/m^3', tol: { rel: 0.01 },
          errors: [
            { value: (EPS0 * k * al) / 1e-9, feedback: t`That is $\varepsilon_0\,\partial_xE_x$ alone. The divergence adds all three: $\partial_xE_x + \partial_yE_y + \partial_zE_z$.` },
            { value: (k * (al + be + ga)) / EPS0 / 1e-9, feedback: t`Gauss’s law is $\nabla\cdot\vec E = \rho/\varepsilon_0$, so $\rho = \varepsilon_0\nabla\cdot\vec E$ — multiply by $\varepsilon_0$, do not divide.` },
          ],
          hints: [t`$\rho = \varepsilon_0\,\nabla\cdot\vec E$.`, t`$\nabla\cdot\vec E = k(${al} + ${be} + ${ga}) = ${k * (al + be + ga)}\ \text{V/m}^2$.`],
          teach: t`Gauss’s law in differential form reads the charge density off a field: $\rho = \varepsilon_0\nabla\cdot\vec E$.`,
          explain: t`$\rho = \varepsilon_0 k(${al} + ${be} + ${ga}) = (8.854\times10^{-12})(${k * (al + be + ga)}) \approx ${nice(sf(ans, 3))}$ nC/m³, the same everywhere in the region${al + be + ga < 0 ? ' (negative charge)' : ''}.`,
        };
      },
    }),
    mcq({
      id: 'which-static', difficulty: 2,
      prompt: t`Which of these could be an electrostatic field (with $k$ a constant)?`,
      visual: fieldPic('y^2', '2*x*y', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, caption: t`One candidate, $k\langle y^2,\ 2xy + z^2,\ 2yz\rangle$, in the plane $z = 0$ (lengths compressed). Arrows alone cannot settle the question.` }),
      choices: [t`$k\langle y^2,\ 2xy + z^2,\ 2yz\rangle$`, t`$k\langle xy,\ 2yz,\ 3xz\rangle$`, t`$k\langle -y,\ x,\ 0\rangle$`, t`$k\langle z,\ 0,\ -x\rangle$`],
      answer: 0,
      why: {
        1: t`Its curl is $k\langle -2y,\ -3z,\ -x\rangle \ne \vec 0$, so no static charges can produce it.`,
        2: t`Its curl is $\langle 0, 0, 2k\rangle$: it circulates, which a static field never does.`,
        3: t`Its curl is $\langle 0,\ 2k,\ 0\rangle$: $\partial_zE_x - \partial_xE_z = k - (-k)$.`,
      },
      hints: [t`An electrostatic field must have $\nabla\times\vec E = \vec 0$. Compute each curl.`, t`For the first: $\partial_yE_z - \partial_zE_y = 2z - 2z$, and so on.`],
      teach: 'The curl test: a field with nonzero curl anywhere cannot be electrostatic.',
      explain: t`$\nabla\times k\langle y^2,\ 2xy + z^2,\ 2yz\rangle = k\langle 2z - 2z,\ 0 - 0,\ 2y - 2y\rangle = \vec 0$. It is $-\nabla V$ with $V = -k(xy^2 + yz^2)$, and its charge density is $\varepsilon_0k(0 + 2x + 2y)$.`,
    }),
    expr({
      id: 'rho-cyl', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]);
        const pw = (m) => (m === 0 ? '' : m === 1 ? 's' : `s^{${m}}`);
        return {
          prompt: t`Inside a long cylinder the field points straight out from the axis: $\vec E = k\,${pw(n)}\,\hat s$ (cylindrical coordinates; $k$ a constant). Find the charge density $\rho(s)$.`,
          visual: fieldPic(`x*(x^2 + y^2)^(${(n - 1) / 2})*step(1.4 - sqrt(x^2 + y^2))`, `y*(x^2 + y^2)^(${(n - 1) / 2})*step(1.4 - sqrt(x^2 + y^2))`, { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 17, curves: [{ param: ['1.4*cos(t)', '1.4*sin(t)'], t: [0, 6.3], color: 'ink3', width: 1.5, dash: true }], caption: 'The field inside the cylinder (dashed circle), seen end-on; lengths compressed.' }),
          answer: `epsilon_0 k ${n + 1} s^(${n - 1})`, answerTeX: t`${n + 1}\varepsilon_0k${pw(n - 1)}`,
          lhs: '\\rho', vars: { s: [0.5, 2], k: [0.5, 2], epsilon_0: [0.5, 2] },
          keys: [['ε₀', 'epsilon_0']],
          errors: [
            { answer: `epsilon_0 k ${n} s^(${n - 1})`, feedback: t`That is $\varepsilon_0\,dE_s/ds$, the Cartesian habit. In cylindrical coordinates $\nabla\cdot\vec E = \tfrac1s\tfrac{\partial}{\partial s}(sE_s)$.` },
            { answer: `k ${n + 1} s^(${n - 1})/epsilon_0`, feedback: t`$\rho = \varepsilon_0\nabla\cdot\vec E$: multiply by $\varepsilon_0$.` },
          ],
          hints: [t`$\nabla\cdot\vec E = \dfrac1s\dfrac{\partial}{\partial s}\left(s\,E_s\right)$ for a field along $\hat s$.`, t`$s\,E_s = k\,s^{${n + 1}}$; differentiate, divide by $s$, multiply by $\varepsilon_0$.`],
          teach: t`Read $\rho$ off a field with the divergence in the coordinates the field is written in: here $\tfrac1s\partial_s(sE_s)$.`,
          explain: t`$\rho = \varepsilon_0\cdot\tfrac1s\cdot(${n + 1})k\,s^{${n}} = ${n + 1}\varepsilon_0k${pw(n - 1)}$. ${n === 1 ? 'A field growing linearly with s means uniform charge: a uniformly charged rod.' : 'The charge density grows outward.'}`,
        };
      },
    }),
    mcq({
      id: 'div-outside', difficulty: 2,
      prompt: t`A uniformly charged ball carries $+4$ nC. At a point just outside its surface, where the field is strongest, what is $\nabla\cdot\vec E$?`,
      visual: ballPic('The charged ball and its field lines. The field is strongest at the surface and falls as 1/r² outside.', { probe: { x: 3.4, y: 0, label: 'P' } }),
      choices: [t`$0$`, t`$Q/(\varepsilon_0\cdot\tfrac43\pi R^3)$, the ball’s charge per volume over $\varepsilon_0$`, 'Positive, since the field points outward there', t`$E/R$, the field divided by the radius`],
      answer: 0,
      why: {
        1: t`That is the value **inside** the ball. The divergence is local: it reports $\rho$ at the point itself, and outside the ball $\rho = 0$.`,
        2: 'A field pointing outward does not mean outflow from a tiny box: the field spreads but weakens, and the two balance exactly where there is no charge.',
        3: 'The divergence has nothing to do with the field’s size divided by a length; it is a combination of derivatives.',
      },
      hints: [t`$\nabla\cdot\vec E = \rho/\varepsilon_0$ — with $\rho$ evaluated where?`],
      teach: t`$\nabla\cdot\vec E = \rho/\varepsilon_0$ is local: the divergence at a point knows only the charge at that point.`,
      explain: t`Outside the ball $\rho = 0$, so $\nabla\cdot\vec E = 0$ there, even though $\vec E$ is large: $\tfrac{1}{r^2}\tfrac{d}{dr}\left(r^2\cdot\tfrac{kQ}{r^2}\right) = 0$. The flux through a sphere is the same at every radius outside, precisely because no flux is created between them.`,
    }),
    order({
      id: 'derive-gauss', difficulty: 3,
      prompt: t`Put the steps of the derivation of $\nabla\cdot\vec E = \rho/\varepsilon_0$ from Coulomb’s law in order.`,
      items: [
        t`$\vec E(\vec r) = \frac{1}{4\pi\varepsilon_0}\int\rho(\vec r\,')\,\frac{\hat{\mathcal R}}{\mathcal R^2}\,d\tau'$`,
        t`$\nabla$ acts on $\vec r$ only, so it passes inside: $\nabla\cdot\vec E = \frac{1}{4\pi\varepsilon_0}\int\rho(\vec r\,')\,\nabla\cdot\frac{\hat{\mathcal R}}{\mathcal R^2}\,d\tau'$`,
        t`Use $\nabla\cdot\frac{\hat{\mathcal R}}{\mathcal R^2} = 4\pi\,\delta^3(\vec r - \vec r\,')$`,
        t`Sift: $\nabla\cdot\vec E = \frac{1}{\varepsilon_0}\int\rho(\vec r\,')\,\delta^3(\vec r - \vec r\,')\,d\tau' = \frac{\rho(\vec r)}{\varepsilon_0}$`,
      ],
      visual: scene3({ range: 2.6, points: [{ at: [1.5, -1, 0.5], color: 'warn', label: "\\vec r\\,'" }, { at: [-0.5, 1.5, 1.2], color: 'gold', label: '\\vec r' }], vectors: [{ from: [1.5, -1, 0.5], to: [-0.5, 1.5, 1.2], color: 'accent', label: '\\vec{\\mathcal R}' }], spheres: [{ centre: [1.5, -1, 0.5], radius: 0.6, color: 'warn' }] }, t`A blob of source charge around $\vec r\,'$ and the field point $\vec r$: the integral runs over source points, the derivative over the field point. Drag to rotate.`),
      hints: ['Start from Coulomb’s law as an integral.', 'Only after the delta function appears can you sift.'],
      teach: t`Differentiate under the integral sign, replace the divergence of $\hat{\mathcal R}/\mathcal R^2$ by $4\pi\delta^3$, and sift.`,
      explain: t`Coulomb’s law → derivative inside the integral → the delta identity → sifting. The integral form of Gauss’s law then follows by the divergence theorem; the next lesson runs the argument both ways.`,
    }),
    num({
      id: 'line-integral', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]), p = r.pick([1, 2]), q = r.pick([1, 2, 3]), s = r.pick([1, 2]);
        const ans = k * (p * q * q + q * s * s);
        return {
          prompt: t`The static field $\vec E = k\langle y^2,\ 2xy + z^2,\ 2yz\rangle$ with $k = ${k}\ \text{V/m}^3$ (coordinates in metres). Find $\int\vec E\cdot d\vec l$ along the wandering path drawn, from the origin to $(${p}, ${q}, ${s})$ m.`,
          visual: scene3({ range: 3, curves: [{ param: [`${p}*t + 0.8*sin(3*t)`, `${q}*t^2 + 0.6*sin(2*pi*t)`, `${s}*t^3`], t: [0, 1], color: 'gold' }], points: [{ at: [0, 0, 0], color: 'accent', label: 'O' }, { at: [p, q, s], color: 'accent', label: `(${p}, ${q}, ${s})` }] }, t`A wandering path from the origin to the end point. Drag to rotate.`),
          answer: ans, units: 'V', tol: { rel: 0, abs: 1e-6 },
          errors: [
            { value: k * p * q * q, feedback: t`You have the $xy^2$ part of the potential function; $2yz$ and $z^2$ add a $yz^2$ part.` },
          ],
          hints: [t`$\nabla\times\vec E = 0$, so the integral depends only on the end points: find $f$ with $\nabla f = \vec E$.`, t`$f = k(xy^2 + yz^2)$ works; evaluate $f$ at the two ends.`],
          teach: t`For a curl-free field, $\int\vec E\cdot d\vec l = f(\text{end}) - f(\text{start})$ for any path: the fundamental theorem for gradients.`,
          explain: t`$f = k(xy^2 + yz^2)$, so $\int\vec E\cdot d\vec l = ${k}\left[(${p})(${q})^2 + (${q})(${s})^2\right] - 0 = ${ans}$ V, whatever the path. With $V = -f$, the potential drops by ${ans} V from the origin to that point.`,
        };
      },
    }),
    mcq({
      id: 'error-zero-outside', difficulty: 2, kind: 'error',
      prompt: t`A student argues: “Outside the charged ball $\rho = 0$, so $\nabla\cdot\vec E = 0$ there, so $\vec E = 0$ outside the ball.” Where is the mistake?`,
      visual: ballPic('The charged ball and its field lines, which certainly continue outside it.'),
      choices: [t`Zero divergence does not mean zero field: $\vec E \propto \hat r/r^2$ has zero divergence and is not zero`, t`$\nabla\cdot\vec E \ne 0$ outside the ball`, 'Nothing: the field outside a charged ball is zero', t`$\rho$ is not zero outside the ball`],
      answer: 0,
      why: {
        1: t`The first step is right: $\nabla\cdot\vec E = \rho/\varepsilon_0 = 0$ outside. The leap is from there to $\vec E = 0$.`,
        2: t`The field outside is $kQ/r^2$, as any compass for charge would show.`,
        3: 'The ball’s charge is all inside it.',
      },
      hints: ['Name a nonzero field whose divergence is zero.'],
      teach: 'The divergence fixes the field only together with the curl and the boundary conditions; on its own it does not fix the field.',
      explain: t`$\nabla\cdot\vec E = 0$ outside says no field lines **start** there, not that none pass through. Divergence and curl together, with $\vec E \to 0$ at infinity, fix the field — Helmholtz — but one equation in one region fixes nothing.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rho-sph', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 3, 4]), c = r.pick([2, 5, 8]) * 1000, a = r.pick([0.1, 0.2]), rr = a / 2;
        const ans = (EPS0 * c * (n + 2) * rr ** (n - 1)) / 1e-9;
        const pw = n === 1 ? 'r' : `r^{${n}}`;
        return {
          prompt: t`Inside a ball of radius ${a * 100} cm, the field is $\vec E = c\,${pw}\,\hat r$ with $c = ${c}$ in SI units (V/m${n === 1 ? '²' : `^${n + 1}`}). Find the charge density at $r = ${rr * 100}$ cm.`,
          visual: ballPic('A ball of charge and its field lines. Inside, the field grows outward from the centre; how fast tells you the charge density.'),
          answer: ans, units: 'nC/m^3', tol: { rel: 0.01 },
          errors: [
            { value: (EPS0 * c * n * rr ** (n - 1)) / 1e-9, feedback: t`That is $\varepsilon_0\,dE_r/dr$. The spherical divergence is $\tfrac{1}{r^2}\tfrac{d}{dr}(r^2E_r)$: the extra $2E_r/r$ matters.` },
          ],
          hints: [t`$\rho = \varepsilon_0\cdot\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2E_r\right)$.`, t`$r^2E_r = c\,r^{${n + 2}}$, so $\rho = \varepsilon_0c(${n + 2})r^{${n - 1}}$.`],
          teach: t`For a radial field, $\rho = \varepsilon_0\,\tfrac{1}{r^2}\tfrac{d}{dr}(r^2E_r)$.`,
          explain: t`$\rho = (${n + 2})\varepsilon_0c\,r^{${n - 1}} = ${n + 2}(8.854\times10^{-12})(${c})(${rr})^{${n - 1}} \approx ${nice(sf(ans, 3))}$ nC/m³.${n === 1 ? ' Uniform: a field growing linearly with r inside a ball means uniform charge.' : ''}`,
        };
      },
    }),
    num({
      id: 'cp-fair-weather', difficulty: 3, transfer: true,
      gen(r) {
        const E0 = r.pick([100, 120, 150]), H = r.pick([1, 1.5, 2]), z = r.pick([0, 500, 1000]);
        const rho = ((EPS0 * E0) / (H * 1000)) * Math.exp(-z / (H * 1000));
        const ans = rho / 1e-12;
        return {
          prompt: t`In fair weather Earth’s atmosphere carries a downward electric field of about ${E0} V/m at the ground, weakening with height. Model it as $E_z = -${E0}\,e^{-z/H}$ V/m with $H = ${H}$ km ($z$ up). What charge density does this imply at an altitude of ${z} m?`,
          visual: { type: 'graph', params: { x: [0, 3000], y: [-E0 * 1.1, 10], aspect: 'wide', xlabel: 'altitude z (m)', ylabel: 'E_z (V/m)', curves: [{ fn: `-${E0}*e^(-x/${H * 1000})`, color: 'accent', width: 2.4 }], vlines: [{ x: z || 1, label: `${z} m`, color: 'gold' }] }, caption: t`The model field: pointing down (negative $E_z$) and weakening with height. The real profile varies with weather, aerosols and latitude; the exponential is a simplification.` },
          answer: ans, units: 'pC/m^3', tol: { rel: 0.01 },
          errors: [
            { value: (E0 / (H * 1000)) * Math.exp(-z / (H * 1000)) / EPS0 / 1e-12, feedback: t`$\rho = \varepsilon_0\nabla\cdot\vec E$: multiply by $\varepsilon_0$, do not divide.` },
            ...(z > 0 ? [{ value: (EPS0 * E0) / (H * 1000) / 1e-12, feedback: 'That is the value at the ground. Evaluate the derivative at the given altitude.' }] : []),
          ],
          hints: [t`Only $E_z$ is nonzero and it depends only on $z$, so $\nabla\cdot\vec E = dE_z/dz$.`, t`$\dfrac{dE_z}{dz} = \dfrac{${E0}}{H}e^{-z/H}$; then $\rho = \varepsilon_0\,dE_z/dz$, with $H$ in metres.`],
          teach: t`Where a field changes along its own direction, $\nabla\cdot\vec E \ne 0$ and there is charge: $\rho = \varepsilon_0\,dE_z/dz$ for a vertical field.`,
          explain: t`$\rho = \varepsilon_0\tfrac{${E0}}{${H * 1000}}e^{-${z}/${H * 1000}} \approx ${nice(sf(ans, 3))}$ pC/m³ — positive, about ${nice(sf(rho / E_CHARGE / 1e6, 2))} elementary charges per cubic centimetre. The atmosphere’s net positive space charge is real and of this order; it balances the negative charge on the ground.`,
        };
      },
    }),
    mcq({
      id: 'cp-induced', difficulty: 2,
      prompt: t`Round a long solenoid whose current is ramping up, the electric field circles the axis: $\vec E = k\langle -y,\ x,\ 0\rangle$ inside. Could any arrangement of **static** charges produce this field?`,
      visual: fieldPic('-y', 'x', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, caption: 'The circulating field, seen down the solenoid’s axis. Lengths compressed.' }),
      choices: [t`No: its curl is $2k\hat z \ne 0$, and every electrostatic field is curl-free`, t`Yes, a ring of charge round the axis`, t`Yes, because its divergence is zero`, 'Only if the charges are arranged in a circle'],
      answer: 0,
      why: {
        1: t`A ring of charge makes a field that points out of (or into) its plane along the axis — curl-free, like every static field.`,
        2: 'Zero divergence says only that there is no charge here; a field can be divergence-free and still not electrostatic.',
        3: 'No arrangement of charges at rest can make a field with curl, circular or not.',
      },
      hints: [t`Compute $\nabla\times\vec E$.`],
      teach: 'A field with curl cannot be produced by static charges; in electrodynamics its curl is −∂B/∂t.',
      explain: t`$\nabla\times\vec E = \langle 0, 0, 2k\rangle$. Static charges give $\nabla\times\vec E = 0$, so this field must come from something else — Faraday’s law, $\nabla\times\vec E = -\partial\vec B/\partial t$, the subject of PHYS 4600.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.2', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Rycroft, Israelsson & Price, The global atmospheric electric circuit (J. Atmos. Sol.-Terr. Phys. 62, 2000)', url: 'https://doi.org/10.1016/S1364-6826(00)00112-7' },
  ],
});
