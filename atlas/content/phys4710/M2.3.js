// Parity and time reversal (Griffiths & Schroeter §6.3–6.4, 6.6; Sakurai
// §4.2, 4.4). Parity Π̂ψ(r) = ψ(−r): Π̂² = 1, eigenvalues ±1; it flips r and p
// but not L or S; Y_l^m has parity (−1)^l. If [Π̂, Ĥ] = 0, a non-degenerate
// state has definite parity, so ⟨r⟩ = 0 — no permanent electric dipole, no
// linear Stark effect in hydrogen's ground state — and the dipole matrix
// element connects only opposite parities (Laporte: Δl odd, hence ±1 with the
// angular-momentum rule). Hydrogen's 2s cannot decay by one photon: two-photon
// lifetime 1/8.229 s⁻¹ = 0.12 s. The weak interaction breaks parity (Wu et al.
// 1957, ⁶⁰Co). Time reversal Θ̂ is antiunitary (it conjugates i), keeps r,
// flips p and J; for spin ½, Θ̂ = −iσ_y K and Θ̂² = −1, so with an odd number
// of electrons every level is doubly degenerate (Kramers), until a magnetic
// field breaks T. A permanent EDM d·Ĵ breaks both P and T: the neutron limit
// |d_n| < 1.8 × 10⁻²⁶ e cm (Abel et al. 2020). Explore: oscillator states
// alternating in parity (mp-schrodinger).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, QE, r6, seg, label, hLevelsPic } from './_q2.js';

const t = String.raw;
const A2S = 8.2290;                     // s⁻¹, hydrogen 2s → 1s two-photon decay rate (Goldman & Drake 1981)
const DN = 1.8e-26;                     // e cm, neutron EDM upper limit (90% CL, Abel et al. 2020)

/** A Gaussian packet and its time-reversed (or mirrored) partner, with velocity arrows. */
const packetsPic = (caption, mirror = false) => ({
  type: 'graph',
  params: {
    x: [-5, 5], y: [-0.2, 1.4], aspect: 'wide', xlabel: 'x', ylabel: '|ψ|²', xticks: 0, yticks: 0, axesAt: 'edge',
    curves: [{ fn: 'exp(-(x + 2)^2)', color: 'accent', width: 2.4 }, { fn: `exp(-(x ${mirror ? '-' : '+'} 2)^2)`, color: 'gold', width: 2.2, dash: [6, 4] }],
    arrows: [{ from: [-2.6, 1.2], to: [-1.0, 1.2], color: 'accent', width: 2.4, label: 'ψ', labelDx: 4 }, { from: mirror ? [2.6, 1.2] : [-1.4, 1.05], to: mirror ? [1.0, 1.2] : [-3.0, 1.05], color: 'gold', width: 2.4, label: mirror ? 'Πψ' : 'Θψ', labelDx: -24 }],
  },
  caption,
});

