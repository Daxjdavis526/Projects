// The semi-empirical mass formula, each term from its physics: the Coulomb
// coefficient from the self-energy of a uniformly charged sphere (3/5 of
// Q²/4πε₀R, giving a_C ≈ 0.72 MeV), the asymmetry term from the Fermi gas
// (E_F/3 ≈ 12 MeV, half the fitted value — the rest is the nuclear force’s
// preference for np pairs), pairing from the odd–even mass staggering, and
// the valley of stability from ∂M/∂Z = 0. PHYS 2710 MP13.1 introduced the
// formula, fitted it and used the A = 101 parabola; this lesson derives
// it and does not repeat those examples.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import * as Nu from '../../src/viz/model/qm-nuclear.js';
import { U, M_N, KE2, HBARC, MNC2, AME, mass, r6, seg, label } from './_nuclear.js';

const t = String.raw;
const { aV, aS, aC, aA, aP } = Nu.SEMF;            // Rohlf (1994): 15.75, 17.8, 0.711, 23.7, 11.18 MeV
const DNH = (M_N - AME['H-1'][1]) * U;            // 0.782 MeV
/** The bottom of the valley: the Z that minimizes the atomic mass at fixed A (liquid drop). */
const Z0 = (A, c = aC, a = aA) => (4 * a + DNH + c * A ** (-1 / 3)) / (2 * c * A ** (-1 / 3) + (8 * a) / A);
const ZV = (A, c, a) => `((4*(${a}) + 0.782 + (${c})*(${A})^(-1/3))/(2*(${c})*(${A})^(-1/3) + 8*(${a})/(${A})))`;
const AC_SPHERE = (0.6 * KE2) / 1.2;               // 0.720 MeV
const fermi = (rho) => { const kF = Math.cbrt((3 * Math.PI ** 2 * rho) / 2); return { kF, EF: (HBARC * kF) ** 2 / (2 * MNC2) }; };

/** The most abundant stable isotope of each element (and long-lived thorium-232 and uranium-238): [Z, A]. */
const STABLE = [[1, 1], [2, 4], [3, 7], [4, 9], [5, 11], [6, 12], [7, 14], [8, 16], [9, 19], [10, 20], [11, 23], [12, 24], [13, 27], [14, 28], [15, 31], [16, 32], [17, 35], [18, 40], [19, 39], [20, 40],
  [21, 45], [22, 48], [23, 51], [24, 52], [25, 55], [26, 56], [27, 59], [28, 58], [29, 63], [30, 64], [31, 69], [32, 74], [33, 75], [34, 80], [35, 79], [36, 84], [37, 85], [38, 88], [39, 89], [40, 90],
  [41, 93], [42, 98], [44, 102], [45, 103], [46, 106], [47, 107], [48, 114], [49, 115], [50, 120], [51, 121], [52, 130], [53, 127], [54, 132], [55, 133], [56, 138], [57, 139], [58, 140], [59, 141], [60, 142],
  [62, 152], [63, 153], [64, 158], [65, 159], [66, 164], [67, 165], [68, 166], [69, 169], [70, 174], [71, 175], [72, 180], [73, 181], [74, 184], [75, 187], [76, 192], [77, 193], [78, 195], [79, 197], [80, 202],
  [81, 205], [82, 208], [83, 209], [90, 232], [92, 238]];
/** The beta-stable isobar of some odd mass numbers: A → [Z, name]. */
const ISOBAR = { 27: [13, 'aluminium-27'], 65: [29, 'copper-65'], 89: [39, 'yttrium-89'], 127: [53, 'iodine-127'], 141: [59, 'praseodymium-141'], 159: [65, 'terbium-159'], 175: [71, 'lutetium-175'], 209: [83, 'bismuth-209'] };

// ---- pictures
/** The chart of nuclides: neutrons N against protons Z, the most abundant stable isotopes, N = Z, and the liquid drop’s valley. */
function chart({ c = aC, a = aA, isobar = null, mark = null, extra = {}, caption } = {}) {
  const Zx = ZV('t', c, a);
  return {
    type: 'graph',
    params: {
      x: [0, 100], y: [0, 155], aspect: 'wide', axesAt: 'edge', xlabel: 'protons Z', ylabel: 'neutrons N',
      curves: [
        { fn: 'x', color: 'ink3', width: 1.4, dash: true, label: 'N = Z', labelAt: 88, labelDy: 14 },
        { param: [Zx, `t - ${Zx}`], t: [2, 300], color: 'accent', width: 2.6, label: 'liquid-drop valley', labelAt: 150, labelDx: 12, labelDy: 16 },
        ...(isobar ? [{ fn: `${isobar} - x`, domain: [Math.max(0, isobar - 155), Math.min(100, isobar)], color: 'gold', width: 1.6, dash: true, label: `A = ${isobar}`, labelAt: Math.min(95, Math.max(3, isobar - 145)), labelDx: 8, labelDy: -10 }] : []),
      ],
      points: [...STABLE.map(([Z, A]) => ({ x: Z, y: A - Z, r: 2.6, color: mark && mark[0] === Z && mark[1] === A ? 'gold' : 'good' }))],
      ...extra,
    },
    caption: caption ?? 'Every element’s most abundant stable isotope (green; thorium-232 and uranium-238 are long-lived), with neutrons up and protons across. Light stable nuclei sit on N = Z; heavy ones need ever more neutrons. Blue: the bottom of the liquid drop’s valley, where ∂M/∂Z = 0 at fixed A (pairing left out).',
  };
}

