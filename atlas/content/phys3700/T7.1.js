// The Gibbs factor: a system exchanging particles as well as energy with a
// reservoir at (T, μ) — P(s) ∝ e^(−[E(s) − μN(s)]/kT) and the grand
// partition function. Single sites: Langmuir adsorption on a cryopump's
// charcoal; the hydrogen atom as a site for an electron (Saha), from a star's
// atmosphere to the recombination that released the CMB.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, H, AMU, EV, ME, KEV, vQ, r4, texNum, apart, occPic, ladderPic } from './_stat.js';

const t = String.raw;
const L10 = Math.log10;
const I_H = 13.598434;                                   // eV, hydrogen's ionization energy (NIST ASD)
const saha = (T, ne) => Math.exp(-I_H / (KEV * T)) / (ne * vQ(ME, T));
const M_H2 = 2.016;                                      // u
/** P₀ = kT/v_Q for a structureless gas of mass m (u): the pressure where μ = 0. */
const P0 = (T, m = M_H2) => (KB * T) / vQ(m * AMU, T);
const P0expr = (Tv, m = M_H2) => `(${KB}*(${Tv})*(2*pi*${m * AMU}*${KB}*(${Tv}))^1.5/${H ** 3})`;
// Langmuir coverage at pressure P (Pa), temperature T, binding energy B (eV)
const cover = (P, T, B) => 1 / (1 + (P0(T) / P) * Math.exp(-B / (KEV * T)));
// worked example: hydrogen in a hot star's atmosphere
const EX = { T: 10000, ne: 1e20 };
EX.vq = vQ(ME, EX.T); EX.b = Math.exp(-I_H / (KEV * EX.T)); EX.r = saha(EX.T, EX.ne); EX.x = EX.r / (1 + EX.r);

/** Saha's ratio n_p/n_H against temperature on a log scale. */
function sahaPic({ ne, T = null, x = [3000, 11000], y = [-8, 4], caption }) {
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'log₁₀ (ionized / neutral)', curves: [{ fn: `log10(e^(-${I_H}/(${KEV}*x))/(${ne}*(${H}/sqrt(2*pi*${ME}*${KB}*x))^3))`, domain: x, color: 'accent' }], hlines: [{ y: 0, color: 'ink3', label: 'half ionized' }], vlines: T === null ? [] : [{ x: T, color: 'gold' }] },
    caption,
  };
}
const langPic = ({ T, B, P = null, caption }) => ({
  type: 'graph',
  params: { x: [-9, 3], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'hydrogen pressure (Pa)', ylabel: 'fraction of sites filled', curves: [{ fn: `1/(1 + ${P0(T)}/10^x*e^(-${B}/(${KEV}*${T})))`, domain: [-9, 3], color: 'accent' }], vlines: P === null ? [] : [{ x: r4(L10(P)), color: 'gold' }] },
  caption,
});

