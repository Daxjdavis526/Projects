// Entropy as log multiplicity: S = k ln Ω, why the logarithm (additivity),
// the second law as ΔS ≥ 0 for an isolated system, the Einstein solid's
// entropy, and — as an honestly labelled forward pointer — black-hole entropy.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { KB, NA, G, HBAR, CL, MSUN, lnOmega, pairDist, einPic, r4, texNum, apart } from './_count.js';

const t = String.raw;
const LN10 = Math.LN10;
// S/k of an Einstein solid in Stirling's large-N form, as expression text
const sExpr = (Nk, qv) => `((${qv})+${Nk})*ln((${qv})+${Nk}) - (${qv})*ln(${qv}) - ${Nk}*ln(${Nk})`;
const sBH = (m) => (4 * Math.PI * G * m * m) / (HBAR * CL);      // S/k of a Schwarzschild hole of mass m (kg)

// the worked example: Schroeder's pair, 300 and 200 oscillators, 100 quanta, from q_A = 20 to 60
const EX = { a0: 20, a1: 60 };
EX.SA0 = lnOmega(300, 20); EX.SB0 = lnOmega(200, 80); EX.SA1 = lnOmega(300, 60); EX.SB1 = lnOmega(200, 40);
EX.dS = EX.SA1 + EX.SB1 - EX.SA0 - EX.SB0;

// S/Nk of a two-state system against the fraction up
const h2Pic = (caption, mark = 0.5) => ({
  type: 'graph',
  params: { x: [0, 1], y: [0, 0.8], aspect: 'wide', xlabel: 'fraction of coins heads', ylabel: 'S / Nk', axesAt: 'edge', curves: [{ fn: '-x*ln(x) - (1-x)*ln(1-x)', domain: [0.0005, 0.9995], color: 'accent' }], vlines: [{ x: mark, color: 'gold' }] },
  caption,
});

