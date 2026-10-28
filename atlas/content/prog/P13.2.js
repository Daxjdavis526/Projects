// Monte Carlo error propagation — push the input distributions through the
// formula and read the output's spread, against linear (partial-derivative)
// propagation from the lab strand: a stage's Δv from the rocket equation
// (they agree; correlated masses handled for free), and the propellant a
// vehicle needs (exponential: skewed, and linear propagation underestimates
// the tail).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, bar } from './_numkit.js';
import { thou } from './_solvers.js';

const t = String.raw;

const G0 = 9.80665;
// ── the upper stage: Isp, dry-plus-payload mass mf, propellant mp (independent measurements) ──
const ST = { isp: 320, sIsp: 4, mf: 3500, smf: 150, mp: 18000, smp: 250 };
const M0 = ST.mf + ST.mp, RATIO = M0 / ST.mf, C = ST.isp * G0;
const DV = C * Math.log(RATIO);
const D_ISP = G0 * Math.log(RATIO), D_MF = C * (1 / M0 - 1 / ST.mf), D_MP = C / M0;
const LIN = Math.hypot(D_ISP * ST.sIsp, D_MF * ST.smf, D_MP * ST.smp);
const WRONG = Math.hypot(D_ISP * ST.sIsp, (C / ST.mf) * ST.smf, (C / M0) * Math.hypot(ST.smf, ST.smp));
const MC_DV = { mean: 5699.05, sd: 138.27, lo: 5435.6, hi: 5977.5 };   // 10⁶ draws, default_rng(1), as in the Explore code (checked in Pyodide)

// ── the propellant needed for Δv = 9.4 km/s with a 1000 kg dry mass and Isp = 300 ± 15 s ──
const PR = { dv: 9400, mdry: 1000, isp: 300, sIsp: 15 };
const EXPO = Math.exp(PR.dv / (PR.isp * G0));
const NEED = PR.mdry * (EXPO - 1), NEED_SD = PR.mdry * EXPO * (PR.dv / (PR.isp ** 2 * G0)) * PR.sIsp;
const MC_NEED = { mean: 23935.8, sd: 4155.4, median: 23410.3, p5: 18150.2, p95: 31500.0 };   // 10⁶ draws, default_rng(3) (checked in Pyodide)
// a histogram of the propellant needed (seeded JS normals; illustrative)
const HIST = (() => {
  const z = normals(11), bins = Array(30).fill(0), lo = 10000, w = 1000, n = 20000;
  for (let i = 0; i < n; i++) { const isp = PR.isp + PR.sIsp * z(); const m = PR.mdry * (Math.exp(PR.dv / (isp * G0)) - 1); const k = Math.floor((m - lo) / w); if (k >= 0 && k < 30) bins[k]++; }
  return bins.map((c, k) => [lo + (k + 0.5) * w, c / n / w]);
})();

// ── the pendulum from the lab strand: g = 4π²L/T² ──
const PEN = { L: 1.0, sL: 0.002, T: 2.006, sT: 0.004 };
const G_PEN = (4 * Math.PI ** 2 * PEN.L) / PEN.T ** 2, SG_PEN = G_PEN * Math.hypot(PEN.sL / PEN.L, (2 * PEN.sT) / PEN.T);

