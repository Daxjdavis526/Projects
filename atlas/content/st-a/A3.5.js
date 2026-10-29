// Why covector components carry lower indices: they transform like the basis
// vectors (with A), vector components and dual basis covectors against them
// (with A⁻¹). Index height records the transformation law, and an up–down
// pair cancels A against A⁻¹.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { nice, frac, tex } from '../../src/core/format.js';
import { still, legs } from './_ten.js';

const t = String.raw;
const SQ = [[1, 0], [0, 1]];
const vecTeX = (a) => `(${a.join(',\\ ')})`;
const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const fr = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : frac(x));
const inv2 = (A) => { const d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; };
const cols = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];
// the wall schematic: isotherms through a liner, a long and a short basis arrow, and the thickness
const WALL = (caption) => ({
  type: 'graph',
  params: {
    x: [-0.4, 6.6], y: [-1.3, 1.5], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
    curves: Array.from({ length: 13 }, (_, k) => ({ param: [String(k * 0.5), 't'], t: [-1.2, 1.4], color: 'teal', width: k % 2 ? 1 : 1.6 })),
    arrows: [
      { from: [0, 1.0], to: [4, 1.0], color: 'ink3', width: 2, label: 'long basis arrow', labelDx: 8, labelDy: 0 },
      { from: [0, 0.35], to: [0.5, 0.35], color: 'accent', width: 3, label: 'short basis arrow', labelDx: 8, labelDy: 0 },
      { from: [0, -0.7], to: [3, -0.7], color: 'gold', width: 3, label: 'liner thickness', labelDx: 8, labelDy: 0 },
    ],
  },
  caption,
});
const CASES = [[[2, 1], [0, 1]], [[1, 1], [0, 2]], [[2, 0], [1, 1]], [[1, -1], [1, 1]], [[3, 1], [1, 1]], [[2, 1], [1, 1]]];

