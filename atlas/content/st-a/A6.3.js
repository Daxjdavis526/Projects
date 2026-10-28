// The metric in polar and spherical coordinates, by pull-back: g′ = JᵀJ, i.e.
// g′_μν = ∂_μ · ∂_ν, the dot products of the coordinate basis vectors.
// Polar diag(1, r²), cylindrical diag(1, ρ², 1), spherical diag(1, r², r² sin²θ),
// the 2-sphere as the slice r = R, and √g = |det J|.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { chartPic, r6 } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
const box = (th, caption, extra = {}) => ({ type: 'c3-coords', params: { system: 'spherical', point: [2, th, 40], sliders: false, element: true, edgeLabels: false, readouts: [], range: 3, ...extra }, caption });
// the coordinate grid of x(u, v), y(u, v) on the graph sim
function coordGrid(X, Y, us, vs, uRange, vRange, extra = {}) {
  const curves = [];
  for (const u of us) curves.push({ param: [X(String(u), 't'), Y(String(u), 't')], t: vRange, color: 'accent', width: 1.4 });
  for (const v of vs) curves.push({ param: [X('t', String(v)), Y('t', String(v))], t: uRange, color: 'violet', width: 1.4 });
  return { equal: true, xlabel: 'x', ylabel: 'y', curves, ...extra };
}

