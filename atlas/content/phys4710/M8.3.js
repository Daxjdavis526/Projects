// Measurement and decoherence (Griffiths & Schroeter §12.5 (Afterword);
// Zurek, Rev. Mod. Phys. 75, 715 (2003); Schlosshauer, Decoherence and the
// Quantum-to-Classical Transition). A system that interacts with its
// environment becomes entangled with it: (a|0⟩ + b|1⟩)|E⟩ → a|0⟩|E₀⟩ + b|1⟩|E₁⟩,
// and the system's reduced density matrix keeps its populations while its
// coherences are multiplied by ⟨E₁|E₀⟩ — interference fades. Fringe
// visibility = |⟨E₁|E₀⟩|; N independent scatterings multiply it as cᴺ.
// Pointer states: what the environment monitors (position, for most
// interactions). Zurek's estimate τ_D/τ_R = (ħ/Δx√(2mkT))² — an estimate,
// labelled as such. Experiments: Brune et al. (ENS Paris, 1996), cavity
// field "cat" states decohering faster the further apart their components;
// Hackermüller et al. (Vienna, 2004), C₇₀ fringes washed out by the
// molecules' own thermal photons. Honesty: decoherence explains why
// interference becomes unobservable and which basis looks classical; it does
// not by itself select a single outcome — that is the measurement problem,
// on which interpretations (Copenhagen, many-worlds, Bohmian mechanics,
// objective-collapse models) differ, and only the last make different
// predictions. Transfer: gate counts within a superconducting qubit's T₂.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, KB, blochPic, r6 } from './_q2b.js';

const t = String.raw;
const ball = (r, caption) => blochPic({ states: [{ v: r, label: '\\vec r', color: 'gold' }], caption, yaw: -0.6 });
/** Two-path interference fringes with visibility V. */
const fringes = (V, caption) => ({
  type: 'graph',
  params: { x: [-3, 3], y: [0, 2.2], aspect: 'wide', xlabel: 'position on the screen (fringe spacings)', ylabel: 'intensity', axesAt: 'edge', xticks: 6, yticks: 0, curves: [{ fn: `1 + ${r6(V)}*cos(2*pi*x)`, color: 'accent', width: 2.4 }], hlines: [{ y: 1, color: 'ink4' }] },
  caption,
});

