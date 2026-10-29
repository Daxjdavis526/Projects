// curve_fit, absolute_sigma and other defaults — the software traps of
// least squares, collected: curve_fit's default starting point (all ones),
// fits with no sigma (every point weighted alike), parameters stopped at a
// bound (a σ that means nothing), numpy.polyfit's w = 1/σ (not 1/σ²) and its
// covariance scaled by χ²/ν unless cov='unscaled', logarithms of counts
// (zeros, and the bias of ln n), and numpy.std's ddof = 0. The meaning of
// absolute_sigma itself is taught in prog.P14.1, linked rather than
// repeated. A quartz tuning fork's resonance (the Explore, run in the
// browser's Python) and a heteroscedastic calibration line (the exercise);
// a solid motor's thrust tail-off as the transfer.
// Every number is computed here, and the Python outputs quoted were copied
// from running the snippets in the Atlas's Pyodide (SciPy 1.18, NumPy 2.4).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { linfit, dataGraph, r6, SIMNOTE } from './_labf.js';
import { G } from './_labg.js';

const t = String.raw;

// ── a 32 768 Hz quartz tuning fork's resonance, ±0.03 V (synthetic, seed 73 in _labf normals) ──
const FF = Array.from({ length: 25 }, (_, i) => 32761 + 0.5 * i);
const FY = [0.1091, 0.1065, 0.1351, 0.1789, 0.1636, 0.1394, 0.2103, 0.277, 0.33, 0.5258, 0.6411, 0.9095, 1.2249, 1.6577, 1.9353, 2.0053, 1.6659, 1.2807, 0.9524, 0.7008, 0.5036, 0.4034, 0.3181, 0.3185, 0.2241];
const lorentz = (f, p) => p[0] / (1 + ((f - p[1]) / p[2]) ** 2);
const FIT = G.lm(lorentz, FF, FY, FF.map(() => 0.03), [2, 32768.5, 1], { scale: [1, 1, 1] });

// ── the polyfit exercise: a calibration line whose σ grows with x ──
const PX = [1, 2, 3, 4, 5, 6], PY = [2.1, 3.9, 6.2, 7.8, 10.3, 11.9], PS = [0.1, 0.1, 0.2, 0.2, 0.4, 0.4];
const OK = linfit(PX, PY, PS);                               // weights 1/σ², σ taken as true
const WRONG = linfit(PX, PY, PS.map((s) => s * s));          // what w = 1/σ² in polyfit does: σ_eff = σ²
const UNW = linfit(PX, PY);                                   // no weights at all

const forkPic = (caption, extra = {}) => ({ type: 'graph', params: { ...dataGraph({ xs: FF.map((f) => f - 32768), ys: FY, sy: 0.03, xlabel: 'f − 32 768 Hz', ylabel: 'amplitude (V)', x: [-7.5, 5.5], y: [0, 2.3] }), ...extra }, caption });

