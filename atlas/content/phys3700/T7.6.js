// Bose–Einstein condensation: at fixed density, cooling a boson gas pushes
// μ up to the ground-state energy; the excited states can then hold at most
// ζ(3/2)V/v_Q atoms, and the rest pile into one state. kT_c = 0.527
// (h²/2πm)(N/V)^(2/3); the condensate fraction 1 − (T/T_c)^(3/2) in a box
// (1 − (T/T_c)³ in a harmonic trap); liquid helium-4 (ideal 3.1 K against the
// real 2.17 K); rubidium clouds at tens of nanokelvin, and NASA's Cold Atom
// Lab, which makes them in orbit.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, H, AMU, ZETA32, becTc, vQ, r4, texNum, apart, occPic } from './_stat.js';

const t = String.raw;
const M = { Rb87: 86.909180531, Na23: 22.98976928, K41: 40.96182526, He4: 4.00260325413, H1: 1.00782503223 };   // u (AME2020)
const COEF = ZETA32 ** (-2 / 3);                  // 0.527
const EX = { rho: 145, m: M.He4 };                // liquid helium at its boiling point, kg/m³
EX.n = EX.rho / (EX.m * AMU); EX.Tc = becTc(EX.n, EX.m * AMU);

/** Condensate fraction against T/T_c for a box (and optionally a harmonic trap). */
function fracPic({ mark = null, trap = true, caption, hline = null }) {
  const curves = [{ fn: '1 - x^1.5', domain: [0, 1], color: 'accent', width: 2.6, label: 'box', labelAt: 0.55, labelDx: 8 }, { fn: '0', domain: [1, 1.5], color: 'accent', width: 2.6 }];
  if (trap) curves.push({ fn: '1 - x^3', domain: [0, 1], color: 'violet', dash: true, label: 'harmonic trap', labelAt: 0.82, labelDx: 8 });
  return {
    type: 'graph',
    params: { x: [0, 1.5], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'T / T(c)', ylabel: 'condensate fraction N₀/N', curves, vlines: [{ x: 1, color: 'ink4' }, ...(mark === null ? [] : [{ x: r4(mark), color: 'gold' }])], hlines: hline === null ? [] : [{ y: hline, color: 'gold' }] },
    caption,
  };
}
/** T_c against density for a given atom, log–log. */
function tcPic({ m, label, n = null, caption }) {
  const c = (H * H) / (2 * Math.PI * m * AMU * KB) / ZETA32 ** (2 / 3);
  return {
    type: 'graph',
    params: { x: [16, 21], y: [0, 3.5], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'atoms per m³', ylabel: 'T(c) (nK)', curves: [{ fn: `log10(${c * 1e9}*(10^x)^(2/3))`, domain: [16, 21], color: 'accent', label, labelAt: 17, labelDx: 6, labelDy: -10 }], vlines: n === null ? [] : [{ x: r4(Math.log10(n)), color: 'gold' }] },
    caption,
  };
}

