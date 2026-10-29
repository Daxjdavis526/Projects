// su(2) and so(3): the same Lie algebra. su(2) is the traceless
// anti-Hermitian 2 × 2 matrices, basis τ_i = −iσ_i/2 with [τ_i, τ_j] = ε_ijk τ_k,
// exactly the structure constants of the real rotation generators J_i. The
// adjoint map X ↦ [τ_i, X] has matrix J_i — the derivative of the covering
// map SU(2) → SO(3), so the algebras are isomorphic while the groups differ
// (SU(2) = S³ simply connected, SO(3) = ℝP³ not). Representations of the
// algebra: spin j, dimension 2j + 1, Casimir 𝒥² = j(j + 1); only integer j
// are representations of SO(3). tr R = |tr U|² − 1. Code: build the adjoint
// representation and check it is a Lie-algebra homomorphism onto so(3).
// Transfers: Bloch precession of a spin (su(2)) is classical precession (so(3)),
// and the size of a nuclear or particle spin, √(j(j + 1)) ħ.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the m-ladder of a spin-j multiplet beside the vector-model circle of radius √(j(j+1))
const ladder = (j, { circle = true, caption } = {}) => {
  const ms = Array.from({ length: Math.round(2 * j + 1) }, (_, k) => j - k), R = Math.sqrt(j * (j + 1)), top = Math.max(R, j) + 0.6;
  return {
    type: 'graph',
    params: {
      x: [r6(-1.9 * top), r6(1.9 * top)], y: [r6(-top), r6(top)], equal: true, aspect: 'wide', xlabel: '', ylabel: 'm (units of ħ)',
      curves: circle ? [{ param: [`${r6(R)}*cos(t)`, `${r6(R)}*sin(t)`], t: [0, 6.2832], color: 'ink4', dash: true, width: 1.2 }] : [],
      hlines: ms.map((m) => ({ y: m, color: 'accent' })),
      points: ms.map((m) => ({ x: circle ? r6(Math.sqrt(Math.max(0, R * R - m * m))) : 0, y: m, r: 5, color: 'gold' })),
    },
    caption: caption ?? 'The allowed values of the angular-momentum component m along one axis (blue lines).',
  };
};

const EXPLORE_CODE = t`import numpy as np
from scipy.linalg import expm

s = [np.array([[0, 1], [1, 0]], dtype=complex),
     np.array([[0, -1j], [1j, 0]]),
     np.array([[1, 0], [0, -1]], dtype=complex)]
tau = [-0.5j * si for si in s]                                  # su(2) basis
J = [np.array([[-(i - j) * (j - k) * (k - i) / 2 for k in range(3)]
               for j in range(3)]) for i in range(3)]           # so(3) basis

c = lambda A, B: A @ B - B @ A
print("[tau1, tau2] = tau3:", np.allclose(c(tau[0], tau[1]), tau[2]))
print("[J1, J2]     = J3:  ", np.allclose(c(J[0], J[1]), J[2]))

theta = 2 * np.pi                    # try np.pi, 2 * np.pi, 4 * np.pi
print("exp(theta tau3) =\n", np.round(expm(theta * tau[2]), 6) + 0)
print("exp(theta J3)   =\n", np.round(expm(theta * J[2]), 6) + 0)

# the Casimir: sum of squares of the Hermitian generators i*tau and i*J
print("spin 1/2:", np.round(sum((1j * T) @ (1j * T) for T in tau), 6)[0, 0].real)
print("spin 1:  ", np.round(sum((1j * X) @ (1j * X) for X in J), 6)[0, 0].real)
`;

