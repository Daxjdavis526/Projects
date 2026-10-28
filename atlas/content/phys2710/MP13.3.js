// A first look at cosmology — a short concept lesson that ends the course
// and points into the Road to Einstein (gr.S30, gr.S31), which does the
// geometry properly. Hubble’s law read from a spectral line; Hubble’s own
// 1929 constant and the age crisis it caused; the cosmic microwave
// background as the most perfect blackbody known (2.725 K, released near
// 3000 K) and our motion through it; why hydrogen became neutral only at
// 3000 K; a quarter of the ordinary matter is helium, from the neutron–
// proton ratio; what is not known (dark matter, dark energy). Every number
// is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, T_CMB, DT_CMB, WIEN_B, KB_EV } from './_constants.js';
import { HBARC } from './_quanta.js';
import { r6, label, spectrumStrip } from './_diagrams.js';

const t = String.raw;
const H0 = 67.4, MPC_KM = 3.0857e19, GYR = 1e9 * 365.25 * 86400, CKMS = C / 1000;
const HA = 656.28;                                         // nm, hydrogen-alpha in air (rest)
const T_REL = 3000;                                        // K, roughly when the universe became transparent
const N_GAMMA = (2 * 1.2020569 / Math.PI ** 2) * ((KB_EV * T_CMB) / (HBARC * 1e-7)) ** 3;   // photons per cm³ (ħc in eV cm)
const ZETA = (T_REL / T_CMB) - 1;

/** A Hubble diagram: recession speed against distance for one or two values of the constant. */
const hubble = ({ lines = [[H0, 'today’s value, 67.4', 'accent']], dMax = 30, vMax = 16000, caption } = {}) => ({
  type: 'graph',
  params: {
    x: [0, dMax], y: [0, vMax], aspect: 'wide', axesAt: 'edge', xlabel: 'distance (Mpc)', ylabel: 'recession speed (km/s)',
    curves: lines.map(([h, lab, color], i) => ({ fn: `${h}*x`, color, width: 2.4, label: `H₀ = ${lab}`, labelAt: Math.min(dMax * 0.8, (vMax * 0.8) / h), labelDx: i ? 8 : -8, labelDy: i ? -2 : 12, labelAlign: i ? 'left' : 'right' })),
  },
  caption: caption ?? 'The Hubble–Lemaître law: recession speed in proportion to distance (km/s per megaparsec; 1 Mpc = 3.26 million light-years). Real galaxies scatter about the line by a few hundred km/s of their own motion.',
});

/** Sixteen nucleons when the neutrons were locked into helium: n/p = 1/7. */
const nucleons = (() => {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const inHe = i < 4, n = i % 2 === 1 && i < 4;
    const x = inHe ? (i % 2) * 0.5 : 1.6 + ((i - 4) % 6) * 0.55, y = inHe ? Math.floor(i / 2) * 0.5 : (Math.floor((i - 4) / 6)) * 0.55;
    pts.push({ x: r6(x), y: r6(y), r: 11, color: n ? 'accent' : 'warn' });
  }
  return {
    type: 'graph',
    params: {
      x: [-0.7, 5.1], y: [-0.7, 1.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['0.25 + 0.62*cos(t)', '0.25 + 0.62*sin(t)'], t: [0, 6.2832], color: 'gold', width: 1.8, dash: true }],
      points: [...pts, label(0.25, -0.55, 'helium-4', 'gold', 0, 0, 'center'), label(3, 1.25, 'hydrogen: free protons', 'warn', 0, 0, 'center'), label(-0.55, 1.15, 'blue: neutrons; orange: protons', 'ink2', 0, 0, 'left')],
    },
    caption: 'Sixteen nucleons at the moment of nucleosynthesis, a few minutes after the Big Bang, drawn for two neutrons to fourteen protons (n/p = 1/7; the question may use another ratio). Nearly every neutron ends up in helium-4. Schematic.',
  };
})();

