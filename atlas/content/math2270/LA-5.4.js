// Rank and the four fundamental subspaces: row space, null space, column
// space, left null space; rank–nullity; the perpendicular pairs; a truss's
// mechanisms and self-stresses (Maxwell–Calladine counting).
import { lesson, mcq, multi, num, match, code } from '../../src/core/content.js';
import { tupleTeX, matTeX, stems } from './_la.js';
import { big, shape } from './_spaces.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (k) => String(k).replace(/\d/g, (d) => SUP[d]);
const EX = [[1, 0, 2, 1], [0, 1, -1, 1], [1, 1, 1, 2]];
const DIMNAME = { null: t`\dim N(A)`, left: t`\dim N(A${T})`, row: t`\dim C(A${T})` };

export default lesson({
  id: 'math2270.LA-5.4',
  title: 'Rank and the four fundamental subspaces',
  minutes: 13, difficulty: 3,
  intro: t`An $m\times n$ matrix $A$ of rank $r$ carries four subspaces, two in each of its spaces:

- in $\mathbb R^n$, where inputs live: the **row space** $C(A${T})$ (all combinations of the rows), of dimension $r$, and the **null space** $N(A)$, of dimension $n - r$;
- in $\mathbb R^m$, where outputs live: the **column space** $C(A)$, of dimension $r$, and the **left null space** $N(A${T})$, of dimension $m - r$.

$$\dim C(A) + \dim N(A) = n, \qquad \dim C(A${T}) + \dim N(A${T}) = m$$

The first is the **rank–nullity theorem**: every input direction either survives into the column space or is crushed into the null space. The pairs are **perpendicular**: $A\mathbf x = \mathbf 0$ says every row is perpendicular to $\mathbf x$, so $N(A) \perp C(A${T})$; likewise $N(A${T}) \perp C(A)$. And the row rank equals the column rank — both are $r$.`,
  symbols: [
    { tex: 'r', text: t`the rank: the number of pivots, $\dim C(A) = \dim C(A${T})$` },
    { tex: t`C(A${T})`, text: t`the row space: all combinations of the rows of $A$, in $\mathbb R^n$. Basis: the nonzero rows of the RREF` },
    { tex: 'N(A)', text: t`the null space: all $\mathbf x$ with $A\mathbf x = \mathbf 0$, in $\mathbb R^n$; its dimension $n - r$ is called the nullity` },
    { tex: 'C(A)', text: t`the column space: all $A\mathbf x$, in $\mathbb R^m$. Basis: the pivot columns of $A$` },
    { tex: t`N(A${T})`, text: t`the left null space: all $\mathbf y$ with $A${T}\mathbf y = \mathbf 0$ — equivalently $\mathbf y${T}A = \mathbf 0${T}$, combinations of the rows that cancel to zero. In $\mathbb R^m$` },
    { tex: 'm,\\ n', text: t`the numbers of rows (outputs) and columns (inputs) of $A$` },
  ],
  why: 'Rank–nullity predicts structure before any computation: how many mechanisms and self-stress states a truss has, how many parity checks a redundant sensor array provides, how much freedom a solution set keeps.',
  visual: {
    type: 'la-subspaces',
    title: 'Four subspaces, one bookkeeping rule',
    lead: t`Strang’s “big picture” of $A = \begin{bmatrix} 1 & 2 & 0 & 1 \\ 2 & 4 & 1 & 4 \\ 3 & 6 & 1 & a \end{bmatrix}$ (LA-5.1’s matrix when $a = 5$). On the left, its input space $\mathbb R^4$; on the right, its output space $\mathbb R^3$. Each square’s area is the subspace’s dimension; the exact bases are listed under the picture.`,
    tasks: [
      'At a = 5, row 3 is row 1 + row 2: rank 2. Count: 2 + 2 = 4 on the left and 2 + 1 = 3 on the right.',
      'Move a to 6: the rank jumps to 3. The null space shrinks to a line and the left null space to {0}, while the row and column spaces grow — the sums stay 4 and 3.',
      'Back at a = 5, dot each null-space basis vector with each row-space basis vector: every product is 0. The left null vector is perpendicular to both column-space vectors too.',
    ],
    params: {
      A: [[1, 2, 0, 1], [2, 4, 1, 4], [3, 6, 1, 'a']],
      sliders: [{ key: 'a', label: t`Entry $a$ (row 3, column 4)`, min: 2, max: 8, step: 1, value: 5, explain: t`At $a = 5$ the third row is the sum of the first two; any other value makes the rows independent.` }],
      readout: ['A', 'rank', 'bases'],
    },
    caption: 'A schematic, not to scale: each subspace is a square whose area is proportional to its dimension, and the right angles stand for perpendicular subspaces. A carries the row space onto the column space and sends the null space to 0. The bases listed below are exact.',
  },
  example: {
    prompt: t`Find bases for all four fundamental subspaces of $A = ${matTeX(EX)}$, and check both dimension counts and the perpendicularity.`,
    visual: big(EX, { readout: ['rank'], caption: 'The four subspaces of A, schematically: dimensions 2 and 2 in ℝ⁴, 2 and 1 in ℝ³.' }),
    steps: [
      { label: 'Reduce', text: t`$R_3 - R_1 - R_2$ is a zero row, and rows 1 and 2 are already reduced: $R = ${matTeX([[1, 0, 2, 1], [0, 1, -1, 1], [0, 0, 0, 0]])}$, so $r = 2$, pivots in columns 1 and 2.` },
      { label: 'Column space', text: t`Pivot columns of $A$: $(1, 0, 1)$ and $(0, 1, 1)$. A plane in $\mathbb R^3$, dimension $r = 2$.` },
      { label: 'Row space', text: t`Row operations combine rows, so they keep the row space: the nonzero rows of $R$, $(1, 0, 2, 1)$ and $(0, 1, -1, 1)$, are a basis. Dimension $r = 2$ — the same as the column space.` },
      { label: 'Null space', text: t`Free $x_3$ and $x_4$ give the special solutions $(-2, 1, 1, 0)$ and $(-1, -1, 0, 1)$. Dimension $n - r = 4 - 2 = 2$.` },
      { label: 'Left null space', text: t`Row 3 = row 1 + row 2, so $1\cdot(\text{row }1) + 1\cdot(\text{row }2) - 1\cdot(\text{row }3) = \mathbf 0$: $\mathbf y = (1, 1, -1)$ has $\mathbf y${T}A = \mathbf 0${T}$. Dimension $m - r = 3 - 2 = 1$.` },
      { label: 'Check', text: t`Counts: $2 + 2 = 4 = n$ and $2 + 1 = 3 = m$ ✓. Perpendicular: $(1, 0, 2, 1)\cdot(-2, 1, 1, 0) = -2 + 2 = 0$, and so on for all four pairs ✓; $(1, 0, 1)\cdot(1, 1, -1) = 0$ and $(0, 1, 1)\cdot(1, 1, -1) = 0$ ✓.` },
    ],
    answer: t`$C(A)$: $(1, 0, 1), (0, 1, 1)$. $C(A${T})$: $(1, 0, 2, 1), (0, 1, -1, 1)$. $N(A)$: $(-2, 1, 1, 0), (-1, -1, 0, 1)$. $N(A${T})$: $(1, 1, -1)$. Dimensions $2 + 2 = 4$ and $2 + 1 = 3$.`,
  },
  practice: [
    num({
      id: 'dims-from-rank', difficulty: 1,
      gen(r) {
        const [m, n, rk] = r.pick([[5, 7, 3], [3, 5, 2], [4, 6, 2], [6, 4, 3], [4, 9, 3], [7, 5, 4]]), ask = r.pick(['null', 'left', 'row']);
        const ans = ask === 'null' ? n - rk : ask === 'left' ? m - rk : rk;
        const errs = ask === 'null' ? [{ value: m - rk, feedback: t`That is $m - r$, the left null space. $N(A)$ sits among the $n = ${n}$ inputs: $n - r$.` }]
          : ask === 'left' ? [{ value: n - rk, feedback: t`That is $n - r$, the null space. $N(A${T})$ sits among the $m = ${m}$ outputs: $m - r$.` }]
            : [{ value: n - rk, feedback: t`That is the null space’s dimension. The row space has dimension $r$, like the column space.` }];
        return {
          prompt: t`A $${m}\times${n}$ matrix $A$ has rank $${rk}$. What is $${DIMNAME[ask]}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 }, errors: errs.filter((e) => e.value !== ans),
          hints: [t`$A$ has $m = ${m}$ rows and $n = ${n}$ columns. Which space does this subspace live in?`, t`$\dim C(A${T}) = r$, $\dim N(A) = n - r$, $\dim N(A${T}) = m - r$.`],
          teach: 'For an m × n matrix of rank r: row space and column space have dimension r, the null space n − r, the left null space m − r.',
          explain: t`$${DIMNAME[ask]} = ${ask === 'null' ? `${n} - ${rk}` : ask === 'left' ? `${m} - ${rk}` : rk} = ${ans}$. All four: $C(A${T})$ and $C(A)$ have dimension ${rk}, $N(A)$ has ${n - rk}, $N(A${T})$ has ${m - rk}; and $${rk} + ${n - rk} = ${n}$, $${rk} + ${m - rk} = ${m}$.`,
          visual: shape(m, n, rk, { hide: [ask], caption: `The ${m} × ${n} matrix’s four subspaces as squares of area proportional to dimension; the one asked about is dashed and marked “?”. Schematic.` }),
        };
      },
    }),
    match({
      id: 'which-space', difficulty: 2,
      prompt: t`Match each subspace of an $m\times n$ matrix $A$ with its description.`,
      left: [t`$C(A)$`, t`$N(A)$`, t`$C(A${T})$`, t`$N(A${T})$`],
      right: ['every b for which Ax = b has a solution', 'every x with Ax = 0', 'every combination of the rows of A', 'row weights that combine to zero', 'every x with Ax = b (b ≠ 0)'],
      answer: [0, 1, 2, 3],
      hints: [t`$C$ stands for “column space of”: $C(A${T})$ is the column space of $A${T}$, whose columns are the rows of $A$.`, t`$N(A${T})$ holds $\mathbf y$ with $A${T}\mathbf y = \mathbf 0$, which is $\mathbf y${T}A = \mathbf 0${T}$: weights on the rows that cancel.`],
      teach: 'C(A) and N(Aᵀ) live among the outputs, ℝᵐ; C(Aᵀ) and N(A) among the inputs, ℝⁿ.',
      explain: t`$C(A)$: the reachable right-hand sides. $N(A)$: the inputs crushed to $\mathbf 0$. $C(A${T})$: the row space. $N(A${T})$: row combinations that vanish — each one is a consistency condition on $\mathbf b$. The leftover description, the solutions of $A\mathbf x = \mathbf b$ with $\mathbf b \ne \mathbf 0$, is not a subspace at all: it misses $\mathbf 0$ (it is $N(A)$ shifted by one particular solution).`,
      visual: shape(3, 4, 2, { caption: 'The four subspaces of a 3 × 4 matrix of rank 2, schematically.' }),
    }),
    num({
      id: 'left-null', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const r1 = [1, r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], r2 = [0, 1, r.int(-2, 2), r.int(-2, 2)];
          const a = r.intExcept(-2, 3, [0]), b = r.intExcept(-2, 2, [0]), ask = r.int(0, 1);
          const r3 = r1.map((x, i) => a * x + b * r2[i]);
          if (Math.max(...r3.map(Math.abs)) > 8) continue;
          const ans = ask === 0 ? a : b;
          return {
            prompt: t`The rows of $A = ${matTeX([r1, r2, r3])}$ are dependent, so the left null space is not $\{\mathbf 0\}$. Find the vector $\mathbf y = (y_1, y_2, -1)$ with $\mathbf y${T}A = \mathbf 0${T}$. What is $y_${ask + 1}$?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: -ans, feedback: t`Sign: $\mathbf y${T}A = y_1(\text{row }1) + y_2(\text{row }2) - (\text{row }3)$ must vanish, so $y_1$ and $y_2$ are the weights that *build* row 3.` }],
            hints: [t`$\mathbf y${T}A = y_1(\text{row }1) + y_2(\text{row }2) - (\text{row }3)$. Set it to zero: row 3 $= y_1(\text{row }1) + y_2(\text{row }2)$.`, t`The first two components of the rows give $y_1$ and $y_2$ directly (rows 1 and 2 start $1, \ast$ and $0, 1$).`],
            teach: 'A vector in the left null space lists weights on the rows that cancel to zero — a dependence among the rows.',
            explain: t`Row 3 $= ${a}(\text{row }1) + (${b})(\text{row }2)$, so $\mathbf y = (${a}, ${b}, -1)$ and $\mathbf y${T}A = \mathbf 0${T}$. It spans $N(A${T})$, which has dimension $3 - 2 = 1$. Consequence: $A\mathbf x = \mathbf b$ is solvable only when $\mathbf y\cdot\mathbf b = 0$, i.e. $b_3 = ${a}b_1 + (${b})b_2$.`,
            visual: stems([['row 1', r1, 'accent'], ['row 2', r2, 'warn'], ['row 3', r3, 'good']], { caption: 'The three rows of A as stem plots, component by component.' }),
          };
        }
        return { prompt: t`Rows $(1, 0)$, $(0, 1)$, $(2, 3)$. $\mathbf y = (y_1, y_2, -1)$ with $\mathbf y${T}A = \mathbf 0${T}$: $y_1$?`, answer: 2, hints: ['Row 3 = 2 row 1 + 3 row 2.'], teach: 'Weights on rows.', explain: t`$y_1 = 2$.` };
      },
    }),
    mcq({
      id: 'perpendicular', difficulty: 2,
      prompt: t`$A$ is the $1\times3$ matrix $\begin{bmatrix} 1 & 2 & -1 \end{bmatrix}$. Which describes its null space and row space in $\mathbb R^3$?`,
      choices: [t`$N(A)$ is the plane $x + 2y - z = 0$; $C(A${T})$ is the line along $(1, 2, -1)$, perpendicular to that plane`, t`$N(A)$ is the line along $(1, 2, -1)$; $C(A${T})$ is the plane $x + 2y - z = 0$`, t`Both are the plane $x + 2y - z = 0$`, t`$N(A)$ is the plane $x + 2y - z = 0$; $C(A${T})$ is all of $\mathbb R^3$`],
      answer: 0,
      why: {
        1: t`Swapped. $A(1, 2, -1) = 1 + 4 + 1 = 6 \ne 0$, so the row direction is *not* in the null space; the null space is everything perpendicular to it.`,
        2: 'The row space and the null space meet only at 0: they are perpendicular, and here their dimensions are 1 and 2.',
        3: t`One row spans a line, so $\dim C(A${T}) = r = 1$, not 3. Check: $1 + 2 = 3 = n$.`,
      },
      hints: [t`$A\mathbf x = \mathbf 0$ is the single equation $x + 2y - z = 0$.`, t`The row space is all multiples of the one row, $(1, 2, -1)$.`],
      teach: 'N(A) is exactly the set of vectors perpendicular to every row, so the null space and row space are perpendicular, with dimensions adding to n.',
      explain: t`$A\mathbf x = (1, 2, -1)\cdot\mathbf x = 0$: the null space is the plane perpendicular to the row, and the row space is the line along it. Dimensions $2 + 1 = 3$, and the two meet only at $\mathbf 0$. Every $\mathbf x$ splits uniquely into a row-space part and a null-space part; $A$ only “sees” the row-space part.`,
      visual: { type: 'calc-vectors3d', params: { range: 2.4, planes: [{ normal: [1, 2, -1], d: 0, size: 2.2, color: 'warn', alpha: 0.18 }], lines: [{ point: [0, 0, 0], dir: [1, 2, -1], t: [-0.8, 0.8], color: 'accent' }], vectors: [{ to: [0.5, 1, -0.5], color: 'accent', label: t`(1, 2, -1)/2` }] }, caption: 'The line along the row (1, 2, −1) and the plane x + 2y − z = 0 through the origin. Drag to rotate — the line stands perpendicular to the plane.' },
    }),
    mcq({
      id: 'rank-rows', difficulty: 2,
      prompt: t`A $4\times9$ matrix has exactly 3 independent rows (and no more). How many independent columns does it have?`,
      choices: ['3', '6', '4', '9'],
      answer: 0,
      why: {
        1: t`$9 - 3 = 6$ is $\dim N(A)$, the free columns. The independent columns are the pivot columns.`,
        2: 'Four is the number of rows, but only 3 of them are independent.',
        3: t`Nine columns in $\mathbb R^4$ cannot all be independent: at most 4 can be.`,
      },
      hints: ['The number of independent rows is the rank r.', 'Row rank equals column rank.'],
      teach: 'Row rank = column rank: the number of independent rows always equals the number of independent columns, the rank r.',
      explain: t`3 independent rows means rank 3, so $\dim C(A) = \dim C(A${T}) = 3$: exactly 3 independent columns (the pivot columns). The other 6 columns are combinations of them, matching $\dim N(A) = 9 - 3 = 6$. That row rank equals column rank is not obvious — elimination shows it, since each pivot sits in one row and one column.`,
      visual: shape(4, 9, 3, { hide: ['col'], caption: 'The 4 × 9 matrix’s four subspaces, schematically. The column space’s dimension is hidden.' }),
    }),
    num({
      id: 'consistency', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const r1 = [1, r.int(-2, 2), r.int(-2, 2)], r2 = [0, 1, r.int(-2, 2)], a = r.intExcept(-2, 2, [0]), b = r.intExcept(-2, 2, [0]);
          const r3 = r1.map((x, i) => a * x + b * r2[i]), b1 = r.intExcept(-4, 4, [0]), b2 = r.intExcept(-4, 4, [0]);
          const ans = a * b1 + b * b2;
          if (ans === 0 || Math.max(...r3.map(Math.abs)) > 7) continue;
          return {
            prompt: t`For which $b_3$ does $${matTeX([r1, r2, r3])}\mathbf x = (${b1}, ${b2}, b_3)$ have a solution?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            hints: [t`Find the left null space first: which combination of the rows is zero?`, t`Row 3 $= ${a}(\text{row }1) + (${b})(\text{row }2)$, so $\mathbf y = (${a}, ${b}, -1)$ spans $N(A${T})$. $\mathbf b$ is in $C(A)$ exactly when $\mathbf y\cdot\mathbf b = 0$.`],
            teach: 'Ax = b is solvable exactly when b is perpendicular to the left null space: each dependence among the rows must hold among the entries of b too.',
            explain: t`$\mathbf y = (${a}, ${b}, -1)$ spans $N(A${T})$, and $C(A) \perp N(A${T})$, so $\mathbf b$ must satisfy $${a}b_1 + (${b})b_2 - b_3 = 0$: $b_3 = ${a}(${b1}) + (${b})(${b2}) = ${ans}$. Otherwise elimination ends with the row $0 = $ (something nonzero).`,
            visual: big([r1, r2, r3], { readout: ['A'], caption: 'The matrix’s four subspaces. b must lie in the column space, perpendicular to the left null space. Schematic.' }),
          };
        }
        return { prompt: t`For which $b_3$ is $\begin{bmatrix} 1 & 0 \\ 0 & 1 \\ 1 & 1 \end{bmatrix}\mathbf x = (1, 2, b_3)$ solvable?`, answer: 3, hints: ['Row 3 = row 1 + row 2.'], teach: 'Left null space condition.', explain: t`$b_3 = 3$.` };
      },
    }),
    code({
      id: 'four-subspaces', difficulty: 2,
      prompt: t`Use SymPy to find all four fundamental subspaces of the $3\times5$ matrix \`A\` below. Set \`r\` to its rank (\`A.rank()\`), \`N\` to a basis of its null space (\`A.nullspace()\`), \`LN\` to a basis of its left null space (the null space of \`A.T\`), \`C\` to a basis of its column space (\`A.columnspace()\`) and \`Row\` to a basis of its row space (\`A.rowspace()\`). The tests check rank–nullity and the perpendicularity.`,
      starter: t`from sympy import Matrix

A = Matrix([[1, 2, 0, 1, 3],
            [2, 4, 1, 4, 7],
            [3, 6, 1, 5, 10]])

r = None      # TODO: the rank
N = None      # TODO: basis of the null space N(A)
LN = None     # TODO: basis of the left null space N(A^T)
C = None      # TODO: basis of the column space C(A)
Row = None    # TODO: basis of the row space C(A^T)

print(r, len(N or []), len(LN or []))
`,
      answer: t`from sympy import Matrix

A = Matrix([[1, 2, 0, 1, 3],
            [2, 4, 1, 4, 7],
            [3, 6, 1, 5, 10]])

r = A.rank()
N = A.nullspace()
LN = A.T.nullspace()
C = A.columnspace()
Row = A.rowspace()

print(r, len(N), len(LN))
`,
      tests: [
        { name: 'the rank is 2', code: 'r == 2' },
        { name: 'rank–nullity: r + dim N(A) = 5 columns', code: 'len(N) == 3 and r + len(N) == A.cols' },
        { name: 'r + dim N(Aᵀ) = 3 rows', code: 'len(LN) == 1 and r + len(LN) == A.rows' },
        { name: 'column space and row space both have dimension r', code: 'len(C) == r and len(Row) == r' },
        { name: 'every null-space vector is perpendicular to every row-space vector', code: 'all((row * n)[0] == 0 for row in Row for n in N)' },
        { name: 'the left null vector is perpendicular to the column space', code: 'all((y.T * c)[0] == 0 for y in LN for c in C)' },
      ],
      hints: [t`\`A.T\` is the transpose, so \`A.T.nullspace()\` is the left null space.`, t`\`A.rowspace()\` returns rows (1 × 5 matrices); a row times a column \`row * n\` is a 1 × 1 matrix whose entry is the dot product.`],
      teach: 'SymPy computes all four subspaces exactly, so the dimension counts and the right angles can be checked rather than taken on trust.',
      explain: t`Row 3 is row 1 + row 2, so $r = 2$; then $\dim N(A) = 5 - 2 = 3$ and $\dim N(A${T}) = 3 - 2 = 1$, with \`LN\` spanned by $(-1, -1, 1)$ (or a multiple). Each null-space vector solves $A\mathbf x = \mathbf 0$, which is exactly the statement that it is perpendicular to every row.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dims', difficulty: 2,
      gen(r) {
        const [m, n, rk] = r.pick([[5, 7, 3], [6, 4, 2], [8, 5, 3], [4, 10, 4], [7, 9, 5]]);
        return {
          prompt: t`A $${m}\times${n}$ matrix has rank $${rk}$. What is the dimension of its left null space $N(A${T})$?`,
          answer: m - rk, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n - rk, feedback: t`That is $\dim N(A) = n - r$. The left null space lives in $\mathbb R^m$, among the ${m} rows’ weights.` }].filter((e) => e.value !== m - rk),
          hints: [t`$N(A${T})$ is the null space of the $${n}\times${m}$ matrix $A${T}$.`],
          teach: 'dim N(Aᵀ) = m − r: the number of independent dependences among the rows.',
          explain: t`$A${T}$ is $${n}\times${m}$ with the same rank ${rk}, so its null space has dimension $${m} - ${rk} = ${m - rk}$.`,
          visual: shape(m, n, rk, { hide: ['left'], caption: `The ${m} × ${n} matrix’s four subspaces, schematically; the left null space is marked “?”.` }),
        };
      },
    }),
    multi({
      id: 'cp-always', difficulty: 2,
      prompt: t`Which statements hold for **every** matrix $A$?`,
      choices: [t`$\dim C(A) = \dim C(A${T})$`, t`Every vector in $N(A)$ is perpendicular to every vector in $C(A${T})$`, t`$\dim N(A) = \dim N(A${T})$`, t`$C(A) = C(A${T})$`],
      answer: [0, 1],
      why: {
        2: t`Only for square matrices: $\dim N(A) = n - r$ but $\dim N(A${T}) = m - r$. In the picture, a $3\times5$ matrix of rank 2 has 3 and 1.`,
        3: t`They usually live in different spaces — $\mathbb R^m$ and $\mathbb R^n$ — and even for square matrices they differ unless $A$ is special (symmetric, for instance).`,
      },
      hints: ['Row rank equals column rank. And Ax = 0 means x is perpendicular to every row.'],
      teach: 'Always: row rank = column rank, N(A) ⊥ C(Aᵀ) and N(Aᵀ) ⊥ C(A). The null spaces have equal dimensions only when the matrix is square.',
      explain: t`The ranks of $A$ and $A${T}$ agree, and $A\mathbf x = \mathbf 0$ says $\mathbf x$ is perpendicular to every row. The other two fail for most matrices: a $3\times5$ matrix of rank 2 has $\dim N(A) = 3$ but $\dim N(A${T}) = 1$.`,
      visual: shape(3, 5, 2, { caption: 'A 3 × 5 matrix of rank 2: null space of dimension 3, left null space of dimension 1. Schematic.' }),
    }),
    num({
      id: 'cp-truss', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const d = r.pick([4, 6, 8]), b = r.int(3, 9), rk = r.int(Math.max(2, Math.min(d, b) - 2), Math.min(d, b)), ask = r.pick(['left', 'null']);
          const mech = d - rk, self = b - rk, ans = ask === 'left' ? mech : self;
          if (ans === 0) continue;
          return {
            prompt: t`A plane pin-jointed frame has ${d / 2} free joints, so $d = ${d}$ joint displacement components, and $b = ${b}$ bars. Its **equilibrium matrix** $A$ ($${d}\times${b}$) sends the bar tensions $\mathbf t$ to the forces they exert on the joints: $A\mathbf t = \mathbf f$. Its rank is $${rk}$. A **self-stress** is a set of tensions with no net force on any joint ($A\mathbf t = \mathbf 0$); a **mechanism** is a joint motion that stretches no bar, a vector of $N(A${T})$ (because $A${T}$ is the compatibility matrix of LA-5.1). How many independent ${ask === 'left' ? 'mechanisms' : 'self-stress states'} does the frame have?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: ask === 'left' ? self : mech, feedback: ask === 'left' ? t`That is $b - r$, the self-stresses ($N(A)$, among the bar tensions). Mechanisms live among the joint motions: $d - r$.` : t`That is $d - r$, the mechanisms ($N(A${T})$). Self-stresses live among the bar tensions: $b - r$.` }].filter((e) => e.value !== ans),
            hints: [t`Self-stresses are $N(A)$, in $\mathbb R^b$ (one entry per bar); mechanisms are $N(A${T})$, in $\mathbb R^d$ (one entry per displacement component).`, t`$\dim N(A) = b - r$ and $\dim N(A${T}) = d - r$.`],
            teach: 'For a truss, the four subspaces have names: self-stresses N(A), mechanisms N(Aᵀ), loads it can carry C(A), compatible stretches C(Aᵀ) — and rank–nullity counts them.',
            explain: t`${ask === 'left' ? t`Mechanisms: $d - r = ${d} - ${rk} = ${mech}$.` : t`Self-stresses: $b - r = ${b} - ${rk} = ${self}$.`} Subtracting the two counts, $s - m = (b - r) - (d - r) = b - d = ${b - d}$ whatever the rank: Maxwell’s 1864 counting rule, in the form Calladine gave it in 1978. A frame with a mechanism can flop (here only to first order: a real finite motion may be blocked); a frame with self-stress can hold locked-in tensions with no load at all, which is how tensegrity structures and pre-tensioned cable nets stay stiff.`,
            visual: shape(d, b, rk, { hide: [ask], names: { row: 'stretches', null: 'self-stresses', col: 'loads carried', left: 'mechanisms' }, titles: [`ℝ${sup(b)}: bar tensions`, `ℝ${sup(d)}: joint forces`], caption: 'The equilibrium matrix’s four subspaces under their structural names. Schematic: square areas ∝ dimensions; the one asked about is marked “?”.' }),
          };
        }
        return { prompt: t`A frame has $d = 4$, $b = 3$ and rank 3. Mechanisms?`, answer: 1, hints: ['d − r.'], teach: 'Count.', explain: t`$4 - 3 = 1$.` };
      },
    }),
  ],
  sources: [
    { label: 'Strang, “The fundamental theorem of linear algebra”, Amer. Math. Monthly 100 (1993) 848–855', url: 'https://doi.org/10.2307/2324660' },
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §3.5 and §4.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Pellegrino & Calladine, “Matrix analysis of statically and kinematically indeterminate frameworks”, Int. J. Solids Struct. 22 (1986)', url: 'https://doi.org/10.1016/0020-7683(86)90082-9' },
  ],
});
