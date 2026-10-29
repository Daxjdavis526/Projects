// Linear combinations and span: what a set of vectors can reach, and Ax as a
// combination of the columns of A.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, add, scale, matvec, transpose, tupleTeX, colTeX, matTeX, stems, map2d } from './_la.js';

const t = String.raw;
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ORD = ['first', 'second', 'third', 'fourth'];

// the plane spanned by a and b (through the origin), with the two vectors and optional extras
function spanScene(a, b, { range = 4, extra = {}, caption, labels = [t`\mathbf a_1`, t`\mathbf a_2`] } = {}) {
  const n = cross(a, b);
  return {
    type: 'calc-vectors3d',
    params: {
      range,
      vectors: [{ to: a, color: 'good', label: labels[0] }, { to: b, color: 'warn', label: labels[1] }, ...(extra.vectors || [])],
      planes: dot(n, n) > 1e-9 ? [{ normal: n, d: 0, size: range * 0.95, color: 'violet', alpha: 0.18 }] : [],
      lines: extra.lines || [], points: extra.points || [],
    },
    caption: caption || 'Drag to rotate. The violet patch is part of the plane the two vectors span; it goes on for ever.',
  };
}
// 2×2 weights problems: integer weights and non-parallel columns
function weights(r) {
  for (let k = 0; k < 300; k++) {
    const a1 = [r.intExcept(-2, 3, [0]), r.int(-2, 2)], a2 = [r.int(-2, 2), r.intExcept(-2, 3, [0])];
    const det = a1[0] * a2[1] - a2[0] * a1[1];
    if (Math.abs(det) < 1 || Math.abs(a1[0] * a2[0] + a1[1] * a2[1]) === Math.hypot(...a1) * Math.hypot(...a2)) continue;
    const x1 = r.intExcept(-2, 3, [0]), x2 = r.intExcept(-2, 3, [0]);
    const b = add(scale(a1, x1), scale(a2, x2));
    if (Math.max(...b.map(Math.abs)) <= 5 && Math.max(...b.map(Math.abs)) >= 1 && x1 !== x2) return { a1, a2, x1, x2, b };
  }
  return { a1: [2, 1], a2: [-1, 1], x1: 1, x2: 2, b: [0, 3] };
}

