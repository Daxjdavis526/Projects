// Power iteration — multiply by A and normalize: the dominant eigenvector
// wins at the rate |λ₂/λ₁| per step, the Rayleigh quotient twice as fast for
// a symmetric matrix; what breaks it (equal moduli, a complex pair, an
// unlucky start); shifts that change the ratio; inverse iteration, which turns
// the slowest mode into the fastest — a structural mode by repeated solves.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { dot, mv, nrm, angle, power } from './_lin.js';
import { eigSym, solve } from '../prog/_solvers.js';

const t = String.raw;

// ── the worked example: a three-mass stack fixed at its base ──
const K = [[2, -1, 0], [-1, 2, -1], [0, -1, 1]];
const { w: KW, V: KV } = eigSym(K);
const INV = (() => { let x = [1, 1, 1]; const xs = [x]; for (let k = 0; k < 6; k++) { const y = solve(K, x), s = nrm(y); x = y.map((v) => v / s); xs.push(x); } return xs; })();
const INV_ANG = INV.map((x) => angle(x, KV[0]));
const INV_RQ = INV.map((x) => dot(x, mv(K, x)));
const KM = 2000;                                           // k/m in s⁻²
const F1 = Math.sqrt(KW[0] * KM) / (2 * Math.PI);
const FWD = power(K, [1, 1, 1], 10).rq.map((v) => KW[2] - v);

const f6 = (v) => v.map((x) => x.toFixed(4)).join(',\\ ');

