// Figures first: reading plots critically. Log–log and semi-log axes (a
// straight line is a power law or an exponential, its slope the exponent or
// the rate), what an error bar means and why "the bars don't overlap" is not
// a significance test, truncated axes, cherry-picked windows and
// extrapolated fits. Real data: the planets' periods against their orbits
// (NASA planetary fact sheet values); every other data set is constructed
// for the problem and says so.
import { lesson, mcq, num } from '../../src/core/content.js';
import { dataPlot, timeBars, SRC } from './_rs.js';

const t = String.raw;
const L = Math.log10;

// semi-major axis (AU) and sidereal period (yr), NASA planetary fact sheet
const PLANETS = [['Mercury', 0.3871, 0.2408], ['Venus', 0.7233, 0.6152], ['Earth', 1.0, 1.0], ['Mars', 1.5237, 1.8809], ['Jupiter', 5.2029, 11.862], ['Saturn', 9.537, 29.457], ['Uranus', 19.189, 84.011], ['Neptune', 30.07, 164.79]];
const planetPoints = (labels) => PLANETS.map(([n, a, P]) => ({ x: +L(a).toFixed(4), y: +L(P).toFixed(4), color: 'gold', r: 4, ...(labels ? { label: n, labelDx: 6, labelDy: 12 } : {}) }));

// a small deterministic generator for constructed noisy data
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let z = s; z = Math.imul(z ^ (z >>> 15), z | 1); z ^= z + Math.imul(z ^ (z >>> 7), z | 61); return ((z ^ (z >>> 14)) >>> 0) / 4294967296; };
}
const gauss = (u) => () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());

// constructed: 60 readings of a constant 5.0 with σ = 0.4, one window cherry-picked
const CHERRY = (() => { const g = gauss(rng(7)); return Array.from({ length: 60 }, (_, i) => [i + 1, +(5 + 0.4 * g()).toFixed(3)]); })();
// least-squares slope inside the chosen window and over everything
const slopeOf = (pts) => { const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n; let sxy = 0, sxx = 0; for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; } return { b: sxy / sxx, a: my - (sxy / sxx) * mx }; };
// pick the 12-point window with the steepest rise, as a cherry-picker would
const WIN = (() => { let best = null; for (let i = 0; i + 12 <= CHERRY.length; i++) { const f = slopeOf(CHERRY.slice(i, i + 12)); if (!best || f.b > best.b) best = { i, ...f }; } return best; })();
const ALL = slopeOf(CHERRY);

