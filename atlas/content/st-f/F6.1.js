// LU decomposition and pivoting — Gaussian elimination as a factorization
// PA = LU, done once and reused for every right-hand side; its cost 2n³/3;
// why a tiny pivot destroys a perfectly well-conditioned 2×2 (the growth
// factor), how partial pivoting bounds the multipliers by 1, Wilkinson's
// worst case 2ⁿ⁻¹, the determinant for free, and why x = A⁻¹b is the wrong
// way to solve a system.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { luPivot, luNoPivot, growth, cond2 } from './_lin.js';

const t = String.raw;
const U = 2 ** -53;

// the 2×2 with a tiny pivot, [[ε, 1], [1, 1]] x = [1, 2], solved in float64
const noPiv = (e) => { const l = 1 / e, u22 = 1 - l, y2 = 2 - l, x2 = y2 / u22; return [(1 - x2) / e, x2]; };
const piv = (e) => { const u22 = 1 - e, x2 = (1 - 2 * e) / u22; return [2 - x2, x2]; };
const KAPPA2 = cond2([[1e-20, 1], [1, 1]]);
// graph expressions of the slider exponent k (ε = 10^k): the same float64 operations
const E = '10^k';
const X1NP = `(1 - (2 - 1/${E})/(1 - 1/${E}))/${E}`;
const X1P = `2 - (1 - 2*${E})/(1 - ${E})`;
const errExpr = (x1, e) => `log10(max(abs((${x1})*(1 - ${e}) - 1), 1e-17))`;

// the worked example
const WA = [[1, 2, 2], [4, 4, 2], [2, 6, 4]], WB = [3, 4, 4];
const WLU = luPivot(WA);

// Wilkinson's matrix: 1 on the diagonal, −1 below it, 1 in the last column
const wilk = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j === n - 1 ? 1 : i === j ? 1 : i > j ? -1 : 0)));
const WG = (n) => growth(wilk(n), luPivot(wilk(n)).U);

const matTeX = (M) => t`\begin{pmatrix}${M.map((r) => r.join(' & ')).join(t` \\ `)}\end{pmatrix}`;

