// The spectral theorem: a real symmetric matrix has real eigenvalues and an
// orthonormal basis of eigenvectors, A = QΛQᵀ = Σ λᵢqᵢqᵢᵀ. Principal moments
// and axes of an inertia tensor; principal stresses.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, matTeX, tupleTeX, map2d } from './_la.js';
import { eigSym2, symInt2, intEigvec } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const IEX = [[6, -2, 0], [-2, 9, 0], [0, 0, 12]];
const s5 = Math.sqrt(5);
const PAX = [[2 / s5, 1 / s5, 0], [1 / s5, -2 / s5, 0], [0, 0, 1]];
const r3 = (x) => Math.round(x * 1000) / 1000;

// a small square of material with its stresses drawn as labelled arrows (labels plain text)
const element = (sx, sy, txy, caption) => ({
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.45, 1.45], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [['-0.7 + 1.4*t', '-0.7'], ['0.7', '-0.7 + 1.4*t'], ['0.7 - 1.4*t', '0.7'], ['-0.7', '0.7 - 1.4*t']].map((param) => ({ param, t: [0, 1], color: 'ink2', width: 2 })),
    arrows: [
      { from: [0.75, 0], to: [sx >= 0 ? 1.5 : 0.95, 0], ...(sx < 0 ? { from: [1.5, 0], to: [0.8, 0] } : {}), color: 'accent', label: `σx = ${sx} MPa`, labelDx: 6, labelDy: -12 },
      { from: [-0.75, 0], to: [sx >= 0 ? -1.5 : -0.95, 0], ...(sx < 0 ? { from: [-1.5, 0], to: [-0.8, 0] } : {}), color: 'accent' },
      { from: [0, 0.75], to: [0, sy >= 0 ? 1.4 : 0.95], ...(sy < 0 ? { from: [0, 1.4], to: [0, 0.8] } : {}), color: 'warn', label: `σy = ${sy} MPa`, labelDx: 8, labelDy: 4 },
      { from: [0, -0.75], to: [0, sy >= 0 ? -1.4 : -0.95], ...(sy < 0 ? { from: [0, -1.4], to: [0, -0.8] } : {}), color: 'warn' },
      { from: [0.85, txy >= 0 ? -0.5 : 0.5], to: [0.85, txy >= 0 ? 0.5 : -0.5], color: 'good', label: `τ = ${Math.abs(txy)} MPa`, labelDx: 6, labelDy: 14 },
      { from: [-0.85, txy >= 0 ? 0.5 : -0.5], to: [-0.85, txy >= 0 ? -0.5 : 0.5], color: 'good' },
      { from: [txy >= 0 ? -0.5 : 0.5, 0.85], to: [txy >= 0 ? 0.5 : -0.5, 0.85], color: 'good' },
      { from: [txy >= 0 ? 0.5 : -0.5, -0.85], to: [txy >= 0 ? -0.5 : 0.5, -0.85], color: 'good' },
    ],
  },
  caption,
});

