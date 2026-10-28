// Similar matrices: one linear map, described in different bases, has
// different matrices B = P⁻¹AP — and everything that belongs to the map
// itself (trace, determinant, eigenvalues) is the same in all of them.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matvec, matmul, det2, transpose, matTeX, tupleTeX, map2d } from './_la.js';
import { unimodular, inv2, trace, col, latticePic, plain } from './_eig.js';

const t = String.raw;
const DEG = Math.PI / 180;
const ORD = ['first', 'second'];
const round = (M) => M.map((row) => row.map((v) => Math.round(v)));
const conj = (A, P) => round(matmul(matmul(inv2(P), A), P));

// the operator picture: the basis b₁, b₂ on its lattice, and where A sends each
function opPic(A, P, { caption, images = true } = {}) {
  const b1 = col(P, 0), b2 = col(P, 1), Ab1 = matvec(A, b1), Ab2 = matvec(A, b2);
  return latticePic(b1, b2, {
    k: 7,
    arrows: images ? [{ from: [0, 0], to: Ab1, color: 'good', width: 2, dash: [6, 4], label: 'Ab₁' }, { from: [0, 0], to: Ab2, color: 'warn', width: 2, dash: [6, 4], label: 'Ab₂' }] : [],
    caption: caption || 'The basis b₁, b₂ with its lattice, and the images Ab₁, Ab₂ (dashed). Column j of the matrix in this basis is the coordinates of Abⱼ on the lattice.',
  });
}

// a small integer matrix and a basis matrix with det ±1 whose conjugate is still small and not equal to A
function pair(r) {
  for (let k = 0; k < 500; k++) {
    const A = [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]];
    if (A.flat().filter((v) => v !== 0).length < 3) continue;
    const P = unimodular(r, { range: 2 }), B = conj(A, P), p1 = col(P, 0), p2 = col(P, 1);
    if (Math.abs(p1[0] * p2[0] + p1[1] * p2[1]) > 0.85 * Math.hypot(...p1) * Math.hypot(...p2)) continue;   // a readable lattice
    if (B.flat().some((v) => Math.abs(v) > 9) || B.every((row, i) => row.every((v, j) => v === A[i][j]))) continue;
    return { A, P, B };
  }
  return { A: [[1, 2], [0, 3]], P: [[1, 1], [0, 1]], B: [[1, 0], [0, 3]] };
}

// a position (i, j) of a nonzero entry, so that no answer is 0
const nonzero = (r, B) => r.pick([[0, 0], [0, 1], [1, 0], [1, 1]].filter(([i, j]) => B[i][j] !== 0));

// a 3D rotation about a unit axis n by angle a (Rodrigues)
function rot3(n, a) {
  const [x, y, z] = n, c = Math.cos(a), s = Math.sin(a), C = 1 - c;
  return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]];
}

