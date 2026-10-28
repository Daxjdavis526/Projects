// Normal equations versus QR — least squares as a computation: forming AᵀA
// squares the condition number, so the normal equations lose twice the
// digits QR does; R x = Qᵀb keeps κ(A); the minimum residual read off Qᵀb;
// column scaling (raw times in seconds) as the cheapest cure; and orbit
// determination, where a short tracking arc makes the problem itself
// ill-conditioned.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { vander, mv, mm, T, cond2, lsqQR } from './_lin.js';
import { solve } from '../prog/_solvers.js';

const t = String.raw;
const U = 2 ** -53;

// ── polynomial fits on 50 points of [0, 1], exact data from coefficients all 1 ──
const NPT = 50, TS = Array.from({ length: NPT }, (_, i) => i / (NPT - 1));
const DEG = Array.from({ length: 15 }, (_, i) => i + 1);
const FIT = DEG.map((d) => {
  const A = vander(TS, d), c = Array(d + 1).fill(1), b = mv(A, c), At = T(A);
  const err = (x) => Math.hypot(...x.map((v, i) => v - c[i])) / Math.sqrt(d + 1);
  return { d, k: cond2(A), qr: err(lsqQR(A, b)), ne: err(solve(mm(At, A), mv(At, b))) };
});
const F10 = FIT[9];
const clampLg = (v) => Math.min(1.5, Math.max(-16.5, lg(v)));
const selD = (f) => FIT.map((r) => `step(0.5 - abs(d - ${r.d}))*(${n12(f(r))})`).join(' + ');

// ── raw times in seconds: a cubic in t over 0–300 s ──
const TT = Array.from({ length: 31 }, (_, i) => 10 * i);
const K_RAW = cond2(vander(TT, 3)), K_SCALED = cond2(vander(TT.map((s) => s / 150 - 1), 3));

// ── orbit fits 1/r = a₀ + a₁ cos θ + a₂ sin θ over arcs of different length ──
const arcK = (deg) => cond2(Array.from({ length: 20 }, (_, i) => { const th = ((deg * Math.PI) / 180) * (i / 19); return [1, Math.cos(th), Math.sin(th)]; }));
const ARCS = [360, 90, 20, 5].map((a) => [a, arcK(a)]);

