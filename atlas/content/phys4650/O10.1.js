// Temporal and spatial coherence (Hecht §12.1–12.3; enrichment). PHYS 4650
// O5.3 met the coherence time 1/Δν and length c/Δν ≈ λ²/Δλ. Here the full
// statement: fringe visibility (equal beams) is the modulus of the complex
// degree of coherence. Temporal: |γ(τ)| is the normalized Fourier transform of
// the spectrum (Wiener–Khinchin): a Gaussian line gives
// exp(−(πΔντ)²/(4 ln 2)), a Lorentzian exp(−πΔντ), a doublet |cos(πΔντ)| —
// Michelson's sodium-doublet visibility nulls every λ²/(2Δλ) of path;
// Fourier-transform spectroscopy resolves δσ ≈ 1/Δ_max. Spatial (van
// Cittert–Zernike): |γ₁₂(d)| is the Fourier transform of the source's
// brightness; a uniform disc of angular diameter θ gives |2J₁(u)/u|,
// u = πθd/λ, first null at d = 1.22λ/θ (sunlight: tens of micrometres); a slit
// source sinc, null at λR/s; a thin ring J₀(πθu), null at u = 0.766/θ.
// Transfers: the EHT's visibility null and M87*'s ring (EHT Paper I, 2019),
// Michelson and Pease's Betelgeuse (ApJ 53, 249, 1921).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { AU, R_SUN, sf } from './_op.js';

const t = String.raw;
const LN2 = Math.LN2;
const MAS = Math.PI / 648e6;
const UAS = MAS / 1000;

// the worked example: the sodium doublet in a Michelson
const EX = { l1: 588.995, l2: 589.592 };
EX.lam = (EX.l1 + EX.l2) / 2;
EX.dl = EX.l2 - EX.l1;
EX.D1 = EX.lam ** 2 / (2 * EX.dl) * 1e-6;     // mm of path difference
EX.move = EX.D1 / 2;
EX.Lc = EX.lam ** 2 / EX.dl * 1e-6;           // mm

/** Visibility against path difference (mm, log axis) for a spectrum: 'gauss', 'lorentz' or 'doublet', width/spacing dl (nm) at lam (nm). */
const visFn = (shape, dl, lam) => {
  const q = `pi*${sf(dl, 5)}*(10^x)*1000000/${sf(lam * lam, 7)}`;
  return shape === 'gauss' ? `exp(-(${q})^2/(4*ln(2)))` : shape === 'lorentz' ? `exp(-(${q}))` : `abs(cos(${q}))`;
};
const visPic = (shape, dl, lam, caption, x = [-3, 1], extra = {}) => ({
  type: 'graph', caption,
  params: { x, y: [0, 1.1], xlog: true, aspect: 'wide', xlabel: 'path difference (mm)', ylabel: 'visibility', yticks: 2,
    curves: [{ fn: visFn(shape, dl, lam), color: 'gold', width: 2.4, samples: 2000 }], ...extra },
});

/** Two apertures a distance d apart looking at a source of angular size θ (schematic). */
const baselinePic = (caption, ring = false) => ({
  type: 'graph', caption,
  params: { x: [-5, 5], y: [-2.2, 2.6], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      { param: ['-0.6 + 0.6*cos(t)', '2 + 0.42*sin(t)'], t: [0, 6.2832], color: ring ? 'gold' : 'ink3', width: ring ? 3 : 1 },
      ...(ring ? [] : [{ param: ['-0.6 + 0.3*cos(t)', '2 + 0.3*sin(t)'], t: [0, 6.2832], color: 'gold', width: 8 }]),
      { param: ['-3 + 0.5*cos(t)', '-1.4 + 0.25*sin(t)'], t: [3.1416, 6.2832], color: 'accent', width: 2.4 },
      { param: ['2 + 0.5*cos(t)', '-1.4 + 0.25*sin(t)'], t: [3.1416, 6.2832], color: 'accent', width: 2.4 },
      { param: ['-0.6 + t*(-2.4)', '2 + t*(-3.15)'], t: [0, 1], color: 'ink3', width: 1, dash: [4, 4] },
      { param: ['-0.6 + t*2.6', '2 + t*(-3.15)'], t: [0, 1], color: 'ink3', width: 1, dash: [4, 4] },
      { param: ['-3 + t*5', '-1.95'], t: [0, 1], color: 'ink2', width: 1.4 },
    ],
    points: [{ x: -0.6, y: 2.55, r: 0, label: ring ? 'ring-shaped source' : 'distant source, angular size θ', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: -0.5, y: -2.15, r: 0, label: 'baseline d', color: 'ink2', labelAlign: 'center', labelDx: 0, labelDy: 0 }],
  },
});

