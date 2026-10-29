// The lab course's boss, “The Blind Analysis”: a colleague's instrument sends
// two columns of numbers and nothing else. Recognize the law from the data
// (residuals, a log–log slope), linearize it, read and judge the fit (error
// bars carried through a square, χ²/ν), propagate to a physical result with a
// Type B budget, interpret the intercept, then unblind — remove the hidden
// offset the analysis was carrying — compare honestly, and defend the result
// (what to do with a disagreement, how much more data a smaller σ costs).
// It turns out to be a pendulum. Every number comes from a seeded generator.
import { boss, mcq, num } from '../../src/core/content.js';
import { linfit, dataGraph, resGraph, normals, r6 } from './_labf.js';
import { tex } from '../../src/core/format.js';

const t = String.raw;
const GLOC = 9.7998;                 // m/s²: the local g (illustrative value, as from a gravimeter survey)
const LS = [0.20, 0.40, 0.60, 0.80, 1.00, 1.20];
const ST = 0.004;                    // s: σ of each period (100 swings timed)

/** A seeded data set: periods at six lengths (true length L + dL), the T² line fit and the blinding offset. */
function dataset(seed, dL = 0) {
  const z = normals(seed);
  const T = LS.map((L) => +(2 * Math.PI * Math.sqrt((L + dL) / GLOC) + ST * z()).toFixed(4));
  const T2 = T.map((v) => v * v), s2 = T.map((v) => 2 * v * ST);
  const fit = linfit(LS, T2, s2);
  const raw = linfit(LS, T, ST);                      // the naive straight line through T itself
  const blind = +(0.3 * (z() > 0 ? 1 : -1) * (0.5 + Math.abs(z()) / 2)).toFixed(3);   // m/s², hidden
  return { T, T2, s2, fit, raw, blind };
}
const gOf = (b) => (4 * Math.PI ** 2) / b;
// the intercept question: lengths read to the top of a bob 12 mm across, so the true length is L + 6 mm
const IC = dataset(33, 0.006), dIC = (IC.fit.a * GLOC) / (4 * Math.PI ** 2);