export default lesson({
  id: 'st-g.G-LIEA.2',
  title: 'su(2) and so(3)',
  minutes: 13, difficulty: 3,
  intro: t`Differentiate $U^\dagger U = I$ and $\det U = 1$ at the identity: the Lie algebra $\mathfrak{su}(2)$ is the **traceless anti-Hermitian** $2\times2$ matrices. A basis made from the Pauli matrices obeys exactly the commutation relations of the rotation generators:

$$\tau_i = -\tfrac{i}{2}\sigma_i, \qquad [\tau_i, \tau_j] = \epsilon_{ijk}\,\tau_k$$

So $\mathfrak{su}(2) \cong \mathfrak{so}(3)$: **one Lie algebra, two groups**. Near the identity the groups are indistinguishable; globally $SU(2)$ is a 3-sphere and covers $SO(3)$ twice. The algebra’s irreducible representations are labelled by a spin $j = 0, \tfrac12, 1, \tfrac32, \dots$, of dimension $2j + 1$, on which the Casimir $\sum_i\mathcal J_i^2 = j(j + 1)$ (with $\hbar = 1$). Only integer $j$ also represent $SO(3)$. The physics of spin ½ is in [spin ½ and the Pauli matrices](#/lesson/phys4700.M6.1).`,
  symbols: [
    { tex: '\\mathfrak{su}(2)', text: t`the Lie algebra of $SU(2)$: traceless anti-Hermitian $2\times2$ matrices, $X^\dagger = -X$` },
    { tex: '\\mathfrak{so}(3)', text: t`the Lie algebra of $SO(3)$: real antisymmetric $3\times3$ matrices` },
    { tex: '\\sigma_i', text: t`the Pauli matrices; $\sigma_j\sigma_k = \delta_{jk}I + i\epsilon_{jkl}\sigma_l$` },
    { tex: '\\tau_i', text: t`the basis $-\tfrac i2\sigma_i$ of $\mathfrak{su}(2)$` },
    { tex: '\\epsilon_{ijk}', text: 'the Levi-Civita symbol: the structure constants of both algebras' },
    { tex: 'j', text: t`the spin labelling an irreducible representation, of dimension $2j + 1$` },
  ],
  why: 'Spinors — electrons, neutrinos, the fermion fields of the Standard Model in curved spacetime — exist because the rotation algebra has representations the rotation group does not; general relativity coupled to fermions needs them.',
  visual: {
    type: 'code-runner',
    title: 'Two bases, one algebra',
    lead: t`The snippet builds $\tau_i = -\tfrac i2\sigma_i$ and the real rotation generators $J_i$, checks that both obey $[X_1, X_2] = X_3$, exponentiates $\theta\tau_3$ and $\theta J_3$, and computes the Casimir in each. Run it, then edit $\theta$.`,
    tasks: [
      t`At $\theta = 2\pi$: $e^{\theta J_3} = I$ but $e^{\theta\tau_3} = -I$. Same algebra, different groups.`,
      t`Set $\theta = 4\pi$: both are the identity.`,
      t`The Casimirs are $0.75 = \tfrac12\cdot\tfrac32$ and $2 = 1\cdot 2$: spin ½ and spin 1, the two smallest faithful representations of the algebra.`,
    ],
    params: { code: EXPLORE_CODE, rows: 20 },
    caption: 'Exact matrices; printed values are rounded to six decimals.',
  },
  example: {
    prompt: t`Show that $[\tau_1, \tau_2] = \tau_3$, and that the map $X \mapsto [\tau_i, X]$, written in the basis $\tau_1, \tau_2, \tau_3$, is the rotation generator $J_i$. Why does this make $\mathfrak{su}(2) \cong \mathfrak{so}(3)$ while $SU(2) \not\cong SO(3)$?`,
    visual: { type: 'graph', params: { x: [0, 720], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: '', xticks: 8, curves: [{ fn: 'cos(x*pi/360)', color: 'accent', width: 2.2, label: '½ tr exp(θτ₃)', labelAt: 560, labelDx: 6, labelDy: 14 }, { fn: 'cos(x*pi/180)', color: 'gold', width: 2.2, label: '(tr exp(θJ₃) − 1)/2', labelAt: 200, labelDx: 6, labelDy: 14 }], vlines: [{ x: 360, color: 'ink4', label: '2π' }] }, caption: t`The same algebra element, $\theta$ times the third generator, exponentiated in each group. They agree near $\theta = 0$ and part ways globally.` },
    steps: [
      { label: 'Pauli products', text: t`$\sigma_1\sigma_2 = i\sigma_3$ and $\sigma_2\sigma_1 = -i\sigma_3$, so $[\sigma_1, \sigma_2] = 2i\sigma_3$.` },
      { label: 'Rescale', text: t`$[\tau_1, \tau_2] = \bigl(-\tfrac i2\bigr)^2[\sigma_1, \sigma_2]$, $= -\tfrac14\cdot2i\sigma_3$, $= -\tfrac i2\sigma_3 = \tau_3$. Cyclically, $[\tau_i, \tau_j] = \epsilon_{ijk}\tau_k$ — the relations of $J_i$.` },
      { label: 'The adjoint matrix', text: t`$[\tau_i, \tau_j] = \sum_k\epsilon_{ijk}\tau_k$, so the matrix of $X \mapsto [\tau_i, X]$ has entry $\epsilon_{ijk}$ in row $k$, column $j$. And $(J_i)_{kj} = -\epsilon_{ikj} = \epsilon_{ijk}$. They are equal: $\operatorname{ad}\tau_i = J_i$.` },
      { label: 'Algebras', text: t`$\tau_i \mapsto J_i$ is linear, one-to-one and preserves brackets: a Lie-algebra isomorphism. It is the derivative at $I$ of the covering map $U \mapsto R(U)$, which acts on $\mathfrak{su}(2) \cong \mathbb R^3$ by $X \mapsto UXU^\dagger$.` },
      { label: 'Groups', text: t`Exponentiate: $e^{2\pi\tau_3} = -I$ while $e^{2\pi J_3} = I$. The algebra only sees a neighbourhood of the identity; the groups differ globally — $SU(2)$ is a 3-sphere (every loop shrinks) and $SO(3)$ is $SU(2)$ with $\pm U$ glued (a $360^\circ$ loop does not shrink).` },
    ],
    answer: t`$[\tau_1, \tau_2] = \tau_3$ and $\operatorname{ad}\tau_i = J_i$: the algebras are isomorphic. The groups are not: $SU(2)$ is the simply connected double cover of $SO(3)$, so $e^{2\pi\tau_3} = -I$ but $e^{2\pi J_3} = I$.`,
  },
  practice: [
    mcq({
      id: 'basis', difficulty: 2,
      prompt: t`Which multiple of the Pauli matrices satisfies $[X_i, X_j] = \epsilon_{ijk}X_k$ exactly, as the real rotation generators do? (Use $[\sigma_i, \sigma_j] = 2i\epsilon_{ijk}\sigma_k$.)`,
      choices: [t`$X_i = -\tfrac i2\sigma_i$`, t`$X_i = \tfrac12\sigma_i$`, t`$X_i = -i\sigma_i$`, t`$X_i = \tfrac i2\sigma_i$`],
      answer: 0,
      why: {
        1: t`$[\tfrac12\sigma_1, \tfrac12\sigma_2] = \tfrac i2\sigma_3 = iX_3$: these Hermitian spin matrices obey $[S_i, S_j] = i\epsilon_{ijk}S_k$, with an $i$.`,
        2: t`$[-i\sigma_1, -i\sigma_2] = -2i\sigma_3 = 2X_3$: the scale is off by $2$.`,
        3: t`$[\tfrac i2\sigma_1, \tfrac i2\sigma_2] = -\tfrac i2\sigma_3 = -X_3$: the sign is wrong.`,
      },
      hints: [t`For $X_i = c\,\sigma_i$: $[X_1, X_2] = c^2\cdot2i\sigma_3$, which must equal $X_3 = c\,\sigma_3$.`, t`So $2ic^2 = c$, i.e. $c = \tfrac{1}{2i} = -\tfrac i2$.`],
      teach: 'The structure constants fix the normalization: τ = −iσ/2 matches so(3) exactly, while the Hermitian S = σ/2 carries the physicists’ factor of i.',
      explain: t`$2ic^2 = c$ gives $c = -\tfrac i2$. The physicists’ spin operators $S_i = \tfrac12\sigma_i = i\tau_i$ are the same algebra in Hermitian form.`,
    }),
    num({
      id: 'casimir', difficulty: 2,
      gen(r) {
        const d = r.int(2, 6), j = (d - 1) / 2;
        const ans = j * (j + 1);
        return {
          prompt: t`An irreducible representation of $\mathfrak{su}(2)$ has dimension $${d}$. What is the value of the Casimir $\mathcal J^2 = \mathcal J_x^2 + \mathcal J_y^2 + \mathcal J_z^2$ on it (with $\hbar = 1$)?`,
          visual: ladder(j, { circle: false, caption: t`The ${d} basis states of the representation, one for each value of $m$ (blue lines), spaced by $1$.` }),
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: j * j, feedback: t`$j^2$ would be the square of the largest $m$; the Casimir is $j(j+1)$ — the other two components never vanish.` }, { value: d * (d + 1), feedback: t`Use $j = (d - 1)/2$, not the dimension itself.` }, { value: j, feedback: t`That is $j$; the Casimir is $j(j + 1)$.` }].filter((e) => Math.abs(e.value - ans) > 0.001),
          hints: [t`Dimension $2j + 1 = ${d}$, so $j = ${nice(j)}$.`, t`$\mathcal J^2 = j(j + 1)$.`],
          teach: t`Irreducible representations of $\mathfrak{su}(2)$ are labelled by $j$ with dimension $2j + 1$, and the Casimir is $j(j + 1)$ on all of it.`,
          explain: t`$j = ${nice(j)}$, so $\mathcal J^2 = ${nice(j)}\cdot${nice(j + 1)} = ${nice(ans)}$. Larger than $j^2$: a spin can never point exactly along an axis.`,
        };
      },
    }),
    num({
      id: 'trace-map', difficulty: 3,
      gen(r) {
        const thDeg = r.pick([50, 90, 130, 200, 250, 310]);
        const trU = 2 * Math.cos((thDeg * DEG) / 2), trUr = r6(trU);
        const ans = trUr * trUr - 1;
        return {
          prompt: t`An element $U \in SU(2)$ has $\operatorname{tr}U = ${nice(trUr, 4)}$. Without finding the axis, compute the trace of the rotation $R(U) \in SO(3)$ it covers. (Recall $\operatorname{tr}U = 2\cos\tfrac\theta2$ and $\operatorname{tr}R = 1 + 2\cos\theta$.)`,
          visual: { type: 'graph', params: { x: [0, 720], y: [-2.3, 3.3], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: '', xticks: 8, curves: [{ fn: '2*cos(x*pi/360)', color: 'accent', width: 2.2, label: 'tr U', labelAt: 60, labelDx: 6, labelDy: -8 }], hlines: [{ y: trUr, color: 'ink3', label: 'given tr U' }] }, caption: t`$\operatorname{tr}U$ along a rotation path; the given value is reached at two angles $360^\circ$ apart (as $U$ and $-U$) — and both cover the same rotation.` },
          answer: ans, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: 1 + 2 * trUr, feedback: t`$\operatorname{tr}U$ carries $\cos\tfrac\theta2$, not $\cos\theta$. Use $\cos\theta = 2\cos^2\tfrac\theta2 - 1$.` }, { value: trUr * trUr, feedback: t`Close: $1 + 2\cos\theta = 1 + 2(2\cos^2\tfrac\theta2 - 1) = (\operatorname{tr}U)^2 - 1$.` }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`$\cos\theta = 2\cos^2\tfrac\theta2 - 1$.`, t`So $\operatorname{tr}R = 1 + 2(2\cos^2\tfrac\theta2 - 1) = (\operatorname{tr}U)^2 - 1$.`],
          teach: t`$\operatorname{tr}R = (\operatorname{tr}U)^2 - 1$: the square cannot see the sign of $U$, which is the double cover in one line.`,
          explain: t`$(${nice(trUr, 4)})^2 - 1 = ${nice(ans, 4)}$. Replacing $U$ by $-U$ changes $\operatorname{tr}U$’s sign and leaves $\operatorname{tr}R$ alone. (It is the character identity $\chi_{1/2}^2 = \chi_1 + \chi_0$: spin ½ ⊗ spin ½ = spin 1 ⊕ spin 0.)`,
        };
      },
    }),
    multi({
      id: 'so3-reps', difficulty: 3,
      prompt: t`A spin-$j$ representation is a representation of $SO(3)$ itself (not only of $SU(2)$) exactly when a $2\pi$ rotation acts as the identity on it. For which $j$ is that so?`,
      visual: { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.3, 1.3], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2 }], points: [{ x: 1, y: 0, r: 6, color: 'good', label: '+1 (whole m)', labelDx: 10 }, { x: -1, y: 0, r: 6, color: 'bad', label: '−1 (half-odd m)', labelDx: -110, labelDy: -12 }] }, caption: t`A $2\pi$ rotation about $z$ multiplies the state with $\mathcal J_z = m$ by $e^{-2\pi im}$: $+1$ for whole $m$, $-1$ for half-odd $m$.` },
      choices: [t`$j = 0$`, t`$j = 1$`, t`$j = 2$`, t`$j = \tfrac12$`, t`$j = \tfrac32$`],
      answer: [0, 1, 2],
      why: { 3: t`The values $m = \pm\tfrac12$ give $e^{\mp i\pi} = -1$: a $2\pi$ rotation is $-I$, so this is a representation of $SU(2)$ only.`, 4: t`Here too every $m$ is half-odd, so the $2\pi$ rotation acts as $-I$.` },
      hints: [t`$e^{-2\pi i\mathcal J_z}$ is diagonal with entries $e^{-2\pi im}$, $m = j, j - 1, \dots, -j$.`, t`For whole $j$ every $m$ is whole; for half-odd $j$ every $m$ is half-odd.`],
      teach: 'Integer spins represent SO(3); half-integer spins represent only its double cover SU(2), where a 2π rotation is −1.',
      explain: t`Integer $j$: all $m$ whole, $e^{-2\pi i\mathcal J_z} = I$. Half-odd $j$: $= -I$. That sign is real — measured in neutron interferometry — and it is why fermions need spinor fields, not tensors, in curved spacetime.`,
    }),
    code({
      id: 'adjoint', difficulty: 4,
      prompt: t`Build the adjoint representation of $\mathfrak{su}(2)$. Write \`coords(X)\`, returning the real coordinates $(x_1, x_2, x_3)$ of a traceless anti-Hermitian $X = \sum_k x_k\tau_k$ (use $x_k = -2\operatorname{tr}(X\tau_k)$, from $\operatorname{tr}(\tau_j\tau_k) = -\tfrac12\delta_{jk}$), and \`ad(X)\`, the real $3\times3$ matrix whose column $j$ is \`coords\` of $[X, \tau_j]$. The tests check that $\operatorname{ad}\tau_i = J_i$ and that \`ad\` turns brackets into brackets.`,
      starter: t`import numpy as np

s = [np.array([[0, 1], [1, 0]], dtype=complex),
     np.array([[0, -1j], [1j, 0]]),
     np.array([[1, 0], [0, -1]], dtype=complex)]
tau = [-0.5j * si for si in s]
J = [np.array([[-(i - j) * (j - k) * (k - i) / 2 for k in range(3)] for j in range(3)]) for i in range(3)]
c = lambda A, B: A @ B - B @ A

def coords(X):
    pass

def ad(X):
    pass

print(np.round(ad(tau[2]), 6))
`,
      answer: t`import numpy as np

s = [np.array([[0, 1], [1, 0]], dtype=complex),
     np.array([[0, -1j], [1j, 0]]),
     np.array([[1, 0], [0, -1]], dtype=complex)]
tau = [-0.5j * si for si in s]
J = [np.array([[-(i - j) * (j - k) * (k - i) / 2 for k in range(3)] for j in range(3)]) for i in range(3)]
c = lambda A, B: A @ B - B @ A

def coords(X):
    return np.array([(-2 * np.trace(X @ T)).real for T in tau])

def ad(X):
    return np.column_stack([coords(c(X, T)) for T in tau])

print(np.round(ad(tau[2]), 6))
`,
      tests: [
        { name: t`\`coords\` recovers $(1, -2, 0.5)$ from $\tau_1 - 2\tau_2 + 0.5\tau_3$`, code: 'np.allclose(coords(tau[0] - 2 * tau[1] + 0.5 * tau[2]), [1, -2, 0.5])' },
        { name: t`$\operatorname{ad}\tau_i = J_i$ for $i = 1, 2, 3$`, code: 'all(np.allclose(ad(tau[i]), J[i]) for i in range(3))' },
        { name: t`$\operatorname{ad}[X, Y] = [\operatorname{ad}X, \operatorname{ad}Y]$ for two mixed elements`, code: 'np.allclose(ad(c(tau[0] + 2 * tau[2], tau[1] - tau[0])), c(ad(tau[0] + 2 * tau[2]), ad(tau[1] - tau[0])))' },
        { name: 'every ad(X) is a real antisymmetric matrix: an element of so(3)', code: 'np.allclose(ad(0.3 * tau[0] - 1.1 * tau[1] + 0.7 * tau[2]), -ad(0.3 * tau[0] - 1.1 * tau[1] + 0.7 * tau[2]).T)' },
      ],
      hints: [t`\`coords\`: a list comprehension of \`(-2 * np.trace(X @ T)).real\` over \`T in tau\`, made into an array.`, t`\`ad\`: \`np.column_stack([coords(c(X, T)) for T in tau])\`.`],
      teach: 'The adjoint representation writes each algebra element as the matrix of its bracket action; for su(2) it lands exactly on so(3), which is the isomorphism of the two algebras.',
      explain: t`$\operatorname{ad}\tau_3 = J_3$, and \`ad\` preserves brackets (the Jacobi identity is exactly that statement). Exponentiating, $e^{\operatorname{ad}X}$ is the rotation $R(e^X)$: the covering map, seen from the algebra.`,
    }),
    mcq({
      id: 'global', difficulty: 3,
      prompt: t`$\mathfrak{su}(2)$ and $\mathfrak{so}(3)$ are isomorphic. What, then, distinguishes $SU(2)$ from $SO(3)$?`,
      visual: { type: 'graph', params: { x: [0, 720], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: '½ tr U', xticks: 8, curves: [{ fn: 'cos(x*pi/360)', domain: [0, 360], color: 'bad', width: 2.6, label: 'one turn: from I to −I', labelAt: 200, labelDx: 6, labelDy: 14 }, { fn: 'cos(x*pi/360)', domain: [360, 720], color: 'good', width: 2.6, label: 'second turn: back to I', labelAt: 560, labelDx: -60, labelDy: 16 }] }, caption: t`A $360^\circ$ loop of rotations lifted to $SU(2)$: it ends at $-I$, not where it began. Going round twice closes it.` },
      choices: [t`Their global shape: $SU(2)$ is a 3-sphere, simply connected; $SO(3)$ is not, and a $360^\circ$ loop of rotations cannot be shrunk to a point in it`, 'Their dimensions: SU(2) is larger', 'Nothing: isomorphic algebras always come from isomorphic groups', 'SO(3) is non-abelian and SU(2) is abelian'],
      answer: 0,
      why: {
        1: t`Both are 3-dimensional — that is why their algebras can match.`,
        2: t`The algebra fixes the group only near the identity. $\mathbb R$ and the circle $U(1)$ have the same 1-dimensional algebra too.`,
        3: t`Both are non-abelian: $[\tau_1, \tau_2] = \tau_3 \ne 0$.`,
      },
      hints: ['The algebra describes infinitesimal steps; what can it not see?', t`Follow the lift of a $360^\circ$ rotation loop into $SU(2)$: does it close?`],
      teach: 'A Lie algebra determines its group only locally; the simply connected group with that algebra (here SU(2)) covers every other one (here SO(3)).',
      explain: t`$\pi_1(SO(3)) = \mathbb Z_2$: one turn is a loop that cannot be undone continuously, two turns can (Dirac’s belt trick). $SU(2)$, a 3-sphere, is the universal cover. Every Lie algebra has one simply connected group; the others are quotients of it.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-bloch', difficulty: 3, transfer: true,
      prompt: t`In an NMR or MRI magnet ($\vec B$ along $z$), a proton’s spin state evolves by $U(t) = e^{-i\omega t\,\sigma_z/2} \in SU(2)$. The expectation value $\langle\vec\sigma\rangle$ then precesses exactly like a classical magnetic moment, $d\vec M/dt = \gamma\vec M\times\vec B$. Why exactly, and not approximately?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.4, vectors: [{ to: [0, 0, 1.3], color: 'ink3', label: '\\vec B' }, { to: [0.6, 0.3, 0.9], color: 'gold', label: '\\langle\\vec\\sigma\\rangle' }], curves: [{ param: ['0.6708*cos(t)', '0.6708*sin(t)', '0.9'], t: [0, 6.2832], color: 'accent', dash: true }], yaw: 0.8, pitch: 0.35 }, caption: 'The spin’s expectation vector precessing on a cone about the field. Schematic proportions.' },
      choices: [t`Conjugating the Pauli matrices by $U$ is a rotation, $U^\dagger\sigma_iU = \sum_j R_{ij}\sigma_j$, so $\langle\vec\sigma\rangle$ turns by $R(U)$: $\mathfrak{su}(2)$ acting by commutators *is* $\mathfrak{so}(3)$ acting on vectors`, 'Because a proton is heavy enough to be classical', 'Because the field is weak, so higher-order terms are negligible', 'It is a coincidence of the Pauli matrices that fails for larger spins'],
      answer: 0,
      why: {
        1: 'Mass plays no role: the electron spin precesses exactly classically too.',
        2: 'The result holds at any field strength; nothing is expanded.',
        3: t`It holds for every spin $j$: $\langle\vec{\mathcal J}\rangle$ always rotates as a vector, because $\vec{\mathcal J}$ carries the adjoint (vector) action of the algebra.`,
      },
      hints: [t`$\langle\sigma_i\rangle(t) = \langle\psi|U^\dagger\sigma_iU|\psi\rangle$.`, t`Conjugating Pauli matrices by $U$ is exactly the covering map: $U^\dagger\sigma_iU = \sum_j R_{ij}\sigma_j$ for a rotation $R$.`],
      teach: 'Because su(2) ≅ so(3), the expectation of a spin vector rotates exactly as a classical vector does — the Bloch equations are the adjoint representation.',
      explain: t`$U^\dagger\sigma_iU = R_{ij}\sigma_j$, with $R$ the rotation by $\omega t$ about $z$: $\langle\vec\sigma\rangle$ precesses at the Larmor frequency $\omega = \gamma B$, classical in form for any spin. The quantum part is that each *measurement* of $\sigma_z$ still gives only $\pm1$.`,
    }),
    num({
      id: 'cp-spin-size', difficulty: 2, transfer: true,
      gen(r) {
        const [who, j] = r.pick([['an electron', 0.5], ['a deuteron (the nucleus of heavy hydrogen)', 1], ['an Ω⁻ baryon', 1.5], ['a sodium-23 nucleus', 1.5], ['a nitrogen-14 nucleus', 1], ['a cobalt-60 nucleus', 5]]);
        const ans = Math.sqrt(j * (j + 1));
        return {
          prompt: t`${who[0].toUpperCase() + who.slice(1)} has spin $j = ${nice(j)}$. What is the magnitude of its spin angular momentum, $\sqrt{\langle\mathcal J^2\rangle}$, in units of $\hbar$?`,
          visual: ladder(j, { caption: t`The vector model: the allowed $m$ (blue lines) and a circle of radius $\sqrt{j(j+1)}$ — the spin’s length is always longer than its largest component.` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: j, feedback: t`$j$ is the largest value of one component, $m_{\max}$; the length is $\sqrt{j(j + 1)}$.` }, { value: j * (j + 1), feedback: 'That is the Casimir, the squared length; take the square root.' }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$\mathcal J^2 = j(j + 1)\hbar^2$ on a spin-$j$ multiplet.`],
          teach: 'The magnitude of a spin is √(j(j+1)) ħ, set by the Casimir of the rotation algebra, never exactly j ħ.',
          explain: t`$\sqrt{${nice(j)}\cdot${nice(j + 1)}} = ${nice(ans, 4)}$, in units of $\hbar$. ${Number.isInteger(j) ? 'Whole j: a representation of SO(3) itself.' : 'Half-odd j: a representation of SU(2) only — a fermion.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hall, Lie Groups, Lie Algebras, and Representations, 2nd ed. (Springer GTM 222, 2015), §§1.2, 3.7, 4.6 (su(2), so(3), the covering map)', url: 'https://doi.org/10.1007/978-3-319-13467-3' },
    { label: 'Sakurai & Napolitano, Modern Quantum Mechanics, 3rd ed. (CUP, 2020), §§3.2–3.5', url: 'https://doi.org/10.1017/9781108587280' },
  ],
});
