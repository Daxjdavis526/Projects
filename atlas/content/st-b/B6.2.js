// Uniqueness by energy methods: the difference w of two solutions solves the
// homogeneous problem; Green's first identity (or d/dt of ½∫w²) shows its
// "energy" must vanish. Dirichlet: unique. Neumann: unique up to a constant.
// Robin: unique for the physical sign. Heat: E(t) decreases, which also gives
// stability, quantitatively via the Poincaré inequality. Backward heat: no bound.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { MATERIALS, SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
// Explore: the difference of two solutions on [0, 1] with Dirichlet ends, D = 0.1
const B = [[1, 1], [2, -0.6], [3, 0.35], [6, 0.06]];
const wExpr = B.map(([n, b]) => `${b}*sin(${n}*pi*x)*e^(-dir*${n * n}*pi^2*0.1*t)`).join(' + ');
const EExpr = B.map(([n, b]) => `${(b * b) / 4}*e^(-2*dir*${n * n}*pi^2*0.1*t)`).join(' + ');
// backward-heat picture: the growth of sin(πx) and sin(8πx) over Dt = 0.006
const BK = { Dt: 0.006 };
BK.smooth = Math.exp(Math.PI ** 2 * BK.Dt); BK.ripple = Math.exp(64 * Math.PI ** 2 * BK.Dt);
const E0 = B.reduce((s, [, b]) => s + (b * b) / 4, 0);

