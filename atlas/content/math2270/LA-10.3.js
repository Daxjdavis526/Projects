// Gram–Schmidt and QR: turning any basis into an orthonormal one by
// subtracting projections, the factorization A = QR it records, least squares
// by R x̂ = Qᵀb, and re-orthonormalizing a drifting attitude matrix.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, norm, sub, scale, add, matTeX, tupleTeX, colTeX } from './_la.js';
import { board } from './_eig.js';
import { projLine, projPic, planePic, gramSchmidt } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const Q3 = [[1, 2, 2], [2, 1, -2], [2, -2, 1]].map((q) => q.map((x) => x / 3));
// the Explore example: a₁ = (1, 2, 2), a₂ = (3, 3, 0), a₃ = (5, 1, 1); R = [[3, 3, 3], [0, 3, 3], [0, 0, 3]]
const A1 = [1, 2, 2], A2 = [3, 3, 0], A3 = [5, 1, 1];
const on = (k) => `step(st - ${k - 0.5})`;
const onlyAt = (k) => `step(st - ${k - 0.5})*step(${k + 0.5} - st)`;

export default lesson({
  id: 'math2270.LA-10.3',
  title: 'Gram–Schmidt and QR',
  minutes: 13, difficulty: 3,
  intro: t`Orthonormal bases make everything easy, and **Gram–Schmidt** makes one out of any independent vectors $\mathbf a_1, \mathbf a_2, \dots$. Take them in order. From each, subtract its projections onto the unit vectors already built — what is left, $\mathbf w_j$, is perpendicular to all of them — then scale it to length 1:

$$\mathbf w_j = \mathbf a_j - \sum_{i<j}(\mathbf q_i\cdot\mathbf a_j)\,\mathbf q_i, \qquad \mathbf q_j = \frac{\mathbf w_j}{|\mathbf w_j|}$$

Read backwards, each $\mathbf a_j$ is a combination of $\mathbf q_1, \dots, \mathbf q_j$ only. In matrices that is $A = QR$: $Q$ has the orthonormal columns, and $R$ is **upper triangular**, with $r_{ij} = \mathbf q_i\cdot\mathbf a_j$ above the diagonal and $r_{jj} = |\mathbf w_j| > 0$ on it. With $A = QR$, least squares needs no $A${T}A$ at all: solve $R\hat{\mathbf x} = Q${T}\mathbf b$ by back-substitution.`,
  symbols: [
    { tex: t`\mathbf a_1, \dots, \mathbf a_n`, text: t`the independent vectors you start with — the columns of $A$` },
    { tex: t`\mathbf q_i\cdot\mathbf a_j`, text: t`how much of $\mathbf a_j$ points along $\mathbf q_i$; this is $r_{ij}$, an entry of $R$` },
    { tex: t`\mathbf w_j`, text: t`what remains of $\mathbf a_j$ after its parts along the earlier $\mathbf q$'s are removed: perpendicular to all of them` },
    { tex: t`\mathbf q_j`, text: t`the new unit vector, $\mathbf w_j$ scaled to length 1; $\mathbf q_1, \dots, \mathbf q_j$ span the same space as $\mathbf a_1, \dots, \mathbf a_j$` },
    { tex: t`A = QR`, text: t`$Q$: orthonormal columns ($Q${T}Q = I$); $R$: upper triangular, positive diagonal` },
  ],
  why: 'QR is how computers actually solve least-squares problems and find eigenvalues, and Gram–Schmidt is how flight software keeps an attitude matrix orthonormal as rounding errors creep in.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Subtract the shadows, keep the rest',
    lead: t`Three independent vectors $\mathbf a_1 = (1, 2, 2)$, $\mathbf a_2 = (3, 3, 0)$, $\mathbf a_3 = (5, 1, 1)$. Step through Gram–Schmidt: at each step the dashed gold arrow is the part of $\mathbf a_j$ along the $\mathbf q$'s already made, and the red arrow $\mathbf w_j$ is what is left. Drag to rotate.`,
    tasks: [
      'Step 1: q₁ is a₁ shrunk to length 1 (|a₁| = 3).',
      'Step 2: a₂’s shadow on q₁ is 3q₁; what is left, w₂ = (2, 1, −2), is perpendicular to q₁. Rotate the scene until you can see the right angle.',
      'Step 3: a₃ loses its shadows on q₁ and q₂ (3q₁ + 3q₂); the rest, w₃ = (2, −2, 1), is perpendicular to both.',
    ],
    params: {
      range: 3.5, yaw: 2.36, pitch: 0.75,
      choices: [{ key: 'st', label: 'Step', options: [[0, 'start'], [1, '1: q₁'], [2, '2: q₂'], [3, '3: q₃']], value: 0, explain: t`Each step makes one new unit vector, perpendicular to the ones before.` }],
      vectors: [
        { to: A1, color: 'good', label: '\\mathbf a_1', when: onlyAt(0) },
        { to: A2, color: 'warn', label: '\\mathbf a_2', when: `step(${2.5} - st)` },
        { to: A3, color: 'violet', label: '\\mathbf a_3', when: `step(0.5 - st) + ${onlyAt(3)}` },
        { to: Q3[0], color: 'good', width: 3.4, label: '\\mathbf q_1', when: on(1) },
        { to: [1, 2, 2], color: 'gold', dash: true, label: '3\\mathbf q_1', when: onlyAt(2) },
        { from: [1, 2, 2], to: A2, color: 'bad', label: '\\mathbf w_2', when: onlyAt(2) },
        { to: Q3[1], color: 'warn', width: 3.4, label: '\\mathbf q_2', when: on(2) },
        { to: [3, 3, 0], color: 'gold', dash: true, label: '3\\mathbf q_1 + 3\\mathbf q_2', when: onlyAt(3) },
        { from: [3, 3, 0], to: A3, color: 'bad', label: '\\mathbf w_3', when: onlyAt(3) },
        { to: Q3[2], color: 'violet', width: 3.4, label: '\\mathbf q_3', when: on(3) },
      ],
      readouts: [
        { label: t`$\mathbf q_1$`, vec: ['1/3', '2/3', '2/3'], digits: 3, when: on(1) },
        { label: t`$\mathbf q_2$`, vec: ['2/3', '1/3', '-2/3'], digits: 3, when: on(2) },
        { label: t`$\mathbf q_3$`, vec: ['2/3', '-2/3', '1/3'], digits: 3, when: on(3) },
      ],
    },
    caption: 'Arrows to scale. Gold dashed: the part of the current vector along the q’s already built (its projection onto their span). Red: the remainder w, which becomes the next q once scaled to length 1.',
  },
  example: {
    prompt: t`Factor $A = ${matTeX([[3, -1], [0, 12], [4, 7]])} = QR$ by Gram–Schmidt on its columns $\mathbf a_1 = (3, 0, 4)$ and $\mathbf a_2 = (-1, 12, 7)$.`,
    visual: projPic([5, 0], [5, 13], { names: { a: 'a₁', b: 'a₂', p: '', e: 'w₂' }, caption: 'The plane of a₁ and a₂, laid flat (lengths and the angle are true; the picture is turned so a₁ lies along the horizontal). a₂ splits into its part along q₁ — here 5q₁, which happens to be a₁ itself (gold) — and the perpendicular remainder w₂.' }),
    steps: [
      { label: 'First column', text: t`$|\mathbf a_1| = \sqrt{9 + 0 + 16} = 5$, so $\mathbf q_1 = \tfrac15(3, 0, 4)$ and $r_{11} = 5$.` },
      { label: 'Shadow of the second', text: t`$r_{12} = \mathbf q_1\cdot\mathbf a_2 = \tfrac15(-3 + 0 + 28) = 5$. That much of $\mathbf a_2$ points along $\mathbf q_1$.` },
      { label: 'Subtract it', text: t`$\mathbf w_2 = \mathbf a_2 - 5\mathbf q_1 = (-1, 12, 7) - (3, 0, 4) = (-4, 12, 3)$. Check: $\mathbf w_2\cdot\mathbf a_1 = -12 + 0 + 12 = 0$ ✓.` },
      { label: 'Normalize', text: t`$r_{22} = |\mathbf w_2| = \sqrt{16 + 144 + 9} = 13$, so $\mathbf q_2 = \tfrac1{13}(-4, 12, 3)$.` },
      { label: 'Assemble', text: t`$$Q = \begin{bmatrix} 3/5 & -4/13 \\ 0 & 12/13 \\ 4/5 & 3/13 \end{bmatrix}, \qquad R = ${matTeX([[5, 5], [0, 13]])}.$$ Column 1 of $QR$ is $5\mathbf q_1 = \mathbf a_1$; column 2 is $5\mathbf q_1 + 13\mathbf q_2 = (3, 0, 4) + (-4, 12, 3) = \mathbf a_2$ ✓.` },
      { label: 'Sense check', text: t`$R = Q${T}A$ (multiply $A = QR$ by $Q${T}$): its entries are dot products of the $\mathbf q$'s with the $\mathbf a$'s, and the entry $\mathbf q_2\cdot\mathbf a_1$ below the diagonal is 0 because $\mathbf a_1$ was used to build $\mathbf q_1$ before $\mathbf q_2$ existed.` },
    ],
    answer: t`$\mathbf q_1 = \tfrac15(3, 0, 4)$, $\mathbf q_2 = \tfrac1{13}(-4, 12, 3)$, and $R = ${matTeX([[5, 5], [0, 13]])}$.`,
  },
  practice: [
    num({
      id: 'gs-w2', difficulty: 2,
      gen(r) {
        let a1, a2;
        for (let k = 0; k < 300; k++) {
          a1 = r.pick([[3, 4], [4, 3], [1, 2], [2, 1], [1, 1], [1, -1], [3, -4]]); a2 = [r.int(-4, 5), r.int(-4, 5)];
          if (dot(a1, a2) !== 0 && a1[0] * a2[1] - a1[1] * a2[0] !== 0) break;
        }
        const w = sub(a2, projLine(a1, a2)), which = r.int(0, 1);
        return {
          prompt: t`Gram–Schmidt on $\mathbf a_1 = ${tupleTeX(a1)}$, $\mathbf a_2 = ${tupleTeX(a2)}$: find $\mathbf w_2 = \mathbf a_2 - (\mathbf q_1\cdot\mathbf a_2)\,\mathbf q_1$ (before normalizing). What is its ${which ? 'second' : 'first'} component?`,
          answer: w[which], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: a2[which] - dot(a1, a2) * a1[which], feedback: t`$\mathbf a_1$ is not a unit vector: use $\mathbf q_1 = \mathbf a_1/|\mathbf a_1|$, so the shadow is $\dfrac{\mathbf a_1\cdot\mathbf a_2}{\mathbf a_1\cdot\mathbf a_1}\mathbf a_1$.` }].filter((e) => Math.abs(e.value - w[which]) > 1e-6),
          hints: [t`$(\mathbf q_1\cdot\mathbf a_2)\,\mathbf q_1 = \dfrac{\mathbf a_1\cdot\mathbf a_2}{\mathbf a_1\cdot\mathbf a_1}\,\mathbf a_1$ — the projection of $\mathbf a_2$ onto the line of $\mathbf a_1$.`, t`$\mathbf a_1\cdot\mathbf a_2 = ${dot(a1, a2)}$, $\mathbf a_1\cdot\mathbf a_1 = ${dot(a1, a1)}$.`],
          teach: 'Each Gram–Schmidt step subtracts a projection: what remains is perpendicular to everything built so far.',
          explain: t`$\mathbf w_2 = ${tupleTeX(a2)} - \tfrac{${dot(a1, a2)}}{${dot(a1, a1)}}${tupleTeX(a1)} = ${tupleTeX(w)}$, and $\mathbf w_2\cdot\mathbf a_1 = 0$ ✓.`,
          visual: projPic(a1, a2, { show: ['a'], names: { a: 'a₁', b: 'a₂', p: 'p', e: 'w₂' }, caption: 'a₂ and the line of a₁. The remainder w₂ runs from that line to the tip of a₂, at a right angle.' }),
        };
      },
    }),
    num({
      id: 'R-entry', difficulty: 2,
      gen(r) {
        const r11 = r.int(1, 4), r12 = r.intExcept(-3, 3, [0]), r22 = r.int(1, 4), ask = r.pick(['r12', 'r22', 'r11']);
        const a1 = scale(Q3[0], r11), a2 = add(scale(Q3[0], r12), scale(Q3[1], r22)).map((v) => Math.round(v * 1e9) / 1e9);
        const val = { r11, r12, r22 }[ask];
        const lbl = { r11: t`r_{11}`, r12: t`r_{12}`, r22: t`r_{22}` }[ask];
        return {
          prompt: t`The columns $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$ give $\mathbf q_1 = \tfrac13(1, 2, 2)$ and $\mathbf q_2 = \tfrac13(2, 1, -2)$ under Gram–Schmidt. Find the entry $${lbl}$ of $R$ in $A = QR$.`,
          answer: val, tol: { rel: 1e-3, abs: 1e-3 },
          hints: [t`$R = Q${T}A$: $r_{ij} = \mathbf q_i\cdot\mathbf a_j$.`, t`$${lbl} = \mathbf q_${ask[1]}\cdot\mathbf a_${ask[2]}$.`],
          teach: 'The entries of R are the dot products qᵢ·aⱼ that Gram–Schmidt computes along the way; the diagonal ones are the lengths |wⱼ|.',
          explain: t`$${lbl} = \mathbf q_${ask[1]}\cdot\mathbf a_${ask[2]} = ${val}$. In full $R = ${matTeX([[r11, r12], [0, r22]])}$: indeed $\mathbf a_1 = ${r11}\mathbf q_1$ and $\mathbf a_2 = ${r12}\mathbf q_1 + ${r22}\mathbf q_2$.`,
          visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: a1, color: 'good', label: '\\mathbf a_1' }, { to: a2, color: 'warn', label: '\\mathbf a_2' }, { to: Q3[0], color: 'good', width: 3.4, label: '\\mathbf q_1' }, { to: Q3[1], color: 'warn', width: 3.4, label: '\\mathbf q_2' }] }, caption: 'The two columns and the two orthonormal vectors Gram–Schmidt makes from them. Drag to rotate.' },
        };
      },
    }),
    order({
      id: 'gs-order', difficulty: 1,
      prompt: t`Put the steps that make $\mathbf q_3$ in order (with $\mathbf q_1$ and $\mathbf q_2$ already built).`,
      items: [
        t`Compute $\mathbf q_1\cdot\mathbf a_3$ and $\mathbf q_2\cdot\mathbf a_3$ — the entries $r_{13}$ and $r_{23}$`,
        t`Subtract: $\mathbf w_3 = \mathbf a_3 - r_{13}\mathbf q_1 - r_{23}\mathbf q_2$`,
        t`Find the length $r_{33} = |\mathbf w_3|$ (if it is 0, $\mathbf a_3$ was dependent)`,
        t`Divide: $\mathbf q_3 = \mathbf w_3/r_{33}$`,
      ],
      hints: ['You cannot subtract the shadows before you know how long they are.', 'Normalizing comes last: you need the finished remainder to know its length.'],
      teach: 'Project, subtract, measure, divide — the same four moves at every step.',
      explain: t`Dot products first (they give the column of $R$), then the subtraction, then the length (the diagonal entry of $R$), then the division. If $|\mathbf w_3| = 0$, $\mathbf a_3$ lay in the span of $\mathbf a_1$ and $\mathbf a_2$ and the columns were not independent.`,
      visual: board([[3, 3, 3], [0, 3, 3], [0, 0, 3]], { ring: [[0, 2], [1, 2], [2, 2]], caption: 'R from the Explore example. The ringed column is the one the step for q₃ fills in: r₁₃ and r₂₃ from dot products, r₃₃ from a length.' }),
    }),
    mcq({
      id: 'R-upper', difficulty: 2,
      prompt: t`Why is $R$ in $A = QR$ (from Gram–Schmidt) **upper** triangular?`,
      choices: [
        t`Because $\mathbf a_j$ lies in the span of $\mathbf q_1, \dots, \mathbf q_j$, so $\mathbf q_i\cdot\mathbf a_j = 0$ whenever $i > j$`,
        t`Because $Q$ is orthogonal, and orthogonal matrices have triangular partners`,
        t`By convention: the entries below the diagonal are thrown away`,
        t`Because $A$ is square`,
      ],
      answer: 0,
      why: {
        1: t`Orthogonality of $Q$ gives $R = Q${T}A$, but not the zeros; those come from the order in which the $\mathbf q$'s are built.`,
        2: t`Nothing is discarded: $QR$ reproduces $A$ exactly, and the zeros below the diagonal are genuine values of $\mathbf q_i\cdot\mathbf a_j$.`,
        3: t`$A$ can be tall ($m\times n$ with $m > n$); its $R$ is still $n\times n$ upper triangular.`,
      },
      hints: [t`$r_{ij} = \mathbf q_i\cdot\mathbf a_j$. Which $\mathbf q$'s had been built when $\mathbf a_j$ was processed?`, t`$\mathbf q_i$ for $i > j$ is perpendicular to $\mathbf q_1, \dots, \mathbf q_j$ — and $\mathbf a_j$ is a combination of those.`],
      teach: 'Each aⱼ is built from q₁ … qⱼ alone, which puts R’s zeros below the diagonal.',
      explain: t`$\mathbf a_j = r_{1j}\mathbf q_1 + \dots + r_{jj}\mathbf q_j$ uses only the first $j$ unit vectors, so column $j$ of $R$ stops at row $j$. Elimination (LU) makes a triangular factor by row operations; Gram–Schmidt makes one by orthogonalizing in order.`,
      visual: board([[3, 3, 3], [0, 3, 3], [0, 0, 3]], { dim: [[1, 0], [2, 0], [2, 1]], caption: 'R from the Explore example: zeros (faint) below the diagonal.' }),
    }),
    num({
      id: 'lsq-qr', difficulty: 3,
      gen(r) {
        const R = [[r.int(1, 3), r.intExcept(-2, 2, [0])], [0, r.int(1, 3)]], b = [r.int(-3, 6), r.int(-3, 6), r.intExcept(-3, 6, [0])];
        const c = [dot(Q3[0], b), dot(Q3[1], b)], x2 = c[1] / R[1][1], x1 = (c[0] - R[0][1] * x2) / R[0][0], ask = r.int(1, 2);
        const a1 = scale(Q3[0], R[0][0]), a2 = add(scale(Q3[0], R[0][1]), scale(Q3[1], R[1][1])).map((v) => Math.round(v * 1e9) / 1e9);
        const ans = ask === 1 ? x1 : x2;
        return {
          prompt: t`$A = QR$ with $Q = \tfrac13${matTeX([[1, 2], [2, 1], [2, -2]])}$ and $R = ${matTeX(R)}$. Find the least-squares solution of $A\mathbf x = \mathbf b$ for $\mathbf b = ${tupleTeX(b)}$ by solving $R\hat{\mathbf x} = Q${T}\mathbf b$. What is $\hat x_${ask}$?`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: ask === 1 ? [{ value: c[0] / R[0][0], feedback: t`Back-substitute: $\hat x_1$ comes from row 1, $${R[0][0]}\hat x_1 + (${R[0][1]})\hat x_2 = ${nice(c[0])}$, so find $\hat x_2$ first.` }].filter((e) => Math.abs(e.value - ans) > 1e-6) : [],
          hints: [t`$Q${T}\mathbf b = (\mathbf q_1\cdot\mathbf b,\ \mathbf q_2\cdot\mathbf b) = (${nice(c[0])}, ${nice(c[1])})$.`, t`Row 2: $${R[1][1]}\hat x_2 = ${nice(c[1])}$. Then row 1: $${R[0][0]}\hat x_1 + (${R[0][1]})\hat x_2 = ${nice(c[0])}$.`],
          teach: 'With A = QR the normal equations AᵀA x̂ = Aᵀb become R x̂ = Qᵀb: one triangular solve.',
          explain: t`$A${T}A = R${T}Q${T}QR = R${T}R$ and $A${T}\mathbf b = R${T}Q${T}\mathbf b$, so the normal equations reduce to $R\hat{\mathbf x} = Q${T}\mathbf b$. Here $\hat{\mathbf x} = (${nice(x1)}, ${nice(x2)})$. Never forming $A${T}A$ matters numerically: it squares the condition number.`,
          visual: planePic(a1, a2, b, { show: ['a', 'p', 'e'], caption: 'The columns of A span the violet plane; the least-squares solution gives the projection p of b onto it. Drag to rotate.' }),
        };
      },
    }),
    code({
      id: 'gs-code', difficulty: 3,
      prompt: t`Write \`gram_schmidt(A)\` that returns \`Q, R\` for a matrix with independent columns, by classical Gram–Schmidt: for each column $j$, set $r_{ij} = \mathbf q_i\cdot\mathbf a_j$ for $i < j$, subtract, then $r_{jj} = |\mathbf w_j|$ and $\mathbf q_j = \mathbf w_j/r_{jj}$. The tests check $Q${T}Q = I$, $QR = A$, the shape of $R$, and compare with \`numpy.linalg.qr\` — whose columns may differ from yours by a sign.`,
      starter: t`import numpy as np

def gram_schmidt(A):
    A = np.array(A, dtype=float)
    m, n = A.shape
    Q = np.zeros((m, n))
    R = np.zeros((n, n))
    for j in range(n):
        w = A[:, j].copy()
        # TODO: subtract the projections onto Q[:, 0] ... Q[:, j-1], filling R[i, j]
        # TODO: R[j, j] = length of w; Q[:, j] = w / R[j, j]
    return Q, R

A = np.array([[3, -1], [0, 12], [4, 7]])
Q, R = gram_schmidt(A)
print(np.round(R, 6))
`,
      answer: t`import numpy as np

def gram_schmidt(A):
    A = np.array(A, dtype=float)
    m, n = A.shape
    Q = np.zeros((m, n))
    R = np.zeros((n, n))
    for j in range(n):
        w = A[:, j].copy()
        for i in range(j):
            R[i, j] = Q[:, i] @ A[:, j]
            w -= R[i, j] * Q[:, i]
        R[j, j] = np.linalg.norm(w)
        Q[:, j] = w / R[j, j]
    return Q, R

A = np.array([[3, -1], [0, 12], [4, 7]])
Q, R = gram_schmidt(A)
print(np.round(R, 6))
`,
      tests: [
        { name: 'the worked example gives $R = [[5, 5], [0, 13]]$', code: 'np.allclose(gram_schmidt([[3, -1], [0, 12], [4, 7]])[1], [[5, 5], [0, 13]])' },
        { name: 'the columns of $Q$ are orthonormal ($Q^{\\mathsf T}Q = I$)', code: '(lambda M: np.allclose(gram_schmidt(M)[0].T @ gram_schmidt(M)[0], np.eye(4)))(np.random.default_rng(3).normal(size=(6, 4)))' },
        { name: '$QR$ reproduces $A$', code: '(lambda M: np.allclose(gram_schmidt(M)[0] @ gram_schmidt(M)[1], M))(np.random.default_rng(4).normal(size=(5, 3)))' },
        { name: '$R$ is upper triangular with a positive diagonal', code: '(lambda R: np.allclose(np.tril(R, -1), 0) and bool(np.all(np.diag(R) > 0)))(gram_schmidt(np.random.default_rng(5).normal(size=(5, 5)))[1])' },
        { name: 'agrees with numpy.linalg.qr up to the signs of the columns', code: '(lambda M: np.allclose(np.abs(gram_schmidt(M)[1]), np.abs(np.linalg.qr(M)[1])))(np.random.default_rng(6).normal(size=(7, 4)))' },
      ],
      hints: [t`Inside the loop over $i < j$: \`R[i, j] = Q[:, i] @ A[:, j]\`, then \`w -= R[i, j] * Q[:, i]\`.`, t`After the inner loop: \`R[j, j] = np.linalg.norm(w)\` and \`Q[:, j] = w / R[j, j]\`.`],
      teach: 'Gram–Schmidt is two nested loops: dot products fill R’s column, subtractions make w, and its length normalizes it.',
      explain: t`Your $R$ matches NumPy's up to signs because \`numpy.linalg.qr\` uses Householder reflections (LAPACK), which does not insist on a positive diagonal; flip a column of $Q$ and the matching row of $R$ and the product is unchanged. In floating point, classical Gram–Schmidt slowly loses orthogonality on nearly dependent columns; the “modified” version (dot with the updated $\mathbf w$ instead of $\mathbf a_j$) and Householder are the robust choices.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-q2', difficulty: 2,
      gen(r) {
        const [a1, w0] = r.pick([[[3, 4, 0], [-4, 3, 0]], [[3, 0, 4], [-4, 12, 3]], [[1, 2, 2], [2, 1, -2]], [[2, 1, 2], [1, 2, -2]]]);
        const k = r.intExcept(-2, 2, [0]), a2 = add(scale(a1, k), w0), q2 = scale(w0, 1 / norm(w0)), i = r.pick([0, 1, 2].filter((j) => w0[j] !== 0));
        return {
          prompt: t`Apply Gram–Schmidt to $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$. What is component ${i + 1} of the unit vector $\mathbf q_2$?`,
          answer: q2[i], tol: { rel: 1e-3, abs: 1e-4 },
          errors: [{ value: w0[i], feedback: t`That is $\mathbf w_2$ before normalizing: divide by its length $${nice(norm(w0))}$.` }],
          hints: [t`$\mathbf w_2 = \mathbf a_2 - \dfrac{\mathbf a_1\cdot\mathbf a_2}{\mathbf a_1\cdot\mathbf a_1}\mathbf a_1$, then $\mathbf q_2 = \mathbf w_2/|\mathbf w_2|$.`],
          teach: 'Subtract the projection onto the first vector, then normalize.',
          explain: t`$\mathbf a_1\cdot\mathbf a_2/\mathbf a_1\cdot\mathbf a_1 = ${k}$, so $\mathbf w_2 = ${tupleTeX(w0)}$, $|\mathbf w_2| = ${nice(norm(w0))}$ and $\mathbf q_2 = \tfrac1{${nice(norm(w0))}}${tupleTeX(w0)}$: component ${i + 1} is $${nice(q2[i])}$.`,
          visual: { type: 'calc-vectors3d', params: { range: Math.max(3, Math.ceil(Math.max(...a2.map(Math.abs)) + 0.5)), vectors: [{ to: a1, color: 'good', label: '\\mathbf a_1' }, { to: a2, color: 'warn', label: '\\mathbf a_2' }] }, caption: 'The two vectors to orthonormalize. Drag to rotate.' },
        };
      },
    }),
    num({
      id: 'cp-dcm-drift', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([30, 40, 50, 60]) * Math.PI / 180, d = [r.pick([-1, 1]) * r.int(2, 4) / 100, r.pick([-1, 1]) * r.int(1, 3) / 100, r.pick([-1, 1]) * r.int(2, 5) / 100];
        const r1 = [Math.round(Math.cos(th) * 1000) / 1000, Math.round(Math.sin(th) * 1000) / 1000, 0];
        const r2 = [Math.round((-Math.sin(th) + d[0]) * 1000) / 1000, Math.round((Math.cos(th) + d[1]) * 1000) / 1000, d[2]];
        const q1 = scale(r1, 1 / norm(r1)), w = sub(r2, scale(q1, dot(q1, r2))), q2 = scale(w, 1 / norm(w)), i = r.int(0, 2);
        return {
          prompt: t`An attitude filter integrates gyro rates into a direction-cosine matrix, and rounding slowly spoils its orthonormality. Two of its rows now read $\mathbf r_1 = ${tupleTeX(r1)}$ and $\mathbf r_2 = ${tupleTeX(r2)}$. Keep $\mathbf r_1$'s direction and re-orthonormalize $\mathbf r_2$ by Gram–Schmidt. What is component ${i + 1} of the corrected unit row $\mathbf q_2$? (3 significant figures)`,
          answer: q2[i], tol: { rel: 0.005, abs: 5e-4 },
          errors: [{ value: scale(r2, 1 / norm(r2))[i], feedback: t`Normalizing $\mathbf r_2$ alone fixes its length but not its angle: first subtract its component along $\mathbf q_1$.` }].filter((e) => Math.abs(e.value - q2[i]) > 0.005 * Math.abs(q2[i]) + 5e-4),
          hints: [t`$\mathbf q_1 = \mathbf r_1/|\mathbf r_1|$; $\mathbf w_2 = \mathbf r_2 - (\mathbf q_1\cdot\mathbf r_2)\,\mathbf q_1$.`, t`$\mathbf q_1\cdot\mathbf r_2 \approx ${nice(dot(q1, r2), 3)}$ — small, as it should be for a nearly orthogonal matrix.`],
          teach: 'Re-orthonormalizing a drifted rotation matrix is Gram–Schmidt on its rows (the third row is then q₁ × q₂).',
          explain: t`$\mathbf q_1\cdot\mathbf r_2 \approx ${nice(dot(q1, r2), 3)}$, $\mathbf w_2 \approx (${w.map((v) => nice(v, 4)).join(',\\ ')})$, $|\mathbf w_2| \approx ${nice(norm(w), 4)}$, so $\mathbf q_2 \approx (${q2.map((v) => nice(v, 3)).join(',\\ ')})$. Flight codes use this or a symmetric correction that spreads the fix over all rows; the third row is rebuilt as $\mathbf q_1\times\mathbf q_2$.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.5, vectors: [{ to: r1, color: 'good', label: '\\mathbf r_1' }, { to: r2, color: 'warn', label: '\\mathbf r_2' }] }, caption: 'The two drifted rows, almost — but not quite — perpendicular. Drag to rotate.' },
        };
      },
    }),
    mcq({
      id: 'cp-signs', difficulty: 2,
      prompt: t`Your Gram–Schmidt gives $Q$ and $R$ with a positive diagonal. \`numpy.linalg.qr\` returns a $Q$ whose first column is minus yours, and an $R$ whose first row is minus yours. What does that mean?`,
      choices: [
        t`Both are valid: flipping column $i$ of $Q$ and row $i$ of $R$ leaves $QR$ unchanged`,
        'One of the two computations has a bug',
        'NumPy’s columns are not orthonormal',
        'The matrix A must have dependent columns',
      ],
      answer: 0,
      why: {
        1: t`Check the product: $(-\mathbf q_1)(-r_{1j}) = \mathbf q_1 r_{1j}$, so both reproduce $A$. QR is unique only once the diagonal of $R$ is required to be positive.`,
        2: 'Negating a unit vector keeps it a unit vector perpendicular to the others.',
        3: 'Dependent columns would give a zero on the diagonal of R, not a sign change.',
      },
      hints: ['Multiply out column 1 of QR in both versions.'],
      teach: 'QR is unique up to the signs of Q’s columns (and the matching rows of R).',
      explain: t`Each $\mathbf q_i$ can be replaced by $-\mathbf q_i$ if row $i$ of $R$ changes sign too. Gram–Schmidt picks $r_{ii} = |\mathbf w_i| > 0$; Householder-based routines such as LAPACK's do not bother.`,
      visual: board([[-5, -5], [0, 13]], { ring: [[0, 0], [0, 1]], caption: 'An R with its first row negated, as NumPy might return for the worked example. The matching column of Q is negated too.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §4.4: Orthonormal bases and Gram–Schmidt', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Trefethen and Bau, Numerical Linear Algebra, Lectures 7–8 (QR and Gram–Schmidt)', url: 'https://people.maths.ox.ac.uk/trefethen/text.html' },
    { label: 'NumPy documentation: numpy.linalg.qr', url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.qr.html' },
  ],
});
