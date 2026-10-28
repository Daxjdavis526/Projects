// Degenerate Fermi gases: the Fermi energy from counting box states; the
// density of states g(ε) ∝ √ε; U = (3/5)NE_F and the degeneracy pressure
// P = (2/5)nE_F (bulk moduli of the alkali metals against the free-electron
// estimate); Sommerfeld's C = (π²/2)Nk(kT/E_F); μ(T) found numerically; and
// — as labelled pointers — white dwarfs (the Chandrasekhar mass, T11.1) and
// neutron stars.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, H, EV, NA, AMU, ME, MNEUTRON, CL, fermiE, r4, texNum, apart } from './_stat.js';

const t = String.raw;
// metals near room temperature: density (kg/m³), molar mass (kg/mol), valence, measured bulk modulus (GPa, CRC / WebElements)
const METAL = {
  Na: { name: 'sodium', rho: 968, M: 0.02298977, z: 1, B: 6.3 },
  K: { name: 'potassium', rho: 862, M: 0.0390983, z: 1, B: 3.1 },
  Mg: { name: 'magnesium', rho: 1738, M: 0.024305, z: 2, B: 45 },
  Al: { name: 'aluminium', rho: 2700, M: 0.0269815, z: 3, B: 76 },
  Cu: { name: 'copper', rho: 8960, M: 0.063546, z: 1, B: 140 },
};
for (const m of Object.values(METAL)) { m.n = (m.z * m.rho * NA) / m.M; m.EF = fermiE(m.n); }
const MEC2_KEV = (ME * CL * CL) / EV / 1000;
const muS = (tt) => 1 - (Math.PI ** 2 / 12) * tt * tt - (Math.PI ** 4 / 80) * tt ** 4;   // Sommerfeld, in units of E_F
const MU_S = '(1 - 0.822467*t^2 - 1.217614*t^4)';
const EX = METAL.Na;
EX.Bfree = (2 / 3) * EX.n * EX.EF;

