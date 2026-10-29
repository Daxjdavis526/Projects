// Basis and dimension: independent + spanning, unique coordinates, every
// basis the same size; bases of C(A) and N(A) and their dimensions; counting
// the independent components of a strain state.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tupleTeX, matTeX, stems, rr, planes3 } from './_la.js';
import { arrows2 } from './_spaces.js';

const t = String.raw;
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const xn = (k) => `x${String(k).replace(/\d/g, (d) => SUBS[d])}`;
const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);

function rrefWith(r, rows, n, pivots) {
  return Array.from({ length: rows }, (_, i) => Array.from({ length: n }, (_, j) => {
    if (i >= pivots.length) return 0;
    const pc = pivots[i];
    if (j === pc) return 1;
    if (j < pc || pivots.includes(j)) return 0;
    return r.intExcept(-3, 3, [0]);
  }));
}

const BASIS_CHOICES = [
  'Yes: they are independent and span ℝ³',
  'No: two vectors cannot span ℝ³',
  'No: four vectors in ℝ³ are always dependent',
  'No: they lie in one plane, so they are dependent and do not span ℝ³',
];
const BASIS_WHY = {
  0: { 1: 'There are three vectors here, not two.', 2: 'There are three vectors here, not four.', 3: 'They do not lie in one plane: the box they span has nonzero volume.' },
  1: { 0: 'Two vectors span at most a plane; a basis of ℝ³ needs three.', 2: 'There are only two vectors. The trouble is too few, not too many.', 3: 'Two vectors always lie in a plane — the real problem is that two cannot reach all of ℝ³.' },
  2: { 0: 'Four vectors in ℝ³ are always dependent: one is a combination of the others.', 1: 'There are four vectors here. They do span ℝ³, but one of them is redundant.', 3: 'They do not lie in one plane — but four in ℝ³ are dependent all the same.' },
  3: { 0: 'They look independent, but all three lie in one plane: one is a combination of the other two.', 1: 'There are three vectors here — the trouble is that they are coplanar.', 2: 'There are three vectors here, not four.' },
};
const SETS = [
  [[[2, 0, 0], [1, 2, 0], [0, 1, 2]], [[1, 1, 0], [0, 1, 1], [1, 0, 1]], [[2, 1, 0], [0, 2, 1], [1, 0, 2]]],
  [[[2, 1, 0], [0, 1, 2]], [[1, 2, 1], [2, 0, -1]], [[2, 0, 1], [0, 2, 1]]],
  [[[2, 0, 0], [0, 2, 0], [0, 0, 2], [1, 1, 1]], [[1, 1, 0], [0, 1, 1], [1, 0, 1], [2, -1, 1]]],
  [[[2, 0, 0], [0, 2, 0], [1, 1, 0]], [[1, 0, 1], [0, 1, 1], [1, 1, 2]], [[2, 1, 0], [0, 1, 2], [2, 2, 2]]],
];

