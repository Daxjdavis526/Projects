// The dual basis: covectors e^j with e^j(e_i) = δ^j_i. They read off a
// vector's components, are the rows of E⁻¹, and in a skewed basis each one
// depends on all the basis arrows.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { still, r6 } from './_ten.js';

const t = String.raw;
const S3 = Math.sqrt(3);
const SKEW60 = [[1, 0], [0.5, r6(S3 / 2)]];
const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const fr = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : frac(x));
const inv2 = (A) => { const d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; };
const cols = (E) => [[E[0][0], E[1][0]], [E[0][1], E[1][1]]];   // the basis arrows from the matrix with them as columns
const dualPic = (B, V, caption, o = {}) => still({ mode: 'vector', basis: B, vector: V.map(r6), showVector: Math.hypot(...V) > 0.05, dual: true, construction: false, grid: 'none', ...o }, caption);

const CASES = [[[2, 1], [0, 1]], [[1, 1], [0, 2]], [[2, 0], [1, 1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[3, 1], [1, 1]], [[2, 1], [1, 1]]];

export default lesson({
  id: 'st-a.A3.4',
  title: 'The dual basis',
  minutes: 11, difficulty: 3,
  intro: t`A basis of vectors $\mathbf e_i$ comes with a partner basis of covectors, the **dual basis** $\mathbf e^j$, defined by

$$\mathbf e^j(\mathbf e_i) = \delta^j_i$$

Each $\mathbf e^j$ gives 1 on its own partner and 0 on all the others. So $\mathbf e^j(\mathbf V) = \mathbf e^j(V^i\mathbf e_i) = V^j$: **the dual covectors read off a vector’s components**, and every covector expands as $\omega = \omega_j\,\mathbf e^j$. In pictures, $\mathbf e^1$ is the stack whose lines run parallel to $\mathbf e_2$ (so $\mathbf e_2$ crosses none) and are spaced so that $\mathbf e_1$ crosses exactly one gap. In numbers: put the basis arrows as the columns of a matrix $E$; the dual covectors are the **rows of $E^{-1}$**, since $E^{-1}E = I$ is the defining equation. You have met one already: the dual of the coordinate basis $\partial_\mu$ is $dx^\mu$ (lesson A3.2).`,
  symbols: [
    { tex: t`\mathbf e_i`, text: 'a basis of vectors (any non-parallel arrows)' },
    { tex: t`\mathbf e^j`, text: t`the dual basis: covectors, one per basis vector, upper index. $\mathbf e^1$ is the stack of lines of constant $V^1$` },
    { tex: t`\delta^j_i`, text: 'the Kronecker delta: 1 if i = j, else 0' },
    { tex: 'E,\\ E^{-1}', text: t`$E$: the matrix whose columns are the basis arrows (in some reference components); the rows of $E^{-1}$ are the dual covectors in the same reference` },
  ],
  why: t`Coordinate bases come with their dual bases — $\partial_t, \partial_r, \dots$ with $dt, dr, \dots$ — and in crystallography the dual basis of a crystal lattice is its reciprocal lattice, which X-ray diffraction measures directly.`,
  visual: {
    type: 'ten-basis',
    title: 'Each dual covector reads one component',
    lead: t`The dashed stacks are the dual basis: blue $\mathbf e^1$, violet $\mathbf e^2$, each labelled. Read the gold arrow’s tip against them: its level among the $\mathbf e^1$ lines is $V^1$, among the $\mathbf e^2$ lines $V^2$. Drag the basis arrows and watch the dual stacks follow.`,
    tasks: [
      t`Drag $\mathbf e_2$ only: the lines of $\mathbf e^1$ turn to stay parallel to it. The dual of $\mathbf e_1$ depends on $\mathbf e_2$ too.`,
      t`Double the length of $\mathbf e_1$: the $\mathbf e^1$ lines pack twice as tight — $\mathbf e_1$ must still cross exactly one gap.`,
      t`Make the two basis arrows perpendicular and equally long: now each dual stack runs perpendicular to its partner arrow. Only then does “dual” look like “the same direction”.`,
    ],
    params: { mode: 'vector', basis: SKEW60, dragBasis: true, vector: [2.1, 1.3], dual: true, construction: false, readout: ['V'], view: 2.3 },
    caption: t`Dashed blue: lines where $\mathbf e^1 = 0, \pm1, \pm2, \dots$; dashed violet: the same for $\mathbf e^2$. Together they are the skewed coordinate grid of the basis — each line of it is a level line of one dual covector.`,
  },
  example: {
    prompt: t`The basis arrows are $\mathbf e_1 = (1, 0)$ and $\mathbf e_2 = (\tfrac12, \tfrac{\sqrt3}{2})$ in a reference grid (both 1 long, $60^\circ$ apart — lesson A2.1). Find the dual basis, check it, and use it on $\mathbf V = (1, 1)$.`,
    visual: dualPic(SKEW60, [1, 1], t`The $60^\circ$ basis, its dual stacks (dashed) and the arrow $(1, 1)$. Its tip lies between the $\mathbf e^1$ lines 0 and 1, and just past the $\mathbf e^2$ line 1.`),
    steps: [
      { label: 'Matrix of the basis', text: t`$E = \begin{pmatrix} 1 & \tfrac12 \\ 0 & \tfrac{\sqrt3}{2} \end{pmatrix}$, columns $\mathbf e_1$ and $\mathbf e_2$; $\det E = \tfrac{\sqrt3}{2}$.` },
      { label: 'Invert', text: t`$E^{-1} = \dfrac{2}{\sqrt3}\begin{pmatrix} \tfrac{\sqrt3}{2} & -\tfrac12 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & -\tfrac{1}{\sqrt3} \\ 0 & \tfrac{2}{\sqrt3} \end{pmatrix}$. Its rows: $\mathbf e^1 = (1, -\tfrac1{\sqrt3})$ and $\mathbf e^2 = (0, \tfrac2{\sqrt3})$, as covectors acting on reference components: $\mathbf e^1(x, y) = x - y/\sqrt3$.` },
      { label: 'Check the deltas', text: t`$\mathbf e^1(\mathbf e_1) = 1$; $\mathbf e^1(\mathbf e_2) = \tfrac12 - \tfrac{\sqrt3}{2}\cdot\tfrac1{\sqrt3} = 0$; $\mathbf e^2(\mathbf e_1) = 0$; $\mathbf e^2(\mathbf e_2) = \tfrac{2}{\sqrt3}\cdot\tfrac{\sqrt3}{2} = 1$. ✓` },
      { label: 'Read components', text: t`$V^1 = \mathbf e^1(1, 1) = 1 - \tfrac1{\sqrt3} = 0.4226$ and $V^2 = \mathbf e^2(1, 1) = \tfrac{2}{\sqrt3} = 1.1547$ — exactly the parallelogram components of lesson A2.1, now found by applying covectors.` },
      { label: 'Not the obvious guess', text: t`$\mathbf e^1$ is not “$\mathbf e_1$ made into a covector”: $(1, -0.577)$ is tilted away from $\mathbf e_1 = (1, 0)$ because it must vanish on $\mathbf e_2$.` },
    ],
    answer: t`$\mathbf e^1 = (1, -\tfrac1{\sqrt3})$, $\mathbf e^2 = (0, \tfrac2{\sqrt3})$; on $\mathbf V = (1, 1)$ they give $V^1 = 0.423$ and $V^2 = 1.155$.`,
  },
  practice: [
    mcq({
      id: 'parallel', difficulty: 1,
      prompt: t`The lines of the dual covector $\mathbf e^1$ run parallel to which arrow?`,
      visual: dualPic([[1.2, 0.2], [0.6, 1]], [1.5, 1.2], t`A skewed basis and its dual stacks; which basis arrow lies along the $\mathbf e^1$ lines?`),
      choices: [t`$\mathbf e_2$`, t`$\mathbf e_1$`, t`Neither: they are perpendicular to $\mathbf e_1$`, t`The vector $\mathbf V$`],
      answer: 0,
      why: {
        1: t`$\mathbf e_1$ must cross exactly one line of $\mathbf e^1$, so it cannot run along them.`,
        2: t`“Perpendicular” needs a metric; the dual basis is defined without one. In a skewed basis the lines are not perpendicular to $\mathbf e_1$.`,
        3: 'The dual basis is fixed by the basis alone; any vector may be fed to it.',
      },
      hints: [t`$\mathbf e^1(\mathbf e_2) = 0$: how many of $\mathbf e^1$’s lines does $\mathbf e_2$ cross?`],
      teach: t`$\mathbf e^1$ vanishes on $\mathbf e_2$, so its lines run along $\mathbf e_2$.`,
      explain: t`$\mathbf e^1(\mathbf e_2) = 0$ means $\mathbf e_2$ crosses none of $\mathbf e^1$’s lines: they are parallel to $\mathbf e_2$. Their spacing is then set by $\mathbf e^1(\mathbf e_1) = 1$.`,
    }),
    num({
      id: 'dual-entry', difficulty: 2,
      gen(r) {
        const E = r.pick(CASES), Ei = inv2(E);
        const j = r.pick([1, 2]), k = r.pick([1, 2]);
        const ans = Ei[j - 1][k - 1];
        return {
          prompt: t`The basis arrows, in reference components, are the columns of $E = ${matTeX(E)}$. The dual covector $\mathbf e^${j}$ acts on reference components as $\mathbf e^${j}(x, y) = a\,x + b\,y$. Find ${k === 1 ? '$a$' : '$b$'}.`,
          visual: dualPic(cols(E), [0.01, 0.01], t`The basis (columns of $E$) and its dual stacks, labelled.`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: [{ value: E[j - 1][k - 1], feedback: t`That is an entry of $E$ itself. The dual covectors are the rows of $E^{-1}$.` }, { value: inv2(E)[k - 1][j - 1], feedback: t`Row ${j} of $E^{-1}$, not column ${j}.` }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`$\mathbf e^j(\mathbf e_i) = \delta^j_i$ for all $i$, $j$ is the matrix equation $E^{-1}E = I$.`, t`$E^{-1} = ${matTeX(Ei.map((row) => row.map(fr)))}$; read row ${j}.`],
          teach: 'The dual basis covectors are the rows of the inverse of the matrix whose columns are the basis vectors.',
          explain: t`$E^{-1} = ${matTeX(Ei.map((row) => row.map(fr)))}$, so $\mathbf e^${j} = (${Ei[j - 1].map(fr).join(',\\ ')})$ and ${k === 1 ? '$a$' : '$b$'} $= ${fr(ans)}$. Check: $\mathbf e^${j}$ gives 1 on $\mathbf e_${j}$ and 0 on the other arrow.`,
        };
      },
    }),
    num({
      id: 'read', difficulty: 1,
      gen(r) {
        const B = r.pick([SKEW60, [[1, 0.3], [-0.4, 1]], [[1.2, 0], [0.5, 1]]]);
        const c = [r.pick([1, 2, -1, 1.5]), r.pick([1, 2, -1, 0.5])];
        const V = [c[0] * B[0][0] + c[1] * B[1][0], c[0] * B[0][1] + c[1] * B[1][1]];
        const j = r.pick([1, 2]);
        return {
          prompt: t`Use the dual stacks to read the component $V^${j} = \mathbf e^${j}(\mathbf V)$ of the gold arrow.`,
          visual: dualPic(B, V, t`The basis, its dual stacks (dashed, labelled: blue $\mathbf e^1$, violet $\mathbf e^2$) and the arrow.`),
          answer: c[j - 1], tol: { rel: 0, abs: 0.1 },
          errors: [{ value: c[2 - j], feedback: t`That is the other component: $V^${j}$ is read from the ${j === 1 ? 'blue' : 'violet'} $\mathbf e^${j}$ lines.` }].filter((e) => e.value !== c[j - 1]),
          hints: [t`Find the ${j === 1 ? 'blue' : 'violet'} dashed line that passes through (or nearest) the arrow’s tip, and read its label.`],
          teach: 'Each dual covector’s stack reads off one component: the label at the arrow’s tip.',
          explain: t`The tip lies on the $\mathbf e^${j}$ line labelled ${nice(c[j - 1])}, so $V^${j} = ${nice(c[j - 1])}$ — the arrow is $${nice(c[0])}\,\mathbf e_1 + ${c[1] < 0 ? `(${nice(c[1])})` : nice(c[1])}\,\mathbf e_2$.`,
        };
      },
    }),
    mcq({
      id: 'both', difficulty: 2,
      prompt: t`You keep $\mathbf e_1$ but swap $\mathbf e_2$ for a different arrow. What happens to the dual covector $\mathbf e^1$?`,
      visual: still({ mode: 'vector', basis: [[1, 0], [-0.4, 1]], ghost: [[1, 0], [0.6, 1]], ghostNames: ['', 'old e₂'], names: ['e₁', 'new e₂'], vector: [0.01, 0.01], showVector: false, dual: true, construction: false, grid: 'none' }, t`The same $\mathbf e_1$ with a new $\mathbf e_2$ (bold; the old one faint). The dashed stacks are the dual of the new basis.`),
      choices: [t`It changes: its lines must turn to run along the new $\mathbf e_2$`, t`Nothing: $\mathbf e^1$ depends only on $\mathbf e_1$`, t`Only $\mathbf e^2$ changes`, t`It changes only if the new $\mathbf e_2$ is longer`],
      answer: 0,
      why: {
        1: t`$\mathbf e^1$ must vanish on $\mathbf e_2$; a new $\mathbf e_2$ means a new condition.`,
        2: t`Both change: $\mathbf e^2$ must vanish on $\mathbf e_1$ and give 1 on the new $\mathbf e_2$; $\mathbf e^1$ must vanish on the new $\mathbf e_2$.`,
        3: t`Direction matters as much as length: a turned $\mathbf e_2$ turns $\mathbf e^1$’s lines.`,
      },
      hints: [t`Write the two conditions on $\mathbf e^1$: its value on $\mathbf e_1$ and on $\mathbf e_2$.`],
      teach: 'Each dual covector depends on the whole basis, not just on its partner.',
      explain: t`$\mathbf e^1(\mathbf e_1) = 1$ and $\mathbf e^1(\mathbf e_2) = 0$ together fix $\mathbf e^1$. Change $\mathbf e_2$ and the second condition changes. This is why “the component along $\mathbf e_1$” means nothing until the whole basis is chosen.`,
    }),
    num({
      id: 'stretch', difficulty: 2,
      gen(r) {
        const s = r.pick([2, 3, 0.5, 4]), V1 = r.pick([3, 6, -2, 1.5]);
        const ans = V1 / s;
        return {
          prompt: t`In some basis a vector has $V^1 = \mathbf e^1(\mathbf V) = ${V1}$. The new basis is $\mathbf e'_1 = ${s}\,\mathbf e_1$, $\mathbf e'_2 = \mathbf e_2$. What is $\mathbf e'^1(\mathbf V)$?`,
          visual: still({ mode: 'vector', basis: [[Math.min(s, 2.5), 0], [0.4, 1]], vector: [1.9, 1.1], dual: true, construction: false, grid: 'none' }, t`A stretched $\mathbf e'_1$ and the dual stacks of the new basis: the $\mathbf e'^1$ lines are spread out by the same factor.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: V1 * s, feedback: t`Stretching $\mathbf e_1$ spreads $\mathbf e^1$’s lines apart (it must still cross exactly one gap), so fewer are crossed.` }],
          hints: [t`$\mathbf e'^1(\mathbf e'_1) = 1$ with $\mathbf e'_1 = ${s}\,\mathbf e_1$ forces $\mathbf e'^1 = \mathbf e^1/${s}$.`],
          teach: 'Stretch a basis vector and its dual covector shrinks by the same factor.',
          explain: t`$\mathbf e'^1 = \mathbf e^1/${s}$, so $\mathbf e'^1(\mathbf V) = ${V1}/${s} = ${nice(ans)}$ — the new component $V'^1$, as lesson A2.2 predicted.`,
        };
      },
    }),
    code({
      id: 'dual-numpy', difficulty: 2,
      prompt: t`Write \`dual_basis(E)\` that returns the dual basis of the basis whose arrows are the **columns** of \`E\`, as a matrix whose **rows** are the dual covectors. Then use it to get the components of \`V = [1, 1]\` in the $60^\circ$ basis of the worked example.`,
      visual: dualPic(SKEW60, [1, 1], 'The worked example: the 60° basis, its dual stacks and the arrow (1, 1).'),
      starter: t`import numpy as np

def dual_basis(E):
    # columns of E: the basis arrows; return a matrix whose rows are the dual covectors
    pass

E = np.array([[1.0, 0.5],
              [0.0, np.sqrt(3) / 2]])
D = dual_basis(E)
components = None    # V^j = e^j(V) for V = (1, 1)
print(D, components)
`,
      answer: t`import numpy as np

def dual_basis(E):
    return np.linalg.inv(np.asarray(E, float))

E = np.array([[1.0, 0.5],
              [0.0, np.sqrt(3) / 2]])
D = dual_basis(E)
components = D @ np.array([1.0, 1.0])
print(D, components)`,
      tests: [
        { name: t`$\mathbf e^j(\mathbf e_i) = \delta^j_i$: \`dual_basis(E) @ E\` is the identity`, code: 'np.allclose(dual_basis(E) @ E, np.eye(2))' },
        { name: t`the rows are $(1, -1/\sqrt3)$ and $(0, 2/\sqrt3)$`, code: 'np.allclose(dual_basis(E), [[1, -1/np.sqrt(3)], [0, 2/np.sqrt(3)]])' },
        { name: t`the components of $(1, 1)$ are $(1 - 1/\sqrt3,\ 2/\sqrt3)$`, code: 'components is not None and np.allclose(components, [1 - 1/np.sqrt(3), 2/np.sqrt(3)])' },
        { name: 'it works in three dimensions too', code: 'np.allclose(dual_basis([[1, 1, 0], [0, 1, 1], [1, 0, 1]]) @ np.array([[1, 1, 0], [0, 1, 1], [1, 0, 1]]), np.eye(3))' },
      ],
      hints: [t`The defining equations $\mathbf e^j(\mathbf e_i) = \delta^j_i$ say: (matrix of rows) @ E = identity.`, t`So the answer is \`np.linalg.inv(E)\`; the components are \`D @ V\`.`],
      teach: t`Computing a dual basis is inverting one matrix: the rows of $E^{-1}$ are the dual covectors.`,
      explain: t`\`np.linalg.inv(E)\` has rows $(1, -0.5774)$ and $(0, 1.1547)$; applied to $(1, 1)$ they give $(0.4226, 1.1547)$, the components of lesson A2.1. In three dimensions the same line works — no geometry needed, just $E^{-1}E = I$.`,
    }),
    num({
      id: 'expand', difficulty: 3,
      gen(r) {
        const E = r.pick(CASES);
        const row = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        const w = [row[0] * E[0][0] + row[1] * E[1][0], row[0] * E[0][1] + row[1] * E[1][1]];   // ω_j = ω(e_j)
        const j = r.pick([1, 2]);
        const wrong = row[j - 1];
        return {
          prompt: t`A covector acts on reference components as $\omega(x, y) = ${row[0]}x ${row[1] < 0 ? '-' : '+'} ${Math.abs(row[1])}y$. The basis arrows are the columns of $E = ${matTeX(E)}$. In the expansion $\omega = \omega_1\mathbf e^1 + \omega_2\mathbf e^2$, what is $\omega_${j}$?`,
          visual: still({ mode: 'covector', basis: cols(E), covector: w.map((x) => x * 0.5), vector: [0.01, 0.01], showVector: false, crossings: false, construction: false, grid: 'none' }, t`The stack of $\tfrac12\omega$ (teal) and the basis: $\omega_j$ is twice the number of lines $\mathbf e_j$ crosses.`),
          answer: w[j - 1], tol: { rel: 0, abs: 0.01 },
          errors: wrong !== w[j - 1] ? [{ value: wrong, feedback: t`That is a reference component of $\omega$. Its component in this basis is $\omega_${j} = \omega(\mathbf e_${j})$.` }] : [],
          hints: [t`$\omega_j = \omega(\mathbf e_j)$: feed $\omega$ the basis arrow.`, t`$\mathbf e_${j} = (${E[0][j - 1]}, ${E[1][j - 1]})$.`],
          teach: 'A covector’s components in a basis are its values on the basis vectors; the dual covectors then rebuild it.',
          explain: t`$\omega_${j} = \omega(${E[0][j - 1]}, ${E[1][j - 1]}) = ${row[0]}(${E[0][j - 1]}) + ${row[1]}(${E[1][j - 1]}) = ${w[j - 1]}$. With $\omega_1 = ${w[0]}$ and $\omega_2 = ${w[1]}$, the sum $\omega_j\mathbf e^j$ (rows of $E^{-1}$) gives back $(${row.join(', ')})$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dual', difficulty: 2,
      gen(r) {
        const E = r.pick(CASES), Ei = inv2(E), j = r.pick([1, 2]), V = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])];
        let val = Ei[j - 1][0] * V[0] + Ei[j - 1][1] * V[1];
        if (Math.abs(val) < 1e-9) { V[1] += V[1] === -1 ? 2 : 1; val = Ei[j - 1][0] * V[0] + Ei[j - 1][1] * V[1]; }
        return {
          prompt: t`The basis arrows are the columns of $E = ${matTeX(E)}$ in reference components. Find $V^${j} = \mathbf e^${j}(\mathbf V)$ for $\mathbf V = (${V.join(', ')})$.`,
          visual: dualPic(cols(E), V, 'The basis, its dual stacks and the arrow.'),
          answer: val, tol: { rel: 0.005, abs: 0.002 },
          hints: [t`$\mathbf e^${j}$ is row ${j} of $E^{-1}$.`],
          teach: 'Components are the dual covectors applied to the vector.',
          explain: t`$E^{-1} = ${matTeX(Ei.map((row) => row.map(fr)))}$, so $V^${j} = ${fr(Ei[j - 1][0])}\cdot(${V[0]}) + ${fr(Ei[j - 1][1])}\cdot(${V[1]}) = ${fr(val)}$.`,
        };
      },
    }),
    num({
      id: 'cp-crystal', difficulty: 3, transfer: true,
      gen(r) {
        const [name, a] = r.pick([['graphene', 0.246], ['hexagonal boron nitride', 0.250], ['the basal plane of graphite', 0.2464]]);
        // a₁ = a(1, 0), a₂ = a(½, √3/2): the dual covector b¹ = (1/a)(1, −1/√3); its lines are a√3/2 apart
        const d = (a * S3) / 2;
        return {
          prompt: t`In ${name}, the lattice is spanned by $\mathbf a_1 = a\,(1, 0)$ and $\mathbf a_2 = a\,(\tfrac12, \tfrac{\sqrt3}{2})$ with $a = ${a}$ nm. Crystallographers call the dual basis, $\mathbf b^j(\mathbf a_i) = \delta^j_i$, the reciprocal lattice (physicists often add a factor $2\pi$). The lines of $\mathbf b^1$ are a family of lattice planes. Using an ordinary ruler on the page, how far apart are they, in nm?`,
          visual: still({ mode: 'vector', basis: [[1, 0], [0.5, r6(S3 / 2)]], names: ['a₁', 'a₂'], dualNames: ['b¹', 'b²'], vector: [0.01, 0.01], showVector: false, dual: true, construction: false, grid: 'none' }, t`The lattice vectors (in units of $a$) and the dual stacks $\mathbf b^1$ (blue) and $\mathbf b^2$ (violet). Their lines pass through rows of atoms.`),
          answer: d, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: a, feedback: t`That is the lattice spacing along $\mathbf a_1$. The $\mathbf b^1$ lines run parallel to $\mathbf a_2$, so their perpendicular spacing is shorter: $a\sin60^\circ$.` }, { value: 1 / a, feedback: t`$1/a$ is not a length. The spacing is $1/|\mathbf b^1|$, measured with the ruler.` }],
          hints: [t`$\mathbf b^1$ is row 1 of $E^{-1}$ with $E = a\begin{pmatrix} 1 & \tfrac12 \\ 0 & \tfrac{\sqrt3}{2} \end{pmatrix}$: $\mathbf b^1 = \tfrac1a(1, -\tfrac1{\sqrt3})$.`, t`Lines $\mathbf b^1(x, y) = k$ are $1/|\mathbf b^1|$ apart when measured perpendicular to them with an ordinary ruler — the ruler is the metric here.`],
          teach: 'A dual covector’s stack is a family of lattice planes; measuring their spacing (unlike counting them) needs the metric.',
          explain: t`$|\mathbf b^1| = \tfrac1a\sqrt{1 + \tfrac13} = \tfrac{2}{\sqrt3\,a}$, so the planes are $\tfrac{\sqrt3}{2}a = ${nice(d, 4)}$ nm apart — the spacing X-ray diffraction measures for these planes (Bragg’s law then fixes the reflection angle). Counting how many planes a displacement crosses needs no ruler; their spacing in nanometres does.`,
        };
      },
    }),
    mcq({
      id: 'cp-coordinate', difficulty: 2,
      prompt: t`In the coordinate basis $\partial_x, \partial_y$ of a plane, what is the dual basis?`,
      visual: dualPic([[1, 0], [0, 1]], [1.4, 0.8], t`The coordinate basis of Cartesian axes and its dual stacks: the lines $x = $ const and $y = $ const.`),
      choices: [t`$dx$ and $dy$`, t`$\partial_y$ and $\partial_x$`, t`$x$ and $y$`, t`$\partial_x$ and $\partial_y$ themselves`],
      answer: 0,
      why: {
        1: 'Dual basis members are covectors, not vectors.',
        2: 'x and y are functions; their differentials are the covectors.',
        3: 'A basis cannot be its own dual: the dual lives among the covectors.',
      },
      hints: [t`Which covectors satisfy $\omega^\mu(\partial_\nu) = \delta^\mu_\nu$? Recall lesson A3.2.`],
      teach: t`The dual of a coordinate basis $\partial_\mu$ is the basis of differentials $dx^\mu$.`,
      explain: t`$dx^\mu(\partial_\nu) = \partial_\nu x^\mu = \delta^\mu_\nu$: exactly the defining property. That is why a covector field is written $\omega = \omega_\mu\,dx^\mu$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (dual vectors and the dual basis)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §3.3 (basis one-forms)', url: 'https://www.cambridge.org/9780521887052' },
    { label: 'Kittel, Introduction to Solid State Physics, ch. 2 (the reciprocal lattice)', url: 'https://www.wiley.com/en-us/Introduction+to+Solid+State+Physics%2C+8th+Edition-p-9780471415268' },
  ],
});