export default boss({
  title: 'The Blind Analysis',
  intro: t`A colleague’s instrument has sent you two columns of numbers — $x$ and $y$, each $y$ with a stated σ of $0.004$ — and nothing else: no units, no apparatus, no expected answer. Your analysis software adds a hidden offset to the final result until you declare the analysis finished, so that nothing you see can steer you toward the answer you expect. Find the law, fit it, propagate the errors, unblind, and defend what you get.`,
  pass: 0.7,
  rounds: [
    {
      title: 'What law is this?',
      story: t`The data arrive. Before fitting anything, look at them — and at what a careless straight line leaves behind.`,
      items: [
        mcq({
          id: 'r1-residuals', skill: 'lab.A6.2', difficulty: 2,
          prompt: t`A straight line fitted to $y$ against $x$ leaves these residuals: negative at both ends, positive in the middle, each many times its error bar. What do they say?`,
          visual: (() => { const D = dataset(3); return { type: 'graph', params: resGraph({ xs: LS, res: D.raw.res, sy: ST, xlabel: 'x', ylabel: 'y − line' }), caption: 'Residuals of a straight-line fit to the raw data, with ±1σ bars.' }; })(),
          choices: [
            'The relationship is curved: a straight line is the wrong model, whatever its χ²',
            'The error bars are too small and should be enlarged until χ²/ν = 1',
            'The two end points are outliers and should be dropped',
            'The data are fine: residuals always alternate in sign',
          ],
          answer: 0,
          why: {
            1: 'Inflating the bars hides the pattern without explaining it. A smooth arch is a model problem, not a noise problem.',
            2: 'Both ends deviate the same way and smoothly: that is the signature of curvature, not of two bad readings.',
            3: 'Random residuals change sign irregularly. A smooth arch, many σ high, is systematic.',
          },
          hints: ['Are the residuals random, or do they follow a smooth pattern?', 'What shape do the residuals of a line fitted to a curve make?'],
          teach: 'Residuals with a shape mean the model is wrong; fix the model before trusting any number from the fit.',
          explain: t`An arch of residuals is the fingerprint of a curve fitted by a line. The cure is a different model — or a different plot that makes the curve straight.`,
        }),
        num({
          id: 'r1-exponent', skill: 'lab.A10.2', difficulty: 3,
          gen(r) {
            const D = dataset(r.int(1, 9999));
            const i = r.pick([0, 1]), j = r.pick([4, 5]);
            const ans = Math.log(D.T[j] / D.T[i]) / Math.log(LS[j] / LS[i]);
            return {
              prompt: t`Suppose $y = Ax^n$. From two of the readings, $y = ${D.T[i].toFixed(4)}$ at $x = ${LS[i].toFixed(2)}$ and $y = ${D.T[j].toFixed(4)}$ at $x = ${LS[j].toFixed(2)}$, estimate the exponent $n$.`,
              visual: { type: 'graph', params: dataGraph({ xs: LS, ys: D.T, sy: ST, xlabel: 'x', ylabel: 'y' }), caption: 'The raw data with ±1σ bars (too small to see).' },
              answer: ans, tol: { rel: 0.01 },
              errors: [{ value: (D.T[j] - D.T[i]) / (LS[j] - LS[i]), feedback: t`That is the slope of $y$ against $x$. For a power law use logarithms: $n = \ln(y_2/y_1)/\ln(x_2/x_1)$.` }],
              hints: [t`$\ln y = \ln A + n\ln x$: on log–log axes a power law is a straight line of slope $n$.`, t`$n = \ln(y_2/y_1)/\ln(x_2/x_1)$.`],
              teach: 'A power law is a straight line on log–log axes, with the exponent as its slope.',
              explain: t`$n = \ln(${D.T[j].toFixed(4)}/${D.T[i].toFixed(4)})/\ln(${LS[j].toFixed(2)}/${LS[i].toFixed(2)}) = ${ans.toFixed(3)}$ — a half: $y \propto \sqrt x$.`,
            };
          },
        }),
        mcq({
          id: 'r1-linearize', skill: 'lab.A10.2', difficulty: 2,
          prompt: t`With $y \propto \sqrt x$, which plot should be a straight line through the origin?`,
          visual: (() => { const D = dataset(4); return { type: 'graph', params: dataGraph({ xs: LS, ys: D.T, sy: ST, xlabel: 'x', ylabel: 'y' }), caption: 'The raw data again: curving over like a square root.' }; })(),
          choices: [t`$y^2$ against $x$`, t`$y$ against $x^2$`, t`$\ln y$ against $x$`, t`$1/y$ against $x$`],
          answer: 0,
          why: {
            1: t`$y \propto \sqrt x$ means $y \propto (x^2)^{1/4}$: still curved.`,
            2: t`$\ln y$ against $x$ straightens an exponential, not a power law.`,
            3: t`$1/y \propto x^{-1/2}$: curved.`,
          },
          hints: [t`Square both sides of $y = A\sqrt x$.`],
          teach: 'Choose axes that turn the model into a line: here, square y.',
          explain: t`$y^2 = A^2x$: a straight line through the origin with slope $A^2$. Squaring $y$ also changes its error bars: $\sigma_{y^2} = 2y\sigma_y$.`,
        }),
      ],
    },
    {
      title: 'The fit',
      story: t`You plot $y^2$ against $x$ with error bars carried through the square, and fit a weighted line, intercept free.`,
      items: [
        num({
          id: 'r2-bar', skill: 'lab.A3.1', difficulty: 2,
          gen(r) {
            const D = dataset(r.int(1, 9999)), i = r.int(0, 5);
            const ans = 2 * D.T[i] * ST;
            return {
              prompt: t`The reading at $x = ${LS[i].toFixed(2)}$ is $y = ${D.T[i].toFixed(4)} \pm 0.004$. What is the standard uncertainty of $y^2$?`,
              visual: { type: 'graph', params: dataGraph({ xs: LS, ys: D.T2, sy: D.s2, xlabel: 'x', ylabel: 'y²' }), caption: 'The squared data with their (small) error bars.' },
              answer: ans, tol: { rel: 0.01 },
              errors: [{ value: ST * ST, feedback: t`Squaring the uncertainty is not how it propagates: $\sigma_{y^2} = 2y\,\sigma_y$.` }, { value: ST, feedback: t`A power changes the relative uncertainty: $\sigma_{y^2}/y^2 = 2\sigma_y/y$.` }],
              hints: [t`For $f = y^2$, $\sigma_f = |df/dy|\,\sigma_y$.`, t`$\sigma_{y^2} = 2y\sigma_y$.`],
              teach: t`A square doubles the relative uncertainty: $\sigma_{y^2} = 2y\sigma_y$.`,
              explain: t`$\sigma_{y^2} = 2(${D.T[i].toFixed(4)})(0.004) = ${ans.toFixed(4)}$ — bigger for bigger $y$, so the weighted fit leans on the small-$x$ points.`,
            };
          },
        }),
        num({
          id: 'r2-chi2', skill: 'lab.A6.1', difficulty: 2,
          gen(r) {
            const D = dataset(r.int(1, 9999));
            const c = +D.fit.chi2.toFixed(2);
            const ans = c / 4;
            return {
              prompt: t`The weighted line through the six points of $y^2$ against $x$ (slope and intercept free) has $\chi^2 = ${c.toFixed(2)}$. What is the reduced $\chi^2$?`,
              visual: { type: 'graph', params: dataGraph({ xs: LS, ys: D.T2, sy: D.s2, fit: { a: D.fit.a, b: D.fit.b }, xlabel: 'x', ylabel: 'y²' }), caption: 'The squared data and the weighted line.' },
              answer: ans, tol: { rel: 0.01 },
              errors: [{ value: c / 6, feedback: 'Divide by the degrees of freedom: points minus fitted parameters, 6 − 2 = 4.' }, { value: c / 5, feedback: 'Two parameters were fitted (slope and intercept): ν = 6 − 2.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
              hints: [t`$\chi^2_\nu = \chi^2/\nu$.`, t`$\nu = N - (\text{number of fitted parameters}) = 6 - 2$.`],
              teach: t`Reduced $\chi^2$ is $\chi^2$ per degree of freedom; near 1 means the scatter matches the error bars.`,
              explain: t`$\chi^2/\nu = ${c.toFixed(2)}/4 = ${ans.toFixed(2)}$. ${ans < 0.25 ? 'Small — on its own not alarming with only 4 degrees of freedom, but a hint the bars may be generous.' : ans > 2.5 ? 'Large for 4 degrees of freedom: worth a second look at the residuals.' : 'Consistent with the stated bars.'}`,
            };
          },
        }),
        mcq({
          id: 'r2-small', skill: 'lab.A6.1', difficulty: 3,
          prompt: t`Suppose a second instrument, also claiming $\sigma = 0.004$ on each $y$, sends ten data sets whose fits give $\chi^2/\nu$ averaging 0.06. What does that say about its stated σ?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [0, 1.1], xlabel: 'χ²/ν', ylabel: 'probability density (ν = 4)', axesAt: 'edge', curves: [{ fn: '4*(4*x)*exp(-4*x/2)/4', color: 'accent' }], vlines: [{ x: 0.06, color: 'warn' }] }, caption: 'The distribution of χ²/ν for 4 degrees of freedom, and the observed average (orange).' },
          choices: [
            'It is about four times too big: the scatter is far smaller than the bars claim, so the quoted uncertainties are pessimistic',
            'It is too small: the fit is too good to be true, so σ should be shrunk by a factor of 0.06',
            'Nothing: a small χ² is always good news',
            'The model is wrong, as with an arched residual plot',
          ],
          answer: 0,
          why: {
            1: t`$\chi^2$ scales as $1/\sigma^2$: a factor 0.06 in $\chi^2$ is a factor $\sqrt{0.06} \approx 0.25$ in σ, not 0.06.`,
            2: 'A χ²/ν this small, repeatedly, means the error bars do not describe the scatter — which spoils every uncertainty derived from them.',
            3: 'A wrong model makes χ² too *large*, not too small.',
          },
          hints: [t`$\chi^2 = \sum (\text{residual}/\sigma)^2$: how does it scale if every σ is doubled?`, t`If the true σ is $s$ and the stated one is $\sigma$, $\chi^2/\nu \approx (s/\sigma)^2$.`],
          teach: 'A consistently tiny χ²/ν means overstated error bars: the real scatter is about √(χ²/ν) times the stated σ.',
          explain: t`$\chi^2/\nu \approx (s/\sigma)^2 = 0.06$ gives $s \approx 0.25\sigma = 0.001$: the instrument times better than its stated 0.004. Overstated bars make your final σ too large and hide real disagreements; ask the colleague how the 0.004 was estimated.`,
        }),
      ],
    },
    {
      title: 'From slope to physics',
      story: t`The colleague finally tells you: $x$ is a length in metres, $y$ a period in seconds. It is a pendulum, and the slope of $y^2$ against $x$ is $4\pi^2/g$.`,
      items: [
        num({
          id: 'r3-g', skill: 'lab.A3.2', difficulty: 3,
          gen(r) {
            const D = dataset(r.int(1, 9999));
            const b = +D.fit.b.toFixed(4), sb = +D.fit.sb.toFixed(4);
            const ans = (gOf(b) * sb) / b;
            return {
              prompt: t`The slope is $b = ${b.toFixed(4)} \pm ${sb.toFixed(4)}\ \text{s}^2/\text{m}$. With $g = 4\pi^2/b$ (blinded: the software will shift it later), what is the standard uncertainty of $g$? Answer in m/s².`,
              visual: { type: 'graph', params: dataGraph({ xs: LS, ys: D.T2, sy: D.s2, fit: { a: D.fit.a, b: D.fit.b }, xlabel: 'L (m)', ylabel: 'T² (s²)' }), caption: 'Period squared against length with the weighted line.' },
              answer: ans, units: 'm/s^2', tol: { rel: 0.02 },
              errors: [{ value: (4 * Math.PI ** 2 * sb) / b, feedback: t`$g = 4\pi^2/b$: the relative uncertainty carries over, $\sigma_g = g\,\sigma_b/b$ — divide by $b$ twice in all.` }],
              hints: [t`For $g = k/b$, $\sigma_g/g = \sigma_b/b$.`, t`$\sigma_g = (4\pi^2/b)(\sigma_b/b)$.`],
              teach: t`An inverse keeps the relative uncertainty: $\sigma_g/g = \sigma_b/b$.`,
              explain: t`$g = 4\pi^2/${b.toFixed(4)} = ${gOf(b).toFixed(4)}$ m/s² and $\sigma_g = g \times ${(sb / b).toFixed(5)} = ${ans.toFixed(4)}$ m/s².`,
            };
          },
        }),
        num({
          id: 'r3-typeB', skill: 'lab.A3.1', difficulty: 3,
          gen(r) {
            const stat = r.pick([0.04, 0.06, 0.08]), tape = r.pick([0.05, 0.1, 0.2]), clock = r.pick([0.01, 0.02]);
            const ans = Math.hypot(stat, tape, 2 * clock);
            return {
              prompt: t`The fit gives $g$ to $${stat}\%$. The tape that measured every length is calibrated to $${tape}\%$ (a scale factor on all of them), and the timer’s clock rate to $${clock}\%$. What is the combined relative uncertainty of $g$, in percent?`,
              visual: { type: 'graph', params: { aspect: 'wide', x: [0, 0.32], y: [0.4, 4], xlabel: 'relative uncertainty (%)', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ param: [`${stat}*t`, '3'], t: [0, 1], color: 'accent', width: 11 }, { param: [`${tape}*t`, '2'], t: [0, 1], color: 'violet', width: 11 }, { param: [`${2 * clock}*t`, '1'], t: [0, 1], color: 'accent', width: 11 }], points: [{ x: 0, y: 3.42, r: 0, label: 'fit', labelDx: 2, labelDy: 0, color: 'ink2' }, { x: 0, y: 2.42, r: 0, label: 'tape scale', labelDx: 2, labelDy: 0, color: 'ink2' }, { x: 0, y: 1.42, r: 0, label: 'clock rate, doubled', labelDx: 2, labelDy: 0, color: 'ink2' }] }, caption: 'The three contributions to scale (the clock’s doubled because g ∝ 1/T²).' },
              answer: ans, units: '%', tol: { rel: 0.01 },
              errors: [{ value: Math.hypot(stat, tape, clock), feedback: t`$g = 4\pi^2L/T^2$: a clock error enters squared, so it counts twice.` }, { value: stat + tape + 2 * clock, feedback: 'Independent contributions add in quadrature.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
              hints: [t`$g \propto L/T^2$: the tape enters once, the clock twice.`, t`Combine $\sqrt{s^2 + t^2 + (2c)^2}$.`],
              teach: 'Each input enters with its power; independent ones add in quadrature.',
              explain: t`$\sqrt{${stat}^2 + ${tape}^2 + (2 \times ${clock})^2} = ${ans.toFixed(3)}\%$. A scale error on the tape is invisible to the fit — it is a Type B term that only calibration can bound.`,
            };
          },
        }),
        mcq({
          id: 'r3-intercept', skill: 'lab.E.25', difficulty: 3,
          prompt: t`The fit’s intercept is $+${IC.fit.a.toFixed(3)} \pm ${IC.fit.sa.toFixed(3)}\ \text{s}^2$, ${(IC.fit.a / IC.fit.sa).toFixed(1)}σ from zero. The lengths were measured from the pivot to the *top* of the bob. What is the most likely reading of this?`,
          visual: { type: 'graph', params: dataGraph({ xs: LS, ys: IC.T2, sy: IC.s2, fit: { a: IC.fit.a, b: IC.fit.b }, xlabel: 'L (m)', ylabel: 'T² (s²)', x: [0, 1.3] }), caption: 'The line extended back toward L = 0.' },
          choices: [
            t`The true pendulum length is $L + \delta$, with $\delta$ about the bob’s radius: $T^2 = (4\pi^2/g)(L + \delta)$ puts $4\pi^2\delta/g$ in the intercept and leaves the slope — and $g$ — unbiased`,
            t`$g$ is wrong by 3σ and the run must be discarded`,
            'The line should be forced through the origin to remove the intercept',
            'The period was timed with a constant delay',
          ],
          answer: 0,
          why: {
            1: 'The intercept is exactly where a constant length offset goes; the slope carries g untouched.',
            2: 'Forcing the origin would push the length offset into the slope and bias g — the resonance tube’s lesson.',
            3: t`A constant timing delay would add to $T$, not to $T^2$ linearly in $L$; and timing many swings divides any delay away.`,
          },
          hints: [t`Write $T^2$ with the true length $L + \delta$.`, t`Which coefficient of the line does a constant $\delta$ change?`],
          teach: 'An unknown constant offset in the knob lands in the intercept: leave the intercept free and the slope stays honest.',
          explain: t`$4\pi^2\delta/g = ${IC.fit.a.toFixed(3)}\ \text{s}^2$ gives $\delta = ag/4\pi^2 = ${(1000 * dIC).toFixed(1)}$ mm: about the radius of a bob a centimetre or so across, measured to its top. The free intercept absorbed it — the same move as the end correction in the [speed of sound](#/lesson/lab.E.25).`,
        }),
      ],
    },
    {
      title: 'Unblind and defend',
      story: t`You declare the analysis finished. The software reveals the offset it has been adding to $g$ all along, and you compare with the local value from a gravimeter survey, $9.7998\ \text{m/s}^2$ (illustrative; its own uncertainty negligible).`,
      items: [
        num({
          id: 'r4-z', skill: 'lab.A4.1', difficulty: 3,
          gen(r) {
            const D = dataset(r.int(1, 9999));
            const g = gOf(D.fit.b), sg = (g * D.fit.sb) / D.fit.b;
            const gb = +(g + D.blind).toFixed(4), s = +sg.toFixed(4);
            const ans = (gb - D.blind - GLOC) / s;
            return {
              prompt: t`Your blinded result was $g = ${gb.toFixed(4)} \pm ${s.toFixed(4)}$ m/s². The software now reveals that it had added $${D.blind > 0 ? '+' : ''}${D.blind.toFixed(3)}$ m/s². Remove the offset and give $z$ against $9.7998$ m/s², with its sign.`,
              visual: { type: 'graph', params: dataGraph({ xs: LS, ys: D.T2, sy: D.s2, fit: { a: D.fit.a, b: D.fit.b }, xlabel: 'L (m)', ylabel: 'T² (s²)', curves: [{ fn: `${r6((4 * Math.PI ** 2) / GLOC)}*x`, color: 'good', dash: true }] }), caption: 'The fit (gold) and the line the local g predicts through the origin (dashed green).' },
              answer: ans, tol: { rel: 0, abs: 0.08 },
              errors: [{ value: (gb - GLOC) / s, feedback: 'Remove the blinding offset first: subtract what the software added.' }, { value: (gb + D.blind - GLOC) / s, feedback: 'The software *added* the offset; subtract it to undo it.' }].filter((e) => Math.abs(e.value - ans) > 0.3),
              hints: [t`Unblinded $g = g_\text{blind} - \text{offset}$.`, t`$z = (g - 9.7998)/\sigma$.`],
              teach: 'Unblinding removes the hidden offset only after every analysis choice is frozen; then compare in units of σ.',
              explain: t`$g = ${gb.toFixed(4)} - (${D.blind.toFixed(3)}) = ${(gb - D.blind).toFixed(4)}$ m/s²; $z = (${(gb - D.blind).toFixed(4)} - 9.7998)/${s.toFixed(4)} = ${ans.toFixed(2)}$.`,
            };
          },
        }),
        mcq({
          id: 'r4-honest', skill: 'lab.A7.1', difficulty: 3,
          prompt: t`Suppose that after unblinding your $g$ sits $3.5\sigma$ from the survey value. What is the honest next step?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-5, 5], y: [0, 0.45], xlabel: 'z', ylabel: 'density', axesAt: 'edge', curves: [{ fn: 'e^(-x^2/2)/sqrt(2pi)', color: 'accent' }], vlines: [{ x: 3.5, color: 'warn' }] }, caption: 'The standard normal, with z = 3.5 marked: about a 1-in-2000 two-sided chance by scatter alone.' },
          choices: [
            'Report the result as it stands; look for a systematic, and if you find one, justify its correction independently and report both the change and why — never adopt a correction because it restores agreement',
            'Re-blind, change the fit range until the result agrees, then unblind again',
            'Drop the point with the largest residual and refit',
            'Double the error bars so that z falls below 2',
          ],
          answer: 0,
          why: {
            1: 'Tuning choices after seeing the answer is exactly what blinding exists to prevent: it manufactures agreement.',
            2: 'Removing data because of the answer it gives is selection bias; a point is dropped only for a documented, independent reason.',
            3: 'Inflating σ without a reason hides a possibly real effect and misreports your precision.',
          },
          hints: ['Why did you blind the analysis in the first place?', 'Which actions are decided by the answer rather than by the measurement?'],
          teach: 'After unblinding, the result is reported as found; any later correction must stand on its own evidence and be disclosed.',
          explain: t`Blinding protects the analysis from your expectations. Once unblinded, a disagreement is a finding: report it, investigate (the tape’s calibration, the amplitude correction, the pivot), and if a real systematic turns up, publish the corrected value *with* the story of the correction ([calibration and systematic error](#/lesson/lab.A7.1)).`,
        }),
        num({
          id: 'r4-more', skill: 'lab.A2.1', difficulty: 2, transfer: true,
          gen(r) {
            const f = r.pick([2, 3, 4]), n0 = 6;
            const ans = n0 * f * f;
            return {
              prompt: t`A reviewer of the spacecraft-navigation paper that will use this $g$ asks for a statistical uncertainty ${f} times smaller. If the scatter stays the same and you repeat the same six lengths, how many readings must you take in all?`,
              visual: { type: 'graph', params: { aspect: 'wide', x: [0, 160], y: [0, 1.05], xlabel: 'number of readings N', ylabel: 'σ (relative to 6 readings)', axesAt: 'edge', curves: [{ fn: 'sqrt(6/x)', color: 'accent', domain: [6, 160] }], points: [{ x: 6, y: 1, color: 'gold', label: 'now' }] }, caption: 'Statistical uncertainty against the number of readings: σ ∝ 1/√N (the systematics do not shrink).' },
              answer: ans, tol: { rel: 0, abs: 0.5 },
              errors: [{ value: n0 * f, feedback: t`σ falls as $1/\sqrt N$: to divide it by ${f} you need ${f}² times the readings.` }],
              hints: [t`$\sigma \propto 1/\sqrt N$.`, t`$N = 6 \times ${f}^2$.`],
              teach: 'Halving a statistical uncertainty costs four times the data — and does nothing for the systematics.',
              explain: t`$N = 6 \times ${f}^2 = ${ans}$. Before paying for it, check the budget: if the tape’s calibration already dominates, more swings will not help.`,
            };
          },
        }),
      ],
    },
  ],
});
