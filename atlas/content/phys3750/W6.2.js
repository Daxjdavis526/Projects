// The Fourier transform as the T → ∞ limit of the series: the comb of
// harmonics merges into a continuous spectrum. Conventions match the course's
// e^{−iωt}: f(t) = (1/2π)∫ f̃(ω) e^{−iωt} dω, f̃(ω) = ∫ f(t) e^{iωt} dt.
// The pairs a physicist uses (rectangle ↔ sinc, Gaussian ↔ Gaussian, ringdown
// ↔ Lorentzian, delta ↔ flat), the shift and derivative rules, Parseval, and
// record length as frequency resolution. Worked example: GW150914's ringdown.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';

const t = String.raw;

// the worked example: the ringdown of GW150914 (Abbott et al. 2016: 251 ± 8 Hz, 4.0 ± 0.3 ms)
const EX = (() => {
  const f1 = 251, tau = 4.0e-3, gamma = 1 / tau;
  const dw = 2 * gamma, df = dw / (2 * Math.PI), Q = f1 / df, cyc = f1 * tau;
  return { f1, tau, gamma, dw, df, Q, cyc };
})();

// erf by Abramowitz–Stegun 7.1.26 is too coarse for 3 s.f. checks; use a series / continued fraction
function erf(x) {
  // Taylor series, fine for |x| ≤ 3
  let s = 0, term = x, n = 0;
  while (Math.abs(term) > 1e-16 * Math.abs(s) || n < 5) { s += term / (2 * n + 1); n++; term *= (-x * x) / n; if (n > 200) break; }
  return (2 / Math.sqrt(Math.PI)) * s;
}

