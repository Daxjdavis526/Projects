// Dirac’s constraints, intuitively. When the Legendre transform is singular,
// some momenta are fixed functions of the coordinates: primary constraints.
// Requiring them to persist gives secondary ones. Classify by Poisson
// brackets: first-class (brackets with every constraint vanish on the
// constraint surface) generate gauge transformations and remove two phase-
// space dimensions each; second-class come in pairs and remove one each.
// Count: degrees of freedom = (2N − 2F − S)/2. Worked: electromagnetism —
// π⁰ = 0 (A₀ has no velocity), consistency gives Gauss’s law, both first
// class: (8 − 4)/2 = 2 per point; A₀ is a multiplier, as λ was. Explore: a
// constraint counter (counterParams in _sg2.js) for a free particle, the
// multiplier pendulum (6 − 4 second-class → 1), a pure-gauge toy
// L = ½(q̇₁ − q₂)² (4 − 2·2 → 0), a first-order toy (second-class pair → 1),
// Maxwell (2) and Proca (3). Practice: singular Lagrangians, a Poisson
// bracket that classifies, the algorithm’s order, the pendulum count, Proca,
// what “gauge” means. Transfer: GR’s constraints as first class (lapse and
// shift arbitrary; the Hamiltonian is a sum of constraints).
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { counterParams } from './_sg2.js';

const t = String.raw;

const SYSTEMS = [
  { label: 'free particle in 3D', N: 3, F: 0, S: 0 },
  { label: 'pendulum with a multiplier', N: 3, F: 0, S: 4 },
  { label: 'toy: ½(q̇₁ − q₂)²', N: 2, F: 2, S: 0 },
  { label: 'toy: q̇₁q₂ − V', N: 2, F: 0, S: 2 },
  { label: 'Maxwell (per point)', N: 4, F: 2, S: 0 },
  { label: 'Proca (per point)', N: 4, F: 0, S: 2 },
];

