// Agreement within uncertainty — compare two results by their difference in
// units of its combined standard uncertainty, z = |Δ|/σ_Δ: why overlapping
// error bars and "within 5 %" are the wrong tests, what "consistent" does and
// does not mean, comparing with an exact (SI-defined) constant, a shared
// systematic that cancels in the difference, and two real cases: Planck's
// constant from LEDs and the proton-radius puzzle.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, compare, SRC } from './_unc.js';

const t = String.raw;

// the worked example: Planck's constant from LED turn-on voltages
const EX = { h: 6.4, s: 0.3, H: 6.62607015 };
EX.d = EX.H - EX.h; EX.z = Math.abs(EX.d) / EX.s;

const bars = (d, s1, s2) => ({
  type: 'graph',
  params: {
    aspect: 'wide', x: [-4, 9], y: [0.2, 3], xlabel: 'result (any unit)', ylabel: ' ', yticks: 0, xticks: 8, axesAt: 'edge',
    sliders: [
      { key: 'd', label: 'Difference $\\Delta$', min: 0, max: 6, step: 0.1, value: d, unit: '', explain: 'How far apart the two central values are.' },
      { key: 's1', label: 'Uncertainty $\\sigma_1$', min: 0.2, max: 2.5, step: 0.05, value: s1, unit: '', explain: 'Standard uncertainty of the first result.' },
      { key: 's2', label: 'Uncertainty $\\sigma_2$', min: 0.2, max: 2.5, step: 0.05, value: s2, unit: '', explain: 'Standard uncertainty of the second result.' },
    ],
    curves: [
      { param: ['-s1 + 2*s1*t', '2'], t: [0, 1], color: 'accent', width: 3.5 },
      { param: ['-2*s1 + 4*s1*t', '2'], t: [0, 1], color: 'accent', width: 1, dash: [5, 4] },
      { param: ['d - s2 + 2*s2*t', '1'], t: [0, 1], color: 'violet', width: 3.5 },
      { param: ['d - 2*s2 + 4*s2*t', '1'], t: [0, 1], color: 'violet', width: 1, dash: [5, 4] },
    ],
    points: [{ x: 0, y: 2, color: 'accent', label: 'result 1', labelDy: -14 }, { x: 'd', y: 1, color: 'violet', label: 'result 2', labelDy: -14 }],
    readouts: [
      { label: t`$\sigma_\Delta = \sqrt{\sigma_1^2 + \sigma_2^2}$`, expr: 'sqrt(s1^2 + s2^2)', digits: 3 },
      { label: t`$z = \Delta/\sigma_\Delta$`, expr: 'd/sqrt(s1^2 + s2^2)', digits: 3 },
      { label: 'gap between the ±1σ bars', expr: 'd - s1 - s2', digits: 3, zero: 0 },
    ],
  },
});

