// Reduced row echelon form (Gauss–Jordan), free variables and the complete
// solution set in parametric vector form.
import { lesson, mcq, num } from '../../src/core/content.js';
import { augTeX, matTeX, colTeX, tupleTeX, rr, planes3 } from './_la.js';

const t = String.raw;
const LINE = [[1, 2, -1, 3], [2, 4, 1, 9], [3, 6, 0, 12]];
const NONE = [[1, 2, -1, 3], [2, 4, 1, 9], [3, 6, 0, 13]];
const ONE = [[2, 4, -2, 2], [4, 9, -3, 8], [-2, -3, 7, 10]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export default lesson({
  id: 'math2270.LA-2.3',
  title: 'Reduced row echelon form and solution sets',
  minutes: 11, difficulty: 3,
  intro: t`**Gauss–Jordan elimination** keeps going past echelon form: scale every pivot to 1 and clear the entries *above* each pivot too. The result, the **reduced row echelon form** (RREF), is unique — every sequence of row operations ends at the same matrix — and the solution set can be read straight off it. Columns with a pivot belong to **basic** variables; the others hold **free** variables, which may take any value. A row $[\,0 \cdots 0 \mid c\,]$ with $c \ne 0$ says $0 = c$: no solution. Otherwise every solution is

$$\mathbf x = \mathbf x_p + t_1\mathbf v_1 + \dots + t_k\mathbf v_k$$

one particular solution plus any combination of solutions of $A\mathbf x = \mathbf 0$: a point, a line, a plane, …`,
  symbols: [
    { tex: t`\mathbf x_p`, text: t`a **particular** solution — the one found by setting every free variable to 0` },
    { tex: t`t_1, \dots, t_k`, text: 'the free variables, renamed as parameters: any real numbers at all' },
    { tex: t`\mathbf v_1, \dots, \mathbf v_k`, text: t`direction vectors, one per free variable; each solves $A\mathbf v = \mathbf 0$` },
    { tex: 'k', text: 'the number of free variables: unknowns minus pivots' },
    { tex: t`\text{pivot}`, text: 'in RREF, a 1 that is the first nonzero entry of its row and the only nonzero entry of its column' },
  ],
  why: 'Counting pivots tells you, before solving anything, whether a system has no solution, one, or infinitely many — that count, the rank, organizes all of LA-5.',
  visual: {
    type: 'la-rowreduce',
    title: 'A point, a line, or nothing',
    lead: t`Three systems with three unknowns, reduced all the way to RREF. Step through each and watch the last row: it decides everything. The gold mark is the solution set — a point, a line, or nothing at all.`,
    tasks: [
      'In “A line of solutions”, step to the end: row 3 becomes all zeros, and the y column has no pivot — y is free.',
      'Read the answer off the RREF: x = 4 − 2y and z = 1, for any y. The gold line is every such point.',
      'Switch to “No solution”: only the last right-hand side differs, and the last row ends as 0 = 1 — the planes share no point.',
    ],
    params: { systems: [{ label: 'A line of solutions', M: LINE }, { label: 'No solution', M: NONE }, { label: 'One solution', M: ONE }], mode: 'rref', view: 3.5 },
    caption: 'Exact fractions throughout. Planes are square patches around the solution (or around the origin when there is none); they go on for ever. Drag the picture to rotate it.',
  },
  example: {
    prompt: t`Find every solution of
$$x + 2y - z = 3,\qquad 2x + 4y + z = 9,\qquad 3x + 6y = 12.$$`,
    visual: rr(LINE, { mode: 'rref', step: 5, solution: true, view: 3.5, caption: 'The RREF has two nonzero rows: two planes, meeting in the gold line of solutions. The zero row is no plane at all. Drag the picture to rotate.' }),
    steps: [
      { label: 'Forward', text: t`$R_2 \leftarrow R_2 - 2R_1$ and $R_3 \leftarrow R_3 - 3R_1$ both give $(0, 0, 3 \mid 3)$; then $R_3 \leftarrow R_3 - R_2$ leaves a row of zeros. Column 2 has no pivot: the next pivot is the 3 in column 3.` },
      { label: 'Backward', text: t`Scale $R_2 \leftarrow \tfrac13 R_2$ to get $(0, 0, 1 \mid 1)$, then clear above it: $R_1 \leftarrow R_1 + R_2$ gives $(1, 2, 0 \mid 4)$.
$$${augTeX([[1, 2, 0, 4], [0, 0, 1, 1], [0, 0, 0, 0]])}$$` },
      { label: 'Read it', text: t`Pivots sit in the $x$ and $z$ columns; $y$ is free. The rows say $x + 2y = 4$ and $z = 1$; the zero row says $0 = 0$, no condition at all.` },
      { label: 'Parametric form', text: t`Call the free variable $y = t$. Then $x = 4 - 2t$, $y = t$, $z = 1$:
$$\mathbf x = ${colTeX([4, 0, 1])} + t${colTeX([-2, 1, 0])}.$$` },
      { label: 'Check', text: t`$t = 0$ gives $(4, 0, 1)$: $4 + 0 - 1 = 3$ ✓. And $A(-2, 1, 0) = (-2 + 2,\ -4 + 4,\ -6 + 6) = \mathbf 0$ ✓, so adding any multiple of it never breaks a solution.` },
    ],
    answer: t`$\mathbf x = (4, 0, 1) + t(-2, 1, 0)$ for every real $t$: a line of solutions.`,
  },
  practice: [
    mcq({
      id: 'is-rref', difficulty: 1,
      prompt: 'Which augmented matrix is in reduced row echelon form?',
      choices: [[[1, 0, 2, 3], [0, 1, -1, 4], [0, 0, 0, 0]], [[1, 0, 2, 3], [0, 2, -1, 4], [0, 0, 0, 0]], [[1, 3, 2, 3], [0, 1, -1, 4], [0, 0, 0, 0]], [[1, 0, 2, 3], [0, 0, 0, 0], [0, 1, -1, 4]]].map((M) => `$${augTeX(M)}$`),
      answer: 0,
      why: {
        1: 'In RREF every pivot is 1: scale row 2 by ½.',
        2: 'The 3 above the second pivot must be cleared too — that is what “reduced” adds to echelon form.',
        3: 'A zero row must sit at the bottom.',
      },
      hints: ['RREF is echelon form plus two rules: every pivot is 1, and each pivot is the only nonzero entry in its column.', 'Check each pivot column for other nonzero entries, above as well as below.'],
      teach: 'RREF: a staircase of pivots, each equal to 1 and alone in its column, with zero rows at the bottom.',
      explain: 'Pivots 1 and 1 in columns 1 and 2, each alone in its column, and the zero row at the bottom. The third column has no pivot: its unknown is free.',
    }),
    mcq({
      id: 'read-none', difficulty: 2,
      prompt: t`A system reduces to this RREF. What does it say about the solutions?
$$${augTeX([[1, 0, 3, 2], [0, 1, -1, 5], [0, 0, 0, 4]])}$$`,
      choices: ['There are none', t`Exactly one: $(x, y, z) = (2, 5, 4)$`, t`Infinitely many, because $z$ is free`, t`Exactly one, with $z = 0$`],
      answer: 0,
      why: {
        1: 'The last column holds right-hand sides, not the answer; and the last row is not a condition on z.',
        2: 'z would be free if the system were consistent — but the last row rules out every point.',
        3: 'Setting a variable to 0 cannot rescue the row 0x + 0y + 0z = 4: it fails for every point.',
      },
      hints: ['Write the last row as an equation.', t`It reads $0x + 0y + 0z = 4$.`],
      teach: 'A row of zeros ending in a nonzero number means 0 = c: the system is inconsistent, whatever else the matrix says.',
      explain: t`The third row says $0 = 4$, which no point satisfies, so the system has no solution. Only rows of all zeros, $0 = 0$, may be ignored.`,
      visual: rr([[1, 0, 3, 2], [0, 1, -1, 5], [0, 0, 0, 4]], { view: 3.5, caption: 'The two planes that rows 1 and 2 describe. Row 3 is no plane at all. Drag the picture to rotate.' }),
    }),
    num({
      id: 'free-value', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-3, 3, [0]), p = r.int(-4, 5), q = r.int(-4, 5), t0 = r.intExcept(-2, 3, [0]);
        const M = [[1, 0, a, p], [0, 1, b, q], [0, 0, 0, 0]];
        const x = p - a * t0;
        return {
          prompt: t`A system in $x, y, z$ reduces to the RREF below, so $z$ is free. Writing $z = t$, find $x$ for the solution with $t = ${t0}$.
$$${augTeX(M)}$$`,
          answer: x, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: p + a * t0, feedback: t`Move the free term across: row 1 says $x + (${a})z = ${p}$, so $x = ${p} - (${a})t$.` }].filter((e) => e.value !== x),
          hints: [t`Row 1 is the equation $x + (${a})z = ${p}$.`, t`Solve it for $x$: $x = ${p} - (${a})z$, then put $z = ${t0}$.`],
          teach: 'Each RREF row gives one basic variable in terms of the free ones: move the free terms to the right-hand side.',
          explain: t`$x = ${p} - (${a})(${t0}) = ${x}$, and $y = ${q} - (${b})(${t0}) = ${q - b * t0}$: the point $(${x}, ${q - b * t0}, ${t0})$, one point of the solution line $${tupleTeX([p, q, 0])} + t${tupleTeX([-a, -b, 1])}$.`,
          visual: rr(M, { solution: true, view: 4, caption: 'The two planes of the nonzero rows and the gold line where they meet: every solution. Drag the picture to rotate.' }),
        };
      },
    }),
    num({
      id: 'count-free', difficulty: 2,
      gen(r) {
        const pivots = r.pick([[0, 2], [0, 1, 3], [0, 3], [1, 2, 4], [0, 1, 2], [0, 2, 3]]);
        const M = [0, 1, 2].map((i) => Array.from({ length: 5 }, (_, j) => {
          if (i >= pivots.length) return 0;
          const pc = pivots[i];
          if (j === pc) return 1;
          if (j < pc || pivots.includes(j)) return 0;
          return r.int(-3, 4);
        }));
        const free = 5 - pivots.length;
        return {
          prompt: t`The coefficient matrix of a homogeneous system $A\mathbf x = \mathbf 0$ in five unknowns $x_1, \dots, x_5$ reduces to this RREF. How many free variables are there?
$$${matTeX(M)}$$`,
          answer: free, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: pivots.length, feedback: 'That is the number of pivots — the basic variables. The free ones are the columns without a pivot.' }],
          hints: ['Find the pivots: the leading 1 of each nonzero row.', 'Free variables belong to the columns that contain no pivot.'],
          teach: 'Free variables = unknowns − pivots: every column without a pivot belongs to a free variable.',
          explain: t`Pivots in columns ${pivots.map((c) => c + 1).join(' and ').replace(/ and (?=.* and )/, ', ')}: ${pivots.length} pivots, so $5 - ${pivots.length} = ${free}$ free variables, and the solutions form a ${free}-dimensional subspace.`,
          visual: rr(M, { aug: false, picture: 'none', colLabels: ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'], caption: 'The RREF, with each column’s unknown above it.' }),
        };
      },
    }),
    mcq({
      id: 'param-form', difficulty: 3,
      prompt: t`An augmented matrix in $x_1, x_2, x_3, x_4$ reduces to
$$${augTeX([[1, -3, 0, 2, 5], [0, 0, 1, 4, -1]])}$$
Which is the complete solution, with free variables $x_2 = s$ and $x_4 = t$?`,
      choices: [
        t`$\mathbf x = (5, 0, -1, 0) + s(3, 1, 0, 0) + t(-2, 0, -4, 1)$`,
        t`$\mathbf x = (5, 0, -1, 0) + s(-3, 1, 0, 0) + t(2, 0, 4, 1)$`,
        t`$\mathbf x = (5, 0, -1, 0) + s(1, -3, 0, 2) + t(0, 0, 1, 4)$`,
        t`$\mathbf x = (5, 0, -1, 0) + s(3, 0, 0, 0) + t(-2, 0, -4, 0)$`,
      ],
      answer: 0,
      why: {
        1: t`Sign slip: row 1 says $x_1 - 3x_2 + 2x_4 = 5$, so $x_1 = 5 + 3s - 2t$ — the free terms change sign as they move across.`,
        2: 'Those are the rows of the matrix. The direction vectors come from solving the rows for the basic variables.',
        3: t`The free variables themselves must appear: $x_2 = s$ puts a 1 in the second slot of $s$'s vector, and $x_4 = t$ a 1 in the fourth slot of $t$'s.`,
      },
      hints: [t`Solve each row for its pivot variable: $x_1 = 5 + 3x_2 - 2x_4$ and $x_3 = -1 - 4x_4$.`, t`Write $\mathbf x = (x_1, x_2, x_3, x_4)$ with $x_2 = s$, $x_4 = t$, and collect the terms in $s$ and in $t$.`],
      teach: 'For the parametric form, solve each RREF row for its basic variable, then collect the coefficients of each free variable into a vector.',
      explain: t`$x_1 = 5 + 3s - 2t$, $x_2 = s$, $x_3 = -1 - 4t$, $x_4 = t$. Collecting terms: $(5, 0, -1, 0) + s(3, 1, 0, 0) + t(-2, 0, -4, 1)$ — a plane of solutions in $\mathbb R^4$.`,
      visual: rr([[1, -3, 0, 2, 5], [0, 0, 1, 4, -1]], { picture: 'none', vars: ['x₁', 'x₂', 'x₃', 'x₄'], caption: 'The RREF with each column’s unknown above it. Columns 2 and 4 have no pivot.' }),
    }),
    num({
      id: 'consistency-h', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 300; k++) {
          const R1 = [1, r.int(-2, 3), r.int(-2, 3), r.int(-3, 4)], R2 = [r.int(-2, 3), r.intExcept(-2, 3, [0]), r.int(-2, 3), r.int(-3, 4)];
          const n = cross(R1.slice(0, 3), R2.slice(0, 3));
          if (n.every((v) => v === 0)) continue;
          const al = r.intExcept(-2, 2, [0]), be = r.intExcept(-2, 2, [0]);
          const C = R1.slice(0, 3).map((v, j) => al * v + be * R2[j]);
          if (C.every((v) => v === 0)) continue;
          const h = al * R1[3] + be * R2[3];
          // a point on the line where planes 1 and 2 meet, for the picture
          const nn = n[0] * n[0] + n[1] * n[1] + n[2] * n[2];
          const P = cross(n, R1.slice(0, 3)).map((v) => (v * R2[3]) / nn).map((v, j) => v + (cross(R2.slice(0, 3), n)[j] * R1[3]) / nn);
          return {
            prompt: t`For which number $h$ does this system have infinitely many solutions?
$$\left[\begin{array}{rrr|r} ${R1.join(' & ')} \\ ${R2.join(' & ')} \\ ${C.join(' & ')} & h \end{array}\right]$$`,
            answer: h, tol: { rel: 0, abs: 0.01 },
            hints: ['The coefficients of row 3 are a combination of rows 1 and 2. Find it.', t`Row 3's coefficients are $${al}\,R_1 + (${be})\,R_2$.`, t`Then elimination turns row 3 into $(0, 0, 0 \mid h - (${al}\cdot${R1[3]} + (${be})\cdot${R2[3]}))$: it must read $0 = 0$.`],
            teach: 'When a row’s coefficients are a combination of other rows, its right-hand side must be the same combination, or the system has no solution.',
            explain: t`Row 3's coefficients are $${al}R_1 + (${be})R_2$, so elimination leaves $(0, 0, 0 \mid h - ${h})$. For $h = ${h}$ that row is $0 = 0$, rows 1 and 2 leave one free variable, and the solutions fill a line. For any other $h$ the row says $0 = $ something nonzero: no solution at all — never exactly one.`,
            visual: planes3([R1, R2], { range: 4, size: 2.6, centre: P, line: [P, n.map((v) => v / Math.sqrt(nn))], caption: 'Planes 1 and 2 and the gold line where they meet. The third plane must contain that whole line. Drag to rotate.' }),
          };
        }
        return { prompt: t`For which number $h$ does $\left[\begin{array}{rr|r} 1 & 2 & 3 \\ 2 & 4 & h \end{array}\right]$ have infinitely many solutions?`, answer: 6, tol: { rel: 0, abs: 0.01 }, hints: ['Row 2 is twice row 1.', 'So h must be twice 3.'], teach: 'A dependent row needs a matching right-hand side.', explain: t`$h = 6$.` };
      },
    }),
    mcq({
      id: 'homog-wide', difficulty: 2,
      prompt: t`A homogeneous system $A\mathbf x = \mathbf 0$ has 2 equations and 3 unknowns. What can you say for certain about its solutions?`,
      choices: ['There are infinitely many', 'There is exactly one, x = 0', 'There may be none', 'There are exactly three, one per unknown'],
      answer: 0,
      why: {
        1: t`$\mathbf x = \mathbf 0$ is always a solution, but with at most 2 pivots for 3 unknowns at least one variable is free.`,
        2: t`A homogeneous system always has the solution $\mathbf x = \mathbf 0$, so it is never inconsistent.`,
        3: 'A linear system never has exactly three solutions: none, one, or infinitely many.',
      },
      hints: ['How many pivots can a matrix with 2 rows have?', 'Unknowns minus pivots = free variables.'],
      teach: 'A homogeneous system with more unknowns than equations always has free variables, so infinitely many solutions.',
      explain: t`At most 2 pivots for 3 unknowns leaves at least one free variable, and $\mathbf 0$ guarantees consistency: infinitely many solutions. Geometrically, two planes through the origin always share at least a line.`,
      visual: planes3([[1, 1, -1, 0], [2, -1, 1, 0]], { range: 3, size: 2.6, caption: 'Two equations with zero right-hand sides: two planes through the origin. Drag to rotate.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-param', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-3, 3, [0]), b = r.intExcept(-3, 3, [0]), p = r.int(-4, 4), q = r.int(-4, 4), s0 = r.intExcept(-2, 3, [0]);
        // y is the free variable (the middle column has no pivot): x + a y = p, z = q
        const M = [[1, a, 0, p], [0, 0, 1, q], [0, 0, 0, 0]];
        const x = p - a * s0;
        return {
          prompt: t`A system in $x, y, z$ reduces to the RREF below. Find $x$ for the solution with $y = ${s0}$.
$$${augTeX(M)}$$`,
          answer: x, tol: { rel: 0, abs: 0.01 },
          hints: [t`Column 2 has no pivot, so $y$ is free (a free variable need not be the last one); row 1 reads $x + (${a})y = ${p}$.`],
          teach: 'Solve each RREF row for its pivot variable in terms of the free ones — whichever columns those are.',
          explain: t`Row 1: $x = ${p} - (${a})y = ${p} - (${a})(${s0}) = ${x}$, and row 2 fixes $z = ${q}$ whatever $y$ is. The solutions are $(${p}, 0, ${q}) + t(${-a}, 1, 0)$.`,
          visual: rr(M, { solution: true, view: 4, caption: 'The planes of the two nonzero rows and their gold line of common points. Drag the picture to rotate.' }),
        };
      },
    }),
    mcq({
      id: 'cp-wide', difficulty: 2,
      prompt: t`A system has 3 equations and 4 unknowns. Which outcome is **impossible**?`,
      choices: ['Exactly one solution', 'No solution', 'Infinitely many solutions', 'A solution set that is a line'],
      answer: 0,
      why: {
        1: t`Possible: a row can still reduce to $0 = c$, for example when two equations contradict each other.`,
        2: 'Possible — in fact, whenever the system is consistent there are infinitely many solutions.',
        3: 'Possible: with 3 pivots there is exactly one free variable, and the solutions form a line in four dimensions.',
      },
      hints: ['How many pivots can 3 rows hold, and how many unknowns are there?', 'At least one variable is free. What does a free variable do to a consistent system?'],
      teach: 'More unknowns than equations means a free variable, so a consistent system has infinitely many solutions — never exactly one.',
      explain: 'At most 3 pivots for 4 unknowns leaves at least one free variable. So the system has either no solution or infinitely many; a unique solution needs a pivot in every column.',
    }),
    num({
      id: 'cp-ring-main', difficulty: 3, transfer: true,
      gen(r) {
        const inP = r.pick([20, 24, 30, 36]), outQ = r.pick([4, 5, 6]), outS = r.pick([3, 5, 7]), outR = inP - outQ - outS;
        // pipes: x₁ P→Q, x₂ Q→R, x₃ R→S, x₄ S→P; x₄ = t is free:
        // P: inP + x₄ = x₁ ; Q: x₁ = outQ + x₂ ; R: x₂ = outR + x₃ ; S: x₃ = outS + x₄
        const ask = r.pick([1, 2, 3]);
        const base = { 1: inP, 2: inP - outQ, 3: inP - outQ - outR };
        return {
          prompt: t`A propellant ring main has four junctions joined in a loop by one-way pipes: $x_1$ from P to Q, $x_2$ from Q to R, $x_3$ from R to S and $x_4$ from S back to P (flows in kg/s, none negative). ${inP} kg/s enters at P; ${outQ} kg/s leaves at Q, ${outR} kg/s at R and ${outS} kg/s at S. Conservation of mass at the four junctions gives four equations, but they leave one flow free. What is the **smallest** possible flow in pipe $x_${ask}$, in kg/s?`,
          answer: base[ask], units: 'kg/s', tol: { rel: 0, abs: 0.05 },
          hints: ['At each junction, flow in = flow out. Write the four equations.', t`Take $x_4 = t$ as the free variable: then $x_1 = ${inP} + t$, $x_2 = ${inP - outQ} + t$ and $x_3 = ${inP - outQ - outR} + t$.`, t`Every flow must be $\ge 0$, and $x_4 = t$ is a flow too.`],
          teach: 'A free variable in a flow network is a circulation round a loop: conservation allows any amount of it, and physical limits (one-way pipes) pick out a range.',
          explain: t`The RREF leaves $x_4 = t$ free: $x_1 = ${inP} + t$, $x_2 = ${inP - outQ} + t$, $x_3 = ${inP - outQ - outR} + t$, $x_4 = t$. One-way pipes need $t \ge 0$, so the smallest flow in $x_${ask}$ is ${base[ask]} kg/s, with nothing circulating. (One of the four junction equations is the sum of the other three — total in = total out — which is why only three pivots appear.) Which circulation actually flows is set by pressure drops in the pipes, physics the conservation equations do not contain.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 3.6], y: [-1.75, 1.75], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              points: [{ x: 0, y: 1, label: 'P', color: 'ink2', labelDx: -16, labelDy: -12 }, { x: 2, y: 1, label: 'Q', color: 'ink2', labelDx: 8, labelDy: -12 }, { x: 2, y: -1, label: 'R', color: 'ink2', labelDx: 8, labelDy: 14 }, { x: 0, y: -1, label: 'S', color: 'ink2', labelDx: -16, labelDy: 14 }],
              arrows: [
                { from: [0.12, 1], to: [1.88, 1], color: 'accent', label: 'x₁', labelDx: -40, labelDy: -12 },
                { from: [2, 0.88], to: [2, -0.88], color: 'accent', label: 'x₂', labelDx: 10, labelDy: -30 },
                { from: [1.88, -1], to: [0.12, -1], color: 'accent', label: 'x₃', labelDx: 40, labelDy: 14 },
                { from: [0, -0.88], to: [0, 0.88], color: 'accent', label: 'x₄', labelDx: -26, labelDy: 30 },
                { from: [-1.3, 1], to: [-0.12, 1], color: 'good', label: `${inP} in`, labelDx: -62, labelDy: -14 },
                { from: [2.12, 1], to: [3.2, 1], color: 'warn', label: `${outQ} out`, labelDx: -12, labelDy: -14 },
                { from: [2.12, -1], to: [3.2, -1], color: 'warn', label: `${outR} out`, labelDx: -12, labelDy: 14 },
                { from: [-0.12, -1], to: [-1.3, -1], color: 'warn', label: `${outS} out`, labelDx: 4, labelDy: 14 },
              ],
            },
            caption: 'The ring main: four junctions, four one-way pipes and the outside flows in kg/s. Not to scale.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §3.2–3.3', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 8: Solving Ax = b — row reduced form R', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
