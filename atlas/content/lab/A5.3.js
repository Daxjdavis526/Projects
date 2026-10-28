// Nonlinear fits — models nonlinear in their parameters (an exponential's
// time constant, a sine's frequency): χ²(p) minimized iteratively from a
// starting guess (Gauss–Newton / Levenberg–Marquardt), starting guesses read
// off the data, local minima, why taking logs fails once there is an offset,
// and uncertainties from the curvature of χ² (Δχ² = 1). A thermocouple's
// response time, a propellant line's leak-down test, and a profile scan in
// NumPy. curve_fit's own defaults are left to lab.A12.1 (and prog.P14.1).
// Every number is computed here (seeded synthetic data; Levenberg–Marquardt
// from prog/_fit.js, which was checked against curve_fit).
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { lsq } from '../prog/_fit.js';
import { normals, linfit, dataGraph, r6, SIMNOTE, table } from './_labf.js';

const t = String.raw;

// ── Explore: a thermocouple plunged into hot gas, T = 20 °C + ΔT(1 − e^(−t/τ)), σ = 1.5 K (synthetic: ΔT = 180 K, τ = 0.80 s) ──
const TC_t = Array.from({ length: 17 }, (_, i) => 0.25 * i);
const TC_T = (() => { const z = normals(62); return TC_t.map((x) => +(20 + 180 * (1 - Math.exp(-x / 0.8)) + 1.5 * z()).toFixed(1)); })();
const TC = lsq((x, p) => 20 + p[0] * (1 - Math.exp(-x / p[1])), TC_t, TC_T, 1.5, [170, 1]);
const chiExpr = TC_t.map((x, i) => `((${TC_T[i]} - 20 - dT*(1 - exp(-${x}/tau)))/1.5)^2`).join(' + ');

// ── the worked example: a leak-down test, p = p_a + Δp e^(−t/τ), σ = 2 kPa (synthetic: p_a = 101.3 kPa, Δp = 600 kPa, τ = 45 s) ──
const LD_t = Array.from({ length: 16 }, (_, i) => 10 * i);
const LD_p = (() => { const z = normals(3); return LD_t.map((x) => +(101.3 + 600 * Math.exp(-x / 45) + 2 * z()).toFixed(1)); })();
const ldModel = (x, p) => p[0] + p[1] * Math.exp(-x / p[2]);
const G0 = [LD_p[15], LD_p[0] - LD_p[15]];
// starting τ: where the excess over the tail first falls to 1/e of its start, by linear interpolation
const exc = LD_p.map((v) => v - G0[0]);
const tauGuess = (() => { const lvl = exc[0] / Math.E; for (let i = 1; i < exc.length; i++) if (exc[i] < lvl) return LD_t[i - 1] + (10 * (exc[i - 1] - lvl)) / (exc[i - 1] - exc[i]); return 40; })();
const LD = lsq(ldModel, LD_t, LD_p, 2, [G0[0], G0[1], tauGuess]);
const LDnaive = linfit(LD_t, LD_p.map(Math.log));
const rhoAT = LD.cov[0][2] / (LD.err[0] * LD.err[2]);

// the χ² of a sine’s frequency: data from f₀ = 1.00 Hz sampled 20 times in 4 s (noise-free, σ = 0.1)
const SIN_t = Array.from({ length: 20 }, (_, i) => 0.2 * i + 0.1);
const sinChi = SIN_t.map((x) => `(sin(2*pi*${r6(x)}) - sin(2*pi*x*${r6(x)}))^2`).join(' + ');