export default lesson({
  id: 'st-f.F8.1',
  title: 'Normal equations versus QR',
  minutes: 13, difficulty: 3,
  intro: t`A least-squares fit minimizes $\lVert Ax - b\rVert$. You derived the **normal equations** $A^{\mathsf T}Ax = A^{\mathsf T}b$ in [linear algebra](#/lesson/math2270.LA-10.4), and they are exactly right — in exact arithmetic. In floating point, forming $A^{\mathsf T}A$ **squares the condition number**, so they can lose twice as many digits as the problem itself requires. QR avoids the square: since $Q$ preserves lengths, $\lVert Ax - b\rVert = \lVert Rx - Q^{\mathsf T}b\rVert$, and the triangular system has $R$’s condition number, which equals $A$’s.

$$\kappa(A^{\mathsf T}A) = \kappa(A)^2, \qquad A = QR \ \Longrightarrow\ R\hat x = Q^{\mathsf T}b, \quad \kappa(R) = \kappa(A)$$

Rule of thumb, for a fit with a small residual: the normal equations give about $16 - 2\log_{10}\kappa$ correct digits, QR about $16 - \log_{10}\kappa$.`,
  symbols: [
    { tex: 'A', text: 'the $m\\times n$ design matrix ($m > n$): one row per measurement, one column per parameter' },
    { tex: 'b', text: 'the $m$ measurements' },
    { tex: t`\hat x`, text: 'the least-squares parameters' },
    { tex: t`\kappa(A)`, text: 'the condition number $\\sigma_{\\max}/\\sigma_{\\min}$ (ratio of largest to smallest singular value, [F8.2](#/lesson/st-f.F8.2)): how much a relative change in the data can move $\\hat x$' },
    { tex: 'Q,\\ R', text: 'the thin QR factors ([F6.2](#/lesson/st-f.F6.2)): $Q$ is $m\\times n$ with orthonormal columns, $R$ is $n\\times n$ upper-triangular' },
    { tex: t`Q^{\mathsf T}b`, text: 'the measurements in the orthonormal basis of the column space: what $R\\hat x$ must match' },
  ],
  why: 'Every fit you will run — orbit determination from tracking data, a calibration curve, a thrust model (and, through linearization, every nonlinear fit like curve_fit in P14) — is a least-squares solve, and choosing QR over the normal equations is the difference between trustworthy and meaningless digits when the columns are nearly dependent.',
  visual: {
    type: 'graph',
    title: 'Twice the digits lost',
    lead: t`Polynomial fits of degree $d$ in the monomials $1, t, \ldots, t^d$ to 50 samples on $[0, 1]$, with exact data made from known coefficients. Points: the measured error of the coefficients by the normal equations (red) and by Householder QR (blue). Dashed: $\kappa u$ and $\kappa^2u$. Slide $d$ to read them.`,
    tasks: [
      'Each added degree multiplies κ by about 6. The red errors climb twice as steeply as the blue ones.',
      'At d = 10 the normal equations keep about two digits; QR keeps about nine.',
      'From d = 12 the normal equations return nonsense (errors above 1) while QR still has six or seven digits.',
    ],
    params: {
      x: [0.4, 15.6], y: [-16.8, 1.8], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'polynomial degree d', ylabel: 'coefficient error',
      sliders: [{ key: 'd', label: 'Degree $d$', min: 1, max: 15, step: 1, value: 10, explain: 'The highest power of t in the fitted polynomial.' }],
      points: [...FIT.map((r) => ({ x: r.d, y: n12(clampLg(r.ne)), r: 4.5, color: 'bad' })), ...FIT.map((r) => ({ x: r.d, y: n12(clampLg(r.qr)), r: 4.5, color: 'accent' }))],
      curves: [
        ...FIT.slice(1).map((r, i) => ({ param: [`${FIT[i].d} + t`, `${n12(clampLg(FIT[i].k * U))} + (${n12(clampLg(r.k * U) - clampLg(FIT[i].k * U))})*t`], t: [0, 1], color: 'accent', dash: true, width: 1.2 })),
        ...FIT.slice(1).map((r, i) => ({ param: [`${FIT[i].d} + t`, `${n12(clampLg(FIT[i].k ** 2 * U))} + (${n12(clampLg(r.k ** 2 * U) - clampLg(FIT[i].k ** 2 * U))})*t`], t: [0, 1], color: 'bad', dash: true, width: 1.2 })),
      ],
      vlines: [{ x: 'd', color: 'ink4' }],
      legend: [{ label: 'normal equations', color: 'bad', point: true }, { label: 'QR', color: 'accent', point: true }, { label: 'κ²u', color: 'bad', dash: true }, { label: 'κu', color: 'accent', dash: true }], legendAt: 'tl',
      readouts: [
        { label: 'κ(A)', expr: selD((r) => r.k), digits: 3 },
        { label: 'κ(AᵀA)', expr: selD((r) => r.k ** 2), digits: 3 },
        { label: 'error, normal equations', expr: selD((r) => r.ne), digits: 2, zero: 0 },
        { label: 'error, QR', expr: selD((r) => r.qr), digits: 2, zero: 0 },
      ],
    },
    caption: 'Computed in float64 by this lesson’s JavaScript (normal equations solved by LU with pivoting, QR by Householder); NumPy’s errors differ in detail but not in size. Errors above 10 are drawn at the top edge. The dashed lines are estimates, not bounds.',
  },
  example: {
    prompt: t`Fit a degree-10 polynomial to 50 equally spaced samples on $[0, 1]$, made from known coefficients (all 1) so the error can be measured. Predict and compare the accuracy of the normal equations and of QR.`,
    visual: {
      type: 'graph',
      params: { x: [-0.5, 3.6], y: [-17, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'relative error', xticks: 0,
        shade: [{ fn: n12(lg(F10.ne)), lower: -17, from: 0.2, to: 1.2, color: 'bad', alpha: 0.5 }, { fn: n12(lg(F10.qr)), lower: -17, from: 2.0, to: 3.0, color: 'accent', alpha: 0.5 }],
        hlines: [{ y: n12(lg(U)), label: 'u', color: 'ink4' }],
        points: [{ x: 0.7, y: n12(lg(F10.ne)), r: 0, label: 'normal equations', labelAlign: 'center', labelDx: 0, labelDy: -12 }, { x: 2.5, y: n12(lg(F10.qr)), r: 0, label: 'QR', labelAlign: 'center', labelDx: 0, labelDy: -12 }] },
      caption: 'The measured coefficient errors at degree 10, on a log scale reaching down to unit roundoff.',
    },
    steps: [
      { label: 'Condition', text: t`The $50\times11$ matrix of monomials has $\kappa(A) = ${tex(F10.k, 2)}$: its columns $t^8, t^9, t^{10}$ are nearly parallel on $[0, 1]$. The problem itself can lose about $\log_{10}\kappa \approx ${lg(F10.k).toFixed(1)}$ digits.` },
      { label: 'Normal equations', text: t`$A^{\mathsf T}A$ has $\kappa = ${tex(F10.k ** 2, 2)}$, and it is formed in float64 before any solving starts: the rounding of its entries alone is a relative perturbation of size $u$, magnified by $\kappa^2$ to about $${tex(F10.k ** 2 * U, 1)}$. Measured: $${tex(F10.ne, 2)}$ — **two** digits left.` },
      { label: 'QR', text: t`Factor $A = QR$ by Householder, form $Q^{\mathsf T}b$, back-substitute $R\hat x = Q^{\mathsf T}b$. $\kappa(R) = \kappa(A)$, so expect about $\kappa u \approx ${tex(F10.k * U, 1)}$. Measured: $${tex(F10.qr, 2)}$ — **nine** digits.` },
      { label: 'Cost', text: t`For $m \gg n$, the normal equations cost about $mn^2$ flops, Householder QR about $2mn^2$: twice the work for seven more digits here.` },
      { label: 'Better still', text: t`Monomials on $[0, 1]$ are a poor basis. Legendre or Chebyshev polynomials ([F4.2](#/lesson/st-f.F4.2)) make the columns nearly orthogonal and $\kappa$ small, and then even the normal equations would do. Change the basis first; use QR always.` },
    ],
    answer: t`$\kappa(A) = ${tex(F10.k, 2)}$: the normal equations ($\kappa^2 = ${tex(F10.k ** 2, 2)}$) leave an error of $${tex(F10.ne, 2)}$, QR one of $${tex(F10.qr, 2)}$.`,
  },
  practice: [
    num({
      id: 'kappa-squared', difficulty: 1,
      gen(r) {
        const k = r.int(2, 7), m = r.pick([1, 2, 3, 5]), kap = m * 10 ** k, ans = kap * kap;
        return {
          prompt: t`A design matrix has $\kappa(A) = ${tex(kap, 2)}$. What is the condition number of the normal-equation matrix $A^{\mathsf T}A$?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3.2], y: [0, 16.5], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'log₁₀ κ', xticks: 0,
              shade: [{ fn: n12(lg(kap)), from: 0.3, to: 1.3, color: 'accent', alpha: 0.55 }],
              hlines: [{ y: 16, label: 'float64 holds about 16 digits', color: 'gold' }],
              points: [{ x: 0.8, y: n12(lg(kap)), r: 0, label: 'κ(A)', labelAlign: 'center', labelDx: 0, labelDy: -12 }, { x: 2.4, y: 1, r: 0, label: 'κ(AᵀA) = ?', labelAlign: 'center', labelDx: 0, labelDy: -12 }] },
            caption: 'Condition numbers on a log scale; each unit of height is a digit at risk.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: kap, feedback: 'AᵀA’s singular values are the squares of A’s, so its condition number is κ(A)².' }, { value: 2 * kap, feedback: 'Squared, not doubled: σ²max/σ²min.' }],
          hints: [t`If $A = U\Sigma V^{\mathsf T}$, then $A^{\mathsf T}A = V\Sigma^2V^{\mathsf T}$.`, t`$\kappa(A^{\mathsf T}A) = (\sigma_{\max}/\sigma_{\min})^2$.`],
          teach: 'Forming AᵀA squares every singular value, and so squares the condition number: the digits at risk double.',
          explain: t`$\kappa(A^{\mathsf T}A) = (${tex(kap, 2)})^2 = ${tex(ans, 2)}$: about $${(2 * lg(kap)).toFixed(1)}$ of 16 digits at risk${ans * U > 0.1 ? ' — nothing reliable is left' : ''}.`,
        };
      },
    }),
    num({
      id: 'digits-left', difficulty: 2,
      gen(r) {
        const lk = r.pick([3, 4, 5, 6, 7]), ans = 16 - 2 * lk;
        return {
          prompt: t`A least-squares fit with a small residual has $\kappa(A) = 10^{${lk}}$. Using the rule of thumb (float64 carries about 16 digits), about how many correct digits do the **normal equations** deliver?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3.2], y: [0, 17], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'correct digits', xticks: 0,
              shade: [{ fn: 16, from: 0.3, to: 1.3, color: 'ink4', alpha: 0.4 }, { fn: 16 - lk, from: 1.9, to: 2.9, color: 'accent', alpha: 0.55 }],
              points: [{ x: 0.8, y: 16, r: 0, label: 'stored data', labelAlign: 'center', labelDx: 0, labelDy: -12 }, { x: 2.4, y: 16 - lk, r: 0, label: 'QR', labelAlign: 'center', labelDx: 0, labelDy: -12 }] },
            caption: 'Digits in the data and after a QR solve, which loses log₁₀ κ of them; the normal equations are the question.',
          },
          answer: ans, tol: { rel: 0, abs: 0.6 },
          errors: [{ value: 16 - lk, feedback: 'That is what QR delivers. The normal equations work with κ², losing 2 log₁₀ κ digits.' }],
          hints: ['Digits lost ≈ log₁₀ of the condition number of the system actually solved.', t`For the normal equations that is $\kappa^2 = 10^{${2 * lk}}$.`],
          teach: 'Count digits: QR loses log₁₀ κ, the normal equations 2 log₁₀ κ.',
          explain: t`$16 - 2\times${lk} = ${ans}$ digits, against $${16 - lk}$ for QR.${ans <= 2 ? ' At this conditioning the normal equations are useless.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'why-qr', difficulty: 2,
      prompt: t`Why does solving $R\hat x = Q^{\mathsf T}b$ give the least-squares solution without squaring $\kappa$?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 4.2], y: [-0.4, 3.2], aspect: 'wide', equal: true, axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false, axes: false,
          shade: [{ fn: '0.35*x', lower: 0, from: 0, to: 4, color: 'accent', alpha: 0.15 }],
          arrows: [{ from: [0, 0], to: [3, 2.6], color: 'ink', width: 2, label: 'b', labelDx: 6, labelDy: -6 }, { from: [0, 0], to: [3.4, 1.19], color: 'accent', width: 2, label: 'Ax̂', labelDx: 6, labelDy: 12 }, { from: [3.4, 1.19], to: [3, 2.6], color: 'bad', width: 1.6, dash: true, label: 'residual', labelDx: 8, labelDy: 0 }] },
        caption: 'Schematic: b, its projection Ax̂ onto the column space (shaded plane, seen edge-on) and the residual at a right angle to it.',
      },
      choices: [
        t`$Q$ is orthogonal, so $\lVert Ax - b\rVert^2 = \lVert Rx - Q^{\mathsf T}b\rVert^2 + \text{(a part independent of }x)$; the minimizer solves a triangular system with $\kappa(R) = \kappa(A)$, and $A^{\mathsf T}A$ is never formed`,
        t`QR computes $(A^{\mathsf T}A)^{-1}$ more accurately than Gaussian elimination`,
        t`$Q^{\mathsf T}b$ removes the noise from $b$`,
        'R is diagonal, so the solve is exact',
      ],
      answer: 0,
      why: {
        1: 'QR never forms AᵀA or its inverse; that is the point.',
        2: 'Qᵀb is just b in another orthonormal basis; noise is rotated, not removed. The part outside the column space becomes the residual.',
        3: 'R is upper-triangular, not diagonal; back-substitution is backward stable, not exact.',
      },
      hints: ['Multiplying the residual by Qᵀ (extended to a full orthogonal matrix) does not change its length.', 'Split Qᵀb into the first n entries and the rest.'],
      teach: 'Orthogonal transformations leave the residual’s length unchanged, so least squares reduces to a triangular solve with κ(R) = κ(A).',
      explain: t`With the full $Q$, $\lVert Ax - b\rVert^2 = \lVert Q^{\mathsf T}Ax - Q^{\mathsf T}b\rVert^2 = \lVert Rx - c_1\rVert^2 + \lVert c_2\rVert^2$, where $c_1$ and $c_2$ are the first $n$ and remaining entries of $Q^{\mathsf T}b$. The first term vanishes at $R\hat x = c_1$, and $\lVert c_2\rVert$ is the minimum residual. Since $R^{\mathsf T}R = A^{\mathsf T}A$, the normal equations are hiding inside — but QR never multiplies them out.`,
    }),
    num({
      id: 'min-residual', difficulty: 2,
      gen(r) {
        const c1 = [r.int(2, 9), r.int(-5, 5)], c2 = [r.pick([0.3, -0.4, 0.6]), r.pick([0.2, -0.5, 0.1]), r.pick([-0.3, 0.4, 0.2])];
        const ans = Math.hypot(...c2);
        return {
          prompt: t`A straight-line fit to 5 points is computed by QR. The rotated measurements are $Q^{\mathsf T}b = (${[...c1, ...c2].join(',\\ ')})$, where $Q$ is the full $5\times5$ orthogonal factor. What is the minimum residual norm $\lVert A\hat x - b\rVert$?`,
          visual: {
            type: 'graph',
            params: { x: [0.3, 5.7], y: [Math.min(-1, ...c1) - 0.5, Math.max(...c1) + 1], aspect: 'wide', axesAt: 'edge', xlabel: 'entry of Qᵀb', ylabel: 'value', xticks: 5,
              curves: [...c1, ...c2].map((v, i) => ({ param: [String(i + 1), `${v}*t`], t: [0, 1], color: i < 2 ? 'accent' : 'bad', width: 6 })),
              hlines: [{ y: 0, color: 'ink4' }] },
            caption: 'The entries of Qᵀb: the first two (blue) are matched by Rx̂; the rest (red) are out of reach of any straight line.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(...c1, ...c2), feedback: 'That is ‖b‖. Only the entries beyond the first n = 2 make up the residual.' }, { value: c2.reduce((s, v) => s + v * v, 0), feedback: 'That is the squared residual; take the square root.' }],
          hints: [t`$\lVert A\hat x - b\rVert^2 = \lVert R\hat x - c_1\rVert^2 + \lVert c_2\rVert^2$, and the first term is zero at the solution.`, t`$c_2 = (${c2.join(',\\ ')})$.`],
          teach: 'In the QR picture the residual is simply the part of Qᵀb beyond the first n entries.',
          explain: t`$\sqrt{${c2.map((v) => `(${v})^2`).join(' + ')}} = ${ans.toFixed(4)}$. No straight line can reduce it: those components are orthogonal to both columns of $A$.`,
        };
      },
    }),
    mcq({
      id: 'raw-seconds', difficulty: 3,
      prompt: t`A tracking engineer fits a cubic to 31 altitude readings of an ascending rocket taken every 10 s, using the columns $1, t, t^2, t^3$ with $t$ in **seconds** (0 to 300). The design matrix has $\kappa = ${tex(K_RAW, 2)}$. Rewriting the model in $s = t/150 - 1$ (so $s \in [-1, 1]$) gives $\kappa = ${K_SCALED.toFixed(1)}$. What does that tell you?`,
      visual: {
        type: 'graph',
        params: { x: [-10, 310], y: [-0.05, 1.08], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'column / its maximum',
          curves: [{ fn: '1 + 0*x', color: 'ink3', width: 1.6, label: '1', labelAt: 20, labelDx: 0, labelDy: -10 }, { fn: 'x/300', color: 'accent', width: 1.8, label: 't', labelAt: 250, labelDx: 6, labelDy: 6 }, { fn: '(x/300)^2', color: 'violet', width: 1.8, label: 't²', labelAt: 250, labelDx: 8, labelDy: 6 }, { fn: '(x/300)^3', color: 'gold', width: 1.8, label: 't³', labelAt: 250, labelDx: 8, labelDy: 8 }] },
        caption: 'The four columns, each scaled to a maximum of 1: on a one-sided interval the powers look alike, and in seconds their sizes differ by a factor of 2.7 × 10⁷ as well.',
      },
      choices: [
        'The trouble was the choice of variables, not the physics: centring and scaling the time removes almost all of it, and then even the normal equations work',
        'Cubic fits are always ill-conditioned; use a straight line',
        'The altitude data must be inaccurate',
        'The condition number depends on the units, so it does not mean anything',
      ],
      answer: 0,
      why: {
        1: `A cubic in a well-scaled variable has κ ≈ ${K_SCALED.toFixed(0)}: nothing ill-conditioned about cubics as such.`,
        2: 'κ depends only on A, the times and the model; the measured altitudes never enter it.',
        3: 'It does depend on scaling — that is exactly why choosing good variables matters. With the same data, κ tells you how many digits your chosen formulation can keep.',
      },
      hints: ['Compare the sizes of the columns: 1 and t³ = 2.7 × 10⁷ at the end.', 'On [0, 300] the powers of t are also nearly parallel; on [−1, 1] they are much less so.'],
      teach: 'Centre and scale your variables before fitting: much ill-conditioning in practice is self-inflicted by units and offsets.',
      explain: t`Monomials in raw seconds mix columns of wildly different sizes, all positive and alike in shape. With $s = t/150 - 1$ the columns are of size 1 and partly cancel in sign, and $\kappa$ drops from $${tex(K_RAW, 2)}$ to $${K_SCALED.toFixed(1)}$. Orthogonal polynomials in $s$ would bring it close to 1. The fitted curve is identical; only the parameters (and their error) differ.`,
    }),
    code({
      id: 'ne-vs-qr', difficulty: 3,
      prompt: t`Reproduce the worked example in NumPy. Build \`A = np.vander(t, 11, increasing=True)\` for 50 points \`t\` on $[0, 1]$, \`b = A @ np.ones(11)\`, and compute the coefficients two ways: \`x_ne\` by the normal equations (\`np.linalg.solve(A.T @ A, A.T @ b)\`) and \`x_qr\` by QR (\`Q, R = np.linalg.qr(A)\`, then solve $Rx = Q^{\mathsf T}b$). Store the errors \`err_ne\` and \`err_qr\` as \`np.linalg.norm(x - 1) / np.sqrt(11)\`.`,
      starter: t`import numpy as np

t = np.linspace(0, 1, 50)
A = np.vander(t, 11, increasing=True)
b = A @ np.ones(11)

x_ne = np.zeros(11)
x_qr = np.zeros(11)

err_ne = np.linalg.norm(x_ne - 1) / np.sqrt(11)
err_qr = np.linalg.norm(x_qr - 1) / np.sqrt(11)
print(np.linalg.cond(A), err_ne, err_qr)
`,
      answer: t`import numpy as np

t = np.linspace(0, 1, 50)
A = np.vander(t, 11, increasing=True)
b = A @ np.ones(11)

x_ne = np.linalg.solve(A.T @ A, A.T @ b)
Q, R = np.linalg.qr(A)
x_qr = np.linalg.solve(R, Q.T @ b)

err_ne = np.linalg.norm(x_ne - 1) / np.sqrt(11)
err_qr = np.linalg.norm(x_qr - 1) / np.sqrt(11)
print(np.linalg.cond(A), err_ne, err_qr)`,
      tests: [
        { name: t`QR recovers the coefficients to better than $10^{-7}$`, code: 'err_qr < 1e-7' },
        { name: t`the normal equations lose far more: an error above $10^{-6}$`, code: 'err_ne > 1e-6' },
        { name: 'QR is at least 1000 times more accurate', code: 'err_qr * 1000 < err_ne' },
      ],
      hints: [t`\`x_ne = np.linalg.solve(A.T @ A, A.T @ b)\`.`, t`\`Q, R = np.linalg.qr(A)\` gives the thin factors; then \`x_qr = np.linalg.solve(R, Q.T @ b)\` (or \`scipy.linalg.solve_triangular\`).`],
      teach: 'Same data, same model, two algorithms: the measured errors differ by about a factor κ(A).',
      explain: t`\`np.linalg.cond(A)\` prints about $${tex(F10.k, 1)}$. The errors land near $${tex(F10.ne, 1)}$ and $${tex(F10.qr, 1)}$ (the exact values depend on the BLAS); their ratio is of the order of $\kappa$. In practice call \`np.linalg.lstsq(A, b)\`, which uses an SVD-based LAPACK routine and is safe even for rank-deficient $A$ ([next lesson](#/lesson/st-f.F8.2)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-orbit-fit', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([7000, 8000, 12000, 26600]), e = r.pick([0.05, 0.1, 0.2, 0.3]), w = r.pick([30, 60, 120, 200]);
        const a0 = 1 / p, a1 = (e / p) * Math.cos((w * Math.PI) / 180), a2 = (e / p) * Math.sin((w * Math.PI) / 180);
        const fmt = (x) => tex(+x.toPrecision(4), 4);
        const A0 = +a0.toPrecision(4), A1 = +a1.toPrecision(4), A2 = +a2.toPrecision(4), ans = Math.hypot(A1, A2) / A0;
        return {
          prompt: t`Orbit determination: a satellite’s range $r$ is measured at many true anomalies $\theta$ around its orbit, and a conic $r = p/(1 + e\cos(\theta - \omega))$ is fitted in the linear form $\dfrac1r = a_0 + a_1\cos\theta + a_2\sin\theta$ by least squares. The fit gives $a_0 = ${fmt(A0)}$, $a_1 = ${fmt(A1)}$, $a_2 = ${fmt(A2)}$ (all in $\text{km}^{-1}$). What is the eccentricity $e$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.5 * p, 1.5 * p], y: [-1.15 * p, 1.15 * p], aspect: 'wide', equal: true, axesAt: 'center', xlabel: 'x (km)', ylabel: 'y (km)', xticks: 4, yticks: 4,
              curves: [{ param: [`${p}*cos(t)/(1 + ${e}*cos(t - ${n12((w * Math.PI) / 180)}))`, `${p}*sin(t)/(1 + ${e}*cos(t - ${n12((w * Math.PI) / 180)}))`], t: [0, 2 * Math.PI], color: 'accent', width: 2 }],
              points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'Earth’s centre', labelDx: 8, labelDy: 14 }] },
            caption: 'The fitted orbit (an ellipse with the Earth’s centre at a focus); the tracking points are spread all around it, which keeps the fit well conditioned.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.hypot(A1, A2), feedback: t`That is $e/p$; divide by $a_0 = 1/p$.` }, { value: (A1 + A2) / A0, feedback: t`The amplitude of $a_1\cos\theta + a_2\sin\theta$ is $\sqrt{a_1^2 + a_2^2}$, not $a_1 + a_2$.` }].filter((x) => Math.abs(x.value - ans) > 0.01 * ans),
          hints: [t`Expand: $\dfrac1r = \dfrac1p + \dfrac ep\cos\omega\cos\theta + \dfrac ep\sin\omega\sin\theta$.`, t`So $a_0 = 1/p$ and $\sqrt{a_1^2 + a_2^2} = e/p$: $e = \sqrt{a_1^2 + a_2^2}/a_0$.`],
          teach: 'A clever change of variable (1/r instead of r) turns a nonlinear orbit fit into a linear least-squares problem.',
          explain: t`$e = \sqrt{a_1^2 + a_2^2}/a_0 = ${ans.toFixed(4)}$, with $p = 1/a_0 = ${(1 / A0).toFixed(0)}$ km and $\omega = \operatorname{atan2}(a_2, a_1) = ${((Math.atan2(A2, A1) * 180) / Math.PI).toFixed(1)}^\circ$. With the points spread around a whole orbit the columns $1, \cos\theta, \sin\theta$ are nearly orthogonal ($\kappa \approx ${ARCS[0][1].toFixed(2)}$ for 20 evenly spread points), so even the normal equations are fine here.`,
        };
      },
    }),
    mcq({
      id: 'cp-short-arc', difficulty: 3, transfer: true,
      prompt: t`The same orbit fit, but the station sees the satellite only over a short arc. For 20 evenly spaced measurements the design matrix’s condition number is ${ARCS.map(([a, k]) => t`$${k < 100 ? k.toFixed(1) : tex(k, 2)}$ for a $${a}^\circ$ arc`).join(', ')}. What should the analyst conclude?`,
      visual: {
        type: 'graph',
        params: { x: [0, 380], y: [0, 4.2], aspect: 'wide', axesAt: 'edge', xlabel: 'tracking arc (degrees)', ylabel: 'log₁₀ κ',
          points: ARCS.map(([a, k]) => ({ x: a, y: n12(lg(k)), r: 5, color: 'accent', label: `${a}°`, labelDx: 8, labelDy: -8 })) },
        caption: 'Condition number of the 1/r fit against the arc covered by the measurements, computed for 20 evenly spaced points.',
      },
      choices: [
        'A short arc makes the problem itself ill-conditioned: no algorithm recovers digits the data do not determine, but QR at least avoids squaring κ, and more arc (or a second station) is the real cure',
        'Switching from the normal equations to QR makes the short-arc fit as accurate as the full-orbit one',
        'The condition number grows only because of rounding; with exact data it would be 1.4',
        'Short arcs are better conditioned, because nearby points agree with each other',
      ],
      answer: 0,
      why: {
        1: 'QR keeps the problem’s conditioning from getting worse; it cannot make it better. The 5° arc still loses about four digits to κ.',
        2: 'κ is computed from A alone, exactly; it measures how nearly dependent 1, cos θ and sin θ are over the arc.',
        3: 'Over a short arc 1, cos θ and sin θ look almost alike (and almost linear), so their coefficients trade off against each other: that is ill-conditioning.',
      },
      hints: ['Over a 5° arc, what do cos θ and sin θ look like?', 'Separate the problem’s sensitivity (κ) from the algorithm’s (QR or normal equations).'],
      teach: 'Conditioning is the data’s geometry: short tracking arcs make orbit determination intrinsically ill-conditioned, and the remedy is more geometry, not a better solver.',
      explain: t`Over a few degrees the three columns are nearly linearly dependent, so small measurement errors move $(a_0, a_1, a_2)$ a lot: $\kappa$ grows from $${ARCS[0][1].toFixed(2)}$ to $${tex(ARCS[3][1], 2)}$. With the normal equations those relative errors would be multiplied by $\kappa^2 \approx ${tex(ARCS[3][1] ** 2, 1)}$ in rounding alone. Real orbit determination (initial orbit determination from short arcs, then batch least squares over many passes) is fighting exactly this.`,
    }),
  ],
  sources: [
    { label: 'Trefethen & Bau (1997), Numerical Linear Algebra, SIAM, Lectures 11, 18 and 19 (least squares, its conditioning and stability)', url: 'https://doi.org/10.1137/1.9780898719574' },
    { label: 'Björck (1996), Numerical Methods for Least Squares Problems, SIAM', url: 'https://doi.org/10.1137/1.9781611971484' },
    { label: 'Vallado (2013), Fundamentals of Astrodynamics and Applications, 4th ed., ch. 10 (orbit determination by least squares)', url: 'https://openlibrary.org/isbn/9781881883180' },
  ],
});
