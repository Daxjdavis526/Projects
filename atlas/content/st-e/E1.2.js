// Computing Fourier coefficients: the Euler–Fourier formulas as projections,
// coefficients by integration by parts, why smoothness sets the decay rate
// (a jump gives 1/n, a corner 1/n², analytic gives e^(−an)), and computing
// coefficients numerically — the trapezoid rule on a periodic grid is the FFT,
// and its error is aliasing.
import { lesson, mcq, num, expr, match, code } from '../../src/core/content.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
// modified Bessel I_n(1), for e^(cos x) = I₀(1) + 2Σ Iₙ(1) cos nx
const I1 = (n) => { let s = 0, term = 1; for (let j = 1; j <= n; j++) term *= 0.5 / j; for (let k = 0; k < 40; k++) { s += term; term *= 0.25 / ((k + 1) * (k + 1 + n)); } return s; };
const XW = 'x - 2*pi*floor((x + pi)/(2*pi))';

export default lesson({
  id: 'st-e.E1.2',
  title: 'Computing Fourier coefficients',
  minutes: 16, difficulty: 3,
  intro: t`Because $1, \cos x, \sin x, \cos 2x, \dots$ are orthogonal, each coefficient is a **projection**: the inner product of $f$ with one harmonic, divided by that harmonic’s squared length $\int_{-\pi}^{\pi}\cos^2 nx\,dx = \pi$.

$$a_n = \frac1\pi\int_{-\pi}^{\pi} f(x)\cos nx\,dx, \qquad b_n = \frac1\pi\int_{-\pi}^{\pi} f(x)\sin nx\,dx$$

Integrate by parts and a pattern appears: every time $f$ can be differentiated once more without a jump, the coefficients fall by another power of $n$. A jump gives $1/n$, a corner $1/n^2$, an infinitely smooth (analytic) function falls faster than any power. That rate is the most useful single fact about a Fourier series — it decides how many terms you need and how a computer’s answer goes wrong.`,
  symbols: [
    { tex: 'a_n,\\ b_n', text: 'the cosine and sine coefficients of harmonic $n$ (units of $f$); $a_0/2$ is the mean of $f$' },
    { tex: 'f(x)', text: 'the periodic function, period $2\\pi$ — any interval of length $2\\pi$ may be used for the integrals' },
    { tex: '\\cos nx,\\ \\sin nx', text: 'the $n$-th harmonics, the axes of the projection' },
    { tex: '\\tfrac1\\pi', text: 'one over the squared length $\\int_{-\\pi}^{\\pi}\\cos^2 nx\\,dx = \\pi$ of each harmonic ($n \\ge 1$)' },
  ],
  why: t`Every spectrum you will ever compute — of a combustion-instability record, a pulsar profile or a numerical-relativity waveform — is these integrals done by a computer; knowing how fast they *should* fall tells you when the computer is lying.`,
  visual: {
    type: 'fa-series',
    title: 'Smoothness sets the decay',
    lead: t`Bottom: the amplitude $\sqrt{a_n^2 + b_n^2}$ of each harmonic on a **logarithmic** scale. Top: the function and its partial sum.`,
    tasks: [
      'Square wave (a jump): the dots fall slowly, like 1/n. N = 15 still looks rough.',
      'Triangle (corners only): the dots fall like 1/n² — two decades by n = 15, and the sum looks right early.',
      'Smooth e^(cos x − 1): the dots fall on a straight line — exponential decay — and reach 10⁻¹² by n = 15.',
    ],
    params: { wave: 'square', waves: ['square', 'triangle', 'parabola', 'smooth'], N: 5, Nmax: 30, panels: ['x', 'spec'], spec: 'log', nshow: 15, readouts: [] },
    caption: 'Amplitudes √(aₙ² + bₙ²) on a log scale (zeros, such as the even harmonics of the square wave, are not drawn). Exact coefficients; each function has period 2π.',
  },
  example: {
    prompt: t`Find the Fourier series of $f(x) = x^2$ on $-\pi < x < \pi$, repeated with period $2\pi$. How fast do its coefficients fall, and why?`,
    visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-1.5, 11.5], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `(${XW})^2`, color: 'ink3', dash: [5, 4], width: 1.5 }, { sum: 'pi^2/3*step(1.5 - k) + 4*(-1)^k/k^2*cos(k*x)', k: [1, 3], color: 'accent', width: 2.3 }], hlines: [{ y: PI * PI / 3, label: 'mean π²/3' }] }, caption: 'x² repeated with period 2π (dashed) and its partial sum: the mean π²/3 plus three cosines. It already misses only at the corners x = ±π.' },
    steps: [
      { label: 'Use the symmetry', text: t`$x^2$ is even and $\sin nx$ is odd, so every $b_n = 0$: a pure cosine series.` },
      { label: 'The constant', text: t`$a_0 = \dfrac1\pi\displaystyle\int_{-\pi}^{\pi} x^2\,dx = \dfrac{2\pi^2}{3}$, so the mean is $a_0/2 = \pi^2/3 \approx ${r4(PI * PI / 3)}$.` },
      { label: 'By parts, twice', text: t`$\displaystyle\int_{-\pi}^{\pi} x^2\cos nx\,dx = \Big[\frac{x^2\sin nx}{n}\Big]_{-\pi}^{\pi} - \frac2n\int_{-\pi}^{\pi} x\sin nx\,dx = -\frac2n\Big(\Big[-\frac{x\cos nx}{n}\Big]_{-\pi}^{\pi} + \frac1n\int_{-\pi}^{\pi}\cos nx\,dx\Big)$. The first bracket and the last integral vanish; $\big[-x\cos nx/n\big]_{-\pi}^{\pi} = -2\pi(-1)^n/n$.` },
      { label: 'The coefficients', text: t`$a_n = \dfrac1\pi\cdot\dfrac{4\pi(-1)^n}{n^2} = \dfrac{4(-1)^n}{n^2}$, so
$$x^2 \sim \frac{\pi^2}{3} + 4\sum_{n=1}^{\infty}\frac{(-1)^n}{n^2}\cos nx .$$` },
      { label: 'Why 1/n²', text: t`The repeated function is continuous (both ends of the period are at $\pi^2$), so the first boundary term vanished; its slope jumps from $2\pi$ to $-2\pi$ at $x = \pm\pi$, and that jump is what survives the second integration by parts. One clean derivative buys one power of $n$.` },
      { label: 'A free sum', text: t`At $x = 0$, where the series converges to $f(0) = 0$: $0 = \dfrac{\pi^2}{3} + 4\sum\dfrac{(-1)^n}{n^2}$, so $1 - \tfrac14 + \tfrac19 - \cdots = \dfrac{\pi^2}{12} \approx ${r4(PI * PI / 12)}$.` },
    ],
    answer: t`$x^2 \sim \dfrac{\pi^2}{3} + 4\displaystyle\sum_{n \ge 1}\dfrac{(-1)^n}{n^2}\cos nx$. The coefficients fall like $1/n^2$ because the periodic function is continuous but has corners at $x = \pm\pi$.`,
  },
  practice: [
    num({
      id: 'abs-an', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 3, 5, 7]);
        const ans = -4 / (PI * n * n);
        return {
          prompt: t`Compute the coefficient $a_{${n}}$ of $f(x) = |x|$ on $-\pi < x < \pi$, repeated with period $2\pi$. Give a decimal.`,
          visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-0.5, 3.8], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `abs(${XW})`, color: 'accent', width: 2.2 }, { fn: `cos(${n}x)`, color: 'gold', width: 1.4, dash: [5, 4] }] }, caption: t`$|x|$ repeated (blue) and the harmonic $\cos ${n === 1 ? '' : n}x$ it is projected onto (dashed).` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`The sign: $|x|$ is largest at $\pm\pi$, where $\cos ${n}x = -1$, so the projection is negative.` }, { value: ans / 2, feedback: t`Using evenness, $a_n = \frac2\pi\int_0^\pi x\cos nx\,dx$ — the factor is $\frac2\pi$, not $\frac1\pi$.` }],
          hints: [t`$|x|$ is even, so $a_n = \dfrac2\pi\displaystyle\int_0^\pi x\cos nx\,dx$.`, t`By parts: $\int_0^\pi x\cos nx\,dx = \Big[\frac{x\sin nx}{n}\Big]_0^\pi + \Big[\frac{\cos nx}{n^2}\Big]_0^\pi = \frac{(-1)^n - 1}{n^2}$.`],
          teach: 'For an even function, a_n is twice the integral over half the period; integration by parts does the rest.',
          explain: t`$a_n = \frac2\pi\cdot\frac{(-1)^n - 1}{n^2}$, which is $-\frac{4}{\pi n^2}$ for odd $n$ and 0 for even $n$: $a_{${n}} = ${r4(ans)}$. A corner function: the coefficients fall like $1/n^2$.`,
        };
      },
    }),
    expr({
      id: 'saw-shift', difficulty: 3,
      prompt: t`Let $f(x) = x$ on $0 < x < 2\pi$, repeated with period $2\pi$. Find $b_n$ (for $n \ge 1$) as a function of $n$.`,
      visual: { type: 'graph', params: { x: [-6.3, 12.6], y: [-1, 7.4], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'x - 2*pi*floor(x/(2*pi))', color: 'accent', width: 2.2 }] }, caption: 'x on (0, 2π), repeated: a sawtooth that jumps down by 2π at every multiple of 2π.' },
      answer: '-2/n', answerTeX: t`-\frac{2}{n}`,
      vars: { n: [1, 9] },
      errors: [{ answer: '2/n', feedback: t`Check the sign: the function rises from 0 to $2\pi$, the opposite of $\sin x$ on $(0, \pi)$… do the boundary term $\big[-x\cos nx/n\big]_0^{2\pi} = -2\pi/n$ carefully.` }, { answer: '-1/n', feedback: t`Divide by $\pi$, not by $2\pi$: $b_n = \frac1\pi\int_0^{2\pi} x\sin nx\,dx$.` }],
      hints: [t`Any interval of length $2\pi$ works: $b_n = \dfrac1\pi\displaystyle\int_0^{2\pi} x\sin nx\,dx$.`, t`By parts with $u = x$: $\Big[-\dfrac{x\cos nx}{n}\Big]_0^{2\pi} + \dfrac1n\displaystyle\int_0^{2\pi}\cos nx\,dx$. The integral vanishes.`],
      teach: 'The coefficients may be computed over any full period; where you put the period changes the formula, not the function.',
      explain: t`$b_n = \frac1\pi\cdot\Big(-\frac{2\pi}{n}\Big) = -\frac2n$. (Also $a_0 = 2\pi$ and $a_n = 0$.) Compared with $x$ on $(-\pi, \pi)$, whose $b_n = 2(-1)^{n+1}/n$, this is the same sawtooth shifted by $\pi$ and raised by $\pi$: the shift multiplies $b_n$ by $(-1)^n$.`,
    }),
    num({
      id: 'half-wave', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 4, 6]);
        const ans = -2 / (PI * (n * n - 1));
        return {
          prompt: t`A half-wave rectifier passes only the positive half of $\sin x$: $f(x) = \max(\sin x, 0)$. Compute $a_{${n}} = \dfrac1\pi\displaystyle\int_0^{\pi}\sin x\cos ${n}x\,dx$. Give a decimal.`,
          visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-0.4, 1.3], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'max(sin(x), 0)', color: 'accent', width: 2.2 }, { sum: `(${1 / PI} + 0.5*sin(x))*step(1.5 - k) - 2/(pi*((2k)^2 - 1))*cos(2k*x)`, k: [1, 4], color: 'gold', width: 1.4, dash: [5, 4] }] }, caption: 'The rectified wave (blue) and a few-term partial sum (dashed): the mean 1/π, the fundamental ½ sin x, and even cosines.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: 'Check the sign of the product-to-sum terms: sin x cos nx = ½[sin(1 + n)x + sin(1 − n)x].' }],
          hints: [t`$\sin x\cos nx = \tfrac12\big[\sin(n + 1)x - \sin(n - 1)x\big]$.`, t`$\int_0^\pi \sin mx\,dx = \dfrac{1 - (-1)^m}{m}$, which is $\dfrac{2}{m}$ for odd $m$.`],
          teach: 'Product-to-sum turns each coefficient integral into integrals of single sines.',
          explain: t`$a_n = \frac{1}{2\pi}\Big(\frac{2}{n + 1} - \frac{2}{n - 1}\Big) = -\frac{2}{\pi(n^2 - 1)}$ for even $n$: $a_{${n}} = ${r4(ans)}$. The odd $a_n$ ($n \ge 3$) vanish, $a_0/2 = 1/\pi$ and $b_1 = \tfrac12$. The output has corners where it meets zero, so its coefficients fall like $1/n^2$.`,
        };
      },
    }),
    match({
      id: 'decay-match', difficulty: 2,
      prompt: t`Match each periodic function (period $2\pi$) with how fast its Fourier coefficients fall as $n \to \infty$.`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.25, 1.4], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [
        { fn: 'step(x)*2 - 1', color: 'warn', width: 1.6, domain: [-3.14, 3.14], label: 'P', labelAt: 1.6, labelDy: -10 },
        { fn: '1 - 2*abs(x)/pi', color: 'accent', width: 1.8, label: 'Q', labelAt: -0.9, labelDy: -10 },
        { fn: 'x*(pi - abs(x))/2.5', color: 'violet', width: 1.8, label: 'R', labelAt: -1.9, labelDy: 14 },
        { fn: 'cos(sin(x))*0.6', color: 'good', width: 1.8, label: 'S', labelAt: 2.6, labelDy: -10 },
      ] }, caption: 'One period of each function; repeat each with period 2π in your head.' },
      left: [t`P: the square wave $\operatorname{sign} x$`, t`Q: the triangle wave $1 - 2|x|/\pi$`, t`R: $x(\pi - |x|)$, smooth slope but a jump in $f''$`, t`S: $\cos(\sin x)$`],
      right: ['like 1/n', 'like 1/n²', 'like 1/n³', 'faster than any power of n', 'they do not fall'],
      answer: [0, 1, 2, 3],
      hints: ['Count how many derivatives the repeated function has before the first jump appears.', 'A jump in f gives 1/n; a jump in f′ gives 1/n²; a jump in f″ gives 1/n³.'],
      teach: 'If f and its first k − 1 derivatives are continuous and periodic but the k-th jumps, the coefficients fall like 1/n^(k+1).',
      explain: t`Each integration by parts moves one derivative onto $f$ and gains a $1/n$; the first jump stops the process. P jumps ($1/n$); Q is continuous with a jumping slope ($1/n^2$); R has a continuous slope and a jumping $f''$ ($1/n^3$: $b_n = 8/(\pi n^3)$ for odd $n$); S is analytic, and its coefficients fall exponentially.`,
    }),
    mcq({
      id: 'exp-decay', difficulty: 3,
      prompt: t`A spectral code reports that the coefficients of a periodic field fall like $|a_n| \approx e^{-0.5n}$ all the way down to round-off. What can you conclude about the field?`,
      visual: { type: 'graph', params: { x: [0, 60], y: [-14, 0.5], aspect: 'wide', xlabel: 'n', ylabel: 'amplitude', ylog: true, axesAt: 'edge', curves: [{ fn: 'max(-0.5*x/ln(10), -13.5)', color: 'accent', width: 2.2 }, { fn: '-log10(x)', color: 'warn', width: 1.4, dash: [6, 4], domain: [1, 60], label: '1/n', labelAt: 40, labelDy: -10 }, { fn: '-2*log10(x)', color: 'violet', width: 1.4, dash: [6, 4], domain: [1, 60], label: '1/n²', labelAt: 40, labelDy: -10 }] }, caption: 'The reported coefficients (blue): a straight line on a log scale until round-off. Dashed: what a jump and a corner would give.' },
      choices: ['it is infinitely differentiable — in fact analytic, extending to complex x with |Im x| < 0.5', 'it has a corner somewhere, hidden by round-off', 'it is a finite sum of sines and cosines', 'nothing: the decay rate of coefficients says nothing about the function'],
      answer: 0,
      why: {
        1: t`A corner forces $|a_n| \sim 1/n^2$ forever: the dashed violet line. It cannot fall below that.`,
        2: 'A finite sum has coefficients exactly zero beyond some n — a cliff, not a steady straight-line fall.',
        3: 'The decay rate is the clearest thing the coefficients tell you: it measures smoothness.',
      },
      hints: ['Compare with the power laws: does any 1/nᵏ fall in a straight line on this plot?', t`Faster than every power means every derivative exists; geometric decay $e^{-an}$ means more: $\sum a_n e^{inz}$ converges for complex $z$ with $|\operatorname{Im} z| < a$.`],
      teach: 'Coefficients falling faster than any power mean a smooth function; falling geometrically means an analytic one.',
      explain: t`With $|a_n| \lesssim e^{-0.5n}$, the series $\sum a_n\cos nz$ still converges for complex $z$ with $|\operatorname{Im} z| < 0.5$, so the field is analytic in that strip. This is why spectral methods for smooth fields — such as the SpEC code for binary black holes — converge exponentially: double the modes, square the error.`,
    }),
    code({
      id: 'fft-coeffs', difficulty: 3,
      prompt: t`Compute Fourier coefficients with the FFT. On the grid $x_j = 2\pi j/M$, $j = 0, \dots, M - 1$, the trapezoid rule for $a_n$ and $b_n$ is exactly a discrete Fourier transform: with $X = $ \`np.fft.rfft(f(x))\`, $a_n = \tfrac{2}{M}\operatorname{Re}X_n$ and $b_n = -\tfrac{2}{M}\operatorname{Im}X_n$.

Write \`coeffs_fft(f, M, N)\` returning two arrays \`a\`, \`b\` of $a_0, \dots, a_N$ and $b_0, \dots, b_N$. The program then checks it on $e^{\cos x}$ (exact $a_1 = 2I_1(1) = 1.1303182079849700$) and on the periodic parabola $x^2$ (exact $a_1 = -4$).`,
      starter: t`import numpy as np

def coeffs_fft(f, M, N):
    x = 2 * np.pi * np.arange(M) / M
    # take the FFT of the samples and scale it
    pass

a, b = coeffs_fft(lambda x: np.exp(np.cos(x)), 64, 5)
print("e^cos x, M = 64:  a1 error", abs(a[1] - 1.1303182079849700))
parab = lambda x: ((x + np.pi) % (2 * np.pi) - np.pi) ** 2
a, b = coeffs_fft(parab, 64, 5)
print("x^2,     M = 64:  a1 error", abs(a[1] + 4))
`,
      answer: t`import numpy as np

def coeffs_fft(f, M, N):
    x = 2 * np.pi * np.arange(M) / M
    X = np.fft.rfft(f(x))
    a = 2 * X.real[:N + 1] / M
    b = -2 * X.imag[:N + 1] / M
    return a, b

a, b = coeffs_fft(lambda x: np.exp(np.cos(x)), 64, 5)
print("e^cos x, M = 64:  a1 error", abs(a[1] - 1.1303182079849700))
parab = lambda x: ((x + np.pi) % (2 * np.pi) - np.pi) ** 2
a, b = coeffs_fft(parab, 64, 5)
print("x^2,     M = 64:  a1 error", abs(a[1] + 4))
`,
      tests: [
        { name: 'e^(cos x): a₁ correct to round-off with only 64 points', code: 'abs(coeffs_fft(lambda x: np.exp(np.cos(x)), 64, 5)[0][1] - 1.1303182079849700) < 1e-13' },
        { name: 'e^(cos x): a₀ is 2I₀(1) = 2.5321317555', code: 'abs(coeffs_fft(lambda x: np.exp(np.cos(x)), 64, 5)[0][0] - 2.532131755504017) < 1e-12' },
        { name: 'x²: a₁ ≈ −4 and a₂ ≈ 1 with 1024 points', code: 'abs(coeffs_fft(lambda x: ((x + np.pi) % (2*np.pi) - np.pi)**2, 1024, 5)[0][1] + 4) < 1e-4 and abs(coeffs_fft(lambda x: ((x + np.pi) % (2*np.pi) - np.pi)**2, 1024, 5)[0][2] - 1) < 1e-4' },
        { name: 'sin 3x: b₃ = 1 and every a is 0', code: 'abs(coeffs_fft(lambda x: np.sin(3*x), 32, 5)[1][3] - 1) < 1e-12 and np.allclose(coeffs_fft(lambda x: np.sin(3*x), 32, 5)[0], 0, atol=1e-12)' },
        { name: 'returns N + 1 values of each', code: 'len(coeffs_fft(lambda x: np.cos(x), 16, 4)[0]) == 5 and len(coeffs_fft(lambda x: np.cos(x), 16, 4)[1]) == 5' },
      ],
      hints: ['`X = np.fft.rfft(f(x))` gives the complex sums Σ f(xⱼ) e^(−2πi jn/M) for n = 0 … M/2.', 'Then `a = 2 * X.real[:N + 1] / M` and `b = -2 * X.imag[:N + 1] / M`.'],
      teach: 'On an evenly spaced periodic grid the trapezoid rule for Fourier coefficients is the discrete Fourier transform — and the FFT computes it.',
      explain: t`For the analytic $e^{\cos x}$, 64 points give $a_1$ to $10^{-16}$; for the cornered parabola, 64 points miss by about $3\times10^{-3}$ and 1024 by $1.3\times10^{-5}$. The error of the sampled coefficient is **aliasing**: harmonics $M \pm n$, $2M \pm n, \dots$ look identical to $n$ on the grid and are added in. They are tiny for a smooth function and fall only like $1/M^2$ for one with corners.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-instability', difficulty: 3, transfer: true,
      prompt: t`A periodic chamber-pressure oscillation in a liquid rocket engine has a third harmonic $0.11$ times as strong as its fundamental, a fifth harmonic $0.04$ times, and no even harmonics. What does that suggest about the shape of the waveform?`,
      visual: { type: 'graph', params: { x: [0, 7], y: [-2.4, 0.3], aspect: 'wide', xlabel: 'harmonic n', ylabel: 'amplitude', ylog: true, axesAt: 'edge', points: [{ x: 1, y: 0, color: 'accent', label: '1' }, { x: 3, y: Math.log10(0.11), color: 'accent', label: '0.11' }, { x: 5, y: Math.log10(0.04), color: 'accent', label: '0.04' }] }, caption: 'The measured harmonics relative to the fundamental, on a log scale.' },
      choices: ['corners but no jumps, like a triangle wave: amplitudes fall like 1/n²', 'jumps, like a square or sawtooth wave: amplitudes fall like 1/n', 'a pure sinusoid', 'a train of very narrow spikes'],
      answer: 0,
      why: {
        1: t`Jumps give $1/n$: the third harmonic would be about $1/3 \approx 0.33$ of the fundamental, the fifth $0.2$.`,
        2: 'A pure sinusoid has no harmonics at all.',
        3: 'Narrow spikes have harmonics nearly as strong as the fundamental out to n ~ 1/(spike width).',
      },
      hints: [t`Compare $0.11$ with $1/3$ and with $1/9$, and $0.04$ with $1/5$ and $1/25$.`],
      teach: 'The ratio of harmonics measures smoothness: 1/n for a jump, 1/n² for a corner.',
      explain: t`$1/3^2 \approx 0.111$ and $1/5^2 = 0.04$: the harmonics fall like $1/n^2$, the signature of a waveform with corners but no jumps (missing even harmonics mean half-wave symmetry, $p(t + T/2) = -p(t)$, as a triangle has). A steepening wave that formed a shock would show $1/n$ instead.`,
    }),
    num({
      id: 'cp-valve', difficulty: 3, transfer: true,
      gen(r) {
        const S = r.pick([1, 2, 3, 5]), f0 = r.pick([5, 10, 20]);
        const ans = (4 * S) / (9 * PI * PI);
        return {
          prompt: t`A thrust-control valve’s pintle moves back and forth at a steady speed between $0$ and $${S}$ mm, $${f0}$ times a second: a triangle wave. What is the amplitude of its third harmonic, at $${3 * f0}$ Hz, in mm? (A triangle between $0$ and $1$ is $\tfrac12 - \tfrac{4}{\pi^2}\sum_{n\ \text{odd}}\frac{\cos n\omega_0 t}{n^2}$.)`,
          visual: { type: 'graph', params: { x: [0, 3 / f0], y: [-0.3 * S, 1.3 * S], aspect: 'wide', xlabel: 't (s)', ylabel: 'mm', axesAt: 'edge', curves: [{ fn: `${S}*abs(2*(x*${f0} - floor(x*${f0} + 0.5)))`, color: 'accent', width: 2.2 }] }, caption: 'The pintle position over three cycles (constant speed each way, instant reversals).' },
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (4 * S) / (3 * PI * PI), feedback: 'A triangle’s harmonics fall like 1/n², so the third carries 1/9 of the first’s factor, not 1/3.' }, { value: (4 * S) / (PI * PI), feedback: 'That is the fundamental. The third harmonic has an extra 1/3² = 1/9.' }, { value: (4 * S) / (9 * PI * PI) / 2, feedback: 'The stroke is the full swing 0 → S; the series for 0 → 1 scales by S, not S/2.' }],
          hints: [t`Scale the given series by $${S}$ mm.`, t`The third harmonic’s coefficient is $\frac{4}{\pi^2}\cdot\frac{1}{3^2}$ times the stroke.`],
          teach: 'Scale a known series to the problem, then read off the harmonic: the stroke multiplies every coefficient.',
          explain: t`$\frac{4\times${S}}{9\pi^2} = ${r3(ans)}$ mm — ${r3(100 / 9)}% of the fundamental’s $${r3((4 * S) / (PI * PI))}$ mm. If the valve reversed with a jump in position (impossible) the harmonic would be 1/3 as large as the fundamental; its corners make it 1/9.`,
        };
      },
    }),
    mcq({
      id: 'cp-alias', difficulty: 3,
      prompt: t`With $M = 64$ samples per period, the FFT gives $a_1$ of $e^{\cos x}$ correct to $10^{-16}$ but $a_1$ of the periodic parabola $x^2$ wrong by $3\times10^{-3}$. Why the difference?`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'cos(x)', color: 'accent', width: 2.2, label: 'cos x', labelAt: -2.2, labelDy: 14 }, { fn: 'cos(9x)', color: 'warn', width: 1.2, dash: [4, 3], samples: 1500, label: 'cos 9x', labelAt: 0.35, labelDy: -12 }], points: [...Array(8).keys()].map((j) => ({ x: -PI + (2 * PI * j) / 8, y: Math.cos(-PI + (2 * PI * j) / 8), color: 'gold', r: 4.5 })) }, caption: 'With 8 samples (gold dots), cos 9x and cos x take identical values: the grid cannot tell harmonic 9 from harmonic 1.' },
      choices: ['On the grid, harmonics M ± n masquerade as n (aliasing); their coefficients are negligible for an analytic function but fall only like 1/n² for one with corners', 'The FFT has round-off error that grows with the size of the function', 'The FFT only works for functions that are sums of cosines', 'x² is not periodic, so its coefficients do not exist'],
      answer: 0,
      why: {
        1: 'Round-off is about 10⁻¹⁶ in both cases; a 3×10⁻³ error is far too large for it.',
        2: 'The FFT works for any samples; both functions here are even, so both have pure cosine series anyway.',
        3: 'Repeated with period 2π, x² is periodic (and continuous); its coefficients are 4(−1)ⁿ/n².',
      },
      hints: ['Look at the picture: what does the grid see when it samples cos 9x?', t`The sampled $a_1$ really computes $a_1 + a_{63} + a_{65} + a_{127} + \cdots$.`],
      teach: 'A sampled Fourier coefficient is the true one plus every aliased harmonic; smoothness decides how much that is.',
      explain: t`Sampling at $M$ points folds harmonic $kM \pm n$ onto $n$, so the computed $a_1 = a_1 + a_{63} + a_{65} + \cdots$. For $x^2$, $a_{63} + a_{65} \approx -\frac{4}{63^2} - \frac{4}{65^2} \approx -2\times10^{-3}$, and the rest of the aliases bring the total to about $3\times10^{-3}$. For $e^{\cos x}$ the aliased coefficients are below $10^{-80}$.`,
    }),
  ],
  sources: [SRC.stein, SRC.korner, SRC.boas],
});
