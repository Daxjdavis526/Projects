// Line and scatter plots — Matplotlib's object-oriented API: a Figure holds
// Axes; plot() joins points in order (models on fine grids), scatter() marks
// each point (measurements). A transit light curve, Jupiter's moons, 51 Peg.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { polyline, normals } from './_numkit.js';

const t = String.raw;

// ── the worked example: a hot Jupiter's transit (synthetic photometry) ──
const R_JUP = 69911, R_SUN = 695700;                 // km (IAU nominal equatorial radii)
const DEPTH = (R_JUP / R_SUN) ** 2;                  // fraction of the starlight blocked
const HALF = 1.5, SIG = 0.002;                       // h, half the transit's duration; photometric noise
const noise = normals(51);
const T_OBS = Array.from({ length: 60 }, (_, k) => -4 + (8 * k) / 59);
const F_OBS = T_OBS.map((tt) => (Math.abs(tt) < HALF ? 1 - DEPTH : 1) + SIG * noise());
const BOX = [[-4.2, 1], [-HALF, 1], [-HALF, 1 - DEPTH], [HALF, 1 - DEPTH], [HALF, 1], [4.2, 1]];

// ── practice: thermocouples along a nozzle wall, listed by channel, not position ──
const TC_X = [0.30, 0.05, 0.20, 0.10, 0.35, 0.15, 0.25, 0.00];      // m
const tcT = (x) => 300 + 900 * Math.exp(-(((x - 0.12) / 0.11) ** 2));   // K, an illustrative profile
const TC = TC_X.map((x) => [x, tcT(x)]);

// ── Jupiter's Galilean moons (semi-major axis in km, sidereal period in days) ──
const GM_J = 1.26686534e17;                          // m³/s²
const MOONS = [['Io', 421700, 1.769138], ['Europa', 671034, 3.551181], ['Ganymede', 1070412, 7.154553], ['Callisto', 1882709, 16.689017]];
const vKepler = (akm) => Math.sqrt(GM_J / (akm * 1e3)) / 1e3;   // km/s

// ── a Hubble diagram for the checkpoint (synthetic galaxies, H0 = 70 km/s/Mpc) ──
const hn = normals(1929);
const GAL = Array.from({ length: 14 }, (_, k) => { const d = 12 + 9.5 * k + 4 * hn(); return [d, 70 * d + 450 * hn()]; });

// ── 51 Pegasi b's radial-velocity curve ──
const P51 = 4.2308, K51 = 56;                        // days, m/s

