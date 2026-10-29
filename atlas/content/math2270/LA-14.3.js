// Bilinear forms and the metric idea: a form B(u, v) = [u]ᵀB[v] changes basis
// by congruence, B → PᵀBP (not similarity); a metric is a symmetric
// nondegenerate form, and Sylvester's law makes its signature — the counts of
// +, − and 0 in any diagonal form — independent of the basis. Minkowski's η.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matvec, matTeX, tupleTeX, colTeX, inverse, transpose, matmul } from './_la.js';
import { detN } from './_eig.js';
import { unimod2, unimod3, round, congruent, similar, rowTeX, conicPic } from './_dual.js';

const t = String.raw;
const ORD = ['first', 'second'];
const EX_B = [[1, 2], [2, 1]];
const EX_P = [[1, -2], [0, 1]];

// a random symmetric 2×2 integer form, nondegenerate, not diagonal
function symForm(r, { definite = null } = {}) {
  for (let k = 0; k < 500; k++) {
    const a = r.intExcept(-3, 4, [0]), c = r.intExcept(-3, 4, [0]), b = r.intExcept(-3, 3, [0]), d = a * c - b * b;
    if (d === 0) continue;
    if (definite === true && !(d > 0 && a > 0)) continue;
    return [[a, b], [b, c]];
  }
  return [[2, 1], [1, 3]];
}
// window half-height for a form's level curves
const viewFor = (B) => { const ev = Math.abs((B[0][0] + B[1][1]) / 2) + Math.hypot((B[0][0] - B[1][1]) / 2, B[0][1]); return Math.min(3, Math.max(1.6, 2.2 / Math.sqrt(Math.max(0.3, ev)) + 0.4)); };
const basisArrows = (P, names = ['b′₁', 'b′₂']) => [0, 1].map((j) => ({ from: [0, 0], to: [P[0][j], P[1][j]], color: j ? 'warn' : 'gold', width: 3, label: names[j] }));
const signs = (n) => (n < 0 ? 'negative' : 'positive');