export default lesson({
  id: 'phys3700.T7.6',
  title: 'Bose–Einstein condensation',
  minutes: 16, difficulty: 3,
  intro: t`Cool a gas of bosons at fixed density. To keep the particle count fixed, $\mu$ rises toward the ground-state energy (T7.2) — but it can never reach it, and with $\mu$ at its ceiling the **excited** states can hold only so many particles: $\zeta(3/2)\,V/v_Q = 2.612\,V/v_Q$, a number that shrinks as $T^{3/2}$. Below the temperature where that equals $N$, every extra particle has nowhere to go but the single lowest state. That is **Bose–Einstein condensation**, and it sets in at

$$kT_c = 0.527\,\frac{h^2}{2\pi m}\left(\frac{N}{V}\right)^{2/3},$$

which is just the condition $N/V = 2.612/v_Q$: about one particle per quantum volume. Below $T_c$ a fraction $1 - (T/T_c)^{3/2}$ of the atoms share one quantum state. Nothing pulls them together: it is a pure effect of counting identical particles.`,
  symbols: [
    { tex: 'T_c', text: 'the condensation temperature, in K' },
    { tex: 'h', text: 'Planck’s constant' },
    { tex: 'm', text: 'the mass of one boson (one atom), in kg' },
    { tex: 'N/V', text: 'the number density, in m⁻³' },
    { tex: '0.527', text: '$\\zeta(3/2)^{-2/3}$, where $\\zeta(3/2) = 2.612$ comes from $\\int_0^\\infty \\sqrt x\\,dx/(e^x - 1) = \\tfrac{\\sqrt\\pi}{2}\\zeta(3/2)$' },
  ],
  why: 'Condensation underlies superfluid helium and the atom lasers, atom interferometers and quantum sensors now flown in orbit — candidates for measuring gravity and testing the equivalence principle with matter waves.',
  visual: {
    type: 'graph',
    title: 'The condensate appears',
    lead: t`The fraction of atoms in the single lowest state against temperature, for an ideal gas in a box (blue) and in the harmonic magnetic or optical trap real experiments use (violet, dashed). Slide the temperature down through $T_c$.`,
    tasks: [
      'Above T(c) the fraction is zero — not small, zero in the limit of many atoms. At T(c) it begins to grow, with a kink: a phase transition.',
      'At T = 0.5 T(c), 65 % of atoms in a box are in one quantum state; in a trap, 88 %.',
      'Read the excited atoms: their number is fixed by T alone, 2.612 V/v(Q) — add more atoms and they all go into the condensate.',
    ],
    params: {
      x: [0, 1.5], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'T / T(c)', ylabel: 'condensate fraction N₀/N',
      sliders: [{ key: 'tt', label: 'Temperature, $T/T_c$', min: 0, max: 1.5, step: 0.01, value: 0.7, explain: 'Temperature as a fraction of the condensation temperature.' }],
      curves: [
        { fn: '1 - x^1.5', domain: [0, 1], color: 'accent', width: 2.6, label: 'box', labelAt: 0.55, labelDx: 8 },
        { fn: '0', domain: [1, 1.5], color: 'accent', width: 2.6 },
        { fn: '1 - x^3', domain: [0, 1], color: 'violet', dash: true, label: 'harmonic trap', labelAt: 0.82, labelDx: 8 },
      ],
      vlines: [{ x: 'tt', color: 'gold' }, { x: 1, color: 'ink4' }],
      readouts: [
        { label: 'box: $N_0/N$', expr: 'max(0, 1 - tt^1.5)', digits: 3 },
        { label: 'trap: $N_0/N$', expr: 'max(0, 1 - tt^3)', digits: 3 },
        { label: 'box: excited atoms, $N_\\text{ex}/N$', expr: 'min(1, tt^1.5)', digits: 3 },
      ],
    },
    caption: 'Ideal, non-interacting bosons with very many atoms. In a trap the density of states grows faster with energy, hence the steeper (T/T(c))³. Real atoms interact weakly, which shifts T(c) by a few per cent and changes the condensate’s shape.',
  },
  example: {
    prompt: t`Liquid helium-4 has density $${EX.rho}$ kg/m³ at its boiling point. Treating its atoms as an ideal Bose gas, at what temperature should it condense? Compare with the 2.17 K at which it actually turns superfluid.`,
    visual: fracPic({ trap: false, caption: 'The ideal-gas condensate fraction in a box against T/T(c). Liquid helium is not ideal, but its superfluid fraction behaves similarly.' }),
    steps: [
      { label: 'Density', text: t`$n = \rho/m = ${EX.rho}/(4.0026\times1.6605\times10^{-27}) = ${texNum(EX.n, 3)}\ \text{m}^{-3}$.` },
      { label: 'Why 2.612', text: t`With $\mu = 0$, the excited states hold $N_\text{ex} = \displaystyle\int_0^\infty \frac{g(\varepsilon)\,d\varepsilon}{e^{\varepsilon/kT} - 1} = \frac{2}{\sqrt\pi}\frac{V}{v_Q}\int_0^\infty\frac{\sqrt x\,dx}{e^x - 1} = 2.612\,\frac{V}{v_Q}$.` },
      { label: 'Condition', text: t`Set $N_\text{ex} = N$: $v_Q = 2.612/n$, i.e. $kT_c = \dfrac{h^2}{2\pi m}\left(\dfrac{n}{2.612}\right)^{2/3} = 0.527\,\dfrac{h^2}{2\pi m}n^{2/3}$.` },
      { label: 'Numbers', text: t`$T_c = ${fmt(EX.Tc, 3)}$ K.` },
      { label: 'Compare', text: t`Real helium becomes superfluid at 2.17 K — the right size, from nothing but its density and mass. The difference comes from the strong interactions in a liquid, which deplete the condensate: neutron scattering finds well under 10 % of the atoms in the zero-momentum state even near absolute zero.` },
    ],
    answer: t`Ideal-gas $T_c = ${fmt(EX.Tc, 3)}$ K, against the measured 2.17 K.`,
  },
  practice: [
    num({
      id: 'fraction', difficulty: 1,
      gen(r) {
        const x = r.pick([0.3, 0.5, 0.8, 0.9]), v = 1 - x ** 1.5;
        return {
          prompt: t`An ideal Bose gas in a box is at $T = ${x}\,T_c$. What fraction of its atoms are in the ground state?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: x ** 1.5, feedback: 'That is the fraction in excited states.' }, { value: 1 - x, feedback: t`The excited share grows as $(T/T_c)^{3/2}$, not linearly.` }, { value: 1 - x ** 3, feedback: 'That is the harmonic-trap result. In a box the power is 3/2.' }], v),
          hints: [t`$N_\text{ex}/N = (T/T_c)^{3/2}$, since $N_\text{ex} \propto V/v_Q \propto T^{3/2}$.`],
          teach: t`Below $T_c$ in a box, $N_0/N = 1 - (T/T_c)^{3/2}$.`,
          explain: t`$${x}^{3/2} = ${fmt(x ** 1.5, 3)}$ of the atoms are excited, so $N_0/N = ${fmt(v, 3)}$.`,
          visual: fracPic({ trap: false, caption: 'Condensate fraction against T/T(c) for an ideal gas in a box.' }),
        };
      },
    }),
    num({
      id: 'tc-rb', difficulty: 2,
      gen(r) {
        const n = r.pick([2e18, 5e18, 1e19, 3e19]), v = becTc(n, M.Rb87 * AMU) * 1e9;
        return {
          prompt: t`A cloud of rubidium-87 atoms ($86.909$ u) has peak density $${texNum(n, 1)}\ \text{m}^{-3}$. Using the uniform-gas formula at that density, at what temperature does it condense? Answer in nanokelvin.`,
          answer: v, units: 'nK', tol: { rel: 0.01 },
          errors: apart([{ value: ((H * H) / (2 * Math.PI * M.Rb87 * AMU * KB)) * n ** (2 / 3) * 1e9, feedback: 'Include the factor $0.527 = 2.612^{-2/3}$.' }, { value: becTc(n, M.Rb87 * 1e-3) * 1e9, feedback: 'Convert the mass from u to kg (1 u = 1.6605 × 10⁻²⁷ kg).' }], v),
          hints: [t`$T_c = 0.527\,\dfrac{h^2}{2\pi mk}\,n^{2/3}$ with $m = 86.909\times1.6605\times10^{-27}$ kg.`, t`$n^{2/3} = ${texNum(n ** (2 / 3), 3)}\ \text{m}^{-2}$.`],
          teach: 'Dilute atomic gases condense at tens to hundreds of nanokelvin: low density demands extreme cold.',
          explain: t`$T_c = ${fmt(v, 3)}$ nK. (Applying the uniform formula at the cloud’s peak density is the local-density approximation; for a trapped cloud it agrees with the trap formula $kT_c = 0.94\,\hbar\bar\omega N^{1/3}$ when the two are compared consistently.)`,
          visual: tcPic({ m: M.Rb87, label: 'rubidium-87', caption: 'Ideal-gas condensation temperature against density for rubidium-87 (log–log, slope 2/3).' }),
        };
      },
    }),
    mcq({
      id: 'not-attraction', difficulty: 2,
      prompt: 'What drives atoms into the condensate below T(c)?',
      choices: ['Counting: with μ at its ceiling the excited states are “full”, so extra atoms can only go into the ground state', 'A weak attraction between the atoms that makes them clump', 'Gravity, which pulls the coldest atoms to the bottom of the trap', 'Collisions that transfer all the energy to a few atoms'],
      answer: 0,
      why: { 1: 'The textbook calculation is for atoms that do not interact at all, and it still condenses. Real rubidium’s weak interactions are repulsive, if anything.', 2: 'The ground state is a state of the trap, not the bottom of a gravitational well; condensation happens in free fall in orbit too.', 3: 'Collisions establish equilibrium; the condensate is the equilibrium state of an ideal Bose gas, set by its statistics.' },
      hints: ['What is the most the excited states can hold when μ reaches the ground-state energy?', 'Does the derivation contain any force between atoms?'],
      teach: 'Bose–Einstein condensation is a phase transition with no forces in it: statistics alone.',
      explain: t`For bosons, $\mu \le \varepsilon_0$ caps the excited states’ total at $2.612\,V/v_Q$. When $N$ exceeds that, the surplus must sit in the ground state — a phase transition driven purely by indistinguishability.`,
      visual: occPic({ which: ['be'], x: [0, 3], y: [0, 3], labels: false, caption: 'The Bose–Einstein occupancy: as μ approaches the lowest state, that one state’s occupancy grows without limit while the excited states’ total cannot.' }),
    }),
    num({
      id: 'density-needed', difficulty: 2,
      gen(r) {
        const [name, m] = r.pick([['rubidium-87', M.Rb87], ['sodium-23', M.Na23], ['potassium-41', M.K41]]), T = r.pick([100, 200, 500]) * 1e-9, v = ZETA32 / vQ(m * AMU, T);
        return {
          prompt: t`What number density must a gas of ${name} atoms reach to condense at $${fmt(T * 1e9, 3)}$ nK? ($n v_Q = 2.612$, with $v_Q = (h/\sqrt{2\pi mkT})^3$.)`,
          answer: v, units: 'm^-3', tol: { rel: 0.01 },
          errors: apart([{ value: 1 / vQ(m * AMU, T), feedback: 'Condensation needs 2.612 atoms per quantum volume, not 1.' }, { value: ZETA32 / vQ(m * AMU, T) ** (2 / 3), feedback: 'v(Q) is a volume, the cube of the thermal wavelength.' }], v),
          hints: [t`$\lambda = h/\sqrt{2\pi mkT} = ${texNum(Math.cbrt(vQ(m * AMU, T)), 3)}$ m.`, t`$n = 2.612/\lambda^3$.`],
          teach: 'Condensation sets in when the thermal de Broglie wavelength grows to the spacing between atoms.',
          explain: t`$\lambda = ${texNum(Math.cbrt(vQ(m * AMU, T)), 3)}$ m, so $n = ${texNum(v, 3)}\ \text{m}^{-3}$ — a few millionths of the density of air or less. The atoms are far apart, but each one’s wave is as wide as the gap between them.`,
          visual: tcPic({ m, label: name, caption: 'Condensation temperature against density for this atom (log–log); read across from the target temperature.' }),
        };
      },
    }),
    num({
      id: 'mass-ratio', difficulty: 2,
      gen(r) {
        const [a, ma, b, mb] = r.pick([['sodium-23', M.Na23, 'rubidium-87', M.Rb87], ['atomic hydrogen', M.H1, 'rubidium-87', M.Rb87], ['potassium-41', M.K41, 'rubidium-87', M.Rb87]]), v = mb / ma;
        return {
          prompt: t`At the same density, how many times higher is the condensation temperature of ${a} than of ${b}?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.sqrt(mb / ma), feedback: 'v(Q) depends on √m, but T(c) ∝ 1/m: the (h²/m) in front carries the whole mass.' }, { value: ma / mb, feedback: 'Lighter atoms condense at higher temperature.' }], v),
          hints: [t`$T_c \propto n^{2/3}/m$.`],
          teach: 'At fixed density T(c) ∝ 1/m: light bosons condense warmer.',
          explain: t`$T_c \propto 1/m$: the ratio is $${fmt(mb, 5)}/${fmt(ma, 5)} = ${fmt(v, 3)}$. This is why helium-4, the lightest common boson that stays liquid, condenses at kelvins while heavy atoms need nanokelvins at far lower densities.`,
          visual: tcPic({ m: ma, label: a, caption: 'Condensation temperature against density for the lighter atom (log–log).' }),
        };
      },
    }),
    mcq({
      id: 'trap-power', difficulty: 3,
      prompt: 'In a harmonic trap the condensate fraction grows as 1 − (T/T(c))³ rather than a box’s 1 − (T/T(c))^(3/2). Why the steeper power?',
      choices: ['A 3D harmonic trap’s density of states grows as ε², not √ε, so its excited states’ capacity grows as T³', 'Trapped atoms interact more strongly', 'The trap cools the atoms as they condense', 'Only one dimension of the trap matters'],
      answer: 0,
      why: { 1: 'The calculation is for ideal atoms in both cases; interactions are a small correction.', 2: 'The trap is a potential; the cooling is done separately (laser and evaporative cooling).', 3: 'All three trap directions contribute; that is where ε² comes from.' },
      hints: [t`$N_\text{ex} \propto \int g(\varepsilon)\,d\varepsilon/(e^{\varepsilon/kT} - 1)$. Substitute $x = \varepsilon/kT$.`, t`With $g \propto \varepsilon^2$, $N_\text{ex} \propto T^3$; with $g \propto \sqrt\varepsilon$, $N_\text{ex} \propto T^{3/2}$.`],
      teach: 'The power law of the condensate fraction is the power in the density of states plus one.',
      explain: t`A 3D oscillator’s levels $(n_x + n_y + n_z)\hbar\omega$ number about $\varepsilon^2/2(\hbar\omega)^3$ per unit energy, so $N_\text{ex} \propto (kT)^3$ and $N_0/N = 1 - (T/T_c)^3$ — the form measured in trapped rubidium clouds soon after the first condensates.`,
      visual: fracPic({ caption: 'Condensate fraction against T/T(c) for a box (solid) and a harmonic trap (dashed).' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-cal', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([1e17, 3e17, 1e18]), v = becTc(n, M.Rb87 * AMU) * 1e12;
        return {
          prompt: t`NASA’s Cold Atom Lab has made rubidium condensates aboard the International Space Station since 2018. In free fall the trap can be relaxed until the cloud is very dilute. For rubidium-87 at $${texNum(n, 1)}$ atoms per m³, what is the ideal-gas condensation temperature? Answer in picokelvin.`,
          answer: v, units: 'pK', tol: { rel: 0.01 },
          errors: apart([{ value: v / 1000, feedback: 'Check the unit: 1 nK = 1000 pK.' }, { value: ((H * H) / (2 * Math.PI * M.Rb87 * AMU * KB)) * n ** (2 / 3) * 1e12, feedback: 'Include the factor 0.527.' }], v),
          hints: [t`$T_c = 0.527\,\dfrac{h^2}{2\pi mk}n^{2/3}$.`, t`$\dfrac{h^2}{2\pi mk} = ${texNum((H * H) / (2 * Math.PI * M.Rb87 * AMU * KB), 3)}$ K m².`],
          teach: 'Dilute clouds in microgravity condense at picokelvin-scale temperatures, which only expansion in free fall can reach.',
          explain: t`$T_c = ${fmt(v, 3)}$ pK. On the ground a trap weak enough to hold such a dilute cloud cannot support it against gravity; in orbit it can, and a released cloud can drift for seconds instead of milliseconds — what makes space-based atom interferometers attractive for measuring gravity.`,
          visual: tcPic({ m: M.Rb87, label: 'rubidium-87', caption: 'Rubidium-87’s ideal-gas condensation temperature against density (log–log), down to the dilute clouds possible in orbit.' }),
        };
      },
    }),
    num({
      id: 'cp-half', difficulty: 3,
      gen(r) {
        const f = r.pick([0.25, 0.5, 0.75, 0.9]), Tc = r.pick([100, 200, 400]), v = Tc * (1 - f) ** (2 / 3);
        return {
          prompt: t`A box-trapped Bose gas has $T_c = ${Tc}$ nK. To what temperature must it be cooled for ${Math.round(f * 100)} % of its atoms to be in the condensate?`,
          answer: v, units: 'nK', tol: { rel: 0.01 },
          errors: apart([{ value: Tc * (1 - f), feedback: 'The excited fraction is (T/T(c))^(3/2): solve with the 2/3 power.' }, { value: Tc * f ** (2 / 3), feedback: 'Set the excited fraction (1 − f), not the condensed fraction, equal to (T/T(c))^(3/2).' }], v),
          hints: [t`$1 - f = (T/T_c)^{3/2}$.`, t`$T = T_c(1 - f)^{2/3}$.`],
          teach: 'Invert N₀/N = 1 − (T/T(c))^(3/2) to find the temperature for a target condensate fraction.',
          explain: t`$T = ${Tc}\times(${fmt(1 - f, 2)})^{2/3} = ${fmt(v, 3)}$ nK.`,
          visual: fracPic({ trap: false, hline: f, caption: 'Condensate fraction against T/T(c) in a box; gold marks the target fraction.' }),
        };
      },
    }),
    mcq({
      id: 'cp-mu', difficulty: 3,
      prompt: 'As an ideal Bose gas in a box is cooled through T(c) at fixed density, what does its chemical potential do?',
      choices: ['It rises toward the ground-state energy and stays pinned just below it for all T < T(c)', 'It falls steadily toward −∞', 'It jumps above the ground-state energy at T(c)', 'It equals the Fermi energy of the gas'],
      answer: 0,
      why: { 1: 'A very negative μ is the hot, dilute, classical limit; cooling at fixed density raises μ.', 2: 'μ above the lowest state would give it infinite or negative occupancy (T7.2).', 3: 'A Fermi energy belongs to fermions; bosons have none.' },
      hints: [t`$e^{\mu/kT} = Nv_Q/V$ while the gas is classical: what happens as $v_Q$ grows?`, 'It cannot pass the ground-state energy. What happens when it gets there?'],
      teach: 'Below T(c), μ is pinned at (a hair below) the ground-state energy; the condensate absorbs the surplus atoms.',
      explain: t`Cooling raises $\mu$ until, at $T_c$, it reaches $\varepsilon_0$ (to within about $kT/N$). Below $T_c$ it stays there: the ground state’s occupancy $1/(e^{(\varepsilon_0 - \mu)/kT} - 1)$ adjusts to hold whatever the excited states cannot.`,
      visual: occPic({ which: ['be', 'mb'], x: [0, 3], y: [0, 3], caption: 'The Bose–Einstein occupancy against (ε − μ)/kT: as μ approaches the lowest state, that state’s occupancy diverges.' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.6', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Anderson et al., Observation of Bose–Einstein Condensation in a Dilute Atomic Vapor, Science 269, 198 (1995)', url: 'https://doi.org/10.1126/science.269.5221.198' },
    { label: 'Davis et al., Bose–Einstein Condensation in a Gas of Sodium Atoms, Phys. Rev. Lett. 75, 3969 (1995)', url: 'https://doi.org/10.1103/PhysRevLett.75.3969' },
    { label: 'NASA JPL, Cold Atom Lab', url: 'https://coldatomlab.jpl.nasa.gov/' },
    { label: 'NIST Chemistry WebBook: helium-4 fluid properties (density, λ point)', url: 'https://webbook.nist.gov/chemistry/fluid/' },
  ],
});
