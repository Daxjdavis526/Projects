// The Einstein–Hilbert action, at concept level with the honest key steps.
// S = (1/16πG)∫R√−g d⁴x + S_M. Varying g^{μν}: (1) Jacobi, δ√−g =
// −½√−g g_μν δg^{μν} (explore: ten-metric’s determinant under nudges; code:
// a finite-difference check on a random Lorentzian metric); (2) δR = R_μν δg^{μν}
// + g^{μν}δR_μν, and Palatini’s δR_μν = ∇_ρδΓ^ρ_{νμ} − ∇_νδΓ^ρ_{ρμ} makes the second
// a total divergence (a boundary term — Gibbons–Hawking–York); (3) δS_H =
// (1/16πG)∫√−g G_μν δg^{μν}; (4) T_μν = −(2/√−g)δS_M/δg^{μν}; so G_μν = 8πG T_μν.
// Practice: δ√−g numbers, R = 8πGρ/c² for dust (trace), Klein–Gordon T₀₀,
// why the boundary term, Lovelock (why not R²), Λ as −2Λ in the density,
// the coupling c⁴/8πG = 4.8×10⁴² N. Transfer: a neutron star’s curvature
// radius (~10 km, pressure ignored). Links gr EQ.1, EQ.6, S17.d, S18.d,
// st-c C6.4 (2D: topological).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const G = 6.674e-11, C = 2.998e8;