export default lesson({
  id: 'st-b.B6.2',
  title: 'Uniqueness by energy methods',
  minutes: 13, difficulty: 3,
  intro: t`How do you know a boundary-value problem has **only one** solution — that the one you found (by guessing, by series, by computer) is *the* answer? Take two solutions $u_1$ and $u_2$ of the same problem. By linearity their difference $w = u_1 - u_2$ solves the problem with **all data zero**. Now show that $w$ has zero “energy”. For Laplace’s and Poisson’s equations the tool is **Green’s first identity** — integration by parts in several dimensions:

$$\int_\Omega |\nabla w|^2\,dV = \oint_{\partial\Omega} w\,\frac{\partial w}{\partial n}\,dS - \int_\Omega w\,\nabla^2w\,dV .$$

With $\nabla^2w = 0$ inside and $w = 0$ on the boundary (Dirichlet), the right side vanishes, so $\nabla w = 0$: $w$ is constant, and that constant is its boundary value, 0. **The solution is unique.** The same move — multiply by $w$, integrate, integrate by parts — proves uniqueness for heat and wave problems too, and says more: how close two solutions stay when their data are close.`,
  symbols: [
    { tex: 'w', text: 'the difference of two candidate solutions; it satisfies the problem with zero sources and zero boundary data' },
    { tex: t`\Omega,\ \partial\Omega`, text: 'the region, and its boundary' },
    { tex: t`|\nabla w|^2`, text: 'the squared gradient, $w_x^2 + w_y^2 + w_z^2$ — never negative, so its integral is zero only if $\\nabla w = 0$ everywhere' },
    { tex: t`\frac{\partial w}{\partial n}`, text: 'the outward normal derivative on the boundary (lesson B6.1)' },
    { tex: t`dV,\ dS`, text: 'volume and surface elements (area and length elements in 2D)' },
  ],
  why: t`Proving that Einstein’s equations have unique, stable solutions for given initial data is exactly this kind of energy estimate, done for a system of nonlinear wave equations in a well-chosen gauge (module B15); where no such estimate exists — the weakly hyperbolic formulations of module B12 — numerical relativity codes blow up.`,
  visual: {
    type: 'graph',
    title: 'The difference of two solutions dies',
    lead: t`Two solutions of the heat equation on a rod with both ends held, started from slightly different data. Their difference $w$ obeys the same equation with zero ends. Its energy $E = \tfrac12\int w^2\,dx$ can only fall. Then switch the arrow of time.`,
    tasks: [
      'Slide t forward: w shrinks and smooths; the readout E(t) only ever decreases — two solutions can only approach each other.',
      'At t = 0, w = 0 would stay 0 for ever: that is uniqueness.',
      'Choose “backward”: the small, fast ripple in w explodes. The energy argument gives no bound, and the backward problem is unstable.',
    ],
    params: {
      x: [0, 1], y: [-1.9, 1.9], aspect: 'wide', xlabel: 'x (rod length 1)', ylabel: 'w', axesAt: 'edge',
      choices: [{ key: 'dir', label: 'Direction', options: [[1, 'forward (heat)'], [-1, 'backward in time']], value: 1, explain: 'Backward means solving $w_t = -D\\,w_{xx}$: recovering the past from the present.' }],
      sliders: [{ key: 't', label: 'Time $t$', min: 0, max: 0.3, step: 0.005, value: 0, explain: 'Diffusivity $D = 0.1$ (scaled units).' }],
      curves: [
        { fn: B.map(([n, b]) => `${b}*sin(${n}*pi*x)`).join(' + '), color: 'ink3', dash: [5, 4], width: 1.3 },
        { fn: wExpr, color: 'accent', width: 2.6 },
      ],
      readouts: [{ label: t`$E(t) = \tfrac12\int w^2\,dx$`, expr: EExpr, digits: 3 }, { label: t`$E(t)/E(0)$`, expr: `(${EExpr})/${E0}`, digits: 3 }],
    },
    caption: t`Exact: $w = \sum b_n e^{\mp n^2\pi^2Dt}\sin n\pi x$ with four modes (dashed: $w$ at $t = 0$). The readouts use $\tfrac12\int_0^1\sin^2 n\pi x\,dx = \tfrac14$. Going backward, curves leave the window: that is the point.`,
  },
  example: {
    prompt: t`Show that the heat problem $u_t = D\,u_{xx}$ on $0 < x < L$, with $u(0, t) = A(t)$, $u(L, t) = B(t)$ and $u(x, 0) = f(x)$, has at most one solution, and that solutions starting from nearby data stay nearby. How fast must the difference shrink, at least?`,
    visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.05], aspect: 'wide', xlabel: 't (scaled: D π² t / L²)', ylabel: 'E(t) / E(0)', axesAt: 'edge', curves: [
      { fn: 'e^(-2*x)', color: 'gold', width: 2.2, dash: [6, 4], label: 'bound e^(−2Dπ²t/L²)', labelAt: 0.55, labelDy: -14 },
      { fn: '(e^(-2*x) + 0.36*e^(-8*x) + 0.1225*e^(-18*x))/1.4825', color: 'accent', width: 2.6, label: 'a real difference', labelAt: 0.18, labelDx: 8 },
    ] }, caption: t`The energy of a difference made of three modes (blue) always lies under the Poincaré bound (gold), which is reached only by the slowest mode alone.` },
    steps: [
      { label: 'The difference', text: t`Let $u_1, u_2$ be two solutions and $w = u_1 - u_2$. Then $w_t = D\,w_{xx}$, $w(0, t) = w(L, t) = 0$ and $w(x, 0) = f_1 - f_2$.` },
      { label: 'An energy', text: t`Define $E(t) = \tfrac12\int_0^L w^2\,dx \ge 0$. Differentiate under the integral and use the equation: $E'(t) = \int_0^L w\,w_t\,dx = D\int_0^L w\,w_{xx}\,dx$.` },
      { label: 'Integrate by parts', text: t`$D\int_0^L w\,w_{xx}\,dx = D\big[w\,w_x\big]_0^L - D\int_0^L w_x^2\,dx$. The bracket vanishes because $w = 0$ at both ends. So $E'(t) = -D\int_0^L w_x^2\,dx \le 0$.` },
      { label: 'Uniqueness', text: t`If $f_1 = f_2$, then $E(0) = 0$; $E$ cannot rise and cannot go negative, so $E(t) = 0$ for all $t$: $w \equiv 0$, $u_1 = u_2$.` },
      { label: 'Stability', text: t`If $f_1 \ne f_2$, still $E(t) \le E(0)$: the rms difference never grows. Sharper: for $w$ vanishing at both ends, $\int w_x^2 \ge (\pi/L)^2\int w^2$ (the Poincaré, or Wirtinger, inequality — equality for $\sin(\pi x/L)$), so $E' \le -2D(\pi/L)^2E$ and $E(t) \le E(0)\,e^{-2D\pi^2t/L^2}$.` },
    ],
    answer: t`$E(t) = \tfrac12\int w^2$ satisfies $E' = -D\int w_x^2 \le 0$, so the solution is unique, and the rms difference of two solutions decays at least as fast as $e^{-D\pi^2t/L^2}$ — the decay rate of the slowest mode.`,
  },
  practice: [
    order({
      id: 'laplace-proof', difficulty: 2,
      prompt: t`Put the steps of the uniqueness proof for the Dirichlet problem $\nabla^2u = f$ in $\Omega$, $u = g$ on $\partial\Omega$, in order.`,
      items: [
        t`Let $u_1, u_2$ be solutions and set $w = u_1 - u_2$: then $\nabla^2w = 0$ in $\Omega$ and $w = 0$ on $\partial\Omega$.`,
        t`Green’s first identity: $\int_\Omega|\nabla w|^2\,dV = \oint w\,\partial_n w\,dS - \int_\Omega w\,\nabla^2w\,dV$.`,
        t`Both terms on the right vanish: $w = 0$ on the boundary, $\nabla^2w = 0$ inside.`,
        t`An integral of $|\nabla w|^2 \ge 0$ that equals zero forces $\nabla w = 0$: $w$ is constant.`,
        t`The constant equals the boundary value 0, so $u_1 = u_2$.`,
      ],
      hints: ['First set up the difference, then apply the identity, then read off what vanishes.', 'Only after knowing ∇w = 0 can you use the boundary value to fix the constant.'],
      teach: 'Energy uniqueness: the difference solves the zero problem, and an integral identity forces its gradient — then itself — to vanish.',
      explain: t`The order matters: the identity is useful only once $w$ solves the homogeneous problem; zero energy gives only “constant”; the boundary data turn constant into zero. Neumann data would stop the proof at the fourth step.`,
    }),
    mcq({
      id: 'neumann-gap', difficulty: 2,
      prompt: t`Run the same proof for the Neumann problem $\nabla^2u = f$, $\partial u/\partial n = g$. Where does it end?`,
      visual: { type: 'c3-contour', params: { f: 'x^2 - y^2 + 0.5*x', x: [-1.6, 1.6], y: [-1, 1], levels: 9, labels: false, curves: [{ param: ['-1 + 2*t', '-1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1 + 2*t', '1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }, { param: ['1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }] }, caption: 'A solution of a Neumann problem (illustrative). Lifting the whole surface by a constant changes no slope on the edge.' },
      choices: [t`At $\nabla w = 0$: $w$ is a constant that nothing pins down — unique up to a constant`, t`At $w = 0$: Neumann problems are unique too`, 'It fails at the first step: the difference of two Neumann solutions is not a solution', 'It fails because Green’s identity needs Dirichlet data'],
      answer: 0,
      why: {
        1: t`To go from “constant” to “zero” the proof used $w = 0$ on the boundary. Neumann data only say $\partial w/\partial n = 0$, which every constant satisfies.`,
        2: 'The problem is linear: the difference of two solutions solves it with zero source and zero flux.',
        3: t`The identity holds for any smooth $w$. With $\partial w/\partial n = 0$ its boundary term vanishes just as well.`,
      },
      hints: [t`The boundary term $\oint w\,\partial_n w\,dS$ still vanishes. What is missing at the very last step?`],
      teach: 'Neumann problems are unique only up to an added constant: flux data cannot see the level.',
      explain: t`The energy still vanishes, so $\nabla w = 0$ and $w$ is constant. Nothing in Neumann data fixes the constant: two solutions can differ by one (lesson B6.1’s $+K$). An extra condition — a reference value, a zero average, a known total heat content — removes the freedom.`,
    }),
    mcq({
      id: 'robin-sign', difficulty: 3,
      prompt: t`The Robin condition $\partial u/\partial n + \alpha u = g$ comes from Newton cooling with $\alpha = h/k$. Green’s identity for the difference gives $\int_\Omega|\nabla w|^2\,dV = -\alpha\oint w^2\,dS$. For which $\alpha$ does this prove uniqueness?`,
      visual: { type: 'graph', params: { x: [0, 1.25], y: [0, 1.2], aspect: 'wide', xlabel: 'x', ylabel: 'T', axesAt: 'edge', curves: [{ fn: '0.3 + 0.5*x^2', domain: [0, 1], color: 'accent', width: 2.4 }, { param: ['1', 't'], t: [0, 1.15], color: 'ink2', width: 2 }], hlines: [{ y: 0.35, color: 'teal', label: 'T∞' }], arrows: [{ from: [1.02, 0.8], to: [1.2, 0.8], color: 'warn', label: 'heat out ∝ T − T∞', labelDx: -120, labelDy: -14 }] }, caption: t`A warm end losing heat to cooler fluid: with $\alpha = h/k > 0$, the hotter the surface, the more heat leaves.` },
      choices: [t`$\alpha > 0$: heat leaks out to cooler surroundings`, t`$\alpha < 0$`, t`every $\alpha \ne 0$`, t`only $\alpha = 0$, the Neumann case`],
      answer: 0,
      why: {
        1: t`Then the right side $-\alpha\oint w^2$ is positive and nothing forces zero — and for some negative $\alpha$ the zero problem really does have nonzero solutions.`,
        2: t`Negative $\alpha$ can fail: on an interval there is a negative value for which a straight line solves the zero problem.`,
        3: 'α = 0 is the Neumann case, which is unique only up to a constant.',
      },
      hints: [t`The left side is $\ge 0$. When is the right side $\le 0$?`, t`If $\alpha > 0$, both sides must be zero: then $\nabla w = 0$ and $\oint w^2 = 0$.`],
      teach: 'Robin uniqueness needs the physical sign: the boundary must remove heat in proportion to the excess temperature.',
      explain: t`For $\alpha > 0$: left $\ge 0$, right $\le 0$, so both vanish — $w$ is constant and zero on the boundary, so $w = 0$. For $\alpha < 0$ the argument says nothing, and for particular negative values uniqueness genuinely fails. A boundary that *pumps in* heat in proportion to its temperature is unphysical, and the mathematics notices.`,
    }),
    num({
      id: 'energy-decay', difficulty: 2,
      gen(r) {
        const m = r.pick(MATERIALS), L = r.pick([0.05, 0.1, 0.2]), n = r.pick([1, 2, 3]);
        const rate = 2 * m.alpha * (n * Math.PI / L) ** 2;
        const tt = +(r.pick([0.7, 1.5, 3]) / rate).toPrecision(2);
        const ratio = Math.exp(-rate * tt);
        return {
          prompt: t`Two predictions for the temperature in a ${L * 100} cm ${m.short} rod (ends held at fixed temperatures, $\alpha = ${tex(m.alpha)}\ \text{m}^2/\text{s}$) start from data that differ by $w(x, 0) = 2\sin(${n === 1 ? '' : n}\pi x/L)$ K. By what factor has the energy $E = \tfrac12\int w^2\,dx$ of their difference fallen after ${tt} s?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-2.3, 2.3], aspect: 'wide', xlabel: 'x / L', ylabel: 'w (K)', axesAt: 'edge', curves: [{ fn: `2*sin(${n}*pi*x)`, color: 'accent', width: 2.4 }] }, caption: 'The initial difference between the two predictions.' },
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-rate * tt / 2), feedback: t`That is the factor for the amplitude of $w$. The energy is quadratic in $w$, so it falls twice as fast in the exponent.` }],
          hints: [t`$w = 2\sin(n\pi x/L)\,e^{-\alpha(n\pi/L)^2t}$, a single mode.`, t`$E \propto w^2$, so $E(t)/E(0) = e^{-2\alpha(n\pi/L)^2t}$.`],
          teach: 'For one mode, the energy of the difference decays at twice the mode’s decay rate.',
          explain: t`$E(t)/E(0) = e^{-2\alpha(n\pi/L)^2t} = e^{-${r3(rate * tt)}} = ${tex(ratio)}$.`,
        };
      },
    }),
    num({
      id: 'green-check', difficulty: 2,
      gen(r) {
        const m = r.int(1, 3), n = r.int(1, 3), val = ((m * m + n * n) * Math.PI ** 2) / 4;
        return {
          prompt: t`For $w = \sin(${m === 1 ? '' : m}\pi x)\sin(${n === 1 ? '' : n}\pi y)$ on the unit square (zero on its edge), compute $\displaystyle\iint|\nabla w|^2\,dA$.`,
          visual: { type: 'surface3d', params: { z: `sin(${m}*pi*(x + 1)/2)*sin(${n}*pi*(y + 1)/2)`, domain: [[-1, 1], [-1, 1]], zscale: 0.8, levels: 7 }, caption: 'The function on the unit square, drawn over a square of side 2 for visibility.' },
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: val * 2, feedback: t`Each average of $\sin^2$ or $\cos^2$ over $[0, 1]$ is $\tfrac12$, and there are two factors in each term: $\tfrac14$, not $\tfrac12$.` }],
          hints: [t`$w_x = ${m}\pi\cos(${m}\pi x)\sin(${n}\pi y)$; $\iint\cos^2(\cdot)\sin^2(\cdot)\,dA = \tfrac12\cdot\tfrac12$.`, t`So $\iint w_x^2 = ${m * m}\pi^2/4$ and $\iint w_y^2 = ${n * n}\pi^2/4$.`],
          teach: 'Green’s identity check: ∫|∇w|² equals −∫w∇²w when w vanishes on the boundary.',
          explain: t`$\iint|\nabla w|^2 = \dfrac{(${m * m} + ${n * n})\pi^2}{4} = ${r3(val)}$. Check with Green’s identity: $\nabla^2w = -(${m * m} + ${n * n})\pi^2w$ and $\iint w^2 = \tfrac14$, so $-\iint w\nabla^2w = (${m * m + n * n})\pi^2/4$ ✓ — the boundary term is zero because $w$ is.`,
        };
      },
    }),
    mcq({
      id: 'backward-energy', difficulty: 2,
      prompt: t`Repeat the heat-equation energy argument for the **backward** heat equation $w_t = -D\,w_{xx}$ (with zero ends). What do you get, and what does it mean?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-2.7, 2.7], aspect: 'wide', xlabel: 'x', ylabel: 'w', axesAt: 'edge', curves: [{ fn: 'sin(pi*x) + 0.03*sin(8*pi*x)', color: 'ink3', dash: [5, 4] }, { fn: `sin(pi*x)*e^(${BK.Dt}*pi^2) + 0.03*sin(8*pi*x)*e^(64*pi^2*${BK.Dt})`, color: 'warn', width: 2.2 }] }, caption: `Data with a 3% fine ripple (dashed), run backward for Dt = ${BK.Dt} (orange): the ripple has grown ${Math.round(BK.ripple)}-fold while the smooth part grew by only ${Math.round((BK.smooth - 1) * 100)}%.` },
      choices: [t`$E' = +D\int w_x^2 \ge 0$: the energy can grow, so small errors are not controlled — the backward problem is unstable`, t`$E' = -D\int w_x^2$, the same as forward`, t`$E' = 0$: energy is conserved, as for waves`, 'The argument cannot even be started backward'],
      answer: 0,
      why: {
        1: 'The sign of D flips the sign of the result.',
        2: 'Conservation needs a time-reversible equation such as the wave equation; the heat equation is not.',
        3: 'Every step goes through; only the sign of the conclusion changes.',
      },
      hints: [t`$E' = \int w\,w_t = -D\int w\,w_{xx}$; integrate by parts.`],
      teach: 'The energy method shows direction matters: forward heat flow shrinks differences, backward heat flow can amplify them without bound.',
      explain: t`$E' = -D\big[w\,w_x\big] + D\int w_x^2 = D\int w_x^2 \ge 0$. A mode $\sin(n\pi x)$ grows as $e^{Dn^2\pi^2t}$: the finer the error, the faster it explodes. Lesson B4.3 met this; module B12 names it — the backward heat equation is **ill-posed** in Hadamard’s sense.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-robin-counter', difficulty: 3,
      prompt: t`On $[0, 1]$, consider $w'' = 0$ with the Robin conditions $\partial w/\partial n + \alpha w = 0$ at both ends (so $-w'(0) + \alpha w(0) = 0$ and $w'(1) + \alpha w(1) = 0$). Apart from $\alpha = 0$, for which value of $\alpha$ does this problem have a nonzero solution — so that uniqueness fails?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: 'w', axesAt: 'edge', curves: [{ fn: '0.8 - 1.4*x', color: 'ink3', width: 2, dash: [5, 4], label: 'try w = a + bx', labelAt: 0.3, labelDx: 8 }] }, caption: 'A trial straight line: the general solution of w″ = 0.' },
      answer: -2, tol: { rel: 0, abs: 0.01 },
      errors: [{ value: 2, feedback: t`Check the left end: the outward normal there is $-x$, so $\partial_n w = -w'(0)$. Its sign is what makes $\alpha$ negative.` }],
      hints: [t`Write $w = a + bx$. The left condition gives $b = \alpha a$; the right one gives $b + \alpha(a + b) = 0$.`, t`Substitute: $\alpha a(2 + \alpha) = 0$. A nonzero $a$ needs $\alpha = 0$ or $\alpha = -2$.`],
      teach: 'Uniqueness can fail for Robin conditions of the unphysical sign: the zero problem then has nonzero solutions.',
      explain: t`$w = a + bx$: left, $-b + \alpha a = 0$; right, $b + \alpha(a + b) = 0$. Together $\alpha a(2 + \alpha) = 0$, so $\alpha = -2$ (and $\alpha = 0$, the Neumann case, with $w$ constant) admit $a \ne 0$: $w = 1 - 2x$. Negative $\alpha$ means heat pumped *in* where the surface is warm — exactly the sign the energy proof excludes.`,
    }),
    num({
      id: 'cp-stability', difficulty: 3, transfer: true,
      gen(r) {
        const SS = MATERIALS[1], Lmm = r.pick([3, 4, 6]), tt = r.pick([1, 2, 5]), d = r.pick([1, 2, 5]);
        const L = Lmm / 1000, fac = Math.exp((-SS.alpha * Math.PI ** 2 * tt) / (L * L)), bound = d * fac;
        return {
          prompt: t`Two thermal predictions for a ${Lmm} mm stainless-steel tank wall ($\alpha = ${tex(SS.alpha)}\ \text{m}^2/\text{s}$), both faces held at the same fixed temperatures, start from initial temperature profiles whose rms difference is $${d}$ K. Using $E(t) \le E(0)\,e^{-2\alpha\pi^2t/L^2}$, what is the largest rms difference possible after ${tt} s, in K?`,
          visual: { type: 'graph', params: { x: [0, tt], y: [0, d * 1.1], aspect: 'wide', xlabel: 't (s)', ylabel: 'rms difference bound (K)', axesAt: 'edge', curves: [{ fn: `${d}*e^(-${SS.alpha * Math.PI ** 2 / (L * L)}*x)`, color: 'gold', width: 2.4, dash: [6, 4] }] }, caption: 'The guaranteed bound on the rms difference, falling from its initial value. Constant properties; real tank walls are rarely held at fixed temperatures on both faces.' },
          answer: bound, units: 'K', tol: { rel: 0.01 }, difference: true,
          errors: [{ value: d * fac * fac, feedback: t`The bound is on $E \propto (\text{rms})^2$: the rms difference decays at half that exponent, $e^{-\alpha\pi^2t/L^2}$.` }],
          hints: [t`rms difference $= \sqrt{2E/L}$, so it scales as $\sqrt E$.`, t`rms$(t) \le$ rms$(0)\,e^{-\alpha\pi^2t/L^2}$.`],
          teach: 'An energy estimate is a stability guarantee: nearby initial data give solutions that stay — here, get — closer.',
          explain: t`rms$(t) \le ${d}\,e^{-\alpha\pi^2t/L^2} = ${d}\times${tex(fac)} = ${tex(bound)}$ K. Whatever the details of the two initial profiles, the wall forgets their disagreement within seconds: the heat problem is well-posed and strongly stable forward in time.`,
        };
      },
    }),
    mcq({
      id: 'cp-satellite', difficulty: 2, transfer: true,
      prompt: t`A thermal model of a sealed instrument in deep space treats every outer face as perfectly insulated and has no internal power. Two engineers solve the steady problem $\nabla^2T = 0$, $\partial T/\partial n = 0$ and get uniform temperatures of 250 K and 290 K. Who is right, and what extra information settles it?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [200, 320], aspect: 'wide', xlabel: 'position (scaled)', ylabel: 'T (K)', axesAt: 'edge', curves: [{ fn: '250', color: 'accent', width: 2.4, label: '250 K', labelAt: 0.1, labelDy: -10 }, { fn: '290', color: 'warn', width: 2.4, label: '290 K', labelAt: 0.1, labelDy: -10 }] }, caption: 'Two uniform temperatures: both satisfy the steady equation with zero flux on every face.' },
      choices: ['Both solve the stated problem; the instrument’s total heat content (its energy) fixes which uniform temperature it has', 'Only 250 K: insulated faces must be cold', 'Only 290 K: it is closer to room temperature', 'Neither: an insulated body cannot have a uniform temperature'],
      answer: 0,
      why: {
        1: 'Insulation fixes the flux, not the level. Nothing in the stated problem prefers one constant.',
        2: 'Room temperature appears nowhere in the problem.',
        3: 'A uniform temperature has zero gradient everywhere, so zero flux on every face: it satisfies everything.',
      },
      hints: ['The energy argument for a Neumann problem stops at “w is constant”.'],
      teach: 'A pure Neumann problem determines the solution only up to a constant; a conserved quantity — here the heat content — supplies it.',
      explain: t`Steady Neumann problems are unique only up to a constant, so both answers solve the model. With no heat in or out, the total energy $\int\rho c\,T\,dV$ is conserved from the moment the instrument was sealed off; that number picks the constant. (Real spacecraft radiate, a Robin-like condition, which removes the ambiguity.)`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, SRC.incropera],
});
