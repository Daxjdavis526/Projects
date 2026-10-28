// Molecular bonding — H₂⁺ as the teaching model: two 1s orbitals combined
// (LCAO) into a bonding and an antibonding orbital, their energies against
// the proton separation (LCAO: R = 2.49 a₀ and 1.76 eV; exact: 2.00 a₀ and
// 2.79 eV), charge piled between the nuclei; H₂, He₂ and bond order; the
// ionic bond as energy accounting (NaCl), the crossing distance, percent
// ionic character from dipole moments; and atomic oxygen in low Earth orbit.
// Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HC_EVNM, QE } from './_constants.js';
import { KE2 } from './_quanta.js';
import * as S from '../../src/viz/model/mp-shells.js';
import { levels, label, r6 } from './_atoms.js';

const t = String.raw;
const HA = 27.211386245988;                       // eV, the hartree (CODATA 2022)
const A0_PM = 52.9177210544;                      // pm
const ovl = (x) => Math.exp(-x) * (1 + x + (x * x) / 3);
const lcao = (x, s) => { const j = 1 / x - Math.exp(-2 * x) * (1 + 1 / x), k = Math.exp(-x) * (1 + x); return HA * (1 / x - (j + s * k) / (1 + s * ovl(x))); };
const LC = (() => { let b = [0, 1e9]; for (let x = 1; x < 4; x += 1e-4) { const v = lcao(x, 1); if (v < b[1]) b = [x, v]; } return { R: b[0], E: b[1] }; })();
// the exact H₂⁺ curve, as a Morse fit: D_e = 2.7925 eV, R_e = 1.9972 a₀, a from ω_e = 2321.7 cm⁻¹ (Huber & Herzberg)
const DE_EX = 2.7925, RE_EX = 1.9972, A_MORSE = 0.7075;
// expressions of x = R/a₀ for the graph (energies in eV, relative to H + p far apart)
const lcaoExpr = (v, sign) => `${HA}*(1/${v} - ((1/${v} - exp(-2*${v})*(1 + 1/${v})) ${sign} exp(-${v})*(1 + ${v}))/(1 ${sign} exp(-${v})*(1 + ${v} + ${v}^2/3)))`;
const BOND = lcaoExpr('x', '+');
const ANTI = lcaoExpr('x', '-');
const MORSE = `${DE_EX}*((1 - exp(-${A_MORSE}*(x - ${RE_EX})))^2 - 1)`;
// ionic molecules: bond length (pm, Huber & Herzberg), electric dipole moment (debye, NIST CCCBDB)
const EA = { Cl: 3.612724, F: 3.4011898 };       // eV, electron affinities
const IONIC = {
  NaCl: { metal: 11, hal: 'Cl', r: 236.08, mu: 9.002, name: 'sodium chloride' },
  KCl: { metal: 19, hal: 'Cl', r: 266.67, mu: 10.269, name: 'potassium chloride' },
  NaF: { metal: 11, hal: 'F', r: 192.59, name: 'sodium fluoride' },
  LiF: { metal: 3, hal: 'F', r: 156.39, name: 'lithium fluoride' },
};
const DEBYE = 3.33564e-30;                        // C m
const POLAR = { HCl: { r: 127.46, mu: 1.1086, name: 'hydrogen chloride' }, HF: { r: 91.69, mu: 1.8262, name: 'hydrogen fluoride' }, NaCl: { r: 236.08, mu: 9.002, name: 'sodium chloride (as a gas molecule)' }, CO: { r: 112.83, mu: 0.1098, name: 'carbon monoxide' } };
const NACL = { ie: S.ionization(11), ea: EA.Cl, coul: KE2 / (IONIC.NaCl.r / 1000) };
const D0 = { H2: 4.478, H2p: 2.651, O2: 5.1157, N2: 9.7537, Cl2: 2.4794 };   // eV (Huber & Herzberg)

