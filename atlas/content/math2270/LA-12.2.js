// Low-rank approximation and data: the SVD as a sum of rank-1 layers in
// order of importance, Eckart–Young (the error of the best rank-k
// approximation is σₖ₊₁), image compression, storage, and principal
// components of data.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { matTeX, tupleTeX, stems } from './_la.js';
import { svdPic, eigSym2 } from './_ortho.js';
import { truncationError } from '../../src/viz/model/la-svd.js';

const t = String.raw;
const T = t`^{\mathsf T}`;
const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n) => String(n).replace(/\d/g, (d) => SUBS[d]);
/** A descending list of n singular values with a knee, rounded to 2 decimals. */
function spectrum(r, n = 6) {
  let v = r.pick([40, 30, 25, 50]);
  const out = [];
  for (let k = 0; k < n; k++) { out.push(Math.round(v * 100) / 100); v *= k < 2 ? r.pick([0.45, 0.5, 0.6]) : r.pick([0.3, 0.4, 0.5]); }
  return out;
}
const imagePic = (image, k, caption, extra = {}) => ({ type: 'la-svd', params: { mode: 'image', image, k, readout: false, ...extra }, caption });

export default lesson({
  id: 'math2270.LA-12.2',
  title: 'Low-rank approximation and data',
  minutes: 14, difficulty: 3,
  intro: t`Multiply out $A = U\Sigma V${T}$ column by column and the SVD becomes a sum of rank-1 layers, largest first:

$$A = \sigma_1\mathbf u_1\mathbf v_1${T} + \sigma_2\mathbf u_2\mathbf v_2${T} + \dots + \sigma_r\mathbf u_r\mathbf v_r${T}$$

Keep only the first $k$ layers and you have $A_k$. The **Eckart–Young theorem** says no matrix of rank $k$ is closer to $A$: the largest stretch of the error $A - A_k$ is exactly $\sigma_{k+1}$, and its total size $\|A - A_k\|_F = \sqrt{\sigma_{k+1}^2 + \sigma_{k+2}^2 + \dots}$. When the singular values fall fast, a few layers carry almost everything. An $m\times n$ picture then needs only $k(m + n + 1)$ numbers instead of $mn$; a cloud of data points is described by its first few **principal components** $\mathbf v_1, \mathbf v_2, \dots$, the directions along which it spreads most.`,
  symbols: [
    { tex: t`\sigma_i\mathbf u_i\mathbf v_i${T}`, text: t`one layer: an $m\times n$ matrix of rank 1 (every row is a multiple of $\mathbf v_i${T}$), weighted by its singular value` },
    { tex: 'A_k', text: t`the sum of the first $k$ layers: the best rank-$k$ approximation of $A$` },
    { tex: t`\sigma_{k+1}`, text: t`the first singular value left out: the largest stretch of $A - A_k$, $\max_{|\mathbf x| = 1}|(A - A_k)\mathbf x|$` },
    { tex: t`\|A\|_F`, text: t`the Frobenius norm $\sqrt{\sum a_{ij}^2} = \sqrt{\sigma_1^2 + \dots + \sigma_r^2}$: the root-sum-square of all entries` },
    { tex: 'k(m + n + 1)', text: t`the numbers needed to store $A_k$: $k$ columns $\mathbf u_i$ ($m$ numbers each), $k$ rows $\mathbf v_i$ ($n$ each) and $k$ singular values` },
  ],
  why: 'Compression, noise reduction, principal component analysis, the reduced-order models that make aerospace CFD and structural dynamics tractable (proper orthogonal decomposition), and recommendation engines are all truncated SVDs.',
  visual: {
    type: 'la-svd',
    title: 'Pictures, rank by rank',
    lead: t`A $48\times64$ grey-scale picture — a matrix of brightnesses, computed here, not photographed — beside its rank-$k$ approximation $A_k$. Right: all its singular values on a log scale; the kept ones blue, $\sigma_{k+1}$ gold.`,
    tasks: [
      'Satellite: k = 1 is a blurry cross; by k = 6 it is clear; at k = 9 the error is 0 — this drawing has rank 9 exactly, and the spectrum drops off a cliff after σ₉.',
      'Checkerboard: rank 2. Its rows come in just two patterns, so two layers rebuild it exactly.',
      'Diagonal stripe and random noise: the singular values hardly fall, and no small k does well. Low rank is a property of the picture, not a free lunch.',
    ],
    params: { mode: 'image', image: 'satellite', choose: true, k: 3, kmax: 40, readout: ['k', 'store', 'err', 'sigma'] },
    caption: 'Left: the picture, grey levels 0 (black) to 1 (white). Middle: the sum of its first k SVD layers, clipped to 0–1 for display. Right: σⱼ against j on a log scale (σ below 10⁻⁴ σ₁ is drawn at the floor). The pictures are drawn on a 48 × 64 grid, so even the dish is made of a few distinct rows.',
  },
  example: {
    prompt: t`Using the SVD of $A = ${matTeX([[3, 0], [4, 5]])}$ from LA-12.1 ($\sigma_1 = 3\sqrt5$, $\mathbf u_1 = \tfrac1{\sqrt{10}}(1, 3)$, $\mathbf v_1 = \tfrac1{\sqrt2}(1, 1)$, $\sigma_2 = \sqrt5$), find the best rank-1 approximation $A_1$ and check that $\|A - A_1\| = \sigma_2$.`,
    visual: svdPic([[3, 0], [4, 5]], { stage: 3, stages: false, rank1: 'on', view: 7.5, caption: 'The unit circle under A (dashed ellipse) and under its rank-1 part A₁ (the blue segment): every vector lands on the line of u₁. Toggle to compare.' }),
    steps: [
      { label: 'One layer', text: t`$A_1 = \sigma_1\mathbf u_1\mathbf v_1${T} = 3\sqrt5\cdot\tfrac1{\sqrt{10}}\cdot\tfrac1{\sqrt2}\begin{bmatrix} 1 \\ 3 \end{bmatrix}\begin{bmatrix} 1 & 1 \end{bmatrix} = \tfrac32\begin{bmatrix} 1 & 1 \\ 3 & 3 \end{bmatrix} = \begin{bmatrix} 1.5 & 1.5 \\ 4.5 & 4.5 \end{bmatrix}$.` },
      { label: 'Rank 1', text: t`Both columns are the same; every row is a multiple of $(1, 1)$. It squashes the whole plane onto the line of $\mathbf u_1$.` },
      { label: 'The error', text: t`$A - A_1 = \begin{bmatrix} 1.5 & -1.5 \\ -0.5 & 0.5 \end{bmatrix}$ — which is exactly the second layer, $\sigma_2\mathbf u_2\mathbf v_2${T}$.` },
      { label: 'Its size', text: t`It has rank 1, so its only nonzero singular value is its Frobenius norm: $\sqrt{2.25 + 2.25 + 0.25 + 0.25} = \sqrt5 = \sigma_2$ ✓.` },
      { label: 'Sense check', text: t`Of $A$'s total $\|A\|_F^2 = \sigma_1^2 + \sigma_2^2 = 45 + 5 = 50$, the first layer carries $45/50 = 90\%$. Eckart–Young: no other rank-1 matrix comes closer than $\sqrt5$ — not keeping the biggest entry, not keeping a column.` },
    ],
    answer: t`$A_1 = \begin{bmatrix} 1.5 & 1.5 \\ 4.5 & 4.5 \end{bmatrix}$, and $A - A_1 = \sigma_2\mathbf u_2\mathbf v_2${T}$ has size $\sqrt5 = \sigma_2$.`,
  },
  practice: [
    num({
      id: 'storage', difficulty: 1,
      gen(r) {
        const [m, n] = r.pick([[480, 640], [512, 512], [1024, 768], [300, 400]]), k = r.pick([10, 20, 25, 40, 50]), ask = r.bool(0.5);
        const kept = k * (m + n + 1), ans = ask ? kept : (100 * kept) / (m * n);
        return {
          prompt: ask ? t`A $${m}\times${n}$ grey-scale image is stored as its rank-${k} SVD truncation. How many numbers must be stored?` : t`A $${m}\times${n}$ grey-scale image is stored as its rank-${k} SVD truncation. What percentage of the original $${m}\times${n}$ numbers is that?`,
          answer: ans, tol: ask ? { rel: 0, abs: 0.5 } : { rel: 0.005 },
          errors: ask ? [{ value: k * (m + n), feedback: t`Don't forget the $k$ singular values: $k(m + n + 1)$.` }, { value: k * m * n, feedback: t`That is $k$ full images. Each layer $\sigma_i\mathbf u_i\mathbf v_i${T}$ needs only $\mathbf u_i$ ($m$ numbers), $\mathbf v_i$ ($n$) and $\sigma_i$ (1).` }] : [],
          hints: [t`Each layer needs $\mathbf u_i$ ($${m}$ numbers), $\mathbf v_i$ ($${n}$) and $\sigma_i$ (1).`, t`$${k}$ layers: $${k}(${m} + ${n} + 1)$.`],
          teach: 'A rank-k truncation stores k(m + n + 1) numbers instead of mn: a big saving when k is much smaller than m and n.',
          explain: t`$${k}(${m} + ${n} + 1) = ${kept}$ numbers, $${nice((100 * kept) / (m * n), 3)}\%$ of $${m * n}$. Real codecs (JPEG) do better with local transforms, but the SVD is the best possible for a given rank.`,
          visual: imagePic('satellite', 4, 'A 48 × 64 picture and its rank-4 approximation (readouts hidden): 4 × 113 = 452 numbers instead of 3072.'),
        };
      },
    }),
    num({
      id: 'spectral-error', difficulty: 2,
      gen(r) {
        const s = spectrum(r), k = r.int(1, 4);
        return {
          prompt: t`A matrix has singular values $${s.join(',\\ ')}$. What is the largest stretch $\max_{|\mathbf x| = 1}|(A - A_${k})\mathbf x|$ of the error left by its best rank-${k} approximation?`,
          answer: s[k], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: s[k - 1], feedback: t`That is $\sigma_${k}$, which $A_${k}$ keeps. The error starts with the first singular value left out.` }, { value: Math.sqrt(s.slice(k).reduce((a, b) => a + b * b, 0)), feedback: t`That is the Frobenius size of the error. Its largest single stretch is just $\sigma_{${k + 1}}$.` }].filter((e) => Math.abs(e.value - s[k]) > 1e-3),
          hints: [t`$A - A_${k} = \sigma_{${k + 1}}\mathbf u_{${k + 1}}\mathbf v_{${k + 1}}${T} + \dots$ — itself an SVD.`],
          teach: 'Eckart–Young: the error of the best rank-k approximation has largest stretch σₖ₊₁.',
          explain: t`The leftover layers form the SVD of $A - A_${k}$, whose largest singular value is $\sigma_{${k + 1}} = ${s[k]}$.`,
          visual: stems([['σ', s, 'accent']], { labels: s.map((_, i) => `σ${sub(i + 1)}`), xlabel: 'singular value', caption: 'The singular values, largest first.' }),
        };
      },
    }),
    num({
      id: 'frob-error', difficulty: 2,
      gen(r) {
        const s = spectrum(r), k = r.int(1, 3), e = truncationError(s, k);
        return {
          prompt: t`With singular values $${s.join(',\\ ')}$, what percentage of $\|A\|_F$ is the error $\|A - A_${k}\|_F$ of the rank-${k} truncation? (3 significant figures)`,
          answer: 100 * e.rel, tol: { rel: 0.005 },
          errors: [{ value: (100 * s[k]) / s[0], feedback: t`Compare root-sum-squares, not single values: $\|A - A_${k}\|_F = \sqrt{\sigma_{${k + 1}}^2 + \dots}$ and $\|A\|_F = \sqrt{\sigma_1^2 + \dots}$.` }, { value: 100 * e.rel * e.rel, feedback: 'That is the fraction of the squared norm (the “energy”). Take the square root.' }].filter((x) => Math.abs(x.value - 100 * e.rel) > 0.01 * e.rel * 100),
          hints: [t`$\|A - A_${k}\|_F^2 = ${s.slice(k).map((v) => `${v}^2`).join(' + ')}$.`, t`$\|A\|_F^2 = \sum\sigma_i^2 = ${nice(s.reduce((a, b) => a + b * b, 0), 5)}$.`],
          teach: 'The Frobenius error of a truncated SVD is the root-sum-square of the singular values left out.',
          explain: t`$\|A - A_${k}\|_F = ${nice(e.frob, 4)}$ and $\|A\|_F = ${nice(Math.sqrt(s.reduce((a, b) => a + b * b, 0)), 4)}$: $${nice(100 * e.rel, 3)}\%$.`,
          visual: stems([['σ', s, 'accent']], { labels: s.map((_, i) => `σ${sub(i + 1)}`), xlabel: 'singular value', caption: 'The singular values, largest first.' }),
        };
      },
    }),
    num({
      id: 'layer-entry', difficulty: 2,
      gen(r) {
        const sig = r.pick([2, 3, 5, 6]), u = r.pick([[3, 4], [4, -3], [5, 12], [0.6, -0.8]]), v = r.pick([[1, 2, 2], [2, -1, 2], [2, 2, -1]]);
        const un = Math.hypot(...u), uu = u.map((x) => x / un), vv = v.map((x) => x / 3), i = r.int(0, 1), j = r.int(0, 2);
        const ans = sig * uu[i] * vv[j];
        return {
          prompt: t`One layer of an SVD is $\sigma\mathbf u\mathbf v${T}$ with $\sigma = ${sig}$, $\mathbf u = ${tupleTeX(uu)}$ and $\mathbf v = \tfrac13${tupleTeX(v)}$. What is its entry in row ${i + 1}, column ${j + 1}?`,
          answer: ans, tol: { rel: 1e-3, abs: 1e-4 },
          errors: [{ value: sig * uu[i] * v[j], feedback: t`Keep the $\tfrac13$ in $\mathbf v$ (it makes $\mathbf v$ a unit vector).` }].filter((e) => Math.abs(e.value - ans) > 1e-4),
          hints: [t`$(\mathbf u\mathbf v${T})_{ij} = u_iv_j$: a column times a row.`, t`Entry $= ${sig}\cdot(${nice(uu[i])})\cdot(${nice(v[j])}/3)$.`],
          teach: 'A rank-1 layer σuvᵀ has entries σuᵢvⱼ: every row is a multiple of vᵀ, every column a multiple of u.',
          explain: t`$${sig}\cdot${nice(uu[i])}\cdot${nice(vv[j])} = ${nice(ans)}$. The whole layer is the $2\times3$ table of products $${sig}u_iv_j$ — six numbers made from $2 + 3 + 1$.`,
          visual: stems([['v', vv, 'warn']], { caption: 'The unit vector v as a stem plot. Each row of the layer is this pattern, scaled by σ times one component of u.' }),
        };
      },
    }),
    num({
      id: 'pca', difficulty: 3,
      gen(r) {
        for (let k = 0; k < 200; k++) {
          const half = [[r.int(1, 4), 0], [r.int(-2, 3), 0], [r.int(1, 3), 0]].map(([x]) => [x, Math.round(x * r.pick([0.5, 1, 1.5, 2, -1, -0.5]) + r.int(-1, 1))]);
          const pts = [...half, ...half.map(([x, y]) => [-x, -y])];
          const Sxx = pts.reduce((s, p) => s + p[0] * p[0], 0), Sxy = pts.reduce((s, p) => s + p[0] * p[1], 0), Syy = pts.reduce((s, p) => s + p[1] * p[1], 0);
          if (Sxy === 0) continue;
          const { q } = eigSym2([[Sxx, Sxy], [Sxy, Syy]]), slope = q[0][1] / q[0][0], reg = Sxy / Sxx;
          if (Math.abs(q[0][0]) < 0.2 || Math.abs(slope - reg) < 0.03 || Math.abs(slope) > 4) continue;
          return {
            prompt: t`Six measurements $(x, y)$, already centred (their mean is $(0, 0)$): $${pts.map(([x, y]) => `(${x}, ${y})`).join(',\\ ')}$. Stack them as the rows of a $6\times2$ matrix $X$. The first principal component is $\mathbf v_1$, the first right singular vector of $X$ — the eigenvector of $X${T}X$ with the larger eigenvalue. What is the slope of the line through the origin along $\mathbf v_1$? (3 significant figures)`,
            answer: slope, tol: { rel: 0.005, abs: 1e-3 },
            errors: [{ value: reg, feedback: t`That is the least-squares regression slope $\sum xy/\sum x^2$, which minimizes vertical distances. The principal axis minimizes perpendicular distances: use the eigenvector of $X${T}X$.` }],
            hints: [t`$X${T}X = \begin{bmatrix} \sum x^2 & \sum xy \\ \sum xy & \sum y^2 \end{bmatrix} = ${matTeX([[Sxx, Sxy], [Sxy, Syy]])}$.`, t`Find its larger eigenvalue $\lambda_1$; then $\mathbf v_1 \propto (\sum xy,\ \lambda_1 - \sum x^2)$, whose slope is $(\lambda_1 - ${Sxx})/${Sxy}$.`],
            teach: 'The first principal component of centred data is the first right singular vector of the data matrix: the direction of greatest spread.',
            explain: t`$\lambda_1 = ${nice(eigSym2([[Sxx, Sxy], [Sxy, Syy]]).l[0], 4)}$, so the slope is $${nice(slope, 3)}$ (the regression slope would be $${nice(reg, 3)}$). Along $\mathbf v_1$ the data spread with variance $\sigma_1^2/(6 - 1)$; across it, $\sigma_2^2/5$. PCA keeps the first few such directions and drops the rest — a rank-$k$ truncation of the data matrix.`,
            visual: { type: 'graph', params: { x: [-7, 7], y: [-5, 5], aspect: 'wide', equal: true, xlabel: 'x', ylabel: 'y', points: pts.map(([x, y]) => ({ x, y, color: 'accent', r: 5 })) }, caption: 'The six centred measurements.' },
          };
        }
        return { prompt: t`Centred data $(1, 1), (-1, -1), (2, 2), (-2, -2), (1, 0), (-1, 0)$: slope of the first principal axis?`, answer: 0.85, tol: { rel: 0.05 }, hints: ['Eigenvector of XᵀX.'], teach: 'PCA.', explain: 'About 0.85.' };
      },
    }),
    code({
      id: 'svd-code', difficulty: 3,
      prompt: t`Make a small synthetic picture in NumPy (no image files) — a bright rectangle and a disc on a dark background — then compress it. Use \`np.linalg.svd(img, full_matrices=False)\` to set \`A_k\`, the rank-$k$ truncation $\sum_{i \le k}\sigma_i\mathbf u_i\mathbf v_i${T}$ for $k = 5$. Set \`err2\` to the spectral norm \`np.linalg.norm(img - A_k, 2)\`, \`errF\` to the Frobenius norm of the same error, and \`stored\` to the numbers kept, $k(m + n + 1)$. The tests check Eckart–Young.`,
      starter: t`import numpy as np

m, n = 48, 64
i, j = np.mgrid[0:m, 0:n]
img = 0.1 + 0.6 * ((i > 8) & (i < 28) & (j > 6) & (j < 36)) + 0.5 * ((i - 30)**2 + (j - 46)**2 < 120)

k = 5
U, s, Vt = None, None, None   # TODO: np.linalg.svd(img, full_matrices=False)
A_k = None                    # TODO: the first k layers
err2 = None
errF = None
stored = None

print(s[:8] if s is not None else None)
`,
      answer: t`import numpy as np

m, n = 48, 64
i, j = np.mgrid[0:m, 0:n]
img = 0.1 + 0.6 * ((i > 8) & (i < 28) & (j > 6) & (j < 36)) + 0.5 * ((i - 30)**2 + (j - 46)**2 < 120)

k = 5
U, s, Vt = np.linalg.svd(img, full_matrices=False)
A_k = (U[:, :k] * s[:k]) @ Vt[:k, :]
err2 = np.linalg.norm(img - A_k, 2)
errF = np.linalg.norm(img - A_k, 'fro')
stored = k * (m + n + 1)

print(s[:8])
`,
      tests: [
        { name: '`A_k` has rank 5', code: 'np.linalg.matrix_rank(A_k, tol=1e-8) == 5' },
        { name: 'the largest stretch of the error is $\\sigma_6$', code: 'abs(err2 - s[5]) < 1e-9' },
        { name: 'the Frobenius error is $\\sqrt{\\sigma_6^2 + \\sigma_7^2 + \\dots}$', code: 'abs(errF - np.sqrt(np.sum(s[5:]**2))) < 1e-9' },
        { name: '`stored` is $k(m + n + 1) = 565$', code: 'stored == 565' },
        { name: 'beats another rank-5 matrix (the first five columns of a QR basis)', code: '(lambda Q: np.linalg.norm(img - Q @ (Q.T @ img), 2) >= err2 - 1e-12)(np.linalg.qr(img[:, :5])[0])' },
      ],
      hints: [t`\`U, s, Vt = np.linalg.svd(img, full_matrices=False)\` gives $U$ ($48\times48$), the singular values as a 1-D array, and $V${T}$.`, t`\`A_k = (U[:, :k] * s[:k]) @ Vt[:k, :]\` scales the first $k$ columns of $U$ by the $\sigma_i$ and multiplies by the first $k$ rows of $V${T}$.`],
      teach: 'numpy.linalg.svd returns U, the singular values and Vᵀ; the first k of each make the best rank-k approximation, with spectral error σₖ₊₁.',
      explain: t`The spectral error equals \`s[5]\` ($\sigma_6$, Python counts from 0) to rounding, and the Frobenius error is the root-sum-square of the rest — Eckart–Young. Any other rank-5 matrix, such as projecting onto five of the picture's own columns, does no better. A disc is not low-rank on its own: its rows come in as many patterns as it has distinct widths, which is why the spectrum here does not stop dead.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-error', difficulty: 2,
      gen(r) {
        const s = spectrum(r, 5), k = r.int(1, 3);
        return {
          prompt: t`Singular values $${s.join(',\\ ')}$. What is the largest stretch of $A - A_${k}$?`,
          answer: s[k], tol: { rel: 1e-3, abs: 1e-3 },
          errors: [{ value: s[k - 1], feedback: t`$\sigma_${k}$ is kept in $A_${k}$.` }],
          hints: [t`Eckart–Young: $\sigma_{k+1}$.`],
          teach: 'The best rank-k approximation leaves an error of largest stretch σₖ₊₁.',
          explain: t`$\sigma_{${k + 1}} = ${s[k]}$.`,
          visual: stems([['σ', s, 'accent']], { labels: s.map((_, i) => `σ${sub(i + 1)}`), xlabel: 'singular value', caption: 'The singular values, largest first.' }),
        };
      },
    }),
    num({
      id: 'cp-pod', difficulty: 3, transfer: true,
      gen(r) {
        const s = spectrum(r, 6), k = r.int(2, 3), tot = s.reduce((a, b) => a + b * b, 0), cap = (100 * s.slice(0, k).reduce((a, b) => a + b * b, 0)) / tot;
        return {
          prompt: t`An engineer runs a CFD simulation of the flow past a nozzle and stacks 500 snapshots of the pressure field (each a column of 20 000 grid values) into a matrix $X$, after subtracting the mean flow. Its leading singular values are $${s.join(',\\ ')}$ (the rest are negligible). In proper orthogonal decomposition, the share of the fluctuation energy captured by the first $k$ modes is $\sum_{i\le k}\sigma_i^2 / \sum_i\sigma_i^2$. What percentage do the first ${k} modes capture? (3 significant figures)`,
          answer: cap, tol: { rel: 0.005 },
          errors: [{ value: (100 * s.slice(0, k).reduce((a, b) => a + b, 0)) / s.reduce((a, b) => a + b, 0), feedback: t`Energy goes with $\sigma^2$, not $\sigma$: square before adding.` }],
          hints: [t`Square each singular value: $${s.map((v) => nice(v * v, 4)).join(',\\ ')}$.`, t`Divide the sum of the first ${k} by the sum of all six.`],
          teach: 'Proper orthogonal decomposition is the SVD of a snapshot matrix; each mode’s share of the energy is its σ² over the total.',
          explain: t`$\sum_{i\le${k}}\sigma_i^2 = ${nice(s.slice(0, k).reduce((a, b) => a + b * b, 0), 5)}$ of $${nice(tot, 5)}$: $${nice(cap, 3)}\%$. A reduced-order model built on these ${k} modes ($\mathbf u_i$, each a pressure pattern) can run thousands of times faster than the full simulation — trusted only for flows like the ones in the snapshots.`,
          visual: stems([['σ', s, 'accent']], { labels: s.map((_, i) => `σ${sub(i + 1)}`), xlabel: 'mode', caption: 'The leading singular values of the snapshot matrix (in arbitrary pressure units).' }),
        };
      },
    }),
    mcq({
      id: 'cp-best', difficulty: 2,
      prompt: t`Which rank-1 matrix is closest to $A$ — the one that makes the largest stretch of the error smallest?`,
      choices: [t`$\sigma_1\mathbf u_1\mathbf v_1${T}$, the first SVD layer`, t`The matrix that keeps $A$'s largest entry and sets the rest to 0`, t`The matrix that keeps $A$'s longest column and sets the other columns to 0`, t`$\lambda_1\mathbf x_1\mathbf x_1${T}$ for $A$'s largest eigenvalue $\lambda_1$ and a unit eigenvector $\mathbf x_1$`],
      answer: 0,
      why: {
        1: t`Entries are tied to the coordinate axes; the best approximation follows the matrix's own axes. For $\begin{bmatrix} 3 & 0 \\ 4 & 5 \end{bmatrix}$ keeping the 5 leaves an error of size about $5.0$, against $\sigma_2 = \sqrt5 \approx 2.24$.`,
        2: t`Keeping a column is a rank-1 matrix too, but Eckart–Young says nothing beats $\sigma_2$, and the column choice generally does worse.`,
        3: t`For a non-symmetric matrix eigenvectors are not the directions of greatest stretch; the shear $\begin{bmatrix} 1 & 4 \\ 0 & 1 \end{bmatrix}$ has $\lambda_1 = 1$ but $\sigma_1 \approx 4.24$.`,
      },
      hints: ['Eckart–Young.'],
      teach: 'The truncated SVD is the best low-rank approximation in both the spectral and the Frobenius norm.',
      explain: t`Eckart–Young: $\|A - B\| \ge \sigma_2$ for every rank-1 $B$, with equality for $B = \sigma_1\mathbf u_1\mathbf v_1${T}$. For symmetric positive semidefinite matrices the SVD and the eigendecomposition coincide, so the last choice is right only there.`,
      visual: imagePic('blocks', 1, 'A picture made of three rectangles and its best rank-1 approximation: one layer already places the largest block.'),
    }),
  ],
  sources: [
    { label: 'Strang, Introduction to Linear Algebra (6th ed.), §7.2–7.3: compressing images, principal component analysis', url: 'https://math.mit.edu/~gs/linearalgebra/ila6/indexila6.html' },
    { label: 'Eckart and Young, “The approximation of one matrix by another of lower rank”, Psychometrika 1, 211 (1936)', url: 'https://doi.org/10.1007/BF02288367' },
    { label: 'Taira et al., “Modal analysis of fluid flows: an overview”, AIAA Journal 55, 4013 (2017)', url: 'https://doi.org/10.2514/1.J056060' },
    { label: 'NumPy documentation: numpy.linalg.svd', url: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.svd.html' },
  ],
});
