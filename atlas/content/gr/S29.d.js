// Hyperbolicity, gauge and well-posedness — Derivation Mode. Ten second-order
// equations for ten metric components, but (i) the Bianchi identity makes the
// four G^0ν free of second time derivatives — constraints; (ii) the principal
// symbol of Ricci, ½(ξ²h − ξ_μξ^αh_αν − ξ_νξ^αh_αμ + ξ_μξ_νh), kills every pure-
// gauge h = ξX + Xξ, so the equations are not hyperbolic as they stand. With
// Γ^λ = g^αβΓ^λ_αβ = −□x^λ, R_μν = −½g^αβ∂α∂βg_μν + ½(∂μΓν + ∂νΓμ) + F(g, ∂g);
// harmonic coordinates (Γ^λ = 0) leave quasilinear wave equations
// (Choquet-Bruhat 1952), and Γ^λ itself then obeys a homogeneous wave equation,
// so the constraints propagate. Toys: weak hyperbolicity (Jordan block,
// ‖e^{ikAt}‖ = (kt + √(k²t² + 4))/2), the FLRW toy's Ċ = 2(λ − 1)HC (relative
// violation ∝ a^{2λ+1} in a matter era), Maxwell's ∂_t(∇·E − ρ/ε₀) =
// −(∂_tρ + ∇·J)/ε₀; harmonic coordinates of Schwarzschild, t and (r − M)n^i
// (code exercise). All checked with SymPy (scratch v29.py, v29b.py). Avoids
// gr.S29.i (Gauss as a constraint, 12 − 4 − 4, excess radius, instantaneous
// Newton, exact constraint preservation, the λ drift graph, f⁴ cost, comparing
// gauges, ⁽³⁾R numbers, “plug in T”, incompressible CFD).
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { sci, round, grid4 } from './_derivlate.js';

const t = String.raw;

// ── pictures ────────────────────────────────────────────────────────────────

// growth of a Fourier mode for three toy systems u_t = A u_x (log-log)
const growthParams = (withSlider) => ({
  x: [0, 3], y: [-0.3, 4.2], xlabel: 'log₁₀ of the wavenumber k', ylabel: 'log₁₀ of the growth factor',
  ...(withSlider ? {
    sliders: [{ key: 'T', label: 'Time $t$', min: 0.1, max: 2, step: 0.01, value: 1, explain: 'How long the mode has evolved, in the units of the toy system.' }],
    readouts: [
      { label: 'weakly hyperbolic: growth at $k = 1000$', expr: '(1000*T + sqrt(10^6*T^2 + 4))/2', digits: 4 },
      { label: 'strongly hyperbolic: growth at every $k$', expr: '1', digits: 1 },
    ],
  } : { constants: { T: 1 } }),
  curves: [
    { fn: '0', color: 'gold', width: 2.6, label: 'strongly hyperbolic: no growth', labelAt: 1.6, labelDy: -12 },
    { fn: 'log10((10^x*T + sqrt(10^(2*x)*T^2 + 4))/2)', color: 'violet', width: 2.6, label: 'weakly hyperbolic: grows like kt', labelAt: 1.5, labelDx: 10, labelDy: 10 },
    { fn: '10^x*T*0.4343', domain: [0, 'log10(9.6/T)'], color: 'bad', width: 2.2, dash: true },
  ],
  points: [{ x: 1.25, y: 3.85, r: 0.01, color: 'bad', label: 'red dashed: elliptic, grows like exp(kt)', labelDx: 0, labelDy: 0 }],
});

// domain of influence: hyperbolic (inside a cone) against elliptic (the whole slice at once)
const influence = {
  type: 'graph',
  params: {
    x: [-4.2, 4.2], y: [-0.7, 3.2], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: '3', lower: 'abs(x)', from: -3, to: 3, color: 'gold', alpha: 0.16 }],
    curves: [
      { fn: 'abs(x)', domain: [-3, 3], color: 'gold', width: 2.2 },
      { fn: '0', domain: [-4.1, 4.1], color: 'bad', width: 2.4, dash: true },
    ],
    points: [
      { x: 0, y: 0, color: 'accent2', r: 6, label: 'a disturbance', labelDx: 10, labelDy: 20 },
      { x: -1.45, y: 2.7, r: 0.01, color: 'gold', label: 'wave equation: felt only inside the cone', labelDx: 0, labelDy: 0 },
      { x: -4.05, y: -0.4, r: 0.01, color: 'bad', label: 'Poisson: felt on the whole slice at once', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'Time up, space across, light at 45°. For a wave equation a disturbance is felt only inside its future light cone (gold); for Poisson’s equation it is felt everywhere on its own slice of time (red dashed), at the same instant.',
};

// Einstein's ten equations as a table of G^μν
const gCells = [['G⁰⁰', 'G⁰¹', 'G⁰²', 'G⁰³'], ['G¹⁰', 'G¹¹', 'G¹²', 'G¹³'], ['G²⁰', 'G²¹', 'G²²', 'G²³'], ['G³⁰', 'G³¹', 'G³²', 'G³³']];
const gTable = grid4(gCells, { rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'], caption: 'The ten independent components of the Einstein tensor (the table is symmetric). Which of them can say nothing about how a slice changes?' });

// charge leaving a region through a closed surface: the source of a Gauss's-law violation
const chargeFlow = {
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.6, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ polar: '1.15 + 0.18sin(3theta)', theta: [0, 6.2832], color: 'ink3', width: 2, dash: true }],
    arrows: [0.3, 1.9, 3.5, 5.1].map((a) => ({ from: [round(0.55 * Math.cos(a), 4), round(0.55 * Math.sin(a), 4)], to: [round(1.85 * Math.cos(a), 4), round(1.85 * Math.sin(a), 4)], color: 'accent' })),
    points: [{ x: 0, y: 0, color: 'bad', r: 7, label: 'charge', labelDx: -24, labelDy: 18 }, { x: 1.35, y: 1.25, r: 0.01, color: 'accent', label: 'current J', labelDx: 0, labelDy: 0 }],
  },
  caption: 'Current carrying charge out through a closed surface (dashed). If charge could vanish without crossing the surface, Gauss’s law would stop holding inside.',
};

