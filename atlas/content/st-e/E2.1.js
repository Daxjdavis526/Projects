// Pointwise and mean-square convergence: the three senses of "the series
// converges" (pointwise, uniform, L²), the theorems that deliver each
// (Dirichlet; the Weierstrass M-test; completeness with the best-approximation
// property), and the warnings (du Bois-Reymond's divergent continuous function,
// Carleson's theorem).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import * as FS from '../../src/viz/model/fa-series.js';
import { SRC, series, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
// the triangle wave 1 − 2|x|/π: aₙ = 8/(π²n²), odd n; its largest error is the tail sum, reached at x = 0
const triTail = (N) => { let s = 0; for (let n = N + 1; n < 2e6; n++) if (n % 2) s += 8 / (PI * PI * n * n); return s; };
const firstN = (eps) => { let N = 1; while (triTail(N) >= eps) N++; return N; };
const N01 = firstN(0.01), N05 = firstN(0.05);

export default lesson({
  id: 'st-e.E2.1',
  title: 'Pointwise and mean-square convergence',
  minutes: 16, difficulty: 3,
  intro: t`“The Fourier series converges to $f$” can mean three different things, and they are not equally easy to earn. **Pointwise**: at each $x$, $S_Nf(x) \to f(x)$. **Uniformly**: the largest error $\max_x|f - S_Nf|$ goes to 0. **In mean square**: the error’s energy goes to 0,

$$\lim_{N\to\infty}\int_{-\pi}^{\pi}\big|f(x) - S_Nf(x)\big|^2\,dx = 0 .$$

Mean square is the cheap one: it holds for **every** $f$ with $\int|f|^2 < \infty$, and $S_Nf$ is the best approximation of $f$ by any trigonometric polynomial of degree $N$. Pointwise takes more (Dirichlet’s theorem: piecewise smooth $f$, with the midpoint at jumps), and uniform more still (continuity, through the Weierstrass M-test). Continuity alone is **not** enough for pointwise convergence: du Bois-Reymond built a continuous function whose series diverges at a point (1873).`,
  symbols: [
    { tex: 'S_Nf(x)', text: 'the $N$-th partial sum, $\\sum_{|n| \\le N} c_ne^{inx}$ — the harmonics up to $N$' },
    { tex: 'f(x)', text: 'a $2\\pi$-periodic function with finite energy $\\int_{-\\pi}^{\\pi}|f|^2\\,dx$' },
    { tex: '|f - S_Nf|^2', text: 'the squared error at $x$; its integral is the error’s energy, $\\lVert f - S_Nf\\rVert^2$' },
    { tex: 'N', text: 'the number of harmonics kept' },
  ],
  why: t`Energies, inner products and matched-filter overlaps only need mean-square convergence; a value at one instant — the peak pressure, the strain at merger — needs pointwise or uniform convergence, which is harder to get.`,
  visual: {
    type: 'fa-series',
    title: 'Three errors, three behaviours',
    lead: t`Top: a function and its partial sum, with a probe at $x_0$. Bottom, on log–log axes: the rms error (blue), the error at the probe (gold) and the largest error anywhere (red, dashed), against $N$.`,
    tasks: [
      t`Square wave: the rms error falls like $N^{-1/2}$, but the largest error stays at 1 — half the jump — for every N.`,
      'Move the probe to x₀ = 0, on the jump: the error there is exactly 0 (the midpoint). Move it to 0.05: the error swings up and down as the ringing sweeps past, and is still several per cent at N = 200.',
      'Triangle: all three errors fall. Smooth function: they plunge exponentially.',
    ],
    params: { wave: 'square', waves: ['square', 'saw', 'triangle', 'smooth'], N: 9, Nmax: 200, x0: 1, panels: ['x', 'err'], errN: 200, readouts: ['N', 'pt', 'rms', 'sup'] },
    caption: t`Exact coefficients. “rms error” is $\sqrt{(1/2\pi)\int(f - S_N)^2}$, from Parseval; the largest error is searched on a fine grid with extra points a hair from each jump. At a jump $f$ is taken as the midpoint.`,
  },
  example: {
    prompt: t`The triangle wave $f(x) = 1 - \tfrac{2}{\pi}|x|$ on $[-\pi, \pi]$, repeated, has $f \sim \sum_{n\ \text{odd}}\dfrac{8}{\pi^2n^2}\cos nx$. Prove that its series converges uniformly, and find the smallest $N$ that keeps the error below $0.01$ **everywhere**. Compare the rms error at that $N$.`,
    visual: series({ wave: 'triangle', N: N01, panels: ['x', 'err'], x0: 0, errN: 200, readouts: [] }, 'The triangle wave with 41 harmonics (top) and its three errors against N (bottom).'),
    steps: [
      { label: 'Weierstrass M-test', text: t`Each term obeys $\big|\tfrac{8}{\pi^2n^2}\cos nx\big| \le \tfrac{8}{\pi^2n^2}$, and $\sum 1/n^2$ converges. So the series converges **uniformly** to a continuous function — which must be $f$, since Dirichlet’s theorem already gives $S_Nf(x) \to f(x)$ at each point.` },
      { label: 'The error is a tail', text: t`$|f(x) - S_Nf(x)| = \Big|\sum_{n > N}a_n\cos nx\Big| \le \sum_{n > N,\ \text{odd}}\dfrac{8}{\pi^2n^2}$, with equality at $x = 0$ (every cosine is 1 there). So the largest error **is** the tail sum $T_N$.` },
      { label: 'Size of the tail', text: t`Comparing with an integral, $\sum_{n > N,\ \text{odd}}\frac1{n^2} \approx \frac{1}{2(N+1)}$, so $T_N \approx \dfrac{4}{\pi^2(N + 1)}$: the uniform error falls like $1/N$.` },
      { label: 'Solve', text: t`$T_N < 0.01$ first holds at $N = ${N01}$ ($T_{${N01}} = ${r3(triTail(N01))}$; at $N = ${N01 - 2}$ it is $${r3(triTail(N01 - 2))}$). Even $N$ add nothing — the even coefficients are zero.` },
      { label: 'The rms error', text: t`By Parseval the mean-square error is the energy left out, $\tfrac12\sum_{n > N}a_n^2$, so the rms error at $N = ${N01}$ is $${r3(FS.rmsError('triangle', N01))}$ — over ten times smaller than the worst point. The error concentrates at the corners.` },
    ],
    answer: t`Uniform convergence by the M-test, with $\max|f - S_N| = \sum_{n > N\ \text{odd}}\frac{8}{\pi^2n^2} \approx \frac{4}{\pi^2(N+1)}$. It first drops below $0.01$ at $N = ${N01}$, where the rms error is only $${r3(FS.rmsError('triangle', N01))}$.`,
  },
  practice: [
    num({
      id: 'value-at-jump', difficulty: 1,
      gen(r) {
        const A = r.intExcept(-3, 5, [0]), B = r.intExcept(-3, 5, [A, 0]);
        const where = r.pick(['0', '\\pi']);
        return {
          prompt: t`$f(x) = ${A}$ for $0 < x < \pi$ and $f(x) = ${B}$ for $-\pi < x < 0$, repeated with period $2\pi$. What value does its Fourier series converge to at $x = ${where}$?`,
          visual: { type: 'graph', params: { x: [-6.3, 6.3], y: [Math.min(A, B) - 1.5, Math.max(A, B) + 1.5], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `${B} + (${A - B})*step(sin(x))`, color: 'accent', width: 2.2 }] }, caption: 'The function, repeated: it jumps at every multiple of π.' },
          answer: (A + B) / 2, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: A, feedback: 'That is the value just to one side. At a jump the series cannot choose a side.' }, { value: B, feedback: 'That is the value just to one side. At a jump the series cannot choose a side.' }].filter((e) => Math.abs(e.value - (A + B) / 2) > 0.05),
          hints: ['Dirichlet’s theorem: at a jump of a piecewise smooth function the series converges to the average of the two one-sided limits.', t`The two sides are $${A}$ and $${B}$${where === '\\pi' ? t` — at $x = \pi$ the repeated function jumps from $${A}$ back to $${B}$` : ''}.`],
          teach: 'At a jump, a Fourier series converges to the midpoint of the jump.',
          explain: t`$\tfrac12(${A} + ${B}) = ${(A + B) / 2}$. The partial sums at the jump are all equal to it (the odd part of $f$ about the jump contributes zero there).`,
        };
      },
    }),
    multi({
      id: 'saw-truths', difficulty: 2,
      prompt: t`The sawtooth $f(x) = x/\pi$ on $(-\pi, \pi)$, repeated, jumps from $1$ down to $-1$ at $x = \pi$. Which statements about its Fourier partial sums are true?`,
      visual: series({ wave: 'saw', N: 15, panels: ['x', 'err'], x0: 2, errN: 200 }, 'The sawtooth with 15 harmonics, and its errors against N (probe at x₀ = 2).'),
      choices: [t`$S_Nf(x) \to f(x)$ at every $x$ strictly between the jumps`, t`$S_Nf(\pi) = 0$ for every $N$`, t`$\int_{-\pi}^{\pi}|f - S_Nf|^2dx \to 0$`, t`$\max_x|f - S_Nf| \to 0$`, t`$S_Nf(\pi) \to 1$`],
      answer: [0, 1, 2],
      why: {
        3: 'The largest error stays at 1, half the jump, however large N is: the convergence is not uniform.',
        4: 'Every term sin nx vanishes at x = π, so the partial sums sit at 0, the midpoint of the jump from 1 to −1.',
      },
      hints: ['Look at the red dashed curve in the picture: does it fall?', 'At x = π, evaluate sin nπ.'],
      teach: 'A jump costs uniform convergence but not pointwise or mean-square convergence.',
      explain: t`Dirichlet gives pointwise convergence to $f$ between jumps and to the midpoint $0$ at them (each $\sin n\pi = 0$, so $S_Nf(\pi) = 0$ exactly). Every $f$ with finite energy converges in mean square. Uniform convergence fails: a continuous $S_N$ cannot follow a jump, so near it the error approaches half the jump.`,
    }),
    num({
      id: 'm-test', difficulty: 3,
      gen(r) {
        const eps = r.pick([0.01, 0.005, 0.002, 0.001]);
        const N = Math.ceil(4 / (PI * PI * eps));
        return {
          prompt: t`The periodic parabola $f(x) = (x/\pi)^2$ has $a_n = \dfrac{4(-1)^n}{\pi^2n^2}$. Using the M-test bound $\max|f - S_Nf| \le \sum_{n > N}|a_n|$ and the estimate $\sum_{n > N}\frac{1}{n^2} < \frac1N$, what is the smallest $N$ that **guarantees** $\max|f - S_Nf| < ${eps}$?`,
          visual: series({ wave: 'parabola', N: 4, panels: ['x'], probe: false }, 'The periodic parabola and its partial sum with N = 4: the misfit sits at the corners x = ±π.'),
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.ceil(Math.sqrt(4 / (PI * PI * eps))), feedback: t`The bound is $\frac{4}{\pi^2N}$, not $\frac{4}{\pi^2N^2}$: summing $1/n^2$ from $N$ on leaves $1/N$.` }],
          hints: [t`$\sum_{n > N}|a_n| = \dfrac{4}{\pi^2}\sum_{n > N}\dfrac1{n^2} < \dfrac{4}{\pi^2N}$.`, t`Solve $\dfrac{4}{\pi^2N} \le ${eps}$ for the smallest whole $N$.`],
          teach: 'The Weierstrass M-test turns absolutely summable coefficients into a uniform error bound: the tail sum.',
          explain: t`$N \ge \dfrac{4}{\pi^2\times${eps}} = ${r4(4 / (PI * PI * eps))}$, so $N = ${N}$. The true largest error (at $x = \pi$, where every $\cos n\pi$ lines up) is close to this bound because all the terms add there.`,
        };
      },
    }),
    num({
      id: 'best-approx', difficulty: 3,
      gen(r) {
        const E = r.pick([0.12, 0.3, 0.05, 0.8]), d = r.pick([0.1, 0.2, 0.25, 0.4]);
        const ans = E + PI * d * d;
        return {
          prompt: t`For some $f$, the error of its partial sum has energy $\int_{-\pi}^{\pi}|f - S_3f|^2dx = ${E}$. You replace the coefficient $a_2$ in $S_3f$ by $a_2 + ${d}$, keeping the rest. What is the error energy $\int_{-\pi}^{\pi}|f - T|^2dx$ of the new polynomial $T$?`,
          visual: { type: 'graph', params: { x: [-0.2, 2.6], y: [-0.25, 1.35], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, arrows: [{ from: [0, 0], to: [1.6, 1.1], color: 'accent', label: 'f', labelDx: 6 }, { from: [0, 0], to: [1.6, 0], color: 'good', label: 'S₃f', labelDy: 14 }, { from: [0, 0], to: [2.2, 0], color: 'warn', label: 'T', labelDy: 14, labelDx: 4, dash: true }, { from: [1.6, 0], to: [1.6, 1.1], color: 'ink3', dash: true }, { from: [2.2, 0], to: [1.6, 1.1], color: 'warn', dash: true }], points: [] }, caption: 'Sketch: the trigonometric polynomials of degree 3 form a plane (horizontal); S₃f is the foot of the perpendicular from f. Any other T in the plane is farther away.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: E + d * d, feedback: t`The squared length of $${d}\cos2x$ is $${d}^2\int\cos^2 2x\,dx = ${d}^2\pi$ — do not forget the $\pi$.` }, { value: E, feedback: 'Any change to the coefficients makes the error larger: S₃f is the unique best approximation.' }],
          hints: [t`$f - T = (f - S_3f) - ${d}\cos2x$, and $f - S_3f$ is orthogonal to $\cos2x$.`, t`So by Pythagoras $\lVert f - T\rVert^2 = \lVert f - S_3f\rVert^2 + ${d}^2\lVert\cos2x\rVert^2$, with $\lVert\cos2x\rVert^2 = \pi$.`],
          teach: t`The error $f - S_Nf$ is orthogonal to every trigonometric polynomial of degree $N$, so $S_Nf$ is the closest one — by Pythagoras.`,
          explain: t`$${E} + \pi\times${d}^2 = ${r4(ans)}$. Every other choice of coefficients adds the squared length of the change: the partial sum is the **orthogonal projection** of $f$, the best approximation in mean square.`,
        };
      },
    }),
    num({
      id: 'square-rms', difficulty: 2,
      gen(r) {
        const N = r.pick([1, 3, 5, 9]);
        const ans = FS.rmsError('square', N);
        return {
          prompt: t`The square wave $\operatorname{sign}x$ has mean square $\langle f^2\rangle = 1$ and harmonics $b_n = \frac{4}{\pi n}$ for odd $n$, each carrying $\tfrac12b_n^2$ of the mean square. What is the rms error $\sqrt{\langle(f - S_Nf)^2\rangle}$ of the partial sum with $N = ${N}$?`,
          visual: series({ wave: 'square', N, panels: ['x', 'spec'], probe: false, nshow: 11 }, `The square wave with N = ${N} (top); the energy in each harmonic, the kept ones blue (bottom).`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans * ans, feedback: 'That is the mean-square error. Take its square root for the rms error.' }],
          hints: [t`The mean-square error is the energy left out: $1 - \sum_{n \le ${N}\ \text{odd}}\tfrac12 b_n^2$.`, t`$\tfrac12b_n^2 = \dfrac{8}{\pi^2n^2}$.`],
          teach: 'By Parseval, the mean-square error of a partial sum is exactly the energy in the harmonics left out.',
          explain: t`$1 - \dfrac{8}{\pi^2}\sum_{n \le ${N}\ \text{odd}}\dfrac1{n^2} = ${r4(ans * ans)}$, so the rms error is $${r4(ans)}$ — though the largest error is still 1.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-n', difficulty: 2,
      prompt: t`For the triangle wave, find the smallest number of harmonics $N$ for which the largest error $\max|f - S_Nf|$ is below $0.05$.`,
      visual: { type: 'fa-series', params: { wave: 'triangle', N: 1, Nmax: 30, x0: 0, panels: ['x', 'err'], errN: 100, controls: ['N'], readouts: ['N', 'sup'] }, caption: 'The triangle wave: its largest error is at the corners, where every cosine has the same sign.' },
      param: 'N', answer: [N05, N05 + 1],
      instruction: 'Raise N until the largest error falls below 0.05, then check.',
      hints: ['Watch the largest-error readout as you raise N.', 'Even N add nothing for the triangle: its even harmonics are zero.'],
      teach: 'For a continuous, piecewise smooth function the largest error does fall to zero — here like 1/N.',
      explain: t`At $N = ${N05 - 2}$ the largest error is $${r3(triTail(N05 - 2))}$; at $N = ${N05}$ it is $${r3(triTail(N05))}$. (It equals the tail sum $\sum_{n > N\ \text{odd}}\frac{8}{\pi^2n^2}$, reached at $x = 0$.)`,
    },
  ],
  checkpoint: [
    num({
      id: 'cp-telemetry', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([1, 3, 5]), rate = r.pick([2, 4, 8, 16]);
        const lost = 100 * (1 - FS.captured('square', N));
        return {
          prompt: t`A spacecraft sends a test pattern of alternating ones and zeros at ${rate} kbit/s: a $\pm1$ V square wave whose fundamental is ${rate / 2} kHz (one period is two bits). The radio channel passes only frequencies below ${(N + 1) * rate / 2} kHz, so only the harmonics $n \le ${N}$ get through. What percentage of the signal’s mean-square power is lost?`,
          visual: series({ wave: 'square', N, panels: ['x', 'spec'], probe: false, nshow: 11 }, 'The received waveform (blue) against the sent one (dashed), and the energy per harmonic. One period = two bits.'),
          answer: lost, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * FS.rmsError('square', N), feedback: 'That is the rms error (in volts, as a percentage of 1 V). Power is the mean square.' }],
          hints: ['Power lost = mean square of the error = energy in the harmonics that do not pass.', t`$\langle f^2\rangle = 1\ \text{V}^2$; harmonic $n$ carries $\dfrac{8}{\pi^2n^2}\ \text{V}^2$.`],
          teach: 'A band limit removes exactly the energy in the harmonics above it — Parseval makes the bookkeeping exact.',
          explain: t`Kept: $\dfrac{8}{\pi^2}\sum_{n \le ${N}\ \text{odd}}\dfrac1{n^2} = ${r4(1 - lost / 100)}$ of the power, so $${r3(lost)}\%$ is lost. The received edges are rounded and ring, but the bits are still easy to read: mean square is forgiving even when pointwise values near the edges are not.`,
        };
      },
    }),
    mcq({
      id: 'cp-continuous', difficulty: 3,
      prompt: t`A classmate says: “If $f$ is continuous and $2\pi$-periodic, its Fourier series converges to $f(x)$ at every $x$.” What is the best reply?`,
      visual: series({ wave: 'triangle', N: 5, panels: ['x', 'err'], x0: 1, errN: 200 }, 'A continuous example (the triangle) where all is well — because it is also piecewise smooth.'),
      choices: ['False: du Bois-Reymond found a continuous function whose series diverges at a point; adding piecewise smoothness (or Hölder continuity) makes it true, and uniform', 'True: continuity is exactly the condition in Dirichlet’s theorem', 'False: a continuous function’s series converges only in mean square, never pointwise', 'True, but only at points where f is differentiable'],
      answer: 0,
      why: {
        1: 'Dirichlet’s theorem asks for piecewise smoothness, not mere continuity — and the gap is real.',
        2: 'For most continuous functions met in practice (piecewise smooth ones) the series converges pointwise and even uniformly.',
        3: 'Differentiability at a point is sufficient there (Dini’s test), but the claim is about every point — and continuity alone does not give it.',
      },
      hints: ['Which hypothesis does Dirichlet’s theorem actually use?', 'Continuity alone fails: the counterexample dates from 1873. Carleson (1966) showed the failures are confined to a set of measure zero.'],
      teach: 'Continuity is not enough for pointwise convergence; piecewise smoothness is — and Carleson’s theorem confines any failure to a set of measure zero.',
      explain: t`du Bois-Reymond (1873) constructed a continuous periodic function whose Fourier series diverges at a point. Add a little regularity — piecewise smooth, or Hölder continuous — and the series converges uniformly. Carleson (1966): for every $f$ with finite energy the series converges at almost every $x$. The Fejér averages, unlike the partial sums, converge uniformly for every continuous $f$ (next lesson).`,
    }),
    mcq({
      id: 'cp-template', difficulty: 3, transfer: true,
      prompt: t`A gravitational-wave search compares data $g$ with a waveform template $h$ through the overlap $\langle h, g\rangle = \int h\,g\,dt$. The template is built from a truncated series $S_Nh$. Which convergence of $S_Nh \to h$ guarantees that the overlap converges, $\langle S_Nh, g\rangle \to \langle h, g\rangle$, for any data $g$ of finite energy?`,
      visual: { type: 'graph', params: { x: [0, 8], y: [-1.4, 1.4], aspect: 'wide', xlabel: 't (arbitrary)', ylabel: 'h', axesAt: 'edge', xticks: 0, curves: [{ fn: '(0.3 + 0.08*x)*sin(2*pi*(0.6 + 0.12*x)*x)', color: 'accent', width: 1.8, samples: 1500 }] }, caption: 'A chirp-like template (illustrative). The overlap integral weighs it against the data at every instant.' },
      choices: [t`mean square: by Cauchy–Schwarz the overlap error is at most $\lVert h - S_Nh\rVert\,\lVert g\rVert$`, 'pointwise at every t — it is needed and is enough', 'only uniform convergence', 'none: overlaps are only defined for exact waveforms'],
      answer: 0,
      why: {
        1: 'Pointwise convergence is neither needed nor enough: a sequence can converge at every point while its energy does not converge.',
        2: 'Uniform convergence would do it on a finite stretch of data, but it is far more than needed.',
        3: 'Overlaps are integrals and behave continuously under mean-square limits.',
      },
      hints: [t`$\langle S_Nh, g\rangle - \langle h, g\rangle = \langle S_Nh - h, g\rangle$.`, t`Cauchy–Schwarz: $|\langle u, g\rangle| \le \lVert u\rVert\,\lVert g\rVert$.`],
      teach: 'Inner products are continuous in the mean-square norm: L² convergence is exactly what energies and overlaps need.',
      explain: t`$|\langle S_Nh - h, g\rangle| \le \lVert S_Nh - h\rVert\,\lVert g\rVert \to 0$. Matched filtering, signal-to-noise ratios and energy fluxes are all inner products, so mean-square convergence — which every finite-energy signal enjoys — is what makes truncated templates trustworthy.`,
    }),
  ],
  sources: [SRC.stein, SRC.korner],
});
