// The characteristic polynomial: det(A − λI) = 0 finds every eigenvalue;
// trace and determinant are their sum and product.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { det2, matTeX, map2d } from './_la.js';
import { withEigen, board, trace, symTeX } from './_eig.js';

const t = String.raw;
const term = (c, first = false) => (c === 0 ? '' : `${c < 0 ? ' - ' : first ? '' : ' + '}${Math.abs(c)}`);
// λ² − (tr)λ + det as TeX and as Atlas syntax
const charTeX = (tr, d) => `\\lambda^2${tr === 0 ? '' : tr > 0 ? ` - ${tr === 1 ? '' : tr}\\lambda` : ` + ${tr === -1 ? '' : -tr}\\lambda`}${term(d)}`;
const charText = (tr, d) => `lambda^2 - (${tr})*lambda + (${d})`;
const pPic = (tr, d, { roots = null, caption } = {}) => {
  const disc = tr * tr - 4 * d, c = tr / 2, w = Math.max(3, Math.sqrt(Math.max(disc, 1)) / 2 + 2);
  const lo = d - tr * tr / 4, hi = (w * w) - tr * tr / 4 + d;
  return {
    type: 'graph',
    params: {
      x: [c - w, c + w], y: [Math.min(-2, lo - 1.5), Math.max(4, Math.min(hi, Math.abs(lo) * 2.2 + 3))], aspect: 'wide', xlabel: 'λ', ylabel: 'p(λ)',
      curves: [{ fn: `x^2 - (${tr})*x + (${d})`, color: 'accent', width: 2.5 }],
      points: (roots || []).map((x) => ({ x, y: 0, color: 'gold', r: 6, label: `λ = ${nice(x)}`, labelDy: -14 })),
    },
    caption: caption || 'The characteristic polynomial p(λ) = det(A − λI): the eigenvalues are where it crosses zero.',
  };
};

