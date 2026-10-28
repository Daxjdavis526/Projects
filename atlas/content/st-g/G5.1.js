// Functional derivatives — of fields, in the form field theory and GR use them.
// δF/δφ(x) as the continuum limit of a gradient: on a grid, ∂F/∂φᵢ = Δx ·
// δF/δφ(xᵢ) (explore: the Dirichlet energy of sin πx, discrete gradient
// (2 − 2cos πh)/h² sin πx → π² sin πx). The field Euler–Lagrange operator
// ∂𝓛/∂φ − ∇·∂𝓛/∂(∇φ) in three dimensions; worked: Newtonian gravity’s field
// functional ∫(|∇Φ|²/8πG + ρΦ)d³x gives ∇²Φ = 4πGρ. Higher derivatives (a
// beam: ∫ EI w″²/2 → EI w⁗), a nonlocal functional (Coulomb energy → the
// potential, the ½ cancelling), the chain rule, units of δF/δφ, and the
// second functional derivative as an operator whose spectrum decides
// stability — Euler buckling P = π²EI/L² as the transfer.
// Avoids st-e E11.1 (definition, ½φ′² + V, δφ(y)/δφ(x), first variation,
// Beltrami, catenoid, gradient flow, solar sail) — linked, not repeated.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const SUB = '₀₁₂₃₄₅₆₇₈₉';