export default lesson({
  id: 'phys4710.M2.3',
  title: 'Parity and time reversal',
  minutes: 18, difficulty: 3,
  intro: t`Not every symmetry is continuous. **Parity** reflects space through the origin, and **time reversal** runs motion backwards:

$$\begin{gathered} \hat\Pi\,\psi(\vec r) = \psi(-\vec r), \qquad \hat\Pi^2 = 1 \\ \hat\Theta:\ \vec r \to \vec r,\quad \vec p \to -\vec p,\quad \vec J \to -\vec J,\quad i \to -i \end{gathered}$$

Discrete symmetries have no generator and give no conservation law in the Noether sense, but they still constrain everything: a state of definite parity cannot have an electric dipole moment, so an electric-dipole photon must connect states of **opposite parity** (the Laporte rule). Time reversal is stranger — it must complex-conjugate the wave function, and for spin ½ applying it twice gives $-1$. That single sign forces **Kramers degeneracy**: every level of a system with an odd number of electrons is at least doubly degenerate unless a magnetic field is present.`,
  symbols: [
    { tex: '\\hat\\Pi', text: t`the parity operator: reflects every position through the origin, $\vec r \to -\vec r$; eigenvalues $+1$ (even) and $-1$ (odd)` },
    { tex: '\\hat\\Theta', text: 'the time-reversal operator: reverses momenta and angular momenta (spin included) but not positions' },
    { tex: '\\vec r,\\ \\vec p', text: 'position and momentum: polar vectors, both reversed by parity' },
    { tex: '\\vec J', text: t`angular momentum, $\vec r\times\vec p$ plus spin: an axial vector, unchanged by parity, reversed by time reversal` },
    { tex: 'i \\to -i', text: t`time reversal is **antiunitary**: it complex-conjugates numbers, which a unitary operator cannot do` },
    { tex: 'N_e', text: t`the number of electrons; for spin ½, $\hat\Theta^2 = (-1)^{N_e}$` },
  ],
  why: 'Parity and time reversal fix selection rules for every spectral line, explain metastable states, guarantee degeneracies, and are tested at the edge of physics — the weak interaction breaks parity, and electric dipole moments would break time reversal.',
  visual: {
    type: 'mp-schrodinger',
    title: 'States of a symmetric well',
    lead: t`Stationary states of a potential symmetric about its centre. Step through the levels and watch the wave function: each one is either even or odd about the middle.`,
    tasks: [
      'n = 0 (the ground state) is even; n = 1 is odd; the parity alternates as (−1)ⁿ. Each extra node flips it.',
      'Every |ψ|² is symmetric, so ⟨x⟩ sits exactly in the middle for every stationary state: no stationary state of a symmetric potential has a dipole moment.',
      'Switch to the double well: the lowest two states form an even–odd pair with nearly equal energies. A particle on one side is their superposition — a state that is not a parity eigenstate, and not stationary.',
    ],
    params: { mode: 'bound', well: 'harmonic', hw: 0.5, n: 0, show: 'psi', controls: ['well', 'n', 'show'], top: 6 },
    caption: 'Exact stationary states of the harmonic, finite, infinite and double wells for an electron (units nm, eV). The parity is about the centre of each well.',
  },
  example: {
    prompt: t`Use parity to decide which electric-dipole transitions from hydrogen’s $3d$ level can occur — to $2p$, $2s$ or $1s$ — and why the ground state has no permanent electric dipole moment.`,
    visual: hLevelsPic({ nmax: 3, arrows: [[3, 2, 2, 1, 'good'], [3, 2, 2, 0, 'bad'], [3, 2, 1, 0, 'bad']], caption: 'Hydrogen’s levels by l. Green: the 3d → 2p candidate; red: 3d → 2s and 3d → 1s.' }),
    steps: [
      { label: 'Parity of a state', text: t`Under $\vec r \to -\vec r$, $(\theta, \phi) \to (\pi - \theta, \phi + \pi)$ and $Y_l^m \to (-1)^lY_l^m$. Radial functions are untouched, so $\psi_{nlm}$ has parity $(-1)^l$: s even, p odd, d even.` },
      { label: 'Parity of the operator', text: t`The dipole operator $-e\vec r$ is odd: $\hat\Pi^\dagger\vec r\hat\Pi = -\vec r$.` },
      { label: 'The integral', text: t`$\langle f|\vec r|i\rangle = \int\psi_f^*\,\vec r\,\psi_i\,d^3r$. Change variables $\vec r \to -\vec r$: the integral becomes $(-1)^{l_f}(-1)(-1)^{l_i}$ times itself. If $l_f + l_i$ is even, it equals minus itself and vanishes.` },
      { label: 'Apply', text: t`$3d \to 2p$: $l = 2 \to 1$, opposite parities, allowed (the Balmer-α line has a $3d \to 2p$ component). $3d \to 2s$ and $3d \to 1s$: both even, forbidden by parity — and $\Delta l = 2$ fails the angular-momentum rule $|\Delta l| \le 1$ too.` },
      { label: 'No dipole', text: t`A dipole moment is $\langle\psi|-e\vec r|\psi\rangle$, the same integral with $f = i$, which always has $l_f + l_i$ even: zero for any state of definite parity. Hydrogen’s $1s$ is non-degenerate, so it has definite parity and no dipole. Its Stark effect therefore starts at second order in the field — lesson M3.2.` },
    ],
    answer: t`Only $3d \to 2p$ (opposite parity); $3d \to 2s$ and $3d \to 1s$ are parity-forbidden. A non-degenerate state of a parity-symmetric Hamiltonian has $\langle\vec r\rangle = 0$.`,
  },
  practice: [
    num({
      id: 'orbital-parity', difficulty: 1,
      gen(r) {
        const [name, n, l] = r.pick([['3d', 3, 2], ['2p', 2, 1], ['4f', 4, 3], ['5s', 5, 0], ['4d', 4, 2], ['3p', 3, 1]]);
        const ans = l % 2 ? -1 : 1;
        return {
          prompt: t`What is the parity eigenvalue of hydrogen’s ${name} state ($n = ${n}$, $l = ${l}$)? Enter $+1$ or $-1$.`,
          visual: { type: 'mp-orbitals', params: { n, l, m: 0, panels: ['angular'], controls: false, readout: false }, caption: t`The angular shape $|Y_${l}^0|^2$ of this state.` },
          answer: ans, tol: { rel: 0, abs: 0.1 },
          hints: [t`$\psi_{nlm}$ has parity $(-1)^l$, whatever $n$ and $m$.`],
          teach: t`Hydrogen’s states have parity $(-1)^l$: s, d, g even; p, f odd.`,
          explain: t`$(-1)^{${l}} = ${ans > 0 ? '+1' : '-1'}$. Only $l$ matters: the radial function depends on $r = |\vec r|$, which reflection does not change, and $Y_l^m \to (-1)^lY_l^m$.`,
        };
      },
    }),
    multi({
      id: 'laporte', difficulty: 2,
      prompt: t`Which of these hydrogen transitions are allowed by the parity selection rule for electric-dipole radiation? Select all that apply.`,
      visual: hLevelsPic({ nmax: 4, caption: 'Hydrogen’s levels by l (Bohr energies).' }),
      choices: [t`$2p \to 1s$`, t`$3s \to 2p$`, t`$4f \to 3d$`, t`$2s \to 1s$`, t`$3p \to 2p$`, t`$4d \to 2s$`],
      answer: [0, 1, 2],
      why: {
        3: t`$2s$ and $1s$ are both even: forbidden for one dipole photon. The 2s state is metastable.`,
        4: t`$3p$ and $2p$ are both odd: $\langle 2p|\vec r|3p\rangle = 0$.`,
        5: t`$d$ and $s$ are both even (and $\Delta l = 2$).`,
      },
      hints: [t`Write each state’s parity, $(-1)^l$. The photon’s operator $\vec r$ is odd, so the parities must differ.`],
      teach: 'Electric-dipole transitions connect states of opposite parity (Laporte’s rule).',
      explain: t`Allowed: $2p \to 1s$ (Lyman-α), $3s \to 2p$ and $4f \to 3d$, each between opposite parities. Combined with the angular-momentum rule this gives the familiar $\Delta l = \pm1$.`,
    }),
    num({
      id: 'two-photon', difficulty: 2,
      prompt: t`Hydrogen’s $2s$ state cannot decay to $1s$ by emitting one dipole photon, so it decays by emitting two, at a rate of $${fmt(A2S, 5)}\ \text{s}^{-1}$. What is its lifetime, in ms? (For comparison, $2p$ lives $1.6$ ns.)`,
      visual: hLevelsPic({ nmax: 2, lmax: 1, arrows: [[2, 0, 1, 0, 'warn']], caption: 'The 2s → 1s decay: both levels are even.' }),
      answer: 1000 / A2S, units: 'ms', tol: { rel: 0.003 },
      errors: [{ value: A2S, feedback: 'That is the rate. The lifetime is its reciprocal.' }],
      hints: ['The lifetime is 1/rate.'],
      teach: 'A parity-forbidden decay is slow: hydrogen’s 2s lives eight orders of magnitude longer than 2p.',
      explain: t`$\tau = 1/${fmt(A2S, 5)}\ \text{s}^{-1} = ${fmt(1000 / A2S, 4)}$ ms, about $10^8$ times the $2p$ lifetime. That long life is what lets laser spectroscopy measure the $1s$–$2s$ two-photon transition to 15 significant figures, the best-known frequency in hydrogen.`,
    }),
    mcq({
      id: 'antiunitary', difficulty: 3,
      prompt: t`Why must time reversal complex-conjugate the wave function, rather than just send $t \to -t$?`,
      visual: packetsPic('A packet moving right (blue) and its time-reversed partner moving left (gold dashed): same density, opposite momentum.'),
      choices: [
        t`If $\Psi(x, t)$ solves $i\hbar\,\partial_t\Psi = \hat H\Psi$ (real $\hat H$), then $\Psi(x, -t)$ does not, but $\Psi^*(x, -t)$ does; conjugation also flips $e^{ikx} \to e^{-ikx}$, reversing the momentum`,
        t`Because $\Psi$ must be real when time runs backwards`,
        'Because time reversal does not exist in quantum mechanics; conjugation is only a convention',
        t`Because $\Psi(x, -t)$ has the wrong normalization`,
      ],
      answer: 0,
      why: {
        1: 'The reversed wave function is generally complex: a packet moving left has complex Ψ just as one moving right does.',
        2: 'Time-reversal symmetry is real and testable — it is why every reaction can, in principle, run backwards with the same amplitude.',
        3: 'Normalization is unaffected by t → −t; the trouble is the sign of i in the equation itself.',
      },
      hints: [t`Substitute $t \to -t$ in $i\hbar\,\partial_t\Psi = \hat H\Psi$: the left side changes sign.`, 'Complex conjugation flips the sign of i back.'],
      teach: 'Time reversal is antiunitary: Θ̂ = (unitary) × (complex conjugation), so it reverses momentum while keeping positions.',
      explain: t`With $t \to -t$, $i\partial_t$ changes sign; conjugating restores it for real $\hat H$. And $(e^{ikx})^* = e^{-ikx}$: the reversed packet moves the other way, as it should. For spin ½, $\hat\Theta = -i\sigma_y K$ ($K$: conjugation), which also flips the spin.`,
    }),
    multi({
      id: 'kramers', difficulty: 3,
      prompt: t`An ion sits in a crystal with no magnetic field. Its levels may be split by the crystal’s electric field in any way that symmetry allows. For which ions does time reversal guarantee that **every** level stays at least doubly degenerate? Select all that apply.`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 4], aspect: 'wide', xlabel: '', ylabel: 'energy (schematic)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [seg(0.3, 2, 1.3, 2, 'ink2', 2.6), seg(1.3, 2, 2.4, 1, 'ink4', 1), seg(1.3, 2, 2.4, 2.4, 'ink4', 1), seg(1.3, 2, 2.4, 3.3, 'ink4', 1), seg(2.4, 1, 3.4, 1, 'accent', 2.6), seg(2.4, 2.4, 3.4, 2.4, 'accent', 2.6), seg(2.4, 3.3, 3.4, 3.3, 'accent', 2.6)], points: [label(0.8, 2, 'free ion', 'ink2', 0, -14, 'center'), label(2.9, 3.3, 'in a crystal', 'accent', 0, -14, 'center')] }, caption: 'A free-ion level split by a crystal’s electric field into several levels (schematic).' },
      choices: [t`Cu$^{2+}$ (27 electrons)`, t`Ce$^{3+}$ (55 electrons)`, t`Fe$^{2+}$ (24 electrons)`, t`Ni$^{2+}$ (26 electrons)`, t`Cu$^{2+}$ in a strong magnetic field`],
      answer: [0, 1],
      why: {
        2: t`An even number of electrons: $\hat\Theta^2 = +1$, and levels can be (and often are) completely split.`,
        3: t`Even electron number: no Kramers guarantee.`,
        4: 'A magnetic field is odd under time reversal, so it breaks the symmetry; Kramers doublets split (the Zeeman effect).',
      },
      hints: [t`Kramers: if $\hat\Theta$ commutes with $\hat H$ and $\hat\Theta^2 = -1$, then $|\psi\rangle$ and $\hat\Theta|\psi\rangle$ are orthogonal states of the same energy.`, t`$\hat\Theta^2 = (-1)^{N_e}$. An electric field is even under time reversal; a magnetic field is odd.`],
      teach: 'Kramers: with an odd number of electrons and no magnetic field, every level is at least doubly degenerate.',
      explain: t`Odd electron numbers (Cu$^{2+}$, Ce$^{3+}$) have $\hat\Theta^2 = -1$, so each level comes as a Kramers doublet that no electric field can split. Such ions have an electron-spin resonance at any temperature; even-electron ions like Ni$^{2+}$ can have a non-degenerate ground state and be “ESR-silent”.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-edm', difficulty: 3, transfer: true,
      gen(r) {
        const E = r.pick([5, 10, 15, 20]);       // kV/cm
        const ans = ((2 * DN * E * 1e3) / (H / QE)) * 1e9;    // nHz; d in e·cm times E in V/cm gives eV
        return {
          prompt: t`A permanent electric dipole moment $\vec d \propto \vec J$ would give a neutron an energy $-\vec d\cdot\vec E$ — a term that is odd under both parity and time reversal. Experiments compare the neutron’s spin-precession frequency with $\vec E$ parallel and antiparallel to $\vec B$. The present limit is $|d_n| < ${tex(DN, 2)}\ e\,\text{cm}$. In a field of $${E}$ kV/cm, what is the largest possible change $2d_nE/h$ in the precession frequency, in nHz? ($h = ${tex(H / QE, 7)}$ eV s.)`,
          visual: { type: 'calc-vectors3d', params: { range: 1.2, yaw: 0.6, pitch: 0.3, vectors: [{ to: [0, 0, 1], color: 'accent', label: '\\vec B' }, { from: [0.6, 0, 0], to: [0.6, 0, 0.8], color: 'warn', label: '\\vec E' }, { to: [0.35, 0.35, 0.55], color: 'gold', label: '\\vec J' }], curves: [{ param: ['0.4*cos(t)', '0.4*sin(t)', '0.55'], t: [0, 6.2832], color: 'gold' }] }, caption: 'A spin precessing about parallel B and E fields. Reversing E would change the rate if the neutron had an EDM. Not to scale.' },
          answer: ans, units: 'nHz', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`The spin’s two states differ in energy by $2d_nE$ (it flips from along to against $\vec E$), so the frequency shifts by $2d_nE/h$.` }, { value: ans * 1000, feedback: 'Convert kV/cm to V/cm: an e·cm times a V/cm is an eV.' }],
          hints: [t`$d_nE$ in eV is $(${tex(DN, 2)}\ \text{cm})\times(${E}\times10^3\ \text{V/cm})$.`, t`Then $\Delta\nu = 2d_nE/h$ with $h$ in eV s; convert Hz to nHz.`],
          teach: 'An electric dipole moment along the spin would violate P and T; searching for it means measuring a precession frequency to nanohertz.',
          explain: t`$d_nE = ${tex(DN * E * 1e3, 2)}$ eV, so $2d_nE/h = ${fmt(ans, 3)}$ nHz — one extra turn in a few years. Many extensions of the Standard Model predict EDMs near this limit, because they add the extra time-reversal violation needed to explain why the universe has more matter than antimatter.`,
        };
      },
    }),
    mcq({
      id: 'cp-wu', difficulty: 3, transfer: true,
      prompt: t`In 1957 Wu’s group polarized $^{60}$Co nuclei and found that beta-decay electrons come out preferentially **opposite** to the nuclear spin $\vec J$. Why does this show that the weak interaction violates parity?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.2, yaw: 0.6, pitch: 0.3, vectors: [{ to: [0, 0, 1], color: 'accent', label: '\\vec J' }, { to: [0, 0, -1], color: 'gold', label: '\\vec p_e' }], curves: [{ param: ['0.35*cos(t)', '0.35*sin(t)', '0.2'], t: [0, 5.5], color: 'accent' }] }, caption: 'The nuclear spin (with its sense of rotation) and the favoured electron direction.' },
      choices: [
        t`Parity reverses $\vec p_e$ but not the axial vector $\vec J$, so it turns the observed correlation $\langle\vec J\cdot\vec p_e\rangle < 0$ into its opposite; the mirrored experiment is not what nature does`,
        'Because the electrons are charged, and parity reverses charge',
        'Because cobalt-60 has an odd number of protons',
        'Because the decay rate changes with temperature',
      ],
      answer: 0,
      why: {
        1: 'Charge conjugation, not parity, swaps charges; parity reflects space.',
        2: 'The nuclear composition does not decide the symmetry of the force.',
        3: 'The cooling was needed to polarize the nuclei; the decay rate itself is not the evidence.',
      },
      hints: [t`Under parity, how do a momentum (polar vector) and an angular momentum ($\vec r\times\vec p$, axial vector) transform?`, t`A nonzero expectation value of a parity-odd quantity, such as $\vec J\cdot\vec p$, means the states involved are not parity eigenstates.`],
      teach: 'A nonzero pseudoscalar such as J·p in a measurement is direct evidence of parity violation.',
      explain: t`$\vec J\cdot\vec p_e$ is a pseudoscalar: parity flips its sign. If parity were a symmetry, the mirror image of the experiment would be equally possible and the average would be zero. The electrons’ preference for one hemisphere showed it is not; the weak force couples only to left-handed particles.`,
    }),
    mcq({
      id: 'cp-dipole', difficulty: 2,
      prompt: t`Chemistry says an ammonia molecule ($\text{NH}_3$, a pyramid with the nitrogen above or below the plane of the hydrogens) has a permanent electric dipole moment, yet a non-degenerate stationary state of a parity-symmetric Hamiltonian cannot have one. How are these reconciled?`,
      visual: { type: 'mp-schrodinger', params: { mode: 'bound', well: 'double', L: 2, V0: 2, w: 0.3, n: 1, show: 'psi', controls: false, readout: false, top: 2, hide: ['labels', 'energy'] }, caption: 'A symmetric double well: the lowest states are an even–odd pair, close in energy.' },
      choices: [
        'The energy eigenstates are parity doublets (even and odd combinations of the two mirror-image orientations) split by a tiny energy; a molecule found with a definite dipole is in a superposition of the two, which is not stationary — but changes so slowly that it behaves as if it were',
        'Ammonia breaks parity because a pyramid is not symmetric',
        'The theorem applies only to atoms, not molecules',
        'The dipole moment is a classical illusion with no quantum counterpart',
      ],
      answer: 0,
      why: {
        1: 'The electromagnetic Hamiltonian of the nuclei and electrons is parity-symmetric; a molecule’s shape does not change the Hamiltonian’s symmetry.',
        2: 'The argument uses only the symmetry of Ĥ and non-degeneracy; it applies to molecules as well.',
        3: 'Dipole moments are measured, for example by the Stark effect on rotational lines.',
      },
      hints: ['Think of ammonia’s nitrogen above or below the plane of hydrogens: two mirror-image configurations, like the two sides of the double well.', 'The stationary states are the even and odd combinations; a localized state is their superposition.'],
      teach: 'A permanent dipole needs degenerate (or nearly degenerate) states of opposite parity mixed together.',
      explain: t`The nitrogen tunnels through the plane of hydrogens, like the particle in the double well; the stationary states are the even and odd combinations of “up” and “down”, split by $h\times23.8$ GHz — the line of the first maser (1954). An electric field mixes the pair and gives the molecule its dipole. For heavier pyramids the splitting is so small that a localized state lasts effectively forever.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §6.3–6.4 and §6.6 (problem on time reversal)', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'C. S. Wu et al., “Experimental test of parity conservation in beta decay”, Phys. Rev. 105, 1413 (1957)', url: 'https://doi.org/10.1103/PhysRev.105.1413' },
    { label: 'C. Abel et al., “Measurement of the permanent electric dipole moment of the neutron”, Phys. Rev. Lett. 124, 081803 (2020)', url: 'https://doi.org/10.1103/PhysRevLett.124.081803' },
  ],
});
