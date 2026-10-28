// Mean, standard deviation and standard error — the scatter of one reading
// (s, with N − 1) against the uncertainty of the mean (s/√N): the sampling
// distribution of means narrowing as 1/√N, how many readings a target needs,
// s's own uncertainty (why uncertainties carry one or two figures), NumPy's
// ddof trap, and where √N fails — correlated readings. Ultrasonic transit
// times; a GPS receiver's averaged fixes as the transfer.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { M, sf, stat, runChart, compare, SRC } from './_unc.js';

const t = String.raw;

// the worked example: ten ultrasonic transit times across 0.500 m of air
const EX = (() => {
  const xs = M.instrumentReadings({ truth: 1457.7, sd: 0.8, res: 0.1, n: 10, seed: 23 });
  return { xs, st: M.stats(xs) };
})();
const histOf = (xs, extra = {}, caption) => {
  const st = M.stats(xs);
  const lo = Math.min(...xs), hi = Math.max(...xs), pad = Math.max(st.sd, 1e-9) * 1.5;
  return stat('hist', { dist: 'normal', mu: st.mean, sigma: st.sd, data: xs, pdf: false, xlabel: 'transit time (μs)', xr: [+(lo - pad).toPrecision(8), +(hi + pad).toPrecision(8)], ...extra }, caption);
};
// a static picture of given readings: a run chart
const transit = (r, n) => {
  const xs = M.instrumentReadings({ truth: r.int(14500, 14600) / 10, sd: r.int(5, 12) / 10, res: 0.1, n, seed: r.int(1, 99999) });
  return { xs, st: M.stats(xs) };
};

