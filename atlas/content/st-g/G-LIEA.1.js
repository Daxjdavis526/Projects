// Generators and commutators. A one-parameter subgroup e^{tX} and its
// generator X = dg/dt at the identity; orbits in the plane for the rotation,
// boost, dilation and shear generators; the commutator [X, Y] = XY − YX as the
// ε² gap left by the loop e^{εX}e^{εY}e^{−εX}e^{−εY}; so(3) from RᵀR = I
// (antisymmetric matrices), the real generators (J_i)_{jk} = −ε_{ijk} with
// [J₁, J₂] = J₃, J_i v = e_i × v, and the physicists' Hermitian 𝒥 = iJ with
// [𝒥_x, 𝒥_y] = i𝒥_z — checked numerically in a NumPy/SciPy exercise. Transfers:
// the net yaw from a roll–pitch–unroll–unpitch manoeuvre, and when
// e^X e^Y = e^{X+Y}. phys4710.M2.2 has the quantum-mechanical side.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6, J3, expm, scale, mul, comm, apply, trace } from './_sg3.js';

const t = String.raw;
const DEG = Math.PI / 180;

// four generators of motions of the plane, as orbit formulas through (px, py) at parameter τ
const ORBITS = [
  ['px*cos(T) - py*sin(T)', 'px*sin(T) + py*cos(T)'],
  ['px*cosh(T) + py*sinh(T)', 'px*sinh(T) + py*cosh(T)'],
  ['px*exp(T)', 'py*exp(T)'],
  ['px + T*py', 'py'],
];
const XP = [['-py', 'px'], ['py', 'px'], ['px', 'py'], ['py', '0']];
const sub = (s, T) => s.replaceAll('T', T);

// the loop e^{εA}, e^{εB}, e^{−εA}, e^{−εB} applied to p (rightmost first), sampled, with its gap
function loopPic(A, B, eps, p, caption) {
  const legs = [[B, -eps], [A, -eps], [B, eps], [A, eps]];
  let q = p.slice();
  const pts = [q];
  for (const [M, s] of legs) for (let k = 1; k <= 12; k++) { const step = expm(scale(s / 12, M)); q = apply(step, q); if (k % 3 === 0) pts.push(q); }
  const all = pts.flat(), m = Math.max(...all.map(Math.abs)) * 1.2 + 0.2;
  const curves = [];
  for (let i = 0; i + 1 < pts.length; i++) curves.push({ param: [`${r6(pts[i][0])} + t*${r6(pts[i + 1][0] - pts[i][0])}`, `${r6(pts[i][1])} + t*${r6(pts[i + 1][1] - pts[i][1])}`], t: [0, 1], color: 'accent', width: 2 });
  return {
    type: 'graph',
    params: {
      x: [r6(-1.8 * m), r6(1.8 * m)], y: [r6(-m), r6(m)], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y', curves,
      points: [{ x: r6(p[0]), y: r6(p[1]), r: 5, color: 'gold', label: 'start' }, { x: r6(q[0]), y: r6(q[1]), r: 5, color: 'bad', hollow: true, label: 'end', labelDy: 14 }],
    },
    caption,
  };
}