export default lesson({
  id: 'st-g.G5.1',
  title: 'Functional derivatives',
  minutes: 16, difficulty: 3,
  intro: t`A **functional** $F[\varphi]$ eats a whole field $\varphi(\mathbf x)$ and returns a number: an energy, an action. Its **functional derivative** $\delta F/\delta\varphi(\mathbf x)$ is its gradient — one component per point of space — defined by how $F$ changes when the field is nudged by $\epsilon\eta$: $\delta F = \epsilon\int \frac{\delta F}{\delta\varphi(\mathbf x)}\,\eta(\mathbf x)\,d^3x$. For a local functional $F = \int\mathcal L(\varphi, \nabla\varphi)\,d^3x$, integrating by parts gives

$$\frac{\delta F}{\delta\varphi(\mathbf x)} = \frac{\partial\mathcal L}{\partial\varphi} - \nabla\cdot\frac{\partial\mathcal L}{\partial(\nabla\varphi)}$$

Setting it to zero gives the field equation. The one-dimensional definition, the delta function and gradient flows are in [functional derivatives](#/lesson/st-e.E11.1); this lesson takes it to three dimensions, to higher derivatives and nonlocal functionals, and to second derivatives — the tools the [Einstein–Hilbert action](#/lesson/st-g.G5.3) needs.`,
  symbols: [
    { tex: 'F[\\varphi]', text: 'a functional: a number computed from the entire field (square brackets mark the whole-function argument)' },
    { tex: '\\varphi(\\mathbf x)', text: t`a field: a number at every point $\mathbf x$ of space (a temperature, a potential, a metric component)` },
    { tex: '\\mathcal L', text: t`the density: the integrand of $F$, here depending on $\varphi$ and its gradient at the same point` },
    { tex: '\\nabla\\varphi', text: t`the gradient of the field, with components $\partial_i\varphi$` },
    { tex: '\\frac{\\partial\\mathcal L}{\\partial(\\nabla\\varphi)}', text: t`the vector of partial derivatives of $\mathcal L$ with respect to each $\partial_i\varphi$, treated as independent variables` },
    { tex: '\\frac{\\delta F}{\\delta\\varphi(\\mathbf x)}', text: t`the functional derivative: how much $F$ changes per unit change of $\varphi$ concentrated at $\mathbf x$, per unit volume. Units: units of $F$ ÷ (units of $\varphi$ × volume).` },
  ],
  why: 'Every field equation in physics — Poisson, Maxwell, Klein–Gordon, Einstein — is the statement that a functional derivative of an action vanishes.',
  visual: {
    type: 'graph',
    title: 'A gradient with one component per point',
    lead: t`Put the field $\varphi = \sin\pi x$ on $N$ grid intervals and take $F = \int_0^1\tfrac12\varphi'^2dx$ as a sum of squared differences. Its ordinary partial derivatives $\partial F/\partial\varphi_i$ (gold) shrink as the grid refines; divided by the spacing $h = 1/N$ (blue dots) they converge to the functional derivative $-\varphi'' = \pi^2\sin\pi x$ (blue curve).`,
    tasks: [
      t`At $N = 4$ the blue dots sit $5\%$ below the curve. At $N = 16$ they are within $0.3\%$: the error falls like $h^2$.`,
      t`Watch the gold dots fall like $1/N$: each grid value carries less of the field, so moving it alone changes $F$ less. That is why $\delta F/\delta\varphi$ is a **density** — per unit length here, per unit volume in 3D.`,
      t`The largest component sits mid-span: lowering $\varphi$ where it bulges most lowers $F$ fastest, the way a gradient points uphill.`,
    ],
    params: {
      x: [0, 1], y: [-0.5, 11], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
      sliders: [{ key: 'N', label: 'Grid intervals $N$', min: 3, max: 16, step: 1, value: 4, explain: t`The field is stored at $x_i = i/N$; its ends are held at $0$.` }],
      curves: [
        { fn: 'pi^2*sin(pi*x)', color: 'accent', width: 2.2, label: 'δF/δφ = π² sin πx', labelAt: 0.72, labelDx: 8, labelDy: -6 },
        { fn: 'sin(pi*x)', color: 'ink3', width: 1.4, dash: true, label: 'φ', labelAt: 0.15, labelDx: 6, labelDy: -6 },
      ],
      points: Array.from({ length: 15 }, (_, k) => k + 1).flatMap((i) => [
        { x: `${i}/N`, y: `(2 - 2*cos(pi/N))*N^2*sin(pi*${i}/N)`, color: 'accent', r: 4, when: `step(N - ${i} - 0.5)` },
        { x: `${i}/N`, y: `(2 - 2*cos(pi/N))*N*sin(pi*${i}/N)`, color: 'gold', r: 3.5, when: `step(N - ${i} - 0.5)` },
      ]),
      legend: [{ label: '∂F/∂φᵢ', color: 'gold', point: true }, { label: '(∂F/∂φᵢ)/h', color: 'accent', point: true }], legendAt: 'tr',
      readouts: [
        { label: t`$h$`, expr: '1/N', digits: 3 },
        { label: t`mid-span dot ÷ curve`, expr: '(2 - 2*cos(pi/N))*N^2/pi^2', digits: 4 },
      ],
    },
    caption: t`Exact: for this grid, $\partial F/\partial\varphi_i = (2\varphi_i - \varphi_{i-1} - \varphi_{i+1})/h = \tfrac{2 - 2\cos\pi h}{h}\sin\pi x_i$. The field itself (dashed) is drawn to its own scale.`,
  },
  example: {
    prompt: t`Newtonian gravity as a field theory: show that the functional $E[\Phi] = \displaystyle\int\Bigl(\frac{|\nabla\Phi|^2}{8\pi G} + \rho\,\Phi\Bigr)d^3x$ is stationary exactly when $\nabla^2\Phi = 4\pi G\rho$.`,
    visual: { type: 'graph', params: { x: [0, 3], y: [-1.6, 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'r / R', ylabel: 'Φ ÷ (GM/R)', curves: [{ fn: '(x^2 - 3)/2', domain: [0, 1], color: 'accent', width: 2.2, label: 'inside: a parabola', labelAt: 0.3, labelDx: 4, labelDy: 14 }, { fn: '-1/x', domain: [1, 3], color: 'accent', width: 2.2, label: 'outside: −1/r', labelAt: 2, labelDy: -10 }], vlines: [{ x: 1, color: 'ink3', label: 'surface' }] }, caption: t`The potential of a uniform ball, which satisfies the equation this functional produces: $\nabla^2\Phi = 4\pi G\rho$ inside, $0$ outside.` },
    steps: [
      { label: 'Identify the density', text: t`$\mathcal L = \dfrac{|\nabla\Phi|^2}{8\pi G} + \rho\Phi$. It depends on $\Phi$ through the term $\rho\Phi$ and on $\nabla\Phi$ through $|\nabla\Phi|^2 = \sum_i(\partial_i\Phi)^2$.` },
      { label: 'Partial derivatives', text: t`$\dfrac{\partial\mathcal L}{\partial\Phi} = \rho$ and $\dfrac{\partial\mathcal L}{\partial(\partial_i\Phi)} = \dfrac{2\,\partial_i\Phi}{8\pi G} = \dfrac{\partial_i\Phi}{4\pi G}$.` },
      { label: 'Assemble', text: t`$\dfrac{\delta E}{\delta\Phi} = \rho - \nabla\cdot\dfrac{\nabla\Phi}{4\pi G}$, $= \rho - \dfrac{\nabla^2\Phi}{4\pi G}$. The divergence came from moving the derivative off $\eta$ by integration by parts in three dimensions (the divergence theorem); the surface term dies because $\eta$ vanishes far away.` },
      { label: 'Stationary', text: t`$\delta E/\delta\Phi = 0$ for every point $\Rightarrow \nabla^2\Phi = 4\pi G\rho$: Poisson’s equation. One functional derivative, one field equation per point of space.` },
      { label: 'Sense check', text: t`Units: $|\nabla\Phi|^2/G$ and $\rho\Phi$ are both $\text{J/m}^3$, so $E$ is in joules and $\delta E/\delta\Phi$ in $\text{kg/m}^3$ — a mass density, as the answer $\rho - \dots$ requires.` },
    ],
    answer: t`$\dfrac{\delta E}{\delta\Phi(\mathbf x)} = \rho - \dfrac{\nabla^2\Phi}{4\pi G}$, so stationarity is $\nabla^2\Phi = 4\pi G\rho$. The [Newtonian field theory](#/lesson/gr.S01.d) is this functional; general relativity replaces it with the Einstein–Hilbert action.`,
  },
  practice: [
    mcq({
      id: 'gradient-term', difficulty: 2,
      prompt: t`What is $\dfrac{\delta}{\delta\varphi(\mathbf x)}\displaystyle\int\tfrac12|\nabla\varphi|^2\,d^3x$?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.6, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', curves: [{ fn: 'e^(-x^2)', color: 'ink2', width: 2, dash: true, label: 'φ (a bump)', labelAt: 0.9, labelDx: 6, labelDy: -4 }, { fn: '(2 - 4*x^2)*e^(-x^2)/2', color: 'accent', width: 2.2, label: '−½∇²φ, scaled', labelAt: 1.5, labelDx: 6, labelDy: -10 }] }, caption: t`A one-dimensional slice: a bump $\varphi$ and $-\nabla^2\varphi$ (scaled by $\tfrac12$ to fit). The derivative is positive where the field bulges up: flattening the bump lowers the gradient energy.` },
      choices: [t`$-\nabla^2\varphi$`, t`$+\nabla^2\varphi$`, t`$\nabla\varphi$`, t`$|\nabla\varphi|$`],
      answer: 0,
      why: {
        1: t`The minus sign comes from integration by parts: $\int\nabla\varphi\cdot\nabla\eta = -\int(\nabla^2\varphi)\eta$ + a surface term.`,
        2: t`$\nabla\varphi$ is a vector; a functional derivative of a scalar functional with respect to a scalar field is a scalar at each point.`,
        3: t`Differentiate $\tfrac12|\nabla\varphi|^2$ with respect to $\nabla\varphi$ (giving $\nabla\varphi$), then take minus its divergence.`,
      },
      hints: [t`$\partial\mathcal L/\partial(\nabla\varphi) = \nabla\varphi$ and $\partial\mathcal L/\partial\varphi = 0$.`, t`Apply $\partial\mathcal L/\partial\varphi - \nabla\cdot\partial\mathcal L/\partial(\nabla\varphi)$.`],
      teach: 'A gradient-squared term contributes minus the Laplacian: integration by parts moves the derivative and flips the sign.',
      explain: t`$-\nabla\cdot\nabla\varphi = -\nabla^2\varphi$. Steepest descent on this functional is the heat equation, $\partial_t\varphi = \nabla^2\varphi$; its stationary points are harmonic functions.`,
    }),
    num({
      id: 'grid-component', difficulty: 2,
      gen(r) {
        const N = r.pick([50, 100, 200]), x0 = r.pick([0.25, 0.5, 0.3]);
        const h = 1 / N, ans = h * Math.PI ** 2 * Math.sin(Math.PI * x0);
        return {
          prompt: t`On a grid of spacing $h = 1/${N}$, the field $\varphi = \sin\pi x$ makes $F = \int_0^1\tfrac12\varphi'^2dx$ have functional derivative $\pi^2\sin\pi x$. Approximately what is the ordinary partial derivative $\partial F/\partial\varphi_i$ for the grid value at $x_i = ${x0}$?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-0.5, 11], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', curves: [{ fn: 'pi^2*sin(pi*x)', color: 'accent', width: 2.2, label: 'δF/δφ', labelAt: 0.7, labelDx: 8 }], vlines: [{ x: x0, color: 'gold', label: `xᵢ = ${x0}` }] }, caption: t`The functional derivative; the grid value at $x_i$ is one of $${N}$ interior points.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.PI ** 2 * Math.sin(Math.PI * x0), feedback: t`That is the functional derivative, a density. One grid value controls a length $h$ of the field: multiply by $h$.` }, { value: ans / (h * h), feedback: 'Multiply by h once, not divide by it.' }],
          hints: [t`$\partial F/\partial\varphi_i \approx h\,\dfrac{\delta F}{\delta\varphi(x_i)}$.`, t`$h\,\pi^2\sin(${x0}\pi)$ with $h = 1/${N}$.`],
          teach: 'On a grid, an ordinary partial derivative equals the functional derivative times the cell size: ∂F/∂φᵢ ≈ Δx · δF/δφ(xᵢ).',
          explain: t`$\tfrac{1}{${N}}\pi^2\sin(${x0}\pi) = ${nice(ans, 3)}$. In three dimensions the factor is the cell volume $\Delta V$: this is how codes compute forces from energy functionals.`,
        };
      },
    }),
    num({
      id: 'beam', difficulty: 3,
      gen(r) {
        const EI = r.pick([800, 2000, 5000]), A = r.pick([0.005, 0.01, 0.02]), L = r.pick([1.5, 2, 3]), q = r.pick([200, 500, 1000]);
        const ans = EI * A * (Math.PI / L) ** 4 - q;
        return {
          prompt: t`A beam’s potential energy is $U[w] = \displaystyle\int_0^L\Bigl(\frac{EI}{2}w''^2 - q\,w\Bigr)dx$, with deflection $w(x)$, bending stiffness $EI = ${EI}\ \text{N m}^2$ and load $q = ${q}\ \text{N/m}$. Its functional derivative is $EI\,w'''' - q$ (two integrations by parts, two sign flips). For the trial shape $w = ${A}\sin(\pi x/L)$ with $L = ${L}\ \text{m}$, evaluate $\delta U/\delta w$ at mid-span.`,
          visual: { type: 'graph', params: { x: [0, L], y: [-0.004, A * 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'w (m)', curves: [{ fn: `${A}*sin(pi*x/${L})`, color: 'accent', width: 2.2, label: 'trial deflection', labelAt: L * 0.7, labelDx: 6, labelDy: -8 }], points: [{ x: 0, y: 0, color: 'ink2', label: 'pin' }, { x: L, y: 0, color: 'ink2', label: 'pin', labelDx: -24 }] }, caption: t`The trial deflection (upward here) of a beam pinned at both ends. Not to scale vertically.` },
          answer: ans, units: 'N/m', tol: { rel: 0.01 },
          errors: [{ value: EI * A * (Math.PI / L) ** 2 - q, feedback: t`$w''''$ of $\sin(\pi x/L)$ brings down $(\pi/L)^4$, not $(\pi/L)^2$.` }, { value: -EI * A * (Math.PI / L) ** 4 - q, feedback: t`Two integrations by parts give two minus signs: $+EI\,w''''$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`$w'''' = ${A}\,(\pi/L)^4\sin(\pi x/L)$, which is $${A}(\pi/${L})^4$ at mid-span.`, t`$\delta U/\delta w = ${EI}\times${A}\times(\pi/${L})^4 - ${q}$.`],
          teach: t`Each derivative in the density costs one integration by parts and one sign: a $w''^2$ term gives $+w''''$.`,
          explain: t`$${EI}\times${A}\times${nice((Math.PI / L) ** 4, 4)} - ${q} = ${nice(ans, 3)}\ \text{N/m}$. Not zero, so this shape is not the equilibrium: the residual is the net force per length still pushing the beam. The true deflection solves $EI\,w'''' = q$.`,
        };
      },
    }),
    mcq({
      id: 'coulomb', difficulty: 3,
      prompt: t`The electrostatic energy of a charge density is nonlocal: $U[\rho] = \dfrac12\displaystyle\iint\frac{\rho(\mathbf x)\,\rho(\mathbf y)}{4\pi\varepsilon_0|\mathbf x - \mathbf y|}\,d^3x\,d^3y$. What is $\delta U/\delta\rho(\mathbf x)$?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'r / R', ylabel: 'V ÷ (Q/4πε₀R)', curves: [{ fn: '(3 - x^2)/2', domain: [0, 1], color: 'accent', width: 2.2 }, { fn: '1/x', domain: [1, 4], color: 'accent', width: 2.2, label: 'potential V(r)', labelAt: 2, labelDy: -10 }] }, caption: t`The potential of a uniformly charged ball: the cost, per unit charge, of adding charge at each radius.` },
      choices: [
        t`$V(\mathbf x) = \displaystyle\int\frac{\rho(\mathbf y)\,d^3y}{4\pi\varepsilon_0|\mathbf x - \mathbf y|}$, the potential: the $\tfrac12$ cancels because $\rho$ appears twice`,
        t`$\tfrac12V(\mathbf x)$: the $\tfrac12$ stays`,
        t`$2V(\mathbf x)$: differentiating a square doubles it`,
        t`$\rho(\mathbf x)V(\mathbf x)$, the energy density`,
      ],
      answer: 0,
      why: {
        1: t`Varying $\rho$ hits both factors; by the symmetry of $1/|\mathbf x - \mathbf y|$ the two terms are equal, giving $2\times\tfrac12$.`,
        2: t`The $\tfrac12$ was there to avoid counting each pair twice; differentiating gives a factor $2$, and together they make $1$.`,
        3: t`A functional derivative strips off one factor of the field; $\rho V$ is an energy density, not a derivative.`,
      },
      hints: [t`Replace $\rho$ by $\rho + \epsilon\eta$; to first order you get two terms, one with $\eta(\mathbf x)\rho(\mathbf y)$ and one with $\rho(\mathbf x)\eta(\mathbf y)$.`, 'Swap the names x and y in the second term: it equals the first.'],
      teach: 'A functional quadratic in the field, ½∫∫φKφ with symmetric K, has derivative ∫Kφ: here the potential.',
      explain: t`$\delta U/\delta\rho(\mathbf x) = V(\mathbf x)$: the work to bring a little extra charge to $\mathbf x$. In density-functional theory and in self-gravitating fluids the same move turns an energy into a potential.`,
    }),
    num({
      id: 'chain', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]), x0 = r.pick([0.25, 0.5, 0.75]);
        const I = (a * a) / 3, ans = 4 * I * a * x0;
        return {
          prompt: t`Let $N[\varphi] = \displaystyle\int_0^1\varphi^2\,dx$ and $F[\varphi] = N[\varphi]^2$. By the chain rule, $\dfrac{\delta F}{\delta\varphi(x)} = 2N\,\dfrac{\delta N}{\delta\varphi(x)}$. Evaluate it for $\varphi = ${a}x$ at $x = ${x0}$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, a * 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'φ', curves: [{ fn: `${a}*x`, color: 'accent', width: 2.2 }], shade: [{ fn: `(${a}*x)^2/${a}`, from: 0, to: 1, color: 'accent', alpha: 0.15 }], vlines: [{ x: x0, color: 'gold' }] }, caption: t`The field $\varphi = ${a}x$ and, shaded, the shape of $\varphi^2$ (scaled), whose area is $N$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * I * a * x0, feedback: t`$\delta N/\delta\varphi = 2\varphi$, not $\varphi$: so $\delta F/\delta\varphi = 4N\varphi$.` }, { value: 2 * a * x0, feedback: t`That is $\delta N/\delta\varphi$. Multiply by $2N$ for the outer square.` }],
          hints: [t`$N = \int_0^1 ${a * a}x^2dx = ${nice(I, 4)}$ and $\delta N/\delta\varphi = 2\varphi$.`, t`$\delta F/\delta\varphi = 2N\cdot2\varphi = 4N\varphi(${x0})$.`],
          teach: 'Functional derivatives obey the chain rule: a function of a functional differentiates like a function of a variable, times the inner functional derivative.',
          explain: t`$4\times${nice(I, 4)}\times${a * x0} = ${nice(ans, 4)}$. The derivative at one point depends on the field everywhere through $N$: the functional is nonlocal, though built from a local one.`,
        };
      },
    }),
    mcq({
      id: 'units', difficulty: 2,
      prompt: t`An energy functional $E[\rho]$ (in joules) depends on a mass density $\rho(\mathbf x)$ (in $\text{kg/m}^3$) in three dimensions. What are the units of $\delta E/\delta\rho(\mathbf x)$?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'ρ', xticks: 0, yticks: 0, curves: [{ fn: '0.4 + 0.3*sin(2*pi*x)', color: 'ink2', width: 2 }, { fn: '0.4 + 0.3*sin(2*pi*x) + 0.5*e^(-((x - 0.6)/0.03)^2)', color: 'accent', width: 1.6, dash: true }], shade: [{ fn: '0.4 + 0.3*sin(2*pi*x) + 0.5*e^(-((x - 0.6)/0.03)^2)', lower: '0.4 + 0.3*sin(2*pi*x)', from: 0.5, to: 0.7, color: 'gold', alpha: 0.5 }] }, caption: t`A density with a small lump added near one point (gold). $\delta E$ is $\delta E/\delta\rho$ times the lump’s integral, $\int\eta\,d^3x$.` },
      choices: [t`$\text{J/kg}$ — energy per unit mass, a potential`, t`$\text{J m}^3\text{/kg}$`, t`$\text{J/m}^3$ — an energy density`, t`$\text{J}$ — the same as $E$`],
      answer: 0,
      why: {
        1: t`Check with $\delta E = \int(\delta E/\delta\rho)\,\eta\,d^3x$: J/kg × kg/m³ × m³ gives J. With J m³/kg you would get J m³.`,
        2: t`That is the units of the integrand of $E$, not of its derivative with respect to $\rho$.`,
        3: t`The derivative divides by the units of the field and by volume.`,
      },
      hints: [t`$\delta E = \int\dfrac{\delta E}{\delta\rho}\,\eta\,d^3x$, where $\eta$ has the units of $\rho$.`],
      teach: 'δF/δφ has the units of F divided by the units of φ and by volume: an energy differentiated by a mass density is energy per mass.',
      explain: t`$\text{J}\div(\text{kg/m}^3)\div\text{m}^3 = \text{J/kg}$. In the worked example $\delta E/\delta\rho = \Phi$, the gravitational potential, in J/kg. Keeping track of this catches missing factors of $\sqrt{-g}$ later.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-buckling', difficulty: 3, transfer: true,
      gen(r) {
        const E = 70e9, I = r.pick([2e-8, 5e-8, 1.2e-7]), L = r.pick([0.8, 1.2, 1.5, 2]);
        const ans = (Math.PI ** 2 * E * I) / (L * L) / 1000;
        return {
          prompt: t`An aluminium strut ($E = 70\ \text{GPa}$, second moment of area $I = ${tex(I)}\ \text{m}^4$, length $L = ${L}\ \text{m}$, pinned ends) carries a compressive load $P$. Its energy is $U[w] = \displaystyle\int_0^L\Bigl(\frac{EI}{2}w''^2 - \frac P2 w'^2\Bigr)dx$. The second functional derivative at $w = 0$ is the operator $EI\,\partial^4 + P\,\partial^2$; on the mode $\sin(\pi x/L)$ it gives $EI(\pi/L)^4 - P(\pi/L)^2$. At what load, in kN, does this stop being positive — the strut buckles?`,
          visual: { type: 'graph', params: { x: [-0.2 * L, 1.2 * L], y: [-0.3, 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: '', yticks: 0, curves: [{ fn: '0', domain: [0, L], color: 'ink2', width: 4, label: 'straight', labelAt: L * 0.1, labelDy: 12 }, { fn: `0.2*sin(pi*x/${L})`, domain: [0, L], color: 'accent', width: 2, dash: true, label: 'first buckling mode', labelAt: L * 0.5, labelDy: -10 }], arrows: [{ from: [-0.18 * L, 0], to: [-0.01 * L, 0], color: 'bad', width: 2.5, label: 'P' }, { from: [1.18 * L, 0], to: [1.01 * L, 0], color: 'bad', width: 2.5, label: 'P' }] }, caption: t`The strut and its first mode (exaggerated). Compression rewards bending through the $-\tfrac P2w'^2$ term.` },
          answer: ans, units: 'kN', tol: { rel: 0.01 },
          errors: [{ value: (E * I) / (L * L) / 1000, feedback: t`Forgot the $\pi^2$ from $(\pi/L)^2$.` }, { value: (Math.PI ** 2 * E * I) / L / 1000, feedback: t`The load scales as $1/L^2$: $P = EI(\pi/L)^2$.` }],
          hints: [t`Positive means $EI(\pi/L)^4 > P(\pi/L)^2$.`, t`$P_{\text{cr}} = \pi^2EI/L^2$.`],
          teach: 'The second functional derivative decides stability: when its lowest eigenvalue crosses zero, the straight configuration stops being a minimum (Euler buckling).',
          explain: t`$P_{\text{cr}} = \pi^2 EI/L^2 = ${nice(ans, 3)}\ \text{kN}$. Below it, straight is a minimum; above, the $\sin$ mode lowers the energy. Launch-vehicle struts and interstage panels are sized against exactly this — with knock-down factors, because real structures buckle below the ideal load.`,
        };
      },
    }),
    mcq({
      id: 'cp-poisson', difficulty: 2,
      prompt: t`Which functional is stationary exactly when $\nabla^2\Phi = 4\pi G\rho$?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-1.6, 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'r / R', ylabel: 'Φ ÷ (GM/R)', curves: [{ fn: '(x^2 - 3)/2', domain: [0, 1], color: 'accent', width: 2.2 }, { fn: '-1/x', domain: [1, 3], color: 'accent', width: 2.2 }] }, caption: t`A solution of Poisson’s equation: the potential of a uniform ball.` },
      choices: [
        t`$\displaystyle\int\Bigl(\frac{|\nabla\Phi|^2}{8\pi G} + \rho\Phi\Bigr)d^3x$`,
        t`$\displaystyle\int\Bigl(\frac{|\nabla\Phi|^2}{8\pi G} - \rho\Phi\Bigr)d^3x$`,
        t`$\displaystyle\int\Bigl(\frac{|\nabla\Phi|^2}{4\pi G} + \rho\Phi\Bigr)d^3x$`,
        t`$\displaystyle\int\Bigl(\frac{\Phi^2}{8\pi G} + \rho\Phi\Bigr)d^3x$`,
      ],
      answer: 0,
      why: {
        1: t`This gives $\nabla^2\Phi = -4\pi G\rho$: the sign of the source term flips the sign of the equation (the electrostatic convention, where like charges repel).`,
        2: t`This gives $\nabla^2\Phi = 2\pi G\rho$: the $\tfrac12$ hidden in $1/8\pi G$ cancels the $2$ from differentiating a square.`,
        3: t`No gradient, no Laplacian: this gives the algebraic equation $\Phi = -4\pi G\rho$.`,
      },
      hints: [t`Compute $\rho - \nabla\cdot\bigl(\partial\mathcal L/\partial\nabla\Phi\bigr)$ for each.`, t`The coefficient of $|\nabla\Phi|^2$ must be $1/8\pi G$ so that differentiating gives $1/4\pi G$.`],
      teach: 'The coefficients and signs in a functional fix those of its field equation: a ½ in front of a square, and the sign of the source coupling, are not cosmetic.',
      explain: t`$\delta/\delta\Phi$ of the first is $\rho - \nabla^2\Phi/4\pi G$. The same bookkeeping fixes the $1/16\pi G$ in front of the Einstein–Hilbert action, so that its variation gives $8\pi G$ in Einstein’s equations.`,
    }),
    mcq({
      id: 'cp-hessian', difficulty: 3,
      prompt: t`For $F[\varphi] = \displaystyle\int\Bigl(\tfrac12\varphi'^2 + V(\varphi)\Bigr)dx$, the second functional derivative at a stationary field $\varphi_0$ is the operator $H = -\dfrac{d^2}{dx^2} + V''(\varphi_0(x))$. What does $\varphi_0$ being a stable minimum require?`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [-1.6, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', curves: [{ fn: 'tanh(x/sqrt(2))', color: 'accent', width: 2.2, label: 'kink φ₀', labelAt: 3, labelDy: -10 }, { fn: '1.5*tanh(x/sqrt(2))^2 - 0.5', color: 'violet', width: 1.8, dash: true, label: 'V″(φ₀) ÷ 2', labelAt: -4, labelDy: -12 }] }, caption: t`A stationary “kink” of $V = \tfrac14(\varphi^2 - 1)^2$ and the potential $V''(\varphi_0(x))$ its fluctuations feel (scaled to fit). Where $V''$ dips negative, in the core, a fluctuation could in principle lower $F$; the gradient term prevents it.` },
      choices: [
        t`Every eigenvalue of $H$ is non-negative (zero only for symmetry directions, such as sliding the whole field)`,
        t`$V''(\varphi_0) > 0$ at every point`,
        t`$H$ is a bounded operator`,
        t`$F[\varphi_0] < 0$`,
      ],
      answer: 0,
      why: {
        1: t`$V''$ can be negative somewhere — as in the kink’s core — while the gradient term keeps every eigenvalue non-negative. Stability is a property of the whole operator.`,
        2: t`$-d^2/dx^2$ is unbounded (see [operators and their spectra](#/lesson/st-g.G3.3)); boundedness has nothing to do with stability.`,
        3: t`The value of $F$ says nothing about whether nearby fields have larger or smaller $F$.`,
      },
      hints: [t`Expand $F[\varphi_0 + \epsilon\eta] = F[\varphi_0] + \tfrac12\epsilon^2\langle\eta, H\eta\rangle + \dots$`, t`A minimum needs $\langle\eta, H\eta\rangle \ge 0$ for every $\eta$: a statement about the spectrum of $H$.`],
      teach: 'The second functional derivative is an operator; a stationary field is a stable minimum when that operator has no negative eigenvalues.',
      explain: t`For the kink, $H$’s lowest eigenvalue is exactly $0$, with eigenfunction $\varphi_0'$ — sliding the kink costs nothing — and the rest are positive: it is stable. The same test, on the operator governing black-hole perturbations, is mode stability.`,
    }),
  ],
  sources: [
    { label: 'Gelfand & Fomin, Calculus of Variations (Dover, 2000), chs. 1, 5, 7', url: 'https://openlibrary.org/isbn/9780486414485' },
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 1.10 and ch. 4 (functional derivatives of field actions)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Timoshenko & Gere, Theory of Elastic Stability, 2nd ed. (McGraw-Hill, 1961), ch. 2 (Euler buckling)', url: 'https://openlibrary.org/search?q=Timoshenko+Gere+Theory+of+Elastic+Stability' },
  ],
});