export default lesson({
  id: 'math2270.LA-11.1',
  title: 'The spectral theorem',
  minutes: 13, difficulty: 3,
  intro: t`A general matrix may have complex eigenvalues, or too few eigenvectors, or eigenvectors at awkward angles. A **real symmetric** matrix has none of these problems. The **spectral theorem** says: every eigenvalue of $A = A${T}$ is real, eigenvectors for different eigenvalues are perpendicular, and there is always a full **orthonormal** basis of eigenvectors. With those as the columns of $Q$,

$$A = Q\Lambda Q${T} = \lambda_1\mathbf q_1\mathbf q_1${T} + \lambda_2\mathbf q_2\mathbf q_2${T} + \dots + \lambda_n\mathbf q_n\mathbf q_n${T}$$

Diagonalizing needs no inverse — $Q^{-1} = Q${T}$ — and $A$ is a sum of projections onto perpendicular lines, each stretched by its eigenvalue. For an inertia tensor the $\mathbf q_i$ are the body's **principal axes** and the $\lambda_i$ its principal moments; for a stress tensor they are the principal directions, where the shear vanishes, and the principal stresses.`,
  symbols: [
    { tex: t`A = A${T}`, text: t`a real symmetric $n\times n$ matrix: $a_{ij} = a_{ji}$` },
    { tex: t`\lambda_1, \dots, \lambda_n`, text: t`its eigenvalues — all real, listed with repeats` },
    { tex: t`\mathbf q_1, \dots, \mathbf q_n`, text: t`orthonormal eigenvectors: $A\mathbf q_i = \lambda_i\mathbf q_i$, $\mathbf q_i\cdot\mathbf q_j = 0$ for $i \ne j$, each of length 1` },
    { tex: 'Q', text: t`the orthogonal matrix with the $\mathbf q_i$ as columns, so $Q^{-1} = Q${T}$` },
    { tex: t`\Lambda`, text: t`the diagonal matrix of the eigenvalues, in the same order as the columns of $Q$` },
    { tex: t`\mathbf q_i\mathbf q_i${T}`, text: t`the $n\times n$ matrix that projects onto the line of $\mathbf q_i$ (LA-10.2)` },
  ],
  why: 'Normal modes, principal moments of inertia, principal stresses, the axes of an ellipse and quantum observables are all eigenvectors of symmetric (or Hermitian) operators — always real, always perpendicular.',
  visual: {
    type: 'la-map2d',
    title: 'A symmetric map stretches along perpendicular axes',
    lead: t`$A = \begin{bmatrix} a & b \\ b & c \end{bmatrix}$ is symmetric for every setting. It turns the unit circle into an ellipse; the violet dashed lines are its eigenvector directions, labelled with their eigenvalues.`,
    tasks: [
      'Move a, b and c anywhere: the two eigen-lines are always there (real eigenvalues) and always perpendicular — along the ellipse’s axes.',
      'Set b = 0: the eigenvectors are the coordinate axes and the eigenvalues are a and c.',
      'Set a = c = 1, b = 2: eigenvalues 3 and −1. A negative eigenvalue flips the circle along that axis (watch the F turn over).',
    ],
    params: {
      A: [['a', 'b'], ['b', 'c']], shape: 'F', eigen: true, view: 3, readout: ['A', 'det'],
      sliders: [
        { key: 'a', label: t`$a$ (top left)`, min: -2, max: 3, step: 0.25, value: 2, explain: 'The top-left entry.' },
        { key: 'b', label: t`$b$ (both off-diagonal entries)`, min: -2, max: 2, step: 0.25, value: 1, explain: 'One number in two places: that is what makes A symmetric.' },
        { key: 'c', label: t`$c$ (bottom right)`, min: -2, max: 3, step: 0.25, value: 1, explain: 'The bottom-right entry.' },
      ],
    },
    caption: 'Faint: the plane before the map. Bold: after it. Violet dashed: the directions A only stretches, with the stretch factor λ. For a symmetric A they always cross at a right angle.',
  },
  example: {
    prompt: t`A satellite's inertia tensor about its centre of mass is $I = ${matTeX(IEX)}$ kg m². Find its principal moments and principal axes, and write $I = Q\Lambda Q${T}$.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 2.2,
        vectors: [
          { to: PAX[0].map((v) => r3(1.6 * v)), color: 'good', label: '\\mathbf q_1\\ (5)' },
          { to: PAX[1].map((v) => r3(1.6 * v)), color: 'warn', label: '\\mathbf q_2\\ (10)' },
          { to: [0, 0, 1.6], color: 'violet', label: '\\mathbf q_3\\ (12)' },
        ],
        parallelograms: [{ at: [-1, -0.6, -0.4], u: [2, 0, 0], v: [0, 1.2, 0], color: 'ink3', alpha: 0.08 }, { at: [-1, -0.6, 0.4], u: [2, 0, 0], v: [0, 1.2, 0], color: 'ink3', alpha: 0.08 }],
      },
      caption: 'The principal axes in body coordinates, labelled with their moments in kg m². The faint slabs only suggest a body; the moments come from the tensor, not from this sketch. Drag to rotate.',
    },
    steps: [
      { label: 'Split the problem', text: t`The $z$ row and column are $(0, 0, 12)$: $\mathbf e_3$ is already a principal axis with moment 12 kg m². What remains is the $xy$ block $\begin{bmatrix} 6 & -2 \\ -2 & 9 \end{bmatrix}$.` },
      { label: 'Eigenvalues', text: t`$\det\begin{bmatrix} 6 - \lambda & -2 \\ -2 & 9 - \lambda \end{bmatrix} = \lambda^2 - 15\lambda + 50 = (\lambda - 5)(\lambda - 10)$: real, as promised. Principal moments $5$, $10$ and $12$ kg m².` },
      { label: 'Eigenvectors', text: t`$\lambda = 5$: $(6 - 5)x - 2y = 0$ gives $(2, 1, 0)$. $\lambda = 10$: $-4x - 2y = 0$ gives $(1, -2, 0)$. Their dot product is $2 - 2 = 0$ — perpendicular without being asked to be.` },
      { label: 'Normalize', text: t`$\mathbf q_1 = \tfrac1{\sqrt5}(2, 1, 0)$, $\mathbf q_2 = \tfrac1{\sqrt5}(1, -2, 0)$, $\mathbf q_3 = (0, 0, 1)$, so $Q = \begin{bmatrix} 2/\sqrt5 & 1/\sqrt5 & 0 \\ 1/\sqrt5 & -2/\sqrt5 & 0 \\ 0 & 0 & 1 \end{bmatrix}$ and $\Lambda = \operatorname{diag}(5, 10, 12)$.` },
      { label: 'Check', text: t`Trace: $6 + 9 + 12 = 27 = 5 + 10 + 12$ ✓. Determinant: $12(54 - 4) = 600 = 5\cdot10\cdot12$ ✓. And the moments obey the triangle inequality $5 + 10 \ge 12$, which every real body must.` },
      { label: 'Meaning', text: t`Spun about $\mathbf q_1$ or $\mathbf q_3$ (least or greatest moment), the free satellite turns steadily; about $\mathbf q_2$, the intermediate axis, the spin is unstable and the body flips (the “tennis-racket” effect). With energy dissipation only the greatest-moment axis is stable — the lesson of Explorer 1 in 1958, spun about its least axis and soon tumbling.` },
    ],
    answer: t`Principal moments $5$, $10$, $12$ kg m² about $\tfrac1{\sqrt5}(2, 1, 0)$, $\tfrac1{\sqrt5}(1, -2, 0)$ and $(0, 0, 1)$; $I = Q\Lambda Q${T}$ with $\Lambda = \operatorname{diag}(5, 10, 12)$.`,
  },
  practice: [
    num({
      id: 'eig-sym', difficulty: 1,
      gen(r) {
        const { A, l } = symInt2(r, { range: 6 }), which = r.int(0, 1);
        return {
          prompt: t`Find the ${which ? 'smaller' : 'larger'} eigenvalue of the symmetric matrix $A = ${matTeX(A)}$.`,
          answer: l[which], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: l[1 - which], feedback: `That is the ${which ? 'larger' : 'smaller'} one.` }],
          hints: [t`$\lambda^2 - (\text{trace})\lambda + \det = 0$, with trace $${A[0][0] + A[1][1]}$ and $\det = ${A[0][0] * A[1][1] - A[0][1] ** 2}$.`, t`For $\begin{bmatrix} a & b \\ b & c \end{bmatrix}$: $\lambda = \tfrac{a + c}2 \pm \sqrt{\left(\tfrac{a - c}2\right)^2 + b^2}$ — the square root is never imaginary.`],
          teach: 'For a symmetric 2 × 2 the discriminant is ((a − c)/2)² + b², a sum of squares: the eigenvalues are always real.',
          explain: t`$\lambda = ${nice((A[0][0] + A[1][1]) / 2)} \pm ${nice(Math.hypot((A[0][0] - A[1][1]) / 2, A[0][1]))}$, so the eigenvalues are $${l[0]}$ and $${l[1]}$. Their eigenvectors are $${tupleTeX(intEigvec(A, l[0]))}$ and $${tupleTeX(intEigvec(A, l[1]))}$ — perpendicular.`,
          visual: map2d(A, { shape: 'circle', view: Math.max(2, Math.max(...l.map(Math.abs)) * 0.9), colNames: ['', ''], caption: 'The unit circle (dashed) and its image under A. The ellipse’s semi-axes are |λ₁| and |λ₂|, along perpendicular directions.' }),
        };
      },
    }),
    num({
      id: 'other-eigvec', difficulty: 2,
      gen(r) {
        const { A, l } = symInt2(r, { range: 6 }), v = intEigvec(A, l[0]), w = intEigvec(A, l[1]);
        const ok = v[0] !== 0 && w[0] !== 0;
        const ww = ok ? w.map((x) => x / w[0]) : [1, 0];
        return {
          prompt: t`$A = ${matTeX(A)}$ is symmetric, and $${tupleTeX(v)}$ is an eigenvector with eigenvalue $${l[0]}$. Without solving anything, find $k$ so that $(1, k)$ is an eigenvector for the other eigenvalue, $${l[1]}$.`,
          answer: ok ? ww[1] : 0, tol: { rel: 1e-3, abs: 1e-3 },
          errors: v[0] !== 0 && Math.abs(v[1] / v[0] - ww[1]) > 1e-6 ? [{ value: v[1] / v[0], feedback: 'That is the direction of the eigenvector you were given. The other one is perpendicular to it.' }] : [],
          hints: ['For a symmetric matrix, eigenvectors for different eigenvalues are perpendicular.', t`In the plane, the direction perpendicular to $(p, q)$ is $(-q, p)$.`],
          teach: 'Eigenvectors of a symmetric matrix for different eigenvalues are orthogonal — in 2D, knowing one gives the other.',
          explain: t`Perpendicular to $${tupleTeX(v)}$ is $${tupleTeX(w)}$, i.e. $(1, ${nice(ww[1])})$. Check: $A(1, ${nice(ww[1])}) = (${nice(A[0][0] + A[0][1] * ww[1])}, ${nice(A[1][0] + A[1][1] * ww[1])}) = ${l[1]}(1, ${nice(ww[1])})$ ✓.`,
          visual: map2d(A, { shape: 'circle', view: Math.max(2, Math.max(...l.map(Math.abs)) * 0.9), colNames: ['', ''], x: v.map((x) => x / Math.hypot(...v)), xName: 'given', imageName: `${l[0]}×given`, caption: 'The circle’s image under A, and the given unit eigenvector with its image (gold), which lies along it.' }),
        };
      },
    }),
    mcq({
      id: 'not-symmetric', difficulty: 2,
      prompt: t`A real $2\times2$ matrix has eigenvectors $(1, 1)$ with eigenvalue 3 and $(1, 2)$ with eigenvalue 1. Can it be symmetric?`,
      choices: [
        t`No: a symmetric matrix's eigenvectors for different eigenvalues are perpendicular, and $(1, 1)\cdot(1, 2) = 3 \ne 0$`,
        'Yes: any eigenvalues can belong to a symmetric matrix',
        'Yes, if the eigenvectors are rescaled to unit length',
        'Cannot tell without the matrix entries',
      ],
      answer: 0,
      why: {
        1: t`The eigenvalues 3 and 1 are fine; the eigenvector directions are the problem. A symmetric matrix with eigenvalues 3 and 1 has perpendicular eigenvectors.`,
        2: 'Scaling changes lengths, not angles: the two directions still meet at about 18°.',
        3: t`The two eigenpairs fix the matrix completely: $A = PDP^{-1}$, which here is $\begin{bmatrix} 5 & -2 \\ 4 & -1 \end{bmatrix}$ — not symmetric.`,
      },
      hints: [t`If $A = A${T}$, then $\lambda_1(\mathbf v\cdot\mathbf w) = (A\mathbf v)\cdot\mathbf w = \mathbf v\cdot(A\mathbf w) = \lambda_2(\mathbf v\cdot\mathbf w)$.`],
      teach: 'Symmetry forces eigenvectors of distinct eigenvalues to be orthogonal: (λ₁ − λ₂) v·w = 0.',
      explain: t`For symmetric $A$, $(\lambda_1 - \lambda_2)\,\mathbf v\cdot\mathbf w = 0$, so with $\lambda_1 \ne \lambda_2$ the eigenvectors must be perpendicular. These are not, so the matrix — $\begin{bmatrix} 5 & -2 \\ 4 & -1 \end{bmatrix}$ — is not symmetric.`,
      visual: map2d([[5, -2], [4, -1]], { shape: 'circle', eigen: true, view: 3, colNames: ['', ''], caption: 'The matrix with these eigenpairs: its invariant lines (violet) are not perpendicular, and not along the ellipse’s axes.' }),
    }),
    num({
      id: 'spectral-sum', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[3, 4], [4, 3], [1, 2], [2, 1], [1, 1]]), n2 = p * p + q * q;
        const l1 = r.intExcept(-4, 6, [0]), l2 = r.intExcept(-4, 6, [0, l1]);
        const q1 = [p, q], q2 = [-q, p];
        const A = [[(l1 * p * p + l2 * q * q) / n2, ((l1 - l2) * p * q) / n2], [((l1 - l2) * p * q) / n2, (l1 * q * q + l2 * p * p) / n2]];
        const [i, j] = r.pick([[0, 0], [0, 1], [1, 1]]);
        return {
          prompt: t`Build the symmetric matrix with eigenvalue $${l1}$ along $(${p}, ${q})$ and eigenvalue $${l2}$ along $(${-q}, ${p})$, as $A = \lambda_1\mathbf q_1\mathbf q_1${T} + \lambda_2\mathbf q_2\mathbf q_2${T}$ with unit vectors $\mathbf q_i$. What is its entry in row ${i + 1}, column ${j + 1}?`,
          answer: A[i][j], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: [[l1 * p * p + l2 * q * q, (l1 - l2) * p * q], [(l1 - l2) * p * q, l1 * q * q + l2 * p * p]][i][j], feedback: t`Normalize first: $\mathbf q_1 = (${p}, ${q})/\sqrt{${n2}}$, so each $\mathbf q\mathbf q${T}$ carries a factor $1/${n2}$.` }].filter((e) => Math.abs(e.value - A[i][j]) > 1e-6),
          hints: [t`$\mathbf q_1\mathbf q_1${T} = \tfrac1{${n2}}${matTeX([[p * p, p * q], [p * q, q * q]])}$ and $\mathbf q_2\mathbf q_2${T} = \tfrac1{${n2}}${matTeX([[q * q, -p * q], [-p * q, p * p]])}$.`, t`Entry $(${i + 1}, ${j + 1})$: $\tfrac1{${n2}}\big(${l1}\cdot${[[p * p, p * q], [p * q, q * q]][i][j]} + (${l2})\cdot${[[q * q, -p * q], [-p * q, p * p]][i][j]}\big)$.`],
          teach: 'The spectral decomposition rebuilds A as a sum of eigenvalue × projection onto each eigenvector’s line.',
          explain: t`$A = ${matTeX(A.map((row) => row.map((v) => Math.round(v * 1e6) / 1e6)))}$, entry $${nice(A[i][j])}$. Check: trace $= ${l1} + (${l2})$ and $\det = ${l1}\cdot(${l2})$.`,
          visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.6, 1.6], aspect: 'wide', equal: true, xlabel: '', ylabel: '', curves: [{ param: [`${p}*t`, `${q}*t`], t: [-3, 3], color: 'good', dash: [5, 4], width: 1.4, label: `λ = ${l1}`, labelAt: 1.4 / Math.hypot(p, q) }, { param: [`${-q}*t`, `${p}*t`], t: [-3, 3], color: 'warn', dash: [5, 4], width: 1.4, label: `λ = ${l2}`, labelAt: 1.2 / Math.hypot(p, q) }], arrows: [{ from: [0, 0], to: [p / Math.sqrt(n2), q / Math.sqrt(n2)], color: 'good', width: 3, label: 'q₁' }, { from: [0, 0], to: [-q / Math.sqrt(n2), p / Math.sqrt(n2)], color: 'warn', width: 3, label: 'q₂' }] }, caption: 'The two perpendicular eigen-lines and their unit vectors.' },
        };
      },
    }),
    num({
      id: 'principal-stress', difficulty: 3,
      gen(r) {
        const { A, l } = symInt2(r, { range: 8, minQ: 2 });
        const S = A.map((row) => row.map((v) => 10 * v)), L = l.map((v) => 10 * v), which = r.int(0, 1);
        return {
          prompt: t`At a point on a pressurized tank wall the plane stress tensor is $\sigma = ${matTeX(S)}$ MPa ($\sigma_x = ${S[0][0]}$, $\sigma_y = ${S[1][1]}$, shear $\tau_{xy} = ${S[0][1]}$; tension positive). The principal stresses are its eigenvalues. Find the ${which ? 'smaller (most compressive)' : 'larger (most tensile)'} principal stress, in MPa.`,
          answer: L[which], units: 'MPa', tol: { rel: 1e-3, abs: 0.05 },
          errors: [{ value: Math.max(S[0][0], S[1][1]) * (which ? 0 : 1) + Math.min(S[0][0], S[1][1]) * which, feedback: 'The diagonal entries are the normal stresses on the x and y faces only. With shear present, a rotated face carries more (or less): the extremes are the eigenvalues.' }].filter((e) => Math.abs(e.value - L[which]) > 0.1),
          hints: [t`$\sigma_{1,2} = \tfrac{\sigma_x + \sigma_y}2 \pm \sqrt{\left(\tfrac{\sigma_x - \sigma_y}2\right)^2 + \tau_{xy}^2}$ — the centre and radius of Mohr's circle.`, t`Centre $${nice((S[0][0] + S[1][1]) / 2)}$ MPa, radius $\sqrt{${nice(((S[0][0] - S[1][1]) / 2) ** 2)} + ${S[0][1] ** 2}} = ${nice(Math.hypot((S[0][0] - S[1][1]) / 2, S[0][1]))}$ MPa.`],
          teach: 'Principal stresses are the eigenvalues of the symmetric stress tensor; on the principal planes, at right angles to each other, the shear vanishes.',
          explain: t`$\sigma_{1,2} = ${nice((S[0][0] + S[1][1]) / 2)} \pm ${nice(Math.hypot((S[0][0] - S[1][1]) / 2, S[0][1]))}$ MPa $= ${L[0]}$ and $${L[1]}$ MPa. The principal directions are perpendicular eigenvectors, $${tupleTeX(intEigvec(A, l[0]))}$ and $${tupleTeX(intEigvec(A, l[1]))}$; a crack tends to open across the direction of the largest tension.`,
          visual: element(S[0][0], S[1][1], S[0][1], 'A small square of the wall with the stresses on its faces (arrows show directions only, not magnitudes). Turning the square changes these numbers; at the principal angle the shear arrows vanish.'),
        };
      },
    }),
    multi({
      id: 'which-true', difficulty: 2,
      prompt: t`$A$ is a real symmetric $3\times3$ matrix. Which statements are **always** true?`,
      choices: [t`All three eigenvalues are real`, t`$A$ can be diagonalized as $Q\Lambda Q${T}$ with $Q$ orthogonal`, t`If an eigenvalue repeats, its eigenvectors can still be chosen orthonormal`, t`All eigenvalues are positive`, t`The eigenvalues are the diagonal entries of $A$`],
      answer: [0, 1, 2],
      why: {
        3: t`$\begin{bmatrix} 1 & 2 \\ 2 & 1 \end{bmatrix}$ is symmetric with eigenvalue $-1$. Positive eigenvalues is a further property — positive definiteness (LA-11.2).`,
        4: 'Only for a diagonal matrix. Off-diagonal entries change the eigenvalues; only their sum (the trace) equals the sum of the diagonal.',
      },
      hints: ['The spectral theorem promises three things: real eigenvalues, orthogonal eigenvectors, and a full set of them.', t`Try a $2\times2$ example with a negative eigenvalue, or with $b \ne 0$.`],
      teach: 'Symmetric means real eigenvalues and an orthonormal eigenbasis — even with repeats — but says nothing about their signs.',
      explain: t`The theorem guarantees real eigenvalues and an orthonormal eigenbasis; a repeated eigenvalue has an eigenspace of full dimension, inside which Gram–Schmidt picks orthonormal vectors. Signs are not guaranteed, and the eigenvalues are not the diagonal entries unless $A$ is diagonal.`,
      visual: map2d([[1, 2], [2, 1]], { shape: 'F', eigen: true, view: 3, colNames: ['', ''], caption: 'A symmetric matrix with eigenvalues 3 and −1: real and perpendicular eigen-lines, but one negative eigenvalue (the F is flipped across one axis).' }),
    }),
    code({
      id: 'eigh-code', difficulty: 2,
      prompt: t`A spacecraft's inertia tensor (kg m²) is given below. Use \`numpy.linalg.eigh\` — the routine for symmetric matrices, which returns real eigenvalues in ascending order and orthonormal eigenvectors as columns — to set \`moments\` (the principal moments) and \`Q\` (the principal axes). Then set \`rebuilt\` to $Q\Lambda Q${T}$ and \`intermediate\` to the principal axis with the middle moment (the unstable spin axis).`,
      starter: t`import numpy as np

I = np.array([[ 9.0, -1.5,  2.0],
              [-1.5, 12.0,  0.5],
              [ 2.0,  0.5, 14.0]])

moments, Q = None, None   # TODO: np.linalg.eigh
rebuilt = None            # TODO: Q @ diag(moments) @ Q.T
intermediate = None       # TODO: the column of Q for the middle moment

print(moments)
`,
      answer: t`import numpy as np

I = np.array([[ 9.0, -1.5,  2.0],
              [-1.5, 12.0,  0.5],
              [ 2.0,  0.5, 14.0]])

moments, Q = np.linalg.eigh(I)
rebuilt = Q @ np.diag(moments) @ Q.T
intermediate = Q[:, 1]

print(moments)
`,
      tests: [
        { name: 'the moments are real and ascending', code: 'np.all(np.isreal(moments)) and np.all(np.diff(moments) > 0)' },
        { name: 'they add up to the trace, 35 kg m²', code: 'abs(moments.sum() - 35) < 1e-9' },
        { name: '`Q` is orthogonal ($Q^{\\mathsf T}Q = I$)', code: 'np.allclose(Q.T @ Q, np.eye(3))' },
        { name: '$Q\\Lambda Q^{\\mathsf T}$ rebuilds the tensor', code: 'np.allclose(rebuilt, I)' },
        { name: '`intermediate` is the unit eigenvector for the middle moment', code: 'np.allclose(I @ intermediate, moments[1] * intermediate) and abs(np.linalg.norm(intermediate) - 1) < 1e-9' },
      ],
      hints: [t`\`moments, Q = np.linalg.eigh(I)\`.`, t`\`rebuilt = Q @ np.diag(moments) @ Q.T\`; the middle moment is \`moments[1]\`, its axis \`Q[:, 1]\`.`],
      teach: 'eigh exploits symmetry: real eigenvalues, orthonormal eigenvectors, and a faster, more accurate routine than the general eig.',
      explain: t`\`eigh\` is guaranteed real output and an orthogonal $Q$; the general \`eig\` would work but may return tiny imaginary parts and eigenvectors that are only nearly orthogonal. The moments satisfy the triangle inequalities, as a real body's must, and the middle axis is the one about which a free spin flips.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eig', difficulty: 2,
      gen(r) {
        const { A, l } = symInt2(r, { range: 7 });
        return {
          prompt: t`Find the larger eigenvalue of $${matTeX(A)}$.`,
          answer: l[0], tol: { rel: 0, abs: 0.01 },
          hints: [t`$\lambda = \tfrac{a + c}2 + \sqrt{\left(\tfrac{a - c}2\right)^2 + b^2}$.`],
          teach: 'Symmetric 2 × 2 eigenvalues: centre ± radius.',
          explain: t`$\lambda = ${nice((A[0][0] + A[1][1]) / 2)} \pm ${nice(Math.hypot((A[0][0] - A[1][1]) / 2, A[0][1]))}$: $${l[0]}$ and $${l[1]}$.`,
          visual: map2d(A, { shape: 'circle', view: Math.max(2, Math.max(...l.map(Math.abs)) * 0.9), colNames: ['', ''], caption: 'The unit circle and its image under the matrix.' }),
        };
      },
    }),
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const { A, l } = symInt2(r, { range: 7, sign: 'pos', minQ: 1 });
        const ok = l[1] >= 1;
        const B = ok ? A : [[5, -2], [-2, 8]], L = ok ? l : [9, 4];
        const Izz = L[0] + L[1];
        return {
          prompt: t`A flat solar-array wing lies in its $xy$-plane. Its inertia tensor is $${matTeX([[B[0][0], B[0][1], 0], [B[1][0], B[1][1], 0], [0, 0, Izz]])}$ kg m² (for a flat body $I_{zz} = I_{xx} + I_{yy}$). Find the **smallest** principal moment, in kg m² — the axis that a deployment mechanism must not leave the wing spinning about if anything flexes.`,
          answer: L[1], units: 'kg m^2', tol: { rel: 1e-3, abs: 0.01 },
          errors: [{ value: Math.min(B[0][0], B[1][1]), feedback: t`That is the smaller diagonal entry, the moment about a body axis. With the product of inertia $${B[0][1]}$ present, the principal moments are the eigenvalues of the $xy$ block.` }].filter((e) => Math.abs(e.value - L[1]) > 0.01),
          hints: [t`$\mathbf e_3$ is already principal (moment $${Izz}$); the other two are eigenvalues of $${matTeX(B)}$.`, t`$\lambda = \tfrac{${B[0][0]} + ${B[1][1]}}2 \pm \sqrt{\left(\tfrac{${B[0][0]} - ${B[1][1]}}2\right)^2 + (${B[0][1]})^2}$.`],
          teach: 'Principal moments are the eigenvalues of the symmetric inertia tensor, along perpendicular principal axes.',
          explain: t`The $xy$ block has eigenvalues $${L[0]}$ and $${L[1]}$, so the principal moments are $${L[1]}$, $${L[0]}$ and $${Izz}$ kg m². The smallest is about $${tupleTeX(intEigvec(B, L[1]))}$ in the panel's plane. A spin about the least axis is stable only for a perfectly rigid body; flexing dissipates energy and drives the spin toward the axis of greatest moment — here the normal to the panel.`,
          visual: { type: 'calc-vectors3d', params: { range: 2, parallelograms: [{ at: [-1.6, -0.6, 0], u: [3.2, 0, 0], v: [0, 1.2, 0], color: 'accent', alpha: 0.22 }] }, caption: 'The flat wing in its xy-plane (a sketch; its mass distribution is given by the tensor, not by this rectangle). Drag to rotate.' },
        };
      },
    }),
    mcq({
      id: 'cp-power', difficulty: 2,
      prompt: t`$A = Q\Lambda Q${T}$ with $Q$ orthogonal and $\Lambda$ diagonal. Which expression equals $A^3$?`,
      choices: [t`$Q\Lambda^3Q${T}$`, t`$Q^3\Lambda^3(Q${T})^3$`, t`$Q\Lambda^3Q^{-3}$`, t`$Q${T}\Lambda^3Q$`],
      answer: 0,
      why: {
        1: t`Multiply it out: $(Q\Lambda Q${T})(Q\Lambda Q${T})(Q\Lambda Q${T})$ — the inner $Q${T}Q$ pairs cancel, leaving one $Q$ and one $Q${T}$.`,
        2: t`Only one $Q$ survives on each side; $Q^{-3}$ is not $Q^{-1}$ unless $Q^2 = I$.`,
        3: t`The order matters: $Q${T}\Lambda Q$ is a different matrix (unless $Q$ is symmetric too).`,
      },
      hints: [t`$Q${T}Q = I$.`],
      teach: 'Powers and functions of a symmetric matrix act on its eigenvalues alone: f(A) = Q f(Λ) Qᵀ.',
      explain: t`$A^3 = Q\Lambda(Q${T}Q)\Lambda(Q${T}Q)\Lambda Q${T} = Q\Lambda^3Q${T}$: same eigenvectors, eigenvalues cubed. The same trick gives $e^{At}$ for coupled oscillators and $\sqrt A$ for a positive definite $A$.`,
      visual: map2d([[2, 1], [1, 2]], { shape: 'circle', eigen: true, view: 3.4, colNames: ['', ''], caption: 'A symmetric map with eigenvalues 3 and 1 along perpendicular lines. Cubing it keeps the lines and cubes each stretch: 27 and 1.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.3: Symmetric matrices', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Taylor, Classical Mechanics, §10.5–10.8: principal axes', url: 'https://uscibooks.aip.org/books/classical-mechanics/' },
    { label: 'Efroimsky, “Precession of a freely rotating rigid body. Inelastic relaxation in the vicinity of poles” (Explorer 1)', url: 'https://doi.org/10.1063/1.533359' },
    { label: 'NumPy documentation: numpy.linalg.eigh', url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.eigh.html' },
  ],
});
