// χ² and reduced χ² — the goodness-of-fit statistic: what χ²_min should be
// (ν ± √(2ν) for a right model with honest errors), reduced χ² and its own
// scatter √(2/ν), the p-value from the χ² distribution, and what too large
// or too small a value means (wrong model, underestimated σ, outliers;
// overestimated or correlated σ). Ohm's law with a heating wire on the bench,
// error bars inflated by a careless budget, and a thrust-stand fit.
// Every number is computed here (seeded bench data; χ² tail by the
// incomplete gamma function in _labf.js, checked against tabulated values).
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { B, normals, linfit, dataGraph, r6, SIMNOTE, chi2sf, chi2pdfExpr } from './_labf.js';
import { plot } from '../phys2210/_lab.js';

const t = String.raw;

// ── the worked example: V against I for the copper wire with the current left on (heating) ──
const OHM = B.makeData('ohm', { seed: 3, sys: 'heating' });
const OHM_AN = B.analyse('ohm', OHM.rows, { sys: 'heating' });
const OF = OHM_AN.series[0].fit;
const OHM_OK = B.analyse('ohm', OHM.rows.map((r) => ({ ...r, R: B.readRow(B.EXPERIMENTS.ohm, OHM.P, r.s, r.z, null) })), {}).series[0].fit;
const P_HEAT = chi2sf(OF.chi2, OF.dof), P_OK = chi2sf(OHM_OK.chi2, OHM_OK.dof);

// a χ² density picture with the tail beyond x shaded
function pdfPic(nu, x, caption, { xmax, label = true } = {}) {
  const X = xmax || Math.max(3 * nu, x * 1.3, 12);
  const peak = nu > 2 ? Math.exp(lnPdf(nu, nu - 2)) : 0.5;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, r6(X)], y: [0, r6(1.25 * peak)], xlabel: 'χ²', ylabel: 'probability density', yticks: 3, axesAt: 'edge',
      curves: [{ fn: chi2pdfExpr(nu), color: 'accent', domain: [nu === 1 ? 0.02 : 0, r6(X)] }],
      shade: [{ fn: chi2pdfExpr(nu), from: r6(x), to: r6(X), color: 'warn', alpha: 0.35 }],
      vlines: [{ x: r6(x), label: label ? 'observed' : '', color: 'warn' }, { x: nu, label: 'ν', color: 'ink3' }],
    },
    caption,
  };
}
function lnPdf(nu, x) {
  let g = 0; // ln Γ(ν/2) by recursion for integer and half-integer ν
  let a = nu / 2; const base = Number.isInteger(a) ? 1 : 0.5; let v = Number.isInteger(a) ? 0 : 0.5 * Math.log(Math.PI);
  for (let z = base; z < a; z += 1) v += Math.log(z);
  g = v;
  return (nu / 2 - 1) * Math.log(x) - x / 2 - (nu / 2) * Math.log(2) - g;
}

