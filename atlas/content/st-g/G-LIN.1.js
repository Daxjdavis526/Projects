// Multilinear maps and tensor products — a refresher. st-a.A5.1 (multilinear
// machines) and A5.3 (the tensor product, rank one) are the full lessons; this
// one adds the abstract view: a bilinear map is not linear on V × W (it is
// quadratic along the diagonal) but is linear on V ⊗ W, which is why
// dim(V ⊗ W) = mn, not m + n; and component counting — n² for a bilinear
// form, n(n+1)/2 symmetric, n(n−1)/2 antisymmetric, n²(n²−1)/12 for Riemann
// (a code exercise finds 20 in 4D by solving the symmetry constraints).
// Transfers: shear in a pressurized tank wall and a spacecraft's rotational
// kinetic energy, which only sees the inertia tensor's symmetric part.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;

// arrows from the origin in the plane, labelled (plain text)
const arrowsPic = (vecs, caption, R) => {
  const m = R ?? Math.max(...vecs.flatMap(([v]) => v.map(Math.abs))) * 1.3 + 0.4;
  return {
    type: 'graph',
    params: { x: [-1.8 * m, 1.8 * m], y: [-m, m], equal: true, aspect: 'wide', xlabel: 'x¹', ylabel: 'x²', arrows: vecs.map(([v, label, color]) => ({ from: [0, 0], to: v.map(r6), label, color: color || 'accent', width: 2.4, labelDx: 6 })) },
    caption,
  };
};

// an n × n array of components with the diagonal and the upper triangle marked
const grid = (n, caption) => {
  const pts = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pts.push({ x: j + 1, y: n - i, r: 5, color: i === j ? 'gold' : i < j ? 'accent' : 'ink4', hollow: i > j });
  return { type: 'graph', params: { x: [-0.5, n + 1.5], y: [0.3, n + 0.7], equal: true, aspect: 'wide', xlabel: 'ν', ylabel: 'μ', xticks: 0, yticks: 0, points: pts }, caption };
};

