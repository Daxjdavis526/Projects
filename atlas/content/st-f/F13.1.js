// Measuring the order of convergence without an exact solution — self-
// convergence: with runs at h, h/2, h/4, Q = (u_h − u_{h/2})/(u_{h/2} − u_{h/4})
// → 2ᵖ; ratios other than 2 (p = ln Q / ln r); the asymptotic range (a forced,
// damped pendulum: RK4 measures 4.45, 4.32, 4.20 … → 4, Euler wanders before
// settling); and the bugs a convergence test catches — RK4 with every stage
// at the step's start time measures order 1; runs whose final times differ by
// a fraction of a step measure order 1 whatever the method; a thrust cut-off
// inside a step makes the errors erratic. The convergence test is how codes
// in numerical relativity are trusted (Choptuik 1991). F9.1 measured orders
// against exact solutions; this lesson needs none.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { TABLEAU, rkStep, n12, lg } from './_ode.js';

const t = String.raw;

// ── a forced, damped pendulum to t = 10 ──
const TF = 10;
const F = (tt, y) => [y[1], -Math.sin(y[0]) - 0.2 * y[1] + 0.9 * Math.cos(0.7 * tt)];
const BUG = { A: TABLEAU.rk4.A, b: TABLEAU.rk4.b, c: [0, 0, 0, 0] };   // every stage evaluated at the step’s start time
const run = (tab, h, n) => { let y = [0.3, 0]; for (let i = 0; i < n; i++) y = rkStep(tab, F, i * h, y, h); return y[0]; };
const NS = Array.from({ length: 9 }, (_, k) => 25 * 2 ** k);
const CASES = [
  { key: 1, label: 'RK4', u: NS.map((n) => run(TABLEAU.rk4, TF / n, n)), hs: NS.map((n) => TF / n) },
  { key: 2, label: 'RK4 with a bug', u: NS.map((n) => run(BUG, TF / n, n)), hs: NS.map((n) => TF / n) },
  { key: 3, label: 'Heun', u: NS.map((n) => run(TABLEAU.heun, TF / n, n)), hs: NS.map((n) => TF / n) },
  { key: 4, label: 'Euler', u: NS.map((n) => run(TABLEAU.euler, TF / n, n)), hs: NS.map((n) => TF / n) },
  { key: 5, label: 'RK4, h = 0.3/2ᵏ', u: NS.map((_, k) => { const h = 0.3 / 2 ** k; return run(TABLEAU.rk4, h, Math.round(TF / h)); }), hs: NS.map((_, k) => 0.3 / 2 ** k) },
].map((C) => {
  const d = C.u.slice(1).map((v, i) => Math.abs(C.u[i] - v));
  const p = d.slice(1).map((v, i) => Math.log2(d[i] / v));
  return { ...C, d, p };
});
const wh = (k) => `step(0.5 - abs(cs - ${k}))`;
const R4 = CASES[0], BG = CASES[1], MIS = CASES[4];
// the worked example: n = 100, 200, 400
const U = [2, 3, 4].map((k) => R4.u[k]), Q = (U[0] - U[1]) / (U[1] - U[2]), PW = Math.log2(Q), EST = Math.abs(U[1] - U[2]) / (2 ** 4 - 1);
const REF = R4.u[8];