/** H₂⁺ energy curves against R in a₀: LCAO bonding and antibonding, and (optionally) the exact curve. */
function curvesH2p({ exact = true, marks = [], caption } = {}) {
  return {
    type: 'graph',
    params: {
      x: [0.6, 7], y: [-3.5, 6], aspect: 'wide', xlabel: 'proton separation R (a₀ = 52.9 pm)', ylabel: 'energy (eV)', axesAt: 'edge',
      curves: [
        { fn: BOND, domain: [0.8, 7], color: 'accent', width: 2.6, label: 'bonding (LCAO)', labelAt: 5, labelDy: 12 },
        { fn: ANTI, domain: [0.9, 7], color: 'warn', width: 2.6, label: 'antibonding (LCAO)', labelAt: 3.6, labelDx: 8, labelDy: -12 },
        ...(exact ? [{ fn: MORSE, domain: [1, 7], color: 'good', width: 2, dash: true, label: 'exact (Morse fit)', labelAt: 1.25, labelDx: 8, labelDy: 4 }] : []),
      ],
      hlines: [{ y: 0, color: 'ink4' }],
      points: marks,
    },
    caption: caption ?? 'The energy of H₂⁺ against the distance between its protons, measured from a hydrogen atom and a proton far apart (the grey line). Solid: the LCAO teaching model; dashed: a Morse curve fitted to the exact solution (Rₑ = 2.00 a₀, Dₑ = 2.79 eV).',
  };
}

/** A molecular-orbital diagram: two atomic levels, σ and σ* between, filled with n electrons. */
function moDiagram(n, caption) {
  const els = [];
  const fill = (E, k, x) => { for (let i = 0; i < k; i++) els.push({ x: r6(x + (i ? 0.35 : -0.35)), y: E, r: 5, color: i ? 'warn' : 'accent' }); };
  const nb = Math.min(2, n), na = Math.max(0, n - 2);
  fill(-1.2, nb, 5); fill(1.2, na, 5);
  const D = levels([{ E: 0, label: '1s', x0: 0, x1: 2 }, { E: 0, label: '1s', x0: 8, x1: 10, labelLeft: false }, { E: -1.2, label: 'σ (bonding)', x0: 4, x1: 6, color: 'accent' }, { E: 1.2, label: 'σ* (antibonding)', x0: 4, x1: 6, color: 'warn' }], { x: [-1, 14.5], pad: 0.3, caption });
  D.params.points.push(...els);
  return D;
}

