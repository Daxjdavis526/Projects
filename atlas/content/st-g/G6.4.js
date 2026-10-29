// Counting degrees of freedom: gravity has two. Four independent counts that
// agree: covariant (10 − 4 − 4), ADM phase space ((12 − 2·4)/2), Dirac with
// the lapse and shift as variables ((20 − 2·8)/2: 4 primary π_N = π_{Nⁱ} = 0,
// 4 secondary 𝓗 = 𝓗ᵢ = 0, all first class), and transverse–traceless
// tensors (helicity ±2). Maxwell runs in parallel: 4 − 1 − 1 = 2, (8 − 4)/2.
// Explore: the constraint counter (counterParams) for Maxwell, Proca, GR,
// GR with lapse and shift, Brans–Dicke (14 − 8 → 3), Fierz–Pauli (a second-
// class pair, 12 − 2 → 5) and 2+1 gravity (6 − 6 → 0). Practice: the TT count
// in D dimensions ((D − 2)(D − 1)/2 − 1), a massive vector (D − 1), the
// massive graviton’s 5 and the vDVZ discontinuity, 2+1 gravity’s conical
// space, a find-the-error on “constraints and gauge are the same”, the
// polarization test with three detectors. Transfer: scalar–tensor theories
// (2 + k), massive gravity in D dimensions ((D + 1)(D − 2)/2).
// Avoids gr.S28.i (10 − 4 − 4 with h’s table), gr.S29.i (12 − 4 − 4) and
// st-b.B15.1 (the 3+1 count and its D-dimensional version) — linked.
import { lesson, mcq, num } from '../../src/core/content.js';
import { counterParams } from './_sg2.js';

const t = String.raw;

const SYSTEMS = [
  { label: 'Maxwell', N: 4, F: 2, S: 0 },
  { label: 'Proca (massive photon)', N: 4, F: 0, S: 2 },
  { label: 'GR: γᵢⱼ and momenta', N: 6, F: 4, S: 0 },
  { label: 'GR with lapse and shift', N: 10, F: 8, S: 0 },
  { label: 'Brans–Dicke', N: 7, F: 4, S: 0 },
  { label: 'Fierz–Pauli (massive graviton)', N: 6, F: 0, S: 2 },
  { label: 'GR in 2+1 dimensions', N: 3, F: 3, S: 0 },
];

