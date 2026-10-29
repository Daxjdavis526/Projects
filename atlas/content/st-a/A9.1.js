// Divergence and Laplacian from the covariant derivative: contract ∇_μV^μ,
// use Γ^μ_μλ = ∂_λ ln √g, and the curvilinear formulas of Calc III and E&M
// fall out — polar and spherical, with coordinate and physical components.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { r6, plane, polarGrid, fieldArrows, DEG } from './_tcalc.js';

const t = String.raw;

// a field given by physical (unit-vector) components f(r, θ) → [Vr̂, Vθ̂], on a polar grid
function physPic(f, caption, { R = 4, cap } = {}) {
  const g = (x, y) => { const r = Math.hypot(x, y), q = Math.atan2(y, x), [a, b] = f(r, q); return [a * Math.cos(q) - b * Math.sin(q), a * Math.sin(q) + b * Math.cos(q)]; };
  return plane({
    x: [-R, R], y: [r6(-0.62 * R), r6(0.62 * R)],
    curves: polarGrid(R + 1),
    arrows: fieldArrows(g, { x: [-R, R], y: [-0.62 * R, 0.62 * R], maxLen: 0.75, cap, skip: (x, y) => Math.hypot(x, y) < 0.5 }),
    points: [{ x: 0, y: 0, r: 3, color: 'ink3' }],
    caption,
  });
}

// a radial profile on a graph: a function of r with marked points
const profile = (fn, x, y, caption, { xlabel = 'r', ylabel = '', curves = [] } = {}) => ({
  type: 'graph',
  params: { x, y, aspect: 'wide', xlabel, ylabel, curves: [{ fn, color: 'accent', width: 2.4 }, ...curves] },
  caption,
});

const S = (k) => `step(0.5 - abs(c - ${k}))`;
const explore = {
  type: 'field2d',
  title: 'Divergence, measured and computed',
  lead: t`The probe measures the divergence of the field numerically, from Cartesian differences. Compare it with the polar formula this lesson derives, written in unit-vector components: $\nabla\cdot V = \dfrac1r\,\partial_r(rV^{\hat r}) + \dfrac1r\,\partial_\theta V^{\hat\theta}$.`,
  tasks: [
    t`Line charge ($V^{\hat r} = 1/r$): $\tfrac1r\partial_r(r\cdot\tfrac1r) = 0$. Drag the probe anywhere except the origin: the divergence is 0 — the arrows thin out exactly as fast as the circles grow.`,
    t`Charged cylinder ($V^{\hat r} = r$): $\tfrac1r\partial_r(r^2) = 2$ everywhere — a uniform charge density, as Gauss’s law demands inside a uniformly charged rod.`,
    t`Tilted field ($V^{\hat r} = \cos\theta$): $\tfrac1r\partial_r(r\cos\theta) = \cos\theta/r$. Check it at $(1, 0)$, $(2, 0)$ and on the $y$ axis.`,
  ],
  params: {
    choices: [{ key: 'c', label: 'Field', options: [[1, 'Line charge: r̂/r'], [2, 'Charged cylinder: r r̂'], [3, 'Vortex: θ̂/r'], [4, 'Tilted: cos θ r̂']], value: 1, explain: 'Each is given by its unit-vector components in polar coordinates; the picture draws it in Cartesian ones.' }],
    P: `${S(1)}*x/(x^2 + y^2) + ${S(2)}*x - ${S(3)}*y/(x^2 + y^2) + ${S(4)}*x^2/(x^2 + y^2)`,
    Q: `${S(1)}*y/(x^2 + y^2) + ${S(2)}*y + ${S(3)}*x/(x^2 + y^2) + ${S(4)}*x*y/(x^2 + y^2)`,
    x: [-3, 3], y: [-3, 3], probe: [1.5, 0.8],
  },
  caption: t`Arrows coloured by size; tracer particles follow the flow. The probe’s divergence and curl are computed numerically from small Cartesian differences, independently of any polar formula. Near the origin the line-charge and vortex fields blow up.`,
};

