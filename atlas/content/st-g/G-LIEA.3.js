// The Lorentz algebra so(1,3): Xᵀη + ηX = 0 gives six generators, rotations
// J_i (antisymmetric space block) and boosts K_i (symmetric t–i block), with
// [J_i, J_j] = ε_ijk J_k, [J_i, K_j] = ε_ijk K_k, [K_i, K_j] = −ε_ijk J_k. The
// minus sign: two boosts commute to a rotation, so a boost along x followed
// by one along y is a boost times a Thomas–Wigner rotation, angle ≈ w₁w₂/2
// for small rapidities and cos θ = (γ₁ + γ₂)/(1 + γ₁γ₂) exactly for
// perpendicular boosts (all computed in _sg3.js and checked in code).
// Physicists' form [𝒦_x, 𝒦_y] = −i𝒥_z; N± = (𝒥 ± i𝒦)/2 split the complexified
// algebra into two su(2)s, labelling representations (j₊, j₋). Transfer:
// Thomas precession of 2π(γ − 1) per turn round a storage ring.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, wignerPerp } from './_sg3.js';

const t = String.raw;
const DEG = Math.PI / 180;
const WIG = (w1, w2) => `acos((cosh(${w1}) + cosh(${w2}))/(1 + cosh(${w1})*cosh(${w2})))*180/pi`;

// two perpendicular velocities (fractions of c) inside the light-speed circle
const velPic = (v1, v2, caption) => ({
  type: 'graph',
  params: {
    x: [-2, 2], y: [-1.1, 1.1], equal: true, aspect: 'wide', xlabel: 'vₓ / c', ylabel: 'vᵧ / c',
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'warn', dash: true, width: 1.2, label: 'c', labelAt: 0.6, labelDx: 6 }],
    arrows: [{ from: [0, 0], to: [v1, 0], color: 'accent', width: 2.6, label: 'first boost' }, { from: [v1, 0], to: [v1, v2], color: 'gold', width: 2.6, label: 'second boost (in the new frame)' }],
  },
  caption,
});