export default lesson({
  id: 'lab.A6.1',
  title: 'χ² and reduced χ²',
  minutes: 14, difficulty: 3,
  lab: true,
  intro: t`A fit always finds *some* best line. Whether the line is any good is a separate question, and $\chi^2$ answers it. If the model is right and every $\sigma_i$ is an honest standard deviation, each normalized residual $(y_i - f_i)/\sigma_i$ is typically about $\pm 1$, so $\chi^2_{\min}$ should be about the number of **degrees of freedom**, $\nu = N - m$. Dividing gives the **reduced chi-squared**

$$\chi^2_\nu = \frac{\chi^2_{\min}}{\nu} = \frac{1}{N - m}\sum_{i=1}^{N}\left(\frac{y_i - f(x_i;\hat{\mathbf p})}{\sigma_i}\right)^2 \approx 1 \pm \sqrt{2/\nu}$$

Much bigger than 1: the model is wrong, the error bars are too small, or a point is bad. Much smaller: the error bars are too big (or the errors are correlated). How surprising a value is comes from the $\chi^2$ distribution: the **p-value** is the chance that a right model with honest errors would give a $\chi^2$ at least this large.`,
  symbols: [
    { tex: '\\chi^2_{\\min}', text: 'the smallest $\\chi^2$ the fit could reach: the sum of squared normalized residuals at the best parameters $\\hat{\\mathbf p}$' },
    { tex: 'N', text: 'the number of data points' },
    { tex: 'm', text: 'the number of fitted parameters (2 for a straight line)' },
    { tex: '\\nu', text: 'the degrees of freedom, $N - m$: how many independent misfits are left once the parameters are fitted' },
    { tex: '\\chi^2_\\nu', text: 'reduced chi-squared, $\\chi^2_{\\min}/\\nu$ (dimensionless); about 1 for a good fit, with a scatter of $\\sqrt{2/\\nu}$' },
    { tex: 'y_i,\\ \\sigma_i', text: 'a measured value and its standard uncertainty' },
    { tex: 'f(x_i;\\hat{\\mathbf p})', text: 'the fitted model’s prediction at $x_i$' },
  ],
  why: t`$\chi^2$ is the one number that says whether your error bars and your model agree with each other — the first thing a referee, or a flight-qualification review, asks about a fit.`,
  visual: {
    type: 'lab-bench',
    title: 'The bench: Ohm’s law, and a wire left switched on',
    lead: t`Voltage against current for a 2 m copper wire, fitted with a straight line. Each point carries its honest error bars (the meters’ $\pm 0.002$). Watch $\chi^2/\text{dof}$ in the readout — here $\nu = 7 - 2 = 5$ — and the residual panel.`,
    tasks: [
      'Clear the table and Run the series a few times: χ²/dof wanders between about 0.2 and 2. With five degrees of freedom it scatters by √(2/5) ≈ 0.6 — one value proves little.',
      'Turn on the systematic error (the current left on, so the wire heats as I²R): χ²/dof jumps to about 5 and the residuals trace a smooth U. The straight line is now the wrong model.',
      'With heating on, notice that the slope’s ± barely changes: the fit’s uncertainty assumes the model is right. Only χ² warns you.',
    ],
    params: { exp: 'ohm', sysKind: 'heating', residuals: true, seed: 3 },
    caption: t`Simulated meters with Gaussian noise of $\pm 0.002$ (A or V), and a heating model in which copper’s resistance rises by 0.39% per kelvin. The fit folds in the current’s uncertainty by the effective-variance method. ${SIMNOTE}`,
  },
  example: {
    prompt: t`With the current left on between readings, the seven V–I points of the wire give a straight-line fit with $\chi^2_{\min} = ${OF.chi2.toFixed(1)}$. Is the straight line an acceptable model?`,
    visual: { ...plot('ohm', OHM.rows, { sys: true, sysKind: 'heating', residuals: true }), caption: t`The data (current left on), the least-squares line, and the residuals. The smooth U in the residuals is the heating. ${SIMNOTE}` },
    steps: [
      { label: 'Degrees of freedom', text: t`$N = 7$ points, $m = 2$ parameters: $\nu = 5$.` },
      { label: 'Reduced chi squared', text: t`$\chi^2_\nu = ${OF.chi2.toFixed(1)}/5 = ${(OF.chi2 / 5).toFixed(2)}$. A good fit would give $1 \pm \sqrt{2/5} = 1 \pm 0.63$: this is ${((OF.chi2 / 5 - 1) / Math.sqrt(0.4)).toFixed(0)} of those standard deviations too high.` },
      { label: 'P value', text: t`The chance that a right model with honest errors gives $\chi^2 \ge ${OF.chi2.toFixed(1)}$ with $\nu = 5$ is the tail area of the $\chi^2$ distribution: $p = ${tex(P_HEAT, 2)}$. (The $\chi^2$ distribution is not symmetric, so use the tail, not the Gaussian rule.)` },
      { label: 'Which cause', text: t`Too-small error bars would scatter the residuals at random; here they trace a smooth curve — above the line at both ends, below it in between. That shape means the **model** is wrong: the wire’s resistance rises with the current that heats it.` },
      { label: 'Compare', text: t`Switching the current off between readings (same random scatter, no heating) gives $\chi^2 = ${OHM_OK.chi2.toFixed(1)}$ for $\nu = 5$, $p = ${P_OK.toFixed(2)}$: perfectly ordinary.` },
    ],
    answer: t`No: $\chi^2_\nu = ${(OF.chi2 / 5).toFixed(1)}$, $p \approx ${tex(P_HEAT, 1)}$, and the residuals are structured. Fix the experiment (switch off between readings), not the error bars.`,
  },
  practice: [
    num({
      id: 'dof', difficulty: 1,
      gen(r) {
        const N = r.int(8, 30), deg = r.pick([1, 2, 3]);
        const m = deg + 1;
        const z = normals(r.int(1, 99999));
        const xs = Array.from({ length: N }, (_, i) => i / (N - 1) * 10);
        const ys = xs.map((x) => 1 + 0.3 * x - (deg >= 2 ? 0.02 * x * x : 0) + 0.3 * z());
        return {
          prompt: t`You fit a polynomial of degree ${deg} (${m} coefficients) to ${N} data points. How many degrees of freedom does the fit have?`,
          visual: { type: 'graph', params: dataGraph({ xs: xs.map(r6), ys: ys.map(r6), xlabel: 'x', ylabel: 'y' }), caption: `${N} points.` },
          answer: N - m, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: N - deg, feedback: `A degree-${deg} polynomial has ${m} coefficients, including the constant term.` }, { value: N - 1, feedback: 'N − 1 is for a mean (one fitted number). Subtract every fitted parameter.' }, { value: N, feedback: 'Each fitted parameter uses up one degree of freedom.' }].filter((e) => e.value !== N - m),
          hints: [t`$\nu = N - m$, with $m$ the number of fitted parameters.`],
          teach: 'Every fitted parameter uses up one degree of freedom: ν = N − m.',
          explain: t`$\nu = ${N} - ${m} = ${N - m}$. With $m$ parameters the fit can always make $m$ of the misfits vanish, so only $N - m$ independent misfits remain to test it.`,
        };
      },
    }),
    num({
      id: 'how-many-sd', difficulty: 2,
      gen(r) {
        const nu = r.pick([8, 18, 32, 50, 98]);
        const cr = r.float(1.2, 2.2, 0.05);
        const ans = (cr - 1) / Math.sqrt(2 / nu);
        return {
          prompt: t`A fit with $\nu = ${nu}$ degrees of freedom gives $\chi^2_\nu = ${cr.toFixed(2)}$. How many of its own standard deviations, $\sqrt{2/\nu}$, is that above 1?`,
          visual: pdfPic(nu, cr * nu, t`The $\chi^2$ distribution for $\nu = ${nu}$, with the observed $\chi^2 = ${(cr * nu).toFixed(1)}$ and its tail shaded.`),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (cr - 1) / Math.sqrt(1 / nu), feedback: t`The variance of $\chi^2$ is $2\nu$, so $\chi^2_\nu$ has standard deviation $\sqrt{2/\nu}$, not $\sqrt{1/\nu}$.` }, { value: (cr - 1) * Math.sqrt(2 / nu), feedback: t`Divide by $\sqrt{2/\nu}$, don’t multiply.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\chi^2$ has mean $\nu$ and variance $2\nu$; divide by $\nu$ for $\chi^2_\nu$.`, t`$\sqrt{2/${nu}} = ${Math.sqrt(2 / nu).toFixed(3)}$.`],
          teach: t`Reduced $\chi^2$ is itself noisy: $1 \pm \sqrt{2/\nu}$. Judge it against that, not against 1.`,
          explain: t`$(${cr.toFixed(2)} - 1)/${Math.sqrt(2 / nu).toFixed(3)} = ${ans.toFixed(1)}$. The same $\chi^2_\nu$ is unremarkable with few degrees of freedom and damning with many: the p-value here is $${tex(chi2sf(cr * nu, nu), 2)}$.`,
        };
      },
    }),
    mcq({
      id: 'too-small', difficulty: 2,
      prompt: t`A straight-line fit to 32 points gives $\chi^2_\nu = 0.11$. What is the most likely explanation?`,
      visual: (() => { const d = B.makeData('resistivity', { seed: 77, settings: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75] }); return { ...plot('resistivity', d.rows, { inflate: 3, residuals: true }), caption: t`The same idea on the bench: resistance against length with each error bar stated three times too large. The points hug the line far more closely than their bars allow. ${SIMNOTE}` }; })(),
      choices: ['The error bars are overestimated (or the errors are correlated), not that the data are exceptionally good', 'An excellent fit: the smaller χ², the better', 'The model is wrong', 'There are too few points'],
      answer: 0,
      why: { 1: t`With honest errors, $\chi^2_\nu$ for $\nu = 30$ lies between about 0.55 and 1.6 nineteen times in twenty. 0.11 means the residuals are far smaller than the stated $\sigma$’s — the $\sigma$’s are wrong.`, 2: 'A wrong model makes χ² too large, not too small.', 3: 'Thirty degrees of freedom is plenty to tell.' },
      hints: [t`What size should the typical normalized residual $(y_i - f_i)/\sigma_i$ be if the $\sigma_i$ are honest?`],
      teach: t`$\chi^2_\nu \ll 1$ is as much a warning as $\chi^2_\nu \gg 1$: usually overstated error bars, sometimes correlated errors.`,
      explain: t`$\chi^2_\nu = 0.11$ means the typical residual is $\sqrt{0.11} \approx 0.33$ of its error bar: the stated $\sigma$’s are about three times too big — often a Type B term (a calibration uncertainty common to all points) wrongly put into every point’s error bar. Then the fit’s parameter uncertainties are too big as well.`,
    }),
    multi({
      id: 'too-big', difficulty: 2,
      prompt: t`A fit gives $\chi^2_\nu = 6$ with $\nu = 20$. Which could be the cause? Select all that apply.`,
      visual: pdfPic(20, 120, t`The $\chi^2$ distribution for $\nu = 20$. An observed 120 sits far out in the tail, where the density is too small to see.`, { xmax: 130 }),
      choices: ['The model is wrong (missing curvature, a missing effect)', 'The error bars are underestimated', 'One or two bad points (a misread scale, a glitch)', 'The error bars are overestimated', 'There are too many data points'],
      answer: [0, 1, 2],
      why: { 3: 'Overestimated bars make χ² too small.', 4: t`More points raise $\chi^2$ and $\nu$ together; $\chi^2_\nu$ stays near 1 for a good fit.` },
      hints: ['χ² grows when the residuals are large compared with σ. What makes residuals large, and what makes σ small?'],
      teach: 'A large χ²_ν has three usual causes: a wrong model, underestimated errors, outliers — residuals tell them apart.',
      explain: t`All three make the residuals large compared with $\sigma$. A smooth pattern in the residuals points to the model; a uniform excess everywhere points to the error bars; one or two huge residuals point to bad points. That diagnosis is [residual analysis](#/lesson/lab.A6.2).`,
    }),
    num({
      id: 'p-even', difficulty: 3,
      gen(r) {
        const nu = r.pick([2, 4]);
        const x = r.float(nu === 2 ? 3 : 5, nu === 2 ? 9 : 14, 0.1);
        const ans = nu === 2 ? Math.exp(-x / 2) : Math.exp(-x / 2) * (1 + x / 2);
        return {
          prompt: t`For $\nu = ${nu}$ the $\chi^2$ tail has a closed form: $P(\chi^2 \ge x) = ${nu === 2 ? t`e^{-x/2}` : t`e^{-x/2}\,(1 + x/2)`}$. A fit with $\nu = ${nu}$ gives $\chi^2_{\min} = ${x.toFixed(1)}$. What is its p-value?`,
          visual: pdfPic(nu, x, t`The $\chi^2$ density for $\nu = ${nu}$; the shaded area beyond the observed value is the p-value.`),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 - ans, feedback: 'That is the probability of a smaller χ². The p-value is the tail: χ² at least as large as observed.' }, ...(nu === 4 ? [{ value: Math.exp(-x / 2), feedback: t`For $\nu = 4$ the tail is $e^{-x/2}(1 + x/2)$ — you dropped the bracket.` }] : [])].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The p-value is the area of the tail beyond the observed value: $P(\chi^2 \ge x)$ with $x = \chi^2_{\min}$.`, t`Substitute $x = ${x.toFixed(1)}$: $x/2 = ${(x / 2).toFixed(2)}$.`],
          teach: 'The p-value is the χ² distribution’s tail area beyond the observed value.',
          explain: t`$p = ${ans.toPrecision(3)}$. ${ans < 0.05 ? 'Below 0.05: a fit this bad would happen less than one time in twenty with a right model and honest errors.' : 'Above 0.05: nothing alarming.'} In code, \`scipy.stats.chi2.sf(x, nu)\` gives it for any $\nu$.`,
        };
      },
    }),
    num({
      id: 'birge', difficulty: 3,
      gen(r) {
        const nu = r.int(10, 25), cr = r.float(1.8, 4, 0.1), sb = r.float(0.010, 0.050, 0.001);
        const ans = sb * Math.sqrt(cr);
        return {
          prompt: t`A straight-line fit with $\nu = ${nu}$ has $\chi^2_\nu = ${cr.toFixed(1)}$. The residuals show no pattern, so you conclude that every error bar was underestimated by the same factor. The fit reported $\sigma_b = ${sb.toFixed(3)}$. What should $\sigma_b$ be after scaling the error bars?`,
          visual: pdfPic(nu, cr * nu, t`The observed $\chi^2 = ${(cr * nu).toFixed(1)}$ against the distribution for $\nu = ${nu}$.`),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: sb * cr, feedback: t`Scaling every $\sigma_i$ by $k$ scales $\chi^2$ by $1/k^2$: to bring $\chi^2_\nu$ to 1, $k = \sqrt{\chi^2_\nu}$, not $\chi^2_\nu$.` }, { value: sb / Math.sqrt(cr), feedback: 'The bars were too small, so the parameter uncertainty must grow, not shrink.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Multiplying every $\sigma_i$ by $k$ divides $\chi^2$ by $k^2$ and multiplies $\sigma_b$ by $k$.`, t`Choose $k$ so the new $\chi^2_\nu$ is 1: $k = \sqrt{${cr.toFixed(1)}}$.`],
          teach: t`If — and only if — the model is right and the residuals are patternless, scale the uncertainties by $\sqrt{\chi^2_\nu}$ (the Birge ratio).`,
          explain: t`$\sigma_b = ${sb.toFixed(3)} \times \sqrt{${cr.toFixed(1)}} = ${ans.toFixed(4)}$. Say in the report that you did it, and why. This is the same rescaling some fitting software does silently by default — fine when you knew nothing about $\sigma$, misleading when you did ([A12.1](#/lesson/lab.A12.1)). Never use it to paper over a wrong model.`,
        };
      },
    }),
    code({
      id: 'chi2-p', difficulty: 2,
      prompt: t`The program fits a weighted straight line to ten points. Compute \`chi2\` (the minimum $\chi^2$), \`nu\`, \`chi2_nu\` and the p-value \`p\` with \`scipy.stats.chi2.sf\`.`,
      starter: t`import numpy as np
from scipy import stats

x = np.arange(1.0, 11.0)
y = np.array([2.31, 2.68, 3.32, 3.58, 4.21, 4.39, 5.05, 5.31, 5.86, 6.34])
sigma = np.full(10, 0.10)

# the weighted least-squares line (from the previous lessons)
w = 1 / sigma**2
S, Sx, Sy, Sxx, Sxy = w.sum(), (w*x).sum(), (w*y).sum(), (w*x*x).sum(), (w*x*y).sum()
D = S * Sxx - Sx**2
b = (S * Sxy - Sx * Sy) / D
a = (Sxx * Sy - Sx * Sxy) / D

# your code: chi2, nu, chi2_nu, p
print(f"chi2 = {chi2:.2f} for nu = {nu}: chi2_nu = {chi2_nu:.2f}, p = {p:.3f}")`,
      answer: t`import numpy as np
from scipy import stats

x = np.arange(1.0, 11.0)
y = np.array([2.31, 2.68, 3.32, 3.58, 4.21, 4.39, 5.05, 5.31, 5.86, 6.34])
sigma = np.full(10, 0.10)

# the weighted least-squares line (from the previous lessons)
w = 1 / sigma**2
S, Sx, Sy, Sxx, Sxy = w.sum(), (w*x).sum(), (w*y).sum(), (w*x*x).sum(), (w*x*y).sum()
D = S * Sxx - Sx**2
b = (S * Sxy - Sx * Sy) / D
a = (Sxx * Sy - Sx * Sxy) / D

chi2 = np.sum(((y - a - b * x) / sigma)**2)
nu = x.size - 2
chi2_nu = chi2 / nu
p = stats.chi2.sf(chi2, nu)
print(f"chi2 = {chi2:.2f} for nu = {nu}: chi2_nu = {chi2_nu:.2f}, p = {p:.3f}")`,
      tests: [
        { name: t`\`chi2\` is the sum of squared normalized residuals`, code: `abs(chi2 - ${linfit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2.31, 2.68, 3.32, 3.58, 4.21, 4.39, 5.05, 5.31, 5.86, 6.34], 0.1).chi2}) < 1e-6` },
        { name: t`$\nu = N - 2$ and \`chi2_nu\` = \`chi2/nu\``, code: 'nu == 8 and abs(chi2_nu - chi2 / 8) < 1e-12' },
        { name: 'p is the upper tail of the χ² distribution', code: `abs(p - ${chi2sf(linfit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2.31, 2.68, 3.32, 3.58, 4.21, 4.39, 5.05, 5.31, 5.86, 6.34], 0.1).chi2, 8)}) < 1e-6` },
      ],
      hints: [t`\`chi2 = np.sum(((y - a - b * x) / sigma)**2)\`; \`nu = x.size - 2\`.`, t`\`p = stats.chi2.sf(chi2, nu)\` — \`sf\` is the survival function, $1 - $ CDF, the upper tail.`],
      teach: 'χ², ν, χ²/ν and a p-value are four lines once the fit is done — report all of them.',
      explain: t`$\chi^2 = ${linfit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2.31, 2.68, 3.32, 3.58, 4.21, 4.39, 5.05, 5.31, 5.86, 6.34], 0.1).chi2.toFixed(2)}$ for $\nu = 8$, $p = ${chi2sf(linfit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2.31, 2.68, 3.32, 3.58, 4.21, 4.39, 5.05, 5.31, 5.86, 6.34], 0.1).chi2, 8).toFixed(3)}$. Use \`sf\` rather than \`1 - cdf\`: for tiny p-values the subtraction loses every digit.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-thrust', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.int(40, 60), m = 3, c2 = r.int(70, 110);
        const nu = N - m, cr = c2 / nu;
        const ans = (cr - 1) / Math.sqrt(2 / nu);
        return {
          prompt: t`A static-fire test fits the thrust curve of a small solid motor during its steady burn with a three-parameter model. ${N} load-cell samples, each with its calibrated $\sigma$, give $\chi^2_{\min} = ${c2}$. By how many standard deviations of $\chi^2_\nu$ does the fit exceed 1?`,
          visual: pdfPic(nu, c2, t`The $\chi^2$ distribution for $\nu = ${nu}$ and the observed value.`),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: (c2 / N - 1) / Math.sqrt(2 / N), feedback: t`Use $\nu = N - m = ${nu}$, not $N$.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * Math.abs(ans)),
          hints: [t`$\nu = N - m = ${N} - 3$, and $\chi^2_\nu = \chi^2/\nu$.`, t`$\chi^2_\nu$ has standard deviation $\sqrt{2/\nu}$: divide $\chi^2_\nu - 1$ by it.`],
          teach: t`Judge $\chi^2_\nu$ against $1 \pm \sqrt{2/\nu}$ with $\nu = N - m$.`,
          explain: t`$\nu = ${nu}$, $\chi^2_\nu = ${cr.toFixed(3)}$, and $(${cr.toFixed(3)} - 1)/\sqrt{2/${nu}} = ${ans.toFixed(1)}$ ($p = ${tex(chi2sf(c2, nu), 2)}$). Thrust during a “steady” burn wanders with grain erosion and combustion noise the model leaves out, so a modest excess is normal; look at the residuals against time before rescaling anything.`,
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: t`A fit gives $\chi^2_\nu = 1.03$ with $\nu = 4$. What may you conclude?`,
      visual: pdfPic(4, 4.12, t`The $\chi^2$ density for $\nu = 4$ and the observed $\chi^2 = 4.12$: right in the bulk.`),
      choices: ['The data are consistent with the model and the stated errors — which does not prove the model is right', 'The model is proven correct', 'The error bars are exactly right', 'The fitted parameters have no uncertainty'],
      answer: 0,
      why: { 1: 'Other models may fit as well; with ν = 4, χ²_ν between about 0.1 and 2.8 is unremarkable.', 2: t`$\chi^2_\nu$ is itself uncertain by $\sqrt{2/4} = 0.7$ here: it cannot pin the error bars down to a few percent.`, 3: 'χ² says nothing of the sort; the parameter uncertainties come from the covariance matrix.' },
      hints: [t`How big is the scatter of $\chi^2_\nu$ with $\nu = 4$?`],
      teach: 'A good χ² means “no evidence against”, not “proven” — especially with few degrees of freedom.',
      explain: t`$p = ${chi2sf(4.12, 4).toFixed(2)}$: nothing unusual. That is a failure to find a problem, which is weaker than a proof; with $\nu = 4$, a slightly wrong model would often pass too.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, An Introduction to Error Analysis, 2nd ed., ch. 12 (the χ² test)', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-2nd-edition/' },
    { label: 'I. G. Hughes & T. P. A. Hase, Measurements and their Uncertainties, ch. 8 (hypothesis testing)', url: 'https://global.oup.com/academic/product/measurements-and-their-uncertainties-9780199566334' },
  ],
});
