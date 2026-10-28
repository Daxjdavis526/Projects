// From series to transforms: a pulse repeated with period T, its lines Tcₙ
// crowding onto the envelope f̂(ω) as T → ∞; the inversion formula as the
// limit of a Riemann sum; Plancherel as the limit of Parseval; the
// Riemann–Lebesgue lemma; duality; and conventions.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;
const band = (u) => (2 / PI) * (Math.atan(u) + u / (1 + u * u));   // share of the energy of e^(−a|t|) with |ω| < u·a
const LINES = [...Array(61).keys()].map((j) => j - 30);

export default lesson({
  id: 'st-e.E3.1',
  title: 'From series to transforms',
  minutes: 15, difficulty: 3,
  intro: t`Take a single pulse $f(t)$ and repeat it with period $T$. Its Fourier series has lines at $\omega_n = 2\pi n/T$, spaced $\Delta\omega = 2\pi/T$ apart, with $Tc_n = \int_{-T/2}^{T/2}f(t)\,e^{-i\omega_nt}\,dt$. Let $T \to \infty$: the lines crowd together, $Tc_n$ settles onto a smooth curve, and the series $f = \sum (Tc_n)\,e^{i\omega_nt}\,\frac{\Delta\omega}{2\pi}$ becomes a Riemann sum for an integral:

$$\hat f(\omega) = \int_{-\infty}^{\infty} f(t)\,e^{-i\omega t}\,dt, \qquad f(t) = \frac{1}{2\pi}\int_{-\infty}^{\infty}\hat f(\omega)\,e^{i\omega t}\,d\omega$$

Parseval passes to the limit as **Plancherel’s theorem**, $\int|f|^2\,dt = \frac1{2\pi}\int|\hat f|^2\,d\omega$: a signal’s energy, counted in time or in frequency. The mathematician’s fine print: for $\int|f|\,dt < \infty$, $\hat f$ is continuous and tends to 0 as $|\omega| \to \infty$ (Riemann–Lebesgue); for finite-energy $f$ the pair holds in the mean-square sense. This course uses $e^{-i\omega t}$ in the forward transform, as [st-b](#/lesson/st-b.B8.2) does; [PHYS 3750](#/lesson/phys3750.W6.2) uses $e^{+i\omega t}$.`,
  symbols: [
    { tex: '\\hat f(\\omega)', text: 'the Fourier transform: the complex amplitude per unit angular frequency (units of $f$ times seconds)' },
    { tex: '\\omega', text: 'angular frequency, rad/s ($\\omega = 2\\pi f$, $f$ in Hz)' },
    { tex: 'f(t)', text: 'a signal on the whole time line, with finite energy $\\int|f|^2dt$' },
    { tex: 'e^{-i\\omega t}', text: 'the analysing wave; the $\\frac1{2\\pi}$ sits in the inverse transform in this convention' },
    { tex: 'T,\\ c_n', text: 'the period of the repeated pulse and its Fourier coefficients; $Tc_n \\to \\hat f(\\omega_n)$' },
  ],
  why: t`A gravitational-wave burst, a radar echo or a seismic shock happens once: it has no period and no Fourier series, but it has a transform — and its energy spectrum $|\hat f|^2$ is what detectors and filters are designed around.`,
  visual: {
    type: 'graph',
    title: 'Lines crowding onto a curve',
    lead: t`A rectangular pulse of width 1 s, repeated every $T$ seconds. The dots are $Tc_n$ at the line frequencies $\omega_n = 2\pi n/T$; the curve is the single pulse’s transform $\hat f(\omega) = 2\sin(\omega/2)/\omega$.`,
    tasks: [
      'Start at T = 2: few lines, far apart. Every dot already sits on the curve.',
      'Raise T to 16: the spacing 2π/T shrinks eightfold and the dots fill in the curve.',
      'The curve never changes: it belongs to the single pulse. Only the sampling of it does.',
    ],
    params: {
      x: [-25, 25], y: [-0.35, 1.15], aspect: 'wide', xlabel: 'ω (rad/s)', ylabel: 'T cₙ', axesAt: 'edge',
      sliders: [{ key: 'T', label: 'Period $T$', min: 1.5, max: 16, step: 0.5, value: 2, unit: '\\mathrm{s}', explain: 'How often the 1 s pulse repeats. $T \\to \\infty$ leaves a single pulse.' }],
      curves: [{ fn: '2*sin(x/2)/x', color: 'ink3', width: 1.6, dash: [6, 4], samples: 1200 }],
      points: LINES.map((n) => (n === 0 ? { x: 0, y: 1, color: 'accent', r: 3.5 } : { x: `2*pi*${n}/T`, y: `T*sin(pi*${n}/T)/(pi*${n})`, color: 'accent', r: 3.5, when: `step(24.8 - abs(2*pi*${n}/T))` })),
      readouts: [{ label: 'line spacing $2\\pi/T$', expr: '2*pi/T', unit: '\\mathrm{rad/s}', digits: 3 }],
    },
    caption: 'Dots for |n| ≤ 30 only. Exact values: Tcₙ = 2 sin(ωₙ/2)/ωₙ, which is f̂ sampled at the lines.',
  },
  example: {
    prompt: t`Find the Fourier transform of the two-sided decay $f(t) = e^{-a|t|}$ ($a > 0$). Check Plancherel’s theorem, and find the angular frequency at which $|\hat f|^2$ has fallen to half its peak.`,
    visual: { type: 'graph', params: { x: [-5, 5], y: [-0.2, 2.3], aspect: 'wide', xlabel: 't (s) or ω (rad/s), a = 1', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(-abs(x))', color: 'warn', width: 2, label: 'f(t)', labelAt: 1.6, labelDy: -10 }, { fn: '2/(1 + x^2)', color: 'accent', width: 2.3, label: 'f̂(ω)', labelAt: -2.6, labelDy: -12 }] }, caption: 'For a = 1: the pulse e^(−|t|) (orange) and its transform 2/(1 + ω²) (blue), a Lorentzian.' },
    steps: [
      { label: 'Split', text: t`$\hat f(\omega) = \displaystyle\int_{-\infty}^{0}e^{(a - i\omega)t}\,dt + \int_0^\infty e^{-(a + i\omega)t}\,dt = \frac{1}{a - i\omega} + \frac{1}{a + i\omega}$.` },
      { label: 'Combine', text: t`$\hat f(\omega) = \dfrac{2a}{a^2 + \omega^2}$: real (because $f$ is even) and positive, with $\hat f(0) = 2/a = \int f\,dt$, the area.` },
      { label: 'Energy in time', text: t`$\displaystyle\int_{-\infty}^{\infty}e^{-2a|t|}\,dt = \frac1a$.` },
      { label: 'Energy in frequency', text: t`$\dfrac1{2\pi}\displaystyle\int\frac{4a^2}{(a^2 + \omega^2)^2}\,d\omega = \frac{4a^2}{2\pi}\cdot\frac{\pi}{2a^3} = \frac1a$. ✓ Plancherel holds.` },
      { label: 'Half power', text: t`$|\hat f|^2 \propto (a^2 + \omega^2)^{-2}$ is halved when $(1 + \omega^2/a^2)^2 = 2$: $\;\omega = a\sqrt{\sqrt2 - 1} = ${r4(Math.sqrt(Math.SQRT2 - 1))}\,a$.` },
      { label: 'Sense check', text: t`A faster decay (larger $a$) gives a wider spectrum: short in time, broad in frequency. The kink at $t = 0$ shows as the slow $1/\omega^2$ tail.` },
    ],
    answer: t`$\hat f(\omega) = \dfrac{2a}{a^2 + \omega^2}$; both sides of Plancherel give $1/a$; half power at $\omega = ${r4(Math.sqrt(Math.SQRT2 - 1))}\,a$.`,
  },
  practice: [
    num({
      id: 'area', difficulty: 1,
      gen(r) {
        const h = r.pick([2, 3, 5, 8]), w = r.pick([0.5, 1, 2, 4]);
        return {
          prompt: t`A triangular force pulse rises linearly from 0 to $${h}$ kN over $${w}$ ms and falls back to 0 over the next $${w}$ ms. What is $\hat F(0)$, its transform at zero frequency, in N s?`,
          visual: { type: 'graph', params: { x: [-1.5 * w, 1.5 * w], y: [-0.2 * h, 1.3 * h], aspect: 'wide', xlabel: 't (ms)', ylabel: 'kN', axesAt: 'edge', curves: [{ fn: `${h}*max(0, 1 - abs(x)/${w})`, color: 'accent', width: 2.2 }], shade: [{ fn: `${h}*max(0, 1 - abs(x)/${w})`, from: -w, to: w, color: 'accent', alpha: 0.2 }] }, caption: 'The force pulse; the shaded area is its impulse.' },
          answer: h * w, units: 'N s', tol: { rel: 0.005 },
          errors: [{ value: 2 * h * w, feedback: 'The area of a triangle is half base times height: the base is 2w.' }],
          hints: [t`$\hat F(0) = \int F(t)\,e^{0}\,dt$, the area under the pulse.`, t`Triangle area $= \tfrac12\times\text{base}\times\text{height}$, with kN × ms = N s.`],
          teach: 'The transform at zero frequency is the total area — for a force pulse, its impulse.',
          explain: t`$\hat F(0) = \tfrac12(2\times${w}\ \text{ms})(${h}\ \text{kN}) = ${h * w}$ N s: the impulse delivered.`,
        };
      },
    }),
    num({
      id: 'train-cn', difficulty: 2,
      gen(r) {
        const d = r.pick([0.1, 0.2, 0.25, 0.3]), n = r.pick([1, 2, 3]);
        const ans = Math.sin(n * PI * d) / (n * PI);
        return {
          prompt: t`A single rectangular pulse of height 1 and width $\tau$ has $\hat f(\omega) = \dfrac{2\sin(\omega\tau/2)}{\omega}$. The pulse is repeated with period $T = \tau/${d}$ (duty cycle ${d}). Use $c_n = \hat f(\omega_n)/T$ to find $c_{${n}}$.`,
          visual: { type: 'graph', params: { x: [-25, 25], y: [-0.35, 1.15], aspect: 'wide', xlabel: 'ωτ', ylabel: '', axesAt: 'edge', curves: [{ fn: '2*sin(x/2)/x', color: 'ink3', width: 1.6, dash: [6, 4], samples: 1200 }], points: [...Array(13).keys()].map((j) => j - 6).filter((k) => k !== 0).map((k) => ({ x: (2 * PI * k * d), y: (2 * Math.sin(PI * k * d)) / (2 * PI * k * d), color: 'accent', r: 3.5 })).concat([{ x: 0, y: 1, color: 'accent', r: 3.5 }]) }, caption: 'The single pulse’s transform f̂/τ (dashed) and the train’s lines Tcₙ/τ sampling it (dots).' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans * (1 / d), feedback: t`That is $\hat f(\omega_n)/\tau$. The coefficient divides by the period $T = \tau/${d}$.` }],
          hints: [t`$\omega_n = 2\pi n/T = 2\pi n\,${d}/\tau$.`, t`$c_n = \dfrac{1}{T}\cdot\dfrac{2\sin(\omega_n\tau/2)}{\omega_n} = \dfrac{\sin(n\pi\,${d})}{n\pi}$.`],
          teach: 'A periodic train samples its single pulse’s transform: cₙ = f̂(2πn/T)/T.',
          explain: t`$c_{${n}} = \dfrac{\sin(${n}\pi\times${d})}{${n}\pi} = ${r4(ans)}$. Change the period and only the sampling points move; the envelope is the single pulse’s.`,
        };
      },
    }),
    mcq({
      id: 'riemann-lebesgue', difficulty: 2,
      prompt: t`Which of these can **not** be the Fourier transform $\hat f(\omega)$ of an absolutely integrable signal ($\int|f|\,dt < \infty$)?`,
      visual: { type: 'graph', params: { x: [-12, 12], y: [-0.4, 1.25], aspect: 'wide', xlabel: 'ω', ylabel: '', axesAt: 'edge', curves: [{ fn: '1/(1 + x^2)', color: 'accent', width: 2 }, { fn: 'e^(-x^2)', color: 'good', width: 2 }, { fn: 'sin(x)/x', color: 'warn', width: 1.8, samples: 1200 }, { fn: '1', color: 'violet', width: 1.8, dash: [6, 4] }] }, caption: 'The four candidates, drawn together.' },
      choices: [t`$\hat f(\omega) = 1$ for every $\omega$`, t`$\dfrac{1}{1 + \omega^2}$`, t`$e^{-\omega^2}$`, t`$\dfrac{\sin\omega}{\omega}$`],
      answer: 0,
      why: {
        1: t`It is $\tfrac12e^{-|t|}$ transformed: integrable, continuous, decaying.`,
        2: t`It is a Gaussian’s transform — Gaussians map to Gaussians.`,
        3: t`It is the transform of a rectangular pulse of height ½ and width 2, which is integrable.`,
      },
      hints: ['What must a transform of an integrable function do as |ω| → ∞?', 'The Riemann–Lebesgue lemma: f̂(ω) → 0.'],
      teach: 'Riemann–Lebesgue: an integrable signal’s transform is continuous and dies away at high frequency.',
      explain: t`A constant transform does not tend to 0, so by the Riemann–Lebesgue lemma it cannot come from an integrable function. It is the transform of the Dirac delta — an idealization, not a function, which is why delta functions need the theory of distributions.`,
    }),
    num({
      id: 'sinc-energy', difficulty: 3,
      gen(r) {
        const W = r.pick([2, 5, 10, 50]);
        return {
          prompt: t`The ideal band-limited pulse $f(t) = \dfrac{\sin Wt}{\pi t}$ with $W = ${W}$ rad/s has the transform $\hat f(\omega) = 1$ for $|\omega| < W$ and $0$ outside. Use Plancherel to find its energy $\int_{-\infty}^{\infty}|f(t)|^2\,dt$ (in s⁻¹).`,
          visual: { type: 'graph', params: { x: [-12 / W * 2, 12 / W * 2], y: [-0.3 * W / PI, 1.2 * W / PI], aspect: 'wide', xlabel: 't (s)', ylabel: '', axesAt: 'edge', curves: [{ fn: `sin(${W}*x)/(pi*x)`, color: 'accent', width: 2.2, samples: 1500 }] }, caption: 'The sinc pulse: its tails fall only like 1/t, so the energy integral in time is awkward.' },
          answer: W / PI, units: 's^-1', tol: { rel: 0.005 },
          errors: [{ value: 2 * W, feedback: t`Divide by $2\pi$: $\int|f|^2dt = \frac1{2\pi}\int|\hat f|^2d\omega$.` }, { value: W / (2 * PI), feedback: t`The band runs from $-W$ to $W$: its width is $2W$.` }],
          hints: [t`$\int|f|^2dt = \dfrac1{2\pi}\displaystyle\int|\hat f|^2\,d\omega$.`, t`$|\hat f|^2 = 1$ on an interval of length $2W$.`],
          teach: 'Plancherel can turn an awkward energy integral in time into a trivial one in frequency.',
          explain: t`$\dfrac{1}{2\pi}\cdot2W = \dfrac{W}{\pi} = ${r4(W / PI)}\ \text{s}^{-1}$ — equivalently $\int\frac{\sin^2Wt}{\pi^2t^2}dt = W/\pi$, a hard integral done for free.`,
        };
      },
    }),
    expr({
      id: 'duality', difficulty: 3,
      prompt: t`You know that $e^{-|t|}$ has transform $\dfrac{2}{1 + \omega^2}$. Using the symmetry of the transform pair, find the Fourier transform of $g(t) = \dfrac{1}{1 + t^2}$.`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [-0.2, 1.3], aspect: 'wide', xlabel: 't', ylabel: '', axesAt: 'edge', curves: [{ fn: '1/(1 + x^2)', color: 'accent', width: 2.2 }] }, caption: 'g(t) = 1/(1 + t²): a smooth, slowly decaying pulse.' },
      answer: 'pi*e^(-abs(omega))', answerTeX: t`\pi e^{-|\omega|}`,
      vars: { omega: [-3, 3] }, keys: [['ω', 'omega']],
      errors: [{ answer: '2*pi*e^(-abs(omega))', feedback: t`$g$ is half of $\frac{2}{1 + t^2}$, so its transform is half of $2\pi e^{-|\omega|}$.` }, { answer: 'e^(-abs(omega))/2', feedback: t`Duality brings in a factor $2\pi$: if $f \to \hat f$, then $\hat f(t) \to 2\pi f(-\omega)$.` }],
      hints: [t`Apply the forward transform to the inversion formula with $t$ and $\omega$ swapped: if $f(t) \to \hat f(\omega)$, then $\hat f(t) \to 2\pi f(-\omega)$.`, t`So $\dfrac{2}{1 + t^2} \to 2\pi e^{-|\omega|}$. Halve it.`],
      teach: 'Duality: the transform of a transform is 2π times the original, reflected.',
      explain: t`$\dfrac{2}{1 + t^2} \to 2\pi e^{-|{-\omega}|}$, so $\dfrac{1}{1 + t^2} \to \pi e^{-|\omega|}$. Check: at $\omega = 0$ it gives $\int\frac{dt}{1 + t^2} = \pi$. ✓ The smooth $g$ has a transform with a corner at $\omega = 0$ — because $g$ decays only like $1/t^2$.`,
    }),
    mcq({
      id: 'convention', difficulty: 2,
      prompt: t`A physics text defines $\tilde f(\omega) = \int f(t)\,e^{+i\omega t}\,dt$. For a **real** signal $f$, how is its $\tilde f$ related to this course’s $\hat f(\omega) = \int f(t)\,e^{-i\omega t}\,dt$?`,
      visual: { type: 'graph', params: { x: [-1.4, 1.4], y: [-1.1, 1.1], aspect: 'wide', equal: true, xlabel: 'Re', ylabel: 'Im', xticks: 0, yticks: 0, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1 }], arrows: [{ from: [0, 0], to: [0.7, 0.6], color: 'accent', label: 'f̂(ω)' }, { from: [0, 0], to: [0.7, -0.6], color: 'warn', label: '?', labelDy: 14 }] }, caption: 'A value of f̂(ω) in the complex plane, and its mirror image in the real axis.' },
      choices: [t`$\tilde f(\omega) = \hat f(-\omega) = \overline{\hat f(\omega)}$: same magnitude, opposite phase`, t`$\tilde f(\omega) = \hat f(\omega)$: the sign of the exponent does not matter`, t`$\tilde f(\omega) = -\hat f(\omega)$`, t`$\tilde f(\omega) = 2\pi\hat f(\omega)$`],
      answer: 0,
      why: {
        1: 'The sign does matter for the phase: a delay would turn the opposite way.',
        2: 'Flipping the exponent reflects ω, which for real f conjugates — it does not negate.',
        3: 'Where the 2π sits is a separate convention, but both of these put it in the inverse.',
      },
      hints: [t`$e^{+i\omega t} = e^{-i(-\omega)t}$.`, t`For real $f$, $\overline{\hat f(\omega)} = \int f\,\overline{e^{-i\omega t}}\,dt$.`],
      teach: 'Conventions differ by ω → −ω (and placement of 2π); magnitudes and energy spectra agree, phases flip.',
      explain: t`$\tilde f(\omega) = \hat f(-\omega)$, and for real $f$ that is $\overline{\hat f(\omega)}$. Power spectra $|\hat f|^2$ agree in both conventions; phases, and so the direction of a time-shift’s rotation, are reversed. Check which convention a paper uses before copying a phase.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-receiver', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([5, 10, 20]), B = r.pick([10, 20, 50]);
        const u = 2 * PI * B * 1e3 * tau * 1e-6, ans = 100 * band(u);
        return {
          prompt: t`An electromagnetic pulse from a lightning stroke reaches a spacecraft as $E(t) = E_0e^{-|t|/\tau}$ with $\tau = ${tau}\ \mu\text{s}$. Its receiver passes frequencies up to $B = ${B}$ kHz. What percentage of the pulse’s energy lies at $|\omega| < 2\pi B$? (For $e^{-a|t|}$ the share of energy below $|\omega| = W$ is $\frac2\pi\big[\arctan u + \frac{u}{1 + u^2}\big]$ with $u = W/a$.)`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-0.1, 1.1], aspect: 'wide', xlabel: 'ωτ', ylabel: '|Ê|² (relative)', axesAt: 'edge', curves: [{ fn: '1/(1 + x^2)^2', color: 'accent', width: 2.2 }], shade: [{ fn: '1/(1 + x^2)^2', from: -u, to: u, color: 'accent', alpha: 0.25 }] }, caption: 'The energy spectrum of the model pulse, with the receiver’s band shaded. Real lightning pulses rise faster than they decay; the symmetric model is a simplification.' },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * band(B * 1e3 * tau * 1e-6), feedback: t`Convert the bandwidth to angular frequency: $W = 2\pi B$.` }],
          hints: [t`Here $a = 1/\tau$, so $u = W/a = 2\pi B\tau$.`, t`$u = 2\pi\times${B * 1e3}\ \text{Hz}\times${tex(tau * 1e-6)}\ \text{s} = ${r4(u)}$.`],
          teach: 'Plancherel lets you budget a pulse’s energy by frequency band: integrate |f̂|² over the band, divide by 2π.',
          explain: t`$u = ${r4(u)}$, so the share is $\frac2\pi\big[\arctan ${r4(u)} + \frac{${r4(u)}}{1 + ${r4(u * u)}}\big] = ${r3(ans)}\%$. Shorter pulses push their energy above the band.`,
        };
      },
    }),
    mcq({
      id: 'cp-units', difficulty: 2,
      prompt: t`A voltage pulse $V(t)$, in volts, is transformed: $\hat V(\omega) = \int V(t)\,e^{-i\omega t}\,dt$. As the repetition period $T$ of a pulse train grows, its coefficients $c_n$ shrink like $1/T$ while $Tc_n \to \hat V$. What are the units of $\hat V$, and why?`,
      visual: { type: 'graph', params: { x: [-25, 25], y: [-0.35, 1.15], aspect: 'wide', xlabel: 'ω (rad/s)', ylabel: '', axesAt: 'edge', curves: [{ fn: '2*sin(x/2)/x', color: 'ink3', width: 1.6, dash: [6, 4], samples: 1200 }], points: LINES.filter((n) => n !== 0).map((n) => ({ x: (2 * PI * n) / 12, y: (12 * Math.sin((PI * n) / 12)) / (PI * n), color: 'accent', r: 3 })).concat([{ x: 0, y: 1, color: 'accent', r: 3 }]) }, caption: 'Lines of a pulse train with T = 12 s, scaled by T.' },
      choices: ['V s (volts per hertz): an amplitude density, because the lines’ amplitudes are spread over a spacing that shrinks to zero', 'V, the same as the signal: a transform only rearranges it', 'V², because it measures energy', 'V/s, because it involves a rate'],
      answer: 0,
      why: {
        1: 'Each line amplitude cₙ (volts) shrinks to zero as the lines crowd; what stays finite is amplitude per unit frequency.',
        2: 'V² s, or V²/Hz per unit time, is for energy and power spectra, |V̂|².',
        3: 'The integral multiplies by dt, which adds seconds rather than dividing by them.',
      },
      hints: ['Look at the definition: what does the dt contribute?', 'Tcₙ is volts times seconds.'],
      teach: 'A transform is a density: amplitude per unit frequency, units of the signal times seconds.',
      explain: t`$\int V\,dt$ has units V s $=$ V/Hz. The finite quantity in the limit is $Tc_n$, the line amplitude divided by the line spacing $1/T$: an amplitude **density**. That is why only a band of frequencies, never a single one, carries a finite share of a pulse’s energy.`,
    }),
  ],
  sources: [SRC.stein, SRC.rhb],
});