/** Atomic masses of the A = 64 isobars from the liquid drop (two parabolas: even–even below, odd–odd above), with the measured Ni, Cu, Zn. */
const A64 = (() => {
  const A = 64, m = (Z, pair) => (Z * Nu.M_H + (A - Z) * Nu.M_N) * Nu.U_MEV - (aV * A - aS * A ** (2 / 3) - (aC * Z * (Z - 1)) / Math.cbrt(A) - (aA * (A - 2 * Z) ** 2) / A + pair);
  const d = aP / 8, base = m(30, d);
  const par = (s) => `((x*${Nu.M_H} + (64 - x)*${Nu.M_N})*${Nu.U_MEV} - (${aV * A} - ${r6(aS * A ** (2 / 3))} - ${aC}*x*(x - 1)/4 - ${aA}*(64 - 2*x)^2/64 + (${r6(s * d)})) - ${r6(base)})`;
  const meas = (n) => r6((mass(n) - mass('Zn-64')) * U);
  return {
    type: 'graph',
    params: {
      x: [25.5, 33.5], y: [-3, 16], aspect: 'wide', axesAt: 'edge', xlabel: 'protons Z (A = 64 throughout)', ylabel: 'mass energy above zinc-64 (MeV)',
      curves: [{ fn: par(1), color: 'accent', width: 2, dash: true, label: 'even Z, even N', labelAt: 31.4, labelDx: 10, labelDy: 6 }, { fn: par(-1), color: 'warn', width: 2, dash: true, label: 'odd Z, odd N', labelAt: 26.9, labelDx: 10, labelDy: -4 }],
      arrows: [{ from: [29, meas('Cu-64') - 0.15], to: [28.08, meas('Ni-64') + 0.35], color: 'ink2', width: 1.6 }, { from: [29, meas('Cu-64') - 0.15], to: [29.92, 0.35], color: 'ink2', width: 1.6 }],
      points: [
        { x: 28, y: meas('Ni-64'), r: 6, color: 'accent', label: '⁶⁴Ni', labelDx: -10, labelDy: 14, labelAlign: 'right' },
        { x: 29, y: meas('Cu-64'), r: 6, color: 'warn', label: '⁶⁴Cu', labelDx: 0, labelDy: -14, labelAlign: 'center' },
        { x: 30, y: 0, r: 6, color: 'accent', label: '⁶⁴Zn', labelDx: 10, labelDy: 14, labelAlign: 'left' },
      ],
    },
    caption: 'Isobars with A = 64. Dashed: the liquid drop’s two mass parabolas, split by twice the pairing energy. Dots: measured masses (AME2020). Copper-64, odd–odd, sits above both even–even neighbours and decays to each.',
  };
})();

/** Two Fermi wells side by side: neutrons and protons filling levels up to their Fermi energies (schematic). */
function wells({ nN = 7, nZ = 5, caption } = {}) {
  const lv = [], lines = [];
  for (let i = 0; i < nN; i++) lines.push(seg(0.6, 1 + i, 2.4, 1 + i, 'accent', 2));
  for (let i = 0; i < nZ; i++) lines.push(seg(3.6, 1 + i, 5.4, 1 + i, 'warn', 2));
  for (let i = nN; i < 9; i++) lv.push(seg(0.6, 1 + i, 2.4, 1 + i, 'ink4', 1, true));
  for (let i = nZ; i < 9; i++) lv.push(seg(3.6, 1 + i, 5.4, 1 + i, 'ink4', 1, true));
  return {
    type: 'graph',
    params: {
      x: [0, 7], y: [0, 11.2], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [seg(0.4, 0.4, 0.4, 10.4, 'ink3', 1.6), seg(0.4, 0.4, 2.6, 0.4, 'ink3', 1.6), seg(2.6, 0.4, 2.6, 10.4, 'ink3', 1.6),
        seg(3.4, 0.4, 3.4, 10.4, 'ink3', 1.6), seg(3.4, 0.4, 5.6, 0.4, 'ink3', 1.6), seg(5.6, 0.4, 5.6, 10.4, 'ink3', 1.6), ...lines, ...lv],
      points: [label(1.5, 10.6, 'neutrons', 'accent', 0, 0, 'center'), label(4.5, 10.6, 'protons', 'warn', 0, 0, 'center'),
        label(2.6, nN, 'Fermi level', 'accent', 6, 0, 'left'), label(5.6, nZ, 'Fermi level', 'warn', 6, 0, 'left')],
    },
    caption: caption ?? 'Neutrons and protons each fill their own ladder of levels, two to a level (spin up and down). With more neutrons than protons, the extra ones sit higher: that costs energy, the asymmetry term. Schematic: real levels crowd together as the energy rises.',
  };
}

