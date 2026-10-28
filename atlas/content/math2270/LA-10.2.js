// Orthogonal projections: onto a line, onto a subspace through the normal
// equations, the projection matrix P = A(AᵀA)⁻¹Aᵀ (P² = P, Pᵀ = P), the
// residual perpendicular to the subspace, and the distance to a subspace.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, norm, sub, scale, add, matvec, matmul, transpose, matTeX, tupleTeX, colTeX, map2d } from './_la.js';
import { cross, projLine, projCols, projPic, planePic } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const PEX = [[2, -1, 1], [-1, 2, 1], [1, 1, 2]];   // 3P for the plane spanned by (1, 0, 1) and (0, 1, 1)
const Pb = (i) => `(${PEX[i][0]}*b1 + ${PEX[i][1]}*b2 + ${PEX[i][2]}*b3)/3`;

/** A plane problem with clean numbers: A = [a1 a2], b = A x̂ + k (a1 × a2). */
function planeProblem(r) {
  for (let k = 0; k < 500; k++) {
    const a1 = [1, r.int(-1, 2), r.int(-1, 2)], a2 = [r.int(-1, 1), 1, r.int(-1, 2)];
    const n = cross(a1, a2);
    if (n.every((v) => v === 0) || Math.max(...n.map(Math.abs)) > 3) continue;
    const xh = [r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0])], kk = r.intExcept(-2, 2, [0]);
    const p = add(scale(a1, xh[0]), scale(a2, xh[1])), e = scale(n, kk), b = add(p, e);
    if (Math.max(...b.map(Math.abs)) > 7) continue;
    return { a1, a2, n, xh, p, e, b };
  }
  return { a1: [1, 0, 1], a2: [0, 1, 1], n: [-1, -1, 1], xh: [1, 1], p: [1, 1, 2], e: [-1, -1, 1], b: [0, 0, 3] };
}

