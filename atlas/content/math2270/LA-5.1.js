// Column space and null space: the subspace test, C(A) as the reachable
// right-hand sides, N(A) from the special solutions, pivot columns of A (not
// of R), a truss's mechanisms and the readings healthy sensors can produce.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { tupleTeX, matTeX, rr } from './_la.js';
import { arrows2 } from './_spaces.js';

const t = String.raw;
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const xn = (k) => `x${String(k).replace(/\d/g, (d) => SUBS[d])}`;
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const EX = [[1, 2, 0, 1], [2, 4, 1, 4], [3, 6, 1, 5]];

/** An RREF with the given pivot columns (n columns, `rows` rows), random entries in the free columns. */
function rrefWith(r, rows, n, pivots) {
  return Array.from({ length: rows }, (_, i) => Array.from({ length: n }, (_, j) => {
    if (i >= pivots.length) return 0;
    const pc = pivots[i];
    if (j === pc) return 1;
    if (j < pc || pivots.includes(j)) return 0;
    return r.intExcept(-3, 4, [0]);
  }));
}
/** The special solution of R x = 0 for free column f (R in RREF with these pivots). */
const special = (R, n, pivots, f) => Array.from({ length: n }, (_, j) => (j === f ? 1 : pivots.includes(j) ? -R[pivots.indexOf(j)][f] : 0));

// the square frame of the truss problems: joints 1 (0, 0) and 2 (1, 0) pinned, 3 (1, 1) and 4 (0, 1) free
const seg = (p, q, color = 'ink2', width = 3.2, dash = false) => ({ param: [`${p[0]} + t*(${q[0] - p[0]})`, `${p[1]} + t*(${q[1] - p[1]})`], t: [0, 1], color, width, dash });
const pin = (p) => [seg(p, [p[0] - 0.12, p[1] - 0.18], 'ink3', 1.6), seg([p[0] - 0.12, p[1] - 0.18], [p[0] + 0.12, p[1] - 0.18], 'ink3', 1.6), seg([p[0] + 0.12, p[1] - 0.18], p, 'ink3', 1.6)];
const FRAME = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.9, 1.9], y: [-0.4, 1.35], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg([0, 0], [0, 1]), seg([1, 0], [1, 1]), seg([0, 1], [1, 1]), ...pin([0, 0]), ...pin([1, 0])],
    points: [{ x: 0, y: 0, color: 'ink', label: '1', labelDx: -16, labelDy: -2 }, { x: 1, y: 0, color: 'ink', label: '2', labelDx: 10, labelDy: -2 }, { x: 1, y: 1, color: 'gold', r: 5.5, label: '3', labelDx: 10, labelDy: -8 }, { x: 0, y: 1, color: 'gold', r: 5.5, label: '4', labelDx: -16, labelDy: -8 }],
  },
  caption,
});

