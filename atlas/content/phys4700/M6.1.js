// Spin ½ and the Pauli matrices (Griffiths & Schroeter §4.4.1; Sakurai
// §3.2). M1 met spin as a two-state system through Stern–Gerlach chains; this
// lesson gives it its algebra: S = (ħ/2)σ, σ_jσ_k = δ_jk + iε_jkl σ_l,
// (σ·a)(σ·b) = a·b + iσ·(a×b), so (σ·n)² = 1 and S·n has eigenvalues ±ħ/2
// for every direction; every 2×2 Hermitian matrix is a₀ + a·σ with
// eigenvalues a₀ ± |a|; S² = (3/4)ħ² for every state; rotations
// e^{−iασ·n/2}, with the sign change at 2π seen in neutron interferometry
// (Rauch et al. and Werner et al., 1975). Code: Pauli algebra checks.
// Transfer: spin qubits and the neutron 4π experiment. Every number is
// computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { blochPic, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;
const GAMMA_N = 1.83247174e8;          // s⁻¹ T⁻¹, neutron gyromagnetic ratio (magnitude, CODATA 2022)
const bv = (th, ph) => [Math.sin(th * D) * Math.cos(ph * D), Math.sin(th * D) * Math.sin(ph * D), Math.cos(th * D)].map(r6);