export default lesson({
  id: 'math2270.LA-1.2',
  title: 'Linear combinations and span',
  minutes: 10, difficulty: 2,
  intro: t`A **linear combination** of vectors scales each one and adds: $c_1\mathbf v_1 + c_2\mathbf v_2$. The **span** of a set of vectors is everything you can reach that way — a line, a plane, or the whole space. A matrix packages vectors as its columns, and multiplying it by a column of weights *is* forming the combination:

$$A\mathbf x = x_1\mathbf a_1 + x_2\mathbf a_2 + \dots + x_n\mathbf a_n$$

So “is $\mathbf b$ in the span of the columns?” and “does $A\mathbf x = \mathbf b$ have a solution?” are **the same question**.`,
  symbols: [
    { tex: 'A', text: t`a matrix with $m$ rows and $n$ columns; its columns $\mathbf a_1, \dots, \mathbf a_n$ are vectors in $\mathbb R^m$` },
    { tex: t`\mathbf a_j`, text: t`the $j$-th column of $A$` },
    { tex: t`\mathbf x`, text: t`the column of weights $x_1, \dots, x_n$ — one number for each column of $A$` },
    { tex: t`x_j`, text: t`the weight on column $j$: a plain number (a scalar), which may be negative` },
    { tex: t`A\mathbf x`, text: t`the combination itself: a vector in $\mathbb R^m$` },
    { tex: t`\operatorname{span}\{\mathbf a_1, \dots, \mathbf a_n\}`, text: 'every vector that some choice of weights reaches' },
  ],
  why: 'Whether a system can be solved, whether a set of vectors is a basis, what a matrix does to space: each is a question about which combinations of the columns can be reached.',
  visual: {
    type: 'la-map2d',
    title: 'Reach the target with two vectors',
    lead: t`The green and orange arrows are $\mathbf a_1$ and $\mathbf a_2$. The gold arrow is $x_1\mathbf a_1 + x_2\mathbf a_2$, built tip to tail from the dashed pieces. The bold slanted grid marks every combination with whole-number weights.`,
    tasks: [
      'Move the weight sliders until the gold arrow lands on the red target b. Its weights are its coordinates on the slanted grid.',
      'Drag the tip of a₂ to (4, 2), onto the line through a₁: the whole grid collapses onto that line. The span is now a line, and b is out of reach.',
      'Drag a₂ anywhere off that line: every point of the plane can be reached again — the span is all of R².',
    ],
    params: {
      A: [[2, -1], [1, 1]], drag: true, snap: 0.5, shape: 'none', ghost: false, colNames: ['a₁', 'a₂'],
      sliders: [
        { key: 'c1', label: t`Weight $x_1$ on $\mathbf a_1$`, min: -3, max: 3, step: 0.1, value: 0.5, explain: t`How many copies of $\mathbf a_1$ (negative: pointing backwards).` },
        { key: 'c2', label: t`Weight $x_2$ on $\mathbf a_2$`, min: -3, max: 3, step: 0.1, value: 1.5, explain: t`How many copies of $\mathbf a_2$ to add on.` },
      ],
      x: ['c1', 'c2'], combo: true, target: [2, 2.5], readout: ['A', 'x', 'Ax'], view: 3.2,
    },
    caption: 'The columns of A are a₁ and a₂; the readout shows A, the weights x and the combination Ax. Drag either arrow’s tip (it snaps to half-units).',
  },
  example: {
    prompt: t`Is $\mathbf b = (4, 3, 5)$ in the span of $\mathbf a_1 = (1, 2, 1)$ and $\mathbf a_2 = (2, -1, 3)$?`,
    visual: spanScene([1, 2, 1], [2, -1, 3], {
      range: 5, caption: 'The plane spanned by a₁ and a₂, and b = 2a₁ + a₂ built tip to tail (dashed) — it lies in the plane. Drag to rotate.',
      extra: { vectors: [{ to: [2, 4, 2], color: 'good', dash: true }, { from: [2, 4, 2], to: [4, 3, 5], color: 'warn', dash: true }, { to: [4, 3, 5], color: 'gold', label: t`\mathbf b` }] },
    }),
    steps: [
      { label: 'Set up', text: t`We need weights with $x_1\mathbf a_1 + x_2\mathbf a_2 = \mathbf b$. Component by component that is three equations in two unknowns:
$$x_1 + 2x_2 = 4,\qquad 2x_1 - x_2 = 3,\qquad x_1 + 3x_2 = 5.$$` },
      { label: 'Solve two of them', text: t`From the first, $x_1 = 4 - 2x_2$. Put it in the second: $2(4 - 2x_2) - x_2 = 3$, so $8 - 5x_2 = 3$ and $x_2 = 1$, $x_1 = 2$.` },
      { label: 'Check the third', text: t`$x_1 + 3x_2 = 2 + 3 = 5$. ✓ So $\mathbf b = 2\mathbf a_1 + \mathbf a_2$.` },
      { label: 'What it means', text: t`Two vectors that are not parallel span a **plane** through the origin in $\mathbb R^3$. Three equations in two unknowns usually have no solution — most points are off the plane — and here the third equation happened to agree, so $\mathbf b$ is on it.` },
    ],
    answer: t`Yes: $\mathbf b = 2\mathbf a_1 + \mathbf a_2$.`,
  },
  practice: [
    num({
      id: 'combo-entry', difficulty: 1,
      gen(r) {
        const V = [0, 1, 2].map(() => Array.from({ length: 4 }, () => r.int(-3, 4)));
        const c = [r.intExcept(-3, 3, [0, 1]), r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], k = r.int(0, 3);
        const val = c[0] * V[0][k] + c[1] * V[1][k] + c[2] * V[2][k];
        const flip = c[0] * V[0][k] - c[1] * V[1][k] + c[2] * V[2][k];
        const term = (ci, i, first) => `${first ? (ci < 0 ? '-' : '') : ci < 0 ? ' - ' : ' + '}${Math.abs(ci) === 1 ? '' : Math.abs(ci)}\\mathbf a_${i + 1}`;
        return {
          prompt: t`With $\mathbf a_1 = ${tupleTeX(V[0])}$, $\mathbf a_2 = ${tupleTeX(V[1])}$ and $\mathbf a_3 = ${tupleTeX(V[2])}$, what is the ${ORD[k]} component of $${term(c[0], 0, true)}${term(c[1], 1)}${term(c[2], 2)}$?`,
          answer: val, tol: { rel: 0, abs: 0.01 },
          errors: flip !== val ? [{ value: flip, feedback: t`Check the sign on the $\mathbf a_2$ term: its weight is $${c[1]}$.` }] : [],
          hints: [t`Only the ${ORD[k]} components matter: take the ${ORD[k]} entry of each vector.`, t`Compute $(${c[0]})(${V[0][k]}) + (${c[1]})(${V[1][k]}) + (${c[2]})(${V[2][k]})$.`],
          teach: 'A linear combination works component by component: scale each vector’s entry by its weight and add.',
          explain: t`$(${c[0]})(${V[0][k]}) + (${c[1]})(${V[1][k]}) + (${c[2]})(${V[2][k]}) = ${val}$.`,
          visual: stems([['a₁', V[0], 'good'], ['a₂', V[1], 'warn'], ['a₃', V[2], 'violet']], { caption: 'The three vectors as stems. A combination scales each set of stems by its weight and stacks them.' }),
        };
      },
    }),
    num({
      id: 'Ax-columns', difficulty: 1,
      gen(r) {
        const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-2, 4))), x = [r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0])], k = r.int(0, 2);
        const Ax = matvec(A, x), wrong = matvec(transpose(A), x);
        const cols = [0, 1, 2].map((j) => A.map((row) => row[j]));
        return {
          prompt: t`Write $A\mathbf x$ as a combination of the columns of $A$ and find its ${ORD[k]} entry:
$$A = ${matTeX(A)},\qquad \mathbf x = ${colTeX(x)}.$$`,
          answer: Ax[k], tol: { rel: 0, abs: 0.01 },
          errors: wrong[k] !== Ax[k] ? [{ value: wrong[k], feedback: t`You combined the **rows** of $A$ with the weights. The weight $x_j$ multiplies **column** $j$.` }] : [],
          hints: [t`$A\mathbf x = ${x[0]}\,\mathbf a_1 + (${x[1]})\,\mathbf a_2 + (${x[2]})\,\mathbf a_3$, where $\mathbf a_j$ is column $j$.`, t`The ${ORD[k]} entry is $${x[0]}\cdot(${A[k][0]}) + (${x[1]})(${A[k][1]}) + (${x[2]})(${A[k][2]})$ — the ${ORD[k]} row of $A$ dotted with $\mathbf x$.`],
          teach: 'Ax is x₁ times column 1 plus x₂ times column 2 plus …; each entry is also a row of A dotted with x — two readings of one product.',
          explain: t`$A\mathbf x = ${x[0]}${colTeX(cols[0])} + (${x[1]})${colTeX(cols[1])} + (${x[2]})${colTeX(cols[2])} = ${colTeX(Ax)}$, so the ${ORD[k]} entry is $${Ax[k]}$.`,
          visual: { type: 'calc-vectors3d', params: { range: 4, vectors: cols.map((c, j) => ({ to: c, color: ['good', 'warn', 'violet'][j], label: t`\mathbf a_${j + 1}` })) }, caption: 'The three columns of A as arrows. Ax is a combination of them. Drag to rotate.' },
        };
      },
    }),
    num({
      id: 'find-weights', difficulty: 2,
      gen(r) {
        const { a1, a2, x1, x2, b } = weights(r), which = r.int(1, 2), ans = which === 1 ? x1 : x2;
        return {
          prompt: t`Find the weights with $x_1\mathbf a_1 + x_2\mathbf a_2 = \mathbf b$ for $\mathbf a_1 = ${tupleTeX(a1)}$, $\mathbf a_2 = ${tupleTeX(a2)}$ and $\mathbf b = ${tupleTeX(b)}$. What is $x_${which}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: which === 1 ? x2 : x1, feedback: t`That is the other weight, $x_${3 - which}$.` }],
          hints: [t`Write it as two equations: $${a1[0]}x_1 + (${a2[0]})x_2 = ${b[0]}$ and $${a1[1]}x_1 + (${a2[1]})x_2 = ${b[1]}$.`, 'Solve one equation for one weight and substitute into the other — or count steps along the slanted grid in the picture.'],
          teach: 'Finding the weights of a combination means solving a linear system, one equation per component.',
          explain: t`$x_1 = ${x1}$ and $x_2 = ${x2}$: $${x1}${tupleTeX(a1)} + (${x2})${tupleTeX(a2)} = ${tupleTeX(b)}$.`,
          visual: map2d([[a1[0], a2[0]], [a1[1], a2[1]]], { shape: 'none', ghost: false, colNames: ['a₁', 'a₂'], target: b, view: 3.5, caption: 'a₁ and a₂ with the slanted grid of whole-number combinations; the red ring is b.' }),
        };
      },
    }),
    mcq({
      id: 'span-line', difficulty: 2,
      prompt: t`What is the span of $\mathbf a_1 = (1, 2, -1)$ and $\mathbf a_2 = (-2, -4, 2)$ in $\mathbb R^3$?`,
      choices: ['A line through the origin', 'A plane through the origin', t`All of $\mathbb R^3$`, t`The segment joining the tips of $\mathbf a_1$ and $\mathbf a_2$`],
      answer: 0,
      why: {
        1: t`Two vectors span a plane only if they point in different directions. Here $\mathbf a_2 = -2\mathbf a_1$: every combination is a multiple of $\mathbf a_1$.`,
        2: t`Two vectors can never fill $\mathbb R^3$: at best they span a plane.`,
        3: 'Weights can be any real numbers, of any size or sign, so the span goes on for ever in both directions — it is not a segment.',
      },
      hints: [t`Is one vector a multiple of the other?`, t`$x_1\mathbf a_1 + x_2\mathbf a_2 = (x_1 - 2x_2)\,\mathbf a_1$.`],
      teach: 'Parallel vectors add no new direction: their span is just the line through either one.',
      explain: t`$\mathbf a_2 = -2\mathbf a_1$, so every combination is $(x_1 - 2x_2)\mathbf a_1$ — a multiple of $\mathbf a_1$. The span is the line through the origin along $(1, 2, -1)$.`,
      visual: spanScene([1, 2, -1], [-2, -4, 2], { range: 4, caption: 'The two vectors, drawn to scale. Drag to rotate and look at them from several sides.' }),
    }),
    num({
      id: 'in-span-h', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const a1 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], a2 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
          const d2 = a1[0] * a2[1] - a2[0] * a1[1];
          if (Math.abs(d2) < 1) continue;
          const c1 = r.intExcept(-2, 2, [0]), c2 = r.intExcept(-2, 2, [0]), b = add(scale(a1, c1), scale(a2, c2));
          if (Math.max(...b.map(Math.abs)) > 7 || b[2] === 0) continue;
          return {
            prompt: t`For which number $h$ is $\mathbf b = (${b[0]}, ${b[1]}, h)$ in the span of $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$?`,
            answer: b[2], tol: { rel: 0, abs: 0.01 },
            hints: ['The first two components of b do not involve h: they fix the weights.', t`Solve $${a1[0]}x_1 + (${a2[0]})x_2 = ${b[0]}$ and $${a1[1]}x_1 + (${a2[1]})x_2 = ${b[1]}$.`, t`The weights are $x_1 = ${c1}$, $x_2 = ${c2}$; the third component must then be $${c1}\cdot(${a1[2]}) + (${c2})(${a2[2]})$.`],
            teach: 'To test whether b is in a span, find weights from some components and check that they produce the rest.',
            explain: t`The first two components give $x_1 = ${c1}$ and $x_2 = ${c2}$. Then $h = ${c1}\cdot(${a1[2]}) + (${c2})(${a2[2]}) = ${b[2]}$. Any other $h$ puts $\mathbf b$ off the plane, out of reach.`,
            visual: spanScene(a1, a2, { range: Math.max(4, ...b.map(Math.abs)), caption: 'The plane spanned by a₁ and a₂ and the gold line of all points (b₁, b₂, h): it meets the plane at exactly one height. Drag to rotate.', extra: { lines: [{ point: [b[0], b[1], 0], dir: [0, 0, 1], t: [-8, 8], color: 'gold' }] } }),
          };
        }
        return { prompt: t`For which number $h$ is $\mathbf b = (4, 3, h)$ in the span of $\mathbf a_1 = (1, 2, 1)$ and $\mathbf a_2 = (2, -1, 3)$?`, answer: 5, tol: { rel: 0, abs: 0.01 }, hints: ['The first two components fix the weights.', 'x₁ = 2 and x₂ = 1.'], teach: 'Find weights from some components and check the rest.', explain: t`$h = 2 + 3 = 5$.`, visual: spanScene([1, 2, 1], [2, -1, 3]) };
      },
    }),
    mcq({
      id: 'two-in-R3', difficulty: 2,
      prompt: t`An engineer claims two well-chosen vectors can span all of $\mathbb R^3$, “as long as they are not parallel”. Is that right?`,
      choices: [t`No: two vectors span at most a plane; filling $\mathbb R^3$ needs at least three`, 'Yes, provided they are perpendicular', 'Yes, provided neither is the zero vector', 'Yes: with large enough weights you can reach any point'],
      answer: 0,
      why: {
        1: 'Perpendicular vectors still span only the plane that contains them.',
        2: 'Nonzero and not parallel guarantees a plane — but only a plane.',
        3: 'Large weights reach far, but only within the plane of the two vectors; a point off that plane is never reached.',
      },
      hints: ['Picture all combinations of two non-parallel vectors in space. What shape do they fill?', 'Every combination lies in the plane through the origin containing both vectors.'],
      teach: t`$k$ vectors span at most a $k$-dimensional space, so filling $\mathbb R^3$ takes at least three.`,
      explain: t`All combinations $x_1\mathbf a_1 + x_2\mathbf a_2$ lie in the plane containing $\mathbf a_1$ and $\mathbf a_2$. A third vector off that plane is needed to reach the rest of $\mathbb R^3$.`,
      visual: spanScene([2, 1, 0], [0, 1, 2], { range: 3, caption: 'Two non-parallel vectors and the plane they span: everything they can reach. Drag to rotate.' }),
    }),
    {
      type: 'slider', id: 'unmix', difficulty: 2, param: 'c1', answer: [0.45, 0.55],
      prompt: t`One pixel of an orbital image covers a patch of ground that is a mixture of two minerals. Its spectrum $\mathbf b$ (six bands, rings) should then be a combination $c_1\mathbf a_1 + c_2\mathbf a_2$ of the two pure spectra. Find the weights that make the gold stems match $\mathbf b$; you will be graded on $c_1$.`,
      visual: {
        type: 'la-vectors',
        params: { vectors: [{ name: 'a₁', values: [4, 6, 8, 6, 3, 2], color: 'good' }, { name: 'a₂', values: [1, 1, 2, 4, 6, 5], color: 'warn' }, { name: 'b', values: [3.2, 4.2, 6.4, 7.8, 8.7, 7], color: 'accent' }], combo: { of: [0, 1], target: 2, c: [0, 0], range: [-1, 3], step: 0.1 }, labels: ['1', '2', '3', '4', '5', '6'], xlabel: 'band', readout: ['resid'] },
        caption: 'Pure spectra a₁ and a₂ (thin), their combination (gold) and the pixel’s spectrum b (rings). The readout is the length of what is left over, b − (c₁a₁ + c₂a₂).',
      },
      instruction: 'Move both weights until the leftover length reads 0, then check.',
      hints: ['Band 1 is mostly a₁ and band 5 is mostly a₂: start there.', 'Try c₂ = 1.2, then adjust c₁ until every gold stem reaches its ring.'],
      teach: 'Asking whether b is a combination of a₁ and a₂ means asking whether some weights leave nothing over.',
      explain: t`$\mathbf b = 0.5\,\mathbf a_1 + 1.2\,\mathbf a_2$ exactly: for instance band 1 gives $0.5\cdot4 + 1.2\cdot1 = 3.2$. Real mixtures are only approximately linear (fine-grained minerals scatter light between grains), so real unmixing finds the weights that leave the *smallest* leftover — least squares, in LA-10.`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-weights', difficulty: 2,
      gen(r) {
        const { a1, a2, x1, x2, b } = weights(r);
        return {
          prompt: t`Find $x_2$ so that $x_1\mathbf a_1 + x_2\mathbf a_2 = \mathbf b$, where $\mathbf a_1 = ${tupleTeX(a1)}$, $\mathbf a_2 = ${tupleTeX(a2)}$ and $\mathbf b = ${tupleTeX(b)}$.`,
          answer: x2, tol: { rel: 0, abs: 0.01 },
          hints: ['Two components give two equations in x₁ and x₂.'],
          teach: 'Weights of a combination solve a linear system.',
          explain: t`$x_1 = ${x1}$ and $x_2 = ${x2}$.`,
          visual: map2d([[a1[0], a2[0]], [a1[1], a2[1]]], { shape: 'none', ghost: false, colNames: ['a₁', 'a₂'], target: b, view: 3.5, caption: 'a₁, a₂, the slanted grid of their whole-number combinations, and b (red ring).' }),
        };
      },
    }),
    num({
      id: 'cp-thrusters', difficulty: 3, transfer: true,
      gen(r) {
        const c1 = r.pick([0.5, 1, 1.5, 2, 2.5]), c2 = r.pick([1, 1.5, 2, 2.5, 3]);
        const d1 = [1, 0], d2 = [0.6, 0.8], J = add(scale(d1, c1), scale(d2, c2));
        const ask = r.int(1, 2);
        return {
          prompt: t`A small satellite can only fire two thrusters in its orbital plane, pushing along the unit directions $\mathbf d_1 = (1, 0)$ and $\mathbf d_2 = (0.6, 0.8)$. A manoeuvre needs the total impulse $\mathbf J = (${nice(J[0])}, ${nice(J[1])})$ N s. How much impulse must thruster ${ask} deliver, in N s?`,
          answer: ask === 1 ? c1 : c2, units: 'N s', tol: { rel: 0.005 },
          hints: [t`Write $\mathbf J = c_1\mathbf d_1 + c_2\mathbf d_2$: two equations, $c_1 + 0.6c_2 = ${nice(J[0])}$ and $0.8c_2 = ${nice(J[1])}$.`, t`The second equation gives $c_2 = ${nice(J[1])}/0.8$ at once.`],
          teach: 'Splitting a required impulse between fixed thrusters is finding the weights of a linear combination.',
          explain: t`$c_2 = ${nice(J[1])}/0.8 = ${nice(c2)}$ N s and $c_1 = ${nice(J[0])} - 0.6\cdot${nice(c2)} = ${nice(c1)}$ N s. Both are positive, which matters: a thruster can only push. A target needing a negative weight is in the span mathematically but out of reach physically — the craft would need a thruster facing the other way.`,
          visual: map2d([[1, 0.6], [0, 0.8]], { shape: 'none', ghost: false, colNames: ['d₁', 'd₂'], target: J, targetName: 'J', view: 3.4, caption: 'The two thrust directions and the required impulse J (in N s), with the grid of whole-number combinations.' }),
        };
      },
    }),
    mcq({
      id: 'cp-span', difficulty: 2,
      prompt: t`Which vector lies in the span of $\mathbf v = (1, 2, 3)$?`,
      choices: [t`$(-2, -4, -6)$`, t`$(2, 3, 4)$`, t`$(3, 2, 1)$`, t`$(1, 2, 4)$`],
      answer: 0,
      why: {
        1: t`That adds 1 to each component. A span is built by **multiplying**, not shifting: $(2, 3, 4)$ is not $c(1, 2, 3)$ for any $c$.`,
        2: 'Same numbers, wrong order: it points in a different direction.',
        3: t`Close, but the first two components need $c = 1$ and the third needs $c = 4/3$.`,
      },
      hints: [t`The span of one vector is all its multiples $c\mathbf v$.`, 'Look for one number c that works for all three components at once.'],
      teach: 'The span of a single nonzero vector is the line of all its multiples.',
      explain: t`$(-2, -4, -6) = -2\,(1, 2, 3)$. A negative multiple points backwards along the same line, still in the span.`,
      visual: { type: 'calc-vectors3d', params: { range: 4, vectors: [{ to: [1, 2, 3], color: 'accent', label: t`\mathbf v` }], lines: [{ point: [0, 0, 0], dir: [1, 2, 3], t: [-1.3, 1.3], color: 'violet' }] }, caption: 'v and its span, the violet line of all its multiples (drawn for a stretch; it goes on for ever). Drag to rotate.' },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §1.1 and §2.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 1: The geometry of linear equations', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
