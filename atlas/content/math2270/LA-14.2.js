// Two transformation laws: when the basis changes by P (new basis vectors =
// columns of P in old coordinates), vector components change by P⁻¹ and
// covector components by Pᵀ, so the pairing ω(x) is the same number in every
// basis. The dual basis changes by P⁻¹ (its rows), operators by P⁻¹AP.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matvec, matTeX, transpose, inverse, tupleTeX, colTeX, dot } from './_la.js';
import { unimod2, rowTeX, round, basesPic } from './_dual.js';

const t = String.raw;
const ORD = ['first', 'second'];
const DEG = Math.PI / 180;
const EX_P = [[2, 1], [1, 1]];

// a random basis change, vector and covector with small integer components
function setup(r) {
  const P = unimod2(r, 2), Pi = round(inverse(P));
  let x = [1, 1], w = [1, 1];
  for (let k = 0; k < 100; k++) {
    x = [r.intExcept(-3, 3, [0]), r.int(-3, 3)]; w = [r.int(-3, 3), r.intExcept(-3, 3, [0])];
    const xn = matvec(Pi, x), wn = matvec(transpose(P), w);
    if (xn.every((v) => Math.abs(v) <= 9) && wn.every((v) => Math.abs(v) <= 9) && dot(w, x) !== 0) break;
  }
  return { P, Pi, PT: transpose(P), x, w, xn: matvec(Pi, x), wn: matvec(transpose(P), w) };
}