export default lesson({
  id: 'st-f.F13.1',
  title: 'Measuring the order of convergence',
  minutes: 14, difficulty: 3,
  intro: t`A real simulation has no exact solution to compare with. It can still be tested: run it at three resolutions $h$, $h/2$, $h/4$ and compare the answers **with each other**. If the error behaves like $Ch^p$, the differences between successive runs shrink by $2^p$:

$$Q = \frac{u_h - u_{h/2}}{u_{h/2} - u_{h/4}} \approx 2^p, \qquad p = \log_2 Q$$

This **self-convergence test** checks two things at once: that the code converges at all, and that it converges at the order the method promises. A fourth-order method that measures $p = 1$ has a bug, however plausible its plots look. Two cautions: the runs must end at **exactly** the same time, and $h$ must be small enough to be in the **asymptotic range**, where the $Ch^p$ term dominates.`,
  symbols: [
    { tex: 'u_h', text: 'the computed quantity of interest (a final position, an orbit’s phase, a peak temperature) from a run with step $h$' },
    { tex: 'Q', text: 'the **convergence factor**: the ratio of successive differences between resolutions' },
    { tex: 'p', text: 'the observed order. It should approach the method’s order as $h \\to 0$' },
    { tex: 'C', text: 'the unknown error constant in $u_h - u \\approx Ch^p$; it cancels in $Q$' },
  ],
  why: 'A convergence test is the standard of evidence for every simulation result — numerical-relativity waveforms, CFD drag coefficients, trajectory codes — and the quickest bug detector there is: most coding mistakes in a solver show up first as the wrong order.',
  visual: {
    type: 'graph',
    title: 'Five codes, one convergence test',
    lead: t`A forced, damped pendulum $\theta'' = -\sin\theta - 0.2\theta' + 0.9\cos0.7t$, integrated to $t = 10$ from $\theta = 0.3$. Each dot is the difference $\lvert u_h - u_{h/2}\rvert$ between runs at successive step sizes, on log–log axes: its slope is the observed order. No exact solution is used anywhere.`,
    tasks: [
      `RK4: the slope is 4 — the observed orders run ${R4.p.slice(0, 4).map((x) => x.toFixed(2)).join(', ')} … approaching 4 from above as h enters the asymptotic range.`,
      `“RK4 with a bug” evaluates every stage at the start of the step. It looks reasonable, but its slope is 1 (${BG.p[6].toFixed(2)} at the finest steps).`,
      `“RK4, h = 0.3/2ᵏ”: 10 is not a multiple of h, so the runs end at slightly different times. The test reports order ${MIS.p[1].toFixed(2)} — a correct method failing a mismatched test. Euler shows a pre-asymptotic wander before it settles at 1.`,
    ],
    params: {
      x: [-3.0, 0.1], y: [-14.5, 0.6], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|u(h) − u(h/2)|',
      choices: [{ key: 'cs', label: 'Code', options: CASES.map((C) => [C.key, C.label]), value: 1, explain: 'The bug: all four RK4 stages use the time at the start of the step. The last: steps that do not divide the interval.' }],
      points: CASES.flatMap((C) => C.d.map((d, i) => ({ x: n12(lg(C.hs[i])), y: n12(lg(Math.max(d, 1e-15))), r: 4.5, color: C.key === 1 ? 'accent' : C.key === 2 || C.key === 5 ? 'bad' : 'gold', when: wh(C.key) }))),
      curves: [{ fn: '-1.6 + 4*(x + 0.5)', color: 'ink4', width: 1.2, dash: true, domain: [-3, 0.1], label: 'slope 4', labelAt: -2.2, labelDx: 6 }, { fn: '-0.6 + (x + 0.5)', color: 'ink4', width: 1.2, dash: true, domain: [-3, 0.1], label: 'slope 1', labelAt: -2.6, labelDy: 14 }],
      readouts: [{ label: 'observed order, finest three runs', expr: CASES.map((C) => `${wh(C.key)}*${n12(C.p[C.p.length - 1])}`).join(' + '), digits: 3 }],
    },
    caption: 'Exact float64 runs at nine step sizes (h = 0.4 down to 0.4/256). Differences below 10⁻¹⁵ would be round-off. Grey dashed lines are reference slopes, not fits.',
  },
  example: {
    prompt: t`Run the forced pendulum with RK4 at $n = 100, 200, 400$ steps to $t = 10$ and test its convergence without an exact solution. Estimate the error of the best run.`,
    visual: {
      type: 'graph',
      params: { x: [-2.2, -0.75], y: [-8.5, -3.8], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|difference|',
        points: [{ x: n12(lg(0.1)), y: n12(lg(Math.abs(U[0] - U[1]))), r: 6, color: 'accent', label: 'u(0.1) − u(0.05)', labelDx: -12, labelAlign: 'right' }, { x: n12(lg(0.05)), y: n12(lg(Math.abs(U[1] - U[2]))), r: 6, color: 'accent', label: 'u(0.05) − u(0.025)', labelDx: -12, labelAlign: 'right' }],
        curves: [{ fn: `${n12(lg(Math.abs(U[0] - U[1])))} + 4*(x - ${n12(lg(0.1))})`, color: 'ink3', width: 1.4, dash: true, domain: [-2.2, -0.75] }] },
      caption: 'The two differences on log–log axes, with a slope-4 line through the first.',
    },
    steps: [
      { label: 'Three runs', text: t`$u_{0.1} = ${U[0].toFixed(10)}$, $u_{0.05} = ${U[1].toFixed(10)}$, $u_{0.025} = ${U[2].toFixed(10)}$ (the angle at $t = 10$, in radians). Each run ends at exactly $t = 10$.` },
      { label: 'Differences', text: t`$u_{0.1} - u_{0.05} = ${tex(U[0] - U[1], 3)}$ and $u_{0.05} - u_{0.025} = ${tex(U[1] - U[2], 3)}$. Same sign — the errors approach the limit from one side, as $Ch^p$ predicts.` },
      { label: 'Order', text: t`$Q = ${Q.toFixed(2)}$, so $p = \log_2 Q = ${PW.toFixed(3)}$: close to 4, slightly above — the next term in the error expansion still contributes at these steps. Going finer, the observed orders are $${R4.p.slice(3, 7).map((x) => x.toFixed(3)).join(',\\ ')}$: settling towards 4.` },
      { label: 'Error estimate', text: t`In the asymptotic range $u_{0.025} - u \approx (u_{0.05} - u_{0.025})/(2^4 - 1) = ${tex(EST, 2)}$. Check against a run with $n = 6400$: the true error of $u_{0.025}$ is $${tex(Math.abs(U[2] - REF), 2)}$. The difference itself estimates the error — the idea of [Richardson extrapolation](#/lesson/st-f.F13.2).` },
      { label: 'A bug it catches', text: t`Evaluate all four stages at the start time $t_n$ instead of $t_n + c_ih$ — an easy slip, invisible on an autonomous problem. On this forced pendulum the same test gives $p = ${BG.p.slice(2, 5).map((x) => x.toFixed(2)).join(',\\ ')}$: first order. The plots look fine; the order does not.` },
    ],
    answer: t`$Q = ${Q.toFixed(2)}$, $p = ${PW.toFixed(2)} \approx 4$; the finest run’s error is about $${tex(EST, 1)}$ (true: $${tex(Math.abs(U[2] - REF), 1)}$).`,
  },
  practice: [
    num({
      id: 'p-from-q', difficulty: 1,
      gen(r) {
        const Qv = r.pick([3.9, 4.1, 7.6, 8.3, 15.2, 16.8, 31]), ans = Math.log2(Qv);
        return {
          prompt: t`Runs at $h$, $h/2$ and $h/4$ give a convergence factor $Q = ${Qv}$. What is the observed order?`,
          visual: {
            type: 'graph',
            params: { x: [0, 5.5], y: [0, 36], aspect: 'wide', axesAt: 'edge', xlabel: 'order p', ylabel: 'Q = 2ᵖ',
              curves: [{ fn: '2^x', color: 'accent', width: 2.2 }], hlines: [{ y: Qv, color: 'gold', label: `Q = ${Qv}` }] },
            caption: 'Q = 2ᵖ for a halving refinement.',
          },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: Qv / 2, feedback: 'Q = 2ᵖ, not 2p: take log₂.' }, { value: Math.sqrt(Qv), feedback: 'Q = 2ᵖ, so p = log₂Q, not √Q.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$Q = 2^p$.`, t`$p = \log_2 ${Qv} = \ln ${Qv}/\ln 2$.`],
          teach: 'With halving steps the convergence factor is 2ᵖ: 4, 8, 16 for orders 2, 3, 4.',
          explain: t`$p = \log_2 ${Qv} = ${ans.toFixed(2)}$ — consistent with order ${Math.round(ans)}.`,
        };
      },
    }),
    num({
      id: 'ratio-r', difficulty: 2,
      gen(r) {
        const rr = r.pick([1.5, Math.SQRT2, 1.25]), p = r.pick([1, 2]), noise = r.pick([0.97, 1.02, 1.05]);
        const Qv = +(rr ** p * noise).toFixed(3), ans = Math.log(Qv) / Math.log(rr);
        const rt = rr === Math.SQRT2 ? t`\sqrt2` : String(rr);
        return {
          prompt: t`A CFD grid study refines the mesh by a ratio $r = ${rt}$ each time (coarse, medium, fine). The drag coefficients give $Q = (C_{\text{coarse}} - C_{\text{medium}})/(C_{\text{medium}} - C_{\text{fine}}) = ${Qv}$. What is the observed order?`,
          visual: {
            type: 'graph',
            params: { x: [-0.05, 1.3], y: [-0.4, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'cell size (fine = 1/r²)', ylabel: '', yticks: 0, xticks: 0,
              points: [1, 1 / rr, 1 / (rr * rr)].map((hh, i) => ({ x: n12(hh), y: n12(hh ** p * 0.8), r: 5.5, color: 'accent', label: ['coarse', 'medium', 'fine'][i], labelDy: -14 })) },
            caption: 'Three grids refined by a constant ratio; the quantity approaches its limit as the cells shrink (schematic).',
          },
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: Math.log2(Qv), feedback: 'The refinement ratio is not 2: divide ln Q by ln r.' }],
          hints: [t`Generally $Q = r^p$.`, t`$p = \ln Q/\ln r = \ln ${Qv}/\ln ${rr.toFixed(4)}$.`],
          teach: 'For any constant refinement ratio r, Q = rᵖ: p = ln Q / ln r.',
          explain: t`$p = \ln ${Qv}/\ln ${rr.toFixed(4)} = ${ans.toFixed(2)}$, near the scheme’s formal order ${p}. CFD often refines by 1.5 or $\sqrt2$ because doubling in 3D costs eight times the cells.`,
        };
      },
    }),
    mcq({
      id: 'mismatch', difficulty: 2,
      prompt: t`A student tests an RK4 code with steps $h = 0.3, 0.15, 0.075$ to “$t = 10$”, taking \`round(10/h)\` steps each time. The observed order comes out near 1. What is wrong?`,
      visual: {
        type: 'graph',
        params: { x: [9.85, 10.1], y: [-0.5, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 't (final time actually reached)', ylabel: '', yticks: 0,
          points: [0.3, 0.15, 0.075].map((h, i) => ({ x: n12(Math.round(10 / h) * h), y: 0.5, r: 6, color: ['accent', 'gold', 'bad'][i], label: `h = ${h}`, labelDy: -14 })), vlines: [{ x: 10, color: 'ink3', label: 't = 10' }] },
        caption: 'Where each run actually stops.',
      },
      choices: [
        t`The runs stop at $t = 9.9$, $10.05$ and $9.975$: they compare different times, and that mismatch (of order $h$) swamps RK4’s tiny error`,
        'RK4 is only first order for nonlinear problems',
        'Rounding the number of steps adds round-off error',
        'Three runs are not enough to measure an order',
      ],
      answer: 0,
      why: {
        1: 'RK4 is fourth order for any smooth problem; the code is fine.',
        2: 'Rounding the step count changes where the run ends — a truncation, not round-off, effect, and of order h.',
        3: 'Three runs are exactly what the test needs; the trouble is what they compute.',
      },
      hints: ['Compute round(10/h)·h for each h.', 'If the final times differ by an amount proportional to h, what order does the difference look like?'],
      teach: 'A convergence test must compare the same quantity: identical final times (and positions), or the mismatch, not the method, sets the measured order.',
      explain: t`$\mathrm{round}(10/0.3) = 33$ steps reach $t = 9.9$; the others $10.05$ and $9.975$. The differences between runs are dominated by $\theta'$ times that offset — first order in $h$. The Explore’s last code shows it: order $${MIS.p[1].toFixed(2)}$. Choose steps that divide the interval exactly.`,
    }),
    num({
      id: 'error-estimate', difficulty: 2,
      gen(r) {
        const p = r.pick([2, 4]), d = r.pick([3.2e-5, 8e-7, 4.5e-4]), ans = d / (2 ** p - 1);
        return {
          prompt: t`A code of verified order $p = ${p}$ gives $u_{h/2} - u_{h/4} = ${tex(d, 2)}$. Estimate the error remaining in $u_{h/4}$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.1], y: [-0.2, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'h (relative)', ylabel: 'u', yticks: 0,
              curves: [{ fn: `x^${p}`, color: 'ink3', width: 1.6, dash: true }], hlines: [{ y: 0, color: 'gold', label: 'limit (unknown)' }],
              points: [1, 0.5, 0.25].map((hh) => ({ x: hh, y: n12(hh ** p), r: 5, color: 'accent' })) },
            caption: 'Runs approaching the limit like hᵖ (schematic): each gap is 2ᵖ times the next.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: d, feedback: 'The difference overestimates the error: the remaining error is the difference divided by 2ᵖ − 1.' }, { value: d / 2 ** p, feedback: 'That is the next difference. The whole remaining error sums all future differences: divide by 2ᵖ − 1.' }],
          hints: [t`$u_{h/2} - u = 2^p(u_{h/4} - u)$; subtract.`, t`$u_{h/4} - u \approx (u_{h/2} - u_{h/4})/(2^p - 1)$.`],
          teach: 'Once the order is verified, the last difference divided by 2ᵖ − 1 estimates the error of the best run.',
          explain: t`$${tex(d, 2)}/${2 ** p - 1} = ${tex(ans, 3)}$. Adding it to $u_{h/4}$ is Richardson extrapolation ([next lesson](#/lesson/st-f.F13.2)).`,
        };
      },
    }),
    mcq({
      id: 'find-bug', difficulty: 3,
      prompt: t`Your RK4 code measures order 4 on $y' = -y$ but order 1 on the forced pendulum $\theta'' = -\sin\theta - 0.2\theta' + 0.9\cos 0.7t$. Which bug fits?`,
      visual: {
        type: 'graph',
        params: { x: [-3.0, 0.1], y: [-14.5, 0.6], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h', ylabel: '|u(h) − u(h/2)|',
          points: [...R4.d.map((d, i) => ({ x: n12(lg(R4.hs[i])), y: n12(lg(d)), r: 4.5, color: 'accent' })), ...BG.d.map((d, i) => ({ x: n12(lg(BG.hs[i])), y: n12(lg(d)), r: 4.5, color: 'bad' }))],
          legend: [{ label: 'correct RK4', color: 'accent', point: true }, { label: 'your code', color: 'bad', point: true }], legendAt: 'br' },
        caption: 'Self-convergence differences on the forced pendulum.',
      },
      choices: [
        t`The stages are evaluated at the wrong times (e.g. all at $t_n$): harmless when $f$ does not depend on $t$, first order when it does`,
        'A wrong weight, such as b = (1/6, 1/6, 1/3, 1/3)',
        'Using float32 instead of float64',
        'The pendulum is chaotic, so no method converges',
      ],
      answer: 0,
      why: {
        1: 'Wrong weights break consistency on every problem, y′ = −y included.',
        2: 'Precision would show as a floor at small h, not a slope of 1 throughout.',
        3: 'Chaos limits how long accuracy lasts, not the order at a fixed time; the correct RK4 converges at order 4.',
      },
      hints: ['What is different about the two test problems?', 'y′ = −y has no explicit t; the pendulum’s forcing does.'],
      teach: 'Test on a problem that exercises every part of the code: an autonomous test cannot see bugs in the time argument.',
      explain: t`With $c = (0, 0, 0, 0)$ the forcing is sampled only at the step’s start, so the method integrates $\cos0.7t$ like a Riemann sum — first order. A good test suite includes a non-autonomous problem, a system, and a long run.`,
    }),
    code({
      id: 'self-conv', difficulty: 3,
      prompt: t`Write \`observed_order(n)\` that runs the forced pendulum with RK4 at $n$, $2n$ and $4n$ steps to $t = 10$ (from $\theta = 0.3$, $\theta' = 0$) and returns $\log_2 Q$ for the final angle. The provided \`rk4\` takes one step.`,
      starter: t`import numpy as np

def f(t, y):
    return np.array([y[1], -np.sin(y[0]) - 0.2 * y[1] + 0.9 * np.cos(0.7 * t)])

def rk4(t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def final_angle(n):
    h, y = 10.0 / n, np.array([0.3, 0.0])
    for i in range(n):
        y = rk4(i * h, y, h)
    return y[0]

def observed_order(n):
    return 0.0

print(observed_order(100), observed_order(200))
`,
      answer: t`import numpy as np

def f(t, y):
    return np.array([y[1], -np.sin(y[0]) - 0.2 * y[1] + 0.9 * np.cos(0.7 * t)])

def rk4(t, y, h):
    k1 = f(t, y)
    k2 = f(t + h / 2, y + h / 2 * k1)
    k3 = f(t + h / 2, y + h / 2 * k2)
    k4 = f(t + h, y + h * k3)
    return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)

def final_angle(n):
    h, y = 10.0 / n, np.array([0.3, 0.0])
    for i in range(n):
        y = rk4(i * h, y, h)
    return y[0]

def observed_order(n):
    a, b, c = final_angle(n), final_angle(2 * n), final_angle(4 * n)
    return np.log2((a - b) / (b - c))

print(observed_order(100), observed_order(200))`,
      tests: [
        { name: t`at $n = 100$ the observed order is about 4.1`, code: `abs(observed_order(100) - ${R4.p[2].toFixed(3)}) < 0.02` },
        { name: t`at $n = 200$ it is closer to 4`, code: 'abs(observed_order(200) - 4) < abs(observed_order(100) - 4)' },
      ],
      hints: ['Compute a = final_angle(n), b = final_angle(2n), c = final_angle(4n).', 'Return log₂((a − b)/(b − c)).'],
      teach: 'A self-convergence test is three runs and one logarithm — cheap enough to run on every change to a solver.',
      explain: t`$${R4.p[2].toFixed(3)}$ at $n = 100$ and $${R4.p[3].toFixed(3)}$ at $n = 200$: approaching 4. Put this in a test suite and a broken stage time fails it at once.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nr', difficulty: 3, transfer: true,
      gen(r) {
        const rr = r.pick([1.25, 1.5]), p = r.pick([4, 6, 8]), base = r.pick([0.8, 0.3, 0.12]);
        const d1 = base, d2 = base / rr ** p * r.pick([1.04, 0.97]), Qv = d1 / d2, ans = Math.log(Qv) / Math.log(rr);
        return {
          prompt: t`A binary-black-hole simulation is run at three resolutions, each with $${rr}$ times more points per dimension. The gravitational-wave phase at merger differs by $${d1}$ rad between low and medium, and by $${tex(d2, 3)}$ rad between medium and high. What convergence order does that indicate?`,
          visual: {
            type: 'graph',
            params: { x: [0, 10], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 't (arbitrary)', ylabel: 'h₊', yticks: 0,
              curves: [{ fn: '0.15*exp(0.25x)*sin(0.12*x^2 + 2x)*step(9.6 - x)', color: 'accent', width: 1.8, samples: 2000 }] },
            caption: 'Schematic chirp waveform; the convergence test compares the phase at the same moment across resolutions.',
          },
          answer: ans, tol: { rel: 0, abs: 0.1 },
          errors: [{ value: Math.log2(Qv), feedback: 'The refinement ratio is not 2: p = ln Q / ln r.' }],
          hints: [t`$Q = ${d1}/${tex(d2, 3)} = ${Qv.toFixed(2)}$.`, t`$p = \ln Q/\ln ${rr}$.`],
          teach: 'Numerical-relativity results are trusted because their differences between resolutions converge at the order of the method.',
          explain: t`$Q = ${Qv.toFixed(2)}$ and $p = \ln Q/\ln ${rr} = ${ans.toFixed(2)}$, consistent with a scheme of order ${p}. The same differences give an error estimate for the waveform used in LIGO template banks.`,
        };
      },
    }),
    mcq({
      id: 'cp-burnout', difficulty: 3, transfer: true,
      prompt: t`A trajectory code integrates $v' = F(t)/m - g$ with RK4, where the thrust $F$ drops to zero at burnout, $t = 1.37$ s, which falls inside a step. Its errors at $n = 40, 80, 160, 320$ steps do not form a clean line on a log–log plot. Why, and what fixes it?`,
      visual: {
        type: 'graph',
        params: { x: [0, 3], y: [-12, 25], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'acceleration (m/s²)',
          curves: [{ fn: '30*step(1.37 - x) - 9.81', color: 'accent', width: 2.2, samples: 3000 }], vlines: [{ x: 1.37, color: 'bad', label: 'burnout' }] },
        caption: 'The acceleration jumps at burnout. RK4’s error analysis assumes a smooth right-hand side.',
      },
      choices: [
        'RK4’s order assumes a smooth f; a jump inside a step gives an O(h) error whose size depends on where the jump falls. Stop a step exactly at burnout (an event) and restart',
        'RK4 is unstable for discontinuous forces',
        'Round-off error grows at burnout',
        'The problem is stiff after burnout',
      ],
      answer: 0,
      why: {
        1: 'The step is far inside the stability region; nothing grows.',
        2: 'Round-off is many orders of magnitude smaller than these errors.',
        3: 'After burnout v′ = −g, as gentle as an equation gets.',
      },
      hints: ['What does a Taylor expansion of F across the jump look like?', 'Where the jump lands within its step changes from run to run.'],
      teach: 'A discontinuity inside a step costs a method its order; put a step boundary on it (event location) and the order returns.',
      explain: t`The step containing burnout integrates a step function with a smooth rule, an error of order $h\times$(jump), sized by where the jump happens to fall — so the errors jump around instead of falling at slope 4. Adaptive solvers handle it with **events**: locate burnout, end the step there, restart with the new $F$.`,
    }),
    num({
      id: 'cp-constraint', difficulty: 2,
      gen(r) {
        const c1 = r.pick([4.1e-5, 2.6e-6]), p = r.pick([2, 4]), c2 = c1 / 2 ** p * r.pick([1.05, 0.95]), ans = Math.log2(c1 / c2);
        return {
          prompt: t`In a GR evolution code the Hamiltonian constraint should be zero; numerically its norm is $${tex(c1, 2)}$ at resolution $h$ and $${tex(c2, 2)}$ at $h/2$. At what order is the violation converging to zero?`,
          visual: {
            type: 'graph',
            params: { x: [-0.5, 0.2], y: [lg(c2) - 0.5, lg(c1) + 0.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'h (relative)', ylabel: 'constraint norm',
              points: [{ x: 0, y: n12(lg(c1)), r: 5, color: 'accent' }, { x: n12(lg(0.5)), y: n12(lg(c2)), r: 5, color: 'accent' }] },
            caption: 'The constraint violation at two resolutions, log–log.',
          },
          answer: ans, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: c1 / c2, feedback: 'That is the ratio; the order is its log₂.' }],
          hints: ['Here the exact value is known: zero. So the norms themselves are errors.', t`$p = \log_2(${tex(c1, 2)}/${tex(c2, 2)})$.`],
          teach: 'A constraint that should vanish is a free exact solution: its violation must converge to zero at the scheme’s order.',
          explain: t`$p = ${ans.toFixed(2)}$. A non-zero constraint is not a bug; one that fails to converge at the scheme’s order is.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Choptuik (1991), Consistency of finite-difference solutions of Einstein’s equations, Phys. Rev. D 44, 3124', url: 'https://doi.org/10.1103/PhysRevD.44.3124' },
    { label: 'Roache, Verification and Validation in Computational Science and Engineering (Hermosa 1998)', url: 'https://www.worldcat.org/title/verification-and-validation-in-computational-science-and-engineering/oclc/40981735' },
    { label: 'Celik et al. (2008), Procedure for estimation and reporting of uncertainty due to discretization in CFD applications, J. Fluids Eng. 130, 078001', url: 'https://doi.org/10.1115/1.2960953' },
  ],
});
