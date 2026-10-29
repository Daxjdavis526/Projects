// Matrix groups: SO(3), SU(2), SO(1,3) by their defining equations (RᵀR = I,
// U†U = I, ΛᵀηΛ = η, each with det = 1); dimensions n(n − 1)/2 and n² − 1;
// SU(2) as the unit quaternions, a 3-sphere |a|² + |b|² = 1; the double cover
// SU(2) → SO(3), R_ij = ½ tr(σ_i U σ_j U†), with U and −U giving the same R,
// so a 2π rotation is −1 in SU(2) and 4π brings it home (phys4700.M6.1 and
// phys4710.M2.2 have the spin-½ physics and neutron interferometry). Code:
// build the covering map and check it is a two-to-one homomorphism onto
// SO(3). Transfers: spacecraft attitude quaternions q and −q, and the slew
// angle 2 arccos|q_a·q_b|.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the two "return" curves over 0–720°: half the trace of U and (tr R − 1)/2
const coverCurves = () => [
  { fn: 'cos(x*pi/360)', color: 'accent', width: 2.2, label: '½ tr U (SU(2))', labelAt: 610, labelDx: 8, labelDy: 14 },
  { fn: 'cos(x*pi/180)', color: 'gold', width: 2.2, label: '(tr R − 1)/2 (SO(3))', labelAt: 140, labelDx: -40, labelDy: 18 },
];

