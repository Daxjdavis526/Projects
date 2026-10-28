// Symmetric and antisymmetric parts: T = T_(μν) + T_[μν], a split that holds
// in every basis; n(n+1)/2 and n(n−1)/2 components; S^{μν}A_{μν} = 0; and the
// electromagnetic field tensor F_μν as the antisymmetric example.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { legs, grid } from './_ten.js';
import { form, matTeX, vecTeX, bil, symPart, antiPart, fr, AXES_NOTE } from './_metric.js';

const t = String.raw;
const sub = ['₀', '₁', '₂', '₃'];
// F_μν with F_0i = −E_i, F_12 = B_z, F_13 = −B_y, F_23 = B_x (c = 1; Carroll eq. 1.69)
const Fmat = ([Ex, Ey, Ez], [Bx, By, Bz]) => [[0, -Ex, -Ey, -Ez], [Ex, 0, Bz, -By], [Ey, -Bz, 0, Bx], [Ez, By, -Bx, 0]];
const F_SYMBOLIC = [['0', '−E₁', '−E₂', '−E₃'], ['E₁', '0', 'B₃', '−B₂'], ['E₂', '−B₃', '0', 'B₁'], ['E₃', 'B₂', '−B₁', '0']];
const fGrid = (caption, hl = []) => grid(F_SYMBOLIC, { hl, rowNames: ['μ=0', 'μ=1', 'μ=2', 'μ=3'], colNames: ['ν=0', 'ν=1', 'ν=2', 'ν=3'], dx: 1.25, caption });
const rand3 = (r) => [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-4, 5)));