export default lesson({
  id: 'st-g.G6.3',
  title: 'Dirac’s constraints, intuitively',
  minutes: 18, difficulty: 4,
  intro: t`Going from a Lagrangian to a Hamiltonian needs the momenta $p_i = \partial L/\partial\dot q_i$ to be solvable for the velocities. When they are not — a variable appears without its velocity, as a multiplier does — some momenta are fixed functions of the coordinates: **constraints in phase space**. Dirac (1950) showed how to find them all and sort them by their Poisson brackets:

$$\begin{gathered}\text{first class: } \{\phi_a, \phi_b\} \approx 0 \text{ for every constraint} \\ \text{degrees of freedom} = \tfrac12\bigl(2N - 2F - S\bigr)\end{gathered}$$

First-class constraints signal a **gauge** freedom: each removes two dimensions (one by the constraint, one by the redundancy it generates). Second-class constraints come in pairs and remove one dimension each. Electromagnetism is the model, and [general relativity](#/lesson/st-g.G6.4) follows it exactly. Poisson brackets are in [Poisson brackets](#/lesson/phys3550.M9.3).`,
  symbols: [
    { tex: '\\phi_a(q, p)', text: t`the constraints: functions on phase space that vanish on every allowed state` },
    { tex: '\\{f, g\\}', text: t`the Poisson bracket $\sum_i\bigl(\tfrac{\partial f}{\partial q_i}\tfrac{\partial g}{\partial p_i} - \tfrac{\partial f}{\partial p_i}\tfrac{\partial g}{\partial q_i}\bigr)$; $\dot f = \{f, H\}$` },
    { tex: '\\approx', text: t`“weakly equal”: equal once the constraints are imposed (Dirac’s notation)` },
    { tex: 'N', text: t`the number of coordinates $q_i$ (per point of space, for a field), so phase space has $2N$ dimensions` },
    { tex: 'F', text: t`the number of first-class constraints` },
    { tex: 'S', text: t`the number of second-class constraints (always even)` },
  ],
  why: 'General relativity has four first-class constraints per point; that is why the lapse and shift are arbitrary (coordinate freedom), why its Hamiltonian vanishes on solutions, and why gravity has two degrees of freedom.',
  visual: {
    type: 'graph',
    title: 'Counting what is left',
    lead: t`Pick a system. The bar is its phase space: $2N$ dimensions. Second-class constraints (gold) remove one each. First-class constraints remove one each (red) **and** one gauge direction each (violet) — states along a gauge direction are the same physical state. What is left (green) is twice the number of degrees of freedom.`,
    tasks: [
      t`The pendulum with a multiplier: three variables $(x, y, \lambda)$, six phase-space dimensions, four second-class constraints. One degree of freedom: the angle.`,
      t`The toy $L = \tfrac12(\dot q_1 - q_2)^2$: two first-class constraints eat all four dimensions. Nothing physical moves — every motion is a gauge transformation.`,
      t`Compare Maxwell and Proca: the same four field components, but a photon mass turns two first-class constraints into a second-class pair, freeing one more degree of freedom: $2 \to 3$ polarizations.`,
    ],
    params: counterParams(SYSTEMS, { value: 4 }),
    caption: t`Counts per point of space for the fields. The bar shows the bookkeeping, not the geometry of phase space.`,
  },
  example: {
    prompt: t`Run Dirac’s procedure on vacuum electromagnetism, $\mathcal L = \tfrac12\bigl(|\mathbf E|^2 - |\mathbf B|^2\bigr)$ with $\mathbf E = -\nabla\phi - \dot{\mathbf A}$ and $\mathbf B = \nabla\times\mathbf A$. Count the degrees of freedom per point.`,
    visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 4, choice: false }), caption: t`The count for Maxwell’s field: eight dimensions per point, two first-class constraints, two degrees of freedom.` },
    steps: [
      { label: 'Momenta', text: t`The variables are $\phi$ and $\mathbf A$ (four per point). $\partial\mathcal L/\partial\dot{\mathbf A} = -\mathbf E$, so $\boldsymbol\pi = -\mathbf E$. But $\mathcal L$ contains no $\dot\phi$: its momentum vanishes. **Primary constraint**: $\pi_\phi = 0$.` },
      { label: 'Hamiltonian', text: t`$\mathcal H = \boldsymbol\pi\cdot\dot{\mathbf A} - \mathcal L = \tfrac12(|\mathbf E|^2 + |\mathbf B|^2) - \phi\,\nabla\cdot\mathbf E$ after an integration by parts. The potential $\phi$ multiplies $\nabla\cdot\mathbf E$ — exactly as $\lambda$ multiplied $f$ in [the last lesson](#/lesson/st-g.G6.2).` },
      { label: 'Consistency', text: t`$\pi_\phi = 0$ must stay zero: $\dot\pi_\phi = -\partial\mathcal H/\partial\phi = \nabla\cdot\mathbf E$. So $\nabla\cdot\mathbf E = 0$ — Gauss’s law, a **secondary constraint**. Its own time derivative vanishes identically (the divergence of a curl), so the chain stops.` },
      { label: 'Classify', text: t`$\pi_\phi$ and $\nabla\cdot\mathbf E$ involve different variables ($\phi$’s momentum, and $\mathbf A$’s), and $\nabla\cdot\mathbf E$ commutes with itself: all brackets vanish. Both are **first class**, so $\phi$ stays undetermined — a gauge choice — and Gauss’s law generates $\mathbf A \to \mathbf A + \nabla\Lambda$.` },
      { label: 'Count', text: t`$N = 4$ per point, $F = 2$, $S = 0$: $\tfrac12(8 - 4) = 2$ degrees of freedom per point — the two polarizations of light.` },
    ],
    answer: t`Primary $\pi_\phi = 0$, secondary $\nabla\cdot\mathbf E = 0$, both first class: $\tfrac12(8 - 2\times2) = 2$ degrees of freedom per point.`,
  },
  practice: [
    mcq({
      id: 'singular', difficulty: 2,
      prompt: t`Which Lagrangian has a primary constraint — momenta that cannot be solved for all the velocities?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-2, 2], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'q̇₁', ylabel: 'q̇₂', curves: [{ fn: '-x', color: 'violet', width: 2, label: 'q̇₁ + q̇₂ = 0', labelAt: -1.4, labelDx: 6 }, { fn: '1 - x', color: 'violet', width: 1.4, dash: true }, { fn: '-1 - x', color: 'violet', width: 1.4, dash: true }] }, caption: t`If $L$ depends on the velocities only through $\dot q_1 + \dot q_2$, it is constant along each dashed line: moving along one changes no momentum.` },
      choices: [t`$L = \tfrac12(\dot q_1 + \dot q_2)^2 - V(q)$`, t`$L = \tfrac12\dot q_1^2 + \tfrac12\dot q_2^2 - V(q)$`, t`$L = \dot q_1\dot q_2 - V(q)$`, t`$L = \tfrac12\dot q_1^2 + \dot q_1\dot q_2 + \dot q_2^2$`],
      answer: 0,
      why: {
        1: t`$p_1 = \dot q_1$, $p_2 = \dot q_2$: solvable. The Hessian $\partial^2L/\partial\dot q_i\partial\dot q_j$ is the identity.`,
        2: t`$p_1 = \dot q_2$, $p_2 = \dot q_1$: solvable. The Hessian $\begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$ has determinant $-1 \ne 0$.`,
        3: t`$p_1 = \dot q_1 + \dot q_2$, $p_2 = \dot q_1 + 2\dot q_2$: the Hessian has determinant $1$, so solvable.`,
      },
      hints: [t`Compute $p_1$ and $p_2$ for each.`, t`For the first, $p_1 = p_2 = \dot q_1 + \dot q_2$.`],
      teach: 'A primary constraint appears exactly when the Hessian ∂²L/∂q̇ᵢ∂q̇ⱼ is singular: some combination of velocities leaves every momentum unchanged.',
      explain: t`$p_1 = p_2$ for every motion: the primary constraint $p_1 - p_2 = 0$. The velocity combination $\dot q_1 - \dot q_2$ is invisible to $L$ — a hint of gauge freedom: $q_1 \to q_1 + \epsilon$, $q_2 \to q_2 - \epsilon$ leaves $L$’s kinetic part unchanged.`,
    }),
    num({
      id: 'bracket', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4]);
        const ans = -(a + b);
        return {
          prompt: t`Two constraints in a phase space $(q_1, q_2, p_1, p_2)$: $\phi_1 = p_1 - ${a}q_2$ and $\phi_2 = p_2 + ${b}q_1$. Compute the Poisson bracket $\{\phi_1, \phi_2\}$, with $\{q_i, p_j\} = \delta_{ij}$. (A nonzero constant means the pair is second class.)`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, points: [{ x: 0.6, y: 1.5, r: 0, label: '{q₁, p₁} = 1', color: 'accent' }, { x: 0.6, y: 1.0, r: 0, label: '{q₂, p₂} = 1', color: 'accent' }, { x: 0.6, y: 0.5, r: 0, label: '{p, q} = −{q, p}; all others 0', color: 'ink2' }] }, caption: t`The canonical brackets. A bracket is bilinear, so split each constraint into its terms.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a + b, feedback: t`Sign: $\{p_1, ${b}q_1\} = -${b}$ and $\{-${a}q_2, p_2\} = -${a}$.` }, { value: 0, feedback: 'The cross terms do not cancel here: each pair q, p contributes.' }],
          hints: [t`$\{p_1 - ${a}q_2,\ p_2 + ${b}q_1\} = \{p_1, ${b}q_1\} + \{-${a}q_2, p_2\}$ (the other two vanish).`, t`$\{p_1, q_1\} = -1$ and $\{q_2, p_2\} = 1$.`],
          teach: 'Second-class constraints have nonzero brackets with each other: they cannot generate a symmetry, and they remove one phase-space dimension each.',
          explain: t`$-${b} - ${a} = ${ans}$: never zero, so $\phi_1, \phi_2$ form a second-class pair. Together they remove two dimensions — one degree of freedom — with no gauge freedom left over.`,
        };
      },
    }),
    order({
      id: 'algorithm', difficulty: 2,
      prompt: t`Put Dirac’s procedure in order.`,
      visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 0 }), caption: t`The end point of the procedure: a count of what survives.` },
      items: [
        t`Compute the momenta $p_i = \partial L/\partial\dot q_i$`,
        t`Read off the primary constraints: relations among $q$ and $p$ that hold identically`,
        t`Form the total Hamiltonian $H + u_a\phi_a$ with unknown multipliers $u_a$`,
        t`Require every constraint to be preserved, $\dot\phi \approx 0$: this gives secondary constraints or fixes some $u_a$`,
        t`Classify all constraints as first or second class by their Poisson brackets`,
        t`Count: $\tfrac12(2N - 2F - S)$ degrees of freedom`,
      ],
      hints: ['The constraints must be found before they can be classified.', 'Secondary constraints come from demanding that primary ones persist in time.'],
      teach: 'Dirac’s algorithm: momenta → primary constraints → preserve them in time → secondary constraints → classify → count.',
      explain: t`For electromagnetism the chain stops after one secondary constraint (Gauss’s law); for the multiplier pendulum it runs four steps deep before fixing the multiplier.`,
    }),
    num({
      id: 'pendulum-count', difficulty: 2,
      gen(r) {
        const [what, N, S] = r.pick([['a pendulum in a plane, with coordinates $(x, y, \\lambda)$', 3, 4], ['a spherical pendulum, with coordinates $(x, y, z, \\lambda)$', 4, 4], ['two beads on a rod of fixed length in a plane, with coordinates $(x_1, y_1, x_2, y_2, \\lambda)$', 5, 4]]);
        const ans = (2 * N - S) / 2;
        return {
          prompt: t`For ${what}, Dirac’s procedure finds $S = ${S}$ second-class constraints ($p_\lambda = 0$, $f = 0$, $\dot f = 0$, and one fixing $\lambda$) and no first-class ones. How many degrees of freedom are there?`,
          visual: { type: 'graph', params: counterParams([{ label: 'this system', N, F: 0, S }], { value: 0, choice: false, hideDof: true }), caption: t`The phase-space bookkeeping for this system.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: N - 1, feedback: t`The multiplier $\lambda$ is a coordinate too, so $N = ${N}$, but its four constraints remove four of $2N$ dimensions.` }, { value: 2 * N - S, feedback: 'That is the number of physical phase-space dimensions. Halve it.' }].filter((e) => e.value !== ans),
          hints: [t`$2N = ${2 * N}$ phase-space dimensions.`, t`$\tfrac12(${2 * N} - ${S})$.`],
          teach: 'Second-class constraints remove one phase-space dimension each; the count matches the elementary one (coordinates minus holonomic constraints).',
          explain: t`$\tfrac12(${2 * N} - ${S}) = ${ans}$ — the same as counting coordinates minus constraints without any multiplier, as it must be.`,
        };
      },
    }),
    mcq({
      id: 'proca', difficulty: 3,
      prompt: t`Give the photon a mass: $\mathcal L = \tfrac12(|\mathbf E|^2 - |\mathbf B|^2) - \tfrac12m^2(|\mathbf A|^2 - \phi^2)$ (Proca). Now $\dot\pi_\phi \approx 0$ gives $\nabla\cdot\mathbf E + m^2\phi \approx 0$, and $\{\pi_\phi,\ \nabla\cdot\mathbf E + m^2\phi\} = -m^2 \ne 0$. What follows?`,
      visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 5, choice: false }), caption: t`The Proca count: eight dimensions per point, a second-class pair, three degrees of freedom.` },
      choices: [
        t`The two constraints are second class: $\phi$ is fixed ($\phi = -\nabla\cdot\mathbf E/m^2$), no gauge freedom remains, and $\tfrac12(8 - 2) = 3$ polarizations propagate`,
        t`They are still first class, so 2 polarizations propagate`,
        t`The mass term removes all degrees of freedom`,
        t`Nothing changes; the mass is too small to matter`,
      ],
      answer: 0,
      why: {
        1: t`A nonzero bracket is exactly what second class means; the mass breaks the gauge symmetry the first-class constraints generated.`,
        2: t`Second-class constraints remove one dimension each: $8 - 2 = 6$ remain, three degrees of freedom.`,
        3: t`Counting is discontinuous: any nonzero mass changes the class and adds the longitudinal polarization, however small the mass.`,
      },
      hints: [t`Nonzero bracket $\Rightarrow$ second class $\Rightarrow$ each removes one dimension.`, t`$\tfrac12(2\times4 - 0 - 2)$.`],
      teach: 'Breaking a gauge symmetry turns first-class constraints into second-class ones and frees degrees of freedom: a massive vector has three polarizations, a massless one two.',
      explain: t`$\tfrac12(8 - 2) = 3$: two transverse polarizations plus a longitudinal one. As $m \to 0$ the longitudinal mode decouples — gently for spin 1; for spin 2 (a massive graviton) the analogous limit is not smooth.`,
    }),
    mcq({
      id: 'gauge-meaning', difficulty: 3,
      prompt: t`The toy Lagrangian $L = \tfrac12(\dot q_1 - q_2)^2$ has two first-class constraints, $p_2 = 0$ and $p_1 = 0$, and zero degrees of freedom. What does that mean for its motion?`,
      visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 2, choice: false }), caption: t`The toy’s count: every phase-space direction is either constrained or gauge.` },
      choices: [
        t`Any $q_1(t)$ is allowed, with $q_2 = \dot q_1$; but all such histories are related by the gauge transformation $q_1 \to q_1 + \epsilon(t)$, $q_2 \to q_2 + \dot\epsilon$: physically nothing happens`,
        t`The system cannot move at all: $q_1$ and $q_2$ are constants`,
        t`The equations of motion have no solutions`,
        t`It has two degrees of freedom, one per first-class constraint`,
      ],
      answer: 0,
      why: {
        1: t`The coordinates may change arbitrarily; what has no dynamics is the physics, not the variables.`,
        2: t`They have infinitely many solutions — too many, which is the signature of gauge freedom.`,
        3: t`Each first-class constraint removes two dimensions, not adds a degree of freedom.`,
      },
      hints: [t`Check that $L$ is unchanged by $q_1 \to q_1 + \epsilon(t)$, $q_2 \to q_2 + \dot\epsilon(t)$.`, t`The equations only demand $\dot q_1 - q_2$ stay constant… and $p_1 = 0$ makes it zero.`],
      teach: 'First-class constraints mean arbitrary functions of time in the solutions: different-looking histories that describe one physical history — gauge freedom.',
      explain: t`$L$ depends only on $\dot q_1 - q_2$, which the transformation leaves alone. In electromagnetism the same happens with $\phi$ and $\mathbf A$ under $\mathbf A \to \mathbf A + \nabla\Lambda$, $\phi \to \phi - \dot\Lambda$; in general relativity, with the choice of coordinates.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-gr-first-class', difficulty: 3, transfer: true,
      prompt: t`In canonical general relativity the Hamiltonian constraint $\mathcal H$ and momentum constraints $\mathcal H_i$ are **first class**, and the Hamiltonian is $H = \int(N\mathcal H + N^i\mathcal H_i)\,d^3x$ plus a boundary term. Which consequence is **not** correct?`,
      visual: { type: 'graph', params: counterParams([{ label: 'GR (ADM, per point)', N: 6, F: 4, S: 0 }], { value: 0, choice: false }), caption: t`The count for the spatial metric and its momentum, per point: twelve dimensions, four first-class constraints.` },
      choices: [
        t`The lapse $N$ and shift $N^i$ are determined by the initial data`,
        t`On solutions the bulk Hamiltonian vanishes; the total energy comes from the boundary term (the ADM mass)`,
        t`The constraints generate changes of coordinates (time slicing and spatial relabelling), which are gauge`,
        t`Two degrees of freedom per point remain: $\tfrac12(12 - 2\times4) = 2$`,
      ],
      answer: 0,
      why: {
        1: t`This is correct: with $\mathcal H \approx 0$ and $\mathcal H_i \approx 0$ the bulk term vanishes, and the energy of an asymptotically flat spacetime is the boundary term.`,
        2: t`This is correct: first-class constraints generate gauge transformations — here, diffeomorphisms.`,
        3: t`This is correct: the count of the next lesson.`,
      },
      hints: [t`For first-class constraints, are the multipliers fixed by consistency or left free?`, t`In this Hamiltonian the multipliers are $N$ and $N^i$.`],
      teach: 'Because GR’s constraints are first class, the lapse and shift (their multipliers) are arbitrary: choosing them is choosing coordinates.',
      explain: t`Consistency never fixes the multipliers of first-class constraints; they are gauge. In numerical relativity the lapse and shift are chosen (1 + log slicing, Gamma-driver shift) to keep the simulation well behaved — see [the 3+1 split](#/lesson/gr.S32.d).`,
    }),
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const N = r.pick([3, 4, 5, 6]), F = r.pick([1, 2]), S = r.pick([0, 2]);
        const ans = (2 * N - 2 * F - S) / 2;
        return {
          prompt: t`A system has $N = ${N}$ coordinates, $F = ${F}$ first-class constraints and $S = ${S}$ second-class constraints. How many degrees of freedom does it have?`,
          visual: { type: 'graph', params: counterParams([{ label: 'this system', N, F, S }], { value: 0, choice: false, hideDof: true }), caption: t`The bookkeeping for this system.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: N - F - S, feedback: 'Second-class constraints remove one phase-space dimension each (half a degree of freedom), first-class two.' }, { value: (2 * N - F - S) / 2, feedback: 'Each first-class constraint also generates a gauge direction: it removes two dimensions.' }].filter((e) => e.value !== ans),
          hints: [t`$\tfrac12(2N - 2F - S)$.`],
          teach: 'Degrees of freedom = ½(2N − 2F − S): first-class constraints count twice.',
          explain: t`$\tfrac12(${2 * N} - ${2 * F} - ${S}) = ${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-gauss-generator', difficulty: 3,
      prompt: t`Gauss’s law $G = \nabla\cdot\mathbf E \approx 0$ is first class. Smeared with a function $\Lambda(\mathbf x)$, $\int\Lambda\,\nabla\cdot\mathbf E\,d^3x$ has Poisson brackets with $\mathbf A$ that shift it by $\nabla\Lambda$ (up to sign). What is the physical meaning?`,
      visual: { type: 'field2d', params: { P: '-y', Q: 'x', x: [-2, 2], y: [-2, 2], probe: false, readout: false }, caption: t`A magnetic vector potential pattern. Adding any gradient $\nabla\Lambda$ leaves its curl — the magnetic field — unchanged.` },
      choices: [
        t`Gauss’s law generates gauge transformations: potentials differing by $\nabla\Lambda$ describe the same fields, so only $\mathbf E$ and $\mathbf B$ (and gauge-invariant quantities) are physical`,
        t`Gauss’s law moves charges around`,
        t`Gauss’s law evolves $\mathbf A$ forward in time`,
        t`It shows that $\mathbf A$ is directly measurable`,
      ],
      answer: 0,
      why: {
        1: t`In vacuum there are no charges; with charges, $G$ also rotates the phase of the charged field — still a gauge transformation.`,
        2: t`Time evolution is generated by the Hamiltonian; a first-class constraint generates a transformation that changes no physical state.`,
        3: t`The opposite: a quantity shifted by a gauge transformation cannot be measured on its own (though loop integrals of $\mathbf A$, as in the Aharonov–Bohm effect, can).`,
      },
      hints: [t`Does $\mathbf B = \nabla\times\mathbf A$ change under $\mathbf A \to \mathbf A + \nabla\Lambda$?`, 'A first-class constraint generates a transformation that leaves every physical quantity unchanged.'],
      teach: 'First-class constraints are generators of gauge transformations: Gauss’s law generates A → A + ∇Λ; GR’s constraints generate changes of coordinates.',
      explain: t`$\nabla\times\nabla\Lambda = 0$, so $\mathbf B$ is unchanged, and $\mathbf E = -\boldsymbol\pi$ commutes with $G$. This is Dirac’s conjecture made concrete: each first-class constraint generates a redundancy of the description.`,
    }),
  ],
  sources: [
    { label: 'Dirac, Generalized Hamiltonian dynamics, Can. J. Math. 2, 129 (1950)', url: 'https://doi.org/10.4153/CJM-1950-012-1' },
    { label: 'Dirac, Lectures on Quantum Mechanics (Yeshiva University, 1964; Dover 2001)', url: 'https://openlibrary.org/isbn/9780486417134' },
    { label: 'Henneaux & Teitelboim, Quantization of Gauge Systems (Princeton, 1992), chs. 1–3', url: 'https://openlibrary.org/isbn/9780691037691' },
  ],
});
