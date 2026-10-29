// Miniature project 5 — measuring g with a pendulum, large-angle corrections
// included. A guided mini-paper on SYNTHETIC photogate timings (10 periods at
// each of 8 release angles, 5° to 60°; L = 1.000 ± 0.002 m; 0.5 ms jitter;
// g = 9.7989 m/s², the WGS 84 normal gravity at Logan, Utah, 41.74° N,
// 1400 m). The exact period T = T₀(2/π)K(m), m = sin²(θ₀/2) — SciPy's ellipk
// takes the parameter m, and passing k = sin(θ₀/2) instead gives 1.0229 at
// 10° instead of 1.0019. Small-angle analysis of all swings: 9.359 (4.5%
// low); corrected: 9.7997 ± 0.0196, dominated by the length. The correction
// against angle, the amplitude needed for a target precision, a bob-size
// (physical-pendulum) correction, and a Mars-lander pendulum as transfer.
// Pendulums are phys2210.M15.3, the bench lab phys2210.L.10, Monte Carlo
// propagation lab.A3.3. Numbers from the Explore were copied from Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { r6, SRC2 } from './_rs2.js';

const t = String.raw;
// T/T₀ = 1/AGM(1, cos(θ₀/2))
function agm(a, b) { for (let i = 0; i < 40; i++) { const m = (a + b) / 2; b = Math.sqrt(a * b); a = m; } return a; }
const ratio = (deg) => 1 / agm(1, Math.cos(deg * Math.PI / 360));
const G_TRUE = 9.7989;
const OUT = { naive: 9.3593, T0: 2.00712, sT0: 0.00005, g: 9.7997, sg: 0.0196, sgT: 0.00049, sgL: 0.0196 };

const ratioPic = (caption, { max = 90, series = true, mark = null } = {}) => ({
  type: 'graph',
  params: {
    x: [0, max], y: [0.995, ratio(max) * 1.01 + 0.005], aspect: 'wide', axesAt: 'edge', xlabel: 'release angle θ₀ (degrees)', ylabel: 'T / T₀', xticks: 6, yticks: 4,
    points: [...Array.from({ length: 80 }, (_, i) => { const d = (i + 0.5) * max / 80; return { x: r6(d), y: r6(ratio(d)), r: 1.4, color: 'accent' }; }), ...(mark ? [mark] : [])],
    ...(series ? { curves: [{ fn: '1 + (x*pi/180)^2/16', color: 'gold', dash: [6, 4], width: 1.6 }] } : {}),
    legend: [{ label: 'exact, (2/π) K(m)', color: 'accent' }, ...(series ? [{ label: '1 + θ₀²/16', color: 'gold', dash: [6, 4] }] : [])],
    legendAt: 'tl',
  },
  caption,
});
const pendPic = (theta0, caption, L = 1, g = 9.8) => ({ type: 'oscillator', params: { kind: 'pendulum', L, theta0, g }, caption });

