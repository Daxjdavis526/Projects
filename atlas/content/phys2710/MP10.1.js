// Maxwell–Boltzmann statistics — the Boltzmann factor e^(−E/k_BT) per state
// and the degeneracy g of each level: population ratios (hydrogen’s n = 2 in
// the Sun and in Vega, sodium’s 3p in a flame, the hyperfine levels behind
// the 21 cm line), the rotational populations of carbon monoxide, the
// energy distribution of an ideal gas (the competition of √E against
// e^(−E/kT), as in PHYS 2210 lesson M17.3), isothermal scale heights on
// planets, and McKellar’s 1941 CN thermometer, which read the microwave
// background before anyone knew it was there. Every number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, KB, KB_EV, HC_EVNM, T_CMB, IE_H } from './_constants.js';
import { levels, mbEnergy, r6 } from './_atoms.js';

const t = String.raw;
const E21 = 0.75 * IE_H;                               // eV: hydrogen n = 1 → 2 (reduced-mass ionization energy × 3/4)
const ratioH = (T) => 4 * Math.exp(-E21 / (KB_EV * T));
const T_VEGA = 9600;                                   // K, Vega’s effective temperature (about)
const T_SUN = 5772;
const NA_NM = 589.0, E_NA = HC_EVNM / NA_NM;           // the sodium D lines (589.0 and 589.6 nm)
const B_CO = 57.635968e9;                              // Hz, carbon monoxide’s rotational constant B₀ (CDMS)
const C_CO = (H * B_CO) / KB;                          // K: hB/k
const NU_CN = 113.49097e9, T_CN = (H * NU_CN) / KB;    // Hz and K: CN’s N = 1 → 0 transition (its strongest component)
const NU_21 = 1420.405751768e6, T_21 = (H * NU_21) / KB;
const R_GAS = 8.314462618;
/** CO’s fraction in level J at temperature T, with the partition function summed exactly. */
const coShare = (J, T) => { let z = 0; for (let j = 0; j < 400; j++) z += (2 * j + 1) * Math.exp((-C_CO * j * (j + 1)) / T); return ((2 * J + 1) * Math.exp((-C_CO * J * (J + 1)) / T)) / z; };
const coBest = (T) => { let b = 0; for (let J = 1; J < 200; J++) if (coShare(J, T) > coShare(b, T)) b = J; return b; };

/** Two levels to scale-free: lower and upper with their degeneracies and a transition arrow. */
const pair = (lower, upper, arrowLabel, caption, color = 'gold') => levels([{ E: 0, label: lower }, { E: 1, label: upper }], { arrows: [{ from: 0, to: 1, x: 2, color, label: arrowLabel }], caption, x: [-1.5, 10] });

