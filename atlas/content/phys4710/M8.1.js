// Density matrices (Griffiths & Schroeter §12.3 (3rd ed.); Nielsen & Chuang
// §2.4). ρ = Σ pₖ|ψₖ⟩⟨ψₖ|; ⟨A⟩ = Tr(ρA); properties (Hermitian, trace 1,
// positive); purity Tr ρ² ≤ 1; a qubit's ρ = ½(1 + r⃗·σ⃗) with the Bloch
// vector inside the ball, |r⃗| = 1 pure, 0 maximally mixed; eigenvalues
// (1 ± |r|)/2 and the von Neumann entropy. A mixture is not a superposition
// (σₓ tells them apart); different ensembles with the same ρ are
// indistinguishable. Dephasing shrinks the off-diagonals (T₂). Transfer:
// thermal polarization of protons in an MRI magnet, r = tanh(γħB/2kT)
// (a few parts per million). The Bloch sphere picture is phys4700's
// (calc-vectors3d via blochPic). Partial traces are M8.2.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, KB, GAMMA_P, blochPic, r6 } from './_q2b.js';

const t = String.raw;
const ball = (r, caption, extra = {}) => blochPic({ states: [{ v: r, label: '\\vec r', color: 'gold' }], caption: caption || 'The Bloch ball: pure states on the surface, mixed states inside. Drag to rotate.', extra, yaw: -0.6 });

