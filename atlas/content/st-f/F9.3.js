// Adaptive step size — embedded Runge–Kutta pairs and the step controller,
// built and run (solve_ivp's user side is prog P11.2): two solutions of
// orders 4 and 5 from the same six stages (Dormand–Prince), their difference
// as a free error estimate, accept-or-reject against atol + rtol·|y|, and the
// controller h_new = 0.9 h err^(−1/5). On an e = 0.9 orbit the steps follow
// the local time scale r^(3/2) (a hundredfold range), and at 10⁻⁸ the adaptive
// run costs 28 times fewer evaluations than uniform RK4 for the same error.
// The tolerance is a local, per-step target: at rtol = 10⁻⁶ the orbit closes
// only to 1.5 × 10⁻³.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { dopri, heunEuler, TABLEAU, runRK, n12, lg } from './_ode.js';
import { seg } from './_num.js';
import { kepler2d } from '../prog/_solvers.js';

const t = String.raw;

// ── an e = 0.9 orbit, GM = a = 1, from periapsis; period 2π ──
const ECC = 0.9, GM = 1, P = 2 * Math.PI;
const F = kepler2d(GM), Y0 = [1 - ECC, 0, 0, Math.sqrt((1 + ECC) / (1 - ECC))];
const close = (y) => Math.hypot(y[0] - Y0[0], y[1] - Y0[1]);
function uniformRK4(err) {
  const e = (n) => close(runRK(TABLEAU.rk4, F, 0, Y0, P, n));
  let hi = 64;
  while (e(hi) > err) hi *= 2;
  let lo = hi / 2;
  while (hi - lo > Math.max(1, hi / 200)) { const m = Math.round((lo + hi) / 2); if (e(m) > err) lo = m; else hi = m; }
  return hi;
}
const TOLS = [[1, 1e-4, '10⁻⁴'], [2, 1e-6, '10⁻⁶'], [3, 1e-8, '10⁻⁸'], [4, 1e-10, '10⁻¹⁰']];
const RUNS = TOLS.map(([, tol]) => {
  const r = dopri(F, 0, Y0, P, { rtol: tol, atol: tol }), err = close(r.ys[r.ys.length - 1]);
  const inner = r.hs.slice(1, -1);
  return { ...r, err, steps: r.hs.length, hmin: Math.min(...inner), hmax: Math.max(...inner), uni: uniformRK4(err) };
});
const R6 = RUNS[1], TR = R6.tries;
const R6r = R6.ys.map((y) => Math.hypot(y[0], y[1]));
// the step against the local time scale r^(3/2), matched at apoapsis
const iApo = R6r.indexOf(Math.max(...R6r.slice(0, -1)));
const CFIT = R6.hs[Math.min(iApo, R6.hs.length - 1)] / R6r[iApo] ** 1.5;
const HE = heunEuler(F, 0, Y0, P, 1e-5);
const whenT = (k) => `step(0.5 - abs(tl - ${k}))`;

