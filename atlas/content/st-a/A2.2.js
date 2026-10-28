// How components change when the basis changes: if the new basis is built
// from the old one with a matrix A, components change with A⁻¹ — they are
// "contravariant".
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, frac } from '../../src/core/format.js';
import { still, turned, r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const SQ = [[1, 0], [0, 1]];
const vecTeX = (a) => `(${a.join(',\\ ')})`;
const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const inv2 = (A) => { const d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; };
const mv = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
const cols = (A) => [[A[0][0], A[1][0]], [A[0][1], A[1][1]]];     // the new basis arrows, in old (perpendicular unit) components
const fr = (x) => (Number.isInteger(x) ? String(x) : frac(x));

// a 2×2 integer matrix with a small nonzero determinant, and a vector whose new components are not 0
function pickCase(r) {
  const opts = [[[1, -1], [1, 2]], [[2, 1], [1, 1]], [[1, 1], [0, 2]], [[2, 0], [1, 1]], [[1, 2], [-1, 1]], [[3, 1], [1, 1]], [[1, -1], [2, 1]]];
  for (let k = 0; k < 40; k++) {
    const A = r.pick(opts), V = [r.intExcept(-3, 4, [0]), r.intExcept(-3, 4, [0])];
    const Vn = mv(inv2(A), V);
    if (Vn.every((x) => Math.abs(x) > 1e-9 && Math.abs(x) < 6)) return { A, V, Vn };
  }
  return { A: [[1, -1], [1, 2]], V: [4, 1], Vn: [3, -1] };
}

export default lesson({
  id: 'st-a.A2.2',
  title: 'How components change when the basis changes',
  minutes: 11, difficulty: 2,
  intro: t`Describe a new basis by its arrows’ components in the old one: $\mathbf e'_j = A^i{}_j\,\mathbf e_i$, so **column $j$ of the matrix $A$ holds the old components of the new arrow $\mathbf e'_j$**. The arrow itself does not care: $\mathbf V = V^i\mathbf e_i = V'^j\mathbf e'_j = V'^jA^i{}_j\,\mathbf e_i$. Comparing the two ends, $V^i = A^i{}_jV'^j$, and so

$$V'^j = (A^{-1})^j{}_i\,V^i$$

The components change with the **inverse** of the matrix that changed the basis. Make the basis arrows 1000 times longer (metres to kilometres) and the components become 1000 times smaller; turn the basis one way and the components turn the other. Because they go *against* the basis, vector components are called **contravariant**, and they carry upper indices.`,
  symbols: [
    { tex: t`\mathbf e_i,\ \mathbf e'_j`, text: 'the old and the new basis arrows' },
    { tex: t`A^i{}_j`, text: t`the change-of-basis matrix: $\mathbf e'_j = A^i{}_j\mathbf e_i$. Row $i$, column $j$; column $j$ lists the old components of $\mathbf e'_j$` },
    { tex: t`(A^{-1})^j{}_i`, text: t`the inverse matrix, with $(A^{-1})^j{}_iA^i{}_k = \delta^j_k$` },
    { tex: t`V^i,\ V'^j`, text: 'the components of one and the same arrow in the old and the new basis' },
  ],
  why: t`Every transformation law in relativity is this one in disguise: a coordinate change is a change of basis at each point, and the Jacobian matrix will play the role of $A$ (lesson A4.2).`,
  visual: {
    type: 'ten-basis',
    title: 'Old basis, new basis, one arrow',
    lead: t`The faint dashed arrows are the old basis $\mathbf e_1, \mathbf e_2$; drag the bold new basis $\mathbf e'_1, \mathbf e'_2$. The readout gives the arrow’s old and new components, the matrix $A$ whose columns are the new arrows in old components, and its inverse — which is what turns old components into new.`,
    tasks: [
      t`Drag $\mathbf e'_1$ out to twice the length of $\mathbf e_1$: $A$ gets a 2 in its corner, $A^{-1}$ a ½, and $V'^1 = \tfrac12V^1$.`,
      t`Check one entry by hand: $V'^1 = (A^{-1})^1{}_1V^1 + (A^{-1})^1{}_2V^2$.`,
      t`Turn both new arrows by the same angle, keeping them perpendicular and one grid square long: $A$ is a rotation, and $A^{-1}$ rotates the other way.`,
    ],
    params: { mode: 'vector', basis: [[1.3, 0.4], [-0.4, 1.1]], ghost: SQ, dragBasis: true, vector: [2.2, 1.4], dragVector: false, readout: ['V', 'Vold', 'A'], view: 2.4 },
    caption: t`The old basis is perpendicular and one unit long; tips snap to a 0.1 grid. The dashed parallelogram builds the arrow from the *new* basis.`,
  },
  example: {
    prompt: t`The old basis is perpendicular and unit. The new one is $\mathbf e'_1 = \mathbf e_1 + \mathbf e_2$ and $\mathbf e'_2 = -\mathbf e_1 + 2\mathbf e_2$. An arrow has old components $V^i = (4, 1)$. Find its new components.`,
    visual: still({ basis: [[1, 1], [-1, 2]], ghost: SQ, vector: [4, 1], construction: true, grid: 'none' }, t`Old basis faint, new basis bold, and the arrow $(4, 1)$ built from the new basis: $3\mathbf e'_1 - \mathbf e'_2$.`),
    steps: [
      { label: 'Write A', text: t`Columns are the new arrows in old components: $A = \begin{pmatrix} 1 & -1 \\ 1 & 2 \end{pmatrix}$.` },
      { label: 'Invert it', text: t`$\det A = 1\cdot2 - (-1)\cdot1 = 3$, so $A^{-1} = \tfrac13\begin{pmatrix} 2 & 1 \\ -1 & 1 \end{pmatrix}$.` },
      { label: 'Transform', text: t`$V'^j = (A^{-1})^j{}_iV^i$: $V'^1 = \tfrac13(2\cdot4 + 1\cdot1) = 3$ and $V'^2 = \tfrac13(-1\cdot4 + 1\cdot1) = -1$.` },
      { label: 'Check', text: t`Rebuild: $3\mathbf e'_1 - \mathbf e'_2 = 3(1, 1) - (-1, 2) = (4, 1)$ in old components. ✓ Using $A$ instead of $A^{-1}$ would give $AV = (3, 6)$, and $3\mathbf e'_1 + 6\mathbf e'_2 = (-3, 15)$ — a different arrow.` },
    ],
    answer: t`$V'^j = (3, -1)$: the arrow is $3\mathbf e'_1 - \mathbf e'_2$.`,
  },
  practice: [
    num({
      id: 'units', difficulty: 1,
      gen(r) {
        const [unit, len, word] = r.pick([['km', 1000, 'kilometre'], ['nmi', 1852, 'nautical mile'], ['ft', 0.3048, 'foot']]);
        const d = r.pick([2500, 4630, 9144, 12000]);
        const ans = d / len;
        return {
          prompt: t`A displacement is ${d} m due east. In a basis whose east arrow is 1 m long, its east component is $V^1 = ${d}$. What is the component $V'^1$ in a basis whose east arrow is one ${word} (${unit}) long, $${len}$ m?`,
          visual: still({ basis: [[1.6, 0], [0, 1]], ghost: [[0.6, 0], [0, 1]], ghostNames: ['short e₁', ''], names: ['long e′₁', 'e₂'], vector: [2.6, 0.001], construction: false, grid: 'none' }, 'Schematic: a short basis arrow (faint) and a long one (bold) along one displacement. The longer the basis arrow, the fewer of them fit.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: d * len, feedback: 'Multiplying would mean more of the longer arrows fit — the opposite of what happens. Divide.' }],
          hints: [t`The new basis arrow is $\mathbf e'_1 = ${len}\,\mathbf e_1$: $A = ${len}$.`, t`Components go with $A^{-1}$: divide by ${len}.`],
          teach: 'Making the basis arrows longer makes the components smaller by the same factor: contravariance.',
          explain: t`$\mathbf e'_1 = ${len}\,\mathbf e_1$, so $V'^1 = V^1/${len} = ${nice(ans, 4)}$ ${unit}. The displacement is unchanged; only the count of basis arrows changed.`,
        };
      },
    }),
    num({
      id: 'scaled', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 0.5, 4]), b = r.pick([3, 0.25, 2]), V = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])];
        const which = r.pick([1, 2]);
        const ans = which === 1 ? V[0] / a : V[1] / b;
        return {
          prompt: t`The new basis is $\mathbf e'_1 = ${a}\,\mathbf e_1$ and $\mathbf e'_2 = ${b}\,\mathbf e_2$. An arrow has old components $V^i = ${vecTeX(V)}$. What is $V'^${which}$?`,
          visual: still({ basis: [[a, 0], [0, b]], ghost: SQ, vector: V, construction: true, grid: 'none' }, 'Old basis (faint) and the stretched or shrunk new basis (bold), with the arrow built from the new one.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: which === 1 ? V[0] * a : V[1] * b, feedback: t`That multiplies by $A$. Components transform with $A^{-1}$: divide by the stretch.` }].filter((e) => Math.abs(e.value - ans) > 1e-9),
          hints: [t`$A = \begin{pmatrix} ${a} & 0 \\ 0 & ${b} \end{pmatrix}$; its inverse has $1/${a}$ and $1/${b}$ on the diagonal.`],
          teach: 'Stretch a basis arrow by a factor and its component shrinks by the same factor.',
          explain: t`$V'^${which} = V^${which}/${which === 1 ? a : b} = ${nice(ans)}$. Check: $V'^${which}\mathbf e'_${which} = ${nice(ans)}\times${which === 1 ? a : b}\,\mathbf e_${which} = ${V[which - 1]}\,\mathbf e_${which}$. ✓`,
        };
      },
    }),
    num({
      id: 'general', difficulty: 2,
      gen(r) {
        const { A, V, Vn } = pickCase(r);
        const which = r.pick([1, 2]);
        const wrong = mv(A, V)[which - 1];
        return {
          prompt: t`The new basis arrows, in old components, are the columns of $A = ${matTeX(A)}$ (so $\mathbf e'_j = A^i{}_j\mathbf e_i$). An arrow has old components $V^i = ${vecTeX(V)}$. Find $V'^${which}$.`,
          visual: still({ basis: cols(A), ghost: SQ, vector: V, construction: false, grid: 'none' }, 'The old basis (faint), the new basis (bold) and the arrow.'),
          answer: Vn[which - 1], tol: { rel: 0.005, abs: 0.005 },
          errors: Math.abs(wrong - Vn[which - 1]) > 0.01 ? [{ value: wrong, feedback: t`That is $A^i{}_jV^j$: the basis matrix itself. Components need its inverse.` }] : [],
          hints: [t`$V'^j = (A^{-1})^j{}_iV^i$. For a $2\times2$ matrix, $A^{-1} = \frac{1}{\det A}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$.`, t`$\det A = ${A[0][0] * A[1][1] - A[0][1] * A[1][0]}$ and $A^{-1} = ${matTeX(inv2(A).map((row) => row.map(fr)))}$.`],
          teach: 'New components are the inverse of the basis matrix applied to the old components.',
          explain: t`$V' = A^{-1}V = ${vecTeX(Vn.map((x) => fr(+x.toFixed(9))))}$. Check: $${fr(+Vn[0].toFixed(9))}\,\mathbf e'_1 + ${Vn[1] < 0 ? `(${fr(+Vn[1].toFixed(9))})` : fr(+Vn[1].toFixed(9))}\,\mathbf e'_2 = ${vecTeX(V)}$ in old components.`,
        };
      },
    }),
    mcq({
      id: 'which-matrix', difficulty: 2,
      prompt: t`If $\mathbf e'_j = A^i{}_j\,\mathbf e_i$, how do the components of a fixed arrow change?`,
      visual: still({ basis: [[1.5, 0.5], [-0.4, 1]], ghost: SQ, vector: [2, 1.6], construction: true, grid: 'none' }, 'A fixed arrow, the old basis (faint) and a new basis (bold).'),
      choices: [t`$V'^j = (A^{-1})^j{}_i\,V^i$`, t`$V'^j = A^j{}_i\,V^i$`, t`$V'^j = A^i{}_j\,V^i$ (the transpose)`, t`$V'^j = V^j$: an arrow’s components never change`],
      answer: 0,
      why: {
        1: 'That transforms the components the same way as the basis; then V′^j e′_j would be a different arrow.',
        2: t`The transpose is the inverse only for rotations; for a stretched or skewed basis it gives the wrong arrow.`,
        3: 'The arrow does not change; its components must, because the basis did.',
      },
      hints: [t`Substitute $\mathbf e'_j = A^i{}_j\mathbf e_i$ into $\mathbf V = V'^j\mathbf e'_j$ and compare with $\mathbf V = V^i\mathbf e_i$.`],
      teach: t`Components transform with the inverse of the basis matrix, so that $V'^j\mathbf e'_j = V^i\mathbf e_i$.`,
      explain: t`$V'^j\mathbf e'_j = V'^jA^i{}_j\mathbf e_i$ must equal $V^i\mathbf e_i$, so $V^i = A^i{}_jV'^j$ and $V' = A^{-1}V$.`,
    }),
    num({
      id: 'backwards', difficulty: 2,
      gen(r) {
        const { A, V, Vn } = pickCase(r);
        const which = r.pick([1, 2]);
        const VnI = Vn.map((x) => +x.toFixed(6));
        const wrong = mv(inv2(A), VnI)[which - 1];
        return {
          prompt: t`With $\mathbf e'_j = A^i{}_j\mathbf e_i$ and $A = ${matTeX(A)}$, an arrow has new components $V'^j = ${vecTeX(VnI.map(fr))}$. What is its old component $V^${which}$?`,
          visual: still({ basis: cols(A), ghost: SQ, vector: V, construction: true, grid: 'none' }, 'The arrow built from the new basis (bold); the old basis is faint.'),
          answer: V[which - 1], tol: { rel: 0.005, abs: 0.005 },
          errors: Math.abs(wrong - V[which - 1]) > 0.01 ? [{ value: wrong, feedback: t`Going back from new to old components uses $A$ itself: $V^i = A^i{}_jV'^j$.` }] : [],
          hints: [t`$\mathbf V = V'^j\mathbf e'_j = V'^jA^i{}_j\mathbf e_i$, so $V^i = A^i{}_jV'^j$.`],
          teach: 'Old components from new: apply A itself — just rebuild the arrow from the new basis.',
          explain: t`$V^${which} = A^${which}{}_1V'^1 + A^${which}{}_2V'^2 = (${A[which - 1][0]})(${fr(VnI[0])}) + (${A[which - 1][1]})(${fr(VnI[1])}) = ${V[which - 1]}$.`,
        };
      },
    }),
    code({
      id: 'new-components', difficulty: 2,
      prompt: t`Write \`new_components(A, V)\` that returns the components $V'^j$ of an arrow in the basis $\mathbf e'_j = A^i{}_j\mathbf e_i$, given its old components \`V\`. Solve $A\,V' = V$ with \`np.linalg.solve\` (better than forming the inverse). Then check the worked example: \`A = [[1, -1], [1, 2]]\`, \`V = [4, 1]\`.`,
      visual: still({ basis: [[1, 1], [-1, 2]], ghost: SQ, vector: [4, 1], construction: true, grid: 'none' }, t`The worked example: the arrow $(4, 1)$ is $3\mathbf e'_1 - \mathbf e'_2$.`),
      starter: t`import numpy as np

def new_components(A, V):
    # A: the new basis arrows as columns (old components); V: old components
    pass

A = np.array([[1.0, -1.0], [1.0, 2.0]])
V = np.array([4.0, 1.0])
print(new_components(A, V))
`,
      answer: t`import numpy as np

def new_components(A, V):
    return np.linalg.solve(np.asarray(A, float), np.asarray(V, float))

A = np.array([[1.0, -1.0], [1.0, 2.0]])
V = np.array([4.0, 1.0])
print(new_components(A, V))`,
      tests: [
        { name: 'the worked example gives (3, −1)', code: 'np.allclose(new_components([[1, -1], [1, 2]], [4, 1]), [3, -1])' },
        { name: 'kilometre arrows: 2500 m east becomes 2.5', code: 'np.allclose(new_components([[1000, 0], [0, 1000]], [2500, 0]), [2.5, 0])' },
        { name: t`a basis turned $30^\circ$ turns the components back by $30^\circ$`, code: 'np.allclose(new_components([[np.cos(np.pi/6), -np.sin(np.pi/6)], [np.sin(np.pi/6), np.cos(np.pi/6)]], [1, 0]), [np.cos(np.pi/6), -np.sin(np.pi/6)])' },
        { name: t`rebuilding $V'^j\mathbf e'_j$ gives the old components back`, code: 'np.allclose(np.array([[2., 1.], [1., 3.]]) @ new_components([[2, 1], [1, 3]], [1, 7]), [1, 7])' },
      ],
      hints: [t`$V^i = A^i{}_jV'^j$ is the linear system \`A @ Vp = V\`.`, t`\`return np.linalg.solve(A, V)\` (convert to float arrays first if you like).`],
      teach: 'Changing basis is solving one linear system: A V′ = V.',
      explain: t`\`np.linalg.solve(A, V)\` returns $A^{-1}V$ without forming $A^{-1}$. The tests cover a skewed basis, a change of units and a rotation — all the same rule.`,
    }),
    mcq({
      id: 'transposed', difficulty: 3, kind: 'error',
      prompt: t`A student changes from a perpendicular unit basis to $\mathbf e'_1 = 2\mathbf e_1$, $\mathbf e'_2 = \mathbf e_1 + \mathbf e_2$, so $A = \begin{pmatrix} 2 & 1 \\ 0 & 1 \end{pmatrix}$. For the arrow $V^i = (3, 1)$ they compute $V' = AV = (7, 1)$. What went wrong, and what is right?`,
      visual: still({ basis: [[2, 0], [1, 1]], ghost: SQ, vector: [3, 1], construction: true, grid: 'none' }, t`The arrow $(3, 1)$ built from the new basis: one $\mathbf e'_1$ and one $\mathbf e'_2$.`),
      choices: [
        t`They used $A$ instead of $A^{-1}$; the right answer is $V' = (1, 1)$`,
        t`Nothing — $V' = (7, 1)$ is right`,
        t`They should have used the transpose: $V' = (6, 4)$`,
        t`They should have divided each component by the length of the new arrow: $V' = (1.5, 0.71)$`,
      ],
      answer: 0,
      why: {
        1: t`Rebuild it: $7\mathbf e'_1 + 1\mathbf e'_2 = (14, 0) + (1, 1) = (15, 1)$, not $(3, 1)$.`,
        2: t`$A^\mathsf{T}V = (6, 4)$ rebuilds to $(16, 4)$; the transpose is the inverse only for rotations.`,
        3: 'Dividing by lengths works only when the new arrows point along the old ones; here e′₂ is tilted.',
      },
      hints: ['Test their answer: rebuild the arrow from it.', t`Solve $A\,V' = V$: $2V'^1 + V'^2 = 3$ and $V'^2 = 1$.`],
      teach: t`Always check a change of components by rebuilding the arrow: $V'^j\mathbf e'_j$ must equal $V^i\mathbf e_i$.`,
      explain: t`$V^2 = V'^2 = 1$ and $V^1 = 2V'^1 + V'^2 = 3$ give $V' = (1, 1)$: indeed $\mathbf e'_1 + \mathbf e'_2 = (2, 0) + (1, 1) = (3, 1)$. ✓`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-general', difficulty: 2,
      gen(r) {
        const { A, V, Vn } = pickCase(r);
        const which = r.pick([1, 2]);
        return {
          prompt: t`With $\mathbf e'_j = A^i{}_j\mathbf e_i$ and $A = ${matTeX(A)}$, an arrow has old components $${vecTeX(V)}$. Find $V'^${which}$.`,
          visual: still({ basis: cols(A), ghost: SQ, vector: V, construction: false, grid: 'none' }, 'Old basis faint, new basis bold.'),
          answer: Vn[which - 1], tol: { rel: 0.005, abs: 0.005 },
          hints: [t`$V' = A^{-1}V$.`],
          teach: 'Components transform with the inverse of the basis matrix.',
          explain: t`$A^{-1} = ${matTeX(inv2(A).map((row) => row.map(fr)))}$, so $V' = ${vecTeX(Vn.map((x) => fr(+x.toFixed(9))))}$.`,
        };
      },
    }),
    num({
      id: 'cp-runway', difficulty: 3, transfer: true,
      gen(r) {
        const which = r.pick(['along', 'left']);
        let hdg, E, N, th, along, across, ans;
        for (let k = 0; k < 40; k++) {               // keep the asked component well away from 0
          hdg = r.pick([30, 60, 120, 240]); E = r.pick([4.2, 5.5, 3.1]); N = r.pick([1.5, -2.0, 2.6]);
          th = (90 - hdg) * DEG;                     // the runway direction, anticlockwise from east
          along = (E * Math.cos(th) + N * Math.sin(th)) / 1.852;
          across = (-E * Math.sin(th) + N * Math.cos(th)) / 1.852;
          ans = which === 'along' ? along : across;
          if (Math.abs(ans) > 0.3) break;
        }
        return {
          prompt: t`An aircraft is ${E} km east and ${Math.abs(N)} km ${N > 0 ? 'north' : 'south'} of a runway threshold. Approach control uses a basis of two arrows each one nautical mile ($1852$ m) long: $\mathbf e'_1$ along the runway heading of $${String(hdg).padStart(3, '0')}^\circ$ (measured clockwise from north) and $\mathbf e'_2$ at right angles, to its left. What is the aircraft’s ${which === 'along' ? t`along-runway component $V'^1$` : t`left component $V'^2$`}, in nautical miles?`,
          visual: still({ basis: turned(90 - hdg).map((e) => e.map((x) => x * 1.2)), ghost: SQ, ghostNames: ['east', 'north'], names: ['runway', 'left'], vector: [E * 0.5, N * 0.5].map(r6), vname: 'aircraft', construction: true, grid: 'none' }, t`East–north basis (faint, 1 km) and the runway basis (bold, 1 nmi); the aircraft’s position drawn at half scale.`),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: ans * 1.852, feedback: 'That is in kilometres: the new basis arrows are 1.852 km long, so divide by 1.852.' }, { value: ans * 1.852 * 1.852, feedback: 'The change of units divides by 1.852; it does not multiply.' }],
          hints: [t`Two changes at once: turn to runway axes, then shrink the count because each arrow is 1.852 km.`, t`In km, the along-runway part is $E\sin(\text{heading}) + N\cos(\text{heading})$ and the left part is $-E\cos(\text{heading}) + N\sin(\text{heading})$; then divide by 1.852.`],
          teach: 'A change to turned, longer basis arrows combines both rules: components turn back and shrink.',
          explain: t`Measured anticlockwise from east, the runway direction is $90^\circ - ${hdg}^\circ = ${90 - hdg}^\circ$. Along it: $${E}\cos(${90 - hdg}^\circ) + (${N})\sin(${90 - hdg}^\circ) = ${nice(along * 1.852)}$ km $= ${nice(along)}$ nmi; to the left: $-${E}\sin(${90 - hdg}^\circ) + (${N})\cos(${90 - hdg}^\circ) = ${nice(across * 1.852)}$ km $= ${nice(across)}$ nmi.`,
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: 'Every basis arrow is replaced by one twice as long, pointing the same way. What happens to the components of a fixed arrow?',
      visual: still({ basis: [[2, 0], [0, 2]], ghost: SQ, vector: [2.4, 1.6], construction: true, grid: 'none' }, 'The old basis (faint) and the doubled basis (bold).'),
      choices: ['They all halve', 'They all double', 'They stay the same', 'They are squared'],
      answer: 0,
      why: { 1: 'That is how the basis changed; the components go the other way.', 2: 'The arrow is the same, so with longer arrows you need fewer of them.', 3: 'The rule is linear: a factor of 2 in the basis is a factor ½ in the components.' },
      hints: [t`$A = 2\delta$, so $A^{-1} = \tfrac12\delta$.`],
      teach: 'Components scale opposite to the basis arrows.',
      explain: t`$V'^j\,(2\mathbf e_j) = V^j\mathbf e_j$ requires $V'^j = \tfrac12V^j$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (how basis vectors and components transform)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Schutz, A First Course in General Relativity (2nd ed.), §2.3 (basis vectors and the transformation of components)', url: 'https://www.cambridge.org/9780521887052' },
  ],
});