const PRELUDE = t`import numpy as np
from scipy.special import ellipk

def period_ratio(theta0_deg):
    """T / T0 for release angle theta0: (2/pi) K(m), with SciPy's PARAMETER m = sin^2(theta0/2)."""
    m = np.sin(np.radians(theta0_deg) / 2) ** 2
    return 2 / np.pi * ellipk(m)

# SYNTHETIC photogate data: 10 periods at each of 8 release angles for a pendulum
# of length 1.000 m, with g = 9.7989 m/s^2 (WGS 84 normal gravity at Logan, Utah)
# and 0.5 ms timing jitter. No damping, no bob size, no string mass.
rng = np.random.default_rng(5)
L, sL = 1.000, 0.002                     # m: length to the bob's centre, and its uncertainty
angles = np.repeat([5, 10, 15, 20, 30, 40, 50, 60], 10)       # degrees
T_true = 2 * np.pi * np.sqrt(L / 9.7989) * period_ratio(angles)
T = T_true + 0.0005 * rng.normal(size=angles.size)            # seconds
`;
const PRELUDE_NOK = PRELUDE.replace(t`
def period_ratio(theta0_deg):
    """T / T0 for release angle theta0: (2/pi) K(m), with SciPy's PARAMETER m = sin^2(theta0/2)."""
    m = np.sin(np.radians(theta0_deg) / 2) ** 2
    return 2 / np.pi * ellipk(m)
`, t`
def period_ratio(theta0_deg):
    """T / T0 for release angle theta0 (degrees)."""
    pass
`);
const EXPLORE = PRELUDE + t`
# small-angle analysis: treat every swing as if T = 2 pi sqrt(L/g)
g_naive = 4 * np.pi**2 * L / np.mean(T)**2
# exact analysis: divide out the large-angle factor, then average
T0_each = T / period_ratio(angles)
T0 = np.mean(T0_each)
sT0 = np.std(T0_each, ddof=1) / np.sqrt(T0_each.size)
g = 4 * np.pi**2 * L / T0**2
sg = g * np.hypot(sL / L, 2 * sT0 / T0)
print(f"small-angle formula, all swings: g = {g_naive:.4f} m/s^2")
print(f"T0 = {T0:.5f} +/- {sT0:.5f} s")
print(f"large-angle corrected: g = {g:.4f} +/- {sg:.4f} m/s^2")
print(f"   timing alone contributes {g * 2 * sT0 / T0:.5f}; the length {g * sL / L:.4f}")

import atlas.plot as plt
th = np.linspace(0, 65, 200)
plt.scatter(angles, T, label="synthetic timings")
plt.plot(th, T0 * period_ratio(th), label="exact: T0 (2/pi) K(m)")
plt.plot(th, T0 * (1 + np.radians(th)**2 / 16), label="series: T0 (1 + theta^2/16)")
plt.xlabel("release angle (degrees)"); plt.ylabel("period (s)"); plt.legend(); plt.show()
`;

