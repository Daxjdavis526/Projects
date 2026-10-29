// LU factorization: elimination recorded as A = LU, then two triangular solves.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { matmul, matTeX, tupleTeX, augTeX, qt, rr } from './_la.js';

const t = String.raw;
const STRANG = [[2, 1, 1], [4, -6, 0], [-2, 7, 2]];
const lu = (M, opts = {}) => rr(M, { aug: false, mode: 'lu', picture: 'none', ...opts });

// a 3×3 A = L U with small whole-number multipliers and pivots
function factors(r) {
  const L = [[1, 0, 0], [r.intExcept(-3, 3, [0]), 1, 0], [r.int(-3, 3), r.intExcept(-3, 3, [0]), 1]];
  const U = [[r.intExcept(-3, 4, [0, 1]), r.int(-3, 3), r.int(-3, 3)], [0, r.intExcept(-3, 4, [0]), r.int(-3, 3)], [0, 0, r.intExcept(-3, 4, [0])]];
  return { L, U, A: matmul(L, U) };
}
const forwardSub = (L, b) => { const y = []; for (let i = 0; i < b.length; i++) y.push(b[i] - L[i].slice(0, i).reduce((s, v, k) => s + v * y[k], 0)); return y; };
const backSub = (U, y) => { const n = y.length, x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) x[i] = (y[i] - U[i].slice(i + 1).reduce((s, v, k) => s + v * x[i + 1 + k], 0)) / U[i][i]; return x; };

