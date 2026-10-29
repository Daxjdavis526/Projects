// Bosons and fermions: one single-particle state as the system, the gas of
// identical particles as the reservoir. Fermions (0 or 1 per state) give the
// Fermi–Dirac occupancy, bosons (any number) Bose–Einstein; both reduce to
// Boltzmann when every occupancy is small. Counting two particles in a few
// states; why μ < ε₀ for bosons and μ = 0 for photons; thermal photon
// numbers in a satellite receiver and a spacecraft radiator.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, H, KEV, r4, texNum, apart, occPic, nFD, nBE, nMB } from './_stat.js';

const t = String.raw;
const CL = 299792458;
const EX = { x: 1 };
EX.fd = nFD(EX.x); EX.be = nBE(EX.x); EX.mb = nMB(EX.x);
const mark = (x, y, color = 'gold', label = '') => ({ x: r4(x), y: r4(y), r: 5, color, label, labelDx: 8, labelDy: -8 });

export default lesson({
  id: 'phys3700.T7.2',
  title: 'Bosons and fermions',
  minutes: 15, difficulty: 3,
  intro: t`Identical quantum particles come in two kinds. **Fermions** (electrons, protons, neutrons, helium-3 atoms) obey the exclusion principle: at most one per single-particle state. **Bosons** (photons, helium-4 atoms, rubidium-87 atoms) can pile any number into one state. Take **one single-particle state** of energy $\varepsilon$ as the system and the rest of the gas as the reservoir: the Gibbs factor of T7.1 gives its average number of particles,

$$\bar n = \frac{1}{e^{(\varepsilon - \mu)/kT} \pm 1},$$

with $+$ for fermions (the **Fermi–Dirac** distribution) and $-$ for bosons (**Bose–Einstein**). When $\varepsilon - \mu \gg kT$ the $\pm1$ is negligible and both become the Boltzmann factor $e^{-(\varepsilon - \mu)/kT}$: that is the classical regime of T6, where states are so sparsely filled that the particles never compete for them. [PHYS 2710 MP10.2](#/lesson/phys2710.MP10.2) used these formulas; here they are derived.`,
  symbols: [
    { tex: '\\bar n', text: 'the mean number of particles in one single-particle state (its **occupancy**)' },
    { tex: '\\varepsilon', text: 'the energy of that single-particle state, in J or eV' },
    { tex: '\\mu', text: 'the chemical potential of the gas, in J or eV: set by the density and temperature' },
    { tex: 'kT', text: 'the thermal energy' },
    { tex: '\\pm', text: '$+1$ for fermions (occupancy can never exceed 1), $-1$ for bosons (occupancy blows up as $\\varepsilon \\to \\mu$)' },
  ],
  why: 'These two distributions run metals and semiconductors (T7.3), the spectrum of every hot body and of the Big Bang (T7.4), the heat capacity of solids (T7.5), superfluids and atomic condensates (T7.6), and the pressure that holds up white dwarfs and neutron stars.',
  visual: {
    type: 'graph',
    title: 'Three ways to fill a state',
    lead: t`Occupancy $\bar n$ of single-particle states against their energy $\varepsilon$ (in units of a reference energy $\varepsilon_0$), for one chemical potential and temperature: Fermi–Dirac (blue), Bose–Einstein (orange, shown only for $\mu \le 0$, the only values a boson gas can have) and Boltzmann (grey).`,
    tasks: [
      'Fermions: lower kT toward zero with μ above 0. The blue curve becomes a step: every state below μ full, every one above empty — a Fermi sea.',
      'Push μ well below zero (a dilute gas): all three curves merge into one, far below 1. That is the classical limit.',
      'Bosons: bring μ up toward zero, the lowest state. The orange curve shoots up at low energy — the seed of Bose–Einstein condensation.',
    ],
    params: {
      x: [0, 2], y: [0, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'state energy ε / ε₀', ylabel: 'mean occupancy n̄',
      sliders: [
        { key: 'mu', label: 'Chemical potential $\\mu/\\varepsilon_0$', min: -1.5, max: 1.2, step: 0.05, value: 0.6, explain: 'Set by how many particles there are: more particles, higher μ.' },
        { key: 'kT', label: 'Temperature $kT/\\varepsilon_0$', min: 0.02, max: 1, step: 0.01, value: 0.15, explain: 'The thermal energy in units of ε₀.' },
      ],
      curves: [
        { fn: '1/(e^((x - mu)/kT) + 1)', domain: [0, 2], color: 'accent', width: 2.6 },
        { fn: '1/(e^((x - mu)/kT) - 1)', domain: ['0.03*kT + 0.001', 2], color: 'warn', width: 2.2, when: 'step(0.0001 - mu)' },
        { fn: 'e^(-(x - mu)/kT)', domain: [0, 2], color: 'ink3', dash: true },
      ],
      vlines: [{ x: 'mu', color: 'gold', label: 'μ' }],
      hlines: [{ y: 1, color: 'ink4' }],
      legend: [{ label: 'Fermi–Dirac', color: 'accent' }, { label: 'Bose–Einstein', color: 'warn' }, { label: 'Boltzmann', color: 'ink3', dash: true }], legendAt: 'tr',
      readouts: [{ label: '$(\\varepsilon - \\mu)/kT$ at $\\varepsilon = \\varepsilon_0$', expr: '(1 - mu)/kT', digits: 3 }],
    },
    caption: 'Ideal (non-interacting) particles; the lowest state is at ε = 0. A boson gas must have μ below its lowest state, so the orange curve appears only when μ ≤ 0.',
  },
  example: {
    prompt: t`A single-particle state lies exactly $kT$ above the chemical potential. Derive its mean occupancy if the particles are fermions, and if they are bosons, and compare both with the Boltzmann value.`,
    visual: occPic({ marks: [mark(1, EX.fd, 'accent'), mark(1, EX.be, 'warn'), mark(1, EX.mb, 'ink3')], extra: { vlines: [{ x: 1, color: 'gold' }] }, caption: 'The three occupancy curves against (ε − μ)/kT; the gold line marks the state in the example.' }),
    steps: [
      { label: 'Fermions', text: t`The state holds 0 or 1 particle: $\mathcal Z = 1 + e^{-(\varepsilon - \mu)/kT}$. Then $\bar n = \dfrac{0\cdot1 + 1\cdot e^{-x}}{1 + e^{-x}} = \dfrac{1}{e^{x} + 1}$ with $x = (\varepsilon - \mu)/kT$.` },
      { label: 'Bosons', text: t`Any number $n$, each adding $\varepsilon$ and one particle: $\mathcal Z = \sum_n e^{-nx} = \dfrac{1}{1 - e^{-x}}$ (needs $x > 0$). Then $\bar n = \dfrac{\sum_n n e^{-nx}}{\mathcal Z} = \dfrac{1}{e^x - 1}$.` },
      { label: 'Numbers', text: t`At $x = 1$: $\bar n_\text{FD} = 1/(e + 1) = ${fmt(EX.fd, 3)}$; $\bar n_\text{BE} = 1/(e - 1) = ${fmt(EX.be, 3)}$; Boltzmann $e^{-1} = ${fmt(EX.mb, 3)}$.` },
      { label: 'Interpret', text: t`Exclusion suppresses fermion occupancy below the classical value; bosons are *enhanced* — a boson is likelier to enter a state that is already occupied. (A useful shortcut: $\bar n = kT\,\partial\ln\mathcal Z/\partial\mu$.)` },
      { label: 'Sense check', text: t`Far above $\mu$ ($x = 5$) all three agree to within 1 %: $e^{-5} = ${fmt(Math.exp(-5), 3)}$, $1/(e^5 \pm 1) = ${fmt(nFD(5), 4)},\ ${fmt(nBE(5), 4)}$.` },
    ],
    answer: t`$\bar n_\text{FD} = ${fmt(EX.fd, 3)}$, $\bar n_\text{BE} = ${fmt(EX.be, 3)}$, against Boltzmann’s $${fmt(EX.mb, 3)}$.`,
  },
  practice: [
    num({
      id: 'fd-value', difficulty: 1,
      gen(r) {
        const d = r.pick([0.05, 0.1, -0.05, -0.1]), T = r.pick([300, 600, 1200]), x = d / (KEV * T), v = nFD(x);
        return {
          prompt: t`Electrons in a metal at $${T}$ K: what is the occupancy of a state $${Math.abs(d)}$ eV ${d > 0 ? 'above' : 'below'} the chemical potential?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - v, feedback: 'That is the probability the state is empty. Check the sign of ε − μ.' }, { value: nMB(x), feedback: t`Boltzmann’s $e^{-(\varepsilon - \mu)/kT}$ ignores exclusion; for electrons use $1/(e^x + 1)$.` }], v),
          hints: [t`$x = (\varepsilon - \mu)/kT = ${d}/${fmt(KEV * T, 3)} = ${fmt(x, 3)}$.`, t`$\bar n = 1/(e^{${fmt(x, 3)}} + 1)$.`],
          teach: t`Fermi–Dirac: $\bar n = 1/(e^{(\varepsilon - \mu)/kT} + 1)$, exactly ½ at $\varepsilon = \mu$.`,
          explain: t`$kT = ${fmt(KEV * T, 3)}$ eV, so $x = ${fmt(x, 3)}$ and $\bar n = ${texNum(v, 3)}$.`,
          visual: { type: 'graph', params: { x: [-0.3, 0.3], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'ε − μ (eV)', ylabel: 'n̄', curves: [{ fn: `1/(e^(x/${r4(KEV * T)}) + 1)`, domain: [-0.3, 0.3], color: 'accent' }], vlines: [{ x: d, color: 'gold' }, { x: 0, color: 'ink4' }] }, caption: 'The Fermi–Dirac occupancy at this temperature; gold marks the state asked about.' },
        };
      },
    }),
    num({
      id: 'receiver-photons', difficulty: 2, transfer: true,
      gen(r) {
        const [what, f] = r.pick([['an X-band satellite downlink (8.4 GHz)', 8.4e9], ['a Ka-band link (32 GHz)', 32e9], ['a 230 GHz radio-telescope channel', 230e9]]), T = r.pick([20, 290]), x = (H * f) / (KB * T), v = nBE(x);
        return {
          prompt: t`Photons are bosons with $\mu = 0$. In ${what}, the receiver’s input looks at surroundings at $${T}$ K. What is the mean number of thermal photons in one mode at that frequency?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: nMB(x), feedback: t`Photons are bosons: $1/(e^x - 1)$, which here is very different from $e^{-x}$.` }, { value: nFD(x), feedback: 'Photons are bosons, not fermions: use −1.' }, { value: 1 / x, feedback: 'Close (the classical limit kT/hf), but keep the exact form.' }], v, 0.008),
          hints: [t`$x = hf/kT = \dfrac{(6.626\times10^{-34})(${texNum(f, 3)})}{(1.381\times10^{-23})(${T})} = ${texNum(x, 3)}$.`, t`$\bar n = 1/(e^x - 1)$; when $x \ll 1$ that is close to $1/x$.`],
          teach: t`At radio frequencies $hf \ll kT$, so a mode holds $\bar n \approx kT/hf$ photons — the thermal noise every receiver fights.`,
          explain: t`$\bar n = 1/(e^{${texNum(x, 3)}} - 1) = ${fmt(v, 3)}$. Each mode then carries noise power $\bar n hf \approx kT$ per hertz of bandwidth — the Johnson–Nyquist noise that sets a receiver’s “system temperature”, and why deep-space receivers are cryogenically cooled.`,
          visual: { type: 'graph', params: { x: [0, 3], y: [0, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'hf / kT', ylabel: 'n̄', curves: [{ fn: '1/(e^x - 1)', domain: [0.2, 3], color: 'warn', label: 'Bose–Einstein', labelAt: 1.2, labelDx: 8 }, { fn: '1/x', domain: [0.25, 3], color: 'ink3', dash: true, label: 'kT/hf', labelAt: 0.4, labelDx: 8 }] }, caption: 'Photon occupancy against hf/kT, with the classical kT/hf (dashed). Radio and microwave modes sit far to the left of this window.' },
        };
      },
    }),
    num({
      id: 'counting', difficulty: 2,
      gen(r) {
        const n = r.pick([3, 4, 5, 6]), kind = r.pick(['bosons', 'fermions']), v = kind === 'bosons' ? (n * (n + 1)) / 2 : (n * (n - 1)) / 2;
        return {
          prompt: t`Two identical ${kind} are placed among $${n}$ single-particle states. How many distinct two-particle states are there? (For comparison, two *distinguishable* particles would have $${n}^2 = ${n * n}$.)`,
          answer: v, tol: { rel: 0, abs: 0.5 },
          errors: apart([{ value: n * n, feedback: 'Identical particles cannot be told apart: “A in 1, B in 2” and “A in 2, B in 1” are one state.' }, { value: kind === 'bosons' ? (n * (n - 1)) / 2 : (n * (n + 1)) / 2, feedback: kind === 'bosons' ? 'Bosons may share a state: add the n doubly-occupied states.' : 'Fermions may not share a state: leave out the doubly-occupied ones.' }], v),
          hints: ['Count unordered pairs of different states, then decide whether both may sit in one state.', t`Pairs of different states: $\binom{${n}}{2} = ${(n * (n - 1)) / 2}$; doubly-occupied states: $${n}$.`],
          teach: 'Indistinguishability removes the swapped duplicates; exclusion also removes the doubly-occupied states.',
          explain: t`$\binom{${n}}{2} = ${(n * (n - 1)) / 2}$ pairs of different states${kind === 'bosons' ? t`, plus $${n}$ with both in one state: $${v}$` : t`, and no doubling up: $${v}$`}. Sharing a state is allowed for bosons and forbidden for fermions — the root of their enhanced and suppressed occupancies.`,
          visual: { type: 'graph', params: { x: [0.3, n + 0.7], y: [-0.7, 0.9], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: Array.from({ length: n }, (_, i) => ({ fn: '0', domain: [r4(i + 0.65), r4(i + 1.35)], color: 'ink2', width: 3 })), points: [...Array.from({ length: n }, (_, i) => ({ x: i + 1, y: -0.35, r: 0.01, color: 'ink3', label: `state ${i + 1}`, labelDx: -20, labelDy: 0 })), { x: 1, y: 0.35, r: 7, color: 'accent' }, { x: 2, y: 0.35, r: 7, color: 'accent' }] }, caption: `${n} single-particle states with one possible placement of the two particles shown.` },
        };
      },
    }),
    mcq({
      id: 'classical-limit', difficulty: 2,
      prompt: 'When do Fermi–Dirac and Bose–Einstein statistics both reduce to the Boltzmann distribution?',
      choices: ['When every state’s occupancy is much less than 1, i.e. ε − μ ≫ kT for all states (V/N ≫ v(Q))', 'Whenever the temperature is low', 'Whenever the particles are heavy, whatever the density', 'When μ is above the energies of the occupied states'],
      answer: 0,
      why: { 1: 'Cooling at fixed density makes quantum effects stronger: v(Q) grows, and the particles start to compete for states.', 2: 'Mass helps ($v_Q \\propto m^{-3/2}$), but a dense enough or cold enough gas of heavy atoms still turns quantum — that is how rubidium is condensed.', 3: 'That is the degenerate regime: fermion states below μ are nearly full, the opposite of classical.' },
      hints: [t`Compare $1/(e^x \pm 1)$ with $e^{-x}$: when is the $\pm1$ negligible?`],
      teach: 'Quantum statistics matters only when occupancies approach 1; otherwise everything is Boltzmann.',
      explain: t`If $x = (\varepsilon - \mu)/kT \gg 1$ then $e^x \gg 1$ and $1/(e^x \pm 1) \approx e^{-x}$. For an ideal gas, $e^{\mu/kT} = Nv_Q/VZ_\text{int}$, so that condition is $V/N \gg v_Q$ — T6.5’s test for a classical gas.`,
      visual: occPic({ caption: 'The three occupancy curves merge on the right, where (ε − μ)/kT is large and every n̄ is small.' }),
    }),
    mcq({
      id: 'boson-mu', difficulty: 3,
      prompt: t`For an ideal gas of bosons whose lowest single-particle state has energy $\varepsilon_0$, why must $\mu$ stay below $\varepsilon_0$?`,
      choices: [t`For $\mu \ge \varepsilon_0$ the Bose–Einstein occupancy of the lowest state would be infinite or negative`, 'Because bosons repel each other at high density', t`It need not: $\mu$ can take any value, as for fermions`, 'Because μ is always negative for any gas'],
      answer: 0,
      why: { 1: 'Ideal bosons do not interact at all; the limit is pure counting.', 2: t`For fermions $1/(e^x + 1)$ is fine for any $x$; the boson form $1/(e^x - 1)$ diverges at $x = 0$ and is negative below.`, 3: 'Fermion gases at low temperature have μ well above zero (the Fermi energy, T7.3).' },
      hints: [t`Evaluate $1/(e^{(\varepsilon_0 - \mu)/kT} - 1)$ as $\mu \to \varepsilon_0$ from below.`, t`The geometric series for $\mathcal Z$ only converges when $e^{-(\varepsilon - \mu)/kT} < 1$.`],
      teach: 'Bosons need μ < ε₀; as μ creeps up to ε₀ the ground state fills without limit — Bose–Einstein condensation.',
      explain: t`$\mathcal Z = \sum_n e^{-n(\varepsilon_0 - \mu)/kT}$ converges only if $\varepsilon_0 > \mu$. As $\mu \to \varepsilon_0$ the ground-state occupancy $1/(e^{(\varepsilon_0 - \mu)/kT} - 1)$ grows without bound: that is how a macroscopic number of atoms ends up in one state (T7.6).`,
      visual: occPic({ which: ['be', 'mb'], x: [-0.5, 3], y: [0, 4], caption: 'The Bose–Einstein occupancy diverges as ε approaches μ from above and has no physical meaning below it.' }),
    }),
    mcq({
      id: 'photon-mu', difficulty: 2,
      prompt: 'Why is the chemical potential of photons in a cavity zero?',
      choices: ['The walls create and absorb photons freely, so their number is not fixed; F is minimized when ∂F/∂N = μ = 0', 'Photons are massless, and μ is proportional to mass', 'Photons do not interact, and μ measures interactions', 'Photons are fermions with an empty sea'],
      answer: 0,
      why: { 1: 'Massless particles can have a nonzero μ when their number is conserved — photons in a dye-filled optical microcavity were given one in 2010. What matters is that cavity photons are not conserved.', 2: 'An ideal gas of atoms has no interactions and still has a nonzero μ.', 3: 'Photons are bosons (spin 1).' },
      hints: ['What does μ = ∂F/∂N mean when N can change freely at no cost?'],
      teach: 'When particles can be created and destroyed freely, equilibrium sets μ = 0.',
      explain: t`At fixed $T$ and $V$, equilibrium minimizes $F$. If the walls can change the photon number, the minimum is where $\partial F/\partial N = \mu = 0$. So the Planck distribution is $1/(e^{hf/kT} - 1)$ — Bose–Einstein with $\mu = 0$ (T7.4).`,
      visual: occPic({ which: ['be'], x: [0, 4], y: [0, 3], caption: 'With μ = 0 the Bose–Einstein curve is the Planck occupancy of a photon mode, against hf/kT.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-find-mu', difficulty: 3,
      gen(r) {
        const p = r.pick([0.9, 0.75, 0.25, 0.05]), v = Math.log(1 / p - 1);
        return {
          prompt: t`A single-particle state in a gas of fermions is occupied with probability $${p}$. What is $(\varepsilon - \mu)/kT$ for that state?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'Sign: an occupancy above ½ means the state is below μ, so ε − μ < 0.' }, { value: Math.log(1 / p), feedback: t`That inverts the Boltzmann factor. For fermions solve $1/(e^x + 1) = p$.` }], v),
          hints: [t`Solve $\dfrac{1}{e^x + 1} = ${p}$ for $x$.`, t`$e^x = 1/${p} - 1$, so $x = \ln(1/${p} - 1)$.`],
          teach: 'Fermi–Dirac occupancies above ½ lie below μ; below ½, above it.',
          explain: t`$x = \ln(1/${p} - 1) = \ln(${fmt(1 / p - 1, 4)}) = ${fmt(v, 3)}$.`,
          visual: occPic({ which: ['fd'], x: [-4, 4], y: [0, 1.15], labels: false, extra: { hlines: [{ y: p, color: 'gold' }] }, caption: 'The Fermi–Dirac curve; gold marks the given occupancy. Where they cross is the answer.' }),
        };
      },
    }),
    num({
      id: 'cp-radiator', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([250, 300, 350]), lam = r.pick([5, 10, 20]), x = (H * CL) / (lam * 1e-6 * KB * T), v = nBE(x);
        return {
          prompt: t`A spacecraft radiator at $${T}$ K sheds heat as infrared light. What is the mean number of photons in one mode of wavelength $${lam}$ μm in its thermal radiation?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: (KB * T) / ((H * CL) / (lam * 1e-6)), feedback: 'kT/hf is the classical limit, valid only when hf ≪ kT. Here hf is comparable to or larger than kT.' }, { value: nFD(x), feedback: t`Photons are bosons: $1/(e^x - 1)$.` }], v),
          hints: [t`$hf = hc/\lambda$; $x = hc/(\lambda kT)$, with $hc/k = 1.4388\times10^{-2}$ m·K.`, t`$x = ${fmt(x, 4)}$, so $\bar n = 1/(e^{${fmt(x, 3)}} - 1)$.`],
          teach: 'Thermal infrared modes are sparsely filled: n̄ ≪ 1 once hf exceeds a few kT.',
          explain: t`$x = ${fmt(x, 4)}$, $\bar n = ${texNum(v, 3)}$. ${v < 0.1 ? 'Far below one photon per mode: here the radiation is nearly classical-Boltzmann, $e^{-x}$.' : 'Comparable to one: quantum statistics matters.'} The emitted power comes from the enormous number of modes, not from their occupancy.`,
          visual: { type: 'graph', params: { x: [0, 8], y: [0, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'hf / kT', ylabel: 'n̄', curves: [{ fn: '1/(e^x - 1)', domain: [0.5, 8], color: 'warn' }, { fn: 'e^(-x)', domain: [0, 8], color: 'ink3', dash: true }] }, caption: 'Photon occupancy (solid) and the Boltzmann factor (dashed) against hf/kT.' },
        };
      },
    }),
    mcq({
      id: 'cp-holes', difficulty: 3,
      prompt: t`In a fermion gas, compare the probability that a state $\delta$ **above** $\mu$ is occupied with the probability that a state $\delta$ **below** $\mu$ is **empty**.`,
      choices: ['They are equal, for every δ and T', 'The empty state below μ is more likely, because the sea is deeper than the tail', 'The occupied state above μ is more likely, because thermal energy pushes electrons up', 'They are equal only at T = 0'],
      answer: 0,
      why: { 1: t`$1 - 1/(e^{-x} + 1) = 1/(e^{x} + 1)$ exactly: no asymmetry.`, 2: 'Every electron promoted above μ leaves a hole below; the Fermi–Dirac function is symmetric about μ in exactly this sense.', 3: 'At T = 0 both probabilities are zero; the equality holds at every temperature.' },
      hints: [t`Write $1 - \dfrac{1}{e^{-x} + 1}$ over a common denominator.`, t`Multiply top and bottom by $e^x$.`],
      teach: t`$1 - \bar n_\text{FD}(\mu - \delta) = \bar n_\text{FD}(\mu + \delta)$: the Fermi–Dirac step is symmetric about μ.`,
      explain: t`$1 - \dfrac{1}{e^{-x} + 1} = \dfrac{e^{-x}}{e^{-x} + 1} = \dfrac{1}{e^{x} + 1}$. This symmetry is why holes in a semiconductor’s valence band follow the same statistics as electrons in its conduction band.`,
      visual: occPic({ which: ['fd'], x: [-4, 4], y: [0, 1.15], labels: false, extra: { vlines: [{ x: -1.5, color: 'gold' }, { x: 1.5, color: 'gold' }] }, caption: 'The Fermi–Dirac curve with two states equally far either side of μ (gold).' }),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §7.2', url: 'https://physics.weber.edu/thermal/' },
    { label: 'NASA Deep Space Network, Telecommunications Link Design Handbook (810-005)', url: 'https://deepspace.jpl.nasa.gov/dsndocs/810-005/' },
  ],
});
