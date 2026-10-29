// Periodic functions as sums of sines: the trigonometric system as an
// orthogonal set of axes in a space of functions, what the series claims (and
// what it does not yet claim — convergence is module E2), parity, product-to-
// sum, periodic extensions, and where harmonics come from in real spectra.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export default lesson({
  id: 'st-e.E1.1',
  title: 'Periodic functions as sums of sines',
  minutes: 14, difficulty: 2,
  intro: t`A function that repeats every $2\pi$ can only be built from waves that also repeat every $2\pi$: the constant, and $\cos nx$, $\sin nx$ for whole numbers $n$. Fourier’s claim is that these are **enough** — every reasonable periodic function is a sum of them:

$$f(x) \sim \frac{a_0}{2} + \sum_{n=1}^{\infty}\big(a_n\cos nx + b_n\sin nx\big)$$

The mathematician’s reading: treat functions as vectors, with the **inner product** $\langle f, g\rangle = \int_{-\pi}^{\pi} f(x)\,g(x)\,dx$. Then $1, \cos x, \sin x, \cos 2x, \dots$ are **mutually perpendicular axes**, and $a_n$, $b_n$ are the components of $f$ along them. The sign $\sim$ is honest bookkeeping: it says “has this series”, not “equals” — in what sense the sum converges to $f$ is the subject of [module E2](#/lesson/st-e.E2.1). A signal of period $T$ is the same story with $x = \omega_0 t$, $\omega_0 = 2\pi/T$.`,
  symbols: [
    { tex: 'f(x)', text: 'a function with period $2\\pi$: $f(x + 2\\pi) = f(x)$ for every $x$' },
    { tex: 'x', text: 'the variable, in radians of phase; for a signal of period $T$, $x = \\omega_0 t$' },
    { tex: 'n', text: 'the harmonic number, $1, 2, 3, \\dots$; harmonic $n$ repeats $n$ times per period' },
    { tex: 'a_n,\\ b_n', text: 'the Fourier coefficients: how much of $\\cos nx$ and of $\\sin nx$ the function contains (same units as $f$)' },
    { tex: '\\tfrac{a_0}{2}', text: 'the constant term — the mean value of $f$ over a period (the $\\tfrac12$ is a convention that keeps one formula for every $a_n$)' },
    { tex: '\\sim', text: '“has the Fourier series”: a statement about coefficients, not yet about convergence' },
    { tex: '\\omega_0', text: 'the fundamental angular frequency $2\\pi/T$ of a signal with period $T$, in rad/s' },
  ],
  why: t`A periodic orbit radiates a periodic gravitational wave, so its signal lives only at whole multiples of the orbital frequency — the Fourier series is how LISA and pulsar-timing searches are built.`,
  visual: {
    type: 'fa-series',
    title: 'Building a periodic function from harmonics',
    lead: t`Top: one period of a function (dashed) and the sum of its first $N$ harmonics (blue). Bottom: how much of the function’s mean square $\langle f^2\rangle$ sits in each harmonic — the bars in the sum are blue, the rest grey.`,
    tasks: [
      'Square wave: only odd harmonics carry anything. Raise N from 1 to 15 and watch the corners sharpen.',
      'Switch to the triangle: with N = 3 the sum already looks right — its bars die off far faster.',
      'Switch to the smooth function: by n = 4 the bars are invisible. Smoothness decides how fast harmonics fade.',
    ],
    params: { wave: 'square', waves: ['square', 'triangle', 'saw', 'smooth', 'pulse'], N: 3, Nmax: 40, panels: ['x', 'spec'], nshow: 15, readouts: ['N', 'energy'] },
    caption: 'Each function has period 2π and is drawn over one period. Bars are each harmonic’s share of the mean square ⟨f²⟩, which is (aₙ² + bₙ²)/2 for n ≥ 1 and (a₀/2)² for the constant.',
  },
  example: {
    prompt: t`A piezoelectric pressure transducer on a rocket combustion chamber is slightly nonlinear: its normalized output is $v = p + \varepsilon p^3$, with $\varepsilon = 0.05$. The chamber rings in one pure acoustic mode, $p = \cos\omega t$. Write $v$ as a Fourier series. Which harmonics appear in the recorded spectrum, and how strong are they?`,
    visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.25, 1.25], aspect: 'wide', xlabel: 'ωt (rad)', ylabel: '', axesAt: 'edge', curves: [
      { fn: 'cos(x)^3', color: 'accent', width: 2.4, label: 'cos³ωt', labelAt: 0.35, labelDy: -10 },
      { fn: '3/4*cos(x)', color: 'gold', width: 1.6, dash: [6, 4], label: '¾ cos ωt', labelAt: -1.35, labelDy: -8 },
      { fn: '1/4*cos(3x)', color: 'violet', width: 1.6, dash: [6, 4], label: '¼ cos 3ωt', labelAt: 2.3, labelDy: -14 },
    ] }, caption: 'cos³ωt (blue) is exactly the sum of ¾ cos ωt and ¼ cos 3ωt (dashed). Nothing else is needed.' },
    steps: [
      { label: 'Use Euler', text: t`With $\theta = \omega t$, $\cos\theta = \tfrac12(e^{i\theta} + e^{-i\theta})$, so
$$\cos^3\theta = \tfrac18\big(e^{3i\theta} + 3e^{i\theta} + 3e^{-i\theta} + e^{-3i\theta}\big) = \tfrac34\cos\theta + \tfrac14\cos3\theta .$$` },
      { label: 'Read off the series', text: t`$v = \big(1 + \tfrac34\varepsilon\big)\cos\omega t + \tfrac{\varepsilon}{4}\cos 3\omega t$: a **finite** Fourier series with $a_1 = 1 + \tfrac34\varepsilon = ${1 + 0.75 * 0.05}$, $a_3 = \tfrac{\varepsilon}{4} = ${0.05 / 4}$, every other coefficient zero.` },
      { label: 'Uniqueness', text: t`Could some other mixture of harmonics also give $v$? No: the harmonics are orthogonal, so the coefficient of $\cos3\theta$ is fixed by one integral, $\frac1\pi\int_{-\pi}^{\pi}\cos^3\theta\,\cos3\theta\,d\theta = \tfrac14$. Components along perpendicular axes are unique.` },
      { label: 'Sense check', text: t`With $\varepsilon = 0$ the output is the pure tone. The third harmonic is $a_3/a_1 = ${r3(100 * (0.05 / 4) / (1 + 0.75 * 0.05))}\%$ of the fundamental, $${r3(20 * Math.log10((0.05 / 4) / (1 + 0.75 * 0.05)))}$ dB: a real line in the spectrum at $3\omega$ that is **made by the instrument**, not by the chamber.` },
    ],
    answer: t`$v = ${1 + 0.75 * 0.05}\cos\omega t + ${0.05 / 4}\cos3\omega t$: lines at $\omega$ and $3\omega$ only, the second $${r3(20 * Math.log10((0.05 / 4) / (1 + 0.75 * 0.05)))}$ dB below the first — a sensor artefact that an engineer must not mistake for a second acoustic mode.`,
  },
  practice: [
    num({
      id: 'period', difficulty: 1,
      gen(r) {
        const [f1, f2] = r.pick([[60, 150], [200, 300], [440, 660], [50, 70], [120, 200], [90, 150]]);
        const g = gcd(f1, f2), T = 1000 / g;
        const tmax = 2 * T;
        return {
          prompt: t`A vibration signal is $s(t) = \cos(2\pi\cdot${f1}\,t) + 0.4\sin(2\pi\cdot${f2}\,t)$, with $t$ in seconds. What is its period — the shortest $T > 0$ with $s(t + T) = s(t)$ for all $t$? Give it in ms.`,
          visual: { type: 'graph', params: { x: [0, tmax], y: [-1.6, 1.6], aspect: 'wide', xlabel: 't (ms)', ylabel: 's', axesAt: 'edge', curves: [{ fn: `cos(2*pi*${f1}*x/1000) + 0.4*sin(2*pi*${f2}*x/1000)`, color: 'accent', width: 2, samples: 1200 }] }, caption: 'The signal over a stretch of time; find where the pattern starts again.' },
          answer: T, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: 1000 / f1, feedback: t`That is the period of the first wave alone. Both waves must complete whole cycles.` }, { value: 1000 / f2, feedback: t`That is the period of the second wave alone. Both waves must complete whole cycles.` }, { value: 1000 / (f1 * f2 / g), feedback: t`You used the least common multiple of the frequencies. The common period needs the **greatest common divisor** of the frequencies.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: [t`The signal repeats when both $${f1}T$ and $${f2}T$ are whole numbers.`, t`So $1/T$ is the greatest common divisor of ${f1} Hz and ${f2} Hz.`],
          teach: 'A sum of harmonics repeats with the period of its fundamental: the largest frequency of which every component is a whole multiple.',
          explain: t`$\gcd(${f1}, ${f2}) = ${g}$ Hz, so ${f1} Hz is harmonic $${f1 / g}$ and ${f2} Hz harmonic $${f2 / g}$ of a ${g} Hz fundamental, and $T = 1/${g}\ \text{s} = ${r4(T)}$ ms.`,
        };
      },
    }),
    mcq({
      id: 'orthogonal', difficulty: 1,
      prompt: t`With $\langle f, g\rangle = \int_{-\pi}^{\pi} f\,g\,dx$, which inner product is **not** zero?`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.15, 1.15], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'sin(3x)*sin(5x)', color: 'accent', width: 2 }], shade: [{ fn: 'max(sin(3x)*sin(5x), 0)', from: -3.1416, to: 3.1416, color: 'accent', alpha: 0.25 }, { fn: 'min(sin(3x)*sin(5x), 0)', from: -3.1416, to: 3.1416, color: 'bad', alpha: 0.25 }] }, caption: 'One of the products, sin 3x · sin 5x: the blue and red areas cancel exactly over a full period.' },
      choices: [t`$\langle \sin3x, \sin3x\rangle$`, t`$\langle \sin2x, \cos2x\rangle$`, t`$\langle \cos x, \cos4x\rangle$`, t`$\langle \sin3x, \sin5x\rangle$`],
      answer: 0,
      why: {
        1: t`$\sin2x\cos2x = \tfrac12\sin4x$, which is odd and averages to zero: sines and cosines are always orthogonal over a full period.`,
        2: t`$\cos x\cos4x = \tfrac12(\cos3x + \cos5x)$: two whole-period cosines, each integrating to zero.`,
        3: t`$\sin3x\sin5x = \tfrac12(\cos2x - \cos8x)$ — the picture shows the cancellation.`,
      },
      hints: ['Turn each product into a sum with a product-to-sum identity.', t`$\sin^2 3x = \tfrac12(1 - \cos6x)$ keeps a constant part.`],
      teach: 'Over a full period, distinct members of 1, cos nx, sin nx are orthogonal; each has squared length π (the constant, 2π).',
      explain: t`$\langle\sin3x, \sin3x\rangle = \int_{-\pi}^{\pi}\sin^2 3x\,dx = \pi$, its squared length. Every pair of *different* members of the system has inner product 0.`,
    }),
    mcq({
      id: 'parity', difficulty: 2,
      prompt: t`The pictured function $f(x) = e^{\cos x}$ has period $2\pi$. Which of its Fourier coefficients must vanish, before you compute anything?`,
      visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-0.2, 3], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^cos(x)', color: 'accent', width: 2.3 }], vlines: [{ x: 0, label: 'x = 0' }] }, caption: 'Three periods of $e^{\\cos x}$: a mirror image of itself about x = 0.' },
      choices: [t`every $b_n$ (all the sine coefficients)`, t`every $a_n$ with $n \ge 1$`, t`$a_n$ and $b_n$ for even $n$`, 'none of them'],
      answer: 0,
      why: {
        1: t`Cosines are even, like $f$: they are the ones that survive. It is the odd sines that cannot help build an even function.`,
        2: t`Missing even harmonics come from half-wave symmetry, $f(x + \pi) = -f(x)$, which this positive function does not have.`,
        3: t`Symmetry forces a whole family to vanish: $f(-x) = f(x)$ kills the odd part of the series.`,
      },
      hints: [t`Is $f(-x)$ equal to $f(x)$ or to $-f(x)$?`, t`$b_n = \frac1\pi\int_{-\pi}^{\pi} f\sin nx\,dx$: an even function times an odd one, over a symmetric interval.`],
      teach: 'An even function has a pure cosine series; an odd function a pure sine series.',
      explain: t`$f$ is even and $\sin nx$ is odd, so $f\sin nx$ is odd and its integral over $[-\pi, \pi]$ is zero: $b_n = 0$ for every $n$. The series is $\tfrac{a_0}{2} + \sum a_n\cos nx$.`,
    }),
    expr({
      id: 'square-identity', difficulty: 2,
      gen(r) {
        const k = r.int(1, 4), which = r.pick(['sin', 'cos']);
        const sign = which === 'sin' ? '-' : '+';
        return {
          prompt: t`Write $${which}^2(${k === 1 ? '' : k}x)$ as a Fourier series — a constant plus cosines.`,
          visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-0.25, 1.25], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `${which}(${k}x)^2`, color: 'accent', width: 2.3 }], hlines: [{ y: 0.5, label: 'mean ½' }] }, caption: t`$${which}^2(${k === 1 ? '' : k}x)$ never goes negative: it is a constant plus one oscillation about it.` },
          answer: `1/2 ${sign} cos(${2 * k}x)/2`,
          answerTeX: t`\tfrac12 ${sign} \tfrac12\cos ${2 * k}x`,
          vars: { x: [-3, 3] },
          errors: [{ answer: `1/2 ${sign === '-' ? '+' : '-'} cos(${2 * k}x)/2`, feedback: t`Check the sign at $x = 0$: $${which}^2 0 = ${which === 'sin' ? 0 : 1}$.` }, { answer: `1/2 ${sign} cos(${k}x)/2`, feedback: t`Squaring doubles the frequency: the oscillation is at $${2 * k}x$, not $${k}x$.` }],
          hints: [t`Use $\cos 2\theta = 1 - 2\sin^2\theta = 2\cos^2\theta - 1$.`, t`With $\theta = ${k}x$, solve for $${which}^2\theta$.`],
          teach: 'Squaring a sinusoid makes a constant (its mean square) plus a sinusoid at twice the frequency.',
          explain: t`$${which}^2(${k}x) = \tfrac12 ${sign} \tfrac12\cos${2 * k}x$: $a_0/2 = \tfrac12$, $a_{${2 * k}} = ${sign === '-' ? '-' : ''}\tfrac12$, and nothing else — a two-term Fourier series.`,
        };
      },
    }),
    mcq({
      id: 'mixer', difficulty: 2,
      gen(r) {
        const [f1, f2, unit] = r.pick([[10.7, 10.245, 'MHz'], [70, 69.3, 'MHz'], [8.43, 8.4, 'GHz'], [2.45, 2.4, 'GHz']]);
        const d = r4(f1 - f2), s = r4(f1 + f2);
        return {
          prompt: t`A radio receiver multiplies the incoming carrier $\cos(2\pi f_1 t)$, $f_1 = ${f1}$ ${unit}, by a local oscillator $\cos(2\pi f_2 t)$, $f_2 = ${f2}$ ${unit}. Which frequencies does the product contain?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.2, 1.2], aspect: 'wide', xlabel: 't (arbitrary)', ylabel: '', axesAt: 'edge', xticks: 0, curves: [{ fn: 'cos(2*pi*40*x)*cos(2*pi*36*x)', color: 'accent', width: 1.4, samples: 2000 }, { fn: 'cos(2*pi*2*x)', color: 'gold', width: 1.6, dash: [6, 4] }] }, caption: 'The product of two nearby tones (illustrative frequencies 40 and 36): a fast oscillation inside a slow envelope (dashed) that beats at their difference.' },
          choices: [t`$${d}$ ${unit} and $${s}$ ${unit}`, t`$${f1}$ ${unit} and $${f2}$ ${unit}`, t`$${r4(f1 * f2)}$ ${unit}`, t`$${r4(2 * f1)}$ ${unit} and $${r4(2 * f2)}$ ${unit}`],
          answer: 0,
          why: {
            1: 'A product is not a sum: the original frequencies disappear from it entirely.',
            2: 'Frequencies do not multiply. Multiplying the waves adds and subtracts their phases.',
            3: 'Doubling comes from squaring one wave, cos²; here two different waves are multiplied.',
          },
          hints: [t`$\cos A\cos B = \tfrac12\big[\cos(A - B) + \cos(A + B)\big]$.`],
          teach: 'Multiplying two sinusoids gives sinusoids at the sum and the difference of their frequencies — how every superheterodyne radio shifts a signal down.',
          explain: t`$\cos A\cos B = \tfrac12\cos(A - B) + \tfrac12\cos(A + B)$, so the product has lines at $f_1 - f_2 = ${d}$ ${unit} (the intermediate frequency the receiver keeps) and $f_1 + f_2 = ${s}$ ${unit} (filtered away).`,
        };
      },
    }),
    mcq({
      id: 'extension', difficulty: 3,
      prompt: t`You need a Fourier series for $f(x) = x$ given only on $0 < x < \pi$. You may extend it to $-\pi < x < 0$ as you like before repeating with period $2\pi$. Which extension gives coefficients that fall off **fastest**?`,
      visual: { type: 'graph', params: { x: [-9.42, 9.42], y: [-3.6, 3.6], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [
        { fn: 'abs(x - 2*pi*floor((x + pi)/(2*pi)))', color: 'accent', width: 2.2, label: 'even', labelAt: 5.2, labelDy: -12 },
        { fn: 'x - 2*pi*floor((x + pi)/(2*pi))', color: 'warn', width: 1.6, dash: [6, 4], label: 'odd', labelAt: -5.2, labelDy: 14 },
      ] }, caption: 'Two extensions of x from (0, π): the even one (blue) and the odd one (dashed), each repeated with period 2π.' },
      choices: ['the even extension, |x|: a triangle wave', 'the odd extension, x itself: a sawtooth', 'setting f = 0 on (−π, 0)', 'every extension gives the same coefficients on (0, π)'],
      answer: 0,
      why: {
        1: t`Repeated, the odd extension jumps from $\pi$ to $-\pi$ at $x = \pi$; a jump makes coefficients fall only like $1/n$.`,
        2: t`Zero on $(-\pi, 0)$ leaves a jump from $\pi$ down to $0$ at $x = \pm\pi$ — again $1/n$.`,
        3: 'The coefficients are integrals over the whole period, so what you put on (−π, 0) changes all of them — and how fast they fall.',
      },
      hints: ['Repeat each extension with period 2π and look for jumps.', 'A jump gives coefficients ∝ 1/n; a corner (continuous, slope jumps) gives ∝ 1/n².'],
      teach: 'How you extend a function decides its series: a continuous periodic extension has coefficients falling at least like 1/n².',
      explain: t`The even extension $|x|$, repeated, is continuous — only its slope jumps — so its cosine coefficients fall like $1/n^2$. The odd extension is the sawtooth, whose sine coefficients fall like $1/n$. All three represent $x$ on $(0, \pi)$; they differ in how well they converge. (The next lesson computes both.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-missing-fundamental', difficulty: 3, transfer: true,
      gen(r) {
        const [f0, ks] = r.pick([[500, [3, 5, 7]], [400, [2, 3, 5]], [250, [4, 6, 10]], [300, [5, 7]], [600, [2, 5]]]);
        const peaks = ks.map((k) => k * f0);
        const g = peaks.reduce(gcd), T = 1000 / g;
        return {
          prompt: t`During a hot-fire test, the chamber-pressure spectrum of a rocket engine shows sharp lines at ${peaks.slice(0, -1).join(', ')} and ${peaks[peaks.length - 1]} Hz and nothing else, so the pressure oscillation is periodic. What is its period, in ms?`,
          visual: { type: 'graph', params: { x: [0, 1.15 * Math.max(...peaks)], y: [0, 1.25], aspect: 'wide', xlabel: 'frequency (Hz)', ylabel: 'amplitude', axesAt: 'edge', yticks: 0, arrows: peaks.map((p, i) => ({ from: [p, 0], to: [p, [1, 0.6, 0.4][i] || 0.3], color: 'accent', label: `${p}`, labelDx: -14, labelDy: -10 })) }, caption: 'The measured lines (heights illustrative). No line sits at the fundamental itself.' },
          answer: T, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: 1000 / peaks[0], feedback: 'That is the period of the lowest line. The fundamental can be missing from a spectrum: what frequency are all the lines multiples of?' }, { value: 1000 / (peaks[1] - peaks[0]), feedback: 'The spacing between neighbouring lines is not always the fundamental: when only odd harmonics are present, the spacing is twice it.' }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: ['A periodic signal contains only whole multiples of its fundamental frequency.', 'Find the largest frequency that divides every line: the greatest common divisor.'],
          teach: 'The fundamental of a periodic signal is the greatest common divisor of its lines — even when nothing sits at that frequency.',
          explain: t`$\gcd(${peaks.join(', ')}) = ${g}$ Hz, so the lines are harmonics ${peaks.map((p) => p / g).join(', ')} of ${g} Hz and $T = 1/${g}$ s $= ${r4(T)}$ ms. The oscillation has no energy at its own fundamental, yet it repeats at that rate.`,
        };
      },
    }),
    mcq({
      id: 'cp-unique', difficulty: 2,
      prompt: t`You have computed $b_3$ for a function from $b_3 = \frac1\pi\int_{-\pi}^{\pi} f\sin3x\,dx$. Now you decide to keep 50 harmonics instead of 10. Does $b_3$ change?`,
      visual: { type: 'graph', params: { x: [-0.3, 1.5], y: [-0.3, 1.3], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, arrows: [{ from: [0, 0], to: [1.2, 0], color: 'ink3', label: 'sin 3x', labelDy: 12 }, { from: [0, 0], to: [0, 1.15], color: 'ink3', label: 'other axes', labelDx: 6 }, { from: [0, 0], to: [0.9, 0.8], color: 'accent', label: 'f', labelDx: 6 }, { from: [0.9, 0.8], to: [0.9, 0], color: 'gold', dash: true }], points: [{ x: 0.9, y: 0, label: 'b₃', labelDy: 14, color: 'gold' }] }, caption: 'A sketch: a component is a projection onto one axis. Adding more axes elsewhere does not move it.' },
      choices: ['No: by orthogonality each coefficient is a projection onto its own harmonic, independent of the others', 'Yes: the coefficients must be recomputed together, as in a least-squares fit with new columns', 'Yes: a longer sum spreads the function over more harmonics, so each gets less', 'Only if f has a jump'],
      answer: 0,
      why: {
        1: 'In a general least-squares fit, adding columns does change the old coefficients — unless the columns are orthogonal. Here they are.',
        2: 'The coefficient is one integral against sin 3x; nothing about the other harmonics enters it.',
        3: 'Jumps affect how the sum converges, not the coefficients themselves.',
      },
      hints: ['Look at the formula for b₃: which functions appear in it?'],
      teach: 'Orthogonality makes Fourier coefficients final: each is one projection, and adding harmonics never changes those already found.',
      explain: t`$b_3$ depends only on $f$ and $\sin3x$. Because the harmonics are orthogonal, the best approximation with 50 terms keeps exactly the 10 coefficients you had and adds 40 more — the property that makes a Fourier series a series.`,
    }),
    mcq({
      id: 'cp-eccentric', difficulty: 2, transfer: true,
      prompt: t`Two white dwarfs orbit each other on a fixed eccentric (Newtonian) orbit with period $P = 2.0$ h, sending a gravitational-wave signal that LISA would record. Which frequencies can the signal’s spectrum contain?`,
      visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-1, 1], aspect: 'wide', equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, curves: [{ param: ['0.9*(cos(t) - 0.6)', '0.72*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['-0.5*(cos(t) - 0.6)', '-0.4*sin(t)'], t: [0, 6.2832], color: 'violet', width: 1.6, dash: [5, 4] }], points: [{ x: 0, y: 0, label: 'centre of mass', color: 'ink3', r: 3, labelDy: 16, labelDx: -40 }] }, caption: 'Sketch of an eccentric binary: both stars repeat their motion exactly once per orbit (sizes and eccentricity illustrative).' },
      choices: [t`only whole multiples of $1/P = ${tex(1 / 7200)}\ \text{Hz}$`, t`only $2/P$, twice the orbital frequency`, 'any frequency: an elliptical orbit speeds up and slows down', t`only odd multiples of $1/P$`],
      answer: 0,
      why: {
        1: 'That is the circular-orbit case, where the quadrupole signal is a pure tone at twice the orbital frequency. Eccentricity adds the other harmonics.',
        2: 'Speeding up and slowing down changes the shape of each cycle, not the fact that the cycle repeats: it only changes the harmonics’ sizes.',
        3: 'Odd-only harmonics need half-wave symmetry, s(t + P/2) = −s(t), which an eccentric orbit does not have.',
      },
      hints: ['Does the signal repeat? With what period?'],
      teach: 'Any signal that repeats with period P lives only at frequencies n/P: its spectrum is a comb.',
      explain: t`The source repeats every $P$, so the signal is periodic with period $P$ and its spectrum is a comb of lines at $n/P = n \times ${tex(1 / 7200)}\ \text{Hz}$. A circular orbit puts nearly everything at $n = 2$; eccentricity spreads power over many $n$. (Over years, radiation shrinks the orbit and the comb slowly drifts up.)`,
    }),
  ],
  sources: [SRC.stein, SRC.boas],
});
