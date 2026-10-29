// Convergence tests for simulations, from the researcher's side: measure the
// observed order on a real resolution study, quote a numerical uncertainty
// for the reported number, check the asymptotic regime, watch for the
// round-off floor, converge in every numerical parameter (not only the
// step), and remember that a converged answer can still differ from a
// formula for physical reasons. The study is this course's own RK4
// integration of the R4.1 Mercury model with λ = 1000 (values in STUDY).
// The derivations live in st-f.F13 and st-b.B13.3; this lesson links them.
import { lesson, mcq, num } from '../../src/core/content.js';
import { SRC } from './_rs.js';

const t = String.raw;
const L10 = Math.log10;

// perihelion advance per orbit (rad) for the R4.1 model with λδ = 2.5499×10⁻⁵,
// e = 0.20563, RK4 with N steps per orbit, perihelia by bisection on r·v
const STUDY = [[125, 0.0005058705073995054], [250, 0.0005022304739112155], [500, 0.0005020014995146996], [1000, 0.0005019871505593925], [2000, 0.0005019862526131742], [4000, 0.000501986196482957]];
const FIRST_ORDER = 0.0005018852393379898;      // 6πλδ/(1 − e²)
const q4 = (v) => +(v * 1e4).toFixed(8);         // the value in units of 10⁻⁴ rad, as printed
const EXA = q4(STUDY[2][1]), EXB = q4(STUDY[3][1]), EXC = q4(STUDY[4][1]);
const EXR = (EXA - EXB) / (EXB - EXC), EXP = Math.log2(EXR);
const sci = (x, n = 3) => x.toExponential(n - 1).replace(/e\+?(-?\d+)/, '\\times10^{$1}');
const DIFFS = STUDY.slice(0, -1).map(([N, v], i) => [N, Math.abs(v - STUDY[i + 1][1])]);