// the Explore picture: a fixed A, a basis of two unit vectors at angles al and be (degrees), and P⁻¹AP read out
const AX = [[2, 1], [0, 3]];
const explore = (() => {
  const [[a, b], [c, d]] = AX;
  const ca = 'cos(al*pi/180)', sa = 'sin(al*pi/180)', cb = 'cos(be*pi/180)', sb = 'sin(be*pi/180)';
  const u1 = `(${a}*${ca} + ${b}*${sa})`, v1 = `(${c}*${ca} + ${d}*${sa})`, u2 = `(${a}*${cb} + ${b}*${sb})`, v2 = `(${c}*${cb} + ${d}*${sb})`;
  const D = `(${ca}*${sb} - ${cb}*${sa})`;
  return {
    sliders: [
      { key: 'al', label: t`Direction of $\mathbf b_1$`, min: -20, max: 30, step: 5, value: 0, unit: t`^\circ`, explain: t`The angle of the unit vector $\mathbf b_1$ from the $x$-axis.` },
      { key: 'be', label: t`Direction of $\mathbf b_2$`, min: 35, max: 155, step: 5, value: 90, unit: t`^\circ`, explain: t`The angle of the unit vector $\mathbf b_2$. The two never line up, so they stay a basis.` },
    ],
    curves: [
      { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [3, 4] },
      { param: [`${a}*cos(t) + ${b}*sin(t)`, `${c}*cos(t) + ${d}*sin(t)`], t: [0, 6.2832], color: 'ink3', width: 1.2, dash: [5, 4] },
    ],
    arrows: [
      { from: [0, 0], to: [ca, sa], color: 'good', width: 3, label: 'b₁' },
      { from: [0, 0], to: [cb, sb], color: 'warn', width: 3, label: 'b₂' },
      { from: [0, 0], to: [u1, v1], color: 'good', width: 2, dash: [6, 4], label: 'Ab₁' },
      { from: [0, 0], to: [u2, v2], color: 'warn', width: 2, dash: [6, 4], label: 'Ab₂' },
    ],
    readouts: [
      { label: t`$B_{11}$`, expr: `(${sb}*${u1} - ${cb}*${v1})/${D}`, digits: 3 },
      { label: t`$B_{12}$`, expr: `(${sb}*${u2} - ${cb}*${v2})/${D}`, digits: 3 },
      { label: t`$B_{21}$`, expr: `(-${sa}*${u1} + ${ca}*${v1})/${D}`, digits: 3 },
      { label: t`$B_{22}$`, expr: `(-${sa}*${u2} + ${ca}*${v2})/${D}`, digits: 3 },
      { label: t`trace $B_{11} + B_{22}$`, expr: `(${sb}*${u1} - ${cb}*${v1})/${D} + (-${sa}*${u2} + ${ca}*${v2})/${D}`, digits: 3 },
      { label: t`$\det B$`, expr: `((${sb}*${u1} - ${cb}*${v1})*(-${sa}*${u2} + ${ca}*${v2}) - (${sb}*${u2} - ${cb}*${v2})*(-${sa}*${u1} + ${ca}*${v1}))/${D}^2`, digits: 3 },
    ],
  };
})();

