// Why symplectic integrators keep energy bounded — backward error analysis:
// the numerical points of a symplectic method lie (to all orders, for
// exponentially long times) on a level set of a modified, “shadow”
// Hamiltonian H̃ = H + h²H₂ + …, so the true H only oscillates by O(h²). For
// velocity Verlet with H = p²/2 + V(q): H̃ = H + (h²/12)V″p² − (h²/24)V′² + O(h⁴)
// (fitted and checked here on the pendulum: H̃ varies 570 times less than H at
// h = 0.1); exactly, for the oscillator, H̃ = p²/2 + ½ω²(1 − h²ω²/4)q². RK4's
// modified equation is not Hamiltonian, so its energy drifts. What H̃ does
// not save: the phase (ω̃ = (2/h)arcsin(hω/2)), precession, variable steps.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { verlet, TABLEAU, rkStep, n12, lg, plainSci } from './_ode.js';

const t = String.raw;

// ── the pendulum, H = p²/2 − cos q, from q = 1.2, p = 0 ──
const acc = (x) => [-Math.sin(x[0])];
const H = (q, p) => (p * p) / 2 - Math.cos(q);
const HT = (q, p, h) => H(q, p) + h * h * ((p * p * Math.cos(q)) / 12 - Math.sin(q) ** 2 / 24);
const F = (tt, y) => [y[1], -Math.sin(y[0])];
const TT = 2000, NW = 160;
const CASES = [[1, 0.05], [2, 0.1], [3, 0.2]];
const ENV = CASES.map(([, h]) => {
  const n = Math.round(TT / h), per = Math.ceil(n / NW);
  let x = [1.2], v = [0], y = [1.2, 0];
  const H0 = H(1.2, 0), HT0 = HT(1.2, 0, h);
  const V = [], S = [], R = [];
  let mv = 0, ms = 0;
  for (let i = 1; i <= n; i++) {
    [x, v] = verlet(acc, x, v, h);
    mv = Math.max(mv, Math.abs(H(x[0], v[0]) - H0)); ms = Math.max(ms, Math.abs(HT(x[0], v[0], h) - HT0));
    if (i % per === 0) { V.push([i * h, mv]); S.push([i * h, ms]); mv = 0; ms = 0; }
  }
  const n4 = Math.round(TT / (4 * h)), per4 = Math.ceil(n4 / NW);
  let mr = 0;
  for (let i = 1; i <= n4; i++) { y = rkStep(TABLEAU.rk4, F, 0, y, 4 * h); mr = Math.max(mr, Math.abs(H(y[0], y[1]) - H0)); if (i % per4 === 0) { R.push([i * 4 * h, mr]); mr = 0; } }
  const top = (A) => Math.max(...A.map((p) => p[1]));
  return { h, V, S, R, maxV: top(V), maxS: top(S), endR: R[R.length - 1][1] };
});
const wh = (k) => `step(0.5 - abs(cs - ${k}))`;
const ptsOf = (A, k, color, r = 2.4) => A.map(([tt, e]) => ({ x: n12(tt), y: n12(lg(Math.max(e, 1e-12))), r, color, when: wh(k) }));

// ── the worked example: the oscillator, exactly ──
const WX = 1, HX = 0.5, TH = HX * WX;
const OSC = (() => {
  let x = [1], v = [0], lo = 1e9, hi = -1e9, slo = 1e9, shi = -1e9;
  for (let i = 0; i < 4000; i++) {
    [x, v] = verlet((q) => [-(WX * WX) * q[0]], x, v, HX);
    const e = v[0] ** 2 / 2 + (WX * WX * x[0] ** 2) / 2, s = v[0] ** 2 / 2 + ((WX * WX) / 2) * (1 - (TH * TH) / 4) * x[0] ** 2;
    lo = Math.min(lo, e); hi = Math.max(hi, e); slo = Math.min(slo, s); shi = Math.max(shi, s);
  }
  return { lo, hi, srange: shi - slo };
})();
const WT = (2 / HX) * Math.asin(TH / 2);
// the code exercise: the spread of H over 20 000 steps at h = 0.1
const SPREAD = (() => { let x = [1.2], v = [0], lo = 9, hi = -9; for (let i = 0; i < 20000; i++) { [x, v] = verlet(acc, x, v, 0.1); const e = H(x[0], v[0]); lo = Math.min(lo, e); hi = Math.max(hi, e); } return hi - lo; })();

