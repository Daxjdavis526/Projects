// Linear independence: only the trivial combination gives zero; dependence
// from the RREF; why "no two parallel" is not enough; a GPS geometry whose
// columns go dependent.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { tupleTeX, matTeX, stems, rr } from './_la.js';
import { arrows2 } from './_spaces.js';

const t = String.raw;
const cosd = (d) => Math.cos((d * Math.PI) / 180), sind = (d) => Math.sin((d * Math.PI) / 180);
const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const vn = (k) => `v${String(k).replace(/\d/g, (d) => SUBS[d])}`;
const ORD = ['first', 'second', 'third'];

const VERDICT = [
  'Independent: no vector is a multiple of another one',
  'Dependent: one vector is a multiple of another',
  'Dependent: three vectors in a plane are always dependent',
  'Independent: none of the vectors is the zero vector',
];
const WHY = {
  0: { 1: 'Look again: the two arrows lie along different lines, so neither is a multiple of the other.', 2: 'There are only two vectors here, and the plane has room for two independent ones.', 3: 'The verdict is right but the reason is not: nonzero vectors can still be dependent. What matters is that neither is a multiple of the other.' },
  1: { 0: 'The two arrows lie along one line through the origin: one is a multiple of the other (a negative multiple if they point opposite ways).', 2: 'There are only two vectors; the trouble is that they are parallel.', 3: 'Nonzero vectors can still be dependent: these two lie along one line.' },
  2: { 0: 'No two are parallel, yet the third is a combination of the other two: in the plane, two non-parallel vectors already reach everything.', 1: 'No vector here is a multiple of another — the dependence involves all three at once.', 3: 'Nonzero vectors can still be dependent: in the plane, any third vector is a combination of two non-parallel ones.' },
};

