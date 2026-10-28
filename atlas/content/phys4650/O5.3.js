// Fourier analysis of light (Hecht §7.3–7.4), brief and optical: PHYS 3750
// W6.1–6.3 did series, transforms and Δf Δt ≳ 1. Here the optical cases: a
// transform-limited Gaussian pulse has Δν τ = 2 ln 2/π ≈ 0.441 (FWHM); a
// pulse train repeating every T has a spectrum of lines spaced 1/T under the
// single pulse's envelope — a mode-locked laser is a frequency comb; Δλ =
// λ²Δν/c; coherence time 1/Δν and coherence length c/Δν ≈ λ²/Δλ (an LED, a
// laser diode, a stabilized laser). Explore: the spectrum of M pulses
// sharpening into comb lines. Transfers: the narrowest filter a laser
// altimeter's receiver could use, the linewidth a coherent lidar needs.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, sf } from './_op.js';

const t = String.raw;
const TB = (2 * Math.LN2) / Math.PI;      // 0.4413: Gaussian FWHM time–bandwidth product

// the worked example: an erbium fibre comb
const EX = { frep: 250e6, tau: 80e-15, lam: 1560e-9 };
EX.dnu = TB / EX.tau;
EX.dlam = (EX.lam ** 2 * EX.dnu) / C;
EX.lines = EX.dnu / EX.frep;
EX.nu = C / EX.lam;

/** A train of Gaussian pulses (intensity) against time; tau and T in the same units. */
const trainPic = (tau, T, caption, n = 5) => ({
  type: 'graph', caption,
  params: { x: [-(n / 2 + 0.3) * T, (n / 2 + 0.3) * T], y: [0, 1.15], aspect: 'wide', xlabel: 'time', ylabel: 'irradiance', yticks: 2, xticks: 0,
    curves: [{ fn: Array.from({ length: n }, (_, m) => `exp(-2.7726*((x - ${sf((m - (n - 1) / 2) * T, 5)})/${tau})^2)`).join(' + '), color: 'gold', width: 2, samples: 3000 }] },
});
/** The spectrum of M pulses of FWHM tau (ps) every T (ps): detuning in THz. */
const specPic = (tau, T, M, caption, extra = {}) => ({
  type: 'graph', caption,
  params: { x: [-3, 3], y: [0, 1.1], aspect: 'wide', xlabel: 'frequency offset from the carrier (THz)', ylabel: 'spectral power', yticks: 2,
    curves: [{ fn: `exp(-2.7726*x^2/(${sf(TB / tau, 5)})^2)*(sin(${M}*pi*(x + 0.000000001)*${T})/(${M}*sin(pi*(x + 0.000000001)*${T})))^2`, color: 'accent', width: 1.6, samples: 4000 }, { fn: `exp(-2.7726*x^2/(${sf(TB / tau, 5)})^2)`, color: 'gold', width: 1.4, dash: [5, 4] }],
    ...extra },
});

