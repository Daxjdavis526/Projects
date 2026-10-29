// Transposes and symmetric matrices: moving a matrix across a dot product,
// (AB)ᵀ = BᵀAᵀ, AᵀA, and the symmetric tensors of physics.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, matvec, transpose, matTeX, tupleTeX, colTeX, stems, map2d, rr } from './_la.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const dotGrid = (blocks, caption) => ({
  type: 'graph',
  params: {
    x: [-0.8, 8.4], y: [-1, 3.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    points: blocks.flatMap(({ rows, cols, at, color, label }) => [
      ...Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => ({ x: at + j * 0.7, y: 2.6 - i * 0.7, color, r: 5.5 }))).flat(),
      { x: at + ((cols - 1) * 0.7) / 2, y: -0.55, r: 0.01, color, label, labelAlign: 'center', labelDx: 0, labelDy: 0 },
    ]),
  },
  caption,
});
// point masses as a 3D scene, labelled with their masses
const masses = (pts, caption) => ({
  type: 'calc-vectors3d',
  params: {
    range: 2,
    points: pts.map(([m, p]) => ({ at: p, color: 'gold', label: t`${m}\,\text{kg}` })),
    segments: pts.map(([, p]) => ({ from: [0, 0, 0], to: p, color: 'ink3', dash: true })),
  },
  caption,
});

