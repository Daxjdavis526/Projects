// Model comparison, honestly: a better fit is not a better model. Δχ² and
// Wilks's theorem for nested models, AIC and BIC as penalized likelihoods,
// Bayes factors with their Occam factor and prior dependence, the Kass &
// Raftery scale — worked through constructed thrust data (polynomial fits
// computed here) and the history of Mercury's perihelion (Vulcan against
// general relativity), with an illustrative measurement uncertainty.
import { lesson, mcq, num } from '../../src/core/content.js';
import { dataPlot, timeBars, gaussFn, SRC } from './_rs.js';

const t = String.raw;

// constructed: thrust (N) against chamber pressure (bar), σ = 0.4 N, drawn from
// 2.0 + 1.1p + 0.012p² with a seeded generator
const P = Array.from({ length: 15 }, (_, i) => i + 1);
const F = [3.13, 4.79, 5.9, 6.39, 7.68, 8.82, 10.52, 11.55, 13.17, 13.46, 16.18, 16.89, 18.6, 19.7, 21.05];
const SIG = 0.4, NPTS = P.length;
function polyfit(deg) {
  const m = deg + 1, A = Array.from({ length: m }, () => new Array(m + 1).fill(0));
  for (let i = 0; i < NPTS; i++) for (let r = 0; r < m; r++) { for (let c = 0; c < m; c++) A[r][c] += P[i] ** (r + c); A[r][m] += F[i] * P[i] ** r; }
  for (let c = 0; c < m; c++) { let piv = c; for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r; [A[c], A[piv]] = [A[piv], A[c]]; for (let r = 0; r < m; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= m; k++) A[r][k] -= f * A[c][k]; } }
  const coef = A.map((row, r) => row[m] / A[r][r]);
  const chi2 = P.reduce((s, p, i) => s + ((F[i] - coef.reduce((a, cf, k) => a + cf * p ** k, 0)) / SIG) ** 2, 0);
  return { coef, chi2, k: m, aic: chi2 + 2 * m, bic: chi2 + m * Math.log(NPTS) };
}
const FITS = [0, 1, 2, 3, 4].map(polyfit);
const polyExpr = (c) => c.map((cf, k) => `${cf.toPrecision(8)}*x^${k}`).join(' + ').replace(/\+ -/g, '- ');
const NAMES = ['constant', 'straight line', 'quadratic', 'cubic', 'quartic'];

const thrustPic = (degs, caption, extra = {}) => dataPlot(P.map((p, i) => [p, F[i], SIG]), {
  x: [0, 16], y: [0, 24], xlabel: 'chamber pressure (bar)', ylabel: 'thrust (N)', xticks: 8, yticks: 4,
  curves: degs.map((d, j) => ({ fn: polyExpr(FITS[d].coef), domain: [0.5, 15.5], color: ['gold', 'violet', 'teal'][j], width: 2 })),
  ...extra,
}, { cap: 0.12, caption });

// Mercury: an anomaly measured (illustratively) as 43.0 ± 0.5″ per century
const OBS = 43.0, OS = 0.5, GR = 42.98, PRIOR = 100;
const CHI_GR = ((OBS - GR) / OS) ** 2;
const B_GR_V = PRIOR / (Math.sqrt(2 * Math.PI) * OS) * Math.exp(-CHI_GR / 2);
const occamPic = (w, s, caption, mu = w / 2) => {
  const peak = 1 / (s * Math.sqrt(2 * Math.PI));
  return {
    type: 'graph',
    params: {
      x: [+(-0.05 * w).toPrecision(3), +(1.05 * w).toPrecision(3)], y: [0, +(1.25 * peak).toPrecision(3)], aspect: 'wide', axesAt: 'edge', xlabel: 'extra parameter θ', ylabel: '', yticks: 0, xticks: 5,
      shade: [{ fn: String(+(0.25 * peak).toPrecision(4)), from: 0, to: w, color: 'gold', alpha: 0.35 }],
      curves: [{ fn: gaussFn(mu, s), color: 'accent' }],
      legend: [{ label: 'prior range Δθ (flat)', color: 'gold' }, { label: 'likelihood, width σθ', color: 'accent' }], legendAt: 'tr',
    },
    caption: caption + ' Heights are scaled for visibility; the widths are the point.',
  };
};

