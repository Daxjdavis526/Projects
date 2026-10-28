// The Boltzmann factor: a small system in contact with a reservoir — the
// probability of one of its states is proportional to the number of
// reservoir microstates left, e^(S_R/k), and S_R falls by E/T. States versus
// levels (degeneracy), reading a temperature off populations (a Boltzmann
// plot), and real level schemes: N₂ vibration in a combustion chamber,
// atomic oxygen's fine structure, caesium's clock transition.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, EV, HCK, DIATOMIC, KEV, r4, texNum, apart, ladderPic, tag } from './_stat.js';
import { einPic } from './_count.js';

const t = String.raw;
const TH_N2 = DIATOMIC.N2.nu * HCK;                  // N₂ vibrational quantum as a temperature, K
// Atomic oxygen's ground term (NIST ASD): ³P₂ (5 states) at 0, ³P₁ (3) at 158.265 cm⁻¹, ³P₀ (1) at 226.977 cm⁻¹
const O1 = 158.265, O0 = 226.977;
const CS_NU = 9192631770;                            // Hz, the caesium-133 hyperfine frequency (exact: it defines the second)
const H = 6.62607015e-34;

// the worked example: N₂ in a 3500 K combustion chamber
const EX = { T: 3500 };
EX.r = Math.exp(-TH_N2 / EX.T); EX.p0 = 1 - EX.r;

/** e^(−E/kT) against E (meV) at one or two temperatures. */
function boltzPic({ Ts, Emax, mark = null, caption, markLabel = '' }) {
  const cols = ['accent', 'warn'];
  const curves = Ts.map((T, i) => ({ fn: `e^(-x/${r4(KEV * 1000 * T)})`, domain: [0, Emax], color: cols[i], label: `${T} K`, labelAt: r4(Emax * (0.25 + 0.25 * i)), labelDx: 6, labelDy: -8 }));
  return {
    type: 'graph',
    params: { x: [0, Emax], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'energy of the state above the ground state (meV)', ylabel: 'e^(−E/kT)', curves,
      vlines: mark === null ? [] : [{ x: r4(mark), color: 'gold', label: markLabel }] },
    caption,
  };
}
const oLadder = (caption) => ladderPic([
  { E: 0, p: 1, g: 5, label: '³P₂' }, { E: r4(O1 / 8.065544), p: 0.6, g: 3, label: '³P₁' }, { E: r4(O0 / 8.065544), p: 0.2, g: 1, label: '³P₀' },
], { y: [-3, 34], x: [0, 1.5], xlabel: 'number of states (relative to the ground level)', ylabel: 'energy (meV)', caption });