// two coordinate grids on the same points: what a pure-gauge mode is
const twoGrids = {
  type: 'graph',
  params: {
    x: [-3.3, 3.3], y: [-1.9, 1.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      ...[-3, -2, -1, 0, 1, 2, 3].map((k) => ({ param: [`${k}`, 't'], t: [-1.7, 1.7], color: 'ink4', width: 1.1 })),
      ...[-1.5, -0.75, 0, 0.75, 1.5].map((k) => ({ param: ['t', `${k}`], t: [-3.1, 3.1], color: 'ink4', width: 1.1 })),
      ...[-3, -2, -1, 0, 1, 2, 3].map((k) => ({ param: [`${k} + 0.28*sin(1.7*t + ${k})`, 't'], t: [-1.7, 1.7], color: 'violet', width: 1.5, dash: true })),
      ...[-1.5, -0.75, 0, 0.75, 1.5].map((k) => ({ param: ['t', `${k} + 0.2*sin(1.3*t - ${k})`], t: [-3.1, 3.1], color: 'violet', width: 1.5, dash: true })),
    ],
    points: [[-2.2, 0.9], [-0.7, -0.4], [0.9, 1.1], [2.1, -0.9], [0.2, 0.3], [-1.6, -1.2], [1.6, 0.2]].map(([x, y]) => ({ x, y, color: 'gold', r: 5 })),
  },
  caption: 'The same events (gold) labelled by two coordinate grids (grey and violet). The metric’s components differ between the grids; every distance and time between the events is the same. Equations that cannot tell the grids apart cannot fix the labels.',
};

// the Jordan block
const jordan = grid4([['1', '1'], ['0', '1']], {
  rowLabels: null, colLabels: null, left: 'A =', w: 1.1, h: 0.62,
  caption: t`A matrix with one repeated eigenvalue but only one eigenvector (a Jordan block): its system $u_t = A\,u_x$ is hyperbolic only weakly.`,
});

// relative constraint violation against the scale factor, for λ = 0 only (log–log)
const violation = {
  type: 'graph',
  params: {
    x: [0, 1.05], y: [-0.2, 1.4], xlabel: 'log₁₀ of the scale factor a (from 1 to 10)', ylabel: 'log₁₀ of the relative violation',
    curves: [{ fn: 'x', domain: [0, 1], color: 'violet', width: 2.6, label: 'λ = 0: grows like a', labelAt: 0.5, labelDx: -12, labelDy: -12, labelAlign: 'right' }],
  },
  caption: 'The toy universe of step 29’s Intuition lesson, during a matter era: with λ = 0 the relative violation C/H² grows in proportion to a — fake curvature, growing just as real curvature would. Other values of λ change the slope.',
};

// harmonic radius against areal radius for Schwarzschild
const harmonicRadius = {
  type: 'graph',
  params: {
    x: [0, 6], y: [0, 5.5], xlabel: 'areal radius r (units of M)', ylabel: 'harmonic radius (units of M)',
    curves: [
      { fn: 'x - 1', domain: [2, 6], color: 'accent', width: 2.6, label: 'r − M', labelAt: 4.2, labelDx: 12, labelDy: 18 },
      { fn: 'x', domain: [0, 6], color: 'ink3', width: 1.2, dash: true, label: 'flat space: r', labelAt: 4.6, labelDx: -96, labelDy: -6 },
    ],
    vlines: [{ x: 2, label: 'horizon, r = 2M', color: 'bad' }],
  },
  caption: 'The harmonic coordinates of the Schwarzschild spacetime use the radius r − M (blue), not the areal radius r: the horizon sits at harmonic radius M. Coordinates differ; the spacetime does not.',
};

// a 1D grid with a signal that may cross at most one cell per step (Courant)
const cells = {
  type: 'graph',
  params: {
    x: [-0.3, 8.3], y: [-0.9, 1.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => ({ param: [`${k}`, 't'], t: [0, 1], color: 'ink3', width: 1.4 })), { param: ['8t', '0'], t: [0, 1], color: 'ink3', width: 1.4 }, { param: ['8t', '1'], t: [0, 1], color: 'ink3', width: 1.4 }],
    arrows: [{ from: [3.5, 0.5], to: [4.5, 0.5], color: 'bad' }],
    points: [
      { x: 2.4, y: 1.35, r: 0.01, color: 'bad', label: 'the fastest signal: at most one cell per step', labelDx: 0, labelDy: 0 },
      { x: 0, y: -0.45, r: 0.01, color: 'ink2', label: 'cells of width Δx along the nozzle (schematic)', labelDx: 0, labelDy: 0 },
    ],
  },
  caption: 'An explicit code updates each cell from its neighbours. If the fastest signal crossed more than one cell per time step, the update could not “see” where it came from, and the scheme blows up (the Courant condition).',
};

