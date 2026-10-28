// X-ray spectra — a vacancy in the K shell filled from L gives the Kα line;
// the falling electron sees the nucleus screened by the one 1s electron left,
// so E(Kα) ≈ (3/4)(13.6 eV)(Z − 1)²: Moseley’s law (1913), which made the
// atomic number the nuclear charge. Real Kα₁ energies (Bearden, via the X-ray
// Data Booklet), copper and molybdenum tubes, the nickel filter and K
// absorption edges, a numpy.polyfit of √E against Z, the relativistic
// curvature at high Z, and X-ray fluorescence on Mars (PIXL on Perseverance).
// Every number is computed here or in _atoms.js.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { HC_EVNM } from './_constants.js';
import { RYD } from './_quanta.js';
import * as S from '../../src/viz/model/mp-shells.js';
import { KALPHA1, KBETA1, K_EDGE, moseleyKeV, xrayLevels, xrfSpectrum, seg, label, frame, r6 } from './_atoms.js';

const t = String.raw;
const A = Math.sqrt((0.75 * RYD) / 1000);            // √keV per unit of Z: Moseley’s slope
const name = (Z) => S.element(Z).name;
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const ZS = Object.keys(KALPHA1).map(Number);
const FIT = ZS.filter((z) => z <= 30);               // the coding exercise’s data: sodium to zinc
const fitLine = (() => {                              // least squares √E = a Z + b over FIT (checked against numpy in the exercise)
  const x = FIT, y = FIT.map((z) => Math.sqrt(KALPHA1[z])), n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
  const a = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / x.reduce((s, v) => s + (v - mx) ** 2, 0);
  return { a, b: my - a * mx };
})();
const SIGMA_FIT = -fitLine.b / fitLine.a, C_FIT = (fitLine.a ** 2 * 1000) / RYD;
const CU = 29, MO = 42;

/** Moseley’s plot: √E against Z for the real Kα₁ lines, optionally with the line for screening σ. */
function moseleyPlot({ sigma = null, marks = [], ask = null, x = [8, 84], y = [0, 9], caption } = {}) {
  const points = ZS.filter((z) => z >= x[0] && z <= x[1]).map((z) => ({ x: z, y: r6(Math.sqrt(KALPHA1[z])), r: ask === z ? 0 : 3.6, color: 'accent' }));
  for (const [z, txt, dx = 8, dy = -10] of marks) points.push(label(z, Math.sqrt(KALPHA1[z]), txt, 'ink2', dx, dy, dx < 0 ? 'right' : 'left'));
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel: 'atomic number Z', ylabel: '√(E / keV)', axesAt: 'edge',
      curves: sigma === null ? [] : [{ fn: `${r6(A)}*(x - ${sigma})`, color: 'gold', width: 2 }],
      points,
    },
    caption: caption ?? 'Measured Kα₁ energies (Bearden 1967, X-ray Data Booklet) of a selection of elements, plotted as √E against Z.',
  };
}

// a Martian basalt’s fluorescence peaks (Kα, keV) with illustrative heights
const BASALT = [[1.0410, 0.25, 'Na'], [1.2536, 0.35, 'Mg'], [1.4867, 0.5, 'Al'], [1.7400, 1.0, 'Si'], [2.3078, 0.3, 'S'], [2.6224, 0.2, 'Cl'], [3.3138, 0.2, 'K'], [3.6917, 0.75, 'Ca'], [4.5108, 0.22, 'Ti'], [5.4147, 0.1, 'Cr'], [5.8988, 0.14, 'Mn'], [6.4038, 1.1, 'Fe'], [7.0580, 0.16, ''], [7.4782, 0.08, 'Ni'], [8.6389, 0.06, 'Zn']];

