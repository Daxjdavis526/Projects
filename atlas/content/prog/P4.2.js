// Labels, units and honest axes — units on every axis, mathtext in raw
// strings, log scales for data spanning decades, bars from zero, error bars
// that say what they mean. Muon decays, ¹²⁸I counts, the standard atmosphere.
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { lg, seg, polyline, errbar, bar, normals } from './_numkit.js';

const t = String.raw;

// ── the worked example: muon decay times in a scintillator (synthetic, τ = 2.2 μs) ──
const TAU_TRUE = 2.2;
const mz = normals(2197);
const MU_T = Array.from({ length: 12 }, (_, k) => k + 0.5);                       // μs, bin centres
const MU_N = MU_T.map((tt) => { const m = 5000 * Math.exp(-tt / TAU_TRUE); return Math.max(1, Math.round(m + Math.sqrt(m) * mz())); });
// np.polyfit(t, np.log(N), 1, w=np.sqrt(N)): least squares with weights w² = N
const fitLine = (() => {
  const W = MU_N, Y = MU_N.map(Math.log), sw = W.reduce((a, b) => a + b, 0);
  const tb = MU_T.reduce((s, x, k) => s + W[k] * x, 0) / sw, yb = Y.reduce((s, y, k) => s + W[k] * y, 0) / sw;
  const b = MU_T.reduce((s, x, k) => s + W[k] * (x - tb) * (Y[k] - yb), 0) / MU_T.reduce((s, x, k) => s + W[k] * (x - tb) ** 2, 0);
  return { b, a: yb - b * tb };
})();
const TAU_FIT = -1 / fitLine.b, N0_FIT = Math.exp(fitLine.a);

// ── engines: approximate published vacuum specific impulse (s), as in prog.P1.4 ──
const ENG = { 'F-1': 304, 'RD-180': 338, 'Merlin 1D Vacuum': 348, 'RS-25': 452, 'RL10B-2': 465.5 };

// ── the US Standard Atmosphere (1976): pressure at the base of each layer ──
const ATM_H = [0, 11, 20, 32, 47, 51, 71, 84.852];                                 // km
const ATM_P = [101325, 22632.06, 5474.889, 868.0187, 110.9063, 66.93887, 3.956420, 0.3734];   // Pa

// ── an illustrative detector-noise curve shaped like Advanced LIGO's (in 10⁻²³ per √Hz) ──
const ASD = '0.35*sqrt((x/40)^(-8) + 1 + (x/300)^2)';

// ── ¹²⁸I counts for the coding exercise ──
const I128_HALF = 24.99;      // min

