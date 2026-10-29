// Properties and convolution: shift, modulation, scaling and derivative rules,
// the convolution theorem with its two-line proof (Fubini, then a change of
// variable), rect * rect = triangle, Gaussian blurs adding in quadrature,
// FFT convolution with zero padding, and instrument responses.
import { lesson, mcq, num, expr, order, code } from '../../src/core/content.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
const geo = (r, z = 0.7) => (r * r) / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);   // geophone gain at f/f₀ = r

export default lesson({
  id: 'st-e.E3.2',
  title: 'Properties and convolution',
  minutes: 16, difficulty: 3,
  intro: t`A handful of rules make the transform a calculating machine. A **delay** turns the phase, $f(t - t_0) \to e^{-i\omega t_0}\hat f$; **modulation** shifts the spectrum, $e^{i\omega_0t}f \to \hat f(\omega - \omega_0)$; **compressing** time stretches frequency, $f(at) \to \frac{1}{|a|}\hat f(\omega/a)$; a **derivative** multiplies by $i\omega$. The deepest is the **convolution theorem**: smearing one function with another becomes multiplication,

$$(f * g)(t) = \int_{-\infty}^{\infty} f(s)\,g(t - s)\,ds \quad\Longrightarrow\quad \widehat{f * g}(\omega) = \hat f(\omega)\,\hat g(\omega)$$

Its proof is two lines: swap the order of integration (Fubini — fine for integrable $f$, $g$), then substitute $u = t - s$. Every linear, time-invariant instrument — a seismometer, an accelerometer, a filter — convolves its input with its impulse response, so in frequency it just **multiplies** by its response $\hat h(\omega)$. Its twin: a product in time is a convolution in frequency, $\widehat{fg} = \frac{1}{2\pi}\hat f * \hat g$.`,
  symbols: [
    { tex: 'f * g', text: 'the convolution of $f$ and $g$: $g$ flipped, slid to $t$, multiplied by $f$ and integrated' },
    { tex: 's', text: 'the dummy integration variable (a time, s)' },
    { tex: '\\hat f,\\ \\hat g', text: 'the Fourier transforms, $\\hat f(\\omega) = \\int f(t)\\,e^{-i\\omega t}\\,dt$' },
    { tex: '\\omega', text: 'angular frequency, rad/s' },
  ],
  why: t`What a detector records is the true signal convolved with the instrument; in frequency that is a product, which you can divide back out — the basis of calibrating LIGO, seismometers and accelerometers.`,
  visual: {
    type: 'graph',
    title: 'Smearing in time, multiplying in frequency',
    lead: t`A rectangular pulse (width 2 s) convolved with a Gaussian of rms width $\sigma$. Switch between the time picture and the frequency picture: the same operation, seen twice.`,
    tasks: [
      'Time view: raise σ — the edges soften, the area stays 2.',
      'Frequency view: the Gaussian’s transform (gold) multiplies the pulse’s sinc (dashed); the blue product loses its high frequencies.',
      'Make σ tiny: the kernel is nearly a spike, its transform nearly 1, and nothing changes.',
    ],
    params: {
      x: [-4, 4], y: [-0.5, 2.2], aspect: 'wide', xlabel: 't (s) — or ω (rad/s) in the frequency view', ylabel: '', axesAt: 'edge',
      choices: [{ key: 'v', label: 'View', options: [[0, 'Time: $f$, $g$ and $f * g$'], [1, 'Frequency: $\\hat f$, $\\hat g$ and their product']], value: 0, explain: 'The convolution theorem says the two views describe the same thing.' }],
      sliders: [{ key: 's', label: 'Kernel width $\\sigma$', min: 0.05, max: 1.5, step: 0.05, value: 0.4, unit: '\\mathrm{s}', explain: 'The rms width of the Gaussian $g$ that smears the pulse (its area is 1).' }],
      curves: [
        { fn: 'step(1 - abs(x))', color: 'ink3', width: 1.5, dash: [5, 4], when: 'step(0.5 - v)' },
        { fn: 'e^(-x^2/(2*s^2))', color: 'gold', width: 1.6, when: 'step(0.5 - v)' },
        { fn: '0.5*(erf((x + 1)/(s*sqrt(2))) - erf((x - 1)/(s*sqrt(2))))', color: 'accent', width: 2.4, when: 'step(0.5 - v)' },
        { fn: '2*sin(x)/x', color: 'ink3', width: 1.5, dash: [5, 4], when: 'step(v - 0.5)', samples: 800 },
        { fn: 'e^(-s^2*x^2/2)', color: 'gold', width: 1.6, when: 'step(v - 0.5)' },
        { fn: '2*sin(x)/x*e^(-s^2*x^2/2)', color: 'accent', width: 2.4, when: 'step(v - 0.5)', samples: 800 },
      ],
      legend: [{ label: 'pulse f / its transform', color: 'ink3', dash: true }, { label: 'Gaussian g (shape) / ĝ', color: 'gold' }, { label: 'f ∗ g / the product', color: 'accent' }],
      legendAt: 'tr',
    },
    caption: 'Exact closed forms (the smeared pulse uses the error function). In the time view the Gaussian is drawn with its peak scaled to 1 to show its shape; its true area is 1.',
  },
  example: {
    prompt: t`Prove the convolution theorem, then use it to find the transform of the triangle $\Lambda(t) = \max(0, 1 - |t|)$ without integrating the triangle.`,
    visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-0.15, 1.3], aspect: 'wide', xlabel: 't (s)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'step(0.5 - abs(x))', color: 'gold', width: 1.6, dash: [6, 4], label: 'box', labelAt: -0.4, labelDy: -10 }, { fn: 'max(0, 1 - abs(x))', color: 'accent', width: 2.3, label: 'box ∗ box = Λ', labelAt: 0.75, labelDy: -14 }] }, caption: 'Sliding a unit box across itself: the overlap grows linearly, then shrinks — a triangle of base 2.' },
    steps: [
      { label: 'Write it out', text: t`$\widehat{f * g}(\omega) = \displaystyle\int\!\Big(\int f(s)\,g(t - s)\,ds\Big)e^{-i\omega t}\,dt$.` },
      { label: 'Swap the order', text: t`For integrable $f$ and $g$ the double integral converges absolutely, so Fubini lets you integrate over $t$ first: $\displaystyle\int f(s)\Big(\int g(t - s)\,e^{-i\omega t}\,dt\Big)ds$.` },
      { label: 'Shift', text: t`Put $u = t - s$: $e^{-i\omega t} = e^{-i\omega s}e^{-i\omega u}$, and the inner integral is $e^{-i\omega s}\hat g(\omega)$ — the shift rule.` },
      { label: 'Factor', text: t`$\displaystyle\int f(s)\,e^{-i\omega s}\,ds\;\hat g(\omega) = \hat f(\omega)\,\hat g(\omega)$. ∎` },
      { label: 'Apply', text: t`The unit box $\Pi(t)$ (1 for $|t| < \frac12$) has $\hat\Pi = \dfrac{2\sin(\omega/2)}{\omega}$, and $\Pi * \Pi = \Lambda$ (picture). So $\hat\Lambda(\omega) = \dfrac{4\sin^2(\omega/2)}{\omega^2}$.` },
      { label: 'Sense check', text: t`$\hat\Lambda(0) = 1$, the triangle’s area. $\hat\Lambda \ge 0$ and falls like $1/\omega^2$ — the triangle has corners, the box had jumps ($1/\omega$).` },
    ],
    answer: t`$\widehat{f * g} = \hat f\,\hat g$ by Fubini and the shift $u = t - s$; hence $\hat\Lambda(\omega) = \dfrac{4\sin^2(\omega/2)}{\omega^2}$.`,
  },
  practice: [
    num({
      id: 'scaling', difficulty: 2,
      gen(r) {
        const f1 = r.pick([20, 35, 50, 80]), a = r.pick([2, 4, 8, 0.5]);
        return {
          prompt: t`To make a gravitational-wave chirp audible, a recording is played back $${a}\times$ faster: $g(t) = f(${a}t)$. Its spectrum had its first null at $${f1}$ Hz. Where is the first null of $g$’s spectrum, in Hz?`,
          visual: { type: 'graph', params: { x: [0, 4 * f1 * Math.max(1, a)], y: [-0.3, 1.15], aspect: 'wide', xlabel: 'frequency (Hz)', ylabel: '', axesAt: 'edge', curves: [{ fn: `abs(sin(pi*x/${f1})/(pi*x/${f1}))`, color: 'ink3', width: 1.6, dash: [6, 4], label: 'f', labelAt: f1 * 0.4, labelDy: -10 }] }, caption: 'The original spectrum’s magnitude (illustrative shape); the played-back one is a stretched copy.' },
          answer: a * f1, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: f1 / a, feedback: t`Compressing time stretches frequency: $f(at) \to \frac1{|a|}\hat f(\omega/a)$, so features move to **higher** frequency when $a > 1$.` }].filter((e) => Math.abs(e.value - a * f1) > 0.01 * a * f1),
          hints: [t`$f(at) \to \dfrac1{|a|}\hat f\Big(\dfrac\omega a\Big)$.`, t`A null of $\hat f$ at $\omega_1$ becomes a null at $a\omega_1$.`],
          teach: 'Scaling: speed a signal up by a and every frequency feature moves up by a (and the amplitude density drops by 1/a).',
          explain: t`$\hat g(\omega) = \frac{1}{${a}}\hat f(\omega/${a})$ vanishes where $\omega/${a} = \omega_1$: at $${a}\times${f1} = ${a * f1}$ Hz.`,
        };
      },
    }),
    mcq({
      id: 'modulation', difficulty: 2,
      prompt: t`A spacecraft’s baseband telemetry $m(t)$ has its spectrum inside $|\omega| < W$. The transmitter sends $m(t)\cos\omega_ct$ with $\omega_c \gg W$. What is the spectrum of the transmitted signal?`,
      visual: { type: 'graph', params: { x: [-12, 12], y: [-0.1, 1.2], aspect: 'wide', xlabel: 'ω (arbitrary)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'max(0, 1 - abs(x))', color: 'accent', width: 2.2, label: 'm̂', labelAt: 0.3, labelDy: -10 }], vlines: [{ x: 8, label: 'carrier' }, { x: -8, label: '−carrier' }] }, caption: 'The baseband spectrum m̂(ω) (a triangle, for illustration) and the carrier frequency.' },
      choices: [t`$\tfrac12\big[\hat m(\omega - \omega_c) + \hat m(\omega + \omega_c)\big]$: two half-height copies centred on $\pm\omega_c$`, t`$\hat m(\omega)$ multiplied by $\cos\omega_c$`, t`$\hat m(\omega - \omega_c)$ only`, t`$\hat m$ convolved with itself`],
      answer: 0,
      why: {
        1: t`Multiplying in time is not multiplying in frequency; a product in time is a convolution of spectra.`,
        2: t`That would be modulation by $e^{i\omega_ct}$; the cosine is half $e^{i\omega_ct}$ and half $e^{-i\omega_ct}$.`,
        3: 'Only a product of m with itself (or squaring) convolves m̂ with itself.',
      },
      hints: [t`$\cos\omega_ct = \tfrac12(e^{i\omega_ct} + e^{-i\omega_ct})$.`, t`$e^{i\omega_0t}m(t) \to \hat m(\omega - \omega_0)$.`],
      teach: t`Multiplying by a carrier moves the spectrum to $\pm\omega_c$, half to each side.`,
      explain: t`With $\cos\omega_ct = \tfrac12(e^{i\omega_ct} + e^{-i\omega_ct})$ and the modulation rule, the spectrum is $\tfrac12\hat m(\omega - \omega_c) + \tfrac12\hat m(\omega + \omega_c)$, occupying $2W$ around each carrier — why a radio channel needs twice the baseband bandwidth.`,
    }),
    num({
      id: 'gauss-blur', difficulty: 2,
      gen(r) {
        const s1 = r.pick([0.3, 0.5, 0.8, 1.2]), s2 = r.pick([0.2, 0.4, 0.6]);
        const ans = Math.hypot(s1, s2);
        return {
          prompt: t`A shock pulse shaped like a Gaussian of rms width $${s1}$ ms is recorded by an accelerometer whose impulse response is a Gaussian of rms width $${s2}$ ms (area 1). What rms width does the recorded pulse have, in ms?`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-0.1, 1.2], aspect: 'wide', xlabel: 't (ms)', ylabel: '', axesAt: 'edge', curves: [{ fn: `e^(-x^2/(2*${s1}^2))`, color: 'ink3', width: 1.6, dash: [6, 4], label: 'true', labelAt: s1 * 0.7, labelDy: -10 }, { fn: `e^(-x^2/(2*${s2}^2))`, color: 'gold', width: 1.4, label: 'response (shape)', labelAt: -s2 * 1.3, labelDx: -100, labelDy: -10 }] }, caption: 'The true pulse and the instrument’s impulse response, each drawn with peak 1.' },
          answer: ans, units: 'ms', tol: { rel: 0.005 },
          errors: [{ value: s1 + s2, feedback: 'Widths do not add directly: the transforms multiply, so the squares of the widths add.' }],
          hints: [t`A Gaussian of rms width $\sigma$ has transform $\propto e^{-\sigma^2\omega^2/2}$.`, t`Multiplying $e^{-\sigma_1^2\omega^2/2}e^{-\sigma_2^2\omega^2/2}$ gives a Gaussian with $\sigma^2 = \sigma_1^2 + \sigma_2^2$.`],
          teach: 'Convolving Gaussians adds their variances: widths add in quadrature.',
          explain: t`$\sqrt{${s1}^2 + ${s2}^2} = ${r4(ans)}$ ms. (More generally, variances add under convolution for any kernels of area 1 — the same fact behind the central limit theorem.)`,
        };
      },
    }),
    expr({
      id: 'deriv-rule', difficulty: 3,
      prompt: t`Given $\widehat{e^{-t^2/2}} = \sqrt{2\pi}\,e^{-\omega^2/2}$, find the Fourier transform of $g(t) = (t^2 - 1)\,e^{-t^2/2}$.`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-1.2, 0.6], aspect: 'wide', xlabel: 't', ylabel: '', axesAt: 'edge', curves: [{ fn: '(x^2 - 1)*e^(-x^2/2)', color: 'accent', width: 2.2 }] }, caption: '$g(t) = (t^2 - 1)e^{-t^2/2}$: a “Mexican hat” turned upside down, with zero area.' },
      answer: '-omega^2*sqrt(2*pi)*e^(-omega^2/2)', answerTeX: t`-\sqrt{2\pi}\,\omega^2e^{-\omega^2/2}`,
      vars: { omega: [-3, 3] }, keys: [['ω', 'omega']],
      errors: [{ answer: 'omega^2*sqrt(2*pi)*e^(-omega^2/2)', feedback: t`Two derivatives give $(i\omega)^2 = -\omega^2$: a minus sign.` }, { answer: '-omega^2*e^(-omega^2/2)', feedback: t`Keep the factor $\sqrt{2\pi}$ from the Gaussian’s transform.` }],
      hints: [t`Differentiate $e^{-t^2/2}$ twice: what do you get?`, t`$\frac{d^2}{dt^2}e^{-t^2/2} = (t^2 - 1)e^{-t^2/2}$, and each derivative multiplies the transform by $i\omega$.`],
      teach: 'Recognize a derivative and the transform comes free: d/dt → iω.',
      explain: t`$g = f''$ with $f = e^{-t^2/2}$, so $\hat g = (i\omega)^2\hat f = -\sqrt{2\pi}\,\omega^2e^{-\omega^2/2}$. It vanishes at $\omega = 0$, as it must: $g$ has zero area.`,
    }),
    order({
      id: 'proof-order', difficulty: 2,
      prompt: t`Put the steps of the proof of $\widehat{f * g} = \hat f\,\hat g$ in order.`,
      visual: { type: 'graph', params: { x: [-2.5, 3.5], y: [-0.15, 1.3], aspect: 'wide', xlabel: 's', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x^2)', color: 'accent', width: 2, label: 'f(s)', labelAt: -0.9, labelDy: -12 }, { fn: 'step(1.5 - x)*e^(-(1.5 - x))*step(x + 5)', color: 'gold', width: 1.8, label: 'g(t − s), t = 1.5', labelAt: 0.3, labelDy: -40 }], shade: [{ fn: 'e^(-x^2)*step(1.5 - x)*e^(-(1.5 - x))', from: -2.5, to: 1.5, color: 'accent', alpha: 0.3 }] }, caption: 'At one time t, the convolution is the area under f(s) times the flipped, shifted g(t − s).' },
      items: [
        t`Write $\widehat{f * g} = \int\big(\int f(s)g(t - s)\,ds\big)e^{-i\omega t}dt$`,
        t`Swap the integrals (Fubini)`,
        t`Substitute $u = t - s$ in the inner integral`,
        t`The inner integral is $e^{-i\omega s}\hat g(\omega)$`,
        t`The outer integral is $\hat f(\omega)$, times $\hat g(\omega)$`,
      ],
      hints: ['Start from the definitions; the change of variable comes after the swap.', 'The shift rule appears once the inner integral is over t − s.'],
      teach: 'The convolution theorem is Fubini plus the shift rule.',
      explain: t`Absolute integrability allows the swap; the substitution turns the inner integral into a shifted transform; what is left factorizes.`,
    }),
    code({
      id: 'fft-convolve', difficulty: 3,
      prompt: t`Convolve with the FFT. Multiplying two length-$M$ FFTs gives a **circular** convolution, in which the end of the result wraps onto the start. To get the ordinary (linear) convolution of arrays of lengths $L_a$ and $L_b$, zero-pad both to length $L_a + L_b - 1$ first.

Write \`conv_fft(a, b)\` that returns the same numbers as \`np.convolve(a, b)\`. The program then smooths a recorded step with an accelerometer’s decaying impulse response.`,
      starter: t`import numpy as np

def conv_fft(a, b):
    n = len(a) + len(b) - 1
    # FFT both (padded to length n), multiply, inverse FFT, keep the real part
    pass

dt = 1e-4                                   # s
t = np.arange(0, 0.02, dt)
step = (t > 0.005).astype(float)            # a true step at 5 ms
h = np.exp(-t / 1e-3)
h = h / h.sum()                             # response with a 1 ms time constant, area 1
y = conv_fft(step, h)[:len(t)]
print("max |difference| from np.convolve:", np.max(np.abs(conv_fft(step, h) - np.convolve(step, h))))
print("output 1 ms after the step:", y[60])
`,
      answer: t`import numpy as np

def conv_fft(a, b):
    n = len(a) + len(b) - 1
    A = np.fft.rfft(a, n)
    B = np.fft.rfft(b, n)
    return np.fft.irfft(A * B, n)

dt = 1e-4                                   # s
t = np.arange(0, 0.02, dt)
step = (t > 0.005).astype(float)            # a true step at 5 ms
h = np.exp(-t / 1e-3)
h = h / h.sum()                             # response with a 1 ms time constant, area 1
y = conv_fft(step, h)[:len(t)]
print("max |difference| from np.convolve:", np.max(np.abs(conv_fft(step, h) - np.convolve(step, h))))
print("output 1 ms after the step:", y[60])
`,
      tests: [
        { name: 'matches np.convolve on a small example', code: 'np.allclose(conv_fft(np.array([1.0, 2, 3]), np.array([0.0, 1, 0.5])), np.convolve([1.0, 2, 3], [0.0, 1, 0.5]))' },
        { name: 'returns length len(a) + len(b) − 1', code: 'len(conv_fft(np.ones(7), np.ones(4))) == 10' },
        { name: 'no wrap-around: matches np.convolve on the step record', code: 'np.allclose(conv_fft(step, h), np.convolve(step, h), atol=1e-12)' },
        { name: 'about 63% of the step one time constant after it', code: 'abs(y[60] - (1 - np.exp(-1))) < 0.01' },
      ],
      hints: ['`np.fft.rfft(a, n)` zero-pads a to length n before transforming.', 'Then `np.fft.irfft(A * B, n)` returns the real convolution of length n.'],
      teach: 'FFT convolution is circular; zero-padding to the full output length makes it equal the ordinary convolution.',
      explain: t`With padding to $L_a + L_b - 1$ the wrapped-around part lands on zeros, so the circular and linear convolutions agree to round-off. The FFT route costs $O(n\log n)$ instead of $O(L_aL_b)$. One time constant after the step the output has reached about $1 - e^{-1} \approx 63\%$, the familiar first-order rise — here as a convolution.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-geophone', difficulty: 3, transfer: true,
      gen(r) {
        const ratio = r.pick([0.25, 0.5, 2]), A = r.pick([0.8, 1.5, 3, 5]);
        const G = geo(ratio), ans = A / G;
        return {
          prompt: t`A geophone with natural frequency $f_0 = 1$ Hz and damping ratio $0.7$ has gain $|\hat h| = \dfrac{r^2}{\sqrt{(1 - r^2)^2 + (1.4r)^2}}$ at frequency $f = rf_0$ (output velocity per unit ground velocity). During an earthquake it records a sinusoid at $${ratio}$ Hz with velocity amplitude $${A}\ \mu\text{m/s}$. What is the true ground-velocity amplitude, in μm/s?`,
          visual: { type: 'graph', params: { x: [-1.5, 1], y: [-2, 0.3], aspect: 'wide', xlabel: 'frequency (log₁₀ of f/f₀)', ylabel: 'gain', xlog: true, ylog: true, axesAt: 'edge', curves: [{ fn: '0.5*log10((10^x)^4/((1 - (10^x)^2)^2 + (1.4*10^x)^2))', color: 'accent', width: 2.2 }] }, caption: 'The geophone’s gain on log–log axes: flat above f₀, falling like f² below it.' },
          answer: ans, units: 'μm/s', tol: { rel: 0.01 },
          errors: [{ value: A * G, feedback: 'You multiplied by the gain. The record is the ground motion times the gain, so divide.' }],
          hints: ['Convolution in time is multiplication in frequency: recorded = gain × true, at each frequency.', t`At $r = ${ratio}$ the gain is $${r3(G)}$.`],
          teach: 'An instrument multiplies each frequency by its response; dividing it back out (deconvolution) recovers the input.',
          explain: t`Gain at $${ratio}$ Hz: $${r3(G)}$, so the ground moved with $${A}/${r3(G)} = ${r3(ans)}\ \mu\text{m/s}$. Far below $f_0$ the division amplifies noise as well — real deconvolution stops where the gain is too small.`,
        };
      },
    }),
    mcq({
      id: 'cp-window', difficulty: 3, transfer: true,
      prompt: t`A spectrum analyser records only $T = 2$ s of a pure 50 Hz tone: effectively the infinite tone multiplied by a box of length $T$. What does that do to the computed spectrum?`,
      visual: { type: 'graph', params: { x: [47, 53], y: [-0.1, 1.15], aspect: 'wide', xlabel: 'frequency (Hz)', ylabel: '|spectrum|', axesAt: 'edge', curves: [{ fn: 'abs(sin(pi*2*(x - 50))/(pi*2*(x - 50)))', color: 'accent', width: 2.2, samples: 1500 }] }, caption: 'The computed magnitude spectrum of 2 s of a 50 Hz tone.' },
      choices: ['The line is convolved with the box’s transform: a sinc of first-null half-width 1/T = 0.5 Hz', 'Nothing: a pure tone has one line however long the record', 'The line moves to 50 + 1/T Hz', 'The spectrum is multiplied by a sinc, so only its height changes'],
      answer: 0,
      why: {
        1: 'An infinite tone has a single line; a finite piece of it does not.',
        2: 'The centre stays at 50 Hz; the line spreads symmetrically.',
        3: 'A product in time is a convolution in frequency, not a product.',
      },
      hints: ['Product in time ↔ convolution in frequency (divided by 2π).', 'The box of length T has a transform with nulls every 1/T in hertz.'],
      teach: 'Recording for a finite time convolves the spectrum with the window’s transform: resolution ≈ 1/T.',
      explain: t`$\widehat{fg} = \tfrac{1}{2\pi}\hat f * \hat g$: the tone’s delta lines are convolved with $\hat\Pi_T$, a sinc whose first nulls are $1/T = 0.5$ Hz from the centre. Two tones closer than about $1/T$ blur together — the same trade-off as [the uncertainty principle](#/lesson/st-e.E3.3).`,
    }),
  ],
  sources: [SRC.stein, SRC.rhb],
});