// a log–log picture of |q(N) − q(2N)| against N
const diffPic = (caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [1.9, 3.5], y: [-10.8, -4.5], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'steps per orbit N', ylabel: '|q(N) − q(2N)| (rad)', xticks: 3, yticks: 5,
    points: DIFFS.map(([N, d]) => ({ x: +L10(N).toFixed(4), y: +L10(d).toFixed(4), color: 'accent', r: 5 })),
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'research.R5.2',
  title: 'Convergence tests for simulations',
  minutes: 14, difficulty: 3,
  intro: t`Every number a simulation produces carries a numerical error, and a research result must say how big it is. The tool is a **resolution study**: run at step $h$, $h/2$ and $h/4$, and see how the answer $q$ settles. In the asymptotic regime the differences shrink by $2^{p}$ each time, which gives both the observed order and an estimate of the error left in your best run:

$$p = \log_2\frac{q_h - q_{h/2}}{q_{h/2} - q_{h/4}}, \qquad u_{\text{num}} \approx \frac{|q_{h/2} - q_{h/4}|}{2^{p} - 1}$$

The derivations are in [measuring the order of convergence](#/lesson/st-f.F13.1) and [Richardson extrapolation](#/lesson/st-f.F13.2). Here the questions are a researcher’s: is the observed order the designed one, is the error small enough for the claim, and is the answer converged in **every** numerical choice?`,
  symbols: [
    { tex: 'q_h', text: 'the computed quantity (here, the perihelion advance per orbit) at step size $h$' },
    { tex: 'h', text: 'the resolution: a time step, a grid spacing, or $1/N$ for $N$ steps per orbit' },
    { tex: 'p', text: 'the observed order of convergence: the error falls as $h^{p}$ (RK4 should give 4)' },
    { tex: 'u_{\\text{num}}', text: 'the estimated numerical uncertainty of the finest run, $q_{h/4}$' },
  ],
  why: t`"Converged" is a claim like any other: it needs a test, a number and a stated range — and a reviewer will ask for all three.`,
  visual: {
    ...diffPic('Computed with this course’s RK4 integration of the R4.1 model (λ = 1000): the change in the perihelion advance per orbit when the steps per orbit double. Both axes logarithmic.', {
      sliders: [{ key: 'p', label: t`reference order $p$`, min: 1, max: 6, step: 0.1, value: 2, explain: 'The slope of the reference line: differences falling as N to the power −p.' }],
      curves: [{ fn: `${L10(DIFFS[0][1]).toFixed(4)} - p*(x - ${L10(125).toFixed(4)})`, color: 'gold', dash: [6, 4] }],
    }),
    title: 'A real resolution study',
    lead: t`Each blue dot is how much the computed advance per orbit changed when the number of RK4 steps per orbit doubled. On log–log axes a method of order $p$ makes a straight line of slope $-p$. Set the gold reference line’s slope to match.`,
    tasks: ['Find the slope that runs through all the dots: RK4’s designed order is 4.', 'Each doubling of N cuts the change by about 16 = 2⁴.', 'Read the last dot: at 2000 steps per orbit the answer still moves by about 6 × 10⁻¹¹ rad — compared with an advance of 5 × 10⁻⁴ rad, about one part in ten million.'],
  },
  example: {
    prompt: t`The study gives the advance per orbit (in $10^{-4}$ rad) at $N = 500$, 1000 and 2000 steps per orbit: $${EXA.toFixed(8)}$, $${EXB.toFixed(8)}$, $${EXC.toFixed(8)}$. Find the observed order and the numerical uncertainty of the $N = 2000$ result.`,
    visual: diffPic('The same study: changes on doubling N, log–log.'),
    steps: [
      { label: 'Differences', text: t`$q_{500} - q_{1000} = ${sci(EXA - EXB, 4)}$ and $q_{1000} - q_{2000} = ${sci(EXB - EXC, 4)}$ (in $10^{-4}$ rad).` },
      { label: 'Observed order', text: t`Their ratio is $${EXR.toFixed(2)}$, so $p = \log_2 ${EXR.toFixed(2)} = ${EXP.toFixed(2)}$. RK4’s designed order is 4: the code behaves as designed, and these runs are in the asymptotic regime.` },
      { label: 'Uncertainty', text: t`$u_{\text{num}} \approx ${sci(EXB - EXC)}/(2^4 - 1) = ${sci((EXB - EXC) / 15, 2)}$ in units of $10^{-4}$ rad, that is $${sci((EXB - EXC) / 15 * 1e-4, 2)}$ rad — about one part in $10^{7}$ of the advance.` },
      { label: 'Report', text: t`"The advance per orbit is $${q4(STUDY[4][1]).toFixed(6)}\times10^{-4}$ rad, with a numerical uncertainty of about $${sci((EXB - EXC) / 15 * 1e-4, 1)}$ rad (RK4, $N = 2000$; observed order 4.0 from $N = 500$–$2000$)." Every part of that sentence is checkable.` },
    ],
    answer: t`$p \approx ${EXP.toFixed(1)}$, matching RK4; $u_{\text{num}} \approx ${sci((EXB - EXC) / 15 * 1e-4, 1)}$ rad for the $N = 2000$ result.`,
  },
  practice: [
    num({
      id: 'order', difficulty: 2,
      gen(r) {
        const i = r.pick([0, 1, 2]);
        const [a, b, c] = [STUDY[i], STUDY[i + 1], STUDY[i + 2]].map(([, v]) => q4(v));
        const ans = Math.log2((a - b) / (b - c));
        return {
          prompt: t`From the same study, the advance per orbit (in $10^{-4}$ rad) at $N = ${STUDY[i][0]}$, $${STUDY[i + 1][0]}$ and $${STUDY[i + 2][0]}$ steps per orbit is $${a.toFixed(8)}$, $${b.toFixed(8)}$ and $${c.toFixed(8)}$. What is the observed order of convergence?`,
          visual: diffPic('Changes on doubling N, log–log (RK4, the R4.1 model with λ = 1000).'),
          answer: ans, tol: { rel: 0.01, abs: 0.02 },
          errors: [{ value: (a - b) / (b - c), feedback: t`That is the ratio $2^{p}$; take $\log_2$ of it.` }],
          hints: [t`Differences: $${(a - b).toExponential(4)}$ and $${(b - c).toExponential(4)}$ — form their ratio.`.replace(/e(-?\d+)/g, '\\times10^{$1}'), t`$p = \log_2(\text{ratio}) = \ln(\text{ratio})/\ln 2$.`],
          teach: 'The observed order is the base-2 log of the ratio of successive differences when the step halves.',
          explain: t`Ratio $= ${((a - b) / (b - c)).toFixed(2)}$, so $p = ${ans.toFixed(2)}$: RK4 performing as designed.`,
        };
      },
    }),
    num({
      id: 'unum', difficulty: 3,
      gen(r) {
        const i = r.pick([0, 1, 2]);
        const [b, c] = [STUDY[i + 1], STUDY[i + 2]].map(([, v]) => q4(v));
        const ans = Math.abs(b - c) / 15 * 1e-4;
        return {
          prompt: t`The observed order is 4. The two finest runs give $${b.toFixed(8)}$ and $${c.toFixed(8)}$ (in $10^{-4}$ rad, at $N = ${STUDY[i + 1][0]}$ and $${STUDY[i + 2][0]}$). Estimate the numerical uncertainty of the finer result, in **radians**.`,
          visual: diffPic('The remaining error in the finest run is smaller than the last change, by 2ᵖ − 1.'),
          answer: ans, units: 'rad', tol: { rel: 0.02 },
          errors: [{ value: Math.abs(b - c) * 1e-4, feedback: t`The finer run is closer to the limit than the last change suggests: divide by $2^{p} - 1 = 15$.` }, { value: Math.abs(b - c) / 15, feedback: t`Convert from units of $10^{-4}$ rad to radians.` }],
          hints: [t`$u_{\text{num}} \approx |q_{h/2} - q_{h/4}|/(2^{p} - 1)$.`, t`$|${b.toFixed(8)} - ${c.toFixed(8)}| \times 10^{-4}$ rad, divided by 15.`],
          teach: 'A resolution study gives not just "converged" but a number: the estimated error left in the best run.',
          explain: t`$u_{\text{num}} \approx ${(Math.abs(b - c) * 1e-4).toExponential(3).replace(/e(-?\d+)/, '\\times10^{$1}')}/15 = ${ans.toExponential(2).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad.`,
        };
      },
    }),
    mcq({
      id: 'not-asymptotic', difficulty: 3,
      prompt: t`A different study (constructed) gives successive changes of $3.1\times10^{-3}$, $9.0\times10^{-4}$, $1.1\times10^{-4}$ and $7.0\times10^{-6}$ as the grid is halved four times, for a method of designed order 4. What do you conclude?`,
      visual: { type: 'graph', params: { x: [0.5, 4.5], y: [-5.5, -2], aspect: 'wide', axesAt: 'edge', ylog: true, xlabel: 'refinement level', ylabel: 'change on halving', xticks: 4, yticks: 4, points: [[1, 3.1e-3], [2, 9.0e-4], [3, 1.1e-4], [4, 7.0e-6]].map(([k, d]) => ({ x: k, y: +L10(d).toFixed(4), color: 'accent', r: 5 })) }, caption: 'Constructed study: the change in the answer at each halving of the grid, on a logarithmic axis.' },
      choices: [
        'The coarse grids are not yet in the asymptotic regime; only the finest pair (ratio about 16) can be trusted for an error estimate',
        'The method is broken, since the first ratio is 3.4, not 16',
        'The method is order 2, since the first ratio is near 4',
        'The solution has converged, since the changes are small',
      ],
      answer: 0,
      why: { 1: 'Ratios climbing toward the designed 16 (3.4, 8.2, 15.7) is the classic sign of entering the asymptotic range, not of a bug.', 2: 'The first ratio comes from the coarsest grids, where the error is not yet a single power of h; the later ratios climb past 4.', 3: '"Small" means nothing until compared with the precision the claim needs.' },
      hints: ['Compute each ratio: 3.1/0.9, 9.0/1.1, 1.1/0.07.', 'Are the ratios settling toward 2⁴ = 16?'],
      teach: 'Error estimates from a resolution study are valid only once the observed order has settled near its designed value.',
      explain: t`Ratios 3.4, 8.2 and 15.7: the observed order is still climbing at coarse resolution and only reaches 4 at the finest pair. Use that pair for $u_{\text{num}}$ — and if the claim needs more precision, refine once more to confirm.`,
    }),
    mcq({
      id: 'floor', difficulty: 3,
      prompt: t`Shrinking the step of a double-precision calculation, the error first falls as $h^2$, then **rises** again below about $10^{-5}$ (constructed curve below). Which step should you report results at, and why does the error rise?`,
      visual: { type: 'graph', params: { x: [-8, -1], y: [-12, -2], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'step h', ylabel: 'error', xticks: 7, yticks: 5, curves: [{ fn: 'log10(0.01*(10^x)^2 + 10^(-16)/10^x)', color: 'accent' }] }, caption: 'Constructed: truncation error 0.01h² plus a round-off term 10⁻¹⁶/h, typical of a finite-difference derivative.' },
      choices: [
        'Near the minimum, h ≈ 10⁻⁴·⁷: below it, round-off errors that grow as 1/h dominate truncation',
        'The smallest h possible: smaller steps are always more accurate',
        'Any h, since the error never exceeds 10⁻²',
        'The largest h, since the error is a straight line there',
      ],
      answer: 0,
      why: { 1: 'In floating point, differencing nearly equal numbers loses digits; the loss grows as h shrinks.', 2: 'The claim needs its error known and small, not merely bounded by the plot window.', 3: 'The straight part is where the error is largest.' },
      hints: ['What limits accuracy when two nearly equal numbers are subtracted?', 'Where is the total error smallest?'],
      teach: 'Below some step, round-off error grows as truncation error shrinks: a convergence study must find that floor.',
      explain: t`The total $0.01h^2 + 10^{-16}/h$ is smallest near $h = (5\times10^{-15})^{1/3} \approx 1.7\times10^{-5}$. A study that only refines and never sees the turn-up cannot tell you where the floor is.`,
    }),
    num({
      id: 'mc', difficulty: 2,
      gen(r) {
        const N = r.pick([1000, 4000, 10000]), s = r.pick([0.04, 0.05, 0.08]), target = r.pick([0.01, 0.02]);
        const ans = N * (s / target) ** 2;
        return {
          prompt: t`A Monte Carlo estimate (of, say, a detector’s acceptance) with $N = ${N}$ samples has a statistical uncertainty of $${s}$. How many samples are needed to bring it to $${target}$?`,
          visual: { type: 'graph', params: { x: [2, 6.5], y: [-3, 0], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'samples N', ylabel: 'uncertainty', xticks: 4, yticks: 3, curves: [{ fn: `${L10(s * Math.sqrt(N)).toFixed(4)} - 0.5*x`, color: 'accent' }], points: [{ x: +L10(N).toFixed(4), y: +L10(s).toFixed(4), color: 'gold', r: 5, label: 'now' }], hlines: [{ y: +L10(target).toFixed(4), label: 'target', color: 'ink3' }] }, caption: 'Monte Carlo uncertainty falls as 1/√N: slope −½ on log–log axes.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: N * s / target, feedback: 'The error falls as 1/√N, so N must grow as the square of the improvement.' }],
          hints: ['Monte Carlo error ∝ 1/√N.', t`$N_{\text{new}} = N\,(${s}/${target})^2$.`],
          teach: 'Monte Carlo is a convergence study too, but its order is ½: each extra decimal place costs 100 times the samples.',
          explain: t`$${N} \times (${s}/${target})^2 = ${ans.toLocaleString('en-US').replace(/,/g, '\\,')}$ samples. Check the trend with two sample sizes before trusting it.`,
        };
      },
    }),
    mcq({
      id: 'every-knob', difficulty: 3,
      prompt: 'A numerical-relativity code computes a merger waveform. Halving the grid spacing changes the result by far less than the claimed precision. What else must be shown to be converged before the waveform is quoted?',
      visual: { type: 'gr-chirp', params: { sliders: false, play: false, readout: false }, caption: 'A gravitational-wave chirp (leading-order model). Numerical relativity extracts such waves at a finite distance from the source.' },
      choices: [
        'Every numerical choice: the radius at which the waves are extracted, the size of the computational domain, and the time step if it is chosen separately',
        'Nothing: grid spacing is the only numerical parameter',
        'The colour map of the plots',
        'The number of processors used',
      ],
      answer: 0,
      why: { 1: 'Waves extracted at a finite radius differ from those at infinity by an amount that has nothing to do with grid spacing.', 2: 'Presentation is not numerics.', 3: 'Parallel layout should not change a correct answer (beyond round-off); it is not a convergence parameter.' },
      hints: ['List every number the code needs that would not exist in the exact problem.', 'Is "waves at infinity" what the code actually measures?'],
      teach: 'Converge in every numerical parameter — step, domain size, extraction radius, tolerances — not just the one that is easiest to vary.',
      explain: 'Waveforms are extracted at several finite radii and extrapolated to infinite radius; the outer boundary must be far enough not to reflect. Each is its own convergence study with its own contribution to the numerical uncertainty.',
    }),
    num({
      id: 'choose-n', difficulty: 2,
      gen(r) {
        const p = r.pick([2, 4]), N0 = r.pick([100, 200, 400]), e0 = r.pick([1e-5, 4e-6, 2e-5]), target = r.pick([1e-8, 1e-9]);
        const ans = N0 * (e0 / target) ** (1 / p);
        return {
          prompt: t`A method of order $${p}$ has an error of $${e0.toExponential(0).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad at $N = ${N0}$ steps per orbit. About how many steps per orbit bring the error to $${target.toExponential(0).replace(/e(-?\d+)/, '\\times10^{$1}')}$ rad?`,
          visual: { type: 'graph', params: { x: [1.5, 5.5], y: [-10, -3], aspect: 'wide', axesAt: 'edge', xlog: true, ylog: true, xlabel: 'steps per orbit N', ylabel: 'error (rad)', xticks: 4, yticks: 4, curves: [{ fn: `${L10(e0).toFixed(4)} - ${p}*(x - ${L10(N0).toFixed(4)})`, color: 'accent' }], hlines: [{ y: L10(target), label: 'target', color: 'ink3' }], points: [{ x: +L10(N0).toFixed(4), y: +L10(e0).toFixed(4), color: 'gold', r: 5 }] }, caption: `Error ∝ N⁻ᵖ with p = ${p}, through the measured point.` },
          answer: ans, tol: { rel: 0.02 },
          errors: [{ value: N0 * e0 / target, feedback: t`The error falls as $N^{-p}$: raise the ratio to the power $1/${p}$.` }],
          hints: [t`$N = N_0\,(\varepsilon_0/\varepsilon)^{1/p}$.`, t`The error must fall by $${Math.round(e0 / target)}$.`],
          teach: 'With a measured order, a resolution study tells you what resolution a target precision costs — before you run it.',
          explain: t`$N = ${N0} \times (${Math.round(e0 / target)})^{1/${p}} = ${Math.round(ans)}$ steps per orbit.${p === 2 ? ' A fourth-order method would need far fewer.' : ''}`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.float(1.55, 1.75, 0.01), k = r.float(0.03, 0.06, 0.005), p = r.pick([1.6, 1.8, 2.0, 2.2]);
        const qs = [1, 0.5, 0.25].map((h) => +(C - k * h ** p).toFixed(5));
        const ans = Math.log2((qs[0] - qs[1]) / (qs[1] - qs[2]));
        return {
          prompt: t`A CFD study of a nozzle (constructed) gives thrust coefficients $C_F = ${qs[0].toFixed(5)}$, $${qs[1].toFixed(5)}$ and $${qs[2].toFixed(5)}$ on three grids, each with half the cell size of the last. What is the observed order of convergence?`,
          visual: { type: 'graph', params: { x: [0, 1.1], y: [+(qs[0] - 0.005).toFixed(3), +(qs[2] + 0.01).toFixed(3)], aspect: 'wide', axesAt: 'edge', xlabel: 'relative cell size h', ylabel: 'thrust coefficient', xticks: 4, yticks: 4, points: [1, 0.5, 0.25].map((h, j) => ({ x: h, y: qs[j], color: 'accent', r: 5 })) }, caption: 'Thrust coefficient on three grids; the converged value lies beyond the finest one.' },
          answer: ans, tol: { rel: 0.03, abs: 0.03 },
          errors: [{ value: (qs[0] - qs[1]) / (qs[1] - qs[2]), feedback: t`That is $2^{p}$; take $\log_2$.` }],
          hints: [t`Differences: $${(qs[1] - qs[0]).toFixed(5)}$ and $${(qs[2] - qs[1]).toFixed(5)}$.`, t`$p = \log_2(\text{ratio})$.`],
          teach: 'The same three-grid test works for any simulation: an orbit, a nozzle, a spacetime.',
          explain: t`Ratio $${((qs[0] - qs[1]) / (qs[1] - qs[2])).toFixed(3)}$, $p = ${ans.toFixed(2)}$ — close to second order, typical of CFD schemes. Then $u_{\text{num}} \approx ${(Math.abs(qs[2] - qs[1]) / (2 ** ans - 1)).toFixed(5)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-converged-wrong', difficulty: 3,
      prompt: t`The study converges to $${q4(STUDY[5][1]).toFixed(6)}\times10^{-4}$ rad per orbit with $u_{\text{num}} < 10^{-11}$ rad. The first-order formula $6\pi\lambda\delta/(1 - e^2)$ gives $${q4(FIRST_ORDER).toFixed(6)}\times10^{-4}$ rad — a 0.02% difference, more than ten thousand times $u_{\text{num}}$. Is there a bug?`,
      visual: diffPic('The study is cleanly fourth order: the numerical error is tiny.'),
      choices: [
        t`Not necessarily: the code converges to its model, which keeps terms of second order in $\lambda\delta$ that the formula drops — exactly what the exaggeration study in R4.2 shows`,
        'Yes: a converged code must reproduce the formula',
        'Yes: the convergence study must be wrong',
        'No: 0.02% is too small to matter in any study',
      ],
      answer: 0,
      why: { 1: 'Convergence shows the code solves its own equations; it says nothing about whether a formula approximates them.', 2: 'The observed order 4 and tiny differences are strong evidence the numerics are sound.', 3: 'Whether it matters depends on the claim; here it is a real, explained effect.' },
      hints: ['What does convergence prove — and to what?', 'Is the formula exact for the exaggerated model?'],
      teach: 'Convergence proves the code approaches the exact solution of its model — not of a simpler formula, nor of nature.',
      explain: t`At $\lambda = 1000$, $\lambda\delta = 2.5\times10^{-5}$ and second-order terms add about $2\times10^{-4}$ in relative size; the runs at several $\lambda$ show the excess growing in proportion to $\lambda$. Converged ≠ equal to an approximate formula ≠ validated.`,
    }),
    mcq({
      id: 'cp-report', difficulty: 2,
      prompt: 'Which statement reports a simulated result properly?',
      visual: diffPic('The evidence behind a convergence claim: a measured order and shrinking changes.'),
      choices: [
        'Advance per orbit 5.019862 × 10⁻⁴ rad; numerical uncertainty below 10⁻¹¹ rad from RK4 runs at 500–4000 steps per orbit (observed order 4.0)',
        'Advance per orbit 5.019862 × 10⁻⁴ rad (converged)',
        'Advance per orbit 5.0198619648 × 10⁻⁴ rad',
        'Advance per orbit about 5 × 10⁻⁴ rad, as the code is fourth order',
      ],
      answer: 0,
      why: { 1: '"Converged" with no number and no evidence cannot be checked.', 2: t`Digits are not precision: without $u_{\text{num}}$, a reader cannot tell which digits mean anything.`, 3: 'The order of the method is not a statement about this result’s error.' },
      hints: ['What would a referee need to check the claim?'],
      teach: 'Report a simulated number with its numerical uncertainty and how it was estimated.',
      explain: t`The value, $u_{\text{num}}$, the resolutions used and the observed order: a reader can judge the claim and reproduce the study.`,
    }),
  ],
  sources: [SRC.roache, SRC.oberkampf],
});
