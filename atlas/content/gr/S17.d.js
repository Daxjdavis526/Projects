// Gμν and the Bianchi identity ∇μGμν = 0 — Derivation Mode. The Bianchi
// identity ∇_[λ R_ρσ]μν = 0 (why it holds: in coordinates where Γ = 0 at a
// point it is a cyclic sum of third derivatives of the metric that cancel),
// contracted twice to ∇^μR_μν = ½∇_νR and so ∇^μG_μν = 0 (worked example);
// what it demands of matter, ∇_μT^μν = 0, in flat spacetime and in an
// expanding universe (Explore: ρ ∝ a^−3(1+w)); why R_μν = κT_μν fails.
// Checkpoint: the CMB's energy density at recombination (transfer), the
// second contraction, and how many of the ten equations are independent.
// Avoids gr.EQ.6's and gr.S17.i's items. Contraction identities, the
// contracted Bianchi identity (3D test metric) and the FLRW identity verified
// with SymPy (scratch v17.py).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { sci } from './_curvature.js';
import { table4 } from './_eq.js';

const t = String.raw;
const U_CMB = 4.17e-14;                                           // J/m³, the CMB today (a T⁴ with T = 2.7255 K)

// the four index slots of R_ρσμν, with arcs joining the contracted pairs
function slots(pairs, caption) {
  const names = ['ρ', 'σ', 'μ', 'ν'], curves = [], points = [{ x: -0.62, y: 0.42, r: 0.01, color: 'ink', label: 'R' }];
  names.forEach((nm, k) => {
    for (const [a, b] of [[`${k}`, '0.8*t'], [`${k + 0.8}`, '0.8*t'], [`${k} + 0.8*t`, '0'], [`${k} + 0.8*t`, '0.8']]) curves.push({ param: [a, b], t: [0, 1], color: 'ink3', width: 1.4 });
    points.push({ x: k + 0.22, y: 0.42, r: 0.01, color: 'ink', label: nm });
  });
  pairs.forEach(([a, b, color], i) => {
    const cx = (a + b) / 2 + 0.4, rx = (b - a) / 2, h = 0.45 + 0.3 * i;
    curves.push({ param: [`${cx} + ${rx}*cos(t)`, `-${h}*sin(t)`], t: [0, 3.1416], color, width: 2.6 });
  });
  return {
    type: 'graph',
    params: { x: [-1, 4.2], y: [-1.3, 1.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, points },
    caption,
  };
}

// conservation in an expanding universe: log ρ against log a for pressure w = p/ρc²
const scaling = {
  type: 'graph',
  params: {
    x: [-2, 1], y: [-7, 12.5], axesAt: 'edge', xlabel: 'log₁₀ a (size of the universe ÷ today’s)', ylabel: 'log₁₀(ρ ÷ today’s ρ)',
    sliders: [{ key: 'w', label: 'Pressure, $w = p/\\rho c^2$', min: -1, max: 1, step: 0.01, value: 0, explain: '0: dust. ⅓: light. −1: vacuum energy. 1: the stiffest matter causality allows.' }],
    curves: [
      { fn: '-3*x', color: 'ink4', dash: true, label: 'dust', labelAt: -1.75, labelDy: -10 },
      { fn: '-4*x', color: 'ink4', dash: true, label: 'light', labelAt: -1.9, labelDy: 14 },
      { fn: '0', color: 'ink4', dash: true, label: 'vacuum energy', labelAt: 0.1, labelDy: -10 },
      { fn: '-3*(1 + w)*x', color: 'accent', width: 2.6 },
    ],
    readouts: [
      { label: '$\\rho \\propto a^{n}$, with $n = -3(1 + w)$', expr: '-3*(1 + w)', digits: 3 },
      { label: 'density factor when $a$ doubles', expr: '2^(-3*(1 + w))', digits: 3 },
      { label: 'energy in a box growing with space, $\\propto a^{-3w}$: factor when $a$ doubles', expr: '2^(-3*w)', digits: 3 },
    ],
  },
};

// the trace of a uniform star's stress–energy against distance from its centre
const traceProfile = {
  type: 'graph',
  params: {
    x: [0, 3], y: [-1.3, 0.5], xlabel: 'distance from the centre ÷ the star’s radius', ylabel: 'T ÷ ρc²',
    curves: [{ fn: '-1', domain: [0, 1], color: 'gold', width: 2.6 }, { fn: '0', domain: [1, 3], color: 'gold', width: 2.6 }],
    vlines: [{ x: 1, label: 'surface', color: 'ink3' }],
  },
  caption: t`The trace $T = -\rho c^2 + 3p$ of the stress–energy of a uniform star (pressure neglected), against distance from its centre: $-\rho c^2$ inside, zero in the empty space outside.`,
};

// dust streaming through a box
const flowBox = {
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [-2, 2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-1 + 2*t', '-1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1 + 2*t', '1'], t: [0, 1], color: 'ink', width: 2 },
      { param: ['-1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }, { param: ['1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 },
    ],
    arrows: [-1.6, -0.5, 0.5, 1.6].flatMap((y) => [-2.9, -0.4, 2.1].map((x) => ({ from: [x, y], to: [x + 0.8, y], color: 'gold' }))),
  },
  caption: t`Dust streaming through a box. $\partial_\mu T^{\mu\nu} = 0$ balances what changes inside against what flows through the walls — energy for $\nu = 0$, $x$-momentum for $\nu = x$.`,
};

// a rough sketch of the Sun's density, falling outward
const sunDensity = {
  type: 'graph',
  params: {
    x: [0, 1], y: [0, 160], xlabel: 'distance from the Sun’s centre ÷ its radius', ylabel: 'density (g/cm³)',
    curves: [{ fn: '150*exp(-10*x)', domain: [0, 1], color: 'gold', width: 2.4 }],
  },
  caption: t`The density inside the Sun, roughly: 150 g/cm³ at the centre, falling about $e$-fold every tenth of the radius (a sketch, not a solar model). The Ricci scalar $R = 8\pi G(\rho - 3p/c^2)/c^2$ falls with it.`,
};

// the cosmic microwave background's spectrum today: a 2.7255 K blackbody (x = hν/kT = ν / 56.79 GHz)
const cmbSpectrum = {
  type: 'graph',
  params: {
    x: [0, 700], y: [0, 1.6], xlabel: 'frequency (GHz)', ylabel: 'intensity (arbitrary units)',
    curves: [{ fn: '(x/56.79)^3/(exp(x/56.79) - 1)', domain: [1, 700], color: 'accent', width: 2.4 }],
  },
  caption: 'The spectrum of the cosmic microwave background today: the light of a 2.7255 K blackbody, brightest near 160 GHz.',
};

// the expanding universe: one region at two sizes, same particles
const twoBoxes = {
  type: 'graph',
  params: {
    x: [-0.4, 4.6], y: [-0.4, 2.4], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      ...[[0, 1], [2.2, 2]].flatMap(([x0, s]) => [
        { param: [`${x0} + ${s}*t`, '0'], t: [0, 1], color: 'ink3', width: 1.6 }, { param: [`${x0} + ${s}*t`, `${s}`], t: [0, 1], color: 'ink3', width: 1.6 },
        { param: [`${x0}`, `${s}*t`], t: [0, 1], color: 'ink3', width: 1.6 }, { param: [`${x0 + s}`, `${s}*t`], t: [0, 1], color: 'ink3', width: 1.6 },
      ]),
    ],
    points: [[0.25, 0.3], [0.7, 0.2], [0.5, 0.65], [0.2, 0.8], [0.8, 0.75]].flatMap(([u, v]) => [
      { x: u, y: v, r: 3.5, color: 'gold' }, { x: 2.2 + 2 * u, y: 2 * v, r: 3.5, color: 'gold' },
    ]),
  },
  caption: 'The same region of an expanding universe at two moments, the second when the universe is twice the size: eight times the volume, the same particles.',
};

