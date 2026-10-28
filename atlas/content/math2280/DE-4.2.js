// The eigenvalue method for x′ = Ax with distinct real eigenvalues: the trial
// solution v e^{λt}, the characteristic equation λ² − τλ + Δ = 0, eigenvectors
// as straight-line solutions, the general solution c₁v₁e^{λ₁t} + c₂v₂e^{λ₂t},
// fitting initial data, nodes and saddles, and which mode wins in the long run.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { M, V, n, r6, lab, portrait } from './_systems.js';
import { expm2 } from '../../src/viz/model/de-plane.js';

const t = String.raw;

// A = P diag(l1, l2) P⁻¹ for a P with determinant ±1, so A has integer entries,
// eigenvalues l1, l2 and eigenvectors the columns of P
function build(P, l1, l2) {
  const [[p, q], [r, s]] = P, det = p * s - q * r;
  const Pi = [[s / det, -q / det], [-r / det, p / det]];
  const PD = [[p * l1, q * l2], [r * l1, s * l2]];
  const A = [[PD[0][0] * Pi[0][0] + PD[0][1] * Pi[1][0], PD[0][0] * Pi[0][1] + PD[0][1] * Pi[1][1]], [PD[1][0] * Pi[0][0] + PD[1][1] * Pi[1][0], PD[1][0] * Pi[0][1] + PD[1][1] * Pi[1][1]]].map((row) => row.map((v) => Math.round(v)));
  return { A, v1: [p, r], v2: [q, s] };
}
const PS = [[[1, 1], [1, 2]], [[1, 1], [2, 1]], [[1, 1], [0, 1]], [[1, 1], [-1, 0]], [[1, 1], [2, 3]], [[1, 1], [-2, -1]]];

// the characteristic polynomial as a picture: its roots are the eigenvalues
function charPoly(tr, det, l1, l2, caption) {
  const lo = Math.min(l1, l2) - 1.6, hi = Math.max(l1, l2) + 1.6, vmin = -((tr * tr) / 4 - det);
  return {
    type: 'graph',
    params: {
      x: [r6(lo), r6(hi)], y: [r6(Math.min(-1, 1.25 * vmin)), r6(Math.max(4, -0.9 * vmin))], aspect: 'wide', xlabel: 'λ', ylabel: 'p(λ)',
      curves: [{ fn: `x^2 - (${tr})*x + (${det})`, color: 'accent', width: 2.4 }],
    },
    caption: caption || 'The characteristic polynomial p(λ) = λ² − τλ + Δ. Where it crosses the axis are the eigenvalues.',
  };
}