export default lesson({
  id: 'phys2710.MP10.1',
  title: 'Maxwell–Boltzmann statistics',
  minutes: 15, difficulty: 3,
  intro: t`In thermal equilibrium at temperature $T$, the chance of finding a system in any one particular state of energy $E$ is proportional to the **Boltzmann factor** $e^{-E/k_BT}$. Higher states are exponentially rarer — but a level may contain many states. Counting them with the level’s degeneracy $g$, the numbers of atoms or molecules in two levels compare as

$$\frac{N_2}{N_1} = \frac{g_2}{g_1}\,e^{-(E_2 - E_1)/k_BT}$$

This is **Maxwell–Boltzmann statistics**: it treats the particles as distinguishable and each state as far from full. Applied to molecular speeds it gives Maxwell’s distribution; to height in an atmosphere, the barometric law; to atoms, the strengths of spectral lines.

> The speed distribution came in [Molecular speeds and the Maxwell–Boltzmann distribution](#/lesson/phys2210.M17.3); Planck used the same factor in [Planck’s quantum hypothesis](#/lesson/phys2710.MP1.2).`,
  symbols: [
    { tex: 'N_1,\\ N_2', text: 'the numbers of particles in the lower and the upper level (or their fractions)' },
    { tex: 'g_1,\\ g_2', text: 'the degeneracies: how many distinct states share each energy — $2n^2$ for hydrogen’s level $n$, $2J + 1$ for a molecule’s rotational level $J$' },
    { tex: 'E_2 - E_1', text: 'the energy gap between the levels, in J or eV' },
    { tex: 'k_B', text: t`Boltzmann’s constant, $1.380\,649\times10^{-23}$ J/K exactly $= ${fmt(KB_EV * 1e5, 6)}\times10^{-5}$ eV/K` },
    { tex: 'T', text: 'the absolute temperature, in K; $k_BT$ is the typical thermal energy, 0.0259 eV at 300 K' },
    { tex: 'e^{-E/k_BT}', text: 'the Boltzmann factor: each extra $k_BT$ of energy costs a factor $e \\approx 2.72$ in probability per state' },
  ],
  why: 'Population ratios read the temperatures of stars, flames and interstellar gas from their spectra, set reaction and evaporation rates, and decide how much of a planet’s atmosphere sits at a given height.',
  visual: {
    type: 'graph',
    title: 'Carbon monoxide’s rotational levels at temperature T',
    lead: t`A CO molecule can rotate only with energies $E_J = hB\,J(J+1)$, $J = 0, 1, 2, \ldots$, and level $J$ has $2J + 1$ states. Each bar is the fraction of molecules in that level: the degeneracy grows with $J$ while the Boltzmann factor shrinks, so the populations peak.`,
    tasks: [
      'At 2.7 K, the temperature of the cosmic microwave background, about 70% of the molecules sit in J = 0 and nearly all the rest in J = 1.',
      'Raise T to 300 K: the peak moves out to J = 7 — more states up there, each still fairly likely — and no single level holds even 10%.',
      'The bars always add up to 1 (the readout): raising T spreads the same molecules over more levels.',
    ],
    params: {
      x: [-0.6, 30.6], y: [0, 0.8], aspect: 'wide', xlabel: 'rotational level J', ylabel: 'fraction of molecules', axesAt: 'edge',
      constants: { c: r6(C_CO) },
      sliders: [{ key: 'T', label: 'Temperature $T$', min: 2.7, max: 1000, value: 30, logScale: true, unit: '\\mathrm{K}', explain: 'The gas temperature. The slider is logarithmic.' }],
      riemann: { fn: '(2*x + 1)*exp(-c*x*(x + 1)/T)/(T/c + 1/3 + c/(15*T))', from: -0.5, to: 30.5, n: 31, rule: 'mid' },
      readouts: [{ label: 'most populated level', expr: 'max(0, round(sqrt(T/(2*c)) - 0.5))', digits: 2 }, { label: 'share in $J = 0$', expr: '1/(T/c + 1/3 + c/(15*T))', digits: 3 }, { label: 'all the bars together', expr: 'riemann', digits: 3 }],
    },
    caption: `Rotational populations of carbon monoxide (B = 57.636 GHz, so hB/k = ${fmt(C_CO, 4)} K), with the sum over levels approximated by T/(hB/k) + 1/3 + (hB/k)/15T, good to 2% even at 2.7 K. Vibration and centrifugal stretching are ignored.`,
  },
  example: {
    prompt: t`Balmer absorption lines in a star’s spectrum come from hydrogen atoms already in $n = 2$. Compare the fraction of hydrogen atoms in $n = 2$ (relative to $n = 1$) in the Sun’s atmosphere (5772 K) and in Vega’s (about 9600 K). The gap is $E_2 - E_1 = ${fmt(E21, 4)}$ eV.`,
    visual: levels([{ E: -IE_H, label: 'n = 1: 2 states' }, { E: -IE_H / 4, label: 'n = 2: 8 states' }, { E: -IE_H / 9, label: 'n = 3: 18 states' }, { E: 0, label: 'ionized', dash: true, color: 'ink3' }], { arrows: [{ from: -IE_H, to: -IE_H / 4, x: 1.6, color: 'gold', label: '10.2 eV' }], caption: 'Hydrogen’s lowest levels, to scale, with their degeneracies 2n² (counting spin). Balmer lines start from n = 2.' }),
    steps: [
      { label: 'Degeneracies', text: t`Level $n$ of hydrogen holds $2n^2$ states: $g_1 = 2$ and $g_2 = 8$, so $g_2/g_1 = 4$.` },
      { label: 'The Sun', text: t`$k_BT = ${fmt(KB_EV * T_SUN, 4)}$ eV, so $(E_2 - E_1)/k_BT = ${fmt(E21 / (KB_EV * T_SUN), 4)}$ and $N_2/N_1 = 4e^{-${fmt(E21 / (KB_EV * T_SUN), 4)}} = ${tex(ratioH(T_SUN), 3)}$: about five atoms in a billion.` },
      { label: 'Vega', text: t`$k_BT = ${fmt(KB_EV * T_VEGA, 4)}$ eV, $(E_2 - E_1)/k_BT = ${fmt(E21 / (KB_EV * T_VEGA), 4)}$, and $N_2/N_1 = ${tex(ratioH(T_VEGA), 3)}$.` },
      { label: 'Compare', text: t`Vega has ${fmt(ratioH(T_VEGA) / ratioH(T_SUN), 2)} times the Sun’s share of hydrogen in $n = 2$: a temperature only 1.7 times higher multiplies an exponentially small number. Vega’s Balmer lines are among the strongest of any star; the Sun’s are weak.` },
      { label: 'Sense check', text: t`$k_BT$ is far below 10.2 eV in both stars, so the ratios are tiny, as they must be. Hotter still, hydrogen begins to *ionize* (a balance described by the Saha equation, beyond the Boltzmann factor alone), and the Balmer lines fade again: they peak in stars near 10 000 K.` },
    ],
    answer: t`$N_2/N_1 \approx ${tex(ratioH(T_SUN), 2)}$ in the Sun and $${tex(ratioH(T_VEGA), 2)}$ in Vega — about ${fmt(ratioH(T_VEGA) / ratioH(T_SUN), 1)} times more.`,
  },
  practice: [
    num({
      id: 'sodium-flame', difficulty: 1,
      gen(r) {
        const T = r.pick([1800, 2200, 2500, 2800, 3000]), x = E_NA / (KB_EV * T), ans = 3 * Math.exp(-x);
        return {
          prompt: t`Sodium in a flame glows yellow at 589 nm: the light comes from atoms in the 3p level, $${fmt(E_NA, 4)}$ eV above the 3s ground level. 3p has 6 states and 3s has 2. In a flame at ${T} K, what is the ratio of atoms in 3p to atoms in 3s?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-x), feedback: t`Include the degeneracies: $g_2/g_1 = 6/2 = 3$.` }, { value: Math.exp(-x) / 3, feedback: t`The degeneracy ratio is upper over lower: $g_2/g_1 = 6/2 = 3$, not $1/3$.` }],
          hints: [t`$N_2/N_1 = (g_2/g_1)\,e^{-\Delta E/k_BT}$.`, t`$k_BT = 8.617\times10^{-5}\ \text{eV/K} \times ${T}\ \text{K} = ${fmt(KB_EV * T, 4)}$ eV.`],
          teach: 'The upper level’s share is its degeneracy ratio times the Boltzmann factor of the gap.',
          explain: t`$\Delta E/k_BT = ${fmt(E_NA, 4)}/${fmt(KB_EV * T, 4)} = ${fmt(x, 4)}$, so $N_2/N_1 = 3e^{-${fmt(x, 4)}} = ${tex(ans, 3)}$. A tiny fraction — yet enough for the flame to glow brightly, because there are so many atoms and each excited one radiates within 16 ns.`,
          visual: pair('3s: 2 states', '3p: 6 states', '589 nm', 'Sodium’s two lowest levels (not to scale). Flame atoms are excited by collisions and fall back emitting the yellow D lines.'),
        };
      },
    }),
    mcq({
      id: 'hyperfine', difficulty: 2,
      prompt: t`A hydrogen atom’s ground state is split in two by the interaction of the electron’s and the proton’s spins: an upper level with 3 states and a lower one with 1, just $${tex(H * NU_21 / 1.602176634e-19, 3)}$ eV apart. Their transition emits the 21 cm radio line. In a cold interstellar cloud at 50 K, what is the ratio of atoms in the upper level to the lower?`,
      choices: ['Almost exactly 3', 'Almost exactly 1', 'Almost zero', 'Almost exactly 1/3'],
      answer: 0,
      why: {
        1: 'That ignores the degeneracies: the upper level has three states, the lower one.',
        2: t`The gap corresponds to only ${fmt(T_21, 3)} K. At 50 K, $e^{-\Delta E/k_BT}$ is very close to 1 — the upper level is not frozen out.`,
        3: 'That has the degeneracies upside down: it is the upper level that has three states.',
      },
      hints: [t`Compare $\Delta E/k_B$ (the gap as a temperature) with 50 K.`],
      teach: t`When the gap is much smaller than $k_BT$, the Boltzmann factor is nearly 1 and populations follow the degeneracies.`,
      explain: t`$\Delta E/k_B = ${fmt(T_21, 3)}$ K, so $e^{-${fmt(T_21, 3)}/50} = ${fmt(Math.exp(-T_21 / 50), 4)}$ and $N_u/N_l = 3 \times ${fmt(Math.exp(-T_21 / 50), 4)} = ${fmt(3 * Math.exp(-T_21 / 50), 4)}$. That is why every hydrogen cloud in the Galaxy shines at 21 cm, however cold.`,
      visual: pair('lower level: 1 state', 'upper level: 3 states', '21 cm', 'Hydrogen’s ground state split by the spins, schematic: the gap is about a millionth of the 10.2 eV to n = 2.', 'accent'),
    }),
    num({
      id: 'most-probable-energy', difficulty: 2,
      gen(r) {
        const [T, gas] = r.pick([[300, 'nitrogen at room temperature'], [77, 'nitrogen boil-off gas at 77 K'], [1500, 'hot exhaust gas at 1500 K'], [5800, 'the Sun’s photosphere']]);
        const ans = (KB_EV * T * 1000) / 2;
        return {
          prompt: t`What is the most probable kinetic energy of a molecule (or atom) in ${gas}, in meV?`,
          answer: ans, units: 'meV', tol: { rel: 0.01 },
          errors: [{ value: 3 * ans, feedback: t`$\tfrac32 k_BT$ is the *mean* kinetic energy. The most probable one is lower: the distribution has a long high-energy tail.` }, { value: 2 * ans, feedback: t`That is $k_BT$, the kinetic energy of a molecule moving at the most probable *speed*. The peak of the energy distribution is at $k_BT/2$.` }],
          hints: [t`The distribution of kinetic energies is $f(E) \propto \sqrt{E}\,e^{-E/k_BT}$.`, t`Set $df/dE = 0$: the peak is at $E = k_BT/2$.`],
          teach: t`The Maxwell–Boltzmann energy distribution peaks at $k_BT/2$ and has its mean at $\tfrac32 k_BT$ — whatever the gas.`,
          explain: t`$E_p = k_BT/2 = ${fmt(ans, 4)}$ meV. Differentiating $\sqrt E\,e^{-E/k_BT}$ gives zero at $E = k_BT/2$. It does not depend on the mass: every ideal gas at ${T} K shares the same energy distribution. (The most probable *speed* gives $\tfrac12 mv_p^2 = k_BT$: the peak of one distribution is not the peak of the other.)`,
          visual: mbEnergy({ marks: [], caption: 'The kinetic-energy distribution of any ideal gas, against E/kT: states rising as √E, times the falling Boltzmann factor. The peak is left unmarked.' }),
        };
      },
    }),
    num({
      id: 'equal-populations', difficulty: 3,
      gen(r) {
        const [want, phr] = r.pick([[1, 'as many atoms in n = 2 as in n = 1'], [0.1, 'one atom in n = 2 for every ten in n = 1'], [0.01, 'one atom in n = 2 for every hundred in n = 1']]);
        const T = E21 / (KB_EV * Math.log(4 / want));
        return {
          prompt: t`At what temperature would hydrogen gas in thermal equilibrium have ${phr}? (Ignore ionization; $E_2 - E_1 = ${fmt(E21, 4)}$ eV, $g_2/g_1 = 4$.)`,
          answer: T, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: E21 / (KB_EV * Math.log(1 / want)), feedback: t`Keep the degeneracy: $N_2/N_1 = 4e^{-\Delta E/k_BT}$.` }].filter((e) => Number.isFinite(e.value) && e.value > 0),
          hints: [t`Solve $${want === 1 ? 1 : want} = 4e^{-\Delta E/k_BT}$ for $T$.`, t`$T = \dfrac{\Delta E}{k_B\ln(4/${want})}$.`],
          teach: t`Inverting the Boltzmann ratio gives a temperature: $T = \Delta E/[k_B\ln(g_2N_1/g_1N_2)]$.`,
          explain: t`$T = \dfrac{${fmt(E21, 4)}\ \text{eV}}{${fmt(KB_EV * 1e5, 4)}\times10^{-5}\ \text{eV/K}\times\ln(${fmt(4 / want, 3)})} = ${fmt(T, 3)}$ K. Even as $T \to \infty$ the ratio only approaches $g_2/g_1 = 4$: thermal equilibrium never puts more atoms *per state* in the upper level. Lasers need exactly that — a population inversion — so they must be driven out of equilibrium (lesson MP10.3).`,
          visual: levels([{ E: -IE_H, label: 'n = 1: 2 states' }, { E: -IE_H / 4, label: 'n = 2: 8 states' }, { E: 0, label: 'ionized', dash: true, color: 'ink3' }], { arrows: [{ from: -IE_H, to: -IE_H / 4, x: 1.6, color: 'gold', label: '10.2 eV' }], caption: 'Hydrogen’s two lowest levels, to scale, with their degeneracies.' }),
        };
      },
    }),
    mcq({
      id: 'when-mb', difficulty: 2,
      prompt: 'Maxwell–Boltzmann statistics treats particles as distinguishable and ignores how full each state is. When is that a good approximation?',
      choices: [
        'When the average number of particles per state is much less than 1 — for example air at room temperature, where it is about one in ten million',
        'Whenever the temperature is high, say above a million kelvin',
        'Only for particles that really are distinguishable, such as different isotopes',
        'Whenever the collisions between particles are elastic',
      ],
      answer: 0,
      why: {
        1: 'Not in absolute terms: the electrons in a white dwarf at ten million kelvin are packed so densely that they fill their lowest states — they are anything but classical.',
        2: 'Identical particles are never distinguishable; the approximation works when they are so spread out over states that their identity never matters.',
        3: 'Elastic collisions bring a gas to equilibrium, but say nothing about how crowded the states are.',
      },
      hints: ['Quantum statistics matters when two identical particles are likely to want the same state.'],
      teach: 'Maxwell–Boltzmann statistics holds when states are sparsely occupied: n λ³ ≪ 1, with λ the thermal de Broglie wavelength.',
      explain: t`The test is the occupancy, measured by $n\lambda^3$: the number of particles in a cube whose side is the thermal de Broglie wavelength $\lambda = h/\sqrt{2\pi mk_BT}$. For nitrogen at 300 K and 1 bar it is about $10^{-7}$ — classical. For the electrons in copper it is in the thousands: they need Fermi–Dirac statistics (next lesson).`,
      visual: { type: 'therm-gas', params: { gas: 'N2', T: 300, N: 150, hist: true, curve: true, gauge: false }, caption: 'A model gas of nitrogen at 300 K: its speeds spread into the Maxwell–Boltzmann curve. Molecules enormously enlarged; real ones are hundreds of times farther apart than they are wide.' },
    }),
    code({
      id: 'co-populations', difficulty: 2,
      prompt: t`Carbon monoxide’s rotational level $J$ has energy $E_J = hB\,J(J+1)$ and $2J + 1$ states, with $B = 57.636$ GHz. Write \`populations(T)\` that **returns** a NumPy array of the fractions of molecules in $J = 0, 1, \ldots, 79$ at temperature $T$ (divide by the sum so they add to 1), and \`most_populated(T)\` that returns the $J$ with the largest fraction.`,
      starter: t`import numpy as np

h = 6.62607015e-34      # J s
kB = 1.380649e-23       # J/K
B = 57.635968e9         # Hz

def populations(T):
    J = np.arange(80)
    pass

def most_populated(T):
    pass

print(most_populated(300), populations(2.725)[:3])
`,
      answer: t`import numpy as np

h = 6.62607015e-34      # J s
kB = 1.380649e-23       # J/K
B = 57.635968e9         # Hz

def populations(T):
    J = np.arange(80)
    w = (2*J + 1) * np.exp(-h*B*J*(J + 1) / (kB*T))
    return w / w.sum()

def most_populated(T):
    return int(np.argmax(populations(T)))

print(most_populated(300), populations(2.725)[:3])`,
      tests: [
        { name: 'the fractions add up to 1', code: 'abs(populations(100).sum() - 1) < 1e-9' },
        { name: t`at 2.725 K, ${fmt(100 * coShare(0, T_CMB), 3)}% of molecules are in $J = 0$`, code: `abs(populations(2.725)[0] - ${r6(coShare(0, T_CMB))}) < 1e-4` },
        { name: t`at 300 K the most populated level is $J = ${coBest(300)}$`, code: `most_populated(300) == ${coBest(300)}` },
        { name: t`at 30 K it is $J = ${coBest(30)}$`, code: `most_populated(30) == ${coBest(30)}` },
      ],
      hints: [t`Weight each level by its degeneracy times its Boltzmann factor: \`w = (2*J + 1) * np.exp(-h*B*J*(J + 1) / (kB*T))\`, then \`return w / w.sum()\`.`, t`\`np.argmax\` gives the index of the largest element, and the index is $J$.`],
      teach: 'A population is degeneracy × Boltzmann factor, divided by the sum over all levels (the partition function).',
      explain: t`At 300 K the fractions peak at $J = ${coBest(300)}$, holding ${fmt(100 * coShare(coBest(300), 300), 2)}%; the estimate $J_{\max} \approx \sqrt{k_BT/2hB} - \tfrac12 = ${fmt(Math.sqrt(300 / (2 * C_CO)) - 0.5, 3)}$ agrees. Radio astronomers use exactly this: the relative strengths of CO’s lines give the temperature of molecular clouds (lesson MP11.2).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cn', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([2.3, 2.6, 2.74, 3.0]), ratio = +(3 * Math.exp(-T_CN / T)).toFixed(3), Tans = T_CN / Math.log(3 / ratio);
        return {
          prompt: t`In 1941 Andrew McKellar found that cyanogen (CN) molecules in interstellar space absorb starlight not only from their lowest rotational level ($N = 0$, one state) but also from the next ($N = 1$, three states), which lies $h\nu$ higher with $\nu = 113.49$ GHz. Suppose the measured ratio of molecules is $N_1/N_0 = ${ratio}$. What temperature does that imply, in K?`,
          answer: Tans, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: T_CN / Math.log(1 / ratio), feedback: t`Keep the degeneracies: $N_1/N_0 = 3e^{-h\nu/k_BT}$.` }],
          hints: [t`$N_1/N_0 = 3e^{-h\nu/k_BT}$, and $h\nu/k_B = ${fmt(T_CN, 4)}$ K.`, t`$T = \dfrac{h\nu/k_B}{\ln(3N_0/N_1)} = \dfrac{${fmt(T_CN, 4)}\ \text{K}}{\ln(3/${ratio})}$.`],
          teach: 'A measured population ratio, with the gap and the degeneracies, is a thermometer.',
          explain: t`$T = ${fmt(T_CN, 4)}/\ln(${fmt(3 / ratio, 4)}) = ${fmt(Tans, 3)}$ K. McKellar got about 2.3 K and could not explain it. In empty space the molecules’ rotation is set by the radiation bathing them: he had measured the cosmic microwave background, 24 years before Penzias and Wilson found it (${T_CMB} K today).`,
          visual: pair('N = 0: 1 state', 'N = 1: 3 states', '113.49 GHz', 'CN’s two lowest rotational levels (schematic). Starlight passing through a cloud is absorbed by molecules in both levels, at slightly different wavelengths near 387.4 nm.', 'accent'),
        };
      },
    }),
    num({
      id: 'cp-scale-height', difficulty: 2, transfer: true,
      gen(r) {
        const [world, M, T, g, gasName] = r.pick([['Mars', 44.01, 210, 3.721, 'carbon dioxide'], ['Titan', 28.01, 94, 1.352, 'nitrogen'], ['Venus', 44.01, 737, 8.87, 'carbon dioxide'], ['Earth', 28.97, 288, 9.807, 'air']]);
        const Hs = (R_GAS * T) / ((M / 1000) * g) / 1000;
        return {
          prompt: t`In an atmosphere at one temperature, the number of molecules per volume at height $h$ follows the Boltzmann factor of their potential energy, $n(h) = n_0e^{-mgh/k_BT}$: it falls by a factor $e$ every scale height $H = k_BT/mg$. Find $H$, in km, near the surface of ${world}: ${gasName} (molar mass ${M} g/mol) at ${T} K, $g = ${g}$ m/s².`,
          answer: Hs, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: Hs * 1000, feedback: 'Use the molar mass in kg/mol: 1 g/mol = 0.001 kg/mol.' }],
          hints: [t`Per mole, $H = RT/(Mg)$ with $R = 8.314$ J/(mol K) and $M$ in kg/mol.`, t`$H = \dfrac{8.314 \times ${T}}{${(M / 1000).toFixed(5)} \times ${g}}$ m.`],
          teach: t`An isothermal atmosphere thins by a Boltzmann factor, falling by $e$ every scale height $H = k_BT/mg$.`,
          explain: t`$H = ${fmt(Hs, 3)}$ km. Entry, descent and landing designers start from this number: ${world === 'Titan' ? 'Titan’s low gravity and cold dense nitrogen give a scale height over twice Earth’s, which is why Huygens could descend for two and a half hours under parachutes' : world === 'Mars' ? 'Mars’s thin carbon dioxide thins out slowly, so a lander still meets meaningful drag low down but too little to land on parachutes alone' : 'it sets how fast the drag on an entering vehicle builds up'}. Real atmospheres are not isothermal, so $H$ changes with height.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 5], aspect: 'wide', xlabel: 'density n / n₀', ylabel: 'height h / H', axesAt: 'edge', curves: [{ param: ['exp(-t)', 't'], t: [0, 5], color: 'accent', width: 2.6 }], points: [{ x: r6(Math.exp(-1)), y: 1, r: 5, color: 'gold', label: '1/e at one scale height', labelDx: 8, labelDy: -10 }] }, caption: 'An isothermal atmosphere: density falls by 1/e every scale height H. Real atmospheres cool and warm with height, so H varies.' },
        };
      },
    }),
    mcq({
      id: 'cp-peak', difficulty: 2,
      prompt: t`Why does the Maxwell–Boltzmann distribution of molecular energies have a peak, instead of simply being largest at $E = 0$, where the Boltzmann factor is largest?`,
      choices: [
        t`The number of states with energy near $E$ grows as $\sqrt{E}$, while the Boltzmann factor falls; their product rises, then falls`,
        'Collisions push every molecule toward the average energy',
        t`Molecules with energy below $k_BT/2$ are forbidden by quantum mechanics`,
        'The slowest molecules stick to the walls and drop out of the gas',
      ],
      answer: 0,
      why: {
        1: 'Collisions constantly spread the energies out; with them, a gas started at one speed relaxes to the broad Maxwell–Boltzmann shape, not to a spike at the average.',
        2: 'Low energies are allowed; there are just few ways to have them — few velocity vectors are that short.',
        3: 'In equilibrium as many molecules leave a wall as arrive; walls remove none.',
      },
      hints: ['Count how many velocity vectors give a speed between v and v + dv.'],
      teach: 'Every thermal distribution is (number of states) × (Boltzmann factor): the competition between them makes the peak.',
      explain: t`Velocities with speed near $v$ fill a spherical shell of area $4\pi v^2$, which in terms of energy is a density of states $\propto \sqrt{E}$. Times $e^{-E/k_BT}$, the product peaks at $k_BT/2$. CO’s rotational levels showed the same competition: $2J + 1$ states against the Boltzmann factor.`,
      visual: mbEnergy({ marks: ['peak'] }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §2.4 Distribution of molecular speeds', url: 'https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds' },
    { label: 'McKellar (1941), Molecular lines from the lowest states of diatomic molecules composed of atoms probably present in interstellar space, Publ. Dominion Astrophys. Obs. 7, 251', url: 'https://ui.adsabs.harvard.edu/abs/1941PDAO....7..251M' },
    { label: 'CDMS: Cologne Database for Molecular Spectroscopy (CO rotational constants)', url: 'https://cdms.astro.uni-koeln.de/' },
    { label: 'NIST Atomic Spectra Database: hydrogen and sodium levels', url: 'https://physics.nist.gov/PhysRefData/ASD/levels_form.html' },
    { label: 'NASA Planetary Fact Sheets (Mars, Venus, Titan)', url: 'https://nssdc.gsfc.nasa.gov/planetary/planetfact.html' },
  ],
});
