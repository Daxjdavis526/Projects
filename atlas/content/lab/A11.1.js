// Figures that tell the truth — making a figure that a reader can check:
// show the data as points (not a smooth line through them), error bars with
// a statement of what they are (SD, SEM or a 95 % interval differ by √N and
// by 2), axes labelled with quantity and unit, honest ranges (no truncated
// baselines for amounts), a residual panel under every fit, log axes when
// data span decades, colour that survives colour-blindness and greyscale
// (redundant marker shapes), and a caption that says N, the fit, and what
// is simulated. Reading plots critically is research.R2.2; this is the
// author's side. A photodiode's responsivity throughout; a launch
// vehicle's success-rate chart as the transfer.
// Every number is computed here from seeded synthetic data (_labf.js).
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { normals, linfit, dataGraph, resGraph, r6, SIMNOTE, table } from './_labf.js';

const t = String.raw;

// two groups of N = 8 readings, for the Explore's error-bar types
const GA = 10.0, GB = 10.9, SD = 1.0, NG = 8, T7 = 2.3646;
const SEM = SD / Math.sqrt(NG), CI = T7 * SEM;

// ── a photodiode against laser power: I = R P + I_dark, σ = 1 % + 2 nA (seed 61) ──
const PP = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];        // mW
const II = (() => { const z = normals(61); return PP.map((p) => { const I = 0.512 * p + 0.004; return +(I + Math.hypot(0.01 * I, 0.002) * z()).toFixed(4); }); })();  // mA
const SI = II.map((I) => +Math.hypot(0.01 * I, 0.002).toFixed(4));
const PD = linfit(PP, II, SI);

const barPic = (k, caption) => ({ type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [7, 13], xlabel: '', ylabel: 'reading (units)', xticks: 0, axesAt: 'edge', curves: [[1, GA], [2, GB]].flatMap(([x, y]) => [{ param: [`${x}`, `${r6(y - k)} + ${r6(2 * k)}*t`], t: [0, 1], color: 'accent', width: 2 }, { param: [`${x - 0.06} + 0.12*t`, `${r6(y + k)}`], t: [0, 1], color: 'accent', width: 2 }, { param: [`${x - 0.06} + 0.12*t`, `${r6(y - k)}`], t: [0, 1], color: 'accent', width: 2 }]), points: [{ x: 1, y: GA, r: 5, color: 'accent', label: 'P' }, { x: 2, y: GB, r: 5, color: 'accent', label: 'Q' }] }, caption });

