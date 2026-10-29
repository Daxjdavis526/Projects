// The singular value decomposition, geometrically: A = UΣVᵀ as turn,
// stretch, turn; the unit circle to an ellipse with semi-axes σᵢuᵢ = Avᵢ;
// singular values from AᵀA; singular values versus eigenvalues; the largest
// stretch, rank and the condition number.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matmul, transpose, matTeX, tupleTeX } from './_la.js';
import { svdPic } from './_ortho.js';
import { svd2 } from '../../src/viz/model/la-svd.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const deg = (r) => (r * 180) / Math.PI;
/** A random 2×2 integer matrix, not too degenerate, entries in [−range, range]. */
function mat2(r, range = 4) {
  for (let k = 0; k < 400; k++) {
    const A = [[r.int(-range, range), r.int(-range, range)], [r.int(-range, range), r.int(-range, range)]];
    const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (d === 0 || A.flat().filter((v) => v !== 0).length < 3) continue;
    const { s } = svd2(A);
    if (s[0] / s[1] > 12 || Math.abs(s[0] - s[1]) < 0.3) continue;
    return A;
  }
  return [[3, 0], [4, 5]];
}

export default lesson({
  id: 'math2270.LA-12.1',
  title: 'The SVD geometrically',
  minutes: 13, difficulty: 3,
  intro: t`Only symmetric matrices get perpendicular eigenvectors. The **singular value decomposition** gives *every* matrix — any shape, symmetric or not — perpendicular axes of its own, at the price of using two sets of them:

$$A = U\Sigma V${T}, \qquad A\mathbf v_i = \sigma_i\mathbf u_i$$

Read right to left, $A$ acts in three steps: $V${T}$ **turns** the input so the right singular vectors $\mathbf v_i$ lie along the axes, $\Sigma$ **stretches** along the axes by the singular values $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$, and $U$ **turns** the result into place. So $A$ maps the unit circle (sphere) onto an ellipse (ellipsoid) whose semi-axes are $\sigma_i\mathbf u_i$. To compute it: $A${T}A = V\Sigma^2V${T}$ is symmetric, so the $\mathbf v_i$ are its orthonormal eigenvectors and $\sigma_i = \sqrt{\lambda_i(A${T}A)}$; then $\mathbf u_i = A\mathbf v_i/\sigma_i$.`,
  symbols: [
    { tex: 'A', text: t`any real $m\times n$ matrix` },
    { tex: t`V`, text: t`$n\times n$ orthogonal; its columns $\mathbf v_i$ (right singular vectors) are an orthonormal basis of the input space` },
    { tex: t`\Sigma`, text: t`$m\times n$, zero except for the singular values $\sigma_1 \ge \sigma_2 \ge \dots \ge 0$ down its diagonal` },
    { tex: 'U', text: t`$m\times m$ orthogonal; its columns $\mathbf u_i$ (left singular vectors) are an orthonormal basis of the output space` },
    { tex: t`\sigma_i`, text: t`how much $A$ stretches along $\mathbf v_i$: $|A\mathbf v_i| = \sigma_i$. $\sigma_1$ is the largest stretch of any unit vector; the number of nonzero $\sigma_i$ is the rank` },
  ],
  why: 'The SVD is linear algebra’s most useful factorization: it gives a matrix’s size (σ₁), its sensitivity to noise (σ₁/σₙ), its rank in the presence of rounding, its best low-rank approximation (next lesson), principal components of data, and least-squares solutions when nothing else works.',
  visual: {
    type: 'la-svd',
    title: 'Turn, stretch, turn',
    lead: t`$A = \begin{bmatrix} 3 & b \\ c & 5 \end{bmatrix}$ applied to the unit circle one factor at a time. Green and orange are $\mathbf v_1$ and $\mathbf v_2$, carried along. The grey arrow is a unit vector $\mathbf x$ at the angle you choose, and gold its image $A\mathbf x$.`,
    tasks: [
      'Step through the factors: Vᵀ turns v₁ and v₂ onto the axes, Σ stretches them by σ₁ and σ₂, U turns the ellipse into place.',
      'Turn x until |Ax| (readout) is largest: x is then along v₁, and Ax along the long axis σ₁u₁.',
      'Set b = c = 2 (symmetric, positive eigenvalues): now U = V, and the σᵢ are the eigenvalues. Then set b = c = 4: det A = 15 − 16 < 0, and one of the turns becomes a reflection.',
    ],
    params: {
      mode: 'map', A: [[3, 'b'], ['c', 5]], x: 'th', rank1: false, readout: ['A', 'sigma', 'x'],
      sliders: [
        { key: 'b', label: t`Entry $b$ (row 1, column 2)`, min: -4, max: 4, step: 0.5, value: 0, explain: 'The top-right entry of A.' },
        { key: 'c', label: t`Entry $c$ (row 2, column 1)`, min: -6, max: 6, step: 0.5, value: 4, explain: 'The bottom-left entry of A.' },
        { key: 'th', label: t`Direction of $\mathbf x$`, min: 0, max: 180, step: 1, value: 20, unit: '^\\circ', explain: t`The angle of the unit vector $\mathbf x$ from the horizontal.` },
      ],
      view: 7.5,
    },
    caption: 'Dashed: the unit circle. Blue: its image after the factors chosen. Green, orange: v₁ and v₂ carried through; at the end they are the ellipse’s semi-axes σ₁u₁ and σ₂u₂. Faint grid: the plane’s grid carried along, so the turns show. Drawn to scale.',
  },
  example: {
    prompt: t`Find the SVD of $A = ${matTeX([[3, 0], [4, 5]])}$.`,
    visual: svdPic([[3, 0], [4, 5]], { stage: 3, stages: false, view: 7.5, caption: 'The unit circle (dashed) and its image under A: an ellipse with semi-axes σ₁u₁ and σ₂u₂ (green, orange), the images of v₁ and v₂ (faint dashed).' }),
    steps: [
      { label: 'Form A-transpose-A', text: t`$A${T}A = ${matTeX([[3, 4], [0, 5]])}${matTeX([[3, 0], [4, 5]])} = ${matTeX([[25, 20], [20, 25]])}$ — symmetric, as it always is.` },
      { label: 'Its eigenvalues', text: t`$(25 - \lambda)^2 = 400$ gives $\lambda = 45$ and $5$. So $\sigma_1 = \sqrt{45} = 3\sqrt5 \approx 6.71$ and $\sigma_2 = \sqrt5 \approx 2.24$.` },
      { label: 'Right vectors', text: t`Eigenvectors of $A${T}A$: $\mathbf v_1 = \tfrac1{\sqrt2}(1, 1)$ for 45, $\mathbf v_2 = \tfrac1{\sqrt2}(-1, 1)$ for 5.` },
      { label: 'Left vectors', text: t`$A\mathbf v_1 = \tfrac1{\sqrt2}(3, 9)$, of length $\sqrt{90/2} = 3\sqrt5$ ✓, so $\mathbf u_1 = \tfrac1{\sqrt{10}}(1, 3)$. $A\mathbf v_2 = \tfrac1{\sqrt2}(-3, 1)$, of length $\sqrt5$ ✓, so $\mathbf u_2 = \tfrac1{\sqrt{10}}(-3, 1)$. Perpendicular ✓.` },
      { label: 'Assemble', text: t`$$A = \underbrace{\tfrac1{\sqrt{10}}\begin{bmatrix} 1 & -3 \\ 3 & 1 \end{bmatrix}}_{U}\underbrace{\begin{bmatrix} 3\sqrt5 & 0 \\ 0 & \sqrt5 \end{bmatrix}}_{\Sigma}\underbrace{\tfrac1{\sqrt2}\begin{bmatrix} 1 & 1 \\ -1 & 1 \end{bmatrix}}_{V${T}}$$` },
      { label: 'Sense check', text: t`$\sigma_1\sigma_2 = 3\sqrt5\cdot\sqrt5 = 15 = |\det A|$: the ellipse's area is $15\pi$, the circle's area times $|\det A|$. And $\sigma_1^2 + \sigma_2^2 = 50 = 9 + 0 + 16 + 25$, the sum of the squared entries. The eigenvalues of $A$, 3 and 5, are neither singular value: $A$ is not symmetric.` },
    ],
    answer: t`$\sigma_1 = 3\sqrt5$, $\sigma_2 = \sqrt5$; $\mathbf v_1 = \tfrac1{\sqrt2}(1, 1)$, $\mathbf v_2 = \tfrac1{\sqrt2}(-1, 1)$; $\mathbf u_1 = \tfrac1{\sqrt{10}}(1, 3)$, $\mathbf u_2 = \tfrac1{\sqrt{10}}(-3, 1)$.`,
  },
  practice: [
    num({
      id: 'orth-cols', difficulty: 1,
      gen(r) {
        const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]), k = r.pick([2, 3]), flip = r.bool(0.5), which = r.int(0, 1);
        const c1 = [p, q], c2 = [-q * k, p * k].map((v) => (flip ? -v : v)), A = [[c1[0], c2[0]], [c1[1], c2[1]]];
        const s = [k * h, h], ans = s[which];
        return {
          prompt: t`The columns of $A = ${matTeX(A)}$ are perpendicular. What is its ${which ? 'smaller' : 'larger'} singular value?`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          hints: [t`With perpendicular columns, $A${T}A$ is diagonal: its entries are the squared column lengths.`, t`The singular values are the square roots of the eigenvalues of $A${T}A$ — here the column lengths.`],
          teach: 'If A’s columns are orthogonal, AᵀA is diagonal and the singular values are simply the column lengths.',
          explain: t`$A${T}A = ${matTeX([[h * h, 0], [0, k * k * h * h]])}$, so $\sigma = ${k * h}$ and $${h}$ — the lengths of the columns. Here $V$ is the identity (up to order): $A$ sends $\mathbf e_1$ and $\mathbf e_2$ to perpendicular vectors already.`,
          visual: svdPic(A, { stage: 3, stages: false, names: false, view: k * h * 1.15, caption: 'The unit circle (dashed) and its image under A. Lengths to scale.' }),
        };
      },
    }),
    num({
      id: 'sigma-from-AtA', difficulty: 2,
      gen(r) {
        const A = mat2(r), { s } = svd2(A), AtA = matmul(transpose(A), A), which = r.int(0, 1);
        const lam = [s[0] ** 2, s[1] ** 2];
        return {
          prompt: t`Find the ${which ? 'smaller' : 'larger'} singular value of $A = ${matTeX(A)}$, to 3 significant figures.`,
          answer: s[which], tol: { rel: 0.005 },
          errors: [{ value: lam[which], feedback: t`That is an eigenvalue of $A${T}A$, which is $\sigma^2$. Take the square root.` }].filter((e) => Math.abs(e.value - s[which]) > 0.005 * s[which]),
          hints: [t`$A${T}A = ${matTeX(AtA)}$.`, t`Its eigenvalues are $\tfrac{${AtA[0][0]} + ${AtA[1][1]}}2 \pm \sqrt{\left(\tfrac{${AtA[0][0]} - ${AtA[1][1]}}2\right)^2 + ${AtA[0][1] < 0 ? `(${AtA[0][1]})` : AtA[0][1]}^2}$; the singular values are their square roots.`],
          teach: 'Singular values are the square roots of the eigenvalues of the symmetric matrix AᵀA.',
          explain: t`$A${T}A$ has eigenvalues $${nice(lam[0], 4)}$ and $${nice(lam[1], 4)}$, so $\sigma_1 \approx ${nice(s[0], 3)}$ and $\sigma_2 \approx ${nice(s[1], 3)}$. Check: $\sigma_1\sigma_2 \approx ${nice(s[0] * s[1], 3)} = |\det A|$.`,
          visual: svdPic(A, { stage: 3, stages: false, names: false, view: s[0] * 1.15, caption: 'The unit circle (dashed) and its image under A; green and orange are the images of v₁ and v₂, the ellipse’s semi-axes.' }),
        };
      },
    }),
    mcq({
      id: 'not-eigen', difficulty: 2,
      prompt: t`The shear $A = ${matTeX([[1, 4], [0, 1]])}$ has both eigenvalues equal to 1. What are its singular values?`,
      choices: [t`About $4.24$ and $0.236$`, t`$1$ and $1$`, t`$4$ and $1$`, t`$\sqrt{17}$ and $1$`],
      answer: 0,
      why: {
        1: t`Those are the eigenvalues. A shear keeps the directions along $\mathbf e_1$ but stretches others a lot: the circle becomes a long thin ellipse. Singular values equal eigenvalues only for symmetric matrices with $\lambda \ge 0$.`,
        2: 'Those are entries of A, not stretches. The largest stretch is reached along a tilted direction.',
        3: t`$\sqrt{17}$ is the length of the second column, $|A\mathbf e_2|$ — a stretch, but not the largest one; and then $\sigma_1\sigma_2$ would not equal $|\det A| = 1$.`,
      },
      hints: [t`$A${T}A = \begin{bmatrix} 1 & 4 \\ 4 & 17 \end{bmatrix}$.`, t`$\sigma_1\sigma_2 = |\det A| = 1$ and $\sigma_1^2 + \sigma_2^2 = 1 + 16 + 0 + 1 = 18$.`],
      teach: 'Singular values measure stretching and eigenvalues measure invariant directions: for a non-symmetric matrix they can be very different.',
      explain: t`$\sigma^2 = 9 \pm \sqrt{80}$, so $\sigma_1 = 2 + \sqrt5 \approx 4.24$ and $\sigma_2 = \sqrt5 - 2 \approx 0.236$ (their product is 1). Eigenvalues 1 and 1 say nothing about how lopsided the ellipse is.`,
      visual: svdPic([[1, 4], [0, 1]], { stage: 3, stages: false, names: false, view: 4.8, caption: 'The unit circle (dashed) under the shear: a long, thin ellipse, though both eigenvalues are 1.' }),
    }),
    {
      type: 'slider', id: 'max-stretch', difficulty: 2, param: 'th',
      gen(r) {
        const A = mat2(r, 3), { V, s } = svd2(A);
        let th = deg(Math.atan2(V[1][0], V[0][0]));
        th = ((th % 180) + 180) % 180;
        const lo = th - 4, hi = th + 4;
        // the slider runs 0–180°; near the ends accept the wrapped value too
        const ans = lo < 0 ? [0, hi] : hi > 180 ? [lo, 180] : [lo, hi];
        return {
          prompt: t`Turn the unit vector $\mathbf x$ until $|A\mathbf x|$ is as large as it can be, for $A = ${matTeX(A)}$.`,
          answer: ans,
          visual: svdPic(A, { stage: 3, stages: false, vectors: false, x: 'th', view: s[0] * 1.15, sliders: [{ key: 'th', label: t`Direction of $\mathbf x$`, min: 0, max: 180, step: 1, value: Math.round((th + 90) % 180), unit: '^\\circ', explain: t`The angle of the unit vector $\mathbf x$ from the horizontal.` }], caption: 'The unit circle (dashed), its image (blue), a unit vector x (grey) and Ax (gold).' }),
          instruction: 'Move the slider until the gold arrow reaches the far end of the ellipse, then check.',
          hints: ['The longest image of a unit vector is the ellipse’s long semi-axis.', t`That happens for $\mathbf x = \pm\mathbf v_1$, the eigenvector of $A${T}A$ with the larger eigenvalue.`],
          teach: 'The largest stretch of any unit vector is σ₁, reached at the first right singular vector v₁.',
          explain: t`$\mathbf v_1$ points at about $${nice(th, 3)}^\circ$, where $|A\mathbf x| = \sigma_1 \approx ${nice(s[0], 3)}$; at right angles to it, $|A\mathbf x| = \sigma_2 \approx ${nice(s[1], 3)}$, the least stretch. $\sigma_1$ is the matrix's **norm**: $|A\mathbf x| \le \sigma_1|\mathbf x|$ for every $\mathbf x$.`,
        };
      },
    },
    num({
      id: 'det-product', difficulty: 2,
      gen(r) {
        const A = mat2(r), { s } = svd2(A), d = Math.abs(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
        return {
          prompt: t`$A = ${matTeX(A)}$ has largest singular value $\sigma_1 \approx ${nice(s[0], 5)}$. Use $\det A$ to find $\sigma_2$, to 3 significant figures.`,
          answer: d / s[0], tol: { rel: 0.005 },
          errors: [{ value: (A[0][0] * A[1][1] - A[0][1] * A[1][0]) / s[0], feedback: 'Singular values are never negative: use |det A|.' }].filter((e) => Math.abs(e.value - d / s[0]) > 0.01),
          hints: [t`$|\det A| = |\det U|\,\det\Sigma\,|\det V${T}| = \sigma_1\sigma_2$.`, t`$|\det A| = ${d}$.`],
          teach: 'The orthogonal factors have determinant ±1, so |det A| is the product of the singular values: the ellipse’s area is π σ₁σ₂.',
          explain: t`$\sigma_2 = |\det A|/\sigma_1 = ${d}/${nice(s[0], 5)} \approx ${nice(s[1], 3)}$.`,
          visual: svdPic(A, { stage: 3, stages: false, names: false, view: s[0] * 1.15, caption: 'The circle’s image: its area is π σ₁σ₂ = π |det A|.' }),
        };
      },
    }),
    multi({
      id: 'facts', difficulty: 3,
      prompt: t`Which statements hold for **every** real $m\times n$ matrix $A$ with SVD $U\Sigma V${T}$?`,
      choices: [
        t`The number of nonzero singular values is the rank of $A$`,
        t`$A${T}A$ and $AA${T}$ have the same nonzero eigenvalues, $\sigma_i^2$`,
        t`$|A\mathbf x| \le \sigma_1|\mathbf x|$ for every $\mathbf x$`,
        t`The singular values are the absolute values of the eigenvalues of $A$`,
        t`$U = V$`,
      ],
      answer: [0, 1, 2],
      why: {
        3: t`Only for symmetric (more generally, normal) matrices. The shear $\begin{bmatrix} 1 & 4 \\ 0 & 1 \end{bmatrix}$ has eigenvalues 1, 1 and singular values 4.24, 0.236. A non-square $A$ has no eigenvalues at all.`,
        4: t`$U$ is $m\times m$ and $V$ is $n\times n$: for a non-square $A$ they are not even the same size. $U = V$ only for a symmetric positive semidefinite $A$.`,
      },
      hints: [t`$AA${T} = U\Sigma\Sigma${T}U${T}$ and $A${T}A = V\Sigma${T}\Sigma V${T}$.`, 'Rank counts independent directions that survive; Σ kills exactly the directions with σᵢ = 0.'],
      teach: 'The SVD exposes rank, norm and the shared spectrum of AᵀA and AAᵀ for any matrix, square or not.',
      explain: t`$U$ and $V$ are invertible, so rank $A$ = rank $\Sigma$ = number of nonzero $\sigma_i$. $AA${T} = U(\Sigma\Sigma${T})U${T}$ and $A${T}A = V(\Sigma${T}\Sigma)V${T}$ share the nonzero $\sigma_i^2$. And $|A\mathbf x| = |\Sigma V${T}\mathbf x| \le \sigma_1|V${T}\mathbf x| = \sigma_1|\mathbf x|$.`,
      visual: svdPic([[2, 2], [1, 1]], { stage: 3, stages: false, view: 3.6, caption: 'A rank-1 matrix: σ₂ = 0, and the unit circle is crushed onto a segment of half-length σ₁ along u₁.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sigma1', difficulty: 2,
      gen(r) {
        const A = mat2(r), { s } = svd2(A);
        return {
          prompt: t`Find the largest singular value of $${matTeX(A)}$ (3 significant figures).`,
          answer: s[0], tol: { rel: 0.005 },
          errors: [{ value: s[0] ** 2, feedback: t`That is $\sigma_1^2$, the eigenvalue of $A${T}A$.` }],
          hints: [t`$\sigma_1^2$ is the larger eigenvalue of $A${T}A = ${matTeX(matmul(transpose(A), A))}$.`],
          teach: 'σ₁ = √(largest eigenvalue of AᵀA).',
          explain: t`$\sigma_1 \approx ${nice(s[0], 3)}$ (and $\sigma_2 \approx ${nice(s[1], 3)}$).`,
          visual: svdPic(A, { stage: 3, stages: false, names: false, view: s[0] * 1.15, caption: 'The circle and its image under A.' }),
        };
      },
    }),
    num({
      id: 'cp-condition', difficulty: 3, transfer: true,
      gen(r) {
        const e = r.pick([0.8, 0.85, 0.9, 0.92, 0.95]), A = [[1, e], [e, 1]].map((row) => row.map((v) => Math.round(v * 100) / 100));
        const w = r.pick([1, 1.2]); A[1][1] = w;
        const { s } = svd2(A), kappa = s[0] / s[1];
        return {
          prompt: t`A two-axis accelerometer's axes are badly misaligned, so its readings $\mathbf m = A\mathbf a$ mix the true accelerations with the calibration matrix $A = ${matTeX(A)}$. Recovering $\mathbf a = A^{-1}\mathbf m$ can magnify a relative error in $\mathbf m$ by up to the **condition number** $\kappa = \sigma_1/\sigma_2$. Find $\kappa$ (3 significant figures).`,
          answer: kappa, tol: { rel: 0.005 },
          errors: [{ value: kappa ** 2, feedback: t`That is the ratio of the eigenvalues of $A${T}A$, i.e. $\kappa^2$ — the condition number of the normal equations, which is why forming $A${T}A$ is avoided.` }],
          hints: [t`$\sigma_{1,2}$ are the square roots of the eigenvalues of $A${T}A$.`, t`$\sigma_1 \approx ${nice(s[0], 4)}$.`],
          teach: 'The condition number σ₁/σₙ measures how much solving Ax = b can amplify relative errors: a nearly flat ellipse means trouble.',
          explain: t`$\sigma_1 \approx ${nice(s[0], 4)}$, $\sigma_2 \approx ${nice(s[1], 3)}$, so $\kappa \approx ${nice(kappa, 3)}$: a 0.1% reading error can become about $${nice(0.1 * kappa, 2)}\%$ in the recovered acceleration. Well-aligned axes give $\kappa \approx 1$; the SVD shows which input direction ($\mathbf v_2$) is barely sensed.`,
          visual: svdPic(A, { stage: 3, stages: false, names: false, view: s[0] * 1.15, caption: 'The calibration matrix applied to the unit circle: a thin ellipse means one combination of accelerations is hardly seen.' }),
        };
      },
    }),
    mcq({
      id: 'cp-which-space', difficulty: 2,
      prompt: t`$A$ is $5\times3$ with SVD $U\Sigma V${T}$. Where do the right singular vectors $\mathbf v_i$ and the left singular vectors $\mathbf u_i$ live?`,
      choices: [t`$\mathbf v_i \in \mathbb R^3$ (inputs), $\mathbf u_i \in \mathbb R^5$ (outputs), with $A\mathbf v_i = \sigma_i\mathbf u_i$`, t`$\mathbf v_i \in \mathbb R^5$, $\mathbf u_i \in \mathbb R^3$`, t`Both in $\mathbb R^3$`, t`Both in $\mathbb R^5$`],
      answer: 0,
      why: {
        1: t`$A$ acts on $\mathbf v_i$, so $\mathbf v_i$ must have 3 components — the number of columns.`,
        2: t`$\mathbf u_i = A\mathbf v_i/\sigma_i$ is an output of a $5\times3$ matrix: 5 components.`,
        3: t`$V${T}$ multiplies the input first, so $V$ is $3\times3$.`,
      },
      hints: [t`$A$ takes vectors with 3 components to vectors with 5.`],
      teach: 'V is an orthonormal basis of the input space, U of the output space; A maps the first onto multiples of the second.',
      explain: t`$V$ is $3\times3$ and $U$ is $5\times5$; at most 3 singular values are nonzero, and $\mathbf u_4, \mathbf u_5$ lie in the left null space (they span it when the rank is 3).`,
      visual: svdPic([[2, 1], [0, 2]], { stage: 0, stages: true, view: 3.2, caption: 'A 2 × 2 example to step through: the vᵢ start in the input plane, and A carries them to σᵢuᵢ in the output plane.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), ch. 7: The singular value decomposition', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT 18.06, Lecture 29: Singular value decomposition', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
    { label: 'Trefethen and Bau, Numerical Linear Algebra, Lectures 4–5', url: 'https://people.maths.ox.ac.uk/trefethen/text.html' },
  ],
});