export default lesson({
  id: 'st-g.G-LIEG.1',
  title: 'Matrix groups: SO(3), SU(2), SO(1,3)',
  minutes: 14, difficulty: 3,
  intro: t`The continuous groups of physics are groups of matrices cut out by an equation saying what they preserve:

$$\begin{gathered} SO(3):\ R^\top R = I \quad SU(2):\ U^\dagger U = I \\ SO(1, 3):\ \Lambda^\top\eta\,\Lambda = \eta \qquad (\det = 1)\end{gathered}$$

$SO(3)$ preserves lengths and handedness in space; $SU(2)$ preserves the length of complex 2-vectors (spinors); $SO(1, 3)$ preserves the interval $-t^2 + x^2 + y^2 + z^2$. Each is also a smooth surface in matrix space — a **Lie group** — with a dimension: $3$, $3$ and $6$. $SU(2)$ and $SO(3)$ have the same dimension and are almost the same group: every rotation comes from **exactly two** elements $\pm U$ of $SU(2)$. That two-to-one map is why a spin-½ particle needs a $720^\circ$ turn to come back to itself — the physics is in [spin ½ and the Pauli matrices](#/lesson/phys4700.M6.1) and [rotations and angular momentum](#/lesson/phys4710.M2.2).`,
  symbols: [
    { tex: 'R', text: t`a real $3\times3$ rotation matrix` },
    { tex: 'U', text: t`a complex $2\times2$ unitary matrix of determinant $1$; $U^\dagger$ is its conjugate transpose` },
    { tex: '\\Lambda', text: t`a real $4\times4$ Lorentz matrix acting on $(t, x, y, z)$, $c = 1$` },
    { tex: '\\eta', text: t`the Minkowski metric $\operatorname{diag}(-1, 1, 1, 1)$` },
    { tex: 'I', text: 'the identity matrix' },
    { tex: '\\sigma_i', text: t`the Pauli matrices, used below to turn $U$ into $R$` },
  ],
  why: 'Rotations, spin and Lorentz transformations are these three groups; a local inertial frame in general relativity is defined only up to an element of SO(1,3), and spinor fields need its double cover.',
  visual: {
    type: 'graph',
    title: 'One turn for SO(3), two for SU(2)',
    lead: t`Rotate about any axis by $\theta$. The rotation matrix $R$ comes back to $I$ when $(\operatorname{tr}R - 1)/2 = \cos\theta$ (gold) returns to $1$. The $SU(2)$ element doing the same rotation, $U = \cos\tfrac\theta2\,I - i\sin\tfrac\theta2\,\hat n\cdot\vec\sigma$, comes back when $\tfrac12\operatorname{tr}U = \cos\tfrac\theta2$ (blue) does.`,
    tasks: [
      t`Slide to $\theta = 360^\circ$: $R = I$ again, but $\tfrac12\operatorname{tr}U = -1$, so $U = -I$. The same rotation, reached by a different element of $SU(2)$.`,
      t`Slide to $720^\circ$: now $U = I$ too. A path that turns twice is the shortest closed loop in $SU(2)$.`,
      t`At any $\theta$, compare with $\theta + 360^\circ$: the gold curve has the same value, the blue one the opposite sign. $U$ and $-U$ give the same $R$ — the map is two-to-one.`,
    ],
    params: {
      x: [0, 720], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'rotation angle θ (degrees)', ylabel: '', xticks: 8,
      sliders: [{ key: 'th', label: t`Angle $\theta$`, min: 0, max: 720, step: 5, value: 120, unit: '^\\circ', explain: 'The angle of a rotation about one fixed axis, followed continuously from 0.' }],
      curves: coverCurves(),
      vlines: [{ x: 'th', color: 'ink3' }, { x: 360, color: 'ink4', label: '360°' }],
      points: [{ x: 'th', y: 'cos(th*pi/360)', r: 5, color: 'accent' }, { x: 'th', y: 'cos(th*pi/180)', r: 5, color: 'gold' }],
      readouts: [{ label: t`$\tfrac12\operatorname{tr}U = \cos\tfrac\theta2$`, expr: 'cos(th*pi/360)', digits: 3 }, { label: t`$\operatorname{tr}R = 1 + 2\cos\theta$`, expr: '1 + 2*cos(th*pi/180)', digits: 3 }],
    },
    caption: t`Exact; both traces depend only on the angle, not on the axis $\hat n$.`,
  },
  example: {
    prompt: t`Show that $U = \operatorname{diag}(e^{-i\theta/2}, e^{i\theta/2}) \in SU(2)$ acts as a rotation by $\theta$ about $z$, through $U(\vec x\cdot\vec\sigma)U^\dagger = (R\vec x)\cdot\vec\sigma$, and that $-U$ gives the same rotation.`,
    visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.2, 1.2], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }], arrows: [{ from: [0, 0], to: [1, 0], color: 'ink3', width: 2, label: 'x̂' }, { from: [0, 0], to: [r6(Math.cos(Math.PI / 3)), r6(Math.sin(Math.PI / 3))], color: 'gold', width: 2.4, label: 'R x̂ (θ = 60°)' }] }, caption: t`The rotation $R$ produced by $U$ with $\theta = 60^\circ$, acting on $\hat x$.` },
    steps: [
      { label: 'Check the group', text: t`$U^\dagger U = \operatorname{diag}(e^{i\theta/2}e^{-i\theta/2}, \dots) = I$ and $\det U = e^{-i\theta/2}e^{i\theta/2} = 1$: $U \in SU(2)$.` },
      { label: 'Vectors as matrices', text: t`Write $\vec x$ as the traceless Hermitian matrix $X = \vec x\cdot\vec\sigma = \begin{pmatrix} z & x - iy \\ x + iy & -z\end{pmatrix}$, with $\det X = -|\vec x|^2$. Then $UXU^\dagger$ is again traceless Hermitian with the same determinant: a vector of the same length. That defines $R(U)$.` },
      { label: 'Compute', text: t`$UXU^\dagger$ multiplies the off-diagonal entry $x - iy$ by $e^{-i\theta/2}\cdot e^{-i\theta/2} = e^{-i\theta}$ and leaves $z$ alone. So $x - iy \mapsto e^{-i\theta}(x - iy)$, which is $x + iy \mapsto e^{i\theta}(x + iy)$: a rotation by $\theta$ about $z$.` },
      { label: 'The sign', text: t`$(-U)X(-U)^\dagger = UXU^\dagger$: the two minus signs cancel. So $U$ and $-U$ give the same $R$. At $\theta = 2\pi$, $U = \operatorname{diag}(e^{-i\pi}, e^{i\pi}) = -I$ while $R = I$.` },
      { label: 'Sense check', text: t`The map $U \mapsto R(U)$ is a homomorphism ($R(U_1U_2) = R(U_1)R(U_2)$, since conjugating twice composes) with kernel $\{\pm I\}$: exactly two-to-one.` },
    ],
    answer: t`$R(U)$ turns $x + iy$ by $e^{i\theta}$: a rotation by $\theta$ about $z$. $-U$ gives the same $R$, so $SU(2) \to SO(3)$ is two-to-one, and $\theta = 360^\circ$ gives $U = -I$.`,
  },
  practice: [
    mcq({
      id: 'defining', difficulty: 2,
      gen(r) {
        const w = r.pick([0.5, 0.8, 1.1]);
        const c = r6(Math.cosh(w)), s = r6(Math.sinh(w));
        return {
          prompt: t`The 1+1 boost $\Lambda = \begin{pmatrix} ${nice(c, 4)} & ${nice(s, 4)} \\ ${nice(s, 4)} & ${nice(c, 4)}\end{pmatrix}$ acts on $(t, x)$ with $c = 1$. Which equation does it satisfy, with $\eta = \operatorname{diag}(-1, 1)$?`,
          visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-0.4, 2.8], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent', width: 1.6, label: 't² − x² = 1', labelAt: -2.2, labelDy: -6 }, { param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'ink4', dash: true, width: 1.2 }, { fn: 'abs(x)', color: 'warn', dash: true, width: 1 }], arrows: [{ from: [0, 0], to: [0, 1], color: 'ink3', width: 2, label: 'eₜ' }, { from: [0, 0], to: [s, c], color: 'gold', width: 2.4, label: 'Λeₜ' }] }, caption: t`$e_t$ and its image $\Lambda e_t$ (the first column). The tip stays on the hyperbola $t^2 - x^2 = 1$, not on the dashed unit circle.` },
          choices: [t`$\Lambda^\top\eta\,\Lambda = \eta$`, t`$\Lambda^\top\Lambda = I$`, t`$\Lambda^\dagger\Lambda = I$ (unitary)`, t`$\Lambda = \Lambda^{-1}$`],
          answer: 0,
          why: {
            1: t`$\Lambda^\top\Lambda$ has top-left entry $\cosh^2w + \sinh^2w = ${nice(c * c + s * s, 4)} \ne 1$: a boost stretches Euclidean length.`,
            2: t`For a real matrix that is the same as $\Lambda^\top\Lambda = I$, which fails for the same reason.`,
            3: t`$\Lambda^{-1}$ is the boost the other way, with $-\sinh w$ off the diagonal.`,
          },
          hints: ['What does a boost preserve: x² + t² or −t² + x²?', t`Check the top-left entry of $\Lambda^\top\eta\Lambda$: $-\cosh^2w + \sinh^2w$.`],
          teach: t`Each matrix group is defined by what it preserves: rotations a Euclidean length ($R^\top R = I$), Lorentz transformations the interval ($\Lambda^\top\eta\Lambda = \eta$).`,
          explain: t`$-\cosh^2w + \sinh^2w = -1$, off-diagonal $-\cosh w\sinh w + \sinh w\cosh w = 0$, and bottom-right $-\sinh^2w + \cosh^2w = 1$: $\Lambda^\top\eta\Lambda = \eta$. The interval is preserved; Euclidean length is not.`,
        };
      },
    }),
    num({
      id: 'dimension', difficulty: 2,
      gen(r) {
        const [n, which] = r.pick([[3, 'SO(3)'], [4, 'SO(4)'], [4, 'SO(1,3)'], [5, 'SO(1,4)'], [3, 'SO(1,2)'], [5, 'SO(5)']]);
        const ans = (n * (n - 1)) / 2;
        const pts = Array.from({ length: n }, (_, i) => [r6(Math.cos(Math.PI / 2 + (2 * Math.PI * i) / n)), r6(Math.sin(Math.PI / 2 + (2 * Math.PI * i) / n))]);
        const chords = [];
        for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) chords.push({ param: [`${pts[i][0]} + t*${r6(pts[j][0] - pts[i][0])}`, `${pts[i][1]} + t*${r6(pts[j][1] - pts[i][1])}`], t: [0, 1], color: 'teal', width: 1.4 });
        const tags = ['t', 'x', 'y', 'z', 'w'];
        return {
          prompt: t`What is the dimension of the Lie group $${which}$ — the number of independent parameters of its elements near the identity?`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.25, 1.25], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: chords, points: pts.map(([x, y], i) => ({ x, y, r: 6, color: 'gold', label: which.includes('1,') ? tags[i] : `x${'₁₂₃₄₅'[i]}`, labelDx: 8, labelDy: -8 })) }, caption: t`The ${n} coordinate axes as dots; each line joins a pair of axes, the plane in which one independent rotation (or boost) acts.` },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * n, feedback: t`That counts every matrix entry; the defining equation imposes $n(n+1)/2$ conditions.` }, { value: n, feedback: 'That is the number of axes. Rotations act in planes, one for each pair of axes.' }].filter((e) => e.value !== ans),
          hints: [t`The defining equation ($R^\top R = I$ or $\Lambda^\top\eta\Lambda = \eta$) is symmetric, so it imposes $n(n+1)/2$ conditions on $n^2$ entries.`, t`$n^2 - n(n+1)/2 = n(n-1)/2$: one parameter per pair of axes.`],
          teach: t`$SO(p, q)$ with $p + q = n$ has dimension $n(n-1)/2$, the signature does not matter: one rotation or boost per coordinate plane.`,
          explain: t`$${ans}$.${n === 4 && which === 'SO(1,3)' ? ' Three rotations (xy, yz, zx) and three boosts (tx, ty, tz).' : ' The Lorentz group SO(1,3) has 6: three rotations and three boosts.'} $SU(2)$ has $2^2 - 1 = 3$, the same as $SO(3)$ — no coincidence.`,
        };
      },
    }),
    num({
      id: 'su2-b', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[0.6, 0], [0.48, 0.36], [0, 0.8], [-0.3, 0.4], [0.5, -0.5], [-0.6, -0.6]]);
        const ans = Math.sqrt(1 - p * p - q * q);
        const aTeX = q === 0 ? `${p}` : p === 0 ? `${q}i` : `${p} ${q < 0 ? '-' : '+'} ${Math.abs(q)}i`;
        return {
          prompt: t`Every $U \in SU(2)$ has the form $U = \begin{pmatrix} a & -\bar b \\ b & \bar a\end{pmatrix}$ with $|a|^2 + |b|^2 = 1$. If $a = ${aTeX}$, what is $|b|$?`,
          visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.15, 1.15], equal: true, aspect: 'wide', xlabel: 'Re a', ylabel: 'Im a', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, label: '|a| = 1', labelAt: 0.6, labelDx: 6 }], points: [{ x: p, y: q, r: 5, color: 'gold', label: 'a' }] }, caption: t`The value of $a$ in the complex plane. With $b$, it makes a point $(a, b)$ on the unit sphere of $\mathbb C^2 = \mathbb R^4$.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 - Math.hypot(p, q), feedback: t`The condition is on squares: $|b|^2 = 1 - |a|^2$.` }, { value: 1 - p * p - q * q, feedback: t`That is $|b|^2$; take the square root.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\det U = a\bar a + b\bar b = |a|^2 + |b|^2 = 1$.`, t`$|a|^2 = ${nice(p * p + q * q, 4)}$.`],
          teach: t`$SU(2)$ is the set of $(a, b) \in \mathbb C^2$ with $|a|^2 + |b|^2 = 1$: a 3-sphere — the unit quaternions.`,
          explain: t`$|b| = \sqrt{1 - ${nice(p * p + q * q, 4)}} = ${nice(ans, 4)}$. Four real numbers with one condition: a 3-dimensional sphere $S^3$, which is why $SU(2)$ has no holes and every loop in it can shrink to a point.`,
        };
      },
    }),
    num({
      id: 'angle-from-trace', difficulty: 3,
      gen(r) {
        const thDeg = r.pick([60, 100, 140, 200, 240, 300]);
        const trU = r6(2 * Math.cos((thDeg * DEG) / 2));
        return {
          prompt: t`An element $U = \cos\tfrac\theta2\,I - i\sin\tfrac\theta2\,\hat n\cdot\vec\sigma$ of $SU(2)$, with $0 \le \theta \le 360^\circ$, has $\operatorname{tr}U = ${nice(trU, 4)}$. What rotation angle $\theta$ does it produce in $SO(3)$, in degrees?`,
          visual: { type: 'graph', params: { x: [0, 360], y: [-2.3, 2.3], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: 'tr U', xticks: 6, curves: [{ fn: '2*cos(x*pi/360)', color: 'accent', width: 2.2, label: 'tr U = 2 cos(θ/2)', labelAt: 40, labelDx: 6, labelDy: 14 }] }, caption: t`$\operatorname{tr}U$ against $\theta$; the Pauli matrices are traceless, so only the $\cos\tfrac\theta2\,I$ term counts.` },
          answer: thDeg, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: (2 * Math.acos(trU / 2)) / DEG / 2, feedback: t`That is $\theta/2$. $U$ carries half the angle: double it.` }, { value: Math.acos(Math.max(-1, Math.min(1, (trU - 1) / 2))) / DEG, feedback: t`That treats $\operatorname{tr}U$ as $\operatorname{tr}R = 1 + 2\cos\theta$. For $U$ it is $2\cos\tfrac\theta2$.` }].filter((e) => Math.abs(e.value - thDeg) > 0.01 * thDeg),
          hints: [t`$\operatorname{tr}U = 2\cos\tfrac\theta2$.`, t`$\cos\tfrac\theta2 = ${nice(trU / 2, 4)}$, so $\tfrac\theta2 = \arccos(${nice(trU / 2, 4)})$.`],
          teach: 'An SU(2) element carries half the rotation angle: tr U = 2 cos(θ/2), so a negative trace means θ beyond 180°.',
          explain: t`$\tfrac\theta2 = ${thDeg / 2}^\circ$, so $\theta = ${thDeg}^\circ$. ${thDeg > 180 ? t`That is the same rotation as $${360 - thDeg}^\circ$ about $-\hat n$; $-U$ would describe it with $\operatorname{tr} = ${nice(-trU, 4)}$.` : t`$-U$, with trace $${nice(-trU, 4)}$, gives the same rotation as $\theta + 360^\circ$.`}`,
        };
      },
    }),
    mcq({
      id: 'two-to-one', difficulty: 3,
      prompt: t`The map $SU(2) \to SO(3)$ is a homomorphism. How many elements of $SU(2)$ map to each rotation, and why?`,
      visual: { type: 'graph', params: { x: [0, 720], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: '', xticks: 8, curves: coverCurves(), points: [{ x: 100, y: r6(Math.cos(50 * DEG)), r: 5, color: 'accent', label: 'U' }, { x: 460, y: r6(Math.cos(230 * DEG)), r: 5, color: 'accent', label: '−U' }, { x: 100, y: r6(Math.cos(100 * DEG)), r: 5, color: 'gold' }, { x: 460, y: r6(Math.cos(460 * DEG)), r: 5, color: 'gold' }] }, caption: 'The rotation by 100° and by 460° about the same axis: the same R (gold), opposite U (blue).' },
      choices: [t`Two, $U$ and $-U$: the kernel is $\{I, -I\}$, and $UXU^\dagger$ cannot see an overall sign`, 'One: it is an isomorphism, since both groups have dimension 3', 'Infinitely many: one for each choice of axis', t`Two, $U$ and $U^\dagger$, because they rotate in opposite directions`],
      answer: 0,
      why: {
        1: t`Equal dimension makes the map locally one-to-one, near the identity; globally, $-I \ne I$ both go to $R = I$.`,
        2: t`The axis is part of the rotation: different axes are different rotations.`,
        3: t`$U^\dagger = U^{-1}$ gives the inverse rotation $R^{-1}$, which is generally a different rotation.`,
      },
      hints: [t`Which $U$ give $R = I$? Those are the kernel.`, t`A homomorphism with a kernel of $k$ elements is $k$-to-one.`],
      teach: 'SU(2) → SO(3) is a two-to-one homomorphism with kernel {±I}: SU(2) is the double cover of SO(3).',
      explain: t`$R(U)$ is built from $UXU^\dagger$, quadratic in $U$, so $\pm U$ agree. Since $SU(2)$ is a 3-sphere (simply connected) and $SO(3)$ is not, a $360^\circ$ loop of rotations lifts to a path from $I$ to $-I$ that does not close — spin ½.`,
    }),
    code({
      id: 'cover-map', difficulty: 3,
      prompt: t`Build the covering map. Write \`su2(theta, n)\` returning $U = \cos\tfrac\theta2\,I - i\sin\tfrac\theta2\,(\hat n\cdot\vec\sigma)$ for a unit 3-vector $\hat n$, and \`to_so3(U)\` returning the real $3\times3$ matrix $R_{ij} = \tfrac12\operatorname{tr}(\sigma_i U\sigma_j U^\dagger)$. The program prints $U$ and $R$ for a full turn, $\theta = 2\pi$.`,
      starter: t`import numpy as np

sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = np.array([[0, -1j], [1j, 0]])
sz = np.array([[1, 0], [0, -1]], dtype=complex)
SIG = [sx, sy, sz]

def su2(theta, n):
    pass

def to_so3(U):
    pass

U = su2(2 * np.pi, [0, 0, 1])
print(np.round(U, 6))
print(np.round(to_so3(U), 6))
`,
      answer: t`import numpy as np

sx = np.array([[0, 1], [1, 0]], dtype=complex)
sy = np.array([[0, -1j], [1j, 0]])
sz = np.array([[1, 0], [0, -1]], dtype=complex)
SIG = [sx, sy, sz]

def su2(theta, n):
    ns = sum(c * s for c, s in zip(n, SIG))
    return np.cos(theta / 2) * np.eye(2) - 1j * np.sin(theta / 2) * ns

def to_so3(U):
    return np.array([[0.5 * np.trace(SIG[i] @ U @ SIG[j] @ U.conj().T).real for j in range(3)] for i in range(3)])

U = su2(2 * np.pi, [0, 0, 1])
print(np.round(U, 6))
print(np.round(to_so3(U), 6))
`,
      tests: [
        { name: 'su2 gives a unitary matrix of determinant 1', code: 'np.allclose(su2(1.3, [0.6, 0, 0.8]).conj().T @ su2(1.3, [0.6, 0, 0.8]), np.eye(2)) and abs(np.linalg.det(su2(1.3, [0.6, 0, 0.8])) - 1) < 1e-9' },
        { name: t`a $90^\circ$ turn about $z$ maps $\hat x$ to $\hat y$`, code: 'np.allclose(to_so3(su2(np.pi / 2, [0, 0, 1])) @ [1, 0, 0], [0, 1, 0])' },
        { name: t`$R(U)$ is orthogonal with determinant $+1$`, code: 'np.allclose(to_so3(su2(2.1, [0, 0.6, 0.8])).T @ to_so3(su2(2.1, [0, 0.6, 0.8])), np.eye(3)) and abs(np.linalg.det(to_so3(su2(2.1, [0, 0.6, 0.8]))) - 1) < 1e-9' },
        { name: t`$U$ and $-U$ give the same rotation`, code: 'np.allclose(to_so3(su2(0.7, [0.6, 0.8, 0])), to_so3(-su2(0.7, [0.6, 0.8, 0])))' },
        { name: t`it is a homomorphism: $R(U_1U_2) = R(U_1)R(U_2)$`, code: 'np.allclose(to_so3(su2(0.9, [1, 0, 0]) @ su2(1.7, [0, 0.6, 0.8])), to_so3(su2(0.9, [1, 0, 0])) @ to_so3(su2(1.7, [0, 0.6, 0.8])))' },
        { name: t`a $2\pi$ turn gives $U = -I$ but $R = I$`, code: 'np.allclose(su2(2 * np.pi, [0, 0, 1]), -np.eye(2)) and np.allclose(to_so3(su2(2 * np.pi, [0, 0, 1])), np.eye(3))' },
      ],
      hints: [t`$\hat n\cdot\vec\sigma$ is \`n[0]*sx + n[1]*sy + n[2]*sz\`.`, t`\`to_so3\`: a nested list comprehension over \`i\` and \`j\` of \`0.5 * np.trace(SIG[i] @ U @ SIG[j] @ U.conj().T).real\`.`],
      teach: 'The covering map turns each SU(2) matrix into a rotation by conjugating the Pauli matrices; it is a homomorphism that cannot tell U from −U.',
      explain: t`$U(2\pi) = -I$ while $R = I$, and $\pm U$ give the same $R$ everywhere: a two-to-one homomorphism onto $SO(3)$. In the code, $R_{ij}$ is the $\hat x_i$-component of the rotated $\hat x_j$, read off with $\tfrac12\operatorname{tr}(\sigma_i\sigma_k) = \delta_{ik}$.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-quaternion-flip', difficulty: 2, transfer: true,
      prompt: t`A spacecraft’s attitude filter stores the unit quaternion $q = (q_0, q_1, q_2, q_3)$ — an element of $SU(2)$, with $q_0 = \cos\tfrac\theta2$. Between two telemetry samples every component changes sign, while the gyros report no motion. What happened?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [-1, 1], aspect: 'wide', xlabel: 'time (s)', ylabel: 'q₀', points: [0, 1, 2, 3, 4].map((k) => ({ x: k + 0.5, y: 0.71, r: 4, color: 'accent' })).concat([5, 6, 7, 8, 9].map((k) => ({ x: k + 0.5, y: -0.71, r: 4, color: 'accent' }))) }, caption: 'The telemetered scalar part q₀ (illustrative): it jumps from +0.71 to −0.71 between two samples.' },
      choices: [t`Nothing physical: $q$ and $-q$ are the two $SU(2)$ elements over the same rotation, and the software switched between them`, 'The spacecraft flipped through 180° in under a second', 'The spacecraft turned through 360°, which the gyros missed', 'The quaternion lost its normalization'],
      answer: 0,
      why: {
        1: t`A $180^\circ$ flip changes $\theta$ by $180^\circ$ and $q_0$ from $\cos\tfrac\theta2$ to $\cos(\tfrac\theta2 + 90^\circ)$ — not a pure sign change.`,
        2: t`A real $360^\circ$ turn would indeed carry $q$ to $-q$ — but the gyros would see it. Here no rotation happened at all.`,
        3: t`$|{-q}| = |q| = 1$: still a unit quaternion.`,
      },
      hints: [t`How many quaternions describe one attitude?`, t`$R(q) = R(-q)$.`],
      teach: 'Attitude quaternions double-cover rotations: q and −q are the same attitude, so filters pick a sign convention (often q₀ ≥ 0).',
      explain: t`Quaternions form $SU(2)$, which covers $SO(3)$ twice. Many filters keep $q_0 \ge 0$ and flip the sign when it would go negative; the jump is bookkeeping. Comparing attitudes must use $|q_a\cdot q_b|$, never $q_a\cdot q_b$.`,
    }),
    num({
      id: 'cp-slew', difficulty: 3, transfer: true,
      gen(r) {
        const thDeg = r.pick([40, 70, 110, 150]), axis = r.pick([[1, 0, 0], [0, 0.6, 0.8], [0, 1, 0]]);
        const qb = [-Math.cos((thDeg * DEG) / 2), ...axis.map((x) => -x * Math.sin((thDeg * DEG) / 2))].map((x) => r6(x));
        const dot = qb[0];
        const naive = (2 * Math.acos(dot)) / DEG;
        const label = qb.map((x) => nice(x, 4)).join(', ');
        return {
          prompt: t`An attitude-control system plans a slew from $q_a = (1, 0, 0, 0)$ (the reference attitude) to $q_b = (${label})$. The rotation angle between two attitudes is $\theta = 2\arccos|q_a\cdot q_b|$, where $q_a\cdot q_b$ is the four-dimensional dot product. What angle must the spacecraft turn through, in degrees?`,
          visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-1.15, 1.15], equal: true, aspect: 'wide', xlabel: 'scalar part q₀', ylabel: '|vector part|', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2 }], points: [{ x: 1, y: 0, r: 5, color: 'accent', label: 'start' }, { x: qb[0], y: r6(-Math.sin((thDeg * DEG) / 2)), r: 5, color: 'gold', label: 'target', labelDy: 14 }, { x: r6(-qb[0]), y: r6(Math.sin((thDeg * DEG) / 2)), r: 5, color: 'gold', hollow: true, label: 'minus target' }] }, caption: t`The quaternions on a slice of the unit 3-sphere (the vector part’s length drawn with the sign of its component along the rotation axis). $q_b$ and $-q_b$ are the same attitude.` },
          answer: thDeg, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: naive, feedback: t`Without the absolute value you measured the path to $q_b$ the long way round $S^3$: that is $360^\circ$ minus the true angle. $-q_b$ is the same attitude and is closer.` }],
          hints: [t`$q_a\cdot q_b$ is just $q_b$’s first component here.`, t`$|q_a\cdot q_b| = ${nice(Math.abs(dot), 4)}$; $\theta = 2\arccos(${nice(Math.abs(dot), 4)})$.`],
          teach: t`Because $q$ and $-q$ are one attitude, the angle between attitudes uses $|q_a\cdot q_b|$; dropping the absolute value sends the spacecraft the long way round.`,
          explain: t`$\theta = 2\arccos(${nice(Math.abs(dot), 4)}) = ${thDeg}^\circ$. The naive $2\arccos(${nice(dot, 4)}) = ${nice(naive, 4)}^\circ$ is the same rotation taken the long way — a real and costly bug in attitude software.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hall, Lie Groups, Lie Algebras, and Representations, 2nd ed. (Springer GTM 222, 2015), ch. 1 and §1.4', url: 'https://doi.org/10.1007/978-3-319-13467-3' },
    { label: 'Stillwell, Naive Lie Theory (Springer, 2008), chs. 1–2 (quaternions, SU(2) and SO(3))', url: 'https://doi.org/10.1007/978-0-387-78214-0' },
    { label: 'Markley & Crassidis, Fundamentals of Spacecraft Attitude Determination and Control (Springer, 2014), ch. 2', url: 'https://doi.org/10.1007/978-1-4939-0802-8' },
  ],
});