export default lesson({
  id: 'math2270.LA-5.1',
  title: 'Column space and null space',
  minutes: 12, difficulty: 3,
  intro: t`Every $m\times n$ matrix $A$ carries two subspaces. The **column space** is every combination of the columns — every $\mathbf b$ that $A\mathbf x = \mathbf b$ can reach. The **null space** is every solution of $A\mathbf x = \mathbf 0$:

$$C(A) = \{A\mathbf x : \mathbf x \text{ in } \mathbb R^n\} \subseteq \mathbb R^m, \qquad N(A) = \{\mathbf x : A\mathbf x = \mathbf 0\} \subseteq \mathbb R^n$$

Both are **subspaces**: they contain $\mathbf 0$ and are closed under adding and scaling, so every combination of members is a member — a line or plane through the origin, or a higher-dimensional cousin. $A\mathbf x = \mathbf b$ has a solution exactly when $\mathbf b$ lies in $C(A)$, and $N(A)$ comes straight from the RREF: one **special solution** per free variable. These are LA-4.3’s range and kernel, now as spaces to describe exactly.`,
  symbols: [
    { tex: 'A', text: t`an $m\times n$ matrix: $n$ columns, each a vector in $\mathbb R^m$` },
    { tex: 'C(A)', text: t`the column space: all combinations $x_1\mathbf a_1 + \dots + x_n\mathbf a_n$ of the columns, a subspace of $\mathbb R^m$` },
    { tex: 'N(A)', text: t`the null space: all solutions of $A\mathbf x = \mathbf 0$, a subspace of $\mathbb R^n$` },
    { tex: t`\text{subspace}`, text: t`a set of vectors that contains $\mathbf 0$ and keeps $\mathbf u + \mathbf v$ and $c\mathbf u$ whenever it has $\mathbf u$ and $\mathbf v$` },
    { tex: t`\text{special solution}`, text: t`set one free variable to 1 and the others to 0, then solve $R\mathbf x = \mathbf 0$ for the pivot variables; they span $N(A)$` },
  ],
  why: 'The null space of a structure’s compatibility matrix lists its mechanisms — motions that stretch no bar — and the column space of a measurement matrix lists the readings healthy instruments can produce.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Which targets can the columns reach?',
    lead: t`The columns $\mathbf a_1 = (2, 0, 1)$ and $\mathbf a_2 = (0, 2, 1)$ of $A = \begin{bmatrix} 2 & 0 \\ 0 & 2 \\ 1 & 1 \end{bmatrix}$ span a plane in $\mathbb R^3$: the column space. The gold arrow is $A\mathbf x = x_1\mathbf a_1 + x_2\mathbf a_2$; the red point is a target $\mathbf b = (2, 2, h)$.`,
    tasks: [
      'Move x₁ and x₂: Ax slides around the violet plane but never leaves it. That plane is C(A).',
      'Set h = 2: b drops into the plane (its distance reads 0). Now find weights that reach it — x₁ = x₂ = 1.',
      'Set h to anything else: b is off the plane, no weights reach it, and Ax = b has no solution.',
    ],
    params: {
      range: 3,
      sliders: [
        { key: 'x1', label: t`Weight $x_1$`, min: -2, max: 2, step: 0.25, value: 0.5, explain: t`How much of column $\mathbf a_1$.` },
        { key: 'x2', label: t`Weight $x_2$`, min: -2, max: 2, step: 0.25, value: 1.5, explain: t`How much of column $\mathbf a_2$.` },
        { key: 'h', label: t`Height $h$ of the target $\mathbf b$`, min: -1, max: 4, step: 0.25, value: 3.5, explain: t`The third component of $\mathbf b = (2, 2, h)$.` },
      ],
      parallelograms: [{ at: [-2, -2, -2], u: [4, 0, 2], v: [0, 4, 2], color: 'violet', alpha: 0.18 }],
      vectors: [
        { to: [2, 0, 1], color: 'accent', label: t`\mathbf a_1` }, { to: [0, 2, 1], color: 'warn', label: t`\mathbf a_2` },
        { to: ['2*x1', '2*x2', 'x1 + x2'], color: 'gold', label: t`A\mathbf x` },
      ],
      segments: [{ from: ['2*x1', '2*x2', 'x1 + x2'], to: [2, 2, 'h'], color: 'bad', dash: true }],
      points: [{ at: [2, 2, 'h'], color: 'bad', label: t`\mathbf b` }],
      readouts: [
        { label: t`$A\mathbf x$`, vec: ['2*x1', '2*x2', 'x1 + x2'] },
        { label: t`distance from $\mathbf b$ to the plane`, expr: '2*abs(h - 2)/sqrt(6)', digits: 3 },
      ],
    },
    caption: 'The violet patch is part of the column space (the plane goes on for ever). Red dashed: from Ax to the target b. Drag the picture to rotate.',
  },
  example: {
    prompt: t`Describe the null space and the column space of $A = ${matTeX(EX)}$, and say which $\mathbf b$ make $A\mathbf x = \mathbf b$ solvable.`,
    visual: { type: 'calc-vectors3d', params: { range: 4, vectors: [{ to: [1, 2, 3], color: 'accent', label: t`\mathbf a_1` }, { to: [2, 4, 6], color: 'accent', label: t`\mathbf a_2` }, { to: [0, 1, 1], color: 'warn', label: t`\mathbf a_3` }, { to: [1, 4, 5], color: 'good', label: t`\mathbf a_4` }], parallelograms: [{ at: [-1, 0, -1], u: [4, 0, 4], v: [0, 4, 4], color: 'violet', alpha: 0.16 }] }, caption: 'The four columns of A. All of them lie in one plane (violet patch), z = x + y: that plane is C(A). Drag to rotate.' },
    steps: [
      { label: 'Reduce', text: t`$R_2 - 2R_1$ and $R_3 - 3R_1$ both give $(0, 0, 1, 2)$; then $R_3 - R_2$ leaves a zero row: $$R = ${matTeX([[1, 2, 0, 1], [0, 0, 1, 2], [0, 0, 0, 0]])}.$$ Pivots in columns 1 and 3; $x_2$ and $x_4$ are free.` },
      { label: 'Special solutions', text: t`$R\mathbf x = \mathbf 0$ says $x_1 = -2x_2 - x_4$ and $x_3 = -2x_4$. Set $x_2 = 1, x_4 = 0$: $\mathbf s_1 = (-2, 1, 0, 0)$. Set $x_2 = 0, x_4 = 1$: $\mathbf s_2 = (-1, 0, -2, 1)$.` },
      { label: 'Null space', text: t`$N(A)$ is every combination $c_1\mathbf s_1 + c_2\mathbf s_2$: a plane through the origin in $\mathbb R^4$. Check: $A\mathbf s_2 = (-1 + 1,\ -2 - 2 + 4,\ -3 - 2 + 5) = \mathbf 0$ ✓.` },
      { label: 'Column space', text: t`Columns 2 and 4 are combinations of the others ($\mathbf a_2 = 2\mathbf a_1$, $\mathbf a_4 = \mathbf a_1 + 2\mathbf a_3$ — read off the free columns of $R$), so $C(A)$ is spanned by the **pivot columns of $A$**: $(1, 2, 3)$ and $(0, 1, 1)$. Not the pivot columns of $R$ — elimination changes the columns.` },
      { label: 'Which b', text: t`Row 3 of $A$ is row 1 plus row 2, so every $A\mathbf x$ has third component = first + second. $C(A)$ is the plane $b_3 = b_1 + b_2$: $A\mathbf x = (1, 0, 1)$ is solvable, $A\mathbf x = (1, 0, 0)$ is not.` },
    ],
    answer: t`$N(A)$: all combinations of $(-2, 1, 0, 0)$ and $(-1, 0, -2, 1)$ — a plane in $\mathbb R^4$. $C(A)$: the plane $b_3 = b_1 + b_2$ in $\mathbb R^3$, spanned by $(1, 2, 3)$ and $(0, 1, 1)$.`,
  },
  practice: [
    mcq({
      id: 'subspace-test', difficulty: 1,
      prompt: 'The picture shows four sets of points in the plane. Which one is a subspace?',
      choices: [t`The blue line $y = 2x$`, t`The orange line $y = 2x + 1$`, 'The green pair of axes (the x-axis together with the y-axis)', t`The violet parabola $y = x^2$`],
      answer: 0,
      why: {
        1: t`It misses the origin, and every subspace contains $\mathbf 0$ (scale any member by 0).`,
        2: t`Not closed under addition: $(1, 0)$ and $(0, 1)$ are on the axes, but their sum $(1, 1)$ is not.`,
        3: t`Not closed under scaling: $(1, 1)$ is on it, but $2(1, 1) = (2, 2)$ is not, since $2 \ne 2^2$.`,
      },
      hints: [t`A subspace must contain $\mathbf 0$, and every sum and multiple of its members.`, 'Try adding two members, or doubling one, and see whether the result stays in the set.'],
      teach: 'A subspace contains 0 and is closed under addition and scaling: in the plane, the subspaces are {0}, the lines through the origin, and the whole plane.',
      explain: t`Points of $y = 2x$ are the multiples $t(1, 2)$: sums and multiples of them are multiples again, and $\mathbf 0$ is among them. The other three each fail one test — the shifted line misses $\mathbf 0$, the axes fail addition, the parabola fails scaling.`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2.2, 3.2], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 'y', curves: [{ param: ['t', '0'], t: [-4, 4], color: 'good', width: 3 }, { param: ['0', 't'], t: [-3, 4], color: 'good', width: 3 }, { fn: '2x', color: 'accent' }, { fn: '2x + 1', color: 'warn' }, { fn: 'x^2', color: 'violet' }] }, caption: 'Blue: y = 2x. Orange: y = 2x + 1. Green: the two axes together. Violet: y = x².' },
    }),
    num({
      id: 'null-special', difficulty: 2,
      gen(r) {
        const [rows, n, pivots] = r.pick([[2, 4, [0, 2]], [2, 4, [0, 1]], [3, 5, [0, 1, 3]], [3, 5, [0, 2, 3]], [2, 5, [0, 3]], [3, 5, [1, 2, 4]]]);
        const R = rrefWith(r, rows, n, pivots), free = [...Array(n).keys()].filter((j) => !pivots.includes(j));
        const f = r.pick(free.filter((g) => g > pivots[0])), p = r.pick(pivots.filter((q) => q < f)), s = special(R, n, pivots, f);
        const others = free.filter((g) => g !== f);
        return {
          prompt: t`A matrix $A$ in the unknowns $x_1, \dots, x_${n}$ reduces to the RREF below. Find the special solution of $A\mathbf x = \mathbf 0$ with $x_${f + 1} = 1$${others.length ? t` and ${others.map((g) => `$x_${g + 1} = 0$`).join(' and ')}` : ''}. What is its component $x_${p + 1}$?
$$${matTeX(R)}$$`,
          answer: s[p], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -s[p], feedback: t`Sign: the row says $x_${p + 1} + (${R[pivots.indexOf(p)][f]})x_${f + 1} + \dots = 0$, so moving the free term across flips its sign.` }],
          hints: [t`Row ${pivots.indexOf(p) + 1} of the RREF is the equation for the pivot variable $x_${p + 1}$.`, t`With $x_${f + 1} = 1$ and the other free variables 0, that row reads $x_${p + 1} + (${R[pivots.indexOf(p)][f]}) = 0$.`],
          teach: 'Each special solution sets one free variable to 1, the others to 0, and solves the RREF rows for the pivot variables; together they span N(A).',
          explain: t`The special solution is $${tupleTeX(s)}$. ${free.length > 1 ? `The ${free.length} special solutions (one per free variable) span $N(A)$, a ${free.length}-dimensional subspace of $\\mathbb R^${n}$.` : t`It spans $N(A)$, a line in $\mathbb R^${n}$.`}`,
          visual: rr(R, { aug: false, picture: 'none', colLabels: Array.from({ length: n }, (_, k) => xn(k + 1)), caption: 'The RREF, with each column’s unknown above it. Columns without a pivot belong to free variables.' }),
        };
      },
    }),
    mcq({
      id: 'col-basis', difficulty: 2,
      prompt: t`$A = ${matTeX([[1, 2, 1], [2, 4, 3], [1, 2, 2]])}$ reduces to $R = ${matTeX([[1, 2, 0], [0, 0, 1], [0, 0, 0]])}$. Which vectors form a basis — a smallest spanning set — of the column space $C(A)$?`,
      choices: [t`$(1, 2, 1)$ and $(1, 3, 2)$`, t`$(1, 0, 0)$ and $(0, 1, 0)$`, t`$(1, 2, 0)$ and $(0, 0, 1)$`, t`$(1, 2, 1)$ and $(2, 4, 2)$`],
      answer: 0,
      why: {
        1: t`Those are the pivot columns of $R$. Row operations change the columns: $C(R)$ is the $xy$-plane, but $C(A)$ is not — $(1, 0, 0)$ is not even a combination of $A$’s columns.`,
        2: t`Those are the nonzero rows of $R$: a basis of the *row* space, a different subspace.`,
        3: t`$(2, 4, 2)$ is twice $(1, 2, 1)$: together they span only a line.`,
      },
      hints: [t`$R$ tells you *which* columns are pivot columns; the basis vectors come from $A$ itself.`, t`Pivots sit in columns 1 and 3, so take columns 1 and 3 of $A$.`],
      teach: 'The pivot columns of A — located with the RREF, but taken from A itself — form a basis of C(A).',
      explain: t`Pivots are in columns 1 and 3, so columns 1 and 3 of $A$, $(1, 2, 1)$ and $(1, 3, 2)$, are a basis of $C(A)$. Column 2 is $2\times$ column 1 (the free column of $R$ says so) and adds nothing. Row operations keep the null space but move the column space, so the vectors must come from $A$.`,
      visual: rr([[1, 2, 1], [2, 4, 3], [1, 2, 2]], { aug: false, picture: 'none', mode: 'rref', stepper: true, caption: 'Step through the reduction of A to R. Watch the columns change as the rows are combined.' }),
    }),
    num({
      id: 'b-in-col', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const a1 = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)], a2 = [r.int(-2, 2), r.int(-2, 2), r.int(-2, 2)];
          const c = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])];
          const det = a1[0] * a2[1] - a1[1] * a2[0], nrm = cross(a1, a2);
          if (det === 0 || nrm[2] === 0 || nrm.every((z) => z === 0)) continue;
          const b = a1.map((v, i) => c[0] * v + c[1] * a2[i]);
          if (b[2] === 0 || Math.max(...b.map(Math.abs)) > 6) continue;
          return {
            prompt: t`The columns of $A = ${matTeX(a1.map((v, i) => [v, a2[i]]))}$ span a plane in $\mathbb R^3$. For which $h$ does $\mathbf b = (${b[0]}, ${b[1]}, h)$ lie in $C(A)$ — so that $A\mathbf x = \mathbf b$ has a solution?`,
            answer: b[2], tol: { rel: 0, abs: 0.01 },
            hints: [t`$\mathbf b$ is in $C(A)$ when $x_1\mathbf a_1 + x_2\mathbf a_2 = \mathbf b$. The first two rows fix $x_1$ and $x_2$.`, t`Solve $${a1[0]}x_1 + (${a2[0]})x_2 = ${b[0]}$ and $${a1[1]}x_1 + (${a2[1]})x_2 = ${b[1]}$; then $h$ must equal $${a1[2]}x_1 + (${a2[2]})x_2$.`],
            teach: 'b is in the column space exactly when Ax = b is consistent: some combination of the columns equals b.',
            explain: t`The first two rows give $x_1 = ${c[0]}$, $x_2 = ${c[1]}$, and row 3 then requires $h = ${a1[2]}(${c[0]}) + (${a2[2]})(${c[1]}) = ${b[2]}$. Equivalently, $\mathbf b$ must be perpendicular to $\mathbf a_1\times\mathbf a_2 = ${tupleTeX(nrm)}$, the plane’s normal.`,
            visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: a1, color: 'accent', label: t`\mathbf a_1` }, { to: a2, color: 'warn', label: t`\mathbf a_2` }], parallelograms: [{ at: a1.map((v, i) => -1.5 * v - 1.5 * a2[i]), u: a1.map((v) => 3 * v), v: a2.map((v) => 3 * v), color: 'violet', alpha: 0.16 }] }, caption: 'The two columns and a patch of the plane they span, C(A). Drag to rotate.' },
          };
        }
        return { prompt: t`Columns $(1, 0, 1)$ and $(0, 1, 1)$. For which $h$ is $(2, 3, h)$ in $C(A)$?`, answer: 5, hints: ['x₁ = 2, x₂ = 3.'], teach: 'Consistency.', explain: t`$h = 5$.` };
      },
    }),
    mcq({
      id: 'truss-mechanism', difficulty: 3,
      prompt: t`A square frame has pinned joints 1 and 2 and free joints 3 and 4, joined by three bars: 1–4, 2–3 and 4–3 (no diagonal). Give the free joints small displacements $\mathbf d = (u_3, v_3, u_4, v_4)$ ($u$ across, $v$ up). Each bar’s stretch is one row of the **compatibility matrix**: $$C\mathbf d = ${matTeX([[0, 0, 0, 1], [0, 1, 0, 0], [1, 0, -1, 0]])}\begin{bmatrix} u_3 \\ v_3 \\ u_4 \\ v_4 \end{bmatrix} = \begin{bmatrix} \text{stretch of 1–4} \\ \text{stretch of 2–3} \\ \text{stretch of 4–3} \end{bmatrix}.$$ A **mechanism** moves the joints without stretching any bar. Which $\mathbf d$ is one?`,
      choices: [t`$(1, 0, 1, 0)$`, t`$(0, 1, 0, 1)$`, t`$(1, 0, -1, 0)$`, t`$(1, 1, 1, 1)$`],
      answer: 0,
      why: {
        1: t`Lifting both top joints stretches both vertical bars: $C\mathbf d = (1, 1, 0) \ne \mathbf 0$.`,
        2: t`Moving the top joints apart stretches the top bar: $C\mathbf d = (0, 0, 2)$.`,
        3: t`$C\mathbf d = (1, 1, 0)$: the vertical bars stretch. A mechanism must give $C\mathbf d = \mathbf 0$.`,
      },
      hints: [t`A mechanism stretches no bar: it is a vector in the null space, $C\mathbf d = \mathbf 0$.`, t`Multiply each choice by $C$. The rows say $v_4 = 0$, $v_3 = 0$ and $u_3 = u_4$.`],
      teach: 'Mechanisms of a pin-jointed frame are the null space of its compatibility matrix: joint motions that change no bar’s length (to first order).',
      explain: t`$C(1, 0, 1, 0) = \mathbf 0$: both top joints slide sideways together and the square leans into a parallelogram — the classic racking mechanism. $N(C)$ is exactly the multiples of $(1, 0, 1, 0)$. A diagonal brace from joint 1 to joint 3 adds the row $(1, 1, 0, 0)$ (its stretch, times $\sqrt2$); then $N = \{\mathbf 0\}$ and the frame is rigid. (Mechanisms are first-order: a real finite sway lets the top drop slightly as the bars rotate.)`,
      visual: FRAME('The frame: pinned joints 1 and 2 (grey supports), free joints 3 and 4 (gold), three bars and no diagonal. Not to scale.'),
    }),
    mcq({
      id: 'rowops', difficulty: 2,
      prompt: t`Row reduction turns $A$ into its RREF $R$. Which subspace is guaranteed to be the same for $A$ and $R$?`,
      choices: [t`The null space: $R\mathbf x = \mathbf 0$ has exactly the solutions of $A\mathbf x = \mathbf 0$`, 'The column space', 'Both the null space and the column space', 'Neither'],
      answer: 0,
      why: {
        1: t`Not in general: for $A = \begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix}$, $C(A)$ is the line through $(1, 2)$, but $R = \begin{bmatrix} 1 & 2 \\ 0 & 0 \end{bmatrix}$ has $C(R)$ the line through $(1, 0)$.`,
        2: t`Only one survives: the column space moves (the $2\times2$ example: line through $(1, 2)$ becomes the line through $(1, 0)$).`,
        3: t`Row operations are reversible and never change a system’s solutions, so the null space survives.`,
      },
      hints: ['Row operations were invented to keep the solutions of a system unchanged.', t`Try $A = \begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix}$: compare the columns of $A$ and of $R$.`],
      teach: 'Row operations preserve the null space (and the row space) but not the column space — which is why a basis of C(A) uses A’s own pivot columns.',
      explain: t`Each row operation can be undone, so $A\mathbf x = \mathbf 0$ and $R\mathbf x = \mathbf 0$ have the same solutions: $N(A) = N(R)$. The columns, though, are rebuilt: in the example the column space swings from the line through $(1, 2)$ to the $x$-axis.`,
      visual: rr([[1, 2, 0], [2, 4, 0]], { stepper: true, solution: true, view: 3, caption: 'The rows of Ax = 0 for A = [1 2; 2 4]: each is a line through the origin — here the same line, the null space (gold). Step through the reduction: it does not move.' }),
    }),
    code({
      id: 'truss-nullspace', difficulty: 2,
      prompt: t`Use SymPy to find the mechanisms of the square frame from the earlier problem, then brace it. Set \`mechanisms\` to a basis of the null space of \`C\` (\`C.nullspace()\`), \`braced\` to \`C\` with a fourth row \`[1, 1, 0, 0]\` for the diagonal brace from joint 1 to joint 3, and \`braced_mechanisms\` to the null space of \`braced\`.`,
      starter: t`from sympy import Matrix

# compatibility matrix of the square frame: one row per bar, columns u3, v3, u4, v4
C = Matrix([[0, 0, 0, 1],     # bar 1-4 (left, vertical)
            [0, 1, 0, 0],     # bar 2-3 (right, vertical)
            [1, 0, -1, 0]])   # bar 4-3 (top)

mechanisms = None          # TODO: a basis of the null space of C
braced = None              # TODO: C with the brace row [1, 1, 0, 0] added at the bottom
braced_mechanisms = None   # TODO: the null space of braced

print(mechanisms)
print(braced_mechanisms)
`,
      answer: t`from sympy import Matrix

C = Matrix([[0, 0, 0, 1],
            [0, 1, 0, 0],
            [1, 0, -1, 0]])

mechanisms = C.nullspace()
braced = C.col_join(Matrix([[1, 1, 0, 0]]))
braced_mechanisms = braced.nullspace()

print(mechanisms)
print(braced_mechanisms)
`,
      tests: [
        { name: 'the unbraced frame has exactly one mechanism', code: 'len(mechanisms) == 1' },
        { name: 'it is the sideways sway (1, 0, 1, 0), up to scale', code: 'C * mechanisms[0] == Matrix([0, 0, 0]) and list(mechanisms[0] / mechanisms[0][0]) == [1, 0, 1, 0]' },
        { name: 'the braced matrix is 4 × 4 with the brace as its last row', code: 'braced.shape == (4, 4) and list(braced.row(3)) == [1, 1, 0, 0]' },
        { name: 'the braced frame has no mechanism', code: 'braced_mechanisms == []' },
      ],
      hints: [t`\`C.nullspace()\` returns a list of column vectors (SymPy matrices) — one per free variable.`, t`\`C.col_join(Matrix([[1, 1, 0, 0]]))\` stacks a new row under \`C\`.`],
      teach: 'sympy.Matrix.nullspace() computes the special solutions exactly, so a structure’s mechanisms come out as exact vectors.',
      explain: t`\`C.nullspace()\` returns \`[Matrix([1, 0, 1, 0])]\`: one free variable, one mechanism. The brace adds a fourth independent row, every column gets a pivot, and the null space is empty: the braced frame is rigid. Structural codes do the same with thousands of joints, using floating-point rank tests instead of exact arithmetic.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-special', difficulty: 2,
      gen(r) {
        const [rows, n, pivots] = r.pick([[3, 5, [0, 1, 4]], [3, 5, [0, 2, 4]], [2, 4, [1, 2]], [3, 4, [0, 1, 2]], [2, 5, [0, 1]]]);
        const R = rrefWith(r, rows, n, pivots), free = [...Array(n).keys()].filter((j) => !pivots.includes(j));
        const f = r.pick(free.filter((g) => g > pivots[0])), p = r.pick(pivots.filter((q) => q < f)), s = special(R, n, pivots, f);
        const others = free.filter((g) => g !== f);
        return {
          prompt: t`$A$ reduces to the RREF below. In the special solution of $A\mathbf x = \mathbf 0$ with $x_${f + 1} = 1$${others.length ? t` and ${others.map((g) => `$x_${g + 1} = 0$`).join(' and ')}` : ''}, what is $x_${p + 1}$?
$$${matTeX(R)}$$`,
          answer: s[p], tol: { rel: 0, abs: 0.01 },
          hints: [t`Row ${pivots.indexOf(p) + 1} gives $x_${p + 1}$ in terms of the free variables.`],
          teach: 'Special solutions: one free variable 1, the others 0, pivot variables from the RREF rows.',
          explain: t`The special solution is $${tupleTeX(s)}$, so $x_${p + 1} = ${s[p]}$.`,
          visual: rr(R, { aug: false, picture: 'none', colLabels: Array.from({ length: n }, (_, k) => xn(k + 1)), caption: 'The RREF with each column’s unknown above it.' }),
        };
      },
    }),
    mcq({
      id: 'cp-solvable', difficulty: 2,
      prompt: t`When does $A\mathbf x = \mathbf b$ have at least one solution?`,
      choices: [t`Exactly when $\mathbf b$ is a combination of the columns of $A$`, t`Exactly when $\mathbf b$ is in the null space of $A$`, t`Only when $A$ is square`, t`Whenever $\mathbf b \ne \mathbf 0$`],
      answer: 0,
      why: {
        1: t`The null space holds inputs $\mathbf x$ with $A\mathbf x = \mathbf 0$; $\mathbf b$ is an output, and it may not even have the right number of components.`,
        2: t`Rectangular systems are solvable whenever $\mathbf b$ lies in the column space — the frame and sensor problems have non-square matrices.`,
        3: t`$\mathbf b = \mathbf 0$ is always reachable (take $\mathbf x = \mathbf 0$); a nonzero $\mathbf b$ off the column space is not reachable at all.`,
      },
      hints: [t`$A\mathbf x = x_1\mathbf a_1 + \dots + x_n\mathbf a_n$: what can it equal?`],
      teach: 'Ax = b is solvable exactly when b is in the column space C(A).',
      explain: t`$A\mathbf x$ is always a combination of the columns, so a solution exists exactly when $\mathbf b$ is one: $\mathbf b \in C(A)$.`,
      visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: [2, 0, 1], color: 'accent', label: t`\mathbf a_1` }, { to: [0, 2, 1], color: 'warn', label: t`\mathbf a_2` }], parallelograms: [{ at: [-2, -2, -2], u: [4, 0, 2], v: [0, 4, 2], color: 'violet', alpha: 0.16 }], points: [{ at: [2, 2, 2], color: 'good', label: t`\mathbf b_1` }, { at: [2, 2, 3.5], color: 'bad', label: t`\mathbf b_2` }] }, caption: 'The Explore columns and their plane. One target lies in the plane, the other does not. Drag to rotate.' },
    }),
    num({
      id: 'cp-parity', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const r1 = r.float(-3, 3, 0.1), r2 = r.float(-3, 3, 0.1), ans = r2 - r1;
          if (Math.abs(ans) < 0.15 || Math.abs(r1) < 0.15 || Math.abs(r2) < 0.15 || Math.abs(r1 + r2 - ans) < 0.05) continue;
          const s3 = Math.sqrt(3) / 2;
          return {
            prompt: t`A drone’s flight controller measures its horizontal acceleration $\mathbf a = (a_x, a_y)$ with three single-axis accelerometers at $0^\circ$, $60^\circ$ and $120^\circ$, so the readings are $\mathbf r = H\mathbf a$ with $$H = \begin{bmatrix} 1 & 0 \\ \tfrac12 & \tfrac{\sqrt3}{2} \\ -\tfrac12 & \tfrac{\sqrt3}{2} \end{bmatrix}.$$ Healthy readings must lie in the column space of $H$, a plane in $\mathbb R^3$. Sensors 1 and 2 read $${nice(r1)}$ and $${nice(r2)}$ m/s². What must sensor 3 read if all three are healthy?`,
            answer: ans, units: 'm/s^2', tol: { rel: 0.005, abs: 0.005 },
            errors: [{ value: r1 + r2, feedback: t`Check the sign of each term: the readings of healthy sensors satisfy $r_1 - r_2 + r_3 = 0$.` }],
            hints: [t`Find the plane $C(H)$: look for $\mathbf y$ with $\mathbf y\cdot(\text{each column}) = 0$. Try $\mathbf y = (1, -1, 1)$.`, t`Every healthy reading satisfies $r_1 - r_2 + r_3 = 0$.`],
            teach: 'When there are more measurements than unknowns, the possible readings form the column space of the measurement matrix, and a reading outside it reveals a fault.',
            explain: t`Both columns of $H$ are perpendicular to $(1, -1, 1)$: $1 - \tfrac12 - \tfrac12 = 0$ and $0 - \tfrac{\sqrt3}{2} + \tfrac{\sqrt3}{2} = 0$. So $C(H)$ is the plane $r_1 - r_2 + r_3 = 0$, and $r_3 = r_2 - r_1 = ${nice(ans)}$ m/s². A reading off that plane cannot come from any true acceleration: one sensor is wrong. Redundant inertial systems run exactly this **parity check** (LA-5.4 names the vector $(1, -1, 1)$: it spans the left null space). Real readings carry noise, so the check uses a threshold, not exact zero.`,
            visual: arrows2([{ to: [1, 0], color: 'accent', label: '1', labelDx: 6, labelDy: 0 }, { to: [0.5, s3], color: 'warn', label: '2', labelDx: 6, labelDy: -6 }, { to: [-0.5, s3], color: 'good', label: '3', labelDx: -14, labelDy: -6 }], { x: [-1.6, 1.8], y: [-0.4, 1.2], caption: 'The three sensing axes in the drone’s horizontal plane, at 0°, 60° and 120°.' }),
          };
        }
        return { prompt: t`Readings $r_1 = 1$ and $r_2 = 3$ m/s². Healthy $r_3$?`, answer: 2, units: 'm/s^2', hints: ['r₁ − r₂ + r₃ = 0.'], teach: 'Parity.', explain: t`$r_3 = 2$ m/s².` };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §3.1–3.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Pellegrino & Calladine, “Matrix analysis of statically and kinematically indeterminate frameworks”, Int. J. Solids Struct. 22 (1986)', url: 'https://doi.org/10.1016/0020-7683(86)90082-9' },
  ],
});
