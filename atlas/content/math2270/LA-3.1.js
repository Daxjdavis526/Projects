// Matrix multiplication as composition of linear maps: AB means "B first,
// then A", and order matters.
import { lesson, mcq, num } from '../../src/core/content.js';
import { matvec, matmul, matTeX, colTeX, tupleTeX, stems, map2d } from './_la.js';

const t = String.raw;
const c90 = (k) => Math.round(Math.cos((k * Math.PI) / 2)), s90 = (k) => Math.round(Math.sin((k * Math.PI) / 2));
// 3D rotations by whole quarter turns (k quarter turns, right-hand rule), exact integers
const ROT = {
  x: (k) => [[1, 0, 0], [0, c90(k), -s90(k)], [0, s90(k), c90(k)]],
  y: (k) => [[c90(k), 0, s90(k)], [0, 1, 0], [-s90(k), 0, c90(k)]],
  z: (k) => [[c90(k), -s90(k), 0], [s90(k), c90(k), 0], [0, 0, 1]],
};
const AXIS = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const ANGLE = { 1: t`90^\circ`, 2: t`180^\circ`, 3: t`-90^\circ` };
const dirName = (v) => { const k = v.findIndex((x) => x !== 0); return `${v[k] > 0 ? '+' : '−'}${'xyz'[k]}`; };

const rotTH = [['cos(th*pi/180)', '-sin(th*pi/180)'], ['sin(th*pi/180)', 'cos(th*pi/180)']];

