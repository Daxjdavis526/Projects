// Fermi–Dirac and Bose–Einstein statistics — the mean occupation of one
// state, 1/(e^((E−μ)/k_BT) ± 1), against Maxwell–Boltzmann at the same
// temperature: when they agree (E − μ ≫ k_BT) and when they do not. Electrons
// in metals (the Fermi energy, the 0.9-to-0.1 width of the Fermi edge, why
// they barely add to the heat capacity), photons and the CMB (Bose–Einstein
// with μ = 0), helium-4 and London’s ideal-gas estimate of its λ point, the
// degeneracy map nλ³, and white dwarfs. Every number is computed here.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, HBAR, KB, KB_EV, ME, QE, C, T_CMB, MEC2 } from './_constants.js';
import { U_KG } from './_quanta.js';
import { seg, label, r6 } from './_atoms.js';

const t = String.raw;
const kT = (T) => KB_EV * T;                                    // eV
/** A number for display inside math: plain to 4 figures, or ×10ⁿ when small. */
const nice4 = (v) => (Math.abs(v) < 0.01 ? tex(v, 3) : fmt(v, 4));
const fd = (x) => 1 / (Math.exp(x) + 1), be = (x) => 1 / (Math.exp(x) - 1);
/** The free-electron Fermi energy (eV) for n electrons per m³. */
const fermiE = (n) => (HBAR * HBAR * (3 * Math.PI * Math.PI * n) ** (2 / 3)) / (2 * ME) / QE;
// conduction-electron densities (Ashcroft & Mermin, Table 2.1), m⁻³
const METALS = { Na: { name: 'sodium', n: 2.65e28 }, Cu: { name: 'copper', n: 8.47e28 }, Ag: { name: 'silver', n: 5.86e28 }, Au: { name: 'gold', n: 5.90e28 }, Al: { name: 'aluminium', n: 18.1e28 } };
const EF_CU = fermiE(METALS.Cu.n);
const ZETA3 = 1.2020569031595942, ZETA32 = 2.6123753486854883;
const M_HE4 = 4.00260325413 * U_KG, RHO_LHE = 145;                // kg, and kg/m³ for liquid helium-4 near 2.2 K
const lambdaTc = (m, n) => ((2 * Math.PI * HBAR * HBAR) / (m * KB)) * (n / ZETA32) ** (2 / 3);
const photonDensity = (T) => ((2 * ZETA3) / Math.PI ** 2) * ((KB * T) / (HBAR * C)) ** 3;

/** The three occupations against E (eV) at temperature T, for a chemical potential mu (eV): graph curves. */
function occupancy({ T = 300, mu = 0, x = [-0.3, 0.5], show = ['fd', 'be', 'mb'], marks = [], caption, ylabel = 'mean occupation of one state' } = {}) {
  const k = r6(kT(T)), m = r6(mu);
  const curves = [];
  if (show.includes('mb')) curves.push({ fn: `exp(-(x - ${m})/${k})`, color: 'ink3', width: 2, dash: true });
  if (show.includes('fd')) curves.push({ fn: `1/(exp((x - ${m})/${k}) + 1)`, color: 'accent', width: 2.8 });
  if (show.includes('be')) curves.push({ fn: `1/(exp((x - ${m})/${k}) - 1)`, domain: [r6(mu + 0.02 * k), x[1]], color: 'warn', width: 2.8 });
  return {
    type: 'graph',
    params: { x, y: [0, 2], aspect: 'wide', xlabel: 'energy E (eV)', ylabel, axesAt: 'edge', curves, vlines: [{ x: m, label: 'μ', color: 'ink3' }], points: marks },
    caption,
  };
}

