// The chaotic pendulum — the lab view of deterministic chaos: Taylor's
// driven damped pendulum, recorded for a long time by an angle encoder; pairs
// of moments when the state nearly repeats (near-returns) are followed
// forward, and the average of ln|Δφ| grows as a straight line whose slope is
// the largest Lyapunov exponent. The analysis: choosing the fit window (not
// the saturated tail), the encoder's floor as a systematic, correlated points,
// and the comparison with the model's own long-run exponent (Benettin's
// method) — there is no CODATA value for chaos. The predictability horizon,
// and the solar system's Lyapunov time as the transfer. Every number is
// computed from the seeded model the labg-classics simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, r6, SIMNOTE, SRC } from './_classic.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.chaos.defaults;
const LAM = M.chaosLambda(P0.gamma);           // the model's long-run exponent, s⁻¹

// the worked example: near-return set 12
const EX = M.run('chaos', { seed: 12, params: { ens: 12 } });
const EXr = EX.R.slice(0, 11);
const EXl = EX.results[0];
const nFit = EX.d.x.length;
const lastFit = EX.d.x[nFit - 1];
const EXz = (EXl.value - LAM) / EXl.sigma;
const runC = (seed, flags = {}, axes = null) => M.run('chaos', { seed, params: { ens: seed }, flags, axes });

