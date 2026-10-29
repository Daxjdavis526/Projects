// The uncertainty principle of signals: σ_t σ_ω ≥ ½ proved from integration
// by parts, Cauchy–Schwarz and Plancherel; equality exactly for Gaussians;
// products for other pulses (two-sided exponential, triangle, chirped
// Gaussian) and why a jump makes σ_ω infinite; time–frequency resolution.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
const sel = (k, e) => `step(0.5 - abs(k - ${k}))*(${e})`;
const pick = (es) => es.map((e, i) => sel(i, e)).join(' + ');

export default lesson({
  id: 'st-e.E3.3',
  title: 'The uncertainty principle of signals',
  minutes: 16, difficulty: 4,
  intro: t`A pulse cannot be both short and narrow-band. Measure its duration by the rms width $\sigma_t$ of $|f(t)|^2$ and its bandwidth by the rms width $\sigma_\omega$ of $|\hat f(\omega)|^2$ (each treated as a distribution, normalized by the energy). Then, for **every** finite-energy signal,

$$\sigma_t\,\sigma_\omega \ge \frac12 ,$$

with equality **only** for a Gaussian, $f(t) = Ce^{-(t - t_0)^2/4\sigma_t^2}e^{i\omega_0t}$. The proof is three moves: integrate $t\,\frac{d}{dt}|f|^2$ by parts, bound the result with the **Cauchy–Schwarz inequality**, and turn $\int|f'|^2$ into $\frac1{2\pi}\int\omega^2|\hat f|^2$ with Plancherel and the derivative rule. Nothing quantum is involved; quantum mechanics inherits it because $p = \hbar k$ makes position and momentum a transform pair.`,
  symbols: [
    { tex: '\\sigma_t', text: 'the rms duration: $\\sigma_t^2 = \\frac1E\\int(t - \\bar t)^2|f|^2\\,dt$, with $E = \\int|f|^2dt$ and $\\bar t$ the mean time (s)' },
    { tex: '\\sigma_\\omega', text: 'the rms bandwidth: $\\sigma_\\omega^2 = \\frac{1}{2\\pi E}\\int(\\omega - \\bar\\omega)^2|\\hat f|^2\\,d\\omega$ (rad/s)' },
    { tex: '\\tfrac12', text: 'the bound, attained only by Gaussians; in hertz it reads $\\sigma_t\\sigma_f \\ge 1/4\\pi$' },
  ],
  why: t`It sets how sharply a radar can range, how short a telemetry symbol can be in a given channel, and how well a gravitational-wave burst’s arrival time and frequency can be pinned down at once.`,
  visual: {
    type: 'graph',
    title: 'Squeezing a pulse',
    lead: t`Blue: $|f(t)|^2$ against $t$. Gold, dashed: $|\hat f(\omega)|^2$ against $\omega$ (peak scaled to 1). Change the width and the shape; the readout is the product $\sigma_t\sigma_\omega$.`,
    tasks: [
      'Gaussian: squeeze T — the time curve narrows, the spectrum widens, and the product stays at exactly 0.5.',
      'Two-sided exponential and triangle: the product is larger (0.707 and 0.548) for every width.',
      'Chirped Gaussian: the same |f|² as the Gaussian, but raise the chirp c and the spectrum widens — the product grows as ½√(1 + c²).',
    ],
    params: {
      x: [-6, 6], y: [-0.05, 1.15], aspect: 'wide', xlabel: 't (s) for f, ω (rad/s) for f̂', ylabel: '', axesAt: 'edge',
      choices: [{ key: 'k', label: 'Pulse', options: [[0, 'Gaussian'], [1, 'two-sided exponential'], [2, 'chirped Gaussian'], [3, 'triangle']], value: 0, explain: 'Each is drawn with width parameter $T$.' }],
      sliders: [
        { key: 'T', label: 'Width $T$', min: 0.4, max: 3, step: 0.05, value: 0.7, unit: '\\mathrm{s}', explain: 'Stretches the pulse in time; its spectrum shrinks by the same factor.' },
        { key: 'c', label: 'Chirp $c$', min: 0, max: 4, step: 0.1, value: 1.5, unit: '', explain: 'For the chirped Gaussian, $f = e^{-(1 - ic)t^2/2T^2}$: the frequency sweeps through the pulse.' },
      ],
      curves: [
        { fn: pick(['e^(-x^2/T^2)', 'e^(-2*abs(x)/T)', 'e^(-x^2/T^2)', 'max(0, 1 - abs(x)/T)^2']), color: 'accent', width: 2.4, samples: 1200 },
        { fn: pick(['e^(-x^2*T^2)', '1/(1 + x^2*T^2)^2', 'e^(-x^2*T^2/(1 + c^2))', '(sin(x*T/2 + 1e-9)/(x*T/2 + 1e-9))^4']), color: 'gold', width: 1.8, dash: [6, 4], samples: 1200 },
      ],
      readouts: [
        { label: '$\\sigma_t$', expr: pick(['T/sqrt(2)', 'T/sqrt(2)', 'T/sqrt(2)', 'T/sqrt(10)']), unit: '\\mathrm{s}', digits: 3 },
        { label: '$\\sigma_\\omega$', expr: pick(['1/(sqrt(2)*T)', '1/T', 'sqrt(1 + c^2)/(sqrt(2)*T)', 'sqrt(3)/T']), unit: '\\mathrm{rad/s}', digits: 3 },
        { label: '$\\sigma_t\\sigma_\\omega$', expr: pick(['0.5', '1/sqrt(2)', '0.5*sqrt(1 + c^2)', 'sqrt(0.3)']), digits: 4 },
      ],
    },
    caption: t`Closed-form widths for the Gaussian $e^{-t^2/2T^2}$, the exponential $e^{-|t|/T}$, the chirped Gaussian $e^{-(1 - ic)t^2/2T^2}$ and the triangle $\max(0, 1 - |t|/T)$. The chirp slider acts only on the chirped Gaussian. Both curves share one axis: $t$ in s, $\omega$ in rad/s.`,
  },
  example: {
    prompt: t`Prove $\sigma_t\sigma_\omega \ge \tfrac12$ for a smooth signal $f$ with $\bar t = 0$, $\bar\omega = 0$ and $t|f|^2 \to 0$ as $|t| \to \infty$, and find when equality holds.`,
    visual: { type: 'graph', params: { x: [-4, 4], y: [-1.1, 1.15], aspect: 'wide', xlabel: 't', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x^2/2)', color: 'accent', width: 2.3, label: 'f (Gaussian)', labelAt: 0.9, labelDy: -12 }, { fn: '-x*e^(-x^2/2)', color: 'gold', width: 1.8, dash: [6, 4], label: 'f′ = −t f', labelAt: 1.6, labelDy: 18 }] }, caption: 'The equality case: for a Gaussian, f′ is exactly a negative multiple of t f — the condition for equality in Cauchy–Schwarz.' },
    steps: [
      { label: 'By parts', text: t`$E = \displaystyle\int|f|^2dt = -\int t\,\frac{d}{dt}|f|^2\,dt$ (the boundary term $t|f|^2$ vanishes), and $\frac{d}{dt}|f|^2 = 2\operatorname{Re}(\bar f f')$, so $E = -2\operatorname{Re}\displaystyle\int t\bar f\,f'\,dt$.` },
      { label: 'Cauchy–Schwarz', text: t`$E \le 2\displaystyle\int|tf|\,|f'|\,dt \le 2\Big(\int t^2|f|^2dt\Big)^{1/2}\Big(\int|f'|^2dt\Big)^{1/2}$.` },
      { label: 'Plancherel', text: t`$f' \to i\omega\hat f$, so $\displaystyle\int|f'|^2dt = \frac1{2\pi}\int\omega^2|\hat f|^2d\omega = E\sigma_\omega^2$; and $\int t^2|f|^2dt = E\sigma_t^2$.` },
      { label: 'Conclude', text: t`$E \le 2\sqrt{E\sigma_t^2}\sqrt{E\sigma_\omega^2} = 2E\,\sigma_t\sigma_\omega$, so $\sigma_t\sigma_\omega \ge \tfrac12$. ∎ (Nonzero $\bar t$, $\bar\omega$: shift and modulate first; neither changes a width.)` },
      { label: 'Equality', text: t`Cauchy–Schwarz is an equality only if $f' = -\lambda tf$ with a constant $\lambda$, and the first step needs $\operatorname{Re}(t\bar ff') \le 0$ everywhere, so $\lambda > 0$ is real. Then $f = Ce^{-\lambda t^2/2}$: a Gaussian, and only a Gaussian.` },
    ],
    answer: t`$\sigma_t\sigma_\omega \ge \tfrac12$ by parts + Cauchy–Schwarz + Plancherel; equality exactly for $f = Ce^{-\lambda t^2/2}$ ($\lambda > 0$), shifted in time and frequency.`,
  },
  practice: [
    num({
      id: 'exp-product', difficulty: 3,
      prompt: t`Compute $\sigma_t\sigma_\omega$ for the two-sided exponential $f(t) = e^{-|t|}$, using $\int_{-\infty}^\infty t^2e^{-2|t|}dt = \tfrac12$, $\int e^{-2|t|}dt = 1$, $\hat f = \dfrac{2}{1 + \omega^2}$ and $\displaystyle\int\frac{\omega^2\,d\omega}{(1 + \omega^2)^2} = \int\frac{d\omega}{(1 + \omega^2)^2} = \frac\pi2$.`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-0.05, 1.15], aspect: 'wide', xlabel: 't or ω', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-2*abs(x))', color: 'accent', width: 2.2, label: '|f|²', labelAt: 0.6, labelDy: -10 }, { fn: '1/(1 + x^2)^2', color: 'gold', width: 1.8, dash: [6, 4], label: '|f̂|² (scaled)', labelAt: 1.6, labelDy: -10 }] }, caption: 'The energy distributions in time and in frequency.' },
      answer: 1 / Math.SQRT2, tol: { rel: 0.005 },
      errors: [{ value: 0.5, feedback: 'Only a Gaussian reaches ½. Compute both widths.' }, { value: 0.5 / Math.SQRT2, feedback: t`$\sigma_\omega^2$ is a ratio of the two frequency integrals, both $\pi/2$: so $\sigma_\omega = 1$.` }],
      hints: [t`$\sigma_t^2 = \dfrac{\int t^2|f|^2}{\int|f|^2} = \tfrac12$.`, t`$\sigma_\omega^2 = \dfrac{\int\omega^2|\hat f|^2}{\int|\hat f|^2} = \dfrac{\pi/2}{\pi/2} = 1$.`],
      teach: 'Any shape but a Gaussian sits strictly above the bound; corners and slow spectral tails cost bandwidth.',
      explain: t`$\sigma_t = 1/\sqrt2$ and $\sigma_\omega = 1$, so $\sigma_t\sigma_\omega = 1/\sqrt2 \approx ${r4(1 / Math.SQRT2)}$ — 41% above the Gaussian’s $\tfrac12$. The kink at $t = 0$ is what fattens the spectrum’s tails.`,
    }),
    num({
      id: 'chirp', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2, 3, 0.5]);
        const ans = 0.5 * Math.sqrt(1 + c * c);
        return {
          prompt: t`A radar transmits a chirped Gaussian pulse $f(t) = e^{-(1 - i\,${c})t^2/2T^2}$: its envelope $|f|^2 = e^{-t^2/T^2}$ is a Gaussian, but its frequency sweeps. Its power spectrum is $|\hat f|^2 \propto e^{-\omega^2T^2/(1 + ${c * c})}$. What is $\sigma_t\sigma_\omega$?`,
          visual: { type: 'graph', params: { x: [-3.5, 3.5], y: [-1.15, 1.15], aspect: 'wide', xlabel: 't / T', ylabel: '', axesAt: 'edge', curves: [{ fn: `e^(-x^2/2)*cos(${c}*x^2/2*4)`, color: 'accent', width: 1.8, samples: 1500 }, { fn: 'e^(-x^2/2)', color: 'ink3', width: 1.2, dash: [5, 4] }] }, caption: 'Re f for an illustrative chirp (the oscillation sped up for visibility): the frequency rises through the pulse.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0.5, feedback: 'The envelope is Gaussian, but the chirp widens the spectrum: equality needs a real Gaussian with no chirp.' }, { value: 0.5 * (1 + c * c), feedback: t`Take the square root: $\sigma_\omega^2 = \frac{1 + c^2}{2T^2}$.` }],
          hints: [t`From $|f|^2 = e^{-t^2/T^2}$: $\sigma_t = T/\sqrt2$.`, t`A density $\propto e^{-\omega^2/(2s^2)}$ has rms width $s$; here $2s^2 = (1 + ${c * c})/T^2$.`],
          teach: t`A chirp keeps the envelope but adds bandwidth: $\sigma_t\sigma_\omega = \tfrac12\sqrt{1 + c^2}$.`,
          explain: t`$\sigma_t = T/\sqrt2$ and $\sigma_\omega = \sqrt{1 + ${c * c}}/(\sqrt2T)$, so the product is $\tfrac12\sqrt{1 + ${c * c}} = ${r4(ans)}$. Radars use exactly this surplus bandwidth: compressing the chirp on reception gives a pulse $\sqrt{1 + c^2}$ times shorter.`,
        };
      },
    }),
    mcq({
      id: 'rect-infinite', difficulty: 3,
      prompt: t`For a rectangular pulse (1 for $|t| < \tau/2$, 0 otherwise), $\sigma_t$ is finite. What about $\sigma_\omega$?`,
      visual: { type: 'graph', params: { x: [-30, 30], y: [-0.05, 1.1], aspect: 'wide', xlabel: 'ωτ', ylabel: '', axesAt: 'edge', curves: [{ fn: '(sin(x/2 + 1e-9)/(x/2 + 1e-9))^2', color: 'gold', width: 2, samples: 1500 }, { fn: '4/x^2', color: 'ink3', width: 1.2, dash: [5, 4], domain: [2, 30] }, { fn: '4/x^2', color: 'ink3', width: 1.2, dash: [5, 4], domain: [-30, -2] }] }, caption: '|f̂|² of the rectangle (gold) and its envelope 4/(ωτ)² (dashed).' },
      choices: [t`infinite: $|\hat f|^2$ falls only like $1/\omega^2$, so $\int\omega^2|\hat f|^2d\omega$ diverges`, t`$\sigma_\omega = 2\pi/\tau$, the first null`, t`$\sigma_\omega = 1/(2\sigma_t)$, the bound`, t`zero, because $\hat f$ has nulls`],
      answer: 0,
      why: {
        1: 'The first null is a fine rough measure of bandwidth, but the rms width counts every tail lobe, weighted by ω².',
        2: 'Only Gaussians reach the bound; the rectangle is the opposite extreme.',
        3: 'Nulls are isolated points; between them the spectrum carries energy out to infinity.',
      },
      hints: [t`$\omega^2|\hat f|^2 \sim \omega^2\cdot\frac{1}{\omega^2} = $ constant at large $\omega$.`, t`Equivalently, $\int|f'|^2dt$: the derivative of a jump is a delta function, whose square has infinite integral.`],
      teach: 'A jump makes the rms bandwidth infinite: smooth edges are what keep a pulse’s spectrum compact.',
      explain: t`$|\hat f|^2 = \frac{4\sin^2(\omega\tau/2)}{\omega^2}$, so $\omega^2|\hat f|^2$ oscillates without decaying and its integral diverges: $\sigma_\omega = \infty$. The inequality holds trivially. Practical pulses have rounded edges for exactly this reason: sharp edges splash power across the band.`,
    }),
    order({
      id: 'proof-order', difficulty: 2,
      prompt: t`Put the steps of the proof of $\sigma_t\sigma_\omega \ge \tfrac12$ in order.`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-0.05, 1.15], aspect: 'wide', xlabel: 't', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x^2)', color: 'accent', width: 2.2 }, { fn: 'x^2*e^(-x^2)*2', color: 'gold', width: 1.6, dash: [6, 4] }] }, caption: '|f|² (blue) and the weighted t²|f|² (dashed, scaled) whose integral gives σₜ².' },
      items: [
        t`$E = -\int t\,\frac{d}{dt}|f|^2\,dt$ (by parts)`,
        t`$= -2\operatorname{Re}\int t\bar f f'\,dt$`,
        t`$\le 2\sqrt{\int t^2|f|^2}\sqrt{\int|f'|^2}$ (Cauchy–Schwarz)`,
        t`$\int|f'|^2 = \frac1{2\pi}\int\omega^2|\hat f|^2$ (Plancherel)`,
        t`$E \le 2E\sigma_t\sigma_\omega$, so $\sigma_t\sigma_\omega \ge \frac12$`,
      ],
      hints: ['The inequality enters once, in the middle.', 'Plancherel converts the derivative’s energy into the frequency width.'],
      teach: 'Uncertainty = integration by parts + Cauchy–Schwarz + Plancherel.',
      explain: t`The integration by parts produces $E$ from $t\bar ff'$; Cauchy–Schwarz splits that into a time width and a derivative norm; Plancherel turns the derivative norm into the frequency width.`,
    }),
    mcq({
      id: 'equality', difficulty: 2,
      prompt: t`Which of these signals attains $\sigma_t\sigma_\omega = \tfrac12$ exactly?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-1.15, 1.15], aspect: 'wide', xlabel: 't', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-(x - 1)^2/2)*cos(6x)', color: 'accent', width: 1.8, samples: 1500 }, { fn: 'e^(-(x - 1)^2/2)', color: 'ink3', width: 1.2, dash: [5, 4] }] }, caption: 'The real part of $e^{-(t - 1)^2/2}\\, e^{6it}$, with its envelope.' },
      choices: [t`$e^{-(t - 1)^2/2}\,e^{6it}$: a shifted Gaussian on a carrier`, t`$\operatorname{sech}t$`, t`$e^{-(1 - i)t^2/2}$, a chirped Gaussian`, t`$e^{-t^4}$`],
      answer: 0,
      why: {
        1: t`$\operatorname{sech}t$ looks Gaussian-like, but only Gaussians attain equality; its product is slightly above ½.`,
        2: t`The chirp widens the spectrum: its product is $\tfrac12\sqrt2$.`,
        3: 'Flatter than a Gaussian, it needs extra bandwidth; only the Gaussian is optimal.',
      },
      hints: ['Shifting in time and multiplying by $e^{i\\omega_0t}$ move a pulse without changing either width.', t`Equality requires $f' = -\lambda(t - t_0)f$ (after removing the carrier) with real $\lambda > 0$.`],
      teach: 'Only Gaussians — shifted in time and frequency, but not chirped — sit on the bound.',
      explain: t`A delay and a carrier move $|f|^2$ and $|\hat f|^2$ without changing their widths, so $e^{-(t-1)^2/2}e^{6it}$ has the Gaussian’s product, $\tfrac12$. The others have a $f'/f$ that is not real-linear in $t$, and sit above the bound.`,
    }),
    num({
      id: 'gabor', difficulty: 2,
      gen(r) {
        const sf = r.pick([0.5, 2, 10, 50]);
        const ans = 1 / (4 * PI * sf);
        return {
          prompt: t`A signal analysis must assign each feature a frequency with an rms uncertainty of no more than $\sigma_f = ${sf}$ Hz. In hertz the uncertainty principle reads $\sigma_t\sigma_f \ge \frac{1}{4\pi}$. What is the smallest possible rms duration $\sigma_t$ of the stretch of data analysed, in s?`,
          visual: { type: 'graph', params: { x: [-2.5, 2.5], y: [-0.05, 1.15], aspect: 'wide', xlabel: 't (units of σₜ)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x^2/2)', color: 'accent', width: 2.2 }] }, caption: 'The best possible analysis window — a Gaussian — in units of its own rms width.' },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 1 / (2 * sf), feedback: t`In hertz the bound is $\frac{1}{4\pi}$, not $\frac12$: $\sigma_\omega = 2\pi\sigma_f$.` }, { value: 1 / sf, feedback: t`$\Delta f\,\Delta t \approx 1$ is a rough rule; with rms widths the exact bound is $\sigma_t\sigma_f \ge 1/4\pi$.` }],
          hints: [t`$\sigma_\omega = 2\pi\sigma_f$, so $\sigma_t\cdot2\pi\sigma_f \ge \tfrac12$.`, t`$\sigma_t \ge \dfrac{1}{4\pi\sigma_f}$.`],
          teach: t`In hertz: $\sigma_t\sigma_f \ge 1/4\pi$. Sharper frequency needs a longer look.`,
          explain: t`$\sigma_t \ge \dfrac{1}{4\pi\times${sf}} = ${tex(ans)}$ s, reached only with a Gaussian window. Finer frequency resolution costs time resolution — why spectrograms of a gravitational-wave chirp blur either its timing or its frequency.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-burst', difficulty: 3, transfer: true,
      gen(r) {
        const st = r.pick([1, 2, 4, 10]), f0 = r.pick([150, 250, 400]);
        const ans = 1 / (4 * PI * st * 1e-3);
        return {
          prompt: t`A gravitational-wave burst search uses sine-Gaussian templates $h(t) = e^{-t^2/4\sigma_t^2}e^{2\pi if_0t}$ (complex form) with $\sigma_t = ${st}$ ms and $f_0 = ${f0}$ Hz. What is the rms bandwidth $\sigma_f$ of one template, in Hz?`,
          visual: { type: 'graph', params: { x: [-4 * st, 4 * st], y: [-1.15, 1.15], aspect: 'wide', xlabel: 't (ms)', ylabel: 'h', axesAt: 'edge', curves: [{ fn: `e^(-x^2/(4*${st}^2))*cos(2*pi*${f0}*x/1000)`, color: 'accent', width: 1.6, samples: 2000 }, { fn: `e^(-x^2/(4*${st}^2))`, color: 'ink3', width: 1.2, dash: [5, 4] }] }, caption: 'The real part of the template, with its Gaussian envelope.' },
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: f0, feedback: 'The carrier sets where the band is centred, not how wide it is.' }, { value: 2 * ans, feedback: t`The envelope $e^{-t^2/4\sigma_t^2}$ gives $|h|^2 = e^{-t^2/2\sigma_t^2}$, of rms width $\sigma_t$ itself.` }],
          hints: ['A Gaussian envelope sits exactly on the bound; the carrier only shifts the spectrum.', t`$\sigma_f = \dfrac{1}{4\pi\sigma_t}$.`],
          teach: t`A Gaussian-windowed tone is the minimum-uncertainty signal: $\sigma_f = 1/(4\pi\sigma_t)$, centred on the carrier.`,
          explain: t`$|h|^2 = e^{-t^2/2\sigma_t^2}$ has rms width $\sigma_t$, the envelope is Gaussian, so the bound is met: $\sigma_f = \dfrac{1}{4\pi\times${tex(st * 1e-3)}\ \text{s}} = ${r3(ans)}$ Hz around $${f0}$ Hz. Shorter templates catch sharper bursts but smear frequency.`,
        };
      },
    }),
    mcq({
      id: 'cp-heisenberg', difficulty: 2, transfer: true,
      prompt: t`A particle’s wavefunction $\psi(x)$ and its momentum-space wavefunction are a Fourier pair in $x$ and $k$, with $p = \hbar k$. What does this lesson’s theorem say about it?`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [-0.05, 1.15], aspect: 'wide', xlabel: 'x, or k', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-x^2/0.5)', color: 'accent', width: 2.2, label: '|ψ(x)|²', labelAt: 0.5, labelDy: -10 }, { fn: 'e^(-x^2/2)', color: 'gold', width: 1.8, dash: [6, 4], label: '|φ(k)|²', labelAt: 1.8, labelDy: -10 }] }, caption: 'A narrow packet in x has a wide spread in k (illustrative Gaussians).' },
      choices: [t`$\sigma_x\sigma_k \ge \tfrac12$, so $\sigma_x\sigma_p \ge \hbar/2$: Heisenberg’s relation is this theorem with $p = \hbar k$`, 'nothing: the quantum uncertainty principle comes from measurement disturbing the particle', t`$\sigma_x\sigma_p \ge \hbar$`, t`$\sigma_x\sigma_p = \hbar/2$ for every state`],
      answer: 0,
      why: {
        1: 'The inequality follows from the wave description alone, before any measurement: it is a property of Fourier pairs.',
        2: 'With rms widths the bound is ħ/2, not ħ.',
        3: 'Equality holds only for Gaussian packets.',
      },
      hints: ['Replace t by x and ω by k: the mathematics is identical.', 'Multiply σₖ by ħ.'],
      teach: t`Heisenberg’s $\sigma_x\sigma_p \ge \hbar/2$ is the Fourier uncertainty theorem applied to matter waves.`,
      explain: t`With $x$ for $t$ and $k$ for $\omega$, $\sigma_x\sigma_k \ge \tfrac12$; multiplying by $\hbar$ gives $\sigma_x\sigma_p \ge \hbar/2$, with equality for Gaussian packets — the same Gaussians as here.`,
    }),
  ],
  sources: [SRC.stein, SRC.rhb],
});