export default lesson({
  id: 'research.R2.2',
  title: 'Figures first: reading plots critically',
  minutes: 12, difficulty: 2,
  intro: t`Most readers look at a paper’s figures before its text, and most of a paper’s evidence is in them. Read a figure the way a referee does: **what are the axes** (linear or logarithmic, where they start), **what do the error bars mean**, **what range is shown and what is left out**, and **where does the data end and the model begin**.

Logarithmic axes deserve special care. On a log–log plot a power law $y = Cx^{p}$ is a straight line, because

$$\log_{10} y = \log_{10} C + p\,\log_{10} x$$

so the slope you measure is the **exponent** $p$, and equal distances mean equal *ratios*, not equal differences.`,
  symbols: [
    { tex: 'x,\\ y', text: 'the plotted quantities (each in its own units)' },
    { tex: 'p', text: 'the exponent of the power law — the slope on a log–log plot, a pure number' },
    { tex: 'C', text: 'the prefactor: the value of $y$ at $x = 1$ (where $\\log_{10} x = 0$), in the units of $y$' },
    { tex: '\\log_{10}', text: 'the base-10 logarithm: one *decade* on a log axis is a factor of 10' },
  ],
  why: t`A figure can be honest and still mislead a careless reader — and you will make figures that others read the same way.`,
  visual: {
    type: 'graph',
    title: 'Kepler’s third law on log–log axes',
    lead: t`The eight planets: orbital period against semi-major axis, both on logarithmic axes. On linear axes Mercury to Mars would be squashed into a corner; here every planet gets equal room per factor of ten. Slide the exponent $p$ of the line $P = a^{p}$ (years and AU) until it runs through the points.`,
    tasks: ['Find the exponent that fits all eight planets: it is Kepler’s 3/2.', 'Set p = 1: the line still passes through Earth (every line here does) but misses the outer planets by a factor of five.', 'Read Jupiter off the plot: about half a decade right, a little over one decade up.'],
    params: {
      x: [-0.6, 1.6], y: [-0.8, 2.4], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'semi-major axis a (AU)', ylabel: 'period P (yr)', xticks: 3, yticks: 4,
      sliders: [{ key: 'p', label: t`exponent $p$`, min: 1, max: 2, step: 0.01, value: 1.2, explain: t`The slope of the straight line on these axes: the power in $P = a^{p}$.` }],
      curves: [{ fn: 'p*x', color: 'accent' }],
      points: planetPoints(true),
    },
    caption: 'Planet data: NASA planetary fact sheet (semi-major axis, sidereal period). The line is P = aᵖ in years and AU, fixed through Earth by the choice of units.',
  },
  example: {
    prompt: t`Read the exponent of Kepler’s law from the figure, using Earth $(1\ \text{AU}, 1\ \text{yr})$ and Jupiter $(5.203\ \text{AU}, 11.86\ \text{yr})$.`,
    visual: { type: 'graph', params: { x: [-0.6, 1.6], y: [-0.8, 2.4], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'a (AU)', ylabel: 'P (yr)', xticks: 3, yticks: 4, points: planetPoints(true) }, caption: 'NASA planetary fact sheet values on log–log axes.' },
    steps: [
      { label: 'Read the axes', text: t`The tick labels go 1, 10, 100 at equal spacing: both axes are logarithmic. A straight line here is a power law.` },
      { label: 'Take logs', text: t`Earth sits at $(\log_{10} 1, \log_{10} 1) = (0, 0)$; Jupiter at $(\log_{10} 5.203, \log_{10} 11.86) = (${L(5.2029).toFixed(4)}, ${L(11.862).toFixed(4)})$.` },
      { label: 'Slope', text: t`$p = \dfrac{\Delta \log_{10} P}{\Delta \log_{10} a} = \dfrac{${L(11.862).toFixed(4)}}{${L(5.2029).toFixed(4)}} = ${(L(11.862) / L(5.2029)).toFixed(3)}$.` },
      { label: 'Interpret', text: t`$P \propto a^{3/2}$, Kepler’s third law. A slope read off a log–log plot is an exponent — not a rate in years per AU.` },
      { label: 'What the plot hides', text: t`On these axes a 5% scatter would be invisible (0.02 decade). To test a law to percent precision you would plot the **residuals**, $P/a^{3/2} - 1$, on a linear axis.` },
    ],
    answer: t`$p \approx ${(L(11.862) / L(5.2029)).toFixed(2)}$: the period grows as the 3/2 power of the orbit’s size.`,
  },
  practice: [
    num({
      id: 'slope', difficulty: 2,
      gen(r) {
        const cases = [
          { p: -2, what: 'the flux received from a source against its distance', x: 'distance (Mpc)', y: 'flux (arb.)' },
          { p: -1, what: 'the gravitational-wave strain amplitude from identical sources against their distance', x: 'distance (Mpc)', y: 'strain (arb.)' },
          { p: 0.5, what: 'a pendulum’s period against its length', x: 'length (m)', y: 'period (s)' },
          { p: 3, what: 'the mass of solid spheres of one material against their radius', x: 'radius (cm)', y: 'mass (g)' },
          { p: 4, what: 'the radiated power of a black body against its temperature (in thousands of kelvin)', x: 'temperature (1000 K)', y: 'power (arb.)' },
        ];
        const c = r.pick(cases);
        const x1 = r.pick([1, 2, 3]), x2 = x1 + r.pick([10, 20, 50]);
        const C = r.pick([2, 3, 5]);
        const y1 = C * x1 ** c.p, y2 = C * x2 ** c.p;
        const [X1, X2, Y1, Y2] = [L(x1), L(x2), L(y1), L(y2)];
        const lo = Math.min(Y1, Y2), hi = Math.max(Y1, Y2), pad = 0.15 * (hi - lo) + 0.2;
        return {
          prompt: t`A log–log figure shows ${c.what} (constructed numbers). Two marked points read $(${x1}, ${+y1.toPrecision(3)})$ and $(${x2}, ${+y2.toPrecision(3)})$. What exponent $p$ in $y = Cx^{p}$ does the line have?`,
          visual: {
            type: 'graph',
            params: {
              x: [+(X1 - 0.3).toFixed(2), +(X2 + 0.3).toFixed(2)], y: [+(lo - pad).toFixed(2), +(hi + pad).toFixed(2)], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: c.x, ylabel: c.y, xticks: 4, yticks: 4,
              curves: [{ fn: `${L(C).toFixed(5)} + ${c.p}*x`, color: 'accent' }],
              points: [{ x: +X1.toFixed(5), y: +Y1.toFixed(5), color: 'gold', r: 5, label: 'P1' }, { x: +X2.toFixed(5), y: +Y2.toFixed(5), color: 'gold', r: 5, label: 'P2' }],
            },
            caption: 'Both axes logarithmic. Constructed for this problem.',
          },
          answer: c.p, tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: (y2 - y1) / (x2 - x1), feedback: 'That is the slope on linear axes. On log–log axes take logarithms first: p = Δlog y / Δlog x.' }].filter((e) => Math.abs(e.value - c.p) > 0.05),
          hints: [t`On log–log axes, $p = \dfrac{\log_{10} y_2 - \log_{10} y_1}{\log_{10} x_2 - \log_{10} x_1}$.`, t`$\log_{10}(${+y2.toPrecision(3)}/${+y1.toPrecision(3)}) = ${(Y2 - Y1).toFixed(3)}$ and $\log_{10}(${x2}/${x1}) = ${(X2 - X1).toFixed(3)}$.`],
          teach: 'The slope of a straight line on log–log axes is the exponent of a power law: a ratio of logarithms.',
          explain: t`$p = ${(Y2 - Y1).toFixed(3)}/${(X2 - X1).toFixed(3)} = ${c.p}$.`,
        };
      },
    }),
    mcq({
      id: 'bar-meaning', difficulty: 2,
      prompt: t`A figure in a paper shows measurements with error bars, and the caption does not say what the bars are. What should you look for before judging the data?`,
      visual: dataPlot([[1, 4.1, 0.5], [2, 5.0, 0.4], [3, 6.3, 0.6], [4, 6.8, 0.5], [5, 8.2, 0.7]], { x: [0.3, 5.7], y: [2.5, 9.5], xlabel: 'run', ylabel: 'thrust (N)', xticks: 5, yticks: 4 }, { cap: 0.08, caption: 'Constructed data with unexplained error bars.' }),
      choices: [
        'Whether the bars are standard deviations, standard errors of a mean, or confidence intervals (and at what level) — they differ by large factors',
        'Nothing: error bars are always one standard deviation',
        'Only whether the bars overlap',
        'The colour of the bars, which encodes their meaning by convention',
      ],
      answer: 0,
      why: { 1: 'There is no such universal convention; 1σ, 2σ, 90% and 95% intervals and standard errors all appear in papers.', 2: 'Overlap means different things depending on what the bars are.', 3: 'No colour convention exists.' },
      hints: ['A standard deviation of 10 readings is about three times their standard error.', 'The same data can be drawn with very different bars.'],
      teach: 'An error bar is meaningless until you know what it represents: SD, SEM, or a confidence interval at a stated level.',
      explain: 'For n readings the standard error is the standard deviation divided by √n, and a 95% interval is about twice a 1σ bar. The paper’s text, the caption or the methods must say — if none does, note it as a weakness.',
    }),
    num({
      id: 'overlap', difficulty: 3,
      gen(r) {
        const s = r.float(0.8, 1.5, 0.1), x1 = r.float(9, 12, 0.1);
        const gap = +(s * r.float(2.1, 2.7, 0.05)).toFixed(1);
        const x2 = +(x1 + gap).toFixed(1);
        const ans = gap / Math.hypot(s, s);
        return {
          prompt: t`Two results are plotted with 1σ error bars: $${x1.toFixed(1)} \pm ${s.toFixed(1)}$ and $${x2.toFixed(1)} \pm ${s.toFixed(1)}$ (constructed). Their bars do **not** overlap. How many combined standard uncertainties apart are they?`,
          visual: dataPlot([[1, x1, s], [2, x2, s]], { x: [0.4, 2.6], y: [+(x1 - 2.5 * s).toFixed(1), +(x2 + 2.5 * s).toFixed(1)], xlabel: '', xticks: 0, ylabel: 'value', yticks: 4 }, { cap: 0.06, caption: '1σ error bars. The gap between their ends is visible.' }),
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: gap / s, feedback: 'You divided by one σ. Two independent uncertainties combine as √(σ₁² + σ₂²).' }, { value: gap / (2 * s), feedback: 'Uncertainties add in quadrature, not linearly.' }],
          hints: [t`$n_\sigma = |x_1 - x_2|/\sqrt{\sigma_1^2 + \sigma_2^2}$.`, t`Here $|x_1 - x_2| = ${gap.toFixed(1)}$ and $\sqrt{2}\,\sigma = ${(Math.SQRT2 * s).toFixed(2)}$.`],
          teach: 'Non-overlapping 1σ bars can be well under 2σ apart: judge a difference by its combined uncertainty, not by the picture.',
          explain: t`$n_\sigma = ${gap.toFixed(1)}/${(Math.SQRT2 * s).toFixed(2)} = ${ans.toFixed(2)}$ — less than $2\sigma$, so not a significant difference, although the bars do not touch. (Conversely, 95% bars can overlap a little while the difference is significant.)`,
        };
      },
    }),
    num({
      id: 'truncated', difficulty: 2,
      gen(r) {
        const a = r.int(300, 312), b = a + r.int(4, 9), base = a - r.int(4, 7);
        const pct = 100 * (b - a) / a;
        return {
          prompt: t`A slide compares the specific impulse of two engines with horizontal bars (constructed numbers): engine A ${a} s, engine B ${b} s. The axis starts at ${base} s. By what percentage does B actually exceed A?`,
          visual: timeBars([{ y: 2, from: base, to: a, color: 'accent2', label: `engine A: ${a} s` }, { y: 1, from: base, to: b, color: 'gold', label: `engine B: ${b} s` }], { x: [base, b + 2], y: [0.4, 2.8], xlabel: 'specific impulse (s)', xticks: 5 }, { caption: `The axis starts at ${base} s, not zero: bar lengths are measured from ${base}.` }),
          answer: pct, units: '%', tol: { rel: 0.02 },
          errors: [{ value: 100 * ((b - base) / (a - base) - 1), feedback: 'That is how much longer B’s bar looks. The bars start at the axis origin, not at zero.' }],
          hints: ['Compare the values, not the bar lengths.', t`$(${b} - ${a})/${a}$.`],
          teach: 'A bar chart whose axis does not start at zero exaggerates differences: compare the numbers, not the lengths.',
          explain: t`$(${b} - ${a})/${a} = ${pct.toFixed(1)}\%$, while B’s bar is $${(100 * ((b - base) / (a - base) - 1)).toFixed(0)}\%$ longer. A truncated axis is fine for showing small differences precisely — as long as the reader notices it.`,
        };
      },
    }),
    mcq({
      id: 'cherry', difficulty: 2,
      prompt: t`A talk shows only the shaded window of this record and says the readings "rise clearly" there. What is the right response?`,
      visual: dataPlot(CHERRY.map(([x, y]) => [x, y, 0.4]), {
        x: [0, 61], y: [3.4, 6.6], xlabel: 'reading number', ylabel: 'reading', xticks: 6, yticks: 4,
        shade: [{ fn: '6.6', lower: '3.4', from: WIN.i + 0.5, to: WIN.i + 12.5, color: 'gold', alpha: 0.14 }],
        curves: [{ fn: `${WIN.a.toFixed(4)} + ${WIN.b.toFixed(5)}*x`, domain: [WIN.i + 1, WIN.i + 12], color: 'gold', width: 2 }],
      }, { caption: 'Constructed: 60 readings of a constant 5.0 with Gaussian noise of σ = 0.4. The gold line is a fit to the shaded window only.' }),
      choices: [
        'Ask how the window was chosen: in pure noise, the steepest of many windows always shows a "trend"',
        'Accept it: the fitted line in the window rises',
        'Accept it, because the error bars inside the window are small',
        'Reject all the data as noise',
      ],
      answer: 0,
      why: { 1: 'A fit to a hand-picked window inherits the picking: it is biased toward whatever the picker wanted.', 2: 'The bars are the same size everywhere; they say nothing about the window choice.', 3: 'The data are fine; the selection is the problem.' },
      hints: [t`Over all 60 points the fitted slope is $${ALL.b.toFixed(4)}$ per reading.`, 'How many 12-point windows are there to choose from?'],
      teach: 'A range chosen after looking at the data can make a trend out of noise: ask for the whole record and the rule for the window.',
      explain: t`This window is the steepest of the 49 possible 12-reading windows in data with no trend at all: its slope is $${WIN.b.toFixed(3)}$ per reading, against $${ALL.b.toFixed(4)}$ for the full record. Choosing ranges after seeing data — "cherry-picking" — needs either a rule fixed in advance or a correction for the many windows tried.`,
    }),
    num({
      id: 'semilog', difficulty: 2,
      gen(r) {
        const T = r.pick([8, 12, 20, 30]), R0 = r.pick([400, 800, 1200]);
        const t1 = r.pick([5, 10]), t2 = t1 + r.pick([2, 3, 4]) * T;
        const y1 = R0 * 2 ** (-t1 / T), y2 = R0 * 2 ** (-t2 / T);
        return {
          prompt: t`A semi-log plot (logarithmic vertical axis) shows a count rate falling on a straight line (constructed data). Two points on the line read $${+y1.toPrecision(3)}$ counts/s at $t = ${t1}$ min and $${+y2.toPrecision(3)}$ counts/s at $t = ${t2}$ min. What is the half-life?`,
          visual: {
            type: 'graph',
            params: {
              x: [0, t2 + T], y: [+(L(y2) - 0.4).toFixed(2), +(L(R0) + 0.2).toFixed(2)], aspect: 'wide', axesAt: 'edge', ylog: true, xlabel: 'time (min)', ylabel: 'count rate (1/s)', xticks: 6, yticks: 3,
              curves: [{ fn: `${L(R0).toFixed(5)} - ${(L(2) / T).toFixed(6)}*x`, color: 'accent' }],
              points: [{ x: t1, y: +L(y1).toFixed(5), color: 'gold', r: 5 }, { x: t2, y: +L(y2).toFixed(5), color: 'gold', r: 5 }],
            },
            caption: 'Vertical axis logarithmic, horizontal linear: an exponential decay is a straight line.',
          },
          answer: T, units: 'min', tol: { rel: 0.02 },
          errors: [{ value: (t2 - t1) / ((y1 - y2) / y1), feedback: 'On a log axis, a straight line means equal *ratios* in equal times. Use the ratio of the rates.' }].filter((e) => Math.abs(e.value - T) > 0.05 * T),
          hints: [t`The rate falls by a factor $${+y1.toPrecision(3)}/${+y2.toPrecision(3)} = ${(y1 / y2).toFixed(2)}$ in $${t2 - t1}$ min.`, t`That factor is $2^{n}$ for $n$ half-lives: $n = \log_2(${(y1 / y2).toFixed(2)})$.`],
          teach: 'A straight line on a semi-log plot is an exponential; its slope gives the rate, and equal steps down are equal factors.',
          explain: t`The factor $${(y1 / y2).toFixed(0)} = 2^{${((t2 - t1) / T).toFixed(0)}}$ means $${((t2 - t1) / T).toFixed(0)}$ half-lives in $${t2 - t1}$ min, so $t_{1/2} = ${T}$ min.`,
        };
      },
    }),
    mcq({
      id: 'extrapolate', difficulty: 2,
      prompt: t`A paper fits a straight line to thrust data taken between 1 and 3 bar of chamber pressure and quotes the fit’s prediction at 10 bar. How much should you trust that number?`,
      visual: dataPlot([[1, 2.1, 0.15], [1.5, 3.0, 0.15], [2, 4.1, 0.15], [2.5, 5.0, 0.15], [3, 6.05, 0.15]], {
        x: [0, 10.5], y: [0, 22], xlabel: 'chamber pressure (bar)', ylabel: 'thrust (N)', xticks: 5, yticks: 4,
        curves: [{ fn: '0.1 + 1.98*x', domain: [1, 3], color: 'accent' }, { fn: '0.1 + 1.98*x', domain: [3, 10], color: 'accent', dash: [6, 5] }],
        vlines: [{ x: 10, label: '10 bar', color: 'ink3' }],
      }, { caption: 'Constructed data. Solid: the fit over the data; dashed: the same line extended past them.' }),
      choices: [
        'Not much without a physical reason: the fit is tested only from 1 to 3 bar, and its quoted uncertainty does not cover a change of physics beyond',
        'Fully: a good fit is good everywhere',
        'Fully, if the fit’s reduced χ² is near 1',
        'Not at all: extrapolation is always forbidden',
      ],
      answer: 0,
      why: { 1: 'A good fit is good where the data are.', 2: 'χ² tests the fit where there are data, not beyond them.', 3: 'Extrapolation backed by physics (an ideal-nozzle model, say) is useful — but it is the model, not the fit, doing the work.' },
      hints: ['Where was the line tested?', 'What could change between 3 and 10 bar — flow separation, heat loss?'],
      teach: 'A fit describes the range of its data; beyond it, only a physical model with stated assumptions can speak.',
      explain: 'Over 1–3 bar the line is fine. At 10 bar nozzle flow, heat transfer and even the regime may differ. Check whether the paper argues from physics for the extrapolation — and whether its uncertainty band grows outside the data (it should).',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transit', difficulty: 3, transfer: true,
      gen(r) {
        const ppm = r.pick([150, 250, 400, 600, 900]), Rs = r.pick([0.9, 1.0, 1.1]);
        const k = Math.sqrt(ppm * 1e-6), Rp = k * Rs * 695700;
        const depth = ppm * 1e-6;
        return {
          prompt: t`A light curve of a transiting planet (constructed) has its flux axis running from $${(1 - 1.6 * depth).toFixed(5)}$ to $${(1 + 0.4 * depth).toFixed(5)}$, so the dip looks enormous. The dip reaches $${(1 - depth).toFixed(5)}$. The star’s radius is $${Rs}\,R_\odot$ ($R_\odot = 695\,700$ km). Taking the depth as $(R_p/R_\star)^2$, what is the planet’s radius, in km?`,
          visual: {
            type: 'graph',
            params: {
              x: [-4, 4], y: [+(1 - 1.6 * depth).toFixed(6), +(1 + 0.4 * depth).toFixed(6)], aspect: 'wide', axesAt: 'edge', xlabel: 'time from mid-transit (h)', ylabel: 'relative flux', xticks: 8, yticks: 4,
              curves: [{ fn: `1 - ${depth}*max(0, min(1, (1.6 - abs(x))/0.25))`, color: 'accent', samples: 800 }],
            },
            caption: 'Constructed transit with a trapezoid shape; the vertical axis is zoomed far in. Real transits are rounded by limb darkening.',
          },
          answer: Rp, units: 'km', tol: { rel: 0.02 },
          errors: [{ value: depth * Rs * 695700, feedback: 'The depth is the ratio of areas, (Rp/R★)²: take its square root for the radius ratio.' }],
          hints: [t`Depth $= 1 - ${(1 - depth).toFixed(5)} = ${(ppm / 100).toFixed(1)}\times10^{-4}$.`, t`$R_p = R_\star\sqrt{\text{depth}}$.`],
          teach: 'Read a zoomed axis by its numbers: here the whole drawn height is a few hundred parts per million.',
          explain: t`$R_p/R_\star = \sqrt{${ppm}\times10^{-6}} = ${k.toFixed(4)}$, so $R_p = ${k.toFixed(4)} \times ${Rs} \times 695\,700 = ${Math.round(Rp)}$ km (Earth’s radius is 6371 km). The planet blocks ${ppm} parts per million of the light — the axis makes it look like half.`,
        };
      },
    }),
    num({
      id: 'cp-decade', difficulty: 2,
      gen(r) {
        const d = r.pick([0.05, 0.1, 0.15, 0.2, 0.3]);
        const ans = 10 ** d;
        return {
          prompt: t`On a log–log plot of a nozzle’s mass flow against chamber pressure (constructed), the data run parallel to a model line but sit $${d}$ decade above it. By what factor do data and model disagree?`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.4], y: [-0.3, 1.8], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'chamber pressure (bar)', ylabel: 'mass flow (g/s)', xticks: 3, yticks: 3, curves: [{ fn: 'x', color: 'accent', label: 'model', labelAt: 1.1, labelDy: 14 }, { fn: `x + ${d}`, color: 'gold', dash: [6, 4], label: 'data', labelAt: 0.6, labelDx: -40 }] },
            caption: 'Both axes logarithmic: a constant vertical offset is a constant ratio.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 1 + d, feedback: t`An offset on a log axis is a power of ten: the factor is $10^{${d}}$, not $1 + ${d}$.` }].filter((e) => Math.abs(e.value - ans) > 0.015 * ans),
          hints: ['One decade is a factor of 10.', t`The factor is $10^{${d}}$.`],
          teach: 'A vertical gap on a log axis is a ratio: Δ decades = log₁₀(ratio).',
          explain: t`$10^{${d}} = ${ans.toFixed(3)}$: a ${((ans - 1) * 100).toFixed(0)}% disagreement that looks small on log axes. Plot the ratio data/model on a linear axis to see it.`,
        };
      },
    }),
    mcq({
      id: 'cp-cooling', difficulty: 2,
      prompt: t`After shutdown, a test-stand thermocouple on a nozzle records its temperature above the room’s, $T - T_{\text{room}}$. On a semi-log plot (log vertical axis) the readings fall on a straight line (constructed). What does that tell you?`,
      visual: {
        type: 'graph',
        params: { x: [0, 30], y: [0.6, 2.8], aspect: 'wide', axesAt: 'edge', ylog: true, xlabel: 'time after shutdown (min)', ylabel: 'T − T(room) (K)', xticks: 6, yticks: 3, curves: [{ fn: `${L(450).toFixed(4)} - ${(1 / (8 * Math.LN10)).toFixed(5)}*x`, color: 'accent' }] },
        caption: 'Constructed cooling curve on semi-log axes.',
      },
      choices: [
        t`The excess temperature decays exponentially, $e^{-t/\tau}$, with a single time constant $\tau$ — as Newton’s law of cooling predicts`,
        'The temperature falls at a constant number of kelvin per minute',
        'The temperature follows a power law in time',
        'The nozzle stops cooling after 30 minutes',
      ],
      answer: 0,
      why: { 1: 'That would be a straight line on linear axes, not on a log axis.', 2: 'A power law is straight on log–log axes; here time is linear.', 3: 'An exponential never reaches zero; the line keeps falling.' },
      hints: ['Which function is straight when only the vertical axis is logarithmic?', t`$\ln y = \ln y_0 - t/\tau$ is a line in $t$.`],
      teach: 'Straight on semi-log means exponential; straight on log–log means power law.',
      explain: 'A straight line in log y against linear t is an exponential decay with one time constant — Newton’s law of cooling for a body with uniform temperature. A bend would reveal a second process (conduction into the mount, say).',
    }),
  ],
  sources: [
    { label: 'NASA Goddard Space Flight Center, Planetary Fact Sheet (metric)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    { label: 'G. Cumming, F. Fidler & D. L. Vaux, “Error bars in experimental biology”, J. Cell Biol. 177, 7–11 (2007)', url: 'https://doi.org/10.1083/jcb.200611141' },
    SRC.hogg,
  ],
});
