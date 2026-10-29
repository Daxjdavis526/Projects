// Blackbody radiation as a photon gas: modes of a box, each a boson state
// with μ = 0; summing them gives Planck's spectrum, U/V = 8π⁵(kT)⁴/15(hc)³
// and σ from h, c and k. The CMB (2.72548 K, Fixsen 2009) against the Sun:
// energy and photon densities, mean photon energy 2.70 kT, entropy 3.60 k
// per photon, adiabatic cooling T ∝ 1/a, radiation pressure in the solar core.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, H, HBAR, CL, EV, SIGMA, ARAD, ZETA3, T_CMB, T_SUN, R_SUN, AU, uRad, nPhoton, r4, texNum, apart } from './_stat.js';

const t = String.raw;
const L10 = Math.log10;
const L_SUN = 3.828e26;                          // W, IAU 2015 nominal
const EX = { T: T_CMB };
EX.u = uRad(EX.T); EX.n = nPhoton(EX.T); EX.mean = EX.u / EX.n / (KB * EX.T);
const MEAN = (Math.PI ** 4 / 15) / (2 * ZETA3);  // mean photon energy / kT = 2.701
const SUN_CORE = { T: 1.571e7, P: 2.477e16 };    // NASA Sun fact sheet

/** Planck's energy spectrum in x = ε/kT, normalized to unit area. */
const planckX = { type: 'graph', params: { x: [0, 12], y: [0, 0.25], aspect: 'wide', axesAt: 'edge', xlabel: 'photon energy ε / kT', ylabel: 'share of energy per unit x', curves: [{ fn: `x^3/(e^x - 1)/${r4(Math.PI ** 4 / 15)}`, domain: [0.01, 12], color: 'accent' }] } };
/** u = aT⁴ on log axes, with marks. */
function uPic({ marks = [], caption }) {
  return {
    type: 'graph',
    params: { x: [0, 8], y: [-16, 18], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'temperature (K)', ylabel: 'energy density (J/m³)', curves: [{ fn: `log10(${ARAD}) + 4*x`, domain: [0, 8], color: 'accent' }],
      points: marks.map(([T, label]) => ({ x: r4(L10(T)), y: r4(L10(uRad(T))), r: 5, color: 'gold', label, labelDx: 8, labelDy: 12 })) },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T7.4',
  title: 'Blackbody radiation',
  minutes: 18, difficulty: 3,
  intro: t`A cavity at temperature $T$ fills with light. Each standing-wave **mode** of the box is one single-particle state for photons, with energy $\varepsilon = hf$. Photons are bosons whose number the walls do not conserve, so $\mu = 0$ (T7.2), and each mode holds on average $\bar n = 1/(e^{\varepsilon/kT} - 1)$ photons. Counting the modes — $8\pi\varepsilon^2\,d\varepsilon/(hc)^3$ per unit volume, two polarizations included — and adding up their energy gives Planck’s spectrum and the total energy density:

$$\frac{U}{V} = \int_0^\infty \frac{8\pi}{(hc)^3}\,\frac{\varepsilon^3\,d\varepsilon}{e^{\varepsilon/kT} - 1} = \frac{8\pi^5(kT)^4}{15(hc)^3}.$$

[PHYS 2710 MP1.1–MP1.2](#/lesson/phys2710.MP1.2) met the measured laws and Planck’s guess; here every one of them — the $T^4$, Stefan’s $\sigma$, the photon count — comes out of the photon gas.`,
  symbols: [
    { tex: 'U/V', text: 'the energy density of the radiation, in J/m³' },
    { tex: '\\varepsilon', text: 'a photon’s energy, $hf$, in J' },
    { tex: '8\\pi\\varepsilon^2/(hc)^3', text: 'the number of modes per unit volume per unit photon energy (both polarizations)' },
    { tex: '1/(e^{\\varepsilon/kT} - 1)', text: 'the Bose–Einstein occupancy with $\\mu = 0$: the Planck distribution' },
    { tex: 'h,\\ c,\\ k', text: 'Planck’s constant, the speed of light and Boltzmann’s constant — all exact in the SI since 2019' },
    { tex: '\\pi^4/15', text: 'the value of $\\int_0^\\infty x^3\\,dx/(e^x - 1)$, which turns the integral into $(kT)^4$ times constants' },
  ],
  why: 'The photon gas sets the temperature of planets and spacecraft, the light of every star, and the cosmic microwave background — the cooled glow of the early universe and the cleanest blackbody ever measured.',
  visual: {
    type: 'mp-blackbody',
    title: 'From the Big Bang’s glow to the Sun',
    lead: t`Planck spectra on log–log axes, from the 2.7 K microwave background to stars. Pick objects or slide the temperature: the peak slides along a straight line (Wien), and each curve towers over all colder ones at every wavelength.`,
    tasks: [
      'Compare the Sun (5772 K) with the CMB (2.725 K): a temperature ratio of about 2100, and an energy-density ratio of 2100⁴ ≈ 2 × 10¹³.',
      'Switch the axis to frequency: the peak is not at c/λ(max) — the two views put different amounts of spectrum in each interval.',
      'Read the power σT⁴: doubling T multiplies it by 16.',
    ],
    params: { T: 5772, axis: 'log', compare: ['cmb'], window: 'all', controls: ['T', 'object', 'axis'] },
    caption: 'Ideal blackbodies. Stars are only approximately black (their spectra carry absorption lines); the CMB matches a blackbody to better than one part in 10⁴ (COBE/FIRAS).',
  },
  example: {
    prompt: t`The cosmic microwave background is blackbody radiation at $T = ${T_CMB}$ K (COBE/FIRAS, Fixsen 2009). Find its energy density, its number of photons per cubic metre, and the average energy of one photon in units of $kT$.`,
    visual: { ...planckX, caption: 'Planck’s spectrum in units of kT (the same shape at every temperature): the share of the radiation’s energy carried at each photon energy.' },
    steps: [
      { label: 'Energy', text: t`$\dfrac{U}{V} = \dfrac{8\pi^5(kT)^4}{15(hc)^3} = aT^4$ with $a = ${texNum(ARAD, 4)}\ \text{J m}^{-3}\text{K}^{-4}$: $u = ${texNum(EX.u, 3)}\ \text{J/m}^3$, or $${fmt(EX.u / EV / 1e6, 3)}$ MeV per m³.` },
      { label: 'Photons', text: t`Counting photons instead of energy: $\dfrac{N}{V} = \dfrac{8\pi(kT)^3}{(hc)^3}\displaystyle\int_0^\infty\frac{x^2\,dx}{e^x - 1} = 16\pi\zeta(3)\left(\frac{kT}{hc}\right)^3$, with $\zeta(3) = 1.2021$: $n = ${texNum(EX.n, 3)}\ \text{m}^{-3}$ — about 411 per cubic centimetre.` },
      { label: 'Average', text: t`$\dfrac{U}{NkT} = \dfrac{\pi^4/15}{2\zeta(3)} = ${fmt(MEAN, 4)}$: the mean photon energy is $2.70\,kT = ${texNum(EX.mean * KB * EX.T / EV, 3)}$ eV.` },
      { label: 'Sense check', text: t`The CMB holds more photons than the universe has atoms by about a billion to one, yet its energy density is tiny — less than the light of the stars in our corner of the Galaxy. The total power a black surface radiates, $\tfrac{c}{4}u = \sigma T^4$, fixes $\sigma = \dfrac{2\pi^5k^4}{15h^3c^2} = ${texNum(SIGMA, 6)}$ W m⁻² K⁻⁴, from constants alone.` },
    ],
    answer: t`$u = ${texNum(EX.u, 3)}$ J/m³, $n = ${texNum(EX.n, 3)}$ photons/m³, mean photon energy $${fmt(MEAN, 3)}\,kT$.`,
  },
  practice: [
    num({
      id: 'energy-density', difficulty: 1,
      gen(r) {
        const [what, T] = r.pick([['a kiln', 1500], ['the Sun’s photosphere', T_SUN], ['a room', 293], ['the CMB at the time it was released', 2970]]), v = uRad(T);
        return {
          prompt: t`What is the energy density of blackbody radiation at the temperature of ${what}, $${T}$ K? ($a = 4\sigma/c = 7.566\times10^{-16}\ \text{J m}^{-3}\text{K}^{-4}$.)`,
          answer: v, units: 'J/m^3', tol: { rel: 0.01 },
          errors: apart([{ value: SIGMA * T ** 4, feedback: 'σT⁴ is the power per area leaving a surface (W/m²). The energy density is aT⁴ = 4σT⁴/c.' }, { value: ARAD * T ** 3, feedback: 'The energy density grows as T⁴.' }], v),
          hints: [t`$u = aT^4$.`],
          teach: t`Blackbody energy density $u = aT^4$, $a = 8\pi^5k^4/15(hc)^3$.`,
          explain: t`$u = (7.566\times10^{-16})(${T})^4 = ${texNum(v, 3)}$ J/m³.`,
          visual: uPic({ marks: [[T, what]], caption: 'Blackbody energy density against temperature (both axes logarithmic): a straight line of slope 4.' }),
        };
      },
    }),
    code({
      id: 'sigma', difficulty: 2,
      prompt: t`Compute $I = \int_0^\infty \dfrac{x^3\,dx}{e^x - 1}$ numerically with \`scipy.integrate.quad\` (integrate to $x = 100$: the rest is negligible), store it as \`I\`, and use it to compute Stefan’s constant \`sigma\` $= \dfrac{2\pi k^4}{h^3c^2}\,I$ from the exact SI constants given.`,
      starter: t`from math import pi, expm1
from scipy.integrate import quad

h = 6.62607015e-34    # J s
c = 299792458         # m/s
k = 1.380649e-23      # J/K

I = 0
sigma = 0
print(I, sigma)
`,
      answer: t`from math import pi, expm1
from scipy.integrate import quad

h = 6.62607015e-34    # J s
c = 299792458         # m/s
k = 1.380649e-23      # J/K

I, err = quad(lambda x: x**3 / expm1(x) if x > 0 else 0.0, 0, 100)
sigma = 2 * pi * k**4 / (h**3 * c**2) * I
print(I, sigma)`,
      tests: [
        { name: t`$I = \pi^4/15 = 6.49394$`, code: 'abs(I - pi**4/15) < 1e-6' },
        { name: t`$\sigma = 5.670374\times10^{-8}$ W m⁻² K⁻⁴ (the CODATA value)`, code: 'abs(sigma / 5.670374419e-8 - 1) < 1e-7' },
      ],
      hints: [t`\`expm1(x)\` is $e^x - 1$, accurate for small $x$; at $x = 0$ the integrand’s limit is 0.`, t`\`I, err = quad(f, 0, 100)\`, then \`sigma = 2*pi*k**4/(h**3*c**2) * I\`.`],
      teach: 'Stefan’s σ is not a separate constant of nature: it is h, c, k and a number, π⁴/15.',
      explain: t`$I = 6.49394 = \pi^4/15$, and $\sigma = \dfrac{2\pi^5k^4}{15h^3c^2} = ${texNum(SIGMA, 7)}$ W m⁻² K⁻⁴ — exact, since 2019, because $h$, $c$ and $k$ are.`,
    }),
    mcq({
      id: 'mean-photon', difficulty: 2,
      prompt: 'What is the average energy of a photon in blackbody radiation at temperature T?',
      choices: ['2.70 kT', '2.82 kT', '1.5 kT', 'kT'],
      answer: 0,
      why: { 1: 'That is where the energy spectrum per unit photon energy peaks — the peak is not the mean.', 2: 'That is the mean kinetic energy of a gas molecule (three quadratic terms). Photons have no fixed number and a different spectrum.', 3: 'That is the classical energy per mode, and it is per mode, not per photon.' },
      hints: [t`Mean energy $= U/N = \dfrac{\int x^3/(e^x - 1)}{\int x^2/(e^x - 1)}\,kT$.`, t`$\int x^3/(e^x - 1) = \pi^4/15$; $\int x^2/(e^x - 1) = 2\zeta(3) = 2.404$.`],
      teach: 'Mean photon energy = (π⁴/15)/(2ζ(3)) kT = 2.70 kT; the peak of the spectrum sits nearby at 2.82 kT.',
      explain: t`$\dfrac{\pi^4/15}{2\zeta(3)} = \dfrac{6.494}{2.404} = 2.701$. The distribution of photon *numbers* peaks lower still, at $1.59\,kT$: three different “typical” energies for one spectrum.`,
      visual: { ...planckX, caption: 'The share of the radiation’s energy per unit ε/kT. Its peak and its mean are close, but not the same.' },
    }),
    num({
      id: 'cmb-past', difficulty: 2, transfer: true,
      gen(r) {
        const z = r.pick([1, 3, 10, 1089]), v = T_CMB * (1 + z);
        return {
          prompt: t`As the universe expands, a photon gas in a comoving volume expands adiabatically: its entropy $S \propto VT^3$ stays fixed, and every length (so $V^{1/3}$) grows with the scale factor $a$. Light emitted at redshift $z$ has been stretched by $1 + z$. What was the CMB’s temperature at $z = ${z}$?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: T_CMB / (1 + z), feedback: 'Going back in time the universe was smaller and hotter: T grows with 1 + z.' }, { value: T_CMB * (1 + z) ** 3, feedback: 'VT³ fixed means $T \\propto V^{-1/3} \\propto 1/a$ — one power of 1 + z, not three.' }], v),
          hints: [t`$VT^3$ constant $\Rightarrow T \propto V^{-1/3} \propto 1/a$.`, t`$T(z) = T_0(1 + z)$ with $T_0 = ${T_CMB}$ K.`],
          teach: t`A photon gas cools as $T \propto 1/a$ as the universe expands, keeping its Planck shape.`,
          explain: t`$T = ${T_CMB}\times${1 + z} = ${fmt(v, 4)}$ K. ${z > 1000 ? 'That is the era when hydrogen recombined (T7.1) and the universe became transparent: the CMB is that light.' : 'Astronomers confirm this by measuring the CMB’s temperature in distant gas clouds, from the excitation of their molecules.'}`,
          visual: uPic({ marks: [[T_CMB, 'today'], [v, `z = ${z}`]], caption: 'Blackbody energy density against temperature: the CMB moves down this line as the universe expands, its energy density falling as 1/a⁴.' }),
        };
      },
    }),
    num({
      id: 'entropy-density', difficulty: 3,
      gen(r) {
        const [what, T] = r.pick([['the CMB today', T_CMB], ['a 300 K room', 300], ['the radiation inside a 5772 K photosphere', T_SUN]]), v = (4 / 3) * ARAD * T ** 3;
        return {
          prompt: t`From $U = aVT^4$ and $C_V = dU/dT$, the photon gas’s entropy is $S = \int_0^T (C_V/T')\,dT'$. What is the entropy per cubic metre of ${what} ($T = ${T}$ K)?`,
          answer: v, units: 'J K^-1 m^-3', tol: { rel: 0.01 },
          errors: apart([{ value: ARAD * T ** 3, feedback: t`$\int_0^T 4aVT'^2\,dT' = \tfrac43aVT^3$: keep the $\tfrac43$.` }, { value: 4 * ARAD * T ** 3, feedback: t`Integrate $C_V/T' = 4aVT'^2$: that gives $\tfrac43aVT^3$, not $4aVT^3$.` }], v),
          hints: [t`$C_V = 4aVT^3$, so $C_V/T = 4aVT^2$.`, t`$S/V = \tfrac43aT^3$.`],
          teach: t`The photon gas has $S = \tfrac43 U/T = \tfrac43aVT^3$ — about $3.6k$ per photon.`,
          explain: t`$S/V = \tfrac43(${texNum(ARAD, 3)})(${T})^3 = ${texNum(v, 3)}$ J/(K·m³). Divided by the photon density, it is $${fmt(((4 / 3) * ARAD * T ** 3) / (nPhoton(T) * KB), 3)}\,k$ per photon at every temperature${T === T_CMB ? ' — and together with the cosmic neutrinos the CMB holds most of the universe’s entropy outside black holes' : ''}.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-12, 8], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'temperature (K)', ylabel: 'S/V (J K⁻¹ m⁻³)', curves: [{ fn: `log10(${(4 / 3) * ARAD}) + 3*x`, domain: [0, 4], color: 'accent' }] }, caption: 'Photon-gas entropy density against temperature (log–log): slope 3.' },
        };
      },
    }),
    mcq({
      id: 'double-T', difficulty: 2,
      prompt: 'A sealed cavity is heated from T to 2T. By what factor does the number of photons inside it change?',
      choices: ['8', '16', '2', '4'],
      answer: 0,
      why: { 1: 'That is the energy (∝ T⁴). The mean photon energy also doubles, so the number grows by 16/2.', 2: 'Twice as many would keep the average photon energy unchanged; it doubles too.', 3: 'The photon density goes as T³, not T².' },
      hints: [t`$N/V = 16\pi\zeta(3)(kT/hc)^3$.`],
      teach: 'Photon number ∝ T³, energy ∝ T⁴, mean photon energy ∝ T.',
      explain: t`$N \propto T^3$: $2^3 = 8$. Energy rises 16-fold, so the average photon carries twice as much — consistent with $2.70\,kT$ per photon.`,
      visual: uPic({ marks: [[1000, 'T'], [2000, '2T']], caption: 'Energy density against temperature (log–log): doubling T moves up by a factor of 16.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-crossover', difficulty: 3, transfer: true,
      gen(r) {
        const [star, f] = r.pick([['the Sun', 1], ['Alpha Centauri A (about 1.52 solar luminosities)', 1.52], ['Sirius A (about 25.4 solar luminosities)', 25.4]]), v = Math.sqrt((f * L_SUN) / (4 * Math.PI * CL * uRad(T_CMB))) / AU;
        return {
          prompt: t`Starlight streaming out from a star of luminosity $L$ has energy density $u = L/(4\pi d^2c)$ at distance $d$. How far from ${star} ($L_\odot = 3.828\times10^{26}$ W) does its light’s energy density fall to that of the CMB? Answer in au.`,
          answer: v, units: 'au', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt((f * L_SUN) / (4 * Math.PI * CL * SIGMA * T_CMB ** 4)) / AU, feedback: 'Compare energy densities: the CMB’s is aT⁴ = 4σT⁴/c, not σT⁴.' }, { value: ((f * L_SUN) / (4 * Math.PI * CL * uRad(T_CMB))) / AU ** 2, feedback: 'Take the square root: u falls as 1/d².' }], v),
          hints: [t`CMB: $u = aT^4 = ${texNum(uRad(T_CMB), 3)}$ J/m³.`, t`$d = \sqrt{L/(4\pi c\,u_\text{CMB})}$; 1 au $= 1.496\times10^{11}$ m.`],
          teach: 'Within about 10⁴ au a star’s light outweighs the CMB; beyond, the Big Bang’s glow dominates the local radiation.',
          explain: t`$d = ${texNum(v * AU, 3)}$ m $= ${texNum(v, 3)}$ au (about $${fmt((v * AU) / 9.4607e15, 2)}$ light-years). Out in the Oort cloud, the dark sky is lit more by the Big Bang than by ${star === 'the Sun' ? 'the Sun' : 'this star'} — in total energy, though not at visible wavelengths.`,
          visual: { type: 'graph', params: { x: [0, 6], y: [-16, -4], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'distance from the star (au)', ylabel: 'energy density (J/m³)', curves: [{ fn: `log10(${(f * L_SUN) / (4 * Math.PI * CL * AU * AU)}) - 2*x`, domain: [0, 6], color: 'gold', label: 'starlight', labelAt: 1, labelDx: 8 }], hlines: [{ y: r4(L10(uRad(T_CMB))), color: 'accent', label: 'CMB' }] }, caption: 'Starlight’s energy density falling as 1/d² against the CMB’s constant level (log–log). Where they cross is the answer.' },
        };
      },
    }),
    num({
      id: 'cp-solar-core', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([1.571e7, 1.0e7, 5e6]), v = (ARAD * T ** 4) / 3;
        return {
          prompt: t`A photon gas exerts pressure $P = u/3$. Inside the Sun, where the temperature is $${texNum(T, 4)}$ K${T === 1.571e7 ? ' (the centre)' : ''}, what is the radiation pressure?`,
          answer: v, units: 'Pa', tol: { rel: 0.01 },
          errors: apart([{ value: ARAD * T ** 4, feedback: 'That is the energy density. Isotropic radiation pushes with one third of it.' }, { value: (SIGMA * T ** 4) / CL, feedback: 'Use u = aT⁴ = 4σT⁴/c, then P = u/3.' }], v),
          hints: [t`$u = aT^4$ with $a = 7.566\times10^{-16}$ J m⁻³ K⁻⁴.`, t`$P = \tfrac13aT^4$.`],
          teach: 'Radiation pressure is u/3; it grows as T⁴, so it matters only in the hottest, most massive stars.',
          explain: t`$P = \tfrac13(7.566\times10^{-16})(${texNum(T, 4)})^4 = ${texNum(v, 3)}$ Pa. The Sun’s central pressure is about $2.5\times10^{16}$ Pa (NASA fact sheet), ${T === 1.571e7 ? `so radiation supplies only $${texNum(v / SUN_CORE.P, 2)}$ of it — the gas does the rest` : 'so radiation is a small share of the support'}. In stars of 100 solar masses radiation pressure rivals gas pressure, which is part of why no stars much above a couple of hundred solar masses are found.`,
          visual: uPic({ marks: [[T, 'here'], [T_SUN, 'photosphere']], caption: 'Blackbody energy density against temperature; the radiation pressure is a third of it.' }),
        };
      },
    }),
    mcq({
      id: 'cp-why-not-rj', difficulty: 3,
      prompt: 'The classical (Rayleigh–Jeans) calculation gives every mode kT and predicts infinite energy in a cavity. Which step of the photon-gas calculation removes the infinity?',
      choices: ['Modes with hf ≫ kT hold on average far fewer than one photon, $e^{-hf/kT}$, so their energy share dies exponentially', 'The number of modes per unit energy is finite at high energy', 'The walls cannot emit above a cut-off frequency', 'Photons interact with each other at high energy'],
      answer: 0,
      why: { 1: 'The number of modes grows as ε² without limit; that is the source of the classical catastrophe, not its cure.', 2: 'No cut-off is needed: the spectrum is the same whatever the walls are made of, provided they absorb.', 3: 'Photons in a cavity are an ideal gas to excellent accuracy.' },
      hints: [t`Compare the average energy of a mode, $hf/(e^{hf/kT} - 1)$, with $kT$ when $hf \gg kT$.`, 'The number of modes grows as ε²; something must fall faster than that grows.'],
      teach: 'Quantization starves high-frequency modes: equipartition fails for them exactly as it does for stiff molecular vibrations.',
      explain: t`A mode’s mean energy is $\varepsilon/(e^{\varepsilon/kT} - 1)$: $kT$ when $\varepsilon \ll kT$, but $\varepsilon e^{-\varepsilon/kT}$ when $\varepsilon \gg kT$ — the same freezing-out as T6.3. The exponential beats the $\varepsilon^2$ growth of modes, and the integral converges to $\pi^4/15$.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'ε / kT', ylabel: 'energy density per unit ε (relative)', curves: [{ fn: 'x^3/(e^x - 1)', domain: [0.01, 10], color: 'accent', label: 'Planck', labelAt: 5, labelDy: -10 }, { fn: 'x^2', domain: [0, 1.42], color: 'warn', dash: true, label: 'Rayleigh–Jeans', labelAt: 1.2, labelDx: 10 }] }, caption: 'Planck’s spectrum against the classical ε² law, which agrees only at low energy and then runs off to infinity.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.4', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Fixsen, The Temperature of the Cosmic Microwave Background, ApJ 707, 916 (2009)', url: 'https://doi.org/10.1088/0004-637X/707/2/916' },
    { label: 'Mather et al., Measurement of the CMB spectrum by the COBE FIRAS instrument, ApJ 420, 439 (1994)', url: 'https://doi.org/10.1086/173574' },
    { label: 'NASA Sun Fact Sheet (central temperature and pressure)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html' },
    { label: 'IAU 2015 Resolution B3 (nominal solar values)', url: 'https://www.iau.org/static/resolutions/IAU2015_English.pdf' },
  ],
});
