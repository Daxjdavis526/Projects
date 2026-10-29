// Writing a lab report and abstract — the report's anatomy (abstract,
// introduction, methods, results, uncertainty budget, discussion,
// conclusion) and the abstract's five moves (purpose, method, result with
// uncertainty, comparison in standard uncertainties, conclusion); reporting
// numbers (uncertainty to two significant figures, the value to the same
// decimal place, the concise 9.794(28) form); wording a comparison by its z
// rather than by adjectives; what goes in methods and what in results.
// The Compton-scattering run of lab.E.12 as the worked abstract, and a
// rocket-engine test's specific impulse as the transfer.
// Every number is computed here; the Compton values come from the seeded
// model of the labg-rig simulation (_labg.js).
import { lesson, mcq, num, order, match, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { G, rig, resT, zT, SIMNOTE } from './_labg.js';
import { r6 } from './_labf.js';

const t = String.raw;

// ── the worked abstract: the recalibrated Compton run of lab.E.12 (seed 3) ──
const CO = G.run('compton', { seed: 3, analysis: 'each' });
const RC = CO.results[0];

/** value ± u with u to two significant figures, as { v, u, dec }. */
function round2(v, u) {
  let p = Math.floor(Math.log10(u)) - 1;
  let ur = Math.round(u / 10 ** p) * 10 ** p;
  p = Math.floor(Math.log10(ur)) - 1;
  ur = Math.round(u / 10 ** p) * 10 ** p;
  const dec = Math.max(0, -p);
  return { v: (Math.round(v / 10 ** p) * 10 ** p).toFixed(dec), u: ur.toFixed(dec), dec, digits: Math.round(ur / 10 ** p) };
}

const numberLine = (x, u, ref, uref, caption) => ({ type: 'graph', params: { aspect: 'wide', x: [r6(Math.min(x - 3 * u, ref - 3 * (uref || u))), r6(Math.max(x + 3 * u, ref + 3 * (uref || u)))], y: [0, 3], xlabel: 'value', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ param: [`${r6(x - u)} + ${r6(2 * u)}*t`, '2'], t: [0, 1], color: 'accent', width: 3 }, ...(uref ? [{ param: [`${r6(ref - uref)} + ${r6(2 * uref)}*t`, '1'], t: [0, 1], color: 'good', width: 3 }] : [])], points: [{ x: r6(x), y: 2, r: 5, color: 'accent', label: 'measured' }, { x: r6(ref), y: 1, r: 5, color: 'good', label: 'reference' }] }, caption });