export default lesson({
  id: 'lab.A2.1',
  title: 'Mean, standard deviation and standard error',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`Repeat a measurement $N$ times and three numbers summarize it. The **mean** is your best estimate; the **standard deviation** $s$ is how far a single reading typically falls from it; the **standard error of the mean** (SEM) is how far the mean itself is likely to be from the true value:

$$\bar x = \frac1N\sum_{i=1}^N x_i, \qquad s = \sqrt{\frac{\sum_i (x_i - \bar x)^2}{N-1}}, \qquad \sigma_{\bar x} = \frac{s}{\sqrt N}$$

$s$ is a property of the method and does not shrink with more readings; $\sigma_{\bar x}$ does, but only as $1/\sqrt N$ — four times the work halves it. And the $\sqrt N$ assumes every reading’s error is **independent** of the others. (This lesson goes further than [the introductory lab](#/lesson/phys2210.L.1).)`,
  symbols: [
    { tex: 'x_i', text: 'the $i$-th of $N$ readings' },
    { tex: t`\bar x`, text: 'the mean: the best estimate of the true value (if there is no bias)' },
    { tex: 's', text: 'the sample standard deviation: the typical scatter of one reading. Dividing by $N - 1$ corrects for measuring deviations from $\\bar x$, which was fitted to the same data. It is the GUM’s “experimental standard deviation”' },
    { tex: t`\sigma_{\bar x}`, text: 'the standard error of the mean, $s/\\sqrt N$: the Type A standard uncertainty of $\\bar x$' },
  ],
  why: 'Quoting the standard deviation where the standard error belongs — or the reverse — misstates a result by a factor of √N, which can be ten or a hundred.',
  visual: {
    type: 'labx-stats',
    title: 'Readings, and means of readings',
    lead: t`A histogram of readings with $\sigma = 1$. Then make each sample **the mean of $m$ readings** instead: the histogram of means narrows as $1/\sqrt m$, which is exactly what $s/\sqrt N$ predicts for one mean.`,
    tasks: [
      'With 1 draw per sample, go from 100 to 10 000 readings: the shape fills in, but its width (s) stays near 1.',
      'Switch to means of 4, then of 16: the spread of the means falls to ½, then ¼.',
      'Switch the distribution to rectangular and take means of 4: the means already look Gaussian (the central limit theorem, next lesson).',
    ],
    params: { mode: 'hist', dist: 'normal', mu: 0, sigma: 1, n: 1000, m: 1, controls: ['n', 'm', 'dist'], seed: 11, xr: [-4.5, 4.5] },
  },
  example: {
    prompt: t`An ultrasonic pulse crosses 0.500 m of air. Ten transit times (μs): ${EX.xs.map((x) => x.toFixed(1)).join(', ')}. Find the mean, the standard deviation and the standard error, and report the transit time.`,
    visual: histOf(EX.xs, { bins: 8 }, 'The ten readings, their mean (gold line), ±1 SEM (gold bar) and ±1 s (teal band).'),
    steps: [
      { label: 'Mean', text: t`$\bar t = \tfrac{1}{10}\sum t_i = ${EX.st.mean.toFixed(2)}$ μs.` },
      { label: 'Deviations', text: t`The squared deviations from the mean add to $${EX.st.ss.toFixed(3)}\ \mu\text{s}^2$.` },
      { label: 'Standard deviation', text: t`$s = \sqrt{${EX.st.ss.toFixed(3)}/9} = ${EX.st.sd.toFixed(3)}$ μs: one reading is typically off by about ${EX.st.sd.toFixed(1)} μs (timing jitter, air currents).` },
      { label: 'Standard error', text: t`$\sigma_{\bar t} = ${EX.st.sd.toFixed(3)}/\sqrt{10} = ${EX.st.sem.toFixed(3)}$ μs.` },
      { label: 'Report', text: t`Round the uncertainty to two figures and the mean to match: $\bar t = ${EX.st.mean.toFixed(2)} \pm ${EX.st.sem.toFixed(2)}$ μs (mean ± SEM, $N = 10$). Say which it is: “± SEM” and “± SD” differ here by $\sqrt{10} \approx 3.2$.` },
      { label: 'Sense check', text: t`The SEM is ${(100 * EX.st.sem / EX.st.mean).toFixed(3)}% of the time, so the random error of the mean is tiny — the uncertainty of the 0.500 m path and of the air temperature will matter far more.` },
    ],
    answer: t`$\bar t = ${EX.st.mean.toFixed(2)} \pm ${EX.st.sem.toFixed(2)}$ μs (± SEM), with a single-reading scatter $s = ${EX.st.sd.toFixed(2)}$ μs.`,
  },
  practice: [
    num({
      id: 'sd-six', difficulty: 2,
      gen(r) {
        const { xs, st } = transit(r, 6);
        return {
          prompt: t`Six transit times (μs): ${xs.map((x) => x.toFixed(1)).join(', ')}. What is their sample standard deviation $s$, in μs?`,
          visual: histOf(xs, { bins: 6, stats: false }, 'The six readings.'),
          answer: st.sd, units: 'us', tol: { rel: 0.02 },
          errors: [
            { value: st.sdPop, feedback: t`That divides by $N = 6$ (NumPy’s default \`ddof=0\`). The sample standard deviation divides by $N - 1 = 5$.` },
            { value: st.sem, feedback: t`That is the standard error, $s/\sqrt N$. The question asks for the scatter of one reading.` },
          ].filter((e) => Math.abs(e.value - st.sd) > 0.03 * st.sd),
          hints: [t`The mean is $${st.mean.toFixed(2)}$ μs; square each reading’s deviation from it.`, 'Add the six squares, divide by 5, take the square root.'],
          teach: 'The sample standard deviation divides the summed squared deviations by N − 1.',
          explain: t`$\sum (t_i - \bar t)^2 = ${st.ss.toFixed(3)}\ \mu\text{s}^2$, so $s = \sqrt{${st.ss.toFixed(3)}/5} = ${st.sd.toFixed(3)}$ μs.`,
        };
      },
    }),
    num({
      id: 'how-many', difficulty: 2,
      gen(r) {
        const s = r.int(6, 15) / 10, target = r.pick([0.05, 0.08, 0.1, 0.15]);
        const N = Math.ceil((s / target) ** 2 - 1e-9);
        return {
          prompt: t`Single transit times scatter with $s = ${s.toFixed(1)}$ μs. How many readings must you average for a standard error of ${target} μs or less?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 1.3 * N + 10], y: [0, s * 1.1], xlabel: 'number of readings N', ylabel: 'SEM (μs)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: `${s}/sqrt(x)`, color: 'accent' }], hlines: [{ y: target, color: 'gold', label: `target ${target} μs` }] }, caption: 'Read where s/√N meets the target — or compute it exactly.' },
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.ceil(s / target), feedback: t`That makes $s/N$ equal the target. The SEM falls as $1/\sqrt N$, so $N = (s/\sigma_{\bar x})^2$.` }],
          hints: [t`Solve $s/\sqrt N \le ${target}$ for $N$.`, t`$N \ge (s/${target})^2$; round up.`],
          teach: 'To reach a target standard error, N = (s / target)², rounded up — precision is bought quadratically.',
          explain: t`$(${s.toFixed(1)}/${target})^2 = ${((s / target) ** 2).toFixed(1)}$, so $N = ${N}$. Halving the target would need four times as many.`,
        };
      },
    }),
    mcq({
      id: 'sd-or-sem', difficulty: 2,
      prompt: 'A machine shop measures 50 turned shafts and reports diameter = 12.004 ± 0.003 mm. A buyer wants to know how far a single shaft may be from 12.004 mm. Which should the ± be?',
      visual: stat('hist', { dist: 'normal', mu: 12.004, sigma: 0.003, n: 50, seed: 6, xr: [11.9935, 12.0145] }, 'The fifty diameters: the teal band is ±1 s, the short gold bar ±1 SEM.'),
      choices: [
        'The standard deviation of the 50 shafts: it describes the scatter of individual parts',
        'The standard error, because it is the smaller and more impressive number',
        'The standard error, because it is the uncertainty of the measurement',
        'Neither: with 50 shafts the spread is negligible',
      ],
      answer: 0,
      why: {
        1: 'The SEM describes how well the average diameter is known, not where any one shaft lies. Choosing it because it is smaller misleads the buyer by √50 ≈ 7.',
        2: 'It is the uncertainty of the mean diameter. The buyer’s question is about single parts.',
        3: 'The scatter of parts does not shrink with more measurements; it is a property of the machining.',
      },
      hints: ['One question is about the average; the other about an individual. Which number describes individuals?'],
      teach: 'Quote the standard deviation to describe individual readings or items, and the standard error to describe how well the mean is known.',
      explain: 'The SD says “a shaft is typically within 0.003 mm of 12.004”. The SEM, 0.003/√50 = 0.0004 mm, says the average diameter is known to 0.4 μm. Both are true; they answer different questions.',
    }),
    num({
      id: 'means-width', difficulty: 2,
      gen(r) {
        const sigma = r.pick([1.2, 2, 2.4, 3]), m = r.pick([4, 16]);
        return {
          prompt: t`Single readings scatter with $\sigma = ${sigma}$. You form many samples, each the mean of ${m} readings, and histogram the means (picture). What is the standard deviation of the means?`,
          visual: stat('hist', { dist: 'normal', mu: 0, sigma, m, n: 2000, seed: r.int(1, 999), xr: [-4.5 * sigma, 4.5 * sigma], stats: false }, `Two thousand means of ${m} readings each, on the scale of the single readings.`),
          answer: sigma / Math.sqrt(m), tol: { rel: 0.01 },
          errors: [{ value: sigma / m, feedback: t`Divide by $\sqrt m$, not $m$: independent errors partly cancel, they do not vanish.` }, { value: sigma, feedback: 'Averaging narrows the distribution: the means scatter less than single readings.' }],
          hints: [t`The standard error of a mean of $m$ readings is $\sigma/\sqrt m$.`],
          teach: 'Means of m independent readings scatter with σ/√m — the standard error is the standard deviation of the distribution of means.',
          explain: t`$${sigma}/\sqrt{${m}} = ${sf(sigma / Math.sqrt(m), 3)}$. The SEM you compute from one set of readings estimates exactly this width.`,
        };
      },
    }),
    code({
      id: 'ddof', difficulty: 2,
      prompt: t`NumPy’s \`np.std\` divides by $N$ unless told otherwise. For the readings below, set \`s\` to the sample standard deviation (divide by $N - 1$), \`sem\` to the standard error, and print both.`,
      starter: t`import numpy as np

t = np.array([1458.2, 1457.1, 1459.0, 1457.8, 1458.6])   # transit times, μs

s = np.std(t)
sem = s / len(t)
print(s, sem)
`,
      answer: t`import numpy as np

t = np.array([1458.2, 1457.1, 1459.0, 1457.8, 1458.6])   # transit times, μs

s = np.std(t, ddof=1)
sem = s / np.sqrt(len(t))
print(s, sem)`,
      tests: [
        { name: '`s` divides by N − 1', code: 'abs(s - 0.7334848328357141) < 1e-9' },
        { name: '`sem` is s/√N', code: 'abs(sem - 0.7334848328357141/5**0.5) < 1e-9' },
        { name: 'both are printed', code: 'len(_stdout.split()) >= 2' },
      ],
      hints: ['Two bugs: one in the standard deviation, one in the standard error.', 'Use `np.std(t, ddof=1)` and divide by `np.sqrt(len(t))`.'],
      teach: '`np.std(x, ddof=1)` is the sample standard deviation; the standard error divides it by √N.',
      explain: t`\`ddof=1\` gives $s = 0.733$ μs (the default gives 0.656, too small by $\sqrt{4/5}$), and $s/\sqrt5 = 0.328$ μs. The starter divided by $N$ instead of $\sqrt N$ as well — a factor of $\sqrt5$ too optimistic.`,
    }),
    mcq({
      id: 'correlated', difficulty: 3,
      prompt: t`A data logger records a pressure 1000 times in one second. The readings scatter with $s = 0.8$ kPa, so someone quotes the mean ± $0.8/\sqrt{1000} = 0.025$ kPa. The record (picture) wanders slowly. Why is 0.025 kPa too small?`,
      visual: (() => { const rng = []; let v = 0; const z = M.samples('normal', { mu: 0, sigma: 1 }, 60, 31); for (let i = 0; i < 60; i++) { v = 0.92 * v + 0.32 * z[i]; rng.push(+(101.3 + v).toFixed(3)); } return runChart(rng, { ylabel: 'pressure (kPa)', xlabel: 'sample (every ~17 ms)', caption: 'Sixty of the samples: neighbours are close to each other, so the record drifts rather than scattering independently.' }); })(),
      choices: [
        'Neighbouring readings are correlated, so the 1000 readings carry far fewer than 1000 independent pieces of information',
        'The standard deviation should have been divided by 1000, not √1000',
        'A logger’s readings are Type B, so the SEM does not apply',
        '1000 readings are too many: the SEM only works for small N',
      ],
      answer: 0,
      why: {
        1: 'Dividing by N would make the claim even smaller. The problem is that the √N law itself does not apply.',
        2: 'Readings analysed statistically are a Type A evaluation; the issue is their independence, not their type.',
        3: 'The SEM works for any N — provided the errors are independent.',
      },
      hints: ['The √N law assumes each reading’s error is independent of the others. Is it here?', 'If a reading is high, is the next one likely to be high too? Then two readings are not two independent pieces of evidence.'],
      teach: 'σ/√N assumes independent errors; slowly wandering (correlated) readings average down much more slowly.',
      explain: 'When each reading is close to the last, a thousand samples in one second may hold only a few independent values. The honest uncertainty comes from repeating the whole one-second measurement, or from the number of independent stretches — the module on noise treats this with the Allan deviation.',
    }),
    num({
      id: 's-uncertain', difficulty: 3,
      gen(r) {
        const N = r.pick([4, 5, 6, 10, 20]);
        const rel = 100 / Math.sqrt(2 * (N - 1));
        return {
          prompt: t`The standard deviation from $N$ readings is itself uncertain: for normal errors its relative standard uncertainty is about $1/\sqrt{2(N-1)}$. For $N = ${N}$, what is that, as a percentage?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [2, 50], y: [0, 75], xlabel: 'number of readings N', ylabel: 'uncertainty of s (%)', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: '100/sqrt(2(x - 1))', domain: [2, 50], color: 'accent' }] }, caption: 'How well s itself is known, against the number of readings.' },
          answer: rel, units: '%', tol: { rel: 0.01 },
          hints: [t`Put $N = ${N}$ into $1/\sqrt{2(N-1)}$.`, t`$1/\sqrt{2 \times ${N - 1}} = 1/\sqrt{${2 * (N - 1)}}$; multiply by 100 for a percentage.`],
          teach: 'With few readings s is itself poorly known, which is why uncertainties are quoted to only one or two significant figures.',
          explain: t`$1/\sqrt{${2 * (N - 1)}} = ${(rel / 100).toFixed(3)}$, about ${rel.toFixed(0)}%. An uncertainty known to ±${rel.toFixed(0)}% deserves ${rel > 20 ? 'one significant figure, two at most' : 'two significant figures at most'}.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps', difficulty: 2, transfer: true,
      gen(r) {
        const s = r.pick([2.5, 3.0, 3.5, 4.0]), N = r.pick([100, 400, 900]);
        return {
          prompt: t`A GPS receiver’s position fixes scatter by $s = ${s.toFixed(1)}$ m (east–west). Assuming ${N} fixes with independent errors, what is the standard error of their averaged position, in m?`,
          visual: stat('target', { bias: 0, spread: 1.4, n: 120, seed: 77 }, 'Single fixes scattered about the antenna’s true position (illustrative).'),
          answer: s / Math.sqrt(N), units: 'm', tol: { rel: 0.01 },
          errors: [{ value: s, feedback: 'That is the scatter of one fix. The average of many is known better.' }, { value: s / N, feedback: t`Divide by $\sqrt N$.` }],
          hints: [t`$\sigma_{\bar x} = s/\sqrt N$.`],
          teach: 'The standard error of N independent readings is s/√N.',
          explain: t`$${s.toFixed(1)}/\sqrt{${N}} = ${sf(s / Math.sqrt(N), 2)}$ m. In practice consecutive fixes share slowly changing atmospheric and orbit errors, so they are not independent over minutes, and real averaged positions improve more slowly than this — the independence assumption is what to question first.`,
        };
      },
    }),
    mcq({
      id: 'cp-compare-engines', difficulty: 2,
      prompt: t`Two engine designs are each fired 9 times. Specific impulse: design P, $\bar I = 251.0$ s with $s = 3.0$ s; design Q, $\bar I = 254.0$ s with $s = 3.0$ s. Which error bars tell you whether their **mean** performance differs?`,
      visual: compare([{ v: 251.0, s: 1.0, label: 'P' }, { v: 254.0, s: 1.0, label: 'Q', color: 'violet' }], { xlabel: 'specific impulse (s)', caption: 'The two means with ±1 SEM (solid) and ±2 SEM (dashed) bars.' }),
      choices: [
        'The standard errors, 1.0 s each: the means differ by about 2.1 combined standard errors',
        'The standard deviations, 3.0 s each: they overlap, so the designs are the same',
        'The standard deviations, because 9 firings are too few for a standard error',
        'Neither: specific impulse cannot be averaged',
      ],
      answer: 0,
      why: {
        1: 'The SDs describe firing-to-firing scatter. Whether the means differ depends on how well each mean is known: 3.0/√9 = 1.0 s.',
        2: 'Nine firings give a perfectly usable standard error; its own uncertainty is about 25%, which is worth remembering.',
        3: 'It is a measured quantity like any other.',
      },
      hints: ['The question is about the means. What is the uncertainty of a mean?'],
      teach: 'Comparisons of means use standard errors; standard deviations describe single readings.',
      explain: t`$\sigma_{\bar I} = 3.0/\sqrt9 = 1.0$ s each; the difference, 3.0 s, is $3.0/\sqrt{1.0^2 + 1.0^2} = 2.1$ combined standard errors — suggestive, not conclusive. The [agreement test](#/lesson/lab.A4.1) makes this precise.`,
    }),
    num({
      id: 'cp-halve', difficulty: 2,
      gen(r) {
        const N = r.pick([8, 10, 12, 15, 20]);
        return {
          prompt: t`You have ${N} readings. How many **more** must you take to halve the standard error of the mean?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [1, 5 * N], y: [0, 1.1], xlabel: 'number of readings N', ylabel: 'SEM ÷ s', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: '1/sqrt(x)', color: 'accent' }], points: [{ x: N, y: +(1 / Math.sqrt(N)).toFixed(4), color: 'gold', label: `now: ${N}` }] }, caption: 'The standard error, in units of s, against N.' },
          answer: 3 * N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: N, feedback: t`Doubling $N$ divides the SEM by $\sqrt2$ only. Halving it needs $4N$ in total.` }, { value: 4 * N, feedback: t`$4N = ${4 * N}$ is the total; you already have ${N}.` }],
          hints: [t`The SEM goes as $1/\sqrt N$: what total $N$ halves it?`],
          teach: 'Halving a standard error takes four times the readings.',
          explain: t`A total of $4 \times ${N} = ${4 * N}$, so ${3 * N} more.`,
        };
      },
    }),
  ],
  sources: [SRC.gum, SRC.taylor('ch. 4–5'), { label: 'NumPy documentation: numpy.std (ddof)', url: 'https://numpy.org/doc/stable/reference/generated/numpy.std.html' }],
});
