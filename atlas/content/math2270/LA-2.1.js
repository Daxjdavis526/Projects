// Systems of linear equations as one matrix equation: the augmented matrix,
// and the row and column pictures of the same system.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { inverse, augTeX, sysTeX, eqText, eqTeX, tupleTeX, lines2, planes3, map2d, rr } from './_la.js';

const t = String.raw;

// Explore: x + y + z = 2, y + 2z = 1, x + 2y + 4z = b₃ (det A = 1, so A⁻¹ is whole numbers)
const A0 = [[1, 1, 1], [0, 1, 2], [1, 2, 4]];
const AI = inverse(A0).map((row) => row.map((v) => Math.round(v)));
const solExpr = (i) => `(${AI[i][0]})*2 + (${AI[i][1]})*1 + (${AI[i][2]})*b3`;
const COLS = [0, 1, 2].map((j) => A0.map((row) => row[j]));
const sc = (j, x) => COLS[j].map((v) => `(${v})*(${x})`);
const sumv = (...vs) => [0, 1, 2].map((k) => vs.map((v) => v[k]).join(' + '));

// a random 3×3 system with a whole-number solution, every equation using at least two unknowns
function system(r) {
  for (let k = 0; k < 200; k++) {
    const A = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-3, 4)));
    if (A.some((row) => row.filter((v) => v !== 0).length < 2)) continue;
    const x = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
    return A.map((row) => [...row, row.reduce((s, v, j) => s + v * x[j], 0)]);
  }
  return [[2, -1, 3, 6], [-1, 1, -4, -5], [1, 0, 5, 7]];
}
const ORD = ['first', 'second', 'third'];