export default lesson({
  id: 'prog.P4.2',
  title: 'Labels, units and honest axes',
  minutes: 11, difficulty: 2,
  intro: t`A figure is a quantitative claim, and its axes say what the claim is about. Four habits keep it honest:

- **a unit on every axis label** — the quantity, then its unit: "thrust (kN)";
- **log scales for data that span decades**, where linear axes would squash all but the largest values flat;
- **bars that start at zero**, because a bar's length is its value;
- **error bars**, with a caption saying what they mean.

The log scale earns its place through exponential decay, the commonest curve in physics. Taking logarithms turns it into a straight line,

$$N(t) = N_0\,e^{-t/\tau} \quad\Longleftrightarrow\quad \ln N = \ln N_0 - \frac{t}{\tau}$$

so on a log $y$ axis (\`ax.set_yscale("log")\`) the data fall on a line whose slope gives the lifetime.`,
  symbols: [
    { tex: 'N(t)', text: 'the number of counts (or the activity) at time $t$' },
    { tex: 'N_0', text: 'the value at $t = 0$, where the line meets the vertical axis' },
    { tex: t`\tau`, text: 'the mean lifetime, in s: $N$ falls by a factor $e$ every $\\tau$ and by 10 every $\\tau\\ln 10 \\approx 2.3\\tau$; the half-life is $\\tau\\ln 2$' },
    { tex: 't', text: 'time, on an ordinary (linear) axis' },
    { tex: t`\sigma_N = \sqrt N`, text: 'the uncertainty of a count of independent random events (Poisson statistics): the length of each half error bar' },
  ],
  why: 'Readers judge a result by its figure in seconds; a missing unit, a squashed axis or a truncated bar can make a correct result unreadable — or a weak one look strong.',
  visual: {
    type: 'code-runner',
    title: 'The same data, honest and not',
    lead: t`Press **Run**. The top row shows the same muon-decay counts on linear and log axes, with Poisson error bars. The bottom row shows the same two numbers as bars, once with a truncated axis and once from zero. Which panels tell the truth at a glance?`,
    tasks: [
      'On the linear panel, find the error bars of the late bins: they are there, but too small to see. On the log panel they grow as the counts fall.',
      'Change `ax[1, 0].set_ylim(300, 340)` to `(0, 400)`: the 11% difference stops looking like a factor of 8.',
      'Change the first x label to `"decay time $\\tau$ (μs)"`, without the `r`: the label reads “au”, because `\\t` became a tab.',
    ],
    params: {
      rows: 30,
      code: t`import numpy as np
import matplotlib.pyplot as plt

# muon decays in a scintillator: counts per 1 μs bin (synthetic, τ = 2.2 μs)
rng = np.random.default_rng(42)
t = np.arange(0.5, 12, 1.0)                      # μs, bin centres
N = rng.poisson(5000 * np.exp(-t / 2.2))         # counts
sigma = np.sqrt(N)                               # Poisson: σ = √N

# vacuum specific impulse of two engines, roughly the published values
engines = ["F-1", "RD-180"]
isp = [304, 338]                                 # s

fig, ax = plt.subplots(2, 2, figsize=(9, 6.6), layout="constrained")
for a, scale in zip(ax[0], ["linear", "log"]):
    a.errorbar(t, N, yerr=sigma, fmt="o", capsize=3)
    a.set_yscale(scale)
    a.set_xlabel(r"decay time $t$ (μs)")
    a.set_ylabel("counts per 1 μs bin")
    a.set_title(f"{scale} y axis")
for a, low in zip(ax[1], [300, 0]):
    a.bar(engines, isp, color=["C1", "C2"])
    a.set_ylim(low, 360)
    a.set_axisbelow(True)                        # grid behind the bars
    a.set_ylabel(r"$I_\mathrm{sp}$, vacuum (s)")
ax[1, 0].set_title("axis starts at 300 s: misleading")
ax[1, 1].set_title("axis starts at zero: honest")
print("error bars: ±1σ (Poisson)")`,
    },
    caption: 'Synthetic counts with no background; a real muon experiment also sees a flat background of accidental counts, which bends the log plot at late times. The specific impulses are approximate published values.',
  },
  example: {
    prompt: t`A muon detector logs how long each stopped muon lives before it decays. Binned in 1 μs bins (centres \`t\` $= 0.5, 1.5, \ldots, 11.5$ μs) the counts are

\`\`\`python
N = np.array([${MU_N.join(', ')}])
\`\`\`

Make an honest figure of these data, and read the muon's lifetime from it.`,
    visual: {
      type: 'graph',
      params: { x: [0, 12.2], y: [1.2, 3.9], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'decay time t (μs)', ylabel: 'counts per 1 μs bin',
        curves: [{ fn: `${lg(N0_FIT)} - x/(${TAU_FIT}*ln(10))`, color: 'gold', width: 2, domain: [0, 12] },
          ...MU_T.flatMap((x, k) => { const N = MU_N[k], s = Math.sqrt(N); return [seg(x, lg(N - s), x, lg(N + s), { color: 'accent', width: 1.4 })]; })],
        points: MU_T.map((x, k) => ({ x, y: lg(MU_N[k]), color: 'accent', r: 3.2 })),
        legend: [{ label: 'counts ± 1σ', color: 'accent', point: true }, { label: `fit: τ = ${TAU_FIT.toFixed(2)} μs`, color: 'gold' }], legendAt: 'tr' },
      caption: 'The data on a log axis with ±1σ Poisson error bars and the weighted straight-line fit. The counts are synthetic, drawn from an exponential with τ = 2.2 μs and no background.',
    },
    steps: [
      { label: 'Size the error bars', text: t`Counts of random, independent events have a Poisson spread: $\sigma_N = \sqrt N$. The first bin's ${MU_N[0]} counts carry $\pm ${Math.sqrt(MU_N[0]).toFixed(0)}$ (${(100 / Math.sqrt(MU_N[0])).toFixed(1)}%); the last bin's ${MU_N[11]} carry $\pm ${Math.sqrt(MU_N[11]).toFixed(1)}$ (${(100 / Math.sqrt(MU_N[11])).toFixed(0)}%).

\`\`\`python
t = np.arange(0.5, 12, 1.0)                     # μs
fig, ax = plt.subplots()
ax.errorbar(t, N, yerr=np.sqrt(N), fmt="o", capsize=3, label="counts ± 1σ")
\`\`\`` },
      { label: 'Choose the scale', text: t`The counts span about two decades. On a linear axis the last six bins sit on the floor; on a log axis an exponential becomes a straight line, so the eye can check the model at once.

\`\`\`python
ax.set_yscale("log")
\`\`\`` },
      { label: 'Label with units', text: t`Quantity, then unit, in every label. Mathtext between dollar signs sets symbols; use a **raw string** (\`r"…"\`) so Python leaves the backslashes alone.

\`\`\`python
ax.set_xlabel(r"decay time $t$ (μs)")
ax.set_ylabel("counts per 1 μs bin")
\`\`\`` },
      { label: 'Read the slope', text: t`Fit a straight line to $\ln N$ against $t$. The uncertainty of $\ln N$ is $\sigma_N/N = 1/\sqrt N$, and \`np.polyfit\` takes weights $w = 1/\sigma$, so \`w=np.sqrt(N)\`:

\`\`\`python
slope, intercept = np.polyfit(t, np.log(N), 1, w=np.sqrt(N))
tau = -1 / slope
\`\`\`

The slope is $${fitLine.b.toFixed(4)}$ per μs, so $\tau = ${TAU_FIT.toFixed(2)}$ μs.` },
      { label: 'Sense check', text: t`The line falls by a factor of 10 every $\tau\ln 10 \approx ${(TAU_FIT * Math.LN10).toFixed(1)}$ μs, which matches the figure. The muon's lifetime at rest is 2.197 μs. In a real scintillator negative muons can also be captured by carbon nuclei, so the measured mean lifetime of a mixed beam comes out a little shorter — a reason to say in the caption what was measured.` },
    ],
    answer: t`Error bars of $\sqrt N$, a log $y$ axis on which the data fall on a straight line, labels with units, and $\tau \approx ${TAU_FIT.toFixed(2)}$ μs from the slope.`,
  },
  practice: [
    mcq({
      id: 'best-label', difficulty: 1,
      prompt: t`A static fire of a solid motor gives this thrust curve. Which $y$-axis label is best?`,
      visual: {
        type: 'graph',
        params: { x: [0, 4.4], y: [0, 1500], aspect: 'wide', axesAt: 'edge', xlabel: 'time (s)', ylabel: '?',
          curves: [{ fn: 'min(1400, 9000x)*step(3.2 - x) + max(0, 1400 - 2000*(x - 3.2))*step(x - 3.2)*step(3.9 - x)', color: 'accent', domain: [0, 4.2] }] },
        caption: 'An illustrative thrust curve: a fast rise, a burn and a tail-off.',
      },
      choices: ['`"thrust (kN)"`', '`"Thrust"`', '`"kN"`', '`"F"`'],
      answer: 0,
      why: {
        1: 'Without a unit the numbers 0 to 1500 could be newtons, kilonewtons or pounds-force — a factor of 1000 apart.',
        2: 'A unit alone says how it is measured but not *what* is measured.',
        3: 'A bare symbol must be defined somewhere; a label should read on its own.',
      },
      hints: ['A good label answers two questions: what quantity, and in what unit?'],
      teach: 'Every axis label names the quantity and its unit — “thrust (kN)”, “time (s)” — so the figure reads without the text around it.',
      explain: t`"thrust (kN)" says both what is plotted and how to read the numbers. Units in labels are also the cheapest bug detector there is: a peak of 1400 kN from a hobby motor would announce a units slip at once.`,
    }),
    num({
      id: 'truncated', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([['F-1', 'RD-180'], ['RD-180', 'Merlin 1D Vacuum'], ['RS-25', 'RL10B-2'], ['F-1', 'Merlin 1D Vacuum']]);
        const A = ENG[a], B = ENG[b], base = Math.floor((A - 2) / 10) * 10 - r.pick([0, 10]);
        const ratio = (B - base) / (A - base);
        return {
          prompt: t`A slide compares the vacuum specific impulse of the ${a} (${A} s) and the ${b} (${B} s) with bars on an axis that starts at ${base} s. How many times taller is the ${b}'s bar **drawn** than the ${a}'s?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3], y: [base, B + (B - base) * 0.12], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'Isp (s)', xticks: 0, grid: false,
              shade: [bar(0.4, 1.3, A, { base, color: 'warn' }), bar(1.7, 2.6, B, { base, color: 'good' })],
              points: [{ x: 0.85, y: A, label: a, r: 0, labelDx: -24, labelDy: -6 }, { x: 2.15, y: B, label: b, r: 0, labelDx: -30, labelDy: -6 }] },
            caption: 'The slide’s bars. The axis does not start at zero.',
          },
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: B / A, feedback: `That is the true ratio of the values. The question asks about the bars as drawn, which start at ${base} s, not at 0.` }],
          hints: [`A bar is drawn from the bottom of the axis, ${base} s, up to its value.`, `Drawn heights: ${A} − ${base} and ${B} − ${base}.`],
          teach: 'A bar’s length is read as its value, so a bar axis must start at zero; cutting the axis multiplies small differences into large-looking ones.',
          explain: t`The bars are drawn $${A} - ${base} = ${+(A - base).toFixed(1)}$ and $${B} - ${base} = ${+(B - base).toFixed(1)}$ s tall: ${ratio.toFixed(2)} times, for a true ratio of ${(B / A).toFixed(3)} — a ${(100 * (B / A - 1)).toFixed(0)}% difference drawn as ${ratio.toFixed(1)}×. Start bar axes at zero; if a small difference matters, plot the difference itself, or use points on a zoomed axis, which do not claim length.`,
        };
      },
    }),
    num({
      id: 'semilog-half-life', difficulty: 2,
      gen(r) {
        const T = r.pick([12, 20, 30, 45, 60]), [y1, y2] = r.pick([[4, 2], [5, 3], [4, 1], [3, 1]]);
        const half = (T * Math.LN2) / ((y1 - y2) * Math.LN10);
        return {
          prompt: t`On a log $y$ axis, the activity of a sample falls along a straight line from $10^{${y1}}$ counts per minute at $t = 0$ to $10^{${y2}}$ at $t = ${T}$ h. What is the half-life?`,
          visual: {
            type: 'graph',
            params: { x: [0, T * 1.1], y: [y2 - 0.5, y1 + 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'time (h)', ylabel: 'counts per minute',
              curves: [{ fn: `${y1} - ${(y1 - y2) / T}*x`, color: 'accent', domain: [0, T * 1.08] }],
              points: [{ x: 0, y: y1, color: 'gold', r: 4.5 }, { x: T, y: y2, color: 'gold', r: 4.5 }] },
            caption: 'An exponential decay is a straight line on a log y axis. The axis is labelled in decades: each step up is ten times more.',
          },
          answer: half, units: 'h', tol: { rel: 0.01 },
          errors: [
            { value: T / (y1 - y2), feedback: 'That is the time for one decade — a factor of 10, not 2.' },
            { value: (T * Math.LN2) / (y1 - y2), feedback: 'Use the natural log of the whole drop: a decade is ln 10 ≈ 2.303 e-foldings.' },
            { value: T / ((y1 - y2) * Math.LN10), feedback: 'That is the mean lifetime τ. The half-life is τ ln 2.' },
          ],
          hints: [t`The activity falls by $10^{${y1 - y2}}$ in ${T} h, so $e^{-${T}/\tau} = 10^{-${y1 - y2}}$.`, t`$\tau = ${T}/(${y1 - y2}\ln 10)$, and the half-life is $\tau\ln 2$.`],
          teach: 'On a log axis, an exponential’s slope gives its lifetime: a drop of one decade takes τ ln 10, and a halving takes τ ln 2.',
          explain: t`$\tau = ${T}/(${y1 - y2}\ln 10) = ${(T / ((y1 - y2) * Math.LN10)).toFixed(3)}$ h, so $t_{1/2} = \tau\ln 2 = ${half.toFixed(3)}$ h. Check: ${T} h is ${(T / half).toFixed(1)} half-lives, and $2^{${(T / half).toFixed(2)}} \approx 10^{${y1 - y2}}$.`,
        };
      },
    }),
    match({
      id: 'which-scale', difficulty: 2,
      prompt: t`Pick the axis scales that turn each data set into a straight line or spread it out readably.`,
      left: [
        'Counts from a radioactive source over ten half-lives',
        'Orbital period against orbit radius for moons from $10^4$ to $10^7$ km ($T \\propto a^{3/2}$)',
        'The stretch of a spring under loads from 0 to 5 N',
        'Loudness in decibels of a loudspeaker from 20 Hz to 20 kHz',
      ],
      right: ['log y only (semilogy)', 'log–log (loglog)', 'linear axes', 'log x only (semilogx)', 'a bar chart from zero'],
      answer: [0, 1, 2, 3],
      hints: ['Exponentials become straight on a log y axis; power laws on log–log axes.', 'Decibels are already a logarithm, so only the frequency axis needs a log scale.'],
      teach: 'Exponential → semilogy; power law → loglog; a quantity spanning decades on one axis only → a log scale on that axis; a linear law over a small range → linear axes.',
      explain: t`Ten half-lives is a factor of about 1000 in counts: semilogy makes it straight. $T \propto a^{3/2}$ over three decades of $a$: log–log, slope 3/2. Hooke’s law is linear over a small range: linear axes. A frequency response spans three decades of frequency, but decibels are already logarithmic: semilogx.`,
    }),
    mcq({
      id: 'raw-string', difficulty: 2,
      prompt: t`The label comes out as *heta (rad)*. Why?

\`\`\`python
ax.set_xlabel("$\theta$ (rad)")
\`\`\``,
      choices: [
        'In an ordinary string `\\t` is a tab character, so the backslash never reaches Matplotlib; write `r"$\\theta$ (rad)"`',
        'Matplotlib cannot draw Greek letters; spell out "theta"',
        'The dollar signs must be doubled to switch on mathtext',
        'Mathtext needs `plt.rcParams["text.usetex"] = True` and a LaTeX installation',
      ],
      answer: 0,
      why: {
        1: 'Mathtext draws Greek letters happily, `$\\theta$` included — once the backslash survives.',
        2: 'One pair of dollar signs switches mathtext on, as in TeX.',
        3: 'Mathtext is Matplotlib’s own TeX-like renderer and needs no LaTeX; `usetex` is a separate, optional mode.',
      },
      hints: ['What does Python do with `\\t`, `\\n` or `\\b` inside an ordinary string?', 'A raw string, `r"…"`, keeps every backslash as typed.'],
      teach: 'Write Matplotlib labels that contain TeX as raw strings, `r"$\\theta$"`: in a normal string `\\t`, `\\n`, `\\b`, `\\f` and `\\r` silently become control characters.',
      explain: t`Python turns \`\t\` into a tab before Matplotlib sees the string, so mathtext receives a tab followed by "heta" and draws *heta*. \`r"$\theta$ (rad)"\` keeps the backslash. The same trap waits in \`\nu\`, \`\beta\`, \`\rho\` and \`\frac\`; other backslashes such as \`\D\` only draw a \`SyntaxWarning\`.`,
    }),
    code({
      id: 'iodine-decay', difficulty: 3,
      prompt: t`A sample of iodine-128 (half-life ${I128_HALF} min) is counted for 2-minute intervals. On the Axes \`ax\`, plot the counts \`N\` against \`t\` with **error bars** of $\sqrt N$ (\`ax.errorbar\`, markers only), put the $y$ axis on a **log scale**, and label both axes with their units — the time label must say "min".`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(128)
t = np.arange(1, 120, 2.0)                                 # min, interval centres
N = rng.poisson(3000 * np.exp(-np.log(2) * t / ${I128_HALF}))      # counts per 2 min

fig, ax = plt.subplots()
ax.plot(t, N)
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(128)
t = np.arange(1, 120, 2.0)                                 # min, interval centres
N = rng.poisson(3000 * np.exp(-np.log(2) * t / ${I128_HALF}))      # counts per 2 min

fig, ax = plt.subplots()
ax.errorbar(t, N, yerr=np.sqrt(N), fmt="o", capsize=2)
ax.set_yscale("log")
ax.set_xlabel("time (min)")
ax.set_ylabel("counts per 2 min")`,
      tests: [
        { name: 'there are error bars', code: 'any(type(c).__name__ == "ErrorbarContainer" for c in ax.containers)' },
        { name: t`each bar runs from $N - \sqrt N$ to $N + \sqrt N$`, code: 'np.allclose([s[1][1] - s[0][1] for s in [c for c in ax.containers if type(c).__name__ == "ErrorbarContainer"][0].lines[2][0].get_segments()], 2 * np.sqrt(N))' },
        { name: 'the y axis is logarithmic', code: 'ax.get_yscale() == "log"' },
        { name: 'labels with units, the time in min', code: '"min" in ax.get_xlabel() and ax.get_ylabel().strip() != ""' },
      ],
      hints: ['Replace `ax.plot(t, N)` by `ax.errorbar(t, N, yerr=np.sqrt(N), fmt="o")`; `fmt="o"` draws markers without joining lines.', 'Then `ax.set_yscale("log")`, `ax.set_xlabel("time (min)")` and `ax.set_ylabel("counts per 2 min")`.'],
      teach: '`ax.errorbar(x, y, yerr=…, fmt="o")` draws measurements with their uncertainties; `set_yscale("log")` turns exponential decay into a straight line.',
      explain: t`On the log axis the counts fall on a straight line, losing a factor of 2 every ${I128_HALF} min, and the bars grow as the counts fall: the relative error $1/\sqrt N$ is 2% at 3000 counts and 30% at 10. The caption should say "error bars: ±1σ, Poisson".`,
    }),
    mcq({
      id: 'bar-meaning', difficulty: 2,
      prompt: t`A paper shows two measurements of $g$ with error bars and no caption. What can a reader **not** tell from the figure?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [9.70, 9.92], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: 'g (m/s²)', xticks: 0,
          curves: [...errbar(1, 9.79, 0.03, 0.06, { color: 'accent' }), ...errbar(2, 9.84, 0.03, 0.06, { color: 'warn' })],
          points: [{ x: 1, y: 9.79, color: 'accent', r: 4.5, label: 'pendulum', labelDx: 10, labelDy: 4 }, { x: 2, y: 9.84, color: 'warn', r: 4.5, label: 'drop tower', labelDx: 10, labelDy: 4 }] },
        caption: 'Two measurements with error bars of the same length, of unknown meaning.',
      },
      choices: [
        'Whether the two values disagree: that depends on whether the bars are 1σ, 2σ, standard errors or a min–max range',
        'Which measurement is larger',
        'The units of the measurements',
        'That the two experiments had uncertainties of similar size',
      ],
      answer: 0,
      why: {
        1: 'The dots show that: 9.84 is above 9.79.',
        2: 'The axis label gives them: m/s².',
        3: 'The bars are the same length, so whatever they mean, they mean it equally for both.',
      },
      hints: ['The gap between the values is 0.05 m/s². Is that big or small?', 'It is 1.7 bar-lengths. Compare that with bars of 1σ and with bars of 2σ.'],
      teach: 'An error bar means nothing until the caption says what it is: ±1σ, ±2σ, a standard error, or a 95% interval differ by factors of 2 or more.',
      explain: t`The values differ by 0.05 m/s² and each bar is ±0.03. If the bars are ±1σ, the difference is $0.05/\sqrt{0.03^2 + 0.03^2} = 1.2\sigma$ — unremarkable. If they are ±2σ (95% intervals), the same picture is a $2.4\sigma$ tension. Always state in the caption what the bars are.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-atmosphere', difficulty: 2, transfer: true,
      prompt: t`The U.S. Standard Atmosphere (1976) gives the pressure at the base of each layer, from sea level to 85 km. Plot it the way atmospheric scientists do: **pressure on the horizontal axis, on a log scale**, altitude on the vertical axis, as markers joined by lines (\`ax.plot(p, h, "o-")\`). Label both axes with units: pascals ("Pa") and kilometres ("km").`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

h = np.array([${ATM_H.join(', ')}])                     # km
p = np.array([${ATM_P.join(', ')}])     # Pa

fig, ax = plt.subplots()
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

h = np.array([${ATM_H.join(', ')}])                     # km
p = np.array([${ATM_P.join(', ')}])     # Pa

fig, ax = plt.subplots()
ax.plot(p, h, "o-")
ax.set_xscale("log")
ax.set_xlabel("pressure (Pa)")
ax.set_ylabel("altitude (km)")`,
      tests: [
        { name: 'pressure along x, altitude along y', code: 'len(ax.lines) >= 1 and np.allclose(ax.lines[0].get_xdata(), p) and np.allclose(ax.lines[0].get_ydata(), h)' },
        { name: 'the pressure axis is logarithmic', code: 'ax.get_xscale() == "log"' },
        { name: 'units: Pa on x, km on y', code: '"Pa" in ax.get_xlabel() and "km" in ax.get_ylabel()' },
      ],
      hints: ['`ax.plot(p, h, "o-")` puts pressure on x; `ax.set_xscale("log")` makes that axis logarithmic.', 'Then the two labels, with "Pa" and "km" in them.'],
      teach: 'Put a log scale on whichever axis spans decades — here pressure, over almost six of them.',
      explain: t`Pressure falls from 101 325 Pa to 0.37 Pa: almost six decades. On a log axis the profile is nearly straight — pressure falls by about a factor of $e$ every 7 to 8 km (the scale height), and the bends between layers show where the temperature changes. On a linear axis everything above 20 km would sit on the axis.`,
    }),
    mcq({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      prompt: t`A gravitational-wave detector's noise spectrum is plotted on linear axes. Most of the curve sits on the floor. What fixes the figure?`,
      visual: {
        type: 'graph',
        params: { x: [0, 2050], y: [0, 100], aspect: 'wide', axesAt: 'edge', xlabel: 'frequency (Hz)', ylabel: 'noise (10⁻²³ per √Hz)',
          curves: [{ fn: ASD, color: 'accent', domain: [10, 2000] }] },
        caption: 'An illustrative noise curve shaped like Advanced LIGO’s, not real data: about 10⁻²¹ per √Hz at 10 Hz, falling to 4 × 10⁻²⁴ near 200 Hz.',
      },
      choices: [
        'Log scales on both axes (`ax.loglog`): the noise spans more than two decades, over two decades of frequency',
        'A log scale on the frequency axis only (`semilogx`)',
        '`ax.set_ylim(0, 1)` to zoom in on the floor',
        'More points along the curve',
      ],
      answer: 0,
      why: {
        1: 'That spreads the frequencies out, but the noise values still span 200 to 1, so the curve still sits on the floor.',
        2: 'Zooming in cuts off the low-frequency wall instead of showing the whole curve on one readable scale.',
        3: 'The curve is already smooth; the problem is the scale, not the sampling.',
      },
      hints: ['How many decades do the noise values span? And the frequencies?', 'When both quantities span decades, both axes need log scales.'],
      teach: 'When both quantities span decades — spectra, power laws, sensitivity curves — use log–log axes.',
      explain: t`The noise runs from about $10^{-21}$ at 10 Hz to $4\times10^{-24}$ near 200 Hz, and the frequencies from 10 to 2000 Hz. On \`ax.loglog\` axes every part of the curve gets equal room, which is why detector sensitivity curves are always drawn that way.`,
    }),
    num({
      id: 'cp-loglog-slope', difficulty: 2,
      gen(r) {
        const [p, what, xl, yl, r0] = r.pick([
          [-2, 'the radio flux received from a spacecraft against its distance', 'distance (AU)', 'flux (relative to 1 AU)', 0],
          [1.5, 'the orbital period of bodies around the Sun against their orbit radius', 'radius (AU)', 'period (yr)', 0],
          [2, 'the drag force on a model rocket against its speed in a wind tunnel', 'speed (m/s)', 'drag (N)', -3],
          [-3, 'the tidal acceleration across a small body against its distance from a planet', 'distance (planet radii)', 'tidal acceleration (relative)', 0],
        ]);
        const y0 = r0, y1 = y0 + 2 * p;
        return {
          prompt: t`On log–log axes, ${what} falls on a straight line through the two marked points. What is the exponent $p$ in $y \propto x^p$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, 2.3], y: [Math.min(y0, y1) - 0.5, Math.max(y0, y1) + 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: xl, ylabel: yl,
              curves: [{ fn: `${y0} + ${p}*x`, color: 'accent', domain: [-0.2, 2.2] }],
              points: [{ x: 0, y: y0, color: 'gold', r: 4.5 }, { x: 2, y: y1, color: 'gold', r: 4.5 }] },
            caption: 'Both axes are labelled in decades: each step is ten times the last.',
          },
          answer: p, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: -p, feedback: 'Check the direction: does y rise or fall as x grows?' }, { value: 1 / p, feedback: 'The slope is the change in log y divided by the change in log x, not the other way round.' }],
          hints: ['Count the decades: how many does y change while x changes by two?', 'On log–log axes, slope = Δ(log y)/Δ(log x) = the exponent p.'],
          teach: 'A power law y = Cxᵖ is a straight line on log–log axes, with slope p: count decades up and decades across.',
          explain: t`From $x = 1$ to $x = 100$ (two decades), $y$ goes from $10^{${y0}}$ to $10^{${y1}}$ (${Math.abs(y1 - y0)} decades ${y1 > y0 ? 'up' : 'down'}), so $p = ${y1 - y0}/2 = ${p}$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Matplotlib: Axes.errorbar, Axes.set_yscale and mathtext', url: 'https://matplotlib.org/stable/users/explain/text/mathtext.html' },
    { label: 'U.S. Standard Atmosphere, 1976 (NOAA/NASA/USAF)', url: 'https://ntrs.nasa.gov/citations/19770009539' },
    { label: 'Particle Data Group: muon mean life', url: 'https://pdg.lbl.gov/' },
  ],
});
