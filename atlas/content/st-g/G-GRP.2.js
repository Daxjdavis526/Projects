// Representations: a group acting by matrices, ρ(g∘h) = ρ(g)ρ(h). D₃ ≅ S₃ in
// the trivial, sign, 2-dimensional (rotation and reflection matrices) and
// 3-dimensional permutation representations; characters tr ρ(g), unchanged by
// a change of basis; the permutation representation split as trivial ⊕ 2D
// (the line (1, 1, 1) and the plane x + y + z = 0), checked by characters;
// irreducibility (ρ(r) has no real eigen-line); C_n in one complex dimension.
// Physics: a field's type is a representation — (0,2) tensors split as
// trace ⊕ antisymmetric ⊕ symmetric traceless. Code: verify the 2D
// representation of S₃ and the orthogonality of its characters. Transfers:
// gravitational-wave polarizations D(D − 3)/2 as a symmetric traceless count,
// and an attitude matrix's rotation angle from its character.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { r6 } from './_sg3.js';

const t = String.raw;
const c120 = r6(Math.cos((2 * Math.PI) / 3)), s120 = r6(Math.sin((2 * Math.PI) / 3));
const RHO_R = [[c120, -s120], [s120, c120]], RHO_F = [[-1, 0], [0, 1]];

// a triangle with numbered corners and an anticlockwise arrow
const triangleWithR = () => ({
  type: 'graph',
  params: {
    x: [-2.6, 2.6], y: [-1.15, 1.45], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false,
    curves: [0, 1, 2].map((k) => { const a = Math.PI / 2 + (2 * Math.PI * k) / 3, b = a + (2 * Math.PI) / 3; return { param: [`${r6(Math.cos(a))} + t*${r6(Math.cos(b) - Math.cos(a))}`, `${r6(Math.sin(a))} + t*${r6(Math.sin(b) - Math.sin(a))}`], t: [0, 1], color: 'ink3', width: 2 }; }).concat([{ param: ['1.35*cos(t)', '1.35*sin(t)'], t: [0.4, 1.9], color: 'gold', width: 2 }]),
    arrows: [{ from: [r6(1.35 * Math.cos(1.75)), r6(1.35 * Math.sin(1.75))], to: [r6(1.35 * Math.cos(1.95)), r6(1.35 * Math.sin(1.95))], color: 'gold', width: 2, label: 'r: 120°', labelDx: -60, labelDy: -6 }],
    points: [0, 1, 2].map((k) => ({ x: r6(Math.cos(Math.PI / 2 + (2 * Math.PI * k) / 3)), y: r6(Math.sin(Math.PI / 2 + (2 * Math.PI * k) / 3)), r: 6, color: ['accent', 'gold', 'teal'][k], label: String(k + 1) })),
  },
  caption: 'The triangle centred on the origin, corner 1 on the positive y-axis; r turns it 120° anticlockwise.',
});

// a permutation of 1..n as arrows from a top row to a bottom row
const permPic = (perm) => {
  const n = perm.length;
  return {
    type: 'graph',
    params: {
      x: [0.2, n + 0.8], y: [-0.35, 1.35], aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false,
      points: [...perm.map((_, i) => ({ x: i + 1, y: 1, r: 5, color: 'accent', label: String(i + 1), labelDx: -4, labelDy: -14 })), ...perm.map((_, i) => ({ x: i + 1, y: 0, r: 5, color: 'gold', label: String(i + 1), labelDx: -4, labelDy: 14 }))],
      arrows: perm.map((p, i) => ({ from: [i + 1, 0.93], to: [p, 0.07], color: 'ink3', width: 1.6 })),
    },
    caption: 'Each object i (top) is sent to the place σ(i) (bottom).',
  };
};

// Rodrigues rotation about a unit axis
const rotAbout = (n, th) => {
  const [x, y, z] = n, c = Math.cos(th), s = Math.sin(th), C = 1 - c;
  return [[c + x * x * C, x * y * C - z * s, x * z * C + y * s], [y * x * C + z * s, c + y * y * C, y * z * C - x * s], [z * x * C - y * s, z * y * C + x * s, c + z * z * C]];
};

