// Lab 1 (virtual): measurement and uncertainty at the bench — repeated
// readings, mean, standard deviation and standard error; resolution as a
// Type B uncertainty; random against systematic error; comparing a result
// with an expected value in units of its uncertainty.
import { lesson, mcq, num } from '../../src/core/content.js';
import { B, sf, list, plot, forest, rd, SOURCES } from './_lab.js';

const t = String.raw;

// the worked example: eight hand timings of one swing (seed 31 of the bench)
const EX = (() => {
  const rows = B.makeData('stopwatch', { seed: 31, n: 8 }).rows;
  const xs = rows.map((r) => r.R[0]);
  const st = B.stats(xs);
  const uB = B.resolutionU(0.01);
  const uc = Math.hypot(st.sem, uB);
  return { rows, xs, st, uB, uc, sum: xs.reduce((s, x) => s + x, 0), dev2: xs.reduce((s, x) => s + (x - st.mean) ** 2, 0) };
})();

// twenty groups, ten timings each: seven honest ±1σ bars miss the true period
const FOREST = Array.from({ length: 20 }, (_, g) => B.repeatStats('stopwatch', B.makeData('stopwatch', { seed: 800 + g, n: 10 }).rows));
const MISSES = FOREST.filter((q) => Math.abs(q.mean - q.accepted) > q.sem).length;

const T0 = 2 * Math.PI * Math.sqrt(0.993 / 9.8);   // the bench pendulum’s true period, 2.000 s

/** Seeded single-swing timings, re-drawn until they actually scatter. */
function timings(r, n, params = {}, sys = null) {
  for (;;) {
    const rows = B.makeData('stopwatch', { seed: r.int(1, 999999), n, params, sys }).rows;
    const st = B.stats(rows.map((q) => q.R[0]));
    if (st.sd > 0.02) return { rows, xs: rows.map((q) => q.R[0]), st };
  }
}