export default lesson({
  id: 'st-f.F10.2',
  title: 'Why symplectic integrators keep energy bounded',
  minutes: 15, difficulty: 4,
  intro: t`Velocity Verlet does not conserve the energy $H$. It does something better: its numerical points lie almost exactly on a level curve of a nearby **shadow Hamiltonian** $\tilde H$, and so $H$ can only wobble, never wander. Finding the modified problem that a method solves *exactly* is called **backward error analysis**. For velocity Verlet with $H = \tfrac12p^2 + V(q)$:

$$\tilde H = H + \frac{h^2}{12}V''(q)\,p^2 - \frac{h^2}{24}V'(q)^2 + O(h^4)$$

$\tilde H$ is conserved to all orders in $h$ for exponentially long times, so $H = \tilde H - O(h^2)$ stays within $O(h^2)$ of its start. A non-symplectic method such as RK4 also solves a nearby equation, but not a Hamiltonian one: it carries a trace of friction or anti-friction, and the energy drifts — slowly, steadily, without end.`,
  symbols: [
    { tex: 'H(q, p)', text: 'the Hamiltonian: the energy as a function of position $q$ and momentum $p$ (unit mass here)' },
    { tex: 'V(q)', text: 'the potential energy; $V\'$ and $V\'\'$ are its first and second derivatives ($V\' = -$force)' },
    { tex: t`\tilde H`, text: 'the **shadow Hamiltonian**: the energy of the modified system whose exact motion passes through the numerical points' },
    { tex: 'h', text: 'the fixed time step: $\\tilde H$ depends on it, so changing $h$ mid-run changes which shadow is conserved' },
    { tex: 'O(h^4)', text: 'higher terms of the series, $h^4H_4 + \\cdots$; the series does not converge, but truncated optimally it is conserved up to an error like $e^{-c/h}$' },
  ],
  why: 'This is the reason molecular dynamics, N-body codes and the geodesic lab of F14 trust symplectic integrators over long runs — and knowing it also tells you what they do not fix: phases, precession and anything computed with a varying step.',
  visual: {
    type: 'graph',
    title: 'Wobble against drift',
    lead: t`A pendulum ($q_0 = 1.2$ rad) for 2000 time units, about 300 swings. Blue: Verlet’s energy error $\lvert H - H_0\rvert$. Gold: the same run’s shadow error $\lvert\tilde H - \tilde H_0\rvert$, with $\tilde H$ to order $h^2$. Red: RK4 at **four times** the step — the same number of force evaluations. Each dot is the largest error within a window of time; the axis is logarithmic.`,
    tasks: [
      `Blue stays flat: Verlet’s energy wobbles by ${plainSci(ENV[1].maxV)} at h = 0.1 and never grows.`,
      `Gold lies far lower (${Math.round(ENV[1].maxV / ENV[1].maxS)} times at h = 0.1): the numerical points nearly conserve H̃. What remains is its O(h⁴) term.`,
      `Red climbs: RK4’s error grows steadily with time, and at every setting it overtakes Verlet’s within the run — even at the finest it ends ${Math.round(ENV[0].endR / ENV[0].maxV)} times higher.`,
    ],
    params: {
      x: [0, 2050], y: [-10, -0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 't (units of √(L/g))', ylabel: '|energy error|',
      choices: [{ key: 'cs', label: 'Verlet step (RK4 at 4×)', options: CASES.map(([k, h]) => [k, `${h} / ${+(4 * h).toFixed(2)}`]), value: 2, explain: 'Equal cost: one force per Verlet step, four per RK4 step.' }],
      points: CASES.flatMap(([k], i) => [...ptsOf(ENV[i].S, k, 'gold'), ...ptsOf(ENV[i].R, k, 'bad'), ...ptsOf(ENV[i].V, k, 'accent')]),
      legend: [{ label: 'Verlet: H', color: 'accent', point: true }, { label: 'Verlet: shadow H̃', color: 'gold', point: true }, { label: 'RK4 (4× step): H', color: 'bad', point: true }], legendAt: 'br',
    },
    caption: 'Exact float64 runs. H̃ is truncated after its h² term, so its residual variation is the O(h⁴) remainder. Errors are the largest in each of 160 windows of time.',
  },
  example: {
    prompt: t`For the oscillator $H = \tfrac12p^2 + \tfrac12\omega^2q^2$ the shadow can be found exactly. With $\omega = 1$ and $h = ${HX}$, show that Verlet conserves $\tilde H = \tfrac12p^2 + \tfrac12\omega^2\left(1 - \tfrac14h^2\omega^2\right)q^2$, deduce how much $H$ wobbles, and find the method’s frequency.`,
    visual: {
      type: 'graph',
      params: { x: [-1.25, 1.25], y: [-1.1, 1.1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'p',
        curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 1.6, dash: true }, { param: ['cos(t)', `${n12(Math.sqrt(1 - (TH * TH) / 4))}*sin(t)`], t: [0, 2 * Math.PI], color: 'gold', width: 2 }],
        points: (() => { let x = [1], v = [0]; const out = []; for (let i = 0; i < 40; i++) { out.push({ x: n12(x[0]), y: n12(v[0]), r: 3.5, color: 'accent' }); [x, v] = verlet((q) => [-q[0]], x, v, HX); } return out; })(),
        legend: [{ label: 'true energy circle', color: 'ink3', dash: true }, { label: 'shadow ellipse H̃ = const', color: 'gold' }, { label: 'Verlet points', color: 'accent', point: true }], legendAt: 'tr' },
      caption: 'Forty Verlet steps with h = 0.5 (a deliberately coarse step, so the effect is visible): every point lies on the gold ellipse, not on the true circle.',
    },
    steps: [
      { label: 'The step matrix', text: t`From [F10.1](#/lesson/st-f.F10.1), with $\theta = h\omega$: $q' = (1 - \tfrac12\theta^2)q + hp$, $p' = -h\omega^2(1 - \tfrac14\theta^2)q + (1 - \tfrac12\theta^2)p$.` },
      { label: 'Check the invariant', text: t`Substitute into $\tilde H(q', p')$ and collect terms: the $qp$ terms cancel and the $q^2$ and $p^2$ coefficients come back unchanged, so $\tilde H(q', p') = \tilde H(q, p)$ exactly. Numerically, over 4000 steps $\tilde H$ varies by $${tex(OSC.srange, 1)}$ — round-off.` },
      { label: 'The wobble', text: t`On the shadow ellipse, $H$ ranges between $\tilde H$ (at $q = 0$) and $\tilde H/(1 - \tfrac14\theta^2)$ (at $p = 0$). So $H$ wobbles with relative amplitude $\tfrac14\theta^2 = ${(TH * TH / 4).toFixed(4)}$: observed, $H$ between $${OSC.lo.toFixed(5)}$ and $${OSC.hi.toFixed(5)}$. At $h = 0.1$ it would be $0.0025$ — the $O(h^2)$ of the intro, and it never grows.` },
      { label: 'The frequency', text: t`The step matrix rotates the ellipse’s phase by $\tilde\omega h$ per step, with $\cos\tilde\omega h = 1 - \tfrac12\theta^2$: $\tilde\omega = \tfrac2h\arcsin\tfrac{h\omega}{2} = ${WT.toFixed(5)}$. The numerical oscillator runs $${((WT / WX - 1) * 100).toFixed(2)}\%$ fast, and its phase error grows **linearly** with time. Energy is bounded; phase is not.` },
      { label: 'Why it works', text: t`A symplectic map is, to all orders in $h$, the time-$h$ flow of *some* Hamiltonian system — the shadow. Its energy $\tilde H$ is conserved, and $H$ differs from it by $O(h^2)$ everywhere. RK4’s map is not symplectic, so no such conserved shadow exists; its modified equation contains a tiny dissipative term of order $h^4$, which a long run integrates into a drift.` },
    ],
    answer: t`$\tilde H$ is conserved exactly; $H$ wobbles by a relative $\tfrac14(h\omega)^2 = ${(TH * TH / 4).toFixed(4)}$ and never drifts; the frequency is $\tilde\omega = \tfrac2h\arcsin\tfrac{h\omega}2 = ${WT.toFixed(4)}$, so the phase error grows linearly.`,
  },
  practice: [
    num({
      id: 'wobble', difficulty: 2,
      gen(r) {
        const N = r.pick([10, 20, 50, 100]), hw = (2 * Math.PI) / N, ans = (hw * hw) / 4;
        return {
          prompt: t`Velocity Verlet integrates an oscillator with $${N}$ steps per period. What is the relative amplitude $\tfrac14(h\omega)^2$ of its energy wobble?`,
          visual: {
            type: 'graph',
            params: { x: [-1.3, 1.3], y: [-1.15, 1.15], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'p/ω',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 1.6, dash: true }, { param: ['cos(t)', `${n12(Math.sqrt(1 - ans))}*sin(t)`], t: [0, 2 * Math.PI], color: 'gold', width: 2 }] },
            caption: 'The true energy circle (dashed) and Verlet’s shadow ellipse (gold), whose axes differ in the ratio √(1 − (hω)²/4).',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: hw / 2, feedback: 'Square hω: the wobble is second order in the step.' }, { value: hw * hw, feedback: 'Include the factor ¼ from the shadow Hamiltonian’s coefficient.' }],
          hints: [t`$h\omega = 2\pi/${N}$.`, t`Square it and divide by 4.`],
          teach: 'Verlet’s energy error is a bounded wobble of relative size (hω)²/4: halve the step and it falls fourfold — and it never accumulates.',
          explain: t`$h\omega = ${hw.toFixed(4)}$, so $\tfrac14(h\omega)^2 = ${tex(ans, 3)}$. The energy oscillates between $H_0(1 - ${tex(ans, 2)})$ and $H_0$ twice per period, for as long as you run it.`,
        };
      },
    }),
    num({
      id: 'phase-drift', difficulty: 3,
      gen(r) {
        const N = r.pick([20, 50, 100]), P = r.pick([100, 1000]);
        const hw = (2 * Math.PI) / N, ratio = (2 / hw) * Math.asin(hw / 2), ans = P * 2 * Math.PI * (ratio - 1);
        return {
          prompt: t`Verlet runs an oscillator at $${N}$ steps per period. Its frequency is $\tilde\omega = \tfrac{2}{h}\arcsin\tfrac{h\omega}{2}$ instead of $\omega$. By how many radians is its phase ahead after $${P}$ true periods?`,
          visual: {
            type: 'graph',
            params: { x: [0, 3.2], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'periods', ylabel: 'q',
              curves: [{ fn: 'cos(2*pi*x)', color: 'ink3', width: 2, dash: true }, { fn: `cos(2*pi*x*${n12(1 + 40 * (ratio - 1))})`, color: 'accent', width: 2 }] },
            caption: 'Schematic: a numerical oscillation (blue) running slightly fast against the true one; the lag is exaggerated 40× so that it shows in three periods.',
          },
          answer: ans, units: 'rad', tol: { rel: 0.01 },
          errors: [{ value: ans / (2 * Math.PI), feedback: 'That is in cycles. Multiply by 2π for radians.' }],
          hints: [t`Phase error $= (\tilde\omega - \omega)t$ with $t = ${P}\times2\pi/\omega$.`, t`$= ${P}\times2\pi\,(\tilde\omega/\omega - 1)$, and $\tilde\omega/\omega = \tfrac{2}{h\omega}\arcsin\tfrac{h\omega}{2}$.`],
          teach: 'A symplectic method bounds the energy error but not the phase error, which grows linearly in time.',
          explain: t`$\tilde\omega/\omega = ${ratio.toFixed(7)}$ (about $1 + (h\omega)^2/24$), so after $${P}$ periods the phase is ahead by $${tex(ans, 3)}$ rad. ${ans > 1 ? 'More than a radian: the energy is right, but the oscillator is in the wrong place in its cycle.' : 'Small here, but it keeps growing without bound.'}`,
        };
      },
    }),
    mcq({
      id: 'rk4-drift', difficulty: 3,
      prompt: t`RK4 is far more accurate than Verlet per step, yet over very long runs its energy error ends up larger. Which explanation is right?`,
      visual: {
        type: 'graph',
        params: { x: [0, 2050], y: [-10, -0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 't', ylabel: '|energy error|',
          points: [...ptsOf(ENV[2].V, 0, 'accent').map((p) => ({ ...p, when: undefined })), ...ptsOf(ENV[2].R, 0, 'bad').map((p) => ({ ...p, when: undefined }))],
          legend: [{ label: 'Verlet h = 0.2', color: 'accent', point: true }, { label: 'RK4 h = 0.8', color: 'bad', point: true }], legendAt: 'br' },
        caption: 'The Explore’s coarsest pair: the pendulum at equal cost.',
      },
      choices: [
        'RK4 solves a modified equation that is not Hamiltonian; its tiny dissipative term changes the energy the same way every swing, so the error accumulates linearly',
        'RK4 accumulates round-off error, which Verlet avoids',
        'RK4 is unstable on oscillations, so its error grows exponentially',
        'RK4’s local error is random in sign and the errors random-walk',
      ],
      answer: 0,
      why: {
        1: 'Round-off is ten orders of magnitude below these errors; it is truncation error, systematically biased.',
        2: 'At these steps RK4 is well inside its stability region; its growth is linear, not exponential.',
        3: 'A random walk would grow like √t; the energy drift is systematic, the same sign every swing.',
      },
      hints: ['Backward error analysis: what equation does each method solve exactly?', 'Does a non-Hamiltonian modified equation conserve anything?'],
      teach: 'Backward error analysis explains long-time behaviour: a symplectic method solves a nearby Hamiltonian problem, a non-symplectic one a nearby dissipative (or anti-dissipative) problem.',
      explain: t`RK4’s modified equation is the true one plus $O(h^4)$ terms that, for the pendulum, act like a very slight friction, so the energy changes by nearly the same amount every swing. Here it reaches $${tex(ENV[2].endR, 2)}$ by $t = 2000$ while Verlet’s stays below $${tex(ENV[2].maxV, 2)}$.`,
    }),
    mcq({
      id: 'variable-step', difficulty: 3,
      prompt: t`To save time, a student lets a Verlet orbit code shrink its step near periapsis and grow it again at apoapsis. Over many orbits the energy now drifts. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-1.25, 1.25], y: [-1.1, 1.1], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'p',
          curves: [0.1, 0.45, 0.8].map((th, i) => ({ param: ['cos(t)', `${n12(Math.sqrt(1 - (th * th) / 4))}*sin(t)`], t: [0, 2 * Math.PI], color: ['accent', 'gold', 'bad'][i], width: 1.8 })) },
        caption: 'Shadow energy ellipses of the oscillator for three step sizes: each step size conserves a different shadow.',
      },
      choices: [
        'Each step size has its own shadow Hamiltonian; switching between them moves the state from one shadow’s level curve to another’s, and the errors no longer cancel',
        'Smaller steps accumulate more round-off near periapsis',
        'Velocity Verlet is only symplectic for the harmonic oscillator',
        'Varying the step breaks second-order accuracy',
      ],
      answer: 0,
      why: {
        1: 'Round-off is negligible here; the drift is a structural, truncation effect.',
        2: 'Verlet is symplectic for any separable H = T(p) + V(q).',
        3: 'Smoothly varying steps can keep second order; it is the conserved shadow that is lost.',
      },
      hints: ['H̃ depends on h.', 'Which quantity is conserved while h changes from step to step?'],
      teach: 'A symplectic method’s good long-time behaviour belongs to a fixed step: vary the step naively and the shadow Hamiltonian changes under you.',
      explain: t`With $h$ fixed, the points ride one level curve of $\tilde H_h$. When $h$ changes, the next steps follow a different family of curves, and a state that was on one level of the old shadow sits on an arbitrary level of the new. Adaptive symplectic integration needs special tricks (time transformations such as Sundman’s, or reversible step-size rules).`,
    }),
    num({
      id: 'crossover', difficulty: 3,
      gen(r) {
        const ev = r.pick([2e-5, 5e-5, 1e-4]), er = r.pick([3e-8, 7.7e-8, 2e-7]), ans = ev / er;
        return {
          prompt: t`On an orbit problem at equal cost, Verlet’s relative energy error oscillates with amplitude $${tex(ev, 2)}$, while RK4’s grows by $${tex(er, 2)}$ per orbit. After about how many orbits does RK4’s error overtake Verlet’s?`,
          visual: {
            type: 'graph',
            params: { x: [0, ans * 2], y: [0, ev * 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'orbits', ylabel: 'relative energy error', yticks: 0,
              curves: [{ fn: `${n12(ev)}*(1 - cos(x*${n12(40 / ans)}))/2 + 0*x`, color: 'accent', width: 1.6, domain: [0, ans * 2], samples: 2000 }, { fn: `${n12(er)}*x`, color: 'bad', width: 2.2, domain: [0, ans * 2] }],
              hlines: [{ y: n12(ev), color: 'ink4', label: 'Verlet’s band' }] },
            caption: 'Schematic: Verlet’s bounded wobble (blue, oscillation drawn far slower than real) against RK4’s linear drift (red). No numbers on the vertical axis.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: er / ev, feedback: 'Invert: divide Verlet’s amplitude by RK4’s growth per orbit.' }],
          hints: ['RK4’s error after n orbits is about n times its growth per orbit.', t`Set $n\times${tex(er, 2)} = ${tex(ev, 2)}$.`],
          teach: 'A bounded error eventually beats a growing one, however small the growth: the crossover time is the ratio of the two.',
          explain: t`$n \approx ${tex(ev, 2)}/${tex(er, 2)} = ${Math.round(ans)}$ orbits. For a few orbits RK4 is the better choice; for thousands, Verlet. (The research behind this course measured a crossover of about 650 periods for a relativistic orbit at $h = 8M$.)`,
        };
      },
    }),
    num({
      id: 'shadow-term', difficulty: 3,
      gen(r) {
        const q = r.pick([0.4, 0.8, 1.2]), p = r.pick([0.3, 0.6, 1]), h = r.pick([0.1, 0.2]);
        const ans = h * h * ((p * p * Math.cos(q)) / 12 - Math.sin(q) ** 2 / 24);
        return {
          prompt: t`For a pendulum $V(q) = -\cos q$ (so $V' = \sin q$, $V'' = \cos q$), Verlet’s shadow is $\tilde H = H + \tfrac{h^2}{12}V''p^2 - \tfrac{h^2}{24}V'^2$. With $h = ${h}$, what is the correction $\tilde H - H$ at $q = ${q}$, $p = ${p}$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.6, 1.6], y: [-1.4, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'p',
              curves: [0.5, 1, 1.4].map((qa) => ({ param: [`${qa}*cos(t)`, `${n12(Math.sqrt(2 * (1 - Math.cos(qa))))}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1.4 })),
              points: [{ x: q, y: p, r: 5, color: 'gold', label: '(q, p)' }] },
            caption: 'Rough pendulum phase curves (drawn as ellipses through the turning points) and the state in question.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: h * h * ((p * p * Math.cos(q)) / 12 + Math.sin(q) ** 2 / 24), feedback: 'Mind the sign of the second term: −h²V′²/24.' }, { value: h * ((p * p * Math.cos(q)) / 12 - Math.sin(q) ** 2 / 24), feedback: 'The correction is proportional to h², not h.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`$V'' = \cos ${q} = ${Math.cos(q).toFixed(4)}$, $V' = \sin ${q} = ${Math.sin(q).toFixed(4)}$.`, t`$\tfrac{${h * h}}{12}(${Math.cos(q).toFixed(4)})(${p})^2 - \tfrac{${h * h}}{24}(${Math.sin(q).toFixed(4)})^2$.`],
          teach: 'The shadow Hamiltonian differs from H by O(h²) terms built from the potential’s derivatives; it is what the numerical points actually conserve.',
          explain: t`$\tilde H - H = ${tex(ans, 3)}$. Because the correction changes sign along an orbit, $H$ itself must rise and fall as the numerical state moves along a level curve of $\tilde H$ — the wobble of the Explore.`,
        };
      },
    }),
    code({
      id: 'shadow-check', difficulty: 3,
      prompt: t`Run velocity Verlet on the pendulum ($q_0 = 1.2$, $p_0 = 0$, $h = 0.1$, 20 000 steps) and record $H = \tfrac12p^2 - \cos q$ and $\tilde H = H + \tfrac{h^2}{12}p^2\cos q - \tfrac{h^2}{24}\sin^2 q$ after every step. Set \`spread_H\` and \`spread_Ht\` to the ranges (max − min) of the two.`,
      starter: t`import numpy as np

h, n = 0.1, 20000
q, p = 1.2, 0.0
Hs, Hts = [], []
for i in range(n):
    # one kick-drift-kick step, then record H and the shadow H~
    pass

spread_H = 0.0
spread_Ht = 0.0
print(spread_H, spread_Ht, spread_H / max(spread_Ht, 1e-300))
`,
      answer: t`import numpy as np

h, n = 0.1, 20000
q, p = 1.2, 0.0
Hs, Hts = [], []
for i in range(n):
    p += h / 2 * (-np.sin(q))
    q += h * p
    p += h / 2 * (-np.sin(q))
    H = 0.5 * p**2 - np.cos(q)
    Hs.append(H)
    Hts.append(H + h**2 / 12 * p**2 * np.cos(q) - h**2 / 24 * np.sin(q)**2)

spread_H = max(Hs) - min(Hs)
spread_Ht = max(Hts) - min(Hts)
print(spread_H, spread_Ht, spread_H / max(spread_Ht, 1e-300))`,
      tests: [
        { name: 'the energy H wobbles by about 0.0014', code: '1.2e-3 < spread_H < 1.6e-3' },
        { name: t`$\tilde H$ varies at least 300 times less`, code: 'spread_Ht > 0 and spread_H / spread_Ht > 300' },
        { name: 'all 20 000 steps were recorded', code: 'len(Hs) == 20000 and len(Hts) == 20000' },
      ],
      hints: ['One step: p += h/2·(−sin q); q += h·p; p += h/2·(−sin q).', 'Append H and H~ inside the loop; spread = max(list) − min(list).'],
      teach: 'Backward error analysis makes a testable prediction: a specific function of the state, not the energy, is what the numbers conserve.',
      explain: t`$H$ spreads by $${tex(SPREAD, 2)}$; $\tilde H$ about $${Math.round(ENV[1].maxV / ENV[1].maxS)}$ times less. Including the $h^4$ term would shrink the residual further — the series can be pushed until its terms start to grow, which they eventually do.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-orbit-wobble', difficulty: 2, transfer: true,
      gen(r) {
        const e0 = r.pick([3e-5, 8e-5, 2e-4]), k = r.pick([2, 3, 5]), ans = e0 / (k * k);
        return {
          prompt: t`A leapfrog integration of a satellite constellation shows a relative energy wobble of $${tex(e0, 1)}$. The step is reduced by a factor of $${k}$. What wobble do you expect now?`,
          visual: {
            type: 'graph',
            params: { x: [0, 10], y: [-1.2 * e0, 0.2 * e0], aspect: 'wide', axesAt: 'edge', xlabel: 'orbits', ylabel: 'ΔE/E', yticks: 0,
              curves: [{ fn: `-${n12(e0)}*(1 - cos(4*pi*x))/2`, color: 'accent', width: 1.6, samples: 1500 }] },
            caption: 'Schematic: a bounded energy wobble, twice per orbit.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: e0 / k, feedback: 'The wobble is second order: it scales as h², not h.' }, { value: e0 / k ** 4, feedback: 'Leapfrog is second order; h⁴ would be RK4.' }],
          hints: ['The wobble is O(h²).', t`Divide by $${k}^2$.`],
          teach: 'For a second-order symplectic method the bounded energy wobble scales as h².',
          explain: t`$${tex(e0, 1)}/${k * k} = ${tex(ans, 2)}$, and it stays that size however long the run.`,
        };
      },
    }),
    mcq({
      id: 'cp-mercury', difficulty: 3, transfer: true,
      prompt: t`A Verlet simulation of Mercury’s orbit with general-relativistic corrections keeps the energy beautifully bounded, yet finds a perihelion advance noticeably larger than GR’s 43″ per century. Halving the step shrinks the excess about fourfold. What is going on?`,
      visual: {
        type: 'graph',
        params: { x: [-1.5, 1.5], y: [-1.15, 1.15], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0,
          curves: [0, 1, 2].map((k) => ({ polar: `0.6/(1 + 0.5*cos(theta - ${0.25 * k}))`, theta: [0, 2 * Math.PI], color: ['ink3', 'accent', 'gold'][k], width: 1.6 })),
          points: [{ x: 0, y: 0, r: 6, color: 'gold' }] },
        caption: 'Schematic: a precessing ellipse (the advance per orbit hugely exaggerated).',
      },
      choices: [
        'Verlet adds a spurious precession of order h²: bounded energy says nothing about the orientation of the orbit, which is a phase-like error',
        'General relativity is wrong at Mercury',
        'The energy wobble causes the precession and would vanish with a smaller wobble',
        'Symplectic methods conserve every quantity, so the step must be unstable',
      ],
      answer: 0,
      why: {
        1: 'GR’s 42.98″ per century is confirmed by observation; the excess shrinks with h, so it is numerical.',
        2: 'Energy fixes the size of the orbit (its semi-major axis), not the direction of its axis; the precession is a separate error.',
        3: 'They conserve a shadow energy, not every quantity; the orbit’s orientation is not protected.',
      },
      hints: ['What does a fourfold drop on halving h say about the excess?', 'Which orbital elements does a conserved energy pin down?'],
      teach: 'A bounded energy error is not an accurate orbit: phases and precession still carry O(hᵖ) errors that grow with time.',
      explain: t`The excess scales as $h^2$: a numerical artefact. The research behind this course found one about a third of the real effect at a typical step. Fixes: smaller steps (with a convergence test), or computing the GR and Newtonian runs with the same step and subtracting, so the shared numerical precession cancels.`,
    }),
    num({
      id: 'cp-shadow-q', difficulty: 3,
      gen(r) {
        const hw = r.pick([0.2, 0.5, 1, 1.5]), ans = 1 - (hw * hw) / 4;
        return {
          prompt: t`For Verlet on an oscillator the shadow is $\tilde H = \tfrac12p^2 + \tfrac12\omega^2\left(1 - \tfrac14h^2\omega^2\right)q^2$. With $h\omega = ${hw}$, the numerical points lie on an ellipse in the $(q, p/\omega)$ plane. What is the ratio of its $p/\omega$ semi-axis to its $q$ semi-axis?`,
          visual: {
            type: 'graph',
            params: { x: [-1.3, 1.3], y: [-1.15, 1.15], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'q', ylabel: 'p/ω',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 1.6, dash: true }] },
            caption: 'The true energy circle in scaled coordinates. Where do Verlet’s points lie?',
          },
          answer: Math.sqrt(ans), tol: { rel: 0.005 },
          errors: [{ value: ans, feedback: 'Semi-axes go like the square roots of the coefficients: take √(1 − h²ω²/4).' }, { value: 1 / Math.sqrt(ans), feedback: 'Inverted: the q semi-axis is the longer one (where p = 0, the smaller q coefficient allows a larger q).' }],
          hints: [t`At $p = 0$: $q_{\max}^2 \propto 1/\left(1 - \tfrac14h^2\omega^2\right)$; at $q = 0$: $(p/\omega)_{\max}^2 \propto 1$.`, t`Ratio $= \sqrt{1 - \tfrac14(h\omega)^2}$.`],
          teach: 'The shadow’s level set is an ellipse flattened by √(1 − (hω)²/4): the visible signature of the O(h²) energy wobble.',
          explain: t`$\sqrt{1 - ${hw * hw}/4} = ${Math.sqrt(ans).toFixed(4)}$.${hw >= 2 ? '' : ' At hω = 2 the ellipse collapses to a line: the stability limit of F10.1.'}`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hairer, Lubich & Wanner, Geometric Numerical Integration, 2nd ed. (Springer 2006), ch. IX: backward error analysis', url: 'https://doi.org/10.1007/3-540-30666-8' },
    { label: 'Hairer, Lubich & Wanner (2003), Geometric numerical integration illustrated by the Störmer–Verlet method, Acta Numerica 12, 399', url: 'https://doi.org/10.1017/S0962492902000144' },
    { label: 'Yoshida (1990), Construction of higher order symplectic integrators, Phys. Lett. A 150, 262', url: 'https://doi.org/10.1016/0375-9601(90)90092-3' },
  ],
});