export default lesson({
  id: 'st-a.A6.3',
  title: 'The metric in polar and spherical coordinates',
  minutes: 12, difficulty: 3,
  intro: t`Flat space has $g = \delta$ in Cartesian coordinates. Any other coordinates inherit their metric from that one by the (0,2) transformation law — the **pull-back** — and the result has a picture: the new components are the dot products of the new coordinate basis vectors, the columns of the Jacobian $J = \partial(x, y, z)/\partial(x'^1, x'^2, x'^3)$:

$$g'_{\mu\nu} = \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x^\beta}{\partial x'^\nu}\,\delta_{\alpha\beta} = (J^\mathsf{T}J)_{\mu\nu} = \partial'_\mu\cdot\partial'_\nu$$

Lesson A4.3 found $\partial_r$ (length 1) and $\partial_\theta$ (length $r$), perpendicular; lesson A4.4 added $\partial_\phi$ (length $r\sin\theta$). So the metrics are diagonal, with the squared lengths on the diagonal: polar $\operatorname{diag}(1, r^2)$, cylindrical $(\rho, \phi, z)$ $\operatorname{diag}(1, \rho^2, 1)$, spherical $\operatorname{diag}(1, r^2, r^2\sin^2\theta)$ — that is, $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$. Freeze $r = R$ and you have the **2-sphere**, $R^2(d\theta^2 + \sin^2\theta\,d\phi^2)$: the metric a surface inherits from the space around it. And because $\det(J^\mathsf{T}J) = (\det J)^2$, the volume factor of Calculus III is $\sqrt{\det g} = |\det J|$: $r$ in the plane, $r^2\sin\theta$ in space (lesson C3-4.6).`,
  symbols: [
    { tex: t`J`, text: t`the Jacobian $\partial x^\alpha/\partial x'^\mu$: column $\mu$ is the coordinate basis vector $\partial'_\mu$ in Cartesian components` },
    { tex: t`J^\mathsf{T}J`, text: 'the matrix of all dot products of those columns: the new metric' },
    { tex: t`\delta_{\alpha\beta}`, text: 'the Cartesian metric: the identity' },
    { tex: t`\partial'_\mu\cdot\partial'_\nu`, text: 'the dot product of two coordinate basis vectors' },
    { tex: t`r,\ \theta,\ \phi`, text: t`spherical coordinates (physics convention): distance, polar angle from $+z$, azimuth` },
  ],
  why: t`The angular part $r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ appears unchanged in the Schwarzschild metric of a black hole and in the metric of the expanding universe; knowing where it comes from is knowing what their $r$ means.`,
  visual: {
    type: 'ten-metric',
    title: 'Polar and spherical coordinates, measured',
    lead: t`Drag the probe P. The readout gives the metric there, the lengths of the coordinate basis vectors (the square roots of the diagonal) and $\sqrt{|g|}$. In the polar chart, the left panel shows the true plane.`,
    tasks: [
      t`Polar: move P outward. $g_{\theta\theta} = r^2$ grows and the ellipses squeeze in $\theta$, while in the true plane they stay identical circles.`,
      t`Switch to the 2-sphere (radius 1): $g_{\theta\theta} = 1$ everywhere, but $g_{\phi\phi} = \sin^2\theta$ falls to zero at the poles, where the chart stretches each ellipse sideways.`,
      t`Compare $\sqrt{|g|}$ with $|\partial_r|\,|\partial_\theta|$ in polar coordinates: they agree, because the basis is perpendicular.`,
    ],
    params: { mode: 'chart', chart: 'polar', charts: ['polar', 'sphere'], probe: [2, 1], space: true, readout: ['P', 'g', 'lengths', 'sqrtg'] },
    caption: t`Gold: the steps of one true length at grid points; orange: the one at P. The sphere chart has longitude $\phi$ across and $\theta$ down from the North Pole, in radians, on a sphere of radius 1.`,
  },
  example: {
    prompt: t`Derive the spherical metric from the columns of $J = \partial(x, y, z)/\partial(r, \theta, \phi)$, with $x = r\sin\theta\cos\phi$, $y = r\sin\theta\sin\phi$, $z = r\cos\theta$, and check $\sqrt{\det g} = \det J$. Evaluate the metric at $(r, \theta, \phi) = (2, 60^\circ, 45^\circ)$.`,
    visual: box(60, t`The coordinate box at a point: edges along $\partial_r$, $\partial_\theta$, $\partial_\phi$ — mutually perpendicular, of lengths $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$.`),
    steps: [
      { label: 'The columns', text: t`$\partial_r = (\sin\theta\cos\phi, \sin\theta\sin\phi, \cos\theta)$, $\partial_\theta = r(\cos\theta\cos\phi, \cos\theta\sin\phi, -\sin\theta)$, $\partial_\phi = r\sin\theta(-\sin\phi, \cos\phi, 0)$ (lesson A4.4).` },
      { label: 'Diagonal', text: t`$\partial_r\cdot\partial_r = \sin^2\theta(\cos^2\phi + \sin^2\phi) + \cos^2\theta = 1$; $\partial_\theta\cdot\partial_\theta = r^2(\cos^2\theta + \sin^2\theta) = r^2$; $\partial_\phi\cdot\partial_\phi = r^2\sin^2\theta$.` },
      { label: 'Off the diagonal', text: t`$\partial_r\cdot\partial_\theta = r(\sin\theta\cos\theta - \cos\theta\sin\theta) = 0$; $\partial_r\cdot\partial_\phi = r\sin^2\theta(-\cos\phi\sin\phi + \sin\phi\cos\phi) = 0$; $\partial_\theta\cdot\partial_\phi = 0$ likewise. The basis is orthogonal.` },
      { label: 'Volume factor', text: t`$\det g = 1\cdot r^2\cdot r^2\sin^2\theta$, so $\sqrt{\det g} = r^2\sin\theta$ — the Jacobian determinant of lesson C3-4.6.` },
      { label: 'At the point', text: t`$g = \operatorname{diag}(1,\ 4,\ 4\sin^2 60^\circ) = \operatorname{diag}(1, 4, 3)$; $\sqrt{\det g} = \sqrt{12} = 3.46$. The azimuth $\phi$ appears nowhere: every meridian looks the same.` },
    ],
    answer: t`$g = \operatorname{diag}(1, r^2, r^2\sin^2\theta)$, $ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$, $\sqrt{\det g} = r^2\sin\theta$; at $(2, 60^\circ, 45^\circ)$ it is $\operatorname{diag}(1, 4, 3)$.`,
  },
  practice: [
    num({
      id: 'gphiphi', difficulty: 1,
      gen(r) {
        const R = r.pick([2, 3, 5]), th = r.pick([30, 45, 60, 120, 150]);
        const ans = (R * Math.sin(th * DEG)) ** 2;
        return {
          prompt: t`In spherical coordinates, what is $g_{\phi\phi}$ at $r = ${R}$, $\theta = ${th}^\circ$?`,
          visual: box(th, t`The coordinate box at $\theta = ${th}^\circ$ (drawn at $r = 2$); the $\partial_\phi$ edge runs around the circle of constant $\theta$.`),
          answer: r6(ans), tol: { rel: 0.005 },
          errors: [{ value: R * Math.sin(th * DEG), feedback: t`That is $|\partial_\phi| = r\sin\theta$; the metric component is its square.` }, { value: R * R * Math.sin(th * DEG), feedback: t`Both $r$ and $\sin\theta$ are squared: $g_{\phi\phi} = r^2\sin^2\theta$.` }, { value: (R * Math.cos(th * DEG)) ** 2, feedback: t`$\theta$ is measured from the pole, so the circle’s radius is $r\sin\theta$, not $r\cos\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$g_{\phi\phi} = \partial_\phi\cdot\partial_\phi = (r\sin\theta)^2$.`],
          teach: t`$g_{\phi\phi} = r^2\sin^2\theta$: the squared radius of the circle that $\phi$ runs around.`,
          explain: t`$(${R}\sin${th}^\circ)^2 = ${nice(ans, 4)}$.`,
        };
      },
    }),
    expr({
      id: 'parabolic', difficulty: 2,
      prompt: t`Parabolic coordinates on the plane are $x = \tfrac12(u^2 - v^2)$, $y = uv$. Find $g_{uu} = \partial_u\cdot\partial_u$ as a function of $u$ and $v$.`,
      visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-2.2, 2.2], ...coordGrid((u, v) => `0.5*((${u})^2 - (${v})^2)`, (u, v) => `(${u})*(${v})`, [0.5, 1, 1.5, 2], [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2], [0, 2.4], [-2.4, 2.4]) }, caption: t`Parabolic coordinates: curves of constant $u$ (blue) and constant $v$ (violet), both parabolas, crossing at right angles.` },
      answer: 'u^2 + v^2', answerTeX: t`u^2 + v^2`, vars: { u: [0.2, 2], v: [-2, 2] },
      errors: [{ answer: 'sqrt(u^2 + v^2)', feedback: t`That is the length $|\partial_u|$; the metric component is its square.` }, { answer: 'u^2 - v^2', feedback: t`$\partial_u = (u, v)$, whose squared length is $u^2 + v^2$.` }],
      hints: [t`$\partial_u = (\partial x/\partial u,\ \partial y/\partial u) = (u, v)$.`, t`$g_{uu} = \partial_u\cdot\partial_u = u^2 + v^2$.`],
      teach: t`A metric component is a dot product of coordinate basis vectors: differentiate the position, then dot.`,
      explain: t`$\partial_u = (u, v)$ and $\partial_v = (-v, u)$, so $g_{uu} = g_{vv} = u^2 + v^2$ and $g_{uv} = -uv + vu = 0$: $ds^2 = (u^2 + v^2)(du^2 + dv^2)$.`,
    }),
    mcq({
      id: 'why-diagonal', difficulty: 2,
      prompt: t`Why is $g_{r\theta} = 0$ in polar coordinates?`,
      visual: chartPic({ chart: 'polar', probe: [2, 1], space: true }, t`Polar coordinates: the true plane (left) and the chart (right). On the plane, the circles of constant $r$ meet the rays of constant $\theta$ at right angles.`),
      choices: [t`Because $\partial_r$ and $\partial_\theta$ are perpendicular at every point: $g_{r\theta} = \partial_r\cdot\partial_\theta = 0$`, t`Because $r$ and $\theta$ have different units`, t`Because metrics are always diagonal`, t`Because $g_{r\theta}$ would have to equal $g_{\theta r}$`],
      answer: 0,
      why: {
        1: 'Units do not force a component to zero; skewed axes in metres have off-diagonal terms.',
        2: t`Parabolic and polar metrics happen to be; skewed axes or rotating coordinates are not (the Road’s step 8 met $g_{uv} = \cos\alpha$).`,
        3: t`Symmetry says the two are equal, not that they vanish.`,
      },
      hints: [t`$g_{r\theta}$ is a dot product of two basis vectors.`],
      teach: 'A diagonal metric means an orthogonal coordinate grid.',
      explain: t`$\partial_r\cdot\partial_\theta = \cos\theta(-r\sin\theta) + \sin\theta(r\cos\theta) = 0$: circles and rays cross at right angles.`,
    }),
    num({
      id: 'box-volume', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 4, 10]), th = r.pick([30, 60, 90]);
        const dr = 0.1, dth = 0.02, dph = r.pick([0.01, 0.03]);
        const ans = R * R * Math.sin(th * DEG) * dr * dth * dph;
        return {
          prompt: t`What is the volume of the small coordinate box at $r = ${R}$ m, $\theta = ${th}^\circ$ with $dr = ${dr}$ m, $d\theta = ${dth}$ and $d\phi = ${dph}$ rad, using $\sqrt{\det g}\,dr\,d\theta\,d\phi$?`,
          visual: box(th, t`The box at $\theta = ${th}^\circ$: its edges are $dr$, $r\,d\theta$ and $r\sin\theta\,d\phi$, perpendicular.`),
          answer: ans, units: 'm^3', tol: { rel: 0.005 },
          errors: [{ value: dr * dth * dph, feedback: t`That is the coordinate volume; multiply by $\sqrt{\det g} = r^2\sin\theta$.` }, { value: R * R * Math.sin(th * DEG) ** 2 * dr * dth * dph, feedback: t`$\sqrt{\det g} = \sqrt{r^4\sin^2\theta} = r^2\sin\theta$, one power of $\sin\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\sqrt{\det g} = \sqrt{1\cdot r^2\cdot r^2\sin^2\theta} = r^2\sin\theta$.`],
          teach: t`The volume element is $\sqrt{\det g}\,d^3x$; for an orthogonal grid that is the product of the edge lengths.`,
          explain: t`$${R}^2\sin${th}^\circ\times${dr}\times${dth}\times${dph} = ${tex(ans, 3)}$ m³.`,
        };
      },
    }),
    expr({
      id: 'log-polar', difficulty: 2,
      prompt: t`Log-polar coordinates are $x = e^\rho\cos\theta$, $y = e^\rho\sin\theta$. Find $g_{\theta\theta}$.`,
      visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-2.3, 2.3], equal: true, xlabel: 'x', ylabel: 'y', curves: [...[-1, -0.5, 0, 0.5, 1].map((rh) => ({ param: [`${r6(Math.exp(rh))}*cos(t)`, `${r6(Math.exp(rh))}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.4 })), ...Array.from({ length: 12 }, (_, k) => ({ param: [`${r6(Math.cos(k * Math.PI / 6))}*t`, `${r6(Math.sin(k * Math.PI / 6))}*t`], t: [0.37, 3], color: 'violet', width: 1.2 }))] }, caption: t`Circles of constant $\rho$ ($\rho = -1, -\tfrac12, 0, \tfrac12, 1$; their radii grow by the factor $e^{1/2}$) and rays of constant $\theta$.` },
      answer: 'e^(2rho)', answerTeX: t`e^{2\rho}`, vars: { rho: [-1, 1] },
      errors: [{ answer: 'e^rho', feedback: t`That is $|\partial_\theta|$; square it.` }, { answer: 'rho^2', feedback: t`The radius is $e^\rho$, not $\rho$.` }],
      hints: [t`$\partial_\theta = (-e^\rho\sin\theta,\ e^\rho\cos\theta)$.`, t`Its squared length is $e^{2\rho}(\sin^2\theta + \cos^2\theta)$.`],
      teach: t`With $r = e^\rho$ the polar metric becomes $e^{2\rho}(d\rho^2 + d\theta^2)$: equal stretching in both directions.`,
      explain: t`$g_{\theta\theta} = e^{2\rho}$, and also $g_{\rho\rho} = e^{2\rho}$, $g_{\rho\theta} = 0$: $ds^2 = e^{2\rho}(d\rho^2 + d\theta^2)$ — the grid is made of little squares, which is why the Mercator projection uses the same trick.`,
    }),
    code({
      id: 'pullback', difficulty: 3,
      prompt: t`Write a SymPy function \`metric(X, q)\` that takes the Cartesian position \`X\` (a list of expressions) and the new coordinates \`q\` (a list of symbols) and returns the simplified metric $J^\mathsf{T}J$. Use it for spherical coordinates (\`g_sph\`) and for parabolic coordinates $x = \tfrac12(u^2 - v^2)$, $y = uv$ (\`g_par\`).`,
      starter: t`import sympy as sp
r, th, ph, u, v = sp.symbols('r theta phi u v', positive=True)

def metric(X, q):
    J = sp.Matrix(X).jacobian(q)
    return None          # J^T J, simplified

g_sph = metric([r*sp.sin(th)*sp.cos(ph), r*sp.sin(th)*sp.sin(ph), r*sp.cos(th)], [r, th, ph])
g_par = None
print(g_sph, g_par)
`,
      answer: t`import sympy as sp
r, th, ph, u, v = sp.symbols('r theta phi u v', positive=True)

def metric(X, q):
    J = sp.Matrix(X).jacobian(q)
    return sp.simplify(J.T * J)

g_sph = metric([r*sp.sin(th)*sp.cos(ph), r*sp.sin(th)*sp.sin(ph), r*sp.cos(th)], [r, th, ph])
g_par = metric([(u**2 - v**2)/2, u*v], [u, v])
print(g_sph, g_par)`,
      tests: [
        { name: t`the spherical metric is $\operatorname{diag}(1, r^2, r^2\sin^2\theta)$`, code: 'g_sph is not None and sp.simplify(g_sph - sp.diag(1, r**2, r**2*sp.sin(th)**2)) == sp.zeros(3, 3)' },
        { name: t`$\det g = (r^2\sin\theta)^2$ for spherical coordinates, so $\sqrt{\det g} = r^2\sin\theta$ for $0 < \theta < \pi$`, code: 'g_sph is not None and sp.simplify(g_sph.det() - (r**2*sp.sin(th))**2) == 0' },
        { name: t`the parabolic metric is $(u^2 + v^2)\,\delta$`, code: 'g_par is not None and sp.simplify(g_par - (u**2 + v**2)*sp.eye(2)) == sp.zeros(2, 2)' },
        { name: t`it works for polar coordinates too: $\operatorname{diag}(1, r^2)$`, code: 'metric([r*sp.cos(th), r*sp.sin(th)], [r, th]) is not None and sp.simplify(metric([r*sp.cos(th), r*sp.sin(th)], [r, th]) - sp.diag(1, r**2)) == sp.zeros(2, 2)' },
      ],
      hints: [t`\`J.T * J\` is the matrix of dot products of the columns of \`J\`.`, t`Return \`sp.simplify(J.T * J)\`; then \`g_par = metric([(u**2 - v**2)/2, u*v], [u, v])\`.`],
      teach: 'The pull-back of the flat metric is one line of computer algebra: JᵀJ.',
      explain: t`\`J.T * J\` collects every $\partial_\mu\cdot\partial_\nu$. SymPy’s \`simplify\` uses $\sin^2 + \cos^2 = 1$ to reach the familiar forms. It will not take $\sqrt{r^4\sin^2\theta} = r^2\sin\theta$ on its own, because it does not know $\sin\theta > 0$ — that needs $0 < \theta < \pi$, which you know and it does not.`,
    }),
    mcq({
      id: 'convention-error', difficulty: 2, kind: 'error',
      prompt: t`A student copies a spherical line element from a calculus book: $ds^2 = d\rho^2 + \rho^2\sin^2\phi\,d\theta^2 + \rho^2d\phi^2$. Written in this course’s convention, what is it?`,
      visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, 55, 40], sliders: false, element: false, readouts: [], range: 3 }, caption: t`The physics convention: $\theta$ from the $+z$ axis, $\phi$ the azimuth around it.` },
      choices: [t`$ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$ — the book’s $\phi$ is our $\theta$ and its $\theta$ our $\phi$`, t`$ds^2 = dr^2 + r^2\sin^2\phi\,d\theta^2 + r^2d\phi^2$ — only $\rho$ is renamed`, t`It is a different space: the two cannot be the same metric`, t`$ds^2 = dr^2 + r^2d\theta^2 + r^2\sin^2\phi\,d\phi^2$`],
      answer: 0,
      why: {
        1: t`In our convention $\phi$ is the azimuth, and the azimuthal step is the one scaled by the sine of the *polar* angle.`,
        2: 'It is the same Euclidean space with the angle names swapped (the research notes’ pitfall P17).',
        3: t`$\sin^2\phi$ multiplying $d\phi^2$ mixes the two angles up.`,
      },
      hints: [t`Which angle in the book is measured from the $z$ axis? That angle’s sine scales the other one’s step.`],
      teach: 'Many calculus books swap θ and φ and call the radius ρ; check which angle is the polar one.',
      explain: t`In the book $\phi$ is the polar angle and $\theta$ the azimuth; renaming gives $dr^2 + r^2d\theta^2 + r^2\sin^2\theta\,d\phi^2$, Carroll’s and ours.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-elliptic', difficulty: 3,
      prompt: t`Stretched polar coordinates $x = u\cos v$, $y = 2u\sin v$ label ellipses. Find the cross component $g_{uv} = \partial_u\cdot\partial_v$.`,
      visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-2.3, 2.3], ...coordGrid((u, v) => `(${u})*cos(${v})`, (u, v) => `2*(${u})*sin(${v})`, [0.4, 0.8, 1.2], Array.from({ length: 12 }, (_, k) => r6(k * Math.PI / 6)), [0, 1.3], [0, 6.2832]) }, caption: t`Curves of constant $u$ (ellipses, blue) and constant $v$ (rays, violet). They do not cross at right angles.` },
      answer: '3 u sin(v) cos(v)', answerTeX: t`3u\sin v\cos v`, vars: { u: [0.2, 2], v: [0.1, 1.4] },
      errors: [{ answer: '0', feedback: 'The ellipses and the rays are not perpendicular here, unlike polar coordinates.' }, { answer: '-u sin(v) cos(v)', feedback: t`The $y$-components are $2\sin v$ and $2u\cos v$: their product is $4u\sin v\cos v$.` }],
      hints: [t`$\partial_u = (\cos v, 2\sin v)$ and $\partial_v = (-u\sin v, 2u\cos v)$.`, t`Dot them: $-u\sin v\cos v + 4u\sin v\cos v$.`],
      teach: 'A non-zero off-diagonal component records coordinate lines that cross at an angle other than 90°.',
      explain: t`$g_{uv} = -u\sin v\cos v + 4u\sin v\cos v = 3u\sin v\cos v$. (Also $g_{uu} = 1 + 3\sin^2v$ and $g_{vv} = u^2(1 + 3\cos^2v)$.)`,
    }),
    num({
      id: 'cp-tracking', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([6900, 7000, 7200]), th = r.pick([50, 70, 90]), rdot = r.pick([0.05, 0.1, -0.08]);
        const thdot = r.pick([4e-4, -3e-4, 6e-4]), phdot = r.pick([9e-4, 1.0e-3]);
        const v2 = rdot ** 2 + R * R * thdot ** 2 + (R * Math.sin(th * DEG)) ** 2 * phdot ** 2;
        return {
          prompt: t`A tracking station reports a satellite’s position and coordinate rates in Earth-centred spherical coordinates: $r = ${R}$ km, $\theta = ${th}^\circ$, $\dot r = ${rdot}$ km/s, $\dot\theta = ${tex(thdot, 2)}$ rad/s, $\dot\phi = ${tex(phdot, 2)}$ rad/s. Using $v^2 = g_{\mu\nu}\dot x^\mu\dot x^\nu$, what is its speed, in km/s?`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, th, 30], sliders: false, element: false, readouts: [], range: 3 }, caption: t`The satellite’s position (schematic) with the local directions of increasing $r$, $\theta$ and $\phi$.` },
          answer: Math.sqrt(v2), units: 'km/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(rdot ** 2 + thdot ** 2 + phdot ** 2), feedback: 'Angular rates are not speeds: weight them with the metric.' }, { value: Math.sqrt(rdot ** 2 + R * R * thdot ** 2 + R * R * phdot ** 2), feedback: t`$g_{\phi\phi} = r^2\sin^2\theta$: the $\sin^2\theta$ is missing.` }].filter((e) => Math.abs(e.value - Math.sqrt(v2)) > 0.005 * Math.sqrt(v2)),
          hints: [t`$v^2 = \dot r^2 + r^2\dot\theta^2 + r^2\sin^2\theta\,\dot\phi^2$.`, 'Keep r in km so the speed comes out in km/s.'],
          teach: 'A speed is the metric applied twice to the velocity: coordinate rates times scale factors, added in squares.',
          explain: t`$v^2 = (${rdot})^2 + (${R}\times${tex(thdot, 2)})^2 + (${R}\sin${th}^\circ\times${tex(phdot, 2)})^2 = ${nice(v2, 4)}$, so $v = ${nice(Math.sqrt(v2), 4)}$ km/s — a low-orbit speed.`,
        };
      },
    }),
    num({
      id: 'cp-shell', difficulty: 2,
      gen(r) {
        const [R1, R2, what] = r.pick([[6371, 6471, 'the layer of Earth’s atmosphere below the Kármán line, 100 km up'], [6371, 6383, 'the troposphere, taken as 12 km thick'], [1, 2, 'a thick shell between radii 1 m and 2 m']]);
        const th0 = r.pick([30, 60, 90]);
        const ans = (2 * Math.PI * (R2 ** 3 - R1 ** 3) / 3) * (1 - Math.cos(th0 * DEG));
        const unit = R1 > 100 ? 'km^3' : 'm^3';
        return {
          prompt: t`Integrate the volume element $r^2\sin\theta\,dr\,d\theta\,d\phi$ to find the volume of ${what}, between $r = ${R1}$ and $r = ${R2}$ ${unit === 'km^3' ? 'km' : 'm'}, over the polar cap $0 \le \theta \le ${th0}^\circ$ (all $\phi$).`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2, th0, 30], sliders: false, surfaces: ['r', 'theta'], element: false, readouts: [], range: 3 }, caption: t`A sphere $r$ = constant and the cone $\theta = ${th0}^\circ$ that bounds the cap.` },
          answer: ans, units: unit, tol: { rel: 0.005 },
          errors: [{ value: ans / (1 - Math.cos(th0 * DEG)) * Math.sin(th0 * DEG), feedback: t`$\int_0^{\theta_0}\sin\theta\,d\theta = 1 - \cos\theta_0$, not $\sin\theta_0$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`The integral splits: $\int r^2dr\;\int_0^{\theta_0}\sin\theta\,d\theta\;\int_0^{2\pi}d\phi$.`, t`$= \tfrac13(r_2^3 - r_1^3)\,(1 - \cos\theta_0)\,2\pi$.`],
          teach: t`Volumes in curvilinear coordinates use $\sqrt{\det g}$ — for spherical coordinates $r^2\sin\theta$.`,
          explain: t`$\tfrac{2\pi}{3}(${R2}^3 - ${R1}^3)(1 - \cos${th0}^\circ) = ${tex(ans, 4)}$ ${unit === 'km^3' ? 'km³' : 'm³'}.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 2 (the metric in polar and spherical coordinates; the 2-sphere)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §5.2 (polar coordinates)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Parabolic coordinates', url: 'https://en.wikipedia.org/wiki/Parabolic_coordinates' },
  ],
});
