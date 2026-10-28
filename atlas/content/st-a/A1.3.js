// The Kronecker delta and the Levi-Civita symbol: substitution, traces,
// cross products and determinants as sums, and the ε–δ identity.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { epsSlices, eps, epsExpr, deltaExpr, grid, legs, r6 } from './_ten.js';

const t = String.raw;
const DEG = Math.PI / 180;
const vecTeX = (a) => `(${a.join(',\\ ')})`;
const ints = (r, n, lo = -3, hi = 3) => Array.from({ length: n }, () => r.intExcept(lo, hi, [0]));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a.reduce((s, x, k) => s + x * b[k], 0);
const SUB = '₁₂₃';

// three arrows from the origin in calc-vectors3d
const arrows3 = (list, caption, extra = {}) => ({
  type: 'calc-vectors3d',
  params: { range: Math.max(2, Math.ceil(Math.max(...list.flatMap((v) => v.to.map(Math.abs))) + 0.5)), vectors: list.map((v) => ({ ...v, to: v.to.map(r6) })), ...extra },
  caption,
});

// the cyclic wheel: 1 → 2 → 3 → 1 read with the arrows is even
const WHEEL = (() => {
  const P = [1, 2, 3].map((n) => { const a = (90 - 120 * (n - 1)) * DEG; return [r6(Math.cos(a)), r6(Math.sin(a))]; });
  const arcs = [0, 1, 2].map((k) => {
    const a0 = (90 - 120 * k - 18) * DEG, a1 = (90 - 120 * (k + 1) + 18) * DEG;
    return { param: [`1.0*cos(${r6(a0)} + (${r6(a1 - a0)})*t)`, `1.0*sin(${r6(a0)} + (${r6(a1 - a0)})*t)`], t: [0, 1], color: 'good', width: 2.2 };
  });
  const heads = [0, 1, 2].map((k) => {
    const a1 = (90 - 120 * (k + 1) + 18) * DEG, a0 = a1 + 0.12;
    return { from: [r6(Math.cos(a0)), r6(Math.sin(a0))], to: [r6(Math.cos(a1)), r6(Math.sin(a1))], color: 'good', width: 2.2 };
  });
  return {
    type: 'graph',
    params: {
      x: [-1.9, 1.9], y: [-1.45, 1.45], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      curves: arcs, arrows: heads,
      points: P.flatMap(([x, y], k) => [{ x, y, r: 14, color: 'accent' }, { x, y, r: 11.5, color: 'panel' }, { x, y, r: 0.01, color: 'ink', label: String(k + 1), labelDx: 0, labelDy: 0, labelAlign: 'center' }]),
    },
    caption: t`Read three indices around the wheel. With the arrows — 123, 231, 312 — the order is **even** and $\varepsilon = +1$; against them — 132, 321, 213 — it is **odd** and $\varepsilon = -1$. Any repeated index gives 0.`,
  };
})();

const ID3 = grid([[1, 0, 0], [0, 1, 0], [0, 0, 1]], { hl: [[0, 0], [1, 1], [2, 2]], rowNames: ['i = 1', 'i = 2', 'i = 3'], colNames: ['j = 1', 'j = 2', 'j = 3'], caption: t`The Kronecker delta $\delta^i_j$ in three dimensions is the identity array: 1 on the diagonal (ringed), 0 everywhere else.` });

