// Index gymnastics: a gym of generated contractions — substitute with δ,
// trace, rename dummies, kill symmetric × antisymmetric pairs, and use ε–δ.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { legs, grid } from './_ten.js';

const t = String.raw;
const ints = (r, n, lo = -3, hi = 3) => Array.from({ length: n }, () => r.intExcept(lo, hi, [0]));
const mat = (r, lo = -3, hi = 3) => [ints(r, 3, lo, hi), ints(r, 3, lo, hi), ints(r, 3, lo, hi)];
const vecTeX = (a) => `(${a.join(',\\ ')})`;
const matTeX = (A) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const dot = (a, b) => a.reduce((s, x, k) => s + x * b[k], 0);
const mv = (M, v) => M.map((row) => dot(row, v));
const ROWS = ['i = 1', 'i = 2', 'i = 3'], COLS = ['j = 1', 'j = 2', 'j = 3'];

// redraw a generated case until test(case) holds; fall back to a fixed one
function until(r, make, test, fallback) {
  for (let k = 0; k < 60; k++) { const c = make(r); if (test(c)) return c; }
  return fallback;
}

export default lesson({
  id: 'st-a.A1.4',
  title: 'Index gymnastics: practice',
  minutes: 12, difficulty: 2,
  intro: t`Index notation becomes fluent only by use, so this lesson is a gym: every exercise is generated afresh, and a miss brings back a new version. Five moves do almost everything:

- **Substitute** with a delta: $\delta^i_j\,X^j = X^i$ — the delta renames an index and disappears.
- **Trace**: a summed pair on one object, $M^i{}_i$, adds up its diagonal; $\delta^i_i = n$.
- **Rename** a dummy whenever its letter is needed elsewhere.
- **Kill** a symmetric–antisymmetric pair: if $S^{ij} = S^{ji}$ and $A_{ij} = -A_{ji}$, then $S^{ij}A_{ij} = 0$.
- **Collapse** two $\varepsilon$’s into deltas with the identity of the last lesson.

Here is the first move inside a chain, the kind of line you will simplify constantly:

$$M^i{}_j\,\delta^j_k\,V^k = M^i{}_k\,V^k$$`,
  symbols: [
    { tex: t`M^i{}_j`, text: t`any array with an upper and a lower index — a matrix` },
    { tex: t`\delta^j_k`, text: t`the Kronecker delta: 1 if $j = k$, else 0` },
    { tex: t`V^k`, text: 'components of a vector' },
    { tex: 'i', text: 'the free index, on both sides' },
    { tex: 'j,\\ k', text: t`dummies: after the delta has acted only one summed letter remains, and its name does not matter` },
  ],
  why: t`Every derivation in general relativity — Christoffel symbols, curvature, the Bianchi identity — is a chain of exactly these moves; doing them without thinking frees your attention for the physics.`,
  visual: {
    type: 'code-runner',
    title: 'The summation convention, executable',
    lead: t`NumPy’s \`einsum\` *is* the summation convention: \`'ij,j->i'\` means $M^i{}_jV^j$ — letters repeated across the inputs are summed, letters after the arrow are free. Run it, then edit the strings. (NumPy does not track heights; keeping one index up and one down is your job.)`,
    tasks: [
      t`Change \`'ij,j->i'\` to \`'ji,j->i'\`: which matrix product is that?`,
      t`Write $M^i{}_jM^j{}_kM^k{}_i$, the trace of $M^3$, as one \`einsum\` and check it against \`np.trace(M @ M @ M)\`.`,
      t`Try \`'ij,ij->'\` with \`S\` and \`Asym\`: it is always 0.`,
    ],
    params: {
      code: t`import numpy as np
rng = np.random.default_rng(7)
M = rng.integers(-3, 4, size=(3, 3))     # M^i_j  (row i, column j)
A = rng.integers(-3, 4, size=3)          # A_i
V = rng.integers(-3, 4, size=3)          # V^j
d = np.eye(3, dtype=int)                 # δ^i_j

print("M =\n", M, "\nA =", A, " V =", V)
print("trace  M^i_i        =", np.einsum('ii->', M))
print("W^i =  M^i_j V^j    =", np.einsum('ij,j->i', M, V))
print("A_i M^i_j V^j       =", np.einsum('i,ij,j->', A, M, V))
print("δ^i_j A_i V^j       =", np.einsum('ij,i,j->', d, A, V), "  (same as A_i V^i =", A @ V, ")")
print("M^i_j M^j_i         =", np.einsum('ij,ji->', M, M), "  (trace of M·M =", np.trace(M @ M), ")")

S = M + M.T                              # symmetric:      S^ij =  S^ji
Asym = M - M.T                           # antisymmetric:  A_ij = -A_ji
print("S^ij Asym_ij        =", np.einsum('ij,ij->', S, Asym))`,
      rows: 18,
    },
    caption: 'Real Python, run in your browser. Integer arrays keep the arithmetic exact, so every identity holds to the last digit.',
  },
  example: {
    prompt: t`Show that $S^{ij}A_{ij} = 0$ whenever $S^{ij} = S^{ji}$ is symmetric and $A_{ij} = -A_{ji}$ is antisymmetric. Then check it in two dimensions with $S = \begin{pmatrix} 1 & 2 \\ 2 & 3 \end{pmatrix}$ and $A = \begin{pmatrix} 0 & 4 \\ -4 & 0 \end{pmatrix}$.`,
    visual: grid([[1, 2], [2, 3]], { hl: [[0, 1], [1, 0]], rowNames: ['i = 1', 'i = 2'], colNames: ['j = 1', 'j = 2'], caption: t`$S^{ij}$, with its two off-diagonal entries ringed: they are equal, while the matching entries of $A_{ij}$ are opposite, so their products cancel in pairs. The diagonal of $A$ is 0.` }),
    steps: [
      { label: 'Call it X and rename', text: t`Let $X = S^{ij}A_{ij}$. Both indices are dummies, so swapping their names changes nothing: $X = S^{ji}A_{ji}$.` },
      { label: 'Use the symmetries', text: t`$S^{ji} = S^{ij}$ and $A_{ji} = -A_{ij}$, so $X = S^{ij}(-A_{ij}) = -X$.` },
      { label: 'Conclude', text: t`A number equal to minus itself is 0: $X = 0$. This never needed the values — only the two symmetries.` },
      { label: 'Check', text: t`$S^{11}A_{11} + S^{12}A_{12} + S^{21}A_{21} + S^{22}A_{22} = 1\cdot0 + 2\cdot4 + 2\cdot(-4) + 3\cdot0 = 0$. ✓` },
    ],
    answer: t`$S^{ij}A_{ij} = S^{ji}A_{ji} = -S^{ij}A_{ij}$, so $S^{ij}A_{ij} = 0$.`,
  },
  practice: [
    num({
      id: 'delta-pair', difficulty: 1,
      gen(r) {
        const c = until(r, (q) => ({ A: ints(q, 3), B: ints(q, 3) }), ({ A, B }) => dot(A, B) !== 0, { A: [2, -1, 3], B: [1, 2, 1] });
        const s = dot(c.A, c.B);
        return {
          prompt: t`With $A^j = ${vecTeX(c.A)}$ and $B_i = ${vecTeX(c.B)}$, contract $\delta^i_j\,A^j\,B_i$.`,
          visual: legs([{ name: 'B' }, { name: 'δ' }, { name: 'A' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }], caption: t`$B_i\,\delta^i_j\,A^j$: no loose legs, so one number. The delta just joins $B$ to $A$.` }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 3 * s, feedback: t`The delta is not 1 everywhere: it kills every term with $i \ne j$, so there are 3 terms, not 9 — and no extra factor of 3.` }],
          hints: [t`$\delta^i_jA^j = A^i$.`, t`Then $A^iB_i = A^1B_1 + A^2B_2 + A^3B_3$.`],
          teach: t`A delta between two arrays simply joins them: $\delta^i_jA^jB_i = A^iB_i$.`,
          explain: t`$\delta^i_jA^jB_i = A^iB_i = ${c.A.map((a, k) => `(${a})(${c.B[k]})`).join(' + ')} = ${s}$.`,
        };
      },
    }),
    num({
      id: 'chain', difficulty: 2,
      gen(r) {
        const i = r.int(1, 3);
        const c = until(r, (q) => ({ M: mat(q), V: ints(q, 3, -2, 2) }), ({ M, V }) => mv(M, V)[i - 1] !== 0, { M: [[1, 2, -1], [3, -2, 1], [2, 1, 2]], V: [1, -2, 2] });
        const W = mv(c.M, c.V);
        return {
          prompt: t`With $M^i{}_j = ${matTeX(c.M)}$ (row $i$, column $j$) and $V^k = ${vecTeX(c.V)}$, evaluate $M^i{}_j\,\delta^j_k\,V^k$ for $i = ${i}$.`,
          visual: grid(c.M, { hl: [0, 1, 2].map((j) => [i - 1, j]), rowNames: ROWS, colNames: COLS, caption: t`$M^i{}_j$ with row ${i} ringed. After the delta acts, the sum runs along this row.` }),
          answer: W[i - 1], tol: { rel: 0, abs: 0.1 },
          hints: [t`$\delta^j_kV^k = V^j$, so the expression is $M^${i}{}_jV^j$.`],
          teach: t`A delta in the middle of a chain disappears and renames: $M^i{}_j\delta^j_kV^k = M^i{}_kV^k$.`,
          explain: t`$M^${i}{}_jV^j = ${c.M[i - 1].map((m, j) => `(${m})(${c.V[j]})`).join(' + ')} = ${W[i - 1]}$.`,
        };
      },
    }),
    num({
      id: 'traces', difficulty: 2,
      gen(r) {
        const which = r.pick(['tr', 'tr2']);
        const c = until(r, (q) => mat(q), (M) => (which === 'tr' ? M[0][0] + M[1][1] + M[2][2] : M.reduce((s, row, a) => s + row.reduce((u, m, b) => u + m * M[b][a], 0), 0)) !== 0, [[1, 2, 0], [1, -1, 3], [2, 1, 2]]);
        const tr = c[0][0] + c[1][1] + c[2][2];
        const tr2 = c.reduce((s, row, a) => s + row.reduce((u, m, b) => u + m * c[b][a], 0), 0);
        const sq = c.flat().reduce((s, m) => s + m * m, 0);
        return {
          prompt: which === 'tr' ? t`With $M^i{}_j = ${matTeX(c)}$, what is $M^i{}_i$?` : t`With $M^i{}_j = ${matTeX(c)}$, what is $M^i{}_j\,M^j{}_i$?`,
          visual: which === 'tr'
            ? grid(c, { hl: [[0, 0], [1, 1], [2, 2]], rowNames: ROWS, colNames: COLS, caption: t`A trace sums the diagonal (ringed).` })
            : legs([{ name: 'M' }, { name: 'M' }], { links: [{ a: 0, b: 1, index: 'j' }, { a: 0, b: 1, index: 'i', arc: true }], caption: t`$M^i{}_jM^j{}_i$: two copies of $M$ joined twice — the trace of the matrix product $M\cdot M$.` }),
          answer: which === 'tr' ? tr : tr2, tol: { rel: 0, abs: 0.1 },
          errors: which === 'tr' ? [] : [{ value: sq, feedback: t`That is $\sum_{ij}(M^i{}_j)^2$, each entry times itself. In $M^i{}_jM^j{}_i$ the second factor has its indices the other way round: entry $(i, j)$ meets entry $(j, i)$.` }, { value: tr * tr, feedback: t`That is $(M^i{}_i)^2$, the square of the trace — a different contraction, $M^i{}_iM^j{}_j$.` }].filter((e) => e.value !== tr2),
          hints: which === 'tr' ? ['Add the diagonal entries.'] : [t`It is the trace of $M\cdot M$: the sum over $i$ and $j$ of $M^i{}_j\times M^j{}_i$.`, 'Diagonal entries are squared; each off-diagonal pair (i, j) and (j, i) is multiplied together, and counted twice.'],
          teach: t`A loop of indices is a trace: $M^i{}_i$ is the trace of $M$, $M^i{}_jM^j{}_i$ the trace of $M^2$.`,
          explain: which === 'tr' ? t`$M^i{}_i = ${c[0][0]} + (${c[1][1]}) + (${c[2][2]}) = ${tr}$.` : t`$M^i{}_jM^j{}_i = \sum_i (M^i{}_i)^2 + 2\sum_{i<j}M^i{}_jM^j{}_i = ${tr2}$ — the trace of $M\cdot M$.`,
        };
      },
    }),
    num({
      id: 'sandwich', difficulty: 2,
      gen(r) {
        const c = until(r, (q) => ({ T: mat(q), V: ints(q, 3, -2, 2), W: ints(q, 3, -2, 2) }), ({ T, V, W }) => dot(W, mv(T, V)) !== 0, { T: [[1, 2, -1], [0, 1, 3], [2, -1, 1]], V: [1, 2, -1], W: [2, -1, 1] });
        const TV = mv(c.T, c.V), s = dot(c.W, TV);
        return {
          prompt: t`With $T^i{}_j = ${matTeX(c.T)}$, $V^j = ${vecTeX(c.V)}$ and $W_i = ${vecTeX(c.W)}$, evaluate $T^i{}_j\,V^j\,W_i$.`,
          visual: legs([{ name: 'W' }, { name: 'T' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }] }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          hints: [t`Do $T^i{}_jV^j$ first: it is a vector with a free $i$.`, t`$T^i{}_jV^j = ${vecTeX(TV)}$; now contract with $W_i$.`],
          teach: 'A double contraction is a single number: do one sum, then the other.',
          explain: t`$T^i{}_jV^j = ${vecTeX(TV)}$, and $W_i$ times it gives $${c.W.map((w, k) => `(${w})(${TV[k]})`).join(' + ')} = ${s}$.`,
        };
      },
    }),
    multi({
      id: 'same-thing', difficulty: 2,
      prompt: t`Which of these equal $T^i{}_j\,V^j\,W_i$ for every $T$, $V$ and $W$? Select every one.`,
      visual: legs([{ name: 'W' }, { name: 'T' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }], caption: 'The original: W joined to T’s upper slot, V joined to T’s lower slot. Any expression with the same joins is the same number.' }),
      choices: [t`$T^k{}_m\,V^m\,W_k$`, t`$W_i\,T^i{}_j\,V^j$`, t`$V^j\,W_i\,T^i{}_j$`, t`$T^i{}_j\,V^i\,W_j$`, t`$T^j{}_i\,V^j\,W_i$`],
      answer: [0, 1, 2],
      why: {
        3: t`Here $V$ is joined to $T$’s upper slot and $W$ to its lower one — the other way round. (It is not even grammatical: $V^i$ and $T^i{}_j$ are both up.)`,
        4: t`$T^j{}_iV^jW_i$ pairs two upper $j$’s and two lower $i$’s: not a valid sum, and it would join $V$ to the first slot of $T$ rather than the second.`,
      },
      hints: ['Components are ordinary numbers, so the order of the factors does not matter.', 'What matters is which slot of T each vector is joined to.'],
      teach: 'An index expression is fixed by which slots are joined, not by the letters or the order of the factors.',
      explain: t`Renaming dummies ($i \to k$, $j \to m$) and reordering factors change nothing. Swapping which slot $V$ and $W$ fill gives a different contraction — and here, an ungrammatical one.`,
    }),
    num({
      id: 'anti-part', difficulty: 3,
      gen(r) {
        const c = until(r, (q) => ({ T: mat(q), a: ints(q, 3) }), ({ T, a }) => (T[0][1] - T[1][0]) * a[0] + (T[0][2] - T[2][0]) * a[1] + (T[1][2] - T[2][1]) * a[2] !== 0, { T: [[1, 3, 0], [1, 2, -1], [2, 2, 1]], a: [1, 2, -1] });
        const [a12, a13, a23] = c.a;
        const A = [[0, a12, a13], [-a12, 0, a23], [-a13, -a23, 0]];
        const s = c.T.reduce((x, row, i) => x + row.reduce((u, m, j) => u + m * A[i][j], 0), 0);
        return {
          prompt: t`$A_{ij} = ${matTeX(A)}$ is antisymmetric. With $T^{ij} = ${matTeX(c.T)}$, evaluate $T^{ij}A_{ij}$.`,
          visual: grid(c.T, { hl: [[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1]], rowNames: ROWS, colNames: COLS, caption: t`$T^{ij}$ with its off-diagonal entries ringed. The diagonal meets the zeros of $A$; only the differences $T^{ij} - T^{ji}$ survive.` }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 0, feedback: t`$T$ is not symmetric, so its antisymmetric part survives: only a symmetric $T$ would give 0.` }],
          hints: [t`Split $T^{ij}$ into symmetric and antisymmetric parts: the symmetric part contracts with $A_{ij}$ to 0.`, t`What survives is $\sum_{i<j}(T^{ij} - T^{ji})A_{ij}$: three terms.`],
          teach: 'Only the antisymmetric part of T survives contraction with an antisymmetric A.',
          explain: t`$T^{ij}A_{ij} = (T^{12} - T^{21})A_{12} + (T^{13} - T^{31})A_{13} + (T^{23} - T^{32})A_{23} = (${c.T[0][1] - c.T[1][0]})(${a12}) + (${c.T[0][2] - c.T[2][0]})(${a13}) + (${c.T[1][2] - c.T[2][1]})(${a23}) = ${s}$.`,
        };
      },
    }),
    num({
      id: 'eps-delta-use', difficulty: 3,
      gen(r) {
        const c = until(r, (q) => ({ A: ints(q, 3, -2, 2), B: ints(q, 3, -2, 2), C: ints(q, 3, -2, 2), D: ints(q, 3, -2, 2) }), ({ A, B, C, D }) => dot(A, C) * dot(B, D) - dot(A, D) * dot(B, C) !== 0, { A: [1, 0, 2], B: [0, 1, 1], C: [1, 1, 0], D: [2, 0, 1] });
        const AC = dot(c.A, c.C), BD = dot(c.B, c.D), AD = dot(c.A, c.D), BC = dot(c.B, c.C);
        const s = AC * BD - AD * BC;
        return {
          prompt: t`In Cartesian components (where lower and upper components are equal), $\mathbf A = ${vecTeX(c.A)}$, $\mathbf B = ${vecTeX(c.B)}$, $\mathbf C = ${vecTeX(c.C)}$, $\mathbf D = ${vecTeX(c.D)}$. Use $\varepsilon_{ijk}\varepsilon^{ilm} = \delta^l_j\delta^m_k - \delta^m_j\delta^l_k$ to evaluate $\varepsilon_{ijk}\,\varepsilon^{ilm}\,A^jB^k\,C_lD_m$ — which is $(\mathbf A\times\mathbf B)\cdot(\mathbf C\times\mathbf D)$.`,
          visual: legs([{ name: 'A' }, { name: 'ε' }, { name: 'B' }, { name: 'C' }, { name: 'ε' }, { name: 'D' }], { links: [{ a: 0, b: 1, index: 'j' }, { a: 1, b: 2, index: 'k' }, { a: 3, b: 4, index: 'l' }, { a: 4, b: 5, index: 'm' }, { a: 1, b: 4, index: 'i', arc: true }], gap: 1.3, caption: 'Two cross products, A × B and C × D, joined through their shared index i.' }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: AC * BD + AD * BC, feedback: 'The second term enters with a minus sign.' }, { value: AC * BD, feedback: t`You kept only the first delta product; the identity has two terms.` }].filter((e) => e.value !== s),
          hints: [t`The deltas substitute: $\delta^l_j\delta^m_kA^jB^kC_lD_m = (A^jC_j)(B^kD_k)$.`, t`So the answer is $(\mathbf A\cdot\mathbf C)(\mathbf B\cdot\mathbf D) - (\mathbf A\cdot\mathbf D)(\mathbf B\cdot\mathbf C)$.`],
          teach: 'The ε–δ identity turns a dot product of two cross products into dot products.',
          explain: t`$\mathbf A\cdot\mathbf C = ${AC}$, $\mathbf B\cdot\mathbf D = ${BD}$, $\mathbf A\cdot\mathbf D = ${AD}$, $\mathbf B\cdot\mathbf C = ${BC}$, so the value is $(${AC})(${BD}) - (${AD})(${BC}) = ${s}$.`,
        };
      },
    }),
    code({
      id: 'einsum-gym', difficulty: 2,
      prompt: t`Write each contraction as one \`np.einsum\` call: \`tr\` $= M^i{}_i$, \`W\` $= M^i{}_jV^j$ (an array), and \`s\` $= A_i\,M^i{}_j\,V^j$ (a number).`,
      visual: legs([{ name: 'A' }, { name: 'M' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }], caption: t`The third one, $A_iM^i{}_jV^j$: in \`einsum\` each joined pair is one letter shared by two inputs, and no letter is left for the output.` }),
      starter: t`import numpy as np
M = np.array([[2, -1, 0], [1, 3, -2], [0, 1, 4]])
V = np.array([3, 1, 2])
A = np.array([1, -2, 1])

tr = None                      # M^i_i
W = None                       # M^i_j V^j
s = None                       # A_i M^i_j V^j
print(tr, W, s)
`,
      answer: t`import numpy as np
M = np.array([[2, -1, 0], [1, 3, -2], [0, 1, 4]])
V = np.array([3, 1, 2])
A = np.array([1, -2, 1])

tr = np.einsum('ii->', M)
W = np.einsum('ij,j->i', M, V)
s = np.einsum('i,ij,j->', A, M, V)
print(tr, W, s)`,
      tests: [
        { name: t`\`tr\` is the trace, 9`, code: 'int(tr) == 9' },
        { name: t`\`W\` is $M^i{}_jV^j = (5, 2, 9)$`, code: 'W is not None and list(np.asarray(W)) == [5, 2, 9]' },
        { name: t`\`s\` is $A_iM^i{}_jV^j = 10$`, code: 's is not None and int(s) == 10' },
      ],
      hints: [t`In \`einsum\`, a letter repeated within one input (\`'ii'\`) is a trace; put nothing after \`->\` for a single number.`, t`\`W = np.einsum('ij,j->i', M, V)\` and \`s = np.einsum('i,ij,j->', A, M, V)\`.`],
      teach: 'In einsum, shared letters are summed and letters after the arrow are free — the summation convention, verbatim.',
      explain: t`\`'ii->'\` is $M^i{}_i = 2 + 3 + 4 = 9$; \`'ij,j->i'\` gives $W = (5, 2, 9)$; and \`'i,ij,j->'\` gives $A_iW^i = 1\cdot5 + (-2)\cdot2 + 1\cdot9 = 10$. The subscript strings are the index expressions with the heights erased.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-deltas', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        const [tex, ans, how] = r.pick([
          [t`\delta^i_j\,\delta^j_k\,\delta^k_i`, n, t`the deltas substitute in turn — $\delta^i_j\delta^j_k = \delta^i_k$, then $\delta^i_k\delta^k_i = \delta^i_i = ${n}$`],
          [t`\delta^i_j\,\delta^j_i`, n, t`$\delta^i_j\delta^j_i = \delta^i_i = ${n}$`],
          [t`\delta^i_i\,\delta^j_j`, n * n, t`two separate traces, $${n}\times${n} = ${n * n}$`],
        ]);
        return {
          prompt: t`In ${n} dimensions, evaluate $${tex}$.`,
          visual: grid(Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => (a === b ? 1 : 0))), { hl: Array.from({ length: n }, (_, a) => [a, a]), caption: t`$\delta^i_j$ in ${n} dimensions: the ${n}×${n} identity.` }),
          answer: ans, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 1, feedback: 'A closed chain of deltas ends in a trace, which counts dimensions — it is not 1.' }].filter((e) => e.value !== ans),
          hints: ['Let the deltas substitute one at a time until one trace (or two) is left.'],
          teach: t`Deltas chained into a closed loop collapse to $\delta^i_i = n$.`,
          explain: t`Here ${how}.`,
        };
      },
    }),
    num({
      id: 'cp-spin', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([[[120, -5, 0], [-5, 150, 8], [0, 8, 90]], [[310, 12, -4], [12, 280, 0], [-4, 0, 410]], [[45, 0, -3], [0, 60, 2], [-3, 2, 52]]]);
        const w = r.pick([[0.02, -0.01, 0.05], [0.03, 0.04, -0.01], [-0.02, 0.06, 0.03]]);
        const K = 0.5 * w.reduce((s, wi, i) => s + w.reduce((u, wj, j) => u + I[i][j] * wi * wj, 0), 0);
        const diag = 0.5 * w.reduce((s, wi, i) => s + I[i][i] * wi * wi, 0);
        return {
          prompt: t`A small satellite’s moment of inertia about its centre of mass, in body axes, is $I_{ij} = ${matTeX(I)}\ \text{kg m}^2$, and it spins with angular velocity $\omega^i = ${vecTeX(w)}$ rad/s. Its rotational kinetic energy is $K = \tfrac12\,I_{ij}\,\omega^i\omega^j$. Find $K$.`,
          visual: grid(I, { hl: [[0, 0], [1, 1], [2, 2]], rowNames: ROWS, colNames: COLS, dx: 1.3, caption: t`$I_{ij}$ in kg m². The diagonal (ringed) holds the moments of inertia; the off-diagonal products of inertia are small but count.` }),
          answer: K, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: diag, feedback: 'You kept only the diagonal terms. The off-diagonal products of inertia contribute too — twice each, since I is symmetric.' }, { value: 2 * K, feedback: 'Remember the factor ½.' }].filter((e) => Math.abs(e.value - K) > 0.01 * K),
          hints: [t`$I_{ij}\omega^i\omega^j$ is a double sum: 9 terms.`, t`First $L_i = I_{ij}\omega^j$ (the angular momentum), then $K = \tfrac12 L_i\omega^i$.`],
          teach: 'A two-index array contracted with the same vector twice gives a scalar: here, an energy.',
          explain: t`$L_i = I_{ij}\omega^j = (${I.map((row) => nice(row.reduce((u, m, j) => u + m * w[j], 0), 4)).join(',\\ ')})$ kg m²/s, and $K = \tfrac12 L_i\omega^i = ${nice(K, 4)}$ J. Diagonal terms alone would give ${nice(diag, 4)} J.`,
        };
      },
    }),
    mcq({
      id: 'cp-kill', difficulty: 2,
      prompt: t`$S^{ij}$ is symmetric and $\varepsilon_{ijk}$ is antisymmetric in $i$ and $j$. What is $S^{ij}\,\varepsilon_{ijk}$?`,
      visual: legs([{ name: 'S' }, { name: 'ε', down: ['k'] }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 0, b: 1, index: 'j', arc: true }], caption: t`Both slots of $S$ are joined to the first two slots of $\varepsilon$, leaving $k$ free.` }),
      choices: ['0, for every k', t`$S^{kk}$`, t`$\varepsilon_{ijk}$`, t`It depends on the entries of $S$`],
      answer: 0,
      why: {
        1: t`No entry of $S$ is picked out: the pairs $(i, j)$ and $(j, i)$ cancel.`,
        2: t`The indices $i$ and $j$ are summed; the result cannot still carry them.`,
        3: t`The cancellation is between $S^{ij}\varepsilon_{ijk}$ and $S^{ji}\varepsilon_{jik}$, whatever the entries are.`,
      },
      hints: ['Rename the dummies i ↔ j and use both symmetries.'],
      teach: 'A symmetric pair of indices contracted with an antisymmetric pair always gives 0.',
      explain: t`$S^{ij}\varepsilon_{ijk} = S^{ji}\varepsilon_{jik} = -S^{ij}\varepsilon_{ijk}$, so it vanishes for each $k$. This is why a symmetric stress or inertia tensor has no “cross product part”.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (index manipulation)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'NumPy documentation: numpy.einsum', url: 'https://numpy.org/doc/stable/reference/generated/numpy.einsum.html' },
  ],
});
