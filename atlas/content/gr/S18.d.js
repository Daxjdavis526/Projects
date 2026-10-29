// Gμν + Λgμν = 8πG Tμν, symbol by symbol — Derivation Mode. Each piece and
// why it is there: G_μν from the Bianchi identity (step 17), Λg_μν the only
// other term allowed (Lovelock), κ = 8πG/c⁴ fixed by Newton (step 19), T_μν
// from matter (step 16). Worked: the trace, R = 4Λ − κT, and the
// trace-reversed form R_μν = κ(T_μν − ½Tg_μν) + Λg_μν; for a fluid at rest
// R_00 = 4πG(ρ + 3p/c²)/c² − Λ, the dust ball of steps 15 and 18. Explore:
// source and Ricci components side by side. Practice: the trace, the ½ in
// G_μν, a neutron star's R_00, why Λg_μν keeps conservation, the 10¹²³ of
// the cosmological-constant problem (open), light's R_xx. Checkpoint: the
// radiation era's R = 0 (transfer), the trace-reversed form, n dimensions.
// Avoids gr.EQ.1's and gr.S18.i's items. Verified with SymPy (scratch v18.py).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, C, sci, ball, stressTable } from './_curvature.js';
import { table4 } from './_eq.js';

const t = String.raw;
const HBAR = 1.0546e-34;                                          // J s
const RHO_P = C ** 5 / (HBAR * G * G);                            // Planck density, kg/m³
const RHO_L = (1.1e-52 * C * C) / (8 * Math.PI * G);              // Λ as a mass density, kg/m³

// bars: the source T_μν (÷ ρc²) and the Ricci tensor R_μν (÷ κρc²) of a fluid at rest, in a local inertial frame
const BX = [0.3, 1.4, 2.5, 3.6], BX2 = [5.6, 6.7, 7.8, 8.9], BW = 0.8;
const SRC = ['1', 'w', 'w', 'w'];
const RIC = ['0.5*(1 + 3*w) - lam', '0.5*(1 - w) + lam', '0.5*(1 - w) + lam', '0.5*(1 - w) + lam'];
const SUB = ['₀₀', '₁₁', '₂₂', '₃₃'];
const bars = {
  x: [0, 10], y: [-2.5, 2.9], axes: false, grid: false, xlabel: '', ylabel: '',
  sliders: [
    { key: 'w', label: 'Pressure, $w = p/\\rho c^2$', min: -1, max: 1, step: 0.01, value: 0, explain: '0: dust. ⅓: light. −1: vacuum energy.' },
    { key: 'lam', label: 'Cosmological constant, $\\Lambda \\div \\kappa\\rho c^2$', min: 0, max: 1, step: 0.01, value: 0, explain: 'Λ measured against the matter’s own curvature scale, κρc² = 8πGρ/c².' },
  ],
  shade: [
    ...SRC.map((h, i) => ({ fn: h, lower: '0', from: BX[i], to: BX[i] + BW, color: i ? 'violet' : 'gold', alpha: 0.6 })),
    ...RIC.map((h, i) => ({ fn: h, lower: '0', from: BX2[i], to: BX2[i] + BW, color: i ? 'violet' : 'gold', alpha: 0.6 })),
  ],
  hlines: [{ y: 0, color: 'ink3' }],
  points: [
    ...SUB.map((s, i) => ({ x: BX[i] + 0.12, y: -2.25, r: 0.01, color: 'ink2', label: `T${s}` })),
    ...SUB.map((s, i) => ({ x: BX2[i] + 0.12, y: -2.25, r: 0.01, color: 'ink2', label: `R${s}` })),
    { x: 0.3, y: 2.75, r: 0.01, color: 'ink', label: 'source Tμν ÷ ρc²' },
    { x: 5.6, y: 2.75, r: 0.01, color: 'ink', label: 'curvature Rμν ÷ κρc²' },
  ],
  readouts: [
    { label: '$R_{00}/\\kappa\\rho c^2$', expr: '0.5*(1 + 3*w) - lam', digits: 3 },
    { label: '$R_{11}/\\kappa\\rho c^2$', expr: '0.5*(1 - w) + lam', digits: 3 },
    { label: '$R/\\kappa\\rho c^2$', expr: '1 - 3*w + 4*lam', digits: 3 },
    { label: 'a ball of test grains at rest: $\\ddot V/V \\div \\kappa\\rho c^4$', expr: '-(0.5*(1 + 3*w) - lam)', digits: 3 },
  ],
};

