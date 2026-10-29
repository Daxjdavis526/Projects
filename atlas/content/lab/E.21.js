// Radioactive decay counting — the lab view: Ba-137m eluted from a Cs-137
// generator and counted in 30 s bins for fifteen minutes. Counts are Poisson;
// the background, counted beforehand, is subtracted; ln(N − B) against time is
// a straight line whose slope gives the half-life, fitted with weights that
// grow with the counts. The systematic: forgetting the background (the tail
// levels off, the half-life comes out long); dead time; the low-count limit
// of a log-linear fit; the comparison with NNDC's 2.552 min. A spacecraft's
// plutonium power source as the transfer. Every number is computed from the
// seeded model the labg-classics simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, table, SIMNOTE, SRC } from './_classic.js';
import { stat } from './_unc.js';

const t = String.raw;
const PD = M.EXPERIMENTS.decay.defaults;
const T12 = M.BA137M;
const Bbin = (PD.bgN / PD.bgT) * PD.bin * 60, sBbin = (Math.sqrt(PD.bgN) / PD.bgT) * PD.bin * 60;

// the worked example: seed 4
const EX = M.run('decay', { seed: 4 });
const EXh = EX.results[0];
const rowsOf = (R) => {
  const cols = [0, 10, 20].map((k) => R.slice(k, k + 10));
  return table([[t`t\ (\text{min})`, 'N', t`t\ (\text{min})`, 'N', t`t\ (\text{min})`, 'N'], ...cols[0].map((_, i) => cols.flatMap((c) => [c[i].t.toFixed(1), String(c[i].N)]))]);
};
const q0 = EX.R[0], q29 = EX.R[29];
const runD = (seed, flags = {}, axes = null) => M.run('decay', { seed, flags, axes });

