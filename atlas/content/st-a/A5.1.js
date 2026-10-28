// Tensors as multilinear machines: a (0,2) tensor eats two vectors and is
// linear in each slot separately; its components are its values on basis
// arrows, and the transformation law is multilinearity applied to them.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { still, legs, grid, arrow3 } from './_ten.js';
import { form, matTeX, vecTeX, bil, cong, inv2, transpose, mul, cols, AXES_NOTE } from './_metric.js';

const t = String.raw;
const SQ = [[1, 0], [0, 1]];
const BASES = [[[1, 0], [1, 1]], [[2, 0], [1, 1]], [[1, 1], [0, 1]], [[1, -1], [1, 1]], [[1, 0], [1, 2]], [[2, 1], [1, 1]]];
const randT = (r) => { let T; do { T = [[r.int(-3, 3), r.int(-3, 3)], [r.int(-3, 3), r.int(-3, 3)]]; } while (T[0][1] === T[1][0] || T.flat().filter((x) => x).length < 3); return T; };
const smallVec = (r) => [r.intExcept(-2, 2, [0]), r.intExcept(-2, 2, [0])];

export default lesson({
  id: 'st-a.A5.1',
  title: 'Tensors as multilinear machines',
  minutes: 11, difficulty: 3,
  intro: t`A covector is a machine with one slot: feed it a vector, get a number (lesson A3.1). A **tensor** is the same idea with more slots — some for vectors, some for covectors — returning one number and **linear in each slot separately**, the others held fixed. That is *multilinear*. The workhorse has two vector slots: $T(\mathbf U, \mathbf V)$. Its components are its values on the basis arrows, $T_{\mu\nu} = T(\mathbf e_\mu, \mathbf e_\nu)$, and multilinearity rebuilds everything else from them:

$$T(\mathbf U, \mathbf V) = T(U^\mu\mathbf e_\mu,\ V^\nu\mathbf e_\nu) = U^\mu V^\nu\,T(\mathbf e_\mu, \mathbf e_\nu) = T_{\mu\nu}\,U^\mu V^\nu$$

The same three moves give the **transformation law**. With a new basis $\mathbf e'_\mu = A^\alpha{}_\mu\,\mathbf e_\alpha$ (lesson A2.2), $T'_{\mu\nu} = T(\mathbf e'_\mu, \mathbf e'_\nu) = A^\alpha{}_\mu A^\beta{}_\nu\,T_{\alpha\beta}$ — **one factor of $A$ per slot**. Nothing went in but linearity, so the law is not an extra rule to memorise: it is what being a machine means. Feed the machine only $\mathbf U$ and what is left has one slot — a covector $T(\mathbf U, \cdot\,)$, which you can draw as a stack.`,
  symbols: [
    { tex: t`T`, text: 'a (0,2) tensor: a machine with two vector slots, linear in each' },
    { tex: t`T(\mathbf U, \mathbf V)`, text: t`the number it returns for $\mathbf U$ in the first slot and $\mathbf V$ in the second — the order matters unless $T$ is symmetric` },
    { tex: t`T_{\mu\nu}`, text: t`its components, $T(\mathbf e_\mu, \mathbf e_\nu)$: $n^2$ numbers in $n$ dimensions` },
    { tex: t`U^\mu,\ V^\nu`, text: t`the components of the two vectors; the repeated $\mu$ and $\nu$ are summed (lesson A1.2)` },
    { tex: t`\mathbf e_\mu`, text: 'the basis arrows' },
    { tex: t`A^\alpha{}_\mu`, text: t`the change of basis: column $\mu$ holds the old components of the new arrow $\mathbf e'_\mu$` },
  ],
  why: t`The metric, the stress–energy tensor and the Riemann tensor are all machines of this kind, and every transformation law you will meet is multilinearity applied to components.`,
  visual: {
    type: 'ten-metric',
    title: 'Two slots, one number',
    lead: t`The sliders set the four components $T_{\mu\nu}$. Feeding the blue arrow $\mathbf U$ to the first slot leaves the covector $T(\mathbf U, \cdot\,)$, drawn as teal lines; $T(\mathbf U, \mathbf V)$ is the number of them the gold arrow $\mathbf V$ crosses. Drag both tips.`,
    tasks: [
      t`Drag $\mathbf U$ to twice its length: the stack becomes twice as dense and $T(\mathbf U, \mathbf V)$ doubles — linear in the first slot.`,
      t`Slide the tip of $\mathbf V$ along one teal line: $T(\mathbf U, \mathbf V)$ does not change.`,
      t`Compare $T(\mathbf U, \mathbf V)$ with $T(\mathbf V, \mathbf U)$, then set $T_{12} = T_{21}$: now they agree for every pair.`,
    ],
    params: { mode: 'form', T: [[1, 0.5], [-0.5, 1]], sliders: 'full', U: [1, 0.5], V: [1.2, 1.4], readout: ['TUV', 'TVU', 'low'] },
    caption: t`The teal lines are $T(\mathbf U, \cdot\,)$ at whole-number values; the bold ones are those $\mathbf V$ crosses. ${AXES_NOTE} Tips snap to 0.1.`,
  },
  example: {
    prompt: t`A machine $T$ has $T(\mathbf e_1, \mathbf e_1) = 2$, $T(\mathbf e_1, \mathbf e_2) = 1$, $T(\mathbf e_2, \mathbf e_1) = -1$, $T(\mathbf e_2, \mathbf e_2) = 3$. Find $T(\mathbf U, \mathbf V)$ for $\mathbf U = \mathbf e_1 + 2\mathbf e_2$ and $\mathbf V = 3\mathbf e_1 - \mathbf e_2$. Then find $T$’s components in the basis $\mathbf e'_1 = \mathbf e_1 + \mathbf e_2$, $\mathbf e'_2 = \mathbf e_2$, and check the answer there.`,
    visual: form({ T: [[2, 1], [-1, 3]], U: [1, 2], V: [3, -1], view: 2.4, crossings: true }, t`$T(\mathbf U, \cdot\,)$ has components $(0, 7)$: seven lines per unit of $x^2$. $\mathbf V$ drops one unit of $x^2$ and crosses seven of them, going down the labels. ${AXES_NOTE}`),
    steps: [
      { label: 'Components', text: t`The four values are the components: $T_{\mu\nu} = ${matTeX([[2, 1], [-1, 3]])}$, rows $\mu$, columns $\nu$.` },
      { label: 'Feed the first arrow', text: t`$T(\mathbf U, \cdot\,)_\nu = U^\mu T_{\mu\nu} = 1\cdot(2, 1) + 2\cdot(-1, 3) = (0, 7)$ — a covector.` },
      { label: 'Feed the second', text: t`$T(\mathbf U, \mathbf V) = 0\cdot3 + 7\cdot(-1) = -7$.` },
      { label: 'New components', text: t`By multilinearity: $T'_{11} = T(\mathbf e_1 + \mathbf e_2, \mathbf e_1 + \mathbf e_2) = 2 + 1 - 1 + 3 = 5$, $T'_{12} = T(\mathbf e_1 + \mathbf e_2, \mathbf e_2) = 1 + 3 = 4$, $T'_{21} = T(\mathbf e_2, \mathbf e_1 + \mathbf e_2) = -1 + 3 = 2$, $T'_{22} = 3$. That is $A^\alpha{}_\mu A^\beta{}_\nu T_{\alpha\beta}$ with $A = ${matTeX([[1, 0], [1, 1]])}$.` },
      { label: 'Check', text: t`In the new basis $\mathbf U = \mathbf e'_1 + \mathbf e'_2$ and $\mathbf V = 3\mathbf e'_1 - 4\mathbf e'_2$, so $T'_{\mu\nu}U'^\mu V'^\nu = (5 + 2)\cdot3 + (4 + 3)\cdot(-4) = 21 - 28 = -7$. ✓ Different components, the same number.` },
    ],
    answer: t`$T(\mathbf U, \mathbf V) = -7$; $T'_{\mu\nu} = ${matTeX([[5, 4], [2, 3]])}$, which gives $-7$ again.`,
  },
  practice: [
    multi({
      id: 'which-multilinear', difficulty: 1,
      prompt: t`Which of these rules define a (0,2) tensor — linear in $\mathbf U$ with $\mathbf V$ fixed, and linear in $\mathbf V$ with $\mathbf U$ fixed? Select every one.`,
      visual: form({ T: [[0, 1], [-1, 0]], U: [1.2, 0.4], V: [0.6, 1.5], showV: true, levelLabels: true }, t`The first rule, $U^1V^2 - U^2V^1$, with $\mathbf U$ fed in: its stack runs parallel to $\mathbf U$ itself. ${AXES_NOTE}`),
      choices: [t`$T(\mathbf U, \mathbf V) = U^1V^2 - U^2V^1$`, t`$T(\mathbf U, \mathbf V) = 3U^1V^1 + U^2V^1$`, t`$T(\mathbf U, \mathbf V) = U^1 + V^1$`, t`$T(\mathbf U, \mathbf V) = U^1V^1 + 1$`, t`$T(\mathbf U, \mathbf V) = (U^1)^2\,V^2$`],
      answer: [0, 1],
      why: {
        2: t`Doubling $\mathbf U$ gives $2U^1 + V^1$, not $2(U^1 + V^1)$: a sum of the two is not linear in each.`,
        3: t`A linear machine gives 0 when a slot holds the zero vector; this gives 1.`,
        4: t`Doubling $\mathbf U$ multiplies this by 4: it is quadratic in $\mathbf U$.`,
      },
      hints: [t`Test each rule: does $T(2\mathbf U, \mathbf V) = 2T(\mathbf U, \mathbf V)$, and does $T(\mathbf 0, \mathbf V) = 0$?`],
      teach: t`Multilinear means every term holds exactly one component of each slot’s vector, to the first power: a sum $T_{\mu\nu}U^\mu V^\nu$.`,
      explain: t`The first two are of the form $T_{\mu\nu}U^\mu V^\nu$ — with $T_{12} = 1, T_{21} = -1$, and with $T_{11} = 3, T_{21} = 1$. The others fail a scaling test.`,
    }),
    num({
      id: 'evaluate', difficulty: 1,
      gen(r) {
        const T = randT(r);
        let U, V, ans;
        do { U = smallVec(r); V = smallVec(r); ans = bil(T, U, V); } while (ans === 0 || ans === bil(T, V, U) || Math.abs(ans) > 25);
        const swapped = bil(T, V, U), diag = T[0][0] * U[0] * V[0] + T[1][1] * U[1] * V[1];
        return {
          prompt: t`A (0,2) tensor has components $T_{\mu\nu} = ${matTeX(T)}$ (rows $\mu$, columns $\nu$). Find $T(\mathbf U, \mathbf V)$ for $U^\mu = ${vecTeX(U)}$ and $V^\nu = ${vecTeX(V)}$.`,
          visual: form({ T, U: U.map((x) => x * 0.8), V: V.map((x) => x * 0.8), view: 2.2 }, t`$\mathbf U$ and $\mathbf V$ (drawn at 0.8 scale) and the stack of $T(\mathbf U, \cdot\,)$. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: swapped, feedback: t`That is $T(\mathbf V, \mathbf U)$: the first slot takes the row index $\mu$, so $\mathbf U$ goes with the rows.` }, ...(diag !== ans && diag !== swapped ? [{ value: diag, feedback: t`You kept only the diagonal terms. All four $T_{\mu\nu}U^\mu V^\nu$ count, $T_{12}U^1V^2$ and $T_{21}U^2V^1$ included.` }] : [])],
          hints: [t`Feed $\mathbf U$ first: $U^\mu T_{\mu\nu}$ is $U^1$ times row 1 plus $U^2$ times row 2.`, t`$U^\mu T_{\mu\nu} = ${vecTeX([U[0] * T[0][0] + U[1] * T[1][0], U[0] * T[0][1] + U[1] * T[1][1]])}$; now pair it with $V^\nu$.`],
          teach: t`$T(\mathbf U, \mathbf V) = T_{\mu\nu}U^\mu V^\nu$: four terms in two dimensions, the first slot on the rows.`,
          explain: t`$U^\mu T_{\mu\nu} = ${vecTeX([U[0] * T[0][0] + U[1] * T[1][0], U[0] * T[0][1] + U[1] * T[1][1]])}$, and pairing with $${vecTeX(V)}$ gives $${ans}$.`,
        };
      },
    }),
    num({
      id: 'scale', difficulty: 2,
      gen(r) {
        let T, U, V, k, m;
        do { T = randT(r); U = smallVec(r); V = smallVec(r); k = bil(T, U, V); m = bil(T, U, U); } while (k === 0 || m === 0 || Math.abs(k) > 12 || Math.abs(m) > 12);
        const a = r.pick([2, 3, -2]), b = r.pick([2, 3, -1]), c = r.pick([1, 2, -1]);
        const ans = a * b * k + a * c * m;
        return {
          prompt: t`For a tensor $T$ and two vectors, $T(\mathbf U, \mathbf V) = ${k}$ and $T(\mathbf U, \mathbf U) = ${m}$. Find $T\big(${a}\mathbf U,\ ${b}\mathbf V ${c < 0 ? '-' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}\mathbf U\big)$.`,
          visual: form({ T, U: U.map((x) => x * 0.8), V: V.map((x) => x * 0.8), view: 2.2 }, t`One such $\mathbf U$ and $\mathbf V$ (at 0.8 scale), with the stack $T(\mathbf U, \cdot\,)$. ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: a * b * k, feedback: t`The second slot holds $${b}\mathbf V$ *and* $${c}\mathbf U$: linearity there splits it into two terms, the second $T(\mathbf U, \mathbf U)$.` }, { value: a * b * k + c * m, feedback: t`The factor $${a}$ in the first slot multiplies *both* terms.` }].filter((e) => e.value !== ans),
          hints: [t`Pull the $${a}$ out of the first slot, then split the second slot by linearity.`, t`$T(${a}\mathbf U, ${b}\mathbf V + (${c})\mathbf U) = ${a}\big[${b}\,T(\mathbf U, \mathbf V) + (${c})\,T(\mathbf U, \mathbf U)\big]$.`],
          teach: 'Linear in each slot: numbers come out of every slot, and a sum in one slot splits into a sum of values.',
          explain: t`$${a}\big[${b}\cdot${k} + (${c})\cdot${m}\big] = ${ans}$ — without knowing a single component.`,
        };
      },
    }),
    num({
      id: 'recover', difficulty: 2,
      gen(r) {
        const T = randT(r);
        const b = T[0][0] + T[1][0];
        return {
          prompt: t`Your only access to a tensor is to feed it arrows. You find $T(\mathbf e_1, \mathbf e_1) = ${T[0][0]}$, $T(\mathbf e_1 + \mathbf e_2,\ \mathbf e_1) = ${b}$, $T(\mathbf e_1, \mathbf e_2) = ${T[0][1]}$ and $T(\mathbf e_2, \mathbf e_2) = ${T[1][1]}$. What is the component $T_{21}$?`,
          visual: form({ T, U: [1, 1], V: [1, 0], uname: 'e₁ + e₂', vname: 'e₁', view: 1.8 }, t`The arrows $\mathbf e_1 + \mathbf e_2$ (blue, in the first slot) and $\mathbf e_1$ (gold), with the stack of $T(\mathbf e_1 + \mathbf e_2, \cdot\,)$. ${AXES_NOTE}`),
          answer: T[1][0], tol: { rel: 0, abs: 0.01 },
          errors: [...(b !== T[1][0] ? [{ value: b, feedback: t`That is $T(\mathbf e_1 + \mathbf e_2, \mathbf e_1)$, which is $T_{11} + T_{21}$: subtract the $T_{11}$.` }] : []), ...(T[0][1] !== T[1][0] ? [{ value: T[0][1], feedback: t`That is $T_{12} = T(\mathbf e_1, \mathbf e_2)$. $T_{21}$ has $\mathbf e_2$ in the *first* slot; nothing says $T$ is symmetric.` }] : [])],
          hints: [t`$T_{21} = T(\mathbf e_2, \mathbf e_1)$. Split the first slot of $T(\mathbf e_1 + \mathbf e_2, \mathbf e_1)$.`],
          teach: 'Linearity in one slot lets you read a component off any combination of basis arrows.',
          explain: t`$T(\mathbf e_1 + \mathbf e_2, \mathbf e_1) = T_{11} + T_{21}$, so $T_{21} = ${b} - ${T[0][0]} = ${T[1][0]}$.`,
        };
      },
    }),
    order({
      id: 'derive-law', difficulty: 2,
      prompt: t`Put in order the derivation of the transformation law $T'_{\mu\nu} = A^\alpha{}_\mu A^\beta{}_\nu\,T_{\alpha\beta}$.`,
      visual: legs([{ name: 'A', down: ['μ'] }, { name: 'T' }, { name: 'A', down: ['ν'] }], { links: [{ a: 0, b: 1, index: 'α' }, { a: 1, b: 2, index: 'β' }], caption: t`The law as an index diagram: each slot of $T$ is joined to its own factor of $A$; the free legs $\mu$, $\nu$ are the new slots.` }),
      items: [
        t`A component is the machine’s value on basis arrows: $T'_{\mu\nu} = T(\mathbf e'_\mu, \mathbf e'_\nu)$.`,
        t`Write the new arrows in the old: $T'_{\mu\nu} = T(A^\alpha{}_\mu\,\mathbf e_\alpha,\ A^\beta{}_\nu\,\mathbf e_\beta)$.`,
        t`Pull the numbers out of each slot: $T'_{\mu\nu} = A^\alpha{}_\mu A^\beta{}_\nu\,T(\mathbf e_\alpha, \mathbf e_\beta)$.`,
        t`Recognise the old components: $T'_{\mu\nu} = A^\alpha{}_\mu A^\beta{}_\nu\,T_{\alpha\beta}$.`,
      ],
      hints: ['Start from the definition of a component.', 'Linearity is used once per slot.'],
      teach: 'The transformation law of any tensor is: definition of components, substitute the new basis, linearity in every slot, recognise the old components.',
      explain: t`The same four steps work for any number of slots: one factor of $A$ for each vector slot (lower index) — and, as lesson A5.2 shows, one of $A^{-1}$ for each covector slot.`,
    }),
    num({
      id: 'transform', difficulty: 3,
      gen(r) {
        let A, T, Tn, i, j;
        do { A = r.pick(BASES); T = randT(r); Tn = cong(T, A); i = r.pick([1, 2]); j = r.pick([1, 2]); } while (Tn[i - 1][j - 1] === 0);
        const ans = Tn[i - 1][j - 1];
        const one = mul(transpose(A), T)[i - 1][j - 1];
        const Ai = inv2(A), back = cong(T, Ai)[i - 1][j - 1];
        return {
          prompt: t`A tensor has $T_{\alpha\beta} = ${matTeX(T)}$. The basis changes to $\mathbf e'_\mu = A^\alpha{}_\mu\,\mathbf e_\alpha$ with $A = ${matTeX(A)}$ (column $\mu$ = the new arrow’s old components). Find $T'_{${i}${j}}$.`,
          visual: still({ basis: cols(A), ghost: SQ, showVector: false, construction: false, grid: 'none' }, t`The new basis $\mathbf e'_1$, $\mathbf e'_2$ (bold), drawn from the columns of $A$, over the old (faint).`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [...(one !== ans ? [{ value: one, feedback: t`One factor of $A$ is missing: each of the two slots gets its own, $A^\alpha{}_${i}A^\beta{}_${j}T_{\alpha\beta}$.` }] : []), ...(Math.abs(back - ans) > 0.01 ? [{ value: back, feedback: t`That used $A^{-1}$. A lower index transforms *with* the basis — with $A$ itself.` }] : [])],
          hints: [t`$T'_{${i}${j}} = T(\mathbf e'_${i}, \mathbf e'_${j})$, and $\mathbf e'_${i}$, $\mathbf e'_${j}$ are columns ${i} and ${j} of $A$.`, t`Compute $T(\mathbf e'_${i}, \mathbf e'_${j})$ with $\mathbf e'_${i} = ${vecTeX(cols(A)[i - 1])}$ and $\mathbf e'_${j} = ${vecTeX(cols(A)[j - 1])}$, exactly as you would $T(\mathbf U, \mathbf V)$.`],
          teach: t`$T'_{\mu\nu} = T(\mathbf e'_\mu, \mathbf e'_\nu) = (A^\mathsf{T}TA)_{\mu\nu}$: evaluate the machine on the new arrows.`,
          explain: t`$T'_{${i}${j}} = T\big(${vecTeX(cols(A)[i - 1])}, ${vecTeX(cols(A)[j - 1])}\big) = ${ans}$. All four: $T' = A^\mathsf{T}TA = ${matTeX(Tn)}$.`,
        };
      },
    }),
    mcq({
      id: 'linear-slip', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “A tensor is linear, so $T(2\mathbf U, 2\mathbf V) = 2\,T(\mathbf U, \mathbf V)$.” What is the right statement?`,
      visual: form({ T: [[1, 0.4], [0.4, 1.2]], U: [1.6, 0.6], V: [0.5, 1.6], view: 2.2, levelLabels: true }, t`$T(2\mathbf U, \cdot\,)$: twice the arrow, twice the density of lines — and a doubled $\mathbf V$ then crosses twice as many again. ${AXES_NOTE}`),
      choices: [t`$T(2\mathbf U, 2\mathbf V) = 4\,T(\mathbf U, \mathbf V)$: each slot contributes its own factor of 2`, t`It is right: linear means doubling the input doubles the output`, t`$T(2\mathbf U, 2\mathbf V) = T(\mathbf U, \mathbf V)$: the factors cancel`, t`It depends on whether $T$ is symmetric`],
      answer: 0,
      why: {
        1: 'Multilinear means linear in each slot with the others fixed — not linear in the pair. Doubling both doubles it twice.',
        2: 'Nothing cancels: both factors multiply.',
        3: 'Symmetry is about swapping the slots; scaling works the same either way.',
      },
      hints: [t`Pull the 2 out of the first slot, then the 2 out of the second.`],
      teach: t`A (0,2) tensor is quadratic under scaling both arguments: $T(\lambda\mathbf U, \lambda\mathbf V) = \lambda^2T(\mathbf U, \mathbf V)$.`,
      explain: t`$T(2\mathbf U, 2\mathbf V) = 2\,T(\mathbf U, 2\mathbf V) = 4\,T(\mathbf U, \mathbf V)$. That is why a squared length $g(\mathbf V, \mathbf V)$ grows as the square of the arrow (lesson A6.1).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-3d', difficulty: 2,
      gen(r) {
        let T, U, V, ans;
        do {
          T = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-2, 3)));
          U = [r.int(-2, 2), r.int(-2, 2), r.intExcept(-2, 2, [0])]; V = [r.intExcept(-2, 2, [0]), r.int(-2, 2), r.int(-2, 2)];
          ans = bil(T, U, V);
        } while (ans === 0 || ans === bil(T, V, U) || Math.abs(ans) > 30);
        return {
          prompt: t`In three dimensions, $T_{\mu\nu} = ${matTeX(T)}$. Find $T(\mathbf U, \mathbf V)$ for $U^\mu = ${vecTeX(U)}$, $V^\nu = ${vecTeX(V)}$.`,
          visual: grid(T, { rowNames: ['μ=1', 'μ=2', 'μ=3'], colNames: ['ν=1', 'ν=2', 'ν=3'], dx: 1.3, caption: t`The nine components $T_{\mu\nu}$: the first slot picks the row, the second the column.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: bil(T, V, U), feedback: t`That is $T(\mathbf V, \mathbf U)$: the first slot’s vector goes with the rows.` }],
          hints: [t`$U^\mu T_{\mu\nu}$ first (a row of three numbers), then pair with $V^\nu$.`],
          teach: t`$T(\mathbf U, \mathbf V) = T_{\mu\nu}U^\mu V^\nu$: nine terms in three dimensions.`,
          explain: t`$U^\mu T_{\mu\nu} = ${vecTeX(mul([U], T)[0])}$, paired with $${vecTeX(V)}$: $${ans}$.`,
        };
      },
    }),
    num({
      id: 'cp-spin', difficulty: 3, transfer: true,
      gen(r) {
        const I = [[310, -12, 4], [-12, 280, -6], [4, -6, 190]];
        const w = [r.pick([0.02, 0.03, -0.02]), r.pick([-0.01, 0.015, 0.01]), r.pick([0.05, 0.04, -0.03])];
        const E = 0.5 * bil(I, w, w);
        const diag = 0.5 * (I[0][0] * w[0] ** 2 + I[1][1] * w[1] ** 2 + I[2][2] * w[2] ** 2);
        return {
          prompt: t`A small Earth-observation satellite (illustrative values) has inertia tensor $I_{ij} = ${matTeX(I)}\ \text{kg m}^2$ in its body axes. Its rotational kinetic energy is $E = \tfrac12\,I(\boldsymbol\omega, \boldsymbol\omega) = \tfrac12\,I_{ij}\,\omega^i\omega^j$. The star trackers read $\omega^i = ${vecTeX(w)}$ rad/s. What is $E$, in joules?`,
          visual: arrow3(w.map((x) => x * 30), { label: t`30\,\boldsymbol\omega`, caption: t`The spin vector $\boldsymbol\omega$, scaled up 30 times, with its components along the body axes.` }),
          answer: E, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: diag, feedback: t`You kept only the diagonal. The products of inertia ($I_{12}$, $I_{13}$, $I_{23}$) each appear twice, as $I_{12}\omega^1\omega^2 + I_{21}\omega^2\omega^1$.` }].filter((e) => Math.abs(e.value - E) > 0.02 * E),
          hints: [t`Compute $I_{ij}\omega^j$ first (a row of three numbers), then pair it with $\omega^i$ and halve.`, t`$I_{ij}\omega^j = ${vecTeX(I.map((row) => +row.reduce((s, a, k) => s + a * w[k], 0).toFixed(4)))}$.`],
          teach: 'The inertia tensor is a (0,2) machine: fed the spin twice, it gives twice the rotational kinetic energy.',
          explain: t`$I_{ij}\omega^i\omega^j = ${nice(2 * E, 4)}\ \text{J}$, so $E = ${nice(E, 4)}$ J. The same tensor fed two *different* spins gives the cross term that couples them.`,
        };
      },
    }),
    mcq({
      id: 'cp-law', difficulty: 2,
      prompt: t`Under a change of coordinates $x \to x'$, the new basis vectors are $\partial'_\mu = \dfrac{\partial x^\alpha}{\partial x'^\mu}\,\partial_\alpha$ (lesson A4.2). How do the components of a (0,2) tensor change?`,
      visual: legs([{ name: 'J', down: ['μ'] }, { name: 'T' }, { name: 'J', down: ['ν'] }], { links: [{ a: 0, b: 1, index: 'α' }, { a: 1, b: 2, index: 'β' }], caption: t`One Jacobian factor per slot, here $J^\alpha{}_\mu = \partial x^\alpha/\partial x'^\mu$.` }),
      choices: [
        t`$T'_{\mu\nu} = \dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x^\beta}{\partial x'^\nu}\,T_{\alpha\beta}$`,
        t`$T'_{\mu\nu} = \dfrac{\partial x'^\mu}{\partial x^\alpha}\dfrac{\partial x'^\nu}{\partial x^\beta}\,T_{\alpha\beta}$`,
        t`$T'_{\mu\nu} = \dfrac{\partial x^\alpha}{\partial x'^\mu}\,T_{\alpha\nu}$`,
        t`$T'_{\mu\nu} = \dfrac{\partial x^\alpha}{\partial x'^\mu}\dfrac{\partial x^\beta}{\partial x'^\nu}\,T_{\beta\alpha}$`,
      ],
      answer: 0,
      why: {
        1: t`That is the law for two *upper* indices — the free $\mu$ would sit upstairs, unbalanced against $T'_{\mu\nu}$.`,
        2: t`Only one slot was transformed; the second still needs its own factor, and $T_{\alpha\nu}$ mixes old and new indices.`,
        3: t`The slots are swapped: $T_{\beta\alpha}$ feeds $\partial'_\mu$ to the second slot. It is right only for a symmetric $T$.`,
      },
      hints: [t`$T'_{\mu\nu} = T(\partial'_\mu, \partial'_\nu)$: substitute and pull out the numbers, slot by slot.`],
      teach: 'A tensor’s transformation law has one Jacobian factor per index, each matched to its own slot.',
      explain: t`$T(\partial'_\mu, \partial'_\nu) = \frac{\partial x^\alpha}{\partial x'^\mu}\frac{\partial x^\beta}{\partial x'^\nu}T(\partial_\alpha, \partial_\beta)$ — the first factor goes with the first slot.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (tensors as multilinear maps)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), ch. 3', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Tensor (as a multilinear map)', url: 'https://en.wikipedia.org/wiki/Tensor#As_multilinear_maps' },
  ],
});
