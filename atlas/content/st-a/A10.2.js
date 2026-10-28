// Capstone: one calculation end to end in cylindrical coordinates — metric
// from the Jacobian, Christoffel symbols from the metric, the covariant
// derivative of a swirling, stretched flow, its divergence, and the invariant
// Q = −½ ∇_μV^ν ∇_νV^μ that fluid dynamicists use to find vortex cores;
// checked against Cartesian components.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, plane, DEG } from './_tcalc.js';
import { grid } from './_ten.js';

const t = String.raw;

// the flow's cross-section at z = 0: velocity (−aρ, Ωρ) in unit-vector components
function swirlPic(a, w, caption, { lines = true } = {}) {
  const k = 0.25 / Math.max(a, w);
  const arrows = [];
  for (let i = -4; i <= 4; i++) for (let j = -2; j <= 2; j++) {
    const x = i * 0.5, y = j * 0.5;
    if (Math.hypot(x, y) < 0.3) continue;
    const vx = -a * x - w * y, vy = -a * y + w * x;
    arrows.push({ from: [r6(x - (k * vx) / 2), r6(y - (k * vy) / 2)], to: [r6(x + (k * vx) / 2), r6(y + (k * vy) / 2)], color: 'ink3', width: 1.4 });
  }
  const curves = lines ? [0, 2.0944, 4.1888].map((p0) => ({ param: [`2.2*exp(-${r6(a / Math.max(a, w))}*t)*cos(${p0} + ${r6(w / Math.max(a, w))}*t)`, `2.2*exp(-${r6(a / Math.max(a, w))}*t)*sin(${p0} + ${r6(w / Math.max(a, w))}*t)`], t: [0, 6], color: 'accent', width: 1.6 })) : [];
  return plane({ x: [-2.4, 2.4], y: [-1.5, 1.5], curves, arrows, points: [{ x: 0, y: 0, r: 3, color: 'ink2' }], caption });
}

// the Explore: sliders a (strain) and Ω (swirl), arrows from expressions
const exArrows = [];
for (let i = -4; i <= 4; i++) for (let j = -2; j <= 2; j++) {
  const x = i * 0.55, y = j * 0.55;
  if (Math.hypot(x, y) < 0.3) continue;
  exArrows.push({ from: [r6(x), r6(y)], to: [`${r6(x)} + 0.004*(-a*${r6(x)} - w*${r6(y)})`, `${r6(y)} + 0.004*(-a*${r6(y)} + w*${r6(x)})`], color: 'ink3', width: 1.4 });
}
const explore = {
  type: 'graph',
  title: 'Is it a vortex? Ask an invariant',
  lead: t`A swirling flow seen in its cross-section: fluid spirals inward at the radial rate $a$, turns at the angular rate $\Omega$, and leaves along the axis (out of the page) at $2az$. The readout is the invariant $Q = -\tfrac12\nabla_\mu V^\nu\nabla_\nu V^\mu$, computed in cylindrical coordinates in this lesson. $Q > 0$ means rotation beats strain: a vortex core.`,
  tasks: [
    t`Set $\Omega = 0$: the fluid just drains inward and up the axis. $Q = -3a^2 < 0$ — strain without rotation, no vortex.`,
    t`Raise $\Omega$ until $Q$ changes sign at $\Omega = \sqrt3\,a$. The streamlines go from nearly straight spokes to tight spirals.`,
    t`Keep $Q$ positive and raise $a$: the core is stretched along the axis — the way a tornado or the vortex over a bathtub drain is spun up — but strain too strong for the swirl kills the vortex signature.`,
  ],
  params: {
    x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    sliders: [
      { key: 'a', label: 'strain rate $a$', min: 0, max: 60, step: 1, value: 20, unit: '\\mathrm{s^{-1}}', explain: 'How fast fluid is drawn inward (and pushed out along the axis).' },
      { key: 'w', label: t`swirl rate $\Omega$`, min: 0, max: 100, step: 1, value: 50, unit: '\\mathrm{rad/s}', explain: 'The angular velocity of the solid-body rotation.' },
    ],
    curves: [0, 2.0944, 4.1888].map((p0) => ({ param: [`2.4*exp(-a*t/60)*cos(${p0} + w*t/60)`, `2.4*exp(-a*t/60)*sin(${p0} + w*t/60)`], t: [0, 12], color: 'accent', width: 1.6 })),
    arrows: exArrows,
    points: [{ x: 0, y: 0, r: 3, color: 'ink2' }],
    readouts: [
      { label: t`$Q = \Omega^2 - 3a^2$ (s⁻²)`, expr: 'w^2 - 3*a^2', digits: 4 },
      { label: t`rotation part, $\Omega^2$`, expr: 'w^2', digits: 4 },
      { label: t`strain part, $3a^2$`, expr: '3*a^2', digits: 4 },
      { label: t`$\nabla_\mu V^\mu$`, expr: '-a - a + 2*a', digits: 3 },
    ],
  },
  caption: t`The plane $z = 0$; grey arrows: the velocity, to scale with one another (drawn $0.004$ s long); blue: streamlines projected on the plane. A model flow — solid-body swirl with axial stretching, like the core of a Burgers vortex — not a solution of the viscous equations everywhere.`,
};

