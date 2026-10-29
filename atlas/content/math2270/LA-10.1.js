// Inner products and orthogonality: perpendicular vectors, orthonormal bases
// (coefficients by dot products), orthogonal matrices, orthogonal
// complements, and inner products beyond Rⁿ (functions, weights).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { dot, matvec, transpose, matTeX, tupleTeX, colTeX, stems, map2d } from './_la.js';
import { cross } from './_ortho.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
// an orthonormal basis of R³ with rational entries, and the matching rotation (det +1)
const Q3 = [[1, 2, 2], [2, 1, -2], [2, -2, 1]].map((q) => q.map((x) => x / 3));
const C = [[1, 2, 2], [2, 1, -2], [-2, 2, -1]].map((q) => q.map((x) => x / 3));
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
// the basis and the direction of x (shrunk to length 1.6 so the unit vectors stay visible)
const q3pic = (x, caption, { xname = '\\mathbf x' } = {}) => ({
  type: 'calc-vectors3d',
  params: {
    range: 2,
    vectors: [
      { to: Q3[0], color: 'good', label: '\\mathbf q_1' }, { to: Q3[1], color: 'warn', label: '\\mathbf q_2' }, { to: Q3[2], color: 'violet', label: '\\mathbf q_3' },
      ...(x ? [{ to: x.map((v) => Math.round((1.6 * v / Math.hypot(...x)) * 1000) / 1000), color: 'accent', label: xname }] : []),
    ],
  },
  caption,
});
const arrows2 = (list, { caption, h = 3 } = {}) => ({
  type: 'graph',
  params: { x: [-2 * h, 2 * h], y: [-h, h], aspect: 'wide', equal: true, xlabel: '', ylabel: '', arrows: list.map((a) => ({ from: [0, 0], width: 2.6, ...a })) },
  caption,
});

// the Explore picture: a fixed x and a basis q₁, q₂ that turns (angle th) and may close up (angle ph between them)
const T1 = 'th*pi/180', T2 = '(th + ph)*pi/180';
const C1 = `(3*cos(${T1}) + 2*sin(${T1}))`, C2 = `(3*cos(${T2}) + 2*sin(${T2}))`;