// χ² (1 dof) survival probability
const erfc = (x) => { const z = Math.abs(x), tt = 1 / (1 + 0.5 * z); const r = tt * Math.exp(-z * z - 1.26551223 + tt * (1.00002368 + tt * (0.37409196 + tt * (0.09678418 + tt * (-0.18628806 + tt * (0.27886807 + tt * (-1.13520398 + tt * (1.48851587 + tt * (-0.82215223 + tt * 0.17087277))))))))); return x >= 0 ? r : 2 - r; };
const p1 = (d) => erfc(Math.sqrt(d / 2));

export default lesson({
  id: 'research.R6.2',
  title: 'Model comparison',
  minutes: 15, difficulty: 3,
  intro: t`A model with more parameters always fits at least as well — so "it fits better" is never, by itself, evidence for it. Model comparison asks whether the improvement is **more than the extra freedom buys by chance**. Three common tools penalize complexity in different ways:

$$\text{AIC} = 2k - 2\ln\hat{\mathcal L}, \qquad \text{BIC} = k\ln N - 2\ln\hat{\mathcal L}, \qquad B_{10} = \frac{p(d \mid M_1)}{p(d \mid M_0)}$$

Lower AIC or BIC is preferred. The Bayes factor compares the **evidence** for two models — the likelihood averaged over each model’s prior — so it penalizes a parameter by how much prior range it wastes. That makes it principled, and also dependent on a prior you must state.`,
  symbols: [
    { tex: 'k', text: 'the number of free parameters in a model' },
    { tex: 'N', text: 'the number of data points' },
    { tex: '\\hat{\\mathcal L}', text: 'the maximum of the model’s likelihood; for Gaussian errors $-2\\ln\\hat{\\mathcal L} = \\chi^2_{\\min}$ plus a constant shared by all models' },
    { tex: 'p(d \\mid M)', text: 'the evidence for model $M$: its likelihood averaged over its prior, $\\int \\mathcal L(\\theta)\\,\\pi(\\theta)\\,d\\theta$' },
    { tex: 'B_{10}', text: 'the Bayes factor: how many times more probable the data are under $M_1$ than under $M_0$' },
  ],
  why: t`Claims of new physics — an extra planet, a modified gravity law, a new particle — are model comparisons; the ones that survive are those that beat the simpler model by more than its extra freedom explains.`,
  visual: {
    ...thrustPic([1], 'Constructed data: thrust against chamber pressure with σ = 0.4 N, drawn from a slightly curved law. The readouts are computed for the chosen polynomial.'),
    params: {
      ...thrustPic([1], '').params,
      curves: [...thrustPic([1], '').params.curves.slice(1), ...FITS.map((f, d) => ({ fn: polyExpr(f.coef), domain: [0.5, 15.5], color: 'gold', width: 2.2, when: `step(0.5 - abs(deg - ${d}))` }))],
      choices: [{ key: 'deg', label: 'model', value: 1, options: NAMES.map((n, d) => [d, `${n} (k = ${d + 1})`]), explain: 'The polynomial fitted by least squares.' }],
      readouts: [
        { label: t`$\chi^2_{\min}$`, expr: FITS.map((f, d) => `${f.chi2.toFixed(3)}*step(0.5 - abs(deg - ${d}))`).join(' + '), digits: 4 },
        { label: 'AIC', expr: FITS.map((f, d) => `${f.aic.toFixed(3)}*step(0.5 - abs(deg - ${d}))`).join(' + '), digits: 4 },
        { label: 'BIC', expr: FITS.map((f, d) => `${f.bic.toFixed(3)}*step(0.5 - abs(deg - ${d}))`).join(' + '), digits: 4 },
      ],
    },
    title: 'More parameters, better fit — better model?',
    lead: t`Fifteen thrust measurements and polynomial models of increasing degree. Watch $\chi^2_{\min}$ fall with every added parameter, and watch AIC and BIC (here $\chi^2_{\min} + 2k$ and $\chi^2_{\min} + k\ln 15$) find a minimum instead.`,
    tasks: ['Constant to straight line: χ² collapses from thousands to about 16. Clearly needed.', 'Line to quadratic: χ² drops by about 5 for one parameter; AIC and BIC both fall — the curvature is supported.', 'Quadratic to quartic: χ² keeps dropping, but AIC and BIC rise. Those wiggles are fitting noise.'],
  },
  example: {
    prompt: t`Mercury’s perihelion advanced faster than Newtonian planetary perturbations predicted. Suppose the anomaly is measured as $${OBS.toFixed(1)}'' \pm ${OS}''$ per century (an illustrative uncertainty). Compare three models: (N) Newton, nothing missing: predicts $0''$; (V) an unseen planet "Vulcan" whose free mass sets the anomaly anywhere from $0''$ to $${PRIOR}''$; (GR) general relativity: predicts $${GR}''$, with no free parameter.`,
    visual: occamPic(PRIOR, OS, t`The Vulcan model spreads its prior over $0$–$${PRIOR}''$ (gold); the data allow only a band about $${OS}''$ wide around $${OBS}''$ (blue). Most of Vulcan’s prior range is wasted.`, OBS),
    steps: [
      { label: 'Newton alone', text: t`$\chi^2 = (43.0/0.5)^2 = ${(OBS / OS) ** 2}$. Excluded beyond any doubt — the anomaly is real.` },
      { label: 'Best fits', text: t`Vulcan can match exactly: $\chi^2_{\min} = 0$ with $k = 1$. GR, with $k = 0$, gives $\chi^2 = (0.02/0.5)^2 = ${CHI_GR.toFixed(4)}$.` },
      { label: 'AIC', text: t`$\text{AIC}_V = 2 + 0 = 2$; $\text{AIC}_{GR} = 0 + ${CHI_GR.toFixed(4)}$. GR is preferred by $\Delta\text{AIC} \approx 2$: the fitted parameter bought nothing. (BIC is no help here: with one data point, $k\ln N = 0$ — a reminder that these criteria are approximations.)` },
      { label: 'Bayes factor', text: t`For a flat prior of width $\Delta\theta = ${PRIOR}''$ and a likelihood of width $\sigma = ${OS}''$, the Vulcan evidence is its best likelihood times the **Occam factor** $\sqrt{2\pi}\,\sigma/\Delta\theta$. So $B_{GR,V} \approx \dfrac{\Delta\theta}{\sqrt{2\pi}\,\sigma}\,e^{-\chi^2_{GR}/2} = ${B_GR_V.toFixed(0)}$.` },
      { label: 'Read it honestly', text: t`$2\ln B = ${(2 * Math.log(B_GR_V)).toFixed(1)}$: "strong" on the Kass–Raftery scale, but its size depends on the prior width you chose for Vulcan. The decisive facts were outside the fit: GR **predicted** $43''$ in advance, and no Vulcan was ever found.` },
    ],
    answer: t`Newton is excluded; Vulcan fits but pays an Occam factor of about $1/${B_GR_V.toFixed(0)}$ for its free mass; GR predicts the anomaly with no parameters and is preferred ($\Delta\text{AIC} \approx 2$, $B_{GR,V} \approx ${B_GR_V.toFixed(0)}$ for this prior).`,
  },
  practice: [
    mcq({
      id: 'always-better', difficulty: 2,
      prompt: t`Adding a cubic term to the quadratic thrust model lowers $\chi^2_{\min}$ from $${FITS[2].chi2.toFixed(2)}$ to $${FITS[3].chi2.toFixed(2)}$. Is that evidence for the cubic term?`,
      visual: thrustPic([2, 3], 'Quadratic (gold) and cubic (violet) fits: nearly indistinguishable.'),
      choices: [
        t`No: a nested model with an extra parameter can never have a higher $\chi^2_{\min}$, and a drop of $${(FITS[2].chi2 - FITS[3].chi2).toFixed(2)}$ is far less than the roughly 1 expected from noise alone`,
        t`Yes: any drop in $\chi^2$ supports the bigger model`,
        'Yes, because the cubic has more parameters',
        t`No, because $\chi^2$ cannot be compared between models`,
      ],
      answer: 0,
      why: { 1: 'An extra free parameter absorbs noise, so χ² falls even when the term is zero in nature.', 2: 'More parameters is the cost, not the evidence.', 3: 'It can, between nested models — as long as the expected drop from extra freedom is accounted for.' },
      hints: ['If the true cubic coefficient were zero, would χ² still fall when you add it?', t`For one extra parameter, noise alone lowers $\chi^2$ by about 1 on average.`],
      teach: 'A bigger nested model always fits at least as well; only a drop well beyond what its extra freedom explains is evidence.',
      explain: t`For one added parameter, pure noise lowers $\chi^2$ by about 1 on average (a $\chi^2$ with 1 degree of freedom). A drop of $${(FITS[2].chi2 - FITS[3].chi2).toFixed(2)}$ is entirely consistent with no cubic term; AIC rises from $${FITS[2].aic.toFixed(1)}$ to $${FITS[3].aic.toFixed(1)}$.`,
    }),
    num({
      id: 'aic', difficulty: 2,
      gen(r) {
        const pair = r.pick([[1, 2], [2, 3], [2, 4], [1, 3]]), [a, b] = pair.map((d) => FITS[d]);
        const ans = b.aic - a.aic;
        return {
          prompt: t`For the thrust data, the ${NAMES[pair[0]]} model ($k = ${a.k}$) has $\chi^2_{\min} = ${a.chi2.toFixed(3)}$ and the ${NAMES[pair[1]]} model ($k = ${b.k}$) has $\chi^2_{\min} = ${b.chi2.toFixed(3)}$. What is $\text{AIC}_{\text{${NAMES[pair[1]]}}} - \text{AIC}_{\text{${NAMES[pair[0]]}}}$? (Use $-2\ln\hat{\mathcal L} = \chi^2_{\min}$.)`,
          visual: thrustPic(pair, `The ${NAMES[pair[0]]} (gold) and ${NAMES[pair[1]]} (violet) fits.`),
          answer: ans, tol: { rel: 0.01, abs: 0.01 },
          errors: [{ value: b.chi2 - a.chi2, feedback: 'You compared χ² only; AIC adds 2 per parameter.' }, { value: b.chi2 - a.chi2 + (b.k - a.k), feedback: 'AIC adds 2k, not k.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$\text{AIC} = \chi^2_{\min} + 2k$.`, t`$(${b.chi2.toFixed(3)} + ${2 * b.k}) - (${a.chi2.toFixed(3)} + ${2 * a.k})$.`],
          teach: 'AIC charges 2 for each parameter: an extra parameter must lower χ² by more than 2 to be preferred.',
          explain: t`$\Delta\text{AIC} = ${ans.toFixed(2)}$: ${ans < 0 ? `the ${NAMES[pair[1]]} model is preferred` : `the ${NAMES[pair[0]]} model is preferred`}. Differences under about 2 are weak; above about 10, decisive.`,
        };
      },
    }),
    num({
      id: 'bic', difficulty: 2,
      gen(r) {
        const pair = r.pick([[1, 2], [2, 3], [2, 4]]), [a, b] = pair.map((d) => FITS[d]);
        const ans = b.bic - a.bic;
        return {
          prompt: t`Same data, $N = ${NPTS}$ points. The ${NAMES[pair[0]]} ($k = ${a.k}$, $\chi^2_{\min} = ${a.chi2.toFixed(3)}$) against the ${NAMES[pair[1]]} ($k = ${b.k}$, $\chi^2_{\min} = ${b.chi2.toFixed(3)}$): what is $\text{BIC}_{\text{${NAMES[pair[1]]}}} - \text{BIC}_{\text{${NAMES[pair[0]]}}}$?`,
          visual: thrustPic(pair, `The ${NAMES[pair[0]]} (gold) and ${NAMES[pair[1]]} (violet) fits.`),
          answer: ans, tol: { rel: 0.01, abs: 0.01 },
          errors: [{ value: b.aic - a.aic, feedback: t`That is ΔAIC. BIC charges $\ln N$ per parameter, not 2.` }, { value: b.chi2 - a.chi2, feedback: 'You compared χ² only; add the penalty k ln N.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$\text{BIC} = \chi^2_{\min} + k\ln N$, with $\ln ${NPTS} = ${Math.log(NPTS).toFixed(3)}$.`],
          teach: 'BIC charges ln N per parameter, so with more data it penalizes complexity more than AIC does.',
          explain: t`$\Delta\text{BIC} = (${b.chi2.toFixed(3)} - ${a.chi2.toFixed(3)}) + ${b.k - a.k}\times${Math.log(NPTS).toFixed(3)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'wilks', difficulty: 3,
      gen(r) {
        const d = r.pick([2.71, 3.84, 4.0, 5.36, 6.63, 9.0]);
        const ans = p1(d);
        return {
          prompt: t`Two nested models differ by one parameter, and the larger one lowers $\chi^2_{\min}$ by $\Delta\chi^2 = ${d}$. If the extra parameter were really zero, $\Delta\chi^2$ would follow a $\chi^2$ distribution with 1 degree of freedom (Wilks’s theorem). What is the p-value, $P(\chi^2_1 \ge ${d})$?`,
          visual: { type: 'labx-stats', params: { mode: 'tail', test: 'chi2', nu: 1, stat: d, controls: false, hide: ['p'] }, caption: 'The χ² distribution with 1 degree of freedom, with the tail beyond the observed Δχ² shaded.' },
          answer: ans, tol: { rel: 0.03, abs: 0.0005 },
          errors: [{ value: ans / 2, feedback: 'The χ² tail is one-sided already; do not halve it.' }],
          hints: [t`For 1 degree of freedom, $P(\chi^2_1 \ge d) = P(|z| \ge \sqrt{d})$ for a standard normal $z$.`, t`$\sqrt{${d}} = ${Math.sqrt(d).toFixed(3)}$: find the two-sided normal tail beyond that.`],
          teach: 'For nested models, Δχ² for one extra parameter is χ² with 1 degree of freedom when the parameter is truly zero.',
          explain: t`$P = P(|z| \ge ${Math.sqrt(d).toFixed(3)}) = ${ans.toPrecision(3)}$. The thrust data’s line-to-quadratic drop of $${(FITS[1].chi2 - FITS[2].chi2).toFixed(2)}$ gives $p = ${p1(FITS[1].chi2 - FITS[2].chi2).toFixed(3)}$. Wilks applies only to **nested** models with the null value inside the allowed range.`,
        };
      },
    }),
    num({
      id: 'occam', difficulty: 3,
      gen(r) {
        const w = r.pick([20, 50, 100, 200]), s = r.pick([1, 2, 4]), dchi = r.pick([0, 2, 4, 9]);
        const ans = w / (Math.sqrt(2 * Math.PI) * s) * Math.exp(-dchi / 2);
        return {
          prompt: t`A simpler model $M_0$ fixes a parameter at zero; the extended model $M_1$ lets it range uniformly over a prior width $\Delta\theta = ${w}$ and the data constrain it to a Gaussian of width $\sigma_\theta = ${s}$. $M_1$’s best fit is better by $\Delta\chi^2 = ${dchi}$. In the Laplace approximation, $B_{01} \approx \dfrac{\Delta\theta}{\sqrt{2\pi}\,\sigma_\theta}\,e^{-\Delta\chi^2/2}$. Compute $B_{01}$.`,
          visual: occamPic(w, s, 'The extended model’s flat prior (gold) against the narrow range the data allow (blue).'),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: w / (Math.sqrt(2 * Math.PI) * s) * Math.exp(dchi / 2), feedback: t`A better fit for $M_1$ should **lower** $B_{01}$: the factor is $e^{-\Delta\chi^2/2}$.` }, { value: w / s * Math.exp(-dchi / 2), feedback: t`Keep the $\sqrt{2\pi}$ in the Occam factor.` }].filter((e) => Math.abs(e.value - ans) > 0.03 * ans),
          hints: [t`Occam factor: $\Delta\theta/(\sqrt{2\pi}\,\sigma_\theta) = ${w}/(${(Math.sqrt(2 * Math.PI) * s).toFixed(3)})$.`, t`Multiply by $e^{-${dchi}/2}$.`],
          teach: 'A Bayes factor rewards a model for fitting and charges it for the prior range its parameter did not need.',
          explain: t`$B_{01} = ${(w / (Math.sqrt(2 * Math.PI) * s)).toFixed(2)} \times ${Math.exp(-dchi / 2).toPrecision(3)} = ${ans.toPrecision(3)}$: ${ans > 1 ? 'the simpler model is favoured despite the worse fit' : 'the extended model is favoured'}. Double $\Delta\theta$ and $B_{01}$ doubles — the result is only as meaningful as the prior.`,
        };
      },
    }),
    mcq({
      id: 'prior-width', difficulty: 3,
      prompt: t`A paper reports a Bayes factor of 30 in favour of "no new force" over "a new force of unknown strength", using a prior on the strength spanning ten orders of magnitude. What should you ask first?`,
      visual: occamPic(100, 2, 'Widening the prior (gold) spreads the extended model’s evidence thinner, whatever the data say.'),
      choices: [
        'How the result changes with a different, physically motivated prior range — Bayes factors scale with the prior width',
        'Nothing: a Bayes factor of 30 settles it',
        'Whether they used AIC instead, since AIC is always better',
        'Whether 30 is above 5σ',
      ],
      answer: 0,
      why: { 1: 'An arbitrarily wide prior can make any extra parameter look disfavoured (Lindley’s paradox).', 2: 'AIC avoids priors but answers a different question (predictive accuracy); neither is "always better".', 3: 'A Bayes factor is an odds ratio, not a number of standard deviations.' },
      hints: ['What does the Occam factor depend on?', 'If the prior were ten times narrower, what would happen to B?'],
      teach: 'Report a Bayes factor with its prior and with how it changes under reasonable alternatives.',
      explain: 'The evidence for the extended model scales as 1/Δθ. A prior spanning ten decades, chosen for convenience, can manufacture a large Bayes factor for the simpler model. A sensitivity analysis over sensible priors is part of an honest result (Trotta 2008).',
    }),
    mcq({
      id: 'scale', difficulty: 2,
      prompt: t`A comparison gives $2\ln B_{10} = 7.4$. On Kass & Raftery’s scale, how strong is the evidence for $M_1$?`,
      visual: timeBars([
        { y: 4, from: 0, to: 2, color: 'ink3', label: '0–2' },
        { y: 3, from: 2, to: 6, color: 'accent', label: '2–6' },
        { y: 2, from: 6, to: 10, color: 'gold', label: '6–10' },
        { y: 1, from: 10, to: 14, color: 'violet', label: '> 10' },
      ], { x: [-0.5, 14.5], y: [0.4, 4.8], xlabel: '2 ln B', xticks: 7 }, { caption: 'Kass & Raftery’s (1995) bands for 2 ln B. Which words go with which band is the question.' }),
      choices: ['Strong', 'Not worth more than a bare mention', 'Positive', 'Very strong'],
      answer: 0,
      why: { 1: 'That is 0 to 2.', 2: 'That is 2 to 6.', 3: 'That is above 10.' },
      hints: ['Find the band that contains 7.4.', 'The bands are 0–2, 2–6, 6–10 and above 10.'],
      teach: 'Kass & Raftery: 2 ln B of 0–2 is barely worth mentioning, 2–6 positive, 6–10 strong, above 10 very strong.',
      explain: t`$7.4$ lies in 6–10: "strong" — about $B = e^{3.7} \approx 40$. These words are conventions for communication, not thresholds of truth.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transit', difficulty: 3, transfer: true,
      gen(r) {
        const Npts = r.pick([400, 1000, 2500]), c0 = r.int(Npts - 20, Npts + 40), drop = r.pick([18, 25, 40, 60]);
        const ans = (c0 - drop + 3 * Math.log(Npts)) - c0;
        return {
          prompt: t`A light curve of $${Npts}$ points is fitted by a flat line ($k = 1$, $\chi^2_{\min} = ${c0}$) and by a flat line plus a transit with three more parameters (depth, duration, mid-time; $\chi^2_{\min} = ${c0 - drop}$). What is $\text{BIC}_{\text{transit}} - \text{BIC}_{\text{flat}}$?`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [0.9993, 1.0003], aspect: 'wide', axesAt: 'edge', xlabel: 'time from mid-transit (h)', ylabel: 'relative flux', xticks: 8, yticks: 3, curves: [{ fn: '1 - 0.0004*max(0, min(1, (1.4 - abs(x))/0.25))', color: 'accent', samples: 800 }, { fn: '1', color: 'gold', dash: [6, 4] }] }, caption: 'The two models: a flat line (gold, dashed) and a transit (blue). Constructed shape.' },
          answer: ans, tol: { rel: 0.01, abs: 0.05 },
          errors: [{ value: -drop + 6, feedback: 'That is ΔAIC (2 per parameter). BIC charges ln N per parameter.' }, { value: -drop + Math.log(Npts), feedback: 'Three extra parameters, not one.' }].filter((e) => Math.abs(e.value - ans) > 0.1),
          hints: [t`$\Delta\text{BIC} = \Delta\chi^2_{\min} + \Delta k\,\ln N$, with $\Delta k = 3$.`, t`$\ln ${Npts} = ${Math.log(Npts).toFixed(3)}$.`],
          teach: 'With many data points, BIC demands a large χ² improvement for each added parameter.',
          explain: t`$\Delta\text{BIC} = -${drop} + 3\times${Math.log(Npts).toFixed(3)} = ${ans.toFixed(2)}$. ${ans < -10 ? 'Strongly favours the transit.' : ans < 0 ? 'Favours the transit, but not decisively — an injection–recovery test would say how often noise does this.' : 'Favours the flat line: the dip is not significant once its three parameters are paid for.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-nonnested', difficulty: 3,
      prompt: t`You want to compare a power-law model with an exponential model for the same data. Which tool is **not** appropriate?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y', xticks: 5, yticks: 4, curves: [{ fn: '1/(1 + x)^1.2', color: 'accent', label: 'power law', labelAt: 6, labelDy: -8 }, { fn: 'exp(-0.45*x)', color: 'gold', label: 'exponential', labelAt: 3, labelDx: 6, labelDy: 14 }] }, caption: 'Two different families: neither is a special case of the other.' },
      choices: ['A likelihood-ratio test using Wilks’s χ² distribution', 'AIC', 'BIC', 'A Bayes factor'],
      answer: 0,
      why: { 1: 'AIC compares any models fitted to the same data.', 2: 'BIC likewise does not require nesting.', 3: 'Bayes factors compare any models with stated priors.' },
      hints: ['Can either model be obtained from the other by fixing one of its parameters?', 'Which tool assumes exactly that?'],
      teach: 'Wilks’s theorem needs nested models; AIC, BIC and Bayes factors do not.',
      explain: 'Neither model is the other with a parameter set to a value, so Δχ² has no χ²-distribution guarantee. Use AIC, BIC or a Bayes factor — or simulate the Δχ² distribution under each model.',
    }),
    mcq({
      id: 'cp-vulcan', difficulty: 3,
      prompt: t`In the 19th century an unseen planet, "Vulcan", was proposed to explain Mercury’s anomalous perihelion advance; its mass could be chosen to fit the anomaly exactly. General relativity predicted the anomaly with no adjustable parameter. Which statement is the soundest lesson?`,
      visual: occamPic(PRIOR, OS, 'Vulcan’s free mass could have produced any anomaly in a wide range (gold); the measurement picks a thin slice (blue).', OBS),
      choices: [
        'A model that predicts the observed value with no free parameter earns more support than one that can be tuned to fit it — and a tuned model needs independent confirmation (Vulcan was never found)',
        'Vulcan and GR are equally good, since both fit the data',
        'Vulcan is better, since it fits exactly',
        'Neither can be judged without more perihelion data',
      ],
      answer: 0,
      why: { 1: 'Equal fits are not equal evidence: Vulcan pays an Occam penalty for its free mass.', 2: 'A perfect fit by tuning is exactly what a free parameter guarantees.', 3: 'Model comparison judges them on these data; other observables (searches for Vulcan, light bending) added more.' },
      hints: ['Which model could have fitted almost any anomaly?', 'What did GR risk that Vulcan did not?'],
      teach: 'Predictions with fewer free parameters, confirmed by data, carry more evidential weight; that is what the Occam factor encodes.',
      explain: 'GR risked being wrong and was not; Vulcan could fit anything in its range and so explained little until found. Model comparison makes this quantitative — and the history shows why independent tests matter.',
    }),
  ],
  sources: [SRC.kass, SRC.trotta, SRC.pdgStats, SRC.will,
    { label: 'H. Akaike, “A new look at the statistical model identification”, IEEE Trans. Autom. Control 19, 716–723 (1974)', url: 'https://doi.org/10.1109/TAC.1974.1100705' },
    { label: 'G. Schwarz, “Estimating the dimension of a model”, Ann. Statist. 6, 461–464 (1978)', url: 'https://doi.org/10.1214/aos/1176344136' }],
});