export default lesson({
  id: 'math2270.LA-5.2',
  title: 'Linear independence',
  minutes: 11, difficulty: 2,
  intro: t`Vectors $\mathbf v_1, \dots, \mathbf v_k$ are **linearly independent** when the only way to combine them into the zero vector is the trivial way:

$$c_1\mathbf v_1 + c_2\mathbf v_2 + \dots + c_k\mathbf v_k = \mathbf 0 \quad\Longrightarrow\quad c_1 = c_2 = \dots = c_k = 0$$

Otherwise they are **dependent**: some combination with weights not all zero gives $\mathbf 0$, and then at least one vector is a combination of the others — redundant, adding nothing to the span. Put the vectors in the columns of a matrix $A$: independence means $N(A) = \{\mathbf 0\}$, a pivot in every column. Two quick consequences: a set containing $\mathbf 0$ is dependent, and more than $n$ vectors in $\mathbb R^n$ always are.`,
  symbols: [
    { tex: t`\mathbf v_1, \dots, \mathbf v_k`, text: t`the vectors being tested — $k$ of them, all in the same space $\mathbb R^n$` },
    { tex: t`c_1, \dots, c_k`, text: 'the weights of a combination (real numbers)' },
    { tex: t`\mathbf 0`, text: t`the zero vector of $\mathbb R^n$` },
    { tex: t`\Longrightarrow`, text: 'implies: whenever the left side holds, the right side must hold too' },
    { tex: t`\text{dependent}`, text: t`some combination with weights *not all zero* gives $\mathbf 0$ — at least one vector is a combination of the others` },
  ],
  why: 'Independence is how you count genuinely different directions — degrees of freedom, independent measurements, modes of vibration — and a GPS fix fails exactly when the geometry makes its matrix’s columns dependent.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Can three arrows cancel out?',
    lead: t`Three vectors in $\mathbb R^3$: $\mathbf v_1 = (1, 0, 1)$, $\mathbf v_2 = (0, 1, 1)$ and $\mathbf v_3 = (1, h, 2)$. The gold arrow is the combination $c_1\mathbf v_1 + c_2\mathbf v_2 + c_3\mathbf v_3$. Independent means the only way to make it vanish is $c_1 = c_2 = c_3 = 0$.`,
    tasks: [
      'With h = 2, try to shrink the gold arrow to nothing without setting every weight to 0. You cannot, and the box the three vectors span has volume 1: independent.',
      'Set h = 1: v₃ drops into the violet plane of v₁ and v₂, and the volume reads 0. Now set c = (1, 1, −1): the gold arrow vanishes. Dependent.',
      'At h = 1, v₃ = v₁ + v₂ adds nothing new: all three together still reach only the violet plane.',
    ],
    params: {
      range: 2.5,
      sliders: [
        { key: 'h', label: t`Entry $h$ of $\mathbf v_3 = (1, h, 2)$`, min: -1, max: 3, step: 0.25, value: 2, explain: t`Moves the tip of $\mathbf v_3$ sideways, in and out of the plane of $\mathbf v_1$ and $\mathbf v_2$.` },
        { key: 'c1', label: t`Weight $c_1$`, min: -2, max: 2, step: 0.5, value: 1, explain: t`How much of $\mathbf v_1$.` },
        { key: 'c2', label: t`Weight $c_2$`, min: -2, max: 2, step: 0.5, value: 1, explain: t`How much of $\mathbf v_2$.` },
        { key: 'c3', label: t`Weight $c_3$`, min: -2, max: 2, step: 0.5, value: -1, explain: t`How much of $\mathbf v_3$.` },
      ],
      parallelograms: [{ at: [-1.5, -1.5, -3], u: [3, 0, 3], v: [0, 3, 3], color: 'violet', alpha: 0.16 }],
      vectors: [
        { to: [1, 0, 1], color: 'accent', label: t`\mathbf v_1` }, { to: [0, 1, 1], color: 'warn', label: t`\mathbf v_2` }, { to: [1, 'h', 2], color: 'good', label: t`\mathbf v_3` },
        { to: ['c1 + c3', 'c2 + c3*h', 'c1 + c2 + 2*c3'], color: 'gold', label: t`\textstyle\sum c_i\mathbf v_i` },
      ],
      readouts: [
        { label: t`$c_1\mathbf v_1 + c_2\mathbf v_2 + c_3\mathbf v_3$`, vec: ['c1 + c3', 'c2 + c3*h', 'c1 + c2 + 2*c3'] },
        { label: 'volume of the box they span', expr: 'abs(1 - h)', digits: 3 },
      ],
    },
    caption: 'The violet patch is part of the plane spanned by v₁ and v₂. The volume readout is |det[v₁ v₂ v₃]|, the volume of the slanted box with these three edges (LA-8): zero exactly when the vectors are dependent. Drag the picture to rotate.',
  },
  example: {
    prompt: t`Are $\mathbf v_1 = (1, 2, 0, -1)$, $\mathbf v_2 = (2, 1, 3, 0)$ and $\mathbf v_3 = (0, 3, -3, -2)$ in $\mathbb R^4$ independent? If not, find a dependence.`,
    visual: stems([['v₁', [1, 2, 0, -1], 'accent'], ['v₂', [2, 1, 3, 0], 'warn'], ['v₃', [0, 3, -3, -2], 'good']], { caption: 'The three vectors as stem plots, one stem per component. Four components each — too many to draw as arrows, but not to compute with.' }),
    steps: [
      { label: 'Set up', text: t`Put the vectors in the columns of $A$ and ask whether $A\mathbf c = c_1\mathbf v_1 + c_2\mathbf v_2 + c_3\mathbf v_3 = \mathbf 0$ has a solution other than $\mathbf c = \mathbf 0$.` },
      { label: 'Reduce', text: t`$$A = ${matTeX([[1, 2, 0], [2, 1, 3], [0, 3, -3], [-1, 0, -2]])} \;\longrightarrow\; R = ${matTeX([[1, 0, 2], [0, 1, -1], [0, 0, 0], [0, 0, 0]])}$$ Column 3 has no pivot: $c_3$ is free, so they are **dependent**.` },
      { label: 'Read the dependence', text: t`$R\mathbf c = \mathbf 0$ says $c_1 = -2c_3$ and $c_2 = c_3$. Take $c_3 = 1$: $\mathbf c = (-2, 1, 1)$, so $-2\mathbf v_1 + \mathbf v_2 + \mathbf v_3 = \mathbf 0$.` },
      { label: 'Check', text: t`$\mathbf v_3 = 2\mathbf v_1 - \mathbf v_2 = (2 - 2,\ 4 - 1,\ 0 - 3,\ -2 - 0) = (0, 3, -3, -2)$ ✓. The free column of $R$ said so directly: its entries $(2, -1)$ are the weights.` },
      { label: 'Meaning', text: t`$\mathbf v_3$ is redundant: $\mathbf v_1, \mathbf v_2$ span the same plane in $\mathbb R^4$ as all three. Columns 1 and 2 of $R$ both hold pivots, so $\mathbf v_1$ and $\mathbf v_2$ alone are independent.` },
    ],
    answer: t`Dependent: $-2\mathbf v_1 + \mathbf v_2 + \mathbf v_3 = \mathbf 0$, i.e. $\mathbf v_3 = 2\mathbf v_1 - \mathbf v_2$.`,
  },
  practice: [
    mcq({
      id: 'pair-2d', difficulty: 1,
      gen(r) {
        const kind = r.int(0, 2);
        let vecs;
        if (kind === 0) { for (;;) { const a = [r.intExcept(-3, 3, [0]), r.int(-3, 3)], b = [r.int(-3, 3), r.intExcept(-3, 3, [0])]; if (a[0] * b[1] - a[1] * b[0] !== 0) { vecs = [a, b]; break; } } }
        else if (kind === 1) { const a = r.pick([[1, 2], [2, -1], [1, 1], [3, 1], [-1, 2], [2, 1]]), s = r.pick([-2, -1, 2, 1.5, -1.5]); vecs = [a, a.map((v) => v * s)]; }
        else { for (;;) { const a = [r.intExcept(-3, 3, [0]), r.int(-2, 2)], b = [r.int(-2, 2), r.intExcept(-3, 3, [0])], c = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])]; const x = (p, q) => p[0] * q[1] - p[1] * q[0]; if (x(a, b) && x(a, c) && x(b, c)) { vecs = [a, b, c]; break; } } }
        const colors = ['accent', 'warn', 'good'];
        return {
          prompt: t`Are the ${vecs.length === 2 ? 'two' : 'three'} vectors in the picture — ${vecs.map((v) => `$${tupleTeX(v)}$`).join(vecs.length === 2 ? ' and ' : ', ')} — linearly independent?`,
          choices: VERDICT, answer: kind, why: WHY[kind],
          hints: ['Is one arrow along the same line as another? How many vectors are there, in a space of how many dimensions?', 'In the plane: two vectors are dependent exactly when they are parallel; three are always dependent.'],
          teach: 'In the plane, two vectors are independent exactly when they are not parallel, and any three are dependent.',
          explain: kind === 0 ? 'The arrows lie along different lines, so the only combination giving 0 is the trivial one: independent. Two independent vectors in the plane span all of it.'
            : kind === 1 ? t`One is a multiple of the other, so (multiple)$\cdot$(first) $-$ (second) $= \mathbf 0$ with nonzero weights: dependent. Together they span only a line.`
              : 'Any two non-parallel vectors in the plane already span it, so the third is a combination of them: dependent. More than n vectors in ℝⁿ are always dependent.',
          visual: arrows2(vecs.map((v, k) => ({ to: v, color: colors[k], label: `v${'₁₂₃'[k]}`, labelDx: 6, labelDy: -8 })), { caption: 'The vectors, drawn from the origin.' }),
        };
      },
    }),
    num({
      id: 'find-c', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const v1 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], v2 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
          const a = r.intExcept(-2, 2, [0]), b = r.intExcept(-2, 2, [0]), ask = r.int(0, 1);
          const v3 = v1.map((x, i) => a * x + b * v2[i]);
          const indep = v1.some((x, i) => v1.some((y, j) => x * v2[j] - y * v2[i] !== 0));
          if (!indep || Math.max(...v3.map(Math.abs)) > 8 || v3.every((x) => x === 0)) continue;
          const ans = ask === 0 ? -a : -b;
          return {
            prompt: t`The vectors $\mathbf v_1 = ${tupleTeX(v1)}$, $\mathbf v_2 = ${tupleTeX(v2)}$ and $\mathbf v_3 = ${tupleTeX(v3)}$ are dependent: $c_1\mathbf v_1 + c_2\mathbf v_2 + \mathbf v_3 = \mathbf 0$ for some weights. Find $c_${ask + 1}$.`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: -ans, feedback: t`That is the weight in $\mathbf v_3 = c\,\mathbf v_1 + \dots$; moving $\mathbf v_3$ to the other side flips the sign.` }],
            hints: [t`Equivalently, write $\mathbf v_3 = a\mathbf v_1 + b\mathbf v_2$; then $c_1 = -a$ and $c_2 = -b$.`, t`Two components are enough to find $a$ and $b$; the others must then agree.`],
            teach: 'A dependence relation is a combination with nonzero weights that gives 0; finding it shows which vector is redundant.',
            explain: t`$\mathbf v_3 = ${a}\mathbf v_1 + (${b})\mathbf v_2$ (check every component), so $(${-a})\mathbf v_1 + (${-b})\mathbf v_2 + \mathbf v_3 = \mathbf 0$ and $c_${ask + 1} = ${ans}$.`,
            visual: stems([['v₁', v1, 'accent'], ['v₂', v2, 'warn'], ['v₃', v3, 'good']], { caption: 'The three vectors as stem plots, component by component.' }),
          };
        }
        return { prompt: t`$\mathbf v_1 = (1, 0, 0, 0)$, $\mathbf v_2 = (0, 1, 0, 0)$, $\mathbf v_3 = (2, 3, 0, 0)$. Find $c_1$ with $c_1\mathbf v_1 + c_2\mathbf v_2 + \mathbf v_3 = \mathbf 0$.`, answer: -2, hints: ['v₃ = 2v₁ + 3v₂.'], teach: 'Find the relation.', explain: t`$c_1 = -2$.` };
      },
    }),
    num({
      id: 'h-dependent', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const v1 = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], v2 = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)];
          const a = r.intExcept(-2, 2, [0]), b = r.intExcept(-2, 2, [0]), slot = r.int(0, 2);
          const [i, j] = [0, 1, 2].filter((s) => s !== slot);
          if (v1[i] * v2[j] - v1[j] * v2[i] === 0) continue;
          const v3 = v1.map((x, q) => a * x + b * v2[q]);
          if (v3[slot] === 0) continue;
          const shown = v3.map((x, q) => (q === slot ? 'h' : String(x)));
          return {
            prompt: t`For which $h$ are $\mathbf v_1 = ${tupleTeX(v1)}$, $\mathbf v_2 = ${tupleTeX(v2)}$ and $\mathbf v_3 = (${shown.join(',\\ ')})$ linearly dependent?`,
            answer: v3[slot], tol: { rel: 0, abs: 0.01 },
            hints: [t`$\mathbf v_1$ and $\mathbf v_2$ are not parallel, so the three are dependent exactly when $\mathbf v_3 = a\mathbf v_1 + b\mathbf v_2$ for some $a$, $b$.`, t`The ${ORD[i]} and ${ORD[j]} components of $\mathbf v_3$ (the ones without $h$) fix $a$ and $b$; then $h$ must match the ${ORD[slot]} component of $a\mathbf v_1 + b\mathbf v_2$.`],
            teach: 'Three vectors in ℝ³ are dependent exactly when one lies in the plane spanned by the other two.',
            explain: t`From the components without $h$: $a = ${a}$, $b = ${b}$. Then $h = ${a}(${v1[slot]}) + (${b})(${v2[slot]}) = ${v3[slot]}$, which puts $\mathbf v_3$ in the plane of $\mathbf v_1$ and $\mathbf v_2$. For any other $h$, $\det[\mathbf v_1\ \mathbf v_2\ \mathbf v_3] \ne 0$ and the three are independent.`,
            visual: { type: 'calc-vectors3d', params: { range: 2.6, vectors: [{ to: v1, color: 'accent', label: t`\mathbf v_1` }, { to: v2, color: 'warn', label: t`\mathbf v_2` }], parallelograms: [{ at: v1.map((x, q) => -1.2 * x - 1.2 * v2[q]), u: v1.map((x) => 2.4 * x), v: v2.map((x) => 2.4 * x), color: 'violet', alpha: 0.16 }] }, caption: 'v₁, v₂ and a patch of the plane they span. For the right h, v₃ lies in this plane. Drag to rotate.' },
          };
        }
        return { prompt: t`For which $h$ are $(1, 0, 1)$, $(0, 1, 1)$, $(1, 1, h)$ dependent?`, answer: 2, tol: { rel: 0, abs: 0.01 }, hints: ['v₃ = v₁ + v₂.'], teach: 'Coplanar.', explain: t`$h = 2$.` };
      },
    }),
    mcq({
      id: 'too-many', difficulty: 1,
      prompt: t`Four nonzero vectors in $\mathbb R^3$, no two of them parallel. Are they independent?`,
      choices: ['No: four vectors in ℝ³ are always dependent', 'Yes: no two are parallel', 'Yes: none is the zero vector', 'It depends on the vectors: you would have to row-reduce'],
      answer: 0,
      why: {
        1: t`Pairwise non-parallel is not enough. With four columns and at most three pivots, $A\mathbf c = \mathbf 0$ always has a free variable.`,
        2: 'Nonzero vectors can be dependent; here there are simply too many of them for three dimensions.',
        3: t`No computation is needed: a $3\times4$ matrix has at most 3 pivots, so one of its 4 columns is always free.`,
      },
      hints: [t`Put them in the columns of a $3\times4$ matrix. How many pivots can it have?`],
      teach: 'More than n vectors in ℝⁿ are always dependent: the matrix has more columns than it can have pivots.',
      explain: t`A $3\times4$ matrix has at most 3 pivots, so at least one column is free and $A\mathbf c = \mathbf 0$ has nonzero solutions. In $\mathbb R^3$ at most 3 vectors can be independent: the space has only three independent directions.`,
      visual: { type: 'calc-vectors3d', params: { range: 2, vectors: [{ to: [1.5, 0, 0.3], color: 'accent', label: t`\mathbf v_1` }, { to: [0, 1.5, 0.5], color: 'warn', label: t`\mathbf v_2` }, { to: [0.3, 0.2, 1.5], color: 'good', label: t`\mathbf v_3` }, { to: [-1, 1, 1], color: 'violet', label: t`\mathbf v_4` }] }, caption: 'Four vectors in ℝ³ pointing four different ways. Drag to rotate.' },
    }),
    mcq({
      id: 'pairwise-error', kind: 'error', difficulty: 2,
      prompt: t`A student writes: “The vectors $(1, 0, 0)$, $(0, 1, 0)$ and $(1, 1, 0)$ are independent, because no two of them are parallel.” What is wrong?`,
      choices: [t`Pairwise non-parallel is not enough: $(1, 1, 0) = (1, 0, 0) + (0, 1, 0)$, so the set is dependent`, 'Nothing: vectors that are pairwise non-parallel are independent', 'The set is dependent because each vector has a zero component', t`The set is dependent because three vectors in $\mathbb R^3$ are always dependent`],
      answer: 0,
      why: {
        1: 'Independence is about all the vectors together, not pairs: here the third is the sum of the first two.',
        2: t`Zero components do not matter: $(1, 0, 0)$, $(0, 1, 0)$, $(0, 0, 1)$ are full of zeros and independent.`,
        3: t`Three vectors in $\mathbb R^3$ can be independent — the standard basis is. It is *more than three* that forces dependence.`,
      },
      hints: ['Do all three lie in one plane?', t`Try $c_1 = 1$, $c_2 = 1$, $c_3 = -1$.`],
      teach: 'Independence is a property of the whole set: three vectors can be pairwise non-parallel and still lie in one plane.',
      explain: t`$1\cdot(1, 0, 0) + 1\cdot(0, 1, 0) - 1\cdot(1, 1, 0) = \mathbf 0$: a nontrivial combination, so the set is dependent. All three lie in the $xy$-plane, and a plane has room for only two independent directions.`,
      visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: [{ to: [1, 0, 0], color: 'accent', label: t`(1, 0, 0)` }, { to: [0, 1, 0], color: 'warn', label: t`(0, 1, 0)` }, { to: [1, 1, 0], color: 'good', label: t`(1, 1, 0)` }], planes: [{ normal: [0, 0, 1], d: 0, size: 1.4, color: 'violet', alpha: 0.16 }] }, caption: 'The three vectors and the xy-plane (violet). Drag to rotate.' },
    }),
    num({
      id: 'rref-coeffs', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-3, 3, [0]), ask = r.int(0, 1);
        const R = [[1, 0, a, 0], [0, 1, b, 0], [0, 0, 0, 1]];
        return {
          prompt: t`The matrix with columns $\mathbf v_1, \mathbf v_2, \mathbf v_3, \mathbf v_4$ reduces to the RREF below. Column 3 has no pivot, so $\mathbf v_3$ is a combination $\mathbf v_3 = a\mathbf v_1 + b\mathbf v_2$. Find $${ask ? 'b' : 'a'}$.
$$${matTeX(R)}$$`,
          answer: ask ? b : a, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ask ? -b : -a, feedback: t`Those are the weights of the null-space vector $(-a, -b, 1, 0)$. In $\mathbf v_3 = a\mathbf v_1 + b\mathbf v_2$ the signs are as they appear in column 3.` }],
          hints: ['Row operations keep every relation between the columns. So whatever combination of columns 1 and 2 of R gives column 3 of R, the same one works for the v’s.', t`Column 3 of $R$ is $${tupleTeX([a, b, 0])} = ${a}\,(\text{column }1) + (${b})\,(\text{column }2)$.`],
          teach: 'A free column of the RREF lists the weights that build it from the pivot columns — and those weights hold for the original vectors too.',
          explain: t`Column 3 of $R$ is $${a}$ times column 1 plus $${b}$ times column 2, and row operations preserve relations among columns, so $\mathbf v_3 = ${a}\mathbf v_1 + (${b})\mathbf v_2$. The pivot columns $\mathbf v_1, \mathbf v_2, \mathbf v_4$ are independent.`,
          visual: rr(R, { aug: false, picture: 'none', colLabels: [vn(1), vn(2), vn(3), vn(4)], caption: 'The RREF, with each column’s vector above it. Pivots in columns 1, 2 and 4.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dependent', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const p = r.intExcept(-2, 3, [0]), q = r.int(-2, 2), s = r.int(-2, 2), u = r.intExcept(-2, 2, [0]), w = r.int(-2, 3);
          // columns (1, p, q), (0, 1, s), (u, w, h): dependent when the determinant (linear in h) vanishes
          const c1 = [1, p, q], c2 = [0, 1, s];
          const d0 = det3(c1, c2, [u, w, 0]), d1 = det3(c1, c2, [u, w, 1]) - d0;
          if (d1 === 0) continue;
          const h = -d0 / d1;
          if (!Number.isInteger(h) || h === 0 || Math.abs(h) > 9) continue;
          return {
            prompt: t`For which $h$ are the columns of $\begin{bmatrix} 1 & 0 & ${u} \\ ${p} & 1 & ${w} \\ ${q} & ${s} & h \end{bmatrix}$ linearly dependent?`,
            answer: h, tol: { rel: 0, abs: 0.01 },
            hints: [t`Row-reduce: the columns are dependent exactly when some column ends up without a pivot.`],
            teach: 'Columns are dependent exactly when elimination leaves a column without a pivot.',
            explain: t`Elimination leaves the third pivot as $h - (${-d0})$, so for $h = ${h}$ there is no third pivot: column 3 is a combination of columns 1 and 2. ($\det = h - (${h})$ — LA-8.)`,
            visual: { type: 'calc-vectors3d', params: { range: 2.6, vectors: [{ to: c1, color: 'accent', label: t`\mathbf a_1` }, { to: c2, color: 'warn', label: t`\mathbf a_2` }], parallelograms: [{ at: c1.map((x, i) => -1.2 * x - 1.2 * c2[i]), u: c1.map((x) => 2.4 * x), v: c2.map((x) => 2.4 * x), color: 'violet', alpha: 0.16 }] }, caption: 'The first two columns and their plane. Drag to rotate.' },
          };
        }
        return { prompt: t`For which $h$ are the columns of $\begin{bmatrix} 1 & 0 & 1 \\ 0 & 1 & 1 \\ 1 & 1 & h \end{bmatrix}$ dependent?`, answer: 2, tol: { rel: 0, abs: 0.01 }, hints: ['Third pivot.'], teach: 'Pivot test.', explain: t`$h = 2$.` };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 1,
      prompt: t`A set of vectors contains the zero vector. Is it independent?`,
      choices: [t`No, never: $1\cdot\mathbf 0 + 0\cdot\mathbf v_1 + \dots = \mathbf 0$ is a combination with a nonzero weight`, 'Yes, if the other vectors are independent', 'It depends on how many vectors there are', 'Yes: the zero vector adds nothing to the span, so it cannot cause dependence'],
      answer: 0,
      why: {
        1: t`Even then, putting weight 1 on $\mathbf 0$ and 0 on everything else gives $\mathbf 0$ with a nonzero weight.`,
        2: t`Even $\{\mathbf 0\}$ on its own is dependent: $5\cdot\mathbf 0 = \mathbf 0$.`,
        3: 'Adding nothing to the span is exactly what redundant means: a vector that adds nothing makes the set dependent.',
      },
      hints: [t`Is there a combination with a nonzero weight that gives $\mathbf 0$?`],
      teach: 'Any set containing the zero vector is dependent, so a basis can never contain 0.',
      explain: t`Weight 1 on $\mathbf 0$, weight 0 on the others: a nontrivial combination equal to $\mathbf 0$. So no set containing $\mathbf 0$ is independent — and no basis contains $\mathbf 0$.`,
      visual: stems([['v₁', [2, -1, 1], 'accent'], ['v₂', [1, 2, 0], 'warn'], ['0', [0, 0, 0], 'good']], { caption: 'Two vectors and the zero vector (all its stems have height 0).' }),
    }),
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const el = r.pick([15, 20, 30, 40, 45, 60]), az = r.pick([[0, 90, 180, 270], [20, 110, 200, 290], [45, 135, 225, 315], [10, 80, 170, 260]]);
        const c = -sind(el);
        const L = 2;
        return {
          prompt: t`A GPS receiver solves for four unknowns: its position $(x, y, z)$ and its clock offset. Linearized, each satellite’s range measurement gives one row $(-e_x, -e_y, -e_z, 1)$ of the geometry matrix $G$, where $\mathbf e$ is the unit vector from the receiver toward that satellite. Suppose the four satellites in view all sit at the same elevation, $${el}^\circ$ above the horizon (in different directions). Then column 3 of $G$ is a multiple $c$ of column 4. Find $c$ to 3 significant figures.`,
          answer: c, tol: { rel: 0.005, abs: 0.002 }, sigfigs: 3,
          hints: [t`The upward component of a unit vector at elevation $\varepsilon$ is $e_z = \sin\varepsilon$, whatever its direction around the horizon.`, t`Column 3 holds $-e_z = -\sin${el}^\circ$ in every row; column 4 holds 1 in every row.`],
          teach: 'A system cannot separate two unknowns whose columns are dependent: changing one looks exactly like changing the other.',
          explain: t`Every row has $-e_z = -\sin${el}^\circ \approx ${nice(c, 3)}$ in column 3 and $1$ in column 4, so column 3 $= ${nice(c, 3)}\times$ column 4: the columns are dependent and $G$ has no inverse. Physically, raising the receiver changes every range the same way a clock error does, so height and clock offset cannot be told apart. Real receivers see satellites at many elevations (and can add a known height), which keeps the columns independent; poor geometry shows up as a large vertical dilution of precision.`,
          visual: { type: 'calc-vectors3d', params: { range: 2.4, vectors: az.map((a, k) => ({ to: [L * cosd(el) * cosd(a), L * cosd(el) * sind(a), L * sind(el)], color: ['accent', 'warn', 'good', 'violet'][k], label: t`\mathbf e_${k + 1}` })), curves: [{ param: [`${L * cosd(el)}*cos(t)`, `${L * cosd(el)}*sin(t)`, `${L * sind(el)}`], t: [0, 2 * Math.PI], color: 'ink3' }] }, caption: 'The four line-of-sight directions from the receiver (at the origin), all at the same elevation: their tips lie on one horizontal circle. Lengths are not to scale. Drag to rotate.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §3.4', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Misra & Enge, Global Positioning System: Signals, Measurements, and Performance (2nd ed.), ch. 6', url: 'https://www.gpstextbook.com/' },
  ],
});
