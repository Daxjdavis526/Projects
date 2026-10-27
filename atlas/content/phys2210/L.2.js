// Lab 2 (virtual): graphing and linearizing data — choosing axes that turn a
// law into a straight line, the least-squares line with the uncertainties of
// its slope and intercept, χ²/dof and residuals, and log–log plots for an
// unknown power. Galileo’s inclined plane, with a motion sensor.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, SOURCES } from './_lab.js';

const t = String.raw;
const D2R = Math.PI / 180;
const A_TRUE = 9.8 * Math.sin(2 * D2R);          // 0.3420 m/s², g sin θ on the 2.0° air track
const SX = 0.002;                                  // the motion sensor’s position noise, m

// the worked example: six positions from the motion sensor (seed 33)
const EX = (() => {
  const rows = B.makeData('ramp', { seed: 33 }).rows;
  const T = rows.map((r) => r.s), X = T.map((v) => v * v), y = rows.map((r) => r.R[0]);
  const N = X.length, Xm = X.reduce((s, v) => s + v, 0) / N, ym = y.reduce((s, v) => s + v, 0) / N;
  const Sxx = X.reduce((s, v) => s + (v - Xm) ** 2, 0), Sxy = X.reduce((s, v, i) => s + (v - Xm) * (y[i] - ym), 0);
  const b = Sxy / Sxx, a = ym - b * Xm;
  const sb = SX / Math.sqrt(Sxx), sa = SX * Math.sqrt(1 / N + Xm * Xm / Sxx);
  const chi2 = y.reduce((s, v, i) => s + ((v - a - b * X[i]) / SX) ** 2, 0);
  return { rows, T, X, y, N, Xm, ym, Sxx, Sxy, b, a, sb, sa, chi2 };
})();

// Jupiter’s Galilean moons: semi-major axis (10³ km) and sidereal period (days), NASA fact sheet
const MOONS = [['Io', 421.8, 1.769], ['Europa', 671.1, 3.551], ['Ganymede', 1070.4, 7.155], ['Callisto', 1882.7, 16.689]];

/** Fresh ramp data from the bench (optionally with the sensor-zero error). */
const rampRows = (r, sys = null, settings) => B.makeData('ramp', { seed: r.int(1, 999999), sys, settings }).rows;