export default lesson({
  id: 'phys2710.MP11.1',
  title: 'Molecular bonding',
  minutes: 15, difficulty: 3,
  intro: t`The simplest molecule, H₂⁺, is one electron shared by two protons. Near either proton the electron should look like a hydrogen 1s orbital, so a first guess — a **linear combination of atomic orbitals** (LCAO) — adds or subtracts the two:

$$\psi_\pm = \frac{\psi_A \pm \psi_B}{\sqrt{2(1 \pm S)}}$$

The sum piles charge up *between* the protons, where it is attracted by both: a **bonding** orbital, whose energy dips below a separate atom’s. The difference has a node midway and pushes the protons apart: **antibonding**. Two electrons with opposite spins fit in the bonding orbital (the exclusion principle again), which is the covalent bond of H₂. An ionic bond, as in NaCl, is a different deal: one atom gives an electron to the other, and the ions’ Coulomb attraction pays for it.

> Hydrogen’s 1s orbital came in [Quantum numbers and orbitals](#/lesson/phys2710.MP8.2); two electrons per orbital in [The exclusion principle](#/lesson/phys2710.MP9.1).`,
  symbols: [
    { tex: '\\psi_\\pm', text: 'the molecular orbitals: $+$ bonding, $-$ antibonding' },
    { tex: '\\psi_A,\\ \\psi_B', text: 'hydrogen 1s orbitals centred on proton A and on proton B, $\\psi = e^{-r/a_0}/\\sqrt{\\pi a_0^3}$' },
    { tex: 'S', text: t`the overlap $\int\psi_A\psi_B\,dV$, between 0 (far apart) and 1 (on top of each other); for protons a distance $R$ apart, $S = e^{-R/a_0}(1 + R/a_0 + R^2/3a_0^2)$` },
    { tex: '\\sqrt{2(1 \\pm S)}', text: 'normalization: it makes the total probability 1' },
  ],
  why: 'Chemical bonds set the energies of fuels and propellants, the strength and stiffness of materials, and — through their vibrations and rotations — the spectra by which we find molecules in space and measure greenhouse gases.',
  visual: {
    type: 'graph',
    title: 'Sharing an electron between two protons',
    lead: t`The probability density along the line through both protons, for the bonding orbital (blue) and the antibonding one (orange); dashed, the average of two separate atoms. Move the protons with $R$, and read the LCAO energies below.`,
    tasks: [
      'At R = 2.5 a₀, compare blue with dashed: midway between the protons the bonding density is higher than two separate atoms would give, and near the protons lower — charge has moved into the middle. That shared charge is the bond; the antibonding density drops to zero midway.',
      'Find the R where the bonding energy is lowest: about 2.5 a₀, a bond of 1.76 eV in this model (the exact answer is 2.00 a₀ and 2.79 eV).',
      'Pull the protons apart to R = 6 a₀: both energies approach 0 — a hydrogen atom and a bare proton — and the orbitals become two separate 1s clouds.',
    ],
    params: {
      x: [-5, 5], y: [0, 0.45], aspect: 'wide', xlabel: 'position along the axis z (a₀)', ylabel: 'probability density (a₀⁻³)', axesAt: 'edge',
      sliders: [{ key: 'R', label: 'Proton separation $R$', min: 0.5, max: 7, step: 0.05, value: 2.5, unit: 'a_0', explain: 'The distance between the two protons, in Bohr radii (52.9 pm).' }],
      curves: [
        { fn: '(exp(-abs(x - R/2)) + exp(-abs(x + R/2)))^2/(2*pi*(1 + exp(-R)*(1 + R + R^2/3)))', color: 'accent', width: 2.6 },
        { fn: '(exp(-abs(x - R/2)) - exp(-abs(x + R/2)))^2/(2*pi*(1 - exp(-R)*(1 + R + R^2/3)))', color: 'warn', width: 2.6 },
        { fn: '(exp(-2*abs(x - R/2)) + exp(-2*abs(x + R/2)))/(2*pi)', color: 'ink3', width: 1.6, dash: true },
      ],
      points: [{ x: 'R/2', y: 0.01, r: 6, color: 'bad', label: 'B', labelDx: 0, labelDy: -14, labelAlign: 'center' }, { x: '-R/2', y: 0.01, r: 6, color: 'bad', label: 'A', labelDx: 0, labelDy: -14, labelAlign: 'center' }],
      legend: [{ label: 'bonding', color: 'accent' }, { label: 'antibonding', color: 'warn' }, { label: 'two separate atoms', color: 'ink3', dash: true }],
      readouts: [{ label: 'bonding energy', expr: lcaoExpr('R', '+'), unit: '\\mathrm{eV}', digits: 3 }, { label: 'antibonding energy', expr: lcaoExpr('R', '-'), unit: '\\mathrm{eV}', digits: 3 }],
    },
    caption: 'H₂⁺ in the LCAO teaching model: densities |ψ±|² along the axis through the protons (red dots); energies relative to a hydrogen atom and a proton far apart, including the protons’ repulsion. The model gets the bond qualitatively right and quantitatively short: it binds by 1.76 eV at 2.49 a₀ against the exact 2.79 eV at 2.00 a₀.',
  },
  example: {
    prompt: t`A gas-phase NaCl molecule has a bond length of ${IONIC.NaCl.r} pm. Starting from separate sodium and chlorine atoms, estimate its binding energy as an ionic bond. (Sodium’s ionization energy is ${fmt(NACL.ie, 4)} eV; chlorine’s electron affinity, the energy released when it gains an electron, is ${fmt(NACL.ea, 4)} eV.)`,
    visual: {
      type: 'graph',
      params: {
        x: [0.15, 1.2], y: [-6, 3], aspect: 'wide', xlabel: 'separation r (nm)', ylabel: 'energy (eV)', axesAt: 'edge',
        curves: [{ fn: `${r6(NACL.ie - NACL.ea)} - ${r6(KE2)}/x + ${r6(KE2 * 0.2361 ** 8 / 9)}/x^9`, domain: [0.16, 1.2], color: 'accent', width: 2.6, label: 'the ion pair Na⁺ + Cl⁻', labelAt: 0.55, labelDy: 14 }],
        hlines: [{ y: 0, color: 'ink3', label: 'Na + Cl atoms' }, { y: r6(NACL.ie - NACL.ea), color: 'warn', label: `Na⁺ + Cl⁻ far apart: +${(NACL.ie - NACL.ea).toFixed(2)} eV` }],
        points: [{ x: 0.2361, y: r6(NACL.ie - NACL.ea - NACL.coul + (KE2 * 0.2361 ** 8) / 9 / 0.2361 ** 9), r: 5, color: 'gold' }, { x: r6(KE2 / (NACL.ie - NACL.ea)), y: 0, r: 5, color: 'bad', label: 'curves cross', labelDx: 8, labelDy: 12 }],
      },
      caption: 'The ionic route for NaCl: making the ions costs 1.53 eV; their Coulomb attraction, plus a short-range repulsion (modelled here as 1/r⁹, chosen to put the minimum at the bond length), more than pays it back. Schematic in the repulsion.',
    },
    steps: [
      { label: 'Make the ions', text: t`Removing sodium’s 3s electron costs ${fmt(NACL.ie, 4)} eV; chlorine taking it releases ${fmt(NACL.ea, 4)} eV. Net cost: $${fmt(NACL.ie - NACL.ea, 4)}$ eV — so isolated atoms do *not* swap electrons on their own.` },
      { label: 'Bring them together', text: t`At separation $r$ the ions attract with energy $-ke^2/r$, and $ke^2 = 1.440$ eV nm. At the bond length, $ke^2/r = 1.440/${(IONIC.NaCl.r / 1000).toFixed(4)} = ${fmt(NACL.coul, 3)}$ eV.` },
      { label: 'Add them up', text: t`$E \approx ${fmt(NACL.ie - NACL.ea, 3)} - ${fmt(NACL.coul, 3)} = ${fmt(NACL.ie - NACL.ea - NACL.coul, 3)}$ eV: a binding energy of about ${fmt(NACL.coul - NACL.ie + NACL.ea, 2)} eV.` },
      { label: 'What is missing', text: t`The measured value is about 4.3 eV. The difference is the short-range repulsion as the ions’ closed shells start to overlap — the exclusion principle again — which stops them at 236 pm, and a little polarization of each ion by the other.` },
      { label: 'Sense check', text: t`The transfer pays off only inside $r_c = ke^2/(1.53\ \text{eV}) = ${fmt(KE2 / (NACL.ie - NACL.ea), 2)}$ nm, where the ionic curve crosses below the atoms’ energy. Bond energies of a few eV are the scale of chemistry, against $k_BT = 0.026$ eV at room temperature: molecules survive.` },
    ],
    answer: t`About ${fmt(NACL.coul - NACL.ie + NACL.ea, 2)} eV from the Coulomb accounting ($${fmt(NACL.coul, 3)}$ eV of attraction minus $${fmt(NACL.ie - NACL.ea, 3)}$ eV to make the ions); about 4.3 eV is measured, the rest taken back by short-range repulsion.`,
  },
  practice: [
    num({
      id: 'coulomb-ionic', difficulty: 1,
      gen(r) {
        const key = r.pick(['KCl', 'NaF', 'LiF']), M = IONIC[key], ans = KE2 / (M.r / 1000);
        return {
          prompt: t`The ions of a gas-phase ${M.name} molecule are ${M.r} pm apart. What is the Coulomb energy of the ion pair, $ke^2/r$, in eV? ($ke^2 = 1.440$ eV nm.)`,
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [{ value: ans / 1000, feedback: 'Convert pm to nm: 1 nm = 1000 pm.' }],
          hints: [t`$r = ${M.r}\ \text{pm} = ${(M.r / 1000).toFixed(5)}$ nm.`],
          teach: 'Two singly charged ions a few hundred picometres apart attract with several eV: ke²/r with ke² = 1.44 eV nm.',
          explain: t`$ke^2/r = 1.440\ \text{eV nm}/${(M.r / 1000).toFixed(5)}\ \text{nm} = ${fmt(ans, 3)}$ eV. Making the ions costs only $${fmt(S.ionization(M.metal) - EA[M.hal], 3)}$ eV, so the ionic bond is strong.`,
          visual: { type: 'graph', params: { x: [0.1, 0.8], y: [-11, 1], aspect: 'wide', xlabel: 'ion separation r (nm)', ylabel: 'Coulomb energy (eV)', axesAt: 'edge', curves: [{ fn: `-${r6(KE2)}/x`, domain: [0.12, 0.8], color: 'accent', width: 2.6 }], vlines: [{ x: r6(M.r / 1000), label: 'bond length', color: 'gold' }] }, caption: 'The Coulomb energy −ke²/r of a pair of singly charged ions. Its value at the bond length is the question.' },
        };
      },
    }),
    num({
      id: 'crossing', difficulty: 2,
      gen(r) {
        const key = r.pick(['KCl', 'NaF', 'LiF', 'NaCl']), M = IONIC[key], cost = S.ionization(M.metal) - EA[M.hal], ans = KE2 / cost;
        const metal = S.element(M.metal).name, hal = M.hal === 'Cl' ? 'chlorine' : 'fluorine';
        return {
          prompt: t`A ${metal} atom approaches a ${hal} atom. Moving one electron across costs $E_\text{ion} - E_\text{ea} = ${fmt(S.ionization(M.metal), 4)} - ${fmt(EA[M.hal], 4)}$ eV. At what separation does the ions’ Coulomb attraction first make the transfer pay, in nm?`,
          answer: ans, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: KE2 / S.ionization(M.metal), feedback: 'The electron affinity pays back part of the cost: use the difference.' }],
          hints: [t`The transfer pays once $ke^2/r$ exceeds the cost.`, t`$r_c = ke^2/(E_\text{ion} - E_\text{ea}) = 1.440\ \text{eV nm}/${fmt(cost, 4)}\ \text{eV}$.`],
          teach: 'An electron jumps from a metal atom to a halogen once the ions’ attraction ke²/r beats the net cost of making them.',
          explain: t`$r_c = 1.440/${fmt(cost, 4)} = ${fmt(ans, 3)}$ nm — several bond lengths. Approaching atoms “harpoon” each other at that distance: the electron jumps across, and the ions are pulled together.`,
          visual: { type: 'graph', params: { x: [0.1, 2.2], y: [-6, 3], aspect: 'wide', xlabel: 'separation r (nm)', ylabel: 'energy (eV)', axesAt: 'edge', curves: [{ fn: `${r6(cost)} - ${r6(KE2)}/x`, domain: [0.25, 2.2], color: 'accent', width: 2.6, label: 'ions', labelAt: 1.8, labelDy: -12 }], hlines: [{ y: 0, color: 'ink3', label: 'neutral atoms' }] }, caption: 'Energy of the ion pair (blue) against two neutral atoms (grey), ignoring the short-range repulsion. Where they cross is the question.' },
        };
      },
    }),
    mcq({
      id: 'why-bonding', difficulty: 2,
      prompt: 'Why does the bonding orbital of H₂⁺ have a lower energy than a hydrogen atom with a distant proton?',
      choices: [
        'It puts extra electron density between the protons, where the electron is attracted by both at once',
        'The electron spends all its time on one proton, which shields it from the other',
        'The two protons attract each other once the electron is present',
        'The electron moves faster in the bonding orbital, which lowers its energy',
      ],
      answer: 0,
      why: {
        1: 'The bonding orbital is shared equally between the protons; an electron stuck on one would be just a hydrogen atom.',
        2: 'Protons always repel each other; the electron’s attraction to both is what overcomes that repulsion.',
        3: 'Faster motion means more kinetic energy, which raises the energy; the gain comes from the potential energy between the nuclei.',
      },
      hints: ['Compare the bonding density with the dashed density of two separate atoms: where is it bigger?'],
      teach: 'A covalent bond lowers the energy by concentrating the shared electron where both nuclei attract it.',
      explain: t`The sum $\psi_A + \psi_B$ interferes constructively midway, so charge moves from the outside into the region between the nuclei, where the electron’s potential energy is lowest — attracted by two protons at once. The difference $\psi_A - \psi_B$ does the opposite, emptying that region: antibonding.`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [0, 0.45], aspect: 'wide', xlabel: 'position along the axis z (a₀)', ylabel: 'probability density', axesAt: 'edge', curves: [{ fn: '(exp(-abs(x - 1.25)) + exp(-abs(x + 1.25)))^2/(2*pi*(1 + exp(-2.5)*(1 + 2.5 + 2.5^2/3)))', color: 'accent', width: 2.6 }, { fn: '(exp(-2*abs(x - 1.25)) + exp(-2*abs(x + 1.25)))/(2*pi)', color: 'ink3', width: 1.6, dash: true }], points: [{ x: 1.25, y: 0.01, r: 6, color: 'bad' }, { x: -1.25, y: 0.01, r: 6, color: 'bad' }] }, caption: 'H₂⁺’s bonding density (blue) along the axis at R = 2.5 a₀, against the average of two separate atoms (dashed). Protons in red.' },
    }),
    mcq({
      id: 'bond-order', difficulty: 2,
      prompt: 'Fill the σ (bonding) and σ* (antibonding) orbitals built from two 1s orbitals, two electrons to an orbital. Which of these does not form a chemically bound molecule?',
      choices: ['He₂, with 4 electrons', 'H₂, with 2 electrons', 'H₂⁺, with 1 electron', 'He₂⁺, with 3 electrons'],
      answer: 0,
      why: {
        1: 'Both electrons go into σ with opposite spins: a full bond (bond order 1), 4.48 eV deep.',
        2: 'One bonding electron makes half a bond — 2.65 eV for H₂⁺, as this lesson computed.',
        3: 'Two bonding electrons and one antibonding: bond order ½. He₂⁺ exists, bound by about 2.4 eV.',
      },
      hints: ['Bond order = (bonding electrons − antibonding electrons)/2.', 'The antibonding orbital is pushed up a little more than the bonding one is pulled down.'],
      teach: 'Bond order, (bonding − antibonding electrons)/2, predicts which molecules hold together.',
      explain: 'He₂ would put two electrons in σ and two in σ*: bond order 0, and since σ* rises more than σ falls, the pair repels. (A van der Waals He₂ “molecule” does exist, but bound by a hundred-millionth of an eV: it falls apart above about a millikelvin.)',
      visual: moDiagram(4, 'Molecular orbitals from two 1s orbitals, filled with four electrons as for He₂: up spins blue, down spins orange. Schematic energies.'),
    }),
    {
      type: 'slider', id: 'lcao-minimum', difficulty: 2,
      prompt: t`In the LCAO model, the bonding energy of H₂⁺ depends on the proton separation $R$. Set $R$ to the bond length the model predicts — the separation of lowest energy.`,
      visual: {
        type: 'graph',
        params: {
          x: [0.6, 7], y: [-3.5, 6], aspect: 'wide', xlabel: 'proton separation R (a₀)', ylabel: 'energy (eV)', axesAt: 'edge',
          sliders: [{ key: 'R', label: 'Proton separation $R$', min: 1, max: 6, step: 0.05, value: 4.5, unit: 'a_0', explain: 'The distance between the protons, in Bohr radii.' }],
          curves: [{ fn: BOND, domain: [0.8, 7], color: 'accent', width: 2.6 }],
          vlines: [{ x: 'R', color: 'gold' }],
          hlines: [{ y: 0, color: 'ink4' }],
        },
        caption: 'The LCAO bonding energy of H₂⁺ against the proton separation (relative to H + p far apart).',
      },
      param: 'R', answer: [r6(LC.R - 0.15), r6(LC.R + 0.15)],
      instruction: 'Slide R to the bottom of the bonding curve, then check.',
      hints: ['Move the gold line until it sits under the lowest point of the blue curve.'],
      teach: 'A bond length is the separation that minimizes the total energy, protons’ repulsion included.',
      explain: t`The minimum is at $R = ${fmt(LC.R, 3)}\,a_0 = ${fmt(LC.R * A0_PM, 3)}$ pm, ${fmt(-LC.E, 3)} eV deep. The exact solution of the same Schrödinger equation gives 2.00 $a_0$ (106 pm) and 2.79 eV: the LCAO guess is too stiff near the protons, where the true orbital contracts.`,
    },
    num({
      id: 'percent-ionic', difficulty: 2,
      gen(r) {
        const key = r.pick(['HCl', 'HF', 'NaCl', 'CO']), M = POLAR[key], ans = (100 * M.mu * DEBYE) / (QE * M.r * 1e-12);
        return {
          prompt: t`The electric dipole moment of a ${M.name} molecule is ${M.mu} D (1 debye $= 3.336\times10^{-30}$ C m), and its bond length is ${M.r} pm. If it were fully ionic, with charges $\pm e$ that far apart, its dipole moment would be $er$. What percentage of that does it have?`,
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: ans / 100, feedback: 'Express it as a percentage.' }],
          hints: [t`$er = (1.602\times10^{-19}\ \text{C})(${M.r}\times10^{-12}\ \text{m})$.`, t`Percentage $= 100\,\mu/(er)$, with $\mu = ${M.mu}\times 3.336\times10^{-30}$ C m.`],
          teach: 'Comparing a molecule’s dipole moment with er measures how far its bond lies between covalent and ionic.',
          explain: t`$er = ${fmt((QE * M.r * 1e-12) / 1e-30, 4)}\times10^{-30}$ C m, so ${M.name} is ${fmt(ans, 3)}% “ionic”. Real bonds lie on a continuum: ${ans > 60 ? 'this one is mostly ionic' : ans > 10 ? 'this one is a polar covalent bond' : 'this one is almost purely covalent'}.`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-1, 1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', points: [{ x: -0.8, y: 0, r: 14, color: 'accent', label: 'δ+', labelDx: 0, labelDy: -26, labelAlign: 'center' }, { x: 0.8, y: 0, r: 18, color: 'warn', label: 'δ−', labelDx: 0, labelDy: -30, labelAlign: 'center' }], arrows: [{ from: [0.8, -0.6], to: [-0.8, -0.6], color: 'gold', label: 'dipole', labelDx: -10, labelDy: 12 }] }, caption: 'A polar molecule, schematic: partial charges ±δ a bond length apart. The arrow points from negative to positive, the physicist’s convention for a dipole moment.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-atomic-oxygen', difficulty: 2, transfer: true,
      gen(r) {
        const [mol, what] = r.pick([['O2', 'O₂, whose atoms erode spacecraft surfaces in low Earth orbit'], ['N2', 'N₂'], ['Cl2', 'Cl₂']]);
        const ans = HC_EVNM / D0[mol];
        return {
          prompt: t`Spacecraft in low Earth orbit are eroded by atomic oxygen, made when solar ultraviolet light splits oxygen molecules. A molecule’s bond can be broken by one photon carrying at least its dissociation energy. What is the longest wavelength that can split ${what} (dissociation energy ${D0[mol]} eV), in nm?`,
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: D0[mol] / HC_EVNM, feedback: t`Invert: $\lambda = hc/E$.` }],
          hints: [t`$\lambda_{\max} = hc/D_0$, with $hc = 1239.8$ eV nm.`],
          teach: 'A photon can break a bond only if hc/λ exceeds the bond energy, so a bond energy sets a longest wavelength.',
          explain: t`$\lambda = 1239.8/${D0[mol]} = ${fmt(ans, 4)}$ nm. ${mol === 'O2' ? 'Ultraviolet below 242 nm is absorbed high in the atmosphere doing exactly this, so oxygen above about 100 km is mostly atomic — and ram-facing spacecraft surfaces such as Kapton blankets lose material to it.' : mol === 'N2' ? 'Nitrogen’s triple bond needs far-ultraviolet photons, so N₂ survives where O₂ is split.' : 'Visible blue-green light breaks chlorine’s weak bond, which is why chlorine–hydrogen mixtures explode in sunlight.'}`,
          visual: moDiagram(2, 'The bonding idea, schematic: two electrons in a bonding orbital. Breaking the bond means supplying the dissociation energy.'),
        };
      },
    }),
    num({
      id: 'cp-h2-ionization', difficulty: 3,
      prompt: t`Use an energy cycle: the dissociation energy of H₂ is ${D0.H2} eV, that of H₂⁺ is ${D0.H2p} eV, and hydrogen’s ionization energy is ${fmt(S.ionization(1), 4)} eV. What is the ionization energy of the H₂ molecule, in eV?`,
      answer: D0.H2 + S.ionization(1) - D0.H2p, units: 'eV', tol: { rel: 0.002 },
      errors: [{ value: S.ionization(1) + D0.H2p - D0.H2, feedback: 'Check the signs: H₂ is more tightly bound than H₂⁺, so ionizing H₂ costs more than ionizing an atom.' }, { value: D0.H2 + S.ionization(1), feedback: 'H₂⁺ is itself bound: you get its dissociation energy back.' }],
      hints: ['Two routes from H₂ to H + H⁺ + e⁻ must cost the same energy.', t`Route 1: dissociate H₂ (${D0.H2} eV), then ionize one atom. Route 2: ionize H₂, then dissociate H₂⁺ (${D0.H2p} eV).`],
      teach: 'Energy is a state function: two routes between the same start and end cost the same, so bond energies combine like sums.',
      explain: t`$E_\text{ion}(\text{H}_2) = ${D0.H2} + ${fmt(S.ionization(1), 4)} - ${D0.H2p} = ${fmt(D0.H2 + S.ionization(1) - D0.H2p, 4)}$ eV; measured, 15.43 eV. Removing an electron from H₂ empties half its bonding orbital, which weakens the bond from 4.48 to 2.65 eV.`,
      visual: moDiagram(2, 'H₂: two electrons, opposite spins, in the bonding orbital. Ionizing it leaves one, as in H₂⁺. Schematic energies.'),
    }),
    mcq({
      id: 'cp-curves', difficulty: 2,
      prompt: t`The figure shows the LCAO energies of H₂⁺. An electron in the antibonding orbital meets a proton. What happens?`,
      choices: [
        'The energy only falls as the protons separate, so they fly apart: the antibonding state has no bound molecule',
        'They settle at the bottom of the antibonding curve, a little farther apart than in the bonding state',
        'The electron drops into the bonding orbital on its own, so the molecule always forms',
        'They pass through each other, because the antibonding orbital has a node',
      ],
      answer: 0,
      why: {
        1: 'The antibonding curve has no minimum: its energy falls all the way to large separations.',
        2: 'A drop to the bonding state needs a photon or a collision to carry off the energy; nothing makes it automatic.',
        3: 'The node is in the electron’s wave function, not a hole the protons can pass through; their repulsion grows without limit as they approach.',
      },
      hints: ['Follow the orange curve: which way is downhill?'],
      teach: 'A potential-energy curve with no minimum means the molecule falls apart.',
      explain: 'The antibonding curve slopes down all the way to large R: the system lowers its energy by separating, so a molecule put in that state dissociates. That is how ultraviolet light breaks H₂⁺ apart: it lifts the electron from the bonding to the antibonding curve.',
      visual: curvesH2p({ exact: false }),
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed. (2018), §8.3: the hydrogen molecule ion', url: 'https://doi.org/10.1017/9781316995433' },
    { label: 'Huber & Herzberg, Constants of Diatomic Molecules (via the NIST Chemistry WebBook)', url: 'https://webbook.nist.gov/chemistry/' },
    { label: 'NIST CCCBDB: experimental dipole moments of diatomic molecules', url: 'https://cccbdb.nist.gov/' },
    { label: 'OpenStax University Physics Vol. 3, §9.1–9.2 Types of molecular bonds; molecular spectra', url: 'https://openstax.org/books/university-physics-volume-3/pages/9-1-types-of-molecular-bonds' },
    { label: 'NASA: atomic oxygen erosion of spacecraft materials (MISSE experiments)', url: 'https://www.nasa.gov/missions/station/iss-research/' },
  ],
});