export default lesson({
  id: 'st-g.G5.3',
  title: 'The Einstein–Hilbert action',
  minutes: 18, difficulty: 4,
  intro: t`Einstein reached his field equations by physical argument; Hilbert, days before Einstein’s final paper in November 1915, derived them from an action. It is the simplest scalar density that geometry offers — the Ricci scalar, weighted by the invariant volume element — added to the matter action:

$$S = \frac{1}{16\pi G}\int R\,\sqrt{-g}\,d^4x + S_M$$

Making $S$ stationary under every variation of the metric $\delta g^{\mu\nu}$ gives $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$, the [field equations](#/lesson/gr.EQ.1). The derivation has four honest steps; each uses something from earlier: [functional derivatives](#/lesson/st-g.G5.1), [field actions](#/lesson/st-g.G5.2) and the [Einstein tensor](#/lesson/gr.EQ.6). With $c = 1$.`,
  symbols: [
    { tex: 'S', text: 'the total action: gravity’s part plus matter’s' },
    { tex: 'R', text: t`the Ricci scalar $g^{\mu\nu}R_{\mu\nu}$, the fully contracted curvature (units $\text{m}^{-2}$)` },
    { tex: 'g', text: t`the determinant of the metric components $g_{\mu\nu}$; negative for a Lorentzian metric, so $\sqrt{-g}$ is real` },
    { tex: '\\sqrt{-g}\\,d^4x', text: t`the invariant spacetime volume element — the same in every coordinate system` },
    { tex: 'G', text: t`Newton’s constant; the $1/16\pi G$ is fixed by requiring the Newtonian limit` },
    { tex: 'S_M', text: t`the matter action (Klein–Gordon, Maxwell, a fluid), written with $g_{\mu\nu}$ and $\sqrt{-g}$ in place of $\eta_{\mu\nu}$ and $1$` },
  ],
  why: 'The action is where modifications of general relativity are proposed and tested (adding R², scalar fields, a cosmological constant), where its quantum version starts, and where the boundary term behind black-hole thermodynamics comes from.',
  visual: {
    type: 'ten-metric',
    title: 'How a determinant responds to a nudge',
    lead: t`Step one of the derivation is Jacobi’s formula, $\delta(\det g) = \det g\;g^{\mu\nu}\delta g_{\mu\nu}$. Here it is in two dimensions: the sliders set a metric $g_{\mu\nu}$; the ellipse is its “unit circle” $g(X, X) = 1$, whose area is $\pi/\sqrt{\det g}$. The readout gives $\det g$ and the inverse $g^{\mu\nu}$.`,
    tasks: [
      t`From the identity, raise $g_{11}$ to $1.2$: $\det g$ becomes $1.2$, exactly $\det g\cdot g^{11}\cdot0.2$ added to $1$.`,
      t`Back to the identity, set $g_{12} = 0.3$: $\det g$ falls to $0.91$ — but the formula predicts no change, because $g^{12} = 0$ there. The drop, $-0.09$, is second order: Jacobi’s formula is the first-order term.`,
      t`Now from $g = \operatorname{diag}(2, 1)$, nudge $g_{22}$ by $0.1$: $\det g$ grows by $0.2 = 2\times1\times0.1$. The change is $\det g$ times the inverse component times the nudge.`,
    ],
    params: { mode: 'form', T: [[1, 0], [0, 1]], sliders: 'sym', range: 3, indicatrix: true, feed: false, showU: false, showV: false, crossings: false, readout: ['T', 'inv', 'det'], tname: 'g' },
    caption: t`A positive-definite two-dimensional metric, so $\sqrt{\det g}$ rather than $\sqrt{-\det g}$; the formula is the same in any dimension and signature.`,
  },
  example: {
    prompt: t`Vary $S_H = \dfrac{1}{16\pi G}\displaystyle\int R\sqrt{-g}\,d^4x$ with respect to the inverse metric $g^{\mu\nu}$, add the matter action, and show that stationarity is $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$.`,
    visual: { type: 'ten-metric', params: { mode: 'chart', chart: 'sphere', readout: false }, caption: t`The metric is the field being varied: at every point of the chart, its components can be nudged independently — ten numbers per point in four dimensions.` },
    steps: [
      { label: 'Product rule', text: t`$R\sqrt{-g} = g^{\mu\nu}R_{\mu\nu}\sqrt{-g}$ has three factors that depend on the metric. So $\delta(R\sqrt{-g}) = \sqrt{-g}\,R_{\mu\nu}\delta g^{\mu\nu}$ $+\, \sqrt{-g}\,g^{\mu\nu}\delta R_{\mu\nu}$ $+\, R\,\delta\sqrt{-g}$.` },
      { label: 'The volume element', text: t`Jacobi’s formula gives $\delta g = g\,g^{\mu\nu}\delta g_{\mu\nu} = -g\,g_{\mu\nu}\delta g^{\mu\nu}$, so $\delta\sqrt{-g} = -\tfrac12\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$.` },
      { label: 'The curvature term', text: t`The Palatini identity, $\delta R_{\mu\nu} = \nabla_\rho\delta\Gamma^\rho_{\nu\mu} - \nabla_\nu\delta\Gamma^\rho_{\rho\mu}$, makes $\sqrt{-g}\,g^{\mu\nu}\delta R_{\mu\nu}$ a total divergence $\sqrt{-g}\,\nabla_\sigma V^\sigma$. It integrates to a boundary term — which the Gibbons–Hawking–York term is added to cancel — and drops out.` },
      { label: 'Collect', text: t`$\delta S_H = \dfrac{1}{16\pi G}\displaystyle\int\sqrt{-g}\,\Bigl(R_{\mu\nu} - \tfrac12Rg_{\mu\nu}\Bigr)\delta g^{\mu\nu}\,d^4x$: the functional derivative is $\sqrt{-g}\,G_{\mu\nu}/16\pi G$.` },
      { label: 'Add matter', text: t`Define $T_{\mu\nu} = -\dfrac{2}{\sqrt{-g}}\dfrac{\delta S_M}{\delta g^{\mu\nu}}$. Then $\delta S = \displaystyle\int\sqrt{-g}\Bigl(\frac{G_{\mu\nu}}{16\pi G} - \frac12T_{\mu\nu}\Bigr)\delta g^{\mu\nu}d^4x = 0$ for every $\delta g^{\mu\nu}$: $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$.` },
      { label: 'Sense check', text: t`Ten independent $\delta g^{\mu\nu}$ per point, ten equations per point. And because the action is coordinate-invariant, the result satisfies $\nabla^\mu G_{\mu\nu} = 0$ identically — the Bianchi identity, the four relations that make [four of the equations constraints](#/lesson/st-g.G6.4).` },
    ],
    answer: t`$\dfrac{1}{\sqrt{-g}}\dfrac{\delta S}{\delta g^{\mu\nu}} = \dfrac{G_{\mu\nu}}{16\pi G} - \dfrac12T_{\mu\nu} = 0$, i.e. $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$.`,
  },
  practice: [
    num({
      id: 'jacobi-number', difficulty: 2,
      gen(r) {
        const A = r.pick([1, 0.8, 0.5]), B = r.pick([1, 2, 4]), eps = r.pick([0.01, 0.02, 0.05]);
        const sg = Math.sqrt(A * B * B * B), ans = 0.5 * sg * (eps / B);
        return {
          prompt: t`A static, isotropic metric has $g_{\mu\nu} = \operatorname{diag}(-${A}, ${B}, ${B}, ${B})$, so $\sqrt{-g} = \sqrt{${A}\times${B}^3}$. If $g_{11}$ alone is increased by $\delta g_{11} = ${eps}$, by how much does $\sqrt{-g}$ change, to first order? Use $\delta\sqrt{-g} = \tfrac12\sqrt{-g}\,g^{\mu\nu}\delta g_{\mu\nu}$.`,
          visual: { type: 'ten-metric', params: { mode: 'form', T: [[B, 0], [0, B]], sliders: false, indicatrix: true, feed: false, showU: false, showV: false, crossings: false, readout: false, tname: 'g', axes: ['x¹', 'x²'] }, caption: t`The spatial metric’s unit circle in the $x^1x^2$ plane: a circle of radius $1/\sqrt{${B}}$. Stretching $g_{11}$ squeezes it along $x^1$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0.5 * sg * eps * B, feedback: t`The formula uses the **inverse** metric: $g^{11} = 1/${B}$, not $${B}$.` }, { value: sg * (eps / B), feedback: t`$\sqrt{-g}$ responds with half the determinant’s fractional change: the factor $\tfrac12$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$g^{11} = 1/g_{11} = 1/${B}$ for a diagonal metric, and only $\delta g_{11}$ is nonzero.`, t`$\delta\sqrt{-g} = \tfrac12\times${nice(sg, 4)}\times\tfrac{1}{${B}}\times${eps}$.`],
          teach: t`Jacobi’s formula: $\delta\sqrt{-g} = \tfrac12\sqrt{-g}\,g^{\mu\nu}\delta g_{\mu\nu}$ — the volume element grows by half the trace of the metric’s fractional change.`,
          explain: t`$\delta\sqrt{-g} = ${nice(ans, 4)}$. Exactly: $\sqrt{${A}(${B} + ${eps})${B}^2} - ${nice(sg, 4)} = ${nice(Math.sqrt(A * (B + eps) * B * B) - sg, 4)}$, agreeing to first order.`,
        };
      },
    }),
    num({
      id: 'trace-dust', difficulty: 3,
      gen(r) {
        const [what, rho] = r.pick([['water', 1000], ['the Earth’s mean density', 5514], ['the Sun’s mean density', 1410], ['white-dwarf matter', 1e9]]);
        const ans = (8 * Math.PI * G * rho) / C ** 2;
        return {
          prompt: t`Taking the trace of $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$ in four dimensions gives $-R = 8\pi G\,T$, where $T = g^{\mu\nu}T_{\mu\nu} = -\rho c^2$ for pressureless dust. So $R = 8\pi G\rho/c^2$. What is the Ricci scalar inside matter at the density of ${what}, $\rho = ${tex(rho)}\ \text{kg/m}^3$, in $\text{m}^{-2}$?`,
          visual: { type: 'graph', params: { x: [2, 11], y: [-24, -16], xlog: true, ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'density (kg/m³)', ylabel: 'R (1/m²)', curves: [{ fn: `log10(8*pi*${G}/${C}^2) + x`, color: 'accent', width: 2.2 }], vlines: [{ x: Math.log10(rho), color: 'gold' }] }, caption: t`Ricci curvature against density for dust, on log–log axes: proportional, with the tiny coefficient $8\pi G/c^2$.` },
          answer: ans, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: (8 * Math.PI * G * rho) / C ** 4, feedback: t`$T = -\rho c^2$ carries a $c^2$ that cancels one: $8\pi G\rho c^2/c^4 = 8\pi G\rho/c^2$.` }, { value: (4 * Math.PI * G * rho) / C ** 2, feedback: t`The trace of $G_{\mu\nu}$ is $(1 - 4/2)R = -R$, giving $8\pi G$, not $4\pi G$.` }],
          hints: [t`$g^{\mu\nu}G_{\mu\nu} = R - \tfrac12\cdot4R = -R$.`, t`$R = 8\pi\times${tex(G, 4)}\times${tex(rho)}/(${tex(C, 4)})^2$.`],
          teach: 'Inside matter the Ricci scalar is fixed locally by the trace of the stress–energy: R = 8πGρ/c² for dust — vanishing in vacuum, where only the Weyl (tidal) part of curvature survives.',
          explain: t`$R = ${tex(ans, 3)}\ \text{m}^{-2}$, a curvature radius $1/\sqrt R \approx ${tex(1 / Math.sqrt(ans) / 1000, 2)}$ km — enormous, which is why Newton suffices for everyday matter. In vacuum $T = 0$ gives $R = 0$ and then $R_{\mu\nu} = 0$.`,
        };
      },
    }),
    num({
      id: 'kg-energy', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1, 1.5]), b = r.pick([0.3, 0.6, 1]), m = r.pick([1, 2]), p = r.pick([0.2, 0.5]);
        const ans = 0.5 * (a * a + b * b + m * m * p * p);
        return {
          prompt: t`For the Klein–Gordon field, $T_{\mu\nu} = -\dfrac{2}{\sqrt{-g}}\dfrac{\delta S_M}{\delta g^{\mu\nu}}$ gives $T_{\mu\nu} = \partial_\mu\phi\,\partial_\nu\phi - \tfrac12g_{\mu\nu}\bigl(\partial_\alpha\phi\,\partial^\alpha\phi + m^2\phi^2\bigr)$. In flat spacetime, at a point where $\dot\phi = ${a}$, $|\nabla\phi| = ${b}$, $\phi = ${p}$ and $m = ${m}$ (natural units), what is the energy density $T_{00}$?`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'term', ylabel: 'energy density', xticks: 0, shade: [{ fn: String(a * a / 2), lower: 0, from: 0.25, to: 0.75, color: 'accent', alpha: 0.6 }, { fn: String(b * b / 2), lower: 0, from: 1.25, to: 1.75, color: 'violet', alpha: 0.6 }, { fn: String(m * m * p * p / 2), lower: 0, from: 2.25, to: 2.75, color: 'gold', alpha: 0.6 }], points: [{ x: 0.5, y: 2.05, r: 0, label: '½φ̇²', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 1.5, y: 2.05, r: 0, label: '½|∇φ|²', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 2.5, y: 2.05, r: 0, label: '½m²φ²', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`The three pieces of the field’s energy density at this point; each is non-negative.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0.5 * (a * a - b * b - m * m * p * p), feedback: t`With $g_{00} = -1$ and $\partial_\alpha\phi\,\partial^\alpha\phi = -\dot\phi^2 + |\nabla\phi|^2$, every term comes out positive: $T_{00} = \tfrac12(\dot\phi^2 + |\nabla\phi|^2 + m^2\phi^2)$.` }, { value: a * a, feedback: t`The first term gives $\dot\phi^2$, but the $-\tfrac12g_{00}(\dots)$ part subtracts half of it back and adds the rest.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$T_{00} = \dot\phi^2 + \tfrac12\bigl(-\dot\phi^2 + |\nabla\phi|^2 + m^2\phi^2\bigr)$, since $g_{00} = -1$.`, t`$= \tfrac12(\dot\phi^2 + |\nabla\phi|^2 + m^2\phi^2)$.`],
          teach: 'Varying the matter action with respect to the metric gives the stress–energy tensor; for a scalar field its T₀₀ is the familiar positive energy density.',
          explain: t`$T_{00} = \tfrac12(${a * a} + ${nice(b * b, 3)} + ${nice(m * m * p * p, 3)}) = ${nice(ans, 4)}$. Defining $T_{\mu\nu}$ by a metric variation makes it symmetric and conserved automatically, and it is exactly what appears on the right of Einstein’s equations.`,
        };
      },
    }),
    mcq({
      id: 'boundary-term', difficulty: 3,
      prompt: t`The term $\sqrt{-g}\,g^{\mu\nu}\delta R_{\mu\nu}$ is a total divergence. Why is it not simply discarded, and why do careful treatments add the Gibbons–Hawking–York boundary term $\dfrac{1}{8\pi G}\displaystyle\oint K\sqrt{|h|}\,d^3y$?`,
      visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1, 1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.4, label: 'boundary: δg = 0 here', labelAt: 0.6, labelDx: 6, labelDy: -6 }], shade: [{ fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'accent', alpha: 0.15 }], points: [{ x: 0, y: 0, r: 0, label: 'region of spacetime', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`The variation is fixed on the boundary — but the metric’s normal derivatives there are not.` },
      choices: [
        t`$R$ contains second derivatives of the metric, so the divergence leaves boundary terms with normal derivatives of $\delta g$, which do not vanish when only $\delta g$ is fixed there; the GHY term cancels them`,
        t`The divergence is not really a divergence: it changes the field equations`,
        t`Boundary terms always vanish, so the GHY term is decorative`,
        t`Without it the action would not be coordinate-invariant`,
      ],
      answer: 0,
      why: {
        1: t`It is a genuine divergence and does not change the equations in the interior; the issue is only whether the variational principle is well posed with the usual boundary data.`,
        2: t`They vanish when the variation and its derivatives vanish on the boundary — more than one may fix for a second-order theory.`,
        3: t`$R\sqrt{-g}$ and the GHY term are both invariant. The issue is the boundary data, not invariance.`,
      },
      hints: [t`How many derivatives of the metric does $R$ contain? What does Stokes’ theorem leave on the boundary?`, t`Fixing $g$ on the boundary does not fix its normal derivative.`],
      teach: 'Because R holds second derivatives, the Einstein–Hilbert action needs a boundary term (Gibbons–Hawking–York) for its variation to be well posed with only the metric fixed on the boundary.',
      explain: t`York (1972) and Gibbons and Hawking (1977) added the extrinsic-curvature term $K$. It leaves the field equations unchanged and makes the action differentiable; in Euclidean quantum gravity it supplies a black hole’s entropy.`,
    }),
    mcq({
      id: 'lovelock', difficulty: 3,
      prompt: t`Why does general relativity use $R$, not $R^2$ or $R_{\mu\nu}R^{\mu\nu}$, in four dimensions?`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 5], aspect: 'wide', axesAt: 'edge', xlabel: 'derivatives of g in the action', ylabel: 'order of the field equations', xticks: 5, yticks: 5, points: [{ x: 2, y: 2, color: 'accent', label: 'R: second order' }, { x: 4, y: 4, color: 'bad', label: 'R²: fourth order' }] }, caption: t`Each curvature factor carries two derivatives of the metric; varying them raises the order of the equations accordingly.` },
      choices: [
        t`Lovelock’s theorem: in four dimensions the only divergence-free tensor built from the metric and its first two derivatives is $aG_{\mu\nu} + bg_{\mu\nu}$, so $R$ (and a constant) is the only density giving second-order equations; $R^2$ terms give fourth-order equations with extra, often unstable, modes`,
        t`$R^2$ is not a scalar`,
        t`$R^2$ terms are forbidden by experiment at every scale`,
        t`$R^2$ gives exactly the same equations as $R$`,
      ],
      answer: 0,
      why: {
        1: t`$R^2$ is a perfectly good scalar; the problem is the order of its equations.`,
        2: t`Small $R^2$ corrections are allowed and appear in effective theories (and in Starobinsky inflation); they matter only at high curvature.`,
        3: t`Its variation contains fourth derivatives of the metric, so the equations differ.`,
      },
      hints: [t`Count derivatives: $R \sim \partial^2g$, so $R^2 \sim (\partial^2g)^2$; one variation adds two more by parts.`, 'Second-order equations need initial data of g and its first time derivative only.'],
      teach: 'In four dimensions R (plus a constant) is the unique metric action giving second-order equations — Lovelock’s theorem singles out Einstein’s theory.',
      explain: t`Higher-derivative actions add degrees of freedom — a scalar mode for $f(R)$, a massive spin-2 ghost for $R_{\mu\nu}R^{\mu\nu}$. In more than four dimensions Lovelock allows further terms, such as the Gauss–Bonnet combination.`,
    }),
    mcq({
      id: 'lambda-term', difficulty: 2,
      prompt: t`Replace $R$ by $R - 2\Lambda$ in the Einstein–Hilbert action. What changes in the field equations?`,
      visual: { type: 'gr-friedmann', params: {}, caption: t`Universes with matter and a cosmological constant: $\Lambda$ eventually drives accelerated expansion.` },
      choices: [
        t`$G_{\mu\nu} + \Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$: the variation of $-2\Lambda\sqrt{-g}$ is $+\Lambda\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$`,
        t`$G_{\mu\nu} - \Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$`,
        t`$G_{\mu\nu} + 2\Lambda g_{\mu\nu} = 8\pi G\,T_{\mu\nu}$`,
        t`Nothing: a constant in the action has no effect`,
      ],
      answer: 0,
      why: {
        1: t`$\delta\sqrt{-g} = -\tfrac12\sqrt{-g}g_{\mu\nu}\delta g^{\mu\nu}$, so $\delta(-2\Lambda\sqrt{-g}) = +\Lambda\sqrt{-g}g_{\mu\nu}\delta g^{\mu\nu}$: the sign is plus.`,
        2: t`The $-\tfrac12$ from Jacobi’s formula halves the $2$.`,
        3: t`A constant multiplies $\sqrt{-g}$, which depends on the metric: it is the volume, and its variation is not zero.`,
      },
      hints: [t`Only $\sqrt{-g}$ depends on the metric in $-2\Lambda\sqrt{-g}$.`, t`Use $\delta\sqrt{-g} = -\tfrac12\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$.`],
      teach: t`A cosmological constant is a term proportional to the spacetime volume in the action; it varies into $\Lambda g_{\mu\nu}$, the same as vacuum energy of density $\Lambda/8\pi G$.`,
      explain: t`$\tfrac{1}{16\pi G}\delta(-2\Lambda\sqrt{-g}) = \tfrac{\Lambda}{16\pi G}\sqrt{-g}g_{\mu\nu}\delta g^{\mu\nu}$, giving $+\Lambda g_{\mu\nu}$. Moved to the right, it is $T^{\text{vac}}_{\mu\nu} = -\rho_\Lambda g_{\mu\nu}$ with $\rho_\Lambda = \Lambda/8\pi G$ — the form in [EQ.1](#/lesson/gr.EQ.1).`,
    }),
    code({
      id: 'jacobi-check', difficulty: 3,
      prompt: t`Check Jacobi’s formula numerically. The program builds a random Lorentzian metric \`g\` (a symmetric $4\times4$ matrix with one negative eigenvalue) and a small symmetric perturbation \`dg\` of the **inverse** metric. Write \`sqrt_mg(g)\` returning $\sqrt{-\det g}$, and \`predicted(g, dg_inv)\` returning $-\tfrac12\sqrt{-g}\,g_{\mu\nu}\,\delta g^{\mu\nu}$ (a full contraction: \`np.sum(g * dg_inv)\`). The program compares it with the actual change of $\sqrt{-g}$ when $g^{\mu\nu}$ changes by \`dg_inv\`.`,
      starter: t`import numpy as np

rng = np.random.default_rng(4)
M = rng.normal(size=(4, 4))
Q, _ = np.linalg.qr(M)
g = Q @ np.diag([-1.3, 0.8, 1.1, 2.0]) @ Q.T        # a Lorentzian metric
D = rng.normal(size=(4, 4))
dg_inv = 1e-6 * (D + D.T)                        # a small change of g^{mu nu}

def sqrt_mg(g):
    pass

def predicted(g, dg_inv):
    pass

g_inv = np.linalg.inv(g)
actual = sqrt_mg(np.linalg.inv(g_inv + dg_inv)) - sqrt_mg(g)
print("actual   ", actual)
print("predicted", predicted(g, dg_inv))
`,
      answer: t`import numpy as np

rng = np.random.default_rng(4)
M = rng.normal(size=(4, 4))
Q, _ = np.linalg.qr(M)
g = Q @ np.diag([-1.3, 0.8, 1.1, 2.0]) @ Q.T        # a Lorentzian metric
D = rng.normal(size=(4, 4))
dg_inv = 1e-6 * (D + D.T)                        # a small change of g^{mu nu}

def sqrt_mg(g):
    return np.sqrt(-np.linalg.det(g))

def predicted(g, dg_inv):
    return -0.5 * sqrt_mg(g) * np.sum(g * dg_inv)

g_inv = np.linalg.inv(g)
actual = sqrt_mg(np.linalg.inv(g_inv + dg_inv)) - sqrt_mg(g)
print("actual   ", actual)
print("predicted", predicted(g, dg_inv))
`,
      tests: [
        { name: 'sqrt_mg of diag(−1, 1, 1, 1) is 1', code: 'abs(sqrt_mg(np.diag([-1.0, 1, 1, 1])) - 1) < 1e-12' },
        { name: 'sqrt_mg of diag(−4, 1, 1, 9) is 6', code: 'abs(sqrt_mg(np.diag([-4.0, 1, 1, 9])) - 6) < 1e-12' },
        { name: 'the prediction matches the actual change to 0.1%', code: 'abs(predicted(g, dg_inv) / actual - 1) < 1e-3' },
        { name: t`the sign is right: shrinking $g^{\mu\nu}$ grows $\sqrt{-g}$`, code: 'predicted(np.diag([-1.0, 1, 1, 1]), -1e-3 * np.eye(4)) > 0' },
      ],
      hints: [t`\`np.linalg.det(g)\` is negative for a Lorentzian metric, so take \`np.sqrt(-np.linalg.det(g))\`.`, t`\`return -0.5 * sqrt_mg(g) * np.sum(g * dg_inv)\` — elementwise product, then sum, is the contraction $g_{\mu\nu}\delta g^{\mu\nu}$.`],
      teach: t`Jacobi’s formula, $\delta\sqrt{-g} = -\tfrac12\sqrt{-g}\,g_{\mu\nu}\delta g^{\mu\nu}$, is the first step of varying any action with a $\sqrt{-g}$ in it — gravity’s and matter’s alike.`,
      explain: t`The two agree to about one part in $10^6$, the size of the second-order term. The minus sign is the one that turns $-2\Lambda$ into $+\Lambda g_{\mu\nu}$ and gives $T_{\mu\nu}$ its sign convention.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron-star', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([3e17, 5e17, 8e17, 1e18]);
        const R = (8 * Math.PI * G * rho) / C ** 2, ans = 1 / Math.sqrt(R) / 1000;
        return {
          prompt: t`Near a neutron star’s centre the density is about $${tex(rho)}\ \text{kg/m}^3$. Ignoring pressure, $R = 8\pi G\rho/c^2$. What curvature radius $1/\sqrt R$ does that correspond to, in kilometres?`,
          visual: { type: 'graph', params: { x: [0, 20], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'radius (km)', ylabel: 'density (relative)', curves: [{ fn: '(1 - (x/12)^2)', domain: [0, 12], color: 'accent', width: 2.2 }], vlines: [{ x: 12, color: 'ink3', label: 'surface ≈ 12 km' }] }, caption: t`A schematic neutron-star density profile (not a solved model): the curvature scale inside is set by the central density.` },
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: 1 / R / 1000, feedback: t`$R$ has units of $1/\text{length}^2$: take the square root before inverting.` }, { value: Math.sqrt(R) * 1000, feedback: 'Inverted: the curvature radius is 1/√R.' }],
          hints: [t`$R = 8\pi\times${tex(G, 4)}\times${tex(rho)}/(${tex(C, 4)})^2$ in $\text{m}^{-2}$.`, t`Then $1/\sqrt R$ in metres, divided by $1000$.`],
          teach: 'Einstein’s equations convert density into curvature with the coupling 8πG/c²: at nuclear density the curvature radius shrinks to the star’s own size — the regime where general relativity is essential.',
          explain: t`$R = ${tex(R, 3)}\ \text{m}^{-2}$, so $1/\sqrt R \approx ${nice(ans, 3)}\ \text{km}$ — comparable to the star’s radius. Pressure at these densities is a sizeable fraction of $\rho c^2$ and changes $R = 8\pi G(\rho - 3p/c^2)/c^2$; the order of magnitude stands.`,
        };
      },
    }),
    mcq({
      id: 'cp-two-d', difficulty: 2,
      prompt: t`In two spacetime dimensions, $\displaystyle\int R\sqrt{|g|}\,d^2x$ is, by the Gauss–Bonnet theorem, $4\pi$ times the Euler characteristic of the surface. What does varying it give?`,
      visual: { type: 'gr-surface', params: {}, caption: t`Curved surfaces: in two dimensions, the integral of curvature depends only on topology.` },
      choices: [
        t`Nothing: the action does not change under any smooth variation, so it yields no field equations — two-dimensional gravity has no dynamics from this action`,
        t`$R = 0$ everywhere`,
        t`The same Einstein equations as in four dimensions`,
        t`$G_{\mu\nu} = 8\pi G\,T_{\mu\nu}$ with $G_{\mu\nu}$ replaced by $R_{\mu\nu}$`,
      ],
      answer: 0,
      why: {
        1: t`A topological invariant cannot be changed by a smooth variation, so it imposes no condition on $R$.`,
        2: t`In two dimensions $G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$ vanishes identically — there is no Einstein tensor to set equal to anything.`,
        3: t`$R_{\mu\nu} = \tfrac12Rg_{\mu\nu}$ in two dimensions; the variation is identically zero, not an equation.`,
      },
      hints: [t`Can a smooth change of the metric change the Euler characteristic?`],
      teach: t`In two dimensions the Einstein–Hilbert action is topological (Gauss–Bonnet): its variation vanishes identically and $G_{\mu\nu} \equiv 0$.`,
      explain: t`This is the variational shadow of $G_{\mu\nu} \equiv 0$ in 2D, worked out in [the Gauss–Bonnet theorem](#/lesson/st-c.C6.4). In three dimensions the action gives equations but no gravitational waves; four is the first dimension with propagating gravity.`,
    }),
    mcq({
      id: 'cp-which-variable', difficulty: 3,
      prompt: t`A student varies with respect to $g_{\mu\nu}$ instead of $g^{\mu\nu}$, using $\delta g^{\mu\nu} = -g^{\mu\alpha}g^{\nu\beta}\delta g_{\alpha\beta}$. What do they get?`,
      visual: { type: 'ten-metric', params: { mode: 'form', T: [[2, 0.5], [0.5, 1]], sliders: false, indicatrix: true, feed: false, showU: false, showV: false, crossings: false, readout: ['T', 'inv'], tname: 'g' }, caption: t`A metric and its inverse: one determines the other, so either can be the variable.` },
      choices: [
        t`$-G^{\alpha\beta} + 8\pi G\,T^{\alpha\beta} = 0$: the same equations with indices raised, because the map between $\delta g_{\mu\nu}$ and $\delta g^{\mu\nu}$ is invertible`,
        t`Different equations, because $g_{\mu\nu}$ and $g^{\mu\nu}$ are different fields`,
        t`$G_{\mu\nu} = -8\pi G\,T_{\mu\nu}$: gravity becomes repulsive`,
        t`No equations, because $\delta g_{\mu\nu}$ and $\delta g^{\mu\nu}$ cancel`,
      ],
      answer: 0,
      why: {
        1: t`They are two descriptions of one field; requiring $\delta S = 0$ for all $\delta g^{\mu\nu}$ is the same as for all $\delta g_{\mu\nu}$.`,
        2: t`Both the gravity and the matter terms flip sign together; the ratio is unchanged. (The definition of $T^{\mu\nu}$ by $\delta/\delta g_{\mu\nu}$ carries the opposite sign.)`,
        3: t`$\delta S$ is one expression; substituting one variation for the other just relabels it.`,
      },
      hints: [t`$\delta S = \int E_{\mu\nu}\delta g^{\mu\nu} = -\int E^{\alpha\beta}\delta g_{\alpha\beta}$.`, 'If one vanishes for all variations, so does the other.'],
      teach: 'Varying with respect to the metric or its inverse gives the same field equations, with indices moved and an overall sign that cancels.',
      explain: t`$E_{\mu\nu}\delta g^{\mu\nu} = -E^{\alpha\beta}\delta g_{\alpha\beta}$ with $E = G/16\pi G - T/2$. Conventions differ between books ($T^{\mu\nu} = +\tfrac{2}{\sqrt{-g}}\delta S_M/\delta g_{\mu\nu}$ is the same tensor); see [the sign table](#/lesson/st-g.G-SIG.2).`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §4.3 (the Hilbert action)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'York, Role of conformal three-geometry in the dynamics of gravitation, PRL 28, 1082 (1972)', url: 'https://doi.org/10.1103/PhysRevLett.28.1082' },
    { label: 'Gibbons & Hawking, Action integrals and partition functions in quantum gravity, PRD 15, 2752 (1977)', url: 'https://doi.org/10.1103/PhysRevD.15.2752' },
    { label: 'Lovelock, The Einstein tensor and its generalizations, J. Math. Phys. 12, 498 (1971)', url: 'https://doi.org/10.1063/1.1665613' },
    { label: 'Renn & Stachel, Hilbert’s foundation of physics (MPIWG preprint 118, 1999)', url: 'https://www.mpiwg-berlin.mpg.de/sites/default/files/Preprints/P118.pdf' },
  ],
});
