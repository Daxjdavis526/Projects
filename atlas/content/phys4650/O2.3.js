// Photons and the quantum view of light (Hecht §3.3.3–3.3.4, §3.4). PHYS 2710
// MP1.2 and MP4 and PHYS 2220 Q1 have Planck's quantum, the photoelectric
// effect and Compton scattering; this lesson takes the optics angle: a beam is
// a stream of photons, Φ = P/hν; its graininess is shot noise, √N, the floor
// under every photon-counting instrument; radiation pressure is photon flux
// times h/λ; and single-photon interference shows the two pictures are one.
// Worked example: the photon budget of a star tracker (Bessell's V-band zero
// point). Transfer: photons per second in a deep-space laser downlink, and
// how much fainter a star a tracker can afford.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, H, QE, PI, sf, bare } from './_op.js';

const t = String.raw;
const HC_EVNM = (H * C / QE) * 1e9;               // 1239.84 eV nm

// V-band zero point (Bessell 1998): f_λ = 3.63e-11 W m⁻² nm⁻¹ at 550 nm; band width ~88 nm, treated as flat
const V0 = { flam: 3.63e-11, lam: 550e-9, width: 88 };
V0.phot = (V0.flam / ((H * C) / V0.lam)) * V0.width;           // photons s⁻¹ m⁻² for V = 0

// the worked example: a V = 5.0 star, a 25 mm aperture, 0.20 s exposure, 40% overall efficiency
const EX = { V: 5.0, D: 0.025, tau: 0.2, eff: 0.4 };
EX.flux = V0.phot * 10 ** (-0.4 * EX.V);
EX.A = PI * (EX.D / 2) ** 2;
EX.rate = EX.flux * EX.A;
EX.N = EX.rate * EX.tau * EX.eff;
EX.snr = Math.sqrt(EX.N);

// a two-slit pattern built from single detections: deterministic samples of cos²·sinc² (for a picture)
function detections(n, seed = 7) {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const pts = [];
  while (pts.length < n) {
    const x = -1 + 2 * rnd(), y = rnd();
    const env = Math.abs(x) < 1e-9 ? 1 : (Math.sin(3 * x) / (3 * x)) ** 2;
    if (y < Math.cos(9 * x) ** 2 * env) pts.push({ x: sf(x, 4), y: sf(0.1 + 0.8 * rnd(), 3), r: 2.2, color: 'gold' });
  }
  return pts;
}