export default lesson({
  id: 'research.P.5',
  title: 'Measuring g with a pendulum, large-angle corrections included',
  minutes: 22, difficulty: 3,
  intro: t`**The question.** A pendulum timed with a photogate measures its period to a fraction of a millisecond. Can it measure the local gravitational acceleration $g$ to better than 0.5% — and what goes wrong if you trust the small-angle formula $T_0 = 2\pi\sqrt{L/g}$ at the amplitudes people actually use?

**The timings are synthetic**: 10 periods at each of eight release angles from $5^\circ$ to $60^\circ$, for a 1.000 m pendulum, generated with $g = 9.7989\ \text{m/s}^2$ — the WGS 84 normal gravity at Logan, Utah ($41.74^\circ$ N, 1400 m) — and 0.5 ms of timing jitter. The exact period of a simple pendulum released from rest at $\theta_0$ is

$$T = T_0\,\frac{2}{\pi}\,K\!\left(\sin^2\tfrac{\theta_0}{2}\right), \qquad T_0 = 2\pi\sqrt{L/g}$$

[Pendulums](#/lesson/phys2210.M15.3) gave the small-angle period and its first correction; this project uses the exact one.`,
  symbols: [
    { tex: 'T', text: 'the true period at release angle $\\theta_0$, in seconds' },
    { tex: 'T_0', text: 'the small-angle period $2\\pi\\sqrt{L/g}$, in seconds' },
    { tex: 'K(m)', text: t`the complete elliptic integral of the first kind, $\int_0^{\pi/2} d\phi/\sqrt{1 - m\sin^2\phi}$, written with the **parameter** $m$ (SciPy’s \`ellipk\` convention); $K(0) = \pi/2$` },
    { tex: '\\theta_0', text: 'the release angle (the amplitude), in radians or degrees' },
    { tex: 'L', text: 'the length from the pivot to the bob’s centre, in metres' },
    { tex: 'g', text: 'the gravitational acceleration, in m/s²' },
  ],
  why: t`A systematic error you did not model cannot be averaged away — and the amplitude effect is the classic one hiding in every pendulum measurement.`,
  visual: {
    type: 'code-runner',
    title: 'Two analyses of one data set',
    lead: t`Run it: the same 80 synthetic periods analysed with the small-angle formula and with the exact large-angle factor divided out. The plot shows the timings against release angle, the exact curve and the first-order series.`,
    tasks: ['Compare the two values of g: ignoring amplitude costs 4.5% — about 900 times the timing error.', 'Change the angles to [2, 3, 4, 5] and rerun: the small-angle answer is now right to 0.1%.', 'Look at the error budget line: the length’s 0.2% dominates, not the timing.'],
    params: { code: EXPLORE, rows: 20 },
    caption: 'Synthetic timings of an ideal simple pendulum: no damping (so no amplitude decay during timing), a point bob, a massless string.',
  },
  example: {
    prompt: t`Write the mini-paper’s result: the corrected $g$ with its uncertainty budget, the cost of the small-angle shortcut, and the comparison with the local normal gravity, $9.7989\ \text{m/s}^2$.`,
    visual: ratioPic('How much longer the true period is than the small-angle one (blue), and the first-order series (gold), up to 90°.'),
    steps: [
      { label: 'Divide out the amplitude', text: t`Each period divided by $(2/\pi)K(\sin^2\tfrac{\theta_0}{2})$ estimates $T_0$; the 80 estimates average to $T_0 = ${OUT.T0} \pm ${OUT.sT0}$ s.` },
      { label: 'The value', text: t`$g = 4\pi^2 L/T_0^2 = ${OUT.g}\ \text{m/s}^2$.` },
      { label: 'The budget', text: t`Relative errors add in quadrature: $\sigma_L/L = 0.2\%$ and $2\sigma_{T_0}/T_0 = 0.005\%$. Total $\pm ${OUT.sg}$: the **ruler**, not the photogate, limits the result.` },
      { label: 'The shortcut', text: t`Treating every swing as small-angle gives $${OUT.naive}\ \text{m/s}^2$, 4.5% low — 22 standard deviations. A systematic error that no number of repeats would reveal.` },
      { label: 'Compare', text: t`$${OUT.g} \pm ${OUT.sg}$ against $9.7989$: agreement within $0.04\sigma$, as it must for synthetic data generated with that value. With real data, the local anomaly (up to about $10^{-4}$ of $g$) would matter only below the 0.01% level.` },
    ],
    answer: t`$g = ${OUT.g} \pm ${OUT.sg}\ \text{m/s}^2$, limited by the length; the small-angle analysis of the same data gives $${OUT.naive}$, 4.5% low.`,
  },
  practice: [
    num({
      id: 'bias', difficulty: 2,
      gen(r) {
        const d = r.pick([10, 15, 20, 30, 45]);
        const ans = (ratio(d) ** 2 - 1) * 100;
        return {
          prompt: t`A pendulum is always released at $${d}^\circ$, and $g$ is computed from $T_0 = 2\pi\sqrt{L/g}$ with the measured period. By what percentage is $g$ too **low**? (The exact period is $T/T_0 = ${ratio(d).toFixed(6)}$ at this angle.)`,
          visual: ratioPic('The exact period ratio (blue) against release angle.', { max: 60, series: false, mark: { x: d, y: r6(ratio(d)), color: 'gold', r: 5 } }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (ratio(d) - 1) * 100, feedback: t`$g \propto 1/T^2$: the period’s error counts twice.` }],
          hints: [t`$g = 4\pi^2L/T^2$, so using $T$ instead of $T_0$ makes $g$ smaller by the factor $(T_0/T)^2$.`, t`Percentage $\approx \bigl((T/T_0)^2 - 1\bigr)\times 100$.`],
          teach: 'The period enters g squared, so a fractional error in the period doubles in g.',
          explain: t`$(${ratio(d).toFixed(6)})^2 - 1 = ${(ans / 100).toFixed(5)}$: $g$ comes out ${ans.toFixed(2)}% low${d >= 15 ? ' — far larger than a photogate’s timing error' : ''}.`,
        };
      },
    }),
    code({
      id: 'ratio-code', difficulty: 2,
      prompt: t`Write \`period_ratio(theta0_deg)\` returning $T/T_0 = \tfrac{2}{\pi}K(m)$ for release angles in **degrees** (an array or a number). SciPy’s \`ellipk\` takes the parameter $m = \sin^2(\theta_0/2)$.`,
      starter: PRELUDE_NOK.replace(/\n# SYNTHETIC[\s\S]*$/, '\n') + t`
print(period_ratio(np.array([5, 10, 30, 90])))
`,
      answer: t`import numpy as np
from scipy.special import ellipk

def period_ratio(theta0_deg):
    """T / T0 for release angle theta0 (degrees)."""
    m = np.sin(np.radians(theta0_deg) / 2) ** 2
    return 2 / np.pi * ellipk(m)

print(period_ratio(np.array([5, 10, 30, 90])))
`,
      tests: [
        { name: 'at 10° the period is 0.1907% longer', code: 'abs(period_ratio(10) - 1.0019072) < 1e-6' },
        { name: 'at 90° it is 18.03% longer', code: 'abs(period_ratio(90) - 1.1803406) < 1e-6' },
        { name: 'it reduces to 1 for tiny swings', code: 'abs(period_ratio(1e-4) - 1) < 1e-9' },
        { name: 'it works on arrays', code: 'np.allclose(period_ratio(np.array([10, 90])), [1.0019072, 1.1803406])' },
      ],
      hints: ['Convert degrees to radians with `np.radians`.', '`m = np.sin(np.radians(theta0_deg) / 2) ** 2`, then `2 / np.pi * ellipk(m)`.'],
      teach: 'Check a library function’s convention against a known value before trusting it: here, parameter m versus modulus k.',
      explain: t`Passing $k = \sin(\theta_0/2)$ instead of $m = k^2$ gives 1.0229 at $10^\circ$ instead of 1.0019 — a silent 2% error in the period and 4% in $g$. The tiny-angle and $90^\circ$ checks catch it.`,
    }),
    num({
      id: 'small-enough', difficulty: 3,
      gen(r) {
        const pct = r.pick([0.1, 0.05, 0.01]);
        // largest θ₀ (degrees) with (T/T₀)² − 1 ≤ pct/100, by bisection
        let lo = 0, hi = 60;
        for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (ratio(m) ** 2 - 1 <= pct / 100) lo = m; else hi = m; }
        const ans = lo;
        return {
          prompt: t`You will use the small-angle formula and want the amplitude error in $g$ below ${pct}%. Since $(T/T_0)^2 \approx 1 + \theta_0^2/8$ for small $\theta_0$ (in radians), what is the largest release angle you may use, in degrees?`,
          visual: ratioPic('Below 10°: the exact ratio (blue) and the series (gold) are indistinguishable, and both approach 1.', { max: 10 }),
          answer: ans, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(16 * pct / 100) * 180 / Math.PI, feedback: t`That bounds the period’s error. The error in $g$ is twice as large: use $\theta_0^2/8$.` }, { value: Math.sqrt(8 * pct / 100), feedback: 'That is in radians; convert to degrees.' }],
          hints: [t`Solve $\theta_0^2/8 = ${pct / 100}$ for $\theta_0$ in radians.`, 'Then multiply by 180/π.'],
          teach: 'Turn a precision target into an experimental rule before you take data.',
          explain: t`$\theta_0 = \sqrt{8 \times ${pct / 100}} = ${Math.sqrt(8 * pct / 100).toFixed(4)}$ rad $\approx ${ans.toFixed(2)}^\circ$. Below that, the small-angle formula is good enough; above it, correct for amplitude.`,
        };
      },
    }),
    mcq({
      id: 'budget', difficulty: 2,
      prompt: t`The budget: length $1.000 \pm 0.002$ m, $T_0$ known to 0.0025%. You can buy a better photogate or a better tape measure. Which improves $g$?`,
      visual: pendPic(30, 'The length is measured once, from the pivot to the bob’s centre; the period is averaged over 80 swings.'),
      choices: ['The tape measure: the length contributes 0.2% to g, the timing only 0.005%', 'The photogate: timing is always the hard part', 'Both equally', 'Neither: more swings will fix it'],
      answer: 0,
      why: { 1: 'Not here: 80 swings averaged the timing error down to 0.005% of g.', 2: t`They differ by a factor of 40 in $g$.`, 3: 'More swings shrink only the timing error, which is already negligible.' },
      hints: [t`$\sigma_g/g = \sqrt{(\sigma_L/L)^2 + (2\sigma_T/T)^2}$: compare the two terms.`],
      teach: 'Spend effort on the largest term in the budget.',
      explain: t`$\sigma_L/L = 0.2\%$ against $2\sigma_T/T = 0.005\%$. Measuring the length to 0.2 mm would bring $g$ to about 0.02%.`,
    }),
    num({
      id: 'bob', difficulty: 3,
      gen(r) {
        const rb = r.pick([1, 1.5, 2, 2.5, 3]), L = r.pick([0.5, 0.8, 1.0]);
        const f = Math.sqrt(1 + 2 * (rb / 100) ** 2 / (5 * L * L)), ans = (f * f - 1) * 100;
        return {
          prompt: t`A solid sphere of radius ${rb} cm hangs on a light string, its centre ${L} m below the pivot. As a physical pendulum its period is longer than a point bob’s by the factor $\sqrt{1 + \tfrac{2}{5}r^2/L^2}$. If you ignore this, by what percentage is $g$ too low?`,
          visual: pendPic(10, 'A real bob has a size: its rotation adds a little to the moment of inertia.', L),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (f - 1) * 100, feedback: t`$g \propto 1/T^2$: square the factor.` }],
          hints: [t`Work in metres: $r = ${rb / 100}$ m.`, t`$g$ is wrong by the factor squared: $1 + \tfrac{2}{5}(r/L)^2$.`],
          teach: 'List every small correction and size it: most are negligible, and saying so is part of the result.',
          explain: t`$\tfrac25 (${rb / 100}/${L})^2 = ${(ans / 100).toExponential(2).replace(/e(-?\d+)/, '\\times10^{$1}')}$, i.e. ${ans.toFixed(3)}% — ${ans < 0.2 ? 'well below the 0.2% length uncertainty, so it can be stated and neglected' : 'comparable with the length uncertainty, so it must be corrected'}.`,
        };
      },
    }),
    code({
      id: 'g-fit', difficulty: 2,
      prompt: t`From the synthetic timings, divide each period by \`period_ratio(angles)\` to estimate $T_0$, average them into \`T0\`, and set \`g\` $= 4\pi^2L/T_0^2$.`,
      starter: PRELUDE + t`
T0 = g = None
print(T0, g)
`,
      answer: PRELUDE + t`
T0 = np.mean(T / period_ratio(angles))
g = 4 * np.pi**2 * L / T0**2
print(T0, g)
`,
      tests: [
        { name: 'T₀ = 2.00712 s', code: 'T0 is not None and abs(T0 - 2.00712) < 2e-5' },
        { name: 'g = 9.7997 m/s²', code: 'g is not None and abs(g - 9.7997) < 2e-4' },
        { name: 'it is within 0.1% of the value the data were made with', code: 'g is not None and abs(g / 9.7989 - 1) < 1e-3' },
      ],
      hints: ['`T / period_ratio(angles)` is an array of 80 estimates of T₀.', 'Average it with `np.mean`, then `g = 4 * np.pi**2 * L / T0**2`.'],
      teach: 'Correct each measurement for the known systematic effect, then average.',
      explain: t`$T_0 = 2.00712$ s and $g = 9.7997\ \text{m/s}^2$. Averaging the raw periods instead would mix amplitudes and give 9.359.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-error', difficulty: 3,
      prompt: t`Complete the result: set \`sT0\` to the standard error of the 80 estimates of $T_0$ (their sample standard deviation over $\sqrt{80}$), and \`sg\` to the uncertainty of $g$ combining the length (\`sL\`) and $T_0$ in quadrature, remembering that $g \propto L/T_0^2$.`,
      starter: PRELUDE + t`
T0_each = T / period_ratio(angles)
T0 = np.mean(T0_each)
g = 4 * np.pi**2 * L / T0**2
sT0 = sg = None
print(g, sg)
`,
      answer: PRELUDE + t`
T0_each = T / period_ratio(angles)
T0 = np.mean(T0_each)
g = 4 * np.pi**2 * L / T0**2
sT0 = np.std(T0_each, ddof=1) / np.sqrt(T0_each.size)
sg = g * np.hypot(sL / L, 2 * sT0 / T0)
print(g, sg)
`,
      tests: [
        { name: 'σ(T₀) is about 0.05 ms', code: 'sT0 is not None and abs(sT0 - 4.99e-5) < 1e-6' },
        { name: 'σ(g) = 0.0196 m/s²', code: 'sg is not None and abs(sg - 0.0196) < 2e-4' },
        { name: 'the length dominates: σ(g) barely exceeds g·σL/L', code: 'sg is not None and sg / (g * sL / L) < 1.001' },
      ],
      hints: ['`np.std(T0_each, ddof=1) / np.sqrt(T0_each.size)`', t`Relative: $\sqrt{(\sigma_L/L)^2 + (2\sigma_{T_0}/T_0)^2}$; multiply by $g$.`],
      teach: 'Powers multiply relative errors: g ∝ L T⁻², so the period’s relative error counts twice.',
      explain: t`$g = 9.7997 \pm 0.0196\ \text{m/s}^2$. The timing term ($0.0005$) is forty times smaller than the length term: to do better, measure the length better. [Monte Carlo error propagation](#/lesson/lab.A3.3) gives the same answer here, because the errors are small.`,
    }),
    num({
      id: 'cp-mars', difficulty: 3, transfer: true,
      gen(r) {
        const [body, gt] = r.pick([['Mars', 3.721], ['the Moon', 1.625]]);
        const L = r.pick([0.3, 0.5, 0.8]), d = r.pick([20, 30, 40]);
        const T = +(2 * Math.PI * Math.sqrt(L / gt) * ratio(d)).toFixed(4);
        const ans = 4 * Math.PI ** 2 * L * ratio(d) ** 2 / (T * T);
        return {
          prompt: t`A lander on ${body} carries a ${L} m pendulum. Released from $${d}^\circ$, it swings with period $${T}$ s. At that angle $T/T_0 = ${ratio(d).toFixed(5)}$. What is the local $g$, in m/s²?`,
          visual: pendPic(d, `A ${d}° release: the exact pendulum lags the small-angle one a little more each swing.`, L, gt),
          answer: ans, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: 4 * Math.PI ** 2 * L / (T * T), feedback: 'That uses the small-angle formula: divide the period by the large-angle factor first.' }, { value: 4 * Math.PI ** 2 * L * ratio(d) / (T * T), feedback: t`$g \propto 1/T_0^2$: the factor enters squared.` }],
          hints: [t`$T_0 = ${T}/${ratio(d).toFixed(5)}$.`, t`$g = 4\pi^2 L/T_0^2$.`],
          teach: 'The same correction applies on any world: the amplitude factor is geometry, not gravity.',
          explain: t`$T_0 = ${(T / ratio(d)).toFixed(4)}$ s, so $g = ${ans.toFixed(3)}\ \text{m/s}^2$. Without the correction: $${(4 * Math.PI ** 2 * L / (T * T)).toFixed(3)}$, ${((ratio(d) ** 2 - 1) * 100).toFixed(1)}% low.`,
        };
      },
    }),
    mcq({
      id: 'cp-conclusion', difficulty: 2,
      prompt: 'Which sentence is the honest conclusion of this project?',
      visual: ratioPic('The amplitude effect that the corrected analysis removes.', { max: 60 }),
      choices: [
        t`“On synthetic data, correcting each period with the exact elliptic-integral factor recovers $g$ to 0.01%, within its 0.2% uncertainty (set by the length); the small-angle analysis of the same data is 4.5% low.”`,
        t`“We measured $g$ in Logan to 0.01%.”`,
        '“The small-angle formula is wrong.”',
        '“Our result agrees with the accepted value, so the experiment was successful.”',
      ],
      answer: 0,
      why: { 1: 'The data were synthetic, generated with that g; nothing was measured in Logan — and the stated uncertainty is 0.2%, not 0.01%.', 2: 'It is an approximation with a known range of validity; the point is to use it only inside that range.', 3: 'Agreement is not the criterion; what was tested and how well is.' },
      hints: ['What were the data, and what limited the uncertainty?'],
      teach: 'State what the data were, what the method recovered, and what limits the uncertainty.',
      explain: 'The method recovers the input, the systematic shortcut costs 4.5%, and the length limits the precision: three facts someone planning the real experiment can use (see the proposal in [R9.1](#/lesson/research.R9.1)).',
    }),
  ],
  lab: true,
  sources: [SRC2.wgs84, { label: 'SciPy documentation: scipy.special.ellipk (the parameter m convention)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.ellipk.html' }, { label: 'NIST Digital Library of Mathematical Functions, §19.2 (complete elliptic integrals) and §19.8 (the arithmetic–geometric mean)', url: 'https://dlmf.nist.gov/19.8' }],
});
