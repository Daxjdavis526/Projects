// Function spaces: polynomials as coordinate vectors, d/dx as a matrix (its
// kernel, range and powers), and a preview of inner products of functions —
// orthogonal sines, Fourier coefficients as projections, quantum amplitudes.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, polyTeX } from '../../src/core/format.js';
import { matTeX, tupleTeX, colTeX } from './_la.js';

const t = String.raw;
const D3 = [[0, 1, 0, 0], [0, 0, 2, 0], [0, 0, 0, 3], [0, 0, 0, 0]];
const MONO = ['1', 'x', 'x²', 'x³'];
const polyFn = (c) => c.map((a, k) => `(${a})*x^${k}`).join(' + ');
// signed area of a product on the graph sim: blue above the axis, red below
const productPicture = (f, g, prod, x, y, [from, to], caption, extra = []) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide', xlabel: 'x', ylabel: '',
    shade: [{ fn: `max(${prod}, 0)`, from, to, color: 'accent', alpha: 0.25 }, { fn: `min(${prod}, 0)`, from, to, color: 'bad', alpha: 0.25 }],
    curves: [...(f ? [{ fn: f, color: 'ink3', width: 1.4, dash: true }] : []), ...(g ? [{ fn: g, color: 'warn', width: 1.4, dash: true }] : []), { fn: prod, color: 'gold', width: 2.4 }, ...extra],
  },
  caption,
});
const OPS = {
  D2: { name: t`D^2 = \dfrac{d^2}{dx^2}`, col: (k) => { const c = [0, 0, 0, 0]; if (k >= 2) c[k - 2] = k * (k - 1); return c; }, img: (k) => (k < 2 ? '0' : k === 2 ? '2' : '6x') },
  xD: { name: t`x\dfrac{d}{dx}\ (p \mapsto x\,p')`, col: (k) => { const c = [0, 0, 0, 0]; c[k] = k; return c; }, img: (k) => (k === 0 ? '0' : k === 1 ? 'x' : `${k}x${k === 2 ? '²' : '³'}`) },
  DI: { name: t`D + 2I\ (p \mapsto p' + 2p)`, col: (k) => { const c = [0, 0, 0, 0]; c[k] = 2; if (k >= 1) c[k - 1] = k; return c; }, img: (k) => ['2', '1 + 2x', '2x + 2x²', '3x² + 2x³'][k] },
};

