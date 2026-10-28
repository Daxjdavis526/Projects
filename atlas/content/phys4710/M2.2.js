// Rotations and angular momentum (Griffiths & Schroeter §6.5; Sakurai §3.1–
// 3.2). R̂(φ, n̂) = e^(−iφ n̂·Ĵ/ħ): angular momentum generates rotations. On
// |l m⟩, R̂_z(φ) gives e^(−imφ); for half-integer spin a 2π turn gives −1,
// seen as a relative phase in neutron interferometry (Rauch et al. 1975;
// Werner et al. 1975: 704 ± 38°, Rauch et al. 1978: 716.8 ± 3.8° for the
// predicted 720°). Rotations about different axes do not commute; their
// group commutator R_x(ε)R_y(ε)R_x(−ε)R_y(−ε) ≈ R_z(ε²) is [Ĵ_x, Ĵ_y] = iħĴ_z.
// Scalar operators commute with Ĵ, so a rotationally symmetric Ĥ conserves J.
// Explore: one vector rotated about z then x, and about x then z (calc-
// vectors3d). Code: spin matrices for any j and rotation operators by matrix
// exponential (SciPy expm), R(2π) = (−1)^(2j). Transfers: the neutron
// interferometer's field period; an MRI π/2 pulse. CODATA 2022 γ_n, γ_p.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { GAMMA_P } from '../phys4700/_qm.js';
import { H, MN, GAMMA_N, r6 } from './_q2.js';

const t = String.raw;
const D = Math.PI / 180;

/** A polar curve with m-fold ripple, drawn over two full turns (closes after 2π only for integer m). */
const ripplePic = (m, caption) => ({
  type: 'graph',
  params: {
    x: [-1.6, 1.6], y: [-1.45, 1.45], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ polar: `1 + 0.3*cos(${m}*theta)`, theta: [0, r6(2 * Math.PI)], color: 'accent', width: 2.4 }, { polar: `1 + 0.3*cos(${m}*theta)`, theta: [r6(2 * Math.PI), r6(4 * Math.PI)], color: 'gold', width: 1.6, dash: [5, 4] }],
  },
  caption,
});

// the arrow (0.8, 0, 0.6) turned about z by ph then x by th (GV), and about x then z (VV); angles in degrees
const c = (a) => `cos(${a}*pi/180)`, sn = (a) => `sin(${a}*pi/180)`;
const GV = [`0.8*${c('ph')}`, `0.8*${sn('ph')}*${c('th')} - 0.6*${sn('th')}`, `0.8*${sn('ph')}*${sn('th')} + 0.6*${c('th')}`];
const VV = [`0.8*${c('ph')} + 0.6*${sn('th')}*${sn('ph')}`, `0.8*${sn('ph')} - 0.6*${sn('th')}*${c('ph')}`, `0.6*${c('th')}`];

