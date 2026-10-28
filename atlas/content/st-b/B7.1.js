// Separation on an interval, for the heat equation with real boundary data:
// subtract the steady state, separate the rest, read off eigenvalues and
// decay rates, fit the initial data with the eigenfunctions, and know when
// one term is enough. Dirichlet and Neumann ends; the insulated rod's
// surviving mode is its average; a heat-shield back face as transfer.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { MATERIALS, LI900, SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const AL = MATERIALS[0];
// worked example: aluminium rod, 0.30 m, starts at 20 °C; left end to 100 °C, right end stays at 20 °C
const WE = { L: 0.3, T0: 20, TA: 100 };
WE.tau1 = WE.L ** 2 / (Math.PI ** 2 * AL.alpha);
WE.tMid = WE.tau1 * Math.log((2 * (WE.TA - WE.T0)) / Math.PI / 1);      // midpoint within 1 °C (one term)
// the insulated-back slab with its hot face suddenly held: back-face fraction of the rise, 400 terms
const backFrac = (s) => { let S = 0; for (let n = 1; n <= 400; n++) S += ((n % 2 ? 1 : -1) / (2 * n - 1)) * Math.exp(-((2 * n - 1) ** 2) * s); return 1 - (4 / Math.PI) * S; };

export default lesson({
  id: 'st-b.B7.1',
  title: 'Separation on an interval',
  minutes: 15, difficulty: 3,
  intro: t`A rod $0 \le x \le L$ obeys $u_t = D\,u_{xx}$. Look for solutions that keep their **shape** and only change their **size**: $u = X(x)\,T(t)$. Substituting and dividing by $D\,X\,T$,

$$\frac{T'(t)}{D\,T(t)} = \frac{X''(x)}{X(x)} = -\lambda .$$

The left side depends only on $t$, the right only on $x$; equal for every $x$ and $t$, both must be one constant, $-\lambda$. The PDE splits into two ODEs: $T' = -D\lambda T$ (decay at rate $D\lambda$) and the **eigenvalue problem** $X'' + \lambda X = 0$ with the rod’s end conditions. MATH 2280 solved the string this way (lessons DE-8.2 and DE-8.3); here the end conditions are real ones — ends held at *different* temperatures, ends insulated — and the question is how many terms you actually need.`,
  symbols: [
    { tex: 'X(x)', text: 'the shape of a separated solution (a mode)' },
    { tex: 'T(t)', text: 'its size as time goes on — not a temperature here: here $T$ is the time factor' },
    { tex: t`\lambda`, text: 'the separation constant, an eigenvalue of $X\'\' + \\lambda X = 0$ with the end conditions (1/m²); for ends held at zero, $\\lambda_n = (n\\pi/L)^2$' },
    { tex: 'D', text: 'the diffusivity (m²/s); mode $n$ decays at the rate $D\\lambda_n$ (1/s)' },
  ],
  why: t`Separation is how black-hole and neutron-star oscillations are found: perturbations are separated in spherical harmonics, leaving one radial equation per mode (Regge–Wheeler, Zerilli). Every mode has its own complex frequency — the “ringdown” that LIGO measures after a merger.`,
  visual: {
    type: 'graph',
    title: 'A sum of decaying modes',
    lead: t`A rod at 0 (scaled) whose left end is suddenly held at 1. Its temperature is the steady state (dashed) plus a sum of sine modes, each decaying at its own rate. Change the number of terms and the time.`,
    tasks: [
      'At t = 0 with 3 terms the sum wiggles badly; with 40 it fits the initial step except right at the jump.',
      'Move to t = 0.05: now 3 terms are indistinguishable from 40 — the high modes have died.',
      'Switch the right end to insulated: the steady state is no longer a slope but the whole rod at 1, and the modes become quarter-waves.',
    ],
    params: {
      x: [0, 1], y: [-0.2, 1.25], aspect: 'wide', xlabel: 'x / L', ylabel: 'u (scaled)', axesAt: 'edge',
      choices: [{ key: 'bc', label: 'Right end', options: [[0, 'held at 0'], [1, 'insulated']], value: 0, explain: 'Held: a Dirichlet end. Insulated: a Neumann end, $u_x = 0$.' }],
      sliders: [
        { key: 'tau', label: 'Time $Dt/L^2$', min: 0, max: 0.5, step: 0.002, value: 0.01, explain: 'Time in units of $L^2/D$, the diffusion time across the rod.' },
        { key: 'N', label: 'Terms $N$', min: 1, max: 40, step: 1, value: 3, explain: 'How many modes are added up.' },
      ],
      curves: [
        { fn: '1 - x', color: 'ink3', dash: [5, 4], width: 1.4, when: 'step(0.5 - bc)' },
        { fn: '1', color: 'ink3', dash: [5, 4], width: 1.4, when: 'step(bc - 0.5)' },
        { sum: '(1 - x)/N - 2/(k*pi)*e^(-k^2*pi^2*tau)*sin(k*pi*x)', k: [1, 'N'], color: 'accent', width: 2.6, when: 'step(0.5 - bc)' },
        { sum: '1/N - 4/((2k - 1)*pi)*e^(-(2k - 1)^2*pi^2*tau/4)*sin((2k - 1)*pi*x/2)', k: [1, 'N'], color: 'accent', width: 2.6, when: 'step(bc - 0.5)' },
      ],
    },
    caption: t`Exact series, truncated after $N$ terms: $u = (1 - x) - \sum \tfrac{2}{n\pi}e^{-n^2\pi^2\tau}\sin n\pi x$ (right end held) or $u = 1 - \sum \tfrac{4}{(2n - 1)\pi}e^{-(2n - 1)^2\pi^2\tau/4}\sin\tfrac{(2n - 1)\pi x}{2}$ (insulated), with $\tau = Dt/L^2$. Constant properties.`,
  },
  example: {
    prompt: t`An aluminium rod ($\alpha = ${tex(AL.alpha)}\ \text{m}^2/\text{s}$), ${WE.L * 100} cm long and insulated along its length, is at ${WE.T0} °C. At $t = 0$ its left end is clamped to a ${WE.TA} °C block while its right end stays at ${WE.T0} °C. Find $u(x, t)$, and how long the midpoint takes to come within 1 °C of its final temperature.`,
    visual: { type: 'graph', params: { x: [0, 0.3], y: [15, 105], aspect: 'wide', xlabel: 'x (m)', ylabel: 'T (°C)', axesAt: 'edge', curves: [10, 60, 200, 500].map((s, i) => ({ sum: `(100 - 80*x/0.3)/60 - 160/(k*pi)*e^(-k^2*pi^2*${AL.alpha}*${s}/0.09)*sin(k*pi*x/0.3)`, k: [1, 60], color: ['violet', 'accent', 'teal', 'gold'][i], width: 2.2, label: `${s} s`, labelAt: [0.02, 0.06, 0.12, 0.2][i], labelDy: -10 })).concat([{ fn: '100 - 80*x/0.3', color: 'ink3', dash: [5, 4], width: 1.4 }]) }, caption: 'The rod at 10, 60, 200 and 500 s (60-term series) approaching the straight steady profile (dashed). Constant properties; losses from the rod’s sides ignored.' },
    steps: [
      { label: 'Steady state first', text: t`Sines vanish at both ends, so no sum of them can equal 100 °C at $x = 0$. Split off the steady state $v(x) = ${WE.TA} - ${WE.TA - WE.T0}\,x/L$, which satisfies both end conditions and $v'' = 0$.` },
      { label: 'The rest is homogeneous', text: t`$w = u - v$ solves $w_t = \alpha w_{xx}$ with $w = 0$ at both ends and $w(x, 0) = ${WE.T0} - v(x) = -${WE.TA - WE.T0}(1 - x/L)$.` },
      { label: 'Separate', text: t`$X'' + \lambda X = 0$, $X(0) = X(L) = 0$: $X_n = \sin(n\pi x/L)$, $\lambda_n = (n\pi/L)^2$, and $T_n = e^{-\alpha\lambda_nt}$.` },
      { label: 'Fit the start', text: t`$b_n = \dfrac{2}{L}\displaystyle\int_0^L -${WE.TA - WE.T0}\big(1 - \tfrac{x}{L}\big)\sin\tfrac{n\pi x}{L}\,dx = -\dfrac{${2 * (WE.TA - WE.T0)}}{n\pi}$. So $u = v(x) - \displaystyle\sum_{n \ge 1}\frac{${2 * (WE.TA - WE.T0)}}{n\pi}\,e^{-n^2t/\tau_1}\sin\frac{n\pi x}{L}$, with $\tau_1 = \dfrac{L^2}{\pi^2\alpha} = ${r3(WE.tau1)}$ s.` },
      { label: 'One term is enough', text: t`At the midpoint $\sin(n\pi/2)$ kills every even mode, and mode 3 decays 9 times faster than mode 1. Late on, $|u - v| \approx \dfrac{${2 * (WE.TA - WE.T0)}}{\pi}e^{-t/\tau_1}$; setting this to 1 °C gives $t = \tau_1\ln\dfrac{${2 * (WE.TA - WE.T0)}}{\pi} = ${Math.round(WE.tMid)}$ s.` },
      { label: 'Check the neglect', text: t`Then mode 3 has $\tfrac{${2 * (WE.TA - WE.T0)}}{3\pi}e^{-9t/\tau_1} \approx ${tex(((2 * (WE.TA - WE.T0)) / (3 * Math.PI)) * Math.exp((-9 * WE.tMid) / WE.tau1))}$ °C: negligible.` },
    ],
    answer: t`$u = ${WE.TA} - ${WE.TA - WE.T0}\tfrac{x}{L} - \sum \tfrac{${2 * (WE.TA - WE.T0)}}{n\pi}e^{-n^2t/\tau_1}\sin\tfrac{n\pi x}{L}$ with $\tau_1 \approx ${r3(WE.tau1)}$ s. The midpoint reaches within 1 °C of its final ${(WE.TA + WE.T0) / 2} °C after about ${Math.round(WE.tMid)} s (${r3(WE.tMid / 60)} min).`,
  },
  practice: [
    mcq({
      id: 'why-constant', difficulty: 2,
      prompt: t`Separation gives $\dfrac{T'(t)}{D\,T(t)} = \dfrac{X''(x)}{X(x)}$ for all $x$ in the rod and all $t > 0$. Why must both sides equal the same constant?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x / L', ylabel: '', axesAt: 'edge', curves: [{ fn: 'sin(2*pi*x)', color: 'accent', width: 2.2, label: 't = 0', labelAt: 0.22, labelDy: -10 }, { fn: '0.5*sin(2*pi*x)', color: 'violet', width: 2.2, label: 'later', labelAt: 0.22, labelDy: 14 }] }, caption: 'A separated solution: one shape, shrinking in time — the ratio X″/X is the same at every x.' },
      choices: ['Fix t and vary x: the left side cannot change, so neither can the right; the same with x and t swapped', 'Because the boundary conditions say so', 'Because both sides are zero at the ends', 'They need not be: they are equal functions of x and t'],
      answer: 0,
      why: {
        1: 'The boundary conditions come in later, to decide which constants are allowed.',
        2: 'X(x) is zero at the ends for Dirichlet conditions, so the ratio is not even defined there; the argument uses interior points.',
        3: 'A function of t alone that equals a function of x alone for all x and t cannot depend on either.',
      },
      hints: ['Hold t fixed. How does the left side change as you move along the rod?'],
      teach: 'A function of t alone equal to a function of x alone, for all x and t, must be a constant.',
      explain: t`Moving along the rod at a fixed time changes $X''/X$ but not $T'/(DT)$, so $X''/X$ cannot change: it is a constant. The same argument in time fixes the left side. Call the common value $-\lambda$ (the sign anticipates that the end conditions will make $\lambda$ positive).`,
    }),
    expr({
      id: 'two-mode', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 5]), B = r.pick([1, -1, 2]), m = r.pick([2, 3, 4]), D = r.pick([0.1, 0.5, 2]);
        return {
          prompt: t`Solve $u_t = ${D}\,u_{xx}$ on $0 < x < 1$ with $u(0, t) = u(1, t) = 0$ and $u(x, 0) = ${A}\sin(\pi x) ${B < 0 ? '-' : '+'} ${Math.abs(B) === 1 ? '' : Math.abs(B)}\sin(${m}\pi x)$.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.2 * (A + Math.abs(B)), 1.2 * (A + Math.abs(B))], aspect: 'wide', xlabel: 'x', ylabel: 'u(x, 0)', axesAt: 'edge', curves: [{ fn: `${A}*sin(pi*x) + (${B})*sin(${m}*pi*x)`, color: 'accent', width: 2.4 }] }, caption: 'The initial profile: already a sum of two modes.' },
          answer: `${A}*sin(pi*x)*e^(-${D}*pi^2*t) + (${B})*sin(${m}*pi*x)*e^(-${D * m * m}*pi^2*t)`,
          answerTeX: t`${A}\sin(\pi x)\,e^{-${D}\pi^2t} ${B < 0 ? '-' : '+'} ${Math.abs(B) === 1 ? '' : Math.abs(B)}\sin(${m}\pi x)\,e^{-${tex(D * m * m)}\pi^2t}`,
          lhs: 'u(x, t)',
          vars: { x: [0.05, 0.95], t: [0, 0.5] },
          errors: [{ answer: `${A}*sin(pi*x)*e^(-${D}*pi^2*t) + (${B})*sin(${m}*pi*x)*e^(-${D * m}*pi^2*t)`, feedback: t`Mode $n$ decays at $D(n\pi)^2$: the $n$ is squared, so mode ${m} decays ${m * m} times faster, not ${m}.` }],
          hints: [t`Each sine is already an eigenfunction: $\sin(n\pi x)$ decays as $e^{-D n^2\pi^2t}$.`, t`Attach $e^{-${D}\pi^2t}$ to the first term and $e^{-${D}\cdot${m * m}\pi^2t}$ to the second.`],
          teach: 'When the data are already a sum of eigenfunctions, each simply decays at its own rate Dλₙ — no integrals needed.',
          explain: t`$u = ${A}\sin(\pi x)e^{-${D}\pi^2t} ${B < 0 ? '-' : '+'} ${Math.abs(B)}\sin(${m}\pi x)e^{-${tex(D * m * m)}\pi^2t}$. Both terms vanish at the ends, and at $t = 0$ they reproduce the data; the second dies ${m * m} times faster.`,
        };
      },
    }),
    num({
      id: 'neumann-average', difficulty: 2,
      gen(r) {
        const a = r.pick([0.2, 0.25, 0.4, 0.6]), T1 = r.pick([80, 100, 150]), T2 = r.pick([10, 20, 30]);
        const avg = a * T1 + (1 - a) * T2;
        return {
          prompt: t`A rod is insulated everywhere, ends included. Initially its first ${a * 100}% (from $x = 0$ to $x = ${a}L$) is at ${T1} °C and the rest at ${T2} °C. What temperature does the whole rod settle to, in °C?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, T1 * 1.15], aspect: 'wide', xlabel: 'x / L', ylabel: 'T (°C)', axesAt: 'edge', curves: [{ fn: `${T2} + ${T1 - T2}*step(${a} - x)`, color: 'warn', width: 2.4 }] }, caption: 'The initial profile. Both ends insulated: no heat enters or leaves.' },
          answer: avg, units: '°C', tol: { rel: 0.002 },
          errors: [{ value: (T1 + T2) / 2, feedback: 'That averages the two temperatures, not the rod: weight each by the length it occupies.' }],
          hints: [t`With $X'(0) = X'(L) = 0$ the eigenfunctions are $\cos(n\pi x/L)$, and $n = 0$ — a constant, with $\lambda_0 = 0$ — does not decay.`, t`The constant mode’s coefficient is the average of the initial data.`],
          teach: 'With insulated ends the λ = 0 mode survives: the rod settles to the average of its initial temperature.',
          explain: t`All modes $\cos(n\pi x/L)$ with $n \ge 1$ decay; the constant mode, $\tfrac1L\int_0^L u(x, 0)\,dx = ${a}\times${T1} + ${r3(1 - a)}\times${T2} = ${r3(avg)}$ °C, stays. That is conservation of heat: nothing crosses the ends.`,
        };
      },
    }),
    mcq({
      id: 'inhomogeneous-bc', difficulty: 2,
      prompt: t`A rod’s ends are held at 100 °C and 20 °C. A student writes $u = \sum b_n e^{-D(n\pi/L)^2t}\sin(n\pi x/L)$ and fits the $b_n$ to the initial profile. What goes wrong?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-10, 110], aspect: 'wide', xlabel: 'x / L', ylabel: 'T (°C)', axesAt: 'edge', curves: [{ fn: '100 - 80*x', color: 'ink3', dash: [5, 4], width: 1.4, label: 'what the ends demand', labelAt: 0.5, labelDy: -12 }, { fn: 'sin(pi*x)*120', color: 'warn', width: 2.2, label: 'any sum of sines: 0 at both ends', labelAt: 0.5, labelDy: 18 }] }, caption: 'Every sine vanishes at x = 0 and x = L, so every sum of them does too.' },
      choices: ['Every sine vanishes at both ends, so the series can never satisfy the 100 °C and 20 °C conditions: subtract the steady state first', 'Nothing: with enough terms any function can be matched, ends included', 'The eigenvalues change when the ends are hot', 'The series must use cosines instead'],
      answer: 0,
      why: {
        1: 'Inside the rod the series can match the data, but at the ends every partial sum is exactly 0: it converges to the wrong boundary values, with Gibbs overshoot nearby.',
        2: 'The eigenvalues come from the homogeneous problem for w = u − v; the end temperatures go into v.',
        3: 'Cosines have zero slope at the ends — the insulated (Neumann) problem — which is not this rod.',
      },
      hints: ['What is sin(nπx/L) at x = 0 and x = L?'],
      teach: 'Separation needs homogeneous boundary conditions: subtract a function that carries the boundary data, then separate what is left.',
      explain: t`Write $u = v + w$ with $v$ the straight-line steady state between 100 °C and 20 °C. Then $w$ vanishes at both ends, and *its* sine series is legitimate. The decaying sum describes only the transient.`,
    }),
    code({
      id: 'midpoint-time', difficulty: 3,
      prompt: t`Check the worked example numerically. With $L = 0.3$ m, $\alpha = 7.3\times10^{-5}\ \text{m}^2/\text{s}$, the midpoint temperature is
$$u\big(\tfrac L2, t\big) = 60 - \sum_{n=1}^{N}\frac{160}{n\pi}\,e^{-\alpha(n\pi/L)^2t}\sin\frac{n\pi}{2}.$$
Write \`u_mid(t, N=200)\`. Then find, by bisection on $[1, 2000]$ s, the time \`t1\` at which $60 - u_{\text{mid}} = 1$ (°C), and compare with the one-term estimate \`t_one\` $= \tau_1\ln(160/\pi)$, $\tau_1 = L^2/(\pi^2\alpha)$.`,
      starter: t`import numpy as np

L, alpha = 0.3, 7.3e-5
tau1 = L**2 / (np.pi**2 * alpha)

def u_mid(t, N=200):
    pass

# bisection: find t in [1, 2000] where 60 - u_mid(t) = 1
t1 = None
t_one = tau1 * np.log(160 / np.pi)
print(t1, t_one)
`,
      answer: t`import numpy as np

L, alpha = 0.3, 7.3e-5
tau1 = L**2 / (np.pi**2 * alpha)

def u_mid(t, N=200):
    n = np.arange(1, N + 1)
    return 60 - np.sum(160 / (n * np.pi) * np.exp(-alpha * (n * np.pi / L)**2 * t) * np.sin(n * np.pi / 2))

lo, hi = 1.0, 2000.0
for _ in range(60):
    mid = 0.5 * (lo + hi)
    if 60 - u_mid(mid) > 1:
        lo = mid
    else:
        hi = mid
t1 = 0.5 * (lo + hi)
t_one = tau1 * np.log(160 / np.pi)
print(t1, t_one)`,
      tests: [
        { name: '`u_mid` starts near 20 °C at t = 1 s (the rod’s initial temperature, away from the ends)', code: 'abs(u_mid(1.0) - 20) < 0.5' },
        { name: '`u_mid` approaches 60 °C late on', code: 'abs(u_mid(3000.0) - 60) < 1e-3' },
        { name: 't1 is where the midpoint is 1 °C short of 60 °C', code: 't1 is not None and abs(60 - u_mid(t1) - 1) < 1e-6' },
        { name: 'the one-term estimate agrees with t1 to within 0.1 s', code: 't1 is not None and abs(t1 - t_one) < 0.1' },
      ],
      hints: ['`n = np.arange(1, N + 1)` and one vectorized sum: `np.sum(160/(n*np.pi) * np.exp(-alpha*(n*np.pi/L)**2*t) * np.sin(n*np.pi/2))`.', 'Bisection: keep `lo` where the gap `60 - u_mid(t)` is above 1, `hi` where it is below; halve 60 times.', 'The gap shrinks with time, so if `60 - u_mid(mid) > 1` the answer is later: set `lo = mid`.'],
      teach: 'Late in a diffusion, the slowest mode is the solution: one term predicts the settling time almost exactly.',
      explain: t`Both give about ${Math.round(WE.tMid)} s. By then mode 3 is smaller than mode 1 by a factor $\tfrac13e^{-8t/\tau_1} \approx 10^{-14}$, so 200 terms and one term are the same number. Early on — the first few seconds — you would need dozens.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-backface', difficulty: 3, transfer: true,
      gen(r) {
        const Lcm = r.pick([4, 5, 6]), tmin = r.pick([10, 15, 20]);
        const L = Lcm / 100, tau1 = (4 * L * L) / (Math.PI ** 2 * LI900.alpha), s = (tmin * 60) / tau1;
        const f = backFrac(s), one = 1 - (4 / Math.PI) * Math.exp(-s);
        return {
          prompt: t`A ${Lcm} cm LI-900 tile ($\alpha \approx ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$) starts uniform. Its outer face is suddenly held at a high temperature; its back face is insulated. With $\theta = (T - T_{\text{start}})/(T_{\text{face}} - T_{\text{start}})$, separation gives at the back face
$$\theta_{\text{back}} = 1 - \frac4\pi\sum_{n \ge 1}\frac{(-1)^{n-1}}{2n - 1}\,e^{-(2n - 1)^2t/\tau_1}, \qquad \tau_1 = \frac{4L^2}{\pi^2\alpha}.$$
What fraction of the face’s temperature rise has reached the back face after ${tmin} minutes?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.05], aspect: 'wide', xlabel: 'depth / thickness', ylabel: 'θ', axesAt: 'edge', curves: [{ fn: 'sin(pi*x/2)', color: 'ink3', width: 1.4, dash: [5, 4], label: 'slowest mode shape', labelAt: 0.6, labelDy: 14 }], points: [{ x: 0, y: 1, label: 'hot face held', color: 'warn' }, { x: 1, y: 0, label: 'insulated back', color: 'teal', labelDx: -96, labelDy: -12 }] }, caption: 'The slab and the shape of its slowest mode (a quarter sine, flat at the insulated back). Constant properties and a face held at fixed temperature: a real tile’s conductivity rises with temperature and its face sees a varying heat flux.' },
          answer: f, tol: { rel: 0.01 },
          errors: Math.abs(one - f) > 0.02 * f ? [{ value: one, feedback: 'One term is not enough this early: the higher modes have not died yet. Sum several terms.' }] : [],
          hints: [t`First compute $\tau_1$ in seconds and the ratio $t/\tau_1$.`, t`Sum the first few terms of the series: $n = 1, 2, 3$ usually suffice — check that the next term is negligible.`],
          teach: 'An insulated back face sees the slowest quarter-wave mode: its rise is governed by τ₁ = 4L²/(π²α).',
          explain: t`$\tau_1 = ${r3(tau1)}$ s, so $t/\tau_1 = ${r3(s)}$, and the series gives $\theta_{\text{back}} \approx ${r3(f)}$. ${Math.abs(one - f) > 0.02 * f ? `One term alone would give ${r3(one)}: at this early time the higher modes still matter.` : `One term alone gives ${r3(one)}: by now the slowest mode dominates.`} Low diffusivity is the whole point of a tile: after ${tmin} minutes of entry the bond line has felt only part of the surface’s heat.`,
        };
      },
    }),
    num({
      id: 'cp-two-term', difficulty: 2,
      prompt: t`$u_t = u_{xx}$ on $0 < x < \pi$ with $u(0, t) = u(\pi, t) = 0$ and $u(x, 0) = \sin x + 3\sin 2x$. What is $u(\pi/2, 1)$?`,
      visual: { type: 'graph', params: { x: [0, 3.1416], y: [-3.5, 4.2], aspect: 'wide', xlabel: 'x', ylabel: 'u(x, 0)', axesAt: 'edge', curves: [{ fn: 'sin(x) + 3*sin(2*x)', color: 'accent', width: 2.4 }], vlines: [{ x: 1.5708, label: 'x = π/2', color: 'gold' }] }, caption: 'The initial profile and the point of interest.' },
      answer: Math.exp(-1), tol: { rel: 0.002 },
      errors: [{ value: Math.exp(-1) + 3 * Math.exp(-4), feedback: t`$\sin 2x$ is zero at $x = \pi/2$: that mode contributes nothing there, whatever its amplitude.` }, { value: Math.exp(-1) + 3 * Math.exp(-2), feedback: t`Two errors: mode 2 decays as $e^{-4t}$, and it vanishes at $x = \pi/2$ anyway.` }],
      hints: [t`$u = e^{-t}\sin x + 3e^{-4t}\sin 2x$.`],
      teach: 'Evaluate each mode where it is asked: a mode with a node at that point contributes nothing.',
      explain: t`$u = e^{-t}\sin x + 3e^{-4t}\sin 2x$, so $u(\pi/2, 1) = e^{-1}\cdot1 + 3e^{-4}\cdot\sin\pi = e^{-1} \approx ${r3(Math.exp(-1))}$.`,
    }),
    mcq({
      id: 'cp-late-shape', difficulty: 2,
      prompt: t`Any initial temperature in a rod with both ends held at 0 °C eventually takes a particular shape while it fades. Which, and why?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.3, 1.2], aspect: 'wide', xlabel: 'x / L', ylabel: 'T (scaled)', axesAt: 'edge', curves: [{ fn: '0.6*step(x - 0.2)*step(0.5 - x) + 0.9*step(x - 0.7)*step(0.9 - x)', color: 'ink3', dash: [5, 4], width: 1.4 }, { sum: '2*(0.6*(cos(k*pi*0.2) - cos(k*pi*0.5)) + 0.9*(cos(k*pi*0.7) - cos(k*pi*0.9)))/(k*pi)*e^(-k^2*pi^2*0.03)*sin(k*pi*x)', k: [1, 60], color: 'accent', width: 2.4 }] }, caption: 'An arbitrary initial profile (dashed) after Dt/L² = 0.03 (60-term series): already nearly one smooth hump.' },
      choices: [t`$\sin(\pi x/L)$, because every other mode decays at least 4 times faster`, 'Its own initial shape, scaled down', 'A straight line between the ends', 'A Gaussian centred on the hottest point'],
      answer: 0,
      why: {
        1: 'Different modes fade at different rates, so the shape changes until only the slowest is left.',
        2: 'The straight line is the steady state; with both ends at 0 it is just 0 — the limit, not the shape on the way.',
        3: 'A Gaussian is the infinite-line answer (lesson B4.2); the ends of a finite rod impose sines.',
      },
      hints: [t`Mode $n$ decays as $e^{-n^2t/\tau_1}$.`],
      teach: 'Late in diffusion the slowest eigenmode wins: the shape is the first eigenfunction.',
      explain: t`Mode $n$ decays as $e^{-n^2t/\tau_1}$: relative to mode 1, mode 2 shrinks as $e^{-3t/\tau_1}$, and higher modes faster still. Unless the initial data happen to have no $\sin(\pi x/L)$ component, the profile approaches that single hump, fading at the rate $D\pi^2/L^2$.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'R. Haberman, Applied Partial Differential Equations, 5th ed. (Pearson, 2013), ch. 2', url: 'https://openlibrary.org/isbn/9780321797056' }, SRC.incropera, SRC.tpsx],
});
