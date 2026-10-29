// Chebyshev spectral differentiation — differentiate the polynomial through
// N + 1 Chebyshev points xⱼ = cos(jπ/N): the result is a dense matrix D_N
// (Trefethen's cheb.m; corner entries (2N² + 1)/6). For an analytic function
// the error falls geometrically, like ρ⁻ᴺ with ρ set by the nearest
// singularity (Bernstein ellipse): e^x sin 5x reaches 5 × 10⁻¹⁴ at N = 24,
// where 2nd-order differences sit at 0.3 and 4th-order at 10⁻². Smoothness is
// the price: |x|³ converges only algebraically. Round-off grows like N²ε.
// Interpolation at Chebyshev points is F4.2; this lesson differentiates.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { cheb, matvec, n12, lg, plainSci } from './_ode.js';

const t = String.raw;

// ── errors of Chebyshev, 2nd- and 4th-order centred differences (max over interior points) ──
const FUN = [
  { key: 1, label: t`$e^x\sin 5x$ (analytic everywhere)`, f: (x) => Math.exp(x) * Math.sin(5 * x), df: (x) => Math.exp(x) * (Math.sin(5 * x) + 5 * Math.cos(5 * x)), fn: 'exp(x)*sin(5x)' },
  { key: 2, label: t`$1/(1 + 16x^2)$ (poles at $\pm i/4$)`, f: (x) => 1 / (1 + 16 * x * x), df: (x) => (-32 * x) / (1 + 16 * x * x) ** 2, fn: '1/(1 + 16x^2)' },
  { key: 3, label: t`$\lvert x\rvert^3$ (a kink in the third derivative)`, f: (x) => Math.abs(x) ** 3, df: (x) => 3 * x * Math.abs(x), fn: 'abs(x)^3' },
];
const NS = [6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64];
const chebErr = (F, N) => { const { x, D } = cheb(N); const d = matvec(D, x.map(F.f)); return Math.max(...d.map((v, i) => Math.abs(v - F.df(x[i])))); };
const fd2 = (F, N) => { const h = 2 / N; let e = 0; for (let j = 1; j < N; j++) { const x = -1 + j * h; e = Math.max(e, Math.abs((F.f(x + h) - F.f(x - h)) / (2 * h) - F.df(x))); } return e; };
const fd4 = (F, N) => { const h = 2 / N; let e = 0; for (let j = 2; j < N - 1; j++) { const x = -1 + j * h; e = Math.max(e, Math.abs((-F.f(x + 2 * h) + 8 * F.f(x + h) - 8 * F.f(x - h) + F.f(x - 2 * h)) / (12 * h) - F.df(x))); } return e; };
const ERR = FUN.map((F) => NS.map((N) => ({ N, c: chebErr(F, N), f2: fd2(F, N), f4: fd4(F, N) })));
const wh = (k) => `step(0.5 - abs(fu - ${k}))`;
const pts = (i, key, color, r) => ERR[i].map((e) => ({ x: e.N, y: n12(lg(Math.max(e[key], 1e-16))), r, color, when: wh(FUN[i].key) }));
const E1 = (N) => ERR[0].find((e) => e.N === N);
const C2 = cheb(2), EX2 = matvec(C2.D, C2.x.map(Math.exp));
const RHO_RUNGE = 0.25 + Math.sqrt(1 + 1 / 16);