export default lesson({
  id: 'phys4710.M8.1',
  title: 'Density matrices',
  minutes: 16, difficulty: 3,
  intro: t`A state vector describes a system we know completely. Often we don’t: a beam from an oven, a spin in a warm magnet, one half of an entangled pair. The **density matrix** handles a statistical mixture of states, and every prediction is a trace:

$$\begin{gathered} \hat\rho = \sum_k p_k\,|\psi_k\rangle\langle\psi_k| \\ \langle A\rangle = \operatorname{Tr}(\hat\rho\hat A) \end{gathered}$$

For a qubit, $\hat\rho = \tfrac12(1 + \vec r\cdot\vec\sigma)$: the Bloch sphere becomes a **ball**. Pure states sit on its surface; mixtures fill the inside, down to the completely random state at the centre.`,
  symbols: [
    { tex: '\\hat\\rho', text: 'the density operator (a matrix in a basis): Hermitian, trace 1, with no negative eigenvalues' },
    { tex: 'p_k', text: 'the probability that the system was prepared in |ψₖ⟩; the pₖ add to 1' },
    { tex: '|\\psi_k\\rangle\\langle\\psi_k|', text: 'the projector onto the pure state |ψₖ⟩' },
    { tex: '\\operatorname{Tr}', text: 'the trace: the sum of the diagonal elements' },
    { tex: '\\hat A', text: 'any observable; Tr(ρA) is its expectation value' },
    { tex: '\\vec r', text: t`the Bloch vector of a qubit, $|\vec r| \le 1$: its components are $\langle\sigma_x\rangle$, $\langle\sigma_y\rangle$, $\langle\sigma_z\rangle$` },
  ],
  why: 'NMR, quantum computing, quantum optics and statistical mechanics all work with density matrices: they describe noise, temperature, decoherence and entangled subsystems.',
  visual: {
    ...blochPic({
      marks: true, yaw: -0.6,
      extra: {
        sliders: [
          { key: 'r', label: t`Length $|\vec r|$`, min: 0, max: 1, step: 0.01, value: 0.7, explain: 'How pure the state is: 1 on the surface (pure), 0 at the centre (completely mixed).' },
          { key: 'th', label: t`Polar angle $\theta$`, min: 0, max: 180, step: 1, value: 50, unit: '^\\circ', explain: 'The direction of the Bloch vector from +z.' },
          { key: 'ph', label: t`Azimuth $\varphi$`, min: 0, max: 360, step: 1, value: 30, unit: '^\\circ', explain: 'The direction of the Bloch vector round the z-axis.' },
        ],
        vectors: [{ to: ['r*sin(th*pi/180)*cos(ph*pi/180)', 'r*sin(th*pi/180)*sin(ph*pi/180)', 'r*cos(th*pi/180)'], color: 'gold', label: '\\vec r' }],
        readouts: [
          { label: t`purity $\operatorname{Tr}\rho^2 = (1 + r^2)/2$`, expr: '(1 + r^2)/2', digits: 3 },
          { label: t`eigenvalue $(1 + r)/2$`, expr: '(1 + r)/2', digits: 3 },
          { label: t`eigenvalue $(1 - r)/2$`, expr: '(1 - r)/2', digits: 3 },
          { label: t`entropy $S$ (bits)`, expr: '-((1 + r)/2*log2(max((1 + r)/2, 1e-12)) + (1 - r)/2*log2(max((1 - r)/2, 1e-12)))', digits: 3 },
          { label: t`$P(+z) = (1 + r_z)/2$`, expr: '(1 + r*cos(th*pi/180))/2', digits: 3 },
        ],
      },
      caption: 'A qubit’s density matrix as a point in the Bloch ball. Drag to rotate.',
    }),
    title: 'The Bloch ball',
    lead: t`The gold arrow is the Bloch vector $\vec r = (\langle\sigma_x\rangle, \langle\sigma_y\rangle, \langle\sigma_z\rangle)$ of a qubit’s density matrix. Its length says how mixed the state is.`,
    tasks: [
      'Shrink |r| to 0: the purity falls to ½, the entropy rises to 1 bit, and every measurement direction gives 50 : 50 — a completely random qubit.',
      'Set |r| = 1: a pure state, purity 1, entropy 0, as if described by a state vector.',
      'At |r| = 0.6 the eigenvalues are 0.8 and 0.2: the state could be read as 80% one pure state and 20% the opposite one.',
    ],
  },
  example: {
    prompt: t`A source emits spin-½ particles in $|{+z}\rangle$ half the time and in $|{+x}\rangle$ the other half, at random. Find $\hat\rho$, its Bloch vector, its purity, and the probability of measuring $+\hbar/2$ along $x$. Compare with the pure superposition $\propto |{+z}\rangle + |{+x}\rangle$, normalized.`,
    visual: ball([0.5, 0, 0.5], 'The mixture’s Bloch vector (gold) halfway between +z and +x, inside the ball. Drag to rotate.'),
    steps: [
      { label: 'Projectors', text: t`$|{+z}\rangle\langle{+z}| = \begin{pmatrix}1 & 0\\ 0 & 0\end{pmatrix}$, $|{+x}\rangle\langle{+x}| = \tfrac12\begin{pmatrix}1 & 1\\ 1 & 1\end{pmatrix}$.` },
      { label: 'Mix', text: t`$\hat\rho = \tfrac12(\cdot) + \tfrac12(\cdot) = \begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}$. Trace 1, Hermitian, as required.` },
      { label: 'Bloch vector', text: t`$r_x = \operatorname{Tr}(\rho\sigma_x) = 2\operatorname{Re}\rho_{01} = \tfrac12$, $r_y = 0$, $r_z = \rho_{00} - \rho_{11} = \tfrac12$. So $\vec r = (\tfrac12, 0, \tfrac12)$, $|\vec r| = ${fmt(Math.SQRT1_2, 4)}$: inside the ball.` },
      { label: 'Purity', text: t`$\operatorname{Tr}\rho^2 = \tfrac12(1 + |\vec r|^2) = \tfrac34$ — less than 1, so no state vector describes this beam. Eigenvalues $(1 \pm 0.7071)/2 = ${fmt((1 + Math.SQRT1_2) / 2, 4)}$ and $${fmt((1 - Math.SQRT1_2) / 2, 4)}$.` },
      { label: 'Measure x', text: t`$P(+x) = \tfrac12(1 + r_x) = \tfrac34$: half of the $|{+z}\rangle$ particles fail (a quarter of the beam), none of the $|{+x}\rangle$ ones do.` },
      { label: 'Superposition', text: t`The normalized superposition of $|{+z}\rangle$ and $|{+x}\rangle$ points midway between them on the **surface**: $\vec r = (\tfrac{1}{\sqrt2}, 0, \tfrac{1}{\sqrt2})$, purity 1, and $P(+x) = ${fmt((1 + Math.SQRT1_2) / 2, 4)}$. Same direction, different length: a mixture is not a superposition.` },
    ],
    answer: t`$\hat\rho = \begin{pmatrix}3/4 & 1/4\\ 1/4 & 1/4\end{pmatrix}$, $\vec r = (\tfrac12, 0, \tfrac12)$, $\operatorname{Tr}\rho^2 = \tfrac34$, $P(+x) = \tfrac34$ (the pure superposition gives ${fmt((1 + Math.SQRT1_2) / 2, 3)}).`,
  },
  practice: [
    num({
      id: 'purity', difficulty: 1,
      gen(r) {
        const R = r.pick([0, 0.3, 0.5, 0.8, 0.9]);
        const ans = (1 + R * R) / 2;
        return {
          prompt: t`A qubit’s Bloch vector has length $|\vec r| = ${R}$. What is its purity $\operatorname{Tr}\hat\rho^2$?`,
          visual: ball([r6(R * 0.6), 0, r6(R * 0.8)], `A Bloch vector of length ${R}. Drag to rotate.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: R * R, feedback: t`With $\rho = \tfrac12(1 + \vec r\cdot\vec\sigma)$, $\operatorname{Tr}\rho^2 = \tfrac12(1 + r^2)$ — even the centre has purity ½.` }, { value: R, feedback: 'Purity is quadratic in r.' }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`$\rho^2 = \tfrac14(1 + 2\vec r\cdot\vec\sigma + r^2)$ using $(\vec r\cdot\vec\sigma)^2 = r^2$; take the trace.`],
          teach: 'For a qubit, purity Tr ρ² = (1 + r²)/2: from ½ at the centre to 1 on the surface.',
          explain: t`$\operatorname{Tr}\rho^2 = \tfrac12(1 + ${R}^2) = ${fmt(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'mix-vs-sup', difficulty: 2,
      prompt: t`Beam P is the superposition $\tfrac{1}{\sqrt2}(|{+z}\rangle + |{-z}\rangle)$; beam Q is a 50 : 50 random mixture of $|{+z}\rangle$ and $|{-z}\rangle$. Which measurement tells them apart?`,
      visual: ball([0.98, 0, 0], 'Beam P’s Bloch vector (gold) on the surface at +x; beam Q’s is at the centre. Drag to rotate.'),
      choices: [
        t`Measuring $S_x$: P gives $+\hbar/2$ every time, Q gives each result half the time`,
        t`Measuring $S_z$: P gives 50 : 50, Q always gives $+\hbar/2$`,
        'No measurement can: both give 50 : 50 along z',
        'Measuring the energy',
      ],
      answer: 0,
      why: {
        1: 'Along z both give 50 : 50; that is exactly why they are easy to confuse.',
        2: 'They agree along z but not along x: P is the pure state |+x⟩.',
        3: 'Without a field the energy says nothing about spin direction.',
      },
      hints: [t`Write both density matrices: what differs is the off-diagonal element.`],
      teach: 'A superposition has off-diagonal elements (coherences) that a mixture lacks; measuring in a rotated basis reveals them.',
      explain: t`$\rho_P = \tfrac12\begin{pmatrix}1 & 1\\ 1 & 1\end{pmatrix} = |{+x}\rangle\langle{+x}|$ while $\rho_Q = \tfrac12\mathbb 1$. Along $x$, P always passes; Q passes half the time. The coherences $\rho_{01}$ carry the difference.`,
    }),
    num({
      id: 'expect', difficulty: 2,
      gen(r) {
        const a = r.pick([0.6, 0.7, 0.8]), c = r.pick([0.1, 0.2, -0.15, 0.25]), which = r.pick(['x', 'z']);
        const ans = which === 'x' ? 2 * c : 2 * a - 1;
        return {
          prompt: t`A qubit has $\hat\rho = \begin{pmatrix}${a} & ${c}\\ ${c} & ${fmt(1 - a, 2)}\end{pmatrix}$. What is $\langle\sigma_${which}\rangle = \operatorname{Tr}(\hat\rho\sigma_${which})$?`,
          visual: ball([r6(2 * c), 0, r6(2 * a - 1)], 'This density matrix’s Bloch vector (gold). Drag to rotate.'),
          answer: ans, tol: { rel: 0.005, abs: 1e-6 },
          errors: which === 'x' ? [{ value: c, feedback: t`$\operatorname{Tr}(\rho\sigma_x) = \rho_{01} + \rho_{10} = 2\operatorname{Re}\rho_{01}$.` }] : [{ value: a, feedback: t`$\operatorname{Tr}(\rho\sigma_z) = \rho_{00} - \rho_{11}$.` }],
          hints: [which === 'x' ? t`$\sigma_x = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$ swaps the columns: the trace picks up the two off-diagonal elements.` : t`$\sigma_z = \operatorname{diag}(1, -1)$: the trace is the difference of the diagonal elements.`],
          teach: 'Expectation values are traces: Tr(ρσ) reads the Bloch vector straight off the matrix.',
          explain: which === 'x' ? t`$\langle\sigma_x\rangle = 2\times${c} = ${fmt(ans, 3)}$.` : t`$\langle\sigma_z\rangle = ${a} - ${fmt(1 - a, 2)} = ${fmt(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'eig', difficulty: 3,
      gen(r) {
        const a = r.pick([0.5, 0.6, 0.75, 0.9]), c = r.pick([0.1, 0.2, 0.3]);
        const rr = Math.hypot(2 * c, 2 * a - 1), ans = (1 + rr) / 2;
        return {
          prompt: t`What is the larger eigenvalue of $\hat\rho = \begin{pmatrix}${a} & ${c}\\ ${c} & ${fmt(1 - a, 2)}\end{pmatrix}$? (This is the largest weight with which the state can be read as a mixture of two orthogonal pure states.)`,
          visual: ball([r6(2 * c), 0, r6(2 * a - 1)], 'The Bloch vector of this density matrix. Drag to rotate.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: a, feedback: 'The diagonal elements are the eigenvalues only when the off-diagonal ones vanish.' }, { value: (1 + rr * rr) / 2, feedback: t`That is the purity; the eigenvalues are $(1 \pm |\vec r|)/2$.` }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`$\vec r = (2\rho_{01}, 0, \rho_{00} - \rho_{11})$ here.`, t`The eigenvalues of $\tfrac12(1 + \vec r\cdot\vec\sigma)$ are $\tfrac12(1 \pm |\vec r|)$.`],
          teach: 'A qubit density matrix has eigenvalues (1 ± |r|)/2: it is a mixture of the pure states along +r and −r.',
          explain: t`$|\vec r| = \sqrt{(${fmt(2 * c, 2)})^2 + (${fmt(2 * a - 1, 2)})^2} = ${fmt(rr, 4)}$, so the eigenvalues are $${fmt(ans, 4)}$ and $${fmt(1 - ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'valid', difficulty: 2,
      prompt: t`Which matrix is **not** a valid density matrix?`,
      visual: ball([0, 0, 0.01], 'The Bloch ball: every valid qubit density matrix is a point inside or on it. Drag to rotate.'),
      choices: [
        t`$\begin{pmatrix}0.5 & 0.6\\ 0.6 & 0.5\end{pmatrix}$`,
        t`$\begin{pmatrix}0.5 & 0.5\\ 0.5 & 0.5\end{pmatrix}$`,
        t`$\begin{pmatrix}0.7 & 0\\ 0 & 0.3\end{pmatrix}$`,
        t`$\begin{pmatrix}0.5 & -0.3i\\ 0.3i & 0.5\end{pmatrix}$`,
      ],
      answer: 0,
      why: {
        1: t`This is $|{+x}\rangle\langle{+x}|$, a pure state on the surface ($r = 1$).`,
        2: t`Diagonal, positive, trace 1: a mixture with $\vec r = (0, 0, 0.4)$.`,
        3: t`Hermitian with $\vec r = (0, 0.6, 0)$, inside the ball.`,
      },
      hints: ['Check trace, Hermiticity and positivity — or compute the length of the Bloch vector.'],
      teach: 'A density matrix needs trace 1, Hermiticity and no negative eigenvalues: for a qubit, |r| ≤ 1.',
      explain: t`The first has $\vec r = (1.2, 0, 0)$, outside the ball: its eigenvalues are $1.1$ and $-0.1$, and a negative “probability” is impossible.`,
    }),
    num({
      id: 'dephase', difficulty: 2,
      gen(r) {
        const T2 = r.pick([10, 50, 100]), tt = r.pick([5, 20, 60, 100]);           // μs
        const rr = Math.exp(-tt / T2), ans = (1 + rr * rr) / 2;
        return {
          prompt: t`A qubit prepared in $|{+x}\rangle$ dephases: its off-diagonal elements decay as $e^{-t/T_2}$ while the populations stay ½. With $T_2 = ${T2}\ \mu\text{s}$, what is its purity after $${tt}\ \mu\text{s}$?`,
          visual: ball([r6(rr * 0.98), 0, 0], 'The Bloch vector shrinking along x as the qubit dephases. Drag to rotate.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (1 + rr) / 2, feedback: t`Purity is $\tfrac12(1 + r^2)$ with $r = e^{-t/T_2}$.` }, { value: rr, feedback: 'That is the Bloch vector’s length; the purity is (1 + r²)/2.' }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`$\vec r = (e^{-t/T_2}, 0, 0)$.`],
          teach: 'Dephasing shrinks the Bloch vector toward the z-axis: coherence, and purity, are lost without any energy changing.',
          explain: t`$r = e^{-${tt}/${T2}} = ${tex(rr, 4)}$, so $\operatorname{Tr}\rho^2 = ${fmt(ans, 4)}$. After many $T_2$ the state is the 50 : 50 mixture — the subject of lesson M8.3.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mri', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([1.5, 3, 7, 11.7]), T = r.pick([293, 310]);
        const x = (GAMMA_P * HBAR * B) / (2 * KB * T), ans = Math.tanh(x) * 1e6;
        return {
          prompt: t`Proton spins in a ${B} T MRI or NMR magnet at $${T}$ K are in thermal equilibrium: $\hat\rho \propto e^{-\hat H/kT}$ with $\hat H = -\tfrac12\gamma_p\hbar B\sigma_z$. Their Bloch vector points along the field with length $r = \tanh(\gamma_p\hbar B/2kT)$. What is $r$, in parts per million? ($\gamma_p = ${tex(GAMMA_P, 6)}\ \text{s}^{-1}\text{T}^{-1}$.)`,
          visual: ball([0, 0, 0.05], 'Thermal proton spins: a Bloch vector barely off the centre of the ball, along the field (exaggerated). Drag to rotate.'),
          answer: ans, units: '', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`The two energies are $\mp\tfrac12\gamma_p\hbar B$; their difference over $kT$ is $\gamma_p\hbar B/kT$, and $r = \tanh$ of half that.` }],
          hints: [t`$\rho = \dfrac{1}{Z}\begin{pmatrix}e^{x} & 0\\ 0 & e^{-x}\end{pmatrix}$ with $x = \gamma_p\hbar B/2kT$, so $r_z = \tanh x$.`, t`$x$ is tiny, so $\tanh x \approx x$.`],
          teach: 'A warm spin ensemble is almost completely mixed: MRI works with polarizations of a few parts per million.',
          explain: t`$x = ${tex(x, 4)}$, so $r = ${fmt(ans, 3)}$ ppm. The Bloch vector is almost at the centre of the ball — yet $10^{23}$ protons per cm³ of tissue make that tiny polarization measurable. Hyperpolarization techniques raise it by factors of $10^4$.`,
        };
      },
    }),
    mcq({
      id: 'cp-ensembles', difficulty: 3,
      prompt: t`Alice prepares qubits as a 50 : 50 mixture of $|{+z}\rangle$ and $|{-z}\rangle$; Bob prepares a 50 : 50 mixture of $|{+x}\rangle$ and $|{-x}\rangle$. Can any experiment on the qubits tell whose source is whose?`,
      visual: ball([0, 0, 0.01], 'Both sources give the Bloch vector at the centre of the ball. Drag to rotate.'),
      choices: [
        t`No: both have $\hat\rho = \tfrac12\mathbb 1$, and every prediction depends only on $\hat\rho$`,
        t`Yes, by measuring $S_z$`,
        t`Yes, by measuring $S_x$`,
        'Yes, by measuring many copies and doing quantum state tomography',
      ],
      answer: 0,
      why: {
        1: 'Both give 50 : 50 along z.',
        2: 'Both give 50 : 50 along x too.',
        3: 'Tomography reconstructs ρ — and finds the same ρ for both.',
      },
      hints: [t`Compute $\tfrac12(|{+x}\rangle\langle{+x}| + |{-x}\rangle\langle{-x}|)$.`, t`Every prediction is $\operatorname{Tr}(\rho A)$. If two sources have the same $\rho$, what can differ?`],
      teach: 'The density matrix is everything measurable: different recipes that give the same ρ are physically identical.',
      explain: t`Both average to $\tfrac12\mathbb 1$. Since $\langle A\rangle = \operatorname{Tr}(\rho A)$ for every $A$, no measurement distinguishes them — the decomposition of a mixed state into pure states is not unique. (If this were not so, entanglement could be used to signal faster than light.)`,
    }),
    num({
      id: 'cp-mixture', difficulty: 2,
      gen(r) {
        const p = r.pick([0.2, 0.3, 0.6, 0.8]);
        const rv = [1 - p, 0, p], R = Math.hypot(rv[0], rv[2]), ans = (1 + R * R) / 2;
        return {
          prompt: t`A source sends $|{+z}\rangle$ with probability $${p}$ and $|{+x}\rangle$ with probability $${fmt(1 - p, 2)}$. What is the purity of its density matrix?`,
          visual: ball([r6(rv[0]), 0, r6(rv[2])], 'The mixture’s Bloch vector (gold): the weighted average of +z and +x. Drag to rotate.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: p * p + (1 - p) * (1 - p), feedback: 'The two states are not orthogonal: average the Bloch vectors first, then use (1 + r²)/2.' }].filter((e) => Math.abs(e.value - ans) > 0.006),
          hints: [t`Bloch vectors average: $\vec r = ${p}\,\hat z + ${fmt(1 - p, 2)}\,\hat x$.`, t`Purity $= \tfrac12(1 + |\vec r|^2)$.`],
          teach: 'Mixing averages Bloch vectors, pulling the point inside the ball.',
          explain: t`$|\vec r|^2 = ${p}^2 + ${fmt(1 - p, 2)}^2 = ${fmt(R * R, 4)}$, so the purity is $${fmt(ans, 4)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §12.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Nielsen & Chuang, Quantum Computation and Quantum Information, §2.4', url: 'https://doi.org/10.1017/CBO9780511976667' },
  ],
});
