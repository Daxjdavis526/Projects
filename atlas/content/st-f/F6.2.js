// QR and Cholesky — the two factorizations that need no pivoting. Cholesky
// A = LLᵀ for symmetric positive definite matrices: half the work of LU,
// unconditionally stable, and the cheapest test of positive definiteness.
// QR by Householder reflections: orthogonal transformations cannot amplify
// errors; the sign choice that avoids cancellation; why Gram–Schmidt (classical
// or modified) loses orthogonality that Householder keeps, measured.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12 } from './_num.js';
import { cholesky, vander, cond2, gramSchmidt, qrHouseholder, orthoLoss } from './_lin.js';

const t = String.raw;

const CA = [[4, 2, -2], [2, 10, 2], [-2, 2, 6]];
const CL = cholesky(CA);

// orthogonality lost by classical and modified Gram–Schmidt and by Householder: monomials on 30 points of [0, 1]
const TS = Array.from({ length: 30 }, (_, i) => i / 29);
const OL = [6, 9, 12].map((m) => { const A = vander(TS, m - 1); return { m, k: cond2(A), cgs: orthoLoss(gramSchmidt(A).Q), mgs: orthoLoss(gramSchmidt(A, true).Q), hh: orthoLoss(qrHouseholder(A).Q) }; });

const matTeX = (M) => t`\begin{pmatrix}${M.map((r) => r.join(' & ')).join(t` \\ `)}\end{pmatrix}`;
const mm = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
const T = (A) => A[0].map((_, j) => A.map((r) => r[j]));

// a = (px, py), s = sign(px): stable v = a + s‖a‖e₁ reflects a onto −s‖a‖e₁
const S = '(2*step(px) - 1)', R = 'sqrt(px^2 + py^2)';

