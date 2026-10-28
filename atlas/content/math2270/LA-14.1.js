// Dual spaces and covectors, the linear-algebra view: linear functionals form
// the dual space V*, dim V* = dim V, a functional on Rⁿ is a row vector, and
// the dual basis of b₁ … bₙ is the rows of P⁻¹. Beyond arrows: evaluation and
// integration functionals on polynomials, Lagrange's basis and quadrature
// weights.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { matTeX, tupleTeX, colTeX, matvec, qt } from './_la.js';
import { unimod3, rowTeX, rowTimes, planesPic } from './_dual.js';

const t = String.raw;
const EX_P = [[1, 1, 1], [0, 1, 1], [0, 0, 1]];
const EX_PI = [[1, -1, 0], [0, 1, -1], [0, 0, 1]];
const ORD = ['first', 'second', 'third'];
const fq = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : frac(x, 100));

// Lagrange basis on the nodes 0, 1, 2 and its integrals from 0 to a
const LAG = ['(x - 1)*(x - 2)/2', '-x*(x - 2)', 'x*(x - 1)/2'];
const LAGTEX = [t`\tfrac12(x - 1)(x - 2)`, t`-x(x - 2)`, t`\tfrac12 x(x - 1)`];
const lagInt = (j, a) => [(a ** 3 / 3 - 1.5 * a * a + 2 * a) / 2, -(a ** 3 / 3 - a * a), (a ** 3 / 3 - a * a / 2) / 2][j];
const lagAt = (j, x) => [((x - 1) * (x - 2)) / 2, -x * (x - 2), (x * (x - 1)) / 2][j];

// a 3×3 basis, a nonzero covector and the expansion data
const basis3 = (r) => unimod3(r);

