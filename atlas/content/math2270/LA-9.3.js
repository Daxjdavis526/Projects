// Diagonalization: A = PDP⁻¹ with an eigenvector basis, and what it buys —
// powers Aᵏ = PDᵏP⁻¹, Fibonacci in closed form, decaying and growing modes.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matmul, matTeX, tupleTeX, map2d } from './_la.js';
import { withEigen, inv2, powM, unimodular, col, decTeX } from './_eig.js';

const t = String.raw;
const PHI = (1 + Math.sqrt(5)) / 2;
const fib = (k) => { let a = 0, b = 1; for (let i = 0; i < k; i++) [a, b] = [b, a + b]; return a; };
const round = (M) => M.map((row) => row.map((v) => Math.round(v)));

export default lesson({
  id: 'math2270.LA-9.3',
  title: 'Diagonalization',
  minutes: 12, difficulty: 3,
  intro: t`If an $n\times n$ matrix has $n$ independent eigenvectors, use them as a basis. In that basis the map just stretches each basis vector by its eigenvalue — its matrix is diagonal (LA-7.3: $P^{-1}AP = D$). Turned around:
$$A = PDP^{-1}, \qquad A^k = PD^kP^{-1}$$
The powers are the payoff: $A^k = (PDP^{-1})(PDP^{-1})\cdots$ and every inner $P^{-1}P$ cancels, and $D^k$ just raises each eigenvalue to the $k$-th power. So **each eigen-direction evolves on its own**, growing or shrinking like $\lambda^k$ — the long-run behaviour of any linear process is read off its eigenvalues. Not every matrix qualifies: a shear has too few eigenvectors. Distinct eigenvalues guarantee enough of them, but are not required — $I$ is already diagonal.`,
  symbols: [
    { tex: 'P', text: t`the matrix whose columns are $n$ independent eigenvectors $\mathbf v_1, \dots, \mathbf v_n$ of $A$ (invertible because they are independent)` },
    { tex: 'D', text: t`the diagonal matrix of the matching eigenvalues $\lambda_1, \dots, \lambda_n$, in the same order as the columns of $P$` },
    { tex: t`P^{-1}`, text: t`converts standard coordinates into coordinates along the eigenvectors` },
    { tex: t`A^k`, text: t`the map applied $k$ times; $D^k = \operatorname{diag}(\lambda_1^k, \dots, \lambda_n^k)$` },
  ],
  why: 'Decoupling is the most used trick in physics: normal modes of vibration, the independent channels of a linear circuit, the stable and unstable directions of an orbit near a Lagrange point — each is a diagonalization.',
  visual: {
    type: 'la-map2d',
    title: 'Into eigen-coordinates, stretch, and back',
    lead: t`$A = \begin{bmatrix} 2 & -1.5 \\ 0 & 0.5 \end{bmatrix}$ has eigenvectors $\mathbf v_1 = (1, 0)$ ($\lambda = 2$) and $\mathbf v_2 = (1, 1)$ ($\lambda = 0.5$). Step through $A = PDP^{-1}$ one map at a time and follow the dashed vector $\mathbf v_2$ and its gold image.`,
    tasks: [
      'After P⁻¹ alone: the eigenvector v₂ has moved onto the y-axis — the eigenvectors are now the coordinate axes.',
      'After D: everything is stretched by 2 along x and halved along y. In these coordinates that is all the map does.',
      'After P: back to the standard picture. The gold arrow is half of v₂ — Av₂ = 0.5 v₂ — and the readout is A itself.',
    ],
    params: {
      maps: [{ name: 'P^{-1}', label: 'P⁻¹', A: [[1, -1], [0, 1]] }, { name: 'D', label: 'D', A: [[2, 0], [0, 0.5]] }, { name: 'P', label: 'P', A: [[1, 1], [0, 1]] }],
      stage: 0, shape: 'F', view: 2.2, x: [1, 1], xName: 'v₂', imageName: 'image of v₂', readout: ['A'], colNames: ['', ''],
    },
    caption: 'Faint: the plane before; dashed violet: after the previous stage; solid: after the stages applied so far. The readout names the product so far, written right to left.',
  },
  example: {
    prompt: t`Diagonalize $A = ${matTeX([[3, 1], [2, 2]])}$ and use it to find $A^5$.`,
    visual: map2d([[3, 1], [2, 2]], { eigen: true, view: 2.8, caption: 'A and its two eigenvector lines: stretched by 4 along (1, 1) and left alone (λ = 1) along (1, −2).' }),
    steps: [
      { label: 'Eigenvalues', text: t`$\operatorname{tr}A = 5$, $\det A = 4$: $\lambda^2 - 5\lambda + 4 = (\lambda - 4)(\lambda - 1)$, so $\lambda = 4, 1$.` },
      { label: 'Eigenvectors', text: t`$\lambda = 4$: $A - 4I = ${matTeX([[-1, 1], [2, -2]])}$, $\mathbf v_1 = (1, 1)$. $\lambda = 1$: $A - I = ${matTeX([[2, 1], [2, 1]])}$, $\mathbf v_2 = (1, -2)$.` },
      { label: 'Assemble', text: t`$P = ${matTeX([[1, 1], [1, -2]])}$, $D = ${matTeX([[4, 0], [0, 1]])}$, $P^{-1} = \tfrac13${matTeX([[2, 1], [1, -1]])}$. Check $AP = PD$: $A\mathbf v_1 = (4, 4) = 4\mathbf v_1$ ✓.` },
      { label: 'Power', text: t`$A^5 = PD^5P^{-1} = ${matTeX([[1, 1], [1, -2]])}${matTeX([[1024, 0], [0, 1]])}\tfrac13${matTeX([[2, 1], [1, -1]])} = \tfrac13${matTeX([[2049, 1023], [2046, 1026]])} = ${matTeX([[683, 341], [682, 342]])}$.` },
      { label: 'Sense check', text: t`$\operatorname{tr}A^5 = 683 + 342 = 1025 = 4^5 + 1^5$. ✓ And for large $k$ the $4^k$ mode swamps everything: $A^k \approx \tfrac{4^k}{3}${matTeX([[2, 1], [2, 1]])}$, every column turning toward $\mathbf v_1$.` },
    ],
    answer: t`$A = PDP^{-1}$ with $P = ${matTeX([[1, 1], [1, -2]])}$, $D = \operatorname{diag}(4, 1)$, and $A^5 = ${matTeX([[683, 341], [682, 342]])}$.`,
  },
  practice: [
    mcq({
      id: 'which-not', difficulty: 2,
      prompt: 'Which matrix cannot be diagonalized?',
      choices: [t`$${matTeX([[2, 1], [0, 2]])}$`, t`$${matTeX([[2, 0], [0, 2]])}$`, t`$${matTeX([[2, 1], [0, 3]])}$`, t`$${matTeX([[0, 1], [1, 0]])}$`],
      answer: 0,
      why: {
        1: t`It is already diagonal. Its repeated eigenvalue comes with two independent eigenvectors — every vector is one.`,
        2: t`Two different eigenvalues (2 and 3) always bring two independent eigenvectors.`,
        3: t`Eigenvalues $1$ and $-1$ (a reflection in $y = x$), with eigenvectors $(1, 1)$ and $(1, -1)$.`,
      },
      hints: ['Diagonalizable means: enough independent eigenvectors to make a basis.', t`For $${matTeX([[2, 1], [0, 2]])}$, solve $(A - 2I)\mathbf v = \mathbf 0$: how many free variables?`],
      teach: 'A matrix is diagonalizable exactly when it has a full basis of eigenvectors; a repeated eigenvalue may or may not provide enough.',
      explain: t`$${matTeX([[2, 1], [0, 2]])} - 2I = ${matTeX([[0, 1], [0, 0]])}$ forces $v_2 = 0$: one line of eigenvectors, not two. No basis of eigenvectors, so no $P$. (Such matrices need Jordan form; in differential equations they produce the $te^{\lambda t}$ solutions of DE-4.)`,
      visual: map2d([[2, 1], [0, 3]], { eigen: true, view: 2.6, caption: 'The choice [[2, 1], [0, 3]]: two eigenvector lines (violet), so its eigenvectors form a basis.' }),
    }),
    num({
      id: 'power', difficulty: 2,
      gen(r) {
        const lams = r.pick([[2, -1], [3, 1], [2, 1], [-2, 1], [3, -1], [2, 0]]), k = r.int(3, 6);
        const P = unimodular(r, { range: 2 }), D = [[lams[0], 0], [0, lams[1]]], Pi = round(inv2(P));
        const A = round(matmul(matmul(P, D), Pi)), Ak = round(matmul(matmul(P, [[lams[0] ** k, 0], [0, lams[1] ** k]]), Pi));
        const [i, j] = r.pick([[0, 0], [0, 1], [1, 0], [1, 1]].filter(([a, b]) => Ak[a][b] !== 0));
        const wrong = A[i][j] ** k;
        return {
          prompt: t`$A = PDP^{-1}$ with $P = ${matTeX(P)}$, $D = ${matTeX(D)}$ and $P^{-1} = ${matTeX(Pi)}$. Find the $(${i + 1}, ${j + 1})$ entry of $A^{${k}}$.`,
          answer: Ak[i][j], tol: { rel: 0, abs: 0.01 },
          errors: wrong !== Ak[i][j] ? [{ value: wrong, feedback: t`Raising each entry of $A$ to the power $${k}$ is not $A^{${k}}$. Only a *diagonal* matrix is powered entry by entry — that is the point of $D$.` }] : [],
          hints: [t`$A^{${k}} = PD^{${k}}P^{-1}$ and $D^{${k}} = ${matTeX([[lams[0] ** k, 0], [0, lams[1] ** k]])}$.`, t`Multiply $P D^{${k}}$ first (it scales the columns of $P$), then by $P^{-1}$.`],
          teach: t`$A^k = PD^kP^{-1}$: power the eigenvalues, not the entries.`,
          explain: t`$PD^{${k}}P^{-1} = ${matTeX(Ak)}$, so the entry is $${Ak[i][j]}$. (Here $A = ${matTeX(A)}$; multiplying it by itself ${k} times gives the same.)`,
          visual: map2d(A, { eigen: true, view: 2.6, caption: 'A with its eigenvector lines (the columns of P) and eigenvalues (the diagonal of D).' }),
        };
      },
    }),
    num({
      id: 'which-lambda', difficulty: 2,
      gen(r) {
        const lams = r.pick([[3, -1], [4, 2], [5, 1], [2, -3], [6, 3]]);
        const { A, P } = withEigen(r, lams);
        return {
          prompt: t`The columns of $P = ${matTeX(P)}$ are eigenvectors of $A = ${matTeX(A)}$, so $A = PDP^{-1}$ with $D$ diagonal. What is the **second** diagonal entry of $D$?`,
          answer: lams[1], tol: { rel: 0, abs: 0.01 },
          errors: [{ value: lams[0], feedback: 'That is the eigenvalue of the first column. D lists the eigenvalues in the same order as the columns of P.' }],
          hints: [t`Compute $A$ times the second column of $P$, $${tupleTeX(col(P, 1))}$.`],
          teach: 'The k-th diagonal entry of D is the eigenvalue of the k-th column of P.',
          explain: t`$A${tupleTeX(col(P, 1))} = ${lams[1]}${tupleTeX(col(P, 1))}$, so $D = \operatorname{diag}(${lams[0]}, ${lams[1]})$: the second entry is $${lams[1]}$.`,
          visual: map2d(A, { view: 2.6, caption: 'The map A (eigenvector lines not drawn).' }),
        };
      },
    }),
    num({
      id: 'fib', difficulty: 2,
      gen(r) {
        const k = r.int(22, 32), F = fib(k);
        return {
          prompt: t`Fibonacci numbers obey $F_{k+1} = F_k + F_{k-1}$, which as one matrix step reads $\begin{bmatrix} F_{k+1} \\ F_k \end{bmatrix} = ${matTeX([[1, 1], [1, 0]])}\begin{bmatrix} F_k \\ F_{k-1} \end{bmatrix}$, with $F_0 = 0$, $F_1 = 1$. Diagonalizing gives $F_k = \dfrac{\varphi^k - \psi^k}{\sqrt5}$ with $\varphi = \tfrac{1 + \sqrt5}{2}$ and $\psi = \tfrac{1 - \sqrt5}{2}$. Find $F_{${k}}$.`,
          answer: F, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.round(PHI ** k), feedback: t`Divide by $\sqrt5$: $F_k \approx \varphi^k/\sqrt5$.` }, { value: fib(k + 1), feedback: t`That is $F_{${k + 1}}$ — check the index: $F_1 = 1$, $F_2 = 1$, $F_3 = 2$.` }, { value: fib(k - 1), feedback: t`That is $F_{${k - 1}}$ — check the index: $F_1 = 1$, $F_2 = 1$, $F_3 = 2$.` }],
          hints: [t`$|\psi| \approx 0.618 < 1$, so $\psi^{${k}}$ is tiny: $F_{${k}}$ is the whole number nearest $\varphi^{${k}}/\sqrt5$.`, t`$\varphi^{${k}} \approx ${(PHI ** k).toFixed(2)}$.`],
          teach: 'The dominant eigenvalue takes over: for large k, Fₖ is the nearest whole number to φᵏ/√5.',
          explain: t`$\varphi^{${k}}/\sqrt5 \approx ${(PHI ** k / Math.sqrt(5)).toFixed(4)}$, so $F_{${k}} = ${F}$. The ratio $F_{k+1}/F_k \to \varphi \approx 1.618$, the dominant eigenvalue: each step multiplies the size by $\varphi$, while the $\psi$ mode dies away.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 21], y: [-0.5, 4.5], ylog: true, aspect: 'wide', xlabel: 'k', ylabel: 'Fₖ',
              curves: [{ fn: 'x*log10((1 + sqrt(5))/2) - log10(sqrt(5))', color: 'violet', dash: [6, 4], label: 'φᵏ/√5', labelAt: 9, labelDx: 10, labelDy: 18 }],
              points: Array.from({ length: 20 }, (_, i) => ({ x: i + 1, y: Math.log10(fib(i + 1)), color: 'gold', r: 3.5 })),
            },
            caption: 'F₁ … F₂₀ (gold) on a logarithmic scale, against φᵏ/√5 (dashed): a straight line, growing by the factor φ each step.',
          },
        };
      },
    }),
    mcq({
      id: 'order', difficulty: 2,
      prompt: t`$A$ has eigenvalue $5$ with eigenvector $(1, 2)$ and eigenvalue $-1$ with eigenvector $(1, -1)$. With $P = ${matTeX([[1, 1], [-1, 2]])}$ — note the order of the columns — what is $D$ in $A = PDP^{-1}$?`,
      choices: [t`$${matTeX([[-1, 0], [0, 5]])}$`, t`$${matTeX([[5, 0], [0, -1]])}$`, t`$${matTeX([[1, 0], [0, 2]])}$`, t`$${matTeX([[4, 0], [0, 4]])}$`],
      answer: 0,
      why: {
        1: 'That pairs 5 with the first column, but the first column of P is (1, −1), whose eigenvalue is −1.',
        2: 'Those are entries of an eigenvector, not eigenvalues.',
        3: 'D holds the eigenvalues themselves; 4 is their sum, the trace.',
      },
      hints: ['Column k of P and diagonal entry k of D belong together: AP = PD says Avₖ = λₖvₖ.'],
      teach: 'The eigenvalues in D must be listed in the same order as their eigenvectors in P.',
      explain: t`The first column, $(1, -1)$, has eigenvalue $-1$; the second, $(1, 2)$, has $5$. So $D = \operatorname{diag}(-1, 5)$. Swapping columns of $P$ swaps the entries of $D$ — both orders diagonalize $A$, as long as they match.`,
      visual: map2d([[1, 2], [4, 3]], { eigen: true, view: 2.8, caption: 'This A = [[1, 2], [4, 3]], with its eigenvector lines and eigenvalues.' }),
    }),
    mcq({
      id: 'repeated', difficulty: 3,
      prompt: t`A $3\times3$ matrix has eigenvalues $1, 1, 4$. Is it diagonalizable?`,
      choices: [
        t`It depends: yes if $\lambda = 1$ has two independent eigenvectors (a plane of them), no if only one`,
        'No: a repeated eigenvalue rules it out',
        'Yes: all its eigenvalues are real',
        t`Yes: $\det A = 4 \ne 0$`,
      ],
      answer: 0,
      why: {
        1: t`$\operatorname{diag}(1, 1, 4)$ has a repeated eigenvalue and is certainly diagonalizable.`,
        2: 'Real eigenvalues are not enough: the shear [[1, 1], [0, 1]] has real eigenvalues and is not diagonalizable.',
        3: 'Invertibility and diagonalizability are unrelated: a shear is invertible but not diagonalizable, a projection is diagonalizable but not invertible.',
      },
      hints: ['Count independent eigenvectors: λ = 4 gives one. How many must λ = 1 give for a basis of three?', 'λ = 1 gives either a line or a plane of eigenvectors; the characteristic polynomial alone cannot tell which.'],
      teach: 'Diagonalizable means the geometric multiplicities add up to n; a repeated root has to be checked.',
      explain: t`You need three independent eigenvectors. $\lambda = 4$ supplies one; $\lambda = 1$ must supply two, i.e. $A - I$ must have rank 1 (a two-dimensional null space). Check that rank — the eigenvalues alone cannot decide.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2.5,
          planes: [{ normal: [0, 0, 1], d: 0, size: 2, color: 'accent', alpha: 0.2, label: t`\lambda = 1` }],
          lines: [{ point: [0, 0, 0], dir: [0.5, 0.3, 1], t: [-2, 2], color: 'warn', label: t`\lambda = 4` }],
        },
        caption: 'The diagonalizable case: a whole plane of eigenvectors for λ = 1 (blue) and a line for λ = 4 (orange) — three independent directions. Drag to rotate.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-power', difficulty: 2,
      gen(r) {
        const lams = r.pick([[2, -1], [3, 1], [2, 1], [-2, 1]]), k = r.int(3, 5);
        const P = unimodular(r, { range: 2 }), Pi = round(inv2(P)), D = [[lams[0], 0], [0, lams[1]]];
        const A = round(matmul(matmul(P, D), Pi)), Ak = round(powM(A, k));
        const [i, j] = r.pick([[0, 0], [0, 1], [1, 0], [1, 1]].filter(([a, b]) => Ak[a][b] !== 0));
        return {
          prompt: t`$A = PDP^{-1}$ with $P = ${matTeX(P)}$, $D = ${matTeX(D)}$, $P^{-1} = ${matTeX(Pi)}$. Find the $(${i + 1}, ${j + 1})$ entry of $A^{${k}}$.`,
          answer: Ak[i][j], tol: { rel: 0, abs: 0.01 },
          hints: [t`$A^{${k}} = PD^{${k}}P^{-1}$.`],
          teach: t`$A^k = PD^kP^{-1}$.`,
          explain: t`$A^{${k}} = ${matTeX(Ak)}$.`,
          visual: map2d(A, { eigen: true, view: 2.6 }),
        };
      },
    }),
    num({
      id: 'cp-settle', difficulty: 3, transfer: true,
      gen(r) {
        const [ls, lf] = r.pick([[0.9, 0.5], [0.8, 0.4], [0.95, 0.6], [0.9, 0.3], [0.85, 0.5]]), th = r.pick([0.01, 0.001]);
        let A = [[0.7, 0.2], [0.1, 0.6]];
        for (let m = 0; m < 100; m++) {
          const P = unimodular(r, { range: 2 });
          A = matmul(matmul(P, [[ls, 0], [0, lf]]), inv2(P)).map((row) => row.map((v) => Math.round(v * 1000) / 1000));
          if (Math.abs(A[0][1]) > 1e-9 && Math.abs(A[1][0]) > 1e-9 && A.flat().every((v) => Math.abs(v) < 2)) break;     // not triangular: the eigenvalues must be computed
        }
        const k = Math.ceil(Math.log(th) / Math.log(ls)), kf = Math.ceil(Math.log(th) / Math.log(lf));
        return {
          prompt: t`A satellite's attitude controller updates its pointing error once a second: $\mathbf e_{k+1} = A\mathbf e_k$ with $A = ${decTeX(A)}$. Each eigen-component of the error shrinks by its own eigenvalue every step. After how many whole steps has the **slowest** eigen-component fallen below $${th * 100}\%$ of its starting size?`,
          answer: k, units: 's', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: kf, feedback: t`That is the fast mode. The error is not settled until the slow one — the eigenvalue closest to 1 — has decayed.` }, { value: k - 1, feedback: t`After $${k - 1}$ steps the slow mode is still at $${nice(ls ** (k - 1), 3)}$ of its size, just above the threshold.` }].filter((e) => e.value !== k),
          hints: [t`$\operatorname{tr}A = ${nice(ls + lf)}$ and $\det A = ${nice(ls * lf)}$: the eigenvalues are the roots of $\lambda^2 - ${nice(ls + lf)}\lambda + ${nice(ls * lf)}$.`, t`The slow mode decays as $${ls}^k$: solve $${ls}^k < ${th}$, i.e. $k > \ln ${th} / \ln ${ls}$.`],
          teach: 'In a decaying linear system the eigenvalue closest to 1 in size sets how long everything takes to settle.',
          explain: t`The eigenvalues are $${ls}$ and $${lf}$. The slow mode needs $${ls}^k < ${th}$: $k > \ln ${th}/\ln ${ls} = ${nice(Math.log(th) / Math.log(ls))}$, so $k = ${k}$ s (the fast mode is done after ${kf} s). Control engineers place these eigenvalues deliberately: closer to 0 means a snappier, but more demanding, controller.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 12.5], y: [0, 1.08], aspect: 'wide', xlabel: 'step k', ylabel: 'size of mode',
              points: [...Array.from({ length: 13 }, (_, i) => ({ x: i, y: ls ** i, color: 'accent', r: 3.5 })), ...Array.from({ length: 13 }, (_, i) => ({ x: i, y: lf ** i, color: 'warn', r: 3.5 }))],
              legend: [{ label: 'slow mode', color: 'accent', point: true }, { label: 'fast mode', color: 'warn', point: true }], legendAt: 'tr',
            },
            caption: 'The two eigen-components of the error over the first 12 steps, each scaled to start at 1.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: t`$A = PDP^{-1}$ with $D = \operatorname{diag}(\lambda_1, \lambda_2)$. What is $A\mathbf p_1$, where $\mathbf p_1$ is the first column of $P$?`,
      choices: [t`$\lambda_1\mathbf p_1$`, t`$\lambda_1\mathbf e_1$`, t`$\mathbf p_1$`, t`$\lambda_1\lambda_2\,\mathbf p_1$`],
      answer: 0,
      why: {
        1: t`$\mathbf e_1$ is the first eigenvector *in eigen-coordinates* (that is $D\mathbf e_1 = \lambda_1\mathbf e_1$); in standard coordinates the eigenvector is $\mathbf p_1$.`,
        2: t`That would need $\lambda_1 = 1$.`,
        3: t`$\lambda_1\lambda_2 = \det A$ scales areas, not this one vector.`,
      },
      hints: [t`Multiply $A = PDP^{-1}$ on the right by $P$: $AP = PD$. Read off the first column.`],
      teach: 'AP = PD says, column by column, that each column of P is an eigenvector with the matching eigenvalue.',
      explain: t`$AP = PD$, and the first column of $PD$ is $\lambda_1\mathbf p_1$: so $A\mathbf p_1 = \lambda_1\mathbf p_1$. Diagonalization is just “the columns of $P$ are eigenvectors”, written for all of them at once.`,
      visual: map2d([[3, 1], [2, 2]], { eigen: true, view: 2.8, x: [0.8, 0.8], xName: 'p₁', imageName: 'Ap₁', caption: 'The worked example’s A: p₁ = (1, 1) (shown shortened, dashed) and its image (gold), 4 times longer on the same line.' }),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §6.2', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'MIT OCW 18.06SC, Lecture 22: Diagonalization and powers of A', url: 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/' },
  ],
});
