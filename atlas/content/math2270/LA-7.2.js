// Change-of-basis matrices: converting coordinates between two bases, and the
// rule that components change against the basis (the contravariant law).
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { add, scale, matvec, matmul, det2, inverse, isInt, matTeX, colTeX, tupleTeX, qt } from './_la.js';
import { unimodular, inv2, fromCols } from './_eig.js';

const t = String.raw;
const PCB = t`P_{\mathcal C\leftarrow\mathcal B}`;
const ORD = ['first', 'second'];
const DEG = Math.PI / 180;

// two bases: C with det ±1 (so P_{C←B} = P_C⁻¹P_B is an integer matrix) and B with a small determinant
function bases(r) {
  for (let k = 0; k < 500; k++) {
    const PC = unimodular(r, { range: 2 }), PB = [[r.int(-2, 3), r.int(-2, 2)], [r.int(-2, 2), r.int(-1, 3)]];
    const dB = det2(PB);
    if (dB === 0 || Math.abs(dB) > 3 || PB.flat().filter((v) => v !== 0).length < 3) continue;
    const M = matmul(inv2(PC), PB).map((row) => row.map((v) => Math.round(v)));
    if (M.flat().some((v) => Math.abs(v) > 6) || M.flat().filter((v) => v !== 0).length < 3) continue;
    return { PC, PB, M };
  }
  return { PC: [[1, 1], [0, 1]], PB: [[2, 1], [1, 2]], M: [[1, -1], [1, 2]] };
}
const twoBases = (PB, PC, vector, { caption, readout = false, showVector = true } = {}) => ({
  type: 'ten-basis',
  params: {
    mode: 'vector', basis: [[PB[0][0], PB[1][0]], [PB[0][1], PB[1][1]]], ghost: [[PC[0][0], PC[1][0]], [PC[0][1], PC[1][1]]],
    names: ['b₁', 'b₂'], ghostNames: ['c₁', 'c₂'], vector: vector || [1, 1], showVector, vname: 'x', vtex: 'x',
    dragVector: false, dragBasis: false, construction: false, grid: 'basis', readout,
  },
  caption: caption || 'Two bases of one plane: b₁, b₂ (bold, with faint lines one b-step apart) and c₁, c₂ (faint).',
});

