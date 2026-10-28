// Hypothesis tests and p-values — the null hypothesis, a test statistic and
// the probability of a result at least as extreme if the null were true;
// one- and two-sided z tests, the χ² test of a fit (and what χ²/ν far below
// 1 means), what a p-value is not (ASA 2016), the look-elsewhere effect, the
// 5σ convention, and LIGO's first detection as the transfer.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, stat, SRC } from './_unc.js';

const t = String.raw;

const tail = (test, statv, extra = {}, caption) => stat('tail', { test, stat: statv, ...extra }, caption);
const ASA = { label: 'R. L. Wasserstein & N. A. Lazar, “The ASA Statement on p-Values: Context, Process, and Purpose”, The American Statistician 70, 129 (2016)', url: 'https://doi.org/10.1080/00031305.2016.1154108' };
const LIGO = { label: 'B. P. Abbott et al. (LIGO and Virgo), “Observation of Gravitational Waves from a Binary Black Hole Merger”, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' };

const EX = { chi2: 18.3, nu: 8 };
EX.p = M.chi2Sf(EX.chi2, EX.nu);

export default lesson({
  id: 'lab.A4.2',
  title: 'Hypothesis tests and p-values',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`A test starts from a **null hypothesis** $H_0$ — “the model is right and the error bars are honest”, “there is no signal”, “the two methods agree”. You compute a **test statistic** $T$ from the data ($z$, or $\chi^2$) and ask how often a result at least as extreme would occur **if $H_0$ were true**:

$$p = P\!\left(T \ge t_{\text{obs}} \;\middle|\; H_0\right)$$

A small $p$ says the data would be surprising under $H_0$. It is **not** the probability that $H_0$ is true, not the probability the result is “due to chance”, and not a measure of how big or important an effect is. For a fit, $\chi^2 = \sum_i \bigl((y_i - f(x_i))/\sigma_i\bigr)^2$ with $\nu$ = points − parameters, and $\chi^2/\nu \approx 1 \pm \sqrt{2/\nu}$ is what honest errors give.`,
  symbols: [
    { tex: 'H_0', text: 'the null hypothesis: the boring explanation the test tries to embarrass' },
    { tex: 'T', text: 'the test statistic, a number computed from the data whose distribution under $H_0$ is known' },
    { tex: t`t_{\text{obs}}`, text: 'the value of $T$ your data actually gave' },
    { tex: 'p', text: 'the p-value: the probability, assuming $H_0$, of a statistic at least as extreme as $t_{\\text{obs}}$' },
    { tex: t`\nu`, text: 'degrees of freedom of a χ² test: number of data points minus number of fitted parameters' },
  ],
  why: 'Goodness-of-fit judgements, claims of a signal, and every “discovery at 5σ” are p-values — and misreading them is the most common statistical error in science.',
  visual: {
    type: 'labx-stats',
    title: 'The χ² distribution and its tail',
    lead: t`How $\chi^2$ would scatter if the model were right and the error bars honest, for $\nu$ degrees of freedom. The shaded tail beyond the observed value is the p-value.`,
    tasks: [
      'Set ν = 8 and move the observed χ² to 8: p is about 0.43 — utterly ordinary.',
      'Move χ² to 18.3: p ≈ 0.02, a fit you should look at twice.',
      'Raise ν to 40: the distribution’s peak moves to about ν and narrows relative to it, so χ²/ν = 1.5 is now far more alarming than at ν = 8.',
    ],
    params: { mode: 'tail', test: 'chi2', nu: 8, stat: 8, controls: ['stat', 'nu'] },
  },
  example: {
    prompt: t`A straight line fitted to 10 data points with honest-looking error bars gives $\chi^2 = ${EX.chi2}$. Is the fit acceptable?`,
    visual: tail('chi2', EX.chi2, { nu: EX.nu }, t`The χ² distribution for $\nu = 8$ with the tail beyond 18.3 shaded.`),
    steps: [
      { label: 'Degrees of freedom', text: t`10 points minus 2 fitted parameters (slope and intercept): $\nu = 8$.` },
      { label: 'Expectation', text: t`If the line is right and the errors honest, $\chi^2$ averages $\nu = 8$ with standard deviation $\sqrt{2\nu} = 4$. So $\chi^2/\nu = ${(EX.chi2 / EX.nu).toFixed(2)}$ is high.` },
      { label: 'p-value', text: t`$p = P(\chi^2_8 \ge ${EX.chi2}) = ${EX.p.toFixed(3)}$ (from software or a table): if $H_0$ were true, a $\chi^2$ this large would happen about ${Math.round(100 * EX.p)} times in 100.` },
      { label: 'What it means', text: t`Either a rare fluctuation, or $H_0$ is wrong — the model (curvature?) or the error bars (too small?). Look at the residuals before deciding which.` },
      { label: 'What it does not mean', text: t`It does **not** mean there is a ${(100 * (1 - EX.p)).toFixed(0)}% chance the line is wrong. That would need prior beliefs about the alternatives — a Bayesian question.` },
    ],
    answer: t`$p = ${EX.p.toFixed(3)}$: the fit is suspicious, not condemned. Inspect the residuals for structure and re-examine the uncertainties.`,
  },
  practice: [
    num({
      id: 'p-two', difficulty: 2,
      gen(r) {
        const z = r.pick([1.5, 1.8, 2.2, 2.6, 3.0]);
        const p = M.pTwo(z);
        return {
          prompt: t`A measurement differs from a prediction by $z = ${z}$ standard uncertainties, in either direction counting as a discrepancy. What is the two-sided p-value?`,
          visual: tail('z2', z, {}, 'The standard normal distribution of z under the null hypothesis, both tails beyond ±z shaded.'),
          answer: p, tol: { rel: 0.01 },
          errors: [{ value: p / 2, feedback: 'That is one tail. A discrepancy either way counts, so add both tails.' }, { value: 1 - p, feedback: 'That is the probability of a result closer than this, not further.' }],
          hints: [t`$p = 2\,P(Z > ${z})$.`, t`$p = \text{erfc}(${z}/\sqrt2)$.`],
          teach: 'A two-sided p-value counts both tails: p = 2P(Z > |z|).',
          explain: t`$p = \text{erfc}(${z}/\sqrt2) = ${p.toFixed(4)}$.`,
        };
      },
    }),
    mcq({
      id: 'not-p', difficulty: 2,
      prompt: t`A test of “no difference between two thermometers” gives $p = 0.01$. Which statement is correct?`,
      visual: tail('z2', 2.576, {}, 'Under the null hypothesis, results beyond the shaded cuts happen 1% of the time.'),
      choices: [
        'If the thermometers truly agreed, a difference at least this large would occur about 1% of the time',
        'There is a 1% chance that the thermometers agree',
        'There is a 99% chance that the thermometers differ',
        'The thermometers differ by an important amount',
      ],
      answer: 0,
      why: {
        1: 'p is computed assuming H₀ is true, so it cannot be the probability that H₀ is true.',
        2: 'The same mistake, turned round. Turning p into a probability of a hypothesis needs prior information (Bayes’ theorem).',
        3: 'A tiny, unimportant difference gives a small p if the measurements are precise enough. p says nothing about size.',
      },
      hints: ['Read the definition: what is p a probability of, and under what assumption?'],
      teach: 'A p-value is the probability of data at least this extreme if H₀ were true — never the probability that H₀ is true.',
      explain: 'This is the misreading the American Statistical Association warned against in 2016. To say how probable a hypothesis is, you need Bayes’ theorem and a prior — the subject of [the Bayesian lessons](#/lesson/st-g.G4.1).',
    }),
    num({
      id: 'reduced', difficulty: 2,
      gen(r) {
        const nu = r.pick([18, 32, 50, 72, 98]), chi = Math.round(nu * r.pick([1.3, 1.4, 1.5, 0.6, 0.7]));
        const z = (chi / nu - 1) / Math.sqrt(2 / nu);
        return {
          prompt: t`A fit with $\nu = ${nu}$ gives $\chi^2 = ${chi}$. If the errors were honest, $\chi^2/\nu$ would scatter about 1 with standard deviation $\sqrt{2/\nu}$. How many such standard deviations is your $\chi^2/\nu$ from 1 (with sign)?`,
          visual: tail('chi2', chi, { nu }, `The χ² distribution for ν = ${nu} and the observed value.`),
          answer: z, tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: chi / nu - 1, feedback: t`That is the excess of $\chi^2/\nu$ over 1. Divide by $\sqrt{2/\nu}$.` }],
          hints: [t`$\chi^2/\nu = ${(chi / nu).toFixed(3)}$; $\sqrt{2/\nu} = ${Math.sqrt(2 / nu).toFixed(3)}$.`, 'Subtract 1 and divide.'],
          teach: 'Judge χ²/ν against its own scatter √(2/ν): the same χ²/ν is ordinary for small ν and alarming for large ν.',
          explain: t`$(${(chi / nu).toFixed(3)} - 1)/${Math.sqrt(2 / nu).toFixed(3)} = ${z.toFixed(2)}$. ${Math.abs(z) < 2 ? 'Within normal scatter.' : z > 0 ? 'Too large: a wrong model or underestimated errors.' : 'Too small: the error bars are probably overestimated (or the points correlated).'}`,
        };
      },
    }),
    mcq({
      id: 'too-good', difficulty: 2,
      prompt: t`A fit with $\nu = 30$ gives $\chi^2 = 9$, so $\chi^2/\nu = 0.3$. A lab partner calls it an excellent fit. What does it most likely mean?`,
      visual: tail('chi2', 9, { nu: 30 }, 'The χ² distribution for ν = 30: the observed 9 sits far in the lower tail.'),
      choices: [
        'The error bars are overestimated (or the points are correlated): data agree with the line better than honest errors allow',
        'The model is excellent and the data are of very high quality',
        'There are too many data points',
        'The fit has too few parameters',
      ],
      answer: 0,
      why: {
        1: 'Honest errors make the points scatter about the line by about one error bar. Scatter this much smaller says the bars are too big.',
        2: 'The number of points sets ν; it does not make χ² small.',
        3: 'Too few parameters makes χ² large, not small.',
      },
      hints: ['Honest error bars make points scatter about the line by about one bar each. What could make them hug it more closely?', t`$P(\chi^2_{30} \le 9)$ is only about $${tex17(M.chi2Cdf(9, 30))}$.`],
      teach: 'χ²/ν well below 1 signals overestimated (or correlated) uncertainties, not a superb fit.',
      explain: t`$P(\chi^2_{30} \le 9) = ${tex17(M.chi2Cdf(9, 30))}$. A common cause is adding a cautious Type B uncertainty that does not vary from point to point to each error bar, or quoting maximum errors instead of standard ones.`,
    }),
    num({
      id: 'look-elsewhere', difficulty: 3,
      gen(r) {
        const n = r.pick([10, 20, 40]), a = r.pick([0.05, 0.01]);
        const p = 100 * (1 - (1 - a) ** n);
        return {
          prompt: t`You search a spectrum for a bump in ${n} independent energy bins, calling any bin with $p < ${a}$ a “signal”. If there is no signal anywhere, what is the probability (as a percentage) that at least one bin passes?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 60], y: [0, 100], xlabel: 'number of independent places searched', ylabel: 'chance of a false signal (%)', xticks: 6, yticks: 5, axesAt: 'edge', curves: [{ fn: `100*(1 - (1 - ${a})^x)`, color: 'accent' }] }, caption: `The chance that pure noise passes p < ${a} somewhere, against how many places you look.` },
          answer: p, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * a, feedback: 'That is the chance for one bin. With many bins, the chances accumulate.' }, { value: 100 * a * n, feedback: 'Close for small numbers, but probabilities do not simply add; use 1 − (1 − a)ⁿ.' }].filter((e) => Math.abs(e.value - p) > 0.02 * p),
          hints: [t`The chance a single bin stays quiet is $1 - ${a}$.`, t`All ${n} stay quiet with probability $(1 - ${a})^{${n}}$.`],
          teach: 'Searching many places multiplies the chance of a fluke — the look-elsewhere effect — so the local p-value overstates significance.',
          explain: t`$1 - (1 - ${a})^{${n}} = ${(p / 100).toFixed(3)}$: ${p.toFixed(0)}%. This is why particle physicists quote a “global” significance and demand 5σ locally.`,
        };
      },
    }),
    num({
      id: 'five-sigma', difficulty: 2,
      prompt: t`Particle physics claims a discovery at “5σ”: a one-sided tail probability under the background-only hypothesis. That $p$ corresponds to odds of about one in how many?`,
      visual: tail('z1', 5, { xr: [-5.5, 6] }, 'The standard normal distribution; the tail beyond 5 is far too thin to see.'),
      answer: 1 / M.normalSf(5), tol: { rel: 0.01 },
      errors: [{ value: 1 / M.pTwo(5), feedback: 'That counts both tails. The 5σ convention is one-sided: only an excess counts.' }],
      hints: [t`$p = P(Z > 5) = 2.87 \times 10^{-7}$.`, 'One in 1/p.'],
      teach: 'The 5σ discovery threshold is a one-sided p of 2.9 × 10⁻⁷ — about one in 3.5 million.',
      explain: t`$1/(2.87 \times 10^{-7}) \approx 3.5 \times 10^{6}$. The threshold is that strict because of the look-elsewhere effect and because systematic errors have produced several “3σ” effects that later vanished.`,
    }),
    code({
      id: 'chi2-test', difficulty: 2,
      prompt: t`A model was fitted with 2 parameters to the data below. Compute \`chi2\` (the sum of squared normalized residuals), \`nu\`, and the p-value \`p\` with \`scipy.stats.chi2.sf\`. Print all three.`,
      starter: t`import numpy as np
from scipy import stats

y     = np.array([2.10, 2.95, 4.20, 4.90, 6.15, 6.80, 8.30, 8.85])   # data
model = np.array([2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00])   # fitted values
sigma = np.array([0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10])   # error bars

chi2 = None
nu = None
p = None
print(chi2, nu, p)
`,
      answer: t`import numpy as np
from scipy import stats

y     = np.array([2.10, 2.95, 4.20, 4.90, 6.15, 6.80, 8.30, 8.85])   # data
model = np.array([2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00])   # fitted values
sigma = np.array([0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10])   # error bars

chi2 = np.sum(((y - model) / sigma)**2)
nu = len(y) - 2
p = stats.chi2.sf(chi2, nu)
print(chi2, nu, p)`,
      tests: [
        { name: '`chi2` is the sum of squared normalized residuals (23.75)', code: 'abs(chi2 - 23.75) < 1e-9' },
        { name: '`nu` is 8 − 2 = 6', code: 'nu == 6' },
        { name: '`p` is the upper-tail probability (about 0.0006)', code: 'abs(p - stats.chi2.sf(23.75, 6)) < 1e-12' },
      ],
      hints: ['Normalized residuals: `(y - model) / sigma`. Square and sum.', '`stats.chi2.sf(chi2, nu)` is the probability of a larger χ² — the p-value.'],
      teach: 'The χ² test is three lines: sum the squared normalized residuals, subtract the parameters from the points, and take the upper tail.',
      explain: t`$\chi^2 = 23.75$ with $\nu = 6$ gives $p \approx ${M.chi2Sf(23.75, 6).toFixed(4)}$: these residuals are too big for 0.10 error bars. Either the bars are underestimated (by about a factor $\sqrt{23.75/6} \approx 2$) or the model is wrong — the residuals alternate in sign, which looks like plain scatter.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`LIGO’s first detection, GW150914, was reported at a significance “greater than 5.1σ” (a false-alarm rate below one per 203 000 years). What one-sided p-value does 5.1σ correspond to?`,
      visual: tail('z1', 5.1, { xr: [-5.5, 6] }, 'The one-sided tail beyond 5.1σ — invisible at this scale.'),
      answer: M.normalSf(5.1), tol: { rel: 0.02 },
      errors: [{ value: M.pTwo(5.1), feedback: 'Detection significance is one-sided: only a signal-like excess counts.' }],
      hints: [t`$p = P(Z > 5.1) = \tfrac12\,\text{erfc}(5.1/\sqrt2)$.`, 'It is a little smaller than the 2.9 × 10⁻⁷ of 5σ.'],
      teach: 'A significance in σ is shorthand for a one-sided normal tail probability.',
      explain: t`$P(Z > 5.1) = ${tex17(M.normalSf(5.1))}$. LIGO estimated it from the background itself — time-shifting one detector’s data against the other’s to see how often noise alone mimics a signal — not from a Gaussian assumption.`,
    }),
    mcq({
      id: 'cp-engine', difficulty: 2,
      prompt: t`A test campaign compares a new injector with the old one: mean specific impulse rises by 2.1 s with $p = 0.03$ for “no improvement”. Which conclusion is justified?`,
      visual: tail('z1', 1.88, {}, 'One-sided test: the shaded tail is the chance of an improvement this large if there were none.'),
      choices: [
        'If the injector made no difference, an improvement this large would arise by chance about 3% of the time — suggestive, worth more firings',
        'There is a 97% probability the new injector is better',
        'The new injector improves specific impulse by an important amount',
        'The old injector is proven to be worse',
      ],
      answer: 0,
      why: {
        1: 'That reverses the conditional: p assumes no improvement; it is not the probability of improvement.',
        2: 'Whether 2.1 s matters is an engineering judgement about the effect size, which p does not measure.',
        3: 'A p-value cannot prove anything; it measures how surprising the data are under H₀.',
      },
      hints: ['p is a probability of the data, computed assuming the null hypothesis.'],
      teach: 'Report p as the surprise of the data under H₀, and judge importance from the effect size and its uncertainty.',
      explain: 'Quote the improvement with its uncertainty — that carries the size and the precision. A p of 0.03, especially among several tests, is a reason to collect more data, not a verdict.',
    }),
    mcq({
      id: 'cp-chi2-high', difficulty: 2,
      prompt: t`Your fit gives $\chi^2 = 45$ for $\nu = 20$ ($p \approx 0.001$). Which next step is sound?`,
      visual: tail('chi2', 45, { nu: 20 }, 'The χ² distribution for ν = 20 and the observed 45.'),
      choices: [
        'Plot the residuals: structure points to a wrong model, random scatter about 1.5 times the bars to underestimated errors',
        'Scale every error bar by 1.5 so that χ²/ν = 1, without further comment',
        'Remove the points with the largest residuals until p > 0.05',
        'Report the fit: χ² does not matter if the line looks good',
      ],
      answer: 0,
      why: {
        1: 'Rescaling the errors (as curve_fit does by default) hides the problem; only do it with a stated reason and after checking the model.',
        2: 'Deleting points to reach a target p is the textbook way to manufacture a result.',
        3: 'A line that “looks good” on a plot can still be badly inconsistent with the stated error bars.',
      },
      hints: ['What are the two ways H₀ (“model right, errors honest”) can fail?'],
      teach: 'A bad χ² means the model or the error bars are wrong; the residuals tell you which.',
      explain: 'A systematic pattern in the residuals (a curve, a step) means a missing term in the model. Featureless residuals that are uniformly too large mean the error bars are too small — the module on goodness of fit takes this further.',
    }),
  ],
  sources: [SRC.taylor('ch. 12'), ASA, LIGO, SRC.gum],
});

function tex17(x) {
  const [m, e] = x.toExponential(2).split('e');
  return `${m} \\times 10^{${+e}}`;
}
