// The QR algorithm — factor A = QR, multiply back in the other order, repeat:
// each step is a similarity transform, the subdiagonal drains at the
// eigenvalue ratios (power iteration in disguise), and a shift drawn from the
// matrix itself (Rayleigh, Wilkinson) turns linear convergence into cubic for
// symmetric matrices. Deflation, the Hessenberg/tridiagonal first step, the
// stuck case [[0, 1], [1, 0]], real Schur 2 × 2 blocks for complex pairs.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { qrIterate, qrHouseholder, mm } from './_lin.js';
import { eigSym } from '../prog/_solvers.js';

const t = String.raw;

// ── the Explore: a symmetric tridiagonal 4 × 4 under three shift strategies ──
const A4 = [[4, 1, 0, 0], [1, 3, 1, 0], [0, 1, 2, 1], [0, 0, 1, 1]];
const W4 = eigSym(A4).w;
const NIT = 20;
const SHIFTS = [[1, 'none', 'no shift'], [2, 'rayleigh', 'Rayleigh shift'], [3, 'wilkinson', 'Wilkinson shift']];
const HIST = SHIFTS.map(([, s]) => qrIterate(A4, NIT, s));
const SUB = [[1, 0, 'accent', '|a₂₁|'], [2, 1, 'violet', '|a₃₂|'], [3, 2, 'gold', '|a₄₃|']];
const floorLg = (v) => Math.max(-16.4, lg(Math.abs(v) + 1e-300));
const selK = (f) => SHIFTS.flatMap(([sk], i) => HIST[i].map((M, k) => `step(0.5 - abs(sh - ${sk}))*step(0.5 - abs(k - ${k}))*(${n12(f(M))})`)).join(' + ');

// ── the worked example: [[2, 1], [1, 3]] with the Rayleigh shift ──
const H2 = qrIterate([[2, 1], [1, 3]], 3, 'rayleigh');
const L2 = [(5 - Math.sqrt(5)) / 2, (5 + Math.sqrt(5)) / 2];

/** QR iterations with deflation (as the code exercise writes them): the eigenvalues and the step count. */
function qrEigs(A0, shift, tol = 1e-12) {
  const A = A0.map((r) => [...r]);
  let n = A.length, its = 0;
  while (n > 1) {
    while (Math.abs(A[n - 1][n - 2]) > tol * (Math.abs(A[n - 1][n - 1]) + Math.abs(A[n - 2][n - 2])) && its < 100000) {
      const mu = shift ? A[n - 1][n - 1] : 0;
      const { Q, R } = qrHouseholder(A.slice(0, n).map((r, i) => r.slice(0, n).map((x, j) => x - (i === j ? mu : 0))));
      const B = mm(R, Q);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) A[i][j] = B[i][j] + (i === j ? mu : 0);
      its++;
    }
    n--;
  }
  return its;
}
const ITS_SHIFT = qrEigs(A4, true), ITS_NONE = qrEigs(A4, false);

// the 2 × 2 Rayleigh-shift map b → b³/((a − c)² + b²)
const rqMap = (a, c, b) => b ** 3 / ((a - c) ** 2 + b * b);

const matTeX = (M) => t`\begin{pmatrix}${M.map((r) => r.join(' & ')).join(t` \\ `)}\end{pmatrix}`;
const fx = (M, d = 4) => M.map((r) => r.map((x) => +x.toFixed(d)));

