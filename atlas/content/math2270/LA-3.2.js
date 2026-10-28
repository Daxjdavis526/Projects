// Inverse matrices: undoing a map, the 2×2 formula, Gauss–Jordan on [A | I],
// and why a singular matrix cannot be undone.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matvec, matmul, inverse, det2, matTeX, tupleTeX, qt, rr, map2d } from './_la.js';

const t = String.raw;

// an integer 2×2 with a small nonzero determinant
function mat2(r) {
  for (let k = 0; k < 300; k++) {
    const A = [[r.int(-3, 5), r.int(-3, 5)], [r.int(-3, 5), r.int(-3, 5)]], d = det2(A);
    if (d !== 0 && Math.abs(d) <= 12 && A.flat().filter((v) => v !== 0).length >= 3) return A;
  }
  return [[4, 7], [2, 6]];
}

export default lesson({
  id: 'math2270.LA-3.2',
  title: 'Inverse matrices',
  minutes: 11, difficulty: 2,
  equation: t`A = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \quad\Longrightarrow\quad A^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}`,
  intro: t`The **inverse** of a square matrix $A$ undoes it: $A^{-1}A = AA^{-1} = I$. When it exists, $A\mathbf x = \mathbf b$ has exactly one solution for every $\mathbf b$, namely $\mathbf x = A^{-1}\mathbf b$. A $2\times2$ matrix has an inverse exactly when $ad - bc \ne 0$, and then the formula above gives it. When $ad - bc = 0$, $A$ squashes the whole plane onto a line: different points land on the same spot, and nothing can undo that. For larger matrices, Gauss–Jordan elimination turns $[\,A \mid I\,]$ into $[\,I \mid A^{-1}\,]$.`,
  symbols: [
    { tex: 'A', text: t`a square matrix, here $2\times2$ with entries $a, b, c, d$` },
    { tex: t`A^{-1}`, text: t`the inverse: the map that sends every $A\mathbf x$ back to $\mathbf x$` },
    { tex: 'I', text: t`the identity matrix: 1s on the diagonal, 0s elsewhere, so $I\mathbf x = \mathbf x$ — the map that does nothing` },
    { tex: t`ad - bc`, text: t`the determinant of $A$: the factor by which $A$ scales areas. Zero means no inverse (LA-8 explores it)` },
  ],
  why: 'Invertibility is the dividing line of the subject: an invertible map loses no information, and a dozen conditions — one solution for every b, a pivot in every column, a nonzero determinant — all turn out to say the same thing.',
  visual: {
    type: 'la-map2d',
    title: 'Undo the map — if you can',
    lead: t`Drag the column tips to choose $A$. Then switch on $A^{-1}$: every point is carried back to where it started. The readout shows $A^{-1}$ and $\det A = ad - bc$.`,
    tasks: [
      'Switch on “Then apply A⁻¹”: the F comes home exactly (green), whatever A did to it.',
      'Drag the tip of Ae₂ to (1, 0.5), onto the line of Ae₁ = (2, 1): det A = 0, the square flattens and there is no inverse.',
      'Approach that line gradually: as det A shrinks, the entries of A⁻¹ grow without bound — the 1/(ad − bc) in front.',
    ],
    params: { A: [[2, 1], [1, 1]], drag: true, snap: 0.5, inverse: true, view: 2.6, readout: ['A', 'det', 'inv'] },
    caption: 'Faint: the plane before the map; bold: after it. With A⁻¹ switched on, the dashed outline is the F after A, and the green F is after A, then A⁻¹. Column tips snap to half-units.',
  },
  example: {
    prompt: t`Find the inverse of $A = ${matTeX([[4, 7], [2, 6]])}$ and use it to solve $A\mathbf x = (1, 2)$.`,
    visual: map2d([[4, 7], [2, 6]], { target: [1, 2], view: 4.5, shape: 'square', caption: 'A maps the unit square to the gold parallelogram (area |det A| = 10). The red ring is b; the solution x is the point A sends there.' }),
    steps: [
      { label: 'Determinant', text: t`$ad - bc = 4\cdot6 - 7\cdot2 = 10 \ne 0$, so $A$ has an inverse.` },
      { label: 'The formula', text: t`Swap $a$ and $d$, negate $b$ and $c$, divide by 10: $$A^{-1} = \frac{1}{10}${matTeX([[6, -7], [-2, 4]])} = ${matTeX([[0.6, -0.7], [-0.2, 0.4]])}.$$` },
      { label: 'Check', text: t`$AA^{-1} = ${matTeX([[4, 7], [2, 6]])}${matTeX([[0.6, -0.7], [-0.2, 0.4]])} = ${matTeX([[1, 0], [0, 1]])}$: for example $4(0.6) + 7(-0.2) = 2.4 - 1.4 = 1$. ✓` },
      { label: 'Solve', text: t`$\mathbf x = A^{-1}\mathbf b = ${matTeX([[0.6, -0.7], [-0.2, 0.4]])}${matTeX([[1], [2]])} = ${matTeX([[-0.8], [0.6]])}$.` },
      { label: 'Check the solution', text: t`$4(-0.8) + 7(0.6) = 1$ and $2(-0.8) + 6(0.6) = 2$. ✓ For one right-hand side, elimination is cheaper than forming $A^{-1}$; the inverse pays off as an idea, and when the same $A$ meets many $\mathbf b$ (or, better, through LU — the next lesson).` },
    ],
    answer: t`$A^{-1} = \tfrac{1}{10}${matTeX([[6, -7], [-2, 4]])}$ and $\mathbf x = (-0.8, 0.6)$.`,
  },
  practice: [
    num({
      id: 'inv-entry', difficulty: 1,
      gen(r) {
        const A = mat2(r), d = det2(A), Ai = [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
        const [i, j] = r.pick([[0, 0], [0, 1], [1, 0], [1, 1]]), val = Ai[i][j];
        const slips = [];
        if (i !== j) slips.push({ value: -val, feedback: t`Sign: the off-diagonal entries $b$ and $c$ change sign in the inverse.` });
        const raw = [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]][i][j];
        if (Math.abs(raw - val) > 1e-9 && raw !== -val) slips.push({ value: raw, feedback: t`Divide by the determinant, $ad - bc = ${d}$.` });
        return {
          prompt: t`Find the entry in row ${i + 1}, column ${j + 1} of $A^{-1}$ for $A = ${matTeX(A)}$. (A fraction or a decimal is fine.)`,
          answer: val, tol: { rel: 1e-4, abs: 1e-6 },
          errors: slips.filter((e) => Math.abs(e.value - val) > 1e-9),
          hints: [t`$ad - bc = (${A[0][0]})(${A[1][1]}) - (${A[0][1]})(${A[1][0]}) = ${d}$.`, t`$A^{-1} = \dfrac{1}{${d}}${matTeX([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])}$.`],
          teach: 'For a 2×2 inverse: swap the diagonal entries, negate the off-diagonal ones, divide everything by ad − bc.',
          explain: t`$A^{-1} = \dfrac{1}{${d}}${matTeX([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])}$, so the entry is $${qt(val)}$.`,
          visual: map2d(A, { view: Math.max(2, ...A.flat().map(Math.abs)) * 0.9, caption: 'What A does to the plane. Its inverse must carry every point back.' }),
        };
      },
    }),
    num({
      id: 'solve-inverse', difficulty: 2,
      gen(r) {
        const A = mat2(r), b = [r.intExcept(-4, 4, [0]), r.int(-4, 4)], x = inverse(A).map((row) => row[0] * b[0] + row[1] * b[1]), k = r.int(0, 1);
        return {
          prompt: t`Use $A^{-1}$ to solve $A\mathbf x = \mathbf b$ for $A = ${matTeX(A)}$ and $\mathbf b = ${tupleTeX(b)}$. What is $x_${k + 1}$?`,
          answer: x[k], tol: { rel: 1e-4, abs: 1e-6 },
          errors: Math.abs(x[1 - k] - x[k]) > 1e-9 ? [{ value: x[1 - k], feedback: t`That is $x_${2 - k}$.` }] : [],
          hints: [t`$\det A = ${det2(A)}$, so $A^{-1} = \dfrac{1}{${det2(A)}}${matTeX([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])}$.`, t`$\mathbf x = A^{-1}\mathbf b$: row ${k + 1} of $A^{-1}$ dotted with $\mathbf b$.`],
          teach: 'When A is invertible, the one solution of Ax = b is x = A⁻¹b.',
          explain: t`$\mathbf x = A^{-1}\mathbf b = (${qt(x[0])}, ${qt(x[1])})$. Check: $A\mathbf x = ${tupleTeX(matvec(A, x).map((v) => Math.round(v * 1e9) / 1e9))}$. ✓`,
          visual: map2d(A, { target: b, shape: 'none', ghost: false, colNames: ['a₁', 'a₂'], view: Math.max(2.5, ...b.map(Math.abs), ...A.flat().map(Math.abs)) * 0.9, caption: 'The columns of A, their grid of combinations, and b (red ring): x holds the weights that reach b.' }),
        };
      },
    }),
    mcq({
      id: 'which-singular', difficulty: 2,
      prompt: 'Which matrix has no inverse?',
      choices: [t`$${matTeX([[2, 4], [3, 6]])}$`, t`$${matTeX([[2, 4], [3, 5]])}$`, t`$${matTeX([[0, 1], [1, 0]])}$`, t`$${matTeX([[1, 0], [0, 0.01]])}$`],
      answer: 0,
      why: {
        1: t`$ad - bc = 10 - 12 = -2 \ne 0$: invertible. A negative determinant only means the map flips orientation.`,
        2: t`Zeros on the diagonal do not matter: $ad - bc = 0 - 1 = -1$. It swaps $x$ and $y$, and it is its own inverse.`,
        3: t`$ad - bc = 0.01$: small but not zero. It squeezes the plane hard, and $A^{-1}$ stretches it back by 100.`,
      },
      hints: [t`Compute $ad - bc$ for each.`, 'Look for a matrix whose second row is a multiple of its first.'],
      teach: 'A 2×2 matrix is singular exactly when ad − bc = 0 — when one row (or column) is a multiple of the other.',
      explain: t`$2\cdot6 - 4\cdot3 = 0$. Its second column is twice its first, so it sends the whole plane onto the line through $(2, 3)$; many points share each image, and no map can undo that.`,
    }),
    {
      type: 'slider', id: 'k-singular', difficulty: 2, param: 'k', answer: [3.9, 4.1],
      prompt: t`The matrix $A = \begin{bmatrix} 2 & k \\ 3 & 6 \end{bmatrix}$ depends on a number $k$. Slide $k$ to the value for which $A$ has **no** inverse.`,
      visual: { type: 'la-map2d', params: { A: [[2, 'k'], [3, 6]], sliders: [{ key: 'k', label: t`Entry $k$`, min: 0, max: 8, step: 0.5, value: 1, explain: t`The top-right entry of $A$.` }], view: 4.5, shape: 'square', readout: false }, caption: 'What A does to the unit square (gold) and the grid. Numbers are hidden: watch the shape.' },
      instruction: 'Slide k until the square collapses onto a line, then check.',
      hints: [t`$A$ has no inverse when $ad - bc = 0$.`, t`$2\cdot6 - 3k = 0$.`],
      teach: 'A matrix is singular when it flattens the plane, which for a 2×2 means ad − bc = 0.',
      explain: t`$12 - 3k = 0$ gives $k = 4$. Then the columns $(2, 3)$ and $(4, 6)$ are parallel, every image lies on one line, and the gold square has zero area.`,
    },
    mcq({
      id: 'socks-shoes', difficulty: 2,
      prompt: t`$A$ and $B$ are invertible. Which matrix undoes $AB$ (“$B$ first, then $A$”)?`,
      choices: [t`$B^{-1}A^{-1}$`, t`$A^{-1}B^{-1}$`, t`$A^{-1} + B^{-1}$`, t`$BA$`],
      answer: 0,
      why: {
        1: t`That undoes $B$ first, but $B$ was done first, so it is buried under $A$: $(A^{-1}B^{-1})(AB)$ does not simplify to $I$ unless $A$ and $B$ commute.`,
        2: 'Undoing a sequence of maps is another sequence of maps — a product, not a sum.',
        3: t`$BA$ applies the original maps again (in another order); it undoes nothing.`,
      },
      hints: ['To undo “socks, then shoes”, which do you take off first?', t`Check: $(B^{-1}A^{-1})(AB) = B^{-1}(A^{-1}A)B$.`],
      teach: 'The inverse of a product is the product of the inverses in reverse order: (AB)⁻¹ = B⁻¹A⁻¹.',
      explain: t`$(B^{-1}A^{-1})(AB) = B^{-1}(A^{-1}A)B = B^{-1}B = I$. The last map done is the first to be undone — socks, then shoes, on; shoes, then socks, off.`,
      visual: map2d([[1, 1], [0, 1]], { maps: [{ name: 'B', label: 'B (shear)', A: [[1, 1], [0, 1]] }, { name: 'A', label: 'A (quarter turn)', A: [[0, -1], [1, 0]] }], view: 2, colNames: ['', ''], columns: false, caption: 'B (a shear) first, then A (a quarter turn). To get the F back, the turn must be undone before the shear.' }),
    }),
    num({
      id: 'gauss-jordan', difficulty: 3,
      gen(r) {
        const L = [[1, 0, 0], [r.int(-2, 2), 1, 0], [r.int(-2, 2), r.int(-2, 2), 1]], U = [[1, r.int(-2, 2), r.int(-2, 2)], [0, 1, r.int(-2, 2)], [0, 0, 1]];
        const A = matmul(L, U), Ai = inverse(A).map((row) => row.map((v) => Math.round(v)));
        let i = r.int(0, 2), j = r.int(0, 2);
        if (i === j) j = (j + 1) % 3;
        const M = A.map((row, k) => [...row, ...[0, 1, 2].map((c) => (c === k ? 1 : 0))]);
        return {
          prompt: t`Use Gauss–Jordan elimination on $[\,A \mid I\,]$ to find $A^{-1}$ for $A = ${matTeX(A)}$. What is the entry in row ${i + 1}, column ${j + 1} of $A^{-1}$?`,
          answer: Ai[i][j], tol: { rel: 0, abs: 0.01 },
          errors: Ai[j][i] !== Ai[i][j] ? [{ value: Ai[j][i], feedback: t`That is the entry in row ${j + 1}, column ${i + 1}: rows and columns swapped.` }] : [],
          hints: ['Row-reduce the whole 3 × 6 matrix until its left half is I.', 'Clear below each pivot, then above it, scaling pivots to 1 (for this matrix every pivot comes out as 1).', 'The right half is then A⁻¹; check one entry of AA⁻¹ = I.'],
          teach: 'Gauss–Jordan on [A | I] performs on I exactly the operations that turn A into I, which builds A⁻¹.',
          explain: t`$A^{-1} = ${matTeX(Ai)}$, so the entry is $${Ai[i][j]}$. Check: row ${i + 1} of $A$ times column ${i + 1} of $A^{-1}$ gives 1, and every other row–column pair gives 0.`,
          visual: rr(M, { aug: 3, mode: 'rref', picture: 'none', colLabels: ['', '', '', '', '', ''], caption: 'The 3 × 6 matrix [A | I], ready for Gauss–Jordan. The bar separates A from I.' }),
        };
      },
    }),
    mcq({
      id: 'cancel', difficulty: 3,
      prompt: t`$A$ is a nonzero $2\times2$ matrix and $AB = AC$. Must $B = C$?`,
      choices: [t`Only if $A$ is invertible; then multiply both sides by $A^{-1}$`, t`Yes, always: cancel the $A$`, t`Yes, because $A$ is not the zero matrix`, t`Never: $B$ and $C$ must be different`],
      answer: 0,
      why: {
        1: t`Cancelling is multiplying by $A^{-1}$ — which does not exist for a singular $A$.`,
        2: t`Nonzero is not enough. $A = ${matTeX([[1, 0], [0, 0]])}$ is nonzero, yet $AB = AC$ for $B = ${matTeX([[1, 0], [0, 1]])}$ and $C = ${matTeX([[1, 0], [0, 5]])}$.`,
        3: t`$B = C$ certainly satisfies $AB = AC$; the question is whether it is forced.`,
      },
      hints: [t`What would you multiply by to “cancel” $A$ on the left?`, t`Try $A = ${matTeX([[1, 0], [0, 0]])}$, which keeps $x$ and throws away $y$.`],
      teach: 'Matrices can be cancelled only when they are invertible; a singular A throws information away.',
      explain: t`If $A^{-1}$ exists, $A^{-1}AB = A^{-1}AC$ gives $B = C$. If not, $A$ flattens the plane, and $B$ and $C$ can differ in exactly the direction $A$ destroys: with $A = ${matTeX([[1, 0], [0, 0]])}$, anything $B$ and $C$ do to the $y$-direction is invisible after $A$.`,
      visual: map2d([[1, 0], [0, 0]], { view: 1.5, caption: 'A = [[1, 0], [0, 0]] flattens the plane onto the x-axis: every point on a vertical line lands on the same spot.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-inverse', difficulty: 2,
      gen(r) {
        const A = mat2(r), d = det2(A), Ai = [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
        const [i, j] = r.pick([[0, 1], [1, 0], [1, 1], [0, 0]]);
        return {
          prompt: t`For $A = ${matTeX(A)}$, find the entry in row ${i + 1}, column ${j + 1} of $A^{-1}$.`,
          answer: Ai[i][j], tol: { rel: 1e-4, abs: 1e-6 },
          hints: [t`$A^{-1} = \dfrac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}$.`],
          teach: 'Swap the diagonal, negate the off-diagonal, divide by the determinant.',
          explain: t`$\det A = ${d}$ and $A^{-1} = \dfrac{1}{${d}}${matTeX([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])}$: the entry is $${qt(Ai[i][j])}$.`,
          visual: map2d(A, { view: Math.max(2, ...A.flat().map(Math.abs)) * 0.9 }),
        };
      },
    }),
    num({
      id: 'cp-calibration', difficulty: 3, transfer: true,
      gen(r) {
        const M = [[r.pick([1.02, 1.03, 0.98]), r.pick([0.04, -0.03, 0.05])], [r.pick([-0.02, 0.03, -0.04]), r.pick([0.97, 1.01, 0.99])]];
        const a = [r.pick([0.6, 1.2, -0.8, 2.4]), r.pick([9.81, -3.5, 4.9, 7.2])], read = matvec(M, a).map((v) => Math.round(v * 1000) / 1000);
        const truth = inverse(M).map((row) => row[0] * read[0] + row[1] * read[1]), k = r.int(0, 1);
        return {
          prompt: t`A two-axis accelerometer on a launch vehicle is slightly misaligned and mis-scaled: it reports $\mathbf r = M\mathbf a$ instead of the true acceleration $\mathbf a$, where ground calibration found $M = ${matTeX(M)}$. In flight it reads $\mathbf r = (${read[0]}, ${read[1]})$ m/s². What is the true ${k === 0 ? '$a_x$' : '$a_y$'}, in m/s², to 3 significant figures?`,
          answer: truth[k], units: 'm/s^2', tol: { rel: 0.002 },
          errors: Math.abs(read[k] - truth[k]) > 0.002 * Math.abs(truth[k]) ? [{ value: read[k], feedback: t`That is the raw reading. Undo the calibration matrix: $\mathbf a = M^{-1}\mathbf r$.` }] : [],
          hints: [t`$\mathbf a = M^{-1}\mathbf r$.`, t`$\det M = ${nice(det2(M), 5)}$; use the $2\times2$ formula.`],
          teach: 'A sensor that applies a known linear distortion M is corrected by applying M⁻¹ to its readings.',
          explain: t`$M^{-1} = \dfrac{1}{${nice(det2(M), 5)}}${matTeX([[M[1][1], -M[0][1]], [-M[1][0], M[0][0]]])}$, so $\mathbf a = M^{-1}\mathbf r \approx (${nice(truth[0], 4)}, ${nice(truth[1], 4)})$ m/s². The correction is small but systematic — exactly what drifts an inertial navigation solution if it is ignored. Real calibrations also remove offsets (biases) and temperature effects.`,
          visual: map2d(M, { view: 1.4, caption: 'The calibration matrix M is close to I: it shears and stretches the F only slightly.' }),
        };
      },
    }),
    mcq({
      id: 'cp-imt', difficulty: 2,
      prompt: t`For a $3\times3$ matrix $A$, which statement is **not** equivalent to “$A$ is invertible”?`,
      choices: ['A has no zero entries', t`$A\mathbf x = \mathbf 0$ has only the solution $\mathbf x = \mathbf 0$`, 'Elimination finds a pivot in every column of A', t`The columns of $A$ span $\mathbb R^3$`],
      answer: 0,
      why: {
        1: t`Equivalent: if $A\mathbf x = \mathbf 0$ had another solution, two different inputs ($\mathbf x$ and $\mathbf 0$) would share an output, and nothing could undo $A$.`,
        2: 'Equivalent: three pivots means Ax = b has exactly one solution for every b.',
        3: t`Equivalent: if the columns span $\mathbb R^3$, every $\mathbf b$ is reachable, and for a square matrix that forces a unique solution.`,
      },
      hints: ['Three of these say “no information is lost”. Which one is about the entries instead?', t`Think of $I$, which has zeros everywhere off the diagonal.`],
      teach: 'Invertibility is about what the map does — unique solutions, pivots, spanning columns — not about individual entries.',
      explain: t`The identity has six zero entries and is invertible, while $${matTeX([[1, 2, 3], [2, 4, 6], [1, 1, 1]])}$ has none and is not (row 2 is twice row 1). The other three statements are all part of the Invertible Matrix Theorem.`,
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §2.5', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 3: Multiplication and inverse matrices', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