export default lesson({
  id: 'math2270.LA-3.4',
  title: 'Transposes and symmetric matrices',
  minutes: 10, difficulty: 2,
  intro: t`The **transpose** $A${T}$ turns rows into columns: $(A${T})_{ij} = a_{ji}$, so an $m\times n$ matrix becomes $n\times m$. It is exactly the matrix needed to move $A$ from one side of a dot product to the other:

$$(A\mathbf x)\cdot\mathbf y = \mathbf x\cdot(A${T}\mathbf y)$$

A matrix equal to its own transpose is **symmetric** — a mirror image across its diagonal. Physics is full of them: the inertia tensor, the stress tensor, every mesh-resistance matrix — and $A${T}A$ for any matrix $A$ at all, the matrix at the heart of least-squares fitting.`,
  symbols: [
    { tex: t`A${T}`, text: t`the transpose: row $i$ of $A${T}$ is column $i$ of $A$` },
    { tex: t`a_{ji}`, text: t`the entry of $A$ in row $j$, column $i$ — it becomes the entry in row $i$, column $j$ of $A${T}$` },
    { tex: t`\mathbf x,\ \mathbf y`, text: t`any vectors of matching sizes: for an $m\times n$ matrix $A$, $\mathbf x$ has $n$ components and $\mathbf y$ has $m$` },
    { tex: t`\mathbf x\cdot\mathbf y = \mathbf x${T}\mathbf y`, text: t`a dot product written as a matrix product: a $1\times n$ row times an $n\times1$ column` },
    { tex: t`(AB)${T} = B${T}A${T}`, text: 'the transpose of a product reverses the order, like the inverse' },
    { tex: t`A${T} = A`, text: t`symmetric: $a_{ij} = a_{ji}$ for every $i$ and $j$` },
  ],
  why: 'Symmetric matrices have real eigenvalues and perpendicular principal axes (LA-11): the principal axes of a tumbling satellite, the principal stresses in a pressure vessel and the metric tensor of spacetime are all symmetric.',
  visual: {
    type: 'la-map2d',
    title: 'Symmetric maps stretch along perpendicular axes',
    lead: t`The map $A = \begin{bmatrix} 2 & b \\ c & 1 \end{bmatrix}$ turns the unit circle into an ellipse. The violet dashed lines are directions $A$ only stretches (by $\lambda$, shown) — its eigenvector directions, met properly in LA-9. Compare what happens when $b = c$ (symmetric) and when $b \ne c$.`,
    tasks: [
      'Set b = c (try both 1): A is symmetric, and its two stretch lines are perpendicular — along the ellipse’s axes.',
      'Now set b = 1.5 and c = 0: the stretch lines are no longer perpendicular, and no longer the ellipse’s axes.',
      'Set b = 1 and c = −1: the stretch lines disappear altogether — the map now contains a rotation.',
    ],
    params: {
      A: [[2, 'b'], ['c', 1]], shape: 'circle', eigen: true, view: 2.6, readout: ['A'], colNames: ['Ae₁', 'Ae₂'],
      sliders: [
        { key: 'b', label: t`Entry $b$ (row 1, column 2)`, min: -2, max: 2, step: 0.25, value: 1, explain: 'The top-right entry.' },
        { key: 'c', label: t`Entry $c$ (row 2, column 1)`, min: -2, max: 2, step: 0.25, value: 0, explain: t`The bottom-left entry; $A$ is symmetric when $c = b$.` },
      ],
    },
    caption: 'Dashed: the unit circle before the map. Bold: its image, an ellipse. Violet dashed lines: directions the map sends onto themselves, each stretched by the factor λ.',
  },
  example: {
    prompt: t`A strain gauge reads $1$, $3$ and $4$ mV under loads of $0$, $1$ and $2$ kN. No straight line $v = c_0 + c_1 L$ passes through all three points. Form $A${T}A$ and $A${T}\mathbf b$ for the system $A\mathbf c = \mathbf b$ and solve $A${T}A\,\mathbf c = A${T}\mathbf b$ — the least-squares line.`,
    visual: { type: 'graph', params: { x: [-0.4, 2.6], y: [0, 5], aspect: 'wide', xlabel: 'load (kN)', ylabel: 'reading (mV)', axesAt: 'edge', points: [{ x: 0, y: 1, color: 'accent', r: 5.5 }, { x: 1, y: 3, color: 'accent', r: 5.5 }, { x: 2, y: 4, color: 'accent', r: 5.5 }], curves: [{ fn: '7/6 + 1.5x', color: 'gold', label: 'least-squares line', labelAt: 1.6, labelDy: 16 }] }, caption: 'The three readings and the least-squares line, which misses each point a little rather than one point a lot.' },
    steps: [
      { label: 'The system', text: t`One equation per reading: $$A = ${matTeX([[1, 0], [1, 1], [1, 2]])},\quad \mathbf c = \begin{bmatrix} c_0 \\ c_1 \end{bmatrix},\quad \mathbf b = ${colTeX([1, 3, 4])}.$$ Three equations, two unknowns, no exact solution.` },
      { label: 'Transpose', text: t`$A${T} = ${matTeX([[1, 1, 1], [0, 1, 2]])}$: the columns of $A$ become rows.` },
      { label: 'Form A-transpose-A', text: t`$A${T}A = ${matTeX([[3, 3], [3, 5]])}$. Each entry is a dot product of two columns of $A$ — column 1 with column 2 is $0 + 1 + 2 = 3$, in both off-diagonal places. That is why $A${T}A$ is always symmetric.` },
      { label: 'Form A-transpose-b', text: t`$A${T}\mathbf b = (1 + 3 + 4,\ 0 + 3 + 8) = (8, 11)$.` },
      { label: 'Solve', text: t`$3c_0 + 3c_1 = 8$ and $3c_0 + 5c_1 = 11$: subtracting, $2c_1 = 3$, so $c_1 = 1.5$ mV/kN and $c_0 = 7/6 \approx 1.17$ mV.` },
      { label: 'Sense check', text: t`The misses are $1 - 1.17 = -0.17$, $3 - 2.67 = +0.33$ and $4 - 4.17 = -0.17$ mV: they sum to zero, and so does each miss times its load. Why these equations give the *best* line is the subject of LA-10; here the point is that $A${T}$ turns three inconsistent equations into two solvable ones.` },
    ],
    answer: t`$A${T}A = ${matTeX([[3, 3], [3, 5]])}$ (symmetric), $A${T}\mathbf b = (8, 11)$, and the line is $v \approx 1.17 + 1.5L$.`,
  },
  practice: [
    num({
      id: 'transpose-entry', difficulty: 1,
      gen(r) {
        const A = [0, 1, 2].map(() => [r.int(-4, 5), r.int(-4, 5)]);
        const i = r.int(0, 1), j = r.intExcept(0, 2, [i]);
        const val = A[j][i];
        return {
          prompt: t`$A = ${matTeX(A)}$ is $3\times2$, so $A${T}$ is $2\times3$. What is the entry of $A${T}$ in row ${i + 1}, column ${j + 1}?`,
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: j < 2 && A[i][j] !== val ? [{ value: A[i][j], feedback: t`That is $a_{${i + 1}${j + 1}}$, from $A$ itself. In $A${T}$ the indices swap: $(A${T})_{${i + 1}${j + 1}} = a_{${j + 1}${i + 1}}$.` }] : [],
          hints: [t`$(A${T})_{ij} = a_{ji}$.`, t`Row ${i + 1} of $A${T}$ is column ${i + 1} of $A$: $${tupleTeX(A.map((row) => row[i]))}$.`],
          teach: 'Transposing swaps the two indices: the entry in row i, column j of Aᵀ is the entry in row j, column i of A.',
          explain: t`$(A${T})_{${i + 1}${j + 1}} = a_{${j + 1}${i + 1}} = ${val}$. In full, $A${T} = ${matTeX(transpose(A))}$.`,
          visual: rr(A, { aug: false, picture: 'none', caption: 'A, with its rows labelled. In the transpose, each of A’s columns becomes a row.' }),
        };
      },
    }),
    mcq({
      id: 'ABt', difficulty: 2,
      prompt: t`$A$ is $2\times3$ and $B$ is $3\times4$. Which expression equals $(AB)${T}$?`,
      choices: [t`$B${T}A${T}$`, t`$A${T}B${T}$`, t`$AB$`, t`$BA$`],
      answer: 0,
      why: {
        1: t`Check the shapes: $A${T}$ is $3\times2$ and $B${T}$ is $4\times3$, so $A${T}B${T}$ does not even exist. The order must reverse.`,
        2: t`$AB$ is $2\times4$, but its transpose is $4\times2$.`,
        3: t`$BA$ would need $B$'s 4 columns to match $A$'s 2 rows: it is not defined.`,
      },
      hints: [t`$(AB)${T}$ is $4\times2$. Which product of transposes has that shape?`, t`$B${T}$ is $4\times3$ and $A${T}$ is $3\times2$.`],
      teach: 'The transpose of a product is the product of the transposes in reverse order.',
      explain: t`$(AB)${T} = B${T}A${T}$: a $(4\times3)(3\times2) = 4\times2$ product. Entry by entry, $((AB)${T})_{ij} = (AB)_{ji}$ = row $j$ of $A$ dotted with column $i$ of $B$ = row $i$ of $B${T}$ dotted with column $j$ of $A${T}$.`,
      visual: dotGrid([{ rows: 2, cols: 3, at: 0, color: 'accent', label: 'first: 2 × 3' }, { rows: 3, cols: 4, at: 4, color: 'warn', label: 'second: 3 × 4' }], 'The two matrices as grids of entries, in the order AB. Transposing each one turns its grid on its side.'),
    }),
    num({
      id: 'AtA-entry', difficulty: 2,
      gen(r) {
        const A = [0, 1, 2, 3].map(() => [r.int(-3, 4), r.int(-3, 4)]);
        const [i, j] = r.pick([[0, 1], [0, 0], [1, 1], [1, 0]]);
        const ci = A.map((row) => row[i]), cj = A.map((row) => row[j]), val = dot(ci, cj);
        return {
          prompt: t`For $A = ${matTeX(A)}$, find the entry of $A${T}A$ in row ${i + 1}, column ${j + 1}.`,
          answer: val, tol: { rel: 0, abs: 0.01 },
          hints: [t`$(A${T}A)_{ij}$ is row $i$ of $A${T}$ dotted with column $j$ of $A$ — that is, column $i$ of $A$ dotted with column $j$ of $A$.`, t`Column ${i + 1} is $${tupleTeX(ci)}$${i === j ? '' : t` and column ${j + 1} is $${tupleTeX(cj)}$`}.`],
          teach: 'Every entry of AᵀA is the dot product of two columns of A, which is why AᵀA is always symmetric.',
          explain: t`$${ci.map((v, k) => `(${v})(${cj[k]})`).join(' + ')} = ${val}$. ${i === j ? t`A diagonal entry is a column's length squared, so it is never negative.` : t`The entry in row ${j + 1}, column ${i + 1} is the same dot product taken the other way round: $A${T}A$ is symmetric.`}`,
          visual: stems(i === j ? [[`column ${i + 1}`, ci, 'accent']] : [[`column ${i + 1}`, ci, 'accent'], [`column ${j + 1}`, cj, 'warn']], { caption: 'The columns of A involved, component by component.' }),
        };
      },
    }),
    {
      type: 'slider', id: 'make-symmetric', difficulty: 2, param: 'c', answer: [1.4, 1.6],
      prompt: t`The map $A = \begin{bmatrix} 2 & 1.5 \\ c & 1 \end{bmatrix}$ has two stretch directions for some values of $c$. Slide $c$ until those two directions are **perpendicular**.`,
      visual: { type: 'la-map2d', params: { A: [[2, 1.5], ['c', 1]], shape: 'circle', eigen: true, view: 2.4, readout: false, sliders: [{ key: 'c', label: t`Entry $c$`, min: -2, max: 2, step: 0.25, value: -1, explain: 'The bottom-left entry of A.' }] }, caption: 'The unit circle and its image under A; violet dashed lines are the directions A only stretches.' },
      instruction: 'Slide c until the two violet lines cross at a right angle, then check.',
      hints: ['For some values of c there are no stretch lines at all; keep sliding.', 'Perpendicular stretch directions are the signature of a symmetric matrix.'],
      teach: 'A 2×2 matrix with real stretch directions has them perpendicular exactly when it is symmetric.',
      explain: t`At $c = 1.5$ the matrix is symmetric, and its stretch directions — eigenvectors — are perpendicular, the 2D case of the spectral theorem (LA-11). For $c < -\tfrac16$ there are no real stretch directions at all.`,
    },
    num({
      id: 'inertia-product', difficulty: 3,
      gen(r) {
        const pos = [[1, 1], [-1, 0.5], [0.5, -1.5], [-1.5, -0.5], [1.5, -1], [-0.5, 1.5]];
        let pick, ms, val;
        for (let k = 0; k < 100; k++) {
          pick = r.shuffle(pos).slice(0, 3); ms = [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
          val = -pick.reduce((s, [x, y], i) => s + ms[i] * x * y, 0);
          if (Math.abs(val) > 0.2) break;
        }
        const pts = pick.map(([x, y], k) => [ms[k], [x, y, 0]]);
        return {
          prompt: t`A small spacecraft is modelled as three point masses in its $xy$-plane: ${pick.map(([x, y], k) => t`$${ms[k]}$ kg at $(${x}, ${y})$ m`).join(', ')}. Its inertia tensor has the off-diagonal entries $I_{xy} = I_{yx} = -\sum m\,x\,y$. Find $I_{xy}$, in kg m².`,
          answer: val, units: 'kg m^2', tol: { rel: 0.005, abs: 0.01 },
          errors: Math.abs(val) > 0.01 ? [{ value: -val, feedback: t`Check the sign: the product of inertia is $-\sum m\,x\,y$.` }] : [],
          hints: [t`Compute $m\,x\,y$ for each mass and add them up.`, t`$\sum m\,x\,y = ${pick.map(([x, y], k) => `(${ms[k]})(${x})(${y})`).join(' + ')}$; then change the sign.`],
          teach: 'A product of inertia couples two axes, and the same entry appears on both sides of the diagonal, which makes the inertia tensor symmetric.',
          explain: t`$\sum m\,x\,y = ${nice(-val)}$, so $I_{xy} = I_{yx} = ${nice(val)}$ kg m². The same number sits in both off-diagonal places because $xy = yx$. ${val === 0 ? '' : t`A nonzero $I_{xy}$ means a spin about the $x$- or $y$-axis is not a free, steady spin (all three masses lie in the $xy$-plane, so the $z$-axis is still a principal axis): the body wobbles unless it turns about a principal axis — an eigenvector of this symmetric matrix (LA-11).`}`,
          visual: masses(pts, 'The three point masses in the xy-plane (gold), joined to the centre by dashed lines. Drag to rotate.'),
        };
      },
    }),
    mcq({
      id: 'stress', difficulty: 2,
      prompt: t`The stress tensor $\sigma$ of a loaded material is symmetric: the shear stress $\sigma_{xy}$ on the faces facing $x$ equals $\sigma_{yx}$ on the faces facing $y$. Why must it be?`,
      choices: [
        'Otherwise the shear forces on a tiny cube would twist it; its torque falls as size³ but its moment of inertia as size⁵, so a small enough cube would spin up without limit',
        'Because the forces on the cube must add up to zero',
        'Because every material behaves the same in all directions',
        'It need not be: the two shears are independent properties of the material',
      ],
      answer: 0,
      why: {
        1: 'Force balance makes opposite faces carry opposite forces, but that says nothing about σxy versus σyx; it takes the balance of torques.',
        2: 'Wood, carbon fibre and single crystals are strongly direction-dependent, yet their stress tensors are symmetric all the same.',
        3: 'Unequal shears on a small cube would give it a net torque, and nothing is left to balance it as the cube shrinks.',
      },
      hints: ['The shear on the x-faces makes a couple that turns the cube one way; the shear on the y-faces turns it the other way.', 'Compare how torque and moment of inertia scale with the cube’s side s.'],
      teach: 'Torque balance on an infinitesimal element forces the stress tensor to be symmetric.',
      explain: t`The x-faces' shear gives a torque $\sigma_{xy}s^2\cdot s$, the y-faces' an opposite torque $\sigma_{yx}s^3$. Any difference produces an angular acceleration of order $(\sigma_{xy} - \sigma_{yx})s^3/(\rho s^5)$, which grows without bound as $s \to 0$. So $\sigma_{xy} = \sigma_{yx}$ — and a symmetric stress tensor has three perpendicular principal directions, where the shear vanishes.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.4, 2.4], y: [-1.35, 1.35], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [['-0.8 + 1.6*t', '-0.8'], ['0.8', '-0.8 + 1.6*t'], ['0.8 - 1.6*t', '0.8'], ['-0.8', '0.8 - 1.6*t']].map((param) => ({ param, t: [0, 1], color: 'ink2', width: 2 })),
          arrows: [
            { from: [1.0, -0.55], to: [1.0, 0.55], color: 'accent', label: 'σxy', labelDx: 6, labelDy: 0 },
            { from: [-1.0, 0.55], to: [-1.0, -0.55], color: 'accent', label: 'σxy', labelDx: -36, labelDy: 0 },
            { from: [-0.55, 1.0], to: [0.55, 1.0], color: 'warn', label: 'σyx', labelDx: 6, labelDy: -4 },
            { from: [0.55, -1.0], to: [-0.55, -1.0], color: 'warn', label: 'σyx', labelDx: -36, labelDy: 8 },
          ],
        },
        caption: 'A tiny square element of material and the shear forces on its four faces. Blue alone would turn it counterclockwise, orange alone clockwise. Arrows show directions only.',
      },
    }),
    num({
      id: 'dot-transpose', difficulty: 2,
      gen(r) {
        let A, x, y, val, wrong;
        for (let k = 0; k < 200; k++) {
          A = [[r.int(-2, 3), r.int(-2, 3)], [r.int(-2, 3), r.int(-2, 3)]]; x = [r.intExcept(-2, 2, [0]), r.int(-2, 2)]; y = [r.int(-2, 2), r.intExcept(-2, 2, [0])];
          val = dot(x, matvec(transpose(A), y)); wrong = dot(x, matvec(A, y));
          if (val !== wrong && val !== 0 && A[0][1] !== A[1][0]) break;
        }
        return {
          prompt: t`For $A = ${matTeX(A)}$, $\mathbf x = ${tupleTeX(x)}$ and $\mathbf y = ${tupleTeX(y)}$, compute $\mathbf x\cdot(A${T}\mathbf y)$.`,
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: wrong, feedback: t`That is $\mathbf x\cdot(A\mathbf y)$. Transpose $A$ first: $A${T} = ${matTeX(transpose(A))}$.` }],
          hints: [t`$A${T} = ${matTeX(transpose(A))}$, so $A${T}\mathbf y = ${tupleTeX(matvec(transpose(A), y))}$.`, t`Or use the identity: $\mathbf x\cdot(A${T}\mathbf y) = (A\mathbf x)\cdot\mathbf y$, with $A\mathbf x = ${tupleTeX(matvec(A, x))}$.`],
          teach: 'Moving a matrix across a dot product transposes it: (Ax)·y = x·(Aᵀy).',
          explain: t`$A${T}\mathbf y = ${tupleTeX(matvec(transpose(A), y))}$, so $\mathbf x\cdot(A${T}\mathbf y) = ${val}$. The other way: $A\mathbf x = ${tupleTeX(matvec(A, x))}$ and $(A\mathbf x)\cdot\mathbf y = ${dot(matvec(A, x), y)}$ — the same number.`,
          visual: map2d(A, { x, target: y, targetName: 'y', shape: 'none', ghost: false, view: Math.max(2.5, ...matvec(A, x).map(Math.abs), ...y.map(Math.abs)) * 0.85, caption: 'x and its image Ax (gold), and y (red ring). The identity says Ax·y can also be computed without moving x at all.' }),
        };
      },
    }),
    mcq({
      id: 'symmetric-product', difficulty: 3,
      prompt: t`$A$ and $B$ are both symmetric. When is the product $AB$ symmetric?`,
      choices: [t`Exactly when $AB = BA$`, 'Always: products of symmetric matrices are symmetric', 'Never', t`Only when $A = B$`],
      answer: 0,
      why: {
        1: t`$(AB)${T} = B${T}A${T} = BA$, which equals $AB$ only when the two commute. The picture shows a pair that does not.`,
        2: t`$A = B = I$ gives $AB = I$, which is symmetric.`,
        3: t`$A = B$ is enough, but not needed: any commuting pair works, such as $A$ and $2A + I$.`,
      },
      hints: [t`Transpose the product: $(AB)${T} = B${T}A${T}$.`, t`With $A${T} = A$ and $B${T} = B$, that is $BA$.`],
      teach: 'The transpose of AB is BA when A and B are symmetric, so AB is symmetric exactly when they commute.',
      explain: t`$(AB)${T} = B${T}A${T} = BA$, so $AB$ is symmetric iff $AB = BA$. For example, $A = ${matTeX([[2, 1], [1, 1]])}$ and $B = ${matTeX([[1, 0], [0, -1]])}$ give $AB = ${matTeX([[2, -1], [1, -1]])}$, not symmetric.`,
      visual: map2d([[2, -1], [1, -1]], { shape: 'circle', eigen: true, view: 2.6, colNames: ['', ''], columns: false, caption: 'The product AB of the two symmetric matrices in the explanation: its stretch directions (violet) are not perpendicular.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-AtA', difficulty: 2,
      gen(r) {
        const A = [0, 1, 2].map(() => [r.int(-3, 4), r.int(-3, 4)]), c1 = A.map((row) => row[0]), c2 = A.map((row) => row[1]);
        return {
          prompt: t`For $A = ${matTeX(A)}$, find the off-diagonal entry of the symmetric matrix $A${T}A$.`,
          answer: dot(c1, c2), tol: { rel: 0, abs: 0.01 },
          hints: [t`It is column 1 of $A$ dotted with column 2.`],
          teach: 'The entries of AᵀA are dot products of the columns of A.',
          explain: t`$${tupleTeX(c1)}\cdot${tupleTeX(c2)} = ${dot(c1, c2)}$, in both off-diagonal places.`,
          visual: stems([['column 1', c1, 'accent'], ['column 2', c2, 'warn']]),
        };
      },
    }),
    num({
      id: 'cp-inertia', difficulty: 3, transfer: true,
      gen(r) {
        const boom = r.pick([1.5, 2, 2.5]), mb = r.pick([0.5, 0.8, 1.2]), mp = r.pick([2, 3, 4]), zp = r.pick([0.25, 0.4, 0.5]), xp = r.pick([0.75, 1, 1.25]);
        // a magnetometer at the end of a boom along (boom, 0, boom/2); two panels at (±xp, 0.3, zp) and (±xp, -0.3, -zp)
        const pts = [[mb, [boom, 0, boom / 2]], [mp, [xp, 0.3, zp]], [mp, [-xp, -0.3, zp]]];
        const val = -pts.reduce((s, [m, p]) => s + m * p[0] * p[2], 0);
        return {
          prompt: t`A satellite's mass model has a ${mb} kg magnetometer at $(${boom}, 0, ${boom / 2})$ m on the end of a boom, and two ${mp} kg solar-panel masses at $(${xp}, 0.3, ${zp})$ m and $(-${xp}, -0.3, ${zp})$ m (the bus at the origin adds nothing to this entry). Find the product of inertia $I_{xz} = -\sum m\,x\,z$, in kg m².`,
          answer: val, units: 'kg m^2', tol: { rel: 0.005 },
          errors: [{ value: -val, feedback: 'Check the sign: the product of inertia carries a minus sign.' }],
          hints: [t`Only masses with both $x \ne 0$ and $z \ne 0$ contribute.`, t`The two panels have opposite $x$ and the same $z$: their contributions cancel.`],
          teach: 'Products of inertia fill the off-diagonal of the symmetric inertia tensor; symmetric pairs of masses cancel.',
          explain: t`The panels give $${mp}(${xp})(${zp}) + ${mp}(-${xp})(${zp}) = 0$; the boom gives $${mb}(${boom})(${boom / 2}) = ${nice(-val)}$. So $I_{xz} = I_{zx} = ${nice(val)}$ kg m². The boom alone tilts the satellite's principal axes away from its body axes — which matters for how it spins and how its attitude controller is tuned.`,
          visual: masses(pts, 'The magnetometer on its boom and the two panel masses (gold), joined to the centre of mass by dashed lines. Drag to rotate.'),
        };
      },
    }),
    mcq({
      id: 'cp-transpose-rule', difficulty: 2,
      prompt: t`For square matrices of the same size, $(ABC)${T}$ equals:`,
      choices: [t`$C${T}B${T}A${T}$`, t`$A${T}B${T}C${T}$`, t`$CBA$`, t`$ABC$`],
      answer: 0,
      why: {
        1: 'The transpose of a product reverses the order of the factors.',
        2: 'Reversing the order is not enough: each factor must also be transposed.',
        3: 'A product is unchanged by transposing only in special cases (when it is symmetric).',
      },
      hints: [t`Apply $(XY)${T} = Y${T}X${T}$ with $X = AB$ and $Y = C$.`],
      teach: 'Transposing a product reverses the order and transposes every factor.',
      explain: t`$(ABC)${T} = C${T}(AB)${T} = C${T}B${T}A${T}$ — the same reversal as for inverses, $(ABC)^{-1} = C^{-1}B^{-1}A^{-1}$.`,
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §2.7', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Taylor, Classical Mechanics, §10.4: The inertia tensor', url: 'https://uscibooks.aip.org/books/classical-mechanics/' },
  ],
});