// taking a trace: the diagonal paired with the inverse metric
const traceTable = (caption) => table4({
  cells: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i === j ? `${i ? '+' : '−'}X${SUB[i]}` : ''))),
  colors: [0, 1, 2, 3].map(() => [0, 1, 2, 3].map(() => 'gold')),
  rowName: 'μ', colName: 'ν', dx: -14,
  caption,
});

// the Ricci scalar inside a star follows its density (a sketch)
const rProfile = {
  type: 'graph',
  params: {
    x: [0, 1.4], y: [0, 1.15], xlabel: 'distance from the centre ÷ the star’s radius', ylabel: 'R ÷ its central value',
    curves: [{ fn: 'exp(-6*x^2)', domain: [0, 1], color: 'gold', width: 2.4 }, { fn: '0', domain: [1, 1.4], color: 'gold', width: 2.4 }],
    vlines: [{ x: 1, label: 'surface', color: 'ink3' }],
  },
  caption: t`The Ricci scalar through a star (a sketch): largest at the centre, falling with the density, zero in the vacuum outside. Wherever it changes, $\partial_\nu R \neq 0$.`,
};

// densities on a logarithmic ladder (kg/m³)
const SUP = (k) => String(k).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
const LADDER = [['the universe today, on average: 8.5 × 10⁻²⁷', 8.5e-27], ['air: 1.2', 1.2], ['water: 1000', 1000], ['the Sun’s centre: 1.5 × 10⁵', 1.5e5], ['an atomic nucleus: 2.3 × 10¹⁷', 2.3e17]];
const ladder = {
  type: 'graph',
  params: {
    x: [0, 10], y: [-30, 22], axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['1', 't'], t: [-28, 20], color: 'ink3', width: 1.6 }, ...[-25, -20, -15, -10, -5, 0, 5, 10, 15, 20].map((k) => ({ param: ['0.8 + 0.4*t', `${k}`], t: [0, 1], color: 'ink4', width: 1 }))],
    points: [
      ...LADDER.map(([label, rho]) => ({ x: 1, y: +Math.log10(rho).toFixed(2), r: 4.5, color: 'gold', label: `${label} kg/m³`, labelDx: 12, labelDy: 4 })),
      ...[-25, -15, -5, 5, 15].map((k) => ({ x: 0.1, y: k, r: 0.01, color: 'ink3', label: `10${SUP(k)}`, labelDx: -2, labelDy: 4 })),
    ],
  },
  caption: 'Mass densities on a logarithmic ladder, each rung a factor of 10⁵. The universe’s mean density sits near the bottom; the vacuum energy that Λ stands for is about the same size.',
};

// empty space with only Λ: a ball of test grains (or a whole universe) grows exponentially
const H_L = C * Math.sqrt(1.1e-52 / 3), EFOLD = 1 / H_L / 3.156e16;   // e-folding time in Gyr
const lambdaOnly = {
  type: 'graph',
  params: {
    x: [0, 40], y: [0, 10], xlabel: 'time (Gyr)', ylabel: 'size ÷ starting size',
    curves: [{ fn: `cosh(x/${EFOLD.toFixed(3)})`, domain: [0, 40], color: 'accent', width: 2.6 }],
  },
  caption: t`A ball of test grains at rest in empty space with only the measured $\Lambda$: each axis grows as $\cosh(t/\tau)$, $\tau = 1/c\sqrt{\Lambda/3} \approx ${EFOLD.toFixed(1)}$ Gyr — slowly at first, then exponentially.`,
};

// the radiation era: the size of the universe grows as the square root of time
const radiationEra = {
  type: 'graph',
  params: {
    x: [0, 4], y: [0, 2.2], xlabel: 'time (arbitrary units)', ylabel: 'size of the universe, a',
    curves: [{ fn: 'sqrt(x)', domain: [0, 4], color: 'accent', width: 2.6 }],
  },
  caption: t`The universe's first tens of thousands of years, when light dominated: it grew as $a \propto \sqrt t$, expanding and decelerating.`,
};