export default lesson({
  id: 'st-g.G-LIN.1',
  title: 'Multilinear maps and tensor products',
  minutes: 13, difficulty: 3,
  intro: t`A map $T(v_1, \dots, v_k)$ is **multilinear** when it is linear in each slot with the others held fixed. A bilinear map is *not* linear on pairs: doubling both inputs multiplies it by $4$. The **tensor product** $V \otimes W$ is the space built so that bilinear maps out of $V \times W$ become linear maps out of it, through $B(v, w) = L(v \otimes w)$:

$$\begin{gathered}\dim(V\otimes W) = \dim V\cdot\dim W \\ (\alpha\otimes\beta)(u, v) = \alpha(u)\,\beta(v)\end{gathered}$$

Its elements are sums of products $v \otimes w$; a single product is a **simple** (rank-one) tensor. Every tensor of general relativity — $g_{\mu\nu}$, $F_{\mu\nu}$, $R^\rho{}_{\sigma\mu\nu}$ — is a multilinear map, and counting its independent components is counting dimensions of such spaces. Full lessons: [tensors as multilinear machines](#/lesson/st-a.A5.1) and [the tensor product](#/lesson/st-a.A5.3).`,
  symbols: [
    { tex: 'V, W', text: t`vector spaces, of dimensions $m$ and $n$` },
    { tex: 'V\\times W', text: t`pairs $(v, w)$: dimension $m + n$` },
    { tex: 'V\\otimes W', text: t`the tensor product: dimension $mn$, spanned by the products $e_i \otimes f_j$ of basis vectors` },
    { tex: 'v\\otimes w', text: 'a simple tensor; most elements of V ⊗ W are sums of several' },
    { tex: '\\alpha, \\beta', text: 'covectors: linear maps from vectors to numbers' },
    { tex: 'B, L', text: t`a bilinear map on $V \times W$ and the linear map on $V \otimes W$ it corresponds to` },
  ],
  why: 'Tensors are the language of general relativity, and the count of their independent components — 10 in the metric, 6 in the field strength, 20 in the Riemann tensor — decides how many equations Einstein’s theory has and how many numbers measure curvature.',
  visual: {
    type: 'ten-metric',
    title: 'One bilinear machine, two parts',
    lead: t`A bilinear map $T$ on the plane eats two arrows $U$ and $V$ (drag their tips) and returns $T(U, V)$. Choose a machine: a metric (symmetric), an area form (antisymmetric), a product $\omega \otimes \eta$ (simple) or a general one. The readouts split $T$ into its symmetric and antisymmetric parts.`,
    tasks: [
      t`Pick the area form: $T(U, V) = -T(V, U)$, and $T(U, U) = 0$ whatever $U$ is — it measures the signed area of the parallelogram on $U$ and $V$.`,
      t`Pick the product $\omega \otimes \eta$: $\det T = 0$. A simple tensor has rank one; feed it any $U$ and the stack $T(U, \cdot)$ always has the same slope.`,
      t`Pick the general machine: it is the metric-like symmetric part plus the area-like antisymmetric part, and neither part alone reproduces $T(U, V)$.`,
    ],
    params: {
      mode: 'form', T: [[1, 0.4], [0.4, 1.5]],
      presets: [{ label: 'a metric (symmetric)', T: [[1, 0.4], [0.4, 1.5]] }, { label: 'an area form (antisymmetric)', T: [[0, 1], [-1, 0]] }, { label: 'a product ω ⊗ η (simple)', T: [[0.5, 1], [0.25, 0.5]] }, { label: 'a general bilinear map', T: [[1, 1.2], [-0.4, 0.8]] }],
      dragU: true, dragV: true, readout: ['T', 'parts', 'TUV', 'TVU', 'det'],
    },
    caption: t`Components on plain axes: the picture’s own lengths and angles mean nothing until a metric is chosen. The product preset is $\omega = (1, 0.5)$, $\eta = (0.5, 1)$, so $T_{\mu\nu} = \omega_\mu\eta_\nu$.`,
  },
  example: {
    prompt: t`How many independent numbers specify each multilinear object on 4-dimensional spacetime: a general bilinear form, the metric $g_{\mu\nu}$, the field strength $F_{\mu\nu}$, a general trilinear form, and the Riemann tensor $R_{\rho\sigma\mu\nu}$?`,
    visual: grid(4, t`The $4\times4$ array of a bilinear form’s components $T_{\mu\nu}$: diagonal gold, above it blue, below it hollow. A symmetric form is fixed by the gold and blue entries; an antisymmetric one by the blue alone.`),
    steps: [
      { label: 'General bilinear', text: t`A bilinear form is fixed by its values on basis pairs, $T_{\mu\nu} = T(e_\mu, e_\nu)$: by bilinearity $T(u, v) = \sum_{\mu, \nu}T_{\mu\nu}u^\mu v^\nu$. That is $4^2 = 16$ numbers: $\dim(V^*\otimes V^*) = 4\cdot 4$.` },
      { label: 'Symmetric: the metric', text: t`$g_{\mu\nu} = g_{\nu\mu}$ leaves the diagonal and one triangle: $\tfrac{n(n+1)}{2} = 10$.` },
      { label: 'Antisymmetric: F', text: t`$F_{\mu\nu} = -F_{\nu\mu}$ forces a zero diagonal and leaves one triangle: $\tfrac{n(n-1)}{2} = 6$ — three for $\vec E$, three for $\vec B$. Check: $10 + 6 = 16$.` },
      { label: 'Trilinear', text: t`Three slots, four choices each: $4^3 = 64$. In general a $k$-linear form on an $n$-dimensional space has $n^k$ components.` },
      { label: 'Riemann', text: t`$R_{\rho\sigma\mu\nu}$ starts with $4^4 = 256$. Antisymmetry in each pair makes it a symmetric form on the 6-dimensional space of pairs: $\tfrac{6\cdot7}{2} = 21$. The cyclic identity $R_{\rho[\sigma\mu\nu]} = 0$ removes one more: $20 = \tfrac{n^2(n^2 - 1)}{12}$.` },
    ],
    answer: t`$16$, $10$, $6$, $64$ and $20$. Ten metric components are the ten potentials of general relativity; twenty Riemann components are everything curvature can be at a point.`,
  },
  practice: [
    multi({
      id: 'bilinear', difficulty: 2,
      prompt: t`Which of these maps $B(u, v)$ on pairs of plane vectors $u = (u_1, u_2)$, $v = (v_1, v_2)$ are bilinear?`,
      visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-14, 14], aspect: 'wide', xlabel: 's', ylabel: 'B(su, v)', curves: [{ fn: '5*x', color: 'accent', width: 2, label: 'u₁v₁ + u₂v₂', labelAt: 1.6, labelDx: 6, labelDy: 6 }, { fn: '-5*x', color: 'teal', width: 2, label: 'u₁v₂ − u₂v₁', labelAt: -2, labelDx: 2, labelDy: -10 }, { fn: 'x + 1', color: 'gold', width: 2, label: 'u₁ + v₂', labelAt: 1.9, labelDx: -40, labelDy: 14 }, { fn: '25*x^2', color: 'bad', width: 2, label: '(u·v)²', labelAt: 0.62, labelDx: 6 }, { fn: '-10*x', color: 'violet', width: 2, dash: true, label: 'det[v u]·2', labelAt: -1.2, labelDx: 8, labelDy: -8 }] }, caption: t`Each map evaluated on $(s\,u, v)$ for $u = (1, 2)$, $v = (3, 1)$, as $s$ varies. A map linear in the first slot gives a straight line through the origin.` },
      choices: [t`$u_1v_1 + u_2v_2$`, t`$u_1v_2 - u_2v_1$`, t`$2\det\begin{pmatrix} v_1 & u_1 \\ v_2 & u_2\end{pmatrix}$`, t`$u_1 + v_2$`, t`$(u_1v_1 + u_2v_2)^2$`],
      answer: [0, 1, 2],
      why: {
        3: t`It is linear on the *pair* $(u, v)$, but not in $u$ alone: $B(2u, v) = 2u_1 + v_2 \ne 2B(u, v)$. Its line misses the origin.`,
        4: t`Squaring makes it quadratic in each slot: $B(2u, v) = 4B(u, v)$.`,
      },
      hints: [t`Test the first slot: does $B(su, v) = s\,B(u, v)$ for every number $s$? In the picture, that is a line through the origin.`, t`Then check additivity, $B(u + u', v) = B(u, v) + B(u', v)$, and the same for the second slot.`],
      teach: 'Bilinear means linear in each slot separately — every term has exactly one component from each input.',
      explain: t`Each term of the first three has exactly one $u$-component and one $v$-component, so each is linear in each slot. ($2\det[v\ u] = 2(v_1u_2 - v_2u_1)$, a multiple of the area form.)`,
    }),
    num({
      id: 'dims', difficulty: 1,
      gen(r) {
        const m = r.int(2, 5), n = r.int(2, 6);
        const ans = m * n;
        return {
          prompt: t`$V$ has dimension $${m}$ and $W$ has dimension $${n}$. What is the dimension of $V \otimes W$ — the number of independent components of a general element $\sum_{i, j}T^{ij}e_i\otimes f_j$?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: m + n, feedback: t`That is $\dim(V \times W)$, pairs of vectors. A tensor has a component for every *pair of basis vectors*: $${m}\times${n}$.` }].filter((e) => e.value !== ans),
          hints: [t`A basis of $V \otimes W$ is $\{e_i \otimes f_j\}$: one element for each $i$ and each $j$.`],
          teach: 'dim(V ⊗ W) = dim V · dim W: the tensor product multiplies dimensions where the Cartesian product adds them.',
          explain: t`$${m}\cdot${n} = ${ans}$. Only $${m} + ${n} - 1 = ${m + n - 1}$ of those dimensions are reached by simple tensors $v \otimes w$ (the rest of the space is sums), which is why most tensors are not products.`,
        };
      },
    }),
    num({
      id: 'sym-count', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5, 6]), sym = r.bool(0.5);
        const ans = sym ? n * (n + 1) / 2 : n * (n - 1) / 2;
        return {
          prompt: t`How many independent components does ${sym ? 'a **symmetric**' : 'an **antisymmetric**'} bilinear form $T_{\mu\nu}$ have on a space of dimension $n = ${n}$?`,
          visual: grid(n, t`The $${n}\times${n}$ component array: diagonal gold, above it blue, below it hollow.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: n * n, feedback: t`That counts every entry; ${sym ? 'symmetry makes the entries below the diagonal copies of those above' : 'antisymmetry makes the entries below the diagonal minus those above, and the diagonal zero'}.` }, { value: sym ? n * (n - 1) / 2 : n * (n + 1) / 2, feedback: sym ? 'The diagonal entries are free for a symmetric form: count them too.' : 'The diagonal of an antisymmetric form is zero, since T₁₁ = −T₁₁.' }],
          hints: [sym ? 'Count the diagonal and the entries above it.' : t`$T_{\mu\mu} = -T_{\mu\mu}$, so the diagonal vanishes. Count the entries above it.`, t`There are $n(n-1)/2$ entries strictly above the diagonal.`],
          teach: 'A symmetric form has n(n+1)/2 independent components, an antisymmetric one n(n−1)/2; together they make n².',
          explain: t`$${ans}$. In 4D these are $10$ (the metric) and $6$ (the electromagnetic field): $16$ in all.`,
        };
      },
    }),
    num({
      id: 'triple-product', difficulty: 2,
      gen(r) {
        const a = [r.intExcept(-3, 3, [0]), r.int(-2, 2)], b = [r.int(-2, 2), r.intExcept(-3, 3, [0])], c = [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])];
        const u = [r.int(1, 2), r.intExcept(-1, 2, [0])], v = [r.intExcept(-2, 2, [0]), 1], w = [1, r.intExcept(-2, 2, [0])];
        const d = (x, y) => x[0] * y[0] + x[1] * y[1];
        const au = d(a, u), bv = d(b, v), cw = d(c, w);
        const ans = au * bv * cw;
        const alt = d(a, u) + d(b, v) + d(c, w);
        return {
          prompt: t`On the plane, $\alpha = (${a[0]}, ${a[1]})$, $\beta = (${b[0]}, ${b[1]})$ and $\gamma = (${c[0]}, ${c[1]})$ are covectors (components $\alpha_\mu$) and $u = (${u[0]}, ${u[1]})$, $v = (${v[0]}, ${v[1]})$, $w = (${w[0]}, ${w[1]})$ are vectors. Evaluate the trilinear map $(\alpha\otimes\beta\otimes\gamma)(u, v, w)$.`,
          visual: arrowsPic([[u, 'u'], [v, 'v', 'gold'], [w, 'w', 'teal']], 'The three input arrows. The covectors are not drawn.'),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: alt, feedback: t`The factors multiply: $\alpha(u)\,\beta(v)\,\gamma(w)$, not add.` }].filter((e) => e.value !== ans),
          hints: [t`$(\alpha\otimes\beta\otimes\gamma)(u, v, w) = \alpha(u)\,\beta(v)\,\gamma(w)$, each factor a pairing $\alpha_\mu u^\mu$.`, t`$\alpha(u) = ${au}$; now find $\beta(v)$ and $\gamma(w)$.`],
          teach: 'A product of covectors feeds each one its own slot and multiplies the results; it is linear in each slot separately.',
          explain: t`$\alpha(u) = ${au}$, $\beta(v) = ${bv}$, $\gamma(w) = ${cw}$; the product is $${ans}$.${ans === 0 ? ' One zero factor kills the whole product.' : ''}`,
        };
      },
    }),
    num({
      id: 'expand', difficulty: 3,
      gen(r) {
        const Tuu = r.int(-2, 3), Tuv = r.intExcept(-3, 3, [0]), Tvu = r.int(-3, 3), Tvv = r.intExcept(-2, 4, [0]);
        const a = r.intExcept(-2, 3, [0]), b = r.intExcept(-2, 2, [0]), c = r.intExcept(-2, 2, [0]), d = r.intExcept(-2, 3, [0]);
        const ans = a * c * Tuu + a * d * Tuv + b * c * Tvu + b * d * Tvv;
        const swapped = a * c * Tuu + a * d * Tvu + b * c * Tuv + b * d * Tvv;
        const coef = (k, s, first) => (k === 1 ? (first ? s : `+ ${s}`) : k === -1 ? `- ${s}` : k < 0 ? `- ${-k}${s}` : first ? `${k}${s}` : `+ ${k}${s}`);
        return {
          prompt: t`A bilinear map $T$ has $T(u, u) = ${Tuu}$, $T(u, v) = ${Tuv}$, $T(v, u) = ${Tvu}$ and $T(v, v) = ${Tvv}$. Find $T(${coef(a, 'u', true)} ${coef(b, 'v')},\ ${coef(c, 'u', true)} ${coef(d, 'v')})$.`,
          visual: arrowsPic([[[1.5, 0.3], 'u'], [[0.4, 1.1], 'v', 'gold'], [[1.5 * a + 0.4 * b, 0.3 * a + 1.1 * b], 'first input', 'teal'], [[1.5 * c + 0.4 * d, 0.3 * c + 1.1 * d], 'second input', 'violet']], t`Illustrative arrows $u$ and $v$ and the two inputs built from them; only the four given values of $T$ matter.`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: swapped, feedback: t`You swapped $T(u, v)$ and $T(v, u)$. $T$ need not be symmetric: keep the order of the slots.` }, { value: a * c * Tuu + b * d * Tvv, feedback: 'The cross terms T(u, v) and T(v, u) contribute too.' }].filter((e) => e.value !== ans),
          hints: [t`Expand one slot at a time: $T(au + bv, \cdot) = a\,T(u, \cdot) + b\,T(v, \cdot)$.`, t`The result is $ac\,T(u, u) + ad\,T(u, v) + bc\,T(v, u) + bd\,T(v, v)$.`],
          teach: 'Bilinearity lets you expand both slots like a product of brackets — keeping the slot order, since T need not be symmetric.',
          explain: t`$${a * c}(${Tuu}) + ${a * d}(${Tuv}) + ${b * c}(${Tvu}) + ${b * d}(${Tvv}) = ${ans}$. Four values determine $T$ on the whole plane: that is what having $2\times2$ components means.`,
        };
      },
    }),
    mcq({
      id: 'why-tensor-product', difficulty: 3,
      prompt: t`Why is a bilinear map $B: V \times W \to \mathbb R$ described by a *linear* map on $V \otimes W$ and not on $V \times W$?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-1.5, 5], aspect: 'wide', xlabel: 's', ylabel: 'B(su, sv)', curves: [{ fn: 'x^2', color: 'accent', width: 2.2, label: 's² B(u, v)', labelAt: 1.6, labelDx: 8 }, { fn: 'x', color: 'ink3', dash: true, width: 1.4, label: 'what linearity on pairs would need', labelAt: -1.9, labelDx: 4, labelDy: -10 }] }, caption: t`A bilinear $B$ along the line of pairs $(su, sv)$ in $V \times W$, with $B(u, v) = 1$: a parabola, not a line.` },
      choices: [t`Along pairs, $B(su, sv) = s^2B(u, v)$, so $B$ is not linear on $V \times W$; but $B(v, w) = L(v\otimes w)$ for a unique linear $L$ on $V \otimes W$`, t`$V \times W$ and $V \otimes W$ are the same space; the notation is a convention`, t`Because $V \times W$ has larger dimension than $V \otimes W$`, t`Because linear maps on $V \times W$ must vanish at the origin, and bilinear maps do not`],
      answer: 0,
      why: {
        1: t`They are different spaces: $\dim(V \times W) = m + n$ while $\dim(V \otimes W) = mn$.`,
        2: t`For dimensions above $2$ it is the other way round: $mn \ge m + n$ once $m, n \ge 2$.`,
        3: t`Bilinear maps vanish at the origin too, $B(0, w) = 0$. The failure is additivity and scaling along pairs.`,
      },
      hints: [t`Scale both inputs by $s$. How does $B(su, sv)$ compare with $B(u, v)$?`, t`The tensor product is defined so that $v\otimes w$ is bilinear in $(v, w)$ and every bilinear map factors through it.`],
      teach: 'The tensor product turns multilinear problems into linear ones: bilinear maps out of V × W are exactly linear maps out of V ⊗ W (its universal property).',
      explain: t`$B(su, sv) = s^2B(u, v)$ is quadratic, so no linear map on pairs can be $B$. Linear maps on $V \otimes W$ are fixed by their values $L(e_i\otimes f_j) = B(e_i, f_j)$ — exactly the $mn$ components. This is why “a tensor is a multilinear map” and “a tensor is an element of a tensor product” are the same statement.`,
    }),
    code({
      id: 'riemann-count', difficulty: 4,
      prompt: t`Count the independent components of the Riemann tensor by brute force. Treat the $n^4$ numbers $R_{abcd}$ as unknowns and impose its symmetries as linear equations: $R_{abcd} + R_{bacd} = 0$, $R_{abcd} + R_{abdc} = 0$, $R_{abcd} - R_{cdab} = 0$ and $R_{abcd} + R_{acdb} + R_{adbc} = 0$, for every $a, b, c, d$. Write \`independent(n)\` returning $n^4$ minus the rank of this system (use \`np.linalg.matrix_rank\`). The program prints the counts for $n = 2, 3, 4$; compare with $n^2(n^2 - 1)/12$.`,
      starter: t`import numpy as np
from itertools import product

def independent(n):
    idx = lambda a, b, c, d: ((a * n + b) * n + c) * n + d   # position of R_abcd in the list of unknowns
    rows = []
    for a, b, c, d in product(range(n), repeat=4):
        # add one row per symmetry: a vector of length n**4 with +1 / -1 entries
        pass
    return None

for n in (2, 3, 4):
    print(n, independent(n), n**2 * (n**2 - 1) // 12)
`,
      answer: t`import numpy as np
from itertools import product

def independent(n):
    idx = lambda a, b, c, d: ((a * n + b) * n + c) * n + d   # position of R_abcd in the list of unknowns
    rows = []
    def row(*terms):
        v = np.zeros(n**4)
        for sign, i in terms:
            v[i] += sign
        rows.append(v)
    for a, b, c, d in product(range(n), repeat=4):
        row((1, idx(a, b, c, d)), (1, idx(b, a, c, d)))
        row((1, idx(a, b, c, d)), (1, idx(a, b, d, c)))
        row((1, idx(a, b, c, d)), (-1, idx(c, d, a, b)))
        row((1, idx(a, b, c, d)), (1, idx(a, c, d, b)), (1, idx(a, d, b, c)))
    return n**4 - np.linalg.matrix_rank(np.array(rows))

for n in (2, 3, 4):
    print(n, independent(n), n**2 * (n**2 - 1) // 12)
`,
      tests: [
        { name: 'in 2 dimensions the Riemann tensor has 1 independent component', code: 'independent(2) == 1' },
        { name: 'in 3 dimensions it has 6', code: 'independent(3) == 6' },
        { name: 'in 4 dimensions it has 20', code: 'independent(4) == 20' },
        { name: 'the program prints a line for each n', code: '_stdout.count("\\n") >= 3' },
      ],
      hints: [t`Write a small helper that makes one row: a zero vector of length \`n**4\` with $\pm1$ at the positions of the terms, appended to \`rows\`.`, t`Four rows per $(a, b, c, d)$: \`(+1 at abcd, +1 at bacd)\`, \`(+1 at abcd, +1 at abdc)\`, \`(+1 at abcd, −1 at cdab)\`, and the cyclic one with three \`+1\`s. Then \`n**4 - np.linalg.matrix_rank(np.array(rows))\`.`],
      teach: 'A tensor’s symmetries are linear equations on its components, so its number of independent components is a dimension: unknowns minus rank.',
      explain: t`The counts $1, 6, 20$ match $n^2(n^2 - 1)/12$. In 2D the single component is the Gaussian curvature; in 3D Riemann is fixed by the 6 components of Ricci; in 4D, 10 of the 20 are Ricci (set by matter through Einstein’s equations) and 10 are the Weyl tensor — curvature that travels as gravitational waves.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tank-shear', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([0.3, 0.45, 0.6, 0.9]), R = r.pick([1.5, 1.85, 2.0, 3.66 / 2]), tw = r.pick([3, 4, 5]);
        const hoop = p * R / (tw / 1000), axial = hoop / 2, ans = (hoop - axial) / 2;
        return {
          prompt: t`The wall of a cylindrical propellant tank (radius $${R}\ \text{m}$, wall $${tw}\ \text{mm}$, internal pressure $${p}\ \text{MPa}$) carries the stress tensor $\sigma = \operatorname{diag}(\sigma_h, \sigma_a)$ in (hoop, axial) axes, with $\sigma_h = pR/t$ and $\sigma_a = pR/2t$. As a bilinear map, $\sigma(\hat n, \hat m)$ is the force per area in direction $\hat m$ across a cut with normal $\hat n$. Find the shear $\sigma(\hat n, \hat m)$ on a cut at $45^\circ$: $\hat n = (\cos 45^\circ, \sin 45^\circ)$, $\hat m = (-\sin 45^\circ, \cos 45^\circ)$, in MPa.`,
          visual: { type: 'graph', params: { x: [-3.4, 3.4], y: [-1.7, 1.7], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [{ param: ['max(-1, min(1, 1.42*cos(t)))', 'max(-1, min(1, 1.42*sin(t)))'], t: [0, 6.2832], color: 'ink3', width: 2 }, { fn: 'x', domain: [-1, 1], color: 'gold', dash: true, width: 1.6, label: '45° cut', labelAt: 0.9, labelDx: 6 }], arrows: [{ from: [1, 0], to: [2, 0], color: 'accent', label: 'σh', width: 2.4 }, { from: [-1, 0], to: [-2, 0], color: 'accent', width: 2.4 }, { from: [0, 1], to: [0, 1.5], color: 'teal', label: 'σa', width: 2.4 }, { from: [0, -1], to: [0, -1.5], color: 'teal', width: 2.4 }, { from: [0, 0], to: [0.5, 0.5], color: 'violet', label: 'n̂', width: 2 }, { from: [0, 0], to: [-0.5, 0.5], color: 'bad', label: 'm̂', width: 2 }] }, caption: 'A square element of the tank wall: hoop stress across (blue), axial stress along (green, half as large); the 45° cut with its normal n̂ and in-plane direction m̂. Arrow lengths are schematic.' },
          answer: ans, units: 'MPa', tol: { rel: 0.01 },
          errors: [{ value: hoop, feedback: t`That is $\sigma_h = \sigma(\hat h, \hat h)$, the normal stress across a hoop cut. The shear needs $\sigma(\hat n, \hat m)$ with two different directions.` }, { value: (hoop + axial) / 2, feedback: t`That is the *normal* stress on the 45° cut, $\sigma(\hat n, \hat n)$. Feed it $\hat m$ in the second slot.` }],
          hints: [t`$\sigma(\hat n, \hat m) = \sum_{ij}\sigma_{ij}n^i m^j = \sigma_h n^1m^1 + \sigma_a n^2m^2$.`, t`With $n = (\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$, $m = (-\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$ this is $\tfrac12(\sigma_a - \sigma_h)$; its size is what is asked.`],
          teach: 'The stress tensor is a bilinear map from two directions to a force per area; feeding it two different unit vectors gives a shear.',
          explain: t`$\sigma_h = ${nice(hoop, 4)}\ \text{MPa}$, $\sigma_a = ${nice(axial, 4)}\ \text{MPa}$; $\sigma(\hat n, \hat m) = \tfrac12(\sigma_a - \sigma_h) = -${nice(ans, 4)}\ \text{MPa}$, a shear of $${nice(ans, 4)}\ \text{MPa}$ — the largest in the wall’s plane. (Thin-wall formulas, ignoring the radial stress.)`,
        };
      },
    }),
    num({
      id: 'cp-count', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 5, 6]), kind = r.pick(['metric', 'F', 'Riemann']);
        const ans = kind === 'metric' ? n * (n + 1) / 2 : kind === 'F' ? n * (n - 1) / 2 : n * n * (n * n - 1) / 12;
        const what = { metric: t`a metric $g_{\mu\nu}$ (symmetric)`, F: t`a field strength $F_{\mu\nu}$ (antisymmetric)`, Riemann: t`the Riemann tensor $R_{\rho\sigma\mu\nu}$` }[kind];
        return {
          prompt: t`Theories of gravity in other dimensions count components too. In a spacetime of dimension $n = ${n}$, how many independent components does ${what} have at a point?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: kind === 'Riemann' ? n ** 4 : n * n, feedback: 'That counts every index combination; the symmetries tie most of them together.' }, { value: kind === 'metric' ? n * (n - 1) / 2 : kind === 'F' ? n * (n + 1) / 2 : n * (n + 1) / 2, feedback: kind === 'Riemann' ? 'That is the symmetric (0,2) count; Riemann is a symmetric form on antisymmetric pairs, minus the cyclic identity: n²(n² − 1)/12.' : 'Check the diagonal: free for a symmetric form, zero for an antisymmetric one.' }].filter((e) => e.value !== ans),
          hints: [t`Symmetric: $n(n+1)/2$. Antisymmetric: $n(n-1)/2$. Riemann: $n^2(n^2 - 1)/12$.`, 'Riemann is the hardest: antisymmetric pairs, symmetric under swapping the pairs, then one cyclic identity.'],
          teach: 'Index symmetries cut a tensor’s n^k components down to the dimension of the space it really lives in.',
          explain: t`$${ans}$. ${kind === 'Riemann' && n === 3 ? 'In 3D that equals the number of Ricci components, which is why 2+1 gravity has no curvature outside matter and no gravitational waves.' : 'The same formulas give 10, 6 and 20 in 4D.'}`,
        };
      },
    }),
    num({
      id: 'cp-spin-energy', difficulty: 3, transfer: true,
      gen(r) {
        const I = [[r.pick([800, 1200, 1500]), r.pick([-40, 30, 60]), 0], [0, r.pick([900, 1100, 1400]), r.pick([-25, 20, 50])], [0, 0, r.pick([600, 700, 1000])]];
        I[1][0] = I[0][1]; I[2][1] = I[1][2];
        const w = [r.pick([0.02, 0.05, -0.03]), r.pick([0.04, -0.02, 0.01]), r.pick([0.1, 0.06, 0.08])];
        let Q = 0, diag = 0;
        for (let i = 0; i < 3; i++) { diag += I[i][i] * w[i] * w[i]; for (let j = 0; j < 3; j++) Q += I[i][j] * w[i] * w[j]; }
        const ans = Q / 2;
        return {
          prompt: t`A spacecraft’s inertia tensor in body axes is $I = \begin{pmatrix} ${I[0][0]} & ${I[0][1]} & 0 \\ ${I[1][0]} & ${I[1][1]} & ${I[1][2]} \\ 0 & ${I[2][1]} & ${I[2][2]}\end{pmatrix}\ \text{kg m}^2$ and it spins at $\vec\omega = (${w[0]}, ${w[1]}, ${w[2]})\ \text{rad/s}$. Its rotational kinetic energy is $K = \tfrac12 I(\vec\omega, \vec\omega)$, the bilinear map $I$ fed $\vec\omega$ twice. Find $K$ in joules.`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, vectors: [{ to: w.map((x) => r6(x * 10)), color: 'gold', label: '10\\vec\\omega' }], spheres: [{ centre: [0, 0, 0], radius: 0.6, color: 'ink3' }], yaw: 0.9 }, caption: 'The spin vector (drawn ten times longer, in rad/s) and a sphere standing in for the spacecraft.' },
          answer: ans, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: diag / 2, feedback: 'The off-diagonal products of inertia count too, twice each: I₁₂ω₁ω₂ + I₂₁ω₂ω₁.' }, { value: Q, feedback: 'Remember the ½.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$I(\vec\omega, \vec\omega) = \sum_{i, j}I_{ij}\omega_i\omega_j$: nine terms, the off-diagonal ones in pairs.`, t`$= I_{11}\omega_1^2 + I_{22}\omega_2^2 + I_{33}\omega_3^2 + 2I_{12}\omega_1\omega_2 + 2I_{23}\omega_2\omega_3$.`],
          teach: 'A quadratic form T(v, v) sees only the symmetric part of T — which is why inertia, metrics and stresses are symmetric tensors.',
          explain: t`$I(\vec\omega, \vec\omega) = ${nice(Q, 5)}\ \text{J}$, so $K = ${nice(ans, 4)}\ \text{J}$. An antisymmetric part would add $A(\vec\omega, \vec\omega) = 0$: kinetic energy could never detect it.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Halmos, Finite-Dimensional Vector Spaces (Springer, 1958), §§24–29 (multilinear forms, tensor products)', url: 'https://doi.org/10.1007/978-1-4612-6387-6' },
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley, 2004), §§1.6, 3.6 (tensors; independent components of Riemann)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
  ],
});
