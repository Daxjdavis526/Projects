// Four constraints and six evolution equations — a concept lesson. The 3+1
// split ds² = −α²dt² + γᵢⱼ(dxⁱ + βⁱdt)(dxʲ + βʲdt) (G = c = 1): lapse α (proper
// time between slices along the normal, dτ = α dt), shift βⁱ (how spatial
// labels slide), spatial metric γᵢⱼ (6) and extrinsic curvature Kᵢⱼ (6).
// Einstein's 10 equations: the Hamiltonian constraint (1) and momentum
// constraint (3) hold no second time derivatives (the contracted Bianchi
// identity) — elliptic conditions on each slice; 6 evolution equations for Kᵢⱼ,
// with ∂ₜγᵢⱼ = −2αKᵢⱼ + Dᵢβⱼ + Dⱼβᵢ; α, β free (gauge, 4 functions). Counting
// per point, in D spacetime dimensions: D(D − 3)/2 polarizations — 2 for
// D = 4, none in 2+1 gravity. PDE view: data solved (elliptic), then evolved
// (hyperbolic, once a good formulation and gauge are chosen — B15.2, B15.3).
// Transfers: a neutron star's surface lapse; the Maxwell analogy (A₀ as a
// Lagrange multiplier). Avoids gr.S29.i's 12 − 4 − 4 count in the same words,
// its excess radius and its FLRW toy, and gr.S32.d's Painlevé–Gullstrand slice.
import { lesson, mcq, num, match, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const GOURGOULHON = { label: 'É. Gourgoulhon, 3+1 Formalism and Bases of Numerical Relativity, lecture notes, arXiv:gr-qc/0703035 (2007)', url: 'https://arxiv.org/abs/gr-qc/0703035' };
const ADM = { label: 'R. Arnowitt, S. Deser & C. W. Misner, The dynamics of general relativity (1962), reprinted in Gen. Relativ. Gravit. 40, 1997 (2008)', url: 'https://doi.org/10.1007/s10714-008-0661-1' };
const ALCUBIERRE = { label: 'M. Alcubierre, Introduction to 3+1 Numerical Relativity (Oxford University Press, 2008), ch. 2', url: 'https://doi.org/10.1093/acprof:oso/9780199205677.001.0001' };
const GM_KM = 1.477;             // GM☉/c² in km

// slices drawn at the proper time their normal observers have lived (schematic, Euclidean drawing)
const lapse = (x) => `(1 - (1 - A)*exp(-(${x})^2/1.5))`;
const slices = ({ A = 0.3, B = 0.2, sliders = false, caption }) => ({
  type: 'graph',
  params: {
    x: [-5, 5], y: [0, 5.8], aspect: 'wide', axesAt: 'edge', xlabel: 'x (space)', ylabel: 'proper time along the normals', grid: false, xticks: 0, yticks: 0,
    ...(sliders ? {
      sliders: [
        { key: 'A', label: 'Lapse $\\alpha$ at the centre', min: 0.05, max: 1, step: 0.01, value: A, explain: 'Proper time that passes there per coordinate step, as a fraction of the time far away.' },
        { key: 'B', label: 'Shift $\\beta$', min: -0.6, max: 0.6, step: 0.01, value: B, explain: 'How far the spatial coordinate labels slide sideways per step.' },
      ],
      readouts: [{ label: 'proper time per step at the centre', expr: 'A', digits: 3 }, { label: 'far away', expr: '1', digits: 1 }],
    } : { constants: { A, B } }),
    curves: [
      ...[1, 2, 3, 4, 5].map((n) => ({ fn: `${n}*${lapse('x')}`, color: 'accent', width: 2.2 })),
      ...[-4, -2, 0, 2, 4].map((x0) => ({ param: [`${x0} + B*t`, `t*${lapse(`${x0} + B*t`)}`], t: [0, 5], color: 'gold', dash: [5, 4], width: 1.4 })),
    ],
    points: [{ x: -4.9, y: 1, r: 0, label: 't = 1', color: 'accent', labelDy: -10 }, { x: -4.9, y: 5, r: 0, label: 't = 5', color: 'accent', labelDy: -10 }],
  },
  caption: caption ?? 'A teaching sketch in one space dimension, drawn as if spacetime were a flat sheet of paper. Blue: five slices (moments), each drawn at the proper time its normal observers have lived. Gold dashed: where five spatial coordinate labels go from slice to slice.',
});

export default lesson({
  id: 'st-b.B15.1',
  kind: 'concept',
  title: 'Four constraints and six evolution equations',
  minutes: 13, difficulty: 3,
  intro: t`To solve Einstein’s equations as an initial-value problem, cut spacetime into a stack of spatial slices — moments $t = $ const — and ask how one slice turns into the next. In units with $G = c = 1$ the metric is written in **3+1 form**,

$$ds^2 = -\alpha^2\,dt^2 + \gamma_{ij}\,\big(dx^i + \beta^i dt\big)\big(dx^j + \beta^j dt\big),$$

with Latin indices running over space (1–3) and summed when repeated. The unknowns on a slice are its geometry $\gamma_{ij}$ (6 functions) and how fast that geometry changes, the **extrinsic curvature** $K_{ij}$ (6 more). Einstein’s ten equations then split exactly like Maxwell’s: **four constraints** — the Hamiltonian constraint and the three momentum constraints — contain no second time derivatives and restrict what a slice may look like; **six evolution equations** say how $K_{ij}$ changes (with $\partial_t\gamma_{ij} = -2\alpha K_{ij} + D_i\beta_j + D_j\beta_i$ defining it). The lapse $\alpha$ and shift $\beta^i$ appear in no equation of their own: they are four functions **you choose** — the gauge. As PDEs: solve elliptic equations for the first slice, then march hyperbolic ones forward.`,
  symbols: [
    { tex: '\\alpha', text: 'the **lapse**: proper time elapsed between neighbouring slices, per unit of coordinate time, for observers moving along the slice’s normal ($d\\tau = \\alpha\\,dt$)' },
    { tex: '\\beta^i', text: 'the **shift**: how far the spatial coordinate labels slide, per unit $t$, relative to those normal observers' },
    { tex: '\\gamma_{ij}', text: 'the spatial metric: distances measured within one slice (a symmetric 3×3 matrix, 6 functions)' },
    { tex: 'K_{ij}', text: 'the extrinsic curvature: how the slice is bent inside spacetime — equivalently, how fast $\\gamma_{ij}$ changes along the normal (6 functions)' },
    { tex: 'D_i', text: 'the covariant derivative of the slice’s own geometry $\\gamma_{ij}$' },
    { tex: 'dx^i,\\ dt', text: 'coordinate displacements in space and time' },
  ],
  why: t`This is the starting point of every numerical-relativity code that has computed a binary-black-hole waveform for LIGO, Virgo and KAGRA. The Road to Einstein tells the same story physically in [constraints and evolution](#/lesson/gr.S29.i) and [colliding black holes on a computer](#/lesson/gr.S32.i); here the question is the mathematician’s — what kind of PDE system is this?`,
  visual: {
    type: 'graph',
    title: 'Lapse and shift',
    lead: t`Five slices of a spacetime, each drawn at the proper time that observers moving along its normals have lived. The lapse sets how far apart the slices are; the shift sets how the coordinate labels (gold) drift from one slice to the next.`,
    tasks: [
      t`Lower the lapse at the centre: the slices bunch up there — time is “held back” where it is slowed, the trick codes use near black holes to keep slices away from the singularity.`,
      t`Change the shift: the slices do not move at all; only the labels slide. Same spacetime, different coordinates.`,
      t`Set $\alpha = 1$, $\beta = 0$: flat, evenly spaced slices with labels going straight up.`,
    ],
    ...slices({ sliders: true }),
  },
  example: {
    prompt: t`Count. How many functions per point does a slice carry; how many conditions restrict them; how many are free choices of coordinates; and how many physical degrees of freedom are left?`,
    visual: slices({ A: 0.35, B: 0.25, caption: 'Each slice carries γᵢⱼ and Kᵢⱼ at every point; the lapse and shift (here a dip and a drift) are chosen, not solved for. Schematic.' }),
    steps: [
      { label: 'Data on a slice', text: t`$\gamma_{ij}$ and $K_{ij}$ are symmetric: $3\times4/2 = 6$ components each, so **12 functions** per point.` },
      { label: 'Constraints', text: t`The Hamiltonian constraint (1 equation) and momentum constraints (3) must hold on every slice: **4 conditions**. Like Gauss’s law, the evolution carries them along once they hold initially.` },
      { label: 'Gauge', text: t`Four coordinate functions can be redefined freely — one time, three space. They use up **4 more** of the 12 (the lapse and shift say how they change).` },
      { label: 'What is left', text: t`$12 - 4 - 4 = 4$ numbers per point, which pair up as values and rates of change: **2 degrees of freedom** — the two polarizations, $+$ and $\times$, of a gravitational wave.` },
      { label: 'The PDE types', text: t`The constraints are elliptic (in a weak field the Hamiltonian constraint becomes Poisson’s equation $\nabla^2\Phi = 4\pi\rho$ of lesson B5.2), solved once for the first slice. The evolution equations are wave-like — but whether they form a *well-posed* hyperbolic system depends on how they are written and on the gauge: the next two lessons.` },
    ],
    answer: t`12 functions, 4 constraints, 4 gauge choices: $12 - 4 - 4 = 4$ data per point, i.e. 2 radiative degrees of freedom.`,
  },
  practice: [
    num({
      id: 'sym-count', difficulty: 1,
      gen(r) {
        const d = r.pick([2, 3, 4]);
        return {
          prompt: t`A symmetric $${d}\times${d}$ matrix has how many independent entries? (The spatial metric $\gamma_{ij}$ of a ${d}-dimensional slice is one.)`,
          visual: { type: 'graph', params: { x: [0.3, d + 0.7], y: [0.3, d + 0.7], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [], points: Array.from({ length: d * d }, (_, k) => { const i = Math.floor(k / d) + 1, j = (k % d) + 1; return { x: j, y: d + 1 - i, r: 9, color: j >= i ? 'accent' : 'ink4', hollow: j < i }; }) }, caption: 'Entries of a symmetric matrix: those below the diagonal (hollow) copy those above it.' },
          answer: (d * (d + 1)) / 2, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: d * d, feedback: 'Symmetric: the entry in row i, column j equals the one in row j, column i. Count the diagonal and one triangle.' }, { value: (d * (d - 1)) / 2, feedback: 'Include the diagonal entries too.' }],
          hints: [t`Diagonal: ${d}. Above it: $${d}(${d} - 1)/2$.`],
          teach: 'A symmetric d×d matrix has d(d + 1)/2 independent entries.',
          explain: t`$${d}\times${d + 1}/2 = ${(d * (d + 1)) / 2}$. For a 3-dimensional slice, 6 for $\gamma_{ij}$ and 6 for $K_{ij}$: 12 functions per point.`,
        };
      },
    }),
    match({
      id: 'roles', difficulty: 2,
      prompt: t`Match each piece of the 3+1 split to what it describes.`,
      left: [t`the lapse $\alpha$`, t`the shift $\beta^i$`, t`the spatial metric $\gamma_{ij}$`, t`the extrinsic curvature $K_{ij}$`],
      right: ['proper time between slices along their normals', 'how the spatial coordinate labels slide between slices', 'lengths and angles measured within one slice', 'how a slice bends in spacetime (the rate of change of its geometry)', 'the energy density of the matter'],
      answer: [0, 1, 2, 3],
      hints: ['Two of these are chosen freely (gauge); two are the data the equations evolve.', 'K is the slice’s “velocity”: the evolution equation ∂ₜγ = −2αK + … ties it to the rate of change of γ.'],
      teach: 'Lapse and shift choose coordinates; γᵢⱼ and Kᵢⱼ carry the geometry and its rate of change.',
      explain: t`$\alpha$ and $\beta^i$ are gauge — you choose them. $\gamma_{ij}$ and $K_{ij}$ are the physical data on a slice, the gravitational analogues of a field and its time derivative. Matter enters as a source (energy density $\rho$, momentum density $j_i$, stresses) in the constraint and evolution equations.`,
      diagram: '<svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two slices with a normal vector and a drifting coordinate line"><g fill="none" stroke="currentColor"><path d="M20 95 C110 80 210 80 300 95" stroke-opacity=".7" stroke-width="2"/><path d="M20 35 C110 20 210 20 300 35" stroke-opacity=".7" stroke-width="2"/><path d="M160 84 L160 26" stroke-width="2"/><path d="M160 84 L200 26" stroke-dasharray="5 4" stroke-width="2"/></g><g fill="currentColor" font-size="13"><text x="300" y="112" text-anchor="end">t</text><text x="300" y="52" text-anchor="end">t + dt</text><text x="152" y="60" text-anchor="end">α dt</text><text x="206" y="44">β dt</text></g></svg>',
    }),
    num({
      id: 'lapse-time', difficulty: 2,
      gen(r) {
        const a = r.pick([0.2, 0.35, 0.5, 0.8]), dt = r.pick([0.25, 0.5, 1]), n = r.pick([10, 40, 100]);
        return {
          prompt: t`Near a black hole a code chooses the lapse $\alpha = ${a}$, holding it fixed, while it takes ${n} time steps of $\Delta t = ${dt}\,M$ (with $G = c = 1$, time in units of the mass $M$). How much proper time do observers there, moving along the normals, live through, in units of $M$?`,
          visual: slices({ A: a, B: 0, caption: t`Slices bunching where the lapse is small, schematic: the centre’s observers age only $\alpha$ per unit of $t$.` }),
          answer: a * dt * n, tol: { rel: 0.005 },
          errors: [{ value: dt * n, feedback: t`That is coordinate time. Proper time along the normal is $d\tau = \alpha\,dt$.` }, { value: (dt * n) / a, feedback: t`The lapse multiplies: $d\tau = \alpha\,dt$, so less proper time passes where $\alpha < 1$.` }],
          hints: [t`$d\tau = \alpha\,dt$; the total coordinate time is $${n}\times${dt}\,M$.`],
          teach: 'The lapse converts coordinate time into proper time along the normals: dτ = α dt.',
          explain: t`$\tau = \alpha\,n\,\Delta t = ${a}\times${n}\times${dt} = ${r3(a * dt * n)}\,M$. Choosing a small lapse near a black hole slows the slices there — the “collapse of the lapse” that keeps them from reaching the singularity while the rest of the grid moves on.`,
        };
      },
    }),
    mcq({
      id: 'why-constraints', difficulty: 2,
      prompt: t`Why are exactly four of Einstein’s ten equations constraints rather than evolution equations?`,
      visual: slices({ A: 1, B: 0, caption: 'Evenly spaced flat slices: the constraints are conditions within each blue line; the evolution equations connect neighbouring ones.' }),
      choices: [t`The contracted Bianchi identity $\nabla^\mu G_{\mu\nu} = 0$ holds for every metric, so the four combinations $G_{\mu\nu}n^\mu$ cannot contain second time derivatives`, 'Four of the metric components are always zero', 'Matter supplies four equations of its own, which replace them', 'They are evolution equations for the lapse and shift'],
      answer: 0,
      why: { 1: 'No component of the metric need vanish; the counting comes from an identity.', 2: 'Matter obeys $\\nabla_\\mu T^{\\mu\\nu} = 0$, which is consistent with the identity — it does not replace equations.', 3: 'Nothing in Einstein’s equations evolves the lapse and shift: they are free, which is why they must be chosen.' },
      hints: ['Write the identity as ∂ₜ(G⁰ν) = −∂ᵢ(Gⁱν) + (lower-order terms). How many time derivatives can G⁰ν then hold?', 'If G⁰ν held second time derivatives, its time derivative would hold third ones — but the right side has at most second.'],
      teach: 'An identity holding for every metric forces four combinations of Einstein’s equations to be free of second time derivatives: constraints.',
      explain: t`$\nabla_\mu G^{\mu\nu} = 0$ for *every* metric reads $\partial_t G^{0\nu} = -\partial_i G^{i\nu} + \dots$; the right side holds at most second time derivatives, so $G^{0\nu}$ itself holds at most first. Those four equations — $G_{\mu\nu}n^\mu$ in 3+1 language — are the Hamiltonian and momentum constraints, the analogue of Gauss’s law. And the same identity, with $\nabla_\mu T^{\mu\nu} = 0$, keeps them true under evolution.`,
    }),
    num({
      id: 'dof-D', difficulty: 3,
      gen(r) {
        const D = r.pick([3, 5, 6, 11]);
        const d = D - 1, data = d * (d + 1), dof = (data - 2 * D) / 2;
        return {
          prompt: t`Repeat the count in a spacetime of $D = ${D}$ dimensions: a slice has $d = ${d}$ space dimensions, the data $(\gamma_{ij}, K_{ij})$ are two symmetric $d\times d$ matrices, there are $D$ constraints and $D$ gauge functions, and what is left pairs into (value, rate). How many polarizations does a gravitational wave have?`,
          visual: { type: 'graph', params: { x: [2.5, 11.5], y: [-2, 47], aspect: 'wide', axesAt: 'edge', xlabel: 'spacetime dimensions D', ylabel: 'polarizations', xticks: 9, curves: [], points: [{ x: 4, y: 2, color: 'accent', r: 6, label: 'our world: 2' }] }, caption: 'The count for D = 4. Other dimensions are the question.' },
          answer: dof, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: data - 2 * D, feedback: 'Pair what is left into values and rates of change: divide by 2.' }, { value: (data - D) / 2, feedback: 'Subtract both the D constraints and the D gauge functions.' }].filter((e) => Math.abs(e.value - dof) > 0.5),
          hints: [t`Data: $2\times d(d + 1)/2 = ${data}$.`, t`$(${data} - 2\times${D})/2$.`],
          teach: 'Data minus constraints minus gauge, halved: D(D − 3)/2 radiative degrees of freedom.',
          explain: t`$(${data} - ${2 * D})/2 = ${dof}$. In general the count is $D(D - 3)/2$. ${D === 3 ? 'In 2+1 dimensions it is zero: gravity there has no gravitational waves at all — the constraints and gauge eat everything.' : `For $D = 4$ it gives the familiar 2.`}`,
        };
      },
    }),
    mcq({
      id: 'elliptic', difficulty: 2,
      prompt: t`What kind of PDE problem is building the **first** slice of a black-hole binary — choosing $\gamma_{ij}$ and $K_{ij}$ that satisfy the four constraints?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [0, 3.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'ψ', curves: [{ fn: '1 + 0.5/sqrt((x - 1.5)^2 + 0.02) + 0.5/sqrt((x + 1.5)^2 + 0.02)', color: 'accent', width: 2.2 }], hlines: [{ y: 1, color: 'ink3' }] }, caption: 'The conformal factor of two black holes at a moment of rest, ψ = 1 + m₁/(2r₁) + m₂/(2r₂) along the line through them: a sum of solutions of Laplace’s equation (drawn with the singularities softened).' },
      choices: ['An elliptic boundary-value problem, like Poisson’s equation: every point of the slice depends on every other, and conditions far away matter', 'A hyperbolic Cauchy problem, solved by marching outward from the black holes', 'A parabolic problem that relaxes in time', 'No equation: the data may be chosen freely'],
      answer: 0,
      why: { 1: 'The constraints hold within one slice; there is no time to march in. They are elliptic, like Gauss’s law.', 2: 'Iterative solvers may relax toward the solution, but the equations themselves are elliptic.', 3: 'Only 8 of the 12 functions (4 polarization data plus 4 gauge) can be chosen freely; the other 4 are fixed by the constraints.' },
      hints: ['In a weak field, what does the Hamiltonian constraint become?', 'It becomes Newton’s ∇²Φ = 4πρ (lesson B5.2).'],
      teach: 'The constraints are elliptic: initial data are found by solving Poisson-like equations on the whole slice.',
      explain: t`At a moment of time symmetry ($K_{ij} = 0$) with a conformally flat metric $\gamma_{ij} = \psi^4\delta_{ij}$, the Hamiltonian constraint in vacuum is exactly Laplace’s equation $\nabla^2\psi = 0$ — and $\psi = 1 + \sum m_k/(2r_k)$ is the Brill–Lindquist solution for several black holes at rest. Moving, spinning holes need the full coupled elliptic system, solved numerically before the first time step.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron-star', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([1.2, 1.4, 2.0]), R = r.pick([11, 12, 13]), T = r.pick([1, 10, 100]);
        const a = Math.sqrt(1 - (2 * GM_KM * M) / R);
        return {
          prompt: t`For a static star, slices of constant Schwarzschild time have zero shift and, at the surface, lapse $\alpha = \sqrt{1 - 2GM/(Rc^2)}$. For a neutron star of $${M}\,M_\odot$ and radius ${R} km ($GM_\odot/c^2 = 1.477$ km), how much proper time passes at the surface while ${T} ms pass far away?`,
          visual: slices({ A: +a.toFixed(2), B: 0, caption: 'Slices bunching where the lapse is smaller — at the star (schematic; the real lapse varies smoothly inside and outside).' }),
          answer: a * T, units: 'ms', tol: { rel: 0.003 },
          errors: [{ value: T / a, feedback: t`The surface clock runs *slow*: $d\tau = \alpha\,dt$ with $\alpha < 1$.` }, { value: T * (1 - (2 * GM_KM * M) / R), feedback: t`Take the square root: $\alpha = \sqrt{1 - 2GM/(Rc^2)}$.` }],
          hints: [t`$2GM/(Rc^2) = 2\times1.477\times${M}/${R} = ${r3((2 * GM_KM * M) / R)}$.`, t`$\alpha = \sqrt{1 - ${r3((2 * GM_KM * M) / R)}}$; then $\tau = \alpha\times${T}$ ms.`],
          teach: 'For a static spacetime the lapse of the static slicing is the gravitational time-dilation factor.',
          explain: t`$\alpha = \sqrt{1 - ${r3((2 * GM_KM * M) / R)}} = ${r3(a)}$, so $${r3(a * T)}$ ms pass at the surface. A pulsar’s spin period, measured at the surface, is shorter by this factor than the period seen far away (before any Doppler or orbital effects). Static slicing is one gauge among many: a merger code chooses a different, evolving lapse.`,
        };
      },
    }),
    mcq({
      id: 'cp-maxwell', difficulty: 3,
      prompt: t`Write electromagnetism with the four-potential $(A_0, \vec A)$. Which quantity plays the role that the lapse and shift play in the 3+1 split of gravity?`,
      visual: slices({ A: 0.5, B: 0.3, caption: 'Lapse and shift choose how the slices are stacked and labelled; nothing in the field equations evolves them (schematic). Maxwell theory has one such free function, Einstein’s theory four.' }),
      choices: [t`The scalar potential $A_0$: it has no evolution equation of its own, can be chosen freely (a gauge choice), and multiplies Gauss’s law in the action — a Lagrange multiplier`, t`The vector potential $\vec A$`, t`The electric field $\vec E$`, t`The charge density $\rho$`],
      answer: 0,
      why: { 1: t`$\vec A$ evolves ($\partial_t\vec A = -\vec E - \nabla A_0$): it is data, like $\gamma_{ij}$.`, 2: t`$\vec E$ is the “momentum” of $\vec A$, as $K_{ij}$ is of $\gamma_{ij}$.`, 3: 'ρ is a source, like the energy density in the Hamiltonian constraint.' },
      hints: ['Which potential never appears with a time derivative?', 'In the Hamiltonian of Maxwell theory, A₀ multiplies (∇·E − ρ/ε₀).'],
      teach: 'Lapse and shift are Lagrange multipliers enforcing the constraints, just as A₀ enforces Gauss’s law.',
      explain: t`In Maxwell’s Hamiltonian, $A_0$ multiplies $\nabla\cdot\vec E - \rho/\varepsilon_0$; varying it gives Gauss’s law, and choosing it is choosing a gauge. In ADM’s Hamiltonian for gravity, the lapse multiplies the Hamiltonian constraint and the shift the momentum constraints — four multipliers for four constraints. That is the precise sense in which they are “not physical fields”.`,
    }),
    order({
      id: 'cp-pipeline', difficulty: 2,
      prompt: t`Put the stages of a binary-black-hole simulation in order.`,
      visual: slices({ A: 0.3, B: 0.15, caption: 'Slices built one after another from a first one that satisfies the constraints (schematic).' }),
      items: ['Solve the elliptic constraint equations for γᵢⱼ and Kᵢⱼ on the first slice', 'Choose the lapse and shift for the next step', 'Advance γᵢⱼ and Kᵢⱼ to the next slice with the evolution equations', 'Check that the constraint violation stays small and converges with resolution', 'Extract the gravitational waves far from the holes'],
      hints: ['Nothing can be evolved until there is a valid first slice.', 'The gauge must be fixed before a step can be taken; the constraints are checked on the result.'],
      teach: 'Solve (elliptic) once, then repeatedly choose gauge, evolve (hyperbolic), monitor constraints; read off waves.',
      explain: t`Initial data first: the constraints are elliptic and must be solved on the whole first slice. Then each step: fix the gauge (codes evolve the lapse and shift by their own equations), step the evolution equations, monitor the constraints — which should converge to zero with resolution (lesson B13.3). The waveform is read far from the holes, where spacetime is nearly flat.`,
    }),
  ],
  sources: [ADM, GOURGOULHON, ALCUBIERRE, SRC.evans],
});