export default lesson({
  id: 'gr.S17.d',
  title: 'Gμν and the Bianchi identity ∇μGμν = 0',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`The Riemann tensor obeys a differential identity for every metric whatsoever, the **Bianchi identity**: the derivative of curvature, summed cyclically, vanishes. Contract it twice and it says that one particular combination of the Ricci tensor and scalar has zero divergence — the **Einstein tensor** $G_{\mu\nu} = R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}$.

That is why $G_{\mu\nu}$, not $R_{\mu\nu}$, sits on the left of Einstein's equation. Matter's energy and momentum are conserved, $\nabla_\mu T^{\mu\nu} = 0$; set curvature equal to them and the geometry must be conserved too — and $G_{\mu\nu}$ is, identically.`,
  equation: t`\nabla_\lambda R_{\rho\sigma\mu\nu} + \nabla_\rho R_{\sigma\lambda\mu\nu} + \nabla_\sigma R_{\lambda\rho\mu\nu} = 0 \quad\Longrightarrow\quad \nabla^\mu G_{\mu\nu} = 0`,
  symbols: [
    { tex: 'R_{\\rho\\sigma\\mu\\nu}', text: t`the Riemann tensor with all four indices down, $g_{\rho\kappa}R^\kappa{}_{\sigma\mu\nu}$: antisymmetric in $\rho\sigma$ and in $\mu\nu$, symmetric under swapping the pairs` },
    { tex: '\\nabla_\\lambda', text: t`the covariant derivative along $x^\lambda$ (step 10). The identity cycles $\lambda \to \rho \to \sigma \to \lambda$ and keeps $\mu\nu$ fixed` },
    { tex: 'G_{\\mu\\nu}', text: t`the Einstein tensor, $R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}$, in m⁻²: symmetric, 10 components` },
    { tex: '\\nabla^\\mu', text: t`$g^{\mu\lambda}\nabla_\lambda$, the derivative with its index raised: $\nabla^\mu G_{\mu\nu}$ sums over $\mu$ — a divergence, one equation for each $\nu$` },
  ],
  why: t`$\nabla^\mu G_{\mu\nu} = 0$ holds for any metric, so Einstein's equation $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}/c^4$ forces $\nabla^\mu T_{\mu\nu} = 0$: the field equations themselves demand that energy and momentum be conserved, and fix how matter must move.`,
  visual: {
    type: 'graph',
    title: 'Conservation in an expanding universe',
    lead: t`In a universe of size $a(t)$, the $\nu = 0$ part of $\nabla_\mu T^{\mu\nu} = 0$ reads $\dot\rho = -3\dfrac{\dot a}{a}\left(\rho + \dfrac{p}{c^2}\right)$ — the first law of thermodynamics, $d(\rho c^2V) = -p\,dV$, for a box growing with space. Choose the pressure, $w = p/\rho c^2$, and see how the density falls as the universe grows. Both axes are logarithmic.`,
    tasks: [
      'Dust, w = 0: the density falls as a⁻³ — the same particles in a bigger box.',
      'Light, w = ⅓: a⁻⁴. The extra 1/a is the work its pressure does as the box grows: every photon is stretched to a longer wavelength.',
      'Vacuum energy, w = −1: the density never changes, and the energy in the box grows with its volume — negative pressure, so the expansion does work on it.',
    ],
    params: scaling.params,
    caption: 'Lines through today’s density (a = 1). Dashed: dust, light and vacuum energy for comparison.',
  },
  example: {
    prompt: t`Starting from the Bianchi identity $\nabla_\lambda R_{\rho\sigma\mu\nu} + \nabla_\rho R_{\sigma\lambda\mu\nu} + \nabla_\sigma R_{\lambda\rho\mu\nu} = 0$, show that $\nabla^\mu G_{\mu\nu} = 0$ for every metric.`,
    visual: slots([[1, 3, 'gold'], [0, 2, 'violet']], t`The two contractions: first $\sigma$ with $\nu$ (gold), one index from each antisymmetric pair, which gives the Ricci tensor; then $\rho$ with $\mu$ (violet), which gives the Ricci scalar.`),
    steps: [
      { label: 'Why it holds', text: t`At any point, coordinates can be chosen in which $\Gamma = 0$ there (step 12). Then $\nabla_\lambda = \partial_\lambda$ at the point, and $R_{\rho\sigma\mu\nu}$ is a sum of second derivatives of the metric; the cyclic sum of their derivatives cancels in pairs because partial derivatives commute. A tensor equation true in one coordinate system is true in all.` },
      { label: 'First contraction', text: t`Multiply by $g^{\nu\sigma}$ and sum; $\nabla g = 0$ lets it pass through the derivatives. Using the pair symmetries, $g^{\nu\sigma}R_{\rho\sigma\mu\nu} = R_{\rho\mu}$, $g^{\nu\sigma}R_{\sigma\lambda\mu\nu} = -R_{\lambda\mu}$, and the third term becomes $\nabla^\nu R_{\lambda\rho\mu\nu}$: $$\nabla_\lambda R_{\rho\mu} - \nabla_\rho R_{\lambda\mu} + \nabla^\nu R_{\lambda\rho\mu\nu} = 0.$$` },
      { label: 'Second contraction', text: t`Multiply by $g^{\rho\mu}$: the first term gives $\nabla_\lambda R$, the second $-\nabla^\mu R_{\lambda\mu}$, and, since $g^{\rho\mu}R_{\lambda\rho\mu\nu} = -R_{\lambda\nu}$, the third $-\nabla^\nu R_{\lambda\nu}$. So $\nabla_\lambda R - 2\nabla^\mu R_{\mu\lambda} = 0$, that is $$\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R.$$` },
      { label: 'The Einstein tensor', text: t`$\nabla^\mu G_{\mu\nu} = \nabla^\mu R_{\mu\nu} - \tfrac12\nabla^\mu(R\,g_{\mu\nu}) = \tfrac12\nabla_\nu R - \tfrac12\nabla_\nu R = 0$, using $\nabla^\mu g_{\mu\nu} = 0$. The Ricci tensor alone is not divergence-free; subtracting half its trace times the metric makes it so.` },
      { label: 'What matter must do', text: t`With $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}/c^4$, the identity forces $\nabla^\mu T_{\mu\nu} = 0$: four equations of motion for the matter, not added by hand but required by the field equations.` },
      { label: 'Sense check', text: t`For a flat expanding universe ($c = 1$), $G_{00} = 3\dot a^2/a^2$ and $G_{xx} = -(2a\ddot a + \dot a^2)$; the $\nu = 0$ part of the identity, $\partial_t G_{00} + 3\dfrac{\dot a}{a}\left(G_{00} + G_{xx}/a^2\right)$, is zero for every $a(t)$ — check it by differentiating.` },
    ],
    answer: t`Contracting twice gives $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$, so $\nabla^\mu G_{\mu\nu} = 0$ identically — and Einstein's equation then demands $\nabla^\mu T_{\mu\nu} = 0$.`,
  },
  practice: [
    mcq({
      id: 'contract-1', difficulty: 2,
      prompt: t`The Riemann tensor $R_{\rho\sigma\mu\nu}$ is antisymmetric in $\rho\sigma$ and in $\mu\nu$, and symmetric under swapping the two pairs; the Ricci tensor is $R_{\sigma\nu} = R^\lambda{}_{\sigma\lambda\nu}$. What is $g^{\nu\sigma}R_{\rho\sigma\mu\nu}$?`,
      choices: [t`$R_{\rho\mu}$`, t`$-R_{\rho\mu}$`, t`$0$`, t`$R$, the Ricci scalar`],
      answer: 0,
      why: {
        1: t`There are two sign flips, not one: $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu}$, and $g^{\nu\sigma}R_{\sigma\rho\mu\nu} = R^\nu{}_{\rho\mu\nu} = -R^\nu{}_{\rho\nu\mu} = -R_{\rho\mu}$.`,
        2: t`Zero comes from contracting two indices of the same antisymmetric pair. $\sigma$ and $\nu$ belong to different pairs.`,
        3: t`One contraction removes two indices and leaves two free ones, $\rho$ and $\mu$: a two-index tensor, not a number.`,
      },
      hints: [t`Swap the first pair to put $\sigma$ in front: $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu}$, then raise $\sigma$ with $g^{\nu\sigma}$.`],
      teach: t`Contracting one index from each antisymmetric pair of $R_{\rho\sigma\mu\nu}$ gives the Ricci tensor, up to a sign fixed by counting swaps.`,
      explain: t`$g^{\nu\sigma}R_{\rho\sigma\mu\nu} = -g^{\nu\sigma}R_{\sigma\rho\mu\nu} = -R^\nu{}_{\rho\mu\nu} = +R^\nu{}_{\rho\nu\mu} = R_{\rho\mu}$. This is the first contraction of the Bianchi identity.`,
      visual: slots([[1, 3, 'gold']], t`Contracting $\sigma$ (second slot) with $\nu$ (fourth): one index from each antisymmetric pair.`),
    }),
    mcq({
      id: 'normal-coords', difficulty: 3,
      prompt: t`Why does the Bianchi identity $\nabla_\lambda R_{\rho\sigma\mu\nu} + \nabla_\rho R_{\sigma\lambda\mu\nu} + \nabla_\sigma R_{\lambda\rho\mu\nu} = 0$ hold for every metric?`,
      choices: [
        t`At any point, coordinates exist with $\Gamma = 0$ there; the identity becomes a cyclic sum of third derivatives of the metric that cancel in pairs, and a tensor equation true in one coordinate system holds in all`,
        t`Because the Riemann tensor is antisymmetric in its last two indices, so any sum over them vanishes`,
        t`Because Einstein's equations make $T_{\mu\nu}$ conserved, and the curvature must follow`,
        t`It holds only in vacuum, where the Ricci tensor vanishes`,
      ],
      answer: 0,
      why: {
        1: t`The identity sums over $\lambda\rho\sigma$ cyclically with $\mu\nu$ held fixed; the antisymmetry in $\mu\nu$ plays no part.`,
        2: t`The logic runs the other way: the identity is pure geometry, true before any field equation; it is what forces $T_{\mu\nu}$ to be conserved.`,
        3: t`It holds for any metric at all, curved by matter or not.`,
      },
      hints: [t`In coordinates with $\Gamma = 0$ at a point, $\nabla_\lambda = \partial_\lambda$ there, and $R_{\rho\sigma\mu\nu} = \tfrac12\left(\partial_\mu\partial_\sigma g_{\rho\nu} - \partial_\mu\partial_\rho g_{\sigma\nu} - \partial_\nu\partial_\sigma g_{\rho\mu} + \partial_\nu\partial_\rho g_{\sigma\mu}\right)$.`, t`Write out the cyclic sum: every third derivative of $g$ appears twice, with opposite signs.`],
      teach: 'The Bianchi identity is geometry, not physics: at each point it reduces to cancelling third derivatives of the metric, so it holds for every metric.',
      explain: t`At the chosen point, $\partial_\lambda R_{\rho\sigma\mu\nu}$ is $\tfrac12\partial_\lambda$ of four second derivatives of $g$; adding the two cyclic permutations, each third derivative such as $\partial_\lambda\partial_\mu\partial_\sigma g_{\rho\nu}$ meets its partner with the opposite sign. Both sides are tensors, so the identity holds everywhere, in every coordinate system.`,
    }),
    mcq({
      id: 'why-not-r', difficulty: 3,
      prompt: t`Suppose the field equation were $R_{\mu\nu} = \kappa T_{\mu\nu}$, with $\kappa$ a constant. Take $\nabla^\mu$ of both sides, using $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$ and conservation $\nabla^\mu T_{\mu\nu} = 0$. What follows?`,
      choices: [
        t`$\partial_\nu R = 0$, so $T = g^{\mu\nu}T_{\mu\nu} = R/\kappa$ would be the same everywhere — inside a star and in the empty space around it alike`,
        t`Nothing: the equation is consistent, just less elegant`,
        t`$T_{\mu\nu}$ must vanish everywhere`,
        t`The metric must be flat`,
      ],
      answer: 0,
      why: {
        1: t`It is not consistent: the left side's divergence is $\tfrac12\nabla_\nu R$, which conservation forces to vanish, and then the trace of $T$ is pinned to one value throughout spacetime.`,
        2: t`Only the trace is constrained: it must be the same everywhere, not zero. But that is already absurd for a star in empty space.`,
        3: t`Flat spacetime would satisfy it, but so would some curved ones; the real trouble is the condition on matter, a trace the same everywhere.`,
      },
      hints: [t`$\nabla^\mu R_{\mu\nu} = \kappa\nabla^\mu T_{\mu\nu} = 0$, so $\nabla_\nu R = 0$.`, t`Taking the trace of $R_{\mu\nu} = \kappa T_{\mu\nu}$ gives $R = \kappa T$.`],
      teach: t`$R_{\mu\nu} = \kappa T_{\mu\nu}$ would force the trace $T$ to be constant everywhere; subtracting $\tfrac12 R\,g_{\mu\nu}$ removes the contradiction.`,
      explain: t`$0 = \kappa\nabla^\mu T_{\mu\nu} = \nabla^\mu R_{\mu\nu} = \tfrac12\partial_\nu R$, so $R$, and with it $T = -\rho c^2 + 3p$, would be the same everywhere: impossible with a star surrounded by vacuum. Einstein's field equation of 11 November 1915 had this form and worked only by assuming $T = 0$ for all matter; two weeks later he added the trace term.`,
      visual: traceProfile,
    }),
    mcq({
      id: 'flat-conservation', difficulty: 2,
      prompt: t`For slow dust in flat spacetime, $T^{0x} = \rho c v_x$ and $T^{jx} = \rho v_j v_x$ (with $x^0 = ct$). What does the $\nu = x$ component of $\partial_\mu T^{\mu\nu} = 0$ say?`,
      choices: [
        t`$\partial_t(\rho v_x) + \partial_j(\rho v_j v_x) = 0$: the $x$-momentum in any region changes only by what flows through its walls — dust moving with no force on it`,
        t`$\partial_t\rho + \partial_j(\rho v_j) = 0$: mass is conserved`,
        t`$\partial_t(\rho c^2) = 0$: the energy density never changes`,
        t`$v_x = 0$: dust must stay at rest`,
      ],
      answer: 0,
      why: {
        1: t`That is the $\nu = 0$ component (divided by $c$): conservation of energy, which for slow dust is conservation of mass.`,
        2: t`The energy density changes as dust flows in and out; the $\nu = 0$ equation balances it against the flow $\partial_j T^{j0}$.`,
        3: t`Moving dust conserves its momentum just as well; the equation only forbids momentum appearing from nowhere.`,
      },
      hints: [t`$\partial_\mu T^{\mu x} = \tfrac1c\partial_t T^{0x} + \partial_j T^{jx}$.`],
      teach: t`In flat spacetime $\partial_\mu T^{\mu\nu} = 0$ is four conservation laws: energy for $\nu = 0$, momentum for $\nu = x, y, z$.`,
      explain: t`$\tfrac1c\partial_t(\rho c v_x) + \partial_j(\rho v_j v_x) = 0$. Combined with mass conservation it becomes $\rho(\partial_t + v_j\partial_j)v_x = 0$: each bit of dust keeps its velocity. In curved spacetime $\nabla_\mu$ adds $\Gamma$ terms, and the same law makes dust follow geodesics — gravity enters through the connection.`,
      visual: flowBox,
    }),
    num({
      id: 'scaling', difficulty: 3,
      gen(r) {
        const [what, w, wTeX] = r.pick([['a network of cosmic strings', -1 / 3, t`-\tfrac13`], ['stiff matter, the most incompressible kind causality allows', 1, '1'], ['dust', 0, '0']]);
        const f = 2 ** (-3 * (1 + w));
        return {
          prompt: t`In a universe of size $a(t)$, the $\nu = 0$ part of $\nabla_\mu T^{\mu\nu} = 0$ reads $\dot\rho = -3\dfrac{\dot a}{a}\left(\rho + \dfrac{p}{c^2}\right)$. For ${what}, with $p = w\rho c^2$ and $w = ${wTeX}$, solve it: by what factor does $\rho$ change while the universe doubles in size?`,
          answer: f, tol: { rel: 0.01 },
          errors: [
            ...(w !== 0 ? [{ value: 1 / 8, feedback: t`That is dust, $w = 0$. The pressure term adds $3w$ to the exponent: $\rho \propto a^{-3(1+w)}$.` }] : []),
            { value: 2 ** (3 * (1 + w)), feedback: 'The density falls (or stays fixed) as the universe grows: the exponent is negative.' },
          ],
          hints: [t`$\dfrac{d\rho}{\rho} = -3(1 + w)\dfrac{da}{a}$, so $\rho \propto a^{-3(1+w)}$.`, t`The factor is $2^{-3(1+w)}$.`],
          teach: t`Energy conservation in an expanding universe gives $\rho \propto a^{-3(1+w)}$: dust $a^{-3}$, light $a^{-4}$, vacuum energy constant.`,
          explain: t`$\rho \propto a^{-3(1+w)} = a^{${fmt(-3 * (1 + w), 3)}}$, so doubling $a$ multiplies $\rho$ by $2^{${fmt(-3 * (1 + w), 3)}} = ${fmt(f, 3)}$. ${w > 0 ? 'Positive pressure does work as the box grows, so the density falls faster than the dilution of particles alone.' : w < 0 ? 'Negative pressure means the expansion does work on the contents, so the density falls more slowly than for dust.' : 'No pressure, no work: the same particles simply spread through eight times the volume.'}`,
          visual: twoBoxes,
        };
      },
    }),
    mcq({
      id: 'ricci-div', difficulty: 2,
      prompt: t`Inside the Sun, Einstein's equations give $R = 8\pi G(\rho - 3p/c^2)/c^2$, and the density falls from the centre outward. The contracted Bianchi identity says $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$. Is the Ricci tensor divergence-free there?`,
      choices: [
        t`No: $R$ changes with radius, so $\nabla^\mu R_{\mu\nu} = \tfrac12\partial_\nu R \neq 0$ — only $G_{\mu\nu}$ is divergence-free`,
        t`Yes: every curvature tensor is divergence-free`,
        t`Yes, because the Sun is static`,
        t`No, because energy is not conserved inside a star`,
      ],
      answer: 0,
      why: {
        1: t`Only the combination $G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$ is; $R_{\mu\nu}$ alone has divergence $\tfrac12\nabla_\nu R$.`,
        2: t`Static means no change in time; the radial component $\tfrac12\partial_r R$ is still non-zero.`,
        3: t`Energy is conserved, $\nabla^\mu T_{\mu\nu} = 0$, and so $\nabla^\mu G_{\mu\nu} = 0$; it is $R_{\mu\nu}$ by itself that has a divergence.`,
      },
      hints: [t`What is $\partial_r R$ where the density falls with radius?`],
      teach: t`The Ricci tensor's divergence is half the gradient of the Ricci scalar: non-zero wherever matter's density varies, as inside every star.`,
      explain: t`$R$ follows the density, so $\partial_r R \neq 0$ and $\nabla^\mu R_{\mu r} = \tfrac12\partial_r R \neq 0$. Subtracting $\tfrac12 R\,g_{\mu\nu}$ cancels exactly this: $\nabla^\mu G_{\mu\nu} = \tfrac12\partial_\nu R - \tfrac12\partial_\nu R = 0$.`,
      visual: sunDensity,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cmb', difficulty: 3, transfer: true,
      gen(r) {
        const [s, when, T] = r.pick([[1100, 'when the background was released, at 1/1100 of the present size', 2998], [10, 'when the first galaxies were forming, at a tenth of the present size', 27]]);
        const u = U_CMB * s ** 4;
        return {
          prompt: t`The cosmic microwave background is a gas of light, $p = \rho c^2/3$, with energy density $4.17\times10^{-14}$ J/m³ today. In an expanding universe of size $a$, the time component of $\nabla_\mu T^{\mu\nu} = 0$ reads $\dot\rho = -3\dfrac{\dot a}{a}\left(\rho + \dfrac{p}{c^2}\right)$. What was its energy density ${when}?`,
          answer: u, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [
            { value: U_CMB * s ** 3, feedback: t`That treats the light as dust. Its pressure, $\rho c^2/3$, makes the density fall as $a^{-4}$, not $a^{-3}$.` },
            { value: U_CMB / s ** 4, feedback: 'The universe was smaller then, so the light was denser, not thinner.' },
          ],
          hints: [t`With $p = \rho c^2/3$: $\dot\rho/\rho = -4\dot a/a$, so $\rho \propto a^{-4}$.`, t`Multiply today's value by ${s}⁴.`],
          teach: t`Conservation $\nabla_\mu T^{\mu\nu} = 0$ makes light's energy density scale as $a^{-4}$: $a^{-3}$ from dilution, one more $a^{-1}$ from the stretching of each photon.`,
          explain: t`$\rho \propto a^{-4}$, so the density was $${s}^4 = ${sci(s ** 4, 3)}$ times today's: $${sci(u, 3)}$ J/m³. With $u \propto T^4$ the temperature was ${s} times today's 2.7255 K, about ${T} K${s === 1100 ? ' — just cool enough for hydrogen atoms to form and the light to go free' : ''}.`,
          visual: cmbSpectrum,
        };
      },
    }),
    mcq({
      id: 'cp-contract-2', difficulty: 3,
      prompt: t`After one contraction the Bianchi identity reads $\nabla_\lambda R_{\rho\mu} - \nabla_\rho R_{\lambda\mu} + \nabla^\nu R_{\lambda\rho\mu\nu} = 0$. Contract it with $g^{\rho\mu}$, using $g^{\rho\mu}R_{\lambda\rho\mu\nu} = -R_{\lambda\nu}$. What do you get?`,
      choices: [t`$\nabla_\lambda R - 2\nabla^\mu R_{\mu\lambda} = 0$`, t`$\nabla_\lambda R = 0$`, t`$\nabla_\lambda R - \nabla^\mu R_{\mu\lambda} = 0$`, t`$2\nabla_\lambda R - \nabla^\mu R_{\mu\lambda} = 0$`],
      answer: 0,
      why: {
        1: t`The second and third terms do not cancel: both become $-\nabla^\mu R_{\mu\lambda}$ (the Ricci tensor is symmetric), and they add.`,
        2: t`The third term contributes too: $g^{\rho\mu}\nabla^\nu R_{\lambda\rho\mu\nu} = -\nabla^\nu R_{\lambda\nu}$, the same as the second.`,
        3: t`Only the first term produces $R$: $g^{\rho\mu}R_{\rho\mu} = R$, once.`,
      },
      hints: [t`$g^{\rho\mu}\nabla_\lambda R_{\rho\mu} = \nabla_\lambda R$ and $g^{\rho\mu}\nabla_\rho R_{\lambda\mu} = \nabla^\mu R_{\lambda\mu}$.`, t`The third term gives $-\nabla^\nu R_{\lambda\nu}$, the same as the second.`],
      teach: t`The doubly contracted Bianchi identity, $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$, is what makes $G_{\mu\nu}$ divergence-free.`,
      explain: t`$\nabla_\lambda R - \nabla^\mu R_{\lambda\mu} - \nabla^\nu R_{\lambda\nu} = \nabla_\lambda R - 2\nabla^\mu R_{\mu\lambda} = 0$, so $\nabla^\mu R_{\mu\lambda} = \tfrac12\nabla_\lambda R$ — and therefore $\nabla^\mu\left(R_{\mu\lambda} - \tfrac12 R\,g_{\mu\lambda}\right) = 0$.`,
      visual: slots([[0, 2, 'violet']], t`The second contraction: $\rho$ (first slot) with $\mu$ (third), again one index from each pair.`),
    }),
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5, 6]);
        const all = (n * (n + 1)) / 2, indep = all - n;
        return {
          prompt: t`In a spacetime of $n = ${n}$ dimensions, Einstein's equation $G_{\mu\nu} = 8\pi G\,T_{\mu\nu}/c^4$ is one equation for each independent component of the symmetric tensor $G_{\mu\nu}$. The Bianchi identity $\nabla^\mu G_{\mu\nu} = 0$ holds automatically, one relation for each value of $\nu$. How many of the equations are left to determine the metric?`,
          answer: indep, tol: { rel: 0, abs: 0.5 },
          errors: [
            { value: all, feedback: t`That counts all the components; the $n$ Bianchi relations hold whatever the metric, so they remove $n$.` },
            { value: n * n - n, feedback: t`$G_{\mu\nu}$ is symmetric: it has $n(n+1)/2$ components, not $n^2$.` },
          ],
          hints: [t`A symmetric $n\times n$ array has $n(n+1)/2$ independent entries.`, t`Subtract the $n$ Bianchi relations.`],
          teach: 'Einstein’s equations are n(n + 1)/2 equations, but the n Bianchi identities leave only n(n − 1)/2 to fix the metric — the rest of it is the freedom to choose coordinates.',
          explain: t`$n(n+1)/2 - n = ${all} - ${n} = ${indep}$. The missing ${n} match the ${n} functions of coordinate freedom, $x^\mu \to x'^\mu(x)$: the metric's ${all} components are fixed only up to a change of coordinates. In our ${n === 4 ? '' : 'four-dimensional '}spacetime, ${n === 4 ? 'that is 10 − 4 = 6' : '10 − 4 = 6'}.`,
          visual: table4({
            cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (j >= i ? `G${'₀₁₂₃'[i]}${'₀₁₂₃'[j]}` : ''))),
            colors: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? 'gold' : 'accent'))),
            rowName: 'μ', colName: 'ν', dx: -12,
            caption: t`In four dimensions: the independent entries of the symmetric tensor $G_{\mu\nu}$, the diagonal and above; the empty cells repeat them.`,
          }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §3.6 (the Bianchi identity) and §4.2 (Einstein’s equation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'History of general relativity: the field equations of November 1915', url: 'https://en.wikipedia.org/wiki/History_of_general_relativity' },
  ],
});
