// The hydrogen molecule ion (Griffiths & Schroeter §8.3). Two protons a
// distance R apart (clamped: Born–Oppenheimer), one electron, trial
// ψ± ∝ ψ₀(r₁) ± ψ₀(r₂) (LCAO). With S = e^(−R)(1 + R + R²/3),
// D = 1/R − (1 + 1/R)e^(−2R), X = (1 + R)e^(−R) (atomic units), the energy
// relative to H(1s) + p is U± = [1/R − (D ± X)/(1 ± S)] hartree. Bonding:
// minimum at R = 2.493 a₀ = 1.319 Å, binding 1.764 eV, against the exact
// R = 2.00 a₀ (1.06 Å) and Dₑ = 0.102 634 hartree = 2.79 eV (Bates, Ledsham &
// Stewart 1953); letting the orbital exponent vary (Finkelstein & Horowitz
// 1928) gives ζ = 1.238, R = 2.00 a₀, 2.35 eV (checked here by quadrature).
// Antibonding: repulsive everywhere. D₀ ≈ Dₑ − ½hcωₑ with ωₑ = 2321.7 cm⁻¹
// (Huber & Herzberg) gives 2.65 eV. Explore: U±(R) with S, the exact well's
// minimum. Transfers: the vertical σg → σu photodissociation gap (LCAO
// 10.69 eV at R = 2, exact 11.84 eV) and the vibrational frequency from the
// curvature of the LCAO well (1816 cm⁻¹ against 2321.7). CODATA 2022.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HC_EVNM } from '../phys2710/_constants.js';
import { EH, A0_ANG, MP_ME, HC_EVCM, r6, seg, label, h2S, h2D, h2X, h2U, h2Expr, H2P_EXACT, goldenMin } from './_q2.js';

const t = String.raw;
const [RMIN, UMIN] = goldenMin((R) => h2U(R), 1, 5);
const UMIN_EV = UMIN * EH;
const ZETA = { z: 1.238, R: 2.003, De: 2.354 };            // variable-exponent LCAO (computed by quadrature for this lesson)
const WE = 2321.7;                                          // cm⁻¹, H₂⁺ harmonic vibrational constant (Huber & Herzberg)
const D0 = H2P_EXACT.De - 0.5 * WE * HC_EVCM;
const kLCAO = (() => { const h = 1e-3; return (h2U(RMIN + h) - 2 * h2U(RMIN) + h2U(RMIN - h)) / (h * h); })();   // hartree/a₀²
const wLCAO = Math.sqrt(kLCAO / (MP_ME / 2)) * EH / HC_EVCM;                                                     // cm⁻¹
const EXACT_U2 = (1.1026342 - 0.6675344) * EH;             // eV, exact σg → σu gap at R = 2 a₀

/** The bonding and antibonding curves U±(R) in eV, with optional exact minimum. */
function curvePic({ caption, exact = true, anti = true, extra = {}, y = [-3.5, 6] } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0.6, 7], y, aspect: 'wide', xlabel: 'proton separation R (a₀)', ylabel: 'U (eV)', xticks: 6, yticks: 4, axesAt: 'edge',
      curves: [{ fn: h2Expr(1), color: 'accent', width: 2.6, domain: [0.6, 7], label: 'bonding', labelAt: 5.2, labelDy: 14 }, ...(anti ? [{ fn: h2Expr(-1), color: 'warn', width: 2.4, domain: [0.6, 7], label: 'antibonding', labelAt: 3.3, labelDx: 8 }] : [])],
      hlines: [{ y: 0, color: 'ink3' }],
      points: exact ? [{ x: H2P_EXACT.R, y: r6(-H2P_EXACT.De), r: 6, color: 'gold', label: 'exact minimum', labelDx: 8, labelDy: 12 }] : [],
      ...extra,
    },
    caption,
  };
}

