// The helium ground state (Griffiths & Schroeter §8.2). Ĥ in atomic units:
// −½∇₁² − ½∇₂² − Z/r₁ − Z/r₂ + 1/r₁₂. Independent electrons: −Z² hartree
// (−108.85 eV for helium); first-order perturbation theory adds
// ⟨1/r₁₂⟩ = (5/8)Z (−74.83 eV); the variational product of 1s orbitals with
// an effective charge ζ gives ⟨Ĥ⟩ = ζ² − 2Zζ + (5/8)ζ, minimized at
// ζ = Z − 5/16 = 27/16: −(27/16)² hartree = −77.49 eV against −79.005 eV
// measured (the sum of NIST's two ionization energies). Virial check ⟨T⟩ =
// −E. Screening as the meaning of 5/16. H⁻ (Z = 1): ζ = 11/16 gives
// −12.86 eV, above H + e⁻ (−13.6 eV) — the bound proves nothing about
// binding; H⁻ is bound by 0.754 eV (Chandrasekhar's two-parameter trial
// shows it). Li⁺: −196.54 eV against −198.09 eV. Explore: E(ζ) for H⁻, He,
// Li⁺ with the measured energies. Transfer: helium-like O⁶⁺ in X-ray
// astronomy. Hartree 27.211 386 246 eV (CODATA 2022).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { EH, RYD, HE, LIP_TOTAL, heE, heZeff, r6, seg, label } from './_q2.js';

const t = String.raw;
const HMINUS = 13.598434 + 0.754195;     // eV: H ionization energy (NIST) + H electron affinity (Lykke et al. 1991)
const MEAS = { 1: HMINUS, 2: HE.total, 3: LIP_TOTAL };
const NAME = { 1: 'H⁻', 2: 'He', 3: 'Li⁺' };
const Ev = (Z, z) => heE(Z, z) * EH;     // eV
const Emin = (Z) => Ev(Z, heZeff(Z));
const zExpr = (Z) => `${r6(EH)}*(x^2 - ${2 * Z}*x + 0.625*x)`;