export default lesson({
  id: 'math2270.LA-3.1',
  title: 'Matrix multiplication as composition',
  minutes: 10, difficulty: 2,
  intro: t`A matrix is a map, $\mathbf x \mapsto A\mathbf x$. Doing $B$ first and then $A$ sends $\mathbf x$ to $A(B\mathbf x)$, and that composite map has a matrix of its own — the product $AB$:

$$(AB)\mathbf x = A(B\mathbf x), \qquad (AB)_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \dots + a_{in}b_{nj}$$

Column $j$ of $AB$ is $A$ applied to column $j$ of $B$. Composition is *why* matrices multiply this way, and it explains the most surprising rule of the subject: **order matters**. $AB$ means “$B$ first, then $A$”, and in general $AB \ne BA$ — rotate-then-reflect is not reflect-then-rotate, and an aircraft that yaws then pitches does not end up pointing where it would by pitching then yawing.`,
  symbols: [
    { tex: 'A, B', text: t`matrices: $A$ is $m\times n$ and $B$ is $n\times p$ — $B$ must have as many rows as $A$ has columns` },
    { tex: 'AB', text: t`the product, $m\times p$: the map “$B$ first, then $A$” (read right to left, like $f(g(x))$)` },
    { tex: t`(AB)_{ij}`, text: t`the entry in row $i$, column $j$: row $i$ of $A$ dotted with column $j$ of $B$` },
    { tex: t`\mathbf b_j`, text: t`column $j$ of $B$; column $j$ of $AB$ is $A\mathbf b_j$` },
    { tex: t`\mathbf x`, text: t`any input vector, with $p$ components` },
    { tex: 'n', text: t`the inner size: columns of $A$ = rows of $B$, the number of terms in each entry's sum` },
  ],
  why: 'Every chain of transformations — a spacecraft’s attitude rotations, changes between reference frames, the Lorentz boosts of special relativity — is a product of matrices, taken in the right order.',
  visual: {
    type: 'la-map2d',
    title: 'Rotate, then reflect — or the other way round?',
    lead: t`$R$ rotates the plane through $\theta$; $S$ reflects it in the $x$-axis. Apply them one after the other and watch the F. The readout names the composite matrix, written right to left: $SR$ means $R$ first.`,
    tasks: [
      'With the order “R, then S”, step from none to both and read the composite matrix SR.',
      'Switch the order: the F lands somewhere else and RS is a different matrix. Order matters.',
      'Set θ = 180°: now both orders agree — a half-turn is −I, which commutes with every matrix.',
    ],
    params: {
      maps: [{ name: 'R', label: 'R (rotate)', A: rotTH }, { name: 'S', label: 'S (reflect)', A: [[1, 0], [0, -1]] }],
      order: true, stages: true, shape: 'F', view: 1.7, colNames: ['first column', 'second column'],
      sliders: [{ key: 'th', label: t`Rotation angle $\theta$`, min: -180, max: 180, step: 15, value: 90, unit: t`^\circ`, explain: t`$R$ turns the plane counterclockwise through $\theta$.` }],
      readout: ['A', 'det'],
    },
    caption: 'Faint: where the F started. Dashed violet: after the first map. Solid: after the maps applied so far. The arrows are the columns of the composite matrix (where e₁ and e₂ end up).',
  },
  example: {
    prompt: t`Let $R = ${matTeX([[0, -1], [1, 0]])}$ (rotate $90^\circ$ counterclockwise) and $S = ${matTeX([[1, 0], [0, -1]])}$ (reflect in the $x$-axis). Find the matrices of “rotate, then reflect” and “reflect, then rotate”, and say what each map does.`,
    visual: map2d([[0, -1], [1, 0]], { maps: [{ name: 'R', A: [[0, -1], [1, 0]] }, { name: 'S', A: [[1, 0], [0, -1]] }], stages: false, view: 1.7, readout: ['A'], colNames: ['SRe₁', 'SRe₂'], caption: 'Rotate, then reflect: the F after R (dashed) and after S as well (solid). The readout is the product SR.' }),
    steps: [
      { label: 'Order', text: t`“Rotate, then reflect” sends $\mathbf x$ to $S(R\mathbf x)$, so its matrix is $SR$ — the first map stands on the right.` },
      { label: 'Multiply', text: t`$SR = ${matTeX([[1, 0], [0, -1]])}${matTeX([[0, -1], [1, 0]])} = ${matTeX([[0, -1], [-1, 0]])}$: row 1 of $S$ dotted with column 1 of $R$ is $1\cdot0 + 0\cdot1 = 0$, and so on.` },
      { label: 'Column check', text: t`Column 1 of $SR$ should be $S(R\mathbf e_1)$: $R\mathbf e_1 = (0, 1)$, then $S$ flips it to $(0, -1)$. ✓` },
      { label: 'The other order', text: t`$RS = ${matTeX([[0, -1], [1, 0]])}${matTeX([[1, 0], [0, -1]])} = ${matTeX([[0, 1], [1, 0]])}$.` },
      { label: 'Meaning', text: t`$SR$ sends $(x, y)$ to $(-y, -x)$: a reflection in the line $y = -x$. $RS$ sends $(x, y)$ to $(y, x)$: a reflection in $y = x$. Two different maps, so $SR \ne RS$.` },
    ],
    answer: t`$SR = ${matTeX([[0, -1], [-1, 0]])}$ (reflection in $y = -x$) and $RS = ${matTeX([[0, 1], [1, 0]])}$ (reflection in $y = x$).`,
  },
  practice: [
    num({
      id: 'entry', difficulty: 1,
      gen(r) {
        const A = [0, 1].map(() => [0, 1, 2].map(() => r.int(-3, 4))), B = [0, 1, 2].map(() => [0, 1].map(() => r.int(-3, 4)));
        const i = r.int(0, 1), j = r.int(0, 1), P = matmul(A, B), row = A[i], col = B.map((rw) => rw[j]);
        const wrong = P[j][i];
        return {
          prompt: t`For $A = ${matTeX(A)}$ and $B = ${matTeX(B)}$, find the entry $(AB)_{${i + 1}${j + 1}}$.`,
          answer: P[i][j], tol: { rel: 0, abs: 0.01 },
          errors: i !== j && wrong !== P[i][j] ? [{ value: wrong, feedback: t`That is $(AB)_{${j + 1}${i + 1}}$: the first index picks the row of $A$, the second the column of $B$.` }] : [],
          hints: [t`$(AB)_{${i + 1}${j + 1}}$ is row ${i + 1} of $A$ dotted with column ${j + 1} of $B$.`, t`$${tupleTeX(row)}\cdot${tupleTeX(col)}$.`],
          teach: 'Each entry of a product is a row of the left matrix dotted with a column of the right one.',
          explain: t`$${row.map((v, k) => `(${v})(${col[k]})`).join(' + ')} = ${P[i][j]}$. The whole product is $AB = ${matTeX(P)}$.`,
          visual: stems([[`row ${i + 1} of A`, row, 'accent'], [`column ${j + 1} of B`, col, 'warn']], { caption: 'The row of A and the column of B whose dot product is the entry, component by component.' }),
        };
      },
    }),
    mcq({
      id: 'dims', difficulty: 1,
      prompt: t`$A$ is $3\times2$ and $B$ is $2\times4$. What can you say about $AB$ and $BA$?`,
      choices: [t`$AB$ is $3\times4$; $BA$ is not defined`, t`$AB$ is $2\times2$; $BA$ is $3\times4$`, t`$AB$ is $3\times4$ and $BA$ is $4\times3$`, t`Neither exists, because $A$ and $B$ have different shapes`],
      answer: 0,
      why: {
        1: t`The size of a product comes from the *outer* dimensions: $(3\times\underline{2})(\underline{2}\times4)$ is $3\times4$.`,
        2: t`For $BA$ the inner dimensions are $4$ and $3$, which do not match: a row of $B$ has 4 entries, a column of $A$ has 3, and they cannot be dotted.`,
        3: t`Only the inner dimensions must match: $A$ has 2 columns and $B$ has 2 rows, so $AB$ exists.`,
      },
      hints: [t`$AB$ needs (columns of $A$) = (rows of $B$); the result is (rows of $A$) $\times$ (columns of $B$).`],
      teach: 'An m×n matrix times an n×p matrix is m×p; if the inner sizes differ, the product does not exist.',
      explain: t`$(3\times2)(2\times4)$: inner sizes agree, result $3\times4$. $(2\times4)(3\times2)$: inner sizes $4 \ne 3$, so $BA$ is undefined. As maps: $B$ takes $\mathbb R^4 \to \mathbb R^2$ and $A$ takes $\mathbb R^2 \to \mathbb R^3$, so “$B$ then $A$” works, but $A$'s outputs live in $\mathbb R^3$, where $B$ cannot act.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.8, 8.4], y: [-0.9, 3.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          points: [
            ...[0, 1, 2].flatMap((i) => [0, 1].map((j) => ({ x: j * 0.8, y: 2.2 - i * 0.8, color: 'accent', r: 6 }))),
            ...[0, 1].flatMap((i) => [0, 1, 2, 3].map((j) => ({ x: 3.2 + j * 0.8, y: 1.8 - i * 0.8, color: 'warn', r: 6 }))),
            { x: 0.4, y: -0.55, r: 0.01, color: 'accent', label: '3 rows × 2 columns', labelAlign: 'center', labelDx: 0, labelDy: 0 },
            { x: 4.4, y: -0.55, r: 0.01, color: 'warn', label: '2 rows × 4 columns', labelAlign: 'center', labelDx: 0, labelDy: 0 },
          ],
        },
        caption: 'The two matrices as grids of entries, in the order AB. A product dots each row on the left with each column on the right, so those must be the same length.',
      },
    }),
    num({
      id: 'composite-image', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const A = [[r.int(-2, 2), r.int(-2, 2)], [r.int(-2, 2), r.int(-2, 2)]], B = [[r.int(-2, 2), r.int(-2, 2)], [r.int(-2, 2), r.int(-2, 2)]];
          const x = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])], comp = r.int(0, 1);
          const good = matvec(A, matvec(B, x)), bad = matvec(B, matvec(A, x)), Bx = matvec(B, x);
          if (good[comp] === bad[comp] || Math.abs(A[0][0] * A[1][1] - A[0][1] * A[1][0]) < 1 || Math.abs(B[0][0] * B[1][1] - B[0][1] * B[1][0]) < 1 || Math.max(...Bx.map(Math.abs)) > 3) continue;
          return {
            prompt: t`The map $B = ${matTeX(B)}$ is applied first, then $A = ${matTeX(A)}$. Where does $\mathbf x = ${tupleTeX(x)}$ end up? Give the ${comp === 0 ? 'first' : 'second'} component of $AB\mathbf x$.`,
            answer: good[comp], tol: { rel: 0, abs: 0.01 },
            errors: [{ value: bad[comp], feedback: t`That is $BA\mathbf x$: you applied $A$ first. Here $B$ acts first.` }],
            hints: [t`First compute $B\mathbf x$; the picture shows the plane after $B$.`, t`$B\mathbf x = ${tupleTeX(Bx)}$; now apply $A$ to it.`],
            teach: 'To apply “B first, then A”, compute Bx and feed the result to A — that is (AB)x.',
            explain: t`$B\mathbf x = ${tupleTeX(Bx)}$ and $A(B\mathbf x) = ${tupleTeX(good)}$. Applying them the other way round gives $BA\mathbf x = ${tupleTeX(bad)}$.`,
            visual: map2d(B, { maps: [{ name: 'B', A: B }, { name: 'A', A }], stages: false, stage: 1, x, imageName: 'Bx', view: 3, shape: 'none', colNames: ['Be₁', 'Be₂'], caption: 'The plane after B alone: the grid, the columns of B, and x carried to Bx. Map A comes next.' }),
          };
        }
        return { prompt: t`Apply $B = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}$ then $A = \begin{bmatrix} 2 & 0 \\ 0 & 1 \end{bmatrix}$ to $(1, 2)$; first component?`, answer: 4, hints: ['Bx = (2, 1).'], teach: 'B first, then A.', explain: t`$A(2, 1) = (4, 1)$.` };
      },
    }),
    mcq({
      id: 'order-geometric', difficulty: 2,
      prompt: t`$P = ${matTeX([[0, 1], [1, 0]])}$ reflects the plane in the line $y = x$, and $D = ${matTeX([[2, 0], [0, 1]])}$ stretches it to twice its width. Which matrix means “first reflect, then stretch”?`,
      choices: [t`$${matTeX([[0, 2], [1, 0]])}$`, t`$${matTeX([[0, 1], [2, 0]])}$`, t`$${matTeX([[2, 1], [1, 1]])}$`, t`$${matTeX([[0, 2], [2, 0]])}$`],
      answer: 0,
      why: {
        1: t`That is $PD$: stretch first, then reflect. The map applied first stands on the right.`,
        2: t`That is $D + P$. Doing one map after another multiplies matrices; it does not add them.`,
        3: 'That stretches both directions. Only the width (the x-direction, after the reflection) doubles.',
      },
      hints: [t`“First $P$, then $D$” is $D(P\mathbf x)$, so the matrix is $DP$.`, t`Or follow $\mathbf e_1$: $P$ sends it to $(0, 1)$, which $D$ leaves alone — so column 1 is $(0, 1)$.`],
      teach: 'The matrix of “first P, then D” is the product DP, with the first map on the right.',
      explain: t`$DP = ${matTeX([[2, 0], [0, 1]])}${matTeX([[0, 1], [1, 0]])} = ${matTeX([[0, 2], [1, 0]])}$. Its columns are where $\mathbf e_1$ and $\mathbf e_2$ end up: $\mathbf e_1 \to (0, 1) \to (0, 1)$ and $\mathbf e_2 \to (1, 0) \to (2, 0)$.`,
      visual: map2d([[0, 1], [1, 0]], { maps: [{ name: 'P', A: [[0, 1], [1, 0]] }, { name: 'D', A: [[2, 0], [0, 1]] }], stages: false, stage: 1, view: 1.7, colNames: ['Pe₁', 'Pe₂'], caption: 'The F after the reflection P alone. The stretch D comes next.' }),
    }),
    mcq({
      id: 'noncommute-3d', difficulty: 3,
      prompt: t`A spacecraft's camera points along $+x$. It is turned $90^\circ$ about the $z$-axis, then $90^\circ$ about the $y$-axis (both fixed axes, right-hand rule: $R_y R_z$). Where does the camera point now?`,
      choices: [t`Along $+y$`, t`Along $-z$`, t`Along $+z$`, t`Along $+x$ again`],
      answer: 0,
      why: {
        1: t`That is where $R_z R_y$ would send it — the y-turn first: $+x \to -z$, which the z-turn leaves alone.`,
        2: t`After the z-turn the camera points along $+y$, and a turn about the $y$-axis leaves $+y$ where it is. (Even a y-turn acting on $+x$ would give $-z$, not $+z$.)`,
        3: 'Two quarter turns about different axes do not cancel each other.',
      },
      hints: [t`Apply the first turn to the camera direction: $R_z$ turns $+x$ to $+y$.`, t`Now apply $R_y$ to $+y$. What does a rotation do to a vector along its own axis?`],
      teach: 'Rotations about different axes do not commute: apply them in the stated order, one at a time.',
      explain: t`$R_z(90^\circ)$ turns $+x$ into $+y$, and $R_y(90^\circ)$ leaves $+y$ fixed, so the camera ends along $+y$. In the other order, $R_y$ first turns $+x$ to $-z$ and $R_z$ leaves $-z$ alone: the camera ends pointing along $-z$. Same two turns, different result — which is why aircraft and spacecraft attitudes are always given with an agreed rotation order (such as yaw, then pitch, then roll).`,
      visual: { type: 'calc-vectors3d', params: { range: 2, vectors: [{ to: [1.6, 0, 0], color: 'gold', label: t`\text{camera}` }], segments: [{ from: [0, 0, -1.8], to: [0, 0, 1.8], color: 'violet', dash: true }, { from: [0, -1.8, 0], to: [0, 1.8, 0], color: 'teal', dash: true }] }, caption: 'The camera direction before the turns (gold); the two rotation axes, z (violet) and y (teal). Drag to rotate.' },
    }),
    mcq({
      id: 'binomial', difficulty: 3,
      prompt: t`For square matrices $A$ and $B$ of the same size, which identity is **always** true?`,
      choices: [t`$(A + B)^2 = A^2 + AB + BA + B^2$`, t`$(A + B)^2 = A^2 + 2AB + B^2$`, t`$(A + B)^2 = A^2 + B^2$`, t`$(A + B)(A - B) = A^2 - B^2$`],
      answer: 0,
      why: {
        1: t`That needs $AB = BA$, which fails for most pairs (rotate and reflect, for one).`,
        2: 'The cross terms do not cancel: (A + B)² = (A + B)(A + B) has four terms.',
        3: t`Expanding gives $A^2 - AB + BA - B^2$; the middle terms cancel only if $AB = BA$.`,
      },
      hints: [t`Expand $(A + B)(A + B)$ term by term, keeping every product in its order.`, t`$AB$ and $BA$ are different matrices in general, so they cannot be combined into $2AB$.`],
      teach: 'Algebra with matrices keeps the order of every product, because AB and BA usually differ.',
      explain: t`$(A + B)(A + B) = AA + AB + BA + BB$. With $R$ and $S$ from the worked example, $RS + SR = ${matTeX([[0, 0], [0, 0]])}$ while $2RS$ is not zero — the familiar formula really does fail.`,
      visual: map2d([[0, -1], [1, 0]], { maps: [{ name: 'R', A: [[0, -1], [1, 0]] }, { name: 'S', A: [[1, 0], [0, -1]] }], order: true, view: 1.7, colNames: ['', ''], columns: false, caption: 'R (quarter turn) and S (reflection) composed in either order — the two results differ, so RS ≠ SR. Switch the order to compare.' }),
    }),
    num({
      id: 'rotation-power', difficulty: 2,
      gen(r) {
        const th = r.pick([30, 40, 45, 60, 72, 120]), n = 360 / th;
        const c = Math.cos((th * Math.PI) / 180), s = Math.sin((th * Math.PI) / 180);
        return {
          prompt: t`$R$ rotates the plane through $${th}^\circ$. What is the smallest number of times $k$ you must apply it for $R^k = I$ (everything back where it started)?`,
          answer: n, tol: { rel: 0, abs: 0.01 },
          hints: [t`Composing two rotations adds their angles: $R(\alpha)R(\beta) = R(\alpha + \beta)$.`, t`$R^k$ rotates through $${th}k$ degrees. When is that a whole turn?`],
          teach: 'Composing rotations of the plane adds their angles, so powers of a rotation are rotations through multiples of its angle.',
          explain: t`$R^k = R(${th}k^\circ)$, which is $I$ first when $${th}k = 360$, so $k = ${n}$. Rotations of the plane commute with each other, unlike rotations in space.`,
          visual: map2d([[c, -s], [s, c]], { view: 1.7, caption: `One application of R: the F turned through ${th}°.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-product', difficulty: 2,
      gen(r) {
        const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 3))), B = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 3)));
        const i = r.int(0, 2), j = r.int(0, 2), P = matmul(A, B), row = A[i], col = B.map((rw) => rw[j]);
        return {
          prompt: t`For $A = ${matTeX(A)}$ and $B = ${matTeX(B)}$, find $(AB)_{${i + 1}${j + 1}}$.`,
          answer: P[i][j], tol: { rel: 0, abs: 0.01 },
          hints: [t`Row ${i + 1} of $A$ dotted with column ${j + 1} of $B$.`],
          teach: 'Each entry of AB is a row of A dotted with a column of B.',
          explain: t`$${row.map((v, k) => `(${v})(${col[k]})`).join(' + ')} = ${P[i][j]}$.`,
          visual: stems([[`row ${i + 1} of A`, row, 'accent'], [`column ${j + 1} of B`, col, 'warn']]),
        };
      },
    }),
    mcq({
      id: 'cp-order', difficulty: 2,
      prompt: t`A vector $\mathbf x$ is first sheared by $H$, then rotated by $R$, then scaled by $D$. Which product sends $\mathbf x$ to its final position?`,
      choices: [t`$DRH\,\mathbf x$`, t`$HRD\,\mathbf x$`, t`$RHD\,\mathbf x$`, t`$(D + R + H)\,\mathbf x$`],
      answer: 0,
      why: {
        1: t`That applies $D$ first. In a product the matrix next to $\mathbf x$ acts first.`,
        2: t`That applies $D$ first and $R$ last.`,
        3: 'Doing maps one after another multiplies their matrices; adding them is a different (and here meaningless) operation.',
      },
      hints: [t`Write it as nested functions: $D(R(H\mathbf x))$.`],
      teach: 'In a product of maps the rightmost one acts first, so a sequence is written in reverse order.',
      explain: t`$D(R(H\mathbf x)) = (DRH)\mathbf x$: the first map, $H$, sits next to $\mathbf x$.`,
      visual: map2d([[1, 0.5], [0, 1]], { maps: [{ name: 'H', A: [[1, 0.5], [0, 1]] }, { name: 'R', A: [[0, -1], [1, 0]] }, { name: 'D', A: [[1.5, 0], [0, 0.5]] }], view: 1.8, colNames: ['', ''], columns: false, caption: 'A shear H, a quarter turn R and a scaling D, applied in that order: step through the stages.' }),
    }),
    num({
      id: 'cp-attitude', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const [a1, a2] = r.shuffle(['x', 'y', 'z']).slice(0, 2), q1 = r.pick([1, 3]), q2 = r.pick([1, 2, 3]);
          const v = r.pick([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
          const good = matvec(ROT[a2](q2), matvec(ROT[a1](q1), v)), bad = matvec(ROT[a1](q1), matvec(ROT[a2](q2), v));
          const comp = good.findIndex((x, i) => x !== bad[i] && x !== 0);
          if (comp < 0) continue;
          return {
            prompt: t`A star tracker on a satellite looks along $${dirName(v)}$. The satellite turns $${ANGLE[q1]}$ about the fixed $${a1}$-axis, then $${ANGLE[q2]}$ about the fixed $${a2}$-axis (right-hand rule). The tracker's final direction is a unit vector along one axis: what is its ${'xyz'[comp]}-component?`,
            answer: good[comp], tol: { rel: 0, abs: 0.01 },
            errors: [{ value: bad[comp], feedback: t`That comes from doing the turns in the opposite order. The first turn is about $${a1}$.` }].filter((e) => e.value !== good[comp]),
            hints: [t`Apply the turns one at a time: first $R_${a1}(${ANGLE[q1]})$, then $R_${a2}(${ANGLE[q2]})$.`, t`A rotation leaves vectors along its own axis unchanged; a quarter turn about $z$ sends $+x \to +y \to -x$ (right-hand rule), and likewise round the other axes: about $x$, $+y \to +z$; about $y$, $+z \to +x$.`],
            teach: 'Apply successive rotations in order: the composite is the product with the first rotation on the right.',
            explain: t`$R_${a1}$ turns $${tupleTeX(v)}$ into $${tupleTeX(matvec(ROT[a1](q1), v))}$, and $R_${a2}$ then gives $${tupleTeX(good)}$, along $${dirName(good)}$. In the opposite order the tracker would end along $${dirName(bad)}$. Flight software composes such turns as matrix (or quaternion) products, always in an agreed order; an aircraft's yaw–pitch–roll about its own body axes equals the same three turns about fixed axes taken in reverse order.`,
            visual: { type: 'calc-vectors3d', params: { range: 2, vectors: [{ to: v.map((x) => 1.6 * x), color: 'gold', label: t`\text{tracker}` }], segments: [{ from: AXIS[a1].map((x) => -1.8 * x), to: AXIS[a1].map((x) => 1.8 * x), color: 'violet', dash: true }, { from: AXIS[a2].map((x) => -1.8 * x), to: AXIS[a2].map((x) => 1.8 * x), color: 'teal', dash: true }] }, caption: `The tracker’s starting direction (gold) and the two rotation axes: first ${a1} (violet), then ${a2} (teal). Drag to rotate.` },
          };
        }
        return { prompt: t`Turn $+x$ by $90^\circ$ about $z$, then $90^\circ$ about $x$. What is the final z-component?`, answer: 1, hints: ['+x → +y → +z.', 'Apply the turns in order.'], teach: 'Apply rotations in order.', explain: t`$+x \to +y \to +z$.` };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §2.3–2.4', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 3: Multiplication and inverse matrices', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
