// Complex Fourier series: one coefficient formula instead of three, the
// reality condition, shifts as rotations of cₙ, derivatives as multiplication
// by in, symmetric sums of shifted copies killing harmonics, and the Dirichlet
// kernel — the closed form of a partial sum that drives all of module E2.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
const SH = Math.sinh(PI / 2);   // e^(x/2) example: sinh(aπ) with a = ½
const cEx = (n) => { const s = ((n % 2 ? -1 : 1) * SH) / PI, d = 0.25 + n * n; return [(s * 0.5) / d, (s * n) / d]; };   // c_n = (−1)ⁿ sinh(π/2)/(π(½ − in))

export default lesson({
  id: 'st-e.E1.3',
  title: 'Complex Fourier series',
  minutes: 15, difficulty: 3,
  intro: t`Euler’s formula $e^{inx} = \cos nx + i\sin nx$ folds each cosine–sine pair into two exponentials, $e^{inx}$ and $e^{-inx}$, and the three coefficient formulas into one:

$$f(x) \sim \sum_{n=-\infty}^{\infty} c_n\,e^{inx}, \qquad c_n = \frac{1}{2\pi}\int_{-\pi}^{\pi} f(x)\,e^{-inx}\,dx$$

With the complex inner product $\langle f, g\rangle = \int_{-\pi}^{\pi} f\,\bar g\,dx$ the exponentials are orthogonal, each of squared length $2\pi$, and $c_n$ is again a projection. The payoff is algebra: a **shift** of $f$ multiplies $c_n$ by a phase, a **derivative** multiplies it by $in$, and a partial sum is a geometric series you can add up in closed form. The two forms are tied by $c_n = \tfrac12(a_n - ib_n)$ and, for real $f$, $c_{-n} = \overline{c_n}$. (Physics courses such as [PHYS 3750](#/lesson/phys3750.W6.1) often write $e^{-in\omega_0t}$ instead; only the sign of $n$ changes.)`,
  symbols: [
    { tex: 'c_n', text: 'the complex coefficient of $e^{inx}$, for every integer $n$ (negative ones too); units of $f$' },
    { tex: 'e^{inx}', text: 'a unit phasor turning $n$ times per period — anticlockwise for $n > 0$, clockwise for $n < 0$' },
    { tex: '\\tfrac{1}{2\\pi}', text: 'one over the squared length $\\int_{-\\pi}^{\\pi}|e^{inx}|^2dx = 2\\pi$' },
    { tex: '\\overline{c_n}', text: 'the complex conjugate of $c_n$' },
    { tex: 'n', text: 'any integer, $-\\infty < n < \\infty$' },
  ],
  why: t`Every numerical spectrum — the FFT of a gravitational-wave strain, the modes of a spectral relativity code — is a list of complex $c_n$; their phases carry timing, their magnitudes carry power.`,
  visual: {
    type: 'graph',
    title: 'The Dirichlet kernel: a partial sum in closed form',
    lead: t`Adding the harmonics $n = -N, \dots, N$ of $f$ is the same as smearing $f$ with the **Dirichlet kernel**:
$$\begin{gathered}D_N(x) = \sum_{n=-N}^{N} e^{inx} = \frac{\sin\big((N + \frac12)x\big)}{\sin(x/2)}, \\ S_Nf(x) = \frac{1}{2\pi}\int_{-\pi}^{\pi} f(y)\,D_N(x - y)\,dy .\end{gathered}$$
Watch its shape as $N$ grows.`,
    tasks: [
      'Raise N: the central spike grows to 2N + 1 and narrows to width about 2π/(2N + 1).',
      'The readout of the area divided by 2π stays exactly 1 for every N.',
      'The side lobes alternate in sign and do not die away fast: the negative lobes are where Gibbs ringing will come from (module E2).',
    ],
    params: {
      x: [-3.1416, 3.1416], y: [-9, 42], aspect: 'wide', xlabel: 'x (rad)', ylabel: 'kernel', axesAt: 'edge',
      sliders: [{ key: 'N', label: 'Harmonics $N$', min: 1, max: 20, step: 1, value: 5, explain: 'The partial sum keeps $n = -N, \\dots, N$.' }],
      curves: [{ fn: 'sin((N + 0.5)*x)/sin(x/2)', color: 'accent', width: 2.2, samples: 2000 }],
      integral: { fn: 'sin((N + 0.5)*x)/sin(x/2)', from: -3.14159, to: 3.1416 },
      readouts: [{ label: 'height at the centre, $2N + 1$', expr: '2*N + 1', digits: 3 }, { label: 'area ÷ $2\\pi$', expr: 'integral/(2*pi)', digits: 4 }],
    },
    caption: t`$D_N$ is real and even because the $n$ and $-n$ terms pair into $1 + 2\sum\cos nx$. Its area over a period is $2\pi$ for every $N$: only the $n = 0$ term survives integration.`,
  },
  example: {
    prompt: t`Find the complex Fourier coefficients of $f(x) = e^{x/2}$ on $-\pi < x < \pi$, repeated with period $2\pi$. Check that they satisfy the reality condition, and recover $a_n$ and $b_n$.`,
    visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-0.6, 5.4], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^((x - 2*pi*floor((x + pi)/(2*pi)))/2)', color: 'ink3', dash: [5, 4], width: 1.5 }, { sum: `${SH / PI}*(-1)^k*(0.5*cos(k*x) - k*sin(k*x))/(0.25 + k^2)*(2 - step(0.5 - k)*1)`, k: [0, 12], color: 'accent', width: 2.2 }] }, caption: t`$e^{x/2}$ repeated (dashed) and the sum of its terms with $|n| \le 12$ (blue): the jump at $x = \pm\pi$ makes the coefficients fall only like $1/n$.` },
    steps: [
      { label: 'One integral', text: t`$c_n = \dfrac1{2\pi}\displaystyle\int_{-\pi}^{\pi} e^{(\frac12 - in)x}\,dx = \dfrac{1}{2\pi}\,\dfrac{e^{(\frac12 - in)\pi} - e^{-(\frac12 - in)\pi}}{\frac12 - in}$.` },
      { label: 'Simplify', text: t`$e^{\mp in\pi} = (-1)^n$, so the numerator is $(-1)^n\big(e^{\pi/2} - e^{-\pi/2}\big) = 2(-1)^n\sinh\frac\pi2$:
$$c_n = \frac{(-1)^n\sinh(\pi/2)}{\pi\,(\frac12 - in)} .$$` },
      { label: 'Numbers', text: t`$c_0 = \dfrac{2\sinh(\pi/2)}{\pi} = ${r4(cEx(0)[0])}$, the mean of $e^{x/2}$. $c_1 = ${r4(cEx(1)[0])} ${cEx(1)[1] < 0 ? '-' : '+'} ${r4(Math.abs(cEx(1)[1]))}i$ and $c_{-1} = ${r4(cEx(-1)[0])} ${cEx(-1)[1] < 0 ? '-' : '+'} ${r4(Math.abs(cEx(-1)[1]))}i$.` },
      { label: 'Reality check', text: t`Replacing $n$ by $-n$ turns $\frac12 - in$ into its conjugate, so $c_{-n} = \overline{c_n}$ — as it must for a real $f$: the terms $c_ne^{inx} + c_{-n}e^{-inx} = 2\operatorname{Re}(c_ne^{inx})$ are real.` },
      { label: 'Back to sines', text: t`$a_n = 2\operatorname{Re}c_n = \dfrac{(-1)^n\sinh(\pi/2)}{\pi(\frac14 + n^2)}$ and $b_n = -2\operatorname{Im}c_n = -\dfrac{2n(-1)^n\sinh(\pi/2)}{\pi(\frac14 + n^2)}$ — from one integral, with no integration by parts at all.` },
      { label: 'Sense check', text: t`$|c_n| \approx \sinh(\pi/2)/(\pi n)$ for large $n$: the $1/n$ of a jump, here from $e^{\pi/2}$ down to $e^{-\pi/2}$ at $x = \pi$. And as the exponent $\frac12 \to 0$, $c_n \to 0$ except $c_0 \to 1$: the constant function 1.` },
    ],
    answer: t`$c_n = \dfrac{(-1)^n\sinh(\pi/2)}{\pi(\frac12 - in)}$, with $c_{-n} = \overline{c_n}$; $a_n = 2\operatorname{Re}c_n$, $b_n = -2\operatorname{Im}c_n$.`,
  },
  practice: [
    num({
      id: 'from-real', difficulty: 1,
      gen(r) {
        const a = r.intExcept(-4, 4, [0]), b = r.intExcept(-4, 4, [0]), n = r.int(2, 5);
        const ans = 0.5 * Math.hypot(a, b);
        return {
          prompt: t`A real signal has the harmonic $${a}\cos ${n}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}\sin ${n}x$. What is $|c_{${n}}|$, the magnitude of its complex coefficient?`,
          visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-6.2, 6.2], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `${a}*cos(${n}x) + ${b}*sin(${n}x)`, color: 'accent', width: 2.2 }] }, caption: 'The real harmonic: one sinusoid, made of the pair $c_ne^{inx} + c_{-n}e^{-inx}$.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`That is the amplitude of the real sinusoid, $\sqrt{a_n^2 + b_n^2}$. It is shared equally between $c_n$ and $c_{-n}$: $c_n = \tfrac12(a_n - ib_n)$.` }],
          hints: [t`$c_n = \tfrac12(a_n - ib_n)$.`, t`$|c_n| = \tfrac12\sqrt{a_n^2 + b_n^2}$.`],
          teach: 'A real sinusoid of amplitude A is two counter-rotating phasors of length A/2 each.',
          explain: t`$c_{${n}} = \tfrac12(${a} ${b < 0 ? '+' : '-'} ${Math.abs(b)}i)$, so $|c_{${n}}| = \tfrac12\sqrt{${a * a} + ${b * b}} = ${r4(ans)}$. The sinusoid’s amplitude $${r4(2 * ans)}$ is split between $c_{${n}}$ and $c_{-${n}}$.`,
        };
      },
    }),
    num({
      id: 'square-cn', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 3, 5, -1, -3, 7]);
        const ans = -2 / (PI * n);
        return {
          prompt: t`The square wave $f = \operatorname{sign}x$ on $(-\pi, \pi)$ has $b_n = \frac{4}{\pi n}$ for odd $n > 0$ and every $a_n = 0$. Its complex coefficient $c_{${n}}$ is purely imaginary. What is $\operatorname{Im}c_{${n}}$?`,
          visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.45, 1.45], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'step(x)*2 - 1', color: 'ink3', dash: [5, 4], width: 1.4, domain: [-3.14, 3.14] }, { sum: '4/((2k - 1)*pi)*sin((2k - 1)*x)', k: [1, 6], color: 'accent', width: 2.2 }] }, caption: 'The square wave and six of its odd sine harmonics.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`Watch the sign: $c_n = \tfrac12(a_n - ib_n)$ carries a minus in front of $ib_n$${n < 0 ? t`, and for negative $n$, $c_{n} = \overline{c_{|n|}}$` : ''}.` }, { value: 2 * ans, feedback: t`Remember the $\tfrac12$: $c_n = \tfrac12(a_n - ib_n)$.` }],
          hints: [t`For $n > 0$, $c_n = \tfrac12(a_n - ib_n)$; for $n < 0$, use $c_{n} = \overline{c_{-n}}$ (the function is real).`, t`Or compute directly: $c_n = \frac{1}{2\pi}\int_{-\pi}^{\pi}\operatorname{sign}x\,e^{-inx}dx = \frac{1 - (-1)^n}{i\pi n}$.`],
          teach: 'For a real odd function the cₙ are purely imaginary, and c₋ₙ = −cₙ.',
          explain: t`$c_n = \dfrac{1 - (-1)^n}{i\pi n} = -\dfrac{2i}{\pi n}$ for odd $n$ (of either sign), so $\operatorname{Im}c_{${n}} = ${r4(ans)}$.`,
        };
      },
    }),
    mcq({
      id: 'antiperiodic', difficulty: 2,
      prompt: t`A function $f$ has coefficients $c_n$. Which harmonics does $g(x) = f(x) - f(x - \pi)$ contain?`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: '0.8*cos(x) + 0.5*sin(2x) + 0.3*cos(3x)', color: 'ink3', dash: [5, 4], width: 1.5, label: 'f', labelAt: -2.6, labelDy: -8 }, { fn: '1.6*cos(x) + 0.6*cos(3x)', color: 'accent', width: 2.2, label: 'g', labelAt: 0.5, labelDy: -12 }] }, caption: 'An example: f has harmonics 1, 2 and 3 (dashed); g = f(x) − f(x − π) (blue).' },
      choices: [t`only odd $n$, with $c_n$ doubled`, t`only even $n$, with $c_n$ doubled`, 'every harmonic, each turned by a phase', 'none: g is zero'],
      answer: 0,
      why: {
        1: t`For even $n$, $e^{-in\pi} = 1$ and the two copies cancel. It is the sum $f(x) + f(x - \pi)$ that keeps only even $n$.`,
        2: t`The shift turns $c_n$ by $e^{-in\pi} = (-1)^n$ — a sign, not a general phase — so the copies either cancel or add.`,
        3: t`Only if $f$ has period $\pi$, so that $f(x - \pi) = f(x)$ — that is, only even harmonics to start with.`,
      },
      hints: [t`Shifting by $s$ multiplies $c_n$ by $e^{-ins}$.`, t`So $g$ has coefficients $c_n\big(1 - e^{-in\pi}\big) = c_n\big(1 - (-1)^n\big)$.`],
      teach: 'A shift by s multiplies cₙ by $e^{-ins}$; sums of shifted copies keep only the harmonics whose phases line up.',
      explain: t`$g$ has coefficients $c_n(1 - (-1)^n)$: $0$ for even $n$, $2c_n$ for odd $n$. The result satisfies $g(x - \pi) = -g(x)$ — half-wave symmetry — which is exactly the condition for odd harmonics only.`,
    }),
    expr({
      id: 'dirichlet', difficulty: 3,
      gen(r) {
        const N = r.int(2, 6);
        return {
          prompt: t`Add up $\displaystyle\sum_{n=-${N}}^{${N}} e^{inx}$ in closed form, as a ratio of two sines (for $0 < x < \pi$).`,
          visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-4, 2 * N + 2], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `1 + 2*(${[...Array(N).keys()].map((j) => `cos(${j + 1}x)`).join(' + ')})`, color: 'accent', width: 2.2 }] }, caption: t`The sum itself, drawn term by term as $1 + 2\sum_{n=1}^{${N}}\cos nx$.` },
          answer: `sin(${N + 0.5}x)/sin(x/2)`,
          answerTeX: t`\frac{\sin\big(${N}\tfrac12\,x\big)}{\sin(x/2)}`,
          vars: { x: [0.2, 3] },
          errors: [{ answer: `sin(${N}x)/sin(x)`, feedback: t`Close in spirit, but count the terms: there are $${2 * N + 1}$, so the numerator’s frequency is $(${2 * N + 1})/2$ and the denominator’s $\tfrac12$.` }, { answer: `sin(${N + 0.5}x)/sin(x)`, feedback: t`The denominator comes from $e^{ix/2} - e^{-ix/2} = 2i\sin(x/2)$.` }],
          hints: [t`It is a geometric series with ratio $e^{ix}$: $\sum_{n=-N}^{N} e^{inx} = e^{-iNx}\dfrac{e^{i(2N+1)x} - 1}{e^{ix} - 1}$.`, t`Multiply top and bottom by $e^{-ix/2}$ to make both symmetric: $\dfrac{e^{i(N+\frac12)x} - e^{-i(N+\frac12)x}}{e^{ix/2} - e^{-ix/2}}$.`],
          teach: 'In complex form a partial Fourier sum is a geometric series, and its closed form is the Dirichlet kernel.',
          explain: t`$\displaystyle\sum_{n=-${N}}^{${N}} e^{inx} = \frac{\sin(${N + 0.5}x)}{\sin(x/2)} = D_{${N}}(x)$, the Dirichlet kernel; at $x \to 0$ it tends to $${2 * N + 1}$, the number of terms.`,
        };
      },
    }),
    mcq({
      id: 'derivative-comb', difficulty: 3,
      prompt: t`The pictured function has $c_n = \dfrac{1}{1 + n^2}$ for every integer $n$. Using the derivative rule, what is $f - f''$?`,
      visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-0.2, 3.4], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'pi*cosh(pi - abs(x - 2*pi*floor((x + pi)/(2*pi))))/sinh(pi)', color: 'accent', width: 2.2 }] }, caption: 'f(x) = π cosh(π − |x|)/sinh π, repeated: smooth except for a corner at each multiple of 2π.' },
      choices: [t`a spike at each multiple of $2\pi$: $2\pi\sum_k\delta(x - 2\pi k)$`, '0 everywhere', 'the constant 1', t`$f$ itself`],
      answer: 0,
      why: {
        1: t`Between the corners $f - f'' = 0$ indeed (cosh solves it) — but the coefficients of $f - f''$ are all 1, not 0, so something sits at the corners.`,
        2: t`The constant 1 has $c_0 = 1$ and every other $c_n = 0$. Here every coefficient is 1.`,
        3: t`$f$ would need $(1 + n^2)c_n = c_n$, true only for $n = 0$.`,
      },
      hints: [t`Differentiating multiplies $c_n$ by $in$, so $f''$ has coefficients $-n^2c_n$.`, t`$f - f''$ has coefficients $(1 + n^2)c_n = 1$ for every $n$. Which “function” has all its coefficients equal?`],
      teach: 'Derivatives multiply cₙ by in; coefficients that do not decay at all belong to a periodic train of delta spikes.',
      explain: t`$f - f''$ has $c_n = (1 + n^2)\cdot\frac{1}{1 + n^2} = 1$ for every $n$, and $\sum_n e^{inx} = 2\pi\sum_k\delta(x - 2\pi k)$ — the limit of the Dirichlet kernel. So $f$ is the periodic **Green’s function** of $1 - d^2/dx^2$: its corners carry the delta. Away from them $f - f'' = 0$, as $\cosh$ requires.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-blades', difficulty: 3, transfer: true,
      gen(r) {
        const Z = r.pick([5, 6, 7, 9, 11]), rpm = r.pick([24000, 30000, 36000, 42000]);
        const fs = rpm / 60, ans = Z * fs;
        return {
          prompt: t`A turbopump impeller with $Z = ${Z}$ identical blades spins at ${rpm.toLocaleString('en-US').replace(/,/g, ' ')} rpm. A pressure sensor on the casing sees the same pulse from every blade: $p(\theta) = \sum_{k=0}^{${Z - 1}} g\big(\theta - 2\pi k/${Z}\big)$, with $\theta$ the shaft angle and $g$ any $2\pi$-periodic pulse. What is the lowest nonzero frequency in its spectrum, in Hz?`,
          visual: { type: 'graph', params: { x: [-1.25, 1.25], y: [-1.25, 1.25], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2 }], arrows: [...Array(Z).keys()].map((k) => ({ from: [0, 0], to: [0.95 * Math.cos((2 * PI * k) / Z), 0.95 * Math.sin((2 * PI * k) / Z)], color: 'accent', width: 2 })), points: [{ x: 1.12, y: 0, color: 'gold', label: 'sensor', labelDy: 0, labelDx: 8 }] }, caption: 'Schematic impeller: blades every 2π/Z, one sensor on the casing.' },
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: fs, feedback: t`That is the shaft frequency. Summing $Z$ copies shifted by $2\pi/Z$ multiplies $c_n$ by $\sum_k e^{-2\pi ikn/Z}$, which vanishes unless $Z$ divides $n$.` }],
          hints: [t`Shifting by $2\pi k/Z$ multiplies $c_n$ by $e^{-2\pi i kn/Z}$. Sum over $k$.`, t`$\sum_{k=0}^{Z-1} e^{-2\pi ikn/Z}$ is $Z$ when $n$ is a multiple of $Z$ and $0$ otherwise.`],
          teach: 'Z equally spaced copies of a pulse keep only every Z-th harmonic: the blade-passing frequency and its multiples.',
          explain: t`$p$ has coefficients $c_n\sum_k e^{-2\pi ikn/${Z}}$, which is $${Z}c_n$ if ${Z} divides $n$ and 0 otherwise. The lowest surviving harmonic is $n = ${Z}$ of the shaft frequency $${fs}$ Hz: the blade-passing frequency $${ans}$ Hz.`,
        };
      },
    }),
    mcq({
      id: 'cp-real', difficulty: 2,
      prompt: t`Which pair of coefficients makes $c_2e^{2ix} + c_{-2}e^{-2ix}$ a **real** function of $x$?`,
      visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1.15, 1.15], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }], arrows: [{ from: [0, 0], to: [0.866, 0.5], color: 'accent', label: 'e^(2ix)' }, { from: [0, 0], to: [0.866, -0.5], color: 'warn', label: 'e^(−2ix)', labelDy: 14 }] }, caption: 'At any x the two phasors are mirror images in the real axis.' },
      choices: [t`$c_2 = 1 + i$, $c_{-2} = 1 - i$`, t`$c_2 = 1 + i$, $c_{-2} = 1 + i$`, t`$c_2 = i$, $c_{-2} = i$`, t`$c_2 = 1 + i$, $c_{-2} = -1 + i$`],
      answer: 0,
      why: {
        1: t`Then the sum is $(1 + i)\cdot2\cos2x$, complex for every $x$ where $\cos2x \neq 0$.`,
        2: t`Then the sum is $2i\cos2x$: purely imaginary.`,
        3: t`$c_{-2} = -\overline{c_2}$ makes the sum purely imaginary: $2i\operatorname{Im}\big(c_2e^{2ix}\big)$.`,
      },
      hints: [t`A real sum needs each term to be the conjugate of the other.`],
      teach: 'A function is real exactly when c₋ₙ is the complex conjugate of cₙ for every n.',
      explain: t`With $c_{-2} = \overline{c_2}$ the second term is the conjugate of the first, so the sum is $2\operatorname{Re}\big((1 + i)e^{2ix}\big) = 2\cos2x - 2\sin2x$: real, with $a_2 = 2$ and $b_2 = -2$.`,
    }),
    mcq({
      id: 'cp-midpoint', difficulty: 3,
      prompt: t`A partial sum is a smearing with the Dirichlet kernel: $S_Nf(x) = \frac{1}{2\pi}\int_{-\pi}^{\pi} f(y)\,D_N(x - y)\,dy$, where $D_N$ is even and $\frac1{2\pi}\int_{-\pi}^{\pi} D_N = 1$. At a point where $f$ jumps from $-1$ to $+1$, what value do the partial sums approach as $N \to \infty$?`,
      visual: { type: 'graph', params: { x: [-1.5, 1.5], y: [-8, 26], aspect: 'wide', xlabel: 'x − y (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'sin(12.5x)/sin(x/2)', color: 'accent', width: 2, samples: 1500 }], shade: [{ fn: 'max(sin(12.5x)/sin(x/2), 0)', from: 0.0001, to: 1.5, color: 'gold', alpha: 0.25 }], vlines: [{ x: 0 }] }, caption: 'D₁₂ near its centre: an even spike. Each side of the jump sees one half of it.' },
      choices: ['0, the midpoint of the jump', '+1, the right-hand value', '−1, the left-hand value', 'nothing: the partial sums diverge there'],
      answer: 0,
      why: {
        1: 'The kernel is even, so it weighs the left side exactly as much as the right side.',
        2: 'The same symmetry argument rules out the left value too.',
        3: t`The partial sums converge at a jump; for the square wave $\operatorname{sign}x$, every one of them is exactly 0 there.`,
      },
      hints: ['As N grows, the kernel’s mass crowds into a spike at y = x. How much of the spike lies on each side of the jump?', t`Because $D_N$ is even, exactly half its weight lies on each side: the sum averages $-1$ and $+1$.`],
      teach: 'An even kernel of total weight 1 averages the two sides of a jump: Fourier series converge to the midpoint there.',
      explain: t`As $N \to \infty$, $D_N/2\pi$ acts like a unit spike, half its weight on each side of $x$ (it is even). So $S_Nf(x) \to \tfrac12\big(f(x^-) + f(x^+)\big) = 0$. Making this rigorous for any piecewise-smooth $f$ is Dirichlet’s theorem, in [the next lesson](#/lesson/st-e.E2.1).`,
    }),
  ],
  sources: [SRC.stein, SRC.korner],
});
