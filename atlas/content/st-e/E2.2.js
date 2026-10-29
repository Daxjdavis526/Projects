// The Gibbs phenomenon: the overshoot of (Si(π)/π − ½)·J ≈ 8.95% of any jump
// J, proved from the closed form of the square wave's partial sum; its
// location π/(N+1); why it never shrinks in height; and the cures — Fejér
// averages (a positive kernel, no overshoot, more blur) and Lanczos σ-factors.
import { lesson, mcq, num, order, code } from '../../src/core/content.js';
import * as FS from '../../src/viz/model/fa-series.js';
import { tex } from '../../src/core/format.js';
import { SRC, series, GIBBS_PEAK, GIBBS_FRAC, SI_PI, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
const PEAK19 = FS.peak('square', 19).y, LANCZOS = FS.peak('square', 99, 'lanczos').y;

export default lesson({
  id: 'st-e.E2.2',
  title: 'The Gibbs phenomenon',
  minutes: 15, difficulty: 3,
  intro: t`Wherever $f$ jumps by $J$, every partial sum of its Fourier series overshoots — and the overshoot does **not** shrink as $N$ grows. It only gets narrower:

$$\lim_{N\to\infty}\Big(\max S_Nf - f(x_0^+)\Big) = \Big(\frac{\operatorname{Si}(\pi)}{\pi} - \frac12\Big)J \approx ${r4(GIBBS_FRAC)}\,J$$

for a jump upward at $x_0$ (and the same undershoot below on the other side). The number is universal — the same for a square wave, a sawtooth or a density profile with a sharp edge — because near any jump $f$ looks like a step plus something continuous. Wilbraham found it in 1848, Gibbs again in 1899. It is why truncated spectra ring at edges, and why the cure is to **taper** the coefficients rather than to keep more of them.`,
  symbols: [
    { tex: 'J', text: 'the size of the jump, $f(x_0^+) - f(x_0^-)$, in units of $f$' },
    { tex: 'x_0', text: 'where $f$ jumps' },
    { tex: 'S_Nf', text: 'the partial sum with harmonics up to $N$' },
    { tex: '\\operatorname{Si}(\\pi)', text: t`the sine integral $\int_0^{\pi}\frac{\sin u}{u}\,du = ${r4(SI_PI)}$` },
  ],
  why: t`Spectral codes in numerical relativity, MRI scanners and digital filters all truncate a series; at a stellar surface, a tissue boundary or a pressure step the 9% ringing appears, and can make a density negative.`,
  visual: {
    type: 'fa-series',
    title: 'The overshoot that will not go away',
    lead: t`The partial sum near each jump, with the gold lines at the Gibbs limit. The readouts give the highest point of $S_N$ and the overshoot as a share of the jump.`,
    tasks: [
      'Square wave: raise N from 5 to 200. The peak moves toward the jump but its height settles near 1.179 — 8.95% of the jump of 2.',
      'Switch to Fejér averages: the overshoot vanishes, but the edge is visibly blurrier.',
      'Try Lanczos σ-factors: a sharp edge with an overshoot near 1%.',
    ],
    params: { wave: 'square', waves: ['square', 'saw', 'pulse'], N: 15, Nmax: 200, method: 'dirichlet', methods: ['dirichlet', 'fejer', 'lanczos'], panels: ['x'], gibbs: true, mark: true, probe: false, readouts: ['N', 'peak', 'over'] },
    caption: 'Exact coefficients; the peak is found by search. The gold lines sit 8.95% of the jump beyond each side. A sawtooth’s peak approaches the limit more slowly than a square wave’s (its slope adds a correction of order 1/N).',
  },
  example: {
    prompt: t`Prove that the peak of the square wave’s partial sums tends to $\tfrac2\pi\operatorname{Si}(\pi)$. The square wave is $\operatorname{sign}x$, with $S_Nf(x) = \dfrac4\pi\displaystyle\sum_{k=1}^{K}\dfrac{\sin(2k - 1)x}{2k - 1}$ and $N = 2K - 1$.`,
    visual: series({ wave: 'square', N: 19, panels: ['x'], gibbs: true, mark: true, probe: false, window: [-0.4, 1.6] }, 'Near the jump at x = 0: the partial sum with N = 19 and its first peak, at x = π/20.'),
    steps: [
      { label: 'Differentiate', text: t`$S_N'(x) = \dfrac4\pi\displaystyle\sum_{k=1}^{K}\cos(2k - 1)x = \dfrac{2}{\pi}\,\dfrac{\sin 2Kx}{\sin x}$ — a geometric sum, as for the Dirichlet kernel.` },
      { label: 'Integrate back', text: t`$S_N(0) = 0$, so $S_N(x) = \dfrac2\pi\displaystyle\int_0^{x}\frac{\sin 2Kt}{\sin t}\,dt$.` },
      { label: 'Find the peak', text: t`$S_N' = 0$ first at $2Kx = \pi$: the first (and highest) maximum is at $x = \dfrac{\pi}{2K} = \dfrac{\pi}{N + 1}$ — closer to the jump as $N$ grows.` },
      { label: 'Rescale', text: t`Put $t = u/2K$: $\;S_N\big(\tfrac{\pi}{2K}\big) = \dfrac2\pi\displaystyle\int_0^{\pi}\frac{\sin u}{2K\sin(u/2K)}\,du$. As $K \to \infty$, $2K\sin(u/2K) \to u$ uniformly on $[0, \pi]$.` },
      { label: 'The limit', text: t`$S_N\big(\tfrac{\pi}{N+1}\big) \to \dfrac2\pi\displaystyle\int_0^{\pi}\frac{\sin u}{u}\,du = \dfrac2\pi\operatorname{Si}(\pi) = ${r4(GIBBS_PEAK)}$. For $N = 19$ the peak is already $${r4(PEAK19)}$.` },
      { label: 'Universal', text: t`The overshoot $${r4(GIBBS_PEAK - 1)}$ is $${r3(100 * GIBBS_FRAC)}\%$ of the jump $2$. Any piecewise smooth $f$ with a jump $J$ is $\tfrac{J}{2}\operatorname{sign}(x - x_0)$ plus a function continuous at $x_0$, whose series converges uniformly nearby — so the same fraction appears at every jump.` },
    ],
    answer: t`The peak sits at $x = \pi/(N+1)$ and its height tends to $\tfrac2\pi\operatorname{Si}(\pi) = ${r4(GIBBS_PEAK)}$: an overshoot of $${r3(100 * GIBBS_FRAC)}\%$ of the jump, independent of $N$ — only its width, about $\pi/N$, shrinks.`,
  },
  practice: [
    num({
      id: 'jump-levels', difficulty: 2,
      gen(r) {
        const [lo, hi] = r.pick([[0, 5], [2, 7], [-1, 3], [10, 40], [1, 1.5]]);
        const J = hi - lo, ans = hi + GIBBS_FRAC * J;
        return {
          prompt: t`A periodic signal sits at $${lo}$ for half of each period and at $${hi}$ for the other half. As more harmonics are kept, what value does the highest point of its partial sums approach?`,
          visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [lo - 0.35 * J, hi + 0.35 * J], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `${lo} + ${J}*step(x)`, color: 'ink3', dash: [5, 4], width: 1.4, domain: [-3.14, 3.14] }, { sum: `${(lo + hi) / 2}*step(1.5 - k) + ${J / 2}*4/((2k - 1)*pi)*sin((2k - 1)*x)`, k: [1, 12], color: 'accent', width: 2.2 }] }, caption: 'The signal (dashed) and a partial sum with 12 odd harmonics.' },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: hi + GIBBS_FRAC * hi, feedback: 'The overshoot is a fraction of the jump, not of the level: a constant shift of the whole signal changes nothing.' }, { value: hi * GIBBS_PEAK, feedback: t`Multiplying the level by 1.179 is only right for a jump from $-1$ to $+1$. Scale with the jump $J = ${J}$.` }, { value: hi, feedback: 'The overshoot never dies away; it only narrows.' }].filter((e) => Math.abs(e.value - ans) > 0.003 * Math.abs(ans)),
          hints: [t`The jump is $J = ${hi} - (${lo}) = ${J}$.`, t`The peak tends to the upper level plus $${r4(GIBBS_FRAC)}J$.`],
          teach: 'Gibbs overshoot is 8.95% of the jump, added beyond the upper level; adding a constant to f moves everything together.',
          explain: t`$${hi} + ${r4(GIBBS_FRAC)}\times${J} = ${r4(ans)}$. (Symmetrically, the lowest point tends to $${r4(lo - GIBBS_FRAC * J)}$.)`,
        };
      },
    }),
    num({
      id: 'peak-location', difficulty: 2,
      gen(r) {
        const N = r.pick([9, 19, 49, 99, 199]);
        const ans = PI / (N + 1);
        return {
          prompt: t`The square wave $\operatorname{sign}x$ is summed with harmonics up to $N = ${N}$. How far from the jump at $x = 0$ is the first (highest) peak of the partial sum? Give radians.`,
          visual: series({ wave: 'square', N: Math.min(N, 49), panels: ['x'], gibbs: true, probe: false, window: [-0.3, 1.2] }, `Near the jump (drawn here with N = ${Math.min(N, 49)}).`),
          answer: ans, units: 'rad', tol: { rel: 0.005 },
          errors: [{ value: PI / N, feedback: t`Close: with $N = 2K - 1$ the derivative $\frac{2}{\pi}\frac{\sin2Kx}{\sin x}$ first vanishes at $2Kx = \pi$, i.e. $x = \pi/(N + 1)$.` }, { value: PI / (2 * (N + 1)), feedback: t`$\sin 2Kx$ first vanishes at $2Kx = \pi$, not $\pi/2$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$S_N'(x) = \frac2\pi\frac{\sin2Kx}{\sin x}$ with $N = 2K - 1$.`, t`The first zero of $\sin 2Kx$ for $x > 0$ is at $x = \pi/2K$.`],
          teach: 'The Gibbs peak sits at π/(N + 1) from the jump: it moves in, it does not shrink.',
          explain: t`$x = \pi/(N + 1) = \pi/${N + 1} = ${tex(ans)}$ rad. Its height is $${r4(FS.peak('square', N).y)}$ — essentially the limit $${r4(GIBBS_PEAK)}$.`,
        };
      },
    }),
    mcq({
      id: 'fejer-why', difficulty: 3,
      prompt: t`The Fejér mean $\sigma_Nf$ averages the partial sums $S_0f, \dots, S_Nf$. It equals $\frac1{2\pi}\int f(y)\,F_N(x - y)\,dy$ with the **Fejér kernel** $F_N(x) = \dfrac{1}{N + 1}\left(\dfrac{\sin\frac{(N+1)x}{2}}{\sin\frac x2}\right)^2$ (blue) instead of the Dirichlet kernel (dashed). Why can $\sigma_Nf$ never overshoot?`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-3, 12], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'sin(5.5x)/sin(x/2)', color: 'ink3', width: 1.5, dash: [6, 4], samples: 1500 }, { fn: '(sin(3x)/sin(x/2))^2/6', color: 'accent', width: 2.3, samples: 1500 }] }, caption: 'Both kernels for N = 5, each with area 2π. Only the Dirichlet kernel (dashed) goes negative.' },
      choices: [t`$F_N \ge 0$ with area $2\pi$, so $\sigma_Nf(x)$ is a weighted average of values of $f$ and lies between $\min f$ and $\max f$`, 'it keeps fewer harmonics than the partial sum', 'it converges faster in mean square than the partial sum', 'its kernel is narrower than the Dirichlet kernel'],
      answer: 0,
      why: {
        1: 'It keeps the same harmonics, n ≤ N, only with smaller weights. Fewer harmonics in a plain sum would still overshoot.',
        2: 'It converges more slowly in mean square: the plain partial sum is the best approximation of degree N.',
        3: 'It is not narrower — its central lobe is about twice as wide. Positivity, not width, is what matters.',
      },
      hints: ['Look at the sign of each kernel.', 'An average with nonnegative weights summing to 1 cannot exceed the largest value averaged.'],
      teach: 'A positive kernel with unit weight gives an average, and an average cannot overshoot; the Dirichlet kernel’s negative lobes are the source of Gibbs.',
      explain: t`$F_N$ is a square divided by a positive number, so it is never negative, and its area is $2\pi$. So $\sigma_Nf(x)$ is an average of values of $f$: it lies between $\min f$ and $\max f$. The Dirichlet kernel’s negative side lobes are what push $S_Nf$ past the jump. Fejér’s theorem goes further: $\sigma_Nf \to f$ **uniformly** for every continuous $f$.`,
    }),
    mcq({
      id: 'fejer-cost', difficulty: 3,
      prompt: t`For the square wave with $N = 19$, compare the mean-square errors $\lVert f - S_Nf\rVert$ of the plain partial sum and $\lVert f - \sigma_Nf\rVert$ of the Fejér mean. Which is smaller, and why?`,
      visual: { type: 'fa-series', params: { wave: 'square', N: 19, panels: ['x'], method: 'fejer', methods: ['dirichlet', 'fejer'], controls: ['method'], probe: false, readouts: [] }, caption: 'The same 19 harmonics, plainly summed or Fejér-averaged: switch between them.' },
      choices: ['the plain sum’s, always: it is the orthogonal projection, the best approximation of degree N', 'the Fejér mean’s, because it has no overshoot', 'they are equal, since both use the same harmonics', 'the Fejér mean’s, because it converges uniformly'],
      answer: 0,
      why: {
        1: 'Removing the overshoot costs more than it saves: the Fejér mean shrinks every coefficient, and each shrunk coefficient adds error energy.',
        2: 'Same harmonics, different weights: the weights decide the error.',
        3: 'Uniform convergence holds for continuous f; the square wave jumps, and even then uniform convergence says nothing about which is smaller at a fixed N.',
      },
      hints: [t`Recall the best-approximation property of $S_N$ from the previous lesson.`, t`The Fejér mean has coefficients $\big(1 - \frac{n}{N+1}\big)b_n$: each differs from $b_n$, and Pythagoras charges for every difference.`],
      teach: 'Tapering trades mean-square accuracy for the absence of ringing: the plain partial sum is always the best approximation in mean square.',
      explain: t`$S_Nf$ is the orthogonal projection, so any other trigonometric polynomial of degree $N$ — the Fejér mean included — is farther away in mean square: here the rms errors are $${r3(FS.rmsError('square', 19))}$ (plain) and $${r3(FS.rmsError('square', 19, 'fejer'))}$ (Fejér). Fejér buys a ringing-free edge with a blurrier one.`,
    }),
    order({
      id: 'proof-order', difficulty: 2,
      prompt: t`Put the steps of the Gibbs limit for the square wave in order.`,
      visual: series({ wave: 'square', N: 49, panels: ['x'], gibbs: true, mark: true, probe: false, window: [-0.3, 1.2] }, 'The first peak beside the jump, here for N = 49.'),
      items: [
        t`Differentiate: $S_N' = \frac{2}{\pi}\frac{\sin2Kx}{\sin x}$`,
        t`Integrate from the jump: $S_N(x) = \frac2\pi\int_0^x\frac{\sin2Kt}{\sin t}dt$`,
        t`The first maximum is at $x = \pi/2K$`,
        t`Substitute $t = u/2K$ and let $K \to \infty$`,
        t`The peak tends to $\frac2\pi\operatorname{Si}(\pi) \approx 1.179$`,
      ],
      hints: [t`You need a closed form for $S_N$ before you can maximize it.`, 'Find where the derivative first vanishes before you evaluate the peak.'],
      teach: 'Gibbs in five lines: differentiate, sum the geometric series, integrate back, locate the peak, rescale.',
      explain: t`The derivative sums in closed form; integrating it back gives $S_N$ as an integral; its first critical point is $\pi/2K$; rescaling turns the integral into $\int_0^\pi\frac{\sin u}{u}du$ in the limit.`,
    }),
    code({
      id: 'lanczos-saw', difficulty: 3,
      prompt: t`Measure Gibbs on the sawtooth $f = x/\pi$, whose coefficients are $b_n = \dfrac{2(-1)^{n+1}}{n\pi}$ and which jumps from $1$ to $-1$ at $x = \pi$. Write \`S(x, N, sigma=False)\` returning $\sum_{n=1}^{N} w_nb_n\sin nx$ for an array \`x\`, with $w_n = 1$, or with the Lanczos factors $w_n = \dfrac{\sin(n\pi/(N+1))}{n\pi/(N+1)}$ (that is \`np.sinc(n/(N + 1))\`) when \`sigma\` is true. The program prints the highest point just left of the jump.`,
      starter: t`import numpy as np

def S(x, N, sigma=False):
    n = np.arange(1, N + 1)
    b = 2 * (-1.0)**(n + 1) / (n * np.pi)
    # apply the Lanczos factors if sigma, then sum the sines
    pass

x = np.linspace(np.pi - 0.3, np.pi, 30001)
for N in (50, 200):
    print(N, "plain peak", S(x, N).max(), "  Lanczos peak", S(x, N, True).max())
`,
      answer: t`import numpy as np

def S(x, N, sigma=False):
    n = np.arange(1, N + 1)
    b = 2 * (-1.0)**(n + 1) / (n * np.pi)
    if sigma:
        b = b * np.sinc(n / (N + 1))
    return np.sin(np.outer(x, n)) @ b

x = np.linspace(np.pi - 0.3, np.pi, 30001)
for N in (50, 200):
    print(N, "plain peak", S(x, N).max(), "  Lanczos peak", S(x, N, True).max())
`,
      tests: [
        { name: 'plain sum, N = 200: peak between 1.17 and 1.18 (Gibbs)', code: '1.17 < S(np.linspace(np.pi - 0.3, np.pi, 30001), 200).max() < 1.18' },
        { name: 'Lanczos, N = 200: peak below 1.03', code: 'S(np.linspace(np.pi - 0.3, np.pi, 30001), 200, True).max() < 1.03' },
        { name: 'both are 0 at the jump x = π', code: 'abs(S(np.array([np.pi]), 200)[0]) < 1e-12 and abs(S(np.array([np.pi]), 200, True)[0]) < 1e-12' },
        { name: 'S(1, 400) is close to 1/π (convergence between jumps)', code: 'abs(S(np.array([1.0]), 400)[0] - 1/np.pi) < 3e-3' },
      ],
      hints: ['`np.sin(np.outer(x, n))` is a table of sin(n x) with one row per x; multiply it by the coefficient vector with `@`.', 'For σ-factors: `b = b * np.sinc(n / (N + 1))` — NumPy’s sinc already includes the π.'],
      teach: 'Tapering the coefficients smoothly (σ-factors) kills most of the overshoot while keeping the edge sharp.',
      explain: t`The plain peaks are about $1.159$ ($N = 50$) and $1.174$ ($N = 200$), creeping toward $${r4(GIBBS_PEAK)}$; with Lanczos factors they are about $0.99$ and $1.016$. The σ-factor is the average of the partial sum over a window one harmonic wide, which smooths out the ringing at the scale of $1/N$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-star', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([2e17, 4e17, 5e17, 3e17]);
        const ans = -GIBBS_FRAC * rho;
        return {
          prompt: t`A toy neutron-star model has a sharp surface: the density is $\rho_s = ${tex(rho)}\ \text{kg/m}^3$ just inside and $0$ outside. A Fourier spectral code stores the density profile with a finite number of modes. Roughly how low does the stored density dip just outside the surface, in kg/m³?`,
          visual: { type: 'graph', params: { x: [0.6, 1.4], y: [-0.25, 1.35], aspect: 'wide', xlabel: 'r / R', ylabel: 'ρ / ρₛ', axesAt: 'edge', curves: [{ fn: 'step(1 - x)', color: 'ink3', dash: [5, 4], width: 1.4 }, { sum: '0.5*step(1.5 - k) - 2/((2k - 1)*pi)*sin((2k - 1)*pi*(x - 1)/1.6)', k: [1, 60], color: 'accent', width: 2.2, samples: 2000 }], hlines: [{ y: 0, color: 'ink3' }] }, caption: 'Schematic: the sharp edge (dashed) and a truncated Fourier representation of it (blue). Only the region near the surface is shown.' },
          answer: ans, units: 'kg/m^3', tol: { rel: 0.01 },
          errors: [{ value: -GIBBS_FRAC * rho * 2, feedback: t`The jump is $\rho_s$ itself (from $\rho_s$ to 0), not $2\rho_s$.` }, { value: GIBBS_FRAC * rho, feedback: 'Outside the star the series undershoots below zero.' }],
          hints: ['The jump is J = ρₛ, from ρₛ down to 0.', t`The undershoot on the low side is $${r4(GIBBS_FRAC)}J$ below the lower level, 0.`],
          teach: 'At a sharp edge a truncated spectrum undershoots by 8.95% of the jump — here into unphysical negative density.',
          explain: t`$-${r4(GIBBS_FRAC)}\times${tex(rho)} = ${tex(ans)}\ \text{kg/m}^3$: a negative density, which an equation of state cannot handle. This is why spectral relativity codes put a domain boundary at the stellar surface or filter the coefficients, and why shock-capturing finite-volume codes are used for matter.`,
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: t`You double the number of harmonics in the partial sum of a function with a jump. What happens to the overshoot beside the jump?`,
      visual: { type: 'graph', params: { x: [-0.1, 0.8], y: [-0.2, 1.3], aspect: 'wide', xlabel: 'x (rad), near the jump', ylabel: '', axesAt: 'edge', curves: [{ sum: '4/((2k - 1)*pi)*sin((2k - 1)*x)', k: [1, 10], color: 'violet', width: 1.8, label: 'N = 19', labelAt: 0.5, labelDy: 16 }, { sum: '4/((2k - 1)*pi)*sin((2k - 1)*x)', k: [1, 20], color: 'accent', width: 2.2, label: 'N = 39', labelAt: 0.3, labelDy: -18 }], hlines: [{ y: 1 }] }, caption: 'The square wave’s partial sums beside its jump at x = 0.' },
      choices: ['it keeps its height and becomes half as wide', 'it halves in height and keeps its width', 'it halves in both height and width', 'it moves away from the jump'],
      answer: 0,
      why: {
        1: 'The height tends to a fixed fraction, 8.95% of the jump, whatever N is.',
        2: 'Only the width scales like 1/N; the height does not.',
        3: 'Its location π/(N + 1) moves toward the jump.',
      },
      hints: ['Compare the two curves in the picture: heights and positions.', 'The peak is at π/(N + 1) with a height that tends to a constant.'],
      teach: 'More terms squeeze the Gibbs overshoot toward the jump; they never lower it.',
      explain: t`The peak sits at $\pi/(N + 1)$, so its width halves; its height tends to $${r4(GIBBS_PEAK)}$ for the unit square wave whatever $N$ is. Its area — and so its contribution to the mean-square error — does shrink, which is why the series still converges in mean square.`,
    }),
    mcq({
      id: 'cp-seismo', difficulty: 3, transfer: true,
      prompt: t`A seismometer record contains a sudden step (a nearby blast). Low-passing it with an ideal “brick-wall” filter, which keeps every frequency below a cut-off and removes the rest, makes the step ring with an overshoot of about 9%. How can you reduce the ringing?`,
      visual: { type: 'graph', params: { x: [-2, 4], y: [-0.25, 1.3], aspect: 'wide', xlabel: 't (s)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'step(x)', color: 'ink3', dash: [5, 4], width: 1.4 }, { sum: '0.5*step(1.5 - k) + 2/((2k - 1)*pi)*sin((2k - 1)*pi*x/6)', k: [1, 15], color: 'accent', width: 2.2 }] }, caption: 'Schematic: the step (dashed) after a brick-wall cut (blue), ringing on both sides of the edge.' },
      choices: ['taper the response smoothly to zero near the cut-off instead of cutting abruptly', 'raise the cut-off frequency: more harmonics, less overshoot', 'lower the cut-off frequency', 'sample the seismometer faster'],
      answer: 0,
      why: {
        1: 'A higher cut-off narrows the ringing but leaves its height at about 9% — that is the Gibbs phenomenon.',
        2: 'A lower cut-off widens the ringing; the height is still about 9%.',
        3: 'Faster sampling changes nothing about the filter’s abrupt edge in frequency.',
      },
      hints: ['What fixed the overshoot in this lesson: more terms, or different weights?', 'Fejér and Lanczos weights go smoothly to zero at the last harmonic kept.'],
      teach: 'Ringing comes from the abrupt edge in frequency; a smooth taper (a window) removes most of it at the cost of a slightly softer step.',
      explain: t`The overshoot is set by the **shape** of the frequency cut, not its position. A tapered response — a Fejér (triangular) or Lanczos-like window, or a Hann or Butterworth roll-off — has a kernel with little or no negative lobe, so the step rises with little or no overshoot, slightly more slowly.`,
    }),
  ],
  sources: [SRC.stein, SRC.dlmf, SRC.hewitt],
});
