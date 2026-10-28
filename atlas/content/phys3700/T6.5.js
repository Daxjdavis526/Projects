// Partition functions and free energy: F = −kT ln Z, so P, S and μ are all
// derivatives of ln Z. Composite systems multiply their Z's; N identical gas
// molecules give Z₁ᴺ/N!; the ideal gas from Z₁ = V Z_int/v_Q, with the
// quantum volume, Sackur–Tetrode checked against the CODATA standard
// entropies of the noble gases, and the van der Waals pressure from a Z.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { sackurTetrode } from './_count.js';
import { KB, H, AMU, EV, R, vQ, r4, texNum, apart } from './_stat.js';

const t = String.raw;
const L10 = Math.log10;
// noble gases: mass (u) and CODATA key-value standard entropy at 298.15 K, 1 bar (J mol⁻¹ K⁻¹)
const NOBLE = { He: [4.002602, 126.153, 'helium'], Ne: [20.1797, 146.328, 'neon'], Ar: [39.948, 154.846, 'argon'], Kr: [83.798, 164.085, 'krypton'], Xe: [131.293, 169.685, 'xenon'] };
// log₁₀ of (V/N)/v_Q at temperature 10^x and pressure P (Pa), for mass m (u), as expression text
const ratioExpr = (m, P, Tv = '10^x') => `log10(${KB}*(${Tv})/(${P})) + 1.5*log10(2*pi*${m}*${AMU}*${KB}*(${Tv})/${H * H})`;
const ratio = (mU, T, P) => (KB * T / P) / vQ(mU * AMU, T);
// worked example: argon at 298.15 K and 1 bar
const EX = { m: NOBLE.Ar[0], T: 298.15, P: 1e5 };
EX.vq = vQ(EX.m * AMU, EX.T); EX.VN = (KB * EX.T) / EX.P; EX.r = EX.VN / EX.vq; EX.S = R * (Math.log(EX.r) + 2.5);