export default lesson({
  id: 'math2270.LA-6.2',
  title: 'Function spaces and polynomials as vectors',
  minutes: 13, difficulty: 3,
  intro: t`Record a polynomial of degree at most 3 by its coefficients and it becomes a vector in $\mathbb R^4$. Differentiation is linear, so in the basis $1, x, x^2, x^3$ it becomes a $4\times4$ matrix, whose columns are the derivatives of the basis polynomials:

$$p(x) = a_0 + a_1x + a_2x^2 + a_3x^3 \;\longleftrightarrow\; \begin{bmatrix} a_0 \\ a_1 \\ a_2 \\ a_3 \end{bmatrix}, \qquad \frac{d}{dx} \;\longleftrightarrow\; D = ${matTeX(D3)}$$

Functions on an interval also form a vector space, though an infinite-dimensional one. Give it an **inner product** $\langle f, g\rangle = \int_a^b f(x)\,g(x)\,dx$ and functions get lengths and angles. On $[-\pi, \pi]$, $\sin x, \sin 2x, \dots$ are mutually perpendicular, so a Fourier coefficient is a projection — and quantum mechanics expands a state in perpendicular energy states the same way.`,
  symbols: [
    { tex: 'p(x)', text: t`a polynomial of degree at most 3 — one element of the 4-dimensional space $P_3$` },
    { tex: t`a_0, \dots, a_3`, text: t`its coefficients: its coordinates in the basis $1, x, x^2, x^3$` },
    { tex: 'D', text: t`the matrix of $d/dx$ in that basis: column $k + 1$ holds the coordinates of $\frac{d}{dx}x^k = kx^{k-1}$` },
    { tex: t`\langle f, g\rangle`, text: t`the inner product of two functions on $[a, b]$, $\int_a^b f(x)g(x)\,dx$: the function version of the dot product $\sum_k f_kg_k$` },
    { tex: 'x^k', text: t`the $k$-th basis polynomial ($x^0 = 1$)` },
  ],
  why: 'Once a basis is chosen, every linear differential operator is a matrix: that is how computers solve differential equations, and how quantum mechanics turns operators such as energy and momentum into matrices of numbers.',
  visual: {
    type: 'graph',
    title: 'Differentiate with a matrix',
    lead: t`The sliders are the coordinates of $p(x) = a_0 + a_1x + a_2x^2 + a_3x^3$. The orange curve is $p'$, whose coordinates are $D$ times $p$’s: $(a_1,\ 2a_2,\ 3a_3,\ 0)$ — listed under the picture.`,
    tasks: [
      'Change a₀ alone: p slides up and down but p′ does not move. Constants are the kernel of D — the “+ C” of every antiderivative.',
      'Set a₃ = 1 and the others 0: p′ = 3x², whose coordinates (0, 0, 3, 0) are the fourth column of D.',
      'Whatever you do, p′ has no x³ term: the range of D is the polynomials of degree at most 2. Rank 3 plus nullity 1 makes 4.',
    ],
    params: {
      x: [-2.4, 2.4], y: [-6, 6], aspect: 'wide', xlabel: 'x', ylabel: '',
      sliders: [
        { key: 'a0', label: t`$a_0$ (constant)`, min: -2, max: 2, step: 0.5, value: 1, explain: t`Coordinate on the basis polynomial $1$.` },
        { key: 'a1', label: t`$a_1$ (on $x$)`, min: -2, max: 2, step: 0.5, value: -1, explain: t`Coordinate on $x$.` },
        { key: 'a2', label: t`$a_2$ (on $x^2$)`, min: -2, max: 2, step: 0.5, value: 0.5, explain: t`Coordinate on $x^2$.` },
        { key: 'a3', label: t`$a_3$ (on $x^3$)`, min: -2, max: 2, step: 0.5, value: 0.5, explain: t`Coordinate on $x^3$.` },
      ],
      curves: [
        { fn: 'a0 + a1*x + a2*x^2 + a3*x^3', color: 'accent', width: 2.6, label: 'p', labelAt: -1.9, labelDx: -14, labelDy: -6 },
        { fn: 'a1 + 2*a2*x + 3*a3*x^2', color: 'warn', width: 2.6, label: 'p′', labelAt: 1.75, labelDx: 8, labelDy: 0 },
      ],
      readouts: [
        { label: t`$p'$: coefficient of $1$, $a_1$`, expr: 'a1', digits: 3 },
        { label: t`of $x$, $2a_2$`, expr: '2*a2', digits: 3 },
        { label: t`of $x^2$, $3a_3$`, expr: '3*a3', digits: 3 },
        { label: t`of $x^3$`, expr: '0', digits: 3 },
      ],
    },
    caption: 'Blue: p. Orange: its derivative p′, computed as D times the coefficient vector. The window shows −2.4 ≤ x ≤ 2.4 only; cubics run off it.',
  },
  example: {
    prompt: t`Find the matrix $D$ of $d/dx$ on polynomials of degree at most 3 (basis $1, x, x^2, x^3$), use it to differentiate $p(x) = 2 - x + 4x^2 + x^3$, and find the kernel and range of $D$.`,
    visual: { type: 'graph', params: { x: [-3.2, 1.6], y: [-8, 14], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: '2 - x + 4x^2 + x^3', color: 'accent', width: 2.6, label: 'p', labelAt: -1.2, labelDx: 0, labelDy: -14 }, { fn: '-1 + 8x + 3x^2', color: 'warn', width: 2.6, label: 'p′', labelAt: 0.6, labelDx: 10, labelDy: 4 }] }, caption: 'Blue: p = 2 − x + 4x² + x³. Orange: p′ = −1 + 8x + 3x², the derivative the matrix computes. Where p turns around, p′ crosses zero.' },
    steps: [
      { label: 'Columns', text: t`$D(1) = 0$, $D(x) = 1$, $D(x^2) = 2x$, $D(x^3) = 3x^2$. In coordinates: $(0, 0, 0, 0)$, $(1, 0, 0, 0)$, $(0, 2, 0, 0)$, $(0, 0, 3, 0)$. These are the columns: $$D = ${matTeX(D3)}.$$` },
      { label: 'Differentiate', text: t`$p \leftrightarrow (2, -1, 4, 1)$, and $$D${colTeX([2, -1, 4, 1])} = ${colTeX([-1, 8, 3, 0])} \leftrightarrow -1 + 8x + 3x^2.$$ Check by calculus: $\frac{d}{dx}(2 - x + 4x^2 + x^3) = -1 + 8x + 3x^2$ ✓.` },
      { label: 'Kernel', text: t`The first column is zero and the other three are independent, so $N(D)$ is spanned by $(1, 0, 0, 0)$ — the constant polynomials. That is the “$+\,C$”: $D$ cannot tell $p$ from $p + C$.` },
      { label: 'Range', text: t`The pivot columns span the vectors $(b_0, b_1, b_2, 0)$: the range is the polynomials of degree at most 2. Rank 3, nullity 1, and $3 + 1 = 4$ — rank–nullity in a function space.` },
      { label: 'Powers', text: t`Four derivatives kill any cubic, so $D^4 = 0$: a **nilpotent** matrix. It has no inverse, as the kernel already said — differentiation loses the constant.` },
    ],
    answer: t`$D = ${matTeX(D3)}$; $p' = -1 + 8x + 3x^2$; $\ker D$ = the constants, range $D$ = the polynomials of degree at most 2.`,
  },
  practice: [
    num({
      id: 'coords-basis', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const a = r.int(-4, 5), b = r.int(-4, 5), c = r.intExcept(-3, 3, [0]), ask = r.int(0, 2);
          const co = [a - b, b - c, c];
          if (co[ask] === 0) continue;
          const naive = [a, b, c][ask];
          return {
            prompt: t`The polynomials $1$, $1 + x$, $1 + x + x^2$ are a basis of the space of polynomials of degree at most 2. Write $p(x) = ${polyTeX([a, b, c])}$ as $c_0\cdot1 + c_1(1 + x) + c_2(1 + x + x^2)$. What is $c_${ask}$?`,
            answer: co[ask], tol: { rel: 0, abs: 0.01 },
            errors: naive !== co[ask] ? [{ value: naive, feedback: t`That is the coefficient in the standard basis $1, x, x^2$. In this basis each basis polynomial contributes to several powers of $x$.` }] : [],
            hints: [t`Collect powers: $c_0 + c_1(1 + x) + c_2(1 + x + x^2) = (c_0 + c_1 + c_2) + (c_1 + c_2)x + c_2x^2$.`, t`Match: $c_2 = ${c}$, $c_1 + c_2 = ${b}$, $c_0 + c_1 + c_2 = ${a}$. Solve from the top power down.`],
            teach: 'Coordinates of a polynomial in a new basis come from matching coefficients of each power of x — a triangular linear system.',
            explain: t`$c_2 = ${c}$, $c_1 = ${b} - (${c}) = ${b - c}$, $c_0 = ${a} - (${b}) = ${a - b}$. Check: $${a - b} + (${b - c})(1 + x) + (${c})(1 + x + x^2) = ${polyTeX([a, b, c])}$ ✓.`,
            visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-4, 6], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: '1', color: 'ink3', width: 1.6, dash: true }, { fn: '1 + x', color: 'accent', width: 1.6, dash: true }, { fn: '1 + x + x^2', color: 'warn', width: 1.6, dash: true }, { fn: `${a} + (${b})*x + (${c})*x^2`, color: 'gold', width: 2.6, label: 'p', labelAt: 1.4, labelDx: 8, labelDy: -4 }] }, caption: 'Dashed: the basis polynomials 1 (grey), 1 + x (blue), 1 + x + x² (orange). Gold: p.' },
          };
        }
        return { prompt: t`Write $3 + 2x + x^2$ in the basis $1, 1 + x, 1 + x + x^2$. $c_2$?`, answer: 1, hints: ['Top power first.'], teach: 'Match coefficients.', explain: t`$c_2 = 1$.` };
      },
    }),
    num({
      id: 'operator-entry', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 100; k++) {
          const key = r.pick(Object.keys(OPS)), O = OPS[key], j = r.int(0, 3), cols = [0, 1, 2, 3].map(O.col);
          const nz = cols[j].map((v, i) => [v, i]).filter(([v]) => v !== 0);
          if (!nz.length) continue;
          const [val, i] = r.pick(nz);
          return {
            prompt: t`In the basis $1, x, x^2, x^3$, what is the entry in row ${i + 1}, column ${j + 1} of the matrix of the linear map $${O.name}$ on polynomials of degree at most 3?`,
            answer: val, tol: { rel: 0, abs: 0.01 },
            errors: (() => { const tr = cols[i] ? cols[i][j] : null; return tr !== null && tr !== val ? [{ value: tr, feedback: t`That is the entry in row ${j + 1}, column ${i + 1}. Column ${j + 1} is the image of the basis polynomial $${['1', 'x', 'x^2', 'x^3'][j]}$; row ${i + 1} reads its coefficient of $${['1', 'x', 'x^2', 'x^3'][i]}$.` }] : []; })(),
            hints: [t`Column ${j + 1} holds the coordinates of the map applied to the basis polynomial $${['1', 'x', 'x^2', 'x^3'][j]}$.`, t`That image is ${O.img(j)}; row ${i + 1} is its coefficient of $${['1', 'x', 'x^2', 'x^3'][i]}$.`],
            teach: 'To find the matrix of any linear operator on polynomials, apply it to each basis polynomial and write the result’s coefficients as a column.',
            explain: t`The map sends $${['1', 'x', 'x^2', 'x^3'][j]}$ to ${O.img(j)}, with coordinates $${tupleTeX(cols[j])}$, so the entry is $${val}$. The whole matrix is $${matTeX([0, 1, 2, 3].map((ii) => cols.map((c) => c[ii])))}$.`,
            visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-2.2, 2.6], aspect: 'wide', xlabel: 'x', ylabel: '', curves: MONO.map((m, q) => ({ fn: q === 0 ? '1' : `x^${q}`, color: ['ink3', 'accent', 'warn', 'good'][q], width: q === j ? 3 : 1.4, dash: q !== j, label: m, labelAt: [1.3, 1.25, 1.2, 1.15][q], labelDx: 8, labelDy: [0, 8, -6, -10][q] })) }, caption: `The basis polynomials 1, x, x², x³; the one whose image is column ${j + 1} is drawn bold.` },
          };
        }
        return { prompt: t`Matrix of $D^2$ on cubics: entry row 1, column 3?`, answer: 2, hints: ['D²(x²) = 2.'], teach: 'Columns are images.', explain: t`$2$.` };
      },
    }),
    mcq({
      id: 'kernel-D2', difficulty: 2,
      prompt: t`What is the kernel of the second derivative $D^2$ acting on polynomials of degree at most 3?`,
      choices: [t`The polynomials $a + bx$ (degree at most 1): a 2-dimensional space`, 'The constant polynomials only', 'Only the zero polynomial', t`The polynomials of degree at most 2`],
      answer: 0,
      why: {
        1: t`Constants are in it, but so is $x$: $D^2x = 0$. The kernel of $D^2$ is bigger than the kernel of $D$.`,
        2: t`Many nonzero polynomials have zero second derivative — every straight line does.`,
        3: t`$D^2(x^2) = 2 \ne 0$: $x^2$ is not in the kernel.`,
      },
      hints: [t`Which polynomials have $p'' = 0$ for every $x$?`, t`Straight lines: $p = a + bx$. Its matrix $D^2$ has two zero columns.`],
      teach: 'The kernel of D² is the straight lines a + bx: two free constants, which is why a second-order equation needs two initial conditions.',
      explain: t`$D^2(a + bx + cx^2 + dx^3) = 2c + 6dx$, which is zero exactly when $c = d = 0$. So $\ker D^2 = \{a + bx\}$, dimension 2, and its range is $\{2c + 6dx\}$, the polynomials of degree at most 1: $2 + 2 = 4$. This is why solving $y'' = f$ leaves two constants — a falling body needs both a starting position and a starting velocity.`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-3, 3], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: '1 + 0.5x', color: 'accent' }, { fn: '-1 + x', color: 'warn' }, { fn: '2 - x', color: 'good' }, { fn: '-0.5', color: 'violet' }] }, caption: 'A few polynomials whose second derivative is zero at every x.' },
    }),
    num({
      id: 'inner-product', difficulty: 2,
      gen(r) {
        const m = r.int(0, 3), n = r.int(1, 3), ans = 1 / (m + n + 1);
        const pw = (k) => (k === 0 ? '1' : k === 1 ? 'x' : `x^${k}`), f = pw(m), g = pw(n);
        return {
          prompt: t`With the inner product $\langle f, g\rangle = \int_0^1 f(x)\,g(x)\,dx$, find $\langle ${pw(m)},\ ${pw(n)}\rangle$ to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005 }, sigfigs: 3, integrand: `x^${m + n}`, limits: [0, 1],
          errors: m > 1 && n > 1 ? [{ value: 1 / (m * n + 1), feedback: t`Multiplying powers adds the exponents: $x^${m}\cdot x^${n} = x^{${m + n}}$, not $x^{${m * n}}$.` }].filter((e) => Math.abs(e.value - ans) > 1e-9) : [],
          hints: [t`$\langle ${pw(m)}, ${pw(n)}\rangle = \int_0^1 ${pw(m + n)}\,dx$.`, t`$\int_0^1 x^k\,dx = \dfrac{1}{k + 1}$.`],
          teach: 'The inner product of two functions multiplies them point by point and integrates — the continuous version of multiplying components and adding.',
          explain: t`$\int_0^1 ${pw(m + n)}\,dx = \dfrac{1}{${m + n + 1}} \approx ${nice(ans, 3)}$. Like a dot product, it is large when the functions are large in the same places; it is never zero for these two, since both are positive on $(0, 1)$ — the monomials are independent but not perpendicular, which is why LA-10 turns them into perpendicular polynomials by Gram–Schmidt (on $[-1, 1]$ the result is Legendre’s).`,
          visual: productPicture(f, g, `x^${m + n}`, [-0.1, 1.15], [-0.15, 1.2], [0, 1], 'Dashed: the two functions on 0 ≤ x ≤ 1. Gold: their product; the shaded area under it is the inner product.'),
        };
      },
    }),
    num({
      id: 'orthogonal-sines', difficulty: 2,
      gen(r) {
        const same = r.bool(0.35), m = r.int(1, 4), n = same ? m : r.intExcept(1, 4, [m]);
        const ans = same ? Math.PI : 0;
        return {
          prompt: t`On $[-\pi, \pi]$, with $\langle f, g\rangle = \int_{-\pi}^{\pi} f(x)g(x)\,dx$, find $\langle \sin ${m === 1 ? '' : m}x,\ \sin ${n === 1 ? '' : n}x\rangle$ to 3 decimal places.`,
          answer: ans, tol: { rel: 0, abs: 0.002 }, integrand: `sin(${m}x)*sin(${n}x)`, limits: [-Math.PI, Math.PI],
          errors: same ? [{ value: 2 * Math.PI, feedback: t`$\int_{-\pi}^{\pi}\sin^2(${m}x)\,dx$ averages $\tfrac12$ over a length $2\pi$: the answer is $\pi$, not $2\pi$.` }] : [{ value: Math.PI, feedback: t`Only equal frequencies give $\pi$. For $${m} \ne ${n}$ the product’s positive and negative areas cancel exactly.` }],
          hints: [t`Use $\sin A\sin B = \tfrac12[\cos(A - B) - \cos(A + B)]$.`, same ? t`With $A = B$: $\sin^2 A = \tfrac12(1 - \cos 2A)$, and $\cos$ of a whole number times $x$ integrates to 0 over $[-\pi, \pi]$.` : t`Both $\cos(${Math.abs(m - n)}x)$ and $\cos(${m + n}x)$ integrate to 0 over $[-\pi, \pi]$: whole numbers of periods.`],
          teach: 'sin x, sin 2x, sin 3x, … are mutually perpendicular on [−π, π]: different frequencies give inner product 0, and each has squared length π.',
          explain: same ? t`$\int_{-\pi}^{\pi}\sin^2(${m}x)\,dx = \pi$: the squared length of $\sin ${m}x$. It is never 0 — a nonzero function is never perpendicular to itself.` : t`The product $\sin ${m}x\,\sin ${n}x$ is as much negative as positive (the picture), so $\langle\cdot,\cdot\rangle = 0$: the functions are **orthogonal**. This is the fact that makes Fourier series work — and its quantum version says that states of different energy are perpendicular.`,
          visual: productPicture(`sin(${m}x)`, `sin(${n}x)`, `sin(${m}x)*sin(${n}x)`, [-3.3, 3.3], [-1.4, 1.4], [-Math.PI, Math.PI], 'Dashed: the two sines. Gold: their product, with the area above the axis shaded blue and below it red. The inner product is blue minus red.'),
        };
      },
    }),
    num({
      id: 'fourier', difficulty: 3,
      gen(r) {
        const n = r.int(1, 5), bn = (2 * (n % 2 ? 1 : -1)) / n;
        return {
          prompt: t`The function $f(x) = x$ on $[-\pi, \pi]$ is projected onto $\sin ${n === 1 ? '' : n}x$: its Fourier coefficient is $b_${n} = \dfrac{\langle f, \sin ${n === 1 ? '' : n}x\rangle}{\langle \sin ${n === 1 ? '' : n}x, \sin ${n === 1 ? '' : n}x\rangle}$, with $\langle f, g\rangle = \int_{-\pi}^{\pi} fg\,dx$. Find $b_${n}$ to 3 significant figures.`,
          answer: bn, tol: { rel: 0.005 }, sigfigs: 3,
          errors: [{ value: 2 * Math.PI * (n % 2 ? 1 : -1) / n, feedback: t`That is only the numerator $\langle f, \sin ${n === 1 ? '' : n}x\rangle$. Divide by $\langle \sin ${n === 1 ? '' : n}x, \sin ${n === 1 ? '' : n}x\rangle = \pi$.` }],
          hints: [t`The denominator is $\pi$ (previous problem). For the numerator, integrate by parts: $\int_{-\pi}^{\pi} x\sin(${n}x)\,dx = \Big[-\dfrac{x\cos ${n}x}{${n}}\Big]_{-\pi}^{\pi} + \dfrac{1}{${n}}\int_{-\pi}^{\pi}\cos(${n}x)\,dx$.`, t`The last integral is 0, and $\cos(${n}\pi) = ${n % 2 ? -1 : 1}$, so the numerator is $${n % 2 ? '' : '-'}\dfrac{2\pi}{${n}}$.`],
          teach: 'A Fourier coefficient is a projection: the inner product of f with the basis function, divided by that function’s squared length.',
          explain: t`$\langle x, \sin ${n}x\rangle = ${n % 2 ? '' : '-'}\dfrac{2\pi}{${n}}$ and $\langle \sin ${n}x, \sin ${n}x\rangle = \pi$, so $b_${n} = ${n % 2 ? '' : '-'}\dfrac{2}{${n}} \approx ${nice(bn, 3)}$. All together, $x = 2\big(\sin x - \tfrac12\sin 2x + \tfrac13\sin 3x - \dots\big)$ on $(-\pi, \pi)$ — coordinates of $f$ in the perpendicular basis of sines, each found independently because the basis is orthogonal.`,
          visual: productPicture('x', `sin(${n}x)`, `x*sin(${n}x)`, [-3.3, 3.3], [-3.6, 3.6], [-Math.PI, Math.PI], `Dashed: f(x) = x and sin ${n === 1 ? '' : n}x. Gold: their product, blue above the axis and red below; the inner product is blue minus red.`),
        };
      },
    }),
    code({
      id: 'derivative-matrix', difficulty: 2,
      prompt: t`Build the matrix \`D\` of $d/dx$ on polynomials of degree at most 3 (basis $1, x, x^2, x^3$) as a SymPy \`Matrix\`. Then set \`dp\` to \`D\` times the coordinate vector of $p(x) = 5 + 3x - 2x^2 + 4x^3$, and \`kernel\` to a basis of the null space of \`D\`.`,
      starter: t`from sympy import Matrix, zeros

D = zeros(4, 4)
# TODO: fill in D. Column k holds the coefficients of d/dx (x**k) = k*x**(k-1)

p = Matrix([5, 3, -2, 4])   # coefficients of 1, x, x^2, x^3
dp = None                   # TODO: the coefficients of p'
kernel = None               # TODO: a basis of the null space of D

print(D)
print(dp)
`,
      answer: t`from sympy import Matrix, zeros

D = zeros(4, 4)
for k in range(1, 4):
    D[k - 1, k] = k

p = Matrix([5, 3, -2, 4])
dp = D * p
kernel = D.nullspace()

print(D)
print(dp)
`,
      tests: [
        { name: 'D has 1, 2, 3 just above the diagonal and zeros elsewhere', code: 'D == Matrix([[0, 1, 0, 0], [0, 0, 2, 0], [0, 0, 0, 3], [0, 0, 0, 0]])' },
        { name: 'dp is (3, −4, 12, 0): p′ = 3 − 4x + 12x²', code: 'dp == Matrix([3, -4, 12, 0])' },
        { name: 'the kernel is the constants, spanned by (1, 0, 0, 0)', code: 'len(kernel) == 1 and list(kernel[0] / kernel[0][0]) == [1, 0, 0, 0]' },
        { name: 'rank 3, and four derivatives kill every cubic: D⁴ = 0', code: 'D.rank() == 3 and D**4 == zeros(4, 4)' },
      ],
      hints: [t`$\frac{d}{dx}x^k = kx^{k-1}$: the coefficient $k$ goes in row $k - 1$, column $k$ (counting from 0, as Python does).`, t`A loop \`for k in range(1, 4): D[k - 1, k] = k\` fills it; then \`D * p\` and \`D.nullspace()\`.`],
      teach: 'In a basis, differentiation is just a matrix: multiply it by a coefficient vector to differentiate, and its null space is the constants.',
      explain: t`$D$ has $1, 2, 3$ on the superdiagonal. $D\,(5, 3, -2, 4) = (3, -4, 12, 0)$, i.e. $p' = 3 - 4x + 12x^2$ ✓. The null space is spanned by $(1, 0, 0, 0)$ — the constant polynomial 1 — and $D^4 = 0$ because the fourth derivative of any cubic vanishes. Spectral and finite-element solvers do exactly this, with much larger bases.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-taylor-coords', difficulty: 2,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const a = r.int(-3, 4), b = r.int(-3, 4), c = r.intExcept(-2, 3, [0]), ask = r.int(0, 2);
          // p = a + b x + c x², in the basis 1, (x − 1), (x − 1)²: coordinates p(1), p′(1), p″(1)/2
          const co = [a + b + c, b + 2 * c, c];
          if (co[ask] === 0 || co[ask] === [a, b, c][ask]) continue;
          return {
            prompt: t`The polynomials $1$, $(x - 1)$, $(x - 1)^2$ are a basis of the polynomials of degree at most 2. Find the coordinate $c_${ask}$ of $p(x) = ${polyTeX([a, b, c])}$ in $p = c_0 + c_1(x - 1) + c_2(x - 1)^2$.`,
            answer: co[ask], tol: { rel: 0, abs: 0.01 },
            errors: [{ value: [a, b, c][ask], feedback: t`That is the coefficient in the basis $1, x, x^2$. Expand $(x - 1)$ and $(x - 1)^2$, or use $c_0 = p(1)$, $c_1 = p'(1)$, $c_2 = p''(1)/2$.` }],
            hints: [t`Put $x = 1$: every term but $c_0$ vanishes. Differentiate and put $x = 1$ again for $c_1$; twice for $c_2$.`],
            teach: 'Coordinates in the basis 1, (x − a), (x − a)², … are the Taylor coefficients at a: p(a), p′(a), p″(a)/2, …',
            explain: t`$c_0 = p(1) = ${co[0]}$, $c_1 = p'(1) = ${co[1]}$, $c_2 = p''(1)/2 = ${co[2]}$. A Taylor expansion is a change of basis.`,
            visual: { type: 'graph', params: { x: [-1, 3], y: [-6, 10], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: `${a} + (${b})*x + (${c})*x^2`, color: 'accent', width: 2.6 }], vlines: [{ x: 1, color: 'ink3' }] }, caption: 'The polynomial p and the line x = 1, where the new basis is centred.' },
          };
        }
        return { prompt: t`$p = x^2$ in the basis $1, (x - 1), (x - 1)^2$: $c_1$?`, answer: 2, hints: ["p'(1)."], teach: 'Taylor coefficients.', explain: t`$c_1 = 2$.` };
      },
    }),
    mcq({
      id: 'cp-orthogonal', difficulty: 2,
      prompt: t`With $\langle f, g\rangle = \int_{-1}^{1} f(x)\,g(x)\,dx$, which function is orthogonal to the constant function $1$?`,
      choices: [t`$x$`, t`$x^2$`, t`$1 + x$`, t`$e^{x}$`],
      answer: 0,
      why: {
        1: t`$\int_{-1}^{1}x^2\,dx = \tfrac23 \ne 0$: $x^2$ is never negative, so nothing cancels.`,
        2: t`$\int_{-1}^{1}(1 + x)\,dx = 2$: the $x$ part cancels but the $1$ does not.`,
        3: t`$\int_{-1}^{1}e^x\,dx = e - e^{-1} \approx 2.35$: positive everywhere, so no cancellation.`,
      },
      hints: [t`$\langle f, 1\rangle = \int_{-1}^{1} f(x)\,dx$: the signed area under $f$.`, 'An odd function has as much area below the axis as above it on [−1, 1].'],
      teach: 'Two functions are orthogonal when the integral of their product vanishes; on a symmetric interval every odd function is orthogonal to every even one.',
      explain: t`$\langle x, 1\rangle = \int_{-1}^{1}x\,dx = 0$. The polynomials that are mutually orthogonal on $[-1, 1]$ — $1$, $x$, $\tfrac12(3x^2 - 1)$, … — are Legendre’s, the basis behind multipole expansions of gravitational and electric fields.`,
      visual: { type: 'graph', params: { x: [-1.15, 1.15], y: [-1.2, 2.9], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: 'x', color: 'accent', domain: [-1, 1], label: 'x', labelAt: 0.85, labelDx: 6, labelDy: 10 }, { fn: 'x^2', color: 'warn', domain: [-1, 1], label: 'x²', labelAt: -0.9, labelDx: -18, labelDy: -6 }, { fn: '1 + x', color: 'good', domain: [-1, 1], label: '1 + x', labelAt: 0.6, labelDx: -40, labelDy: -10 }, { fn: 'e^x', color: 'violet', domain: [-1, 1], label: 'eˣ', labelAt: 0.95, labelDx: 8, labelDy: -2 }] }, caption: 'The four candidates on −1 ≤ x ≤ 1. Their inner product with 1 is the signed area under each curve.' },
    }),
    num({
      id: 'cp-quantum', difficulty: 3, transfer: true,
      gen(r) {
        const [a, b] = r.pick([[0.6, 0.8], [0.8, 0.6], [0.28, 0.96], [0.96, 0.28], [5 / 13, 12 / 13], [12 / 13, 5 / 13]]), ask = r.int(1, 2);
        const amp = ask === 1 ? a : b, show = (v) => (v === 5 / 13 ? '\\tfrac{5}{13}' : v === 12 / 13 ? '\\tfrac{12}{13}' : nice(v));
        return {
          prompt: t`An electron in a nanowire (a 1D box of width $L$) has energy states $\varphi_n(x) = \sqrt{2/L}\,\sin(n\pi x/L)$, which are orthonormal: $\langle\varphi_m, \varphi_n\rangle = \int_0^L \varphi_m\varphi_n\,dx$ is 1 when $m = n$ and 0 otherwise. It is prepared in the state $\psi = ${show(a)}\,\varphi_1 + ${show(b)}\,\varphi_2$. Quantum mechanics says a measurement of energy gives $E_n$ with probability $|\langle\varphi_n, \psi\rangle|^2$. What is the probability of measuring $E_${ask}$?`,
          answer: amp * amp, tol: { rel: 0.005 },
          errors: [{ value: amp, feedback: t`That is the amplitude $\langle\varphi_${ask}, \psi\rangle$. The probability is its square.` }, { value: (ask === 1 ? b : a) ** 2, feedback: `That is the probability of the other energy level.` }].filter((e) => Math.abs(e.value - amp * amp) > 1e-9),
          hints: [t`Expand: $\langle\varphi_${ask}, \psi\rangle = ${show(a)}\langle\varphi_${ask}, \varphi_1\rangle + ${show(b)}\langle\varphi_${ask}, \varphi_2\rangle$, and use orthonormality.`, t`Only one term survives: the amplitude is $${show(amp)}$. Square it.`],
          teach: 'In an orthonormal basis, a coordinate is just an inner product — and in quantum mechanics the squared coordinates are probabilities.',
          explain: t`Orthonormality kills the cross term: $\langle\varphi_${ask}, \psi\rangle = ${show(amp)}$, so the probability is $\left(${show(amp)}\right)^2 = ${nice(amp * amp, 4)}$. The two probabilities add to 1 because $\psi$ is a unit vector: $\left(${show(a)}\right)^2 + \left(${show(b)}\right)^2 = 1$. That expansion coefficients are found by inner products is the linear algebra; that their squares are probabilities is the Born rule, a postulate of quantum mechanics confirmed by experiment. In general wavefunctions are complex-valued, and the inner product then takes a complex conjugate (LA-13).`,
          visual: { type: 'graph', params: { x: [-0.05, 1.05], y: [-2.2, 2.6], aspect: 'wide', xlabel: 'x / L', ylabel: '', curves: [{ fn: 'sqrt(2)*sin(pi*x)', color: 'accent', width: 1.6, dash: true, domain: [0, 1], label: 'φ₁', labelAt: 0.5, labelDy: -12 }, { fn: 'sqrt(2)*sin(2*pi*x)', color: 'warn', width: 1.6, dash: true, domain: [0, 1], label: 'φ₂', labelAt: 0.75, labelDy: 16 }, { fn: `${a}*sqrt(2)*sin(pi*x) + ${b}*sqrt(2)*sin(2*pi*x)`, color: 'gold', width: 2.8, domain: [0, 1], label: 'ψ', labelAt: 0.3, labelDx: -8, labelDy: -14 }] }, caption: 'The two lowest energy states (dashed) and the prepared state ψ (gold), with L = 1. Heights in units of 1/√L.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.2 (the derivative matrix) and §4.4', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Axler, Linear Algebra Done Right (4th ed.), ch. 3 and 6 (open access)', url: 'https://linear.axler.net/' },
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics (3rd ed.), §2.2 and §3.1', url: 'https://www.cambridge.org/highereducation/search?q=Griffiths%20Introduction%20to%20Quantum%20Mechanics' },
  ],
});