export default lesson({
  id: 'st-f.F6.2',
  title: 'QR and Cholesky',
  minutes: 14, difficulty: 3,
  intro: t`Two factorizations do better than LU when they apply, and neither needs pivoting. A **symmetric positive definite** (SPD) matrix — a stiffness matrix, a covariance, the normal-equation matrix $A^{\mathsf T}A$ — factors as $A = LL^{\mathsf T}$, **Cholesky**: symmetry halves the work to $\tfrac13n^3$ flops, and positivity bounds every entry of $L$ by the diagonal of $A$, so no growth is possible. **Any** matrix factors as $A = QR$ with $Q$ orthogonal; built from Householder reflections, it is backward stable because orthogonal maps preserve lengths and so cannot magnify a rounding error.

$$A = LL^{\mathsf T}\ \ \text{(}A\text{ SPD)}, \qquad A = QR,\ \ Q^{\mathsf T}Q = I, \qquad H = I - \frac{2\,vv^{\mathsf T}}{v^{\mathsf T}v}$$

You met QR by Gram–Schmidt in [linear algebra](#/lesson/math2270.LA-10.3); in floating point, Gram–Schmidt quietly loses the orthogonality that defines $Q$, and Householder does not.`,
  symbols: [
    { tex: 'L', text: 'the Cholesky factor: lower-triangular with a positive diagonal, $l_{jj} = \\sqrt{a_{jj} - \\sum_{k<j} l_{jk}^2}$' },
    { tex: t`L^{\mathsf T}`, text: 'its transpose; the factorization is its own “U”, stored once' },
    { tex: 'Q', text: 'orthogonal: its columns are orthonormal, so $\\lVert Qx\\rVert = \\lVert x\\rVert$ for every $x$' },
    { tex: 'R', text: 'upper-triangular, with $\\kappa(R) = \\kappa(A)$' },
    { tex: 'H', text: 'a **Householder reflection**: the mirror image across the plane perpendicular to $v$. $QR$ applies one per column, $Q^{\\mathsf T} = H_n\\cdots H_2H_1$' },
    { tex: 'v', text: 'the mirror’s normal, chosen so $H$ sends a column $a$ onto the first axis: $v = a + \\operatorname{sign}(a_1)\\lVert a\\rVert e_1$' },
  ],
  why: 'Cholesky is how finite-element codes solve stiffness systems and how navigation filters keep covariances honest; Householder QR is the engine of least squares (F8.1) and of the QR eigenvalue algorithm (F7.2).',
  visual: {
    type: 'graph',
    title: 'A Householder mirror',
    lead: t`Drag the vector $a$. The dashed line is the mirror perpendicular to $v = a + \operatorname{sign}(a_1)\lVert a\rVert e_1$; reflecting $a$ in it lands exactly on the horizontal axis, at $-\operatorname{sign}(a_1)\lVert a\rVert$. One such reflection zeroes everything below the first entry of a column.`,
    tasks: [
      'Drag a around: its image always has the same length (the readout) and sits on the axis.',
      'Move a close to the positive axis. The readout ‖a − ‖a‖e₁‖ — the other possible normal — shrinks towards 0: computing it would subtract nearly equal numbers. The sign choice keeps v long.',
      'Cross to the left half-plane: the mirror flips so the image lands on the positive side.',
    ],
    params: {
      x: [-3.4, 3.4], y: [-2.1, 2.1], aspect: 'wide', equal: true, axesAt: 'center', xlabel: '', ylabel: '',
      drag: [{ key: 'p', x: 2, y: 1.2, snap: 0.05 }],
      curves: [{ param: [`-py*t/sqrt(py^2 + (px + ${S}*${R})^2)`, `(px + ${S}*${R})*t/sqrt(py^2 + (px + ${S}*${R})^2)`], t: [-4, 4], color: 'ink3', dash: true, width: 1.5 }],
      arrows: [
        { from: [0, 0], to: ['px', 'py'], color: 'accent', width: 2.4, label: 'a', labelDx: 6, labelDy: -6 },
        { from: [0, 0], to: [`-${S}*${R}`, 0], color: 'gold', width: 2.4, label: 'Ha', labelDx: -6, labelDy: 16 },
        { from: [0, 0], to: [`(px + ${S}*${R})/3`, 'py/3'], color: 'violet', width: 1.8, label: 'v (scaled)', labelDx: 6, labelDy: 14 },
      ],
      readouts: [
        { label: '‖a‖', expr: R, digits: 4 },
        { label: '‖v‖ (sign chosen)', expr: `sqrt((px + ${S}*${R})^2 + py^2)`, digits: 4 },
        { label: '‖a − ‖a‖e₁‖ (other sign)', expr: `sqrt((px - ${S}*${R})^2 + py^2)`, digits: 4 },
      ],
    },
    caption: 'Exact geometry of a 2D Householder reflection; v is drawn at a third of its length. In n dimensions the mirror is a hyperplane and the same choice of sign applies.',
  },
  example: {
    prompt: t`A navigation filter carries the position covariance $C = ${matTeX(CA)}\ \text{m}^2$. Factor $C = LL^{\mathsf T}$ by Cholesky, column by column, and use the factor to find $\det C$. Why is no pivoting needed?`,
    visual: {
      type: 'graph',
      params: { x: [-5.5, 5.5], y: [-4.2, 4.2], aspect: 'wide', equal: true, axesAt: 'center', xlabel: 'x (m)', ylabel: 'y (m)',
        curves: [{ param: [`${n12(CL[0][0])}*cos(t)`, `${n12(CL[1][0])}*cos(t) + ${n12(CL[1][1])}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent', width: 2 }],
        arrows: [{ from: [0, 0], to: [n12(CL[0][0]), n12(CL[1][0])], color: 'gold', width: 2, label: 'first column of L', labelDx: 6, labelDy: -4 }, { from: [0, 0], to: [0, n12(CL[1][1])], color: 'violet', width: 2, label: 'second', labelDx: 6, labelDy: -4 }] },
      caption: 'The one-sigma ellipse of the x–y part of C, traced as L applied to the unit circle (x = Lz with |z| = 1): the columns of L are a pair of conjugate semi-diameters.',
    },
    steps: [
      { label: 'Column 1', text: t`$l_{11} = \sqrt{c_{11}} = \sqrt4 = 2$. Below it, divide by $l_{11}$: $l_{21} = 2/2 = 1$, $l_{31} = -2/2 = -1$.` },
      { label: 'Column 2', text: t`$l_{22} = \sqrt{c_{22} - l_{21}^2} = \sqrt{10 - 1} = 3$; $l_{32} = (c_{32} - l_{31}l_{21})/l_{22} = (2 - (-1)(1))/3 = 1$.` },
      { label: 'Column 3', text: t`$l_{33} = \sqrt{c_{33} - l_{31}^2 - l_{32}^2} = \sqrt{6 - 1 - 1} = 2$. So $L = ${matTeX(CL.map((r) => r.map((x) => Math.round(x))))}$, and multiplying back gives $C$. ✓` },
      { label: 'Determinant', text: t`$\det C = (\det L)^2 = (2\cdot3\cdot2)^2 = 144\ \text{m}^6$. Its square root, 12 m³, is proportional to the volume of the error ellipsoid.` },
      { label: 'Why no pivoting', text: t`Each $l_{jj}^2$ is $c_{jj}$ minus a sum of squares, and positive definiteness keeps it positive; so $l_{ij}^2 \le c_{ii}$ for every entry. Nothing can grow beyond the diagonal of $C$: $\rho \le 1$ in the sense of [F6.1](#/lesson/st-f.F6.1).` },
      { label: 'Cost', text: t`Only the lower triangle is ever touched: about $\tfrac13n^3$ flops, half of LU’s $\tfrac23n^3$, and half the storage.` },
    ],
    answer: t`$L = ${matTeX(CL.map((r) => r.map((x) => Math.round(x))))}$, $\det C = 144\ \text{m}^6$; positive definiteness bounds every $\lvert l_{ij}\rvert$ by $\sqrt{c_{ii}}$, so no pivoting is needed.`,
  },
  practice: [
    num({
      id: 'chol-entry', difficulty: 2,
      gen(r) {
        const Lm = [[r.int(1, 3), 0, 0], [r.int(-2, 3), r.int(1, 3), 0], [r.intExcept(-2, 2, [0]), r.int(-2, 2), r.int(1, 3)]];
        const A = mm(Lm, T(Lm)), [i, j] = r.pick([[1, 1], [2, 1], [2, 2]]), ans = Lm[i][j];
        return {
          prompt: t`$A = ${matTeX(A)}$ is symmetric positive definite. In its Cholesky factor $A = LL^{\mathsf T}$, what is $l_{${i + 1}${j + 1}}$?`,
          visual: { type: 'la-rowreduce', params: { M: A, aug: false, stepper: false, step: 0, picture: 'none', readout: false }, caption: 'The matrix to factor. Cholesky reads only its lower triangle.' },
          answer: ans, tol: { rel: 1e-6, abs: 1e-9 },
          errors: (i === j ? [{ value: Math.sqrt(A[i][i]), feedback: 'Subtract the squares of the entries already in that row before taking the square root.' }] : [{ value: A[i][j] / Lm[j][j], feedback: 'Subtract the products of the entries already found before dividing by the pivot.' }]).filter((e) => Math.abs(e.value - ans) > 1e-6),
          hints: [t`Column 1: $l_{11} = \sqrt{a_{11}}$, $l_{i1} = a_{i1}/l_{11}$.`, t`Then $l_{22} = \sqrt{a_{22} - l_{21}^2}$ and $l_{32} = (a_{32} - l_{31}l_{21})/l_{22}$.`],
          teach: 'Cholesky fills L a column at a time: a square root on the diagonal, then divisions below it, each after subtracting what earlier columns already account for.',
          explain: t`$L = ${matTeX(Lm)}$, so $l_{${i + 1}${j + 1}} = ${ans}$. Multiplying $LL^{\mathsf T}$ gives back $A$.`,
        };
      },
    }),
    mcq({
      id: 'spd-test', difficulty: 2,
      prompt: t`\`np.linalg.cholesky\` raises \`LinAlgError: Matrix is not positive definite\` on $\begin{pmatrix}1 & 2\\ 2 & 1\end{pmatrix}$. What has it found?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3.25], y: [-1.3, 3.3], aspect: 'wide', axesAt: 'edge', xlabel: 'direction θ of the unit vector x (rad)', ylabel: 'xᵀAx',
          curves: [{ fn: '1 + 2*sin(2x)', color: 'accent', width: 2.2, domain: [0, Math.PI] }],
          hlines: [{ y: 0, color: 'ink4' }],
          shade: [{ fn: 'min(0, 1 + 2*sin(2x))', from: 0, to: Math.PI, color: 'bad', alpha: 0.35 }] },
        caption: 'The quadratic form xᵀAx for unit vectors x = (cos θ, sin θ): it goes negative (red) for directions near θ = 3π/4.',
      },
      choices: [
        t`At the second step $l_{22}^2 = 1 - 2^2 = -3 < 0$: some $x$ has $x^{\mathsf T}Ax < 0$, so $A$ is not positive definite — the factorization doubles as the cheapest test`,
        'The matrix is singular',
        'The matrix needs pivoting first; with rows swapped Cholesky would succeed',
        'Rounding error made a small positive pivot negative',
      ],
      answer: 0,
      why: {
        1: 'Its determinant is 1 − 4 = −3, not 0. It is indefinite: eigenvalues 3 and −1.',
        2: 'A row swap destroys the symmetry Cholesky relies on, and no reordering makes an indefinite matrix definite.',
        3: 'The arithmetic is exact here; −3 is far from round-off. (Round-off can do this for a nearly semidefinite matrix — see the checkpoint.)',
      },
      hints: [t`Compute $l_{11}$, $l_{21}$, then $a_{22} - l_{21}^2$.`, t`Try $x = (1, -1)$ in $x^{\mathsf T}Ax$.`],
      teach: 'A matrix is SPD exactly when Cholesky succeeds: a negative (or zero) pivot proves that some direction has xᵀAx ≤ 0.',
      explain: t`$l_{11} = 1$, $l_{21} = 2$, $l_{22}^2 = 1 - 4 = -3$. Indeed $x = (1, -1)$ gives $x^{\mathsf T}Ax = 1 - 4 + 1 = -2$. Attempting Cholesky costs $\tfrac13n^3$ — cheaper than computing eigenvalues — and is how libraries test definiteness.`,
    }),
    num({
      id: 'chol-time', difficulty: 1,
      gen(r) {
        const tl = r.pick([0.8, 1.2, 2.4, 3.6]), n = r.pick([3000, 5000, 8000]), ans = tl / 2;
        return {
          prompt: t`A dense $${n}\times${n}$ stiffness matrix takes $${tl}$ s to factor by LU with partial pivoting. Counting flops, about how long should a Cholesky factorization of the same (SPD) matrix take?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3.2], y: [0, 0.8], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'flops / n³', xticks: 0,
              shade: [{ fn: n12(2 / 3), from: 0.3, to: 1.3, color: 'warn', alpha: 0.55 }, { fn: n12(1 / 3), from: 1.9, to: 2.9, color: 'accent', alpha: 0.55 }],
              points: [{ x: 0.8, y: n12(2 / 3), r: 0, label: 'LU', labelAlign: 'center', labelDx: 0, labelDy: -12 }, { x: 2.4, y: n12(1 / 3), r: 0, label: 'Cholesky', labelAlign: 'center', labelDx: 0, labelDy: -12 }] },
            caption: 'Leading flop counts: ⅔n³ for LU, ⅓n³ for Cholesky. Real timings also depend on memory traffic and threading.',
          },
          answer: ans, units: 's', tol: { rel: 0.03 },
          errors: [{ value: tl / 4, feedback: 'Symmetry halves the work; it does not quarter it.' }],
          hints: ['Cholesky works on one triangle only.', 'n³/3 against 2n³/3.'],
          teach: 'Cholesky does half of LU’s arithmetic because it computes and stores only one triangular factor.',
          explain: t`$\tfrac13n^3/\tfrac23n^3 = \tfrac12$, so about $${ans}$ s. In practice the ratio is often close to 2 as well, and Cholesky needs no pivot search.`,
        };
      },
    }),
    num({
      id: 'householder-v', difficulty: 2,
      gen(r) {
        const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25]]);
        const a1 = r.sign() * p, a2 = r.sign() * q, ans = a1 + Math.sign(a1) * h;
        return {
          prompt: t`A Householder reflection sends $a = (${a1}, ${a2})$ onto the first axis using $v = a + \operatorname{sign}(a_1)\lVert a\rVert e_1$. What is $v_1$, the first component of $v$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.4 * h, 1.4 * h], y: [-0.9 * h, 0.9 * h], aspect: 'wide', equal: true, axesAt: 'center', xlabel: '', ylabel: '',
              arrows: [{ from: [0, 0], to: [a1, a2], color: 'accent', width: 2.4, label: 'a', labelDx: 6, labelDy: -6 }],
              curves: [{ param: [`${h}*cos(t)`, `${h}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', dash: true, width: 1.2 }] },
            caption: 'The vector a and the circle of radius ‖a‖: its image under the reflection lies where the circle meets the horizontal axis.',
          },
          answer: ans, tol: { rel: 1e-6 },
          errors: [{ value: a1 - Math.sign(a1) * h, feedback: 'That is the other sign, a − sign(a₁)‖a‖e₁: it subtracts nearly equal numbers when a is close to the axis.' }],
          hints: [t`$\lVert a\rVert = \sqrt{${a1 * a1} + ${a2 * a2}} = ${h}$.`, t`$v_1 = a_1 + \operatorname{sign}(a_1)\cdot${h}$.`],
          teach: 'The sign in v = a + sign(a₁)‖a‖e₁ makes the two terms add, never cancel.',
          explain: t`$v = (${ans}, ${a2})$, and $Ha = ${-Math.sign(a1) * h}e_1$. Its first component adds two numbers of the same sign, so no digits are lost however close $a$ is to the axis.`,
        };
      },
    }),
    mcq({
      id: 'why-orthogonal', difficulty: 2,
      prompt: t`QR by Householder costs about twice as many flops as LU for a square system. Why is it the method of choice for least squares and the eigenvalue algorithm all the same?`,
      visual: {
        type: 'la-map2d',
        params: { A: [[0.6, -0.8], [0.8, 0.6]], shape: 'circle', readout: false },
        caption: 'An orthogonal matrix (here a rotation) maps the unit circle to itself: no direction is stretched, so no error is magnified.',
      },
      choices: [
        t`Orthogonal transformations preserve 2-norms, so each step leaves the errors already made the same size and $\kappa(R) = \kappa(A)$: no growth factor, no pivoting, backward stability guaranteed`,
        'QR is exact in floating point because Q is orthogonal',
        'Householder QR needs fewer flops than LU for rectangular matrices',
        'Q can be inverted without arithmetic, which makes QR faster in practice',
      ],
      answer: 0,
      why: {
        1: 'Every step rounds, as in LU. The point is that orthogonal steps do not amplify those rounding errors.',
        2: 'For an m × n matrix QR costs about 2mn² − ⅔n³, more than an LU-based route; its advantage is accuracy.',
        3: 'Qᵀ is the inverse, true — but that is not where QR’s advantage lies; Q is rarely even formed.',
      },
      hints: ['What does ‖Qx‖ = ‖x‖ mean for an error vector carried through a step?', 'Compare with the growth factor ρ of LU.'],
      teach: 'Orthogonal transformations have condition number 1: a sequence of them cannot magnify errors, which makes Householder QR backward stable without pivoting.',
      explain: t`Each Householder step maps the computed matrix by an orthogonal $H$, so $\lVert H\,\delta\rVert = \lVert\delta\rVert$: errors from earlier steps are passed on, never amplified. That is why QR is used for least squares ([F8.1](#/lesson/st-f.F8.1)), where it avoids squaring $\kappa$, and for eigenvalues ([F7.2](#/lesson/st-f.F7.2)), where similarity transforms must not distort the spectrum.`,
    }),
    code({
      id: 'gs-loss', difficulty: 3,
      prompt: t`Measure how orthogonal $Q$ really is. For the $30\times12$ matrix of monomials $A_{ij} = t_i^{\,j}$ ($t$ = 30 equally spaced points of $[0, 1]$, $j = 0 \ldots 11$), compute $\lVert Q^{\mathsf T}Q - I\rVert$ (largest entry in absolute value) for three $Q$: **classical** Gram–Schmidt (project the original column $a_j$ on each $q_i$), **modified** Gram–Schmidt (project the partly reduced column $v$), and \`np.linalg.qr\` (Householder). Store them as \`loss_cgs\`, \`loss_mgs\`, \`loss_hh\`.`,
      starter: t`import numpy as np

t = np.linspace(0, 1, 30)
A = np.vander(t, 12, increasing=True)

def gram_schmidt(A, modified):
    m, n = A.shape
    Q = np.zeros((m, n))
    for j in range(n):
        v = A[:, j].copy()
        for i in range(j):
            # classical: coefficient from A[:, j]; modified: from the current v
            pass
        Q[:, j] = v / np.linalg.norm(v)
    return Q

def loss(Q):
    return np.abs(Q.T @ Q - np.eye(Q.shape[1])).max()

loss_cgs = loss(gram_schmidt(A, False))
loss_mgs = loss(gram_schmidt(A, True))
loss_hh = 0.0
print(np.linalg.cond(A), loss_cgs, loss_mgs, loss_hh)
`,
      answer: t`import numpy as np

t = np.linspace(0, 1, 30)
A = np.vander(t, 12, increasing=True)

def gram_schmidt(A, modified):
    m, n = A.shape
    Q = np.zeros((m, n))
    for j in range(n):
        v = A[:, j].copy()
        for i in range(j):
            r = Q[:, i] @ (v if modified else A[:, j])
            v = v - r * Q[:, i]
        Q[:, j] = v / np.linalg.norm(v)
    return Q

def loss(Q):
    return np.abs(Q.T @ Q - np.eye(Q.shape[1])).max()

loss_cgs = loss(gram_schmidt(A, False))
loss_mgs = loss(gram_schmidt(A, True))
loss_hh = loss(np.linalg.qr(A)[0])
print(np.linalg.cond(A), loss_cgs, loss_mgs, loss_hh)`,
      tests: [
        { name: 'classical Gram–Schmidt has lost orthogonality almost completely (loss above 0.01)', code: 'loss_cgs > 1e-2' },
        { name: t`modified Gram–Schmidt keeps it to about $\kappa u$ (loss below $10^{-6}$)`, code: '1e-13 < loss_mgs < 1e-6' },
        { name: t`Householder keeps it to round-off (loss below $10^{-13}$)`, code: '0 < loss_hh < 1e-13' },
      ],
      hints: ['Inside the loop: r = Q[:, i] @ (v if modified else A[:, j]); then v = v − r Q[:, i].', 'loss_hh = loss(np.linalg.qr(A)[0]).'],
      teach: 'In floating point, classical Gram–Schmidt loses orthogonality like κ²u, modified like κu, and Householder stays at u whatever κ is.',
      explain: t`With $\kappa(A) \approx ${tex(OL[2].k, 2)}$ the three losses are about $${tex(OL[2].cgs, 1)}$, $${tex(OL[2].mgs, 1)}$ and $${tex(OL[2].hh, 1)}$ (computed here in JavaScript; NumPy’s differ in detail, not in size). For 6 columns, $\kappa \approx ${tex(OL[0].k, 2)}$, they are $${tex(OL[0].cgs, 1)}$, $${tex(OL[0].mgs, 1)}$, $${tex(OL[0].hh, 1)}$. Each new column is a small difference of large, nearly parallel vectors, and Gram–Schmidt’s projections inherit their rounding; Householder never subtracts projections.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-kalman', difficulty: 3, transfer: true,
      prompt: t`After hours of tracking, a spacecraft navigation filter updating its covariance as $P \leftarrow P - KHP$ crashes: \`cholesky(P)\` (used to draw sample trajectories) reports $P$ is not positive definite. The physics guarantees a covariance is positive definite. What happened, and what do flight filters do about it?`,
      visual: {
        type: 'graph',
        params: { x: [-3.2, 3.2], y: [-2, 2], aspect: 'wide', equal: true, axesAt: 'center', xlabel: '', ylabel: '',
          curves: [{ param: ['2.6*cos(t)', '0.05*sin(t)'], t: [0, 2 * Math.PI], color: 'accent', width: 2 }, { param: ['2.6*cos(t)', '1.2*sin(t)'], t: [0, 2 * Math.PI], color: 'ink4', width: 1.4, dash: true }] },
        caption: 'Schematic: a covariance ellipse squeezed to a sliver by accurate measurements in one direction (solid) — from the dashed one. Its tiny axis is a nearly zero eigenvalue that rounding can push negative.',
      },
      choices: [
        'Accurate measurements shrank one eigenvalue of P towards zero, and the subtraction P − KHP rounded it negative; flight filters carry a Cholesky (square-root) factor of P instead, which keeps P = SSᵀ positive by construction',
        'The spacecraft’s dynamics became unstable, which makes covariances indefinite',
        'Cholesky needs pivoting for covariance matrices',
        'P became too large; rescaling the units would fix it',
      ],
      answer: 0,
      why: {
        1: 'Unstable dynamics make a covariance grow, not lose definiteness; any SSᵀ is positive semidefinite.',
        2: 'Cholesky never needs pivoting on an SPD matrix; the matrix itself stopped being SPD numerically.',
        3: 'Rescaling changes no sign: a negative eigenvalue stays negative in any units.',
      },
      hints: ['What is the smallest eigenvalue of a covariance after a very precise measurement?', 'P − KHP subtracts two nearly equal matrices in the measured direction: cancellation.'],
      teach: 'A Cholesky failure on a matrix that “must” be SPD is a numerical diagnosis: the matrix drifted across zero; propagate its Cholesky factor instead.',
      explain: t`The update subtracts nearly equal quantities in the well-measured direction, and round-off of size $u\lVert P\rVert$ swamps an eigenvalue smaller than that. Square-root filters (Potter’s, used for Apollo’s navigation, and modern UD and Cholesky forms) update a factor $S$ with $P = SS^{\mathsf T}$, which cannot go indefinite and carries the covariance with about twice the precision. The Joseph form of the update is a cheaper partial remedy.`,
    }),
    num({
      id: 'cp-dispersions', difficulty: 3, transfer: true,
      gen(r) {
        const s1 = r.pick([20, 30, 40]), s2 = r.pick([0.05, 0.1, 0.2]), rho = r.pick([0.6, -0.7, 0.8, -0.5]);
        const ans = s2 * Math.sqrt(1 - rho * rho);
        return {
          prompt: t`A Monte Carlo study of atmospheric entry draws correlated errors in entry speed ($\sigma_v = ${s1}$ m/s) and flight-path angle ($\sigma_\gamma = ${s2}^\circ$) with correlation $${rho}$, as $x = Lz$ where $z$ holds independent standard normals and $LL^{\mathsf T}$ is the covariance $\begin{pmatrix}\sigma_v^2 & \rho\sigma_v\sigma_\gamma\\ \rho\sigma_v\sigma_\gamma & \sigma_\gamma^2\end{pmatrix}$. What is $l_{22}$, in degrees?`,
          visual: {
            type: 'graph',
            params: { x: [-3.4, 3.4], y: [-3.4, 3.4], aspect: 'wide', axesAt: 'center', xlabel: 'speed error / σv', ylabel: 'angle error / σγ',
              curves: [{ param: ['2*cos(t)', `2*(${rho}*cos(t) + ${n12(Math.sqrt(1 - rho * rho))}*sin(t))`], t: [0, 2 * Math.PI], color: 'accent', width: 2 }] },
            caption: 'The two-sigma ellipse of the correlated errors, in units of each standard deviation: correlation tilts and thins it.',
          },
          answer: ans, units: '°', tol: { rel: 0.005 },
          errors: [{ value: s2, feedback: 'That ignores the correlation: l₂₂ = √(σγ² − l₂₁²), and l₂₁ = ρσγ.' }, { value: s2 * (1 - rho * rho), feedback: 'Take the square root: l₂₂ = σγ√(1 − ρ²).' }],
          hints: [t`$l_{11} = \sigma_v$ and $l_{21} = \rho\sigma_v\sigma_\gamma/l_{11} = \rho\sigma_\gamma$.`, t`$l_{22} = \sqrt{\sigma_\gamma^2 - l_{21}^2} = \sigma_\gamma\sqrt{1 - \rho^2}$.`],
          teach: 'Cholesky turns independent standard normals into correlated ones: the first row of L sets the shared part, the diagonal the independent remainder.',
          explain: t`$l_{21} = ${rho}\times${s2} = ${(rho * s2).toFixed(3)}^\circ$ and $l_{22} = ${s2}\sqrt{1 - ${rho * rho}} = ${ans.toFixed(4)}^\circ$. So $\gamma$-error $= ${(rho * s2).toFixed(3)}z_1 + ${ans.toFixed(4)}z_2$ (in degrees): part of it moves with the speed error, the rest is independent. This is how dispersion tools generate correlated inputs.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Trefethen & Bau (1997), Numerical Linear Algebra, SIAM, Lectures 7–10 and 23 (QR, Gram–Schmidt, Householder, Cholesky)', url: 'https://doi.org/10.1137/1.9780898719574' },
    { label: 'Higham (2002), Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, chs. 10 and 19', url: 'https://doi.org/10.1137/1.9780898718027' },
    { label: 'Kalman filter: square-root forms (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kalman_filter' },
  ],
});
