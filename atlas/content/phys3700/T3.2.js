// Paramagnets and negative temperature: the two-state paramagnet's S(U) hill;
// T from its slope; M = Nμ tanh(μB/kT) and Curie's law; the Schottky heat
// capacity; the honest negative-temperature region (Purcell & Pound 1951) and
// why it is hotter than any positive temperature.
import { lesson, mcq, num, multi, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, MU_B, r4, texNum, apart } from './_count.js';

const t = String.raw;
const MU_P = 1.4106e-26;                 // proton magnetic moment, J/T (CODATA, 4 figures)
// S/Nk against s = U/(NμB), the energy per dipole in units of μB
const sExpr = '-((1-x)/2)*ln((1-x)/2) - ((1+x)/2)*ln((1+x)/2)';
const sOf = (s) => { const p = (1 - s) / 2; return -(p * Math.log(p) + (1 - p) * Math.log(1 - p)); };
const betaOf = (s) => 0.5 * Math.log((1 - s) / (1 + s));           // μB/kT at energy s

/** The S(U) hill with an optional marked state and tangent. */
function hill({ at = null, tangent = true, caption, label = '' } = {}) {
  const curves = [{ fn: sExpr, domain: [-0.9999, 0.9999], color: 'accent' }];
  const points = [];
  if (at !== null) {
    const y = sOf(at), m = betaOf(at);
    if (tangent) curves.push({ fn: `${r4(y)} + ${r4(m)}*(x - ${r4(at)})`, domain: [Math.max(-1, at - 0.35), Math.min(1, at + 0.35)], color: 'gold', width: 2 });
    points.push({ x: r4(at), y: r4(y), r: 5, color: 'gold', label, labelDx: 8, labelDy: 16 });
  }
  return {
    type: 'graph',
    params: { x: [-1, 1], y: [0, 0.8], aspect: 'wide', xlabel: 'energy per dipole, U/(NμB)', ylabel: 'S / Nk', axesAt: 'edge', curves, points,
      vlines: [{ x: 0, color: 'ink4' }] },
    caption: caption ?? 'The entropy of a two-state paramagnet against its energy (large N). Left of centre the slope 1/T is positive; right of centre it is negative.',
  };
}
// μB/kT against energy: a smooth line through zero — the natural measure of hotness
const betaPic = (caption, marks = []) => ({
  type: 'graph',
  params: { x: [-1, 1], y: [-2.5, 2.5], aspect: 'wide', xlabel: 'energy per dipole, U/(NμB)', ylabel: 'μB/kT', axesAt: 'edge',
    curves: [{ fn: '0.5*ln((1-x)/(1+x))', domain: [-0.99, 0.99], color: 'violet' }],
    hlines: [{ y: 0, color: 'ink4' }],
    points: marks },
  caption,
});
const tanhPic = (x, caption) => ({
  type: 'graph',
  params: { x: [0, 4], y: [0, 1.1], aspect: 'wide', xlabel: 'μB / kT', ylabel: 'M / Nμ', axesAt: 'edge',
    curves: [{ fn: 'tanh(x)', domain: [0, 4], color: 'accent', label: 'tanh', labelAt: 3.3, labelDy: 16 }, { fn: 'x', domain: [0, 1.1], color: 'ink3', dash: true, label: 'Curie', labelAt: 0.9, labelDx: -46 }],
    vlines: [{ x: r4(x), color: 'gold' }] },
  caption: caption ?? 'Magnetization against μB/kT: linear (Curie’s law, dashed) when the field is weak or the spins hot, saturating at full alignment when strong or cold.',
});

const EX = { B: 2.0, T: 2.0 };
EX.x = (MU_B * EX.B) / (KB * EX.T); EX.m = Math.tanh(EX.x); EX.up = (1 + EX.m) / 2;