export default lesson({
  id: 'lab.A5.3',
  title: 'Nonlinear fits',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`A straight line, or any model of the form $p_1\phi_1(x) + p_2\phi_2(x) + \ldots$, is **linear in its parameters**, and least squares then has a closed-form answer. Most physics is not: in $y = A e^{-t/\tau} + C$ the time constant $\tau$ sits inside the exponential. You still minimize the same quantity,

$$\chi^2(\mathbf p) = \sum_{i=1}^{N} \left(\frac{y_i - f(x_i;\mathbf p)}{\sigma_i}\right)^2$$

but **iteratively**: start from a guess, approximate the model by its tangent (linear) version near the guess, solve that linear problem for a step, and repeat (Gauss–Newton; Levenberg–Marquardt shortens the steps when they overshoot). The result is only as good as the start — a bad guess can settle in a local minimum. The uncertainty of each parameter comes from how sharply $\chi^2$ rises around its minimum: the values with $\chi^2 \le \chi^2_{\min} + 1$ span $\pm 1\sigma$.`,
  symbols: [
    { tex: 'f(x;\\mathbf p)', text: 'the model: the value it predicts at $x$ for the parameters $\\mathbf p = (p_1, p_2, \\ldots)$' },
    { tex: '\\mathbf p', text: 'the parameters being fitted — amplitude, time constant, offset …, each with its own unit' },
    { tex: 'x_i,\\ y_i', text: 'the $i$-th point: the setting (exact) and the measured value' },
    { tex: '\\sigma_i', text: 'the standard uncertainty of $y_i$, in units of $y$' },
    { tex: '\\chi^2', text: 'the weighted sum of squared misfits (dimensionless); its minimum value is $\\chi^2_{\\min}$' },
    { tex: 'N', text: 'the number of data points' },
  ],
  why: t`Decay times, resonance widths, response times, orbital elements: the numbers experiments exist to measure usually sit inside a nonlinear model.`,
  visual: {
    type: 'graph',
    title: 'Be the fitting algorithm',
    lead: t`A thermocouple at $20\ ^\circ\text{C}$ is plunged into hot gas at $t = 0$ and lags behind it: $T(t) = 20\ ^\circ\text{C} + \Delta T\,(1 - e^{-t/\tau})$. The dots are its readings, each $\pm 1.5$ K. Move the two sliders to make $\chi^2$ as small as you can — exactly what a fitting routine does, one small step at a time.`,
    tasks: [
      'Start with τ alone: too short and the curve rises too fast at the start; too long and it is still climbing at the end. χ² falls steeply toward the right value.',
      'Find the smallest χ² you can (about 10, for 17 − 2 = 15 degrees of freedom). Then move τ until χ² has risen by exactly 1: that step is the 1σ uncertainty of τ, about 0.011 s.',
      'Notice that the best ΔT changes when you change τ: the two parameters are correlated, so each must be re-adjusted as the other moves.',
    ],
    params: {
      aspect: 'wide', x: [-0.15, 4.15], y: [0, 215], xlabel: 't (s)', ylabel: 'T (°C)', axesAt: 'edge',
      sliders: [
        { key: 'dT', label: t`Temperature rise $\Delta T$`, min: 150, max: 210, step: 0.1, value: 165, unit: '\\mathrm{K}', explain: 'How far the thermocouple finally rises above its starting 20 °C: the gas temperature minus 20 °C.' },
        { key: 'tau', label: t`Time constant $\tau$`, min: 0.4, max: 1.6, step: 0.001, value: 1.1, unit: '\\mathrm{s}', explain: 'The time to cover 63% of the rise: set by the junction’s heat capacity and how fast the gas heats it.' },
      ],
      curves: [{ fn: '20 + dT*(1 - exp(-x/tau))', color: 'gold', width: 2.2, domain: [0, 4.15] }],
      points: TC_t.map((x, i) => ({ x, y: TC_T[i], r: 3.5, color: 'accent' })),
      readouts: [
        { label: '$\\chi^2$', expr: chiExpr, digits: 4 },
        { label: '$\\chi^2/(N - 2)$', expr: `(${chiExpr})/15`, digits: 3 },
      ],
    },
    caption: t`Synthetic readings from a first-order response with Gaussian noise of 1.5 K. A real bead thermocouple’s lag also depends on gas speed, and radiation pulls its reading below the gas temperature. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A leak-down test: a propellant line is pressurized, isolated, and allowed to leak to the atmosphere through a fitting under test. A transducer logs its absolute pressure every 10 s with $\sigma = 2$ kPa:

${table([[t`t\ (\text{s})`, ...LD_t.slice(0, 8).map(String)], [t`p\ (\text{kPa})`, ...LD_p.slice(0, 8).map((v) => v.toFixed(1))]])}
${table([[t`t\ (\text{s})`, ...LD_t.slice(8).map(String)], [t`p\ (\text{kPa})`, ...LD_p.slice(8).map((v) => v.toFixed(1))]])}

Fit $p = p_a + \Delta p\,e^{-t/\tau}$ and report the leak's time constant $\tau$.`,
    visual: { type: 'graph', params: dataGraph({ xs: LD_t, ys: LD_p, sy: 2, fn: `${r6(LD.p[0])} + ${r6(LD.p[1])}*exp(-x/${r6(LD.p[2])})`, xlabel: 't (s)', ylabel: 'p (kPa)', y: [0, 760], hlines: [{ y: r6(LD.p[0]), color: 'ink3' }] }), caption: t`The dashed line is the fitted floor $p_a$. Synthetic data with Gaussian noise of 2 kPa; the error bars are about the size of the dots. A real leak’s flow changes character (choked, then not) as the pressure falls, so a single exponential is itself an approximation. ${SIMNOTE}` },
    steps: [
      { label: 'Why not take logs', text: t`$\ln p$ is not a straight line in $t$ — the constant $p_a$ is in the way. Fitting $\ln p$ against $t$ anyway gives $\tau = ${(-1 / LDnaive.b).toFixed(0)}$ s, nearly double the truth: the tail flattening toward $p_a$ looks like a slow decay.` },
      { label: 'Starting guesses', text: t`Read them off the data. The tail is still falling, but $p_a \approx ${G0[0].toFixed(1)}$ kPa (the last point) is a start; then $\Delta p \approx ${LD_p[0]} - ${G0[0].toFixed(1)} = ${G0[1].toFixed(1)}$ kPa; and the excess $p - p_a$ falls to $1/e$ of its start after about $${tauGuess.toFixed(0)}$ s, so $\tau \approx ${tauGuess.toFixed(0)}$ s.` },
      { label: 'Iterate', text: t`From that start, Levenberg–Marquardt converges in a few steps to $p_a = ${LD.p[0].toFixed(1)}$ kPa, $\Delta p = ${LD.p[1].toFixed(1)}$ kPa, $\tau = ${LD.p[2].toFixed(2)}$ s.` },
      { label: 'Uncertainties', text: t`The curvature of $\chi^2$ at the minimum (the matrix $(J^TWJ)^{-1}$, which is the $\Delta\chi^2 = 1$ rule in matrix form) gives $\sigma_{p_a} = ${LD.err[0].toFixed(1)}$ kPa, $\sigma_{\Delta p} = ${LD.err[1].toFixed(1)}$ kPa and $\sigma_\tau = ${LD.err[2].toFixed(2)}$ s.` },
      { label: 'Check the fit', text: t`$\chi^2_{\min} = ${LD.chi2.toFixed(1)}$ for $16 - 3 = 13$ degrees of freedom — about what honest $2$ kPa error bars predict ([χ² and reduced χ²](#/lesson/lab.A6.1)).` },
      { label: 'Correlation', text: t`$p_a$ and $\tau$ trade off: a slightly lower floor with a slightly slower decay fits almost as well. Their correlation coefficient is $${rhoAT.toFixed(2)}$ — see [covariance](#/lesson/lab.A6.3). Logging longer, until the pressure really settles, would break the tie.` },
    ],
    answer: t`$\tau = ${LD.p[2].toFixed(1)} \pm ${LD.err[2].toFixed(1)}$ s (with $p_a = ${LD.p[0].toFixed(0)} \pm ${LD.err[0].toFixed(0)}$ kPa), against $\approx ${(-1 / LDnaive.b).toFixed(0)}$ s from the wrongly linearized fit.`,
  },
  practice: [
    multi({
      id: 'linear-in-p', difficulty: 2,
      prompt: t`Which models are **linear in their parameters** $a$ and $b$ (so least squares has a closed form)? Select all that apply.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4], y: [-1.5, 5], xlabel: 'x', ylabel: 'y', curves: [{ fn: '0.5 + 0.3*x^2', color: 'accent', label: 'a + b x²', labelAt: 2.9, labelDx: 10, labelDy: 12 }, { fn: '1.2*sin(x) + 0.5*cos(x)', color: 'gold', label: 'a sin x + b cos x', labelAt: 0.9, labelDy: -6 }] }, caption: 'Curved in x is not the question: what matters is how the parameters enter.' },
      choices: [t`$y = a + bx^2$`, t`$y = a\sin x + b\cos x$`, t`$y = a\,e^{bx}$`, t`$y = a/(1 + bx)$`, t`$y = a + b\ln x$`],
      answer: [0, 1, 4],
      why: { 2: t`$b$ sits inside the exponential: $\partial y/\partial b = ax\,e^{bx}$ depends on $b$. (Taking logs makes it linear, but changes the error bars.)`, 3: t`$b$ is in the denominator; $\partial y/\partial b$ depends on $b$.` },
      hints: [t`A model is linear in its parameters when each one only multiplies a fixed function of $x$.`, t`Test: does $\partial y/\partial a$ or $\partial y/\partial b$ still contain $a$ or $b$?`],
      teach: t`“Linear” in least squares means linear in the parameters, not in $x$: $a + bx^2$ is a linear fit.`,
      explain: t`$a + bx^2$, $a\sin x + b\cos x$ and $a + b\ln x$ are all sums of parameters times fixed functions, solved exactly by the normal equations. $ae^{bx}$ and $a/(1 + bx)$ need iteration.`,
    }),
    num({
      id: 'guess-tau', difficulty: 2,
      gen(r) {
        const z = normals(r.int(1, 999999));
        const tau = r.float(2, 6, 0.1), A = r.int(40, 90), C = r.int(5, 15);
        const ts = Array.from({ length: 13 }, (_, i) => i * (tau * 4.5 / 12));
        const ys = ts.map((x) => +(C + A * Math.exp(-x / tau) + 0.8 * z()).toFixed(1));
        return {
          prompt: t`These readings follow $y = A e^{-t/\tau} + C$ with a background $C = ${C}$ known from a run with no source. Read a **starting guess** for $\tau$ off the graph: the time at which $y - C$ has fallen to $1/e \approx 0.37$ of its value at $t = 0$.`,
          visual: { type: 'graph', params: dataGraph({ xs: ts.map(r6), ys, xlabel: 't (ms)', ylabel: 'y (counts/ms)', hlines: [{ y: C, label: 'background C', color: 'ink3' }], y: [0, A + C + 8] }), caption: 'Synthetic decay data with its known background.' },
          answer: tau, units: 'ms', tol: { rel: 0.15 },
          hints: [t`At $t = 0$, $y - C \approx ${(ys[0] - C).toFixed(0)}$. Find where $y - C \approx ${(0.37 * (ys[0] - C)).toFixed(0)}$, i.e. $y \approx ${(C + 0.37 * (ys[0] - C)).toFixed(0)}$.`],
          teach: 'Starting guesses come from the data’s landmarks: the start, the floor, the 1/e point.',
          explain: t`$y$ crosses about $${(C + 0.37 * (ys[0] - C)).toFixed(0)}$ near $t \approx ${tau.toFixed(1)}$ ms (the true $\tau$ here). Anything within 10–20% is a fine start: the iteration does the rest.`,
        };
      },
    }),
    mcq({
      id: 'log-offset', difficulty: 2,
      prompt: t`You fit $\ln y$ against $t$ for data following $y = Ae^{-t/\tau} + C$ with $C > 0$, as if $C$ were zero. What goes wrong?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0.5, 4.8], xlabel: 't', ylabel: 'ln y', axesAt: 'edge', curves: [{ fn: 'ln(100*exp(-x/2) + 5)', color: 'accent', label: 'ln(100 e^(−t/2) + 5)', labelAt: 4.5 }, { fn: 'ln(100) - x/2', color: 'ink3', dash: [6, 5], label: 'ln(100) − t/2', labelAt: 6.5, labelDy: 14 }] }, caption: 'ln y against t with and without a background of 5% of the starting value.' },
      choices: ['The plot curves and flattens at late times, and a straight-line fit reports too long a τ', 'Nothing: the log turns any exponential into a straight line', 'The fitted τ comes out too short, because the background adds counts', 'Only the intercept is affected, never the slope'],
      answer: 0,
      why: { 1: t`Only a *pure* exponential. $\ln(Ae^{-t/\tau} + C)$ approaches $\ln C$, a flat line, at late times.`, 2: 'The background props up the tail, which makes the decay look slower, not faster.', 3: 'The curvature tilts the best straight line, so the slope — and τ — change.' },
      hints: ['What does ln y approach when the exponential has died away?'],
      teach: 'A log transform linearizes a pure exponential only; an offset bends the line and biases the slope.',
      explain: t`At late times $\ln y \to \ln C$, so the points level off and the fitted slope is too shallow: $\tau$ too long. Subtract a known background, or fit the nonlinear model with $C$ free. (Logs also reshape the error bars: [weighted least squares](#/lesson/lab.A5.2).)`,
    }),
    num({
      id: 'dchi2', difficulty: 3,
      gen(r) {
        const tau = r.float(10, 30, 0.01), h = r.pick([0.2, 0.25, 0.5]);
        const sig = r.float(0.15, 0.6, 0.01);
        const chimin = r.float(8, 25, 0.01);
        const up = +(chimin + (h / sig) ** 2).toFixed(2);
        const ans = h / Math.sqrt(up - chimin);
        return {
          prompt: t`A fit finds its minimum $\chi^2_{\min} = ${chimin.toFixed(2)}$ at $\tau = ${tau.toFixed(2)}$ s. With every other parameter re-optimized, $\chi^2 = ${up.toFixed(2)}$ at $\tau = ${(tau + h).toFixed(2)}$ s. Assuming $\chi^2$ is a parabola near its minimum, what is $\sigma_\tau$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [r6(tau - 2.2 * h), r6(tau + 2.2 * h)], y: [r6(chimin - 0.5), r6(chimin + 1.4 * (up - chimin))], xlabel: 'τ (s)', ylabel: 'χ²', axesAt: 'edge', curves: [{ fn: `${chimin} + ((x - ${tau})/${r6(ans)})^2`, color: 'accent' }], points: [{ x: tau, y: chimin, r: 4, color: 'gold' }, { x: r6(tau + h), y: up, r: 4, color: 'warn' }], hlines: [{ y: r6(chimin + 1), label: 'χ²min + 1', color: 'ink3' }] }, caption: 'χ² against τ near its minimum (gold) and the second evaluation (red).' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: h / (up - chimin), feedback: t`The parabola gives $\chi^2 - \chi^2_{\min} = (\Delta\tau/\sigma)^2$: take the square root of the rise.` }, { value: h * Math.sqrt(up - chimin), feedback: t`Inverted: a *steeper* rise means a *smaller* $\sigma$. $\sigma = \Delta\tau/\sqrt{\Delta\chi^2}$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Near the minimum, $\chi^2(\tau) = \chi^2_{\min} + \left(\dfrac{\tau - \hat\tau}{\sigma_\tau}\right)^2$.`, t`Here $\Delta\chi^2 = ${(up - chimin).toFixed(2)}$ for $\Delta\tau = ${h}$ s.`],
          teach: t`$\sigma$ is the step that raises $\chi^2$ by 1 — with the other parameters re-fitted at each step.`,
          explain: t`$\sigma_\tau = ${h}/\sqrt{${(up - chimin).toFixed(2)}} = ${ans.toFixed(3)}$ s. Re-optimizing the other parameters (“profiling”) matters: holding them fixed makes $\chi^2$ rise faster and understates $\sigma_\tau$ when they are correlated.`,
        };
      },
    }),
    mcq({
      id: 'local-min', difficulty: 3,
      prompt: t`You fit $y = \sin(2\pi f t)$ to 20 samples of a 1.00 Hz signal, starting the iteration at $f = 1.6$ Hz. The picture shows $\chi^2$ against $f$. What happens, and what should you do?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0.2, 2.2], y: [0, 28], xlabel: 'f (Hz)', ylabel: 'χ² ÷ 100', axesAt: 'edge', curves: [{ fn: sinChi, color: 'accent', samples: 2000 }], vlines: [{ x: 1.6, label: 'start', color: 'warn' }] }, caption: 'χ² (in units of 100, for σ = 0.1) of a pure sine against trial frequency, for noise-free samples of a 1.00 Hz sine every 0.2 s.' },
      choices: ['It slides into the nearby local minimum and reports a wrong frequency; start near the true value, e.g. from a scan of χ² or an FFT peak', 'It always finds the 1 Hz minimum, because least squares has a unique answer', 'It diverges to infinite frequency', 'It reports the right frequency with a large uncertainty'],
      answer: 0,
      why: { 1: 'Unique only for models linear in their parameters. A periodic model has many minima.', 2: 'The iteration only goes downhill, and the nearest hollow is close by.', 3: t`A local minimum looks just like a good fit to the algorithm — it reports a small uncertainty there. Only $\chi^2_{\min}$ (far too large) betrays it.` },
      hints: ['An iterative minimizer only ever moves downhill from where it starts.', 'Which hollow is downhill from 1.6 Hz?'],
      teach: 'Nonlinear fits can stop in a local minimum: choose the start with care and check χ²_min.',
      explain: t`From 1.6 Hz the downhill direction leads into a hollow near 1.5 Hz, not to 1.0 Hz. A coarse scan of $\chi^2$ over the plausible range — or an FFT for a frequency — gives a start in the right valley. A reduced $\chi^2$ far above 1 is the alarm that you landed in the wrong one.`,
    }),
    code({
      id: 'profile', difficulty: 3,
      prompt: t`For a fixed $\tau$, the thermocouple model $T = 20 + \Delta T\,(1 - e^{-t/\tau})$ is linear in $\Delta T$, so the best $\Delta T$ has a closed form: $\Delta T(\tau) = \sum g_i (T_i - 20)/\sum g_i^2$ with $g_i = 1 - e^{-t_i/\tau}$ (all $\sigma_i$ equal). Write \`chi2_of(tau)\` returning $\chi^2$ with that best $\Delta T$, scan $\tau$ from 0.5 to 1.2 s in steps of 0.0005 s, and set \`tau_best\` and \`lo\`, \`hi\`: the smallest and largest $\tau$ with $\chi^2 \le \chi^2_{\min} + 1$.`,
      starter: t`import numpy as np

t = np.arange(17) * 0.25                     # s
T = np.array([${TC_T.join(', ')}])   # °C
sigma = 1.5                                  # K

def chi2_of(tau):
    g = 1 - np.exp(-t / tau)
    # your code: the best dT for this tau, then chi²
    return 0.0

taus = np.arange(0.5, 1.2, 0.0005)
# your code: chi² for every tau, tau_best, lo, hi
print(f"tau = {tau_best:.4f} s, 1-sigma interval {lo:.4f} to {hi:.4f} s")`,
      answer: t`import numpy as np

t = np.arange(17) * 0.25                     # s
T = np.array([${TC_T.join(', ')}])   # °C
sigma = 1.5                                  # K

def chi2_of(tau):
    g = 1 - np.exp(-t / tau)
    dT = np.sum(g * (T - 20)) / np.sum(g * g)
    return np.sum(((T - 20 - dT * g) / sigma)**2)

taus = np.arange(0.5, 1.2, 0.0005)
chi = np.array([chi2_of(x) for x in taus])
tau_best = taus[np.argmin(chi)]
inside = taus[chi <= chi.min() + 1]
lo, hi = inside.min(), inside.max()
print(f"tau = {tau_best:.4f} s, 1-sigma interval {lo:.4f} to {hi:.4f} s")`,
      tests: [
        { name: t`\`chi2_of\` re-fits $\Delta T$ for each $\tau$ (its minimum is $\chi^2_{\min} \approx ${TC.chi2.toFixed(2)}$)`, code: `abs(chi2_of(${TC.p[1]}) - ${TC.chi2}) < 1e-3` },
        { name: t`\`tau_best\` agrees with a Levenberg–Marquardt fit, $${TC.p[1].toFixed(4)}$ s`, code: `abs(tau_best - ${TC.p[1]}) < 0.0006` },
        { name: t`the Δχ² = 1 interval is about $\pm${TC.err[1].toFixed(4)}$ s wide each side`, code: `abs((hi - lo) / 2 - ${TC.err[1]}) < 0.0008` },
      ],
      hints: [t`\`dT = np.sum(g * (T - 20)) / np.sum(g * g)\`; then \`np.sum(((T - 20 - dT * g) / sigma)**2)\`.`, t`\`chi = np.array([chi2_of(x) for x in taus])\`; \`inside = taus[chi <= chi.min() + 1]\`; \`lo, hi = inside.min(), inside.max()\`.`],
      teach: 'A scan of χ² with the other parameters re-optimized (a profile) shows the minimum and its Δχ² = 1 interval directly — no matrix, no starting guess.',
      explain: t`It prints $\tau \approx ${TC.p[1].toFixed(3)}$ s with an interval of about $\pm ${TC.err[1].toFixed(3)}$ s — the same as the covariance matrix of a Levenberg–Marquardt fit, because here $\chi^2$ is very nearly a parabola. When it is not (few points, a parameter near a boundary), the scan is the honest one.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-curvature', difficulty: 3, transfer: true,
      gen(r) {
        const tau = r.float(0.30, 0.60, 0.001), sig = r.float(0.008, 0.025, 0.001), h = 0.02;
        const c0 = r.float(20, 40, 0.01);
        const cm = +(c0 + (h / sig) ** 2).toFixed(2), cp = +(c0 + (h / sig) ** 2).toFixed(2);
        const ans = h * Math.sqrt(2 / (cm + cp - 2 * c0));
        return {
          prompt: t`A solid rocket motor’s thrust tail-off is fitted with $F(t) = F_0e^{-(t - t_b)/\tau}$. Profiling the time constant gives $\chi^2 = ${cm.toFixed(2)}$, $${c0.toFixed(2)}$ and $${cp.toFixed(2)}$ at $\tau = ${(tau - h).toFixed(3)}$, $${tau.toFixed(3)}$ and $${(tau + h).toFixed(3)}$ s. Estimate $\sigma_\tau$ from the curvature of $\chi^2$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [r6(tau - 2.5 * h), r6(tau + 2.5 * h)], y: [r6(c0 - 1), r6(cm + 0.5 * (cm - c0))], xlabel: 'τ (s)', ylabel: 'χ²', axesAt: 'edge', points: [{ x: r6(tau - h), y: cm, r: 4, color: 'accent' }, { x: tau, y: c0, r: 4, color: 'gold' }, { x: r6(tau + h), y: cp, r: 4, color: 'accent' }] }, caption: 'Three evaluations of the profiled χ² around its minimum.' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: h / Math.sqrt(cm + cp - 2 * c0), feedback: t`The second difference is $2/\sigma^2$, not $1/\sigma^2$: $\chi^2 = \chi^2_{\min} + (\Delta\tau/\sigma)^2$ has second derivative $2/\sigma^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`For $\chi^2 = \chi^2_{\min} + (\tau - \hat\tau)^2/\sigma^2$, the second derivative is $2/\sigma^2$.`, t`Estimate it by the second difference: $(\chi^2_+ + \chi^2_- - 2\chi^2_0)/h^2$ with $h = ${h}$ s.`],
          teach: t`The curvature of $\chi^2$ is $2/\sigma^2$: three evaluations around the minimum give $\sigma$.`,
          explain: t`$(${cm.toFixed(2)} + ${cp.toFixed(2)} - 2\times${c0.toFixed(2)})/${h}^2 = ${((cm + cp - 2 * c0) / h ** 2).toFixed(0)}\ \text{s}^{-2} = 2/\sigma^2$, so $\sigma_\tau = ${ans.toFixed(4)}$ s. This is how fitting codes get the covariance matrix: from the curvature (the Hessian) of $\chi^2$.`,
        };
      },
    }),
    mcq({
      id: 'cp-start', difficulty: 2,
      prompt: t`A Levenberg–Marquardt fit of a resonance $y = A/\bigl(1 + ((f - f_0)/\gamma)^2\bigr)$ returns $f_0$ with a tiny uncertainty but $\chi^2/\nu = 40$. The residuals show the data’s peak sitting well away from the fitted one. The most likely cause:`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [90, 110], y: [0, 1.2], xlabel: 'f (kHz)', ylabel: 'y', axesAt: 'edge', curves: [{ fn: '1/(1 + ((x - 100.6)/0.8)^2)', color: 'accent', label: 'data trend', labelAt: 101.6 }, { fn: '0.12/(1 + ((x - 96)/0.8)^2)', color: 'gold', label: 'fit', labelAt: 97 }] }, caption: 'Sketch: the resonance in the data and the curve the fit settled on.' },
      choices: ['The starting f₀ was far from the peak, and the fit stopped in a local minimum', 'The error bars are too large', 'The model is linear, so it cannot fit a peak', 'Too many data points'],
      answer: 0,
      why: { 1: 'Too-large error bars make χ²/ν small, not 40.', 2: 'The Lorentzian is nonlinear in f₀ and γ.', 3: 'More points never prevent a fit from finding the right minimum.' },
      hints: ['Far from the data’s peak, a narrow Lorentzian barely overlaps the data at all — which way is downhill for f₀?'],
      teach: 'A huge χ²_min with a confident-looking answer is the signature of a local minimum: restart near the data’s landmarks.',
      explain: t`Started far off, the narrow peak finds no gradient pulling it toward the data and shrinks its amplitude instead. Start $f_0$ at the data’s maximum and $\gamma$ at its half width, and the same routine converges to the right answer.`,
    }),
  ],
  sources: [
    { label: 'P. R. Bevington & D. K. Robinson, Data Reduction and Error Analysis, 3rd ed., ch. 8 (nonlinear least squares)', url: 'https://www.mheducation.com/highered/product/data-reduction-error-analysis-physical-sciences-bevington-robinson/M9780072472271.html' },
    { label: 'I. G. Hughes & T. P. A. Hase, Measurements and their Uncertainties, ch. 7 (computer minimisation and the error matrix)', url: 'https://global.oup.com/academic/product/measurements-and-their-uncertainties-9780199566334' },
  ],
});