export default lesson({
  id: 'math2270.LA-14.2',
  title: 'Two transformation laws: vectors versus covectors',
  minutes: 12, difficulty: 3,
  intro: t`Change basis: the new basis vectors are the columns of an invertible $P$, written in old coordinates, so $\mathbf b'_j = \sum_i P_{ij}\mathbf b_i$. LA-7.2 showed that a vector’s components change **against** the basis, by $P^{-1}$. A covector’s components are its values on the basis vectors, $\omega_j = \omega(\mathbf b_j)$, so they change **with** the basis: $\omega'_j = \omega(\sum_i P_{ij}\mathbf b_i) = \sum_i P_{ij}\,\omega_i$. As columns,
$$[\mathbf x]' = P^{-1}[\mathbf x], \qquad [\omega]' = P^{\mathsf T}[\omega], \qquad \omega(\mathbf x) = [\omega]'^{\mathsf T}[\mathbf x]' = [\omega]^{\mathsf T}P\,P^{-1}[\mathbf x] = [\omega]^{\mathsf T}[\mathbf x]$$
The two laws are built to cancel: **the number $\omega(\mathbf x)$ is the same in every basis**, though both lists of components change. The dual basis itself changes by $P^{-1}$ (its new members are the rows of $P^{-1}$, LA-14.1), and the matrix of a linear operator by $P^{-1}AP$ (LA-7.3), one factor for each kind of slot. Physicists call the $P^{-1}$ law *contravariant* (upper indices, $x^i$) and the $P^{\mathsf T}$ law *covariant* (lower indices, $\omega_i$); the tensor track derives the same pair with pictures in [A3.5](#/lesson/st-a.A3.5), and in curved coordinates $P$ becomes the Jacobian ([A4.2](#/lesson/st-a.A4.2)).`,
  symbols: [
    { tex: 'P', text: t`the change-of-basis matrix: column $j$ holds the old coordinates of the new basis vector $\mathbf b'_j$` },
    { tex: t`[\mathbf x],\ [\mathbf x]'`, text: t`a vector’s old and new components (columns)` },
    { tex: t`[\omega],\ [\omega]'`, text: t`a covector’s old and new components, $\omega_j = \omega(\mathbf b_j)$, written as columns` },
    { tex: t`P^{-1}`, text: t`the vector law: components move against the basis` },
    { tex: t`P^{\mathsf T}`, text: t`the covector law: components move with the basis, $\omega'_j = \sum_i P_{ij}\omega_i$` },
    { tex: t`\omega(\mathbf x)`, text: t`the pairing — one number, the same in every basis` },
  ],
  why: 'Telling the two laws apart is the whole of tensor bookkeeping: velocities and displacements are vectors, gradients and sensitivities are covectors, and in relativity every equation must balance the two.',
  visual: {
    type: 'graph',
    title: 'Two ledgers that balance',
    lead: t`Left: a fixed vector $\mathbf x$ (gold), a fixed covector $\omega$ (its violet level lines $\omega = 1, 2, 3, 4$), the old basis (grey) and a new one you set with the sliders: $\mathbf b'_1 = (s, 0)$, $\mathbf b'_2 = (h, k)$. Right: the new components as bars — the vector’s from $P^{-1}$, the covector’s from $P^{\mathsf T}$.`,
    tasks: [
      'Stretch b′₁ (raise s): the vector component x′¹ shrinks and the covector component ω′₁ grows by the same factor. The pairing in the readout stays 3.5.',
      'Shear b′₂ (change h): x′¹ changes, because P⁻¹ mixes the components — and ω′₂ changes too, picking up h·ω₁ through Pᵀ.',
      'Set s = k = 1 and h = 0: the new basis is the old one, and both ledgers read their old values, x = (2, 1.5) and ω = (1, 1).',
    ],
    params: {
      x: [-1.4, 8.4], y: [-1.6, 3.3], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false,
      sliders: [
        { key: 's', label: t`$s$ (length of $\mathbf b'_1$)`, min: 0.8, max: 2.5, step: 0.1, value: 1.5, explain: t`$\mathbf b'_1 = (s, 0)$: a longer first basis vector.` },
        { key: 'h', label: t`$h$ (shear of $\mathbf b'_2$)`, min: -1, max: 1, step: 0.1, value: 0.5, explain: t`$\mathbf b'_2 = (h, k)$: $h$ leans it sideways.` },
        { key: 'k', label: t`$k$ (height of $\mathbf b'_2$)`, min: 0.8, max: 2, step: 0.1, value: 1, explain: t`The upward part of $\mathbf b'_2$.` },
      ],
      curves: [
        { param: ['t', '0'], t: [-1.3, 3.4], color: 'ink4', width: 1 }, { param: ['0', 't'], t: [-1.5, 3.2], color: 'ink4', width: 1 },
        ...[1, 2, 3, 4].map((c) => ({ param: ['t', `${c} - t`], t: [Math.max(-1.3, c - 3.2), Math.min(3.4, c + 1.5)], color: 'violet', width: 1, dash: [4, 4], label: `ω = ${c}`, labelAt: Math.min(3.4, c + 1.5) - 0.05, labelDx: 4, labelDy: 10 })),
        { param: ['4.3 + 3.9*t', '0'], t: [0, 1], color: 'ink3', width: 1.2 },
      ],
      arrows: [
        { from: [0, 0], to: [1, 0], color: 'ink3', width: 1.4 }, { from: [0, 0], to: [0, 1], color: 'ink3', width: 1.4 },
        { from: [0, 0], to: ['s', 0], color: 'accent', width: 3, label: 'b′₁', labelDy: 16 },
        { from: [0, 0], to: ['h', 'k'], color: 'warn', width: 3, label: 'b′₂' },
        { from: [0, 0], to: [2, 1.5], color: 'gold', width: 3, label: 'x' },
      ],
      shade: [
        { fn: '0.4*(2 - 1.5*h/k)/s', lower: '0', from: 4.6, to: 5.1, color: 'gold', alpha: 0.75 },
        { fn: '0.4*1.5/k', lower: '0', from: 5.4, to: 5.9, color: 'gold', alpha: 0.75 },
        { fn: '0.4*s', lower: '0', from: 6.8, to: 7.3, color: 'violet', alpha: 0.75 },
        { fn: '0.4*(h + k)', lower: '0', from: 7.6, to: 8.1, color: 'violet', alpha: 0.75 },
      ],
      points: [
        { x: 4.85, y: 0, r: 0, label: 'x′¹', labelAlign: 'center', labelDx: 0, labelDy: 16, color: 'gold' },
        { x: 5.65, y: 0, r: 0, label: 'x′²', labelAlign: 'center', labelDx: 0, labelDy: 16, color: 'gold' },
        { x: 7.05, y: 0, r: 0, label: 'ω′₁', labelAlign: 'center', labelDx: 0, labelDy: 16, color: 'violet' },
        { x: 7.85, y: 0, r: 0, label: 'ω′₂', labelAlign: 'center', labelDx: 0, labelDy: 16, color: 'violet' },
        { x: 5.25, y: -0.95, r: 0, label: 'vector: P⁻¹', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
        { x: 7.45, y: -0.95, r: 0, label: 'covector: Pᵀ', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'ink2' },
      ],
      readouts: [
        { label: t`$x'^1$`, expr: '(2 - 1.5*h/k)/s', digits: 3 },
        { label: t`$x'^2$`, expr: '1.5/k', digits: 3 },
        { label: t`$\omega'_1$`, expr: 's', digits: 3 },
        { label: t`$\omega'_2$`, expr: 'h + k', digits: 3 },
        { label: t`$\omega'_1x'^1 + \omega'_2x'^2$`, expr: 's*(2 - 1.5*h/k)/s + (h + k)*1.5/k', digits: 4 },
      ],
    },
    caption: 'Left: the vector x = (2, 1.5) and the covector ω = x₁ + x₂ (level lines), both fixed; old basis grey, new basis coloured. Right: bar heights are the new components, drawn at 0.4 of their size so they fit.',
  },
  example: {
    prompt: t`The new basis is $\mathbf b'_1 = (2, 1)$, $\mathbf b'_2 = (1, 1)$ in old coordinates, so $P = ${matTeX(EX_P)}$. A vector has old components $[\mathbf x] = (3, 1)$ and a covector $[\omega] = (1, -2)$, i.e. $\omega(\mathbf x) = x_1 - 2x_2$. Find both sets of new components and check the pairing.`,
    visual: basesPic(EX_P, { w: [1, -2], x: [3, 1], ks: [-2, -1, 0, 1, 2], caption: 'Old basis (grey), new basis b′₁ = (2, 1), b′₂ = (1, 1), the vector x (gold) and the level lines of ω (violet). x’s tip lies on the line ω = 1.' }),
    steps: [
      { label: 'Invert', text: t`$\det P = 1$, so $P^{-1} = ${matTeX([[1, -1], [-1, 2]])}$.` },
      { label: 'Vector law', text: t`$[\mathbf x]' = P^{-1}[\mathbf x] = ${matTeX([[1, -1], [-1, 2]])}${colTeX([3, 1])} = ${colTeX([2, -1])}$. Check: $2\mathbf b'_1 - \mathbf b'_2 = (4 - 1,\ 2 - 1) = (3, 1)$. ✓` },
      { label: 'Covector law', text: t`$[\omega]' = P^{\mathsf T}[\omega] = ${matTeX([[2, 1], [1, 1]])}${colTeX([1, -2])} = ${colTeX([0, -1])}$. Check directly: $\omega(\mathbf b'_1) = 2 - 2 = 0$ and $\omega(\mathbf b'_2) = 1 - 2 = -1$. ✓ (So $\mathbf b'_1$ runs along the level lines of $\omega$.)` },
      { label: 'Pairing', text: t`Old: $1\cdot3 + (-2)\cdot1 = 1$. New: $0\cdot2 + (-1)(-1) = 1$. ✓ The same number, as it must be: $[\omega]'^{\mathsf T}[\mathbf x]' = [\omega]^{\mathsf T}PP^{-1}[\mathbf x]$.` },
      { label: 'Dual basis', text: t`The new dual basis is the rows of $P^{-1}$: $\mathbf e'^1 = \mathbf e^1 - \mathbf e^2$ and $\mathbf e'^2 = -\mathbf e^1 + 2\mathbf e^2$. Then $\omega = 0\cdot\mathbf e'^1 - 1\cdot\mathbf e'^2 = \mathbf e^1 - 2\mathbf e^2$. ✓ Components with $P^{\mathsf T}$, dual basis with $P^{-1}$ — and the covector itself never changed.` },
    ],
    answer: t`$[\mathbf x]' = (2, -1)$, $[\omega]' = (0, -1)$, and $\omega(\mathbf x) = 1$ in both bases.`,
  },
  practice: [
    mcq({
      id: 'law', difficulty: 1,
      prompt: t`The new basis vectors are the columns of $P$ (in old coordinates). By which matrix are a **covector’s** components multiplied, written as a column?`,
      choices: [t`$P^{\mathsf T}$`, t`$P^{-1}$`, t`$P$`, t`$(P^{-1})^{\mathsf T}$`],
      answer: 0,
      why: {
        1: t`That is the law for a vector’s components, which move against the basis.`,
        2: t`Close: covector components do move *with* the basis, but $\omega'_j = \sum_i P_{ij}\omega_i$ sums over the row index of $P$ — as a column that is $P^{\mathsf T}[\omega]$.`,
        3: t`$(P^{-1})^{\mathsf T}$ takes *new* covector components back to old ones: $[\omega] = (P^{\mathsf T})^{-1}[\omega]'$.`,
      },
      hints: [t`$\omega'_j = \omega(\mathbf b'_j)$, and $\mathbf b'_j = \sum_i P_{ij}\mathbf b_i$.`],
      teach: t`Covector components are values on basis vectors, so they change with the basis: $[\omega]' = P^{\mathsf T}[\omega]$.`,
      explain: t`$\omega'_j = \omega\big(\sum_i P_{ij}\mathbf b_i\big) = \sum_i P_{ij}\omega_i = (P^{\mathsf T}[\omega])_j$. As a row it reads $\omega' = \omega P$ — the same multiplication.`,
      visual: basesPic([[2, 0], [0, 1]], { w: [1, 1], ks: [-2, -1, 0, 1, 2, 3], caption: 'Doubling b₁: the new b′₁ crosses twice as many of ω’s level lines as the old one did, so ω’s first component doubles.' }),
    }),
    num({
      id: 'cov', difficulty: 2,
      gen(r) {
        const { P, Pi, w, wn } = setup(r), j = r.int(0, 1);
        const viaInv = matvec(Pi, w), viaP = matvec(P, w);
        const errors = [];
        if (Math.abs(viaInv[j] - wn[j]) > 1e-9) errors.push({ value: viaInv[j], feedback: t`That is the vector law, $P^{-1}$. A covector’s components are its values on the new basis vectors: $\omega'_j = \omega(\mathbf b'_j)$.` });
        if (Math.abs(viaP[j] - wn[j]) > 1e-9 && !errors.some((e) => e.value === viaP[j])) errors.push({ value: viaP[j], feedback: t`That multiplies by $P$ itself, mixing rows instead of columns. $\omega'_j$ pairs $\omega$ with column $j$ of $P$: use $P^{\mathsf T}$.` });
        return {
          prompt: t`The new basis is the columns of $P = ${matTeX(P)}$. A covector has old components $[\omega] = ${tupleTeX(w)}$. Find its ${ORD[j]} new component $\omega'_${j + 1}$.`,
          answer: wn[j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$\omega'_${j + 1} = \omega(\mathbf b'_${j + 1})$, and $\mathbf b'_${j + 1}$ is column ${j + 1} of $P$.`, t`$\omega'_${j + 1} = ${rowTeX(w)}${colTeX(P.map((row) => row[j]))}$.`],
          teach: t`$[\omega]' = P^{\mathsf T}[\omega]$: each new component is $\omega$ applied to a new basis vector.`,
          explain: t`$\omega'_${j + 1} = ${w[0]}\cdot(${P[0][j]}) + ${w[1] < 0 ? `(${w[1]})` : w[1]}\cdot(${P[1][j]}) = ${wn[j]}$; all together $[\omega]' = P^{\mathsf T}[\omega] = ${tupleTeX(wn)}$.`,
          visual: basesPic(P, { w, ks: [-3, -2, -1, 0, 1, 2, 3], levelLabels: false, caption: 'Old basis (grey), new basis (bold), and the level lines of ω (violet, one unit apart). ω′ⱼ counts the level lines b′ⱼ crosses.' }),
        };
      },
    }),
    num({
      id: 'vec', difficulty: 2,
      gen(r) {
        const { P, x, xn, PT } = setup(r), j = r.int(0, 1);
        const viaT = matvec(PT, x), viaP = matvec(P, x), errors = [];
        if (Math.abs(viaT[j] - xn[j]) > 1e-9) errors.push({ value: viaT[j], feedback: t`That is the covector law, $P^{\mathsf T}$. A vector’s components move against the basis: $P^{-1}$.` });
        if (Math.abs(viaP[j] - xn[j]) > 1e-9 && !errors.some((e) => e.value === viaP[j])) errors.push({ value: viaP[j], feedback: t`$P$ turns *new* components into old ones: $[\mathbf x] = P[\mathbf x]'$. Undo it with $P^{-1}$.` });
        return {
          prompt: t`The new basis is the columns of $P = ${matTeX(P)}$. A vector has old components $[\mathbf x] = ${tupleTeX(x)}$. Find its ${ORD[j]} new component.`,
          answer: xn[j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$[\mathbf x] = P[\mathbf x]'$ — the new components recombine the new basis vectors into $\mathbf x$.`, t`$\det P = ${P[0][0] * P[1][1] - P[0][1] * P[1][0]}$, so $P^{-1} = ${matTeX(round(inverse(P)))}$.`],
          teach: t`$[\mathbf x]' = P^{-1}[\mathbf x]$: vector components move against the basis.`,
          explain: t`$[\mathbf x]' = P^{-1}${colTeX(x)} = ${colTeX(xn)}$. Check: $${xn[0]}\,\mathbf b'_1 + (${xn[1]})\,\mathbf b'_2 = ${tupleTeX(matvec(P, xn))}$. ✓`,
          visual: basesPic(P, { x, caption: 'Old basis (grey), new basis (bold) and the vector x (gold).' }),
        };
      },
    }),
    num({
      id: 'pairing', difficulty: 2,
      gen(r) {
        const { P, x, w, wn, xn } = setup(r);
        const ans = dot(w, x), slip = dot(wn, x);
        return {
          prompt: t`The new basis is the columns of $P = ${matTeX(P)}$. A covector is given by its **new** components, $[\omega]' = ${tupleTeX(wn)}$, and a vector by its **old** components, $[\mathbf x] = ${tupleTeX(x)}$. Find the number $\omega(\mathbf x)$.`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: Math.abs(slip - ans) > 1e-9 ? [{ value: slip, feedback: t`That pairs components from two different bases. Bring both to the same basis first — e.g. $[\mathbf x]' = P^{-1}[\mathbf x]$.` }] : [],
          hints: [t`Pair components from the same basis: find $[\mathbf x]' = P^{-1}[\mathbf x]$, or find $[\omega] = (P^{\mathsf T})^{-1}[\omega]'$.`, t`$[\mathbf x]' = ${tupleTeX(xn)}$.`],
          teach: 'The pairing ω(x) is basis-independent, but you may only multiply components that belong to the same basis.',
          explain: t`$[\mathbf x]' = ${tupleTeX(xn)}$, so $\omega(\mathbf x) = ${wn[0]}\cdot${xn[0] < 0 ? `(${xn[0]})` : xn[0]} + ${wn[1] < 0 ? `(${wn[1]})` : wn[1]}\cdot${xn[1] < 0 ? `(${xn[1]})` : xn[1]} = ${ans}$. In the old basis, $[\omega] = ${tupleTeX(w)}$ and $${tupleTeX(w)}\cdot${tupleTeX(x)} = ${ans}$ — the same, as it must be. In index notation, this is why you may only contract an upper index with a lower one.`,
          visual: basesPic(P, { x, w, ks: [-3, -2, -1, 0, 1, 2, 3], levelLabels: false, caption: 'The vector x (gold) and the level lines of ω (violet, one unit apart): ω(x) counts the lines x crosses, in any basis.' }),
        };
      },
    }),
    match({
      id: 'four-laws', difficulty: 2,
      prompt: t`The new basis vectors are the columns of $P$. Match each object to how its numbers change.`,
      left: [t`the components $[\mathbf x]$ of a vector`, t`the components $[\omega]$ of a covector, as a column`, t`the matrix $A$ of a linear map $V \to V$`, t`the matrix $B$ of a bilinear form $V \times V \to \mathbb R$`],
      right: ['P⁻¹ x', 'Pᵀ ω', 'P⁻¹ A P', 'Pᵀ B P', 'P x', 'P A P⁻¹'],
      answer: [0, 1, 2, 3],
      hints: [t`One factor per slot: each vector the object *eats* brings a $P$ (input converted from new to old coordinates); each vector it *returns* brings a $P^{-1}$ (output converted back).`, t`A bilinear form eats two vectors and returns a number: $P$ on both sides, the left one transposed.`],
      teach: t`Each input slot contributes a $P$, each output vector a $P^{-1}$: vectors $P^{-1}$, covectors $P^{\mathsf T}$, operators $P^{-1}AP$, bilinear forms $P^{\mathsf T}BP$.`,
      explain: t`A covector eats one vector: $P^{\mathsf T}$. An operator eats a vector and returns one: $P^{-1}AP$ (similarity, LA-7.3). A bilinear form eats two: $B(\mathbf u, \mathbf v) = [\mathbf u]^{\mathsf T}B[\mathbf v] = [\mathbf u]'^{\mathsf T}(P^{\mathsf T}BP)[\mathbf v]'$ (congruence, LA-14.3). The distractors $P\mathbf x$ and $PAP^{-1}$ are the laws for going from new back to old.`,
    }),
    mcq({
      id: 'rotation', difficulty: 2,
      prompt: t`The new basis is the old orthonormal one turned through $30^\circ$, so $P$ is a rotation matrix. How do vector components and covector components transform now?`,
      choices: [
        t`Identically: $P^{\mathsf T} = P^{-1}$ for a rotation, so both laws are the same`,
        t`Oppositely: vectors by $P^{-1}$, covectors by $P^{\mathsf T}$, and these differ`,
        t`Covector components do not change under a rotation`,
        t`Vector components do not change under a rotation`,
      ],
      answer: 0,
      why: {
        1: t`For a rotation $P^{\mathsf T}P = I$, so $P^{\mathsf T}$ *is* $P^{-1}$: the two laws coincide.`,
        2: t`A covector’s components are its values on the basis vectors, and the turned basis vectors give different values: they turn by $-30^\circ$ too.`,
        3: t`The arrow stays, but its components in the turned basis are the old ones turned by $-30^\circ$ (LA-7.2).`,
      },
      hints: [t`For a rotation matrix, what is $P^{\mathsf T}P$?`],
      teach: 'Between orthonormal bases the two laws agree — which is why Cartesian vector calculus never has to tell vectors from covectors.',
      explain: t`An orthogonal $P$ has $P^{\mathsf T} = P^{-1}$, so a gradient and a velocity transform alike under rotations. The difference appears as soon as a basis is stretched or skewed — scaled engineering drawings, crystal lattices, curvilinear coordinates — and in relativity, where the boosts of the Lorentz group are not orthogonal matrices.`,
      visual: basesPic([[Math.cos(30 * DEG), -Math.sin(30 * DEG)], [Math.sin(30 * DEG), Math.cos(30 * DEG)]], { w: [1, 0.5], x: [1.6, 0.8], ks: [-2, -1, 0, 1, 2], levelLabels: false, caption: 'An orthonormal basis turned by 30° (bold), a vector x (gold) and a covector’s level lines (violet).' }),
    }),
    num({
      id: 'dual-new', difficulty: 3,
      gen(r) {
        const { P, Pi } = setup(r), i = r.int(0, 1), j = r.int(0, 1);
        const errors = [];
        if (Math.abs(P[j][i] - Pi[i][j]) > 1e-9) errors.push({ value: P[j][i], feedback: t`That transforms the dual basis like covector components, with $P^{\mathsf T}$. The dual basis must satisfy $\mathbf e'^i(\mathbf b'_j) = \delta^i_j$, which needs the rows of $P^{-1}$.` });
        if (Math.abs(Pi[j][i] - Pi[i][j]) > 1e-9 && !errors.some((e) => e.value === Pi[j][i])) errors.push({ value: Pi[j][i], feedback: t`That reads a column of $P^{-1}$. The new dual covectors are its **rows**.` });
        return {
          prompt: t`The new basis is the columns of $P = ${matTeX(P)}$ in terms of the old basis $\mathbf b_1, \mathbf b_2$, whose dual basis is $\mathbf e^1, \mathbf e^2$. The new dual basis is $\mathbf e'^1, \mathbf e'^2$. Write $\mathbf e'^${i + 1} = a\,\mathbf e^1 + b\,\mathbf e^2$. Find ${j ? '$b$' : '$a$'}.`,
          answer: Pi[i][j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$\mathbf e'^${i + 1}$ must give 1 on $\mathbf b'_${i + 1}$ and 0 on the other new basis vector; in old components it is a row $[a\ b]$ with $[a\ b]\,P$ equal to row ${i + 1} of $I$.`, t`So $[a\ b]$ is row ${i + 1} of $P^{-1} = ${matTeX(Pi)}$.`],
          teach: t`When the basis changes by $P$, the dual basis changes by $P^{-1}$: its new members are the rows of $P^{-1}$, in old dual components.`,
          explain: t`$\mathbf e'^${i + 1} = ${Pi[i][0]}\,\mathbf e^1 + (${Pi[i][1]})\,\mathbf e^2$. The four laws side by side: basis vectors with $P$, vector components with $P^{-1}$, dual basis with $P^{-1}$, covector components with $P^{\mathsf T}$. Each object and its components move oppositely, so the object — $x^i\mathbf b_i$ or $\omega_i\mathbf e^i$ — stays put.`,
          visual: basesPic(P, { w: Pi[i], ks: [-2, -1, 0, 1, 2], wName: `e′${'¹²'[i]}`, levelLabels: false, caption: `Old basis (grey), new basis (bold), and the level lines of the new dual covector e′${'¹²'[i]} (violet): it vanishes along b′${'₂₁'[i]} and equals 1 at the tip of b′${'₁₂'[i]}.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cov', difficulty: 2,
      gen(r) {
        const { P, w, wn } = setup(r), j = r.int(0, 1);
        return {
          prompt: t`The new basis is the columns of $P = ${matTeX(P)}$. A covector has old components $[\omega] = ${tupleTeX(w)}$. Find $\omega'_${j + 1}$.`,
          answer: wn[j], tol: { rel: 0, abs: 0.01 },
          hints: [t`$[\omega]' = P^{\mathsf T}[\omega]$.`],
          teach: t`Covector components change by $P^{\mathsf T}$.`,
          explain: t`$[\omega]' = P^{\mathsf T}[\omega] = ${tupleTeX(wn)}$.`,
          visual: basesPic(P, { w, ks: [-3, -2, -1, 0, 1, 2, 3], levelLabels: false }),
        };
      },
    }),
    num({
      id: 'cp-vec', difficulty: 2,
      gen(r) {
        const { P, x, xn } = setup(r), j = r.int(0, 1);
        return {
          prompt: t`The new basis is the columns of $P = ${matTeX(P)}$. A vector has old components $[\mathbf x] = ${tupleTeX(x)}$. Find its ${ORD[j]} new component.`,
          answer: xn[j], tol: { rel: 0, abs: 0.01 },
          hints: [t`$[\mathbf x]' = P^{-1}[\mathbf x]$.`],
          teach: t`Vector components change by $P^{-1}$.`,
          explain: t`$[\mathbf x]' = P^{-1}[\mathbf x] = ${tupleTeX(xn)}$.`,
          visual: basesPic(P, { x }),
        };
      },
    }),
    num({
      id: 'cp-thrusters', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([15, 20, 25, 30, 35]), g = [r.pick([-4, -3, -2, 2, 3, 4]), r.pick([-5, -3, -2, 2, 3, 5])];
        const c = Math.cos(th * DEG), s = Math.sin(th * DEG), P = [[c, c], [s, -s]];
        const ans = g[0] * c - g[1] * s, viaInv = matvec(inverse(P), g)[1];
        return {
          prompt: t`A spacecraft makes a final correction burn with two thrusters canted $\pm${th}^\circ$ from its $x$-axis: thruster 1 pushes along $\mathbf d_1 = (\cos ${th}^\circ, \sin ${th}^\circ)$ and thruster 2 along $\mathbf d_2 = (\cos ${th}^\circ, -\sin ${th}^\circ)$. A burn is described in the thruster basis by $\mathbf u = (u_1, u_2)$, the velocity change each thruster delivers, so $\Delta\mathbf v = P\mathbf u$ with $P = [\,\mathbf d_1\ \mathbf d_2\,]$. Navigation predicts that the miss distance at the target is a linear functional of the burn, $\delta = ${g[0]}\,\Delta v_x ${g[1] < 0 ? '-' : '+'} ${Math.abs(g[1])}\,\Delta v_y$ (km per m/s). How many km of miss distance does 1 m/s from **thruster 2** produce — the component $\delta_2$ of this covector in the thruster basis?`,
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: viaInv, feedback: t`That uses the vector law $P^{-1}$. A sensitivity is a covector: its component on thruster 2 is its value on that thruster’s direction, $\delta(\mathbf d_2)$ — the $P^{\mathsf T}$ law.` }, { value: g[0] * c + g[1] * s, feedback: t`That is $\delta(\mathbf d_1)$, thruster 1’s sensitivity. Thruster 2 points along $(\cos ${th}^\circ, -\sin ${th}^\circ)$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\delta_2 = \delta(\mathbf d_2)$: feed thruster 2’s direction to the functional. That is the second entry of $P^{\mathsf T}[\delta]$.`, t`$\delta_2 = ${g[0]}\cos ${th}^\circ ${g[1] < 0 ? '+' : '-'} ${Math.abs(g[1])}\sin ${th}^\circ$.`],
          teach: t`Sensitivities (gradients) of a linear quantity are covectors: re-expressed in a new set of control directions, they transform with $P^{\mathsf T}$ — by evaluating them on the new directions.`,
          explain: t`$\delta_2 = ${g[0]}\times${nice(c, 4)} ${g[1] < 0 ? '+' : '-'} ${Math.abs(g[1])}\times${nice(s, 4)} = ${nice(ans, 4)}$ km per m/s. To *achieve* a required $\Delta\mathbf v$ you would use the vector law instead, $\mathbf u = P^{-1}\Delta\mathbf v$; to know how each thruster’s error moves the target, the covector law $P^{\mathsf T}$. Guidance software uses both on every burn.`,
          visual: basesPic(P, { w: g, ks: [-2, -1, 0, 1, 2], names: ['d₁', 'd₂'], oldNames: ['x', 'y'], wName: 'δ', levelLabels: false, view: 1.25, caption: 'Thruster directions d₁, d₂ (bold) and the level lines of the miss-distance functional δ, one km apart (violet). Directions true; sizes schematic.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'Axler, Linear Algebra Done Right (4th ed.), §3F Duality: the dual map', url: 'https://linear.axler.net/' },
    { label: 'Carroll, Spacetime and Geometry, §1.6–1.7 (dual vectors and their transformation)', url: 'https://doi.org/10.1017/9781108770385' },
  ],
});