export default lesson({
  id: 'lab.E.21',
  title: 'Radioactive decay counting',
  minutes: 17, difficulty: 2,
  lab: true,
  intro: t`Each nucleus of barium-137m has the same chance per second of decaying, so a sample shrinks exponentially, and the counts a detector records in a short interval are **Poisson**: their standard deviation is the square root of their mean. A caesium-137 “cow” keeps making Ba-137m; rinse it out with a few drops of acid and you hold a sample with a half-life of minutes. Count it in bins, subtract the background the detector sees anyway, and plot the logarithm: a straight line falling with slope $-\lambda$, where $T_{1/2} = \ln 2/\lambda$.`,
  equation: t`\ln(N_i - B) = \ln N_0 - \lambda t_i, \qquad T_{1/2} = \frac{\ln 2}{\lambda}`,
  symbols: [
    { tex: 'N_i', text: 'the counts recorded in bin $i$ (30 s long here): Poisson, with standard deviation $\\sqrt{N_i}$' },
    { tex: 'B', text: 'the background expected in one bin — cosmic rays and the room — measured before the sample arrives' },
    { tex: 't_i', text: 'the time of bin $i$ (its middle), in min, from the moment counting began' },
    { tex: '\\lambda', text: 'the decay constant, in $\\text{min}^{-1}$: the chance per unit time that one nucleus decays' },
    { tex: 'N_0', text: 'the net counts a bin would hold at $t = 0$' },
    { tex: 'T_{1/2}', text: 'the half-life, in min: the time for half the nuclei to decay; NNDC gives 2.552 min for Ba-137m' },
  ],
  why: t`Counting statistics run through every particle and photon detector — from gamma spectrometers to the photon counts of an X-ray telescope — and half-lives set how long a nuclear power source on a spacecraft lasts.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: counting a decaying sample',
    lead: t`The upper panel is the raw record: counts in each 30 s bin, with the background level dashed. Below, $\ln(N - B)$ for each bin with its error bar, and the weighted line. The bars grow to the right — fewer counts, larger relative scatter — so the fit trusts the early bins most. The readout turns the slope into a half-life.`,
    tasks: [
      'Switch off “Subtract the background”: the late bins level off toward ln B, the line flattens, and the half-life comes out several σ long.',
      'Switch Plot to the exponential-plus-background fit: it finds the background itself from the tail, at the cost of a larger σ on the half-life.',
      'Clear the table and record a few bins at a time: the half-life’s σ shrinks fastest while the counts are high.',
    ],
    params: { exp: 'decay', seed: 26, expected: true },
    caption: t`Simulated counts: 120 counts/s from the sample at $t = 0$, $T_{1/2} = 2.552$ min, a true background of 0.60 counts/s (351 counts were seen in the 10-minute background run), every bin a Poisson draw; dead time neglected at these rates. Dashed green: the line the NNDC half-life predicts. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A 10-minute background run gave 351 counts. Then the eluted sample was counted in thirty 30 s bins (bin start times shown):

${rowsOf(EX.R)}

Find the half-life with its uncertainty and compare it with NNDC’s 2.552 min.`,
    visual: rigPlot('decay', { seed: 4, expected: true }, t`$\ln(N - B)$ at each bin’s midpoint, the weighted fit (gold), the NNDC line (dashed) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Background', text: t`351 counts in 600 s is $0.585 \pm 0.031$ counts/s ($\sigma = \sqrt{351}/600$), so each 30 s bin expects $B = ${Bbin.toFixed(2)} \pm ${sBbin.toFixed(2)}$ background counts.` },
      { label: 'Linearize', text: t`$N_i - B = N_0e^{-\lambda t_i}$, so $\ln(N_i - B) = \ln N_0 - \lambda t_i$. Plot it at each bin’s midpoint, $t_i = 0.25, 0.75, \dots$ min.` },
      { label: 'Error bars', text: t`$\sigma_{N_i} = \sqrt{N_i}$, and the background’s σ adds in quadrature; the logarithm divides by the value: $\sigma_{\ln} = \sqrt{N_i + \sigma_B^2}/(N_i - B)$. First bin: $\sqrt{${q0.N} + ${sBbin.toFixed(2)}^2}/${(q0.N - Bbin).toFixed(0)} = ${(Math.sqrt(q0.N + sBbin ** 2) / (q0.N - Bbin)).toFixed(4)}$; last bin: $${(Math.sqrt(q29.N + sBbin ** 2) / (q29.N - Bbin)).toFixed(3)}$. A factor of $${((Math.sqrt(q29.N + sBbin ** 2) / (q29.N - Bbin)) / (Math.sqrt(q0.N + sBbin ** 2) / (q0.N - Bbin))).toFixed(0)}$ apart, so weights differ by its square: a weighted fit is a must ([weighted least squares](#/lesson/lab.A5.2)).` },
      { label: 'Fit', text: t`Slope $${pmT(EX.fit.b, EX.fit.sb)}\ \text{min}^{-1}$, intercept $${pmT(EX.fit.a, EX.fit.sa)}$, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for $\nu = 28$.` },
      { label: 'Half-life', text: t`$T_{1/2} = \ln 2/\lambda = 0.6931/${(-EX.fit.b).toFixed(5)} = ${EXh.value.toFixed(3)}$ min, and $\sigma_{T}/T = \sigma_\lambda/\lambda$: $T_{1/2} = ${pmT(EXh.value, EXh.sigma)}$ min.` },
      { label: 'Compare', text: t`$z = (${EXh.value.toFixed(3)} - 2.552)/${EXh.sigma.toFixed(3)} = ${EXh.z.toFixed(2)}$: agreement. Better than 1% from fifteen minutes of counting — $${String(EX.R.reduce((a, q) => a + q.N, 0))}$ counts in all.` },
    ],
    answer: t`$T_{1/2} = ${pmT(EXh.value, EXh.sigma)}$ min, $${Math.abs(EXh.z).toFixed(1)}\sigma$ from NNDC’s 2.552 min.`,
  },
  practice: [
    num({
      id: 'sqrtN', difficulty: 1,
      gen(r) {
        const N = r.pick([400, 900, 2500, 10000]);
        const ans = 100 / Math.sqrt(N);
        return {
          prompt: t`A bin holds $${N}$ counts. What is its relative standard uncertainty, in percent?`,
          visual: stat('hist', { dist: 'poisson', lam: 9, n: 300 }, 'Poisson counts with mean 9, drawn 300 times: their spread is √9 = 3. Bigger means spread more, but less in proportion.'),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(N), feedback: t`$\sqrt{N}$ is the absolute σ in counts; divide by $N$ for the relative uncertainty.` }],
          hints: [t`For Poisson counts, $\sigma = \sqrt{N}$, so $\sigma/N = 1/\sqrt N$.`],
          teach: t`Counting $N$ events gives a relative uncertainty of $1/\sqrt N$: a hundredfold more counts for a tenfold better precision.`,
          explain: t`$1/\sqrt{${N}} = ${(ans / 100).toFixed(4)}$, or $${ans.toPrecision(3)}\%$.`,
        };
      },
    }),
    num({
      id: 'net-rate', difficulty: 2,
      gen(r) {
        const ts = r.pick([100, 200]), Ns = r.pick([400, 600, 900]), Nb = r.pick([100, 150, 200]), tb = r.pick([100, 200, 400]);
        const rate = Ns / ts - Nb / tb;
        const ans = Math.sqrt(Ns / ts ** 2 + Nb / tb ** 2);
        return {
          prompt: t`With the source, $${Ns}$ counts in $${ts}$ s; without it, $${Nb}$ counts in $${tb}$ s. The net rate is $${rate.toFixed(3)}$ counts/s. What is its standard uncertainty? Answer in counts/s.`,
          visual: stat('hist', { dist: 'poisson', lam: 4, n: 300 }, 'Each count is one Poisson draw: σ = √N for each, independent of the other.'),
          answer: ans, units: 's^-1', tol: { rel: 0.01 },
          errors: [
            { value: Math.sqrt(Ns - Nb) / ts, feedback: 'Subtracting does not remove the background’s own scatter: the two independent uncertainties add in quadrature.' },
            { value: Math.sqrt(Ns) / ts + Math.sqrt(Nb) / tb, feedback: 'Independent uncertainties add in quadrature, not linearly.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`Each rate is $N/t$ with $\sigma = \sqrt{N}/t$.`, t`$\sigma_\text{net} = \sqrt{N_s/t_s^2 + N_b/t_b^2}$.`],
          teach: 'A difference of two independent counts carries both their uncertainties, in quadrature.',
          explain: t`$\sqrt{${Ns}/${ts}^2 + ${Nb}/${tb}^2} = ${ans.toFixed(3)}$ counts/s: net rate $${rate.toFixed(3)} \pm ${ans.toFixed(3)}$ counts/s. Counting the background longer shrinks its share.`,
        };
      },
    }),
    num({
      id: 'half', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runD(seed);
        const b = +A.fit.b.toFixed(4);
        const ans = Math.LN2 / -b;
        return {
          prompt: t`The weighted line through $\ln(N - B)$ against $t$ (in minutes) has slope $${b.toFixed(4)}\ \text{min}^{-1}$. What half-life does it give? Answer in min.`,
          visual: rigPlot('decay', { seed }, t`The run: $\ln(N - B)$, the fit and its residuals. ${SIMNOTE}`),
          answer: ans, units: 'min', tol: { rel: 0.003 },
          errors: [
            { value: 1 / -b, feedback: t`$1/\lambda$ is the mean lifetime. The half-life is $\ln 2/\lambda$.` },
            { value: Math.log10(2) / -b, feedback: t`The logarithm on the plot is natural, so use $\ln 2 = 0.693$.` },
          ],
          hints: [t`The slope is $-\lambda$.`, t`$T_{1/2} = \ln 2/\lambda$.`],
          teach: t`The slope of $\ln N$ against $t$ is $-\lambda$; the half-life is $\ln 2/\lambda$.`,
          explain: t`$\lambda = ${(-b).toFixed(4)}\ \text{min}^{-1}$, so $T_{1/2} = 0.6931/${(-b).toFixed(4)} = ${ans.toFixed(3)}$ min.`,
        };
      },
    }),
    mcq({
      id: 'no-bg', difficulty: 3,
      prompt: t`A student fits $\ln N$ against $t$ without subtracting the background. The late points sit above the line and the half-life comes out at 2.63 min. Why long?`,
      visual: rigPlot('decay', { seed: 9, flags: { bg: false }, expected: true }, t`$\ln N$ with no background subtracted, the fit (gold) and the NNDC line (dashed). ${SIMNOTE}`),
      choices: [
        t`The constant background is a growing fraction of the late counts; $\ln N$ levels off toward $\ln B$ instead of falling, the line flattens, and $\lambda$ comes out small`,
        'The detector’s efficiency drifts down during the run',
        'Background is random, so it only adds scatter, which the weighted fit already handles',
        'The early bins are too high because of dead time, which tilts the line',
      ],
      answer: 0,
      why: {
        1: 'A drifting efficiency would make the counts fall *faster* than the decay, shortening the apparent half-life.',
        2: 'Background has a nonzero mean: about 18 counts per bin, every bin. That is a bias, not only scatter — and in the last bins it is a fifth of the counts.',
        3: 'At 120 counts/s dead time is negligible here, and it would lower the early bins (making the half-life look longer only slightly, by a different pattern).',
      },
      hints: ['How big is the background in the last bins compared with the counts there?', t`What is $\ln(N_0e^{-\lambda t} + B)$ when $N_0e^{-\lambda t} \ll B$?`],
      teach: 'A constant added to an exponential bends its logarithm flat: subtract the background before taking logs, or fit it as a parameter.',
      explain: t`At the end the sample gives about 65 counts per bin and the background about 18: $\ln N$ is $\ln 83$, not $\ln 65$. Early bins hardly notice. The tail is lifted, the slope is too shallow, and $T_{1/2}$ comes out a few percent long — several σ with this many counts.`,
    }),
    num({
      id: 'dead', difficulty: 3,
      gen(r) {
        const tau = r.pick([2, 5, 10]), m = r.pick([2e4, 5e4, 8e4]);
        const ans = m / (1 - m * tau * 1e-6);
        return {
          prompt: t`A counter with a non-paralyzable dead time of $${tau}\ \mu\text{s}$ (after each count it is blind for that long) records $${tex(m, 2)}$ counts/s. What is the true rate? Answer in counts/s.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 120], y: [0, 160], xlabel: 'recorded rate (thousand counts/s)', ylabel: 'true rate (thousand/s)', axesAt: 'edge', curves: [{ fn: 'x', color: 'ink3', dash: true }, { fn: `x/(1 - x*${tau}/1000)`, color: 'accent', domain: [0, Math.min(120, 900 / tau)] }] }, caption: `The correction n = m/(1 − mτ) for τ = ${tau} μs (dashed: no dead time). It grows quickly as the counter approaches saturation.` },
          answer: ans, units: 's^-1', tol: { rel: 0.002 },
          errors: [
            { value: m * (1 - m * tau * 1e-6), feedback: t`The true rate is *higher* than the recorded one: divide by $1 - m\tau$, do not multiply.` },
            { value: m / (1 - m * tau), feedback: t`Put $\tau$ in seconds: $${tau}\ \mu\text{s} = ${tau}\times10^{-6}$ s.` },
          ].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`In one second the counter is dead for $m\tau$ seconds.`, t`True rate $n = m/(1 - m\tau)$.`],
          teach: t`A non-paralyzable counter loses the fraction $m\tau$ of its time; the true rate is $m/(1 - m\tau)$.`,
          explain: t`$m\tau = ${tex(m, 2)} \times ${tau}\times10^{-6} = ${(m * tau * 1e-6).toFixed(2)}$, so $n = ${tex(m, 2)}/${(1 - m * tau * 1e-6).toFixed(2)} = ${tex(ans, 4)}$ counts/s. At this lab’s 120 counts/s with a 10 μs dead time the correction would be 0.12%: negligible.`,
        };
      },
    }),
    mcq({
      id: 'weights', difficulty: 2,
      prompt: t`In the plot of $\ln(N - B)$ the error bars grow from left to right. Why?`,
      visual: rigPlot('decay', { seed: 6 }, t`$\ln(N - B)$ with ±1σ bars, the weighted fit and residuals. ${SIMNOTE}`),
      choices: [
        t`$\sigma_{\ln} \approx \sqrt N/N = 1/\sqrt N$: fewer counts mean a larger *relative* scatter, and the log turns relative scatter into absolute`,
        'The detector gets noisier as the run goes on',
        t`The background grows during the run`,
        'The bars are drawn larger at later times to show they matter less',
      ],
      answer: 0,
      why: {
        1: 'Nothing in the detector changes; the counts themselves shrink.',
        2: 'The background rate is constant; it is the sample’s counts that fall.',
        3: 'The bars are computed, not chosen: they come straight from Poisson statistics.',
      },
      hints: [t`What is $\sigma$ of $\ln N$ if $\sigma_N = \sqrt N$?`],
      teach: t`For Poisson counts, $\sigma_{\ln N} = 1/\sqrt N$: the logarithm of a small count is uncertain.`,
      explain: t`$\sigma_{\ln N} = \sigma_N/N = 1/\sqrt N$ (plus the background’s part). From 3400 counts to 70, $1/\sqrt N$ grows from 0.017 to 0.12 — so the weighted fit leans on the early bins, as it should.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runD(seed);
        const v = +A.results[0].value.toFixed(3), s = +A.results[0].sigma.toFixed(3);
        const ans = (v - T12) / s;
        return {
          prompt: t`A run gives $T_{1/2} = ${v.toFixed(3)} \pm ${s.toFixed(3)}$ min. NNDC’s evaluated half-life of Ba-137m is $2.552$ min (uncertainty 0.001 min, negligible here). Give $z$, with its sign.`,
          visual: rigPlot('decay', { seed, expected: true }, t`The run, with the line NNDC’s half-life predicts (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.07 },
          errors: [{ value: (100 * (v - T12)) / T12, feedback: 'That is the percentage difference; divide the difference by σ.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract 2.552 min from the measurement.', t`$z = \Delta/\sigma$.`],
          teach: t`$z$ = difference ÷ uncertainty decides agreement.`,
          explain: t`$z = (${v.toFixed(3)} - 2.552)/${s.toFixed(3)} = ${ans.toFixed(2)}$. ${Math.abs(ans) < 2 ? 'Consistent.' : 'Beyond 2σ: check the background estimate, which shifts every point the same way and is not in the fit’s σ as a correlated error.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-lowcount', difficulty: 3,
      prompt: t`A weaker sample gives bins of only 2–10 counts in the tail. Why does fitting $\ln(N - B)$ by least squares go wrong there, and what is the remedy?`,
      visual: stat('hist', { dist: 'poisson', lam: 3, n: 300 }, 'Poisson counts with mean 3: lopsided, with zeros, nothing like a Gaussian.'),
      choices: [
        t`Small counts are skewed and can be zero or below $B$, where $\ln(N - B)$ does not exist; least squares on logs is biased. Fit $N_0e^{-\lambda t} + B$ to the counts by Poisson maximum likelihood instead`,
        t`Small counts have too small a $\sqrt N$, so the bars must be doubled`,
        'The half-life changes at low activity, so the tail must be dropped',
        'Nothing goes wrong: least squares is exact for any counts',
      ],
      answer: 0,
      why: {
        1: t`Doubling the bars changes the weights, not the problem: the log of a skewed count is biased whatever bar you draw.`,
        2: 'The half-life is a property of the nucleus; it does not depend on how many nuclei are left.',
        3: t`Least squares assumes Gaussian scatter; at 2–10 counts the Poisson distribution is far from it, and $\ln 0$ does not exist.`,
      },
      hints: ['What is ln(N − B) when a bin happens to hold fewer counts than the background?', 'Which fit uses the Poisson probabilities themselves?'],
      teach: 'At low counts, fit the counts with Poisson likelihood rather than least squares on their logarithms.',
      explain: t`The log transform needs $N - B > 0$ and roughly Gaussian scatter. Below about 10 counts neither holds: dropping the bins that fail biases the result, and the logs of the rest are skewed. Maximizing the Poisson likelihood of the raw counts under $N_0e^{-\lambda t} + B$ uses every bin honestly ([counting statistics](#/lesson/lab.A2.3)).`,
    }),
    num({
      id: 'cp-rtg', difficulty: 3, transfer: true,
      gen(r) {
        const yrs = r.pick([10, 14, 20, 30, 45]), P0 = r.pick([2000, 4400]);
        const T = 87.7;
        const ans = P0 * 2 ** (-yrs / T);
        return {
          prompt: t`A radioisotope power system on a deep-space probe holds plutonium-238 ($T_{1/2} = 87.7$ yr) giving $${P0}$ W of heat at launch. How much heat does the plutonium give $${yrs}$ years later? Answer in W.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 60], y: [0, P0 * 1.05], xlabel: 'years after launch', ylabel: 'heat from Pu-238 (W)', axesAt: 'edge', curves: [{ fn: `${P0}*2^(-x/${T})`, color: 'warn' }] }, caption: 'Decay of the heat source alone; the electrical output falls faster, because the thermocouples degrade too.' },
          answer: ans, units: 'W', tol: { rel: 0.005 },
          errors: [
            { value: P0 * Math.exp(-yrs / T), feedback: t`$e^{-t/T_{1/2}}$ uses the half-life as if it were the mean life. Use $2^{-t/T_{1/2}}$, or $e^{-\lambda t}$ with $\lambda = \ln 2/T_{1/2}$.` },
            { value: P0 * (1 - yrs / (2 * T)), feedback: 'Decay is exponential, not linear in time.' },
          ],
          hints: [t`After time $t$ a fraction $2^{-t/T_{1/2}}$ of the plutonium is left.`, t`Heat is proportional to the activity: $P = P_0\,2^{-t/T_{1/2}}$.`],
          teach: t`Heat from a radioisotope falls as $2^{-t/T_{1/2}}$ — the same law as the counts in your bins.`,
          explain: t`$${P0} \times 2^{-${yrs}/87.7} = ${ans.toFixed(0)}$ W: $${(100 * 2 ** (-yrs / T)).toFixed(1)}\%$ of launch. The Voyagers, launched in 1977, have had to switch instruments off one by one as their power fell.`,
        };
      },
    }),
  ],
  sources: [
    SRC.nudat,
    SRC.os3('10.3', '10-3-radioactive-decay'),
    SRC.taylor('ch. 11 (the Poisson distribution)'),
    { label: 'G. F. Knoll, Radiation Detection and Measurement, 4th ed. (Wiley, 2010), ch. 3–4 (counting statistics, dead time)', url: 'https://www.wiley.com/en-us/Radiation+Detection+and+Measurement%2C+4th+Edition-p-9780470131480' },
  ],
});