const sphereShells = {
  type: 'graph',
  params: {
    x: [0, 1.15], y: [0, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'shell radius r / R', ylabel: 'energy added per shell (relative)', yticks: 0,
    shade: [{ fn: 'x^4', from: 0, to: 1, color: 'accent', alpha: 0.25 }],
    curves: [{ fn: 'x^4', domain: [0, 1], color: 'accent', width: 2.6, label: '∝ r⁴', labelAt: 0.82, labelDx: -30 }],
    vlines: [{ x: 1, label: 'surface', color: 'ink3' }],
  },
  caption: 'Building a charged ball shell by shell: the energy needed to bring each new shell in from infinity grows as r⁴ (charge already there ∝ r³, shell charge ∝ r², divided by r). The total is the shaded area.',
};

export default lesson({
  id: 'phys3710.N1.2',
  title: 'The semi-empirical mass formula',
  minutes: 18, difficulty: 3,
  intro: t`In [MP13.1](#/lesson/phys2710.MP13.1) you met the liquid-drop formula and fitted it. Here each term earns its place from physics you already know — electrostatics, the Fermi gas, the exclusion principle — and the formula, written for the atomic mass, predicts which isobar is stable:

$$M(A,Z)c^2 = Z M_Hc^2 + N m_nc^2 - \left[a_VA - a_SA^{2/3} - a_C\frac{Z(Z-1)}{A^{1/3}} - a_A\frac{(N-Z)^2}{A} + \delta\right]$$

At fixed $A$ this is a parabola in $Z$. Its lowest point, as $A$ grows, traces the **valley of stability**: the Coulomb term pushes it away from $N = Z$ toward neutron-rich nuclei, the asymmetry term pulls it back.`,
  symbols: [
    { tex: 'M(A,Z)', text: 'the atomic mass of the nuclide with $Z$ protons and $N = A - Z$ neutrons' },
    { tex: 'M_H,\\ m_n', text: t`the masses of a hydrogen atom and a neutron; $(m_n - M_H)c^2 = ${fmt(DNH, 3)}$ MeV` },
    { tex: 'a_V', text: 'the volume coefficient, 15.75 MeV: each nucleon’s binding to its neighbours (saturation)' },
    { tex: 'a_S', text: 'the surface coefficient, 17.8 MeV: binding missing at the surface, whose area grows as $A^{2/3}$' },
    { tex: 'a_C', text: t`the Coulomb coefficient, 0.711 MeV fitted; electrostatics predicts $\tfrac35\,e^2/(4\pi\varepsilon_0R_0) = ${fmt(AC_SPHERE, 3)}$ MeV` },
    { tex: 'a_A', text: 'the asymmetry coefficient, 23.7 MeV: the cost of unequal $N$ and $Z$, half from the Fermi gas and half from the nuclear force' },
    { tex: '\\delta', text: t`the pairing term: $+a_P/\sqrt A$ when $Z$ and $N$ are both even, $-a_P/\sqrt A$ when both odd, 0 otherwise ($a_P = 11.18$ MeV)` },
  ],
  why: 'The valley of stability decides which nuclei exist, how fission fragments decay, where the r-process in merging neutron stars runs, and why a neutron star is made of neutrons.',
  visual: {
    ...chart({
      c: 'aC', a: 'aA',
      extra: {
        sliders: [
          { key: 'aC', label: 'Coulomb $a_C$', min: 0, max: 1.5, step: 0.01, value: 0.71, unit: '\\mathrm{MeV}', explain: 'The protons’ repulsion. It favours fewer protons, so it pushes heavy nuclei to the neutron-rich side.' },
          { key: 'aA', label: 'Asymmetry $a_A$', min: 5, max: 50, step: 0.5, value: 23.5, unit: '\\mathrm{MeV}', explain: 'The cost of unequal numbers of neutrons and protons. It pulls the valley back toward N = Z.' },
        ],
        readouts: [
          { label: t`valley at $A = 238$: $Z_0$`, expr: ZV(238, 'aC', 'aA'), digits: 4 },
          { label: t`$N/Z$ there`, expr: `(238 - ${ZV(238, 'aC', 'aA')})/${ZV(238, 'aC', 'aA')}`, digits: 3 },
        ],
      },
    }),
    title: 'The valley of stability',
    lead: t`Each green dot is a stable nucleus, neutrons up and protons across; the blue curve is where the liquid drop puts the lightest isobar for each mass number. Two terms fight over its shape: the protons’ repulsion and the asymmetry cost.`,
    tasks: [
      'Set the Coulomb coefficient to 0: the valley collapses onto N = Z (just below it — a neutron is heavier than a hydrogen atom). Without repulsion, uranium would have as many protons as neutrons.',
      'Lower the asymmetry coefficient: the valley swings toward neutron-rich nuclei, because nothing now resists trading protons for neutrons.',
      'Restore 0.71 and 23.5 MeV: the curve runs through the dots to uranium, with N/Z near 1.55.',
    ],
  },
  example: {
    prompt: t`(a) Derive the Coulomb coefficient $a_C$ from electrostatics, for a uniformly charged sphere of radius $R = R_0A^{1/3}$, $R_0 = 1.2$ fm. (b) Find where the mass parabola at fixed $A$ has its minimum, $Z_0(A)$, and evaluate it for $A = 197$.`,
    visual: chart({ isobar: 197, mark: [79, 197], caption: 'Stable nuclei (green; gold-197 in gold) and the liquid drop’s valley (blue). The dashed line holds A = 197 fixed: along it, only Z changes.' }),
    steps: [
      { label: 'Build the ball', text: t`Bring charge in shell by shell. With charge $q(r) = Q r^3/R^3$ already inside, adding a shell $dq = 3Qr^2\,dr/R^3$ costs $dU = \dfrac{q(r)\,dq}{4\pi\varepsilon_0 r}$. Integrating, $U = \dfrac{3Q^2}{4\pi\varepsilon_0R^6}\displaystyle\int_0^R r^4\,dr = \tfrac35\,\dfrac{Q^2}{4\pi\varepsilon_0R}$.` },
      { label: 'Count the pairs', text: t`For $Q = Ze$ this counts each proton’s field acting on itself. Only pairs of distinct protons repel, $Z(Z-1)/2$ of them, so $Z^2 \to Z(Z-1)$: $E_C = \tfrac35\,\dfrac{e^2}{4\pi\varepsilon_0R_0}\,\dfrac{Z(Z-1)}{A^{1/3}}$.` },
      { label: 'The coefficient', text: t`$a_C = \tfrac35\times\dfrac{1.440\ \text{MeV fm}}{1.2\ \text{fm}} = ${fmt(AC_SPHERE, 3)}$ MeV. Fits to all masses give 0.711: electrostatics alone gets the term right to about 1%.` },
      { label: 'Minimize the mass', text: t`At fixed $A$, set $\partial M/\partial Z = 0$, with $N - Z = A - 2Z$: $(M_H - m_n)c^2 + a_C\dfrac{2Z - 1}{A^{1/3}} - 4a_A\dfrac{A - 2Z}{A} = 0$, so $Z_0 = \dfrac{4a_A + (m_n - M_H)c^2 + a_CA^{-1/3}}{2a_CA^{-1/3} + 8a_A/A}$.` },
      { label: 'Gold', text: t`For $A = 197$: $A^{-1/3} = ${fmt(197 ** (-1 / 3), 4)}$, so $Z_0 = \dfrac{${fmt(4 * aA, 4)} + 0.782 + ${fmt(aC * 197 ** (-1 / 3), 3)}}{${fmt(2 * aC * 197 ** (-1 / 3), 3)} + ${fmt((8 * aA) / 197, 4)}} = ${fmt(Z0(197), 4)}$.` },
      { label: 'Sense check', text: t`The nearest whole number is 79: gold-197, the only stable nucleus with $A = 197$. Its $N/Z = 118/79 = 1.49$. Without the Coulomb term, $Z_0$ would be $A/2$ (less a hair for the neutron’s extra mass).` },
    ],
    answer: t`$a_C = \tfrac35\,e^2/(4\pi\varepsilon_0R_0) = ${fmt(AC_SPHERE, 3)}$ MeV; $Z_0(197) = ${fmt(Z0(197), 4)}$, which is gold.`,
  },
  practice: [
    expr({
      id: 'sphere-energy', difficulty: 2,
      prompt: t`A ball of radius $R$ is built up from charge spread uniformly, shell by shell. When its radius is $r$ it holds $q = Q r^3/R^3$; the next shell carries $dq = 3Qr^2\,dr/R^3$ and costs $dU = k\,q\,dq/r$, with $k = 1/4\pi\varepsilon_0$. Integrate from $r = 0$ to $R$: what is the total energy $U$?`,
      answer: '3*k*Q^2/(5*R)', answerTeX: t`\frac{3kQ^2}{5R}`,
      vars: { k: [0.5, 2], Q: [0.5, 2], R: [0.5, 2] }, lhs: 'U',
      errors: [{ answer: 'k*Q^2/(2*R)', feedback: t`That is the energy of charge $Q$ spread on the *surface* (a shell), $kQ^2/2R$. A uniform ball has more inside: integrate $r^4$.` }, { answer: 'k*Q^2/R', feedback: t`$\int_0^R r^4\,dr = R^5/5$: the energy comes out as $\tfrac35\,kQ^2/R$, not $kQ^2/R$.` }],
      hints: [t`$dU = k\dfrac{(Qr^3/R^3)(3Qr^2/R^3)}{r}dr = \dfrac{3kQ^2}{R^6}r^4\,dr$.`, t`$\displaystyle\int_0^R r^4\,dr = \dfrac{R^5}{5}$.`],
      teach: 'A uniformly charged sphere stores 3/5 of kQ²/R — the origin of the Coulomb term’s coefficient.',
      explain: t`$U = \dfrac{3kQ^2}{R^6}\cdot\dfrac{R^5}{5} = \tfrac35\,\dfrac{kQ^2}{R}$. With $Q = Ze$, $R = 1.2A^{1/3}$ fm and $ke^2 = 1.440$ MeV fm this is $0.720\,Z^2/A^{1/3}$ MeV — the liquid drop’s Coulomb term (with $Z(Z-1)$ for distinct pairs).`,
      visual: sphereShells,
    }),
    num({
      id: 'fermi', difficulty: 3,
      gen(r) {
        const rho = r.pick([0.15, 0.16, 0.17]), { kF, EF } = fermi(rho), tot = (HBARC * Math.cbrt(3 * Math.PI ** 2 * rho)) ** 2 / (2 * MNC2);
        return {
          prompt: t`Model nuclear matter as a Fermi gas of ${rho} nucleons per fm³, half neutrons and half protons. For the neutrons alone, $k_F = (3\pi^2\rho_n)^{1/3}$ (two spin states per level) and $E_F = (\hbar ck_F)^2/2m_nc^2$. The Fermi gas’s contribution to the asymmetry coefficient is $E_F/3$. What is it, in MeV? ($\hbar c = 197.33$ MeV fm, $m_nc^2 = 939.6$ MeV.)`,
          answer: EF / 3, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: EF, feedback: t`That is the Fermi energy itself; the asymmetry coefficient from the gas is a third of it.` }, { value: tot / 3, feedback: t`Each kind of nucleon fills its own levels: use the neutron density $\rho_n = \rho/2$, not the total.` }],
          hints: [t`$\rho_n = ${rho / 2}\ \text{fm}^{-3}$, so $k_F = (3\pi^2\times${rho / 2})^{1/3}\ \text{fm}^{-1}$.`, t`$k_F = ${fmt(kF, 4)}\ \text{fm}^{-1}$; $E_F = (197.33\times${fmt(kF, 4)})^2/(2\times939.6)$ MeV; then divide by 3.`],
          teach: 'The Fermi gas makes N ≠ Z cost energy — the exclusion principle — and supplies about half the asymmetry coefficient.',
          explain: t`$k_F = ${fmt(kF, 4)}\ \text{fm}^{-1}$, $E_F = ${fmt(EF, 3)}$ MeV, and $E_F/3 = ${fmt(EF / 3, 3)}$ MeV. (Expanding the gas’s kinetic energy $\tfrac35(NE_F^{(n)} + ZE_F^{(p)})$ about $N = Z$ gives $\tfrac13E_F(N - Z)^2/A$.) Fits need about 23.7 MeV: the other half comes from the nuclear force itself, which binds a neutron and a proton more strongly than two like nucleons.`,
          visual: wells(),
        };
      },
    }),
    mcq({
      id: 'asym-rest', difficulty: 3,
      prompt: 'The Fermi gas explains only about 12 MeV of the measured asymmetry coefficient, 23.7 MeV. Where does the rest come from?',
      choices: [
        'The nuclear force depends on the pair: a neutron and a proton attract more strongly than two neutrons or two protons — the deuteron is bound, the dineutron is not',
        'The Coulomb repulsion between protons, which also grows with the number of protons',
        'The surface: neutron-rich nuclei have larger surfaces',
        'A factor of 2 error in the Fermi gas: there are two spin states per level',
      ],
      answer: 0,
      why: {
        1: 'The Coulomb term is separate, and it favours more neutrons, not N = Z. The asymmetry term opposes it.',
        2: 'The surface term depends on A alone; at fixed A, changing N − Z hardly changes the surface.',
        3: t`The two spin states are already in the Fermi-gas result, $k_F = (3\pi^2\rho_n)^{1/3}$; doubling would count them twice.`,
      },
      hints: ['Which simple nucleus of two nucleons is bound, and which are not?', 'The asymmetry term favours N = Z. Which force could prefer unlike pairs?'],
      teach: 'Half the asymmetry energy is kinetic (Fermi gas), half is potential: the nuclear force prefers neutron–proton pairs.',
      explain: 'The deuteron (np) is bound by 2.22 MeV; neither the dineutron (nn) nor the diproton (pp) is bound at all. The nuclear force is strongest between unlike nucleons in the spin and isospin states nuclei allow, so the potential energy, like the kinetic, is lowest near N = Z. Together they give the 23–24 MeV the fits demand.',
      visual: wells({ caption: 'Neutron and proton levels filled to different heights (schematic). The kinetic cost of the imbalance is about half the asymmetry energy; the nuclear force supplies the rest.' }),
    }),
    num({
      id: 'valley', difficulty: 2,
      gen(r) {
        const A = r.pick(Object.keys(ISOBAR).map(Number)), [Zs, name] = ISOBAR[A], z = Z0(A);
        return {
          prompt: t`Using $Z_0 = \dfrac{4a_A + (m_n - M_H)c^2 + a_CA^{-1/3}}{2a_CA^{-1/3} + 8a_A/A}$ with $a_A = 23.7$ MeV, $a_C = 0.711$ MeV and $(m_n - M_H)c^2 = 0.782$ MeV, where does the bottom of the valley lie for $A = ${A}$? Give $Z_0$ to two decimal places.`,
          answer: z, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: A / 2, feedback: t`$A/2$ is the valley without the Coulomb term. Put in the numbers: the repulsion pulls $Z_0$ well below $A/2$.` }],
          hints: [t`$A^{-1/3} = ${fmt(A ** (-1 / 3), 4)}$.`, t`Numerator: $94.8 + 0.782 + 0.711\times${fmt(A ** (-1 / 3), 4)}$; denominator: $2\times0.711\times${fmt(A ** (-1 / 3), 4)} + 8\times23.7/${A}$.`],
          teach: 'At fixed A the mass is a parabola in Z; its minimum Z₀(A) traces the valley of stability.',
          explain: t`$Z_0 = ${fmt(z, 4)}$. The stable nucleus with $A = ${A}$ is ${name}, $Z = ${Zs}$${Math.round(z) === Zs ? ' — the nearest whole number, as the formula says.' : t` — the formula’s valley lies ${fmt(Math.abs(z - Zs), 2)} away, and rounding would pick the wrong neighbour. Shell effects, which the liquid drop leaves out, shift the real minimum.`} Note $N/Z = ${fmt((A - z) / z, 3)}$.`,
          visual: chart({ isobar: A, caption: `Stable nuclei (green) and the liquid drop’s valley (blue). The dashed gold line holds A = ${A} fixed.` }),
        };
      },
    }),
    mcq({
      id: 'odd-odd', difficulty: 2,
      prompt: 'Copper-64 (29 protons, 35 neutrons) is radioactive with a 12.7-hour half-life. It decays both by β⁻ to zinc-64 (39%) and by electron capture or β⁺ to nickel-64 (61%). Why can it go both ways?',
      choices: [
        'It is odd–odd, so it lies on the upper of the two mass parabolas: both even–even neighbours are lighter, and decay is downhill either way',
        'It is the heaviest isobar with A = 64, so every decay is downhill',
        'β⁻ and β⁺ decay are the same process seen from different frames',
        'It has too many neutrons and too many protons at the same time',
      ],
      answer: 0,
      why: {
        1: 'Iron-64, gallium-64 and germanium-64 are far heavier. Copper-64 sits near the bottom of the valley, yet still above both neighbours.',
        2: 'They are different processes: one turns a neutron into a proton, the other a proton into a neutron.',
        3: 'Its N/Z of 1.21 is very close to the valley; it is not far off on either side. Pairing, not imbalance, makes it unstable.',
      },
      hints: ['Look at the picture: which parabola is copper-64 on?', t`The pairing term lowers even–even nuclei by $a_P/\sqrt A$ and raises odd–odd ones by the same.`],
      teach: 'Pairing splits even-A isobars into two parabolas; odd–odd nuclei on the upper one can decay downhill to both sides.',
      explain: t`Even-$A$ isobars sit on two parabolas separated by $2a_P/\sqrt A = ${fmt((2 * aP) / 8, 3)}$ MeV at $A = 64$. Copper-64 (odd–odd) is ${fmt((mass('Cu-64') - mass('Zn-64')) * U, 3)} MeV above zinc-64 and ${fmt((mass('Cu-64') - mass('Ni-64')) * U, 3)} MeV above nickel-64 (AME2020), so it can decay to either. That is why only four odd–odd nuclei are stable — hydrogen-2, lithium-6, boron-10 and nitrogen-14, all light, where the liquid drop does not apply — plus tantalum-180m, an excited state never yet seen to decay.`,
      visual: A64,
    }),
    num({
      id: 'semf-B', difficulty: 2,
      gen(r) {
        const key = r.pick(['Ca-40', 'Co-59', 'Co-60', 'Ni-62', 'Kr-84', 'Ag-107', 'I-127', 'Sn-120']), n = Nu.byName[key], s = Nu.semf(n.Z, n.A);
        const kind = s.pair > 0 ? 'even–even' : s.pair < 0 ? 'odd–odd' : 'odd-A';
        return {
          prompt: t`Use the liquid drop with $a_V = 15.75$, $a_S = 17.8$, $a_C = 0.711$, $a_A = 23.7$ and $a_P = 11.18$ MeV to predict the binding energy of ${key} ($Z = ${n.Z}$, $N = ${n.N}$, ${kind}), in MeV.`,
          answer: s.B, units: 'MeV', tol: { rel: 0.0004 },
          errors: [
            ...(s.pair !== 0 ? [{ value: s.B - s.pair, feedback: t`Include the pairing term: $\delta = ${s.pair > 0 ? '+' : '-'}a_P/\sqrt A$ for an ${kind} nucleus.` }, { value: s.B - 2 * s.pair, feedback: t`Check the pairing sign: even–even nuclei gain $+a_P/\sqrt A$, odd–odd lose it.` }] : []),
            { value: s.B + 2 * s.coul, feedback: 'Subtract the Coulomb term: the protons’ repulsion reduces the binding.' },
          ].filter((e) => Math.abs(e.value - s.B) > 0.0012 * s.B),
          hints: [t`Terms: $a_VA$, $a_SA^{2/3}$, $a_CZ(Z-1)/A^{1/3}$, $a_A(N - Z)^2/A$ and $\delta$; only the first and $\delta$ (if positive) add.`, t`Volume ${fmt(s.vol, 5)}, surface ${fmt(s.surf, 4)}, Coulomb ${fmt(s.coul, 4)}, asymmetry ${fmt(s.asym, 3)}, pairing ${fmt(s.pair, 3)} MeV.`],
          teach: 'The five terms of the liquid drop predict binding energies to within about 1% for medium and heavy nuclei.',
          explain: t`$B = ${fmt(s.vol, 5)} - ${fmt(s.surf, 4)} - ${fmt(s.coul, 4)} - ${fmt(s.asym, 3)} ${s.pair >= 0 ? '+' : '-'} ${fmt(Math.abs(s.pair), 3)} = ${fmt(s.B, 5)}$ MeV. The measured value is $${fmt(Nu.binding(n), 5)}$ MeV: a miss of ${fmt(Math.abs(s.B - Nu.binding(n)), 2)} MeV, ${fmt((Math.abs(s.B - Nu.binding(n)) / Nu.binding(n)) * 100, 2)}%. The volume term alone overshoots by a third; the surface takes back most of that.`,
          visual: { type: 'qm-binding', params: { nuclide: key, controls: false, readout: false, semf: true, labels: false, hide: ['B'] }, caption: 'Binding energy per nucleon from measured masses (dots) and the liquid drop (dashed). The nucleus in the question is gold.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gravity', difficulty: 4, transfer: true,
      prompt: t`Why can a neutron star be made of neutrons when no nucleus can? Pure neutron matter has no Coulomb term but pays the asymmetry cost: in the liquid drop its binding per neutron is $a_V - a_A = 15.75 - 23.7 = -7.95$ MeV — unbound. Gravity can make up the deficit for a large enough ball: set the gravitational binding $\tfrac35\,G(Am_n)^2/R$, with $R = 1.2A^{1/3}$ fm, equal to $7.95A$ MeV. What is the smallest such mass, in solar masses? ($G = 6.674\times10^{-11}$ SI, $m_n = 1.675\times10^{-27}$ kg, $1\ \text{MeV} = 1.602\times10^{-13}$ J, $M_\odot = 1.988\times10^{30}$ kg; ignore the surface term.)`,
      answer: (() => { const A = ((5 * (aA - aV) * 1.602176634e-13 * 1.2e-15) / (3 * 6.6743e-11 * 1.67492750056e-27 ** 2)) ** 1.5; return (A * 1.67492750056e-27) / 1.98841e30; })(),
      units: 'Msun', tol: { rel: 0.02 },
      hints: [t`$\tfrac35\,\dfrac{Gm_n^2A^2}{R_0A^{1/3}} = 7.95\,\text{MeV}\times A$ gives $A^{2/3} = \dfrac{5\times7.95\ \text{MeV}\times R_0}{3Gm_n^2}$.`, t`$A^{2/3} = ${tex((5 * 7.95 * 1.602176634e-13 * 1.2e-15) / (3 * 6.6743e-11 * 1.67492750056e-27 ** 2), 3)}$, so $A = (A^{2/3})^{3/2}$; then $M = Am_n$.`],
      teach: 'Gravity can bind neutron matter only for an enormous number of nucleons — stellar masses, not nuclear ones.',
      explain: t`$A^{2/3} = ${tex((5 * 7.95 * 1.602176634e-13 * 1.2e-15) / (3 * 6.6743e-11 * 1.67492750056e-27 ** 2), 3)}$, $A \approx 5\times10^{55}$ and $M \approx 0.04\,M_\odot$. A rough estimate — it stretches the liquid drop far beyond the nuclei it was fitted to, and leaves out the protons and electrons a real star keeps — but it lands near the 0.1 solar masses detailed calculations give for the lightest possible neutron star. Every well-measured one is above about 1.1 solar masses, because they are born in collapsing stellar cores.`,
      visual: chart({ caption: 'Stable nuclei and the liquid drop’s valley. Pure neutron matter would sit on the vertical axis, Z = 0, far off the chart’s valley — unbound unless gravity holds it.' }),
    }),
    num({
      id: 'cp-z0', difficulty: 3,
      prompt: t`Nuclear reactors breed fuel through the A = 239 isobars: uranium-239 ($Z = 92$) decays by β⁻ to neptunium-239 ($Z = 93$), which decays by β⁻ again. Using the liquid drop’s $Z_0(A)$ with $a_A = 23.7$ MeV, $a_C = 0.711$ MeV and $(m_n - M_H)c^2 = 0.782$ MeV, where is the bottom of the A = 239 valley? Give $Z_0$ to two decimal places.`,
      answer: Z0(239), tol: { rel: 0, abs: 0.02 },
      errors: [{ value: 239 / 2, feedback: 'A/2 leaves out the Coulomb term entirely.' }],
      hints: [t`$A^{-1/3} = ${fmt(239 ** (-1 / 3), 4)}$.`, t`$Z_0 = \dfrac{94.8 + 0.782 + 0.711\times${fmt(239 ** (-1 / 3), 4)}}{2\times0.711\times${fmt(239 ** (-1 / 3), 4)} + 8\times23.7/239}$.`],
      teach: 'Beta decays step along an isobar toward Z₀(A): neutron-rich fission and capture products climb toward the valley.',
      explain: t`$Z_0 = ${fmt(Z0(239), 4)}$, so the chain stops at $Z = 94$: plutonium-239, the fissile fuel made in every uranium reactor ($n + {}^{238}\text{U} \to {}^{239}\text{U} \to {}^{239}\text{Np} \to {}^{239}\text{Pu}$). Plutonium-239 is stable against beta decay; it is the alpha decay, with a 24 110-year half-life, that it cannot escape.`,
      visual: chart({ isobar: 239, caption: 'The A = 239 isobar (dashed gold) crossing the liquid drop’s valley (blue) among the stable nuclei.' }),
    }),
    mcq({
      id: 'cp-bend', difficulty: 2,
      prompt: 'Light stable nuclei have N = Z, but lead-208 has 126 neutrons and only 82 protons. Which term of the mass formula bends the valley toward neutron-rich nuclei?',
      choices: [
        'The Coulomb term: it grows as Z², so replacing protons with neutrons lowers the energy once Z is large, at the asymmetry term’s expense',
        'The asymmetry term, which favours more neutrons',
        'The surface term, which is smaller for neutrons',
        'The volume term: neutrons bind more strongly than protons',
      ],
      answer: 0,
      why: {
        1: 'The asymmetry term is symmetric in N and Z: it favours N = Z and pulls the valley back toward it.',
        2: 'The surface term depends only on A, not on how A splits into N and Z.',
        3: 'The volume term depends only on A; the strong force treats neutrons and protons alike.',
      },
      hints: ['Which term treats protons and neutrons differently?', 'Which term grows faster than A as nuclei get heavier?'],
      teach: t`The Coulomb term, growing as $Z^2/A^{1/3}$, pushes heavy nuclei to $N > Z$; the asymmetry term resists.`,
      explain: t`The only term that distinguishes protons from neutrons, apart from the 0.782 MeV mass difference, is the Coulomb repulsion. It grows as $Z^2/A^{1/3}$, faster than the asymmetry cost of a neutron excess, so heavy nuclei settle at $N/Z \approx 1.5$. With $a_C = 0$ the valley would follow $N = Z$ all the way up.`,
      visual: chart(),
    }),
  ],
  sources: [
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), §3.3 (the semi-empirical mass formula) and §4.4 (the shell model)', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'Rohlf, Modern Physics from α to Z⁰ (Wiley, 1994): the coefficients used here', url: 'https://www.wiley.com/en-us/Modern+Physics+from+a+to+Z0-p-9780471572701' },
    { label: 'Wang et al. (2021), The AME 2020 atomic mass evaluation (II), Chinese Physics C 45, 030003', url: 'https://doi.org/10.1088/1674-1137/abddaf' },
  ],
});
