// The SVD in computation — what the singular values tell a program: the
// 2-norm condition number σ₁/σₙ, numerical rank with a tolerance (as
// np.linalg.matrix_rank decides it), why the solution Σ (uᵢᵀb/σᵢ) vᵢ blows
// noise up by 1/σᵢ, truncation as regularization, the noise floor
// σ(√m + √n) of a random matrix, and truncated-SVD denoising of repeated
// sensor traces.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg } from './_num.js';
import { svdJacobi, T } from './_lin.js';
import { normals } from '../prog/_numkit.js';

const t = String.raw;
const EPS = 2 ** -52;

// ── the worked example: 40 transducer traces × 100 samples = two modes + noise ──
const M = 40, NS = 100, SIG = 0.1;
const TS = Array.from({ length: NS }, (_, j) => j / (NS - 1));
const CLEAN = Array.from({ length: M }, (_, i) => TS.map((s) => (1 + 0.5 * Math.sin(i)) * Math.sin(Math.PI * s) + 0.4 * Math.cos(0.7 * i) * Math.sin(6 * Math.PI * s) * Math.exp(-3 * s)));
const NOISY = (() => { const z = normals(7); return CLEAN.map((r) => r.map((x) => x + SIG * z())); })();
const SV = svdJacobi(T(NOISY));                     // Nᵀ = U S Vᵀ: U is 100 × 40 (time), V is 40 × 40 (traces)
const FLOOR = SIG * (Math.sqrt(M) + Math.sqrt(NS));
const fro = (A) => Math.sqrt(A.flat().reduce((s, x) => s + x * x, 0));
const recon = (k) => CLEAN.map((r, i) => r.map((_, j) => { let s = 0; for (let q = 0; q < k; q++) s += SV.s[q] * SV.U[j][q] * SV.V[i][q]; return s; }));
const relErr = (A) => fro(A.map((r, i) => r.map((x, j) => x - CLEAN[i][j]))) / fro(CLEAN);
const ERR_NOISY = relErr(NOISY), ERR_K = [1, 2, 3, 5, 10].map((k) => [k, relErr(recon(k))]);
const KEEP = SV.s.filter((s) => s > FLOOR).length;