function quantumPic({ gases, P = 101325, caption, vT = null, x = [0, 3.5], y = [-2, 10] }) {
  const cols = ['accent', 'violet', 'warn', 'teal'];
  return {
    type: 'graph',
    params: { x, y, aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'temperature (K)', ylabel: 'log₁₀ [(V/N) / v(Q)]',
      curves: gases.map((g, i) => ({ fn: ratioExpr(NOBLE[g][0], P), domain: x, color: cols[i], label: g, labelAt: r4(x[0] + 0.25 + 0.3 * i), labelDx: 6, labelDy: -10 })),
      shade: [{ fn: '0', lower: String(y[0]), from: x[0], to: x[1], color: 'warn', alpha: 0.12 }],
      hlines: [{ y: 0, color: 'warn', label: 'quantum below this line' }],
      vlines: vT === null ? [] : [{ x: r4(L10(vT)), color: 'gold' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T6.5',
  title: 'Partition functions and free energy',
  minutes: 16, difficulty: 3,
  intro: t`The Helmholtz free energy $F = U - TS$ ([T5.1](#/lesson/phys3700.T5.1)) is the partition function in disguise:

$$F = -kT\ln Z.$$

(One line shows it: $S = -\partial F/\partial T$ applied to $-kT\ln Z$ gives $S = k\ln Z + U/T$, which is just $F = U - TS$ again.) So once $Z$ is known, everything is: $S = -\partial F/\partial T$, $P = -\partial F/\partial V$, $\mu = \partial F/\partial N$. Two rules build big $Z$’s from small ones. **Independent parts multiply**: $Z = Z_1Z_2$. And $N$ **identical** gas molecules give $Z = Z_1^N/N!$ — the $N!$ because swapping two identical molecules is not a new state. For one molecule in a box, $Z_1 = VZ_\text{int}/v_Q$, where $v_Q = (h/\sqrt{2\pi mkT})^3$ is the **quantum volume**, a cube one thermal de Broglie wavelength on a side.`,
  symbols: [
    { tex: 'F', text: 'the Helmholtz free energy, $U - TS$, in J: what a system at fixed $T$ and $V$ minimizes' },
    { tex: 'k', text: 'Boltzmann’s constant, $1.380649\\times10^{-23}$ J/K' },
    { tex: 'T', text: 'the temperature of the reservoir the system is in contact with, in K' },
    { tex: '\\ln Z', text: 'the log of the partition function of the **whole** system (all $N$ particles)' },
  ],
  why: 'F = −kT ln Z is the bridge from microscopic energy levels to measured thermodynamics: equations of state, entropies, chemical potentials and equilibrium constants all come from it — including the ideal-gas law, derived here rather than assumed.',
  visual: {
    type: 'graph',
    title: 'When is a gas classical?',
    lead: t`The Boltzmann counting $Z_1^N/N!$ works only if molecules rarely compete for the same state: each needs much more room than $v_Q$. The curves are $\log_{10}$ of the room per molecule, $V/N$, over $v_Q$, for monatomic gases. Drop the temperature or raise the pressure and watch for the line where the ratio reaches 1.`,
    tasks: [
      'At room temperature and 1 atm every gas has (V/N)/v(Q) near 10⁵–10⁷: wildly classical.',
      'Follow helium down: near 4 K (where it liquefies anyway) its ratio is only about 7 — on the edge of quantum behaviour.',
      'Raise the pressure: every curve slides down by the same amount. Lighter gases hit the quantum line first, because v(Q) grows as m^(−3/2).',
    ],
    params: {
      x: [0, 3.5], y: [-2, 10], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'temperature (K)', ylabel: 'log₁₀ [(V/N) / v(Q)]',
      sliders: [
        { key: 'lp', label: 'Pressure, $\\log_{10}(P/\\text{atm})$', min: -4, max: 3, step: 0.5, value: 0, explain: 'From near vacuum to 1000 atm (where real gases stop being ideal).' },
        { key: 'lt', label: 'Probe temperature, $\\log_{10}(T/\\text{K})$', min: 0, max: 3.5, step: 0.05, value: 2.47, explain: 'Where the readouts are evaluated (2.47 is 298 K).' },
      ],
      curves: ['He', 'Ne', 'Ar', 'Xe'].map((g, i) => ({ fn: ratioExpr(NOBLE[g][0], '101325*10^lp'), domain: [0, 3.5], color: ['accent', 'violet', 'warn', 'teal'][i], label: g, labelAt: 0.25 + 0.4 * i, labelDx: 6, labelDy: -10 })),
      shade: [{ fn: '0', lower: '-2', from: 0, to: 3.5, color: 'warn', alpha: 0.12 }],
      hlines: [{ y: 0, color: 'warn', label: 'quantum below this line' }],
      vlines: [{ x: 'lt', color: 'gold' }],
      readouts: [
        { label: 'He: $(V/N)/v_Q$', expr: `10^(${ratioExpr(NOBLE.He[0], '101325*10^lp', '10^lt')})`, digits: 3 },
        { label: 'Ar: $(V/N)/v_Q$', expr: `10^(${ratioExpr(NOBLE.Ar[0], '101325*10^lp', '10^lt')})`, digits: 3 },
        { label: 'Ar: $S/Nk$ (Sackur–Tetrode)', expr: `ln(10)*(${ratioExpr(NOBLE.Ar[0], '101325*10^lp', '10^lt')}) + 2.5`, digits: 4 },
      ],
    },
    caption: 'Ideal monatomic gases only. Real gases condense long before most of these curves reach the line (helium at 4.2 K, argon at 87 K under 1 atm), which is why quantum gases need extreme conditions — or electrons, whose small mass makes v(Q) huge (T7.3).',
  },
  example: {
    prompt: t`Find the entropy of one mole of argon ($${EX.m}$ u) at $${EX.T}$ K and 1 bar from its partition function, and compare with the measured standard entropy, $${NOBLE.Ar[1]}$ J/(mol·K) (CODATA key value).`,
    visual: quantumPic({ gases: ['Ar'], P: 1e5, vT: EX.T, caption: 'Argon at 1 bar: at 298 K (gold) each atom has about ten million quantum volumes to itself.' }),
    steps: [
      { label: 'One atom', text: t`Argon has no internal excitations below about 11 eV, so $Z_\text{int} = 1$ and $Z_1 = V/v_Q$, with $v_Q = (h/\sqrt{2\pi mkT})^3 = ${texNum(EX.vq, 4)}\ \text{m}^3$.` },
      { label: 'All the atoms', text: t`$Z = Z_1^N/N!$, so with Stirling ($\ln N! \approx N\ln N - N$): $\ln Z = N\left[\ln\dfrac{V}{Nv_Q} + 1\right]$, and $F = -NkT\left[\ln\dfrac{V}{Nv_Q} + 1\right]$.` },
      { label: 'Pressure', text: t`$P = -\partial F/\partial V = NkT/V$: the ideal-gas law, from counting states.` },
      { label: 'Entropy', text: t`$S = -\partial F/\partial T$; $v_Q \propto T^{-3/2}$ adds $\tfrac32$, so $S = Nk\left[\ln\dfrac{V}{Nv_Q} + \dfrac52\right]$ — Sackur–Tetrode. Here $V/N = kT/P = ${texNum(EX.VN, 4)}\ \text{m}^3$, so $V/Nv_Q = ${texNum(EX.r, 4)}$.` },
      { label: 'Compare', text: t`$S = R\,[\ln(${texNum(EX.r, 4)}) + 2.5] = ${fmt(EX.S, 6)}$ J/(mol·K), against the tabulated $${NOBLE.Ar[1]}$ — agreement to every figure given, because the table is itself computed this way and checked against calorimetry.` },
    ],
    answer: t`$S = ${fmt(EX.S, 6)}$ J/(mol·K), matching the measured standard entropy.`,
  },
  practice: [
    num({
      id: 'F-two-level', difficulty: 2,
      gen(r) {
        const tau = r.pick([0.5, 1, 2, 4]), v = -tau * Math.log(1 + Math.exp(-1 / tau));
        return {
          prompt: t`$N$ independent two-level systems each have states at $0$ and $\varepsilon$. At $kT = ${tau}\,\varepsilon$, what is the free energy per system, $F/N\varepsilon$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: tau * Math.log(1 + Math.exp(-1 / tau)), feedback: 'Sign: F = −kT ln Z, and ln Z > 0 here, so F is negative.' }, { value: -tau * Math.log(2), feedback: 'That is the infinite-temperature limit, Z = 2. Use Z = 1 + e^(−ε/kT).' }, { value: -Math.log(1 + Math.exp(-1 / tau)), feedback: t`Multiply by $kT/\varepsilon = ${tau}$.` }], v),
          hints: [t`Independent systems: $Z = Z_1^N$, so $F = -NkT\ln Z_1$.`, t`$F/N\varepsilon = -(kT/\varepsilon)\ln(1 + e^{-\varepsilon/kT}) = -${tau}\ln(1 + e^{-${fmt(1 / tau, 3)}})$.`],
          teach: t`$F = -kT\ln Z$, and independent parts add their $\ln Z$’s.`,
          explain: t`$\ln(1 + e^{-${fmt(1 / tau, 3)}}) = ${fmt(Math.log(1 + Math.exp(-1 / tau)), 4)}$, so $F/N\varepsilon = ${fmt(v, 3)}$. The free energy is below the ground-state energy (0): it is $U - TS$, and the entropy term wins as $T$ rises.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [-3.6, 0.6], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'per system, in units of ε', curves: [{ fn: '-x*ln(1 + e^(-1/x))', domain: [0.02, 5], color: 'accent', label: 'F', labelAt: 4.2, labelDy: 14 }, { fn: '1/(e^(1/x) + 1)', domain: [0.02, 5], color: 'gold', label: 'U', labelAt: 4.2, labelDy: -10 }], hlines: [{ y: 0, color: 'ink4' }], vlines: [{ x: tau, color: 'warn' }] }, caption: 'Energy U and free energy F per two-level system against temperature; their gap is TS. Orange: this temperature.' },
        };
      },
    }),
    mcq({
      id: 'composite', difficulty: 2,
      prompt: t`A gas molecule’s energy is a sum of independent parts: $E = E_\text{trans} + E_\text{rot} + E_\text{vib}$. How is its partition function built from the parts’?`,
      choices: [t`$Z_1 = Z_\text{trans}Z_\text{rot}Z_\text{vib}$`, t`$Z_1 = Z_\text{trans} + Z_\text{rot} + Z_\text{vib}$`, t`$Z_1 = Z_\text{trans}$ only: rotation and vibration do not depend on position`, t`$Z_1 = (Z_\text{trans}Z_\text{rot}Z_\text{vib})/3!$`],
      answer: 0,
      why: { 1: 'Energies add, so Boltzmann factors multiply; summing over every combination of states gives the product of the separate sums.', 2: 'Every internal state can go with every translational state: the internal parts multiply the count, whatever position does.', 3: 'The 1/N! is for identical particles that can swap places. Translation, rotation and vibration are different kinds of motion of one molecule.' },
      hints: [t`$e^{-\beta(E_a + E_b)} = e^{-\beta E_a}e^{-\beta E_b}$. Now sum over all pairs of states.`],
      teach: 'Independent degrees of freedom: energies add, Z’s multiply, ln Z’s (and free energies) add.',
      explain: t`$\sum_{a,b,c}e^{-\beta(E_a + E_b + E_c)} = \sum_a e^{-\beta E_a}\sum_b e^{-\beta E_b}\sum_c e^{-\beta E_c}$. Taking logs, $F$, $U$, $S$ and $C$ split into translational, rotational and vibrational parts — the stepped heat capacity of T1.2.`,
      visual: { type: 'graph', params: { x: [0, 3.5], y: [0, 12], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε (rotation)', ylabel: 'Z of each part', curves: [{ fn: 'x + 1/3', domain: [0.6, 3.5], color: 'violet', label: 'rotation', labelAt: 3, labelDy: 14 }, { fn: '1/(1 - e^(-30/x))', domain: [0.2, 3.5], color: 'accent', label: 'vibration', labelAt: 3, labelDy: -10 }] }, caption: 'Rotational and vibrational Z of a typical diatomic molecule near room temperature (schematic: the vibrational quantum taken as 30 rotational units). The molecule’s Z multiplies these with an enormous translational factor V/v(Q).' },
    }),
    mcq({
      id: 'n-factorial', difficulty: 3,
      prompt: t`Why does $Z = Z_1^N/N!$ hold for $N$ molecules of a gas, while an Einstein solid of $N$ oscillators uses $Z = Z_1^N$ with no $N!$?`,
      choices: ['The solid’s oscillators sit at fixed lattice sites, so they are distinguishable by position; gas molecules roam, and swapping two identical ones gives the same state', 'Solids are cold, so the N! is close to 1', 'Gas molecules interact and solid atoms do not', 'The N! is a classical correction that quantum oscillators do not need'],
      answer: 0,
      why: { 1: 'N! is enormous for any N — about 10^(10^24) for a mole — whatever the temperature.', 2: 'Both are treated as non-interacting here; the difference is about labelling, not forces.', 3: 'It is the other way round: the N! is a quantum statement (identical particles cannot be labelled). The oscillators are distinguishable because their sites are.' },
      hints: ['Ask: if you swap two particles, is that a different microstate?', 'Atom 7 of a crystal is “the atom at site 7” — you can name it.'],
      teach: 'Divide by N! for identical, freely moving particles; not for particles labelled by their place.',
      explain: t`$Z_1^N$ counts every assignment of states to labelled particles. For a gas of identical molecules each physical state is counted $N!$ times (once per relabelling), provided the molecules are almost never in the same state — the dilute limit $V/N \gg v_Q$. A crystal’s atoms are labelled by their sites, so nothing is overcounted.`,
      visual: { type: 'therm-gas', params: { gas: 'Ar', T: 300, N: 40, hist: false, gauge: false, flashes: false, readouts: [] }, caption: 'A gas of identical argon atoms: exchanging any two leaves the same physical state. Atoms enormously enlarged.' },
    }),
    num({
      id: 'helium-quantum', difficulty: 2,
      gen(r) {
        const [T, P] = r.pick([[4.2, 101325], [10, 101325], [4.2, 30000], [20, 101325]]), v = ratio(NOBLE.He[0], T, P);
        return {
          prompt: t`Helium gas is at $${T}$ K and $${fmt(P / 1000, 4)}$ kPa. What is $(V/N)/v_Q$, the room per atom measured in quantum volumes, $v_Q = (h/\sqrt{2\pi mkT})^3$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: v ** (1 / 3), feedback: 'That is the ratio of lengths. Compare volumes: (V/N)/v(Q).' }, { value: 1 / v, feedback: 'Upside down: room per atom divided by v(Q).' }], v),
          hints: [t`$V/N = kT/P$ and $m = 4.0026\times1.6605\times10^{-27}$ kg.`, t`$v_Q^{1/3} = h/\sqrt{2\pi mkT} = ${texNum(vQ(NOBLE.He[0] * AMU, T) ** (1 / 3), 3)}$ m.`],
          teach: t`A gas is classical when $V/N \gg v_Q$; helium gets within a factor of ten of the line at liquid-helium temperatures.`,
          explain: t`$V/N = ${texNum((KB * T) / P, 3)}\ \text{m}^3$, $v_Q = ${texNum(vQ(NOBLE.He[0] * AMU, T), 3)}\ \text{m}^3$: ratio $${fmt(v, 3)}$. ${v < 20 ? 'Close enough to 1 that quantum statistics shows up in cold helium vapour.' : 'Still comfortably classical.'}`,
          visual: quantumPic({ gases: ['He'], P, x: [0, 2.5], y: [-1, 6], caption: 'Helium’s room per atom in quantum volumes against temperature, at this pressure.' }),
        };
      },
    }),
    expr({
      id: 'vdw', difficulty: 3,
      prompt: t`A crude model of a real gas gives each molecule only the volume not taken by the others, $V - Nb$, and lowers its energy by an attraction $aN/V$. Then $F = -NkT\ln(V - Nb) - \dfrac{aN^2}{V} + f(N, T)$. Find the pressure $P = -\partial F/\partial V$.`,
      answer: 'N*k*T/(V - N*b) - a*N^2/V^2',
      answerTeX: t`\frac{NkT}{V - Nb} - \frac{aN^2}{V^2}`,
      lhs: 'P',
      vars: { V: [3, 8], N: [0.5, 1.5], k: [0.5, 1.5], T: [1, 3], a: [0.1, 0.5], b: [0.1, 0.3] },
      derivativeOf: 'N*k*T*ln(V - N*b) + a*N^2/V',
      errors: [
        { answer: 'N*k*T/(V - N*b) + a*N^2/V^2', feedback: 'Watch the sign of the attraction term: ∂(−aN²/V)/∂V = +aN²/V², and P is minus that.' },
        { answer: 'N*k*T/V - a*N^2/V^2', feedback: 'The excluded volume stays: ∂ ln(V − Nb)/∂V = 1/(V − Nb).' },
      ],
      hints: [t`$\dfrac{\partial}{\partial V}\ln(V - Nb) = \dfrac{1}{V - Nb}$ and $\dfrac{\partial}{\partial V}\dfrac{1}{V} = -\dfrac{1}{V^2}$.`, t`$P = NkT/(V - Nb) + \partial(aN^2/V)/\partial V$.`],
      teach: 'Every equation of state is −∂F/∂V of some partition function.',
      explain: t`$P = \dfrac{NkT}{V - Nb} - \dfrac{aN^2}{V^2}$: the van der Waals equation of T5.3’s phase transitions, here from a (mean-field) partition function. Excluded volume raises the pressure; attraction lowers it.`,
      visual: { type: 'graph', params: { x: [1, 5], y: [-0.3, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'volume per molecule (units of b)', ylabel: 'pressure (arbitrary units)', curves: [{ fn: '0.7/(x - 1)', domain: [1.2, 5], color: 'ink3', dash: true, label: 'no attraction', labelAt: 4.2, labelDy: -10 }, { fn: '0.7/(x - 1) - 3/x^2', domain: [1.2, 5], color: 'accent', label: 'with attraction', labelAt: 3.6, labelDy: 16 }], hlines: [{ y: 0, color: 'ink4' }] }, caption: 'Pressure against volume for such a gas below its critical temperature (solid; arbitrary constants) beside the same gas without attraction (dashed). The dip, unphysical as drawn, is where liquid and gas really coexist (T5.3).' },
    }),
    num({
      id: 'sackur-tetrode', difficulty: 2,
      gen(r) {
        const g = r.pick(['He', 'Ne', 'Kr', 'Xe']), [m, Sref, name] = NOBLE[g], v = sackurTetrode(m, 298.15, 1e5);
        return {
          prompt: t`Use the Sackur–Tetrode formula, $S = Nk\left[\ln\dfrac{V}{Nv_Q} + \dfrac52\right]$, to find the molar entropy of ${name} ($${m}$ u) at $298.15$ K and 1 bar.`,
          answer: v, units: 'J/(mol K)', tol: { rel: 0.005 },
          errors: apart([{ value: v - 2.5 * R + 1.5 * R, feedback: t`The constant is $\tfrac52$: $\tfrac32$ from $v_Q \propto T^{-3/2}$ plus 1 from Stirling’s $N!$.` }, { value: v - R, feedback: 'Keep the +1 from the N! (Stirling): without it the entropy is not even extensive.' }], v),
          hints: [t`$V/N = kT/P = ${texNum((KB * 298.15) / 1e5, 4)}\ \text{m}^3$.`, t`$v_Q = (h/\sqrt{2\pi mkT})^3 = ${texNum(vQ(m * AMU, 298.15), 3)}\ \text{m}^3$; then $S = R[\ln(V/Nv_Q) + 2.5]$.`],
          teach: 'The Sackur–Tetrode entropy of a monatomic gas comes straight from F = −kT ln(Z₁ᴺ/N!).',
          explain: t`$V/Nv_Q = ${texNum(ratio(m, 298.15, 1e5), 3)}$, so $S = 8.314\,[${fmt(Math.log(ratio(m, 298.15, 1e5)), 4)} + 2.5] = ${fmt(v, 4)}$ J/(mol·K). Tabulated: $${Sref}$.`,
          visual: { type: 'graph', params: { x: [0.5, 2.3], y: [120, 175], aspect: 'wide', axesAt: 'edge', xlog: true, xlabel: 'atomic mass (u)', ylabel: 'S (J/(mol·K))', curves: [{ fn: `8.314462618*(ln(${KB}*298.15/1e5) + 1.5*ln(2*pi*10^x*${AMU}*${KB}*298.15/${H * H}) + 2.5)`, domain: [0.5, 2.3], color: 'accent' }], points: Object.entries(NOBLE).filter(([k]) => k !== g).map(([k, [mm, S]]) => ({ x: r4(L10(mm)), y: S, r: 4, color: 'ink2', label: k, labelDx: 6, labelDy: 12 })), vlines: [{ x: r4(L10(m)), color: 'gold' }] }, caption: 'Sackur–Tetrode entropy at 298.15 K and 1 bar against atomic mass (curve) with the CODATA standard entropies of the other noble gases (dots). Gold: the gas asked about.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thruster-mu', difficulty: 3, transfer: true,
      gen(r) {
        const P = r.pick([5, 10, 20, 50]) * 1e5, T = r.pick([250, 300]), rr = ratio(NOBLE.Ar[0], T, P), v = (-KB * T * Math.log(rr)) / EV;
        return {
          prompt: t`A cold-gas thruster’s plenum holds argon at $${T}$ K and $${P / 1e5}$ bar. Treating it as an ideal monatomic gas, its chemical potential is $\mu = \partial F/\partial N = -kT\ln\dfrac{V}{Nv_Q}$. What is $\mu$, in eV?`,
          answer: v, units: 'eV', tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'μ is negative for a classical gas: V/(N v(Q)) ≫ 1, so its log is positive.' }, { value: (-KB * T * (Math.log(rr) + 1)) / EV, feedback: 'That is F/N. The derivative ∂F/∂N removes the +1.' }], v),
          hints: [t`$V/N = kT/P$; $v_Q = (h/\sqrt{2\pi mkT})^3$ with $m = 39.948$ u.`, t`$V/Nv_Q = ${texNum(rr, 3)}$; $kT = ${fmt((KB * T) / EV, 4)}$ eV.`],
          teach: t`A classical gas has $\mu = -kT\ln(V/Nv_Q)$: negative, and rising toward zero as the gas is compressed.`,
          explain: t`$\mu = -(${fmt((KB * T) / EV, 4)}\ \text{eV})\ln(${texNum(rr, 3)}) = ${fmt(v, 3)}$ eV. Compressing tenfold raises it by $kT\ln10 = ${fmt((KB * T * Math.LN10) / EV, 3)}$ eV; that rise is what drives gas out of a high-pressure plenum toward low-μ vacuum.`,
          visual: quantumPic({ gases: ['Ar'], P, vT: T, x: [1, 3.5], y: [-1, 9], caption: 'Argon’s room per atom, in quantum volumes, at the plenum pressure; gold: the plenum temperature. μ/kT is minus ln10 times the curve’s height.' }),
        };
      },
    }),
    num({
      id: 'cp-F-osc', difficulty: 3,
      gen(r) {
        const tau = r.pick([0.5, 1, 2, 3]), v = tau * Math.log(1 - Math.exp(-1 / tau));
        return {
          prompt: t`An Einstein solid’s oscillators each have $Z_1 = 1/(1 - e^{-\varepsilon/kT})$ (energies from the ground state). At $kT = ${tau}\,\varepsilon$, what is the free energy per oscillator, $F/N\varepsilon$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'F = −kT ln Z₁ per oscillator, and Z₁ > 1, so F is negative.' }, { value: Math.log(1 - Math.exp(-1 / tau)), feedback: t`Multiply $-\ln Z_1$ by $kT/\varepsilon = ${tau}$.` }], v),
          hints: [t`Lattice sites are distinguishable: $Z = Z_1^N$, so $F/N = -kT\ln Z_1$.`, t`$F/N\varepsilon = ${tau}\ln(1 - e^{-${fmt(1 / tau, 3)}})$.`],
          teach: 'For distinguishable independent units F/N = −kT ln Z₁ — no N!.',
          explain: t`$1 - e^{-${fmt(1 / tau, 3)}} = ${fmt(1 - Math.exp(-1 / tau), 4)}$, its log is $${fmt(Math.log(1 - Math.exp(-1 / tau)), 4)}$, so $F/N\varepsilon = ${fmt(v, 3)}$.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [-4, 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'kT / ε', ylabel: 'F / Nε', curves: [{ fn: 'x*ln(1 - e^(-1/x))', domain: [0.03, 4], color: 'accent' }], hlines: [{ y: 0, color: 'ink4' }], vlines: [{ x: tau, color: 'warn' }] }, caption: 'Free energy per oscillator against temperature (zero-point energy excluded). Orange: this temperature.' },
        };
      },
    }),
    mcq({
      id: 'cp-gibbs-paradox', difficulty: 3,
      prompt: 'Two equal boxes hold the same gas at the same temperature and pressure. You remove the wall between them. With Z = Z₁ᴺ/N!, what happens to the total entropy?',
      choices: ['Nothing: it is already the sum of the two boxes’ entropies, so removing the wall changes nothing', t`It rises by $2Nk\ln 2$, the entropy of mixing`, 'It falls, because the gas is now more ordered', t`It rises by $Nk\ln2$, because each molecule now has twice the volume`],
      answer: 0,
      why: { 1: 'That is the result for two different gases. Without the N! you would wrongly get it for identical ones — Gibbs’s paradox.', 2: 'Nothing has become more ordered: the state is macroscopically identical to before.', 3: 'Each molecule has twice the room, but there are twice as many molecules sharing it: V/N is unchanged.' },
      hints: ['In Sackur–Tetrode the volume appears only as V/N.', 'What is V/N before and after?'],
      teach: 'The N! makes entropy extensive: mixing identical gases creates no entropy.',
      explain: t`Sackur–Tetrode depends on $V/N$, which is the same before and after, so $S_\text{after} = 2S_\text{box}$. Without the $N!$, $S$ would contain $\ln V$ alone and would jump by $2Nk\ln2$ — an entropy increase from an operation you could undo by sliding the wall back. Indistinguishability removes the paradox.`,
      visual: { type: 'therm-gas', params: { gas: 'Ar', T: 300, N: 60, V: 1, hist: false, gauge: false, flashes: false, readouts: [] }, caption: 'One gas filling the whole box: no measurement can tell whether a wall once divided it. Atoms enormously enlarged.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §§6.5–6.7', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Cox, Wagman & Medvedev, CODATA Key Values for Thermodynamics (1989), via NIST', url: 'https://www.codata.org/resources-databases/key-values-for-thermodynamics' },
    { label: 'CODATA recommended values of the fundamental constants', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
