// Computing determinants: the three rules (row operations), triangular
// matrices, elimination, and cofactor expansion along any row or column.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { det3, matTeX, tupleTeX, qt } from './_la.js';
import { board, detPic, minor, cofactor, minorMat } from './_eig.js';

const t = String.raw;
const ORD = ['first', 'second', 'third'];
const sgn = (i, j) => ((i + j) % 2 ? '-' : '+');

// rows of the Explore box, as expressions of the sliders k (shear), s (scale) and the toggle sw (swap)
const R1 = ['2', '0', '0'], R2 = ['0.5 + 2*k', '1.5', '0'], R3 = ['0.5*s', '0.5*s', '1.5*s'];
const mix = (a, b) => a.map((x, i) => `(sw*(${b[i]}) + (1 - sw)*(${x}))`);
const r1 = mix(R1, R2), r2 = mix(R2, R1), r3 = R3;
const plus = (...vs) => vs[0].map((_, i) => vs.map((v) => `(${v[i]})`).join(' + '));
const O = ['0', '0', '0'];
const tripleExpr = (a, b, c) => `(${a[0]})*((${b[1]})*(${c[2]}) - (${b[2]})*(${c[1]})) - (${a[1]})*((${b[0]})*(${c[2]}) - (${b[2]})*(${c[0]})) + (${a[2]})*((${b[0]})*(${c[1]}) - (${b[1]})*(${c[0]}))`;
const faces = [[O, r1, r2], [r3, r1, r2], [O, r1, r3], [r2, r1, r3], [O, r2, r3], [r1, r2, r3]].map(([at, u, v]) => ({ at, u, v, color: 'accent', alpha: 0.13 }));

// a 3×3 integer matrix whose row or column `line` has two zeros (the sparse line)
function sparse(r, { byCol = r.bool(0.5) } = {}) {
  for (let k = 0; k < 500; k++) {
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 4)));
    const line = r.int(0, 2), keep = r.int(0, 2);
    for (let m = 0; m < 3; m++) {
      if (m === keep) { if (byCol) A[m][line] = r.intExcept(-4, 4, [0]); else A[line][m] = r.intExcept(-4, 4, [0]); }
      else if (byCol) A[m][line] = 0; else A[line][m] = 0;
    }
    const D = det3(A);
    if (D === 0 || Math.abs(D) > 60) continue;
    if (A.flat().filter((v) => v === 0).length > 4) continue;
    return { A, line, keep, byCol, D };
  }
  return { A: [[2, 0, 1], [3, -1, 4], [1, 0, 5]], line: 1, keep: 1, byCol: true, D: -9 };
}