export default lesson({
  id: 'phys4710.M4.2',
  title: 'The helium ground state',
  minutes: 18, difficulty: 3,
  intro: t`Helium is the simplest atom with no exact solution. In atomic units (energies in hartree, $E_h = ${fmt(EH, 9)}$ eV; lengths in $a_0$) its Hamiltonian is two hydrogen-like pieces plus the repulsion $1/r_{12}$. Guess that each electron sits in a $1s$ orbital, but let the charge it feels be a free parameter $\zeta$, the **effective nuclear charge**: $\psi = \frac{\zeta^3}{\pi}e^{-\zeta(r_1 + r_2)}$. The energy of this trial is

$$\begin{gathered} \langle\hat H\rangle = \big[\zeta^2 - 2Z\zeta + \tfrac58\zeta\big]E_h \\ \zeta_{\text{best}} = Z - \tfrac{5}{16} \end{gathered}$$

For helium ($Z = 2$) that is $\zeta = \tfrac{27}{16}$ and $E = -(27/16)^2E_h = ${fmt(Emin(2), 5)}$ eV, against the measured $${fmt(-HE.total, 5)}$ eV. Each electron sees the nucleus partly **screened** by the other: by $5/16$ of a charge.`,
  symbols: [
    { tex: '\\zeta', text: t`the effective nuclear charge, a variational parameter: the orbital $e^{-\zeta r}$ is that of a hydrogen-like ion of charge $\zeta e$` },
    { tex: 'Z', text: t`the true nuclear charge in units of $e$: 2 for helium, 1 for H$^-$, 3 for Li$^+$` },
    { tex: 'E_h', text: t`the hartree, $e^2/4\pi\epsilon_0a_0 = 2\times13.6\ \text{eV} = ${fmt(EH, 6)}$ eV` },
    { tex: '\\zeta^2', text: 'the kinetic energy of two electrons in orbitals of charge ζ (in hartree)' },
    { tex: '-2Z\\zeta', text: 'their attraction to the real nucleus of charge Z' },
    { tex: '\\tfrac58\\zeta', text: t`their mutual repulsion, $\langle1/r_{12}\rangle$ for two such orbitals` },
  ],
  why: 'Helium is the test bed for every many-electron method: its effective-charge result is the seed of the Hartree–Fock and screening ideas behind the whole periodic table.',
  visual: {
    type: 'graph',
    title: 'Minimizing over the effective charge',
    lead: t`The trial energy $\langle\hat H\rangle(\zeta)$ for a two-electron atom or ion, with the measured ground-state energy in gold. Drag $\zeta$ to the minimum, and switch between H$^-$, He and Li$^+$.`,
    tasks: [
      'For helium the minimum sits at ζ = 27/16 ≈ 1.69, not 2: each electron is partly screened by the other. Setting ζ = 2 (no screening) is first-order perturbation theory — higher, as it must be.',
      'The best ζ is always Z − 5/16: the screening is the same for every ion. Compare the gap to the gold line: 1.5 eV for both He and Li⁺.',
      'For H⁻ the minimum is above the dashed line, the energy of a hydrogen atom plus a free electron. This trial cannot show that H⁻ is bound — yet it is.',
    ],
    params: {
      x: [0.3, 3.4], y: [-205, 0], aspect: 'wide', xlabel: 'effective charge ζ', ylabel: '⟨H⟩ (eV)', xticks: 6, yticks: 4, axesAt: 'edge',
      choices: [{ key: 'Zc', label: 'System', options: [[1, 'H⁻ (Z = 1)'], [2, 'helium (Z = 2)'], [3, 'Li⁺ (Z = 3)']], value: 2, explain: 'Two electrons around a nucleus of charge Z.' }],
      sliders: [{ key: 'zz', label: t`Effective charge $\zeta$`, min: 0.3, max: 3.4, step: 0.01, value: 2, explain: 'The charge the trial orbitals are built for.' }],
      curves: [1, 2, 3].map((Z) => ({ fn: zExpr(Z), color: 'accent', width: 2.4, when: `step(0.5 - abs(Zc - ${Z}))` })),
      hlines: [...[1, 2, 3].map((Z) => ({ y: r6(-MEAS[Z]), color: 'gold', when: `step(0.5 - abs(Zc - ${Z}))` })), { y: r6(-RYD), color: 'ink3', when: 'step(0.5 - abs(Zc - 1))' }],
      points: [{ x: 'zz', y: `${r6(EH)}*(zz^2 - 2*Zc*zz + 0.625*zz)`, r: 6, color: 'warn' }],
      readouts: [{ label: t`$\langle\hat H\rangle$ (eV)`, expr: `${r6(EH)}*(zz^2 - 2*Zc*zz + 0.625*zz)`, digits: 5 }, { label: 'measured (eV)', expr: [1, 2, 3].map((Z) => `step(0.5 - abs(Zc - ${Z}))*${r6(-MEAS[Z])}`).join(' + '), digits: 5 }],
    },
    caption: t`One-parameter trial $\psi \propto e^{-\zeta(r_1 + r_2)}$, infinite nuclear mass, no relativity. Measured: sums of ionization energies (NIST; for H⁻, hydrogen’s 13.598 eV plus its electron affinity 0.754 eV). Dashed grey (H⁻ only): hydrogen plus a free electron.`,
  },
  example: {
    prompt: t`Derive $\langle\hat H\rangle(\zeta)$ for helium, minimize it, and compare the result with the independent-electron model, first-order perturbation theory and experiment.`,
    visual: { type: 'graph', params: { x: [0, 4], y: [-112, -70], aspect: 'wide', xlabel: '', ylabel: 'energy (eV)', xticks: 0, yticks: 5, axesAt: 'edge', curves: [seg(0.3, -4 * RYD * 2, 1.1, -4 * RYD * 2, 'ink3', 2.6), seg(1.2, Ev(2, 2), 2.0, Ev(2, 2), 'violet', 2.6), seg(2.1, Emin(2), 2.9, Emin(2), 'accent', 2.6), seg(3.0, -HE.total, 3.8, -HE.total, 'gold', 3)], points: [label(0.7, -4 * RYD * 2, 'no repulsion', 'ink3', 0, -12, 'center'), label(1.6, Ev(2, 2), 'first order', 'violet', 0, -12, 'center'), label(2.5, Emin(2), 'variational', 'accent', 0, 16, 'center'), label(3.4, -HE.total, 'measured', 'gold', 0, 16, 'center')] }, caption: 'Helium’s ground-state energy: four estimates, to scale.' },
    steps: [
      { label: 'Kinetic', text: t`Each orbital $e^{-\zeta r}$ is hydrogen-like for charge $\zeta$, so its kinetic energy is $\tfrac12\zeta^2$ hartree; two electrons give $\zeta^2$.` },
      { label: 'Nucleus', text: t`$\langle1/r\rangle = \zeta$ for such an orbital, so the attraction of the real charge $Z$ is $-Z\zeta$ per electron: $-2Z\zeta$ in all.` },
      { label: 'Repulsion', text: t`$\langle1/r_{12}\rangle$ for two $1s$ clouds of charge $\zeta$ is $\tfrac58\zeta$ — the integral first-order perturbation theory needs (with $\zeta = Z$). Total: $\langle\hat H\rangle = \zeta^2 - 2Z\zeta + \tfrac58\zeta$.` },
      { label: 'Minimize', text: t`$2\zeta - 2Z + \tfrac58 = 0$ gives $\zeta = Z - \tfrac{5}{16} = \tfrac{27}{16}$, and $E = -\zeta^2 = -${fmt((27 / 16) ** 2, 6)}$ hartree $= ${fmt(Emin(2), 5)}$ eV.` },
      { label: 'Compare', text: t`No repulsion: $-Z^2 = -4$ hartree $= ${fmt(-4 * EH, 5)}$ eV. First order ($\zeta = 2$): $${fmt(Ev(2, 2), 5)}$ eV. Variational: $${fmt(Emin(2), 5)}$ eV. Measured: $${fmt(-HE.total, 5)}$ eV — the variational answer is $${fmt(((HE.total + Emin(2)) / HE.total) * 100, 2)}$% high, and above the truth, as it must be.` },
      { label: 'Check', text: t`At the minimum, $\langle T\rangle = \zeta^2 = -E$: the virial theorem for Coulomb forces, satisfied automatically by the optimum. Hylleraas’s trial functions with $r_{12}$ in them reach the exact non-relativistic $-2.903\,724$ hartree.` },
    ],
    answer: t`$\zeta = 27/16$, $E = -(27/16)^2E_h = ${fmt(Emin(2), 4)}$ eV, against $${fmt(-HE.total, 4)}$ eV measured.`,
  },
  practice: [
    num({
      id: 'first-order', difficulty: 2,
      gen(r) {
        const [name, Z] = r.pick([['helium', 2], ['Li$^+$', 3], ['Be$^{2+}$', 4]]);
        const ans = Ev(Z, Z);
        return {
          prompt: t`First-order perturbation theory for the ground state of ${name} ($Z = ${Z}$) treats the repulsion as a perturbation of two unscreened $1s$ electrons: $E \approx -Z^2E_h + \tfrac58ZE_h$. With $E_h = ${fmt(EH, 8)}$ eV, what is $E$, in eV?`,
          visual: { type: 'graph', params: { x: [0.3, 3.4 + Z - 2], y: [r6(-Z * Z * EH * 1.05), 0], aspect: 'wide', xlabel: 'effective charge ζ', ylabel: '⟨H⟩ (eV)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: zExpr(Z), color: 'accent', width: 2.4 }], vlines: [{ x: Z, color: 'violet', label: 'ζ = Z' }] }, caption: 'The variational energy curve; first-order theory is its value at ζ = Z.' },
          answer: ans, units: 'eV', tol: { rel: 0.002 },
          errors: [{ value: -Z * Z * EH, feedback: t`Add the first-order repulsion $+\tfrac58ZE_h$.` }, { value: -Z * Z * EH + 0.625 * EH, feedback: t`$\langle1/r_{12}\rangle = \tfrac58Z$ for orbitals of charge $Z$, not $\tfrac58$.` }],
          hints: [t`$E = (-Z^2 + \tfrac58Z)E_h$.`],
          teach: 'First-order perturbation theory is the variational energy evaluated at the unscreened charge ζ = Z — a valid but poorer upper bound.',
          explain: t`$E = (-${Z * Z} + ${fmt(0.625 * Z, 4)})\times${fmt(EH, 6)} = ${fmt(ans, 5)}$ eV. Letting $\zeta$ relax to $Z - \tfrac5{16}$ lowers it to $${fmt(Emin(Z), 5)}$ eV.`,
        };
      },
    }),
    num({
      id: 'ion-energy', difficulty: 2,
      gen(r) {
        const [name, Z] = r.pick([['Li$^+$', 3], ['Be$^{2+}$', 4], ['B$^{3+}$', 5], ['C$^{4+}$', 6]]);
        const ans = Emin(Z);
        return {
          prompt: t`Use the effective-charge trial for the two-electron ion ${name} ($Z = ${Z}$): $\langle\hat H\rangle = (\zeta^2 - 2Z\zeta + \tfrac58\zeta)E_h$. Minimize over $\zeta$ and give the ground-state energy bound, in eV.`,
          visual: { type: 'graph', params: { x: [0.3, Z + 1.4], y: [r6(-Z * Z * EH * 1.05), 0], aspect: 'wide', xlabel: 'effective charge ζ', ylabel: '⟨H⟩ (eV)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: zExpr(Z), color: 'accent', width: 2.4 }] }, caption: 'The trial energy against ζ for this ion.' },
          answer: ans, units: 'eV', tol: { rel: 0.0025 },
          errors: [{ value: Ev(Z, Z), feedback: 'That is the value at ζ = Z (first order). Minimize: ζ = Z − 5/16.' }, { value: -((Z - 5 / 16) ** 2) * EH / 2, feedback: t`The minimum is $-\zeta^2$ hartree, and one hartree is $27.2$ eV, not $13.6$.` }],
          hints: [t`$d\langle H\rangle/d\zeta = 0$ gives $\zeta = Z - \tfrac{5}{16}$.`, t`At the minimum $\langle\hat H\rangle = -\zeta^2E_h$.`],
          teach: 'For any two-electron ion, the best effective charge is Z − 5/16 and the energy −(Z − 5/16)² hartree.',
          explain: t`$\zeta = ${fmt(Z - 5 / 16, 5)}$ and $E = -${fmt((Z - 5 / 16) ** 2, 6)}\times${fmt(EH, 6)} = ${fmt(ans, 5)}$ eV.${Z === 3 ? t` Measured: $${fmt(-LIP_TOTAL, 5)}$ eV.` : ''} The fractional error shrinks as $Z$ grows, because the repulsion matters less against a stronger nucleus.`,
        };
      },
    }),
    num({
      id: 'ionization', difficulty: 3,
      prompt: t`Helium’s first ionization energy is $E(\text{He}^+) - E(\text{He})$. He$^+$ is hydrogen-like: $E = -Z^2\times${fmt(RYD, 8)}$ eV $= ${fmt(-4 * RYD, 6)}$ eV (infinite nuclear mass). Using the variational $E(\text{He}) = -(27/16)^2E_h$, what ionization energy do you predict, in eV?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-82, -50], aspect: 'wide', xlabel: '', ylabel: 'energy (eV)', xticks: 0, yticks: 4, axesAt: 'edge', curves: [seg(0.4, -4 * RYD, 2.6, -4 * RYD, 'violet', 2.6), seg(0.4, Emin(2), 1.4, Emin(2), 'accent', 2.6), seg(1.6, -HE.total, 2.6, -HE.total, 'gold', 2.6)], points: [label(1.5, -4 * RYD, 'He⁺ + e⁻', 'violet', 0, -12, 'center'), label(0.9, Emin(2), 'He (variational)', 'accent', 0, 16, 'center'), label(2.1, -HE.total, 'He (measured)', 'gold', 0, 16, 'center')] }, caption: 'Energies of He⁺ plus a free electron, and of the neutral atom.' },
      answer: -4 * RYD - Emin(2), units: 'eV', tol: { rel: 0.003 },
      errors: [{ value: -Emin(2), feedback: 'That is the energy to remove both electrons. The first ionization leaves He⁺ behind.' }],
      hints: [t`The variational energy of helium is $-(27/16)^2\times${fmt(EH, 6)} = ${fmt(Emin(2), 5)}$ eV.`, t`$I = E(\text{He}^+) - E(\text{He}) = ${fmt(-4 * RYD, 5)} - (${fmt(Emin(2), 5)})$.`],
      teach: 'Ionization energies are differences of total energies; a variational error in one of them goes straight into the difference.',
      explain: t`$I = ${fmt(-4 * RYD, 5)} + ${fmt(-Emin(2), 5)} = ${fmt(-4 * RYD - Emin(2), 4)}$ eV, against the measured $${fmt(HE.ie1, 5)}$ eV. The whole $${fmt(HE.total + Emin(2), 3)}$ eV error of the trial lands on the ionization energy, a 6% error from a 2% one: differences of approximate energies need more accurate energies.`,
    }),
    mcq({
      id: 'screening', difficulty: 2,
      prompt: t`The best effective charge for helium is $\zeta = 27/16 \approx 1.69$, less than the nuclear charge 2. What does this mean physically?`,
      visual: { type: 'mp-orbitals', params: { n: 1, l: 0, m: 0, panels: ['radial'], controls: false, readout: false }, caption: 'A 1s radial probability density. The other electron’s cloud sits partly inside it, partly outside.' },
      choices: [
        t`Each electron spends part of its time outside the other’s charge cloud, where the nucleus looks screened: the orbitals spread out to lower the repulsion, at a small cost in attraction`,
        'The helium nucleus has a charge of 1.69 e',
        'The electrons repel each other so strongly that one of them is almost free',
        'The variational method always reduces the charge by 5/16 for any atom',
      ],
      answer: 0,
      why: {
        1: 'The nucleus is two protons; ζ is a property of the trial orbital, not of the nucleus.',
        2: 'A nearly free electron would need ζ near 1 for one electron and 2 for the other; the symmetric trial finds both partly screened.',
        3: t`$5/16$ is specific to two $1s$ electrons with this trial; other shells screen differently (Slater’s rules).`,
      },
      hints: ['Gauss’s law: the charge felt at radius r is the nucleus minus the other electron’s charge inside r.'],
      teach: 'An effective charge below Z expresses screening: each electron partly hides the nucleus from the other.',
      explain: t`A larger, more diffuse orbital keeps the electrons apart (smaller $\tfrac58\zeta$ repulsion) but binds each less ($-2Z\zeta$); the balance falls at $Z - 5/16$. The same idea, applied shell by shell, explains why outer electrons in big atoms are weakly bound.`,
    }),
    mcq({
      id: 'h-minus', difficulty: 3,
      prompt: t`For H$^-$ ($Z = 1$) the trial gives $\zeta = 11/16$ and $E = -(11/16)^2E_h = ${fmt(Emin(1), 4)}$ eV, **above** the $-13.6$ eV of a hydrogen atom plus a free electron. What can you conclude?`,
      visual: { type: 'graph', params: { x: [0.3, 1.6], y: [-16, -6], aspect: 'wide', xlabel: 'effective charge ζ', ylabel: '⟨H⟩ (eV)', xticks: 6, yticks: 5, axesAt: 'edge', curves: [{ fn: zExpr(1), color: 'accent', width: 2.4 }], hlines: [{ y: r6(-RYD), color: 'ink3', label: 'H + free electron' }] }, caption: 'The H⁻ trial energy against ζ, and the energy of a neutral hydrogen atom plus a free electron at rest.' },
      choices: [
        'Nothing about binding: an upper bound above the threshold is consistent with a bound state lying lower. (Better trial functions show H⁻ is bound, by 0.754 eV.)',
        'H⁻ is not bound: the variational energy is above the threshold',
        'H⁻ is bound by 1.3 eV, the difference between the two energies',
        'The calculation must be wrong, since energies must be below −13.6 eV',
      ],
      answer: 0,
      why: {
        1: 'An upper bound can prove binding only by falling below the threshold. Lying above it proves nothing.',
        2: 'The difference has the wrong sign to mean binding, and a bound says nothing about the true energy’s distance from it.',
        3: 'Nothing forces a trial energy to be low; it is a correct upper bound, just not a useful one here.',
      },
      hints: [t`The theorem says $E_{\text{true}} \le E_{\text{trial}}$. If the trial energy is above $-13.6$ eV, where could the true energy be?`, 'To prove a bound state exists, a trial energy must fall below the energy of the separated pieces.'],
      teach: 'The variational principle can prove a system is bound (a trial below threshold) but never that it is unbound.',
      explain: t`The true energy is somewhere below $${fmt(Emin(1), 4)}$ eV — possibly below $-13.6$ eV. Chandrasekhar’s 1944 trial $e^{-ar_1 - br_2} + e^{-br_1 - ar_2}$, letting one electron sit close and one far, does fall below the threshold and proves binding. H$^-$, bound by $0.754$ eV, causes most of the Sun’s visible opacity.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-oxygen', difficulty: 3, transfer: true,
      prompt: t`X-ray telescopes such as Chandra and XRISM see lines from helium-like oxygen, O$^{6+}$ ($Z = 8$, two electrons), in hot gas between galaxies. Using the effective-charge trial, what is the ground-state energy of O$^{6+}$ relative to the bare nucleus and two free electrons, in keV? Give five significant figures.`,
      visual: { type: 'graph', params: { x: [5, 9.5], y: [-1800, -1200], aspect: 'wide', xlabel: 'effective charge ζ', ylabel: '⟨H⟩ (eV)', xticks: 5, yticks: 3, axesAt: 'edge', curves: [{ fn: zExpr(8), color: 'accent', width: 2.4 }] }, caption: 'The trial energy against ζ for Z = 8.' },
      answer: Emin(8) / 1000, units: 'keV', tol: { rel: 0.0005 }, sigfigs: 5,
      errors: [{ value: Ev(8, 8) / 1000, feedback: 'That is first order (ζ = Z). Minimize: ζ = Z − 5/16.' }, { value: -64 * EH / 1000, feedback: 'Include the repulsion: the bound is −(Z − 5/16)² hartree.' }],
      hints: [t`$\zeta = 8 - \tfrac5{16} = 7.6875$.`, t`$E = -\zeta^2E_h$, converted to keV.`],
      teach: 'The effective-charge result scales to every helium-like ion; for heavy ions the repulsion is a small correction.',
      explain: t`$E = -(7.6875)^2\times${fmt(EH, 6)}\ \text{eV} = ${fmt(Emin(8) / 1000, 5)}$ keV. The repulsion now changes the energy by only $${fmt(((Emin(8) - -64 * EH) / (64 * EH)) * 100, 2)}$%; for such ions relativity (of order $(Z\alpha)^2 \approx 0.3\%$) matters as much as the remaining correlation error.`,
    }),
    num({
      id: 'cp-virial', difficulty: 2,
      prompt: t`At the variational optimum for helium, what is the expectation value of the total kinetic energy $\langle T\rangle$, in eV? (Kinetic energy of the trial: $\zeta^2E_h$.)`,
      visual: { type: 'graph', params: { x: [0.3, 3.4], y: [-120, 140], aspect: 'wide', xlabel: 'effective charge ζ', ylabel: 'energy (eV)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: zExpr(2), color: 'accent', width: 2.4, label: '⟨H⟩', labelAt: 3.1, labelDy: 14 }, { fn: `${r6(EH)}*x^2`, color: 'good', width: 2, dash: [6, 4], label: '⟨T⟩', labelAt: 2.4, labelDx: 8 }] }, caption: 'The trial’s total energy and its kinetic part, against ζ.' },
      answer: (27 / 16) ** 2 * EH, units: 'eV', tol: { rel: 0.002 },
      errors: [{ value: Emin(2), feedback: 'Kinetic energy is positive. At the optimum it equals minus the total energy (virial theorem).' }, { value: 4 * EH, feedback: t`Use the optimal $\zeta = 27/16$, not 2.` }],
      hints: [t`$\langle T\rangle = \zeta^2E_h$ at $\zeta = 27/16$.`],
      teach: 'For Coulomb forces the virial theorem gives ⟨T⟩ = −E, and the optimized trial obeys it exactly.',
      explain: t`$\langle T\rangle = (27/16)^2E_h = ${fmt((27 / 16) ** 2 * EH, 5)}$ eV $= -E$. A one-parameter scale factor always enforces the virial theorem at its minimum — a useful check on any variational code.`,
    }),
    mcq({
      id: 'cp-correlation', difficulty: 3,
      prompt: t`Even the best product $\phi(r_1)\phi(r_2)$ of two identical orbitals (the Hartree–Fock limit) gives helium $-2.8617$ hartree, above the exact $-2.9037$. What does every product function miss?`,
      visual: { type: 'graph', params: { x: [0, 4], y: [-2.93, -2.82], aspect: 'wide', xlabel: '', ylabel: 'E (hartree)', xticks: 0, yticks: 4, axesAt: 'edge', curves: [seg(0.3, -((27 / 16) ** 2), 1.3, -((27 / 16) ** 2), 'accent', 2.6), seg(1.5, -2.8617, 2.5, -2.8617, 'violet', 2.6), seg(2.7, -2.9037, 3.7, -2.9037, 'gold', 2.6)], points: [label(0.8, -((27 / 16) ** 2), 'ζ = 27/16', 'accent', 0, -12, 'center'), label(2, -2.8617, 'best product', 'violet', 0, -12, 'center'), label(3.2, -2.9037, 'exact', 'gold', 0, 14, 'center')] }, caption: 'Three energies of helium, non-relativistic, in hartree.' },
      choices: [
        t`**Correlation**: in a product, where one electron is has no effect on where the other is likely to be, so the electrons cannot dodge each other; terms with $r_{12}$ (Hylleraas) put that in`,
        'Spin: products of orbitals cannot describe two spins',
        'Relativity: the remaining 0.04 hartree is relativistic',
        'The nuclear motion: the nucleus is not infinitely heavy',
      ],
      answer: 0,
      why: {
        1: 'The ground state’s spin part is the singlet, which multiplies the symmetric spatial product without trouble.',
        2: 'Both numbers are non-relativistic; relativistic corrections are about 10⁻⁴ hartree for helium.',
        3: 'Finite nuclear mass shifts the energy by about 4 × 10⁻⁴ hartree, ten times less than the gap.',
      },
      hints: [t`In $\phi(r_1)\phi(r_2)$, the probability of electron 1 being somewhere does not depend on electron 2’s position.`, t`The repulsion $1/r_{12}$ depends on both positions together.`],
      teach: 'The correlation energy is what independent-particle (product) wave functions cannot capture: the electrons’ instantaneous avoidance of each other.',
      explain: t`The gap, $0.042$ hartree $= 1.14$ eV, is helium’s correlation energy. Hylleraas (1929) added $r_{12}$ to the trial and closed it; modern calculations agree with experiment to more digits than any other many-body system.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §8.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NIST Atomic Spectra Database: ionization energies of He, Li⁺ and H', url: 'https://physics.nist.gov/PhysRefData/ASD/ionEnergy.html' },
    { label: 'E. A. Hylleraas, “Neue Berechnung der Energie des Heliums im Grundzustande”, Z. Phys. 54, 347 (1929)', url: 'https://doi.org/10.1007/BF01375457' },
  ],
});