export default lesson({
  id: 'math2270.LA-2.1',
  title: 'Systems of equations as matrices',
  minutes: 9, difficulty: 2,
  equation: t`A\mathbf x = \mathbf b`,
  intro: t`A system of $m$ linear equations in $n$ unknowns is one matrix equation. Line up the coefficients in a matrix $A$, the unknowns in $\mathbf x$ and the right-hand sides in $\mathbf b$. The **augmented matrix** $[A \mid \mathbf b]$ is the whole system with the letters stripped off:

$$\begin{aligned} x + 2y &= 5 \\ 3x - y &= 1 \end{aligned} \qquad\Longleftrightarrow\qquad \left[\begin{array}{rr|r} 1 & 2 & 5 \\ 3 & -1 & 1 \end{array}\right]$$

Read by **rows**, each equation is a line (a plane, with three unknowns) and a solution is a point on all of them. Read by **columns**, the system asks for the weights that combine the columns of $A$ into $\mathbf b$. Either way there are only three possibilities: no solution, exactly one, or infinitely many.`,
  symbols: [
    { tex: 'A', text: t`the coefficient matrix, $m \times n$: row $i$ holds the coefficients of equation $i$, column $j$ those of the $j$-th unknown` },
    { tex: t`a_{ij}`, text: t`the entry in row $i$, column $j$ — the coefficient of the $j$-th unknown in equation $i$ (row first, then column)` },
    { tex: t`\mathbf x`, text: t`the column of the $n$ unknowns, $(x_1, \dots, x_n)$ or $(x, y, z)$` },
    { tex: t`\mathbf b`, text: t`the column of the $m$ right-hand sides` },
    { tex: t`[A \mid \mathbf b]`, text: t`the augmented matrix: $A$ with $\mathbf b$ attached as a last column, after a bar` },
  ],
  why: t`Writing a system as $A\mathbf x = \mathbf b$ turns “solve these equations” into a question about one object, the matrix $A$ — which is how a computer handles a million equations as easily as three.`,
  visual: {
    type: 'calc-vectors3d',
    title: 'One system, two pictures',
    lead: t`The system $x + y + z = 2$, $y + 2z = 1$, $x + 2y + 4z = b_3$. In the **row picture** each equation is a plane and the solution is the one point on all three. In the **column picture** the same three numbers are weights: $x\mathbf a_1 + y\mathbf a_2 + z\mathbf a_3$, tip to tail, lands on $\mathbf b$.`,
    tasks: [
      'Turn the row picture: the three planes meet at one gold point. Its coordinates (readout) are the solution.',
      'Switch to the column picture: the same numbers now stretch the three columns, which stack tip to tail onto b.',
      'Slide b₃: the third plane slides parallel to itself, and the solution — and the weights — move with it.',
    ],
    params: {
      range: 4,
      choices: [{ key: 'pic', label: 'Picture', options: [[1, 'Rows: three planes'], [0, 'Columns: a combination']], value: 1 }],
      sliders: [{ key: 'b3', label: t`Right-hand side $b_3$`, min: 1, max: 6, step: 0.5, value: 4, explain: t`The constant in the third equation, $x + 2y + 4z = b_3$.` }],
      planes: [
        { normal: [1, 1, 1], d: 2, size: 2.4, color: 'accent', alpha: 0.22, label: 'R_1', when: 'pic' },
        { normal: [0, 1, 2], d: 1, size: 2.4, color: 'warn', alpha: 0.22, label: 'R_2', when: 'pic' },
        { normal: [1, 2, 4], d: 'b3', size: 2.4, color: 'good', alpha: 0.22, label: 'R_3', when: 'pic' },
      ],
      points: [{ at: [solExpr(0), solExpr(1), solExpr(2)], color: 'gold', when: 'pic' }],
      vectors: [
        { to: sc(0, solExpr(0)), color: 'accent', label: t`x\mathbf a_1`, when: '1 - pic' },
        { from: sc(0, solExpr(0)), to: sumv(sc(0, solExpr(0)), sc(1, solExpr(1))), color: 'warn', label: t`y\mathbf a_2`, when: '1 - pic' },
        { from: sumv(sc(0, solExpr(0)), sc(1, solExpr(1))), to: [2, 1, 'b3'], color: 'good', label: t`z\mathbf a_3`, when: '1 - pic' },
        { to: [2, 1, 'b3'], color: 'gold', label: t`\mathbf b`, when: '1 - pic' },
      ],
      readouts: [{ label: '$(x, y, z)$', vec: [solExpr(0), solExpr(1), solExpr(2)] }],
    },
    caption: 'Row picture: square patches of three planes (they go on for ever). Column picture: x·a₁ + y·a₂ + z·a₃ tip to tail, reaching b. Drag to rotate.',
  },
  example: {
    prompt: t`Write this system as an augmented matrix, and check whether $(x, y, z) = (2, 1, 1)$ solves it:
$$2x - y + 3z = 6,\qquad y - 4z = x - 5,\qquad 5z + x = 7.$$`,
    visual: rr([[2, -1, 3, 6], [-1, 1, -4, -5], [1, 0, 5, 7]], { solution: true, caption: 'The augmented matrix and its three planes (square patches; drag to rotate). The gold point is on all three.' }),
    steps: [
      { label: 'Unknowns left, in order', text: t`Move every unknown to the left and write them in the same order, $x, y, z$: the second equation becomes $-x + y - 4z = -5$, the third $x + 5z = 7$.` },
      { label: 'Fill the gaps with zeros', text: t`The third equation has no $y$: its coefficient is $0$, and the 0 must be written, or the columns slip out of line.` },
      { label: 'The augmented matrix', text: t`$$\left[\begin{array}{rrr|r} 2 & -1 & 3 & 6 \\ -1 & 1 & -4 & -5 \\ 1 & 0 & 5 & 7 \end{array}\right]$$` },
      { label: 'Check by columns', text: t`$2\begin{bmatrix} 2 \\ -1 \\ 1 \end{bmatrix} + 1\begin{bmatrix} -1 \\ 1 \\ 0 \end{bmatrix} + 1\begin{bmatrix} 3 \\ -4 \\ 5 \end{bmatrix} = \begin{bmatrix} 6 \\ -5 \\ 7 \end{bmatrix} = \mathbf b.$ ✓` },
      { label: 'Same check by rows', text: t`$2(2) - 1 + 3 = 6$, $\;-2 + 1 - 4 = -5$, $\;2 + 0 + 5 = 7$. Both readings of $A\mathbf x$ agree, as they must.` },
    ],
    answer: t`$[A \mid \mathbf b]$ as above, and $(2, 1, 1)$ is a solution.`,
  },
  practice: [
    mcq({
      id: 'aug-matrix', difficulty: 1,
      prompt: t`Which augmented matrix represents the system $\;x + 3z = 4,\;\; 2y - x = 1,\;\; z - y + 2x = 0\;$ (unknowns in the order $x, y, z$)?`,
      choices: [[[1, 0, 3, 4], [-1, 2, 0, 1], [2, -1, 1, 0]], [[1, 3, 0, 4], [-1, 2, 0, 1], [2, -1, 1, 0]], [[1, 0, 3, 4], [2, -1, 0, 1], [1, -1, 2, 0]], [[1, -1, 2, 4], [0, 2, -1, 1], [3, 0, 1, 0]]].map((M) => `$${augTeX(M)}$`),
      answer: 0,
      why: {
        1: t`In the first row the 3 multiplies $z$, so it belongs in the third column; the missing $y$ gets a 0.`,
        2: t`Those coefficients are in the order the terms are written. Each column belongs to one unknown: $x$, then $y$, then $z$.`,
        3: 'That is the coefficient matrix flipped across its diagonal (rows and columns swapped). Row i must hold equation i.',
      },
      hints: ['Rewrite each equation with x first, then y, then z, writing 0 for a missing unknown.', t`The second equation is $-x + 2y + 0z = 1$.`],
      teach: 'Every column of the coefficient matrix belongs to one unknown, so terms must be put in the same order in every equation, with zeros for missing unknowns.',
      explain: t`The rows are $(1, 0, 3 \mid 4)$, $(-1, 2, 0 \mid 1)$ and $(2, -1, 1 \mid 0)$.`,
      visual: planes3([[1, 0, 3, 4], [-1, 2, 0, 1], [2, -1, 1, 0]], { range: 3, size: 2.6, centre: [0.4, 0.7, 1.2] }),
    }),
    num({
      id: 'entry-aij', difficulty: 1,
      gen(r) {
        let M, i, j;
        for (let k = 0; k < 200; k++) {
          M = system(r); i = r.int(0, 2); j = r.int(0, 2);
          if (i !== j && M[i][j] !== M[j][i] && M[i][j] !== 0) break;
        }
        return {
          prompt: t`For the system
$$${sysTeX(M)}$$
with unknowns in the order $x, y, z$, what is the entry $a_{${i + 1}${j + 1}}$ of the coefficient matrix?`,
          answer: M[i][j], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: M[j][i], feedback: t`That is $a_{${j + 1}${i + 1}}$. The first index is the row (the equation), the second the column (the unknown).` }],
          hints: [t`$a_{ij}$ sits in row $i$, column $j$: equation ${i + 1}, unknown number ${j + 1}.`, t`Look at equation ${i + 1} and find the coefficient of ${['x', 'y', 'z'][j]}.`],
          teach: t`In $a_{ij}$ the first index names the row (the equation) and the second the column (the unknown).`,
          explain: t`Equation ${i + 1} is $${eqTeX(M[i])}$; the coefficient of $${['x', 'y', 'z'][j]}$ there is $${M[i][j]}$.`,
          visual: planes3(M, { range: 3, size: 2.4, centre: inverseCentre(M), caption: 'The three equations as planes (square patches of each). Drag to rotate.' }),
        };
      },
    }),
    mcq({
      id: 'how-many', difficulty: 3,
      prompt: t`How many solutions does the system $\;2x + 3y = 6,\;\; 4x + 6.2y = 5\;$ have?`,
      choices: ['Exactly one', 'None: the lines are parallel', 'Infinitely many', 'Exactly two'],
      answer: 0,
      why: {
        1: t`They look parallel in this window, but their slopes are $-2/3 \approx -0.667$ and $-4/6.2 \approx -0.645$: different slopes always cross — here far outside the picture.`,
        2: 'Infinitely many needs the two equations to describe the same line: one a multiple of the other, right-hand sides included.',
        3: 'Two straight lines cannot cross twice. A linear system has no solution, exactly one, or infinitely many.',
      },
      hints: ['Do not trust the picture: compare the coefficients.', t`Is $(4, 6.2)$ a multiple of $(2, 3)$? $4 = 2\cdot2$, but $6.2 \ne 2\cdot3$.`],
      teach: 'Two lines in the plane are parallel only when their coefficient rows are multiples of each other; any other pair crosses exactly once.',
      explain: t`The coefficients are not proportional, so the lines cross once. Solving gives $y = -35$, $x = 55.5$ — far off the picture, which is why it looks like no solution. With a coefficient of exactly 6 the lines would be parallel and there would be none.`,
      visual: lines2([[2, 3, 6], [4, 6.2, 5]], { x: [-5, 5], y: [-3, 3.5], caption: 'The two lines near the origin. A picture shows only a window: these may still meet far outside it.' }),
    }),
    mcq({
      id: 'column-picture', difficulty: 2,
      prompt: t`In the column picture, the system $\;x + 2y = 5,\;\; 3x - y = 1\;$ asks for numbers $x$ and $y$ such that:`,
      choices: [
        t`$x\begin{bmatrix} 1 \\ 3 \end{bmatrix} + y\begin{bmatrix} 2 \\ -1 \end{bmatrix} = \begin{bmatrix} 5 \\ 1 \end{bmatrix}$`,
        t`$x\begin{bmatrix} 1 \\ 2 \end{bmatrix} + y\begin{bmatrix} 3 \\ -1 \end{bmatrix} = \begin{bmatrix} 5 \\ 1 \end{bmatrix}$`,
        t`$5\begin{bmatrix} 1 \\ 3 \end{bmatrix} + 1\begin{bmatrix} 2 \\ -1 \end{bmatrix} = \begin{bmatrix} x \\ y \end{bmatrix}$`,
        t`$x\begin{bmatrix} 1 \\ 3 \end{bmatrix} + y\begin{bmatrix} 2 \\ -1 \end{bmatrix} + \begin{bmatrix} 5 \\ 1 \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix}$`,
      ],
      answer: 0,
      why: {
        1: t`Those vectors are the **rows** of the coefficient matrix. A column holds one unknown's coefficients from every equation: $x$ appears as $1$ and $3$.`,
        2: 'That mixes up the right-hand side with the unknowns: 5 and 1 are given, x and y are the weights to be found.',
        3: t`Moving $\mathbf b$ to the left changes its sign: this says $x\mathbf a_1 + y\mathbf a_2 = -\mathbf b$.`,
      },
      hints: ['Collect the coefficients of x from both equations into one column, and those of y into another.', t`The column for $x$ is $(1, 3)$; the column for $y$ is $(2, -1)$.`],
      teach: 'In the column picture the unknowns are the weights on the columns of the coefficient matrix, and the combination must equal the right-hand side.',
      explain: t`$x(1, 3) + y(2, -1) = (5, 1)$. Here $x = 1$, $y = 2$: $(1, 3) + (4, -2) = (5, 1)$.`,
      visual: map2d([[1, 2], [3, -1]], { shape: 'none', ghost: false, colNames: ['a₁', 'a₂'], target: [5, 1], view: 3.6, caption: 'The two columns of the coefficient matrix and the target b (red ring), with the grid of whole-number combinations.' }),
    }),
    mcq({
      id: 'planes-meet', difficulty: 2,
      prompt: t`How many solutions does this system have?
$$x + y + z = 2,\qquad x - y + z = 0,\qquad 2x + 2z = 2$$`,
      choices: ['Infinitely many (a whole line of them)', 'Exactly one', 'None', 'Exactly three — one for each pair of planes'],
      answer: 0,
      why: {
        1: 'Three planes usually meet at a single point, but here the third equation is the sum of the first two, so it adds no new condition.',
        2: 'The equations are consistent: (0, 1, 1) solves all three.',
        3: 'Three planes share a single point, a line, a plane — or nothing. They never share exactly three points.',
      },
      hints: ['Add the first two equations. What do you get?', t`$(x + y + z) + (x - y + z) = 2x + 2z$ and $2 + 0 = 2$: the third equation is the sum of the first two.`],
      teach: 'An equation that is a combination of the others adds no information: three planes can then share a whole line.',
      explain: t`Equation 3 = equation 1 + equation 2, so only two independent conditions remain. Two planes that are not parallel meet in a line: here $y = 1$ and $x + z = 1$, so the solutions are $(t, 1, 1 - t)$ for every number $t$.`,
      visual: planes3([[1, 1, 1, 2], [1, -1, 1, 0], [2, 0, 2, 2]], { range: 3, size: 2.4, centre: [0.5, 1, 0.5], caption: 'The three planes (square patches; they go on for ever). Drag to rotate and see how they meet.' }),
    }),
    expr({
      id: 'write-eq', difficulty: 2,
      gen(r) {
        const M = system(r), i = r.int(0, 2), row = M[i];
        const flipped = [...row.slice(0, 3), -row[3]];
        return {
          prompt: t`Write the ${ORD[i]} equation of the system whose augmented matrix is shown, with unknowns $x$, $y$, $z$.`,
          answer: eqText(row), answerTeX: eqTeX(row),
          vars: { x: [-2, 2], y: [-2, 2], z: [-2, 2] }, mode: 'equation',
          errors: row[3] !== 0 ? [{ answer: eqText(flipped), feedback: 'Check the right-hand side: the entry after the bar is the constant on the right of the equals sign, sign and all.' }] : [],
          hints: [t`Row ${i + 1} holds the coefficients of $x$, $y$ and $z$, then (after the bar) the right-hand side.`, t`Row ${i + 1} is $(${row.slice(0, 3).join(', ')} \mid ${row[3]})$.`],
          teach: 'Each row of an augmented matrix is one equation: coefficients in the unknowns’ order, then the right-hand side.',
          explain: t`Row ${i + 1} reads $${eqTeX(row)}$.`,
          visual: rr(M, { caption: 'The augmented matrix, with its three equations drawn as planes. Drag the picture to rotate.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-entry', difficulty: 2,
      gen(r) {
        const c = [r.intExcept(-4, 5, [0, 1]), r.intExcept(-4, 5, [0]), r.intExcept(-4, 5, [0])], k = r.intExcept(-6, 6, [0]);
        // equation 2 is written as  c₀y − c₁z = c₂x + k  (unknowns on both sides, out of order)
        const ans = -c[2];
        return {
          prompt: t`The second equation of a system is written $\;${c[0]}y ${c[1] < 0 ? '+' : '-'} ${Math.abs(c[1])}z = ${c[2]}x ${k < 0 ? '-' : '+'} ${Math.abs(k)}$. With the unknowns in the order $x, y, z$, what is $a_{21}$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: c[2], feedback: t`Move $${c[2]}x$ to the left first: it changes sign.` }, ...(c[0] !== ans && c[0] !== c[2] ? [{ value: c[0], feedback: t`That is the coefficient of $y$, which is $a_{22}$. $a_{21}$ is the coefficient of the first unknown, $x$.` }] : [])],
          hints: ['Move every unknown to the left-hand side first.', t`$a_{21}$ is the coefficient of $x$ (column 1) in equation 2.`],
          teach: 'Coefficients are read only after every unknown has been moved to the left-hand side.',
          explain: t`Moving $${c[2]}x$ to the left gives $${eqTeX([-c[2], c[0], -c[1], k])}$, so $a_{21} = ${-c[2]}$.`,
          visual: planes3([[1, 1, 1, 3], [-c[2], c[0], -c[1], k], [2, -1, 1, 1]], { range: 3, size: 2.4, centre: [0.8, 1, 1.2], caption: 'Equation 2 (orange) with two other planes of the system. Drag to rotate.' }),
        };
      },
    }),
    num({
      id: 'cp-propellant', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([12000, 18000, 24000, 30000]), ratio = r.pick([2.2, 2.3, 2.4, 2.6]);
        const f = M / (1 + ratio), o = M - f;
        return {
          prompt: t`An upper stage burning kerosene and liquid oxygen is loaded with ${M.toLocaleString('en-US')} kg of propellant at a mixture ratio of ${ratio} — that is, ${ratio} kg of oxidiser for every 1 kg of fuel. Set up two equations for the fuel mass $f$ and oxidiser mass $o$, and solve them. How much fuel is loaded, in kg?`,
          answer: f, units: 'kg', tol: { rel: 0.005 },
          errors: [{ value: M / ratio, feedback: t`Dividing the total by ${ratio} forgets that the total includes the fuel too: $o + f = ${M}$ with $o = ${ratio}f$ gives $${nice(1 + ratio)}f = ${M}$.` }, { value: o, feedback: 'That is the oxidiser mass. The question asks for the fuel.' }],
          hints: [t`One equation is the total, $o + f = ${M}$; the other is the ratio, $o = ${ratio}f$, or $o - ${ratio}f = 0$.`, t`Substitute: $${ratio}f + f = ${M}$.`],
          teach: 'A word problem becomes a linear system one condition at a time: here, a total and a ratio.',
          explain: t`$o + f = ${M}$ and $o - ${ratio}f = 0$, so $${nice(1 + ratio)}f = ${M}$: $f = ${nice(f, 4)}$ kg of fuel and $o = ${nice(o, 4)}$ kg of oxidiser. Kerosene–oxygen engines run near ratios of 2.2–2.7, richer in fuel than the 3.4 that burning all the fuel completely would need: a fuel-rich exhaust of lighter molecules gives a higher exhaust speed and a cooler chamber.`,
          visual: lines2([[1, 1, M / 1000], [-ratio, 1, 0]], { x: [0, M / 1000], y: [0, M / 1000], names: ['total', 'ratio'], xlabel: 'f (t)', ylabel: 'o (t)', caption: 'The two conditions as lines, in tonnes (1 t = 1000 kg): fuel along, oxidiser up. The solution is where they cross.' }),
        };
      },
    }),
    mcq({
      id: 'cp-coplanar', difficulty: 2,
      prompt: t`The three columns of a $3 \times 3$ matrix $A$ all lie in one plane through the origin, and $\mathbf b$ does not lie in that plane. How many solutions does $A\mathbf x = \mathbf b$ have?`,
      choices: ['None', 'Exactly one', 'Infinitely many', 'Three, one per column'],
      answer: 0,
      why: {
        1: 'Exactly one would need the columns to reach every point of space, but every combination of them stays in their plane.',
        2: t`There would be infinitely many if $\mathbf b$ were *in* the plane. Off it, no weights at all will do.`,
        3: 'A linear system has no solution, one, or infinitely many — never exactly three.',
      },
      hints: ['In the column picture a solution is a set of weights combining the columns into b.', 'Where do all combinations of three vectors in one plane end up?'],
      teach: 'Ax = b has a solution exactly when b is a combination of the columns of A.',
      explain: t`Every combination $x_1\mathbf a_1 + x_2\mathbf a_2 + x_3\mathbf a_3$ lies in the plane of the columns, so a $\mathbf b$ outside it can never be reached.`,
      visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: [2, 0, 1], color: 'accent', label: t`\mathbf a_1` }, { to: [0, 2, 1], color: 'warn', label: t`\mathbf a_2` }, { to: [1, 1, 1], color: 'good', label: t`\mathbf a_3` }, { to: [1, -1, 2.5], color: 'gold', label: t`\mathbf b` }], planes: [{ normal: [-1, -1, 2], d: 0, size: 2.6, color: 'violet', alpha: 0.18 }] }, caption: 'Three columns lying in the violet plane, and b. Drag to rotate.' },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §2.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 1: The geometry of linear equations', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});

// the solution of a random system (for centring its plane patches), or the origin if it is singular
function inverseCentre(M) {
  const A = M.map((row) => row.slice(0, 3)), b = M.map((row) => row[3]);
  const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  if (Math.abs(det) < 1e-9) return [0, 0, 0];
  return inverse(A).map((row) => row.reduce((s, v, k) => s + v * b[k], 0));
}