export default lesson({
  id: 'math2270.LA-7.3',
  title: 'Similar matrices: one operator, many matrices',
  minutes: 11, difficulty: 3,
  intro: t`A linear map $T$ is a thing that acts on arrows; its matrix depends on the basis you describe it in. If $A$ is its matrix in the standard basis and the columns of $P$ are a new basis $\mathcal B$, then in $\mathcal B$-coordinates the same map has the matrix
$$[T]_{\mathcal B} = P^{-1}AP:$$
convert $\mathcal B$-coordinates to standard ones ($P$), apply the map ($A$), convert back ($P^{-1}$). Two matrices related this way, $B = P^{-1}AP$, are called **similar**: they are **one operator described in two bases**. So they share everything that belongs to the map rather than to the description — **trace, determinant, eigenvalues, rank** — while their entries can look nothing alike. The best basis makes the matrix as simple as possible: often diagonal, which is the whole point of eigenvectors (LA-9).`,
  symbols: [
    { tex: 'T', text: t`a linear map of the space to itself (an *operator*): it exists before any basis is chosen` },
    { tex: 'A', text: t`the matrix of $T$ in the standard basis: its columns are $T(\mathbf e_1), T(\mathbf e_2), \dots$` },
    { tex: 'P', text: t`the invertible matrix whose columns are the new basis vectors $\mathbf b_1, \dots, \mathbf b_n$ (it is $P_{\mathcal B}$ from LA-7.1)` },
    { tex: t`[T]_{\mathcal B} = P^{-1}AP`, text: t`the matrix of the same map in $\mathcal B$-coordinates: its column $j$ is $[T(\mathbf b_j)]_{\mathcal B}$` },
    { tex: t`\operatorname{tr}A`, text: t`the trace: the sum of the diagonal entries, $a_{11} + a_{22} + \dots$ — one of the numbers every similar matrix shares` },
  ],
  why: 'A physical quantity cannot depend on the axes you happened to pick: the invariants of similar matrices — trace, determinant, eigenvalues — are the parts of a matrix that physics is allowed to care about.',
  visual: {
    type: 'graph',
    title: 'Same map, different basis, different matrix',
    lead: t`The map is fixed: $A = ${matTeX(AX)}$ (the dashed ellipse is where it sends the unit circle). Choose a basis of two unit vectors $\mathbf b_1, \mathbf b_2$ with the sliders; the dashed arrows are $A\mathbf b_1$ and $A\mathbf b_2$. The readout is the matrix $B = P^{-1}AP$ of the same map in your basis.`,
    tasks: [
      'At 0° and 90° the basis is the standard one, and B is A itself.',
      'Turn b₂: all four entries change, but the trace stays 5 and the determinant 6.',
      'Set b₂ to 45°. Now Ab₂ lies along b₂ (and Ab₁ along b₁): B is diagonal, with 2 and 3 — the map only stretches along these two directions.',
    ],
    params: {
      x: [-4.6, 4.6], y: [-3.4, 3.4], aspect: 'wide', equal: true, xlabel: '', ylabel: '', grid: true,
      ...explore,
    },
    caption: 'The map A never changes; only the basis you describe it in does. Faint dotted: the unit circle; dashed: its image under A.',
  },
  example: {
    prompt: t`Find the matrix of $A = ${matTeX([[4, -2], [1, 1]])}$ in the basis $\mathbf b_1 = (2, 1)$, $\mathbf b_2 = (1, 1)$, and check what it shares with $A$.`,
    visual: map2d([[4, -2], [1, 1]], { maps: [{ name: 'P', label: 'P (to the b-cell)', A: [[2, 1], [1, 1]] }, { name: 'A', label: 'A', A: [[4, -2], [1, 1]] }], shape: 'square', view: 5.4, colNames: ['', ''], readout: ['A'], caption: 'First P turns the unit square into the cell of the b-basis (gold); then A stretches that cell 3 times along b₁ and 2 times along b₂ — its sides stay on the same lines. The readout is AP.' }),
    steps: [
      { label: 'Apply the map', text: t`$A\mathbf b_1 = (8 - 2,\ 2 + 1) = (6, 3) = 3\mathbf b_1$ and $A\mathbf b_2 = (4 - 2,\ 1 + 1) = (2, 2) = 2\mathbf b_2$.` },
      { label: 'Read the columns', text: t`Column $j$ of $[T]_{\mathcal B}$ is $[A\mathbf b_j]_{\mathcal B}$: $(3, 0)$ and $(0, 2)$. So $[T]_{\mathcal B} = ${matTeX([[3, 0], [0, 2]])}$.` },
      { label: 'By the formula', text: t`$P = ${matTeX([[2, 1], [1, 1]])}$ has $\det P = 1$, so $P^{-1} = ${matTeX([[1, -1], [-1, 2]])}$ and $P^{-1}AP = ${matTeX([[1, -1], [-1, 2]])}${matTeX([[6, 2], [3, 2]])} = ${matTeX([[3, 0], [0, 2]])}$. ✓` },
      { label: 'Invariants', text: t`$\operatorname{tr}A = 4 + 1 = 5 = 3 + 2$ and $\det A = 4 + 2 = 6 = 3\cdot2$. Same trace, same determinant — one map, two descriptions.` },
      { label: 'Meaning', text: t`In this basis the map is just “stretch $\mathbf b_1$ by 3, $\mathbf b_2$ by 2”. The basis vectors were chosen along the directions $A$ does not turn — its eigenvectors.` },
    ],
    answer: t`$[T]_{\mathcal B} = P^{-1}AP = ${matTeX([[3, 0], [0, 2]])}$, with the same trace (5) and determinant (6) as $A$.`,
  },
  practice: [
    mcq({
      id: 'invariants', difficulty: 1,
      prompt: t`$B = P^{-1}AP$ for some invertible $P$. Which of these must $B$ share with $A$?`,
      choices: [t`The trace, $\operatorname{tr}B = \operatorname{tr}A$`, t`The top-left entry, $b_{11} = a_{11}$`, t`Symmetry: if $A = A^{\mathsf T}$ then $B = B^{\mathsf T}$`, t`The eigenvectors: if $A\mathbf v = \lambda\mathbf v$ then $B\mathbf v = \lambda\mathbf v$`],
      answer: 0,
      why: {
        1: 'Individual entries depend on the basis; in the worked example a₁₁ = 4 became 3.',
        2: t`Only an orthogonal $P$ (a rotation or reflection, $P^{-1} = P^{\mathsf T}$) keeps a symmetric matrix symmetric. A skewed basis generally does not.`,
        3: t`The eigen*values* are shared, but the eigenvectors are described in new coordinates: $B$'s eigenvector is $P^{-1}\mathbf v$.`,
      },
      hints: [t`Ask which quantity belongs to the map itself rather than to the coordinates. (In LA-8 you will see that $\det(P^{-1}AP) = \det A$ too.)`],
      teach: 'Similar matrices share trace, determinant, eigenvalues and rank — the properties of the map, not of the basis.',
      explain: t`$\operatorname{tr}(XY) = \operatorname{tr}(YX)$ for any square $X, Y$, so $\operatorname{tr}(P^{-1}AP) = \operatorname{tr}(APP^{-1}) = \operatorname{tr}A$. Entries, symmetry and eigenvector coordinates all depend on the basis.`,
      visual: opPic([[4, -2], [1, 1]], [[2, 1], [1, 1]], { caption: 'The worked example’s map in its good basis: Ab₁ = 3b₁ and Ab₂ = 2b₂ land on the lattice lines through b₁ and b₂.' }),
    }),
    num({
      id: 'conj-entry', difficulty: 2,
      gen(r) {
        const { A, P, B } = pair(r);
        const [i, j] = nonzero(r, B), rev = round(matmul(matmul(P, A), inv2(P)));
        const errors = [];
        if (rev[i][j] !== B[i][j]) errors.push({ value: rev[i][j], feedback: t`That is $PAP^{-1}$: the conversions are in the wrong order. $P$ acts first on $\mathcal B$-coordinates, so it stands on the right.` });
        if (A[i][j] !== B[i][j] && A[i][j] !== rev[i][j]) errors.push({ value: A[i][j], feedback: 'That is the entry of A itself. The entries change with the basis.' });
        const bj = col(P, j), Abj = matvec(A, bj);
        return {
          prompt: t`$A = ${matTeX(A)}$, and the basis $\mathcal B$ is $\mathbf b_1 = ${tupleTeX(col(P, 0))}$, $\mathbf b_2 = ${tupleTeX(col(P, 1))}$. Find the $(${i + 1}, ${j + 1})$ entry of $[T]_{\mathcal B} = P^{-1}AP$.`,
          answer: B[i][j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`Column ${j + 1} of $[T]_{\mathcal B}$ is the $\mathcal B$-coordinates of $A\mathbf b_${j + 1} = ${tupleTeX(Abj)}$.`, t`$P^{-1} = ${matTeX(round(inv2(P)))}$ (here $\det P = ${det2(P)}$); multiply $P^{-1}$ by $A\mathbf b_${j + 1}$.`],
          teach: t`Column $j$ of $P^{-1}AP$ is $A\mathbf b_j$ written in the basis $\mathcal B$.`,
          explain: t`$A\mathbf b_${j + 1} = ${tupleTeX(Abj)} = ${B[0][j]}\,\mathbf b_1 + (${B[1][j]})\,\mathbf b_2$, so column ${j + 1} is $${tupleTeX(col(B, j))}$. In full, $P^{-1}AP = ${matTeX(B)}$ — trace $${trace(B)}$ and determinant $${det2(B)}$, the same as $A$'s.`,
          visual: opPic(A, P),
        };
      },
    }),
    num({
      id: 'missing', difficulty: 2,
      gen(r) {
        let { A, B } = pair(r);
        for (let k = 0; k < 50 && B[0][0] === 0; k++) ({ A, B } = pair(r));
        const tr = trace(A);
        return {
          prompt: t`$A = ${matTeX(A)}$ is similar to $B = \begin{bmatrix} x & ${B[0][1]} \\ ${B[1][0]} & ${B[1][1]} \end{bmatrix}$. Find $x$.`,
          answer: B[0][0], tol: { rel: 0, abs: 0.01 },
          errors: A[0][0] !== B[0][0] ? [{ value: A[0][0], feedback: 'Similar matrices need not share entries. Use a quantity they must share.' }] : [],
          hints: ['Similar matrices have the same trace.', t`$x + ${B[1][1] < 0 ? `(${B[1][1]})` : B[1][1]} = \operatorname{tr}A = ${tr}$.`],
          teach: 'An unknown entry of a similar matrix can be pinned down by an invariant such as the trace.',
          explain: t`$\operatorname{tr}A = ${A[0][0]} + (${A[1][1]}) = ${tr}$, so $x = ${tr} - (${B[1][1]}) = ${B[0][0]}$. Check with the determinant: $${B[0][0]}\cdot(${B[1][1]}) - (${B[0][1]})(${B[1][0]}) = ${det2(B)} = \det A$. ✓`,
          visual: map2d(A, { view: 2.6, caption: 'The map A acting on the plane. A similar matrix describes this same map in another basis.' }),
        };
      },
    }),
    mcq({
      id: 'not-similar', difficulty: 3,
      prompt: t`$S = ${matTeX([[1, 1], [0, 1]])}$ and $I = ${matTeX([[1, 0], [0, 1]])}$ have the same trace (2), the same determinant (1) and the same eigenvalues (1, 1). Are they similar?`,
      choices: [
        t`No: $P^{-1}IP = I$ for every $P$, so nothing but $I$ is similar to $I$`,
        t`Yes: matching trace, determinant and eigenvalues means similar`,
        t`Yes, with $P = S$`,
        t`No, because $S$ is not invertible`,
      ],
      answer: 0,
      why: {
        1: 'Those invariants are necessary for similarity but not sufficient — this pair is the standard counterexample.',
        2: t`$S^{-1}IS = S^{-1}S = I \ne S$. No choice of $P$ can turn $I$ into anything else.`,
        3: t`$\det S = 1$, so $S$ is invertible. The obstacle is different.`,
      },
      hints: [t`Compute $P^{-1}IP$ for a general invertible $P$.`, t`Geometrically: $I$ does nothing in every basis. $S$ shears — does a shear look like “doing nothing” in any basis?`],
      teach: 'Equal trace, determinant and eigenvalues are necessary for similarity, not sufficient.',
      explain: t`$P^{-1}IP = P^{-1}P = I$ always: the identity map is the identity matrix in every basis. The shear $S$ moves points, so in no basis is it “do nothing”. Same invariants, different maps. (LA-9.3 shows the real difference: $S$ has only one line of eigenvectors, so it cannot be diagonalized.)`,
      visual: map2d([[1, 1], [0, 1]], { view: 1.8, caption: 'The shear S: it slides every horizontal line sideways in proportion to its height. The identity would leave the F where it started.' }),
    }),
    num({
      id: 'reflect', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, -2], [2, -1], [1, -3]]);
        const s = p * p + q * q, k = r.pick([[0, 0], [0, 1], [1, 1]]);
        const A = [[(p * p - q * q) / s, (2 * p * q) / s], [(2 * p * q) / s, (q * q - p * p) / s]], ans = A[k[0]][k[1]];
        const errors = k[0] !== k[1] ? [{ value: -ans, feedback: t`That is the reflection in the line through $(${p}, ${-q})$: it comes from $P^{-1}DP$ instead of $PDP^{-1}$.` }] : [];
        return {
          prompt: t`$T$ reflects the plane in the line through the origin and $(${p}, ${q})$. In the basis $\mathbf b_1 = (${p}, ${q})$ (along the line), $\mathbf b_2 = (${-q}, ${p})$ (across it), its matrix is $D = ${matTeX([[1, 0], [0, -1]])}$. Find the $(${k[0] + 1}, ${k[1] + 1})$ entry of its standard matrix $A$. Give a decimal.`,
          answer: ans, tol: { rel: 0.005, abs: 0.002 }, errors,
          hints: [t`$D = P^{-1}AP$, so $A = PDP^{-1}$ with $P = ${matTeX([[p, -q], [q, p]])}$.`, t`$\det P = ${s}$ and $P^{-1} = \frac{1}{${s}}${matTeX([[p, q], [-q, p]])}$.`],
          teach: t`To build a standard matrix from a good basis, run the similarity backwards: $A = PDP^{-1}$.`,
          explain: t`$A = PDP^{-1} = \frac{1}{${s}}${matTeX([[p * p - q * q, 2 * p * q], [2 * p * q, q * q - p * p]])}$, so the entry is $${nice(ans)}$. A diagonal matrix in the right basis, a full one in the standard basis — the same reflection.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4, 4], y: [-2.6, 2.6], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
              curves: [{ param: [`${p}*t`, `${q}*t`], t: [-5, 5], color: 'violet', width: 2, dash: [7, 5], label: 'mirror', labelAt: 0.75 * Math.min(2.3 / Math.abs(q), 3.6 / Math.abs(p)) }],
              arrows: [{ from: [0, 0], to: [p / Math.sqrt(s) * 1.6, q / Math.sqrt(s) * 1.6], color: 'good', width: 3, label: 'b₁ (direction)' }, { from: [0, 0], to: [-q / Math.sqrt(s) * 1.6, p / Math.sqrt(s) * 1.6], color: 'warn', width: 3, label: 'b₂ (direction)' }],
            },
            caption: 'The mirror line and the two basis directions (drawn shortened): T keeps b₁ and flips b₂.',
          },
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`For $A = ${matTeX([[1, 2], [0, 3]])}$ and the basis $\mathbf b_1 = (1, 0)$, $\mathbf b_2 = (1, 1)$, a student computes the matrix of the map in that basis as
$$PAP^{-1} = ${matTeX([[1, 1], [0, 1]])}${matTeX([[1, 2], [0, 3]])}${matTeX([[1, -1], [0, 1]])} = ${matTeX([[1, 4], [0, 3]])}.$$
What is wrong?`,
      choices: [
        t`The order: the matrix in the new basis is $P^{-1}AP = ${matTeX([[1, 0], [0, 3]])}$`,
        t`Nothing: $PAP^{-1}$ and $P^{-1}AP$ are always equal`,
        t`$P$ should have the basis vectors as rows`,
        t`The answer must equal $A$, because similar matrices are equal`,
      ],
      answer: 0,
      why: {
        1: t`They are equal only when $P$ commutes with $A$. Here $P^{-1}AP$ is diagonal and $PAP^{-1}$ is not.`,
        2: t`Columns are right: $P$ must turn $\mathcal B$-coordinates into standard ones, $P\,\mathbf e_j = \mathbf b_j$.`,
        3: 'Similar matrices share invariants, not entries.',
      },
      hints: [t`Test the student's matrix: its first column should be $[A\mathbf b_1]_{\mathcal B}$, and its second $[A\mathbf b_2]_{\mathcal B}$.`, t`$A\mathbf b_2 = (3, 3) = 3\mathbf b_2$, so column 2 must be $(0, 3)$.`],
      teach: t`The matrix in the basis of $P$'s columns is $P^{-1}AP$ — $P$ acts first, on the $\mathcal B$-coordinates.`,
      explain: t`$A\mathbf b_1 = (1, 0) = \mathbf b_1$ and $A\mathbf b_2 = (3, 3) = 3\mathbf b_2$, so $[T]_{\mathcal B} = P^{-1}AP = ${matTeX([[1, 0], [0, 3]])}$. The student's $PAP^{-1}$ is the matrix of the map in the basis given by the columns of $P^{-1}$ — a different basis.`,
      visual: opPic([[1, 2], [0, 3]], [[1, 1], [0, 1]], { caption: 'The basis b₁ = (1, 0), b₂ = (1, 1) on its lattice, and A applied to each (dashed).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-conj', difficulty: 2,
      gen(r) {
        const { A, P, B } = pair(r);
        const [i, j] = nonzero(r, B);
        return {
          prompt: t`$A = ${matTeX(A)}$ and $P = ${matTeX(P)}$. Find the $(${i + 1}, ${j + 1})$ entry of $P^{-1}AP$.`,
          answer: B[i][j], tol: { rel: 0, abs: 0.01 },
          hints: [t`$P^{-1} = ${matTeX(round(inv2(P)))}$.`],
          teach: t`Column $j$ of $P^{-1}AP$ is $A\mathbf b_j$ in $\mathcal B$-coordinates.`,
          explain: t`$P^{-1}AP = ${matTeX(B)}$.`,
          visual: opPic(A, P),
        };
      },
    }),
    mcq({
      id: 'cp-pair', difficulty: 2,
      prompt: t`Which matrix is similar to $A = ${matTeX([[2, 1], [0, 3]])}$?`,
      choices: [t`$${matTeX([[3, 0], [5, 2]])}$`, t`$${matTeX([[2, 0], [0, 2]])}$`, t`$${matTeX([[1, 4], [1, 1]])}$`, t`$${matTeX([[2, 1], [0, 4]])}$`],
      answer: 0,
      why: {
        1: 'Its trace is 4 and its determinant 4, not 5 and 6. (It is 2I, which is similar only to itself.)',
        2: t`Trace $2$, determinant $1 - 4 = -3$: neither matches $A$'s $5$ and $6$.`,
        3: 'Same top row, but trace 6 and determinant 8. Shared entries prove nothing; shared invariants are what count.',
      },
      hints: ['Compare trace and determinant first: a mismatch rules a matrix out.', 'The survivor has eigenvalues 2 and 3, two different numbers — so both matrices are diagonal (diag(2, 3)) in a suitable basis.'],
      teach: 'Trace and determinant rule candidates out; distinct shared eigenvalues rule them in.',
      explain: t`$${matTeX([[3, 0], [5, 2]])}$ has trace 5 and determinant 6, so its eigenvalues are 3 and 2, like $A$'s. Each matrix, with two distinct eigenvalues, is similar to $\operatorname{diag}(2, 3)$ — and so to each other.`,
      visual: map2d([[2, 1], [0, 3]], { view: 2.6, eigen: true, caption: 'A = [[2, 1], [0, 3]] with its two invariant lines (dashed): it stretches one by 2 and the other by 3.' }),
    }),
    num({
      id: 'cp-inertia', difficulty: 3, transfer: true,
      gen(r) {
        const J = [[r.int(110, 140), -r.int(2, 8), r.int(1, 6)], [0, r.int(140, 170), r.int(3, 9)], [0, 0, r.int(80, 105)]];
        J[1][0] = J[0][1]; J[2][0] = J[0][2]; J[2][1] = J[1][2];
        const n = r.pick([[1, 1, 1], [1, 2, 2], [2, 1, 2], [1, -1, 2]]), nn = Math.hypot(...n), a = r.pick([25, 30, 40, 50]) * DEG;
        const R = rot3(n.map((v) => v / nn), a), Jp = matmul(matmul(transpose(R), J), R);
        const xx = Math.round(Jp[0][0] * 10) / 10, yy = Math.round(Jp[1][1] * 10) / 10, tr = J[0][0] + J[1][1] + J[2][2];
        const ans = tr - xx - yy;
        return {
          prompt: t`A small satellite’s inertia tensor in its design axes is $J = ${matTeX(J)}\ \text{kg m}^2$. The attitude team works in sensor axes, turned relative to the design axes by a rotation $R$, where the tensor is $J' = R^{\mathsf T}JR$. They measure $J'_{xx} = ${xx}$ and $J'_{yy} = ${yy}$ kg m². What is $J'_{zz}$?`,
          answer: ans, units: 'kg m^2', tol: { rel: 0.002, abs: 0.15 },
          errors: [{ value: J[2][2], feedback: t`That is the design-axes value. A general rotation changes every diagonal entry; what it keeps is their sum.` }],
          hints: [t`For a rotation $R^{\mathsf T} = R^{-1}$, so $J' = R^{-1}JR$ is similar to $J$.`, t`Similar matrices have equal traces: $J'_{xx} + J'_{yy} + J'_{zz} = ${J[0][0]} + ${J[1][1]} + ${J[2][2]}$.`],
          teach: 'A rotated inertia tensor is similar to the original, so the sum of the moments of inertia about any three perpendicular axes is the same.',
          explain: t`$\operatorname{tr}J = ${tr}$ kg m², so $J'_{zz} = ${tr} - ${xx} - ${yy} = ${nice(ans)}$ kg m². The trace of an inertia tensor equals $2\sum m\,r^2$ about the centre of mass — a property of the body, not of the axes. (The eigenvalues, the principal moments, are invariant too: LA-9.1.)`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 2,
              segments: [0, 1, 2].flatMap((k) => [{ from: [0, 0, 0], to: [0, 1, 2].map((m) => (m === k ? 1.5 : 0)), color: 'ink3', dash: true }]),
              vectors: [0, 1, 2].map((k) => ({ to: col(R, k).map((v) => 1.5 * v), color: ['good', 'warn', 'violet'][k], label: [t`x'`, t`y'`, t`z'`][k] })),
            },
            caption: 'Design axes (dashed) and the turned sensor axes x′, y′, z′ — one rotation apart. Drag to rotate.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.2 and §8.3', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 28: Similar matrices and Jordan form', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