export default lesson({
  id: 'phys4650.O2.3',
  title: 'Photons and the quantum view',
  minutes: 12, difficulty: 2,
  intro: t`Planck and Einstein ([PHYS 2710 MP1.2](#/lesson/phys2710.MP1.2), [MP4.1](#/lesson/phys2710.MP4.1)) showed that light delivers energy and momentum in lumps, **photons**:

$$E = h\nu = \frac{hc}{\lambda_0},\qquad p = \frac{h}{\lambda_0}$$

For an optician the useful consequence is counting. A beam of power $P$ is a stream of $\Phi = P/h\nu$ photons per second, and because they arrive at random, a detector that catches $N$ of them on average sees that number fluctuate by $\sqrt N$ — **shot noise**, the floor under every star tracker, camera and gravitational-wave photodiode. The wave picture still decides *where* photons are likely to land: the irradiance is the probability.`,
  symbols: [
    { tex: 'E', text: t`one photon’s energy, in J (or eV: $1\ \text{eV} = 1.602\times10^{-19}$ J)` },
    { tex: 'h', text: t`Planck’s constant, $6.626\,070\,15\times10^{-34}$ J s exactly` },
    { tex: '\\nu', text: 'the frequency of the light, in Hz' },
    { tex: '\\lambda_0', text: t`the vacuum wavelength, in m; $hc \approx 1240$ eV nm` },
    { tex: 'p', text: 'one photon’s momentum, in kg m/s' },
  ],
  why: t`Every measurement of light ends with photons counted; their graininess sets how faint a star a spacecraft can navigate by and how small a mirror motion LIGO can see.`,
  visual: {
    type: 'em-spectrum',
    title: 'Photon energies across the spectrum',
    lead: t`The electromagnetic spectrum on one logarithmic strip. Slide the marker and read the photon energy $h\nu$: the same physics from radio to gamma rays, with energies spanning twenty powers of ten.`,
    tasks: [
      t`Visible photons carry 1.6–3.3 eV — about the energy to break a chemical bond or free an electron from a metal.`,
      t`Find the 1550 nm telecom band: about 0.8 eV per photon, which is why fibre receivers use InGaAs (band gap 0.75 eV) rather than silicon (1.12 eV).`,
      t`At 2.45 GHz (a microwave oven) a photon carries about 10 μeV: a kilowatt of microwaves is about $6\times10^{26}$ photons a second, so their graininess never shows.`,
    ],
    params: { f: 5.45e14 },
    caption: t`Bands and sources are placed at their real frequencies on a logarithmic scale; band boundaries are conventions, not physics.`,
  },
  example: {
    prompt: t`A star tracker with a ${EX.D * 1000} mm aperture takes a ${EX.tau} s exposure of a star of visual magnitude $V = ${EX.V}$. Its optics and detector together register ${EX.eff * 100}% of the photons that enter. How many photoelectrons does it record, and what signal-to-noise ratio does shot noise allow? (A $V = 0$ star delivers about $${tex(V0.flam, 3)}$ W m⁻² nm⁻¹ at 550 nm, across a band about ${V0.width} nm wide.)`,
    visual: { type: 'graph', params: { x: [0, 8], y: [0, 4.2], aspect: 'wide', xlabel: 'star magnitude V', ylabel: 'photoelectrons', xticks: 8, yticks: 4, ylog: true,
      curves: [{ fn: `log10(${sf(V0.phot * EX.A * EX.tau * EX.eff, 5)}) - 0.4*x`, color: 'accent', width: 2.2 }],
      points: [{ x: EX.V, y: sf(Math.log10(EX.N), 4), color: 'gold', label: `V = ${EX.V}` }] },
      caption: t`Photoelectrons per exposure against magnitude for this tracker (five magnitudes = a factor of 100). The flat-band model of the V filter is an approximation.` },
    steps: [
      { label: 'Photons per nm', text: t`A 550 nm photon carries $hc/\lambda = ${tex((H * C) / V0.lam, 4)}$ J, so the zero-point flux is $${tex(V0.flam / ((H * C) / V0.lam), 3)}$ photons s⁻¹ m⁻² nm⁻¹.` },
      { label: 'Across the band', text: t`Times ${V0.width} nm: $${tex(V0.phot, 3)}$ photons s⁻¹ m⁻² for $V = 0$. Each magnitude is a factor $10^{0.4} \approx 2.512$, so $V = ${EX.V}$ gives $${tex(EX.flux, 3)}$ s⁻¹ m⁻².` },
      { label: 'Into the aperture', text: t`Area $\pi(${EX.D / 2}\ \text{m})^2 = ${tex(EX.A, 3)}$ m², so $${tex(EX.rate, 3)}$ photons per second enter.` },
      { label: 'Recorded', text: t`$N = ${tex(EX.rate, 3)}\times${EX.tau}\times${EX.eff} \approx ${Math.round(EX.N / 10) * 10}$ photoelectrons.` },
      { label: 'Shot noise', text: t`Random arrivals fluctuate by $\sqrt N \approx ${Math.round(EX.snr)}$, so the best possible signal-to-noise ratio is $N/\sqrt N = \sqrt N \approx ${Math.round(EX.snr)}$. Detector noise and stray light only make it worse.` },
      { label: 'Sense check', text: t`Bright enough to centroid to a small fraction of a pixel. Five magnitudes fainter there would be 100 times fewer photons and a signal-to-noise ratio of about ${Math.round(EX.snr / 10)}: trackers run out of usable stars near $V \approx 6$–7.` },
    ],
    answer: t`About $${Math.round(EX.N / 10) * 10}$ photoelectrons, so a shot-noise-limited signal-to-noise ratio of about $${Math.round(EX.snr)}$.`,
  },
  practice: [
    num({
      id: 'photon-eV', difficulty: 1,
      gen(r) {
        const [nm, what] = r.pick([[1550, 'telecom fibre light'], [1064, 'an Nd:YAG laser'], [405, 'a Blu-ray laser'], [121.6, 'hydrogen’s Lyman-α line'], [10600, 'a CO₂ laser']]);
        const E = HC_EVNM / nm;
        return {
          prompt: t`What is the energy of one photon of ${what}, $\lambda_0 = ${nm}$ nm, in eV?`,
          visual: { type: 'graph', params: { x: [2, 4.2], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'λ₀ (nm)', ylabel: 'E (eV)', xlog: true, ylog: true, xticks: 3, yticks: 3, curves: [{ fn: `log10(${sf(HC_EVNM, 6)}) - x`, color: 'accent', width: 2.2 }], vlines: [{ x: sf(Math.log10(nm), 4), color: 'gold' }] }, caption: t`Photon energy against vacuum wavelength, both on logarithmic scales: $E = hc/\lambda_0$ is a straight line of slope −1.` },
          answer: E, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: nm / HC_EVNM, feedback: t`Upside down: $E = hc/\lambda_0$, and $hc \approx 1240$ eV nm.` }],
          hints: [t`$E = hc/\lambda_0$, with $hc = 1239.84$ eV nm.`],
          teach: t`$E\,[\text{eV}] \approx 1240/\lambda_0\,[\text{nm}]$.`,
          explain: t`$E = 1239.84/${nm} = ${sf(E, 3)}$ eV.`,
        };
      },
    }),
    num({
      id: 'photon-flux', difficulty: 2,
      gen(r) {
        const [nm, P, what] = r.pick([[532, 5, 'a 5 mW green pointer'], [633, 1, 'a 1 mW helium–neon laser'], [1064, 2000, 'a 2 W Nd:YAG laser'], [1550, 0.1, 'a 0.1 mW fibre signal']]);
        const Phi = (P * 1e-3) / ((H * C) / (nm * 1e-9));
        return {
          prompt: t`How many photons per second does ${what} ($\lambda_0 = ${nm}$ nm) deliver?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1, 1], { points: detections(60, nm).map((p) => ({ ...p, x: sf(p.x * 2.6, 4), y: sf(p.y * 1.6 - 0.8, 3) })), shade: [{ fn: '0.12', lower: '-0.12', from: -3, to: 3, color: 'warn', alpha: 0.12 }] }), caption: t`A beam pictured as photons (dots). Schematic: a real beam carries far too many to draw.` },
          answer: Phi, units: 's^-1', tol: { rel: 0.005 },
          errors: [{ value: ((P * 1e-3) * (nm * 1e-9)) / H, feedback: t`The photon energy is $hc/\lambda_0$: you left out $c$.` }, { value: P / ((H * C) / (nm * 1e-9)), feedback: 'Convert mW to W first.' }],
          hints: [t`One photon carries $hc/\lambda_0$.`, t`$\Phi = P\lambda_0/hc$.`],
          teach: t`A beam of power $P$ carries $\Phi = P/h\nu = P\lambda_0/hc$ photons per second.`,
          explain: t`$hc/\lambda_0 = ${tex((H * C) / (nm * 1e-9), 3)}$ J, so $\Phi = ${tex(Phi, 3)}$ photons/s.`,
        };
      },
    }),
    num({
      id: 'photon-rocket', difficulty: 2,
      gen(r) {
        const F = r.pick([1, 0.1, 0.01, 10]);
        const P = F * C;
        return {
          prompt: t`A “photon rocket” pushes itself by emitting a collimated beam of light. How much beam power does it need for ${F} N of thrust, in MW?`,
          visual: { type: 'graph', params: bare([-3, 3], [-1.2, 1.2], { shade: [{ fn: '0.45', lower: '-0.45', from: -0.6, to: 0.9, color: 'ink3', alpha: 0.6 }], arrows: [{ from: [-0.7, 0], to: [-2.9, 0], color: 'warn', width: 4, label: 'light' }, { from: [1, 0], to: [2.2, 0], color: 'accent', width: 3, label: 'thrust' }] }), caption: t`The spacecraft emits light backward and recoils forward. Schematic.` },
          answer: P / 1e6, units: 'MW', tol: { rel: 0.005 },
          errors: [{ value: (F * C) / 2e6, feedback: 'Emitting light gives a recoil of P/c, not 2P/c: nothing is reflected.' }, { value: F / C / 1e6, feedback: 'Thrust = P/c, so P = Fc: multiply by c.' }],
          hints: [t`Each photon carries $p = h/\lambda_0 = E/c$, so the beam carries momentum $P/c$ per second.`, t`Thrust $F = P/c$, so $P = Fc$.`],
          teach: t`Light’s momentum is its energy over $c$: one newton of photon thrust costs 300 MW.`,
          explain: t`$P = Fc = ${F}\times c = ${tex(P / 1e6, 3)}$ MW. Photon momentum is tiny per joule, which is why light sails borrow the Sun’s (or a laser’s) power rather than carrying their own.`,
        };
      },
    }),
    mcq({
      id: 'longer-exposure', difficulty: 2,
      prompt: t`A star tracker’s image of a faint star is limited by shot noise. You make the exposure four times longer. What happens to the signal-to-noise ratio?`,
      visual: { type: 'graph', params: { x: [0, 4.4], y: [0, 2.3], aspect: 'wide', xlabel: 'exposure (relative)', ylabel: 'SNR (relative)', xticks: 4, yticks: 4, curves: [{ fn: 'sqrt(x)', color: 'accent', width: 2.2, domain: [0, 4.4] }], points: [{ x: 1, y: 1, color: 'gold', label: 'now' }] }, caption: t`Signal-to-noise ratio against exposure time when shot noise dominates.` },
      choices: ['It doubles.', 'It quadruples.', 'It is unchanged: signal and noise both grow.', 'It grows sixteenfold.'],
      answer: 0,
      why: { 1: t`The signal grows 4×, but so does the noise’s square: noise grows as $\sqrt N$, by 2×.`, 2: t`Both grow, but not equally: signal $\propto N$, noise $\propto\sqrt N$.`, 3: t`Sixteenfold would need the SNR to grow as $N^2$; it grows only as $\sqrt N$.` },
      hints: [t`Signal $= N$, noise $= \sqrt N$.`],
      teach: t`With shot noise, SNR $= \sqrt N$: four times the photons buys twice the signal-to-noise ratio.`,
      explain: t`$N \to 4N$, so $\text{SNR} = \sqrt N \to 2\sqrt N$. Doubling the SNR costs four times the light — a bigger aperture or a longer exposure.`,
    }),
    num({
      id: 'photons-for-snr', difficulty: 2,
      gen(r) {
        const snr = r.pick([20, 50, 100, 300]);
        return {
          prompt: t`How many photoelectrons must a shot-noise-limited detector collect for a signal-to-noise ratio of ${snr}?`,
          visual: { type: 'graph', params: { x: [0, 5.2], y: [0, 2.8], aspect: 'wide', xlabel: 'N (photoelectrons)', ylabel: 'SNR', xlog: true, ylog: true, xticks: 5, yticks: 3, curves: [{ fn: 'x/2', color: 'accent', width: 2.2 }], hlines: [{ y: sf(Math.log10(snr), 4), color: 'gold', label: `SNR = ${snr}` }] }, caption: t`SNR $= \sqrt N$, on logarithmic axes: a line of slope ½.` },
          answer: snr * snr, tol: { rel: 0.005 },
          errors: [{ value: snr, feedback: 'The noise is √N, so SNR = N/√N = √N. Square the target.' }, { value: Math.sqrt(snr), feedback: 'Square, not square-root: N = SNR².' }],
          hints: [t`$\text{SNR} = N/\sqrt N = \sqrt N$.`],
          teach: t`A shot-noise-limited measurement needs $N = \text{SNR}^2$ detected photons.`,
          explain: t`$N = ${snr}^2 = ${snr * snr}$ photoelectrons.`,
        };
      },
    }),
    mcq({
      id: 'one-at-a-time', difficulty: 3,
      prompt: t`Light so faint that only one photon is in the apparatus at a time passes through two slits. A camera records each arrival as a single dot. After many arrivals the dots form two-slit fringes (below). Which statement is right?`,
      visual: { type: 'graph', params: bare([-1.1, 1.1], [0, 1], { points: detections(260) }), caption: t`Simulated arrivals: each dot is one photon, drawn at random from the two-slit irradiance pattern.` },
      choices: [
        'Each photon is detected at one point, with a probability set by the wave’s irradiance there, which depends on both slits being open.',
        'The fringes come from photons interfering with other photons in the beam.',
        'Each photon splits at the slits and the two halves land at two different dots.',
        'The photons travel along wavy paths, which bunch them into fringes.',
      ],
      answer: 0,
      why: {
        1: 'With one photon in the apparatus at a time there is no other photon to interfere with; the pattern still forms (Taylor, 1909, and many modern single-photon experiments).',
        2: 'Every detection is a single, whole photon: one dot per photon, never half a photon.',
        3: 'Photons do not follow trajectories that can be drawn; the “wave” is a probability amplitude, not a path.',
      },
      hints: ['What does a single photon leave on the camera, and what decides where?', 'With one photon in the apparatus at a time, there is nothing else for it to interfere with — yet the fringes still build up.'],
      teach: 'The wave picture gives the probability; the photon picture gives the discreteness. Both are needed, and they never contradict each other.',
      explain: 'Each detection is a localized, whole photon. Where it lands is random, with probability proportional to the classical irradiance — and that irradiance has fringes only when both paths are open. Detecting which slit each photon used destroys them.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-downlink', difficulty: 2, transfer: true,
      gen(r) {
        const pW = r.pick([0.5, 2, 8, 30]);
        const Phi = (pW * 1e-12) / ((H * C) / 1550e-9);
        return {
          prompt: t`NASA’s Deep Space Optical Communications experiment sent data from the Psyche spacecraft as 1550 nm laser light, counted photon by photon at a ground telescope. If the telescope receives ${pW} pW of signal, how many photons arrive per second?`,
          visual: { type: 'graph', params: bare([-3.2, 3.2], [-1.3, 1.3], { arrows: [{ from: [2.6, 0.9], to: [-2.2, -0.6], color: 'warn', width: 2.2, label: '1550 nm', labelDx: 12 }], points: [{ x: 2.8, y: 1.0, r: 6, color: 'ink2', label: 'spacecraft', labelAlign: 'right', labelDx: -12 }, { x: -2.4, y: -0.7, r: 8, color: 'accent', label: 'telescope', labelDx: 12, labelDy: 14 }] }), caption: t`The downlink, schematic and not to scale: the real path is tens to hundreds of millions of kilometres.` },
          answer: Phi, units: 's^-1', tol: { rel: 0.01 },
          errors: [{ value: ((pW * 1e-12) * 1550e-9) / H, feedback: t`The photon energy is $hc/\lambda_0$: you left out $c$.` }],
          hints: [t`$\Phi = P\lambda_0/hc$.`],
          teach: t`At deep-space distances a laser link is photon-starved: each photon carries 0.8 eV, so a picowatt is only millions of photons a second.`,
          explain: t`One 1550 nm photon is $${tex((H * C) / 1550e-9, 3)}$ J, so $\Phi = ${tex(Phi, 3)}$ photons/s. Encoding several bits in the arrival time of each photon is how such links squeeze data out of so little light.`,
        };
      },
    }),
    num({
      id: 'cp-fainter', difficulty: 3,
      gen(r) {
        const dm = r.pick([1, 1.5, 2, 2.5, 3]);
        const ratio = Math.sqrt(10 ** (-0.4 * dm));
        return {
          prompt: t`A star tracker measures one star with a shot-noise-limited signal-to-noise ratio of 80. Another star is ${dm} magnitudes fainter (each magnitude is a factor $10^{0.4}$ in photon flux). Same exposure: what signal-to-noise ratio does it get?`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 90], aspect: 'wide', xlabel: 'magnitudes fainter', ylabel: 'SNR', xticks: 4, yticks: 4, curves: [{ fn: '80*10^(-0.2*x)', color: 'accent', width: 2.2 }], points: [{ x: 0, y: 80, color: 'gold', label: 'SNR 80' }], vlines: [{ x: dm, color: 'ink3' }] }, caption: t`SNR against how much fainter the star is, for shot noise alone.` },
          answer: 80 * ratio, tol: { rel: 0.01 },
          errors: [{ value: 80 * 10 ** (-0.4 * dm), feedback: t`That scales the SNR like the photon count. SNR $= \sqrt N$ falls only as the square root.` }],
          hints: [t`$N$ falls by $10^{-0.4\Delta m}$.`, t`SNR $\propto \sqrt N$, so it falls by $10^{-0.2\Delta m}$.`],
          teach: t`In magnitudes, shot-noise-limited SNR falls by $10^{0.2}$ per magnitude: a factor 10 every 5 magnitudes.`,
          explain: t`SNR $= 80\times10^{-0.2\times${dm}} = ${sf(80 * ratio, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-pressure-photons', difficulty: 2,
      prompt: t`A beam of irradiance $I$ is absorbed by a black plate. In the photon picture, where does the pressure $I/c$ come from?`,
      visual: { type: 'graph', params: bare([-3, 3], [-1.2, 1.2], { shade: [{ fn: '1', lower: '-1', from: 1.6, to: 1.9, color: 'ink3', alpha: 0.8 }], points: detections(40, 3).map((p) => ({ ...p, x: sf(-2.8 + (p.x + 1) * 2.1, 4), y: sf(p.y * 1.8 - 0.9, 3) })), arrows: [{ from: [-2.9, 1.05], to: [1.4, 1.05], color: 'gold', width: 1.4 }] }), caption: t`Photons (dots) streaming into an absorbing plate. Schematic.` },
      choices: [
        'Photons arrive at I/hν per m² per second, each handing over momentum h/λ₀; the product is I/c.',
        'Photons carry no momentum because they have no mass; the pressure is a purely wave effect.',
        'Each photon pushes with force hν/c for as long as the beam is on.',
        'The pressure comes from the plate heating up and radiating.',
      ],
      answer: 0,
      why: {
        1: t`Massless particles carry momentum $E/c$ — the relativistic energy–momentum relation, $E^2 = (pc)^2 + (mc^2)^2$ with $m = 0$.`,
        2: t`$h\nu/c$ is a momentum, not a force. Force is momentum delivered per second: number of photons per second times $h/\lambda_0$.`,
        3: 'Re-radiation adds a small force, but the main pressure is there from the first instant, before the plate warms.',
      },
      hints: [t`Momentum per second per square metre = (photons per second per m²) × (momentum per photon).`],
      teach: 'Radiation pressure is photon flux times photon momentum; the wave and photon pictures give the same I/c.',
      explain: t`Photon flux density $I/h\nu$ times momentum $h/\lambda_0 = h\nu/c$ gives $I/c$, exactly the wave result. (A mirror returns each photon with reversed momentum, doubling it.)`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §3.3–3.4', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'M. S. Bessell, F. Castelli & B. Plez, Model atmospheres, broad-band colors… A&A 333, 231 (1998) — V-band zero point', url: 'https://ui.adsabs.harvard.edu/abs/1998A%26A...333..231B' },
    { label: 'G. I. Taylor, Interference fringes with feeble light, Proc. Camb. Phil. Soc. 15, 114 (1909)', url: 'https://archive.org/details/proceedingsofcam15camb' },
  ],
});