/** The two 1s orbitals and their sum or difference along the molecular axis (R in a₀). */
const axisPic = (R, s, caption) => ({
  type: 'graph',
  params: {
    x: [-5, 5], y: [s > 0 ? -0.2 : -1.3, 1.35], aspect: 'wide', xlabel: 'position along the axis (a₀)', ylabel: 'ψ (scaled)', xticks: 10, yticks: 0, axesAt: 'edge',
    curves: [
      { fn: `exp(-abs(x + ${R / 2}))`, color: 'ink3', width: 1.4, dash: [5, 4] },
      { fn: `${s > 0 ? '' : '-'}exp(-abs(x - ${R / 2}))`, color: 'ink3', width: 1.4, dash: [5, 4] },
      { fn: `(exp(-abs(x + ${R / 2})) ${s > 0 ? '+' : '-'} exp(-abs(x - ${R / 2})))/${r6(Math.sqrt(2 * (1 + s * h2S(R))))}`, color: s > 0 ? 'accent' : 'warn', width: 2.6 },
    ],
    points: [{ x: -R / 2, y: 0, r: 6, color: 'bad', label: 'p', labelDx: -4, labelDy: 14 }, { x: R / 2, y: 0, r: 6, color: 'bad', label: 'p', labelDx: -4, labelDy: 14 }],
  },
  caption,
});