export default lesson({
  id: 'math2270.LA-5.3',
  title: 'Basis and dimension',
  minutes: 11, difficulty: 2,
  intro: t`A **basis** of a subspace $V$ is a set of vectors that is independent *and* spans $V$: nothing redundant, nothing missing. Then every vector of $V$ is a combination of the basis vectors in **exactly one** way:

$$\mathbf v = c_1\mathbf b_1 + c_2\mathbf b_2 + \dots + c_d\mathbf b_d, \qquad d = \dim V$$

A subspace has many bases, but every one of them has the same number of vectors — the **dimension** of $V$. A line through $\mathbf 0$ has dimension 1, a plane 2, $\mathbb R^n$ itself $n$. For a matrix of rank $r$ (the number of pivots), the pivot columns of $A$ are a basis of $C(A)$ and the special solutions a basis of $N(A)$, so $\dim C(A) = r$ and $\dim N(A) = n - r$.`,
  symbols: [
    { tex: 'V', text: t`a subspace — of $\mathbb R^n$ here; LA-6 widens “vector” to polynomials and functions` },
    { tex: t`\mathbf b_1, \dots, \mathbf b_d`, text: t`a basis of $V$: independent, and every vector of $V$ is a combination of them` },
    { tex: t`c_1, \dots, c_d`, text: t`the **coordinates** of $\mathbf v$ in this basis — unique, because the basis is independent` },
    { tex: t`d = \dim V`, text: 'the dimension: the number of vectors in any basis of V — its number of independent directions' },
    { tex: 'r', text: t`the rank of a matrix: its number of pivots, $\dim C(A)$` },
  ],
  why: 'Dimension is the honest count of independent quantities — the six numbers of a 3D strain state, the ten components of the spacetime metric, the two polarizations of a light wave — and a basis is the coordinate system you measure them in.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Too few, just right, too many',
    lead: t`The plane $x + y + z = 0$ is a subspace of $\mathbb R^3$. Try to reach the point $\mathbf w = (3, -1, -2)$ in it using one, two or three of the vectors $\mathbf b_1 = (1, -1, 0)$, $\mathbf b_2 = (1, 0, -1)$ and $\mathbf b_3 = (0, 1, -1)$.`,
    tasks: [
      'With b₁ only, the gold arrow slides along a line and its distance from w never reaches 0: one vector cannot span a plane.',
      'With b₁ and b₂, the weights (1, 2) land exactly on w — and no other pair does. Those are w’s coordinates in this basis.',
      'Add b₃: it already lies in the plane (b₃ = b₂ − b₁), so it is redundant. Now w can be reached in many ways — try (2, 1, 1). The plane’s dimension stays 2.',
    ],
    params: {
      range: 3,
      choices: [{ key: 'set', label: 'Vectors in use', options: [[1, 'b₁ only'], [2, 'b₁ and b₂'], [3, 'b₁, b₂ and b₃']], value: 2 }],
      sliders: [
        { key: 'c1', label: t`Weight $c_1$ on $\mathbf b_1$`, min: -3, max: 3, step: 0.5, value: 2, explain: t`How much of $\mathbf b_1$.` },
        { key: 'c2', label: t`Weight $c_2$ on $\mathbf b_2$`, min: -3, max: 3, step: 0.5, value: 1, explain: t`How much of $\mathbf b_2$ (ignored when only $\mathbf b_1$ is in use).` },
        { key: 'c3', label: t`Weight $c_3$ on $\mathbf b_3$`, min: -3, max: 3, step: 0.5, value: 0, explain: t`How much of $\mathbf b_3$ (used only when all three are in use).` },
      ],
      constants: {},
      planes: [{ normal: [1, 1, 1], d: 0, size: 3.8, color: 'violet', alpha: 0.16 }],
      vectors: [
        { to: [1, -1, 0], color: 'accent', label: t`\mathbf b_1` },
        { to: [1, 0, -1], color: 'warn', label: t`\mathbf b_2`, when: 'step(set - 1.5)' },
        { to: [0, 1, -1], color: 'good', label: t`\mathbf b_3`, when: 'step(set - 2.5)' },
        { to: ['c1 + c2*step(set - 1.5)', '-c1 + c3*step(set - 2.5)', '-c2*step(set - 1.5) - c3*step(set - 2.5)'], color: 'gold', label: t`\textstyle\sum c_i\mathbf b_i` },
      ],
      points: [{ at: [3, -1, -2], color: 'bad', label: t`\mathbf w` }],
      readouts: [
        { label: 'the combination', vec: ['c1 + c2*step(set - 1.5)', '-c1 + c3*step(set - 2.5)', '-c2*step(set - 1.5) - c3*step(set - 2.5)'] },
        { label: t`distance to $\mathbf w$`, expr: 'sqrt((c1 + c2*step(set - 1.5) - 3)^2 + (-c1 + c3*step(set - 2.5) + 1)^2 + (-c2*step(set - 1.5) - c3*step(set - 2.5) + 2)^2)', digits: 3 },
      ],
    },
    caption: 'The violet square is a patch of the plane x + y + z = 0 (it goes on for ever). Gold: the combination of the vectors in use; red: the target w. Drag the picture to rotate.',
  },
  example: {
    prompt: t`Find a basis and the dimension of $$W = \{\mathbf x \text{ in } \mathbb R^4 : x_1 + 2x_2 - x_3 + x_4 = 0 \text{ and } x_2 + x_4 = 0\},$$ then the coordinates of $\mathbf w = (3, -2, 1, 2)$ in that basis.`,
    visual: stems([['s₁', [1, 0, 1, 0], 'accent'], ['s₂', [1, -1, 0, 1], 'warn'], ['w', [3, -2, 1, 2], 'gold']], { caption: 'The two basis vectors and w as stem plots. Components 3 and 4 of w read off its coordinates directly.' }),
    steps: [
      { label: 'Recognise W', text: t`$W$ is the null space of $B = ${matTeX([[1, 2, -1, 1], [0, 1, 0, 1]])}$, so it is a subspace, and its special solutions will be a basis.` },
      { label: 'Reduce', text: t`$R_1 - 2R_2$ gives $R = ${matTeX([[1, 0, -1, -1], [0, 1, 0, 1]])}$: pivots in columns 1 and 2; $x_3$ and $x_4$ are free.` },
      { label: 'Basis', text: t`$x_3 = 1, x_4 = 0$: $\mathbf s_1 = (1, 0, 1, 0)$. $x_3 = 0, x_4 = 1$: $\mathbf s_2 = (1, -1, 0, 1)$. They are independent — each has a 1 in a slot where the other has a 0 — and every solution is $x_3\mathbf s_1 + x_4\mathbf s_2$, so they span $W$.` },
      { label: 'Dimension', text: t`Two basis vectors: $\dim W = 2$, which is $4$ unknowns $-$ $2$ pivots. Two independent equations in $\mathbb R^4$ cut out a plane.` },
      { label: 'Coordinates', text: t`$\mathbf w$ is in $W$ ($3 - 4 - 1 + 2 = 0$ and $-2 + 2 = 0$). In the special-solution basis the coordinates are just the free variables: $c_1 = x_3 = 1$ and $c_2 = x_4 = 2$. Check: $\mathbf s_1 + 2\mathbf s_2 = (3, -2, 1, 2)$ ✓.` },
    ],
    answer: t`Basis $\{(1, 0, 1, 0),\ (1, -1, 0, 1)\}$, $\dim W = 2$, and $\mathbf w = 1\,\mathbf s_1 + 2\,\mathbf s_2$: coordinates $(1, 2)$.`,
  },
  practice: [
    mcq({
      id: 'is-basis', difficulty: 1,
      gen(r) {
        const kind = r.int(0, 3), vs = r.pick(SETS[kind]), colors = ['accent', 'warn', 'good', 'violet'];
        return {
          prompt: t`Do the vectors in the picture, ${vs.map((v) => `$${tupleTeX(v)}$`).join(', ')}, form a basis of $\mathbb R^3$?`,
          choices: BASIS_CHOICES, answer: kind, why: BASIS_WHY[kind],
          hints: ['A basis of ℝ³ has exactly three vectors, and they must not lie in one plane.', 'Count the vectors; if there are three, check whether one is a combination of the other two.'],
          teach: 'A basis of ℝ³ is exactly three independent vectors: fewer cannot span, more must be dependent, and three in one plane fail both tests.',
          explain: kind === 3 ? `The third is a combination of the first two — here $${tupleTeX(vs[2])} = ${vs[0].every((x, i) => x / 2 + vs[1][i] / 2 === vs[2][i]) ? t`\tfrac12${tupleTeX(vs[0])} + \tfrac12${tupleTeX(vs[1])}` : t`${tupleTeX(vs[0])} + ${tupleTeX(vs[1])}`}$ — so the three lie in a plane: dependent, and they span only that plane.` : [
            'Three vectors that do not lie in one plane: independent, and three independent vectors in ℝ³ span it. A basis.',
            'Two vectors span at most a plane, so they miss most of ℝ³. Not a basis — one more vector, out of their plane, would make one.',
            'Four vectors in ℝ³ are always dependent, so one is redundant. Drop it and the other three form a basis.',
          ][kind],
          visual: { type: 'calc-vectors3d', params: { range: 2.4, vectors: vs.map((v, k) => ({ to: v, color: colors[k], label: t`\mathbf v_${k + 1}` })) }, caption: 'The vectors from the origin. Drag to rotate and judge whether they lie in one plane.' },
        };
      },
    }),
    mcq({
      id: 'dim-plane', difficulty: 1,
      prompt: t`What is the dimension of the subspace $W = \{(x, y, z) : x + 2y - z = 0\}$ of $\mathbb R^3$?`,
      choices: ['2', '3', '1', '0'],
      fixedOrder: true,
      answer: 0,
      why: {
        1: 'Its vectors have three components, but they are not free: the equation ties z to x and y. Dimension counts independent directions inside W, and a plane has two.',
        2: 'One equation removes one dimension from three: 3 − 1 = 2, not 1.',
        3: t`$W$ is a whole plane of vectors, not just $\{\mathbf 0\}$.`,
      },
      hints: [t`Solve for $z$: how many of $x, y, z$ can you choose freely?`, t`$z = x + 2y$, with $x$ and $y$ free: a basis is $(1, 0, 1)$, $(0, 1, 2)$.`],
      teach: 'Dimension counts free directions, not components: one independent equation in ℝ³ leaves a 2-dimensional plane.',
      explain: t`Two free variables, $x$ and $y$, so $W = \{x(1, 0, 1) + y(0, 1, 2)\}$ — a plane with basis $(1, 0, 1)$, $(0, 1, 2)$ and dimension 2. A plane in $\mathbb R^3$ is 2-dimensional even though its vectors have three components.`,
      visual: planes3([[1, 2, -1, 0]], { range: 3, size: 2.4, caption: 'The plane x + 2y − z = 0, a patch of it (it goes on for ever). Drag to rotate.' }),
    }),
    num({
      id: 'dims-rref', difficulty: 2,
      gen(r) {
        const [rows, n, pivots] = r.pick([[3, 5, [0, 2]], [3, 5, [0, 1, 3]], [4, 6, [0, 1, 4]], [3, 6, [0, 2, 3]], [4, 5, [0, 1, 2, 4]], [3, 4, [1, 3]]]);
        const R = rrefWith(r, rows, n, pivots), ask = r.pick(['col', 'null']);
        const ans = ask === 'col' ? pivots.length : n - pivots.length;
        return {
          prompt: t`An $${rows}\times${n}$ matrix $A$ reduces to the RREF below. What is the dimension of its ${ask === 'col' ? t`column space $C(A)$` : t`null space $N(A)$`}?
$$${matTeX(R)}$$`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [ask === 'col' ? { value: n - pivots.length, feedback: 'That counts the free columns — the dimension of the null space. The column space has one basis vector per pivot.' } : { value: pivots.length, feedback: 'That counts the pivots — the dimension of the column space. The null space has one basis vector per free column.' }].filter((e) => e.value !== ans),
          hints: ['Count the pivots: that is the rank r.', ask === 'col' ? t`$\dim C(A) = r$: one basis vector per pivot column.` : t`$\dim N(A) = n - r$: one special solution per free column.`],
          teach: 'For an m×n matrix of rank r: dim C(A) = r (pivot columns) and dim N(A) = n − r (free columns).',
          explain: t`${pivots.length} pivots, so $r = ${pivots.length}$. Then $\dim C(A) = ${pivots.length}$ and $\dim N(A) = ${n} - ${pivots.length} = ${n - pivots.length}$. A basis of $C(A)$: columns ${pivots.map((c) => c + 1).join(', ')} of $A$ itself.`,
          visual: rr(R, { aug: false, picture: 'none', colLabels: Array.from({ length: n }, (_, k) => xn(k + 1)), caption: 'The RREF with each column’s unknown above it.' }),
        };
      },
    }),
    num({
      id: 'coords', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const b1 = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], b2 = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)];
          const a = r.intExcept(-2, 3, [0]), b = r.intExcept(-2, 2, [0]), ask = r.int(0, 1);
          if (b1[0] * b2[1] - b1[1] * b2[0] === 0 || b1.every((x) => x === 0) || b2.every((x) => x === 0)) continue;
          const w = b1.map((x, i) => a * x + b * b2[i]);
          if (Math.max(...w.map(Math.abs)) > 7 || a === b) continue;
          return {
            prompt: t`$\mathbf b_1 = ${tupleTeX(b1)}$ and $\mathbf b_2 = ${tupleTeX(b2)}$ are a basis of a plane $W$ in $\mathbb R^3$, and $\mathbf w = ${tupleTeX(w)}$ lies in $W$. What is its ${ask ? 'second' : 'first'} coordinate in this basis — $c_${ask + 1}$ in $\mathbf w = c_1\mathbf b_1 + c_2\mathbf b_2$?`,
            answer: ask ? b : a, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: ask ? a : b, feedback: `That is the other coordinate: c${ask ? '₁' : '₂'}.` }],
            hints: [t`Write $c_1\mathbf b_1 + c_2\mathbf b_2 = \mathbf w$ component by component: three equations, two unknowns.`, t`The first two components give $${b1[0]}c_1 + (${b2[0]})c_2 = ${w[0]}$ and $${b1[1]}c_1 + (${b2[1]})c_2 = ${w[1]}$; the third then checks.`],
            teach: 'Coordinates in a basis are the unique weights that build the vector from the basis vectors.',
            explain: t`$c_1 = ${a}$ and $c_2 = ${b}$: $${a}${tupleTeX(b1)} + (${b})${tupleTeX(b2)} = ${tupleTeX(w)}$ ✓ in all three components. Because $\mathbf b_1, \mathbf b_2$ are independent, no other pair of weights works.`,
            visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: b1, color: 'accent', label: t`\mathbf b_1` }, { to: b2, color: 'warn', label: t`\mathbf b_2` }, { to: w, color: 'gold', label: t`\mathbf w` }], parallelograms: [{ at: b1.map((x, i) => -1.5 * x - 1.5 * b2[i]), u: b1.map((x) => 3 * x), v: b2.map((x) => 3 * x), color: 'violet', alpha: 0.14 }] }, caption: 'The basis vectors, w, and a patch of the plane W. Drag to rotate.' },
          };
        }
        return { prompt: t`Basis $(1, 0, 1)$, $(0, 1, 1)$; $\mathbf w = (2, 3, 5)$. First coordinate?`, answer: 2, hints: ['Read components 1 and 2.'], teach: 'Coordinates are unique weights.', explain: t`$c_1 = 2$.` };
      },
    }),
    mcq({
      id: 'extend', difficulty: 3,
      prompt: t`The vectors $(1, 1, 0)$ and $(0, 1, 1)$ are independent and span a plane in $\mathbb R^3$. Which third vector extends them to a basis of $\mathbb R^3$?`,
      choices: [t`$(1, 0, 0)$`, t`$(1, 2, 1)$`, t`$(2, 2, 0)$`, t`$(1, 0, -1)$`],
      answer: 0,
      why: {
        1: t`$(1, 2, 1) = (1, 1, 0) + (0, 1, 1)$ lies in their plane: adding it makes the set dependent.`,
        2: t`$(2, 2, 0)$ is twice $(1, 1, 0)$ — redundant.`,
        3: t`$(1, 0, -1) = (1, 1, 0) - (0, 1, 1)$ lies in their plane too. Looking different is not the same as being independent.`,
      },
      hints: ['A third vector extends them to a basis exactly when it is not in their plane.', t`The plane of $(1, 1, 0)$ and $(0, 1, 1)$ is $x - y + z = 0$ (its normal is their cross product). Which choice fails that equation?`],
      teach: 'An independent set extends to a basis by adding vectors outside its span, one at a time, until it spans.',
      explain: t`The plane is $x - y + z = 0$, with normal $(1, 1, 0)\times(0, 1, 1) = (1, -1, 1)$. Only $(1, 0, 0)$ is off it ($1 - 0 + 0 \ne 0$), so the three are independent, and three independent vectors in $\mathbb R^3$ are a basis. The other three choices all satisfy $x - y + z = 0$.`,
      visual: { type: 'calc-vectors3d', params: { range: 2.4, vectors: [{ to: [1, 1, 0], color: 'accent', label: t`(1, 1, 0)` }, { to: [0, 1, 1], color: 'warn', label: t`(0, 1, 1)` }], parallelograms: [{ at: [-1.5, -3, -1.5], u: [3, 3, 0], v: [0, 3, 3], color: 'violet', alpha: 0.15 }] }, caption: 'The two vectors and a patch of the plane they span. Drag to rotate.' },
    }),
    num({
      id: 'free-coords', difficulty: 2,
      gen(r) {
        const pivots = r.pick([[0, 1], [0, 2], [1, 2]]), n = 4;
        const R = rrefWith(r, 2, n, pivots), free = [0, 1, 2, 3].filter((j) => !pivots.includes(j));
        const t1 = r.intExcept(-3, 3, [0]), t2 = r.intExcept(-3, 3, [0, t1]), ask = r.int(0, 1);
        const special = (f) => Array.from({ length: n }, (_, j) => (j === f ? 1 : pivots.includes(j) ? -R[pivots.indexOf(j)][f] : 0));
        const s1 = special(free[0]), s2 = special(free[1]);
        const w = s1.map((x, i) => t1 * x + t2 * s2[i]);
        return {
          prompt: t`The null space of a matrix with RREF $${matTeX(R)}$ has the special solutions $\mathbf s_1 = ${tupleTeX(s1)}$ and $\mathbf s_2 = ${tupleTeX(s2)}$ as a basis. The vector $\mathbf w = ${tupleTeX(w)}$ is in the null space. What is its coordinate $c_${ask + 1}$ in $\mathbf w = c_1\mathbf s_1 + c_2\mathbf s_2$?`,
          answer: ask ? t2 : t1, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ask ? t1 : t2, feedback: `That is the other coordinate, c${ask ? '₁' : '₂'}.` }],
          hints: [t`$\mathbf s_1$ has a 1 in slot ${free[0] + 1} and $\mathbf s_2$ a 0 there; in slot ${free[1] + 1} it is the other way round.`, t`So the coordinates are just components ${free[0] + 1} and ${free[1] + 1} of $\mathbf w$ — the values of the free variables.`],
          teach: 'In the special-solution basis of a null space, the coordinates of a vector are simply the values of its free variables.',
          explain: t`Slots ${free[0] + 1} and ${free[1] + 1} are the free variables, and there $\mathbf s_1, \mathbf s_2$ look like $(1, 0)$ and $(0, 1)$. So $c_1 = w_${free[0] + 1} = ${t1}$ and $c_2 = w_${free[1] + 1} = ${t2}$; check: $${t1}\mathbf s_1 + (${t2})\mathbf s_2 = ${tupleTeX(w)}$ ✓.`,
          visual: stems([['s₁', s1, 'accent'], ['s₂', s2, 'warn'], ['w', w, 'gold']], { caption: 'The two basis vectors and w, component by component.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dims', difficulty: 2,
      gen(r) {
        const [m, n, rk] = r.pick([[4, 6, 3], [5, 7, 3], [3, 8, 2], [6, 9, 4], [4, 7, 2], [5, 6, 4]]);
        const pivots = r.pick([[0, 1, 2, 3], [0, 2, 3, 5], [0, 1, 3, 4], [1, 2, 4, 5]].filter((p) => p.every((c) => c < n))).slice(0, rk);
        const R = rrefWith(r, m, n, pivots);
        return {
          prompt: t`An $${m}\times${n}$ matrix $A$ has the RREF below. What is $\dim N(A)$, the dimension of its null space?
$$${matTeX(R)}$$`,
          answer: n - rk, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: rk, feedback: 'That is the rank, the dimension of the column space. The null space has one dimension per free column.' }, ...(m - rk !== n - rk ? [{ value: m - rk, feedback: t`That is $m - r$: rows minus pivots. The null space lives among the $n = ${n}$ unknowns.` }] : [])].filter((e) => e.value !== n - rk),
          hints: [t`$\dim N(A) = n - r$: unknowns minus pivots.`],
          teach: 'dim N(A) = n − r: one special solution per free column.',
          explain: t`$r = ${rk}$ pivots among $n = ${n}$ columns, so $\dim N(A) = ${n} - ${rk} = ${n - rk}$.`,
          visual: rr(R, { aug: false, picture: 'none', colLabels: Array.from({ length: n }, (_, k) => xn(k + 1)), caption: 'The RREF with each column’s unknown above it.' }),
        };
      },
    }),
    num({
      id: 'cp-coords', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const b1 = [r.int(-2, 3), r.int(-2, 3)], b2 = [r.int(-2, 3), r.int(-2, 3)], a = r.intExcept(-2, 2, [0]), b = r.intExcept(-2, 2, [0]), ask = r.int(0, 1);
          if (b1[0] * b2[1] - b1[1] * b2[0] === 0 || a === b) continue;
          const w = [a * b1[0] + b * b2[0], a * b1[1] + b * b2[1]];
          if (Math.max(...w.map(Math.abs)) > 6) continue;
          return {
            prompt: t`In the basis $\mathbf b_1 = ${tupleTeX(b1)}$, $\mathbf b_2 = ${tupleTeX(b2)}$ of $\mathbb R^2$, what is the ${ask ? 'second' : 'first'} coordinate of $\mathbf w = ${tupleTeX(w)}$?`,
            answer: ask ? b : a, tol: { rel: 0, abs: 0.01 },
            errors: w[ask] !== (ask ? b : a) ? [{ value: w[ask], feedback: 'That is a standard coordinate of w. In the basis b₁, b₂ you need the weights with c₁b₁ + c₂b₂ = w.' }] : [],
            hints: [t`Solve $c_1${tupleTeX(b1)} + c_2${tupleTeX(b2)} = ${tupleTeX(w)}$.`],
            teach: 'The same vector has different coordinates in different bases; in each basis they are unique.',
            explain: t`$c_1 = ${a}$, $c_2 = ${b}$: $${a}${tupleTeX(b1)} + (${b})${tupleTeX(b2)} = ${tupleTeX(w)}$. LA-7 is all about converting between such coordinates.`,
            visual: arrows2([{ to: b1, color: 'accent', label: 'b₁', labelDx: 6, labelDy: -8 }, { to: b2, color: 'warn', label: 'b₂', labelDx: 6, labelDy: 10 }, { to: w, color: 'gold', width: 2.6, label: 'w', labelDx: 6, labelDy: -8 }], { caption: 'The basis vectors and w.' }),
          };
        }
        return { prompt: t`Basis $(1, 1)$, $(1, -1)$. First coordinate of $(3, 1)$?`, answer: 2, hints: ['Solve.'], teach: 'Coordinates.', explain: t`$(3, 1) = 2(1, 1) + (1, -1)$.` };
      },
    }),
    num({
      id: 'cp-rosette', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([2, 3]);
        const ans = (n * (n + 1)) / 2;
        return {
          prompt: n === 2
            ? t`At a point on the surface of a rocket’s propellant tank, the in-plane strain is a symmetric $2\times2$ array $\begin{bmatrix} \varepsilon_{xx} & \varepsilon_{xy} \\ \varepsilon_{xy} & \varepsilon_{yy} \end{bmatrix}$. Each strain gauge bonded there reads one number, a linear combination of these entries. What is the dimension of the space of such symmetric arrays — the fewest gauges that can pin down the strain?`
            : t`At a point inside a load-bearing strut, the strain is a symmetric $3\times3$ array ($\varepsilon_{ij} = \varepsilon_{ji}$). Each measurement gives one number, a linear combination of its entries. What is the dimension of the space of symmetric $3\times3$ arrays — the fewest independent measurements that can pin down the full strain state?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * n, feedback: t`That counts every entry, but symmetry ties $\varepsilon_{ij}$ to $\varepsilon_{ji}$: those pairs are one number, not two.` }, { value: n, feedback: 'That counts only the diagonal: the off-diagonal (shear) entries are independent numbers too.' }],
          hints: ['Count the entries you can choose freely: the diagonal, and one of each mirror-image pair off it.', t`Diagonal: $${n}$; pairs above the diagonal: $${(n * (n - 1)) / 2}$.`],
          teach: 'A symmetric n × n array has n(n + 1)/2 independent entries: that is the dimension of the space of such arrays.',
          explain: t`$${n}$ diagonal entries plus $${(n * (n - 1)) / 2}$ above the diagonal: $${ans}$. A basis is the arrays with a single 1 on the diagonal, or a 1 in a mirror-image pair — ${ans} of them. ${n === 2 ? 'That is why a strain-gauge rosette has three gauges (at 0°, 45° and 90°, say): three independent readings for a 3-dimensional space.' : 'The same count for a symmetric 4 × 4 array gives 10 — the ten independent components of the spacetime metric and of the stress–energy tensor in Einstein’s equations (gr.EQ.1).'} Each gauge must add a new independent reading; gauges whose readings are combinations of the others add nothing.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.8, n * 0.8 + 0.2], y: [-0.8, n * 0.8 + 0.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: [`${-0.4} + t*${n * 0.8}`, `${(n - 1) * 0.8 + 0.4} - t*${n * 0.8}`], t: [0, 1], color: 'violet', dash: true, width: 1.6 }],
              points: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ({ x: j * 0.8, y: (n - 1 - i) * 0.8, color: i === j ? 'gold' : 'accent', r: 6 }))).flat(),
            },
            caption: `The ${n} × ${n} array, one dot per entry: diagonal entries gold, and the mirror line (violet dashed) across which a symmetric array repeats itself.`,
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §3.4–3.5', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Axler, Linear Algebra Done Right (4th ed.), ch. 2 (open access)', url: 'https://linear.axler.net/' },
  ],
});