export default lesson({
  id: 'lab.A11.2',
  title: 'Writing a lab report and abstract',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`A report is an argument from evidence: what you asked, what you did, what you found, how sure you are, and what it means. Most readers stop after the **abstract**, so it carries the whole argument in five moves — purpose, method, result **with its uncertainty**, comparison, conclusion. The comparison is a number, not an adjective: how many combined standard uncertainties separate your value from the reference,

$$z = \frac{x - x_{\text{ref}}}{\sqrt{u^2 + u_{\text{ref}}^2}}$$

“Agrees within $0.4\sigma$” is checkable; “good agreement” is not. Numbers are reported with the uncertainty to one or two significant figures and the value rounded to the same decimal place: $9.794 \pm 0.028\ \text{m/s}^2$, or in the concise form $9.794(28)\ \text{m/s}^2$.`,
  symbols: [
    { tex: 'z', text: 'the discrepancy in combined standard uncertainties (see [agreement within uncertainty](#/lesson/lab.A4.1))' },
    { tex: 'x,\\ u', text: 'your result and its standard uncertainty (all sources combined)' },
    { tex: 'x_{\\text{ref}},\\ u_{\\text{ref}}', text: 'the reference value and its uncertainty: zero for an exact constant such as $c$ or $h$ in the 2019 SI' },
  ],
  why: t`Lab courses at USU are “communications-intensive” for a reason: a measurement nobody can read, check or reproduce has not been made.`,
  visual: {
    type: 'graph',
    title: 'Wording a comparison',
    lead: t`Your result (blue, with its $\pm1\sigma$ bar) against a reference value (green). Move the result and its uncertainty. The readouts give $z$ and the two-sided probability of a discrepancy at least this large if the two really agree — the numbers your sentence should report.`,
    tasks: [
      'Put the result 0.5 units from the reference with u = 0.5: z = 1, p ≈ 0.32 — “consistent with the reference (z = 1.0)”.',
      'Shrink u to 0.15 at the same offset: z ≈ 3.3, p ≈ 0.001 — now the sentence must report a discrepancy and look for its cause.',
      'Make u large, 1.5: z is small, but the result says little. Report the uncertainty plainly; agreement within a huge error bar is weak evidence.',
    ],
    params: {
      aspect: 'wide', x: [-4, 4], y: [0, 3], xlabel: 'value (offset from the reference)', ylabel: '', yticks: 0, axesAt: 'edge',
      sliders: [
        { key: 'xm', label: 'Result $x$ (offset from the reference)', min: -3, max: 3, step: 0.05, value: 0.5, unit: '', explain: 'Your measured value, measured from the reference value.' },
        { key: 'u', label: 'Its standard uncertainty $u$', min: 0.05, max: 2, step: 0.01, value: 0.5, unit: '', explain: 'All sources combined, at one standard deviation.' },
      ],
      curves: [{ param: ['xm - u + 2*u*t', '2'], t: [0, 1], color: 'accent', width: 3 }],
      points: [{ x: 'xm', y: 2, r: 5, color: 'accent', label: 'result' }, { x: 0, y: 1, r: 5, color: 'good', label: 'reference (exact)' }],
      vlines: [{ x: 0, color: 'good' }],
      readouts: [{ label: '$z = x/u$', expr: 'xm/u', digits: 2 }, { label: 'two-sided $p$', expr: 'erfc(abs(xm/u)/sqrt(2))', digits: 2, zero: 0 }],
    },
    caption: t`Assumes a Gaussian uncertainty and an exact reference. $p$ is the probability of $|z|$ at least this large by chance alone; it is not the probability that your result is right.`,
  },
  example: {
    prompt: t`Write the abstract for the Compton-scattering run of [lab.E.12](#/lesson/lab.E.12): Cs-137 gammas (661.657 keV) scattered from an aluminium rod into a NaI(Tl) detector at seven angles from 30° to 120°, the gain re-measured on the Cs-137 line before each angle, $1/E' - 1/E$ fitted against $1 - \cos\theta$. The fit gives $m_ec^2 = ${RC.value.toFixed(3)}$ keV with standard uncertainty $${RC.sigma.toFixed(3)}$ keV; CODATA 2022 gives 510.998 950 69 keV.`,
    visual: rig('compton', { seed: 3, analysis: 'each', raw: false }, t`The run being written up: the linearized data, the weighted fit and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Purpose', text: t`One sentence: “We tested the Compton formula and measured the electron’s rest energy.” Not the history of quantum mechanics.` },
      { label: 'Method', text: t`What a reader needs to judge the result: source and energy, scatterer, detector, angles, the linearization, and the gain correction — the step a sceptic would ask about.` },
      { label: 'Round the result', text: t`$u = ${RC.sigma.toFixed(3)}$ keV to two figures is $${round2(RC.value, RC.sigma).u}$ keV, so the value is rounded to the same place: $m_ec^2 = ${round2(RC.value, RC.sigma).v} \pm ${round2(RC.value, RC.sigma).u}$ keV.` },
      { label: 'Compare', text: t`CODATA’s value is exact for this purpose: $z = (${RC.value.toFixed(2)} - 511.00)/${RC.sigma.toFixed(2)} = ${zT(RC.z, 2)}$. Report $z$, not “excellent agreement”.` },
      { label: 'Conclude', text: t`What the comparison means, and the limit: “consistent with CODATA; the uncertainty is dominated by photopeak statistics at large angles.” One sentence, earned by the numbers above it.` },
      { label: 'Say it is simulated', text: t`These data came from a simulation, and an honest abstract says so — exactly as it would name a real detector.` },
    ],
    answer: t`“We measured the energy of Cs-137 gamma rays (661.7 keV) Compton-scattered from an aluminium rod at seven angles between 30° and 120° with a NaI(Tl) detector, correcting the gain drift by re-measuring the 661.7 keV line before each angle. A weighted fit of $1/E' - 1/E$ against $1 - \cos\theta$ gives the electron rest energy $m_ec^2 = ${round2(RC.value, RC.sigma).v} \pm ${round2(RC.value, RC.sigma).u}$ keV, consistent with the CODATA value 510.999 keV ($z = ${zT(RC.z)}$). The uncertainty is dominated by counting statistics at large angles. (Simulated data.)”`,
  },
  practice: [
    num({
      id: 'round', difficulty: 2,
      gen(r) {
        const u = r.float(0.011, 0.094, 0.0001) * r.pick([1, 10, 100]), v = r.float(2, 90, 0.000001) * (u > 1 ? 10 : 1);
        const R = round2(v, u);
        const ans = +R.v;
        return {
          prompt: t`A calculation prints $x = ${v.toFixed(6)}$ with standard uncertainty $u = ${u.toFixed(5)}$. Rounding $u$ to two significant figures, what value of $x$ should you report?`,
          visual: numberLine(v, u, v, 0, 'The value and its ±1σ interval: digits far smaller than the bar carry no information.'),
          answer: ans, tol: { rel: 0, abs: 10 ** -R.dec / 2.1 },
          errors: [{ value: +v.toFixed(6), feedback: 'Do not copy every digit: round the value to the decimal place of the rounded uncertainty.' }].filter((e) => Math.abs(e.value - ans) > 10 ** -R.dec / 2),
          hints: [t`$u$ to two significant figures is $${R.u}$: its last digit is in the ${R.dec === 0 ? 'units' : `${R.dec}${R.dec === 1 ? 'st' : R.dec === 2 ? 'nd' : R.dec === 3 ? 'rd' : 'th'} decimal`} place.`, 'Round x to that same place.'],
          teach: 'Round the uncertainty to one or two significant figures, then the value to the same decimal place.',
          explain: t`$u \to ${R.u}$, so $x \to ${R.v}$: report $${R.v} \pm ${R.u}$, or concisely $${R.v}(${R.digits})$.`,
        };
      },
    }),
    num({
      id: 'concise', difficulty: 2,
      gen(r) {
        const dec = r.pick([3, 4, 5, 6]), digits = r.int(11, 99), v = r.float(1, 20, 10 ** -dec);
        const ans = digits * 10 ** -dec;
        return {
          prompt: t`A result is quoted in concise form as $${v.toFixed(dec)}(${digits})$. What is its standard uncertainty?`,
          visual: numberLine(v, ans, v, 0, 'The concise form puts the uncertainty’s digits in brackets, aligned with the value’s last digits.'),
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: digits, feedback: 'The bracketed digits apply to the last digits of the value, not to the units place.' }, { value: digits * 10 ** -(dec - 1), feedback: `Align the ${String(digits).length} bracketed digits with the value’s last ${String(digits).length} digits.` }].filter((e) => Math.abs(e.value - ans) > 0.002 * ans),
          hints: ['The bracket’s last digit sits under the value’s last digit.'],
          teach: 'In 9.794(28), the (28) means ±0.028: the bracket’s digits align with the value’s last ones.',
          explain: t`$${v.toFixed(dec)}(${digits}) = ${v.toFixed(dec)} \pm ${tex(ans, 2)}$. CODATA uses this form: the electron’s mass is $9.109\,383\,7139(28)\times10^{-31}$ kg.`,
        };
      },
    }),
    mcq({
      id: 'best-abstract', difficulty: 2,
      prompt: t`Which abstract does its job?`,
      visual: numberLine(9.794, 0.028, 9.80, 0, 'The result being reported: 9.794 ± 0.028 m/s² against a local reference of 9.800 m/s².'),
      choices: [
        '“We measured g from the period of a pendulum at eight lengths: g = 9.794 ± 0.028 m/s², consistent with the local value 9.800 m/s² (z = −0.2). Timing dominates the uncertainty.”',
        '“The pendulum is one of the oldest instruments in physics. In this lab we used it to explore gravity and found excellent agreement with theory.”',
        '“We measured g = 9.79415823 m/s² with a pendulum, in good agreement with the accepted value.”',
        '“Using a pendulum, we found g. Our percent error was 0.06 %, so the experiment was a success.”',
      ],
      answer: 0,
      why: {
        1: 'History and adjectives, but no result, no uncertainty and no comparison a reader can check.',
        2: 'Eight decimals and no uncertainty: the digits are meaningless and the agreement unjudgeable.',
        3: 'Percent error against the reference is not a significance test, and “success” is not a conclusion about physics.',
      },
      hints: ['Look for: method, result with uncertainty, comparison in σ, and what limits it.'],
      teach: 'An abstract states the method, the result with its uncertainty, the comparison in standard uncertainties, and the limiting factor.',
      explain: t`The first gives everything a reader needs in 40 words. Percent error ignores the uncertainty: 0.06 % could be 0.1σ or 10σ depending on $u$.`,
    }),
    order({
      id: 'sections', difficulty: 1,
      prompt: t`Put the sections of a lab report in their usual order.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 7], y: [0, 1], axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [0, 1, 2, 3, 4, 5].map((k) => ({ param: [`${0.5 + k} + 0.8*t`, '0.5'], t: [0, 1], color: k === 0 ? 'gold' : 'accent', width: 14 })) }, caption: 'A report as a sequence of sections, the abstract (gold) first. Schematic.' },
      items: ['Abstract', 'Introduction and theory', 'Methods and apparatus', 'Results (figures, tables, the uncertainty budget)', 'Discussion', 'Conclusion'],
      hints: ['The abstract summarizes everything, so it comes first even though it is written last.'],
      teach: 'Abstract, introduction, methods, results, discussion, conclusion: the reader can stop after any section and know where they are.',
      explain: t`Results report what was measured; the discussion interprets it — systematics, comparison, what the residuals say; the conclusion states what was learned in a sentence or two.`,
    }),
    match({
      id: 'which-section', difficulty: 2,
      prompt: t`Which section does each sentence belong in?`,
      visual: rig('muon', { seed: 4, analysis: 'cut', residuals: false }, t`A muon-lifetime run, to be written up. ${SIMNOTE}`),
      left: ['“Delays were histogrammed in 0.25 μs bins from 0 to 20 μs.”', '“The fit from 1 μs gives τ = 2.11 ± 0.06 μs.”', '“The deficit from 2.197 μs is expected from μ⁻ capture in carbon.”', '“Muons decay with a lifetime that sets the strength of the weak interaction.”'],
      right: ['Methods', 'Results', 'Discussion', 'Introduction', 'Abstract only'],
      answer: [0, 1, 2, 3],
      hints: ['What was done → methods; what came out → results; what it means → discussion; why anyone cares → introduction.'],
      teach: 'Methods say what you did, results what you found, discussion what it means.',
      explain: t`Keeping interpretation out of the results section lets a reader see the evidence before your reading of it.`,
    }),
    num({
      id: 'z-ref', difficulty: 2,
      gen(r) {
        const x = r.float(6.60, 6.75, 0.001), u = r.float(0.010, 0.030, 0.001), ref = 6.6743, uref = 0.00015;
        const ans = (x - ref) / Math.hypot(u, uref);
        return {
          prompt: t`A Cavendish-balance group reports $G = (${x.toFixed(3)} \pm ${u.toFixed(3)})\times10^{-11}$ SI. CODATA 2022 gives $(6.674\,30 \pm 0.000\,15)\times10^{-11}$. What is $z$?`,
          visual: numberLine(x, u, ref, uref, 'The result and CODATA’s value, each with its ±1σ bar (CODATA’s is far too short to see).'),
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: -ans, feedback: 'z = (yours − reference)/σ: positive when yours is higher.' }].filter((e) => Math.abs(ans) > 0.05),
          hints: [t`Combine in quadrature: $\sqrt{u^2 + u_{\text{ref}}^2}$ — here $u_{\text{ref}}$ is negligible.`],
          teach: 'When the reference’s uncertainty is far smaller than yours, z is just your discrepancy over your u.',
          explain: t`$z = (${x.toFixed(3)} - 6.6743)/\sqrt{${u.toFixed(3)}^2 + 0.00015^2} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    code({
      id: 'fmt-pm', difficulty: 3,
      prompt: t`Write \`fmt_pm(x, u)\` that returns the string \`"x ± u"\` with \`u\` rounded to two significant figures and \`x\` to the same decimal place, and \`fmt_concise(x, u)\` that returns \`"x(dd)"\`. Assume $u < 10$, so there is at least one decimal place. Watch $u = 0.0996$, which rounds to $0.10$.`,
      starter: t`import math

def decimals(u):
    # how many decimal places two significant figures of u need
    return 0

def fmt_pm(x, u):
    return ""

def fmt_concise(x, u):
    return ""

print(fmt_pm(9.79415823, 0.02817), fmt_concise(9.79415823, 0.02817))
print(fmt_pm(1.234567, 0.0996))`,
      answer: t`import math

def decimals(u):
    # how many decimal places two significant figures of u need
    d = 1 - math.floor(math.log10(u))
    if round(u, d) >= 10 ** (2 - d):     # 0.0996 -> 0.10: one place fewer
        d -= 1
    return d

def fmt_pm(x, u):
    d = decimals(u)
    return f"{x:.{d}f} ± {u:.{d}f}"

def fmt_concise(x, u):
    d = decimals(u)
    return f"{x:.{d}f}({round(u * 10**d)})"

print(fmt_pm(9.79415823, 0.02817), fmt_concise(9.79415823, 0.02817))
print(fmt_pm(1.234567, 0.0996))`,
      tests: [
        { name: '9.79415823 ± 0.02817 → "9.794 ± 0.028"', code: 'fmt_pm(9.79415823, 0.02817) == "9.794 ± 0.028"' },
        { name: 'concise form "9.794(28)"', code: 'fmt_concise(9.79415823, 0.02817) == "9.794(28)"' },
        { name: 'u = 0.0996 rounds to 0.10 and the value to two places', code: 'fmt_pm(1.234567, 0.0996) == "1.23 ± 0.10"' },
        { name: 'a large uncertainty: 511.4 ± 1.63 → "511.4 ± 1.6"', code: 'fmt_pm(511.4, 1.63) == "511.4 ± 1.6"' },
      ],
      hints: [t`Two significant figures of $u$ need $1 - \lfloor\log_{10}u\rfloor$ decimal places (0.028 → 3).`, t`If rounding pushes $u$ up to the next power of ten (0.0996 → 0.100), use one place fewer. Then \`f"{x:.{d}f}"\` rounds for you.`],
      teach: 'Rounding rules are mechanical, so automate them: every number in a report should come from the same function.',
      explain: t`Formatting in code rather than by hand means the abstract, the tables and the figure caption can never disagree — the theme of [recording analysis so it can be rerun](#/lesson/lab.A13.1).`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-isp', difficulty: 2, transfer: true,
      prompt: t`A static-fire test measures a small engine’s specific impulse as $231 \pm 4$ s; the design prediction is 238 s with an estimated uncertainty of 3 s. Which concluding sentence is right?`,
      visual: numberLine(231, 4, 238, 3, 'The measured specific impulse and the design prediction, each ±1σ.'),
      choices: ['“The measured specific impulse is 1.4σ below the prediction (z = −1.4): not a significant shortfall, but worth tracking in later firings.”', '“The engine failed to meet its predicted performance by 3 %.”', '“The measurement agrees perfectly with the prediction, since the error bars overlap.”', '“The prediction is wrong.”'],
      answer: 0,
      why: { 1: 'A 3 % shortfall stated without its uncertainty overstates what one firing shows.', 2: 'Overlap is not a test, and “perfectly” is not what 1.4σ means.', 3: 'A 1.4σ difference is not evidence that anything is wrong.' },
      hints: [t`$z = (231 - 238)/\sqrt{4^2 + 3^2}$.`],
      teach: 'A conclusion reports z and what it does and does not establish.',
      explain: t`$z = -7/5 = -1.4$: a difference of this size happens by chance about 16 % of the time. The honest sentence says so — and suggests what would settle it (more firings, a smaller uncertainty).`,
    }),
    num({
      id: 'cp-round', difficulty: 2,
      gen(r) {
        const u = r.float(0.0012, 0.0094, 0.00001), v = r.float(0.2, 2.5, 0.0000001);
        const R = round2(v, u);
        const ans = +R.u;
        return {
          prompt: t`A fit gives $${v.toFixed(7)} \pm ${u.toFixed(6)}$. What uncertainty should you write, rounded to two significant figures?`,
          visual: numberLine(v, u, v, 0, 'The result and its ±1σ interval.'),
          answer: ans, tol: { rel: 0, abs: 10 ** -R.dec / 2.1 },
          errors: [{ value: +u.toFixed(6), feedback: 'Two significant figures of the uncertainty are enough: more digits only repeat the noise.' }].filter((e) => Math.abs(e.value - ans) > 10 ** -R.dec / 2),
          hints: ['Find the first nonzero digit of u, keep it and the next one.'],
          teach: 'An uncertainty is itself uncertain by tens of per cent unless N is huge: two significant figures are plenty.',
          explain: t`$u = ${R.u}$, and the value $${R.v}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-adjective', difficulty: 2,
      prompt: t`Your result is $z = 4.6$ from the accepted value. Which is the right next sentence in the discussion?`,
      visual: numberLine(10.46, 0.1, 10, 0, 'A result 4.6 standard uncertainties above the reference.'),
      choices: ['Name the candidate systematic errors, estimate each one’s size, and say which could explain 4.6σ', '“The discrepancy is due to human error.”', '“The result is within 5 % of the accepted value, so it is acceptable.”', 'Enlarge the uncertainty until z is below 2'],
      answer: 0,
      why: { 1: '“Human error” names no mechanism and cannot be tested.', 2: 'Percent difference ignores the uncertainty you worked to estimate.', 3: 'Inflating u to force agreement is falsifying the result.' },
      hints: ['What would a reader need in order to believe — or improve — the result?'],
      teach: 'A significant discrepancy is reported, not explained away: list the candidate systematics and their sizes.',
      explain: t`A 4.6σ discrepancy is information: either an unrecognized systematic or new physics, and almost always the former. Naming candidates and their sizes turns it into a plan for the next run.`,
    }),
  ],
  sources: [
    { label: 'JCGM 100:2008 (GUM), §7: reporting uncertainty', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf' },
    { label: 'USU PHYS 3870, Content of a Lab Report (J. R. Dennison)', url: 'https://www.physics.usu.edu/dennison/3870-3880/References/Content%20of%20Lab%20Report.pdf' },
    { label: 'AAPT, Recommendations for the Undergraduate Physics Laboratory Curriculum (2014): communicating physics', url: 'https://www.aapt.org/Resources/upload/LabGuidlinesDocument_EBendorsed_nov10.pdf' },
  ],
});