export default lesson({
  id: 'phys3700.T7.1',
  title: 'The Gibbs factor',
  minutes: 15, difficulty: 3,
  intro: t`Let the small system trade **particles** with the reservoir as well as energy: an adsorption site on a surface, a hydrogen atom that may hold an electron, one quantum state that may hold some number of photons or electrons. Now taking energy $E$ and $N$ particles from the reservoir changes its entropy by $-(E - \mu N)/T$, since $\partial S/\partial N = -\mu/T$ ([T3.3](#/lesson/phys3700.T3.3)). The Boltzmann factor becomes the **Gibbs factor**:

$$P(s) = \frac{1}{\mathcal Z}\,e^{-[E(s) - \mu N(s)]/kT},$$

with the **grand partition function** $\mathcal Z = \sum_s e^{-[E(s) - \mu N(s)]/kT}$ making the probabilities add to one. A reservoir with high $\mu$ pushes particles into the system; one with low $\mu$ pulls them out.`,
  symbols: [
    { tex: 'P(s)', text: 'the probability of state $s$ of the small system' },
    { tex: 'E(s)', text: 'the energy of that state, in J or eV (a bound particle has negative $E$)' },
    { tex: 'N(s)', text: 'the number of particles the system holds in that state' },
    { tex: '\\mu', text: 'the chemical potential of the reservoir, in J or eV: the free-energy cost of adding one particle to it (for an ideal gas, $\\mu = -kT\\ln(V Z_\\text{int}/Nv_Q)$, T6.5)' },
    { tex: 'kT', text: 'the reservoir’s thermal energy' },
    { tex: '\\mathcal Z', text: 'the grand partition function, the sum of Gibbs factors over all states with any number of particles' },
  ],
  why: 'The Gibbs factor gives the occupancy of a single quantum state — the starting point of Fermi–Dirac and Bose–Einstein statistics (T7.2) — and it governs ionization in stars and plasmas, adsorption in vacuum pumps, and binding in biology.',
  visual: {
    type: 'graph',
    title: 'Filling a cold surface',
    lead: t`A cryopump traps gas on cold charcoal. Model each site as empty or holding one H₂ molecule bound by energy $B$; the gas around it is the reservoir, with $\mu$ set by its pressure. The Gibbs factor gives the filled fraction $1/(1 + e^{(-B - \mu)/kT})$ — Langmuir’s isotherm. Change the temperature and the binding.`,
    tasks: [
      'At 20 K and B = 0.05 eV, half the sites fill at about 3 × 10⁻⁶ Pa: the surface holds hydrogen down to a high vacuum.',
      'Warm the panel to 40 K: the curve shifts right by many decades — the trapped gas comes off. That is how a cryopump is regenerated.',
      'Raise B: each 0.01 eV of extra binding at 20 K moves the curve about 2.5 decades to lower pressure.',
    ],
    params: {
      x: [-9, 3], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'hydrogen pressure (Pa)', ylabel: 'fraction of sites filled',
      sliders: [
        { key: 'T', label: 'Panel temperature $T$', min: 10, max: 60, step: 1, value: 20, unit: '\\text{K}', explain: 'Cryopump panels run near 10–20 K and are warmed to release what they hold.' },
        { key: 'B', label: 'Binding energy $B$', min: 0.02, max: 0.1, step: 0.005, value: 0.05, unit: '\\text{eV}', explain: 'Energy to pull one molecule off a site; physisorbed H₂ on activated carbon is around 0.04–0.07 eV.' },
      ],
      curves: [{ fn: `1/(1 + ${P0expr('T')}/10^x*e^(-B/(${KEV}*T)))`, domain: [-9, 3], color: 'accent' }],
      hlines: [{ y: 0.5, color: 'ink4' }],
      readouts: [
        { label: 'half-full pressure (Pa)', expr: `${P0expr('T')}*e^(-B/(${KEV}*T))`, digits: 3, zero: 0 },
        { label: '$kT$ (eV)', expr: `${KEV}*T`, digits: 3 },
      ],
    },
    caption: 'Langmuir’s model: independent sites of one binding energy, H₂ as an ideal gas with no rotation (true for para-hydrogen this cold). Real charcoal has a spread of binding energies, so real isotherms are broader.',
  },
  example: {
    prompt: t`In the atmosphere of a hot star at $${EX.T}$ K, free electrons have density $n_e \approx 10^{20}\ \text{m}^{-3}$. Treat each proton as a “site” that is empty (ionized, $E = 0$, $N = 0$) or holds one electron in hydrogen’s ground state ($E = -${fmt(I_H, 5)}$ eV, $N = 1$, two spin states). What is the ratio of ionized to neutral hydrogen?`,
    visual: sahaPic({ ne: EX.ne, T: EX.T, caption: 'The ratio of ionized to neutral hydrogen against temperature at this electron density (Saha’s equation; excited levels of hydrogen ignored). Gold: 10 000 K.' }),
    steps: [
      { label: 'Gibbs factors', text: t`Ionized: $1$. Neutral: $2e^{-(-I - \mu)/kT} = 2e^{(I + \mu)/kT}$, with $I = ${fmt(I_H, 5)}$ eV and the 2 for the electron’s spin.` },
      { label: 'The electron reservoir', text: t`The free electrons are an ideal gas with two spin states: $\mu = -kT\ln\dfrac{2}{n_ev_Q}$, where $v_Q = (h/\sqrt{2\pi m_ekT})^3 = ${texNum(EX.vq, 3)}\ \text{m}^3$ at $${EX.T}$ K.` },
      { label: 'Ratio', text: t`$\dfrac{P_\text{ion}}{P_\text{neutral}} = \dfrac{e^{-\mu/kT}e^{-I/kT}}{2} = \dfrac{e^{-I/kT}}{n_ev_Q}$ — the spin factors cancel. Here $e^{-I/kT} = ${texNum(EX.b, 3)}$ and $n_ev_Q = ${texNum(EX.ne * EX.vq, 3)}$.` },
      { label: 'Answer', text: t`Ratio $= ${fmt(EX.r, 3)}$: about $${Math.round(100 * EX.x)}\,\%$ of the hydrogen is ionized, although $kT = ${fmt(KEV * EX.T, 3)}$ eV is only a sixteenth of $I$.` },
      { label: 'Sense check', text: t`A tiny Boltzmann factor is beaten by an enormous number of free-electron states, $1/(n_ev_Q) \approx ${texNum(1 / (EX.ne * EX.vq), 2)}$. Entropy ionizes the gas long before $kT$ reaches $I$ — this is Saha’s equation, and why stellar spectra change so sharply with temperature.` },
    ],
    answer: t`Ionized : neutral $\approx ${fmt(EX.r, 3)}$, about $${Math.round(100 * EX.x)}\,\%$ ionized.`,
  },
  practice: [
    num({
      id: 'site', difficulty: 1,
      gen(r) {
        const x = r.pick([-3, -1, 0.5, 2]), v = 1 / (Math.exp(x) + 1);
        return {
          prompt: t`A site is either empty or holds one particle with energy $\varepsilon$. The reservoir has chemical potential $\mu$, with $(\varepsilon - \mu)/kT = ${x}$. What is the probability that the site is occupied?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - v, feedback: 'That is the probability that it is empty.' }, { value: Math.exp(-x), feedback: t`That is the ratio occupied : empty. The probability divides by $\mathcal Z = 1 + e^{-(\varepsilon - \mu)/kT}$.` }], v),
          hints: [t`Gibbs factors: empty $1$; occupied $e^{-(\varepsilon - \mu)/kT}$.`, t`$P = \dfrac{e^{-${x}}}{1 + e^{-${x}}} = \dfrac{1}{e^{${x}} + 1}$.`],
          teach: t`A one-particle site is filled with probability $1/(e^{(\varepsilon - \mu)/kT} + 1)$.`,
          explain: t`$\mathcal Z = 1 + e^{-(${x})}$, so $P = 1/(e^{${x}} + 1) = ${fmt(v, 3)}$. Below $\mu$ ($\varepsilon < \mu$) the site is mostly full; above it, mostly empty.`,
          visual: occPic({ which: ['fd'], y: [0, 1.15], labels: false, caption: 'Occupancy of a single-particle site against (ε − μ)/kT. (This is the Fermi–Dirac function of T7.2.)' }),
        };
      },
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: 'Order the steps that give the Gibbs factor.',
      items: [
        'System and reservoir share fixed totals of energy and of particles.',
        t`$P(s) \propto \Omega_R = e^{S_R/k}$, the reservoir’s count when the system is in $s$.`,
        t`Expand: $\Delta S_R = -\dfrac{E(s)}{T} + \dfrac{\mu N(s)}{T}$.`,
        t`So $P(s) \propto e^{-[E(s) - \mu N(s)]/kT}$.`,
        t`Normalize with $\mathcal Z = \sum_s e^{-[E(s) - \mu N(s)]/kT}$.`,
      ],
      hints: [t`The thermodynamic identity for the reservoir: $dS = dU/T - \mu\,dN/T$.`, 'Start from the setting and the equal likelihood of whole-system microstates; normalizing comes last.'],
      teach: t`The Gibbs factor is $e^{\Delta S_R/k}$ when the reservoir gives up both energy and particles.`,
      explain: t`Giving the system energy $E$ costs the reservoir $E/T$ of entropy; giving it $N$ particles costs $-\mu N/T$ (the reservoir loses $\partial S/\partial N = -\mu/T$ per particle). Exponentiate and normalize.`,
      visual: ladderPic([{ E: 0, p: 0.3, label: 'empty (N = 0)' }, { E: -1, p: 0.7, label: 'filled (N = 1)' }], { y: [-1.5, 0.6], xlabel: 'probability (example)', ylabel: 'energy (units of the binding energy)', caption: 'A one-particle site’s two states; with the reservoir’s μ set suitably, the bound state can win even at high temperature.' }),
    }),
    num({
      id: 'cryopump', difficulty: 2, transfer: true,
      gen(r) {
        const T = r.pick([15, 20, 25]), B = r.pick([0.04, 0.05, 0.06]), P = r.pick([1e-6, 1e-5, 1e-4]), v = cover(P, T, B);
        return {
          prompt: t`A cryopump panel at $${T}$ K holds H₂ on sites with binding energy $${B}$ eV. For H₂ (2.016 u, no rotation this cold), $P_0 = kT/v_Q = ${texNum(P0(T), 3)}$ Pa at this temperature, and the gas’s $\mu = kT\ln(P/P_0)$. What fraction of sites is filled when the hydrogen pressure is $${texNum(P, 1)}$ Pa?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / (1 + (P0(T) / P) * Math.exp(B / (KEV * T))), feedback: 'A bound molecule has energy −B: the occupied Gibbs factor is e^(+B/kT) × e^(μ/kT).' }, { value: (P / P0(T)) * Math.exp(B / (KEV * T)), feedback: 'That is the ratio filled : empty. Divide by 1 + that ratio.' }], v),
          hints: [t`Filled : empty $= e^{(B + \mu)/kT} = \dfrac{P}{P_0}e^{B/kT}$.`, t`$e^{B/kT} = e^{${fmt(B / (KEV * T), 3)}}$; fraction $= \dfrac{\text{ratio}}{1 + \text{ratio}}$.`],
          teach: 'Langmuir’s isotherm is the Gibbs factor of a one-molecule site: coverage = P/(P + P₀e^(−B/kT)).',
          explain: t`Ratio $= \dfrac{${texNum(P, 1)}}{${texNum(P0(T), 3)}}e^{${fmt(B / (KEV * T), 3)}} = ${texNum((P / P0(T)) * Math.exp(B / (KEV * T)), 3)}$, so the coverage is $${texNum(v, 3)}$.`,
          visual: langPic({ T, B, caption: 'Langmuir isotherm for these sites and this panel temperature (log pressure scale).' }),
        };
      },
    }),
    mcq({
      id: 'mu-meaning', difficulty: 2,
      prompt: t`Two otherwise identical adsorbing surfaces are exposed to the same gas at the same temperature, one at 100 times the pressure of the other. How do their Gibbs factors for a filled site compare?`,
      choices: ['The high-pressure one is 100 times larger, because μ is higher by kT ln 100', 'They are equal, because the binding energy and temperature are the same', 'The high-pressure one is ln 100 times larger', 'The high-pressure one is smaller, because a denser gas has more entropy per molecule'],
      answer: 0,
      why: { 1: 'The reservoir differs: its μ rises with pressure, and μ multiplies N in the exponent.', 2: t`The factor is $e^{\mu/kT}$, and $\mu$ rises by $kT\ln100$: the factor rises by 100, not by $\ln 100$.`, 3: 'A denser gas has less entropy per molecule, hence a higher μ: it pushes molecules onto the surface harder.' },
      hints: [t`For an ideal gas, $\mu = kT\ln(P/P_0)$.`, t`The filled site’s Gibbs factor contains $e^{\mu/kT}$.`],
      teach: 'Raising a gas’s pressure raises its μ by kT ln(P₂/P₁), multiplying every filled-state Gibbs factor by P₂/P₁.',
      explain: t`$e^{\mu/kT} = P/P_0$, so the filled factor is proportional to pressure — at low coverage the amount adsorbed grows linearly with $P$, the low-pressure end of Langmuir’s isotherm.`,
      visual: langPic({ T: 20, B: 0.05, caption: 'At low pressure the filled fraction rises in proportion to P; at high pressure it saturates.' }),
    }),
    num({
      id: 'two-sites', difficulty: 3,
      gen(r) {
        const x = r.pick([-2, -1, 0, 1]), z = Math.exp(-x), v = (z * z) / (1 + z) ** 2;
        return {
          prompt: t`A molecule has two independent binding sites, each empty or holding one particle of energy $\varepsilon$, with $(\varepsilon - \mu)/kT = ${x}$. What is the probability that **both** are filled?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: z * z / (1 + 2 * z), feedback: 'There are two singly-filled states (either site), plus the doubly-filled one: 𝒵 = 1 + 2x + x².' }, { value: z / (1 + z), feedback: 'That is one site’s probability. Both together: square it.' }], v),
          hints: [t`States: empty (factor 1), one filled (2 ways, $x$ each), both filled ($x^2$), with $x = e^{-(\varepsilon - \mu)/kT}$.`, t`$\mathcal Z = (1 + x)^2$, so $P(\text{both}) = x^2/(1 + x)^2$.`],
          teach: 'Independent sites multiply their grand partition functions, just as independent parts multiply Z.',
          explain: t`$x = e^{${-x}} = ${fmt(z, 4)}$: $P = ${fmt(z, 4)}^2/(1 + ${fmt(z, 4)})^2 = ${fmt(v, 3)}$. Real binding sites often interact (haemoglobin’s four sites bind oxygen cooperatively), which this independent model leaves out.`,
          visual: ladderPic([{ E: 0, p: 0.25, label: 'empty', g: 1 }, { E: 1, p: 0.5, label: 'one filled', g: 2 }, { E: 2, p: 0.25, label: 'both filled', g: 1 }], { y: [-0.4, 2.6], xlabel: 'number of ways (as a share of the 4)', ylabel: 'particles held, N', caption: 'The two-site molecule’s states grouped by the number held, with how many ways each can happen (not their probabilities).' }),
        };
      },
    }),
    num({
      id: 'saha-sun', difficulty: 3,
      gen(r) {
        const T = r.pick([5000, 5772, 6500]), ne = r.pick([1e19, 1e20]), v = saha(T, ne);
        return {
          prompt: t`Saha’s equation for hydrogen (from the Gibbs factor, as in the worked example) is $\dfrac{n_p}{n_\text{H}} = \dfrac{e^{-I/kT}}{n_ev_Q}$ with $I = 13.6$ eV and $v_Q = (h/\sqrt{2\pi m_ekT})^3$ for electrons. In a gas at $${T}$ K with $n_e = ${texNum(ne, 1)}\ \text{m}^{-3}$, roughly like the Sun’s photosphere, what is $n_p/n_\text{H}$?`,
          answer: v, tol: { rel: 0.02 },
          errors: apart([{ value: Math.exp(-I_H / (KEV * T)), feedback: 'That is the Boltzmann factor alone; divide by n(e)v(Q) — the electron’s many free states.' }, { value: v * 2, feedback: 'The spin factors of the free and bound electron cancel; there is no 2.' }], v),
          hints: [t`$kT = ${fmt(KEV * T, 4)}$ eV; $e^{-I/kT} = ${texNum(Math.exp(-I_H / (KEV * T)), 3)}$.`, t`$v_Q = ${texNum(vQ(ME, T), 3)}\ \text{m}^3$.`],
          teach: 'Ionization balance is a Boltzmann factor divided by the free particle’s n·v(Q): entropy versus energy.',
          explain: t`$n_ev_Q = ${texNum(ne * vQ(ME, T), 3)}$, so $n_p/n_\text{H} = ${texNum(v, 3)}$: almost all the hydrogen is neutral, which is why the Sun shows hydrogen absorption lines at all.`,
          visual: sahaPic({ ne, x: [3000, 11000], y: [-8, 4], caption: 'Ionized-to-neutral ratio of hydrogen against temperature at this electron density (Saha).' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-recombination', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([3500, 3700, 3900, 4200]), ne = 1e8, v = saha(T, ne);
        return {
          prompt: t`About 380 000 years after the Big Bang the universe was a hydrogen plasma cooling through a few thousand kelvin, with free electrons at roughly $n_e \approx 10^{8}\ \text{m}^{-3}$. Using Saha’s ratio $n_p/n_\text{H} = e^{-I/kT}/(n_ev_Q)$ with $I = 13.6$ eV, what is $n_p/n_\text{H}$ at $${T}$ K?`,
          answer: v, tol: { rel: 0.02 },
          errors: apart([{ value: Math.exp(-I_H / (KEV * T)), feedback: 'Include the 1/(n(e)v(Q)) factor: at this low density it is about 10¹⁸.' }, { value: 1 / v, feedback: 'Upside down: ionized over neutral.' }], v),
          hints: [t`$kT = ${fmt(KEV * T, 3)}$ eV, so $I/kT = ${fmt(I_H / (KEV * T), 4)}$.`, t`$v_Q = (h/\sqrt{2\pi m_ekT})^3 = ${texNum(vQ(ME, T), 3)}\ \text{m}^3$.`],
          teach: 'In a dilute plasma hydrogen recombines only when kT is far below I — here near a fortieth of it.',
          explain: t`$e^{-I/kT} = ${texNum(Math.exp(-I_H / (KEV * T)), 3)}$, $n_ev_Q = ${texNum(ne * vQ(ME, T), 3)}$: ratio $${texNum(v, 3)}$. The balance tips through 1 near 3700 K, with $kT \approx 0.3$ eV. The full calculation (Peebles 1968) delays recombination somewhat; the universe became transparent near 3000 K, and that light, stretched 1100-fold, is the 2.7 K microwave background (T7.4).`,
          visual: sahaPic({ ne, x: [2500, 5000], y: [-8, 6], caption: 'Saha’s ratio of ionized to neutral hydrogen in the early universe against temperature (n(e) held at 10⁸ m⁻³ for simplicity; really it fell as the gas recombined).' }),
        };
      },
    }),
    num({
      id: 'cp-regenerate', difficulty: 3,
      gen(r) {
        const T2 = r.pick([30, 40, 50]), T1 = 20, B = 0.05, P = 1e-5, v = cover(P, T2, B);
        return {
          prompt: t`A cryopump’s H₂ sites (binding $${B}$ eV) are exposed to $10^{-5}$ Pa of hydrogen. At $${T1}$ K they are ${fmt(100 * cover(P, T1, B), 3)}% full. If the panel warms to $${T2}$ K at the same pressure, what fraction stays filled? ($P_0 = kT/v_Q$ is $${texNum(P0(T2), 3)}$ Pa at $${T2}$ K.)`,
          answer: v, tol: { rel: 0.02 },
          errors: apart([{ value: cover(P, T1, B) * (T1 / T2), feedback: 'Coverage is not inversely proportional to T: the exponential e^(B/kT) dominates.' }, { value: (P / P0(T2)) * Math.exp(-B / (KEV * T2)), feedback: 'The bound state’s factor is e^(+B/kT).' }], v),
          hints: [t`Filled : empty $= \dfrac{P}{P_0}e^{B/kT}$ at the new temperature.`, t`$B/kT = ${fmt(B / (KEV * T2), 3)}$ at $${T2}$ K.`],
          teach: 'Warming a few kelvin collapses the coverage: the factor e^(B/kT) is what holds the gas.',
          explain: t`Ratio $= \dfrac{10^{-5}}{${texNum(P0(T2), 3)}}e^{${fmt(B / (KEV * T2), 3)}} = ${texNum((P / P0(T2)) * Math.exp(B / (KEV * T2)), 3)}$, so the fraction is $${texNum(v, 3)}$. Regeneration — warming the panel — releases nearly all the stored hydrogen to be pumped away.`,
          visual: { type: 'graph', params: { x: [-9, 3], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'hydrogen pressure (Pa)', ylabel: 'fraction of sites filled', curves: [{ fn: `1/(1 + ${P0(T1)}/10^x*e^(-${B}/(${KEV}*${T1})))`, domain: [-9, 3], color: 'accent', label: `${T1} K`, labelAt: -5.6, labelDx: -40 }, { fn: `1/(1 + ${P0(T2)}/10^x*e^(-${B}/(${KEV}*${T2})))`, domain: [-9, 3], color: 'warn', label: `${T2} K`, labelAt: 0, labelDx: 8 }], vlines: [{ x: -5, color: 'gold' }] }, caption: 'Langmuir isotherms at the two panel temperatures; gold: the pressure in the pump.' },
        };
      },
    }),
    mcq({
      id: 'cp-why-ionized', difficulty: 3,
      prompt: t`At 10 000 K, $kT$ is under a tenth of hydrogen’s 13.6 eV ionization energy, yet in a star’s atmosphere most of the hydrogen is ionized. Why?`,
      choices: ['A free electron has vastly more states available (1/(n v(Q)) ≫ 1), so entropy outweighs the energy cost', 'Collisions at 10 000 K regularly carry 13.6 eV', 'The Boltzmann factor e^(−13.6 eV/kT) is close to 1 at that temperature', 'Radiation pressure pushes electrons off the atoms'],
      answer: 0,
      why: { 1: 'Some collisions do, but rarely: e^(−I/kT) ~ 10⁻⁷. What wins is how many ways the freed electron can be placed.', 2: t`$e^{-15.8} \approx 10^{-7}$: tiny.`, 3: 'Pressure plays no part in this balance; the Gibbs factor already accounts for everything that matters at equilibrium.' },
      hints: [t`Write the ratio as $e^{-I/kT}$ times $1/(n_ev_Q)$ and estimate each.`, t`At $10^{20}$ electrons per m³ and 10 000 K, $v_Q \approx 4\times10^{-28}\ \text{m}^3$.`],
      teach: 'Ionization is decided by free energy: the energy cost I against the entropy gain k ln(1/n v(Q)).',
      explain: t`$e^{-I/kT} \approx 10^{-7}$, but $1/(n_ev_Q) \approx 10^{7}$–$10^{8}$ at stellar densities: they are comparable, so ionization happens at temperatures where $kT \approx I/15$. At lower densities (the early universe) the entropy factor is larger still.`,
      visual: sahaPic({ ne: 1e20, caption: 'Hydrogen’s ionized-to-neutral ratio against temperature at a stellar-atmosphere electron density.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Atomic Spectra Database: ionization energy of hydrogen', url: 'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html' },
    { label: 'Peebles, Recombination of the Primeval Plasma, ApJ 153, 1 (1968)', url: 'https://doi.org/10.1086/149628' },
    { label: 'Langmuir, The adsorption of gases on plane surfaces of glass, mica and platinum, J. Am. Chem. Soc. 40, 1361 (1918)', url: 'https://doi.org/10.1021/ja02242a004' },
  ],
});
