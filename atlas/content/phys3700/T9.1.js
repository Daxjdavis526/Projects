// Ensembles side by side: microcanonical (U, V, N: every accessible state
// equally likely), canonical (T, V, N: Boltzmann factors, Z) and grand
// canonical (T, V, μ: Gibbs factors). The canonical distribution derived from
// the microcanonical one for a small system and a big reservoir; energy
// fluctuations σ_E² = kT²C_V and number fluctuations σ_N² = N̄ (ideal gas),
// which shrink as 1/√N so the ensembles agree for large systems; and where
// they do not — small detectors, and anything with a negative heat capacity.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, EV, r4, texNum, apart } from './_th4.js';
import { cuSpecific } from './_stat.js';

const t = String.raw;
const N_AIR = 2.5470e25;    // m⁻³, air at sea level (U.S. Standard Atmosphere 1976)

const lbl = (x, y, text, color = 'ink2', dy = 0) => ({ x, y, r: 0.01, color, label: text, labelDx: 0, labelDy: dy, labelAlign: 'center' });
const rect = (x0, y0, x1, y1, o) => [
  { param: [`${x0} + ${r4(x1 - x0)}*t`, `${y0}`], t: [0, 1], ...o }, { param: [`${x0} + ${r4(x1 - x0)}*t`, `${y1}`], t: [0, 1], ...o },
  { param: [`${x0}`, `${y0} + ${r4(y1 - y0)}*t`], t: [0, 1], ...o }, { param: [`${x1}`, `${y0} + ${r4(y1 - y0)}*t`], t: [0, 1], ...o },
];
const DOTS = [[0.3, 0.3], [0.7, 0.55], [0.45, 0.8], [0.2, 0.65], [0.8, 0.25], [0.55, 0.4]];
/** The three ensembles as boxes: isolated, in a heat bath, in a heat-and-particle bath. */
function ensemblesPic({ caption, names = true } = {}) {
  const box = (cx) => [cx - 0.75, 0.6, cx + 0.75, 1.9];
  const curves = [], shade = [], points = [], arrows = [];
  const dots = (cx) => DOTS.forEach(([u, v]) => points.push({ x: r4(cx - 0.75 + 1.5 * u), y: r4(0.6 + 1.3 * v), r: 3.5, color: 'accent' }));
  // isolated
  let [a, b, c, d] = box(1.2);
  curves.push(...rect(a, b, c, d, { color: 'ink', width: 5 }));
  dots(1.2);
  // heat bath
  shade.push({ fn: '2.3', lower: '0.2', from: 2.95, to: 5.25, color: 'warn', alpha: 0.18 });
  [a, b, c, d] = box(4.1);
  curves.push(...rect(a, b, c, d, { color: 'ink2', width: 2 }));
  dots(4.1);
  arrows.push({ from: [3.08, 1.25], to: [3.3, 1.25], color: 'warn', width: 2 }, { from: [5.12, 1.25], to: [4.9, 1.25], color: 'warn', width: 2 });
  // heat and particle bath
  shade.push({ fn: '2.3', lower: '0.2', from: 5.85, to: 8.15, color: 'teal', alpha: 0.18 });
  [a, b, c, d] = box(7);
  curves.push(...rect(a, b, c, d, { color: 'ink2', width: 2, dash: true }));
  dots(7);
  points.push({ x: 6.05, y: 1.5, r: 3.5, color: 'accent' }, { x: 8.0, y: 0.9, r: 3.5, color: 'accent' });
  arrows.push({ from: [6.05, 1.5], to: [6.4, 1.5], color: 'teal', width: 1.6 }, { from: [7.6, 0.9], to: [7.95, 0.9], color: 'teal', width: 1.6 });
  if (names) points.push(lbl(1.2, 2.45, 'isolated'), lbl(4.1, 2.45, 'heat bath at T'), lbl(7, 2.45, 'heat + particles, T and μ'), lbl(1.2, 0.0, 'U, V, N fixed', 'ink3'), lbl(4.1, 0.0, 'T, V, N fixed', 'ink3'), lbl(7, 0.0, 'T, V, μ fixed', 'ink3'));
  return { type: 'graph', params: { x: [0, 8.4], y: [-0.4, 2.8], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves, shade, points, arrows, alt: 'Three boxes of gas: one with thick insulating walls, one in a heat bath, one with porous walls in a bath of heat and particles' }, caption };
}