export default lesson({
  id: 'phys4710.M4.3',
  title: 'The hydrogen molecule ion',
  minutes: 18, difficulty: 3,
  intro: t`The simplest molecule is two protons and one electron, H$_2^+$. Hold the protons still a distance $R$ apart (they are 1836 times heavier) and guess that the electron is in a hydrogen $1s$ orbital around one proton **or** the other — a linear combination of atomic orbitals (LCAO), $\psi_\pm \propto \psi_0(r_1) \pm \psi_0(r_2)$. The variational energy, measured from a hydrogen atom plus a distant proton, is

$$\begin{gathered} U_\pm(R) = \Big[\frac{1}{R} - \frac{D \pm X}{1 \pm S}\Big]E_h \\ S = e^{-R}\Big(1 + R + \frac{R^2}{3}\Big) \\ D = \frac1R - \Big(1 + \frac1R\Big)e^{-2R} \\ X = (1 + R)e^{-R} \end{gathered}$$

with $R$ in Bohr radii. The **bonding** combination $\psi_+$ has a minimum: the ion holds together, the first quantum-mechanical explanation of a chemical bond. The antibonding $\psi_-$ only repels.`,
  symbols: [
    { tex: 'U_\\pm(R)', text: t`the energy of the molecule at separation $R$, relative to H(1s) + p: negative means bound` },
    { tex: 'R', text: t`the proton–proton distance, in units of $a_0 = ${fmt(A0_ANG, 6)}$ Å` },
    { tex: 'S', text: t`the overlap integral $\langle\psi_0(r_1)|\psi_0(r_2)\rangle$: 1 when the protons coincide, 0 when far apart` },
    { tex: 'D', text: 'the direct integral: the attraction of the electron on proton 1 to proton 2 (in hartree, units of e²/4πε₀a₀)' },
    { tex: 'X', text: 'the exchange integral: the electron’s attraction to a proton evaluated between the two orbitals — the source of the bond' },
    { tex: 'E_h', text: t`the hartree, $${fmt(EH, 8)}$ eV` },
    { tex: '1/R', text: 'the proton–proton repulsion' },
  ],
  why: 'H₂⁺ is the starting point of molecular-orbital theory, the Born–Oppenheimer picture of molecules, and now precision physics: its spectroscopy measures the proton-to-electron mass ratio.',
  visual: {
    ...curvePic({ extra: { sliders: [{ key: 'R', label: t`Separation $R$`, min: 0.6, max: 7, step: 0.01, value: 2.5, unit: 'a_0', explain: 'The distance between the two protons, held fixed.' }], vlines: [{ x: 'R', color: 'ink3' }], readouts: [{ label: t`bonding $U_+$ (eV)`, expr: h2Expr(1).replace(/\bx\b/g, 'R'), digits: 4 }, { label: t`antibonding $U_-$ (eV)`, expr: h2Expr(-1).replace(/\bx\b/g, 'R'), digits: 4 }, { label: t`overlap $S$`, expr: 'exp(-R)*(1 + R + R^2/3)', digits: 3 }] } }),
    title: 'Making a bond',
    lead: t`The LCAO energies of H$_2^+$ against the proton separation: blue for $\psi_+$, red for $\psi_-$. Zero (dashed) is a hydrogen atom and a proton far apart. Gold: the exact minimum.`,
    tasks: [
      'Find the bottom of the blue curve: about 2.5 a₀ and −1.76 eV. The ion is bound.',
      'At large R both curves go to zero and the overlap S vanishes: the electron sits on one proton or the other, and nothing binds.',
      'Squeeze to R ≈ 1 a₀: the 1/R proton repulsion wins and both curves rise steeply. A bond length is a compromise.',
    ],
    caption: 'One-parameter LCAO with hydrogen 1s orbitals (exponent fixed at 1), protons clamped (Born–Oppenheimer), no vibration. The exact minimum is from the exact solution of the clamped problem.',
  },
  example: {
    prompt: t`Find the equilibrium separation and binding energy of H$_2^+$ predicted by the LCAO trial, compare with the exact values $R_e = 2.00\,a_0$ and $D_e = 2.79$ eV, and explain why the bonding orbital binds.`,
    visual: axisPic(2.5, 1, 'The bonding orbital along the axis (blue) and the two atomic orbitals it is built from (dashed), for R = 2.5 a₀.'),
    steps: [
      { label: 'Expectation value', text: t`$\hat H = -\tfrac12\nabla^2 - 1/r_1 - 1/r_2 + 1/R$. Since $\psi_0(r_1)$ solves the atom’s equation, $\hat H\psi_0(r_1) = (-\tfrac12 - 1/r_2 + 1/R)\psi_0(r_1)$; the matrix elements reduce to $S$, $D$ and $X$, and normalization supplies the $1 \pm S$.` },
      { label: 'Minimize', text: t`$U_+(R)$ has its minimum at $R = ${fmt(RMIN, 4)}\,a_0 = ${fmt(RMIN * A0_ANG, 3)}$ Å, where $U_+ = ${fmt(UMIN_EV, 4)}$ eV.` },
      { label: 'Compare', text: t`Exact: $R_e = 2.00\,a_0$ ($1.06$ Å) and $D_e = ${fmt(H2P_EXACT.De, 3)}$ eV. The LCAO bond is 25% too long and binds with only $${fmt((-UMIN_EV / H2P_EXACT.De) * 100, 2)}$% of the true energy — but it **does** bind, and as a variational result it is a rigorous lower bound on the binding energy.` },
      { label: 'Why it binds', text: t`In $\psi_+$ the two orbitals add between the protons, piling up charge where it is attracted by both. That is the exchange integral $X$; without it ($D$ alone) the curve has no minimum. In $\psi_-$ they cancel, leaving a node midway: the electron is pushed outside and the protons repel.` },
      { label: 'Improve', text: t`Let the orbitals shrink, $e^{-\zeta r}$: minimizing over $\zeta$ and $R$ gives $\zeta = ${ZETA.z}$, $R = ${fmt(ZETA.R, 3)}\,a_0$ and $D_e = ${ZETA.De}$ eV — the bond length right, the energy 84% of the truth.` },
    ],
    answer: t`LCAO: $R = ${fmt(RMIN, 3)}\,a_0 = ${fmt(RMIN * A0_ANG, 3)}$ Å, binding $${fmt(-UMIN_EV, 3)}$ eV; exact $2.00\,a_0$ and $${fmt(H2P_EXACT.De, 3)}$ eV.`,
  },
  practice: [
    num({
      id: 'overlap', difficulty: 1,
      gen(r) {
        const R = r.pick([1, 1.5, 2, 3, 4]);
        const ans = h2S(R);
        return {
          prompt: t`Two hydrogen $1s$ orbitals on protons $${R}\,a_0$ apart overlap by $S = e^{-R}(1 + R + R^2/3)$ ($R$ in $a_0$). What is $S$?`,
          visual: axisPic(R, 1, `The two 1s orbitals (dashed) for R = ${R} a₀ and their sum.`),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: Math.exp(-R), feedback: t`Include the polynomial $1 + R + R^2/3$: the overlap of two exponentials is not just $e^{-R}$.` }],
          hints: [t`$e^{-${R}} = ${fmt(Math.exp(-R), 4)}$; multiply by $1 + ${R} + ${R}^2/3$.`],
          teach: 'The overlap of two 1s orbitals falls from 1 (coincident) toward 0 (far apart) roughly as e^(−R).',
          explain: t`$S = ${fmt(Math.exp(-R), 4)}\times${fmt(1 + R + (R * R) / 3, 4)} = ${fmt(ans, 4)}$. Large overlap means the two atomic orbitals are far from independent — and a large difference between bonding and antibonding energies.`,
        };
      },
    }),
    num({
      id: 'u-at-r', difficulty: 2,
      gen(r) {
        const R = r.pick([1.5, 2, 3, 4]);
        const ans = h2U(R) * EH;
        return {
          prompt: t`Evaluate the bonding LCAO energy of H$_2^+$ at $R = ${R}\,a_0$: $U_+ = \big[1/R - (D + X)/(1 + S)\big]E_h$, with $S = ${fmt(h2S(R), 5)}$, $D = ${fmt(h2D(R), 5)}$, $X = ${fmt(h2X(R), 5)}$ (hartree). Give $U_+$ in eV.`,
          visual: curvePic({ caption: 'The LCAO curves (this R marked).', extra: { vlines: [{ x: R, color: 'ink3' }] }, exact: false }),
          answer: ans, units: 'eV', tol: { rel: 0.005, abs: 0.003 },
          errors: [{ value: h2U(R, -1) * EH, feedback: 'That is the antibonding combination: use + X and 1 + S.' }, { value: (1 / R - (h2D(R) + h2X(R))) * EH, feedback: t`Divide $D + X$ by $1 + S$ (normalization).` }],
          hints: [t`$(D + X)/(1 + S) = ${fmt((h2D(R) + h2X(R)) / (1 + h2S(R)), 5)}$.`, t`Subtract it from $1/R$ and multiply by $${fmt(EH, 6)}$ eV.`],
          teach: 'The bonding energy curve: proton repulsion minus the electron’s direct and exchange attraction, normalized by 1 + S.',
          explain: t`$U_+ = (${fmt(1 / R, 5)} - ${fmt((h2D(R) + h2X(R)) / (1 + h2S(R)), 5)})\times${fmt(EH, 6)} = ${fmt(ans, 4)}$ eV. ${ans < 0 ? 'Negative: bound relative to H + p at this separation.' : 'Positive: at this short distance the proton repulsion wins.'}`,
        };
      },
    }),
    mcq({
      id: 'antibonding', difficulty: 2,
      prompt: t`Why is the antibonding combination $\psi_- \propto \psi_0(r_1) - \psi_0(r_2)$ repulsive at every separation?`,
      visual: axisPic(2.5, -1, 'The antibonding orbital along the axis (red), with its node between the protons.'),
      choices: [
        'It has a node midway between the protons, removing the electron charge that would attract both, while costing extra kinetic energy',
        'Its electron has the opposite spin',
        'It has higher energy because it is a superposition, and the bonding orbital is not',
        'The protons repel more strongly when the orbital is antisymmetric',
      ],
      answer: 0,
      why: {
        1: 'There is one electron, and spin does not enter this Hamiltonian; both combinations hold an electron of either spin.',
        2: 'Both are superpositions of the same two atomic orbitals, differing only in the relative sign.',
        3: 'The proton–proton repulsion 1/R is the same for both; only the electron’s distribution differs.',
      },
      hints: ['Where is ψ₋ zero? What does that do to the charge between the protons?'],
      teach: 'Bonding orbitals pile charge between nuclei; antibonding orbitals have a node there.',
      explain: t`$\psi_-$ is odd about the midpoint, so it vanishes there: electron density is pushed outward, where it attracts each proton outward. The $-X$ term raises $U_-$ above zero at every $R$. Exciting the electron from $\psi_+$ to $\psi_-$ therefore breaks the molecule apart — photodissociation.`,
    }),
    num({
      id: 'zero-point', difficulty: 2,
      prompt: t`The exact H$_2^+$ well is $D_e = ${fmt(H2P_EXACT.De, 4)}$ eV deep, but the molecule cannot sit at the bottom: its vibration has zero-point energy $\tfrac12hc\,\omega_e$ with $\omega_e = ${WE}\ \text{cm}^{-1}$. Estimate the dissociation energy from the ground vibrational level, $D_0 \approx D_e - \tfrac12hc\,\omega_e$, in eV. ($hc = ${fmt(HC_EVCM * 1e4, 9)}\times10^{-4}$ eV cm.)`,
      visual: curvePic({ caption: 'The LCAO curves, with the exact minimum (gold). The vibrational ground level lies above the minimum.', anti: false, extra: { hlines: [{ y: 0, color: 'ink3' }, { y: r6(-D0), color: 'good', label: 'v = 0 (estimate)' }] } }),
      answer: D0, units: 'eV', tol: { rel: 0.003 },
      errors: [{ value: H2P_EXACT.De - WE * HC_EVCM, feedback: t`The zero-point energy is half a vibrational quantum: $\tfrac12hc\,\omega_e$.` }, { value: H2P_EXACT.De, feedback: 'That is the depth of the well; subtract the zero-point energy.' }],
      hints: [t`$\tfrac12hc\,\omega_e = \tfrac12\times${WE}\ \text{cm}^{-1}\times${fmt(HC_EVCM * 1e4, 6)}\times10^{-4}$ eV cm.`, t`That is $${fmt(0.5 * WE * HC_EVCM, 4)}$ eV.`],
      teach: 'A molecule’s dissociation energy D₀ is the well depth Dₑ minus the vibrational zero-point energy.',
      explain: t`$D_0 \approx ${fmt(H2P_EXACT.De, 4)} - ${fmt(0.5 * WE * HC_EVCM, 4)} = ${fmt(D0, 4)}$ eV, against the measured $2.651$ eV (anharmonicity accounts for the rest). Neutral H$_2$, with two electrons in the bonding orbital, binds by $4.48$ eV — not quite twice as much, because the electrons repel.`,
    }),
    mcq({
      id: 'lcao-bound', difficulty: 3,
      prompt: t`The LCAO binding energy, $${fmt(-UMIN_EV, 3)}$ eV, is less than the true $${fmt(H2P_EXACT.De, 2)}$ eV. Could a better trial function ever give a binding energy **larger** than $${fmt(H2P_EXACT.De, 2)}$ eV?`,
      visual: curvePic({ caption: 'LCAO curves and the exact minimum (gold).' }),
      choices: [
        t`No: at each $R$ the trial energy is an upper bound on the true electronic energy, and the H atom’s energy (the zero of $U$) is exact, so any trial binding is a lower bound on the true binding`,
        'Yes, with enough parameters the variational binding can overshoot',
        'Yes, because the protons are held fixed',
        'No, because the antibonding curve sets a limit',
      ],
      answer: 0,
      why: {
        1: 'More parameters approach the true energy from above; they never pass it.',
        2: 'Clamping the protons defines the electronic problem being solved; the bound holds for that problem at every R.',
        3: 'The antibonding curve is a different (excited) state and plays no role in bounding the ground state.',
      },
      hints: [t`Binding energy $= E(\text{H} + p) - E(\text{H}_2^+)$. Which of the two is approximate here, and in which direction is it wrong?`, 'The variational energy is never below the true energy.'],
      teach: 'Because the separated-atom energy is exact, variational binding energies are lower bounds on the true binding.',
      explain: t`$E_{\text{trial}}(R) \ge E_{\text{true}}(R)$, and the reference $-13.6$ eV is exact, so $D_{\text{trial}} \le D_{\text{true}}$. (Comparing two approximate energies — as in many chemistry calculations — loses this guarantee.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-photodiss', difficulty: 3, transfer: true,
      prompt: t`In interstellar clouds and planetary ionospheres, ultraviolet light breaks H$_2^+$ apart by lifting the electron from the bonding to the antibonding orbital at fixed $R$ (the protons have no time to move). At $R = 2.00\,a_0$ the LCAO curves give $U_+ = ${fmt(h2U(2) * EH, 4)}$ eV and $U_- = ${fmt(h2U(2, -1) * EH, 4)}$ eV. What photon wavelength does this transition need, in nm, according to LCAO? ($hc = ${fmt(HC_EVNM, 8)}$ eV nm.)`,
      visual: curvePic({ caption: 'The bonding and antibonding curves, with the vertical transition at R = 2 a₀.', extra: { arrows: [{ from: [2, r6(h2U(2) * EH)], to: [2, r6(h2U(2, -1) * EH)], color: 'violet', width: 2.4 }] }, y: [-3.5, 11] }),
      answer: HC_EVNM / ((h2U(2, -1) - h2U(2)) * EH), units: 'nm', tol: { rel: 0.003 },
      errors: [{ value: HC_EVNM / (h2U(2, -1) * EH), feedback: 'Use the energy difference between the two curves at R = 2, not the antibonding energy alone.' }],
      hints: [t`$\Delta E = U_- - U_+$ at $R = 2\,a_0$.`, t`$\lambda = hc/\Delta E$.`],
      teach: 'A vertical (Franck–Condon) transition from a bonding to an antibonding curve dissociates the molecule; its energy is the gap between the curves at fixed R.',
      explain: t`$\Delta E = ${fmt((h2U(2, -1) - h2U(2)) * EH, 4)}$ eV, so $\lambda = ${fmt(HC_EVNM / ((h2U(2, -1) - h2U(2)) * EH), 4)}$ nm, in the far ultraviolet. The exact curves give $${fmt(EXACT_U2, 4)}$ eV ($${fmt(HC_EVNM / EXACT_U2, 4)}$ nm): LCAO misses by 10%, mostly because its bonding curve is too shallow.`,
    }),
    num({
      id: 'cp-vibration', difficulty: 3, transfer: true,
      prompt: t`Near its minimum the LCAO curve is a parabola, $U \approx U_{\min} + \tfrac12k(R - R_{\min})^2$ with $k = ${fmt(kLCAO, 4)}$ hartree/$a_0^2$. The protons vibrate with reduced mass $\mu = m_p/2 = ${fmt(MP_ME / 2, 9)}\,m_e$, so in atomic units $\hbar\omega = \sqrt{k/\mu}$ hartree. Infrared astronomers quote vibrations as wavenumbers: what is $\omega/2\pi c$, in $\text{cm}^{-1}$? (1 hartree $= ${(EH / HC_EVCM).toFixed(3)}\ \text{cm}^{-1}$.)`,
      visual: curvePic({ caption: 'The bonding LCAO curve near its minimum.', anti: false, exact: false, extra: { curves: [{ fn: h2Expr(1), color: 'accent', width: 2.6, domain: [0.6, 7] }, { fn: `${r6(UMIN_EV)} + 0.5*${r6(kLCAO * EH)}*(x - ${r6(RMIN)})^2`, color: 'good', width: 2, dash: [6, 4], domain: [1.2, 3.8] }] }, y: [-2.2, 1] }),
      answer: wLCAO, units: 'cm^-1', tol: { rel: 0.005 },
      errors: [{ value: wLCAO / Math.sqrt(2), feedback: t`Use the reduced mass of the two protons, $m_p/2$, not $m_p$.` }],
      hints: [t`$\sqrt{k/\mu} = \sqrt{${fmt(kLCAO, 4)}/${fmt(MP_ME / 2, 6)}}$ hartree.`, t`Multiply by $${(EH / HC_EVCM).toFixed(1)}\ \text{cm}^{-1}$ per hartree.`],
      teach: 'The curvature of a molecular potential curve at its minimum, with the reduced mass, gives the vibrational frequency.',
      explain: t`$\hbar\omega = ${fmt(Math.sqrt(kLCAO / (MP_ME / 2)), 4)}$ hartree $= ${fmt(wLCAO, 4)}\ \text{cm}^{-1}$, against the measured $\omega_e = ${WE}\ \text{cm}^{-1}$. The LCAO well is too shallow and too wide, so it vibrates too slowly. Precision spectroscopy of H$_2^+$ and HD$^+$ vibrations, compared with exact theory, now measures the proton-to-electron mass ratio.`,
    }),
    mcq({
      id: 'cp-zeta', difficulty: 2,
      prompt: t`Letting the orbital exponent vary, $e^{-\zeta r}$, the optimum at $R = 2\,a_0$ is $\zeta = ${ZETA.z} > 1$: the atomic orbitals **shrink**. Why does that help?`,
      visual: axisPic(2, 1, 'The bonding orbital at R = 2 a₀ with ζ = 1. Near each proton the electron also feels the other proton’s pull.'),
      choices: [
        t`Near the bond the electron is attracted by two protons, so it is held more tightly than in a free atom — like a hydrogen-like ion with $Z > 1$; a tighter orbital lowers the energy`,
        'Shrinking the orbitals reduces the overlap, which strengthens the bond',
        'The electron’s mass increases in the molecule',
        'The protons’ charge is screened by the electron, as in helium',
      ],
      answer: 0,
      why: {
        1: 'Overlap is what makes the exchange term; shrinking reduces it, a cost that the gain in attraction outweighs.',
        2: 'The electron’s mass is unchanged; ζ describes the shape of the orbital.',
        3: 'In helium screening made ζ smaller than Z. Here there is one electron and no screening; the second proton makes the effective charge larger.',
      },
      hints: ['At R → 0 the two protons merge into a helium nucleus (Z = 2). What would the best ζ be then?'],
      teach: 'The effective charge in a molecular orbital interpolates between the separated atoms (ζ = 1) and the united atom (ζ = 2 for He⁺).',
      explain: t`ζ runs from 1 at large $R$ to 2 as $R \to 0$ (He$^+$). At $R = 2\,a_0$ it is $${ZETA.z}$, and the binding rises from $${fmt(-UMIN_EV, 2)}$ to $${ZETA.De}$ eV with the right bond length. The same trick — effective charges and contracted orbitals — reappears in every chemistry basis set.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §8.3', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'D. R. Bates, K. Ledsham & A. L. Stewart, “Wave functions of the hydrogen molecular ion”, Phil. Trans. R. Soc. A 246, 215 (1953)', url: 'https://doi.org/10.1098/rsta.1953.0014' },
    { label: 'K. P. Huber & G. Herzberg, Constants of Diatomic Molecules (NIST Chemistry WebBook)', url: 'https://webbook.nist.gov/chemistry/' },
  ],
});
