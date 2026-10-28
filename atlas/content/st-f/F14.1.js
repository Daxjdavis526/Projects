// The geodesic lab, level 1 — radial motion in proper time. The radial
// geodesic equation r̈ = −M/r² + L²/r³ − 3ML²/r⁴ (G = c = 1, dots d/dτ);
// for a fall from rest (L = 0) it is exactly Newton's form, solved by the
// cycloid r = (R/2)(1 + cos η), τ = √(R³/8M)(η + sin η). Euler, velocity
// Verlet and RK4 against the cycloid from R = 10M (orders 1, 2, 4 at
// τ = 30M; RK4 measures 2.4, 3.0, 3.5, 3.8 near the singularity at τ = 35M,
// where r̈ blows up); the first-order form ṙ = −√(2M/r − 2M/R) that never
// leaves its turning point; the horizon crossing as an event; the cycloid
// parameter as a regularized time (r_ηη = R/2 − r, an oscillator); and the
// coordinate time t that never reaches the horizon. Level 2 (the orbit
// equation) is F14.2, level 3 (the full geodesic equation) F14.3.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex, sig } from '../../src/core/format.js';
import { cycloid, rFall, tauHorizon, tauCrunch, fall, radialAcc, Veff, etaAt, M_SUN_S, M_SUN_M, n12, lg } from './_geo.js';

const t = String.raw;
const NB = ' ';

// ── the Explore: a fall from rest at R = 10M, runs to τ = 32M ──
const R0 = 10, T0 = 32, CY = cycloid(R0), TH0 = tauHorizon(R0), TC0 = tauCrunch(R0);
const METHODS = [[1, 'euler', 'Euler', 'bad'], [2, 'verlet', 'velocity Verlet', 'gold'], [3, 'rk4', 'RK4', 'accent']];
const STEPS = [[1, 4], [2, 2], [3, 1]];
const EXACT32 = rFall(R0, T0);
const RUNS = METHODS.flatMap(([mk, m]) => STEPS.map(([sk, h]) => {
  const f = fall(m, R0, T0, Math.round(T0 / h), { path: true });
  return { mk, sk, h, path: f.path, err: Math.abs(f.r - EXACT32) };
}));
const whenMS = (mk, sk) => `step(0.5 - abs(mth - ${mk}))*step(0.5 - abs(hh - ${sk}))`;
const cycCurve = (R, o = {}) => { const C = cycloid(R); return { param: [`${n12(C.s)}*(t + sin(t))`, `${n12(R / 2)}*(1 + cos(t))`], t: [0, Math.PI], color: 'ink3', width: 2, ...o }; };

// ── the worked example: RK4 to τ = 30M and to τ = 35M ──
const EX30 = rFall(R0, 30), EX35 = rFall(R0, 35);
const H30 = [2, 1, 0.5], E30 = H30.map((h) => Math.abs(fall('rk4', R0, 30, Math.round(30 / h)).r - EX30));
const P30 = E30.slice(1).map((e, i) => Math.log2(E30[i] / e));
const H35 = [0.5, 0.25, 0.125, 0.0625, 0.03125], E35 = H35.map((h) => Math.abs(fall('rk4', R0, 35, Math.round(35 / h)).r - EX35));
const P35 = E35.slice(1).map((e, i) => Math.log2(E35[i] / e));
const ETA30 = etaAt(R0, 30);

// ── coordinate time along the fall from R = 10M: t(η) in closed form (MTW eq. 31.10b) ──
const AQ = Math.sqrt(R0 / 2 - 1);
const tOfEta = `2*ln(abs((${n12(AQ)} + tan(t/2))/(${n12(AQ)} - tan(t/2)))) + ${n12(2 * AQ)}*(t + ${n12(R0 / 4)}*(t + sin(t)))`;
const ETA_H = Math.acos(4 / R0 - 1);

// ── the code exercise: a fall from R = 12M to τ = 40M ──
const RC = 12, TCD = 40, EXC = rFall(RC, TCD);
const ECD = [40, 80].map((n) => Math.abs(fall('rk4', RC, TCD, n).r - EXC));