export default lesson({
  id: 'phys3750.W6.2',
  title: 'The Fourier transform',
  minutes: 16, difficulty: 3,
  intro: t`Stretch the period of a signal: the harmonics $n\omega_0$ crowd together, $\omega_0 = 2\pi/T \to 0$, and in the limit a **single** pulse has a continuous spectrum. Writing $\tilde f(\omega) = \lim Tc_n$ at $\omega = n\omega_0$, the series becomes a pair of integrals:

$$f(t) = \frac{1}{2\pi}\int_{-\infty}^{\infty}\tilde f(\omega)\,e^{-i\omega t}\,d\omega, \qquad \tilde f(\omega) = \int_{-\infty}^{\infty}f(t)\,e^{i\omega t}\,dt$$

$\tilde f(\omega)$ is the **complex amplitude per unit angular frequency**: how much of $e^{-i\omega t}$ the pulse contains, and with what phase. Short in time means wide in frequency; a delay is a phase that grows with $\omega$; and a derivative is just multiplication by $-i\omega$. The same transform in space, with $x$ and $k$, solves PDEs in [Fourier transform solutions](#/lesson/st-b.B8.2); here it is the language of signals.`,
  symbols: [
    { tex: 'f(t)', text: 'a signal that need not repeat: a pulse, a burst, a ringdown' },
    { tex: '\\tilde f(\\omega)', text: 'its Fourier transform: a complex amplitude density, in (units of $f$)·s' },
    { tex: '\\omega', text: 'angular frequency, in rad/s; negative $\\omega$ is allowed, and for a real $f$, $\\tilde f(-\\omega) = \\tilde f(\\omega)^*$' },
    { tex: 'e^{-i\\omega t}', text: 'the elementary oscillation the signal is built from (this course’s sign convention)' },
    { tex: '\\tfrac{1}{2\\pi}', text: 'the price of using $\\omega$ rather than $f$: $d\\omega/2\\pi = df$, cycles per second' },
  ],
  why: t`Every linear wave equation acts on each $e^{-i\omega t}$ separately; the transform is how a pulse is split into those pieces and put back together.`,
  visual: {
    type: 'pde2-fourier',
    title: 'Short in one domain, wide in the other',
    lead: t`Top: a pulse $f$ of width $w$. Bottom: its transform. The same maths works in time ($t$, $\omega$) and in space ($x$, $k$); this picture is drawn in space.`,
    tasks: [
      t`Halve the width $w$: the spectrum doubles in width and halves in height — its area, $f(0)$ times $2\pi$, cannot change.`,
      t`Switch to the square pulse: its spectrum $2\sin(kw)/k$ has zeros and long wiggling tails, because the edges are sharp.`,
      t`Compare the Gaussian: its transform is another Gaussian, with no tails and no zeros.`,
    ],
    params: { eq: 'wave', t: 0, tmax: 0.01, controls: ['profile', 'w'], mult: false, labels: false, readout: false, x: 6, k: 10 },
    caption: t`The profile (top) and its Fourier transform (bottom). Exact transforms; the window shows $|x| < 6$ and $|k| < 10$ only.`,
  },
  example: {
    prompt: t`After two black holes merged to make GW150914, the new hole “rang down”: LIGO measured a dominant oscillation at $f_1 = ${EX.f1}$ Hz whose amplitude decayed with time constant $\tau = ${EX.tau * 1e3}$ ms. Model the ringdown as $f(t) = e^{-t/\tau}e^{-i\omega_1t}$ for $t \ge 0$. What does its spectrum look like, and how sharp is the line?`,
    steps: [
      { label: 'Transform', text: t`$\tilde f(\omega) = \int_0^\infty e^{-t/\tau}e^{i(\omega - \omega_1)t}\,dt = \dfrac{1}{1/\tau - i(\omega - \omega_1)}$: one integral of an exponential.` },
      { label: 'Power spectrum', text: t`$|\tilde f|^2 = \dfrac{1}{(1/\tau)^2 + (\omega - \omega_1)^2}$, a **Lorentzian** peaked at $\omega_1$. It falls to half its peak where $|\omega - \omega_1| = 1/\tau$.` },
      { label: 'Width', text: t`Full width at half maximum: $\Delta\omega = 2/\tau = ${tn(EX.dw)}$ rad/s, i.e. $\Delta f = \Delta\omega/2\pi = 1/(\pi\tau) = ${tn(EX.df)}$ Hz.` },
      { label: 'Quality factor', text: t`$Q = f_1/\Delta f = \pi f_1\tau = ${tn(EX.Q)}$: a very dull bell. The hole rings about $f_1\tau \approx ${tn(EX.cyc, 2)}$ cycle per decay time.` },
      { label: 'Sense check', text: t`A ringing that lasts $\tau$ cannot have a frequency sharper than about $1/\tau$: $\Delta f \cdot \tau = 1/\pi$. A tuning fork that rings for seconds has a line a fraction of a hertz wide.` },
    ],
    answer: t`A Lorentzian centred on ${EX.f1} Hz with full width $\Delta f = 1/(\pi\tau) \approx ${tn(EX.df, 2)}$ Hz, so $Q \approx ${tn(EX.Q, 2)}$. General relativity predicts both $f_1$ and $\tau$ from the final mass and spin, so measuring them tests the theory.`,
    visual: curvesPic([
      { fn: `1/(1 + ((x - ${EX.f1})*2*pi*${EX.tau})^2)`, color: 'accent', width: 2.4 },
    ], [0, 600], [0, 1.15], t`$|\tilde f|^2$ of the model ringdown against frequency, normalised to its peak; the dashed line is half the peak. Single-mode model of the measured ringdown; the real signal also contains the merger before it.`, { xlabel: 'frequency (Hz)', ylabel: '|f̃|² (relative)', hlines: [{ y: 0.5, color: 'ink3', label: 'half' }], vlines: [{ x: EX.f1 - EX.df / 2, color: 'gold' }, { x: EX.f1 + EX.df / 2, color: 'gold' }] }),
  },
  practice: [
    num({
      id: 'rect-null', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.5, 2, 4, 8, 20]);   // ms
        return {
          prompt: t`An igniter test produces a nearly rectangular pressure pulse lasting $\tau = ${tau}$ ms. Its transform is $\tilde f(\omega) = \dfrac{2\sin(\omega\tau/2)}{\omega}$ (times the height). At what lowest frequency $f > 0$ is the spectrum zero? Give Hz.`,
          visual: curvesPic([{ fn: `step(x + ${tau / 2})*step(${tau / 2} - x)`, color: 'accent', samples: 2000 }], [-tau * 1.5, tau * 1.5], [-0.2, 1.3], t`The pulse: height 1 for $|t| < \tau/2$, time in ms.`, { xlabel: 't (ms)', ylabel: 'p (relative)' }),
          answer: 1000 / tau, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: 2000 / tau, feedback: t`$\sin(\omega\tau/2) = 0$ first at $\omega\tau/2 = \pi$, so $\omega = 2\pi/\tau$ and $f = 1/\tau$.` }, { value: (2 * Math.PI * 1000) / tau, feedback: t`That is $\omega$ in rad/s; the frequency is $\omega/2\pi$.` }],
          hints: [t`The zeros of $\sin(\omega\tau/2)$ are at $\omega\tau/2 = \pi, 2\pi, \ldots$`, t`$\omega = 2\pi/\tau$, so $f = 1/\tau$ — with $\tau$ in seconds.`],
          teach: t`A rectangle of duration $\tau$ has a sinc spectrum with zeros at $f = 1/\tau, 2/\tau, \ldots$: most of its energy lies below $1/\tau$.`,
          explain: t`$f = 1/\tau = 1/(${tn(tau * 1e-3)}\ \text{s}) = ${tn(1000 / tau)}$ Hz. A pressure transducer for this test needs a bandwidth well above that.`,
        };
      },
    }),
    mcq({
      id: 'tap-test', difficulty: 2,
      prompt: t`In a ground vibration test of an aircraft wing, engineers strike it with an instrumented hammer whose blow lasts well under a millisecond. Why does one sharp tap excite all the wing’s low modes at once?`,
      visual: curvesPic([{ fn: 'e^(-x^2/(2*0.15^2))', color: 'accent' }], [-3, 3], [-0.15, 1.2], t`The hammer force against time (ms): a short spike, idealised as a Gaussian.`, { xlabel: 't (ms)', ylabel: 'force (relative)' }),
      choices: [
        t`A very short pulse has a nearly flat spectrum: it contains every frequency up to about $1/(\text{duration})$ with similar amplitude`,
        t`The tap is so strong that the wing’s response becomes nonlinear, mixing every mode together`,
        t`A short pulse contains only very high frequencies, which then cascade down into the low modes`,
        t`The tap excites only the fundamental, and the other modes are set going by the wing’s damping`,
      ],
      answer: 0,
      why: {
        1: 'Modal testing deliberately stays linear; the method relies on it.',
        2: t`A short pulse contains the low frequencies too: $\tilde f(0) = \int f\,dt$, the impulse, is the spectrum’s value at zero frequency.`,
        3: 'Damping removes energy; it does not move it between modes of a linear structure.',
      },
      hints: [t`What is the transform of $\delta(t)$?`, t`$\int\delta(t)\,e^{i\omega t}\,dt = 1$ for every $\omega$. A pulse of duration $\Delta t$ behaves like that up to $\omega \sim 1/\Delta t$.`],
      teach: t`An impulse has a flat spectrum: $\tilde\delta(\omega) = 1$. A short real pulse is flat up to about $1/(\text{its duration})$.`,
      explain: t`The spectrum of a tap lasting $\Delta t$ is flat up to a few hundred hertz for $\Delta t \lesssim 1$ ms — covering a wing’s bending and torsion modes. A softer hammer tip lengthens the pulse and deliberately cuts the high frequencies off.`,
    }),
    num({
      id: 'ring-width', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.5, 1.2, 3, 8]), f1 = r.pick([2, 5, 12]);
        const df = 1 / (Math.PI * tau);
        return {
          prompt: t`After a thruster firing, a satellite’s solar-array boom rings at ${f1} Hz, its amplitude decaying as $e^{-t/\tau}$ with $\tau = ${tau}$ s. What is the full width at half maximum of the line in its power spectrum $|\tilde f|^2$, in Hz?`,
          visual: curvesPic([{ fn: `step(x)*e^(-x/${tau})*cos(2*pi*${f1}*x)`, color: 'accent', samples: 3000 }, { fn: `step(x)*e^(-x/${tau})`, color: 'gold', dash: [5, 4], width: 1.2 }], [-0.2 * tau, 4 * tau], [-1.15, 1.15], t`The boom tip’s motion against time (s) and its envelope $e^{-t/\tau}$ (dashed).`, { xlabel: 't (s)', ylabel: 'y (relative)' }),
          answer: df, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: 1 / tau, feedback: t`That is $\Delta\omega/2 = 1/\tau$ in s⁻¹. The full width is $\Delta\omega = 2/\tau$, and $\Delta f = \Delta\omega/2\pi = 1/(\pi\tau)$.` }, { value: 2 / tau, feedback: t`$2/\tau$ is the width in rad/s; divide by $2\pi$ for Hz.` }, { value: 1 / (2 * Math.PI * tau), feedback: 'That is the half width. Double it.' }],
          hints: [t`$|\tilde f|^2 \propto 1/\big((1/\tau)^2 + (\omega - \omega_1)^2\big)$ is half its peak at $|\omega - \omega_1| = 1/\tau$.`, t`$\Delta\omega = 2/\tau$; $\Delta f = 1/(\pi\tau)$.`],
          teach: t`A ringing that decays in time $\tau$ gives a Lorentzian line of full width $\Delta f = 1/(\pi\tau)$, wherever it is centred.`,
          explain: t`$\Delta f = 1/(\pi \times ${tau}) = ${tn(df)}$ Hz around ${f1} Hz, so $Q = \pi f_1\tau = ${tn(Math.PI * f1 * tau)}$. Engineers read damping straight off the width of a measured line.`,
        };
      },
    }),
    mcq({
      id: 'derivative', difficulty: 2,
      prompt: t`With $f(t) = \frac{1}{2\pi}\int\tilde f(\omega)\,e^{-i\omega t}\,d\omega$, what is the Fourier transform of $\dfrac{d^2f}{dt^2}$?`,
      visual: curvesPic([{ fn: 'cos(2*x)', color: 'accent', label: 'cos ωt', labelAt: 0.5, labelDy: -10 }, { fn: '-4*cos(2*x)', color: 'gold', dash: [5, 4], label: '−ω² cos ωt', labelAt: 2.2, labelDy: 18 }], [0, 6.3], [-4.6, 4.6], t`One elementary oscillation (ω = 2) and its second derivative: the same shape, multiplied by $-\omega^2$.`, { xlabel: 't', ylabel: '' }),
      choices: [t`$-\omega^2\tilde f(\omega)$`, t`$\omega^2\tilde f(\omega)$`, t`$-i\omega\tilde f(\omega)$`, t`$\tilde f(\omega)/(-\omega^2)$`],
      answer: 0,
      why: {
        1: t`$(-i\omega)^2 = i^2\omega^2 = -\omega^2$: the sign matters — it is what makes $\ddot x = -\omega^2x$ oscillate.`,
        2: t`That is one derivative. Each $d/dt$ brings down one factor $-i\omega$; two bring $(-i\omega)^2$.`,
        3: 'Division by −ω² is what integrating twice does, not differentiating.',
      },
      hints: [t`Differentiate under the integral: only $e^{-i\omega t}$ depends on $t$.`, t`$\frac{d}{dt}e^{-i\omega t} = -i\omega\,e^{-i\omega t}$.`],
      teach: t`In this convention $d/dt \to -i\omega$: derivatives become multiplications, which is why the transform turns a linear ODE or PDE into algebra.`,
      explain: t`$\frac{d^2}{dt^2}e^{-i\omega t} = (-i\omega)^2e^{-i\omega t} = -\omega^2e^{-i\omega t}$, so $\widetilde{f''} = -\omega^2\tilde f$. The wave equation $y_{tt} = v^2y_{xx}$ becomes $-\omega^2 = -v^2k^2$ for each piece.`,
    }),
    num({
      id: 'delay-phase', difficulty: 2,
      gen(r) {
        const f = r.pick([100, 250, 400]), t0 = r.pick([0.4, 0.6, 1.5]);   // Hz, ms
        const ph = 2 * Math.PI * f * t0 * 1e-3;
        return {
          prompt: t`A pulse $f(t)$ reaches a second microphone $t_0 = ${t0}$ ms later, unchanged: $g(t) = f(t - t_0)$. By what angle is $\tilde g(\omega)$ turned relative to $\tilde f(\omega)$ at ${f} Hz? Give radians.`,
          visual: curvesPic([{ fn: 'e^(-(x - 1)^2/(2*0.25^2))', color: 'accent', label: 'f', labelAt: 1, labelDy: -12 }, { fn: `e^(-(x - 1 - ${t0})^2/(2*0.25^2))`, color: 'gold', dash: [5, 4], label: 'g', labelAt: 1 + t0, labelDy: -12 }], [0, 4], [-0.1, 1.3], t`The pulse at the two microphones, time in ms.`, { xlabel: 't (ms)', ylabel: '' }),
          answer: ph, tol: { rel: 0.01 },
          errors: [{ value: f * t0 * 1e-3, feedback: t`That is the delay in cycles. In radians it is $\omega t_0 = 2\pi ft_0$.` }, { value: 2 * Math.PI * f * t0, feedback: 'Convert the delay to seconds first.' }],
          hints: [t`$\tilde g(\omega) = \int f(t - t_0)e^{i\omega t}\,dt$; substitute $s = t - t_0$.`, t`$\tilde g = e^{i\omega t_0}\tilde f$: the angle is $\omega t_0 = 2\pi ft_0$.`],
          teach: t`A delay $t_0$ multiplies the transform by $e^{i\omega t_0}$: the magnitudes stay, the phase grows linearly with frequency.`,
          explain: t`$\omega t_0 = 2\pi(${f})(${tn(t0 * 1e-3)}) = ${tn(ph)}$ rad. A phase that grows in proportion to $\omega$ is the fingerprint of a pure delay — how arrays of microphones or antennas find the direction of a source.`,
        };
      },
    }),
    num({
      id: 'gauss-energy', difficulty: 3,
      gen(r) {
        const sig = r.pick([2, 5, 10]), u = r.pick([0.5, 0.75, 1.5]);    // σ in μs, ω_c = u/σ
        const wc = u / (sig * 1e-6), frac = erf(u);
        return {
          prompt: t`A Gaussian pulse $e^{-t^2/2\sigma^2}$ with $\sigma = ${sig}\ \mu\text{s}$ has $|\tilde f(\omega)|^2 \propto e^{-\sigma^2\omega^2}$. By Parseval, energy is shared out over $\omega$ in proportion to $|\tilde f|^2$. What fraction of the pulse’s energy lies at $|\omega| < ${tn(wc, 3)}$ rad/s? Give 3 significant figures.`,
          visual: curvesPic([{ fn: `e^(-x^2)`, color: 'accent' }], [-3, 3], [0, 1.2], t`The energy spectrum $|\tilde f|^2$ against $\sigma\omega$; the band asked about is shaded.`, { xlabel: 'σ ω', ylabel: '|f̃|² (relative)', shade: [{ fn: 'e^(-x^2)', from: -u, to: u, color: 'gold', alpha: 0.3 }] }),
          answer: frac, tol: { rel: 0.004 },
          errors: [{ value: erf(u / Math.SQRT2), feedback: t`The energy spectrum is $|\tilde f|^2 \propto e^{-\sigma^2\omega^2}$, not $e^{-\sigma^2\omega^2/2}$: square the transform before you integrate.` }],
          hints: [t`Fraction $= \dfrac{\int_{-\omega_c}^{\omega_c}e^{-\sigma^2\omega^2}d\omega}{\int_{-\infty}^{\infty}e^{-\sigma^2\omega^2}d\omega}$; substitute $s = \sigma\omega$.`, t`$\sigma\omega_c = ${u}$, and $\frac{1}{\sqrt\pi}\int_{-a}^{a}e^{-s^2}ds = \operatorname{erf}(a)$.`],
          teach: t`Parseval for transforms: $\int|f|^2dt = \frac{1}{2\pi}\int|\tilde f|^2d\omega$ — the energy can be counted in either domain, and $|\tilde f|^2$ says where it lives.`,
          explain: t`$\sigma\omega_c = ${u}$, so the fraction is $\operatorname{erf}(${u}) = ${tn(frac, 4)}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ringdown-q', difficulty: 3, transfer: true,
      gen(r) {
        const f1 = r.pick([120, 180, 320, 450]), tau = r.pick([3, 5, 8]);   // Hz, ms
        const Q = Math.PI * f1 * tau * 1e-3;
        return {
          prompt: t`A future detector records a black-hole ringdown at $f_1 = ${f1}$ Hz with amplitude decay time $\tau = ${tau}$ ms. Its power spectrum is a Lorentzian. What is the line’s quality factor $Q = f_1/\Delta f$, with $\Delta f$ the full width at half maximum?`,
          visual: curvesPic([{ fn: `step(x)*e^(-x/${tau})*cos(2*pi*${f1 / 1000}*x)`, color: 'accent', samples: 3000 }], [-2, 5 * tau], [-1.15, 1.15], t`The model ringdown against time (ms), starting at the merger.`, { xlabel: 't (ms)', ylabel: 'strain (relative)' }),
          answer: Q, tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * f1 * tau * 1e-3, feedback: t`The full width is $\Delta f = 1/(\pi\tau)$, so $Q = \pi f_1\tau$, not $2\pi f_1\tau$.` }, { value: f1 * tau * 1e-3, feedback: t`That is the number of cycles per decay time, $f_1\tau$; $Q$ is $\pi$ times it.` }],
          hints: [t`$\Delta f = 1/(\pi\tau)$ for an amplitude decay time $\tau$.`, t`$Q = f_1/\Delta f = \pi f_1\tau$, with $\tau$ in seconds.`],
          teach: t`Decay time and line width are one fact seen twice: $\Delta f = 1/(\pi\tau)$, $Q = \pi f\tau$.`,
          explain: t`$Q = \pi(${f1})(${tn(tau * 1e-3)}) = ${tn(Q)}$. Black holes are poor bells: their energy leaks away as gravitational waves within a few cycles.`,
        };
      },
    }),
    mcq({
      id: 'cp-burst', difficulty: 2,
      prompt: t`A transmitter sends a burst: a 10 MHz carrier switched on for 1 μs (pictured). Which best describes its spectrum $|\tilde f|$?`,
      visual: curvesPic([{ fn: 'step(x)*step(1 - x)*sin(2*pi*10*x)', color: 'accent', samples: 3000 }], [-0.5, 1.5], [-1.3, 1.3], t`The burst against time (μs): 10 cycles of the carrier.`, { xlabel: 't (μs)', ylabel: '' }),
      choices: [
        'A peak centred on 10 MHz, about 1 MHz wide, with weaker side lobes',
        'A single sharp line exactly at 10 MHz, since the carrier is a pure sine',
        'A broad peak centred on 1 MHz, the inverse of the burst length',
        'Two peaks, one at 10 MHz from the carrier and one at 1 MHz from the switching',
      ],
      answer: 0,
      why: {
        1: 'Only an endless sine has a single sharp line; switching it on and off for 1 μs smears the line over about 1/(1 μs).',
        2: t`The width is about $1/\tau$, but it sits around the carrier: multiplying by $e^{-i\omega_ct}$ shifts the whole spectrum to $\omega_c$.`,
        3: 'Multiplying two signals does not add their spectra; it shifts the rectangle’s sinc to sit on the carrier.',
      },
      hints: [t`The burst is a rectangle of duration $\tau$ times $e^{-i\omega_ct}$ (taking one of the sine’s two exponentials).`, t`Multiplying by $e^{-i\omega_ct}$ shifts the transform: $\tilde f(\omega - \omega_c)$.`],
      teach: t`Modulation shifts a spectrum: an envelope of duration $\tau$ on a carrier gives a peak at the carrier about $1/\tau$ wide.`,
      explain: t`The rectangle’s sinc, first zeros at $\pm 1/\tau = \pm 1$ MHz, is moved up to 10 MHz (and its mirror to −10 MHz). Every radio channel works this way: the message’s spectrum rides on the carrier.`,
    }),
    num({
      id: 'cp-record', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([50, 60, 400]), d = r.pick([0.1, 0.2, 0.5]);
        return {
          prompt: t`A vibration monitor on a turbopump test stand must separate two lines, ${f} Hz and ${f + d} Hz. Recording for a time $T$ turns each line into a sinc of half-width $1/T$ (first zero $1/T$ from the centre). What is the shortest record for which the two centres are at least that far apart, in s?`,
          visual: curvesPic([
            { fn: `abs(sin(pi*(x - ${f})*${0.6 / d})/(pi*(x - ${f})*${0.6 / d}))`, color: 'accent', samples: 2000 },
            { fn: `abs(sin(pi*(x - ${f + d})*${0.6 / d})/(pi*(x - ${f + d})*${0.6 / d}))`, color: 'gold', dash: [5, 4], samples: 2000 },
          ], [f - 2 * d, f + 3 * d], [0, 1.15], t`The two lines’ spectra $|\tilde f|$ (relative) for a record too short to separate them cleanly (frequency in Hz).`, { xlabel: 'frequency (Hz)', ylabel: '' }),
          answer: 1 / d, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 1 / (2 * Math.PI * d), feedback: t`The sinc's zero is $1/T$ in hertz, not in rad/s.` }],
          hints: [t`Need $1/T \le \Delta f = ${d}$ Hz.`, t`$T \ge 1/\Delta f$.`],
          teach: t`Frequency resolution is the inverse of the record length: $\Delta f \approx 1/T$.`,
          explain: t`$T = 1/${d} = ${tn(1 / d)}$ s. No amount of computing can sharpen lines beyond $1/T$ without more data — it is the transform’s own trade-off.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 8–9 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'Abbott et al. (LIGO–Virgo), Observation of Gravitational Waves from a Binary Black Hole Merger, PRL 116, 061102 (2016): ringdown 251 ± 8 Hz, 4.0 ± 0.3 ms', url: 'https://arxiv.org/abs/1602.03837' },
  ],
});
