// Gaussian elimination: row operations, pivots, row echelon form and back
// substitution.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { det3, solve, augTeX, sysTeX, matTeX, qt, rr, lines2 } from './_la.js';

const t = String.raw;
const STRANG = [[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]];

// a 3×3 system with a whole-number solution whose elimination needs no row swap
function system(r, lo = -3, hi = 4) {
  for (let k = 0; k < 400; k++) {
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(lo, hi)));
    if (A[0][0] === 0 || Math.abs(det3(A)) < 1) continue;
    const m = A[1][1] - (A[1][0] / A[0][0]) * A[0][1];
    if (Math.abs(m) < 1e-9) continue;
    const x = [r.intExcept(-3, 3, [0]), r.int(-3, 3), r.intExcept(-3, 3, [0])];
    return { A, x, M: A.map((row) => [...row, row.reduce((s, v, j) => s + v * x[j], 0)]) };
  }
  return { A: STRANG.map((row) => row.slice(0, 3)), x: [-1, 2, 2], M: STRANG };
}

export default lesson({
  id: 'math2270.LA-2.2',
  title: 'Gaussian elimination and row echelon form',
  minutes: 11, difficulty: 2,
  intro: t`Elimination solves a system by simplifying it **without changing its solutions**. Three row operations are allowed — add a multiple of one row to another, swap two rows, multiply a row by a nonzero number — because each one can be undone. Use the first pivot to clear every entry below it, then the next pivot, and so on:

$$R_i \leftarrow R_i - \ell_{ij}\,R_j, \qquad \ell_{ij} = \frac{a_{ij}}{a_{jj}}$$

The result is **row echelon form**: a staircase of pivots with zeros beneath them. The last equation then has one unknown, and **back substitution** solves the rest from the bottom up.`,
  symbols: [
    { tex: t`R_i`, text: t`row $i$ of the augmented matrix — a whole equation, right-hand side included` },
    { tex: t`a_{jj}`, text: t`the **pivot**: the entry (it must not be 0) used to clear the rest of its column below it, read from the matrix as it stands at that moment` },
    { tex: t`a_{ij}`, text: t`the entry below the pivot that is being made 0 (its current value, after earlier steps)` },
    { tex: t`\ell_{ij}`, text: t`the multiplier: entry to clear divided by the pivot — subtract $\ell_{ij}$ times the pivot row` },
    { tex: t`\leftarrow`, text: t`“is replaced by”: $R_2 \leftarrow R_2 - 2R_1$ means the new row 2 is the old row 2 minus twice row 1` },
  ],
  why: t`Elimination is how linear systems are solved in practice — NumPy's solver performs these same steps (with smarter row swaps) — and recording the multipliers $\ell_{ij}$ turns elimination into the LU factorization of LA-3.3.`,
  visual: {
    type: 'la-rowreduce',
    title: 'Watch the planes move and the point stay',
    lead: t`Each press of **Next** applies one row operation. Above: the matrix, with the pivot ringed and the changed row tinted. Below: each row as a plane. The changed row's plane swings round — but always through the gold point, the solution.`,
    tasks: [
      'Press Next: R₂ ← R₂ − 2R₁ tilts row 2’s plane, which still passes through the gold point.',
      'Step to the end: the matrix is a staircase. The last row reads 4z = 8, so z = 2; back-substitute upwards.',
      'Switch to “A zero pivot”: the first step must be a swap, because a 0 cannot clear anything below it.',
    ],
    params: { systems: [{ label: 'Strang’s example', M: STRANG }, { label: 'A zero pivot', M: [[0, 1, 2, 3], [1, 2, 1, 5], [2, 3, 4, 11]] }], mode: 'ref', view: 3.5 },
    caption: 'Exact fractions throughout. Each plane is drawn as a square patch around the solution (the planes go on for ever). Drag the picture to rotate it.',
  },
  example: {
    prompt: t`Solve by elimination:
$$${sysTeX(STRANG)}$$`,
    visual: rr(STRANG, { step: 3, solution: true, view: 3.5, caption: 'The echelon form reached after three operations: a staircase of pivots 2, 1, 4. The gold point is the solution.' }),
    steps: [
      { label: 'First pivot', text: t`The pivot is $a_{11} = 2$. Clear the 4 below it with $\ell_{21} = 4/2 = 2$: $R_2 \leftarrow R_2 - 2R_1$ gives $(0, 1, 1 \mid 4)$. Clear the $-2$ with $\ell_{31} = -2/2 = -1$: $R_3 \leftarrow R_3 + R_1$ gives $(0, 1, 5 \mid 12)$.` },
      { label: 'Second pivot', text: t`Now the pivot is the 1 in row 2. Clear the 1 below it: $R_3 \leftarrow R_3 - R_2$ gives $(0, 0, 4 \mid 8)$.` },
      { label: 'Echelon form', text: t`$$${augTeX([[2, 4, -2, 2], [0, 1, 1, 4], [0, 0, 4, 8]])}$$ The pivots are $2, 1, 4$ — all nonzero, so there is exactly one solution.` },
      { label: 'Back substitution', text: t`Bottom row: $4z = 8$, so $z = 2$. Middle: $y + z = 4$, so $y = 2$. Top: $2x + 4y - 2z = 2$, so $2x + 8 - 4 = 2$ and $x = -1$.` },
      { label: 'Check', text: t`In the original third equation: $-2(-1) - 3(2) + 7(2) = 2 - 6 + 14 = 10$. ✓ Always check in the *original* system: that catches slips made during elimination.` },
    ],
    answer: t`$(x, y, z) = (-1, 2, 2)$.`,
  },
  practice: [
    num({
      id: 'multiplier', difficulty: 1,
      gen(r) {
        let M = STRANG, i = 1;
        for (let k = 0; k < 50; k++) { ({ M } = system(r, -4, 6)); i = r.int(1, 2); if (M[i][0] !== 0) break; }
        if (M[i][0] === 0) { M = STRANG; i = 1; }
        const ell = M[i][0] / M[0][0];
        return {
          prompt: t`To clear the entry in row ${i + 1}, column 1 of this augmented matrix, which multiplier $\ell_{${i + 1}1}$ goes into $R_${i + 1} \leftarrow R_${i + 1} - \ell_{${i + 1}1} R_1$? (A fraction or a decimal is fine.)
$$${augTeX(M)}$$`,
          answer: ell, tol: { rel: 1e-4, abs: 1e-6 },
          errors: Math.abs(M[0][0] / M[i][0] - ell) > 1e-9 && M[i][0] !== 0 ? [{ value: M[0][0] / M[i][0], feedback: 'Upside down: divide the entry you are clearing by the pivot, not the pivot by it.' }] : [],
          hints: [t`The pivot is $a_{11} = ${M[0][0]}$; the entry to clear is $a_{${i + 1}1} = ${M[i][0]}$.`, t`$\ell = a_{${i + 1}1}/a_{11}$.`],
          teach: 'The multiplier is the entry to be cleared divided by the pivot above it.',
          explain: t`$\ell_{${i + 1}1} = ${M[i][0]}/${M[0][0]} = ${qt(ell)}$. Subtracting $${qt(ell)}$ times row 1 turns $${M[i][0]}$ into $${M[i][0]} - ${ell < 0 ? `\\left(${qt(ell)}\\right)` : qt(ell)}\cdot${M[0][0]} = 0$.`,
          visual: rr(M, { view: 4, caption: 'The augmented matrix and its rows as planes. Drag the picture to rotate.' }),
        };
      },
    }),
    num({
      id: 'after-op', difficulty: 2,
      gen(r) {
        let M, ell;
        for (let k = 0; k < 100; k++) { ({ M } = system(r, -3, 5)); ell = M[1][0] / M[0][0]; if (Number.isInteger(ell) && ell !== 0 && M[0][2] !== 0) break; }
        if (!Number.isInteger(ell) || ell === 0 || M[0][2] === 0) { M = STRANG; ell = 2; }
        const val = M[1][2] - ell * M[0][2];
        const wrong = [M[1][2] + ell * M[0][2], M[1][2] - M[0][2]].filter((w) => Math.abs(w - val) > 1e-9);
        return {
          prompt: t`Apply $R_2 \leftarrow R_2 - (${ell})R_1$ to the matrix below. What is the new entry in row 2, column 3?
$$${augTeX(M)}$$`,
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [...new Set(wrong)].map((w) => ({ value: w, feedback: Math.abs(w - (M[1][2] + ell * M[0][2])) < 1e-9 ? t`Sign slip: the operation *subtracts* $${ell}$ times row 1.` : t`You subtracted row 1 once; subtract it $${ell}$ times.` })),
          hints: ['Only row 2 changes. Each of its entries loses ℓ times the entry above it in row 1.', t`New $a_{23} = ${M[1][2]} - (${ell})(${M[0][2]})$.`],
          teach: 'A row operation acts on every entry of the row, the right-hand side included, using the matching entry of the pivot row.',
          explain: t`$${M[1][2]} - (${ell})(${M[0][2]}) = ${val}$. The whole new row 2 is $(${M[1].map((v, j) => qt(v - ell * M[0][j])).join(', ')})$: its first entry is now 0, as intended.`,
          visual: rr(M, { ops: [['add', 2, 1, -ell]], stepper: false, view: 4, caption: 'The matrix before the operation, with its rows as planes. Drag the picture to rotate.' }),
        };
      },
    }),
    num({
      id: 'back-sub', difficulty: 2,
      gen(r) {
        const p = [r.intExcept(-3, 4, [0]), r.intExcept(-3, 4, [0]), r.intExcept(-3, 4, [0])], a = r.int(-3, 3), b = r.int(-3, 3), c = r.int(-3, 3);
        const x = [r.int(-3, 3), r.int(-3, 3), r.intExcept(-3, 3, [0])];
        const U = [[p[0], a, b], [0, p[1], c], [0, 0, p[2]]];
        const M = U.map((row) => [...row, row.reduce((s, v, j) => s + v * x[j], 0)]);
        return {
          prompt: t`This augmented matrix is already in echelon form. Use back substitution to find $x$ (the first unknown).
$$${augTeX(M)}$$`,
          answer: x[0], tol: { rel: 0, abs: 0.01 },
          errors: [x[2], x[1]].filter((w) => w !== x[0]).map((w) => ({ value: w, feedback: t`That is the value of ${w === x[2] ? '$z$, from the last row' : '$y$, from the middle row'}. Keep going up to the first row.` })).filter((e, k, arr) => arr.findIndex((q) => q.value === e.value) === k),
          hints: [t`Start at the bottom: $${p[2]}z = ${M[2][3]}$.`, t`Then row 2: $${p[1]}y + (${c})z = ${M[1][3]}$; then row 1 gives $x$.`],
          teach: 'Back substitution solves an echelon system from the last row upwards, one new unknown per row.',
          explain: t`$z = ${M[2][3]}/${p[2]} = ${x[2]}$; $\;y = (${M[1][3]} - (${c})(${x[2]}))/${p[1]} = ${x[1]}$; $\;x = (${M[0][3]} - (${a})(${x[1]}) - (${b})(${x[2]}))/${p[0]} = ${x[0]}$.`,
          visual: rr(M, { view: 4, caption: 'An echelon form and its rows as planes: the bottom plane involves z alone, so it lies flat. Drag the picture to rotate.' }),
        };
      },
    }),
    mcq({
      id: 'legal-ops', difficulty: 2,
      prompt: 'Which of these is **not** an allowed row operation — one that can change the set of solutions?',
      choices: ['Multiply row 2 by 0', 'Add 3 times row 1 to row 2', 'Swap rows 1 and 2', t`Multiply row 2 by $-\tfrac12$`],
      answer: 0,
      why: {
        1: 'Allowed: it can be undone by subtracting 3 times row 1 again, so no solution is lost or gained.',
        2: 'Allowed: the same two equations in another order have the same solutions.',
        3: t`Allowed: multiplying by $-2$ undoes it. Any nonzero number is fine.`,
      },
      hints: ['An operation is safe when you can undo it and get the original equations back.', 'What does multiplying by 0 do to an equation, and can you get the equation back afterwards?'],
      teach: 'Row operations are exactly the reversible ones, which is why they never change the solution set.',
      explain: t`Multiplying by 0 turns the equation into $0 = 0$, which every point satisfies: the information in that row is destroyed and cannot be recovered. Here the line $x - y = -1$ would vanish, and the single solution $(1, 2)$ would grow into a whole line of them.`,
      visual: lines2([[1, 1, 3], [1, -1, -1]], { x: [-3, 5], y: [-1.5, 4], point: [1, 2], caption: 'R₁: x + y = 3 and R₂: x − y = −1 meet at (1, 2). An allowed operation can move a line but keeps that crossing.' }),
    }),
    mcq({
      id: 'zero-pivot', difficulty: 2,
      prompt: t`After clearing column 1, elimination has reached this matrix. What should the next step be?
$$${augTeX([[1, 2, 1, 4], [0, 0, 3, 6], [0, 5, 1, 7]])}$$`,
      choices: [t`Swap $R_2$ and $R_3$, so a nonzero entry becomes the pivot in column 2`, 'Stop: a zero pivot means the system has no solution', t`Use the 3 in row 2 as the next pivot and clear below it`, t`Divide $R_2$ by its zero pivot`],
      answer: 0,
      why: {
        1: 'A zero in the pivot position only means this row cannot serve as the pivot row; a lower row can.',
        2: t`Then the 5 in row 3, column 2 would sit below row 2's zero and never be cleared: the matrix would not reach a staircase.`,
        3: 'Division by zero is impossible; that is exactly why a different row has to supply the pivot.',
      },
      hints: ['A pivot must be nonzero. Is there a nonzero entry lower down in column 2?', t`Row 3 has a 5 in column 2.`],
      teach: 'When the pivot position holds 0, swap in a lower row that has a nonzero entry in that column.',
      explain: t`Swapping gives $(0, 5, 1 \mid 7)$ above $(0, 0, 3 \mid 6)$ — already echelon form, pivots $1, 5, 3$. Back substitution: $z = 2$, $y = (7 - 2)/5 = 1$, $x = 4 - 2 - 2 = 0$.`,
      visual: rr([[1, 2, 1, 4], [0, 0, 3, 6], [0, 5, 1, 7]], { view: 3, caption: 'The matrix so far, with its rows as planes. Drag the picture to rotate.' }),
    }),
    mcq({
      id: 'ref-which', difficulty: 1,
      prompt: 'Which matrix is in row echelon form?',
      choices: [t`$${matTeX([[2, 1, 3], [0, 4, 1], [0, 0, 5]])}$`, t`$${matTeX([[2, 1, 3], [0, 4, 1], [0, 2, 5]])}$`, t`$${matTeX([[0, 4, 1], [2, 1, 3], [0, 0, 5]])}$`, t`$${matTeX([[2, 1, 3], [0, 0, 0], [0, 0, 5]])}$`],
      answer: 0,
      why: {
        1: 'The 2 under the second pivot still has to be cleared.',
        2: 'The rows are out of order: the first row’s leading entry must be furthest left. Swap rows 1 and 2.',
        3: 'A row of zeros must sit at the bottom, below every row with a pivot.',
      },
      hints: ['Echelon form: each row’s first nonzero entry is to the right of the one above, and zero rows are at the bottom.', 'Check what lies below each pivot.'],
      teach: 'Row echelon form is a staircase: each pivot lies to the right of the pivot above it, with only zeros below every pivot and zero rows at the bottom.',
      explain: 'Pivots 2, 4 and 5 step down to the right, with zeros below each, and there are no zero rows.',
    }),
    code({
      id: 'row-reduce', difficulty: 3,
      prompt: t`Finish the two functions. \`forward(M)\` reduces an augmented matrix ($n$ rows, $n + 1$ columns) to row echelon form, clearing each column below its pivot with $R_i \leftarrow R_i - \ell R_j$; it already swaps rows when a pivot is 0. \`back_sub(U)\` then solves the triangular system from the bottom up.`,
      starter: t`import numpy as np

def forward(M):
    """Row echelon form of the augmented matrix M (n rows, n + 1 columns)."""
    M = M.astype(float)                     # a float copy: fractions appear
    n = M.shape[0]
    for j in range(n):                      # the j-th pivot sits in column j
        if M[j, j] == 0:                    # zero pivot: swap in a lower row
            k = j + np.argmax(M[j:, j] != 0)
            M[[j, k]] = M[[k, j]]
        for i in range(j + 1, n):
            # TODO: the multiplier, then R_i <- R_i - multiplier * R_j
            pass
    return M

def back_sub(U):
    """Solve the echelon system U (n rows, n + 1 columns), last row first."""
    n = U.shape[0]
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        # TODO: x[i] = (right-hand side - the terms already known) / pivot
        pass
    return x

M = np.array([[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]])
print(forward(M))
print(back_sub(forward(M)))
`,
      answer: t`import numpy as np

def forward(M):
    M = M.astype(float)
    n = M.shape[0]
    for j in range(n):
        if M[j, j] == 0:
            k = j + np.argmax(M[j:, j] != 0)
            M[[j, k]] = M[[k, j]]
        for i in range(j + 1, n):
            ell = M[i, j] / M[j, j]
            M[i] = M[i] - ell * M[j]
    return M

def back_sub(U):
    n = U.shape[0]
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (U[i, n] - U[i, i + 1:n] @ x[i + 1:]) / U[i, i]
    return x

M = np.array([[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]])
print(forward(M))
print(back_sub(forward(M)))
`,
      tests: [
        { name: 'forward(M) leaves only zeros below the diagonal', code: 'np.allclose(np.tril(forward(np.array([[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]]))[:, :3], -1), 0)' },
        { name: 'forward(M) gives the pivots 2, 1, 4', code: 'np.allclose(np.diag(forward(np.array([[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]]))), [2, 1, 4])' },
        { name: 'back_sub(forward(M)) gives (−1, 2, 2)', code: 'np.allclose(back_sub(forward(np.array([[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]]))), [-1, 2, 2])' },
        { name: 'a system with a zero first pivot is solved too', code: 'np.allclose(back_sub(forward(np.array([[0, 1, 2, 3], [1, 2, 1, 5], [2, 3, 4, 11]]))), [2, 1, 1])' },
        { name: 'a 5 × 5 system agrees with np.linalg.solve', code: '(lambda A, b: np.allclose(back_sub(forward(np.hstack([A, b[:, None]]))), np.linalg.solve(A, b)))(np.array([[4., 1, 0, 2, 1], [1, 5, 2, 0, 1], [0, 2, 6, 1, 2], [2, 0, 1, 7, 1], [1, 1, 2, 1, 8]]), np.array([1., 2, 3, 4, 5]))' },
      ],
      hints: [t`In \`forward\`, the multiplier is \`ell = M[i, j] / M[j, j]\`; then the whole row changes at once: \`M[i] = M[i] - ell * M[j]\`.`, t`In \`back_sub\`, the known terms of row $i$ are \`U[i, i+1:n] @ x[i+1:]\`; subtract them from \`U[i, n]\` and divide by the pivot \`U[i, i]\`.`],
      teach: 'Forward elimination is two nested loops over pivots and the rows below them; back substitution is one loop from the bottom row up.',
      explain: t`\`M[i] = M[i] - ell * M[j]\` is the row operation applied to a whole row, right-hand side included. Back substitution uses the unknowns already found: for the last row \`U[i, i+1:n]\` is empty, so \`x[n-1] = U[n-1, n] / U[n-1, n-1]\`. Real solvers also swap rows to put the *largest* entry in the pivot position (partial pivoting), which keeps rounding errors small.`,
      visual: rr(STRANG, { step: 3, picture: 'none', caption: 'What forward(M) should produce for the test system: the echelon form after three operations.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solve', difficulty: 3,
      gen(r) {
        const { M, x } = system(r), k = r.int(0, 2), name = ['x', 'y', 'z'][k];
        const others = x.filter((v, i) => i !== k && v !== x[k]);
        return {
          prompt: t`Solve by elimination and give $${name}$:
$$${sysTeX(M)}$$`,
          answer: x[k], tol: { rel: 0, abs: 0.01 },
          errors: [...new Set(others)].map((v) => ({ value: v, feedback: t`That value belongs to another unknown. Which one is $${name}$?` })),
          hints: [t`Clear column 1 below the pivot $${M[0][0]}$, then column 2 below the next pivot.`, 'With the matrix in echelon form, back-substitute from the bottom row.', 'Check your answer in an original equation.'],
          teach: 'Forward elimination to a staircase, then back substitution, solves any square system with nonzero pivots.',
          explain: t`The solution is $(x, y, z) = (${x.join(', ')})$. Check in the first equation: $${M[0].slice(0, 3).map((v, j) => `(${v})(${x[j]})`).join(' + ')} = ${M[0][3]}$.`,
          visual: rr(M, { view: 4.5, caption: 'The system’s rows as planes. Drag the picture to rotate.' }),
        };
      },
    }),
    num({
      id: 'cp-trajectory', difficulty: 3, transfer: true,
      gen(r) {
        const h0 = r.pick([40, 60, 80, 120]), v0 = r.pick([30, 45, 60, 75]), a = r.pick([12, 16, 18, 24, 30]);
        const ts = [1, 2, 3], hs = ts.map((s) => h0 + v0 * s + (a / 2) * s * s);
        return {
          prompt: t`Radar tracks a sounding rocket during its burn. At $t = 1, 2, 3$ s its altitude is $${hs.join(',\ ')}$ m. Fit $h(t) = c_0 + c_1 t + c_2 t^2$ through the three points — a $3 \times 3$ linear system for $c_0, c_1, c_2$ — and report the rocket's acceleration $a = 2c_2$, in m/s².`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: a / 2, feedback: t`That is $c_2$. For constant acceleration $h = h_0 + v_0t + \tfrac12 at^2$, so $a = 2c_2$.` }],
          hints: [t`Each data point gives one equation: $c_0 + c_1 t + c_2 t^2 = h$ with $t = 1, 2, 3$.`, t`The augmented matrix is $${augTeX(ts.map((s, i) => [1, s, s * s, hs[i]]))}$.`, 'Eliminate: subtracting row 1 from rows 2 and 3, then twice the new row 2 from the new row 3, leaves 2c₂ alone in the last row.'],
          teach: 'Fitting a polynomial through points is a linear system, because the unknown coefficients appear linearly even though t appears squared.',
          explain: t`Elimination gives $c_2 = ${nice(a / 2)}$, $c_1 = ${v0}$, $c_0 = ${h0}$, so $a = ${a}$ m/s² (and the rocket was at ${h0} m, moving up at ${v0} m/s, at $t = 0$). Three points always fit a parabola exactly; real tracks use many noisy points and a least-squares fit (LA-10), and a constant acceleration only holds over a few seconds while thrust and mass change.`,
          visual: { type: 'graph', params: { x: [0, 3.6], y: [0, Math.max(...hs) * 1.15], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', axesAt: 'edge', points: ts.map((s, i) => ({ x: s, y: hs[i], color: 'accent', r: 5.5 })) }, caption: 'The three radar fixes. A parabola through them gives the acceleration, if it stays constant over these seconds.' },
        };
      },
    }),
    mcq({
      id: 'cp-invariant', difficulty: 2,
      prompt: t`A system of three equations has the single solution $(1, -1, 2)$. After the operation $R_2 \leftarrow R_2 - 3R_1$, which statement is true?`,
      choices: ['The second plane has moved, but all three planes still meet at (1, −1, 2)', 'Nothing about the picture has changed', t`The solution is now $(1, -1, 2) - 3(\text{something})$: it moves`, 'The system may now have no solution'],
      answer: 0,
      why: {
        1: 'Row 2 is a different equation now, so its plane is different — it has turned about the line where it meets plane 1.',
        2: 'Row operations never change the solution set: any point on the old planes 1 and 2 is on the new plane 2, and the operation can be undone.',
        3: 'An allowed operation can be undone, so it can neither create nor destroy solutions.',
      },
      hints: [t`Does $(1, -1, 2)$ satisfy the new row 2? New row 2 = old row 2 − 3 × row 1, and the point satisfies both of those.`],
      teach: 'Row operations change the equations — and their planes — but never the set of points that satisfy all of them.',
      explain: t`At $(1, -1, 2)$ the new left side is (old row 2) $- 3$(row 1) $= b_2 - 3b_1$, exactly the new right side: the point still lies on the new plane. The new plane is different from the old, but it still contains the line where the old planes 1 and 2 met.`,
      visual: rr([[1, 1, 1, 2], [3, 1, 2, 6], [1, -1, 1, 4]], { ops: [['add', 2, 1, -3]], step: 1, solution: true, view: 3, caption: 'After the operation: the changed row is tinted, and its plane (orange) has swung round — through the same gold point.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §2.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 2: Elimination with matrices', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