export default lesson({
  id: 'st-a.A9.1',
  title: 'Divergence and Laplacian from the covariant derivative',
  minutes: 13, difficulty: 3,
  intro: t`Contract the covariant derivative and you get the **divergence**, a scalar: $\nabla_\mu V^\mu = \partial_\mu V^\mu + \Gamma^\mu{}_{\mu\lambda}V^\lambda$. The traced Christoffel symbol has a neat form, $\Gamma^\mu{}_{\mu\lambda} = \partial_\lambda\ln\sqrt g$, where $g$ is the determinant of the metric, and the two terms combine into one derivative. Apply it to the gradient $V^\mu = g^{\mu\nu}\partial_\nu f$ and you have the **Laplacian**:

$$\nabla_\mu V^\mu = \frac{1}{\sqrt g}\,\partial_\mu\!\left(\sqrt g\,V^\mu\right), \qquad \nabla^2 f = \frac{1}{\sqrt g}\,\partial_\mu\!\left(\sqrt g\,g^{\mu\nu}\,\partial_\nu f\right)$$

Every curvilinear formula in the back of a Calc III or E&M book is these two lines with a particular metric put in. In polar coordinates $\sqrt g = r$; in spherical, $\sqrt g = r^2\sin\theta$. The books write vectors in unit-vector (“physical”) components, $V^{\hat\theta} = rV^\theta$ (lesson A4.3), which is why their formulas look less tidy.`,
  symbols: [
    { tex: t`\nabla_\mu V^\mu`, text: t`the divergence of the vector field $V$: the net outflow per unit volume (per unit area in a plane). A scalar` },
    { tex: t`g`, text: t`the determinant of the metric $g_{\mu\nu}$; $\sqrt g$ is the volume (or area) factor of lesson A10.1: $\sqrt g = r$ in polar, $r^2\sin\theta$ in spherical coordinates` },
    { tex: t`V^\mu`, text: t`the vector field’s coordinate components (not unit-vector components)` },
    { tex: t`g^{\mu\nu}\partial_\nu f`, text: t`the gradient of $f$ as a vector: the covector $\partial_\nu f$ with its index raised by the inverse metric` },
    { tex: t`\nabla^2 f`, text: t`the Laplacian of the scalar field $f$, the divergence of its gradient` },
  ],
  why: t`Gauss’s law $\nabla\cdot\mathbf E = \rho/\varepsilon_0$, the heat equation, the Schrödinger equation and the Newtonian limit of general relativity, $\nabla^2\Phi = 4\pi G\rho$, are all divergences and Laplacians — and all are usually solved in spherical or cylindrical coordinates (gr.S10.d computes more examples on the Road).`,
  visual: explore,
  example: {
    prompt: t`Derive the divergence and Laplacian in polar coordinates from $\nabla_\mu V^\mu$, convert to unit-vector components, and test the Laplacian on $f = r^2\sin^2\theta$.`,
    visual: physPic((r, q) => [r * Math.sin(q) ** 2, r * Math.sin(q) * Math.cos(q)], t`The gradient of $f = r^2\sin^2\theta$ (which is $y^2$): arrows to scale with one another, pointing away from the $x$ axis.`),
    steps: [
      { label: 'Trace the Christoffels', text: t`$\Gamma^\mu{}_{\mu r} = \Gamma^r{}_{rr} + \Gamma^\theta{}_{\theta r} = 0 + \tfrac1r$ and $\Gamma^\mu{}_{\mu\theta} = \Gamma^r{}_{r\theta} + \Gamma^\theta{}_{\theta\theta} = 0$. Check: $\sqrt g = \sqrt{1\cdot r^2} = r$, and $\partial_r\ln r = 1/r$, $\partial_\theta\ln r = 0$ ✓.` },
      { label: 'Divergence', text: t`$\nabla_\mu V^\mu = \partial_rV^r + \partial_\theta V^\theta + \tfrac1rV^r = \tfrac1r\partial_r(rV^r) + \partial_\theta V^\theta$ — the formula $\tfrac{1}{\sqrt g}\partial_\mu(\sqrt gV^\mu)$ with $\sqrt g = r$.` },
      { label: 'Unit-vector components', text: t`With $V^{\hat r} = V^r$ and $V^{\hat\theta} = rV^\theta$: $\nabla\cdot V = \dfrac1r\partial_r\big(rV^{\hat r}\big) + \dfrac1r\partial_\theta V^{\hat\theta}$ — exactly the Calc III formula.` },
      { label: 'Laplacian', text: t`The gradient has $V^r = g^{rr}\partial_rf = f_r$ and $V^\theta = g^{\theta\theta}\partial_\theta f = f_\theta/r^2$. So $\nabla^2f = \dfrac1r\partial_r(rf_r) + \dfrac{1}{r^2}f_{\theta\theta} = f_{rr} + \dfrac1rf_r + \dfrac1{r^2}f_{\theta\theta}$.` },
      { label: 'Test it', text: t`$f = r^2\sin^2\theta$: $f_{rr} = 2\sin^2\theta$, $\tfrac1rf_r = 2\sin^2\theta$, $\tfrac1{r^2}f_{\theta\theta} = 2\cos2\theta = 2 - 4\sin^2\theta$. Sum: $2$. In Cartesian, $f = y^2$ and $\nabla^2(y^2) = 2$ ✓.` },
      { label: 'Spherical, by the same recipe', text: t`$\sqrt g = r^2\sin\theta$, $g^{rr} = 1$, $g^{\theta\theta} = 1/r^2$, $g^{\phi\phi} = 1/(r^2\sin^2\theta)$ give $\nabla^2f = \dfrac{1}{r^2}\partial_r(r^2f_r) + \dfrac{1}{r^2\sin\theta}\partial_\theta(\sin\theta\,f_\theta) + \dfrac{1}{r^2\sin^2\theta}f_{\phi\phi}$ — the formula of every E&M textbook.` },
    ],
    answer: t`$\nabla\cdot V = \tfrac1r\partial_r(rV^r) + \partial_\theta V^\theta = \tfrac1r\partial_r(rV^{\hat r}) + \tfrac1r\partial_\theta V^{\hat\theta}$; $\nabla^2f = f_{rr} + f_r/r + f_{\theta\theta}/r^2$, which gives 2 for $f = y^2$.`,
  },
  practice: [
    num({
      id: 'trace-gamma', difficulty: 2,
      gen(r) {
        const which = r.pick(['r', 'theta']), R = r.pick([2, 4, 5]), th = r.pick([30, 45, 60]);
        const ans = which === 'r' ? 2 / R : 1 / Math.tan(th * DEG);
        return {
          prompt: t`In spherical coordinates $\sqrt g = r^2\sin\theta$. Using $\Gamma^\mu{}_{\mu\lambda} = \partial_\lambda\ln\sqrt g$, find ${which === 'r' ? t`$\Gamma^\mu{}_{\mu r}$ at $r = ${R}$` : t`$\Gamma^\mu{}_{\mu\theta}$ at $\theta = ${th}^\circ$`}.`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [2.2, which === 'r' ? 55 : th, 40], sliders: false, readouts: [], element: true, edgeLabels: true }, caption: t`The coordinate box at a point: its volume $r^2\sin\theta\,dr\,d\theta\,d\phi$ is where $\sqrt g$ comes from.` },
          answer: ans, tol: { rel: 0.005 },
          errors: which === 'r' ? [{ value: 1 / R, feedback: t`$\ln(r^2\sin\theta) = 2\ln r + \ln\sin\theta$: the derivative in $r$ is $2/r$.` }] : [{ value: Math.tan(th * DEG), feedback: t`$\partial_\theta\ln\sin\theta = \cos\theta/\sin\theta = \cot\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\ln\sqrt g = 2\ln r + \ln\sin\theta$.`],
          teach: t`The traced Christoffel symbol is a logarithmic derivative of the volume factor: $\Gamma^\mu{}_{\mu\lambda} = \partial_\lambda\ln\sqrt g$.`,
          explain: which === 'r' ? t`$\Gamma^\mu{}_{\mu r} = 2/r = ${nice(ans, 4)}$, the sum $\Gamma^\theta{}_{\theta r} + \Gamma^\phi{}_{\phi r} = \tfrac1r + \tfrac1r$.` : t`$\Gamma^\mu{}_{\mu\theta} = \cot\theta = ${nice(ans, 4)}$, which is $\Gamma^\phi{}_{\phi\theta}$.`,
        };
      },
    }),
    num({
      id: 'lap-polar', difficulty: 3,
      gen(r) {
        const [n, m] = r.pick([[3, 1], [2, 1], [1, 2], [4, 2], [2, 3]]), R = r.pick([1.5, 2]), th = r.pick([20, 50, 70]);
        const ans = (n * n - m * m) * R ** (n - 2) * Math.cos(m * th * DEG);
        return {
          prompt: t`Find the Laplacian of $f = r^{${n}}\cos${m === 1 ? '' : m}\theta$ at $(r, \theta) = (${R}, ${th}^\circ)$, using $\nabla^2f = f_{rr} + \tfrac1rf_r + \tfrac1{r^2}f_{\theta\theta}$.`,
          visual: { type: 'c3-contour', params: { f: `(x^2 + y^2)^(${n / 2})*cos(${m}*atan2(y, x))`, x: [-2.4, 2.4], y: [-1.5, 1.5], levels: 10, labels: false }, caption: t`Contours of $f$ on the plane.` },
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: (n * (n - 1) + m * m) * R ** (n - 2) * Math.cos(m * th * DEG), feedback: t`Two slips: $f_r/r$ is missing, and $\partial_\theta^2\cos m\theta = -m^2\cos m\theta$ has a minus sign.` }, { value: n * n * R ** (n - 2) * Math.cos(m * th * DEG), feedback: t`Include the angular term: $\tfrac1{r^2}f_{\theta\theta} = -m^2r^{${n - 2}}\cos${m === 1 ? '' : m}\theta$.` }].filter((e) => [1, -1, 2, 0.5, -2, -0.5].every((k) => Math.abs(e.value - k * ans) > 0.01 * Math.abs(ans) + 0.005)),
          hints: [t`$f_{rr} + \tfrac1rf_r = [n(n-1) + n]\,r^{n-2}\cos m\theta = n^2r^{n-2}\cos m\theta$.`, t`$\tfrac{1}{r^2}f_{\theta\theta} = -m^2r^{n-2}\cos m\theta$, so $\nabla^2f = (n^2 - m^2)\,r^{n-2}\cos m\theta$.`],
          teach: t`In polar coordinates $\nabla^2(r^n\cos m\theta) = (n^2 - m^2)\,r^{n-2}\cos m\theta$: zero exactly when $n = \pm m$.`,
          explain: t`$\nabla^2f = (${n * n} - ${m * m})\,${R}^{${n - 2}}\cos(${m * th}^\circ) = ${nice(ans, 4)}$. With $n = m$ the result vanishes: $r^m\cos m\theta$ is the real part of $(x + iy)^m$, a harmonic function.`,
        };
      },
    }),
    num({
      id: 'div-physical', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4]), th = r.pick([0, 60, 120, 180]);
        const ans = 2 * a + b * Math.cos(th * DEG);
        return {
          prompt: t`A 2D flow has unit-vector components $V^{\hat r} = ${a}r$ and $V^{\hat\theta} = ${b}r\sin\theta$. Find its divergence at a point with $\theta = ${th}^\circ$ (it does not depend on $r$).`,
          visual: physPic((rr, q) => [a * rr, b * rr * Math.sin(q)], t`The flow on a polar grid (arrows to scale with one another).`),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: a + b * Math.cos(th * DEG), feedback: t`$\tfrac1r\partial_r(r\cdot${a}r) = ${2 * a}$, not ${a}: differentiate $${a}r^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\nabla\cdot V = \tfrac1r\partial_r(rV^{\hat r}) + \tfrac1r\partial_\theta V^{\hat\theta}$.`],
          teach: t`With unit-vector components the polar divergence is $\tfrac1r\partial_r(rV^{\hat r}) + \tfrac1r\partial_\theta V^{\hat\theta}$.`,
          explain: t`$\tfrac1r\partial_r(${a}r^2) + \tfrac1r\partial_\theta(${b}r\sin\theta) = ${2 * a} + ${b}\cos\theta = ${nice(ans, 4)}$ at $\theta = ${th}^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'which-formula', difficulty: 2,
      prompt: t`In polar coordinates, which divergence formula is right for **coordinate** components $(V^r, V^\theta)$?`,
      visual: physPic((rr, q) => [1, 0.6], t`A field with constant unit-vector components: one unit out, 0.6 round. Its coordinate component $V^\theta = 0.6/r$ is not constant.`),
      choices: [
        t`$\dfrac1r\partial_r(rV^r) + \partial_\theta V^\theta$`,
        t`$\dfrac1r\partial_r(rV^r) + \dfrac1r\partial_\theta V^\theta$`,
        t`$\partial_rV^r + \partial_\theta V^\theta$`,
        t`$\dfrac1r\partial_r(r^2V^r) + \partial_\theta V^\theta$`,
      ],
      answer: 0,
      why: {
        1: t`That is the unit-vector formula with $V^{\hat\theta}$ replaced by $V^\theta$; the $1/r$ belongs with $V^{\hat\theta} = rV^\theta$.`,
        2: t`That is $\partial_\mu V^\mu$, which is not a scalar: it misses $\Gamma^\mu{}_{\mu r}V^r = V^r/r$.`,
        3: t`The weight is $\sqrt g = r$, not $r^2$ (that would be spherical coordinates’ radial term).`,
      },
      hints: [t`$\nabla_\mu V^\mu = \tfrac{1}{\sqrt g}\partial_\mu(\sqrt gV^\mu)$ with $\sqrt g = r$, which does not depend on $\theta$.`],
      teach: 'Know which components a formula uses: coordinate components and unit-vector components give differently shaped formulas for the same divergence.',
      explain: t`$\tfrac1r\partial_r(rV^r) + \tfrac1r\partial_\theta(rV^\theta) = \tfrac1r\partial_r(rV^r) + \partial_\theta V^\theta$. In terms of $V^{\hat\theta} = rV^\theta$ it becomes the textbook $\tfrac1r\partial_\theta V^{\hat\theta}$.`,
    }),
    num({
      id: 'poisson-ball', difficulty: 3,
      gen(r) {
        const rho = r.pick([2, 5, 8]) * 1e-6, eps0 = 8.854e-12;
        const ans = -rho / eps0;
        return {
          prompt: t`Inside a uniformly charged ball of radius $R$ and charge density $\rho = ${tex(rho)}\ \text{C/m}^3$, the potential is $\Phi(r) = \dfrac{\rho}{6\varepsilon_0}(3R^2 - r^2)$. Use the spherical Laplacian $\nabla^2\Phi = \tfrac{1}{r^2}\partial_r(r^2\partial_r\Phi)$ (no angular dependence) to find $\nabla^2\Phi$, in V/m², with $\varepsilon_0 = 8.854\times10^{-12}$ F/m.`,
          visual: profile('(3 - x^2)/6', [0, 1.6], [0, 0.6], t`$\Phi$ inside the ball, in units of $\rho R^2/\varepsilon_0$, against $r/R$.`, { xlabel: 'r / R', ylabel: 'Φ' }),
          answer: ans, units: 'V/m^2', tol: { rel: 0.01 },
          errors: [{ value: -rho / (3 * eps0), feedback: t`That is $\Phi''$ alone. The Laplacian adds $\tfrac2r\Phi'$: $\tfrac{1}{r^2}\partial_r\big(r^2\cdot(-\rho r/3\varepsilon_0)\big) = -\rho/\varepsilon_0$.` }],
          hints: [t`$\partial_r\Phi = -\rho r/(3\varepsilon_0)$.`, t`$r^2\partial_r\Phi = -\rho r^3/(3\varepsilon_0)$; differentiate and divide by $r^2$.`],
          teach: t`The spherical Laplacian of the ball’s potential returns Poisson’s equation, $\nabla^2\Phi = -\rho/\varepsilon_0$.`,
          explain: t`$\nabla^2\Phi = \tfrac1{r^2}\partial_r(-\rho r^3/3\varepsilon_0) = -\rho/\varepsilon_0 = ${tex(ans, 4)}$ V/m² — Poisson’s equation, recovered from the metric.`,
        };
      },
    }),
    num({
      id: 'lap-sph', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, -1, -3]), R = r.pick([1.5, 2]), th = r.pick([30, 60]);
        const ans = (n * (n + 1) - 2) * R ** (n - 2) * Math.cos(th * DEG);
        return {
          prompt: t`Find $\nabla^2f$ for $f = r^{${n}}\cos\theta$ at $(r, \theta) = (${R}, ${th}^\circ)$, using the spherical Laplacian (there is no $\phi$ dependence).`,
          visual: { type: 'c3-coords', params: { system: 'spherical', point: [R, th, 35], sliders: false, readouts: [], basis: true }, caption: t`The point at $r = ${R}$, $\theta = ${th}^\circ$ (physics convention).` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: n * (n + 1) * R ** (n - 2) * Math.cos(th * DEG), feedback: t`That is only the radial part. The angular part gives $\tfrac{1}{r^2\sin\theta}\partial_\theta(\sin\theta\cdot(-\sin\theta)) = -2\cos\theta/r^2$ times $r^{${n}}$.` }],
          hints: [t`Radial: $\tfrac{1}{r^2}\partial_r(r^2\cdot ${n}r^{${n - 1}}) = ${n * (n + 1)}r^{${n - 2}}$, times $\cos\theta$.`, t`Angular: $\tfrac{1}{r^2\sin\theta}\partial_\theta(\sin\theta\,\partial_\theta\cos\theta) = -\tfrac{2\cos\theta}{r^2}$, times $r^{${n}}$.`],
          teach: t`$\nabla^2(r^n\cos\theta) = [n(n+1) - 2]\,r^{n-2}\cos\theta$: zero for $n = 1$ (the uniform field’s potential $z$) and $n = -2$ (a dipole).`,
          explain: t`$\nabla^2f = [${n}(${n + 1}) - 2]\,r^{${n - 2}}\cos\theta = ${nice(ans, 4)}$. The two harmonic cases, $r\cos\theta = z$ and $\cos\theta/r^2$, are the potentials of a uniform field and of a dipole.`,
        };
      },
    }),
    code({
      id: 'sympy-laplacian', difficulty: 3,
      prompt: t`Write \`laplacian(f, g, q)\` returning $\nabla^2f = \dfrac{1}{\sqrt g}\partial_\mu\!\left(\sqrt g\,g^{\mu\nu}\partial_\nu f\right)$, simplified, for a scalar \`f\`, a metric matrix \`g\` and the coordinate list \`q\` (the helper \`sqrt_det(g)\` gives $\sqrt g$). The tests use polar and spherical coordinates.`,
      starter: t`import sympy as sp
r, th, ph = sp.symbols('r theta phi', positive=True)

def sqrt_det(g):
    # sqrt of det g; SymPy writes |sin(theta)|, but 0 < theta < pi here, so drop the Abs
    return sp.sqrt(g.det()).replace(sp.Abs, lambda a: a)

def laplacian(f, g, q):
    pass   # sqrt_det(g), the inverse metric g.inv(), then the formula

g_polar = sp.diag(1, r**2)
g_sph = sp.diag(1, r**2, r**2 * sp.sin(th)**2)
print(laplacian(r**2 * sp.sin(th)**2, g_polar, [r, th]))   # y^2: expect 2
`,
      answer: t`import sympy as sp
r, th, ph = sp.symbols('r theta phi', positive=True)

def sqrt_det(g):
    # sqrt of det g; SymPy writes |sin(theta)|, but 0 < theta < pi here, so drop the Abs
    return sp.sqrt(g.det()).replace(sp.Abs, lambda a: a)

def laplacian(f, g, q):
    sg = sqrt_det(g)
    ginv = g.inv()
    n = len(q)
    total = sum(sp.diff(sg * sum(ginv[m, k] * sp.diff(f, q[k]) for k in range(n)), q[m]) for m in range(n))
    return sp.simplify(total / sg)

g_polar = sp.diag(1, r**2)
g_sph = sp.diag(1, r**2, r**2 * sp.sin(th)**2)
print(laplacian(r**2 * sp.sin(th)**2, g_polar, [r, th]))   # y^2: expect 2`,
      tests: [
        { name: t`polar: $\nabla^2(r^2\sin^2\theta) = 2$ (it is $y^2$)`, code: 'sp.simplify(laplacian(r**2*sp.sin(th)**2, g_polar, [r, th]) - 2) == 0' },
        { name: t`polar: $\nabla^2(r^3\cos\theta) = 8r\cos\theta$`, code: 'sp.simplify(laplacian(r**3*sp.cos(th), g_polar, [r, th]) - 8*r*sp.cos(th)) == 0' },
        { name: t`spherical: $1/r$ and the dipole $\cos\theta/r^2$ are harmonic`, code: 'sp.simplify(laplacian(1/r, g_sph, [r, th, ph])) == 0 and sp.simplify(laplacian(sp.cos(th)/r**2, g_sph, [r, th, ph])) == 0' },
        { name: t`spherical: $\nabla^2(r^2\sin^2\theta\cos2\phi) = 0$ (it is $x^2 - y^2$)`, code: 'sp.simplify(laplacian(r**2*sp.sin(th)**2*sp.cos(2*ph), g_sph, [r, th, ph])) == 0' },
      ],
      hints: [t`\`sg = sqrt_det(g)\` and \`ginv = g.inv()\`.`, t`Build the gradient vector $V^m = \sum_k g^{mk}\partial_kf$, then return \`sp.simplify(sum(sp.diff(sg * V[m], q[m]) for m in range(n)) / sg)\`.`],
      teach: 'One short function, fed a metric, reproduces every curvilinear Laplacian.',
      explain: t`The same eight lines handle any coordinates with a diagonal or non-diagonal metric. The tests recover the Cartesian results: $y^2$ has Laplacian 2, and $x^2 - y^2$, $1/r$ and $\cos\theta/r^2$ are harmonic.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fuel', difficulty: 3, transfer: true,
      gen(r) {
        const q = r.pick([1, 2, 3]) * 1e8, k = r.pick([3, 5, 20]);
        const ans = -q / k;
        return {
          prompt: t`A cylindrical fuel element in a nuclear-thermal rocket engine generates heat uniformly, $q = ${tex(q)}\ \text{W/m}^3$, and has thermal conductivity $k = ${k}$ W/(m K). In steady state its temperature is $T(r) = T_0 - \dfrac{q}{4k}\,r^2$. Using the polar Laplacian, find $\nabla^2T$, in $\text{K/m}^2$.`,
          visual: profile(`1 - 0.6*x^2`, [0, 1.1], [0, 1.15], t`The temperature across the element, schematic: hottest on the axis, falling as $r^2$ toward the coolant.`, { xlabel: 'r / radius', ylabel: 'T (schematic)' }),
          answer: ans, units: 'K/m^2', tol: { rel: 0.01 },
          errors: [{ value: -q / (2 * k), feedback: t`That is $T''$ alone. The polar Laplacian also has $\tfrac1rT' = -q/(2k)$.` }, { value: -q / (4 * k), feedback: t`Differentiate: $T' = -qr/(2k)$, then $\tfrac1r(rT')' = -q/k$.` }],
          hints: [t`$\nabla^2T = \tfrac1r\partial_r(r\,\partial_rT)$ when $T$ depends on $r$ only.`, t`$r\,\partial_rT = -\tfrac{q}{2k}r^2$.`],
          teach: t`Steady heat conduction with a source obeys $\nabla^2T = -q/k$; in cylindrical geometry the Laplacian brings the $\tfrac1r\partial_r(r\,\cdot)$ form.`,
          explain: t`$\nabla^2T = \tfrac1r\partial_r\!\left(-\tfrac{q}{2k}r^2\right) = -q/k = ${tex(ans, 4)}\ \text{K/m}^2$ — the heat equation $k\nabla^2T + q = 0$, satisfied.`,
        };
      },
    }),
    num({
      id: 'cp-zfield', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, 5]), th = r.pick([30, 45, 60]);
        return {
          prompt: t`A field has spherical unit-vector components $V^{\hat r} = ${a}r\cos^2\theta$, $V^{\hat\theta} = -${a}r\sin\theta\cos\theta$, $V^{\hat\phi} = 0$. Find its divergence at $\theta = ${th}^\circ$, using $\nabla\cdot V = \dfrac{1}{r^2}\partial_r(r^2V^{\hat r}) + \dfrac{1}{r\sin\theta}\partial_\theta(\sin\theta\,V^{\hat\theta})$.`,
          visual: physPic((rr, q) => [a * rr * Math.cos(q) ** 2, -a * rr * Math.sin(q) * Math.cos(q)], t`A slice through the $z$ axis, drawn with $z$ horizontal: the field points along $z$ and grows with distance from the plane $z = 0$.`),
          answer: a, tol: { rel: 0.005 },
          errors: [{ value: 3 * a * Math.cos(th * DEG) ** 2, feedback: 'That is only the radial part. Add the θ part.' }],
          hints: [t`Radial: $\tfrac{1}{r^2}\partial_r(${a}r^3\cos^2\theta) = ${3 * a}\cos^2\theta$.`, t`Angular: $\tfrac{1}{r\sin\theta}\partial_\theta(-${a}r\sin^2\theta\cos\theta) = ${a}(\sin^2\theta - 2\cos^2\theta)$.`],
          teach: t`The spherical divergence formula is $\tfrac{1}{\sqrt g}\partial_\mu(\sqrt gV^\mu)$ rewritten in unit-vector components.`,
          explain: t`$${3 * a}\cos^2\theta + ${a}\sin^2\theta - ${2 * a}\cos^2\theta = ${a}$ at every point. The field is $${a}z\,\hat z$, whose Cartesian divergence is $\partial_z(${a}z) = ${a}$ ✓.`,
        };
      },
    }),
    mcq({
      id: 'cp-why-r', difficulty: 2,
      prompt: t`Why does the polar divergence contain $\tfrac1r\partial_r(rV^r)$ rather than just $\partial_rV^r$?`,
      visual: physPic((rr) => [1 / rr, 0], t`The field $r^{-1}\hat r$: the arrows weaken as the circles they cross lengthen.`, { cap: 1.4 }),
      choices: [
        t`The circles get longer as $r$ grows ($\sqrt g = r$): a field that keeps its total outflow must weaken like $1/r$, and the extra $\Gamma^\theta{}_{\theta r}V^r = V^r/r$ term accounts for that spreading`,
        t`It is a convention; $\partial_rV^r$ would do equally well`,
        t`Because the field is measured in unit-vector components`,
        t`Because $\Gamma^r{}_{rr} = 1/r$`,
      ],
      answer: 0,
      why: {
        1: t`$\partial_\mu V^\mu$ is not a scalar; for the field $V^r = 1/r$ it gives $-1/r^2$, though no charge is there.`,
        2: t`The $1/r$ in front comes from $\sqrt g$, whichever components you use; with coordinate components the formula is $\tfrac1r\partial_r(rV^r) + \partial_\theta V^\theta$.`,
        3: t`$\Gamma^r{}_{rr} = 0$; the term is $\Gamma^\theta{}_{\theta r} = 1/r$.`,
      },
      hints: [t`$\Gamma^\mu{}_{\mu r} = \partial_r\ln\sqrt g$. What is $\sqrt g$ in polar coordinates, and what does it measure?`],
      teach: 'The √g in the divergence measures how coordinate cells grow: that growth is what the trace of Γ records.',
      explain: t`The outflow through a circle is $2\pi rV^r$. If no source sits between two circles, $rV^r$ is the same on both, and $\tfrac1r\partial_r(rV^r) = 0$. The field $V^r = 1/r$ — a line charge — is divergence-free away from the line, as Gauss’s law demands.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 3 (the divergence and Γ^μ_μλ = ∂_λ ln √|g|)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §1.4 and the inside back cover (curvilinear formulas)', url: 'https://www.cambridge.org/9781108420419' },
    { label: 'OpenStax Calculus Vol. 3, §6.5 (divergence and curl)', url: 'https://openstax.org/books/calculus-volume-3/pages/6-5-divergence-and-curl' },
  ],
});
