// Debye theory of solids: lattice vibrations as sound-wave modes (phonons)
// up to a cutoff that leaves 3N modes; C_V from the Planck occupancy summed
// over them; the T³ law at low temperature and Dulong–Petit at high, tested
// against NIST's measured specific heat of OFHC copper (with Sommerfeld's γT
// for its electrons), θ_D from sound speeds, and cryogenic heat budgets.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, H, NA, R, CU, THETA_D, debyeC, debyeCExpr, debyeBeta, einsteinC, cuSpecific, cuSpecificExpr, r4, texNum, apart } from './_stat.js';

const t = String.raw;
const L10 = Math.log10;
// electronic heat-capacity coefficients, J mol⁻¹ K⁻² (Kittel Table 6.3)
const GAMMA = { Cu: 0.695e-3, Al: 1.35e-3, Ag: 0.646e-3, Au: 0.729e-3 };
const NAMES = { Cu: 'copper', Al: 'aluminium', Ag: 'silver', Au: 'gold', Pb: 'lead', C: 'diamond', Si: 'silicon', Fe: 'iron' };
const cuMolar = (T) => cuSpecific(T) * CU.M;           // J/(mol K), measured (NIST fit, 4–300 K)
const EX = { T: 10 };
EX.lat = debyeBeta(CU.theta) * EX.T ** 3; EX.el = CU.gamma * EX.T; EX.data = cuMolar(EX.T);