export default lesson({
  id: 'lab.A11.1',
  title: 'Figures that tell the truth',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`A figure is evidence, and a reader should be able to check your claim from it alone ([reading figures critically](#/lesson/research.R2.2) is the other side of this lesson). So: plot the **data as points**, with **error bars**, and say in the caption what the bars are — a standard deviation, a standard error, a 95 % interval — because they differ by $\sqrt N$ and by about 2. Label each axis with a quantity and its unit. Put a fit’s **residuals** in a panel underneath, where a reader can judge it. Choose ranges that do not exaggerate, log axes when data span decades, and colours that survive colour-blindness and a black-and-white printer. A residual panel shows

$$R_i = \frac{y_i - f(x_i)}{\sigma_i}$$

for each point: about two-thirds within $\pm1$, none far beyond $\pm3$, and no pattern, if the fit and the error bars are honest.`,
  symbols: [
    { tex: 'R_i', text: 'the normalized residual of point $i$: how many of its own error bars it sits from the fit' },
    { tex: 'y_i,\\ x_i', text: 'the measured value and its setting' },
    { tex: 'f(x_i)', text: 'the fitted model at that setting' },
    { tex: '\\sigma_i', text: 'the standard uncertainty of $y_i$ — the error bar, if the bars are $\\pm1\\sigma$' },
  ],
  why: t`Most readers look only at the figures. A figure that hides its error bars’ meaning, truncates an axis or smooths away the data can mislead without a single false number.`,
  visual: {
    type: 'graph',
    title: 'What do the error bars mean?',
    lead: t`The same two groups of eight readings, P and Q, with means 10.0 and 10.9 and a standard deviation of 1.0 in each. Switch what the bars show. Nothing about the data changes; whether the bars overlap does.`,
    tasks: [
      'With standard-deviation bars the groups overlap heavily: SD bars describe the spread of single readings, not how well the means are known.',
      'With standard-error bars (SD/√8) they no longer overlap — yet the difference is only 1.8 standard errors of the difference, short of 2σ.',
      'With 95 % interval bars (t × SEM) they overlap again. Overlap means nothing until the caption says which bars these are.',
    ],
    params: {
      aspect: 'wide', x: [0, 3], y: [7, 13], xlabel: '', ylabel: 'reading (units)', xticks: 0, axesAt: 'edge',
      choices: [{ key: 'v', label: 'Error bars show', options: [[1, 'standard deviation'], [2, 'standard error of the mean'], [3, '95 % interval of the mean']], value: 1, explain: 'Three common choices for the same data: SD, SD/√N, and t × SD/√N with t = 2.36 for 7 degrees of freedom.' }],
      curves: [1, 2, 3].flatMap((k) => { const h = k === 1 ? SD : k === 2 ? SEM : CI; const w = `step(0.5 - abs(v - ${k}))`; return [[1, GA], [2, GB]].flatMap(([x, y]) => [{ param: [`${x}`, `${r6(y - h)} + ${r6(2 * h)}*t`], t: [0, 1], color: 'accent', width: 2.2, when: w }, { param: [`${x - 0.06} + 0.12*t`, `${r6(y + h)}`], t: [0, 1], color: 'accent', width: 2.2, when: w }, { param: [`${x - 0.06} + 0.12*t`, `${r6(y - h)}`], t: [0, 1], color: 'accent', width: 2.2, when: w }]); }),
      points: [{ x: 1, y: GA, r: 5, color: 'accent', label: 'P' }, { x: 2, y: GB, r: 5, color: 'accent', label: 'Q' }],
      readouts: [{ label: 'half-length of each bar', expr: `${r6(SD)}*step(0.5 - abs(v - 1)) + ${r6(SEM)}*step(0.5 - abs(v - 2)) + ${r6(CI)}*step(0.5 - abs(v - 3))`, digits: 3 }],
    },
    caption: t`Constructed numbers: two groups of $N = 8$, each with standard deviation 1.0. Standard error $= 1.0/\sqrt8 = ${SEM.toFixed(3)}$; the 95 % interval uses Student’s $t = 2.365$ for 7 degrees of freedom.`,
  },
  example: {
    prompt: t`A photodiode’s current $I$ is measured at eight laser powers $P$, each reading with $\sigma_I = 1\,\% + 0.002$ mA:

${table([[t`P\ (\text{mW})`, ...PP.map((p) => p.toFixed(1))], [t`I\ (\text{mA})`, ...II.map((v) => v.toFixed(4))]])}

Make the figure that reports the responsivity, and write its caption.`,
    visual: { type: 'graph', params: dataGraph({ xs: PP, ys: II, sy: SI, fit: PD, xlabel: 'laser power P (mW)', ylabel: 'photocurrent I (mA)', x: [0, 4.5], y: [0, 2.2], legend: [{ label: 'data (±1σ)', color: 'accent', point: true }, { label: 'weighted fit', color: 'gold' }], legendAt: 'tl' }), caption: t`Photocurrent against laser power. Points: single readings with $\pm1\sigma$ bars ($1\,\% + 0.002$ mA). Line: weighted least squares, $I = (${PD.b.toFixed(4)} \pm ${PD.sb.toFixed(4)})\,P + (${PD.a.toFixed(4)} \pm ${PD.sa.toFixed(4)})$ mA, $\chi^2/\nu = ${PD.chi2r.toFixed(2)}$ for $\nu = 6$. Residuals: next figure. ${SIMNOTE}` },
    steps: [
      { label: 'Points, not a curve', text: t`Each reading is a marker. A line joining them would claim knowledge of $I$ between the powers you set; the only line drawn is the fitted model, which makes exactly that claim on purpose.` },
      { label: 'Axes', text: t`“laser power $P$ (mW)” and “photocurrent $I$ (mA)”: a quantity and a unit on each. Start both at zero here — the intercept (dark current) is a result, and the reader should see where zero is.` },
      { label: 'Error bars', text: t`$\pm1\sigma$ for single readings, and the caption says so. At 0.5 mW the bar is $${SI[0].toFixed(4)}$ mA, at 4.0 mW $${SI[7].toFixed(4)}$ mA — too small to see at this scale, which is itself worth saying.` },
      { label: 'Residuals', text: t`Bars invisible on the data plot are exactly why the residual panel exists: there, each point’s distance from the line is shown on the scale of its own error bar.` },
      { label: 'Caption', text: t`What is plotted, what the bars are, the fit with its uncertainties and $\chi^2/\nu$, the number of points, and whether the data are simulated. A reader should not need the text to understand the figure.` },
    ],
    answer: t`Points with stated $\pm1\sigma$ bars, the weighted line, labelled axes from zero, a residual panel, and a caption giving the responsivity $${PD.b.toFixed(4)} \pm ${PD.sb.toFixed(4)}$ A/W with $\chi^2/\nu$.`,
  },
  practice: [
    num({
      id: 'sd-to-sem', difficulty: 1,
      gen(r) {
        const N = r.pick([4, 9, 16, 25, 36]), sd = r.float(0.5, 4, 0.1);
        const ans = sd / Math.sqrt(N);
        return {
          prompt: t`A figure shows a mean of $N = ${N}$ readings with error bars of $\pm${sd}$, and the caption says they are standard deviations. How long would the bars be as standard errors of the mean?`,
          visual: barPic(sd / 3, 'Two means with error bars; the caption must say what the bars are.'),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: sd / N, feedback: 'The standard error is SD/√N, not SD/N.' }, { value: sd * Math.sqrt(N), feedback: 'The standard error is smaller than the SD: divide by √N.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\text{SEM} = \text{SD}/\sqrt N$.`],
          teach: 'SD bars show the spread of single readings; SEM bars show how well the mean is known — √N shorter.',
          explain: t`$${sd}/\sqrt{${N}} = ${ans.toFixed(3)}$. Same data, bars ${Math.sqrt(N).toFixed(0)} times shorter: a reader who does not know which was drawn cannot judge anything.`,
        };
      },
    }),
    num({
      id: 'touching', difficulty: 3,
      gen(r) {
        const s1 = r.float(0.2, 1.0, 0.01), s2 = r.float(0.2, 1.0, 0.01);
        const ans = (s1 + s2) / Math.hypot(s1, s2);
        return {
          prompt: t`Two independent results are plotted with $\pm1\sigma$ bars of $${s1}$ and $${s2}$, and the bars **just touch**. How many standard uncertainties apart are the two values?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [-1.6, r6(s1 + 2 * s2 + 0.6)], xlabel: '', ylabel: 'value', xticks: 0, axesAt: 'edge', curves: [{ param: ['1', `${-s1} + ${2 * s1}*t`], t: [0, 1], color: 'accent', width: 2 }, { param: ['2', `${s1} + ${2 * s2}*t`], t: [0, 1], color: 'violet', width: 2 }], points: [{ x: 1, y: 0, r: 5, color: 'accent' }, { x: 2, y: r6(s1 + s2), r: 5, color: 'violet' }], hlines: [{ y: s1, color: 'ink4' }] }, caption: 'Two results whose ±1σ bars just meet.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2, feedback: 'The uncertainties of independent results add in quadrature, not linearly.' }, { value: 1, feedback: 'Touching bars do not mean 1σ apart: the difference is σ₁ + σ₂, its uncertainty √(σ₁² + σ₂²).' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['The gap between the values is σ₁ + σ₂.', t`Its uncertainty is $\sqrt{\sigma_1^2 + \sigma_2^2}$; divide.`],
          teach: 'Whether bars overlap is not a significance test: compute the difference over its combined uncertainty.',
          explain: t`$(${s1} + ${s2})/\sqrt{${s1}^2 + ${s2}^2} = ${ans.toFixed(2)}$ standard uncertainties — always between 1 and $\sqrt2 \approx 1.41$, never 2. Just-touching $1\sigma$ bars are *not* a significant difference; just-touching 95 % bars are a very significant one. See [agreement within uncertainty](#/lesson/lab.A4.1).`,
        };
      },
    }),
    mcq({
      id: 'truncated', difficulty: 2,
      prompt: t`A report shows the yields of two processes as bars with heights 98.2 % and 99.1 %, on a vertical axis running from 97.5 % to 99.5 %. What is wrong?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3], y: [97.5, 99.5], xlabel: '', ylabel: 'yield (%)', xticks: 0, axesAt: 'edge', curves: [{ param: ['1', '97.5 + 0.7*t'], t: [0, 1], color: 'accent', width: 40 }, { param: ['2', '97.5 + 1.6*t'], t: [0, 1], color: 'violet', width: 40 }] }, caption: 'The chart as published.' },
      choices: ['A bar’s length encodes an amount, so a baseline not at zero makes a 0.9 % difference look like a factor of two', 'Nothing: the axis is zoomed to show the difference clearly', 'Yields should be plotted on a log scale', 'There should be more tick marks'],
      answer: 0,
      why: {
        1: 'Zooming is fine for points with error bars, where position carries the value; bars are read by their length, which a cut baseline falsifies.',
        2: 'A log scale changes nothing here; the issue is the baseline.',
        3: 'More ticks would not fix bars whose lengths lie.',
      },
      hints: ['How does a reader judge the size of a bar?'],
      teach: 'Bars must start at zero; to show small differences, plot points with error bars (or the difference itself).',
      explain: t`The second bar looks more than twice the first, for a 0.9 percentage-point difference. Plot the two values as points with their uncertainties on a zoomed axis — position, not length, then carries the information honestly.`,
    }),
    mcq({
      id: 'log-axes', difficulty: 2,
      prompt: t`A detector’s count rate falls from $10^5$ to 10 counts per second over an hour, and you want to show whether the fall is exponential. Which axes?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 60], y: [0, 105000], xlabel: 't (min)', ylabel: 'rate (s⁻¹)', axesAt: 'edge', curves: [{ fn: '100000*exp(-x/6.5)', color: 'accent' }] }, caption: 'The data on linear axes: everything after 20 minutes is squashed onto the baseline.' },
      choices: ['Rate on a logarithmic scale, time linear: an exponential becomes a straight line and every decade is visible', 'Both axes logarithmic', 'Both linear, as above, with more tick marks', 'Rate linear, time logarithmic'],
      answer: 0,
      why: {
        1: 'Log–log axes straighten power laws, not exponentials.',
        2: 'Linear axes hide four of the five decades.',
        3: 'That straightens nothing here.',
      },
      hints: [t`Take the log of $R = R_0e^{-t/\tau}$.`],
      teach: 'Semi-log axes straighten exponentials and show every decade; log–log axes straighten power laws.',
      explain: t`$\ln R = \ln R_0 - t/\tau$: a straight line on semi-log axes, its slope $-1/\tau$. Deviations — a second component, a background floor — become visible as bends.`,
    }),
    multi({
      id: 'caption', difficulty: 2,
      prompt: t`Which of these belong in the caption of a figure showing data with a fitted line?`,
      visual: { type: 'graph', params: dataGraph({ xs: PP, ys: II, sy: SI, fit: PD, xlabel: 'laser power P (mW)', ylabel: 'photocurrent I (mA)', x: [0, 4.5], y: [0, 2.2] }), caption: 'A figure awaiting its caption.' },
      choices: ['what the error bars represent (e.g. ±1σ of single readings)', 'the fitted model and its parameters with uncertainties', 'whether the data are simulated, and N', 'the software used to draw the figure', 'a statement that the fit is excellent'],
      answer: [0, 1, 2],
      why: { 3: 'The software matters for reproducibility (in the methods or the analysis record), not for reading the figure.', 4: 'Show χ²/ν and the residuals; let the reader judge. Adjectives are not evidence.' },
      hints: ['What does a reader need to interpret the bars and the line without reading the text?'],
      teach: 'A caption makes the figure self-contained: what is plotted, what the bars mean, the fit and its quality, and where the data came from.',
      explain: t`Bars, model, numbers and provenance let a reader check the claim. Judgements (“excellent agreement”) belong nowhere without the χ² and residuals that justify them.`,
    }),
    mcq({
      id: 'colour', difficulty: 1,
      prompt: t`Your figure shows three data series in red, green and blue dots of the same shape. What is the most important fix?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [0, 4], xlabel: 'x', ylabel: 'y', axesAt: 'edge', points: [...[1, 2, 3, 4, 5].map((x) => ({ x, y: 0.5 + 0.4 * x, r: 4, color: 'bad' })), ...[1, 2, 3, 4, 5].map((x) => ({ x, y: 0.3 + 0.5 * x, r: 4, color: 'good' })), ...[1, 2, 3, 4, 5].map((x) => ({ x, y: 0.1 + 0.6 * x, r: 4, color: 'accent' }))] }, caption: 'Three series distinguished by colour alone.' },
      choices: ['Give each series a different marker shape (and use a colour-blind-safe palette), with a legend', 'Make the dots bigger', 'Add a grid', 'Use a dark background'],
      answer: 0,
      why: { 1: 'Bigger dots of indistinguishable colours are still indistinguishable.', 2: 'A grid helps reading values, not telling series apart.', 3: 'Background colour does not separate red from green for a reader with deuteranopia.' },
      hints: ['About one man in twelve has some form of red–green colour blindness, and many figures get printed in grey.'],
      teach: 'Encode series redundantly — shape and colour — so the figure survives colour blindness and greyscale printing.',
      explain: t`Red and green look alike to about 8 % of men; in greyscale all three may merge. Circles, squares and triangles in a palette chosen for colour-blind readers, plus a legend, fix both.`,
    }),
    code({
      id: 'mpl-figure', difficulty: 3,
      prompt: t`Draw the photodiode figure properly with Matplotlib: \`fig, (ax, axr) = plt.subplots(2, 1, sharex=True, gridspec_kw={'height_ratios': [3, 1]})\`. On \`ax\`: the data with \`ax.errorbar(..., fmt='o')\` and the fitted line; on \`axr\`: the normalized residuals $(I - f(P))/\sigma$ as points, with a horizontal line at 0. Label the x-axis of \`axr\` and the y-axes of both with quantities and units (normalized residuals have none).`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

P  = np.array([${PP.join(', ')}])             # mW
I  = np.array([${II.join(', ')}])   # mA
sI = np.array([${SI.join(', ')}])   # mA
(b, a) = np.polyfit(P, I, 1, w=1/sI)

# your code: the two panels
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

P  = np.array([${PP.join(', ')}])             # mW
I  = np.array([${II.join(', ')}])   # mA
sI = np.array([${SI.join(', ')}])   # mA
(b, a) = np.polyfit(P, I, 1, w=1/sI)

fig, (ax, axr) = plt.subplots(2, 1, sharex=True, gridspec_kw={'height_ratios': [3, 1]})
ax.errorbar(P, I, yerr=sI, fmt='o', label='data (±1σ)')
x = np.linspace(0, 4.5, 100)
ax.plot(x, a + b * x, label='weighted fit')
ax.set_ylabel('photocurrent I (mA)')
ax.legend()
axr.plot(P, (I - (a + b * P)) / sI, 'o')
axr.axhline(0, color='k', lw=1)
axr.set_xlabel('laser power P (mW)')
axr.set_ylabel('residual / σ')`,
      tests: [
        { name: 'two panels sharing an x-axis', code: 'len(fig.axes) == 2' },
        { name: 'the data drawn with error bars on the top panel', code: 'len(ax.containers) >= 1' },
        { name: 'a fitted line on the top panel', code: 'len(ax.lines) >= 2' },
        { name: 'residuals on the bottom panel, normalized by σ', code: `any(np.allclose(np.asarray(l.get_ydata(), float), (I - (a + b * P)) / sI) for l in axr.lines if len(l.get_ydata()) == 8)` },
        { name: 'axes labelled: power with its unit, current with its unit', code: '"(mW)" in axr.get_xlabel() and "(mA)" in ax.get_ylabel() and axr.get_ylabel().strip() != ""' },
      ],
      hints: [t`\`ax.errorbar(P, I, yerr=sI, fmt='o')\` draws points with bars; \`ax.plot(x, a + b*x)\` the line over a fine \`x = np.linspace(0, 4.5, 100)\`.`, t`\`axr.plot(P, (I - (a + b*P))/sI, 'o')\`; \`axr.axhline(0)\`; then \`set_xlabel\`/\`set_ylabel\` with units in brackets.`],
      teach: 'Data with bars, the model, residuals underneath, and labelled axes: four calls make a figure a reader can check.',
      explain: t`The residual panel shows what the top panel cannot: each point within about $\pm2$ of its own error bar, with no trend — so the line is an adequate model and the bars are honest ($\chi^2/\nu = ${PD.chi2r.toFixed(2)}$).`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-launch', difficulty: 2, transfer: true,
      prompt: t`A launch provider’s brochure plots its rocket’s cumulative success rate after each flight, from 50 % after two flights to 97 % after 60, as a smooth curve with no error bars. What would make the figure honest?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 62], y: [0.4, 1.02], xlabel: 'flight number', ylabel: 'success rate', axesAt: 'edge', curves: [{ fn: '1 - 0.5*exp(-(x - 2)/12) - 0.03', color: 'accent', domain: [2, 60] }] }, caption: 'The brochure’s smooth curve (schematic).' },
      choices: ['Plot each point with a binomial uncertainty (wide early, narrow late), and no smoothing line implying data between flights', 'Add a trend line extrapolated to 100 %', 'Start the vertical axis at 90 % to show the recent rate clearly', 'Remove the early flights, which were before the design matured'],
      answer: 0,
      why: { 1: 'Extrapolating claims flights that have not happened.', 2: 'A truncated axis would exaggerate small changes and hide the early record.', 3: 'Dropping inconvenient data is cherry-picking unless the reason is stated and both versions shown.' },
      hints: ['After 2 flights, how well is a success rate known?', 'Is there any information between flight 5 and flight 6?'],
      teach: 'A rate from a few trials carries a large binomial uncertainty; a smooth curve through cumulative points hides it.',
      explain: t`After $n$ flights the rate $p$ has standard uncertainty about $\sqrt{p(1 - p)/n}$ — after 2 flights, $\pm 35$ points. Points with those bars show that the early record says little, which is the honest message.`,
    }),
    num({
      id: 'cp-resid', difficulty: 2,
      gen(r) {
        const y = r.float(10, 50, 0.01), fy = +(y + r.sign() * r.float(0.05, 1.5, 0.01)).toFixed(2), s = r.pick([0.2, 0.3, 0.5, 0.8]);
        const ans = (y - fy) / s;
        return {
          prompt: t`A point $y = ${y}$ has $\sigma = ${s}$, and the fitted model gives $f = ${fy}$ there. What normalized residual does it get in the residual panel?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [-4, 4], xlabel: 'x', ylabel: 'residual / σ', axesAt: 'edge', hlines: [{ y: 0, color: 'gold' }, { y: 1, color: 'ink4' }, { y: -1, color: 'ink4' }], points: [2, 3, 4, 6, 7, 8, 9].map((x, i) => ({ x, y: [0.4, -0.9, 0.7, 1.2, -0.3, -1.1, 0.2][i], r: 3.5, color: 'accent' })) }, caption: 'A residual panel with the ±1 band marked; the point asked about is not yet drawn.' },
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: -ans, feedback: 'Residual = data − model.' }, { value: y - fy, feedback: 'Normalize: divide by the point’s σ.' }].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`$R = (y - f)/\sigma$.`],
          teach: 'Normalized residuals put every point on the scale of its own error bar.',
          explain: t`$(${y} - ${fy})/${s} = ${ans.toFixed(2)}$. ${Math.abs(ans) > 3 ? 'Beyond ±3: check that reading in the notebook before anything else.' : Math.abs(ans) > 2 ? 'Between 2 and 3: expect about one such point in twenty.' : 'Within ±2: unremarkable.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-smooth', difficulty: 2,
      prompt: t`Why should measured points not be joined with a smooth spline in a results figure?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [0, 4], xlabel: 'x', ylabel: 'y', axesAt: 'edge', curves: [{ fn: '1.5 + 0.8*sin(1.3*x) + 0.2*x', color: 'accent', domain: [0.5, 5.5] }], points: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5].map((x) => ({ x, y: r6(1.5 + 0.8 * Math.sin(1.3 * x) + 0.2 * x), r: 4, color: 'accent' })) }, caption: 'Six points with a smooth curve drawn through them.' },
      choices: ['It implies a behaviour between the points that was never measured and hides how scattered the data are', 'Splines cannot pass through points with error bars', 'It makes the figure too large', 'Splines are only allowed on log axes'],
      answer: 0,
      why: { 1: 'They can — that is the problem: forced through every noisy point, the curve wiggles to follow the noise.', 2: 'Size is irrelevant.', 3: 'No such rule exists.' },
      hints: ['What does a line on a graph claim about the values between the markers?'],
      teach: 'Lines on a results figure are models or guides that the caption names; data are markers.',
      explain: t`A spline through noisy points draws the noise as if it were structure. If a trend line helps, fit a model and say so in the caption.`,
    }),
  ],
  sources: [
    { label: 'E. R. Tufte, The Visual Display of Quantitative Information, 2nd ed. (Graphics Press, 2001)', url: 'https://www.edwardtufte.com/book/the-visual-display-of-quantitative-information/' },
    { label: 'G. Cumming, F. Fidler & D. L. Vaux, Error bars in experimental biology, J. Cell Biol. 177, 7 (2007)', url: 'https://doi.org/10.1083/jcb.200611141' },
    { label: 'B. Wong, Points of view: Color blindness, Nature Methods 8, 441 (2011)', url: 'https://doi.org/10.1038/nmeth.1618' },
  ],
});
