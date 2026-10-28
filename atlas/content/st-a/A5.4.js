// Contraction: summing one upper index against one lower index lowers the
// type from (k, l) to (k − 1, l − 1) and gives a tensor; for a (1,1) tensor
// it is the trace, the same in every basis. Two lower indices cannot be
// contracted without a metric.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { still, legs, grid } from './_ten.js';
import { matTeX, vecTeX, cong, inv2, mul, cols, trace, dot } from './_metric.js';

const t = String.raw;
const SQ = [[1, 0], [0, 1]];
const BASES = [[[1, 1], [0, 1]], [[2, 1], [1, 1]], [[1, 0], [1, 2]], [[2, 0], [1, 1]], [[1, -1], [1, 1]]];
const FLOW = (P, Q, caption, probe = [0.6, 0.5]) => ({ type: 'field2d', params: { P, Q, x: [-2, 2], y: [-2, 2], density: 12, probe, readout: false }, caption });
// the explore graph: diagonal entries of a (1,1) tensor M under a one-parameter family of bases
const M0 = [[2, 1], [0.5, 1]];

export default lesson({
  id: 'st-a.A5.4',
  title: 'Contraction',
  minutes: 11, difficulty: 3,
  intro: t`**Contraction** feeds a tensor’s covector slot and one of its vector slots to each other: set an upper index equal to a lower one and sum. A type $(k, l)$ tensor becomes a type $(k-1, l-1)$ tensor. On a (1,1) tensor it gives a single number, the **trace** $T^\mu{}_\mu$ — and that number is **the same in every basis**, because the two Jacobian factors are inverse matrices and cancel:

$$T'^\mu{}_\mu = \frac{\partial x'^\mu}{\partial x^\alpha}\,\frac{\partial x^\beta}{\partial x'^\mu}\;T^\alpha{}_\beta = \delta^\beta_\alpha\,T^\alpha{}_\beta = T^\alpha{}_\alpha$$

Without coordinates: on a product $\mathbf V\otimes\omega$ the contraction is the pairing $\omega(\mathbf V)$, and every (1,1) tensor is a sum of such products. The pairing $\omega_\mu V^\mu$ of lesson A3.3 is the contraction of $\omega\otimes\mathbf V$. Two rules follow. **Only an upper with a lower**: $T_{\mu\mu}$, two lower indices summed, changes with the basis (lesson A5.2 watched it jump from 5 to 8) — pairing two lower indices takes a metric (lesson A6.4). And **which pair matters**: contracting different slots of the same tensor gives different tensors.`,
  symbols: [
    { tex: t`T^\mu{}_\mu`, text: t`the contraction (trace) of a (1,1) tensor: $T^1{}_1 + T^2{}_2 + \dots$` },
    { tex: t`\dfrac{\partial x'^\mu}{\partial x^\alpha}`, text: 'the Jacobian factor carried by the upper index' },
    { tex: t`\dfrac{\partial x^\beta}{\partial x'^\mu}`, text: 'the factor carried by the lower index — the inverse matrix' },
    { tex: t`\delta^\beta_\alpha`, text: t`the Kronecker delta: what the two factors multiply to once $\mu$ is summed` },
  ],
  why: t`The Ricci tensor $R_{\mu\nu} = R^\lambda{}_{\mu\lambda\nu}$ and the scalar curvature in Einstein’s equations are contractions of the Riemann tensor, and every invariant — a number all observers agree on — is a fully contracted tensor.`,
  visual: {
    type: 'graph',
    title: 'Diagonal entries trade; their sum stays',
    lead: t`A fixed (1,1) tensor $M = ${matTeX(M0)}$, written in a family of bases. Across: the parameter $s$ of the basis (a shear $\mathbf e'_2 = s\,\mathbf e_1 + \mathbf e_2$, or a rotation by $s$ radians). The blue and violet curves are the new diagonal entries; gold is their sum. The dashed curve is what you get if you wrongly read the same array as a (0,2) tensor and add its diagonal.`,
    tasks: [
      t`Slide $s$ with the shear: $M'^1{}_1$ falls as $M'^2{}_2$ rises, and the gold sum stays at 3.`,
      t`The dashed (0,2) sum leaves 3 at once: summing two lower indices is not a contraction.`,
      t`Switch to the rotation: now the dashed curve sits on the gold one too — for rotations $A^{-1} = A^\mathsf{T}$, so upper and lower indices transform alike. Only perpendicular unit bases hide the difference.`,
    ],
    params: {
      x: [-2, 2], y: [-0.3, 6.5], aspect: 'wide', xlabel: 's (basis parameter)', ylabel: 'component',
      choices: [{ key: 'kind', label: 'Change of basis', options: [[0, 'Shear'], [1, 'Rotation']], value: 0, explain: t`Shear: $\mathbf e'_1 = \mathbf e_1$, $\mathbf e'_2 = s\,\mathbf e_1 + \mathbf e_2$. Rotation: both arrows turned by $s$ radians.` }],
      sliders: [{ key: 's', label: t`$s$`, min: -2, max: 2, step: 0.05, value: 0.8, explain: 'Which basis of the family; s = 0 is the original basis.' }],
      curves: [
        { fn: '2 - 0.5*x', color: 'accent', width: 2.2, when: 'step(0.5 - kind)', label: 'M′¹₁', labelAt: 1.6, labelDy: 14 },
        { fn: '1 + 0.5*x', color: 'violet', width: 2.2, when: 'step(0.5 - kind)', label: 'M′²₂', labelAt: 1.6, labelDy: -12 },
        { fn: '3 + 1.5*x + 2*x^2', color: 'ink3', width: 2, dash: [6, 5], when: 'step(0.5 - kind)', label: 'T′₁₁ + T′₂₂ (misread)', labelAt: -1.45, labelDx: 10 },
        { fn: '2*cos(x)^2 + 1.5*cos(x)*sin(x) + sin(x)^2', color: 'accent', width: 2.2, when: 'step(kind - 0.5)', label: 'M′¹₁', labelAt: 0.75 },
        { fn: '2*sin(x)^2 - 1.5*cos(x)*sin(x) + cos(x)^2', color: 'violet', width: 2.2, when: 'step(kind - 0.5)', label: 'M′²₂', labelAt: 0.75, labelDy: 14 },
        { fn: '3', color: 'ink3', width: 2, dash: [6, 5], when: 'step(kind - 0.5)' },
        { fn: '3', color: 'gold', width: 3, label: 'trace of M′ = 3', labelAt: -1.95, labelDy: -12 },
      ],
      vlines: [{ x: 's', color: 'ink3' }],
      readouts: [
        { label: t`$M'^1{}_1$`, expr: '(1 - kind)*(2 - 0.5*s) + kind*(2*cos(s)^2 + 1.5*cos(s)*sin(s) + sin(s)^2)', digits: 3 },
        { label: t`$M'^2{}_2$`, expr: '(1 - kind)*(1 + 0.5*s) + kind*(2*sin(s)^2 - 1.5*cos(s)*sin(s) + cos(s)^2)', digits: 3 },
        { label: t`$M'^\mu{}_\mu$`, expr: '3', digits: 3 },
        { label: t`(0,2) misreading $T'_{11} + T'_{22}$`, expr: '(1 - kind)*(3 + 1.5*s + 2*s^2) + kind*3', digits: 3 },
      ],
    },
    caption: t`Computed from $M' = A^{-1}MA$ (a (1,1) tensor) and $T' = A^\mathsf{T}MA$ (the same array misread as (0,2)), with $A$ the matrix whose columns are the new basis arrows.`,
  },
  example: {
    prompt: t`A two-dimensional flow has velocity $\mathbf v = (3x + y,\ 2x - y)$, so its velocity gradient, the (1,1) tensor $G^\mu{}_\nu = \partial_\nu v^\mu$, is $${matTeX([[3, 1], [2, -1]])}$ everywhere. Find its trace, then its components in the basis $\mathbf e'_1 = 2\mathbf e_1 + \mathbf e_2$, $\mathbf e'_2 = \mathbf e_1 + \mathbf e_2$, and check the trace there.`,
    visual: FLOW('3*x + y', '2*x - y', t`The flow $\mathbf v = (3x + y, 2x - y)$. Its divergence — the rate a small patch of fluid grows in area, per unit area — is the trace of the velocity gradient, the same at every point and in every basis.`),
    steps: [
      { label: 'Trace', text: t`$G^\mu{}_\mu = 3 + (-1) = 2$. That is the divergence $\partial_\mu v^\mu$: each patch of fluid grows in area at a rate of 2 per unit time per unit area.` },
      { label: 'The basis matrices', text: t`$A = ${matTeX([[2, 1], [1, 1]])}$ (columns: the new arrows), $\det A = 1$, $A^{-1} = ${matTeX([[1, -1], [-1, 2]])}$.` },
      { label: 'Transform', text: t`One upper and one lower index: $G' = A^{-1}GA$. First $GA = ${matTeX([[7, 4], [3, 1]])}$, then $A^{-1}(GA) = ${matTeX([[4, 3], [-1, -2]])}$.` },
      { label: 'Check', text: t`$G'^\mu{}_\mu = 4 + (-2) = 2$. ✓ Every entry changed; the trace did not.` },
      { label: 'The wrong way', text: t`Summing a (0,2) reading would give $A^\mathsf{T}GA = ${matTeX(cong([[3, 1], [2, -1]], [[2, 1], [1, 1]]))}$, diagonal sum $${trace(cong([[3, 1], [2, -1]], [[2, 1], [1, 1]]))}$ — a number that depends on the basis, so it measures nothing.` },
    ],
    answer: t`$G^\mu{}_\mu = 2$; $G' = ${matTeX([[4, 3], [-1, -2]])}$, with the same trace 2 — the flow’s divergence.`,
  },
  practice: [
    num({
      id: 'trace3', difficulty: 1,
      gen(r) {
        let M;
        do { M = [0, 1, 2].map(() => [0, 1, 2].map(() => r.int(-4, 5))); } while (trace(M) === 0);
        const offsum = M.flat().reduce((a, b) => a + b, 0) - trace(M);
        return {
          prompt: t`A (1,1) tensor in three dimensions has components $M^\mu{}_\nu = ${matTeX(M)}$ (rows $\mu$, columns $\nu$). What is its contraction $M^\mu{}_\mu$?`,
          visual: grid(M, { hl: [[0, 0], [1, 1], [2, 2]], rowNames: ['μ=1', 'μ=2', 'μ=3'], colNames: ['ν=1', 'ν=2', 'ν=3'], dx: 1.3, caption: t`The contraction sets $\nu = \mu$: only the ringed entries take part.` }),
          answer: trace(M), tol: { rel: 0, abs: 0.01 },
          errors: [{ value: trace(M) + offsum, feedback: 'That adds every entry. Contraction keeps only the terms with the upper index equal to the lower one: the diagonal.' }].filter((e) => e.value !== trace(M)),
          hints: [t`$M^\mu{}_\mu = M^1{}_1 + M^2{}_2 + M^3{}_3$.`],
          teach: 'Contracting a (1,1) tensor sums its diagonal — and the result is a scalar.',
          explain: t`$${M[0][0]} + (${M[1][1]}) + (${M[2][2]}) = ${trace(M)}$, the same in every basis.`,
        };
      },
    }),
    num({
      id: 'pairing', difficulty: 1,
      gen(r) {
        let w, V;
        do { w = [r.intExcept(-2, 2, [0]), r.int(-2, 2)]; V = [r.int(-2, 2), r.intExcept(-2, 2, [0])]; } while (dot(w, V) === 0);
        return {
          prompt: t`Contract the (1,1) tensor $\mathbf V\otimes\omega$, with $V^\mu = ${vecTeX(V)}$ and $\omega_\nu = ${vecTeX(w)}$, on its only pair of indices: find $V^\mu\omega_\mu$.`,
          visual: still({ mode: 'covector', basis: SQ, covector: w, vector: V, covSliders: false, levelLabels: true, crossings: false, construction: false, grid: 'none' }, t`The arrow $\mathbf V$ and the stack of $\omega$: the contraction counts the lines the arrow crosses.`),
          answer: dot(w, V), tol: { rel: 0, abs: 0.01 },
          hints: [t`$V^\mu\omega_\mu = V^1\omega_1 + V^2\omega_2$.`],
          teach: t`Contracting $\mathbf V\otimes\omega$ is the pairing $\omega(\mathbf V)$: the most basic contraction of all.`,
          explain: t`$(${V[0]})(${w[0]}) + (${V[1]})(${w[1]}) = ${dot(w, V)}$ — the signed number of lines crossed.`,
        };
      },
    }),
    num({
      id: 'lower-sum-moves', difficulty: 2,
      gen(r) {
        let A, T, Tn;
        do { A = r.pick(BASES); T = [[r.int(-2, 3), r.int(-2, 2)], [r.int(-2, 2), r.int(-2, 3)]]; Tn = cong(T, A); } while (trace(Tn) === trace(T) || trace(T) === 0);
        const mixed = trace(mul(mul(inv2(A), T), A));
        return {
          prompt: t`A (0,2) tensor has $T_{\mu\nu} = ${matTeX(T)}$, so $T_{11} + T_{22} = ${trace(T)}$. In the basis $\mathbf e'_\nu = A^\beta{}_\nu\mathbf e_\beta$ with $A = ${matTeX(A)}$, what is $T'_{11} + T'_{22}$?`,
          visual: still({ basis: cols(A), ghost: SQ, showVector: false, construction: false, grid: 'none' }, t`The new basis (bold, the columns of $A$) over the old (faint).`),
          answer: trace(Tn), tol: { rel: 0, abs: 0.01 },
          errors: [{ value: trace(T), feedback: t`That assumes the sum is invariant. It is not a contraction — both indices are lower — so it changes with the basis.` }, ...(mixed !== trace(Tn) && mixed !== trace(T) ? [{ value: mixed, feedback: t`That used the (1,1) law $A^{-1}TA$. Both indices are lower: $T' = A^\mathsf{T}TA$.` }] : [])],
          hints: [t`$T'_{\mu\nu} = A^\alpha{}_\mu A^\beta{}_\nu T_{\alpha\beta}$: $T'_{11} = T(\mathbf e'_1, \mathbf e'_1)$ and $T'_{22} = T(\mathbf e'_2, \mathbf e'_2)$.`, t`$\mathbf e'_1 = ${vecTeX(cols(A)[0])}$ and $\mathbf e'_2 = ${vecTeX(cols(A)[1])}$.`],
          teach: 'Summing two lower indices is not a contraction: the result depends on the basis.',
          explain: t`$T' = A^\mathsf{T}TA = ${matTeX(Tn)}$, so $T'_{11} + T'_{22} = ${trace(Tn)}$, not $${trace(T)}$. With a metric you could raise one index first; then the trace $T^\mu{}_\mu$ would be invariant.`,
        };
      },
    }),
    multi({
      id: 'valid', difficulty: 2,
      prompt: 'Which of these are contractions — and so tensors, transforming properly? Select every one.',
      visual: legs([{ name: 'R', up: ['λ'], down: ['μ', 'λ', 'ν'] }], { caption: t`$R^\lambda{}_{\mu\lambda\nu}$: the upper $\lambda$ and the second lower $\lambda$ are one summed pair; $\mu$ and $\nu$ stay free.` }),
      choices: [t`$T^\mu{}_\mu$`, t`$R^\lambda{}_{\mu\lambda\nu}$`, t`$S^{\mu\nu}{}_\nu$`, t`$T_{\mu\mu}$`, t`$V^\mu W^\mu$`],
      answer: [0, 1, 2],
      why: {
        3: 'Two lower indices: the sum depends on the basis. A metric is needed to pair them.',
        4: 'Two upper indices: the sum is not the same in every basis — the dot product of two vectors needs a metric.',
      },
      hints: ['A contraction pairs exactly one upper index with one lower index.'],
      teach: 'Contraction always pairs one upper index with one lower; same-height sums need a metric.',
      explain: t`The first three pair up with down: $T^\mu{}_\mu$ is a scalar, $R^\lambda{}_{\mu\lambda\nu}$ the Ricci tensor (0,2), $S^{\mu\nu}{}_\nu$ a vector. $T_{\mu\mu}$ and $V^\mu W^\mu$ are sums that change with the basis.`,
    }),
    num({
      id: 'count-after', difficulty: 2,
      gen(r) {
        const [k, l, c] = r.pick([[2, 3, 1], [2, 3, 2], [1, 3, 1], [2, 2, 1], [3, 2, 2]]), n = r.pick([3, 4]);
        const ans = n ** (k + l - 2 * c);
        return {
          prompt: t`A type $(${k}, ${l})$ tensor in ${n} dimensions is contracted ${c === 1 ? 'once' : 'twice'} (${c === 1 ? 'one upper index with one lower' : 'two upper indices each with a lower one'}). How many components does the result have?`,
          visual: legs([{ name: 'T', up: ['α', 'β', 'γ'].slice(0, k), down: ['ρ', 'σ', 'τ'].slice(0, l) }], { caption: t`A type $(${k}, ${l})$ tensor; each contraction joins one upper leg to one lower leg.` }),
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n ** (k + l - c), feedback: 'Each contraction removes two indices — one upper and one lower — not one.' }].filter((e) => e.value !== ans),
          hints: [t`After ${c === 1 ? 'one contraction' : 'two contractions'} the type is $(${k - c}, ${l - c})$.`],
          teach: 'Each contraction lowers the type from (k, l) to (k − 1, l − 1).',
          explain: t`Type $(${k - c}, ${l - c})$: $${n}^{${k + l - 2 * c}} = ${ans}$ components.`,
        };
      },
    }),
    num({
      id: 'which-pair', difficulty: 3,
      gen(r) {
        // T^λ_{μν} in 2D: slices S[λ][μ][ν]
        let S, a, b;
        do {
          S = [0, 1].map(() => [0, 1].map(() => [0, 1].map(() => r.int(-3, 3))));
          a = [0, 1].map((nu) => S[0][0][nu] + S[1][1][nu]);           // T^λ_{λν}
          b = [0, 1].map((mu) => S[0][mu][0] + S[1][mu][1]);           // T^λ_{μλ}
        } while (a[0] === b[0] || a[1] === b[1] || a.includes(0));
        const which = r.pick(['first', 'second']), idx = r.pick([1, 2]);
        const ans = which === 'first' ? a[idx - 1] : b[idx - 1], other = which === 'first' ? b[idx - 1] : a[idx - 1];
        return {
          prompt: t`A (1,2) tensor in two dimensions has components $T^\lambda{}_{\mu\nu}$, given as two arrays (rows $\mu$, columns $\nu$): $T^1{}_{\mu\nu} = ${matTeX(S[0])}$ and $T^2{}_{\mu\nu} = ${matTeX(S[1])}$. Find ${which === 'first' ? t`$C_${idx} = T^\lambda{}_{\lambda ${idx}}$ (the upper index contracted with the first lower one)` : t`$D_${idx} = T^\lambda{}_{${idx}\lambda}$ (the upper index contracted with the second lower one)`}.`,
          visual: legs([{ name: 'T', up: ['λ'], down: which === 'first' ? ['λ', 'ν'] : ['μ', 'λ'] }], { caption: t`$T^\lambda{}_{${which === 'first' ? '\\lambda\\nu' : '\\mu\\lambda'}}$: the upper leg is summed against the ${which === 'first' ? 'first' : 'second'} lower leg.` }),
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: other, feedback: 'That contracts the upper index with the other lower slot. Different pairs give different tensors.' }],
          hints: [which === 'first' ? t`$T^\lambda{}_{\lambda ${idx}} = T^1{}_{1${idx}} + T^2{}_{2${idx}}$: row 1 of the first array, row 2 of the second, column ${idx}.` : t`$T^\lambda{}_{${idx}\lambda} = T^1{}_{${idx}1} + T^2{}_{${idx}2}$: column 1 of the first array, column 2 of the second, row ${idx}.`, 'Set the upper index equal to the chosen lower one and add the two terms.'],
          teach: 'A tensor with several lower indices has several different contractions, one for each choice of slot.',
          explain: t`${which === 'first' ? t`$T^1{}_{1${idx}} + T^2{}_{2${idx}} = ${S[0][0][idx - 1]} + (${S[1][1][idx - 1]})$` : t`$T^1{}_{${idx}1} + T^2{}_{${idx}2} = ${S[0][idx - 1][0]} + (${S[1][idx - 1][1]})$`} $= ${ans}$. The other contraction gives $${other}$ here: a different covector.`,
        };
      },
    }),
    code({
      id: 'einsum-invariance', difficulty: 3,
      prompt: t`With NumPy’s \`einsum\`, transform a random (1,1) tensor \`M\` to a random new basis (columns of \`A\` = the new basis vectors), $M'^\mu{}_\nu = (A^{-1})^\mu{}_\alpha\,M^\alpha{}_\beta\,A^\beta{}_\nu$, and contract it. Then read the same array as a (0,2) tensor, $T'_{\mu\nu} = A^\alpha{}_\mu M_{\alpha\beta} A^\beta{}_\nu$, and see that its diagonal sum is not invariant.`,
      starter: t`import numpy as np
rng = np.random.default_rng(1)
M = rng.normal(size=(3, 3))      # a (1,1) tensor M^mu_nu: rows mu, columns nu
A = rng.normal(size=(3, 3))      # column j = the new basis vector j, in old components
Ainv = np.linalg.inv(A)

M_new = None      # M'^mu_nu = (A^-1)^mu_a M^a_b A^b_nu   -- one np.einsum call
T_new = None      # the (0,2) reading: T'_mn = A^a_m M_ab A^b_n
trace_old = np.einsum('ii', M)
trace_new = None  # the contraction M'^mu_mu, with np.einsum

print(trace_old, trace_new)
`,
      answer: t`import numpy as np
rng = np.random.default_rng(1)
M = rng.normal(size=(3, 3))
A = rng.normal(size=(3, 3))
Ainv = np.linalg.inv(A)

M_new = np.einsum('ma,ab,bn->mn', Ainv, M, A)
T_new = np.einsum('am,ab,bn->mn', A, M, A)
trace_old = np.einsum('ii', M)
trace_new = np.einsum('ii', M_new)

print(trace_old, trace_new, np.trace(T_new))`,
      tests: [
        { name: t`\`M_new\` is $A^{-1}MA$`, code: 'M_new is not None and np.allclose(M_new, Ainv @ M @ A)' },
        { name: t`the contraction is unchanged: \`trace_new\` equals \`trace_old\``, code: 'trace_new is not None and abs(trace_new - trace_old) < 1e-9' },
        { name: t`\`T_new\` is $A^\mathsf{T}MA$`, code: 'T_new is not None and np.allclose(T_new, A.T @ M @ A)' },
        { name: 'the (0,2) diagonal sum did change', code: 'T_new is not None and abs(np.trace(T_new) - trace_old) > 1e-6' },
      ],
      hints: [t`In \`einsum\` every index letter is an index; a letter repeated across inputs and absent from the output is summed. \`'ma,ab,bn->mn'\` is $(A^{-1})^m{}_a M^a{}_b A^b{}_n$.`, t`For the (0,2) reading the first factor is $A^a{}_m$ — note the order of the letters: \`'am,ab,bn->mn'\`. A trace is \`np.einsum('ii', X)\`.`],
      teach: t`\`einsum\` is index notation you can run: repeated letters are summed, exactly like the summation convention.`,
      explain: t`The (1,1) contraction survives any change of basis, to rounding error; the (0,2) diagonal sum does not. \`np.einsum('ii', X)\` is the code for $X^\mu{}_\mu$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-divergence', difficulty: 2,
      gen(r) {
        let G, A, Gn;
        do { G = [[r.int(-3, 3), r.int(-3, 3)], [r.int(-3, 3), r.int(-3, 3)]]; A = r.pick(BASES); Gn = mul(mul(inv2(A), G), A); } while (trace(G) === 0 || Gn.flat().some((x) => Math.abs(x - Math.round(x)) > 1e-9) || Gn[0][0] === G[0][0]);
        const P = `${G[0][0]}*x + ${G[0][1]}*y`, Q = `${G[1][0]}*x + ${G[1][1]}*y`;
        return {
          prompt: t`A surveyor’s skewed basis gives the velocity gradient of a two-dimensional gas flow as $G'^\mu{}_\nu = ${matTeX(Gn.map((row) => row.map((x) => Math.round(x))))}$ (in s⁻¹). At what rate is a small patch of the gas growing in area, per unit area — the divergence $\partial_\mu v^\mu$?`,
          visual: FLOW(P, Q, t`The flow, drawn in an ordinary square basis. Its divergence does not depend on the basis used to write the gradient.`),
          answer: trace(G), units: 's^-1', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: Gn.flat().reduce((x, y) => x + y, 0), feedback: 'Only the diagonal enters the contraction.' }].filter((e) => Math.abs(e.value - trace(G)) > 0.01),
          hints: [t`The divergence is the contraction $G^\mu{}_\mu$, and a contraction can be computed in any basis.`],
          teach: 'The divergence is the trace of the velocity gradient: a contraction, so any basis will do.',
          explain: t`$G'^\mu{}_\mu = ${Math.round(Gn[0][0])} + (${Math.round(Gn[1][1])}) = ${trace(G)}\ \text{s}^{-1}$ — positive means the gas is expanding. In the square basis the gradient reads $${matTeX(G)}$, with the same trace.`,
        };
      },
    }),
    num({
      id: 'cp-fluid', difficulty: 3, transfer: true,
      gen(r) {
        const [what, rho, p, note] = r.pick([
          ['the dark energy that fills the universe today (a cosmological constant, $p = -\\rho$)', 5.3e-10, -5.3e-10, 'Planck 2018 values'],
          ['the core of the Sun', 1.35e22, 2.5e16, 'standard solar model, rounded'],
          ['the core of a neutron star (an illustrative model)', 4.5e34, 5.0e33, 'model-dependent: the dense-matter equation of state is not known precisely'],
        ]);
        const ans = -rho + 3 * p;
        return {
          prompt: t`In its rest frame, with $c = 1$, a perfect fluid has the mixed stress–energy tensor $T^\mu{}_\nu = \operatorname{diag}(-\rho, p, p, p)$, where $\rho$ is the energy density and $p$ the pressure. For ${what}, $\rho = ${tex(rho, 3)}$ J/m³ and $p = ${tex(p, 3)}$ Pa (${note}). Find the contraction $T^\mu{}_\mu$ in J/m³ — a number every observer, moving or not, agrees on.`,
          visual: grid([['−ρ', '0', '0', '0'], ['0', 'p', '0', '0'], ['0', '0', 'p', '0'], ['0', '0', '0', 'p']], { hl: [[0, 0], [1, 1], [2, 2], [3, 3]], rowNames: ['t', 'x', 'y', 'z'], colNames: ['t', 'x', 'y', 'z'], caption: t`$T^\mu{}_\nu$ in the fluid’s rest frame; the contraction sums the ringed diagonal.` }),
          answer: ans, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [{ value: rho + 3 * p, feedback: t`The time–time entry of $T^\mu{}_\nu$ is $-\rho$ in the $(-,+,+,+)$ convention.` }, { value: -rho + p, feedback: 'There are three space directions, each contributing p.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`$T^\mu{}_\mu = T^0{}_0 + T^1{}_1 + T^2{}_2 + T^3{}_3 = -\rho + 3p$.`, 'Keep the signs and the powers of ten.'],
          teach: t`The trace $T^\mu{}_\mu = -\rho + 3p$ of a perfect fluid is a scalar: it vanishes for light ($p = \rho/3$) and is $-4\rho$ for a cosmological constant.`,
          explain: t`$T^\mu{}_\mu = -\rho + 3p = ${tex(ans, 3)}$ J/m³. ${p < 0 ? 'For dark energy it is −4ρ.' : p < 1e-3 * rho ? 'The pressure barely matters: in ordinary matter ρc² dwarfs p.' : 'Here the pressure is a sizeable fraction of the energy density.'} The trace of the stress–energy tensor is what sources the scalar curvature in Einstein’s equations.`,
        };
      },
    }),
    mcq({
      id: 'cp-ricci', difficulty: 2,
      prompt: t`The Ricci tensor is the contraction $R_{\mu\nu} = R^\lambda{}_{\mu\lambda\nu}$ of the Riemann tensor. Why could you not define it as $R_{\lambda\mu\lambda\nu}$, summing the first and third indices of the all-lower version, without more structure?`,
      visual: legs([{ name: 'R', up: ['λ'], down: ['μ', 'λ', 'ν'] }], { caption: t`$R^\lambda{}_{\mu\lambda\nu}$: one upper leg joined to a lower one.` }),
      choices: ['Summing two lower indices does not give a tensor: the sum changes with the basis unless a metric is used to raise one first', 'It would give zero by symmetry', 'Lower indices cannot be summed in four dimensions', 'It would give the same result, so there is no need'],
      answer: 0,
      why: {
        1: 'No symmetry forces that. The problem is the transformation law.',
        2: 'Dimension has nothing to do with it; the index heights do.',
        3: 'Without a metric the all-lower Riemann tensor does not even exist; with one, you raise an index and contract properly.',
      },
      hints: ['What did the (0,2) misreading do in this lesson’s Explore?'],
      teach: 'Only an upper index paired with a lower one makes a contraction; a metric converts one kind into the other (lesson A6.4).',
      explain: t`$R_{\lambda\mu\lambda\nu}$ would pick up two Jacobian factors of the same kind on the summed pair, which do not cancel. With a metric, $g^{\lambda\sigma}R_{\lambda\mu\sigma\nu} = R^\sigma{}_{\mu\sigma\nu}$ is the honest contraction.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on GR, ch. 1 (contraction)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Tensor contraction', url: 'https://en.wikipedia.org/wiki/Tensor_contraction' },
    { label: 'NumPy einsum', url: 'https://numpy.org/doc/stable/reference/generated/numpy.einsum.html' },
    { label: 'Planck 2018 results VI: cosmological parameters', url: 'https://arxiv.org/abs/1807.06209' },
  ],
});
