// Kernel and range of a linear map: what it crushes to zero and what it can
// reach; one-to-one and onto; solutions = particular + kernel.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { tupleTeX, matTeX, map2d, rr } from './_la.js';
import { arrows2 } from './_spaces.js';

const t = String.raw;
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ORD = ['first', 'second', 'third'];

// the shadow map of the worked example: sunlight along d = (1, 2, −2)
const SHADOW = {
  type: 'calc-vectors3d',
  params: {
    range: 2.4,
    planes: [{ normal: [0, 0, 1], d: 0, size: 2.2, color: 'accent', alpha: 0.16 }],
    lines: [{ point: [0, 0, 0], dir: [-1, -2, 2], t: [-0.9, 0.9], color: 'warn', label: t`\ker S` }],
    segments: [{ from: [-1, -1, 2], to: [0, 1, 0], color: 'gold', dash: true }],
    points: [{ at: [-1, -1, 2], color: 'gold', label: 'P' }, { at: [0, 1, 0], color: 'ink', label: t`S(P)` }, { at: [0, 0, 0], color: 'warn' }],
  },
};

export default lesson({
  id: 'math2270.LA-4.3',
  title: 'Kernel and range',
  minutes: 11, difficulty: 3,
  intro: t`Two sets say what a linear map $T:\mathbb R^n \to \mathbb R^m$ loses and what it can reach. The **kernel** is everything $T$ crushes to zero; the **range** is everything $T$ can produce:

$$\ker T = \{\mathbf x : T(\mathbf x) = \mathbf 0\}, \qquad \operatorname{range} T = \{T(\mathbf x) : \mathbf x \text{ in } \mathbb R^n\}$$

$T$ is **one-to-one** (no two inputs share an output) exactly when its kernel is only $\{\mathbf 0\}$, and **onto** exactly when its range is all of $\mathbb R^m$. For $T(\mathbf x) = A\mathbf x$, the kernel is the solution set of $A\mathbf x = \mathbf 0$ and the range is the span of the columns. Keep a shadow in mind: sunlight crushes a whole line of points to one spot (the kernel is the sun’s direction), and the shadows cover the ground (the range).`,
  symbols: [
    { tex: t`T:\mathbb R^n \to \mathbb R^m`, text: t`a linear map from inputs with $n$ components to outputs with $m$ components` },
    { tex: t`\ker T`, text: t`the kernel: the inputs sent to $\mathbf 0$. It lives in the input space $\mathbb R^n$ and always contains $\mathbf 0$` },
    { tex: t`\operatorname{range} T`, text: t`the range (image): every output $T$ can produce. It lives in the output space $\mathbb R^m$` },
    { tex: t`\mathbf 0`, text: 'the zero vector (of whichever space is meant)' },
    { tex: t`\text{one-to-one}`, text: t`$T(\mathbf x) = T(\mathbf y)$ only when $\mathbf x = \mathbf y$ — equivalently, $\ker T = \{\mathbf 0\}$` },
    { tex: t`\text{onto}`, text: t`every vector of $\mathbb R^m$ is some $T(\mathbf x)$ — equivalently, $\operatorname{range} T = \mathbb R^m$` },
  ],
  why: 'The kernel is what a measurement cannot see and the range is what it can produce; and since every solution of Ax = b is one particular solution plus the kernel, the kernel decides whether a physical problem has one answer or a whole family.',
  visual: {
    type: 'la-map2d',
    title: 'Squash the plane and find what disappears',
    lead: t`The map $A = \begin{bmatrix} 2 & 1 \\ 1 & k \end{bmatrix}$ acts on an input $\mathbf x = s(1, -2)$. Change $k$ until the plane collapses, then slide $\mathbf x$ along its line and watch its image $A\mathbf x$ (gold).`,
    tasks: [
      'Set k = 0.5: the determinant hits 0 and the whole grid collapses onto one line through (2, 1) — the range.',
      'Keep k = 0.5 and move s: x slides along the line through (1, −2), but Ax stays at the origin. That whole line is the kernel.',
      'Move k away from 0.5: Ax leaves the origin and the image grid covers the plane again — the kernel is just {0} and the range is everything.',
    ],
    params: {
      A: [[2, 1], [1, 'k']], x: ['s', '-2*s'], view: 3, readout: ['A', 'det', 'x', 'Ax'], colNames: ['Ae₁', 'Ae₂'],
      sliders: [
        { key: 'k', label: t`Entry $k$ (row 2, column 2)`, min: -1, max: 2, step: 0.25, value: 1.5, explain: t`At $k = \tfrac12$ row 2 is half of row 1, and the map squashes the plane flat.` },
        { key: 's', label: t`Input $\mathbf x = s(1, -2)$`, min: -1.5, max: 1.5, step: 0.25, value: 1, explain: t`Slides $\mathbf x$ along the line through $(1, -2)$.` },
      ],
    },
    caption: 'Faint: the plane before the map; bold: after it. Dashed grey: the input x. Gold: its image Ax. When det A = 0 the image grid lies along a single line, drawn as one bold line.',
  },
  example: {
    prompt: t`Sunlight travels along $\mathbf d = (1, 2, -2)$ (downward, since its $z$-component is negative). Each point $P = (x, y, z)$ casts a shadow on the ground $z = 0$ where the ray $P + t\mathbf d$ meets it. Find the shadow map $S:\mathbb R^3 \to \mathbb R^2$, its kernel and its range. Is it one-to-one? Onto?`,
    visual: { ...SHADOW, caption: 'The ground (blue) and the kernel line through the origin along the sunlight (orange). The point P casts its shadow S(P) along a ray parallel to it (gold dashed). Drag to rotate.' },
    steps: [
      { label: 'Find the map', text: t`The ray hits the ground when $z - 2t = 0$, so $t = z/2$. The shadow is at $(x + \tfrac12 z,\ y + z)$, so $$S(x, y, z) = (x + \tfrac12 z,\ y + z), \qquad A = \begin{bmatrix} 1 & 0 & \tfrac12 \\ 0 & 1 & 1 \end{bmatrix}.$$` },
      { label: 'Kernel', text: t`$S(\mathbf x) = \mathbf 0$ means $x = -\tfrac12 z$ and $y = -z$, with $z$ free: $\mathbf x = -\tfrac z2(1, 2, -2)$. So $\ker S$ is the line along $\mathbf d$ through the origin — every point on that ray throws its shadow onto the origin.` },
      { label: 'Range', text: t`A point already on the ground is its own shadow: $S(x, y, 0) = (x, y)$. So every ground point is reached: $\operatorname{range} S = \mathbb R^2$.` },
      { label: 'Verdict', text: t`Not one-to-one: $P$ and $P + c\,\mathbf d$ always share a shadow, because their difference lies in the kernel. Onto: yes.` },
      { label: 'Count', text: t`Three input dimensions: one is crushed (the kernel line) and two survive (the range plane), and $1 + 2 = 3$. That balance holds for every linear map — the rank–nullity theorem of LA-5.4.` },
    ],
    answer: t`$S(x, y, z) = (x + \tfrac12 z,\ y + z)$; $\ker S$ is the line along $(1, 2, -2)$; $\operatorname{range} S = \mathbb R^2$. Onto, not one-to-one.`,
  },
  practice: [
    mcq({
      id: 'in-kernel', difficulty: 1,
      prompt: t`Which vector lies in the kernel of $A = ${matTeX([[1, 2, -1], [2, 1, 1]])}$?`,
      choices: [t`$(-1, 1, 1)$`, t`$(1, 2, -1)$`, t`$(2, -1, 0)$`, t`$(1, -1, 1)$`],
      answer: 0,
      why: {
        1: t`That is row 1 of $A$. $A(1, 2, -1) = (6, 3) \ne \mathbf 0$: a row is perpendicular to the kernel, not in it.`,
        2: t`It satisfies row 1 ($2 - 2 + 0 = 0$) but not row 2 ($4 - 1 + 0 = 3$). A kernel vector must make *every* row zero.`,
        3: t`Check it: $A(1, -1, 1) = (1 - 2 - 1,\ 2 - 1 + 1) = (-2, 2)$. A sign slip — compare $(-1, 1, 1)$.`,
      },
      hints: [t`Multiply: a vector is in the kernel when $A\mathbf x = \mathbf 0$ — both rows give 0.`],
      teach: 'To test kernel membership, multiply: x is in ker A exactly when every row of A dotted with x is zero.',
      explain: t`$A(-1, 1, 1) = (-1 + 2 - 1,\ -2 + 1 + 1) = (0, 0)$. The whole kernel is the line of multiples of $(-1, 1, 1)$: geometrically, the line where the two planes $x + 2y - z = 0$ and $2x + y + z = 0$ meet.`,
      visual: rr([[1, 2, -1, 0], [2, 1, 1, 0]], { view: 2.5, solution: false, caption: 'The two rows of Ax = 0 as planes through the origin. The kernel is where they meet. Drag to rotate.' }),
    }),
    num({
      id: 'singular-kernel', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const a = r.intExcept(-2, 3, [0]), b = r.intExcept(-2, 3, [0]), c = r.pick([2, -1, 3, -2]);
          if (a === b || a === -b) continue;
          const A = [[a, b], [c * a, c * b]], m = -a / b;
          return {
            prompt: t`The map $A = ${matTeX(A)}$ squashes the plane onto a line. Its kernel is a line through the origin and $(1, m)$. Find $m$.`,
            answer: m, tol: { rel: 0, abs: 0.01 },
            errors: Math.abs(b / a - m) > 0.01 && Math.abs(b / a + m) > 0.01 ? [{ value: b / a, feedback: t`That is the slope of the row $(${a}, ${b})$ itself. The kernel is *perpendicular* to the rows: it solves $${a}x + (${b})y = 0$.` }] : [],
            hints: [t`Row 2 is ${c} times row 1, so the kernel is everything with $${a}x + (${b})y = 0$.`, t`Put $(x, y) = (1, m)$: $${a} + (${b})m = 0$.`],
            teach: 'The kernel of a squashing map of the plane is the line of inputs that every row sends to zero.',
            explain: t`$${a} + (${b})m = 0$ gives $m = ${nice(m, 4)}$. Check: $A(1, ${nice(m, 4)}) = \mathbf 0$. The picture shows the other side of the story: the range, the single line the plane collapses onto, along the column $(${a}, ${c * a})$.`,
            visual: map2d(A, { view: 3, caption: 'The map collapses the plane onto one line — its range. The kernel, the line of inputs sent to 0, is not drawn.' }),
          };
        }
        return { prompt: t`$A = \begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix}$. Kernel through $(1, m)$: $m$?`, answer: -0.5, hints: ['1 + 2m = 0.'], teach: 'Solve the row.', explain: t`$m = -\tfrac12$.` };
      },
    }),
    mcq({
      id: 'one-to-one', difficulty: 2,
      prompt: t`$T$ is a linear map from $\mathbb R^3$ to $\mathbb R^2$. Which statement is always true?`,
      choices: [t`$T$ is not one-to-one`, t`$T$ is onto $\mathbb R^2$`, t`$T$ is one-to-one if no entry of its matrix is zero`, t`The range of $T$ is a plane in $\mathbb R^3$`],
      answer: 0,
      why: {
        1: t`Not always: the zero map is linear and sends everything to $\mathbf 0$. Onto needs two independent columns.`,
        2: t`Zeros are not the issue. A $2\times3$ matrix has at most 2 pivots for 3 unknowns, so $A\mathbf x = \mathbf 0$ always has a free variable — whatever the entries.`,
        3: t`The range is made of outputs, which live in $\mathbb R^2$, not $\mathbb R^3$.`,
      },
      hints: [t`Think of $A\mathbf x = \mathbf 0$ for a $2\times3$ matrix $A$: how many pivots can it have, and how many unknowns are there?`, 'A free variable means a nonzero vector in the kernel.'],
      teach: 'A linear map from a bigger space into a smaller one always has a nonzero kernel, so it can never be one-to-one.',
      explain: t`With 3 unknowns and at most 2 pivots, $A\mathbf x = \mathbf 0$ has a free variable, so the kernel contains a whole line: some nonzero input is crushed to $\mathbf 0$, and $\mathbf x$ and $\mathbf x + \mathbf v$ (with $\mathbf v$ in the kernel) share an output. No camera can record depth this way: three coordinates in, two out.`,
      visual: { ...SHADOW, caption: 'One example, the shadow map from ℝ³ to the ground ℝ²: every point on the orange line lands on the origin. Drag to rotate.' },
    }),
    num({
      id: 'solutions-shift', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const xp = [r.int(-2, 2), r.int(-2, 2)], v = r.pick([[2, -1], [1, 2], [1, -1], [3, 1], [1, 3], [2, 1]]), s = r.intExcept(-2, 2, [0]);
          const X = xp[0] + s * v[0], ans = xp[1] + s * v[1];
          if (ans === 0 || xp[1] === 0) continue;
          return {
            prompt: t`The vector $\mathbf x_p = ${tupleTeX(xp)}$ solves $A\mathbf x = \mathbf b$, and the kernel of $A$ is the line through $\mathbf 0$ and $${tupleTeX(v)}$. Another solution has first component $x_1 = ${X}$. What is its second component?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: s * v[1], feedback: t`That point is in the kernel, so it solves $A\mathbf x = \mathbf 0$, not $A\mathbf x = \mathbf b$. Start from $\mathbf x_p$ and add a kernel vector.` }],
            hints: [t`Every solution is $\mathbf x_p + t${tupleTeX(v)}$: adding a kernel vector changes nothing, since $A(\mathbf x_p + \mathbf v) = \mathbf b + \mathbf 0$.`, t`Choose $t$ so the first component is $${X}$: $${xp[0]} + ${v[0]}t = ${X}$.`],
            teach: 'All solutions of Ax = b are one particular solution plus the kernel: the solution set is the kernel shifted to pass through xₚ.',
            explain: t`$t = ${s}$, so the solution is $${tupleTeX(xp)} + (${s})${tupleTeX(v)} = ${tupleTeX([X, ans])}$. The solutions form a line parallel to the kernel, through $\mathbf x_p$.`,
            visual: arrows2([{ to: xp, color: 'gold', width: 2.6, label: 'xₚ', labelDx: 6, labelDy: -10 }], { x: [-6.5, 6.5], y: [-4.2, 4.2], curves: [{ param: [`${v[0]}*t`, `${v[1]}*t`], t: [-4, 4], color: 'warn', dash: true, label: 'kernel', labelAt: 1.1, labelDx: 8, labelDy: 0 }], caption: 'The kernel (orange dashed) and one solution xₚ (gold). The rest of the solution set is not drawn.' }),
          };
        }
        return { prompt: t`$\mathbf x_p = (1, 1)$, kernel along $(1, 1)$. Solution with $x_1 = 3$: $x_2$?`, answer: 3, hints: ['t = 2.'], teach: 'Particular plus kernel.', explain: '(3, 3).' };
      },
    }),
    num({
      id: 'kernel-count', difficulty: 2,
      gen(r) {
        const [m, n] = r.pick([[3, 5], [2, 5], [4, 6], [2, 6], [3, 7], [4, 7]]);
        return {
          prompt: t`A linear map $T:\mathbb R^${n} \to \mathbb R^${m}$ is onto. What is the dimension of its kernel (the number of free variables in $A\mathbf x = \mathbf 0$)?`,
          answer: n - m, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: m, feedback: t`That is the dimension of the range. The kernel is what is left of the ${n} inputs.` }, ...(n !== 2 * m ? [{ value: n, feedback: 'That counts every input direction; the ones that survive into the range are not in the kernel.' }] : [])],
          hints: [t`Onto means the range is all of $\mathbb R^${m}$, so the matrix has a pivot in every one of its ${m} rows.`, t`Free variables = unknowns − pivots = $${n} - ${m}$.`],
          teach: 'Each pivot is a dimension that survives into the range; each free variable is a dimension of the kernel; together they account for every input.',
          explain: t`${m} pivots (one per row, because $T$ is onto) and ${n} unknowns leave $${n} - ${m} = ${n - m}$ free variables, so $\dim\ker T = ${n - m}$. In general $\dim\ker T + \dim\operatorname{range} T = n$ — the rank–nullity theorem (LA-5.4).`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.8, n * 0.7 + 3.2], y: [-1.1, m * 0.7 + 0.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              points: [
                ...Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => ({ x: j * 0.7, y: (m - 1 - i) * 0.7, color: 'accent', r: 5.5 }))).flat(),
                { x: ((n - 1) * 0.7) / 2, y: -0.65, r: 0.01, color: 'accent', label: `${n} columns: one per input`, labelAlign: 'center', labelDx: 0, labelDy: 0 },
                { x: n * 0.7 + 0.1, y: ((m - 1) * 0.7) / 2, r: 0.01, color: 'accent', label: `${m} rows: one per output`, labelDx: 0, labelDy: 0 },
              ],
            },
            caption: `The shape of T’s matrix: ${m} rows and ${n} columns, each dot an entry.`,
          },
        };
      },
    }),
    mcq({
      id: 'derivative-kernel', difficulty: 3,
      prompt: t`Differentiation, $D(p) = p'$, is a linear map on polynomials of degree at most 3 (because $(ap + bq)' = ap' + bq'$). What is its kernel?`,
      choices: ['The constant polynomials', t`Only the zero polynomial`, t`The polynomials of degree exactly 3`, t`The polynomials with $p(0) = 0$`],
      answer: 0,
      why: {
        1: t`The zero polynomial is in the kernel, but so is every constant: $D(5) = 0$.`,
        2: t`Those are the ones $D$ changes most. The kernel is what $D$ sends to the zero polynomial.`,
        3: t`$p(x) = x$ has $p(0) = 0$ but $D(x) = 1 \ne 0$.`,
      },
      hints: [t`Which polynomials have derivative $0$ for every $x$?`, t`What does that say about the “$+\,C$” in every antiderivative?`],
      teach: 'The kernel of d/dx is the constants, which is why antiderivatives come with + C: solutions of Dp = q are one particular p plus the kernel.',
      explain: t`$D(p) = 0$ exactly when $p$ is constant, so $\ker D = \{c\}$, a line in the space of cubics. That is the “$+\,C$”: if $D(p) = q$, every solution is $p + c$ — a particular solution plus the kernel, the same structure as $A\mathbf x = \mathbf b$. LA-6.2 writes $D$ as a $4\times4$ matrix.`,
      visual: { type: 'graph', params: { x: [-2, 2.2], y: [-2, 3.4], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [-1, 0, 1, 2].map((c, k) => ({ fn: `x^3/3 - x + ${c}`, color: ['accent', 'warn', 'good', 'violet'][k], width: 2 })) }, caption: 'Four cubics that differ only by a constant. They have the same derivative at every x — their differences are in the kernel of D.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-kernel-vec', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const r1 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)], r2 = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
          const n = cross(r1, r2);
          if (n.some((z) => z === 0) || n.some((z) => Math.abs(z) > 9) || (r1[1] === 0 && r2[1] === 0)) continue;
          return {
            prompt: t`The vector $(${n[0]}, c, ${n[2]})$ lies in the kernel of $A = ${matTeX([r1, r2])}$. Find $c$.`,
            answer: n[1], tol: { rel: 0, abs: 0.01 },
            hints: [t`Kernel means $A\mathbf x = \mathbf 0$: write the row ${r1[1] !== 0 ? 1 : 2} equation with $\mathbf x = (${n[0]}, c, ${n[2]})$ and solve for $c$.`],
            teach: 'A vector is in the kernel when every row of the matrix dotted with it gives zero.',
            explain: t`Row ${r1[1] !== 0 ? 1 : 2} gives $c = ${n[1]}$, and the other row checks: $A(${n[0]}, ${n[1]}, ${n[2]}) = (0, 0)$. The kernel is the whole line of multiples of $(${n.join(', ')})$.`,
            visual: rr([[...r1, 0], [...r2, 0]], { view: 2.5, solution: false, caption: 'The two rows of Ax = 0 as planes through the origin; the kernel is the line where they meet. Drag to rotate.' }),
          };
        }
        return { prompt: t`$(1, c, 1)$ is in the kernel of $\begin{bmatrix} 1 & 1 & -2 \end{bmatrix}$. Find $c$.`, answer: 1, hints: ['1 + c − 2 = 0.'], teach: 'Dot with each row.', explain: t`$c = 1$.` };
      },
    }),
    mcq({
      id: 'cp-onto', difficulty: 2,
      prompt: t`For which matrix $A$ is the map $\mathbf x \mapsto A\mathbf x$ onto $\mathbb R^2$?`,
      choices: [t`$\begin{bmatrix} 1 & 2 & 0 \\ 0 & 0 & 1 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & 2 & 3 \\ 2 & 4 & 6 \end{bmatrix}$`, t`$\begin{bmatrix} 1 & 2 \\ 2 & 4 \end{bmatrix}$`, t`$\begin{bmatrix} 1 \\ 2 \end{bmatrix}$`],
      answer: 0,
      why: {
        1: t`Every column is a multiple of $(1, 2)$, so the range is only the line through $(1, 2)$. Three columns do not help if they all point the same way.`,
        2: t`Column 2 is twice column 1: the range is the line through $(1, 2)$, not the whole plane.`,
        3: t`One column spans only a line. Reaching all of $\mathbb R^2$ needs two independent columns.`,
      },
      hints: ['The range is the span of the columns. Which matrix has two columns pointing in different directions?'],
      teach: 'A map is onto ℝᵐ exactly when its columns span ℝᵐ — a pivot in every row.',
      explain: t`Columns $(1, 0)$ and $(0, 1)$ of the first matrix already span the plane, so every $\mathbf b$ is reached (the middle column is redundant). In the others every column lies on the line through $(1, 2)$.`,
      visual: arrows2([{ to: [1, 2], color: 'warn', label: '(1, 2)', labelDx: 6, labelDy: -8 }, { to: [2, 4], color: 'warn', dash: true }, { to: [1, 0], color: 'accent', label: '(1, 0)', labelDx: 4, labelDy: 12 }, { to: [0, 1], color: 'accent', label: '(0, 1)', labelDx: -40, labelDy: -4 }], { x: [-2.5, 5.5], y: [-0.8, 4.4], caption: 'Some of the columns that appear among the choices: (1, 2) and its multiple (2, 4) lie on one line; (1, 0) and (0, 1) do not.' }),
    }),
    num({
      id: 'cp-accel', difficulty: 3, transfer: true,
      gen(r) {
        for (let k = 0; k < 100; k++) {
          const a = r.intExcept(-2, 2, [0]), b = r.intExcept(-2, 2, [0]);
          const u1 = [1, 0, a], u2 = [0, 1, b], u3 = [1, 1, a + b];
          if (a + b === 0) continue;
          const ask = r.int(0, 1), ans = ask === 0 ? -a : -b;
          return {
            prompt: t`A cubesat carries three single-axis accelerometers. Each reads the component of the acceleration $\mathbf a$ along its own axis, so the readings are $\mathbf r = H\mathbf a$, with the axes as the rows of $H$. A mounting error has put the axes along $${tupleTeX(u1)}$, $${tupleTeX(u2)}$ and $${tupleTeX(u3)}$ — all in one plane. Some accelerations give all-zero readings. They point along $(p, q, 1)$: find ${ask ? '$q$' : '$p$'}.`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            hints: [t`The invisible accelerations are the kernel of $H$: perpendicular to every sensing axis.`, t`A vector perpendicular to the first two axes is their cross product, $${tupleTeX(u1)}\times${tupleTeX(u2)}$; the third axis is their sum, so it adds no new condition.`],
            teach: 'The kernel of a measurement matrix is the set of states the instrument cannot see.',
            explain: t`$${tupleTeX(u1)}\times${tupleTeX(u2)} = ${tupleTeX(cross(u1, u2))}$, so $p = ${-a}$ and $q = ${-b}$. Any acceleration along that normal to the sensors’ plane reads zero on all three — the instrument is blind to it. That is why an inertial measurement unit mounts its accelerometers on three mutually perpendicular axes, and why redundant units with more sensors keep any three of them out of a common plane.`,
            visual: { type: 'calc-vectors3d', params: { range: 2.6, vectors: [{ to: u1, color: 'accent', label: '1' }, { to: u2, color: 'warn', label: '2' }, { to: u3, color: 'good', label: '3' }], parallelograms: [{ at: [0, 0, 0], u: u1, v: u2, color: 'violet', alpha: 0.16 }] }, caption: 'The three sensing axes and the plane they all lie in (violet). Drag to rotate.' },
          };
        }
        return { prompt: t`Axes $(1, 0, 1)$, $(0, 1, 1)$, $(1, 1, 2)$. Blind direction $(p, q, 1)$: $p$?`, answer: -1, hints: ['Cross product of the first two.', '(−1, −1, 1).'], teach: 'Kernel = blind directions.', explain: t`$p = -1$.` };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.1–8.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Lay, Lay & McDonald, Linear Algebra and Its Applications (6th ed.), §1.9 and §4.2', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203' },
  ],
});