export default lesson({
  id: 'phys4710.M8.3',
  title: 'Measurement and decoherence',
  minutes: 17, difficulty: 3,
  intro: t`No system is truly isolated. When a qubit, a molecule or a cat interacts with its surroundings, the surroundings become correlated with it — entangled — and the system on its own loses its coherences:

$$\begin{gathered} \bigl(a|0\rangle + b|1\rangle\bigr)|E\rangle \;\to\; a|0\rangle|E_0\rangle + b|1\rangle|E_1\rangle \\ \hat\rho_S = \begin{pmatrix}|a|^2 & ab^*\langle E_1|E_0\rangle\\ a^*b\langle E_0|E_1\rangle & |b|^2\end{pmatrix} \end{gathered}$$

Once the environment’s two records are nearly orthogonal, $\langle E_1|E_0\rangle \approx 0$ and $\hat\rho_S$ looks like a classical mixture. This **decoherence** is fast for anything large and warm — which is why we never see superposed cats. What it does *not* do, on its own, is pick which outcome happens: that is still the measurement problem.`,
  symbols: [
    { tex: 'a,\\ b', text: 'the amplitudes of the system’s two states, |a|² + |b|² = 1' },
    { tex: '|E\\rangle', text: 'the environment’s initial state (air molecules, photons, phonons, a detector)' },
    { tex: '|E_0\\rangle,\\ |E_1\\rangle', text: 'the environment’s states after it has interacted with the system in |0⟩ or |1⟩: its “records”' },
    { tex: '\\langle E_1|E_0\\rangle', text: 'their overlap: 1 if the environment learned nothing, 0 if it can tell the two apart perfectly' },
    { tex: '\\hat\\rho_S', text: 'the system’s reduced density matrix, the environment traced out' },
  ],
  why: 'Decoherence sets the coherence time of every qubit, explains why the classical world looks classical, and marks precisely where the unsolved part of the measurement problem lies.',
  visual: {
    ...blochPic({
      marks: true, yaw: -0.6,
      extra: {
        sliders: [
          { key: 'th', label: t`Initial state angle $\theta$`, min: 0, max: 180, step: 1, value: 90, unit: '^\\circ', explain: 'The qubit starts as cos(θ/2)|0⟩ + sin(θ/2)|1⟩: θ = 90° is an equal superposition.' },
          { key: 'tt', label: t`Time $t/\tau_D$`, min: 0, max: 4, step: 0.02, value: 0.5, explain: t`Time since the environment started interacting, in units of the decoherence time $\tau_D$: the overlap is $\langle E_1|E_0\rangle = e^{-t/\tau_D}$.` },
        ],
        vectors: [{ to: ['sin(th*pi/180)*exp(-tt)', '0', 'cos(th*pi/180)'], color: 'gold', label: '\\vec r' }],
        curves: [{ param: ['sin(th*pi/180)*exp(-t*tt)', '0', 'cos(th*pi/180)'], t: [0, 1], color: 'gold', dash: true }],
        readouts: [
          { label: t`coherence $|\rho_{01}| = \tfrac12\sin\theta\,e^{-t/\tau_D}$`, expr: '0.5*sin(th*pi/180)*exp(-tt)', digits: 3 },
          { label: t`purity $\operatorname{Tr}\rho^2$`, expr: '(1 + sin(th*pi/180)^2*exp(-2*tt) + cos(th*pi/180)^2)/2', digits: 3 },
          { label: t`fringe visibility`, expr: 'sin(th*pi/180)*exp(-tt)', digits: 3 },
          { label: t`$P(0)$`, expr: '(1 + cos(th*pi/180))/2', digits: 3 },
        ],
      },
      caption: t`Pure dephasing by an environment: the Bloch vector shrinks toward the z-axis (the basis the environment records) while the populations, and so $P(0)$, stay fixed. The overlap $e^{-t/\tau_D}$ is a model; real environments can decay differently. Drag to rotate.`,
    }),
    title: 'Coherence leaking into the environment',
    lead: t`A qubit starts in a superposition. Its environment keeps a record of whether it is $|0\rangle$ or $|1\rangle$, so their overlap $\langle E_1|E_0\rangle$ falls with time. Watch the Bloch vector.`,
    tasks: [
      'Run the time up from 0: the vector slides straight toward the z-axis. The probabilities of 0 and 1 never change; only the coherence between them is lost.',
      t`At $t = 4\tau_D$ the state is almost exactly the mixture diag(½, ½) — for θ = 90° the centre of the ball, purity ½.`,
      'Set θ = 0: a basis state has no coherence to lose, and nothing happens. The environment’s preferred basis is stable — a pointer state.',
    ],
  },
  example: {
    prompt: t`A particle goes through a two-path interferometer. On path 0 it leaves a nearby spin unchanged; on path 1 it rotates the spin by an angle $\phi$ about $x$. What is the visibility of the interference fringes, and what happens as $\phi \to \pi$?`,
    visual: fringes(Math.cos(Math.PI / 6), 'Interference fringes with visibility cos(φ/2) for φ = 60°: the contrast is reduced but not gone.'),
    steps: [
      { label: 'Entangle', text: t`The spin starts in $|{\uparrow}\rangle$. After the paths: $\tfrac{1}{\sqrt2}\bigl(|0\rangle|{\uparrow}\rangle + |1\rangle|E_1\rangle\bigr)$ with $|E_1\rangle = \cos\frac\phi2|{\uparrow}\rangle - i\sin\frac\phi2|{\downarrow}\rangle$.` },
      { label: 'Overlap', text: t`$\langle E_1|E_0\rangle = \cos\frac\phi2$.` },
      { label: 'Reduced state', text: t`Tracing out the spin, the particle’s coherence $\rho_{01}$ is multiplied by $\cos\frac\phi2$.` },
      { label: 'Fringes', text: t`Recombining the paths gives intensity $\propto 1 + |\langle E_1|E_0\rangle|\cos(\delta)$ with $\delta$ the path phase: visibility $V = |\cos\frac\phi2|$.` },
      { label: 'Which-path', text: t`At $\phi = \pi$ the spin flips on one path only: it is a perfect which-path record, $\langle E_1|E_0\rangle = 0$, and the fringes vanish. Nobody needs to look at the spin; its existence is enough.` },
      { label: 'Sense check', text: t`Interference is not destroyed by a “disturbance” of the particle — its path and momentum are untouched here — but by information about the path leaving the system. Rotate the spin back ($\phi \to 2\pi$) and the fringes return (with a sign flip): the coherence was never lost, only shared.` },
    ],
    answer: t`$V = |\langle E_1|E_0\rangle| = |\cos(\phi/2)|$: full contrast at $\phi = 0$, none at $\phi = \pi$, where the spin records the path.`,
  },
  practice: [
    num({
      id: 'many', difficulty: 2,
      gen(r) {
        const c = r.pick([0.9, 0.95, 0.99]), N = r.pick([10, 50, 200]);
        const ans = c ** N;
        return {
          prompt: t`A molecule in a two-path interferometer scatters $N = ${N}$ photons on its way, each independently leaving an environmental record with overlap $\langle E_1|E_0\rangle = ${c}$ between the two paths. What fringe visibility remains?`,
          visual: fringes(0.5, 'Interference fringes of reduced visibility (illustrative contrast).'),
          answer: ans, tol: { rel: 0.01, abs: 1e-6 },
          errors: [{ value: 1 - N * (1 - c), feedback: t`The overlaps multiply: independent records give $c^N$, not a linear loss.` }, { value: c, feedback: 'Each scattering contributes its own factor: the total overlap is the product.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans + 1e-6),
          hints: [t`The environment’s two states are products of $N$ independent records, so their overlap is a product.`],
          teach: 'Each scattered particle multiplies the coherence by its overlap: decoherence is exponential in the number of records.',
          explain: t`$V = ${c}^{${N}} = ${tex(ans, 3)}$. Even weak records add up: this is why a warm, large object decoheres almost instantly.`,
        };
      },
    }),
    mcq({
      id: 'problem', difficulty: 2,
      prompt: t`Does decoherence solve the measurement problem?`,
      visual: ball([0, 0, 0.01], 'After decoherence: a mixed state at the centre of the ball. Drag to rotate.'),
      choices: [
        'Not by itself: it explains why interference becomes unobservable and which basis looks classical, but the global state is still a superposition, and why one outcome is seen remains a question of interpretation',
        'Yes: decoherence is the collapse of the wave function, now derived',
        'Yes: after decoherence the system is in one definite state that we simply do not know',
        'No: decoherence is a hypothesis that has never been observed',
      ],
      answer: 0,
      why: {
        1: 'Decoherence follows from ordinary unitary evolution; nothing collapses in the calculation.',
        2: 'The reduced state looks like an ignorance mixture, but the system is still entangled with the environment; the “improper mixture” cannot be read as hidden definite values without an interpretation.',
        3: 'Decoherence has been observed and measured, for example in cavity QED (1996) and in molecule interferometry (2004).',
      },
      hints: ['Decoherence is unitary evolution of system plus environment. What does the total state look like afterwards?'],
      teach: 'Decoherence is established physics; what it leaves open — why one outcome — is where interpretations part ways.',
      explain: t`System plus environment remain in a superposition of branches; decoherence makes the branches stop interfering. Copenhagen-style views add a collapse or a rule for outcomes, many-worlds keeps every branch, Bohmian mechanics adds particle positions, and objective-collapse models (GRW) change the dynamics — the last are testable, and experiments are bounding them.`,
    }),
    num({
      id: 'purity', difficulty: 2,
      gen(r) {
        const th = r.pick([60, 90, 120]), o = r.pick([0.2, 0.5, 0.8]);
        const s = Math.sin((th * Math.PI) / 180), cz = th === 90 ? 0 : Math.cos((th * Math.PI) / 180), ans = (1 + s * s * o * o + cz * cz) / 2;
        return {
          prompt: t`A qubit starts in $\cos(\theta/2)|0\rangle + \sin(\theta/2)|1\rangle$ with $\theta = ${th}^\circ$, and its environment then records it with overlap $\langle E_1|E_0\rangle = ${o}$ (real). What is the purity of the qubit’s reduced state?`,
          visual: ball([r6(s * o), 0, r6(cz)], 'The qubit’s Bloch vector after partial decoherence: the x-component is shrunk by the overlap. Drag to rotate.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (1 + s * s * o + cz * cz) / 2, feedback: 'The Bloch vector’s x-component is multiplied by the overlap; the purity uses its square.' }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`The Bloch vector becomes $(\sin\theta\cdot${o},\ 0,\ \cos\theta)$.`, t`Purity $= \tfrac12(1 + |\vec r|^2)$.`],
          teach: 'Decoherence shrinks only the transverse part of the Bloch vector, the part that encodes the superposition.',
          explain: t`$|\vec r|^2 = (${fmt(s, 4)}\times${o})^2 + ${fmt(cz, 4)}^2 = ${fmt(s * s * o * o + cz * cz, 4)}$, purity $= ${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'pointer', difficulty: 3,
      prompt: t`Why do macroscopic objects appear in definite *positions*, rather than in definite momenta or in superpositions of places?`,
      visual: fringes(0.05, 'Fringes from a large object: their visibility is essentially zero.'),
      choices: [
        'Most interactions (scattering of light and air molecules) depend on position, so the environment keeps records of position: position states are the robust “pointer states”',
        'Momentum is not an observable for large objects',
        'Large objects have no wave function',
        'Gravity forces large objects into position eigenstates',
      ],
      answer: 0,
      why: {
        1: 'Momentum is measurable for any object; it is just not what the environment continually records.',
        2: 'Quantum mechanics applies at all scales tested, from electrons to molecules of thousands of atoms.',
        3: 'Gravity-induced collapse is a speculative proposal (Diósi, Penrose), not established physics.',
      },
      hints: ['Which basis does a scattered photon learn about?', 'Pointer states are the ones that do not get entangled with the environment as it monitors them.'],
      teach: 'The environment selects the classical basis: states that its interactions leave unentangled survive (einselection).',
      explain: t`A photon bouncing off an object carries away where it was. Superpositions of different places therefore decohere almost instantly, while position-like states persist. Zurek called this environment-induced superselection.`,
    }),
    num({
      id: 'zurek', difficulty: 3,
      gen(r) {
        const [what, m] = r.pick([['a dust grain of mass 10⁻¹⁵ kg', 1e-15], ['a large molecule of mass 10⁻²³ kg', 1e-23], ['an electron', 9.1093837139e-31]]);
        const dx = r.pick([1e-9, 1e-6, 1e-3]), T = 300;
        const lth = HBAR / Math.sqrt(2 * m * KB * T), ans = (lth / dx) ** 2;
        return {
          prompt: t`Zurek’s rough estimate for a particle exchanging heat with an environment at temperature $T$: a superposition of two places $\Delta x$ apart decoheres faster than the particle relaxes thermally by the factor $\tau_D/\tau_R = (\lambda_T/\Delta x)^2$, with $\lambda_T = \hbar/\sqrt{2mkT}$. Evaluate $\tau_D/\tau_R$ for ${what} at 300 K with $\Delta x = ${tex(dx, 1)}$ m.`,
          visual: fringes(0.2, 'Interference that decoherence washes out (illustrative).'),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: lth / dx, feedback: 'Square the ratio.' }],
          hints: [t`$\lambda_T = \hbar/\sqrt{2mkT}$ with $k = ${tex(KB, 7)}$ J/K.`, t`Then square $\lambda_T/\Delta x$.`],
          teach: 'Decoherence of spatial superpositions is fast beyond imagining for anything macroscopic — an order-of-magnitude estimate, but a telling one.',
          explain: t`$\lambda_T = ${tex(lth, 3)}$ m, so $\tau_D/\tau_R = ${tex(ans, 3)}$. ${ans < 1e-10 ? 'Even if thermal relaxation took the age of the universe, the superposition would last a vanishing fraction of a second.' : 'For small particles and small separations the two times become comparable, which is where quantum effects can be seen.'} (This is a model estimate with a simple linear coupling; real environments differ in detail.)`,
        };
      },
    }),
    mcq({
      id: 'haroche', difficulty: 3,
      prompt: t`In 1996 Serge Haroche’s group at the ENS in Paris prepared a microwave field in a cavity in a superposition of two coherent states of different phase — a small “Schrödinger cat” — and watched it decohere. What did they find?`,
      visual: ball([0.6, 0, 0], 'A partly decohered superposition (illustrative). Drag to rotate.'),
      choices: [
        'The superposition decohered progressively, and faster the further apart its two components were',
        'The superposition was stable as long as the cavity was cold',
        'It collapsed instantly when the experimenters looked at the data',
        'Decoherence was the same for any separation of the components',
      ],
      answer: 0,
      why: {
        1: 'Their cavity was cold and of very high quality, yet the cat still decohered as photons leaked out.',
        2: 'The decay was gradual and measured, governed by photon loss, not by anyone looking.',
        3: 'The rate grew with the separation: a more “macroscopic” superposition loses coherence faster.',
      },
      hints: ['Each photon leaking from the cavity carries some information about which component it came from.', 'More distinct components make each leaked photon a better record.'],
      teach: 'The decoherence rate grows with how different the superposed states are — the experimental face of why big cats decohere instantly.',
      explain: t`Brune et al. (1996) found the coherence decaying in a time inversely proportional to the squared distance between the two field states (in phase space): leaked photons record which state the field was in, and better-separated states are recorded faster. Haroche shared the 2012 Nobel Prize for such experiments.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gates', difficulty: 2, transfer: true,
      gen(r) {
        const T2 = r.pick([50, 100, 300]), tg = r.pick([20, 40, 60]);           // μs, ns
        const ans = (T2 * 1000) / tg;
        return {
          prompt: t`A superconducting qubit’s coherence decays as $e^{-t/T_2}$ with $T_2 = ${T2}\ \mu\text{s}$. Its single-qubit gates take $${tg}$ ns. How many gates can be applied in sequence before the coherence has fallen to $1/e$?`,
          visual: ball([0.37, 0, 0], 'A qubit after one T₂: its Bloch vector has shrunk to 1/e of its length. Drag to rotate.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans / 1000, feedback: '1 μs = 1000 ns.' }],
          hints: [t`Coherence falls to $1/e$ at $t = T_2$.`, t`Divide $T_2$ by the gate time, in the same units.`],
          teach: 'Coherence time divided by gate time is the budget of operations before decoherence wins — the reason quantum error correction is essential.',
          explain: t`$${T2}\ \mu\text{s}/${tg}\ \text{ns} = ${fmt(ans, 4)}$ gates. Useful algorithms need far more, which is why logical qubits are built from many physical ones with error correction.`,
        };
      },
    }),
    num({
      id: 'cp-vis', difficulty: 2,
      gen(r) {
        const ph = r.pick([30, 60, 90, 120, 150]);
        const ans = Math.abs(Math.cos((ph * Math.PI) / 360));
        return {
          prompt: t`On one path of an interferometer a particle rotates a nearby spin by $\phi = ${ph}^\circ$; on the other it leaves it alone. What is the fringe visibility $|\langle E_1|E_0\rangle| = |\cos(\phi/2)|$?`,
          visual: fringes(0.6, 'Fringes of reduced contrast (illustrative).'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(Math.cos((ph * Math.PI) / 180)), feedback: 'A spin rotated by φ has overlap cos(φ/2) with its original state: half the angle.' }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`$|E_1\rangle = \cos\frac\phi2|{\uparrow}\rangle - i\sin\frac\phi2|{\downarrow}\rangle$.`],
          teach: 'Fringe visibility equals the overlap of the environment’s two records.',
          explain: t`$|\cos ${ph / 2}^\circ| = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-c70', difficulty: 2,
      prompt: t`In 2004 Hackermüller and colleagues in Vienna sent C₇₀ molecules through a matter-wave interferometer while heating them with lasers. As the molecules’ internal temperature was raised to a few thousand kelvin, the fringes faded away. Why?`,
      visual: fringes(0.15, 'Faded fringes (illustrative).'),
      choices: [
        'Hot molecules emit thermal photons; each photon carries away some information about the molecule’s position, so the two paths decohere',
        'Heat made the molecules too heavy to show interference',
        'Hot molecules move faster, so their de Broglie wavelength became too short to measure',
        'The laser beams physically pushed the molecules off the paths',
      ],
      answer: 0,
      why: {
        1: 'Heating changes the mass by a negligible amount (E/c²).',
        2: 'The molecules’ speed was selected independently of their internal temperature; it is internal heat that radiates.',
        3: 'The fading followed the emission of thermal radiation, as decoherence theory predicted quantitatively.',
      },
      hints: ['A hot body glows. What does an emitted photon know about where it came from?'],
      teach: 'An object’s own thermal radiation is an environment: emitted photons record its position and decohere its spatial superpositions.',
      explain: t`The visible and infrared photons emitted by hot C₇₀ have wavelengths comparable to the path separation, so each one partially records which path the molecule took. The measured loss of contrast matched the decoherence calculation — a clean, quantitative observation of the quantum-to-classical transition.`,
    }),
  ],
  sources: [
    { label: 'Zurek, “Decoherence, einselection, and the quantum origins of the classical”, Rev. Mod. Phys. 75, 715 (2003)', url: 'https://doi.org/10.1103/RevModPhys.75.715' },
    { label: 'Brune et al., “Observing the progressive decoherence of the ‘meter’ in a quantum measurement”, Phys. Rev. Lett. 77, 4887 (1996)', url: 'https://doi.org/10.1103/PhysRevLett.77.4887' },
    { label: 'Hackermüller et al., “Decoherence of matter waves by thermal emission of radiation”, Nature 427, 711 (2004)', url: 'https://doi.org/10.1038/nature02276' },
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., ch. 12', url: 'https://www.cambridge.org/9781316995433' },
  ],
});