export default lesson({
  id: 'st-f.F7.1',
  title: 'Power iteration',
  minutes: 13, difficulty: 3,
  intro: t`Write a starting vector in the eigenvectors of $A$, $x_0 = c_1v_1 + c_2v_2 + \cdots$. Multiplying by $A$ $k$ times multiplies each piece by $\lambda_i^k$, so the piece with the largest $\lvert\lambda\rvert$ takes over: $A^kx_0 = \lambda_1^k\left[c_1v_1 + c_2(\lambda_2/\lambda_1)^kv_2 + \cdots\right]$. **Power iteration** does exactly that, normalizing each time so nothing overflows, and estimates the eigenvalue by the **Rayleigh quotient** $\mu_k = x_k^{\mathsf T}Ax_k$ (for a unit vector $x_k$):

$$x_{k+1} = \frac{Ax_k}{\lVert Ax_k\rVert}, \qquad \angle(x_k, v_1) = O\!\left(\left\lvert\frac{\lambda_2}{\lambda_1}\right\rvert^k\right), \qquad \lvert\mu_k - \lambda_1\rvert = O\!\left(\left\lvert\frac{\lambda_2}{\lambda_1}\right\rvert^{2k}\right)$$

The last, doubled rate holds for symmetric $A$. One number decides everything: the ratio $\lvert\lambda_2/\lambda_1\rvert$. Shifting $A$, or inverting it, changes that ratio — and that is the whole art of eigenvalue algorithms.`,
  symbols: [
    { tex: 'x_k', text: 'the $k$-th iterate, a unit vector: the current guess at the dominant eigenvector' },
    { tex: t`\lambda_1,\ \lambda_2`, text: 'the eigenvalues of largest and second-largest absolute value, $\\lvert\\lambda_1\\rvert > \\lvert\\lambda_2\\rvert \\ge \\cdots$' },
    { tex: 'v_1', text: 'the eigenvector of $\\lambda_1$, which the iterates approach (up to sign)' },
    { tex: t`\mu_k`, text: 'the **Rayleigh quotient** $x_k^{\\mathsf T}Ax_k/x_k^{\\mathsf T}x_k$: the eigenvalue that best fits $x_k$ in the least-squares sense' },
    { tex: t`\lvert\lambda_2/\lambda_1\rvert`, text: 'the **convergence ratio**: the factor by which the eigenvector error shrinks per step. Near 1, power iteration crawls' },
  ],
  why: 'Power iteration and its relatives find the dominant mode of anything that can multiply by a matrix — a structure’s lowest vibration (by inverse iteration), a stability eigenvalue, PageRank — and their convergence ratio is the idea that the QR algorithm (next lesson) and Krylov methods build on.',
  visual: {
    type: 'graph',
    title: 'One ratio decides the speed',
    lead: t`Slide the ratio $r = \lambda_2/\lambda_1$ of a symmetric $2\times2$ matrix ($\lambda_1 = 1$), started at $45^\circ$ to its eigenvectors. Blue: the eigenvector’s error angle (its tangent) at step $k$, on a logarithmic axis. Gold: the Rayleigh quotient’s error.`,
    tasks: [
      'At r = 0.5 the blue points drop one digit every 3.3 steps; at r = 0.9 one digit takes 22 steps.',
      'The gold points fall twice as steeply: for a symmetric matrix the eigenvalue converges at r² per step.',
      'Make r negative: the speed depends only on |r| (the iterates flip sign each step). At r = ±1 nothing converges.',
    ],
    params: {
      x: [-0.8, 30.8], y: [-16.5, 0.8], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'iteration k', ylabel: 'error',
      sliders: [{ key: 'r', label: t`Ratio $r = \lambda_2/\lambda_1$`, min: -0.95, max: 0.95, step: 0.05, value: 0.5, explain: 'The second eigenvalue relative to the first; λ₁ = 1 here.' }],
      points: [
        ...Array.from({ length: 31 }, (_, k) => ({ x: k, y: `max(-16.4, ${k}*log10(abs(r) + 1e-300))`, r: 3.5, color: 'accent' })),
        ...Array.from({ length: 31 }, (_, k) => ({ x: k, y: `max(-16.4, log10((1 - r)*abs(r)^${2 * k}/(1 + abs(r)^${2 * k}) + 1e-300))`, r: 3, color: 'gold' })),
      ],
      legend: [{ label: 'eigenvector: tan of error angle', color: 'accent', point: true }, { label: 'eigenvalue: λ₁ − μₖ', color: 'gold', point: true }], legendAt: 'tr',
      readouts: [{ label: 'steps per correct digit (vector)', expr: '1/max(1e-9, -log10(abs(r)))', digits: 3 }, { label: 'per digit (eigenvalue)', expr: '0.5/max(1e-9, -log10(abs(r)))', digits: 3 }],
    },
    caption: 'Exact values from the closed form for this 2×2 (no round-off); values below 10⁻¹⁶ are drawn at the floor, where float64 would stop them anyway.',
  },
  example: {
    prompt: t`A launch-vehicle stack on its pad is modelled as three equal masses $m$ joined by springs $k$, the bottom one tied to the ground: $K = k${t`\begin{pmatrix}2 & -1 & 0\\ -1 & 2 & -1\\ 0 & -1 & 1\end{pmatrix}`}$, and modes satisfy $Kv = \omega^2mv$. Power iteration on $K$ would find the **highest** mode. Find the **fundamental** one by inverse iteration — power iteration on $K^{-1}$ — from $x_0 = (1, 1, 1)$, and predict its rate. Take $k/m = ${KM}\ \text{s}^{-2}$.`,
    visual: {
      type: 'graph',
      params: { x: [-0.3, 6.3], y: [-12.5, 0.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'iteration', ylabel: 'error',
        points: [...INV_ANG.map((a, k) => ({ x: k, y: n12(lg(Math.tan(a))), r: 4.5, color: 'accent' })), ...INV_RQ.map((m, k) => ({ x: k, y: n12(lg(m - KW[0])), r: 4, color: 'gold' }))],
        curves: [{ fn: `${n12(lg(Math.tan(INV_ANG[1])))} + (x - 1)*${n12(lg(KW[0] / KW[1]))}`, color: 'ink3', dash: true, width: 1.3, domain: [0.5, 6.2], label: 'slope log(λ₁/λ₂)', labelAt: 4.5, labelDx: 8, labelDy: -10 }],
        legend: [{ label: 'eigenvector angle error', color: 'accent', point: true }, { label: 'Rayleigh quotient error', color: 'gold', point: true }], legendAt: 'tr' },
      caption: 'Inverse iteration on the stack’s stiffness matrix, computed in float64 (log axis). The dashed line has the predicted slope, a factor λ₁/λ₂ per step.',
    },
    steps: [
      { label: 'Why invert', text: t`$K^{-1}$ has eigenvalues $1/\lambda_i$, so the **smallest** $\lambda$ of $K$ becomes the dominant one. Each step solves $Ky = x_k$ — with the LU (or Cholesky) factors computed once, as in [F6.1](#/lesson/st-f.F6.1) — then sets $x_{k+1} = y/\lVert y\rVert$.` },
      { label: 'Iterate', text: t`From $(1, 1, 1)$ the iterates are $(${f6(INV[1])})$, then $(${f6(INV[2])})$, $(${f6(INV[3])})$, … and the Rayleigh quotients $x^{\mathsf T}Kx$ (in units of $k$) are $${INV_RQ.slice(1, 4).map((v) => v.toFixed(6)).join(',\\ ')}$.` },
      { label: 'Predict the rate', text: t`The eigenvalues of $K/k$ are $${KW.map((v) => v.toFixed(4)).join(',\\ ')}$. For $K^{-1}$ the ratio is $\lambda_1/\lambda_2 = ${(KW[0] / KW[1]).toFixed(4)}$: almost a digit per step for the mode shape, and $(\lambda_1/\lambda_2)^2 = ${((KW[0] / KW[1]) ** 2).toFixed(4)}$ — nearly two digits — for the eigenvalue, because $K$ is symmetric.` },
      { label: 'Measure', text: t`The angle errors $${INV_ANG.slice(1, 5).map((a) => tex(a, 2)).join(',\\ ')}$ shrink by $${(INV_ANG[4] / INV_ANG[3]).toFixed(4)}$ per step; the Rayleigh errors by $${((INV_RQ[5] - KW[0]) / (INV_RQ[4] - KW[0])).toFixed(4)}$. Prediction confirmed.` },
      { label: 'The mode', text: t`$\lambda_1 = ${KW[0].toFixed(5)}$, so $\omega_1 = \sqrt{\lambda_1 k/m} = ${Math.sqrt(KW[0] * KM).toFixed(2)}$ rad/s, $f_1 = ${F1.toFixed(2)}$ Hz, with the shape $(${f6(KV[0])})$: all three masses in phase, the top moving most.` },
      { label: 'Contrast', text: t`Plain power iteration on $K$ converges to the *highest* mode at the ratio $${(KW[1] / KW[2]).toFixed(3)}$ — slower, and the wrong mode for a launch-loads analysis.` },
    ],
    answer: t`Inverse iteration converges at $\lambda_1/\lambda_2 = ${(KW[0] / KW[1]).toFixed(3)}$ per step (eigenvalue at its square): $\lambda_1 = ${KW[0].toFixed(5)}\,k$, $f_1 = ${F1.toFixed(2)}$ Hz.`,
  },
  practice: [
    num({
      id: 'iterations', difficulty: 2,
      gen(r) {
        const ratio = r.pick([0.3, 0.5, 0.8, 0.9, 0.95]), d = r.pick([6, 8, 10]);
        const ans = Math.ceil(d / -lg(ratio));
        return {
          prompt: t`Power iteration on a matrix with $\lvert\lambda_2/\lambda_1\rvert = ${ratio}$ starts with an eigenvector error of order 1. About how many iterations reduce it to $10^{-${d}}$?`,
          visual: {
            type: 'graph',
            params: { x: [0, ans * 1.2], y: [-d - 1, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'iteration', ylabel: 'error',
              curves: [{ fn: `x*${n12(lg(ratio))}`, color: 'accent', width: 2, domain: [0, ans * 1.2] }],
              hlines: [{ y: -d, label: `10⁻${String(d).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')}`, color: 'gold' }] },
            caption: 'Error ∝ ratioᵏ on a log axis: a straight line. Where it meets the target is the answer.',
          },
          answer: ans, tol: { rel: 0, abs: 1 },
          errors: [{ value: Math.ceil(d / -lg(ratio) / 2), feedback: 'That is the count for the Rayleigh quotient of a symmetric matrix (rate ratio²). The eigenvector converges at the ratio itself.' }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`Solve $${ratio}^k = 10^{-${d}}$.`, t`$k = ${d}/(-\log_{10}${ratio})$.`],
          teach: 'Power iteration gains −log₁₀|λ₂/λ₁| digits per step: a ratio near 1 costs enormously.',
          explain: t`$k = ${d}/${(-lg(ratio)).toFixed(4)} \approx ${(d / -lg(ratio)).toFixed(1)}$, so about $${ans}$ iterations. A ratio of 0.99 would need $${Math.ceil(d / -lg(0.99))}$.`,
        };
      },
    }),
    num({
      id: 'read-lambda2', difficulty: 3,
      gen(r) {
        const l1 = r.pick([4, 5, 8, 10]), q = r.pick([0.36, 0.25, 0.49, 0.64]), ans = l1 * Math.sqrt(q);
        const diffs = [0, 1, 2, 3].map((k) => 0.8 * q ** k);
        return {
          prompt: t`Power iteration on a symmetric matrix gives Rayleigh quotients converging to $\lambda_1 = ${l1}$. Their errors $\lambda_1 - \mu_k$ shrink by a steady factor of $${q}$ per step. What is $\lvert\lambda_2\rvert$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.4, 3.4], y: [-2, 0.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'iteration', ylabel: 'λ₁ − μₖ', xticks: 4,
              points: diffs.map((dd, k) => ({ x: k, y: n12(lg(dd)), r: 5, color: 'gold' })) },
            caption: 'The Rayleigh quotient’s errors on a log axis: a constant drop per step.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: l1 * q, feedback: t`For a symmetric matrix the eigenvalue error shrinks by $(\lambda_2/\lambda_1)^2$ per step. Take the square root of the factor.` }],
          hints: [t`$\lambda_1 - \mu_k \propto (\lambda_2/\lambda_1)^{2k}$.`, t`$\lvert\lambda_2/\lambda_1\rvert = \sqrt{${q}}$.`],
          teach: 'For symmetric matrices the Rayleigh quotient converges at the square of the eigenvector’s rate — and the measured rate reveals λ₂.',
          explain: t`$\lvert\lambda_2/\lambda_1\rvert = \sqrt{${q}} = ${Math.sqrt(q)}$, so $\lvert\lambda_2\rvert = ${ans}$. Measuring convergence rates is a cheap way to learn about the rest of the spectrum.`,
        };
      },
    }),
    mcq({
      id: 'equal-modulus', difficulty: 2,
      prompt: t`Power iteration on $A = \begin{pmatrix}0 & 2\\ 2 & 0\end{pmatrix}$ from $x_0 = (1, 0)$ gives $(0, 1), (1, 0), (0, 1), \ldots$ forever. Why?`,
      visual: {
        type: 'la-map2d',
        params: { A: [[0, 2], [2, 0]], shape: 'square', eigen: true, readout: false, view: 3 },
        caption: 'The map swaps and doubles the axes. Its invariant lines (dashed) are the diagonals, stretched by +2 and −2.',
      },
      choices: [
        t`The eigenvalues are $+2$ and $-2$: equal in size, so $\lvert\lambda_2/\lambda_1\rvert = 1$ and neither component ever wins`,
        'The start (1, 0) is orthogonal to the dominant eigenvector',
        'The matrix is singular',
        'Power iteration only works for matrices with positive entries',
      ],
      answer: 0,
      why: {
        1: '(1, 0) has equal components along both eigenvectors (1, 1) and (1, −1); the trouble is that they grow equally fast.',
        2: 'Its determinant is −4.',
        3: 'It works for any matrix with a strictly dominant eigenvalue; positivity is not required.',
      },
      hints: ['Find the eigenvalues: det(A − λI) = λ² − 4.', 'What is |λ₂/λ₁|?'],
      teach: 'Power iteration needs a strictly dominant eigenvalue: when two share the largest modulus (±λ, or a complex pair), the iterates never settle.',
      explain: t`$\lambda = \pm2$ with eigenvectors $(1, 1)$ and $(1, -1)$. $x_0 = \tfrac12(1, 1) + \tfrac12(1, -1)$, and after $k$ steps the second part has the factor $(-1)^k$: the sum flips between $(1, 0)$ and $(0, 1)$. A shift cures it: $A + I$ has eigenvalues 3 and $-1$, ratio $\tfrac13$.`,
    }),
    num({
      id: 'best-shift', difficulty: 3,
      gen(r) {
        const ls = r.pick([[10, 9, 2], [10, 8, 1], [6, 5, 1], [12, 10, 4]]);
        const [l1, l2, l3] = ls, sigma = (l2 + l3) / 2, ans = (l2 - sigma) / (l1 - sigma);
        return {
          prompt: t`A symmetric matrix has eigenvalues $${ls.join(',\\ ')}$. Plain power iteration converges at the ratio $${l2}/${l1}$. Run it instead on $A - \sigma I$ with $\sigma = ${sigma}$, which has the same eigenvectors. What is the new convergence ratio?`,
          visual: {
            type: 'graph',
            params: { x: [-1, l1 + 1], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'eigenvalue', ylabel: '', yticks: 0,
              points: ls.map((l, i) => ({ x: l, y: 0, r: 6, color: i === 0 ? 'accent' : 'ink3', label: `λ${'₁₂₃'[i]} = ${l}`, labelDx: -14, labelDy: -14 })),
              vlines: [{ x: sigma, label: 'σ', color: 'gold' }] },
            caption: 'The spectrum on a line and the shift σ. Shifting moves the origin; the ratio is |distance of the second-farthest eigenvalue from σ| over |distance of the farthest|.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: l2 / l1, feedback: 'That is the unshifted ratio. Subtract σ from every eigenvalue first.' }],
          hints: [t`$A - \sigma I$ has eigenvalues $\lambda_i - \sigma$: $${ls.map((l) => l - sigma).join(',\\ ')}$.`, t`The ratio is $\max(\lvert\lambda_2 - \sigma\rvert, \lvert\lambda_3 - \sigma\rvert)/\lvert\lambda_1 - \sigma\rvert$.`],
          teach: 'A shift slides the spectrum: the best shift for power iteration sits midway between the eigenvalues you do not want, so they are as small as possible relative to the one you do.',
          explain: t`The shifted eigenvalues are $${ls.map((l) => l - sigma).join(',\\ ')}$, so the ratio is $${l2 - sigma}/${l1 - sigma} = ${ans.toFixed(4)}$ instead of $${(l2 / l1).toFixed(4)}$: $${(lg(ans) / lg(l2 / l1)).toFixed(1)}$ times as many digits per step.`,
        };
      },
    }),
    num({
      id: 'shift-invert', difficulty: 3,
      gen(r) {
        const ls = r.pick([[1, 4, 9], [2, 3, 7], [1.5, 6, 10]]), sigma = r.pick([0.2, 0.1, -0.3]) + ls[1];
        const dists = ls.map((l) => Math.abs(l - sigma)).sort((a, b) => a - b), ans = dists[0] / dists[1];
        return {
          prompt: t`Inverse iteration with shift — power iteration on $(A - \sigma I)^{-1}$ — targets the eigenvalue nearest $\sigma$. For eigenvalues $${ls.join(',\\ ')}$ and $\sigma = ${sigma}$, what is the convergence ratio per step?`,
          visual: {
            type: 'graph',
            params: { x: [ls[0] - 1, ls[2] + 1], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'eigenvalue', ylabel: '', yticks: 0,
              points: ls.map((l, i) => ({ x: l, y: 0, r: 6, color: 'ink3', label: `λ = ${l}`, labelDx: -14, labelDy: -14 })),
              vlines: [{ x: sigma, label: 'σ', color: 'gold' }] },
            caption: 'The spectrum and the shift σ: (A − σI)⁻¹ has eigenvalues 1/(λ − σ), largest for the λ nearest σ.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: dists[1] / dists[0], feedback: 'Upside down: the ratio is (distance of the nearest eigenvalue)/(distance of the next nearest), less than 1.' }],
          hints: [t`$(A - \sigma I)^{-1}$ has eigenvalues $1/(\lambda_i - \sigma)$.`, 'The ratio is the distance from σ to the nearest eigenvalue divided by the distance to the next nearest.'],
          teach: 'Inverse iteration with a shift close to an eigenvalue converges at a tiny ratio: a good shift is worth more than many iterations.',
          explain: t`The distances are $${dists.map((d) => +d.toFixed(3)).join(',\\ ')}$, so the ratio is $${+dists[0].toFixed(3)}/${+dists[1].toFixed(3)} = ${ans.toFixed(4)}$ — about $${(-lg(ans)).toFixed(1)}$ digits per step. Updating $\sigma$ to the latest Rayleigh quotient each step gives **Rayleigh quotient iteration**, cubically convergent for symmetric matrices — the idea inside the shifted QR algorithm ([next lesson](#/lesson/st-f.F7.2)).`,
        };
      },
    }),
    code({
      id: 'power-ratio', difficulty: 2,
      prompt: t`Write \`power_iteration(A, x0, n)\` returning the list of Rayleigh quotients $\mu_0, \ldots, \mu_n$ (normalize $x$ at every step). Run it for 25 steps on $A = \begin{pmatrix}4 & 1 & 0\\ 1 & 3 & 1\\ 0 & 1 & 2\end{pmatrix}$ from $(1, 1, 1)$, store the errors $\lvert\mu_k - \lambda_1\rvert$ (take $\lambda_1$ from \`np.linalg.eigvalsh\`) in \`errs\`, and the ratio of the errors at steps 9 and 8 in \`ratio\`. Compare it with $(\lambda_2/\lambda_1)^2$.`,
      starter: t`import numpy as np

A = np.array([[4.0, 1, 0], [1, 3, 1], [0, 1, 2]])
lam = np.linalg.eigvalsh(A)          # ascending

def power_iteration(A, x0, n):
    x = x0 / np.linalg.norm(x0)
    mus = [x @ A @ x]
    for k in range(n):
        pass                          # x <- A x, normalized; append its Rayleigh quotient
    return mus

mus = power_iteration(A, np.ones(3), 25)
errs = [abs(m - lam[-1]) for m in mus]
ratio = 0.0
print(ratio, (lam[-2] / lam[-1])**2)
`,
      answer: t`import numpy as np

A = np.array([[4.0, 1, 0], [1, 3, 1], [0, 1, 2]])
lam = np.linalg.eigvalsh(A)          # ascending

def power_iteration(A, x0, n):
    x = x0 / np.linalg.norm(x0)
    mus = [x @ A @ x]
    for k in range(n):
        y = A @ x
        x = y / np.linalg.norm(y)
        mus.append(x @ A @ x)
    return mus

mus = power_iteration(A, np.ones(3), 25)
errs = [abs(m - lam[-1]) for m in mus]
ratio = errs[9] / errs[8]
print(ratio, (lam[-2] / lam[-1])**2)`,
      tests: [
        { name: t`the Rayleigh quotients converge to $\lambda_1$`, code: 'len(mus) == 26 and abs(mus[-1] - lam[-1]) < 1e-10' },
        { name: t`the measured ratio is within 2% of $(\lambda_2/\lambda_1)^2$`, code: 'abs(ratio / (lam[-2] / lam[-1])**2 - 1) < 0.02' },
      ],
      hints: ['In the loop: y = A @ x; x = y / np.linalg.norm(y); mus.append(x @ A @ x).', 'ratio = errs[9] / errs[8].'],
      teach: 'Measure, don’t assume: the observed error ratio of the Rayleigh quotient matches (λ₂/λ₁)² for a symmetric matrix.',
      explain: (() => { const { w } = eigSym([[4, 1, 0], [1, 3, 1], [0, 1, 2]]); const P = power([[4, 1, 0], [1, 3, 1], [0, 1, 2]], [1, 1, 1], 12); const e = P.rq.map((m) => Math.abs(m - w[2])); return t`The eigenvalues are $${w.map((v) => v.toFixed(4)).join(',\\ ')}$, so $(\lambda_2/\lambda_1)^2 = ${((w[1] / w[2]) ** 2).toFixed(4)}$, and the measured ratio is $${(e[9] / e[8]).toFixed(4)}$. Late iterations stop at round-off near $10^{-16}$ — measure the rate before that.`; })(),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-satellite-mode', difficulty: 3, transfer: true,
      gen(r) {
        const f1 = r.pick([12, 15, 20, 28]), f2 = f1 * r.pick([1.8, 2.5, 3.2]), d = r.pick([8, 10, 12]);
        const q = (f1 / f2) ** 4, ans = Math.ceil(d / -lg(q));
        return {
          prompt: t`A satellite’s finite-element model (symmetric, mass-normalized) has its first two natural frequencies at $${f1}$ Hz and $${+f2.toFixed(1)}$ Hz. Inverse iteration finds the first. Eigenvalues are $\lambda = \omega^2$, and the Rayleigh quotient of a symmetric problem converges at the **square** of the eigenvector’s ratio. About how many iterations bring the eigenvalue’s relative error from order 1 to $10^{-${d}}$?`,
          visual: {
            type: 'graph',
            params: { x: [0, f2 * 1.3], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency (Hz)', ylabel: '', yticks: 0,
              points: [{ x: f1, y: 0, r: 6, color: 'accent', label: `f₁ = ${f1} Hz`, labelDx: -20, labelDy: -14 }, { x: n12(f2), y: 0, r: 6, color: 'ink3', label: `f₂ = ${+f2.toFixed(1)} Hz`, labelDx: -20, labelDy: -14 }] },
            caption: 'The two lowest natural frequencies of the model.',
          },
          answer: ans, tol: { rel: 0, abs: 1 },
          errors: [{ value: Math.ceil(d / -lg(f1 / f2)), feedback: 'Eigenvalues are ω², so the ratio λ₁/λ₂ is (f₁/f₂)², and the Rayleigh quotient squares it again.' }, { value: Math.ceil(d / -lg((f1 / f2) ** 2)), feedback: 'That is the eigenvector’s rate. The Rayleigh quotient of a symmetric problem converges at its square.' }].filter((e) => Math.abs(e.value - ans) > 1),
          hints: [t`Inverse iteration’s ratio is $\lambda_1/\lambda_2 = (f_1/f_2)^2$.`, t`The eigenvalue’s error shrinks by $(f_1/f_2)^4 = ${tex(q, 3)}$ per step; solve $${tex(q, 3)}^k = 10^{-${d}}$.`],
          teach: 'For inverse iteration on a vibration problem, the eigenvalue converges at (f₁/f₂)⁴ per step: well-separated modes take a handful of solves.',
          explain: t`$(f_1/f_2)^4 = ${tex(q, 3)}$, so each step gains $${(-lg(q)).toFixed(2)}$ digits and $${d}$ digits take $${ans}$ steps. Each step is one solve with the stiffness matrix, factored once.`,
        };
      },
    }),
    mcq({
      id: 'cp-flutter', difficulty: 3, transfer: true,
      prompt: t`An engineer runs power iteration on the discrete-time state matrix of a wing’s aeroelastic model to find its least damped mode. The Rayleigh quotients never settle: they oscillate with a steady pattern. The model is correct. What is the most likely reason?`,
      visual: {
        type: 'graph',
        params: { x: [-1.3, 1.3], y: [-1.15, 1.15], aspect: 'wide', equal: true, axesAt: 'center', xlabel: 'Re λ', ylabel: 'Im λ',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink4', dash: true, width: 1.2 }],
          points: [{ x: 0.78, y: 0.55, r: 6, color: 'accent', label: 'λ', labelDx: 8, labelDy: -8 }, { x: 0.78, y: -0.55, r: 6, color: 'accent', label: 'λ̄', labelDx: 8, labelDy: 10 }, { x: 0.4, y: 0, r: 4, color: 'ink3' }, { x: -0.3, y: 0.2, r: 4, color: 'ink3' }, { x: -0.3, y: -0.2, r: 4, color: 'ink3' }] },
        caption: 'A schematic spectrum in the complex plane (unit circle dashed): the dominant eigenvalues of an oscillatory mode come as a conjugate pair of equal modulus.',
      },
      choices: [
        'An oscillatory mode is a complex-conjugate pair λ, λ̄ of equal modulus, so no single eigenvalue dominates and a real iteration rotates in their plane',
        'The matrix is too large for power iteration',
        'The starting vector was orthogonal to the dominant mode',
        'Round-off error grows during power iteration',
      ],
      answer: 0,
      why: {
        1: 'Size only affects cost per step; the oscillation is about the spectrum.',
        2: 'Then rounding would restore that component and the iteration would eventually converge, not oscillate steadily.',
        3: 'Power iteration is stable; normalization keeps the numbers bounded.',
      },
      hints: ['What do the eigenvalues of a lightly damped oscillation look like?', '|λ| = |λ̄|: what does that do to the ratio?'],
      teach: 'A real matrix’s oscillatory modes are complex pairs of equal modulus, which plain power iteration cannot separate; use complex shifts, or a method that finds 2D invariant subspaces (the QR algorithm).',
      explain: t`With $\lambda_{1,2} = \lvert\lambda\rvert e^{\pm i\theta}$ the iterates rotate by about $\theta$ in the plane of the two eigenvectors each step and never settle. The cure is to work with that plane: iterate two vectors together (subspace iteration) and solve the $2\times2$ problem in it — which is what the QR algorithm’s $2\times2$ blocks do.`,
    }),
  ],
  sources: [
    { label: 'Trefethen & Bau (1997), Numerical Linear Algebra, SIAM, Lecture 27 (power, inverse and Rayleigh quotient iteration)', url: 'https://doi.org/10.1137/1.9780898719574' },
    { label: 'Golub & Van Loan (2013), Matrix Computations, 4th ed., Johns Hopkins, §§7.3 and 8.2', url: 'https://openlibrary.org/isbn/9781421407944' },
  ],
});