export default lesson({
  id: 'phys4710.M2.2',
  title: 'Rotations and angular momentum',
  minutes: 18, difficulty: 3,
  intro: t`What momentum is to translations, angular momentum is to rotations. Turning a state through an angle $\phi$ about the $z$-axis is done by

$$\hat R_z(\phi) = e^{-i\phi\hat J_z/\hbar}$$

and about any axis $\hat n$ by $e^{-i\phi\,\hat n\cdot\hat{\vec J}/\hbar}$, where $\hat{\vec J}$ is the total angular momentum, orbital plus spin. On a state $|j\,m\rangle$ the rotation is just a phase, $e^{-im\phi}$. Two consequences follow at once. Rotations about different axes do not commute, and that is precisely $[\hat J_x, \hat J_y] = i\hbar\hat J_z$. And for half-integer $j$ a full turn, $\phi = 2\pi$, gives $e^{-i\pi} = -1$: **a spinor must turn twice to come back**. If $\hat H$ is unchanged by every rotation, it commutes with $\hat{\vec J}$, and angular momentum is conserved.`,
  symbols: [
    { tex: '\\hat R_z(\\phi)', text: t`the rotation operator: turns a state through angle $\phi$ (radians) about the $z$-axis` },
    { tex: '\\hat J_z', text: t`the $z$-component of total angular momentum, $\hat L_z + \hat S_z$, the generator of rotations about $z$` },
    { tex: '\\phi', text: 'the rotation angle, in radians' },
    { tex: '\\hbar', text: t`makes $\phi\hat J_z/\hbar$ dimensionless; eigenvalues of $\hat J_z$ are $m\hbar$` },
    { tex: 'm', text: t`the magnetic quantum number: integer for orbital angular momentum, half-integer for spin ½ and every odd number of spin-½ particles` },
  ],
  why: 'Rotation generators organize atoms, nuclei and particles into multiplets, give selection rules, and lead to spinors — the objects GR and field theory need to describe electrons in curved spacetime.',
  visual: {
    type: 'calc-vectors3d',
    title: 'The order of rotations matters',
    lead: t`One arrow, two routes. Gold: turned first by $\phi$ about $z$, then by $\theta$ about $x$. Violet: about $x$ first, then $z$. Both start from the white arrow.`,
    tasks: [
      'Make both angles large (60°): the two routes end far apart. Rotations about different axes do not commute.',
      t`Make both small (10°): the gap shrinks much faster than either angle, as the product $\theta\phi$ — the second-order effect that the commutator $[\hat J_x, \hat J_y] = i\hbar\hat J_z$ measures.`,
      'Set either angle to zero: the routes agree. A rotation always commutes with rotations about its own axis.',
    ],
    params: {
      range: 1.3, yaw: 1.5, pitch: 0.3,
      sliders: [
        { key: 'ph', label: t`Angle $\phi$ about $z$`, min: 0, max: 90, step: 1, value: 60, unit: '^\\circ', explain: 'The rotation about the vertical z-axis.' },
        { key: 'th', label: t`Angle $\theta$ about $x$`, min: 0, max: 90, step: 1, value: 60, unit: '^\\circ', explain: 'The rotation about the x-axis.' },
      ],
      vectors: [
        { to: [0.8, 0, 0.6], color: 'ink2', label: '\\vec v' },
        { to: GV, color: 'gold', label: 'R_xR_z\\vec v' },
        { to: VV, color: 'violet', label: 'R_zR_x\\vec v' },
      ],
      readouts: [{ label: 'distance between the two tips', expr: `sqrt((${GV[0]} - ${VV[0]})^2 + (${GV[1]} - ${VV[1]})^2 + (${GV[2]} - ${VV[2]})^2)`, digits: 3 }],
    },
    caption: 'Exact rotation matrices acting on a unit arrow. Drag to turn the view.',
  },
  example: {
    prompt: t`Write $\hat R_z(\phi)$ for a spin-½ particle as a $2\times2$ matrix, show that $\phi = 2\pi$ gives $-1$, and say how a neutron interferometer can see that sign.`,
    visual: ripplePic(0.5, 'A curve with “m = ½” symmetry, r = 1 + 0.3 cos(θ/2): the first turn (blue) ends where the second (gold, dashed) begins, and only after 4π does it close.'),
    steps: [
      { label: 'Generator', text: t`For spin ½, $\hat J_z = \hat S_z = \tfrac{\hbar}{2}\sigma_z$, diagonal with entries $\pm\tfrac{\hbar}{2}$.` },
      { label: 'Exponentiate', text: t`A diagonal matrix exponentiates entry by entry: $\hat R_z(\phi) = \begin{pmatrix} e^{-i\phi/2} & 0 \\ 0 & e^{i\phi/2} \end{pmatrix}$.` },
      { label: 'Full turn', text: t`At $\phi = 2\pi$ both entries are $e^{\mp i\pi} = -1$: $\hat R_z(2\pi) = -\mathbb 1$. Every spin-½ state changes sign; only $\phi = 4\pi$ restores it.` },
      { label: 'Is it physical?', text: t`An overall sign is unobservable. But split a neutron beam in two, rotate the spin on one path only, and recombine: the intensity is $\propto 1 + \cos(\alpha/2)$, where $\alpha$ is the rotation angle. A $2\pi$ rotation turns constructive interference into destructive.` },
      { label: 'The experiment', text: t`A field $B$ over a length $L$ rotates the spin by $\alpha = \gamma_nBL/v$ (Larmor precession). Rauch’s and Werner’s groups (1975) found the intensity repeats every $\alpha = 704^\circ \pm 38^\circ$ in one measurement and $716.8^\circ \pm 3.8^\circ$ in a later one — the predicted $720^\circ$, not $360^\circ$.` },
    ],
    answer: t`$\hat R_z(\phi) = \mathrm{diag}(e^{-i\phi/2}, e^{i\phi/2})$, so $\hat R_z(2\pi) = -1$ and $\hat R_z(4\pi) = 1$; seen as a relative phase between two paths, the intensity period is a $4\pi$ rotation.`,
  },
  practice: [
    num({
      id: 'return-angle', difficulty: 2,
      gen(r) {
        const [mTeX, m] = r.pick([['1', 1], ['2', 2], ['3', 3], ['\\tfrac12', 0.5], ['\\tfrac32', 1.5]]);
        const ans = 360 / m;
        return {
          prompt: t`What is the smallest angle $\phi > 0$ for which $\hat R_z(\phi)|j\,m\rangle = |j\,m\rangle$ exactly, for $m = ${mTeX}$? Give it in degrees.`,
          visual: ripplePic(m, t`A curve $r = 1 + 0.3\cos(m\theta)$ for this $m$: blue over the first turn, gold dashed over the second.`),
          answer: ans, units: 'deg', tol: { rel: 0.001 },
          errors: [{ value: 360, feedback: m < 1 ? t`For half-integer $m$, a $360^\circ$ turn gives $e^{-i\pi\cdot2m} = -1$, not $+1$.` : t`$e^{-im\phi} = 1$ already at $\phi = 360^\circ/m$.` }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`$\hat R_z(\phi)|j\,m\rangle = e^{-im\phi}|j\,m\rangle$.`, t`You need $m\phi = 2\pi$.`],
          teach: 'A state with quantum number m picks up the phase e^(−imφ) when rotated about z; it is unchanged when mφ is a multiple of 2π.',
          explain: t`$m\phi = 2\pi$ gives $\phi = 360^\circ/${mTeX} = ${fmt(ans, 4)}^\circ$. ${m % 1 ? 'Half-integer m needs more than a full turn: the spinor’s sign flip.' : 'An integer m state has m-fold symmetry about z, as the picture shows.'}`,
        };
      },
    }),
    mcq({
      id: 'group-commutator', difficulty: 3,
      prompt: t`Rotate by a small angle $\epsilon$ about $y$, then $\epsilon$ about $x$, then $-\epsilon$ about $y$, then $-\epsilon$ about $x$: $\hat R = \hat R_x(-\epsilon)\hat R_y(-\epsilon)\hat R_x(\epsilon)\hat R_y(\epsilon)$. To second order in $\epsilon$, what single rotation is this?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.2, yaw: 0.6, pitch: 0.35, vectors: [{ to: [1, 0, 0], color: 'warn', label: 'x' }, { to: [0, 1, 0], color: 'good', label: 'y' }, { to: [0, 0, 1], color: 'accent', label: 'z' }], curves: [{ param: ['0', '0.35*cos(t)', '0.35*sin(t)'], t: [0, 1.2], color: 'warn' }, { param: ['0.35*sin(t)', '0', '0.35*cos(t)'], t: [0, 1.2], color: 'good' }] }, caption: 'The x- and y-axes with the sense of small positive rotations about each (right-hand rule). Drag to turn.' },
      choices: [t`A rotation about $z$ by $\epsilon^2$ (in the right-hand sense)`, t`No rotation at all: the four cancel`, t`A rotation about $z$ by $2\epsilon$`, t`A rotation about the diagonal $x = y$ by $\epsilon^2$`],
      answer: 0,
      why: {
        1: 'They would cancel only if rotations about x and y commuted. They cancel to first order; the second-order remainder is the commutator.',
        2: 'Each step is order ε; the net effect is second order, ε², because first-order terms cancel.',
        3: t`The leftover is generated by $[\hat J_x, \hat J_y] \propto \hat J_z$: a rotation about $z$.`,
      },
      hints: [t`With $A = -i\epsilon\hat J_y/\hbar$ and $B = -i\epsilon\hat J_x/\hbar$: $\hat R = e^{-B}e^{-A}e^{B}e^{A} \approx 1 + [B, A]$.`, t`$[B, A] = -\tfrac{\epsilon^2}{\hbar^2}[\hat J_x, \hat J_y] = -i\epsilon^2\hat J_z/\hbar$, the generator of a rotation about $z$ by $\epsilon^2$.`],
      teach: t`The commutation relation $[\hat J_x, \hat J_y] = i\hbar\hat J_z$ is the statement that a small loop of rotations about $x$ and $y$ leaves a rotation about $z$.`,
      explain: t`The first-order terms cancel and the second-order remainder is $1 + [B, A] = 1 - i\epsilon^2\hat J_z/\hbar \approx \hat R_z(\epsilon^2)$. The angular-momentum algebra is nothing but the geometry of rotations — which is why spin, which has no classical orbit, obeys the same commutators.`,
    }),
    mcq({
      id: 'rotate-px', difficulty: 2,
      prompt: t`The real orbital $p_x \propto x\,f(r)$ is rotated by $90^\circ$ about the $z$-axis (counterclockwise seen from $+z$). What does it become?`,
      visual: { type: 'mp-orbitals', params: { n: 2, l: 1, m: 1, real: true, panels: ['cloud', 'angular'], controls: false, readout: false }, caption: 'A real 2p orbital: two lobes of opposite sign along one axis.' },
      choices: [t`$p_y$`, t`$-p_x$`, t`$p_z$`, t`$p_x$ multiplied by $e^{-i\pi/2}$`],
      answer: 0,
      why: {
        1: t`That is a $180^\circ$ rotation: the lobes swap.`,
        2: t`Rotating about $z$ cannot tip a lobe out of the $xy$-plane.`,
        3: t`$p_x$ is a superposition of $m = +1$ and $m = -1$, which pick up opposite phases $e^{\mp i\pi/2}$. A single overall phase would apply only to a state of definite $m$.`,
      },
      hints: [t`The lobe pointing along $+x$ ends up pointing along $+y$.`, t`Equivalently, $p_x \propto (Y_1^{-1} - Y_1^1)$; apply $e^{-im\pi/2}$ to each part.`],
      teach: 'Rotations act on each m-component with its own phase e^(−imφ); real orbitals, being mixtures of ±m, are carried into one another.',
      explain: t`The lobe along $+x$ turns to $+y$: $p_x \to p_y$. In the $|l\,m\rangle$ basis, $p_x \propto Y_1^{-1} - Y_1^{1}$ and the rotation multiplies these by $e^{+i\pi/2}$ and $e^{-i\pi/2}$, giving $\propto i(Y_1^{-1} + Y_1^{1}) \propto p_y$. The three p orbitals form a set that rotations mix among themselves — an $l = 1$ multiplet.`,
    }),
    multi({
      id: 'scalar-ops', difficulty: 3,
      prompt: t`A **scalar** operator is unchanged by rotations, so it commutes with every component of $\hat{\vec J}$. Which of these are scalar operators? Select all that apply.`,
      visual: { type: 'calc-vectors3d', params: { range: 1.2, yaw: 0.6, pitch: 0.35, vectors: [{ to: [0.7, 0.4, 0.5], color: 'gold', label: '\\vec r' }, { to: [-0.3, 0.8, 0.2], color: 'violet', label: '\\vec p' }] }, caption: 'Two vectors: rotating them both together changes their components but not their lengths or the angle between them.' },
      choices: [t`$\hat{\vec L}^2$`, t`$\hat{\vec r}\cdot\hat{\vec p}$`, t`$\hat H = \hat p^2/2m - k/\hat r$`, t`$\hat z$`, t`$\hat L_z$`],
      answer: [0, 1, 2],
      why: {
        3: t`$\hat z$ is a component of the vector $\hat{\vec r}$: rotations mix it with $\hat x$ and $\hat y$, and $[\hat L_x, \hat z] = -i\hbar\hat y \ne 0$.`,
        4: t`$\hat L_z$ commutes with $\hat L_z$ but not with $\hat L_x$: $[\hat L_x, \hat L_z] = -i\hbar\hat L_y$.`,
      },
      hints: ['Dot products of vectors, and lengths, do not change when everything is rotated together.', 'A single component of a vector changes under rotations about other axes.'],
      teach: 'Dot products and lengths are scalars and commute with Ĵ; single components of vectors do not.',
      explain: t`$\hat{\vec L}^2$, $\hat{\vec r}\cdot\hat{\vec p}$ and a central-force Hamiltonian are rotation invariant. That is why hydrogen’s $\hat H$ commutes with $\hat{\vec L}$, so $l$ and $m$ are good quantum numbers, and why every level with given $l$ is $(2l + 1)$-fold degenerate — lesson M2.4.`,
    }),
    code({
      id: 'rotation-expm', difficulty: 3,
      prompt: t`Build the spin matrices for any $j$ and the rotation operators from them (units $\hbar = 1$). Write \`spin_matrices(j)\` returning \`(Jx, Jy, Jz)\` in the basis $m = j, j - 1, \dots, -j$, using $\langle m + 1|\hat J_+|m\rangle = \sqrt{j(j + 1) - m(m + 1)}$, $\hat J_x = (\hat J_+ + \hat J_-)/2$ and $\hat J_y = (\hat J_+ - \hat J_-)/2i$. Then write \`rotation(J, phi)\` returning $e^{-i\phi J}$ with \`scipy.linalg.expm\`.`,
      starter: t`import numpy as np
from scipy.linalg import expm

def spin_matrices(j):
    pass

def rotation(J, phi):
    pass

Jx, Jy, Jz = spin_matrices(0.5)
print(np.round(rotation(Jz, 2 * np.pi), 6))
`,
      answer: t`import numpy as np
from scipy.linalg import expm

def spin_matrices(j):
    ms = np.arange(j, -j - 1, -1)          # j, j-1, ..., -j
    n = len(ms)
    Jp = np.zeros((n, n), dtype=complex)
    for k in range(1, n):                  # column k has m = ms[k]; J+ raises it to ms[k-1]
        m = ms[k]
        Jp[k - 1, k] = np.sqrt(j * (j + 1) - m * (m + 1))
    Jm = Jp.conj().T
    return (Jp + Jm) / 2, (Jp - Jm) / 2j, np.diag(ms).astype(complex)

def rotation(J, phi):
    return expm(-1j * phi * J)

Jx, Jy, Jz = spin_matrices(0.5)
print(np.round(rotation(Jz, 2 * np.pi), 6))
`,
      tests: [
        { name: t`for $j = \tfrac12$, $J_x$ and $J_y$ are half the Pauli matrices`, code: 'np.allclose(spin_matrices(0.5)[0], [[0, 0.5], [0.5, 0]]) and np.allclose(spin_matrices(0.5)[1], [[0, -0.5j], [0.5j, 0]])' },
        { name: t`$[J_x, J_y] = iJ_z$ for $j = \tfrac12, 1, \tfrac32, 2$`, code: 'all(np.allclose(A[0] @ A[1] - A[1] @ A[0], 1j * A[2]) for A in [spin_matrices(j) for j in (0.5, 1, 1.5, 2)])' },
        { name: t`$J^2 = j(j + 1)$ times the identity for $j = \tfrac32$`, code: 'np.allclose(sum(M @ M for M in spin_matrices(1.5)), 3.75 * np.eye(4))' },
        { name: t`a $2\pi$ rotation gives $-1$ for half-integer $j$ and $+1$ for integer $j$`, code: 'all(np.allclose(rotation(spin_matrices(j)[1], 2 * np.pi), (-1) ** round(2 * j) * np.eye(round(2 * j + 1))) for j in (0.5, 1, 1.5, 2))' },
        { name: t`a $\pi$ rotation about $y$ turns spin up into spin down (up to a phase)`, code: 'abs(abs((rotation(spin_matrices(0.5)[1], np.pi) @ np.array([1, 0]))[1]) - 1) < 1e-9' },
      ],
      hints: ['`np.arange(j, -j - 1, -1)` lists m from j down to −j. J₊ has entries just above the diagonal: row k − 1, column k.', '`expm(-1j * phi * J)` is the whole rotation; for a Hermitian J it is unitary.'],
      teach: 'Rotation operators are exponentials of the angular-momentum matrices; the same few lines handle every j.',
      explain: t`The commutators come out as $[J_x, J_y] = iJ_z$ for every $j$: the algebra is the same, only the size changes. The full-turn test is the spinor sign: $e^{-2\pi iJ_y}$ equals $(-1)^{2j}$, because every eigenvalue $m$ of $J_y$ is an integer or a half-integer together.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron', difficulty: 3, transfer: true,
      gen(r) {
        const lam = r.pick([0.144, 0.18, 0.23]) * 1e-9, L = r.pick([1, 2, 3]) * 1e-2;
        const v = H / (MN * lam), ans = ((4 * Math.PI * v) / (GAMMA_N * L)) * 1e3;    // mT
        return {
          prompt: t`In a neutron interferometer one path crosses a magnetic field $B$ over a length $L = ${fmt(L * 100, 2)}$ cm. The neutrons have wavelength $${fmt(lam * 1e9, 3)}$ nm, so speed $v = h/m_n\lambda$, and their spins precess by $\alpha = \gamma_nBL/v$ with $\gamma_n = ${tex(GAMMA_N, 6)}\ \text{s}^{-1}\text{T}^{-1}$. The detected intensity varies as $1 + \cos(\alpha/2)$. By how much must $B$ change to take the intensity through one full period, in mT? ($m_n = ${tex(MN, 6)}$ kg.)`,
          visual: { type: 'graph', params: { x: [0, 2.2], y: [0, 2.2], aspect: 'wide', xlabel: 'field B (in units of the period you are finding)', ylabel: 'intensity (scaled)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: '1 + cos(2*pi*x)', color: 'accent', width: 2.4 }] }, caption: 'The interference signal against field (schematic: the axis is in units of the answer).' },
          answer: ans, units: 'mT', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: t`A $2\pi$ precession only flips the sign of the spinor: the intensity $1 + \cos(\alpha/2)$ needs $\alpha = 4\pi$ for a full period.` }],
          hints: [t`One period of $\cos(\alpha/2)$ is $\Delta\alpha = 4\pi$, so $\Delta B = 4\pi v/(\gamma_nL)$.`, t`$v = h/(m_n\lambda) = ${fmt(v, 4)}$ m/s.`],
          teach: 'A spinor’s 4π periodicity shows up as the field period of a neutron interferometer.',
          explain: t`$v = ${fmt(v, 4)}$ m/s and $\Delta B = 4\pi v/(\gamma_nL) = ${fmt(ans, 3)}$ mT. Had spinors returned after $2\pi$, the period would be half this. The 1975 experiments measured the period and found $\alpha$ within errors of $720^\circ$.`,
        };
      },
    }),
    num({
      id: 'cp-mri', difficulty: 3, transfer: true,
      gen(r) {
        const B1 = r.pick([5, 10, 20]) * 1e-6, ang = r.pick([90, 180]);
        const ans = ((ang * D) / (GAMMA_P * B1)) * 1e3;    // ms
        return {
          prompt: t`In an MRI scanner a radio-frequency field $B_1$, seen in the frame rotating with the protons’ precession, rotates their spins about a horizontal axis at the angular rate $\gamma_pB_1$: the rotation operator is $e^{-i\gamma_pB_1t\,\hat S_x/\hbar}$. With $B_1 = ${fmt(B1 * 1e6, 2)}\ \mu$T and $\gamma_p = ${tex(GAMMA_P, 6)}\ \text{s}^{-1}\text{T}^{-1}$, how long must the pulse last to tip the magnetization by $${ang}^\circ$, in ms?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.25, yaw: 0.6, pitch: 0.3, spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }], vectors: [{ to: [0, 0, 1], color: 'ink2', label: '\\text{start}' }, { to: [1.15, 0, 0], color: 'warn', label: 'B_1' }], curves: [{ param: ['0', `-sin(t)`, 'cos(t)'], t: [0, r6(ang * D)], color: 'gold' }] }, caption: 'The spin direction tipped about the B₁ axis, in the rotating frame (gold path).' },
          answer: ans, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\gamma_p$ is in rad s⁻¹ T⁻¹ already, so the angle in radians is $\gamma_pB_1t$; do not multiply by $2\pi$.` }],
          hints: [t`The rotation angle is $\theta = \gamma_pB_1t$, in radians.`, t`$t = \theta/(\gamma_pB_1)$ with $\theta = ${fmt(ang * D, 4)}$ rad.`],
          teach: 'A magnetic field generates rotations of a spin: the angle is γBt.',
          explain: t`$t = ${fmt(ang * D, 4)}/(${tex(GAMMA_P, 4)}\times${tex(B1, 2)}) = ${fmt(ans, 3)}$ ms. A $90^\circ$ pulse lays the magnetization flat to give the largest signal; a $180^\circ$ pulse inverts it and is used to form spin echoes.`,
        };
      },
    }),
    mcq({
      id: 'cp-sign', difficulty: 2,
      prompt: t`A single electron is rotated by $360^\circ$. A student says the $-1$ this produces must be unobservable because “nothing physical changes”. Under what condition can the sign be detected?`,
      visual: ripplePic(0.5, 'Half-integer symmetry: after one turn (blue) the curve has not closed; after two (gold) it has.'),
      choices: [
        'When the rotated system is part of a superposition with an unrotated one: the −1 is a relative phase, and it shifts interference fringes',
        'Never: an overall phase of a state can never be seen, so the −1 is a mathematical artefact',
        'Always: a rotated electron has opposite charge',
        'Only for orbital angular momentum, never for spin',
      ],
      answer: 0,
      why: {
        1: 'True for an overall phase, but rotating one branch of a superposition makes the phase relative. Neutron interferometry measured exactly this.',
        2: 'Charge does not change under rotation; nothing local changes.',
        3: t`Integer $m$ — including all orbital angular momentum — gives $+1$ after a full turn. The sign is special to half-integer spin.`,
      },
      hints: ['Phases matter when two amplitudes are added.'],
      teach: 'The spinor sign under a 2π rotation is unobservable alone and observable as a relative phase.',
      explain: t`The sign of a single isolated state is invisible, but in $\tfrac{1}{\sqrt2}(|\text{path 1}\rangle + \hat R(2\pi)|\text{path 2}\rangle)$ it changes the interference from bright to dark. That is what the neutron experiments did.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §6.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'S. A. Werner et al., “Observation of the phase shift of a neutron due to precession in a magnetic field”, Phys. Rev. Lett. 35, 1053 (1975)', url: 'https://doi.org/10.1103/PhysRevLett.35.1053' },
    { label: 'H. Rauch et al., “Verification of coherent spinor rotation of fermions”, Phys. Lett. A 54, 425 (1975)', url: 'https://doi.org/10.1016/0375-9601(75)90798-7' },
  ],
});
