// Contracting Riemann: the Ricci tensor and the Ricci scalar — Derivation
// Mode. R_σν = R^λ_σλν (Carroll's slots) written out from the Christoffel
// symbols; why it is symmetric (the trace Γ^λ_λσ = ∂_σ ln√|g|); the trace
// R = g^σν R_σν; and what both measure — the trace of geodesic deviation
// (a falling ball's volume) and the area or volume missing from a small ball.
// Worked: the 2-sphere, R_θθ = 1, R_φφ = sin²θ, R = 2/a². Practice: the
// hyperbolic plane, the symmetry, constant curvature in n dimensions, the
// trace for an expanding universe, R_00 = ∇²Φ/c² in weak gravity, the area
// deficit on the Earth. Checkpoint: Feynman's excess radius (transfer), the
// half-plane, the trace of R_μν = Λg_μν. Avoids gr.EQ.5's and gr.S15.i's
// items. Every result verified with SymPy (scratch v15.py).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { rnd, spherePic, halfPlane } from './_tensors.js';
import { table4, lcdm, OM, OL } from './_eq.js';
import { ball, G, C, LAMBDA, sci } from './_curvature.js';

const t = String.raw;
const A_EARTH = 6371;                                            // km

// the Ricci tensor as a symmetric 4 × 4 array: the mirror entries are equal
const ricciArray = table4({
  cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => `R${'₀₁₂₃'[Math.min(i, j)]}${'₀₁₂₃'[Math.max(i, j)]}`)),
  colors: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 'gold' : i < j ? 'accent' : 'ink4'))),
  rowName: 'σ', colName: 'ν', dx: -12,
  caption: t`If $R_{\sigma\nu} = R_{\nu\sigma}$, the entries below the diagonal (faint) repeat those above it (blue): 4 + 6 = 10 independent numbers, where an arbitrary two-index array has 16.`,
});

// meridians leaving the equator side by side and meeting at the pole
const meridianFan = spherePic([
  ...[-0.6, -0.3, 0, 0.3, 0.6].map((p) => ({ param: [`cos(t)*cos(${p})`, `cos(t)*sin(${p})`, 'sin(t)'], t: [0, 1.5708], color: 'gold', width: 2.2 })),
  { param: ['cos(t)', 'sin(t)', '0'], t: [-0.9, 0.9], color: 'ink3', width: 1.4 },
], 'Geodesics (meridians) that leave the equator side by side converge, whichever pair you pick: on a sphere the Ricci tensor is positive in every direction. Drag to rotate.', { yaw: -0.2, pitch: 0.35, dist: 4.2 });

// a circle on a sphere around the pole, with its radius measured along the surface (exaggerated)
const capCircle = (caption) => spherePic([
  { param: [`${rnd(Math.sin(0.75), 5)}*cos(t)`, `${rnd(Math.sin(0.75), 5)}*sin(t)`, `${rnd(Math.cos(0.75), 5)}`], t: [0, 6.2832], color: 'accent', width: 2.4 },
  ...[0, 1.0472, 2.0944, 3.1416, 4.1888, 5.236].map((p) => ({ param: [`sin(t)*cos(${p})`, `sin(t)*sin(${p})`, 'cos(t)'], t: [0, 0.75], color: 'gold', width: 1.8 })),
], caption, { yaw: -0.6, pitch: 0.75, dist: 4.2 });

// the scale factor of our universe (flat, matter + Λ), for the trace of an expanding universe
const scalePlot = {
  type: 'graph',
  params: {
    x: [0, 20], y: [0, 1.75], xlabel: 'time since the Big Bang (Gyr)', ylabel: 'scale factor a',
    curves: [{ fn: lcdm.expr(), domain: [0, 20], color: 'accent' }],
    hlines: [{ y: 1 }],
  },
  caption: t`The scale factor $a(t)$ of a flat universe of matter ($\Omega_m = ${OM}$) and a cosmological constant ($\Omega_\Lambda = ${OL}$), with $a = 1$ today. Space is flat at each moment, but the curve has a slope $\dot a$ and a bend $\ddot a$ — and those are spacetime curvature.`,
};