export default lesson({
  id: 'math2270.LA-8.2',
  title: 'Computing determinants and cofactors',
  minutes: 13, difficulty: 3,
  intro: t`Three rules pin the determinant down completely: $\det I = 1$; **swapping two rows flips the sign**; and the determinant is linear in each row — so **multiplying a row by $c$ multiplies $\det A$ by $c$**, and **adding a multiple of one row to another changes nothing** (a shear keeps volume). From these, a triangular matrix has $\det$ = the product of its diagonal, and elimination computes any determinant: $\det A = \pm$ (product of the pivots), with one minus sign per row swap. By hand, small or sparse matrices are quicker by **cofactor expansion** along any row $i$ (or any column):
$$\det A = a_{i1}C_{i1} + a_{i2}C_{i2} + \dots + a_{in}C_{in}, \qquad C_{ij} = (-1)^{i+j}M_{ij}$$
Since $\det A^{\mathsf T} = \det A$, everything said about rows holds for columns too.`,
  symbols: [
    { tex: t`a_{ij}`, text: t`the entry of $A$ in row $i$, column $j$` },
    { tex: t`M_{ij}`, text: t`the **minor**: the determinant of the $(n-1)\times(n-1)$ matrix left when row $i$ and column $j$ are deleted` },
    { tex: t`C_{ij}`, text: t`the **cofactor**: the minor with the checkerboard sign $(-1)^{i+j}$ — $+$ on the diagonal, alternating outward` },
    { tex: t`(-1)^{i+j}`, text: t`$+1$ when $i + j$ is even, $-1$ when it is odd: the pattern $\begin{smallmatrix} + & - & + \\ - & + & - \\ + & - & + \end{smallmatrix}$` },
    { tex: 'n', text: t`the size of the square matrix $A$ ($n\times n$)` },
  ],
  why: 'Cofactor expansion turns a 3×3 into three 2×2s by hand, but it needs about n! multiplications; elimination needs about n³/3 — which is why every computer, and every careful human with a big matrix, uses elimination.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Row operations and the volume of a box',
    lead: t`The three rows of $A = \begin{bmatrix} 2 & 0 & 0 \\ 0.5 & 1.5 & 0 \\ 0.5 & 0.5 & 1.5 \end{bmatrix}$ are the edges of the box; its signed volume is $\det A = 2\times1.5\times1.5 = 4.5$ (the matrix is triangular). Apply row operations and watch the readout.`,
    tasks: [
      'Slide k (R₂ ← R₂ + kR₁): the box shears sideways, but its volume — the determinant — stays 4.5.',
      'Slide s (R₃ ← sR₃): the volume scales by s; at s = 0 the box is flat; for s < 0 the determinant is negative.',
      'Tick “swap rows 1 and 2”: the same box, the same volume — but the determinant changes sign.',
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'k', label: t`Add $k\times$ row 1 to row 2`, min: -1.5, max: 1.5, step: 0.25, value: 0, explain: t`$R_2 \leftarrow R_2 + kR_1$: a shear of the box.` },
        { key: 's', label: t`Multiply row 3 by $s$`, min: -1.5, max: 2, step: 0.25, value: 1, explain: t`$R_3 \leftarrow sR_3$: stretches the box along its third edge.` },
      ],
      toggles: [{ key: 'sw', label: 'Swap rows 1 and 2', value: false, explain: t`$R_1 \leftrightarrow R_2$: the same three edges, listed in a different order.` }],
      vectors: [{ to: r1, color: 'good', label: t`\text{row }1` }, { to: r2, color: 'warn', label: t`\text{row }2` }, { to: r3, color: 'violet', label: t`\text{row }3` }],
      parallelograms: faces,
      readouts: [{ label: t`$\det A$`, expr: tripleExpr(r1, r2, r3), digits: 3 }],
    },
    caption: 'The box on the three rows of A (faces tinted). Its volume is |det A|; the sign says whether rows 1, 2, 3 form a right-handed set. Drag to rotate.',
  },
  example: {
    prompt: t`Find $\det A$ for $A = ${matTeX([[2, 0, 1], [3, -1, 4], [1, 0, 5]])}$, then check by elimination.`,
    visual: board([[2, 0, 1], [3, -1, 4], [1, 0, 5]], { cross: [1, 1], signs: true, caption: 'Column 2 has two zeros, so expand down it. Deleting row 2 and column 2 (shaded) leaves the minor M₂₂. Small signs: the cofactor checkerboard.' }),
    steps: [
      { label: 'Choose a line', text: t`Column 2 is $(0, -1, 0)$: two zeros. Expanding down it, only $a_{22} = -1$ contributes: $\det A = a_{22}C_{22}$.` },
      { label: 'The cofactor', text: t`Delete row 2 and column 2: $M_{22} = \det${matTeX([[2, 1], [1, 5]])} = 10 - 1 = 9$. The sign is $(-1)^{2+2} = +$, so $C_{22} = 9$.` },
      { label: 'Multiply', text: t`$\det A = (-1)(9) = -9$.` },
      { label: 'Check by elimination', text: t`$R_2 \leftarrow R_2 - \tfrac32R_1$ and $R_3 \leftarrow R_3 - \tfrac12R_1$ give $\begin{bmatrix} 2 & 0 & 1 \\ 0 & -1 & 2.5 \\ 0 & 0 & 4.5 \end{bmatrix}$ — no swaps, and these operations do not change $\det$. Triangular: $2\cdot(-1)\cdot4.5 = -9$. ✓` },
      { label: 'Which to use', text: t`Cofactors win when a row or column is mostly zeros. Otherwise eliminate: for a $10\times10$, expansion needs about $10! \approx 3.6$ million products; elimination about 330.` },
    ],
    answer: t`$\det A = -9$.`,
  },
  practice: [
    num({
      id: 'triangular', difficulty: 1,
      gen(r) {
        const d = [r.intExcept(-3, 4, [0, 1]), r.intExcept(-3, 4, [0, 1]), r.intExcept(-3, 4, [0])];
        const up = r.bool(0.5), A = [0, 1, 2].map((i) => [0, 1, 2].map((j) => (i === j ? d[i] : (up ? j > i : j < i) ? r.int(-5, 6) : 0)));
        const D = d[0] * d[1] * d[2], tr = d[0] + d[1] + d[2];
        return {
          prompt: t`Find $\det${matTeX(A)}$.`,
          answer: D, tol: { rel: 0, abs: 0.01 },
          errors: tr !== D && tr !== -D ? [{ value: tr, feedback: 'That is the sum of the diagonal (the trace). For a triangular matrix the determinant is the product.' }] : [],
          hints: [`The matrix is ${up ? 'upper' : 'lower'} triangular: every entry on one side of the diagonal is zero.`, t`Expand along the ${up ? 'first column' : 'first row'} again and again: only diagonal entries survive.`],
          teach: 'The determinant of a triangular matrix is the product of its diagonal entries.',
          explain: t`$${d[0]}\cdot(${d[1]})\cdot(${d[2]}) = ${D}$. The off-diagonal entries do not matter — geometrically they only shear the box.`,
          visual: board(A, { caption: 'The matrix: zeros fill one side of the diagonal.' }),
        };
      },
    }),
    num({
      id: 'cofactor', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 5)));
          const [i, j] = r.pick([[0, 1], [1, 0], [1, 2], [2, 1], [0, 0], [1, 1], [0, 2]]);
          const M = minor(A, i, j), C = cofactor(A, i, j);
          if (M === 0 || ((i + j) % 2 === 0 && r.bool(0.6))) continue;          // mostly the minus-sign places
          const sub = minorMat(A, i, j);
          return {
            prompt: t`For $A = ${matTeX(A)}$, find the cofactor $C_{${i + 1}${j + 1}}$.`,
            answer: C, tol: { rel: 0, abs: 0.01 },
            errors: C !== M ? [{ value: M, feedback: t`That is the minor $M_{${i + 1}${j + 1}}$. The cofactor carries the sign $(-1)^{${i + 1}+${j + 1}} = ${(i + j) % 2 ? '-1' : '+1'}$.` }] : [],
            hints: [t`Delete row ${i + 1} and column ${j + 1}: the minor is $\det${matTeX(sub)}$.`, t`Then apply the checkerboard sign: position $(${i + 1}, ${j + 1})$ has $(-1)^{${i + j + 2}} = ${sgn(i, j)}1$.`],
            teach: t`A cofactor is a minor times the checkerboard sign $(-1)^{i+j}$.`,
            explain: t`$M_{${i + 1}${j + 1}} = \det${matTeX(sub)} = ${M}$ and $C_{${i + 1}${j + 1}} = (-1)^{${i + j + 2}}\cdot${M < 0 ? `(${M})` : M} = ${C}$.`,
            visual: board(A, { cross: [i, j], signs: true, caption: `Row ${i + 1} and column ${j + 1} shaded: what is left is the minor. Small signs: the checkerboard.` }),
          };
        }
        return { prompt: t`For $A = ${matTeX([[1, 2, 3], [4, 5, 6], [7, 8, 10]])}$, find $C_{12}$.`, answer: 2, hints: ['M₁₂ = 40 − 42 = −2.', 'The sign at (1, 2) is −.'], teach: 'Cofactor = sign × minor.', explain: t`$C_{12} = -(-2) = 2$.` };
      },
    }),
    num({
      id: 'expand-sparse', difficulty: 2,
      gen(r) {
        const { A, line, keep, byCol, D } = sparse(r);
        const [i, j] = byCol ? [keep, line] : [line, keep];
        const a = A[i][j], M = minor(A, i, j);
        return {
          prompt: t`Find $\det${matTeX(A)}$.`,
          answer: D, tol: { rel: 0, abs: 0.01 },
          errors: a * M !== D ? [{ value: a * M, feedback: t`Right entry and minor, but the cofactor sign at $(${i + 1}, ${j + 1})$ is $(-1)^{${i + j + 2}} = -1$.` }] : [],
          hints: [t`${byCol ? 'Column' : 'Row'} ${line + 1} has two zeros: expand along it, and only one term survives.`, t`That term is $a_{${i + 1}${j + 1}}C_{${i + 1}${j + 1}} = (${a})\cdot(${sgn(i, j)}1)\cdot M_{${i + 1}${j + 1}}$.`],
          teach: 'Expand along the row or column with the most zeros: each zero kills a whole term.',
          explain: t`Along ${byCol ? 'column' : 'row'} ${line + 1}: $\det A = (${a})\cdot(${sgn(i, j)}1)\cdot\det${matTeX(minorMat(A, i, j))} = (${a})(${sgn(i, j)}1)(${M}) = ${D}$.`,
          visual: board(A, { ring: [[i, j]], caption: `The matrix, with the one nonzero entry of ${byCol ? 'column' : 'row'} ${line + 1} ringed.` }),
        };
      },
    }),
    num({
      id: 'by-elimination', difficulty: 2,
      gen(r) {
        const d = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 4, [0]), r.intExcept(-3, 4, [0])];
        const U = [[d[0], r.int(-3, 4), r.int(-3, 4)], [0, d[1], r.int(-3, 4)], [0, 0, d[2]]];
        const swaps = r.pick([0, 1, 2]), f = r.pick([2, 3, 0.5]);
        const dU = d[0] * d[1] * d[2], dA = dU / ((swaps % 2 ? -1 : 1) * f);
        const steps = [];
        if (swaps >= 1) steps.push(t`$R_1 \leftrightarrow R_2$`);
        steps.push(t`$R_3 \leftarrow R_3 - 2R_1$`);
        steps.push(f === 0.5 ? t`$R_2 \leftarrow \tfrac12R_2$` : t`$R_2 \leftarrow ${f}R_2$`);
        if (swaps === 2) steps.push(t`$R_2 \leftrightarrow R_3$`);
        steps.push(t`$R_3 \leftarrow R_3 + R_2$`);
        const errors = [{ value: dU, feedback: t`That is $\det U$. Each operation changed the determinant on the way: undo their effects.` }, { value: dU * f * (swaps % 2 ? -1 : 1), feedback: t`Scaling a row by $${qt(f)}$ multiplied the determinant by $${qt(f)}$, so to recover $\det A$ you *divide* by it.` }].filter((e) => Math.abs(e.value - dA) > 1e-9 && Math.abs(e.value + dA) > 1e-9);
        return {
          prompt: t`Elimination took a $3\times3$ matrix $A$ through these steps, in order: ${steps.join(', ')} — and ended at the triangular $U = ${matTeX(U)}$. Find $\det A$.`,
          answer: dA, tol: { rel: 1e-6, abs: 1e-6 }, errors,
          hints: [t`$\det U = ${d[0]}\cdot(${d[1]})\cdot(${d[2]}) = ${dU}$.`, t`Swaps flip the sign, replacements $R_i \leftarrow R_i + cR_j$ change nothing, and scaling a row by $c$ multiplies the determinant by $c$. So $\det U = ${swaps % 2 ? '-' : ''}${qt(f)}\,\det A$.`],
          teach: 'Track each row operation: swaps flip the sign, scalings multiply, replacements do nothing.',
          explain: t`${swaps} swap${swaps === 1 ? '' : 's'} (factor $${swaps % 2 ? '-1' : '+1'}$) and one scaling by $${qt(f)}$: $\det U = ${swaps % 2 ? '-' : ''}${qt(f)}\det A$, so $\det A = ${dU} / (${swaps % 2 ? '-' : ''}${qt(f)}) = ${nice(dA)}$.`,
          visual: board(U, { caption: 'U, the end of elimination: triangular, so det U is the product of its diagonal.' }),
        };
      },
    }),
    mcq({
      id: 'rules', difficulty: 2,
      prompt: t`Which change to a $3\times3$ matrix $A$ leaves $\det A$ unchanged?`,
      choices: [t`$R_2 \leftarrow R_2 + 5R_1$`, t`$R_1 \leftrightarrow R_3$`, t`$R_2 \leftarrow -R_2$`, t`$A \to -A$`],
      answer: 0,
      why: {
        1: 'A swap reverses the sign of the determinant (the handedness of the rows flips).',
        2: t`Scaling one row by $-1$ multiplies the determinant by $-1$.`,
        3: t`$-A$ multiplies all three rows by $-1$: $\det(-A) = (-1)^3\det A = -\det A$.`,
      },
      hints: [t`Picture the rows as the edges of a box. Which change slides one edge along another without changing the volume?`],
      teach: 'Adding a multiple of one row to another is a shear: it never changes the determinant.',
      explain: t`Linearity in row 2 gives $\det(\dots, \mathbf r_2 + 5\mathbf r_1, \dots) = \det(\dots, \mathbf r_2, \dots) + 5\det(\dots, \mathbf r_1, \dots)$, and the last determinant has two equal rows, so it is 0. That is why elimination's replacements are free.`,
      visual: detPic([[3, 1], [1 + 1.5 * 3, 2 + 1.5]], { ghost: [[3, 1], [1, 2]], names: ['r₁', 'r₂ + 1.5 r₁'], ghostNames: ['', 'r₂'], label: true, view: 2.6, center: [3.6, 1.8], caption: 'In two dimensions: adding 1.5 × r₁ to r₂ slides the parallelogram (dashed, before) along r₁. Base and height are unchanged, so the area is still 5.' }),
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A student expands $\det${matTeX([[1, 2, 0], [3, 1, 2], [0, 4, 1]])}$ along **row 2**:
$$3\det${matTeX([[2, 0], [4, 1]])} - 1\det${matTeX([[1, 0], [0, 1]])} + 2\det${matTeX([[1, 2], [0, 4]])} = 6 - 1 + 8 = 13.$$
What went wrong?`,
      choices: [
        t`Row 2's signs are $-, +, -$, not $+, -, +$; the determinant is $-13$`,
        t`Cofactor expansion is only allowed along the first row`,
        t`The minors are wrong: deleting row 2 and column 1 leaves $${matTeX([[2, 0], [4, 1]])}$ only if the columns are swapped`,
        t`The three terms should be multiplied, not added`,
      ],
      answer: 0,
      why: {
        1: t`Any row or any column works, as long as each term gets its checkerboard sign $(-1)^{i+j}$.`,
        2: 'The minors are right: deleting row 2 and each column in turn leaves exactly those 2×2 matrices.',
        3: 'The expansion is a sum of entry × cofactor.',
      },
      hints: [t`Write the checkerboard $\begin{smallmatrix} + & - & + \\ - & + & - \\ + & - & + \end{smallmatrix}$ and read off row 2.`, t`Check by expanding along row 1 instead: $1\cdot(1 - 8) - 2\cdot(3 - 0) + 0$.`],
      teach: t`The sign of each cofactor depends on its position, $(-1)^{i+j}$; a row that starts with a minus starts with $-$.`,
      explain: t`Along row 2 the signs are $-, +, -$: $-3(2) + 1(1) - 2(4) = -13$. Along row 1: $1(1 - 8) - 2(3 - 0) + 0 = -13$. ✓ Every line gives the same answer when the signs are right.`,
      visual: board([[1, 2, 0], [3, 1, 2], [0, 4, 1]], { signs: true, ring: [[1, 0], [1, 1], [1, 2]], caption: 'The matrix with its checkerboard of cofactor signs; row 2 is ringed.' }),
    }),
    code({
      id: 'det-elim', difficulty: 3,
      prompt: t`Write \`det_elim(A)\` that computes a determinant by elimination: copy \`A\` to a float array, and for each column swap up the row with the largest entry (partial pivoting), **flipping a sign for every swap**, then subtract multiples of the pivot row from the rows below. Return the sign times the product of the diagonal. Return \`0.0\` if a column has no nonzero pivot. (Do not call \`np.linalg.det\` — the tests compare against it.)`,
      starter: t`import numpy as np

def det_elim(A):
    U = np.array(A, dtype=float)
    n = U.shape[0]
    sign = 1.0
    # for each column c: pick the pivot row, swap (flip sign), eliminate below
    return None
`,
      answer: t`import numpy as np

def det_elim(A):
    U = np.array(A, dtype=float)
    n = U.shape[0]
    sign = 1.0
    for c in range(n):
        p = c + int(np.argmax(np.abs(U[c:, c])))
        if U[p, c] == 0:
            return 0.0
        if p != c:
            U[[c, p]] = U[[p, c]]
            sign = -sign
        for i in range(c + 1, n):
            U[i, c:] -= U[i, c] / U[c, c] * U[c, c:]
    return sign * float(np.prod(np.diag(U)))

print(det_elim([[2, 0, 1], [3, -1, 4], [1, 0, 5]]))`,
      tests: [
        { name: 'the worked example: det = −9', code: 'abs(det_elim([[2, 0, 1], [3, -1, 4], [1, 0, 5]]) + 9) < 1e-9' },
        { name: 'a swap flips the sign: det [[0, 1], [1, 0]] = −1', code: 'abs(det_elim([[0, 1], [1, 0]]) + 1) < 1e-12' },
        { name: 'a singular matrix gives 0', code: 'abs(det_elim([[1, 2, 3], [2, 4, 6], [1, 0, 1]])) < 1e-9' },
        { name: 'agrees with np.linalg.det on a random 6×6', code: '(lambda M: abs(det_elim(M) - np.linalg.det(M)) < 1e-8 * max(1, abs(np.linalg.det(M))))(np.random.default_rng(7).normal(size=(6, 6)))' },
        { name: 'does not change the matrix passed in', code: '(lambda M: (det_elim(M), M[0][0] == 0)[1])([[0, 1, 2], [3, 4, 5], [6, 7, 9]])' },
      ],
      hints: ['`p = c + int(np.argmax(np.abs(U[c:, c])))` is the pivot row; swap rows with `U[[c, p]] = U[[p, c]]` and set `sign = -sign`.', 'Eliminate below with `U[i, c:] -= U[i, c] / U[c, c] * U[c, c:]` for each i > c; at the end return `sign * np.prod(np.diag(U))`.'],
      teach: 'Elimination gives the determinant as ± the product of the pivots — about n³/3 operations instead of n!.',
      explain: t`Replacements leave the determinant alone, each swap flips its sign, and the triangular result's determinant is the product of its diagonal. NumPy's \`np.linalg.det\` does the same thing (an LU factorization with partial pivoting, from LAPACK). Pivoting on the largest entry is not needed for the algebra, only to keep rounding errors small.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sparse', difficulty: 2,
      gen(r) {
        const { A, D } = sparse(r);
        return {
          prompt: t`Find $\det${matTeX(A)}$.`,
          answer: D, tol: { rel: 0, abs: 0.01 },
          hints: ['Expand along the row or column with two zeros.'],
          teach: 'Expand along the sparsest line, minding the checkerboard signs.',
          explain: t`$\det A = ${D}$.`,
          visual: board(A, { signs: true }),
        };
      },
    }),
    num({
      id: 'cp-thrusters', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const d1 = [1, 0, r.int(1, 2)], d2 = [0, 1, r.int(1, 2)], a = r.intExcept(-2, 2, [0]), b = r.int(-2, 2);
          // det [d1; d2; (a, t, b)] = (b - a·d1z - t·d2z)·1 … linear in t: solve for the zero
          const at = (tt) => det3([d1, d2, [a, tt, b]]), c0 = at(0), c1 = at(1) - c0;
          if (c1 === 0) continue;
          const t0 = -c0 / c1;
          if (Math.abs(t0) > 6 || Math.abs(t0) < 0.25 || Math.abs(t0 * 4 - Math.round(t0 * 4)) > 1e-9) continue;
          return {
            prompt: t`Three thrusters on a spacecraft push along $\mathbf d_1 = ${tupleTeX(d1)}$, $\mathbf d_2 = ${tupleTeX(d2)}$ and $\mathbf d_3 = (${a}, t, ${b})$, where $t$ is set by how the third nozzle is canted. Firing them at different strengths can produce a net force in **any** direction exactly when the three directions are independent — when $\det[\mathbf d_1; \mathbf d_2; \mathbf d_3] \ne 0$. For which cant $t$ does the spacecraft lose control authority in some direction?`,
            answer: t0, tol: { rel: 0, abs: 0.01 },
            hints: [t`Put the three directions in the rows of a matrix and expand along the first row, keeping $t$ as a letter: the determinant is linear in $t$.`, t`The determinant is $${nice(c1)}\,t ${c0 < 0 ? '-' : '+'} ${nice(Math.abs(c0))}$; set it to zero.`],
            teach: 'Three vectors in space are dependent exactly when the determinant of the matrix they form is zero — the box they span is flat.',
            explain: t`$\det = ${nice(c1)}\,t ${c0 < 0 ? '-' : '+'} ${nice(Math.abs(c0))}$, which is zero at $t = ${nice(t0)}$. Then $\mathbf d_3$ lies in the plane of $\mathbf d_1$ and $\mathbf d_2$: no combination of firings can push out of that plane. Real reaction-control systems use more thrusters than three so that one failure cannot do this.`,
            visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: d1, color: 'good', label: t`\mathbf d_1` }, { to: d2, color: 'warn', label: t`\mathbf d_2` }], parallelograms: [{ at: [0, 0, 0], u: d1, v: d2, color: 'violet', alpha: 0.2 }] }, caption: 'The first two thrust directions and the parallelogram they span (part of their plane). The third direction depends on t. Drag to rotate.' },
          };
        }
        return { prompt: t`For which $t$ is $\det\begin{bmatrix} 1 & 0 & 1 \\ 0 & 1 & 1 \\ 1 & t & 0 \end{bmatrix} = 0$?`, answer: -1, hints: ['Expand along row 1.', t`The determinant is $-t - 1$.`], teach: 'Three vectors are dependent exactly when their determinant is zero.', explain: t`$-t - 1 = 0$ at $t = -1$.` };
      },
    }),
    num({
      id: 'cp-rules', difficulty: 2,
      gen(r) {
        const dA = r.intExcept(-6, 6, [0]), c = r.pick([2, 3, 5, -2]);
        const ans = -c * dA;
        return {
          prompt: t`A $3\times3$ matrix has $\det A = ${dA}$. Find the determinant after $R_1 \leftrightarrow R_3$, then $R_2 \leftarrow ${c}R_2$, then $R_3 \leftarrow R_3 - 4R_1$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: c * dA, feedback: 'The swap flips the sign.' }, { value: -dA, feedback: t`Multiplying a row by $${c}$ multiplies the determinant by $${c}$.` }].filter((e) => e.value !== ans && e.value !== -ans),
          hints: ['Swap: × (−1). Scale a row by c: × c. Replacement: no change.'],
          teach: 'Each row operation changes the determinant in a fixed way.',
          explain: t`$${dA}\times(-1)\times${c < 0 ? `(${c})` : c}\times1 = ${ans}$.`,
          visual: detPic([[1, 2], [3, 1]], { ghost: [[3, 1], [1, 2]], names: ['r₁ (was r₂)', 'r₂ (was r₁)'], label: true, view: 2.2, center: [1.8, 1.5], caption: 'In two dimensions: swapping the two rows gives the same parallelogram (dashed: before, det +5), traced the other way round — red, det −5.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §5.1–5.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 19: Determinant formulas and cofactors', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