export default lesson({
  id: 'math2280.DE-4.2',
  title: 'The eigenvalue method',
  minutes: 14, difficulty: 3,
  intro: t`Guess that $\mathbf x' = A\mathbf x$ has a solution that keeps its direction and only grows or shrinks: $\mathbf x = \mathbf v\,e^{\lambda t}$. Substituting gives $\lambda\mathbf v e^{\lambda t} = A\mathbf v e^{\lambda t}$, so $A\mathbf v = \lambda\mathbf v$: $\lambda$ must be an **eigenvalue** of $A$ and $\mathbf v$ an **eigenvector**. For a 2×2 matrix the eigenvalues solve $\det(A - \lambda I) = 0$, the **characteristic equation** $\lambda^2 - \tau\lambda + \Delta = 0$, with $\tau$ the trace and $\Delta$ the determinant. Two different real eigenvalues give two straight-line solutions, and every solution is a sum of them:

$$\mathbf x(t) = c_1\,\mathbf v_1\,e^{\lambda_1 t} + c_2\,\mathbf v_2\,e^{\lambda_2 t}.$$

Only what you need is taught here; [Linear Algebra, LA-9](#/lesson/math2270.LA-9.1) builds eigenvectors in full.`,
  symbols: [
    { tex: '\\mathbf x(t)', text: 'the state vector, as in DE-4.1' },
    { tex: '\\lambda_1,\\ \\lambda_2', text: 'the eigenvalues of $A$, in 1/time: the growth (positive) or decay (negative) **rates** of the two straight-line solutions' },
    { tex: '\\mathbf v_1,\\ \\mathbf v_2', text: 'eigenvectors, $A\\mathbf v = \\lambda\\mathbf v$: the **directions** of the straight-line solutions. Any nonzero multiple of an eigenvector is an eigenvector' },
    { tex: 'c_1,\\ c_2', text: 'constants fixed by the initial state, $\\mathbf x(0) = c_1\\mathbf v_1 + c_2\\mathbf v_2$' },
    { tex: '\\tau,\\ \\Delta', text: 'the trace $a + d$ and determinant $ad - bc$ of $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$; they are the sum and the product of the eigenvalues' },
  ],
  why: t`Eigenvalues turn a coupled system into independent pieces — modes — each of which simply grows or decays; the same idea gives normal modes of vibration (DE-4.5), the stability of every equilibrium (DE-5), and the energy levels of quantum mechanics.`,
  visual: {
    type: 'de-plane',
    title: 'Straight-line solutions',
    lead: t`Set the four entries of $A$. The gold dashed lines are the eigenvector directions, each labelled with its eigenvalue; the readout gives $\tau$, $\Delta$ and the type. Drag the hollow start point: its trajectory is drawn bold.`,
    tasks: [
      t`With $A = ${M([[1, 1], [4, 1]])}$ (the start), drag the start point onto either gold line: the trajectory stays on it, running out along $\lambda = 3$ and in along $\lambda = -1$. Everywhere else it bends away — a **saddle**.`,
      t`Set $a = -2$, $b = 1$, $c = 1$, $d = -2$: both eigenvalues are negative and every trajectory runs in — a **stable node**. Near the origin they all arrive along the line of the slower rate, $\lambda = -1$.`,
      t`Set $c = 0$: the matrix is triangular and its eigenvalues are just $a$ and $d$.`,
    ],
    params: {
      matrix: [['a', 'b'], ['c', 'd']], x: [-3, 3], y: [-3, 3], aspect: 'square', xlabel: 'x₁', ylabel: 'x₂', eigen: true,
      sliders: [
        { key: 'a', label: '$a$ (top left)', min: -3, max: 3, step: 0.5, value: 1, explain: 'How fast $x_1$ feeds its own rate: $x_1\' = a\\,x_1 + b\\,x_2$.' },
        { key: 'b', label: '$b$ (top right)', min: -4, max: 4, step: 0.5, value: 1, explain: 'How $x_2$ drives $x_1$.' },
        { key: 'c', label: '$c$ (bottom left)', min: -4, max: 4, step: 0.5, value: 4, explain: 'How $x_1$ drives $x_2$: $x_2\' = c\\,x_1 + d\\,x_2$.' },
        { key: 'd', label: '$d$ (bottom right)', min: -3, max: 3, step: 0.5, value: 1, explain: 'How fast $x_2$ feeds its own rate.' },
      ],
      start: [1.5, -1], T: 6, seeds: [[2.5, 0.5], [-2.5, -0.5], [0.5, 2.5], [-0.5, -2.5], [2.5, -2.5], [-2.5, 2.5]],
    },
    caption: 'Arrows show direction only. Trajectories are traced numerically, forward and backward in time, arrowheads forward. Complex eigenvalues (no gold lines) are the next lesson.',
  },
  example: {
    prompt: t`Two avionics boxes are bolted side by side on a satellite panel. Let $u_1$, $u_2$ be how far each sits above the panel’s temperature. Each box sheds heat to the panel at a rate $0.1\,u$ per minute and the two exchange heat at $0.05\,(u_1 - u_2)$ per minute, so

$$\mathbf u' = ${M([[-0.15, 0.05], [0.05, -0.15]])}\,\mathbf u, \qquad \mathbf u(0) = ${V([30, 10])}\ \text{K}.$$

Solve it, and say what each eigenvalue means.`,
    visual: {
      type: 'de-plane',
      params: { matrix: [[-0.15, 0.05], [0.05, -0.15]], x: [-14, 34], y: [-14, 22], aspect: 'wide', xlabel: 'u₁ (K)', ylabel: 'u₂ (K)', eigen: true, start: [30, 10], series: true, tmax: 40, seriesNames: ['u₁(t)', 'u₂(t)'], readout: false, click: false, grid: 22 },
      caption: 'Top: the state slides in along a curve that ends tangent to the slow line λ = −0.1 (gold). Bottom: the two temperatures against time in minutes — they meet long before they reach the panel’s temperature. Lumped, linear model: radiation and the boxes’ own power are ignored.',
    },
    steps: [
      { label: 'Characteristic equation', text: t`$\tau = -0.3$ and $\Delta = 0.0225 - 0.0025 = 0.02$, so $\lambda^2 + 0.3\lambda + 0.02 = 0$, which factors as $(\lambda + 0.1)(\lambda + 0.2) = 0$: $\lambda_1 = -0.1$, $\lambda_2 = -0.2$ per minute.` },
      { label: 'Eigenvectors', text: t`For $\lambda_1 = -0.1$: $A + 0.1I = ${M([[-0.05, 0.05], [0.05, -0.05]])}$, whose rows both say $u_1 = u_2$, so $\mathbf v_1 = (1, 1)$. For $\lambda_2 = -0.2$: $A + 0.2I = ${M([[0.05, 0.05], [0.05, 0.05]])}$ gives $u_1 = -u_2$, so $\mathbf v_2 = (1, -1)$.` },
      { label: 'General solution', text: t`$\mathbf u = c_1${V([1, 1])}e^{-0.1t} + c_2${V([1, -1])}e^{-0.2t}$.` },
      { label: 'Fit the start', text: t`At $t = 0$: $c_1 + c_2 = 30$ and $c_1 - c_2 = 10$, so $c_1 = 20$, $c_2 = 10$. Hence $u_1 = 20e^{-0.1t} + 10e^{-0.2t}$ and $u_2 = 20e^{-0.1t} - 10e^{-0.2t}$.` },
      { label: 'Read the modes', text: t`The mean excess $\tfrac12(u_1 + u_2) = 20e^{-0.1t}$ decays at the panel rate alone: the **slow mode**, both boxes cooling together. The difference $u_1 - u_2 = 20e^{-0.2t}$ decays twice as fast: the **fast mode**, the boxes evening out with each other as well as cooling. After 10 minutes the difference is $20e^{-2} = 2.7$ K while the mean is still $20e^{-1} = 7.4$ K.` },
      { label: 'Sense check', text: t`Both eigenvalues are negative, so every state decays to the panel temperature: a **stable node**. Late on, $e^{-0.2t}$ is negligible beside $e^{-0.1t}$, so trajectories arrive along $\mathbf v_1 = (1, 1)$ — equal temperatures, as physics demands.` },
    ],
    answer: t`$\mathbf u = 20${V([1, 1])}e^{-0.1t} + 10${V([1, -1])}e^{-0.2t}$ K: the mean cools with time constant 10 min, the difference with 5 min.`,
  },
  practice: [
    num({
      id: 'eigenvalues', difficulty: 1,
      gen(r) {
        const [l1, l2] = r.pick([[3, -1], [2, -3], [-1, -4], [1, 4], [2, -1], [-2, -5]]);
        const { A } = build(r.pick(PS), l1, l2);
        const big = r.bool(0.5), ans = big ? Math.max(l1, l2) : Math.min(l1, l2), other = big ? Math.min(l1, l2) : Math.max(l1, l2);
        const tr = l1 + l2, det = l1 * l2;
        return {
          prompt: t`Find the ${big ? 'larger' : 'smaller'} eigenvalue of $A = ${M(A)}$.`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: other, feedback: t`That is the other eigenvalue — the question asks for the ${big ? 'larger' : 'smaller'} one.` }],
          hints: [t`$\tau = ${A[0][0]} + (${A[1][1]}) = ${tr}$ and $\Delta = (${A[0][0]})(${A[1][1]}) - (${A[0][1]})(${A[1][0]}) = ${det}$.`, t`Solve $\lambda^2 - (${tr})\lambda + (${det}) = 0$.`],
          teach: 'The eigenvalues of a 2×2 matrix are the roots of λ² − τλ + Δ = 0, with τ the trace and Δ the determinant.',
          explain: t`$\lambda^2 - (${tr})\lambda + (${det}) = (\lambda - (${l1}))(\lambda - (${l2})) = 0$, so the eigenvalues are $${l1}$ and $${l2}$. Check: they add to the trace ${tr} and multiply to the determinant ${det}.`,
          visual: charPoly(tr, det, l1, l2),
        };
      },
    }),
    num({
      id: 'eigenvector', difficulty: 2,
      gen(r) {
        const [p, q] = r.pick([[2, 1], [1, 2], [0, 1], [1, 0], [-1, 0], [3, 2], [-2, -1]]);
        const [l1, l2] = r.pick([[3, -1], [-1, -3], [2, -2], [1, -2]]);
        const { A } = build([[1, 1], [p, q]], l1, l2);
        const B = [[A[0][0] - l1, A[0][1]], [A[1][0], A[1][1] - l1]];
        return {
          prompt: t`$A = ${M(A)}$ has the eigenvalue $\lambda = ${l1}$. Write an eigenvector for it as $\mathbf v = (1, m)$. What is $m$?`,
          answer: p, tol: { rel: 0, abs: 1e-6 },
          errors: q !== p ? [{ value: q, feedback: t`That is the eigenvector of the *other* eigenvalue, $${l2}$. Use $A - (${l1})I$.` }] : [],
          hints: [t`Solve $(A - ${l1 < 0 ? `(${l1})` : l1}I)\mathbf v = \mathbf 0$: $A - ${l1 < 0 ? `(${l1})` : l1}I = ${M(B)}$.`, t`Both rows give the same condition (the matrix is singular). With $\mathbf v = (1, m)$ the ${B[0][1] !== 0 ? 'first' : 'second'} row reads $${B[0][1] !== 0 ? `${B[0][0]} + (${B[0][1]})m` : `${B[1][0]} + (${B[1][1]})m`} = 0$.`],
          teach: 'An eigenvector solves (A − λI)v = 0; for a 2×2 matrix one row of A − λI is enough, since the other is a multiple of it.',
          explain: t`$(A - ${l1 < 0 ? `(${l1})` : l1}I)(1, m) = \mathbf 0$ gives $m = ${p}$, so $\mathbf v = (1, ${p})$ — and $A\mathbf v = (${A[0][0] + A[0][1] * p}, ${A[1][0] + A[1][1] * p}) = ${l1}\,(1, ${p})$ ✓. Any multiple, such as $(2, ${2 * p})$, is just as good.`,
          visual: portrait(A, { seeds: [[2.5, 0.3], [-2.5, -0.3], [0.3, 2.5], [-0.3, -2.5], [1.5, -2.5], [-1.5, 2.5]], caption: 'Trajectories of x′ = Ax. One family of them hugs the eigenvector line you are looking for.' }),
        };
      },
    }),
    mcq({
      id: 'classify', difficulty: 2,
      gen(r) {
        const [l1, l2] = r.pick([[2, -1], [3, -2], [-1, -3], [-2, -4], [1, 3], [2, 4]]);
        const { A } = build(r.pick(PS), l1, l2);
        const tr = l1 + l2, det = l1 * l2;
        const kind = l1 * l2 < 0 ? 0 : l1 < 0 ? 1 : 2;
        const choices = ['A saddle: one straight-line solution runs in, the other out', 'A stable node: every solution decays to the origin', 'An unstable node: every solution except the origin grows away', 'A centre: every solution circles the origin'];
        const whyAll = {
          0: 'A saddle needs eigenvalues of opposite signs, so that one direction shrinks while the other grows: their product Δ is negative.',
          1: 'A stable node needs both eigenvalues negative, so both terms of the solution decay.',
          2: 'An unstable node needs both eigenvalues positive.',
          3: 'Real eigenvalues give straight-line solutions, which cannot circle; a centre needs purely imaginary eigenvalues (next lesson).',
        };
        const why = {}; for (const k of [0, 1, 2, 3]) if (k !== kind) why[k] = whyAll[k];
        return {
          prompt: t`What does the phase portrait of $\mathbf x' = ${M(A)}\,\mathbf x$ look like?`,
          choices, answer: kind, why,
          hints: [t`Find the eigenvalues from $\lambda^2 - \tau\lambda + \Delta = 0$; here $\tau = ${tr}$ and $\Delta = ${det}$.`, t`The eigenvalues are $${l1}$ and $${l2}$. What does each sign do to $e^{\lambda t}$?`],
          teach: 'Real eigenvalues of opposite signs make a saddle; both negative, a stable node; both positive, an unstable node.',
          explain: t`The eigenvalues are $${l1}$ and $${l2}$. ${kind === 0 ? t`Opposite signs: along one eigenvector solutions shrink like $e^{${Math.min(l1, l2)}t}$, along the other they grow like $e^{${Math.max(l1, l2)}t}$ — a saddle. Every solution not exactly on the stable line eventually grows.` : kind === 1 ? t`Both negative: both terms of $c_1\mathbf v_1e^{${l1}t} + c_2\mathbf v_2e^{${l2}t}$ decay, so every solution falls into the origin — a stable node.` : t`Both positive: both terms grow, so every solution except $\mathbf x = \mathbf 0$ runs away — an unstable node.`}`,
          visual: charPoly(tr, det, l1, l2),
        };
      },
    }),
    num({
      id: 'ivp', difficulty: 3,
      gen(r) {
        const P = r.pick(PS), [l1, l2] = r.pick([[1, -2], [-1, -3], [-1, -2], [2, -1]]);
        const { A, v1, v2 } = build(P, l1, l2);
        const c1 = r.pick([1, 2, -1]), c2 = r.pick([1, -2, 3]);
        const x0 = [c1 * v1[0] + c2 * v2[0], c1 * v1[1] + c2 * v2[1]];
        const T = 0.5, X = expm2(A[0][0], A[0][1], A[1][0], A[1][1], T);
        const ans = X[0][0] * x0[0] + X[0][1] * x0[1];
        const wrong = c2 * v1[0] * Math.exp(l1 * T) + c1 * v2[0] * Math.exp(l2 * T);
        const naive = x0[0] * v1[0] * Math.exp(l1 * T) + x0[1] * v2[0] * Math.exp(l2 * T);
        const errors = [{ value: wrong, feedback: t`The constants are swapped: $c_1$ goes with $\mathbf v_1$ and $\lambda_1 = ${l1}$.` }, { value: naive, feedback: t`The constants are not the components of $\mathbf x(0)$: solve $c_1\mathbf v_1 + c_2\mathbf v_2 = \mathbf x(0)$ for them.` }]
          .filter((e) => Math.abs(e.value - ans) > 1e-3 * Math.max(1, Math.abs(ans)) && Math.abs(e.value + ans) > 1e-3 * Math.max(1, Math.abs(ans)));
        const ext = Math.max(3, Math.abs(x0[0]) + 1, Math.abs(x0[1]) + 1);
        return {
          prompt: t`Solve $\mathbf x' = ${M(A)}\,\mathbf x$ with $\mathbf x(0) = ${V(x0)}$, and give $x_1$ at $t = 0.5$ to 3 significant figures. (The eigenvalues are $${l1}$ and $${l2}$.)`,
          answer: ans, tol: { rel: 0.005, abs: 1e-3 },
          errors,
          hints: [t`Eigenvectors: for $\lambda = ${l1}$, $\mathbf v_1 = ${V(v1)}$; for $\lambda = ${l2}$, $\mathbf v_2 = ${V(v2)}$ (check that $A\mathbf v = \lambda\mathbf v$).`, t`Solve $c_1${V(v1)} + c_2${V(v2)} = ${V(x0)}$, then evaluate $x_1 = ${v1[0]}c_1e^{${l1}t} + ${v2[0]}c_2e^{${l2}t}$ at $t = 0.5$.`],
          teach: t`Find the eigenpairs, write $\mathbf x = c_1\mathbf v_1e^{\lambda_1t} + c_2\mathbf v_2e^{\lambda_2t}$, and fix $c_1$, $c_2$ from $\mathbf x(0)$ — two linear equations.`,
          explain: t`$c_1 = ${c1}$, $c_2 = ${c2}$, so $\mathbf x = ${c1}${V(v1)}e^{${l1}t} + (${c2})${V(v2)}e^{${l2}t}$ and $x_1(0.5) = ${fmt(ans, 4)}$.`,
          visual: portrait(A, { x: [-ext, ext].map(r6), y: [-ext, ext].map(r6), seeds: [{ x: x0[0], y: x0[1], dir: 'forward', color: 'accent2', T: 0.5 }], points: [{ x: x0[0], y: x0[1], label: 'x(0)', color: 'gold' }], caption: 'The solution from x(0), traced forward to t = 0.5 (its end is where you are heading).' }),
        };
      },
    }),
    {
      type: 'point', id: 'straight-line', difficulty: 2,
      prompt: t`$\mathbf x' = ${M([[2, 3], [0, -1]])}\,\mathbf x$ is a saddle. Drag the hollow start point up or down the line $x_1 = 1$ until its trajectory runs **straight into the origin**.`,
      visual: { type: 'de-plane', params: { matrix: [[2, 3], [0, -1]], x: [-3, 3], y: [-3, 3], equal: false, aspect: 'wide', xlabel: 'x₁', ylabel: 'x₂', start: [1, 1.5], T: 4, readout: false, click: false, curves: [{ param: ['1', 't'], t: [-4, 4], color: 'ink3', width: 1.2, dash: true }] }, caption: 'The bold curve is the trajectory from the start point. The dashed line is x₁ = 1.' },
      answer: { x: 1, y: -1 }, tol: { x: 0.12, y: 0.15 },
      instruction: 'Drag the start point along the dashed line, then check.',
      hints: ['A straight-line solution lies along an eigenvector. You want the one whose eigenvalue is negative.', t`The matrix is triangular, so its eigenvalues are $2$ and $-1$. Solve $(A + I)\mathbf v = \mathbf 0$ with $\mathbf v = (1, m)$.`],
      teach: t`Starting on an eigenvector line, the solution $\mathbf v e^{\lambda t}$ stays on that line; with $\lambda < 0$ it slides straight into the origin.`,
      explain: t`$(A + I)\mathbf v = ${M([[3, 3], [0, 0]])}${V([1, 'm'])} = \mathbf 0$ gives $m = -1$. From $(1, -1)$ the solution is $(1, -1)\,e^{-t}$: straight in. From anywhere slightly off that line, the $e^{2t}$ term eventually takes over and flings the trajectory out along $(1, 0)$ — which is why a saddle is unstable.`,
    },
    mcq({
      id: 'scaled', difficulty: 2, kind: 'error',
      prompt: t`For $A = ${M([[1, 1], [4, 1]])}$ and $\lambda = -1$, the answer key gives the eigenvector $(1, -2)$. A student wrote $(-3, 6)$ and was marked wrong. Who is right?`,
      choices: [
        t`Both: $(-3, 6) = -3\,(1, -2)$, and any nonzero multiple of an eigenvector is an eigenvector`,
        'The key: an eigenvector must have first entry 1',
        t`The key: $(-3, 6)$ points the opposite way, so it would give a solution running out instead of in`,
        t`Neither: the eigenvector must have length 1, so it is $(1, -2)/\sqrt5$`,
      ],
      answer: 0,
      why: {
        1: 'Scaling to a first entry of 1 is a convenience, not a rule. A(−3, 6) = (3, −6) = −1 · (−3, 6): it satisfies Av = λv.',
        2: t`Whether a solution runs in or out is set by the sign of $\lambda$, not of $\mathbf v$: $c\,(-3, 6)\,e^{-t}$ shrinks for every $c$. Flipping $\mathbf v$ just flips the sign of the constant.`,
        3: 'Unit length is one tidy choice (it is what NumPy returns), but it is not required: the constants c₁, c₂ absorb any scaling.',
      },
      hints: [t`Check $A(-3, 6)$ directly.`, 'If v satisfies Av = λv, what about 5v?'],
      teach: 'Eigenvectors are directions: any nonzero multiple works, and the constants c₁, c₂ in the general solution absorb the scaling.',
      explain: t`$A(-3, 6) = (-3 + 6,\ -12 + 6) = (3, -6) = -1\cdot(-3, 6)$ ✓. The general solution comes out the same either way: a different $\mathbf v$ just changes the value of $c$ that fits the initial state.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4, 3], y: [-3.5, 7], aspect: 'wide', equal: true, xlabel: 'x₁', ylabel: 'x₂',
          curves: [{ fn: '-2*x', color: 'gold', width: 1.6, dash: true }],
          arrows: [{ from: [0, 0], to: [1, -2], color: 'accent', width: 2.6, label: '(1, −2)', labelDx: 8, labelDy: 4 }, { from: [0, 0], to: [-3, 6], color: 'violet', width: 2.6, label: '(−3, 6)', labelDx: 8, labelDy: 0 }],
        },
        caption: 'Both vectors lie on the same line through the origin — the eigenvector line of λ = −1.',
      },
    }),
    mcq({
      id: 'slow-wins', difficulty: 3,
      prompt: t`A stable node has eigenvalues $\lambda_1 = -1$ with $\mathbf v_1 = (1, 1)$ and $\lambda_2 = -4$ with $\mathbf v_2 = (1, -1)$. A generic trajectory (not on either line) approaches the origin. Along which direction does it arrive?`,
      choices: [t`Along $\mathbf v_1 = (1, 1)$, the slower eigenvalue`, t`Along $\mathbf v_2 = (1, -1)$, the faster eigenvalue`, 'Straight along the line from its starting point to the origin', 'From no fixed direction: it spirals in'],
      answer: 0,
      why: {
        1: t`The fast term $c_2\mathbf v_2e^{-4t}$ dies first — after one time unit it has shrunk by $e^{-4} \approx 0.02$, the other only by $e^{-1} \approx 0.37$. What is left is the slow term.`,
        2: 'That happens only for starts on an eigenvector line. Elsewhere the two terms decay at different rates, so the direction of x(t) keeps turning.',
        3: 'Real eigenvalues give no rotation; spirals need complex eigenvalues.',
      },
      hints: [t`Write $\mathbf x = c_1\mathbf v_1e^{-t} + c_2\mathbf v_2e^{-4t}$ and compare the two terms at large $t$.`, t`Their ratio is $(c_2/c_1)\,e^{-3t} \to 0$.`],
      teach: 'Near a node, generic trajectories arrive tangent to the eigenvector of the eigenvalue nearest zero — the slow mode outlasts the fast one.',
      explain: t`$\mathbf x = e^{-t}\left(c_1\mathbf v_1 + c_2\mathbf v_2e^{-3t}\right)$: the bracket tends to $c_1\mathbf v_1$, so the direction of $\mathbf x$ tends to $\mathbf v_1$. In the worked example that was the boxes reaching equal temperatures before they reached the panel’s.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3], y: [0, 1.1], aspect: 'wide', xlabel: 't', ylabel: '',
          curves: [{ fn: 'exp(-x)', color: 'accent', width: 2.4, label: 'e⁻ᵗ', labelAt: 1.6, labelDx: 6, labelDy: -10 }, { fn: 'exp(-4x)', color: 'violet', width: 2.4, label: 'e⁻⁴ᵗ', labelAt: 0.35, labelDx: 8, labelDy: 0 }],
        },
        caption: 'The two factors in the solution. One is gone long before the other.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-difference', difficulty: 3,
      gen(r) {
        const h = r.pick([0.02, 0.04, 0.05]), k = r.pick([0.01, 0.03, 0.06]);
        const lf = h + 2 * k, half = Math.log(2) / lf;
        const A = [[-(h + k), k], [k, -(h + k)]].map((row) => row.map(r6));
        return {
          prompt: t`Two identical instrument blocks on a spacecraft bench lose heat to the bench at a rate $${h}\,u$ per minute each and exchange heat with each other at $${k}\,(u_1 - u_2)$ per minute, where $u_1$, $u_2$ are their temperatures above the bench. After a heater switches off, how long does it take the **difference** $u_1 - u_2$ to halve?`,
          answer: half, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: Math.log(2) / h, feedback: t`That is the half-life of the *mean*, the slow mode with $\lambda = -${h}$. The difference is the other eigenvector, $(1, -1)$.` }, { value: Math.log(2) / (h + k), feedback: t`Each block’s own rate is $${nice(h + k)}$, but the difference feels the exchange twice — once from each side: $\lambda = -(h + 2k)$.` }],
          hints: [t`$\mathbf u' = ${M(A)}\,\mathbf u$. Try the eigenvectors $(1, 1)$ and $(1, -1)$.`, t`$A(1, -1) = -(${h} + 2\times${k})(1, -1)$, so the difference decays like $e^{-${nice(lf)}t}$.`],
          teach: 'For two identical coupled bodies, the mean and the difference are the eigenvectors: each decays at its own rate.',
          explain: t`The difference mode has $\lambda = -(h + 2k) = -${nice(lf)}$ per min, so it halves in $\ln2/${nice(lf)} = ${fmt(half, 3)}$ min — faster than the mean, which halves in $\ln 2/${h} = ${fmt(Math.log(2) / h, 3)}$ min.`,
          visual: { type: 'de-plane', params: { matrix: A, x: [-12, 32], y: [-12, 22], aspect: 'wide', xlabel: 'u₁ (K)', ylabel: 'u₂ (K)', start: [30, 0], series: true, tmax: r6(4 / h), seriesNames: ['u₁(t)', 'u₂(t)'], readout: false, click: false, grid: 22 }, caption: 'One block starts 30 K warm, the other at the bench temperature. Time in minutes. Lumped, linear model.' },
        };
      },
    }),
    num({
      id: 'cp-balance', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.4, 0.6, 0.9]), f = r.pick([5, 10]), g = 9.8, w = Math.sqrt(g / L);
        const ts = Math.acosh(f) / w;
        return {
          prompt: t`A self-balancing robot, with its controller switched off, tips like an inverted pendulum: near upright, $\theta'' = (g/L)\,\theta$ with $L = ${L}$ m and $g = 9.8\ \text{m/s}^2$. Released from rest at a tilt of 1°, how long until it leans ${f}°?`,
          answer: ts, units: 's', tol: { rel: 0.005 },
          errors: [{ value: Math.log(f) / w, feedback: t`That assumes $\theta = \theta_0e^{\omega t}$. Starting from rest, both straight-line solutions are present: $\theta = \theta_0\cosh\omega t$.` }],
          hints: [t`As a system, $(\theta, \theta')' = ${M([[0, 1], ['g/L', 0]])}(\theta, \theta')$, with eigenvalues $\pm\omega$, $\omega = \sqrt{g/L} = ${fmt(w, 4)}$ s⁻¹, and eigenvectors $(1, \pm\omega)$.`, t`From $(\theta_0, 0)$: $c_1 = c_2 = \theta_0/2$, so $\theta = \tfrac{\theta_0}{2}(e^{\omega t} + e^{-\omega t}) = \theta_0\cosh\omega t$. Solve $\cosh\omega t = ${f}$.`],
          teach: 'An upright balance is a saddle: the growing eigenvalue √(g/L) sets how fast any tilt runs away, and a controller has to act on that time scale.',
          explain: t`$t = \operatorname{arccosh}(${f})/\omega = ${fmt(Math.acosh(f), 4)}/${fmt(w, 4)} = ${fmt(ts, 3)}$ s. The time scale $1/\omega = ${fmt(1 / w, 3)}$ s is why a balancing controller must update many times a second. (Point mass on a light rod; the small-angle model holds well at ${f}°.)`,
          visual: { type: 'de-plane', params: { matrix: [[0, 1], [r6(g / L), 0]], x: [-0.25, 0.25], y: [r6(-0.25 * w), r6(0.25 * w)], equal: false, aspect: 'wide', xlabel: 'θ (rad)', ylabel: 'θ′ (rad/s)', eigen: true, seeds: [{ x: 0.01745, y: 0, dir: 'forward', color: 'accent2', T: 3 }], readout: false, click: false }, caption: 'The upright position is a saddle. From a 1° tilt at rest (on the θ axis) the state is flung out along the unstable line.' },
        };
      },
    }),
    mcq({
      id: 'cp-which-start', difficulty: 2,
      prompt: t`$\mathbf x' = ${M([[1, 1], [4, 1]])}\,\mathbf x$ has eigenpairs $3,\ (1, 2)$ and $-1,\ (1, -2)$. Which initial state gives a solution that tends to $\mathbf 0$ as $t \to \infty$?`,
      choices: [t`$(2, -4)$`, t`$(2, 4)$`, t`$(1, 0)$`, t`$(-1, -2)$`],
      answer: 0,
      why: {
        1: t`$(2, 4) = 2(1, 2)$ lies on the **growing** line: the solution is $2(1, 2)e^{3t}$.`,
        2: t`$(1, 0) = \tfrac12(1, 2) + \tfrac12(1, -2)$ contains some of the growing eigenvector, and $e^{3t}$ wins in the end.`,
        3: t`$(-1, -2) = -(1, 2)$ is on the growing line too — pointing the other way, so it runs out toward the lower left.`,
      },
      hints: ['Only a solution with no component along the growing eigenvector can decay.', t`Write each start as $c_1(1, 2) + c_2(1, -2)$: you need $c_1 = 0$.`],
      teach: 'In a saddle only starts exactly on the stable eigenvector line decay; every other start has some of the growing mode.',
      explain: t`$(2, -4) = 2(1, -2)$: $c_1 = 0$, $c_2 = 2$, and $\mathbf x = 2(1, -2)e^{-t} \to \mathbf 0$. Every other start has $c_1 \neq 0$ and eventually grows like $e^{3t}$.`,
      visual: portrait([[1, 1], [4, 1]], { x: [-3, 3], y: [-5, 5], equal: false, seeds: [[0.5, 3], [-0.5, -3], [2.5, -1], [-2.5, 1], [1, 0.5], [-1, -0.5]], caption: 'The saddle’s trajectories, without its eigenvector lines.' }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §3.4 Eigenvalue method', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Real eigenvalues', url: 'https://tutorial.math.lamar.edu/Classes/DE/RealEigenvalues.aspx' },
  ],
});