export default lesson({
  id: 'math2270.LA-7.2',
  title: 'Change-of-basis matrices',
  minutes: 11, difficulty: 3,
  intro: t`Given two bases $\mathcal B$ and $\mathcal C$ of the same space, one matrix converts $\mathcal B$-coordinates into $\mathcal C$-coordinates:
$$[\mathbf x]_{\mathcal C} = ${PCB}\,[\mathbf x]_{\mathcal B}, \qquad ${PCB} = \big[\,[\mathbf b_1]_{\mathcal C}\ \ [\mathbf b_2]_{\mathcal C}\ \cdots\ [\mathbf b_n]_{\mathcal C}\,\big]$$
Its columns are **the old basis vectors written in the new basis**. With the standard basis as $\mathcal C$ it is just $P_{\mathcal B}$, and in general $${PCB} = P_{\mathcal C}^{-1}P_{\mathcal B}$. Read it the other way round and it is a **transformation law**: if the new basis vectors are built from the old ones by a matrix $P$, the components of every fixed vector change by $P^{-1}$ — they move **against** the basis. Make every basis vector 1000 times longer and every component becomes 1000 times smaller. Components that change this way are called *contravariant*; [the tensor track](#/lesson/st-a.A2.2) takes this law and builds tensors on it, and a gradient, whose components change *with* the basis instead, turns out to be a different kind of object — a covector ([C3-3.6](#/lesson/math2210.C3-3.6)).`,
  symbols: [
    { tex: t`\mathcal B,\ \mathcal C`, text: t`two bases of the same space: the “old” one $\mathcal B = \{\mathbf b_1, \dots, \mathbf b_n\}$ and the “new” one $\mathcal C = \{\mathbf c_1, \dots, \mathbf c_n\}$` },
    { tex: t`[\mathbf x]_{\mathcal B},\ [\mathbf x]_{\mathcal C}`, text: t`the coordinate vectors of one vector $\mathbf x$ relative to each basis` },
    { tex: PCB, text: t`the change-of-coordinates matrix from $\mathcal B$ to $\mathcal C$ (read right to left: it takes $\mathcal B$-coordinates in and gives $\mathcal C$-coordinates out); it is $n\times n$ and invertible` },
    { tex: t`[\mathbf b_j]_{\mathcal C}`, text: t`the $j$-th old basis vector described in the new basis: column $j$ of the matrix` },
    { tex: t`P_{\mathcal B},\ P_{\mathcal C}`, text: t`the matrices with the basis vectors (in standard components) as columns, from LA-7.1` },
  ],
  why: 'Every change of reference frame — station axes to orbit axes, ground axes to body axes, one observer’s coordinates to another’s in relativity — is a change-of-basis matrix, and knowing which way it acts is the whole game.',
  visual: {
    type: 'ten-basis',
    title: 'Turn the basis, and the components turn back',
    lead: t`The faint arrows $\mathbf e_1, \mathbf e_2$ are the old basis; the bold $\mathbf e'_1, \mathbf e'_2$ are a new one you can drag, or pick from the buttons. The gold arrow $\mathbf x$ never moves. The readout gives its old and new components and the matrix $A$ whose columns are the new basis vectors in old components — the readout of the tensor track, where this lesson would write $P_{\mathcal E\leftarrow\mathcal E'}$. New components are $A^{-1}$ times old ones.`,
    tasks: [
      'Choose “Turned +30°”: the new components are the old ones turned by −30°. They move against the basis.',
      'Choose “e′₁ doubled” (or drag e′₁ out to twice its length): A’s first column doubles, and the first new component halves.',
      'Check one row of the readout by hand: new components = A⁻¹ × old components.',
    ],
    params: {
      mode: 'vector', basis: [[1, 0], [0, 1]], ghost: true, dragBasis: true, vector: [2, 1], dragVector: true, vname: 'x', vtex: 'x',
      presets: [{ label: 'Same as old', basis: [[1, 0], [0, 1]] }, { label: 'Turned +30°', basis: [[0.866, 0.5], [-0.5, 0.866]] }, { label: 'e′₁ doubled', basis: [[2, 0], [0, 1]] }, { label: 'Sheared', basis: [[1, 0], [1, 1]] }],
      readout: ['V', 'Vold', 'A'], snap: 0.1,
    },
    caption: 'Old basis faint, new basis bold. The arrow x and its true length never change; only its description does. Tips snap to 0.1.',
  },
  example: {
    prompt: t`Let $\mathcal B = \{(2, 1), (1, 2)\}$ and $\mathcal C = \{(1, 0), (1, 1)\}$. Find $${PCB}$, and use it to convert $[\mathbf x]_{\mathcal B} = (2, 1)$ into $\mathcal C$-coordinates.`,
    visual: twoBases([[2, 1], [1, 2]], [[1, 1], [0, 1]], [5, 4], { readout: ['V', 'Vold', 'A'], caption: 'B bold and C faint, with x = 2b₁ + b₂. In the readout, the new basis is B, the old one C, and A is the matrix P(C←B).' }),
    steps: [
      { label: 'Column 1', text: t`Write $\mathbf b_1 = (2, 1)$ in $\mathcal C$: $c_1(1, 0) + c_2(1, 1) = (2, 1)$ gives $c_2 = 1$, $c_1 = 1$. So $[\mathbf b_1]_{\mathcal C} = (1, 1)$.` },
      { label: 'Column 2', text: t`$\mathbf b_2 = (1, 2)$: $c_2 = 2$, $c_1 = 1 - 2 = -1$, so $[\mathbf b_2]_{\mathcal C} = (-1, 2)$.` },
      { label: 'The matrix', text: t`$${PCB} = ${matTeX([[1, -1], [1, 2]])}$. (The same as $P_{\mathcal C}^{-1}P_{\mathcal B} = ${matTeX([[1, -1], [0, 1]])}${matTeX([[2, 1], [1, 2]])}$.)` },
      { label: 'Convert', text: t`$[\mathbf x]_{\mathcal C} = ${matTeX([[1, -1], [1, 2]])}${colTeX([2, 1])} = ${colTeX([1, 4])}$.` },
      { label: 'Check', text: t`In standard components: $2\mathbf b_1 + \mathbf b_2 = (5, 4)$ and $1\cdot\mathbf c_1 + 4\mathbf c_2 = (1 + 4,\ 4) = (5, 4)$. ✓ The same arrow. To go back, from $\mathcal C$ to $\mathcal B$, use the inverse: $P_{\mathcal B\leftarrow\mathcal C} = (${PCB})^{-1}$.` },
    ],
    answer: t`$${PCB} = ${matTeX([[1, -1], [1, 2]])}$ and $[\mathbf x]_{\mathcal C} = (1, 4)$.`,
  },
  practice: [
    mcq({
      id: 'columns', difficulty: 1,
      prompt: t`What are the columns of $${PCB}$, the matrix that turns $\mathcal B$-coordinates into $\mathcal C$-coordinates?`,
      choices: [
        t`The vectors of $\mathcal B$, written in $\mathcal C$-coordinates: $[\mathbf b_j]_{\mathcal C}$`,
        t`The vectors of $\mathcal C$, written in $\mathcal B$-coordinates: $[\mathbf c_j]_{\mathcal B}$`,
        t`The vectors of $\mathcal B$ in standard components`,
        t`The vectors of $\mathcal C$ in standard components`,
      ],
      answer: 0,
      why: {
        1: t`Those are the columns of $P_{\mathcal B\leftarrow\mathcal C}$, the conversion in the opposite direction — the inverse matrix.`,
        2: t`That is $P_{\mathcal B}$, which turns $\mathcal B$-coordinates into *standard* components. It is $${PCB}$ only when $\mathcal C$ is the standard basis.`,
        3: t`That is $P_{\mathcal C}$, which turns $\mathcal C$-coordinates into standard components.`,
      },
      hints: [t`Feed the matrix $[\mathbf b_1]_{\mathcal B} = (1, 0, \dots, 0)$. Out comes its first column — and it must be $[\mathbf b_1]_{\mathcal C}$.`],
      teach: t`Column $j$ of $${PCB}$ is what the matrix does to $(0, \dots, 1, \dots, 0)$, the $\mathcal B$-coordinates of $\mathbf b_j$ — so it is $[\mathbf b_j]_{\mathcal C}$.`,
      explain: t`The coordinates of $\mathbf b_j$ relative to $\mathcal B$ are the $j$-th unit column, and multiplying by any matrix picks out its $j$-th column. Since the output must be $\mathcal C$-coordinates, column $j$ is $[\mathbf b_j]_{\mathcal C}$.`,
      visual: twoBases([[2, 1], [1, 2]], [[1, 1], [0, 1]], null, { showVector: false }),
    }),
    num({
      id: 'entry', difficulty: 2,
      gen(r) {
        const { PC, PB, M } = bases(r);
        const i = r.int(0, 1), j = r.int(0, 1);
        const rev = inverse(M), errors = [];
        if (PB[i][j] !== M[i][j]) errors.push({ value: PB[i][j], feedback: t`That entry is from $P_{\mathcal B}$, the standard components of the $\mathcal B$ vectors. Rewrite $\mathbf b_${j + 1}$ in terms of $\mathbf c_1, \mathbf c_2$.` });
        if (Math.abs(rev[i][j] - M[i][j]) > 1e-9 && !errors.some((e) => Math.abs(e.value - rev[i][j]) < 1e-9)) errors.push({ value: rev[i][j], feedback: t`That is an entry of $P_{\mathcal B\leftarrow\mathcal C}$, the conversion the other way round.` });
        const b = [PB[0][j], PB[1][j]], cc = [M[0][j], M[1][j]];
        return {
          prompt: t`$\mathcal B = \{${tupleTeX([PB[0][0], PB[1][0]])}, ${tupleTeX([PB[0][1], PB[1][1]])}\}$ and $\mathcal C = \{${tupleTeX([PC[0][0], PC[1][0]])}, ${tupleTeX([PC[0][1], PC[1][1]])}\}$. Find the entry in row ${i + 1}, column ${j + 1} of $${PCB}$.`,
          answer: M[i][j], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`Column ${j + 1} of $${PCB}$ is $[\mathbf b_${j + 1}]_{\mathcal C}$: solve $c_1\mathbf c_1 + c_2\mathbf c_2 = ${tupleTeX(b)}$.`, t`Or compute $P_{\mathcal C}^{-1}P_{\mathcal B}$ with $P_{\mathcal C}^{-1} = ${matTeX(inv2(PC).map((rw) => rw.map((v) => Math.round(v))))}$.`],
          teach: t`The columns of $${PCB}$ are the old basis vectors in new coordinates; equivalently $${PCB} = P_{\mathcal C}^{-1}P_{\mathcal B}$.`,
          explain: t`$\mathbf b_${j + 1} = ${tupleTeX(b)} = ${cc[0]}\,\mathbf c_1 + (${cc[1]})\,\mathbf c_2$, so column ${j + 1} is $${tupleTeX(cc)}$ and the whole matrix is $${PCB} = ${matTeX(M)}$.`,
          visual: twoBases(PB, PC, null, { showVector: false }),
        };
      },
    }),
    num({
      id: 'back', difficulty: 2,
      gen(r) {
        const { PC, PB, M } = bases(r);
        const Minv = inverse(M), dM = det2(M);
        let c = [1, 1], xb = [1, 1];
        for (let k = 0; k < 200; k++) {
          xb = [r.intExcept(-2, 3, [0]), r.intExcept(-2, 3, [0])];
          c = matvec(M, xb);
          if (c.every((v) => Math.abs(v) <= 9) && (xb[0] !== c[0] || xb[1] !== c[1])) break;
        }
        const k = r.int(0, 1), wrong = matvec(M, c);
        const x = matvec(PB, xb);
        const errors = Math.abs(wrong[k] - xb[k]) > 1e-9 ? [{ value: wrong[k], feedback: t`You multiplied by $${PCB}$ again, which converts *into* $\mathcal C$. To go from $\mathcal C$ back to $\mathcal B$ you need its inverse.` }] : [];
        if (Math.abs(c[k] - xb[k]) > 1e-9 && !errors.some((e) => e.value === c[k])) errors.push({ value: c[k], feedback: t`That is the $\mathcal C$-coordinate you were given; the question asks for the $\mathcal B$-coordinate.` });
        return {
          prompt: t`For two bases of the plane, $${PCB} = ${matTeX(M)}$. A vector has $[\mathbf x]_{\mathcal C} = ${tupleTeX(c)}$. Find the ${ORD[k]} entry of $[\mathbf x]_{\mathcal B}$.`,
          answer: xb[k], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$[\mathbf x]_{\mathcal C} = ${PCB}[\mathbf x]_{\mathcal B}$, so you must undo the matrix.`, t`$\det ${PCB} = ${qt(dM)}$, so $(${PCB})^{-1} = \frac{1}{${qt(dM)}}${matTeX([[M[1][1], -M[0][1]], [-M[1][0], M[0][0]]])}$.`],
          teach: t`Going from $\mathcal C$ back to $\mathcal B$ uses the inverse matrix: $P_{\mathcal B\leftarrow\mathcal C} = (${PCB})^{-1}$.`,
          explain: t`$[\mathbf x]_{\mathcal B} = (${PCB})^{-1}[\mathbf x]_{\mathcal C} = ${matTeX(Minv)}${colTeX(c)} = ${colTeX(xb)}$. Check: $${matTeX(M)}${colTeX(xb)} = ${colTeX(c)}$. ✓`,
          visual: twoBases(PB, PC, x, { caption: 'The vector x with both bases: b₁, b₂ bold, c₁, c₂ faint.' }),
        };
      },
    }),
    mcq({
      id: 'units', difficulty: 2,
      prompt: t`A position is $(4500, 1200)$ in a basis of two perpendicular arrows each **1 m** long. You switch to arrows in the same directions but **1 km** long — every basis vector is 1000 times longer. What are the new components?`,
      choices: [t`$(4.5,\ 1.2)$`, t`$(4\,500\,000,\ 1\,200\,000)$`, t`$(4500,\ 1200)$: the position has not moved`, t`$(4.5,\ 1200)$`],
      answer: 0,
      why: {
        1: t`That multiplies the components by 1000, *with* the basis. But you need fewer of the longer arrows to reach the same point.`,
        2: t`The position has not moved — but its description has, because the basis has.`,
        3: 'Both basis vectors changed, so both components change.',
      },
      hints: [t`The new basis is $\mathbf b'_j = 1000\,\mathbf b_j$, so $P = 1000\,I$. Components change by $P^{-1}$.`],
      teach: 'Components change against the basis: longer basis vectors mean smaller components.',
      explain: t`$4500\ \text{m} = 4.5 \times (1\ \text{km})$: the arrow is unchanged, so $4500\,\mathbf b_1 = 4.5\,(1000\,\mathbf b_1)$. With $P = 1000\,I$, the new components are $P^{-1}(4500, 1200) = (4.5, 1.2)$. Every unit conversion you have ever done is this law at work.`,
      visual: {
        type: 'ten-basis',
        params: { mode: 'vector', basis: [[2, 0], [0, 2]], ghost: [[1, 0], [0, 1]], names: ['new b₁', 'new b₂'], ghostNames: ['b₁', 'b₂'], vector: [3, 2], vname: 'x', vtex: 'x', dragVector: false, construction: true, grid: 'basis', readout: false },
        caption: 'A sketch, not to scale: the old basis (faint) and a new basis twice as long (bold). Half as many of the longer arrows reach the same point.',
      },
    }),
    mcq({
      id: 'law', difficulty: 2,
      prompt: t`A new basis is built from an old one by a matrix $P$: column $j$ of $P$ holds the old coordinates of the new vector $\mathbf b'_j$. So the basis vectors “transform with $P$”. How do the coordinates of a **fixed** vector transform?`,
      choices: [t`$[\mathbf x]_{\text{new}} = P^{-1}[\mathbf x]_{\text{old}}$`, t`$[\mathbf x]_{\text{new}} = P\,[\mathbf x]_{\text{old}}$`, t`$[\mathbf x]_{\text{new}} = P^{\mathsf T}[\mathbf x]_{\text{old}}$`, t`They do not change: the vector is fixed`],
      answer: 0,
      why: {
        1: t`That would move the components *with* the basis. Test it: $P = 2I$ doubles every basis vector, and the components must halve, not double.`,
        2: t`For a rotation $P^{\mathsf T} = P^{-1}$, so this happens to work there — but not for a stretch or a shear. The general law is $P^{-1}$.`,
        3: t`The arrow is fixed; the numbers describing it depend on the basis.`,
      },
      hints: [t`Write $\mathbf x$ both ways: $\sum_j c'_j\mathbf b'_j = \sum_i c_i\mathbf b_i$, and substitute $\mathbf b'_j = \sum_i P_{ij}\mathbf b_i$.`, t`That gives $c_i = \sum_j P_{ij}c'_j$, i.e. $[\mathbf x]_{\text{old}} = P[\mathbf x]_{\text{new}}$.`],
      teach: t`Basis vectors transform with $P$; the components of a fixed vector transform with $P^{-1}$ — the contravariant law.`,
      explain: t`$[\mathbf x]_{\text{old}} = P[\mathbf x]_{\text{new}}$, so $[\mathbf x]_{\text{new}} = P^{-1}[\mathbf x]_{\text{old}}$. Here $P$ is $P_{\text{old}\leftarrow\text{new}}$. This is exactly the law that defines a vector (a type-(1, 0) tensor) in [the tensor track](#/lesson/st-a.A2.2) and in general relativity, with $P$ replaced by the Jacobian of a coordinate change.`,
      visual: {
        type: 'ten-basis',
        params: { mode: 'vector', basis: [[1.5, 0.5], [0, 1.2]], ghost: [[1, 0], [0, 1]], vector: [2.4, 1.6], vname: 'x', vtex: 'x', dragVector: false, construction: true, grid: 'basis', readout: false },
        caption: 'Old basis faint, new basis bold, built from the old by a stretch and a shear. The dashed parallelogram is x in the new basis.',
      },
    }),
    num({
      id: 'incline', difficulty: 3,
      gen(r) {
        const [th, c, s] = r.pick([[30, Math.sqrt(3) / 2, 0.5], [36.87, 0.8, 0.6], [45, Math.SQRT1_2, Math.SQRT1_2], [53.13, 0.6, 0.8], [60, 0.5, Math.sqrt(3) / 2]]);
        const F = [r.intExcept(-6, 8, [0]) * 5, r.intExcept(-6, 8, [0]) * 5];
        const k = r.int(0, 1);
        const good = k === 0 ? F[0] * c + F[1] * s : -F[0] * s + F[1] * c;
        const bad = k === 0 ? F[0] * c - F[1] * s : F[0] * s + F[1] * c;
        return {
          prompt: t`A force has components $\mathbf F = (${F[0]}, ${F[1]})$ N in ground axes. New axes $x', y'$ are the ground axes turned **counterclockwise** by $\theta = ${th}^\circ$ (as along and across a slope). Find $F_{${k ? "y'" : "x'"}}$, the component along the new ${k ? 'y' : 'x'}-axis.`,
          answer: good, units: 'N', tol: { rel: 0.005, abs: 0.05 },
          errors: Math.abs(bad - good) > 0.05 ? [{ value: bad, feedback: t`That turns the components the same way as the axes. Components turn *against* the basis: by $-${th}^\circ$.` }] : [],
          hints: [t`The new basis vectors are $\mathbf e'_1 = (\cos\theta, \sin\theta)$ and $\mathbf e'_2 = (-\sin\theta, \cos\theta)$, so $P$ is the rotation by $\theta$.`, t`They are orthonormal, so each new component is a dot product: $F_{${k ? "y'" : "x'"}} = \mathbf F\cdot\mathbf e'_${k + 1}$. (Equivalently, $P^{-1}$ is the rotation by $-\theta$.)`],
          teach: 'Turning the axes by θ turns every vector’s components by −θ.',
          explain: t`$F_{${k ? "y'" : "x'"}} = ${k ? t`-F_x\sin\theta + F_y\cos\theta` : t`F_x\cos\theta + F_y\sin\theta`} = ${nice(good)}$ N. The force is the same arrow; its components in the turned axes are the old ones turned by $-${th}^\circ$.`,
          visual: { type: 'ten-basis', params: { mode: 'vector', basis: [[c, s], [-s, c]], ghost: [[1, 0], [0, 1]], names: ["x′", "y′"], ghostNames: ['x', 'y'], vector: [F[0] / 20, F[1] / 20], vname: 'F', vtex: 'F', dragVector: false, construction: false, grid: 'none', readout: false }, caption: `Ground axes (faint) and the axes turned by ${th}° (bold). The force is drawn shrunk to fit; only its direction is to scale.` },
        };
      },
    }),
    mcq({
      id: 'chain', difficulty: 3,
      prompt: t`Three bases $\mathcal B$, $\mathcal C$, $\mathcal D$ of one space. Which matrix converts $\mathcal B$-coordinates straight into $\mathcal D$-coordinates?`,
      choices: [
        t`$P_{\mathcal D\leftarrow\mathcal C}\,${PCB}$`,
        t`$${PCB}\,P_{\mathcal D\leftarrow\mathcal C}$`,
        t`$P_{\mathcal D\leftarrow\mathcal C} + ${PCB}$`,
        t`$(${PCB})^{-1}P_{\mathcal D\leftarrow\mathcal C}$`,
      ],
      answer: 0,
      why: {
        1: t`This applies $P_{\mathcal D\leftarrow\mathcal C}$ first — to $\mathcal B$-coordinates, which it cannot read. In a product the right-hand matrix acts first.`,
        2: 'Doing one conversion after another multiplies matrices; adding them means nothing here.',
        3: t`$(${PCB})^{-1} = P_{\mathcal B\leftarrow\mathcal C}$ converts into $\mathcal B$, the wrong way.`,
      },
      hints: [t`Go $\mathcal B \to \mathcal C$ first, then $\mathcal C \to \mathcal D$. Which matrix must stand next to $[\mathbf x]_{\mathcal B}$?`, t`The labels chain like fractions: $P_{\mathcal D\leftarrow\mathcal C}P_{\mathcal C\leftarrow\mathcal B}$ — the inner $\mathcal C$'s meet and cancel.`],
      teach: 'Conversions compose right to left, and the inner labels must match.',
      explain: t`$[\mathbf x]_{\mathcal D} = P_{\mathcal D\leftarrow\mathcal C}[\mathbf x]_{\mathcal C} = P_{\mathcal D\leftarrow\mathcal C}${PCB}[\mathbf x]_{\mathcal B}$. Writing the arrows right to left makes the order impossible to get wrong — the same bookkeeping as frame changes in flight software (body → local-level → Earth-fixed).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-entry', difficulty: 2,
      gen(r) {
        const { PC, PB, M } = bases(r);
        const i = r.int(0, 1), j = r.int(0, 1);
        return {
          prompt: t`$\mathcal B = \{${tupleTeX([PB[0][0], PB[1][0]])}, ${tupleTeX([PB[0][1], PB[1][1]])}\}$ and $\mathcal C = \{${tupleTeX([PC[0][0], PC[1][0]])}, ${tupleTeX([PC[0][1], PC[1][1]])}\}$. Find the $(${i + 1}, ${j + 1})$ entry of $${PCB}$.`,
          answer: M[i][j], tol: { rel: 0, abs: 0.01 },
          hints: [t`Column ${j + 1} is $[\mathbf b_${j + 1}]_{\mathcal C}$.`],
          teach: t`$${PCB}$ has the $\mathcal B$ vectors, in $\mathcal C$-coordinates, as its columns.`,
          explain: t`$${PCB} = P_{\mathcal C}^{-1}P_{\mathcal B} = ${matTeX(M)}$.`,
          visual: twoBases(PB, PC, null, { showVector: false }),
        };
      },
    }),
    num({
      id: 'cp-attack', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([8, 10, 12, 15]), g = r.pick([2, 3, 5]), V = r.pick([70, 80, 90, 250]);
        const a = (th - g) * DEG, w = -V * Math.sin(a);
        const naive = -V * Math.sin(th * DEG), sum = -V * Math.sin((th + g) * DEG);
        const v2 = [V * Math.cos(g * DEG), V * Math.sin(g * DEG)];
        return {
          prompt: t`An aircraft climbs with velocity $V = ${V}$ m/s along a flight path $${g}^\circ$ above the horizontal, while its nose is pitched $${th}^\circ$ above the horizontal. Its body axes are the ground axes (horizontal, up) turned by the pitch angle: $\hat{\mathbf x}_b$ along the nose and the normal axis $\hat{\mathbf n}$ perpendicular to it, pointing up out of the cockpit (aircraft engineers usually point their body $z$-axis the other way, down). Find the velocity’s component along $\hat{\mathbf n}$ — the flow across the wing that sets its lift.`,
          answer: w, units: 'm/s', tol: { rel: 0.01, abs: 0.05 },
          errors: [{ value: naive, feedback: t`That uses the pitch alone. The velocity is not horizontal: it points $${g}^\circ$ up, so the angle between the velocity and the nose is $${th}^\circ - ${g}^\circ$.` }, { value: sum, feedback: t`The angles subtract: the velocity is turned $${g}^\circ$ up and the body axes $${th}^\circ$ up, so relative to the body the velocity sits $${th - g}^\circ$ *below* the nose.` }],
          hints: [t`In ground axes $\mathbf v = V(\cos ${g}^\circ, \sin ${g}^\circ)$ and $\hat{\mathbf n} = (-\sin ${th}^\circ, \cos ${th}^\circ)$.`, t`The body axes are orthonormal, so the component is the dot product $\mathbf v\cdot\hat{\mathbf n} = V\sin(${g}^\circ - ${th}^\circ)$.`],
          teach: 'A component in a turned frame is the dot product with that frame’s unit vector; turning the axes up turns the velocity down relative to them.',
          explain: t`$\mathbf v\cdot\hat{\mathbf n} = V(-\cos ${g}^\circ\sin ${th}^\circ + \sin ${g}^\circ\cos ${th}^\circ) = V\sin(${g - th}^\circ) = ${nice(w)}$ m/s. Negative: in body axes the air meets the wing from below, at an **angle of attack** $\alpha = ${th}^\circ - ${g}^\circ = ${th - g}^\circ$ — the pitch angle minus the flight-path angle. Flight computers do this change of basis continuously, from air-data and inertial measurements.`,
          visual: { type: 'ten-basis', params: { mode: 'vector', basis: [[Math.cos(th * DEG), Math.sin(th * DEG)], [-Math.sin(th * DEG), Math.cos(th * DEG)]], ghost: [[1, 0], [0, 1]], names: ['nose', 'normal'], ghostNames: ['horizontal', 'up'], vector: v2.map((z) => (1.8 * z) / V), vname: 'v', vtex: 'v', dragVector: false, construction: false, grid: 'none', readout: false }, caption: 'Ground axes (faint), body axes (bold) and the velocity (gold, length not to scale). Angles are drawn true.' },
        };
      },
    }),
    num({
      id: 'cp-law', difficulty: 2,
      gen(r) {
        const [P, words] = r.pick([
          [[[2, 0], [0, 1]], t`$\mathbf b'_1 = 2\mathbf b_1$ and $\mathbf b'_2 = \mathbf b_2$`],
          [[[1, 0], [0, 3]], t`$\mathbf b'_1 = \mathbf b_1$ and $\mathbf b'_2 = 3\mathbf b_2$`],
          [[[1, 0], [1, 1]], t`$\mathbf b'_1 = \mathbf b_1 + \mathbf b_2$ and $\mathbf b'_2 = \mathbf b_2$`],
          [[[1, 1], [0, 1]], t`$\mathbf b'_1 = \mathbf b_1$ and $\mathbf b'_2 = \mathbf b_1 + \mathbf b_2$`],
          [[[2, 0], [0, 2]], t`$\mathbf b'_1 = 2\mathbf b_1$ and $\mathbf b'_2 = 2\mathbf b_2$`],
        ]);
        const cNew = [r.intExcept(-3, 4, [0]), r.intExcept(-3, 4, [0])], cOld = matvec(P, cNew), k = r.int(0, 1);
        const wrong = matvec(P, cOld);
        return {
          prompt: t`A new basis is made from an old one: ${words}. A vector has old coordinates $${tupleTeX(cOld)}$. What is its ${ORD[k]} new coordinate?`,
          answer: cNew[k], tol: { rel: 0, abs: 0.01 },
          errors: Math.abs(wrong[k] - cNew[k]) > 1e-9 ? [{ value: wrong[k], feedback: t`That moves the components with the basis (multiplying by $P$). They move against it: use $P^{-1}$.` }] : [],
          hints: [t`Write the old coordinates in terms of the new ones: substitute the new basis into $c'_1\mathbf b'_1 + c'_2\mathbf b'_2$.`, t`With $P = ${matTeX(P)}$ (columns: the new vectors in old coordinates), $[\mathbf x]_{\text{new}} = P^{-1}[\mathbf x]_{\text{old}}$.`],
          teach: 'Components transform with the inverse of the matrix that builds the new basis.',
          explain: t`$P = ${matTeX(P)}$ and $P^{-1}${colTeX(cOld)} = ${colTeX(cNew)}$. Check: $${cNew[0]}\mathbf b'_1 + (${cNew[1]})\mathbf b'_2$ expands to $${cOld[0]}\mathbf b_1 + (${cOld[1]})\mathbf b_2$. ✓`,
          visual: { type: 'ten-basis', params: { mode: 'vector', basis: [[P[0][0], P[1][0]], [P[0][1], P[1][1]]], ghost: [[1, 0], [0, 1]], names: ['b′₁', 'b′₂'], ghostNames: ['b₁', 'b₂'], vector: cOld, vname: 'x', vtex: 'x', dragVector: false, construction: false, grid: 'basis', readout: false }, caption: 'Old basis faint (drawn as perpendicular unit arrows), new basis bold, and the vector x.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'Lay, Lay & McDonald, Linear Algebra and Its Applications (6th ed.), change of basis', url: 'https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235' },
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §8.3', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
  ],
});