export default lesson({
  id: 'lab.A12.1',
  title: 'curve_fit, absolute_sigma and other defaults',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`Fitting software does exactly what its defaults say, and the defaults were chosen for convenience, not for your experiment. \`scipy.optimize.curve_fit\` starts every parameter at **1** unless you give \`p0\`; with no \`sigma\` it weights every point **alike**; with \`absolute_sigma=False\` (the default) it **rescales** the covariance so that $\chi^2/\nu = 1$ ([what that means](#/lesson/prog.P14.1)). \`numpy.polyfit\` takes weights $w_i = 1/\sigma_i$ — **not** $1/\sigma_i^2$ — and scales its covariance the same way unless \`cov='unscaled'\`. All of them minimize

$$\chi^2(\mathbf p) = \sum_i \left(\frac{y_i - f(x_i; \mathbf p)}{\sigma_i}\right)^2$$

and every trap below is a wrong $\sigma_i$, a wrong start for $\mathbf p$, or a wrong reading of what came back.`,
  symbols: [
    { tex: '\\chi^2(\\mathbf p)', text: 'the weighted sum of squared misfits that a least-squares routine minimizes' },
    { tex: 'y_i,\\ x_i', text: 'the data and their settings' },
    { tex: 'f(x_i; \\mathbf p)', text: 'the model, with parameter vector $\\mathbf p$ (curve_fit’s `popt`)' },
    { tex: '\\sigma_i', text: 'each point’s standard uncertainty: curve_fit’s `sigma`; numpy.polyfit wants $w_i = 1/\\sigma_i$' },
  ],
  why: t`A fit with a silently wrong default returns numbers that look as authoritative as right ones — the commonest way a careful measurement ends up with a wrong uncertainty.`,
  visual: {
    type: 'code-runner',
    title: 'A tuning fork and the default starting point',
    lead: t`A quartz tuning fork (the 32 768 Hz kind in every watch) is driven through its resonance and the response amplitude recorded every 0.5 Hz. Run the snippet: the same data and model, fitted from curve_fit’s default start and from a start read off the data.`,
    tasks: [
      'The default start (A = f₀ = γ = 1) sends the fit to f₀ ≈ 1.2 Hz with an 860 Hz width — a curve nearly flat across the data. No error, no warning: only an absurd uncertainty of tens of megahertz gives it away.',
      'Starting from the data’s own peak, f₀ = 32 768.29 ± 0.015 Hz with χ²/ν = 0.98.',
      'Change the first fit to p0=[1, 32760, 1] — only 8 Hz below the peak — and it still fails; p0=[1, 32768, 1] succeeds. The start must be within about a width of the peak.',
    ],
    params: {
      rows: 20,
      code: t`import numpy as np
from scipy.optimize import curve_fit

f = np.arange(32761, 32773.01, 0.5)          # drive frequency, Hz
y = np.array([${FY.join(', ')}])               # amplitude, V, each ±0.03

def lorentz(f, A, f0, g):
    return A / (1 + ((f - f0) / g)**2)

p, C = curve_fit(lorentz, f, y)              # p0 defaults to [1, 1, 1]
print(f"default p0: A = {p[0]:.4g}, f0 = {p[1]:.4g} Hz, g = {p[2]:.4g} Hz")
print(f"            sigma(f0) = {np.sqrt(C[1, 1]):.2g} Hz")

p0 = [y.max(), f[np.argmax(y)], 1.0]         # start from the data's own peak
p, C = curve_fit(lorentz, f, y, p0=p0, sigma=np.full(f.size, 0.03), absolute_sigma=True)
s = np.sqrt(np.diag(C))
print(f"data p0:    A = {p[0]:.3f} ± {s[0]:.3f}, f0 = {p[1]:.3f} ± {s[1]:.3f} Hz, g = {p[2]:.3f} ± {s[2]:.3f} Hz")
r = (y - lorentz(f, *p)) / 0.03
print("chi2/nu =", round(float(np.sum(r**2) / (f.size - 3)), 2))`,
    },
    caption: t`Synthetic data from a Lorentzian with $A = 2.0$ V, $f_0 = 32\,768.3$ Hz, half-width 1.6 Hz and noise of 0.03 V. Runs in the browser’s Python (Pyodide); the first run loads SciPy, which takes a few seconds. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A calibration line has error bars that grow with $x$: $x = 1 \ldots 6$, $y = ${PY.join(', ')}$, $\sigma = ${PS.join(', ')}$. A colleague fits it three ways with \`np.polyfit(x, y, 1, ...)\`: with \`w=1/sigma**2\`, with no weights, and with \`w=1/sigma, cov='unscaled'\`. Which is right, and how different are the answers?`,
    visual: { type: 'graph', params: dataGraph({ xs: PX, ys: PY, sy: PS, fit: OK, xlabel: 'x', ylabel: 'y', x: [0.5, 6.5], y: [1, 12.8], curves: [{ fn: `${r6(WRONG.a)} + ${r6(WRONG.b)}*x`, color: 'warn', dash: [6, 4], width: 1.6 }, { fn: `${r6(UNW.a)} + ${r6(UNW.b)}*x`, color: 'ink3', dash: [2, 3], width: 1.6 }], legend: [{ label: 'w = 1/σ (right)', color: 'gold' }, { label: 'w = 1/σ²', color: 'warn', dash: [6, 4] }, { label: 'unweighted', color: 'ink3', dash: [2, 3] }], legendAt: 'tl' }), caption: 'The data with ±1σ bars and the three fitted lines (the differences are small on this scale; the numbers in the steps are not).' },
    steps: [
      { label: 'What polyfit minimizes', text: t`\`np.polyfit\` minimizes $\sum_i (w_i r_i)^2$. For $\chi^2$ you need $w_i r_i = r_i/\sigma_i$: so $w_i = 1/\sigma_i$.` },
      { label: 'The 1/σ² slip', text: t`With $w = 1/\sigma^2$ the fit behaves as if each point’s uncertainty were $\sigma_i^2$: the 0.1 points count $(0.4^2/0.1^2)^2 = 256$ times the 0.4 points instead of 16. Slope $${WRONG.b.toFixed(4)}$ instead of $${OK.b.toFixed(4)}$.` },
      { label: 'No weights', text: t`Every point alike: slope $${UNW.b.toFixed(4)} \pm ${UNW.sb.toFixed(4)}$ (σ from the scatter) — the noisy high-$x$ points pull as hard as the precise ones.` },
      { label: 'The right call', text: t`\`w=1/sigma, cov='unscaled'\`: slope $${OK.b.toFixed(4)} \pm ${OK.sb.toFixed(4)}$, intercept $${OK.a.toFixed(3)} \pm ${OK.sa.toFixed(3)}$, $\chi^2/\nu = ${OK.chi2r.toFixed(2)}$.` },
      { label: 'Scaled or not', text: t`With \`cov=True\` NumPy multiplies the covariance by $\chi^2/\nu = ${OK.chi2r.toFixed(2)}$: here a ${(100 * (Math.sqrt(OK.chi2r) - 1)).toFixed(0)} % change in each σ. Harmless when $\chi^2/\nu \approx 1$ — but it silently overrides error bars you measured, which is exactly when you need to know they disagree with the scatter.` },
    ],
    answer: t`\`w=1/sigma, cov='unscaled'\`: slope $${OK.b.toFixed(4)} \pm ${OK.sb.toFixed(4)}$. The $1/\sigma^2$ slip gives $${WRONG.b.toFixed(4)}$, the unweighted fit $${UNW.b.toFixed(4)}$.`,
  },
  practice: [
    mcq({
      id: 'default-p0', difficulty: 2,
      prompt: t`Why did \`curve_fit(lorentz, f, y)\` with no \`p0\` fail on the tuning fork’s resonance near 32 768 Hz?`,
      visual: forkPic('The resonance being fitted: a peak 1.6 Hz wide, 32 768 Hz from the origin.'),
      choices: ['Without p0 every parameter starts at 1, so the trial peak sits at 1 Hz, 32 kHz from the data; the fit has no gradient pointing to the real peak', 'curve_fit cannot fit Lorentzians', 'The data were not weighted', 'The noise is too large for any fit'],
      answer: 0,
      why: { 1: 'Any smooth model can be fitted; the problem is where the search starts.', 2: 'Weights change how points count, not whether the search finds the peak.', 3: 'With a good start the same data give f₀ to 0.015 Hz.' },
      hints: ['What values does curve_fit use for the parameters when you do not supply p0?'],
      teach: 'curve_fit starts at p0 = 1 for every parameter: read a start off the data whenever a parameter is far from 1.',
      explain: t`A local optimizer only goes downhill from where it starts. From $f_0 = 1$ Hz, a narrow peak overlaps no data, so the cheapest move is to make the curve broad and flat. Start at the data’s maximum and its half-width and it converges in a few steps.`,
    }),
    num({
      id: 'w-ratio', difficulty: 2,
      gen(r) {
        const s1 = r.pick([0.05, 0.1, 0.2]), k = r.pick([2, 3, 4, 5]);
        const s2 = s1 * k;
        const ans = k ** 4;
        return {
          prompt: t`Two points have $\sigma_1 = ${s1}$ and $\sigma_2 = ${s2.toFixed(2)}$. In \`np.polyfit\` someone passes \`w = 1/sigma**2\`. How many times more does point 1 count than point 2 in that fit (the ratio of their contributions’ weights)? A correct fit would make it ${k * k}.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [0, 2], xlabel: '', ylabel: '', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ param: ['1', `1 - ${r6(s1)}*2 + ${r6(4 * s1)}*t`], t: [0, 1], color: 'accent', width: 2 }, { param: ['2', `1 - ${r6(s2)}*2 + ${r6(4 * s2)}*t`], t: [0, 1], color: 'accent', width: 2 }], points: [{ x: 1, y: 1, r: 5, color: 'accent', label: 'point 1' }, { x: 2, y: 1, r: 5, color: 'accent', label: 'point 2' }] }, caption: 'Two points and their error bars (drawn at twice their σ for visibility).' },
          answer: ans, tol: { rel: 0.001 },
          errors: [{ value: k * k, feedback: 'That is the correct ratio, 1/σ² against 1/σ². With w = 1/σ², the squared residual is multiplied by w² = 1/σ⁴.' }, { value: k, feedback: 'polyfit squares w times the residual: the effective weight is w².' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['polyfit minimizes Σ (wᵢ rᵢ)², so a point’s effective weight is wᵢ².', t`With $w = 1/\sigma^2$ that is $1/\sigma^4$.`],
          teach: 'numpy.polyfit squares its w: pass w = 1/σ to get the χ² weights 1/σ².',
          explain: t`Effective weights $1/\sigma^4$: the ratio is $(\sigma_2/\sigma_1)^4 = ${k}^4 = ${ans}$ instead of $${k}^2 = ${k * k}$. The precise points dominate far more than they should, and the reported covariance is meaningless.`,
        };
      },
    }),
    mcq({
      id: 'no-sigma', difficulty: 2,
      prompt: t`Count data from a decay (σ = √n: about 30 counts early, 3 late) are fitted with \`curve_fit(model, t, n)\` and no \`sigma\`. What goes wrong?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 1050], xlabel: 't (s)', ylabel: 'counts', axesAt: 'edge', curves: [{ fn: '1000*exp(-x/2) + 10', color: 'gold' }, ...[0.5, 1.5, 2.5, 3.5, 4.5, 6, 7.5, 9].flatMap((x) => { const n = 1000 * Math.exp(-x / 2) + 10; const s = Math.sqrt(n); return [{ param: [`${x}`, `${r6(n - s)} + ${r6(2 * s)}*t`], t: [0, 1], color: 'accent', width: 1.4 }]; })], points: [0.5, 1.5, 2.5, 3.5, 4.5, 6, 7.5, 9].map((x) => ({ x, y: r6(1000 * Math.exp(-x / 2) + 10), r: 3.5, color: 'accent' })) }, caption: 'Counts with Poisson error bars: ten times larger at the start than at the end.' },
      choices: ['Every point is weighted alike, so the large-σ early points pull as hard as the precise late ones, and pcov comes from the residual scatter rather than the counting statistics', 'curve_fit refuses to run without sigma', 'The fit is weighted by 1/n automatically', 'Nothing: sigma only affects the plot'],
      answer: 0,
      why: { 1: 'It runs happily: sigma=None means σᵢ = 1 for all points.', 2: 'No automatic weighting exists; you must supply sigma.', 3: 'sigma enters χ², and so the parameters and their covariance.' },
      hints: ['What does curve_fit assume about σᵢ when sigma is None?'],
      teach: 'No sigma means equal weights: give curve_fit the σ you know (√n for counts — or better, fit by Poisson likelihood).',
      explain: t`With equal weights the estimate is still unbiased for a correct model but noisier, and its covariance is scaled to the residual scatter — the right size only if the scatter is the same everywhere, which counts never are. With many low-count bins, use a Poisson likelihood instead ([as in the muon lifetime](#/lesson/lab.E.15)).`,
    }),
    mcq({
      id: 'bound', difficulty: 3,
      prompt: t`A fit with \`bounds=([0, 0, 0], [np.inf, np.inf, 5])\` returns the third parameter as exactly 5.000 with a tiny uncertainty. What should you conclude?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [3, 8], y: [0, 10], xlabel: 'parameter 3', ylabel: 'χ²', axesAt: 'edge', curves: [{ fn: '0.8*(x - 6.2)^2 + 1', color: 'accent' }], vlines: [{ x: 5, color: 'warn', label: 'upper bound' }], shade: [{ fn: '10', from: 5, to: 8, color: 'warn', alpha: 0.15 }] }, caption: 'χ² against the parameter: the minimum lies beyond the bound, so the fit stops at the wall.' },
      choices: ['The fit was stopped by the bound: the true minimum lies outside it, and the reported σ (from the curvature at a point that is not a minimum) means nothing', 'The parameter is 5.000, measured very precisely', 'The bound was well chosen', 'Bounds always shrink uncertainties, so the result is better'],
      answer: 0,
      why: { 1: 'A value exactly at a bound is the bound, not a measurement.', 2: 'A bound the fit runs into is excluding the region the data prefer.', 3: 'Bounds do not add information; they forbid regions.' },
      hints: ['At a true minimum the gradient of χ² is zero. Is it zero at a wall?', 'Where does the χ² curve in the picture reach its minimum?'],
      teach: 'A parameter at its bound is a red flag: relax the bound, or rethink the model — never quote the σ.',
      explain: t`The covariance comes from the curvature of $\chi^2$ around a minimum. At a bound $\chi^2$ is still falling, so the curvature-based σ is meaningless. Either the model is wrong (the parameter wants an unphysical value) or the bound is.`,
    }),
    num({
      id: 'log-bias', difficulty: 3,
      gen(r) {
        const mu = r.pick([4, 5, 8, 10, 20, 50]);
        const ans = -1 / (2 * mu);
        return {
          prompt: t`For Poisson counts with mean $\mu$, $\langle\ln n\rangle \approx \ln\mu - 1/(2\mu)$. If late bins of a decay hold about $\mu = ${mu}$ counts, by how much on average does $\ln n$ sit below $\ln\mu$ — the bias a fit of $\ln n$ against $t$ inherits there? (Enter the signed value.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 50], y: [-0.15, 0.01], xlabel: 'mean count μ', ylabel: '⟨ln n⟩ − ln μ', axesAt: 'edge', curves: [{ fn: '-1/(2*x)', color: 'accent', domain: [2, 50] }], vlines: [{ x: mu, color: 'gold' }], hlines: [{ y: 0, color: 'ink3' }] }, caption: 'The approximate bias of ln n for Poisson counts (the expansion is poor below μ ≈ 3, and ln 0 has no value at all).' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: 'The logarithm is concave: the average of ln n lies below ln of the average.' }, { value: -1 / mu, feedback: 'The second-order term is −σ²/(2μ²) with σ² = μ: −1/(2μ).' }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`Expand $\ln n$ about $\mu$ to second order: $\ln\mu + (n - \mu)/\mu - (n - \mu)^2/(2\mu^2)$.`, t`Average: $\langle n - \mu\rangle = 0$, $\langle(n - \mu)^2\rangle = \mu$.`],
          teach: 'Taking logs of small counts biases them low (and ln 0 is undefined): fit the counts themselves.',
          explain: t`$-1/(2 \times ${mu}) = ${ans.toFixed(3)}$. The bias grows exactly where the counts are fewest — the late bins that carry most of the information about $\tau$ — so a log-linear fit is pulled steeper. Dropping zero bins makes it worse. Fit $n$ directly with a Poisson likelihood.`,
        };
      },
    }),
    num({
      id: 'np-std', difficulty: 1,
      gen(r) {
        const xs = Array.from({ length: r.int(3, 6) }, () => r.float(9.6, 10.4, 0.01));
        const n = xs.length, m = xs.reduce((a, b) => a + b) / n;
        const ans = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / n);
        return {
          prompt: t`What does \`np.std([${xs.join(', ')}])\` return? (NumPy’s default is \`ddof=0\`.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [9.4, 10.6], y: [0, 1], xlabel: 'reading', ylabel: '', yticks: 0, axesAt: 'edge', points: xs.map((x) => ({ x, y: 0.5, r: 5, color: 'accent' })), vlines: [{ x: r6(m), color: 'gold', label: 'mean' }] }, caption: 'The readings and their mean.' },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: ans * Math.sqrt(n / (n - 1)), feedback: 'That is the sample standard deviation (ddof=1). NumPy’s default divides by N, not N − 1.' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$\sqrt{\sum(x_i - \bar x)^2/N}$ with $N = ${n}$.`],
          teach: 'np.std defaults to ddof=0, dividing by N: pass ddof=1 for the sample standard deviation.',
          explain: t`$${ans.toFixed(4)}$; with \`ddof=1\` it would be $${(ans * Math.sqrt(n / (n - 1))).toFixed(4)}$ — ${(100 * (Math.sqrt(n / (n - 1)) - 1)).toFixed(0)} % larger for $N = ${n}$. Python’s \`statistics.stdev\` and pandas’ \`.std()\` divide by $N - 1$; NumPy does not. See [mean, standard deviation and standard error](#/lesson/lab.A2.1).`,
        };
      },
    }),
    code({
      id: 'polyfit-right', difficulty: 2,
      prompt: t`Fit the calibration line of the worked example correctly with \`np.polyfit\`: weights that make it minimize $\chi^2$, and a covariance that keeps the stated error bars. Set \`b\`, \`a\` (slope, intercept) and \`sb\`, \`sa\` (their standard uncertainties).`,
      starter: t`import numpy as np

x = np.array([${PX.join(', ')}], float)
y = np.array([${PY.join(', ')}])
sigma = np.array([${PS.join(', ')}])

# your code
b, a, sb, sa = 0.0, 0.0, 0.0, 0.0
print(f"slope {b:.4f} ± {sb:.4f}, intercept {a:.3f} ± {sa:.3f}")`,
      answer: t`import numpy as np

x = np.array([${PX.join(', ')}], float)
y = np.array([${PY.join(', ')}])
sigma = np.array([${PS.join(', ')}])

(b, a), C = np.polyfit(x, y, 1, w=1/sigma, cov='unscaled')
sb, sa = np.sqrt(np.diag(C))
print(f"slope {b:.4f} ± {sb:.4f}, intercept {a:.3f} ± {sa:.3f}")`,
      tests: [
        { name: t`the slope is the $\chi^2$ (weights $1/\sigma^2$) slope, $${OK.b.toFixed(4)}$`, code: `abs(b - ${OK.b}) < 1e-9` },
        { name: 'the intercept matches', code: `abs(a - ${OK.a}) < 1e-9` },
        { name: t`the uncertainties are the unscaled ones: $\sigma_b = ${OK.sb.toFixed(4)}$`, code: `abs(sb - ${OK.sb}) < 1e-9 and abs(sa - ${OK.sa}) < 1e-9` },
      ],
      hints: [t`\`np.polyfit(x, y, 1, w=1/sigma, cov='unscaled')\` returns \`(p, C)\` with the slope first in \`p\`.`, t`\`sb, sa = np.sqrt(np.diag(C))\`.`],
      teach: 'polyfit: w = 1/σ, cov=\'unscaled\' when your σ are real; the highest power comes first.',
      explain: t`Slope $${OK.b.toFixed(4)} \pm ${OK.sb.toFixed(4)}$, intercept $${OK.a.toFixed(3)} \pm ${OK.sa.toFixed(3)}$. With \`cov=True\` the σ’s would be multiplied by $\sqrt{\chi^2/\nu} = ${Math.sqrt(OK.chi2r).toFixed(3)}$.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-tailoff', difficulty: 3, transfer: true,
      prompt: t`You fit a solid rocket motor’s thrust tail-off, $F = F_0e^{-(t - t_b)/\tau}$, to data recorded at $t = 28$–$34$ s after ignition, using \`curve_fit\` with no \`p0\`. It returns nonsense and a warning. What is the best fix?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [27, 35], y: [0, 1.2], xlabel: 't since ignition (s)', ylabel: 'thrust (scaled)', axesAt: 'edge', curves: [{ fn: 'min(1, exp(-(x - 28.5)/1.2))', color: 'accent' }] }, caption: 'The tail-off being fitted (schematic).' },
      choices: [t`Shift time to start at burnout ($t - 28.5$ s), fit $F_0e^{-t'/\tau}$, and give p0 from the data: $F_0 \approx$ the first reading, $\tau \approx$ the time to fall to 37 %`, 'Add bounds 0 < τ < 100 and rerun', 'Take logarithms of F and fit a straight line', 'Increase maxfev until it converges'],
      answer: 0,
      why: { 1: 'Bounds do not give the optimizer a sensible start; it can still stall far from the data.', 2: 'Logs reweight the points and fail when the thrust approaches zero or goes negative in the noise.', 3: 'More iterations from a hopeless start rarely help.' },
      hints: [t`With p0 = 1 for every parameter, what is $e^{-(t - 1)/1}$ at $t = 30$ s?`, 'Can you choose the time origin so the parameters are of order one?'],
      teach: 'Make parameters order-one by shifting and scaling the variables, and read p0 off the data.',
      explain: t`From the default start the model is $e^{-29}$ — zero to machine precision across the data — so the gradient vanishes. Measuring time from burnout and starting from the data’s own height and decay time puts the optimizer in the right valley at once.`,
    }),
    num({
      id: 'cp-scaled', difficulty: 2,
      gen(r) {
        const sb = r.float(0.010, 0.050, 0.001), c2 = r.pick([0.3, 0.5, 2.0, 3.0, 5.0]);
        const ans = sb * Math.sqrt(c2);
        return {
          prompt: t`With \`cov='unscaled'\`, \`np.polyfit\` gives a slope uncertainty of $${sb}$, and the fit has $\chi^2/\nu = ${c2}$. What does it report with \`cov=True\`?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [0, 2], xlabel: 'χ²/ν', ylabel: 'reported σ ÷ unscaled σ', axesAt: 'edge', curves: [{ fn: 'sqrt(x)', color: 'accent', domain: [0.05, 6] }], vlines: [{ x: c2, color: 'gold' }] }, caption: 'The scaled uncertainty grows as √(χ²/ν).' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: sb * c2, feedback: 'The covariance is multiplied by χ²/ν; the standard uncertainty by its square root.' }, { value: sb, feedback: 'cov=True rescales the covariance by χ²/ν.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$C_{\text{scaled}} = C\cdot\chi^2/\nu$, so $\sigma_{\text{scaled}} = \sigma\sqrt{\chi^2/\nu}$.`],
          teach: 'Scaled covariances multiply σ by √(χ²/ν): right only if you did not know σ in advance.',
          explain: t`$${sb}\sqrt{${c2}} = ${ans.toFixed(4)}$. ${c2 < 1 ? 'With χ²/ν below 1 the scaled σ is smaller than the measured error bars justify — a too-good fit has been rewarded.' : 'With χ²/ν above 1 the scaled σ grows — a sensible reaction to unexplained scatter, but it hides the question of why.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-checklist', difficulty: 2,
      prompt: t`Before trusting any \`curve_fit\` result, which check matters most?`,
      visual: forkPic('A fit worth checking.', { curves: [{ fn: `${r6(FIT.p[0])}/(1 + ((x - ${r6(FIT.p[1] - 32768)})/${r6(FIT.p[2])})^2)`, color: 'gold', width: 2 }] }),
      choices: ['Plot the fitted curve over the data with normalized residuals, and look at χ²/ν and whether any parameter sits at a bound', 'Check that pcov has no negative entries', 'Check that popt has as many digits as possible', 'Rerun with a different random seed'],
      answer: 0,
      why: { 1: 'Off-diagonal covariances are often negative; that is normal.', 2: 'Digits are not accuracy.', 3: 'Least squares involves no random seed.' },
      hints: ['What would have revealed the default-p0 failure immediately?'],
      teach: 'Always look: curve over data, residuals, χ²/ν, parameters at bounds — before quoting a single number.',
      explain: t`The tuning-fork failure is invisible in the numbers alone ($f_0 = 1.2$ Hz is “a number”) and glaring in a plot. Residuals and $\chi^2/\nu$ then judge the model and the error bars ([goodness of fit](#/lesson/lab.A6.1)).`,
    }),
  ],
  sources: [
    { label: 'SciPy 1.18 documentation: scipy.optimize.curve_fit (p0, sigma, absolute_sigma, bounds)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.curve_fit.html' },
    { label: 'NumPy documentation: numpy.polyfit (w = 1/σ; cov=\'unscaled\')', url: 'https://numpy.org/doc/stable/reference/generated/numpy.polyfit.html' },
    { label: 'NumPy documentation: numpy.std (ddof)', url: 'https://numpy.org/doc/stable/reference/generated/numpy.std.html' },
    { label: 'S. Baker & R. D. Cousins, Clarification of the use of chi-square and likelihood functions in fits to histograms, Nucl. Instrum. Methods 221, 437 (1984)', url: 'https://doi.org/10.1016/0167-5087(84)90016-4' },
  ],
});