export default lesson({
  id: 'st-f.F7.2',
  title: 'The QR algorithm',
  minutes: 14, difficulty: 4,
  intro: t`Power iteration finds one eigenvector. The **QR algorithm** finds them all, by an almost absurdly simple recipe: factor, then multiply the factors back in the reverse order.

$$A_k - \mu_kI = Q_kR_k, \qquad A_{k+1} = R_kQ_k + \mu_kI = Q_k^{\mathsf T}A_kQ_k$$

Each step is a **similarity transform**, so the eigenvalues never change, while the matrix drifts towards triangular (diagonal, if symmetric) with the eigenvalues appearing on the diagonal. With $\mu_k = 0$ it is power iteration run on a whole basis at once: the entry below the diagonal in row $i + 1$ shrinks like $\lvert\lambda_{i+1}/\lambda_i\rvert^k$. With a **shift** $\mu_k$ close to an eigenvalue — read off the bottom corner of the matrix itself — the last off-diagonal entry collapses at a cubic rate for symmetric matrices; then the last row is **deflated** and the algorithm moves up. Every call to \`np.linalg.eig\` and \`eigh\` runs a descendant of this, on a matrix first reduced to Hessenberg (tridiagonal) form.`,
  symbols: [
    { tex: 'A_k', text: 'the $k$-th iterate, similar to $A$: same eigenvalues, ever closer to triangular' },
    { tex: 'Q_k,\\ R_k', text: 'the QR factors of the shifted iterate ([F6.2](#/lesson/st-f.F6.2)): $Q_k$ orthogonal, $R_k$ upper-triangular' },
    { tex: t`\mu_k`, text: 'the **shift**: 0 for the basic algorithm; the last diagonal entry (Rayleigh shift) or the eigenvalue of the bottom $2\\times2$ block nearer to it (Wilkinson shift)' },
    { tex: t`Q_k^{\mathsf T}A_kQ_k`, text: 'why the eigenvalues survive: $R_k = Q_k^{\\mathsf T}(A_k - \\mu_kI)$, so $R_kQ_k + \\mu_kI = Q_k^{\\mathsf T}A_kQ_k$' },
  ],
  why: 'The shifted QR algorithm (Francis and Kublanovskaya, 1961) is how every modal analysis, stability study and quantum-chemistry code gets its eigenvalues — one of the top ten algorithms of the twentieth century, and a direct heir of power iteration.',
  visual: {
    type: 'graph',
    title: 'Draining the subdiagonal',
    lead: t`The symmetric tridiagonal matrix $${matTeX(A4)}$ under QR steps. Each colour is one subdiagonal entry, on a logarithmic axis. Choose a shift strategy, and slide $k$ to read the diagonal at that step.`,
    tasks: [
      'With no shift, every entry falls in a straight line: |a₄₃| by λ₄/λ₃ ≈ 0.14 per step, |a₂₁| by λ₂/λ₁ ≈ 0.67 — power iteration’s rates.',
      'Switch to the Rayleigh shift: |a₄₃| drops off a cliff — cubic convergence — and the bottom-right entry is an eigenvalue to 16 digits within a few steps.',
      'The Wilkinson shift is faster still at the start. Note that the other entries do not speed up: a real code now deflates the last row and shifts on the 3 × 3 that remains.',
    ],
    params: {
      x: [-0.6, NIT + 0.6], y: [-16.6, 0.8], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'QR step k', ylabel: 'subdiagonal entry',
      choices: [{ key: 'sh', label: 'Shift', options: SHIFTS.map(([k, , l]) => [k, l]), value: 1, explain: 'Where μ comes from: nothing, the last diagonal entry, or the bottom 2 × 2 block’s nearer eigenvalue.' }],
      sliders: [{ key: 'k', label: 'Step $k$', min: 0, max: NIT, step: 1, value: 0, explain: 'The iterate whose diagonal the readouts show.' }],
      points: SHIFTS.flatMap(([sk], i) => SUB.flatMap(([, j, color]) => HIST[i].map((M, k) => ({ x: k, y: n12(floorLg(M[j + 1][j])), r: 3.2, color, when: `step(0.5 - abs(sh - ${sk}))` })))),
      vlines: [{ x: 'k', color: 'ink4' }],
      legend: SUB.map(([, , color, label]) => ({ label, color, point: true })), legendAt: 'tr',
      readouts: [0, 1, 2, 3].map((d) => ({ label: `a${'₁₂₃₄'[d]}${'₁₂₃₄'[d]}`, expr: selK((M) => M[d][d]), digits: 8 })),
    },
    caption: `QR steps computed in float64 with Householder QR, no deflation. Entries below 10⁻¹⁶ are drawn at the floor. True eigenvalues: ${W4.map((v) => v.toFixed(6)).join(', ')}.`,
  },
  example: {
    prompt: t`Run the QR algorithm with the Rayleigh shift $\mu = a_{22}$ on $A = ${matTeX([[2, 1], [1, 3]])}$, whose eigenvalues are $\tfrac{5 \mp \sqrt5}{2}$. How fast does the off-diagonal entry vanish?`,
    visual: {
      type: 'graph',
      params: { x: [-0.3, 3.3], y: [-6, 0.4], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step', ylabel: '|off-diagonal|', xticks: 4,
        points: H2.map((M, k) => ({ x: k, y: n12(lg(Math.abs(M[1][0]))), r: 5, color: 'accent', label: k ? `${+Math.abs(M[1][0]).toPrecision(2)}` : '1', labelDx: 8, labelDy: -8 })) },
      caption: 'The off-diagonal entry after each shifted QR step (log axis): 1, then 1/2, 1/34, 5 × 10⁻⁶.',
    },
    steps: [
      { label: 'Shift', text: t`$\mu = a_{22} = 3$, so factor $A - 3I = ${matTeX([[-1, 1], [1, 0]])}$.` },
      { label: 'Factor', text: t`Gram–Schmidt on the columns: $q_1 = \tfrac{1}{\sqrt2}(-1, 1)$, $r_{11} = \sqrt2$, $r_{12} = q_1\cdot(1, 0) = -\tfrac{1}{\sqrt2}$; then $(1, 0) + \tfrac{1}{\sqrt2}q_1 = (\tfrac12, \tfrac12)$, so $q_2 = \tfrac{1}{\sqrt2}(1, 1)$ and $r_{22} = \tfrac{1}{\sqrt2}$.` },
      { label: 'Reverse and unshift', text: t`$RQ = ${matTeX([[t`-\tfrac32`, t`\tfrac12`], [t`\tfrac12`, t`\tfrac12`]])}$, and adding $3I$ gives $A_1 = ${matTeX([[t`\tfrac32`, t`\tfrac12`], [t`\tfrac12`, t`\tfrac72`]])}$: still symmetric, trace 5 and determinant 5 as before — the same eigenvalues — and the off-diagonal entry has halved.` },
      { label: 'Again', text: t`With $\mu = \tfrac72$ the next step gives an off-diagonal entry of $\tfrac{1}{34} = ${(1 / 34).toFixed(5)}$, then $${tex(Math.abs(H2[3][1][0]), 2)}$. For a symmetric $2\times2$ with $\mu = c$, one step maps $b \mapsto \dfrac{b^3}{(a - c)^2 + b^2}$: **cubic** convergence.` },
      { label: 'Read the eigenvalues', text: t`After three steps the diagonal is $${H2[3][0][0].toFixed(6)}$ and $${H2[3][1][1].toFixed(6)}$, against $\tfrac{5 \mp \sqrt5}{2} = ${L2[0].toFixed(6)}, ${L2[1].toFixed(6)}$. Unshifted, the entry would shrink only by $\lambda_1/\lambda_2 = ${(L2[0] / L2[1]).toFixed(3)}$ per step.` },
    ],
    answer: t`Off-diagonal $1 \to \tfrac12 \to \tfrac{1}{34} \to ${tex(Math.abs(H2[3][1][0]), 2)}$: cubic convergence, eigenvalues $${L2[0].toFixed(6)}$ and $${L2[1].toFixed(6)}$ on the diagonal.`,
  },
  practice: [
    mcq({
      id: 'similarity', difficulty: 2,
      prompt: t`Why does $A_{k+1} = R_kQ_k$ have the same eigenvalues as $A_k = Q_kR_k$?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 5.5], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'eigenvalue', ylabel: '', yticks: 0,
          points: W4.map((w) => ({ x: n12(w), y: 0, r: 6, color: 'accent' })) },
        caption: 'The eigenvalues of the Explore matrix: every QR iterate has exactly these.',
      },
      choices: [
        t`$R_k = Q_k^{\mathsf T}A_k$, so $R_kQ_k = Q_k^{\mathsf T}A_kQ_k$: a similarity transform by an orthogonal matrix`,
        'Because R and Q commute',
        'Because the determinant and trace are preserved, which fixes all the eigenvalues',
        'Because Q has eigenvalues of size 1',
      ],
      answer: 0,
      why: {
        1: 'They do not commute in general — if they did, A would never change.',
        2: 'For a 2 × 2 that would be enough, but for larger matrices trace and determinant leave the other eigenvalues free.',
        3: 'True of orthogonal matrices, but it does not explain why the product RQ keeps A’s eigenvalues.',
      },
      hints: ['Solve A = QR for R.', 'Substitute into RQ.'],
      teach: 'Each QR step is a similarity transform A → QᵀAQ with Q orthogonal, so it moves the matrix without changing its eigenvalues — and without amplifying errors.',
      explain: t`$R = Q^{\mathsf T}A$, so $RQ = Q^{\mathsf T}AQ$. Similar matrices share eigenvalues: if $Av = \lambda v$ then $(Q^{\mathsf T}AQ)(Q^{\mathsf T}v) = \lambda Q^{\mathsf T}v$. Because $Q$ is orthogonal, the transformation is perfectly conditioned, which is why the algorithm is backward stable.`,
    }),
    num({
      id: 'unshifted-decay', difficulty: 2,
      gen(r) {
        const [la, lb] = r.pick([[2, 1], [5, 3], [4, 1], [9, 6]]), k = r.int(5, 12), b0 = r.pick([0.5, 1, 2]);
        const ans = b0 * (lb / la) ** k;
        return {
          prompt: t`An unshifted QR algorithm runs on a symmetric matrix whose two smallest eigenvalues are $${la}$ and $${lb}$ (the rest are larger). The last subdiagonal entry starts near $${b0}$ and shrinks by the ratio of those two eigenvalues per step. Estimate its size after $${k}$ steps.`,
          visual: {
            type: 'graph',
            params: { x: [-0.5, k + 1.5], y: [lg(ans) - 1.5, lg(b0) + 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step', ylabel: '|aₙ,ₙ₋₁|',
              curves: [{ fn: `${n12(lg(b0))} + x*${n12(lg(lb / la))}`, color: 'accent', width: 2, dash: true, domain: [0, k + 1] }],
              points: [{ x: 0, y: n12(lg(b0)), r: 5, color: 'accent' }], vlines: [{ x: k, color: 'gold' }] },
            caption: 'Linear convergence: a straight line on a log axis.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: b0 * (la / lb) ** k, feedback: 'The ratio is the smaller eigenvalue over the larger, which is below 1.' }, { value: b0 * (lb / la) ** (2 * k), feedback: 'The entry shrinks at the ratio itself; only Rayleigh-quotient quantities converge at its square.' }],
          hints: [t`Factor per step: $${lb}/${la}$.`, t`$${b0}\times(${lb}/${la})^{${k}}$.`],
          teach: 'Unshifted QR is power iteration on all the eigenvectors at once: the entry between eigenvalues λᵢ and λᵢ₊₁ shrinks like |λᵢ₊₁/λᵢ|ᵏ.',
          explain: t`$${b0}\times(${lb}/${la})^{${k}} = ${tex(ans, 3)}$. A ratio near 1 makes this hopeless, which is why practical codes always shift.`,
        };
      },
    }),
    num({
      id: 'cubic-step', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 5]), c = a + r.pick([1, 2, 3]), b = r.pick([0.4, 0.2, 0.1]);
        const b1 = rqMap(a, c, b), ans = b1;
        return {
          prompt: t`For a symmetric $2\times2$ matrix $\begin{pmatrix}a & b\\ b & c\end{pmatrix}$, one QR step with the Rayleigh shift $\mu = c$ replaces $b$ by $b' = \dfrac{b^3}{(a - c)^2 + b^2}$. With $a = ${a}$, $c = ${c}$ and $b = ${b}$, what is $b'$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, 2.3], y: [Math.floor(lg(rqMap(a, c, b1))) - 1, 0.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step', ylabel: '|b|', xticks: 3,
              points: [{ x: 0, y: n12(lg(b)), r: 5, color: 'accent', label: `b = ${b}`, labelDx: 8, labelDy: -8 }, { x: 1, y: n12(lg(b1)), r: 6, color: 'gold', hollow: true, label: 'b′ = ?', labelDx: 8, labelDy: -8 }] },
            caption: 'The off-diagonal entry before and after one shifted step (log axis); where it lands is the question.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: b ** 3, feedback: t`Divide by $(a - c)^2 + b^2$, the squared distance between the diagonal entries (plus $b^2$).` }, { value: (b * b) / ((a - c) ** 2 + b * b), feedback: 'The numerator is b³, not b².' }],
          hints: [t`$(a - c)^2 + b^2 = ${(a - c) ** 2} + ${b * b}$.`, t`$b' = ${b}^3/${(a - c) ** 2 + b * b}$.`],
          teach: 'With the Rayleigh shift the off-diagonal entry of a symmetric matrix is cubed (divided by the squared eigenvalue gap) at every step.',
          explain: t`$b' = ${tex(b ** 3, 3)}/${+((a - c) ** 2 + b * b).toFixed(4)} = ${tex(ans, 3)}$. Another step (the diagonal barely moves) would give about $${tex(rqMap(a, c, b1), 2)}$: the number of correct digits triples each time. Unshifted, the factor per step would be about $${(a / c).toFixed(2)}$.`,
        };
      },
    }),
    mcq({
      id: 'stuck', difficulty: 3,
      prompt: t`The unshifted QR algorithm on $A = \begin{pmatrix}0 & 1\\ 1 & 0\end{pmatrix}$ returns $A$ unchanged at every step. Why, and what fixes it?`,
      visual: {
        type: 'la-map2d',
        params: { A: [[0, 1], [1, 0]], shape: 'F', eigen: true, readout: false, view: 2.5 },
        caption: 'A reflection across the diagonal: eigenvalues +1 and −1, equal in size.',
      },
      choices: [
        t`Its eigenvalues $\pm1$ have equal modulus, so the “power iteration” inside QR cannot separate them ($A = Q\cdot I$, $RQ = A$). A shift breaks the tie: the Wilkinson shift picks $\pm1$ itself and converges in one step`,
        'A is singular, so its QR factorization does not exist',
        'A is already diagonal in a different basis, so QR stops',
        'Rounding errors cancel exactly at each step',
      ],
      answer: 0,
      why: {
        1: 'det A = −1: it is invertible, and A = QR with Q = A, R = I.',
        2: 'Every symmetric matrix is diagonal in its eigenbasis; that is the goal, not a reason to stop.',
        3: 'There is no rounding at all: Q = A and R = I exactly.',
      },
      hints: ['Factor A: it is already orthogonal, so Q = A and R = I.', 'Compare with power iteration on a matrix with eigenvalues ±λ (F7.1).'],
      teach: 'Unshifted QR inherits power iteration’s failure for eigenvalues of equal modulus; shifts make the moduli unequal.',
      explain: t`$A$ is orthogonal, so $Q = A$, $R = I$, and $RQ = A$. The Rayleigh shift is $\mu = a_{22} = 0$ — no help. The Wilkinson shift, the eigenvalue of the bottom $2\times2$ block closer to $a_{22}$, is $+1$ or $-1$ (a tie, broken by a convention) — exact either way — so $A - \mu I$ is singular and one step deflates. This is why LAPACK uses Wilkinson-type shifts (and “exceptional shifts” when progress stalls).`,
    }),
    mcq({
      id: 'hessenberg', difficulty: 2,
      prompt: t`Before iterating, practical codes reduce $A$ to **Hessenberg** form (zero below the first subdiagonal; tridiagonal if $A$ is symmetric) by Householder similarity transforms. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 12.5], y: [-0.5, 5.5], aspect: 'wide', equal: true, axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false,
          points: [
            ...Array.from({ length: 25 }, (_, q) => ({ x: q % 5, y: 4 - Math.floor(q / 5), r: 5, color: 'accent' })),
            ...Array.from({ length: 25 }, (_, q) => ({ i: Math.floor(q / 5), j: q % 5 })).filter(({ i, j }) => i <= j + 1).map(({ i, j }) => ({ x: 7 + j, y: 4 - i, r: 5, color: 'gold' })),
          ] },
        caption: 'Nonzero entries of a full 5 × 5 matrix (left) and of its Hessenberg form (right). A QR step preserves the Hessenberg shape.',
      },
      choices: [
        'A QR step on a Hessenberg matrix costs O(n²) instead of O(n³), and the result is Hessenberg again; the O(n³) reduction is paid once',
        'Hessenberg matrices have their eigenvalues on the diagonal',
        'It makes the matrix symmetric',
        'The QR algorithm does not converge on full matrices',
      ],
      answer: 0,
      why: {
        1: 'Only after the iteration converges; a Hessenberg matrix is still far from triangular.',
        2: 'The reduction is a similarity transform; it keeps symmetry if present but cannot create it.',
        3: 'It converges on full matrices too, just at O(n³) per step.',
      },
      hints: ['How many entries must be zeroed in each column of a Hessenberg matrix to make it triangular?', 'One Givens rotation per column suffices.'],
      teach: 'Reduce once to Hessenberg (or tridiagonal) form, then iterate cheaply: the structure survives every QR step.',
      explain: t`A Hessenberg matrix needs only $n - 1$ Givens rotations to triangularize: $O(n^2)$ work per step ($O(n)$ if tridiagonal), against $O(n^3)$ for a full matrix. With a few steps per eigenvalue, the whole algorithm costs about $10n^3$ flops for a general matrix — dominated by the one-off reduction. Modern codes also apply the shifts **implicitly**, never forming $A - \mu I$.`,
    }),
    code({
      id: 'qr-deflate', difficulty: 4,
      prompt: t`Write \`qr_eigs(A, shift)\` that runs QR steps (\`np.linalg.qr\`) on the leading $n\times n$ block, with $\mu = a_{nn}$ if \`shift\` is true and $\mu = 0$ otherwise, until $\lvert a_{n,n-1}\rvert \le 10^{-12}(\lvert a_{nn}\rvert + \lvert a_{n-1,n-1}\rvert)$; then record $a_{nn}$, **deflate** ($n \leftarrow n - 1$) and continue. Return the sorted eigenvalues and the total number of QR steps. Run it on the Explore’s matrix with and without the shift.`,
      starter: t`import numpy as np

A0 = np.array([[4.0, 1, 0, 0], [1, 3, 1, 0], [0, 1, 2, 1], [0, 0, 1, 1]])

def qr_eigs(A, shift, tol=1e-12):
    A = np.array(A, dtype=float)
    n = len(A)
    eigs, steps = [], 0
    while n > 1:
        # iterate on A[:n, :n] until the last subdiagonal entry is negligible
        eigs.append(A[n - 1, n - 1])
        n -= 1
    eigs.append(A[0, 0])
    return np.sort(eigs), steps

eig_s, steps_s = qr_eigs(A0, True)
eig_0, steps_0 = qr_eigs(A0, False)
print(eig_s, steps_s, steps_0)
`,
      answer: t`import numpy as np

A0 = np.array([[4.0, 1, 0, 0], [1, 3, 1, 0], [0, 1, 2, 1], [0, 0, 1, 1]])

def qr_eigs(A, shift, tol=1e-12):
    A = np.array(A, dtype=float)
    n = len(A)
    eigs, steps = [], 0
    while n > 1:
        while abs(A[n - 1, n - 2]) > tol * (abs(A[n - 1, n - 1]) + abs(A[n - 2, n - 2])):
            mu = A[n - 1, n - 1] if shift else 0.0
            Q, R = np.linalg.qr(A[:n, :n] - mu * np.eye(n))
            A[:n, :n] = R @ Q + mu * np.eye(n)
            steps += 1
        eigs.append(A[n - 1, n - 1])
        n -= 1
    eigs.append(A[0, 0])
    return np.sort(eigs), steps

eig_s, steps_s = qr_eigs(A0, True)
eig_0, steps_0 = qr_eigs(A0, False)
print(eig_s, steps_s, steps_0)`,
      tests: [
        { name: 'the shifted eigenvalues agree with eigvalsh to 10⁻¹⁰', code: 'np.allclose(eig_s, np.linalg.eigvalsh(A0), atol=1e-10)' },
        { name: 'so do the unshifted ones', code: 'np.allclose(eig_0, np.linalg.eigvalsh(A0), atol=1e-10)' },
        { name: 'shifting with deflation needs at most 15 steps, and at least four times fewer than no shift', code: 'steps_s <= 15 and 4 * steps_s <= steps_0' },
      ],
      hints: ['Inner loop: while abs(A[n−1, n−2]) > tol·(…): form A[:n, :n] − μI, factor it, and set A[:n, :n] = R @ Q + μI.', 'Count steps inside the inner loop; deflation is just n −= 1 after it.'],
      teach: 'Shift, converge the bottom entry cubically, deflate, repeat: about two or three steps per eigenvalue instead of dozens.',
      explain: t`The same procedure in this lesson’s JavaScript takes $${ITS_SHIFT}$ steps with the shift and $${ITS_NONE}$ without (NumPy’s counts can differ by a step or two). Without the shift, the slowest stage is set by the closest eigenvalue ratio, $${(W4[2] / W4[3]).toFixed(2)}$; with it, each eigenvalue costs two or three steps whatever the ratios.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-modes-unshifted', difficulty: 3, transfer: true,
      gen(r) {
        const f3 = r.pick([40, 55, 70]), f4 = r.pick([12, 20, 30]), tol = r.pick([8, 10]);
        const q = (f4 / f3) ** 2, ans = Math.ceil(tol / -lg(q));
        return {
          prompt: t`A modal analysis runs the **unshifted** QR algorithm on a satellite’s mass-normalized stiffness matrix, whose eigenvalues are $\omega^2$. Its two lowest natural frequencies are $${f4}$ Hz and $${f3}$ Hz. About how many steps shrink the last subdiagonal entry by a factor $10^{${tol}}$, so the lowest mode can be deflated?`,
          visual: {
            type: 'graph',
            params: { x: [0, f3 * 1.25], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency (Hz)', ylabel: '', yticks: 0,
              points: [{ x: f4, y: 0, r: 6, color: 'accent', label: `${f4} Hz`, labelDx: -14, labelDy: -14 }, { x: f3, y: 0, r: 6, color: 'ink3', label: `${f3} Hz`, labelDx: -14, labelDy: -14 }] },
            caption: 'The two lowest natural frequencies (the higher ones do not matter for the last entry).',
          },
          answer: ans, tol: { rel: 0, abs: 1 },
          errors: [{ value: Math.ceil(tol / -lg(f4 / f3)), feedback: 'The matrix’s eigenvalues are ω², so the ratio is (f₁/f₂)², not f₁/f₂.' }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`Ratio per step: $\lambda_n/\lambda_{n-1} = (${f4}/${f3})^2 = ${q.toFixed(4)}$.`, t`Solve $${q.toFixed(4)}^k = 10^{-${tol}}$.`],
          teach: 'Unshifted QR deflates the smallest eigenvalue at the ratio λₙ/λₙ₋₁ per step — for vibration problems, the squared frequency ratio.',
          explain: t`$k = ${tol}/${(-lg(q)).toFixed(3)} \approx ${(tol / -lg(q)).toFixed(1)}$, so about $${ans}$ steps. With a Wilkinson shift it would take two or three, whatever the ratio.`,
        };
      },
    }),
    mcq({
      id: 'cp-schur', difficulty: 3, transfer: true,
      prompt: t`The QR algorithm on the (real, nonsymmetric) linearized attitude dynamics of a spinning spacecraft converges to a matrix that is upper-triangular **except** for a $2\times2$ block on the diagonal that never becomes triangular. What does the block mean?`,
      visual: {
        type: 'graph',
        params: { x: [-2.5, 6.5], y: [-0.1, 4.1], aspect: 'wide', equal: true, axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false,
          points: Array.from({ length: 16 }, (_, q) => ({ i: Math.floor(q / 4), j: q % 4 })).map(({ i, j }) => (i <= j || (i === 2 && j === 1)
            ? { x: 0.5 + j, y: 3.5 - i, r: 6, color: (i === 1 || i === 2) && (j === 1 || j === 2) ? 'gold' : 'accent' }
            : { x: 0.5 + j, y: 3.5 - i, r: 4, color: 'ink4', hollow: true })) },
        caption: 'The converged pattern of a 4 × 4: nonzero entries filled, zeros hollow — triangular except for one 2 × 2 block (gold) on the diagonal.',
      },
      choices: [
        'It holds a complex-conjugate pair of eigenvalues — an oscillatory (nutation-like) mode — which a real orthogonal similarity cannot split; its eigenvalues come from the 2 × 2 block',
        'The algorithm has failed to converge and needs more iterations',
        'The block contains two equal real eigenvalues',
        'The matrix is singular',
      ],
      answer: 0,
      why: {
        1: 'More iterations will not change it: real arithmetic can never produce the complex numbers that would triangularize it.',
        2: 'Equal real eigenvalues can still be triangularized in real arithmetic; a block that refuses means complex eigenvalues.',
        3: 'Singularity means a zero eigenvalue, which would appear on the diagonal like any other.',
      },
      hints: ['Can a real orthogonal Q make a real matrix with complex eigenvalues triangular?', 'Compute the eigenvalues of a block like [[a, −b], [b, a]].'],
      teach: 'For real matrices the QR algorithm converges to the real Schur form: 1 × 1 blocks for real eigenvalues, 2 × 2 blocks for complex-conjugate pairs.',
      explain: t`A real triangular matrix has real eigenvalues, so a complex pair must stay in a $2\times2$ block — the **real Schur form**. LAPACK’s double-shift (Francis) step uses the pair of shifts $\mu, \bar\mu$ together, keeping all arithmetic real. The block’s eigenvalues give the mode’s frequency (imaginary part) and damping (real part) — the oscillatory mode that defeated power iteration in [F7.1](#/lesson/st-f.F7.1).`,
    }),
  ],
  sources: [
    { label: 'Francis (1961), The QR transformation — a unitary analogue to the LR transformation, Computer Journal 4, 265', url: 'https://doi.org/10.1093/comjnl/4.3.265' },
    { label: 'Trefethen & Bau (1997), Numerical Linear Algebra, SIAM, Lectures 25–29 (eigenvalue algorithms, the QR algorithm with shifts)', url: 'https://doi.org/10.1137/1.9780898719574' },
    { label: 'Parlett (1998), The Symmetric Eigenvalue Problem, SIAM, ch. 8 (cubic convergence of the shifted QR algorithm)', url: 'https://doi.org/10.1137/1.9781611971163' },
  ],
});