export default lesson({
  id: 'st-a.A3.5',
  title: 'Why covector components carry lower indices',
  minutes: 10, difficulty: 3,
  intro: t`Change basis, $\mathbf e'_j = A^i{}_j\,\mathbf e_i$. A covector’s new components are its values on the new arrows, so they change **exactly like the arrows do**:

$$\omega'_j = \omega(\mathbf e'_j) = A^i{}_j\,\omega_i, \qquad V'^j = (A^{-1})^j{}_i\,V^i$$

while a vector’s components change the opposite way (lesson A2.2). That is the whole meaning of index height: **a lower index transforms with $A$**, like the basis vectors $\mathbf e_j$ — “covariant” — and **an upper index with $A^{-1}$** — “contravariant” — like the components $V^j$ and the dual basis $\mathbf e^j$. In an up–down pair the $A$ and the $A^{-1}$ cancel, which is why $\omega_jV^j$ is the same in every basis and why the summation convention insists on one of each.

Units make it concrete: a temperature gradient of 6.5 K per kilometre is 0.0065 K per metre — make the basis arrow 1000 times **shorter** and the covector component is 1000 times **smaller**, while a displacement’s component is 1000 times **larger**.`,
  symbols: [
    { tex: t`A^i{}_j`, text: t`the change of basis: $\mathbf e'_j = A^i{}_j\,\mathbf e_i$ (column $j$ = the new arrow in old components)` },
    { tex: t`\omega_i,\ \omega'_j`, text: t`covector components, old and new: **lower** index, transform with $A$` },
    { tex: t`V^i,\ V'^j`, text: t`vector components, old and new: **upper** index, transform with $A^{-1}$` },
    { tex: t`(A^{-1})^j{}_i`, text: t`the inverse matrix: $(A^{-1})^j{}_iA^i{}_k = \delta^j_k$` },
  ],
  why: t`When the basis comes from coordinates, $A$ becomes the Jacobian matrix (lesson A4.2), and this pair of laws becomes the definition of a vector and a covector field used throughout general relativity.`,
  visual: {
    type: 'ten-basis',
    title: 'With the basis, and against it',
    lead: t`The old basis is faint; drag the bold new one. The readout lists the covector’s components and the vector’s, old and new, with the matrix $A$ and its inverse: the new $\omega'_j$ follow the basis ($A$), the new $V'^j$ go against it ($A^{-1}$), and the pairing does not move.`,
    tasks: [
      t`Drag $\mathbf e'_1$ to twice the length of $\mathbf e_1$: $\omega'_1$ doubles (with the basis), $V'^1$ halves (against it).`,
      t`Check a column: $\omega'_1 = A^1{}_1\omega_1 + A^2{}_1\omega_2$ — the first column of $A$, the same numbers that build $\mathbf e'_1$.`,
      t`However you drag, $\omega'_jV'^j$ equals $\omega_iV^i$.`,
    ],
    params: { mode: 'covector', basis: [[1.4, 0.3], [-0.3, 1.1]], ghost: SQ, dragBasis: true, covector: [1.2, 0.5], vector: [1.9, 1.1], readout: ['w', 'wold', 'V', 'Vold', 'pair', 'A'], view: 2.3 },
    caption: t`The stack and the arrow are fixed; only the basis moves. Old basis: perpendicular, unit, faint. Tips snap to a 0.1 grid.`,
  },
  example: {
    prompt: t`The copper liner of a rocket engine’s regeneratively cooled chamber wall carries a temperature gradient of $2.4\times10^5$ K/m through its thickness. Express the gradient covector’s component in a basis whose arrow is 1 mm long, the liner’s 0.8 mm thickness as a vector component in each basis, and the temperature drop across it.`,
    visual: WALL('Schematic, not to scale (the real ratio of the arrows is 1000): isotherms through the wall, one per fixed temperature step. The long basis arrow crosses many gaps, the short one few — but it takes more short arrows to span the thickness, which crosses the same isotherms however it is measured.'),
    steps: [
      { label: 'Old basis', text: t`With $\mathbf e_1$ = 1 m: $\omega_1 = 2.4\times10^5$ (kelvin per metre) and the thickness is $V^1 = 8\times10^{-4}$ (metres).` },
      { label: 'Change of basis', text: t`$\mathbf e'_1 = 10^{-3}\,\mathbf e_1$, so $A = 10^{-3}$ and $A^{-1} = 10^3$.` },
      { label: 'Covector: with the basis', text: t`$\omega'_1 = A\,\omega_1 = 10^{-3}\times2.4\times10^5 = 240$ — kelvin per millimetre. A shorter arrow crosses fewer isotherms.` },
      { label: 'Vector: against it', text: t`$V'^1 = A^{-1}V^1 = 10^3\times8\times10^{-4} = 0.8$ — millimetres. More short arrows fit.` },
      { label: 'Pairing: unchanged', text: t`$\omega_1V^1 = 2.4\times10^5\times8\times10^{-4} = 192$ K and $\omega'_1V'^1 = 240\times0.8 = 192$ K. ✓ The temperature drop across the liner is a scalar.` },
    ],
    answer: t`240 K/mm (lower index, scales with the basis); 0.8 mm (upper index, scales against it); a 192 K drop either way.`,
  },
  practice: [
    multi({
      id: 'which-lower', difficulty: 1,
      prompt: 'Which of these transform with A — like the basis vectors — and so carry lower indices? Select every one.',
      visual: legs([{ name: 'ω', down: ['j'] }, { name: 'e', down: ['j'] }, { name: 'V', up: ['j'] }, { name: 'eᵈ', up: ['j'] }], { gap: 1.7, caption: t`Index heights at a glance: $\omega_j$ and $\mathbf e_j$ down; $V^j$ and the dual basis $\mathbf e^j$ (drawn $e^d$) up.` }),
      choices: [t`The basis vectors $\mathbf e_j$`, t`The components $\omega_j$ of a covector`, t`The components $\partial_jf$ of a gradient`, t`The components $V^j$ of a vector`, t`The dual basis covectors $\mathbf e^j$`],
      answer: [0, 1, 2],
      why: {
        3: t`Vector components transform with $A^{-1}$, against the basis, so that $V^j\mathbf e_j$ stays the same arrow.`,
        4: t`The dual basis must keep $\mathbf e^j(\mathbf e_i) = \delta^j_i$: if the $\mathbf e_i$ go with $A$, the $\mathbf e^j$ must go with $A^{-1}$.`,
      },
      hints: [t`A covector’s component is its value on a basis vector: $\omega_j = \omega(\mathbf e_j)$. How must it change when $\mathbf e_j$ does?`],
      teach: 'Lower indices transform with the basis vectors; upper indices against them.',
      explain: t`$\mathbf e_j$, $\omega_j = \omega(\mathbf e_j)$ and $\partial_jf = df(\partial_j)$ all change with $A$: lower indices. $V^j$ and $\mathbf e^j$ change with $A^{-1}$: upper indices.`,
    }),
    num({
      id: 'lapse', difficulty: 1,
      gen(r) {
        const [what, val, unitOld, unitNew, f, pretty] = r.pick([
          ['the standard atmosphere’s temperature lapse rate', -6.5, 'kelvin per kilometre', 'kelvin per metre', 1e-3, 'per metre'],
          ['the pressure gradient along a water pipe', -1200, 'pascals per metre', 'pascals per centimetre', 1e-2, 'per centimetre'],
          ['a temperature gradient through a heat shield', 3.0e4, 'kelvin per metre', 'kelvin per millimetre', 1e-3, 'per millimetre'],
        ]);
        const ans = val * f;
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} is $${tex(val, 3)}$ ${unitOld}. The basis arrow is changed to one ${pretty.replace('per ', '')} long, $\mathbf e'_1 = ${tex(f, 1)}\,\mathbf e_1$. What is the gradient covector’s new component, in ${unitNew}?`,
          visual: still({ mode: 'covector', basis: [[0.6, 0], [0, 1]], ghost: [[2.2, 0], [0, 1]], ghostNames: ['old unit', ''], names: ['new unit', ''], covector: [1.5, 0], vector: [0.01, 0.01], showVector: false, crossings: false, construction: false, grid: 'none', levelLabels: false }, 'Schematic: a long old basis arrow (faint) and a short new one along the gradient. The short arrow crosses fewer of the stack’s lines.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: val / f, feedback: 'That transforms it like a vector component. A covector component is its value on the basis arrow: a shorter arrow gives a smaller number.' }],
          hints: [t`$\omega'_1 = \omega(\mathbf e'_1) = ${tex(f, 1)}\,\omega(\mathbf e_1)$.`],
          teach: 'A gradient’s component scales with the basis arrow: per kilometre is 1000 times per metre.',
          explain: t`$\omega'_1 = ${tex(f, 1)}\times${tex(val, 3)} = ${tex(ans, 3)}$ ${unitNew}. Lower index, transforms with the basis.`,
        };
      },
    }),
    num({
      id: 'back', difficulty: 3,
      gen(r) {
        let A, wn, w;
        for (let k = 0; k < 40; k++) {
          A = r.pick(CASES); w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
          wn = [A[0][0] * w[0] + A[1][0] * w[1], A[0][1] * w[0] + A[1][1] * w[1]];
          if (wn.every((x) => x !== 0)) break;
        }
        const i = r.pick([1, 2]);
        const wrong = [A[0][0] * wn[0] + A[0][1] * wn[1], A[1][0] * wn[0] + A[1][1] * wn[1]][i - 1];
        return {
          prompt: t`With $\mathbf e'_j = A^i{}_j\,\mathbf e_i$ and $A = ${matTeX(A)}$, a covector has new components $\omega'_j = ${vecTeX(wn)}$. What was its old component $\omega_${i}$?`,
          visual: still({ mode: 'covector', basis: cols(A), ghost: SQ, covector: wn.map((x) => x * 0.4), vector: [0.01, 0.01], showVector: false, crossings: false, construction: false, grid: 'none', levelLabels: true }, t`The stack of $0.4\,\omega$ with the new basis (bold) and the old (faint).`),
          answer: w[i - 1], tol: { rel: 0, abs: 0.01 },
          errors: Math.abs(wrong - w[i - 1]) > 0.01 ? [{ value: wrong, feedback: t`Going back needs $A^{-1}$: $\omega_i = (A^{-1})^j{}_i\,\omega'_j$.` }] : [],
          hints: [t`$\omega'_j = A^i{}_j\omega_i$ is the system $\omega' = A^\mathsf{T}\omega$; invert it.`, t`$A^{-1} = ${matTeX(inv2(A).map((row) => row.map(fr)))}$; then $\omega_i = (A^{-1})^j{}_i\,\omega'_j$ — column $i$ of $A^{-1}$.`],
          teach: t`Undoing a change of basis reverses each law: covectors go back with $A^{-1}$, vectors with $A$.`,
          explain: t`$\omega_${i} = (A^{-1})^1{}_${i}\,\omega'_1 + (A^{-1})^2{}_${i}\,\omega'_2 = ${w[i - 1]}$. Check: $\omega'_j = A^i{}_j\omega_i$ with $\omega = ${vecTeX(w)}$ gives back $${vecTeX(wn)}$. ✓`,
        };
      },
    }),
    mcq({
      id: 'covariant-words', difficulty: 2,
      prompt: 'The word “covariant” turns up in several places. Which statement is right?',
      visual: legs([{ name: 'ω', down: ['μ'] }, { name: 'V', up: ['μ'] }], { gap: 2, caption: t`Covariant (lower) and contravariant (upper) components.` }),
      choices: [
        'Covariant components transform like the basis vectors and carry lower indices; contravariant ones transform the opposite way and carry upper indices — the “covariant derivative” and “general covariance” are different ideas sharing the word',
        'Covariant components are the ones that do not change when the basis changes',
        'A covariant vector is an arrow and a contravariant one is a stack',
        'In general relativity everything is covariant, so the distinction disappears',
      ],
      answer: 0,
      why: {
        1: 'Neither kind stays put: both change, in opposite ways. What stays put is the pairing.',
        2: 'The old names run the other way: “covariant vectors” were covectors (stacks), “contravariant vectors” arrows.',
        3: '“General covariance” means equations keep their form in all coordinates; it relies on the distinction rather than erasing it.',
      },
      hints: ['“Co-” means “with”: with what?'],
      teach: '“Covariant” components vary with the basis, “contravariant” against it; the covariant derivative and general covariance are separate uses of the word.',
      explain: 'Older books call covectors “covariant vectors” and vectors “contravariant vectors” for this reason. The covariant derivative (lesson A8) and general covariance — the same equations in every coordinate system — reuse the word for a related but distinct idea.',
    }),
    mcq({
      id: 'projections', difficulty: 2,
      prompt: t`In a skewed basis, the perpendicular projections $\mathbf V\cdot\mathbf e_i$ of an arrow (lesson A2.1) are a second set of numbers describing it. How do they transform when the basis changes by $\mathbf e'_j = A^i{}_j\mathbf e_i$?`,
      visual: still({ basis: [[1, 0], [0.5, 0.87]], vector: [1.8, 1.4], construction: true, grid: 'none' }, 'A skewed basis and an arrow, with its parallelogram (upper-index) components. Its projections onto the two basis arrows are different numbers.'),
      choices: [
        t`With $A$, like covector components: $\mathbf V\cdot\mathbf e'_j = A^i{}_j\,(\mathbf V\cdot\mathbf e_i)$ — they are lower-index components`,
        t`With $A^{-1}$, like the components $V^j$`,
        'They do not change, since the arrow does not',
        'They transform with the transpose of A only for rotations',
      ],
      answer: 0,
      why: {
        1: t`The dot product is linear in its second slot: $\mathbf V\cdot(A^i{}_j\mathbf e_i) = A^i{}_j(\mathbf V\cdot\mathbf e_i)$ — with $A$, not against it.`,
        2: 'They are projections onto the basis arrows, so they change when the arrows do.',
        3: 'Linearity gives the law for every basis change, not just rotations.',
      },
      hints: [t`Substitute $\mathbf e'_j = A^i{}_j\mathbf e_i$ into $\mathbf V\cdot\mathbf e'_j$.`],
      teach: t`Projections onto the basis vectors are covariant: they are the lower-index components $V_j$ of the arrow, made with the metric.`,
      explain: t`$\mathbf V\cdot\mathbf e'_j = A^i{}_j(\mathbf V\cdot\mathbf e_i)$: they follow the basis, like $\omega_j$. With the dot product — the metric — an arrow defines a covector $V_j = \mathbf V\cdot\mathbf e_j$; that is “lowering the index” (lesson A6.4).`,
    }),
    order({
      id: 'derive', difficulty: 2,
      prompt: t`Put in order the derivation of the covector law $\omega'_j = A^i{}_j\,\omega_i$.`,
      items: [
        t`The new component is the covector’s value on the new arrow: $\omega'_j = \omega(\mathbf e'_j)$.`,
        t`Substitute the new arrow in terms of the old: $\omega'_j = \omega(A^i{}_j\,\mathbf e_i)$.`,
        t`Use linearity to pull out the numbers $A^i{}_j$: $\omega'_j = A^i{}_j\,\omega(\mathbf e_i)$.`,
        t`Recognise the old components: $\omega'_j = A^i{}_j\,\omega_i$.`,
      ],
      hints: ['Start from the definition of a covector’s components.', 'Linearity is the step that moves the matrix outside.'],
      teach: t`The covector law is just linearity applied to the definition $\omega_j = \omega(\mathbf e_j)$.`,
      explain: t`Definition, substitution, linearity, recognition. Doing the same for $\mathbf e'^j$ (which must satisfy $\mathbf e'^j(\mathbf e'_k) = \delta^j_k$) gives $\mathbf e'^j = (A^{-1})^j{}_i\mathbf e^i$: upper index, inverse matrix.`,
    }),
    mcq({
      id: 'wrong-law', difficulty: 3, kind: 'error',
      prompt: t`A student changes basis with $A = \begin{pmatrix} 2 & 0 \\ 0 & 1 \end{pmatrix}$ ($\mathbf e'_1 = 2\mathbf e_1$). They transform both a gradient $\omega_i = (3, 1)$ and a velocity $V^i = (4, 2)$ with $A^{-1}$, getting $\omega' = (1.5, 1)$ and $V' = (2, 2)$, and find $\omega'_jV'^j = 5$ — but $\omega_iV^i = 14$. Where is the mistake?`,
      visual: still({ mode: 'covector', basis: [[2, 0], [0, 1]], ghost: SQ, covector: [3, 1].map((x) => x * 0.5), vector: [4, 2].map((x) => x * 0.5), crossings: true, construction: false, grid: 'none', levelLabels: false }, 'Half-scale picture: the stack and the arrow, with the stretched new basis.'),
      choices: [
        t`The gradient is a covector: it transforms with $A$, giving $\omega' = (6, 1)$ and $\omega'_jV'^j = 14$`,
        t`The velocity should have been transformed with $A$`,
        'Nothing: pairings may change under a change of basis',
        t`Both should have been transformed with $A^\mathsf{T}$`,
      ],
      answer: 0,
      why: {
        1: t`$V$ was right: vector components transform with $A^{-1}$, so $V'^1 = 4/2 = 2$.`,
        2: 'A pairing is the same in every basis; a change means a mistake.',
        3: t`$A$ is diagonal here, so $A^\mathsf{T} = A$: that would make the velocity wrong instead.`,
      },
      hints: ['Which of the two objects is a covector?', t`$\omega'_1 = \omega(2\mathbf e_1) = 2\omega_1$.`],
      teach: t`Use the pairing as a check: if $\omega_jV^j$ changes, one of the laws was applied to the wrong kind of object.`,
      explain: t`$\omega'_1 = 2\cdot3 = 6$, $\omega'_2 = 1$; $V' = (2, 2)$. Then $\omega'_jV'^j = 12 + 2 = 14$. ✓`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cov', difficulty: 2,
      gen(r) {
        let A, w, wn;
        for (let k = 0; k < 40; k++) {
          A = r.pick(CASES); w = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
          wn = [A[0][0] * w[0] + A[1][0] * w[1], A[0][1] * w[0] + A[1][1] * w[1]];
          if (wn.every((x) => x !== 0)) break;
        }
        const j = r.pick([1, 2]);
        return {
          prompt: t`With $\mathbf e'_j = A^i{}_j\mathbf e_i$, $A = ${matTeX(A)}$, and a covector $\omega_i = ${vecTeX(w)}$, find $\omega'_${j}$.`,
          visual: still({ mode: 'covector', basis: cols(A), ghost: SQ, covector: wn.map((x) => x * 0.4), vector: [0.01, 0.01], showVector: false, crossings: false, construction: false, grid: 'none', levelLabels: false }, 'The stack (scaled) with the new basis (bold) and the old (faint).'),
          answer: wn[j - 1], tol: { rel: 0, abs: 0.01 },
          hints: [t`$\omega'_j = A^i{}_j\omega_i$: column $j$ of $A$.`],
          teach: 'Covector components transform with the basis matrix.',
          explain: t`$\omega'_${j} = ${A[0][j - 1]}\cdot(${w[0]}) + ${A[1][j - 1]}\cdot(${w[1]}) = ${wn[j - 1]}$.`,
        };
      },
    }),
    num({
      id: 'cp-heatshield', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([1.8e5, 2.4e5, 3.2e5]), th = r.pick([0.6, 0.8, 1.2]);
        const per = g * 1e-3;
        return {
          prompt: t`During a hot-fire test, thermocouples show a temperature gradient of $${tex(g, 2)}$ K/m through a combustion chamber’s copper liner, which is ${th} mm thick. The engineering drawing uses a basis arrow 1 mm long. What is the gradient covector’s component in that basis, in kelvin per millimetre?`,
          visual: WALL('Schematic, not to scale: isotherms through the liner, a long (1 m) and a short (1 mm) basis arrow, and the liner’s thickness.'),
          answer: per, tol: { rel: 0.005 },
          errors: [{ value: g * 1e3, feedback: 'That multiplies by 1000. The millimetre arrow is 1000 times shorter, so it crosses 1000 times fewer isotherms.' }, { value: per * th, feedback: 'That is the temperature drop across the liner — the pairing. The question asks for the component per millimetre.' }],
          hints: [t`A covector component is “per basis arrow”: how many isotherms does a 1 mm arrow cross, compared with a 1 m one?`, t`$\mathbf e'_1 = 10^{-3}\,\mathbf e_1$, and covector components transform with the basis: multiply by $10^{-3}$.`],
          teach: 'Covector components are “per basis arrow”: shorten the arrow and the component shrinks with it.',
          explain: t`$\omega'_1 = 10^{-3}\times${tex(g, 2)} = ${nice(per)}$ K/mm. Across the ${th} mm liner that is a drop of $${nice(per)}\times${th} = ${nice(per * th)}$ K, the same in metres: $${tex(g, 2)}\times${tex(th * 1e-3, 1)}$ K.`,
        };
      },
    }),
    mcq({
      id: 'cp-triple', difficulty: 2,
      prompt: 'Every basis vector is tripled. A certain set of components triples too. Do those components carry upper or lower indices?',
      visual: still({ mode: 'covector', basis: [[2.4, 0], [0, 2.4]], ghost: [[0.8, 0], [0, 0.8]], ghostNames: ['e₁', 'e₂'], names: ['3e₁', '3e₂'], covector: [1.8, 0.9], vector: [0.01, 0.01], showVector: false, crossings: false, construction: false, grid: 'none' }, 'The old basis (faint) and the tripled one (bold), over a covector’s stack: each tripled arrow crosses three times as many lines.'),
      choices: ['Lower: they transform like the basis vectors', 'Upper: they transform like the basis vectors', 'Upper: components always grow with the basis', 'It cannot be decided from this'],
      answer: 0,
      why: {
        1: 'Upper-index components transform against the basis: they would be divided by 3.',
        2: 'Vector components shrink when the basis grows.',
        3: 'Scaling with the basis is exactly the covariant (lower-index) law.',
      },
      hints: [t`Compare $\omega'_j = \omega(3\mathbf e_j) = 3\omega_j$ with $V'^j = V^j/3$.`],
      teach: 'Components that scale with the basis are covariant and carry lower indices.',
      explain: t`$\omega'_j = 3\omega_j$: covector (lower-index) components. Vector components would become $V^j/3$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (transformation of dual vectors)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Covariance and contravariance of vectors', url: 'https://en.wikipedia.org/wiki/Covariance_and_contravariance_of_vectors' },
    { label: 'Fleisch, A Student’s Guide to Vectors and Tensors, ch. 4', url: 'https://www.cambridge.org/9780521171908' },
  ],
});