export default lesson({
  id: 'phys3700.T2.4',
  title: 'Entropy as log multiplicity',
  minutes: 13, difficulty: 3,
  intro: t`Multiplicities are unmanageably large, and for two systems together they **multiply**. Their logarithms are ordinary numbers, and they **add**. Boltzmann’s definition of entropy is that logarithm, in physical units:

$$S = k\ln\Omega.$$

The second law now reads: an isolated system’s entropy tends to increase, because the macrostates with more microstates are overwhelmingly more probable. Entropy is not “disorder” in any vague sense — it is a count. Its units, J/K, come only from $k$; and a difference $\Delta S$ means the final macrostate has $e^{\Delta S/k}$ times as many microstates as the first.`,
  symbols: [
    { tex: 'S', text: 'the entropy of a macrostate, in J/K' },
    { tex: 'k', text: 'Boltzmann’s constant, $1.380649\\times10^{-23}$ J/K: it only sets units, so $S/k$ is a pure number' },
    { tex: '\\ln\\Omega', text: 'the natural log of the multiplicity — about $10^{23}$ for a mole of anything at room temperature' },
    { tex: 'S_\\text{total} = S_A + S_B', text: 'entropy adds because $\\Omega_\\text{total} = \\Omega_A\\Omega_B$ and the log of a product is a sum' },
  ],
  why: 'Entropy is the quantity the rest of thermal physics is built on: temperature is its slope (T3.1), engines are limited by it (T4), and even black holes turn out to have it.',
  visual: {
    type: 'graph',
    title: 'Entropy of two solids sharing energy',
    lead: t`Two Einstein solids, A and B, share $q$ quanta. The curves are $S_A/k$, $S_B/k$ and their sum, against $q_A$. Move the split $q_A$ and read the slopes: the total is greatest exactly where the two solids’ entropies change at the same rate.`,
    tasks: [
      'Slide the split until the two slopes match: you land on the top of the gold total curve, at the same energy per oscillator in each solid.',
      'Make A much bigger than B: the peak moves toward A, but the slopes still match there.',
      'Notice how flat the total is near its top on this scale — yet 1 unit of S/k is a factor of e in the number of microstates.',
    ],
    params: {
      x: [0, 400], y: [0, 800], aspect: 'wide', xlabel: 'quanta in A', ylabel: 'S / k', axesAt: 'edge',
      sliders: [
        { key: 'NA', label: 'Oscillators in A, $N_A$', min: 50, max: 400, step: 10, value: 300, explain: 'Solid A’s size.' },
        { key: 'NB', label: 'Oscillators in B, $N_B$', min: 50, max: 400, step: 10, value: 200, explain: 'Solid B’s size.' },
        { key: 'q', label: 'Quanta shared, $q$', min: 50, max: 400, step: 10, value: 300, explain: 'The fixed total energy, in quanta.' },
        { key: 'a', label: 'Split: quanta in A, $q_A$', min: 1, max: 399, step: 1, value: 60, explain: 'Where the energy currently sits (it stops at q − 1).' },
      ],
      curves: [
        { fn: sExpr('NA', 'x'), domain: [0.001, 'q - 0.001'], color: 'accent', label: 'S(A)/k', labelAt: 'q*0.9', labelDy: -12 },
        { fn: sExpr('NB', 'q - x'), domain: [0.001, 'q - 0.001'], color: 'warn', label: 'S(B)/k', labelAt: 'q*0.1', labelDy: -12 },
        { fn: `${sExpr('NA', 'x')} + ${sExpr('NB', 'q - x')}`, domain: [0.001, 'q - 0.001'], color: 'gold', width: 2.8, label: 'total', labelAt: 'q*0.5', labelDy: -14 },
      ],
      vlines: [{ x: 'min(a, q - 1)', color: 'ink2' }],
      points: [{ x: 'min(a, q - 1)', y: `${sExpr('NA', 'min(a, q - 1)')} + ${sExpr('NB', 'q - min(a, q - 1)')}`, r: 5, color: 'gold' }],
      readouts: [
        { label: '$q_A$', expr: 'min(a, q - 1)', digits: 3 },
        { label: '$S_\\text{total}/k$', expr: `${sExpr('NA', 'min(a, q - 1)')} + ${sExpr('NB', 'q - min(a, q - 1)')}`, digits: 4 },
        { label: 'slope of $S_A/k$', expr: 'ln(1 + NA/min(a, q - 1))', digits: 3 },
        { label: 'slope of $S_B/k$', expr: 'ln(1 + NB/(q - min(a, q - 1)))', digits: 3 },
      ],
    },
    caption: 'Entropies from Stirling’s large-N form of ln Ω for Einstein solids (accurate to well under 1% at these sizes). Slopes are per quantum: dS/dq in units of k.',
  },
  example: {
    prompt: t`Solids of $N_A = 300$ and $N_B = 200$ oscillators share 100 quanta. Energy starts with $q_A = ${EX.a0}$ and flows until $q_A = ${EX.a1}$, the most probable split. Find the entropies before and after, and how much more likely the final macrostate is.`,
    visual: einPic({ mode: 'pair', NA: 300, NB: 200, q: 100, start: EX.a0, panels: 'bars', scale: 'log' }, 'The multiplicities of all splits on a log scale, so their heights are proportional to S/k; the starting split in gold.'),
    steps: [
      { label: 'Before', text: t`$S_A/k = \ln\binom{319}{20} = ${fmt(EX.SA0, 4)}$ and $S_B/k = \ln\binom{279}{80} = ${fmt(EX.SB0, 4)}$: total $${fmt(EX.SA0 + EX.SB0, 4)}$.` },
      { label: 'After', text: t`$S_A/k = ${fmt(EX.SA1, 4)}$, $S_B/k = ${fmt(EX.SB1, 4)}$: total $${fmt(EX.SA1 + EX.SB1, 4)}$. A gained more entropy than B lost.` },
      { label: 'Change', text: t`$\Delta S/k = ${fmt(EX.dS, 4)}$, so $\Delta S = ${fmt(EX.dS, 4)}\times1.381\times10^{-23} = ${texNum(EX.dS * KB, 3)}$ J/K.` },
      { label: 'Odds', text: t`The final macrostate has $e^{${fmt(EX.dS, 3)}} \approx 10^{${fmt(EX.dS / LN10, 3)}}$ times as many microstates. Even for 500 oscillators, flowing back is a one-in-a-trillion event.` },
      { label: 'Sense check', text: t`A tiny $\Delta S$ in J/K is a huge factor in probability: a macroscopic $\Delta S$ of 1 J/K is a factor of $e^{7\times10^{22}}$.` },
    ],
    answer: t`$S/k$ rises from $${fmt(EX.SA0 + EX.SB0, 4)}$ to $${fmt(EX.SA1 + EX.SB1, 4)}$: $\Delta S = ${texNum(EX.dS * KB, 3)}$ J/K, a factor of about $10^{12}$ in probability.`,
  },
  practice: [
    num({
      id: 's-from-omega', difficulty: 1,
      gen(r) {
        const m = r.pick([20, 50, 100, 300]), S = KB * m * LN10;
        return {
          prompt: t`A macrostate has $\Omega = 10^{${m}}$ microstates. What is its entropy?`,
          answer: S, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: KB * m, feedback: t`$\ln 10^{${m}} = ${m}\ln 10$, not ${m}: use the natural log.` }, { value: m * LN10, feedback: t`That is $S/k$. Multiply by $k$ for J/K.` }], S),
          hints: [t`$S = k\ln\Omega = k\cdot${m}\ln10$.`],
          teach: t`$S = k\ln\Omega$, with the natural logarithm.`,
          explain: t`$S = (1.381\times10^{-23})(${m}\times2.3026) = ${texNum(S, 3)}$ J/K.`,
          visual: { type: 'graph', params: { x: [0, 320], y: [0, 1.1e-20 * 1e21], aspect: 'wide', xlabel: 'log₁₀ Ω', ylabel: 'S (10⁻²¹ J/K)', axesAt: 'edge', curves: [{ fn: `${r4(KB * LN10 * 1e21)}*x`, color: 'accent' }], vlines: [{ x: m, label: `Ω = 10^${m}`.replace(/\^(\d+)/, (z, d) => [...d].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')), color: 'gold' }] }, caption: 'Entropy grows only like the logarithm of the multiplicity: multiplying Ω by ten adds the same k ln 10 every time.' },
        };
      },
    }),
    num({
      id: 'coins-mole', difficulty: 2,
      gen(r) {
        const n = r.pick([0.5, 1, 2]), S = n * NA * KB * Math.LN2;
        return {
          prompt: t`$${n}$ mol of two-state particles — $${texNum(n * NA, 3)}$ of them — can be in any of their $2^N$ microstates. What is $S = k\ln 2^N$?`,
          answer: S, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: n * NA * KB * LN10 * Math.log10(2) * 2, feedback: 'ln 2ᴺ = N ln 2: one factor of ln 2.' }, { value: n * NA * Math.LN2, feedback: 'Multiply by k.' }], S),
          hints: [t`$\ln 2^N = N\ln 2$.`, t`$Nk = nR$, so $S = nR\ln 2$.`],
          teach: t`$N$ independent two-state particles have $S = Nk\ln 2 = nR\ln2$ when all microstates are allowed.`,
          explain: t`$S = Nk\ln2 = nR\ln 2 = (${n})(8.314)(0.6931) = ${fmt(S, 3)}$ J/K.`,
          visual: h2Pic('Entropy per particle of a two-state system against the fraction in one state (large N). At an even split it is ln 2 ≈ 0.693.'),
        };
      },
    }),
    mcq({
      id: 'additive', difficulty: 2,
      prompt: 'Why is entropy defined with a logarithm, so that the entropies of two separate systems add?',
      choices: [
        t`Combined, their multiplicities multiply ($\Omega = \Omega_A\Omega_B$), and ln turns products into sums`,
        'Logarithms make entropy always positive',
        'Measured entropies happen to add, so a log was fitted to the data',
        'Without the log, the units would be wrong',
      ],
      answer: 0,
      why: { 1: 'ln Ω is never negative anyway (Ω ≥ 1), but that is not the reason.', 2: 'Additivity follows from counting: it was derived, not fitted.', 3: 'The units come from k, not from the logarithm.' },
      hints: [t`How many microstates does the pair have, if A has $\Omega_A$ and B has $\Omega_B$?`],
      teach: 'Multiplicities multiply; their logarithms, the entropies, add.',
      explain: t`Every microstate of A can go with every microstate of B: $\Omega = \Omega_A\Omega_B$, so $k\ln\Omega = k\ln\Omega_A + k\ln\Omega_B$. Entropy is extensive because of the log.`,
      visual: einPic({ mode: 'pair', NA: 3, NB: 3, q: 4, start: 2, panels: 'cells', cells: true }, 'Two small solids: one microstate of A paired with one of B. Every choice for A can combine with every choice for B.'),
    }),
    num({
      id: 'dS-pair', difficulty: 3,
      gen(r) {
        const NA2 = r.pick([10, 20, 30]), NB2 = r.pick([10, 20]), q = r.pick([20, 30]), a = r.int(0, 3);
        const d = pairDist(NA2, NB2, q), dS = d.lnPeak - d.lnW[a];
        return {
          prompt: t`Solids with $N_A = ${NA2}$ and $N_B = ${NB2}$ share $q = ${q}$ quanta. Energy flows from $q_A = ${a}$ to the most probable split, $q_A = ${d.peak}$. What is $\Delta S/k$?`,
          answer: dS, tol: { rel: 0.01 },
          errors: apart([{ value: Math.exp(dS), feedback: t`That is $\Omega_\text{after}/\Omega_\text{before}$. Take its natural log.` }, { value: dS / LN10, feedback: 'Use the natural log, not log₁₀.' }], dS),
          hints: [t`$\Delta S/k = \ln(\Omega_A\Omega_B)_\text{after} - \ln(\Omega_A\Omega_B)_\text{before}$.`, t`Use $\Omega(N, q) = \binom{q + N - 1}{q}$ for each solid.`],
          teach: t`$\Delta S/k = \ln(\Omega_f/\Omega_i)$.`,
          explain: t`Before: $\ln(\Omega_A\Omega_B) = ${fmt(d.lnW[a], 4)}$; after: $${fmt(d.lnPeak, 4)}$. $\Delta S/k = ${fmt(dS, 4)}$ — the final split has $${texNum(Math.exp(dS), 3)}$ times as many microstates.`,
          visual: einPic({ mode: 'pair', NA: NA2, NB: NB2, q, start: a, panels: 'bars', scale: 'log', hide: ['peak'] }, `The multiplicities of all splits on a log scale (heights ∝ S/k); the starting split in gold.`),
        };
      },
    }),
    num({
      id: 'einstein-highT', difficulty: 2,
      gen(r) {
        const x = r.pick([5, 10, 20, 50, 100]), v = Math.log(x) + 1;
        return {
          prompt: t`For an Einstein solid with $q \gg N$, $\Omega \approx (eq/N)^N$. What is the entropy per oscillator, $S/(Nk)$, when there are $${x}$ quanta per oscillator?`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: Math.log(x), feedback: t`$\ln(eq/N) = \ln(q/N) + 1$: keep the 1.` }, { value: Math.log10(x) + 1 / LN10, feedback: 'Use the natural log.' }], v),
          hints: [t`$S = k\ln\Omega = Nk\ln(eq/N)$.`],
          teach: t`High-temperature Einstein solid: $S = Nk[\ln(q/N) + 1]$.`,
          explain: t`$S/(Nk) = \ln ${x} + 1 = ${fmt(v, 4)}$. Each extra factor of $e$ in the quanta per oscillator adds $Nk$ of entropy.`,
          visual: { type: 'graph', params: { x: [0, 110], y: [0, 6], aspect: 'wide', xlabel: 'quanta per oscillator, q / N', ylabel: 'S / Nk', axesAt: 'edge', curves: [{ fn: '(1+x)*ln(1+x) - x*ln(x)', domain: [0.001, 110], color: 'accent' }], vlines: [{ x, label: `q/N = ${x}`, color: 'gold' }] }, caption: 'The entropy per oscillator of an Einstein solid (Stirling’s large-N form) against the quanta per oscillator: it keeps rising, ever more slowly.' },
        };
      },
    }),
    mcq({
      id: 'never-decrease', difficulty: 2,
      prompt: 'Water in a freezer turns to ice, and the ice’s entropy is lower than the water’s. Does this violate the second law?',
      choices: [
        'No: the water gives heat to the freezer and the room, whose entropy rises by more; the second law concerns the total of an isolated system',
        'Yes, but only slightly, because ice is only slightly more ordered',
        'No, because the second law does not apply to water',
        'Yes, which is why freezers need electricity to overcome it',
      ],
      answer: 0,
      why: { 1: 'The second law is about the total entropy of an isolated system; one part may decrease.', 2: 'It applies to everything — water included.', 3: 'The freezer obeys the law: its electrical work lets it dump extra heat (and entropy) into the room.' },
      hints: ['Is the water an isolated system?', 'Where does the water’s heat go?'],
      teach: 'Only the total entropy of an isolated system must not decrease; a part of it can.',
      explain: t`The water loses entropy, but the heat it gives up raises the entropy of its surroundings by more: $\Delta S_\text{total} \ge 0$. “A system’s entropy can never decrease” is a common misreading.`,
      visual: h2Pic('An aside: entropy per particle of a two-state system peaks at an even split. Ordered states (left and right edges) have low entropy — but any part of a system may lose entropy if the rest gains more.', 0.5),
    }),
    num({
      id: 'odds', difficulty: 3,
      gen(r) {
        const e = r.pick([-22, -21, -20]), m = r.pick([1, 2, 5]), dS = m * 10 ** e, v = dS / KB / LN10;
        return {
          prompt: t`A process raises the total entropy by $\Delta S = ${m}\times10^{${e}}$ J/K. By what factor does the number of microstates grow? Give $\log_{10}$ of the factor.`,
          answer: v, tol: { rel: 0.01 },
          errors: apart([{ value: dS / KB, feedback: 'That is ln of the factor (ΔS/k). Divide by ln 10 for log₁₀.' }, { value: Math.log10(dS / KB), feedback: t`The factor is $e^{\Delta S/k}$, not $\Delta S/k$.` }], v),
          hints: [t`$\Omega_f/\Omega_i = e^{\Delta S/k}$.`, t`$\log_{10}(\Omega_f/\Omega_i) = \dfrac{\Delta S}{k\ln 10}$.`],
          teach: t`A change in entropy is a ratio of multiplicities: $\Omega_f/\Omega_i = e^{\Delta S/k}$.`,
          explain: t`$\Delta S/k = ${fmt(dS / KB, 4)}$, so the factor is $e^{${fmt(dS / KB, 4)}} = 10^{${fmt(v, 4)}}$ — from an entropy change far too small to measure.`,
          visual: { type: 'graph', params: { x: [0, 55], y: [0, 1800], aspect: 'wide', xlabel: 'ΔS (10⁻²¹ J/K)', ylabel: 'log₁₀(Ωf / Ωi)', axesAt: 'edge', curves: [{ fn: `x*1e-21/${KB}/ln(10)`, color: 'accent' }], vlines: [{ x: r4(dS * 1e21), color: 'gold' }] }, caption: 'The log of the multiplicity ratio grows in proportion to the entropy change; a zeptojoule per kelvin is already a factor of 10³⁰.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-black-hole', difficulty: 3, transfer: true,
      gen(r) {
        const [name, Ms] = r.pick([['a black hole of one solar mass', 1], ['the black hole in Cygnus X-1, about 21 solar masses', 21], ['Sagittarius A*, the 4.3-million-solar-mass black hole at the centre of the Milky Way', 4.3e6]]);
        const m = Ms * MSUN, v = sBH(m);
        return {
          prompt: t`Theory (Bekenstein and Hawking) assigns a black hole the entropy $S = \dfrac{k c^3 A}{4G\hbar}$, where $A = 4\pi r_s^2$ is its horizon area and $r_s = 2GM/c^2$; this gives $S/k = \dfrac{4\pi G M^2}{\hbar c}$. Compute $S/k$ for ${name}. ($M_\odot = 1.989\times10^{30}$ kg.)`,
          answer: v, tol: { rel: 0.02 },
          errors: apart([{ value: v * KB, feedback: 'That is S in J/K. The question asks for S/k.' }, { value: (4 * Math.PI * G * m) / (HBAR * CL), feedback: t`$S$ grows as $M^2$: square the mass.` }], v),
          hints: [t`$S/k = 4\pi G M^2/(\hbar c)$ with $G = 6.674\times10^{-11}$, $\hbar = 1.055\times10^{-34}$, $c = 3.00\times10^{8}$ (SI).`, t`$M = ${texNum(m, 3)}$ kg.`],
          teach: 'A black hole’s entropy grows with its horizon area, M² — the largest entropy anything of that mass can have.',
          explain: t`$S/k = \dfrac{4\pi(6.674\times10^{-11})(${texNum(m, 3)})^2}{(1.055\times10^{-34})(3.00\times10^{8})} = ${texNum(v, 3)}$. For comparison, the Sun’s own entropy is roughly $10^{58}k$. **Status:** this formula is a theoretical result (from quantum field theory near a horizon); no black-hole entropy has been measured. Lesson T11.2 develops it.`,
          visual: { type: 'graph', params: { x: [-0.5, 7], y: [75, 92], aspect: 'wide', xlabel: 'log₁₀(M / M☉)', ylabel: 'log₁₀(S / k), no scale shown', yticks: 0, axesAt: 'edge', curves: [{ fn: `${r4(Math.log10(sBH(MSUN)))} + 2*x`, color: 'violet' }], vlines: [{ x: r4(Math.log10(Ms)), color: 'gold' }] }, caption: 'The shape of the Bekenstein–Hawking entropy against mass on log axes: a straight line of slope 2 (the vertical scale is left off). A theoretical prediction, not a measurement.' },
        };
      },
    }),
    num({
      id: 'cp-share', difficulty: 3,
      gen(r) {
        const x = r.pick([20, 50, 100]), k = r.int(20, 22), N = 10 ** k;
        const dSk = N * (Math.log(x) + 1 - 2 * Math.LN2), dS = dSk * KB;
        return {
          prompt: t`Two identical Einstein solids, each of $N = 10^{${k}}$ oscillators, start with all $q = ${x}N$ quanta in B (A has none, so $S_A = 0$). They come to the even split. Using $S \approx Nk[\ln(q/N) + 1]$ for a solid with many quanta per oscillator, find the entropy gained.`,
          answer: dS, units: 'J/K', tol: { rel: 0.01 },
          errors: apart([{ value: dSk, feedback: 'That is ΔS/k. Multiply by k for J/K.' }, { value: N * KB * (Math.log(x / 2) + 1), feedback: 'Count both solids at the end: each holds q/2 quanta, and B’s starting entropy must be subtracted.' }], dS),
          hints: [t`Before: $S_B = Nk[\ln ${x} + 1]$. After: each has $${x / 2}$ quanta per oscillator.`, t`$\Delta S = 2Nk[\ln ${x / 2} + 1] - Nk[\ln ${x} + 1] = Nk[\ln ${x} + 1 - 2\ln 2]$.`],
          teach: 'Spreading energy over more oscillators raises the total entropy.',
          explain: t`$\Delta S = Nk[\ln ${x} + 1 - 2\ln2] = 10^{${k}}(1.381\times10^{-23})(${fmt(Math.log(x) + 1 - 2 * Math.LN2, 4)}) = ${fmt(dS, 3)}$ J/K — a factor of $e^{${texNum(dSk, 3)}}$ in multiplicity.`,
          visual: { type: 'graph', params: { x: [0, 110], y: [0, 6], aspect: 'wide', xlabel: 'quanta per oscillator', ylabel: 'S / Nk', axesAt: 'edge', curves: [{ fn: 'ln(x) + 1', domain: [0.5, 110], color: 'accent' }], points: [{ x, y: r4(Math.log(x) + 1), r: 5, color: 'warn', label: 'B before', labelDx: 8 }, { x: x / 2, y: r4(Math.log(x / 2) + 1), r: 5, color: 'gold', label: 'each after', labelDx: 8, labelDy: 12 }] }, caption: 'S per oscillator in the many-quanta limit. Halving each solid’s share costs B little entropy per oscillator; A, starting from zero, gains much more.' },
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: 'If a system’s multiplicity doubles, its entropy:',
      choices: [t`increases by $k\ln 2 \approx 9.6\times10^{-24}$ J/K`, 'doubles', t`increases by $2k$`, 'is unchanged unless the energy changes'],
      answer: 0,
      why: { 1: 'Entropy is the log: doubling Ω adds ln 2 to ln Ω.', 2: 'ln(2Ω) − ln Ω = ln 2, not 2.', 3: 'Entropy depends on Ω, whatever changed it.' },
      hints: [t`$S = k\ln\Omega$; compare $k\ln(2\Omega)$ with $k\ln\Omega$.`],
      teach: 'Multiplying Ω adds to S.',
      explain: t`$k\ln(2\Omega) = k\ln\Omega + k\ln2$: an addition of $9.57\times10^{-24}$ J/K.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 2.5], aspect: 'wide', xlabel: 'Ω (relative)', ylabel: 'S / k (relative)', axesAt: 'edge', curves: [{ fn: 'ln(x)', domain: [1, 10], color: 'accent' }], points: [{ x: 2, y: r4(Math.log(2)), r: 5, color: 'gold', label: 'Ω', labelDx: 8 }, { x: 4, y: r4(Math.log(4)), r: 5, color: 'gold', label: '2Ω', labelDx: 8 }] }, caption: 'S/k = ln Ω: each doubling of Ω climbs the same step.' },
    }),
  ],
  sources: [
    { label: 'Schroeder, An Introduction to Thermal Physics, §2.6', url: 'https://physics.weber.edu/thermal/' },
    { label: 'Wald, The Thermodynamics of Black Holes, Living Rev. Relativ. 4, 6 (2001)', url: 'https://arxiv.org/abs/gr-qc/9912119' },
  ],
});