export default lesson({
  id: 'st-f.F6.1',
  title: 'LU decomposition and pivoting',
  minutes: 14, difficulty: 3,
  intro: t`Gaussian elimination, recorded, is a factorization: the multipliers it uses fill a unit lower-triangular $L$, the result is an upper-triangular $U$, and the row swaps form a permutation $P$. You met the algebra in [linear algebra](#/lesson/math2270.LA-2.3) and called \`np.linalg.solve\` in [Scientific Programming](#/lesson/prog.P10.1); this lesson asks why it is **safe** in floating point. Wilkinson’s backward-error analysis says the computed factors are exact for a nearby matrix:

$$PA = LU, \qquad (A + \delta A)\,\hat x = b \ \text{ with } \ \frac{\lVert\delta A\rVert}{\lVert A\rVert} \lesssim n\,\rho\,u, \qquad \rho = \frac{\max\lvert u_{ij}\rvert}{\max\lvert a_{ij}\rvert}$$

Everything hinges on the **growth factor** $\rho$. Without row swaps a tiny pivot makes huge multipliers and huge entries in $U$, and the answer is garbage even when the problem is perfectly well-conditioned. **Partial pivoting** — swap the largest available entry into the pivot position — keeps every $\lvert l_{ij}\rvert \le 1$ and, in practice, $\rho$ small. Factoring costs $\tfrac23n^3$ flops; each further right-hand side only $2n^2$.`,
  symbols: [
    { tex: 'P', text: 'a permutation matrix: the identity with its rows reordered to record the swaps' },
    { tex: 'L', text: 'unit lower-triangular: 1s on the diagonal, the multipliers $l_{ij}$ below it' },
    { tex: 'U', text: 'upper-triangular: what elimination leaves; its diagonal holds the pivots' },
    { tex: t`\delta A`, text: 'the backward error: the perturbation of $A$ for which the computed $\\hat x$ is exact' },
    { tex: t`\rho`, text: 'the **growth factor**: how much the entries grow during elimination. At most $2^{n-1}$ with partial pivoting; unbounded without it' },
    { tex: 'u', text: 'unit roundoff, $2^{-53} \\approx 1.1\\times10^{-16}$' },
    { tex: 'n', text: 'the size of the system' },
  ],
  why: 'Every implicit integrator, finite-element model, Newton step in many variables and least-squares fit ends in a linear solve; LU with partial pivoting is what LAPACK’s dgesv (behind np.linalg.solve) does, and the growth factor is why it can be trusted.',
  visual: {
    type: 'graph',
    title: 'A tiny pivot, with and without a swap',
    lead: t`The system $\begin{pmatrix}\varepsilon & 1\\ 1 & 1\end{pmatrix}x = \begin{pmatrix}1\\ 2\end{pmatrix}$ has $x_1 = 1/(1 - \varepsilon) \approx 1$ and a condition number of only $${KAPPA2.toFixed(3)}$. Slide $\varepsilon$ down. The curves are the relative error of $x_1$ actually computed in float64, by elimination as written (red) and after swapping the rows (blue).`,
    tasks: [
      'At ε = 10⁻⁴ the unpivoted answer has lost 4 digits; the error grows like u/ε (dashed).',
      'At ε = 10⁻¹⁶ the readout gives x₁ = 2.22 without pivoting; below about 10⁻¹⁷ it gives exactly 0. The pivoted answer stays right to the last digit.',
      'Watch the growth factor: it is 1/ε − 1 without the swap, 1 with it.',
    ],
    params: {
      x: [-20.3, -0.5], y: [-17.3, 1.3], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'ε', ylabel: 'relative error of x₁',
      sliders: [{ key: 'k', label: t`$\log_{10}\varepsilon$`, min: -19, max: -1, step: 0.5, value: -8, explain: 'The size of the top-left entry, the would-be first pivot.' }],
      curves: [
        { fn: errExpr(X1NP.replaceAll('10^k', '10^x'), '10^x'), color: 'bad', width: 2, domain: [-20, -0.6], samples: 1200, label: 'no pivoting', labelAt: -6, labelDx: 6, labelDy: -12 },
        { fn: errExpr(X1P.replaceAll('10^k', '10^x'), '10^x'), color: 'accent', width: 2, domain: [-20, -0.6], samples: 1200, label: 'partial pivoting', labelAt: -11, labelDx: 0, labelDy: -34 },
        { fn: `min(0, ${n12(lg(U))} - x)`, color: 'ink3', dash: true, width: 1.3, domain: [-20, -0.6], label: 'u/ε', labelAt: -2.5, labelDx: 8, labelDy: 10 },
      ],
      vlines: [{ x: 'k', color: 'gold' }],
      readouts: [
        { label: 'multiplier l₂₁ (no swap)', expr: `1/${E}`, digits: 3 },
        { label: 'growth factor ρ (no swap)', expr: `abs(1 - 1/${E})`, digits: 3 },
        { label: 'x₁ without pivoting', expr: X1NP, digits: 12, zero: 0 },
        { label: 'x₁ with pivoting', expr: X1P, digits: 12 },
      ],
    },
    caption: 'Real float64 arithmetic, the same operations a program performs (errors below 10⁻¹⁷ are drawn at 10⁻¹⁷). The scatter of the red curve is genuine round-off, not a plotting artefact.',
  },
  example: {
    prompt: t`Factor $A = ${matTeX(WA)}$ as $PA = LU$ with partial pivoting, then solve $Ax = b$ for $b = (3, 4, 4)$ by two triangular solves, and read off $\det A$.`,
    visual: {
      type: 'la-rowreduce',
      params: { M: WA.map((r, i) => [...r, WB[i]]), aug: true, ops: [['swap', 1, 2], ['add', 2, 1, '-1/4'], ['add', 3, 1, '-1/2'], ['swap', 2, 3], ['add', 3, 2, '-1/4']], step: 5, picture: 'none', readout: false },
      caption: 'The elimination with its swaps, step by step, in exact fractions (the right-hand side rides along after the bar).',
    },
    steps: [
      { label: 'First pivot', text: t`In column 1 the largest entry is the 4 in row 2: swap rows 1 and 2. The multipliers are $l_{21} = \tfrac14$ and $l_{31} = \tfrac24 = \tfrac12$ — both at most 1, by construction. Rows 2 and 3 become $(0, 1, \tfrac32)$ and $(0, 4, 3)$.` },
      { label: 'Second pivot', text: t`In column 2, below the diagonal, $4 > 1$: swap rows 2 and 3. Then $l_{32} = \tfrac14$, and the last row becomes $(0, 0, \tfrac32 - \tfrac34) = (0, 0, \tfrac34)$.` },
      { label: 'The factors', text: t`$U = ${matTeX([[4, 4, 2], [0, 4, 3], [0, 0, t`\tfrac34`]])}$, $L = ${matTeX([[1, 0, 0], [t`\tfrac12`, 1, 0], [t`\tfrac14`, t`\tfrac14`, 1]])}$, and $P$ takes rows $(2, 3, 1)$ of $A$. Note how the multipliers moved with their rows when rows were swapped. The growth factor is $\rho = 4/4 = 1$.` },
      { label: 'Two triangular solves', text: t`$Pb = (4, 4, 3)$. Forward, $Ly = Pb$: $y = (4,\ 4 - \tfrac12\cdot4,\ 3 - \tfrac14\cdot4 - \tfrac14\cdot2) = (4, 2, \tfrac32)$. Backward, $Ux = y$: $x_3 = \tfrac32/\tfrac34 = 2$, $x_2 = (2 - 3\cdot2)/4 = -1$, $x_1 = (4 - 4(-1) - 2\cdot2)/4 = 1$. Each costs $n^2$ flops.` },
      { label: 'Determinant', text: t`$\det P\,\det A = \det L\,\det U$, with $\det L = 1$ and $\det P = (-1)^{\text{swaps}} = (-1)^2$. So $\det A = 4\cdot4\cdot\tfrac34 = 12$ — a by-product, never computed by cofactors.` },
      { label: 'Check', text: t`$A(1, -1, 2) = (1 - 2 + 4,\ 4 - 4 + 4,\ 2 - 6 + 8) = (3, 4, 4) = b$. ✓` },
    ],
    answer: t`$P$: rows $(2, 3, 1)$; $L$ with multipliers $\tfrac12, \tfrac14, \tfrac14$; $U$ with pivots $4, 4, \tfrac34$; $x = (1, -1, 2)$; $\det A = 12$.`,
  },
  practice: [
    num({
      id: 'first-multiplier', difficulty: 1,
      gen(r) {
        const big = r.pick([5, 6, 8]), M = [[r.int(1, 3), r.int(-3, 3), r.int(1, 4)], [r.intExcept(-4, 4, [0]), r.int(1, 5), r.int(-2, 2)], [big, r.int(-3, 3), r.int(1, 3)]];
        const pr = r.int(0, 2);
        const A = M.map((_, i) => M[(i + pr) % 3]);              // put the largest first-column entry in a random row
        const ip = A.findIndex((row) => row[0] === big), others = [0, 1, 2].filter((i) => i !== ip), q = r.pick(others);
        const ans = A[q][0] / big;
        return {
          prompt: t`Partial pivoting on $A = ${matTeX(A)}$ first chooses a pivot in column 1. What multiplier then eliminates the first entry of row $${q + 1}$ of $A$?`,
          visual: { type: 'la-rowreduce', params: { M: A, aug: false, stepper: false, step: 0, picture: 'none', readout: false }, caption: 'The matrix before elimination.' },
          answer: ans, tol: { rel: 1e-3, abs: 1e-9 },
          errors: [{ value: A[q][0] / A[0][0], feedback: 'That uses the top-left entry as the pivot. Partial pivoting first swaps in the entry of largest absolute value in the column.' }, { value: big / A[q][0], feedback: 'The multiplier is the entry to eliminate divided by the pivot, not the other way round.' }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 1e-6),
          hints: ['Find the entry of largest absolute value in column 1.', t`The multiplier is $a_{${q + 1}1}/${big}$.`],
          teach: 'Partial pivoting puts the largest entry of the column in the pivot position, so every multiplier is at most 1 in size.',
          explain: t`The pivot is the $${big}$ in row $${ip + 1}$, and $l = ${A[q][0]}/${big} = ${tex(ans, 3)}$ — at most 1 in absolute value, as partial pivoting guarantees.`,
        };
      },
    }),
    num({
      id: 'growth-2x2', difficulty: 2,
      gen(r) {
        const k = r.int(5, 14), e = 10 ** -k, ans = Math.abs(1 - 1 / e);
        return {
          prompt: t`Eliminate without row swaps in $\begin{pmatrix}10^{-${k}} & 1\\ 1 & 1\end{pmatrix}$. What is the growth factor $\rho = \max\lvert u_{ij}\rvert / \max\lvert a_{ij}\rvert$?`,
          visual: {
            type: 'graph',
            params: { x: [-15.5, -3.5], y: [-0.5, 16], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'ε', ylabel: 'ρ',
              curves: [{ fn: 'log10(10^(-x) - 1)', color: 'bad', width: 2, domain: [-15.3, -3.7], label: 'no swap', labelAt: -12, labelDx: 8, labelDy: 0 }, { fn: '0*x', color: 'accent', width: 2, domain: [-15.3, -3.7], label: 'with swap: ρ = 1', labelAt: -9, labelDx: 0, labelDy: -12 }] },
            caption: 'The growth factor of this 2×2 against the size of the top-left entry, log–log.',
          },
          answer: ans, tol: { rel: 1e-3 },
          errors: [{ value: 1, feedback: 'That is the growth factor with the rows swapped. Without the swap the multiplier is 1/ε.' }],
          hints: [t`$l_{21} = 1/10^{-${k}} = 10^{${k}}$.`, t`$u_{22} = 1 - l_{21}\cdot 1 = 1 - 10^{${k}}$; the largest entry of $A$ is 1.`],
          teach: 'A tiny pivot means a huge multiplier, and the entries of U grow by that factor: the growth factor measures how much rounding gets amplified.',
          explain: t`$u_{22} = 1 - 10^{${k}}$, so $\rho = 10^{${k}} - 1 \approx ${tex(ans, 3)}$. The backward error can be $\rho u \approx ${tex(ans * U, 2)}$ relative${ans * U > 0.01 ? ' — the answer is meaningless' : ''}; the 1 in $u_{22}$ has been swamped and with it the information it carried.`,
        };
      },
    }),
    mcq({
      id: 'why-garbage', difficulty: 2,
      prompt: t`For $\varepsilon = 10^{-20}$, elimination without swaps returns $x_1 = 0$ for the system in the Explore, whose answer is $x_1 \approx 1$. The condition number is $${KAPPA2.toFixed(2)}$. What went wrong?`,
      visual: {
        type: 'graph',
        params: { x: [-1.6, 3.6], y: [-1.2, 3.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x₁', ylabel: 'x₂', equal: true,
          curves: [{ fn: '1 - 0.02*x', color: 'warn', width: 2, label: 'εx₁ + x₂ = 1 (ε exaggerated)', labelAt: -1.4, labelDx: 0, labelDy: -12 }, { fn: '2 - x', color: 'accent', width: 2, label: 'x₁ + x₂ = 2', labelAt: 2.6, labelDx: 6, labelDy: -6 }],
          points: [{ x: 1, y: 1, r: 5, color: 'good', label: 'solution ≈ (1, 1)', labelDx: 10, labelDy: -10 }] },
        caption: 'The two equations as lines (ε drawn as 0.02 so the first line visibly tilts). They cross cleanly at a wide angle: the problem is well-conditioned.',
      },
      choices: [
        t`The algorithm, not the problem: the multiplier $10^{20}$ makes $u_{22} = 1 - 10^{20}$, which rounds to $-10^{20}$, losing the 1 that carried the answer; swapping rows avoids it`,
        'The matrix is nearly singular, so no algorithm can solve it accurately',
        t`Dividing by $10^{-20}$ is an inexact operation in floating point`,
        'float64 has too few digits; the same elimination in quadruple precision would be fine for any ε',
      ],
      answer: 0,
      why: {
        1: t`A condition number of $${KAPPA2.toFixed(2)}$ is about as good as it gets; the lines cross at a wide angle.`,
        2: 'A single division is correctly rounded: it errs by at most u relative. The damage comes from the subtraction it sets up.',
        3: 'More digits only move the threshold: with ε below quadruple precision’s u the same thing happens. Pivoting fixes it at any precision.',
      },
      hints: ['Compute u₂₂ = 1 − (1/ε)·1 in floating point: what happens to the 1?', 'Is the trouble in the problem (κ) or in the order of operations?'],
      teach: 'A well-conditioned problem can be ruined by an unstable algorithm; Gaussian elimination without pivoting is unstable because the growth factor is unbounded.',
      explain: t`$1 - 10^{20}$ rounds to $-10^{20}$, and $2 - 10^{20}$ to $-10^{20}$: the computed $x_2$ is exactly 1 and $x_1 = (1 - x_2)/\varepsilon = 0$. With the rows swapped, the multiplier is $\varepsilon$, $u_{22} = 1 - \varepsilon$, and every digit survives. This is the instability of [F2.2](#/lesson/st-f.F2.2), in a matrix.`,
    }),
    num({
      id: 'cube-cost', difficulty: 2,
      gen(r) {
        const n0 = r.pick([1000, 2000]), t0 = r.pick([0.4, 0.6, 1.5]), m = r.pick([2, 3, 5]), n1 = n0 * m, ans = t0 * m ** 3;
        return {
          prompt: t`An LU factorization of a dense $${n0}\times${n0}$ matrix takes $${t0}$ s on a workstation. About how long for $${n1}\times${n1}$?`,
          visual: {
            type: 'graph',
            params: { x: [2.8, 4.3], y: [-1, 3.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'n', ylabel: 'time (s)',
              curves: [{ fn: `${n12(lg(t0))} + 3*(x - ${n12(lg(n0))})`, color: 'accent', width: 2, dash: true, domain: [2.9, 4.2] }],
              points: [{ x: n12(lg(n0)), y: n12(lg(t0)), r: 5, color: 'accent', label: `n = ${n0}`, labelDx: 8, labelDy: 10 }] },
            caption: 'Time against size on log–log axes: a line of slope 3 for a dense factorization (ignoring cache effects, which bend real curves).',
          },
          answer: ans, units: 's', tol: { rel: 0.02 },
          errors: [{ value: t0 * m * m, feedback: 'That is n² scaling — the cost of one triangular solve, not of the factorization.' }, { value: t0 * m, feedback: 'Elimination does about n³ work, not n.' }],
          hints: [t`The cost is $\tfrac23n^3$ flops.`, t`Multiplying $n$ by $${m}$ multiplies the work by $${m}^3$.`],
          teach: 'Dense LU costs (2/3)n³ flops: double n and the time grows eightfold.',
          explain: t`$${t0}\times${m}^3 = ${ans}$ s. The $\tfrac23n^3$ count comes from $\sum_k 2(n - k)^2$ over the $n$ elimination steps. Once factored, each new right-hand side costs only $2n^2$ flops — about $${Math.round((2 / 3) * n1 / 2)}$ times cheaper at this size.`,
        };
      },
    }),
    num({
      id: 'reuse', difficulty: 3,
      gen(r) {
        const n = r.pick([500, 1000, 3000]), k = r.pick([50, 100, 400]);
        const refactor = k * ((2 / 3) * n ** 3 + 2 * n * n), once = (2 / 3) * n ** 3 + k * 2 * n * n, ans = refactor / once;
        return {
          prompt: t`A structural model has $n = ${n}$ unknowns and $${k}$ load cases (right-hand sides). Counting $\tfrac23n^3$ flops per factorization and $2n^2$ per pair of triangular solves, how many times faster is factoring once and reusing $L$ and $U$ than calling a solver that re-factors for every load case?`,
          visual: {
            type: 'graph',
            params: { x: [0, k * 1.05], y: [0, refactor / 1e9 * 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'load cases solved', ylabel: 'Gflop',
              curves: [{ fn: `${n12(((2 / 3) * n ** 3 + 2 * n * n) / 1e9)}*x`, color: 'bad', width: 2, domain: [0, k], label: 're-factor every time', labelAt: k * 0.55, labelDx: -40, labelDy: -14 }, { fn: `${n12((2 / 3) * n ** 3 / 1e9)} + ${n12((2 * n * n) / 1e9)}*x`, color: 'accent', width: 2, domain: [0, k], label: 'factor once', labelAt: k * 0.8, labelDx: 0, labelDy: -12 }] },
            caption: 'Cumulative work against the number of right-hand sides (flop counts; real timings also depend on memory traffic).',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: k, feedback: 'That ignores the cost of the factorization done once and of the k pairs of triangular solves.' }],
          hints: [t`Re-factoring: $${k}\left(\tfrac23n^3 + 2n^2\right)$. Once: $\tfrac23n^3 + ${k}\cdot2n^2$.`, 'Divide the first by the second.'],
          teach: 'Factor once, solve many times: the expensive n³ part is shared by every right-hand side.',
          explain: t`The ratio is $${tex(refactor, 3)}/${tex(once, 3)} = ${ans.toFixed(1)}$. In SciPy: \`lu, piv = scipy.linalg.lu_factor(K)\` once, then \`scipy.linalg.lu_solve((lu, piv), f)\` per load case — or pass all load cases as the columns of one matrix.`,
        };
      },
    }),
    code({
      id: 'growth', difficulty: 3,
      prompt: t`Write \`lu_partial(A)\` returning \`(perm, L, U)\` for $PA = LU$ with partial pivoting (\`perm[i]\` is the original row now in row $i$), and \`growth(A)\` returning $\max\lvert u_{ij}\rvert/\max\lvert a_{ij}\rvert$. Then build **Wilkinson’s matrix** \`W(n)\`: 1 on the diagonal, $-1$ everywhere below it, 1 in the last column, 0 elsewhere — and print its growth factor for $n = 5, 10, 20$.`,
      starter: t`import numpy as np

def lu_partial(A):
    A = np.array(A, dtype=float)
    n = len(A)
    U = A.copy()
    L = np.eye(n)
    perm = np.arange(n)
    for k in range(n - 1):
        # 1. find p >= k with the largest |U[p, k]|; swap rows k and p of U,
        #    of perm, and of the multipliers already in L[:, :k]
        # 2. eliminate below the pivot, storing the multipliers in L
        pass
    return perm, L, U

def growth(A):
    perm, L, U = lu_partial(A)
    return np.abs(U).max() / np.abs(np.asarray(A)).max()

def W(n):
    M = np.eye(n) - np.tril(np.ones((n, n)), -1)
    M[:, -1] = 1
    return M

for n in [5, 10, 20]:
    print(n, growth(W(n)))
`,
      answer: t`import numpy as np

def lu_partial(A):
    A = np.array(A, dtype=float)
    n = len(A)
    U = A.copy()
    L = np.eye(n)
    perm = np.arange(n)
    for k in range(n - 1):
        p = k + np.argmax(np.abs(U[k:, k]))
        if p != k:
            U[[k, p]] = U[[p, k]]
            perm[[k, p]] = perm[[p, k]]
            L[[k, p], :k] = L[[p, k], :k]
        for i in range(k + 1, n):
            L[i, k] = U[i, k] / U[k, k]
            U[i, k:] -= L[i, k] * U[k, k:]
    return perm, L, U

def growth(A):
    perm, L, U = lu_partial(A)
    return np.abs(U).max() / np.abs(np.asarray(A)).max()

def W(n):
    M = np.eye(n) - np.tril(np.ones((n, n)), -1)
    M[:, -1] = 1
    return M

for n in [5, 10, 20]:
    print(n, growth(W(n)))`,
      tests: [
        { name: t`$PA = LU$ for the worked example’s matrix`, code: 'np.allclose(np.array([[1,2,2],[4,4,2],[2,6,4]], float)[lu_partial([[1,2,2],[4,4,2],[2,6,4]])[0]], lu_partial([[1,2,2],[4,4,2],[2,6,4]])[1] @ lu_partial([[1,2,2],[4,4,2],[2,6,4]])[2])' },
        { name: t`every multiplier satisfies $\lvert l_{ij}\rvert \le 1$ on a random matrix`, code: 'np.abs(lu_partial(np.random.default_rng(1).standard_normal((8, 8)))[1]).max() <= 1 + 1e-12' },
        { name: t`Wilkinson’s matrix grows by $2^{n-1}$: 512 for $n = 10$`, code: 'abs(growth(W(10)) - 512) < 1e-9' },
      ],
      hints: ['p = k + np.argmax(np.abs(U[k:, k])); swap rows with fancy indexing U[[k, p]] = U[[p, k]].', 'For i below k: L[i, k] = U[i, k] / U[k, k]; U[i, k:] -= L[i, k] * U[k, k:].'],
      teach: 'Partial pivoting bounds the multipliers by 1 but not the growth: Wilkinson’s matrix doubles its last column at every step, ρ = 2ⁿ⁻¹ — an extreme case almost never met in practice.',
      explain: t`The growth factors are $${[5, 10, 20].map((n) => WG(n)).join(',\\ ')}$: exactly $2^{n-1}$, because each elimination step adds the last column to itself. At $n = 54$ that is $2^{53} = 1/u$, and the backward error bound says nothing. Yet decades of experience (and random-matrix theory) show such growth almost never happens; partial pivoting is the default for good reason. Matrices from real problems typically give $\rho$ of order 1 to 10.`,
    }),
    mcq({
      id: 'no-inverse', difficulty: 2,
      prompt: t`A colleague writes \`x = np.linalg.inv(A) @ b\`. Why does every numerical text say to write \`x = np.linalg.solve(A, b)\` instead?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3.2], y: [0, 2.4], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'flops / n³', xticks: 0,
          shade: [{ fn: n12(2 / 3), from: 0.3, to: 1.3, color: 'accent', alpha: 0.6 }, { fn: '2', from: 1.9, to: 2.9, color: 'bad', alpha: 0.6 }],
          points: [{ x: 0.8, y: n12(2 / 3), r: 0, label: 'solve: ⅔n³', labelAlign: 'center', labelDx: 0, labelDy: -12 }, { x: 2.4, y: 2, r: 0, label: 'inv, then @: 2n³', labelAlign: 'center', labelDx: 0, labelDy: -12 }] },
        caption: 'Leading flop counts for one right-hand side (inverting costs 2n³; the solve’s triangular steps are lower order).',
      },
      choices: [
        'Forming A⁻¹ costs about three times as many flops, and x = A⁻¹b is not backward stable: its residual can be about κ(A) times larger than solve’s',
        'inv cannot handle matrices larger than 1000 × 1000',
        'inv returns an approximate inverse, while solve is exact',
        'They give identical results; it is only a matter of style',
      ],
      answer: 0,
      why: {
        1: 'inv handles any size solve does; the issue is cost and accuracy.',
        2: 'Both are computed in floating point; neither is exact. The difference is in how errors propagate.',
        3: 'The flop counts differ by a factor of 3, and for ill-conditioned A the residuals differ by up to a factor κ.',
      },
      hints: ['Count flops: inverting means solving n systems, one per column of the identity.', 'Backward stability means the residual ‖b − Ax̂‖ is about u‖A‖‖x̂‖. Does multiplying by a computed inverse guarantee that?'],
      teach: 'Never invert to solve: LU and two triangular solves are cheaper and backward stable; an explicit inverse is neither.',
      explain: t`\`inv\` does an LU and then $n$ pairs of triangular solves (about $2n^3$ flops); \`solve\` does the LU and one pair ($\tfrac23n^3$). The computed $\hat x = \widehat{A^{-1}}b$ has a forward error comparable to \`solve\`’s, but its residual can be $\kappa(A)$ times larger, so it is not the exact solution of any nearby system. The rule extends: write $A^{-1}B$ in formulas, compute it with \`solve(A, B)\`.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-guidance', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([6, 9, 12]), hz = r.pick([50, 100]), dur = r.pick([300, 600]);
        const steps = hz * dur, perStep = (2 / 3) * n ** 3 + 2 * n * n, once = (2 / 3) * n ** 3 + steps * 2 * n * n, ans = (steps * perStep) / once;
        return {
          prompt: t`A guidance loop solves $Ax = b$ with a fixed $${n}\times${n}$ matrix $A$ (it depends only on the vehicle’s configuration) and a new $b$ every cycle, at $${hz}$ Hz for $${dur}$ s. By what factor does factoring $A$ once before launch reduce the flop count, compared with a full LU solve every cycle? (Use $\tfrac23n^3$ and $2n^2$.)`,
          visual: {
            type: 'graph',
            params: { x: [0, 20.5], y: [0, 20.5 * perStep], aspect: 'wide', axesAt: 'edge', xlabel: 'guidance cycles', ylabel: 'cumulative flops', yticks: 0,
              curves: [{ fn: `${n12(perStep)}*floor(x)`, color: 'bad', width: 2, domain: [0, 20], samples: 2000, label: 'LU every cycle', labelAt: 14, labelDx: -30, labelDy: -14 },
                { fn: `${n12((2 / 3) * n ** 3)} + ${n12(2 * n * n)}*floor(x)`, color: 'accent', width: 2, domain: [0, 20], samples: 2000, label: 'factor once at launch', labelAt: 14, labelDx: 0, labelDy: -14 }] },
            caption: `Cumulative work over the first 20 cycles (n = ${n}): each cycle is a step up.`,
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (n * n * n * 2) / 3 / (2 * n * n), feedback: 'That compares the factorization alone with one solve; the every-cycle strategy also does the two triangular solves.' }].filter((e) => Math.abs(e.value - ans) > 0.011 * ans),
          hints: [t`Cycles: $${hz}\times${dur} = ${steps}$. Every-cycle cost: $\tfrac23n^3 + 2n^2$ each.`, t`Factor once: $\tfrac23n^3 + ${steps}\cdot 2n^2$. Take the ratio.`],
          teach: 'For a fixed matrix, factor once and keep L, U and P: each cycle then costs two triangular solves.',
          explain: t`Per cycle: $${perStep.toFixed(0)}$ against $${2 * n * n}$ flops; over $${steps}$ cycles the ratio is $${ans.toFixed(2)}$ — about $1 + n/3$. On flight computers the stored factors also make the timing deterministic.`,
        };
      },
    }),
    mcq({
      id: 'cp-two-systems', difficulty: 3, transfer: true,
      prompt: t`A spacecraft thermal model produces two linear systems, both solved by LAPACK with partial pivoting. System A has a first entry of $10^{-14}$ (a node with almost no conductance to the first one) but $\kappa \approx 10$. System B has no small entries but $\kappa \approx 10^{12}$ (two nearly redundant radiator couplings). Which answer should you distrust?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3.2], y: [0, 17], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'digits expected', xticks: 0,
          shade: [{ fn: '16', from: 0.3, to: 1.3, color: 'accent', alpha: 0.25 }, { fn: '16', from: 1.9, to: 2.9, color: 'accent', alpha: 0.25 }],
          points: [{ x: 0.8, y: 16, r: 0, label: 'system A: ?', labelAlign: 'center', labelDx: 0, labelDy: -12 }, { x: 2.4, y: 16, r: 0, label: 'system B: ?', labelAlign: 'center', labelDx: 0, labelDy: -12 }] },
        caption: 'Sixteen digits go in; how many come out is the question.',
      },
      choices: [
        'System B: pivoting cures A’s small entry (rows are swapped), but nothing cures conditioning — expect to lose about 12 of 16 digits in B',
        'System A: its tiny first entry makes elimination unstable whatever LAPACK does',
        'Both: any small entry or large κ spoils Gaussian elimination',
        'Neither: LAPACK is backward stable, so both answers are accurate to 16 digits',
      ],
      answer: 0,
      why: {
        1: 'Partial pivoting swaps a larger entry into place; the tiny entry is never used as a pivot.',
        2: 'Small entries are harmless once pivoting moves them; large κ is not harmless for any method.',
        3: 'Backward stability bounds the backward error. The forward error is still about κ times it: 10¹² × 10⁻¹⁶ for B.',
      },
      hints: ['Separate the algorithm’s fault (instability) from the problem’s (conditioning).', 'Forward error ≲ κ × backward error, and backward error ≈ ρu with ρ small under pivoting.'],
      teach: 'Pivoting fixes instability; it cannot fix ill-conditioning. Expect a relative error of about κu from any backward-stable solver.',
      explain: t`For A, pivoting keeps $\rho$ small and $\kappa \approx 10$: about 15 good digits. For B, the backward error is still $\sim u$, but the forward error is $\sim\kappa u \approx 10^{-4}$: only about 4 digits survive. Fix B by rethinking the model (remove the redundancy), not the solver — the subject of [F2.2](#/lesson/st-f.F2.2) and, for least squares, [F8.1](#/lesson/st-f.F8.1).`,
    }),
  ],
  sources: [
    { label: 'Trefethen & Bau (1997), Numerical Linear Algebra, SIAM, Lectures 20–22 (LU, pivoting, stability)', url: 'https://doi.org/10.1137/1.9780898719574' },
    { label: 'Higham (2002), Accuracy and Stability of Numerical Algorithms, 2nd ed., SIAM, ch. 9 (LU factorization and the growth factor)', url: 'https://doi.org/10.1137/1.9780898718027' },
    { label: 'Wilkinson (1961), Error analysis of direct methods of matrix inversion, J. ACM 8, 281', url: 'https://doi.org/10.1145/321075.321076' },
  ],
});