export default lesson({
  id: 'st-g.G6.4',
  title: 'Counting degrees of freedom: gravity has two',
  minutes: 16, difficulty: 4,
  intro: t`How many independent things can a gravitational wave do at each point? The metric has ten components, but four can be changed by relabelling coordinates and four more are fixed by constraints that carry no waves. Dirac’s counting from [the last lesson](#/lesson/st-g.G6.3) makes this precise, and it can be done four different ways that all agree:

$$\begin{gathered}\underbrace{10 - 4 - 4}_{\text{components}} = \underbrace{\tfrac12(12 - 2\cdot4)}_{\text{ADM}} \\ = \underbrace{\tfrac12(20 - 2\cdot8)}_{\text{with lapse and shift}} = 2\end{gathered}$$

The two are the plus and cross polarizations LIGO measures. Electromagnetism runs in parallel and also ends at two; but give either field a mass and the count jumps. The first count is in [linearized gravity](#/lesson/gr.S28.i), the second in [four constraints and six evolution equations](#/lesson/st-b.B15.1); here the third and fourth, and what changes the answer.`,
  symbols: [
    { tex: '10', text: t`independent components of the symmetric metric $g_{\mu\nu}$ (or its perturbation $h_{\mu\nu}$) in four dimensions` },
    { tex: '12', text: t`phase-space variables per point in the ADM form: the spatial metric $\gamma_{ij}$ (6) and its momentum $\pi^{ij}$ (6)` },
    { tex: '20', text: t`the same plus the lapse $N$, the shift $N^i$ (4) and their momenta (4)` },
    { tex: '4,\\ 8', text: t`first-class constraints: the Hamiltonian and momentum constraints $\mathcal H, \mathcal H_i$; with the lapse and shift as variables, also their vanishing momenta` },
    { tex: '2', text: t`degrees of freedom per point: the polarizations $h_+$ and $h_\times$` },
  ],
  why: 'The count tells you what gravitational-wave detectors can see (two tensor polarizations, if general relativity is right), what alternative theories add (scalar or vector polarizations, a massive graviton’s five), and what a numerical-relativity code is really evolving.',
  visual: {
    type: 'graph',
    title: 'Same bookkeeping, different theories',
    lead: t`The phase-space bar of the previous lesson, per point of space. Green is what can propagate, as twice the number of degrees of freedom.`,
    tasks: [
      t`Compare “GR: $\gamma_{ij}$ and momenta” with “GR with lapse and shift”: eight more dimensions, but four more first-class constraints eat them. The count is the same, $2$ — as it must be, since the lapse and shift are only multipliers.`,
      t`Brans–Dicke adds one scalar field to GR: $2 + 1 = 3$. A third, “breathing” polarization would squeeze a ring of test masses uniformly.`,
      t`Fierz–Pauli, the massive graviton: the mass term breaks the coordinate freedom, the constraints become a second-class pair, and $5$ polarizations appear. In $2 + 1$ dimensions GR has none at all.`,
    ],
    params: counterParams(SYSTEMS, { value: 3 }),
    caption: t`Counts per point. Fierz–Pauli’s Hamiltonian count is shown with its shift eliminated (it becomes an auxiliary field, fixed by its own equation) and its lapse giving one second-class pair.`,
  },
  example: {
    prompt: t`Count gravity’s degrees of freedom à la Dirac, keeping the lapse $N$ and shift $N^i$ as variables, and check it against the transverse–traceless count.`,
    visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 3, choice: false }), caption: t`Twenty dimensions per point; sixteen removed by eight first-class constraints and the gauge directions they generate.` },
    steps: [
      { label: 'Variables', text: t`Per point: $\gamma_{ij}$ (6), $N$ (1), $N^i$ (3) — ten coordinates, the same ten as $g_{\mu\nu}$. Phase space: $20$.` },
      { label: 'Primary', text: t`The Einstein–Hilbert action, written in these variables, contains no $\dot N$ or $\dot N^i$. So $\pi_N = 0$ and $\pi_{N^i} = 0$: four primary constraints — as $\pi_\phi = 0$ was for Maxwell.` },
      { label: 'Secondary', text: t`The Hamiltonian is $\int(N\mathcal H + N^i\mathcal H_i)\,d^3x$. Keeping $\pi_N$ and $\pi_{N^i}$ zero requires $\mathcal H \approx 0$ and $\mathcal H_i \approx 0$ — four secondary constraints, the analogue of Gauss’s law.` },
      { label: 'Classify and count', text: t`The brackets of $\mathcal H$ and $\mathcal H_i$ close on themselves (they describe deforming a slice in spacetime), so all eight are first class: $\tfrac12(20 - 2\times8) = 2$.` },
      { label: 'Cross-check', text: t`A wave along $z$ in transverse–traceless gauge has only $h_{xx} = -h_{yy} = h_+$ and $h_{xy} = h_\times$: a symmetric, traceless $2\times2$ matrix — $3 - 1 = 2$ numbers. Helicity $\pm2$: the massless spin-2 field.` },
    ],
    answer: t`$\tfrac12(20 - 2\times8) = 2$ degrees of freedom per point, matching the two transverse–traceless components $h_+$ and $h_\times$.`,
  },
  practice: [
    num({
      id: 'tt-count', difficulty: 3,
      gen(r) {
        const D = r.pick([5, 6, 10, 11]);
        const p = D - 2, ans = (p * (p + 1)) / 2 - 1;
        return {
          prompt: t`In $D$ spacetime dimensions a gravitational wave’s polarizations are the symmetric, traceless matrices in the $D - 2$ directions transverse to its travel. How many are there for $D = ${D}$?`,
          visual: { type: 'graph', params: { x: [2.5, 11.5], y: [-2, 47], aspect: 'wide', axesAt: 'edge', xlabel: 'spacetime dimensions D', ylabel: 'polarizations', xticks: 9, points: [{ x: 4, y: 2, color: 'accent', r: 6, label: 'D = 4: h₊ and h×' }, { x: 3, y: 0, color: 'bad', r: 5, label: 'D = 3: none', labelDx: 6, labelDy: 14 }], vlines: [{ x: D, color: 'gold', label: `D = ${D}` }] }, caption: t`Polarization counts already known: $2$ in our four dimensions and $0$ in three.` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: (p * (p + 1)) / 2, feedback: 'Traceless: subtract one for the trace.' }, { value: p * p - 1, feedback: t`Symmetric matrices have $n(n + 1)/2$ independent entries, not $n^2$.` }],
          hints: [t`A symmetric $n\times n$ matrix has $n(n + 1)/2$ entries; here $n = ${p}$.`, t`$${p}\times${p + 1}/2 - 1$.`],
          teach: 'Massless spin-2 polarizations are the symmetric traceless tensors transverse to the wave: (D − 2)(D − 1)/2 − 1 = D(D − 3)/2 of them.',
          explain: t`$${(p * (p + 1)) / 2} - 1 = ${ans}$, equal to $D(D - 3)/2$ — the phase-space count of [B15.1](#/lesson/st-b.B15.1) obtained a different way. Eleven-dimensional supergravity’s graviton has $44$.`,
        };
      },
    }),
    num({
      id: 'massive-vector', difficulty: 2,
      gen(r) {
        const D = r.pick([3, 5, 6, 10]);
        const ans = D - 1;
        return {
          prompt: t`A massless vector field (light) in $D$ dimensions has $D - 2$ polarizations: $D$ components minus one constraint minus one gauge freedom. A **massive** vector (Proca) has no gauge freedom; its constraints form one second-class pair. How many polarizations does it have in $D = ${D}$?`,
          visual: { type: 'graph', params: counterParams([{ label: `Proca, D = ${D}`, N: D, F: 0, S: 2 }], { value: 0, choice: false, hideDof: true }), caption: t`The Proca bookkeeping in $D = ${D}$: $2D$ phase-space dimensions per point and one second-class pair.` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: D - 2, feedback: 'That is the massless count. Without gauge freedom only the second-class pair is removed.' }, { value: D, feedback: t`The time component $A_0$ is still not dynamical: one pair of phase-space dimensions goes.` }],
          hints: [t`$\tfrac12(2D - 2)$.`],
          teach: 'A massive spin-1 field has D − 1 polarizations: one more than its massless cousin, the longitudinal mode.',
          explain: t`$\tfrac12(2\times${D} - 2) = ${ans}$: in four dimensions, the $W$ and $Z$ bosons’ three polarizations against the photon’s two.`,
        };
      },
    }),
    mcq({
      id: 'fierz-pauli', difficulty: 3,
      prompt: t`A graviton mass term (Fierz–Pauli, 1939) breaks the coordinate freedom. How many polarizations does a massive graviton have in four dimensions, and what is odd about the limit $m \to 0$?`,
      visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 5, choice: false, hideDof: true }), caption: t`The Fierz–Pauli bookkeeping: twelve dimensions and one second-class pair.` },
      choices: [
        t`$5$ (helicities $\pm2, \pm1, 0$); as $m \to 0$ the helicity-0 mode still couples to matter, so predictions such as light bending do not approach GR’s — the vDVZ discontinuity`,
        t`$2$, the same as GR, since the mass can be arbitrarily small`,
        t`$10$, one per metric component`,
        t`$6$, and the limit $m \to 0$ is smooth`,
      ],
      answer: 0,
      why: {
        1: t`The count is discontinuous: any nonzero mass changes the constraints from first to second class.`,
        2: t`Constraints still remove some: the lapse’s constraint and its partner form a second-class pair, and the shift is auxiliary.`,
        3: t`Six is what generic nonlinear massive gravity has — the extra one a ghost (Boulware–Deser 1972); the linear Fierz–Pauli theory has five.`,
      },
      hints: [t`$\tfrac12(12 - 2)$.`, 'A massive spin-2 particle has 2s + 1 polarizations.'],
      teach: 'A massive graviton carries 5 polarizations, and its extra scalar mode does not decouple as the mass goes to zero (van Dam–Veltman–Zakharov).',
      explain: t`$\tfrac12(12 - 2) = 5 = 2s + 1$ for $s = 2$. In 1970 van Dam, Veltman and Zakharov showed light bending would come out $3/4$ of GR’s in the massless limit. Vainshtein’s nonlinear screening (1972) can restore agreement near masses; models of massive gravity remain under study and under observational pressure.`,
    }),
    mcq({
      id: 'two-plus-one', difficulty: 3,
      prompt: t`In $2 + 1$ dimensions GR has $\tfrac12(6 - 2\times3) = 0$ degrees of freedom per point. Which is a consequence?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-1.3, 1.3], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, shade: [{ fn: '1.2', lower: 'min(1.2, x*tan(0.35))', from: 0, to: 2, color: 'accent', alpha: 0.15 }, { fn: '1.2', lower: '-1.2', from: -2, to: 0, color: 'accent', alpha: 0.15 }, { fn: 'max(-1.2, -x*tan(0.35))', lower: '-1.2', from: 0, to: 2, color: 'accent', alpha: 0.15 }], curves: [{ fn: 'x*tan(0.35)', domain: [0, 2], color: 'gold', width: 2 }, { fn: '-x*tan(0.35)', domain: [0, 2], color: 'gold', width: 2 }], points: [{ x: 0, y: 0, color: 'bad', r: 5, label: 'mass', labelDx: -40 }, { x: 1.5, y: 0, r: 0, label: 'wedge removed', color: 'gold', labelAlign: 'center', labelDx: 0, labelDy: 0 }] }, caption: t`A point mass in two-dimensional space: cut out a wedge and glue its edges. The space is flat everywhere except at the mass; the deficit angle measures the mass.` },
      choices: [
        t`No gravitational waves, and no gravitational pull between static masses: outside matter spacetime is flat, and a point mass only removes a wedge (a conical deficit)`,
        t`Gravity is twice as strong, since there is less space to spread into`,
        t`Black holes are impossible in every case`,
        t`It has the same two polarizations, squeezed into a plane`,
      ],
      answer: 0,
      why: {
        1: t`Strength is not the point: there is no local field at all outside matter, just a global effect of topology.`,
        2: t`With a negative cosmological constant, $2+1$ gravity has black holes (Bañados, Teitelboim and Zanelli, 1992) — global degrees of freedom, not local ones.`,
        3: t`A wave in $2+1$ dimensions has one transverse direction, and a symmetric traceless $1\times1$ matrix is zero: no polarizations.`,
      },
      hints: [t`Zero degrees of freedom per point means no local excitations: nothing to propagate.`, t`In three dimensions the Riemann tensor is fixed by the Ricci tensor, which vanishes in vacuum.`],
      teach: 'With zero local degrees of freedom, (2+1)-dimensional gravity has no waves and flat vacuum; masses act only through topology (conical deficits).',
      explain: t`In $D = 3$, Riemann has as many components as Ricci, so vacuum ($R_{\mu\nu} = 0$) means flat. Four dimensions are the first with curvature in empty space — and hence with gravitational waves and tides.`,
    }),
    mcq({
      id: 'count-error', difficulty: 3, kind: 'error',
      prompt: t`A student argues: “The metric has $10$ components. Four coordinate choices are gauge, and the four constraint equations are the same thing as those gauge choices, so gravity has $10 - 4 = 6$ degrees of freedom.” Where is the error?`,
      visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 2, choice: false, hideDof: true }), caption: t`The ADM bookkeeping per point.` },
      choices: [
        t`A first-class constraint does two separate jobs — it restricts the data and it generates a gauge direction — so the four constraints and the four gauge freedoms each remove four: $10 - 4 - 4 = 2$`,
        t`Coordinate choices are not gauge; they are physical`,
        t`There are $16$ metric components, not $10$`,
        t`The constraints only apply at $t = 0$, so they remove nothing`,
      ],
      answer: 0,
      why: {
        1: t`Changing coordinates changes the components but not the geometry: that is exactly what gauge means.`,
        2: t`The metric is symmetric: $4\times5/2 = 10$.`,
        3: t`The constraints hold on every slice; the evolution preserves them.`,
      },
      hints: [t`In phase space: does one first-class constraint remove one dimension, or two?`, t`Compare Maxwell: $4 - 1 - 1 = 2$, with Gauss’s law and the gauge freedom counted separately.`],
      teach: 'Constraints and gauge freedoms are related (first-class constraints generate the gauge) but each removes its own dimensions: count both.',
      explain: t`In phase space: $\tfrac12(12 - 2\times4) = 2$. Six would be the number of evolution equations, not of physical degrees of freedom — and two of the six spatial-metric components still carry the waves.`,
    }),
    mcq({
      id: 'polarization-test', difficulty: 2,
      prompt: t`A general metric theory allows up to six polarizations: two tensor ($+$, $\times$), two vector and two scalar. How can detectors test how many a real gravitational wave has?`,
      visual: { type: 'gr-chirp', params: { sliders: false, readout: false }, caption: t`A ring of test masses and an interferometer’s arms under the plus polarization (enormously exaggerated). Other polarizations would deform the ring in other patterns.` },
      choices: [
        t`Each polarization drives each detector with a different, orientation-dependent pattern; with three or more detectors at different sites and orientations the data can favour or exclude combinations — GW170814 (LIGO + Virgo) favoured pure tensor over pure vector or pure scalar`,
        t`One detector suffices, since it measures all six at once`,
        t`By the wave’s speed alone`,
        t`They cannot: the polarization content is unobservable`,
      ],
      answer: 0,
      why: {
        1: t`One detector records one number per instant — a single combination of the polarizations — so it cannot separate them.`,
        2: t`Speed tests a different property (a graviton mass, a modified dispersion); polarization patterns are separate.`,
        3: t`They are observable through the different antenna patterns of separated detectors.`,
      },
      hints: ['How many numbers per instant does one interferometer measure?'],
      teach: 'Counting degrees of freedom is testable: the polarization content of gravitational waves is measured with a network of differently oriented detectors.',
      explain: t`GW170814, the first event seen by three detectors, allowed the first such test; pure tensor polarization was strongly favoured. Brans–Dicke-type theories would add a scalar “breathing” mode on top of the tensor ones — the next problem.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-scalar-tensor', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([1, 2, 3]);
        const N = 6 + k, ans = (2 * N - 8) / 2;
        return {
          prompt: t`A scalar–tensor theory couples $${k}$ scalar field${k > 1 ? 's' : ''} to the metric, keeping full coordinate invariance. In ADM variables each point carries $\gamma_{ij}$ (6) and the $${k}$ scalar${k > 1 ? 's' : ''}, with their momenta, and the same four first-class constraints. How many degrees of freedom propagate?`,
          visual: { type: 'graph', params: counterParams([{ label: `GR + ${k} scalar${k > 1 ? 's' : ''}`, N, F: 4, S: 0 }], { value: 0, choice: false, hideDof: true }), caption: t`The bookkeeping for this theory, per point.` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 2, feedback: 'The scalars are new fields with their own momenta; the constraints are the same four.' }, { value: (2 * N - 4) / 2, feedback: 'First-class constraints remove two dimensions each.' }].filter((e) => e.value !== ans),
          hints: [t`$2N = ${2 * N}$; subtract $2\times4$.`],
          teach: 'Each scalar field added to a coordinate-invariant theory adds one degree of freedom: tensor modes plus scalar (breathing) modes.',
          explain: t`$\tfrac12(${2 * N} - 8) = ${ans}$: GR’s $2$ plus $${k}$. Solar-System tests (Cassini’s Shapiro delay) push Brans–Dicke’s coupling parameter $\omega$ above $40\,000$, so any such scalar must couple very weakly.`,
        };
      },
    }),
    num({
      id: 'cp-massive-D', difficulty: 3,
      gen(r) {
        const D = r.pick([3, 5, 6]);
        const ans = ((D + 1) * (D - 2)) / 2;
        return {
          prompt: t`A massive spin-2 particle in $D$ dimensions has as many polarizations as symmetric traceless tensors in the $D - 1$ directions of its rest frame. How many does it have for $D = ${D}$?`,
          visual: { type: 'graph', params: { x: [2.5, 7.5], y: [-1, 22], aspect: 'wide', axesAt: 'edge', xlabel: 'spacetime dimensions D', ylabel: 'polarizations', xticks: 5, points: [{ x: 4, y: 5, color: 'gold', r: 6, label: 'massive, D = 4: 5' }, { x: 4, y: 2, color: 'accent', r: 6, label: 'massless, D = 4: 2', labelDy: 14 }], vlines: [{ x: D, color: 'ink3', label: `D = ${D}` }] }, caption: t`The four-dimensional counts, massive and massless.` },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: (D * (D - 3)) / 2, feedback: t`That is the massless count, $D(D - 3)/2$, which uses $D - 2$ transverse directions.` }, { value: ((D - 1) * D) / 2, feedback: 'Traceless: subtract one.' }].filter((e) => e.value !== ans),
          hints: [t`A symmetric $n\times n$ matrix has $n(n + 1)/2$ entries; $n = ${D - 1}$.`, t`$${D - 1}\times${D}/2 - 1$.`],
          teach: 'A massive spin-2 field has (D + 1)(D − 2)/2 polarizations — D − 1 more than a massless one, which is why a graviton mass, however small, is not a small change.',
          explain: t`$${((D - 1) * D) / 2} - 1 = ${ans}$; in four dimensions, $5$. The difference from the massless $D(D - 3)/2$ is $D - 1$: a massive vector’s worth of extra modes. ${D === 3 ? 'In three dimensions the massive graviton has 2 while the massless one has none — “new massive gravity” builds a theory on exactly that.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'cp-why-it-matters', difficulty: 2,
      prompt: t`A numerical-relativity code evolves all of $\gamma_{ij}$ and $K_{ij}$ — twelve numbers per point — though only two degrees of freedom are physical. What are the other ten doing?`,
      visual: { type: 'graph', params: counterParams(SYSTEMS, { value: 2, choice: false }), caption: t`Twelve evolved numbers per point; eight removed by constraints and gauge.` },
      choices: [
        t`Four values and four rates are fixed or redundant: the constraints (which the code must keep satisfied) and the coordinate freedom (fixed by the chosen lapse and shift); what remains carries the waves`,
        t`They are numerical noise that should be filtered out`,
        t`They carry additional, undetected polarizations`,
        t`They store the matter fields`,
      ],
      answer: 0,
      why: {
        1: t`They are not noise: the constraint-satisfying, gauge-dependent parts are needed to describe the spacetime in the chosen coordinates.`,
        2: t`General relativity has exactly two; the rest are constraint and gauge parts, not new physics.`,
        3: t`Matter has its own variables; in vacuum simulations there is no matter at all.`,
      },
      hints: [t`$12 = 2\times2 + 2\times4$.`],
      teach: 'A simulation evolves redundant variables; the constraints and the gauge account for all but two degrees of freedom per point.',
      explain: t`$12 = 4 + 8$: four physical phase-space dimensions (two polarizations, value and rate) and eight tied up by four constraints and four gauge functions. Codes monitor the constraints and choose the gauge — see [the 3+1 split](#/lesson/gr.S32.d).`,
    }),
  ],
  sources: [
    { label: 'Arnowitt, Deser & Misner, The dynamics of general relativity (1962), arXiv:gr-qc/0405109', url: 'https://arxiv.org/abs/gr-qc/0405109' },
    { label: 'Henneaux & Teitelboim, Quantization of Gauge Systems (Princeton, 1992), ch. 1 and 3', url: 'https://openlibrary.org/isbn/9780691037691' },
    { label: 'Hinterbichler, Theoretical aspects of massive gravity, Rev. Mod. Phys. 84, 671 (2012)', url: 'https://arxiv.org/abs/1105.3735' },
    { label: 'LIGO Scientific and Virgo Collaborations, GW170814: a three-detector observation of gravitational waves from a binary black hole coalescence, PRL 119, 141101 (2017)', url: 'https://arxiv.org/abs/1709.09660' },
    { label: 'Will, The confrontation between general relativity and experiment, Living Rev. Relativ. 17, 4 (2014)', url: 'https://arxiv.org/abs/1403.7377' },
  ],
});