export default lesson({
  id: 'prog.P13.2',
  title: 'Monte Carlo error propagation',
  minutes: 12, difficulty: 3,
  intro: t`The lab course propagates uncertainty with partial derivatives ([the general formula](#/lesson/lab.A3.2)): for $f(x_1, x_2, \ldots)$ with independent inputs,

$$\sigma_f^2 \approx \sum_i \left(\frac{\partial f}{\partial x_i}\,\sigma_i\right)^2$$

That linearizes $f$ — it assumes $f$ is close to a straight line over each input's spread. **Monte Carlo propagation** makes no such assumption: draw a million sets of inputs from their distributions, compute $f$ for every set (one vectorized line), and read off the mean, standard deviation and percentiles of the results. It is the reference method of the GUM's Supplement 1, and it handles correlated inputs, skewed outputs and formulas with no tidy derivatives as easily as simple ones.`,
  symbols: [
    { tex: t`\sigma_f`, text: 'the standard uncertainty of the result $f$' },
    { tex: t`x_i`, text: 'the measured inputs (here: specific impulse, masses), treated as independent' },
    { tex: t`\sigma_i`, text: 'the standard uncertainty of input $x_i$' },
    { tex: t`\partial f/\partial x_i`, text: 'the sensitivity of $f$ to input $x_i$, evaluated at the measured values' },
  ],
  why: 'Every performance number in a rocket or an experiment carries an error bar; Monte Carlo propagation is how you get it right when the formula is nonlinear or the inputs are tangled.',
  visual: {
    type: 'code-runner',
    title: 'Two error budgets for a rocket',
    lead: t`Press **Run**. Left: the $\Delta v$ of an upper stage from measured $I_{sp}$, dry mass and propellant mass — the Monte Carlo histogram and the linear-propagation Gaussian agree. Right: the propellant a 1000 kg vehicle needs for 9.4 km/s when its $I_{sp}$ is known to ±5% — the exponential skews the histogram, and the linear Gaussian misses the long tail.`,
    tasks: [
      'Compare the printed 95th percentiles of the propellant needed: linear propagation is about 1.7 t short.',
      'Shrink the Isp uncertainty to 3 s: the skew nearly vanishes and the two methods agree — linearization works for small spreads.',
      'Change N to 1000 and run twice with different seeds: how much do the Monte Carlo numbers themselves wobble?',
    ],
    params: {
      rows: 26,
      code: t`import numpy as np
import matplotlib.pyplot as plt

g0, N = 9.80665, 10**6

# 1. an upper stage's Δv from independently measured Isp, final mass and propellant
Isp, sI = 320.0, 4.0                 # s
mf, smf = 3500.0, 150.0              # kg, dry structure plus payload
mp, smp = 18000.0, 250.0             # kg, propellant
c, m0 = Isp * g0, mf + mp
dv = c * np.log(m0 / mf)
lin = np.sqrt((g0 * np.log(m0 / mf) * sI)**2 + (c * (1/m0 - 1/mf) * smf)**2 + (c / m0 * smp)**2)
rng = np.random.default_rng(1)
I, f, p = rng.normal(Isp, sI, N), rng.normal(mf, smf, N), rng.normal(mp, smp, N)
dv_mc = I * g0 * np.log((f + p) / f)
print(f"Δv: linear {dv:.0f} ± {lin:.1f} m/s;  Monte Carlo {dv_mc.mean():.0f} ± {dv_mc.std():.1f} m/s")

# 2. the propellant needed for 9.4 km/s, dry mass 1000 kg, Isp 300 ± 15 s
dvt, mdry, Isp2, s2 = 9400.0, 1000.0, 300.0, 15.0
need = mdry * (np.exp(dvt / (Isp2 * g0)) - 1)
sneed = mdry * np.exp(dvt / (Isp2 * g0)) * dvt / (Isp2**2 * g0) * s2
mp_mc = mdry * (np.exp(dvt / (rng.normal(Isp2, s2, N) * g0)) - 1)
print(f"propellant: linear {need:.0f} ± {sneed:.0f} kg, 95th percentile {need + 1.645 * sneed:.0f} kg")
print(f"            Monte Carlo mean {mp_mc.mean():.0f}, sd {mp_mc.std():.0f}, 95th percentile {np.percentile(mp_mc, 95):.0f} kg")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.8))
gauss = lambda x, m, s: np.exp(-0.5 * ((x - m) / s)**2) / (s * np.sqrt(2 * np.pi))
ax1.hist(dv_mc, bins=100, density=True, alpha=0.6, label="Monte Carlo")
x = np.linspace(dv - 5 * lin, dv + 5 * lin, 300)
ax1.plot(x, gauss(x, dv, lin), label="linear"); ax1.set_xlabel("Δv (m/s)"); ax1.legend(fontsize=8)
ax2.hist(mp_mc, bins=np.linspace(5e3, 5e4, 120), density=True, alpha=0.6, label="Monte Carlo")
x = np.linspace(5e3, 5e4, 300)
ax2.plot(x, gauss(x, need, sneed), label="linear"); ax2.set_xlabel("propellant needed (kg)"); ax2.legend(fontsize=8)
plt.tight_layout()
plt.show()`,
    },
    caption: 'Normal input distributions are assumed for every measurement. The vehicles are illustrative, and the rocket equation ignores gravity and drag losses.',
  },
  example: {
    prompt: t`An upper stage's $\Delta v = I_{sp}\,g_0\ln(m_0/m_f)$, with $g_0 = 9.80665\ \text{m/s}^2$. Independent measurements give $I_{sp} = ${ST.isp} \pm ${ST.sIsp}$ s, final (dry plus payload) mass $m_f = ${thou(ST.mf)} \pm ${ST.smf}$ kg and propellant mass $m_p = ${thou(ST.mp)} \pm ${ST.smp}$ kg, so $m_0 = m_f + m_p$. Find $\sigma_{\Delta v}$ by linear propagation and by Monte Carlo.`,
    visual: {
      type: 'graph',
      params: { x: [5200, 6200], y: [0, 3.2], aspect: 'wide', axesAt: 'edge', xlabel: 'Δv (m/s)', ylabel: 'probability density (per km/s)', yticks: 3,
        curves: [{ fn: `1000*exp(-0.5*((x - ${DV})/${LIN})^2)/(${LIN}*sqrt(2*pi))`, color: 'accent' }],
        vlines: [{ x: DV - LIN, color: 'ink3', label: '−σ' }, { x: DV + LIN, color: 'ink3', label: '+σ' }] },
      caption: 'The linear-propagation result as a Gaussian, with its ±1σ band. The Monte Carlo histogram (in the Explore) lies on top of it.',
    },
    steps: [
      { label: 'Pick the independent inputs', text: t`The measured quantities are $I_{sp}$, $m_f$ and $m_p$; $m_0 = m_f + m_p$ is **computed**, so it is correlated with $m_f$. Write $\Delta v = I_{sp}g_0\ln\!\big((m_f + m_p)/m_f\big)$ in the independent variables before differentiating.` },
      { label: 'Linear propagation', text: t`The sensitivities are $\partial\Delta v/\partial I_{sp} = g_0\ln(m_0/m_f) = ${D_ISP.toFixed(2)}$ m/s per s, $\partial\Delta v/\partial m_f = I_{sp}g_0\,(1/m_0 - 1/m_f) = ${D_MF.toFixed(4)}$ m/s per kg, and $\partial\Delta v/\partial m_p = I_{sp}g_0/m_0 = ${D_MP.toFixed(4)}$ m/s per kg. Times their uncertainties: ${(D_ISP * ST.sIsp).toFixed(1)}, ${Math.abs(D_MF * ST.smf).toFixed(1)} and ${(D_MP * ST.smp).toFixed(1)} m/s, which add in quadrature to $\sigma_{\Delta v} = ${LIN.toFixed(1)}$ m/s on $\Delta v = ${DV.toFixed(0)}$ m/s.` },
      { label: 'Monte Carlo', text: t`\`\`\`python
rng = np.random.default_rng(1)
I = rng.normal(320, 4, 10**6)
f = rng.normal(3500, 150, 10**6)
p = rng.normal(18000, 250, 10**6)
dv = I * 9.80665 * np.log((f + p) / f)
print(dv.mean(), dv.std(), np.percentile(dv, [2.5, 97.5]))
\`\`\`

It gives $${MC_DV.mean.toFixed(0)} \pm ${MC_DV.sd.toFixed(1)}$ m/s, with a 95% interval of ${MC_DV.lo.toFixed(0)} to ${MC_DV.hi.toFixed(0)} m/s. Sampling the measured quantities builds the correlation of $m_0$ and $m_f$ in automatically.` },
      { label: 'Sense check', text: t`The two agree to 0.1%, as they should when $\ln$ is nearly straight over a 4% spread in mass. The Monte Carlo mean is ${(MC_DV.mean - DV).toFixed(1)} m/s above the nominal value — a small curvature bias that linear propagation cannot see. Treating $m_0$ and $m_f$ as independent (with $\sigma_{m_0} = \sqrt{${ST.smf}^2 + ${ST.smp}^2}$) would have given ${WRONG.toFixed(0)} m/s, ${(100 * (WRONG / LIN - 1)).toFixed(0)}% too large: an error in $m_f$ partly cancels between numerator and denominator.` },
    ],
    answer: t`$\Delta v = ${DV.toFixed(0)} \pm ${LIN.toFixed(0)}$ m/s by either method (Monte Carlo: $${MC_DV.mean.toFixed(0)} \pm ${MC_DV.sd.toFixed(0)}$ m/s).`,
  },
  practice: [
    num({
      id: 'isp-only', difficulty: 2,
      gen(r) {
        const isp = r.pick([290, 311, 348, 452]), s = r.pick([2, 3, 5]), R = r.pick([3, 4.5, 6.2]);
        const sd = G0 * Math.log(R) * s;
        return {
          prompt: t`An engine's specific impulse is $I_{sp} = ${isp} \pm ${s}$ s; the stage's mass ratio $m_0/m_f = ${R}$ is known precisely. What is the uncertainty in $\Delta v = I_{sp}\,g_0\ln(m_0/m_f)$?`,
          visual: {
            type: 'graph',
            params: { x: [isp - 4 * s, isp + 4 * s], y: [G0 * Math.log(R) * (isp - 4.5 * s), G0 * Math.log(R) * (isp + 4.5 * s)], aspect: 'wide', axesAt: 'edge', xlabel: 'Isp (s)', ylabel: 'Δv (m/s)',
              curves: [{ fn: `${G0 * Math.log(R)}*x`, color: 'accent' }], vlines: [{ x: isp - s, color: 'ink3' }, { x: isp + s, color: 'ink3' }] },
            caption: 'Δv against Isp: a straight line, so the ±1σ band in Isp (dashed) maps straight onto Δv.',
          },
          answer: sd, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: G0 * s, feedback: t`You dropped the $\ln(m_0/m_f)$ factor: $\partial\Delta v/\partial I_{sp} = g_0\ln(m_0/m_f)$.` }, { value: s * Math.log(R), feedback: t`Multiply by $g_0$ as well: $I_{sp}$ is in seconds.` }],
          hints: [t`Only one input is uncertain: $\sigma_{\Delta v} = \left|\partial\Delta v/\partial I_{sp}\right|\sigma_{I_{sp}}$.`, t`$\partial\Delta v/\partial I_{sp} = g_0\ln(${R}) = ${(G0 * Math.log(R)).toFixed(2)}$ m/s per second.`],
          teach: t`With one uncertain input, $\sigma_f = \lvert\partial f/\partial x\rvert\,\sigma_x$; when $f$ is linear in $x$ this is exact, not an approximation.`,
          explain: t`$\sigma_{\Delta v} = 9.80665\times\ln ${R}\times${s} = ${sd.toFixed(1)}$ m/s on $\Delta v = ${(G0 * Math.log(R) * isp).toFixed(0)}$ m/s — the same ${((100 * s) / isp).toFixed(1)}% as $I_{sp}$, because $\Delta v \propto I_{sp}$.`,
        };
      },
    }),
    num({
      id: 'pendulum', difficulty: 2,
      prompt: t`The lab strand's pendulum: $L = ${PEN.L.toFixed(3)} \pm ${PEN.sL}$ m and $T = ${PEN.T} \pm ${PEN.sT}$ s give $g = 4\pi^2L/T^2$. What is $\sigma_g$ by linear propagation?

\`\`\`python
g = 4 * np.pi**2 * L / T**2
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [9.6, 10.0], y: [0, 10], aspect: 'wide', axesAt: 'edge', xlabel: 'g (m/s²)', ylabel: 'probability density', yticks: 0,
          curves: [{ fn: `exp(-0.5*((x - ${G_PEN})/${SG_PEN})^2)/(${SG_PEN}*sqrt(2*pi))`, color: 'accent' }],
          vlines: [{ x: 9.80665, color: 'gold', label: 'standard g' }] },
        caption: 'The distribution of g implied by the measurements (Gaussian, from the answer), with the standard 9.807 m/s².',
      },
      answer: SG_PEN, units: 'm/s^2', tol: { rel: 0.01 },
      errors: [{ value: G_PEN * Math.hypot(PEN.sL / PEN.L, PEN.sT / PEN.T), feedback: 'T enters squared: its relative uncertainty counts twice.' }, { value: G_PEN * (PEN.sL / PEN.L + (2 * PEN.sT) / PEN.T), feedback: 'Independent uncertainties add in quadrature, not linearly.' }],
      hints: [t`For a product of powers, relative uncertainties add in quadrature, each times its power: $\sigma_g/g = \sqrt{(\sigma_L/L)^2 + (2\sigma_T/T)^2}$.`, t`$g = ${G_PEN.toFixed(4)}$ m/s²; $\sigma_L/L = 0.002$, $2\sigma_T/T = ${((2 * PEN.sT) / PEN.T).toFixed(5)}$.`],
      teach: t`For $f = x^a y^b$, $\sigma_f/f = \sqrt{(a\sigma_x/x)^2 + (b\sigma_y/y)^2}$ — the power multiplies the relative uncertainty.`,
      explain: t`$\sigma_g = ${G_PEN.toFixed(4)}\times\sqrt{0.002^2 + ${((2 * PEN.sT) / PEN.T).toFixed(5)}^2} = ${SG_PEN.toFixed(4)}$ m/s². A Monte Carlo run with $10^6$ draws gives $0.0437$ — agreement, because both inputs are known to a fraction of a percent. The period dominates the budget, through its power of 2.`,
    }),
    code({
      id: 'mc-dv', difficulty: 2,
      prompt: t`Propagate the uncertainties of a kick stage by Monte Carlo: $I_{sp} = 290 \pm 3$ s, final mass $m_f = 820 \pm 20$ kg, propellant $m_p = 1600 \pm 30$ kg (independent, normal). With $N = 10^6$ draws from \`np.random.default_rng(5)\`, compute the array \`dv\` of $\Delta v = I_{sp}g_0\ln((m_f + m_p)/m_f)$ values and set \`mean\` and \`sd\` to its mean and standard deviation.`,
      starter: t`import numpy as np

g0, N = 9.80665, 10**6
rng = np.random.default_rng(5)

dv = None
mean = None
sd = None
`,
      answer: t`import numpy as np

g0, N = 9.80665, 10**6
rng = np.random.default_rng(5)

I = rng.normal(290, 3, N)
mf = rng.normal(820, 20, N)
mp = rng.normal(1600, 30, N)
dv = I * g0 * np.log((mf + mp) / mf)
mean, sd = dv.mean(), dv.std()
print(f"{mean:.1f} ± {sd:.1f} m/s")`,
      tests: [
        { name: 'one million samples', code: 'np.shape(dv) == (10**6,)' },
        { name: 'the mean is within 1 m/s of 3078.2 m/s', code: 'abs(mean - 3078.2) < 1.0' },
        { name: 'the standard deviation is within 0.5 m/s of 66.0 m/s', code: 'abs(sd - 66.0) < 0.5' },
      ],
      hints: ['Draw each input with `rng.normal(mean, sigma, N)`.', 'Compute `dv` from the three arrays in one line — NumPy works element by element.', '`mean, sd = dv.mean(), dv.std()`.'],
      teach: 'Monte Carlo propagation is three lines: sample the inputs, apply the formula to the arrays, summarize the output.',
      explain: t`About $3078 \pm 66$ m/s. The Monte Carlo spread matches linear propagation (66.0 m/s) because every input is known to a few percent; the mean sits about 0.5 m/s above the formula evaluated at the mean inputs (3077.8 m/s), a small curvature effect. The order in which you draw the inputs changes the individual numbers, not the statistics — which is why the tests allow a small tolerance instead of demanding exact values.`,
    }),
    mcq({
      id: 'correlated', difficulty: 3,
      prompt: t`A student propagates the upper stage's uncertainty by treating $m_0$ and $m_f$ as independent inputs, with $\sigma_{m_0} = \sqrt{\sigma_{m_f}^2 + \sigma_{m_p}^2}$, and gets ${WRONG.toFixed(0)} m/s instead of ${LIN.toFixed(0)}. Why is it too large?

\`\`\`python
m0 = mf + mp                       # computed, not measured
dv = Isp * g0 * np.log(m0 / mf)
\`\`\``,
      choices: [
        'm₀ contains mf: an error in mf moves numerator and denominator the same way and partly cancels in the ratio, which independent treatment ignores',
        'Quadrature addition always overestimates; linear addition is correct',
        t`The formula for $\sigma$ of a sum is wrong: it should be $\sigma_{m_f} + \sigma_{m_p}$`,
        'Monte Carlo and linear propagation always disagree by about 15%',
      ],
      answer: 0,
      why: {
        1: 'Quadrature is right for independent inputs; here the inputs are not independent.',
        2: t`For independent $m_f$ and $m_p$, the $\sigma$ of their sum is indeed $\sqrt{\sigma_{m_f}^2 + \sigma_{m_p}^2}$. The issue is using $m_0$ alongside $m_f$.`,
        3: 'They agree closely here (138.1 against 138.3 m/s) once the inputs are chosen correctly.',
      },
      hints: ['If the true mf is 150 kg higher, what happens to m₀?', 'Express Δv in the quantities that were actually measured independently.'],
      teach: 'Linear propagation needs independent inputs (or an explicit covariance term); Monte Carlo gets correlations right automatically if you sample what was actually measured.',
      explain: t`If $m_f$ is really higher, $m_0$ is higher by the same amount, so $m_0/m_f$ changes less than treating them separately suggests. Differentiating with respect to the independent $m_f$ and $m_p$ gives $\partial\Delta v/\partial m_f = I_{sp}g_0(1/m_0 - 1/m_f)$, smaller in size than $I_{sp}g_0/m_f$. The general formula needs a covariance term $2\,\frac{\partial f}{\partial m_0}\frac{\partial f}{\partial m_f}\operatorname{cov}(m_0, m_f)$ to fix it — or just sample $m_f$ and $m_p$.`,
    }),
    mcq({
      id: 'skewed', difficulty: 3,
      prompt: t`The Monte Carlo histogram of the propellant a vehicle needs (for $\Delta v = 9.4$ km/s with $I_{sp} = 300 \pm 15$ s) looks like this. What does linear propagation get wrong?`,
      visual: {
        type: 'graph',
        params: { x: [10000, 40000], y: [0, 1.1e-4], aspect: 'wide', axesAt: 'edge', xlabel: 'propellant needed (kg)', ylabel: 'probability density', yticks: 0,
          shade: HIST.map(([m, d]) => bar(m - 480, m + 480, d)),
          curves: [{ fn: `exp(-0.5*((x - ${NEED})/${NEED_SD})^2)/(${NEED_SD}*sqrt(2*pi))`, color: 'gold', dash: true }],
          vlines: [{ x: NEED, color: 'ink3', label: 'nominal' }] },
        caption: 'Monte Carlo histogram (blue bars, 20 000 draws) and the linear-propagation Gaussian (dashed gold).',
      },
      choices: [
        'It assumes a symmetric spread, but the exponential stretches the high side: the mean is higher than the nominal value and the upper tail is much longer',
        'Nothing: the standard deviations agree, so the distributions agree',
        'It overestimates the uncertainty, because the histogram is narrower',
        'It gives the wrong nominal value, because the derivative is evaluated in the wrong place',
      ],
      answer: 0,
      why: {
        1: 'Even with similar σ, the shape differs: the probability of needing far more propellant is underestimated.',
        2: 'The histogram is wider on the high side, not narrower.',
        3: 'The nominal value (all inputs at their means) is the same in both; the Monte Carlo mean differs from it because of the curvature.',
      },
      hints: ['Is the histogram symmetric about the nominal value?', `How does the mass ratio e^(Δv/Isp g₀) change for Isp 15 s low, compared with 15 s high?`],
      teach: 'When a formula curves appreciably over the input spread, the output is skewed: report Monte Carlo percentiles, not mean ± σ from linearization.',
      explain: t`A low $I_{sp}$ raises the mass ratio $e^{\Delta v/(I_{sp}g_0)}$ far more than a high one lowers it. With $10^6$ draws the mean is $${thou(MC_NEED.mean)}$ kg against a nominal $${thou(NEED)}$ kg, and the 95th percentile is $${thou(MC_NEED.p95)}$ kg — linear propagation's mean $+ 1.645\sigma$ says $${thou(NEED + 1.645 * NEED_SD)}$ kg, $${thou(MC_NEED.p95 - (NEED + 1.645 * NEED_SD))}$ kg short. For a vehicle sized to the 95th percentile, that is the difference between reaching orbit and not.`,
    }),
    num({
      id: 'how-many', difficulty: 2,
      gen(r) {
        const pct = r.pick([1, 2, 5]);
        const N = 1 / (2 * (pct / 100) ** 2);
        return {
          prompt: t`The standard deviation estimated from $N$ Monte Carlo samples of a roughly normal output has a relative uncertainty of about $1/\sqrt{2N}$. How many samples make the **uncertainty of the uncertainty** ${pct}%?

\`\`\`python
sd = results.std()     # how many results are enough?
\`\`\``,
          visual: {
            type: 'graph',
            params: { x: [1, 7], y: [-3.5, 0], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'N', ylabel: 'relative error of σ',
              curves: [{ fn: `-0.5*x - ${Math.log10(Math.SQRT2)}`, color: 'accent' }], hlines: [{ y: Math.log10(pct / 100), color: 'gold', label: `${pct}%` }] },
            caption: '1/√(2N) on log–log axes, with the target level.',
          },
          answer: N, tol: { rel: 0.01 },
          errors: [{ value: 1 / (pct / 100) ** 2, feedback: 'Include the factor 2: 1/√(2N) = target gives N = 1/(2·target²).' }, { value: 1 / (2 * (pct / 100)), feedback: 'Square the target: N = 1/(2·target²).' }],
          hints: [t`Solve $1/\sqrt{2N} = ${pct / 100}$.`, t`$N = 1/(2\times${pct / 100}^2)$.`],
          teach: 'A thousand-odd samples pin σ to about 2%; a million to 0.07% — choose N for the precision the error bar itself needs.',
          explain: t`$N = 1/(2\times${pct / 100}^2) = ${thou(N)}$. An uncertainty is rarely needed to better than a few percent, so ${N <= 5000 ? 'a few thousand draws' : 'this many draws'} usually suffice for σ — but tail percentiles (the 95th or 99.9th) need many more, because only a few samples land out there.`,
        };
      },
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-propellant', difficulty: 3, transfer: true,
      prompt: t`A launch-vehicle study must carry enough propellant to reach $\Delta v = ${PR.dv / 1000}$ km/s with a dry mass of ${PR.mdry} kg in **95% of cases**, when the engine's $I_{sp}$ is only known as $${PR.isp} \pm ${PR.sIsp}$ s (normal). The propellant needed is $m_p = m_{\text{dry}}\left(e^{\Delta v/(I_{sp}g_0)} - 1\right)$. With $10^6$ draws from \`np.random.default_rng(3)\`, set \`p95\` to the 95th percentile of $m_p$ (kg) and \`lin95\` to the linear-propagation estimate $m_p + 1.645\,\sigma_{m_p}$ at the nominal $I_{sp}$.`,
      starter: t`import numpy as np

g0, N = 9.80665, 10**6
dv, mdry, Isp, sI = ${PR.dv}.0, ${PR.mdry}.0, ${PR.isp}.0, ${PR.sIsp}.0
rng = np.random.default_rng(3)

p95 = None
lin95 = None
`,
      answer: t`import numpy as np

g0, N = 9.80665, 10**6
dv, mdry, Isp, sI = ${PR.dv}.0, ${PR.mdry}.0, ${PR.isp}.0, ${PR.sIsp}.0
rng = np.random.default_rng(3)

mp = mdry * (np.exp(dv / (rng.normal(Isp, sI, N) * g0)) - 1)
p95 = np.percentile(mp, 95)

need = mdry * (np.exp(dv / (Isp * g0)) - 1)
dneed = mdry * np.exp(dv / (Isp * g0)) * dv / (Isp**2 * g0)     # ∂mp/∂Isp, in size
lin95 = need + 1.645 * dneed * sI
print(round(p95), round(lin95))`,
      tests: [
        { name: t`Monte Carlo 95th percentile $\approx ${thou(MC_NEED.p95)}$ kg (within 0.5%)`, code: `abs(p95 / ${MC_NEED.p95} - 1) < 0.005` },
        { name: t`linear estimate $${thou(NEED + 1.645 * NEED_SD)}$ kg`, code: `abs(lin95 - ${NEED + 1.645 * NEED_SD}) < 1` },
        { name: 'linear propagation underestimates the 95% requirement', code: 'p95 - lin95 > 1000' },
      ],
      hints: ['Sample `Isp` with `rng.normal(Isp, sI, N)` and compute `mp` from the array; `np.percentile(mp, 95)` gives p95.', t`For the linear estimate: $\partial m_p/\partial I_{sp} = -m_{\text{dry}}\,e^{\Delta v/(I_{sp}g_0)}\,\Delta v/(I_{sp}^2 g_0)$; use its size times $\sigma_{I_{sp}}$.`, '`lin95 = need + 1.645 * abs(derivative) * sI` with `need` at the nominal Isp.'],
      teach: 'For a requirement on a tail (“in 95% of cases”), use Monte Carlo percentiles: linearization assumes symmetry and misjudges skewed tails.',
      explain: t`Monte Carlo says $${thou(MC_NEED.p95)}$ kg; linear propagation $${thou(NEED + 1.645 * NEED_SD)}$ kg — ${((MC_NEED.p95 / (NEED + 1.645 * NEED_SD) - 1) * 100).toFixed(1)}% short, because $e^{\Delta v/(I_{sp}g_0)}$ curves upward: low-$I_{sp}$ outcomes cost disproportionately more propellant. With the vehicle's dry mass itself growing with tank size, the real penalty compounds — which is why propulsion margins are set from distributions, not single numbers.`,
    }),
    mcq({
      id: 'cp-agree', difficulty: 2,
      prompt: t`For which of these would linear propagation and Monte Carlo agree closely?

\`\`\`python
# P: Δv = Isp g0 ln(m0/mf), Isp ± 1%, masses ± 1%
# Q: propellant ∝ exp(Δv / (Isp g0)) with Δv/(Isp g0) ≈ 3 and Isp ± 10%
# R: 1/x with x = 0.05 ± 0.04
# S: a period T = 2π √(L/g) with L ± 50%
\`\`\``,
      choices: ['P: every input’s spread is small, so the formula is nearly linear across it', 'Q: an exponential is smooth, so linearization is accurate', 'R: 1/x has a simple derivative', 'S: a square root changes slowly'],
      answer: 0,
      why: {
        1: 'Smooth is not enough: with the exponent changing by ±0.3, the exponential curves substantially across the spread.',
        2: 'x is within about one σ of zero, where 1/x blows up — the output distribution has no finite variance.',
        3: '±50% is far too wide for a straight-line approximation of √L.',
      },
      hints: ['Linearization works when f is close to a straight line over the inputs’ spread. Which spreads are small?'],
      teach: 'Linear propagation is trustworthy when the relative spread of each input is small compared with the scale over which the formula bends; otherwise use Monte Carlo.',
      explain: t`For P, $\ln$ is essentially straight over 1% changes, and the two methods agree to a fraction of a percent (as in the worked example). Q, R and S all bend over their input ranges — Q is the skewed case of the checkpoint, R is a ratio with a denominator that can reach zero, and S spans a wide range of $\sqrt L$. Monte Carlo is the safe default whenever you are unsure.`,
    }),
  ],
  sources: [
    { label: 'JCGM 101:2008, Evaluation of measurement data — Supplement 1 to the GUM: propagation of distributions using a Monte Carlo method', url: 'https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf' },
    { label: 'Taylor, An Introduction to Error Analysis, ch. 3 and §9.2 (covariance)', url: 'https://uscibooks.aip.org/books/introduction-to-error-analysis-the-study-of-uncertainties-in-physical-measurements-3rd-edition/' },
    { label: 'Sutton & Biblarz, Rocket Propulsion Elements, ch. 4: the rocket equation', url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements%2C+9th+Edition-p-9781118753910' },
  ],
});