export default lesson({
  id: 'st-f.F8.2',
  title: 'The SVD in computation',
  minutes: 14, difficulty: 3,
  intro: t`The singular value decomposition $A = U\Sigma V^{\mathsf T}$ ([linear algebra](#/lesson/math2270.LA-12.1)) is the most informative thing you can compute about a matrix, and in numerical work it answers three practical questions. **How sensitive is $Ax = b$?** $\kappa_2 = \sigma_1/\sigma_n$. **What is the rank, really?** In floating point nothing is exactly zero, so the rank is the number of singular values above a tolerance. **How do I solve when $A$ is nearly singular?** Write the least-squares solution in the singular basis:

$$\hat x = \sum_{i=1}^{n}\frac{u_i^{\mathsf T}b}{\sigma_i}\,v_i \qquad\longrightarrow\qquad x_k = \sum_{i=1}^{k}\frac{u_i^{\mathsf T}b}{\sigma_i}\,v_i$$

Any noise in $b$ along $u_i$ is multiplied by $1/\sigma_i$, so the smallest singular values turn measurement noise into garbage. The **truncated SVD** keeps only the $k$ components with $\sigma_i$ above the noise, trading a small bias for a large cut in noise — the same truncation $A_k = \sum_{i\le k}\sigma_iu_iv_i^{\mathsf T}$ that denoises a data matrix.`,
  symbols: [
    { tex: t`\sigma_i`, text: 'the singular values, $\\sigma_1 \\ge \\sigma_2 \\ge \\cdots \\ge 0$: how much $A$ stretches its $i$-th input direction' },
    { tex: 'u_i,\\ v_i', text: 'left and right singular vectors: $Av_i = \\sigma_iu_i$. The $v_i$ are directions in parameter space, the $u_i$ in measurement space' },
    { tex: t`u_i^{\mathsf T}b`, text: 'the part of the data along $u_i$ — signal plus whatever noise lies in that direction' },
    { tex: 'x_k', text: 'the **truncated-SVD** solution: the components with the $k$ largest $\\sigma_i$ only' },
    { tex: 'A_k', text: 'the best rank-$k$ approximation of $A$ (Eckart–Young): its error is $\\sigma_{k+1}$ in the 2-norm' },
  ],
  why: 'Modal decomposition of test data, proper orthogonal decomposition of CFD snapshots, inverse problems (reconstructing a heat flux from thermocouples, a source from detector counts), rank-deficient fits and principal components are all computations with the singular values, and knowing where the noise floor is decides which of them you can trust.',
  visual: {
    type: 'la-svd',
    title: 'Denoising by truncation',
    lead: t`A computed picture with random noise added (left) beside its rank-$k$ truncation (right), with the singular values on a log scale below. Slide $k$ and watch which singular values stand above the flat **noise floor**.`,
    tasks: [
      'At small k the truncation already looks cleaner than the noisy original: the picture lives in a few singular values, the noise is spread over all of them.',
      'Find the knee where the singular values flatten into the noise floor; keeping more than that puts the speckle back.',
      'Push k to the top: the rank-k picture becomes the noisy one again, noise and all.',
    ],
    params: { mode: 'image', image: 'satellite', noise: 0.12, k: 4, kmax: 40, readout: ['k', 'sigma'] },
    caption: 'A synthetic 48 × 64 picture plus seeded Gaussian speckle (standard deviation 0.12). The singular values are computed exactly in float64; the readout’s σₖ₊₁ is the 2-norm error from the noisy picture, not from the clean one.',
  },
  example: {
    prompt: t`A test stand records $${M}$ repeated firings, each a trace of $${NS}$ pressure samples, as the rows of a matrix. Physically the traces are combinations of two shapes (a slow rise-and-fall and a decaying ripple); each sample also carries sensor noise of standard deviation $${SIG}$. Use the SVD to remove the noise.`,
    visual: {
      type: 'graph',
      params: { x: [0.3, 20.7], y: [-0.4, 2], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'index i', ylabel: 'σᵢ',
        points: SV.s.slice(0, 20).map((s, i) => ({ x: i + 1, y: n12(lg(s)), r: 4.5, color: i < KEEP ? 'accent' : 'ink3' })),
        hlines: [{ y: n12(lg(FLOOR)), label: 'noise floor σ(√m + √n)', color: 'gold' }] },
      caption: 'The first 20 singular values of the noisy 40 × 100 data matrix (log scale). Two stand above the predicted noise floor (gold).',
    },
    steps: [
      { label: 'Decompose', text: t`The singular values begin $${SV.s.slice(0, 5).map((s) => s.toFixed(2)).join(',\\ ')}, \ldots$ — two large, then a slowly sloping plateau.` },
      { label: 'The noise floor', text: t`A $m\times n$ matrix of independent noise of standard deviation $\sigma$ has its largest singular value near $\sigma(\sqrt m + \sqrt n) = ${SIG}(\sqrt{${M}} + \sqrt{${NS}}) = ${FLOOR.toFixed(2)}$ (random-matrix theory). Everything below that is indistinguishable from noise: keep $k = ${KEEP}$.` },
      { label: 'Truncate', text: t`$A_${KEEP} = \sigma_1u_1v_1^{\mathsf T} + \sigma_2u_2v_2^{\mathsf T}$. Compared with the clean traces, its relative error is $${(100 * ERR_K[1][1]).toFixed(1)}\%$, against $${(100 * ERR_NOISY).toFixed(1)}\%$ for the raw data.` },
      { label: 'Why it works', text: t`The signal lives in a $${KEEP}$-dimensional subspace; the noise is spread evenly over all $${M}\times${NS}$ directions. A rank-$k$ approximation keeps only about $k(m + n)$ of the $mn$ noise degrees of freedom — here $${KEEP * (M + NS)}$ of $${M * NS}$.` },
      { label: 'Too few, too many', text: t`$k = 1$ loses the ripple: error $${(100 * ERR_K[0][1]).toFixed(1)}\%$. $k = 3, 5, 10$ re-admit noise: $${ERR_K.slice(2).map(([, e]) => (100 * e).toFixed(1)).join(',\\ ')}\%$. The knee in the singular values is the right $k$.` },
    ],
    answer: t`Keep the $${KEEP}$ singular values above the floor $${FLOOR.toFixed(2)}$: the error falls from $${(100 * ERR_NOISY).toFixed(1)}\%$ to $${(100 * ERR_K[1][1]).toFixed(1)}\%$.`,
  },
  practice: [
    num({
      id: 'kappa-sv', difficulty: 1,
      gen(r) {
        const s = [r.pick([8, 12, 25, 40]), r.pick([3, 4, 5]), r.pick([0.5, 0.8, 1.2]), r.pick([0.02, 0.004, 0.001])];
        const ans = s[0] / s[3];
        return {
          prompt: t`A $4\times4$ matrix has singular values $${s.join(',\\ ')}$. What is its 2-norm condition number?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 4.6], y: [-3.5, 2], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'index i', ylabel: 'σᵢ', xticks: 4,
              points: s.map((v, i) => ({ x: i + 1, y: n12(lg(v)), r: 5.5, color: 'accent' })) },
            caption: 'The singular values on a log scale.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: s[0] / s[1], feedback: 'Use the smallest singular value, not the second largest.' }, { value: s[3] / s[0], feedback: t`Upside down: $\kappa = \sigma_{\max}/\sigma_{\min} \ge 1$.` }],
          hints: [t`$\kappa_2 = \sigma_{\max}/\sigma_{\min}$.`, t`$${s[0]} \div ${s[3]}$.`],
          teach: 'The 2-norm condition number is the ratio of the largest to the smallest singular value: the most and least a unit vector is stretched.',
          explain: t`$\kappa_2 = ${s[0]}/${s[3]} = ${tex(ans, 3)}$: up to $\log_{10}\kappa \approx ${lg(ans).toFixed(1)}$ digits at risk in a solve.`,
        };
      },
    }),
    num({
      id: 'numerical-rank', difficulty: 2,
      gen(r) {
        const m = r.pick([100, 500, 2000]), s1 = r.pick([12, 40, 3]);
        const sv = [s1, +(s1 * 0.25).toFixed(2), +(s1 * 0.06).toFixed(3), s1 * r.pick([2e-4, 5e-6]), s1 * r.pick([3e-12, 8e-13, 5e-14]), s1 * 2e-16];
        const tol = s1 * m * EPS, ans = sv.filter((v) => v > tol).length;
        return {
          prompt: t`A $${m}\times6$ matrix has singular values $${sv.map((v) => tex(v, 2)).join(',\\ ')}$. NumPy’s \`matrix_rank\` counts the singular values above $\sigma_1\cdot\max(m, n)\cdot\varepsilon_{\text{mach}}$, with $\varepsilon_{\text{mach}} = 2^{-52} \approx 2.2\times10^{-16}$. What rank does it report?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 6.6], y: [lg(sv[5]) - 1, lg(s1) + 1], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'index i', ylabel: 'σᵢ', xticks: 6,
              points: sv.map((v, i) => ({ x: i + 1, y: n12(lg(v)), r: 5.5, color: 'accent' })) },
            caption: 'The six singular values on a log scale; where to draw the line is the question.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 6, feedback: 'In floating point no singular value is exactly 0; the tiny ones are round-off. Compare each with the tolerance.' }].filter((e) => e.value !== ans),
          hints: [t`Tolerance: $${s1}\times${m}\times2.2\times10^{-16} = ${tex(tol, 2)}$.`, 'Count the singular values above it.'],
          teach: 'Numerical rank is the number of singular values above a tolerance tied to the precision and the size of A — not the number of nonzero ones.',
          explain: t`The tolerance is $${tex(tol, 2)}$, so $${ans}$ singular values count. The ones below are what round-off makes of exact zeros (or of directions too weak to resolve in float64). For data with measurement noise, the tolerance should be the noise level instead.`,
        };
      },
    }),
    num({
      id: 'noise-amplification', difficulty: 2,
      gen(r) {
        const smin = r.pick([1e-3, 1e-4, 2e-5]), db = r.pick([1e-3, 5e-3, 1e-2]), ans = db / smin;
        return {
          prompt: t`In $\hat x = \sum_i (u_i^{\mathsf T}b/\sigma_i)\,v_i$, the measurement vector $b$ carries noise of norm $${tex(db, 1)}$, all of it (worst case) along $u_n$. The smallest singular value is $\sigma_n = ${tex(smin, 1)}$. How large an error does that put into $\hat x$?`,
          visual: {
            type: 'graph',
            params: { x: [-6, 0.3], y: [-0.5, 7], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'σᵢ', ylabel: 'amplification 1/σᵢ',
              curves: [{ fn: '-x', color: 'bad', width: 2, domain: [-5.9, 0.2] }],
              vlines: [{ x: n12(lg(smin)), label: 'σₙ', color: 'gold' }] },
            caption: 'The factor by which noise along uᵢ is multiplied in the solution, against σᵢ (log–log).',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: db * smin, feedback: 'The solution divides by σᵢ: noise along uₙ is multiplied by 1/σₙ.' }],
          hints: [t`The component along $u_n$ contributes $(u_n^{\mathsf T}\delta b/\sigma_n)\,v_n$.`, t`$${tex(db, 1)}/${tex(smin, 1)}$.`],
          teach: 'Noise in the data along the weakest singular direction is amplified by 1/σₙ in the solution: the smallest singular value sets the worst-case error.',
          explain: t`$\lVert\delta x\rVert = ${tex(db, 1)}/${tex(smin, 1)} = ${tex(ans, 2)}$. If the true $\hat x$ has components of order 1, that error swamps it — unless the $\sigma_n$ component is dropped (truncated SVD) or damped (Tikhonov regularization).`,
        };
      },
    }),
    mcq({
      id: 'truncation-tradeoff', difficulty: 3,
      prompt: t`Dropping the terms with small $\sigma_i$ from $\hat x = \sum (u_i^{\mathsf T}b/\sigma_i)\,v_i$ gives a solution that no longer minimizes $\lVert Ax - b\rVert$. Why can it still be the better answer?`,
      visual: {
        type: 'graph',
        params: { x: [0.4, 10.6], y: [-3, 3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'component i', ylabel: 'size',
          points: [...Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: n12(lg(3 * 0.45 ** i + 0.004)), r: 4.5, color: 'accent' })), ...Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: n12(lg((3 * 0.45 ** i + 0.004) / (3 * 0.45 ** i))), r: 4.5, color: 'bad' }))],
          legend: [{ label: '|uᵢᵀb| (signal + noise)', color: 'accent', point: true }, { label: '|uᵢᵀb| / σᵢ', color: 'bad', point: true }], legendAt: 'tr',
          hlines: [{ y: n12(lg(0.004)), label: 'noise level', color: 'gold' }] },
        caption: 'Schematic Picard plot: once |uᵢᵀb| levels off at the noise, the coefficients |uᵢᵀb|/σᵢ blow up. Numbers illustrative.',
      },
      choices: [
        'Where |uᵢᵀb| has sunk to the noise level, those terms are mostly noise divided by small σᵢ; dropping them adds a small bias but removes a huge variance',
        'The small singular values are round-off errors and should always be dropped',
        'The truncated solution has a smaller residual',
        'Truncation makes the matrix better conditioned without changing the answer',
      ],
      answer: 0,
      why: {
        1: 'Not always: if the data are exact and σᵢ is well above round-off, its term is genuine signal.',
        2: 'Its residual is larger — it fits the data less closely — and that is the price paid.',
        3: 'It changes the answer; that is the point. The question is whether the change is towards the truth.',
      },
      hints: ['What is in uᵢᵀb when σᵢ is small: signal or noise?', 'Compare the error introduced by dropping a term with the noise that term would carry.'],
      teach: 'Truncation is regularization: it accepts a small, controlled bias to avoid amplifying noise by 1/σᵢ — the right choice whenever the data are noisy and the problem ill-conditioned.',
      explain: t`For a typical ill-posed problem the data coefficients $u_i^{\mathsf T}b$ decay with $\sigma_i$ until they hit the noise level, then stay flat (the **discrete Picard condition**). Beyond that point the terms $u_i^{\mathsf T}b/\sigma_i$ are noise divided by ever smaller numbers. Keeping $k$ terms up to the knee minimizes the total error; the residual grows slightly, to about the noise level — exactly as it should.`,
    }),
    num({
      id: 'noise-floor', difficulty: 3,
      gen(r) {
        const m = r.pick([16, 25, 36]), n = r.pick([400, 900, 1600]), s = r.pick([0.02, 0.05, 0.1]);
        const ans = s * (Math.sqrt(m) + Math.sqrt(n));
        return {
          prompt: t`A matrix of $${m}\times${n}$ independent Gaussian noise samples with standard deviation $${s}$ is added to a data matrix. Using $\sigma_{\max} \approx \sigma(\sqrt m + \sqrt n)$, where will the noise floor of the singular values sit?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 12.6], y: [-0.5, 2.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'index i', ylabel: 'σᵢ', yticks: 0,
              points: [80, 25, 6, ...Array(9).fill(0)].map((v, i) => ({ x: i + 1, y: n12(lg(v > 0 ? v : 1 - 0.02 * (i - 3))), r: 4.5, color: v > 0 ? 'accent' : 'ink3' })) },
            caption: 'Schematic: a few signal singular values above a flat plateau of noise ones. The plateau’s height is the question.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: s * Math.sqrt(m * n), feedback: 'That is the Frobenius norm of the noise, √(mn)σ — its total size, spread over all singular values. The largest one is σ(√m + √n).' }, { value: s, feedback: 'The singular values of a noise matrix grow with its size: σ(√m + √n).' }],
          hints: [t`$\sqrt{${m}} + \sqrt{${n}} = ${Math.sqrt(m)} + ${Math.sqrt(n)}$.`, `Multiply by σ = ${s}.`],
          teach: 'Noise in an m × n matrix tops out near σ(√m + √n): singular values clearly above that are signal; those at or below cannot be told from noise.',
          explain: t`$${s}\times(${Math.sqrt(m)} + ${Math.sqrt(n)}) = ${ans.toFixed(3)}$. This is the edge of the Marchenko–Pastur distribution of random-matrix theory; the noise singular values fill the range up to it, so the threshold for keeping a component sits a little above.`,
        };
      },
    }),
    code({
      id: 'tsvd-denoise', difficulty: 3,
      prompt: t`Build a rank-3 “clean” matrix \`C\` ($30\times200$) from three smooth traces, add Gaussian noise of standard deviation $\sigma = 0.05$, and denoise it: compute \`np.linalg.svd(N, full_matrices=False)\`, keep the $k$ singular values above $1.2\,\sigma(\sqrt{30} + \sqrt{200})$, and rebuild \`A_k\`. Store \`k\`, and the relative errors (Frobenius norm, against \`C\`) \`err_noisy\` of \`N\` and \`err_k\` of \`A_k\`.`,
      starter: t`import numpy as np

rng = np.random.default_rng(3)
m, n, sigma = 30, 200, 0.05
s = np.linspace(0, 1, n)
modes = np.array([np.sin(np.pi * s), np.sin(4 * np.pi * s) * np.exp(-2 * s), s**2])
weights = rng.standard_normal((m, 3)) + np.array([2.0, 0.0, 0.0])
C = weights @ modes                       # rank 3
N = C + sigma * rng.standard_normal((m, n))

U, S, Vt = np.linalg.svd(N, full_matrices=False)
floor = sigma * (np.sqrt(m) + np.sqrt(n))
k = 0
A_k = N
err_noisy = np.linalg.norm(N - C) / np.linalg.norm(C)
err_k = np.linalg.norm(A_k - C) / np.linalg.norm(C)
print(S[:6].round(3), floor, k, err_noisy, err_k)
`,
      answer: t`import numpy as np

rng = np.random.default_rng(3)
m, n, sigma = 30, 200, 0.05
s = np.linspace(0, 1, n)
modes = np.array([np.sin(np.pi * s), np.sin(4 * np.pi * s) * np.exp(-2 * s), s**2])
weights = rng.standard_normal((m, 3)) + np.array([2.0, 0.0, 0.0])
C = weights @ modes                       # rank 3
N = C + sigma * rng.standard_normal((m, n))

U, S, Vt = np.linalg.svd(N, full_matrices=False)
floor = sigma * (np.sqrt(m) + np.sqrt(n))
k = int(np.sum(S > 1.2 * floor))
A_k = (U[:, :k] * S[:k]) @ Vt[:k]
err_noisy = np.linalg.norm(N - C) / np.linalg.norm(C)
err_k = np.linalg.norm(A_k - C) / np.linalg.norm(C)
print(S[:6].round(3), floor, k, err_noisy, err_k)`,
      tests: [
        { name: 'the threshold finds the true rank, 3', code: 'k == 3' },
        { name: 'the truncation cuts the error at least threefold', code: 'err_k * 3 < err_noisy' },
        { name: t`\`A_k\` really has rank $k$`, code: 'np.linalg.matrix_rank(A_k) == k' },
      ],
      hints: [t`\`k = int(np.sum(S > 1.2 * floor))\`.`, t`\`A_k = (U[:, :k] * S[:k]) @ Vt[:k]\` — broadcasting scales each column of \`U\` by its singular value.`],
      teach: 'Truncated-SVD denoising is three lines: decompose, count the singular values above the noise floor, rebuild from those.',
      explain: t`The three signal singular values stand far above the floor $0.05(\sqrt{30} + \sqrt{200}) \approx ${(0.05 * (Math.sqrt(30) + Math.sqrt(200))).toFixed(2)}$, the rest sit near or below it. Keeping 3 of 30 components keeps about $3(30 + 200)/(30\cdot200) \approx ${((3 * 230) / 6000 * 100).toFixed(0)}\%$ of the noise energy, so the error falls by roughly $\sqrt{6000/690} \approx ${Math.sqrt(6000 / 690).toFixed(1)}$ times. The factor 1.2 is a safety margin above the floor: the noise’s largest singular value fluctuates a little around $\sigma(\sqrt m + \sqrt n)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-teststand', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([16, 25]), n = r.pick([900, 1600, 2500]), s = r.pick([0.5, 1]);
        const floor = s * (Math.sqrt(m) + Math.sqrt(n));
        const sig = [floor * 40, floor * 9, floor * 3.1, floor * 1.6, floor * 0.98, floor * 0.95, floor * 0.92].map((v) => +v.toPrecision(3));
        const ans = sig.filter((v) => v > 1.2 * floor).length;
        return {
          prompt: t`During a hot-fire, $${m}$ chamber-pressure transducers are sampled $${n}$ times each; their noise is $${s}$ kPa (one standard deviation). The SVD of the $${m}\times${n}$ data matrix (in kPa) starts $${sig.map((v) => String(v)).join(',\\ ')}, \ldots$ How many components should a truncated SVD keep, using a threshold of $1.2\,\sigma(\sqrt m + \sqrt n)$?`,
          visual: {
            type: 'graph',
            params: { x: [0.4, 7.6], y: [lg(sig[6]) - 0.5, lg(sig[0]) + 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'index i', ylabel: 'σᵢ (kPa)', xticks: 7,
              points: sig.map((v, i) => ({ x: i + 1, y: n12(lg(v)), r: 5, color: 'accent' })) },
            caption: 'The leading singular values of the transducer data (log scale).',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: sig.filter((v) => v > floor).length, feedback: 'You used the floor itself; the threshold adds a 20% margin above it.' }].filter((e) => e.value !== ans),
          hints: [t`Floor: $${s}(\sqrt{${m}} + \sqrt{${n}}) = ${floor.toFixed(1)}$ kPa; threshold $${(1.2 * floor).toFixed(1)}$ kPa.`, 'Count the singular values above the threshold.'],
          teach: 'The noise floor of the data matrix turns a measured noise level into a rank: keep what stands clearly above it.',
          explain: t`The threshold is $1.2\times${floor.toFixed(1)} = ${(1.2 * floor).toFixed(1)}$ kPa, and $${ans}$ singular values exceed it: $${ans}$ coherent pressure patterns (for instance the mean chamber pressure, its start-up transient, an acoustic mode) above independent sensor noise. The next ones, $${sig[4]}$ and below, are at the floor.`,
        };
      },
    }),
    mcq({
      id: 'cp-inverse-heat', difficulty: 3, transfer: true,
      prompt: t`A re-entry capsule’s heat-shield flux $q(t)$ is reconstructed from thermocouples buried in the shield by solving $Gq = T$, where $G$ (from a conduction model) maps a flux history to temperature histories. The singular values of $G$ fall smoothly from $1$ to $10^{-9}$. The direct least-squares solution oscillates wildly between $\pm10^5\ \text{kW/m}^2$. What is going on, and what do engineers do?`,
      visual: {
        type: 'graph',
        params: { x: [0, 120], y: [-1.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'q (scaled)', yticks: 0,
          curves: [{ fn: 'exp(-((x - 50)/18)^2)', color: 'accent', width: 2.4, label: 'plausible flux', labelAt: 50, labelDx: 6, labelDy: -14 }, { fn: 'exp(-((x - 50)/18)^2) + 0.6*sin(2.3x)*sin(0.5x)', color: 'bad', width: 1.4, label: 'direct solution (schematic)', labelAt: 95, labelDx: -60, labelDy: -40, samples: 2000 }] },
        caption: 'Schematic: the smooth flux the physics suggests, and the oscillating direct solution (amplitude not to scale — the real one is far larger).',
      },
      choices: [
        'Heat conduction smooths, so rapidly varying fluxes barely change the temperatures (tiny σᵢ); measurement noise along those directions is divided by up to 10⁻⁹. Truncated SVD or Tikhonov regularization keeps only what the data resolve',
        'The thermocouples are faulty; better sensors would make the direct solution work',
        'The least-squares solver is unstable; using QR instead of the normal equations removes the oscillation',
        'The flux genuinely oscillates; the capsule experienced turbulent heating',
      ],
      answer: 0,
      why: {
        1: 'Better sensors lower the noise, but dividing by 10⁻⁹ still amplifies whatever remains; the ill-conditioning is in the physics of conduction.',
        2: 'QR avoids squaring κ, but κ ≈ 10⁹ is the problem’s own sensitivity; any accurate solver faithfully reproduces the amplified noise.',
        3: 'The oscillation’s size and shape follow the smallest singular vectors and change with the noise, not with the flight: they are artefacts.',
      },
      hints: ['What does diffusion do to a rapidly varying input?', 'In x̂ = Σ (uᵢᵀb/σᵢ)vᵢ, which terms carry the oscillations?'],
      teach: 'Inverse problems of smoothing physics (conduction, blurring, gravity from orbit) have singular values falling towards zero; their solutions must be regularized, and the SVD shows how much the data can tell you.',
      explain: t`The smallest singular vectors of $G$ are rapidly oscillating flux histories that conduction erases before they reach the sensors. A temperature error of $0.01$ K along such a $u_i$ becomes $10^7$ times larger in $q$. Truncating at the noise level (or Tikhonov’s damping $\sigma_i/(\sigma_i^2 + \lambda^2)$ instead of $1/\sigma_i$) gives a smooth, physically believable flux — with the honest caveat that its fine time detail is not determined by the data at all.`,
    }),
  ],
  sources: [
    { label: 'Hansen (1998), Rank-Deficient and Discrete Ill-Posed Problems, SIAM (truncated SVD, the Picard condition)', url: 'https://doi.org/10.1137/1.9780898719697' },
    { label: 'Gavish & Donoho (2014), The optimal hard threshold for singular values is 4/√3, IEEE Trans. Inf. Theory 60, 5040', url: 'https://doi.org/10.1109/TIT.2014.2323359' },
    { label: 'NumPy documentation: numpy.linalg.matrix_rank (default tolerance)', url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.matrix_rank.html' },
  ],
});