/** Relative fluctuation 1/√N-type curves on log axes. */
function flucPic({ k = Math.sqrt(2 / 3), mark = null, label = 'σ(E)/U = √(2/3N)', caption }) {
  return {
    type: 'graph',
    params: { x: [0, 26], y: [-14, 0], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'number of particles N', ylabel: 'relative fluctuation', curves: [{ fn: `${r4(Math.log10(k))} - x/2`, domain: [0, 26], color: 'accent', label, labelAt: 4, labelDx: 10 }], vlines: mark === null ? [] : [{ x: r4(Math.log10(mark)), color: 'gold' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T9.1',
  title: 'Microcanonical, canonical and grand canonical ensembles',
  minutes: 16, difficulty: 3,
  intro: t`An **ensemble** is an imagined collection of copies of a system, each in some microstate, all sharing whatever you hold fixed. Three choices cover almost everything in this course, and each comes with its own probability rule and its own route to thermodynamics:

- **Microcanonical** — isolated, with $U$, $V$, $N$ fixed: every accessible microstate is equally likely, $P_s = 1/\Omega$, and $S = k\ln\Omega$.
- **Canonical** — in a heat bath, with $T$, $V$, $N$ fixed: $P_s = e^{-E_s/kT}/Z$, and $F = -kT\ln Z$.
- **Grand canonical** — exchanging heat and particles, with $T$, $V$, $\mu$ fixed: $P_s = e^{-(E_s - \mu N_s)/kT}/\mathcal Z$, and $\Phi = -kT\ln\mathcal Z$.

The microcanonical ensemble is the one T2 started from; the canonical one is T6’s Boltzmann statistics; the grand canonical one is T7.1’s Gibbs factor. For a large system they give the same answers, because the quantities that are allowed to fluctuate — energy, particle number — fluctuate by only about $1/\sqrt N$ of themselves.`,
  symbols: [
    { tex: 'P_s', text: 'the probability of finding the system in microstate $s$' },
    { tex: 'E_s,\\ N_s', text: 'the energy and particle number of microstate $s$' },
    { tex: '\\Omega', text: 'the multiplicity: how many microstates have the fixed energy $U$' },
    { tex: 'Z', text: 'the partition function $\\sum_s e^{-E_s/kT}$ (T6.2)' },
    { tex: '\\mathcal Z', text: 'the grand partition function $\\sum_s e^{-(E_s - \\mu N_s)/kT}$ (T7.1)' },
    { tex: '\\mu', text: 'the chemical potential set by the particle reservoir, in J (T3.3)' },
    { tex: 'F,\\ \\Phi', text: 'the Helmholtz free energy $U - TS$ and the grand free energy $U - TS - \\mu N$, in J' },
  ],
  why: 'Choosing the ensemble that matches what is held fixed turns a hard counting problem into an easy sum — and knowing when the choice matters is how you spot physics that ordinary thermodynamics misses, from detector noise to stars and black holes.',
  visual: {
    type: 'th-einstein',
    title: 'Canonical from microcanonical',
    lead: t`Solid A is a **single oscillator**; solid B is a reservoir of $N_B$ oscillators; together they are isolated and share $q$ quanta — a microcanonical system. The bars are the exact chance that A holds $q_A$ quanta. On the log scale they fall on a straight line: the Boltzmann factor $e^{-q_A\varepsilon/kT}$, with the temperature set by B.`,
    tasks: [
      'Log scale, N(B) = 60, q = 60: the bars fall almost on a straight line — an exponential, the canonical distribution for A.',
      'Shrink the reservoir to N(B) = 3: the line bends. A small "bath" does not hold its temperature fixed.',
      'Raise q: the line gets shallower — a hotter reservoir gives higher energies a bigger share.',
    ],
    params: { mode: 'pair', NA: 1, NB: 60, q: 60, scale: 'log', controls: ['NB', 'q', 'scale'], ranges: { NB: [2, 100], q: [5, 150] }, panels: 'bars', play: false, visits: false, start: 'even', xr: [0, 40] },
    caption: 'Exact multiplicities of an Einstein solid of one oscillator sharing quanta with a reservoir (th-einstein model). The reservoir is finite; the straight line is exact only in the limit of an infinite one.',
  },
  example: {
    prompt: t`Derive the canonical distribution from the microcanonical one: a small system A in contact with a large reservoir R, the two together isolated with total energy $U_0$. Then use it to show that the energy of A fluctuates by $\sigma_E^2 = kT^2C_V$, and evaluate $\sigma_E/U$ for one mole of helium.`,
    visual: ensemblesPic({ caption: 'Isolated (microcanonical), in a heat bath (canonical), in a bath of heat and particles (grand canonical). Not to scale: a real bath is vastly bigger than the system.' }),
    steps: [
      { label: 'Equal a priori', text: t`A + R is isolated, so every microstate of the whole is equally likely. If A is in one particular state $s$ of energy $E_s$, the reservoir can be in any of $\Omega_R(U_0 - E_s)$ states, so $P_s \propto \Omega_R(U_0 - E_s) = e^{S_R(U_0 - E_s)/k}$.` },
      { label: 'Expand', text: t`$E_s \ll U_0$, so expand the reservoir’s entropy: $S_R(U_0 - E_s) \approx S_R(U_0) - E_s\,\dfrac{\partial S_R}{\partial U} = S_R(U_0) - \dfrac{E_s}{T}$. The first term is the same for every $s$.` },
      { label: 'Boltzmann', text: t`$P_s \propto e^{-E_s/kT}$: the canonical distribution. The reservoir’s only role is to supply $T$. Let it exchange particles too and the same step gives the Gibbs factor $e^{-(E_s - \mu N_s)/kT}$.` },
      { label: 'Fluctuations', text: t`With $\beta = 1/kT$, $U = \langle E\rangle = -\partial\ln Z/\partial\beta$ and $\partial U/\partial\beta = -(\langle E^2\rangle - \langle E\rangle^2) = -\sigma_E^2$. Since $\partial/\partial\beta = -kT^2\,\partial/\partial T$: $\sigma_E^2 = kT^2\,\partial U/\partial T = kT^2C_V$.` },
      { label: 'One mole', text: t`Monatomic gas: $U = \tfrac32NkT$, $C_V = \tfrac32Nk$, so $\sigma_E/U = \sqrt{kT^2\cdot\tfrac32Nk}\big/\tfrac32NkT = \sqrt{2/3N}$. For $N = 6.022\times10^{23}$: $${texNum(Math.sqrt(2 / (3 * 6.02214076e23)), 3)}$ — one part in a trillion. Fixing $T$ instead of $U$ makes no measurable difference.` },
    ],
    answer: t`$P_s \propto e^{-E_s/kT}$ follows from counting reservoir states; $\sigma_E^2 = kT^2C_V$, and for a mole of monatomic gas $\sigma_E/U = \sqrt{2/3N} = ${texNum(Math.sqrt(2 / (3 * 6.02214076e23)), 3)}$.`,
  },
  practice: [
    match({
      id: 'which-ensemble', difficulty: 1,
      prompt: 'Match each situation to the ensemble that describes it most naturally.',
      left: ['Gas sealed in a rigid, perfectly insulated flask', 'A small sealed sample sitting in a large water bath', 'The air inside an imaginary 1 μm cube in the middle of a room: molecules drift in and out', 'Gas in a balloon floating in the open air, at the air’s temperature and pressure'],
      right: ['microcanonical: U, V, N fixed', 'canonical: T, V, N fixed', 'grand canonical: T, V, μ fixed', 'isothermal–isobaric: T, P, N fixed'],
      answer: [0, 1, 2, 3],
      hints: ['Ask what the walls let through: nothing, heat only, heat and particles, or heat and volume changes.'],
      teach: 'Pick the ensemble by what the walls exchange: nothing (U fixed), heat (T fixed), heat and particles (T and μ fixed).',
      explain: 'Insulated and rigid: nothing crosses, so U is fixed. In a bath: heat crosses, T is fixed. An imaginary cube: particles and energy cross, T and μ are fixed. A balloon: heat crosses and the volume adjusts, so T and P are fixed (the ensemble of the Gibbs free energy).',
      visual: ensemblesPic({ caption: 'The walls decide the ensemble: insulating, heat-conducting, or porous.' }),
    }),
    num({
      id: 'sigma-gas', difficulty: 2,
      gen(r) {
        const [N, what] = r.pick([[100, 'a cluster of 100 helium atoms'], [1e6, 'a puff of $10^{6}$ argon atoms'], [1e12, 'a nanolitre bubble of neon, about $10^{12}$ atoms'], [6.02214076e23, 'one mole of helium']]);
        const v = Math.sqrt(2 / (3 * N));
        return {
          prompt: t`Held at fixed temperature, by how large a fraction of its average does the energy of ${what} fluctuate? Give $\sigma_E/U$ for a monatomic ideal gas.`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / Math.sqrt(N), feedback: 'Close: σ(E)² = kT²C(V) with C(V) = (3/2)Nk and U = (3/2)NkT gives √(2/3N).' }, { value: Math.sqrt(3 / (2 * N)), feedback: 'Check the ratio: √(kT² · (3/2)Nk) divided by (3/2)NkT is √(2/(3N)).' }], v),
          hints: [t`$\sigma_E^2 = kT^2C_V$ with $C_V = \tfrac32Nk$.`, t`$\sigma_E/U = \sqrt{kT^2\cdot\tfrac32Nk}\,\big/\,\tfrac32NkT = \sqrt{2/(3N)}$.`],
          teach: 'Energy fluctuations at fixed T shrink as 1/√N: invisible for a mole, large for a cluster.',
          explain: t`$\sqrt{2/(3N)} = ${texNum(v, 3)}$. ${N < 1e3 ? 'For a cluster this small, fixing T rather than U makes a real difference: the ensembles disagree.' : 'Tiny: fixing T or fixing U describes the same thermodynamics.'}`,
          visual: flucPic({ mark: N, caption: 'Relative energy fluctuation of a monatomic ideal gas at fixed temperature, on log axes: a line of slope −½. The gold line marks this N.' }),
        };
      },
    }),
    num({
      id: 'sigma-copper', difficulty: 2,
      gen(r) {
        const m = r.pick([1, 10, 100]), T = r.pick([4, 20, 77, 300]);
        const Cmass = +cuSpecific(T).toPrecision(3);      // J/(kg K): OFHC copper (NIST fit)
        const CC = (m / 1000) * Cmass, v = Math.sqrt(KB * T * T * CC);
        return {
          prompt: t`A $${m}$ g block of copper sits in a bath at $${T}$ K, where copper’s specific heat is $${Cmass}$ J/(kg K) (NIST). What is the standard deviation $\sigma_E$ of its energy, in joules?`,
          answer: v, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt(KB * T * CC), feedback: 'σ(E)² = kT²C: the temperature is squared.' }, { value: KB * T * T * CC, feedback: 'That is the variance. Take the square root for σ(E).' }, { value: Math.sqrt(KB * T * T * Cmass * m), feedback: 'Use the heat capacity of the block, C = mc, with m in kilograms.' }], v),
          hints: [t`$C = mc = ${m / 1000}\ \text{kg}\times${Cmass}$ J/(kg K) $= ${texNum(CC, 3)}$ J/K.`, t`$\sigma_E = \sqrt{kT^2C} = T\sqrt{kC}$.`],
          teach: 'σ(E) = √(kT²C): the heat capacity sets how much the energy of a body in a bath jitters.',
          explain: t`$\sigma_E = ${T}\sqrt{(1.381\times10^{-23})(${texNum(CC, 3)})} = ${texNum(v, 3)}$ J — about $${texNum(v / EV, 2)}$ eV. Real, but far below anything a thermometer on a block this size could detect.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'energy (arbitrary offset)', ylabel: 'probability', xticks: 0, yticks: 0, curves: [{ fn: 'e^(-(x - 0.5)^2/(2*0.08^2))', domain: [0, 1], color: 'accent' }], arrows: [{ from: [0.5, 0.6065], to: [0.58, 0.6065], color: 'gold', label: 'σ(E)', labelDx: 6 }] }, caption: 'Sketch: the energy of a body in a heat bath is spread about its mean with standard deviation σ(E). For a macroscopic body the width is far narrower than any plot could show.' },
        };
      },
    }),
    num({
      id: 'sigma-N', difficulty: 2,
      gen(r) {
        const L = r.pick([0.1, 0.5, 1, 10]), N = N_AIR * (L * 1e-6) ** 3, v = 1 / Math.sqrt(N);
        return {
          prompt: t`For an ideal gas in the grand canonical ensemble the particle number fluctuates with $\sigma_N^2 = \bar N$. Air at sea level holds $2.547\times10^{25}$ molecules per m³. By what fraction does the number of molecules in an imaginary cube $${L}$ μm on a side fluctuate, $\sigma_N/\bar N$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 / N, feedback: 'σ(N) = √N̄, so σ(N)/N̄ = 1/√N̄.' }, { value: 1 / Math.sqrt(N_AIR * L * 1e-6), feedback: 'Cube the side to get the volume: V = L³.' }], v),
          hints: [t`$\bar N = nL^3$ with $L$ in metres.`, t`$\bar N = ${texNum(N, 3)}$; $\sigma_N/\bar N = 1/\sqrt{\bar N}$.`],
          teach: 'Number fluctuations in an open volume go as 1/√N̄ — the grand canonical counterpart of energy fluctuations.',
          explain: t`$\bar N = ${texNum(N, 3)}$, so $\sigma_N/\bar N = ${texNum(v, 3)}$. Fluctuations like these in volumes the size of a light wavelength scatter blue light more than red: Einstein and Smoluchowski traced the colour of the sky (and the milky shimmer of a fluid at its critical point) to exactly this.`,
          visual: flucPic({ k: 1, mark: N, label: 'σ(N)/N̄ = 1/√N̄', caption: 'Relative number fluctuation in an open volume of ideal gas, on log axes. The gold line marks this volume’s N̄.' }),
        };
      },
    }),
    mcq({
      id: 'what-fluctuates', difficulty: 1,
      prompt: 'In which ensemble does the energy of the system fluctuate while its particle number does not?',
      choices: ['Canonical', 'Microcanonical', 'Grand canonical', 'None: energy is conserved, so it never fluctuates'],
      answer: 0,
      why: { 1: 'Microcanonical fixes the energy: only states with energy U are allowed.', 2: 'Grand canonical lets both energy and particle number fluctuate.', 3: 'Energy is conserved for system plus bath together; the system’s own share changes as heat flows back and forth.' },
      hints: ['Which ensemble has a heat bath but impermeable walls?'],
      teach: 'Canonical: heat crosses the walls, particles do not — so E fluctuates, N does not.',
      explain: 'In the canonical ensemble the system trades energy with a heat bath through walls that stop particles. Energy is conserved overall, but the system’s share of it varies, with σ(E)² = kT²C(V).',
      visual: ensemblesPic({ caption: 'Isolated, heat bath, heat and particle bath.' }),
    }),
    mcq({
      id: 'when-agree', difficulty: 3,
      prompt: 'For which of these systems could the microcanonical and canonical ensembles give noticeably different results?',
      choices: [
        'A cluster of 50 atoms, or a self-gravitating star cluster, whose heat capacity is negative',
        'A litre of air at room temperature',
        'A kilogram of copper at 300 K',
        'A mole of liquid water at its boiling point, away from the critical point',
      ],
      answer: 0,
      why: { 1: 'About 2.5 × 10²² molecules: fluctuations of order 10⁻¹¹ — the ensembles agree.', 2: 'A macroscopic solid: its energy fluctuations at fixed T are tiny compared with U.', 3: 'Two phases coexist, but for a macroscopic sample the ensembles still agree away from the critical point.' },
      hints: ['Ensembles agree when relative fluctuations are tiny, which needs a large N and a positive heat capacity.', t`$\sigma_E^2 = kT^2C_V$ cannot be negative. What if $C_V$ is?`],
      teach: 'Ensembles agree for large systems with positive heat capacity; small systems and negative heat capacities break the equivalence.',
      explain: t`A small cluster fluctuates by tens of percent, so fixing $U$ and fixing $T$ really are different experiments. And a system with $C < 0$ — gravitationally bound stars, or a black hole (T11.2) — cannot sit in stable canonical equilibrium at all, since $\sigma_E^2 = kT^2C$ would be negative: only the microcanonical description makes sense.`,
      visual: flucPic({ caption: 'Relative energy fluctuation of a monatomic gas at fixed T: about 10 % for N = 50, about 10⁻¹² for a mole.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-calorimeter', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([0.05, 0.075, 0.1]), C = r.pick([0.1, 0.3, 1]) * 1e-12, v = Math.sqrt(KB * T * T * C) / EV;
        return {
          prompt: t`An X-ray microcalorimeter on a space telescope measures each photon’s energy from the tiny temperature rise of an absorber held at $T = ${T * 1000}$ mK, with heat capacity $C = ${fmt(C * 1e12, 2)}\ \text{pJ/K}$. Thermodynamic energy fluctuations of the absorber, exchanging heat with its cold bath, set a floor on its resolution. What is $\sigma_E = \sqrt{kT^2C}$, in eV?`,
          answer: v, units: 'eV', tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt(KB * T * C) / EV, feedback: 'The temperature is squared: σ(E) = √(kT²C).' }, { value: Math.sqrt(KB * (T * 1000) ** 2 * C) / EV, feedback: 'Convert millikelvin to kelvin before squaring.' }, { value: Math.sqrt(KB * T * T * C), feedback: 'That is in joules; divide by 1.602 × 10⁻¹⁹ J/eV.' }], v),
          hints: [t`$T = ${T}$ K and $C = ${texNum(C, 2)}$ J/K.`, t`$\sigma_E = T\sqrt{kC}$, then divide by $1.602\times10^{-19}$ J/eV.`],
          teach: 'σ(E) = √(kT²C) is why X-ray microcalorimeters run at tens of millikelvin with picojoule-per-kelvin absorbers.',
          explain: t`$\sigma_E = ${T}\sqrt{(1.381\times10^{-23})(${texNum(C, 2)})} = ${texNum(v * EV, 3)}$ J $= ${fmt(v, 3)}$ eV. Real instruments, such as the Resolve spectrometer on XRISM (50 mK), reach about 5 eV (full width at half maximum) for 6 keV X-rays: the same scale, with a factor from how well the thermometer reads the fluctuation. Halve $T$ and the floor halves; that is why these detectors are cooled so far.`,
          visual: { type: 'graph', params: { x: [0.02, 0.3], y: [0, 8], aspect: 'wide', axesAt: 'edge', xlabel: 'absorber temperature (K)', ylabel: 'σ(E) (eV)', curves: [0.1, 0.3, 1].map((c, k) => ({ fn: `x*sqrt(${KB}*${c}e-12)/${EV}`, domain: [0.02, 0.3], color: ['teal', 'accent', 'violet'][k], label: `C = ${c} pJ/K`, labelAt: 0.2, labelDy: -12 })) }, caption: 'The thermodynamic energy-fluctuation floor σ(E) = T√(kC) against absorber temperature, for three heat capacities. Detector noise adds to it.' },
        };
      },
    }),
    mcq({
      id: 'cp-negative-C', difficulty: 3,
      prompt: t`A system has a **negative** heat capacity: adding energy lowers its temperature. Why can it not settle into stable equilibrium with a large heat bath (the canonical ensemble)?`,
      choices: [
        t`If it is slightly hotter than the bath it loses heat, gets hotter still, and loses more: the deviation grows — and $\sigma_E^2 = kT^2C$ would be negative`,
        'It can: the bath simply supplies the energy it needs',
        'Heat capacity is always positive, so the question has no answer',
        'It reaches equilibrium, but at a temperature below the bath’s',
      ],
      answer: 0,
      why: { 1: 'Follow a small fluctuation: with C < 0, heat flowing out makes the system hotter, so the flow speeds up instead of stopping.', 2: 'Positive C is guaranteed only for systems that can be canonical. Self-gravitating stars and black holes have C < 0.', 3: 'Equal temperatures are needed for equilibrium, but with C < 0 that state is unstable: any nudge runs away.' },
      hints: ['Suppose the system is a little hotter than the bath. Which way does heat flow, and what does that do to its temperature?', t`$C = dU/dT < 0$: losing energy ($dU < 0$) means $dT > 0$.`],
      teach: 'A negative heat capacity makes thermal contact with a bath unstable: only the microcanonical ensemble describes it.',
      explain: t`Hotter than the bath, it loses heat; with $C < 0$ that makes it hotter, so it loses heat faster — a runaway (and the reverse if it starts colder). A star does this as it radiates and contracts; a black hole does it as it evaporates (T11.2). The canonical formula $\sigma_E^2 = kT^2C \ge 0$ already says such systems lie outside the canonical ensemble.`,
      visual: { type: 'graph', params: { x: [0, 4], y: [0, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'energy U', ylabel: 'temperature T', xticks: 0, yticks: 0, curves: [{ fn: '0.6 + 0.8*x', domain: [0, 4], color: 'accent', label: 'C > 0', labelAt: 3.3, labelDy: -10 }, { fn: '4/(x + 0.6)', domain: [0.4, 4], color: 'warn', label: 'C < 0', labelAt: 3.3, labelDy: -10 }], hlines: [{ y: 1.6, color: 'ink3', label: 'bath' }] }, caption: 'Sketch: temperature against energy for an ordinary body (blue) and for one with negative heat capacity (orange). Only the blue one is pushed back towards the bath temperature by heat flow.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §§2.2, 6.1, 7.1', url: 'https://physics.weber.edu/thermal/' },
    { label: 'MIT OCW 8.044 Statistical Physics I (Spring 2013): microcanonical and canonical ensembles', url: 'https://ocw.mit.edu/courses/8-044-statistical-physics-i-spring-2013/' },
    { label: 'Lynden-Bell, Negative specific heat in astronomy, physics and chemistry, Physica A 263, 293 (1999)', url: 'https://doi.org/10.1016/S0378-4371(98)00518-4' },
    { label: 'NASA HEASARC: XRISM and its Resolve microcalorimeter (50 mK, about 5 eV resolution)', url: 'https://heasarc.gsfc.nasa.gov/docs/heasarc/missions/xrism.html' },
  ],
});