export default lesson({
  id: 'phys3700.T6.1',
  title: 'The Boltzmann factor',
  minutes: 14, difficulty: 3,
  intro: t`Put a small system — one atom, one molecule, one oscillator — in thermal contact with a big **reservoir** at temperature $T$. When the small system is in a particular state $s$ with energy $E(s)$, the reservoir has the rest of the energy. Every microstate of the whole is equally likely, so the chance of $s$ is proportional to the number of reservoir microstates left over, $\Omega_R = e^{S_R/k}$. Handing $E(s)$ to the small system lowers the reservoir’s entropy by $E(s)/T$ — that is what $1/T = \partial S/\partial U$ means — so

$$P(s) = \frac{1}{Z}\,e^{-E(s)/kT}.$$

The exponential is the **Boltzmann factor**. It is the probability of one *state*: a level with $g$ states gets $g$ times as much. [PHYS 2710, MP10.1](#/lesson/phys2710.MP10.1) used it as a rule; here it is derived, and everything in T6 and T7 grows from it.`,
  symbols: [
    { tex: 'P(s)', text: 'the probability that the small system is in the one state $s$' },
    { tex: 'E(s)', text: 'the energy of that state, in J (or eV); only differences matter, so the zero is yours to choose' },
    { tex: 'k', text: 'Boltzmann’s constant, $1.380649\\times10^{-23}$ J/K $= 8.617\\times10^{-5}$ eV/K' },
    { tex: 'T', text: 'the temperature of the **reservoir**, in K — the small system need not have a temperature of its own' },
    { tex: 'e^{-E(s)/kT}', text: 'the Boltzmann factor: it falls by a factor $e$ for every $kT$ of energy' },
    { tex: 'Z', text: 'the partition function, $\\sum_s e^{-E(s)/kT}$: the sum that makes the probabilities add to 1 (lesson T6.2)' },
  ],
  why: 'Every population in physics at equilibrium — excited atoms in a star or a flame, molecules in a nozzle, electrons in a semiconductor, speeds in a gas — is a Boltzmann factor, and the partition function, equipartition and the Maxwell distribution all follow from it.',
  visual: {
    type: 'th-einstein',
    title: 'One oscillator against a reservoir',
    lead: t`Solid A is a **single** oscillator; solid B, with many oscillators, is the reservoir. The bars count the microstates of the whole for each energy $q_A$ of the one oscillator — and since A has only one state per $q_A$, every bar is just $\Omega_B$. Switch to the log scale and look at the shape.`,
    tasks: [
      'On the log scale the bars fall on a straight line: each extra quantum given to A costs the reservoir the same factor of microstates. A straight line on a log scale is an exponential — the Boltzmann factor.',
      'Raise the reservoir’s size N(B) at fixed q: fewer quanta per oscillator means a colder reservoir, and the line gets steeper.',
      'Press Play: the oscillator spends most of its time in the lowest states, in the proportions the bars predict.',
    ],
    params: { mode: 'pair', NA: 1, NB: 50, q: 30, start: 'even', scale: 'log', panels: 'bars', controls: ['NB', 'q', 'scale', 'play'], ranges: { NB: [10, 200], q: [10, 60] }, hide: ['width'] },
    caption: 'An exact count, with an Einstein solid as the reservoir. The line bends slightly when A holds many quanta, where the reservoir is no longer big compared with what it gives away.',
  },
  example: {
    prompt: t`A rocket’s combustion chamber holds nitrogen at $${EX.T}$ K. N₂’s vibrational quantum is $hc\tilde\nu$ with $\tilde\nu = ${DIATOMIC.N2.nu}\ \text{cm}^{-1}$, equal to $k\times${fmt(TH_N2, 4)}$ K. For one molecule, how much less likely is the first vibrational state ($v = 1$) than the ground state, and what fraction of the molecules is vibrationally unexcited?`,
    visual: ladderPic([0, 1, 2, 3, 4].map((v) => ({ E: v, p: EX.p0 * EX.r ** v, label: `v = ${v}` })), { y: [-0.4, 4.6], x: [0, 1], showG: false, xlabel: 'share of the molecules', ylabel: 'energy above the ground state (quanta)', caption: 'N₂’s vibrational ladder at 3500 K, each bar as long as its share of the molecules (rotation ignored; levels treated as evenly spaced).' }),
    steps: [
      { label: 'The reservoir', text: t`One molecule’s vibration is the small system; every other degree of freedom of every other molecule in the chamber is the reservoir at $${EX.T}$ K.` },
      { label: 'Ratio', text: t`$\dfrac{P(v{=}1)}{P(v{=}0)} = e^{-(E_1 - E_0)/kT} = e^{-${fmt(TH_N2, 4)}/${EX.T}} = ${fmt(EX.r, 3)}$. The unknown $Z$ cancels from any ratio.` },
      { label: 'Normalise', text: t`States $v = 0, 1, 2, \ldots$ have probabilities in the ratio $1 : r : r^2 : \cdots$ with $r = ${fmt(EX.r, 3)}$. They sum to $1/(1 - r)$, so $P(v{=}0) = 1 - r = ${fmt(EX.p0, 3)}$.` },
      { label: 'Sense check', text: t`At room temperature $r = e^{-${fmt(TH_N2, 4)}/300} = ${texNum(Math.exp(-TH_N2 / 300), 2)}$: vibration is frozen out, as T1.2 found. The zero-point energy $\tfrac12 hc\tilde\nu$ shifts every level equally and cancels from every ratio.` },
    ],
    answer: t`$P(1)/P(0) = ${fmt(EX.r, 3)}$; about $${fmt(100 * EX.p0, 2)}\,\%$ of the molecules are in $v = 0$.`,
  },
  practice: [
    num({
      id: 'ratio', difficulty: 1,
      gen(r) {
        const dE = r.pick([10, 25, 50, 100]), T = r.pick([77, 300, 1000]), x = dE / (1000 * KEV * T), v = Math.exp(-x);
        return {
          prompt: t`Two states of an atom differ in energy by $${dE}$ meV. In equilibrium at $${T}$ K, what is $P(\text{upper})/P(\text{lower})$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.exp(x), feedback: 'The upper state is the less likely one: the exponent is −ΔE/kT.' }, { value: x, feedback: t`That is $\Delta E/kT$ itself. The ratio is $e^{-\Delta E/kT}$.` }, { value: Math.exp(-x * 1000), feedback: 'Units: 1 meV is 10⁻³ eV, and kT at this temperature is in the same units.' }], v),
          hints: [t`$kT = (8.617\times10^{-5}\ \text{eV/K})(${T}\ \text{K}) = ${fmt(1000 * KEV * T, 3)}$ meV.`, t`Ratio $= e^{-${dE}/${fmt(1000 * KEV * T, 3)}}$.`],
          teach: t`Two states’ probabilities are in the ratio $e^{-\Delta E/kT}$: $Z$ cancels.`,
          explain: t`$\Delta E/kT = ${fmt(x, 3)}$, so the ratio is $e^{-${fmt(x, 3)}} = ${texNum(v, 3)}$.`,
          visual: boltzPic({ Ts: [T], Emax: 120, mark: dE, markLabel: `${dE} meV`, caption: 'The Boltzmann factor against a state’s energy at this temperature; gold marks the upper state.' }),
        };
      },
    }),
    num({
      id: 'oxygen-fine', difficulty: 2,
      gen(r) {
        const T = r.pick([300, 500, 1000, 1500]), x = (O1 * HCK) / T, v = 0.6 * Math.exp(-x);
        return {
          prompt: t`The ground term of atomic oxygen is split into three levels (NIST data): $^3P_2$ with 5 states at the bottom, $^3P_1$ with 3 states $${O1}\ \text{cm}^{-1}$ higher ($hc/k = 1.4388$ cm·K), and $^3P_0$ with 1 state. At $${T}$ K, how many atoms are in $^3P_1$ for every one in $^3P_2$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.exp(-x), feedback: 'That compares one state with one state. The levels hold 3 and 5 states: multiply by 3/5.' }, { value: (5 / 3) * Math.exp(-x), feedback: 'The degeneracy ratio is upper over lower, 3/5.' }], v),
          hints: [t`Level populations: $N_1/N_2 = \dfrac{g_1}{g_2}e^{-\Delta E/kT}$.`, t`$\Delta E/kT = ${O1}\times1.4388/${T} = ${fmt(x, 3)}$.`],
          teach: 'The Boltzmann factor weights a state; a level’s population is its number of states times that factor.',
          explain: t`$N(^3P_1)/N(^3P_2) = \tfrac35 e^{-${fmt(x, 3)}} = ${fmt(v, 3)}$. ${T >= 1000 ? 'In the thermosphere, near this temperature, collisions keep refilling ³P₁; its decay at 63 μm radiates heat to space, one of the upper atmosphere’s main coolants.' : 'The infrared line at 63 μm from ³P₁ is among the brightest cooling lines of warm interstellar gas.'}`,
          visual: oLadder('Atomic oxygen’s ground term: bars show how many states each level holds, not its population. Energies from the NIST Atomic Spectra Database.'),
        };
      },
    }),
    num({
      id: 'find-T', difficulty: 2,
      gen(r) {
        const dE = r.pick([0.05, 0.1, 0.2]), ratio = r.pick([0.01, 0.05, 0.2]), T = dE / (KEV * Math.log(1 / ratio));
        return {
          prompt: t`Two nondegenerate states are $${dE}$ eV apart. In equilibrium the upper one is occupied $${ratio}$ times as often as the lower. What is the temperature?`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: dE / (KEV * ratio), feedback: 'Solve with a logarithm: ratio = e^(−ΔE/kT), so kT = ΔE / ln(1/ratio).' }, { value: dE / (KEV * Math.log10(1 / ratio)), feedback: 'Use the natural logarithm.' }], T),
          hints: [t`$e^{-\Delta E/kT} = ${ratio}$, so $\Delta E/kT = \ln(1/${ratio})$.`, t`$T = \dfrac{${dE}\ \text{eV}}{(8.617\times10^{-5}\ \text{eV/K})\ln(1/${ratio})}$.`],
          teach: t`A population ratio is a thermometer: $kT = \Delta E/\ln(N_\text{lower}/N_\text{upper})$.`,
          explain: t`$\ln(1/${ratio}) = ${fmt(Math.log(1 / ratio), 3)}$, so $kT = ${fmt(dE / Math.log(1 / ratio), 3)}$ eV and $T = ${fmt(T, 3)}$ K.`,
          visual: { type: 'graph', params: { x: [0, 3000], y: [0, 0.5], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'P(upper) / P(lower)', curves: [{ fn: `e^(-${r4(dE / KEV)}/x)`, domain: [20, 3000], color: 'accent' }], hlines: [{ y: ratio, color: 'gold', label: `ratio ${ratio}` }] }, caption: 'The population ratio of the two states against temperature. Gold: the measured ratio — where it meets the curve is the answer.' },
        };
      },
    }),
    mcq({
      id: 'most-probable', difficulty: 2,
      prompt: t`A molecule in a gas at temperature $T$ can be in any of an enormous number of quantum states. Which **single state** is the most probable?`,
      choices: ['The ground state, at every positive temperature', 'A state with energy near kT', 'A state with energy near (3/2)kT, the average kinetic energy', 'All states are equally likely once T is high enough'],
      answer: 0,
      why: { 1: 'That confuses one state with a band of energies. Near kT there are many more states than near zero, so the *energy* kT can be likelier — but each of those states is less likely than the ground state.', 2: 'The average energy is set by many states together; the probability of any one state still falls as e^(−E/kT).', 3: 'Only when kT is far above every energy considered: the factor e^(−E/kT) is then close to 1, but it is still largest for the lowest state.' },
      hints: ['The Boltzmann factor is the probability of one state. Where is e^(−E/kT) largest?'],
      teach: 'The ground state is always the single most probable state; the most probable energy can be higher because many states share it.',
      explain: t`$e^{-E/kT}$ falls with $E$, so the lowest state wins at any positive $T$. A gas’s most probable *energy* is not zero because the number of states grows with energy (the Maxwell distribution, T6.4, is that product).`,
      visual: boltzPic({ Ts: [300, 1000], Emax: 200, caption: 'The Boltzmann factor at two temperatures. Hotter flattens the curve, but it still falls from its largest value at E = 0.' }),
    }),
    order({
      id: 'derive', difficulty: 3,
      prompt: 'Put the steps of the derivation of the Boltzmann factor in order.',
      items: [
        'A small system and a large reservoir share a fixed total energy.',
        'Every microstate of the whole is equally likely.',
        t`So $P(s) \propto \Omega_R(U_0 - E(s))$, the reservoir’s count.`,
        t`Write $\Omega_R = e^{S_R/k}$.`,
        t`The reservoir is huge, so $S_R(U_0 - E) \approx S_R(U_0) - E/T$.`,
        t`Hence $P(s) \propto e^{-E(s)/kT}$.`,
      ],
      hints: ['Start with the setting and the fundamental assumption; the reservoir’s temperature appears only when its entropy is expanded.', t`The expansion uses $\partial S_R/\partial U = 1/T$.`],
      teach: t`The Boltzmann factor is the reservoir’s entropy cost, $e^{\Delta S_R/k}$, of handing the small system its energy.`,
      explain: t`The small system’s state fixes how much energy the reservoir has, hence how many microstates it can be in. One term of the Taylor expansion of $S_R$ suffices because $E$ is tiny next to $U_0$; its slope is $1/T$.`,
      visual: einPic({ mode: 'pair', NA: 1, NB: 60, q: 40, start: 'even', scale: 'log', panels: 'bars', xr: [0, 15] }, 'One oscillator against a 60-oscillator reservoir: the count of whole-system microstates for each energy of the one oscillator, on a log scale.'),
    }),
    mcq({
      id: 'reservoir', difficulty: 2,
      prompt: t`A single hydrogen atom sits in a star’s atmosphere. In $e^{-E/kT}$, whose temperature is $T$?`,
      choices: ['The surrounding gas and radiation it exchanges energy with — the reservoir', 'The atom’s own temperature, worked out from its kinetic energy', 'The temperature at which the atom would be ionized', 'The temperature of the star’s core, where the energy is made'],
      answer: 0,
      why: { 1: 'A single atom has no temperature of its own; its energy fluctuates. T belongs to the large system it is in contact with.', 2: 'An ionization temperature is a property of the atom’s levels, not the environment’s hotness.', 3: 'The atom exchanges energy only with its local surroundings; the core is not in contact with it.' },
      hints: [t`In the derivation, $T$ came from $\partial S_R/\partial U$. Which system’s entropy was that?`],
      teach: 'T in the Boltzmann factor is the reservoir’s temperature.',
      explain: 'The derivation expanded the reservoir’s entropy, so T is the reservoir’s. The small system can be one atom, or one spin, or one mode: it needs no temperature of its own.',
      visual: einPic({ mode: 'pair', NA: 1, NB: 100, q: 50, start: 'even', scale: 'log', panels: 'bars', xr: [0, 15] }, 'The small system’s statistics are set entirely by how the reservoir’s microstate count changes with energy.'),
    }),
    num({
      id: 'boltzmann-plot', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([2500, 3000, 3500, 4000]), E1 = r.pick([1.0, 1.5]), E2 = E1 + r.pick([1.5, 2]);
        const y1 = r4(-E1 / (KEV * T)), y2 = r4(-E2 / (KEV * T)), ans = -(E2 - E1) / (KEV * (y2 - y1));
        const pts = [[0, 0], [E1, y1], [E2, y2]];
        return {
          prompt: t`Engineers measure a rocket flame’s temperature from the brightness of several spectral lines of one atom. Each line gives the population $N_i$ of its upper level, and a plot of $\ln(N_i/g_i)$ against the level’s energy $E_i$ is a straight line. Two points on it are $(${E1}\ \text{eV},\ ${y1})$ and $(${E2}\ \text{eV},\ ${y2})$ (relative to the ground level). What is the flame temperature?`,
          answer: ans, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: (y1 - y2) / (E2 - E1), feedback: 'That is 1/kT in eV⁻¹. Invert it, then divide by k in eV/K.' }, { value: -(E2 - E1) / (y2 - y1), feedback: 'That is kT in eV. Divide by k = 8.617 × 10⁻⁵ eV/K for the temperature.' }], ans),
          hints: [t`$\ln(N_i/g_i) = \text{const} - E_i/kT$: the slope is $-1/kT$.`, t`Slope $= (${y2} - ${y1})/(${E2} - ${E1})$ per eV, so $kT = -1/\text{slope}$ in eV.`],
          teach: 'A Boltzmann plot — ln(N/g) against E — is a straight line of slope −1/kT.',
          explain: t`Slope $= ${fmt((y2 - y1) / (E2 - E1), 4)}\ \text{eV}^{-1}$, so $kT = ${fmt(-(E2 - E1) / (y2 - y1), 4)}$ eV and $T = ${fmt(ans, 4)}$ K. Dividing by $g_i$ first matters: it turns level populations into state probabilities.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [r4(Math.min(y2, -1) * 1.15), 1], aspect: 'wide', axesAt: 'edge', xlabel: 'level energy Eᵢ (eV)', ylabel: 'ln(Nᵢ/gᵢ)', curves: [{ fn: `${r4((y2 - y1) / (E2 - E1))}*x`, domain: [0, 3.8], color: 'accent', dash: true }], points: pts.map(([x, y]) => ({ x, y, r: 5, color: 'gold' })) }, caption: 'A Boltzmann plot from a flame spectrum (idealized: real points scatter about the line). Its slope is −1/kT.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cesium', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([290, 300, 320, 350, 380]), x = (H * CS_NU) / (KB * T), v = (9 / 7) * Math.exp(-x);
        return {
          prompt: t`A caesium atomic clock (GPS satellites carry them) counts the $9\,192\,631\,770$ Hz transition between the two hyperfine levels of the Cs-133 ground state: $F = 4$ with 9 states, above $F = 3$ with 7 states by $h\nu$. In a caesium beam from an oven at $${T}$ K, what is $N(F{=}4)/N(F{=}3)$? Give 4 significant figures.`,
          answer: v, tol: { rel: 0.0003 },
          errors: apart([{ value: Math.exp(-x), feedback: 'That compares one state with one state. The levels hold 9 and 7 states.' }, { value: (7 / 9) * Math.exp(-x), feedback: 'Degeneracy ratio upper over lower: 9/7.' }, { value: 9 / 7, feedback: 'Close — but include the Boltzmann factor: it shifts the fourth figure.' }], v, 0.0005),
          hints: [t`$h\nu/kT$ is tiny: compute it.`, t`$\dfrac{N_4}{N_3} = \dfrac{9}{7}e^{-h\nu/kT}$ with $h\nu/kT = ${texNum(x, 3)}$.`],
          teach: 'When ΔE ≪ kT, level populations are set by their degeneracies alone.',
          explain: t`$h\nu/kT = ${texNum(x, 3)}$, so $N_4/N_3 = \tfrac97(1 - ${texNum(x, 3)}) = ${fmt(v, 4)}$. Thermally the two clock levels are populated almost purely by state count, so a clock must **select** or optically pump atoms into one level before it can see the transition at all.`,
          visual: ladderPic([{ E: 0, p: 7 / 9, g: 7, label: 'F = 3' }, { E: 1, p: 1, g: 9, label: 'F = 4' }], { y: [-0.5, 1.6], x: [0, 1.6], xlabel: 'number of states (relative)', ylabel: 'energy (units of hν)', caption: 'Caesium-133’s two ground hyperfine levels, bars proportional to their numbers of states. The spacing hν is about 38 μeV, against kT ≈ 26 meV at room temperature.' }),
        };
      },
    }),
    num({
      id: 'cp-upper-share', difficulty: 3,
      gen(r) {
        const g = r.pick([2, 3, 5]), x = r.pick([0.5, 1, 2, 3]), v = (g * Math.exp(-x)) / (1 + g * Math.exp(-x));
        return {
          prompt: t`A molecule has a nondegenerate ground state and, $\varepsilon$ above it, a level of $${g}$ states; every other level is far too high to matter. At a temperature where $\varepsilon/kT = ${x}$, what fraction of the molecules is in the upper level?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.exp(-x) / (1 + Math.exp(-x)), feedback: 'Count all the upper states: each carries its own Boltzmann factor.' }, { value: g * Math.exp(-x), feedback: 'That is the ratio upper : lower. The fraction divides by the total, 1 + g e^(−ε/kT).' }, { value: 1 / (1 + g * Math.exp(-x)), feedback: 'That is the ground state’s share.' }], v),
          hints: [t`Weights: ground $1$, upper level $${g}e^{-${x}}$.`, t`Fraction $= \dfrac{${g}e^{-${x}}}{1 + ${g}e^{-${x}}}$.`],
          teach: 'Probabilities are Boltzmann weights divided by their sum — the partition function.',
          explain: t`$${g}e^{-${x}} = ${fmt(g * Math.exp(-x), 3)}$, so the upper share is $${fmt(g * Math.exp(-x), 3)}/(1 + ${fmt(g * Math.exp(-x), 3)}) = ${fmt(v, 3)}$.`,
          visual: ladderPic([{ E: 0, p: 1 / (1 + g), g: 1, label: 'ground' }, { E: x, p: g / (1 + g), g, label: 'upper' }], { y: [-0.4, x + 0.8], x: [0, 1.25], xlabel: 'number of states (as a share of all)', ylabel: 'energy (units of kT)', caption: 'The two levels, bars showing their share of the states (their populations only if kT were far above ε).' }),
        };
      },
    }),
    mcq({
      id: 'cp-infinite-T', difficulty: 3,
      prompt: t`For the molecule with a nondegenerate ground state and a 3-state level above it, what happens to the population ratio upper : ground as $T \to \infty$?`,
      choices: ['It approaches 3', 'It approaches 1: at very high temperature every level is equally populated', 'It grows without limit, inverting the populations', 'It approaches 0'],
      answer: 0,
      why: { 1: 'At infinite temperature every **state** is equally likely — not every level. The upper level has three states.', 2: 'Each Boltzmann factor tends to 1; nothing grows past it. Inversion needs a negative temperature (T3.2).', 3: 'That is the limit T → 0.' },
      hints: [t`The ratio is $3e^{-\varepsilon/kT}$. What is $e^{0}$?`, 'Equal probability belongs to states.'],
      teach: 'At high temperature the Boltzmann factors all approach 1, and each level’s population approaches its number of states.',
      explain: t`$N_\text{upper}/N_\text{ground} = 3e^{-\varepsilon/kT} \to 3$. The microstates are equally likely; the level with more of them holds more molecules.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 3.4], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'N(upper) / N(ground)', curves: [{ fn: '3*e^(-1/x)', domain: [0.05, 10], color: 'accent' }], hlines: [{ y: 1, color: 'ink4' }] }, caption: 'The population ratio climbing with temperature (its limit is the answer; the faint line marks 1).' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §6.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NIST Atomic Spectra Database (O I levels)', url: 'https://physics.nist.gov/PhysRefData/ASD/levels_form.html' },
    { label: 'NIST Chemistry WebBook: nitrogen, diatomic constants', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=1000' },
    { label: 'BIPM, the SI Brochure (the caesium frequency that defines the second)', url: 'https://www.bipm.org/en/publications/si-brochure' },
    { label: 'CODATA recommended values of the fundamental constants', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
