// curve_fit with honest uncertainties — weighted least squares with
// scipy.optimize.curve_fit: the model function, p0, sigma, and the default
// that quietly rescales the covariance (absolute_sigma=False forces
// χ²/dof = 1); reading popt and pcov (√ of the diagonal, correlations,
// propagating to a prediction); χ²/dof and its own scatter (√(2/ν)); a fit
// stuck at the default start. A cold-gas thruster's thrust coefficient, a
// rocket sled's drag, a tank's blowdown, the atmosphere's scale height, and
// the Hulse–Taylor pulsar's orbital decay.
//
// Every fit quoted is computed here by _fit.js (Levenberg–Marquardt and the
// normal equations, covariance (JᵀWJ)⁻¹) and was checked against curve_fit
// in the Atlas's Pyodide (SciPy 1.18); the Explore's printed lines were
// copied from running it.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { errbar, seg } from './_numkit.js';
import { lsq, linlsq } from './_fit.js';

const t = String.raw;
const r4 = (v) => +(+v).toPrecision(6);

// ── the worked example: a rocket sled coasting after burnout, radar speeds (synthetic, σ = 3 m/s) ──
const SLED_T = Array.from({ length: 11 }, (_, i) => i);                                    // s
const SLED_V = [547.6, 496.7, 445.5, 414.7, 380.4, 351.9, 329.3, 314.3, 290.1, 270.3, 262];   // m/s
const sledModel = (x, p) => p[0] / (1 + p[1] * p[0] * x);
const SLED = lsq(sledModel, SLED_T, SLED_V, 3, [547.6, 1 / (547.6 * 9)]);
const [V0, K] = SLED.p, [DV0, DK] = SLED.err, RHO_VK = SLED.cov[0][1] / (DV0 * DK);

// ── the blowdown exercise: tank pressure (MPa) every 20 s, σ = 0.15 MPa (synthetic, τ = 140 s) ──
const BD_T = Array.from({ length: 16 }, (_, i) => 20 * i);
const BD_P = [20.15, 17.35, 15.05, 13.13, 11.13, 9.64, 8.39, 7.46, 6.26, 5.71, 4.62, 4.15, 3.73, 3.18, 2.77, 2.23];
const BD = lsq((x, p) => p[0] * Math.exp(-x / p[1]), BD_T, BD_P, 0.15, [20, 100]);

// ── the checkpoint: Hulse–Taylor periastron shift (s) every 2 yr since 1975, σ = 0.4 s (synthetic, made with GR's Ṗb) ──
const PB = 27906.98, YR = 3.15576e7, PDOT_GR = -2.402e-12;
const PSR_T = Array.from({ length: 16 }, (_, i) => 2 * i);
const PSR_D = [-0.03, 0.38, -0.5, -1.81, -2.06, -4.16, -6.05, -8.94, -10.61, -13.91, -17.05, -21.34, -25.05, -29.33, -33.77, -38.83];
const PSR = linlsq([(x) => x * x, (x) => x, () => 1], PSR_T, PSR_D, 0.4);
const PDOT = (2 * PSR.p[0] * PB) / YR ** 2, DPDOT = (2 * PSR.err[0] * PB) / YR ** 2;

// ── the χ² distribution's tail, for even ν: P(χ² ≥ x) = e^{−x/2} Σ_{k<ν/2} (x/2)^k / k! ──
function chi2sf(x, nu) {
  let lt = -x / 2, s = 0;
  for (let k = 0; k < nu / 2; k++) { s += Math.exp(lt); lt += Math.log(x / 2) - Math.log(k + 1); }
  return s;
}
let LG100 = 0; for (let k = 2; k < 100; k++) LG100 += Math.log(k);          // ln Γ(100) = ln 99!
const P10 = chi2sf(16, 10), P200 = chi2sf(320, 200);

// a number as NumPy prints it in scientific notation: 1.44e-04
const npE = (x) => x.toExponential(2).replace(/e([+-])(\d)$/, 'e$10$2');
const lineDots = (xs, ys, o = {}) => xs.map((x, i) => ({ x, y: ys[i], r: 3.5, color: o.color || 'accent' }));