export default lesson({
  id: 'math2270.LA-10.2',
  title: 'Orthogonal projections',
  minutes: 13, difficulty: 3,
  intro: t`The **orthogonal projection** of $\mathbf b$ onto a subspace is the point $\mathbf p$ of the subspace nearest to $\mathbf b$. What makes it nearest is a right angle: the **residual** $\mathbf e = \mathbf b - \mathbf p$ is perpendicular to the whole subspace. Onto the line through $\mathbf a$, that gives $\mathbf p = \dfrac{\mathbf a\cdot\mathbf b}{\mathbf a\cdot\mathbf a}\,\mathbf a$. Onto the column space of a matrix $A$, write $\mathbf p = A\hat{\mathbf x}$ and ask $\mathbf e$ to be perpendicular to every column: $A${T}(\mathbf b - A\hat{\mathbf x}) = \mathbf 0$, the **normal equations** $A${T}A\,\hat{\mathbf x} = A${T}\mathbf b$. Solving them gives the projection matrix

$$P = A(A${T}A)^{-1}A${T}, \qquad \mathbf p = P\mathbf b$$

Projecting twice changes nothing ($P^2 = P$), and $P$ is symmetric. This one picture — a vector, a subspace and a perpendicular residual — is all of least squares (LA-10.4).`,
  symbols: [
    { tex: 'A', text: t`an $m\times n$ matrix whose independent columns span the subspace (so $A${T}A$ is invertible)` },
    { tex: t`\mathbf b`, text: t`the vector being projected, in $\mathbb R^m$` },
    { tex: t`\hat{\mathbf x}`, text: t`the weights on the columns: $\mathbf p = A\hat{\mathbf x}$, found from $A${T}A\,\hat{\mathbf x} = A${T}\mathbf b$` },
    { tex: t`\mathbf p = P\mathbf b`, text: t`the projection: the point of $C(A)$ nearest $\mathbf b$` },
    { tex: t`\mathbf e = \mathbf b - \mathbf p`, text: t`the residual, perpendicular to every column of $A$; its length is the distance from $\mathbf b$ to the subspace` },
    { tex: 'P', text: t`the $m\times m$ projection matrix; $P^2 = P$ and $P${T} = P$` },
  ],
  why: 'Every least-squares fit, every Fourier partial sum and every “component of the thrust along the axis” is an orthogonal projection, and the right angle at the residual is what makes it the best approximation.',
  visual: {
    type: 'calc-vectors3d',
    title: 'The residual always stands at right angles to the plane',
    lead: t`The violet plane is spanned by $\mathbf a_1 = (1, 0, 1)$ and $\mathbf a_2 = (0, 1, 1)$; for it $P = \tfrac13${matTeX(PEX)}$. Move $\mathbf b$ with the sliders and watch its projection $\mathbf p$ (gold) and the residual $\mathbf e$ (red, dashed). Drag to rotate the scene.`,
    tasks: [
      'Whatever b is, e · a₁ and e · a₂ stay 0: the residual is perpendicular to the plane.',
      'Set b = (1, 1, 2), which is a₁ + a₂: b is in the plane, so p = b and e = 0. Projecting a vector already in the subspace does nothing (P² = P).',
      'Set b = (−1, −1, 1), the normal to the plane: p = 0, and all of b is residual.',
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'b1', label: t`$b_1$`, min: -3, max: 3, step: 0.5, value: -1, explain: t`First component of $\mathbf b$.` },
        { key: 'b2', label: t`$b_2$`, min: -3, max: 3, step: 0.5, value: 0, explain: t`Second component of $\mathbf b$.` },
        { key: 'b3', label: t`$b_3$`, min: -3, max: 3, step: 0.5, value: 2.5, explain: t`Third component of $\mathbf b$.` },
      ],
      planes: [{ normal: [-1, -1, 1], point: [0, 0, 0], size: 2.8, color: 'violet', alpha: 0.2 }],
      vectors: [
        { to: [1, 0, 1], color: 'good', label: '\\mathbf a_1' },
        { to: [0, 1, 1], color: 'warn', label: '\\mathbf a_2' },
        { to: ['b1', 'b2', 'b3'], color: 'accent', label: '\\mathbf b' },
        { to: [Pb(0), Pb(1), Pb(2)], color: 'gold', label: '\\mathbf p' },
        { from: [Pb(0), Pb(1), Pb(2)], to: ['b1', 'b2', 'b3'], color: 'bad', dash: true },
      ],
      points: [{ at: [`(b1 + ${Pb(0)})/2`, `(b2 + ${Pb(1)})/2`, `(b3 + ${Pb(2)})/2`], color: 'bad', r: 0.01, label: '\\mathbf e' }],
      readouts: [
        { label: t`$\mathbf p = P\mathbf b$`, vec: [Pb(0), Pb(1), Pb(2)], digits: 3 },
        { label: t`$|\mathbf e|$ (distance to the plane)`, expr: `sqrt((b1 - ${Pb(0)})^2 + (b2 - ${Pb(1)})^2 + (b3 - ${Pb(2)})^2)`, digits: 3 },
        { label: t`$\mathbf e\cdot\mathbf a_1$`, expr: `(b1 - ${Pb(0)}) + (b3 - ${Pb(2)})`, digits: 3 },
        { label: t`$\mathbf e\cdot\mathbf a_2$`, expr: `(b2 - ${Pb(1)}) + (b3 - ${Pb(2)})`, digits: 3 },
      ],
    },
    caption: 'Arrows to scale. The violet square is a patch of the plane (it goes on for ever). Gold: the projection p; red dashed: the residual e = b − p.',
  },
  example: {
    prompt: t`Project $\mathbf b = (3, 0, 3)$ onto the plane spanned by $\mathbf a_1 = (1, 1, 0)$ and $\mathbf a_2 = (0, 1, 1)$, and find the distance from $\mathbf b$ to the plane.`,
    visual: planePic([1, 1, 0], [0, 1, 1], [3, 0, 3], { caption: 'b, the plane of a₁ and a₂, the projection p (gold) and the residual e (red), which meets the plane at a right angle. Drag to rotate.' }),
    steps: [
      { label: 'Set up', text: t`Put the spanning vectors in the columns: $A = ${matTeX([[1, 0], [1, 1], [0, 1]])}$. We want $\mathbf p = A\hat{\mathbf x}$ with $\mathbf b - A\hat{\mathbf x}$ perpendicular to both columns.` },
      { label: 'Normal equations', text: t`$A${T}A = ${matTeX([[2, 1], [1, 2]])}$ (column lengths squared on the diagonal, their dot product off it) and $A${T}\mathbf b = (3 + 0,\ 0 + 3) = (3, 3)$.` },
      { label: 'Solve', text: t`$2\hat x_1 + \hat x_2 = 3$ and $\hat x_1 + 2\hat x_2 = 3$ give $\hat{\mathbf x} = (1, 1)$.` },
      { label: 'Project', text: t`$\mathbf p = 1\cdot\mathbf a_1 + 1\cdot\mathbf a_2 = (1, 2, 1)$, and $\mathbf e = \mathbf b - \mathbf p = (2, -2, 2)$.` },
      { label: 'Check the right angle', text: t`$\mathbf e\cdot\mathbf a_1 = 2 - 2 + 0 = 0$ and $\mathbf e\cdot\mathbf a_2 = 0 - 2 + 2 = 0$ ✓. Indeed $\mathbf e$ is a multiple of the plane's normal $\mathbf a_1\times\mathbf a_2 = (1, -1, 1)$.` },
      { label: 'Distance', text: t`$|\mathbf e| = \sqrt{4 + 4 + 4} = 2\sqrt3 \approx 3.46$. Sense check: $|\mathbf b|^2 = 18 = |\mathbf p|^2 + |\mathbf e|^2 = 6 + 12$ — Pythagoras, because $\mathbf p \perp \mathbf e$.` },
    ],
    answer: t`$\mathbf p = (1, 2, 1)$, $\mathbf e = (2, -2, 2)$, and the distance from $\mathbf b$ to the plane is $2\sqrt3 \approx 3.46$.`,
  },
  practice: [
    num({
      id: 'proj-line', difficulty: 1,
      gen(r) {
        let a, b;
        for (let k = 0; k < 200; k++) {
          a = [r.intExcept(-3, 3, [0]), r.int(-3, 3)]; b = [r.int(-4, 4), r.int(-4, 4)];
          if (dot(a, b) !== 0 && Math.abs(a[0] * b[1] - a[1] * b[0]) > 0) break;
        }
        const p = projLine(a, b), which = r.int(0, 1);
        return {
          prompt: t`Project $\mathbf b = ${tupleTeX(b)}$ onto the line through $\mathbf a = ${tupleTeX(a)}$. What is the ${which ? 'second' : 'first'} component of $\mathbf p$?`,
          answer: p[which], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: dot(a, b) * a[which], feedback: t`You left out the division by $\mathbf a\cdot\mathbf a = ${dot(a, a)}$, which is what makes the formula work for an $\mathbf a$ of any length.` }, { value: (dot(a, b) / norm(a)) * a[which], feedback: t`Divide by $\mathbf a\cdot\mathbf a = |\mathbf a|^2$, not by $|\mathbf a|$: one factor of $|\mathbf a|$ normalizes the dot product, the other the direction.` }].filter((e) => Math.abs(e.value - p[which]) > 1e-6),
          hints: [t`$\mathbf p = \dfrac{\mathbf a\cdot\mathbf b}{\mathbf a\cdot\mathbf a}\,\mathbf a$.`, t`$\mathbf a\cdot\mathbf b = ${dot(a, b)}$ and $\mathbf a\cdot\mathbf a = ${dot(a, a)}$.`],
          teach: 'The projection onto a line is a multiple of a, with the multiple a·b / a·a.',
          explain: t`$\mathbf p = \tfrac{${dot(a, b)}}{${dot(a, a)}}${tupleTeX(a)} = ${tupleTeX(p)}$, so the component is $${nice(p[which])}$. The residual $\mathbf b - \mathbf p = ${tupleTeX(sub(b, p))}$ has dot product $${nice(dot(sub(b, p), a))}$ with $\mathbf a$.`,
          visual: projPic(a, b, { show: ['a'], caption: 'b and the line through a (dashed). The projection is the point of the line nearest the tip of b.' }),
        };
      },
    }),
    {
      type: 'point', id: 'drag-foot', difficulty: 2,
      gen(r) {
        const a = r.pick([[2, 1], [1, 2], [3, 1], [1, -1], [2, -1], [1, 3]]), b = r.pick([[1, 3], [3, 3], [-1, 3], [3, 0], [0, 3], [2, 4]]);
        const p = projLine(a, b);
        return {
          prompt: t`Drag the point to the orthogonal projection of $\mathbf b = ${tupleTeX(b)}$ onto the line through $\mathbf a = ${tupleTeX(a)}$.`,
          answer: { x: p[0], y: p[1] }, tol: { x: 0.2, y: 0.2 },
          instruction: 'Drag the point along to where the line is nearest the tip of b, then check.',
          visual: { type: 'graph', params: { x: [-4.5, 5.5], y: [-2, 4.5], aspect: 'wide', equal: true, xlabel: '', ylabel: '', curves: [{ param: [`${a[0]}*t`, `${a[1]}*t`], t: [-6, 6], color: 'good', width: 1.2, dash: [4, 4] }], arrows: [{ from: [0, 0], to: a, color: 'good', width: 3, label: 'a' }, { from: [0, 0], to: b, color: 'accent', width: 2.6, label: 'b' }], drag: [{ key: 'p', x: -3, y: 3.5, snap: 0.05 }] } },
          hints: ['The segment from the projection to the tip of b must be perpendicular to the line.', t`$\mathbf p = \dfrac{\mathbf a\cdot\mathbf b}{\mathbf a\cdot\mathbf a}\mathbf a = \dfrac{${dot(a, b)}}{${dot(a, a)}}\mathbf a$.`],
          teach: 'The nearest point of a line is the foot of the perpendicular from b.',
          explain: t`$\mathbf p = \tfrac{${dot(a, b)}}{${dot(a, a)}}${tupleTeX(a)} = (${nice(p[0])}, ${nice(p[1])})$. Any other point of the line is farther from $\mathbf b$, by Pythagoras: its distance squared is $|\mathbf e|^2$ plus the square of how far along the line it is from $\mathbf p$.`,
        };
      },
    },
    num({
      id: 'proj-plane', difficulty: 2,
      gen(r) {
        const { a1, a2, p, b } = planeProblem(r), which = r.int(0, 2);
        const A = transpose([a1, a2]), AtA = matmul(transpose(A), A), Atb = matvec(transpose(A), b);
        return {
          prompt: t`Project $\mathbf b = ${tupleTeX(b)}$ onto the plane spanned by $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$. What is component ${which + 1} of $\mathbf p$?`,
          answer: p[which], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: add(projLine(a1, b), projLine(a2, b))[which], feedback: t`Adding the projections onto $\mathbf a_1$ and $\mathbf a_2$ separately works only when $\mathbf a_1 \perp \mathbf a_2$; here $\mathbf a_1\cdot\mathbf a_2 = ${dot(a1, a2)}$. Solve the normal equations instead.` }].filter((e) => Math.abs(e.value - p[which]) > 1e-3),
          hints: [t`$A = [\,\mathbf a_1\ \mathbf a_2\,]$: solve $A${T}A\,\hat{\mathbf x} = A${T}\mathbf b$, then $\mathbf p = \hat x_1\mathbf a_1 + \hat x_2\mathbf a_2$.`, t`$A${T}A = ${matTeX(AtA)}$ and $A${T}\mathbf b = ${tupleTeX(Atb)}$.`],
          teach: 'Projection onto a plane: solve the 2 × 2 normal equations for the weights, then combine the spanning vectors.',
          explain: t`$\hat{\mathbf x} = ${tupleTeX(projCols([a1, a2], b).xhat.map((v) => Math.round(v * 1e6) / 1e6))}$, so $\mathbf p = ${tupleTeX(p)}$ and $\mathbf e = ${tupleTeX(sub(b, p))}$, which is perpendicular to both $\mathbf a_1$ and $\mathbf a_2$.`,
          visual: planePic(a1, a2, b, { show: ['a'], caption: 'b and the plane spanned by a₁ and a₂ (a patch of it). Drag to rotate.' }),
        };
      },
    }),
    multi({
      id: 'P-props', difficulty: 2,
      prompt: t`$P = A(A${T}A)^{-1}A${T}$ projects $\mathbb R^3$ onto a plane (the column space of a $3\times2$ matrix $A$). Which statements are true?`,
      choices: [t`$P^2 = P$`, t`$P${T} = P$`, t`$P\mathbf e = \mathbf 0$ for every $\mathbf e$ perpendicular to the plane`, t`$P$ is invertible`, t`$P = I$, because $A(A${T}A)^{-1}A${T} = AA^{-1}(A${T})^{-1}A${T}$`],
      answer: [0, 1, 2],
      why: {
        3: t`$P$ sends the whole normal line to $\mathbf 0$, so it cannot be undone: $\det P = 0$. Its rank is 2, the dimension of the plane.`,
        4: t`$A$ is $3\times2$: it has no inverse, so $(A${T}A)^{-1}$ cannot be split that way. Only for a square invertible $A$ (the “plane” is all of $\mathbb R^3$) is $P = I$.`,
      },
      hints: ['Project a vector that is already in the plane. What happens?', t`Transpose $A(A${T}A)^{-1}A${T}$ using $(XYZ)${T} = Z${T}Y${T}X${T}$; $A${T}A$ is symmetric.`],
      teach: 'A projection matrix is idempotent (P² = P), symmetric, and kills everything perpendicular to its subspace.',
      explain: t`$P^2 = A(A${T}A)^{-1}(A${T}A)(A${T}A)^{-1}A${T} = P$; $P${T} = P$ because $A${T}A$ is symmetric; and $A${T}\mathbf e = \mathbf 0$ for $\mathbf e \perp$ every column, so $P\mathbf e = \mathbf 0$. The picture shows the 2D version: everything lands on one line.`,
      visual: map2d([[0.8, 0.4], [0.4, 0.2]], { shape: 'F', view: 1.6, colNames: ['Pe₁', 'Pe₂'], caption: 'The 2D projection P = aaᵀ/(aᵀa) onto the line through a = (2, 1): the whole plane, F included, is flattened onto that line. Applying P again changes nothing.' }),
    }),
    num({
      id: 'distance', difficulty: 3,
      gen(r) {
        const { a1, a2, n, b } = planeProblem(r), d = Math.abs(dot(b, n)) / norm(n);
        return {
          prompt: t`How far is the point $\mathbf b = ${tupleTeX(b)}$ from the plane through the origin spanned by $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$? Give 3 significant figures.`,
          answer: d, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(dot(b, n)), feedback: t`Divide by the length of the normal, $|\mathbf n| = ${nice(norm(n))}$: $|\mathbf b\cdot\mathbf n|$ alone depends on how long you made $\mathbf n$.` }, { value: norm(projCols([a1, a2], b).p), feedback: t`That is $|\mathbf p|$, the length of the projection. The distance to the plane is the length of the residual $\mathbf e = \mathbf b - \mathbf p$.` }].filter((e) => Math.abs(e.value - d) > 0.01 * d),
          hints: [t`The distance is $|\mathbf e|$, the length of the residual. The residual lies along the normal $\mathbf n = \mathbf a_1\times\mathbf a_2$.`, t`$\mathbf n = ${tupleTeX(n)}$, so $|\mathbf e| = |\mathbf b\cdot\mathbf n|/|\mathbf n|$ — the projection of $\mathbf b$ onto the normal line.`],
          teach: 'The distance from b to a subspace is the length of the residual b − p; for a plane in ℝ³ that is the projection onto the normal.',
          explain: t`$\mathbf b\cdot\mathbf n = ${dot(b, n)}$ and $|\mathbf n| = ${nice(norm(n))}$, so the distance is $${Math.abs(dot(b, n))}/${nice(norm(n))} \approx ${nice(d, 3)}$. The same number is $|\mathbf b - \mathbf p|$ from the normal equations: projecting onto a plane and onto its normal line are complementary, $P_{\text{plane}} + P_{\text{normal}} = I$.`,
          visual: planePic(a1, a2, b, { show: ['a'], caption: 'b and the plane (a patch of it). The distance is measured along the perpendicular. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'P-entry', difficulty: 3,
      gen(r) {
        let a;
        for (let k = 0; k < 100; k++) { a = [r.intExcept(-2, 3, [0]), r.int(-2, 3), r.intExcept(-2, 2, [0])]; if (a.filter((v) => v !== 0).length === 3) break; }
        const i = r.int(0, 2), j = r.int(0, 2), val = (a[i] * a[j]) / dot(a, a);
        return {
          prompt: t`The matrix that projects $\mathbb R^3$ onto the line through $\mathbf a = ${tupleTeX(a)}$ is $P = \dfrac{\mathbf a\mathbf a${T}}{\mathbf a${T}\mathbf a}$. Find its entry in row ${i + 1}, column ${j + 1}.`,
          answer: val, tol: { rel: 1e-3, abs: 1e-4 },
          errors: [{ value: a[i] * a[j], feedback: t`Divide by $\mathbf a${T}\mathbf a = ${dot(a, a)}$.` }].filter((e) => Math.abs(e.value - val) > 1e-6),
          hints: [t`$\mathbf a\mathbf a${T}$ is a $3\times3$ matrix (column times row) with entries $a_ia_j$.`, t`Entry $(${i + 1}, ${j + 1})$: $a_${i + 1}a_${j + 1}/(\mathbf a${T}\mathbf a) = (${a[i]})(${a[j]})/${dot(a, a)}$.`],
          teach: 'Onto a line, A is the single column a, and P = A(AᵀA)⁻¹Aᵀ becomes aaᵀ/(aᵀa): rank 1, symmetric, with trace 1.',
          explain: t`$P_{${i + 1}${j + 1}} = ${a[i] * a[j]}/${dot(a, a)} = ${nice(val)}$. The diagonal of $P$ adds up to $(a_1^2 + a_2^2 + a_3^2)/\mathbf a${T}\mathbf a = 1$: the trace of a projection is the dimension it projects onto.`,
          visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: a, color: 'good', label: '\\mathbf a' }], lines: [{ point: [0, 0, 0], dir: a, t: [-1.2, 1.2], color: 'good' }] }, caption: 'The line through a that P projects onto. Drag to rotate.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-plane', difficulty: 2,
      gen(r) {
        const { a1, a2, xh, b } = planeProblem(r), which = r.int(0, 1);
        return {
          prompt: t`$\mathbf p = \hat x_1\mathbf a_1 + \hat x_2\mathbf a_2$ is the projection of $\mathbf b = ${tupleTeX(b)}$ onto the plane spanned by $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$. Find $\hat x_${which + 1}$.`,
          answer: xh[which], tol: { rel: 1e-3, abs: 1e-3 },
          hints: [t`Solve $A${T}A\,\hat{\mathbf x} = A${T}\mathbf b$ with $A = [\,\mathbf a_1\ \mathbf a_2\,]$.`],
          teach: 'The weights of the projection come from the normal equations.',
          explain: t`$A${T}A = ${matTeX(matmul([a1, a2], transpose([a1, a2])))}$, $A${T}\mathbf b = ${tupleTeX([dot(a1, b), dot(a2, b)])}$, so $\hat{\mathbf x} = ${tupleTeX(xh)}$.`,
          visual: planePic(a1, a2, b, { show: ['a'], caption: 'b and the plane of a₁ and a₂. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'cp-side-force', difficulty: 3, transfer: true,
      gen(r) {
        const axis = r.pick([[3, 0, 4], [0, 3, 4], [4, 0, 3], [0, 4, 3]]), m = r.int(20, 40);
        let Tv;
        for (let k = 0; k < 100; k++) { Tv = add(scale(axis, m), [r.int(-12, 12), r.int(-12, 12), r.int(-12, 12)]); if (norm(sub(Tv, projLine(axis, Tv))) > 4) break; }
        const along = projLine(axis, Tv), side = norm(sub(Tv, along)), axial = dot(axis, Tv) / norm(axis);
        return {
          prompt: t`A gimballed rocket engine pushes with thrust $\mathbf T = ${tupleTeX(Tv)}$ kN (in launch-pad axes). The vehicle's long axis points along $${tupleTeX(axis)}$. The part of $\mathbf T$ along the axis accelerates the rocket; what is left over, perpendicular to the axis, is the side force that steers it. How large is the side force, in kN?`,
          answer: side, units: 'kN', tol: { rel: 0.005 },
          errors: [{ value: axial, feedback: t`That is the axial component $\mathbf T\cdot\hat{\mathbf a}$. The side force is the residual $\mathbf T - \mathbf p$, perpendicular to the axis.` }, { value: norm(Tv) - axial, feedback: t`Lengths do not subtract: $|\mathbf e|^2 = |\mathbf T|^2 - |\mathbf p|^2$ (Pythagoras), not $|\mathbf e| = |\mathbf T| - |\mathbf p|$.` }].filter((e) => Math.abs(e.value - side) > 0.01 * side),
          hints: [t`Project $\mathbf T$ onto the axis line: $\mathbf p = \dfrac{\mathbf a\cdot\mathbf T}{\mathbf a\cdot\mathbf a}\mathbf a$.`, t`The side force is $|\mathbf T - \mathbf p| = \sqrt{|\mathbf T|^2 - |\mathbf p|^2}$.`],
          teach: 'Splitting a vector into a part along a direction and a perpendicular residual is an orthogonal projection.',
          explain: t`$\mathbf p \approx (${along.map((v) => nice(v, 4)).join(',\ ')})$ kN, so the side force is $|\mathbf T - \mathbf p| \approx ${nice(side, 3)}$ kN, against an axial thrust of $${nice(axial, 4)}$ kN — a gimbal angle of about $${nice((Math.atan2(side, axial) * 180) / Math.PI, 2)}^\circ$.`,
          visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: scale(axis, 2.2 / norm(axis)), color: 'good', label: '\\text{axis}' }, { to: scale(Tv, 2.6 / norm(Tv)), color: 'accent', label: '\\mathbf T' }], lines: [{ point: [0, 0, 0], dir: axis, t: [-2, 2], color: 'good' }] }, caption: 'The vehicle axis (green) and the thrust direction (blue), both shrunk to fit; not to scale. Drag to rotate.' },
        };
      },
    }),
    mcq({
      id: 'cp-QQt', difficulty: 3,
      prompt: t`The columns of the $5\times2$ matrix $Q$ are orthonormal. Which matrix projects $\mathbb R^5$ onto the column space of $Q$?`,
      choices: [t`$QQ${T}$`, t`$Q${T}Q$`, t`$I$`, t`$Q(Q${T}Q)Q${T}Q$`],
      answer: 0,
      why: {
        1: t`$Q${T}Q$ is $2\times2$ — it is $I_2$, the statement that the columns are orthonormal. A projection of $\mathbb R^5$ must be $5\times5$.`,
        2: t`$I$ projects onto all of $\mathbb R^5$. The column space of $Q$ is only a plane.`,
        3: t`With $Q${T}Q = I$ this is $Q\cdot I\cdot I = Q$, a $5\times2$ matrix — not even square.`,
      },
      hints: [t`Start from $P = A(A${T}A)^{-1}A${T}$ with $A = Q$.`, t`$Q${T}Q = I$.`],
      teach: 'With orthonormal columns the normal equations disappear: P = QQᵀ, and the weights are just Qᵀb.',
      explain: t`$P = Q(Q${T}Q)^{-1}Q${T} = QQ${T}$: project by taking dot products with each $\mathbf q_i$ and adding $(\mathbf q_i\cdot\mathbf b)\mathbf q_i$. That is why orthonormal bases — Gram–Schmidt's output, next lesson — make projections cheap.`,
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §4.2: Projections', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT 18.06, Lecture 15: Projections onto subspaces', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