export default lesson({
  id: 'phys4700.M6.1',
  title: 'Spin ½ and the Pauli matrices',
  minutes: 16, difficulty: 3,
  intro: t`Spin ½ is angular momentum with $s = \tfrac12$ — the half-integer case the ladder algebra allowed and orbital motion forbade. Its operators are $2\times2$ matrices, $\hat{\vec S} = \tfrac{\hbar}{2}\vec\sigma$, built from the three **Pauli matrices**, whose whole algebra fits on one line:

$$\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix},\ \ \sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix},\ \ \sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}, \qquad \sigma_j\sigma_k = \delta_{jk}\,\mathbb 1 + i\epsilon_{jkl}\,\sigma_l$$

From it: every component $\hat n\cdot\vec\sigma$ squares to $\mathbb 1$, so a spin measured along **any** axis gives $\pm\hbar/2$; any Hermitian $2\times2$ matrix is $a_0\mathbb 1 + \vec a\cdot\vec\sigma$; and a rotation by $2\pi$ turns a spinor into minus itself.`,
  symbols: [
    { tex: '\\sigma_x,\\ \\sigma_y,\\ \\sigma_z', text: 'the Pauli matrices: Hermitian, unitary, traceless, each squaring to the identity' },
    { tex: '\\hat{\\vec S} = \\tfrac{\\hbar}{2}\\vec\\sigma', text: t`the spin operator of a spin-½ particle, in J s; its components obey $[\hat S_x, \hat S_y] = i\hbar\hat S_z$` },
    { tex: '\\delta_{jk}', text: t`the Kronecker delta: 1 if $j = k$, 0 otherwise` },
    { tex: '\\epsilon_{jkl}', text: t`the Levi-Civita symbol: $+1$ for $xyz$ and its cyclic orders, $-1$ for the others, $0$ if an index repeats` },
    { tex: '\\mathbb 1', text: t`the $2\times2$ identity matrix` },
    { tex: '\\hat n', text: t`a unit vector, at polar angle $\theta$ and azimuth $\phi$: $\hat n\cdot\vec\sigma$ is the spin component along it (in units of $\hbar/2$)` },
  ],
  why: 'Every two-level system — a qubit, an NMR proton, a hyperfine clock transition, a polarized photon — is written in Pauli matrices, so this algebra is the working language of quantum technology.',
  visual: {
    type: 'calc-vectors3d',
    title: 'A spin and a measurement axis',
    lead: t`The gold arrow is a spin state $|\psi\rangle$ on the Bloch sphere; the blue arrow is a measurement axis $\hat n$. The probability of $+\hbar/2$ along $\hat n$ is $\tfrac12(1 + \hat n\cdot\vec r)$, where $\vec r = \langle\vec\sigma\rangle$ is the state’s Bloch vector.`,
    tasks: [
      'Line the axis up with the state: P(+) = 1. Point it the opposite way: P(+) = 0.',
      'Put the axis at right angles to the state: P(+) = ½ whatever the direction — the analyser loop of M1 in three dimensions.',
      t`Change the state’s azimuth with the axis along $z$: nothing changes. The relative phase is invisible to $\sigma_z$ and decisive for $\sigma_x$ and $\sigma_y$.`,
    ],
    params: {
      range: 1.35, yaw: 0.55, pitch: 0.32,
      sliders: [
        { key: 'ts', label: t`State $\theta_\psi$`, min: 0, max: 180, step: 5, value: 60, unit: '^\\circ', explain: t`The state $\cos\tfrac{\theta_\psi}{2}|{+}\rangle + e^{i\phi_\psi}\sin\tfrac{\theta_\psi}{2}|{-}\rangle$: its polar angle on the sphere.` },
        { key: 'ps', label: t`State $\phi_\psi$`, min: 0, max: 360, step: 15, value: 0, unit: '^\\circ', explain: 'Its azimuth: the relative phase of the two amplitudes.' },
        { key: 'tn', label: t`Axis $\theta_n$`, min: 0, max: 180, step: 5, value: 90, unit: '^\\circ', explain: t`The measurement axis’s polar angle from $+z$.` },
        { key: 'pn', label: t`Axis $\phi_n$`, min: 0, max: 360, step: 15, value: 0, unit: '^\\circ', explain: 'Its azimuth from +x.' },
      ],
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
      vectors: [
        { to: ['sin(ts*pi/180)*cos(ps*pi/180)', 'sin(ts*pi/180)*sin(ps*pi/180)', 'cos(ts*pi/180)'], color: 'gold', label: '|\\psi\\rangle' },
        { to: ['sin(tn*pi/180)*cos(pn*pi/180)', 'sin(tn*pi/180)*sin(pn*pi/180)', 'cos(tn*pi/180)'], color: 'accent', label: '\\hat n' },
      ],
      readouts: [
        { label: t`$\langle\hat n\cdot\vec\sigma\rangle = \hat n\cdot\vec r$`, expr: 'sin(ts*pi/180)*sin(tn*pi/180)*cos((ps - pn)*pi/180) + cos(ts*pi/180)*cos(tn*pi/180)', digits: 3 },
        { label: t`$P(+\hbar/2\ \text{along}\ \hat n)$`, expr: '(1 + sin(ts*pi/180)*sin(tn*pi/180)*cos((ps - pn)*pi/180) + cos(ts*pi/180)*cos(tn*pi/180))/2', digits: 3 },
      ],
    },
    caption: 'The Bloch sphere: a pure spin-½ state up to its overall phase is a point on it, and the angle between two points is twice the angle between their kets. Drag to rotate.',
  },
  example: {
    prompt: t`(a) Use $\sigma_j\sigma_k = \delta_{jk} + i\epsilon_{jkl}\sigma_l$ to show $(\vec\sigma\cdot\vec a)(\vec\sigma\cdot\vec b) = \vec a\cdot\vec b + i\vec\sigma\cdot(\vec a\times\vec b)$. (b) Find the eigenvalues of $\hat S_n = \tfrac{\hbar}{2}\hat n\cdot\vec\sigma$ without diagonalizing. (c) Find the eigenvalues of $\mathsf H = \begin{pmatrix} 3 & 1 - 2i \\ 1 + 2i & -1 \end{pmatrix}$ (in eV) the same way.`,
    visual: { type: 'calc-vectors3d', params: { range: 3.3, yaw: 0.7, pitch: 0.35, vectors: [{ to: [1, 2, 2], color: 'gold', label: '\\vec a = (1, 2, 2)' }], components: [{ to: [1, 2, 2], color: 'ink3' }] }, caption: t`The vector $\vec a$ hidden in $\mathsf H$: its length 3 is half the gap between the eigenvalues. Drag to rotate.` },
    steps: [
      { label: 'Multiply out', text: t`$(\vec\sigma\cdot\vec a)(\vec\sigma\cdot\vec b) = \sum_{jk}a_jb_k\sigma_j\sigma_k = \sum_{jk}a_jb_k\big(\delta_{jk} + i\epsilon_{jkl}\sigma_l\big) = \vec a\cdot\vec b + i\sum_l\sigma_l(\vec a\times\vec b)_l$.` },
      { label: 'Square a component', text: t`With $\vec a = \vec b = \hat n$: $(\hat n\cdot\vec\sigma)^2 = \hat n\cdot\hat n + 0 = \mathbb 1$. An operator whose square is $\mathbb 1$ has eigenvalues whose squares are 1: $\pm1$.` },
      { label: 'Any direction', text: t`So $\hat S_n$ has eigenvalues $\pm\hbar/2$ for every $\hat n$ — exactly what tilted Stern–Gerlach analysers find. Its $+$ eigenvector is $\big(\cos\tfrac\theta2,\ e^{i\phi}\sin\tfrac\theta2\big)$.` },
      { label: 'Decompose', text: t`Every Hermitian $2\times2$ matrix is $a_0\mathbb 1 + \vec a\cdot\vec\sigma$ with $a_0 = \tfrac12\operatorname{Tr}\mathsf H$ and $a_k = \tfrac12\operatorname{Tr}(\mathsf H\sigma_k)$. Here $a_0 = 1$, $a_z = 2$, and the off-diagonal $1 - 2i = a_x - ia_y$ gives $a_x = 1$, $a_y = 2$.` },
      { label: 'Eigenvalues', text: t`$\mathsf H = \mathbb 1 + |\vec a|\,(\hat a\cdot\vec\sigma)$ with $|\vec a| = \sqrt{1 + 4 + 4} = 3$, so the eigenvalues are $1 \pm 3$: $4$ eV and $-2$ eV. Check: trace $2$ ✓, determinant $-3 - |1 - 2i|^2 = -8 = 4\times(-2)$ ✓.` },
      { label: 'Meaning', text: t`Any two-level Hamiltonian is a spin in an effective magnetic field along $\vec a$: the levels sit at $a_0 \pm |\vec a|$, and the eigenstates are “spin up” and “spin down” along $\hat a$.` },
    ],
    answer: t`$(\vec\sigma\cdot\vec a)(\vec\sigma\cdot\vec b) = \vec a\cdot\vec b + i\vec\sigma\cdot(\vec a\times\vec b)$; $\hat S_n$ has eigenvalues $\pm\hbar/2$; $\mathsf H$ has eigenvalues $4$ eV and $-2$ eV.`,
  },
  practice: [
    num({
      id: 'decompose', difficulty: 2,
      gen(r) {
        const [ax, ay, az, A] = r.pick([[1, 2, 2, 3], [2, 1, 2, 3], [2, 3, 6, 7], [2, 6, 3, 7], [1, 4, 8, 9], [4, 4, 7, 9], [4, 8, 1, 9], [2, 6, 9, 11]]);
        const a0 = r.pick([0, 1, 2, -1]), sy = r.sign();
        const ans = a0 + A;
        const off = (sg) => t`${ax} ${sg * sy < 0 ? '-' : '+'} ${ay}i`;
        return {
          prompt: t`Find the larger eigenvalue (in μeV) of the Hermitian matrix $\mathsf H = \begin{pmatrix} ${a0 + az} & ${off(-1)} \\ ${off(1)} & ${a0 - az} \end{pmatrix}$ μeV, by writing it as $a_0\mathbb 1 + \vec a\cdot\vec\sigma$.`,
          visual: { type: 'calc-vectors3d', params: { range: r6(A * 1.1), yaw: 0.7, pitch: 0.35, vectors: [{ to: [ax, sy * ay, az], color: 'gold', label: '\\vec a' }], components: [{ to: [ax, sy * ay, az], color: 'ink3' }] }, caption: 'The vector a read from the matrix, with its components dashed. Drag to rotate.' },
          answer: ans, units: 'μeV', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a0 + az, feedback: t`That is a diagonal entry; it is an eigenvalue only if the off-diagonal part vanishes.` }, { value: a0 + Math.sqrt(az * az + ax * ax), feedback: t`The off-diagonal entry $a_x - ia_y$ carries both $a_x$ and $a_y$: $|\vec a| = \sqrt{a_x^2 + a_y^2 + a_z^2}$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$a_0$ is the average of the diagonal entries, $a_z$ half their difference, and the lower-left entry is $a_x + ia_y$.`, t`The eigenvalues are $a_0 \pm |\vec a|$.`],
          teach: 'A 2×2 Hermitian matrix a₀ + a·σ has eigenvalues a₀ ± |a|: a spin in an effective field a.',
          explain: t`$a_0 = ${a0}$ and $\vec a = (${ax}, ${sy * ay}, ${az})$ with $|\vec a| = ${A}$: eigenvalues $${a0 + A}$ and $${a0 - A}$ μeV.`,
        };
      },
    }),
    mcq({
      id: 'product', difficulty: 2,
      prompt: t`What is $\sigma_y\sigma_x$?`,
      visual: blochPic({ caption: t`The axes $x \to y \to z$ in right-handed cyclic order: $\sigma_x\sigma_y = i\sigma_z$ follows it, and going against it flips the sign. Drag to rotate.` }),
      choices: [t`$-i\sigma_z$`, t`$i\sigma_z$`, t`$\sigma_z$`, t`$0$`],
      answer: 0,
      why: {
        1: t`$\sigma_x\sigma_y = i\sigma_z$; reversing the order flips the sign, because $\epsilon_{yxz} = -1$.`,
        2: t`The product of two Pauli matrices carries a factor $\pm i$; check $\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$.`,
        3: t`Different Pauli matrices **anti**commute: $\sigma_x\sigma_y + \sigma_y\sigma_x = 0$. Their product is not zero.`,
      },
      hints: [t`$\sigma_j\sigma_k = i\epsilon_{jkl}\sigma_l$ for $j \ne k$, and $\epsilon_{yxz} = -1$.`],
      teach: 'Distinct Pauli matrices anticommute, and their product is ±i times the third.',
      explain: t`$\sigma_y\sigma_x = \begin{pmatrix} -i & 0 \\ 0 & i \end{pmatrix} = -i\sigma_z$. With $\sigma_x\sigma_y = i\sigma_z$ this gives $[\sigma_x, \sigma_y] = 2i\sigma_z$ — i.e. $[\hat S_x, \hat S_y] = i\hbar\hat S_z$ — and $\{\sigma_x, \sigma_y\} = 0$.`,
    }),
    num({
      id: 'p-n', difficulty: 2,
      gen(r) {
        const [ts, ps] = r.pick([[60, 0], [90, 90], [45, 180], [120, 45], [30, 270]]);
        const [tn, pn] = r.pick([[90, 0], [90, 90], [0, 0], [60, 90], [120, 0]]);
        const rv = bv(ts, ps), nv = bv(tn, pn), d0 = rv[0] * nv[0] + rv[1] * nv[1] + rv[2] * nv[2], dot = Math.abs(d0) < 1e-6 ? 0 : d0;
        const ans = (1 + dot) / 2;
        return {
          prompt: t`A spin ½ is in the state whose Bloch vector points at $\theta = ${ts}^\circ$, $\phi = ${ps}^\circ$. Its spin is measured along $\hat n$ at $\theta = ${tn}^\circ$, $\phi = ${pn}^\circ$. What is the probability of $+\hbar/2$?`,
          visual: blochPic({ states: [{ v: rv, label: '|\\psi\\rangle' }, { v: nv, label: '\\hat n', color: 'accent' }], caption: 'The state’s Bloch vector (gold) and the measurement axis (blue). Drag to rotate.' }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: dot, feedback: t`$\hat n\cdot\vec r$ is the expectation value of $\hat n\cdot\vec\sigma$, ranging from $-1$ to $1$. The probability is $\tfrac12(1 + \hat n\cdot\vec r)$.` }, { value: Math.cos(Math.acos(Math.max(-1, Math.min(1, dot)))) ** 2, feedback: t`On the Bloch sphere the relevant half-angle is $\gamma/2$: $P = \cos^2(\gamma/2) = \tfrac12(1 + \cos\gamma)$, not $\cos^2\gamma$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Compute $\vec r = (\sin\theta\cos\phi, \sin\theta\sin\phi, \cos\theta)$ for both, and their dot product $\cos\gamma$.`, t`$P(+) = \tfrac12(1 + \cos\gamma) = \cos^2(\gamma/2)$.`],
          teach: 'The probability of spin up along n̂ is ½(1 + n̂·r): it depends only on the angle between the two points on the Bloch sphere.',
          explain: t`$\hat n\cdot\vec r = ${fmt(dot, 4)}$, so $P = \tfrac12(1 + ${fmt(dot, 4)}) = ${fmt(ans, 4)}$. This is $\langle\psi|\tfrac12(\mathbb 1 + \hat n\cdot\vec\sigma)|\psi\rangle$: the projector onto spin-up along $\hat n$ is $\tfrac12(\mathbb 1 + \hat n\cdot\vec\sigma)$.`,
        };
      },
    }),
    mcq({
      id: 's-squared', difficulty: 2,
      prompt: t`What is $\hat S^2 = \hat S_x^2 + \hat S_y^2 + \hat S_z^2$ for spin ½, and which states are its eigenstates?`,
      visual: blochPic({ caption: 'Every point on the sphere is a spin-½ state; they all have the same S². Drag to rotate.' }),
      choices: [
        t`$\tfrac34\hbar^2\,\mathbb 1$: every state is an eigenstate`,
        t`$\tfrac14\hbar^2\,\mathbb 1$, since each component is $\pm\hbar/2$`,
        t`$\tfrac34\hbar^2$, but only for $|{+z}\rangle$ and $|{-z}\rangle$`,
        t`$\hbar^2\,\mathbb 1$, the square of the largest spin`,
      ],
      answer: 0,
      why: {
        1: t`Each component squared is $\tfrac{\hbar^2}{4}\mathbb 1$, and there are three of them: $\tfrac34\hbar^2$.`,
        2: t`$\hat S^2$ is proportional to the identity, so it has the same value on every state.`,
        3: t`$s(s+1)\hbar^2$ with $s = \tfrac12$ is $\tfrac34\hbar^2$; the spin’s “length” $\tfrac{\sqrt3}{2}\hbar$ exceeds its largest component.`,
      },
      hints: [t`$\sigma_k^2 = \mathbb 1$ for each $k$.`],
      teach: 'S² = s(s + 1)ħ² = ¾ħ² is the same for every spin-½ state: the length of a spin is fixed, only its direction varies.',
      explain: t`$\hat S^2 = \tfrac{\hbar^2}{4}(\sigma_x^2 + \sigma_y^2 + \sigma_z^2) = \tfrac34\hbar^2\mathbb 1 = s(s+1)\hbar^2$ with $s = \tfrac12$. Spin ½ is not a state that can be changed: it is a fixed property of the electron, proton or neutron.`,
    }),
    code({
      id: 'pauli', difficulty: 3,
      prompt: t`Check the Pauli algebra numerically. Define \`sx, sy, sz\` and the list \`s = [sx, sy, sz]\`. Write \`levi(j, k, l)\` (the Levi-Civita symbol for indices 0, 1, 2), \`spin_n(theta, phi)\` returning $\hat n\cdot\vec\sigma$, and \`rot(alpha, n)\` returning $e^{-i\alpha\,\hat n\cdot\vec\sigma/2} = \cos\tfrac\alpha2\,\mathbb 1 - i\sin\tfrac\alpha2\,\hat n\cdot\vec\sigma$ for a unit 3-vector \`n\`.`,
      starter: t`import numpy as np

sx = None
sy = None
sz = None
s = [sx, sy, sz]

def levi(j, k, l):
    pass

def spin_n(theta, phi):
    pass

def rot(alpha, n):
    pass
`,
      answer: t`import numpy as np

sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = np.array([[0, -1j], [1j, 0]])
sz = np.array([[1, 0], [0, -1]], dtype=complex)
s = [sx, sy, sz]

def levi(j, k, l):
    return (j - k) * (k - l) * (l - j) / 2

def spin_n(theta, phi):
    n = [np.sin(theta) * np.cos(phi), np.sin(theta) * np.sin(phi), np.cos(theta)]
    return sum(n[k] * s[k] for k in range(3))

def rot(alpha, n):
    return np.cos(alpha / 2) * np.eye(2) - 1j * np.sin(alpha / 2) * sum(n[k] * s[k] for k in range(3))
`,
      tests: [
        { name: t`$\sigma_j\sigma_k = \delta_{jk} + i\epsilon_{jkl}\sigma_l$ for all nine pairs`, code: 'all(np.allclose(s[j] @ s[k], (j == k) * np.eye(2) + 1j * sum(levi(j, k, l) * s[l] for l in range(3))) for j in range(3) for k in range(3))' },
        { name: t`$\hat n\cdot\vec\sigma$ has eigenvalues $\pm1$ for any direction`, code: 'np.allclose(np.linalg.eigvalsh(spin_n(1.1, 2.3)), [-1, 1])' },
        { name: t`$(\vec\sigma\cdot\vec a)(\vec\sigma\cdot\vec b) = \vec a\cdot\vec b + i\vec\sigma\cdot(\vec a\times\vec b)$`, code: '(lambda a, b: np.allclose(sum(a[k] * s[k] for k in range(3)) @ sum(b[k] * s[k] for k in range(3)), np.dot(a, b) * np.eye(2) + 1j * sum(np.cross(a, b)[k] * s[k] for k in range(3))))(np.array([0.3, -1.2, 2.0]), np.array([1.5, 0.4, -0.7]))' },
        { name: t`a $2\pi$ rotation gives $-\mathbb 1$, a $4\pi$ rotation $+\mathbb 1$`, code: 'np.allclose(rot(2 * np.pi, [0, 0, 1]), -np.eye(2)) and np.allclose(rot(4 * np.pi, [0.6, 0, 0.8]), np.eye(2))' },
        { name: t`$\mathrm{rot}(\pi, \hat x)$ takes $|{+z}\rangle$ to $|{-z}\rangle$ (up to a phase)`, code: 'abs(abs((rot(np.pi, [1, 0, 0]) @ np.array([1, 0]))[1]) - 1) < 1e-12' },
      ],
      hints: ['`(j - k) * (k - l) * (l - j) / 2` is +1, −1 or 0 for indices 0, 1, 2.', 'For rot: `np.cos(alpha/2) * np.eye(2) - 1j * np.sin(alpha/2) * (n·σ)`.'],
      teach: 'The Pauli algebra σⱼσₖ = δⱼₖ + iεⱼₖₗσₗ contains everything: eigenvalues along any axis, rotations, and the sign change at 2π.',
      explain: t`The closed form of the rotation follows from $(\hat n\cdot\vec\sigma)^2 = \mathbb 1$: the exponential series splits into even terms ($\cos$) and odd terms ($-i\,\hat n\cdot\vec\sigma\sin$). Because of the half angle, a full turn multiplies every spinor by $-1$ — unobservable for one spinor, but measurable when one half of a beam is turned and the other is not.`,
    }),
    num({
      id: 'rotate', difficulty: 3,
      gen(r) {
        const a = r.pick([30, 60, 90, 120, 150, 240]);
        const ans = Math.cos((a * D) / 2) ** 2;
        return {
          prompt: t`A spin starts in $|{+x}\rangle$. It is rotated by $\alpha = ${a}^\circ$ about the $z$-axis, $|\psi\rangle = e^{-i\alpha\sigma_z/2}|{+x}\rangle$. What is the probability that a measurement of $S_x$ now gives $+\hbar/2$?`,
          visual: blochPic({ states: [{ v: [1, 0, 0], label: '|{+x}\\rangle' }], extra: { curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, r6(a * D)], color: 'gold' }] }, caption: 'The start, +x, and the arc the Bloch vector sweeps as it is rotated about z. Drag to rotate.' }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: Math.cos(a * D) ** 2, feedback: t`The rotation turns the Bloch vector by the full angle $\alpha$, so $P = \cos^2(\alpha/2)$ — the half angle belongs to the ket, not the sphere.` }, { value: Math.cos((a * D) / 4) ** 2, feedback: t`$e^{-i\alpha\sigma_z/2}$ already contains the half angle; the Bloch vector turns by $\alpha$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$e^{-i\alpha\sigma_z/2}\tfrac{1}{\sqrt2}(1, 1) = \tfrac{1}{\sqrt2}(e^{-i\alpha/2}, e^{i\alpha/2})$: up to a phase, the state at azimuth $\alpha$.`, t`$|\langle{+x}|\psi\rangle|^2 = \cos^2(\alpha/2)$.`],
          teach: t`$e^{-i\alpha\,\hat n\cdot\vec\sigma/2}$ turns the Bloch vector by $\alpha$ about $\hat n$: the half angle in the ket is a full angle on the sphere.`,
          explain: t`$\langle{+x}|\psi\rangle = \tfrac12(e^{-i\alpha/2} + e^{i\alpha/2}) = \cos\tfrac\alpha2$, so $P = \cos^2${a / 2}^\circ = ${fmt(ans, 4)}$. The Bloch vector has moved ${a}° round the equator; this is how a magnetic field precesses a spin (next lesson).`,
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-qubit', difficulty: 2, transfer: true,
      prompt: t`In a silicon spin qubit, a microwave pulse of the right length applies $\hat U = e^{-i\pi\sigma_x/2}$ to the electron’s spin — a “π pulse about $x$”. What does it do to the qubit states $|0\rangle = |{\uparrow}\rangle$ and $|1\rangle = |{\downarrow}\rangle$?`,
      visual: blochPic({ states: [{ v: [0, 0, 1], label: '|0\\rangle' }], extra: { curves: [{ param: ['0', '-sin(t)', 'cos(t)'], t: [0, 3.1416], color: 'gold' }] }, caption: 'The path of the Bloch vector during a π rotation about x, from |0⟩ at the north pole. Drag to rotate.' }),
      choices: [
        t`$\hat U = -i\sigma_x$: it swaps $|0\rangle$ and $|1\rangle$ (a NOT gate), up to an unobservable overall phase $-i$`,
        t`It leaves both unchanged, since a rotation by $\pi$ only changes phases`,
        t`It takes $|0\rangle$ to $(|0\rangle + |1\rangle)/\sqrt2$`,
        t`It takes $|0\rangle$ to $-|0\rangle$`,
      ],
      answer: 0,
      why: {
        1: t`$\cos\tfrac\pi2 = 0$ and $\sin\tfrac\pi2 = 1$: $\hat U = -i\sigma_x$, which exchanges the components.`,
        2: t`That is a $\pi/2$ pulse, $e^{-i\pi\sigma_x/4}$, which leaves the spin on the equator.`,
        3: t`$-\mathbb 1$ comes from a $2\pi$ rotation, not $\pi$.`,
      },
      hints: [t`$e^{-i\alpha\sigma_x/2} = \cos\tfrac\alpha2\,\mathbb 1 - i\sin\tfrac\alpha2\,\sigma_x$.`],
      teach: t`A $\pi$ rotation about $x$ is a bit flip: $e^{-i\pi\sigma_x/2} = -i\sigma_x$.`,
      explain: t`$\hat U = -i\sigma_x$ sends $|0\rangle \to -i|1\rangle$ and $|1\rangle \to -i|0\rangle$: a NOT gate. Spin-qubit processors build every operation from such rotations, set by the length and phase of microwave pulses.`,
    }),
    num({
      id: 'cp-neutron', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([2000, 2200, 1500]), L = r.pick([1, 2, 3]);       // m/s, cm
        const ans = (4 * Math.PI * v) / (GAMMA_N * L / 100) * 1e3;      // mT
        return {
          prompt: t`In 1975 two groups split a beam of thermal neutrons in an interferometer and let a magnetic field turn the spins on one path only. The precession angle there is $\alpha = \gamma_nBL/v$, with $|\gamma_n| = ${fmt(GAMMA_N / 1e8, 9)}\times10^{8}\ \text{s}^{-1}\text{T}^{-1}$. The recombined intensity varies as $\cos(\alpha/2)$, because the turned spinor picks up $e^{-i\alpha\sigma/2}$. For neutrons at $v = ${v}$ m/s crossing a field region $L = ${L}$ cm long, what field $B$, in mT, first restores the original intensity?`,
          visual: { type: 'graph', params: { x: [0, 4.5], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'precession angle α / 2π', ylabel: 'interference term', xticks: 9, yticks: 2, axesAt: 'edge', curves: [{ fn: 'cos(pi*x)', color: 'accent', width: 2.4 }] }, caption: 'The interference term cos(α/2) against the precession angle in turns: it repeats every two full turns, not one.' },
          answer: ans, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`At $\alpha = 2\pi$ the turned spinor is $-1$ times the other: the interference term is reversed, not restored. It takes $4\pi$.` }],
          hints: [t`The intensity returns when $\cos(\alpha/2) = 1$ again: $\alpha = 4\pi$.`, t`$B = \dfrac{4\pi v}{\gamma_nL}$.`],
          teach: 'A spinor needs a 4π rotation to return to itself; neutron interferometry measured that sign directly.',
          explain: t`$B = 4\pi\times${v}/(${tex(GAMMA_N, 6)}\times${L / 100}) = ${fmt(ans, 3)}$ mT. Rauch’s and Werner’s groups both found the intensity repeating after close to $720^\circ$ of precession, not $360^\circ$: the first direct test that a $360^\circ$ turn multiplies a spinor by $-1$.`,
        };
      },
    }),
    mcq({
      id: 'cp-xyz', difficulty: 2,
      prompt: t`What is the product $\sigma_x\sigma_y\sigma_z$?`,
      choices: [t`$i\,\mathbb 1$`, t`$\mathbb 1$`, t`$-i\,\mathbb 1$`, t`$0$`],
      answer: 0,
      why: {
        1: t`$\sigma_x\sigma_y = i\sigma_z$, and then $i\sigma_z\sigma_z = i\mathbb 1$: the factor $i$ survives.`,
        2: t`The order matters: $\sigma_z\sigma_y\sigma_x$ is $-i\mathbb 1$, but $\sigma_x\sigma_y\sigma_z$ is $+i\mathbb 1$.`,
        3: t`Pauli matrices are invertible ($\sigma_k^2 = \mathbb 1$), so no product of them can vanish.`,
      },
      hints: [t`First $\sigma_x\sigma_y = i\sigma_z$; then use $\sigma_z^2 = \mathbb 1$.`],
      teach: 'Products of Pauli matrices reduce, two at a time, by σⱼσₖ = δⱼₖ + iεⱼₖₗσₗ.',
      explain: t`$\sigma_x\sigma_y\sigma_z = (i\sigma_z)\sigma_z = i\mathbb 1$. It is a handy check of sign conventions: with the matrices above, $\sigma_x\sigma_y\sigma_z = i\mathbb 1$.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.4.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Rauch et al., “Verification of coherent spinor rotation of fermions”, Phys. Lett. A 54, 425 (1975)', url: 'https://doi.org/10.1016/0375-9601(75)90798-7' },
    { label: 'Werner, Colella, Overhauser & Eagen, “Observation of the phase shift of a neutron due to precession in a magnetic field”, Phys. Rev. Lett. 35, 1053 (1975)', url: 'https://doi.org/10.1103/PhysRevLett.35.1053' },
  ],
});