export default lesson({
  id: 'phys4650.O5.3',
  title: 'Fourier analysis of light',
  minutes: 14, difficulty: 3,
  intro: t`No real light is a single frequency. A pulse lasting $\tau$ is a superposition of frequencies spread over about $1/\tau$ ([PHYS 3750 W6.3](#/lesson/phys3750.W6.3)); for the smooth Gaussian pulses lasers make, measured as full widths at half maximum,

$$\Delta\nu\,\tau \geq \frac{2\ln 2}{\pi} \approx 0.441$$

with equality for a pulse with no chirp, called **transform-limited**. Repeat the pulse every $T$ and the spectrum breaks into sharp lines spaced $1/T$ under the same envelope: a mode-locked laser is a **frequency comb**. Turned around, the bandwidth of any source fixes how long its waves stay in step — its coherence time $1/\Delta\nu$ and **coherence length** $c/\Delta\nu \approx \lambda^2/\Delta\lambda$.`,
  symbols: [
    { tex: '\\Delta\\nu', text: 'the spectral width (FWHM of the power spectrum), in Hz' },
    { tex: '\\tau', text: 'the pulse duration (FWHM of the irradiance against time), in s' },
    { tex: '2\\ln 2/\\pi', text: t`the time–bandwidth product of a Gaussian pulse; other shapes have other constants (0.315 for $\text{sech}^2$)` },
  ],
  why: t`Pulse lengths, filter widths, comb spacings and coherence lengths are one Fourier pair seen four ways; lidars, altimeters, frequency combs and interferometers are designed with it.`,
  visual: {
    type: 'graph',
    params: {
      x: [-3, 3], y: [0, 1.1], aspect: 'wide', xlabel: 'frequency offset from the carrier (THz)', ylabel: 'spectral power', yticks: 2,
      sliders: [
        { key: 'tau', label: 'Pulse duration $\\tau$', min: 0.2, max: 2, step: 0.05, value: 0.5, unit: '\\mathrm{ps}', explain: 'Full width at half maximum of each pulse.' },
        { key: 'T', label: 'Pulse spacing $T$', min: 2, max: 10, step: 0.5, value: 4, unit: '\\mathrm{ps}', explain: 'Time from one pulse to the next.' },
        { key: 'M', label: 'Number of pulses $M$', min: 1, max: 12, step: 1, value: 3, explain: 'How many identical pulses the burst contains.' },
      ],
      curves: [
        { fn: `exp(-2.7726*x^2*tau^2/${sf(TB, 6)}^2)*(sin(M*pi*(x + 0.000000001)*T)/(M*sin(pi*(x + 0.000000001)*T)))^2`, color: 'accent', width: 1.6, samples: 4000 },
        { fn: `exp(-2.7726*x^2*tau^2/${sf(TB, 6)}^2)`, color: 'gold', width: 1.4, dash: [5, 4] },
      ],
      readouts: [
        { label: 'envelope width $0.441/\\tau$', expr: `${sf(TB, 6)}/tau`, unit: '\\mathrm{THz}', digits: 3 },
        { label: 'line spacing $1/T$', expr: '1000/T', unit: '\\mathrm{GHz}', digits: 3 },
      ],
    },
    caption: t`$|\text{spectrum}|^2$ of $M$ identical transform-limited Gaussian pulses: the single-pulse envelope (gold, dashed) times the interference of $M$ copies, $\bigl[\sin(M\pi fT)/M\sin(\pi fT)\bigr]^2$. Normalized to 1 at the peak; carrier frequency removed.`,
    title: 'From one pulse to a comb',
    lead: t`The spectrum of a burst of $M$ identical laser pulses, each $\tau$ long and $T$ apart. One pulse has a smooth spectrum; more pulses concentrate it into lines.`,
    tasks: [
      t`$M = 1$: one pulse, a smooth Gaussian spectrum $0.441/\tau$ wide. Halve $\tau$: twice as wide.`,
      t`Raise $M$: lines appear exactly $1/T$ apart, and sharpen as $1/MT$. A laser running for ever ($M \to \infty$) has infinitely sharp lines: a comb.`,
      t`Change $T$ without changing $\tau$: the line spacing changes, the envelope does not.`,
    ],
  },
  example: {
    prompt: t`An erbium fibre laser emits transform-limited Gaussian pulses of $\tau = ${EX.tau * 1e15}$ fs at 1560 nm, ${EX.frep / 1e6} million times a second. Describe its spectrum: the spacing of its lines, the width of the envelope in frequency and in wavelength, and roughly how many lines it holds.`,
    visual: trainPic(0.08, 1, t`The pulse train in time (pulses drawn far wider than the real 80 fs in a 4 ns period: the true duty cycle is 1 in 50 000).`),
    steps: [
      { label: 'Line spacing', text: t`The train repeats every $T = 1/f_{\text{rep}} = ${sf(1e9 / EX.frep, 3)}$ ns, so its spectrum has lines every $f_{\text{rep}} = ${EX.frep / 1e6}$ MHz.` },
      { label: 'Envelope', text: t`Each pulse sets the envelope: $\Delta\nu = 0.441/\tau = ${sf(EX.dnu / 1e12, 3)}$ THz.` },
      { label: 'In wavelength', text: t`$\Delta\lambda = \lambda^2\Delta\nu/c = ${sf(EX.dlam * 1e9, 3)}$ nm around 1560 nm (from $\nu = c/\lambda$, $|d\lambda| = \lambda^2|d\nu|/c$).` },
      { label: 'Number of lines', text: t`$\Delta\nu/f_{\text{rep}} \approx ${sf(EX.lines, 2)}$ lines within the half-maximum, each locked to the next at exactly 250 MHz — a ruler in frequency. Measure the comb’s offset and spacing against an atomic clock and every line’s frequency is known: the basis of optical clocks (Hall and Hänsch, Nobel Prize 2005).` },
      { label: 'Sense check', text: t`The carrier is $c/\lambda = ${sf(EX.nu / 1e12, 4)}$ THz, so the pulse’s bandwidth is ${sf((EX.dnu / EX.nu) * 100, 2)}% of it — about ${Math.round(EX.tau * EX.nu)} optical cycles fit within the pulse’s half-maximum width.` },
    ],
    answer: t`Lines every 250 MHz under an envelope $${sf(EX.dnu / 1e12, 3)}$ THz ($${sf(EX.dlam * 1e9, 3)}$ nm) wide: about $${sf(EX.lines, 2)}$ lines.`,
  },
  practice: [
    num({
      id: 'tl-bandwidth', difficulty: 1,
      gen(r) {
        const [tau, u, s] = r.pick([[20, 'fs', 1e-15], [100, 'fs', 1e-15], [1, 'ps', 1e-12], [10, 'ps', 1e-12], [5, 'ns', 1e-9]]);
        const dnu = TB / (tau * s);
        return {
          prompt: t`A transform-limited Gaussian laser pulse lasts ${tau} ${u} (FWHM). What is the smallest possible spectral width of its light, in GHz?`,
          visual: specPic(1, 4, 1, t`The spectrum of a single Gaussian pulse: smooth and Gaussian, with width inversely proportional to the duration.`),
          answer: dnu / 1e9, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: 1 / (tau * s) / 1e9, feedback: t`That is the rough $1/\tau$; for Gaussian FWHMs the constant is $2\ln2/\pi = 0.441$.` }, { value: TB / (2 * Math.PI * tau * s) / 1e9, feedback: 'Δν is in hertz (cycles per second), not rad/s: no 2π.' }],
          hints: [t`$\Delta\nu = 0.441/\tau$.`],
          teach: t`A Gaussian pulse of duration $\tau$ needs at least $0.441/\tau$ of bandwidth.`,
          explain: t`$\Delta\nu = 0.441/(${tau}\ \text{${u}}) = ${sf(dnu / 1e9, 3)}$ GHz.`,
        };
      },
    }),
    num({
      id: 'dnu-dlam', difficulty: 2,
      gen(r) {
        const lam = r.pick([532, 800, 1064, 1550]), dnu = r.pick([0.1, 1, 5, 10]);   // THz
        const dl = ((lam * 1e-9) ** 2 * dnu * 1e12) / C * 1e9;
        return {
          prompt: t`Light centred on ${lam} nm has a spectral width of ${dnu} THz. What is its width in wavelength, in nm?`,
          visual: specPic(TB / dnu > 3 ? 1 : TB / dnu, 4, 1, t`A Gaussian spectrum against frequency; the same width in wavelength depends on where in the spectrum it sits.`),
          answer: dl, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: (C / (dnu * 1e12)) * 1e9, feedback: t`$c/\Delta\nu$ is a length, but not the spectral width: that is a coherence length. Use $\Delta\lambda = \lambda^2\Delta\nu/c$.` }, { value: (lam * dnu * 1e12) / (C / (lam * 1e-9)) , feedback: 'Close: check the arithmetic and units (λ in m, Δν in Hz).' }].filter((e) => Math.abs(e.value - dl) > 0.01 * dl),
          hints: [t`$\nu = c/\lambda$, so $|d\nu| = c\,|d\lambda|/\lambda^2$.`, t`$\Delta\lambda = \lambda^2\Delta\nu/c$.`],
          teach: t`$\Delta\lambda = \lambda^2\Delta\nu/c$: the same frequency width is wider in wavelength at longer wavelengths.`,
          explain: t`$\Delta\lambda = (${lam}\ \text{nm})^2\times${dnu}\ \text{THz}/c = ${sf(dl, 3)}$ nm.`,
        };
      },
    }),
    num({
      id: 'comb-lines', difficulty: 2,
      gen(r) {
        const frep = r.pick([100, 250, 1000]), tau = r.pick([50, 100, 200]);   // MHz, fs
        const n = TB / (tau * 1e-15) / (frep * 1e6);
        return {
          prompt: t`A mode-locked laser emits ${tau} fs transform-limited Gaussian pulses at a repetition rate of ${frep} MHz. About how many comb lines lie within the spectrum’s full width at half maximum?`,
          visual: specPic(0.5, 4, 8, t`A burst of 8 pulses: lines spaced 1/T under the single-pulse envelope (gold). A real laser runs for billions of pulses, and its lines are far sharper and far denser than drawn.`),
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: frep * 1e6 * tau * 1e-15, feedback: 'Divide the bandwidth by the line spacing, not multiply.' }],
          hints: [t`Envelope width $\Delta\nu = 0.441/\tau$; line spacing $f_{\text{rep}}$.`],
          teach: t`A comb holds about $\Delta\nu/f_{\text{rep}}$ lines: the pulse sets the envelope, the repetition rate the spacing.`,
          explain: t`$\Delta\nu = ${sf(TB / (tau * 1e-15) / 1e12, 3)}$ THz, divided by ${frep} MHz: about $${sf(n, 3)}$ lines.`,
        };
      },
    }),
    mcq({
      id: 'what-sets', difficulty: 2,
      prompt: t`For a mode-locked laser’s frequency comb, which pairing is right?`,
      visual: specPic(0.4, 3, 6, t`Six pulses’ spectrum: line spacing and envelope width are set by different things.`),
      choices: ['Line spacing = repetition rate (1/T); envelope width ≈ 0.44/τ, set by the pulse duration.', 'Line spacing set by the pulse duration; envelope by the repetition rate.', 'Both set by the wavelength.', 'Line spacing = c/λ; envelope width = repetition rate.'],
      answer: 0,
      why: { 1: 'Swapped: the period of a signal sets its line spacing; the shape of one period sets the envelope.', 2: 'The wavelength sets where the comb sits (its centre), not its structure.', 3: 'c/λ is the carrier frequency itself, about 200 THz.' },
      hints: ['A periodic signal has a line spectrum: what sets the spacing of its harmonics?'],
      teach: 'Periodic in time ↔ lines in frequency (spacing 1/T); short in time ↔ broad in frequency (width ∝ 1/τ).',
      explain: t`The train is one pulse convolved with a comb of period $T$; its spectrum is the single-pulse spectrum multiplied by a comb of spacing $1/T$. That product is the picture.`,
    }),
    num({
      id: 'coh-length', difficulty: 2,
      gen(r) {
        const [what, lam, dl] = r.pick([['a red LED', 630, 20], ['a near-infrared LED', 850, 40], ['a superluminescent diode', 1310, 50], ['a Fabry–Pérot laser diode', 1550, 2], ['a filtered sodium lamp', 589.3, 0.05]]);
        const lc = ((lam * 1e-9) ** 2 / (dl * 1e-9)) * 1e6;
        return {
          prompt: t`${what[0].toUpperCase() + what.slice(1)} emits around ${lam} nm with a spectral width of ${dl} nm. Estimate its coherence length $\lambda^2/\Delta\lambda$, in µm.`,
          visual: specPic(TB / Math.min(2.5, ((C * dl * 1e-9) / (lam * 1e-9) ** 2) / 1e12), 4, 1, t`The source’s spectrum, schematic: a broad spectrum means a short coherence length.`),
          answer: lc, units: 'um', tol: { rel: 0.005 },
          errors: [{ value: (lam * 1e-9) / (dl * 1e-9) * 1e6, feedback: t`$\lambda/\Delta\lambda$ counts wavelengths; the length is $\lambda^2/\Delta\lambda$.` }],
          hints: [t`$l_c \approx c/\Delta\nu = \lambda^2/\Delta\lambda$.`],
          teach: 'Coherence length λ²/Δλ: how far apart two copies of the light can be and still interfere.',
          explain: t`$l_c = (${lam}\ \text{nm})^2/${dl}\ \text{nm} = ${sf(lc, 3)}$ µm. Beyond a path difference of this order, interference fringes wash out (O10). Short coherence is useful: optical coherence tomography uses it to slice tissue by depth.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-altimeter', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.pick([1, 1.5, 5, 10]), lam = r.pick([532, 1064]);
        const dnu = TB / (tau * 1e-9), dl = ((lam * 1e-9) ** 2 * dnu) / C * 1e12;
        return {
          prompt: t`A spaceborne laser altimeter fires transform-limited ${tau} ns Gaussian pulses at ${lam} nm. Its receiver uses a narrow bandpass filter to reject sunlight reflected from the ground. In principle, what is the narrowest filter, in pm, that still passes the whole pulse spectrum (FWHM)?`,
          visual: trainPic(0.6, 4, t`Altimeter pulses against time (widths and spacing not to scale: the real pulses are nanoseconds long and milliseconds apart).`, 3),
          answer: dl, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: dl * 1000, feedback: '1 pm = 10⁻¹² m; check the unit conversion.' }, { value: ((lam * 1e-9) ** 2 * (1 / (tau * 1e-9))) / C * 1e12, feedback: 'Use the Gaussian constant 0.441, not 1.' }],
          hints: [t`$\Delta\nu = 0.441/\tau$.`, t`$\Delta\lambda = \lambda^2\Delta\nu/c$.`],
          teach: 'A nanosecond pulse’s own bandwidth is tiny in wavelength: filters are limited by laser drift and filter technology, not by Fourier.',
          explain: t`$\Delta\nu = ${sf(dnu / 1e6, 3)}$ MHz, so $\Delta\lambda = ${sf(dl, 2)}$ pm. Real altimeter filters are tens of pm wide, because the laser’s wavelength drifts with temperature and narrow filters are hard to make — so the Fourier limit is not what sets them.`,
        };
      },
    }),
    num({
      id: 'cp-lidar', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([1, 3, 10, 30]);   // km
        const dnu = C / (2 * R * 1000) / 1e3;   // kHz
        return {
          prompt: t`A coherent Doppler lidar mixes the echo from a target ${R} km away with light from its own laser. For a clean beat, the echo must still be coherent with the laser after the round trip: the round-trip path must not exceed the laser’s coherence length $c/\Delta\nu$. What is the widest laser linewidth $\Delta\nu$ that allows this, in kHz?`,
          visual: specPic(1, 4, 1, t`A laser line of width Δν (schematic): the narrower the line, the longer its light stays coherent.`),
          answer: dnu, units: 'kHz', tol: { rel: 0.005 },
          errors: [{ value: C / (R * 1000) / 1e3, feedback: 'The light goes out and back: the delay is a round trip, 2R.' }],
          hints: [t`The echo is delayed by a round trip: an extra path of $2R$.`, t`Require $c/\Delta\nu \ge 2R$, so $\Delta\nu \le c/2R$.`],
          teach: 'Coherent detection over a delay needs a coherence length at least as long as the extra path: Δν ≤ c/(path).',
          explain: t`$\Delta\nu \le c/2R = ${sf(dnu, 3)}$ kHz. Ordinary laser diodes have MHz linewidths; coherent lidars and laser-comm terminals use narrow-linewidth fibre or external-cavity lasers.`,
        };
      },
    }),
    mcq({
      id: 'cp-white', difficulty: 2,
      prompt: t`In a white-light interferometer, fringes appear only within about a micrometre of equal path lengths. Why?`,
      visual: specPic(0.15, 4, 1, t`A very broad spectrum (schematic): many frequencies, each making fringes of its own spacing.`),
      choices: ['Sunlight’s bandwidth is so wide (~300 nm) that its coherence length λ²/Δλ is about a micrometre: farther out, each colour’s fringes fall at different places and wash out.', 'White light is unpolarized, and unpolarized light cannot interfere.', 'The fringes are there at all path differences but are too fine to see.', 'Only one wavelength in white light is coherent.'],
      answer: 0,
      why: { 1: 'Unpolarized light interferes with itself perfectly well in an interferometer; each polarization makes the same fringes.', 2: 'Beyond the coherence length the pattern is truly uniform: the different colours’ fringes add up to a constant.', 3: 'Every colour is coherent with itself; the colours’ fringes just do not line up except near zero path difference.' },
      hints: [t`Estimate $\lambda^2/\Delta\lambda$ with $\lambda = 550$ nm and $\Delta\lambda = 300$ nm.`],
      teach: 'Broad bandwidth means short coherence: white-light fringes mark zero path difference precisely.',
      explain: t`$\lambda^2/\Delta\lambda \approx (0.55\ \mu\text{m})^2/0.3\ \mu\text{m} \approx 1\ \mu\text{m}$. That sharpness is useful: white-light fringes locate the exact zero of path difference in stellar interferometers and surface profilers.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §7.3–7.4 (Fourier analysis, pulses and wave packets, optical bandwidths)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'T. Udem, R. Holzwarth and T. W. Hänsch, Optical frequency metrology, Nature 416, 233 (2002)', url: 'https://doi.org/10.1038/416233a' },
  ],
});