export default lesson({
  id: 'st-g.G-LIEA.3',
  title: 'The Lorentz algebra',
  minutes: 15, difficulty: 4,
  intro: t`Differentiate $\Lambda^\top\eta\,\Lambda = \eta$ at the identity: the Lorentz algebra $\mathfrak{so}(1, 3)$ is the matrices with $X^\top\eta + \eta X = 0$ — six of them, three rotations $J_i$ and three boosts $K_i$ (with $c = 1$). Their commutators, in the real form used here, are

$$\begin{gathered}[J_i, J_j] = \epsilon_{ijk}J_k, \qquad [J_i, K_j] = \epsilon_{ijk}K_k \\ [K_i, K_j] = -\epsilon_{ijk}J_k\end{gathered}$$

The first says rotations form a subalgebra; the second that the boosts turn into each other under rotations, like a vector. The third is the surprise: **two boosts commute to a rotation**. A boost along $x$ followed by one along $y$ is a boost *and* a rotation — the Thomas–Wigner rotation [mentioned in boosts as hyperbolic rotations](#/lesson/phys3710.R2.1), and the reason pure boosts are not a group. Physicists write Hermitian $\mathcal J = iJ$, $\mathcal K = iK$, giving $[\mathcal K_x, \mathcal K_y] = -i\mathcal J_z$.`,
  symbols: [
    { tex: '\\mathfrak{so}(1, 3)', text: t`the Lorentz algebra: real $4\times4$ matrices with $X^\top\eta + \eta X = 0$` },
    { tex: 'J_i', text: t`rotation generators: antisymmetric in the space block, zero in the time row and column` },
    { tex: 'K_i', text: t`boost generators: $1$ in the $(t, i)$ and $(i, t)$ entries, symmetric` },
    { tex: '\\epsilon_{ijk}', text: 'the Levi-Civita symbol (structure constants)' },
    { tex: '\\eta', text: t`$\operatorname{diag}(-1, 1, 1, 1)$, coordinates $(t, x, y, z)$` },
    { tex: 'w', text: t`rapidity: a boost is $e^{wK}$, with speed $\tanh w$ and $\gamma = \cosh w$` },
  ],
  why: 'The Lorentz algebra is the local symmetry of every spacetime in general relativity; its commutators give spinors through su(2) ⊕ su(2), and the boost–boost bracket is behind Thomas precession in atoms and the spin dynamics in storage rings.',
  visual: {
    type: 'graph',
    title: 'Two boosts make a rotation',
    lead: t`Boost along $x$ with rapidity $w_1$, then along $y$ with rapidity $w_2$. The result is a single boost followed by a rotation about $z$ through the Thomas–Wigner angle $\theta$ (blue curve, as $w_2$ varies). The dashed line is the commutator’s prediction for small rapidities, $\theta \approx w_1w_2/2$.`,
    tasks: [
      t`Make both rapidities small: the curve hugs the dashed line. That is $[K_y, K_x] = J_z$ at work, through $e^{w_2K_y}e^{w_1K_x} = e^{w_1K_x + w_2K_y + \frac12w_1w_2[K_y, K_x] + \dots}$.`,
      t`Set $w_1 = 0$: no rotation at all. Collinear (or single) boosts never rotate — the bracket of a boost with itself is zero.`,
      t`Make both large: $\theta$ approaches $90^\circ$ but never reaches it.`,
    ],
    params: {
      x: [0, 3], y: [0, 95], aspect: 'wide', xlabel: 'second rapidity w₂', ylabel: 'θ (degrees)',
      sliders: [{ key: 'w1', label: t`First rapidity $w_1$ (along $x$)`, min: 0, max: 3, step: 0.05, value: 1, explain: t`Speed $\tanh w_1$; $w_1 = 1$ is $0.76c$.` }, { key: 'w2', label: t`Second rapidity $w_2$ (along $y$)`, min: 0, max: 3, step: 0.05, value: 0.8, explain: t`Applied in the frame reached by the first boost.` }],
      curves: [{ fn: WIG('w1', 'x'), color: 'accent', width: 2.4, label: 'exact', labelAt: 2.4, labelDx: 4, labelDy: 14 }, { fn: 'w1*x/2*180/pi', color: 'ink3', dash: true, width: 1.4, label: 'w₁w₂/2', labelAt: 0.6, labelDx: 6 }],
      hlines: [{ y: 90, color: 'ink4', label: '90°' }],
      points: [{ x: 'w2', y: WIG('w1', 'w2'), r: 6, color: 'gold' }],
      readouts: [{ label: t`$\theta$`, expr: WIG('w1', 'w2'), digits: 4, unit: '^\\circ' }, { label: t`speed $\tanh w_1$`, expr: 'tanh(w1)', digits: 3 }, { label: t`speed $\tanh w_2$`, expr: 'tanh(w2)', digits: 3 }],
    },
    caption: t`Exact for perpendicular boosts: $\cos\theta = \dfrac{\gamma_1 + \gamma_2}{1 + \gamma_1\gamma_2}$, $\gamma_i = \cosh w_i$, confirmed numerically by composing $4\times4$ boost matrices.`,
  },
  example: {
    prompt: t`Find the generators of $\mathfrak{so}(1, 3)$, compute $[K_x, K_y]$, and use it to estimate the rotation left by a boost of rapidity $w_1$ along $x$ followed by $w_2$ along $y$.`,
    visual: { type: 'graph', params: { x: [0, 1.2], y: [0, 40], aspect: 'wide', xlabel: 'w (both boosts)', ylabel: 'θ (degrees)', curves: [{ fn: WIG('x', 'x'), color: 'accent', width: 2.4, label: 'exact', labelAt: 1.0, labelDx: 4, labelDy: 14 }, { fn: 'x^2/2*180/pi', color: 'ink3', dash: true, width: 1.4, label: 'w²/2', labelAt: 1.05, labelDx: -40, labelDy: -6 }] }, caption: t`Equal rapidities: the commutator estimate $w^2/2$ (dashed) against the exact angle.` },
    steps: [
      { label: 'Solve the condition', text: t`Write $X = \begin{pmatrix} a & b^\top \\ c & D\end{pmatrix}$ (time first). $X^\top\eta + \eta X = 0$ gives $a = 0$, $c = b$, $D^\top = -D$. Three numbers in $b$ (boosts), three in $D$ (rotations): six generators.` },
      { label: 'Boost generators', text: t`$K_x$ has $1$ in entries $(t, x)$ and $(x, t)$; $K_y$ in $(t, y)$ and $(y, t)$. Then $K_xK_y$ has a single $1$, at $(x, y)$, and $K_yK_x$ a single $1$ at $(y, x)$.` },
      { label: 'Commute', text: t`$[K_x, K_y] = E_{xy} - E_{yx}$. The rotation generator $J_z$ has $(J_z)_{xy} = -1$, $(J_z)_{yx} = +1$, so $[K_x, K_y] = -J_z$. A rotation, not a boost.` },
      { label: 'Compose', text: t`By Baker–Campbell–Hausdorff, $e^{w_2K_y}e^{w_1K_x} = \exp\bigl(w_1K_x + w_2K_y + \tfrac12w_1w_2[K_y, K_x] + \dots\bigr)$, and $[K_y, K_x] = +J_z$. The extra term is a rotation by about $\tfrac12w_1w_2$ about $z$.` },
      { label: 'Check numerically', text: t`For $w_1 = w_2 = 0.5$: estimate $0.125$ rad $= 7.16^\circ$; exact (from composing the matrices) $${nice(wignerPerp(0.5, 0.5) / DEG, 4)}^\circ$. Smaller rapidities agree better, as a second-order estimate should.` },
    ],
    answer: t`$\mathfrak{so}(1, 3)$: $X = \begin{pmatrix}0 & b^\top \\ b & D\end{pmatrix}$, $D$ antisymmetric. $[K_x, K_y] = -J_z$, so perpendicular boosts leave a Thomas–Wigner rotation of about $w_1w_2/2$ about the third axis.`,
  },
  practice: [
    num({
      id: 'count', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5, 6]), what = r.pick(['boosts', 'rotations']);
        const ans = what === 'boosts' ? n - 1 : ((n - 1) * (n - 2)) / 2;
        const pts = Array.from({ length: n }, (_, i) => [r6(Math.cos(Math.PI / 2 + (2 * Math.PI * i) / n)), r6(Math.sin(Math.PI / 2 + (2 * Math.PI * i) / n))]);
        const curves = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) curves.push({ param: [`${pts[i][0]} + t*${r6(pts[j][0] - pts[i][0])}`, `${pts[i][1]} + t*${r6(pts[j][1] - pts[i][1])}`], t: [0, 1], color: i === 0 ? 'gold' : 'teal', width: 1.6 });
        return {
          prompt: t`In a spacetime with one time and $${n - 1}$ space dimensions, how many independent **${what}** generate the Lorentz group $SO(1, ${n - 1})$?`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.25, 1.25], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves, points: pts.map(([x, y], i) => ({ x, y, r: 6, color: i === 0 ? 'gold' : 'accent', label: i === 0 ? 't' : `x${'₁₂₃₄₅'[i - 1]}`, labelDx: 8, labelDy: -8 })) }, caption: 'The axes as dots, one line per coordinate plane. Lines from t (gold) are planes containing time; the others (green) lie in space.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (n * (n - 1)) / 2, feedback: 'That is all the generators, boosts and rotations together.' }, { value: what === 'boosts' ? ((n - 1) * (n - 2)) / 2 : n - 1, feedback: what === 'boosts' ? 'Those are the rotations: planes inside space.' : 'Those are the boosts: planes containing the time axis.' }].filter((e) => e.value !== ans),
          hints: ['Each generator acts in one coordinate plane. A boost’s plane contains t; a rotation’s does not.', `Count lines from t, or lines among the ${n - 1} space dots.`],
          teach: t`In $n$ spacetime dimensions the Lorentz algebra has $n - 1$ boosts and $(n - 1)(n - 2)/2$ rotations: $n(n - 1)/2$ in all.`,
          explain: t`$${ans}$ ${what}. In 3+1: $3$ boosts and $3$ rotations; in 2+1, $2$ boosts and only $1$ rotation — so there the Thomas–Wigner rotation has nowhere to point but out of the plane.`,
        };
      },
    }),
    mcq({
      id: 'in-algebra', difficulty: 2,
      prompt: t`In 2+1 dimensions, coordinates $(t, x, y)$ and $\eta = \operatorname{diag}(-1, 1, 1)$, which matrix lies in $\mathfrak{so}(1, 2)$, i.e. satisfies $X^\top\eta + \eta X = 0$?`,
      visual: { type: 'field2d', params: { P: 'y', Q: 'x', x: [-2.6, 2.6], y: [-1.6, 1.6], probe: false, readout: false }, caption: t`For reference, the flow of one boost generator in the $(x, t)$ plane (up is $t$): $(x, t) \mapsto (t, x)$, tangent to the hyperbolas $t^2 - x^2 = \text{const}$.` },
      choices: [t`$\begin{pmatrix}0 & 2 & 1 \\ 2 & 0 & -3 \\ 1 & 3 & 0\end{pmatrix}$`, t`$\begin{pmatrix}0 & 2 & 1 \\ -2 & 0 & -3 \\ -1 & 3 & 0\end{pmatrix}$`, t`$\begin{pmatrix}0 & 2 & 1 \\ 2 & 0 & 3 \\ 1 & 3 & 0\end{pmatrix}$`, t`$\begin{pmatrix}1 & 2 & 1 \\ 2 & 0 & -3 \\ 1 & 3 & 0\end{pmatrix}$`],
      answer: 0,
      why: {
        1: t`Fully antisymmetric: that is $\mathfrak{so}(3)$, the rotations of Euclidean 3-space. The time–space entries must be **symmetric**.`,
        2: t`The space block $\begin{pmatrix}0 & 3 \\ 3 & 0\end{pmatrix}$ is symmetric; it must be antisymmetric (a rotation of the $x$–$y$ plane).`,
        3: t`The $tt$ entry must vanish: $X^\top\eta + \eta X$ has $-2X_{tt}$ there.`,
      },
      hints: [t`Write $X = \begin{pmatrix} a & b^\top \\ c & D\end{pmatrix}$: the condition gives $a = 0$, $c = b$ and $D^\top = -D$.`, 'Symmetric in the time row and column, antisymmetric among the space indices.'],
      teach: 'A Lorentz generator is symmetric where it mixes time with space (a boost) and antisymmetric where it mixes space with space (a rotation).',
      explain: t`Time row and column $(2, 1)$ match; the space block $\begin{pmatrix}0 & -3 \\ 3 & 0\end{pmatrix}$ is antisymmetric. It is $2K_x + K_y + 3J$, a boost plus a rotation.`,
    }),
    mcq({
      id: 'kk', difficulty: 3,
      prompt: t`With the real generators of this lesson, what is $[K_x, K_y]$?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 95], aspect: 'wide', xlabel: 'rapidity of each boost', ylabel: 'θ (degrees)', curves: [{ fn: WIG('x', 'x'), color: 'accent', width: 2.4 }] }, caption: 'The rotation angle left by two equal perpendicular boosts, as their rapidity grows.' },
      choices: [t`$-J_z$`, t`$+J_z$`, t`$K_z$`, t`$0$`],
      answer: 0,
      why: {
        1: t`Compute it: $K_xK_y = E_{xy}$ and $K_yK_x = E_{yx}$, so the bracket is $E_{xy} - E_{yx}$, while $J_z = E_{yx} - E_{xy}$. The minus sign is the one that makes $\mathfrak{so}(1, 3)$ differ from $\mathfrak{so}(4)$.`,
        2: t`Two boosts cannot produce a boost: the bracket must vanish on the time row and column, and it does.`,
        3: t`Then boosts would form a subgroup and the curve would be flat at $0$. Perpendicular boosts do not commute.`,
      },
      hints: [t`$K_x$ has $1$s at $(t, x)$ and $(x, t)$; multiply out $K_xK_y$ — only one entry survives.`, t`$(J_z)_{xy} = -1$ and $(J_z)_{yx} = +1$.`],
      teach: t`$[K_i, K_j] = -\epsilon_{ijk}J_k$: the commutator of two boosts is a rotation, so boosts alone do not close.`,
      explain: t`$[K_x, K_y] = -J_z$. In $\mathfrak{so}(4)$ the same calculation gives $+J_z$; the sign comes from $\eta_{tt} = -1$. With Hermitian generators, $[\mathcal K_x, \mathcal K_y] = -i\mathcal J_z$.`,
    }),
    num({
      id: 'wigner', difficulty: 3,
      gen(r) {
        const v1 = r.pick([0.5, 0.6, 0.8, 0.9]), v2 = r.pick([0.4, 0.6, 0.8]);
        const g1 = 1 / Math.sqrt(1 - v1 * v1), g2 = 1 / Math.sqrt(1 - v2 * v2);
        const ans = Math.acos((g1 + g2) / (1 + g1 * g2)) / DEG;
        const check = wignerPerp(Math.atanh(v1), Math.atanh(v2)) / DEG;
        if (Math.abs(check - ans) > 1e-6) throw new Error('Wigner formula mismatch');
        return {
          prompt: t`A frame is boosted to $${v1}c$ along $x$; then, in its own rest frame, boosted to $${v2}c$ along $y$. The result is one boost followed by a rotation about $z$. Find the Thomas–Wigner angle, using $\cos\theta = \dfrac{\gamma_1 + \gamma_2}{1 + \gamma_1\gamma_2}$, in degrees.`,
          visual: velPic(v1, v2, t`The two boosts drawn as velocities in units of $c$ (schematic: the second is measured in the first one’s frame, not the lab).`),
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: (Math.atanh(v1) * Math.atanh(v2)) / 2 / DEG, feedback: t`That is the small-rapidity estimate $w_1w_2/2$. At these speeds use the exact formula.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\gamma_1 = 1/\sqrt{1 - ${v1}^2} = ${nice(g1, 4)}$ and $\gamma_2 = ${nice(g2, 4)}$.`, t`$\cos\theta = ${nice((g1 + g2) / (1 + g1 * g2), 4)}$.`],
          teach: 'Composing perpendicular boosts leaves a rotation whose size depends on both gammas; it vanishes only if one boost is zero.',
          explain: t`$\cos\theta = \dfrac{${nice(g1, 4)} + ${nice(g2, 4)}}{1 + ${nice(g1, 4)}\cdot${nice(g2, 4)}}$, so $\theta = ${nice(ans, 4)}^\circ$ — the same value composing the $4\times4$ matrices gives.`,
        };
      },
    }),
    mcq({
      id: 'jk', difficulty: 3,
      prompt: t`What is $[J_z, K_x]$?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.4, vectors: [{ to: [1.2, 0, 0], color: 'accent', label: '\\hat x\\ (K_x)' }, { to: [0, 1.2, 0], color: 'gold', label: '\\hat y' }, { to: [0, 0, 1.2], color: 'teal', label: '\\hat z\\ (J_z)' }], curves: [{ param: ['0.8*cos(t)', '0.8*sin(t)', '0'], t: [0, 1.4], color: 'teal' }], yaw: 0.8, pitch: 0.45 }, caption: 'A rotation about z turns the x-axis toward y.' },
      choices: [t`$K_y$`, t`$-K_y$`, t`$J_y$`, t`$0$`],
      answer: 0,
      why: {
        1: t`Check the cyclic order: $[J_i, K_j] = \epsilon_{ijk}K_k$ with $\epsilon_{zxy} = +1$.`,
        2: t`Rotating a boost gives a boost in the rotated direction, not a rotation.`,
        3: t`Only a rotation and a boost *along its axis* commute: $[J_z, K_z] = 0$.`,
      },
      hints: [t`$[J_i, K_j] = \epsilon_{ijk}K_k$: the boosts transform like a vector under rotations.`, t`$\epsilon_{zxy} = \epsilon_{312} = +1$.`],
      teach: t`$[J_i, K_j] = \epsilon_{ijk}K_k$ says the three boost generators form a vector under rotations: rotating a boost along $x$ about $z$ makes it point along $y$.`,
      explain: t`$[J_z, K_x] = K_y$, just as $J_z\hat x = \hat z\times\hat x = \hat y$. So rotations and boosts together are closed, while boosts alone are not.`,
    }),
    code({
      id: 'lorentz-algebra', difficulty: 4,
      prompt: t`Build the six Lorentz generators on $(t, x, y, z)$ and check the algebra. \`gens()\` should return \`(J, K)\`, two lists of three $4\times4$ arrays: $J_i$ zero in the time row and column with space block $-\epsilon_{ijk}$; $K_i$ with $1$ in entries $(0, i)$ and $(i, 0)$. Then \`wigner(w1, w2)\` should return the angle (in radians) of the rotation $R = B^{-1}\Lambda$ left by $\Lambda = e^{w_2K_y}e^{w_1K_x}$, where $B$ is the pure boost with the same first column as $\Lambda$ (given: \`pure_boost\`).`,
      starter: t`import numpy as np
from scipy.linalg import expm

eta = np.diag([-1.0, 1, 1, 1])
c = lambda A, B: A @ B - B @ A
levi = lambda i, j, k: (i - j) * (j - k) * (k - i) / 2

def pure_boost(u):                      # the pure boost taking (1,0,0,0) to the four-velocity u
    g, p = u[0], np.asarray(u[1:])
    B = np.eye(4)
    B[0, 0] = g; B[0, 1:] = p; B[1:, 0] = p
    B[1:, 1:] += np.outer(p, p) / (g + 1)
    return B

def gens():
    pass

def wigner(w1, w2):
    pass

J, K = gens()
print(np.round(c(K[0], K[1]), 6))
print(np.degrees(wigner(0.5, 0.5)))
`,
      answer: t`import numpy as np
from scipy.linalg import expm

eta = np.diag([-1.0, 1, 1, 1])
c = lambda A, B: A @ B - B @ A
levi = lambda i, j, k: (i - j) * (j - k) * (k - i) / 2

def pure_boost(u):                      # the pure boost taking (1,0,0,0) to the four-velocity u
    g, p = u[0], np.asarray(u[1:])
    B = np.eye(4)
    B[0, 0] = g; B[0, 1:] = p; B[1:, 0] = p
    B[1:, 1:] += np.outer(p, p) / (g + 1)
    return B

def gens():
    J, K = [], []
    for i in range(3):
        Ji = np.zeros((4, 4))
        Ji[1:, 1:] = [[-levi(i, j, k) for k in range(3)] for j in range(3)]
        Ki = np.zeros((4, 4))
        Ki[0, i + 1] = Ki[i + 1, 0] = 1
        J.append(Ji); K.append(Ki)
    return J, K

def wigner(w1, w2):
    J, K = gens()
    L = expm(w2 * K[1]) @ expm(w1 * K[0])
    R = np.linalg.inv(pure_boost(L[:, 0])) @ L
    return np.arccos(np.clip((np.trace(R[1:, 1:]) - 1) / 2, -1, 1))

J, K = gens()
print(np.round(c(K[0], K[1]), 6))
print(np.degrees(wigner(0.5, 0.5)))
`,
      tests: [
        { name: t`all six satisfy $X^\top\eta + \eta X = 0$`, code: 'all(np.allclose(X.T @ eta + eta @ X, 0) for X in gens()[0] + gens()[1])' },
        { name: t`$[J_x, J_y] = J_z$`, code: 'np.allclose(c(gens()[0][0], gens()[0][1]), gens()[0][2])' },
        { name: t`$[J_x, K_y] = K_z$`, code: 'np.allclose(c(gens()[0][0], gens()[1][1]), gens()[1][2])' },
        { name: t`$[K_x, K_y] = -J_z$: two boosts commute to a rotation`, code: 'np.allclose(c(gens()[1][0], gens()[1][1]), -gens()[0][2])' },
        { name: t`in Hermitian form, $[\mathcal K_x, \mathcal K_y] = -i\mathcal J_z$`, code: 'np.allclose(c(1j * gens()[1][0], 1j * gens()[1][1]), -1j * (1j * gens()[0][2]))' },
        { name: t`the Wigner angle matches $\cos\theta = (\gamma_1 + \gamma_2)/(1 + \gamma_1\gamma_2)$ for $w_1 = 1$, $w_2 = 0.7$`, code: 'abs(wigner(1, 0.7) - np.arccos((np.cosh(1) + np.cosh(0.7)) / (1 + np.cosh(1) * np.cosh(0.7)))) < 1e-9' },
        { name: t`for small rapidities it approaches $w_1w_2/2$`, code: 'abs(wigner(0.01, 0.02) / (0.01 * 0.02 / 2) - 1) < 1e-3' },
      ],
      hints: [t`In \`gens\`, fill \`Ji[1:, 1:]\` from \`-levi(i, j, k)\` and set \`Ki[0, i+1] = Ki[i+1, 0] = 1\`.`, t`In \`wigner\`: \`L = expm(w2*K[1]) @ expm(w1*K[0])\`, \`R = np.linalg.inv(pure_boost(L[:, 0])) @ L\`, then the angle from the trace of \`R[1:, 1:]\`: $\cos\theta = (\operatorname{tr} - 1)/2$.`],
      teach: t`The Lorentz algebra closes only with rotations included: $[K_x, K_y] = -J_z$, and exponentiating shows the rotation hidden in two perpendicular boosts.`,
      explain: t`The printed bracket is $-J_z$, and $w_1 = w_2 = 0.5$ leaves $${nice(wignerPerp(0.5, 0.5) / DEG, 4)}^\circ$. Decomposing $\Lambda = BR$ (polar decomposition) is how accelerator codes track a particle’s spin through successive boosts.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ring', difficulty: 3, transfer: true,
      gen(r) {
        const [who, beta] = r.pick([['an electron in an atom-like orbit at', 0.1], ['a proton in a storage ring at', 0.5], ['a muon in a storage ring at', 0.9], ['an ion beam at', 0.3], ['a proton beam at', 0.7]]);
        const g = 1 / Math.sqrt(1 - beta * beta), ans = 360 * (g - 1);
        return {
          prompt: t`A frame carried round a circle by a continuous sequence of pure boosts — each step a boost in a slightly different direction — does not stay aligned: the Thomas–Wigner rotations add up to the **Thomas precession**, $2\pi(\gamma - 1)$ per revolution (opposite to the orbit). For ${who} $${beta}c$, how many degrees per lap is that?`,
          visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.2, 1.2], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.6 }], arrows: Array.from({ length: 8 }, (_, k) => { const p = (2 * Math.PI * k) / 8; return { from: [r6(Math.cos(p)), r6(Math.sin(p))], to: [r6(Math.cos(p) - 0.3 * Math.sin(p)), r6(Math.sin(p) + 0.3 * Math.cos(p))], color: 'gold', width: 2 }; }) }, caption: 'The circular path and the velocity direction at eight points; each small change of velocity is a boost in a new direction. The precession itself is not drawn.' },
          answer: ans, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: 360 * g, feedback: t`That counts a full turn too many: the precession is $2\pi(\gamma - 1)$, which vanishes as $v \to 0$.` }, { value: 180 * beta * beta, feedback: t`That is the low-speed limit, $2\pi\cdot\tfrac12\beta^2$; at this speed use $\gamma$ itself.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\gamma = 1/\sqrt{1 - ${beta}^2} = ${nice(g, 5)}$.`, t`Degrees per lap: $360(\gamma - 1)$.`],
          teach: 'The Thomas precession is the Thomas–Wigner rotation accumulated along a curved path: 2π(γ − 1) per revolution.',
          explain: t`$360\times(${nice(g, 5)} - 1) = ${nice(ans, 4)}^\circ$ per lap. ${beta < 0.2 ? 'At atomic speeds it is small but it halves the naive spin–orbit splitting — the famous Thomas factor of ½.' : t`In muon $g - 2$ rings it is part of why the spin precesses relative to the momentum only through the anomaly $a_\mu$.`}`,
        };
      },
    }),
    num({
      id: 'cp-reps', difficulty: 3,
      gen(r) {
        const [jp, jm, what] = r.pick([[0.5, 0, 'a left-handed Weyl spinor (neutrino-like)'], [0.5, 0.5, 'a four-vector'], [1, 0, 'a self-dual 2-form (half of the electromagnetic field)'], [1, 1, 'a symmetric traceless tensor'], [1, 0.5, 'the spin-3/2 part of the Rarita–Schwinger (gravitino) field']]);
        const ans = (2 * jp + 1) * (2 * jm + 1);
        return {
          prompt: t`Complexify the Lorentz algebra with $N^\pm = \tfrac12(\mathcal J \pm i\mathcal K)$: each set obeys $\mathfrak{su}(2)$ and they commute, so representations are labelled by two spins $(j_+, j_-)$. What is the dimension of $(${nice(jp)}, ${nice(jm)})$, ${what}?`,
          visual: { type: 'graph', params: { x: [-0.5, 2.2], y: [-0.3, 1.8], aspect: 'wide', xlabel: 'j₊', ylabel: 'j₋', xticks: 4, yticks: 3, points: [0, 0.5, 1, 1.5, 2].flatMap((a) => [0, 0.5, 1, 1.5].map((b) => ({ x: a, y: b, r: a === jp && b === jm ? 7 : 3.5, color: a === jp && b === jm ? 'gold' : 'ink4' }))) }, caption: 'Representations of the Lorentz algebra as a grid of spin pairs; the gold one is asked about.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * jp + 1 + 2 * jm + 1, feedback: 'Two commuting algebras act on a tensor product: dimensions multiply.' }, { value: 2 * (jp + jm) + 1, feedback: 'That is the dimension of one spin j₊ + j₋; here the two spins are independent.' }].filter((e) => e.value !== ans),
          hints: [t`Each $\mathfrak{su}(2)$ factor with spin $j$ has dimension $2j + 1$.`, t`The representation is a tensor product: $(2j_+ + 1)(2j_- + 1)$.`],
          teach: 'so(1,3), complexified, is su(2) ⊕ su(2): its representations are pairs of spins, of dimension (2j₊ + 1)(2j₋ + 1).',
          explain: t`$(2\cdot${nice(jp)} + 1)(2\cdot${nice(jm)} + 1) = ${ans}$. A four-vector is $(\tfrac12, \tfrac12)$: two spinor indices make one vector index, the root of the Möbius-map picture of $SO^+(1, 3)$ in [Möbius transformations](#/lesson/st-d.D2.2).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Weinberg, The Quantum Theory of Fields I (CUP, 1995), §§2.4, 5.6', url: 'https://doi.org/10.1017/CBO9781139644167' },
    { label: 'Jackson, Classical Electrodynamics, 3rd ed. (Wiley, 1999), §11.8 (Thomas precession)', url: 'https://openlibrary.org/isbn/9780471309321' },
    { label: 'O’Donnell & Visser, Elementary analysis of the special relativistic combination of velocities, Wigner rotation, and Thomas precession, Eur. J. Phys. 32, 1033 (2011)', url: 'https://arxiv.org/abs/1102.2001' },
  ],
});