export default lesson({
  id: 'math2270.LA-14.1',
  title: 'Dual spaces and covectors',
  minutes: 12, difficulty: 3,
  intro: t`A **linear functional** on a vector space $V$ is a linear map $\varphi: V \to \mathbb R$ — it eats a vector and returns a number. Functionals can be added and scaled, so they form a vector space of their own, the **dual space** $V^*$; its elements are also called *covectors*. A functional is fixed by its values on a basis, so $\dim V^* = \dim V$. On $\mathbb R^n$ every functional is a **row vector**: $\varphi(\mathbf x) = a_1x_1 + \dots + a_nx_n = [a_1 \cdots a_n]\,\mathbf x$. A basis $\mathbf b_1, \dots, \mathbf b_n$ comes with a **dual basis** $\mathbf e^1, \dots, \mathbf e^n$ of $V^*$:
$$\mathbf e^i(\mathbf b_j) = \delta^i_j \qquad\Longleftrightarrow\qquad \mathbf e^1, \dots, \mathbf e^n \text{ are the rows of } P^{-1},\ \ P = [\,\mathbf b_1\ \cdots\ \mathbf b_n\,]$$
because $P^{-1}P = I$ says exactly that row $i$ of $P^{-1}$ times column $j$ of $P$ is $\delta^i_j$. So $\mathbf e^i(\mathbf x)$ is the $i$-th coordinate of $\mathbf x$ in the basis — the coordinate map $[\mathbf x]_{\mathcal B} = P^{-1}\mathbf x$ of LA-7.1 is all $n$ dual functionals at once. The tensor track draws a covector as a stack of lines ([A3.1](#/lesson/st-a.A3.1)) and builds the dual basis in pictures ([A3.4](#/lesson/st-a.A3.4)); Calculus III meets the gradient as one ([C3-3.6](#/lesson/math2210.C3-3.6)). Here the view is algebraic, and it works for any vector space — polynomials included.`,
  symbols: [
    { tex: 'V,\\ V^*', text: t`a vector space of dimension $n$, and its dual: the space of all linear functionals on $V$` },
    { tex: t`\varphi`, text: t`a linear functional: $\varphi(a\mathbf u + b\mathbf v) = a\varphi(\mathbf u) + b\varphi(\mathbf v)$` },
    { tex: t`\mathbf b_j`, text: t`a basis of $V$ (lower index)` },
    { tex: t`\mathbf e^i`, text: t`the dual basis of $V^*$ (upper index): $\mathbf e^i$ returns the $i$-th coordinate` },
    { tex: t`\delta^i_j`, text: t`the Kronecker delta: 1 when $i = j$, 0 otherwise` },
    { tex: 'P,\\ P^{-1}', text: t`$P$ has the basis vectors as columns; the rows of $P^{-1}$ are the dual basis` },
  ],
  why: 'Every “reading” of a vector — a component, a derivative, an integral, a measurement — is a linear functional; general relativity’s one-forms and quantum mechanics’ bras are elements of a dual space.',
  visual: {
    type: 'graph',
    title: 'A dual basis for quadratics',
    lead: t`$V$ is the space of quadratics. Three **evaluation functionals**, $p \mapsto p(-1)$, $p \mapsto p(m)$ and $p \mapsto p(1)$, form a basis of $V^*$. The basis of $V$ they are dual to is drawn in colour: the Lagrange polynomials $L_0, L_1, L_2$, each equal to 1 at its own node and 0 at the other two. The gold quadratic is $p = y_0L_0 + y_1L_1 + y_2L_2$.`,
    tasks: [
      'Drag the middle node m: the three coloured curves reshape, but each still passes through 1 at its own node and 0 at the others — the δ condition.',
      'Change y₀, y₁, y₂: the gold curve passes through them. Its coordinates in the basis L₀, L₁, L₂ are simply its values at the nodes: the dual basis reads coordinates.',
      'Set y₀ = y₁ = y₂ = 1: the gold curve is the constant 1, so L₀ + L₁ + L₂ = 1, wherever m is.',
    ],
    params: {
      x: [-1.5, 1.5], y: [-1.4, 2.4], aspect: 'wide', xlabel: 'x', ylabel: '',
      sliders: [
        { key: 'm', label: 'middle node m', min: -0.6, max: 0.6, step: 0.05, value: 0.2, explain: t`Where the middle evaluation functional $p \mapsto p(m)$ looks.` },
        { key: 'y0', label: t`$y_0 = p(-1)$`, min: -1, max: 2, step: 0.1, value: 0.5, explain: 'The value of the gold quadratic at the left node.' },
        { key: 'y1', label: t`$y_1 = p(m)$`, min: -1, max: 2, step: 0.1, value: 1.5, explain: 'Its value at the middle node.' },
        { key: 'y2', label: t`$y_2 = p(1)$`, min: -1, max: 2, step: 0.1, value: 0.2, explain: 'Its value at the right node.' },
      ],
      curves: [
        { fn: '(x - m)*(x - 1)/((-1 - m)*(-2))', color: 'accent', width: 1.6, dash: [5, 4], label: 'L₀', labelAt: -1.3, labelDx: -4, labelDy: -8 },
        { fn: '(x + 1)*(x - 1)/((m + 1)*(m - 1))', color: 'warn', width: 1.6, dash: [5, 4], label: 'L₁', labelAt: 'm', labelDx: 6, labelDy: -12 },
        { fn: '(x + 1)*(x - m)/(2*(1 - m))', color: 'good', width: 1.6, dash: [5, 4], label: 'L₂', labelAt: 1.3, labelDx: 4, labelDy: -8 },
        { fn: 'y0*(x - m)*(x - 1)/((-1 - m)*(-2)) + y1*(x + 1)*(x - 1)/((m + 1)*(m - 1)) + y2*(x + 1)*(x - m)/(2*(1 - m))', color: 'gold', width: 3, label: 'p', labelAt: 0.75, labelDx: 6, labelDy: -10 },
      ],
      vlines: [{ x: -1, color: 'ink4' }, { x: 'm', color: 'ink4' }, { x: 1, color: 'ink4' }],
      points: [
        { x: -1, y: 1, color: 'accent', r: 4 }, { x: 'm', y: 1, color: 'warn', r: 4 }, { x: 1, y: 1, color: 'good', r: 4 },
        { x: -1, y: 'y0', color: 'gold', r: 5.5 }, { x: 'm', y: 'y1', color: 'gold', r: 5.5 }, { x: 1, y: 'y2', color: 'gold', r: 5.5 },
      ],
    },
    caption: 'Dashed: the Lagrange basis L₀, L₁, L₂ for the nodes −1, m, 1 (small dots at height 1). Gold: the quadratic with the three chosen values. The grey verticals mark the nodes.',
  },
  example: {
    prompt: t`Find the dual basis of $\mathbf b_1 = (1, 0, 0)$, $\mathbf b_2 = (1, 1, 0)$, $\mathbf b_3 = (1, 1, 1)$. Use it to find the coordinates of $\mathbf x = (4, 2, 3)$, and expand the functional $\varphi(\mathbf x) = 2x_1 + x_2 + 5x_3$ in the dual basis.`,
    visual: planesPic(EX_P, EX_PI[0], { name: t`\mathbf e^1`, caption: t`The basis, with the planes $\mathbf e^1 = 0$ (violet: it contains $\mathbf b_2$ and $\mathbf b_3$) and $\mathbf e^1 = 1$ (teal: it contains the tip of $\mathbf b_1$). Patches only; planes go on for ever. Drag to rotate.` }),
    steps: [
      { label: 'Matrix', text: t`$P = ${matTeX(EX_P)}$, the basis vectors as columns.` },
      { label: 'Invert', text: t`$P^{-1} = ${matTeX(EX_PI)}$ (check: $P^{-1}P = I$). Its rows are the dual basis: $\mathbf e^1 = ${rowTeX(EX_PI[0])}$, $\mathbf e^2 = ${rowTeX(EX_PI[1])}$, $\mathbf e^3 = ${rowTeX(EX_PI[2])}$.` },
      { label: 'Check the deltas', text: t`$\mathbf e^1(\mathbf b_2) = 1 - 1 + 0 = 0$, $\mathbf e^2(\mathbf b_3) = 0 + 1 - 1 = 0$, $\mathbf e^2(\mathbf b_2) = 0 + 1 - 0 = 1$, … ✓ Note that $\mathbf e^1$ is **not** $\mathbf b_1$ laid on its side: the row $${rowTeX([1, 0, 0])}$ would give 1 on $\mathbf b_2$ as well.` },
      { label: 'Coordinates', text: t`$\mathbf e^1(\mathbf x) = 4 - 2 = 2$, $\mathbf e^2(\mathbf x) = 2 - 3 = -1$, $\mathbf e^3(\mathbf x) = 3$. Check: $2\mathbf b_1 - \mathbf b_2 + 3\mathbf b_3 = (2 - 1 + 3,\ -1 + 3,\ 3) = (4, 2, 3)$. ✓` },
      { label: 'Expand a functional', text: t`Any $\varphi$ is $\varphi = \varphi(\mathbf b_1)\,\mathbf e^1 + \varphi(\mathbf b_2)\,\mathbf e^2 + \varphi(\mathbf b_3)\,\mathbf e^3$ — apply both sides to $\mathbf b_j$. Here $\varphi(\mathbf b_1) = 2$, $\varphi(\mathbf b_2) = 3$, $\varphi(\mathbf b_3) = 8$, and indeed $2${rowTeX(EX_PI[0])} + 3${rowTeX(EX_PI[1])} + 8${rowTeX(EX_PI[2])} = ${rowTeX([2, 1, 5])}$. ✓ In matrix form, the components of $\varphi$ in the dual basis are the row $\varphi P$.` },
    ],
    answer: t`$\mathbf e^1 = ${rowTeX(EX_PI[0])}$, $\mathbf e^2 = ${rowTeX(EX_PI[1])}$, $\mathbf e^3 = ${rowTeX(EX_PI[2])}$; $[\mathbf x]_{\mathcal B} = (2, -1, 3)$; $\varphi = 2\mathbf e^1 + 3\mathbf e^2 + 8\mathbf e^3$.`,
  },
  practice: [
    multi({
      id: 'which-functional', difficulty: 1,
      prompt: t`Which of these are linear functionals on the space of polynomials? Select all that apply.`,
      choices: [t`$p \mapsto p(3)$`, t`$p \mapsto \displaystyle\int_0^1 p(x)\,dx$`, t`$p \mapsto p'(0)$`, t`$p \mapsto p(0)^2$`, t`$p \mapsto p(0) + 1$`, t`$p \mapsto \displaystyle\max_{0 \le x \le 1}|p(x)|$`],
      answer: [0, 1, 2],
      why: {
        3: t`Squaring is not linear: doubling $p$ quadruples $p(0)^2$.`,
        4: t`A linear map sends the zero polynomial to 0; this sends it to 1.`,
        5: t`$\max|p|$ is a norm, not a linear functional: $\max|-p| = \max|p|$, not $-\max|p|$.`,
      },
      hints: [t`Test the two rules on each: does doubling $p$ double the number, and does $p + q$ give the sum of the two numbers?`],
      teach: 'Evaluating, differentiating at a point and integrating are all linear functionals; squaring, adding a constant and taking a maximum are not.',
      explain: t`Evaluation, integration and differentiation at a point respect sums and multiples, so they are elements of the dual space. Every component of a vector, every reading of an instrument that responds linearly, is such a functional.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.4, 3.4], y: [-0.6, 3.1], aspect: 'wide', xlabel: 'x', ylabel: '',
          curves: [{ fn: '0.5 + 0.9*x - 0.45*x^2 + 0.13*x^3', color: 'gold', width: 2.6, label: 'p', labelAt: 2.6, labelDx: 6, labelDy: -6 }],
          shade: [{ fn: '0.5 + 0.9*x - 0.45*x^2 + 0.13*x^3', from: 0, to: 1, color: 'accent', alpha: 0.25 }],
          tangent: { fn: '0.5 + 0.9*x - 0.45*x^2 + 0.13*x^3', at: 0 },
          points: [{ x: 3, y: '0.5 + 2.7 - 4.05 + 3.51', color: 'warn', r: 5, label: 'p(3)', labelDx: -36, labelDy: -6 }],
        },
        caption: 'One polynomial p and three numbers it determines: its value at 3, the area under it from 0 to 1 (shaded), and its slope at 0 (the tangent line).',
      },
    }),
    num({
      id: 'dimension', difficulty: 1,
      gen(r) {
        const n = r.int(2, 5), m = r.int(2, 4);
        const [what, d, wrong, why] = r.pick([
          [t`polynomials of degree at most $${n}$`, n + 1, n, t`Degree at most $${n}$ means $${n + 1}$ coefficients, $a_0$ to $a_${n}$: count the constant term.`],
          [t`$${m}\times${n}$ matrices`, m * n, m + n, t`A $${m}\times${n}$ matrix has $${m}\cdot${n}$ independent entries, not $${m} + ${n}$.`],
          [t`symmetric $${n}\times${n}$ matrices`, (n * (n + 1)) / 2, n * n, t`Symmetry ties $a_{ij}$ to $a_{ji}$: only the diagonal and the entries above it are free, $${n}(${n} + 1)/2$ of them.`],
        ]);
        return {
          prompt: t`$V$ is the space of ${what}. What is the dimension of its dual space $V^*$?`,
          answer: d, tol: { rel: 0, abs: 0.01 },
          errors: wrong !== d ? [{ value: wrong, feedback: why }] : [],
          hints: [t`$\dim V^* = \dim V$: a functional is fixed by its values on a basis of $V$, one number per basis vector.`, 'So count a basis of V.'],
          teach: t`A functional is determined by its values on a basis, freely chosen, so $\dim V^* = \dim V$.`,
          explain: t`$\dim V = ${d}$, so $\dim V^* = ${d}$. Each of the $${d}$ values on a basis can be chosen freely, and linearity fixes the rest.`,
        };
      },
    }),
    num({
      id: 'dual-3d', difficulty: 2,
      gen(r) {
        const { P, Pi } = basis3(r), i = r.int(0, 2), k = r.int(0, 2);
        const errors = [];
        if (P[k][i] !== Pi[i][k]) errors.push({ value: P[k][i], feedback: t`That is a component of $\mathbf b_${i + 1}$ itself. The dual covector is not the basis vector laid on its side; it is row ${i + 1} of $P^{-1}$.` });
        if (Pi[k][i] !== Pi[i][k] && !errors.some((e) => e.value === Pi[k][i])) errors.push({ value: Pi[k][i], feedback: t`That entry is from column ${i + 1} of $P^{-1}$. The dual covectors are its **rows**.` });
        return {
          prompt: t`The basis vectors of $\mathbb R^3$ are the columns of $P = ${matTeX(P)}$. Write the dual covector $\mathbf e^${i + 1}$ as a row $[a_1\ a_2\ a_3]$, so that $\mathbf e^${i + 1}(\mathbf x) = a_1x_1 + a_2x_2 + a_3x_3$. Find $a_${k + 1}$.`,
          answer: Pi[i][k], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`The dual basis is the rows of $P^{-1}$, so you need row ${i + 1} of $P^{-1}$.`, t`Row ${i + 1} of $P^{-1}$ is the row $\mathbf a$ with $\mathbf a\,\mathbf b_j = \delta^${i + 1}_j$ for $j = 1, 2, 3$: three equations for $a_1, a_2, a_3$. Or row-reduce $[P \mid I]$.`],
          teach: t`The dual basis of the columns of $P$ is the rows of $P^{-1}$ — that is what $P^{-1}P = I$ says.`,
          explain: t`$P^{-1} = ${matTeX(Pi)}$, so $\mathbf e^${i + 1} = ${rowTeX(Pi[i])}$ and $a_${k + 1} = ${Pi[i][k]}$. Check: $\mathbf e^${i + 1}$ applied to the columns of $P$ gives $${tupleTeX([0, 1, 2].map((j) => Pi[i].reduce((s, a, q) => s + a * P[q][j], 0)))}$. ✓`,
          visual: planesPic(P, Pi[i], { levels: [0], name: t`\mathbf e^${i + 1}`, caption: t`The basis vectors and the plane $\mathbf e^${i + 1} = 0$: it contains the two basis vectors other than $\mathbf b_${i + 1}$. Drag to rotate.` }),
        };
      },
    }),
    mcq({
      id: 'kernel', difficulty: 2,
      prompt: t`$\varphi$ is a nonzero linear functional on $\mathbb R^4$. What is the dimension of its kernel, $\{\mathbf x : \varphi(\mathbf x) = 0\}$?`,
      choices: ['3', '1', '4', '0'],
      answer: 0,
      why: {
        1: t`$\varphi$ is one row, but its kernel is everything that row is orthogonal to — almost all of $\mathbb R^4$. One dimension is the size of its range, not its kernel.`,
        2: t`Only the zero functional kills every vector. A nonzero $\varphi$ takes the value 1 somewhere.`,
        3: t`A $1\times4$ matrix has at least $4 - 1 = 3$ free variables in $\varphi(\mathbf x) = 0$.`,
      },
      hints: [t`Rank–nullity: $\dim\ker\varphi + \dim\operatorname{range}\varphi = 4$.`, t`The range of a nonzero functional is all of $\mathbb R$, which has dimension 1.`],
      teach: t`The kernel of a nonzero functional on an $n$-dimensional space is a hyperplane, of dimension $n - 1$.`,
      explain: t`$\varphi$ maps onto $\mathbb R$ (dimension 1), so its kernel has dimension $4 - 1 = 3$: a hyperplane. The level sets $\varphi = c$ are parallel copies of it — a covector on $\mathbb R^n$ is a stack of hyperplanes, as the 3D picture shows with planes.`,
      visual: planesPic([[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 1, 2], { levels: [0, 1, 2], name: t`\varphi`, basisNames: ['\\mathbf e_1', '\\mathbf e_2', '\\mathbf e_3'], caption: t`The analogue one dimension down: a functional on $\mathbb R^3$ and its level sets $\varphi = 0, 1, 2$ — parallel planes, the kernel among them. Drag to rotate.` }),
    }),
    num({
      id: 'expand', difficulty: 2,
      gen(r) {
        const { P, Pi } = basis3(r);
        let w = [1, 1, 1];
        for (let k = 0; k < 100; k++) { w = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; if (w.filter((x) => x !== 0).length >= 2) break; }
        const j = r.int(0, 2), comps = rowTimes(w, P), wrong = rowTimes(w, Pi);
        const errors = [];
        if (Math.abs(wrong[j] - comps[j]) > 1e-9) errors.push({ value: wrong[j], feedback: t`That is $\varphi P^{-1}$, the law for something else. The $j$-th component of $\varphi$ in the dual basis is $\varphi(\mathbf b_j)$: multiply by $P$.` });
        if (Math.abs(w[j] - comps[j]) > 1e-9 && !errors.some((e) => e.value === w[j])) errors.push({ value: w[j], feedback: t`That is $\varphi$’s coefficient in the standard dual basis. In the dual basis of $\mathcal B$ the component is $\varphi(\mathbf b_${j + 1})$.` });
        return {
          prompt: t`$\varphi(\mathbf x) = ${rowTeX(w)}\,\mathbf x$ on $\mathbb R^3$. The basis $\mathcal B$ is the columns of $P = ${matTeX(P)}$, with dual basis $\mathbf e^1, \mathbf e^2, \mathbf e^3$. Write $\varphi = \varphi_1\mathbf e^1 + \varphi_2\mathbf e^2 + \varphi_3\mathbf e^3$. Find $\varphi_${j + 1}$.`,
          answer: comps[j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`Apply both sides to $\mathbf b_${j + 1}$: every $\mathbf e^i(\mathbf b_${j + 1})$ is 0 except $\mathbf e^${j + 1}(\mathbf b_${j + 1}) = 1$.`, t`So $\varphi_${j + 1} = \varphi(\mathbf b_${j + 1}) = ${rowTeX(w)}${colTeX(P.map((row) => row[j]))}$.`],
          teach: t`A functional’s components in a dual basis are its values on the basis vectors: $\varphi_j = \varphi(\mathbf b_j)$, i.e. the row $\varphi P$.`,
          explain: t`$\varphi_${j + 1} = \varphi(\mathbf b_${j + 1}) = ${comps[j]}$. All three at once: $\varphi P = ${rowTeX(comps)}$. Components of vectors come from $P^{-1}$; components of covectors from $P$ — the two laws of the next lesson.`,
          visual: planesPic(P, w, { levels: [0, 1], name: t`\varphi`, caption: t`The basis vectors and the planes $\varphi = 0$ and $\varphi = 1$. $\varphi(\mathbf b_j)$ counts how many unit steps of $\varphi$ the tip of $\mathbf b_j$ lies beyond the plane $\varphi = 0$. Drag to rotate.` }),
        };
      },
    }),
    mcq({
      id: 'orthonormal', difficulty: 2,
      prompt: t`When is the dual basis of $\mathbf b_1, \dots, \mathbf b_n$ simply $\mathbf b_1^{\mathsf T}, \dots, \mathbf b_n^{\mathsf T}$ — each basis vector laid on its side as a row?`,
      choices: [
        t`Exactly when the basis is orthonormal, because then $P^{-1} = P^{\mathsf T}$`,
        'Whenever the basis vectors are orthogonal, whatever their lengths',
        'Always: that is the definition of the dual basis',
        t`Whenever $\det P = 1$`,
      ],
      answer: 0,
      why: {
        1: t`Orthogonal but not unit: then $P^{-1}$ has rows $\mathbf b_i^{\mathsf T}/\|\mathbf b_i\|^2$. The picture shows it: $\mathbf b_1$ must cross exactly one gap of $\mathbf e^1$.`,
        2: t`The definition is $\mathbf e^i(\mathbf b_j) = \delta^i_j$, which needs no lengths or angles at all. $\mathbf b_i^{\mathsf T}$ uses the dot product, an extra structure.`,
        3: t`$P = \begin{bmatrix} 1 & 1 \\ 0 & 1 \end{bmatrix}$ has $\det P = 1$, but $\mathbf b_1^{\mathsf T} = [1\ 0]$ gives 1 on $\mathbf b_2 = (1, 1)$, not 0.`,
      },
      hints: [t`The dual basis is the rows of $P^{-1}$; the rows $\mathbf b_i^{\mathsf T}$ are the rows of $P^{\mathsf T}$. When are $P^{-1}$ and $P^{\mathsf T}$ equal?`],
      teach: t`Only for an orthonormal basis does the dual basis look like the basis itself; in general, turning vectors into covectors needs an inner product.`,
      explain: t`$P^{-1} = P^{\mathsf T}$ is the definition of an orthogonal matrix — orthonormal columns. That is why Cartesian physics never meets the dual space: there it hides behind the dot product. With skewed or rescaled axes — or in relativity, where the “dot product” is not positive — the distinction is unavoidable. Using an inner product to turn vectors into covectors is the metric’s job (LA-14.3).`,
      visual: {
        type: 'graph',
        params: {
          x: [-3.6, 3.6], y: [-1.8, 1.8], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
          curves: [-1, 0, 1].map((k) => ({ param: [`${2 * k} - t`, `${k} + 2*t`], t: [-3, 3], color: 'violet', width: k ? 1 : 1.6, dash: k ? [4, 4] : [], label: k === 1 ? 'e¹ = 1' : undefined, labelAt: k === 1 ? 0.3 : undefined, labelDx: 4 })),
          arrows: [{ from: [0, 0], to: [2, 1], color: 'accent', width: 3, label: 'b₁' }, { from: [0, 0], to: [-0.5, 1], color: 'warn', width: 3, label: 'b₂' }],
        },
        caption: 'An orthogonal basis that is not orthonormal: b₁ = (2, 1), b₂ = (−0.5, 1). The violet lines are e¹ = −1, 0, 1: perpendicular to b₁ and parallel to b₂, spaced so that b₁ crosses exactly one gap.',
      },
    }),
    num({
      id: 'weights', difficulty: 3,
      gen(r) {
        let a, j;
        for (let k = 0; k < 50; k++) { a = r.pick([1, 2, 4]); j = r.int(0, 2); if (Math.abs(lagInt(j, a)) > 1e-9) break; }
        const w = lagInt(j, a), ys = Array.from({ length: 41 }, (_, k) => lagAt(j, (a * k) / 40));
        const lo = Math.min(-0.3, ...ys), hi = Math.max(1.2, ...ys);
        const peak = (a * ys.reduce((best, y, k) => (Math.abs(y) > Math.abs(ys[best]) ? k : best), 0)) / 40;
        const errors = Math.abs(a / 3 - w) > 1e-6 ? [{ value: a / 3, feedback: t`Equal weights would be right only if each $L_j$ had the same area. Integrate $L_${j}$ itself.` }] : [];
        return {
          prompt: t`On the quadratics, the evaluations $\mathrm{ev}_0, \mathrm{ev}_1, \mathrm{ev}_2$ ($p \mapsto p(0), p(1), p(2)$) are a basis of the dual space; its dual basis in $V$ is the Lagrange basis $L_0 = ${LAGTEX[0]}$, $L_1 = ${LAGTEX[1]}$, $L_2 = ${LAGTEX[2]}$. The functional $I(p) = \int_0^{${a}} p(x)\,dx$ therefore expands as $I = w_0\,\mathrm{ev}_0 + w_1\,\mathrm{ev}_1 + w_2\,\mathrm{ev}_2$. Find $w_${j}$.`,
          answer: w, tol: { rel: 0.002, abs: 0.002 }, errors,
          hints: [t`Apply both sides to $L_${j}$: every $\mathrm{ev}_i(L_${j})$ is 0 except $\mathrm{ev}_${j}(L_${j}) = 1$. So $w_${j} = I(L_${j})$.`, t`$w_${j} = \int_0^{${a}} ${LAGTEX[j]}\,dx$ — expand the product and integrate term by term.`],
          teach: t`A functional’s component on a dual-basis element is its value on the matching basis vector: $w_j = I(L_j)$.`,
          explain: t`$w_${j} = \int_0^{${a}} L_${j}\,dx = ${fq(w)}$; all three are $${[0, 1, 2].map((q) => fq(lagInt(q, a))).join(',\\ ')}$. ${a === 2 ? t`These are the weights of **Simpson’s rule**, $\int_0^2 p \approx \tfrac13p(0) + \tfrac43p(1) + \tfrac13p(2)$ — exact for quadratics (and, by luck of symmetry, cubics).` : t`They add to $${a}$, the integral of the constant 1. Integrating beyond the nodes can make a weight negative, which is why such rules are used only over the span of their nodes.`}`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, Math.max(2.3, a + 0.3)], y: [lo - 0.3, hi + 0.3], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: LAG[j], color: 'accent', width: 2.4, label: `L${'₀₁₂'[j]}`, labelAt: peak, labelDx: peak > 1.5 ? -26 : 8, labelDy: -8 }], shade: [{ fn: LAG[j], from: 0, to: a, color: 'accent', alpha: 0.25 }], points: [0, 1, 2].map((x) => ({ x, y: x === j ? 1 : 0, color: 'gold', r: 4.5 })) },
            caption: `L${'₀₁₂'[j]}, equal to 1 at its own node and 0 at the other two (gold dots), with its signed area from 0 to ${a} shaded.`,
          },
        };
      },
    }),
    code({
      id: 'quad-weights', difficulty: 3,
      prompt: t`Quadrature rules are dual-basis expansions. On polynomials of degree below $n$, the evaluations at $n$ distinct nodes form a basis of the dual space, so the integral $I(p) = \int_a^b p\,dx$ is a combination $\sum_i w_i\,p(x_i)$. In the monomial basis $1, x, \dots, x^{n-1}$, evaluation at $x_i$ is the row $V_i = [1\ x_i\ \cdots\ x_i^{n-1}]$ (a row of the Vandermonde matrix $V$) and $I$ is the row $\mathbf m$ with $m_k = \int_a^b x^k\,dx$. So the weights solve $\mathbf w V = \mathbf m$, i.e. $V^{\mathsf T}\mathbf w = \mathbf m$. Write \`quad_weights(nodes, a, b)\`.`,
      starter: t`import numpy as np

def quad_weights(nodes, a, b):
    """Weights w with  integral_a^b p(x) dx = sum_i w[i] * p(nodes[i])
    for every polynomial p of degree < len(nodes)."""
    nodes = np.asarray(nodes, dtype=float)
    n = len(nodes)
    # V[i, k] = nodes[i]**k   (np.vander(nodes, increasing=True))
    # m[k] = integral of x**k from a to b
    # solve  V.T @ w = m
    return np.zeros(n)

print(quad_weights([0, 0.5, 1], 0, 1))   # Simpson's rule on [0, 1]
`,
      answer: t`import numpy as np

def quad_weights(nodes, a, b):
    nodes = np.asarray(nodes, dtype=float)
    n = len(nodes)
    V = np.vander(nodes, increasing=True)
    k = np.arange(n)
    m = (b**(k + 1) - a**(k + 1)) / (k + 1)
    return np.linalg.solve(V.T, m)

print(quad_weights([0, 0.5, 1], 0, 1))   # Simpson's rule on [0, 1]
`,
      tests: [
        { name: t`Simpson’s rule: nodes $0, \tfrac12, 1$ on $[0, 1]$ give $\tfrac16, \tfrac46, \tfrac16$`, code: 'np.allclose(quad_weights([0, 0.5, 1], 0, 1), [1/6, 4/6, 1/6])' },
        { name: t`Simpson’s $\tfrac38$ rule: nodes $0, 1, 2, 3$ on $[0, 3]$ give $\tfrac38, \tfrac98, \tfrac98, \tfrac38$`, code: 'np.allclose(quad_weights([0, 1, 2, 3], 0, 3), [3/8, 9/8, 9/8, 3/8])' },
        { name: t`four nodes integrate $x^3 - 2x + 1$ over $[-1, 2]$ exactly ($3.75$)`, code: 'abs(np.dot(quad_weights([-1, 0, 1, 2], -1, 2), [(x**3 - 2*x + 1) for x in [-1, 0, 1, 2]]) - 3.75) < 1e-9' },
        { name: t`the weights always add to $b - a$`, code: 'abs(sum(quad_weights([0.1, 0.4, 0.7, 1.3, 2.0], -0.5, 2.5)) - 3.0) < 1e-9' },
      ],
      hints: [t`\`V = np.vander(nodes, increasing=True)\`; \`k = np.arange(n)\`; \`m = (b**(k + 1) - a**(k + 1)) / (k + 1)\`.`, t`\`np.linalg.solve(V.T, m)\` — the transpose, because $\mathbf w$ multiplies $V$ from the left as a row.`],
      teach: 'A quadrature rule’s weights are the coordinates of the integral functional in the dual basis of point evaluations.',
      explain: t`$\mathbf w V = \mathbf m$ says that the combination $\sum_i w_i\,\mathrm{ev}_{x_i}$ and $I$ agree on every monomial $x^k$, hence on every polynomial of degree below $n$ — two functionals equal on a basis are equal. Simpson’s $\tfrac16, \tfrac46, \tfrac16$ comes out of one linear solve. (For many equally spaced nodes $V$ becomes badly conditioned and the weights oscillate in sign — one reason high-order rules use Gauss or Chebyshev nodes instead.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dual', difficulty: 2,
      gen(r) {
        const { P, Pi } = basis3(r), i = r.int(0, 2);
        const x = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], c = matvec(Pi, x);
        return {
          prompt: t`The basis $\mathcal B$ of $\mathbb R^3$ is the columns of $P = ${matTeX(P)}$, and $P^{-1} = ${matTeX(Pi)}$. Find $\mathbf e^${i + 1}(\mathbf x)$ for $\mathbf x = ${tupleTeX(x)}$ — the ${ORD[i]} coordinate of $\mathbf x$ in $\mathcal B$.`,
          answer: c[i], tol: { rel: 0, abs: 0.01 },
          hints: [t`$\mathbf e^${i + 1}$ is row ${i + 1} of $P^{-1}$.`],
          teach: t`The dual basis is the rows of $P^{-1}$, and $\mathbf e^i(\mathbf x)$ is the $i$-th coordinate of $\mathbf x$.`,
          explain: t`$\mathbf e^${i + 1}(\mathbf x) = ${rowTeX(Pi[i])}${colTeX(x)} = ${c[i]}$. The whole coordinate vector is $P^{-1}\mathbf x = ${tupleTeX(c)}$.`,
          visual: planesPic(P, Pi[i], { levels: [0, 1], name: t`\mathbf e^${i + 1}`, extra: { points: [{ at: x, color: 'gold', label: '\\mathbf x' }] }, caption: t`The basis, the point $\mathbf x$ (gold) and the planes $\mathbf e^${i + 1} = 0$ and $1$. Drag to rotate.` }),
        };
      },
    }),
    num({
      id: 'cp-impulse', difficulty: 3, transfer: true,
      gen(r) {
        const dt = r.pick([0.5, 1, 1.5, 2]), F0 = r.int(4, 12), F1 = r.int(14, 26), F2 = r.int(8, 18);
        const I = (dt / 3) * (F0 + 4 * F1 + F2), trap = (dt / 2) * (F0 + 2 * F1 + F2), mid = 2 * dt * F1, mean = (2 * dt * (F0 + F1 + F2)) / 3;
        // the quadratic through (0, F0), (dt, F1), (2dt, F2)
        const c2 = (F0 - 2 * F1 + F2) / (2 * dt * dt), c1 = (F1 - F0) / dt - c2 * dt;
        const curve = `${F0} + (${c1})*x + (${c2})*x^2`;
        return {
          prompt: t`A small solid rocket motor on a test stand is sampled three times during its ${2 * dt} s burn: thrust $F_0 = ${F0}$ kN at $t = 0$, $F_1 = ${F1}$ kN at $t = ${dt}$ s and $F_2 = ${F2}$ kN at $t = ${2 * dt}$ s. Treat the thrust curve as the quadratic through those samples. The total-impulse functional $I(F) = \int_0^{${2 * dt}} F\,dt$ is then a combination of the three evaluation functionals, with weights $\tfrac{h}{3}, \tfrac{4h}{3}, \tfrac{h}{3}$ for sample spacing $h$. Find the total impulse in kN s.`,
          answer: I, units: 'kN s', tol: { rel: 0.004 },
          errors: [
            { value: trap, feedback: t`That is the trapezoid rule, weights $\tfrac h2, h, \tfrac h2$ — exact only for straight lines. A quadratic needs Simpson’s weights.` },
            { value: mid, feedback: t`That multiplies the middle sample by the whole burn time, ignoring the other two.` },
            { value: mean, feedback: 'That weights the three samples equally. The middle sample stands for more of the curve: weight 4h/3 against h/3 at the ends.' },
          ].filter((e) => Math.abs(e.value - I) > 0.005 * I),
          hints: [t`The samples are $h = ${dt}$ s apart, and the weights belong to $F_0$, $F_1$, $F_2$ in that order.`, t`$I = \tfrac{h}{3}F_0 + \tfrac{4h}{3}F_1 + \tfrac{h}{3}F_2 = \tfrac{${dt}}{3}(F_0 + 4F_1 + F_2)$.`],
          teach: 'The weights of a quadrature rule are the components of the integral functional in the dual basis of point evaluations.',
          explain: t`$I = \tfrac{${dt}}{3}(${F0} + 4\times${F1} + ${F2}) = ${nice(I)}$ kN s. It is exact for a quadratic thrust curve and a good estimate for a smooth real one; real test stands sample thousands of times per second and use the same idea over many short panels.`,
          visual: { type: 'graph', params: { x: [-0.15 * dt, 2.15 * dt], y: [-2, 1.25 * Math.max(F0, F1, F2, F0 + c1 * dt * 0.5 + c2 * dt * dt * 0.25)], aspect: 'wide', xlabel: 't (s)', ylabel: 'F (kN)', curves: [{ fn: curve, domain: [0, 2 * dt], color: 'gold', width: 2.4 }], shade: [{ fn: curve, from: 0, to: 2 * dt, color: 'accent', alpha: 0.22 }], points: [[0, F0], [dt, F1], [2 * dt, F2]].map(([x, y]) => ({ x, y, color: 'warn', r: 5 })) }, caption: 'The three thrust samples (orange), the quadratic through them, and the impulse as the area under it (shaded). Real thrust curves are not exactly quadratic.' },
        };
      },
    }),
    mcq({
      id: 'cp-coords', difficulty: 2,
      prompt: t`$\mathcal B = \{\mathbf b_1, \dots, \mathbf b_n\}$ is a basis of $\mathbb R^n$ and $P = [\,\mathbf b_1\ \cdots\ \mathbf b_n\,]$. Which describes the coordinate map $\mathbf x \mapsto [\mathbf x]_{\mathcal B}$?`,
      choices: [
        t`$[\mathbf x]_{\mathcal B} = P^{-1}\mathbf x$: its $n$ rows are the dual basis functionals, each reading one coordinate`,
        t`$[\mathbf x]_{\mathcal B} = P^{\mathsf T}\mathbf x$: the dot products of $\mathbf x$ with the basis vectors`,
        t`$[\mathbf x]_{\mathcal B} = P\mathbf x$`,
        t`$[\mathbf x]_{\mathcal B} = \mathbf x$: coordinates do not depend on the basis`,
      ],
      answer: 0,
      why: {
        1: t`Dot products with the $\mathbf b_i$ give the coordinates only for an orthonormal basis. In general they are a different set of numbers.`,
        2: t`$P$ goes the other way: it turns $\mathcal B$-coordinates into standard components, $\mathbf x = P[\mathbf x]_{\mathcal B}$.`,
        3: t`The vector does not depend on the basis; its coordinates do.`,
      },
      hints: [t`$\mathbf x = P[\mathbf x]_{\mathcal B}$: solve for the coordinates.`],
      teach: t`The coordinate map is $P^{-1}$, and its rows are the dual basis.`,
      explain: t`From $\mathbf x = P[\mathbf x]_{\mathcal B}$ comes $[\mathbf x]_{\mathcal B} = P^{-1}\mathbf x$, and row $i$ of $P^{-1}$ applied to $\mathbf x$ is $\mathbf e^i(\mathbf x)$, the $i$-th coordinate.`,
    }),
  ],
  sources: [
    { label: 'Axler, Linear Algebra Done Right (4th ed.), §3F Duality', url: 'https://linear.axler.net/' },
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.2–8.3', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
  ],
});