export default lesson({
  id: 'phys2710.MP13.3',
  kind: 'concept',
  title: 'A first look at cosmology',
  minutes: 10, difficulty: 2,
  badges: ['est-obs', 'open'],
  intro: t`Three observations turned cosmology into a science. Distant galaxies’ light is redshifted in proportion to their distance — **Hubble’s law**:

$$v = H_0\,d$$

The whole sky glows with microwaves, a near-perfect blackbody at 2.725 K: the **cosmic microwave background**, light released when the universe was a thousand times smaller and 3000 K hot. And a quarter of the ordinary matter is helium, cooked in the first minutes. All three fit one picture: **space itself is expanding**, from a hot, dense early state 13.8 billion years ago — not an explosion from a point into empty space, but every distance between galaxies growing at once. This lesson uses only what this course has built: spectra, blackbodies, nuclei and particles. The geometry behind it — general relativity’s expanding spacetime — is the Road to Einstein: [the expanding universe](#/lesson/gr.S30.i) and [what decides its fate](#/lesson/gr.S31.i).`,
  symbols: [
    { tex: 'v', text: t`the speed at which a galaxy recedes, found from its redshift: $v \approx cz$ for small $z = \Delta\lambda/\lambda$` },
    { tex: 'H_0', text: 'the Hubble constant, today’s expansion rate: 67.4 km/s per megaparsec from the microwave background, 73 from nearby stars and supernovae — a disagreement that is not yet explained' },
    { tex: 'd', text: 'the galaxy’s distance, in megaparsecs (1 Mpc = 3.26 million light-years = 3.086 × 10¹⁹ km)' },
  ],
  why: 'The light of the Big Bang, the helium in the stars and the expansion of space are where the physics of this course — photons, atoms, nuclei and particles — meets general relativity.',
  visual: {
    type: 'mp-blackbody',
    title: 'The oldest light',
    lead: t`This is the spectrum of the cosmic microwave background, 2.725 K, on logarithmic axes. COBE’s spectrometer found it fits Planck’s law to better than one part in ten thousand. The light has been travelling since the universe became transparent; expansion has stretched every wavelength since.`,
    tasks: [
      'Read the peak: about 1 mm, in the microwaves — invisible, and why it took radio astronomers to find it, in 1965.',
      'Raise the temperature to 3000 K, roughly when the light was released: the same curve, its peak near 1 μm and glowing orange-red. Stretching the wavelengths by 1100 cools 3000 K to 2.7 K.',
      'Compare with the Sun at 5772 K: the early universe glowed with light like a dim star’s, everywhere at once.',
    ],
    params: { T: T_CMB, axis: 'log', window: 'all', compare: ['sun'] },
    caption: 'Planck’s law for the cosmic microwave background (2.725 K, Fixsen 2009) and the Sun (faint) on log–log axes. The background is the same in every direction to a few parts in 100 000, once our own motion is taken out.',
  },
  example: {
    prompt: t`The cosmic microwave background is a blackbody at $T = ${T_CMB}$ K. (a) At what wavelength does it peak? (b) The universe became transparent when it was about 3000 K. By what factor have wavelengths been stretched since, and where was the peak then? (c) How many of these photons fill each cubic centimetre, using $n = 0.2436\,(kT/\hbar c)^3$?`,
    visual: { type: 'mp-blackbody', params: { T: T_CMB, axis: 'log', compare: [T_REL], controls: false, readout: false }, caption: 'The microwave background today (2.725 K) and the same radiation as it was released (3000 K, faint), on log–log axes.' },
    steps: [
      { label: 'Today’s peak', text: t`Wien’s law: $\lambda_{\max} = b/T = (2.898\times10^{-3}\ \text{m K})/(${T_CMB}\ \text{K}) = ${fmt((WIEN_B / T_CMB) * 1000, 4)}$ mm — microwaves.` },
      { label: 'Stretched', text: t`A blackbody stays a blackbody as its wavelengths stretch, with $T \propto 1/\lambda$. The stretch factor is $3000/${T_CMB} = ${fmt(T_REL / T_CMB, 4)}$: that is $1 + z$, with $z \approx 1100$. The peak was then $${fmt((WIEN_B / T_REL) * 1e6, 3)}$ μm, in the near-infrared, with a visible orange-red glow.` },
      { label: 'How many', text: t`$kT = ${tex(KB_EV * T_CMB, 4)}$ eV and $\hbar c = 1.9733\times10^{-5}$ eV cm, so $kT/\hbar c = ${fmt((KB_EV * T_CMB) / (HBARC * 1e-7), 4)}$ cm⁻¹ and $n = 0.2436\times${fmt(((KB_EV * T_CMB) / (HBARC * 1e-7)) ** 3, 4)} = ${fmt(N_GAMMA, 3)}$ photons per cm³.` },
      { label: 'Sense check', text: t`There are about 1.6 billion of these photons for every proton or neutron in the universe — a number that matters in the next problems. The 3000 K also links to MP1: hydrogen’s spectrum and Planck’s law, now written across the whole sky.` },
    ],
    answer: t`(a) $${fmt((WIEN_B / T_CMB) * 1000, 4)}$ mm; (b) stretched $${fmt(T_REL / T_CMB, 4)}$ times, from a peak at $${fmt((WIEN_B / T_REL) * 1e6, 3)}$ μm; (c) about ${fmt(N_GAMMA, 3)} per cm³.`,
  },
  practice: [
    num({
      id: 'line-distance', difficulty: 2,
      gen(r) {
        const z0 = r.pick([0.004, 0.008, 0.012, 0.02, 0.03]), lam = +(HA * (1 + z0)).toFixed(2), z = lam / HA - 1, v = CKMS * z, d = v / H0;
        return {
          prompt: t`Hydrogen’s red line, H-alpha, has a wavelength of ${HA} nm in the laboratory. In a galaxy’s spectrum it appears at ${lam} nm. Taking $v \approx cz$ and $H_0 = ${H0}$ km/s/Mpc, how far away is the galaxy, in Mpc?`,
          answer: d, units: 'Mpc', tol: { rel: 0.01 },
          errors: [{ value: v, feedback: 'That is the speed in km/s. Divide by H₀ to get the distance.' }, { value: (CKMS * (lam - HA)) / lam / H0, feedback: t`The redshift is $\Delta\lambda$ divided by the **rest** wavelength, ${HA} nm.` }].filter((e) => Math.abs(e.value / d - 1) > 0.02),
          hints: [t`$z = (\lambda_\text{obs} - \lambda_\text{rest})/\lambda_\text{rest}$.`, t`$v = cz$ with $c = 299{,}792$ km/s; then $d = v/H_0$.`],
          teach: t`A redshift gives a speed, $v \approx cz$, and Hubble’s law turns the speed into a distance, $d = v/H_0$.`,
          explain: t`$z = ${fmt(lam - HA, 3)}/${HA} = ${fmt(z, 3)}$, $v = ${fmt(v, 4)}$ km/s and $d = ${fmt(d, 3)}$ Mpc, about ${fmt((d * 3.26156) , 3)} million light-years. The rule $v \approx cz$ holds only for small $z$; at large redshift the stretch of space must be followed properly (gr.S30).`,
          visual: spectrumStrip({ from: 540, to: 720, marks: [{ nm: HA, label: 'H-alpha at rest', color: 'ink' }, { nm: lam, label: 'observed', color: 'bad', dy: -26 }], caption: 'Hydrogen’s red line in the laboratory and in the galaxy’s spectrum, shifted to longer wavelengths. Screen colours are approximate.' }),
        };
      },
    }),
    num({
      id: 'hubble-1929', difficulty: 2,
      prompt: t`Hubble’s own 1929 data gave $H_0 \approx 500$ km/s/Mpc. The **Hubble time** $1/H_0$ estimates how long ago the galaxies were together. What was it with Hubble’s value, in billions of years? (1 Mpc $= 3.086\times10^{19}$ km.)`,
      answer: MPC_KM / 500 / GYR, units: 'Gyr', tol: { rel: 0.01 },
      errors: [{ value: 500 / MPC_KM * GYR, feedback: t`Invert: $1/H_0 = (3.086\times10^{19}\ \text{km/Mpc})/(500\ \text{km/s/Mpc})$ in seconds.` }],
      hints: [t`$1/H_0 = \dfrac{3.086\times10^{19}\ \text{km}}{500\ \text{km/s}}$, in seconds.`, t`One billion years is $3.156\times10^{16}$ s.`],
      teach: 'The Hubble time 1/H₀ sets the age scale of an expanding universe — and an error in the distance ladder shows up directly in it.',
      explain: t`$1/H_0 = ${tex(MPC_KM / 500, 3)}$ s $= ${fmt(MPC_KM / 500 / GYR, 3)}$ billion years — less than the age of the Earth, measured from radioactive decay at 4.5 billion years. The crisis was in the distances: Hubble’s Cepheid calibration mixed up two kinds of variable star, and later corrections cut $H_0$ sevenfold. Today’s $H_0 = 67.4$ gives $1/H_0 = ${fmt(MPC_KM / H0 / GYR, 3)}$ billion years, close to the 13.8-billion-year age.`,
      visual: hubble({ lines: [[H0, '67.4 (today)', 'accent'], [500, '500 (Hubble, 1929)', 'gold']], dMax: 2.5, vMax: 1300, caption: 'Hubble’s 1929 slope (gold) against today’s (blue), over the 2 Mpc his galaxies spanned. His distances were too small by a factor of about seven, so his slope was too steep. Real galaxies scatter about the line.' }),
    }),
    mcq({
      id: 'recombination', difficulty: 3,
      prompt: t`Hydrogen’s ionization energy is 13.6 eV, and $kT = 13.6$ eV at about 158 000 K. Yet the early universe stayed ionized — opaque — until it cooled to about 3000 K, where $kT$ is only 0.26 eV. Why so cold?`,
      choices: [
        'Photons outnumber atoms more than a billion to one, so even the rare photons in the blackbody’s far tail above 13.6 eV were enough to re-ionize every atom until about 3000 K',
        'Hydrogen’s ionization energy was much smaller in the early universe',
        'The universe was too dense for atoms to fit until it had expanded',
        'Electrons moved too fast to be captured until they slowed below the speed of light',
      ],
      answer: 0,
      why: {
        1: 'Atomic physics was the same then: the same 13.6 eV, the same spectral lines — that is why the background’s spectrum makes sense.',
        2: 'At 3000 K the universe was a thin gas, about a few hundred atoms per cubic centimetre; atoms fitted easily.',
        3: 'Electrons always move slower than light; the question is whether photons knock them off again.',
      },
      hints: ['How many photons are there for each atom? (About 1.6 × 10⁹.)', 'A blackbody at 3000 K has only a tiny fraction of its photons above 13.6 eV — but a tiny fraction of a billion per atom can still be several per atom.'],
      teach: 'With about a billion photons per atom, the hot tail of the radiation kept hydrogen ionized until about 3000 K — when the universe became transparent.',
      explain: 'The share of a blackbody’s photons above 13.6 eV falls as e^(−13.6 eV/kT). With 1.6 billion photons per baryon, that share must drop below about one in a billion before atoms survive: that happens near kT ≈ 0.26 eV, about 3000 K, some 380 000 years after the Big Bang. The light released then is the microwave background.',
      visual: { type: 'mp-blackbody', params: { T: T_REL, axis: 'log', controls: false, readout: false }, caption: 'A 3000 K blackbody on log–log axes: almost all its photons have far less than the 13.6 eV (91 nm) needed to ionize hydrogen, but there are about 1.6 billion photons per atom.' },
    }),
    num({
      id: 'helium', difficulty: 2,
      gen(r) {
        const k = r.pick([6, 7, 8]), Y = 2 / (1 + k);
        return {
          prompt: t`When nuclei could first survive, a few minutes after the Big Bang, there was about one neutron for every ${k} protons. Almost every neutron then ended up in helium-4 (two neutrons, two protons). What fraction of the ordinary matter’s mass became helium?`,
          answer: Y, tol: { rel: 0.01 },
          errors: [{ value: 1 / (1 + k), feedback: 'Each helium nucleus holds two neutrons and two protons: the helium mass is twice the neutrons’ mass.' }, { value: 1 / k, feedback: 'Divide by all the nucleons, neutrons and protons together.' }],
          hints: [t`Take 1 neutron and ${k} protons: ${1 + k} nucleons of nearly equal mass.`, t`Each neutron takes one proton with it into helium, so 2 of every ${1 + k} nucleons end up in helium.`],
          teach: 'The neutron-to-proton ratio of about 1/7 fixes the helium: Y = 2(n/p)/(1 + n/p) ≈ 25%, as observed.',
          explain: t`$Y = \dfrac{2\,(n/p)}{1 + n/p} = \dfrac{2}{${1 + k}} = ${fmt(Y, 3)}$. The ratio was set when the weak reactions stopped converting neutrons and protons, at $kT \approx 0.8$ MeV: $e^{-1.293/0.8} \approx 1/5$, after which some neutrons decayed (lesson MP13.2) before being locked into helium, leaving about 1/7. The measured primordial helium fraction is 0.245 — a test of the hot Big Bang that it passes.`,
          visual: nucleons,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-dipole', difficulty: 2, transfer: true,
      prompt: t`The microwave background is about $${fmt(DT_CMB * 1000, 4)}$ mK hotter than average in one direction of the sky and as much cooler in the opposite one: the Doppler shift of our own motion, $\Delta T/T = v/c$. With $T = ${T_CMB}$ K, how fast is the Sun moving relative to the background, in km/s?`,
      answer: (CKMS * DT_CMB) / T_CMB, units: 'km/s', tol: { rel: 0.005 },
      errors: [{ value: (CKMS * DT_CMB * 2) / T_CMB, feedback: t`$\Delta T$ is the amplitude — the excess in one direction, not the difference between the hottest and coldest.` }],
      hints: [t`$v = c\,\Delta T/T$.`, t`$v = 299{,}792\ \text{km/s}\times(${tex(DT_CMB, 4)}\ \text{K})/(${T_CMB}\ \text{K})$.`],
      teach: 'The microwave background is a rest frame for the universe: our speed through it shows as a dipole, ΔT/T = v/c.',
      explain: t`$v = 299{,}792\times${tex(DT_CMB / T_CMB, 4)} = ${fmt((CKMS * DT_CMB) / T_CMB, 4)}$ km/s, toward the constellation Crater. Relativity forbids an absolute rest frame for the laws of physics, but the universe’s contents still pick out one in which the background looks the same all round — the frame of the cosmic expansion.`,
      visual: { type: 'graph', params: { x: [0, 180], y: [-4, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'angle from the direction of our motion (°)', ylabel: 'ΔT (mK)',
        curves: [{ fn: `${r6(DT_CMB * 1000)}*cos(x*pi/180)`, color: 'bad', width: 2.6 }], hlines: [{ y: 0, color: 'ink3' }], points: [label(10, r6(DT_CMB * 1000), 'hotter ahead', 'bad', 0, -12, 'left'), label(175, r6(-DT_CMB * 1000), 'cooler behind', 'accent', 0, 12, 'right')] },
        caption: 'The microwave background’s temperature excess against direction: a dipole, ΔT ∝ cos θ, from our motion (Planck 2018 amplitude). The universe’s own fluctuations are a hundred times smaller.' },
    }),
    mcq({
      id: 'cp-contents', difficulty: 2, transfer: true,
      prompt: 'Fitting the microwave background’s pattern of hot and cold spots, the universe’s energy comes out as about 5% ordinary matter, 27% dark matter and 68% dark energy. Which statement is honest?',
      choices: [
        'The proportions are measured, consistently by several methods, but what dark matter and dark energy are is unknown — they are inferred only from their gravity',
        'Dark matter and dark energy are two names for the same substance',
        'Dark energy has been detected in the laboratory as the energy of the vacuum',
        'The 95% is a fudge that will vanish once ordinary matter is counted properly',
      ],
      answer: 0,
      why: {
        1: 'They act oppositely: dark matter clumps and pulls, dark energy is smooth and speeds the expansion up.',
        2: 'No laboratory has detected it. The naive vacuum-energy estimate is wrong by some 120 powers of ten.',
        3: 'Ordinary matter is counted independently, by the helium and deuterium made in the first minutes, and by the background itself. It is 5%.',
      },
      hints: ['Which of these numbers come from observation, and which claims go beyond it?', 'Has either dark component been detected other than through gravity?'],
      teach: 'The universe’s composition is measured; the nature of 95% of it is an open question.',
      explain: 'Several independent measurements — the background’s spots, supernovae as distance markers, the clustering of galaxies, light-element abundances — agree on the shares. The nature of dark matter and dark energy is open; recent galaxy surveys even hint that dark energy changes with time. The Road to Einstein takes this up with the Friedmann equation (gr.S31).',
      visual: { type: 'graph', params: { x: [0, 100], y: [0, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'share of the universe’s energy today (%)', ylabel: '', yticks: 0, grid: false,
        shade: [{ fn: '0.7', lower: '0.3', from: 0, to: 4.9, color: 'warn', alpha: 0.8 }, { fn: '0.7', lower: '0.3', from: 4.9, to: 31.5, color: 'violet', alpha: 0.5 }, { fn: '0.7', lower: '0.3', from: 31.5, to: 100, color: 'teal', alpha: 0.4 }],
        points: [label(2.5, 0.85, 'ordinary', 'warn', 0, 0, 'center'), label(18, 0.5, 'dark matter', 'ink', 0, 0, 'center'), label(66, 0.5, 'dark energy', 'ink', 0, 0, 'center')] },
      caption: 'The universe’s energy today (Planck 2018): ordinary matter 4.9%, dark matter 26.6%, dark energy 68.5%. Radiation and neutrinos add well under 1%.' },
    }),
  ],
  sources: [
    { label: 'Fixsen (2009), The temperature of the cosmic microwave background, ApJ 707, 916', url: 'https://doi.org/10.1088/0004-637X/707/2/916' },
    { label: 'Planck Collaboration (2020), Planck 2018 results VI: cosmological parameters, A&A 641, A6', url: 'https://doi.org/10.1051/0004-6361/201833910' },
    { label: 'Hubble (1929), A relation between distance and radial velocity among extra-galactic nebulae, PNAS 15, 168', url: 'https://doi.org/10.1073/pnas.15.3.168' },
    { label: 'OpenStax University Physics Vol. 3, §11.6–11.7 (the Big Bang; evolution of the early universe)', url: 'https://openstax.org/books/university-physics-volume-3/pages/11-6-the-big-bang' },
  ],
});
