// Curvilinear coordinates, the physicist's working version (Griffiths §1.4,
// App. A): spherical and cylindrical coordinates, the line and volume
// elements, unit vectors that turn from point to point (so r̂ cannot leave an
// integral), and the div, curl, gradient and Laplacian formulas, which all
// follow from the scale factors 1, r, r sinθ. The tensor derivation lives in
// st-a.A9.1; the integration side in math2210.C3-4.5.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { fieldPic, scene3, sf, th } from './_toolkit.js';

const t = String.raw;
const PI = Math.PI;
const D = PI / 180;

/** Arrows of r̂ at points of a sphere of radius R (calc-vectors3d). */
const rhatArrows = (R, n = 10) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const tt = Math.acos(1 - (2 * (i + 0.5)) / n), ph = 2.39996 * i;
    const p = [Math.sin(tt) * Math.cos(ph), Math.sin(tt) * Math.sin(ph), Math.cos(tt)];
    out.push({ from: p.map((v) => +(R * v).toFixed(4)), to: p.map((v) => +((R + 0.8) * v).toFixed(4)), color: 'gold' });
  }
  return out;
};

export default lesson({
  id: 'phys3600.M0.3',
  title: 'Curvilinear coordinates',
  minutes: 14, difficulty: 3,
  intro: t`Spheres, wires and rings beg for spherical $(r, \theta, \phi)$ or cylindrical $(s, \phi, z)$ coordinates. Everything you need follows from one fact: a small step changes the three coordinates, and each change moves you a distance set by a **scale factor**:

$$d\vec l = dr\,\hat r + r\,d\theta\,\hat\theta + r\sin\theta\,d\phi\,\hat\phi, \qquad d\tau = r^2\sin\theta\,dr\,d\theta\,d\phi$$

Turning the angle $\theta$ by $d\theta$ moves you $r\,d\theta$, and turning $\phi$ moves you $r\sin\theta\,d\phi$, round a circle of radius $r\sin\theta$. Two warnings carry the rest. The unit vectors $\hat r, \hat\theta, \hat\phi$ **turn** as the point moves, so they cannot be pulled out of an integral or treated as constants when differentiating. And the operator formulas carry those scale factors:

$$\nabla\cdot\vec v = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2 v_r\right) + \frac{1}{r\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\,v_\theta\right) + \frac{1}{r\sin\theta}\frac{\partial v_\phi}{\partial\phi}$$

The tensor view, where all of these come from the metric, is in [Tensor calculus A9.1](#/lesson/st-a.A9.1).`,
  symbols: [
    { tex: 'r', text: 'distance from the origin, in m' },
    { tex: '\\theta', text: t`the polar angle, measured down from the $+z$ axis, $0 \le \theta \le \pi$ (physics convention)` },
    { tex: '\\phi', text: t`the azimuth, measured round from the $+x$ axis in the $xy$-plane, $0 \le \phi < 2\pi$` },
    { tex: 's', text: t`cylindrical distance from the $z$-axis, $s = r\sin\theta$ (Griffiths’ letter; many books use $\rho$, which here means charge density)` },
    { tex: '\\hat r,\\ \\hat\\theta,\\ \\hat\\phi', text: t`unit vectors pointing the way $r$, $\theta$, $\phi$ increase; they depend on where you are. (The coordinate basis vectors of tensor calculus are $\partial_\theta = r\hat\theta$ and $\partial_\phi = r\sin\theta\,\hat\phi$.)` },
    { tex: 'd\\tau', text: t`the volume element, $r^2\sin\theta\,dr\,d\theta\,d\phi$ in spherical and $s\,ds\,d\phi\,dz$ in cylindrical coordinates` },
    { tex: 'v_r,\\ v_\\theta,\\ v_\\phi', text: t`the components of $\vec v = v_r\hat r + v_\theta\hat\theta + v_\phi\hat\phi$ along the local unit vectors` },
  ],
  why: t`Gauss’s law, the multipole expansion and Legendre polynomials all live in spherical coordinates; getting the scale factors right is most of the work.`,
  visual: {
    type: 'c3-coords',
    title: 'Three surfaces, three unit vectors, one small box',
    lead: t`The point sits where a sphere ($r$ fixed), a cone ($\theta$ fixed) and a half-plane ($\phi$ fixed) meet. The unit vectors ride with it, and the small box has edges $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$.`,
    tasks: [
      t`Slide $\theta$ toward $0^\circ$: the $\phi$-edge, $r\sin\theta\,d\phi$, shrinks to nothing — near the pole, changing $\phi$ hardly moves you. That $\sin\theta$ is in $d\tau$ and in the divergence formula.`,
      t`Move the point round in $\phi$ and watch $\hat r$ and $\hat\phi$ turn. Two points, two different $\hat r$: that is why $\hat r$ cannot leave an integral.`,
      t`Double $r$: the $\theta$- and $\phi$-edges double, so the box’s volume grows as $r^2$ — the $r^2$ in $d\tau$.`,
    ],
    params: { system: 'spherical', choose: true, point: [2.2, 55, 40], element: true, elementToggle: true, readouts: ['x', 'y', 'z'] },
    caption: t`Physics convention: $\theta$ from the $+z$ axis, $\phi$ from the $+x$ axis. The cylindrical mode labels the distance from the axis $\rho$; this lesson calls it $s$. The box is drawn with exaggerated steps so its edges are visible.`,
  },
  example: {
    prompt: t`Find the divergence of $\vec v = r\cos\theta\,\hat r - r\sin\theta\,\hat\theta$, and check the answer in Cartesian coordinates.`,
    visual: fieldPic('0', 'sqrt(x^2 + y^2)', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, xlabel: 'x', ylabel: 'z', caption: t`A slice of $\vec v$ through the $xz$-plane (vertical axis $z$): every arrow points up, with length equal to the distance from the origin. Lengths compressed.` }),
    steps: [
      { label: 'Read the components', text: t`$v_r = r\cos\theta$, $v_\theta = -r\sin\theta$, $v_\phi = 0$.` },
      { label: 'Radial term', text: t`$\dfrac{1}{r^2}\dfrac{\partial}{\partial r}\left(r^2\cdot r\cos\theta\right) = \dfrac{3r^2\cos\theta}{r^2} = 3\cos\theta$.` },
      { label: 'Polar term', text: t`$\dfrac{1}{r\sin\theta}\dfrac{\partial}{\partial\theta}\left(\sin\theta\cdot(-r\sin\theta)\right) = \dfrac{-2r\sin\theta\cos\theta}{r\sin\theta} = -2\cos\theta$.` },
      { label: 'Add', text: t`$\nabla\cdot\vec v = 3\cos\theta - 2\cos\theta = \cos\theta$.` },
      { label: 'Cartesian check', text: t`Since $\hat z = \cos\theta\,\hat r - \sin\theta\,\hat\theta$, the field is $\vec v = r\,\hat z = \sqrt{x^2 + y^2 + z^2}\,\hat z$, and $\nabla\cdot\vec v = \partial_z\sqrt{x^2 + y^2 + z^2} = z/r = \cos\theta$ ✓. Had you differentiated as if $\partial_r v_r + \partial_\theta v_\theta$ were enough, you would have got $\cos\theta - r\cos\theta$, which is not even dimensionally consistent.` },
    ],
    answer: t`$\nabla\cdot\vec v = \cos\theta$ (that is, $z/r$).`,
  },
  practice: [
    mcq({
      id: 'rhat-integral', difficulty: 2,
      prompt: t`What is $\displaystyle\oint_{\text{sphere}}\hat r\,da$, the sum of the outward unit vectors over a whole sphere of radius $R$, each weighted by its patch of area?`,
      visual: scene3({ range: 2.2, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'teal' }], vectors: rhatArrows(1, 14) }, t`The sphere and $\hat r$ at fourteen spread-out points (gold). Drag to rotate.`),
      choices: [t`$\vec 0$`, t`$4\pi R^2\,\hat r$`, t`$4\pi R^2$`, t`$2\pi R^2\,\hat z$`],
      answer: 0,
      why: {
        1: t`That pulls $\hat r$ out of the integral as if it were constant. On a sphere it points every way at once; there is no single “$\hat r$” left to write in front.`,
        2: 'The integrand is a vector, so the answer must be a vector. The scalar 4πR² is the integral of da alone.',
        3: t`That is the sum over the upper hemisphere only ($\int\hat r\,da = \pi R^2\hat z$ there, in fact). The lower half cancels it.`,
      },
      hints: [t`Write $\hat r$ in Cartesian components: $\hat r = \sin\theta\cos\phi\,\hat x + \sin\theta\sin\phi\,\hat y + \cos\theta\,\hat z$. Those unit vectors **are** constant.`, t`Integrate each component with $da = R^2\sin\theta\,d\theta\,d\phi$: for the $z$-part, $\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.`],
      teach: t`$\hat r$, $\hat\theta$, $\hat\phi$ vary with position; to integrate a vector, convert to $\hat x, \hat y, \hat z$, which do not.`,
      explain: t`In Cartesian components every term integrates to zero: $\int_0^{2\pi}\cos\phi\,d\phi = \int_0^{2\pi}\sin\phi\,d\phi = 0$ and $\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$. Opposite patches cancel in pairs. The same trap catches field calculations: before integrating $d\vec E$ over a charge, express $\hat{\mathcal R}$ in fixed unit vectors.`,
    }),
    expr({
      id: 'curl-cyl', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3, -2]);
        const nT = n === 1 ? 's' : `s^{${n}}`;
        const pow = (m) => (m === 0 ? '' : m === 1 ? 's' : `s^{${m}}`);
        return {
          prompt: t`A swirling flow has $\vec v = ${nT}\,\hat\phi$ in cylindrical coordinates $(s, \phi, z)$. Find the $z$-component of its curl, $(\nabla\times\vec v)_z = \dfrac1s\dfrac{\partial}{\partial s}\left(s\,v_\phi\right) - \dfrac1s\dfrac{\partial v_s}{\partial\phi}$, in terms of $s$.`,
          visual: fieldPic(`-y*(x^2 + y^2)^(${(n - 1) / 2})`, `x*(x^2 + y^2)^(${(n - 1) / 2})`, { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.25, caption: t`The flow $${nT}\hat\phi$ seen down the $z$-axis: circles round the axis, ${n > 0 ? 'faster' : 'slower'} further out. Lengths compressed.` }),
          answer: `${n + 1} s^(${n - 1})`, answerTeX: t`${n + 1}${pow(n - 1)}`,
          lhs: '(\\nabla\\times\\vec v)_z', vars: { s: [0.5, 2] },
          errors: [
            { answer: `${n} s^(${n - 1})`, feedback: t`That is $\partial v_\phi/\partial s$ alone. The formula differentiates $s\,v_\phi$ and then divides by $s$: the extra term is the turning of $\hat\phi$ itself.` },
          ],
          hints: [t`$s\,v_\phi = s^{${n + 1}}$; differentiate it with respect to $s$.`, t`$\dfrac{d}{ds}s^{${n + 1}} = (${n + 1})s^{${n}}$; now divide by $s$.`],
          teach: t`In cylindrical coordinates the curl of $v_\phi\hat\phi$ is $\tfrac1s\partial_s(s\,v_\phi)\,\hat z$: the factor $s$ is the scale factor of $\phi$.`,
          explain: t`$\tfrac1s\tfrac{d}{ds}\big(s^{${n + 1}}\big) = (${n + 1})s^{${n - 1}}$. Rigid rotation, $\vec v = \omega s\,\hat\phi$, gives $2\omega$: the curl is twice the angular velocity. ${n === -2 ? 'Here it is negative: the fluid near the axis outruns the fluid outside, and a paddle wheel turns backwards.' : ''}`,
        };
      },
    }),
    num({
      id: 'cap-charge', difficulty: 2,
      gen(r) {
        const R = r.pick([5, 8, 10, 12]), s0 = r.pick([20, 30, 40, 50]);
        const ans = PI * s0 * (R / 100) ** 2;
        return {
          prompt: t`A hemispherical shell of radius ${R} cm (the half $z \ge 0$) carries surface charge $\sigma = \sigma_0\cos\theta$ with $\sigma_0 = ${s0}$ nC/m². What is its total charge?`,
          visual: { type: 'c3-flux', params: { surfaces: [{ label: 'Shell', x: 'sin(u)*cos(v)', y: 'sin(u)*sin(v)', z: 'cos(u)', u: [0, 'pi/2'], v: [0, '2*pi'] }], F: ['0', '0', '1'], integrand: 'flux', arrows: false, normals: false, readouts: [], flipToggle: false, range: 1.4 }, caption: t`The hemisphere tinted by $\cos\theta$: deepest at the top ($\theta = 0$), fading to nothing at the rim ($\theta = 90^\circ$). Drag to rotate.` },
          answer: ans, units: 'nC', tol: { rel: 0.005 },
          errors: [
            { value: 2 * PI * s0 * (R / 100) ** 2, feedback: t`That is $\sigma_0$ times the hemisphere’s area $2\pi R^2$, as if the charge were uniform. Weight each patch by $\cos\theta$.` },
            { value: PI * s0 * (R / 100) ** 2 * 2 / PI, feedback: t`Check the area element: on a sphere it is $R^2\sin\theta\,d\theta\,d\phi$, and $\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = \tfrac12$.` },
          ],
          hints: [t`$Q = \int\sigma\,da$ with $da = R^2\sin\theta\,d\theta\,d\phi$, $\theta$ from $0$ to $\pi/2$.`, t`$Q = \sigma_0R^2\int_0^{2\pi}d\phi\int_0^{\pi/2}\cos\theta\sin\theta\,d\theta = \sigma_0R^2\cdot2\pi\cdot\tfrac12$.`],
          teach: t`The area element on a sphere is $R^2\sin\theta\,d\theta\,d\phi$; the $\sin\theta$ shrinks the rings near the pole.`,
          explain: t`$Q = \pi\sigma_0R^2 = \pi(${s0}\ \text{nC/m}^2)(${R / 100}\ \text{m})^2 \approx ${nice(sf(ans, 3))}$ nC.`,
        };
      },
    }),
    num({
      id: 'dipole-Etheta', difficulty: 3,
      gen(r) {
        const k = r.pick([2, 4, 6, 9]), rr = r.pick([0.5, 1, 2]), thd = r.pick([30, 60, 90, 120]);
        const ans = (k * Math.sin(thd * D)) / rr ** 3;
        return {
          prompt: t`Far from a pair of opposite charges, the potential is $V(r, \theta) = \dfrac{k\cos\theta}{r^2}$ with $k = ${k}\ \text{V·m}^2$. Find the polar component $E_\theta$ of $\vec E = -\nabla V$ at $r = ${rr}$ m, $\theta = ${thd}^\circ$.`,
          visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [1, 2, 3].map((c) => ({ param: [`${0.6 * c}*sin(t)^2*sin(t)`, `${0.6 * c}*sin(t)^2*cos(t)`], t: [0, 2 * PI], color: 'accent', width: 1.3 })).concat([1, 2, 3].map((c) => ({ param: [`-${0.6 * c}*sin(t)^2*sin(t)`, `${0.6 * c}*sin(t)^2*cos(t)`], t: [0, 2 * PI], color: 'accent', width: 1.3 }))), points: [{ x: 0, y: 0.06, color: 'bad', r: 4 }, { x: 0, y: -0.06, color: 'accent', r: 4 }, { x: +(1.3 * Math.sin(thd * D)).toFixed(3), y: +(1.3 * Math.cos(thd * D)).toFixed(3), color: 'gold', r: 5, label: 'P' }], arrows: [{ from: [0, 0], to: [0, 1.5], color: 'ink3', label: 'z' }] }, caption: t`Field lines of the pair (sketch) in a plane through the $z$-axis, and the point $P$ at polar angle $${thd}^\circ$. Not to scale.` },
          answer: ans, units: 'V/m', tol: { rel: 0.005 },
          errors: [
            ...(rr === 1 ? [] : [{ value: ans * rr, feedback: t`The $\theta$-component of the gradient is $\tfrac1r\tfrac{\partial V}{\partial\theta}$: a step $d\theta$ moves you $r\,d\theta$, not $d\theta$. Your answer has the wrong units.` }]),
            ...(thd !== 90 ? [{ value: (2 * k * Math.cos(thd * D)) / rr ** 3, feedback: t`That is $E_r = -\partial V/\partial r$. The question asks for $E_\theta$.` }] : []),
          ],
          hints: [t`$\nabla V = \dfrac{\partial V}{\partial r}\hat r + \dfrac1r\dfrac{\partial V}{\partial\theta}\hat\theta + \dfrac{1}{r\sin\theta}\dfrac{\partial V}{\partial\phi}\hat\phi$.`, t`$E_\theta = -\dfrac1r\dfrac{\partial V}{\partial\theta} = \dfrac{k\sin\theta}{r^3}$.`],
          teach: t`Each gradient component divides by its scale factor: $\nabla V\cdot\hat\theta = \tfrac1r\,\partial_\theta V$.`,
          explain: t`$E_\theta = -\tfrac1r\partial_\theta\big(k\cos\theta/r^2\big) = k\sin\theta/r^3 = ${k}\sin ${thd}^\circ/(${rr})^3 \approx ${nice(sf(ans, 4))}$ V/m. With $E_r = 2k\cos\theta/r^3$ this is the field of a dipole, met properly in module M4.`,
        };
      },
    }),
    expr({
      id: 'laplacian-sph', difficulty: 3,
      prompt: t`Find $\nabla^2 T$ for $T = r^2\cos\theta$, using
$$\nabla^2 T = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial T}{\partial r}\right) + \frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\,\frac{\partial T}{\partial\theta}\right) + \frac{1}{r^2\sin^2\theta}\frac{\partial^2 T}{\partial\phi^2}.$$`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'z', curves: [0.5, 1, 2, 3].flatMap((c) => [{ param: [`(${c}/abs(cos(t)))^0.5*sin(t)`, `(${c}/abs(cos(t)))^0.5*cos(t)`], t: [-1.4, 1.4], color: 'accent', width: 1.4 }, { param: [`(${c}/abs(cos(t)))^0.5*sin(t)`, `-(${c}/abs(cos(t)))^0.5*cos(t)`], t: [-1.4, 1.4], color: 'bad', width: 1.4 }]) }, caption: t`Level curves of $T = r^2\cos\theta = z\sqrt{x^2 + z^2}$ in the $xz$-plane: positive above the plane $z = 0$ (blue), negative below (red).` },
      answer: '4 cos(theta)', answerTeX: t`4\cos\theta`, lhs: '\\nabla^2 T', vars: { r: [0.5, 2], theta: [0.2, 2.9] },
      errors: [
        { answer: '6 cos(theta)', feedback: t`That is the radial term alone. The angular term contributes $\tfrac{1}{r^2\sin\theta}\partial_\theta(\sin\theta\cdot(-r^2\sin\theta)) = -2\cos\theta$.` },
        { answer: '2 cos(theta)', feedback: t`$\partial_r^2(r^2\cos\theta) = 2\cos\theta$ is the Cartesian habit. The radial part is $\tfrac1{r^2}\partial_r(r^2\partial_rT) = 6\cos\theta$, and the angular part adds $-2\cos\theta$.` },
      ],
      hints: [t`Radial: $\partial_rT = 2r\cos\theta$, so $\tfrac1{r^2}\partial_r(2r^3\cos\theta) = 6\cos\theta$.`, t`Angular: $\partial_\theta T = -r^2\sin\theta$, so $\tfrac{1}{r^2\sin\theta}\partial_\theta(-r^2\sin^2\theta) = -2\cos\theta$.`],
      teach: 'The spherical Laplacian has a radial and an angular part; forgetting the angular part is the commonest slip.',
      explain: t`$6\cos\theta - 2\cos\theta = 4\cos\theta$. Check in Cartesian form: $T = rz$, and $\nabla^2(rz) = z\nabla^2r + 2\nabla r\cdot\nabla z = z\cdot\tfrac2r + 2\tfrac zr = \tfrac{4z}{r} = 4\cos\theta$ ✓.`,
    }),
    match({
      id: 'elements', difficulty: 1,
      prompt: t`Match each element to its expression. (Cylindrical coordinates are $s, \phi, z$; spherical are $r, \theta, \phi$.)`,
      left: [t`Volume element $d\tau$, spherical`, t`Volume element $d\tau$, cylindrical`, t`Area element on the sphere $r = R$`, t`Length of a step $d\phi$ at fixed $r$ and $\theta$`],
      right: ['r² sinθ dr dθ dφ', 's ds dφ dz', 'R² sinθ dθ dφ', 'r sinθ dφ', 'r sinθ dr dθ dφ', 'ds dφ dz', 'r dφ'],
      answer: [0, 1, 2, 3],
      visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, 60, 35], element: true, sliders: false, readouts: [], edgeLabels: false }, caption: t`The spherical volume element as a small box at a point, with its edge lengths hidden. Drag to rotate.` },
      hints: [t`Each volume element is the product of the three edge lengths: $dr$, $r\,d\theta$, $r\sin\theta\,d\phi$ for spherical; $ds$, $s\,d\phi$, $dz$ for cylindrical.`],
      teach: 'Every element is a product of edge lengths, each a coordinate step times its scale factor.',
      explain: t`$d\tau = (dr)(r\,d\theta)(r\sin\theta\,d\phi) = r^2\sin\theta\,dr\,d\theta\,d\phi$; cylindrical $(ds)(s\,d\phi)(dz)$; on the sphere drop $dr$ and set $r = R$; and a step in $\phi$ moves round a circle of radius $r\sin\theta$.`,
    }),
    mcq({
      id: 'error-div-sph', difficulty: 2, kind: 'error',
      prompt: t`A student finds the divergence of $\vec v = \hat r/r$ by differentiating the radial component: “$\nabla\cdot\vec v = \dfrac{\partial}{\partial r}\left(\dfrac1r\right) = -\dfrac{1}{r^2}$, so the field has a sink everywhere.” What is the divergence really?`,
      visual: fieldPic('x/(x^2 + y^2)', 'y/(x^2 + y^2)', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, toScale: 0.35, skip: (x, y) => Math.hypot(x, y) < 0.4, caption: t`A plane slice through the 3D field $\hat r/r$, arrows to scale. They weaken outward, but more slowly than the spheres they cross grow.` }),
      choices: [t`$+1/r^2$: a source everywhere`, t`$-1/r^2$: the student is right`, t`$0$: it is a radial field`, t`$2/r$`],
      answer: 0,
      why: {
        1: t`$\partial_r v_r$ is the Cartesian habit. In spherical coordinates the divergence is $\tfrac1{r^2}\partial_r(r^2v_r)$; the $r^2$ accounts for the growing area of the spheres.`,
        2: t`Only $\hat r/r^2$ is divergence-free (away from the origin). Here $r^2v_r = r$, which is not constant.`,
        3: t`That is $\nabla\cdot\hat r$, the field with $v_r = 1$. Here $v_r = 1/r$.`,
      },
      hints: [t`Use $\nabla\cdot\vec v = \tfrac1{r^2}\partial_r(r^2v_r)$ for a purely radial field.`, t`$r^2v_r = r$.`],
      teach: t`The radial part of the spherical divergence is $\tfrac1{r^2}\partial_r(r^2v_r)$, never just $\partial_rv_r$.`,
      explain: t`$\tfrac1{r^2}\partial_r(r^2\cdot\tfrac1r) = \tfrac{1}{r^2}$: positive. The field weakens outward, but the spheres it crosses grow as $r^2$, faster than the field falls, so more flux leaves each shell than enters it. Only for $v_r \propto 1/r^2$ do the two balance.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-div-theta', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2, 3]);
        const pw = (m) => (m === 0 ? '' : m === 1 ? 'r' : `r^{${m}}`);
        return {
          prompt: t`Find the divergence of $\vec v = ${pw(n)}\sin\theta\,\hat\theta$ (spherical coordinates).`,
          visual: fieldPic(`(x^2 + y^2)^(${(n - 1) / 2})*y*x/sqrt(x^2 + y^2)`, `-(x^2 + y^2)^(${(n - 1) / 2})*x*x/sqrt(x^2 + y^2)`, { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.2, xlabel: 'x', ylabel: 'z', caption: t`A slice through the $xz$-plane: $\hat\theta$ points “south”, along the circles of longitude, and the field is strongest at the equator. Lengths compressed.` }),
          answer: `2 r^(${n - 1}) cos(theta)`, answerTeX: t`2${pw(n - 1)}\cos\theta`,
          lhs: '\\nabla\\cdot\\vec v', vars: { r: [0.5, 2], theta: [0.2, 2.9] },
          errors: [
            { answer: `r^(${n - 1}) cos(theta)`, feedback: t`Differentiate $\sin\theta\,v_\theta = ${pw(n)}\sin^2\theta$, not $v_\theta$ alone: the derivative of $\sin^2\theta$ is $2\sin\theta\cos\theta$.` },
            { answer: `r^(${n}) cos(theta)`, feedback: t`That is $\partial_\theta v_\theta$, the Cartesian habit. The $\theta$-term is $\tfrac{1}{r\sin\theta}\partial_\theta(\sin\theta\,v_\theta)$.` },
          ],
          hints: [t`Only the $\theta$-term survives: $\dfrac{1}{r\sin\theta}\dfrac{\partial}{\partial\theta}\left(\sin\theta\,v_\theta\right)$.`, t`$\sin\theta\,v_\theta = ${pw(n)}\sin^2\theta$, whose $\theta$-derivative is $2${pw(n)}\sin\theta\cos\theta$.`],
          teach: t`The $\theta$-part of the divergence is $\tfrac{1}{r\sin\theta}\partial_\theta(\sin\theta\,v_\theta)$.`,
          explain: t`$\dfrac{1}{r\sin\theta}\cdot2${pw(n)}\sin\theta\cos\theta = 2${pw(n - 1)}\cos\theta$: positive in the northern hemisphere, where the lines of longitude spread apart going south, and negative in the southern, where they converge on the pole.`,
        };
      },
    }),
    num({
      id: 'cp-footprint', difficulty: 3, transfer: true,
      gen(r) {
        const RE = 6371;
        const [name, rk] = r.pick([['the International Space Station', RE + 420], ['a GPS satellite', 26560], ['a geostationary satellite', 42164], ['a Starlink satellite', RE + 550]]);
        const c = RE / rk, ans = 100 * (1 - c) / 2;
        const tm = Math.acos(c), sc = Math.min(1.25, 3.2 / (rk / RE));
        const sy = (rk / RE) * sc;
        return {
          prompt: t`What percentage of Earth’s surface can ${name} see at one moment, from ${th(rk)} km from Earth’s centre? Treat Earth as a sphere of radius 6 371 km; the visible region is the cap within polar angle $\theta_{\max}$ of the point beneath the satellite, where $\cos\theta_{\max} = R_E/r$.`,
          visual: { type: 'graph', params: { x: [-1.9, 1.9], y: [-1.3, sy + 0.25], equal: true, aspect: 'square', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: [`${sc}*cos(t)`, `${sc}*sin(t)`], t: [0, 2 * PI], color: 'teal', width: 2 }, { param: [`${sc}*sin(t)`, `${sc}*cos(t)`], t: [-tm, tm], color: 'gold', width: 5 }], points: [{ x: 0, y: +sy.toFixed(3), color: 'gold', r: 5, label: 'satellite' }, { x: 0, y: 0, color: 'ink3', r: 3 }], arrows: [{ from: [0, +sy.toFixed(3)], to: [+(sc * Math.sin(tm)).toFixed(3), +(sc * Math.cos(tm)).toFixed(3)], color: 'ink3', dash: true }, { from: [0, +sy.toFixed(3)], to: [-(sc * Math.sin(tm)).toFixed(3), +(sc * Math.cos(tm)).toFixed(3)], color: 'ink3', dash: true }] }, caption: t`Earth in cross-section (teal) and the visible cap (gold) bounded by the lines of sight that graze the surface. To scale.` },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: 100 * (1 - c), feedback: t`The cap’s area is $2\pi R_E^2(1 - \cos\theta_{\max})$; divide by the **whole** sphere, $4\pi R_E^2$, not by $2\pi R_E^2$.` },
            { value: (100 * tm) / PI, feedback: t`Area does not grow in proportion to the angle: integrate $R_E^2\sin\theta\,d\theta\,d\phi$ — the rings near the pole are small.` },
          ],
          hints: [t`Cap area $= \int_0^{2\pi}\!\int_0^{\theta_{\max}}R_E^2\sin\theta\,d\theta\,d\phi = 2\pi R_E^2(1 - \cos\theta_{\max})$.`, t`Fraction $= (1 - \cos\theta_{\max})/2$ with $\cos\theta_{\max} = ${nice(sf(c, 4))}$.`],
          teach: t`A polar cap of half-angle $\alpha$ on a sphere has area $2\pi R^2(1 - \cos\alpha)$, from $da = R^2\sin\theta\,d\theta\,d\phi$.`,
          explain: t`$\cos\theta_{\max} = 6371/${th(rk)} = ${nice(sf(c, 4))}$, so the fraction is $(1 - ${nice(sf(c, 4))})/2 \approx ${nice(sf(ans, 3))}\%$. ${rk > 40000 ? 'This is why three geostationary satellites can nearly cover the globe (apart from the poles).' : rk < 8000 ? 'A low orbit sees only a small patch, which is why communication constellations need hundreds of satellites.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'cp-wire-curl', difficulty: 2,
      prompt: t`Outside a long straight wire the magnetic field is $\vec B = \dfrac{\mu_0 I}{2\pi s}\,\hat\phi$, circling the wire. What is $\nabla\times\vec B$ at points outside the wire?`,
      visual: fieldPic('-y/(x^2 + y^2)', 'x/(x^2 + y^2)', { x: [-3.2, 3.2], y: [-1.6, 1.6], n: 15, skip: (x, y) => Math.hypot(x, y) < 0.35, points: [{ x: 0, y: 0, color: 'warn', r: 6, label: 'wire (current out of page)', labelDx: 10, labelDy: 14 }], caption: 'The field round the wire, seen end-on; lengths compressed. Field lines are circles.' }),
      choices: [t`$\vec 0$`, t`$\dfrac{\mu_0 I}{2\pi s^2}\,\hat z$, from the circling`, t`$-\dfrac{\mu_0 I}{2\pi s^2}\,\hat z$, from the weakening`, t`$\mu_0 I\,\hat z$ everywhere`],
      answer: 0,
      why: {
        1: t`Circling arrows are not curl. With $v_\phi \propto 1/s$, $s\,v_\phi$ is constant and $\tfrac1s\partial_s(s\,v_\phi) = 0$.`,
        2: 'The weakening and the turning of φ̂ cancel exactly; neither survives alone.',
        3: t`Ampère’s law in differential form says $\nabla\times\vec B = \mu_0\vec J$, and outside the wire there is no current.`,
      },
      hints: [t`Use $(\nabla\times\vec B)_z = \tfrac1s\partial_s(s\,B_\phi)$.`],
      teach: t`The $1/s$ field circling a wire is curl-free outside it: all its curl sits on the wire, where the current is.`,
      explain: t`$s\,B_\phi = \mu_0 I/2\pi$ is constant, so the curl is zero outside the wire, as $\nabla\times\vec B = \mu_0\vec J$ requires there. Yet $\oint\vec B\cdot d\vec l = \mu_0 I$ round any loop enclosing the wire: the curl is concentrated on the wire, like the divergence of a point charge’s field, the subject of the next lesson.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.4 and Appendix A', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
  ],
});