export default lesson({
  id: 'lab.E.18',
  title: 'The chaotic pendulum',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`A pendulum driven hard enough by a periodic torque never settles into a repeating swing: two releases that differ by a hair end up doing completely different things. Nothing random is involved — the equation $\ddot\phi + 2\beta\dot\phi + \omega_0^2\sin\phi = \gamma\omega_0^2\cos\omega t$ fixes the future exactly — but a tiny difference grows **exponentially**, on average, at a rate called the Lyapunov exponent. To measure it, record the pendulum for a long time, find moments when its state nearly repeats, follow each pair forward, and plot the average of $\ln|\Delta\phi|$ against time: the growth is a straight line whose slope is $\lambda$.`,
  equation: t`\bigl\langle \ln|\Delta\phi(t)| \bigr\rangle \approx \ln|\Delta\phi_0| + \lambda t`,
  symbols: [
    { tex: '\\Delta\\phi(t)', text: 'the difference in angle between the two runs of a pair, a time $t$ after their near-return, in rad' },
    { tex: '\\Delta\\phi_0', text: 'the separation at the near-return, here $2\\times10^{-4}$ rad' },
    { tex: '\\lambda', text: 'the largest Lyapunov exponent, in $\\text{s}^{-1}$: the average rate at which $\\ln|\\Delta\\phi|$ grows; $1/\\lambda$ is the Lyapunov time' },
    { tex: '\\langle\\ \\rangle', text: 'the average over pairs (20 here): one pair’s growth is jerky, the average is a line' },
    { tex: '\\phi,\\ \\omega_0,\\ \\beta', text: 'the pendulum’s angle, its natural angular frequency ($3\\pi$ rad/s) and its damping rate ($\\omega_0/4$), in the equation of motion' },
    { tex: '\\gamma,\\ \\omega', text: 'the drive strength (the drive torque as a fraction of gravity’s largest torque; 1.105 here) and the drive’s angular frequency ($2\\pi$ rad/s: one push per second)' },
  ],
  why: t`Every forecast — of weather, of an asteroid’s path, of a plasma in a fusion machine — runs into $\lambda$: it sets how far ahead an imperfectly known state can be predicted at all.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: near-returns pulled apart',
    lead: t`The upper panel shows $\ln|\Delta\phi|$ for each of the 20 pairs: jagged, each different. Below, their average at every whole drive period, with ±1σ bars (the scatter of the pairs over $\sqrt{20}$), and the weighted line through the growth — from 1 s until the average reaches $\ln|\Delta\phi| = -3.5$, before the separations start to saturate. The readout turns the slope into $\lambda$ and compares it with the model’s long-run value.`,
    tasks: [
      'Switch Plot to “fit the whole record”: the flat tail, where the two runs are already as far apart as the motion allows, drags the slope down far beyond its uncertainty.',
      'Switch on the coarse encoder: the first few separations are now below one count, so they read as encoder noise; the start of the curve lifts and λ drops.',
      'Clear the table and press Record the next point a few times: each new point is one more drive period of the same 20 pairs.',
    ],
    params: { exp: 'chaos', seed: 2, params: { ens: 2 } },
    caption: t`Simulated: Taylor’s pendulum ($\omega = 2\pi$ rad/s, $\omega_0 = 1.5\omega$, $\beta = \omega_0/4$, $\gamma = 1.105$) integrated exactly enough (RK4, 200 steps per drive period); each pair starts $2\times10^{-4}$ rad apart in angle only; the encoder reads 16 384 counts per turn, its quantization treated as Gaussian noise. The comparison value is the model’s own long-run exponent, not a measured constant. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Twenty near-return pairs, each starting $\Delta\phi_0 = 2\times10^{-4}$ rad apart, are followed for 16 drive periods. The average of $\ln|\Delta\phi|$ at each whole period (σ is the standard error over the pairs):

${colTable([[t`t\ (\text{s})`, ...EXr.map((q) => String(q.t))], [t`\langle\ln|\Delta\phi|\rangle`, ...EXr.map((q) => q.y.toFixed(2))], [t`\sigma`, ...EXr.map((q) => q.sy.toFixed(2))]])}

Find $\lambda$ with its uncertainty and compare it with the model’s long-run value, $${LAM.toFixed(3)}\ \text{s}^{-1}$.`,
    visual: rigPlot('chaos', { seed: 12, params: { ens: 12 } }, t`The averaged separations in the fit window with ±1σ bars, the weighted line (gold) and the residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Why a log', text: t`If $|\Delta\phi| \approx |\Delta\phi_0|e^{\lambda t}$, then $\ln|\Delta\phi| = \ln|\Delta\phi_0| + \lambda t$: a straight line in $t$ with slope $\lambda$. Averaging the *logarithms* over pairs (not the separations themselves) is what defines $\lambda$ — one pair that happens to stretch fast would otherwise dominate.` },
      { label: 'Choose the window', text: t`Skip $t = 0$: for the first period the separation is still turning toward the direction that stretches fastest (the average barely moves, or even dips). Stop when the average passes $-3.5$ ($|\Delta\phi| \approx 0.03$ rad): by then some pairs are a large fraction of a radian apart and have stopped growing exponentially. Here that keeps $t = 1$ to $${lastFit}$ s: ${nFit} points.` },
      { label: 'Fit', text: t`The weighted line gives slope $${pmT(EX.fit.b, EX.fit.sb)}\ \text{s}^{-1}$ and intercept $${pmT(EX.fit.a, EX.fit.sa)}$, with $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for $\nu = ${EX.fit.dof}$.` },
      { label: 'Read the slope', text: t`So $\lambda = ${pmT(EXl.value, EXl.sigma)}\ \text{s}^{-1}$: separations grow by a factor $e$ every $1/\lambda = ${(1 / EXl.value).toFixed(2)}$ s, and double every $\ln 2/\lambda = ${(Math.LN2 / EXl.value).toFixed(2)}$ s.` },
      { label: 'Compare', text: t`There is no CODATA value for chaos. The reference is the model’s own long-run exponent, computed by carrying a tiny separation along trajectories for 100 000 drive periods in all and renormalizing it every period (Benettin’s method): $${LAM.toFixed(3)}\ \text{s}^{-1}$. Then $z = (${EXl.value.toFixed(3)} - ${LAM.toFixed(3)})/${EXl.sigma.toFixed(3)} = ${EXz.toFixed(2)}$: consistent.` },
      { label: 'Be honest', text: t`Two caveats belong in the report. The points are not independent — each is the same 20 pairs one period later — so $\chi^2$ and the slope’s σ are only rough. And a window of ${nFit} s measures a *finite-time* exponent, which over many sets of pairs averages about 12% below the long-run value in this model (about 1.5σ): the early growth is slower than the long-run average. Quote it as a finite-time exponent for this window. A real apparatus adds Coulomb friction and drive jitter, which a model of the pendulum would have to include.` },
    ],
    answer: t`$\lambda = ${pmT(EXl.value, EXl.sigma)}\ \text{s}^{-1}$ from ${nFit} points, $${Math.abs(EXz).toFixed(1)}\sigma$ from the model’s long-run $${LAM.toFixed(3)}\ \text{s}^{-1}$; a doubling time of about $${(Math.LN2 / EXl.value).toFixed(1)}$ s.`,
  },
  practice: [
    mcq({
      id: 'meaning', difficulty: 1,
      prompt: t`The average of $\ln|\Delta\phi|$ for many near-return pairs rises along a straight line of slope $0.7\ \text{s}^{-1}$. What does that say about the pendulum?`,
      visual: rigRaw('chaos', { seed: 4, params: { ens: 4 } }, t`$\ln|\Delta\phi|$ for each of 20 pairs (simulated). The dashed line is where the fit stops.`),
      choices: [
        t`Two nearly equal states drift apart by a factor of about $e^{0.7} \approx 2$ every second, on average`,
        'The pendulum’s swing grows exponentially until it goes over the top',
        'The drive adds random noise, which makes the two runs differ more and more',
        t`The separation grows by $0.7$ rad every second`,
      ],
      answer: 0,
      why: {
        1: t`$\Delta\phi$ is the difference between two runs, not the angle of either. The swing itself stays bounded.`,
        2: 'Nothing random is in the equation. The growth comes from the dynamics stretching nearby states apart: deterministic chaos.',
        3: t`The *logarithm* grows linearly, so the separation itself grows exponentially: a constant factor per second, not a constant amount.`,
      },
      hints: [t`What is on the vertical axis — $\Delta\phi$ or $\ln|\Delta\phi|$?`],
      teach: t`A straight line in $\ln|\Delta\phi|$ means exponential growth of the separation: a fixed factor $e^{\lambda}$ per second.`,
      explain: t`$\ln|\Delta\phi_2| - \ln|\Delta\phi_1| = \lambda(t_2 - t_1)$, so over one second the separation is multiplied by $e^{0.7} = 2.01$. Even a perfect, noise-free pendulum does this: the equation itself pulls nearby states apart.`,
    }),
    num({
      id: 'two-point', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 400), A = runC(seed);
        const i = r.int(1, 2), j = Math.min(A.R.length - 1, i + r.int(4, 6));
        const q1 = A.R[i], q2 = A.R[j];
        const ans = (q2.y - q1.y) / (q2.t - q1.t);
        return {
          prompt: t`From a run’s averaged separations: at $t = ${q1.t}$ s, $\langle\ln|\Delta\phi|\rangle = ${q1.y.toFixed(2)}$; at $t = ${q2.t}$ s, it is $${q2.y.toFixed(2)}$. Estimate $\lambda$ from these two points. Answer in $\text{s}^{-1}$.`,
          visual: rigPlot('chaos', { seed, params: { ens: seed }, axes: 'all', fit: false, residuals: false }, t`The whole record of averaged separations (no fit drawn). ${SIMNOTE}`),
          answer: ans, units: 's^-1', tol: { rel: 0.01, abs: 0.005 },
          errors: [
            { value: (Math.exp(q2.y) - Math.exp(q1.y)) / (q2.t - q1.t), feedback: t`That is the change in $|\Delta\phi|$ per second. $\lambda$ is the slope of the *logarithm*.` },
            { value: (q2.y - q1.y) / (q2.t - q1.t) / Math.LN10, feedback: t`These are natural logarithms already: no conversion from base 10 is needed.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.03 * Math.abs(ans)),
          hints: [t`$\lambda$ is the slope: rise over run on the $\ln|\Delta\phi|$ against $t$ plot.`],
          teach: t`$\lambda$ is the slope of $\langle\ln|\Delta\phi|\rangle$ against $t$ over the growth.`,
          explain: t`$\lambda \approx (${q2.y.toFixed(2)} - (${q1.y.toFixed(2)}))/(${q2.t} - ${q1.t}) = ${ans.toFixed(3)}\ \text{s}^{-1}$. A fit of every point in the window does better than two points: it uses all the data and returns an uncertainty.`,
        };
      },
    }),
    num({
      id: 'horizon', difficulty: 2,
      gen(r) {
        const k = r.int(3, 6), tol = r.pick([0.1, 0.3, 1]);
        const d0 = 10 ** -k;
        const lam = +LAM.toFixed(2);
        const ans = Math.log(tol / d0) / lam;
        return {
          prompt: t`For this pendulum $\lambda = ${lam}\ \text{s}^{-1}$. You know the starting angle to $10^{-${k}}$ rad (and the speed perfectly). Roughly how long can you predict the angle to within $${tol}$ rad? Answer in s.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 25], y: [-14.5, 1], xlabel: 't (s)', ylabel: 'ln|Δφ|', axesAt: 'edge', curves: [{ fn: `${r6(Math.log(d0))} + ${lam}*x`, color: 'accent', domain: [0, r6(Math.max(1, (1 - Math.log(d0)) / lam))] }], points: [{ x: 0, y: r6(Math.log(d0)), color: 'gold', label: `start: 10⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]} rad` }] }, caption: 'The average growth ln|Δφ₀| + λt from this start, idealized as an exact exponential with no saturation.' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: Math.log10(tol / d0) / lam, feedback: t`Use the natural log: $|\Delta\phi| = |\Delta\phi_0|e^{\lambda t}$, so $t = \ln(\text{tolerance}/\Delta\phi_0)/\lambda$.` },
            { value: tol / d0 / lam, feedback: 'The growth is exponential: take the logarithm of the ratio.' },
          ],
          hints: [t`Set $|\Delta\phi_0|e^{\lambda t}$ equal to the tolerance.`, t`$t = \ln(\text{tolerance}/|\Delta\phi_0|)/\lambda$.`],
          teach: t`The predictability horizon is $\ln(\text{tolerance}/\text{initial error})/\lambda$: it grows only logarithmically with precision.`,
          explain: t`$t = \ln(${tol}/10^{-${k}})/${lam} = ${tex(Math.log(tol / d0), 3)}/${lam} = ${ans.toFixed(1)}$ s. A thousand times better start buys only $\ln 1000/\lambda = ${(Math.log(1000) / lam).toFixed(1)}$ s more.`,
        };
      },
    }),
    num({
      id: 'improve', difficulty: 2,
      gen(r) {
        const lam = +LAM.toFixed(2), dt = r.pick([3, 5, 8, 10]);
        const ans = Math.exp(lam * dt);
        return {
          prompt: t`With $\lambda = ${lam}\ \text{s}^{-1}$, by what factor must the initial error shrink to predict the motion $${dt}$ s further ahead to the same tolerance?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 20], y: [-14, 1], xlabel: 't (s)', ylabel: 'ln|Δφ|', axesAt: 'edge', hlines: [{ y: -1, color: 'warn', label: 'tolerance' }], curves: [{ fn: `-8 + ${lam}*x`, color: 'accent', label: 'today’s start', labelAt: 3, labelDy: -8 }, { fn: `-8 - ${r6(lam * dt)} + ${lam}*x`, color: 'violet', label: 'a better start', labelAt: 14, labelDy: 16 }] }, caption: 'Two starts on parallel lines of slope λ: the better one reaches the tolerance later. Idealized exponential growth.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: lam * dt, feedback: t`That is the change in $\ln|\Delta\phi_0|$. The factor itself is $e^{\lambda\Delta t}$.` },
            { value: 10 ** (lam * dt), feedback: t`Use $e$, not 10: the logarithm in $\ln|\Delta\phi|$ is natural.` },
          ],
          hints: [t`The horizon is $\ln(\text{tol}/\Delta\phi_0)/\lambda$. Gaining $\Delta t$ means lowering $\ln\Delta\phi_0$ by $\lambda\Delta t$.`],
          teach: t`Each extra second of prediction costs a factor $e^{\lambda}$ in initial precision.`,
          explain: t`$\ln\Delta\phi_0$ must drop by $\lambda\Delta t = ${(lam * dt).toFixed(2)}$, a factor $e^{${(lam * dt).toFixed(2)}} = ${tex(ans, 3)}$. This is why weather forecasts improve only slowly as measurements improve.`,
        };
      },
    }),
    mcq({
      id: 'window', difficulty: 2,
      prompt: t`Fitting the whole 16 s record gives $\lambda$ well below the long-run value. Why must the fit stop before the curve flattens?`,
      visual: rigPlot('chaos', { seed: 5, params: { ens: 5 }, axes: 'all' }, t`The whole record fitted with one line (gold), and its residuals: arched, the sign of the wrong model. ${SIMNOTE}`),
      choices: [
        'Two runs cannot get further apart than the motion itself allows (about a radian here), so the late flattening says nothing about λ',
        'The late points have bigger error bars, so they should be left out',
        'The encoder drifts over 16 s, so late readings are less accurate',
        'Leaving points out makes χ² smaller, which is always better',
      ],
      answer: 0,
      why: {
        1: 'They do not: the late averages scatter less, because every pair has saturated at a similar size. Small error bars are exactly why they pull so hard on the fit.',
        2: 'Nothing in the experiment drifts. The flattening is the physics of a bounded motion, the same for a perfect encoder.',
        3: 'Dropping data to lower χ² is how results are faked. The reason here is that the model ln|Δφ₀| + λt does not describe the tail.',
      },
      hints: [t`What is the largest possible $|\Delta\phi|$ between two runs that each swing within a bounded range?`],
      teach: 'Fit a model only where it applies: exponential growth stops when the separation reaches the size of the attractor.',
      explain: t`Exponential growth is a statement about *small* separations. Once $|\Delta\phi|$ is comparable to the swing, the two runs are simply unrelated and the separation stops growing. The arched residuals of the whole-record fit show the model failing; the growth window (1 s to $\ln|\Delta\phi| = -3.5$) avoids it.`,
    }),
    mcq({
      id: 'coarse', difficulty: 3,
      prompt: t`The same record is taken with a coarse encoder (1000 counts per turn: 0.36° per count, about $6\times10^{-3}$ rad). What happens to the first few averaged points, and to the fitted $\lambda$?`,
      visual: rigPlot('chaos', { seed: 6, params: { ens: 6 }, flags: { coarse: true }, expected: false }, t`The record read with the coarse encoder, fitted in the usual window. ${SIMNOTE}`),
      choices: [
        t`They read high — the encoder cannot resolve $2\times10^{-4}$ rad, so they show its noise instead — and the line through them is too shallow: $\lambda$ comes out low`,
        t`They read low, because small separations round down to zero counts, and $\lambda$ comes out high`,
        'Nothing changes on average: a coarse encoder only adds random scatter, which the fit averages away',
        t`The intercept changes but the slope is protected, as with a constant offset`,
      ],
      answer: 0,
      why: {
        1: t`Rounding to zero would give $\ln 0$; with noise added, the reading is the size of the noise, about $10^{-3}$ rad — far above $2\times10^{-4}$, not below it.`,
        2: t`Noise on $\Delta\phi$ becomes a *bias* in $\ln|\Delta\phi|$ when the noise is bigger than $\Delta\phi$: $|\Delta\phi + \text{noise}|$ is about the noise, whatever $\Delta\phi$ is.`,
        3: 'An offset that is the same at every time would only move the intercept. This one lifts the early points and leaves the late ones, so it tilts the line.',
      },
      hints: ['Compare the separation at the start with the size of one encoder count.', t`If $\Delta\phi$ is much smaller than the noise, what is $|\Delta\phi + \text{noise}|$ about equal to?`],
      teach: 'A measurement floor turns into a bias on a logarithmic plot: everything below the floor reads as the floor.',
      explain: t`At the start, $|\Delta\phi + \text{noise}|$ is about the encoder noise (a few $\times10^{-3}$ rad), so the first points sit near $\ln(10^{-3}) \approx -6$ instead of $-8.5$. The later points, well above the floor, are unchanged, so the line through all of them is too shallow. The cure is a better encoder or a window that starts where $\Delta\phi$ is above the floor.`,
    }),
    mcq({
      id: 'sign', difficulty: 2,
      prompt: t`At a weaker drive, $\gamma = 1.073$, the Poincaré section (the state once per drive period) settles onto two points that it visits in turn. What sign does $\lambda$ have there?`,
      visual: { type: 'cm5-pendulum', params: { gamma: 1.073, panels: ['phase'], controls: [], readout: false, play: false, keep: 40, skip: 60, periods: 4 }, caption: t`The motion at $\gamma = 1.073$ in state space (angle against angular speed), after the transient has died away, with one dot per drive period.` },
      choices: [
        t`Negative: nearby starts are drawn onto the same period-2 cycle, so separations shrink`,
        t`Positive: two points mean the pendulum jumps between them unpredictably`,
        t`Zero: a periodic motion neither grows nor shrinks separations`,
        t`It has no sign: $\lambda$ is only defined for chaotic motion`,
      ],
      answer: 0,
      why: {
        1: 'It alternates between them in a fixed order — period 2, perfectly predictable.',
        2: 'With damping, a stable cycle attracts its neighbours: a separation across the cycle dies away. Zero belongs to a perturbation along the motion of an undriven system, not to this.',
        3: 'λ is defined for any motion; it is negative for a stable cycle, positive for chaos.',
      },
      hints: ['A damped, driven pendulum forgets its starting state when it settles onto a cycle.'],
      teach: t`$\lambda < 0$: a stable periodic attractor pulls neighbours together; $\lambda > 0$: chaos pulls them apart.`,
      explain: t`The model gives $\lambda = ${M.chaosLambda(1.073).toFixed(2)}\ \text{s}^{-1}$ at $\gamma = 1.073$: separations shrink by $e$ in under half a second. Past about $\gamma = 1.083$ the period doublings pile up and $\lambda$ turns positive ([the road to chaos](#/explore/chaotic-pendulum)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 400), A = runC(seed);
        const l = +A.results[0].value.toFixed(3), s = +A.results[0].sigma.toFixed(3);
        const ans = (l - LAM) / s;
        return {
          prompt: t`A fit gives $\lambda = ${l.toFixed(3)} \pm ${s.toFixed(3)}\ \text{s}^{-1}$. The model’s long-run exponent is $${LAM.toFixed(3)}\ \text{s}^{-1}$ (its own uncertainty negligible). Give $z$, with its sign.`,
          visual: rigPlot('chaos', { seed, params: { ens: seed } }, t`The run behind this fit: averaged separations in the window, the line and its residuals. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (100 * (l - LAM)) / LAM, feedback: 'That is the percentage difference; agreement is judged in units of σ.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract the reference from the measurement.', t`$z = (\lambda - \lambda_\text{ref})/\sigma_\lambda$.`],
          teach: t`Compare with a reference in units of the uncertainty: $z = \Delta/\sigma$.`,
          explain: t`$z = (${l.toFixed(3)} - ${LAM.toFixed(3)})/${s.toFixed(3)} = ${ans.toFixed(2)}$. ${Math.abs(ans) < 2 ? 'Within 2σ — though a finite window tends to read about 12% low, and the correlated points make σ itself rough.' : 'Beyond 2σ: before blaming chaos, check the fit window and the encoder floor.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-correlated', difficulty: 3,
      prompt: t`Over many runs, fits of this kind give $\chi^2/\nu$ around 0.8 on average, not 1. Which explanation fits best?`,
      visual: rigRaw('chaos', { seed: 9, params: { ens: 9 } }, 'The 20 pairs behind every averaged point: each point is the same pairs one drive period later.'),
      choices: [
        'Successive points are made from the same pairs, so their errors are correlated; the χ² formula assumes independent points, and neither χ² nor the slope’s σ can be taken at face value',
        'The error bars are exactly twice too large, so they should be halved',
        'Chaotic data never follow any model, so χ² means nothing at all here',
        'The pendulum’s damping makes the late points too precise',
      ],
      answer: 0,
      why: {
        1: 'Nothing says “exactly twice”; the issue is that the points are not independent, which no single rescaling fixes.',
        2: 'The average growth does follow a straight line in the window. The test is fine; its assumption of independent points is what fails.',
        3: 'Damping is part of the dynamics in every point alike; it does not make points correlated.',
      },
      hints: ['How are the averaged points at t = 3 s and t = 4 s made?', 'What does the χ² test assume about the scatter of different points?'],
      teach: 'χ² and the fitted σ assume independent errors; points built from the same samples are correlated.',
      explain: t`Each pair contributes to every point, and a pair that is ahead at $t = 3$ s tends to be ahead at $t = 4$ s too. Correlated points violate the fit’s assumptions ([covariance and correlated errors](#/lesson/lab.A6.3)). The honest fix is to estimate the spread of $\lambda$ by resampling the pairs (a bootstrap) or by fitting each pair and averaging the slopes.`,
    }),
    num({
      id: 'cp-solar', difficulty: 3, transfer: true,
      gen(r) {
        const tl = 5, e0 = r.pick([1, 10, 100]), tolKm = r.pick([1.5e8, 1.5e7]);
        const ans = tl * Math.log(tolKm / (e0 / 1000));
        return {
          prompt: t`Numerical integrations of the planets find the inner solar system chaotic, with a Lyapunov time $1/\lambda$ of about $${tl}$ million years. If Earth’s position today were uncertain by only $${e0}$ m, after roughly how long would the uncertainty grow to $${tex(tolKm, 2)}$ km${tolKm > 1e8 ? ' (one astronomical unit)' : ''}? Answer in millions of years (Myr).`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 200], y: [-9, 21], xlabel: 'time ahead (Myr)', ylabel: 'ln(error in km)', axesAt: 'edge', curves: [{ fn: `${r6(Math.log(e0 / 1000))} + x/${tl}`, color: 'accent' }], points: [{ x: 0, y: r6(Math.log(e0 / 1000)), color: 'gold', label: `today: ${e0} m` }] }, caption: 'Idealized exponential growth at one e-fold per Lyapunov time; the real growth is irregular and saturates.' },
          answer: ans, units: 'Myr', tol: { rel: 0.02 },
          errors: [
            { value: tl * Math.log10(tolKm / (e0 / 1000)), feedback: t`The Lyapunov time is an $e$-folding time: use the natural log.` },
            { value: tl * Math.log(tolKm / e0), feedback: 'Put both lengths in the same unit before taking the ratio.' },
          ],
          hints: [t`The error grows as $\delta_0 e^{t/t_L}$ with $t_L$ the Lyapunov time.`, t`$t = t_L \ln(\delta/\delta_0)$, with $\delta$ and $\delta_0$ in the same unit.`],
          teach: t`Lyapunov growth makes the horizon $t_L\ln(\delta/\delta_0)$: precision buys time only logarithmically.`,
          explain: t`$t = ${tl}\ \text{Myr} \times \ln\bigl(${tex(tolKm, 2)}\ \text{km}/${tex(e0 / 1000, 2)}\ \text{km}\bigr) = ${ans.toFixed(0)}$ Myr. That is why Earth’s orbit cannot be computed reliably beyond about 100 million years — the same limit, on a vastly longer clock, that you measured on the bench.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 12: nonlinear mechanics and chaos', url: 'https://uscibooks.aip.org/books/classical-mechanics/' },
    { label: 'G. Benettin, L. Galgani, A. Giorgilli & J.-M. Strelcyn, Lyapunov characteristic exponents for smooth dynamical systems, Meccanica 15, 9 (1980)', url: 'https://doi.org/10.1007/BF02128236' },
    { label: 'M. T. Rosenstein, J. J. Collins & C. J. De Luca, A practical method for calculating largest Lyapunov exponents from small data sets, Physica D 65, 117 (1993)', url: 'https://doi.org/10.1016/0167-2789(93)90009-P' },
    { label: 'J. Laskar, A numerical experiment on the chaotic behaviour of the Solar System, Nature 338, 237 (1989)', url: 'https://doi.org/10.1038/338237a0' },
  ],
});