export default lesson({
  id: 'st-a.A1.3',
  title: 'The Kronecker delta and the Levi-Civita symbol',
  minutes: 11, difficulty: 2,
  intro: t`Two arrays of fixed numbers do most of the work in index algebra. The **Kronecker delta** $\delta^i_j$ is 1 when $i = j$ and 0 otherwise — the identity matrix. Its job is substitution: in $\delta^i_j V^j$ only the term $j = i$ survives, so $\delta^i_jV^j = V^i$. The **Levi-Civita symbol** $\varepsilon_{ijk}$ is $+1$ when $(i, j, k)$ is an even rearrangement of $(1, 2, 3)$, $-1$ when odd, and 0 whenever two indices are equal. It writes the cross product as a sum, $(\mathbf A\times\mathbf B)_i = \varepsilon_{ijk}A^jB^k$, and the determinant too. Products of two of them collapse into deltas:

$$\varepsilon_{ijk}\,\varepsilon^{ilm} = \delta^l_j\,\delta^m_k - \delta^m_j\,\delta^l_k$$

A word on heights. In ordinary space with Cartesian axes — perpendicular, one unit long — an upper and a lower index carry **the same numbers** ($V_i = V^i$; lesson A6 says why), so $\varepsilon^{ilm}$ has the same table as $\varepsilon_{ilm}$ and many books write every index down: $\varepsilon_{ijk}\varepsilon_{ilm} = \delta_{jl}\delta_{km} - \delta_{jm}\delta_{kl}$. We keep the heights balanced anyway, because in spacetime they matter.`,
  symbols: [
    { tex: t`\delta^i_j`, text: t`the Kronecker delta: 1 if $i = j$, 0 if not. As a $3\times3$ array it is the identity` },
    { tex: t`\varepsilon_{ijk}`, text: t`the Levi-Civita symbol: $+1$ for $(1,2,3), (2,3,1), (3,1,2)$; $-1$ for $(1,3,2), (3,2,1), (2,1,3)$; 0 if any two indices are equal. Swapping any two indices flips its sign` },
    { tex: t`\varepsilon^{ilm}`, text: 'the same table with the indices written up (in Cartesian components of ordinary space)' },
    { tex: 'i', text: t`summed: it appears in both symbols, once down and once up` },
    { tex: 'j,\\ k,\\ l,\\ m', text: t`free: the identity holds for each of the $3^4 = 81$ choices of their values` },
  ],
  why: t`Torque, angular momentum, the curl and the magnetic force all hide an $\varepsilon$; in relativity the same symbol builds volumes and the dual of the electromagnetic field, and $\delta^\mu_\nu$ is the spacetime identity with $\delta^\mu_\mu = 4$.`,
  visual: {
    ...epsSlices({
      rings: [{ i: 'each', j: 'jj', k: 'kk', color: 'gold', r: 18 }, { i: 'each', j: 'll', k: 'mm', color: 'teal', r: 14 }],
      sliders: [
        { key: 'jj', label: '$j$', min: 1, max: 3, step: 1, value: 1, explain: t`Gold rings: the entry $\varepsilon_{ijk}$ in each slice.` },
        { key: 'kk', label: '$k$', min: 1, max: 3, step: 1, value: 2, explain: t`The column of the gold ring.` },
        { key: 'll', label: '$l$', min: 1, max: 3, step: 1, value: 1, explain: t`Teal rings: the entry $\varepsilon^{ilm}$ in each slice.` },
        { key: 'mm', label: '$m$', min: 1, max: 3, step: 1, value: 2, explain: t`The column of the teal ring.` },
      ],
      readouts: [
        { label: t`$\sum_i \varepsilon_{ijk}\varepsilon^{ilm}$`, expr: [1, 2, 3].map((i) => `${epsExpr(i, 'jj', 'kk')}*${epsExpr(i, 'll', 'mm')}`).join(' + '), digits: 3 },
        { label: t`$\delta^l_j\delta^m_k - \delta^m_j\delta^l_k$`, expr: `${deltaExpr('jj', 'll')}*${deltaExpr('kk', 'mm')} - ${deltaExpr('jj', 'mm')}*${deltaExpr('kk', 'll')}`, digits: 3 },
        ...[1, 2, 3].map((i) => ({ label: t`term $i = ${i}$`, expr: `${epsExpr(i, 'jj', 'kk')}*${epsExpr(i, 'll', 'mm')}`, digits: 3 })),
      ],
      caption: t`Slices of $\varepsilon$ (row $j$ or $l$, column $k$ or $m$). In each slice $i$ the gold ring marks $\varepsilon_{ijk}$ and the teal ring $\varepsilon^{ilm}$; the sum over $i$ multiplies each pair and adds the three products.`,
    }),
    title: 'Two Levi-Civita symbols make two deltas',
    lead: t`Choose the four free indices. In each slice the gold ring is $\varepsilon_{ijk}$ and the teal ring is $\varepsilon^{ilm}$; the readout adds their products over $i$ and compares the sum with $\delta^l_j\delta^m_k - \delta^m_j\delta^l_k$. Try to make them disagree — you cannot.`,
    tasks: [
      t`$j = 1, k = 2, l = 1, m = 2$: only the slice $i = 3$ has both rings on non-zero entries, and the sum is $(+1)(+1) = 1 = \delta^1_1\delta^2_2$.`,
      t`Swap $l$ and $m$: the sum becomes $-1$, because swapping two indices of $\varepsilon$ flips its sign.`,
      t`Set $j = k$: every gold ring sits on a 0, and the right-hand side cancels too.`,
    ],
  },
  example: {
    prompt: t`Prove $\mathbf A\times(\mathbf B\times\mathbf C) = \mathbf B\,(\mathbf A\cdot\mathbf C) - \mathbf C\,(\mathbf A\cdot\mathbf B)$ (“BAC minus CAB”) in Cartesian components, using the $\varepsilon$–$\delta$ identity.`,
    visual: arrows3([{ to: [1.6, 0.3, 0.2], color: 'accent', label: t`\mathbf A` }, { to: [0.4, 1.5, 0.3], color: 'violet', label: t`\mathbf B` }, { to: [0.3, 0.4, 1.4], color: 'teal', label: t`\mathbf C` }, { to: cross([1.6, 0.3, 0.2], cross([0.4, 1.5, 0.3], [0.3, 0.4, 1.4])).map((x) => x * 0.5), color: 'gold', label: t`\tfrac12\,\mathbf A\times(\mathbf B\times\mathbf C)` }], t`Three arrows and the triple product $\mathbf A\times(\mathbf B\times\mathbf C)$ (gold, at half scale). It lies in the plane of $\mathbf B$ and $\mathbf C$, as the identity says it must.`),
    steps: [
      { label: 'Write it in indices', text: t`$[\mathbf A\times(\mathbf B\times\mathbf C)]_i = \varepsilon_{ijk}A^j\,(\mathbf B\times\mathbf C)^k$, and $(\mathbf B\times\mathbf C)^k = \varepsilon^{klm}B_lC_m$ (in Cartesian components $B_l = B^l$). So the whole thing is $\varepsilon_{ijk}\,\varepsilon^{klm}\,A^jB_lC_m$.` },
      { label: 'Move the summed index to the front', text: t`The identity has the shared index first. A cyclic shift keeps the sign — $\varepsilon_{ijk} = \varepsilon_{kij}$ — so $\varepsilon_{ijk}\varepsilon^{klm} = \varepsilon_{kij}\varepsilon^{klm} = \delta^l_i\delta^m_j - \delta^m_i\delta^l_j$.` },
      { label: 'Let the deltas substitute', text: t`$(\delta^l_i\delta^m_j - \delta^m_i\delta^l_j)A^jB_lC_m = B_i\,(A^jC_j) - C_i\,(A^jB_j)$: each delta renames an index, and what is left of each term is a dot product.` },
      { label: 'Read it back', text: t`$A^jC_j = \mathbf A\cdot\mathbf C$ and $A^jB_j = \mathbf A\cdot\mathbf B$, so the $i$th component of the left side is $B_i(\mathbf A\cdot\mathbf C) - C_i(\mathbf A\cdot\mathbf B)$ for every $i$. ∎` },
      { label: 'Check', text: t`With $\mathbf A = \mathbf B = (1, 0, 0)$ and $\mathbf C = (0, 1, 0)$: the left side is $\mathbf A\times(0, 0, 1) = (0, -1, 0)$; the right side is $\mathbf B\cdot 0 - \mathbf C\cdot 1 = (0, -1, 0)$. ✓` },
    ],
    answer: t`$[\mathbf A\times(\mathbf B\times\mathbf C)]_i = \varepsilon_{kij}\varepsilon^{klm}A^jB_lC_m = B_i(\mathbf A\cdot\mathbf C) - C_i(\mathbf A\cdot\mathbf B)$.`,
  },
  practice: [
    num({
      id: 'eps-value', difficulty: 1,
      gen(r) {
        const tri = r.bool(0.75) ? r.pick([[1, 2, 3], [2, 3, 1], [3, 1, 2], [1, 3, 2], [3, 2, 1], [2, 1, 3]]) : r.pick([[1, 1, 2], [3, 2, 3], [2, 2, 2], [1, 3, 1]]);
        const e = eps(...tri) || 0;
        return {
          prompt: t`What is $\varepsilon_{${tri.join('')}}$?`,
          visual: WHEEL,
          answer: e, tol: { rel: 0, abs: 0.1 },
          hints: [e === 0 ? 'Look for a repeated index first.' : 'Is the order a cyclic shift of 1, 2, 3, or is it 1, 2, 3 with one pair swapped?'],
          teach: 'ε is +1 for cyclic orders of 123, −1 when one pair is swapped, and 0 with any repeat.',
          explain: e === 0 ? t`An index repeats, so $\varepsilon_{${tri.join('')}} = 0$: swapping the two equal indices would have to flip the sign of a number equal to itself.` : t`${tri.join('')} is ${e > 0 ? 'a cyclic shift of 123 (with the arrows on the wheel): even' : 'one swap away from 123 (against the arrows): odd'}, so $\varepsilon_{${tri.join('')}} = ${e > 0 ? '+1' : '-1'}$.`,
        };
      },
    }),
    num({
      id: 'delta', difficulty: 1,
      gen(r) {
        const kind = r.pick(['sub', 'trace', 'pair']);
        if (kind === 'trace') {
          const n = r.pick([2, 3, 4]);
          return {
            prompt: t`In ${n} dimensions (each index runs over ${n} values), what is $\delta^i_i$?`,
            visual: ID3,
            answer: n, tol: { rel: 0, abs: 0.1 },
            errors: [{ value: 1, feedback: t`$\delta^i_i$ is a sum over $i$: $\delta^1_1 + \delta^2_2 + \dots$, one 1 for every value.` }],
            hints: [t`The repeated $i$ is summed: add up the diagonal.`],
            teach: 'A repeated index on the delta is a trace: it counts the dimensions.',
            explain: t`$\delta^i_i = \delta^1_1 + \dots + \delta^${n}_${n} = ${n}$. In spacetime $\delta^\mu_\mu = 4$.`,
          };
        }
        const V = [r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0]), r.intExcept(-6, 6, [0])];
        if (kind === 'sub') {
          const i = r.int(1, 3);
          return {
            prompt: t`With $V^j = ${vecTeX(V)}$, what is $\delta^i_j\,V^j$ for $i = ${i}$?`,
            visual: { ...ID3, caption: t`$\delta^i_j$: in row $i = ${i}$ only the diagonal entry is 1, so the sum over $j$ picks out one component.` },
            answer: V[i - 1], tol: { rel: 0, abs: 0.1 },
            errors: V.reduce((s, x) => s + x, 0) !== V[i - 1] ? [{ value: V.reduce((s, x) => s + x, 0), feedback: t`Each term is multiplied by $\delta^${i}_j$, which is 0 unless $j = ${i}$.` }] : [],
            hints: [t`Write out the sum: $\delta^${i}_1V^1 + \delta^${i}_2V^2 + \delta^${i}_3V^3$.`],
            teach: 'Contracting with δ substitutes one index for another.',
            explain: t`Only the $j = ${i}$ term survives: $\delta^${i}_jV^j = V^${i} = ${V[i - 1]}$.`,
          };
        }
        const A = [r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0]), r.intExcept(-4, 4, [0])];
        let s = dot(A, V);
        if (s === 0) { V[0] = -V[0]; s = dot(A, V); }
        return {
          prompt: t`With $A_i = ${vecTeX(A)}$ and $V^j = ${vecTeX(V)}$, evaluate $\delta^i_j\,A_i\,V^j$.`,
          visual: legs([{ name: 'A' }, { name: 'δ' }, { name: 'V' }], { links: [{ a: 0, b: 1, index: 'i' }, { a: 1, b: 2, index: 'j' }], caption: t`$A_i\,\delta^i_j\,V^j$: the delta sits in the chain and simply joins $A$ to $V$.` }),
          answer: s, tol: { rel: 0, abs: 0.1 },
          hints: [t`First let the delta act: $\delta^i_jV^j = V^i$.`, t`Then $A_iV^i = A_1V^1 + A_2V^2 + A_3V^3$.`],
          teach: 'A delta in a chain of contractions just renames an index.',
          explain: t`$\delta^i_jA_iV^j = A_iV^i = ${A.map((a, k) => `(${a})(${V[k]})`).join(' + ')} = ${s}$.`,
        };
      },
    }),
    num({
      id: 'cross', difficulty: 2,
      gen(r) {
        let A, B, C;
        for (let n = 0; n < 60; n++) {     // redraw until no component of A × B is 0
          A = ints(r, 3); B = ints(r, 3); C = cross(A, B);
          if (C.every((x) => x !== 0)) break;
          if (n === 59) { A = [2, -1, 3]; B = [1, 2, -1]; C = cross(A, B); }
        }
        const i = r.int(1, 3), j = (i % 3) + 1, k = (j % 3) + 1;
        const wrong = -C[i - 1];
        return {
          prompt: t`With $A^j = ${vecTeX(A)}$ and $B^k = ${vecTeX(B)}$, find $(\mathbf A\times\mathbf B)_${i} = \varepsilon_{${i}jk}\,A^jB^k$.`,
          visual: arrows3([{ to: A, color: 'accent', label: t`\mathbf A` }, { to: B, color: 'violet', label: t`\mathbf B` }], t`The two arrows. Their cross product is perpendicular to both — not drawn, since it is the answer.`),
          answer: C[i - 1], tol: { rel: 0, abs: 0.1 },
          errors: wrong !== C[i - 1] ? [{ value: wrong, feedback: t`Sign slip: $\varepsilon_{${i}${j}${k}} = +1$ goes with $A^${j}B^${k}$, and $\varepsilon_{${i}${k}${j}} = -1$ with $A^${k}B^${j}$.` }] : [],
          hints: [t`With $i = ${i}$ fixed, only $(j, k) = (${j}, ${k})$ and $(${k}, ${j})$ give non-zero $\varepsilon$.`, t`$(\mathbf A\times\mathbf B)_${i} = \varepsilon_{${i}${j}${k}}A^${j}B^${k} + \varepsilon_{${i}${k}${j}}A^${k}B^${j} = A^${j}B^${k} - A^${k}B^${j}$.`],
          teach: t`Of the nine terms in $\varepsilon_{ijk}A^jB^k$ for a fixed $i$, only two survive, with opposite signs.`,
          explain: t`$(\mathbf A\times\mathbf B)_${i} = A^${j}B^${k} - A^${k}B^${j} = (${A[j - 1]})(${B[k - 1]}) - (${A[k - 1]})(${B[j - 1]}) = ${C[i - 1]}$. All three: $${vecTeX(C)}$.`,
        };
      },
    }),
    num({
      id: 'volume', difficulty: 2,
      gen(r) {
        let A, B, C, v;
        for (let n = 0; n < 40; n++) {
          A = [r.int(1, 3), r.int(-1, 1), r.int(0, 1)]; B = [r.int(-1, 1), r.int(1, 3), r.int(-1, 1)]; C = [r.int(-1, 1), r.int(0, 1), r.int(1, 3)];
          v = dot(A, cross(B, C));
          if (v !== 0) break;
          if (n === 39) { A = [2, 0, 1]; B = [1, 3, 0]; C = [0, 1, 2]; v = dot(A, cross(B, C)); }
        }
        return {
          prompt: t`Three edges of a parallelepiped are $\mathbf A = ${vecTeX(A)}$, $\mathbf B = ${vecTeX(B)}$ and $\mathbf C = ${vecTeX(C)}$ m. Its signed volume is $\varepsilon_{ijk}A^iB^jC^k$. Evaluate it.`,
          visual: arrows3([{ to: A, color: 'accent', label: t`\mathbf A` }, { to: B, color: 'violet', label: t`\mathbf B` }, { to: C, color: 'teal', label: t`\mathbf C` }], t`The three edges, with the face spanned by $\mathbf A$ and $\mathbf B$ shaded.`, { parallelograms: [{ at: [0, 0, 0], u: A, v: B, color: 'gold', alpha: 0.25 }] }),
          answer: v, units: 'm^3', tol: { rel: 0, abs: 0.1 },
          hints: [t`$\varepsilon_{ijk}A^iB^jC^k$ is the determinant of the $3\times3$ array with rows $\mathbf A$, $\mathbf B$, $\mathbf C$.`, t`Equivalently $\mathbf A\cdot(\mathbf B\times\mathbf C)$: first $\mathbf B\times\mathbf C = ${vecTeX(cross(B, C))}$.`],
          teach: t`$\varepsilon_{ijk}A^iB^jC^k$ is the determinant of the three arrows: the signed volume they span.`,
          explain: t`$\mathbf B\times\mathbf C = ${vecTeX(cross(B, C))}$, so $\varepsilon_{ijk}A^iB^jC^k = \mathbf A\cdot(\mathbf B\times\mathbf C) = ${v}\ \text{m}^3$. ${v > 0 ? 'Positive: the three edges, in this order, are right-handed.' : 'Negative: in this order they are left-handed; the volume is the absolute value.'}`,
        };
      },
    }),
    num({
      id: 'eps-eps', difficulty: 2,
      gen(r) {
        const [tex, ans, why] = r.pick([
          [t`\varepsilon_{ijk}\,\varepsilon^{ijk}`, 6, t`the six non-zero entries, each squared: $6 \times 1 = 6$ (or from the identity: $\delta^j_j\delta^k_k - \delta^k_j\delta^j_k = 9 - 3$)`],
          [t`\varepsilon_{1jk}\,\varepsilon^{1jk}`, 2, t`with $i = 1$ fixed only $(j, k) = (2, 3)$ and $(3, 2)$ survive: $1 + 1 = 2$`],
          [t`\varepsilon_{ij3}\,\varepsilon^{ij3}`, 2, t`only $(i, j) = (1, 2)$ and $(2, 1)$ survive: $1 + 1 = 2$ — the contracted identity $\varepsilon_{ijk}\varepsilon^{ijm} = 2\delta^m_k$ with $k = m = 3$`],
          [t`\varepsilon_{ijk}\,\varepsilon^{ijk}\,\delta^l_l`, 18, t`$\varepsilon_{ijk}\varepsilon^{ijk} = 6$ and $\delta^l_l = 3$ are separate sums: $6 \times 3 = 18$`],
        ]);
        return {
          prompt: t`Evaluate $${tex}$ (all indices run over 1, 2, 3, and repeated ones are summed).`,
          visual: epsSlices({}),
          answer: ans, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: 27, feedback: 'Only 6 of the 27 entries are non-zero; the zeros contribute nothing.' }, { value: 3, feedback: 'Every non-zero entry squared gives +1, whatever its sign: count them.' }].filter((e) => e.value !== ans),
          hints: ['Each product of an entry with itself is 1 if the entry is non-zero and 0 if not.', 'So count the non-zero entries the sum runs over.'],
          teach: 'A full contraction of ε with itself counts its non-zero entries.',
          explain: t`The sum runs over ${why}.`,
        };
      },
    }),
    code({
      id: 'verify-identity', difficulty: 3,
      prompt: t`Check the $\varepsilon$–$\delta$ identity numerically, all 81 cases at once. Build the array \`eps\` of shape \`(3, 3, 3)\` (Python counts from 0, so \`eps[0, 1, 2]\` is $\varepsilon_{123}$), then use \`np.einsum\` — NumPy’s summation convention — to form the left side $\varepsilon_{ijk}\varepsilon^{ilm}$ and the right side $\delta^l_j\delta^m_k - \delta^m_j\delta^l_k$ as arrays indexed \`[j, k, l, m]\`. Set \`ok\` to whether they agree, and \`full\` to $\varepsilon_{ijk}\varepsilon^{ijk}$.`,
      visual: epsSlices({}),
      starter: t`import numpy as np

eps = np.zeros((3, 3, 3))
# fill in the six non-zero entries, e.g. eps[0, 1, 2] = 1  (that is ε₁₂₃)

d = np.eye(3)                                    # the Kronecker delta
lhs = np.einsum('ijk,ilm->jklm', eps, eps)      # sum over the repeated i
rhs = None                                       # δ^l_j δ^m_k − δ^m_j δ^l_k, indexed [j, k, l, m]
ok = False
full = None
print(ok, full)
`,
      answer: t`import numpy as np

eps = np.zeros((3, 3, 3))
for i, j, k in [(0, 1, 2), (1, 2, 0), (2, 0, 1)]:
    eps[i, j, k] = 1       # even orders
    eps[i, k, j] = -1      # one swap: odd

d = np.eye(3)
lhs = np.einsum('ijk,ilm->jklm', eps, eps)
rhs = np.einsum('jl,km->jklm', d, d) - np.einsum('jm,kl->jklm', d, d)
ok = np.allclose(lhs, rhs)
full = np.einsum('ijk,ijk->', eps, eps)
print(ok, full)`,
      tests: [
        { name: 'eps has +1 at ε₁₂₃, ε₂₃₁, ε₃₁₂ and −1 at ε₁₃₂, ε₃₂₁, ε₂₁₃', code: 'eps[0,1,2] == 1 and eps[1,2,0] == 1 and eps[2,0,1] == 1 and eps[0,2,1] == -1 and eps[2,1,0] == -1 and eps[1,0,2] == -1' },
        { name: 'every other entry of eps is 0', code: 'abs(eps).sum() == 6' },
        { name: 'rhs is the δδ − δδ array, indexed [j, k, l, m]', code: 'rhs is not None and np.shape(rhs) == (3, 3, 3, 3) and rhs[0,1,0,1] == 1 and rhs[0,1,1,0] == -1 and rhs[0,0,0,0] == 0' },
        { name: 'the identity holds: ok is True', code: 'ok == True and np.allclose(lhs, rhs)' },
        { name: t`$\varepsilon_{ijk}\varepsilon^{ijk} = 6$`, code: 'full is not None and abs(full - 6) < 1e-12' },
      ],
      hints: [
        t`Fill \`eps\` with a loop over the three cyclic orders \`(0, 1, 2), (1, 2, 0), (2, 0, 1)\`: set \`eps[i, j, k] = 1\` and the swapped \`eps[i, k, j] = -1\`.`,
        t`The first product $\delta^l_j\delta^m_k$ indexed \`[j, k, l, m]\` is \`np.einsum('jl,km->jklm', d, d)\`; the second swaps the roles of \`l\` and \`m\`.`,
        t`Then \`ok = np.allclose(lhs, rhs)\` and \`full = np.einsum('ijk,ijk->', eps, eps)\`.`,
      ],
      teach: 'np.einsum is the summation convention in code: repeated letters are summed, letters after the arrow are free.',
      explain: t`The identity holds in all 81 cases. Note how the subscript strings mirror the index expressions: \`'ijk,ilm->jklm'\` is $\varepsilon_{ijk}\varepsilon^{ilm}$ with $i$ summed and $j, k, l, m$ free. (NumPy ignores heights — they are your job.)`,
    }),
    mcq({
      id: 'a-cross-a', difficulty: 2,
      prompt: t`What is $\varepsilon_{ijk}\,A^j A^k$, for any vector $\mathbf A$?`,
      visual: legs([{ name: 'ε', down: ['i'] }, { name: 'A' }, { name: 'A' }], { links: [{ a: 0, b: 1, index: 'j' }, { a: 0, b: 2, index: 'k', arc: true }], caption: t`$\varepsilon_{ijk}A^jA^k$: both remaining slots of $\varepsilon$ are filled with the same vector.` }),
      choices: ['0, for every i', t`$|\mathbf A|^2$, for every $i$`, t`$2A_i$`, t`It depends on $\mathbf A$`],
      answer: 0,
      why: {
        1: t`The square of the length is $A^jA_j$, a contraction with a delta, not with $\varepsilon$.`,
        2: t`No term survives to give a component of $\mathbf A$: the $(j, k)$ and $(k, j)$ terms cancel in pairs.`,
        3: t`The cancellation happens term by term, whatever the numbers $A^j$ are.`,
      },
      hints: [t`Swap the names of the dummies $j$ and $k$, then use $\varepsilon_{ikj} = -\varepsilon_{ijk}$.`, t`A number equal to minus itself is 0.`],
      teach: t`Contracting the antisymmetric $\varepsilon$ with a symmetric pair such as $A^jA^k$ always gives 0.`,
      explain: t`Renaming dummies, $\varepsilon_{ijk}A^jA^k = \varepsilon_{ikj}A^kA^j = -\varepsilon_{ijk}A^jA^k$, so it is 0: $\mathbf A\times\mathbf A = 0$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-area', difficulty: 3,
      gen(r) {
        let A, B, area2;
        for (let n = 0; n < 40; n++) {
          A = ints(r, 3); B = ints(r, 3);
          area2 = dot(A, A) * dot(B, B) - dot(A, B) ** 2;
          if (area2 > 0) break;
          if (n === 39) { A = [1, 2, 0]; B = [0, 1, 3]; area2 = dot(A, A) * dot(B, B) - dot(A, B) ** 2; }
        }
        return {
          prompt: t`A solar-panel frame is the parallelogram spanned by $\mathbf A = ${vecTeX(A)}$ m and $\mathbf B = ${vecTeX(B)}$ m. Its area is $|\mathbf A\times\mathbf B|$, and the $\varepsilon$–$\delta$ identity gives $|\mathbf A\times\mathbf B|^2 = |\mathbf A|^2|\mathbf B|^2 - (\mathbf A\cdot\mathbf B)^2$. Find the area.`,
          visual: arrows3([{ to: A, color: 'accent', label: t`\mathbf A` }, { to: B, color: 'violet', label: t`\mathbf B` }], 'The two edges and the parallelogram they span.', { parallelograms: [{ at: [0, 0, 0], u: A, v: B, color: 'gold', alpha: 0.3 }] }),
          answer: Math.sqrt(area2), units: 'm^2', tol: { rel: 0.005 },
          errors: [{ value: area2, feedback: 'That is the area squared: take the square root.' }].filter((e) => Math.abs(e.value - Math.sqrt(area2)) > 0.01),
          hints: [t`$|\mathbf A|^2 = ${dot(A, A)}$, $|\mathbf B|^2 = ${dot(B, B)}$, $\mathbf A\cdot\mathbf B = ${dot(A, B)}$.`, 'Area² = |A|²|B|² − (A·B)²; then take the root.'],
          teach: 'Contracting two ε’s turns |A × B|² into dot products: |A|²|B|² − (A·B)².',
          explain: t`$|\mathbf A\times\mathbf B|^2 = ${dot(A, A)}\cdot${dot(B, B)} - (${dot(A, B)})^2 = ${area2}$, so the area is $\sqrt{${area2}} = ${nice(Math.sqrt(area2), 4)}\ \text{m}^2$. (Directly: $\mathbf A\times\mathbf B = ${vecTeX(cross(A, B))}$, whose length squared is also $${area2}$.)`,
        };
      },
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const [name, R, v, inc] = r.pick([['the International Space Station', 6791, 7.66, 51.64], ['a GPS satellite', 26560, 3.874, 55.0], ['the Hubble Space Telescope', 6915, 7.59, 28.47], ['a sun-synchronous Earth-observation satellite', 7080, 7.50, 98.2]]);
        const node = r.pick([0, 30, 60, 120]) * DEG, i = inc * DEG;
        const rv = [R * Math.cos(node), R * Math.sin(node), 0].map((x) => Math.round(x));
        const vv = [-v * Math.sin(node) * Math.cos(i), v * Math.cos(node) * Math.cos(i), v * Math.sin(i)].map((x) => +x.toFixed(3));
        const h = cross(rv, vv);
        const ang = Math.acos(h[2] / Math.hypot(...h)) / DEG;
        return {
          prompt: t`As ${name} crosses the equator going north, its position and velocity in Earth-centred axes ($\mathbf e_3$ toward the North Pole) are $r^j = ${vecTeX(rv)}$ km and $v^k = ${vecTeX(vv)}$ km/s. Its angular momentum per unit mass is $h_i = \varepsilon_{ijk}\,r^jv^k$, perpendicular to the orbit. The orbit’s inclination is the angle between $\mathbf h$ and $\mathbf e_3$. Find it.`,
          visual: arrows3([{ to: rv.map((x) => (1.6 * x) / R), color: 'accent', label: t`\mathbf r` }, { to: vv.map((x) => (1.6 * x) / v), color: 'violet', label: t`\mathbf v` }, { to: h.map((x) => (1.6 * x) / Math.hypot(...h)), color: 'gold', label: t`\mathbf h` }], t`Directions only: $\mathbf r$, $\mathbf v$ and $\mathbf h = \mathbf r\times\mathbf v$, each scaled to the same length. Real orbits are not quite circles; at this point $\mathbf v$ is taken perpendicular to $\mathbf r$.`, { curves: [{ param: ['1.6*cos(t)', '1.6*sin(t)', 0], t: [0, 6.2832], color: 'ink3' }] }),
          answer: ang, units: '°', tol: { rel: 0.003 },
          errors: [{ value: 180 - ang, feedback: t`Check the sign of $h_3 = r^1v^2 - r^2v^1$: the inclination is $\arccos(h_3/|\mathbf h|)$.` }],
          hints: [t`$h_3 = \varepsilon_{3jk}r^jv^k = r^1v^2 - r^2v^1$; you also need $h_1 = r^2v^3 - r^3v^2$ and $h_2 = r^3v^1 - r^1v^3$ for $|\mathbf h|$.`, t`Inclination $= \arccos(h_3/|\mathbf h|)$.`],
          teach: 'The orbit’s orientation is carried by h = r × v, and ε turns that into three short sums.',
          explain: t`$\mathbf h = ${vecTeX(h.map((x) => Math.round(x)))}$ km²/s, $|\mathbf h| = ${Math.round(Math.hypot(...h))}$ km²/s, so $\cos i = ${nice(h[2] / Math.hypot(...h), 4)}$ and $i = ${nice(ang, 4)}^\circ$ (the published value is $${inc}^\circ$).${inc > 90 ? ' Above 90°: the orbit is retrograde, as sun-synchronous orbits must be.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'cp-contract', difficulty: 2,
      prompt: t`Use the identity $\varepsilon_{ijk}\varepsilon^{ilm} = \delta^l_j\delta^m_k - \delta^m_j\delta^l_k$ to simplify $\varepsilon_{ijk}\,\varepsilon^{ijm}$ (in three dimensions).`,
      visual: epsSlices({ rings: [{ i: 'each', j: 1, k: 3, color: 'gold', r: 18 }, { i: 'each', j: 1, k: 3, color: 'teal', r: 14 }], caption: t`One case, $k = m = 3$ with $j = 1$: the rings coincide, and only slice $i = 2$ contributes. Summing over $j$ as well collects a second contribution.` }),
      choices: [t`$2\,\delta^m_k$`, t`$3\,\delta^m_k$`, t`$\delta^m_k$`, '0'],
      answer: 0,
      why: {
        1: t`That keeps only the first term, $\delta^j_j\delta^m_k$. The second, $-\delta^m_j\delta^j_k = -\delta^m_k$, takes one away.`,
        2: t`$\delta^j_j = 3$, not 1: it is a trace.`,
        3: t`For $k = m$ the sum is a sum of squares of non-zero entries, which cannot vanish.`,
      },
      hints: [t`Set $l = j$ in the identity: the contraction sums over $j$.`],
      teach: t`Contracting one more pair in the $\varepsilon$–$\delta$ identity gives $\varepsilon_{ijk}\varepsilon^{ijm} = 2\delta^m_k$.`,
      explain: t`With $l = j$ summed: $\delta^j_j\delta^m_k - \delta^m_j\delta^j_k = 3\delta^m_k - \delta^m_k = 2\delta^m_k$. Contracting $k$ with $m$ too gives $2\times3 = 6$.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1–2 (the Kronecker delta and the Levi-Civita symbol)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Fleisch, A Student’s Guide to Vectors and Tensors, ch. 5', url: 'https://www.cambridge.org/9780521171908' },
  ],
});