export default lesson({
  id: 'prog.P14.1',
  title: 'curve_fit with honest uncertainties',
  minutes: 14, difficulty: 3,
  intro: t`\`scipy.optimize.curve_fit(f, x, y, p0, sigma)\` adjusts the parameters $\mathbf p$ of a model $f(x;\mathbf p)$ until the weighted sum of squared misfits is as small as it can be:

$$\chi^2(\mathbf p) = \sum_{i=1}^{N}\left(\frac{y_i - f(x_i;\mathbf p)}{\sigma_i}\right)^2$$

It returns the best parameters, \`popt\`, and their **covariance matrix**, \`pcov\`: the uncertainty of parameter $j$ is $\sqrt{C_{jj}}$, \`np.sqrt(np.diag(pcov))\`. Those error bars mean something only if **three things hold**: the $\sigma_i$ are real one-standard-deviation uncertainties; you pass \`absolute_sigma=True\` — the default, \`False\`, rescales \`pcov\` as though $\chi^2/(N - m)$ were exactly 1, which throws away the size of your $\sigma$ and estimates it from the scatter instead; and the model actually describes the data, which you check with $\chi^2/(N-m) \approx 1$ and a plot of the residuals.`,
  symbols: [
    { tex: t`\chi^2`, text: 'chi-squared: the sum of squared misfits, each measured in units of its own uncertainty (dimensionless)' },
    { tex: 'x_i,\\ y_i', text: 'the $i$-th measurement: the controlled quantity and the measured one' },
    { tex: t`\sigma_i`, text: 'the one-standard-deviation uncertainty of $y_i$, in the units of $y$ (`sigma=` in curve_fit)' },
    { tex: t`f(x_i;\mathbf p)`, text: 'the model’s prediction at $x_i$ for parameters $\\mathbf p$ (your Python function, `f(x, *p)`)' },
    { tex: 'N,\\ m', text: 'the number of data points and of fitted parameters; $\\nu = N - m$ is the number of degrees of freedom' },
    { tex: t`C_{jk}`, text: 'the covariance matrix `pcov`: $\\sqrt{C_{jj}}$ is the uncertainty of parameter $j$, and $C_{jk}/\\sqrt{C_{jj}C_{kk}}$ the correlation of $j$ and $k$' },
  ],
  why: 'A measurement without an honest uncertainty cannot be compared with anything — not with a theory, not with another lab, not with the requirement a flight article must meet.',
  visual: {
    type: 'code-runner',
    title: 'A thruster’s thrust coefficient, honestly and not',
    lead: t`Press **Run**. A nitrogen cold-gas thruster fires in a vacuum chamber on a load cell whose noise is known: 4 mN (one standard deviation). The fit gives the thrust coefficient $C_F$ in $F = C_F A_t p + F_0$, where $A_t$ is the throat area, $p$ the chamber pressure and $F_0$ the load cell's zero offset. The lower panel shows each residual in units of $\sigma$.`,
    tasks: [
      t`Claim a better load cell than you have: set sigma = 0.002. The ± on $C_F$ halves (0.027 → 0.013) — a precision the data do not have — and the reduced χ² jumps from 0.91 to 3.64. χ²/dof is the alarm.`,
      'Keep sigma = 0.002 and set honest = False. The ± goes back to 0.026: curve_fit has rescaled pcov by χ²/dof, estimating the noise from the scatter. Useful when you do not know σ; it hides it when your σ is wrong.',
      t`Change the seed in default_rng(5) a few times. $C_F$ moves by about its ±, and the reduced χ² scatters by about ±0.45 around 1: with 10 degrees of freedom it is itself noisy.`,
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

# A nitrogen cold-gas thruster on a load cell in a vacuum chamber (synthetic data):
# thrust F = C_F A_t p + F0, where F0 is the load cell's zero offset.
rng = np.random.default_rng(5)
A_t = np.pi * 0.5e-3**2 / 4             # throat area, m² (a 0.5 mm throat)
p = np.linspace(1e5, 8e5, 12)           # chamber pressure, Pa
noise = 0.004                           # the load cell's real noise, N (1σ)
F = 1.62 * A_t * p - 0.006 + rng.normal(0, noise, p.size)

sigma = 0.004                           # the σ you TELL curve_fit, N
honest = True                           # absolute_sigma: is that σ a real 1σ?

def model(p, k, F0):
    return k * p + F0

popt, pcov = curve_fit(model, p, F, sigma=np.full(p.size, sigma), absolute_sigma=honest)
dk, dF0 = np.sqrt(np.diag(pcov))
resid = (F - model(p, *popt)) / sigma
chi2, dof = np.sum(resid**2), p.size - len(popt)
print(f"C_F = {popt[0] / A_t:.3f} ± {dk / A_t:.3f}")
print(f"zero offset F0 = {1e3 * popt[1]:.1f} ± {1e3 * dF0:.1f} mN")
print(f"chi² = {chi2:.1f} for {dof} degrees of freedom: reduced chi² = {chi2 / dof:.2f}")

fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, height_ratios=[3, 1])
ax1.errorbar(p / 1e5, F, yerr=sigma, fmt="o", ms=4, capsize=3, label="data, ±σ")
ax1.plot(p / 1e5, model(p, *popt), label="fit")
ax1.set_ylabel("thrust (N)")
ax1.legend()
ax2.errorbar(p / 1e5, resid, yerr=1, fmt="o", ms=4, capsize=3)
ax2.axhline(0, color="0.5", lw=1)
ax2.set_xlabel("chamber pressure (bar)")
ax2.set_ylabel("residual / σ")
plt.show()`,
    },
    caption: t`Synthetic data from a straight line with Gaussian noise of known size, so here the model is exactly right — real thrusters add heating, valve dynamics and a thrust coefficient that drifts with pressure. The true $C_F$ is 1.62.`,
  },
  example: {
    prompt: t`A rocket sled coasts after burnout, slowed by air drag alone: $\dot v = -kv^2$, so $v(t) = v_0/(1 + kv_0t)$, where $k = \rho C_DA/(2m)$. A radar reads its speed every second with $\sigma = 3$ m/s:

\`\`\`python
t = np.arange(11.0)                                   # s
v = np.array([${SLED_V.join(', ')}])   # m/s
\`\`\`

Find $v_0$ and $k$ with honest uncertainties, and check the fit.`,
    visual: {
      type: 'graph',
      params: { x: [-0.5, 10.5], y: [240, 570], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'v (m/s)',
        curves: [{ fn: `${r4(V0)}/(1 + ${r4(K * V0)}*x)`, color: 'gold', width: 2, domain: [0, 10] }, ...SLED_T.flatMap((x, i) => errbar(x, SLED_V[i], 3, 0.12, { color: 'accent' }))],
        points: lineDots(SLED_T, SLED_V),
        legend: [{ label: 'radar, ±3 m/s', color: 'accent', point: true }, { label: 'best fit', color: 'gold' }], legendAt: 'tr' },
      caption: 'Synthetic radar data from the drag law with Gaussian noise. The error bars (±3 m/s) are about the size of the dots. Real sleds also feel rail friction, which this model leaves out.',
    },
    steps: [
      { label: 'Write the model', text: t`The function takes the independent variable first, then one argument per parameter:

\`\`\`python
def sled(t, v0, k):
    return v0 / (1 + k * v0 * t)
\`\`\`` },
      { label: 'Start near the answer', text: t`\`curve_fit\` starts every parameter at 1 unless told otherwise — and $k = 1\ \text{m}^{-1}$ is thousands of times too big. Estimate from the data: $v_0 \approx 548$ m/s (the first reading), and the speed halves when $kv_0t = 1$; it reaches about 274 m/s near $t = 9$ s, so $k \approx 1/(548 \times 9) \approx 2\times10^{-4}\ \text{m}^{-1}$. (Without \`p0\` this very fit returns $k = -58\,451\ \text{m}^{-1}$ with an uncertainty of $4\times10^{9}$: nonsense, and no error.)` },
      { label: 'Fit with the real sigma', text: t`\`\`\`python
popt, pcov = curve_fit(sled, t, v, p0=[548, 1 / (548 * 9)],
                       sigma=np.full(11, 3.0), absolute_sigma=True)
dv0, dk = np.sqrt(np.diag(pcov))
chi2 = np.sum(((v - sled(t, *popt)) / 3.0)**2)
\`\`\`

\`absolute_sigma=True\` because the 3 m/s is the radar's known noise, not a guess.` },
      { label: 'Read the result', text: t`$v_0 = ${V0.toFixed(1)} \pm ${DV0.toFixed(1)}$ m/s and $k = (${(K * 1e4).toFixed(3)} \pm ${(DK * 1e4).toFixed(3)})\times10^{-4}\ \text{m}^{-1}$, with $\chi^2 = ${SLED.chi2.toFixed(1)}$ for $\nu = 11 - 2 = 9$ degrees of freedom: $\chi^2/\nu = ${SLED.red.toFixed(2)}$. The correlation $C_{01}/\sqrt{C_{00}C_{11}} = ${RHO_VK.toFixed(2)}$: a higher start speed needs a larger $k$ to pass through the same later points, so the two errors are not independent — anything computed from both must use the whole \`pcov\`.` },
      { label: 'Sense check', text: t`$\chi^2/\nu \approx 1$, and the residuals in units of $\sigma$, $(v_i - v(t_i))/\sigma$, are $${SLED.resid.map((x) => x.toFixed(1)).join(',\\ ')}$ — changing sign often, with no trend: the model and the 3 m/s are consistent with the data. Physically, $C_DA/m = 2k/\rho = ${((2 * K) / 1.2 * 1e4).toFixed(2)}\times10^{-4}\ \text{m}^2/\text{kg}$ for $\rho = 1.2\ \text{kg/m}^3$: a 2-tonne sled with $C_DA \approx ${((2 * K) / 1.2 * 2000).toFixed(2)}\ \text{m}^2$ — plausible for a sled with a blunt payload.` },
    ],
    answer: t`$v_0 = ${V0.toFixed(1)} \pm ${DV0.toFixed(1)}$ m/s, $k = (${(K * 1e4).toFixed(2)} \pm ${(DK * 1e4).toFixed(2)})\times10^{-4}\ \text{m}^{-1}$, $\chi^2/\nu = ${SLED.red.toFixed(2)}$ for $\nu = 9$.`,
  },
  practice: [
    num({
      id: 'sigma-from-pcov', difficulty: 1,
      gen(r) {
        const sa = r.int(8, 15) / 100, sn = r.int(4, 20) / 1000, a = r.float(4.0, 6.5, 0.01), n = r.float(0.30, 0.45, 0.001);
        const c00 = npE(sa * sa), c11 = npE(sn * sn), c01 = npE(-0.92 * sa * sn);
        const key = Math.sqrt(+c11);
        return {
          prompt: t`A solid propellant's burn rate follows $r = a\,p^{n}$ ($r$ in mm/s, $p$ in MPa). A fit to strand-burner data prints:

\`\`\`python
popt, pcov = curve_fit(burn_rate, p, r, p0=[5, 0.4], sigma=dr, absolute_sigma=True)
print(popt)    # [${a.toFixed(2)}  ${n.toFixed(3)}]
print(pcov)    # [[ ${c00}  ${c01}]
               #  [${c01}   ${c11}]]
\`\`\`

What is the uncertainty of the pressure exponent $n$?`,
          answer: key, tol: { rel: 0.01 },
          errors: [{ value: +c11, feedback: 'That is the variance, the square of the uncertainty. Take its square root.' }, { value: Math.sqrt(+c00), feedback: t`That is $\sqrt{C_{00}}$, the uncertainty of $a$ — the first parameter. $n$ is the second.` }],
          hints: ['The parameters are in the order of the function’s arguments after x: a, then n.', t`The uncertainty of parameter $j$ is $\sqrt{C_{jj}}$, the square root of a diagonal element.`],
          teach: 'pcov holds variances on its diagonal; the uncertainty of each parameter is the square root of its diagonal entry.',
          explain: t`$\sigma_n = \sqrt{C_{11}} = \sqrt{${tex(+c11)}} = ${key.toFixed(4)}$, so $n = ${n.toFixed(3)} \pm ${key.toFixed(3)}$. The off-diagonal entries are negative: a larger $a$ goes with a smaller $n$ through the same data — the correlation is $${(+c01 / Math.sqrt(+c00 * +c11)).toFixed(2)}$.`,
        };
      },
    }),
    mcq({
      id: 'which-call', difficulty: 2,
      prompt: t`A load cell's datasheet gives its noise as 2 mN (one standard deviation), and 200 readings at zero load confirm it. Which call gives honest parameter uncertainties?

\`\`\`python
s = np.full(len(F), 0.002)       # N
\`\`\``,
      choices: [
        '`curve_fit(model, p, F, sigma=s, absolute_sigma=True)`',
        '`curve_fit(model, p, F)`',
        '`curve_fit(model, p, F, sigma=s)`',
        '`curve_fit(model, p, F, sigma=1/s**2, absolute_sigma=True)`',
      ],
      answer: 0,
      why: {
        1: 'With no sigma every point counts equally and the uncertainties are estimated from the scatter alone; your knowledge of the instrument is thrown away, and so is the χ² check.',
        2: 'The default absolute_sigma=False rescales pcov so that χ²/dof = 1: the size of s no longer matters, only the relative weights. Your verified 2 mN is ignored.',
        3: '`sigma` takes standard deviations, not weights; curve_fit forms the weights 1/σ² itself.',
      },
      hints: ['What does the default `absolute_sigma=False` do with the size of your σ?', '`sigma` is a standard deviation in the units of y.'],
      teach: 'When σ is known, pass it as sigma and set absolute_sigma=True; the default treats σ as relative weights only.',
      explain: t`With \`absolute_sigma=True\`, \`pcov\` is computed from the 2 mN as given, and $\chi^2/\nu$ becomes a real test of the model. Use the default only when you do not know the noise — and then say that the uncertainties were estimated from the scatter.`,
    }),
    num({
      id: 'chi2-red', difficulty: 2,
      gen(r) {
        const N = r.pick([6, 7, 8]), xs = Array.from({ length: N }, (_, i) => i + 1);
        // residuals in units of σ, orthogonal to 1 and x as a straight-line fit makes them, then rounded
        let z = xs.map(() => r.float(-1.6, 1.6, 0.1));
        const proj = (v, b) => { const k = v.reduce((s, x, i) => s + x * b[i], 0) / b.reduce((s, x) => s + x * x, 0); return v.map((x, i) => x - k * b[i]); };
        const xc = xs.map((x) => x - (N + 1) / 2);
        z = proj(proj(z, xs.map(() => 1)), xc).map((v) => Math.round(v * 10) / 10);
        const chi2 = z.reduce((s, v) => s + v * v, 0), key = chi2 / (N - 2);
        const a = r.float(1.0, 2.0, 0.1), b = r.float(0.4, 0.8, 0.05), s = 0.15;
        const ys = xs.map((x, i) => a + b * x + s * z[i]);
        return {
          prompt: t`A straight-line fit to ${N} points, each with $\sigma = 0.15$, leaves these residuals in units of $\sigma$:

\`\`\`python
print(np.round((y - line(x, *popt)) / sigma, 1))
# [${z.map((v) => v.toFixed(1)).join(' ')}]
\`\`\`

What is the reduced chi-squared, $\chi^2/\nu$?`,
          answer: key, tol: { rel: 0.01 },
          errors: [{ value: chi2, feedback: t`That is $\chi^2$ itself. Divide by the degrees of freedom, $\nu = N - m$.` }, { value: chi2 / N, feedback: t`Divide by $\nu = N - m = ${N} - 2$, not by $N$: each fitted parameter uses up one degree of freedom.` }],
          hints: [t`Square each residual and add them: that is $\chi^2$.`, t`$\nu = N - m$, with $m = 2$ for a line.`],
          teach: 'χ²/ν is the sum of squared residuals (in units of σ) divided by the number of points minus the number of parameters.',
          explain: t`$\chi^2 = ${z.map((v) => `${v < 0 ? `(${v.toFixed(1)})` : v.toFixed(1)}^2`).join(' + ')} = ${chi2.toFixed(2)}$, and $\chi^2/\nu = ${chi2.toFixed(2)}/${N - 2} = ${key.toFixed(2)}$. With so few degrees of freedom anything from about ${Math.max(0, 1 - 2 * Math.sqrt(2 / (N - 2))).toFixed(1)} to ${(1 + 2 * Math.sqrt(2 / (N - 2))).toFixed(1)} is unremarkable: $\chi^2/\nu$ scatters by $\sqrt{2/\nu}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, N + 1], y: [a + b * 0.3 - 0.6, a + b * (N + 0.7) + 0.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
              curves: [{ fn: `${a} + ${b}*x`, color: 'gold', width: 2, domain: [0.5, N + 0.5] }, ...xs.flatMap((x, i) => errbar(x, ys[i], s, 0.08, { color: 'accent' }))],
              points: lineDots(xs, ys) },
            caption: 'The data with ±σ error bars and the best straight line.',
          },
        };
      },
    }),
    num({
      id: 'rescale', difficulty: 3,
      gen(r) {
        const [what, unit, val] = r.pick([['the discharge coefficient of an orifice', '', 0.61], ['a spring constant', 'N/m', 482], ['a satellite battery’s capacity fade per cycle', '%', 0.0081]]);
        const err = +(val * r.float(0.01, 0.04, 0.001)).toPrecision(2), red = r.pick([0.36, 0.49, 2.25, 4.0, 6.25, 0.25]);
        const key = err * Math.sqrt(red);
        const u = unit ? ` ${unit}` : '';
        return {
          prompt: t`A fit of ${what} with \`absolute_sigma=True\` reports an uncertainty of ${err}${u} and $\chi^2/\nu = ${red}$. A colleague reruns it with the default, \`absolute_sigma=False\`. What uncertainty will that print?

\`\`\`python
curve_fit(f, x, y, sigma=s, absolute_sigma=True)    # ± ${err}${u},  chi²/dof = ${red}
curve_fit(f, x, y, sigma=s)                          # ± ?
\`\`\``,
          answer: key, ...(unit ? { units: unit } : {}), tol: { rel: 0.01 },
          errors: [{ value: err * red, feedback: t`pcov is multiplied by $\chi^2/\nu$; the uncertainty, its square root, by $\sqrt{\chi^2/\nu}$.` }, { value: err / Math.sqrt(red), feedback: t`The other way round: the default *multiplies* pcov by $\chi^2/\nu$, so a large $\chi^2/\nu$ inflates the error.` }],
          hints: [t`The default rescales pcov so that $\chi^2/\nu$ would be exactly 1.`, t`SciPy: pcov(False) = pcov(True) × $\chi^2/\nu$. Uncertainties are square roots of pcov.`],
          teach: 'absolute_sigma=False multiplies pcov by χ²/ν, so every uncertainty scales by √(χ²/ν).',
          explain: t`$${err}\times\sqrt{${red}} = ${+key.toPrecision(3)}$${u}. ${red > 1 ? t`Here $\chi^2/\nu > 1$: the scatter is larger than the stated $\sigma$, and the default quietly inflates the error to match. Better to find out *why* — underestimated noise, or a model that misses something — than to let the default paper over it.` : t`Here $\chi^2/\nu < 1$: the scatter is smaller than the stated $\sigma$, and the default shrinks the error — trusting a dozen points' scatter over the instrument's known noise.`}`,
        };
      },
    }),
    code({
      id: 'blowdown', difficulty: 2,
      prompt: t`A cold-gas thruster's nitrogen tank blows down during a long firing. Isothermally, $p(t) = p_0\,e^{-t/\tau}$. The transducer's noise is $\sigma = 0.15$ MPa. Fit the data with \`curve_fit\` (give it \`p0\`, \`sigma\` and \`absolute_sigma=True\`), and set \`tau\` and \`dtau\` (s) and \`chi2_red\`.`,
      starter: t`import numpy as np
from scipy.optimize import curve_fit

t = np.arange(0, 301, 20.0)                          # s
p = np.array([${BD_P.join(', ')}])          # MPa
sigma = 0.15                                         # MPa

def blowdown(t, p0, tau):
    return p0 * np.exp(-t / tau)

tau = None
dtau = None
chi2_red = None
`,
      answer: t`import numpy as np
from scipy.optimize import curve_fit

t = np.arange(0, 301, 20.0)                          # s
p = np.array([${BD_P.join(', ')}])          # MPa
sigma = 0.15                                         # MPa

def blowdown(t, p0, tau):
    return p0 * np.exp(-t / tau)

popt, pcov = curve_fit(blowdown, t, p, p0=[20, 100], sigma=np.full(t.size, sigma), absolute_sigma=True)
tau = popt[1]
dtau = np.sqrt(pcov[1, 1])
chi2_red = np.sum(((p - blowdown(t, *popt)) / sigma)**2) / (t.size - 2)
print(f"tau = {tau:.1f} ± {dtau:.1f} s, chi²/dof = {chi2_red:.2f}")`,
      tests: [
        { name: t`$\tau \approx ${BD.p[1].toFixed(1)}$ s`, code: `abs(tau - ${BD.p[1]}) < 0.01` },
        { name: t`its uncertainty uses the stated $\sigma$ (absolute_sigma=True): ${BD.err[1].toFixed(2)} s`, code: `abs(dtau - ${BD.err[1]}) < 0.01 * ${BD.err[1]}` },
        { name: t`$\chi^2/\nu$ uses $\nu = N - 2$`, code: `abs(chi2_red - ${BD.red}) < 0.005` },
      ],
      hints: [t`\`popt, pcov = curve_fit(blowdown, t, p, p0=[20, 100], sigma=np.full(t.size, sigma), absolute_sigma=True)\``, t`\`tau = popt[1]\`, \`dtau = np.sqrt(pcov[1, 1])\`.`, t`\`chi2_red\` is the sum of the squared residuals divided by $\sigma^2$, over $16 - 2$.`],
      teach: 'An honest fit is three lines: the call with p0, sigma and absolute_sigma=True; the square roots of pcov’s diagonal; and χ²/ν as the check.',
      explain: t`$\tau = ${BD.p[1].toFixed(1)} \pm ${BD.err[1].toFixed(1)}$ s and $\chi^2/\nu = ${BD.red.toFixed(2)}$ for 14 degrees of freedom — a little low, but within the $\pm${Math.sqrt(2 / 14).toFixed(2)}$ that chance allows. The default \`absolute_sigma=False\` would have reported $\pm${(BD.err[1] * Math.sqrt(BD.red)).toFixed(2)}$ s, shrinking the error to match this run's lucky scatter.`,
    }),
    mcq({
      id: 'p0-scale', difficulty: 3,
      prompt: t`Air density measured every 3 km up to 30 km, fitted by $\rho = \rho_0\,e^{-h/H}$ with $h$ in metres:

\`\`\`python
popt, pcov = curve_fit(atm, h, rho)
print(popt)     # [1.2335  1.    ]
print(pcov)     # [[inf inf]
                #  [inf inf]]
# OptimizeWarning: Covariance of the parameters could not be estimated
\`\`\`

Why did it fail?`,
      visual: {
        type: 'graph',
        params: { x: [-1, 31], y: [0, 1.35], aspect: 'wide', axesAt: 'edge', xlabel: 'altitude (km)', ylabel: 'ρ (kg/m³)',
          curves: [{ fn: '1.225*exp(-x/8.5)', color: 'ink3', dash: true, domain: [0, 30] }, seg(0.02, 0, 30, 0, { color: 'warn', width: 2.4 })],
          points: [...Array.from({ length: 11 }, (_, i) => ({ x: 3 * i, y: +(1.225 * Math.exp(-(3 * i) / 8.5)).toFixed(4), r: 3.5, color: 'accent' })), { x: 0, y: 1.2335, r: 4, color: 'warn', hollow: true }],
          legend: [{ label: 'data', color: 'accent', point: true }, { label: 'the returned "fit"', color: 'warn' }], legendAt: 'tr' },
        caption: 'The returned curve is 1.2335 at h = 0 and indistinguishable from zero everywhere else. Dashed: an exponential atmosphere with a scale height of 8.5 km.',
      },
      choices: [
        'With no p0, H starts at 1 m: e^(−h/H) is zero at every altitude but the first, so changing H a little changes nothing and the fit cannot move. Start near the answer: p0=[1.2, 8000]',
        'The atmosphere is not exponential, so no fit can converge',
        'inf in pcov means the parameters are known with infinite precision',
        'Eleven points are too few to determine two parameters',
      ],
      answer: 0,
      why: {
        1: 'Below 30 km it is exponential to within a few per cent; with a sensible start the same call finds H ≈ 8.5 km.',
        2: 'pcov holds variances: inf means infinitely *un*certain — curve_fit could not estimate them at all.',
        3: 'Eleven points for two parameters leave nine degrees of freedom; the problem is where the search began.',
      },
      hints: ['What value does curve_fit start each parameter at when you give no p0?', t`What is $e^{-3000/1}$?`, 'If the model does not change when H changes, which way should the fit move?'],
      teach: 'Without p0 every parameter starts at 1; when that is wildly off scale the model can be flat in a parameter and the fit stalls — always start from estimates read off the data.',
      explain: t`Least squares improves the parameters by following how the model changes as they change. At $H = 1$ m, $e^{-3000}$ underflows to 0 and so does its derivative: the fit has no direction to go, returns the start, and cannot estimate a covariance. With \`p0=[1.2, 8000]\` it converges to $H \approx 8.5$ km. (Fitting in kilometres would also help: then the start $H = 1$ km is within a factor of ten.)`,
    }),
    num({
      id: 'predict', difficulty: 3,
      gen(r) {
        const b = r.float(0.030, 0.034, 0.0001), a = r.float(-0.009, -0.004, 0.0001);         // N/bar, N
        const sb = r.float(0.0003, 0.0006, 0.00001), sa = r.float(0.0018, 0.0030, 0.0001), rho = r.pick([-0.86, -0.88, -0.9]);
        const cab = rho * sa * sb, x0 = r.pick([10, 11, 12]);
        const key = Math.sqrt(sa * sa + x0 * x0 * sb * sb + 2 * x0 * cab) * 1e3;           // mN
        const noCov = Math.sqrt(sa * sa + x0 * x0 * sb * sb) * 1e3;
        const band = (sgn) => `${a} + ${b}*x ${sgn} 10*sqrt(${(sa * sa).toExponential(4)} + x^2*${(sb * sb).toExponential(4)} + 2*x*${cab.toExponential(4)})`;
        return {
          prompt: t`A thruster's thrust was fitted as $F = a + b\,p$ over 1–8 bar ($a$ in N, $b$ in N/bar):

\`\`\`python
print(popt)     # [${a.toFixed(4)}  ${b.toFixed(4)}]
print(np.sqrt(np.diag(pcov)))      # [${sa.toFixed(4)}  ${sb.toFixed(5)}]
print(pcov[0, 1] / np.sqrt(pcov[0, 0] * pcov[1, 1]))     # ${rho}
\`\`\`

What is the uncertainty of the predicted thrust at $p = ${x0}$ bar, in mN?`,
          answer: key, units: 'mN', tol: { rel: 0.02 },
          errors: [{ value: noCov, feedback: t`You left out the covariance term $2p\,C_{ab}$. With a correlation of ${rho}, it cancels most of the other two.` }, { value: x0 * sb * 1e3, feedback: t`That is only the slope's contribution, $p\,\sigma_b$; the intercept's uncertainty and the covariance count too.` }],
          hints: [t`$F = a + bp$, so $\sigma_F^2 = \sigma_a^2 + p^2\sigma_b^2 + 2p\,C_{ab}$.`, t`$C_{ab} = \rho\,\sigma_a\sigma_b$ with $\rho = ${rho}$.`, t`Work in N, then multiply by 1000.`],
          teach: t`Propagate through the whole covariance matrix, $\sigma_F^2 = \sigma_a^2 + p^2\sigma_b^2 + 2p\,C_{ab}$: correlated parameters can make the cross term large and negative.`,
          explain: t`$C_{ab} = ${rho}\times${sa.toFixed(4)}\times${sb.toFixed(5)} = ${tex(cab)}\ \text{N}^2/\text{bar}$, and
$$\sigma_F^2 = ${tex(sa * sa)} + ${x0}^2(${tex(sb * sb)}) + 2(${x0})(${tex(cab)}) = ${tex((key / 1e3) ** 2)}\ \text{N}^2,$$
so $\sigma_F = ${key.toFixed(2)}$ mN. Ignoring the correlation gives ${noCov.toFixed(1)} mN. The band is narrowest near the middle of the data and widens outside it: an extrapolation is less certain than an interpolation.`,
          visual: {
            type: 'graph',
            params: { x: [0, 14.5], y: [0, 0.48], aspect: 'wide', axesAt: 'edge', xlabel: 'chamber pressure (bar)', ylabel: 'thrust (N)',
              curves: [{ fn: `${a} + ${b}*x`, color: 'gold', width: 2, domain: [0, 13] }, { fn: band('+'), color: 'accent', dash: true, domain: [1, 8] }, { fn: band('-'), color: 'accent', dash: true, domain: [1, 8] }],
              vlines: [{ x: x0, label: 'σ = ?', color: 'warn' }] },
            caption: 'The fitted line and its ±1σ band over the measured range (dashed; drawn ten times wider than it is, to be visible). The band at the prediction is the question.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-pulsar', difficulty: 3, transfer: true,
      prompt: t`The Hulse–Taylor binary pulsar loses orbital energy to gravitational waves, so its orbital period $P_b = 27\,906.98$ s shrinks at a rate $\dot P_b$ and each periastron arrives a little earlier than a constant period predicts. The cumulative shift after time $t$ is $\Delta T = \tfrac12(\dot P_b/P_b)\,t^2$. The data below (synthetic, $\sigma = 0.4$ s) are every two years since 1975. Fit $\Delta T = a t^2 + bt + c$ ($b$ and $c$ absorb small errors in the assumed period and epoch), and set \`Pdot\` and \`dPdot\` (dimensionless, s/s) with honest uncertainties.`,
      visual: {
        type: 'graph',
        params: { x: [-1, 31], y: [-42, 4], aspect: 'wide', axesAt: 'edge', xlabel: 'years since 1975', ylabel: 'shift of periastron (s)',
          curves: PSR_T.flatMap((x, i) => errbar(x, PSR_D[i], 0.4, 0.25, { color: 'accent' })),
          points: lineDots(PSR_T, PSR_D),
          hlines: [{ y: 0, color: 'ink3', label: 'constant period' }] },
        caption: 'Synthetic timing data shaped like Weisberg and Taylor’s famous plot: the real points are far more precise. The parabola is the signature of a steadily shrinking period.',
      },
      starter: t`import numpy as np
from scipy.optimize import curve_fit

years = np.arange(0, 31, 2.0)                        # years since 1975
dT = np.array([${PSR_D.join(', ')}])   # s
sigma = 0.4                                          # s
Pb = 27906.98                                        # s
yr = 3.15576e7                                       # s

Pdot = None
dPdot = None
`,
      answer: t`import numpy as np
from scipy.optimize import curve_fit

years = np.arange(0, 31, 2.0)                        # years since 1975
dT = np.array([${PSR_D.join(', ')}])   # s
sigma = 0.4                                          # s
Pb = 27906.98                                        # s
yr = 3.15576e7                                       # s

def shift(t, a, b, c):
    return a * t**2 + b * t + c

popt, pcov = curve_fit(shift, years, dT, sigma=np.full(years.size, sigma), absolute_sigma=True)
a, da = popt[0], np.sqrt(pcov[0, 0])                 # s per year²
Pdot = 2 * a * Pb / yr**2
dPdot = 2 * da * Pb / yr**2
print(f"Pdot = ({Pdot * 1e12:.3f} ± {dPdot * 1e12:.3f}) × 10⁻¹²")`,
      tests: [
        { name: t`$\dot P_b \approx ${(PDOT * 1e12).toFixed(3)}\times10^{-12}$`, code: `abs(Pdot - (${PDOT})) < 2e-16` },
        { name: t`its uncertainty uses the stated $\sigma$: $${(DPDOT * 1e12).toFixed(3)}\times10^{-12}$`, code: `abs(dPdot - ${DPDOT}) < 0.01 * ${DPDOT}` },
        { name: t`the result agrees with general relativity's $${PDOT_GR * 1e12}\times10^{-12}$ within $2\sigma$`, code: `abs(Pdot - (${PDOT_GR})) < 2 * dPdot` },
      ],
      hints: [
        t`Write \`def shift(t, a, b, c): return a * t**2 + b * t + c\` and fit it with \`sigma\` and \`absolute_sigma=True\`. A polynomial is linear in its parameters, so no \`p0\` is needed.`,
        t`$a = \tfrac12\dot P_b/P_b$ with $t$ in seconds; with $t$ in years, $a$ is in s/yr$^2$, so $\dot P_b = 2aP_b/\text{yr}^2$.`,
        t`The uncertainty scales the same way: \`dPdot = 2 * np.sqrt(pcov[0, 0]) * Pb / yr**2\`.`,
      ],
      teach: 'Convert a fitted coefficient to the physical quantity — and its uncertainty with it — by the same factor.',
      explain: t`$\dot P_b = (${(PDOT * 1e12).toFixed(2)} \pm ${(DPDOT * 1e12).toFixed(2)})\times10^{-12}$, $\chi^2/\nu = ${PSR.red.toFixed(2)}$ for 13 degrees of freedom: consistent with general relativity's $${PDOT_GR * 1e12}\times10^{-12}$ (these data were made from it). The real measurement, after correcting for the pulsar's acceleration in the Galaxy, agrees with general relativity to a few parts in a thousand — the first evidence that gravitational waves exist, and a Nobel Prize in 1993.`,
    }),
    mcq({
      id: 'cp-small-chi2', difficulty: 2,
      prompt: t`A fit of 40 points with \`absolute_sigma=True\` gives $\chi^2/\nu = 0.08$. What does that most likely mean?`,
      visual: {
        type: 'graph',
        params: { x: [0, 11], y: [0, 12], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
          curves: [{ fn: '0.5 + x', color: 'gold', width: 2, domain: [0.5, 10.5] }, ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((x, i) => errbar(x, 0.5 + x + [0.1, -0.2, 0.15, -0.05, 0.2, -0.15, 0.05, -0.1, 0.2, -0.15][i], 1.2, 0.12, { color: 'accent' }))],
          points: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x, i) => ({ x, y: 0.5 + x + [0.1, -0.2, 0.15, -0.05, 0.2, -0.15, 0.05, -0.1, 0.2, -0.15][i], r: 3.5, color: 'accent' })) },
        caption: 'A sketch of such a fit (10 of the points): the error bars dwarf the scatter of the points about the line.',
      },
      choices: [
        'The σ given are several times larger than the real scatter — perhaps a datasheet’s maximum error used as one standard deviation — so the quoted uncertainties are too large',
        'An excellent fit: the smaller χ² the better',
        'The model needs more parameters',
        'curve_fit did not converge',
      ],
      answer: 0,
      why: {
        1: 'For a right model with right σ, χ²/ν is near 1 (here 1 ± 0.23). Far below 1 means the points sit much closer to the line than their error bars claim.',
        2: 'More parameters make χ² smaller still. A missing parameter shows up as χ²/ν well *above* 1 with a pattern in the residuals.',
        3: 'A failed fit leaves large misfits, so χ² comes out large, not tiny.',
      },
      hints: [t`If the model and the $\sigma_i$ are right, each residual is about $\pm1\sigma$; what is $\chi^2/\nu$ then?`, 'Compare the error bars with the scatter in the picture.'],
      teach: 'χ²/ν far below 1 means the stated σ are too large (or the points are not independent); the reported uncertainties are then too big.',
      explain: t`$\chi^2/\nu = 0.08$ means the typical residual is $\sqrt{0.08} \approx 0.3\sigma$: the real noise is about a third of the σ used. The uncertainties from \`absolute_sigma=True\` are then about three times too large. Find out where the σ came from — a maximum-error specification, or readings that are not independent (averaged, or smoothed by the instrument) — rather than quietly switching to the default.`,
    }),
    mcq({
      id: 'cp-chi2-noise', difficulty: 3,
      prompt: t`Two fits both give $\chi^2/\nu = 1.6$: one with $\nu = 10$ degrees of freedom, the other with $\nu = 200$. Which is evidence that something is wrong with the model or the σ?

\`\`\`python
from scipy.stats import chi2
chi2.sf(1.6 * 10, 10), chi2.sf(1.6 * 200, 200)    # P(χ² this large by chance)
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [0, 4.2], aspect: 'wide', axesAt: 'edge', xlabel: 'χ²/ν', ylabel: 'probability density',
          curves: [
            { fn: `10*exp(4*ln(10*x) - 5*x - 5*ln(2) - ln(24))`, color: 'accent', domain: [0.001, 3], label: 'ν = 10', labelAt: 0.45, labelDx: -50, labelDy: -6 },
            { fn: `200*exp(99*ln(200*x) - 100*x - 100*ln(2) - ${LG100.toFixed(6)})`, color: 'gold', domain: [0.3, 3], label: 'ν = 200', labelAt: 1.12, labelDx: 8 },
          ],
          vlines: [{ x: 1.6, label: '1.6', color: 'warn' }] },
        caption: 'How χ²/ν is distributed when the model and the σ are both right: the smaller ν is, the more the ratio scatters about 1.',
      },
      choices: [
        t`The fit with $\nu = 200$: with that many degrees of freedom, chance almost never moves $\chi^2/\nu$ that far from 1`,
        'The fit with ν = 10: fewer points make the test stricter',
        'Both equally: 1.6 is 60% too high either way',
        'Neither: χ²/ν below 2 is always acceptable',
      ],
      answer: 0,
      why: {
        1: t`The other way round: $\chi^2/\nu$ scatters by $\sqrt{2/\nu}$, which is $\pm0.45$ for 10 degrees of freedom — 1.6 is only about $1.3$ of those.`,
        2: 'The same ratio means very different things: with many degrees of freedom the ratio is pinned close to 1, so a small excess is significant.',
        3: t`No fixed cut works. With $\nu = 200$, $\chi^2/\nu$ has a spread of only $\pm0.1$; 1.6 is six of those above 1.`,
      },
      hints: [t`How much does $\chi^2/\nu$ scatter by chance? About $\sqrt{2/\nu}$.`, 'Look at the two curves at 1.6.'],
      teach: 'Judge χ²/ν by its p-value (chi2.sf(χ², ν)), not by a fixed number: its chance scatter is about √(2/ν).',
      explain: t`\`chi2.sf\` gives $${P10.toFixed(3)}$ for $\nu = 10$ — one fit in ten does that by luck — and $${tex(P200, 2)}$ for $\nu = 200$. The large fit really does have a problem: noise underestimated by about $\sqrt{1.6} \approx 1.26$, or a systematic misfit worth finding in its residuals.`,
    }),
  ],
  sources: [
    { label: 'SciPy reference: scipy.optimize.curve_fit (sigma, absolute_sigma)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.curve_fit.html' },
    { label: 'Hughes & Hase, Measurements and their Uncertainties (OUP 2010), ch. 6–8', url: 'https://global.oup.com/academic/product/measurements-and-their-uncertainties-9780199566334' },
    { label: 'Weisberg & Huang (2016), Relativistic measurements from timing the binary pulsar PSR B1913+16, ApJ 829, 55', url: 'https://doi.org/10.3847/0004-637X/829/1/55' },
  ],
});
