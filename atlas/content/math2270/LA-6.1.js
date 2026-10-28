// Abstract vector spaces: anything you can add and scale. Solution spaces of
// linear ODEs, matrices, functions; the symmetric 4×4 arrays of general
// relativity (10 dimensions) and the antisymmetric ones of electromagnetism.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { tupleTeX, matTeX, stems, map2d } from './_la.js';

const t = String.raw;

/**
 * An n×n array as a grid of dots on the graph sim: the diagonal gold (or grey
 * when it is forced to zero), and optionally dashed links joining each
 * mirror-image pair, or the mirror line itself.
 */
function arrayGrid(n, { split = false, mirror = false, zeroDiag = false, caption } = {}) {
  const g = 0.8, P = (i, j) => [j * g, (n - 1 - i) * g];
  const points = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const [x, y] = P(i, j);
    const copy = split && i > j;     // below the diagonal: a copy of its mirror image, not a free number
    points.push({ x, y, r: copy ? 4 : 6, color: i === j ? (zeroDiag ? 'ink3' : 'gold') : copy ? 'ink4' : 'accent', ...(i === j && zeroDiag ? { label: '0', labelDx: -3, labelDy: -12 } : {}) });
  }
  const curves = [];
  if (mirror) curves.push({ param: [`${-0.4} + t*${n * g}`, `${(n - 1) * g + 0.4} - t*${n * g}`], t: [0, 1], color: 'violet', dash: true, width: 1.6 });
  return {
    type: 'graph',
    params: { x: [-0.8, n * g + 0.2], y: [-0.8, n * g + 0.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', points, curves },
    caption,
  };
}

const KINDS = {
  sym: { name: t`symmetric $n\times n$ matrices ($A^{\mathsf T} = A$)`, dim: (n) => (n * (n + 1)) / 2, how: (n) => t`${n} diagonal entries plus ${(n * (n - 1)) / 2} above the diagonal (the ones below copy them)` },
  anti: { name: t`antisymmetric $n\times n$ matrices ($A^{\mathsf T} = -A$)`, dim: (n) => (n * (n - 1)) / 2, how: (n) => t`the diagonal is forced to 0 (each $a_{ii} = -a_{ii}$), leaving the ${(n * (n - 1)) / 2} entries above it` },
  upper: { name: t`upper triangular $n\times n$ matrices`, dim: (n) => (n * (n + 1)) / 2, how: (n) => t`the ${n} diagonal entries and the ${(n * (n - 1)) / 2} above them are free; the rest are 0` },
  trace: { name: t`$n\times n$ matrices with trace 0`, dim: (n) => n * n - 1, how: (n) => t`all ${n * n} entries except that one diagonal entry is fixed by the others (they must sum to 0)` },
  diag: { name: t`diagonal $n\times n$ matrices`, dim: (n) => n, how: (n) => t`only the ${n} diagonal entries are free` },
};

export default lesson({
  id: 'math2270.LA-6.1',
  title: 'Vector spaces beyond arrows',
  minutes: 11, difficulty: 2,
  intro: t`A **vector space** is any collection of objects you can add and scale by real numbers, where arithmetic works as usual: there is a zero element, every element has a negative, and the familiar laws hold ($\mathbf u + \mathbf v = \mathbf v + \mathbf u$, $c(\mathbf u + \mathbf v) = c\mathbf u + c\mathbf v$, and the rest). For a subset of a space already known to be a vector space, the test that matters is closure — and containing $\mathbf 0$:

$$\mathbf u, \mathbf v \in V \text{ and } c \in \mathbb R \quad\Longrightarrow\quad \mathbf u + \mathbf v \in V \text{ and } c\,\mathbf u \in V$$

Arrows in $\mathbb R^n$ are one example. So are polynomials, matrices, functions on an interval, and the solutions of a linear homogeneous differential equation such as $y'' + y = 0$. Span, independence, basis, dimension and linear maps carry over unchanged. Physics lives in such spaces: the solutions of the wave equation, the states of a quantum system and the tensors of general relativity all form vector spaces, because their equations are linear.`,
  symbols: [
    { tex: 'V', text: 'a vector space: a set together with an addition and a scaling that obey the usual rules' },
    { tex: t`\mathbf u,\ \mathbf v`, text: 'elements of V — “vectors”, whatever they are: arrows, polynomials, functions, matrices' },
    { tex: 'c', text: 'a scalar: a real number (complex scalars come in LA-13, for quantum mechanics)' },
    { tex: t`\in`, text: t`“is a member of”: $\mathbf u \in V$ means $\mathbf u$ belongs to $V$` },
    { tex: t`\mathbf 0`, text: 'the zero element of V: the zero arrow, the zero polynomial, the zero function or the zero matrix' },
  ],
  why: 'Superposition in quantum mechanics is the statement that states form a vector space, and the metric and stress–energy tensors of general relativity live in a 10-dimensional space of symmetric 4 × 4 arrays.',
  visual: {
    type: 'graph',
    title: 'A plane of solutions',
    lead: t`Every combination $y = c_1\cos x + c_2\sin x$ solves $y'' + y = 0$ (the equation of a mass on a spring, with time measured in units of $1/\omega$). The sliders are its coordinates in the basis $\{\cos x, \sin x\}$. Then switch on a constant force, $y'' + y = 1$, and see what breaks.`,
    tasks: [
      'With no force, set c₁ = c₂ = 0: the zero function is a solution — every vector space contains its zero.',
      'Every setting of the two sliders is a solution, and each is fixed by y(0) = c₁ and y′(0) = c₂: the solutions form a 2-dimensional space.',
      'Switch the force on: every solution is now 1 + c₁cos x + c₂sin x. The zero function is no longer one, and two solutions add up to a solution of y″ + y = 2: not a vector space, but a vector space shifted by 1.',
    ],
    params: {
      x: [-0.3, 12.8], y: [-3, 3.6], aspect: 'wide', xlabel: 'x', ylabel: 'y',
      sliders: [
        { key: 'c1', label: t`Coordinate $c_1$ (on $\cos x$)`, min: -2, max: 2, step: 0.1, value: 1, explain: t`Equals the starting value $y(0)$.` },
        { key: 'c2', label: t`Coordinate $c_2$ (on $\sin x$)`, min: -2, max: 2, step: 0.1, value: 0.5, explain: t`Equals the starting slope $y'(0)$.` },
      ],
      choices: [{ key: 'F', label: 'Right-hand side', options: [[0, t`$y'' + y = 0$ (no force)`], [1, t`$y'' + y = 1$ (constant force)`]], value: 0 }],
      curves: [
        { fn: 'cos(x)', color: 'accent', width: 1.4, dash: true, label: 'cos x', labelAt: 6.6, labelDy: -10 },
        { fn: 'sin(x)', color: 'warn', width: 1.4, dash: true, label: 'sin x', labelAt: 8.2, labelDy: -10 },
        { fn: 'F + c1*cos(x) + c2*sin(x)', color: 'gold', width: 2.8 },
      ],
      hlines: [{ y: 'F', color: 'ink3', when: 'F' }],
      readouts: [{ label: t`$y(0)$`, expr: 'F + c1', digits: 3 }, { label: t`$y'(0)$`, expr: 'c2', digits: 3 }],
    },
    caption: 'Dashed: the basis functions cos x and sin x. Gold: the combination F + c₁cos x + c₂sin x, where F is the constant force (0 or 1). With the force on, the grey line marks the new equilibrium y = 1.',
  },
  example: {
    prompt: t`Show that the symmetric $4\times4$ matrices form a vector space, and find its dimension.`,
    visual: arrayGrid(4, { split: true, mirror: true, caption: 'The 16 entries of a 4 × 4 array. A symmetric array repeats itself across the mirror line (violet dashed), so the entries below it (small grey dots) copy those above: the 4 diagonal entries (gold) and the 6 above the diagonal (blue) are the 10 free numbers.' }),
    steps: [
      { label: 'A bigger space', text: t`All $4\times4$ matrices form a vector space: add and scale entry by entry, with the zero matrix as $\mathbf 0$. It has dimension 16 — a basis is the 16 matrices $E_{\mu\nu}$ with a single 1 in row $\mu$, column $\nu$ (indices running 0 to 3, as in relativity).` },
      { label: 'Subspace test', text: t`The zero matrix is symmetric. If $A$ and $B$ are symmetric, $(A + B)^{\mathsf T} = A^{\mathsf T} + B^{\mathsf T} = A + B$ and $(cA)^{\mathsf T} = cA^{\mathsf T} = cA$. So the symmetric matrices are closed under adding and scaling: a subspace, and therefore a vector space of their own.` },
      { label: 'A basis', text: t`Take the 4 diagonal units $E_{00}, E_{11}, E_{22}, E_{33}$ and, for each of the 6 pairs $\mu < \nu$, the symmetric unit $E_{\mu\nu} + E_{\nu\mu}$. Every symmetric $S$ is $\sum_\mu S_{\mu\mu}E_{\mu\mu} + \sum_{\mu<\nu} S_{\mu\nu}(E_{\mu\nu} + E_{\nu\mu})$ — they span — and each puts its 1s where no other one does, so they are independent.` },
      { label: 'Dimension', text: t`$4 + 6 = 10$ basis matrices, so the dimension is 10. In general a symmetric $n\times n$ matrix has $n(n + 1)/2$ free entries: $4\cdot5/2 = 10$.` },
      { label: 'Why GR cares', text: t`Einstein’s field equations set one symmetric $4\times4$ array (curvature) equal to another (energy and momentum), so they are 10 equations — one per dimension of this space (the dissection gr.EQ.1 counts them the same way).` },
    ],
    answer: t`They form a subspace of the 16-dimensional space of $4\times4$ matrices, with a basis of 10 matrices: dimension 10.`,
  },
  practice: [
    mcq({
      id: 'which-space', difficulty: 1,
      prompt: 'Which set is a vector space, with the usual addition and scaling of functions or vectors?',
      choices: [t`The solutions of $y'' + 4y = 0$`, t`The solutions of $y'' + 4y = 1$`, t`The functions with $f(0) = 1$`, t`The unit vectors in $\mathbb R^3$`],
      answer: 0,
      why: {
        1: t`The zero function is not a solution ($0 + 0 \ne 1$), and the sum of two solutions solves $y'' + 4y = 2$ — the picture shows it.`,
        2: t`The zero function has $f(0) = 0$, not 1; and if $f(0) = g(0) = 1$ then $(f + g)(0) = 2$.`,
        3: t`The zero vector is not a unit vector, and doubling a unit vector gives length 2: not closed under scaling.`,
      },
      hints: [t`Check first whether the zero element (zero function, zero vector) belongs to the set.`, 'Then check that sums and multiples stay inside.'],
      teach: 'A set is a vector space under the usual operations only if it contains the zero element and is closed under addition and scaling — so a linear equation must have right-hand side 0.',
      explain: t`If $y_1'' + 4y_1 = 0$ and $y_2'' + 4y_2 = 0$, then $(ay_1 + by_2)'' + 4(ay_1 + by_2) = a\cdot0 + b\cdot0 = 0$: closed, and $y = 0$ is a solution. With right-hand side 1 the zero function fails, and sums land on the wrong right-hand side. The solutions of $y'' + 4y = 0$ form a 2-dimensional space with basis $\cos 2x$, $\sin 2x$.`,
      visual: { type: 'graph', params: { x: [-0.2, 6.5], y: [-1.2, 2.2], aspect: 'wide', xlabel: 'x', ylabel: 'y', curves: [{ fn: '0.25 + cos(2x)', color: 'accent' }, { fn: '0.25 - 0.5*sin(2x)', color: 'warn' }, { fn: '0.5 + cos(2x) - 0.5*sin(2x)', color: 'gold', width: 2.8 }], hlines: [{ y: 0.25, color: 'ink3' }, { y: 0.5, color: 'gold' }] }, caption: 'Two solutions of y″ + 4y = 1 (blue, orange), each oscillating about y = ¼, and their sum (gold), which oscillates about y = ½: the sum solves y″ + 4y = 2 instead.' },
    }),
    num({
      id: 'matrix-dim', difficulty: 1,
      gen(r) {
        const key = r.pick(Object.keys(KINDS)), n = r.int(2, 5), K = KINDS[key], ans = K.dim(n);
        return {
          prompt: t`What is the dimension of the vector space of ${K.name.replace(/n\\times n/g, `${n}\\times ${n}`)}?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * n, feedback: t`That counts every entry. The condition ties some entries to others (or forces them to 0), and only the free ones count.` }].filter((e) => e.value !== ans),
          hints: ['Count the entries you can still choose freely once the condition is imposed.', t`For $n = ${n}$: ${K.how(n)}.`],
          teach: 'The dimension of a space of matrices is the number of entries you can choose freely: each independent condition removes one.',
          explain: t`${K.how(n)}: dimension $${ans}$. A basis is one matrix per free entry (with its forced partners filled in).`,
          visual: arrayGrid(n, { mirror: key === 'sym' || key === 'anti', zeroDiag: false, caption: `The ${n} × ${n} array, one dot per entry, diagonal in gold.${key === 'sym' || key === 'anti' ? ' Violet dashed: the mirror line.' : ''}` }),
        };
      },
    }),
    num({
      id: 'pauli-coords', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 100; k++) {
          const p = r.int(-4, 5), q = r.intExcept(-3, 3, [0]), s = r.int(-4, 5), ask = r.pick(['alpha', 'gamma']);
          if (p === s || p === -s) continue;
          const alpha = (p + s) / 2, gamma = (p - s) / 2, ans = ask === 'alpha' ? alpha : gamma, greek = ask === 'alpha' ? '\\alpha' : '\\gamma';
          return {
            prompt: t`The symmetric $2\times2$ matrices form a 3-dimensional space with basis $$I = ${matTeX([[1, 0], [0, 1]])},\quad X = ${matTeX([[0, 1], [1, 0]])},\quad Z = ${matTeX([[1, 0], [0, -1]])}.$$ Write $M = ${matTeX([[p, q], [q, s]])} = \alpha I + \beta X + \gamma Z$. What is $${greek}$?`,
            answer: ans, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: p, feedback: t`The top-left entry gets contributions from both $I$ and $Z$: $\alpha + \gamma = ${p}$.` }, { value: ask === 'alpha' ? gamma : alpha, feedback: ask === 'alpha' ? t`That is $\gamma$, the coefficient of $Z$.` : t`That is $\alpha$, the coefficient of $I$.` }].filter((e) => e.value !== ans),
            hints: [t`Compare entries: $\alpha I + \beta X + \gamma Z = \begin{bmatrix} \alpha + \gamma & \beta \\ \beta & \alpha - \gamma \end{bmatrix}$.`, t`So $\alpha + \gamma = ${p}$ and $\alpha - \gamma = ${s}$: add or subtract.`],
            teach: 'Coordinates in a basis of matrices are found exactly as for arrows: match the entries and solve the linear equations.',
            explain: t`$\alpha + \gamma = ${p}$ and $\alpha - \gamma = ${s}$ give $\alpha = ${nice(alpha)}$ and $\gamma = ${nice(gamma)}$, and $\beta = ${q}$: $M = ${nice(alpha)}I + (${q})X + (${nice(gamma)})Z$. In quantum mechanics the same idea, with complex entries and a third matrix $Y$, writes every spin-½ observable in terms of the Pauli matrices (LA-13).`,
            visual: stems([['M', [p, q, q, s], 'gold'], ['I', [1, 0, 0, 1], 'accent'], ['X', [0, 1, 1, 0], 'warn'], ['Z', [1, 0, 0, -1], 'good']], { labels: ['a₁₁', 'a₁₂', 'a₂₁', 'a₂₂'], xlabel: 'entry', caption: 'Each matrix as a vector of its four entries, one stem per entry: a 2 × 2 matrix is just a vector in a 4-dimensional space.' }),
          };
        }
        return { prompt: t`$M = \begin{bmatrix} 3 & 1 \\ 1 & 1 \end{bmatrix} = \alpha I + \beta X + \gamma Z$. $\alpha$?`, answer: 2, hints: ['α + γ = 3, α − γ = 1.'], teach: 'Match entries.', explain: t`$\alpha = 2$.` };
      },
    }),
    mcq({
      id: 'func-dependent', difficulty: 2,
      prompt: 'Which set of functions is linearly dependent?',
      choices: [t`$\{1,\ \cos 2x,\ \cos^2 x\}$`, t`$\{1,\ x,\ x^2\}$`, t`$\{\sin x,\ \cos x\}$`, t`$\{e^{x},\ e^{2x}\}$`],
      answer: 0,
      why: {
        1: t`$a + bx + cx^2$ is the zero *function* only if $a = b = c = 0$: a nonzero polynomial of degree at most 2 has at most two roots, not infinitely many.`,
        2: t`If $\sin x = c\cos x$ for every $x$, then $x = 0$ gives $0 = c$, and then $\sin x = 0$ for all $x$ — false. So neither is a multiple of the other.`,
        3: t`$e^{2x}/e^{x} = e^{x}$ is not constant, so neither is a constant multiple of the other.`,
      },
      hints: ['Look for an identity among the functions that holds for every x.', t`The double-angle formula: $\cos 2x = 2\cos^2 x - 1$.`],
      teach: 'Functions are dependent when some combination with weights not all zero is the zero function — zero for every x, not just at a few points.',
      explain: t`$\cos 2x = 2\cos^2 x - 1$ for every $x$, so $1\cdot1 + 1\cdot\cos 2x - 2\cdot\cos^2 x = 0$ identically: a nontrivial combination equal to the zero function. The three functions span only a 2-dimensional space.`,
      visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-1.3, 1.5], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: '1', color: 'ink3', width: 1.6, label: '1', labelAt: -3, labelDy: -10 }, { fn: 'cos(2x)', color: 'accent', label: 'cos 2x', labelAt: 2.5, labelDy: 14 }, { fn: 'cos(x)^2', color: 'warn', label: 'cos² x', labelAt: -1.9, labelDy: -10 }] }, caption: 'The functions 1 (grey), cos 2x (blue) and cos² x (orange). Notice that the orange curve sits exactly halfway between the other two.' },
    }),
    num({
      id: 'ode-coords', difficulty: 2,
      gen(r) {
        const w = r.pick([2, 4, 5, 10]), x0 = r.pick([0.1, 0.2, -0.1, 0.05, 0.3]), v0 = r.pick([0.4, -0.6, 1, 2, -1.5]);
        return {
          prompt: t`A mass on a spring obeys $x'' + \omega^2 x = 0$ with $\omega = ${w}$ rad/s, so every motion is $x(t) = c_1\cos\omega t + c_2\sin\omega t$. It starts at $x(0) = ${x0}$ m with velocity $x'(0) = ${v0}$ m/s. What is its coordinate $c_2$ on the basis function $\sin\omega t$, in metres?`,
          answer: v0 / w, units: 'm', tol: { rel: 0.005, abs: 1e-4 },
          errors: [{ value: v0, feedback: t`$x'(t) = -c_1\omega\sin\omega t + c_2\omega\cos\omega t$, so $x'(0) = c_2\omega$: divide by $\omega$.` }, { value: v0 * w, feedback: t`Divide by $\omega$, don’t multiply: $x'(0) = c_2\omega$.` }].filter((e) => Math.abs(e.value - v0 / w) > 1e-9),
          hints: [t`At $t = 0$, $\cos 0 = 1$ and $\sin 0 = 0$: $x(0) = c_1$.`, t`Differentiate: $x'(0) = c_2\omega$.`],
          teach: 'The solutions of x″ + ω²x = 0 form a 2-dimensional space; the two initial conditions are, up to the factor ω, a motion’s coordinates in the basis {cos ωt, sin ωt}.',
          explain: t`$c_1 = x(0) = ${x0}$ m and $c_2 = x'(0)/\omega = ${v0}/${w} = ${nice(v0 / w, 4)}$ m. Two numbers fix the motion because the solution space has dimension 2 — the same reason an orbit needs a starting position *and* a starting velocity.`,
          visual: { type: 'graph', params: { x: [0, (2 * Math.PI) / w * 1.5], y: [-1.3, 1.3], aspect: 'wide', xlabel: 't (s)', ylabel: '', curves: [{ fn: `cos(${w}*x)`, color: 'accent', label: 'cos ωt', labelAt: 0.02, labelDx: 6, labelDy: -10 }, { fn: `sin(${w}*x)`, color: 'warn', label: 'sin ωt', labelAt: (0.25 * 2 * Math.PI) / w, labelDy: -10 }] }, caption: `The two basis motions for ω = ${w} rad/s, with unit amplitude. Every motion of this spring is a combination of them.` },
        };
      },
    }),
    mcq({
      id: 'invertible-error', kind: 'error', difficulty: 3,
      prompt: t`A student claims: “The invertible $2\times2$ matrices form a vector space, because the product of two invertible matrices is invertible.” What is wrong?`,
      choices: [t`A vector space must be closed under *addition*, and it is not: $I + (-I) = 0$, which is not invertible — and the zero matrix is not even in the set`, 'Nothing: closure under products is what a vector space needs', 'Matrices cannot form a vector space at all, since they are not arrows', 'It is a vector space, of dimension 4, like all 2 × 2 matrices'],
      answer: 0,
      why: {
        1: 'Vector spaces are about adding and scaling, not multiplying. Closure under products is a different structure (a group).',
        2: t`All $2\times2$ matrices do form a vector space (dimension 4) — anything you can add and scale by the usual rules qualifies.`,
        3: 'The invertible ones are only a subset, and the subset fails the closure test: it misses the zero matrix.',
      },
      hints: ['Which operations must a vector space be closed under?', t`Is the zero matrix invertible? What is $I + (-I)$?`],
      teach: 'A subset is a vector space only if it contains zero and is closed under addition and scaling; the invertible matrices fail both.',
      explain: t`$I$ and $-I$ are invertible, but their sum is the zero matrix, which squashes everything to $\mathbf 0$ and has no inverse. So the set is not closed under addition, and it does not contain the zero element. (It is closed under multiplication, which makes it a *group* — important in physics, e.g. rotations and Lorentz transformations — but not a vector space.)`,
      visual: map2d([[0, 0], [0, 0]], { view: 1.6, colNames: ['', ''], caption: 'The zero matrix I + (−I) as a map: the whole plane — grid, square and F — is crushed onto the origin. Nothing can undo that, so it has no inverse.' }),
    }),
    mcq({
      id: 'superposition', difficulty: 2,
      prompt: t`Quantum mechanics describes a particle by a wavefunction $\psi(x)$, and if $\psi_1$ and $\psi_2$ are possible states, so is $a\psi_1 + b\psi_2$ (after rescaling to total probability 1). Why does the theory allow this?`,
      choices: [t`The Schrödinger equation is linear, so combinations of solutions are solutions: they form a vector space`, 'Every wavefunction is normalized, and normalized functions add to normalized functions', 'Wavefunctions are real-valued, and real functions can always be added', 'Energy is conserved, so states can be combined'],
      answer: 0,
      why: {
        1: t`Normalization is *not* preserved by adding: two unit-norm states add to something of a different norm, which is why the combination must be rescaled.`,
        2: 'Wavefunctions are in general complex-valued; and being addable is not the point — the equation must accept the sum as a solution.',
        3: 'Conservation of energy does not decide whether sums of solutions are solutions; linearity does.',
      },
      hints: ['What property of an equation guarantees that sums and multiples of solutions are solutions?'],
      teach: 'Superposition is linearity: because the Schrödinger equation is linear, its solutions form a vector space.',
      explain: t`The Schrödinger equation has the form $i\hbar\,\partial_t\psi = \hat H\psi$ with $\hat H$ a linear operator, so any combination $a\psi_1 + b\psi_2$ of solutions is a solution: they form a vector space, over the complex numbers. Physical states are then the normalized ones, with total probability 1, so a superposition is added and then rescaled. The picture shows two standing waves of a particle in a box and one superposition.`,
      visual: { type: 'graph', params: { x: [-0.05, 1.05], y: [-2.2, 2.6], aspect: 'wide', xlabel: 'x / L', ylabel: '', curves: [{ fn: 'sqrt(2)*sin(pi*x)', color: 'accent', domain: [0, 1], label: 'ψ₁', labelAt: 0.5, labelDy: -12 }, { fn: 'sqrt(2)*sin(2*pi*x)', color: 'warn', domain: [0, 1], label: 'ψ₂', labelAt: 0.75, labelDy: 16 }, { fn: '0.6*sqrt(2)*sin(pi*x) + 0.8*sqrt(2)*sin(2*pi*x)', color: 'gold', width: 2.8, domain: [0, 1], label: '0.6ψ₁ + 0.8ψ₂', labelAt: 0.22, labelDx: -40, labelDy: -14 }] }, caption: 'The two lowest standing waves of a particle in a box of width L and the combination 0.6ψ₁ + 0.8ψ₂ (already normalized, since 0.6² + 0.8² = 1). Real-valued here; in general wavefunctions are complex.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-poly-dim', difficulty: 2,
      gen(r) {
        const n = r.int(2, 6);
        return {
          prompt: t`What is the dimension of the vector space of polynomials of degree at most $${n}$?`,
          answer: n + 1, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n, feedback: t`Don’t forget the constant term: $1, x, \dots, x^${n}$ is ${n + 1} functions, not ${n}.` }],
          hints: [t`A basis: $1, x, x^2, \dots, x^${n}$. Count them.`],
          teach: 'Polynomials of degree at most n have the basis 1, x, …, xⁿ: dimension n + 1.',
          explain: t`Every such polynomial is $a_0 + a_1x + \dots + a_${n}x^${n}$, a unique combination of $1, x, \dots, x^${n}$: ${n + 1} basis functions, dimension $${n + 1}$. LA-6.2 uses exactly these coefficients as coordinates.`,
          visual: { type: 'graph', params: { x: [-1.2, 1.2], y: [-1.2, 1.3], aspect: 'wide', xlabel: 'x', ylabel: '', curves: Array.from({ length: Math.min(n, 4) + 1 }, (_, k) => ({ fn: k === 0 ? '1' : `x^${k}`, color: ['ink3', 'accent', 'warn', 'good', 'violet'][k], width: 2 })) }, caption: `Some of the basis functions 1, x, x², … on −1 ≤ x ≤ 1.` },
        };
      },
    }),
    mcq({
      id: 'cp-subspace', difficulty: 2,
      prompt: t`Which set is a subspace of the vector space of all functions on $[0, 1]$?`,
      choices: [t`The functions with $f(0) = 0$`, t`The functions with $f(0) = 1$`, t`The functions with $f(x) \ge 0$ for every $x$`, t`The functions with $f(1) = f(0) + 1$`],
      answer: 0,
      why: {
        1: t`The zero function has $f(0) = 0 \ne 1$, and sums of two members have $f(0) = 2$.`,
        2: t`Not closed under scaling: $-1$ times a positive function is negative.`,
        3: t`The zero function fails ($0 \ne 0 + 1$), and if $f$ and $g$ both qualify then $(f + g)(1) = (f + g)(0) + 2$.`,
      },
      hints: ['Test the zero function, then sums and multiples.'],
      teach: 'A condition defines a subspace when it is linear and homogeneous — “= 0”, not “= 1” or “≥ 0”.',
      explain: t`If $f(0) = 0$ and $g(0) = 0$, then $(af + bg)(0) = 0$: closed under combinations, and it contains the zero function. A linear condition with right-hand side 0 always gives a subspace.`,
      visual: { type: 'graph', params: { x: [-0.05, 1.05], y: [-0.6, 1.6], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: 'x^2', color: 'accent', domain: [0, 1] }, { fn: 'sin(3x)/2', color: 'warn', domain: [0, 1] }, { fn: 'x^2 + sin(3x)/2', color: 'gold', width: 2.8, domain: [0, 1] }], points: [{ x: 0, y: 0, color: 'ink', r: 5 }] }, caption: 'Two functions with f(0) = 0 (blue, orange) and their sum (gold), which also starts at 0.' },
    }),
    num({
      id: 'cp-field-tensor', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([4, 3]);
        const ans = (n * (n - 1)) / 2;
        return {
          prompt: n === 4
            ? t`In relativity the electromagnetic field is an antisymmetric $4\times4$ array $F_{\mu\nu} = -F_{\nu\mu}$ (indices 0 to 3). The antisymmetric $4\times4$ arrays form a vector space. What is its dimension — the number of independent field components?`
            : t`A rigid body’s spin can be described by the antisymmetric $3\times3$ matrix $W$ with $W\mathbf r = \boldsymbol\omega\times\mathbf r$ ($W^{\mathsf T} = -W$). The antisymmetric $3\times3$ matrices form a vector space. What is its dimension?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * n, feedback: 'That counts every entry; antisymmetry ties each entry to its mirror image and forces the diagonal to zero.' }, { value: (n * (n + 1)) / 2, feedback: t`That is the symmetric count. Here the diagonal is forced to zero: $a_{ii} = -a_{ii}$ means $a_{ii} = 0$.` }, { value: n * n - n, feedback: 'The off-diagonal entries come in mirror-image pairs, and each pair is one free number, not two.' }].filter((e, i, all) => all.findIndex((f) => f.value === e.value) === i),
          hints: [t`$F_{\mu\mu} = -F_{\mu\mu}$ forces every diagonal entry to 0.`, t`Off the diagonal, each entry above fixes its mirror image below: count the entries above the diagonal.`],
          teach: 'An antisymmetric n × n array has n(n − 1)/2 independent entries: zero diagonal, and one free number per mirror-image pair.',
          explain: n === 4
            ? t`The diagonal is zero and the 6 entries above it are free: dimension $4\cdot3/2 = 6$. They are exactly the three components of $\mathbf E$ ($F_{0i}$, up to sign and factors of $c$) and the three of $\mathbf B$ ($F_{ij}$): electric and magnetic fields are two halves of one 6-dimensional object, and a Lorentz boost mixes them.`
            : t`The diagonal is zero and the 3 entries above it are free: dimension $3\cdot2/2 = 3$ — exactly the three components of $\boldsymbol\omega$ (LA-4.2’s cross-product matrix). In three dimensions, and only there, an antisymmetric matrix carries the same information as a vector.`,
          visual: arrayGrid(n, { mirror: true, zeroDiag: true, caption: `The ${n} × ${n} array, one dot per entry: the diagonal (grey, marked 0) is forced to zero, and the violet dashed mirror line pairs each entry with its negative.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Axler, Linear Algebra Done Right (4th ed.), ch. 1 (open access)', url: 'https://linear.axler.net/' },
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §3.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Carroll, Spacetime and Geometry (2004), §1.5–1.10 (tensors; the field-strength tensor)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
  ],
});