export default lesson({
  id: 'prog.P4.1',
  title: 'Line and scatter plots',
  minutes: 10, difficulty: 2,
  intro: t`Matplotlib builds a picture in layers. A **Figure** is the whole image; it holds one or more **Axes**, each a plotting area with its own $x$ and $y$ axes; and every drawing call adds to one Axes. Two calls do most of the work, and they make different claims:

- \`ax.plot(x, y)\` joins the points **in the order given** with straight lines. That is right for a *model* evaluated on a fine grid, where the lines are too short to see.
- \`ax.scatter(x, y)\` marks each point on its own. That is right for *measurements*, because nothing was recorded between two readings.

In this lab, every figure still open when your program ends appears below its output.`,
  symbols: [
    { tex: t`\texttt{fig, ax = plt.subplots()}`, text: 'make a Figure and one Axes; `plt.subplots(2, 1)` makes two Axes stacked one above the other' },
    { tex: t`\texttt{ax.plot(x, y, fmt)}`, text: 'straight lines through the points in order; the optional format string sets colour, marker and line style (`"o"` markers only, `"--"` dashed, `"r-"` a red line)' },
    { tex: t`\texttt{ax.scatter(x, y)}`, text: 'a marker at each point, unconnected; `s=` sets marker sizes and `c=` colours each point by a value' },
    { tex: t`\texttt{label=}\ \text{and}\ \texttt{ax.legend()}`, text: 'name each series as you draw it, then ask for the key' },
    { tex: t`\texttt{ax.set\_xlabel(…)}`, text: 'the axis titles: on an Axes the methods are `set_xlabel` and `set_ylabel` (`plt.xlabel` is the shortcut that acts on the current Axes)' },
    { tex: t`\texttt{plt.show()}`, text: 'display the figures; here every open figure is shown when the program ends, so it is optional' },
  ],
  why: 'A plot is how you check a simulation before trusting any number from it — and how everyone else will judge your result.',
  visual: {
    type: 'code-runner',
    title: 'A skydiver: two models and the measurements',
    lead: t`Press **Run** (Matplotlib loads the first time, which takes a few seconds). Two models are drawn as lines on a 400-point grid; the GPS readings are drawn as markers. Then break the figure on purpose, one task at a time.`,
    tasks: [
      'Change the 400 in `linspace` to 6 and run: the smooth curve becomes a polygon of 5 straight segments.',
      'Replace the `scatter` call by `ax.plot(t_gps, v_gps, label="GPS readings")`: the line invents a zigzag the skydiver never flew.',
      'Set `v_t = 80.0`, a head-down skydiver: the model approaches its higher terminal speed more slowly.',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt

# a skydiver falling belly-down: quadratic drag, constant air density
g, v_t = 9.81, 55.0                       # m/s², terminal speed in m/s
t = np.linspace(0, 20, 400)               # 400 times: a smooth curve
v_model = v_t * np.tanh(g * t / v_t)

# twelve wrist-GPS speed readings (synthetic, with noise)
rng = np.random.default_rng(7)
t_gps = np.arange(1.0, 20.0, 1.6)
v_gps = v_t * np.tanh(g * t_gps / v_t) + rng.normal(0, 1.5, t_gps.size)

fig, ax = plt.subplots()
ax.plot(t, g * t, "--", label="no air: v = g t")
ax.plot(t, v_model, label="model with drag")
ax.scatter(t_gps, v_gps, color="C2", zorder=3, label="GPS readings")
ax.set_xlabel("time after exit (s)")
ax.set_ylabel("speed (m/s)")
ax.set_ylim(0, 80)
ax.legend()
plt.show()
print(f"{len(t)} points in each line, {len(t_gps)} markers")`,
    },
    caption: 'Quadratic drag with constant air density: a real skydiver falls through thinning air, so the terminal speed is higher at altitude and drops as the air thickens. The GPS readings are synthetic. "C2" means the third colour of the style’s cycle.',
  },
  example: {
    prompt: t`A hot Jupiter crosses the face of its Sun-like star, blocking about 1% of the light for three hours. A photometer logged 60 brightness readings over eight hours (arrays \`t_obs\` in hours from mid-transit and \`flux\`, relative to the out-of-transit brightness). Make a labelled figure with the readings and a box-shaped transit model.`,
    visual: {
      type: 'graph',
      params: { x: [-4.3, 4.3], y: [0.983, 1.0065], aspect: 'wide', axesAt: 'edge', xlabel: 'time from mid-transit (h)', ylabel: 'relative brightness',
        curves: polyline(BOX, { color: 'gold', width: 2.2 }),
        points: T_OBS.map((x, k) => ({ x, y: F_OBS[k], color: 'accent', r: 2.6 })),
        legend: [{ label: 'photometry', color: 'accent', point: true }, { label: 'model', color: 'gold' }], legendAt: 'bl' },
      caption: 'The figure the program makes. The readings are synthetic, with 0.2% noise; a real light curve has rounded edges (the planet takes minutes to cross the star’s limb) and a curved floor (limb darkening), which the box model ignores.',
    },
    steps: [
      { label: 'Make the figure', text: t`Ask for a Figure and its Axes by name. Every later call says which Axes it draws on, which keeps working when a figure has several panels.

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
\`\`\`` },
      { label: 'Readings as markers', text: t`Measurements get markers and no lines: a line from one reading to the next would claim to know the brightness in between, and noise would make it zigzag.

\`\`\`python
ax.scatter(t_obs, flux, s=14, label="photometry")
\`\`\`` },
      { label: 'Model on a fine grid', text: t`The model is a function, so evaluate it on many more points than there are readings. Its edges are vertical, and 2001 points put them within 0.004 h of the right place; on the 60 reading times they would be slanted lines in the wrong place.

\`\`\`python
t = np.linspace(-4, 4, 2001)        # h
depth, half = 0.0101, 1.5           # fraction blocked; half-duration (h)
model = np.where(np.abs(t) < half, 1 - depth, 1.0)
ax.plot(t, model, color="C1", label="model")
\`\`\`` },
      { label: 'Label everything', text: t`Name each axis with its quantity and unit, and give the series their names in the legend.

\`\`\`python
ax.set_xlabel("time from mid-transit (h)")
ax.set_ylabel("relative brightness")
ax.legend()
\`\`\`` },
      { label: 'Sense check', text: t`The depth is the fraction of the star's disc the planet covers, $(R_p/R_\star)^2 = (${R_JUP}/${R_SUN})^2 = ${DEPTH.toFixed(4)}$ for a Jupiter-sized planet and a Sun-sized star. The readings scatter about the model by roughly the noise, 0.002, on both sides of the box, as they should if the model fits.` },
    ],
    answer: t`\`ax.scatter\` for the 60 readings, \`ax.plot\` for the model on a 2001-point grid, and both axes labelled: the dip of ${(100 * DEPTH).toFixed(2)}% stands out of the noise.`,
  },
  practice: [
    mcq({
      id: 'scribble', difficulty: 2,
      prompt: t`Eight thermocouples along a nozzle wall are logged by channel number, so the positions \`x\` (m) are not in order. The plot comes out as a scribble. Why?

\`\`\`python
x = np.array([${TC_X.map((x) => x.toFixed(2)).join(', ')}])   # m
T = np.array([${TC.map(([, y]) => y.toFixed(0)).join(', ')}])     # K
ax.plot(x, T)
\`\`\``,
      visual: {
        type: 'graph',
        params: { x: [-0.02, 0.37], y: [250, 1300], aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'T (K)',
          curves: polyline(TC, { color: 'accent', width: 2 }), points: TC.map(([x, y]) => ({ x, y, color: 'accent', r: 3 })) },
        caption: 'What the program draws: one line visiting the readings in the order they are stored.',
      },
      choices: [
        '`plot` joins the points in the order they are stored; sort them by x first, or use `scatter`',
        'Eight readings are too few for a line; it needs at least a hundred points',
        'The temperatures are too noisy to draw a line through',
        '`plot` cannot take positions that are not whole numbers',
      ],
      answer: 0,
      why: {
        1: 'Too few points give a coarse polygon, not lines that double back on themselves. The zigzag comes from the order.',
        2: 'These values follow a smooth profile; it is the order of the points, not their scatter, that makes the lines cross.',
        3: '`plot` takes any numbers. The problem is the sequence it visits them in.',
      },
      hints: ['Follow the line from the first reading in the array to the second: where are they on the x axis?', '`ax.plot` draws a segment from point k to point k + 1, whatever their x values.'],
      teach: '`ax.plot` connects points in array order, so data must be sorted along x first: `i = np.argsort(x); ax.plot(x[i], T[i])`.',
      explain: t`The line runs from $x = 0.30$ to $0.05$ to $0.20$ … in storage order. Sort with \`i = np.argsort(x)\` and plot \`x[i], T[i]\` — or, since these are measurements, use \`ax.scatter(x, T)\`, which does not care about order at all.`,
    }),
    mcq({
      id: 'fmt-string', difficulty: 1,
      prompt: t`What does the format string draw?

\`\`\`python
ax.plot(t, h, "ro--")
\`\`\``,
      choices: ['A red circle at each point, joined by a dashed line', 'Red circles only, with no line', 'A red dashed line of radius o', 'A solid red line with a dashed outline'],
      answer: 0,
      why: {
        1: 'A marker code alone (`"ro"`) gives markers only; adding a line style (`--`) adds the joining line.',
        2: '`o` is a marker shape (circle), not a size; the size is `markersize=`.',
        3: 'There is one line style per series: `--` makes the line itself dashed.',
      },
      hints: ['A format string is a colour, then a marker, then a line style, each optional.', '`r` is red, `o` a circle marker, `--` a dashed line.'],
      teach: 'A format string packs colour, marker and line style: `"ro--"` is red, circles, dashed; `"k-"` a solid black line; `"s"` square markers only.',
      explain: t`\`r\` = red, \`o\` = circle markers, \`--\` = dashed line. Format strings are a \`plot\` feature: \`scatter\` does not read them.`,
    }),
    mcq({
      id: 'ax-xlabel', difficulty: 2,
      prompt: t`A student mixes the two styles of Matplotlib. What happens?

\`\`\`python
fig, ax = plt.subplots()
ax.plot(r_km, v_kms)
ax.xlabel("orbit radius (km)")
\`\`\``,
      choices: [
        "`AttributeError: 'Axes' object has no attribute 'xlabel'` — on an Axes the method is `set_xlabel`",
        'The label appears, because `ax.xlabel` and `plt.xlabel` are the same function',
        'The label is put on the y axis',
        'Nothing visible: the label is stored but needs `plt.show()` to appear',
      ],
      answer: 0,
      why: {
        1: '`plt.xlabel` is a pyplot function that acts on the current Axes; an Axes object has `set_xlabel` instead.',
        2: 'Nothing is drawn: the line raises an error and the program stops there.',
        3: 'The program stops at the error before anything is labelled.',
      },
      hints: ['pyplot functions (`plt.xlabel`) and Axes methods (`ax.set_xlabel`) are named differently.', 'Python raises an AttributeError when an object has no method of that name.'],
      teach: 'pyplot’s `plt.xlabel`, `plt.title`, `plt.xlim` become `ax.set_xlabel`, `ax.set_title`, `ax.set_xlim` on an Axes.',
      explain: t`Axes methods that *set* something start with \`set_\`: \`ax.set_xlabel\`, \`ax.set_ylabel\`, \`ax.set_title\`, \`ax.set_xlim\`. The pyplot shortcuts (\`plt.xlabel\`) exist for quick scripts and act on whichever Axes is current.`,
    }),
    num({
      id: 'chord-gap', difficulty: 3,
      gen(r) {
        const npts = r.pick([8, 10, 13, 16, 21, 31]);
        const h = (2 * Math.PI) / (npts - 1), gap = (h * h) / 8;
        return {
          prompt: t`A sine wave is drawn with \`x = np.linspace(0, 2*np.pi, ${npts})\` and \`ax.plot(x, np.sin(x))\`. Each straight segment cuts a corner of the curve; between two points a distance $h$ apart, a chord strays from a curve by at most $(h^2/8)\max\lvert f''\rvert$. How far, at most, can the drawn line stray from $\sin x$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.1, 6.4], y: [-1.25, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '',
              curves: [{ fn: 'sin(x)', color: 'ink3', width: 1.5, dash: true, domain: [0, 2 * Math.PI] }, ...polyline(Array.from({ length: npts }, (_, k) => [k * h, Math.sin(k * h)]), { color: 'accent', width: 2.2 })],
              points: Array.from({ length: npts }, (_, k) => ({ x: k * h, y: Math.sin(k * h), color: 'accent', r: 3 })) },
            caption: t`The ${npts} points and the ${npts - 1} segments \`plot\` draws through them (blue), over the true curve (dashed).`,
          },
          answer: gap, tol: { rel: 0.03 },
          errors: [{ value: ((2 * Math.PI) / npts) ** 2 / 8, feedback: t`${npts} points make ${npts - 1} gaps, so $h = 2\pi/${npts - 1}$, not $2\pi/${npts}$.` }, { value: h / 8, feedback: 'The bound has h squared.' }],
          hints: [t`First the spacing: ${npts} points span $2\pi$ with ${npts - 1} gaps.`, t`$\lvert(\sin x)''\rvert = \lvert\sin x\rvert \le 1$, so the gap is at most $h^2/8$ with $h = 2\pi/${npts - 1}$.`],
          teach: 'A line plot is a polygon: its error is about h²/8 times the curvature, so halving the spacing makes the corners four times less visible.',
          explain: t`$h = 2\pi/${npts - 1} = ${h.toFixed(4)}$ and $h^2/8 = ${gap.toPrecision(3)}$ — ${(50 * gap).toFixed(gap < 0.02 ? 2 : 1)}% of the curve's full height of 2. On a plot a few hundred pixels tall, a corner smaller than about a pixel (roughly 0.3% of the height) is invisible: ${gap < 0.006 ? 'this one just about passes' : 'this one is plainly visible'}. That is why models are drawn with hundreds of points: at 400 points the gap is $${((2 * Math.PI / 399) ** 2 / 8).toExponential(1).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`)}$.`,
        };
      },
    }),
    code({
      id: 'galilean', difficulty: 2,
      prompt: t`Galileo's four moons of Jupiter test Kepler's laws. Their orbit radii \`a_km\` (km) and periods \`T_days\` are given. On the Axes \`ax\`:

- draw the circular-orbit model $v = \sqrt{GM_J/a}$ as a **line** over radii from 300 000 to 2 000 000 km, with at least 100 points, $x$ in km and $v$ in km/s;
- mark each moon's measured speed $v = 2\pi a/T$ (km/s) with a **scatter**;
- label both axes.`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

GM = 1.26686534e17                       # m³/s², Jupiter
a_km = np.array([${MOONS.map((m) => m[1]).join(', ')}])
T_days = np.array([${MOONS.map((m) => m[2]).join(', ')}])

fig, ax = plt.subplots()
# your plot here
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

GM = 1.26686534e17                       # m³/s², Jupiter
a_km = np.array([${MOONS.map((m) => m[1]).join(', ')}])
T_days = np.array([${MOONS.map((m) => m[2]).join(', ')}])

fig, ax = plt.subplots()
a = np.linspace(3e5, 2e6, 300)                   # km
ax.plot(a, np.sqrt(GM / (a * 1e3)) / 1e3, label="circular orbit model")
v_moons = 2 * np.pi * a_km / (T_days * 86400)    # km/s
ax.scatter(a_km, v_moons, color="C1", zorder=3, label="Galilean moons")
ax.set_xlabel("orbit radius (km)")
ax.set_ylabel("orbital speed (km/s)")
ax.legend()`,
      tests: [
        { name: 'one line with at least 100 points', code: 'len(ax.lines) >= 1 and len(ax.lines[0].get_xdata()) >= 100' },
        { name: t`the line follows $v = \sqrt{GM/a}$ in km/s`, code: 'np.allclose(ax.lines[0].get_ydata(), np.sqrt(GM / (np.asarray(ax.lines[0].get_xdata(), float) * 1e3)) / 1e3, rtol=1e-6)' },
        { name: t`four markers at $v = 2\pi a/T$`, code: 'len(ax.collections) >= 1 and np.allclose(ax.collections[0].get_offsets(), np.column_stack([a_km, 2 * np.pi * a_km / (T_days * 86400)]), rtol=1e-6)' },
        { name: 'both axes are labelled', code: 'ax.get_xlabel().strip() != "" and ax.get_ylabel().strip() != ""' },
      ],
      hints: ['Model: `a = np.linspace(3e5, 2e6, 300)` in km; convert to metres inside the square root and the speed back to km/s.', 'Measured: `2 * np.pi * a_km / (T_days * 86400)` is in km/s. Then `ax.scatter(a_km, v_moons)`, `ax.set_xlabel(...)`, `ax.set_ylabel(...)`.'],
      teach: 'A model is a line on a fine grid; measured values are markers on top of it — the eye then judges the fit at once.',
      explain: t`The moons sit on the curve: Io moves at ${vKepler(MOONS[0][1]).toFixed(1)} km/s and Callisto at ${vKepler(MOONS[3][1]).toFixed(1)} km/s, just as $v \propto a^{-1/2}$ predicts. The tests read the figure back from \`ax\`: \`ax.lines\` holds what \`plot\` drew and \`ax.collections\` what \`scatter\` drew.`,
    }),
    code({
      id: 'two-panels', difficulty: 3,
      prompt: t`A shake-table test of a satellite's solar-array hinge gives its displacement \`x\` (mm) and velocity \`v\` (mm/s) against time \`t\` (s). Make a figure \`fig\` with two Axes, \`ax1\` above \`ax2\`, **sharing the time axis**; plot \`x\` on \`ax1\` and \`v\` on \`ax2\`; give each a $y$ label and the bottom one the time label.`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 4, 800)                        # s
x = 12.0 * np.exp(-0.6 * t) * np.cos(9.0 * t)     # mm
v = np.gradient(x, t)                             # mm/s

# fig, with ax1 above ax2, sharing the time axis
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 4, 800)                        # s
x = 12.0 * np.exp(-0.6 * t) * np.cos(9.0 * t)     # mm
v = np.gradient(x, t)                             # mm/s

fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True)
ax1.plot(t, x)
ax1.set_ylabel("displacement (mm)")
ax2.plot(t, v, color="C1")
ax2.set_ylabel("velocity (mm/s)")
ax2.set_xlabel("time (s)")`,
      tests: [
        { name: 'two Axes in the figure', code: 'len(fig.axes) == 2' },
        { name: 'they share the time axis', code: 'ax1.get_shared_x_axes().joined(ax1, ax2)' },
        { name: t`$x$ on the top panel, $v$ on the bottom one`, code: 'np.allclose(ax1.lines[0].get_ydata(), x) and np.allclose(ax2.lines[0].get_ydata(), v)' },
        { name: 'y labels on both, the time label at the bottom', code: 'ax1.get_ylabel().strip() != "" and ax2.get_ylabel().strip() != "" and ax2.get_xlabel().strip() != ""' },
      ],
      hints: ['`plt.subplots(2, 1, sharex=True)` returns the figure and an array of two Axes, which unpacks as `fig, (ax1, ax2) = …`.', 'Then `ax1.plot(t, x)`, `ax2.plot(t, v)`, and the three `set_…label` calls.'],
      teach: '`plt.subplots(rows, cols, sharex=True)` lays out several Axes that zoom and pan together — the standard way to compare quantities on one time base.',
      explain: t`With \`sharex=True\` both panels show the same time range and only the bottom one needs tick labels. Reading down at any instant shows the quarter-cycle lag between displacement and velocity: $v$ peaks when $x$ crosses zero.`,
    }),
    mcq({
      id: 'current-axes', difficulty: 2,
      prompt: t`Where do the second line and the title end up?

\`\`\`python
fig1, ax1 = plt.subplots()
fig2, ax2 = plt.subplots()
ax1.plot([0, 1], [0, 1])
plt.plot([0, 1], [1, 0])
plt.title("calibration")
\`\`\``,
      choices: ['On `fig2`: pyplot functions act on the most recently created figure', 'On `fig1`, beside the first line: pyplot follows the Axes you last drew on', 'On a new, third figure', 'Nowhere: mixing `ax.` and `plt.` calls raises an error'],
      answer: 0,
      why: {
        1: 'Drawing on `ax1` with a method does not make it current; only creating or selecting a figure (`plt.figure(1)`, `plt.sca(ax1)`) does.',
        2: '`plt.plot` makes a new figure only when none exists.',
        3: 'The two styles mix freely — which is how this mix-up goes unnoticed.',
      },
      hints: ['pyplot keeps a “current figure” and “current Axes”.', 'Which figure was created last?'],
      teach: 'pyplot calls go to the current Axes — usually the last one created — so in multi-figure programs, call methods on the Axes you mean.',
      explain: t`\`plt.plot\` and \`plt.title\` act on the current Axes, which is \`ax2\`, the last one created. The first figure gets one line and no title. Calling methods on named Axes (\`ax1.set_title(...)\`) removes the guesswork.`,
    }),
  ],
  checkpoint: [
    code({
      id: 'cp-51peg', difficulty: 2, transfer: true,
      prompt: t`In 1995 the star 51 Pegasi was found to wobble with a period of ${P51} days: the first planet found around a Sun-like star. Its radial velocity follows $v_r = K\sin(2\pi t/P)$ with $K = ${K51}$ m/s. Using the Axes \`ax\`, draw the model as a line over two periods ($0 \le t \le 2P$) with at least 200 points, and the measurements \`t_obs\`, \`v_obs\` as a scatter. Label both axes and add a legend.`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

P, K = ${P51}, ${K51}.0                          # days, m/s
rng = np.random.default_rng(1995)
t_obs = np.sort(rng.uniform(0, 2 * P, 18))     # days
v_obs = K * np.sin(2 * np.pi * t_obs / P) + rng.normal(0, 6, 18)   # m/s

fig, ax = plt.subplots()
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

P, K = ${P51}, ${K51}.0                          # days, m/s
rng = np.random.default_rng(1995)
t_obs = np.sort(rng.uniform(0, 2 * P, 18))     # days
v_obs = K * np.sin(2 * np.pi * t_obs / P) + rng.normal(0, 6, 18)   # m/s

fig, ax = plt.subplots()
t = np.linspace(0, 2 * P, 500)
ax.plot(t, K * np.sin(2 * np.pi * t / P), label="orbit model")
ax.scatter(t_obs, v_obs, color="C1", zorder=3, label="measurements")
ax.set_xlabel("time (days)")
ax.set_ylabel("radial velocity (m/s)")
ax.legend()`,
      tests: [
        { name: 'a model line of at least 200 points over two periods', code: 'len(ax.lines) >= 1 and len(ax.lines[0].get_xdata()) >= 200 and abs(min(ax.lines[0].get_xdata())) < 1e-9 and abs(max(ax.lines[0].get_xdata()) - 2 * P) < 1e-6' },
        { name: t`the line is $K\sin(2\pi t/P)$`, code: 'np.allclose(ax.lines[0].get_ydata(), K * np.sin(2 * np.pi * np.asarray(ax.lines[0].get_xdata(), float) / P))' },
        { name: 'the 18 measurements as markers', code: 'len(ax.collections) >= 1 and np.allclose(ax.collections[0].get_offsets(), np.column_stack([t_obs, v_obs]))' },
        { name: 'labelled axes and a legend', code: 'ax.get_xlabel().strip() != "" and ax.get_ylabel().strip() != "" and ax.get_legend() is not None' },
      ],
      hints: ['`t = np.linspace(0, 2 * P, 500)` for the model; pass `label=` to both drawing calls.', '`ax.plot(t, K * np.sin(2 * np.pi * t / P), label=…)`, `ax.scatter(t_obs, v_obs, label=…)`, the two labels, then `ax.legend()`.'],
      teach: 'The same figure grammar fits any fit-versus-data plot: the model as a line on a fine grid, the measurements as markers, units on the axes, and a legend.',
      explain: t`A ${K51} m/s wobble is walking pace — Mayor and Queloz measured it from Doppler shifts of about one part in $5\times10^{6}$ of the light's frequency. The synthetic noise here is 6 m/s; the best spectrographs today reach about 1 m/s or better. On the figure the measurements scatter evenly about the line, the visual sign of a good model.`,
    }),
    mcq({
      id: 'cp-hubble', difficulty: 1,
      prompt: t`A Hubble diagram shows galaxies' distances \`d\` (Mpc) and recession speeds \`v\` (km/s), and the fitted law $v = H_0 d$ (arrays \`d_fit\`, \`v_fit\`). Which code draws it honestly?`,
      visual: {
        type: 'graph',
        params: { x: [0, 150], y: [-500, 10500], aspect: 'wide', axesAt: 'edge', xlabel: 'distance (Mpc)', ylabel: 'speed (km/s)',
          curves: [{ fn: '70x', color: 'gold', domain: [0, 145] }], points: GAL.map(([x, y]) => ({ x, y, color: 'accent', r: 3.5 })) },
        caption: 'Synthetic galaxies scattered about a line of slope 70 km/s per Mpc, roughly today’s measured Hubble constant.',
      },
      choices: [
        '`ax.scatter(d, v)` and `ax.plot(d_fit, v_fit)`',
        '`ax.plot(d, v)` and `ax.scatter(d_fit, v_fit)`',
        '`ax.plot(d, v, "o-")` and `ax.plot(d_fit, v_fit)`',
        '`ax.scatter(d, v)` and `ax.scatter(d_fit, v_fit)`',
      ],
      answer: 0,
      why: {
        1: 'That joins the galaxies with lines and draws the fitted law as dots — the two roles swapped.',
        2: '`"o-"` adds lines between the galaxies, implying a path from one galaxy to the next.',
        3: 'A law holds at every distance, not only at sample points: draw it as a line.',
      },
      hints: ['Which of the two is a set of separate measurements, and which is a continuous law?'],
      teach: 'Separate measurements are markers; a law or model is a line.',
      explain: 'Each galaxy is an independent measurement, so markers; the Hubble law holds at every distance, so a line. Joining galaxies with lines would suggest an order, or a path, that does not exist.',
    }),
    mcq({
      id: 'cp-scatter-fmt', difficulty: 2,
      prompt: t`What happens?

\`\`\`python
ax.scatter(t_obs, v_obs, "r")
\`\`\``,
      choices: [
        '`ValueError: s must be a scalar, or float array-like…` — the third argument of `scatter` is the marker size, not a format string',
        'Red markers appear: `scatter` reads format strings like `plot`',
        'The markers are joined by a red line',
        'Nothing: the extra argument is ignored',
      ],
      answer: 0,
      why: {
        1: 'Format strings belong to `plot`. For `scatter`, colour is a keyword: `color="r"`.',
        2: '`scatter` never draws lines.',
        3: 'Python passes it on as the size `s`, which must be numbers — so it fails loudly.',
      },
      hints: ['Look up the signature: `ax.scatter(x, y, s=None, c=None, …)`.'],
      teach: '`scatter(x, y, s, c)` takes sizes and colours as arguments (`color="r"`); only `plot` reads format strings like `"ro"`.',
      explain: t`\`scatter(x, y, s=None, c=None, ...)\`: the third positional argument is the marker area \`s\`, and \`"r"\` is not a number, so Matplotlib raises \`ValueError\`. Write \`ax.scatter(t_obs, v_obs, color="r")\`, or \`ax.plot(t_obs, v_obs, "ro")\`.`,
    }),
  ],
  sources: [
    { label: 'Matplotlib: Quick start guide (Figure, Axes, the two interfaces)', url: 'https://matplotlib.org/stable/users/explain/quick_start.html' },
    { label: 'Matplotlib: matplotlib.axes.Axes.plot (format strings)', url: 'https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.plot.html' },
    { label: 'Mayor & Queloz (1995), A Jupiter-mass companion to a solar-type star, Nature 378, 355', url: 'https://doi.org/10.1038/378355a0' },
  ],
});
