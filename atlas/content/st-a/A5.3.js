// The tensor product: (ω ⊗ η)(U, V) = ω(U) η(V), components ω_μ η_ν. Every
// tensor is a sum of products of basis covectors, but not every tensor is a
// single product: a product's component array has rank one.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { legs, grid, stackCurves } from './_ten.js';
import { form, matTeX, vecTeX, dot, det2, r6, AXES_NOTE } from './_metric.js';

const t = String.raw;
const DEG = Math.PI / 180;
const outer = (a, b) => a.map((x) => b.map((y) => x * y));
const nz = (r, lo = -3, hi = 3) => r.intExcept(lo, hi, [0]);
const productLegs = (caption) => legs([{ name: 'ω', down: ['μ'] }, { name: 'η', down: ['ν'] }], { gap: 1.8, caption });

export default lesson({
  id: 'st-a.A5.3',
  title: 'The tensor product',
  minutes: 11, difficulty: 3,
  intro: t`Two covectors make a (0,2) tensor in the simplest possible way: let each one eat one of the two arrows, and multiply. That is the **tensor product**,

$$(\omega\otimes\eta)(\mathbf U, \mathbf V) = \omega(\mathbf U)\,\eta(\mathbf V), \qquad (\omega\otimes\eta)_{\mu\nu} = \omega_\mu\,\eta_\nu$$

Its components are every product of a component of $\omega$ with one of $\eta$ — the *outer product* of two lists. The same recipe makes a (2,0) tensor $\mathbf V\otimes\mathbf W$ with components $V^\mu W^\nu$, or a (1,1) tensor $\mathbf V\otimes\omega$, and it is not commutative: $\eta\otimes\omega$ has the transposed array. The products of basis covectors, $\mathbf e^\mu\otimes\mathbf e^\nu$, are a basis for all (0,2) tensors — that is what writing $T = T_{\mu\nu}\,\mathbf e^\mu\otimes\mathbf e^\nu$ means. But **most tensors are not a single product**. Feed a product $\omega\otimes\eta$ any arrow $\mathbf U$ and what is left, $\omega(\mathbf U)\,\eta$, is always a multiple of the same covector $\eta$: every row of the array is a multiple of one row, so the array has rank one (in two dimensions, determinant zero). The Euclidean metric $\mathbf e^1\otimes\mathbf e^1 + \mathbf e^2\otimes\mathbf e^2$ needs two products and cannot be squeezed into one. (Some books call the least number of products needed a tensor’s *rank* — not the same use of the word as lesson A5.2’s $k + l$.)`,
  symbols: [
    { tex: t`\otimes`, text: 'the tensor product: feed each factor its own slot and multiply the results' },
    { tex: t`\omega,\ \eta`, text: t`two covectors, with components $\omega_\mu$ and $\eta_\nu$` },
    { tex: t`\mathbf U,\ \mathbf V`, text: 'the two arrows fed to the slots, in order' },
    { tex: t`(\omega\otimes\eta)_{\mu\nu}`, text: t`the product’s components: row $\mu$ is $\omega_\mu$ times the list $\eta_\nu$` },
  ],
  why: t`Tensor products are how tensors are built and written — $ds^2 = g_{\mu\nu}\,dx^\mu dx^\nu$ is shorthand for $g_{\mu\nu}\,dx^\mu\otimes dx^\nu$ — and whether a tensor is a single product is a physical question: dust versus a fluid with pressure, a product state versus an entangled one.`,
  visual: {
    type: 'ten-metric',
    title: 'A product always points the same way',
    lead: t`The sliders set two covectors $\omega$ and $\eta$, and the machine is their product $T = \omega\otimes\eta$. Feeding $\mathbf U$ leaves the covector $T(\mathbf U, \cdot\,) = \omega(\mathbf U)\,\eta$, drawn as teal lines. Drag $\mathbf U$ all round.`,
    tasks: [
      t`However you turn $\mathbf U$, the teal lines keep one direction — that of $\eta$’s stack. Only their spacing and their labels change.`,
      t`Put $\mathbf U$ where $\omega(\mathbf U) = 0$: the stack disappears entirely.`,
      t`Watch $\det T_{\mu\nu}$ in the readout: zero, whatever the sliders say. A single product has no room for more.`,
    ],
    params: { mode: 'form', sliders: 'product', product: [[1, 0.5], [0.4, 1.2]], T: [[0.4, 1.2], [0.2, 0.6]], U: [1.2, 0.6], V: [0.4, 1.5], readout: ['T', 'low', 'TUV', 'det'] },
    caption: t`$T = \omega\otimes\eta$ with the slider values; the teal lines are $T(\mathbf U, \cdot\,)$ at whole-number values and the bold ones are those $\mathbf V$ crosses. ${AXES_NOTE}`,
  },
  example: {
    prompt: t`On the plane, $dx = \cos\theta\,dr - r\sin\theta\,d\theta$ (lesson A4.3). Write the product $dx\otimes dx$ in the polar basis $dr\otimes dr,\ dr\otimes d\theta,\ d\theta\otimes dr,\ d\theta\otimes d\theta$, evaluate its components at $(r, \theta) = (2, 30^\circ)$, and check it is still a single product.`,
    visual: form({ T: outer([Math.cos(30 * DEG), -2 * Math.sin(30 * DEG)], [Math.cos(30 * DEG), -2 * Math.sin(30 * DEG)]).map((row) => row.map(r6)), U: [1.2, 0.4], showV: false, axes: ['r', 'θ'], view: 1.6, levelLabels: true }, t`At $(2, 30^\circ)$ on $(r, \theta)$ component axes: $dx\otimes dx$ fed a vector $\mathbf U$ gives a multiple of $dx$, whose stack this is. ${AXES_NOTE}`),
    steps: [
      { label: 'Multiply out', text: t`$dx\otimes dx = (\cos\theta\,dr - r\sin\theta\,d\theta)\otimes(\cos\theta\,dr - r\sin\theta\,d\theta)$. The product is linear in each factor, so expand like brackets — keeping the order of each pair.` },
      { label: 'Collect', text: t`$= \cos^2\theta\;dr\otimes dr - r\sin\theta\cos\theta\,(dr\otimes d\theta + d\theta\otimes dr) + r^2\sin^2\theta\;d\theta\otimes d\theta$.` },
      { label: 'Evaluate', text: t`At $r = 2$, $\theta = 30^\circ$: $T_{rr} = 0.75$, $T_{r\theta} = T_{\theta r} = -2(0.5)(0.866) = -0.866$, $T_{\theta\theta} = 4(0.25) = 1$.` },
      { label: 'Still a product', text: t`$\det = 0.75\times1 - 0.866^2 = 0.75 - 0.75 = 0$. ✓ A change of basis cannot turn a product into a non-product: each factor just transforms on its own.` },
      { label: 'A look ahead', text: t`Add $dy\otimes dy = \sin^2\theta\,dr\otimes dr + r\sin\theta\cos\theta\,(dr\otimes d\theta + d\theta\otimes dr) + r^2\cos^2\theta\,d\theta\otimes d\theta$ and the cross terms cancel: $dx\otimes dx + dy\otimes dy = dr\otimes dr + r^2\,d\theta\otimes d\theta$ — the polar metric of lesson A6.3, a sum of two products.` },
    ],
    answer: t`$dx\otimes dx = \cos^2\theta\,dr\otimes dr - r\sin\theta\cos\theta\,(dr\otimes d\theta + d\theta\otimes dr) + r^2\sin^2\theta\,d\theta\otimes d\theta$; at $(2, 30^\circ)$ the array is $${matTeX([[0.75, -0.866], [-0.866, 1]])}$, of determinant 0.`,
  },
  practice: [
    num({
      id: 'outer-comp', difficulty: 1,
      gen(r) {
        const V = [nz(r), nz(r), r.int(-3, 3)], W = [nz(r), r.int(-3, 3), nz(r)];
        let i, j;
        do { i = r.int(1, 3); j = r.int(1, 3); } while (V[i - 1] * W[j - 1] === 0 || i === j);
        const rows = [0, 1, 2].map((a) => [0, 1, 2].map((b) => (a === i - 1 && b === j - 1 ? '?' : '·')));
        return {
          prompt: t`$V^\mu = ${vecTeX(V)}$ and $W^\nu = ${vecTeX(W)}$. What is the component $(\mathbf V\otimes\mathbf W)^{${i}${j}}$?`,
          visual: grid(rows, { hl: [[i - 1, j - 1]], rowNames: V.map((v, k) => `V${'¹²³'[k]} = ${String(v).replace('-', '−')}`), colNames: W.map((w, k) => `W${'¹²³'[k]} = ${String(w).replace('-', '−')}`), dx: 1.6, caption: t`The $3\times3$ array of $\mathbf V\otimes\mathbf W$: row $\mu$ goes with $V^\mu$, column $\nu$ with $W^\nu$.` }),
          answer: V[i - 1] * W[j - 1], tol: { rel: 0, abs: 0.01 },
          errors: V[j - 1] * W[i - 1] !== V[i - 1] * W[j - 1] ? [{ value: V[j - 1] * W[i - 1], feedback: t`That is $(\mathbf V\otimes\mathbf W)^{${j}${i}}$ — the first index belongs to the first factor, $\mathbf V$.` }] : [],
          hints: [t`$(\mathbf V\otimes\mathbf W)^{\mu\nu} = V^\mu W^\nu$.`],
          teach: 'A tensor product’s components are all the products of one factor’s components with the other’s, in order.',
          explain: t`$V^${i}W^${j} = (${V[i - 1]})(${W[j - 1]}) = ${V[i - 1] * W[j - 1]}$.`,
        };
      },
    }),
    num({
      id: 'product-eval', difficulty: 1,
      gen(r) {
        let w, h, U, V, ans;
        do { w = [nz(r, -2, 2), r.int(-2, 2)]; h = [r.int(-2, 2), nz(r, -2, 2)]; U = [nz(r, -2, 2), nz(r, -2, 2)]; V = [nz(r, -2, 2), r.int(-2, 2)]; ans = dot(w, U) * dot(h, V); } while (ans === 0 || ans === dot(w, V) * dot(h, U) || Math.abs(ans) > 20);
        return {
          prompt: t`$\omega_\mu = ${vecTeX(w)}$ and $\eta_\nu = ${vecTeX(h)}$. Evaluate $(\omega\otimes\eta)(\mathbf U, \mathbf V)$ for $U^\mu = ${vecTeX(U)}$ and $V^\nu = ${vecTeX(V)}$.`,
          visual: form({ T: outer(w, h), U: U.map((x) => x * 0.7), V: V.map((x) => x * 0.7), view: 2 }, t`$\mathbf U$ and $\mathbf V$ at 0.7 scale; the teal stack is $(\omega\otimes\eta)(\mathbf U, \cdot\,) = \omega(\mathbf U)\,\eta$. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: dot(w, V) * dot(h, U), feedback: t`That is $\omega(\mathbf V)\,\eta(\mathbf U)$: the first factor eats the first arrow.` }, { value: dot(w, U) + dot(h, V), feedback: t`The two numbers multiply; the product of tensors is a product of their values.` }].filter((e) => e.value !== ans),
          hints: [t`Compute $\omega(\mathbf U) = \omega_\mu U^\mu$ and $\eta(\mathbf V) = \eta_\nu V^\nu$ separately.`],
          teach: t`$(\omega\otimes\eta)(\mathbf U, \mathbf V) = \omega(\mathbf U)\,\eta(\mathbf V)$: two pairings, multiplied.`,
          explain: t`$\omega(\mathbf U) = ${dot(w, U)}$ and $\eta(\mathbf V) = ${dot(h, V)}$, so the product is $${ans}$.`,
        };
      },
    }),
    mcq({
      id: 'commute', difficulty: 2,
      prompt: t`How do the components of $\eta\otimes\omega$ compare with those of $\omega\otimes\eta$?`,
      visual: productLegs(t`$\omega\otimes\eta$: two separate pieces side by side, $\omega$’s index first. No index is summed.`),
      choices: [
        t`They are the transposed array: $(\eta\otimes\omega)_{\mu\nu} = (\omega\otimes\eta)_{\nu\mu}$`,
        'They are the same: multiplication of numbers commutes',
        'They are the negatives of each other',
        'They have nothing to do with each other',
      ],
      answer: 0,
      why: {
        1: t`Each component is a product of numbers, but *which* numbers sit at $(\mu, \nu)$ changes: $\eta_\mu\omega_\nu$ instead of $\omega_\mu\eta_\nu$.`,
        2: t`That is the wedge product’s rule, $\omega\wedge\eta = -\eta\wedge\omega$, built from the antisymmetric part (lesson A5.5).`,
        3: t`$(\eta\otimes\omega)_{\mu\nu} = \eta_\mu\omega_\nu = (\omega\otimes\eta)_{\nu\mu}$: the same numbers, rearranged.`,
      },
      hints: [t`Write out $(\eta\otimes\omega)_{12}$ and compare with $(\omega\otimes\eta)_{21}$.`],
      teach: t`The tensor product is not commutative: swapping the factors transposes the array, and the two agree only when $\omega$ and $\eta$ are parallel.`,
      explain: t`$(\eta\otimes\omega)_{\mu\nu} = \eta_\mu\omega_\nu$, the transpose of $\omega_\mu\eta_\nu$. They are equal only if $\omega_\mu\eta_\nu$ is symmetric, which needs $\eta$ to be a multiple of $\omega$.`,
    }),
    mcq({
      id: 'which-product', difficulty: 2,
      gen(r) {
        let a, b;
        do { a = [nz(r), nz(r)]; b = [nz(r), nz(r)]; } while (Math.abs(a[0] * b[0]) > 9 || Math.abs(a[1] * b[1]) > 9);
        const P = outer(a, b);
        const s = r.int(1, 3);
        const D1 = [[P[0][0], P[0][1]], [P[1][0], P[1][1] + s]];             // one entry off
        const D2 = [[P[0][0], P[0][1]], [P[0][1], P[1][1] - 1]];             // symmetric, not a product
        if (det2(D2) === 0) D2[1][1] -= 1;
        const D3 = [[0, P[0][1] || 2], [-(P[0][1] || 2), 0]];
        return {
          prompt: t`Which of these component arrays is a single tensor product $\omega_\mu\eta_\nu$?`,
          visual: productLegs(t`A single product: one covector per slot, nothing summed between them.`),
          ...(() => {
            const items = [[P, null], [D1, t`Its determinant is $${det2(D1)}$, not 0: the rows are not multiples of one row.`], [D2, t`Its determinant is $${det2(D2)}$: being symmetric does not make it a product.`], [D3, t`An antisymmetric array has determinant $${det2(D3)}$ here; its rows point different ways.`]];
            const order = r.shuffle([0, 1, 2, 3]);
            const why = {};
            order.forEach((k, pos) => { if (items[k][1]) why[pos] = items[k][1]; });
            return { choices: order.map((k) => t`$${matTeX(items[k][0])}$`), answer: order.indexOf(0), why };
          })(),
          hints: [t`In a product, every row is a multiple of the same list $\eta_\nu$.`, 'In two dimensions: the determinant of a single product is zero.'],
          teach: 'A single tensor product has an array of rank one — each row a multiple of one row; in two dimensions, determinant zero.',
          explain: t`$${matTeX(P)} = ${vecTeX(a)}\otimes${vecTeX(b)}$: row 1 is $${a[0]}\,\eta$, row 2 is $${a[1]}\,\eta$, with $\eta = ${vecTeX(b)}$. Its determinant is 0; the others’ are not.`,
        };
      },
    }),
    num({
      id: 'factor', difficulty: 2,
      gen(r) {
        let w, h;
        do { w = [1, nz(r)]; h = [nz(r), nz(r)]; } while (h[0] === h[1]);
        const T = outer(w, h);
        return {
          prompt: t`A tensor is known to be a single product, $T_{\mu\nu} = \omega_\mu\eta_\nu$, with $T = ${matTeX(T)}$, and $\omega$ is scaled so that $\omega_1 = 1$. What is $\omega_2$?`,
          visual: form({ T, U: [0.9, 0.4], V: [0.3, 1.1], view: 2 }, t`$T$ fed an arrow $\mathbf U$: the stack is a multiple of $\eta$ alone. ${AXES_NOTE}`),
          answer: w[1], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: h[1], feedback: t`That is $\eta_2 = T_{12}/\omega_1$, the second *column*. $\omega_2$ scales the second *row*.` }].filter((e) => e.value !== w[1]),
          hints: [t`With $\omega_1 = 1$, row 1 of $T$ is $\eta$ itself.`, t`Row 2 is $\omega_2\,\eta$: divide it by row 1.`],
          teach: 'A product’s rows are the first factor’s components times the second factor: divide one row by another to read off the ratio.',
          explain: t`Row 1 gives $\eta = ${vecTeX(h)}$; row 2, $${vecTeX(T[1])}$, is $${w[1]}$ times it. So $\omega_2 = ${w[1]}$ and $T = ${vecTeX(w)}\otimes${vecTeX(h)}$.`,
        };
      },
    }),
    mcq({
      id: 'metric-not-product', difficulty: 2,
      prompt: t`Could the Euclidean metric of the plane, with components $\delta_{\mu\nu} = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$, be a single product $\omega\otimes\eta$ in some cleverly chosen basis?`,
      visual: form({ T: [[1, 0], [0, 1]], U: [1.3, 0.8], showV: false, view: 1.8, levelLabels: true }, t`The Euclidean metric fed $\mathbf U$: the stack is perpendicular to $\mathbf U$ and turns with it — unlike a product, whose stack keeps one direction. ${AXES_NOTE}`),
      choices: [
        t`No: its determinant is not zero in any basis ($\det T' = (\det A)^2\det T$), and a product’s always is`,
        'Yes: every symmetric tensor is a product of a covector with itself',
        'Yes, in polar coordinates',
        'Only in two dimensions',
      ],
      answer: 0,
      why: {
        1: t`$\omega\otimes\omega$ has determinant 0; the metric has $\det = 1$. Symmetric tensors are *sums* of such squares.`,
        2: t`In polar coordinates it is $dr\otimes dr + r^2\,d\theta\otimes d\theta$ — still two products, still a nonzero determinant ($r^2$).`,
        3: 'In more dimensions it is worse: three products in three dimensions.',
      },
      hints: [t`Under a change of basis, $T' = A^\mathsf{T}TA$. What happens to the determinant?`],
      teach: 'Whether a tensor is a single product does not depend on the basis — a change of basis can never make a non-product into one.',
      explain: t`$\det(A^\mathsf{T}TA) = (\det A)^2\det T \ne 0$. The metric needs two products, $\mathbf e^1\otimes\mathbf e^1 + \mathbf e^2\otimes\mathbf e^2$, in every basis.`,
    }),
    expr({
      id: 'polar-dydy', difficulty: 3,
      gen(r) {
        const which = r.pick(['rt', 'tt', 'rr']);
        const ans = { rt: 'r sin(theta) cos(theta)', tt: 'r^2 cos(theta)^2', rr: 'sin(theta)^2' }[which];
        const lab = { rt: t`(dy\otimes dy)_{r\theta}`, tt: t`(dy\otimes dy)_{\theta\theta}`, rr: t`(dy\otimes dy)_{rr}` }[which];
        const s = stackCurves([0, 1], { x: [-1.2, 3.4], y: [-0.8, 2.4], step: 0.5, color: 'teal' });
        return {
          prompt: t`In polar coordinates $dy = \sin\theta\,dr + r\cos\theta\,d\theta$. Find the component $${lab}$ as a function of $r$ and $\theta$.`,
          visual: { type: 'graph', params: { x: [-1.2, 3.4], y: [-0.8, 2.4], equal: true, xlabel: 'x', ylabel: 'y', curves: [...s.curves, ...[1, 2, 3].map((k) => ({ param: [`${k}*cos(t)`, `${k}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1 })), { param: ['2.4*cos(0.6)*t', '2.4*sin(0.6)*t'], t: [0, 1.2], color: 'ink4', width: 1 }], points: [{ x: r6(2.4 * Math.cos(0.6)), y: r6(2.4 * Math.sin(0.6)), color: 'gold', label: 'P' }] }, caption: t`The covector $dy$: horizontal lines, one every half unit of $y$, over circles of constant $r$. At any point P, $dy\otimes dy$ fed two arrows multiplies their rises.` },
          answer: ans, answerTeX: { rt: t`r\sin\theta\cos\theta`, tt: t`r^2\cos^2\theta`, rr: t`\sin^2\theta` }[which],
          vars: { r: [0.5, 3], theta: [0.1, 1.4] },
          errors: which === 'rt' ? [{ answer: '2 r sin(theta) cos(theta)', feedback: t`That is the coefficient of $dr\,d\theta$ in the expanded square, which counts $dr\otimes d\theta$ and $d\theta\otimes dr$ together. Each component gets half.` }] : which === 'tt' ? [{ answer: 'r cos(theta)^2', feedback: t`The $d\theta$ coefficient $r\cos\theta$ is squared, $r$ included.` }] : [{ answer: 'sin(theta)', feedback: t`Both factors contribute a $\sin\theta$.` }],
          hints: [t`The components of a product are products of components: $(dy\otimes dy)_{\mu\nu} = (dy)_\mu\,(dy)_\nu$.`, t`Read them off $dy$: $(dy)_r = \sin\theta$ and $(dy)_\theta = r\cos\theta$.`],
          teach: t`The components of $\omega\otimes\omega$ are products of $\omega$’s components; the cross component $\omega_r\omega_\theta$ is half the coefficient of $dr\,d\theta$ in the expanded square.`,
          explain: t`$(dy)_${which === 'tt' ? '\\theta' : 'r'}\,(dy)_${which === 'rr' ? 'r' : '\\theta'} = ${{ rt: t`\sin\theta\cdot r\cos\theta`, tt: t`(r\cos\theta)^2`, rr: t`\sin^2\theta` }[which]}$.`,
        };
      },
    }),
    mcq({
      id: 'dust', difficulty: 3, transfer: true,
      prompt: t`The stress–energy tensor of **dust** — matter with no pressure, such as a cloud of stars on cosmological scales — is $T^{\mu\nu} = \rho\,u^\mu u^\nu$, where $\rho$ is its rest-frame energy density and $u^\mu$ its four-velocity (with $c = 1$). A **perfect fluid** with pressure $p$ has, in its rest frame, $T^{\mu\nu} = \operatorname{diag}(\rho, p, p, p)$. Which statement is right?`,
      visual: grid([['ρ', '0', '0', '0'], ['0', '0', '0', '0'], ['0', '0', '0', '0'], ['0', '0', '0', '0']], { hl: [[0, 0]], rowNames: ['t', 'x', 'y', 'z'], colNames: ['t', 'x', 'y', 'z'], caption: t`Dust in its rest frame, where $u^\mu = (1, 0, 0, 0)$: one nonzero entry.` }),
      choices: [
        t`Dust is a single product, $(\sqrt\rho\,\mathbf u)\otimes(\sqrt\rho\,\mathbf u)$, in every frame; a fluid with $p \ne 0$ is not a single product in any frame`,
        t`Both are single products, since both are diagonal in the rest frame`,
        t`Dust is a single product only in its rest frame, where the array is diagonal`,
        t`Neither: a stress–energy tensor is never a tensor product`,
      ],
      answer: 0,
      why: {
        1: t`Diagonal is not the test: $\operatorname{diag}(\rho, p, p, p)$ has four independent rows, so it needs four products.`,
        2: t`Being a product is basis-independent: a boost transforms each factor $u^\mu$ and the result is still $\rho\,u'^\mu u'^\nu$.`,
        3: t`$\rho\,u^\mu u^\nu$ is literally a product of a vector with itself (times a number).`,
      },
      hints: [t`Is $\rho\,u^\mu u^\nu$ of the form $V^\mu W^\nu$?`, t`How many rows of $\operatorname{diag}(\rho, p, p, p)$ are multiples of one row?`],
      teach: 'Whether a tensor is a single product is a property of the tensor, not of the frame — dust is one, a fluid with pressure is not.',
      explain: t`Dust: $T^{\mu\nu} = (\sqrt\rho\,u^\mu)(\sqrt\rho\,u^\nu)$ in every frame. A fluid adds the pressure term $p\,(\eta^{\mu\nu} + u^\mu u^\nu)$ (the Road’s dissection of the perfect fluid), which needs three more products. Pressure is exactly what dust lacks.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-missing', difficulty: 2,
      gen(r) {
        let w, h;
        do { w = [nz(r), nz(r)]; h = [nz(r), nz(r)]; } while (Math.abs(w[1] * h[1]) > 12);
        const T = outer(w, h);
        return {
          prompt: t`The array $\begin{pmatrix} ${T[0][0]} & ${T[0][1]} \\ ${T[1][0]} & x \end{pmatrix}$ is a single tensor product $\omega_\mu\eta_\nu$. What is $x$?`,
          visual: productLegs(t`$T_{\mu\nu} = \omega_\mu\eta_\nu$: rank one.`),
          answer: T[1][1], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: T[0][1] + T[1][0] - T[0][0], feedback: 'The rows must be multiples of each other, not differ by a constant.' }].filter((e) => e.value !== T[1][1]),
          hints: [t`A product has determinant 0: $${T[0][0]}\,x - (${T[0][1]})(${T[1][0]}) = 0$.`],
          teach: 'A 2 × 2 product array has determinant zero, so any three entries fix the fourth.',
          explain: t`$x = \dfrac{(${T[0][1]})(${T[1][0]})}{${T[0][0]}} = ${T[1][1]}$; indeed $T = ${vecTeX(w)}\otimes${vecTeX(h)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-entangled', difficulty: 3, transfer: true,
      prompt: t`A state of two qubits is a tensor in the product of two 2-dimensional spaces: $\psi = c_{ij}\,\mathbf e_i\otimes\mathbf e_j$ ($i, j = 0, 1$). It is a **product state** — each qubit with a state of its own — exactly when $c_{ij}$ is a single product $a_ib_j$; otherwise the qubits are **entangled**. Which of these (unnormalised) states is entangled?`,
      visual: grid([['1', '0'], ['0', '1']], { rowNames: ['i=0', 'i=1'], colNames: ['j=0', 'j=1'], caption: t`One of the four coefficient arrays $c_{ij}$ — rows: the first qubit, columns: the second.` }),
      choices: [t`$c = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$ (a Bell state)`, t`$c = \begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$`, t`$c = \begin{pmatrix} 0 & 1 \\ 0 & 0 \end{pmatrix}$`, t`$c = \begin{pmatrix} 1 & -1 \\ 2 & -2 \end{pmatrix}$`],
      answer: 0,
      why: {
        1: t`$\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix} = (1, 1)\otimes(1, 1)$: each qubit is in $\mathbf e_0 + \mathbf e_1$ on its own.`,
        2: t`$(1, 0)\otimes(0, 1)$: the first qubit is in $\mathbf e_0$, the second in $\mathbf e_1$.`,
        3: t`$(1, 2)\otimes(1, -1)$: the rows are multiples, determinant 0.`,
      },
      hints: ['Test each array for rank one: are the rows multiples of each other? (Determinant zero.)', t`The Bell array has determinant 1.`],
      teach: 'Entanglement is a tensor that is not a single product: its coefficient array has rank above one.',
      explain: t`The Bell array has $\det = 1 \ne 0$, so no $a_ib_j$ can produce it: measuring one qubit tells you about the other. The rank of $c_{ij}$ — the minimum number of products — is the state’s *Schmidt rank*.`,
    }),
    num({
      id: 'cp-dxdy', difficulty: 2,
      gen(r) {
        const R = r.pick([1, 2, 3]), th = r.pick([30, 60, 120, 150]);
        const s = Math.sin(th * DEG), c = Math.cos(th * DEG);
        const which = r.pick(['rt', 'tr']);
        // dx = (cos θ, −r sin θ), dy = (sin θ, r cos θ) in (dr, dθ)
        const dx = [c, -R * s], dy = [s, R * c];
        const ans = which === 'rt' ? dx[0] * dy[1] : dx[1] * dy[0];
        const other = which === 'rt' ? dx[1] * dy[0] : dx[0] * dy[1];
        return {
          prompt: t`With $dx = \cos\theta\,dr - r\sin\theta\,d\theta$ and $dy = \sin\theta\,dr + r\cos\theta\,d\theta$, find the component $(dx\otimes dy)_{${which === 'rt' ? t`r\theta` : t`\theta r`}}$ at $(r, \theta) = (${R}, ${th}^\circ)$.`,
          visual: productLegs(t`$dx\otimes dy$: the first slot belongs to $dx$, the second to $dy$.`),
          answer: r6(ans), tol: { rel: 0.005, abs: 0.002 },
          errors: Math.abs(other - ans) > 0.01 ? [{ value: r6(other), feedback: t`That is the other off-diagonal component: the first index goes with the first factor, $dx$.` }] : [],
          hints: [t`$(dx\otimes dy)_{\mu\nu} = (dx)_\mu\,(dy)_\nu$, with $(dx)_r = \cos\theta$, $(dx)_\theta = -r\sin\theta$, $(dy)_r = \sin\theta$, $(dy)_\theta = r\cos\theta$.`],
          teach: t`$(\omega\otimes\eta)_{\mu\nu} = \omega_\mu\eta_\nu$ in any basis — here the polar one.`,
          explain: t`$${which === 'rt' ? t`(dx)_r(dy)_\theta = \cos${th}^\circ\cdot${R}\cos${th}^\circ` : t`(dx)_\theta(dy)_r = -${R}\sin${th}^\circ\cdot\sin${th}^\circ`} = ${nice(r6(ans), 4)}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (the tensor product and the basis of tensors)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.4 (outer products)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Tensor rank decomposition', url: 'https://en.wikipedia.org/wiki/Tensor_rank_decomposition' },
    { label: 'Schmidt decomposition (product and entangled states)', url: 'https://en.wikipedia.org/wiki/Schmidt_decomposition' },
  ],
});