export default lesson({
  id: 'math2270.LA-10.1',
  title: 'Inner products and orthogonality',
  minutes: 12, difficulty: 2,
  intro: t`Two vectors are **orthogonal** when their dot product is zero: $\mathbf u\cdot\mathbf v = \mathbf u${T}\mathbf v = 0$. A basis of mutually orthogonal unit vectors — an **orthonormal basis** — is the best basis there is, because the coefficient of each basis vector is just a dot product. No system of equations to solve:

$$\mathbf x = (\mathbf q_1\cdot\mathbf x)\,\mathbf q_1 + (\mathbf q_2\cdot\mathbf x)\,\mathbf q_2 + \dots + (\mathbf q_n\cdot\mathbf x)\,\mathbf q_n$$

Put the $\mathbf q_i$ in the columns of a matrix $Q$ and this says $Q${T}Q = I$: the inverse of $Q$ is its transpose. The same idea works wherever there is an **inner product** — a rule $\langle\mathbf u,\mathbf v\rangle$ that is symmetric, linear in each slot and positive for $\mathbf u = \mathbf v \ne \mathbf 0$. For functions on $[0, \pi]$, $\langle f, g\rangle = \int_0^\pi f(x)g(x)\,dx$, and the sines $\sin x, \sin 2x, \dots$ are orthogonal: that is Fourier series.`,
  symbols: [
    { tex: t`\mathbf q_1, \dots, \mathbf q_n`, text: t`an orthonormal basis: $\mathbf q_i\cdot\mathbf q_j = 0$ for $i \ne j$ and $\mathbf q_i\cdot\mathbf q_i = 1$ (each has length 1)` },
    { tex: t`\mathbf x`, text: t`any vector in $\mathbb R^n$` },
    { tex: t`\mathbf q_i\cdot\mathbf x`, text: t`the coefficient (coordinate) of $\mathbf x$ along $\mathbf q_i$: the length of its shadow on $\mathbf q_i$` },
    { tex: t`Q`, text: t`the matrix with columns $\mathbf q_1, \dots, \mathbf q_n$; $Q${T}Q = I$ says the columns are orthonormal. A square such $Q$ is an **orthogonal matrix**` },
    { tex: t`\langle\mathbf u,\mathbf v\rangle`, text: t`an inner product: in $\mathbb R^n$ usually $\mathbf u${T}\mathbf v$; with weights $w_i > 0$, $\sum w_i u_i v_i$; for functions, $\int f g\,dx$` },
    { tex: t`W^{\perp}`, text: t`the orthogonal complement of a subspace $W$: every vector orthogonal to all of $W$` },
  ],
  why: 'Orthogonality is what makes projections, least-squares fits, Fourier series and normal modes computable by dot products alone — and an attitude matrix that turns a spacecraft’s body axes into inertial axes is an orthogonal matrix, inverted by transposing.',
  visual: {
    type: 'graph',
    title: 'Coefficients by dot products — only when the basis is orthonormal',
    lead: t`The blue vector is $\mathbf x = (3, 2)$. Green and orange are unit vectors $\mathbf q_1$ and $\mathbf q_2$. The dashed arrows add $(\mathbf q_1\cdot\mathbf x)\,\mathbf q_1$ and then $(\mathbf q_2\cdot\mathbf x)\,\mathbf q_2$, tip to tail; gold is where that sum ends up.`,
    tasks: [
      'Turn the basis: the two coefficients change, but the gold sum always lands exactly on x, and c₁² + c₂² stays 13 = |x|².',
      'Now close the angle between q₁ and q₂ to 60°: the gold sum misses x. Dot-product coefficients only work for an orthogonal basis.',
      'At 90° turn the basis until c₂ = 0: q₁ then points straight along x.',
    ],
    params: {
      x: [-6, 8], y: [-3, 4], aspect: 'wide', equal: true, xlabel: '', ylabel: '',
      sliders: [
        { key: 'th', label: t`Direction of $\mathbf q_1$`, min: 0, max: 180, step: 5, value: 20, unit: '^\\circ', explain: t`The angle of $\mathbf q_1$ from the $x$-axis.` },
        { key: 'ph', label: t`Angle from $\mathbf q_1$ to $\mathbf q_2$`, min: 45, max: 135, step: 5, value: 90, unit: '^\\circ', explain: t`At $90^\circ$ the basis is orthonormal; anything else is a basis of unit vectors that is not orthogonal.` },
      ],
      arrows: [
        { from: [0, 0], to: [3, 2], color: 'accent', width: 3, label: 'x' },
        { from: [0, 0], to: [`cos(${T1})`, `sin(${T1})`], color: 'good', width: 3, label: 'q₁' },
        { from: [0, 0], to: [`cos(${T2})`, `sin(${T2})`], color: 'warn', width: 3, label: 'q₂' },
        { from: [0, 0], to: [`${C1}*cos(${T1})`, `${C1}*sin(${T1})`], color: 'good', width: 1.8, dash: [6, 4] },
        { from: [`${C1}*cos(${T1})`, `${C1}*sin(${T1})`], to: [`${C1}*cos(${T1}) + ${C2}*cos(${T2})`, `${C1}*sin(${T1}) + ${C2}*sin(${T2})`], color: 'warn', width: 1.8, dash: [6, 4] },
      ],
      points: [{ x: `${C1}*cos(${T1}) + ${C2}*cos(${T2})`, y: `${C1}*sin(${T1}) + ${C2}*sin(${T2})`, color: 'gold', r: 6, label: 'sum', labelDy: 14 }],
      readouts: [
        { label: t`$c_1 = \mathbf q_1\cdot\mathbf x$`, expr: C1, digits: 3 },
        { label: t`$c_2 = \mathbf q_2\cdot\mathbf x$`, expr: C2, digits: 3 },
        { label: t`$c_1^2 + c_2^2$`, expr: `${C1}^2 + ${C2}^2`, digits: 3 },
        { label: t`miss $|c_1\mathbf q_1 + c_2\mathbf q_2 - \mathbf x|$`, expr: `sqrt((${C1}*cos(${T1}) + ${C2}*cos(${T2}) - 3)^2 + (${C1}*sin(${T1}) + ${C2}*sin(${T2}) - 2)^2)`, digits: 3 },
      ],
    },
    caption: 'Arrows to scale. Dashed: the two pieces (q₁·x)q₁ and (q₂·x)q₂, added tip to tail. The gold dot is their sum, which is x itself only when q₁ ⟂ q₂.',
  },
  example: {
    prompt: t`The vectors $\mathbf q_1 = \tfrac13(1, 2, 2)$, $\mathbf q_2 = \tfrac13(2, 1, -2)$ and $\mathbf q_3 = \tfrac13(2, -2, 1)$ form a basis of $\mathbb R^3$. Write $\mathbf x = (6, 3, 3)$ in this basis.`,
    visual: {
      type: 'calc-vectors3d',
      params: {
        range: 7, yaw: 1.2, pitch: 0.4,
        vectors: [
          { to: [6, 3, 3], color: 'accent', label: '\\mathbf x' },
          { to: [2, 4, 4], color: 'good', label: '6\\mathbf q_1' },
          { from: [2, 4, 4], to: [4, 5, 2], color: 'warn', label: '3\\mathbf q_2' },
          { from: [4, 5, 2], to: [6, 3, 3], color: 'violet', label: '3\\mathbf q_3' },
        ],
      },
      caption: 'x (blue) and the answer built tip to tail: 6q₁, then 3q₂, then 3q₃. The three pieces meet at right angles, like the edges of a box. Drag to rotate.',
    },
    steps: [
      { label: 'Check the basis', text: t`$\mathbf q_1\cdot\mathbf q_2 = \tfrac19(2 + 2 - 4) = 0$, $\mathbf q_1\cdot\mathbf q_3 = \tfrac19(2 - 4 + 2) = 0$, $\mathbf q_2\cdot\mathbf q_3 = \tfrac19(4 - 2 - 2) = 0$, and each has length $\tfrac13\sqrt{1 + 4 + 4} = 1$. Orthonormal — so the coefficients are dot products.` },
      { label: 'Dot products', text: t`$c_1 = \mathbf q_1\cdot\mathbf x = \tfrac13(6 + 6 + 6) = 6$, $c_2 = \mathbf q_2\cdot\mathbf x = \tfrac13(12 + 3 - 6) = 3$, $c_3 = \mathbf q_3\cdot\mathbf x = \tfrac13(12 - 6 + 3) = 3$.` },
      { label: 'Why it works', text: t`Dot both sides of $\mathbf x = c_1\mathbf q_1 + c_2\mathbf q_2 + c_3\mathbf q_3$ with $\mathbf q_1$: every term but the first dies, because $\mathbf q_1\cdot\mathbf q_2 = \mathbf q_1\cdot\mathbf q_3 = 0$, and $\mathbf q_1\cdot\mathbf q_1 = 1$. So $c_1 = \mathbf q_1\cdot\mathbf x$. In matrix form, $\mathbf c = Q${T}\mathbf x$.` },
      { label: 'Rebuild', text: t`$6\mathbf q_1 + 3\mathbf q_2 + 3\mathbf q_3 = \tfrac13\big((6, 12, 12) + (6, 3, -6) + (6, -6, 3)\big) = \tfrac13(18, 9, 9) = (6, 3, 3)$ ✓.` },
      { label: 'Sense check', text: t`Lengths agree: $|\mathbf x|^2 = 36 + 9 + 9 = 54$ and $c_1^2 + c_2^2 + c_3^2 = 36 + 9 + 9 = 54$. In an orthonormal basis, length is computed from the coefficients exactly as from the components — Pythagoras still holds, because $Q$ preserves lengths.` },
    ],
    answer: t`$\mathbf x = 6\mathbf q_1 + 3\mathbf q_2 + 3\mathbf q_3$: coordinates $(6, 3, 3)$ in the $\mathbf q$ basis — three dot products, no elimination.`,
  },
  practice: [
    num({
      id: 'perp-k', difficulty: 1,
      gen(r) {
        for (let k = 0; k < 400; k++) {
          const u = [r.intExcept(-3, 3, [0]), r.int(-3, 3), r.pick([1, 2, -1, -2])], d = r.intExcept(-3, 3, [0]), e = r.int(-3, 3);
          const s = u[0] * d + u[1] * e;
          if (s % u[2] !== 0 || s === 0) continue;
          const kk = -s / u[2];
          if (Math.abs(kk) > 9) continue;
          return {
            prompt: t`For which $k$ is $\mathbf u = ${tupleTeX(u)}$ orthogonal to $\mathbf v = (${d}, ${e}, k)$?`,
            answer: kk, tol: { rel: 0, abs: 0.01 },
            errors: [{ value: s / u[2], feedback: t`Check the sign: moving $${s}$ to the other side of $\mathbf u\cdot\mathbf v = 0$ changes its sign.` }],
            hints: [t`Orthogonal means $\mathbf u\cdot\mathbf v = 0$.`, t`$\mathbf u\cdot\mathbf v = (${u[0]})(${d}) + (${u[1]})(${e}) + (${u[2]})k = ${s} + (${u[2]})k$.`],
            teach: 'Two vectors are orthogonal exactly when their dot product is zero — one linear equation for the unknown.',
            explain: t`$${s} + (${u[2]})k = 0$, so $k = ${kk}$. Then $\mathbf v = (${d}, ${e}, ${kk})$ lies in the plane through $\mathbf 0$ perpendicular to $\mathbf u$.`,
            visual: { type: 'calc-vectors3d', params: { range: 3, vectors: [{ to: u, color: 'accent', label: '\\mathbf u' }], planes: [{ normal: u, point: [0, 0, 0], size: 2.6, color: 'violet', alpha: 0.2 }] }, caption: 'u and the plane of every vector orthogonal to it (a patch of it). The answer puts v in this plane. Drag to rotate.' },
          };
        }
        return { prompt: t`For which $k$ is $(1, 2, 1)$ orthogonal to $(1, 1, k)$?`, answer: -3, tol: { rel: 0, abs: 0.01 }, hints: ['Set the dot product to zero.'], teach: 'Orthogonal means a zero dot product.', explain: t`$1 + 2 + k = 0$, $k = -3$.` };
      },
    }),
    num({
      id: 'coef-2d', difficulty: 1,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), q1 = [a / c, b / c], q2 = [-b / c, a / c];
        const x = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])], which = r.int(1, 2), q = which === 1 ? q1 : q2, qi = which === 1 ? [a, b] : [-b, a];
        const ans = dot(q, x);
        return {
          prompt: t`$\mathbf q_1 = \tfrac1{${c}}(${a}, ${b})$ and $\mathbf q_2 = \tfrac1{${c}}(-${b}, ${a})$ are an orthonormal basis of the plane. Find the coefficient $c_${which}$ in $\mathbf x = ${tupleTeX(x)} = c_1\mathbf q_1 + c_2\mathbf q_2$.`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: dot(qi, x), feedback: t`You dotted with $(${qi[0]}, ${qi[1]})$, which has length ${c}, not 1. Divide by ${c}.` }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`With an orthonormal basis, $c_i = \mathbf q_i\cdot\mathbf x$.`, t`$c_${which} = \tfrac1{${c}}\big((${qi[0]})(${x[0]}) + (${qi[1]})(${x[1]})\big)$.`],
          teach: 'In an orthonormal basis each coordinate is a single dot product with a basis vector.',
          explain: t`$c_${which} = \mathbf q_${which}\cdot\mathbf x = ${dot(qi, x)}/${c} = ${nice(ans)}$. Check: $c_1^2 + c_2^2 = ${nice(dot(q1, x) ** 2 + dot(q2, x) ** 2)} = |\mathbf x|^2$.`,
          visual: arrows2([{ to: q1, color: 'good', label: 'q₁' }, { to: q2, color: 'warn', label: 'q₂' }, { to: x, color: 'accent', label: 'x' }], { h: Math.max(2, Math.max(...x.map(Math.abs)) * 0.8 + 0.6), caption: 'The two unit basis vectors and x, to scale.' }),
        };
      },
    }),
    mcq({
      id: 'orth-matrix', difficulty: 2,
      prompt: t`Which matrix is **orthogonal** ($Q${T}Q = I$)?`,
      choices: [t`$\begin{bmatrix} 3/5 & -4/5 \\ 4/5 & 3/5 \end{bmatrix}$`, t`$\begin{bmatrix} 3 & -4 \\ 4 & 3 \end{bmatrix}$`, t`$\begin{bmatrix} 3/5 & 4/5 \\ 4/5 & 3/5 \end{bmatrix}$`, t`$\begin{bmatrix} 2 & 1 \\ 1 & 1 \end{bmatrix}$`],
      answer: 0,
      why: {
        1: t`Its columns are orthogonal, $(3, 4)\cdot(-4, 3) = 0$, but each has length 5: $Q${T}Q = 25I$. “Orthogonal matrix” demands ortho**normal** columns.`,
        2: t`Each column has length 1, but $(3/5, 4/5)\cdot(4/5, 3/5) = 24/25 \ne 0$: the columns are not perpendicular.`,
        3: t`Its determinant is 1, so it keeps areas — but not lengths: it sends $(1, 0)$ to $(2, 1)$, of length $\sqrt5$. Orthogonal means $Q${T}Q = I$, not $\det Q = 1$.`,
      },
      hints: [t`$Q${T}Q$ holds the dot products of the columns: 1 on the diagonal, 0 off it.`, 'Check each column’s length, then the dot product of the two columns.'],
      teach: 'An orthogonal matrix has orthonormal columns — perpendicular and of length 1 — so it preserves every length and angle.',
      explain: t`For $\tfrac15\begin{bmatrix} 3 & -4 \\ 4 & 3 \end{bmatrix}$ both columns have length $\tfrac15\sqrt{9 + 16} = 1$ and their dot product is $\tfrac1{25}(-12 + 12) = 0$, so $Q${T}Q = I$. It is the rotation through $\arctan(4/3) \approx 53^\circ$.`,
      visual: map2d([[3, -4], [4, 3]], { shape: 'circle', view: 5.5, grid: false, colNames: ['', ''], caption: 'The unit circle under the matrix with columns (3, 4) and (−4, 3): turned and blown up fivefold. A map that keeps lengths would leave the circle the same size.' }),
    }),
    num({
      id: 'fourier', difficulty: 2,
      gen(r) {
        const n = r.int(1, 4), b = (2 * (n % 2 ? 1 : -1)) / n, I = Math.PI * (n % 2 ? 1 : -1) / n;
        return {
          prompt: t`On $[0, \pi]$ use the inner product $\langle f, g\rangle = \int_0^\pi f(x)g(x)\,dx$, in which $\sin x, \sin 2x, \sin 3x, \dots$ are mutually orthogonal and $\langle\sin nx, \sin nx\rangle = \pi/2$. The coefficient of $\sin ${n}x$ in the sine series of $f(x) = x$ is $b_${n} = \dfrac{\langle f, \sin ${n}x\rangle}{\langle \sin ${n}x, \sin ${n}x\rangle}$. Find $b_${n}$.`,
          answer: b, tol: { rel: 1e-3 }, integrand: `2/pi*x*sin(${n}x)`, limits: [0, Math.PI], vars: { x: [0, 3] },
          errors: [{ value: I, feedback: t`That is $\langle f, \sin ${n}x\rangle$ alone. Divide by $\langle\sin ${n}x, \sin ${n}x\rangle = \pi/2$ — the basis functions are orthogonal but not of length 1.` }],
          hints: [t`$\int_0^\pi x\sin(nx)\,dx = \dfrac{\pi(-1)^{n+1}}{n}$ (integration by parts).`, t`Then $b_n = \dfrac{\pi(-1)^{n+1}/n}{\pi/2} = \dfrac{2(-1)^{n+1}}{n}$.`],
          teach: 'With an orthogonal (not orthonormal) basis, each coefficient is ⟨f, basis function⟩ divided by the basis function’s own ⟨ , ⟩.',
          explain: t`$\langle x, \sin ${n}x\rangle = ${n % 2 ? '' : '-'}\pi/${n}$, so $b_${n} = ${nice(b)}$. It is exactly the coordinate formula $c_i = \langle\mathbf q_i, \mathbf x\rangle/\langle\mathbf q_i, \mathbf q_i\rangle$, with functions as the vectors: Fourier series are orthogonal expansions.`,
          visual: { type: 'graph', params: { x: [0, Math.PI], y: [-3.2, 3.4], aspect: 'wide', xlabel: 'x', ylabel: '', curves: [{ fn: 'x', color: 'accent', label: 'f(x) = x', labelAt: 2.6, labelDy: -4 }, { fn: `sin(${n}x)`, color: 'warn', label: `sin ${n}x`, labelAt: Math.PI / (2 * n), labelDy: -12 }], shade: [{ fn: `x*sin(${n}x)`, from: 0, to: Math.PI, color: 'gold', alpha: 0.28 }] }, caption: 'f(x) = x (blue), the basis function (orange) and their product (gold area): the inner product is the signed gold area.' },
        };
      },
    }),
    num({
      id: 'weighted', difficulty: 2,
      gen(r) {
        const sig = r.pick([[1, 2, 0.5], [0.5, 1, 2], [2, 1, 1], [1, 0.5, 1]]), w = sig.map((s) => 1 / (s * s));
        let u, v, val, plain;
        for (let k = 0; k < 200; k++) {
          u = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)]; v = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)];
          val = u.reduce((s, x, i) => s + w[i] * x * v[i], 0); plain = dot(u, v);
          if (val !== 0 && Math.abs(val - plain) > 0.1 && u.some((x) => x) && v.some((x) => x)) break;
        }
        return {
          prompt: t`Three readings have uncertainties $\sigma = (${sig.join(', ')})$. A weighted inner product counts each component by $w_i = 1/\sigma_i^2$: $\langle\mathbf u,\mathbf v\rangle_W = \sum_i w_i u_i v_i = \mathbf u${T}W\mathbf v$ with $W = \operatorname{diag}(w_1, w_2, w_3)$. Find $\langle\mathbf u,\mathbf v\rangle_W$ for $\mathbf u = ${tupleTeX(u)}$ and $\mathbf v = ${tupleTeX(v)}$.`,
          answer: val, tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: plain, feedback: t`That is the ordinary dot product. Weight each product $u_iv_i$ by $w_i = 1/\sigma_i^2$ first.` }],
          hints: [t`$w = (${w.map(nice).join(', ')})$.`, t`$\langle\mathbf u,\mathbf v\rangle_W = ${u.map((x, i) => `${nice(w[i])}(${x})(${v[i]})`).join(' + ')}$.`],
          teach: 'A weighted inner product trusts precise components more: it is still symmetric, linear and positive, so all of orthogonality carries over.',
          explain: t`$\langle\mathbf u,\mathbf v\rangle_W = ${nice(val)}$ (the plain dot product is ${plain}). Weighted least squares (LA-10.4) makes the residual orthogonal to the model in exactly this inner product.`,
          visual: stems([['u', u, 'accent'], ['v', v, 'warn']], { caption: 'u and v component by component. The weights scale how much each component’s product counts.' }),
        };
      },
    }),
    num({
      id: 'complement', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 500; k++) {
          const a1 = [1, r.int(-2, 2), r.int(-2, 2)], a2 = [r.int(-2, 2), 1, r.int(-2, 2)], n = cross(a1, a2);
          if (n[2] === 0 || n[0] % n[2] || n[1] % n[2]) continue;
          const m = n.map((x) => x / n[2]), ask = r.int(0, 1);
          if (m[0] === 0 && m[1] === 0) continue;
          return {
            prompt: t`$W$ is the plane in $\mathbb R^3$ spanned by $\mathbf a_1 = ${tupleTeX(a1)}$ and $\mathbf a_2 = ${tupleTeX(a2)}$. Its orthogonal complement $W^\perp$ is a line, spanned by a vector $(n_1, n_2, 1)$. Find $n_${ask + 1}$.`,
            answer: m[ask], tol: { rel: 0, abs: 0.01 },
            errors: [{ value: -m[ask], feedback: t`Check the sign by substituting: both $\mathbf a_1\cdot\mathbf n$ and $\mathbf a_2\cdot\mathbf n$ must be 0.` }].filter((e) => Math.abs(e.value - m[ask]) > 1e-9),
            hints: [t`$\mathbf n$ must be orthogonal to both spanning vectors: $\mathbf a_1\cdot\mathbf n = 0$ and $\mathbf a_2\cdot\mathbf n = 0$ — two equations for $n_1, n_2$.`, t`Or take the cross product $\mathbf a_1\times\mathbf a_2 = ${tupleTeX(n)}$ and scale it so its last component is 1.`],
            teach: 'The orthogonal complement of a subspace is everything orthogonal to a spanning set; in ℝ³ a plane’s complement is its normal line.',
            explain: t`$\mathbf a_1\times\mathbf a_2 = ${tupleTeX(n)}$, so $W^\perp$ is spanned by $${tupleTeX(m)}$ and $n_${ask + 1} = ${m[ask]}$. Check: $\mathbf a_1\cdot\mathbf n = ${dot(a1, m)}$ and $\mathbf a_2\cdot\mathbf n = ${dot(a2, m)}$. In matrix language $W^\perp = N(A${T})$ for $A = [\,\mathbf a_1\ \mathbf a_2\,]$, and $\dim W + \dim W^\perp = 3$.`,
            visual: { type: 'calc-vectors3d', params: { range: 3, planes: [{ normal: n, point: [0, 0, 0], size: 2.6, color: 'violet', alpha: 0.2 }], vectors: [{ to: a1, color: 'good', label: '\\mathbf a_1' }, { to: a2, color: 'warn', label: '\\mathbf a_2' }] }, caption: 'The plane W spanned by a₁ and a₂ (a patch of it). W⊥ is the line through 0 at right angles to it. Drag to rotate.' },
          };
        }
        return { prompt: t`$W = \text{span}\{(1, 0, 1), (0, 1, 1)\}$; $W^\perp$ is spanned by $(n_1, n_2, 1)$. Find $n_1$.`, answer: -1, tol: { rel: 0, abs: 0.01 }, hints: ['Cross product.'], teach: 'Complement = normal line.', explain: t`$(1, 0, 1)\times(0, 1, 1) = (-1, -1, 1)$.` };
      },
    }),
    num({
      id: 'orth-solve', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick(TRIPLES), Q = [[a / c, -b / c], [b / c, a / c]];
        const bb = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])], which = r.int(1, 2);
        const x = matvec(transpose(Q), bb), wrong = matvec(Q, bb);
        return {
          prompt: t`$Q = \tfrac1{${c}}\begin{bmatrix} ${a} & -${b} \\ ${b} & ${a} \end{bmatrix}$ is orthogonal. Solve $Q\mathbf x = ${tupleTeX(bb)}$ without elimination. What is $x_${which}$?`,
          answer: x[which - 1], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: wrong[which - 1], feedback: t`That is $Q\mathbf b$. The inverse of an orthogonal matrix is its **transpose**: $\mathbf x = Q${T}\mathbf b$.` }].filter((e) => Math.abs(e.value - x[which - 1]) > 1e-9),
          hints: [t`$Q${T}Q = I$, so multiplying $Q\mathbf x = \mathbf b$ by $Q${T}$ gives $\mathbf x = Q${T}\mathbf b$.`, t`$Q${T} = \tfrac1{${c}}\begin{bmatrix} ${a} & ${b} \\ -${b} & ${a} \end{bmatrix}$.`],
          teach: 'For an orthogonal matrix the inverse is the transpose, so solving Qx = b costs one matrix–vector product.',
          explain: t`$\mathbf x = Q${T}\mathbf b = ${tupleTeX(x)}$, so $x_${which} = ${nice(x[which - 1])}$. $Q$ turns vectors by $\arctan(${b}/${a})$; $Q${T}$ turns them back.`,
          visual: map2d(Q, { target: bb, shape: 'F', view: Math.max(2.5, Math.max(...bb.map(Math.abs)) * 0.8 + 0.5), colNames: ['Qe₁', 'Qe₂'], caption: 'Q turns the plane rigidly (the F keeps its size and shape). The red ring is b; x is the vector Q turns onto it.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coef3', difficulty: 2,
      gen(r) {
        const x = [r.int(-4, 5), r.int(-4, 5), r.intExcept(-4, 5, [0])], i = r.int(0, 2), ans = dot(Q3[i], x);
        return {
          prompt: t`In the orthonormal basis $\mathbf q_1 = \tfrac13(1, 2, 2)$, $\mathbf q_2 = \tfrac13(2, 1, -2)$, $\mathbf q_3 = \tfrac13(2, -2, 1)$, find the coordinate $c_${i + 1}$ of $\mathbf x = ${tupleTeX(x)}$.`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: 3 * ans, feedback: t`Keep the factor $\tfrac13$: $\mathbf q_${i + 1}$ has length 1 only with it.` }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`$c_${i + 1} = \mathbf q_${i + 1}\cdot\mathbf x$.`],
          teach: 'Coordinates in an orthonormal basis are dot products.',
          explain: t`$c_${i + 1} = \tfrac13(${Q3[i].map((q, k) => `(${Math.round(3 * q)})(${x[k]})`).join(' + ')}) = ${nice(ans)}$.`,
          visual: q3pic(x, 'The orthonormal basis (each vector of length 1) and the direction of x, shrunk to fit. Drag to rotate.'),
        };
      },
    }),
    num({
      id: 'cp-dcm', difficulty: 3, transfer: true,
      gen(r) {
        const Bb = [r.int(-30, 30), r.int(-30, 30), r.intExcept(-40, 40, [0])].map((x) => 3 * Math.round(x / 3) || 3), k = r.int(0, 2);
        const Bi = matvec(transpose(C), Bb), wrong = matvec(C, Bb);
        const nm = ['x', 'y', 'z'][k];
        return {
          prompt: t`A satellite's attitude is the direction-cosine matrix $C = \tfrac13${matTeX([[1, 2, 2], [2, 1, -2], [-2, 2, -1]])}$, which turns inertial components into body components: $\mathbf v_{\text{body}} = C\,\mathbf v_{\text{inertial}}$. Its magnetometer reads $\mathbf B_{\text{body}} = ${tupleTeX(Bb)}\ \mu\text{T}$. What is the inertial $${nm}$-component of the field, in μT?`,
          answer: Bi[k], units: 'uT', tol: { rel: 1e-3, abs: 0.01 },
          errors: [{ value: wrong[k], feedback: t`That applies $C$ again. Going back from body to inertial needs $C^{-1}$, which for an orthogonal matrix is $C${T}$.` }].filter((e) => Math.abs(e.value - Bi[k]) > 1e-6),
          hints: [t`$C$'s rows are orthonormal (check two), so $C^{-1} = C${T}$.`, t`$\mathbf B_{\text{inertial}} = C${T}\mathbf B_{\text{body}}$: its $${nm}$-component is column ${k + 1} of $C$ dotted with $\mathbf B_{\text{body}}$.`],
          teach: 'A direction-cosine matrix is orthogonal, so the reverse transformation is its transpose — no inversion needed on board.',
          explain: t`$\mathbf B_{\text{inertial}} = C${T}\mathbf B_{\text{body}} = ${tupleTeX(Bi.map((v) => Math.round(v * 1000) / 1000))}\ \mu\text{T}$, so the $${nm}$-component is $${nice(Bi[k])}\ \mu\text{T}$. Its length equals that of $\mathbf B_{\text{body}}$, $${nice(Math.hypot(...Bb))}\ \mu\text{T}$: a rotation changes components, never magnitudes. Flight software stores attitude as such a matrix (or a quaternion) because the inverse is free.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.6, vectors: C.map((row, i) => ({ to: row, color: ['good', 'warn', 'violet'][i], label: ['\\hat{\\mathbf b}_1', '\\hat{\\mathbf b}_2', '\\hat{\\mathbf b}_3'][i] })) }, caption: 'The body axes drawn in inertial coordinates: the three rows of C, each of length 1 and mutually perpendicular. Drag to rotate.' },
        };
      },
    }),
    mcq({
      id: 'cp-five', difficulty: 2,
      prompt: t`Can five nonzero vectors in $\mathbb R^4$ be mutually orthogonal?`,
      choices: [
        'No: mutually orthogonal nonzero vectors are linearly independent, and ℝ⁴ holds at most four independent vectors',
        'Yes, if they are not unit vectors',
        'Yes: orthogonality restricts only pairs, and each pair can be arranged',
        'Yes, if two of them are parallel',
      ],
      answer: 0,
      why: {
        1: 'Scaling a vector never changes whether it is orthogonal to another, so lengths are irrelevant.',
        2: 'All the pairs must hold at once. If c₁v₁ + … + c₅v₅ = 0, dotting with vᵢ kills every term but cᵢ|vᵢ|², so every cᵢ = 0: the five would be independent — impossible in ℝ⁴.',
        3: 'Two parallel nonzero vectors have a nonzero dot product, so they are not orthogonal.',
      },
      hints: [t`Suppose $c_1\mathbf v_1 + \dots + c_5\mathbf v_5 = \mathbf 0$ and dot both sides with $\mathbf v_1$.`],
      teach: 'Orthogonal nonzero vectors are automatically independent, so there are at most n of them in ℝⁿ.',
      explain: t`Dotting $\sum c_j\mathbf v_j = \mathbf 0$ with $\mathbf v_i$ leaves $c_i|\mathbf v_i|^2 = 0$, so $c_i = 0$: orthogonal nonzero vectors are independent. Four is the most in $\mathbb R^4$ — for example the rows of the Hadamard matrix shown.`,
      visual: stems([['h₁', [1, 1, 1, 1], 'accent'], ['h₂', [1, -1, 1, -1], 'warn'], ['h₃', [1, 1, -1, -1], 'good'], ['h₄', [1, -1, -1, 1], 'violet']], { caption: 'Four mutually orthogonal vectors in ℝ⁴ (rows of a Hadamard matrix), as stem plots: any two agree in exactly two components and disagree in two, so their dot product is 0.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §4.1 and §4.4', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT 18.06, Lectures 14 and 17: orthogonal vectors and subspaces; orthogonal matrices', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
    { label: 'Wertz (ed.), Spacecraft Attitude Determination and Control, §12.1: direction-cosine matrices', url: 'https://link.springer.com/book/10.1007/978-94-009-9907-7' },
  ],
});