/** C/3Nk against T/θ for Debye and Einstein, with the T³ law. */
function cPic({ mark = null, einstein = true, t3 = true, caption, x = [0, 1.5] }) {
  const curves = [{ fn: debyeCExpr('x'), domain: [0.01, x[1]], color: 'accent', width: 2.6, label: 'Debye', labelAt: r4(x[1] * 0.8), labelDy: 16 }];
  if (einstein) curves.push({ fn: '(1/x)^2*e^(1/x)/(e^(1/x) - 1)^2', domain: [0.02, x[1]], color: 'violet', dash: true, label: 'Einstein (θ(E) = θ(D))', labelAt: r4(x[1] * 0.45), labelDy: 18 });
  if (t3) curves.push({ fn: `${r4((4 * Math.PI ** 4) / 5)}*x^3`, domain: [0, 0.25], color: 'ink3', dash: true, label: 'T³ law', labelAt: 0.2, labelDx: 6 });
  return {
    type: 'graph',
    params: { x, y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'T / θ', ylabel: 'C / 3Nk', curves, hlines: [{ y: 1, color: 'ink4', label: 'Dulong–Petit 3Nk' }], vlines: mark === null ? [] : [{ x: r4(mark), color: 'gold' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T7.5',
  title: 'Debye theory of solids',
  minutes: 17, difficulty: 3,
  intro: t`Einstein’s solid ([T2.2](#/lesson/phys3700.T2.2)) gave every atom the same vibration frequency, and so predicted that heat capacity dies **exponentially** in the cold. Measured heat capacities fall only as $T^3$. Debye’s fix: a crystal’s vibrations are **sound waves** — modes of every wavelength down to the atomic spacing, each a boson state for **phonons** with Planck occupancy $1/(e^{\varepsilon/kT} - 1)$, just like photons in a cavity (T7.4) but with three polarizations, the speed of sound instead of $c$, and a cutoff that leaves exactly $3N$ modes. The result is

$$C_V = 9Nk\left(\frac{T}{T_D}\right)^3\int_0^{T_D/T}\frac{x^4e^x}{(e^x - 1)^2}\,dx,$$

which tends to $3Nk$ (Dulong–Petit) when hot and to $\tfrac{12\pi^4}{5}Nk(T/T_D)^3$ when cold: long-wavelength sound waves have tiny quanta, so some are always excited, however cold the crystal.`,
  symbols: [
    { tex: 'C_V', text: 'the heat capacity of the lattice vibrations at constant volume, in J/K' },
    { tex: 'N', text: 'the number of atoms (so $3N$ vibrational modes)' },
    { tex: 'k', text: 'Boltzmann’s constant; $Nk = nR$ for $n$ moles' },
    { tex: 'T_D', text: 'the Debye temperature (also written $\\theta_D$), the energy of the highest-frequency phonon over $k$: 343 K for copper, 2230 K for diamond (Kittel)' },
    { tex: 'x', text: 'a phonon’s energy over $kT$, the integration variable' },
  ],
  why: 'Debye’s T³ law sets how fast cryogenic hardware cools and how much heat a cold stage can soak up; phonons also carry heat in insulators and limit the noise of the coldest detectors.',
  visual: {
    type: 'graph',
    title: 'Fit copper',
    lead: t`Copper’s measured molar heat capacity (gold; NIST’s fit to data, 4–300 K) on log–log axes, against Debye’s prediction (blue). Adjust $T_D$ until they agree; then switch on the conduction electrons’ $\gamma T$ (Sommerfeld, T7.3) and look below 10 K.`,
    tasks: [
      'With T(D) near 343 K, Debye matches the data to within about 10 % from 100 K up to room temperature, where both approach 3R = 24.9 J/(mol·K); between about 15 and 70 K it runs up to 20 % low, because copper’s real phonon spectrum is not Debye’s.',
      'Below about 5 K the lattice alone falls short: add the electrons’ γT and the curve meets the data. Their heat capacity falls only as T, so it wins in the deep cold.',
      'Move T(D) away from 343 K: the low-temperature mismatch grows as (343/T(D))³ — the T³ law makes θ easy to measure.',
    ],
    params: {
      x: [0.3, 2.5], y: [-4, 1.6], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'temperature (K)', ylabel: 'molar heat capacity (J mol⁻¹ K⁻¹)',
      sliders: [{ key: 'th', label: 'Debye temperature $T_D$', min: 250, max: 450, step: 1, value: 343, unit: '\\text{K}', explain: 'The one parameter of Debye’s model.' }],
      choices: [{ key: 'el', label: 'Conduction electrons', options: [[0, 'left out'], [1, 'added (γT)']], value: 0, explain: 'Sommerfeld’s electronic heat capacity, γ = 0.695 mJ mol⁻¹ K⁻² for copper (Kittel).' }],
      curves: [
        { fn: `log10(${cuSpecificExpr('10^x')}*${CU.M})`, domain: [r4(L10(4)), r4(L10(300))], color: 'gold', width: 4, label: 'copper (data)', labelAt: 0.75, labelDx: -30, labelDy: -14 },
        { fn: `log10(${3 * R}*(${debyeCExpr('10^x/th')}) + el*${CU.gamma}*10^x)`, domain: [0.3, 2.5], color: 'accent', width: 2 },
      ],
      hlines: [{ y: r4(L10(3 * R)), color: 'ink3', label: '3R' }],
      readouts: [
        { label: 'Debye at 10 K', expr: `${3 * R}*(${debyeCExpr('10/th')}) + el*${CU.gamma}*10`, digits: 3 },
        { label: 'data at 10 K', expr: String(r4(cuMolar(10) * 1e4) / 1e4), digits: 3 },
      ],
    },
    caption: 'Data: NIST Cryogenic Material Properties, OFHC copper (curve fit to measurements, quoted 4–300 K; it is C at constant pressure, within 2 % of C(V) here). Real phonon spectra are not Debye’s; fitted T(D) values drift by 10 % or so with temperature.',
  },
  example: {
    prompt: t`Predict copper’s molar heat capacity at $${EX.T}$ K from the Debye $T^3$ law ($T_D = ${CU.theta}$ K) plus the electronic term $\gamma T$ ($\gamma = 0.695$ mJ mol⁻¹ K⁻²), and compare with the measured $${fmt(EX.data * 1000, 3)}$ mJ mol⁻¹ K⁻¹.`,
    visual: cPic({ mark: EX.T / CU.theta, caption: 'Debye and Einstein heat capacities against T/θ, with the T³ law; gold marks copper at 10 K, deep in the T³ region.' }),
    steps: [
      { label: 'Low-T limit', text: t`For $T \ll T_D$ the upper limit of the integral can go to infinity, where it equals $4\pi^4/15$: $C_V = \dfrac{12\pi^4}{5}Nk\left(\dfrac{T}{T_D}\right)^3$.` },
      { label: 'Lattice', text: t`Per mole, $\dfrac{12\pi^4}{5}R = 1944$ J mol⁻¹ K⁻¹, so $C_\text{lat} = 1944\left(\dfrac{${EX.T}}{${CU.theta}}\right)^3 = ${fmt(EX.lat * 1000, 3)}$ mJ mol⁻¹ K⁻¹.` },
      { label: 'Electrons', text: t`$\gamma T = (0.695)(${EX.T}) = ${fmt(EX.el * 1000, 3)}$ mJ mol⁻¹ K⁻¹ — about an eighth of the total here.` },
      { label: 'Compare', text: t`Sum: $${fmt((EX.lat + EX.el) * 1000, 3)}$ mJ mol⁻¹ K⁻¹ against $${fmt(EX.data * 1000, 3)}$ measured: agreement to $${fmt(100 * Math.abs(EX.lat + EX.el - EX.data) / EX.data, 1)}\,\%$.` },
      { label: 'Sense check', text: t`At $${EX.T}$ K copper holds about $1/${Math.round((3 * R) / EX.data)}$ of its room-temperature heat capacity. The Einstein model with the same characteristic temperature would predict $3R\,x^2e^{-x}$ with $x = 34.3$ — about $10^{-11}$ J mol⁻¹ K⁻¹, hopelessly small.` },
    ],
    answer: t`$C \approx ${fmt((EX.lat + EX.el) * 1000, 3)}$ mJ mol⁻¹ K⁻¹ (lattice $${fmt(EX.lat * 1000, 3)}$, electrons $${fmt(EX.el * 1000, 2)}$); measured $${fmt(EX.data * 1000, 3)}$.`,
  },
  practice: [
    num({
      id: 't3-law', difficulty: 2,
      gen(r) {
        const m = r.pick(['Al', 'Ag', 'Pb', 'Si']), T = r.pick([2, 5, 8]), th = THETA_D[m], v = debyeBeta(th) * T ** 3 * 1000;
        return {
          prompt: t`${NAMES[m][0].toUpperCase() + NAMES[m].slice(1)} has Debye temperature $${th}$ K. Using the low-temperature Debye law, what is its lattice heat capacity at $${T}$ K, in mJ per mole per kelvin?`,
          answer: v, units: 'mJ/(mol K)', tol: { rel: 0.01 },
          errors: apart([{ value: 3 * R * (T / th) ** 3 * 1000, feedback: t`Keep the prefactor $\tfrac{12\pi^4}{5} \approx 233.8$, not 3.` }, { value: debyeBeta(th) * T ** 3, feedback: 'That is in J/(mol K); the answer is asked in mJ.' }], v),
          hints: [t`$C = \dfrac{12\pi^4}{5}R\left(\dfrac{T}{T_D}\right)^3 = 1944\ \text{J mol}^{-1}\text{K}^{-1}\times(T/T_D)^3$.`, t`$(${T}/${th})^3 = ${texNum((T / th) ** 3, 3)}$.`],
          teach: t`Deep in the cold, $C = 1944\,(T/T_D)^3$ J mol⁻¹ K⁻¹ for any crystal.`,
          explain: t`$C = 1944\times${texNum((T / th) ** 3, 3)} = ${fmt(v, 3)}$ mJ mol⁻¹ K⁻¹.${m !== 'Si' && m !== 'C' ? ' A metal adds γT for its electrons on top.' : ''}`,
          visual: cPic({ mark: T / th, x: [0, 0.3], einstein: false, caption: 'The Debye heat capacity against T/θ near absolute zero, with its T³ approximation (dashed); gold: this temperature.' }),
        };
      },
    }),
    mcq({
      id: 'why-t3', difficulty: 3,
      prompt: 'Why does the Debye model give C ∝ T³ at low temperature while the Einstein model gives an exponential fall?',
      choices: ['Long-wavelength sound waves have quanta far below kT, so a few modes are always active; their number grows as T³', 'Debye includes the electrons and Einstein does not', 'Einstein’s oscillators are classical and Debye’s quantum', 'Debye allows more than 3N modes'],
      answer: 0,
      why: { 1: 'Neither model includes the electrons; their γT is a separate term.', 2: 'Both models are quantum: both use Planck occupancies. They differ in which frequencies exist.', 3: 'Debye’s cutoff is chosen to keep exactly 3N modes.' },
      hints: ['In Einstein’s model, what is the lowest vibrational quantum? In Debye’s?', t`Only modes with $\varepsilon \lesssim kT$ hold energy. How many sound modes have $\varepsilon < kT$? (Think of the photon count, $\propto T^3$.)`],
      teach: 'The T³ law is the photon-gas T³ count again: excited phonon modes ∝ T³, each holding about kT, so U ∝ T⁴ and C ∝ T³.',
      explain: t`Phonon energies run continuously down to zero. At temperature $T$ the modes with $\varepsilon \lesssim kT$ are those with wavenumber below $kT/\hbar c_s$, a number $\propto T^3$; each holds about $kT$, so $U \propto T^4$ — as for the photon gas — and $C \propto T^3$. Einstein’s single quantum $\hbar\omega_E$ cannot be excited at all once $kT \ll \hbar\omega_E$.`,
      visual: cPic({ x: [0, 0.6], caption: 'Debye (solid) against Einstein (dashed) at low temperature, with the T³ law.' }),
    }),
    num({
      id: 'theta-from-sound', difficulty: 3,
      gen(r) {
        const pick = r.pick([['aluminium', 2700, 0.0269815, 6420, 3040, 428], ['copper', 8960, 0.063546, 4760, 2325, 343]]);
        const [name, rho, M, cL, cT, thMeas] = pick, n = (rho * NA) / M, c = Math.cbrt(3 / (1 / cL ** 3 + 2 / cT ** 3)), v = ((H * c) / (2 * KB)) * Math.cbrt((6 * n) / Math.PI);
        return {
          prompt: t`Debye’s cutoff gives $T_D = \dfrac{hc_s}{2k}\left(\dfrac{6N}{\pi V}\right)^{1/3}$, where $c_s$ averages the sound speeds: $\dfrac{3}{c_s^3} = \dfrac{1}{c_L^3} + \dfrac{2}{c_T^3}$ (one longitudinal and two transverse waves). For ${name} ($N/V = ${texNum(n, 3)}\ \text{m}^{-3}$, $c_L = ${cL}$ m/s, $c_T = ${cT}$ m/s), what is $T_D$?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: ((H * cL) / (2 * KB)) * Math.cbrt((6 * n) / Math.PI), feedback: 'Average the three polarizations: the slow transverse waves dominate 3/c(s)³.' }, { value: ((H * ((cL + 2 * cT) / 3)) / (2 * KB)) * Math.cbrt((6 * n) / Math.PI), feedback: 'Average 1/c³, not c: the number of modes below a frequency goes as 1/c³.' }], v),
          hints: [t`$c_s = \left[3\Big/\left(\tfrac{1}{c_L^3} + \tfrac{2}{c_T^3}\right)\right]^{1/3} = ${fmt(c, 4)}$ m/s.`, t`$\dfrac{h}{2k} = 2.400\times10^{-11}$ K·s; $(6N/\pi V)^{1/3} = ${texNum(Math.cbrt((6 * n) / Math.PI), 4)}\ \text{m}^{-1}$.`],
          teach: 'The Debye temperature is set by the speed of sound and the atom spacing: stiff, light solids have high T(D).',
          explain: t`$c_s = ${fmt(c, 4)}$ m/s gives $T_D = ${fmt(v, 3)}$ K, against $${thMeas}$ K fitted to heat-capacity data (Kittel): within about 10 %, from nothing but sound speeds.`,
          visual: cPic({ einstein: false, t3: false, caption: 'Debye’s heat capacity against T/θ: one parameter, T(D), sets the temperature scale for the whole curve.' }),
        };
      },
    }),
    mcq({
      id: 'diamond', difficulty: 2,
      prompt: 'At room temperature most solid elements have molar heat capacities near 3R = 25 J/(mol·K), but diamond’s is only about 6 J/(mol·K). Why?',
      choices: ['Its Debye temperature (about 2230 K) is far above room temperature, so most of its vibrational modes are frozen', 'Carbon atoms are light, and heat capacity per mole is proportional to atomic mass', 'Diamond has no free electrons', 'Its atoms vibrate in only one direction'],
      answer: 0,
      why: { 1: 'Per mole, the classical value 3R does not depend on mass at all. Lightness matters only through the vibration frequencies.', 2: 'Electrons add only about 1 % even in metals at room temperature.', 3: 'Every atom vibrates in three dimensions: 3N modes.' },
      hints: ['Where does 298 K sit on the Debye curve if T(D) = 2230 K?'],
      teach: 'Dulong–Petit holds only for T ≳ T(D); stiff, light crystals such as diamond fall far short at room temperature.',
      explain: t`$T/T_D = 0.13$: Debye gives $C = ${fmt(3 * R * debyeC(298.15 / 2230), 2)}$ J/(mol·K). Measured: 6.1 — the right size and far below 3R; a single $T_D$ only approximates diamond’s real phonon spectrum.`,
      visual: cPic({ mark: 298.15 / 2230, einstein: false, caption: 'Debye’s heat capacity against T/θ; gold: diamond at room temperature.' }),
    }),
    code({
      id: 'debye-code', difficulty: 3,
      prompt: t`Write \`C_debye(T, TD)\` that **returns** the Debye molar heat capacity in J/(mol·K), $9R\,(T/T_D)^3\int_0^{T_D/T}\dfrac{x^4e^x}{(e^x - 1)^2}dx$, using \`scipy.integrate.quad\`. Then print it for copper ($T_D = 343$ K) at 10 K and 300 K.`,
      starter: t`from math import exp, expm1
from scipy.integrate import quad

R = 8.314462618       # J/(mol K)

def C_debye(T, TD):
    pass

print(C_debye(10, 343), C_debye(300, 343))
`,
      answer: t`from math import exp, expm1
from scipy.integrate import quad

R = 8.314462618       # J/(mol K)

def integrand(x):
    if x == 0:
        return 0.0
    if x > 700:
        return 0.0
    return x**4 * exp(x) / expm1(x)**2

def C_debye(T, TD):
    I, err = quad(integrand, 0, TD / T, limit=200)
    return 9 * R * (T / TD)**3 * I

print(C_debye(10, 343), C_debye(300, 343))`,
      tests: [
        { name: t`at $T = T_D$, $C = ${fmt(3 * R * debyeC(1), 4)}$ J/(mol·K) (95 % of 3R)`, code: `abs(C_debye(343, 343) - ${3 * R * debyeC(1)}) < 1e-3` },
        { name: t`copper at 10 K: $${fmt(3 * R * debyeC(10 / 343) * 1000, 4)}$ mJ/(mol·K), the T³ law`, code: `abs(C_debye(10, 343) / ${3 * R * debyeC(10 / 343)} - 1) < 1e-4` },
        { name: 'hot: approaches 3R = 24.94 J/(mol·K)', code: 'abs(C_debye(5000, 343) - 3*R) < 0.01' },
      ],
      hints: [t`Guard the integrand: at $x = 0$ its limit is 0, and for large $x$ (\`x > 700\`) \`exp\` would overflow but the value is 0.`, t`\`I, err = quad(integrand, 0, TD/T)\`, then \`return 9*R*(T/TD)**3 * I\`.`],
      teach: 'The Debye integral has no closed form but is one line of quad; its two limits are the T³ law and Dulong–Petit.',
      explain: t`Between the limits the integral must be done numerically. Copper: $${fmt(3 * R * debyeC(10 / 343) * 1000, 3)}$ mJ/(mol·K) at 10 K and $${fmt(3 * R * debyeC(300 / 343), 3)}$ J/(mol·K) at 300 K (measured: $${fmt(cuMolar(300), 3)}$, which includes thermal expansion — $C_P$ — and the electrons).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cooldown', difficulty: 3, transfer: true,
      gen(r) {
        const mass = r.pick([2, 5, 10]), T1 = r.pick([4, 8, 10]), T2 = 1, mol = mass / CU.M, beta = debyeBeta(CU.theta);
        const v = mol * ((beta / 4) * (T1 ** 4 - T2 ** 4) + (CU.gamma / 2) * (T1 ** 2 - T2 ** 2));
        return {
          prompt: t`A space telescope’s detector bench is $${mass}$ kg of copper. How much heat must its cryocooler remove to cool it from $${T1}$ K to $${T2}$ K? Use $C = \beta T^3 + \gamma T$ per mole, with $\beta = 12\pi^4R/5T_D^3$ ($T_D = 343$ K), $\gamma = 0.695$ mJ mol⁻¹ K⁻², and $63.55$ g/mol.`,
          answer: v, units: 'J', tol: { rel: 0.01 },
          errors: apart([{ value: mol * (beta / 4) * (T1 ** 4 - T2 ** 4), feedback: 'Include the conduction electrons: at a few kelvin their γT is as big as the lattice term.' }, { value: mol * (beta * T1 ** 3 + CU.gamma * T1) * (T1 - T2), feedback: 'C changes a great deal over this range: integrate C dT instead of using C at the top.' }], v),
          hints: [t`$Q = n\displaystyle\int_{T_2}^{T_1}(\beta T^3 + \gamma T)\,dT = n\left[\tfrac{\beta}{4}(T_1^4 - T_2^4) + \tfrac{\gamma}{2}(T_1^2 - T_2^2)\right]$.`, t`$n = ${fmt(mol, 4)}$ mol; $\beta = ${texNum(beta, 4)}$ J mol⁻¹ K⁻⁴.`],
          teach: 'Cooling budgets in cryogenics are integrals of C dT, and below ~4 K a metal’s electrons dominate them.',
          explain: t`Lattice: $${fmt(mol * (beta / 4) * (T1 ** 4 - T2 ** 4), 3)}$ J; electrons: $${fmt(mol * (CU.gamma / 2) * (T1 ** 2 - T2 ** 2), 3)}$ J; total $${fmt(v, 3)}$ J. Tiny by room-temperature standards — but cryocoolers deliver milliwatts at these temperatures, so it still takes ${v / 0.01 > 3600 ? 'hours' : 'minutes to hours'} at 10 mW.`,
          visual: { type: 'graph', params: { x: [0, 12], y: [0, 0.12], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'C (J mol⁻¹ K⁻¹)', curves: [{ fn: `${debyeBeta(CU.theta)}*x^3 + ${CU.gamma}*x`, domain: [0, 12], color: 'accent', label: 'lattice + electrons', labelAt: 9, labelDx: -130 }, { fn: `${CU.gamma}*x`, domain: [0, 12], color: 'warn', dash: true, label: 'electrons', labelAt: 11, labelDy: 14 }], shade: [{ fn: `${debyeBeta(CU.theta)}*x^3 + ${CU.gamma}*x`, lower: '0', from: T2, to: T1, color: 'gold', alpha: 0.3 }] }, caption: 'Copper’s low-temperature molar heat capacity; the shaded area is the heat per mole removed on cooling.' },
        };
      },
    }),
    num({
      id: 'cp-crossover', difficulty: 3,
      gen(r) {
        const m = r.pick(['Cu', 'Al', 'Ag', 'Au']), v = Math.sqrt(GAMMA[m] / debyeBeta(THETA_D[m]));
        return {
          prompt: t`Below what temperature does the conduction electrons’ heat capacity ($\gamma T$, $\gamma = ${fmt(GAMMA[m] * 1000, 3)}$ mJ mol⁻¹ K⁻²) exceed the lattice’s Debye $T^3$ term in ${NAMES[m]} ($T_D = ${THETA_D[m]}$ K)?`,
          answer: v, units: 'K', tol: { rel: 0.01 },
          errors: apart([{ value: GAMMA[m] / debyeBeta(THETA_D[m]), feedback: t`Setting $\gamma T = \beta T^3$ gives $T^2 = \gamma/\beta$: take the square root.` }, { value: Math.sqrt(GAMMA[m] / (3 * R / THETA_D[m] ** 3)), feedback: t`$\beta = 12\pi^4R/5T_D^3$, not $3R/T_D^3$.` }], v),
          hints: [t`Solve $\gamma T = \beta T^3$ with $\beta = 1944/T_D^3$ J mol⁻¹ K⁻⁴.`, t`$T = \sqrt{\gamma/\beta}$.`],
          teach: 'Electrons (∝ T) beat phonons (∝ T³) below a few kelvin in every metal.',
          explain: t`$\beta = ${texNum(debyeBeta(THETA_D[m]), 3)}$ J mol⁻¹ K⁻⁴, so $T = \sqrt{\gamma/\beta} = ${fmt(v, 3)}$ K. Plotting $C/T$ against $T^2$ turns the sum into a straight line whose intercept is $\gamma$ and slope $\beta$ — the standard way both are measured.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 0.03], aspect: 'wide', axesAt: 'edge', xlabel: 'temperature (K)', ylabel: 'C (J mol⁻¹ K⁻¹)', curves: [{ fn: `${debyeBeta(THETA_D[m])}*x^3`, domain: [0, 10], color: 'accent', label: 'lattice βT³', labelAt: 6, labelDx: -80 }, { fn: `${GAMMA[m]}*x`, domain: [0, 10], color: 'warn', label: 'electrons γT', labelAt: 9, labelDy: 14 }] }, caption: 'The two low-temperature contributions for this metal; where they cross is the answer.' },
        };
      },
    }),
    mcq({
      id: 'cp-high-T', difficulty: 2,
      prompt: 'Why does a solid’s heat capacity level off at 3Nk when T ≫ T(D), instead of rising for ever as the photon gas’s does?',
      choices: ['A crystal has only 3N vibrational modes, and once all are classical each holds kT', 'At high temperature the phonons stop obeying Bose–Einstein statistics', 'The atoms stop vibrating and start rotating', 'The speed of sound falls to zero'],
      answer: 0,
      why: { 1: 'They still obey it; at high T the Planck occupancy simply becomes kT/ε — the classical limit.', 2: 'Atoms in a crystal cannot rotate freely; they vibrate about their sites.', 3: 'The speed of sound changes little with temperature in a solid.' },
      hints: ['How many modes does a cavity have? How many does a crystal of N atoms have?'],
      teach: 'A finite number of modes (3N) caps the heat capacity at the equipartition value 3Nk.',
      explain: t`A cavity has infinitely many modes, so heating it keeps exciting new ones and $C \propto T^3$ for ever. A crystal’s shortest wavelength is set by the atom spacing, leaving $3N$ modes; once $kT$ exceeds the top phonon energy, $kT_D$, each holds $kT$ and $C = 3Nk$.`,
      visual: cPic({ x: [0, 3], caption: 'Debye and Einstein heat capacities against T/θ, both saturating at 3Nk.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.5', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Kittel, Introduction to Solid State Physics, 8th ed., Tables 5.1 (Debye temperatures) and 6.3 (electronic γ)', url: 'https://www.wiley.com/en-us/Introduction+to+Solid+State+Physics%2C+8th+Edition-p-9780471415268' },
    { label: 'NIST Cryogenic Material Properties: OFHC copper (specific heat fit)', url: 'https://trc.nist.gov/cryogenics/materials/OFHC%20Copper/OFHC_Copper_rev1.htm' },
    { label: 'NIST Chemistry WebBook: carbon (diamond) heat capacity', url: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7782403' },
  ],
});