export default lesson({
  id: 'phys2210.L.1',
  title: 'Measurement and uncertainty at the bench',
  minutes: 14, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** The bench below does not measure anything: it computes each reading as the true value plus a realistic random error, rounded the way the instrument would round it. What it trains is real — the analysis every lab does.

Time one swing of a pendulum with a stopwatch, again and again, and no two readings agree: your reaction at the start and the stop differs each time. That scatter is **random error**. Average $N$ readings and its effect on the mean shrinks like $1/\sqrt N$:

$$\bar x = \frac1N\sum_{i=1}^{N} x_i, \qquad s = \sqrt{\frac{\sum_i (x_i - \bar x)^2}{N - 1}}, \qquad \sigma_{\bar x} = \frac{s}{\sqrt N}$$

An error that is the same every time — a watch you always stop late — is **systematic**, and no amount of averaging removes it. (Lab skill trained: analysing data and its uncertainty, in the language of the AAPT lab guidelines.)`,
  symbols: [
    { tex: 'x_i', text: 'one reading — here a stopwatch time, in s; $i$ counts the readings from 1 to $N$' },
    { tex: 'N', text: 'how many readings you took' },
    { tex: '\\bar x', text: 'the mean: your best estimate of the true value' },
    { tex: 's', text: 'the standard deviation of the readings: the typical size of one reading’s random error. Dividing by $N - 1$, not $N$, corrects for measuring the scatter about $\\bar x$ rather than about the unknown true value' },
    { tex: '\\sigma_{\\bar x}', text: 'the standard error of the mean (SEM): the uncertainty of $\\bar x$ itself. It shrinks as $1/\\sqrt N$; $s$ does not' },
  ],
  why: 'Every result in a lab report, a test-stand data sheet or a discovery paper is a mean with a standard error — and a claim about whether systematic errors are under control.',
  visual: {
    type: 'lab-bench',
    title: 'The bench: timing a seconds pendulum by hand',
    lead: t`The pendulum is 0.993 m long, so its true period is 2.000 s. Each press of **Take a measurement** times one swing; the dot histogram shows every reading, the gold line their mean with its ±1 SEM bar, and the shaded band ±1 SD.`,
    tasks: [
      'Press Take 10 more twice: the ±1 SD band keeps its width, but the SEM bar on the mean narrows.',
      'Switch to 10 swings per timing: the same reaction errors are now shared by ten swings, so the scatter of T shrinks tenfold.',
      'Turn on the reaction bias: every reading moves 0.10 s. The mean moves with them — and more readings will not bring it back.',
    ],
    params: { exp: 'stopwatch', prefill: 5, seed: 25 },
  },
  example: {
    prompt: t`Eight hand timings of one swing of the bench pendulum read ${list(EX.xs, 0.01, 's')}. Report the period with its uncertainty, and say whether it agrees with the expected 2.000 s.`,
    visual: plot('stopwatch', EX.rows, { repeat: true, caption: 'The eight timings, the mean (gold) with its ±1 SEM bar, and the ±1 SD band. The green dashed line is the expected 2.000 s.' }),
    steps: [
      { label: 'Mean', text: t`$\bar T = \dfrac{${sf(EX.sum, 4)}\ \text{s}}{8} = ${sf(EX.st.mean, 5)}\ \text{s}$. Keep the extra digits until the end.` },
      { label: 'Scatter', text: t`The squared deviations from the mean add to $${sf(EX.dev2, 3)}\ \text{s}^2$, so $s = \sqrt{${sf(EX.dev2, 3)}/7} = ${sf(EX.st.sd, 3)}\ \text{s}$ — one timing is typically off by about 0.05 s, the size of a human reaction error.` },
      { label: 'Standard error', text: t`$\sigma_{\bar T} = s/\sqrt 8 = ${sf(EX.st.sem, 3)}\ \text{s}$. This is a **Type A** uncertainty: evaluated statistically, from the scatter.` },
      { label: 'Resolution', text: t`The watch shows hundredths, so a reading could be anywhere in a 0.01 s window. Taking every place in that window as equally likely gives the **Type B** standard uncertainty $u_B = \dfrac{0.01\ \text{s}}{2\sqrt3} = ${sf(EX.uB, 2)}\ \text{s}$ — small next to the SEM.` },
      { label: 'Combine', text: t`Independent uncertainties add in quadrature: $u = \sqrt{${sf(EX.st.sem, 3)}^2 + ${sf(EX.uB, 2)}^2} = ${sf(EX.uc, 3)}\ \text{s}$. Round it to two figures (it starts with a 1) and the value to the same decimal place: $T = ${sf(EX.st.mean, 4)} \pm ${sf(EX.uc, 2)}\ \text{s}$.` },
      { label: 'Compare', text: t`$|${sf(EX.st.mean, 4)} - 2.000|/${sf(EX.uc, 2)} = ${(Math.abs(EX.st.mean - T0) / EX.uc).toFixed(1)}$ standard uncertainties: well within 2, so the result **agrees** with 2.000 s.` },
      { label: 'Sense check', text: t`The SEM, 0.02 s, is about 1 % of the period. Timing ten swings at once would cut it tenfold, because the same two reactions are then spread over ten periods.` },
    ],
    answer: t`$T = ${sf(EX.st.mean, 4)} \pm ${sf(EX.uc, 2)}\ \text{s}$, ${(Math.abs(EX.st.mean - T0) / EX.uc).toFixed(1)} standard uncertainties from 2.000 s: in agreement.`,
  },
  practice: [
    num({
      id: 'sd-five', difficulty: 2,
      gen(r) {
        const { rows, xs, st } = timings(r, 5);
        return {
          prompt: t`Five hand timings of one swing: ${list(xs, 0.01, 's')}. What is their standard deviation $s$ (dividing by $N - 1$)? Give two significant figures.`,
          answer: +st.sd.toPrecision(3), units: 's', tol: { rel: 0.03 },
          errors: [
            { value: st.sdPop, feedback: t`That divides by $N = 5$. The sample standard deviation divides by $N - 1 = 4$, because the deviations are measured from $\bar x$, which was fitted to these same readings.` },
            { value: st.sem, feedback: t`That is the standard error of the mean, $s/\sqrt N$. The question asks for the scatter of one reading, $s$ itself.` },
          ],
          hints: [t`First the mean, $\bar x = ${B.stats(xs).mean.toFixed(3)}$ s. Then square each reading’s deviation from it.`, t`Add the five squared deviations, divide by $N - 1 = 4$, and take the square root.`],
          teach: t`The standard deviation measures the scatter of single readings, with $N - 1$ in the denominator.`,
          explain: t`$\bar x = ${st.mean.toFixed(3)}$ s; the squared deviations add to $${sf(st.sd ** 2 * 4, 3)}\ \text{s}^2$, so $s = \sqrt{${sf(st.sd ** 2 * 4, 3)}/4} = ${sf(st.sd, 2)}$ s.`,
          visual: plot('stopwatch', rows, { repeat: true, stats: false, caption: 'The five timings (each dot one reading); the green dashed line is the true 2.000 s.' }),
        };
      },
    }),
    num({
      id: 'sem-sixteen', difficulty: 1,
      gen(r) {
        const n = r.pick([9, 16, 25, 36]);
        const { rows, st } = timings(r, n);
        const s = +st.sd.toFixed(3);
        const sem = s / Math.sqrt(n);
        return {
          prompt: t`${n} timings of one swing have a standard deviation of $s = ${s.toFixed(3)}$ s. What is the standard error of their mean?`,
          answer: +sem.toPrecision(3), units: 's', tol: { rel: 0.02 },
          errors: [
            { value: s / n, feedback: t`Divide by $\sqrt N$, not by $N$: averaging beats down random error only as the square root of the number of readings.` },
            { value: s, feedback: t`That is the scatter of one reading. The mean of ${n} readings is known better than any single one.` },
          ],
          hints: [t`$\sigma_{\bar x} = s/\sqrt N$.`],
          teach: t`The standard error of the mean is the standard deviation divided by the square root of the number of readings.`,
          explain: t`$\sigma_{\bar x} = ${s.toFixed(3)}/\sqrt{${n}} = ${s.toFixed(3)}/${Math.sqrt(n)} = ${sf(sem, 2)}$ s.`,
          visual: plot('stopwatch', rows, { repeat: true, stats: false, caption: `All ${n} timings. Their spread is s; the uncertainty of their average is much smaller.` }),
        };
      },
    }),
    mcq({
      id: 'four-times', difficulty: 2,
      prompt: t`You have 10 timings of the swing. You take 30 more, so you have 4 times as many. What happens to the standard deviation $s$ and to the standard error $\sigma_{\bar x}$?`,
      choices: [
        t`$s$ stays about the same; $\sigma_{\bar x}$ roughly halves`,
        t`Both roughly halve`,
        t`$s$ roughly halves; $\sigma_{\bar x}$ stays the same`,
        t`$s$ stays the same; $\sigma_{\bar x}$ falls to a quarter`,
      ],
      answer: 0,
      why: {
        1: t`More readings do not make your reactions steadier: each new reading scatters just as much, so $s$ — the scatter of one reading — does not shrink.`,
        2: t`It is the other way round: $s$ describes one reading and stays put; the mean improves.`,
        3: t`$\sigma_{\bar x} = s/\sqrt N$: four times the readings divides it by $\sqrt 4 = 2$, not by 4.`,
      },
      hints: ['Which of the two describes a single reading, and which describes the mean?', t`$\sigma_{\bar x} = s/\sqrt N$ — what does $\sqrt N$ do when $N$ is multiplied by 4?`],
      teach: 'More readings pin down the mean better (the SEM falls as 1/√N) but do not change how much one reading scatters.',
      explain: t`$s$ is a property of the timing method — about 0.05 s per reading here — so it settles near that value however many readings you take. $\sigma_{\bar x} = s/\sqrt N$ falls by $\sqrt{40/10} = 2$.`,
      visual: plot('stopwatch', B.makeData('stopwatch', { seed: 77, n: 10 }).rows, { repeat: true, caption: 'Your first 10 timings, with their mean, ±1 SEM bar and ±1 SD band. Predict what 30 more would change.' }),
    }),
    num({
      id: 'resolution', difficulty: 2,
      gen(r) {
        const [what, step, unit, show] = r.pick([
          ['a stopwatch that shows hundredths of a second', 0.01, 'ms', 1000],
          ['a photogate timer that shows tenths of a millisecond', 0.0001, 'ms', 1000],
          ['a digital thermometer that shows tenths of a degree', 0.1, 'K', 1],
          ['a digital balance that shows tenths of a gram', 0.1, 'g', 1],
        ]);
        const u = B.resolutionU(step) * show;
        const stepTxt = `${rd(step * show, step * show)} ${unit}`;
        return {
          prompt: t`You read ${what}. Treat the true value as equally likely to lie anywhere within the ${stepTxt} window around the displayed digit. What standard uncertainty does the display’s resolution alone contribute? (Answer in ${unit}.)`,
          answer: +u.toPrecision(3), units: unit, tol: { rel: 0.02 },
          errors: [
            { value: (step * show) / 2, feedback: t`Half a step is the half-width $a$ of the window — the *largest* possible error, not its standard deviation. For a flat (rectangular) distribution, $u = a/\sqrt3$.` },
            { value: step * show, feedback: t`That is the whole step. The true value is at most half a step from the displayed one, and its standard deviation is smaller still: $u = a/\sqrt 3$ with $a$ half a step.` },
            { value: (step * show) / Math.sqrt(3), feedback: t`Close: but $a$ in $u = a/\sqrt3$ is the *half*-width of the window, half a step.` },
          ],
          hints: [t`The window is one display step wide, so its half-width is $a = \tfrac12$ step.`, t`A rectangular distribution of half-width $a$ has standard deviation $u = a/\sqrt 3$.`],
          teach: t`A reading limited only by resolution has a Type B standard uncertainty of half a step divided by $\sqrt 3$ (GUM, rectangular distribution).`,
          explain: t`$u = \dfrac{a}{\sqrt 3} = \dfrac{\tfrac12 \times ${rd(step * show, step * show)}\ \text{${unit}}}{\sqrt 3} = ${sf(u, 2)}$ ${unit}. Quoting “±half a step” overstates it by a factor $\sqrt 3 \approx 1.7$.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [-1, 1], y: [0, 1.5], xlabel: 'true value − displayed value (display steps)', ylabel: 'likelihood', xticks: 8, yticks: 0.001,
              shade: [{ fn: '1', from: -0.5, to: 0.5, color: 'accent', alpha: 0.28 }],
              curves: [{ fn: '1', domain: [-0.5, 0.5], color: 'accent' }, { param: ['-0.5', 't'], t: [0, 1], color: 'accent' }, { param: ['0.5', 't'], t: [0, 1], color: 'accent' }],
              arrows: [{ from: [0, 1.22], to: [0.5, 1.22], label: 'a = half a step', labelDx: -40, labelDy: -12 }],
              points: [{ x: 0, y: 0.06, r: 4, color: 'gold', label: 'displayed digit', labelDx: 8, labelDy: -10 }],
            },
            caption: 'Every true value inside the window is equally likely: a rectangular distribution of half-width a.',
          },
        };
      },
    }),
    mcq({
      id: 'average-systematic', difficulty: 2,
      gen(r) {
        const { rows, st } = timings(r, 20, {}, 'reaction');
        return {
          prompt: t`Your 20 timings average $${st.mean.toFixed(3)} \pm ${st.sem.toFixed(3)}$ s (mean ± SEM). The pendulum’s period is known to be 2.000 s. You take 200 more timings in exactly the same way. What will most likely happen?`,
          choices: [
            'The SEM shrinks about threefold, the mean stays near the same value, and the disagreement with 2.000 s becomes even more significant',
            'The mean drifts down to 2.000 s as the errors average out',
            'The SEM grows, because more readings means more error',
            'Nothing changes: 20 readings already average every error away',
          ],
          answer: 0,
          why: {
            1: t`Averaging cancels errors that go both ways at random. An error that is the same every time — here the mean sits ${(st.mean - 2).toFixed(2)} s high — survives any amount of averaging.`,
            2: t`The SEM is $s/\sqrt N$: more readings make it smaller, never larger.`,
            3: t`Twenty readings give an SEM of about 0.01 s; more readings shrink that further. But no number of readings removes a systematic offset.`,
          },
          hints: ['How far is the mean from 2.000 s, in SEMs? Could random scatter alone do that?', t`Averaging divides random error by $\sqrt N$. What does it do to an error that is identical in every reading?`],
          teach: 'Averaging reduces random error but leaves systematic error untouched, so more data make a systematic offset more obvious, not smaller.',
          explain: t`The mean is about ${((st.mean - 2) / st.sem).toFixed(0)} SEMs above 2.000 s: far too far for chance. Something adds about ${(st.mean - 2).toFixed(2)} s to every timing — here, stopping the watch late. With 220 timings the SEM falls by $\sqrt{11} \approx 3.3$ while the offset stays: the cure is to find the cause, not to average.`,
          visual: plot('stopwatch', rows, { repeat: true, caption: 'Your 20 timings, their mean with its ±1 SEM bar, and the known 2.000 s (green, dashed).' }),
        };
      },
    }),
    mcq({
      id: 'more-digits', difficulty: 1,
      prompt: t`Another group divides on a calculator and reports $T = 2.003471$ s, with no uncertainty. You report $T = 2.01 \pm 0.02$ s. They say their result is more accurate because it has more digits. Who is right?`,
      choices: [
        'Neither claim can be judged from the digits: extra digits only claim a precision they have not shown, and without an uncertainty their result cannot be tested at all',
        'They are: more significant figures means a more accurate result',
        'They are: 2.003471 s happens to be closer to 2.000 s, so theirs is the better measurement',
        'You are: a result with fewer digits is always more reliable',
      ],
      answer: 0,
      why: {
        1: 'Digits record what a calculator printed, not what the stopwatch can resolve or how well your reactions repeat. Accuracy is closeness to the true value; only an uncertainty says how close a result can claim to be.',
        2: 'One result landing close to the truth can be luck. Without an uncertainty, nobody — including them — can tell luck from skill.',
        3: 'Fewer digits are not better in themselves; the digits should match the uncertainty. 2.01 ± 0.02 s is right because its last digit sits where its uncertainty sits.',
      },
      hints: ['What does a result need before you can say whether it agrees with 2.000 s?'],
      teach: 'Significant figures are a reporting convention that must match the uncertainty; more digits never make a measurement more accurate.',
      explain: 'A result is a range, not a number. Yours says “2.01 s, give or take 0.02 s” — it can be tested against 2.000 s, and passes. Theirs claims a precision of a microsecond from a hand-held stopwatch, which no one can check.',
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [1.96, 2.04], y: [0.3, 2.7], xlabel: 'T (s)', ylabel: ' ', yticks: 0.001, xticks: 8,
          curves: [{ param: ['1.99 + 0.04*t', '2'], t: [0, 1], color: 'accent', width: 2.4 }],
          points: [{ x: 2.01, y: 2, r: 4, color: 'accent', label: 'yours: 2.01 ± 0.02 s', labelDx: 8, labelDy: -14 }, { x: 2.003471, y: 1, r: 4, color: 'warn', label: 'theirs: 2.003471 s (no uncertainty)', labelDx: 8, labelDy: -14 }],
          vlines: [{ x: 2.0, label: 'true 2.000 s', color: 'good' }],
        },
        caption: 'Your result is a range; theirs is a point with nothing to say how far it might be off.',
      },
    }),
    num({
      id: 'how-many-sem', difficulty: 2,
      gen(r) {
        const sys = r.bool(0.5) ? 'reaction' : null, n = r.pick([12, 15, 20]);
        let rows, st, m, u;
        do { ({ rows, st } = timings(r, n, {}, sys)); m = +st.mean.toFixed(3); u = +st.sem.toFixed(3); } while (Math.abs(m - 2) < 0.004);
        const z = Math.abs(m - 2) / u;
        return {
          prompt: t`${rows.length} timings give $\bar T = ${m.toFixed(3)} \pm ${u.toFixed(3)}$ s (mean ± SEM). How many standard errors is that from the expected 2.000 s?`,
          answer: +z.toPrecision(3), tol: { rel: 0.02, abs: 0.02 },
          errors: [{ value: Math.abs(m - 2), feedback: 'That is the difference in seconds. Divide it by the standard error to express it in SEMs.' }],
          hints: [t`$z = |\bar T - 2.000\ \text{s}|/\sigma_{\bar T}$.`],
          teach: 'Judge a difference by dividing it by its uncertainty: about 2 or less is agreement, much more means something is wrong.',
          explain: t`$z = |${m.toFixed(3)} - 2.000|/${u.toFixed(3)} = ${z.toFixed(1)}$. ${z < 2 ? 'Under 2: the result agrees with 2.000 s.' : 'Well over 2: random scatter cannot explain a gap this size, so look for a systematic error.'}`,
          visual: plot('stopwatch', rows, { repeat: true, caption: 'The timings, their mean with its ±1 SEM bar, and the expected 2.000 s (green, dashed).' }),
        };
      },
    }),
    mcq({
      id: 'bars-miss', difficulty: 3,
      prompt: t`Twenty lab groups each time the same pendulum ten times and report $\bar T \pm \sigma_{\bar T}$. The picture shows all twenty results: ${MISSES} of the ±1σ bars miss the true 2.000 s. What do you conclude about those ${MISSES} groups?`,
      choices: [
        'Probably nothing is wrong: a ±1σ bar should miss the true value about one time in three, so about 7 misses in 20 is what honest error bars look like',
        'They made mistakes: a correct result’s error bar always contains the true value',
        'They should have quoted ±2σ bars, which can never miss the true value',
        'Error bars cannot be compared across groups, so nothing can be concluded',
      ],
      answer: 0,
      why: {
        1: 'A ±1σ interval of a Gaussian error covers the true value only 68 % of the time. If every bar touched the truth, the bars would be too wide.',
        2: '±2σ bars miss about one time in twenty — rarely, but not never. No finite error bar is a guarantee.',
        3: 'They can: each bar is a standard uncertainty, so each miss can be judged in units of σ — and none here is more than about 2σ out.',
      },
      hints: ['What fraction of a normal distribution lies within ±1 standard deviation of its centre?', 'About 68 % inside means about 32 % — one in three — outside.'],
      teach: 'Honest ±1σ error bars miss the true value about a third of the time; only misses of several σ signal a mistake.',
      explain: t`With Gaussian errors, a ±1σ bar contains the true value 68 % of the time, so about $0.32 \times 20 \approx 6$–7 bars should miss it. ${MISSES} misses, none by more than about 2σ, is exactly what twenty honest groups look like.`,
      visual: forest(FOREST.map((q) => ({ v: q.mean, s: q.sem })), T0, { xlabel: 'T (s)', unit: 's' }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ten-swings', difficulty: 2,
      gen(r) {
        const { rows, xs, st } = timings(r, 5, { n: 10 });
        const semT = st.sem / 10;
        return {
          prompt: t`This time you time **ten** swings at once, five times: ${list(xs, 0.01, 's')}. What is the standard error of the mean **period** $T$, in milliseconds?`,
          answer: +(semT * 1000).toPrecision(3), units: 'ms', tol: { rel: 0.03 },
          errors: [{ value: (st.sd / 10) * 1000, feedback: t`That is the scatter of one period; the mean of five is better by $\sqrt 5$.` }],
          hints: [t`Each reading is $10T$, so first find the SEM of the five readings, then divide by 10.`, t`$s$ of the readings, then $\sigma = s/\sqrt 5$, then $\sigma_T = \sigma/10$.`],
          teach: 'Timing ten swings spreads the same reaction error over ten periods, dividing its effect on T by ten.',
          explain: t`The readings have $s = ${sf(st.sd, 2)}$ s, so their mean is uncertain by $${sf(st.sd, 2)}/\sqrt5 = ${sf(st.sem, 2)}$ s, and $T = t_{10}/10$ by $${sf(semT * 1000, 2)}$ ms — ten times better than single swings timed as often.`,
          visual: plot('stopwatch', rows, { repeat: true, stats: false, params: { n: 10 }, caption: 'The five ten-swing timings, each divided by 10 to give a period.' }),
        };
      },
    }),
    num({
      id: 'cp-load-cell', difficulty: 3, transfer: true,
      gen(r) {
        let F, sd, n, pct, uA, uB;
        do {
          F = r.int(1800, 3200); sd = r.int(12, 30); n = r.pick([5, 6, 8]); pct = r.pick([0.3, 0.4, 0.5]);
          uA = sd / Math.sqrt(n); uB = (pct / 100) * F;
        } while (Math.min(uA, uB) / Math.max(uA, uB) < 0.35);
        const uc = Math.hypot(uA, uB);
        return {
          prompt: t`In a static fire of a small rocket motor, ${n} repeated burns give a mean thrust of ${F} N with a standard deviation of ${sd} N. The load cell’s calibration certificate gives a standard uncertainty of ${pct.toFixed(1)} % of reading. What is the combined standard uncertainty of the mean thrust?`,
          answer: +uc.toPrecision(3), units: 'N', tol: { rel: 0.03 },
          errors: [
            { value: uA + uB, feedback: 'Independent uncertainties add in quadrature, √(a² + b²), not linearly: they rarely push the same way at once.' },
            { value: uA, feedback: 'That is only the Type A part. The calibration uncertainty affects every burn the same way, so averaging does not reduce it — it must be added.' },
            { value: uB, feedback: 'That is only the calibration part. The burn-to-burn scatter leaves the mean uncertain too.' },
            { value: Math.hypot(sd, uB), feedback: 'The scatter of one burn is s; the mean of all of them is uncertain by s/√N.' },
          ],
          hints: [t`Type A: $u_A = s/\sqrt N = ${sd}/\sqrt{${n}}$. Type B: $u_B = ${pct.toFixed(1)}\% \times ${F}$ N.`, t`Combine: $u_c = \sqrt{u_A^2 + u_B^2}$.`],
          teach: 'A Type A standard error and a Type B calibration uncertainty combine in quadrature — and averaging shrinks only the first.',
          explain: t`$u_A = ${sd}/\sqrt{${n}} = ${sf(uA, 3)}$ N and $u_B = ${sf(uB, 3)}$ N, so $u_c = \sqrt{${sf(uA, 3)}^2 + ${sf(uB, 3)}^2} = ${sf(uc, 3)}$ N. ${uB > uA ? 'The calibration dominates: more burns would hardly help; a better-calibrated load cell would.' : 'The burn-to-burn scatter dominates: more burns would help.'}`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 3], y: [0, +(1.35 * Math.max(uA, uB)).toFixed(2)], xlabel: ' ', ylabel: 'standard uncertainty (N)', xticks: 0.001,
              shade: [{ fn: String(+uA.toFixed(3)), from: 0.35, to: 1.15, color: 'accent', alpha: 0.75 }, { fn: String(+uB.toFixed(3)), from: 1.85, to: 2.65, color: 'violet', alpha: 0.75 }],
              points: [{ x: 0.35, y: +(uA * 1.1).toFixed(3), r: 0.01, color: 'accent', label: 'Type A: scatter ÷ √N' }, { x: 1.85, y: +(uB * 1.1).toFixed(3), r: 0.01, color: 'violet', label: 'Type B: calibration' }],
            },
            caption: 'The two parts of the uncertainty budget, drawn to scale. They are independent, so they combine in quadrature.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-not-averaged', difficulty: 2,
      prompt: 'Which of these errors would taking many more readings and averaging them NOT reduce?',
      choices: [
        'A load cell that reads 2 % high on every reading',
        'Electrical noise that makes each reading jitter up or down',
        'Your reaction time, which differs at each start and stop',
        'The last digit of a display flickering between two values',
      ],
      answer: 0,
      why: {
        1: 'Noise pushes readings up as often as down, so it averages away as 1/√N.',
        2: 'Reaction errors go both ways at random, so averaging beats them down.',
        3: 'A flickering digit is random from reading to reading; the average of many settles between the two values.',
      },
      hints: ['Which error pushes every reading the same way?'],
      teach: 'Averaging only cancels errors that vary randomly in sign; a fixed bias needs calibration.',
      explain: 'A calibration error shifts every reading by the same fraction, so the mean inherits it in full. Only checking the instrument against a known standard reveals it.',
      visual: plot('stopwatch', B.makeData('stopwatch', { seed: 5, n: 30, sys: 'reaction' }).rows, { repeat: true, caption: 'Thirty readings with a fixed bias: the scatter averages down, the offset from the true value (green) does not.' }),
    }),
  ],
  sources: [
    SOURCES.taylor('ch. 4 (statistical analysis of random uncertainties)'),
    SOURCES.gum,
    SOURCES.nist,
    SOURCES.aapt,
  ],
});