// de Sitter space: empty but for Λ, expanding by a factor e every 1/H
const H_DS = C * Math.sqrt(LAMBDA / 3), EFOLD_GYR = 1 / H_DS / 3.156e16;
const deSitter = {
  type: 'graph',
  params: {
    x: [0, 40], y: [0, 10], xlabel: 'time (Gyr)', ylabel: 'scale factor a',
    curves: [{ fn: `exp(x/${rnd(EFOLD_GYR, 4)})`, domain: [0, 40], color: 'accent' }],
  },
  caption: t`A universe empty but for the cosmological constant (de Sitter space): it grows by a factor $e$ every $1/H = ${rnd(EFOLD_GYR, 3)}$ Gyr, with $H = c\sqrt{\Lambda/3}$, and looks the same at every event.`,
};

export default lesson({
  id: 'gr.S15.d',
  title: 'Contracting Riemann: Ricci tensor and Ricci scalar',
  minutes: 14, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`The Riemann tensor holds all of curvature; Einstein's equations need less of it. Set its output index equal to the first index of its loop pair and **sum** — a contraction — and what is left is the **Ricci tensor**, $R_{\sigma\nu} = R^\lambda{}_{\sigma\lambda\nu}$. In geodesic deviation it is the trace of the tidal stretching: how a small ball of freely falling particles starts to change **volume**. Contract once more, with the inverse metric, and you have the **Ricci scalar** $R$: one number per event, which says how much area or volume a small ball holds compared with flat space.

Below, both are written out from the Christoffel symbols and computed for a sphere, an expanding universe and weak gravity — where $R_{00}$ turns out to be Newton's $\nabla^2\Phi/c^2$.`,
  equation: t`\begin{gathered} R_{\sigma\nu} = R^\lambda{}_{\sigma\lambda\nu} = \partial_\lambda\Gamma^\lambda{}_{\nu\sigma} - \partial_\nu\Gamma^\lambda{}_{\lambda\sigma} + \Gamma^\lambda{}_{\lambda\kappa}\Gamma^\kappa{}_{\nu\sigma} - \Gamma^\lambda{}_{\nu\kappa}\Gamma^\kappa{}_{\lambda\sigma} \\[4pt] R = g^{\sigma\nu}R_{\sigma\nu} \end{gathered}`,
  symbols: [
    { tex: 'R_{\\sigma\\nu}', text: t`the Ricci tensor, in m⁻²: $\sigma$ and $\nu$ are its two free indices, each $0$–$3$ in spacetime. It is symmetric, so it has 10 independent components` },
    { tex: 'R^\\lambda{}_{\\sigma\\lambda\\nu}', text: t`the Riemann tensor $R^\rho{}_{\sigma\mu\nu}$ with its output index $\rho$ set equal to its first loop index $\mu$ — both renamed $\lambda$ — and summed. Which slots to contract is a convention; this is Carroll's` },
    { tex: '\\lambda,\\ \\kappa', text: t`dummy indices: each appears once up and once down and is summed over every coordinate` },
    { tex: '\\Gamma^\\lambda{}_{\\lambda\\sigma}', text: t`the trace of the Christoffel symbols, equal to $\partial_\sigma\ln\sqrt{|g|}$ with $g = \det g_{\mu\nu}$ (step 11)` },
    { tex: 'R', text: t`the Ricci scalar, in m⁻²: one number per event, the same in every coordinate system` },
    { tex: 'g^{\\sigma\\nu}', text: t`the inverse metric: pairing both indices with it and summing is what "taking the trace" means for a tensor` },
  ],
  why: t`The left side of Einstein's equation is built from exactly these two objects, $R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}$ (step 17). And in weak gravity $R_{00} = \nabla^2\Phi/c^2$: that is the road back to Newton (step 19).`,
  visual: {
    type: 'gr-dustball',
    title: 'The trace of the tides',
    lead: t`Geodesic deviation accelerates the grains of a falling ball apart or together along each axis. The **sum** of the three rates — the trace — is $\ddot V/V = -R_{\mu\nu}u^\mu u^\nu$, how fast the ball's volume starts to change ($u^\mu$ is its four-velocity). Compare empty space with the inside of matter.`,
    tasks: [
      t`Empty space near the Earth: the readout shows a stretch of $2GM/r^3$ along the line and a squeeze of $GM/r^3$ each way across it. They add to zero, and the volume graph starts flat: $R_{\mu\nu} = 0$, though the Riemann tensor is not.`,
      'Inside matter: every axis shrinks at the same rate, and the volume graph bends down from the start.',
      'Matter and a distant mass together: the shape follows the distant mass, the volume only the matter where the ball is.',
    ],
    params: { mode: 'tides', modes: ['tides', 'matter', 'both'], body: 'earth', bodies: true, rho: 5514, t: 0.6 },
  },
  example: {
    prompt: t`A sphere of radius $a$ has the Riemann tensor of step 14: $R^\theta{}_{\phi\theta\phi} = \sin^2\theta$, or lowered, $R_{\theta\phi\theta\phi} = a^2\sin^2\theta$ — its one independent component. Find the sphere's Ricci tensor and Ricci scalar.`,
    visual: meridianFan,
    steps: [
      { label: 'Which terms survive', text: t`$R_{\sigma\nu} = R^\lambda{}_{\sigma\lambda\nu}$ sums over $\lambda = \theta, \phi$. A term with $\lambda = \nu$ has equal last two slots, so it vanishes: Riemann is antisymmetric there.` },
      { label: 'The longitude entry', text: t`$R_{\phi\phi} = R^\theta{}_{\phi\theta\phi} + R^\phi{}_{\phi\phi\phi} = \sin^2\theta + 0 = \sin^2\theta$.` },
      { label: 'The colatitude entry', text: t`$R_{\theta\theta} = R^\theta{}_{\theta\theta\theta} + R^\phi{}_{\theta\phi\theta} = 0 + R^\phi{}_{\theta\phi\theta}$. Swapping both pairs flips the sign twice, so $R_{\phi\theta\phi\theta} = R_{\theta\phi\theta\phi} = a^2\sin^2\theta$, and raising with $g^{\phi\phi} = 1/(a^2\sin^2\theta)$ gives $R^\phi{}_{\theta\phi\theta} = 1$.` },
      { label: 'Off the diagonal', text: t`$R_{\theta\phi} = R^\theta{}_{\theta\theta\phi} + R^\phi{}_{\theta\phi\phi} = 0$: lowered, the first is antisymmetric in its first pair, $R_{\theta\theta\theta\phi} = 0$; the second has equal last slots.` },
      { label: 'The scalar', text: t`$R = g^{\theta\theta}R_{\theta\theta} + g^{\phi\phi}R_{\phi\phi} = \dfrac{1}{a^2} + \dfrac{\sin^2\theta}{a^2\sin^2\theta} = \dfrac{2}{a^2}$.` },
      { label: 'Sense check', text: t`$R_{\theta\theta} = 1$ and $R_{\phi\phi} = \sin^2\theta$ are just $g_{ab}/a^2$: on any surface $R_{ab} = K g_{ab}$ and $R = 2K$, twice the Gaussian curvature $1/a^2$, the same at every point. The coordinate pattern $1, \sin^2\theta$ belongs to the metric; dividing by it in the trace removes it.` },
    ],
    answer: t`$R_{\theta\theta} = 1$, $R_{\phi\phi} = \sin^2\theta$, $R_{\theta\phi} = 0$ — that is, $R_{ab} = g_{ab}/a^2$ — and $R = 2/a^2$.`,
  },
  practice: [
    expr({
      id: 'hyperbolic', difficulty: 2,
      prompt: t`The surface $d\ell^2 = dq^2 + \sinh^2 q\,d\phi^2$ — the hyperbolic plane, in polar coordinates around one of its points — has $R^q{}_{\phi q\phi} = -\sinh^2 q$ (from $-ff''$ with $f = \sinh q$, step 14). Contract to find $R_{\phi\phi} = R^\lambda{}_{\phi\lambda\phi}$.`,
      answer: '-sinh(q)^2', answerTeX: t`-\sinh^2 q`, lhs: t`R_{\phi\phi}`,
      vars: { q: [0.2, 2] },
      errors: [
        { answer: 'sinh(q)^2', feedback: t`Sign: the sum is $R^q{}_{\phi q\phi} + R^\phi{}_{\phi\phi\phi}$, and the first term is $-\sinh^2 q$.` },
        { answer: '-1', feedback: t`That is the other diagonal entry, $R_{qq} = R^\phi{}_{q\phi q}$. Here both free indices are $\phi$.` },
        { answer: '-2', feedback: t`That is the Ricci scalar $R$, the trace. The question asks for one component.` },
      ],
      hints: [t`The sum runs over $\lambda = q, \phi$: $R_{\phi\phi} = R^q{}_{\phi q\phi} + R^\phi{}_{\phi\phi\phi}$.`, t`$R^\phi{}_{\phi\phi\phi} = 0$: its last two slots are equal.`],
      teach: 'Contracting means setting the output index equal to the first loop index and summing over its values; terms with equal last two slots vanish.',
      explain: t`$R_{\phi\phi} = -\sinh^2 q + 0$. With $R_{qq} = R^\phi{}_{q\phi q} = -1$ the Ricci tensor is $R_{ab} = -g_{ab}$, and $R = g^{qq}R_{qq} + g^{\phi\phi}R_{\phi\phi} = -1 - 1 = -2$ at every point: constant negative curvature, where geodesics that start parallel spread apart.`,
      visual: halfPlane(t`The same surface drawn another way, as the upper half-plane with $ds^2 = (dx^2 + dy^2)/y^2$: its geodesics are the semicircles and the vertical line, and they spread apart however they start.`),
    }),
    mcq({
      id: 'symmetric', difficulty: 3,
      prompt: t`The Riemann tensor is antisymmetric in its last two slots, yet its contraction $R_{\sigma\nu} = \partial_\lambda\Gamma^\lambda{}_{\nu\sigma} - \partial_\nu\Gamma^\lambda{}_{\lambda\sigma} + \Gamma^\lambda{}_{\lambda\kappa}\Gamma^\kappa{}_{\nu\sigma} - \Gamma^\lambda{}_{\nu\kappa}\Gamma^\kappa{}_{\lambda\sigma}$ is symmetric, $R_{\sigma\nu} = R_{\nu\sigma}$, for every metric. Why?`,
      choices: [
        t`Each term is symmetric in $\sigma\nu$: the second because $\Gamma^\lambda{}_{\lambda\sigma} = \partial_\sigma\ln\sqrt{|g|}$, the last after renaming the dummies $\lambda \leftrightarrow \kappa$`,
        t`$R_{\sigma\nu}$ is always a multiple of $g_{\sigma\nu}$, so it inherits the metric's symmetry`,
        t`Summing $\rho$ against $\mu$ turns Riemann's antisymmetry in $\mu\nu$ into symmetry in $\sigma\nu$`,
        t`It is symmetric only for diagonal metrics; in general only its symmetric part enters Einstein's equations`,
      ],
      answer: 0,
      why: {
        1: t`That holds on any surface and in a few very symmetric spaces, not in general. An expanding universe has $R_{00}/g_{00} = 3\ddot a/a$ but $R_{11}/g_{11} = \ddot a/a + 2\dot a^2/a^2$ (with $c = 1$): no common factor.`,
        2: t`The contraction uses up $\mu$; the antisymmetry in $\mu\nu$ says nothing about how the remaining pair $\sigma\nu$ behaves. That has to be checked term by term.`,
        3: t`Diagonal or not, it is symmetric for every metric with the metric's own connection: each of the four terms is, as the correct choice shows.`,
      },
      hints: [t`$\partial_\lambda\Gamma^\lambda{}_{\nu\sigma}$ is symmetric because $\Gamma^\lambda{}_{\nu\sigma} = \Gamma^\lambda{}_{\sigma\nu}$. Look at the other three.`, t`With $\Gamma^\lambda{}_{\lambda\sigma} = \partial_\sigma\ln\sqrt{|g|}$, the second term is $-\partial_\nu\partial_\sigma\ln\sqrt{|g|}$; partial derivatives commute.`],
      teach: t`The Ricci tensor is symmetric term by term — the key is the trace identity $\Gamma^\lambda{}_{\lambda\sigma} = \partial_\sigma\ln\sqrt{|g|}$ — so it has 10 independent components, as many as the metric.`,
      explain: t`Term 1: $\Gamma$ is symmetric in its lower pair. Term 2: $-\partial_\nu\partial_\sigma\ln\sqrt{|g|}$. Term 3: $\Gamma^\lambda{}_{\lambda\kappa}\Gamma^\kappa{}_{\nu\sigma}$ inherits $\Gamma^\kappa{}_{\nu\sigma} = \Gamma^\kappa{}_{\sigma\nu}$. Term 4: swapping $\sigma \leftrightarrow \nu$ gives $\Gamma^\lambda{}_{\sigma\kappa}\Gamma^\kappa{}_{\lambda\nu}$, which is the original after renaming $\lambda \leftrightarrow \kappa$. Ten components — as many as the metric has, which is why an equation for $R_{\mu\nu}$ can determine $g_{\mu\nu}$.`,
      visual: ricciArray,
    }),
    num({
      id: 'max-sym', difficulty: 3,
      gen(r) {
        const n = r.pick([4, 5, 6]), a = r.pick([2, 3]);
        const R = (n * (n - 1)) / a ** 2;
        return {
          prompt: t`In a space of constant curvature — a sphere in any number of dimensions — the Riemann tensor is $R_{\rho\sigma\mu\nu} = \dfrac{1}{a^2}\left(g_{\rho\mu}g_{\sigma\nu} - g_{\rho\nu}g_{\sigma\mu}\right)$, with $a$ the radius. Contract it, $R_{\sigma\nu} = g^{\rho\mu}R_{\rho\sigma\mu\nu}$, then take the trace (in $n$ dimensions $g^{\rho\mu}g_{\rho\mu} = n$). What is the Ricci scalar for $n = ${n}$ and $a = ${a}$ m?`,
          answer: R, units: 'm^-2', tol: { rel: 1e-3 },
          errors: [
            { value: 2 / a ** 2, feedback: t`That is the two-dimensional sphere. In $n$ dimensions the trace gives $n(n-1)/a^2$.` },
            { value: (n * n) / a ** 2, feedback: t`The second term counts too: $g^{\rho\mu}g_{\rho\nu}g_{\sigma\mu} = \delta^\mu{}_\nu g_{\sigma\mu} = g_{\sigma\nu}$, so $R_{\sigma\nu} = (n - 1)g_{\sigma\nu}/a^2$.` },
            { value: (n - 1) / a ** 2, feedback: t`That is $R_{\sigma\nu}$ divided by $g_{\sigma\nu}$. The trace adds $n$ such terms.` },
          ],
          hints: [t`$g^{\rho\mu}g_{\rho\mu}\,g_{\sigma\nu} = n\,g_{\sigma\nu}$, and $g^{\rho\mu}g_{\rho\nu}\,g_{\sigma\mu} = \delta^\mu{}_\nu\, g_{\sigma\mu} = g_{\sigma\nu}$.`, t`So $R_{\sigma\nu} = (n-1)\,g_{\sigma\nu}/a^2$ and $R = g^{\sigma\nu}R_{\sigma\nu} = n(n-1)/a^2$.`],
          teach: t`For constant curvature $1/a^2$ in $n$ dimensions, $R_{\sigma\nu} = (n - 1)g_{\sigma\nu}/a^2$ and $R = n(n - 1)/a^2$.`,
          explain: t`$R = ${n}\times${n - 1}/${a}^2 = ${fmt(R, 4)}$ m⁻². For $n = 2$ it is the sphere's $2/a^2$; for $n = 3$ it is $6/a^2$, the curvature of space in a closed universe.`,
          visual: spherePic([
            { param: ['cos(t)', 'sin(t)', '0'], t: [0, 6.2832], color: 'gold', width: 2 },
            { param: ['cos(t)', '0', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 },
            { param: ['cos(t)*0.7071', 'cos(t)*0.7071', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2 },
          ], 'The two-dimensional case: a sphere, where every point and every direction is like every other — its great circles (gold) are all alike. Higher-dimensional spheres cannot be drawn, but their curvature has the same form. Drag to rotate.'),
        };
      },
    }),
    mcq({
      id: 'flrw-trace', difficulty: 2,
      prompt: t`A flat expanding universe ($c = 1$) has $g_{00} = -1$ and $g_{ij} = a(t)^2\,\delta_{ij}$, where $i, j$ run over the three space directions and $\delta_{ij}$ is 1 when $i = j$, else 0. Its Ricci tensor is $R_{00} = -3\ddot a/a$ and $R_{ij} = (a\ddot a + 2\dot a^2)\,\delta_{ij}$, with dots for $d/dt$. What is its Ricci scalar?`,
      choices: [
        t`$6\left(\dfrac{\ddot a}{a} + \dfrac{\dot a^2}{a^2}\right)$`,
        t`$\dfrac{6\dot a^2}{a^2}$`,
        t`$3a\ddot a + 6\dot a^2 + \dfrac{3\ddot a}{a}$`,
        t`$0$, since space is flat`,
      ],
      answer: 0,
      why: {
        1: t`That takes $g^{00} = +1$. The time–time entry enters with $g^{00} = -1$: $(-1)(-3\ddot a/a) = +3\ddot a/a$, which adds to the space part instead of cancelling it.`,
        2: t`The space entries must be divided by $g_{ii} = a^2$, since $g^{ij} = \delta^{ij}/a^2$. Adding up the diagonal without the inverse metric is not a trace, and the result would change with the units of $a$.`,
        3: t`Space is flat at each moment, but spacetime is not: $\dot a$ and $\ddot a$ curve it in the time direction.`,
      },
      hints: [t`$R = g^{00}R_{00} + \sum_i g^{ii}R_{ii}$ with $g^{00} = -1$ and $g^{ii} = 1/a^2$.`],
      teach: 'Taking a trace means pairing with the inverse metric: in an expanding universe the time–time entry changes sign and each space entry is divided by a².',
      explain: t`$R = (-1)\left(-\dfrac{3\ddot a}{a}\right) + 3\cdot\dfrac{a\ddot a + 2\dot a^2}{a^2} = \dfrac{6\ddot a}{a} + \dfrac{6\dot a^2}{a^2}$. Both terms are about how $a$ changes in time — the universe's spacetime curvature.`,
      visual: scalePlot,
    }),
    mcq({
      id: 'newton', difficulty: 3,
      prompt: t`In weak, static gravity, with $x^0 = ct$ and $g_{00} = -(1 + 2\Phi/c^2)$, the Riemann components $R^i{}_{0j0} = \partial_i\partial_j\Phi/c^2$ are Newton's tidal tensor ($\Phi$ is the Newtonian potential; $i, j$ run over space). What is $R_{00} = R^\lambda{}_{0\lambda0}$?`,
      choices: [
        t`$\nabla^2\Phi/c^2$`,
        t`$0$, because $R^0{}_{000} = 0$`,
        t`$-\nabla^2\Phi/c^2$`,
        t`$|\nabla\Phi|^2/c^4$`,
      ],
      answer: 0,
      why: {
        1: t`The $\lambda = 0$ term is zero, but $\lambda = 1, 2, 3$ are not: $R_{00} = R^1{}_{010} + R^2{}_{020} + R^3{}_{030}$.`,
        2: t`No sign enters: $R^i{}_{0i0} = +\partial_i\partial_i\Phi/c^2$. A minus sign would come from contracting the last slot instead, $R^\lambda{}_{00\lambda} = -R^\lambda{}_{0\lambda0}$.`,
        3: t`Products of first derivatives are second order in $\Phi$ and are dropped in weak gravity; the tidal tensor has second derivatives, and their trace is the Laplacian.`,
      },
      hints: [t`The repeated index $\lambda$ runs over $0, 1, 2, 3$; the $\lambda = 0$ term has equal last two slots.`, t`What is left is $\sum_i \partial_i\partial_i\Phi/c^2$.`],
      teach: t`In weak gravity $R_{00}$ is the trace of the tidal tensor, $\nabla^2\Phi/c^2$ — Newton's Poisson equation makes it $4\pi G\rho/c^2$.`,
      explain: t`$R_{00} = \sum_i R^i{}_{0i0} = (\partial_x^2 + \partial_y^2 + \partial_z^2)\Phi/c^2 = \nabla^2\Phi/c^2$. Poisson's equation, $\nabla^2\Phi = 4\pi G\rho$, then gives $R_{00} = 4\pi G\rho/c^2$: zero in vacuum, positive inside matter. Turned around, this is how Newton's law will be recovered from Einstein's (step 19).`,
      visual: ball({ mode: 'matter', rho: 5514, t: 0.6 }, t`A ball of test grains inside uniform matter shrinks the same way along every axis. Each axis contributes $\partial_i\partial_i\Phi = 4\pi G\rho/3$; the three together are the volume rate.`),
    }),
    num({
      id: 'area-deficit', difficulty: 2,
      gen(r) {
        const rk = r.pick([500, 1000, 2000]);
        const x = rk / A_EARTH, pct = (x * x * 100) / 12, exact = (1 - (2 * (1 - Math.cos(x))) / (x * x)) * 100;
        return {
          prompt: t`On a surface with Ricci scalar $R$, a small circle of radius $r$ — measured along the surface — encloses an area $A \approx \pi r^2\left(1 - \dfrac{R\,r^2}{24}\right)$. On the Earth ($a = ${A_EARTH}$ km, $R = 2/a^2$), by what percentage is the area within ${rk.toLocaleString('en-US')} km of a point smaller than $\pi r^2$?`,
          answer: pct, tol: { rel: 0.01 },
          errors: [
            { value: pct / 2, feedback: t`On a sphere $R = 2/a^2$, twice the Gaussian curvature $1/a^2$.` },
            { value: pct / 100, feedback: 'That is the fraction. Multiply by 100 for a percentage.' },
          ],
          hints: [t`$\dfrac{R\,r^2}{24} = \dfrac{2}{a^2}\cdot\dfrac{r^2}{24} = \dfrac{r^2}{12a^2}$.`, t`$r/a = ${rk}/${A_EARTH} = ${fmt(x, 4)}$.`],
          teach: 'The Ricci scalar measures the area (or volume) a small ball is missing compared with flat space: A ≈ πr²(1 − Rr²/24) on a surface.',
          explain: t`$\dfrac{r^2}{12a^2} = ${fmt(pct, 3)}$%. The cap's exact area, $2\pi a^2\left(1 - \cos(r/a)\right)$, falls short by $${fmt(exact, 3)}$%: the formula is the first term of that series. A surveyor who measured both the radius and the area of a large region could find the Earth's curvature without ever leaving its surface.`,
          visual: capCircle(t`A circle (blue) drawn around a point of a sphere, with its radius measured along the surface (gold); not to scale. It encloses less area than a flat circle of the same radius, and its circumference is less than $2\pi r$.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-excess', difficulty: 3, transfer: true,
      gen(r) {
        const [name, M, Rkm, unit, scale] = r.pick([['the Earth', 5.972e24, 6371, 'mm', 1e3], ['the Moon', 7.342e22, 1737, 'μm', 1e6], ['Jupiter', 1.898e27, 69911, 'mm', 1e3]]);
        const dr = (G * M) / (3 * C * C);                         // m
        const ans = dr * scale;
        return {
          prompt: t`Feynman's excess radius. Space inside a body of uniform density $\rho$ is curved: a slice of it at one instant has Ricci scalar $\mathcal R = 16\pi G\rho/c^2$. In such a space the radius of a sphere, measured with a ruler from the centre, exceeds $\sqrt{A/4\pi}$ — the radius you would infer from its surface area $A$ — by $\mathcal R\,r^3/36$. Treat ${name} as uniform, with mass $${sci(M, 4)}$ kg and radius ${Rkm.toLocaleString('en-US')} km. By how much does its measured radius exceed $\sqrt{A/4\pi}$, in ${unit}? ($G = 6.674\times10^{-11}$ m³ kg⁻¹ s⁻², $c = 2.998\times10^8$ m/s.)`,
          answer: ans, units: unit, tol: { rel: 0.005 },
          errors: [
            { value: ans / 3, feedback: t`The volume of a sphere is $\tfrac43\pi r^3$: $\rho = 3M/(4\pi r^3)$.` },
            { value: ans * 3, feedback: t`That is $GM/c^2$, the mass as a length. The excess radius is a third of it.` },
          ],
          hints: [t`With $\rho = 3M/(4\pi r^3)$: $\dfrac{16\pi G\rho}{c^2}\cdot\dfrac{r^3}{36} = \dfrac{GM}{3c^2}$ — the radius cancels.`, t`$GM/c^2$ for ${name} is $${sci((G * M) / (C * C), 4)}$ m.`],
          teach: 'The Ricci scalar of space measures how far a ball’s radius and volume depart from flat-space geometry; inside matter it is 16πGρ/c², giving Feynman’s “excess radius” GM/3c² for a uniform ball.',
          explain: t`The radius cancels: $\delta r = \dfrac{16\pi G}{36\,c^2}\cdot\dfrac{3M}{4\pi} = \dfrac{GM}{3c^2} = ${sci(dr, 4)}$ m $= ${fmt(ans, 4)}$ ${unit}. Feynman made this his way into Einstein's equation (Lectures on Physics, Vol. II, ch. 42). Real planets are denser toward their centres, which makes the excess somewhat larger than this uniform-density value.`,
          visual: capCircle(t`Two dimensions down: on a curved surface, the radius measured along it (gold) is not the circumference (blue) divided by $2\pi$. Inside a planet, space does the same in three dimensions, very slightly.`),
        };
      },
    }),
    num({
      id: 'cp-half-plane', difficulty: 3,
      prompt: t`For the upper half-plane, $ds^2 = (dx^2 + dy^2)/y^2$, step 14 found $R^x{}_{yxy} = -1/y^2$, and lowered, $R_{xyxy} = -1/y^4$. Find its Ricci scalar $R$ (the same at every point).`,
      answer: -2, tol: { rel: 1e-3 },
      errors: [
        { value: -1, feedback: t`That is the Gaussian curvature $K$. On a surface $R = 2K$: both diagonal entries contribute.` },
        { value: 2, feedback: 'Sign: both diagonal entries of the Ricci tensor are negative.' },
        { value: -4, feedback: t`Each diagonal entry contributes $-1$ once: $g^{xx}R_{xx} = y^2(-1/y^2) = -1$, and the same for $yy$.` },
      ],
      hints: [t`$R_{yy} = R^x{}_{yxy} = -1/y^2$, and $R_{xx} = R^y{}_{xyx} = g^{yy}R_{yxyx} = y^2 R_{xyxy}$.`, t`$R = g^{xx}R_{xx} + g^{yy}R_{yy}$, with $g^{xx} = g^{yy} = y^2$.`],
      teach: 'Contract, then trace with the inverse metric: on any surface the result is R = 2K.',
      explain: t`$R_{yy} = -1/y^2$ and $R_{xx} = y^2\cdot(-1/y^4) = -1/y^2$, so $R = y^2(-1/y^2) + y^2(-1/y^2) = -2$: the hyperbolic plane, with $K = -1$ everywhere.`,
      visual: halfPlane(),
    }),
    num({
      id: 'cp-lambda', difficulty: 2,
      prompt: t`In empty space with a cosmological constant, Einstein's equations (step 18) reduce to $R_{\mu\nu} = \Lambda g_{\mu\nu}$. With the measured $\Lambda = 1.1\times10^{-52}$ m⁻², what is the Ricci scalar of such a spacetime?`,
      answer: 4 * LAMBDA, units: 'm^-2', tol: { rel: 1e-3 },
      errors: [
        { value: LAMBDA, feedback: t`The trace of the metric is $g^{\mu\nu}g_{\mu\nu} = \delta^\mu{}_\mu = 4$, not 1: four equal diagonal terms.` },
        { value: -4 * LAMBDA, feedback: t`$g^{\mu\nu}g_{\mu\nu} = +4$ in any signature: $g^{00}g_{00} = (-1)(-1) = +1$.` },
      ],
      hints: [t`$R = g^{\mu\nu}R_{\mu\nu} = \Lambda\,g^{\mu\nu}g_{\mu\nu}$, and $g^{\mu\nu}g_{\mu\nu} = \delta^\mu{}_\mu$.`],
      teach: t`The trace of the metric is the number of dimensions, $g^{\mu\nu}g_{\mu\nu} = 4$, so $R_{\mu\nu} = \Lambda g_{\mu\nu}$ gives $R = 4\Lambda$.`,
      explain: t`$R = \Lambda\,\delta^\mu{}_\mu = 4\Lambda = ${sci(4 * LAMBDA, 2)}$ m⁻²: positive and the same at every event, even with no matter at all. This is de Sitter space, which our universe approaches as its matter thins out.`,
      visual: deSitter,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §3.6 (the Ricci tensor and scalar)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Baez & Bunn, The Meaning of Einstein’s Equation (Ricci curvature as a falling ball’s volume)', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'Feynman, Leighton & Sands, The Feynman Lectures on Physics, Vol. II, ch. 42: Curved Space (the excess radius)', url: 'https://www.feynmanlectures.caltech.edu/II_42.html' },
  ],
});