export default lesson({
  id: 'st-a.A5.5',
  title: 'Symmetric and antisymmetric parts',
  minutes: 11, difficulty: 3,
  intro: t`Swap the two slots of a (0,2) tensor and you get another tensor, $T_{\nu\mu}$. Half their sum and half their difference split $T$ uniquely into a **symmetric** part, unchanged by the swap, and an **antisymmetric** part, which changes sign:

$$T_{\mu\nu} = \underbrace{\tfrac12\left(T_{\mu\nu} + T_{\nu\mu}\right)}_{T_{(\mu\nu)}} + \underbrace{\tfrac12\left(T_{\mu\nu} - T_{\nu\mu}\right)}_{T_{[\mu\nu]}}$$

The split does not depend on the basis: a tensor symmetric in one basis is symmetric in all, because the transformation law treats the two slots alike. In $n$ dimensions a symmetric tensor has $n(n+1)/2$ independent components and an antisymmetric one $n(n-1)/2$ — in spacetime **10** and **6**. The metric is symmetric: 10 numbers. The **electromagnetic field tensor** $F_{\mu\nu}$ is antisymmetric: its 6 numbers are the three components of $\mathbf E$ and the three of $\mathbf B$, one object instead of two. Two consequences carry far: an antisymmetric tensor gives zero on a repeated vector, $A(\mathbf U, \mathbf U) = 0$; and a symmetric tensor fully contracted with an antisymmetric one gives zero, $S^{\mu\nu}A_{\mu\nu} = 0$.`,
  symbols: [
    { tex: t`T_{(\mu\nu)}`, text: t`the symmetric part, $\tfrac12(T_{\mu\nu} + T_{\nu\mu})$ (the round brackets carry the $\tfrac12$ in this course; some books omit it)` },
    { tex: t`T_{[\mu\nu]}`, text: t`the antisymmetric part, $\tfrac12(T_{\mu\nu} - T_{\nu\mu})$: zero on the diagonal` },
    { tex: t`F_{\mu\nu}`, text: t`the electromagnetic field tensor: $F_{0i} = -E_i$, $F_{12} = B_z$, $F_{13} = -B_y$, $F_{23} = B_x$, with $c = 1$` },
    { tex: t`S^{\mu\nu}A_{\mu\nu}`, text: 'a symmetric tensor contracted on both indices with an antisymmetric one: always zero' },
  ],
  why: t`Symmetry cuts the work: the metric and the stress–energy tensor have 10 components rather than 16, Einstein’s equations are 10 equations, and the 6 components of $F_{\mu\nu}$ are why electric and magnetic fields turn into each other under a boost.`,
  visual: {
    type: 'ten-metric',
    title: 'Two parts of one machine',
    lead: t`Set the four components $T_{\mu\nu}$ and drag the arrows. The readout splits $T$ into its symmetric and antisymmetric parts and gives $T(\mathbf U, \mathbf V)$ both ways round, and $T(\mathbf U, \mathbf U)$.`,
    tasks: [
      t`Make $T$ antisymmetric ($T_{11} = T_{22} = 0$, $T_{21} = -T_{12}$): the teal lines run parallel to $\mathbf U$, so $\mathbf U$ crosses none of its own lines — $T(\mathbf U, \mathbf U) = 0$.`,
      t`Change $T_{12}$ and $T_{21}$ while keeping their sum fixed: $T(\mathbf U, \mathbf U)$ does not move — it sees only the symmetric part.`,
      t`Check that $T(\mathbf U, \mathbf V) - T(\mathbf V, \mathbf U) = 2\,T_{[\mu\nu]}U^\mu V^\nu$ for any arrows.`,
    ],
    params: { mode: 'form', T: [[1, 1.5], [-0.5, 0.5]], sliders: 'full', U: [1.2, 0.5], V: [0.4, 1.4], readout: ['parts', 'TUV', 'TVU', 'UU'] },
    caption: t`The teal lines are $T(\mathbf U, \cdot\,)$; the bold ones are those $\mathbf V$ crosses. ${AXES_NOTE}`,
  },
  example: {
    prompt: t`In a region of an ion thruster’s channel, with $c = 1$, the fields are $\mathbf E = (0, 3, 0)$ and $\mathbf B = (0, 0, 2)$ (in matching units). Build $F_{\mu\nu}$, check that it is antisymmetric, count its independent components, and show that $F_{\mu\nu}u^\mu u^\nu = 0$ for the four-velocity $u^\mu = (1.25, 0.75, 0, 0)$.`,
    visual: fGrid(t`The pattern of $F_{\mu\nu}$ (rows $\mu$, columns $\nu$): $\mathbf E$ in the time row and column, $\mathbf B$ in the space block. Entries across the diagonal are negatives of each other.`),
    steps: [
      { label: 'Fill the array', text: t`$F_{0i} = -E_i$ and $F_{i0} = E_i$; $F_{12} = B_z = 2$, $F_{21} = -2$; everything else is zero: $F_{\mu\nu} = ${matTeX(Fmat([0, 3, 0], [0, 0, 2]))}$.` },
      { label: 'Antisymmetric', text: t`Every entry has its negative across the diagonal and the diagonal is zero: $F_{\nu\mu} = -F_{\mu\nu}$, so $F$ is its own antisymmetric part and its symmetric part is zero.` },
      { label: 'Count', text: t`Choosing the entries above the diagonal fixes everything: $4\cdot3/2 = 6$ numbers, exactly $E_x, E_y, E_z, B_x, B_y, B_z$.` },
      { label: 'A repeated vector', text: t`$F_{\mu\nu}u^\mu u^\nu$ pairs each term $F_{\mu\nu}u^\mu u^\nu$ with $F_{\nu\mu}u^\nu u^\mu = -F_{\mu\nu}u^\mu u^\nu$. Here only $u^0u^1$ survives: $(F_{01} + F_{10})\,u^0u^1 = (0 + 0)(1.25)(0.75) = 0$. ✓` },
      { label: 'Meaning', text: t`The Lorentz four-force is $q\,F^\mu{}_\nu u^\nu$ (index raised with the metric, lesson A6.4). Its pairing with $u$ is $q\,F_{\mu\nu}u^\mu u^\nu = 0$: the force changes a particle’s energy and momentum but never its rest mass.` },
    ],
    answer: t`$F_{\mu\nu} = ${matTeX(Fmat([0, 3, 0], [0, 0, 2]))}$ — antisymmetric, 6 independent components, and $F_{\mu\nu}u^\mu u^\nu = 0$ for every $u$.`,
  },
  practice: [
    num({
      id: 'parts', difficulty: 1,
      gen(r) {
        let T, i, j;
        do { T = rand3(r); i = r.int(1, 3); j = r.intExcept(1, 3, [i]); } while (T[i - 1][j - 1] === T[j - 1][i - 1] || T[i - 1][j - 1] === -T[j - 1][i - 1]);
        const which = r.pick(['sym', 'anti']);
        const ans = which === 'sym' ? (T[i - 1][j - 1] + T[j - 1][i - 1]) / 2 : (T[i - 1][j - 1] - T[j - 1][i - 1]) / 2;
        return {
          prompt: t`$T_{\mu\nu} = ${matTeX(T)}$. Find ${which === 'sym' ? t`$T_{(${i}${j})}$` : t`$T_{[${i}${j}]}$`}.`,
          visual: grid(T, { hl: [[i - 1, j - 1], [j - 1, i - 1]], rowNames: ['μ=1', 'μ=2', 'μ=3'], colNames: ['ν=1', 'ν=2', 'ν=3'], dx: 1.3, caption: t`The two entries that take part, mirror images across the diagonal.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`The brackets carry a factor $\tfrac12$ in this course.` }, { value: which === 'sym' ? (T[i - 1][j - 1] - T[j - 1][i - 1]) / 2 : (T[i - 1][j - 1] + T[j - 1][i - 1]) / 2, feedback: 'Round brackets add, square brackets subtract.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [which === 'sym' ? t`$T_{(${i}${j})} = \tfrac12(T_{${i}${j}} + T_{${j}${i}})$.` : t`$T_{[${i}${j}]} = \tfrac12(T_{${i}${j}} - T_{${j}${i}})$.`],
          teach: 'Round brackets: half the sum with the swapped indices; square brackets: half the difference.',
          explain: t`$\tfrac12(${T[i - 1][j - 1]} ${which === 'sym' ? '+' : '-'} (${T[j - 1][i - 1]})) = ${fr(ans)}$.`,
        };
      },
    }),
    num({
      id: 'count', difficulty: 1,
      gen(r) {
        const n = r.pick([3, 4, 5, 10]), which = r.pick(['sym', 'anti']);
        const ans = which === 'sym' ? (n * (n + 1)) / 2 : (n * (n - 1)) / 2;
        return {
          prompt: t`How many independent components does ${which === 'sym' ? 'a symmetric' : 'an antisymmetric'} (0,2) tensor have in ${n} dimensions?${n === 10 ? ' (Ten dimensions, as in superstring theory.)' : ''}`,
          visual: grid(Array.from({ length: Math.min(n, 5) }, (_, a) => Array.from({ length: Math.min(n, 5) }, (_, b) => (b > a ? '•' : b === a ? (which === 'sym' ? '•' : '0') : '·'))), { caption: t`${n > 5 ? 'The first 5 rows and columns: ' : ''}the entries you are free to choose (•): ${which === 'sym' ? 'the diagonal and above it' : 'strictly above the diagonal'}. The rest follow by ${which === 'sym' ? 'symmetry' : 'antisymmetry'}.` }),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n * n, feedback: 'That counts every entry; the swap relates entries in pairs.' }, { value: which === 'sym' ? (n * (n - 1)) / 2 : (n * (n + 1)) / 2, feedback: which === 'sym' ? 'The diagonal of a symmetric tensor is free too.' : 'An antisymmetric diagonal is forced to zero: T₁₁ = −T₁₁.' }],
          hints: [t`Count the entries ${which === 'sym' ? 'on and above' : 'strictly above'} the diagonal.`],
          teach: t`Symmetric: $n(n+1)/2$ components; antisymmetric: $n(n-1)/2$; together $n^2$.`,
          explain: t`$${n}\cdot${which === 'sym' ? n + 1 : n - 1}/2 = ${ans}$.`,
        };
      },
    }),
    num({
      id: 'kill', difficulty: 2,
      gen(r) {
        let S, T, ans;
        do {
          const a = r.int(-2, 3), b = r.int(-2, 2), d = r.int(-2, 3);
          S = [[a, b], [b, d]]; T = [[r.int(-3, 3), r.int(-4, 4)], [r.int(-4, 4), r.int(-3, 3)]];
          ans = S[0][0] * T[0][0] + S[0][1] * (T[0][1] + T[1][0]) + S[1][1] * T[1][1];
        } while (ans === 0 || T[0][1] === T[1][0] || S[0][1] === 0);
        const naive = S[0][0] * T[0][0] + 2 * S[0][1] * T[0][1] + S[1][1] * T[1][1];
        return {
          prompt: t`$S^{\mu\nu} = ${matTeX(S)}$ is symmetric and $T_{\mu\nu} = ${matTeX(T)}$ is not. Find the full contraction $S^{\mu\nu}T_{\mu\nu}$.`,
          visual: legs([{ name: 'S', up: [] }, { name: 'T' }], { links: [{ a: 0, b: 1, index: 'μ' }, { a: 0, b: 1, index: 'ν', arc: true }], caption: t`Both indices summed: a number. Only $T$’s symmetric part can contribute.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: naive !== ans ? [{ value: naive, feedback: t`You used $T_{12}$ twice. The terms are $S^{12}T_{12} + S^{21}T_{21}$, and $T_{21} \ne T_{12}$.` }] : [],
          hints: [t`Four terms: $S^{11}T_{11} + S^{12}T_{12} + S^{21}T_{21} + S^{22}T_{22}$.`, t`Shortcut: $S^{\mu\nu}T_{\mu\nu} = S^{\mu\nu}T_{(\mu\nu)}$, and $T_{(12)} = ${fr((T[0][1] + T[1][0]) / 2)}$.`],
          teach: t`A symmetric tensor contracted with any $T_{\mu\nu}$ sees only $T_{(\mu\nu)}$: $S^{\mu\nu}T_{[\mu\nu]} = 0$.`,
          explain: t`$${S[0][0]}\cdot${T[0][0]} + ${S[0][1]}\,(${T[0][1]} + ${T[1][0]}) + ${S[1][1]}\cdot${T[1][1]} = ${ans}$. The antisymmetric part, $T_{[12]} = ${fr((T[0][1] - T[1][0]) / 2)}$, dropped out.`,
        };
      },
    }),
    num({
      id: 'f-entry', difficulty: 2,
      gen(r) {
        const E = [r.intExcept(-4, 4, [0]), r.int(-4, 4), r.int(-4, 4)], B = [r.int(-3, 3), r.intExcept(-3, 3, [0]), r.int(-3, 3)];
        const F = Fmat(E, B);
        const cand = [];
        for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) if (m !== n && F[m][n] !== 0) cand.push([m, n]);
        const [m, n] = r.pick(cand);
        const ans = F[m][n];
        return {
          prompt: t`With $c = 1$, $\mathbf E = ${vecTeX(E)}$ and $\mathbf B = ${vecTeX(B)}$. Using $F_{0i} = -E_i$, $F_{12} = B_z$, $F_{13} = -B_y$, $F_{23} = B_x$ and antisymmetry, find $F_{${m}${n}}$.`,
          visual: fGrid(t`The pattern of $F_{\mu\nu}$; the ringed entry is the one asked for.`, [[m, n]]),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: t`Sign: below the diagonal, $F_{\nu\mu} = -F_{\mu\nu}$.` }],
          hints: [t`If the index pair is not one of those listed, swap it and change the sign.`],
          teach: t`$F_{\mu\nu}$ holds $-\mathbf E$ in its time row, $\mathbf E$ in its time column and $\mathbf B$ in the space block; antisymmetry fills in the rest.`,
          explain: t`From the pattern, $F_{${m}${n}} = ${F_SYMBOLIC[m][n].replace('−', '-').replace(/([EB])([₁₂₃])/, (_, L, s) => `${L}_${'₁₂₃'.indexOf(s) + 1}`)} = ${ans}$ (with $E_1 = E_x$, $B_3 = B_z$ and so on).`,
        };
      },
    }),
    mcq({
      id: 'basis-free', difficulty: 2,
      prompt: t`A (0,2) tensor is symmetric in one basis, $T_{\mu\nu} = T_{\nu\mu}$. What about another basis?`,
      visual: legs([{ name: 'A', down: ['μ'] }, { name: 'T' }, { name: 'A', down: ['ν'] }], { links: [{ a: 0, b: 1, index: 'α' }, { a: 1, b: 2, index: 'β' }], caption: t`$T'_{\mu\nu} = A^\alpha{}_\mu A^\beta{}_\nu T_{\alpha\beta}$: the two slots are transformed by the same matrix.` }),
      choices: [t`It is symmetric there too: swapping $\mu$ and $\nu$ in $A^\alpha{}_\mu A^\beta{}_\nu T_{\alpha\beta}$ and relabelling $\alpha \leftrightarrow \beta$ gives the same sum`, 'Only if the new basis is perpendicular and unit', 'Only for rotations', 'Not in general: symmetry is a property of the array, not the tensor'],
      answer: 0,
      why: {
        1: 'The proof never used lengths or angles: any invertible change of basis keeps symmetry.',
        2: 'Rotations are not special here — shears and stretches keep symmetry as well.',
        3: t`Symmetry means $T(\mathbf U, \mathbf V) = T(\mathbf V, \mathbf U)$ for all arrows — a statement with no basis in it.`,
      },
      hints: [t`Symmetry can be stated without components: $T(\mathbf U, \mathbf V) = T(\mathbf V, \mathbf U)$.`],
      teach: 'Symmetry and antisymmetry are properties of the tensor, so they hold in every basis.',
      explain: t`$T(\mathbf U, \mathbf V) = T(\mathbf V, \mathbf U)$ for every pair of arrows, the new basis arrows included, so $T'_{\mu\nu} = T(\mathbf e'_\mu, \mathbf e'_\nu) = T(\mathbf e'_\nu, \mathbf e'_\mu) = T'_{\nu\mu}$.`,
    }),
    num({
      id: 'area', difficulty: 2,
      gen(r) {
        let a, U, V, ans;
        do { a = r.pick([1, 2, 3, -1]); U = [r.intExcept(-2, 2, [0]), r.int(-2, 2)]; V = [r.int(-2, 2), r.intExcept(-2, 2, [0])]; ans = a * (U[0] * V[1] - U[1] * V[0]); } while (ans === 0);
        const A = [[0, a], [-a, 0]];
        return {
          prompt: t`An antisymmetric tensor in two dimensions has $A_{12} = ${a}$ (so $A_{21} = ${-a}$). Find $A(\mathbf U, \mathbf V)$ for $U^\mu = ${vecTeX(U)}$ and $V^\nu = ${vecTeX(V)}$.`,
          visual: form({ T: A, U: U.map((x) => x * 0.7), V: V.map((x) => x * 0.7), view: 2 }, t`$A(\mathbf U, \cdot\,)$: its lines run parallel to $\mathbf U$ itself (arrows at 0.7 scale). ${AXES_NOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: -ans, feedback: t`That is $A(\mathbf V, \mathbf U)$: swapping the arrows flips the sign.` }],
          hints: [t`Only the off-diagonal terms survive: $A_{12}U^1V^2 + A_{21}U^2V^1 = ${a}\,(U^1V^2 - U^2V^1)$.`],
          teach: t`In two dimensions every antisymmetric (0,2) tensor is a multiple of the signed area $U^1V^2 - U^2V^1$ of the parallelogram on $\mathbf U$ and $\mathbf V$.`,
          explain: t`$${a}\,\big((${U[0]})(${V[1]}) - (${U[1]})(${V[0]})\big) = ${ans}$: $${a}$ times the signed area of the parallelogram, in units of the basis parallelogram.`,
        };
      },
    }),
    mcq({
      id: 'split-error', difficulty: 2, kind: 'error',
      prompt: t`A student splits $T = ${matTeX([[1, 2], [0, 3]])}$ into $S = ${matTeX([[1, 1], [1, 3]])}$ and $A = ${matTeX([[0, 2], [-2, 0]])}$. What is wrong?`,
      visual: grid([[1, 2], [0, 3]], { hl: [[0, 1], [1, 0]], rowNames: ['μ=1', 'μ=2'], colNames: ['ν=1', 'ν=2'], dx: 1.3, caption: t`$T_{\mu\nu}$, with the off-diagonal pair ringed.` }),
      choices: [t`$A$ is missing its $\tfrac12$: $A = ${matTeX([[0, 1], [-1, 0]])}$, so that $S + A = T$`, t`$S$ should be $${matTeX([[1, 2], [2, 3]])}$`, 'Nothing: S is symmetric and A antisymmetric', 'A tensor with a zero entry cannot be split'],
      answer: 0,
      why: {
        1: t`Then $S + A$ would not give back $T$ either; $S_{12} = \tfrac12(2 + 0) = 1$ was right.`,
        2: t`Each part has the right symmetry, but $S + A = ${matTeX([[1, 3], [-1, 3]])} \ne T$.`,
        3: 'Every (0,2) tensor splits, zeros and all.',
      },
      hints: [t`Add the student’s $S$ and $A$. Do you get $T$ back?`],
      teach: t`Check a split by adding the parts back: $T_{(\mu\nu)} + T_{[\mu\nu]} = T_{\mu\nu}$.`,
      explain: t`$A_{12} = \tfrac12(T_{12} - T_{21}) = \tfrac12(2 - 0) = 1$. With $A = ${matTeX([[0, 1], [-1, 0]])}$, $S + A = T$. ✓`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-anti', difficulty: 2,
      gen(r) {
        let T, i, j;
        do { T = rand3(r); i = r.int(1, 3); j = r.intExcept(1, 3, [i]); } while (T[i - 1][j - 1] === T[j - 1][i - 1]);
        const ans = (T[i - 1][j - 1] - T[j - 1][i - 1]) / 2;
        return {
          prompt: t`For $T_{\mu\nu} = ${matTeX(T)}$, find the antisymmetric component $T_{[${i}${j}]}$.`,
          visual: grid(T, { rowNames: ['μ=1', 'μ=2', 'μ=3'], colNames: ['ν=1', 'ν=2', 'ν=3'], dx: 1.3, caption: t`$T_{\mu\nu}$: rows $\mu$, columns $\nu$.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`Half the difference, not the difference.` }, { value: -ans, feedback: t`The order matters: $T_{${i}${j}} - T_{${j}${i}}$.` }],
          hints: [t`$T_{[${i}${j}]} = \tfrac12(T_{${i}${j}} - T_{${j}${i}})$.`],
          teach: 'The antisymmetric part is half the difference of the entry and its mirror image.',
          explain: t`$\tfrac12(${T[i - 1][j - 1]} - (${T[j - 1][i - 1]})) = ${fr(ans)}$.`,
        };
      },
    }),
    num({
      id: 'cp-thruster', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([0.015, 0.02, 0.025]), E = r.pick([1.5e4, 2e4, 3e4]), c = 2.998e8;
        const which = r.pick(['E', 'B']);
        // radial B along x, axial E along z; with x^0 = ct, F_0i = −E_i/c and F_23 = B_x
        return {
          prompt: t`In a Hall-effect thruster the magnetic field across the channel is radial and the accelerating electric field axial. Take, at one point, $\mathbf B = (${B}, 0, 0)$ T and $\mathbf E = (0, 0, ${tex(E, 2)})$ V/m. In SI units with $x^0 = ct$, the field tensor has $F_{0i} = -E_i/c$ and $F_{12} = B_z$, $F_{13} = -B_y$, $F_{23} = B_x$, all in tesla. What is ${which === 'E' ? t`$F_{30}$` : t`$F_{32}$`}, in tesla?`,
          visual: fGrid(t`The pattern of $F_{\mu\nu}$ ($c = 1$ labels); in SI each $E_i$ is divided by $c$.`, which === 'E' ? [[3, 0]] : [[3, 2]]),
          answer: which === 'E' ? E / c : -B, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: which === 'E' ? -E / c : B, feedback: t`That is ${which === 'E' ? t`$F_{03}$` : t`$F_{23}$`}. Swapping the indices of $F$ flips its sign.` }, ...(which === 'E' ? [{ value: E, feedback: t`Divide by $c$: with $x^0 = ct$ the electric entries are $E/c$, in tesla.` }] : [])],
          hints: [t`Find the listed entry with the indices the other way round, then use $F_{\nu\mu} = -F_{\mu\nu}$.`, which === 'E' ? t`$F_{03} = -E_z/c$.` : t`$F_{23} = B_x$.`],
          teach: t`Antisymmetry fills half of $F_{\mu\nu}$: each entry below the diagonal is minus its mirror image.`,
          explain: which === 'E' ? t`$F_{03} = -E_z/c = -${tex(E / c, 3)}$ T, so $F_{30} = +${tex(E / c, 3)}$ T. Next to $B = ${B}$ T, the electric part is small in these units — which is why the thruster’s electrons drift at $E/B = ${tex(E / B, 2)}$ m/s, far below $c$.` : t`$F_{23} = B_x = ${B}$ T, so $F_{32} = -${B}$ T.`,
        };
      },
    }),
    mcq({
      id: 'cp-count', difficulty: 2,
      prompt: t`In four-dimensional spacetime, which statement about the metric $g_{\mu\nu}$ and the field tensor $F_{\mu\nu}$ is right?`,
      visual: fGrid(t`$F_{\mu\nu}$: zero diagonal, mirror entries opposite.`),
      choices: [t`$g_{\mu\nu}$ is symmetric with 10 independent components; $F_{\mu\nu}$ is antisymmetric with 6 — and $g^{\mu\nu}F_{\mu\nu} = 0$`, 'Both have 16 independent components', 'g has 6 and F has 10', 'Both have 10, since both are (0,2) tensors'],
      answer: 0,
      why: {
        1: 'Symmetry relates entries in pairs: 16 is the count with no symmetry at all.',
        2: 'Swapped: symmetric means n(n+1)/2 = 10, antisymmetric n(n−1)/2 = 6.',
        3: 'Type does not decide symmetry; F is antisymmetric, so its diagonal is zero and its pairs are tied.',
      },
      hints: [t`$n(n+1)/2$ and $n(n-1)/2$ with $n = 4$.`],
      teach: 'In spacetime a symmetric (0,2) tensor has 10 components and an antisymmetric one 6; a full contraction of the two vanishes.',
      explain: t`10 + 6 = 16 = $4^2$. And $g^{\mu\nu}F_{\mu\nu} = 0$ because $g^{\mu\nu}$ is symmetric and $F_{\mu\nu}$ antisymmetric.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (symmetrisation; the field strength tensor, eq. 1.69)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Electromagnetic tensor', url: 'https://en.wikipedia.org/wiki/Electromagnetic_tensor' },
    { label: 'Goebel & Katz, Fundamentals of Electric Propulsion (JPL), ch. 7: Hall thrusters', url: 'https://descanso.jpl.nasa.gov/SciTechBook/series1/Goebel__cmprsd_opt.pdf' },
  ],
});