export default lesson({
  id: 'phys2710.MP9.3',
  title: 'X-ray spectra',
  minutes: 15, difficulty: 3,
  intro: t`Knock a 1s electron out of a heavy atom — with a fast electron in an X-ray tube, an X-ray, or an alpha particle — and an electron from a higher shell drops into the vacancy, emitting an X-ray whose energy belongs to that element alone. The strongest line, **Kα**, comes from an $n = 2$ (L-shell) electron falling into the $n = 1$ (K) shell. On the way it sees the nucleus screened by the one 1s electron still there, so Bohr’s formula with charge $Z - 1$ gives

$$E_{K\alpha} \approx \tfrac34\,(13.6\ \text{eV})\,(Z - 1)^2$$

In 1913 Henry Moseley measured these lines for elements from aluminium to gold and found $\sqrt{f}$ rising in a straight line with an element’s place in the table. The atomic number $Z$ is the charge of the nucleus, not just a ranking — and the line had gaps at $Z$ = 43, 61, 72 and 75, elements nobody had yet found.

> X-ray tubes and their characteristic lines came in [X-rays and Compton scattering](#/lesson/phys2710.MP4.2). Here: why each element’s lines sit where they do.`,
  symbols: [
    { tex: 'E_{K\\alpha}', text: 'the energy of the Kα photon, emitted when an L electron fills a K vacancy; for copper about 8 keV' },
    { tex: 'Z', text: 'the atomic number: the nuclear charge in units of $e$' },
    { tex: 'Z - 1', text: 'the charge the falling electron sees: the one remaining 1s electron screens one unit of it (a teaching model; the screening is about 1 only for middling $Z$)' },
    { tex: '\\tfrac34', text: t`$\dfrac{1}{1^2} - \dfrac{1}{2^2}$: the Bohr energies of $n = 1$ and $n = 2$ for a single electron` },
    { tex: '13.6\\ \\text{eV}', text: t`the Rydberg energy $R_\infty hc = ${fmt(RYD, 6)}$ eV` },
  ],
  why: 'Characteristic X-rays identify elements without touching them — in steel mills, museums and on Mars — and copper’s and molybdenum’s Kα lines are the light by which nearly every crystal structure is measured.',
  visual: {
    type: 'graph',
    title: 'Moseley’s plot',
    lead: t`Each dot is a measured Kα line, plotted as $\sqrt{E}$ against $Z$: they fall on a nearly straight line, as Moseley found. The gold line is $\sqrt{E} = \sqrt{\tfrac34(13.6\ \text{eV})}\,(Z - \sigma)$ for a screening $\sigma$ that you choose.`,
    tasks: [
      'At σ = 0 — an unscreened nucleus — the line runs just above every dot, and the predicted copper Kα is 8.58 keV, 7% too high. Slide σ to 1, one screening electron: the line runs through the dots and the prediction falls to 8.00 keV.',
      'With σ = 1, read molybdenum: predicted 17.15 keV, measured 17.48 keV. The dots have begun to curve upward away from the line.',
      'Find the empty column at Z = 43. Element 43, technetium, has no stable isotope and was unknown in 1913 — but the line already said where its Kα had to be.',
    ],
    params: {
      ...moseleyPlot({ x: [8, 52], y: [0, 5.3], marks: [[11, 'Na', 8, 12], [20, 'Ca', 8, 12], [26, 'Fe', 8, 12], [29, 'Cu', 8, 12], [42, 'Mo', 8, 12], [47, 'Ag', 8, 12]] }).params,
      sliders: [{ key: 's', label: 'Screening $\\sigma$', min: -1, max: 3, step: 0.05, value: 0, unit: '', explain: 'How many units of nuclear charge the inner electrons cancel for the falling L electron.' }],
      curves: [{ fn: `${r6(A)}*(x - s)`, color: 'gold', width: 2 }],
      readouts: [{ label: 'predicted copper $K\\alpha$', expr: `${r6(A * A)}*(29 - s)^2`, unit: '\\mathrm{keV}', digits: 4 }, { label: 'measured', expr: `${KALPHA1[CU]}`, unit: '\\mathrm{keV}', digits: 4 }, { label: 'predicted molybdenum', expr: `${r6(A * A)}*(42 - s)^2`, unit: '\\mathrm{keV}', digits: 4 }, { label: 'measured', expr: `${KALPHA1[MO]}`, unit: '\\mathrm{keV}', digits: 4 }],
    },
    caption: 'Measured Kα₁ energies (Bearden 1967, from the X-ray Data Booklet) of a selection of elements from sodium to silver; the gold line is Moseley’s law for the screening chosen. Each Kα is really a close doublet, Kα₁ and Kα₂, split by the electron’s spin–orbit interaction; only Kα₁ is plotted.',
  },
  example: {
    prompt: t`Predict the energy and wavelength of copper’s Kα line ($Z = 29$), and compare with the measured Kα₁ line, ${fmt(KALPHA1[CU], 4)} keV.`,
    visual: xrayLevels({ show: ['ka'], caption: 'A vacancy in copper’s K shell (red) filled by an L electron: the Kα line. Schematic, not to scale.' }),
    steps: [
      { label: 'The vacancy', text: t`An electron from the tube knocks out one of copper’s two 1s electrons. An L-shell ($n = 2$) electron drops into the hole and emits the difference in energy as one X-ray photon.` },
      { label: 'What it sees', text: t`Inside the L shell, the falling electron feels the nucleus ($+29e$) screened by the one 1s electron left: about $Z - 1 = 28$. The electrons farther out hardly change the field inside.` },
      { label: 'Bohr with Z minus 1', text: t`$E = (Z - 1)^2(13.6\ \text{eV})\left(\dfrac{1}{1^2} - \dfrac{1}{2^2}\right) = 784 \times 13.61\ \text{eV} \times 0.75 = ${fmt(moseleyKeV(CU) * 1000, 4)}$ eV $= ${fmt(moseleyKeV(CU), 3)}$ keV.` },
      { label: 'The wavelength', text: t`$\lambda = hc/E = 1239.8\ \text{eV nm}/${fmt(moseleyKeV(CU) * 1000, 4)}\ \text{eV} = ${fmt(HC_EVNM / (moseleyKeV(CU) * 1000), 3)}$ nm $= ${fmt(HC_EVNM / moseleyKeV(CU), 3)}$ pm.` },
      { label: 'Compare', text: t`Measured: Kα₁ at ${fmt(KALPHA1[CU], 4)} keV, or $${fmt((1000 * HC_EVNM) / (KALPHA1[CU] * 1000), 5)}$ pm — the wavelength of nearly every laboratory X-ray diffractometer. Moseley’s estimate is ${fmt(100 * (1 - moseleyKeV(CU) / KALPHA1[CU]), 2)}% low: the screening is not exactly 1.` },
      { label: 'Sense check', text: t`Energies grow as $(Z - 1)^2$. Molybdenum ($Z = 42$) should be $(41/28)^2 = ${fmt((41 / 28) ** 2, 3)}$ times copper’s; measured, ${fmt(KALPHA1[MO], 4)}/${fmt(KALPHA1[CU], 4)} $= ${fmt(KALPHA1[MO] / KALPHA1[CU], 3)}$.` },
    ],
    answer: t`$E_{K\alpha} \approx ${fmt(moseleyKeV(CU), 3)}$ keV and $\lambda \approx ${fmt(HC_EVNM / moseleyKeV(CU), 3)}$ pm, against the measured ${fmt(KALPHA1[CU], 4)} keV (${fmt(HC_EVNM / KALPHA1[CU], 4)} pm).`,
  },
  practice: [
    num({
      id: 'predict', difficulty: 1,
      gen(r) {
        const Z = r.pick([22, 24, 26, 27, 30, 38, 47]), E = moseleyKeV(Z);
        return {
          prompt: t`Use Moseley’s law to predict the energy of the Kα line of ${name(Z)} ($Z = ${Z}$), in keV.`,
          answer: E, units: 'keV', tol: { rel: 0.005 },
          errors: [{ value: moseleyKeV(Z + 1), feedback: t`Use $(Z - 1)^2$, not $Z^2$: one 1s electron is left to screen the nucleus.` }, { value: (RYD * (Z - 1) ** 2) / 1000, feedback: t`Kα goes from $n = 2$ to $n = 1$: multiply by $\tfrac{1}{1^2} - \tfrac{1}{2^2} = \tfrac34$.` }],
          hints: [t`$E_{K\alpha} \approx \tfrac34(13.6\ \text{eV})(Z - 1)^2$.`, t`$(Z - 1)^2 = ${(Z - 1) ** 2}$; multiply by $10.2$ eV.`],
          teach: 'Moseley’s law: a Kα photon carries about (3/4)(13.6 eV)(Z − 1)².',
          explain: t`$E = 0.75 \times 13.61\ \text{eV} \times ${(Z - 1) ** 2} = ${fmt(E, 4)}$ keV. Measured (Kα₁): ${fmt(KALPHA1[Z], 4)} keV, ${fmt(100 * Math.abs(1 - E / KALPHA1[Z]), 2)}% away.`,
          visual: xrayLevels({ show: ['ka'], ask: 'ka', caption: `The Kα transition in ${name(Z)}: an L electron fills a K vacancy. Schematic, not to scale.` }),
        };
      },
    }),
    mcq({
      id: 'why-z-1', difficulty: 2,
      prompt: t`Why does Moseley’s law have $(Z - 1)^2$ rather than $Z^2$?`,
      choices: [
        'The falling L electron sees the nuclear charge partly cancelled by the one 1s electron still in the K shell',
        'The atom has lost a proton when its K electron is knocked out',
        'The falling electron’s own charge must be subtracted from the nucleus',
        'One unit of charge accounts for the neutrons in the nucleus',
      ],
      answer: 0,
      why: {
        1: 'Knocking out an electron leaves the nucleus untouched: Z protons remain.',
        2: 'A charge exerts no force on itself; the falling electron feels only the nucleus and the other electrons.',
        3: 'Neutrons are uncharged and play no part in the electron’s energy (apart from a minute isotope shift).',
      },
      hints: ['Before the jump, how many electrons are left in the K shell, and where are they relative to the L shell?'],
      teach: 'Kα is a hydrogen-like jump in a field screened by the single remaining 1s electron, hence Z − 1.',
      explain: 'One 1s electron remains. Its cloud lies mostly inside the L shell, so for the falling electron it cancels about one unit of the nuclear charge. Electrons farther out do little. The fit to real data gives a screening of about 0.95 for sodium to zinc.',
      visual: xrayLevels({ show: ['ka'], caption: 'A K vacancy (red) beside the one remaining 1s electron (blue), filled from L: the Kα line. Schematic.' }),
    }),
    num({
      id: 'identify', difficulty: 2,
      gen(r) {
        const Z = r.pick([23, 25, 28, 29, 34, 40, 46]), E = KALPHA1[Z];
        const z = 1 + Math.sqrt((E * 1000) / (0.75 * RYD));
        return {
          prompt: t`A metal foil in an electron beam emits its strongest X-ray line at ${fmt(E, 4)} keV. Use Moseley’s law to find its atomic number.`,
          answer: Z, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Z - 1, feedback: t`Moseley’s law gives $Z - 1 = \sqrt{E/(10.2\ \text{eV})}$: add the 1 back.` }],
          hints: [t`Invert: $Z - 1 = \sqrt{E/(\tfrac34 \times 13.6\ \text{eV})}$.`, t`$\sqrt{${fmt(E * 1000, 4)}/10.20} = ${fmt(z - 1, 3)}$, so $Z - 1 \approx$ that, rounded to a whole number.`],
          teach: 'Run Moseley’s law backwards — Z = 1 + √(E/10.2 eV) — and round: the element is identified by its Kα energy.',
          explain: t`$Z = 1 + \sqrt{${fmt(E * 1000, 4)}\ \text{eV}/10.20\ \text{eV}} = ${fmt(z, 3)}$, so $Z = ${Z}$: ${name(Z)}. The estimate lands within a few tenths of a whole number, which is all the identification needs.`,
          visual: xrfSpectrum([[E, 1, ''], [KBETA1[Z] ?? 1.104 * E, 0.17, '']], { x: [Math.floor(E * 0.7), Math.ceil(E * 1.25)], caption: 'The foil’s X-ray spectrum: the strong Kα line and the weaker Kβ just above it. Heights illustrative.' }),
        };
      },
    }),
    mcq({
      id: 'cobalt-nickel', difficulty: 2,
      prompt: 'Cobalt atoms (58.93 u on average) are heavier than nickel atoms (58.69 u), so a table ordered by mass would put nickel first. Moseley’s X-ray lines put cobalt first. What did that show?',
      choices: [
        'The table is ordered by nuclear charge Z, which the Kα energy measures directly; atomic mass only roughly follows Z',
        'The masses were mismeasured, and cobalt is really lighter than nickel',
        'Cobalt has more neutrons, and neutrons lower the energy of its X-ray lines',
        'The X-ray energies follow the mass number, which is smaller for cobalt',
      ],
      answer: 0,
      why: {
        1: 'The masses were right: natural cobalt (all cobalt-59) is heavier than natural nickel (mostly nickel-58).',
        2: 'Neutrons are uncharged: the Kα energy depends on the nuclear charge, not on the neutrons (apart from a minute isotope shift).',
        3: 'Cobalt-59 has a larger mass number than nickel-58. The lines follow the charge.',
      },
      hints: ['What does a Kα energy depend on, according to Moseley’s law?'],
      teach: 'Moseley’s law measures the nuclear charge directly, so it settles the order of the table where atomic masses mislead.',
      explain: t`The Kα energies of iron, cobalt, nickel and copper step evenly along $\sqrt{E} \propto Z - 1$, with cobalt at 27 and nickel at 28. Moseley thus fixed the order of cobalt and nickel (and of argon and potassium) by charge, and showed where the missing elements had to go.`,
      visual: moseleyPlot({ sigma: 1, x: [22.5, 31.5], y: [2, 3.1], marks: [[24, 'Cr'], [25, 'Mn'], [26, 'Fe'], [27, 'Co'], [28, 'Ni'], [29, 'Cu'], [30, 'Zn']], caption: 'Measured Kα₁ energies of chromium to zinc as √E against Z, with Moseley’s line (σ = 1): evenly spaced, cobalt before nickel.' }),
    }),
    mcq({
      id: 'nickel-filter', difficulty: 2,
      prompt: t`A copper X-ray tube gives Kα at ${fmt(KALPHA1[CU], 4)} keV and Kβ at ${fmt(KBETA1[CU], 4)} keV. A crystallographer wants Kα alone, and puts a thin metal foil in the beam to absorb Kβ. A foil absorbs strongly only above its K edge — the energy needed to eject its own 1s electrons. Which foil works? (K edges: iron ${fmt(K_EDGE[26], 4)}, cobalt ${fmt(K_EDGE[27], 4)}, nickel ${fmt(K_EDGE[28], 4)}, copper ${fmt(K_EDGE[29], 4)} keV.)`,
      choices: ['nickel', 'iron', 'cobalt', 'copper'],
      answer: 0,
      why: {
        1: 'Iron’s edge (7.11 keV) lies below both lines, so iron absorbs Kα strongly too.',
        2: 'Cobalt’s edge (7.71 keV) lies below both lines, so cobalt absorbs Kα strongly too.',
        3: 'Copper’s edge (8.98 keV) lies above both lines: copper is fairly transparent to its own X-rays — which is why the tube’s window can pass them.',
      },
      hints: ['You need an edge between the two lines: above Kα, below Kβ.'],
      teach: 'An element absorbs X-rays strongly just above its K edge, so a foil with its edge between Kα and Kβ passes one and stops the other.',
      explain: t`Nickel’s edge, ${fmt(K_EDGE[28], 4)} keV, sits between copper’s Kα (${fmt(KALPHA1[CU], 3)}) and Kβ (${fmt(KBETA1[CU], 3)} keV): Kβ photons can eject nickel’s 1s electrons and are absorbed, Kα photons cannot. By Moseley’s law the edge of element $Z - 1$ always falls in this gap, which is why molybdenum tubes use zirconium ($Z = 40$) filters.`,
      visual: xrfSpectrum([[KALPHA1[CU], 1, 'Kα'], [KBETA1[CU], 0.2, 'Kβ']], { x: [6.5, 9.5], caption: 'A copper tube’s characteristic lines (the bremsstrahlung continuum is not drawn). Heights illustrative.' }),
    }),
    num({
      id: 'tube-wavelength', difficulty: 2,
      gen(r) {
        const [Z, use] = r.pick([[24, 'measuring stress in steel'], [27, 'iron-rich samples, which would fluoresce under copper radiation'], [42, 'single-crystal diffraction'], [47, 'high-pressure diffraction in diamond cells']]);
        const lam = (1000 * HC_EVNM) / (moseleyKeV(Z) * 1000);
        return {
          prompt: t`X-ray tubes with ${name(Z)} targets ($Z = ${Z}$) are used for ${use}. Use Moseley’s law to predict the wavelength of their Kα line, in pm.`,
          answer: lam, units: 'pm', tol: { rel: 0.005 },
          errors: [{ value: (1000 * HC_EVNM) / (moseleyKeV(Z + 1) * 1000), feedback: t`Use $(Z - 1)^2$: one 1s electron screens the nucleus.` }],
          hints: [t`First the energy: $E \approx \tfrac34(13.6\ \text{eV})(Z - 1)^2$.`, t`Then $\lambda = hc/E$ with $hc = 1239.8$ eV nm $= 1.2398\times10^{6}$ eV pm.`],
          teach: 'Moseley’s energy and λ = hc/E give each target’s Kα wavelength; heavier targets give shorter wavelengths.',
          explain: t`$E = 10.20\ \text{eV} \times ${(Z - 1) ** 2} = ${fmt(moseleyKeV(Z), 4)}$ keV, so $\lambda = ${fmt(lam, 4)}$ pm. Measured Kα₁: $${fmt((1000 * HC_EVNM) / (KALPHA1[Z] * 1000), 4)}$ pm.`,
          visual: moseleyPlot({ sigma: 1, ask: Z, caption: 'Moseley’s plot with the line for σ = 1; this element’s own point is left off.' }),
        };
      },
    }),
    code({
      id: 'moseley-fit', difficulty: 3,
      prompt: t`The arrays hold the measured Kα₁ energies (keV, Bearden 1967) of sodium to zinc. Fit a straight line $\sqrt{E} = aZ + b$ with \`numpy.polyfit\`. Then find the screening $\sigma = -b/a$ (where the line crosses $\sqrt{E} = 0$), and \`C\` $= a^2/R$ with $R = 0.0136057$ keV — Moseley predicts $\sigma \approx 1$ and $C = \tfrac34$. Print \`a\`, \`sigma\` and \`C\`.`,
      starter: t`import numpy as np

Z = np.array([${FIT.join(', ')}])
E = np.array([${FIT.map((z) => KALPHA1[z]).join(', ')}])
R = 0.0136057

a = b = sigma = C = None   # replace with the fit and what follows from it

print(a, sigma, C)
`,
      answer: t`import numpy as np

Z = np.array([${FIT.join(', ')}])
E = np.array([${FIT.map((z) => KALPHA1[z]).join(', ')}])
R = 0.0136057

a, b = np.polyfit(Z, np.sqrt(E), 1)
sigma = -b / a
C = a**2 / R

print(a, sigma, C)`,
      tests: [
        { name: t`the slope $a$ is ${fmt(fitLine.a, 4)} per unit of $Z$`, code: `abs(a - ${r6(fitLine.a)}) < 1e-4` },
        { name: t`the screening $\sigma$ is ${fmt(SIGMA_FIT, 3)}`, code: `abs(sigma - ${r6(SIGMA_FIT)}) < 0.005` },
        { name: t`$C = a^2/R$ is ${fmt(C_FIT, 4)} — Moseley’s three quarters`, code: `abs(C - ${r6(C_FIT)}) < 0.001` },
        { name: 'the three numbers are printed', code: '_stdout.count(".") >= 3' },
      ],
      hints: [t`\`np.polyfit(x, y, 1)\` returns the slope and the intercept of the best straight line, in that order. Fit \`np.sqrt(E)\` against \`Z\`.`, t`\`a, b = np.polyfit(Z, np.sqrt(E), 1)\`, then \`sigma = -b / a\` and \`C = a**2 / R\`.`],
      teach: 'A straight-line fit of √E against Z recovers both of Moseley’s numbers from the data: the 3/4 of a Bohr jump from n = 2 to 1, and a screening of about one electron.',
      explain: t`The fit gives $a = ${fmt(fitLine.a, 4)}\ \sqrt{\text{keV}}$, $\sigma = ${fmt(SIGMA_FIT, 3)}$ and $C = ${fmt(C_FIT, 4)}$: the data themselves say “a Bohr jump from $n = 2$ to $n = 1$, in a nucleus screened by one electron”. Add heavier elements and the slope creeps up: relativity makes the K shell deeper than Bohr’s formula allows.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pixl', difficulty: 2, transfer: true,
      gen(r) {
        const [E, , sym] = r.pick(BASALT.filter((p) => ['Ca', 'Ti', 'Mn', 'Fe', 'Cr', 'K'].includes(p[2])));
        const Z = { K: 19, Ca: 20, Ti: 22, Cr: 24, Mn: 25, Fe: 26 }[sym];
        return {
          prompt: t`NASA’s Perseverance rover carries PIXL, which focuses X-rays from a small rhodium-target tube (28 kV) onto a spot of rock about 0.12 mm across and records the X-rays the rock fluoresces in return. One peak in a spectrum from Jezero crater sits at ${fmt(E, 3)} keV. Which element — give its atomic number — emitted it as its Kα line?`,
          answer: Z, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Z - 1, feedback: t`Moseley’s law gives $Z - 1$; add 1.` }],
          hints: [t`$Z = 1 + \sqrt{E/(\tfrac34 \times 13.6\ \text{eV})}$.`, t`$\sqrt{${fmt(E * 1000, 4)}/10.20}$, plus 1, rounded.`],
          teach: 'X-ray fluorescence identifies elements from across the room, or from another planet, by Moseley’s law.',
          explain: t`$Z = 1 + \sqrt{${fmt(E * 1000, 4)}/10.20} = ${fmt(1 + Math.sqrt((E * 1000) / (0.75 * RYD)), 3)} \approx ${Z}$: ${name(Z)}. Mapping such peaks point by point, PIXL charts how the elements are spread through a rock’s grains — and so where water once altered it.`,
          visual: xrfSpectrum(BASALT.map(([e, h, lab]) => [e, h, Math.abs(e - E) < 1e-9 ? '?' : '', Math.abs(e - E) < 1e-9 ? 'gold' : undefined]), { x: [0.6, 9.2], caption: 'A schematic X-ray fluorescence spectrum of a Martian basalt: one peak per element (iron’s Kβ beside its Kα), heights illustrative. The peak in question is marked.' }),
        };
      },
    }),
    num({
      id: 'cp-missing', difficulty: 2,
      gen(r) {
        const [Z, story] = r.pick([[43, 'technetium, which has no stable isotopes; it was finally made in 1937, in molybdenum foil bombarded in a cyclotron'], [61, 'promethium, which has no stable isotopes either; it was found in 1945 among uranium’s fission products'], [72, 'hafnium, found in 1923 by its X-ray lines, hidden in zirconium ores'], [75, 'rhenium, found in 1925']]);
        const E = moseleyKeV(Z);
        return {
          prompt: t`Moseley’s plot had a gap at $Z = ${Z}$: no known element gave lines there. At what energy should that element’s Kα line appear, according to Moseley’s law, in keV? (The element is ${story}.)`,
          answer: E, units: 'keV', tol: { rel: 0.005 },
          errors: [{ value: moseleyKeV(Z + 1), feedback: t`Use $(Z - 1)^2$, not $Z^2$.` }],
          hints: [t`$E \approx \tfrac34(13.6\ \text{eV})(Z - 1)^2$.`, t`$(Z - 1)^2 = ${(Z - 1) ** 2}$.`],
          teach: 'A gap in Moseley’s straight line is a prediction: an undiscovered element, with known X-ray lines.',
          explain: t`$E = 10.20\ \text{eV} \times ${(Z - 1) ** 2} = ${fmt(E, 4)}$ keV. ${Z > 50 ? 'For heavy elements the real line lies several per cent higher (relativity), but the estimate tells a searcher where to look.' : 'The real line lies a little higher, as for every element near it.'}`,
          visual: moseleyPlot({ sigma: 1, caption: `Measured Kα₁ lines of a selection of elements with Moseley’s line (σ = 1). Element ${Z} is not plotted.` }),
        };
      },
    }),
    mcq({
      id: 'cp-edge', difficulty: 2,
      prompt: 'Why is an element’s Kα line always lower in energy than its own K absorption edge?',
      choices: [
        'The edge must lift a 1s electron all the way out of the atom; Kα releases only the difference between the K and L levels',
        'Kα photons lose energy escaping from the atom',
        'The edge includes the energy given to the recoiling nucleus',
        'They are really equal; the difference is a measuring error',
      ],
      answer: 0,
      why: {
        1: 'An emitted photon keeps its energy on the way out; the difference is in the levels, not in the escape.',
        2: 'The recoil of a whole atom takes only about a millionth of an X-ray’s energy.',
        3: 'The difference is large: for copper 8.98 keV against 8.05 keV.',
      },
      hints: ['Draw the K and L levels and the ionization limit; which two energies are being compared?'],
      teach: 'The K edge is the whole binding energy of a 1s electron; Kα is only the K–L difference.',
      explain: t`For copper, ejecting a 1s electron takes ${fmt(K_EDGE[CU], 4)} keV, while an L electron filling the hole releases ${fmt(KALPHA1[CU], 4)} keV — the L electron was itself bound by about 0.93 keV. That is why an element is fairly transparent to its own Kα line.`,
      visual: xrayLevels({ caption: 'K, L and M levels of a heavy atom, schematic and not to scale: the K edge (blue) lifts a 1s electron out of the atom; Kα (gold) and Kβ (violet) refill the hole.' }),
    }),
  ],
  sources: [
    { label: 'Moseley (1913), The high-frequency spectra of the elements, Phil. Mag. 26, 1024; part II (1914), Phil. Mag. 27, 703', url: 'https://doi.org/10.1080/14786441308635052' },
    { label: 'X-ray Data Booklet (LBNL), §1.2: X-ray emission energies (Bearden 1967) and absorption edges', url: 'https://xdb.lbl.gov/' },
    { label: 'Allwood et al. (2020), PIXL: Planetary Instrument for X-ray Lithochemistry, Space Sci. Rev. 216, 134', url: 'https://doi.org/10.1007/s11214-020-00767-7' },
    { label: 'OpenStax University Physics Vol. 3, §8.6 Atomic spectra and X-rays', url: 'https://openstax.org/books/university-physics-volume-3/pages/8-6-atomic-spectra-and-x-rays' },
  ],
});