export default lesson({
  id: 'st-a.A10.2',
  title: 'Putting it together: a full tensor calculation',
  minutes: 16, difficulty: 4,
  intro: t`Everything from A4 to A10 in one calculation. Take a swirling, stretched flow — fluid drawn inward, spun round and sent out along an axis — and decide, in cylindrical coordinates, whether it contains a vortex. Fluid dynamicists answer with an invariant, the **Q-criterion** of Hunt, Wray and Moin (1988): for an incompressible flow,

$$Q = -\tfrac12\,\nabla_\mu V^\nu\,\nabla_\nu V^\mu$$

$Q > 0$ where rotation outweighs strain. It is a full contraction, so it means the same in every coordinate system. Computing it needs the whole toolbox: the metric from the Jacobian (A4, A6), the Christoffel symbols from the metric (A8.4), the covariant derivative (A8.3), the divergence (A9.1) — and a Cartesian check at the end.`,
  symbols: [
    { tex: 'Q', text: t`the Q-criterion: a scalar field, in $\text{s}^{-2}$; positive inside vortex cores` },
    { tex: t`V^\nu`, text: t`the flow velocity’s coordinate components in $(\rho, \phi, z)$: $V^\rho$ in m/s, $V^\phi$ in rad/s, $V^z$ in m/s` },
    { tex: t`\nabla_\mu V^\nu`, text: t`the velocity gradient tensor, made coordinate-proof by the Christoffel terms; in s⁻¹ once units are sorted out` },
    { tex: t`\nabla_\nu V^\mu`, text: t`the same tensor with the roles of its two indices swapped; the product sums over both $\mu$ and $\nu$` },
  ],
  why: t`This is the shape of every calculation in general relativity: coordinates → metric → Christoffel symbols → covariant derivatives → a contraction that means something physical. The Road does it for curved spacetime in gr.S10.d–S13.d; here every step can be checked against Cartesian truth.`,
  visual: explore,
  example: {
    prompt: t`In cylindrical coordinates $x = \rho\cos\phi$, $y = \rho\sin\phi$, $z$, a flow has coordinate components $V^\rho = -a\rho$, $V^\phi = \Omega$, $V^z = 2az$ (constants $a$, $\Omega$). From the coordinates alone, find the metric and Christoffel symbols, then $\nabla_\mu V^\nu$, the divergence and $Q$. Check in Cartesian coordinates, and evaluate $Q$ for $\Omega = 50$ rad/s, $a = 20\ \text{s}^{-1}$.`,
    visual: swirlPic(20, 50, t`The flow’s cross-section for $a = 20\ \text{s}^{-1}$, $\Omega = 50$ rad/s: arrows to scale with one another, streamlines (blue) spiralling in; the outflow along the axis is out of the page.`),
    steps: [
      { label: 'Metric from the Jacobian', text: t`The basis vectors are $\partial_\rho = (\cos\phi, \sin\phi, 0)$, $\partial_\phi = (-\rho\sin\phi, \rho\cos\phi, 0)$, $\partial_z = (0, 0, 1)$; their dot products give $g = \text{diag}(1, \rho^2, 1)$, so $\sqrt g = \rho$ and $g^{-1} = \text{diag}(1, 1/\rho^2, 1)$.` },
      { label: 'Christoffels from the metric', text: t`Only $g_{\phi\phi}$ varies, and only with $\rho$. The formula gives $\Gamma^\rho{}_{\phi\phi} = -\tfrac12g^{\rho\rho}\partial_\rho g_{\phi\phi} = -\rho$ and $\Gamma^\phi{}_{\rho\phi} = \Gamma^\phi{}_{\phi\rho} = \tfrac12g^{\phi\phi}\partial_\rho g_{\phi\phi} = 1/\rho$; the other 24 vanish.` },
      { label: 'The covariant derivative', text: t`$\nabla_\mu V^\nu = \partial_\mu V^\nu + \Gamma^\nu{}_{\mu\lambda}V^\lambda$, row $\mu$, column $\nu$: $$\nabla_\mu V^\nu = \begin{pmatrix} -a & \Omega/\rho & 0 \\ -\rho\,\Omega & -a & 0 \\ 0 & 0 & 2a \end{pmatrix}$$ Only $-a$ and $2a$ come from partial derivatives; $\Omega/\rho$, $-\rho\Omega$ and the second $-a$ are all Christoffel terms.` },
      { label: 'Divergence', text: t`The trace: $-a - a + 2a = 0$. Check with A9.1: $\tfrac1\rho\partial_\rho(\rho\cdot(-a\rho)) + \partial_\phi\Omega + \partial_z(2az) = -2a + 0 + 2a = 0$ ✓. The flow is incompressible, as $Q$ requires.` },
      { label: 'The invariant', text: t`$\nabla_\mu V^\nu\nabla_\nu V^\mu$ sums each entry times its mirror image: $a^2 + a^2 + 4a^2 + 2\cdot\tfrac{\Omega}{\rho}\cdot(-\rho\Omega) = 6a^2 - 2\Omega^2$. So $Q = \Omega^2 - 3a^2$ — the $\rho$’s cancel, as they must in a scalar.` },
      { label: 'Cartesian check', text: t`In Cartesian components $V = (-ax - \Omega y,\ -ay + \Omega x,\ 2az)$, so $\partial_jV^i$ is the constant matrix with rows $(-a, -\Omega, 0)$, $(\Omega, -a, 0)$, $(0, 0, 2a)$. Its square has trace $(a^2 - \Omega^2) + (a^2 - \Omega^2) + 4a^2 = 6a^2 - 2\Omega^2$ ✓.` },
      { label: 'Numbers', text: t`$Q = 50^2 - 3(20)^2 = 2500 - 1200 = 1300\ \text{s}^{-2} > 0$: a vortex core. With the swirl below $\sqrt3\times20 = 34.6$ rad/s it would not count as one.` },
    ],
    answer: t`$g = \text{diag}(1, \rho^2, 1)$; $\Gamma^\rho{}_{\phi\phi} = -\rho$, $\Gamma^\phi{}_{\rho\phi} = 1/\rho$; $\nabla_\mu V^\mu = 0$; $Q = \Omega^2 - 3a^2 = 1300\ \text{s}^{-2}$, the same as from Cartesian components.`,
  },
  practice: [
    order({
      id: 'pipeline', difficulty: 2,
      prompt: 'Put the steps of the calculation in order.',
      visual: grid([['−a', 'Ω/ρ', '0'], ['−ρΩ', '−a', '0'], ['0', '0', '2a']], { rowNames: ['ρ', 'φ', 'z'], colNames: ['ρ', 'φ', 'z'], dx: 1.5, caption: t`The end product of step four: $\nabla_\mu V^\nu$, row $\mu$, column $\nu$.` }),
      items: [
        t`Write the Cartesian coordinates as functions of the new ones and differentiate: the Jacobian`,
        t`Dot the columns of the Jacobian together: the metric $g_{\mu\nu}$, its determinant and inverse`,
        t`Feed the metric to the Christoffel formula: $\Gamma^\lambda{}_{\mu\nu}$`,
        t`Add the Christoffel terms to the partial derivatives: $\nabla_\mu V^\nu$`,
        t`Contract every index: the divergence and $Q$, both scalars`,
        t`Check a scalar against Cartesian components`,
      ],
      hints: ['Each step needs the one before: Γ needs g, ∇ needs Γ, a scalar needs ∇.'],
      teach: 'Coordinates → metric → connection → covariant derivative → contraction: the pipeline of every tensor calculation.',
      explain: t`Jacobian, metric ($g = J^\mathsf{T}J$), Christoffel symbols, covariant derivative, contraction, check. General relativity starts at the second step: the metric is given, with no Cartesian coordinates behind it.`,
    }),
    num({
      id: 'ellipse-metric', difficulty: 3,
      gen(r) {
        const A = r.pick([2, 3]), B = r.pick([1, 1.5]), rho = r.pick([1, 2]), ph = r.pick([30, 60, 90]);
        const s = Math.sin(ph * DEG), c = Math.cos(ph * DEG);
        const ans = rho * rho * (A * A * s * s + B * B * c * c);
        return {
          prompt: t`An elliptical nozzle is described by $x = ${A}\rho\cos\phi$, $y = ${B}\rho\sin\phi$, $z = z$. Compute the metric component $g_{\phi\phi} = \partial_\phi\mathbf x\cdot\partial_\phi\mathbf x$ at $\rho = ${rho}$, $\phi = ${ph}^\circ$.`,
          visual: plane({ x: [-3.4, 3.4], y: [-2.1, 2.1], curves: [0.4, 0.7, 1].map((q) => ({ param: [`${r6(A * q)}*cos(t)`, `${r6(B * q)}*sin(t)`], t: [0, 6.2832], color: 'accent', width: 1.2 })).concat([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => ({ param: [`${r6(A * Math.cos(d * DEG))}*t`, `${r6(B * Math.sin(d * DEG))}*t`], t: [0, 1.1], color: 'violet', width: 1 }))), caption: t`Lines of constant $\rho$ (ellipses, blue) and constant $\phi$ (violet) for $x = ${A}\rho\cos\phi$, $y = ${B}\rho\sin\phi$.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: rho * rho, feedback: t`That is the circular case. Here $\partial_\phi\mathbf x = (-${A}\rho\sin\phi,\ ${B}\rho\cos\phi,\ 0)$.` }, { value: rho * rho * (A * A * c * c + B * B * s * s), feedback: t`$\partial_\phi(${A}\rho\cos\phi) = -${A}\rho\sin\phi$: the ${A} goes with $\sin\phi$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\partial_\phi\mathbf x = (-${A}\rho\sin\phi,\ ${B}\rho\cos\phi,\ 0)$.`, t`$g_{\phi\phi} = \rho^2(${A * A}\sin^2\phi + ${B * B}\cos^2\phi)$.`],
          teach: t`The metric comes from the Jacobian: $g_{\mu\nu} = \partial_\mu\mathbf x\cdot\partial_\nu\mathbf x$.`,
          explain: t`$g_{\phi\phi} = ${rho * rho}(${A * A}\sin^2${ph}^\circ + ${B * B}\cos^2${ph}^\circ) = ${nice(ans, 4)}$. Unlike the circular case it depends on $\phi$ too, so more Christoffel symbols survive.`,
        };
      },
    }),
    num({
      id: 'nabla-entry', difficulty: 2,
      gen(r) {
        const w = r.pick([20, 50, 80]), rho = r.pick([0.02, 0.05, 0.1]), which = r.pick(['pr', 'rp']);
        const ans = which === 'pr' ? -rho * w : w / rho;
        return {
          prompt: t`For the swirling flow $V^\rho = -a\rho$, $V^\phi = \Omega$, $V^z = 2az$ with $\Omega = ${w}$ rad/s, find ${which === 'pr' ? t`$\nabla_\phi V^\rho$` : t`$\nabla_\rho V^\phi$`} at $\rho = ${rho}$ m${which === 'pr' ? ', in m/s per radian' : ', in rad/(s m)'}.`,
          visual: swirlPic(20, w, 'The flow’s cross-section: arrows to scale with one another, streamlines in blue.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`The partial derivative is zero, but the Christoffel term is not: ${which === 'pr' ? t`$\Gamma^\rho{}_{\phi\phi}V^\phi = -\rho\Omega$` : t`$\Gamma^\phi{}_{\rho\phi}V^\phi = \Omega/\rho$`}.` }],
          hints: [which === 'pr' ? t`$\nabla_\phi V^\rho = \partial_\phi V^\rho + \Gamma^\rho{}_{\phi\phi}V^\phi$.` : t`$\nabla_\rho V^\phi = \partial_\rho V^\phi + \Gamma^\phi{}_{\rho\phi}V^\phi$.`],
          teach: 'In a rotating flow, the off-diagonal entries of the velocity gradient come entirely from Christoffel terms in cylindrical coordinates.',
          explain: which === 'pr' ? t`$\nabla_\phi V^\rho = 0 + (-\rho)(\Omega) = ${nice(ans, 4)}$.` : t`$\nabla_\rho V^\phi = 0 + \tfrac1\rho\Omega = ${nice(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'divergence', difficulty: 2,
      gen(r) {
        const a = r.pick([5, 10, 20]), c = r.pick([5, 15, 30]);
        const ans = -2 * a + c;
        return {
          prompt: t`A flow has cylindrical components $V^\rho = -${a}\rho$, $V^\phi = 40$, $V^z = ${c}z$ (SI units). Find its divergence $\nabla_\mu V^\mu = \tfrac1\rho\partial_\rho(\rho V^\rho) + \partial_\phi V^\phi + \partial_zV^z$, in $\text{s}^{-1}$.`,
          visual: swirlPic(a, 40, 'The flow’s cross-section at z = 0; the axial part is out of the page.'),
          answer: ans, units: 's^-1', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -a + c, feedback: t`$\tfrac1\rho\partial_\rho(\rho\cdot(-${a}\rho)) = -${2 * a}$: the $\sqrt g = \rho$ weight doubles the radial term.` }],
          hints: [t`$\rho V^\rho = -${a}\rho^2$.`],
          teach: t`The divergence is the trace $\nabla_\mu V^\mu = \tfrac{1}{\sqrt g}\partial_\mu(\sqrt gV^\mu)$, with $\sqrt g = \rho$.`,
          explain: t`$\nabla_\mu V^\mu = -${2 * a} + 0 + ${c} = ${ans}\ \text{s}^{-1}$: ${ans > 0 ? 'the fluid is expanding' : 'the fluid is being compressed'} — only $c = 2a$ makes it incompressible.`,
        };
      },
    }),
    num({
      id: 'q-value', difficulty: 2,
      gen(r) {
        const a = r.pick([10, 25, 40]), w = r.pick([30, 60, 90]);
        const ans = w * w - 3 * a * a;
        return {
          prompt: t`For the swirling, stretched flow with strain rate $a = ${a}\ \text{s}^{-1}$ and swirl $\Omega = ${w}$ rad/s, find $Q = -\tfrac12\nabla_\mu V^\nu\nabla_\nu V^\mu$, in $\text{s}^{-2}$.`,
          visual: swirlPic(a, w, t`The flow’s cross-section for these values.`),
          answer: ans, units: 's^-2', tol: { rel: 0.005, abs: 0.5 },
          errors: [{ value: w * w - a * a, feedback: t`The strain has three diagonal entries, $-a, -a, 2a$, whose squares sum to $6a^2$: $Q = \Omega^2 - 3a^2$.` }, { value: -2.5 * a * a, feedback: 'That uses partial derivatives only; the rotation enters through the Christoffel terms.' }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`$\nabla_\mu V^\nu\nabla_\nu V^\mu = 6a^2 - 2\Omega^2$ (worked example).`],
          teach: t`For this flow $Q = \Omega^2 - 3a^2$: a vortex core when the swirl beats $\sqrt3$ times the strain.`,
          explain: t`$Q = ${w}^2 - 3(${a})^2 = ${ans}\ \text{s}^{-2}$ — ${ans > 0 ? 'positive: a vortex core' : 'negative: strain dominates, no vortex core'}.`,
        };
      },
    }),
    mcq({
      id: 'forgot-gamma', difficulty: 3, kind: 'error',
      prompt: t`A student computes $Q$ for the swirling flow from partial derivatives only, $-\tfrac12\,\partial_\mu V^\nu\,\partial_\nu V^\mu$, in cylindrical coordinates, and gets $-\tfrac52a^2$ — negative for every swirl, so “no vortex, ever”. What went wrong?`,
      visual: swirlPic(15, 70, t`$a = 15\ \text{s}^{-1}$, $\Omega = 70$ rad/s: obviously a vortex.`),
      choices: [
        t`$\partial_\mu V^\nu$ is not a tensor: with constant $V^\phi = \Omega$ it misses all the rotation, which lives in the Christoffel terms $\Omega/\rho$ and $-\rho\Omega$`,
        'Nothing: Q really is negative here, and the flow has no vortex',
        t`They should have used unit-vector components; then partial derivatives are enough`,
        'They forgot the factor −½',
      ],
      answer: 0,
      why: {
        1: t`The Cartesian check gives $Q = \Omega^2 - 3a^2 > 0$ for these numbers; a scalar cannot depend on the coordinates.`,
        2: t`With $V^{\hat\phi} = \Omega\rho$ the partials give $\partial_\rho V^{\hat\phi} = \Omega$ but still miss $-\Omega$ from the turning basis, so the products do not come out right either.`,
        3: t`The factor is there; $-\tfrac52a^2$ already includes it.`,
      },
      hints: [t`List the partial derivatives: which of them involve $\Omega$?`, t`With $V^\phi = \Omega$ constant, every partial derivative misses the swirl; it appears only in $\Gamma^\phi{}_{\rho\phi}V^\phi$ and $\Gamma^\rho{}_{\phi\phi}V^\phi$.`],
      teach: 'Contracting partial derivatives in curvilinear coordinates gives a coordinate-dependent number, not a scalar.',
      explain: t`Partials give only $\partial_\rho V^\rho = -a$ and $\partial_zV^z = 2a$, so $\partial_\mu V^\nu\partial_\nu V^\mu = 5a^2$ and the swirl never appears. The Christoffel terms supply $\nabla_\rho V^\phi = \Omega/\rho$ and $\nabla_\phi V^\rho = -\rho\Omega$, whose product $-\Omega^2$ (twice) is the rotation.`,
    }),
    code({
      id: 'sympy-capstone', difficulty: 4,
      prompt: t`End to end from the coordinates alone: finish \`metric(X, q)\` (return $J^\mathsf{T}J$, simplified, with $J = \partial X/\partial q$) and \`laplacian(f, X, q)\` (build the metric, then $\tfrac{1}{\sqrt g}\partial_\mu(\sqrt g\,g^{\mu\nu}\partial_\nu f)$). The tests apply them to spherical coordinates and compare with Cartesian Laplacians of $x^2$, $xyz$ and $x^2y$.`,
      starter: t`import sympy as sp
r, th, ph = sp.symbols('r theta phi', positive=True)
X = [r * sp.sin(th) * sp.cos(ph), r * sp.sin(th) * sp.sin(ph), r * sp.cos(th)]
q = [r, th, ph]
x, y, z = X

def sqrt_det(g):
    # 0 < theta < pi, so |sin(theta)| = sin(theta): drop the Abs SymPy writes
    return sp.sqrt(g.det()).replace(sp.Abs, lambda a: a)

def metric(X, q):
    pass   # J = Matrix(X).jacobian(q); return simplified J.T * J

def laplacian(f, X, q):
    pass   # g = metric(X, q); sqrt_det, inverse, then the formula

g = metric(X, q)
print(g)
`,
      answer: t`import sympy as sp
r, th, ph = sp.symbols('r theta phi', positive=True)
X = [r * sp.sin(th) * sp.cos(ph), r * sp.sin(th) * sp.sin(ph), r * sp.cos(th)]
q = [r, th, ph]
x, y, z = X

def sqrt_det(g):
    # 0 < theta < pi, so |sin(theta)| = sin(theta): drop the Abs SymPy writes
    return sp.sqrt(g.det()).replace(sp.Abs, lambda a: a)

def metric(X, q):
    J = sp.Matrix(X).jacobian(q)
    return sp.simplify(J.T * J)

def laplacian(f, X, q):
    g = metric(X, q)
    sg, gi, n = sqrt_det(g), g.inv(), len(q)
    total = sum(sp.diff(sg * sum(gi[m, k] * sp.diff(f, q[k]) for k in range(n)), q[m]) for m in range(n))
    return sp.simplify(total / sg)

g = metric(X, q)
print(g)`,
      tests: [
        { name: t`the metric is $\text{diag}(1, r^2, r^2\sin^2\theta)$`, code: 'sp.simplify(metric(X, q) - sp.diag(1, r**2, r**2*sp.sin(th)**2)) == sp.zeros(3, 3)' },
        { name: t`$\nabla^2(x^2) = 2$`, code: 'sp.simplify(laplacian(x**2, X, q) - 2) == 0' },
        { name: t`$\nabla^2(xyz) = 0$`, code: 'sp.simplify(laplacian(x*y*z, X, q)) == 0' },
        { name: t`$\nabla^2(x^2y) = 2y$`, code: 'sp.simplify(laplacian(x**2*y, X, q) - 2*y) == 0' },
      ],
      hints: [t`\`J = sp.Matrix(X).jacobian(q)\` and \`return sp.simplify(J.T * J)\`.`, t`In \`laplacian\`: \`g = metric(X, q)\`, \`sg = sqrt_det(g)\`, \`gi = g.inv()\`; then \`sp.simplify(sum(sp.diff(sg * sum(gi[m, k] * sp.diff(f, q[k]) for k in range(3)), q[m]) for m in range(3)) / sg)\`.`],
      teach: 'Given only how Cartesian coordinates depend on new ones, the metric and then every differential operator follow mechanically.',
      explain: t`Nothing about spheres was typed in except $x(r, \theta, \phi)$, $y$ and $z$. The metric, $\sqrt g = r^2\sin\theta$ and the Laplacian all followed, and they agree with the Cartesian Laplacian on every test function — the whole of module A in a dozen lines.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-combustor', difficulty: 3, transfer: true,
      gen(r) {
        const w = r.pick([300, 400, 500]), a = r.pick([150, 200, 250]);
        const ans = w * w - 3 * a * a;
        return {
          prompt: t`Near the axis of a swirl-stabilised rocket combustor, the gas spins at $\Omega = ${w}$ rad/s while being drawn inward at the strain rate $a = ${a}\ \text{s}^{-1}$ and pushed out along the axis at $2az$ — the model flow of this lesson. Find $Q$ there, in $\text{s}^{-2}$; a positive value marks the vortex core that holds the flame.`,
          visual: swirlPic(a, w, 'Model flow near the combustor axis, cross-section (schematic: real combustor flows are turbulent and only roughly like this).'),
          answer: ans, units: 's^-2', tol: { rel: 0.005 },
          errors: [{ value: w * w - a * a, feedback: t`The strain contributes $3a^2$: its three diagonal entries are $-a$, $-a$ and $2a$.` }, { value: -2.5 * a * a, feedback: 'Include the Christoffel terms: the swirl enters only through them in cylindrical coordinates.' }],
          hints: [t`$Q = \Omega^2 - 3a^2$ for this flow.`, t`$Q = ${w}^2 - 3(${a})^2$.`],
          teach: 'An invariant computed once, in convenient coordinates, answers a physical question in all of them.',
          explain: t`$Q = ${w * w} - ${3 * a * a} = ${ans}\ \text{s}^{-2}$ — ${ans > 0 ? 'positive: rotation dominates, a vortex core' : 'negative: the strain is too strong for a coherent vortex core'}.`,
        };
      },
    }),
    num({
      id: 'cp-flux', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 4]), c = r.pick([2, 6, 10]), R = r.pick([0.1, 0.2]), H = r.pick([0.3, 0.5]);
        const ans = (c - 2 * a) * Math.PI * R * R * H;
        return {
          prompt: t`The flow $V^\rho = -${a}\rho$, $V^\phi = \Omega$, $V^z = ${c}z$ (SI units) fills a cylinder of radius ${R} m from $z = 0$ to $z = ${H}$ m. Using $\int\nabla_\mu V^\mu\,dV$ with $dV = \rho\,d\rho\,d\phi\,dz$, find the net volume flow out of the cylinder, in $\text{m}^3/\text{s}$.`,
          visual: swirlPic(a, 12, 'The flow’s cross-section; the cylinder’s side wall is a circle about the axis.'),
          answer: ans, units: 'm^3/s', tol: { rel: 0.01 },
          errors: [{ value: (c - a) * Math.PI * R * R * H, feedback: t`The radial term of the divergence is $\tfrac1\rho\partial_\rho(\rho\cdot(-${a}\rho)) = -${2 * a}$.` }, { value: (c - 2 * a) * 2 * Math.PI * R * H, feedback: t`The volume needs $\sqrt g = \rho$: $\int\rho\,d\rho\,d\phi\,dz = \pi R^2H$.` }].filter((e) => Math.abs(e.value - ans) > 1e-4),
          hints: [t`$\nabla_\mu V^\mu = -${2 * a} + ${c} = ${c - 2 * a}\ \text{s}^{-1}$, constant.`, t`Volume $= \pi R^2H$; multiply.`],
          teach: 'The divergence theorem in curvilinear coordinates: integrate the scalar divergence with the volume element √g d³x.',
          explain: t`Net outflow $= (${c} - ${2 * a})\,\pi(${R})^2(${H}) = ${nice(ans, 4)}\ \text{m}^3/\text{s}$ ${ans < 0 ? '(negative: more flows in than out)' : ''}. Directly: the top face passes $${c}H\cdot\pi R^2$ out and the side wall $${a}R\cdot2\pi RH$ in — the same.`,
        };
      },
    }),
    mcq({
      id: 'cp-trust', difficulty: 2,
      prompt: t`Why can an engineer compute $Q$ in cylindrical coordinates and report it to a colleague who uses Cartesian ones?`,
      visual: swirlPic(20, 50, 'The same flow, whatever grid is laid over it.'),
      choices: [
        t`$Q$ contracts every index of the tensor $\nabla_\mu V^\nu$, so it is a scalar: the same number at each point in every coordinate system`,
        'Because the flow is incompressible',
        'Because cylindrical coordinates are orthogonal',
        'They cannot: Q must be recomputed in each system',
      ],
      answer: 0,
      why: {
        1: 'Incompressibility makes Q the right vortex test, but not coordinate-independent; invariance comes from the contraction.',
        2: 'Orthogonality simplifies the algebra; any coordinates, orthogonal or not, give the same scalar.',
        3: 'That is exactly what a scalar spares you — as the Cartesian check showed.',
      },
      hints: ['Count the free indices of the contraction.'],
      teach: 'A full contraction of tensors is a scalar: compute it once, in whatever coordinates are easiest.',
      explain: t`$\nabla_\mu V^\nu$ is a tensor (lesson A8.3) and $Q$ pairs every upper index with a lower one, so all Jacobians cancel (lesson A7.3). The same logic lets relativists compute curvature invariants in any coordinates they like.`,
    }),
  ],
  sources: [
    { label: 'Hunt, Wray & Moin, “Eddies, streams, and convergence zones in turbulent flows”, CTR Summer Program 1988 (the Q-criterion)', url: 'https://ctr.stanford.edu/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (Christoffel symbols and covariant derivatives)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 5 (flat space in curvilinear coordinates)', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