export default lesson({
  id: 'st-f.F12.1',
  title: 'Chebyshev differentiation',
  minutes: 14, difficulty: 3,
  intro: t`A finite difference uses a few neighbours, so its error falls like a fixed power of the spacing. A **spectral** method uses every point: fit the one polynomial through all $N + 1$ samples and differentiate it exactly. On equispaced points that is Runge’s disaster ([F4.1](#/lesson/st-f.F4.1)); on **Chebyshev points**, clustered towards the ends, it is superb. Differentiating the interpolant is a linear map from samples to derivatives — a matrix:

$$x_j = \cos\frac{j\pi}{N}\ (j = 0, \dots, N), \qquad u'(x_i) \approx \sum_{j=0}^{N}(D_N)_{ij}\,u(x_j)$$

For a function analytic in a region around $[-1, 1]$ the error falls **geometrically**, roughly like $\rho^{-N}$, with $\rho > 1$ set by how far the nearest singularity lies from the interval. Ten more points buy a fixed number of extra digits, until round-off stops it near $N^2\varepsilon$.`,
  symbols: [
    { tex: 'x_j', text: 'the Chebyshev points: projections onto the $x$-axis of equally spaced points on a semicircle — dense near $\\pm1$, sparse in the middle' },
    { tex: 'N', text: 'the polynomial degree; there are $N + 1$ points' },
    { tex: 'D_N', text: 'the $(N+1)\\times(N+1)$ **differentiation matrix**, dense: every derivative uses every sample' },
    { tex: t`\rho`, text: 'the convergence rate: the sum of the semi-axes of the largest ellipse with foci $\\pm1$ in which the function is analytic (its **Bernstein ellipse**)' },
    { tex: t`\varepsilon`, text: 'machine epsilon, $2.2\\times10^{-16}$; the entries of $D_N$ grow like $N^2$, and so does the round-off they amplify' },
  ],
  why: 'Spectral methods give numerical relativity’s binary-black-hole waveforms (the SpEC code), weather and turbulence simulations, and quantum eigenvalue solvers their accuracy: a few dozen points per dimension where finite differences would need thousands.',
  visual: {
    type: 'graph',
    title: 'Geometric against algebraic',
    lead: t`The largest error in $u'$ at the grid points, against $N$, on a **logarithmic** error axis. Blue: Chebyshev spectral differentiation. Red and gold: second- and fourth-order centred differences on $N + 1$ equispaced points. Choose the function.`,
    tasks: [
      t`For $e^x\sin 5x$ the blue points fall in a straight line — geometric convergence — reaching ${plainSci(E1(24).c, 1)} at N = 24, while the differences are still at ${E1(24).f2.toFixed(2)} and ${E1(24).f4.toFixed(3)}.`,
      'Past N ≈ 24 the blue points creep up again: round-off, amplified by D’s entries of size N².',
      `For 1/(1 + 16x²) the line is shallower (poles near the interval: ρ ≈ ${RHO_RUNGE.toFixed(2)}). For |x|³ there is no line at all: one rough spot costs spectral accuracy everywhere.`,
    ],
    params: {
      x: [0, 67], y: [-15, 1.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N (polynomial degree)', ylabel: 'max |error in u′|',
      choices: [{ key: 'fu', label: 'Function', options: FUN.map((F) => [F.key, F.label]), value: 1, explain: 'How far the function’s nearest singularity lies from [−1, 1] sets the spectral rate.' }],
      points: FUN.flatMap((F, i) => [...pts(i, 'f2', 'bad', 3.5), ...pts(i, 'f4', 'gold', 3.5), ...pts(i, 'c', 'accent', 4.5)]),
      legend: [{ label: 'Chebyshev', color: 'accent', point: true }, { label: '4th-order differences', color: 'gold', point: true }, { label: '2nd-order differences', color: 'bad', point: true }], legendAt: 'tr',
    },
    caption: 'Computed in float64 with the differentiation matrix of Trefethen’s cheb.m (diagonal by the negative-sum trick). Differences use only interior points where their stencil fits; errors below 10⁻¹⁵ are drawn at that level.',
  },
  example: {
    prompt: t`Build $D_2$ for the three points $x = 1, 0, -1$ and apply it to $u = e^x$. Then compare spectral differentiation of $u = e^x\sin 5x$ with finite differences at equal numbers of points.`,
    visual: {
      type: 'graph',
      params: { x: [-1.1, 1.1], y: [-0.12, 1.12], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', yticks: 0,
        curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, Math.PI], color: 'ink4', width: 1.4 }],
        points: [...Array.from({ length: 13 }, (_, j) => ({ x: n12(Math.cos((j * Math.PI) / 12)), y: n12(Math.sin((j * Math.PI) / 12)), r: 3.5, color: 'ink3' })), ...Array.from({ length: 13 }, (_, j) => ({ x: n12(Math.cos((j * Math.PI) / 12)), y: 0, r: 4.5, color: 'accent' }))],
        arrows: Array.from({ length: 13 }, (_, j) => ({ from: [n12(Math.cos((j * Math.PI) / 12)), n12(Math.sin((j * Math.PI) / 12) - 0.04)], to: [n12(Math.cos((j * Math.PI) / 12)), 0.05], color: 'ink4', width: 1 })) },
      caption: 'The 13 Chebyshev points for N = 12 (blue): equally spaced angles on a semicircle, projected down. They crowd towards ±1 like 1/N² there, and are π/N apart in the middle.',
    },
    steps: [
      { label: 'The interpolant', text: t`Through $(1, u_0)$, $(0, u_1)$, $(-1, u_2)$ the parabola is $p(x) = u_1 + \tfrac12(u_0 - u_2)x + \tfrac12(u_0 - 2u_1 + u_2)x^2$. Its derivative $p'(x) = \tfrac12(u_0 - u_2) + (u_0 - 2u_1 + u_2)x$.` },
      { label: 'The matrix', text: t`Evaluate $p'$ at $x = 1, 0, -1$:
$$D_2 = \begin{pmatrix}\tfrac32 & -2 & \tfrac12\\[2pt] \tfrac12 & 0 & -\tfrac12\\[2pt] -\tfrac12 & 2 & -\tfrac32\end{pmatrix}$$
The middle row is the centred difference; the edge rows are one-sided. Each row sums to 0, because a constant has zero derivative.` },
      { label: 'Apply it', text: t`$D_2(e, 1, e^{-1})^{\mathsf T} = (${EX2.map((v) => v.toFixed(4)).join(',\\ ')})$ against the true $(${C2.x.map((x) => Math.exp(x).toFixed(4)).join(',\\ ')})$. Poor — three points are too few — but every larger $N$ uses the same recipe; \`cheb(N)\` builds $D_N$ in a few lines.` },
      { label: 'Ten to twenty points', text: t`For $e^x\sin5x$: with $N = 10$ the spectral error is $${tex(E1(10).c, 2)}$, with $N = 20$ it is $${tex(E1(20).c, 2)}$, and with $N = 24$ it is $${tex(E1(24).c, 1)}$. Second-order differences on the same 25 points give $${E1(24).f2.toFixed(2)}$, fourth-order $${tex(E1(24).f4, 2)}$.` },
      { label: 'What differences would need', text: t`Fourth order falls like $N^{-4}$: from $${tex(E1(64).f4, 2)}$ at $N = 64$, reaching $10^{-9}$ needs $N \approx 64\times(${tex(E1(64).f4 / 1e-9, 2)})^{1/4} \approx ${Math.round(64 * (E1(64).f4 / 1e-9) ** 0.25)}$. Second order would need $N$ in the hundreds of thousands. The spectral method needed 20.` },
      { label: 'The catch', text: t`$D_N$ is dense (cost $N^2$ per derivative, or $N\log N$ by FFT), its entries grow like $N^2$ — the corner one is $(2N^2 + 1)/6$ — so round-off grows too, and the geometric rate needs smoothness everywhere on the interval. A shock or a kink drags it down to algebraic.` },
    ],
    answer: t`$D_2$ as in the second step (rows: one-sided, centred, one-sided); for $e^x\sin5x$ the spectral error is $${tex(E1(20).c, 1)}$ at $N = 20$, where 4th-order differences manage $${tex(E1(20).f4, 1)}$.`,
  },
  practice: [
    num({
      id: 'cheb-point', difficulty: 1,
      gen(r) {
        const N = r.pick([6, 8, 12, 16]), j = r.int(1, N / 2 - 1), ans = Math.cos((j * Math.PI) / N);
        return {
          prompt: t`What is the Chebyshev point $x_{${j}}$ for $N = ${N}$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.1, 1.1], y: [-0.15, 1.15], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', yticks: 0,
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, Math.PI], color: 'ink4', width: 1.4 }],
              points: Array.from({ length: N + 1 }, (_, k) => ({ x: n12(Math.cos((k * Math.PI) / N)), y: n12(Math.sin((k * Math.PI) / N)), r: 3.5, color: k === j ? 'gold' : 'ink3', label: k === j ? `j = ${j}` : '' })) },
            caption: 'Equally spaced angles on the semicircle; the gold one projects down to the point asked for.',
          },
          answer: ans, tol: { rel: 0, abs: 5e-4 },
          errors: [{ value: 1 - (2 * j) / N, feedback: 'That is the equispaced point. Chebyshev points are cos(jπ/N): projections of equal angles.' }, { value: Math.cos((j * 180) / N), feedback: 'Your calculator is in degrees: the angle jπ/N is in radians.' }],
          hints: [t`$x_j = \cos(j\pi/N)$, counting from $x_0 = 1$.`, t`$\cos(${j}\pi/${N})$.`],
          teach: 'Chebyshev points are the shadows of equally spaced points on a semicircle, so they bunch up near ±1.',
          explain: t`$x_{${j}} = \cos(${j}\pi/${N}) = ${ans.toFixed(4)}$. Near the ends the spacing is about $\pi^2/(2N^2)$, in the middle $\pi/N$.`,
        };
      },
    }),
    num({
      id: 'corner', difficulty: 2,
      gen(r) {
        const N = r.pick([8, 16, 32, 64]), ans = (2 * N * N + 1) / 6;
        return {
          prompt: t`The corner entry of the Chebyshev differentiation matrix is $(D_N)_{00} = \dfrac{2N^2 + 1}{6}$. What is it for $N = ${N}$, and what does its size say about round-off?`,
          visual: {
            type: 'graph',
            params: { x: [0, 70], y: [0, 1.15 * ((2 * 64 * 64 + 1) / 6)], aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: 'corner entry',
              curves: [{ fn: '(2x^2 + 1)/6', color: 'accent', width: 2.2, domain: [1, 68] }] },
            caption: 'The corner entry grows like N²/3.',
          },
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: (2 * N + 1) / 6, feedback: 'N is squared: (2N² + 1)/6.' }],
          hints: [t`$2\times${N}^2 + 1 = ${2 * N * N + 1}$.`, 'Divide by 6.'],
          teach: t`The entries of $D_N$ grow like $N^2$, so a sample’s round-off $\varepsilon$ is amplified to about $N^2\varepsilon$ in the derivative.`,
          explain: t`$(D_{${N}})_{00} = ${n12(ans)}$. Rounding errors of size $\varepsilon\lvert u\rvert$ in the samples become errors of about $${n12(ans)}\varepsilon \approx ${tex(ans * 2.2e-16, 1)}$ in $u'$ — the floor in the Explore. A second derivative ($D_N^2$) amplifies by $N^4$.`,
        };
      },
    }),
    num({
      id: 'points-needed', difficulty: 3,
      gen(r) {
        const a = r.pick([0.1, 0.25, 0.5, 1]), d = r.pick([8, 10, 12]);
        const rho = a + Math.sqrt(1 + a * a), ans = d / lg(rho);
        return {
          prompt: t`The function $1/(x^2 + ${n12(a * a)})$ has poles at $x = \pm${a}i$, so its Chebyshev derivative error falls roughly like $\rho^{-N}$ with $\rho = ${a} + \sqrt{1 + ${a}^2}$. Roughly what $N$ brings $\rho^{-N}$ down to $10^{-${d}}$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.6, 1.6], y: [-1.2, 1.2], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'Re x', ylabel: 'Im x',
              curves: [{ param: [`${n12((rho + 1 / rho) / 2)}*cos(t)`, `${n12((rho - 1 / rho) / 2)}*sin(t)`], t: [0, 2 * Math.PI], color: 'gold', width: 1.8 }, { param: ['t', '0'], t: [-1, 1], color: 'accent', width: 4 }],
              points: [{ x: 0, y: a, r: 5, color: 'bad', label: 'pole' }, { x: 0, y: -a, r: 5, color: 'bad' }] },
            caption: 'The interval [−1, 1] (blue), the poles (red), and the Bernstein ellipse through them (gold): foci ±1, semi-axes summing to ρ.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: d / Math.log(rho), feedback: 'Use the base-10 logarithm, since the target is a power of 10.' }],
          hints: [t`$\rho = ${rho.toFixed(4)}$.`, t`$N = ${d}/\log_{10}\rho$.`],
          teach: 'The closer a singularity sits to the interval, the smaller ρ and the more points spectral accuracy costs — but the cost grows only logarithmically with the accuracy.',
          explain: t`$\rho = ${rho.toFixed(4)}$, $N \approx ${d}/${lg(rho).toFixed(4)} = ${ans.toFixed(0)}$. The true error carries an extra factor that grows like a power of $N$, so add a few points; doubling the digits wanted only doubles $N$.`,
        };
      },
    }),
    mcq({
      id: 'why-cheb', difficulty: 2,
      prompt: t`Why not differentiate the interpolating polynomial through $N + 1$ **equally spaced** points instead?`,
      visual: {
        type: 'graph',
        params: { x: [-1.05, 1.05], y: [-0.6, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'u',
          curves: [{ fn: '1/(1 + 25x^2)', color: 'ink3', width: 2.4 }],
          points: Array.from({ length: 13 }, (_, j) => ({ x: n12(-1 + j / 6), y: n12(1 / (1 + 25 * (-1 + j / 6) ** 2)), r: 4, color: 'bad' })) },
        caption: 'Runge’s function sampled at 13 equally spaced points: the degree-12 interpolant through them swings wildly near the ends (F4.1).',
      },
      choices: [
        'The equispaced interpolant can oscillate wildly near the ends (Runge’s phenomenon), and its derivative is worse still; Chebyshev points avoid that',
        'Equally spaced points need more function evaluations',
        'Derivatives of polynomials cannot be computed exactly',
        'Chebyshev points make the differentiation matrix sparse',
      ],
      answer: 0,
      why: {
        1: 'Both use N + 1 samples; the difference is where they sit.',
        2: 'Differentiating a polynomial is exact; the error is in the interpolant.',
        3: t`$D_N$ is dense for any set of points — each derivative uses every sample.`,
      },
      hints: ['Recall F4.1: what happens to equispaced interpolation as N grows?', 'Differentiation magnifies wiggles.'],
      teach: 'Spectral differentiation is only as good as the interpolant behind it; Chebyshev points make that interpolant converge for every analytic function.',
      explain: t`On equispaced points the interpolation error grows like $2^N$ near the ends for functions such as Runge’s, and the derivative inherits it. Clustering the points as $\cos(j\pi/N)$ tames the nodal polynomial (see [F4.2](#/lesson/st-f.F4.2)), giving geometric convergence.`,
    }),
    mcq({
      id: 'kink', difficulty: 3,
      prompt: t`Spectral differentiation of $\lvert x\rvert^3$ on $[-1, 1]$ converges only algebraically — the error falls like a power of $N$, not geometrically. Why?`,
      visual: {
        type: 'graph',
        params: { x: [0, 67], y: [-6, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: 'max |error|',
          points: [...pts(2, 'c', 'accent', 4.5), ...pts(2, 'f4', 'gold', 3.5)].map((p) => ({ ...p, when: undefined })),
          legend: [{ label: 'Chebyshev', color: 'accent', point: true }, { label: '4th-order differences', color: 'gold', point: true }], legendAt: 'tr' },
        caption: 'Errors for |x|³: both curve gently instead of plunging.',
      },
      choices: [
        t`$\lvert x\rvert^3$ is not analytic at $x = 0$ (its third derivative jumps), so no Bernstein ellipse of analyticity exists; smoothness of finite order gives only algebraic convergence`,
        t`The Chebyshev points miss $x = 0$`,
        'Round-off error dominates',
        'The function is too large near the ends',
      ],
      answer: 0,
      why: {
        1: 'For even N, x = 0 is a Chebyshev point; the trouble is the kink, not the sampling.',
        2: 'The errors here are 10⁻³ and up, far above round-off.',
        3: 'Size does not matter; smoothness does.',
      },
      hints: ['What does the geometric rate ρ⁻ᴺ need of the function?', 'Differentiate |x|³ three times.'],
      teach: 'Spectral accuracy is a reward for smoothness: k continuous derivatives give roughly N⁻ᵏ, analyticity gives ρ⁻ᴺ.',
      explain: t`Its third derivative jumps at 0, so the Chebyshev coefficients decay only like $N^{-4}$, and the derivative’s error like a low power of $N$. Here Chebyshev is no better than fourth-order differences. Where solutions have shocks or kinks (matter in numerical relativity, for example), spectral codes switch to other methods there or split the domain at the rough point.`,
    }),
    code({
      id: 'cheb-code', difficulty: 3,
      prompt: t`Write \`cheb(N)\` returning the points \`x\` ($x_j = \cos(j\pi/N)$) and the matrix \`D\`, with off-diagonal entries $D_{ij} = \dfrac{c_i}{c_j}\,\dfrac{(-1)^{i+j}}{x_i - x_j}$, $c_0 = c_N = 2$, other $c_j = 1$, and each diagonal entry set so its row sums to zero. Then \`err\` is the largest error of $D\,u$ for $u = e^x\sin5x$ at $N = 20$.`,
      starter: t`import numpy as np

def cheb(N):
    x = np.cos(np.pi * np.arange(N + 1) / N)
    D = np.zeros((N + 1, N + 1))
    # off-diagonal entries, then the diagonal from the row sums
    return x, D

x, D = cheb(20)
u = np.exp(x) * np.sin(5 * x)
du = np.exp(x) * (np.sin(5 * x) + 5 * np.cos(5 * x))
err = np.max(np.abs(D @ u - du))
print(err)
`,
      answer: t`import numpy as np

def cheb(N):
    x = np.cos(np.pi * np.arange(N + 1) / N)
    c = np.ones(N + 1)
    c[0] = c[N] = 2.0
    D = np.zeros((N + 1, N + 1))
    for i in range(N + 1):
        for j in range(N + 1):
            if i != j:
                D[i, j] = (c[i] / c[j]) * (-1) ** (i + j) / (x[i] - x[j])
    D[np.arange(N + 1), np.arange(N + 1)] = -D.sum(axis=1)
    return x, D

x, D = cheb(20)
u = np.exp(x) * np.sin(5 * x)
du = np.exp(x) * (np.sin(5 * x) + 5 * np.cos(5 * x))
err = np.max(np.abs(D @ u - du))
print(err)`,
      tests: [
        { name: t`$D_2$ matches the worked example`, code: 'np.allclose(cheb(2)[1], [[1.5, -2, 0.5], [0.5, 0, -0.5], [-0.5, 2, -1.5]])' },
        { name: t`the corner entry of $D_{16}$ is $(2\cdot16^2 + 1)/6$`, code: 'abs(cheb(16)[1][0, 0] - (2 * 16**2 + 1) / 6) < 1e-10' },
        { name: t`at $N = 20$ the derivative of $e^x\sin5x$ is right to $10^{-8}$`, code: 'err < 1e-8' },
        { name: t`it differentiates $x^5$ exactly at $N = 6$`, code: 'np.allclose(cheb(6)[1] @ cheb(6)[0]**5, 5 * cheb(6)[0]**4, atol=1e-12)' },
      ],
      hints: ['Loop over i ≠ j for the off-diagonal formula; (−1)**(i + j) gives the sign.', 'Then set D[i, i] = −(sum of the rest of row i): with the diagonal still zero, that is −D.sum(axis=1).'],
      teach: 'The negative-sum diagonal makes D annihilate constants exactly and is more accurate in floating point than the closed-form diagonal.',
      explain: t`The error at $N = 20$ is about $${tex(E1(20).c, 1)}$. Twenty-one points differentiate a polynomial of degree 20 exactly, and $e^x\sin5x$ is so close to one that the difference is invisible.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-spec', difficulty: 2, transfer: true,
      prompt: t`The SpEC code that simulated thousands of binary-black-hole mergers for LIGO waveform models uses spectral methods for the spacetime fields. What makes that a good choice?`,
      visual: {
        type: 'graph',
        params: { x: [0, 67], y: [-15, 1.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: 'error',
          points: [...pts(0, 'c', 'accent', 4.5), ...pts(0, 'f4', 'gold', 3.5)].map((p) => ({ ...p, when: undefined })) },
        caption: 'Spectral (blue) against 4th-order differences (gold) for a smooth function.',
      },
      choices: [
        'Vacuum spacetime fields are smooth (analytic away from the excised horizons), so spectral accuracy gives very high precision with few points per dimension — vital in 3D',
        'Spectral methods are the only ones that work in three dimensions',
        'Spectral methods handle shocks better than finite differences',
        'Spectral differentiation matrices are sparse, so they are cheap',
      ],
      answer: 0,
      why: {
        1: 'Finite-difference and finite-volume NR codes also work in 3D; spectral ones are more accurate per point for smooth fields.',
        2: 'The opposite: shocks destroy spectral accuracy, which is why matter is often handled with other methods.',
        3: 'They are dense; the gain is in needing far fewer points.',
      },
      hints: ['What property of the function makes the spectral error fall geometrically?', 'In 3D, how does cost grow with points per dimension?'],
      teach: 'Spectral methods win where solutions are smooth and the dimension is high: fewer points per dimension, compounded cubically.',
      explain: t`Halving the points per dimension cuts a 3D grid eightfold. With smooth fields, spectral methods reach waveform accuracies that finite differences would need far finer grids for. Where matter forms shocks, codes switch methods in those regions.`,
    }),
    num({
      id: 'cp-pole', difficulty: 3, transfer: true,
      gen(r) {
        const x0 = r.pick([1.2, 1.5, 2, 3]), d = r.pick([10, 12]), rho = x0 + Math.sqrt(x0 * x0 - 1), ans = d / lg(rho);
        return {
          prompt: t`A potential along a probe’s path, rescaled to $[-1, 1]$, behaves like $1/(x - ${x0})$: a singularity just beyond the end of the interval. Its Chebyshev derivative error falls roughly like $\rho^{-N}$ with $\rho = ${x0} + \sqrt{${x0}^2 - 1}$. About what $N$ makes $\rho^{-N} = 10^{-${d}}$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.2, x0 + 0.4], y: [-2, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'u',
              curves: [{ fn: `1/(x - ${x0})`, color: 'accent', width: 2.2, domain: [-1, 1] }, { fn: `1/(x - ${x0})`, color: 'ink4', width: 1.4, dash: true, domain: [1, x0 - 0.12] }],
              vlines: [{ x: x0, color: 'bad', label: 'singularity' }] },
            caption: 'The function on the interval (solid) and beyond it (dashed), towards the singularity.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: d / Math.log(rho), feedback: 'Use log₁₀, since the target is a power of ten.' }],
          hints: [t`$\rho = ${rho.toFixed(4)}$.`, t`$N = ${d}/\log_{10}\rho$.`],
          teach: 'A real singularity a distance beyond the end of the interval also limits ρ; the nearer it is, the slower the convergence.',
          explain: t`$\rho = ${rho.toFixed(3)}$, so $N \approx ${ans.toFixed(0)}$ (a few more in practice, for the algebraic prefactor). Mapping the variable to stretch the region near the singularity, or splitting the domain, raises $\rho$.`,
        };
      },
    }),
    num({
      id: 'cp-fd-cost', difficulty: 3,
      gen(r) {
        const e0 = r.pick([2e-3, 5e-3, 1e-2]), N0 = r.pick([50, 100]), tgt = r.pick([1e-8, 1e-10]);
        const ans = N0 * (e0 / tgt) ** 0.25;
        return {
          prompt: t`Fourth-order differences give a derivative error of $${tex(e0, 1)}$ with $N = ${N0}$ intervals. Assuming the error falls like $N^{-4}$, how many intervals for $${tex(tgt, 1)}$?`,
          visual: {
            type: 'graph',
            params: { x: [lg(N0) - 0.2, lg(ans) + 0.3], y: [lg(tgt) - 0.5, lg(e0) + 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: 'error',
              curves: [{ fn: `${n12(lg(e0))} - 4*(x - ${n12(lg(N0))})`, color: 'gold', width: 2, dash: true }], points: [{ x: n12(lg(N0)), y: n12(lg(e0)), r: 5, color: 'gold' }], hlines: [{ y: n12(lg(tgt)), color: 'ink3', label: 'target' }] },
            caption: 'An N⁻⁴ law on log–log axes: slope −4.',
          },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: N0 * (e0 / tgt) ** 0.5, feedback: 'That is second-order scaling. Fourth order: take the fourth root.' }],
          hints: [t`If $E \propto N^{-4}$, then $N \propto E^{-1/4}$.`, t`$N = ${N0}\times(${tex(e0, 1)}/${tex(tgt, 1)})^{1/4}$.`],
          teach: 'Algebraic convergence makes each extra digit cost a fixed factor in points; geometric convergence makes it cost a fixed number of points.',
          explain: t`$N \approx ${Math.round(ans)}$. A spectral method on a smooth function might need a few dozen.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Trefethen, Spectral Methods in MATLAB (SIAM 2000), ch. 6: Chebyshev differentiation matrices', url: 'https://doi.org/10.1137/1.9780898719598' },
    { label: 'Trefethen, Approximation Theory and Approximation Practice (SIAM 2019), ch. 8: convergence for analytic functions', url: 'https://doi.org/10.1137/1.9781611975949' },
    { label: 'Boyle et al. (2019), The SXS collaboration catalog of binary black hole simulations, Class. Quantum Grav. 36, 195006', url: 'https://doi.org/10.1088/1361-6382/ab34e2' },
  ],
});