/** The occupied density of states at temperature t = kT/E_F. */
function seaPic({ tt = 0.05, caption, mark = null }) {
  const mu = r4(muS(tt));
  const occ = `1.5*sqrt(x)/(e^((x - ${mu})/${tt}) + 1)`;
  return {
    type: 'graph',
    params: { x: [0, 1.6], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'ε / E(F)', ylabel: 'states per energy (×N/E(F))',
      curves: [{ fn: '1.5*sqrt(x)', domain: [0, 1.6], color: 'ink3', dash: true, label: 'g(ε)', labelAt: 1.45, labelDy: -8 }, { fn: occ, domain: [0, 1.6], color: 'accent' }],
      shade: [{ fn: occ, lower: '0', from: 0, to: 1.6, color: 'accent', alpha: 0.3 }],
      vlines: mark === null ? [{ x: 1, color: 'gold', label: 'E(F)' }] : [{ x: 1, color: 'gold', label: 'E(F)' }, { x: r4(mark), color: 'warn' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T7.3',
  title: 'Degenerate Fermi gases',
  minutes: 18, difficulty: 3,
  intro: t`Cool a gas of fermions and they cannot all drop into the lowest state: exclusion stacks them one per state (two, counting spin) up to an energy called the **Fermi energy**. For $N$ particles of mass $m$ in a box of volume $V$, counting the box’s standing waves gives

$$E_F = \frac{h^2}{8m}\left(\frac{3N}{\pi V}\right)^{2/3}.$$

For the conduction electrons of a metal $E_F$ is several eV — tens of thousands of kelvin — so at room temperature they are **degenerate**: almost every state below $E_F$ is full, and only those within a few $kT$ of it can change. That one fact explains why electrons add so little to a metal’s heat capacity, why metals resist compression, and why a dead star the size of Earth does not collapse. [PHYS 2710 MP12.2](#/lesson/phys2710.MP12.2) used $E_F$; here it is derived, with its energy, pressure and heat capacity.`,
  symbols: [
    { tex: 'E_F', text: 'the Fermi energy: the highest occupied single-particle energy at $T = 0$, in J or eV' },
    { tex: 'h', text: 'Planck’s constant, $6.626\\times10^{-34}$ J s' },
    { tex: 'm', text: 'the mass of one fermion (an electron: $9.109\\times10^{-31}$ kg)' },
    { tex: 'N/V', text: 'the number density of the fermions, in m⁻³ (for a metal: atoms per m³ times electrons given per atom)' },
    { tex: '3/\\pi', text: 'from filling one octant of a sphere in the space of box quantum numbers, with two spin states per point' },
  ],
  why: 'Degenerate fermions are the electrons of every metal and semiconductor, the matter of white dwarfs and neutron stars, and the reason ordinary matter takes up room at all.',
  visual: {
    type: 'graph',
    title: 'The Fermi sea',
    lead: t`The dashed curve is the **density of states** $g(\varepsilon) \propto \sqrt\varepsilon$: how many single-particle states there are per unit energy. The shaded area is how many are filled, $g(\varepsilon)\,\bar n_\text{FD}(\varepsilon)$, at temperature $kT$ (in units of $E_F$). Warm the gas and watch what changes — and what does not.`,
    tasks: [
      'At kT = 0.005 E(F) (copper at about 400 K) the sea is a sharp-edged block: the edge is smeared only over a few kT.',
      'Warm to kT = 0.1 E(F): electrons from just below E(F) move just above it; the bulk of the sea is untouched.',
      'Read the heat capacity: (π²/2)(kT/E(F)) per electron, a small fraction of the classical 3/2.',
    ],
    params: {
      x: [0, 1.6], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'ε / E(F)', ylabel: 'states per energy (×N/E(F))',
      sliders: [{ key: 't', label: 'Temperature $kT/E_F$', min: 0.005, max: 0.3, step: 0.005, value: 0.05, explain: 'For copper, kT/E(F) = 0.01 is 818 K; for a white dwarf’s core, about 0.01–0.1.' }],
      curves: [
        { fn: '1.5*sqrt(x)', domain: [0, 1.6], color: 'ink3', dash: true, label: 'g(ε)', labelAt: 1.45, labelDy: -8 },
        { fn: `1.5*sqrt(x)/(e^((x - ${MU_S})/t) + 1)`, domain: [0, 1.6], color: 'accent' },
      ],
      shade: [{ fn: `1.5*sqrt(x)/(e^((x - ${MU_S})/t) + 1)`, lower: '0', from: 0, to: 1.6, color: 'accent', alpha: 0.3 }],
      vlines: [{ x: 1, color: 'gold', label: 'E(F)' }],
      readouts: [
        { label: '$\\mu/E_F$', expr: MU_S, digits: 4 },
        { label: 'heat capacity per electron, $C/Nk$', expr: '(pi^2/2)*t', digits: 3 },
        { label: 'copper at this $kT/E_F$ (K)', expr: `t*${r4(METAL.Cu.EF / KB)}`, digits: 3 },
      ],
    },
    caption: 'An ideal Fermi gas in three dimensions. μ(T) from the Sommerfeld expansion (within 0.2 % of the exact value over this range). Real metals’ densities of states depart from √ε, but the degeneracy is just as strong.',
  },
  example: {
    prompt: t`Sodium (density $${EX.rho}$ kg/m³, molar mass $22.99$ g/mol) gives one conduction electron per atom. Find its Fermi energy and Fermi temperature, the electrons’ degeneracy pressure, and the bulk modulus $B = -V\,\partial P/\partial V$ they alone would give.`,
    visual: seaPic({ tt: (300 * KB) / EX.EF, caption: 'Sodium’s conduction electrons at room temperature: the Fermi sea’s edge is smeared by less than 1 % of its depth.' }),
    steps: [
      { label: 'Density', text: t`$n = \dfrac{\rho N_A}{M} = \dfrac{(${EX.rho})(6.022\times10^{23})}{0.02299} = ${texNum(EX.n, 4)}\ \text{m}^{-3}$.` },
      { label: 'Count states', text: t`Box states have $\varepsilon = \dfrac{h^2}{8mL^2}(n_x^2 + n_y^2 + n_z^2)$. Filling an octant of radius $n_\text{max}$, two electrons per point: $N = 2\cdot\tfrac18\cdot\tfrac43\pi n_\text{max}^3$, so $E_F = \dfrac{h^2n_\text{max}^2}{8mL^2} = \dfrac{h^2}{8m}\left(\dfrac{3N}{\pi V}\right)^{2/3}$.` },
      { label: 'Fermi energy', text: t`$E_F = ${texNum(EX.EF, 4)}$ J $= ${fmt(EX.EF / EV, 3)}$ eV; $T_F = E_F/k = ${texNum(EX.EF / KB, 3)}$ K. Room temperature is $1\,\%$ of that: deeply degenerate.` },
      { label: 'Energy and pressure', text: t`With $g(\varepsilon) \propto \sqrt\varepsilon$, the average energy is $\tfrac35E_F$, so $U = \tfrac35NE_F$. Since $E_F \propto V^{-2/3}$, $P = -\partial U/\partial V = \tfrac{2U}{3V} = \tfrac25nE_F = ${fmt((0.4 * EX.n * EX.EF) / 1e9, 3)}$ GPa.` },
      { label: 'Bulk modulus', text: t`$B = -V\,\partial P/\partial V = \tfrac53P = \tfrac23nE_F = ${fmt(EX.Bfree / 1e9, 3)}$ GPa, against the measured $${EX.B}$ GPa. The rough agreement says the free electrons carry most of sodium’s stiffness; the ions’ attraction to the electron sea, left out here, makes up the difference.` },
    ],
    answer: t`$E_F = ${fmt(EX.EF / EV, 3)}$ eV, $T_F = ${texNum(EX.EF / KB, 3)}$ K, $P = ${fmt((0.4 * EX.n * EX.EF) / 1e9, 3)}$ GPa, $B \approx ${fmt(EX.Bfree / 1e9, 2)}$ GPa (measured: $${EX.B}$ GPa).`,
  },
  practice: [
    num({
      id: 'fermi-energy', difficulty: 2,
      gen(r) {
        const k = r.pick(['K', 'Mg', 'Al']), m = METAL[k], v = m.EF / EV;
        return {
          prompt: t`${m.name[0].toUpperCase() + m.name.slice(1)} has density $${m.rho}$ kg/m³ and molar mass $${fmt(m.M * 1000, 4)}$ g/mol, and gives $${m.z}$ conduction electron${m.z > 1 ? 's' : ''} per atom. What is its free-electron Fermi energy, in eV?`,
          answer: v, units: 'eV', tol: { rel: 0.01 },
          errors: apart([{ value: fermiE(m.n / m.z) / EV, feedback: `Count every conduction electron: ${m.z} per atom.` }, { value: (fermiE(m.n) / EV) * 2 ** (2 / 3), feedback: 'The 3/π already includes two spin states per orbital; do not halve the density.' }], v),
          hints: [t`$n = z\rho N_A/M = ${texNum(m.n, 3)}\ \text{m}^{-3}$.`, t`$E_F = \dfrac{h^2}{8m_e}\left(\dfrac{3n}{\pi}\right)^{2/3}$; divide by $1.602\times10^{-19}$ J/eV.`],
          teach: t`$E_F \propto n^{2/3}$: a few eV for every metal, because their electron densities differ by only about tenfold.`,
          explain: t`$n = ${texNum(m.n, 3)}\ \text{m}^{-3}$, so $E_F = ${fmt(v, 3)}$ eV, $T_F = ${texNum(m.EF / KB, 3)}$ K.`,
          visual: { type: 'graph', params: { x: [27.5, 29.5], y: [0, 14], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'conduction electrons per m³', ylabel: 'E(F) (eV)', curves: [{ fn: `${H * H / (8 * ME * EV)}*(3*10^x/pi)^(2/3)`, domain: [27.5, 29.5], color: 'accent' }], points: Object.entries(METAL).filter(([kk]) => kk !== k).map(([kk, mm]) => ({ x: r4(Math.log10(mm.n)), y: r4(mm.EF / EV), r: 4, color: 'ink2', label: kk, labelDx: -18, labelDy: -6 })) }, caption: 'The free-electron Fermi energy against electron density, with the other metals of this lesson marked.' },
        };
      },
    }),
    num({
      id: 'classical-T', difficulty: 2,
      gen(r) {
        const k = r.pick(['Na', 'K', 'Cu', 'Al']), m = METAL[k], v = (0.4 * m.EF) / KB;
        return {
          prompt: t`The conduction electrons of ${m.name} ($E_F = ${fmt(m.EF / EV, 3)}$ eV) have average kinetic energy $\tfrac35E_F$ even at absolute zero. What temperature would a **classical** gas need for the same average kinetic energy, $\tfrac32kT$?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: m.EF / KB, feedback: 'That is the Fermi temperature E(F)/k. Set (3/2)kT = (3/5)E(F).' }, { value: (0.6 * m.EF) / KB, feedback: 'Include the 3/2: (3/2)kT = (3/5)E(F), so kT = (2/5)E(F).' }], v),
          hints: [t`$\tfrac32kT = \tfrac35E_F \Rightarrow kT = \tfrac25E_F$.`],
          teach: t`Degenerate electrons have average energy $\tfrac35E_F$ at $T = 0$ — the zero-point motion that exclusion forces on them.`,
          explain: t`$T = \tfrac25E_F/k = ${texNum(v, 3)}$ K. The electrons in a cold metal move as fast as a gas at tens of thousands of kelvin, and do so at absolute zero.`,
          visual: seaPic({ tt: 0.01, caption: 'A Fermi sea near absolute zero: filled to E(F), with average energy 3/5 of the way up.', mark: 0.6 }),
        };
      },
    }),
    num({
      id: 'degeneracy-pressure', difficulty: 3,
      gen(r) {
        const k = r.pick(['K', 'Cu', 'Al', 'Mg']), m = METAL[k], v = (0.4 * m.n * m.EF) / 1e9;
        return {
          prompt: t`What degeneracy pressure, in GPa, do the conduction electrons of ${m.name} exert ($n = ${texNum(m.n, 3)}\ \text{m}^{-3}$, $E_F = ${fmt(m.EF / EV, 3)}$ eV)?`,
          answer: v, units: 'GPa', tol: { rel: 0.01 },
          errors: apart([{ value: (m.n * m.EF) / 1e9, feedback: t`$P = \tfrac{2U}{3V}$ with $U = \tfrac35NE_F$: the factor is $\tfrac25$.` }, { value: ((2 / 3) * m.n * m.EF) / 1e9, feedback: t`That is the bulk modulus $\tfrac53P$. The pressure is $\tfrac25nE_F$.` }], v),
          hints: [t`$U = \tfrac35NE_F$ and $E_F \propto V^{-2/3}$, so $P = -\partial U/\partial V = \tfrac{2U}{3V}$.`, t`$P = \tfrac25nE_F$, with $E_F$ in joules.`],
          teach: t`A degenerate Fermi gas pushes with $P = \tfrac25nE_F$ — whatever its temperature.`,
          explain: t`$P = \tfrac25(${texNum(m.n, 3)})(${texNum(m.EF, 3)}\ \text{J}) = ${fmt(v, 3)}$ GPa — around $${texNum(v * 1e9 / 101325, 2)}$ atmospheres, held in by the electrons’ attraction to the positive ions. Free-electron $B = \tfrac53P = ${fmt((5 / 3) * v, 3)}$ GPa; measured ${m.B} GPa.`,
          visual: { type: 'graph', params: { x: [0.5, 2], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlabel: 'V / V₀', ylabel: 'P / P₀', curves: [{ fn: 'x^(-5/3)', domain: [0.5, 2], color: 'accent', label: 'Fermi gas, P ∝ V^(−5/3)', labelAt: 1.4, labelDy: -12 }, { fn: '1/x', domain: [0.5, 2], color: 'ink3', dash: true, label: 'isothermal ideal gas', labelAt: 1.75, labelDy: 14 }], points: [{ x: 1, y: 1, r: 5, color: 'gold' }] }, caption: 'A degenerate Fermi gas resists compression more steeply than a classical gas held at constant temperature.' },
        };
      },
    }),
    num({
      id: 'sommerfeld', difficulty: 2,
      gen(r) {
        const k = r.pick(['Na', 'Cu', 'Al']), T = r.pick([77, 300, 1000]), m = METAL[k], v = 100 * ((Math.PI ** 2 / 2) * (KB * T / m.EF)) / 1.5;
        return {
          prompt: t`The conduction-electron heat capacity is $C = \dfrac{\pi^2}{2}Nk\dfrac{kT}{E_F}$ (Sommerfeld). For ${m.name} ($E_F = ${fmt(m.EF / EV, 3)}$ eV) at $${T}$ K, what percentage is that of the classical $\tfrac32Nk$?`,
          answer: v, units: '%', tol: { rel: 0.01 },
          errors: apart([{ value: 100 * (KB * T / m.EF), feedback: 'Keep the π²/2, and compare with 3/2: the ratio is (π²/3)(kT/E(F)).' }, { value: 100 * ((Math.PI ** 2 / 2) * (KB * T / m.EF)), feedback: 'That is C/Nk. Divide by 3/2 for the share of the classical value.' }], v),
          hints: [t`$\dfrac{C}{\tfrac32Nk} = \dfrac{\pi^2}{3}\dfrac{kT}{E_F}$.`, t`$kT = ${fmt(KB * T / EV, 4)}$ eV.`],
          teach: t`Only electrons within $\sim kT$ of $E_F$ can absorb heat, so $C \propto T/T_F$.`,
          explain: t`$\dfrac{\pi^2}{3}\cdot\dfrac{${fmt(KB * T / EV, 4)}}{${fmt(m.EF / EV, 3)}} = ${fmt(v / 100, 3)}$, or $${fmt(v, 3)}\,\%$. That is why metals obey Dulong–Petit (T7.5) as if their electrons were not there — until very low temperatures, where the electrons’ $T$ beats the lattice’s $T^3$.`,
          visual: seaPic({ tt: Math.max(0.005, (KB * T) / m.EF), caption: 'The Fermi sea at this temperature: only the thin band near E(F) can take up energy.' }),
        };
      },
    }),
    mcq({
      id: 'why-sqrt', difficulty: 2,
      prompt: t`For free particles in three dimensions the density of states grows as $g(\varepsilon) \propto \sqrt\varepsilon$. Where does the square root come from?`,
      choices: [t`States are evenly spread in $n$-space; the number below $\varepsilon$ grows like $n^3 \propto \varepsilon^{3/2}$, whose derivative is $\propto \varepsilon^{1/2}$`, 'From the Fermi–Dirac distribution, which flattens the occupancy at high energy', t`From the spin degeneracy of 2`, t`Kinetic energy is $\tfrac12mv^2$, so $v \propto \sqrt\varepsilon$ and faster particles have more states`],
      answer: 0,
      why: { 1: 'g(ε) counts states whether or not they are filled; the occupancy is a separate factor.', 2: 'Spin doubles g(ε) at every energy; it does not change its shape.', 3: 'Close in spirit, but the count is of the volume of a shell in n-space (or momentum space), ∝ n² dn ∝ √ε dε.' },
      hints: [t`$\varepsilon \propto n^2$; the number of points inside radius $n$ is $\propto n^3$.`],
      teach: 'Density of states = how fast the count of states grows with energy; in 3D it is ∝ √ε.',
      explain: t`$N(\varepsilon) \propto n^3 \propto \varepsilon^{3/2}$, so $g = dN/d\varepsilon \propto \varepsilon^{1/2}$. In two dimensions (a thin film, graphene-like electron layers apart) $N \propto \varepsilon$ and $g$ is flat; in one, $g \propto \varepsilon^{-1/2}$.`,
      visual: seaPic({ tt: 0.005, caption: 'The density of states (dashed) and its filled part at low temperature.' }),
    }),
    code({
      id: 'mu-of-T', difficulty: 3,
      prompt: t`In units of $E_F$, the electron count fixes $\mu$ through $\dfrac32\displaystyle\int_0^\infty \frac{\sqrt x\,dx}{e^{(x - m)/t} + 1} = 1$, with $m = \mu/E_F$ and $t = kT/E_F$. Write \`count(m, t)\` for the left-hand side and \`mu(t)\` that solves for $m$ with \`scipy.optimize.brentq\` on the bracket $[-20, 2]$.`,
      starter: t`from math import sqrt
from scipy.integrate import quad
from scipy.optimize import brentq
from scipy.special import expit    # expit(y) = 1/(1 + e^(-y)), safe for any y

def count(m, t):
    pass

def mu(t):
    pass

print(mu(0.1), mu(0.5))
`,
      answer: t`from math import sqrt
from scipy.integrate import quad
from scipy.optimize import brentq
from scipy.special import expit    # expit(y) = 1/(1 + e^(-y)), safe for any y

def count(m, t):
    top = max(m, 0) + 60*t
    val, err = quad(lambda x: sqrt(x) * expit((m - x)/t), 0, top, limit=200)
    return 1.5 * val

def mu(t):
    return brentq(lambda m: count(m, t) - 1, -20, 2)

print(mu(0.1), mu(0.5))`,
      tests: [
        { name: 'a full sea at low temperature: count(1, 0.001) is 1', code: 'abs(count(1, 0.001) - 1) < 2e-3' },
        { name: t`$\mu(0.1) = 0.9916$, as Sommerfeld predicts`, code: 'abs(mu(0.1) - 0.991642) < 2e-4' },
        { name: t`$\mu(0.5) = 0.7431$`, code: 'abs(mu(0.5) - 0.743117) < 2e-4' },
        { name: t`at $kT = E_F$, $\mu$ has fallen just below zero`, code: 'abs(mu(1) - (-0.021448)) < 2e-3' },
      ],
      hints: [t`The occupancy $1/(e^{(x - m)/t} + 1)$ is \`expit((m - x)/t)\`; integrate it times \`sqrt(x)\` from 0 to a little beyond the edge (\`max(m, 0) + 60*t\` is plenty).`, t`\`brentq(f, a, b)\` needs $f(a)$ and $f(b)$ of opposite sign: use \`f = lambda m: count(m, t) - 1\`.`],
      teach: 'Fixed particle number is what sets μ(T); a root-finder over a numerical integral finds it at any temperature.',
      explain: t`μ falls slowly at first ($1 - \tfrac{\pi^2}{12}t^2$) and then fast: by $kT \approx E_F$ it has crossed zero and the gas is on its way to classical, where $\mu$ is large and negative.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-white-dwarf', difficulty: 3, transfer: true,
      gen(r) {
        const rho = r.pick([1e8, 3e8, 1e9, 3e9]), ne = rho / (2 * AMU), v = fermiE(ne) / EV / 1000;
        return {
          prompt: t`A white dwarf is the carbon–oxygen core of a dead star, with two nucleons for every electron. Where its density is $${texNum(rho, 1)}$ kg/m³, what is the electrons’ Fermi energy from the non-relativistic formula, in keV? (Compare $m_ec^2 = 511$ keV.)`,
          answer: v, units: 'keV', tol: { rel: 0.01 },
          errors: apart([{ value: fermiE(rho / AMU) / EV / 1000, feedback: 'One electron per two nucleons: n(e) = ρ/(2 m(u)).' }, { value: fermiE(rho / (2 * MNEUTRON), MNEUTRON) / EV / 1000, feedback: 'The electrons are the degenerate gas here: use the electron mass.' }], v),
          hints: [t`$n_e = \rho/(2m_u) = ${texNum(ne, 3)}\ \text{m}^{-3}$.`, t`$E_F = \dfrac{h^2}{8m_e}(3n_e/\pi)^{2/3}$, then divide by $1.602\times10^{-16}$ J/keV.`],
          teach: 'White-dwarf electrons have Fermi energies of tens to hundreds of keV: degenerate, and close to relativistic.',
          explain: t`$E_F = ${fmt(v, 3)}$ keV, a Fermi temperature of $${texNum(fermiE(ne) / KB, 2)}$ K against a core near $10^{7}$ K: thoroughly degenerate, so its pressure does not need heat. ${v > 0.2 * MEC2_KEV ? 'E(F) is a sizeable fraction of m(e)c²: the electrons are becoming relativistic, and there the pressure stiffens less with compression. Chandrasekhar found that this caps a white dwarf’s mass near 1.4 solar masses (T11.1 derives it; it is special relativity and quantum statistics, not general relativity).' : 'Deeper in, where densities are higher, E(F) approaches m(e)c² and the electrons turn relativistic — the road to Chandrasekhar’s 1.4-solar-mass limit (T11.1).'}`,
          visual: { type: 'graph', params: { x: [7, 10.5], y: [0, 3], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'density (kg/m³)', ylabel: 'E(F) / mₑc²', curves: [{ fn: `${H * H / (8 * ME * ME * CL * CL)}*(3*10^x/(2*${AMU}*pi))^(2/3)`, domain: [7, 10.5], color: 'accent' }], hlines: [{ y: 1, color: 'warn', label: 'mₑc²: relativistic beyond' }], vlines: [{ x: r4(Math.log10(rho)), color: 'gold' }] }, caption: 'Non-relativistic Fermi energy of white-dwarf electrons against density (it overestimates once E(F) nears mₑc²). Gold: the density asked about.' },
        };
      },
    }),
    num({
      id: 'cp-neutron-star', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([0.5, 1, 2]), n = f * 1.6e44, v = fermiE(n, MNEUTRON) / EV / 1e6;
        return {
          prompt: t`Treat a neutron star’s interior as an ideal gas of neutrons (spin ½ fermions, $m_n = 1.675\times10^{-27}$ kg) at ${f === 1 ? 'nuclear density' : f < 1 ? 'half nuclear density' : 'twice nuclear density'}, $n = ${texNum(n, 2)}\ \text{m}^{-3}$. What is their Fermi energy, in MeV?`,
          answer: v, units: 'MeV', tol: { rel: 0.01 },
          errors: apart([{ value: fermiE(n, ME) / EV / 1e6, feedback: 'Use the neutron mass: E(F) ∝ 1/m.' }, { value: fermiE(2 * n, MNEUTRON) / EV / 1e6, feedback: 'The formula already counts two spin states per orbital; use n as given.' }], v),
          hints: [t`$E_F = \dfrac{h^2}{8m_n}\left(\dfrac{3n}{\pi}\right)^{2/3}$.`, t`$(3n/\pi)^{2/3} = ${texNum((3 * n / Math.PI) ** (2 / 3), 3)}\ \text{m}^{-2}$; divide the result in joules by $1.602\times10^{-13}$ J/MeV.`],
          teach: 'Neutron degeneracy pressure, with E(F) of tens of MeV, holds up neutron stars — with help from nuclear forces.',
          explain: t`$E_F = ${fmt(v, 3)}$ MeV, a Fermi temperature near $${texNum(fermiE(n, MNEUTRON) / KB, 1)}$ K — far above the star’s internal temperature, so it is fully degenerate. This ideal-gas picture is only a pointer: real neutron-star matter needs the strong interaction and general relativity (the Tolman–Oppenheimer–Volkoff equation), and its equation of state is still being pinned down by NICER and gravitational-wave observations.`,
          visual: { type: 'graph', params: { x: [43.5, 45], y: [0, 200], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'neutron density (m⁻³)', ylabel: 'E(F) (MeV)', curves: [{ fn: `${H * H / (8 * MNEUTRON * EV * 1e6)}*(3*10^x/pi)^(2/3)`, domain: [43.5, 45], color: 'accent' }], vlines: [{ x: r4(Math.log10(1.6e44)), color: 'ink3', label: 'nuclear density' }] }, caption: 'Ideal-gas neutron Fermi energy against density (interactions ignored).' },
        };
      },
    }),
    mcq({
      id: 'cp-cooling-dwarf', difficulty: 3,
      prompt: 'A white dwarf radiates its heat away for billions of years. Why does it not shrink as it cools, as an ordinary star would?',
      choices: ['Its pressure is electron degeneracy pressure, which depends on density, not temperature', 'It shrinks continuously, but too slowly to measure', 'Its core is kept hot by fusion', 'Gravity weakens as it cools'],
      answer: 0,
      why: { 1: 'Its radius is set by the balance of gravity and degeneracy pressure; with T ≪ T(F) that balance hardly changes as it cools.', 2: 'White dwarfs have no fusion: they are cooling embers.', 3: 'Gravity depends on mass and radius, not temperature.' },
      hints: [t`$P = \tfrac25nE_F$. Where is $T$ in that formula?`, t`The core is near $10^{7}$ K; $T_F$ is around $10^{9}$ K.`],
      teach: 'Degeneracy pressure needs no heat: a degenerate star can cool without collapsing.',
      explain: t`For $T \ll T_F$ the pressure is $\tfrac25nE_F$ with tiny thermal corrections, so cooling barely changes the radius: a white dwarf fades at constant size, which is why the coolest ones serve as clocks for the age of the Galaxy’s disc.`,
      visual: seaPic({ tt: 0.01, caption: 'A degenerate electron gas: whether kT is 1 % or 0.1 % of E(F) hardly changes how full the sea is, or the pressure it exerts.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Ashcroft & Mermin, Solid State Physics, ch. 2 (the Sommerfeld theory of metals)', url: 'https://en.wikipedia.org/wiki/Solid_State_Physics_(Ashcroft_and_Mermin)' },
    { label: 'WebElements: bulk moduli of the elements', url: 'https://www.webelements.com/periodicity/bulk_modulus/' },
    { label: 'Chandrasekhar, The Maximum Mass of Ideal White Dwarfs, ApJ 74, 81 (1931)', url: 'https://doi.org/10.1086/143324' },
    { label: 'NASA NICER mission (neutron-star radii)', url: 'https://science.nasa.gov/mission/nicer/' },
  ],
});