export default lesson({
  id: 'st-g.G-LIEA.1',
  title: 'Generators and commutators',
  minutes: 14, difficulty: 3,
  intro: t`A continuous group is mostly made of tiny steps. A **one-parameter subgroup** is a smooth path $g(t)$ with $g(s)g(t) = g(s + t)$, and every such path is an exponential of its **generator**, the velocity at the identity:

$$\begin{gathered} g(t) = e^{tX}, \qquad X = \frac{dg}{dt}\Big|_{t = 0} \\ e^{\varepsilon X}e^{\varepsilon Y}e^{-\varepsilon X}e^{-\varepsilon Y} = I + \varepsilon^2[X, Y] + O(\varepsilon^3)\end{gathered}$$

The generators form the group’s **Lie algebra**, a vector space closed under the **commutator** $[X, Y] = XY - YX$, which measures how badly two motions fail to commute: go forward along $X$, then $Y$, then back along each, and you miss your starting point by $\varepsilon^2[X, Y]$. The commutators of a basis — the **structure constants** — capture almost everything about the group. [Rotations and angular momentum](#/lesson/phys4710.M2.2) is the quantum-mechanical version.`,
  symbols: [
    { tex: 'X, Y', text: 'generators: matrices in the Lie algebra, the tangent directions at the identity' },
    { tex: 'e^{tX}', text: t`the matrix exponential $I + tX + \tfrac{t^2}{2}X^2 + \dots$` },
    { tex: '[X, Y]', text: t`the commutator $XY - YX$` },
    { tex: '\\varepsilon', text: 'a small parameter' },
    { tex: 'J_i', text: t`the real rotation generators, $(J_i)_{jk} = -\epsilon_{ijk}$, so that $J_iv = \hat e_i\times v$` },
    { tex: '\\epsilon_{ijk}', text: t`the Levi-Civita symbol: $+1$ for $(1, 2, 3)$ and its cyclic orders, $-1$ for the others, $0$ with a repeat` },
  ],
  why: 'Conserved quantities, quantum operators and the Lorentz algebra are all generators; the non-zero commutator of two boosts is the Thomas–Wigner rotation, and the commutators of covariant derivatives are curvature.',
  visual: {
    type: 'graph',
    title: 'A generator and the motion it makes',
    lead: t`Choose a generator $X$. The blue curve is the orbit $e^{\tau X}p$ of the point $p$; the gold dot sits at $\tau = s$. The red arrow is $Xp$, the orbit’s velocity at $p$ — the generator *is* that velocity field.`,
    tasks: [
      t`Rotation: circles. Boost: hyperbolas $y^2 - x^2 = \text{const}$ — read $y$ as $t$ and this is a Lorentz boost of the $(x, t)$ plane.`,
      t`Slide $s$ both ways: $e^{sX}e^{s'X} = e^{(s + s')X}$, so the dot runs along one curve, and $s = 0$ is always $p$ itself.`,
      t`Shear: $X^2 = 0$, so the series stops, $e^{\tau X} = I + \tau X$, and the orbits are straight lines.`,
    ],
    params: {
      x: [-4, 4], y: [-2.2, 2.2], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'y',
      choices: [{ key: 'k', label: t`Generator $X$`, options: [[0, t`rotation $\begin{pmatrix}0 & -1 \\ 1 & 0\end{pmatrix}$`], [1, t`boost $\begin{pmatrix}0 & 1 \\ 1 & 0\end{pmatrix}$`], [2, t`dilation $I$`], [3, t`shear $\begin{pmatrix}0 & 1 \\ 0 & 0\end{pmatrix}$`]], value: 0, explain: 'Four one-parameter groups of linear maps of the plane.' }],
      sliders: [{ key: 's', label: t`Parameter $s$`, min: -1.5, max: 1.5, step: 0.05, value: 0.6, explain: t`How far along the one-parameter group: the dot is $e^{sX}p$.` }, { key: 'px', label: t`$p_x$`, min: -1.5, max: 1.5, step: 0.1, value: 1.0, explain: 'The starting point’s x.' }, { key: 'py', label: t`$p_y$`, min: -1.5, max: 1.5, step: 0.1, value: 0.4, explain: 'The starting point’s y.' }],
      curves: ORBITS.map(([x, y], k) => ({ param: [sub(x, 't'), sub(y, 't')], t: [-2.5, 2.5], color: 'accent', width: 2, when: `step(0.5 - abs(k - ${k}))` })),
      points: [{ x: 'px', y: 'py', r: 5, color: 'ink', label: 'p', labelDx: -14 }, ...ORBITS.map(([x, y], k) => ({ x: sub(x, 's'), y: sub(y, 's'), r: 7, color: 'gold', when: `step(0.5 - abs(k - ${k}))` }))],
      arrows: XP.map(([x, y], k) => ({ from: ['px', 'py'], to: [`px + 0.6*(${x})`, `py + 0.6*(${y})`], color: 'bad', width: 2.4, label: 'Xp', when: `step(0.5 - abs(k - ${k}))` })),
    },
    caption: t`Exact orbits, drawn for $-2.5 \le \tau \le 2.5$. The arrow $Xp$ is drawn at $0.6$ times its length.`,
  },
  example: {
    prompt: t`Find the Lie algebra of $SO(3)$, choose a basis, and compute $[J_1, J_2]$. Then translate to the physicists’ Hermitian generators $\mathcal J_k = iJ_k$.`,
    visual: { type: 'calc-vectors3d', params: { range: 1.4, vectors: [{ to: [1, 0.3, 0.5], color: 'accent', label: 'v' }, { from: [1, 0.3, 0.5], to: [0.7, 1.3, 0.5], color: 'bad', label: 'J_3v' }], curves: [{ param: ['sqrt(1.09)*cos(t + 0.2915)', 'sqrt(1.09)*sin(t + 0.2915)', '0.5'], t: [0, 6.2832], color: 'ink3', dash: true }], yaw: 0.7, pitch: 0.45 }, caption: t`$J_3v = \hat z\times v$: the velocity of $v$ as it turns about the $z$-axis (dashed circle).` },
    steps: [
      { label: 'Differentiate the condition', text: t`For a path $R(t)$ in $SO(3)$ with $R(0) = I$, differentiate $R^\top R = I$ at $t = 0$: $\dot R^\top + \dot R = 0$. The generators are the **antisymmetric** $3\times3$ matrices — three numbers, matching $\dim SO(3) = 3$.` },
      { label: 'A basis', text: t`$(J_i)_{jk} = -\epsilon_{ijk}$: $J_3 = \begin{pmatrix}0 & -1 & 0 \\ 1 & 0 & 0 \\ 0 & 0 & 0\end{pmatrix}$, and $J_3v = \hat z\times v$. $e^{\theta J_3}$ is the rotation by $\theta$ about $z$.` },
      { label: 'Commute', text: t`$J_1J_2$ has a single nonzero entry, $(J_1J_2)_{21} = 1$; $J_2J_1$ has $(J_2J_1)_{12} = 1$. So $[J_1, J_2] = J_1J_2 - J_2J_1$ has $+1$ in row 2, column 1 and $-1$ in row 1, column 2: it is $J_3$. By cyclic symmetry $[J_i, J_j] = \epsilon_{ijk}J_k$.` },
      { label: 'Physicists’ form', text: t`Quantum mechanics wants Hermitian generators, $\mathcal J_k = iJ_k$ (then $R = e^{-i\theta\mathcal J}$). $[\mathcal J_1, \mathcal J_2] = i^2[J_1, J_2] = -J_3 = i\,(iJ_3) = i\mathcal J_3$.` },
      { label: 'Sense check', text: t`$[\mathcal J_x, \mathcal J_y] = i\mathcal J_z$ is the angular-momentum algebra with $\hbar = 1$. Same algebra, different bookkeeping of $i$: mathematicians write $[J_i, J_j] = \epsilon_{ijk}J_k$, physicists $[\mathcal J_i, \mathcal J_j] = i\epsilon_{ijk}\mathcal J_k$.` },
    ],
    answer: t`$\mathfrak{so}(3)$ = antisymmetric $3\times3$ matrices, basis $(J_i)_{jk} = -\epsilon_{ijk}$, with $[J_i, J_j] = \epsilon_{ijk}J_k$; equivalently $[\mathcal J_i, \mathcal J_j] = i\epsilon_{ijk}\mathcal J_k$ for $\mathcal J = iJ$.`,
  },
  practice: [
    mcq({
      id: 'generator', difficulty: 2,
      prompt: t`The boosts of the $(t, x)$ plane form the one-parameter group $B(w) = \begin{pmatrix}\cosh w & \sinh w \\ \sinh w & \cosh w\end{pmatrix}$. What is its generator?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-0.3, 2.6], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 't', curves: [{ param: ['sinh(t)', 'cosh(t)'], t: [-1.5, 1.5], color: 'accent', width: 2, label: 'B(w)eₜ', labelAt: 1.2, labelDx: 8 }, { fn: 'abs(x)', color: 'warn', dash: true, width: 1 }], arrows: [{ from: [0, 1], to: [1, 1], color: 'bad', width: 2.4, label: 'velocity at w = 0' }], points: [{ x: 0, y: 1, r: 5, color: 'gold', label: 'eₜ', labelDx: -18 }] }, caption: t`The orbit of $e_t$ under the boosts, and its velocity at $w = 0$.` },
      choices: [t`$\begin{pmatrix}0 & 1 \\ 1 & 0\end{pmatrix}$`, t`$\begin{pmatrix}0 & -1 \\ 1 & 0\end{pmatrix}$`, t`$\begin{pmatrix}1 & 0 \\ 0 & 1\end{pmatrix}$`, t`$\begin{pmatrix}1 & 1 \\ 1 & 1\end{pmatrix}$`],
      answer: 0,
      why: {
        1: t`That generates rotations ($\cos$ and $\sin$). Differentiate $\cosh$ and $\sinh$ instead.`,
        2: t`That is $B(0)$, the identity element — the starting point, not the velocity.`,
        3: t`That is $B(0) + B'(0)$, the first two terms of the series, not the generator.`,
      },
      hints: [t`The generator is $\dfrac{dB}{dw}$ at $w = 0$.`, t`$\tfrac{d}{dw}\cosh w = \sinh w$, which is $0$ at $w = 0$; $\tfrac{d}{dw}\sinh w = \cosh w$, which is $1$.`],
      teach: 'A generator is the velocity of a one-parameter group at the identity; exponentiating it gives the group back.',
      explain: t`$K = \begin{pmatrix}0 & 1 \\ 1 & 0\end{pmatrix}$, and $K^2 = I$, so $e^{wK} = \cosh w\,I + \sinh w\,K = B(w)$. Unlike a rotation generator, $K$ is symmetric: $K^\top\eta + \eta K = 0$ with $\eta = \operatorname{diag}(-1, 1)$.`,
    }),
    num({
      id: 'commutator', difficulty: 2,
      gen(r) {
        let A, B, C;
        do {
          A = [[r.int(-2, 2), r.int(-2, 2)], [r.int(-2, 2), r.int(-2, 2)]];
          B = [[r.int(-2, 2), r.int(-2, 2)], [r.int(-2, 2), r.int(-2, 2)]];
          C = comm(A, B);
        } while (C[0][1] === 0 || C[0][0] === 0);
        const ans = C[0][1];
        const AB = mul(A, B), BA = mul(B, A);
        const m = (M) => t`\begin{pmatrix}${M[0][0]} & ${M[0][1]} \\ ${M[1][0]} & ${M[1][1]}\end{pmatrix}`;
        return {
          prompt: t`For $X = ${m(A)}$ and $Y = ${m(B)}$, find the top-right entry of $[X, Y] = XY - YX$.`,
          visual: loopPic(scale(0.4, A), scale(0.4, B), 1, [1, 0.5], t`The loop $e^{-\varepsilon Y}$, $e^{-\varepsilon X}$, $e^{\varepsilon Y}$, $e^{\varepsilon X}$ applied to a point (here $\varepsilon = 0.4$): it fails to close, by roughly $\varepsilon^2[X, Y]$ applied to the point.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: AB[0][1], feedback: t`That is the entry of $XY$ alone; subtract $YX$.` }, { value: -ans, feedback: t`Order: $XY - YX$, not $YX - XY$.` }, { value: AB[0][1] + BA[0][1], feedback: 'The commutator subtracts the products.' }].filter((e) => e.value !== ans),
          hints: [t`$(XY)_{12} = X_{11}Y_{12} + X_{12}Y_{22}$.`, t`$(XY)_{12} = ${AB[0][1]}$ and $(YX)_{12} = ${BA[0][1]}$.`],
          teach: 'The commutator XY − YX measures how far two generators are from commuting; it is zero exactly when their one-parameter groups commute.',
          explain: t`$(XY)_{12} - (YX)_{12} = ${AB[0][1]} - (${BA[0][1]}) = ${ans}$. The whole commutator is $${m(C)}$; its trace is $0$, as every commutator’s is.`,
        };
      },
    }),
    num({
      id: 'shear-exp', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 1.5, 2, 3, -1]), tt = r.pick([0.4, 1.2, 2, 2.5]);
        const ans = a * tt;
        return {
          prompt: t`$N = \begin{pmatrix}0 & ${a} \\ 0 & 0\end{pmatrix}$ satisfies $N^2 = 0$. Find the top-right entry of $e^{${tt}N}$.`,
          visual: { type: 'la-map2d', params: { A: [[1, 'a*s'], [0, 1]], constants: { a }, sliders: [{ key: 's', label: t`$s$`, min: 0, max: 2.5, step: 0.1, value: 1, explain: t`The parameter of the one-parameter group $e^{sN}$.` }], readout: false, view: 2.5 }, caption: t`$e^{sN}$ acting on the plane: a shear that grows with $s$ (its formula is the question, so no numbers are shown).` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(a * tt), feedback: t`Matrix exponentials are not entrywise: $e^{tN} = I + tN + \tfrac{t^2}{2}N^2 + \dots$, and $N^2 = 0$.` }, { value: Math.exp(a * tt) - 1, feedback: 'The series stops after the linear term: no higher powers survive.' }].filter((e) => Math.abs(e.value - ans) > 0.005 * Math.abs(ans)),
          hints: [t`$e^{tN} = I + tN + \tfrac{t^2}{2}N^2 + \dots$`, t`With $N^2 = 0$ every term after $tN$ vanishes.`],
          teach: 'For a nilpotent generator the exponential series stops: e^{tN} = I + tN.',
          explain: t`$e^{${tt}N} = I + ${tt}N$, top-right entry $${tt}\times${a} = ${nice(ans)}$. Translations of a line, written as $2\times2$ matrices acting on $(x, 1)$, are exactly this: shears.`,
        };
      },
    }),
    mcq({
      id: 'structure', difficulty: 2,
      prompt: t`Given $[J_1, J_2] = J_3$, $[J_2, J_3] = J_1$ and $[J_3, J_1] = J_2$, what is $[J_3, J_2]$?`,
      visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.2, 1.25], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [{ param: ['0.9*cos(t)', '0.9*sin(t)'], t: [0, 6.2832], color: 'ink4', dash: true, width: 1.2 }], points: [{ x: 0, y: 0.9, r: 7, color: 'accent', label: 'J₁' }, { x: r6(0.9 * Math.cos(-Math.PI / 6)), y: r6(0.9 * Math.sin(-Math.PI / 6)), r: 7, color: 'gold', label: 'J₂' }, { x: r6(0.9 * Math.cos(7 * Math.PI / 6)), y: r6(0.9 * Math.sin(7 * Math.PI / 6)), r: 7, color: 'teal', label: 'J₃', labelDx: -24 }], arrows: [{ from: [0.3, 0.86], to: [0.68, 0.6], color: 'ink3', width: 1.8 }, { from: [0.55, -0.72], to: [-0.4, -0.82], color: 'ink3', width: 1.8 }, { from: [-0.82, -0.4], to: [-0.4, 0.8], color: 'ink3', width: 1.8 }] }, caption: 'The cyclic order 1 → 2 → 3 → 1: a bracket taken along the arrows gives + the third generator.' },
      choices: [t`$-J_1$`, t`$J_1$`, t`$-J_2$`, t`$0$`],
      answer: 0,
      why: {
        1: t`$[J_2, J_3] = J_1$ goes with the cyclic order; swapping the entries flips the sign.`,
        2: t`The bracket of $J_3$ and $J_2$ produces the third generator, $J_1$, not one of its inputs.`,
        3: t`Rotations about different axes do not commute; only $[J_i, J_i] = 0$.`,
      },
      hints: [t`The commutator is antisymmetric: $[X, Y] = -[Y, X]$.`, t`$[J_3, J_2] = -[J_2, J_3]$.`],
      teach: t`$[X, Y] = -[Y, X]$: with $[J_i, J_j] = \epsilon_{ijk}J_k$, against the cyclic order gives a minus sign.`,
      explain: t`$[J_3, J_2] = -[J_2, J_3] = -J_1$, i.e. $\epsilon_{321} = -1$. Antisymmetry also keeps the algebra closed: if $X^\top = -X$ and $Y^\top = -Y$ then $[X, Y]^\top = Y^\top X^\top - X^\top Y^\top = YX - XY = -[X, Y]$.`,
    }),
    mcq({
      id: 'factor-i', difficulty: 3,
      prompt: t`The real generators obey $[J_x, J_y] = J_z$. A quantum textbook uses Hermitian $\mathcal J_k = iJ_k$ and writes rotations as $e^{-i\theta\mathcal J}$. Which relation do the $\mathcal J$’s satisfy?`,
      visual: { type: 'calc-vectors3d', params: { range: 1.3, vectors: [{ to: [1, 0, 0], color: 'accent', label: '\\hat x' }, { to: [0, 1, 0], color: 'gold', label: '\\hat y' }, { to: [0, 0, 1], color: 'teal', label: '\\hat z' }], curves: [{ param: ['0.45*cos(t)', '0.45*sin(t)', '0'], t: [0, 4.8], color: 'teal' }, { param: ['0', '0.45*cos(t)', '0.45*sin(t)'], t: [0, 4.8], color: 'accent' }], yaw: 0.8, pitch: 0.4 }, caption: 'Right-handed axes with the sense of the rotations about x and z: the convention behind ε₁₂₃ = +1.' },
      choices: [t`$[\mathcal J_x, \mathcal J_y] = i\mathcal J_z$`, t`$[\mathcal J_x, \mathcal J_y] = \mathcal J_z$`, t`$[\mathcal J_x, \mathcal J_y] = -i\mathcal J_z$`, t`$[\mathcal J_x, \mathcal J_y] = -\mathcal J_z$`],
      answer: 0,
      why: {
        1: t`The factors of $i$ do not cancel: the left side has two, the right side one.`,
        2: t`Track the signs: $[\mathcal J_x, \mathcal J_y] = i^2J_z = -J_z$, and $-J_z = i\cdot iJ_z$.`,
        3: t`$-\mathcal J_z = -iJ_z$, but the bracket is $-J_z$.`,
      },
      hints: [t`$[\mathcal J_x, \mathcal J_y] = [iJ_x, iJ_y] = i^2[J_x, J_y]$.`, t`Write $-J_z$ in terms of $\mathcal J_z = iJ_z$: $-J_z = i(iJ_z)$.`],
      teach: 'Physicists and mathematicians describe one Lie algebra with different factors of i: Hermitian generators bring an i into every bracket.',
      explain: t`$[\mathcal J_x, \mathcal J_y] = -J_z = i\mathcal J_z$: the angular-momentum commutator with $\hbar = 1$. The $i$ is bookkeeping, not physics.`,
    }),
    code({
      id: 'so3-numerics', difficulty: 3,
      prompt: t`Build the rotation generators from the Levi-Civita symbol and check the algebra numerically. Write \`generators()\` returning the three real $3\times3$ arrays $(J_i)_{jk} = -\epsilon_{ijk}$, and \`gap(X, Y, eps)\` returning $\bigl(e^{\varepsilon X}e^{\varepsilon Y}e^{-\varepsilon X}e^{-\varepsilon Y} - I\bigr)/\varepsilon^2$ (use \`scipy.linalg.expm\`). The program prints how close the gap is to $[J_x, J_y]$ as $\varepsilon$ shrinks.`,
      starter: t`import numpy as np
from scipy.linalg import expm

def levi(i, j, k):
    return (i - j) * (j - k) * (k - i) / 2

def generators():
    pass

def gap(X, Y, eps):
    pass

def comm(A, B):
    return A @ B - B @ A

Jx, Jy, Jz = generators()
for eps in (0.1, 0.01, 0.001):
    print(eps, np.abs(gap(Jx, Jy, eps) - comm(Jx, Jy)).max())
`,
      answer: t`import numpy as np
from scipy.linalg import expm

def levi(i, j, k):
    return (i - j) * (j - k) * (k - i) / 2

def generators():
    return [np.array([[-levi(i, j, k) for k in range(3)] for j in range(3)]) for i in range(3)]

def gap(X, Y, eps):
    G = expm(eps * X) @ expm(eps * Y) @ expm(-eps * X) @ expm(-eps * Y)
    return (G - np.eye(len(X))) / eps**2

def comm(A, B):
    return A @ B - B @ A

Jx, Jy, Jz = generators()
for eps in (0.1, 0.01, 0.001):
    print(eps, np.abs(gap(Jx, Jy, eps) - comm(Jx, Jy)).max())
`,
      tests: [
        { name: t`each $J_i$ is antisymmetric`, code: 'all(np.allclose(J, -J.T) for J in generators())' },
        { name: t`$[J_x, J_y] = J_z$ (and cyclically)`, code: 'np.allclose(comm(Jx, Jy), Jz) and np.allclose(comm(Jy, Jz), Jx) and np.allclose(comm(Jz, Jx), Jy)' },
        { name: t`the Hermitian $\mathcal J = iJ$ obey $[\mathcal J_x, \mathcal J_y] = i\mathcal J_z$`, code: 'np.allclose(comm(1j * Jx, 1j * Jy), 1j * (1j * Jz))' },
        { name: t`$e^{(\pi/2)J_z}$ turns $\hat x$ into $\hat y$`, code: 'np.allclose(expm(np.pi / 2 * Jz) @ [1, 0, 0], [0, 1, 0])' },
        { name: t`the group-commutator gap is within $0.002$ of $[J_x, J_y]$ at $\varepsilon = 0.001$`, code: 'np.abs(gap(Jx, Jy, 1e-3) - comm(Jx, Jy)).max() < 2e-3' },
      ],
      hints: [t`\`generators\`: a list of three arrays, the $i$-th with entries \`-levi(i, j, k)\` in row \`j\`, column \`k\`.`, t`\`gap\`: multiply the four \`expm\` factors in the order written, subtract \`np.eye(3)\`, divide by \`eps**2\`.`],
      teach: 'The commutator is what the group commutator looks like up close: (e^{εX}e^{εY}e^{−εX}e^{−εY} − I)/ε² → [X, Y].',
      explain: t`The printed error shrinks in proportion to $\varepsilon$ — the $O(\varepsilon^3)$ term divided by $\varepsilon^2$. The numbers confirm $[J_x, J_y] = J_z$ and, with $\mathcal J = iJ$, $[\mathcal J_x, \mathcal J_y] = i\mathcal J_z$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wiggle', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([5, 8, 10, 12]), e = d * DEG;
        const Rx = (a) => expm(scale(a, J3[0])), Ry = (a) => expm(scale(a, J3[1]));
        const G = mul(mul(Rx(e), Ry(e)), mul(Rx(-e), Ry(-e)));
        const ans = Math.acos((trace(G) - 1) / 2) / DEG;
        // the nose (body x-axis) after each of the four moves, applied right to left
        const steps = [Ry(-e), Rx(-e), Ry(e), Rx(e)];
        let M = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        const noses = [[1.3, 0, 0]];
        for (const S of steps) { M = mul(S, M); noses.push(apply(M, [1.3, 0, 0]).map(r6)); }
        return {
          prompt: t`A spacecraft makes four small attitude moves, each by $\varepsilon = ${d}^\circ$: pitch $-\varepsilon$ (about $y$), roll $-\varepsilon$ (about $x$), pitch $+\varepsilon$, roll $+\varepsilon$ — the group commutator $R_x(\varepsilon)R_y(\varepsilon)R_x(-\varepsilon)R_y(-\varepsilon)$. Every move is undone, yet the craft ends up turned. By how many degrees, to about $1\%$?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.5, vectors: [{ to: [1.3, 0, 0], color: 'ink3', label: '\\text{start}' }, { to: noses[4], color: 'gold', label: '\\text{end}' }], segments: noses.slice(0, 4).map((p, i) => ({ from: p, to: noses[i + 1], color: 'accent' })), yaw: 0.35, pitch: 0.25 }, caption: 'The tip of the nose axis after each move (blue path; true positions, not exaggerated). It does not come home.' },
          answer: ans, units: 'deg', tol: { rel: 0.012 },
          errors: [{ value: d, feedback: t`The net turn is second order in $\varepsilon$: about $\varepsilon^2$ in radians.` }, { value: 0, feedback: 'Rotations about different axes do not commute, so the four moves do not cancel.' }, { value: (e * e) / 2 / DEG, feedback: t`The group commutator is $I + \varepsilon^2[J_x, J_y]$, with no factor $\tfrac12$.` }],
          hints: [t`$R_x(\varepsilon)R_y(\varepsilon)R_x(-\varepsilon)R_y(-\varepsilon) \approx I + \varepsilon^2[J_x, J_y] = I + \varepsilon^2J_z$: a rotation by $\varepsilon^2$ radians about $z$.`, t`$\varepsilon = ${d}^\circ = ${nice(e, 4)}$ rad, so $\varepsilon^2 = ${nice(e * e, 4)}$ rad; convert to degrees.`],
          teach: 'Small rotations about two axes, done and undone, leave a rotation of ε² about the third: the commutator made visible.',
          explain: t`$\varepsilon^2 = ${nice(e * e, 4)}\ \text{rad} = ${nice((e * e) / DEG, 4)}^\circ$; the exact net angle is $${nice(ans, 4)}^\circ$ (about $z$, the yaw axis). Falling cats and astronauts reorient this way with zero angular momentum, by cycling shape changes.`,
        };
      },
    }),
    mcq({
      id: 'cp-bch', difficulty: 3,
      prompt: t`For which generators is $e^Xe^Y = e^{X + Y}$ guaranteed?`,
      visual: { type: 'la-map2d', params: { maps: [{ name: 'A', A: [[1, 0.8], [0, 1]], label: 'shear' }, { name: 'B', A: [[1, 0], [0.8, 1]], label: 'other shear' }], order: true, view: 2.4 }, caption: t`Two shears, $e^X$ and $e^Y$ with $X = \begin{pmatrix}0 & 0.8 \\ 0 & 0\end{pmatrix}$ and $Y = X^\top$: compose them in each order. The results differ.` },
      choices: [t`When $[X, Y] = 0$`, 'Always: exponentials turn sums into products', t`When $X$ and $Y$ are both antisymmetric`, t`When $\operatorname{tr}X = \operatorname{tr}Y = 0$`],
      answer: 0,
      why: {
        1: t`True for numbers, false for matrices: the Baker–Campbell–Hausdorff formula gives $e^Xe^Y = e^{X + Y + \frac12[X, Y] + \dots}$.`,
        2: t`$J_x$ and $J_y$ are antisymmetric and do not commute; rotations about $x$ then $y$ are not a rotation about $x + y$.`,
        3: t`Traceless matrices can fail to commute too (the two shears in the picture).`,
      },
      hints: [t`Expand both sides to second order: $e^Xe^Y = I + X + Y + \tfrac12X^2 + XY + \tfrac12Y^2 + \dots$`, t`$e^{X + Y}$ has $\tfrac12(X + Y)^2 = \tfrac12(X^2 + XY + YX + Y^2)$.`],
      teach: 'Exponentials of matrices multiply like numbers only when the matrices commute; otherwise the commutator corrections of the Baker–Campbell–Hausdorff formula appear.',
      explain: t`The second-order terms differ by $\tfrac12(XY - YX) = \tfrac12[X, Y]$. Commuting generators (rotations about one axis, translations, collinear boosts) compose by adding; the rest leave commutator terms — the origin of the Thomas–Wigner rotation.`,
    }),
  ],
  sources: [
    { label: 'Hall, Lie Groups, Lie Algebras, and Representations, 2nd ed. (Springer GTM 222, 2015), chs. 2–3', url: 'https://doi.org/10.1007/978-3-319-13467-3' },
    { label: 'Stillwell, Naive Lie Theory (Springer, 2008), chs. 4–5', url: 'https://doi.org/10.1007/978-0-387-78214-0' },
  ],
});