export default lesson({
  id: 'lab.A4.1',
  title: 'Agreement within uncertainty',
  minutes: 13, difficulty: 2,
  lab: true,
  intro: t`Two results never agree exactly. The question is whether their difference is **larger than their uncertainties can explain**. Measure it in units of the difference’s own standard uncertainty:

$$z = \frac{|x_1 - x_2|}{\sqrt{\sigma_1^2 + \sigma_2^2}}$$

For independent, roughly Gaussian errors, $z$ below about 2 happens by chance often (one time in twenty reaches 2), so the results are **consistent**; $z$ of 3 or more happens by chance about once in 370 times, so something — usually a systematic error — needs explaining. Consistent does not mean equal, and two error bars that do or do not overlap is not the test.`,
  symbols: [
    { tex: 'x_1, x_2', text: 'the two results, in the same unit' },
    { tex: t`\sigma_1, \sigma_2`, text: 'their standard uncertainties (combined: Type A and Type B)' },
    { tex: t`\sigma_\Delta`, text: 'the standard uncertainty of the difference, $\\sqrt{\\sigma_1^2 + \\sigma_2^2}$ for independent results. Subtract $2\\,\\text{cov}$ if they share a systematic' },
    { tex: 'z', text: 'the discrepancy in standard uncertainties. Under 2: consistent; over 3: a real discrepancy, or underestimated uncertainties' },
  ],
  why: 'Every lab report ends with a comparison, and every discovery or anomaly in physics — from the proton radius to the Hubble tension — is a statement about z.',
  visual: {
    ...bars(2.0, 1.0, 1.0),
    title: 'Overlap is not the test',
    lead: t`Two results with their $\pm1\sigma$ (solid) and $\pm2\sigma$ (dashed) bars. The readouts give the combined uncertainty of the difference and $z$. Watch how little the overlap of the bars tells you.`,
    tasks: [
      'With σ₁ = σ₂ = 1, slide Δ until the solid bars just touch (Δ = 2): z is only 1.41.',
      'Make σ₂ tiny (0.2) and σ₁ large (2.5): bars overlap generously while z still approaches 1.',
      'Find a Δ where z = 2 with equal uncertainties: the solid bars are already well apart, the dashed ones still overlap.',
    ],
    caption: 'Bars are ±1σ (solid) and ±2σ (dashed) standard uncertainties of independent results.',
  },
  example: {
    prompt: t`A student finds Planck’s constant from the turn-on voltages of several LEDs: $h = (${EX.h.toFixed(1)} \pm ${EX.s.toFixed(1)}) \times 10^{-34}$ J s. Since 2019, $h = 6.626\,070\,15 \times 10^{-34}$ J s exactly, by definition of the SI. Do they agree?`,
    visual: compare([{ v: EX.h, s: EX.s, label: 'LED measurement' }, { v: EX.H, s: 0.0001, label: 'SI value (exact)', color: 'good' }], { xlabel: 'h (×10⁻³⁴ J s)', caption: 'The measurement with its ±1σ and ±2σ bars, and the exact SI value.' }),
    steps: [
      { label: 'Difference', text: t`$\Delta = ${EX.H.toFixed(3)} - ${EX.h.toFixed(1)} = ${EX.d.toFixed(3)} \times 10^{-34}$ J s.` },
      { label: 'Its uncertainty', text: t`The SI value is exact, so $\sigma_\Delta = \sqrt{${EX.s.toFixed(1)}^2 + 0^2} = ${EX.s.toFixed(1)} \times 10^{-34}$ J s.` },
      { label: 'z', text: t`$z = ${EX.d.toFixed(3)}/${EX.s.toFixed(1)} = ${EX.z.toFixed(2)}$.` },
      { label: 'Interpret', text: t`Under 1: the result is **consistent** with the exact value. A difference this size would arise by chance about ${Math.round(100 * M.pTwo(EX.z))}% of the time.` },
      { label: 'What it does not say', text: t`It does not prove the LED method right: with a ${(100 * EX.s / EX.h).toFixed(1)}% uncertainty it can only rule out errors larger than about ${(200 * EX.s / EX.h).toFixed(0)}%. And the “percent error” of ${(100 * EX.d / EX.H).toFixed(1)}% means nothing until compared with that ${(100 * EX.s / EX.h).toFixed(1)}% uncertainty.` },
    ],
    answer: t`$z = ${EX.z.toFixed(2)}$: consistent with the exact SI value, at the modest precision of the method.`,
  },
  practice: [
    num({
      id: 'z-two', difficulty: 1,
      gen(r) {
        const a = r.int(9750, 9850) / 1000, sa = r.int(8, 25) / 1000, b = +(a + r.sign() * r.int(10, 60) / 1000).toFixed(3), sb = r.int(8, 25) / 1000;
        const z = Math.abs(a - b) / Math.hypot(sa, sb);
        return {
          prompt: t`Two groups measure local $g$: $${a.toFixed(3)} \pm ${sa.toFixed(3)}\ \text{m/s}^2$ and $${b.toFixed(3)} \pm ${sb.toFixed(3)}\ \text{m/s}^2$ (independent). By how many standard uncertainties do they differ?`,
          visual: compare([{ v: a, s: sa, label: 'group 1' }, { v: b, s: sb, label: 'group 2', color: 'violet' }], { xlabel: 'g (m/s²)' }),
          answer: z, tol: { rel: 0.01 },
          errors: [{ value: Math.abs(a - b) / (sa + sb), feedback: 'Add the uncertainties in quadrature, not linearly.' }, { value: Math.abs(a - b) / Math.max(sa, sb), feedback: 'Both results are uncertain: combine both uncertainties.' }].filter((e) => Math.abs(e.value - z) > 0.015 * z),
          hints: [t`$\sigma_\Delta = \sqrt{${sa.toFixed(3)}^2 + ${sb.toFixed(3)}^2}$.`, t`$z = |\Delta|/\sigma_\Delta$.`],
          teach: 'Compare two independent results by their difference divided by the quadrature sum of their uncertainties.',
          explain: t`$\Delta = ${Math.abs(a - b).toFixed(3)}$, $\sigma_\Delta = ${Math.hypot(sa, sb).toFixed(4)}$, $z = ${z.toFixed(2)}$: ${z < 2 ? 'consistent' : z < 3 ? 'a mild tension worth a second look' : 'a real discrepancy — look for a systematic error'}.`,
        };
      },
    }),
    mcq({
      id: 'touching', difficulty: 2,
      prompt: 'Two results with equal uncertainties have ±1σ error bars that just touch. What is z?',
      visual: compare([{ v: 0, s: 1, label: 'result 1' }, { v: 2, s: 1, label: 'result 2', color: 'violet' }], { xlabel: 'result (units of σ)', caption: 'Solid ±1σ bars that just touch end to end.' }),
      choices: [t`$\sqrt 2 \approx 1.4$ — consistent`, '2 — borderline', '1 — perfect agreement', '0 — the bars touch, so they agree'],
      answer: 0,
      why: {
        1: t`$\Delta = 2\sigma$, but the difference’s uncertainty is $\sqrt2\,\sigma$, not $\sigma$.`,
        2: 'Agreement is judged by the difference over its uncertainty, not by whether the bars meet.',
        3: 'Touching bars still have a difference of 2σ between their centres.',
      },
      hints: [t`$\Delta = \sigma + \sigma$; $\sigma_\Delta = \sqrt{\sigma^2 + \sigma^2}$.`],
      teach: 'Error bars that just touch correspond to z = √2 ≈ 1.4: overlap is a poor test of agreement.',
      explain: t`$z = 2\sigma/(\sqrt2\,\sigma) = \sqrt2$. Bars can be well separated at $z = 2$ and still be consistent by the usual criterion; for one exact and one measured value, by contrast, touching means $z = 1$.`,
    }),
    mcq({
      id: 'five-percent', difficulty: 2,
      prompt: t`A lab manual says: “Your result is acceptable if it is within 5% of the accepted value.” You measure $c = (2.95 \pm 0.02) \times 10^8$ m/s. What is wrong with the manual’s test?`,
      visual: compare([{ v: 2.95, s: 0.02, label: 'measurement' }, { v: 2.99792458, s: 0.0001, label: 'c (exact)', color: 'good' }], { xlabel: 'c (×10⁸ m/s)', caption: 'The measurement with ±1σ and ±2σ bars, and the exact speed of light.' }),
      choices: [
        'It ignores the uncertainty: this result is within 2% yet 2.4σ away — a tension a percentage cannot reveal',
        'Nothing: 1.6% is well within 5%, so the result agrees',
        '5% is too generous; 1% would be the right threshold',
        'Percentages are fine but should be of the measured value, not the accepted one',
      ],
      answer: 0,
      why: {
        1: 'A percentage does not know how precise the measurement claims to be. A 1.6% difference is small for a ±10% method and large for a ±0.7% one.',
        2: 'Any fixed percentage has the same problem: the right yardstick is the stated uncertainty.',
        3: 'Which value you divide by hardly matters; the missing uncertainty does.',
      },
      hints: [t`Compute $z = |2.95 - 2.998|/0.02$.`],
      teach: 'Judge agreement in units of the uncertainty, not as a percentage of the accepted value.',
      explain: t`$z = 0.048/0.02 = 2.4$: either the uncertainty is underestimated or there is an uncorrected systematic error. Under the 5% rule it would pass unexamined.`,
    }),
    num({
      id: 'shared-sys', difficulty: 3,
      gen(r) {
        const a = r.int(4020, 4080) / 10, b = +(a + r.int(10, 30) / 10).toFixed(1), sr = r.pick([0.6, 0.8]), ss = r.pick([1.0, 1.2, 1.5]);
        const s1 = Math.hypot(sr, ss), z = (b - a) / Math.hypot(sr, sr), zNaive = (b - a) / Math.hypot(s1, s1);
        return {
          prompt: t`Two resonance frequencies of the same cavity, measured with the same frequency counter: $${a.toFixed(1)}$ Hz and $${b.toFixed(1)}$ Hz. Each has a random uncertainty of ${sr} Hz (independent) and a counter calibration uncertainty of ${ss} Hz (common to both). How many standard uncertainties apart are they?`,
          visual: compare([{ v: a, s: s1, label: 'first' }, { v: b, s: s1, label: 'second', color: 'violet' }], { xlabel: 'frequency (Hz)', caption: 'Each with its total uncertainty — including the part the two share.' }),
          answer: z, tol: { rel: 0.01 },
          errors: [{ value: zNaive, feedback: 'The calibration error is the same in both readings, so it cancels in their difference. Use only the independent parts.' }],
          hints: ['A calibration error shifts both readings by the same amount. What does it do to their difference?', t`$\sigma_\Delta = \sqrt{${sr}^2 + ${sr}^2}$: the shared ${ss} Hz cancels.`],
          teach: t`An uncertainty shared by both results cancels in their difference: leave it out of $\sigma_\Delta$.`,
          explain: t`$\sigma_\Delta = ${Math.hypot(sr, sr).toFixed(3)}$ Hz, so $z = ${(b - a).toFixed(1)}/${Math.hypot(sr, sr).toFixed(3)} = ${z.toFixed(2)}$. Counting the shared part would give $${zNaive.toFixed(2)}$ and hide a real difference.`,
        };
      },
    }),
    mcq({
      id: 'consistent-not-equal', difficulty: 2,
      prompt: t`A new measurement of a decay constant, $(5.2 \pm 1.5)$ s⁻¹, agrees with the reference value $5.65$ s⁻¹ at $z = 0.3$. A colleague concludes the measurement confirms the reference value precisely. What is the better statement?`,
      visual: compare([{ v: 5.2, s: 1.5, label: 'new' }, { v: 5.65, s: 0.01, label: 'reference', color: 'good' }], { xlabel: 'decay constant (s⁻¹)' }),
      choices: [
        'It is consistent with the reference, but with a 29% uncertainty it could not have detected a difference smaller than about 3 s⁻¹',
        'It confirms the reference to 0.3σ precision',
        'A z this small means something is wrong with the uncertainty',
        'It disagrees, because 5.2 is not 5.65',
      ],
      answer: 0,
      why: {
        1: 'z measures disagreement, not precision. A huge error bar makes almost anything “agree”.',
        2: 'z = 0.3 is entirely ordinary; it is a long run of tiny z values across many results that would suggest overestimated uncertainties.',
        3: 'Differences of a fraction of σ are expected from random error alone.',
      },
      hints: ['What range of true values would also have given z < 2 with this error bar?'],
      teach: '“Consistent” means the data cannot tell the values apart at their precision — not that they are equal.',
      explain: 'Any true value from about 2.2 to 8.2 s⁻¹ would be consistent at the 2σ level. A comparison is only as sharp as the larger uncertainty.',
    }),
    code({
      id: 'z-table', difficulty: 2,
      prompt: t`Several groups measured the same resistance, which a calibration lab gives as $100.02 \pm 0.01\ \Omega$. Compute an array \`z\` of each group’s discrepancy from the reference (combining both uncertainties), and \`flagged\`, the indices of groups with $z > 2$. Print both.`,
      starter: t`import numpy as np

R  = np.array([100.05, 99.91, 100.31, 100.00, 99.62])   # Ω
sR = np.array([0.04,   0.05,  0.08,   0.03,   0.10])    # Ω
R_ref, s_ref = 100.02, 0.01

z = None
flagged = None
print(z, flagged)
`,
      answer: t`import numpy as np

R  = np.array([100.05, 99.91, 100.31, 100.00, 99.62])   # Ω
sR = np.array([0.04,   0.05,  0.08,   0.03,   0.10])    # Ω
R_ref, s_ref = 100.02, 0.01

z = np.abs(R - R_ref) / np.sqrt(sR**2 + s_ref**2)
flagged = np.flatnonzero(z > 2)
print(z, flagged)`,
      tests: [
        { name: '`z` combines both uncertainties in quadrature', code: 'np.allclose(z, np.abs(R - 100.02)/np.sqrt(sR**2 + 0.0001))' },
        { name: '`flagged` holds groups 1, 2 and 4', code: 'list(flagged) == [1, 2, 4]' },
      ],
      hints: ['Vectorized: `np.abs(R - R_ref) / np.sqrt(sR**2 + s_ref**2)`.', '`np.flatnonzero(z > 2)` returns the indices where the condition holds.'],
      teach: 'A z-score table, computed in one line, shows at a glance which results need explaining.',
      explain: t`$z \approx 0.73, 2.2, 3.6, 0.63, 4.0$: groups 1, 2 and 4 (counting from 0) are flagged. Group 1 is flagged for a gap of only 0.11 Ω because it claims a small uncertainty: the same gap in ohms means different things for different error bars.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stands', difficulty: 2, transfer: true,
      gen(r) {
        const a = r.int(2200, 2260) / 100, sa = r.pick([0.2, 0.3]), b = +(a + r.int(50, 120) / 100).toFixed(2), sb = r.pick([0.3, 0.4]);
        const z = (b - a) / Math.hypot(sa, sb);
        return {
          prompt: t`The same rocket engine is fired on two test stands. Stand A measures a thrust of $${a.toFixed(2)} \pm ${sa}$ kN, stand B $${b.toFixed(2)} \pm ${sb}$ kN (independent calibrations). How many standard uncertainties apart are they?`,
          visual: compare([{ v: a, s: sa, label: 'stand A' }, { v: b, s: sb, label: 'stand B', color: 'violet' }], { xlabel: 'thrust (kN)' }),
          answer: z, tol: { rel: 0.01 },
          errors: [{ value: (b - a) / (sa + sb), feedback: 'Combine the uncertainties in quadrature.' }],
          hints: [t`$z = |\Delta|/\sqrt{\sigma_A^2 + \sigma_B^2}$.`],
          teach: 'Two independent measurements of one quantity are compared by z = |Δ|/√(σ₁² + σ₂²).',
          explain: t`$z = ${(b - a).toFixed(2)}/${Math.hypot(sa, sb).toFixed(3)} = ${z.toFixed(2)}$. ${z > 2 ? 'Over 2: before averaging the two, find out why the stands disagree — a load-cell calibration, thrust-line alignment or a different ambient pressure.' : 'Consistent: the stands agree within their uncertainties.'}`,
        };
      },
    }),
    num({
      id: 'cp-proton', difficulty: 2,
      prompt: t`The proton’s charge radius from muonic hydrogen (2013) was $0.84087 \pm 0.00039$ fm; the CODATA 2010 value, from ordinary hydrogen and electron scattering, was $0.8775 \pm 0.0051$ fm. How many standard uncertainties apart were they?`,
      visual: compare([{ v: 0.84087, s: 0.00039, label: 'muonic hydrogen (2013)' }, { v: 0.8775, s: 0.0051, label: 'CODATA 2010', color: 'violet' }], { xlabel: 'proton charge radius (fm)', caption: 'The two values with ±1σ and ±2σ bars.' }),
      answer: (0.8775 - 0.84087) / Math.hypot(0.00039, 0.0051), tol: { rel: 0.01 },
      errors: [{ value: (0.8775 - 0.84087) / 0.00039, feedback: t`Both results are uncertain: the larger, CODATA uncertainty dominates $\sigma_\Delta$.` }],
      hints: [t`$\sigma_\Delta = \sqrt{0.00039^2 + 0.0051^2}$ fm.`],
      teach: 'A discrepancy of many σ means the uncertainties do not describe the difference: something was missed.',
      explain: t`$\Delta = 0.0366$ fm, $\sigma_\Delta = 0.0051$ fm, $z = ${((0.8775 - 0.84087) / Math.hypot(0.00039, 0.0051)).toFixed(1)}$ — the “proton radius puzzle”. Newer ordinary-hydrogen measurements later came out near the small value, and CODATA 2018 adopted $0.8414(19)$ fm: the discrepancy pointed to underestimated errors in the older data, not to new physics.`,
    }),
    mcq({
      id: 'cp-big-z', difficulty: 2,
      prompt: 'Your result and a well-established reference differ by z = 3.8. What should you do first?',
      visual: compare([{ v: 0, s: 1, label: 'reference' }, { v: 3.8 * Math.SQRT2, s: 1, label: 'yours', color: 'warn' }], { xlabel: 'result (units of each σ)' }),
      choices: [
        'Look for an unaccounted systematic error or an underestimated uncertainty before claiming anything',
        'Announce a discovery: 3.8σ is very unlikely by chance',
        'Enlarge your uncertainty until z falls below 2',
        'Average your result with the reference to split the difference',
      ],
      answer: 0,
      why: {
        1: 'A chance probability of 10⁻⁴ is small, but forgotten systematics are far more common than new physics. Extraordinary claims need the systematics checked first.',
        2: 'Inflating an uncertainty to make agreement is dishonest unless you find and state a reason.',
        3: 'Averaging inconsistent results produces a number that matches neither. Resolve the discrepancy first.',
      },
      hints: ['What is the most common cause of a large discrepancy in practice?'],
      teach: 'A large z is a prompt to hunt for systematics, not a licence to inflate errors or average away the conflict.',
      explain: 'Check the calibration, the measurement model and every Type B estimate. If the discrepancy survives, report it honestly with your full uncertainty budget — that is how the proton-radius puzzle and the Hubble tension became known.',
    }),
  ],
  sources: [
    SRC.gum, SRC.taylor('ch. 2, 5'),
    { label: 'A. Antognini et al., “Proton structure from the measurement of 2S–2P transition frequencies of muonic hydrogen”, Science 339, 417 (2013)', url: 'https://doi.org/10.1126/science.1230016' },
    { label: 'E. Tiesinga et al., CODATA recommended values of the fundamental physical constants: 2018, Rev. Mod. Phys. 93, 025010 (2021)', url: 'https://physics.nist.gov/cuu/pdf/RevModPhys.93.025010.pdf' },
  ],
});