export default lesson({
  id: 'st-f.F9.3',
  title: 'Adaptive step size',
  minutes: 15, difficulty: 3,
  intro: t`An orbit, a re-entry or a flyby has moments when everything happens fast and long stretches when nothing does; one fixed step is wasted on the second or too coarse for the first. An **embedded pair** computes two solutions from the same stages, of orders $p$ and $p+1$. Their difference estimates the error of the step at no extra cost. A controller compares it with the tolerance, accepts or rejects the step, and picks the next one:

$$\text{err} = \left\lVert\frac{y^{[5]} - y^{[4]}}{\text{atol} + \text{rtol}\,\lvert y\rvert}\right\rVert, \qquad h_{\text{new}} = 0.9\,h\,\text{err}^{-1/5}$$

A step is accepted when $\text{err} \le 1$. Because the local error of the order-4 solution scales like $h^5$, the power $-\tfrac15$ aims the next step exactly at the tolerance, and the factor 0.9 leaves a margin. This is Dormand–Prince 5(4), the method inside \`scipy.integrate.solve_ivp\`’s default RK45.`,
  symbols: [
    { tex: 'y^{[5]},\\ y^{[4]}', text: 'the two solutions of the pair after one step, of orders 5 and 4, built from the same seven slopes with different weights' },
    { tex: t`\text{err}`, text: 'the scaled error estimate: the root-mean-square, over the state’s components, of each difference divided by its allowed size. $\\text{err} \\le 1$ means “within tolerance”' },
    { tex: t`\text{atol},\ \text{rtol}`, text: 'absolute and relative tolerances: each component may err by $\\text{atol} + \\text{rtol}\\,\\lvert y\\rvert$ **per step**' },
    { tex: 'h', text: 'the step just attempted; $h_{\\text{new}}$ is the next one (or the retry, if this one was rejected), limited to between 0.2 and 5 times $h$' },
    { tex: t`0.9`, text: 'a safety factor, so the next step is aimed a little inside the tolerance and is rarely rejected' },
    { tex: t`-\tfrac15`, text: 'one over the power of $h$ in the local error ($h^{p+1}$ with $p = 4$)' },
  ],
  why: 'Every production ODE solver controls its step this way, so knowing what the tolerance does and does not promise is what separates a trustworthy trajectory from a pretty one.',
  visual: {
    type: 'graph',
    title: 'Where the steps go',
    lead: t`An orbit of eccentricity 0.9 integrated for one period from periapsis (right) by adaptive Dormand–Prince. Each dot is the start of an accepted step. Choose a tolerance (used as both rtol and atol) and compare the cost with fixed-step RK4 reaching the **same** closing error.`,
    tasks: [
      `Near periapsis the dots crowd together; at apoapsis (left) they spread out: at 10⁻⁶ the largest step is ${(RUNS[1].hmax / RUNS[1].hmin).toFixed(0)} times the smallest.`,
      `Tighten the tolerance a hundredfold: the number of steps grows by only about 100^{1/5} ≈ 2.5, since the local error scales like h⁵.`,
      `At 10⁻⁸ the adaptive run needs ${RUNS[2].nfev} evaluations; uniform RK4 needs ${4 * RUNS[2].uni} for the same error.`,
    ],
    params: {
      x: [-1.98, 0.22], y: [-0.5, 0.5], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (units of a)', ylabel: 'y',
      choices: [{ key: 'tl', label: 'Tolerance', options: TOLS.map(([k, , l]) => [k, l]), value: 2, explain: 'rtol = atol: the error allowed per step, relative to the size of the state.' }],
      curves: [{ param: [`cos(t) - ${ECC}`, `${n12(Math.sqrt(1 - ECC * ECC))}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1.4 }],
      points: [{ x: 0, y: 0, r: 6, color: 'gold' }, ...RUNS.flatMap((R, i) => R.ys.slice(0, -1).map((y) => ({ x: n12(y[0]), y: n12(y[1]), r: 3, color: 'accent', when: whenT(TOLS[i][0]) })))],
      readouts: [
        { label: 'accepted steps', expr: RUNS.map((R, i) => `${whenT(TOLS[i][0])}*${R.steps}`).join(' + '), digits: 4 },
        { label: 'rejected', expr: RUNS.map((R, i) => `${whenT(TOLS[i][0])}*${R.rejected.length}`).join(' + '), digits: 3 },
        { label: 'closing error', expr: RUNS.map((R, i) => `${whenT(TOLS[i][0])}*${n12(R.err)}`).join(' + '), digits: 2, zero: 0 },
        { label: 'evaluations: adaptive', expr: RUNS.map((R, i) => `${whenT(TOLS[i][0])}*${R.nfev}`).join(' + '), digits: 5 },
        { label: 'uniform RK4, same error', expr: RUNS.map((R, i) => `${whenT(TOLS[i][0])}*${4 * R.uni}`).join(' + '), digits: 6 },
      ],
    },
    caption: 'Exact runs of Dormand–Prince 5(4) with the standard controller (start h = P/100) in float64; gold: the central mass. Closing error: distance from the starting point after one period, in units of the semi-major axis. The uniform count is the fewest RK4 steps (× 4 evaluations) reaching that closing error.',
  },
  example: {
    prompt: t`Follow the controller through its first attempts at periapsis, with rtol = atol $= 10^{-6}$ and a first guess $h = P/100 = ${TR[0].h.toFixed(4)}$. Then explain the shape of $h(t)$ over the orbit.`,
    visual: {
      type: 'graph',
      params: { x: [-0.1, 6.4], y: [-2.6, 0], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 't (one period = 2π)', ylabel: 'step h',
        points: R6.hs.map((h, i) => ({ x: n12(R6.ts[i]), y: n12(lg(h)), r: 3.5, color: 'accent' })),
        curves: R6.ys.slice(1).map((y, i) => seg(R6.ts[i], lg(CFIT * R6r[i] ** 1.5), R6.ts[i + 1], lg(CFIT * Math.hypot(y[0], y[1]) ** 1.5), { color: 'gold', width: 1.6, samples: 10 })),
        legend: [{ label: 'accepted step h', color: 'accent', point: true }, { label: 'C r³ᐟ² (matched at apoapsis)', color: 'gold' }], legendAt: 'br' },
      caption: 'Every accepted step of the 10⁻⁶ run against time, on a log axis, and the local orbital time scale r^(3/2) scaled to meet it at apoapsis. The first and last steps are set by the starting guess and the end of the interval.',
    },
    steps: [
      { label: 'First try', text: t`At periapsis the speed is $${Y0[3].toFixed(2)}$ and the path turns sharply. The first step gives $\text{err} = ${tex(TR[0].err, 3)}$ — four orders of magnitude over. **Reject.** $0.9\,\text{err}^{-1/5}$ would be tiny, so the controller cuts by its limit, 0.2: $h = ${TR[1].h.toFixed(5)}$.` },
      { label: 'Retries', text: t`$\text{err} = ${TR[1].err.toFixed(2)}$: reject, $h \to 0.9\times${TR[1].err.toFixed(2)}^{-1/5}h = ${TR[2].h.toFixed(5)}$. Then $\text{err} = ${TR[2].err.toFixed(3)}$: still over 1, reject again, $h \to ${TR[3].h.toFixed(5)}$.` },
      { label: 'Accept', text: t`$\text{err} = ${TR[3].err.toFixed(3)} \le 1$: accept, and the next step is $0.9\times${TR[3].err.toFixed(3)}^{-1/5}h = ${TR[3].next.toFixed(5)}$. Three wasted attempts on a bad first guess — which is why solvers estimate a starting step from $f$ before taking one.` },
      { label: 'The shape of h(t)', text: t`After that the steps track the orbit: smallest at periapsis, $${tex(R6.hmin, 3)}$, largest at apoapsis, $${tex(R6.hmax, 3)}$. The local time scale of an orbit is about $\sqrt{r^3/GM}$, and the gold curve, $\propto r^{3/2}$, follows the steps closely: the controller has discovered Kepler’s third law. Predicted range: $\left(\frac{1+e}{1-e}\right)^{3/2} = ${(((1 + ECC) / (1 - ECC)) ** 1.5).toFixed(0)}$.` },
      { label: 'Cost', text: t`One period takes $${R6.steps}$ accepted and $${R6.rejected.length}$ rejected steps, $${R6.nfev}$ evaluations of $f$. Fixed-step RK4 needs $${R6.uni}$ steps ($${4 * R6.uni}$ evaluations) for the same closing error of $${tex(R6.err, 2)}$.` },
      { label: 'Read the tolerance right', text: t`The closing error, $${tex(R6.err, 2)}$, is **a thousand times** the tolerance. The controller keeps each step’s local error near $10^{-6}$; over many steps those errors accumulate and the orbit’s phase error grows. Tolerance is a dial, not a guarantee — check convergence by tightening it ([F13.1](#/lesson/st-f.F13.1)).` },
    ],
    answer: t`Three rejections, then $h = ${TR[3].h.toFixed(5)}$ is accepted; steps then follow $r^{3/2}$, a $${(R6.hmax / R6.hmin).toFixed(0)}$-fold range, $${R6.nfev}$ evaluations in all — but a closing error of $${tex(R6.err, 2)}$, far above rtol.`,
  },
  practice: [
    num({
      id: 'next-step', difficulty: 2,
      gen(r) {
        const h = r.pick([0.02, 0.05, 0.1, 0.4]), err = r.pick([0.05, 0.2, 0.35, 0.6, 0.85]);
        const ans = h * Math.min(5, Math.max(0.2, 0.9 * err ** -0.2));
        return {
          prompt: t`A Dormand–Prince step of size $h = ${h}$ s returns a scaled error $\text{err} = ${err}$. It is accepted. What step does the controller $h_{\text{new}} = 0.9\,h\,\text{err}^{-1/5}$ choose next?`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.05], y: [0, 2.1], aspect: 'wide', axesAt: 'edge', xlabel: 'err', ylabel: 'h(new)/h',
              curves: [{ fn: '0.9*x^(-0.2)', color: 'accent', width: 2.2, domain: [0.012, 1.05] }],
              vlines: [{ x: 1, color: 'bad', label: 'reject beyond' }], hlines: [{ y: 1, color: 'ink4' }] },
            caption: 'The controller’s factor 0.9 err^(−1/5) against the error estimate. Small errors grow the step, but slowly.',
          },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: h * err ** -0.2, feedback: 'Include the safety factor 0.9.' }, { value: 0.9 * h * err ** -0.25, feedback: 'The exponent is −1/5 for a 5(4) pair: the local error of the order-4 solution scales like h⁵.' }, { value: 0.9 * h * err ** 0.2, feedback: 'The sign of the exponent: a small error should make the next step larger.' }],
          hints: [t`Compute $\text{err}^{-1/5} = 1/${err}^{0.2}$.`, t`$h_{\text{new}} = 0.9\times${h}\times${(err ** -0.2).toFixed(4)}$.`],
          teach: 'The controller aims the next local error at the tolerance: if err ∝ h⁵, then h × err^(−1/5) is the step that would have given err = 1.',
          explain: t`$0.9\times${h}\times${err}^{-1/5} = ${tex(ans, 4)}$ s. Even an error twenty times below tolerance only lets the step grow by $0.9\times20^{1/5} = ${(0.9 * 20 ** 0.2).toFixed(2)}$: the fifth root keeps the controller calm.`,
        };
      },
    }),
    mcq({
      id: 'reject', difficulty: 2,
      prompt: t`An adaptive step returns $\text{err} = 2.3$. What does the solver do?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [0, 2.1], aspect: 'wide', axesAt: 'edge', xlabel: 'err', ylabel: 'h(new)/h',
          curves: [{ fn: '0.9*x^(-0.2)', color: 'accent', width: 2.2, domain: [0.012, 3] }],
          vlines: [{ x: 1, color: 'bad', label: 'err = 1' }], points: [{ x: 2.3, y: n12(0.9 * 2.3 ** -0.2), r: 5, color: 'gold' }] },
        caption: 'The controller factor; the gold point is this step.',
      },
      choices: [
        t`Discards the step and retries from the same point with $h \times 0.9\times2.3^{-1/5} \approx 0.76h$`,
        'Accepts it, and takes a smaller step next time',
        'Keeps the step but halves all later steps',
        'Stops and reports that the tolerance cannot be met',
      ],
      answer: 0,
      why: {
        1: 'Accepting it would let an error 2.3 times the tolerance into the solution; err > 1 means reject.',
        2: 'Rejected steps are thrown away, and the retry size comes from the same formula, not a fixed halving.',
        3: 'A rejection is routine; the solver only gives up if h falls towards round-off.',
      },
      hints: ['The acceptance test is err ≤ 1.', 'A rejected step is redone from the same starting point with a step from the same controller formula.'],
      teach: 'A rejected step costs its evaluations but nothing else: the solver retries from the same point with a smaller h.',
      explain: t`$0.9\times2.3^{-1/5} = ${(0.9 * 2.3 ** -0.2).toFixed(3)}$, so the retry uses about $0.76h$, which should give $\text{err} \approx 2.3\times0.76^5 \approx ${(2.3 * (0.9 * 2.3 ** -0.2) ** 5).toFixed(2)}$ — accepted.`,
    }),
    mcq({
      id: 'embedded', difficulty: 2,
      prompt: t`Dormand–Prince 5(4) gets its error estimate from two solutions built from the same stages. Why is that better than estimating the error by step doubling (one step of $h$ against two of $h/2$)?`,
      visual: {
        type: 'graph',
        params: { x: [-0.1, 1.15], y: [0.2, 1.25], aspect: 'wide', axesAt: 'edge', xlabel: 't (units of h)', ylabel: 'y', yticks: 0,
          curves: [{ fn: '1 - 0.55*x^2 + 0.1*x^3', color: 'ink3', width: 2.2, domain: [0, 1.1] }],
          points: [0, 0.2, 0.3, 0.8, 8 / 9, 1].map((c) => ({ x: n12(c), y: n12(1 - 0.55 * c * c + 0.1 * c ** 3), r: 5, color: 'gold' })) },
        caption: 'Schematic: the six stage times of a Dormand–Prince step (0, 1/5, 3/10, 4/5, 8/9, 1). Both solutions are weighted sums of the same slopes.',
      },
      choices: [
        'The second solution reuses the same slope evaluations with different weights, so the estimate costs no extra evaluations of f',
        'Embedded pairs give a rigorous bound on the global error',
        'Step doubling cannot be applied to systems of equations',
        'The two solutions are independent, so their errors cancel',
      ],
      answer: 0,
      why: {
        1: 'They estimate the local error of one step, and only approximately; no sampling method bounds the global error.',
        2: 'Step doubling works for any system; it is just about twice as expensive.',
        3: 'They share every stage, so they are far from independent; the estimate is their difference, not a cancellation.',
      },
      hints: ['Count the evaluations of f each approach needs per step.', 'Step doubling needs three steps’ worth of stages for one accepted step.'],
      teach: 'An embedded pair is two Runge–Kutta methods sharing one set of stages: the error estimate is a different weighted sum of slopes already computed.',
      explain: t`Dormand–Prince uses seven stages, and the seventh is the first stage of the next step (first same as last), so it costs six evaluations per step — the same as a single fifth-order method with no estimate. Step doubling with RK4 costs 11 evaluations per step. The 5th-order result is kept (**local extrapolation**), so the estimate describes the less accurate of the two — the true local error is usually smaller still.`,
    }),
    num({
      id: 'steps-vs-tol', difficulty: 2,
      gen(r) {
        const N1 = r.pick([120, 300, 850]), k = r.pick([2, 3, 4]), ans = N1 * 10 ** (k / 5);
        return {
          prompt: t`A fifth-order adaptive solver takes $${N1}$ steps for a trajectory at rtol $= 10^{-6}$. About how many will it take at rtol $= 10^{-${6 + k}}$?`,
          visual: {
            type: 'graph',
            params: { x: [-11, -3], y: [lg(N1) - 0.3, lg(ans) + 0.4], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'rtol', ylabel: 'steps',
              curves: [{ fn: `${n12(lg(N1))} - (x + 6)/5`, color: 'accent', width: 2, dash: true, domain: [-11, -3] }],
              points: [{ x: -6, y: n12(lg(N1)), r: 5, color: 'accent' }] },
            caption: 'Steps against tolerance on log–log axes for an h⁵ local error: a line of slope −1/5.',
          },
          answer: ans, tol: { rel: 0.03 },
          errors: [{ value: N1 * 10 ** k, feedback: 'The local error falls like h⁵, so h only shrinks by the fifth root of the tolerance ratio.' }, { value: N1 * 10 ** (k / 4), feedback: 'For a 5(4) pair the controller exponent is 1/5 (local error ∝ h⁵), not 1/4.' }],
          hints: [t`Local error $\propto h^5$, so $h \propto \text{tol}^{1/5}$ and the step count $\propto \text{tol}^{-1/5}$.`, t`Multiply by $(10^{${k}})^{1/5}$.`],
          teach: 'A high-order adaptive solver pays little for accuracy: each factor of 10 in tolerance costs 10^{1/5} ≈ 1.58 times the steps.',
          explain: t`$${N1}\times10^{${k}/5} = ${Math.round(ans)}$ steps. The Explore orbit shows the same scaling: $${RUNS[1].steps} \to ${RUNS[2].steps} \to ${RUNS[3].steps}$ steps for each hundredfold tightening (about $2.5\times$ each).`,
        };
      },
    }),
    num({
      id: 'kepler-ratio', difficulty: 3,
      gen(r) {
        const e = r.pick([0.5, 0.7, 0.8, 0.95]), ans = ((1 + e) / (1 - e)) ** 1.5;
        return {
          prompt: t`An adaptive solver integrates an orbit of eccentricity $e = ${e}$. Its steps follow the local time scale $\sqrt{r^3/GM}$. Estimate the ratio of the step at apoapsis, $r = a(1+e)$, to the step at periapsis, $r = a(1-e)$.`,
          visual: {
            type: 'graph',
            params: { x: [-(1 + e) - 0.15, 1 - e + 0.15], y: [-0.62, 0.62], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x / a', ylabel: 'y / a',
              curves: [{ param: [`cos(t) - ${e}`, `${n12(Math.sqrt(1 - e * e))}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent', width: 2 }],
              points: [{ x: 0, y: 0, r: 6, color: 'gold' }, { x: n12(1 - e), y: 0, r: 4, color: 'accent', label: 'periapsis', labelDy: -12 }, { x: n12(-1 - e), y: 0, r: 4, color: 'accent', label: 'apoapsis', labelDy: -12 }] },
            caption: 'The orbit with the central mass at a focus (gold).',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (1 + e) / (1 - e), feedback: 'That is the ratio of distances. The time scale goes like r^{3/2}.' }, { value: ((1 + e) / (1 - e)) ** 2, feedback: 'The time scale is √(r³/GM): power 3/2, not 2.' }],
          hints: [t`Ratio $= \left(\frac{r_a}{r_p}\right)^{3/2}$.`, t`$r_a/r_p = (1 + ${e})/(1 - ${e})$.`],
          teach: 'An adaptive solver’s step tracks the problem’s local time scale; for an orbit that is the dynamical time √(r³/GM).',
          explain: t`$\left(\frac{${1 + e}}{${(1 - e).toFixed(2)}}\right)^{3/2} = ${ans.toFixed(1)}$. A fixed step would have to be as small as the periapsis step all the way round — wasting most of its effort — which is the whole case for adaptivity on eccentric orbits.`,
        };
      },
    }),
    mcq({
      id: 'tol-meaning', difficulty: 3,
      prompt: t`An eccentric orbit is integrated with rtol = atol $= 10^{-6}$ (positions of order 1). After one period the computed position is $${tex(R6.err, 2)}$ from where it should be. Is the solver broken?`,
      visual: {
        type: 'graph',
        params: { x: [-11, -3], y: [-8.5, -0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'tolerance', ylabel: 'closing error',
          points: RUNS.map((R, i) => ({ x: n12(lg(TOLS[i][1])), y: n12(lg(R.err)), r: 5, color: 'accent' })),
          curves: [{ fn: 'x', color: 'ink3', dash: true, width: 1.4, domain: [-11, -3], label: 'error = tolerance', labelAt: -9.6, labelDy: 14 }] },
        caption: 'The Explore orbit’s closing error at four tolerances, against the line where they would be equal.',
      },
      choices: [
        'No: the tolerance controls each step’s local error; local errors accumulate (and grow along an orbit), so the global error can be far larger',
        'Yes: the global error should always be below rtol',
        'Yes: the error estimate must be wrong by a factor of 1000',
        'No: the closing error is round-off, which no tolerance can control',
      ],
      answer: 0,
      why: {
        1: 'No standard solver promises that; tolerances are per step.',
        2: 'The estimates are fine step by step; the excess is accumulation, which they do not measure.',
        3: 'Round-off is near 10⁻¹⁶ per operation, far below 10⁻³; this is truncation error, accumulated.',
      },
      hints: ['What does err ≤ 1 constrain: one step, or the whole run?', 'How many steps does one period take, and what happens to an early error in an orbit’s phase?'],
      teach: 'An adaptive tolerance is local: it keeps each step’s error near tol·|y|, and the global error is whatever those errors add up to — measure it by tightening the tolerance.',
      explain: t`Closing errors at tolerances $10^{-4}$ to $10^{-10}$: $${RUNS.map((R) => tex(R.err, 2)).join(',\\ ')}$. They fall steadily as the tolerance tightens — the solver converges — but sit two to three orders above it. An along-track (phase) error, once made, is never undone. To get a global accuracy, tighten until the answer stops changing.`,
    }),
    code({
      id: 'heun-euler', difficulty: 3,
      prompt: t`Build the smallest embedded pair: Euler ($y_E = y + hk_1$) and Heun ($y_H = y + \tfrac{h}{2}(k_1 + k_2)$, $k_2 = f(t+h, y_E)$) share $k_1$, and $\text{err} = \max\lvert y_H - y_E\rvert$. Write \`adapt(f, t0, y0, T, tol)\`: accept when $\text{err} \le \text{tol}$ (keeping $y_H$), and set $h \leftarrow h\cdot\min(5, \max(0.2, 0.9\sqrt{\text{tol}/\text{err}}))$ either way (never past $T$). Return \`(y, steps)\`. The program runs one period of the $e = 0.9$ orbit at \`tol = 1e-5\`.`,
      starter: t`import numpy as np

def kepler(t, s):
    r3 = np.hypot(s[0], s[1])**3
    return np.array([s[2], s[3], -s[0] / r3, -s[1] / r3])

def adapt(f, t0, y0, T, tol):
    t, y, h, steps = t0, np.array(y0, dtype=float), T / 100, 0
    while t < t0 + T - 1e-12:
        h = min(h, t0 + T - t)
        # k1, Euler, k2, Heun, err; accept or not; new h
        break
    return y, steps

e = 0.9
y0 = [1 - e, 0.0, 0.0, np.sqrt((1 + e) / (1 - e))]
y, steps = adapt(kepler, 0.0, y0, 2 * np.pi, 1e-5)
close_err = np.hypot(y[0] - y0[0], y[1] - y0[1])
print(steps, close_err)
`,
      answer: t`import numpy as np

def kepler(t, s):
    r3 = np.hypot(s[0], s[1])**3
    return np.array([s[2], s[3], -s[0] / r3, -s[1] / r3])

def adapt(f, t0, y0, T, tol):
    t, y, h, steps = t0, np.array(y0, dtype=float), T / 100, 0
    while t < t0 + T - 1e-12:
        h = min(h, t0 + T - t)
        k1 = f(t, y)
        yE = y + h * k1
        k2 = f(t + h, yE)
        yH = y + h / 2 * (k1 + k2)
        err = np.max(np.abs(yH - yE))
        fac = min(5.0, max(0.2, 0.9 * np.sqrt(tol / max(err, 1e-300))))
        if err <= tol:
            t, y, steps = t + h, yH, steps + 1
        h *= fac if err <= tol else min(1.0, fac)
    return y, steps

e = 0.9
y0 = [1 - e, 0.0, 0.0, np.sqrt((1 + e) / (1 - e))]
y, steps = adapt(kepler, 0.0, y0, 2 * np.pi, 1e-5)
close_err = np.hypot(y[0] - y0[0], y[1] - y0[1])
print(steps, close_err)`,
      tests: [
        { name: t`$y' = -y$ to $t = 1$ at tol $10^{-6}$ is within $10^{-4}$ of $e^{-1}$`, code: 'abs(adapt(lambda t, y: -y, 0.0, [1.0], 1.0, 1e-6)[0][0] - np.exp(-1)) < 1e-4' },
        { name: 'the orbit closes to within 0.005', code: 'close_err < 5e-3' },
        { name: t`in fewer than 6000 steps (a fixed Heun step small enough for periapsis would need far more)`, code: '1000 < steps < 6000' },
      ],
      hints: ['k1 = f(t, y); yE = y + h·k1; k2 = f(t + h, yE); yH = y + h/2·(k1 + k2); err = max |yH − yE|.', 'If err ≤ tol: advance t, keep yH, count the step. Then multiply h by the clamped factor (on a rejection, never grow it).'],
      teach: 'Any two methods that share stages and differ in order make an error estimate; the controller’s exponent is 1/(lower order + 1).',
      explain: t`It takes about $${HE.steps}$ steps (with $${HE.rejects}$ rejections) and closes to $${tex(close(HE.y), 2)}$ — a hundred times the tolerance, for the reason of the last problem. The estimate measures Euler’s local error ($\propto h^2$, hence the square root), while the method keeps Heun’s more accurate result. Dormand–Prince does the same one level up, which is why it needs about ${Math.round(HE.steps / RUNS[0].steps)} times fewer steps for a similar result.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-comet', difficulty: 3, transfer: true,
      gen(r) {
        const [name, rp, ra] = r.pick([['Halley’s comet', 0.586, 35.1], ['Comet Encke', 0.336, 4.09], ['a Molniya satellite', 7.0e3, 46.3e3], ['a geostationary transfer orbit', 6.57e3, 42.16e3]]);
        const ans = (ra / rp) ** 1.5;
        const unit = rp > 100 ? 'km' : 'AU';
        return {
          prompt: t`For ${name}, periapsis is at $${rp > 100 ? (rp / 1e3).toFixed(2) + '\\times10^3' : rp}$ ${unit} and apoapsis at $${ra > 100 ? (ra / 1e3).toFixed(2) + '\\times10^3' : ra}$ ${unit} from the central body’s centre. An adaptive solver’s steps follow $r^{3/2}$. About how many times longer is its step at apoapsis than at periapsis?`,
          visual: {
            type: 'graph',
            params: { x: [-1.15, 0.2], y: [-0.4, 0.4], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x / (rₐ + rₚ)', ylabel: '', yticks: 0, xticks: 0,
              curves: [{ param: [`(cos(t) - ${n12((ra - rp) / (ra + rp))})/2`, `${n12(Math.sqrt(rp * ra) / (ra + rp))}*sin(t)`], t: [0, 2 * Math.PI], color: 'accent', width: 2 }],
              points: [{ x: 0, y: 0, r: 5, color: 'gold' }] },
            caption: 'The orbit drawn to scale, the central body at the focus (gold).',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ra / rp, feedback: 'The step follows the time scale √(r³/GM), so the ratio is (rₐ/rₚ)^{3/2}.' }],
          hints: ['Step ∝ r^{3/2}.', t`$(r_a/r_p)^{3/2}$ with $r_a/r_p = ${(ra / rp).toFixed(3)}$.`],
          teach: 'The more eccentric the orbit, the more an adaptive step pays: the step range is (rₐ/rₚ)^{3/2}.',
          explain: t`$(${(ra / rp).toFixed(3)})^{3/2} = ${ans.toFixed(0)}$. A fixed step small enough for periapsis would waste nearly all its effort on the slow, distant part of the orbit.`,
        };
      },
    }),
    num({
      id: 'cp-retry', difficulty: 2,
      gen(r) {
        const h = r.pick([0.5, 1, 2, 5]), err = r.pick([1.4, 3.7, 9.5]);
        const ans = h * Math.max(0.2, 0.9 * err ** -0.2);
        return {
          prompt: t`A re-entry trajectory code using Dormand–Prince tries a step of $${h}$ s through the peak-deceleration phase and gets $\text{err} = ${err}$. With $h_{\text{new}} = h\cdot\max(0.2,\ 0.9\,\text{err}^{-1/5})$, what step does it retry with?`,
          visual: {
            type: 'graph',
            params: { x: [0, 10.5], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'err', ylabel: 'h(new)/h',
              curves: [{ fn: 'max(0.2, 0.9*x^(-0.2))', color: 'accent', width: 2.2, domain: [1, 10.5] }], vlines: [{ x: 1, color: 'bad' }] },
            caption: 'The retry factor for rejected steps (err > 1), with its lower limit of 0.2.',
          },
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: h / 2, feedback: 'Solvers do not simply halve; the factor comes from the error estimate.' }, { value: h * 0.9 * err ** 0.2, feedback: 'The exponent is −1/5: a larger error must shrink the step.' }],
          hints: ['err > 1: reject and retry.', t`$0.9\times${err}^{-1/5} = ${(0.9 * err ** -0.2).toFixed(4)}$.`],
          teach: 'A rejected step is retried with the step the controller predicts would just meet the tolerance, shrunk a little more by the safety factor.',
          explain: t`$${h}\times${(0.9 * err ** -0.2).toFixed(4)} = ${tex(ans, 4)}$ s. Through the deceleration pulse the step stays short; on the ballistic arc before it, it can be hundreds of times longer.`,
        };
      },
    }),
    num({
      id: 'cp-order', difficulty: 3,
      gen(r) {
        const [k, p] = r.pick([[5, 5], [8, 8], [4, 4], [10, 5]]);
        const ratio = 10 ** (k / p);
        const R = +ratio.toFixed(1);
        return {
          prompt: t`Tightening an adaptive solver’s tolerance by a factor $10^{${k}}$ multiplies its number of steps by $${R}$. If its local error scales like $h^{q}$, what is $q$?`,
          visual: {
            type: 'graph',
            params: { x: [-0.5, k + 0.5], y: [-0.2, lg(R) + 0.4], aspect: 'wide', axesAt: 'edge', xlabel: 'log₁₀(tolerance factor)', ylabel: 'log₁₀(step ratio)',
              curves: [{ fn: `x*${n12(lg(R) / k)}`, color: 'accent', width: 2, domain: [0, k] }], points: [{ x: k, y: n12(lg(R)), r: 5, color: 'accent' }] },
            caption: 'Steps against tolerance on log axes: the slope is 1/q.',
          },
          answer: k / lg(R), tol: { rel: 0.02 },
          errors: [{ value: lg(R) / k, feedback: 'That is the slope 1/q. Invert it.' }],
          hints: [t`$h \propto \text{tol}^{1/q}$, so steps $\propto \text{tol}^{-1/q}$.`, t`$q = ${k}/\log_{10}${R}$.`],
          teach: 'How the cost of an adaptive run grows with tolerance reveals the order of the method inside it.',
          explain: t`$q = ${k}/\log_{10}${R} = ${(k / lg(R)).toFixed(2)}$, so the error estimate is that of an order-$${Math.round(k / lg(R)) - 1}$ solution.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Dormand & Prince (1980), A family of embedded Runge–Kutta formulae, J. Comput. Appl. Math. 6, 19', url: 'https://doi.org/10.1016/0771-050X(80)90013-3' },
    { label: 'Hairer, Nørsett & Wanner, Solving ODEs I (Springer 1993), §II.4: automatic step size control', url: 'https://doi.org/10.1007/978-3-540-78862-1' },
    { label: 'SciPy documentation: scipy.integrate.solve_ivp (RK45)', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.solve_ivp.html' },
  ],
});
