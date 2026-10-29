// Choosing what to vary — experimental design before any data: which
// variable to turn (the one the model is linear in, the one you can set
// accurately), its range and spacing (leverage for a slope, middle points to
// test for curvature — a trade-off drawn in the Explore), where to sample a
// decay (t = τ for constant noise, 2τ for counts; a two-point design against
// an even spread that survives a wrong guess), how many points (σ falls as
// 1/√N), and in what order (randomize so a drift becomes scatter, not
// slope). A pilot run and an uncertainty budget before the real run. A
// solid-propellant burn-rate campaign as the transfer.
// Every number is computed here (Fisher information of the model's
// parameters, written out in the code exercise).
import { lesson, mcq, multi, num, order, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { r6, SIMNOTE } from './_labf.js';

const t = String.raw;

// σ of (V0, τ) for V = V0 e^(−t/τ), constant σ, from the Fisher information JᵀJ/σ²
function fisher(ts, V0, tau, s) {
  let a = 0, b = 0, c = 0;
  for (const tt of ts) { const e = Math.exp(-tt / tau), j1 = e, j2 = (V0 * tt / tau ** 2) * e; a += (j1 * j1) / s ** 2; b += (j1 * j2) / s ** 2; c += (j2 * j2) / s ** 2; }
  const det = a * c - b * b;
  return { sV: Math.sqrt(c / det), sT: Math.sqrt(a / det) };
}
const EV = Array.from({ length: 10 }, (_, i) => +(i * 50 / 9).toFixed(3));
const SHORT = Array.from({ length: 10 }, (_, i) => +(i * 10 / 9).toFixed(3));
const BEST = (() => { let b = [1e9, 0]; for (let ts = 1; ts <= 50; ts += 0.01) { const r = fisher([0, 0, 0, 0, 0, ts, ts, ts, ts, ts], 5, 10, 0.02); if (r.sT < b[0]) b = [r.sT, ts]; } return { s: b[0], t: +b[1].toFixed(2) }; })();
const TWO = (tt) => [0, 0, 0, 0, 0, tt, tt, tt, tt, tt];
const DA = fisher(EV, 5, 10, 0.02), DB = fisher(SHORT, 5, 10, 0.02), DC = fisher(TWO(BEST.t), 5, 10, 0.02);
const DCw = fisher(TWO(BEST.t), 5, 20, 0.02), DAw = fisher(EV, 5, 20, 0.02);

const decayPic = (ts, caption, tau = 10) => ({ type: 'graph', params: { aspect: 'wide', x: [-2, 55], y: [0, 5.6], xlabel: 't (s)', ylabel: 'V (V)', axesAt: 'edge', curves: [{ fn: `5*exp(-x/${tau})`, color: 'ink3', width: 1.6 }], points: ts.map((x, i) => ({ x, y: r6(5 * Math.exp(-x / tau) + (ts.filter((u) => u === x).length > 1 ? 0.16 * (ts.slice(0, i).filter((u) => u === x).length - 2) : 0)), r: 4, color: 'accent' })) }, caption });

export default lesson({
  id: 'lab.A10.1',
  title: 'Choosing what to vary',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`An experiment is designed before it is run. You choose the **variable you turn** (one you can set accurately, chosen so the model is simple in it), its **range and spacing**, **how many** readings, and **in what order** — and you decide what to hold fixed. The uncertainty of a fitted slope shows what is at stake:

$$\sigma_b = \frac{\sigma}{\sqrt{\sum_i (x_i - \bar x)^2}} = \frac{\sigma}{\sqrt N\,s_x}$$

Spread the settings wide and the slope tightens; take more and it tightens as $1/\sqrt N$. But points at the ends alone cannot show that a line is the wrong model, and settings taken in order let any drift masquerade as signal. Design is a set of trade-offs, made deliberately, ideally after a **pilot run**.`,
  symbols: [
    { tex: '\\sigma_b', text: 'the standard uncertainty of the fitted slope' },
    { tex: '\\sigma', text: 'the standard uncertainty of one reading, assumed the same for all' },
    { tex: 'x_i,\\ \\bar x', text: 'the settings you choose and their mean' },
    { tex: 'N', text: 'the number of readings' },
    { tex: 's_x', text: 'the rms spread of the settings about their mean, $\\sqrt{\\sum(x_i - \\bar x)^2/N}$' },
  ],
  why: t`Beam time, test-stand firings and telescope nights are expensive; a design that wastes half its readings, or hides a drift inside the slope, wastes the run.`,
  visual: {
    type: 'graph',
    title: 'Leverage against a test for curvature',
    lead: t`Twelve readings in $-1 \le x \le 1$: $m$ of them at the middle, the rest split between the two ends. The blue curve is the slope’s uncertainty $\sigma_b$, the violet one the uncertainty of a curvature term $c$ in $y = a + bx + cx^2$, both in units of one reading’s $\sigma$, against $m$.`,
    tasks: [
      t`At m = 0, the slope is as good as it can be ($\sigma_b = \sigma/\sqrt{12}$) but curvature cannot be measured at all: the violet curve runs off the top.`,
      t`At m = 4, $\sigma_b$ has grown by only 22 %, and curvature is measured almost as well as it ever can be.`,
      'Push m to 10: the slope degrades fast. The best curvature test is at m = 6, half in the middle — but most real designs keep two or three middle points and the rest at the ends.',
    ],
    params: {
      aspect: 'wide', x: [0, 12], y: [0, 1.6], xlabel: 'readings in the middle, m (of 12)', ylabel: 'uncertainty (units of σ)', axesAt: 'edge',
      sliders: [{ key: 'm', label: 'Readings in the middle $m$', min: 0, max: 11, step: 1, value: 3, unit: '', explain: 'How many of the 12 readings sit at x = 0; the rest are shared equally between x = −1 and x = +1.' }],
      curves: [
        { fn: '1/sqrt(12 - x)', color: 'accent', domain: [0, 11.5], label: 'σ of slope', labelAt: 7.5, labelDy: 16 },
        { fn: '1/sqrt((12 - x)*x/12)', color: 'violet', domain: [0.2, 11.8], label: 'σ of curvature', labelAt: 1.6, labelDy: -6, labelDx: 10 },
      ],
      vlines: [{ x: 'm', color: 'gold' }],
      readouts: [
        { label: '$\\sigma_b/\\sigma$', expr: '1/sqrt(12 - m)', digits: 3 },
        { label: '$\\sigma_c/\\sigma$', expr: '1/sqrt(max(0.0001, (12 - m)*m/12))', digits: 3 },
      ],
    },
    caption: t`Exact results for least squares with equal, independent errors: with $p = (12 - m)/12$ of the readings at the ends, $\sigma_b = \sigma/\sqrt{12 - m}$ and $\sigma_c = \sigma/\sqrt{12\,p(1 - p)}$. Real errors are rarely so tidy; the trade-off is the point.`,
  },
  example: {
    prompt: t`You will record 10 readings of a decaying voltage $V = V_0e^{-t/\tau}$, each with $\sigma = 0.020$ V; a pilot run suggests $V_0 \approx 5$ V and $\tau \approx 10$ s. Compare three plans for measuring $\tau$: (A) evenly from 0 to 50 s; (B) evenly from 0 to 10 s; (C) five readings at $t = 0$ and five at the single best later time.`,
    visual: decayPic(TWO(BEST.t), t`Plan C: five readings at $t = 0$ and five at $t = ${BEST.t}$ s, on the expected curve (stacked dots are repeats).`),
    steps: [
      { label: 'The tool', text: t`For fitted parameters $p$, the covariance is $(J^\mathsf{T}J)^{-1}\sigma^2$, where $J$ holds the derivatives of the model at each planned setting. It needs only the plan and a guess of the parameters — no data yet.` },
      { label: 'Derivatives', text: t`$\partial V/\partial V_0 = e^{-t/\tau}$ and $\partial V/\partial\tau = V_0t\,e^{-t/\tau}/\tau^2$. The second is zero at $t = 0$ and peaks at $t = 2\tau$: early readings pin $V_0$, later ones carry $\tau$.` },
      { label: 'Plan A', text: t`Evenly over five time constants: $\sigma_\tau = ${DA.sT.toFixed(3)}$ s. Half the readings are spent where the signal has nearly gone.` },
      { label: 'Plan B', text: t`Evenly over one time constant: $\sigma_\tau = ${DB.sT.toFixed(3)}$ s — slightly better, since every reading still carries signal.` },
      { label: 'Plan C', text: t`Scanning the second time, the best is $t = ${BEST.t}$ s $\approx ${(BEST.t / 10).toFixed(2)}\tau$, with $\sigma_\tau = ${DC.sT.toFixed(3)}$ s: $${(100 * (1 - DC.sT / DA.sT)).toFixed(0)}\,\%$ better than plan A, for free.` },
      { label: 'The catch', text: t`Plan C is optimal only if the guess was right, and two settings can never show that the decay is not exponential. If $\tau$ were really 20 s, plan C would give $\sigma_\tau = ${DCw.sT.toFixed(3)}$ s and plan A $${DAw.sT.toFixed(3)}$ s. A robust plan puts most readings near the optimum and spreads a few to test the model.` },
    ],
    answer: t`Plan C ($t = 0$ and $t \approx 1.1\tau$) gives the smallest $\sigma_\tau$, $${DC.sT.toFixed(3)}$ s against $${DA.sT.toFixed(3)}$ s for an even spread over $5\tau$ — but only for a good pilot guess, and with no test of the model; mix it with a few spread readings.`,
  },
  practice: [
    num({
      id: 'how-many', difficulty: 2,
      gen(r) {
        const s = r.pick([0.02, 0.05, 0.1]), L = r.pick([1, 2, 5]), target = r.pick([0.002, 0.005, 0.01]);
        const ans = (s / (target * L)) ** 2;
        return {
          prompt: t`Each reading has $\sigma = ${s}$, and you will put half your readings at $x = -${L}$ and half at $x = +${L}$. How many readings $N$ in all give a slope uncertainty of $${target}$ per unit $x$? (Enter $N$; round up in practice.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1.4 * L, 1.4 * L], y: [-1, 1], xlabel: 'x', ylabel: '', yticks: 0, axesAt: 'edge', points: [{ x: -L, y: 0, r: 6, color: 'accent', label: 'N/2 here', labelDy: -14 }, { x: L, y: 0, r: 6, color: 'accent', label: 'N/2 here', labelDy: -14 }] }, caption: 'The plan: every reading at one of the two ends.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: s / (target * L), feedback: t`$\sigma_b$ falls as $1/\sqrt N$: square the ratio.` }, { value: (s / target) ** 2, feedback: t`Every point sits $${L}$ from the mean, so $s_x = ${L}$: include it.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`With every point at $\pm L$, $\sum(x_i - \bar x)^2 = NL^2$, so $\sigma_b = \sigma/(\sqrt N L)$.`, t`Solve for $N$: $N = \bigl(\sigma/(\sigma_bL)\bigr)^2$.`],
          teach: 'Precision costs the square: halving σ of a slope needs four times the readings, or twice the spread.',
          explain: t`$N = (${s}/(${target} \times ${L}))^2 = ${ans.toFixed(0)}$. Doubling the range would cut that by four — usually the cheaper way, if the model holds over the wider range.`,
        };
      },
    }),
    num({
      id: 'best-time', difficulty: 3,
      gen(r) {
        const tau = r.pick([2.5, 4, 8, 12, 30]), kind = r.pick(['volt', 'count']);
        const ans = kind === 'volt' ? tau : 2 * tau;
        return {
          prompt: kind === 'volt'
            ? t`A signal decays as $V_0e^{-t/\tau}$ with $V_0$ known exactly and $\tau \approx ${tau}$ s. Every reading has the same uncertainty $\sigma$. If you could take all your readings at one time, which time measures $\tau$ best?`
            : t`A radioactive source’s count rate decays as $R_0e^{-t/\tau}$, $R_0$ known, $\tau \approx ${tau}$ s. Each reading is a count in a short fixed window, so its variance equals its mean. If you could take all your readings at one time, which time measures $\tau$ best?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6 * tau], y: [0, 1.1], xlabel: 't (s)', ylabel: 'signal (scaled)', axesAt: 'edge', curves: [{ fn: `exp(-x/${tau})`, color: 'accent' }] }, caption: 'The decay you are sampling.' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: kind === 'volt' ? 2 * tau : tau, feedback: kind === 'volt' ? 'With constant σ, maximize (∂V/∂τ)² itself, not divided by V.' : 'For counts the variance shrinks with the signal: maximize (∂R/∂τ)²/R.' }, { value: 0, feedback: 'At t = 0 the signal does not depend on τ at all.' }, { value: tau * Math.LN2, feedback: 'The half-life is not special here: maximize the information about τ.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [kind === 'volt' ? t`Information about $\tau$ from one reading is $(\partial V/\partial\tau)^2/\sigma^2$ with $\partial V/\partial\tau = V_0te^{-t/\tau}/\tau^2$.` : t`Information is $(\partial R/\partial\tau)^2/\text{var} = (R_0te^{-t/\tau}/\tau^2)^2/(R_0e^{-t/\tau})$.`, kind === 'volt' ? t`Maximize $t^2e^{-2t/\tau}$: set its derivative to zero.` : t`Maximize $t^2e^{-t/\tau}$: set its derivative to zero.`],
          teach: 'The best setting maximizes (∂model/∂parameter)²/variance: it depends on the noise as much as on the model.',
          explain: kind === 'volt' ? t`$\frac{d}{dt}(t^2e^{-2t/\tau}) = 0$ at $t = \tau = ${tau}$ s.` : t`$\frac{d}{dt}(t^2e^{-t/\tau}) = 0$ at $t = 2\tau = ${2 * tau}$ s: counting noise falls as the signal falls, so later readings are worth more than with constant noise.`,
        };
      },
    }),
    num({
      id: 'drift-slope', difficulty: 2,
      gen(r) {
        const d = r.pick([0.2, 0.5, 1.0, 1.5]), dx = r.pick([0.5, 1, 2, 5]), b = r.pick([12, 20, 35, 50]);
        const ans = d / dx;
        return {
          prompt: t`You step $x$ upward by ${dx} between readings, one reading a minute, while the instrument’s zero drifts upward by ${d} units per minute. The true slope is ${b}. By how much is the fitted slope biased?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 10], y: [0, 10], xlabel: 'reading number (= time in minutes)', ylabel: 'value (scaled)', axesAt: 'edge', curves: [{ fn: 'x', color: 'accent', label: 'true response', labelAt: 7, labelDy: 14 }, { fn: 'x + 0.25*x', color: 'warn', dash: [6, 4], label: 'with drift', labelAt: 6, labelDy: -14 }] }, caption: 'Settings taken in order: the drift adds a slope of its own (illustrative).' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: d * dx, feedback: 'The drift per reading is spread over one step in x: divide, do not multiply.' }, { value: 0, feedback: 'A drift that grows with time, when x also grows with time, does bias the slope.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['Each step adds Δx to x and the drift adds d to y.', t`The extra slope is $d/\Delta x$.`],
          teach: 'A drift rate divided by the rate at which you sweep x becomes a bias in the slope — unless the order is randomized.',
          explain: t`$${d}/${dx} = ${ans.toFixed(3)}$ per unit $x$ — ${(100 * ans / b).toFixed(1)} % of the true slope, invisible in the residuals because it is a straight line too. Randomizing the order turns it into scatter, which $\chi^2$ can see.`,
        };
      },
    }),
    mcq({
      id: 'randomize', difficulty: 2,
      prompt: t`You will measure a thermistor’s resistance at eight bath temperatures over an afternoon, and the meter’s reference is known to drift slowly as the room warms. Which plan is best?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 9], y: [0, 9], xlabel: 'order taken', ylabel: 'temperature setting (rank)', axesAt: 'edge', points: [[1, 3], [2, 7], [3, 1], [4, 5], [5, 8], [6, 2], [7, 6], [8, 4]].map(([x, y]) => ({ x, y, r: 5, color: 'accent' })) }, caption: 'A shuffled order: the setting has no trend with time.' },
      choices: ['Take the temperatures in a shuffled order, and read a reference resistor at the start, middle and end', 'Take the temperatures in increasing order, so the bath only ever warms', 'Take them in increasing order, then repeat in decreasing order, and average', 'Take each temperature twice in a row'],
      answer: 0,
      why: {
        1: 'Monotonic order aligns the drift with temperature: it becomes part of the fitted curve.',
        2: 'Up-then-down cancels a drift that is linear in time — a good second-best — but not one that curves, and it doubles the runtime.',
        3: 'Back-to-back repeats show short-term scatter but are blind to a slow drift.',
      },
      hints: ['What turns a time trend into scatter rather than slope?', 'And how could you measure the drift itself?'],
      teach: 'Randomize the order of settings, and monitor a reference: drift then shows as scatter and can be corrected.',
      explain: t`Shuffling decorrelates time from the setting, so a drift inflates $\chi^2$ instead of bending the calibration; the reference readings measure it outright. (Bath settling time sometimes forces a monotonic order — then up-and-down sweeps are the fallback.)`,
    }),
    multi({
      id: 'hold-fixed', difficulty: 2,
      prompt: t`You measure the period $T$ of a pendulum against its length $L$ to find $g$. Which of these should you hold fixed (or keep small) while varying $L$?`,
      visual: { type: 'graph', params: { aspect: 'square', x: [-1.2, 1.2], y: [-1.6, 0.3], equal: true, axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['0.5*sin(0.35*t)', '-cos(0.35*t)*1.4'], t: [-1, 1], color: 'ink4', dash: [4, 4] }, { param: ['t*0.49', '-t*1.31'], t: [0, 1], color: 'ink2', width: 2 }], points: [{ x: 0.49, y: -1.31, r: 9, color: 'accent' }, { x: 0, y: 0, r: 4, color: 'ink2', label: 'pivot' }] }, caption: 'A pendulum swinging through a small arc. Schematic.' },
      choices: ['the amplitude of the swing', 'the bob’s mass', 'the number of swings timed per reading', 'the length L'],
      answer: [0, 2],
      why: { 1: 'The period does not depend on the mass (to a very good approximation): no need to fix it, though changing it gains nothing either.', 3: 'L is the variable you are deliberately changing.' },
      hints: ['Which of these changes the period, or the precision of each reading, as well as L?'],
      teach: 'Hold fixed what affects the outcome but is not under study; vary only the variable the model is about.',
      explain: t`The period grows with amplitude ($T \approx T_0(1 + \theta_0^2/16)$), so the amplitude must stay small and constant; timing the same number of swings keeps each reading’s uncertainty the same, which an unweighted fit assumes.`,
    }),
    order({
      id: 'plan', difficulty: 2,
      prompt: t`Put the steps of planning a measurement in a sensible order.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [0, 1], axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', arrows: [{ from: [0.3, 0.5], to: [5.7, 0.5], color: 'ink3' }], points: [{ x: 0.3, y: 0.5, r: 5, color: 'accent', label: 'question', labelDy: -14 }, { x: 5.7, y: 0.5, r: 5, color: 'good', label: 'result', labelDy: -14, labelDx: -40 }] }, caption: 'From a question to a result with an honest uncertainty.' },
      items: [
        'State the question and the model that answers it',
        'Run a pilot to learn the signal size and the noise',
        'Write an uncertainty budget and choose N, range and spacing',
        'Fix the order (randomized) and what stays constant',
        'Take the data, then analyse it as planned',
      ],
      hints: ['You cannot choose N before you know the noise.'],
      teach: 'Design comes before data: the pilot run tells you the noise, the budget tells you how much data you need.',
      explain: t`The pilot gives the numbers the design needs ($\sigma$, rough parameters); the budget turns a target uncertainty into $N$ and a range; the order protects against drift. Deciding the analysis before seeing the data protects against tuning it toward a hoped-for answer.`,
    }),
    code({
      id: 'design-sigma', difficulty: 3,
      prompt: t`Write \`sigma_tau(ts, V0, tau, s)\`: the standard uncertainty of $\tau$ for $V = V_0e^{-t/\tau}$ sampled at times \`ts\`, each with $\sigma$ = \`s\`, both $V_0$ and $\tau$ fitted. Build the $N\times2$ matrix $J$ of derivatives, then $C = \sigma^2(J^\mathsf{T}J)^{-1}$, and return $\sqrt{C_{\tau\tau}}$. The program compares plans A and C of the worked example.`,
      starter: t`import numpy as np

def sigma_tau(ts, V0, tau, s):
    ts = np.asarray(ts, float)
    # your code: J with columns dV/dV0 and dV/dtau, then the covariance
    return 0.0

A = np.linspace(0, 50, 10)
C = [0]*5 + [${BEST.t}]*5
print(f"plan A: {sigma_tau(A, 5, 10, 0.02):.4f} s   plan C: {sigma_tau(C, 5, 10, 0.02):.4f} s")`,
      answer: t`import numpy as np

def sigma_tau(ts, V0, tau, s):
    ts = np.asarray(ts, float)
    e = np.exp(-ts / tau)
    J = np.column_stack([e, V0 * ts / tau**2 * e])
    C = s**2 * np.linalg.inv(J.T @ J)
    return np.sqrt(C[1, 1])

A = np.linspace(0, 50, 10)
C = [0]*5 + [${BEST.t}]*5
print(f"plan A: {sigma_tau(A, 5, 10, 0.02):.4f} s   plan C: {sigma_tau(C, 5, 10, 0.02):.4f} s")`,
      tests: [
        { name: t`plan A (even over $5\tau$) gives $${DA.sT.toFixed(4)}$ s`, code: `abs(sigma_tau(np.linspace(0, 50, 10), 5, 10, 0.02) - ${fisher(Array.from({ length: 10 }, (_, i) => i * 50 / 9), 5, 10, 0.02).sT}) < 1e-6` },
        { name: t`plan C gives $${DC.sT.toFixed(4)}$ s`, code: `abs(sigma_tau([0]*5 + [${BEST.t}]*5, 5, 10, 0.02) - ${DC.sT}) < 1e-6` },
        { name: 'σ scales in proportion to the reading noise', code: `abs(sigma_tau([0]*5 + [${BEST.t}]*5, 5, 10, 0.04) / sigma_tau([0]*5 + [${BEST.t}]*5, 5, 10, 0.02) - 2) < 1e-9` },
      ],
      hints: [t`\`e = np.exp(-ts/tau)\`; \`J = np.column_stack([e, V0*ts/tau**2*e])\`.`, t`\`C = s**2 * np.linalg.inv(J.T @ J)\`; return \`np.sqrt(C[1, 1])\`.`],
      teach: 'The covariance (JᵀJ)⁻¹σ² can be computed before any data exist: it is how designs are compared.',
      explain: t`Plan A: $${DA.sT.toFixed(4)}$ s; plan C: $${DC.sT.toFixed(4)}$ s. Try a true $\tau$ of 20 s in both calls to see plan C lose its advantage — the price of trusting the pilot.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-burn', difficulty: 3, transfer: true,
      prompt: t`A strand-burner campaign will measure a solid propellant’s pressure exponent $n$ in $r = a\,p^n$ (a straight line in $\ln r$ against $\ln p$) between 2 and 20 MPa. You can afford eight strands. Which pressure plan is best?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0.5, 3.2], y: [0, 4], xlabel: 'ln(p / 1 MPa)', ylabel: '', yticks: 0, axesAt: 'edge', points: [...[2, 4.6, 7.1, 9.7, 12.3, 14.9, 17.4, 20].map((p) => ({ x: r6(Math.log(p)), y: 3, r: 4, color: 'accent' })), { x: 3.05, y: 3, r: 0, label: 'P' }, ...[2, 2.8, 3.9, 5.4, 7.4, 10.3, 14.4, 20].map((p) => ({ x: r6(Math.log(p)), y: 2, r: 4, color: 'accent' })), { x: 3.05, y: 2, r: 0, label: 'Q' }, ...[9, 10, 11, 12, 13, 14, 15, 16].map((p) => ({ x: r6(Math.log(p)), y: 1, r: 4, color: 'accent' })), { x: 3.05, y: 1, r: 0, label: 'R' }] }, caption: 'Three plans, drawn on the axis the fit uses: ln p.' },
      choices: ['Plan Q: evenly spaced in ln p from 2 to 20 MPa', 'Plan P: evenly spaced in p from 2 to 20 MPa', 'Plan R: eight strands between 9 and 16 MPa, the motor’s operating range', 'Eight strands at 2 MPa and none elsewhere, repeated for precision'],
      answer: 0,
      why: {
        1: 'Even in p crowds the points at the high end of ln p, wasting leverage at the low end.',
        2: 'A narrow range gives little spread in ln p: σ of n is several times larger. (Concentrating near the operating point is right only if you need r there, not n.)',
        3: 'One setting cannot determine a slope at all.',
      },
      hints: ['The fit is a line in ln p: spread matters on that axis.', 'Compare the spread of ln p for each plan.'],
      teach: 'Spread the settings evenly along the axis the fit uses — here ln p — across the widest range the model holds over.',
      explain: t`The spread $s_{\ln p}$ is about ${(() => { const sd = (xs) => { const L = xs.map(Math.log); const m = L.reduce((a, b) => a + b) / L.length; return Math.sqrt(L.reduce((a, b) => a + (b - m) ** 2, 0) / L.length); }; return `${sd([2, 2.8, 3.9, 5.4, 7.4, 10.3, 14.4, 20]).toFixed(2)} for Q, ${sd([2, 4.6, 7.1, 9.7, 12.3, 14.9, 17.4, 20]).toFixed(2)} for P and ${sd([9, 10, 11, 12, 13, 14, 15, 16]).toFixed(2)} for R`; })()}; $\sigma_n \propto 1/s_{\ln p}$. Plan Q also tests for a change of exponent across the range, which propellants often show.`,
    }),
    num({
      id: 'cp-middle', difficulty: 3,
      gen(r) {
        const N = r.pick([10, 12, 16, 20]), m = 2 * r.int(1, Math.floor(N / 4));
        const ans = Math.sqrt(N / (N - m));
        return {
          prompt: t`Of $${N}$ readings in $-1 \le x \le 1$, you move $m = ${m}$ from the ends to the middle ($x = 0$) to test for curvature. By what factor does the slope’s uncertainty grow compared with all $${N}$ at the ends?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1.4, 1.4], y: [-1, 1], xlabel: 'x', ylabel: '', yticks: 0, axesAt: 'edge', points: [{ x: -1, y: 0, r: 6, color: 'accent', label: `${(N - m) / 2}`, labelDy: -14 }, { x: 0, y: 0, r: 6, color: 'violet', label: `${m}`, labelDy: -14 }, { x: 1, y: 0, r: 6, color: 'accent', label: `${(N - m) / 2}`, labelDy: -14 }] }, caption: 'How many readings sit at each setting.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: N / (N - m), feedback: 'σ goes as 1/√(Σ(x − x̄)²): take the square root of the ratio.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Middle points contribute nothing to $\sum(x_i - \bar x)^2$; each end point contributes 1.`, t`$\sigma_b \propto 1/\sqrt{N - m}$.`],
          teach: 'Middle points buy a curvature test at the cost of leverage; a few cost little.',
          explain: t`$\sigma_b \propto 1/\sqrt{N - m}$, so the factor is $\sqrt{${N}/${N - m}} = ${ans.toFixed(3)}$ — a ${(100 * (ans - 1)).toFixed(0)} % loss in exchange for a way to see whether a line is the right model at all.`,
        };
      },
    }),
    mcq({
      id: 'cp-pilot', difficulty: 2,
      prompt: t`Your design calculation says 40 readings will give the precision you need. What is it most likely to rest on that you have not yet measured?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 60], y: [0, 0.2], xlabel: 'N', ylabel: 'σ of the result (illustrative)', axesAt: 'edge', curves: [{ fn: '0.5/sqrt(x)', color: 'accent', domain: [5, 60] }], vlines: [{ x: 40, color: 'gold' }] }, caption: 'A design curve: its height depends on the noise you assumed.' },
      choices: ['The noise of one reading, σ, and the rough size of the parameters — which a short pilot run measures', 'The exact value of the parameter you are measuring', 'The number of significant figures to report', 'The colour scheme of the final figure'],
      answer: 0,
      why: {
        1: 'You need only a rough guess of it — that is what the experiment is for.',
        2: 'Reporting comes after the measurement; it does not set N.',
        3: 'Not a design input.',
      },
      hints: [t`Which input of $\sigma_b = \sigma/(\sqrt N s_x)$ do you not control?`, 'How would doubling it change the N you need?'],
      teach: 'A pilot run measures the noise and rough parameter sizes that every design calculation needs.',
      explain: t`$N$ scales as $\sigma^2$: a noise twice what you assumed needs four times the readings. Twenty minutes of pilot data can save a wasted day.`,
    }),
  ],
  sources: [
    { label: 'AAPT, Recommendations for the Undergraduate Physics Laboratory Curriculum (2014): designing experiments', url: 'https://www.aapt.org/Resources/upload/LabGuidlinesDocument_EBendorsed_nov10.pdf' },
    { label: 'D. C. Montgomery, Design and Analysis of Experiments, 9th ed. (Wiley, 2017): randomization and blocking', url: 'https://www.wiley.com/en-us/Design+and+Analysis+of+Experiments%2C+10th+Edition-p-9781119722106' },
    { label: 'P. R. Bevington & D. K. Robinson, Data Reduction and Error Analysis, 3rd ed.: the error matrix', url: 'https://www.mheducation.com/highered/product/data-reduction-error-analysis-physical-sciences-bevington-robinson/M9780072472271.html' },
  ],
});