export default lesson({
  id: 'phys3700.T3.2',
  title: 'Paramagnets and negative temperature',
  minutes: 15, difficulty: 3,
  intro: t`A **two-state paramagnet** is $N$ magnetic dipoles in a field $B$, each pointing along it (energy $-\mu B$) or against it ($+\mu B$). With $N_\uparrow$ aligned, $U = \mu B(N - 2N_\uparrow)$ and $\Omega = \binom{N}{N_\uparrow}$. Its entropy against energy is a **hill**: zero when every dipole is aligned, highest at $U = 0$, zero again when every dipole is reversed. The slope gives the temperature, and the result for the magnetization is

$$M = N\mu\tanh\frac{\mu B}{kT}.$$

On the right-hand side of the hill adding energy *lowers* the entropy, so $1/T < 0$: a **negative temperature**. It is real. In 1951 Purcell and Pound reversed the field on the polarized lithium nuclei in a lithium fluoride crystal faster than the spins could follow, leaving most of them pointing the high-energy way. The spins settled among themselves into an inverted equilibrium that lasted minutes, and while it lasted it gave energy to the room-temperature crystal around it. A negative temperature is **hotter than any positive one**.`,
  symbols: [
    { tex: 'M', text: 'the magnetization: the total magnetic moment along $B$, $\\mu(N_\\uparrow - N_\\downarrow)$, in J/T' },
    { tex: 'N', text: 'the number of dipoles; $N_\\uparrow$ point along the field, $N_\\downarrow = N - N_\\uparrow$ against it' },
    { tex: '\\mu', text: 'each dipole’s magnetic moment, in J/T (the Bohr magneton $\\mu_B = 9.274\\times10^{-24}$ J/T for an electron spin)' },
    { tex: 'B', text: 'the magnetic field, in tesla' },
    { tex: '\\tanh', text: 'the hyperbolic tangent, $(e^x - e^{-x})/(e^x + e^{-x})$: it rises from 0 and saturates at 1' },
    { tex: 'kT', text: 'the thermal energy; $\\mu B/kT$ compares the alignment energy with it' },
  ],
  why: 'The paramagnet is the simplest system whose energy has a ceiling, and it shows that temperature is the slope of S(U), not a measure of motion — the same idea behind lasers’ population inversion and the spin physics of MRI.',
  visual: {
    type: 'graph',
    title: 'The paramagnet’s entropy hill',
    lead: t`The curve is $S/Nk$ against the energy per dipole, $U/(N\mu B)$: $-1$ is every dipole aligned, $+1$ every dipole reversed. Drag the gold point and read the tangent’s slope — it is $\mu B/kT$.`,
    tasks: [
      'Drag to the far left: the slope is huge and positive — T is just above zero, every dipole aligned.',
      'Drag toward the middle: the slope shrinks to zero, so T grows without limit. Cross the top and the slope turns negative — T jumps from +∞ to −∞.',
      'Keep going right: the slope grows ever more negative and T rises toward zero from below. The population is inverted.',
    ],
    params: {
      x: [-1, 1], y: [0, 0.8], aspect: 'wide', xlabel: 'energy per dipole, U/(NμB)', ylabel: 'S / Nk', axesAt: 'edge',
      curves: [{ fn: sExpr, domain: [-0.9999, 0.9999], color: 'accent' }],
      tangent: { fn: sExpr, at: -0.6 },
      vlines: [{ x: 0, color: 'ink4' }],
      readouts: [
        { label: '$U/(N\\mu B)$', expr: 'x0', digits: 3 },
        { label: 'aligned fraction $N_\\uparrow/N$', expr: '(1 - x0)/2', digits: 3 },
        { label: 'slope $\\mu B/kT$', expr: 'slope', digits: 3 },
        { label: '$kT/\\mu B$', expr: '1/slope', digits: 3 },
      ],
    },
    caption: 'Entropy of N non-interacting two-state dipoles (Stirling’s large-N form). Real spins interact weakly; a temperature exists only once they have come to equilibrium among themselves.',
  },
  example: {
    prompt: t`Electron spins ($\mu = \mu_B = 9.274\times10^{-24}$ J/T) sit in a field of $${EX.B}$ T at $${EX.T}$ K. (a) What fraction is aligned, and what is $M/N\mu$? (b) The field is suddenly reversed, too fast for the spins to follow. What is the spin temperature now, and which way does heat flow between the spins and the $${EX.T}$ K crystal?`,
    visual: hill({ at: -EX.m, label: 'before', caption: 'The spins’ state on the entropy hill before the reversal; reversing the field reflects it to the mirror-image point on the right.' }),
    steps: [
      { label: 'Compare energies', text: t`$\mu B/kT = \dfrac{(9.274\times10^{-24})(${EX.B})}{(1.381\times10^{-23})(${EX.T})} = ${fmt(EX.x, 3)}$.` },
      { label: 'Populations', text: t`From the slope, $N_\uparrow/N_\downarrow = e^{2\mu B/kT} = ${fmt(Math.exp(2 * EX.x), 3)}$, so the aligned fraction is $${fmt(EX.up, 3)}$ and $M/N\mu = \tanh(${fmt(EX.x, 3)}) = ${fmt(EX.m, 3)}$.` },
      { label: 'Reverse', text: t`After the reversal the same spins now point mostly *against* the field: aligned fraction $${fmt(1 - EX.up, 3)}$, $U/(N\mu B) = +${fmt(EX.m, 3)}$. The state is the mirror image on the hill, where the slope has the opposite sign: $T = -${EX.T}$ K.` },
      { label: 'Heat flow', text: t`The spins gain entropy by **losing** energy (their slope is negative), and the crystal gains entropy by gaining it. So heat flows from the spins to the crystal until the spins return through $T = \pm\infty$ to positive temperatures and match the lattice.` },
      { label: 'Sense check', text: t`Flipping every dipole cannot change the entropy (the same count of microstates), and it does not: the two points are at the same height on the hill.` },
    ],
    answer: t`Aligned fraction $${fmt(EX.up, 3)}$, $M/N\mu = ${fmt(EX.m, 3)}$. After the reversal $T = -${EX.T}$ K, and heat flows from the spins into the crystal.`,
  },
  practice: [
    num({
      id: 'magnetization', difficulty: 2,
      gen(r) {
        const B = r.pick([1, 2, 5, 8]), T = r.pick([1, 2, 4, 10]), x = (MU_B * B) / (KB * T), v = Math.tanh(x);
        return {
          prompt: t`Electron spins ($\mu = \mu_B = 9.274\times10^{-24}$ J/T) are in a field of $${B}$ T at $${T}$ K. What is $M/N\mu$, the magnetization as a fraction of its maximum?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: x, feedback: t`$\mu B/kT$ is the argument; the magnetization is its tanh (Curie’s law $M/N\mu \approx \mu B/kT$ holds only when that is small).` }, { value: (1 + v) / 2, feedback: t`That is the aligned fraction $N_\uparrow/N$. $M/N\mu = (N_\uparrow - N_\downarrow)/N$.` }], v),
          hints: [t`$M/N\mu = \tanh(\mu B/kT)$.`, t`$\mu B/kT = ${fmt(x, 3)}$.`],
          teach: t`$M = N\mu\tanh(\mu B/kT)$: weak or hot gives Curie’s linear law, strong or cold saturates.`,
          explain: t`$\mu B/kT = ${fmt(x, 3)}$ and $\tanh(${fmt(x, 3)}) = ${fmt(v, 3)}$.`,
          visual: tanhPic(Math.min(x, 3.9), 'Magnetization against μB/kT. Gold: this field and temperature (marked at the right edge if beyond it).'),
        };
      },
    }),
    num({
      id: 'curie', difficulty: 2,
      gen(r) {
        const T1 = r.pick([200, 300]), T2 = r.pick([50, 77, 100]), B1 = r.pick([0.5, 1]), B2 = r.pick([1, 2]), M1 = r.pick([2, 3, 5]);
        const v = (M1 * (B2 / T2)) / (B1 / T1);
        return {
          prompt: t`A dilute paramagnetic salt follows Curie’s law. In $${B1}$ T at $${T1}$ K its magnetization is $${M1}$ A·m²/kg (per kilogram of salt). What is it in $${B2}$ T at $${T2}$ K?`,
          answer: v, units: 'A m^2/kg', tol: { rel: 0.01 },
          errors: apart([{ value: M1 * (B2 / B1) * (T2 / T1), feedback: 'Magnetization goes as 1/T, not as T: cooling increases it.' }, { value: M1 * (B2 / B1), feedback: 'Include the temperature change too: M ∝ B/T.' }], v),
          hints: [t`Curie’s law: $M \approx N\mu^2B/kT$, so $M \propto B/T$.`],
          teach: t`Weak field or high temperature: $M = N\mu^2B/kT$ — Curie’s law.`,
          explain: t`$M_2 = M_1\dfrac{B_2/T_2}{B_1/T_1} = ${M1}\times\dfrac{${B2}/${T2}}{${B1}/${T1}} = ${fmt(v, 3)}$ A·m²/kg. (This assumes $\mu B \ll kT$ still holds — true for a salt at these temperatures.)`,
          visual: { type: 'graph', params: { x: [0, 0.045], y: [0, r4(1.25 * Math.max(v, M1))], aspect: 'wide', xlabel: 'B / T (tesla per kelvin)', ylabel: 'M (A·m²/kg)', axesAt: 'edge', curves: [{ fn: `${r4(M1 / (B1 / T1))}*x`, domain: [0, 0.045], color: 'accent' }], points: [{ x: r4(B1 / T1), y: M1, r: 5, color: 'gold', label: 'measured', labelDx: 8, labelDy: 14 }], vlines: [{ x: r4(B2 / T2), color: 'warn' }] }, caption: 'Curie’s law: magnetization in proportion to B/T. Gold: the measured point; orange: the new B/T.' },
        };
      },
    }),
    mcq({
      id: 'U-zero', difficulty: 2,
      prompt: t`A large paramagnet has exactly half its dipoles aligned, so $U = 0$. What is its temperature?`,
      choices: [t`Infinite: the slope $\partial S/\partial U$ is zero at the top of the hill, so $1/T = 0$`, 'Absolute zero, because the net magnetization is zero', 'Room temperature, because a random arrangement is what heat produces', 'Negative, because the energy is higher than the ground state'],
      answer: 0,
      why: { 1: 'Absolute zero is the opposite end: every dipole aligned, at the left foot of the hill.', 2: 'Only an infinitely hot paramagnet is perfectly random; any finite T leaves a bias toward alignment.', 3: 'Negative temperature needs more than half reversed: the right-hand side of the hill.' },
      hints: ['Where on the S(U) hill is U = 0, and what is the slope there?'],
      teach: 'At the top of the entropy hill 1/T = 0: T = ±∞.',
      explain: t`$U = 0$ is the maximum of $S(U)$, where $\partial S/\partial U = 0$, so $1/T = 0$. Any positive temperature leaves more dipoles aligned than reversed; any negative one, more reversed.`,
      visual: hill({ at: 0, tangent: false, caption: 'The entropy hill with the half-aligned state marked at its top.' }),
    }),
    num({
      id: 'populations-neg', difficulty: 3,
      gen(r) {
        const tau = r.pick([-0.5, -1, -2, -4]), x = 1 / tau, v = 1 / (1 + Math.exp(2 * x));
        return {
          prompt: t`A spin system has $kT/\mu B = ${tau}$. What fraction of its dipoles points **against** the field (the high-energy way)?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: 1 - v, feedback: 'That is the aligned fraction. At negative temperature the majority points against the field.' }, { value: 1 / (1 + Math.exp(x)), feedback: t`The two energies differ by $2\mu B$: the ratio is $e^{2\mu B/kT}$.` }], v),
          hints: [t`$N_\uparrow/N_\downarrow = e^{2\mu B/kT}$, with $kT$ negative here.`, t`$N_\downarrow/N = 1/(1 + e^{2\mu B/kT}) = 1/(1 + e^{${fmt(2 * x, 3)}})$.`],
          teach: t`The Boltzmann ratio $N_\uparrow/N_\downarrow = e^{2\mu B/kT}$ still holds with $T < 0$: it just favours the upper level.`,
          explain: t`$2\mu B/kT = ${fmt(2 * x, 3)}$, so $N_\downarrow/N = 1/(1 + e^{${fmt(2 * x, 3)}}) = ${fmt(v, 3)}$ — a population inversion.`,
          visual: betaPic('μB/kT against the energy per dipole: a smooth line that passes straight through zero at U = 0. Negative temperatures lie on the right, where the population is inverted.', [{ x: r4(Math.tanh(-x)), y: r4(x), r: 5, color: 'gold' }]),
        };
      },
    }),
    mcq({
      id: 'hotter', difficulty: 2,
      prompt: t`A nuclear-spin system at $-300$ K touches a copper block at $+300$ K (their only contact is thermal). Which way does heat flow?`,
      choices: ['From the spins to the copper', 'From the copper to the spins, because 300 K is above −300 K', 'Neither way: their temperatures have the same size', 'From the copper to the spins until both reach 0 K'],
      answer: 0,
      why: { 1: 'Ordering temperatures as numbers fails across zero slope. The spins gain entropy by losing energy, and the copper gains it by taking energy: both push the flow the same way.', 2: 'Equilibrium needs equal slopes, and these have opposite signs.', 3: 'Nothing approaches 0 K here: the spins pass through ±∞ on their way to positive temperatures.' },
      hints: ['What happens to each system’s entropy if one joule moves from the spins to the copper?'],
      teach: 'Negative temperatures are hotter than every positive temperature.',
      explain: t`Moving energy from spins to copper raises both entropies: the spins’ $\partial S/\partial U$ is negative ($-1/300$ per K), the copper’s positive. So heat flows into the copper, as Purcell and Pound’s spins gave energy to their crystal.`,
      visual: betaPic('Hotness runs from left to right along this line: coldest at the far left (T → 0⁺), through μB/kT = 0 (T = ±∞), to hottest at the far right (T → 0⁻).', [{ x: -0.6, y: r4(betaOf(-0.6)), r: 5, color: 'accent', label: '+T', labelDx: 8 }, { x: 0.6, y: r4(betaOf(0.6)), r: 5, color: 'warn', label: '−T', labelDx: 8 }]),
    }),
    order({
      id: 'rank-hotness', difficulty: 3,
      prompt: 'Put these spin temperatures in order from **coldest** to **hottest** (heat would flow from each to every one before it).',
      items: [t`$T = +1$ K`, t`$T = +300$ K`, t`$T = +10^{6}$ K`, t`$T = -10^{6}$ K`, t`$T = -300$ K`, t`$T = -1$ K`],
      hints: [t`Order by $-1/T$ (equivalently, by $-\mu B/kT$), not by $T$.`, t`$1/T$: $+1$, $+1/300$, $+10^{-6}$, $-10^{-6}$, $-1/300$, $-1$ (per kelvin). Hotness increases as $1/T$ decreases.`],
      teach: t`Hotness is ordered by $-1/T$: $0^+ \to +\infty = -\infty \to 0^-$.`,
      explain: t`In terms of $1/T$ the list runs $1, \tfrac1{300}, 10^{-6}, -10^{-6}, -\tfrac1{300}, -1$ per kelvin: steadily decreasing, so steadily hotter. $+10^6$ K and $-10^6$ K sit side by side, either side of $\pm\infty$.`,
      visual: betaPic('μB/kT against energy for a paramagnet: from the left (just above 0 K) through zero (infinite T) to the right (just below 0 K), each point hotter than the last.'),
    }),
    num({
      id: 'schottky', difficulty: 3,
      gen(r) {
        const tau = r.pick([0.5, 0.8, 1, 1.5, 3]), x = 1 / tau, v = (x * x) / Math.cosh(x) ** 2;
        return {
          prompt: t`The heat capacity of a two-state paramagnet is $C/Nk = \dfrac{(\mu B/kT)^2}{\cosh^2(\mu B/kT)}$. What is $C/Nk$ when $kT = ${tau}\,\mu B$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: (tau * tau) / Math.cosh(tau) ** 2, feedback: t`The argument is $\mu B/kT = 1/${tau}$, not $kT/\mu B$.` }, { value: x * x, feedback: t`Divide by $\cosh^2$.` }], v),
          hints: [t`$x = \mu B/kT = ${fmt(x, 4)}$.`, t`$\cosh x = (e^x + e^{-x})/2$.`],
          teach: 'A system with an energy ceiling has a heat capacity that peaks and then falls: the Schottky anomaly.',
          explain: t`$x = ${fmt(x, 4)}$, $\cosh x = ${fmt(Math.cosh(x), 4)}$: $C/Nk = ${fmt(v, 3)}$. The peak, $0.44$, is near $kT = 0.83\,\mu B$: below it the spins cannot be excited; far above it they are already as random as they can get.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 0.5], aspect: 'wide', xlabel: 'kT / μB', ylabel: 'C / Nk', axesAt: 'edge', curves: [{ fn: '(1/x)^2/cosh(1/x)^2', domain: [0.05, 4], color: 'accent' }], vlines: [{ x: tau, color: 'gold' }] }, caption: 'The Schottky heat capacity of a two-state paramagnet against temperature. Gold: the temperature asked about.' },
        };
      },
    }),
    multi({
      id: 'which-negative', difficulty: 2,
      prompt: 'Which of these systems can be put into a state of negative temperature? Choose all that apply.',
      choices: ['Nuclear spins in a crystal, isolated from the lattice for a while', 'The two laser levels of the atoms in a pumped laser medium (taken alone)', 'A gas of helium atoms in a box', 'The vibrations of an Einstein solid'],
      answer: [0, 1],
      why: { 2: 'A gas’s kinetic energy has no upper limit, so S keeps rising with U: its slope never turns negative.', 3: 'An oscillator’s ladder of levels goes up forever, so its entropy always rises with energy.' },
      hints: ['Negative T needs an entropy that falls as energy rises. What does that require of the energy levels?'],
      teach: 'Only a system with an upper limit to its energy can have negative temperature.',
      explain: t`A negative slope needs a ceiling on the energy: two-level systems have one. Spin systems reach true, measured negative spin temperatures; a laser’s population inversion is the same idea for two atomic levels (it is a non-equilibrium state of the whole atom, so “negative temperature” describes only that pair of levels). Gases and oscillators have unbounded levels.`,
      visual: hill({ caption: 'The paramagnet’s entropy turns down because its energy has a ceiling (every dipole reversed). A gas’s or a solid’s entropy keeps rising.' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mri', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([1.5, 3, 7]), T = 310, v = Math.tanh((MU_P * B) / (KB * T)) * 1e6;
        return {
          prompt: t`An MRI scanner images the proton spins of water in the body ($T = 310$ K) in a field of $${B}$ T. The proton’s magnetic moment is $\mu_p = 1.4106\times10^{-26}$ J/T. What is the net polarization $M/N\mu_p$, in parts per million?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: ((MU_B * B) / (KB * T)) * 1e6, feedback: 'That uses the electron’s moment. A proton’s is about 660 times smaller.' }, { value: v / 2, feedback: t`$M/N\mu = \tanh(\mu B/kT)$, not half of it.` }, { value: (v / 1e6), feedback: 'Express the answer in parts per million (multiply by 10⁶).' }], v),
          hints: [t`$\mu_pB/kT$ is tiny, so $\tanh x \approx x$.`, t`$x = \dfrac{(1.4106\times10^{-26})(${B})}{(1.381\times10^{-23})(310)}$.`],
          teach: t`At body temperature nuclear spins are barely polarized: $M/N\mu \approx \mu B/kT$, a few parts per million.`,
          explain: t`$\mu_pB/kT = ${texNum(v / 1e6, 3)}$, so the polarization is $${fmt(v, 3)}$ ppm — only about $${fmt(v, 2)}$ more spins aligned than reversed in every million. MRI works because water holds about $${texNum(6.7e28, 2)}$ protons per cubic metre; stronger magnets help in direct proportion to $B$.`,
          visual: tanhPic(0.05, 'Magnetization against μB/kT. An MRI scanner’s protons sit at the very foot of the curve, deep in the Curie region (the gold line is drawn far to the right of the true value, which is too small to see).'),
        };
      },
    }),
    num({
      id: 'cp-inverted', difficulty: 3,
      gen(r) {
        const p = r.pick([0.2, 0.3, 0.4, 0.45]), v = 2 / Math.log(p / (1 - p));
        return {
          prompt: t`After a field reversal, only $${Math.round(p * 100)}\,\%$ of a spin system’s dipoles point along the field. Once the spins reach equilibrium among themselves, what is $kT/\mu B$?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: -v, feedback: 'Fewer than half aligned is the inverted side: the temperature is negative.' }, { value: 1 / Math.log(p / (1 - p)), feedback: t`The level spacing is $2\mu B$: $N_\uparrow/N_\downarrow = e^{2\mu B/kT}$.` }], v),
          hints: [t`$N_\uparrow/N_\downarrow = e^{2\mu B/kT}$.`, t`$kT/\mu B = 2/\ln(N_\uparrow/N_\downarrow) = 2/\ln(${p}/${fmt(1 - p, 2)})$.`],
          teach: t`Solve the Boltzmann ratio for $T$: fewer than half aligned gives $T < 0$.`,
          explain: t`$\ln(${p}/${fmt(1 - p, 2)}) = ${fmt(Math.log(p / (1 - p)), 4)}$, so $kT/\mu B = ${fmt(v, 3)}$. ${p > 0.4 ? 'Close to half aligned, the temperature is large and negative — just past ±∞.' : 'The more inverted, the closer the temperature comes to zero from below.'}`,
          visual: hill({ at: 1 - 2 * p, tangent: false, caption: 'The state after the reversal, on the right-hand slope of the entropy hill.' }),
        };
      },
    }),
    mcq({
      id: 'cp-why-hot', difficulty: 3,
      prompt: 'Why is a negative-temperature system called hotter than an infinitely hot one?',
      choices: [
        'It gives energy to every positive-temperature system it touches, including one at T = ±∞, because losing energy raises its own entropy',
        'Its dipoles move faster than any molecule in a hot gas',
        'Its energy is negative, and negative energy flows toward positive energy',
        'The minus sign is a convention for very large temperatures',
      ],
      answer: 0,
      why: { 1: 'Nothing here is about speed: dipoles flip, they do not fly. Temperature is the entropy slope.', 2: 'Its energy is higher than at any positive temperature, not negative.', 3: 'It is not a convention: the slope 1/T really is negative, and heat-flow experiments show it.' },
      hints: ['Hotter means: gives up energy on contact. Which way does a negative slope make energy go?', 'At T = ±∞ the slope is zero. Compare a negative slope with zero.'],
      teach: 'Hotness follows −1/T: a negative 1/T is hotter than 1/T = 0.',
      explain: t`On contact energy flows from the system with the smaller $\partial S/\partial U$ to the one with the larger. A negative slope is smaller than zero (an infinitely hot system) and smaller than every positive slope, so a negative-temperature system gives energy to all of them. Ramsey worked this out in 1956, following Purcell and Pound’s experiment.`,
      visual: betaPic('μB/kT (proportional to 1/T) against energy: negative temperatures lie beyond μB/kT = 0, the point of infinite temperature.'),
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §3.3', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Purcell & Pound, A Nuclear Spin System at Negative Temperature, Phys. Rev. 81, 279 (1951)', url: 'https://doi.org/10.1103/PhysRev.81.279' },
    { label: 'Ramsey, Thermodynamics and Statistical Mechanics at Negative Absolute Temperatures, Phys. Rev. 103, 20 (1956)', url: 'https://doi.org/10.1103/PhysRev.103.20' },
    { label: 'Braun et al., Negative Absolute Temperature for Motional Degrees of Freedom, Science 339, 52 (2013)', url: 'https://doi.org/10.1126/science.1227831' },
    { label: 'CODATA recommended values (Bohr magneton, proton magnetic moment)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