/** The degeneracy map: log₁₀ n against log₁₀ T, with the lines nλ³ = 1 for electrons and for helium-4 atoms. */
const degMap = (() => {
  const line = (m) => 1.5 * Math.log10((2 * Math.PI * m * KB) / (H * H));
  const curves = [{ fn: `${r6(line(ME))} + 1.5*x`, color: 'accent', width: 1.8, dash: true }, { fn: `${r6(line(M_HE4))} + 1.5*x`, color: 'good', width: 1.8, dash: true }];
  const P = [
    [Math.log10(300), Math.log10(8.47e28), 'electrons in copper', 'accent', 8, -11],
    [7, Math.log10(7.5e35), 'electrons in a white dwarf', 'accent', -8, -11],
    [Math.log10(1.57e7), Math.log10(6e31), 'electrons in the Sun’s core', 'accent', 8, 13],
    [8, Math.log10(2e44), 'neutrons in a neutron star', 'violet', -8, -11],
    [Math.log10(2.17), Math.log10(2.18e28), 'liquid helium-4 at 2.17 K', 'good', 8, 14],
    [Math.log10(300), Math.log10(2.45e25), 'helium gas, room temperature', 'good', 8, 13],
  ];
  return {
    type: 'graph',
    params: {
      x: [-0.5, 10.5], y: [18, 46], xlog: true, ylog: true, aspect: 'wide', xlabel: 'temperature T (K)', ylabel: 'particles per m³', axesAt: 'edge',
      curves,
      points: [...P.map(([x, y, txt, c, dx, dy]) => ({ x: r6(x), y: r6(y), r: 5, color: c, label: txt, labelDx: dx, labelDy: dy, ...(dx < 0 ? { labelAlign: 'right' } : {}) })),
        label(5.2, line(ME) + 1.5 * 5.2, 'nλ³ = 1 for electrons', 'accent', 6, 14, 'left'), label(3.6, line(M_HE4) + 1.5 * 3.6, 'nλ³ = 1 for helium-4', 'good', -6, -12, 'right')],
    },
    caption: 'Where quantum statistics matter: above its dashed line (nλ³ > 1, with λ = h/√(2πmkT) the thermal de Broglie wavelength) a gas of that particle is degenerate — its states are crowded and Fermi–Dirac or Bose–Einstein statistics are needed; far below, Maxwell–Boltzmann is fine. The line for neutrons lies just below helium’s. Densities and temperatures are typical values.',
  };
})();