const CODE_START = t`import sympy as sp

t, r, th, ph, M = sp.symbols('t r theta phi M', positive=True)
X = [t, r, th, ph]
f = 1 - 2*M/r
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)     # Schwarzschild, G = c = 1
ginv = g.inv()
sqrtg = r**2*sp.sin(th)                             # sqrt(-det g)

def box(F):
    """(1/sqrt(-g)) d_m (sqrt(-g) g^mn d_n F) for this diagonal metric."""
    return 0   # replace with the sum over m

print('box t =', sp.simplify(box(t)))
print('box (r - M) sin(theta) cos(phi) =', sp.simplify(box((r - M)*sp.sin(th)*sp.cos(ph))))
print('box r sin(theta) cos(phi) =', sp.simplify(box(r*sp.sin(th)*sp.cos(ph))))
`;
const CODE_ANSWER = CODE_START.replace('    return 0   # replace with the sum over m', '    return sum(sp.diff(sqrtg*ginv[m, m]*sp.diff(F, X[m]), X[m]) for m in range(4))/sqrtg');

export default lesson({
  id: 'gr.S29.d',
  title: 'Hyperbolicity, gauge and well-posedness',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Einstein's equations are ten second-order equations for the ten components of $g_{\mu\nu}$. For a wave equation, the field and its rate of change on one slice fix the future. Here they do not, for two reasons. The contracted Bianchi identity makes the four equations $G^{0\nu}$ free of second time derivatives: they are **constraints** on each slice, not laws of change. And any relabelling of coordinates maps solutions to solutions, so the equations cannot fix all ten components: four **gauge** functions are free, and as they stand the equations are **not hyperbolic**.

Choose **harmonic coordinates**, $\Box x^\lambda = 0$ — equivalently $\Gamma^\lambda = 0$ in the identity above — and every component obeys a wave equation whose signals follow the metric's own light cones. Yvonne Choquet-Bruhat proved in 1952 that this system is **well-posed**: smooth data satisfying the constraints have a unique solution that depends continuously on them, and the constraints then hold for ever.`,
  equation: t`R_{\mu\nu} = -\tfrac12\,g^{\alpha\beta}\partial_\alpha\partial_\beta\,g_{\mu\nu} + \tfrac12\left(\partial_\mu\Gamma_\nu + \partial_\nu\Gamma_\mu\right) + F_{\mu\nu}(g, \partial g), \qquad \Gamma^\lambda \equiv g^{\alpha\beta}\Gamma^\lambda{}_{\alpha\beta} = -\Box x^\lambda`,
  symbols: [
    { tex: 'R_{\\mu\\nu}', text: t`the Ricci tensor (step 15), written out in terms of the metric` },
    { tex: 'g^{\\alpha\\beta}\\partial_\\alpha\\partial_\\beta', text: t`the **principal part**: the terms with the most derivatives. Here a wave operator built from the metric itself, so signals follow its light cones` },
    { tex: '\\Gamma^\\lambda', text: t`the contracted Christoffel symbols, $g^{\alpha\beta}\Gamma^\lambda{}_{\alpha\beta}$; $\Gamma_\nu = g_{\nu\lambda}\Gamma^\lambda$. Harmonic coordinates are those with $\Gamma^\lambda = 0$` },
    { tex: '\\Box x^\\lambda', text: t`the curved wave operator $\frac{1}{\sqrt{-g}}\partial_\mu\left(\sqrt{-g}\,g^{\mu\nu}\partial_\nu\right)$ acting on each coordinate, treated as a function; $\Box x^\lambda = 0$ makes every coordinate a solution of the wave equation` },
    { tex: 'F_{\\mu\\nu}(g, \\partial g)', text: t`everything else: products of first derivatives of the metric. Lower order, so it cannot spoil hyperbolicity` },
  ],
  why: 'Well-posedness is what makes general relativity a predictive theory — data now determine the future, stably — and finding a formulation that keeps it on a computer is what held up the first black-hole mergers until 2005 (step 32).',
  visual: {
    type: 'graph',
    title: 'What ill-posed means',
    lead: t`Three toy systems $u_t = A\,u_x$, each with a wave $e^{ikx}$ of wavenumber $k$ as its starting data. Their growth factor after time $t$, on logarithmic axes: **strongly hyperbolic** ($A$ diagonalizable, real eigenvalues), **weakly hyperbolic** ($A$ a Jordan block: real eigenvalues, too few eigenvectors), and **elliptic** (complex eigenvalues).`,
    tasks: [
      'Slide the time: the weak system’s growth rises in proportion to kt. No bound K·exp(αt) holds for all k at once — that is what ill-posed means.',
      'On a grid the largest k is about π/Δx, so halving the cells doubles the worst growth: refining a weakly hyperbolic code makes it worse.',
      'The elliptic system’s growth exp(kt) leaves the chart at once — Hadamard’s example, the backward heat equation’s cousin.',
    ],
    params: growthParams(true),
    caption: 'Toy systems, not Einstein’s equations. As usually written, the ADM form of Einstein’s equations is only weakly hyperbolic; the BSSN and generalized-harmonic forms used since 2005 are strongly hyperbolic with suitable gauges (Sarbach & Tiglio 2012).',
  },
  example: {
    prompt: t`Show that Einstein's equations hold four constraints, that they are not hyperbolic as they stand, and that harmonic coordinates make them a system of wave equations whose constraints are preserved.`,
    visual: gTable,
    steps: [
      { label: 'Four constraints', text: t`The contracted Bianchi identity holds for every metric: $\nabla_\mu G^{\mu\nu} = 0$, that is $\partial_0G^{0\nu} = -\partial_iG^{i\nu} - (\Gamma G\text{ terms})$. The right side has at most second time derivatives, because $G$ does. So $G^{0\nu}$ itself has at most **first** time derivatives: four equations that only constrain each slice. Ten equations, four constraints, six evolution equations — for ten unknowns.` },
      { label: 'Not hyperbolic', text: t`Replace every second derivative $\partial_\alpha\partial_\beta$ by $-\xi_\alpha\xi_\beta$ (a short wave $e^{i\xi\cdot x}$). The Ricci operator becomes $\tfrac12\left(\xi^2h_{\mu\nu} - \xi_\mu\xi^\alpha h_{\alpha\nu} - \xi_\nu\xi^\alpha h_{\alpha\mu} + \xi_\mu\xi_\nu h\right)$ acting on a perturbation $h$. For $h_{\mu\nu} = \xi_\mu X_\nu + \xi_\nu X_\mu$ it gives **zero**, for every $\xi$ — these are pure-gauge modes (step 28). The equations cannot determine them, so they are not hyperbolic.` },
      { label: 'Fix the gauge', text: t`Write $R_{\mu\nu}$ as in the identity above. Its second derivatives sit in two places: $-\tfrac12g^{\alpha\beta}\partial_\alpha\partial_\beta g_{\mu\nu}$, and inside $\partial_\mu\Gamma_\nu + \partial_\nu\Gamma_\mu$. Choose coordinates with $\Gamma^\lambda = -\Box x^\lambda = 0$ and the second kind is gone.` },
      { label: 'Wave equations', text: t`What is left is the **reduced** system $g^{\alpha\beta}\partial_\alpha\partial_\beta g_{\mu\nu} = 2F_{\mu\nu} - \frac{16\pi G}{c^4}\left(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}\right)$: ten quasilinear wave equations, one per component. Their principal symbol is $-g^{\alpha\beta}\xi_\alpha\xi_\beta$, zero only on the light cone — hyperbolic. Fourès-Bruhat (later Choquet-Bruhat) proved in 1952 that smooth data give a unique local solution, depending continuously on the data.` },
      { label: 'Constraints ride along', text: t`The reduced equations are not Einstein's unless $\Gamma^\lambda = 0$ holds everywhere. Apply the Bianchi identity to them: $\Gamma^\lambda$ obeys a homogeneous wave equation, $g^{\alpha\beta}\partial_\alpha\partial_\beta\Gamma^\lambda + (\text{terms linear in }\Gamma, \partial\Gamma) = 0$. Start with $\Gamma^\lambda = 0$ and $\partial_t\Gamma^\lambda = 0$ — the second holds exactly when the four constraints do — and $\Gamma^\lambda$ stays zero: the solution solves the full equations.` },
      { label: 'Sense check', text: t`For weak fields, $\Gamma^\lambda = \partial_\beta\bar h^{\lambda\beta}$, so the harmonic condition is the Lorenz gauge of step 28, and the reduced equations become $\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}$. Newton's $\nabla^2\Phi = 4\pi G\rho$, by contrast, is elliptic — no evolution at all, which is why it acts instantly.` },
    ],
    answer: t`$G^{0\nu}$ are four constraints; pure-gauge modes make the full system non-hyperbolic; with $\Gamma^\lambda = -\Box x^\lambda = 0$ the equations become $g^{\alpha\beta}\partial_\alpha\partial_\beta g_{\mu\nu} = (\text{lower order})$ — well-posed — and $\Gamma^\lambda$ obeys a wave equation, so constraint-satisfying data stay on Einstein's solutions.`,
  },
  practice: [
    mcq({
      id: 'classify', difficulty: 1,
      prompt: t`Newton's gravity obeys $\nabla^2\Phi = 4\pi G\rho$. Weak-field relativity in harmonic gauge obeys $\Box\bar h_{\mu\nu} = -\frac{16\pi G}{c^4}T_{\mu\nu}$. What type of equation is each, and what does that mean for how a change spreads?`,
      visual: influence,
      choices: [
        'Newton’s is elliptic: a change is felt everywhere on the slice at once. Einstein’s is hyperbolic: a change spreads inside light cones, at c',
        'Both are hyperbolic: gravity travels at c in both theories',
        'Newton’s is parabolic, like the heat equation: a change spreads diffusively',
        'Einstein’s is elliptic, because it is a statement about curvature at each moment',
      ],
      answer: 0,
      why: {
        1: t`$\nabla^2\Phi = 4\pi G\rho$ has no time derivatives at all: $\Phi$ at every point follows from $\rho$ everywhere at the same moment. Nothing propagates.`,
        2: t`A parabolic equation has a first time derivative, like $\partial_tT = D\nabla^2T$. Poisson's equation has none.`,
        3: t`The $-\partial_t^2/c^2$ in $\Box$ makes it a wave operator. Only its four constraint equations are elliptic.`,
      },
      hints: [t`Look for time derivatives: $\nabla^2$ has none; $\Box = -\partial_t^2/c^2 + \nabla^2$ has two, with the opposite sign to the space ones.`],
      teach: 'Elliptic equations act instantly over a whole slice; hyperbolic ones carry changes at a finite speed inside cones — gravity, in harmonic gauge, is hyperbolic with speed c.',
      explain: t`A second-order operator with signs $(-,+,+,+)$ is hyperbolic: its characteristics are light cones. Poisson's operator has signs $(+,+,+)$ in space and no time part: elliptic. In general relativity only the four constraints have that elliptic character; the rest evolves at $c$.`,
    }),
    mcq({
      id: 'constraint-components', difficulty: 2,
      prompt: t`Which of Einstein's ten equations contain no second time derivatives of the metric, in any coordinates?`,
      visual: gTable,
      choices: [
        t`The four $G^{0\nu}$, because $\partial_0G^{0\nu} = -\partial_iG^{i\nu} - (\Gamma G)$ by the Bianchi identity`,
        t`The six space–space equations $G^{ij}$`,
        t`Only $G^{00}$, the energy equation`,
        t`None: every component has second time derivatives, since $R_{\mu\nu}$ has`,
      ],
      answer: 0,
      why: {
        1: t`Those are the evolution equations: they contain $\partial_t^2g_{ij}$.`,
        2: t`$G^{00}$ is one constraint, but the three momentum equations $G^{0i}$ are constraints too: the Bianchi identity argument works for every $\nu$.`,
        3: t`$R_{\mu\nu}$ has them, but in $G^{0\nu}$ they cancel against the $-\tfrac12 Rg^{0\nu}$ part — the Bianchi identity guarantees it.`,
      },
      hints: [t`If $\partial_0 G^{0\nu}$ equals a combination of terms with at most second time derivatives, how many can $G^{0\nu}$ itself contain?`],
      teach: t`The Bianchi identity forces the four $G^{0\nu}$ to be first order in time: they are the Hamiltonian and momentum constraints.`,
      explain: t`$\nabla_\mu G^{\mu\nu} = 0$ for every metric gives $\partial_0G^{0\nu} = -\partial_iG^{i\nu} - \Gamma G$, whose right side has at most second time derivatives. If $G^{0\nu}$ had a $\partial_0^2g$, its time derivative would have a $\partial_0^3g$ with nothing to cancel it. So the four $G^{0\nu}$ are constraints; the six $G^{ij}$ evolve.`,
    }),
    mcq({
      id: 'maxwell', difficulty: 2,
      prompt: t`Electromagnetism has a constraint too. Take the time derivative of Gauss's law's residual, $\mathcal C = \nabla\cdot\mathbf E - \rho/\varepsilon_0$, using the Ampère–Maxwell law $\partial_t\mathbf E = c^2\nabla\times\mathbf B - \mathbf J/\varepsilon_0$. What do you get?`,
      visual: chargeFlow,
      choices: [
        t`$\partial_t\mathcal C = -\left(\partial_t\rho + \nabla\cdot\mathbf J\right)/\varepsilon_0$: zero exactly when charge is conserved`,
        t`$\partial_t\mathcal C = c^2\,\nabla\cdot(\nabla\times\mathbf B)$, which can have either sign`,
        t`$\partial_t\mathcal C = 0$ whatever the charges do`,
        t`$\partial_t\mathcal C = -\partial_t\rho/\varepsilon_0$: the constraint drifts whenever charge moves`,
      ],
      answer: 0,
      why: {
        1: t`The divergence of a curl is identically zero: $\nabla\cdot(\nabla\times\mathbf B) = 0$, so that term vanishes.`,
        2: t`Only if $\partial_t\rho + \nabla\cdot\mathbf J = 0$. Charge that vanished without crossing a surface would break Gauss's law.`,
        3: t`You dropped the $-\nabla\cdot\mathbf J/\varepsilon_0$ from the Ampère–Maxwell law; moving charge carries its field with it.`,
      },
      hints: [t`$\partial_t(\nabla\cdot\mathbf E) = \nabla\cdot(\partial_t\mathbf E)$; substitute the Ampère–Maxwell law.`, t`$\nabla\cdot(\nabla\times\mathbf B) = 0$.`],
      teach: 'Constraints survive evolution when the source is conserved: charge conservation for Gauss’s law, ∇·T = 0 with the Bianchi identity for Einstein’s.',
      explain: t`$\partial_t(\nabla\cdot\mathbf E) = c^2\nabla\cdot(\nabla\times\mathbf B) - \nabla\cdot\mathbf J/\varepsilon_0 = -\nabla\cdot\mathbf J/\varepsilon_0$, so $\partial_t\mathcal C = -(\partial_t\rho + \nabla\cdot\mathbf J)/\varepsilon_0 = 0$. In general relativity the Bianchi identity plays the role of $\nabla\cdot\nabla\times = 0$, and $\nabla_\mu T^{\mu\nu} = 0$ the role of charge conservation.`,
    }),
    mcq({
      id: 'pure-gauge-symbol', difficulty: 3,
      prompt: t`For short waves $h_{\mu\nu}e^{i\xi\cdot x}$, the Ricci operator becomes $\tfrac12\left(\xi^2h_{\mu\nu} - \xi_\mu\xi^\alpha h_{\alpha\nu} - \xi_\nu\xi^\alpha h_{\alpha\mu} + \xi_\mu\xi_\nu h\right)$, and it gives zero for every $h_{\mu\nu} = \xi_\mu X_\nu + \xi_\nu X_\mu$, whatever $\xi$. What does that mean?`,
      visual: twoGrids,
      choices: [
        'The equations cannot determine those components: they are coordinate relabellings, so the system is not hyperbolic until a gauge condition fixes them',
        'Einstein’s equations have no solutions at all for short waves',
        'Gravitational waves of every wavelength are pure gauge, and so unphysical',
        'The metric is physically undetermined: the future is not predicted by general relativity',
      ],
      answer: 0,
      why: {
        1: 'Solutions exist; there are too many of them, all related by relabelling coordinates.',
        2: t`Only the modes of the form $\xi_\mu X_\nu + \xi_\nu X_\mu$ are pure gauge; the transverse–traceless ones are not, and they carry curvature (step 28).`,
        3: 'Everything physical — every measured distance and time — is determined. Only the labels are free.',
      },
      hints: [t`What does $h_{\mu\nu} = \partial_\mu\xi_\nu + \partial_\nu\xi_\mu$ do to spacetime (step 28)? For a short wave, $\partial \to i\xi$.`, t`A hyperbolic system's symbol must be invertible off the light cone. Is it, if it has a zero for every $\xi$?`],
      teach: 'Diffeomorphism invariance makes the symbol of Einstein’s operator degenerate: pure-gauge modes are invisible to it, so a gauge must be chosen before the system is hyperbolic.',
      explain: t`Substituting $h_{\mu\nu} = \xi_\mu X_\nu + \xi_\nu X_\mu$ (trace $h = 2\xi\cdot X$), every term cancels. A symbol with a zero for every $\xi$ cannot be inverted, so the evolution of those components is undetermined — as it must be, since they are coordinate changes. Harmonic gauge turns the symbol into $\tfrac12\xi^2h_{\mu\nu}$, invertible whenever $\xi$ is not null.`,
    }),
    num({
      id: 'jordan-growth', difficulty: 2,
      gen(r) {
        const k = r.pick([20, 50, 200]), T = r.pick([0.5, 1, 2]);
        const g = (k * T + Math.sqrt(k * k * T * T + 4)) / 2;
        return {
          prompt: t`For the weakly hyperbolic toy $u_t = A\,u_x$ with $A = \begin{pmatrix}1 & 1\\ 0 & 1\end{pmatrix}$, a mode $e^{ikx}$ is multiplied by $e^{ikAt}$, whose size (largest singular value) is $\dfrac{kt + \sqrt{k^2t^2 + 4}}{2}$. By what factor can such a mode grow with $k = ${k}$ at $t = ${T}$?`,
          answer: g, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`That is a diagonalizable $A$'s answer. A Jordan block's $e^{ikAt} = e^{ikt}(I + iktN)$ has a part that grows like $kt$.` }],
          hints: [t`$kt = ${k * T}$; compute $\sqrt{(kt)^2 + 4}$.`],
          teach: 'A weakly hyperbolic system amplifies a mode of wavenumber k by about kt — unbounded as k grows, so the problem is ill-posed.',
          explain: t`$(${k * T} + \sqrt{${k * k * T * T} + 4})/2 = ${sci(g, 4)}$: about $kt$. A ten-times-finer grid admits ten-times-larger $k$ and ten times the growth — which is why weak hyperbolicity is fatal for a code that must converge.`,
          visual: jordan,
        };
      },
    }),
    num({
      id: 'violation-growth', difficulty: 3,
      gen(r) {
        const lam = r.pick([2, -2, 1, -1]), f = r.pick([2, 10]);
        const x = f ** (2 * lam + 1);
        return {
          prompt: t`In the toy universe of dust, with $H = \dot a/a$ and $q = 8\pi G\rho/3$, a code steps $\dot H = -H^2 - \tfrac12q + \lambda\,C$ and $\dot q = -3Hq$, where $C = H^2 - q$ is the energy constraint. Then $\dot C = 2(\lambda - 1)HC$, so $C \propto a^{2(\lambda - 1)}$, while $H^2 \propto a^{-3}$. With $\lambda = ${lam}$, by what factor does the relative violation $C/H^2$ change while the universe grows ${f}-fold?`,
          answer: x, tol: { rel: 0.005 },
          errors: [{ value: f ** (2 * (lam - 1)), feedback: t`That is $C$ alone. The relative violation divides by $H^2 \propto a^{-3}$, adding 3 to the exponent.` }, ...(lam !== -1 ? [{ value: f ** (2 * lam - 1), feedback: t`Dividing by $H^2 \propto a^{-3}$ multiplies by $a^{+3}$: the exponent is $2(\lambda - 1) + 3 = 2\lambda + 1$.` }] : [])],
          hints: [t`$\dot C = 2H\dot H - \dot q$; substitute both equations and collect $C = H^2 - q$.`, t`$C \propto a^{2(\lambda - 1)}$ and $C/H^2 \propto a^{2(\lambda - 1) + 3} = a^{2\lambda + 1}$.`],
          teach: 'Adding multiples of the constraints changes how a violation evolves: here the relative violation scales as a^(2λ+1), growing for λ > −½ and decaying below.',
          explain: t`$C/H^2 \propto a^{2\lambda + 1} = a^{${2 * lam + 1}}$, so a ${f}-fold expansion changes it by $${f}^{${2 * lam + 1}} = ${sci(x, 3)}$. Every $\lambda$ has the same exact solutions — $C = 0$ stays $0$ — but a computer is never exactly on them, and the sign of $2\lambda + 1$ decides whether its errors grow or die.`,
          visual: violation,
        };
      },
    }),
    order({
      id: 'proof-order', difficulty: 2,
      prompt: 'Put the steps of the harmonic-gauge argument for well-posedness in order.',
      items: [
        t`Choose data on a slice that satisfy the four constraints, with $\Gamma^\lambda = 0$ there`,
        t`Solve the reduced equations $g^{\alpha\beta}\partial_\alpha\partial_\beta g_{\mu\nu} = (\text{lower order})$, which are wave equations`,
        t`Use the Bianchi identity to show that $\Gamma^\lambda$ obeys a homogeneous wave equation`,
        t`Since $\Gamma^\lambda$ and $\partial_t\Gamma^\lambda$ vanish at the start (the constraints), $\Gamma^\lambda = 0$ always: the solution solves Einstein's equations`,
      ],
      hints: ['Data first, then evolution, then the check that the gauge condition — and so the full equations — survive.', 'The constraints are what make the starting rate of change of the gauge condition zero.'],
      teach: 'Well-posedness is proved by solving a gauge-fixed (reduced) system and then showing the gauge condition propagates, so the reduced solution is a true one.',
      explain: t`Constraint-satisfying data, a hyperbolic reduced system, and a wave equation for $\Gamma^\lambda$ with zero data: the four steps of the Choquet-Bruhat argument. Numerical codes copy its structure — and generalized-harmonic codes, like Pretorius's in 2005, add damping terms so that numerical violations of $\Gamma^\lambda = 0$ decay.`,
    }),
    code({
      id: 'sympy-harmonic', difficulty: 3,
      prompt: t`Which coordinates of the Schwarzschild spacetime are harmonic? Complete \`box(F)\` so it returns the wave operator of a function,
$$\Box F = \frac{1}{\sqrt{-g}}\,\partial_\mu\!\left(\sqrt{-g}\,g^{\mu\nu}\partial_\nu F\right),$$
summed over $\mu = 0\ldots3$ (the metric is diagonal, so only $\nu = \mu$ contributes). Here $\sqrt{-g} = r^2\sin\theta$, \`ginv[m, m]\` is $g^{\mu\mu}$ and \`X[m]\` the coordinate $x^\mu$. The program then tests $t$, $(r - M)\sin\theta\cos\phi$ and $r\sin\theta\cos\phi$.`,
      starter: CODE_START,
      answer: CODE_ANSWER,
      tests: [
        { name: t`$\Box r = 2(r - M)/r^2$`, code: 'sp.simplify(box(r) - 2*(r - M)/r**2) == 0' },
        { name: t`$t$ is harmonic: $\Box t = 0$`, code: 'sp.simplify(box(t)) == 0' },
        { name: t`$(r - M)\sin\theta\cos\phi$ is harmonic`, code: 'sp.simplify(box((r - M)*sp.sin(th)*sp.cos(ph))) == 0' },
        { name: t`$r\sin\theta\cos\phi$ is not: $\Box = -2M\sin\theta\cos\phi/r^2$`, code: 'sp.simplify(box(r*sp.sin(th)*sp.cos(ph)) + 2*M*sp.sin(th)*sp.cos(ph)/r**2) == 0' },
      ],
      hints: ['Sum over m: `sp.diff(sqrtg*ginv[m, m]*sp.diff(F, X[m]), X[m])`, then divide by `sqrtg`.', 'One line: `return sum(sp.diff(sqrtg*ginv[m, m]*sp.diff(F, X[m]), X[m]) for m in range(4))/sqrtg`.'],
      teach: t`Harmonic coordinates are four solutions of the curved wave equation; for Schwarzschild they are $t$ and $(r - M)$ times the direction cosines.`,
      explain: t`$\Box t = 0$ because nothing depends on $t$. For $(r - M)n^i$ the radial part gives $2(r - M)/r^2$ times $n^i$ and the angular part $-2(r - M)n^i/r^2$ — they cancel. With $r$ instead of $r - M$ they miss by $-2Mn^i/r^2$. So in harmonic coordinates the horizon sits at radius $M$: the coordinates of post-Newtonian theory, and of the codes that compute mergers.`,
      visual: harmonicRadius,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-courant', difficulty: 2, transfer: true,
      gen(r) {
        const dx = r.pick([0.5, 1, 2]), u = r.pick([2500, 3000]), a = r.pick([900, 1100]);
        const dt = (dx * 1e-3) / (u + a);
        return {
          prompt: t`The compressible flow equations of a rocket nozzle are hyperbolic too: signals travel at the flow speed plus the speed of sound. An explicit code with cells ${dx} mm long must keep each time step below $\Delta x/(|u| + a)$ (the Courant condition). With exhaust speed $u = ${u}$ m/s and sound speed $a = ${a}$ m/s, what is the longest stable time step?`,
          answer: dt, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (dx * 1e-3) / u, feedback: 'Add the speed of sound: signals ride the flow and travel through it.' }, { value: (dx * 1e-3) / a, feedback: 'The flow carries the sound waves along: the fastest signal moves at u + a.' }],
          hints: [t`$\Delta x = ${dx}\times10^{-3}$ m; divide by $u + a = ${u + a}$ m/s.`],
          teach: 'Hyperbolic systems carry signals at finite speeds, and explicit codes must take time steps short enough that no signal skips a cell — in gravity codes the speed is c.',
          explain: t`$\Delta t \le ${sci(dx * 1e-3)}/${u + a} = ${sci(dt)}$ s. Numerical relativity obeys the same rule with $c$ as the speed: a grid spacing of a hundredth of a black hole's $GM/c^2$ forces time steps of about that size divided by $c$.`,
          visual: cells,
        };
      },
    }),
    mcq({
      id: 'cp-not-enough', difficulty: 3,
      prompt: 'A group writes Einstein’s equations in a strongly hyperbolic, well-posed form and evolves two black holes. The code still crashes. Which explanation is consistent with what well-posedness does and does not promise?',
      choices: [
        'Well-posedness only bounds how errors grow over a finite time, by K·exp(αt); constraint-violating modes can still grow exponentially, the gauge can drive slices into the singularity, and boundaries and lower-order terms matter',
        'A well-posed system can never produce growing errors, so the code must contain a programming bug',
        'Strong hyperbolicity guarantees stability for all time, so the crash must come from the hardware',
        'Well-posedness is about existence only; it says nothing about how solutions depend on the data',
      ],
      answer: 0,
      why: {
        1: 'Exponential growth at a bounded rate is allowed by well-posedness: a constraint violation that doubles every orbit is “well-posed” and still fatal.',
        2: 'It promises a bound K·exp(αt) over a finite time, not stability for ever; long evolutions also need constraint damping and good gauges.',
        3: 'Continuous dependence on the data is the heart of well-posedness — the part a weakly hyperbolic system fails.',
      },
      hints: ['Write down the definition: a bound on the solution by K·exp(αt) times the data, for a finite time. What growth does it still allow?', 'Which ingredients did the 2005 codes add besides a hyperbolic formulation?'],
      teach: 'Well-posedness is necessary, not sufficient: stable black-hole codes also needed constraint damping, good gauges and careful treatment of singularities and boundaries.',
      explain: 'A well-posed system controls errors only up to an exponential in time. Pretorius’s 2005 code added constraint damping to a generalized-harmonic system and excised the black holes’ interiors; the moving-puncture codes paired BSSN with gauges that keep slices away from the singularities (step 32).',
    }),
    mcq({
      id: 'cp-gauge-physics', difficulty: 2,
      prompt: 'A simulation in harmonic coordinates and one in other coordinates evolve the same black-hole merger. Does the choice of harmonic coordinates change the predicted gravitational waves?',
      visual: harmonicRadius,
      choices: [
        'No: it fixes the four free coordinate functions, not the physics; measured quantities — the wave at a distant detector, the final mass and spin — are the same',
        'Yes: harmonic coordinates add four extra equations, so they describe a different theory',
        'Yes: in harmonic coordinates gravity travels at c, in others it does not',
        'No, because harmonic coordinates are the only ones Einstein’s equations allow',
      ],
      answer: 0,
      why: {
        1: 'The extra conditions only pick labels. Any solution of Einstein’s equations can be relabelled into harmonic form near any slice, and back.',
        2: 'Signals travel at c along the metric’s light cones in every coordinate system; harmonic coordinates just make that manifest in the equations.',
        3: 'Every relabelling of a solution is again a solution; harmonic coordinates are a convenient choice among infinitely many.',
      },
      hints: ['Recall step 28: what does a change of coordinates do to the Riemann tensor?'],
      teach: 'Gauge choices change how the equations look and how well a computer can solve them, never the physical predictions.',
      explain: t`Choosing $\Gamma^\lambda = 0$ spends the four coordinate freedoms that every solution has. The waveform extracted far away and the final black hole’s mass and spin are coordinate-independent, which is how codes in different gauges are checked against each other.`,
    }),
  ],
  sources: [
    { label: 'Fourès-Bruhat, “Théorème d’existence pour certains systèmes d’équations aux dérivées partielles non linéaires”, Acta Math. 88, 141 (1952)', url: 'https://doi.org/10.1007/BF02392131' },
    { label: 'Wald, General Relativity (1984), ch. 10 (the initial-value formulation)', url: 'https://press.uchicago.edu/ucp/books/book/chicago/G/bo5952261.html' },
    { label: 'Sarbach & Tiglio, “Continuum and discrete initial-boundary value problems and Einstein’s field equations”, Living Rev. Relativ. 15, 9 (2012)', url: 'https://doi.org/10.12942/lrr-2012-9' },
    { label: 'Carroll, Lecture Notes on General Relativity, §4.4 (the equations as differential equations)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