export default lesson({
  id: 'st-f.F14.1',
  title: 'Level 1: radial orbits in proper time',
  minutes: 16, difficulty: 3,
  equation: t`\ddot r = -\frac{M}{r^2} + \frac{L^2}{r^3} - \frac{3ML^2}{r^4}`,
  intro: t`The geodesic lab starts with the simplest motion near a black hole: falling straight in. With $G = c = 1$, the radial part of the geodesic equation in the Schwarzschild spacetime, written in the faller’s own **proper time** $\tau$, is the equation above. For a fall from rest at $r = R$ the angular momentum $L$ is zero, and it collapses to $\ddot r = -M/r^2$ — Newton’s form exactly, but with $\tau$ the falling clock’s time and $r$ the areal radius. Its exact solution is a **cycloid**:

$$r = \tfrac{R}{2}(1 + \cos\eta), \qquad \tau = \sqrt{\tfrac{R^3}{8M}}\,(\eta + \sin\eta)$$

An exact solution is a gift to a numerical analyst: it lets you measure a code’s error directly and check that it falls at the order the method promises. The lab integrates $\ddot r = -M/r^2$ with Euler, velocity Verlet and RK4, compares each with the cycloid — and finds where the promised order stops holding.`,
  symbols: [
    { tex: 'r', text: 'the areal radius: the circumference of the sphere through the faller, divided by $2\\pi$, in units of $M$' },
    { tex: t`\tau`, text: 'proper time — what a clock riding with the faller reads — in units of $M$ (with $G = c = 1$, $1M$ of time is $GM/c^3$: $4.93\\ \\mu\\text{s}$ per solar mass)' },
    { tex: t`\ddot r`, text: 'the second derivative $d^2r/d\\tau^2$; a dot is $d/d\\tau$' },
    { tex: 'M', text: 'the black hole’s mass; with $G = c = 1$ it is also a length, $GM/c^2 = 1.477\\ \\text{km}$ per solar mass. The horizon is at $r = 2M$' },
    { tex: 'L', text: 'the conserved angular momentum per unit mass, $r^2\\dot\\varphi$; zero for a radial fall' },
    { tex: t`-3ML^2/r^4`, text: 'the term Newton does not have: an extra pull that matters only close in and makes orbits precess (level 2, [F14.2](#/lesson/st-f.F14.2))' },
  ],
  why: 'Every orbit code needs a test with a known answer; the radial fall is the one exact solution of the geodesic equation that is not trivial, and it already shows the two things a black-hole code must survive — a singularity and a coordinate that misbehaves at the horizon.',
  visual: {
    type: 'graph',
    title: 'Three integrators against the cycloid',
    lead: t`A fall from rest at $R = 10M$, integrated to $\tau = 32M$ with the step you choose. The grey curve is the exact cycloid; the dots are a method’s steps. The readout is the error $\lvert r_{\text{num}} - r_{\text{exact}}\rvert$ at $\tau = 32M$, in units of $M$. The faller crosses the horizon at $\tau = ${TH0.toFixed(2)}M$ and reaches $r = 0$ at $\tau = ${TC0.toFixed(2)}M$.`,
    tasks: [
      `Euler at h = 4M: the first step does not move at all (the velocity starts at zero), and the fall stays late by ${RUNS[0].err.toFixed(2)}M at τ = 32M.`,
      'Halve the step for each method in turn: Euler’s error halves, Verlet’s falls about fourfold, RK4’s about sixteenfold — orders 1, 2 and 4.',
      'Nothing marks the horizon in proper time: the curve passes r = 2M smoothly. The trouble lies further in, at r = 0.',
    ],
    params: {
      x: [0, 36.5], y: [0, 10.8], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)',
      choices: [
        { key: 'mth', label: 'Method', options: METHODS.map(([k, , name]) => [k, name]), value: 1, explain: 'Euler: one slope per step. Velocity Verlet: kick–drift–kick, second order. RK4: four slopes per step.' },
        { key: 'hh', label: 'Step $h$', options: STEPS.map(([k, h]) => [k, t`$${h}M$`]), value: 1, explain: 'The proper-time step, in units of $M$.' },
      ],
      curves: [cycCurve(R0, { label: 'exact (cycloid)', labelAt: 0.9 * Math.PI, labelDx: -150, labelDy: -6 })],
      hlines: [{ y: 2, color: 'bad', label: 'horizon r = 2M' }],
      points: RUNS.flatMap((R) => R.path.map(([x, y]) => ({ x: n12(x), y: n12(y), r: 4, color: METHODS[R.mk - 1][3], when: whenMS(R.mk, R.sk) }))),
      readouts: [{ label: 'error at τ = 32M', expr: RUNS.map((R) => `${whenMS(R.mk, R.sk)}*${n12(R.err)}`).join(' + '), digits: 3, unit: 'M' }],
    },
    caption: 'Exact float64 runs of r̈ = −M/r² from r = 10M at rest (G = c = 1, M = 1). Only the radial motion is drawn; the faller’s clock keeps τ. Where a coarse run lags, the dots fall short of the curve.',
  },
  example: {
    prompt: t`A body falls from rest at $R = 10M$. Integrate $\ddot r = -M/r^2$ with RK4 to $\tau = 30M$ at $h = 2M$, $1M$ and $0.5M$, measure the order of convergence against the cycloid — then repeat to $\tau = 35M$, just short of $r = 0$.`,
    visual: {
      type: 'graph',
      params: {
        x: [-1.65, 0.45], y: [-11, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (M)', ylabel: 'error in r (M)',
        points: [...H30.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(E30[i])), r: 5, color: 'accent' })), ...H35.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(E35[i])), r: 5, color: 'bad' }))],
        curves: [{ fn: `${n12(lg(E30[0]))} + 4*(x - ${n12(lg(2))})`, color: 'ink3', width: 1.3, dash: true, domain: [-1.65, 0.45], label: 'slope 4', labelAt: -0.6, labelDy: 14 }],
        legend: [{ label: 'to τ = 30M (r = 4.40M)', color: 'accent', point: true }, { label: 'to τ = 35M (r = 0.41M)', color: 'bad', point: true }], legendAt: 'br',
      },
      caption: 'RK4 errors against the exact cycloid, log–log. The dashed line has slope 4, the order RK4 promises.',
    },
    steps: [
      { label: 'The exact value', text: t`With $\sqrt{R^3/8M} = \sqrt{125} = ${CY.s.toFixed(4)}$, solve $${CY.s.toFixed(4)}(\eta + \sin\eta) = 30$ for $\eta$ — a one-line bisection ([F3.1](#/lesson/st-f.F3.1)): $\eta = ${ETA30.toFixed(6)}$, so $r(30M) = 5(1 + \cos\eta) = ${EX30.toFixed(8)}M$.` },
      { label: 'Three runs', text: t`RK4 from $(r, \dot r) = (10, 0)$ with $15$, $30$ and $60$ steps. The errors are $${tex(E30[0], 3)}$, $${tex(E30[1], 3)}$ and $${tex(E30[2], 3)}$ (in units of $M$).` },
      { label: 'The order', text: t`$\log_2$ of successive ratios: $${P30[0].toFixed(2)}$ and $${P30[1].toFixed(2)}$. The code converges at fourth order, as RK4 should; this is the test every later level builds on.` },
      { label: 'Near the singularity', text: t`To $\tau = 35M$, where $r = ${EX35.toFixed(3)}M$, the same test at $h = 0.5M$ down to $h = M/32$ measures $${P35.map((p) => p.toFixed(2)).join(',\\ ')}$. Near $r = 0$ the acceleration $M/r^2$ and all its derivatives grow without bound — $r$ falls like $(\tau_0 - \tau)^{2/3}$, where $\tau_0$ is the moment it reaches $r = 0$ — so the error constant is huge and a step counts as “small” only when it is small compared with the time left. The **asymptotic range** starts at much smaller $h$.` },
      { label: 'Sense check', text: t`The horizon is crossed at $\tau = ${TH0.toFixed(2)}M$, inside the run to $35M$, and nothing happens there: in proper time the fall is smooth through $r = 2M$. For a 10-solar-mass black hole the whole fall from $R = 10M$ (148 km) to $r = 0$ takes $${TC0.toFixed(2)}M$ $= ${(TC0 * 10 * M_SUN_S * 1e3).toFixed(2)}\ \text{ms}$ of the faller’s time.` },
    ],
    answer: t`At $\tau = 30M$: observed orders $${P30[0].toFixed(2)}$, $${P30[1].toFixed(2)}$ — fourth order. At $\tau = 35M$: $${P35[0].toFixed(1)}$ rising to $${P35[P35.length - 1].toFixed(1)}$ — the same code, outside its asymptotic range until $h$ is tiny.`,
  },
  practice: [
    mcq({
      id: 'first-order-trap', difficulty: 2,
      prompt: t`Energy conservation gives the first-order equation $\dot r = -\sqrt{2M/r - 2M/R}$ for the fall from rest at $R$. A student integrates **that** with Euler from $r = R$, and the body never moves. Why?`,
      visual: {
        type: 'graph',
        params: { x: [0, 36.5], y: [0, 10.8], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)',
          curves: [cycCurve(R0, { color: 'accent', label: 'the fall', labelAt: 2.2, labelDx: 4, labelDy: 14 }), { fn: '10', color: 'gold', width: 2.2, dash: true, label: 'r = R for ever', labelAt: 4, labelDy: -6 }] },
        caption: 'Two functions that both satisfy ṙ = −√(2M/r − 2M/R) with r(0) = R = 10M: the fall (blue) and staying put (gold).',
      },
      choices: [
        t`At $r = R$ the right-hand side is exactly zero, and the square root is not Lipschitz there: $r \equiv R$ is a solution too, and Euler picks it. Integrate the second-order form $\ddot r = -M/r^2$, which knows the body must start to fall`,
        'Euler is unstable for this equation, so the step must be reduced',
        t`Round-off in $2M/r - 2M/R$ makes the square root of a tiny negative number, which the code sets to zero`,
        'The sign is wrong: the minus sign should be a plus',
      ],
      answer: 0,
      why: {
        1: 'No step size helps: every Euler step from r = R adds h × 0.',
        2: 'At r = R the two terms are equal exactly, and the result is exactly zero, not a rounding accident; the problem is the equation, not the arithmetic.',
        3: 'With a plus sign the body would rise — but it would still not move from a starting slope of zero.',
      },
      hints: ['Evaluate the right-hand side at r = R.', 'Is the solution of ṙ = −√(…) through r = R unique? What does ṙ = 0 for ever satisfy?'],
      teach: 'Integrate the second-order equation of motion, not the first-order energy equation: at a turning point the square-root form loses the direction and even the uniqueness of the motion.',
      explain: t`$\sqrt{2M/R - 2M/R} = 0$, so every Euler step adds nothing; worse, $r(\tau) = R$ for all $\tau$ really does satisfy the first-order equation, because $\sqrt{\cdot}$ has an infinite slope at zero (no Lipschitz constant, no uniqueness). The second-order form has $\ddot r = -M/R^2 \neq 0$ at the start, so it falls. The same trap waits at every periapsis and apoapsis of an orbit, which is why the lab integrates $\ddot r$.`,
    }),
    num({
      id: 'crunch', difficulty: 1,
      gen(r) {
        const R = r.pick([6, 8, 12, 15, 20, 25]), ans = tauCrunch(R);
        return {
          prompt: t`From the cycloid $\tau = \sqrt{R^3/8M}\,(\eta + \sin\eta)$, with $r = 0$ at $\eta = \pi$: how much proper time does a fall from rest at $R = ${R}M$ take to reach $r = 0$? Give it in units of $M$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.08], y: [0, 1.08], aspect: 'wide', axesAt: 'edge', xlabel: 'τ / τ(r = 0)', ylabel: 'r / R',
              curves: [{ param: ['(t + sin(t))/pi', '(1 + cos(t))/2'], t: [0, Math.PI], color: 'accent', width: 2.2 }],
              hlines: [{ y: n12(2 / R), color: 'bad', label: 'horizon' }] },
            caption: 'Every radial fall from rest has the same shape: this curve, stretched by R and by the total fall time.',
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: tauHorizon(R), feedback: 'That is the time to the horizon, r = 2M. The question asks for r = 0, at η = π.' }, { value: Math.sqrt(R ** 3 / 8), feedback: t`At $\eta = \pi$ the bracket is $\pi + \sin\pi = \pi$: multiply by $\pi$.` }],
          hints: [t`$\eta = \pi$ gives $\eta + \sin\eta = \pi$.`, t`$\tau = \pi\sqrt{${R}^3/8}$.`],
          teach: 'The cycloid gives the exact proper time of a radial fall, the benchmark a numerical run is checked against.',
          explain: t`$\tau = \pi\sqrt{${R ** 3}/8} = ${ans.toFixed(2)}M$. It is the same number Newton gives for a fall to the centre of a point mass — in GR it is the faller’s proper time, and the horizon is passed at $${tauHorizon(R).toFixed(2)}M$ on the way.`,
        };
      },
    }),
    num({
      id: 'radial-accel', difficulty: 2,
      gen(r) {
        const L = r.pick([3.6, 3.8, 4, 4.2]), rr = r.pick([5, 6, 8, 10, 12]);
        const ans = radialAcc(L)(rr), newton = -1 / (rr * rr) + (L * L) / rr ** 3;
        return {
          prompt: t`The same radial equation handles orbits: with $L \ne 0$ it gains the centrifugal term $L^2/r^3$ and the relativistic $-3ML^2/r^4$. For $L = ${L}M$, what is $\ddot r$ at $r = ${rr}M$? (Units: $M = 1$; the answer is in $1/M$.)`,
          visual: {
            type: 'graph',
            params: { x: [2, 20], y: [0.85, 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 'r (M)', ylabel: 'V(r)',
              curves: [{ fn: `(1 - 2/x)*(1 + ${L * L}/x^2)`, color: 'gold', width: 2.2, domain: [2.05, 20] }],
              points: [{ x: rr, y: n12(Veff(rr, L)), r: 5.5, color: 'accent', label: `r = ${rr}M` }] },
            caption: 'The effective potential V(r) = (1 − 2M/r)(1 + L²/r²): ṙ² = E² − V and r̈ = −V′/2, so the slope at the point sets the acceleration.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: newton, feedback: t`That is Newton’s $-M/r^2 + L^2/r^3$. Include the relativistic term $-3ML^2/r^4$.` },
            { value: -1 / (rr * rr) - (L * L) / rr ** 3 - (3 * L * L) / rr ** 4, feedback: t`The centrifugal term pushes outward: $+L^2/r^3$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.03 * Math.abs(ans)),
          hints: [t`$-1/${rr}^2 + ${L}^2/${rr}^3 - 3\cdot${L}^2/${rr}^4$.`, t`The three terms are $${(-1 / rr ** 2).toFixed(5)}$, $${((L * L) / rr ** 3).toFixed(5)}$ and $${((-3 * L * L) / rr ** 4).toFixed(5)}$.`],
          teach: 'Level 1 handles any equatorial orbit: integrate r̈ = −M/r² + L²/r³ − 3ML²/r⁴ and φ̇ = L/r².',
          explain: t`$\ddot r = ${(-1 / rr ** 2).toFixed(5)} + ${((L * L) / rr ** 3).toFixed(5)} - ${((3 * L * L) / rr ** 4).toFixed(5)} = ${tex(ans, 3)}/M$. ${ans > 0 ? 'Positive: here the centrifugal barrier wins and the particle is pushed out.' : 'Negative: the particle is pulled in.'} Newton would give $${tex(newton, 3)}/M$; the gap is the GR term, which grows like $1/r^4$ and is why close orbits behave so differently.`,
        };
      },
    }),
    num({
      id: 'order-two-runs', difficulty: 2,
      gen(r) {
        const [m, name] = r.pick([['verlet', 'velocity Verlet'], ['rk4', 'RK4'], ['euler', 'Euler']]);
        const R = r.pick([8, 12, 16]), T = Math.round(0.85 * tauHorizon(R)), n = r.pick([40, 80]);
        const ex = rFall(R, T);
        const e1 = +sig(Math.abs(fall(m, R, T, n).r - ex), 3), e2 = +sig(Math.abs(fall(m, R, T, 2 * n).r - ex), 3);
        const ans = Math.log2(e1 / e2);
        return {
          prompt: t`A fall from rest at $R = ${R}M$ is integrated with ${name} to $\tau = ${T}M$. Against the cycloid the error in $r$ is $${tex(e1, 3)}M$ with ${n} steps and $${tex(e2, 3)}M$ with ${2 * n} steps. What order of convergence do these two runs show?`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.08 * tauCrunch(R)], y: [0, 1.08 * R], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)',
              curves: [cycCurve(R)], vlines: [{ x: T, color: 'gold', label: `τ = ${T}M` }], hlines: [{ y: 2, color: 'bad', label: 'horizon' }] },
            caption: 'The exact fall and the time at which the runs are compared.',
          },
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: e1 / e2, feedback: t`That ratio is $2^p$; the order is its $\log_2$.` }, { value: Math.log10(e1 / e2), feedback: 'The step was halved: use log₂, not log₁₀.' }].filter((e) => Math.abs(e.value - ans) > 0.05),
          hints: [t`With halved steps the error ratio is $2^p$.`, t`$p = \log_2(${tex(e1, 3)}/${tex(e2, 3)})$.`],
          teach: 'With an exact solution in hand, two runs at h and h/2 give the observed order directly: p = log₂(e(h)/e(h/2)).',
          explain: t`$p = \log_2(${tex(e1 / e2, 4)}) = ${ans.toFixed(2)}$, ${m === 'euler' ? 'close to Euler’s first order (still creeping up towards 1 as the steps shrink)' : m === 'verlet' ? 'velocity Verlet’s second order' : 'RK4’s fourth order'}. A code whose measured order differs from the method’s by more than a few hundredths in the asymptotic range has a bug.`,
        };
      },
    }),
    num({
      id: 'horizon-event', difficulty: 3,
      gen(r) {
        const R = r.pick([8, 10, 12, 16]), h = r.pick([1, 2]);
        const n = Math.ceil((1.08 * tauCrunch(R)) / h);
        const path = fall('rk4', R, n * h, n, { path: true }).path;
        const k = path.findIndex(([, rr]) => rr <= 2) - 1;
        const [ta, ra] = path[k], [tb, rb] = path[k + 1];
        const pa = +ra.toFixed(6), pb = +rb.toFixed(6);
        const ans = ta + (h * (pa - 2)) / (pa - pb), exact = tauHorizon(R);
        return {
          prompt: t`An RK4 run of a fall from rest at $R = ${R}M$ with $h = ${h}M$ has $r = ${pa.toFixed(6)}M$ at $\tau = ${ta}M$ and $r = ${pb.toFixed(6)}M$ at $\tau = ${tb}M$: the horizon was crossed inside that step. Estimate the crossing time by linear interpolation, in units of $M$.`,
          visual: {
            type: 'graph',
            params: { x: [ta - 0.4 * h, tb + 0.4 * h], y: [Math.min(pb, 2) - 0.35 * (pa - pb), pa + 0.35 * (pa - pb)], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)',
              hlines: [{ y: 2, color: 'bad', label: 'horizon r = 2M' }],
              points: [{ x: ta, y: n12(pa), r: 6, color: 'accent', label: 'step n', labelDx: 10 }, { x: tb, y: n12(pb), r: 6, color: 'accent', label: 'step n + 1', labelDx: -10, labelAlign: 'right' }] },
            caption: 'The two steps that straddle the horizon. Between them the code knows only the endpoints — unless it interpolates.',
          },
          answer: ans, tol: { rel: 0, abs: 0.002 },
          errors: [{ value: ta + h / 2, feedback: 'The midpoint of the step ignores where r actually crosses 2: weight by how far each end is from the horizon.' }, { value: ta + (h * (2 - pb)) / (pa - pb), feedback: 'That fraction measures from the far end. From step n the fraction of the step is (rₙ − 2)/(rₙ − rₙ₊₁).' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`The fraction of the step is $(r_n - 2)/(r_n - r_{n+1})$.`, t`$\tau^* = ${ta} + ${h}\times(${pa.toFixed(6)} - 2)/(${pa.toFixed(6)} - ${pb.toFixed(6)})$.`],
          teach: 'An event between steps is found by interpolating, and the interpolant’s order caps the event’s accuracy: linear interpolation is second order even when the integrator is fourth.',
          explain: t`$\tau^* = ${ans.toFixed(4)}M$. The exact crossing is $${exact.toFixed(4)}M$, so the linear estimate is off by $${tex(Math.abs(ans - exact), 2)}M$ — far more than RK4’s own error at this step, because a straight line through two points of a curve has an $O(h^2)$ error. The cure costs nothing: the code also knows $\dot r$ at both ends, and the cubic Hermite interpolant through $r$ and $\dot r$ is fourth order. (Level 2 meets the same trap when it locates periapses.)`,
        };
      },
    }),
    mcq({
      id: 'near-singularity', difficulty: 3,
      prompt: t`RK4 measured order 4 for the fall to $\tau = 30M$, but only $${P35[0].toFixed(1)}$, $${P35[1].toFixed(1)}$, $${P35[2].toFixed(1)}$ for the fall to $\tau = 35M$ (where $r = ${EX35.toFixed(2)}M$) at the same kind of steps. Which explanation and remedy are right?`,
      visual: {
        type: 'graph',
        params: { x: [-1.65, 0.45], y: [-11, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (M)', ylabel: 'error in r (M)',
          points: [...H30.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(E30[i])), r: 5, color: 'accent' })), ...H35.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(E35[i])), r: 5, color: 'bad' }))],
          legend: [{ label: 'to τ = 30M', color: 'accent', point: true }, { label: 'to τ = 35M', color: 'bad', point: true }], legendAt: 'br' },
        caption: 'The worked example’s errors, log–log: the red points bend before they settle.',
      },
      choices: [
        t`Near $r = 0$ the derivatives of $r(\tau)$ blow up, so these steps are not yet in the asymptotic range. Shrink the step where $r$ is small (adaptive steps), or change the time variable to the cycloid’s $\eta$, in which $d^2r/d\eta^2 = R/2 - r$ has no singularity at all`,
        'Round-off error: r is small, so its relative error is large',
        'The horizon at r = 2M makes the equation singular; stop the run there',
        'RK4 is unstable for attractive forces; use velocity Verlet',
      ],
      answer: 0,
      why: {
        1: 'The errors are 10⁻² to 10⁻⁶ M, ten orders above round-off, and they do shrink with h — just not at the asymptotic rate yet.',
        2: 'Nothing in r̈ = −M/r² is special at r = 2M; the horizon is crossed at 33.7M in both runs without effect.',
        3: 'RK4 is stable here, and Verlet would show the same pre-asymptotic bend near r = 0.',
      },
      hints: ['Where is r̈ = −M/r² largest?', t`How does $r$ behave as $\tau \to \tau_0$? Try $r \propto (\tau_0 - \tau)^{2/3}$ and differentiate a few times.`],
      teach: 'A method’s order is a statement about small enough steps; near a singularity “small enough” shrinks with the time left, so use adaptive steps or a regularizing time variable.',
      explain: t`The local error of RK4 is $h^5$ times the fifth derivative of the solution, and with $r \propto (\tau_0 - \tau)^{2/3}$ every derivative grows like a power of $1/(\tau_0 - \tau)$. Measured orders creep up towards 4 only once $h$ is small compared with the time left. The cycloid suggests the cure: since $d\tau = r\sqrt{R/2M}\,d\eta$, the parameter $\eta$ slows the clock where $r$ is small, and in $\eta$ the motion is a shifted harmonic oscillator — the Kepler problem’s classic regularization.`,
    }),
    code({
      id: 'fall-order', difficulty: 3,
      prompt: t`Write \`rk4_fall(T, n)\` that integrates $\ddot r = -1/r^2$ ($M = 1$) from rest at $r = 12$ with RK4, $n$ steps to $\tau = T$, and returns $r(T)$. Then set \`order\` to the observed order from the errors at $n = 40$ and $n = 80$ for $T = 40$, using the exact \`exact_r\` provided.`,
      starter: t`import numpy as np

R = 12.0

def exact_r(tau):
    s = np.sqrt(R**3 / 8)
    lo, hi = 0.0, np.pi
    for _ in range(100):                  # bisection on tau = s (eta + sin eta)
        mid = 0.5 * (lo + hi)
        if s * (mid + np.sin(mid)) < tau:
            lo = mid
        else:
            hi = mid
    return R / 2 * (1 + np.cos(0.5 * (lo + hi)))

def rk4_fall(T, n):
    h = T / n
    r, v = R, 0.0
    # n RK4 steps of r' = v, v' = -1/r**2
    return r

e40 = abs(rk4_fall(40, 40) - exact_r(40))
e80 = abs(rk4_fall(40, 80) - exact_r(40))
order = 0.0
print(e40, e80, order)
`,
      answer: t`import numpy as np

R = 12.0

def exact_r(tau):
    s = np.sqrt(R**3 / 8)
    lo, hi = 0.0, np.pi
    for _ in range(100):                  # bisection on tau = s (eta + sin eta)
        mid = 0.5 * (lo + hi)
        if s * (mid + np.sin(mid)) < tau:
            lo = mid
        else:
            hi = mid
    return R / 2 * (1 + np.cos(0.5 * (lo + hi)))

def rk4_fall(T, n):
    h = T / n
    r, v = R, 0.0
    a = lambda r: -1 / r**2
    for _ in range(n):
        k1r, k1v = v, a(r)
        k2r, k2v = v + h / 2 * k1v, a(r + h / 2 * k1r)
        k3r, k3v = v + h / 2 * k2v, a(r + h / 2 * k2r)
        k4r, k4v = v + h * k3v, a(r + h * k3r)
        r += h / 6 * (k1r + 2 * k2r + 2 * k3r + k4r)
        v += h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v)
    return r

e40 = abs(rk4_fall(40, 40) - exact_r(40))
e80 = abs(rk4_fall(40, 80) - exact_r(40))
order = np.log2(e40 / e80)
print(e40, e80, order)`,
      tests: [
        { name: t`$r(40)$ with 80 steps is within $10^{-5}$ of the cycloid’s $${EXC.toFixed(5)}$`, code: `abs(rk4_fall(40, 80) - ${n12(EXC)}) < 1e-5` },
        { name: t`the error with 40 steps is about $${tex(ECD[0], 2)}$`, code: `abs(e40 / ${n12(ECD[0])} - 1) < 0.01` },
        { name: 'the observed order is close to 4', code: 'abs(order - 4) < 0.15' },
      ],
      hints: ['Inside the loop: four slopes (k1 … k4) for both r and v, each built from the previous one.', 'k2 uses r + h/2·k1r and v + h/2·k1v; k4 uses a full step with k3. Then r += h/6·(k1r + 2k2r + 2k3r + k4r), and the same for v.', 'order = np.log2(e40 / e80).'],
      teach: 'An integrator is verified, not trusted: run it against an exact solution at two steps and check the order it promises.',
      explain: t`The errors are $${tex(ECD[0], 3)}$ and $${tex(ECD[1], 3)}$, a ratio of $${(ECD[0] / ECD[1]).toFixed(1)}$: order $${Math.log2(ECD[0] / ECD[1]).toFixed(2)}$. At $\tau = 40M$ the faller from $12M$ is at $r = ${EXC.toFixed(3)}M$, outside the horizon (crossed at $${tauHorizon(RC).toFixed(2)}M$).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-stellar', difficulty: 2, transfer: true,
      gen(r) {
        const Ms = r.pick([5, 8, 10, 20, 36]), R = r.pick([6, 10, 20, 50]);
        const ans = tauHorizon(R) * Ms * M_SUN_S * 1e3, Rkm = (R * Ms * M_SUN_M) / 1e3;
        return {
          prompt: t`A probe is released from rest $${tex(Rkm, 3)}\ \text{km}$ (in areal radius) from a non-spinning black hole of $${Ms}$ solar masses — that is, at $R = ${R}M$. How long does the probe’s own clock run before it crosses the horizon, in milliseconds? ($GM_\odot/c^3 = 4.9255\ \mu\text{s}$.)`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.08 * tauCrunch(R)], y: [0, 1.08 * R], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)', xticks: 0,
              curves: [cycCurve(R, { color: 'accent' })], hlines: [{ y: 2, color: 'bad', label: 'horizon r = 2M' }] },
            caption: 'The probe’s fall, r against its own proper time (time axis unnumbered).',
          },
          answer: ans, units: 'ms', tol: { rel: 0.005 },
          errors: [
            { value: tauCrunch(R) * Ms * M_SUN_S * 1e3, feedback: t`That is the time to $r = 0$ ($\eta = \pi$). The horizon is at $r = 2M$: $\cos\eta = 4M/R - 1$.` },
            { value: tauHorizon(R) * M_SUN_S * 1e3, feedback: t`One unit of $M$ in time is $GM/c^3$ — multiply by the mass, ${Ms} solar masses.` },
          ].filter((e) => Math.abs(Math.log10(ans / e.value) - Math.round(Math.log10(ans / e.value))) > 0.02),
          hints: [t`At the horizon $r = 2M$: $\cos\eta = 4M/R - 1$.`, t`$\tau = \sqrt{R^3/8M}\,(\eta + \sin\eta)$ in units of $M$; one $M$ of time is $${Ms}\times4.9255\ \mu\text{s}$.`],
          teach: 'In units with G = c = 1 every time is a multiple of M; converting back is one multiplication by GM/c³.',
          explain: t`$\eta = \arccos(${tex(4 / R - 1, 4)}) = ${Math.acos(4 / R - 1).toFixed(4)}$, so $\tau = ${Math.sqrt(R ** 3 / 8).toFixed(3)}\times${(Math.acos(4 / R - 1) + Math.sin(Math.acos(4 / R - 1))).toFixed(4)} = ${tauHorizon(R).toFixed(2)}M$, and with $1M = ${tex(Ms * M_SUN_S * 1e6, 4)}\ \mu\text{s}$ that is $${tex(ans, 3)}\ \text{ms}$. A distant observer never sees the crossing: the probe’s signals redshift and fade instead.`,
        };
      },
    }),
    num({
      id: 'cp-selfconv', difficulty: 3,
      gen(r) {
        const R = r.pick([8, 10, 12, 15]), T = Math.round(0.8 * tauHorizon(R)), n = r.pick([20, 40]);
        const u = [n, 2 * n, 4 * n].map((k) => +fall('verlet', R, T, k).r.toFixed(10));
        const ans = Math.log2((u[0] - u[1]) / (u[1] - u[2]));
        return {
          prompt: t`No cycloid this time: a velocity Verlet code reports $r(\tau = ${T}M)$ for a fall from rest at $R = ${R}M$ as $${u[0].toFixed(10)}$, $${u[1].toFixed(10)}$ and $${u[2].toFixed(10)}$ (in $M$) with $${n}$, $${2 * n}$ and $${4 * n}$ steps. What order of convergence do the three runs show?`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.08 * tauCrunch(R)], y: [0, 1.08 * R], aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'r (M)',
              curves: [cycCurve(R)], vlines: [{ x: T, color: 'gold', label: `τ = ${T}M` }], hlines: [{ y: 2, color: 'bad', label: 'horizon' }] },
            caption: 'The fall and the time at which the three runs are compared.',
          },
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: (u[0] - u[1]) / (u[1] - u[2]), feedback: t`That is $Q = 2^p$; take $\log_2$.` }],
          hints: [t`$Q = (u_h - u_{h/2})/(u_{h/2} - u_{h/4})$ ([F13.1](#/lesson/st-f.F13.1)).`, t`$Q = ${tex((u[0] - u[1]) / (u[1] - u[2]), 4)}$, and $p = \log_2 Q$.`],
          teach: 'Self-convergence needs no exact solution: the differences between three runs shrink by 2ᵖ.',
          explain: t`$Q = (${tex(u[0] - u[1], 4)})/(${tex(u[1] - u[2], 4)}) = ${tex((u[0] - u[1]) / (u[1] - u[2]), 4)}$, so $p = ${ans.toFixed(2)}$: velocity Verlet’s second order. Level 3 relies on exactly this test, where no exact solution exists.`,
        };
      },
    }),
    mcq({
      id: 'cp-coordinate-time', difficulty: 3, transfer: true,
      prompt: t`A second team integrates the same fall in Schwarzschild coordinate time $t$, using $dt/d\tau = E/(1 - 2M/r)$ with $E = \sqrt{1 - 2M/R}$. However small they make the steps, their body approaches $r = 2M$ ever more slowly and never crosses. What is going on?`,
      visual: {
        type: 'graph',
        params: { x: [0, 10.5], y: [0, 60], aspect: 'wide', axesAt: 'edge', xlabel: 'r (M)', ylabel: 'time (M)',
          curves: [
            { param: [`${R0 / 2}*(1 + cos(t))`, `${n12(CY.s)}*(t + sin(t))`], t: [0, Math.PI], color: 'accent', width: 2.2, label: 'proper time τ', labelAt: 2.9, labelDx: 8 },
            { param: [`${R0 / 2}*(1 + cos(t))`, tOfEta], t: [0, ETA_H - 1e-5], samples: 4000, color: 'gold', width: 2.2, label: 'coordinate time t', labelAt: 2.2, labelDx: 8, labelDy: 4 },
          ],
          vlines: [{ x: 2, color: 'bad', label: 'r = 2M' }] },
        caption: 'Falling from R = 10M: the faller’s clock τ (blue) and Schwarzschild’s coordinate time t (gold), against r. Exact closed forms; t grows without bound as r → 2M.',
      },
      choices: [
        t`$t$ is a coordinate that runs to infinity at the horizon, so a $t$-stepper needs infinitely many steps to get there; the faller crosses in finite proper time. Integrate in $\tau$ (or use horizon-penetrating coordinates such as Eddington–Finkelstein)`,
        'The body really never crosses the horizon; the proper-time code is wrong',
        'The step in t is too large: with small enough steps it would cross',
        t`$E$ is not conserved near the horizon, so $dt/d\tau$ is wrong there`,
      ],
      answer: 0,
      why: {
        1: 'Its own clock reaches r = 2M after a finite τ, and every local measurement there is ordinary; only the coordinate t misbehaves.',
        2: 'The prompt says it fails however small the steps are; t → ∞ at the horizon is the obstacle, not resolution.',
        3: 'E is a conserved quantity of every geodesic of this spacetime, all the way in.',
      },
      hints: [t`Evaluate $dt/d\tau = E/(1 - 2M/r)$ as $r \to 2M$.`, 'Which time does the faller’s clock keep?'],
      teach: 'Choose the independent variable that stays finite: a coordinate singularity is a property of the labels, but it stops a code just as surely as a real one.',
      explain: t`As $r \to 2M$, $dt/d\tau \to \infty$ and $t$ diverges logarithmically, so stepping in $t$ is like walking to a wall half the remaining distance at a time. The curvature there is finite, and in $\tau$ — or in Eddington–Finkelstein or Kruskal coordinates ([the horizon lesson](#/lesson/gr.S22.d)) — the crossing is unremarkable.`,
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley 2004), §5.4 and §5.6: Schwarzschild geodesics and radial infall', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Misner, Thorne & Wheeler, Gravitation (Freeman 1973), §25.5 and §31.4: the cycloid and coordinate time of radial fall', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Hairer, Nørsett & Wanner, Solving Ordinary Differential Equations I, 2nd ed. (Springer 1993), §II.3: order and error estimation', url: 'https://doi.org/10.1007/978-3-540-78862-1' },
  ],
});