export default lesson({
  id: 'gr.S18.d',
  title: 'Gμν + Λgμν = 8πG Tμν, symbol by symbol',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-obs', 'open'],
  intro: t`Every symbol in Einstein's equation is there for a reason. $G_{\mu\nu}$ because it is the curvature tensor whose divergence vanishes identically (step 17), as conservation of $T_{\mu\nu}$ demands. $\Lambda g_{\mu\nu}$ because it is the only other term that does the same: in four dimensions, Lovelock's theorem says these two are the only symmetric, divergence-free tensors built from the metric and its first two derivatives. $8\pi G/c^4$ because that is what makes slow matter obey Newton (step 19). And $T_{\mu\nu}$ is the matter (step 16).

Taking the trace turns the equation inside out, into a form that gives the Ricci tensor directly — and the Baez–Bunn dust ball of steps 15 and 18 drops out of its time–time component. $\Lambda$ itself is **measured** — the universe's expansion is accelerating — but what it is remains **open**.`,
  equation: t`G_{\mu\nu} + \Lambda g_{\mu\nu} = \frac{8\pi G}{c^4}T_{\mu\nu} \quad\Longleftrightarrow\quad R_{\mu\nu} = \frac{8\pi G}{c^4}\left(T_{\mu\nu} - \tfrac12 T g_{\mu\nu}\right) + \Lambda g_{\mu\nu}`,
  symbols: [
    { tex: 'G_{\\mu\\nu}', text: t`the Einstein tensor $R_{\mu\nu} - \tfrac12 R\,g_{\mu\nu}$, in m⁻²: curvature with zero divergence, $\nabla^\mu G_{\mu\nu} = 0$, for every metric` },
    { tex: '\\Lambda', text: t`the cosmological constant, in m⁻²: measured as about $1.1\times10^{-52}$ m⁻² from the accelerating expansion. It must be constant for $\nabla^\mu(\Lambda g_{\mu\nu})$ to vanish` },
    { tex: 'g_{\\mu\\nu}', text: t`the metric, the unknown the equations are solved for; $\nabla g = 0$, so $\Lambda g_{\mu\nu}$ is divergence-free` },
    { tex: '\\frac{8\\pi G}{c^4}', text: t`the coupling $\kappa = 2.08\times10^{-43}$ N⁻¹, converting stress–energy (J/m³) into curvature (m⁻²); fixed by the Newtonian limit` },
    { tex: 'T_{\\mu\\nu}', text: t`the stress–energy tensor of everything except $\Lambda$; $T = g^{\mu\nu}T_{\mu\nu}$ is its trace, $-\rho c^2 + 3p$ for a perfect fluid` },
    { tex: '\\mu,\\ \\nu', text: t`free indices, $0$–$3$: ten independent equations, since both sides are symmetric` },
  ],
  why: t`This is the equation that the rest of the Road solves: for the Sun (Schwarzschild), for the universe (Friedmann), for ripples (gravitational waves). The trace-reversed form is the practical one — in vacuum it is simply $R_{\mu\nu} = \Lambda g_{\mu\nu}$, or $R_{\mu\nu} = 0$.`,
  visual: {
    type: 'graph',
    title: 'Trace-reversed, component by component',
    lead: t`A fluid at rest in a local inertial frame has $T_{\mu\nu} = \operatorname{diag}(\rho c^2, p, p, p)$ (left bars, in units of $\rho c^2$). The trace-reversed equation turns it straight into the Ricci tensor, $R_{\mu\nu} = \kappa\left(T_{\mu\nu} - \tfrac12 T g_{\mu\nu}\right) + \Lambda g_{\mu\nu}$ (right bars, in units of $\kappa\rho c^2$). Gold: time–time. Violet: the three space directions.`,
    tasks: [
      'Dust (w = 0, Λ = 0): the source has only its corner, yet every diagonal entry of the Ricci tensor is ½ — matter curves the space directions too.',
      'Light (w = ⅓): the trace of T vanishes, the Ricci bars copy the source bars, and the scalar R is zero.',
      'Dust again, then raise Λ to ½: R₀₀ = 0 and a ball of grains neither shrinks nor grows — the balance Einstein built his static universe on in 1917.',
    ],
    params: bars,
    caption: 'Bars above the line are positive, below negative. The readout’s last line is the dust-ball rate of steps 15 and 18.',
  },
  example: {
    prompt: t`Rewrite $G_{\mu\nu} + \Lambda g_{\mu\nu} = \kappa T_{\mu\nu}$, with $\kappa = 8\pi G/c^4$, so that the Ricci tensor stands alone. Then read off its time–time component for a fluid at rest, and its space components for dust.`,
    visual: stressTable([['½ρc²', '', '', ''], ['', '½ρc²', '', ''], ['', '', '½ρc²', ''], ['', '', '', '½ρc²']], { caption: t`Dust at rest, in a local inertial frame: $T_{\mu\nu}$ has only its corner, $\rho c^2$, but $T_{\mu\nu} - \tfrac12 T g_{\mu\nu}$ — shown — puts half of it on every diagonal entry.` }),
    steps: [
      { label: 'Take the trace', text: t`Contract both sides with $g^{\mu\nu}$, using $g^{\mu\nu}R_{\mu\nu} = R$ and $g^{\mu\nu}g_{\mu\nu} = \delta^\mu{}_\mu = 4$: $R - \tfrac12R\cdot4 + 4\Lambda = \kappa T$, so $$R = 4\Lambda - \kappa T.$$` },
      { label: 'Substitute back', text: t`$R_{\mu\nu} = \kappa T_{\mu\nu} + \tfrac12R\,g_{\mu\nu} - \Lambda g_{\mu\nu} = \kappa T_{\mu\nu} + \left(2\Lambda - \tfrac12\kappa T\right)g_{\mu\nu} - \Lambda g_{\mu\nu}$, that is $$R_{\mu\nu} = \kappa\left(T_{\mu\nu} - \tfrac12 T g_{\mu\nu}\right) + \Lambda g_{\mu\nu}.$$` },
      { label: 'Empty space', text: t`With $T_{\mu\nu} = 0$: $R_{\mu\nu} = \Lambda g_{\mu\nu}$, and $R_{\mu\nu} = 0$ if $\Lambda = 0$ — the equation that is solved outside a star or black hole.` },
      { label: 'Time–time', text: t`A fluid at rest has $T = -\rho c^2 + 3p$ and $g_{00} = -1$: $R_{00} = \kappa\left(\rho c^2 - \tfrac12\rho c^2 + \tfrac32p\right) - \Lambda = \dfrac{4\pi G}{c^2}\left(\rho + \dfrac{3p}{c^2}\right) - \Lambda$. A ball of grains at rest has $\ddot V/V = -R_{00}c^2 = -4\pi G(\rho + 3p/c^2) + \Lambda c^2$: the dust ball of steps 15 and 18.` },
      { label: 'Space directions', text: t`$R_{xx} = \kappa\left(p + \tfrac12\rho c^2 - \tfrac32p\right) + \Lambda = \tfrac12\kappa(\rho c^2 - p) + \Lambda$. For dust it is $\tfrac12\kappa\rho c^2$: the source has no space entries, but the curvature does.` },
      { label: 'Sense check', text: t`Light has $T = 0$, so for it $R_{\mu\nu} = \kappa T_{\mu\nu}$ and $R = 0$ when $\Lambda = 0$. Dust with $\Lambda = 0$ gives $R = \kappa\rho c^2 = 8\pi G\rho/c^2$, the Ricci scalar of matter (step 15).` },
    ],
    answer: t`$R = 4\Lambda - \kappa T$ and $R_{\mu\nu} = \kappa\left(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}\right) + \Lambda g_{\mu\nu}$; at rest $R_{00} = 4\pi G(\rho + 3p/c^2)/c^2 - \Lambda$, and for dust $R_{xx} = 4\pi G\rho/c^2$.`,
  },
  practice: [
    mcq({
      id: 'trace', difficulty: 2,
      prompt: t`Take the trace of $G_{\mu\nu} + \Lambda g_{\mu\nu} = \kappa T_{\mu\nu}$ in four dimensions, where $G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$ and $T = g^{\mu\nu}T_{\mu\nu}$. What is $R$?`,
      choices: [t`$R = 4\Lambda - \kappa T$`, t`$R = \kappa T - 4\Lambda$`, t`$R = -\kappa T$`, t`$R = \Lambda - \kappa T$`],
      answer: 0,
      why: {
        1: t`The trace of $G_{\mu\nu}$ is $R - 2R = -R$, not $+R$: $-R + 4\Lambda = \kappa T$.`,
        2: t`The $\Lambda$ term has a trace too: $g^{\mu\nu}\Lambda g_{\mu\nu} = 4\Lambda$.`,
        3: t`$g^{\mu\nu}g_{\mu\nu} = \delta^\mu{}_\mu = 4$ in four dimensions, not 1.`,
      },
      hints: [t`$g^{\mu\nu}G_{\mu\nu} = R - \tfrac12R\cdot4 = -R$.`],
      teach: t`In four dimensions the trace of $G_{\mu\nu}$ is $-R$ and the trace of $g_{\mu\nu}$ is 4, so the field equations give $R = 4\Lambda - \kappa T$.`,
      explain: t`$g^{\mu\nu}$ on both sides: $-R + 4\Lambda = \kappa T$, so $R = 4\Lambda - \kappa T$. For dust and $\Lambda = 0$ that is $\kappa\rho c^2$; for light it is zero.`,
      visual: traceTable(t`Taking a trace in a local inertial frame: pair each component with the inverse metric, $g^{\mu\nu} = \operatorname{diag}(-1, 1, 1, 1)$, and add the diagonal. Applied to $g_{\mu\nu}$ itself this gives 4.`),
    }),
    num({
      id: 'coefficient', difficulty: 3,
      prompt: t`The contracted Bianchi identity is $\nabla^\mu R_{\mu\nu} = \tfrac12\nabla_\nu R$, and $\nabla^\mu g_{\mu\nu} = 0$. For what number $a$ is $R_{\mu\nu} - a\,R\,g_{\mu\nu}$ divergence-free for every metric?`,
      answer: 0.5, tol: { rel: 0, abs: 1e-6 },
      errors: [
        { value: 0.25, feedback: t`With $a = \tfrac14$ the tensor is traceless in four dimensions — a different property. Its divergence is $\tfrac14\nabla_\nu R$, not zero.` },
        { value: 1, feedback: t`The divergence is $(\tfrac12 - a)\nabla_\nu R$; with $a = 1$ it is $-\tfrac12\nabla_\nu R$.` },
      ],
      hints: [t`$\nabla^\mu(R_{\mu\nu} - aRg_{\mu\nu}) = \tfrac12\nabla_\nu R - a\nabla_\nu R$.`, t`It must vanish wherever $R$ changes, as inside every star.`],
      teach: t`The ½ in $G_{\mu\nu} = R_{\mu\nu} - \tfrac12Rg_{\mu\nu}$ is not a choice: it is the only coefficient that makes the divergence vanish.`,
      explain: t`$\nabla^\mu(R_{\mu\nu} - aRg_{\mu\nu}) = (\tfrac12 - a)\nabla_\nu R$, zero for every metric only if $a = \tfrac12$. Adding any multiple of $g_{\mu\nu}$ keeps it zero — that multiple is $\Lambda$.`,
      visual: rProfile,
    }),
    num({
      id: 'neutron-r00', difficulty: 2,
      gen(r) {
        const [rho, w] = r.pick([[7e17, 0.2], [5e17, 0.1], [1e18, 0.3]]);
        const R00 = ((4 * Math.PI * G) / (C * C)) * rho * (1 + 3 * w);
        return {
          prompt: t`In the core of a neutron star, take $\rho = ${sci(rho, 2)}$ kg/m³ and $p = ${w}\,\rho c^2$. Using $R_{00} = \dfrac{4\pi G}{c^2}\left(\rho + \dfrac{3p}{c^2}\right) - \Lambda$ (with $\Lambda$ utterly negligible here), what is $R_{00}$, in m⁻²? ($G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^8$ m/s.)`,
          answer: R00, units: 'm^-2', tol: { rel: 0.01 },
          errors: [
            { value: R00 / (1 + 3 * w), feedback: t`Pressure counts too: the source is $\rho + 3p/c^2 = ${fmt(1 + 3 * w, 2)}\rho$.` },
            { value: 2 * R00, feedback: t`Trace reversal leaves half: $\kappa\left(T_{00} - \tfrac12Tg_{00}\right) = \tfrac12\kappa(\rho c^2 + 3p)$, and $\tfrac12\kappa c^2 = 4\pi G/c^2$.` },
          ],
          hints: [t`$\rho + 3p/c^2 = ${fmt(1 + 3 * w, 2)}\times${sci(rho, 2)}$ kg/m³.`],
          teach: t`The time–time Ricci component inside matter is $4\pi G(\rho + 3p/c^2)/c^2$: pressure adds to the source, strongly so in a neutron star.`,
          explain: t`$R_{00} = ${sci(R00, 3)}$ m⁻², a curvature radius $1/\sqrt{R_{00}} \approx ${fmt(1 / Math.sqrt(R00) / 1e3, 2)}$ km — about the size of the star itself: gravity there is as strong as general relativity gets short of a black hole. Pressure supplies ${fmt((3 * w) / (1 + 3 * w) * 100, 2)}% of it.`,
          visual: ball({ mode: 'matter', rho, w, t: 0.6 }, t`A ball of test grains in matter as dense as a neutron star's core, shrinking from rest at the rate $\ddot V/V = -R_{00}c^2$ — within a fraction of a millisecond.`),
        };
      },
    }),
    mcq({
      id: 'lambda-conserved', difficulty: 2,
      prompt: t`Why can the term $\Lambda g_{\mu\nu}$ be added to Einstein's equation without spoiling energy–momentum conservation?`,
      choices: [
        t`Because $\nabla^\mu(\Lambda g_{\mu\nu}) = \Lambda\nabla^\mu g_{\mu\nu} = 0$: the metric is covariantly constant and $\Lambda$ is a constant`,
        t`Because $\Lambda$ is so small that its divergence can be neglected`,
        t`Because $\Lambda g_{\mu\nu}$ is part of $T_{\mu\nu}$, which is conserved anyway`,
        t`It does spoil it slightly, which is why $\Lambda$ must slowly change with time`,
      ],
      answer: 0,
      why: {
        1: t`Size has nothing to do with it: the divergence is exactly zero for any constant $\Lambda$, however large.`,
        2: t`It can be moved across as a vacuum stress–energy, but its divergence vanishes for its own reason: $\nabla g = 0$ and $\Lambda$ constant.`,
        3: t`A changing $\Lambda$ would break the identity: $\nabla^\mu(\Lambda g_{\mu\nu}) = \partial_\nu\Lambda \neq 0$. Models of changing dark energy need a field with its own stress–energy instead.`,
      },
      hints: [t`$\nabla_\lambda g_{\mu\nu} = 0$: the connection is built to keep the metric constant (step 11).`],
      teach: t`$\Lambda g_{\mu\nu}$ is divergence-free because $\nabla g = 0$ — but only if $\Lambda$ is a true constant.`,
      explain: t`$\nabla^\mu(\Lambda g_{\mu\nu}) = g_{\mu\nu}\nabla^\mu\Lambda + \Lambda\nabla^\mu g_{\mu\nu} = \partial_\nu\Lambda + 0$, which vanishes exactly when $\Lambda$ is constant. So the left side $G_{\mu\nu} + \Lambda g_{\mu\nu}$ stays divergence-free, as conservation of $T_{\mu\nu}$ requires.`,
      visual: lambdaOnly,
    }),
    num({
      id: 'lambda-problem', difficulty: 3,
      prompt: t`What is $\Lambda$? Counted as vacuum energy, it is a mass density $\rho_\Lambda = \Lambda c^2/8\pi G$, with $\Lambda = 1.1\times10^{-52}$ m⁻². A naive estimate from quantum fields, cut off at the Planck scale, gives instead the Planck density $\rho_P = c^5/\hbar G^2$ ($\hbar = 1.0546\times10^{-34}$ J s, $G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^8$ m/s). By how many orders of magnitude does the estimate exceed the measurement — what is $\log_{10}(\rho_P/\rho_\Lambda)$?`,
      answer: Math.log10(RHO_P / RHO_L), tol: { rel: 0, abs: 0.3 },
      errors: [
        { value: Math.log10(RHO_P), feedback: t`That is $\log_{10}\rho_P$ alone; subtract $\log_{10}\rho_\Lambda \approx ${fmt(Math.log10(RHO_L), 3)}$.` },
        { value: Math.log10(RHO_P / (1.1e-52 * C * C)), feedback: t`$\rho_\Lambda$ has the $8\pi G$ in its denominator: $\rho_\Lambda = \Lambda c^2/8\pi G$.` },
      ],
      hints: [t`$\rho_P = ${sci(RHO_P, 3)}$ kg/m³.`, t`$\rho_\Lambda = ${sci(RHO_L, 3)}$ kg/m³.`],
      teach: t`Measured, $\Lambda$ is a vacuum density of about $6\times10^{-27}$ kg/m³; the naive quantum estimate is some $10^{123}$ times larger. Nobody knows why — the cosmological-constant problem.`,
      explain: t`$\rho_P = ${sci(RHO_P, 3)}$ kg/m³ and $\rho_\Lambda = ${sci(RHO_L, 3)}$ kg/m³: a ratio of $10^{${fmt(Math.log10(RHO_P / RHO_L), 3)}}$, often called the worst prediction in physics. Lower cutoffs shrink the gap but do not close it. That $\Lambda$ acts — the expansion is accelerating — is measured; why it is so small, and whether it is truly constant, is open.`,
      visual: ladder,
    }),
    mcq({
      id: 'light-space', difficulty: 3,
      prompt: t`A gas of light at rest has $T_{\mu\nu} = \operatorname{diag}(\rho c^2, \rho c^2/3, \rho c^2/3, \rho c^2/3)$ in a local inertial frame. With $\Lambda = 0$, what is its $R_{xx} = \kappa\left(T_{xx} - \tfrac12Tg_{xx}\right)$?`,
      choices: [t`$\tfrac13\kappa\rho c^2$`, t`$\tfrac12\kappa\rho c^2$`, t`$\tfrac56\kappa\rho c^2$`, t`$0$`],
      answer: 0,
      why: {
        1: t`That is dust's value. Light's trace is $T = -\rho c^2 + 3\cdot\tfrac13\rho c^2 = 0$, so nothing is subtracted.`,
        2: t`That uses dust's trace, $-\rho c^2$. For light the pressure cancels it: $T = 0$.`,
        3: t`$R_{xx}$ vanishes only if both $T_{xx}$ and $T$ do; light's pressure, $\rho c^2/3$, is not zero.`,
      },
      hints: [t`First find the trace $T = -\rho c^2 + 3p$.`, t`With $T = 0$, $R_{xx} = \kappa T_{xx}$.`],
      teach: t`Light's stress–energy is traceless, so for radiation the trace-reversed equation is simply $R_{\mu\nu} = \kappa T_{\mu\nu}$.`,
      explain: t`$T = -\rho c^2 + \rho c^2 = 0$, so $R_{xx} = \kappa T_{xx} = \tfrac13\kappa\rho c^2$ — less than dust's $\tfrac12\kappa\rho c^2$, while light's $R_{00} = \kappa\rho c^2$ is twice dust's.`,
      visual: stressTable([['ρc²', '', '', ''], ['', 'ρc²/3', '', ''], ['', '', 'ρc²/3', ''], ['', '', '', 'ρc²/3']], { caption: 'A gas of light at rest: energy density in the corner, a third of it as pressure along each space direction.' }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-radiation', difficulty: 3, transfer: true,
      prompt: t`For its first fifty thousand years or so the universe was dominated by light, $p = \rho c^2/3$, and $\Lambda$ was negligible. What was the Ricci scalar $R$ of spacetime then?`,
      choices: [t`$0$, although spacetime was curved and expanding`, t`$8\pi G\rho/c^2$, as for any matter`, t`$-8\pi G\rho/c^2$, because pressure repels`, t`$32\pi G\rho/c^2$, counting the pressure three times`],
      answer: 0,
      why: {
        1: t`$8\pi G\rho/c^2$ is dust's value, from $T = -\rho c^2$. Light's trace is $-\rho c^2 + 3\cdot\tfrac13\rho c^2 = 0$.`,
        2: t`Positive pressure attracts; and the scalar comes from the trace, which here is zero.`,
        3: t`Pressure enters the trace once per space direction with the opposite sign to $\rho c^2$: for light they cancel exactly.`,
      },
      hints: [t`$R = 4\Lambda - \kappa T$ with $T = -\rho c^2 + 3p$.`, t`For light $T = 0$.`],
      teach: t`$R = 4\Lambda - \kappa T$, and light's $T$ is zero: a radiation-filled universe has $R = 0$, though its Ricci and Riemann tensors are not zero.`,
      explain: t`$R = -\kappa T = -\kappa(-\rho c^2 + \rho c^2) = 0$. Check it from the geometry: with $a \propto \sqrt t$, $R = 6(\ddot a/a + \dot a^2/a^2)/c^2 = 6(-\tfrac{1}{4t^2} + \tfrac{1}{4t^2})/c^2 = 0$. Yet $R_{00} = \kappa\rho c^2 \neq 0$: the expansion was decelerating.`,
      visual: radiationEra,
    }),
    mcq({
      id: 'cp-equivalent', difficulty: 3,
      prompt: t`Which equation says the same as $G_{\mu\nu} + \Lambda g_{\mu\nu} = \kappa T_{\mu\nu}$?`,
      choices: [
        t`$R_{\mu\nu} = \kappa\left(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}\right) + \Lambda g_{\mu\nu}$`,
        t`$R_{\mu\nu} = \kappa\left(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}\right) - \Lambda g_{\mu\nu}$`,
        t`$R_{\mu\nu} = \kappa\left(T_{\mu\nu} + \tfrac12Tg_{\mu\nu}\right) + \Lambda g_{\mu\nu}$`,
        t`$R_{\mu\nu} = \kappa T_{\mu\nu} + \Lambda g_{\mu\nu}$`,
      ],
      answer: 0,
      why: {
        1: t`Moving $\Lambda g_{\mu\nu}$ across gives $-\Lambda g_{\mu\nu}$, but the $\tfrac12Rg_{\mu\nu}$ brings back $+2\Lambda g_{\mu\nu}$ from $R = 4\Lambda - \kappa T$: the net is $+\Lambda g_{\mu\nu}$.`,
        2: t`$\tfrac12Rg_{\mu\nu}$ contributes $-\tfrac12\kappa Tg_{\mu\nu}$, since $R = 4\Lambda - \kappa T$.`,
        3: t`The $\tfrac12Rg_{\mu\nu}$ moved across carries the trace: $R_{\mu\nu} = \kappa T_{\mu\nu}$ holds only where $T = 0$, as for light.`,
      },
      hints: [t`$R_{\mu\nu} = \kappa T_{\mu\nu} + \tfrac12Rg_{\mu\nu} - \Lambda g_{\mu\nu}$, with $R = 4\Lambda - \kappa T$.`, t`$\tfrac12Rg_{\mu\nu} - \Lambda g_{\mu\nu} = (\Lambda - \tfrac12\kappa T)g_{\mu\nu}$.`],
      teach: t`The trace-reversed field equations, $R_{\mu\nu} = \kappa(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}) + \Lambda g_{\mu\nu}$, contain exactly the same information.`,
      explain: t`$R_{\mu\nu} = \kappa T_{\mu\nu} + \tfrac12(4\Lambda - \kappa T)g_{\mu\nu} - \Lambda g_{\mu\nu} = \kappa(T_{\mu\nu} - \tfrac12Tg_{\mu\nu}) + \Lambda g_{\mu\nu}$. Taking its trace returns $R = 4\Lambda - \kappa T$, so nothing is lost either way.`,
    }),
    num({
      id: 'cp-dimensions', difficulty: 3,
      gen(r) {
        const n = r.pick([3, 5, 6]);
        const b = 1 / (n - 2);
        return {
          prompt: t`In a spacetime of $n = ${n}$ dimensions, with $\Lambda = 0$, Einstein's equation $R_{\mu\nu} - \tfrac12Rg_{\mu\nu} = \kappa T_{\mu\nu}$ can also be trace-reversed (now $g^{\mu\nu}g_{\mu\nu} = n$). It becomes $R_{\mu\nu} = \kappa\left(T_{\mu\nu} - b\,T g_{\mu\nu}\right)$. What is $b$?`,
          answer: b, tol: { rel: 1e-3 },
          errors: [
            { value: 0.5, feedback: t`That is four dimensions. The trace is now $R - \tfrac n2R = \kappa T$.` },
            { value: 1 / n, feedback: t`Solve the trace first: $R = -\dfrac{2\kappa T}{n - 2}$, then $\tfrac12Rg_{\mu\nu} = -\dfrac{\kappa T}{n-2}g_{\mu\nu}$.` },
          ],
          hints: [t`Trace: $R\left(1 - \tfrac n2\right) = \kappa T$, so $R = -\dfrac{2\kappa T}{n-2}$.`, t`Then $R_{\mu\nu} = \kappa T_{\mu\nu} + \tfrac12Rg_{\mu\nu}$.`],
          teach: t`In $n$ dimensions the trace-reversed equation is $R_{\mu\nu} = \kappa(T_{\mu\nu} - \tfrac{1}{n-2}Tg_{\mu\nu})$; the ½ of our world is $1/(4 - 2)$.`,
          explain: t`$R = -2\kappa T/(n-2)$, so $R_{\mu\nu} = \kappa T_{\mu\nu} - \dfrac{\kappa T}{n-2}g_{\mu\nu}$: $b = \dfrac{1}{${n - 2}}${n === 3 ? ' = 1' : ` \\approx ${fmt(b, 3)}`}$. ${n === 3 ? 'In three dimensions the Ricci tensor, and so all of curvature, is fixed by the matter at each point: empty space is flat there.' : 'Only in four dimensions does the familiar ½ appear.'}`,
          visual: traceTable(t`Taking a trace, shown in four dimensions: pair each component with the inverse metric and add the diagonal. In $n$ dimensions the diagonal has $n$ entries, and $g^{\mu\nu}g_{\mu\nu} = n$.`),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, §4.2 (Einstein’s equation, its trace-reversed form) and §4.5 (the cosmological constant)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Baez & Bunn, The Meaning of Einstein’s Equation', url: 'https://arxiv.org/abs/gr-qc/0103044' },
    { label: 'Carroll, The Cosmological Constant (Living Reviews in Relativity, 2001)', url: 'https://arxiv.org/abs/astro-ph/0004075' },
  ],
});