export default lesson({
  id: 'phys4650.O10.1',
  title: 'Temporal and spatial coherence',
  minutes: 16, difficulty: 3,
  equation: t`|\gamma(\tau)| = \left|\frac{\int S(\nu)\,e^{-2\pi i\nu\tau}\,d\nu}{\int S(\nu)\,d\nu}\right|`,
  intro: t`How well two parts of a light beam interfere is measured by the fringes’ **visibility** $V = (I_{\max} - I_{\min})/(I_{\max} + I_{\min})$, and for two equal beams it equals the **degree of coherence** $|\gamma|$. **Temporal** coherence compares the light with itself a time $\tau$ later (a path difference $c\tau$): $|\gamma(\tau)|$ is the Fourier transform of the spectrum $S(\nu)$, above, so a spectrum $\Delta\nu$ wide stays coherent for about $1/\Delta\nu$. **Spatial** coherence compares two points side by side, a distance $d$ apart: by the **van Cittert–Zernike theorem**, $|\gamma_{12}|$ is the Fourier transform of the source’s brightness on the sky. A uniform disc of angular diameter $\theta$ gives $|2J_1(u)/u|$ with $u = \pi\theta d/\lambda$, which first vanishes at $d = 1.22\lambda/\theta$.`,
  symbols: [
    { tex: '\\gamma(\\tau)', text: 'the complex degree of (temporal) coherence: 1 for perfectly coherent light, 0 for none' },
    { tex: '\\tau', text: 'the delay between the two copies of the light, path difference $\\Delta = c\\tau$' },
    { tex: 'S(\\nu)', text: 'the spectrum: power per unit frequency' },
    { tex: '\\nu', text: 'frequency' },
  ],
  why: t`Stellar interferometers and the Event Horizon Telescope measure exactly $|\gamma_{12}|$ between telescopes to read sizes no single telescope can see; Fourier-transform spectrometers read spectra from $|\gamma(\tau)|$.`,
  visual: {
    type: 'graph',
    title: 'Visibility against path difference',
    lead: t`A Michelson’s fringe visibility as one arm lengthens, for three kinds of spectrum. The horizontal axis is logarithmic, from a micrometre to ten millimetres of path difference.`,
    tasks: [
      t`A Gaussian line $30$ nm wide (an LED): the fringes die within a few tens of micrometres.`,
      t`Narrow the line to $0.01$ nm: they survive tens of millimetres. The coherence length goes as $\lambda^2/\Delta\lambda$.`,
      t`Switch to a doublet $0.6$ nm apart (sodium): the visibility falls to zero and comes back, over and over — beats between two colours.`,
    ],
    params: {
      x: [-3, 1], y: [0, 1.1], xlog: true, aspect: 'wide', xlabel: 'path difference (mm)', ylabel: 'visibility', yticks: 2,
      sliders: [
        { key: 'dl', label: 'Line width (or doublet spacing) $\\Delta\\lambda$', min: 0.01, max: 50, value: 0.6, logScale: true, unit: '\\mathrm{nm}', explain: 'The spectrum’s full width at half maximum, or the gap between the two lines of a doublet.' },
        { key: 'lam', label: 'Centre wavelength $\\lambda$', min: 400, max: 1000, step: 1, value: 589, unit: '\\mathrm{nm}', explain: 'The middle of the spectrum.' },
      ],
      choices: [{ key: 'sh', label: 'Spectrum', options: [[0, 'Gaussian line'], [1, 'Lorentzian line'], [2, 'Doublet']], value: 2, explain: 'Gaussian: Doppler-broadened gas, LEDs roughly. Lorentzian: a line broadened by collisions or lifetime. Doublet: two narrow lines of equal strength.' }],
      curves: [
        { fn: 'exp(-(pi*dl*(10^x)*1000000/lam^2)^2/(4*ln(2)))', color: 'gold', width: 2.4, when: 'step(0.5 - sh)', samples: 2000 },
        { fn: 'exp(-pi*dl*(10^x)*1000000/lam^2)', color: 'gold', width: 2.4, when: 'step(0.5 - abs(sh - 1))', samples: 2000 },
        { fn: 'abs(cos(pi*dl*(10^x)*1000000/lam^2))', color: 'gold', width: 2.4, when: 'step(sh - 1.5)', samples: 4000 },
      ],
      vlines: [{ x: 'log10(lam^2/dl/1000000)', color: 'ink3' }],
      readouts: [{ label: 'coherence length $\\lambda^2/\\Delta\\lambda$', expr: 'lam^2/dl/1000000', unit: '\\mathrm{mm}', digits: 3 }],
    },
    caption: t`Two equal beams, an ideal Michelson. The fringes themselves are far too fine to draw at this scale: only their visibility is shown. The grey line marks $\lambda^2/\Delta\lambda$.`,
  },
  example: {
    prompt: t`A Michelson is lit by a sodium lamp, whose yellow light is two lines of nearly equal strength at $${EX.l1}$ and $${EX.l2}$ nm. Starting from equal arms, how far must one mirror move before the fringes first vanish?`,
    visual: visPic('doublet', EX.dl, EX.lam, t`Visibility against path difference for two equal, very narrow lines $${sf(EX.dl, 3)}$ nm apart.`),
    steps: [
      { label: 'Two fringe systems', text: t`Each line makes its own fringes, bright where the path difference $\Delta$ is a whole number of its wavelengths. At $\Delta = 0$ they coincide; as $\Delta$ grows they drift apart.` },
      { label: 'First null', text: t`The two patterns are exactly out of step when $\Delta/\lambda_1 - \Delta/\lambda_2 = \tfrac12$, i.e. $\Delta = \dfrac{\lambda^2}{2\Delta\lambda} = \dfrac{(${sf(EX.lam, 5)}\ \text{nm})^2}{2(${sf(EX.dl, 3)}\ \text{nm})} = ${sf(EX.D1, 3)}$ mm.` },
      { label: 'Mirror travel', text: t`The path difference is twice the mirror’s motion: the mirror moves $${sf(EX.move, 3)}$ mm.` },
      { label: 'The spectrum’s transform', text: t`In the language of $\gamma$: the spectrum is two spikes $\Delta\nu = c\Delta\lambda/\lambda^2$ apart, whose Fourier transform is $|\cos(\pi\Delta\nu\tau)|$ — visibility returns every $${sf(2 * EX.D1, 3)}$ mm of path, until each line’s own width finally erases it.` },
    ],
    answer: t`About $${sf(EX.move, 3)}$ mm of mirror travel ($${sf(EX.D1, 3)}$ mm of path difference); the fringes return after twice that.`,
  },
  practice: [
    num({
      id: 'doublet-null', difficulty: 2,
      gen(r) {
        const [l1, l2, nm] = r.pick([[576.96, 579.07, 'mercury’s yellow lines'], [656.272, 656.285, 'two fine-structure components of hydrogen’s H-alpha line'], [766.49, 769.90, 'potassium’s red doublet']]);
        const lam = (l1 + l2) / 2, D = lam ** 2 / (2 * (l2 - l1)) * 1e-6;
        return {
          prompt: t`A Michelson is lit by ${nm}, $${l1}$ and $${l2}$ nm, of equal strength. At what path difference do the fringes first vanish, in millimetres?`,
          visual: visPic('doublet', l2 - l1, lam, t`Visibility for two equal narrow lines: it vanishes and returns periodically. (The null is the question.)`, [-3, 2], { yticks: 2 }),
          answer: D, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: 2 * D, feedback: t`At $\Delta = \lambda^2/\Delta\lambda$ the two patterns are back in step; they are half a fringe apart at half that.` }],
          hints: [t`Null when the two fringe systems are half a fringe apart: $\Delta(1/\lambda_1 - 1/\lambda_2) = \tfrac12$.`, t`$\Delta = \lambda^2/(2\Delta\lambda)$.`],
          teach: t`Two lines $\Delta\lambda$ apart make fringes that vanish at path differences $\lambda^2/(2\Delta\lambda)$, $3\lambda^2/(2\Delta\lambda)$, …`,
          explain: t`$\Delta = (${sf(lam, 6)})^2/(2\times ${sf(l2 - l1, 3)})$ nm $= ${sf(D, 3)}$ mm. Michelson measured line splittings this way before gratings could.`,
        };
      },
    }),
    num({
      id: 'led-vis', difficulty: 3,
      gen(r) {
        const lam = r.pick([520, 630, 850]), dl = r.pick([20, 30, 40]), D = r.pick([5, 10, 15]);
        const q = (Math.PI * dl * D * 1000) / (lam * lam), V = Math.exp(-(q * q) / (4 * LN2));
        return {
          prompt: t`An LED has a Gaussian spectrum centred on $${lam}$ nm with a full width at half maximum of $${dl}$ nm. What is the fringe visibility in a Michelson (equal beams) at a path difference of $${D}\ \mu$m?`,
          visual: visPic('gauss', dl, lam, t`Visibility against path difference for this LED’s Gaussian spectrum.`),
          answer: V, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: Math.exp(-q), feedback: t`That is the Lorentzian result. A Gaussian spectrum transforms to a Gaussian: $|\gamma| = \exp\bigl(-(\pi\Delta\nu\tau)^2/(4\ln 2)\bigr)$.` }].filter((e) => Math.abs(e.value - V) > 0.02 + 0.01 * V),
          hints: [t`With $\Delta\nu = c\Delta\lambda/\lambda^2$ and $\tau = \Delta/c$: $\pi\Delta\nu\tau = \pi\Delta\lambda\,\Delta/\lambda^2$.`, t`$|\gamma| = \exp\bigl(-(\pi\Delta\lambda\,\Delta/\lambda^2)^2/(4\ln 2)\bigr)$.`],
          teach: t`The visibility against delay is the Fourier transform of the spectrum: a Gaussian line gives a Gaussian fall-off.`,
          explain: t`$\pi\Delta\lambda\,\Delta/\lambda^2 = \pi(${dl})(${D * 1000})/${lam}^2 = ${sf(q, 3)}$, so $|\gamma| = e^{-${sf(q, 3)}^2/(4\ln 2)} = ${sf(V, 3)}$. Optical coherence tomography uses exactly this short coherence to slice tissue into micrometre layers.`,
        };
      },
    }),
    num({
      id: 'ftir', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 1, 2, 5]), lam = r.pick([3, 10, 15]);
        const ds = 1 / L, dlam = (lam * 1e-4) ** 2 * ds * 1e7;     // cm⁻¹; Δλ in nm
        return {
          prompt: t`A Fourier-transform infrared spectrometer scans its moving mirror so that the path difference runs up to $${L}$ cm. Its resolution in wavenumber is about $1/\Delta_{\max}$. What spectral width does that correspond to at $${lam}\ \mu$m, in nanometres?`,
          visual: visPic('gauss', 0.05, lam * 1000 > 1000 ? 1000 : lam * 1000, t`What a spectrometer records: the light’s coherence against path difference (here for a single line). Its Fourier transform is the spectrum; a longer scan resolves finer detail.`, [-2, 2]),
          answer: dlam, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: dlam / 2, feedback: t`Resolution $\delta\sigma \approx 1/\Delta_{\max}$, then $\delta\lambda = \lambda^2\delta\sigma$.` }],
          hints: [t`$\delta\sigma = 1/\Delta_{\max} = ${sf(ds, 3)}\ \text{cm}^{-1}$.`, t`$\sigma = 1/\lambda$, so $\delta\lambda = \lambda^2\,\delta\sigma$.`],
          teach: t`A Fourier-transform spectrometer resolves $\delta\sigma \approx 1/\Delta_{\max}$: to see fine spectral detail, scan a long path.`,
          explain: t`$\delta\lambda = \lambda^2\delta\sigma = (${lam}\times10^{-4}\ \text{cm})^2(${sf(ds, 3)}\ \text{cm}^{-1}) = ${sf(dlam, 3)}$ nm. The same scan resolves every wavelength at once, which is why FTIR dominates infrared spectroscopy.`,
        };
      },
    }),
    num({
      id: 'sun-width', difficulty: 2,
      gen(r) {
        const lam = r.pick([450, 550, 650]);
        const th = (2 * R_SUN) / AU, d = (1.22 * lam * 1e-9) / th * 1e6;
        return {
          prompt: t`The Sun is a nearly uniform disc $${sf((th * 180) / Math.PI, 3)}^\circ$ across (from Earth). For direct sunlight at $${lam}$ nm, how far apart can two pinholes be before Young’s fringes between them first vanish, in micrometres?`,
          visual: baselinePic(t`Two pinholes a distance d apart lit by an extended source (schematic).`),
          answer: d, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: d / 1.22, feedback: 'For a uniform disc the first null of |γ| is at 1.22λ/θ, like the Airy pattern.' }],
          hints: [t`van Cittert–Zernike: $|\gamma_{12}| = |2J_1(u)/u|$ with $u = \pi\theta d/\lambda$.`, t`First null at $d = 1.22\lambda/\theta$, with $\theta$ in radians: $${sf(th * 1000, 3)}$ mrad.`],
          teach: t`Light from a source of angular size $\theta$ is coherent over a width of about $\lambda/\theta$: for the Sun, a few tens of micrometres.`,
          explain: t`$d = 1.22(${lam}\times10^{-9})/(${sf(th, 3)})\ \text{m} = ${sf(d, 3)}\ \mu$m. Young (1803) had to pass sunlight through a pinhole first, to shrink the source and widen this coherence width.`,
        };
      },
    }),
    num({
      id: 'slit-source', difficulty: 3,
      gen(r) {
        const s = r.pick([0.1, 0.2, 0.5]), R = r.pick([0.5, 1, 2]), lam = 546;
        const d = (lam * 1e-6 * R * 1e3) / s;      // mm
        return {
          prompt: t`A mercury lamp’s $546$ nm light passes a source slit $${s}$ mm wide, then travels $${R}$ m to a pair of narrow slits. At what separation of the pair do Young’s fringes first vanish, in millimetres?`,
          visual: baselinePic(t`Two slits lit by an extended source (schematic; here the source is a slit).`),
          answer: d, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: d * 1.22, feedback: 'A uniform slit gives a sinc, whose first zero has no 1.22: that factor belongs to round sources.' }],
          hints: [t`A uniform slit source of angular width $s/R$ gives $|\gamma| = |\text{sinc}(\pi s d/(\lambda R))|$.`, t`First null at $d = \lambda R/s$.`],
          teach: t`A slit source $s$ wide at distance $R$ is spatially coherent over about $\lambda R/s$.`,
          explain: t`$d = \lambda R/s = (546\times10^{-6}\ \text{mm})(${R * 1000}\ \text{mm})/(${s}\ \text{mm}) = ${sf(d, 3)}$ mm. Narrowing the source slit widens the region of coherence — at the cost of light.`,
        };
      },
    }),
    mcq({
      id: 'revival', difficulty: 2,
      prompt: t`In a Michelson, the fringes fade to nothing at a path difference of $0.29$ mm, return at $0.58$ mm, and fade again at $0.87$ mm. What does that say about the light?`,
      visual: visPic('doublet', 0.6, 589, t`Visibility against path difference (logarithmic axis).`, [-2, 0.5]),
      choices: ['It contains two narrow lines of similar strength, about λ²/(0.58 mm) apart in wavelength.', 'Its coherence length is 0.29 mm, and the returning fringes are an artefact.', 'The mirrors tilt as they move, spoiling the overlap periodically.', 'It is a single line with a Lorentzian shape.'],
      answer: 0,
      why: { 1: 'Light past its coherence length does not regain visibility: a revival means beats between distinct frequencies.', 2: 'Tilt would wash fringes out progressively, not in a regular revival tied to the path difference.', 3: 'A single smooth line gives a visibility that only falls; the Fourier transform of one bump has no revivals.' },
      hints: ['The visibility is the Fourier transform of the spectrum.', 'What spectrum has a periodic transform?'],
      teach: 'Visibility that falls and revives periodically is the signature of two spectral lines beating.',
      explain: t`Two lines $\Delta\nu$ apart give $|\cos(\pi\Delta\nu\tau)|$, reviving every $\lambda^2/\Delta\lambda$ of path: here $0.58$ mm, so $\Delta\lambda = (589\ \text{nm})^2/(0.58\ \text{mm}) \approx 0.6$ nm — the sodium doublet.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-eht', difficulty: 3, transfer: true,
      gen(r) {
        const u = r.pick([2.6, 3.4, 4.2]);
        const th = 2.4048 / (Math.PI * u * 1e9) / UAS;
        return {
          prompt: t`A very-long-baseline array at $1.3$ mm measures the coherence $|\gamma_{12}|$ between pairs of dishes. For a thin ring of angular diameter $\theta$ on the sky, $|\gamma_{12}| = |J_0(\pi\theta u)|$, where $u = d/\lambda$ is the baseline in wavelengths, and $J_0$ first vanishes at $2.405$. If the first null falls at $u = ${u}\times10^9$ wavelengths, what is the ring’s diameter, in microarcseconds?`,
          visual: baselinePic(t`Two dishes a baseline d apart look at a ring-shaped source (schematic).`, true),
          answer: th, units: 'uas', tol: { rel: 0.01 },
          errors: [{ value: (1.22 / (u * 1e9)) / UAS, feedback: t`$1.22\lambda/d$ is for a filled disc. A thin ring’s transform is $J_0$: first null at $\pi\theta u = 2.405$.` }],
          hints: [t`Solve $\pi\theta u = 2.405$ for $\theta$ in radians.`, t`$1\ \mu\text{as} = 4.848\times10^{-12}$ rad.`],
          teach: t`An interferometer reads a source’s size from where its visibility vanishes: the van Cittert–Zernike theorem turned into a measurement.`,
          explain: t`$\theta = 2.405/(\pi\times${u}\times10^9) = ${tex(2.4048 / (Math.PI * u * 1e9))}$ rad $= ${sf(th, 3)}\ \mu$as. For M87* the Event Horizon Telescope found its first null near $3.4\times10^9$ wavelengths, matching a ring about $46\ \mu$as across — the light bent round the black hole’s shadow.`,
        };
      },
    }),
    num({
      id: 'cp-betelgeuse', difficulty: 3, transfer: true,
      prompt: t`In 1920 Michelson and Pease fitted a 20-foot beam across the 100-inch Hooker telescope, with two mirrors whose separation they could adjust. For Betelgeuse the fringes vanished at a separation of $121$ inches ($3.07$ m), at an effective wavelength of $575$ nm. Treating the star as a uniform disc, what is its angular diameter, in milliarcseconds?`,
      visual: baselinePic(t`Michelson’s stellar interferometer: two mirrors a distance d apart send starlight into one telescope (schematic).`),
      answer: (1.22 * 575e-9) / 3.07 / MAS, units: 'mas', tol: { rel: 0.01 },
      errors: [{ value: 575e-9 / 3.07 / MAS, feedback: 'For a uniform disc the first null is at d = 1.22λ/θ.' }],
      hints: [t`First null of a uniform disc: $d = 1.22\lambda/\theta$.`, t`$\theta = 1.22(575\times10^{-9})/3.07$ rad; one milliarcsecond is $4.848\times10^{-9}$ rad.`],
      teach: 'A stellar interferometer measures a star’s size from the baseline at which its fringes vanish.',
      explain: t`$\theta = 1.22\lambda/d = ${tex((1.22 * 575e-9) / 3.07)}$ rad $= ${sf((1.22 * 575e-9) / 3.07 / MAS, 3)}$ mas — Michelson and Pease’s $0.047''$, the first measured diameter of a star other than the Sun. Limb darkening, which they ignored, makes the true disc slightly larger.`,
    }),
    mcq({
      id: 'cp-white', difficulty: 2,
      prompt: t`To find the exact point of equal arms in a Michelson, experimenters switch from a laser to white light. Why?`,
      visual: visPic('gauss', 300, 550, t`Visibility for white light (treated as one very broad band): it survives only within about a micrometre of equal paths.`, [-4, 0]),
      choices: ['White light’s coherence length is about a micrometre, so it shows fringes only within a micrometre of equal paths.', 'White light is brighter, so the fringes are easier to see.', 'A laser’s fringes are coloured and confusing.', 'White light has a longer coherence length than a laser.'],
      answer: 0,
      why: { 1: 'Brightness has nothing to do with where the fringes are.', 2: 'A laser’s fringes are one colour, and they look the same over metres of path: that is the problem.', 3: 'It is the other way round: broad spectra are coherent only briefly.' },
      hints: ['Coherence length λ²/Δλ for Δλ of a few hundred nanometres.', 'Where a laser shows identical fringes over metres, white light shows them only near zero.'],
      teach: 'Broad-band light marks zero path difference: its few coloured fringes appear only where the paths match within a micrometre.',
      explain: t`With $\Delta\lambda \approx 300$ nm around $550$ nm, $\lambda^2/\Delta\lambda \approx 1\ \mu$m. Stellar interferometers and optical coherence tomography both rely on this to find, and hold, equal paths.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §12.1–12.3 (visibility, the degree of coherence, temporal and spatial coherence, van Cittert–Zernike)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'A. A. Michelson and F. G. Pease, “Measurement of the diameter of α Orionis with the interferometer”, ApJ 53, 249 (1921)', url: 'https://ui.adsabs.harvard.edu/abs/1921ApJ....53..249M' },
    { label: 'Event Horizon Telescope Collaboration, “First M87 Event Horizon Telescope Results. I”, ApJL 875, L1 (2019): first visibility null near 3.4 Gλ, a 46 μas ring', url: 'https://doi.org/10.3847/2041-8213/ab0ec7' },
  ],
});