export default lesson({
  id: 'phys2710.MP10.2',
  title: 'Fermi–Dirac and Bose–Einstein statistics',
  minutes: 16, difficulty: 3,
  intro: t`Maxwell–Boltzmann statistics assumes no state is ever crowded. For identical particles that fails when the states fill up: fermions can never put two in one state, and bosons gather in states already occupied. In equilibrium at temperature $T$, the mean number of particles in one state of energy $E$ is

$$\bar n(E) = \frac{1}{e^{(E - \mu)/k_BT} \pm 1}$$

with $+1$ for fermions (**Fermi–Dirac**) and $-1$ for bosons (**Bose–Einstein**). Where $E - \mu \gg k_BT$ the $\pm1$ is negligible and both become the Maxwell–Boltzmann $e^{-(E - \mu)/k_BT}$. Where it is not, the difference is everything: Fermi–Dirac never exceeds 1, which holds metals together and white dwarfs up; Bose–Einstein grows without limit as $E \to \mu$, which gives Planck’s law and superfluid helium.

> The Boltzmann factor came in [Maxwell–Boltzmann statistics](#/lesson/phys2710.MP10.1), and the rule of one fermion per state in [The exclusion principle](#/lesson/phys2710.MP9.1).`,
  symbols: [
    { tex: '\\bar n(E)', text: 'the mean occupation: the average number of particles in one single-particle state of energy $E$ (for fermions, the probability that it is filled)' },
    { tex: 'E', text: 'the energy of the state, usually in eV' },
    { tex: '\\mu', text: 'the chemical potential: the energy that fixes the total number of particles. For electrons in a metal near $T = 0$ it is the **Fermi energy** $E_F$; for photons, whose number is not conserved, it is 0' },
    { tex: 'k_BT', text: t`the thermal energy, $${fmt(KB_EV * 1e5, 5)}\times10^{-5}$ eV/K times the temperature: 0.0259 eV at 300 K` },
    { tex: '\\pm 1', text: '$+1$ for fermions (half-integer spin: electrons, protons, neutrons, helium-3); $-1$ for bosons (integer spin: photons, helium-4)' },
  ],
  why: 'Fermi–Dirac statistics runs every metal, semiconductor and white dwarf; Bose–Einstein statistics gives the blackbody spectrum, the cosmic microwave background, lasers and superfluids.',
  visual: {
    type: 'graph',
    title: 'Three statistics at one temperature',
    lead: t`The mean occupation of one state against its energy above the chemical potential $\mu$: Fermi–Dirac (blue), Bose–Einstein (orange) and Maxwell–Boltzmann (dashed). Set the temperature.`,
    tasks: [
      'At 300 K (kT = 0.026 eV), go to E − μ = 0.1 eV: all three curves agree to within a few per cent. Far above μ, a state is rarely occupied and its statistics do not matter.',
      'Lower T to 10 K: Fermi–Dirac becomes a step — every state below μ full, every state above empty — while Bose–Einstein shoots up just above μ.',
      'Raise T to 3000 K: the Fermi step softens over a few tenths of an eV, but Fermi–Dirac still never passes 1.',
    ],
    params: {
      x: [-0.3, 0.5], y: [0, 2], aspect: 'wide', xlabel: 'energy above the chemical potential, E − μ (eV)', ylabel: 'mean occupation of one state', axesAt: 'edge',
      constants: { k: r6(KB_EV) },
      sliders: [{ key: 'T', label: 'Temperature $T$', min: 10, max: 3000, value: 300, logScale: true, unit: '\\mathrm{K}', explain: 'Sets $k_BT$, the width over which the occupations change.' }],
      curves: [
        { fn: 'exp(-x/(k*T))', color: 'ink3', width: 2, dash: true },
        { fn: '1/(exp(x/(k*T)) + 1)', color: 'accent', width: 2.8 },
        { fn: '1/(exp(x/(k*T)) - 1)', domain: ['0.002', '0.5'], color: 'warn', width: 2.8 },
      ],
      vlines: [{ x: 0, label: 'μ', color: 'ink3' }],
      hlines: [{ y: 1, color: 'ink4' }],
      legend: [{ label: 'Fermi–Dirac', color: 'accent' }, { label: 'Bose–Einstein', color: 'warn' }, { label: 'Maxwell–Boltzmann', color: 'ink3', dash: true }],
      readouts: [{ label: '$k_BT$', expr: 'k*T', unit: '\\mathrm{eV}', digits: 3 }, { label: 'Fermi–Dirac at $E - \\mu = 0.1$ eV', expr: '1/(exp(0.1/(k*T)) + 1)', digits: 3 }, { label: 'Maxwell–Boltzmann there', expr: 'exp(-0.1/(k*T))', digits: 3 }],
    },
    caption: 'The three mean occupations at one temperature and one chemical potential. Bose–Einstein is drawn only above μ: for bosons μ must lie below every state, or the occupations would be negative.',
  },
  example: {
    prompt: t`Copper has $n = 8.47\times10^{28}$ conduction electrons per cubic metre. Treating them as a free gas of fermions, find the Fermi energy, and the occupation of states 0.1 eV above and below it at 300 K.`,
    visual: occupancy({ T: 300, mu: EF_CU, x: [EF_CU - 0.45, EF_CU + 0.45], show: ['fd'], marks: [{ x: r6(EF_CU + 0.1), y: r6(fd(0.1 / kT(300))), r: 5, color: 'gold' }, { x: r6(EF_CU - 0.1), y: r6(fd(-0.1 / kT(300))), r: 5, color: 'gold' }], caption: 'Fermi–Dirac occupation of copper’s conduction-electron states near the Fermi energy, at 300 K. Only a band a few kT wide is neither full nor empty.' }),
    steps: [
      { label: 'Count states', text: t`Electrons in a box of volume $V$ fill momentum states up to the Fermi momentum $p_F$, two per state (two spins). A sphere of radius $p_F$ holds $2\cdot\dfrac{V}{h^3}\cdot\dfrac{4\pi}{3}p_F^3$ states; setting that equal to $nV$ gives $p_F = \hbar(3\pi^2n)^{1/3}$.` },
      { label: 'The Fermi energy', text: t`$E_F = \dfrac{p_F^2}{2m} = \dfrac{\hbar^2}{2m}(3\pi^2n)^{2/3} = ${fmt(EF_CU, 3)}$ eV. The Fermi temperature $E_F/k_B = ${fmt(EF_CU / KB_EV, 3)}$ K: room temperature is only ${fmt((100 * 300 * KB_EV) / EF_CU, 2)}% of it.` },
      { label: 'Above the edge', text: t`At 300 K, $k_BT = ${fmt(kT(300), 4)}$ eV, so 0.1 eV is ${fmt(0.1 / kT(300), 3)} $k_BT$: $\bar n = 1/(e^{${fmt(0.1 / kT(300), 3)}} + 1) = ${fmt(fd(0.1 / kT(300)), 3)}$.` },
      { label: 'Below the edge', text: t`$\bar n = 1/(e^{-${fmt(0.1 / kT(300), 3)}} + 1) = ${fmt(fd(-0.1 / kT(300)), 3)}$ — the states are as likely to be empty below as filled above: Fermi–Dirac is symmetric about $E_F$.` },
      { label: 'Sense check', text: t`$E_F \gg k_BT$: copper’s electrons fill their states almost exactly as at absolute zero, and the fastest move at $v_F = \sqrt{2E_F/m} = ${fmt(Math.sqrt((2 * EF_CU * QE) / ME) / 1e6, 3)}\times10^{6}$ m/s even in a cold wire. The Fermi energy comes from the exclusion principle, not from heat.` },
    ],
    answer: t`$E_F = ${fmt(EF_CU, 3)}$ eV; at 300 K the occupation is ${fmt(fd(0.1 / kT(300)), 3)} at $E_F + 0.1$ eV and ${fmt(fd(-0.1 / kT(300)), 3)} at $E_F - 0.1$ eV.`,
  },
  practice: [
    num({
      id: 'fd-occupation', difficulty: 1,
      gen(r) {
        const T = r.pick([77, 300, 600, 1200]), d = r.pick([-0.05, 0.03, 0.05, 0.08, 0.12]), x = d / kT(T), ans = fd(x);
        return {
          prompt: t`What is the probability that an electron state ${Math.abs(d)} eV ${d > 0 ? 'above' : 'below'} the Fermi energy of a metal is occupied at ${T} K?`,
          answer: ans, tol: { rel: 0.01, abs: 1e-6 },
          errors: [{ value: 1 - ans, feedback: t`That is the probability that it is *empty*. For a state ${d > 0 ? 'above' : 'below'} $E_F$ the occupation is ${d > 0 ? 'below' : 'above'} ½.` }, ...(d > 0 && Math.abs(Math.exp(-x) - ans) > 0.02 * ans ? [{ value: Math.exp(-x), feedback: t`That is the Maxwell–Boltzmann factor. Fermi–Dirac has the $+1$: $1/(e^{x} + 1)$.` }] : [])],
          hints: [t`$\bar n = 1/(e^{(E - E_F)/k_BT} + 1)$ with $E - E_F = ${d}$ eV.`, t`$k_BT = ${fmt(kT(T), 4)}$ eV, so the exponent is $${fmt(x, 4)}$.`],
          teach: t`Fermi–Dirac occupation is $1/(e^{(E - E_F)/k_BT} + 1)$: ½ at $E_F$, near 1 a few $k_BT$ below it, near 0 a few $k_BT$ above.`,
          explain: t`$(E - E_F)/k_BT = ${fmt(x, 4)}$, so $\bar n = 1/(e^{${fmt(x, 4)}} + 1) = ${nice4(ans)}$.`,
          visual: occupancy({ T, mu: 0, x: [-0.3, 0.3], show: ['fd'], caption: t`The Fermi–Dirac occupation at ${T} K, with energies measured from $\mu = E_F$.`, ylabel: 'occupation' }),
        };
      },
    }),
    num({
      id: 'fermi-energy', difficulty: 2,
      gen(r) {
        const key = r.pick(['Na', 'Ag', 'Au', 'Al']), { name, n } = METALS[key], ans = fermiE(n);
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} has $${tex(n, 3)}$ conduction electrons per cubic metre. What is its free-electron Fermi energy, in eV?`,
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: ans * 2 ** (2 / 3), feedback: t`Each momentum state holds two electrons (spin up and down): $p_F = \hbar(3\pi^2 n)^{1/3}$, not $\hbar(6\pi^2 n)^{1/3}$.` }, { value: ans * 2, feedback: t`$E_F = p_F^2/2m$: keep the 2 in the denominator.` }],
          hints: [t`$E_F = \dfrac{\hbar^2}{2m}(3\pi^2 n)^{2/3}$, with $\hbar = 1.0546\times10^{-34}$ J s and $m = 9.109\times10^{-31}$ kg.`, t`$(3\pi^2n)^{2/3} = ${tex((3 * Math.PI ** 2 * n) ** (2 / 3), 4)}\ \text{m}^{-2}$; divide the result in joules by $1.602\times10^{-19}$.`],
          teach: t`The Fermi energy depends only on the electron density, $E_F = (\hbar^2/2m)(3\pi^2n)^{2/3}$: a few eV for every metal.`,
          explain: t`$E_F = ${fmt(ans, 3)}$ eV, so $T_F = ${tex(ans / KB_EV, 3)}$ K. Every common metal has $E_F$ between about 2 and 12 eV — hundreds of times $k_BT$ at room temperature.`,
          visual: occupancy({ T: 300, mu: 0, x: [-0.6, 0.6], show: ['fd'], caption: t`A metal’s conduction-electron states near the top of the filled sea, at 300 K: the edge is only a few $k_BT$ wide. The energy axis is measured from $E_F$, which is what the question asks for.` }),
        };
      },
    }),
    num({
      id: 'cmb-occupation', difficulty: 2,
      gen(r) {
        const nu = r.pick([30, 70, 160, 353, 600]), x = (H * nu * 1e9) / (KB * T_CMB), ans = be(x);
        return {
          prompt: t`Photons are bosons with $\mu = 0$. In the cosmic microwave background ($T = ${T_CMB}$ K), what is the mean number of photons in one mode (one state) of frequency ${nu} GHz?`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-x), feedback: t`That is the Maxwell–Boltzmann factor. Photons are bosons: $1/(e^{h\nu/k_BT} - 1)$.` }, { value: fd(x), feedback: t`That is Fermi–Dirac. Photons are bosons, with $-1$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\bar n = 1/(e^{h\nu/k_BT} - 1)$.`, t`$h\nu/k_BT = \dfrac{(6.626\times10^{-34})(${nu}\times10^{9})}{(1.381\times10^{-23})(${T_CMB})} = ${fmt(x, 4)}$.`],
          teach: t`A photon mode holds on average $1/(e^{h\nu/k_BT} - 1)$ photons: many at low frequency, where light behaves like a classical wave, and few at high.`,
          explain: t`$\bar n = 1/(e^{${fmt(x, 4)}} - 1) = ${x > 5 ? tex(ans, 3) : fmt(ans, 3)}$. ${x < 1 ? 'More than one photon per mode: at radio frequencies the background behaves like a classical wave.' : x > 5 ? 'Far less than one: in the Wien tail, photons arrive one at a time.' : 'Planck’s law is this occupation times the number of modes per frequency, times hν.'}`,
          visual: { type: 'graph', params: { x: [0, 700], y: [0, 3], aspect: 'wide', xlabel: 'frequency ν (GHz)', ylabel: 'photons per mode', axesAt: 'edge', curves: [{ fn: `1/(exp(${r6((H * 1e9) / (KB * T_CMB))}*x) - 1)`, domain: [5, 700], color: 'warn', width: 2.6 }], vlines: [{ x: nu, label: `${nu} GHz`, color: 'ink3' }] }, caption: 'The Bose–Einstein occupation of the background’s photon modes at 2.725 K (μ = 0). The value at the marked frequency is left to read.' },
        };
      },
    }),
    match({
      id: 'which-statistics', difficulty: 2,
      prompt: 'Match each system to the statistics its particles need.',
      left: ['the conduction electrons in copper', 'the photons of the cosmic microwave background', 'nitrogen molecules in the air of a room', 'liquid helium-4 below 2.17 K', 'the neutrons inside a neutron star'],
      right: ['Fermi–Dirac', 'Bose–Einstein (with μ = 0)', 'Maxwell–Boltzmann', 'Bose–Einstein, with a condensate', 'none: quantum statistics never apply'],
      answer: [0, 1, 2, 3, 0],
      hints: ['Fermions (electrons, neutrons) need Fermi–Dirac when crowded; bosons (photons, helium-4) need Bose–Einstein; a sparse gas of anything is Maxwell–Boltzmann.'],
      teach: 'Spin decides which quantum statistics; crowding (nλ³ ≳ 1) decides whether it matters.',
      explain: 'Copper’s electrons and a neutron star’s neutrons are fermions packed far above nλ³ = 1: Fermi–Dirac. Photons are bosons whose number is not conserved, so μ = 0. Room air has nλ³ ≈ 10⁻⁷: Maxwell–Boltzmann. Below 2.17 K a macroscopic share of helium-4 atoms occupies one state — a condensate, the root of superfluidity.',
      visual: degMap,
    }),
    mcq({
      id: 'heat-capacity', difficulty: 2,
      prompt: t`Classical physics predicts that copper’s free electrons should add $\tfrac32 k_B$ to the heat capacity for every electron. At room temperature they add about a hundred times less. Why?`,
      choices: [
        t`Only electrons within about $k_BT$ of the Fermi energy can take up heat; the rest have no empty states nearby to move into`,
        'The conduction electrons are bound to their atoms and cannot move',
        'Electrons are too light to store thermal energy',
        'At room temperature the electrons are nearly at rest, so they have no kinetic energy to change',
      ],
      answer: 0,
      why: {
        1: 'They are free enough to carry current — that is what made the missing heat capacity a puzzle.',
        2: t`Equipartition gives every particle $\tfrac32 k_BT$ whatever its mass.`,
        3: t`The reverse: even at absolute zero they fill states up to $E_F \approx 7$ eV, moving at over $10^6$ m/s. That energy comes from the exclusion principle, not from heat.`,
      },
      hints: [t`An electron 1 eV below $E_F$ would have to gain 1 eV — forty times $k_BT$ — to find an empty state.`],
      teach: t`In a degenerate Fermi gas only a fraction of about $k_BT/E_F$ of the electrons, those near the Fermi edge, can take up heat.`,
      explain: t`Heating by $k_BT$ can only lift electrons from just below $E_F$ to just above it: a fraction of order $k_BT/E_F = ${fmt(kT(300) / EF_CU, 2)}$ of them. Sommerfeld’s 1928 Fermi–Dirac theory gave the electrons’ heat capacity as $\tfrac{\pi^2}{2}\tfrac{k_BT}{E_F}k_B$ per electron — about 1% of the classical value, as measured.`,
      visual: occupancy({ T: 300, mu: 0, x: [-0.4, 0.4], show: ['fd'], caption: 'The Fermi–Dirac occupation near a metal’s Fermi energy at 300 K: deep states are full, and their electrons have nowhere to go.', ylabel: 'occupation' }),
    }),
    num({
      id: 'lambda-point', difficulty: 3,
      gen(r) {
        const rho = r.pick([125, 145, 162]);
        const n = rho / M_HE4, Tc = lambdaTc(M_HE4, n);
        return {
          prompt: t`An ideal gas of bosons of mass $m$ and density $n$ condenses — a macroscopic share of its atoms crowds into the lowest state — below $T_c = \dfrac{2\pi\hbar^2}{mk_B}\left(\dfrac{n}{2.612}\right)^{2/3}$. In 1938 Fritz London applied this to liquid helium-4. Taking its density as ${rho} kg/m³ (atomic mass $${fmt(4.002603, 7)}$ u), what $T_c$ does the formula give, in K?`,
          answer: Tc, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: lambdaTc(M_HE4, rho / (M_HE4 / 4.002603)), feedback: t`Divide by the mass of one atom, $4.0026\ \text{u} = ${tex(M_HE4, 4)}$ kg, to get atoms per m³.` }],
          hints: [t`First $n = \rho/m = ${rho}/(${tex(M_HE4, 4)}\ \text{kg})$.`, t`Then $2\pi\hbar^2/(mk_B) = ${tex((2 * Math.PI * HBAR * HBAR) / (M_HE4 * KB), 4)}$ m² K; multiply by $(n/2.612)^{2/3}$.`],
          teach: 'Bose–Einstein condensation sets in when the thermal de Broglie wavelength grows to the spacing between atoms.',
          explain: t`$n = ${tex(n, 3)}\ \text{m}^{-3}$ and $T_c = ${fmt(Tc, 3)}$ K. Helium really turns superfluid at 2.17 K: London’s ideal gas got the scale right, though liquid helium is anything but ideal — its atoms interact strongly, and only about 10% of them occupy the condensate.`,
          visual: degMap,
        };
      },
    }),
    code({
      id: 'fermi-edge', difficulty: 2,
      prompt: t`Write \`fd(E, mu, T)\` that **returns** the Fermi–Dirac occupation for energies \`E\` and \`mu\` in eV and temperature \`T\` in K ($k_B = 8.617333\times10^{-5}$ eV/K); it should work on NumPy arrays. Then find \`width\`: the energy range, in eV, over which the occupation falls from 0.9 to 0.1 at 300 K. Sample $E$ finely, e.g. with \`np.linspace\`, and print \`width\`.`,
      starter: t`import numpy as np

kB = 8.617333e-5     # eV/K

def fd(E, mu, T):
    pass

width = None
print(width)
`,
      answer: t`import numpy as np

kB = 8.617333e-5     # eV/K

def fd(E, mu, T):
    return 1 / (np.exp((E - mu) / (kB * T)) + 1)

E = np.linspace(-0.5, 0.5, 200001)
f = fd(E, 0.0, 300)
width = E[f <= 0.1][0] - E[f <= 0.9][0]
print(width)`,
      tests: [
        { name: 'half full at the Fermi energy', code: 'abs(fd(7.0, 7.0, 300) - 0.5) < 1e-12' },
        { name: t`${fmt(fd(0.1 / kT(300)), 3)} occupied 0.1 eV above it at 300 K`, code: `abs(fd(7.1, 7.0, 300) - ${r6(fd(0.1 / kT(300)))}) < 1e-4` },
        { name: 'works on arrays', code: 'len(fd(np.array([1.0, 2.0, 3.0]), 2.0, 300)) == 3' },
        { name: t`the 0.9-to-0.1 width at 300 K is ${fmt(2 * Math.log(9) * kT(300), 4)} eV`, code: `abs(width - ${r6(2 * Math.log(9) * kT(300))}) < 2e-4` },
      ],
      hints: [t`\`return 1 / (np.exp((E - mu) / (kB * T)) + 1)\` works for numbers and arrays alike.`, t`Make \`E = np.linspace(-0.5, 0.5, 200001)\`, compute \`f = fd(E, 0, 300)\`, and take the first \`E\` where \`f <= 0.1\` minus the first where \`f <= 0.9\`.`],
      teach: 'The Fermi edge is a few kT wide: the occupation falls from 0.9 to 0.1 over 2 ln 9 kT ≈ 4.4 kT.',
      explain: t`Solving $1/(e^x + 1) = 0.9$ and $0.1$ gives $x = \mp\ln 9$, so the width is $2\ln 9\,k_BT = 4.39\,k_BT = ${fmt(2 * Math.log(9) * kT(300), 4)}$ eV at 300 K — under 2% of copper’s 7 eV Fermi energy. The same function, with $\mu$ in the band gap, decides how many electrons a semiconductor lets conduct (module MP12).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-white-dwarf', difficulty: 3, transfer: true,
      gen(r) {
        const [Msun, Rkm, who] = r.pick([[1.02, 5800, 'Sirius B'], [0.6, 8700, 'a typical white dwarf'], [1.2, 4500, 'a heavy white dwarf']]);
        const M = Msun * 1.98841e30, R = Rkm * 1e3, rho = M / ((4 / 3) * Math.PI * R ** 3), ne = rho / (2 * U_KG);
        const pFc = (HBAR * (3 * Math.PI ** 2 * ne) ** (1 / 3) * C) / QE / 1000;
        return {
          prompt: t`${who[0].toUpperCase() + who.slice(1)} packs about ${Msun} solar masses ($1.988\times10^{30}$ kg each) into a sphere of radius ${Rkm.toLocaleString('en-US').replace(',', ' ')} km. It is made of carbon and oxygen, which have one electron for every two nucleons. Using the mean density, find the electrons’ Fermi momentum as an energy, $p_Fc$, in keV. ($m_u = 1.6605\times10^{-27}$ kg.)`,
          answer: pFc, units: 'keV', tol: { rel: 0.02 },
          errors: [{ value: pFc * 2 ** (1 / 3), feedback: t`One electron per *two* nucleons: $n_e = \rho/(2m_u)$.` }, { value: pFc / 2 ** (1 / 3), feedback: t`Two electrons per momentum state: $p_F = \hbar(3\pi^2n)^{1/3}$.` }],
          hints: [t`$\rho = M/(\tfrac43\pi R^3)$, and $n_e = \rho/(2m_u)$.`, t`$p_F = \hbar(3\pi^2n_e)^{1/3}$; multiply by $c$ and divide by $1.602\times10^{-16}$ J/keV.`],
          teach: 'A white dwarf’s electrons are a degenerate Fermi gas whose Fermi momentum approaches mₑc — the start of the road to the Chandrasekhar limit.',
          explain: t`$\rho = ${tex(rho, 3)}$ kg/m³, $n_e = ${tex(ne, 3)}\ \text{m}^{-3}$ and $p_Fc = ${fmt(pFc, 3)}$ keV — comparable to $m_ec^2 = ${fmt(MEC2 * 1000, 4)}$ keV, so the fastest electrons are relativistic. The star’s interior is some $10^7$ K, $k_BT \approx 1$ keV: far below the Fermi energy, so the pressure holding the star up comes from exclusion, not heat. As the mass grows, the electrons become fully relativistic and their pressure can no longer keep pace with gravity: Chandrasekhar’s limit, about 1.4 solar masses.`,
          visual: degMap,
        };
      },
    }),
    num({
      id: 'cp-cmb-photons', difficulty: 2, transfer: true,
      gen(r) {
        const [T, when] = r.pick([[T_CMB, 'today'], [3000, 'when the universe became transparent, at about 3000 K'], [10.9, 'when the universe was a quarter of its present size']]);
        const ans = photonDensity(T) / 1e6;
        return {
          prompt: t`Summing the Bose–Einstein occupation over every photon mode gives the number of photons per volume in blackbody radiation, $n_\gamma = \dfrac{2\zeta(3)}{\pi^2}\left(\dfrac{k_BT}{\hbar c}\right)^3$ with $\zeta(3) = 1.202$. How many cosmic-background photons were there per cubic centimetre ${when}${T === T_CMB ? ` ($T = ${T_CMB}$ K)` : ''}?`,
          answer: ans, units: 'cm^-3', tol: { rel: 0.01 },
          errors: [{ value: ans * 1e6, feedback: t`That is per cubic metre; a cubic centimetre is $10^{-6}$ m³.` }],
          hints: [t`$k_BT/\hbar c = \dfrac{(1.381\times10^{-23})(${T})}{(1.0546\times10^{-34})(2.998\times10^{8})}\ \text{m}^{-1}$.`, t`Cube it, multiply by $2(1.202)/\pi^2 = 0.2436$, and convert m⁻³ to cm⁻³.`],
          teach: 'Blackbody radiation holds about 0.24 (kT/ħc)³ photons per volume: 411 per cm³ in today’s microwave background.',
          explain: t`$n_\gamma = ${T > 100 ? tex(ans, 3) : fmt(ans, 3)}\ \text{cm}^{-3}$. Today there are about 411 background photons in every cubic centimetre, around a billion for each proton in the universe. The number scales as $T^3$, as the universe’s volume shrinks as $(1+z)^{-3}$ looking back.`,
          visual: { type: 'mp-blackbody', params: { T: 2.72548, axis: 'nu', controls: false, readout: false, swatch: false }, caption: 'The cosmic microwave background’s spectrum per unit frequency: Planck’s law, which is Bose–Einstein occupation times the density of photon modes times hν.' },
        };
      },
    }),
    mcq({
      id: 'cp-zero', difficulty: 2,
      prompt: 'Cool a gas of fermions and a gas of bosons towards absolute zero. Which describes their ground states?',
      choices: [
        'The fermions fill every state up to the Fermi energy, one per state; the bosons can all sit in the single lowest state',
        'Both settle into the single lowest state, with no energy left',
        'The fermions all sit in the lowest state, and the bosons spread out to avoid each other',
        'Both freeze into a classical crystal, with every particle at rest',
      ],
      answer: 0,
      why: {
        1: 'Fermions cannot share a state: the lowest one holds at most one per spin direction, so they must stack up to the Fermi energy.',
        2: 'It is the other way round: exclusion spreads the fermions out, while bosons crowd together.',
        3: 'Quantum particles cannot be at rest in a definite place (the uncertainty principle), and fermions keep their Fermi energy even at absolute zero.',
      },
      hints: ['What does Fermi–Dirac occupation look like at T = 0? And Bose–Einstein?'],
      teach: 'At absolute zero, fermions form a filled Fermi sea and bosons fall into one state.',
      explain: t`At $T = 0$ the Fermi–Dirac occupation is a step: every state below $E_F$ full, every one above empty. Bose–Einstein puts all the particles in the lowest state. That difference is why white dwarfs resist collapse and why liquid helium-4 can flow without friction.`,
      visual: occupancy({ T: 10, mu: 0, x: [-0.3, 0.3], show: ['fd', 'be'], caption: 'Fermi–Dirac (blue) and Bose–Einstein (orange) occupations at 10 K, nearly absolute zero on this scale of energies.' }),
    }),
  ],
  sources: [
    { label: 'Ashcroft & Mermin, Solid State Physics (1976), Table 2.1: free-electron densities and Fermi energies', url: 'https://openlibrary.org/works/OL2741869W' },
    { label: 'OpenStax University Physics Vol. 3, §9.5 Free electron model of metals', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-5-free-electron-model-of-metals' },
    { label: 'Fixsen (2009), The temperature of the cosmic microwave background, ApJ 707, 916', url: 'https://doi.org/10.1088/0004-637X/707/2/916' },
    { label: 'London (1938), The λ-phenomenon of liquid helium and the Bose–Einstein degeneracy, Nature 141, 643', url: 'https://doi.org/10.1038/141643a0' },
    { label: 'Bond et al. (2017), The Sirius system and its astrophysical puzzles, ApJ 840, 70', url: 'https://doi.org/10.3847/1538-4357/aa6af8' },
  ],
});