export default lesson({
  id: 'st-g.G-GRP.2',
  title: 'Representations',
  minutes: 14, difficulty: 3,
  intro: t`A **representation** of a group $G$ on a vector space $V$ assigns to each element an invertible matrix, respecting composition:

$$\rho(g\circ h) = \rho(g)\,\rho(h), \qquad \chi_\rho(g) = \operatorname{tr}\rho(g)$$

One group has many representations. $D_3$, the triangle’s symmetries, acts on $\mathbb R$ trivially ($\rho = 1$) or by the sign ($\pm1$ for rotations and reflections), on the plane by $2\times2$ rotation and reflection matrices, and on $\mathbb R^3$ by permuting the three corners’ coordinates. The **character** $\chi_\rho$ does not change under a change of basis, so it labels a representation. A representation with no invariant subspace (other than $0$ and $V$) is **irreducible**; most decompose into irreducible pieces. In physics, *what kind of thing a field is* — scalar, vector, tensor, spinor — means which representation of the Lorentz group it carries.`,
  symbols: [
    { tex: '\\rho', text: t`a representation: a homomorphism $G \to GL(V)$, from the group to invertible linear maps of $V$` },
    { tex: 'V', text: t`the representation space; its dimension is the dimension of the representation` },
    { tex: '\\chi_\\rho(g)', text: t`the character: the trace of $\rho(g)$, the same in every basis` },
    { tex: 'GL(V)', text: t`all invertible linear maps of $V$` },
    { tex: '\\operatorname{tr}', text: 'the trace: the sum of the diagonal entries' },
  ],
  why: 'A field is classified by how it transforms: scalars, four-vectors, the metric and the Riemann tensor carry different representations of the Lorentz group, and spinors carry ones that exist only for its double cover.',
  visual: {
    type: 'la-map2d',
    title: 'A group acting by matrices',
    lead: t`The two matrices of the 2-dimensional representation of $D_3$: $F = \rho(f)$ reflects in the vertical axis and $R = \rho(r)$ turns by $120^\circ$. Step through the composition, then switch the order. The picture is the matrix product, read right to left.`,
    tasks: [
      t`Apply $F$, then $R$; then switch to the other order. The two “F” shapes end up mirrored differently: $RF \ne FR$, just as $r\circ f \ne f\circ r$ in the group. A representation copies the group’s multiplication table into matrices.`,
      t`Read the determinant: $\det(RF) = \det R\,\det F = (+1)(-1) = -1$, in either order. $g \mapsto \det\rho(g)$ is itself a representation — the one-dimensional sign representation, hiding inside the two-dimensional one.`,
    ],
    params: { maps: [{ name: 'F', A: RHO_F, label: 'F = ρ(f)' }, { name: 'R', A: RHO_R, label: 'R = ρ(r)' }], order: true, view: 2.2 },
    caption: t`Exact matrices: $\rho(r) = \begin{pmatrix} -\tfrac12 & -\tfrac{\sqrt3}{2} \\ \tfrac{\sqrt3}{2} & -\tfrac12\end{pmatrix}$, $\rho(f) = \begin{pmatrix} -1 & 0 \\ 0 & 1\end{pmatrix}$.`,
  },
  example: {
    prompt: t`$D_3 \cong S_3$ permutes the triangle’s corners, so it acts on $\mathbb R^3$ by permuting coordinates $(x_1, x_2, x_3)$: the **permutation representation**. Split it into irreducible pieces and check the split with characters.`,
    visual: { type: 'calc-vectors3d', params: { range: 1.5, vectors: [{ to: [1, 1, 1], color: 'gold', label: '(1,1,1)' }], planes: [{ normal: [1, 1, 1], d: 0, size: 1.6, color: 'violet', alpha: 0.22 }], yaw: 0.9, pitch: 0.35 }, caption: t`The line through $(1, 1, 1)$ and the plane $x_1 + x_2 + x_3 = 0$: permuting coordinates maps each to itself.` },
    steps: [
      { label: 'An invariant line', text: t`Permuting coordinates leaves $(1, 1, 1)$ unchanged. Its line is invariant, and on it every element acts as $1$: a copy of the **trivial** representation.` },
      { label: 'An invariant plane', text: t`Permuting coordinates does not change $x_1 + x_2 + x_3$, so the plane $x_1 + x_2 + x_3 = 0$ is invariant too. On it, a 3-cycle is a $120^\circ$ rotation and a swap is a reflection: the **2-dimensional** representation.` },
      { label: 'Characters of the whole', text: t`A permutation matrix has a $1$ on the diagonal for each fixed coordinate, so $\chi_{\text{perm}}$ is the number of fixed points: $3$ for $e$, $0$ for the rotations, $1$ for each reflection (a swap fixes one corner).` },
      { label: 'Characters of the pieces', text: t`Trivial: $1, 1, 1$. Two-dimensional: $\operatorname{tr} I = 2$; $\operatorname{tr}\rho(r) = 2\cos120^\circ = -1$; $\operatorname{tr}\rho(f) = -1 + 1 = 0$.` },
      { label: 'Check', text: t`$1 + 2 = 3$, $1 + (-1) = 0$, $1 + 0 = 1$: the characters add up exactly. A trace is a sum over a basis, so a direct sum’s character is the sum of its pieces’.` },
    ],
    answer: t`$\mathbb R^3 = \text{span}(1, 1, 1) \oplus \{x_1 + x_2 + x_3 = 0\}$: trivial $\oplus$ two-dimensional, with characters $(3, 0, 1) = (1, 1, 1) + (2, -1, 0)$ on $(e,\ \text{rotations},\ \text{reflections})$.`,
  },
  practice: [
    mcq({
      id: 'rho-r', difficulty: 1,
      prompt: t`In the 2-dimensional representation, $\rho(r)$ turns the plane $120^\circ$ **anticlockwise**. Which matrix is it?`,
      visual: triangleWithR(),
      choices: [t`$\begin{pmatrix} -\tfrac12 & -\tfrac{\sqrt3}{2} \\ \tfrac{\sqrt3}{2} & -\tfrac12\end{pmatrix}$`, t`$\begin{pmatrix} -\tfrac12 & \tfrac{\sqrt3}{2} \\ -\tfrac{\sqrt3}{2} & -\tfrac12\end{pmatrix}$`, t`$\begin{pmatrix} \tfrac12 & -\tfrac{\sqrt3}{2} \\ \tfrac{\sqrt3}{2} & \tfrac12\end{pmatrix}$`, t`$\begin{pmatrix} -\tfrac12 & \tfrac{\sqrt3}{2} \\ \tfrac{\sqrt3}{2} & \tfrac12\end{pmatrix}$`],
      answer: 0,
      why: {
        1: t`That turns clockwise: it is $\rho(r^2) = \rho(r)^{-1}$. Check where $e_1 = (1, 0)$ goes: its image, the first column, should be at $120^\circ$, up and to the left.`,
        2: t`That is the rotation by $60^\circ$: $\cos60^\circ = +\tfrac12$.`,
        3: t`Its determinant is $-\tfrac14 - \tfrac34 = -1$: a reflection, not a rotation.`,
      },
      hints: [t`The columns are the images of $e_1$ and $e_2$.`, t`$e_1 = (1, 0)$ turned $120^\circ$ anticlockwise is $(\cos120^\circ, \sin120^\circ)$.`],
      teach: t`A rotation by $\theta$ is $\begin{pmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{pmatrix}$: its columns are where the basis vectors go.`,
      explain: t`First column $(\cos120^\circ, \sin120^\circ) = (-\tfrac12, \tfrac{\sqrt3}{2})$, second $(-\sin120^\circ, \cos120^\circ)$. And $\rho(r)^3 = \rho(r^3) = \rho(e) = I$, as a representation must.`,
    }),
    num({
      id: 'character', difficulty: 2,
      gen(r) {
        const perm = r.pick([[2, 1, 3, 5, 4], [1, 3, 2, 4, 5], [2, 3, 1, 4, 5], [1, 2, 3, 5, 4], [3, 2, 1, 4, 5], [2, 3, 4, 5, 1], [1, 2, 4, 5, 3], [5, 2, 3, 4, 1]]);
        const ans = perm.filter((p, i) => p === i + 1).length;
        return {
          prompt: t`$S_5$ permutes five objects, and so acts on $\mathbb R^5$ by permuting coordinates. For the permutation $\sigma$ shown, what is the character $\chi(\sigma) = \operatorname{tr}\rho(\sigma)$ of its $5\times5$ permutation matrix?`,
          visual: permPic(perm),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: 5 - ans, feedback: 'That counts the objects that move. The diagonal entry is 1 for an object that stays put.' }, { value: 5, feedback: 'That is χ(e), the dimension. Only fixed objects put a 1 on the diagonal.' }].filter((e) => e.value !== ans),
          hints: [t`$\rho(\sigma)$ has a $1$ in row $\sigma(i)$, column $i$. Which of those are on the diagonal?`, 'Count the objects with σ(i) = i.'],
          teach: 'The character of a permutation representation counts fixed points: only an object that stays put puts a 1 on the diagonal.',
          explain: t`$${ans}$ object${ans === 1 ? '' : 's'} stay${ans === 1 ? 's' : ''} put, so $\chi(\sigma) = ${ans}$. Characters are constant on classes of “the same kind” of permutation (same cycle shape), whatever the labels.`,
        };
      },
    }),
    num({
      id: 'one-dim', difficulty: 2,
      gen(r) {
        const n = r.pick([5, 6, 8, 12]);
        let m, k;
        do { m = r.int(1, n - 1); k = r.int(2, n - 1); } while ((m * k) % n === 0);
        const raw = (360 * m * k) / n, ans = raw % 360;
        return {
          prompt: t`$C_{${n}}$, the rotations of a regular ${n}-gon, has one-dimensional complex representations $\rho_m(r^k) = e^{2\pi i\,mk/${n}}$. For $m = ${m}$, $\rho_m(r^{${k}})$ is a unit complex number. What is its angle, in degrees between $0$ and $360$?`,
          visual: { type: 'graph', params: { x: [-2.4, 2.4], y: [-1.2, 1.2], equal: true, aspect: 'wide', xlabel: 'Re', ylabel: 'Im', curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2 }], points: Array.from({ length: n }, (_, j) => ({ x: r6(Math.cos((2 * Math.PI * j) / n)), y: r6(Math.sin((2 * Math.PI * j) / n)), r: 4.5, color: 'accent' })) }, caption: t`The ${n}th roots of unity: every $\rho_m(r^k)$ is one of these points.` },
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: ((360 * k) / n) % 360, feedback: t`That is $\rho_1(r^k)$. With $m = ${m}$ the angle is $m$ times as large (mod $360^\circ$).` }, { value: raw, feedback: 'Reduce mod 360°: a unit complex number’s angle repeats every full turn.' }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`The angle is $360^\circ \times ${m}\cdot${k}/${n}$.`, 'Subtract whole turns of 360° until it lies in [0°, 360°).'],
          teach: 'An abelian group like Cₙ has only one-dimensional irreducible complex representations, each sending the generator to an nth root of unity.',
          explain: t`$360^\circ\cdot${m * k}/${n} = ${nice(raw)}^\circ$, which is $${nice(ans)}^\circ$ mod $360^\circ$. Different $m$ give the ${n} different irreducible representations of $C_{${n}}$ — the same idea that labels angular-momentum states by $e^{im\varphi}$.`,
        };
      },
    }),
    num({
      id: 'tensor-split', difficulty: 3,
      gen(r) {
        const n = r.pick([2, 3, 4, 5]);
        const ans = (n * (n + 1)) / 2 - 1;
        return {
          prompt: t`Under rotations of $n$-dimensional space, the $n^2$ components of a $(0,2)$ tensor $T_{ij}$ split into three pieces that rotations never mix: the trace $T_{ii}$, the antisymmetric part, and the **symmetric traceless** part. For $n = ${n}$, how many components does the symmetric traceless part have?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (n * (n + 1)) / 2, feedback: 'That is all symmetric components; the trace is one combination of them, split off as its own piece.' }, { value: (n * (n - 1)) / 2, feedback: 'That is the antisymmetric piece.' }].filter((e) => e.value !== ans),
          hints: [t`Symmetric: $n(n+1)/2$ components. The trace is one of those directions.`, t`Check the total: $1 + \tfrac{n(n-1)}{2} + (\text{answer}) = n^2$.`],
          teach: 'A tensor product of representations is reducible: (0,2) tensors split into trace, antisymmetric and symmetric traceless parts, each irreducible under rotations.',
          explain: t`$\tfrac{${n}\cdot${n + 1}}{2} - 1 = ${ans}$; check: $1 + ${(n * (n - 1)) / 2} + ${ans} = ${n * n}$. ${n === 3 ? 'In 3D the 5 are the components of a quadrupole moment — the source of gravitational waves.' : 'In 3D the piece has 5 components: a quadrupole moment, the source of gravitational waves.'}`,
        };
      },
    }),
    mcq({
      id: 'irreducible', difficulty: 3,
      prompt: t`Is the 2-dimensional representation of $D_3$ irreducible — is there no line through the origin that both $\rho(r)$ and $\rho(f)$ map to itself?`,
      visual: { type: 'la-map2d', params: { A: RHO_R, eigen: true, readout: ['A'], view: 2.2 }, caption: t`$\rho(r)$ with its real invariant lines requested (eigen-lines are drawn dashed when they exist).` },
      choices: [t`Yes: $\rho(r)$ alone moves every line (a $120^\circ$ turn has no real eigenvector), so no line is invariant under the whole group`, t`No: the vertical axis is invariant, since $\rho(f)$ fixes it`, t`No: every 2-dimensional representation splits into two 1-dimensional ones`, t`Yes, because $\det\rho(f) = -1$`],
      answer: 0,
      why: {
        1: t`$\rho(f)$ keeps the vertical axis, but $\rho(r)$ turns it by $120^\circ$. An invariant subspace must survive every group element.`,
        2: t`That holds for abelian groups (over $\mathbb C$). $D_3$ is non-abelian, and its 2D representation is the smallest one that captures it.`,
        3: t`Determinants say nothing about invariant lines: a reflection has $\det -1$ and two invariant lines.`,
      },
      hints: [t`An invariant line would be an eigenvector of every $\rho(g)$ at once.`, t`What are the eigenvalues of a $120^\circ$ rotation? $e^{\pm 2\pi i/3}$ — real?`],
      teach: 'A representation is irreducible when no subspace is mapped to itself by every group element; one element with no real eigenvector can settle it.',
      explain: t`$\rho(r)$ has eigenvalues $e^{\pm2\pi i/3}$, not real, so no real line is invariant (the picture shows none). Irreducible. Character check: $\tfrac16\sum_g\chi(g)^2 = \tfrac16(4 + 1 + 1 + 0 + 0 + 0) = 1$, the signature of an irreducible representation.`,
    }),
    code({
      id: 's3-rep', difficulty: 3,
      prompt: t`Check the 2-dimensional representation of $S_3 \cong D_3$ numerically. Elements are pairs $(a, b)$ meaning $r^af^b$; the group law is $(a_1, b_1)(a_2, b_2) = (a_1 + (-1)^{b_1}a_2 \bmod 3,\ b_1 + b_2 \bmod 2)$ (from $f r = r^{-1} f$). Write \`rho(a, b)\` returning the $2\times2$ NumPy matrix $R^aF^b$, with $R$ the $120^\circ$ rotation and $F = \operatorname{diag}(-1, 1)$. Then \`is_rep()\` should return \`True\` if $\rho(gh) = \rho(g)\rho(h)$ for all 36 pairs.`,
      starter: t`import numpy as np

c, s = np.cos(2 * np.pi / 3), np.sin(2 * np.pi / 3)
R = np.array([[c, -s], [s, c]])
F = np.diag([-1.0, 1.0])
G = [(a, b) for b in (0, 1) for a in (0, 1, 2)]

def mult(g, h):
    (a1, b1), (a2, b2) = g, h
    return ((a1 + (-1)**b1 * a2) % 3, (b1 + b2) % 2)

def rho(a, b):
    pass

def is_rep():
    pass

chars = [round(np.trace(rho(*g)), 6) for g in G]
print(chars, is_rep())
`,
      answer: t`import numpy as np

c, s = np.cos(2 * np.pi / 3), np.sin(2 * np.pi / 3)
R = np.array([[c, -s], [s, c]])
F = np.diag([-1.0, 1.0])
G = [(a, b) for b in (0, 1) for a in (0, 1, 2)]

def mult(g, h):
    (a1, b1), (a2, b2) = g, h
    return ((a1 + (-1)**b1 * a2) % 3, (b1 + b2) % 2)

def rho(a, b):
    return np.linalg.matrix_power(R, a) @ np.linalg.matrix_power(F, b)

def is_rep():
    return all(np.allclose(rho(*mult(g, h)), rho(*g) @ rho(*h)) for g in G for h in G)

chars = [round(np.trace(rho(*g)), 6) for g in G]
print(chars, is_rep())
`,
      tests: [
        { name: t`$\rho(1, 0)$ is the $120^\circ$ rotation`, code: 'np.allclose(rho(1, 0), R)' },
        { name: t`$\rho(0, 1)$ is the reflection $F$`, code: 'np.allclose(rho(0, 1), F)' },
        { name: t`$\rho(gh) = \rho(g)\rho(h)$ for all 36 pairs`, code: 'is_rep() is True' },
        { name: 'the characters are 2, −1, −1 on rotations and 0 on reflections', code: 'np.allclose([np.trace(rho(*g)) for g in G], [2, -1, -1, 0, 0, 0])' },
        { name: t`the defining relation holds: $\rho(f)\rho(r) = \rho(r^2)\rho(f)$`, code: 'np.allclose(rho(0, 1) @ rho(1, 0), rho(2, 0) @ rho(0, 1))' },
      ],
      hints: [t`\`np.linalg.matrix_power(R, a)\` gives $R^a$; multiply by $F^b$ on the right (\`@\`).`, t`\`all(np.allclose(rho(*mult(g, h)), rho(*g) @ rho(*h)) for g in G for h in G)\`.`],
      teach: 'A representation is a homomorphism: the matrix of a product must be the product of the matrices, for every pair.',
      explain: t`All 36 products agree. The characters $(2, -1, -1, 0, 0, 0)$ satisfy $\tfrac16\sum\chi^2 = 1$: irreducible. The relation $f r = r^{-1}f$ is what ties the two matrices together: any pair of matrices obeying it, with $R^3 = F^2 = I$, gives a representation.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-polarizations', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([4, 5, 6, 11]);
        const k = D - 2, ans = (k * (k + 1)) / 2 - 1;
        return {
          prompt: t`A gravitational wave’s strain $h_{ij}$ lives in the plane(s) transverse to its direction of travel and is symmetric and traceless there: it carries the symmetric traceless representation of the rotations of the ${k} transverse dimensions. In a spacetime of dimension $D = ${D}$ (so $${k}$ transverse directions), how many polarizations does a gravitational wave have?`,
          visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-1.5, 1.5], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, curves: [{ param: ['-1.6 + 1.2*cos(t)', '0.8*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2, label: 'plus', labelAt: 0.5, labelDx: 6 }, { param: ['-1.6 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', dash: true, width: 1 }, { param: ['1.6 + 0.7071*(1.2*cos(t) - 0.8*sin(t))', '0.7071*(1.2*cos(t) + 0.8*sin(t))'], t: [0, 6.2832], color: 'gold', width: 2, label: 'cross', labelAt: 0.2, labelDx: 6 }, { param: ['1.6 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', dash: true, width: 1 }] }, caption: 'In 4D: a ring of free particles in the transverse plane squeezed by the two polarizations, plus and cross (deformation hugely exaggerated). Dashed: the undisturbed ring.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: (k * (k + 1)) / 2, feedback: 'Traceless removes one more component: the trace is its own (scalar) piece.' }, { value: (D * (D + 1)) / 2, feedback: 'That counts a symmetric tensor in all D dimensions. Gauge freedom and constraints leave only the transverse, traceless part.' }].filter((e) => e.value !== ans),
          hints: [t`A symmetric $k\times k$ matrix has $k(k+1)/2$ components; traceless removes one.`, t`With $k = D - 2 = ${k}$.`],
          teach: t`Counting polarizations is counting the dimension of a representation: symmetric traceless in the $D - 2$ transverse directions, $D(D - 3)/2$ in all.`,
          explain: t`$\tfrac{${k}\cdot${k + 1}}{2} - 1 = ${ans} = \tfrac{D(D - 3)}{2}$. ${D === 4 ? 'Two in our 4D spacetime: the plus and cross polarizations LIGO measures.' : 'In 4D the same count gives 2 — plus and cross, the two LIGO measures.'} [Counting degrees of freedom](#/lesson/st-g.G6.4) reaches the same number from constraints.`,
        };
      },
    }),
    num({
      id: 'cp-attitude', difficulty: 3, transfer: true,
      gen(r) {
        const thDeg = r.pick([25, 40, 65, 110, 150]), th = (thDeg * Math.PI) / 180;
        const n = [1, 1, 1].map((x) => x / Math.sqrt(3));
        const R = rotAbout(n, th), tr = R[0][0] + R[1][1] + R[2][2];
        const trR = r6(tr);
        const cols = [0, 1, 2].map((j) => R.map((row) => r6(row[j] * 1.2)));
        return {
          prompt: t`A star tracker reports a spacecraft’s attitude matrix $R \in SO(3)$ relative to its reference frame, with trace $\operatorname{tr}R = ${nice(trR, 4)}$. The trace is the character of the vector representation, $\chi(R) = 1 + 2\cos\theta$, where $\theta$ is the rotation angle about some axis. How far has the spacecraft turned, in degrees?`,
          visual: { type: 'calc-vectors3d', params: { range: 1.4, vectors: [{ to: cols[0], color: 'accent', label: '\\mathbf b_1' }, { to: cols[1], color: 'gold', label: '\\mathbf b_2' }, { to: cols[2], color: 'teal', label: '\\mathbf b_3' }], yaw: 0.7, pitch: 0.4 }, caption: 'The body axes (the columns of R) against the reference axes x, y, z.' },
          answer: thDeg, units: 'deg', tol: { rel: 0.005 },
          errors: [{ value: (Math.acos(Math.max(-1, Math.min(1, trR / 3))) * 180) / Math.PI, feedback: 'The trace is 1 + 2 cos θ, not 3 cos θ: the axis direction contributes 1.' }, { value: (Math.acos(Math.max(-1, Math.min(1, trR - 1))) * 180) / Math.PI, feedback: 'Solve 1 + 2cos θ = tr R: cos θ = (tr R − 1)/2.' }].filter((e) => Math.abs(e.value - thDeg) > 0.01 * thDeg),
          hints: [t`$\cos\theta = (\operatorname{tr}R - 1)/2$.`, t`$(${nice(trR, 4)} - 1)/2 = ${nice((trR - 1) / 2, 4)}$.`],
          teach: 'The character of a rotation depends only on its angle, not its axis — so a trace reads off how far a body has turned, whatever the axis.',
          explain: t`$\cos\theta = ${nice((trR - 1) / 2, 4)}$, so $\theta = ${thDeg}^\circ$. The trace is basis-independent, which is why attitude software (and the quaternion’s scalar part, $\cos\tfrac\theta2$) uses it.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Tung, Group Theory in Physics (World Scientific, 1985), chs. 3–4 (representations, characters)', url: 'https://doi.org/10.1142/0097' },
    { label: 'Serre, Linear Representations of Finite Groups (Springer, 1977), ch. 2', url: 'https://doi.org/10.1007/978-1-4684-9458-7' },
  ],
});