export default lesson({
  id: 'math2270.LA-14.3',
  title: 'Bilinear forms and the metric idea',
  minutes: 13, difficulty: 3,
  intro: t`A **bilinear form** eats two vectors and returns a number, linearly in each: $B(\mathbf u, \mathbf v)$. In a basis it is a matrix, $B_{ij} = B(\mathbf b_i, \mathbf b_j)$, and $B(\mathbf u, \mathbf v) = [\mathbf u]^{\mathsf T}B\,[\mathbf v]$. Change basis by $P$ (new basis vectors = columns of $P$), and each slot gets its own $P$:
$$B' = P^{\mathsf T}BP \qquad \text{(congruence — not the similarity } P^{-1}AP \text{ of a linear map)}$$
Congruence keeps a symmetric matrix symmetric, but it changes the eigenvalues. What survives is subtler: **Sylvester’s law of inertia** — however you diagonalize a symmetric $B$ by congruence, the numbers of positive, negative and zero diagonal entries come out the same. That triple is the **signature**; [LA-11.3](#/lesson/math2270.LA-11.3) proves the law from the spectral theorem. A **metric** is a symmetric bilinear form that is *nondegenerate* (no nonzero $\mathbf v$ has $g(\mathbf v, \cdot) = 0$). If it is positive definite it is an inner product, with lengths and angles; if not, it is still a metric — spacetime’s $\eta = \operatorname{diag}(-1, 1, 1, 1)$, with $c = 1$ and signature $(-, +, +, +)$, is one. A metric also turns vectors into covectors, $\mathbf v \mapsto g(\mathbf v, \cdot)$, with components $g[\mathbf v]$: “lowering an index”.`,
  symbols: [
    { tex: t`B(\mathbf u, \mathbf v)`, text: t`a bilinear form: linear in $\mathbf u$ for fixed $\mathbf v$ and in $\mathbf v$ for fixed $\mathbf u$` },
    { tex: 'B', text: t`its matrix in a basis, $B_{ij} = B(\mathbf b_i, \mathbf b_j)$` },
    { tex: 'P', text: t`the change-of-basis matrix: columns are the new basis vectors in old coordinates` },
    { tex: t`B'`, text: t`the same form’s matrix in the new basis, $P^{\mathsf T}BP$` },
    { tex: t`g,\ \eta`, text: t`a metric (symmetric and nondegenerate); $\eta$ is Minkowski’s, $\operatorname{diag}(-1, 1, 1, 1)$ in an inertial frame with $c = 1$` },
    { tex: t`(n_+, n_-, n_0)`, text: 'the signature: how many positive, negative and zero entries any diagonal form of B has' },
  ],
  why: 'The metric of general relativity is a symmetric bilinear form at every point; its signature (−, +, +, +) is what separates time from space, and congruence is how its components change between observers and coordinate systems.',
  visual: {
    type: 'graph',
    title: 'One form, many matrices, one signature',
    lead: t`The symmetric form $B(\mathbf x, \mathbf y) = x_1y_1 + b\,(x_1y_2 + x_2y_1) + x_2y_2$ is drawn as the curve $B(\mathbf x, \mathbf x) = 1$ (solid) and $B(\mathbf x, \mathbf x) = -1$ (dashed). The new basis is $\mathbf b'_1 = (1, 0)$, $\mathbf b'_2 = (k, 1)$; the readouts give the entries of $B' = P^{\mathsf T}BP$ in that basis.`,
    tasks: [
      'With b = 0.5, slide k to −0.5: B′₁₂ becomes 0. The new basis is B-orthogonal, B′ = diag(1, 0.75), two positive entries: signature (2, 0). Notice b′₂ now runs along the ellipse’s tangent at the tip of b′₁.',
      'Take b past 1: the ellipse opens into hyperbolas (dotted: the null directions, B(x, x) = 0) and det B′ turns negative. At k = −b the diagonal holds one + and one −: signature (1, 1). No value of k changes that — Sylvester’s law.',
      'Set b = 1 exactly: det B′ = 0 for every k. The form is degenerate — B((1, −1), y) = 0 for every y — so it is not a metric.',
    ],
    params: {
      x: [-3.6, 3.6], y: [-1.8, 1.8], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
      sliders: [
        { key: 'b', label: t`$b$ (off-diagonal of $B$)`, min: -2, max: 2, step: 0.1, value: 0.5, explain: t`$B = \begin{bmatrix} 1 & b \\ b & 1 \end{bmatrix}$ in the standard basis.` },
        { key: 'k', label: t`$k$ (lean of $\mathbf b'_2$)`, min: -2, max: 2, step: 0.1, value: 0, explain: t`The new basis $\mathbf b'_2 = (k, 1)$; $\mathbf b'_1 = (1, 0)$ stays put.` },
      ],
      curves: [
        { polar: '1/sqrt(1 + b*sin(2*theta))', theta: [0, 6.2832], color: 'accent', width: 2.4 },
        { polar: '1/sqrt(-1 - b*sin(2*theta))', theta: [0, 6.2832], color: 'warn', width: 2, dash: [5, 4] },
        { param: ['t*cos(0.5*asin(-1/b))', 't*sin(0.5*asin(-1/b))'], t: [-6, 6], color: 'ink3', width: 1, dash: [2, 4], when: 'step(abs(b) - 1.05)' },
        { param: ['t*sin(0.5*asin(-1/b))', 't*cos(0.5*asin(-1/b))'], t: [-6, 6], color: 'ink3', width: 1, dash: [2, 4], when: 'step(abs(b) - 1.05)' },
      ],
      arrows: [{ from: [0, 0], to: [1, 0], color: 'gold', width: 3, label: 'b′₁', labelDy: 16 }, { from: [0, 0], to: ['k', 1], color: 'violet', width: 3, label: 'b′₂' }],
      readouts: [
        { label: t`$B'_{11}$`, expr: '1', digits: 3 },
        { label: t`$B'_{12}$`, expr: 'k + b', digits: 3 },
        { label: t`$B'_{22}$`, expr: 'k^2 + 2*b*k + 1', digits: 3 },
        { label: t`$\det B'$`, expr: '1 - b^2', digits: 3 },
      ],
    },
    caption: 'Solid: B(x, x) = 1; dashed: B(x, x) = −1; dotted (when |b| > 1): the null directions. Gold and violet: the new basis. The curves belong to the form and never move; only the matrix describing it changes with the basis.',
  },
  example: {
    prompt: t`Diagonalize the form $B(\mathbf x, \mathbf x) = x_1^2 + 4x_1x_2 + x_2^2$, with matrix $B = ${matTeX(EX_B)}$, by a change of basis, and find its signature. Compare with the eigenvalues of $B$ and with the similarity $P^{-1}BP$.`,
    visual: conicPic(EX_B, { arrows: basisArrows(EX_P), view: 1.9, caption: 'B(x, x) = 1 (solid) and = −1 (dashed) — hyperbolas, so B is indefinite — with the null directions dotted and the diagonalizing basis b′₁ = (1, 0), b′₂ = (−2, 1).' }),
    steps: [
      { label: 'Complete the square', text: t`$x_1^2 + 4x_1x_2 + x_2^2 = (x_1 + 2x_2)^2 - 3x_2^2$. In new coordinates $y_1 = x_1 + 2x_2$, $y_2 = x_2$ the form is $y_1^2 - 3y_2^2$.` },
      { label: 'The basis', text: t`Old coordinates from new: $x_1 = y_1 - 2y_2$, $x_2 = y_2$, so $P = ${matTeX(EX_P)}$ — its columns $\mathbf b'_1 = (1, 0)$ and $\mathbf b'_2 = (-2, 1)$ are the new basis.` },
      { label: 'Congruence', text: t`$P^{\mathsf T}BP = ${matTeX(transpose(EX_P))}${matTeX(EX_B)}${matTeX(EX_P)} = ${matTeX(congruent(EX_B, EX_P))}$. ✓ Check one entry: $B(\mathbf b'_2, \mathbf b'_2) = 4 - 8 + 1 = -3$.` },
      { label: 'Signature', text: t`One positive and one negative entry: signature $(1, 1, 0)$, an indefinite but nondegenerate form — the 1+1-dimensional Minkowski pattern. The eigenvalues of $B$ are $3$ and $-1$: different numbers, same signs, as Sylvester’s law requires.` },
      { label: 'Not similarity', text: t`$P^{-1}BP = ${matTeX(similar(EX_B, EX_P))}$: same eigenvalues $3, -1$ (trace 2, determinant $-3$), but not diagonal and not even symmetric. Similarity is the right law for a linear map; for a form it is the wrong one.` },
    ],
    answer: t`$P^{\mathsf T}BP = \operatorname{diag}(1, -3)$ with $P = ${matTeX(EX_P)}$; signature $(1, 1, 0)$, matching the signs of the eigenvalues $3$ and $-1$.`,
  },
  practice: [
    num({
      id: 'evaluate', difficulty: 1,
      gen(r) {
        let B, u, v, ans, swap;
        for (let k = 0; k < 200; k++) {
          B = [[r.int(-3, 3), r.int(-3, 3)], [r.int(-3, 3), r.int(-3, 3)]];
          u = [r.intExcept(-2, 2, [0]), r.int(-2, 2)]; v = [r.int(-2, 2), r.intExcept(-2, 2, [0])];
          ans = u.reduce((s, x, i) => s + x * (B[i][0] * v[0] + B[i][1] * v[1]), 0);
          swap = v.reduce((s, x, i) => s + x * (B[i][0] * u[0] + B[i][1] * u[1]), 0);
          if (ans !== 0 && swap !== ans && B[0][1] !== B[1][0]) break;
        }
        const Bv = matvec(B, v), sparse = [0, 1].every((j) => Math.abs(u[0] * B[0][j] + u[1] * B[1][j]) <= 3), m = Math.max(...u.map(Math.abs), ...v.map(Math.abs)) + 0.8;
        return {
          prompt: t`A bilinear form on $\mathbb R^2$ has matrix $B = ${matTeX(B)}$. Find $B(\mathbf u, \mathbf v) = \mathbf u^{\mathsf T}B\mathbf v$ for $\mathbf u = ${tupleTeX(u)}$ and $\mathbf v = ${tupleTeX(v)}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: swap, feedback: t`That is $B(\mathbf v, \mathbf u) = \mathbf v^{\mathsf T}B\mathbf u$. This $B$ is not symmetric, so the order of the slots matters.` }],
          hints: [t`First $B\mathbf v = ${colTeX(Bv)}$.`, t`Then dot with $\mathbf u$: $${u[0]}\cdot${Bv[0] < 0 ? `(${Bv[0]})` : Bv[0]} + ${u[1] < 0 ? `(${u[1]})` : u[1]}\cdot${Bv[1] < 0 ? `(${Bv[1]})` : Bv[1]}$.`],
          teach: t`$B(\mathbf u, \mathbf v) = \sum_{ij} u_iB_{ij}v_j$: the first vector meets the rows, the second the columns.`,
          explain: t`$B\mathbf v = ${colTeX(Bv)}$ and $\mathbf u^{\mathsf T}(B\mathbf v) = ${ans}$. With the slots swapped you would get $${swap}$: a bilinear form need not be symmetric — though a metric must be.`,
          visual: { type: 'ten-metric', params: { mode: 'form', T: B, U: u, V: v, tname: 'B', uname: 'u', vname: 'v', dragU: false, dragV: false, feed: sparse ? 'first' : false, crossings: false, levelLabels: false, readout: false, view: Math.min(6, Math.max(2, m)) }, caption: sparse ? 'The two arrows u and v on component axes, and the stack of lines of the covector B(u, ·): B(u, v) is the signed number of its lines that v crosses.' : 'The two arrows u and v on component axes. Fixing u turns B into a covector B(u, ·), which then eats v.' },
        };
      },
    }),
    num({
      id: 'congruence', difficulty: 2,
      gen(r) {
        let B, P, Bn, i, j;
        for (let k = 0; k < 200; k++) {
          B = symForm(r); P = unimod2(r, 2); Bn = congruent(B, P);
          if (Bn.flat().every((v) => Math.abs(v) <= 30)) break;
        }
        [i, j] = r.pick([[0, 0], [0, 1], [1, 1]]);
        const sim = similar(B, P), flip = congruent(B, transpose(P)), errors = [];
        if (Math.abs(sim[i][j] - Bn[i][j]) > 1e-9) errors.push({ value: sim[i][j], feedback: t`That is an entry of $P^{-1}BP$, the law for a linear map. A bilinear form eats two vectors, each converted by $P$: $P^{\mathsf T}BP$.` });
        if (Math.abs(flip[i][j] - Bn[i][j]) > 1e-9 && !errors.some((e) => Math.abs(e.value - flip[i][j]) < 1e-9)) errors.push({ value: flip[i][j], feedback: t`That is $PBP^{\mathsf T}$, with the transpose on the wrong side. $B'_{ij} = B(\mathbf b'_i, \mathbf b'_j)$, and $\mathbf b'_j$ is column $j$ of $P$.` });
        return {
          prompt: t`A symmetric form has matrix $B = ${matTeX(B)}$ in the standard basis. The new basis is the columns of $P = ${matTeX(P)}$. Find the entry $B'_{${i + 1}${j + 1}}$ of the form’s matrix in the new basis.`,
          answer: Bn[i][j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$B'_{${i + 1}${j + 1}} = B(\mathbf b'_${i + 1}, \mathbf b'_${j + 1}) = (\mathbf b'_${i + 1})^{\mathsf T}B\,\mathbf b'_${j + 1}$, with $\mathbf b'_j$ the columns of $P$.`, t`$\mathbf b'_${i + 1} = ${tupleTeX([P[0][i], P[1][i]])}$, $\mathbf b'_${j + 1} = ${tupleTeX([P[0][j], P[1][j]])}$, and $B\mathbf b'_${j + 1} = ${tupleTeX(matvec(B, [P[0][j], P[1][j]]))}$.`],
          teach: t`The matrix of a bilinear form changes by congruence, $B' = P^{\mathsf T}BP$: entry $ij$ is the form applied to the new basis vectors $i$ and $j$.`,
          explain: t`$B' = P^{\mathsf T}BP = ${matTeX(Bn)}$, so $B'_{${i + 1}${j + 1}} = ${Bn[i][j]}$. Note $\det B' = (\det P)^2\det B = ${detN(B)}$: the sign of the determinant can never change under congruence.`,
          visual: conicPic(B, { arrows: basisArrows(P), view: Math.max(viewFor(B), ...P.flat().map((v) => Math.abs(v) + 0.5)), labels: false }),
        };
      },
    }),
    mcq({
      id: 'invariant', difficulty: 2,
      prompt: t`A symmetric matrix $B$ is replaced by $P^{\mathsf T}BP$ for some invertible $P$. Which of these is guaranteed to stay the same?`,
      choices: ['The signature: the numbers of positive, negative and zero eigenvalues', 'The eigenvalues', 'The determinant', 'The trace'],
      answer: 0,
      why: {
        1: t`Eigenvalues survive similarity, not congruence. $P = 2I$ gives $P^{\mathsf T}BP = 4B$: every eigenvalue is multiplied by 4.`,
        2: t`$\det(P^{\mathsf T}BP) = (\det P)^2\det B$. Its *sign* survives, but its size does not.`,
        3: t`With $P = 2I$ the trace is multiplied by 4.`,
      },
      hints: [t`Try $P = 2I$: what happens to $B$?`, t`$P = 2I$ multiplies every eigenvalue by 4. What survives that, and every other invertible $P$?`],
      teach: 'Congruence can rescale and mix eigenvalues but never change how many are positive, negative or zero: Sylvester’s law of inertia.',
      explain: t`Sylvester’s law: the signature is the only invariant of a real symmetric matrix under congruence — two symmetric matrices are congruent exactly when their signatures agree. Every positive-definite form is congruent to $I$ (every inner product looks like the dot product in a suitable basis), and every Lorentzian metric to $\eta$ (every observer can set up an inertial frame).`,
      visual: conicPic([[1, 0.5], [0.5, 1]], { arrows: [...basisArrows([[1, -0.5], [0, 1]]), { from: [0, 0], to: [0.8, 0.8], color: 'teal', width: 2, label: 'c₁' }, { from: [0, 0], to: [-1.4, 1.4], color: 'teal', width: 2, label: 'c₂' }], view: 1.8, labels: false, caption: 'One positive-definite form, its curve B(x, x) = 1, and two bases that diagonalize it (gold–orange and teal). The two diagonal matrices differ; both have two positive entries.' }),
    }),
    num({
      id: 'sig3', difficulty: 3,
      gen(r) {
        let B, D, d1, d2, d3, nNeg;
        for (let k = 0; k < 500; k++) {
          const { P: Q } = unimod3(r, { max: 2, maxInv: 4 });
          D = [r.pick([-2, -1, 1, 2]), r.pick([-2, -1, 1, 2]), r.pick([-2, -1, 1, 2])];
          B = matmul(matmul(transpose(Q), D.map((d, i) => D.map((_, j) => (i === j ? d : 0)))), Q);
          d1 = B[0][0]; d2 = B[0][0] * B[1][1] - B[0][1] * B[1][0]; d3 = detN(B);
          nNeg = D.filter((d) => d < 0).length;
          if (d1 !== 0 && d2 !== 0 && B.flat().every((v) => Math.abs(v) <= 9) && nNeg > 0 && nNeg < 3) break;
        }
        const diagNeg = [0, 1, 2].filter((i) => B[i][i] < 0).length;
        const seq = [1, d1, d2, d3], changes = seq.slice(1).filter((x, i) => Math.sign(x) !== Math.sign(seq[i])).length;
        return {
          prompt: t`How many **negative** entries does a diagonal form of the symmetric matrix $B = ${matTeX(B)}$ have — the $n_-$ of its signature?`,
          answer: nNeg, tol: { rel: 0, abs: 0.01 },
          errors: diagNeg !== nNeg ? [{ value: diagNeg, feedback: t`That counts the negative entries on $B$’s own diagonal. Off-diagonal terms change the picture: the diagonal entries of $B$ are not its signature unless $B$ is already diagonal.` }] : [],
          hints: [t`Leading principal minors: $\Delta_1 = ${d1}$, $\Delta_2 = ${d2}$, $\Delta_3 = \det B = ${d3}$.`, t`Jacobi’s rule: when no $\Delta_k$ is zero, the number of negative entries equals the number of sign changes in the sequence $1, \Delta_1, \Delta_2, \Delta_3$. (Completing squares one variable at a time gives the same answer: the diagonal entries are $\Delta_1, \Delta_2/\Delta_1, \Delta_3/\Delta_2$.)`],
          teach: 'The signature can be read from leading principal minors: completing squares in order produces the diagonal entries Δ₁, Δ₂/Δ₁, Δ₃/Δ₂.',
          explain: t`The sequence $1, ${d1}, ${d2}, ${d3}$ changes sign ${changes} time${changes === 1 ? '' : 's'}, so $n_- = ${nNeg}$ and the signature is $(${3 - nNeg}, ${nNeg}, 0)$. (This $B$ was built as $Q^{\mathsf T}DQ$ with $D = \operatorname{diag}(${D.join(', ')})$, which confirms it.) Completing squares in order gives the diagonal entries $${nice(d1)}, ${nice(d2 / d1, 3)}, ${nice(d3 / d2, 3)}$ — ${[d1, d2 / d1, d3 / d2].map(signs).join(', ')}.`,
        };
      },
    }),
    num({
      id: 'interval', difficulty: 2,
      gen(r) {
        let d, s2;
        for (let k = 0; k < 100; k++) { d = [r.int(1, 9), r.int(-6, 6), r.int(-6, 6), r.int(-4, 4)]; s2 = -d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + d[3] * d[3]; if (s2 !== 0 && Math.abs(s2) !== d.reduce((s, x) => s + x * x, 0)) break; }
        const eu = d.reduce((s, x) => s + x * x, 0), dist = Math.hypot(d[1], d[2], d[3]), R = Math.max(d[0], dist) + 1;
        return {
          prompt: t`Two events are separated by $\Delta\mathbf x = (\Delta t, \Delta x, \Delta y, \Delta z) = (${d.join(', ')})$, in seconds and light-seconds (so $c = 1$). Find $\eta(\Delta\mathbf x, \Delta\mathbf x) = \Delta\mathbf x^{\mathsf T}\eta\,\Delta\mathbf x$ with $\eta = \operatorname{diag}(-1, 1, 1, 1)$, in light-seconds².`,
          answer: s2, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: eu, feedback: t`That adds all four squares, as a Euclidean dot product would. $\eta$ puts a minus sign on the time part.` }],
          hints: [t`$\eta$ is diagonal, so $\eta(\Delta\mathbf x, \Delta\mathbf x) = -\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2$.`],
          teach: t`Minkowski’s metric is a symmetric bilinear form of signature $(-, +, +, +)$: $\eta(\mathbf v, \mathbf v)$ can be negative (timelike), zero (null) or positive (spacelike).`,
          explain: t`$-${d[0] * d[0]} + ${d[1] * d[1]} + ${d[2] * d[2]} + ${d[3] * d[3]} = ${s2}$. ${s2 < 0 ? t`Negative: the separation is **timelike** — a signal slower than light can connect the events, and every inertial observer agrees on their order.` : t`Positive: the separation is **spacelike** — no signal can connect the events, and observers disagree about which came first.`} Being a property of the form, not of the components, the verdict is the same in every inertial frame.`,
          visual: { type: 'graph', params: { x: [-R * 2, R * 2], y: [-0.5, R], aspect: 'wide', equal: true, xlabel: 'distance (light-seconds)', ylabel: 't (s)', curves: [{ fn: 'abs(x)', color: 'gold', width: 1.6, dash: [5, 4], label: 'light cone', labelAt: R * 0.75, labelDx: 6, labelDy: 6 }], arrows: [{ from: [0, 0], to: [dist, d[0]], color: 'accent', width: 2.8, label: 'Δx' }] }, caption: 'Time up and spatial distance across, with c = 1: the three space directions are folded into one distance. The light cone (dashed) is where η(Δx, Δx) = 0.' },
        };
      },
    }),
    mcq({
      id: 'degenerate', difficulty: 2,
      prompt: t`Is the symmetric form with matrix $B = ${matTeX([[1, 2], [2, 4]])}$ a metric?`,
      choices: [
        t`No: it is degenerate — $B(\mathbf v, \mathbf w) = 0$ for $\mathbf v = (2, -1)$ and every $\mathbf w$`,
        'Yes: it is symmetric, which is all a metric needs',
        'Yes: its diagonal entries are positive, so it is positive definite',
        'No: a metric’s matrix must have entries ±1 and 0',
      ],
      answer: 0,
      why: {
        1: 'A metric must also be nondegenerate, so that it can turn vectors into covectors and back.',
        2: t`Positive diagonal entries do not make a form positive definite: here $B(\mathbf v, \mathbf v) = (v_1 + 2v_2)^2$ vanishes for $\mathbf v = (2, -1)$.`,
        3: t`Only in a suitable basis. In any other basis a metric’s matrix is $P^{\mathsf T}\eta P$, with whatever entries that gives.`,
      },
      hints: [t`Compute $\det B$.`, t`$\det B = 0$, so some $\mathbf v \ne \mathbf 0$ has $B\mathbf v = \mathbf 0$ — and then $B(\mathbf v, \mathbf w) = \mathbf w^{\mathsf T}B\mathbf v = 0$ for every $\mathbf w$.`],
      teach: t`A metric is symmetric **and** nondegenerate: $\det g \ne 0$, so only the zero vector pairs to zero with everything.`,
      explain: t`$B(2, -1)^{\mathsf T} = (0, 0)$, so the vector $(2, -1)$ is invisible to the form: its signature is $(1, 0, 1)$, with a zero. It cannot measure lengths along $(2, -1)$, and lowering an index would send that nonzero vector to the zero covector — which could never be undone. That is why $\det g \ne 0$ is part of the definition of a metric.`,
      visual: conicPic([[1, 2], [2, 4]], { view: 1.6, labels: false, caption: 'The curve B(x, x) = 1 for this form: two parallel lines, (x₁ + 2x₂)² = 1. Nothing has B(x, x) = −1.' }),
    }),
    num({
      id: 'lower', difficulty: 2,
      gen(r) {
        const g = symForm(r, { definite: true }), v = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])], j = r.int(0, 1);
        const low = matvec(g, v), up = matvec(inverse(g), v), errors = [];
        if (Math.abs(up[j] - low[j]) > 0.01) errors.push({ value: up[j], feedback: t`That multiplies by $g^{-1}$, which *raises* an index (covector to vector). Lowering uses $g$ itself.` });
        if (Math.abs(v[j] - low[j]) > 0.01) errors.push({ value: v[j], feedback: t`That is the vector’s own component. The covector $g(\mathbf v, \cdot)$ has components $g_{ij}v^j$, which differ unless $g$ is the identity.` });
        return {
          prompt: t`A metric on the plane has matrix $g = ${matTeX(g)}$ in some basis, and a vector has components $\mathbf v = ${tupleTeX(v)}$. The covector $\mathbf v^\flat = g(\mathbf v, \cdot)$ has components $(\mathbf v^\flat)_i = g(\mathbf v, \mathbf b_i)$. Find its ${ORD[j]} component.`,
          answer: low[j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$(\mathbf v^\flat)_i = \sum_j g_{ij}v_j$: the components are $g\mathbf v$.`],
          teach: t`A metric lowers an index: the vector $\mathbf v$ becomes the covector with components $g\mathbf v$.`,
          explain: t`$g\mathbf v = ${matTeX(g)}${colTeX(v)} = ${colTeX(low)}$, so $\mathbf v^\flat = ${rowTeX(low)}$. With the dot product ($g = I$) nothing changes, which is why vectors and covectors look alike in Cartesian coordinates. In relativity $\eta$ flips the sign of the time component: $p_\mu = \eta_{\mu\nu}p^\nu$ turns $(E, \mathbf p)$ into $(-E, \mathbf p)$.`,
          visual: { type: 'ten-metric', params: { mode: 'form', T: g, U: v, V: [1, 0], showV: false, tname: 'g', uname: 'v', dragU: false, dragV: false, feed: false, crossings: false, levelLabels: false, readout: false, indicatrix: true, indicatrixLabels: false, view: Math.min(6, Math.max(2.2, ...v.map((x) => Math.abs(x) + 0.8))) }, caption: 'The vector v on component axes, and the metric’s “unit circle” g(x, x) = 1 — an ellipse in these components, because the basis is not orthonormal for g.' },
        };
      },
    }),
    code({
      id: 'signature', difficulty: 3,
      prompt: t`Check Sylvester’s law numerically. Write \`congruent(B, P)\`, the matrix $P^{\mathsf T}BP$ of the form $B$ in the basis given by the columns of $P$, and \`signature(B, tol)\`, the triple $(n_+, n_-, n_0)$ counted from the eigenvalues of the symmetric matrix $B$ (use \`np.linalg.eigvalsh\` and treat $|\lambda| \le$ \`tol\` as zero). Then transform Minkowski’s $\eta$ by a random change of basis and compare.`,
      starter: t`import numpy as np

def congruent(B, P):
    # the matrix of the form B in the basis given by the columns of P
    return B

def signature(B, tol=1e-9):
    # (number of positive, number of negative, number of zero) eigenvalues of symmetric B
    return (0, 0, 0)

eta = np.diag([-1.0, 1.0, 1.0, 1.0])          # Minkowski, c = 1
rng = np.random.default_rng(1)
P = rng.normal(size=(4, 4))                   # a random change of basis
eta_new = congruent(eta, P)
print(np.round(eta_new, 3))
print(signature(eta), signature(eta_new))
`,
      answer: t`import numpy as np

def congruent(B, P):
    return P.T @ B @ P

def signature(B, tol=1e-9):
    w = np.linalg.eigvalsh(B)
    return (int(np.sum(w > tol)), int(np.sum(w < -tol)), int(np.sum(np.abs(w) <= tol)))

eta = np.diag([-1.0, 1.0, 1.0, 1.0])          # Minkowski, c = 1
rng = np.random.default_rng(1)
P = rng.normal(size=(4, 4))                   # a random change of basis
eta_new = congruent(eta, P)
print(np.round(eta_new, 3))
print(signature(eta), signature(eta_new))
`,
      tests: [
        { name: t`\`congruent\` turns $\begin{bmatrix} 1 & 2 \\ 2 & 1 \end{bmatrix}$ into $\operatorname{diag}(1, -3)$ with $P = \begin{bmatrix} 1 & -2 \\ 0 & 1 \end{bmatrix}$`, code: 'np.allclose(congruent(np.array([[1.0, 2], [2, 1]]), np.array([[1.0, -2], [0, 1]])), np.diag([1.0, -3]))' },
        { name: t`$\eta$ has signature $(3, 1, 0)$`, code: 'tuple(signature(eta)) == (3, 1, 0)' },
        { name: t`the transformed $\eta$ looks nothing like $\eta$ but keeps signature $(3, 1, 0)$`, code: 'not np.allclose(eta_new, eta) and tuple(signature(eta_new)) == (3, 1, 0)' },
        { name: t`its eigenvalues changed: only their signs survive`, code: 'not np.allclose(np.linalg.eigvalsh(eta_new), [-1, 1, 1, 1])' },
        { name: t`a degenerate form, $\begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix}$, has signature $(1, 0, 1)$`, code: 'tuple(signature(np.array([[1.0, 2], [2, 4]]))) == (1, 0, 1)' },
      ],
      hints: [t`\`P.T @ B @ P\`.`, t`\`w = np.linalg.eigvalsh(B)\`, then count \`w > tol\`, \`w < -tol\` and \`abs(w) <= tol\` with \`np.sum\`, converting each to \`int\`.`],
      teach: 'Congruence by any invertible P changes every eigenvalue of a symmetric matrix but none of their signs.',
      explain: t`The random $P$ scrambles $\eta$ into a full symmetric matrix with quite different eigenvalues, yet exactly one stays negative. Physically: whatever basis — or whatever observer’s skewed, rescaled coordinates — you use at a point of spacetime, the metric has one time direction and three space directions. (The eigenvalue route works because $B$ is symmetric; a zero tolerance is needed because round-off never gives an exact zero.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-congruence', difficulty: 2,
      gen(r) {
        let B, P, Bn;
        for (let k = 0; k < 200; k++) { B = symForm(r); P = unimod2(r, 2); Bn = congruent(B, P); if (Bn.flat().every((v) => Math.abs(v) <= 30)) break; }
        const [i, j] = r.pick([[0, 0], [0, 1], [1, 1]]);
        return {
          prompt: t`$B = ${matTeX(B)}$ is the matrix of a symmetric form, and the new basis is the columns of $P = ${matTeX(P)}$. Find $B'_{${i + 1}${j + 1}}$.`,
          answer: Bn[i][j], tol: { rel: 0, abs: 0.01 },
          hints: [t`$B' = P^{\mathsf T}BP$; entry $ij$ is $B(\mathbf b'_i, \mathbf b'_j)$.`],
          teach: t`Bilinear forms change basis by congruence: $B' = P^{\mathsf T}BP$.`,
          explain: t`$B' = P^{\mathsf T}BP = ${matTeX(Bn)}$.`,
          visual: conicPic(B, { arrows: basisArrows(P), view: Math.max(viewFor(B), ...P.flat().map((v) => Math.abs(v) + 0.5)), labels: false }),
        };
      },
    }),
    num({
      id: 'cp-null', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([0.5, 1, 2, 3]), b = r.pick([0.5, 1, 1.5, 2, 4]);
        const ans = -2 * a * b;
        return {
          prompt: t`Radar ranging and gravitational-wave calculations often use a **null basis** of spacetime: vectors along light rays. In 1+1 dimensions with $c = 1$ and $\eta = \operatorname{diag}(-1, 1)$ on components $(t, x)$, take $\mathbf b'_1 = ${a}\,(1, 1)$ (an outgoing light ray) and $\mathbf b'_2 = ${b}\,(1, -1)$ (an incoming one). In this basis the metric’s matrix is $\eta' = P^{\mathsf T}\eta P$. Its diagonal entries are $\eta'_{11} = \eta'_{22} = 0$, since light rays are null. Find the off-diagonal entry $\eta'_{12}$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: t`Check the sign of the time part: $\eta(\mathbf u, \mathbf v) = -u_tv_t + u_xv_x$.` }, { value: 0, feedback: t`Null vectors have zero length, but two *different* null vectors need not be orthogonal: $\eta(\mathbf b'_1, \mathbf b'_2)$ has to be computed.` }],
          hints: [t`$\eta'_{12} = \eta(\mathbf b'_1, \mathbf b'_2) = -(b'_1)_t(b'_2)_t + (b'_1)_x(b'_2)_x$.`, t`$= ${a}\cdot${b}\,\big(-(1)(1) + (1)(-1)\big)$.`],
          teach: 'A null basis has zeros on the diagonal of the metric; the metric lives entirely off the diagonal, and its signature is still (1, 1).',
          explain: t`$\eta'_{12} = ${a}\cdot${b}\,(-1 - 1) = ${nice(ans)}$, so $\eta' = ${matTeX([[0, ans], [ans, 0]])}$. Its determinant, $-${nice(ans * ans)}$, is negative: one positive and one negative eigenvalue ($\pm${nice(-ans)}$), signature $(1, 1)$ exactly as for $\eta$ — Sylvester’s law, even though no diagonal entry is negative. In null coordinates $u = t - x$, $v = t + x$ the interval reads $ds^2 = -du\,dv$; LIGO’s wave calculations are done in such coordinates.`,
          visual: { type: 'graph', params: { x: [-4.4, 4.4], y: [-0.6, 3.8], aspect: 'wide', equal: true, xlabel: 'x (light-s)', ylabel: 't (s)', curves: [{ fn: 'abs(x)', color: 'ink3', width: 1.4, dash: [5, 4], label: 'light cone', labelAt: 2.9, labelDx: 8, labelDy: 8 }], arrows: [{ from: [0, 0], to: [a, a], color: 'gold', width: 3, label: 'b′₁' }, { from: [0, 0], to: [-b, b], color: 'warn', width: 3, label: 'b′₂' }] }, caption: 'Spacetime with x across and t up (c = 1): the two null basis vectors lie along the light cone (dashed).' },
        };
      },
    }),
    mcq({
      id: 'cp-sylvester', difficulty: 2,
      prompt: t`Two people diagonalize the same symmetric form on $\mathbb R^3$ by different changes of basis. One gets $\operatorname{diag}(2, -5, 1)$. Which result could the other get?`,
      choices: [t`$\operatorname{diag}(7, 3, -0.5)$`, t`$\operatorname{diag}(-2, 5, -1)$`, t`$\operatorname{diag}(2, 5, 1)$`, t`$\operatorname{diag}(2, -5, 0)$`],
      answer: 0,
      why: {
        1: 'That has two negative entries and one positive; the first has one negative and two positive. Congruence cannot change those counts.',
        2: 'No negative entries: congruence cannot make a negative direction positive.',
        3: t`A zero entry means a degenerate form; the first result has $\det \ne 0$, and congruence keeps $\det$ nonzero ($\det P^{\mathsf T}BP = (\det P)^2\det B$).`,
      },
      hints: [t`Count the positive, negative and zero entries of $\operatorname{diag}(2, -5, 1)$.`, 'Sylvester: any other diagonal form has the same three counts, though the numbers themselves may differ.'],
      teach: 'Different diagonal forms of one symmetric matrix share their numbers of positive, negative and zero entries — the signature — and nothing else.',
      explain: t`$\operatorname{diag}(2, -5, 1)$ has signature $(2, 1, 0)$, and so does $\operatorname{diag}(7, 3, -0.5)$ — for instance, rescale the basis vectors and reorder them. The entries’ sizes are not invariant (rescaling a basis vector by $s$ multiplies its entry by $s^2$), only their signs.`,
    }),
  ],
  sources: [
    { label: 'Axler, Linear Algebra Done Right (4th ed.), §9A Bilinear forms and quadratic forms', url: 'https://linear.axler.net/' },
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.5 Positive definite matrices', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Carroll, Spacetime and Geometry, §1.2–1.4 and §2.5 (the metric and its signature)', url: 'https://doi.org/10.1017/9781108770385' },
  ],
});