export default lesson({
  id: 'phys2210.L.2',
  title: 'Graphing and linearizing data',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment:** a cart on a 2.0° air track, released from rest, with a motion sensor reporting its position $x$ at times $t$ you choose. The readings are computed with realistic sensor noise, not measured.

Your eye can tell a straight line from a curve, but not one curve from another. So a lab **chooses its axes to make the expected law a straight line**. For constant acceleration from rest,

$$x = \tfrac12 a\,t^2 \quad\Longrightarrow\quad \underbrace{x}_{y} = \underbrace{\tfrac12 a}_{\text{slope } B}\;\underbrace{t^2}_{X} + \underbrace{0}_{\text{intercept } A}$$

Plot $x$ against $t^2$, fit the straight line $y = A + BX$ by **least squares** — the line that minimizes $\chi^2 = \sum_i \big(y_i - A - BX_i\big)^2/\sigma_i^2$ — and the slope gives $a = 2B$, with an uncertainty. (Lab skills trained: modelling, and analysing and visualizing data.)`,
  symbols: [
    { tex: 'x', text: 'the cart’s position along the track, measured from where it starts, in m' },
    { tex: 't', text: 'the time since release, in s' },
    { tex: 'a', text: 'the cart’s acceleration, in m/s² — here $g\\sin\\theta = 0.342\\ \\text{m/s}^2$ for $\\theta = 2.0^\\circ$' },
    { tex: 'X,\\ y', text: 'what goes on the horizontal and vertical axes: here $X = t^2$ (in s²) and $y = x$ (in m)' },
    { tex: 'B,\\ A', text: 'the slope and intercept of the fitted line; the slope carries the physics ($B = a/2$), the intercept any offset' },
    { tex: '\\sigma_i', text: 'the uncertainty (error bar) of the $i$th point — here the sensor’s 2 mm' },
    { tex: '\\chi^2', text: 'chi-squared: the sum of each point’s miss from the line in units of its error bar, squared. With honest error bars and the right model, $\\chi^2$ divided by the degrees of freedom ($N - 2$) comes out near 1' },
  ],
  why: 'Galileo slowed free fall down with inclined planes to find x ∝ t²; every lab since has found its laws the same way — make the theory a straight line and see whether the data agree.',
  visual: {
    type: 'lab-bench',
    title: 'Galileo’s inclined plane, with a motion sensor',
    lead: t`Six positions are already in the table. The upper plot shows them on the axes you choose, with ±2 mm error bars and the least-squares line; the strip below it shows the **residuals**, each point minus the line.`,
    tasks: [
      'Switch the plot to x against t: the points curve away from any straight line, the residuals form a smile, and χ²/dof runs into the thousands.',
      'Try ln x against ln t: a straight line whose slope is the power of t — 2 — found without knowing it in advance.',
      'Back on x against t², turn on the sensor-zero error: the line shifts up by the 5 cm offset, but its slope (and a) does not move.',
    ],
    params: { exp: 'ramp', seed: 33, residuals: true },
  },
  example: {
    prompt: t`The motion sensor reports these positions: ${EX.rows.map((r) => `$t = ${r.s.toFixed(1)}$ s, $x = ${r.R[0].toFixed(3)}$ m`).join('; ')}. Each is uncertain by $\sigma = 2$ mm. Find the acceleration with its uncertainty, and test the result against $g\sin\theta = 0.342\ \text{m/s}^2$.`,
    visual: plot('ramp', EX.rows, { residuals: true, caption: 'Position against time squared, with ±2 mm error bars and the least-squares line; residuals below.' }),
    steps: [
      { label: 'Linearize', text: t`The theory $x = \tfrac12 a t^2$ is a straight line if $X = t^2$: so tabulate $X = ${EX.X.map((v) => sf(v, 3)).join(',\\ ')}\ \text{s}^2$. Six points, all on one line within their error bars — the picture is the first test.` },
      { label: 'Centre the data', text: t`$\bar X = ${sf(EX.Xm, 4)}\ \text{s}^2$, $\bar y = ${sf(EX.ym, 4)}$ m, and $\sum (X_i - \bar X)^2 = ${sf(EX.Sxx, 4)}\ \text{s}^4$.` },
      { label: 'Slope', text: t`With equal error bars the least-squares slope is $B = \dfrac{\sum (X_i - \bar X)(y_i - \bar y)}{\sum (X_i - \bar X)^2} = \dfrac{${sf(EX.Sxy, 4)}}{${sf(EX.Sxx, 4)}} = ${sf(EX.b, 4)}\ \text{m/s}^2$, and the intercept $A = \bar y - B\bar X = ${EX.a.toFixed(4)}$ m.` },
      { label: 'Uncertainties', text: t`$\sigma_B = \dfrac{\sigma}{\sqrt{\sum (X_i - \bar X)^2}} = \dfrac{0.002}{\sqrt{${sf(EX.Sxx, 4)}}} = ${sf(EX.sb, 2)}\ \text{m/s}^2$ and $\sigma_A = \sigma\sqrt{\tfrac1N + \tfrac{\bar X^2}{\sum (X_i - \bar X)^2}} = ${sf(EX.sa, 2)}$ m. The intercept is zero within its uncertainty: the sensor’s zero is where the cart started.` },
      { label: 'Goodness of fit', text: t`The six residuals, in units of 2 mm, give $\chi^2 = ${EX.chi2.toFixed(1)}$ for $N - 2 = 4$ degrees of freedom: $\chi^2/\text{dof} = ${(EX.chi2 / 4).toFixed(2)}$, close to 1. A straight line is a good model, and the 2 mm error bars are honest.` },
      { label: 'Result', text: t`$a = 2B = ${pmTeX(2 * EX.b, 2 * EX.sb, t`\text{m/s}^2`)}$ (doubling a number doubles its uncertainty). It is $|${B.pm(2 * EX.b, 2 * EX.sb).v} - ${sf(A_TRUE, 5)}|/${B.pm(2 * EX.b, 2 * EX.sb).s} = ${(Math.abs(2 * EX.b - A_TRUE) / (2 * EX.sb)).toFixed(1)}$ standard uncertainties from $g\sin\theta = ${sf(A_TRUE, 4)}\ \text{m/s}^2$: agreement.` },
    ],
    answer: t`$a = ${pmTeX(2 * EX.b, 2 * EX.sb, t`\text{m/s}^2`)}$, consistent with $g\sin 2.0^\circ = ${sf(A_TRUE, 4)}\ \text{m/s}^2$; $\chi^2/\text{dof} = ${(EX.chi2 / 4).toFixed(2)}$.`,
  },
  practice: [
    mcq({
      id: 'which-axes', difficulty: 1,
      prompt: t`A spring’s period should obey $T = 2\pi\sqrt{m/k}$. You time it with several masses $m$. Which graph should be a **straight line through the origin**, with a slope that gives $k$?`,
      choices: [t`$T^2$ against $m$`, t`$T$ against $m$`, t`$T$ against $m^2$`, t`$\sqrt T$ against $m$`],
      answer: 0,
      why: {
        1: t`$T \propto \sqrt m$ curves over: equal steps in $m$ give shrinking steps in $T$.`,
        2: t`That squares the wrong side. Square both sides of $T = 2\pi\sqrt{m/k}$ instead.`,
        3: t`$\sqrt T \propto m^{1/4}$ — still a curve against $m$.`,
      },
      hints: [t`Rearrange the law so that one side is a constant times $m$.`, t`Square both sides: $T^2 = \dfrac{4\pi^2}{k}\,m$.`],
      teach: 'Rearrange the expected law into y = (constant) × X, then plot y against X: a straight line, with the constant as its slope.',
      explain: t`$T^2 = \dfrac{4\pi^2}{k}\,m$: plotting $T^2$ against $m$ gives a straight line through the origin with slope $4\pi^2/k$, so $k = 4\pi^2/\text{slope}$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 0.5], y: [0, 1.25], xlabel: 'm (kg)', ylabel: 'T (s)', curves: [{ fn: '2*pi*sqrt(x/15)', color: 'accent', domain: [0, 0.5] }], points: [0.05, 0.1, 0.2, 0.3, 0.4].map((m) => ({ x: m, y: +(2 * Math.PI * Math.sqrt(m / 15)).toFixed(4), r: 4, color: 'accent' })) }, caption: 'T against m for a 15 N/m spring: a curve. Which axes would straighten it?' },
    }),
    mcq({
      id: 'loglog-law', difficulty: 2,
      prompt: t`You plot $\ln y$ against $\ln x$ for some data and get a straight line of slope $-2$. What law do the data follow?`,
      choices: [t`$y \propto x^{-2}$, an inverse square law`, t`$y = -2x + \text{constant}$`, t`$y \propto e^{-2x}$`, t`$y \propto x^{-1/2}$`],
      answer: 0,
      why: {
        1: t`That is a straight line on *ordinary* axes. On log–log axes the slope is a power: $\ln y = n\ln x + \ln C$ means $y = Cx^n$.`,
        2: t`An exponential is straight on a *semi*-log plot ($\ln y$ against $x$), not on log–log axes.`,
        3: t`The slope is the power itself: $-2$, not its reciprocal.`,
      },
      hints: [t`Take logs of $y = Cx^n$.`, t`$\ln y = n\ln x + \ln C$: the slope on log–log axes is the power $n$.`],
      teach: 'On log–log axes a power law y = Cxⁿ becomes a straight line whose slope is the power n.',
      explain: t`$\ln y = -2\ln x + \ln C$ is $y = C x^{-2}$: the intensity of light from a small lamp, and the pull of gravity, both fall off this way with distance.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.2, 2.6], y: [-5.6, 1.2], xlabel: 'ln x', ylabel: 'ln y', curves: [{ fn: '0.5 - 2*x', color: 'accent', domain: [-0.2, 2.6], dash: true }], points: [0.1, 0.6, 1.1, 1.6, 2.1].map((v, i) => ({ x: v, y: +(0.5 - 2 * v + [0.06, -0.05, 0.04, -0.03, 0.05][i]).toFixed(3), r: 4, color: 'accent' })) }, caption: 'Data on log–log axes with the best straight line (dashed): slope −2.' },
    }),
    num({
      id: 'slope-to-a', difficulty: 2,
      gen(r) {
        const rows = rampRows(r);
        const f = B.analyse('ramp', rows, {}).series[0].fit;
        const b = +f.b.toFixed(4), sb = +f.sb.toPrecision(2);
        return {
          prompt: t`Fitting $x$ against $t^2$ for the cart gives a slope $B = ${b.toFixed(4)} \pm ${sb}\ \text{m/s}^2$. What is the cart’s acceleration $a$? (Its uncertainty follows the same rule.)`,
          answer: 2 * b, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: b, feedback: t`The slope of $x$ against $t^2$ is $\tfrac12 a$, not $a$: compare $x = \tfrac12 a\,t^2$ with $y = BX$.` }, { value: b / 2, feedback: t`Halving goes the wrong way: $B = \tfrac12 a$, so $a = 2B$.` }],
          hints: [t`Match $x = \tfrac12 a\,t^2$ to $y = B X$ with $X = t^2$.`],
          teach: 'Read the physics off the slope by matching the law to y = A + BX term by term.',
          explain: t`$B = \tfrac12 a$, so $a = 2B = ${(2 * b).toFixed(4)}\ \text{m/s}^2$, uncertain by $2\sigma_B = ${(2 * sb).toPrecision(2)}\ \text{m/s}^2$.`,
          visual: plot('ramp', rows, { caption: 'The data and the least-squares line on x–t² axes.' }),
        };
      },
    }),
    num({
      id: 'hand-fit', difficulty: 3,
      gen(r) {
        const rows = rampRows(r, 'zero', [Math.SQRT2, 2, Math.sqrt(6)]);
        const y = rows.map((q) => q.R[0]);
        const b = (y[2] - y[0]) / 4;
        return {
          prompt: t`Three sensor readings, at $t^2 = 2.00$, $4.00$ and $6.00\ \text{s}^2$, give $x = ${y.map((v) => v.toFixed(3)).join('$, $')}$ m, with equal error bars. (This sensor’s zero is not at the release point, so the line need not pass through the origin.) What is the least-squares slope $B$ of $x$ against $t^2$?`,
          answer: b, units: 'm/s^2', tol: { rel: 0.003 },
          errors: [
            { value: y[2] / 6, feedback: 'That is the slope of a line from the origin to the last point. Least squares uses every point, and lets the intercept float.' },
            { value: (y[0] / 2 + y[1] / 4 + y[2] / 6) / 3, feedback: 'Averaging x/t² for each point forces every point’s line through the origin. Use the least-squares slope.' },
          ],
          hints: [t`$\bar X = 4.00\ \text{s}^2$, so the deviations $X_i - \bar X$ are $-2, 0, +2$ and $\sum (X_i - \bar X)^2 = 8$.`, t`$B = \dfrac{\sum (X_i - \bar X)(y_i - \bar y)}{8} = \dfrac{-2(y_1 - \bar y) + 2(y_3 - \bar y)}{8} = \dfrac{y_3 - y_1}{4}$.`],
          teach: t`The least-squares slope is $\sum (X_i - \bar X)(y_i - \bar y)/\sum (X_i - \bar X)^2$; for three evenly spaced points it is the slope between the two ends.`,
          explain: t`$B = (${y[2].toFixed(3)} - ${y[0].toFixed(3)})/4 = ${b.toFixed(4)}\ \text{m/s}^2$, so $a = 2B = ${(2 * b).toFixed(3)}\ \text{m/s}^2$. The middle point does not affect the slope at all — it sets the intercept.`,
          visual: plot('ramp', rows, { fit: false, sys: true, caption: 'The three readings with ±2 mm error bars (no line drawn).' }),
        };
      },
    }),
    mcq({
      id: 'chi2-curved', difficulty: 2,
      gen(r) {
        const rows = rampRows(r);
        const f = B.analyse('ramp', rows, { axes: 'raw' }).series[0].fit;
        return {
          prompt: t`A classmate fits a straight line to the cart’s $x$ against $t$ (not $t^2$). The line passes close to every point, but the fit reports $\chi^2/\text{dof} = ${Math.round(f.chi2r)}$, and the residuals form the U shape in the picture. What does that mean?`,
          choices: [
            t`The model is wrong: $x$ is not a straight-line function of $t$, which the residuals’ pattern shows`,
            'The fit is excellent: the line passes close to every point',
            'The error bars are too large',
            t`Nothing: $\chi^2$ depends only on how many points there are`,
          ],
          answer: 0,
          why: {
            1: 'Close by eye is not close by the error bars: each point misses the line by many standard deviations, and the misses follow a pattern.',
            2: t`Error bars too large would make $\chi^2/\text{dof}$ much *smaller* than 1.`,
            3: t`$\chi^2$ adds up each point’s miss in units of its error bar; with the right model it comes out near the number of degrees of freedom.`,
          },
          hints: [t`What $\chi^2/\text{dof}$ would a good model with honest error bars give?`, 'Random scatter makes residuals of random sign. What does a smooth arch of residuals say?'],
          teach: t`$\chi^2/\text{dof} \gg 1$ with a pattern in the residuals means the model is wrong (or the error bars far too small), however good the line looks by eye.`,
          explain: t`$x \propto t^2$ curves upward, so a straight line in $t$ runs above the data in the middle and below them at the ends: the residuals are positive at both ends and negative between — a systematic U shape — and $\chi^2/\text{dof} = ${Math.round(f.chi2r)}$ instead of about 1.`,
          visual: plot('ramp', rows, { axes: 'raw', residuals: true, caption: 'x against t with a straight-line fit; residuals (each point minus the line) below.' }),
        };
      },
    }),
    mcq({
      id: 'intercept-offset', difficulty: 2,
      gen(r) {
        const rows = rampRows(r, 'zero');
        const f = B.analyse('ramp', rows, { sys: 'zero' }).series[0].fit;
        return {
          prompt: t`A second run gives $x$ against $t^2$ with slope $B = ${f.b.toFixed(4)} \pm ${f.sb.toPrecision(2)}\ \text{m/s}^2$ and intercept $A = ${f.a.toFixed(4)} \pm ${f.sa.toPrecision(2)}$ m. What should you conclude?`,
          choices: [
            'The positions are offset: at t = 0 the cart was about 5 cm from the sensor’s zero. The slope, and so a, is unaffected',
            'The intercept proves the fit is wrong: a physical law must pass through the origin, so refit with A = 0',
            't is not zero when the cart is released, so the acceleration must be corrected by A',
            'Subtract A from the slope to correct the acceleration',
          ],
          answer: 0,
          why: {
            1: 'Forcing the line through the origin when the data do not go there tilts the line and biases the slope. A real offset belongs in the intercept.',
            2: 'A constant offset in x shifts every point up by the same amount; it does not tell you about the timing, and it leaves the slope alone.',
            3: t`$A$ is a length and $B$ an acceleration: they cannot be subtracted. And the slope needs no correction — the offset is entirely in $A$.`,
          },
          hints: [t`$x = x_0 + \tfrac12 a t^2$: which term becomes the intercept?`],
          teach: 'A constant offset in what you plot vertically shows up in the intercept and leaves the slope — and the physics in it — untouched.',
          explain: t`The intercept, ${(100 * f.a).toFixed(1)} ± ${(100 * f.sa).toPrecision(1)} cm, says the sensor’s zero sits about 5 cm behind the release point. Keep the intercept free: $a = 2B$ is still right.`,
          visual: plot('ramp', rows, { sys: true, residuals: true, caption: 'x against t² for the second run, with its least-squares line.' }),
        };
      },
    }),
    code({
      id: 'polyfit-a', difficulty: 2,
      gen(r) {
        const rows = rampRows(r);
        const ts = rows.map((q) => q.s), xs = rows.map((q) => q.R[0]);
        const f = B.fitLine(ts.map((v) => v * v), xs);       // unweighted, σ from the scatter: numpy.polyfit(cov=True)
        const data = t`import numpy as np

t = np.array([${ts.map((v) => v.toFixed(1)).join(', ')}])        # s
x = np.array([${xs.map((v) => v.toFixed(3)).join(', ')}])   # m
`;
        return {
          prompt: t`Fit a straight line to $x$ against $t^2$ with \`np.polyfit(X, y, 1, cov=True)\`, which returns the coefficients (slope first) and their covariance matrix. Set \`a\` to the cart’s acceleration and \`sigma_a\` to its standard uncertainty (the square root of the slope’s variance, doubled), and print them.`,
          starter: t`${data}
# fit x against t**2, then set a and sigma_a
a = 0.0
sigma_a = 0.0
print(a, sigma_a)
`,
          answer: t`${data}
p, C = np.polyfit(t**2, x, 1, cov=True)
B, sB = p[0], np.sqrt(C[0, 0])
a = 2 * B
sigma_a = 2 * sB
print(f"a = {a:.4f} ± {sigma_a:.4f} m/s²")
`,
          tests: [
            { name: `a is twice the slope of x against t² (${(2 * f.b).toFixed(4)} m/s²)`, code: `abs(a - ${2 * f.b}) < 1e-6` },
            { name: `\`sigma_a\` is twice the slope’s standard error (${(2 * f.sb).toPrecision(2)} m/s²)`, code: `abs(sigma_a - ${2 * f.sb}) < 1e-7` },
            { name: 'the program prints the result', code: `"${(2 * f.b).toFixed(4)}" in _stdout` },
          ],
          hints: [t`\`p, C = np.polyfit(t**2, x, 1, cov=True)\` — \`p[0]\` is the slope, \`C[0, 0]\` its variance.`, t`\`a = 2 * p[0]\` and \`sigma_a = 2 * np.sqrt(C[0, 0])\`.`],
          teach: 'np.polyfit fits a polynomial by least squares; with cov=True it also returns the covariance, whose diagonal holds the squared uncertainties of the coefficients.',
          explain: t`The slope is $\tfrac12 a$, so both $a$ and its uncertainty are twice the slope’s. With no weights, \`cov=True\` estimates the scatter from the residuals themselves — here it comes out close to the sensor’s real 2 mm.`,
          visual: plot('ramp', rows, { fit: false, caption: 'The data your program fits.' }),
        };
      },
    }),
    num({
      id: 'loglog-power', difficulty: 2,
      gen(r) {
        const rows = rampRows(r, null, [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]);
        const x1 = rows[1].R[0], x2 = rows[5].R[0];
        const n = Math.log(x2 / x1) / Math.log(3);
        return {
          prompt: t`Without assuming $x \propto t^2$, find the power $n$ in $x \propto t^n$ from two readings: $x = ${x1.toFixed(3)}$ m at $t = 1.0$ s and $x = ${x2.toFixed(3)}$ m at $t = 3.0$ s.`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: x2 / x1, feedback: t`That is the ratio of the positions. The power is the ratio of the *logarithms*: $n = \ln(x_2/x_1)/\ln(t_2/t_1)$.` }, { value: (x2 - x1) / 2, feedback: 'That is the ordinary slope, Δx/Δt. On log–log axes use the change in ln x over the change in ln t.' }],
          hints: [t`If $x = Ct^n$, then $\ln x = n\ln t + \ln C$: the slope on log–log axes is $n$.`, t`$n = \dfrac{\ln x_2 - \ln x_1}{\ln t_2 - \ln t_1} = \dfrac{\ln(${x2.toFixed(3)}/${x1.toFixed(3)})}{\ln 3}$.`],
          teach: 'The slope of ln y against ln x is the power in y ∝ xⁿ — a way to find an unknown exponent.',
          explain: t`$n = \ln(${(x2 / x1).toFixed(3)})/\ln 3 = ${n.toFixed(3)}$ — two, as Galileo found, within the 2 mm sensor noise.`,
          visual: plot('ramp', rows, { axes: 'loglog', fit: false, caption: 'ln x against ln t for the whole run (no line drawn).' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-kepler', difficulty: 3, transfer: true,
      gen(r) {
        const [i, j] = r.pick([[0, 3], [0, 2], [1, 3], [0, 1], [1, 2], [2, 3]]);
        const [n1, a1, T1] = MOONS[i], [n2, a2, T2] = MOONS[j];
        const n = Math.log(T2 / T1) / Math.log(a2 / a1);
        return {
          prompt: t`Kepler’s third law says a moon’s period $T$ grows as a power of its orbit’s size $a$: $T \propto a^n$. From NASA’s data for two of Jupiter’s moons — ${n1}: $a = ${a1}\times10^3$ km, $T = ${T1}$ days; ${n2}: $a = ${a2}\times10^3$ km, $T = ${T2}$ days — find $n$.`,
          answer: n, tol: { rel: 0.005 },
          errors: [{ value: 1 / n, feedback: t`Upside down: $T \propto a^n$ means $n = \ln(T_2/T_1)/\ln(a_2/a_1)$ — logs of the periods on top.` }, { value: (T2 / T1) / (a2 / a1), feedback: 'Take logarithms of the ratios before dividing.' }],
          hints: [t`$T = Ca^n$ gives $\ln T = n\ln a + \ln C$: a straight line on log–log axes with slope $n$.`, t`$n = \dfrac{\ln(T_2/T_1)}{\ln(a_2/a_1)} = \dfrac{\ln(${T2}/${T1})}{\ln(${a2}/${a1})}$.`],
          teach: 'A log–log slope between two well-separated points measures the power in a power law.',
          explain: t`$n = \ln(${(T2 / T1).toFixed(3)})/\ln(${(a2 / a1).toFixed(3)}) = ${n.toFixed(3)}$: $T \propto a^{3/2}$, or $T^2 \propto a^3$ — Kepler’s third law, which Newton’s gravity explains.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [5.9, 7.7], y: [0.3, 3.1], xlabel: 'ln(a / 10³ km)', ylabel: 'ln(T / days)',
              points: MOONS.map(([name, a, T]) => ({ x: +Math.log(a).toFixed(4), y: +Math.log(T).toFixed(4), r: 4.5, color: 'accent', label: name, labelDx: 8, labelDy: 10 })),
            },
            caption: 'Jupiter’s four large moons on log–log axes (NASA fact-sheet values). Real data, measured by telescope and spacecraft.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-chi2-small', difficulty: 2,
      prompt: t`A classmate fits $x$ against $t^2$ for six points and reports $\chi^2/\text{dof} = 0.04$, saying it is “the best fit in the class”. What is the most likely explanation?`,
      choices: [
        'The error bars are far too large: the points scatter much less than the bars claim',
        'An outstanding fit: the smaller χ², the better the experiment',
        'The model is wrong: x is not proportional to t²',
        'Too few points: χ² is always small for six points',
      ],
      answer: 0,
      why: {
        1: t`With honest error bars and the right model, $\chi^2/\text{dof}$ scatters around 1; 0.04 means each point sits about $\sqrt{0.04} = 0.2$ of an error bar from the line — the bars are about five times too big.`,
        2: t`A wrong model makes $\chi^2/\text{dof}$ much *larger* than 1, not smaller.`,
        3: t`For four degrees of freedom $\chi^2/\text{dof}$ is usually between about 0.1 and 2.4; 0.04 happens by chance less than 1% of the time.`,
      },
      hints: [t`What value of $\chi^2/\text{dof}$ do honest error bars and the right model give?`, t`$\chi^2$ sums (miss ÷ error bar)². What makes every term tiny?`],
      teach: t`$\chi^2/\text{dof}$ well below 1 means the error bars are overestimated (or the points are not independent) — not an especially good fit.`,
      explain: t`Overestimated error bars make every term (miss ÷ σ)² small. Here the bars were drawn ±10 mm when the sensor scatters by about 2 mm: $\chi^2/\text{dof}$ falls by $5^2 = 25$. The slope is fine, but its quoted uncertainty is five times too large.`,
      visual: plot('ramp', B.makeData('ramp', { seed: 33 }).rows, { inflate: 5, residuals: true, caption: 'Six points with ±10 mm error bars and the least-squares line; below, each point’s miss from the line, with its error bar.' }),
    }),
    num({
      id: 'cp-drag-power', difficulty: 3,
      gen(r) {
        const s = r.pick([0.47, 0.48, 0.49, 0.51, 0.52]), ss = r.pick([0.02, 0.03]);
        const n = 1 / s;
        const pts = [1, 2, 3, 4, 5].map((k, i) => ({ x: +Math.log(k * 0.9).toFixed(4), y: +(Math.log(1.05) + s * Math.log(k * 0.9) + [0.015, -0.012, 0.01, -0.016, 0.008][i]).toFixed(4), r: 4, color: 'accent' }));
        return {
          prompt: t`Nested paper coffee filters fall at a terminal speed $v_t$ where drag balances weight. With 1 to 5 filters stacked, the log–log plot of $v_t$ against mass $m$ has slope $${s} \pm ${ss}$. If the drag force is $F = b\,v^p$, what is $p$?`,
          answer: n, tol: { rel: 0.01 },
          errors: [{ value: s, feedback: t`That is the slope itself. At terminal speed $mg = b v_t^{\,p}$, so $v_t \propto m^{1/p}$: the slope is $1/p$.` }, { value: 2 * s, feedback: t`At terminal speed $mg = bv_t^{\,p}$, so $v_t = (mg/b)^{1/p}$: the log–log slope is $1/p$.` }],
          hints: [t`At terminal speed the drag equals the weight: $b\,v_t^{\,p} = mg$.`, t`So $v_t = (g/b)^{1/p}\,m^{1/p}$: on log–log axes the slope is $1/p$.`],
          teach: 'When the quantity you plot depends on the one you want through a power, the log–log slope gives that power directly.',
          explain: t`The slope is $1/p$, so $p = 1/${s} = ${n.toFixed(2)}$ (uncertain by about ${(ss / s ** 2).toFixed(2)}): drag on a coffee filter grows as the square of its speed, as quadratic drag predicts.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 1.7], y: [-0.2, 1.1], xlabel: 'ln(m / g)', ylabel: 'ln(vₜ / (m/s))', points: pts }, caption: 'ln of the terminal speed against ln of the mass for 1–5 nested filters (about 0.9 g each). Illustrative data.' },
        };
      },
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 8 (least-squares fitting) and ch. 12 (the χ² test)'),
    SOURCES.polyfit,
    { label: 'NASA NSSDCA, Jovian Satellite Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html' },
    SOURCES.openstax('3.4', '3-4-motion-with-constant-acceleration', 'Motion with constant acceleration'),
    SOURCES.aapt,
  ],
});