export default lesson({
  id: 'math2270.LA-9.2',
  title: 'The characteristic polynomial',
  minutes: 12, difficulty: 2,
  intro: t`$\lambda$ is an eigenvalue exactly when $(A - \lambda I)\mathbf v = \mathbf 0$ has a nonzero solution — when $A - \lambda I$ squashes some direction flat, i.e. is not invertible. So the eigenvalues are the roots of
$$\det(A - \lambda I) = 0, \qquad\text{for } 2\times2:\quad \lambda^2 - (\operatorname{tr}A)\,\lambda + \det A = 0$$
The left side is a polynomial of degree $n$ in $\lambda$, the **characteristic polynomial**; an $n\times n$ matrix has $n$ eigenvalues counted with multiplicity (some may be complex — LA-9.4). Comparing coefficients gives two free checks: **the eigenvalues add up to the trace and multiply to the determinant**. A root that appears twice need not bring two independent eigenvectors: the number of independent eigenvectors (the geometric multiplicity) can be smaller than the root's multiplicity (the algebraic multiplicity) — and that decides whether $A$ can be diagonalized (LA-9.3).`,
  symbols: [
    { tex: t`A - \lambda I`, text: t`$A$ with $\lambda$ subtracted from every diagonal entry` },
    { tex: t`\det(A - \lambda I)`, text: t`the characteristic polynomial $p(\lambda)$: degree $n$ in $\lambda$, zero exactly at the eigenvalues` },
    { tex: t`\operatorname{tr}A`, text: t`the trace: the sum of the diagonal entries, $a + d$ for a $2\times2$ — and the sum of the eigenvalues` },
    { tex: t`\det A`, text: t`$ad - bc$ for a $2\times2$ — and the product of the eigenvalues` },
    { tex: t`\lambda`, text: 'the unknown: a candidate eigenvalue (a number, possibly complex)' },
  ],
  why: 'Every vibration frequency, every stability exponent and every principal stress is a root of a characteristic polynomial.',
  visual: {
    type: 'la-map2d',
    title: 'When does A − λI flatten the plane?',
    lead: t`The picture is the map $A - \lambda I$ for $A = ${matTeX([[1, 3], [2, 2]])}$ and the $\lambda$ on the slider. For most $\lambda$ it is invertible: the gold unit square becomes a genuine parallelogram. At an eigenvalue, it collapses onto a line — $\det(A - \lambda I) = 0$.`,
    tasks: [
      'Slide λ to 4: the square flattens, det(A − 4I) = 0, so 4 is an eigenvalue.',
      'Find the other λ that flattens it. (Check: the two must add to tr A = 3 and multiply to det A = −4.)',
      'Between the two, det(A − λI) is negative: the F comes out mirrored.',
    ],
    params: {
      maps: [{ name: '(A - \\lambda I)', label: 'A − λI', A: [['1 - lam', 3], [2, '2 - lam']] }], stages: false, shape: 'F', view: 3,
      sliders: [{ key: 'lam', label: t`$\lambda$`, min: -3, max: 6, step: 0.25, value: 1.5, explain: t`The number subtracted from each diagonal entry of $A$.` }],
      readout: ['A', 'det'], colNames: ['', ''],
    },
    caption: 'The map A − λI. Faint: before; bold: after. The gold outline is the image of the unit square, whose area is |det(A − λI)|.',
  },
  example: {
    prompt: t`Find the eigenvalues and eigenvectors of $A = ${matTeX([[2, -1], [4, 7]])}$.`,
    visual: pPic(9, 18, { roots: [3, 6], caption: 'p(λ) = λ² − 9λ + 18 crosses zero at λ = 3 and λ = 6.' }),
    steps: [
      { label: 'Set up', text: t`$\det(A - \lambda I) = \det${symTeX([['2 - \\lambda', -1], [4, '7 - \\lambda']])} = (2 - \lambda)(7 - \lambda) + 4$.` },
      { label: 'Expand', text: t`$= \lambda^2 - 9\lambda + 18$. Shortcut: $\operatorname{tr}A = 9$ and $\det A = 14 + 4 = 18$, so $p(\lambda) = \lambda^2 - 9\lambda + 18$ at once.` },
      { label: 'Roots', text: t`$\lambda^2 - 9\lambda + 18 = (\lambda - 3)(\lambda - 6)$: the eigenvalues are $3$ and $6$. Check: $3 + 6 = 9 = \operatorname{tr}A$ and $3\cdot6 = 18 = \det A$. ✓` },
      { label: 'Eigenvectors', text: t`$\lambda = 3$: $A - 3I = ${matTeX([[-1, -1], [4, 4]])}$, so $v_1 + v_2 = 0$: $\mathbf v = (1, -1)$. $\lambda = 6$: $A - 6I = ${matTeX([[-4, -1], [4, 1]])}$, so $4v_1 + v_2 = 0$: $\mathbf v = (1, -4)$.` },
      { label: 'Check', text: t`$A(1, -4) = (2 + 4,\ 4 - 28) = (6, -24) = 6(1, -4)$. ✓` },
    ],
    answer: t`$\lambda = 3$ with $\mathbf v = (1, -1)$, and $\lambda = 6$ with $\mathbf v = (1, -4)$.`,
  },
  practice: [
    expr({
      id: 'charpoly', difficulty: 1,
      gen(r) {
        let A = [[1, 2], [3, 4]];
        for (let k = 0; k < 100; k++) {
          A = [[r.int(-3, 5), r.intExcept(-3, 4, [0])], [r.intExcept(-3, 4, [0]), r.int(-3, 5)]];
          if (trace(A) !== 0 && det2(A) !== 0) break;
        }
        const tr = trace(A), d = det2(A);
        return {
          prompt: t`Find the characteristic polynomial $p(\lambda) = \det(A - \lambda I)$ of $A = ${matTeX(A)}$.`,
          answer: charText(tr, d), answerTeX: charTeX(tr, d), lhs: t`p(\lambda)`,
          vars: { lambda: [-3, 3] }, keys: [['λ', 'lambda']],
          errors: [{ answer: `lambda^2 + (${tr})*lambda + (${d})`, feedback: t`The $\lambda$ term is $-(\operatorname{tr}A)\lambda$: from $(a - \lambda)(d - \lambda)$, the cross terms are $-a\lambda - d\lambda$.` }, { answer: `lambda^2 - (${tr})*lambda + (${A[0][0] * A[1][1] + A[0][1] * A[1][0]})`, feedback: t`The constant term is $\det A = ad - bc$: the off-diagonal product is subtracted.` }].filter((e) => A[0][1] * A[1][0] !== 0 || !e.answer.includes(String(A[0][0] * A[1][1]))),
          hints: [t`$\det${symTeX([[`${A[0][0]} - \\lambda`, A[0][1]], [A[1][0], `${A[1][1]} - \\lambda`]])} = (${A[0][0]} - \lambda)(${A[1][1]} - \lambda) - (${A[0][1]})(${A[1][0]})$.`, t`Or use $\lambda^2 - (\operatorname{tr}A)\lambda + \det A$ with $\operatorname{tr}A = ${tr}$ and $\det A = ${d}$.`],
          teach: t`For a $2\times2$ matrix, $\det(A - \lambda I) = \lambda^2 - (\operatorname{tr}A)\lambda + \det A$.`,
          explain: t`$\operatorname{tr}A = ${tr}$ and $\det A = ${d}$, so $p(\lambda) = ${charTeX(tr, d)}$.`,
          visual: map2d(A, { view: 2.6, caption: 'The map A. Its eigenvalues are the roots of the polynomial you are building.' }),
        };
      },
    }),
    num({
      id: 'largest', difficulty: 2,
      gen(r) {
        const lams = r.pick([[5, 2], [4, -1], [3, -2], [6, 1], [2, -3], [4, 1], [5, -1]]);
        const { A } = withEigen(r, lams), tr = trace(A), d = det2(A);
        const errors = [tr, d, lams[1]].filter((v, i, a) => v !== lams[0] && v !== -lams[0] && a.indexOf(v) === i).map((v) => ({ value: v, feedback: v === tr ? 'That is the trace — the sum of the eigenvalues, not one of them.' : v === d ? 'That is the determinant — the product of the eigenvalues.' : 'That is the smaller eigenvalue.' }));
        return {
          prompt: t`Find the **larger** eigenvalue of $A = ${matTeX(A)}$.`,
          answer: lams[0], tol: { rel: 0, abs: 0.01 }, errors,
          hints: [t`$p(\lambda) = \lambda^2 - ${tr < 0 ? `(${tr})` : tr}\lambda + ${d < 0 ? `(${d})` : d}$.`, 'Factor it (or use the quadratic formula): two numbers that add to the trace and multiply to the determinant.'],
          teach: t`The eigenvalues of a $2\times2$ are the two roots of $\lambda^2 - (\operatorname{tr}A)\lambda + \det A$.`,
          explain: t`$${charTeX(tr, d)} = (\lambda - ${lams[0]})(\lambda ${lams[1] < 0 ? '+' : '-'} ${Math.abs(lams[1])})$: eigenvalues $${lams[0]}$ and $${lams[1]}$; the larger is $${lams[0]}$.`,
          visual: map2d(A, { view: 2.6, caption: 'The map A (its eigenvector lines not drawn).' }),
        };
      },
    }),
    num({
      id: 'trace-det', difficulty: 2,
      gen(r) {
        const [l1, l2] = r.pick([[5, 2], [4, 3], [6, -1], [3, -3], [7, 2], [2, -4], [5, -2]]);
        const tr = l1 + l2, d = l1 * l2, ask = r.int(0, 1), ans = ask ? l2 : l1;
        return {
          prompt: t`A $2\times2$ matrix has trace $${tr}$ and determinant $${d}$. What is its ${ask ? 'smaller' : 'larger'} eigenvalue?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ask ? l1 : l2, feedback: `That is the ${ask ? 'larger' : 'smaller'} one.` }],
          hints: [t`$\lambda_1 + \lambda_2 = ${tr}$ and $\lambda_1\lambda_2 = ${d}$.`, t`They are the roots of $\lambda^2 - ${tr < 0 ? `(${tr})` : tr}\lambda + ${d < 0 ? `(${d})` : d} = 0$.`],
          teach: 'The trace and determinant fix the characteristic polynomial of a 2×2 — and with it both eigenvalues.',
          explain: t`$\lambda = \tfrac12\big(${tr} \pm \sqrt{${tr}^2 - 4(${d})}\big) = \tfrac12(${tr} \pm ${Math.abs(l1 - l2)})$: $${l1}$ and $${l2}$.`,
          visual: { type: 'de-tracedet', params: { tau: tr, Delta: d, drag: false, panels: 'map', readout: false, map: { tau: [-8, 10], Delta: [-14, 26] } }, caption: 'The trace–determinant plane: the matrix is the dot. Below the parabola τ² = 4Δ its two eigenvalues are real.' },
        };
      },
    }),
    mcq({
      id: 'triangular', difficulty: 1,
      gen(r) {
        const fmt = (xs) => xs.map((x) => `${x}`).join(',\\ '), up = (xs) => [...xs].sort((a, b) => a - b);
        let d = [2, -1, 5], A = [[2, 3, 1], [0, -1, 4], [0, 0, 5]], sets = [];
        for (let k = 0; k < 200; k++) {
          d = r.shuffle([-2, -1, 1, 2, 3, 4, 5]).slice(0, 3);
          A = [[d[0], r.int(1, 5), r.intExcept(-3, 3, [0])], [0, d[1], r.intExcept(-4, 4, [0])], [0, 0, d[2]]];
          sets = [up(d), up(A[0]), up([A[0][2], A[1][2], A[2][2]]), up([trace(A), d[0] * d[1] * d[2], 0])];
          if (new Set(sets.map((x) => x.join(','))).size === 4) break;
        }
        const ok = sets[0];
        return {
          prompt: t`What are the eigenvalues of $A = ${matTeX(A)}$?`,
          choices: sets.map((s) => t`$${fmt(s)}$`),
          answer: 0,
          why: {
            1: 'Those are the entries of the first row. For a triangular matrix it is the diagonal that matters.',
            2: 'Those are the entries of the last column.',
            3: 'The trace and determinant are the sum and product of the eigenvalues, not eigenvalues themselves.',
          },
          hints: [t`$A - \lambda I$ is triangular too, so its determinant is the product of its diagonal: $(${d[0]} - \lambda)(${d[1]} - \lambda)(${d[2]} - \lambda)$.`],
          teach: 'The eigenvalues of a triangular matrix are its diagonal entries.',
          explain: t`$\det(A - \lambda I) = (${d[0]} - \lambda)(${d[1]} - \lambda)(${d[2]} - \lambda)$, which is zero exactly at $\lambda = ${fmt(ok)}$.`,
          visual: board(A, { caption: 'The matrix: everything below the diagonal is zero.' }),
        };
      },
    }),
    mcq({
      id: 'row-reduce', difficulty: 3, kind: 'error',
      prompt: t`A student wants the eigenvalues of $A = ${matTeX([[2, 1], [4, 5]])}$. They row-reduce, $R_2 \leftarrow R_2 - 2R_1$, to get $U = ${matTeX([[2, 1], [0, 3]])}$, and read the eigenvalues off the diagonal: $2$ and $3$. What is wrong?`,
      choices: [
        t`Row operations change the eigenvalues; $\det(A - \lambda I) = \lambda^2 - 7\lambda + 6$ gives $1$ and $6$`,
        t`Nothing: elimination keeps the eigenvalues, just as it keeps the solutions of $A\mathbf x = \mathbf b$`,
        t`They should have continued to the identity matrix, whose eigenvalues are $1$ and $1$`,
        t`The eigenvalues are the diagonal of $A$ itself: $2$ and $5$`,
      ],
      answer: 0,
      why: {
        1: t`Elimination keeps the *solution set* of a system, not the map. $U$ is a different map with different eigenvalues — check: $2 + 3 = 5 \ne \operatorname{tr}A = 7$.`,
        2: t`Reducing further changes the map even more. Only a similarity $P^{-1}AP$ keeps eigenvalues.`,
        3: t`$A$ is not triangular, so its diagonal says nothing directly. Their sum (7) is right; the numbers are not.`,
      },
      hints: [t`Test the student's answer with the free checks: do 2 and 3 add to $\operatorname{tr}A$ and multiply to $\det A$?`, t`$\operatorname{tr}A = 7$ and $\det A = 10 - 4 = 6$.`],
      teach: 'Row reduction does not preserve eigenvalues; only a change of basis does.',
      explain: t`$\operatorname{tr}A = 7$ and $\det A = 6$, so $p(\lambda) = \lambda^2 - 7\lambda + 6 = (\lambda - 1)(\lambda - 6)$. The student's $2 + 3 = 5$ fails the trace check at once. (Row operations multiply $A$ on the left by an elimination matrix $E$; $EA$ is not similar to $A$.)`,
      visual: map2d([[2, 1], [4, 5]], { view: 2.8, caption: 'The map A.' }),
    }),
    num({
      id: 'charpoly3', difficulty: 3,
      gen(r) {
        const lams = r.pick([[3, 1], [4, -1], [2, 5], [3, -2], [1, 4]]), a = r.pick([-2, 0, 2, 6]);
        const { A: B } = withEigen(r, lams, { max: 6 });
        const A = [[a, 0, 0], [r.int(-2, 3), B[0][0], B[0][1]], [r.int(-2, 3), B[1][0], B[1][1]]];
        const all = [a, ...lams], top = Math.max(...all);
        const tr2 = trace(B), d2 = det2(B);
        return {
          prompt: t`Find the **largest** eigenvalue of $A = ${matTeX(A)}$.`,
          answer: top, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: trace(A), feedback: 'That is the trace, the sum of all three eigenvalues.' }, { value: Math.max(A[1][1], A[2][2], a), feedback: 'Only a triangular matrix shows its eigenvalues on the diagonal; this one is not triangular.' }].filter((e) => e.value !== top && e.value !== -top),
          hints: [t`Row 1 is $(${a}, 0, 0)$. Expand $\det(A - \lambda I)$ along it.`, t`$\det(A - \lambda I) = (${a} - \lambda)\det${symTeX([[`${B[0][0]} - \\lambda`, B[0][1]], [B[1][0], `${B[1][1]} - \\lambda`]])}$, and the $2\times2$ factor is $${charTeX(tr2, d2)}$.`],
          teach: 'Expanding det(A − λI) along a row with zeros splits the characteristic polynomial into factors.',
          explain: t`$\det(A - \lambda I) = (${a} - \lambda)(${charTeX(tr2, d2)})$, with roots $${a}$, $${lams[0]}$ and $${lams[1]}$. The largest is $${top}$. Check: their sum $${a + lams[0] + lams[1]}$ equals $\operatorname{tr}A$. ✓`,
          visual: board(A, { ring: [[0, 1], [0, 2]], caption: 'The two zeros in row 1 (ringed) make the expansion along that row a single term.' }),
        };
      },
    }),
    mcq({
      id: 'multiplicity', difficulty: 3,
      prompt: t`$S = ${matTeX([[2, 1], [0, 2]])}$ has the characteristic polynomial $(\lambda - 2)^2$: the eigenvalue 2 is a double root. How many independent eigenvectors does it have?`,
      choices: [t`One: only the multiples of $(1, 0)$`, t`Two, because the root is double`, t`None, because a repeated root has no eigenvectors`, t`Infinitely many independent ones: every vector is an eigenvector`],
      answer: 0,
      why: {
        1: t`The algebraic multiplicity (2) is only an upper limit on the number of independent eigenvectors.`,
        2: t`$\lambda = 2$ is an eigenvalue, so there must be at least one eigenvector: $(1, 0)$.`,
        3: t`That is $2I$. Here $S(0, 1) = (1, 2)$, which is not a multiple of $(0, 1)$.`,
      },
      hints: [t`Solve $(S - 2I)\mathbf v = \mathbf 0$ with $S - 2I = ${matTeX([[0, 1], [0, 0]])}$.`, t`That says $v_2 = 0$ and nothing about $v_1$: one free variable.`],
      teach: 'A repeated eigenvalue can have fewer independent eigenvectors than its multiplicity: geometric ≤ algebraic.',
      explain: t`$(S - 2I)\mathbf v = (v_2, 0) = \mathbf 0$ forces $v_2 = 0$: the eigenvectors are the multiples of $(1, 0)$ — a one-dimensional eigenspace (geometric multiplicity 1, algebraic multiplicity 2). Not enough eigenvectors to make a basis, so $S$ cannot be diagonalized (LA-9.3).`,
      visual: map2d([[2, 1], [0, 2]], { view: 2.6, caption: 'The map S = [[2, 1], [0, 2]]: a stretch by 2 combined with a shear.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eig', difficulty: 2,
      gen(r) {
        const lams = r.pick([[5, 2], [4, -1], [3, -2], [6, 1], [2, -3], [7, 3], [1, -4]]);
        const { A } = withEigen(r, lams);
        return {
          prompt: t`Find the **smaller** eigenvalue of $A = ${matTeX(A)}$.`,
          answer: lams[1], tol: { rel: 0, abs: 0.01 },
          hints: [t`$\lambda^2 - (\operatorname{tr}A)\lambda + \det A = 0$.`],
          teach: 'Eigenvalues are the roots of det(A − λI).',
          explain: t`$p(\lambda) = ${charTeX(trace(A), det2(A))}$, with roots $${lams[0]}$ and $${lams[1]}$.`,
          visual: map2d(A, { view: 2.6 }),
        };
      },
    }),
    num({
      id: 'cp-stress', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([4, 5, 6, 8, 10]), tw = r.sign();
        const sa = 6 * k, sh = 12 * k, tau = 4 * k * tw;
        const ans = 14 * k;
        return {
          prompt: t`The wall of a pressurized cylindrical propellant tank carries a hoop stress $\sigma_\theta = ${sh}$ MPa and an axial stress $\sigma_z = ${sa}$ MPa (half the hoop stress, as for any thin closed cylinder). Torque from the thrust structure adds a shear stress $\tau = ${tau}$ MPa. The stress tensor in the wall is $\sigma = ${matTeX([[sa, tau], [tau, sh]])}$ MPa. Its eigenvalues are the **principal stresses**. What is the largest one — the stress the wall material must actually withstand?`,
          answer: ans, units: 'MPa', tol: { rel: 0.002 },
          errors: [{ value: sh, feedback: 'That is the hoop stress alone. The shear stress raises the largest normal stress: find the eigenvalues.' }, { value: 9 * k, feedback: t`That is the average of the two normal stresses — the centre of Mohr's circle, half the trace. Add the radius $\sqrt{(\tfrac{\sigma_\theta - \sigma_z}{2})^2 + \tau^2}$.` }, { value: 13 * k, feedback: t`The radius is $\sqrt{(${3 * k})^2 + (${4 * k})^2}$, not $|\tau|$.` }],
          hints: [t`$\operatorname{tr}\sigma = ${sa + sh}$ and $\det\sigma = ${sa * sh - tau * tau}$; solve $\lambda^2 - ${sa + sh}\lambda + ${sa * sh - tau * tau} = 0$.`, t`$\lambda = \tfrac12(${sa + sh}) \pm \sqrt{(${3 * k})^2 + (${4 * k})^2}$.`],
          teach: 'The principal stresses are the eigenvalues of the stress tensor: the largest is what the material actually feels.',
          explain: t`$\lambda = ${9 * k} \pm \sqrt{${9 * k * k} + ${16 * k * k}} = ${9 * k} \pm ${5 * k}$: principal stresses $${14 * k}$ and $${4 * k}$ MPa. The largest, $${14 * k}$ MPa, exceeds the hoop stress by ${Math.round((14 / 12 - 1) * 100)}%: designing to the hoop stress alone would be unsafe. Engineers draw this as Mohr's circle — centre $${9 * k}$ MPa, radius $${5 * k}$ MPa — which is the quadratic formula for a symmetric $2\times2$, drawn.`,
          visual: { type: 'graph', params: { x: [0, 16 * k], y: [-8 * k, 8 * k], aspect: 'wide', equal: true, xlabel: 'normal stress (MPa)', ylabel: 'shear (MPa)', points: [{ x: sa, y: tau, color: 'good', r: 5, label: 'z face' }, { x: sh, y: -tau, color: 'warn', r: 5, label: 'θ face' }] }, caption: 'The stress state on the two faces of a wall element, (σ, τ) for each. Mohr’s circle through these points meets the horizontal axis at the principal stresses.' },
        };
      },
    }),
    mcq({
      id: 'cp-sum-product', difficulty: 2,
      prompt: t`A $2\times2$ matrix has eigenvalues $3$ and $-2$. What are its trace and determinant?`,
      choices: [t`$\operatorname{tr} = 1$, $\det = -6$`, t`$\operatorname{tr} = -6$, $\det = 1$`, t`$\operatorname{tr} = 5$, $\det = 6$`, t`$\operatorname{tr} = 1$, $\det = 6$`],
      answer: 0,
      why: {
        1: 'Swapped: the trace is the sum, the determinant the product.',
        2: t`That treats $-2$ as $+2$.`,
        3: t`The product $3\times(-2)$ is negative.`,
      },
      hints: ['Trace = sum of the eigenvalues; determinant = product.'],
      teach: 'The trace is the sum of the eigenvalues and the determinant is their product.',
      explain: t`$p(\lambda) = (\lambda - 3)(\lambda + 2) = \lambda^2 - \lambda - 6$, so $\operatorname{tr} = 3 + (-2) = 1$ and $\det = 3\times(-2) = -6$. A negative determinant always means one positive and one negative eigenvalue: a saddle, in the language of DE-4.`,
      visual: pPic(1, -6, { caption: 'A characteristic polynomial with roots 3 and −2. Its constant term is p(0) = det A.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.1', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 21: Eigenvalues and eigenvectors', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
    { label: 'Hibbeler, Mechanics of Materials, §9.3 (principal stresses, Mohr’s circle)', url: 'https://www.pearson.com/en-us/subject-catalog/p/mechanics-of-materials/P200000003438' },
  ],
});