export default lesson({
  id: 'math2270.LA-3.3',
  title: 'LU factorization',
  minutes: 11, difficulty: 3,
  equation: 'A = LU',
  intro: t`Elimination does the same work on $A$ whatever the right-hand side $\mathbf b$ is. The **LU factorization** records that work once. $U$ is the upper triangular echelon form that elimination produces; $L$ is lower triangular, with 1s on its diagonal and each multiplier $\ell_{ij}$ stored in exactly the position it cleared. Then $A\mathbf x = \mathbf b$ splits into two triangular solves — forward substitution for $L\mathbf y = \mathbf b$, back substitution for $U\mathbf x = \mathbf y$. Factoring an $n\times n$ matrix costs about $n^3/3$ multiplications; every new right-hand side after that costs only about $n^2$.`,
  symbols: [
    { tex: 'A', text: t`the square matrix being factored ($n\times n$)` },
    { tex: 'U', text: t`upper triangular: the matrix elimination ends with; its diagonal holds the pivots` },
    { tex: 'L', text: t`lower triangular with 1s on the diagonal; below it, the multipliers` },
    { tex: t`\ell_{ij}`, text: t`the multiplier used in $R_i \leftarrow R_i - \ell_{ij}R_j$; it is stored in row $i$, column $j$ of $L$` },
    { tex: t`\mathbf y`, text: t`the intermediate vector with $L\mathbf y = \mathbf b$: it is $\mathbf b$ after the same row operations` },
  ],
  why: 'Factor once, solve many times: a structural model checked under hundreds of load cases, or an implicit simulation that meets the same matrix at every time step, reuses L and U instead of eliminating again.',
  visual: {
    type: 'la-rowreduce',
    title: 'Elimination, written down',
    lead: t`Step through elimination on $A$. Each step clears one entry of $U$ (right) — and writes its multiplier into the same position of $L$ (left, ringed in blue). At the end, $L$ times $U$ is $A$ again.`,
    tasks: [
      'Press Next: ℓ₂₁ = 2 appears in L in row 2, column 1 — exactly where U just got its zero.',
      'Step to the end: U is upper triangular with pivots 2, −8, 1, and L holds 2, −1, −1 below its diagonal.',
      'Switch to “A zero pivot”: elimination stops at once. Without a row exchange there is no LU; software factors PA = LU instead.',
    ],
    params: { systems: [{ label: 'Strang’s example', M: STRANG }, { label: 'A zero pivot', M: [[0, 1, 2], [1, 1, 1], [2, 3, 1]] }], aug: false, mode: 'lu', picture: 'none' },
    caption: 'Exact fractions throughout. Unknown multipliers show as dots until elimination computes them; no row exchanges are made.',
  },
  example: {
    prompt: t`Factor $A = ${matTeX(STRANG)}$ as $LU$, then use the factors to solve $A\mathbf x = (5, -2, 9)$.`,
    visual: lu(STRANG, { step: 3, caption: 'The finished factors: L with its three multipliers, and U, the echelon form.' }),
    steps: [
      { label: 'First column', text: t`The pivot is 2. $\ell_{21} = 4/2 = 2$: $R_2 - 2R_1 = (0, -8, -2)$. $\ell_{31} = -2/2 = -1$: $R_3 + R_1 = (0, 8, 3)$.` },
      { label: 'Second column', text: t`The pivot is $-8$. $\ell_{32} = 8/(-8) = -1$: $R_3 + R_2 = (0, 0, 1)$.` },
      { label: 'The factors', text: t`$$L = ${matTeX([[1, 0, 0], [2, 1, 0], [-1, -1, 1]])},\qquad U = ${matTeX([[2, 1, 1], [0, -8, -2], [0, 0, 1]])}$$ Multiply them to check: row 2 of $L$ times $U$ is $2(2, 1, 1) + (0, -8, -2) = (4, -6, 0)$, row 2 of $A$. ✓` },
      { label: 'Forward', text: t`$L\mathbf y = \mathbf b$, top down: $y_1 = 5$; $\;2(5) + y_2 = -2$, so $y_2 = -12$; $\;-5 + 12 + y_3 = 9$, so $y_3 = 2$.` },
      { label: 'Back', text: t`$U\mathbf x = \mathbf y$, bottom up: $x_3 = 2$; $\;-8x_2 - 4 = -12$, so $x_2 = 1$; $\;2x_1 + 1 + 2 = 5$, so $x_1 = 1$.` },
      { label: 'Check', text: t`$A(1, 1, 2) = (2 + 1 + 2,\ 4 - 6 + 0,\ -2 + 7 + 4) = (5, -2, 9)$. ✓ A second right-hand side would need only the last two steps.` },
    ],
    answer: t`$L = ${matTeX([[1, 0, 0], [2, 1, 0], [-1, -1, 1]])}$, $U = ${matTeX([[2, 1, 1], [0, -8, -2], [0, 0, 1]])}$, and $\mathbf x = (1, 1, 2)$.`,
  },
  practice: [
    num({
      id: 'ell', difficulty: 1,
      gen(r) {
        const { A } = factors(r), i = r.int(1, 2), ell = A[i][0] / A[0][0];
        return {
          prompt: t`In the LU factorization of $A = ${matTeX(A)}$, what is the multiplier $\ell_{${i + 1}1}$ — the entry of $L$ in row ${i + 1}, column 1?`,
          answer: ell, tol: { rel: 1e-4, abs: 1e-6 },
          errors: A[i][0] !== 0 && Math.abs(A[0][0] / A[i][0] - ell) > 1e-9 ? [{ value: A[0][0] / A[i][0], feedback: 'Upside down: the multiplier is the entry being cleared divided by the pivot.' }] : [],
          hints: [t`The first pivot is $a_{11} = ${A[0][0]}$; the entry to clear is $a_{${i + 1}1} = ${A[i][0]}$.`, t`$\ell_{${i + 1}1} = a_{${i + 1}1}/a_{11}$.`],
          teach: 'Each entry of L below the diagonal is the multiplier that cleared the matching entry of A.',
          explain: t`$\ell_{${i + 1}1} = ${A[i][0]}/${A[0][0]} = ${qt(ell)}$. It goes into $L$ in row ${i + 1}, column 1 — the position it made zero in $U$.`,
          visual: lu(A, { caption: 'The matrix to factor, before elimination.' }),
        };
      },
    }),
    num({
      id: 'U-entry', difficulty: 2,
      gen(r) {
        const { A, U } = factors(r), j = r.int(1, 2);
        const slip = A[1][j] + (A[1][0] / A[0][0]) * A[0][j];
        return {
          prompt: t`Begin the LU factorization of $A = ${matTeX(A)}$: after clearing the first column, what is the entry of $U$ in row 2, column ${j + 1}?`,
          answer: U[1][j], tol: { rel: 1e-4, abs: 1e-6 },
          errors: Math.abs(slip - U[1][j]) > 1e-9 ? [{ value: slip, feedback: t`Sign slip: the operation is $R_2 - \ell_{21}R_1$, so subtract.` }] : [],
          hints: [t`$\ell_{21} = ${A[1][0]}/${A[0][0]} = ${qt(A[1][0] / A[0][0])}$.`, t`New $u_{2${j + 1}} = a_{2${j + 1}} - \ell_{21}a_{1${j + 1}} = ${A[1][j]} - (${qt(A[1][0] / A[0][0])})(${A[0][j]})$.`],
          teach: 'U is A after elimination: each row loses the multiplier times the pivot row above it.',
          explain: t`$${A[1][j]} - (${qt(A[1][0] / A[0][0])})(${A[0][j]}) = ${qt(U[1][j])}$. Row 2 of $U$ is $${tupleTeX(U[1])}$, unchanged by the later steps (they only touch row 3).`,
          visual: lu(A, { caption: 'The matrix before elimination. Step 1 subtracts ℓ₂₁ times row 1 from row 2.' }),
        };
      },
    }),
    num({
      id: 'forward-sub', difficulty: 2,
      gen(r) {
        const L = [[1, 0, 0], [r.intExcept(-3, 3, [0]), 1, 0], [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0]), 1]], b = [r.int(-4, 5), r.int(-4, 5), r.int(-4, 5)];
        const y = forwardSub(L, b);
        return {
          prompt: t`Solve $L\mathbf y = \mathbf b$ by forward substitution for $L = ${matTeX(L)}$ and $\mathbf b = ${tupleTeX(b)}$. What is $y_3$?`,
          answer: y[2], tol: { rel: 0, abs: 0.01 },
          errors: b[2] !== y[2] ? [{ value: b[2], feedback: t`$y_3$ is not just $b_3$: row 3 of $L$ also involves $y_1$ and $y_2$.` }] : [],
          hints: [t`Row 1 gives $y_1 = ${b[0]}$; row 2 gives $${L[1][0]}y_1 + y_2 = ${b[1]}$.`, t`Then row 3: $${L[2][0]}y_1 + (${L[2][1]})y_2 + y_3 = ${b[2]}$.`],
          teach: 'Forward substitution solves a lower triangular system from the top row down.',
          explain: t`$y_1 = ${y[0]}$, $y_2 = ${b[1]} - (${L[1][0]})(${y[0]}) = ${y[1]}$, $y_3 = ${b[2]} - (${L[2][0]})(${y[0]}) - (${L[2][1]})(${y[1]}) = ${y[2]}$. This $\mathbf y$ is exactly what elimination would have turned $\mathbf b$ into.`,
          visual: rr(L.map((row, i) => [...row, b[i]]), { picture: 'none', caption: 'The lower triangular system [L | b]: the first row involves only y₁.', vars: ['y₁', 'y₂', 'y₃'] }),
        };
      },
    }),
    mcq({
      id: 'L-from-multipliers', difficulty: 2,
      prompt: t`Elimination on a $3\times3$ matrix uses $R_2 \leftarrow R_2 - 3R_1$, then $R_3 \leftarrow R_3 + 2R_1$, then $R_3 \leftarrow R_3 - 4R_2$, with no row exchanges. What is $L$?`,
      choices: [t`$${matTeX([[1, 0, 0], [3, 1, 0], [-2, 4, 1]])}$`, t`$${matTeX([[1, 0, 0], [-3, 1, 0], [2, -4, 1]])}$`, t`$${matTeX([[1, 3, -2], [0, 1, 4], [0, 0, 1]])}$`, t`$${matTeX([[0, 0, 0], [3, 0, 0], [-2, 4, 0]])}$`],
      answer: 0,
      why: {
        1: t`Those are the numbers *added*; $L$ stores the multipliers $\ell_{ij}$ that are *subtracted*. $R_3 + 2R_1$ means $\ell_{31} = -2$.`,
        2: 'L is lower triangular: the multipliers sit below the diagonal, in the row they changed and the column of the pivot.',
        3: 'L has 1s on its diagonal — each row keeps itself, plus the multiples of earlier rows.',
      },
      hints: [t`Write each step as $R_i \leftarrow R_i - \ell_{ij}R_j$ and read off $\ell_{ij}$.`, t`$R_3 + 2R_1$ is $R_3 - (-2)R_1$.`],
      teach: 'L holds each multiplier ℓᵢⱼ, with its sign as subtracted, in row i and column j, below a diagonal of 1s.',
      explain: t`$\ell_{21} = 3$, $\ell_{31} = -2$ and $\ell_{32} = 4$ go below a diagonal of 1s. (Flipping every sign does not give $L^{-1}$, the elimination matrix, either: its row 3, column 1 entry is $14$, because the last step subtracts 4 times a row 2 that already contains $-3R_1$.)`,
    }),
    mcq({
      id: 'why-LU', difficulty: 2,
      prompt: t`A $1000\times1000$ system $A\mathbf x = \mathbf b$ has to be solved for 500 different right-hand sides $\mathbf b$. Why factor $A = LU$ first?`,
      choices: ['Factoring costs about n³/3 once; then each b needs only about n² for the two triangular solves, roughly 300 times less than a fresh elimination', 'LU arithmetic is more accurate than elimination', 'L and U are smaller matrices than A, so they use less memory', 'Triangular solves need no divisions at all'],
      answer: 0,
      why: {
        1: 'LU is elimination: the arithmetic is the same, so is the rounding. The gain is in not repeating it.',
        2: 'L and U together hold as many numbers as A (they can even overwrite it); the saving is time, not memory.',
        3: 'Back substitution divides by each pivot. The point is the operation count, not the kind of operation.',
      },
      hints: ['Count the work: elimination on an n × n matrix takes about n³/3 multiplications. What does a triangular solve take?', 'Two triangular solves take about n² multiplications.'],
      teach: 'LU separates the expensive part of elimination (about n³/3) from the cheap part that depends on b (about n²).',
      explain: t`For $n = 1000$: $n^3/3 \approx 3.3\times10^8$ multiplications once, then $n^2 = 10^6$ per right-hand side. 500 fresh eliminations would cost about $1.7\times10^{11}$; LU costs about $8.3\times10^8$ in all — some 200 times less.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 50], y: [0, 180], aspect: 'wide', xlabel: 'right-hand sides solved', ylabel: 'multiplications (×10⁸)', axesAt: 'edge',
          curves: [{ fn: '3.333*x', color: 'bad', label: 'eliminate every time', labelAt: 40, labelDx: -150, labelDy: -10 }, { fn: '3.333 + 0.01*x', color: 'good', label: 'factor once, then two triangular solves', labelAt: 22, labelDy: -14 }],
        },
        caption: 'Work for n = 1000, counting multiplications only (n³/3 per elimination, n² per pair of triangular solves). Real timings also depend on memory traffic.',
      },
    }),
    code({
      id: 'lu-nopivot', difficulty: 3,
      prompt: t`Complete \`lu_nopivot(A)\`: elimination without row exchanges, storing each multiplier in \`L\` while \`U\` is reduced. The program then compares your factors with SciPy's \`scipy.linalg.lu\`, which uses partial pivoting ($A = PLU$) — for this matrix it needs no exchanges, so $P = I$ and the factors must agree.`,
      starter: t`import numpy as np
import scipy.linalg

def lu_nopivot(A):
    """Factor A = L U by elimination without row exchanges."""
    n = A.shape[0]
    U = A.astype(float)          # a copy, which elimination turns into U
    L = np.eye(n)                # the multipliers go below the diagonal
    for j in range(n):
        for i in range(j + 1, n):
            # TODO: the multiplier l = U[i, j] / U[j, j]; store it in L,
            #       then subtract l times row j from row i of U
            pass
    return L, U

A = np.array([[4, 3, 2], [2, 5, 1], [1, 2, 6]])
L, U = lu_nopivot(A)
P, Ls, Us = scipy.linalg.lu(A)      # SciPy: A = P L U, with partial pivoting
print("L =", L, "U =", U, sep="\n")
print("matches SciPy:", np.allclose(P, np.eye(3)) and np.allclose(L, Ls) and np.allclose(U, Us))
`,
      answer: t`import numpy as np
import scipy.linalg

def lu_nopivot(A):
    n = A.shape[0]
    U = A.astype(float)
    L = np.eye(n)
    for j in range(n):
        for i in range(j + 1, n):
            l = U[i, j] / U[j, j]
            L[i, j] = l
            U[i] = U[i] - l * U[j]
    return L, U

A = np.array([[4, 3, 2], [2, 5, 1], [1, 2, 6]])
L, U = lu_nopivot(A)
P, Ls, Us = scipy.linalg.lu(A)
print("L =", L, "U =", U, sep="\n")
print("matches SciPy:", np.allclose(P, np.eye(3)) and np.allclose(L, Ls) and np.allclose(U, Us))
`,
      tests: [
        { name: 'U is upper triangular', code: 'np.allclose(np.tril(lu_nopivot(A)[1], -1), 0)' },
        { name: 'L is lower triangular with 1s on its diagonal', code: 'np.allclose(np.triu(lu_nopivot(A)[0], 1), 0) and np.allclose(np.diag(lu_nopivot(A)[0]), 1)' },
        { name: 'L @ U gives back A', code: 'np.allclose(lu_nopivot(A)[0] @ lu_nopivot(A)[1], A)' },
        { name: 'the factors match scipy.linalg.lu (which needs no exchanges here)', code: '(lambda P, Ls, Us: np.allclose(P, np.eye(3)) and np.allclose(lu_nopivot(A)[0], Ls) and np.allclose(lu_nopivot(A)[1], Us))(*scipy.linalg.lu(A))' },
        { name: 'a 4 × 4 matrix factors too', code: '(lambda B: np.allclose(np.dot(*lu_nopivot(B)), B) and np.allclose(np.tril(lu_nopivot(B)[1], -1), 0))(np.array([[5., 1, 2, 0], [1, 6, 1, 2], [2, 1, 7, 1], [0, 2, 1, 8]]))' },
      ],
      hints: [t`Inside the loop: \`l = U[i, j] / U[j, j]\`, then \`L[i, j] = l\`.`, t`Then update the whole row at once: \`U[i] = U[i] - l * U[j]\`.`],
      teach: 'LU is elimination with one extra line: write each multiplier into L as you use it.',
      explain: t`For this $A$: $L = ${matTeX([[1, 0, 0], [1 / 2, 1, 0], [1 / 4, 5 / 14, 1]])}$ and $U = ${matTeX([[4, 3, 2], [0, 3.5, 0], [0, 0, 5.5]])}$. SciPy pivots by size — it swaps in the row with the largest entry in the pivot column, to keep rounding errors small — but here every pivot is already the largest, so $P = I$ and the factors agree.`,
      visual: lu([[4, 3, 2], [2, 5, 1], [1, 2, 6]], { step: 3, caption: 'The factors your function should produce, in exact fractions (14 is not a typo: ℓ₃₂ = 5/14).' }),
    }),
    mcq({
      id: 'pivot-needed', difficulty: 2,
      prompt: t`Does $A = ${matTeX([[0, 1], [1, 1]])}$ have an LU factorization ($L$ unit lower triangular, $U$ upper triangular, no row exchanges)?`,
      choices: [t`No: the first pivot is 0, so a row exchange is needed; instead $PA = LU$, with $P$ swapping the rows`, t`Yes: $L = I$ and $U = A$`, t`No, because $A$ is not invertible`, t`Yes, with $\ell_{21} = 1/0$`],
      answer: 0,
      why: {
        1: t`$U = A$ is not upper triangular: its entry in row 2, column 1 is 1.`,
        2: t`$A$ is invertible ($\det A = -1$). The trouble is only the order of the rows.`,
        3: t`$1/0$ is not a number: elimination cannot use a zero pivot.`,
      },
      hints: ['What would the first multiplier be?', t`$\ell_{21} = a_{21}/a_{11}$, and $a_{11} = 0$.`],
      teach: 'A zero pivot blocks LU without row exchanges; swapping rows first gives PA = LU.',
      explain: t`With $P = ${matTeX([[0, 1], [1, 0]])}$, $PA = ${matTeX([[1, 1], [0, 1]])}$, already upper triangular: $L = I$, $U = PA$. Every invertible matrix has some $PA = LU$; that is what \`scipy.linalg.lu\` returns.`,
      visual: rr([[0, 1], [1, 1]], { aug: false, picture: 'none', caption: 'The matrix, before any elimination.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solve-lu', difficulty: 2,
      gen(r) {
        const { L, U, A } = factors(r), x = [r.intExcept(-2, 3, [0]), r.int(-2, 3), r.intExcept(-2, 3, [0])], b = A.map((row) => row.reduce((s, v, k) => s + v * x[k], 0));
        const y = forwardSub(L, b), k = r.int(0, 2), xs = backSub(U, y);
        return {
          prompt: t`$A = LU$ with $L = ${matTeX(L)}$ and $U = ${matTeX(U)}$. Solve $A\mathbf x = ${tupleTeX(b)}$ with two triangular solves. What is $x_${k + 1}$?`,
          answer: xs[k], tol: { rel: 1e-4, abs: 1e-6 },
          hints: [t`First $L\mathbf y = \mathbf b$ from the top; then $U\mathbf x = \mathbf y$ from the bottom.`],
          teach: 'With A = LU, solve Ly = b forward, then Ux = y backward.',
          explain: t`$\mathbf y = ${tupleTeX(y)}$ and $\mathbf x = ${tupleTeX(xs.map((v) => Math.round(v * 1e9) / 1e9))}$.`,
          visual: rr(A.map((row, i) => [...row, b[i]]), { view: 4, caption: 'The system A x = b as three planes. Drag the picture to rotate.' }),
        };
      },
    }),
    num({
      id: 'cp-cost', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([1000, 2000, 4000]), K = r.pick([1000, 5000, 20000]);
        const sep = (K * n ** 3) / 3, once = n ** 3 / 3 + K * n * n, ratio = sep / once;
        return {
          prompt: t`An implicit simulation of a re-entry heat shield solves $A\mathbf x = \mathbf b$ with the same $${n}\times${n}$ matrix $A$ at each of ${K.toLocaleString('en-US')} time steps. A fresh elimination costs about $n^3/3$ multiplications; an LU factorization costs $n^3/3$ once, and then about $n^2$ per step for the two triangular solves. Roughly how many times fewer multiplications does the LU approach need?`,
          answer: ratio, tol: { rel: 0.02 },
          errors: [{ value: K, feedback: 'That ignores the n² per step, which adds up over many steps.' }].filter((e) => Math.abs(e.value - ratio) > 0.02 * ratio),
          hints: [t`Elimination every step: $K\,n^3/3$. LU: $n^3/3 + K\,n^2$.`, t`Divide the two: $\dfrac{K n^3/3}{n^3/3 + K n^2} = \dfrac{K}{1 + 3K/n}$.`],
          teach: 'Reusing an LU factorization replaces a cubic cost per solve with a quadratic one.',
          explain: t`$\dfrac{K n^3/3}{n^3/3 + K n^2} = \dfrac{${K}}{1 + 3(${K})/${n}} \approx ${Math.round(ratio)}$. Operation counts are only a guide — memory traffic matters too — but factor-once-solve-many is why implicit solvers are affordable at all.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, K], y: [Math.floor(Math.log10(n ** 3 / 3)) - 1, Math.log10((K * n ** 3) / 3) + 0.6], aspect: 'wide', ylog: true, xlabel: 'time steps', ylabel: 'multiplications', axesAt: 'edge',
              curves: [{ fn: `log10(max(1, x*${n ** 3 / 3}))`, color: 'bad', domain: [1, K], label: 'eliminate every step', labelAt: K * 0.55, labelDy: -14 }, { fn: `log10(${n ** 3 / 3} + x*${n * n})`, color: 'good', domain: [0, K], label: 'factor once, then triangular solves', labelAt: K * 0.4, labelDy: 16 }],
            },
            caption: `Cumulative multiplications for n = ${n}, on a logarithmic axis. Operation counts only.`,
          },
        };
      },
    }),
    mcq({
      id: 'cp-L-meaning', difficulty: 2,
      prompt: t`In the factorization below, $L$ has $\ell_{32} = 4$. What does that entry record?`,
      choices: ['Once column 1 was cleared, 4 times row 2 was subtracted from row 3', '4 times row 2 was added to row 3', 'The third pivot of A is 4', 'The original matrix A has a 4 in row 3, column 2'],
      answer: 0,
      why: {
        1: t`$\ell_{ij}$ is the multiplier *subtracted*: $R_3 \leftarrow R_3 - 4R_2$. Adding would put $-4$ in $L$.`,
        2: 'Pivots sit on the diagonal of U, not in L.',
        3: t`$\ell_{32}$ is computed from the matrix after the first step, $a_{32}$ minus earlier changes, divided by the second pivot — not read off $A$.`,
      },
      hints: [t`Every entry of $L$ below the diagonal is a multiplier $\ell_{ij}$ in $R_i \leftarrow R_i - \ell_{ij}R_j$.`],
      teach: 'Each entry of L below the diagonal records one elimination step: which rows, and how many times was subtracted.',
      explain: t`$\ell_{32} = 4$ means the step $R_3 \leftarrow R_3 - 4R_2$, made after column 1 was cleared, using the second pivot. Reading $L$ is reading the elimination log.`,
      visual: lu(matmul([[1, 0, 0], [2, 1, 0], [-1, 4, 1]], [[1, 2, 1], [0, 1, 3], [0, 0, 2]]), { step: 3, caption: 'The finished factorization: L (left), with ℓ₃₂ ringed — the last multiplier used — and U (right).' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §2.6', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'SciPy reference: scipy.linalg.lu', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.linalg.lu.html' },
  ],
});
