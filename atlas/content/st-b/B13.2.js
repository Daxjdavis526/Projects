// Stability, the CFL condition and blow-up: von Neumann analysis puts a grid
// mode uⱼⁿ = Gⁿe^(ijθ) into a scheme; it is stable when |G(θ)| ≤ 1 for every
// θ = kΔx. Upwind: G = 1 − ν(1 − e^(−iθ)), a circle of radius ν about 1 − ν,
// inside the unit circle iff 0 ≤ ν ≤ 1. The CFL condition (Courant, Friedrichs
// & Lewy 1928): the numerical domain of dependence must contain the physical
// one — necessary (downwind fails it at every ν), not sufficient (FTCS for
// advection meets it, yet |G|² = 1 + ν² sin²θ). Blow-up starts at the grid
// scale: the sawtooth θ = π, multiplied by |1 − 2ν| per upwind step. Numbers
// from model/pde4-fd.js: a square pulse under upwind at ν = 1.1 passes 10 in
// 32 steps; FTCS at ν = 0.5 in 41; leapfrog waves stable to ν = 1, and to
// 1/√3 in 3D with equal spacing (research notes). B4.3 already has the FTCS
// heat limit r ≤ ½ as code; not repeated.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';
import { maxGain, gain, cabs, run } from '../../src/viz/model/pde4-fd.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const scheme = (params, caption) => ({ type: 'pde4-scheme', params: { controls: false, play: false, readout: false, ...params }, caption });
const CFL1928 = { label: 'R. Courant, K. Friedrichs & H. Lewy, Über die partiellen Differenzengleichungen der mathematischen Physik, Math. Ann. 100, 32–74 (1928)', url: 'https://doi.org/10.1007/BF01448839' };
const STRIKWERDA = { label: 'J. C. Strikwerda, Finite Difference Schemes and Partial Differential Equations, 2nd ed. (SIAM, 2004), ch. 1–2', url: 'https://doi.org/10.1137/1.9780898717938' };
const LEVEQUE07 = { label: 'R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007), ch. 10', url: 'https://doi.org/10.1137/1.9780898717839' };

// the worked example: upwind at ν = 1.2, a seed of size 10⁻¹⁶ in the sawtooth mode
const WX = { nu: 1.2 };
WX.G = Math.abs(1 - 2 * WX.nu);
WX.n16 = Math.log(1e16) / Math.log(WX.G);
WX.box = run({ eq: 'advect', scheme: 'upwind', N: 100, nu: WX.nu, profile: 'box', w: 1, t: 100, cap: 10 }).blown;
const SAW = run({ eq: 'advect', scheme: 'upwind', N: 100, nu: 1.1, profile: 'box', w: 1, t: 2.86, cap: 1e9 });

export default lesson({
  id: 'st-b.B13.2',
  title: 'Stability, the CFL condition and blow-up',
  minutes: 16, difficulty: 3,
  intro: t`A scheme can be consistent — every step a fine imitation of the PDE — and still explode. To see whether it will, feed it a single grid wave, $u_j^n = G^n e^{ij\theta}$ with $\theta = k\,\Delta x$ between $-\pi$ and $\pi$. Each step multiplies the wave by the **amplification factor** $G(\theta)$; the scheme is **stable** if no wave grows, $|G(\theta)| \le 1$ for every $\theta$ (von Neumann’s test). For upwind,

$$G(\theta) = 1 - \nu\,\big(1 - e^{-i\theta}\big),$$

a circle of radius $\nu$ centred at $1 - \nu$: inside the unit circle exactly when $0 \le \nu \le 1$. Behind that limit is a geometric rule, the **CFL condition** (Courant, Friedrichs and Lewy, 1928): the grid values a scheme uses must reach back at least as far as the PDE’s own domain of dependence. A scheme that steps further than its stencil can see cannot be right — and the first thing to go is the shortest wave the grid holds, the sawtooth $\theta = \pi$.`,
  symbols: [
    { tex: 'G(\\theta)', text: 'the amplification factor: the complex number one step multiplies the grid wave $e^{ij\\theta}$ by' },
    { tex: '\\theta = k\\,\\Delta x', text: 'the wave’s phase change from one grid point to the next (rad); $\\theta = \\pi$ is the sawtooth $+\\,-\\,+\\,-$' },
    { tex: 'e^{ij\\theta}', text: 'the grid wave: $j$ counts grid points, $i$ is $\\sqrt{-1}$' },
    { tex: '\\nu = c\\,\\Delta t/\\Delta x', text: 'the Courant number: cells a wave of speed $c$ crosses per time step' },
    { tex: '|G|', text: 'the factor by which the wave’s amplitude changes per step; after $n$ steps, $|G|^n$' },
  ],
  why: t`Every explicit simulation — rocket-engine combustion, weather, colliding black holes — sets its time step by a CFL condition on its fastest signal: sound in a combustor, light in numerical relativity. A run that suddenly fills with a cell-to-cell zigzag and overflows is almost never a typo: it is a scheme past its stability limit.`,
  visual: {
    type: 'pde4-scheme',
    title: 'Push the Courant number past 1',
    lead: t`A square pulse carried right at $c = 1$ m/s. Below the profile: the stencil’s reach against the characteristic (the CFL picture), and the amplification factor $G(\theta)$ against the unit circle (the von Neumann picture). Red marks anything growing.`,
    tasks: [
      t`Upwind: slide $\nu$ from 0.9 to 1.1 and play. The characteristic leaves the shaded triangle, $G(\theta)$ bulges out of the circle at $\theta = \pi$, and a zigzag grows from the pulse’s corners until it swamps everything.`,
      t`FTCS at $\nu = 0.5$: the characteristic is well inside the stencil — CFL is satisfied — yet $G$ sits outside the circle for every $\theta$ and the run blows up anyway.`,
      t`Downwind: its stencil looks the wrong way, so no time step can satisfy CFL. Lax–Wendroff, like upwind, is stable up to $\nu = 1$ exactly.`,
    ],
    params: { eq: 'advect', scheme: 'upwind', schemes: ['upwind', 'ftcs', 'lw', 'downwind'], nu: 0.9, numax: 1.5, N: 100, profile: 'box', w: 1, tmax: 12, panels: ['profile', 'cone', 'gain'], levels: 5, ylim: [-0.6, 1.6], controls: ['scheme', 'nu', 'profile', 'noise', 't'] },
    caption: t`Periodic domain 10 m long, 100 grid points. In the complex-plane panel the curve is $G(\theta)$ for $\theta$ from $-\pi$ to $\pi$; the dashed circle is $|G| = 1$. The cone panel is drawn in cells and steps.`,
  },
  example: {
    prompt: t`Run upwind at $\nu = ${WX.nu}$. Find the amplification of the sawtooth mode, and estimate how many steps it takes round-off (about $10^{-16}$ of the solution) to grow to the size of the solution itself.`,
    visual: scheme({ eq: 'advect', scheme: 'upwind', nu: WX.nu, panels: ['gain'] }, t`Upwind’s $G(\theta)$ at $\nu = ${WX.nu}$: a circle of radius ${WX.nu} centred at $1 - ${WX.nu} = ${r3(1 - WX.nu)}$, bulging out of the unit circle around $\theta = \pi$.`),
    steps: [
      { label: 'Insert the grid wave', text: t`$u_j^{n+1} = (1 - \nu)u_j^n + \nu\,u_{j-1}^n$ with $u_j^n = G^ne^{ij\theta}$: dividing by $G^ne^{ij\theta}$ gives $G = 1 - \nu + \nu\,e^{-i\theta}$.` },
      { label: 'The sawtooth', text: t`At $\theta = \pi$, $e^{-i\pi} = -1$: $G(\pi) = 1 - 2\nu = ${r3(1 - 2 * WX.nu)}$. The minus sign flips the zigzag every step; its size grows by $${r3(WX.G)}$.` },
      { label: 'Is it the worst', text: t`$|G|^2 = 1 - 2\nu(1 - \nu)(1 - \cos\theta)$. For $\nu > 1$ the factor $-2\nu(1 - \nu)$ is positive, so $|G|$ is largest where $1 - \cos\theta$ is, at $\theta = \pi$: the grid’s shortest wave grows fastest.` },
      { label: 'Count steps', text: t`$${r3(WX.G)}^n = 10^{16}$ gives $n = \ln 10^{16}/\ln ${r3(WX.G)} \approx ${Math.round(WX.n16)}$ steps.` },
      { label: 'CFL view', text: t`At $\nu = ${WX.nu}$ the characteristic through a grid point lands $${WX.nu}$ cells back after one step, outside the two points ($j - 1$ and $j$) the update uses. No choice of weights could follow it.` },
      { label: 'Sense check', text: t`Data with jumps hold a much larger sawtooth seed than round-off: the model’s square pulse passes 10 after just ${WX.box} steps at this $\nu$. Either way the run dies — the only cure is $\nu \le 1$.` },
    ],
    answer: t`$G(\pi) = 1 - 2\nu = ${r3(1 - 2 * WX.nu)}$, so a zigzag grows by $${r3(WX.G)}$ per step: round-off reaches the size of the solution in about $${Math.round(WX.n16)}$ steps.`,
  },
  practice: [
    num({
      id: 'g-sawtooth', difficulty: 2,
      gen(r) {
        const nu = r.pick([0.3, 0.6, 0.8, 1.05, 1.1, 1.3, 1.5]);
        const G = Math.abs(1 - 2 * nu);
        return {
          prompt: t`For the upwind scheme at Courant number $\nu = ${nu}$, by what factor does one step change the amplitude of the sawtooth mode $u_j = (-1)^j$ (that is, what is $|G(\pi)|$)?`,
          visual: { type: 'graph', params: { x: [-0.5, 10.5], y: [-1.5, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'grid point j', ylabel: 'u', xticks: 10, curves: [], points: Array.from({ length: 11 }, (_, j) => ({ x: j, y: j % 2 ? -1 : 1, color: 'warn', r: 5 })), hlines: [{ y: 0, color: 'ink3' }] }, caption: t`The sawtooth: the shortest wave a grid can hold, $\theta = \pi$ (two points per wavelength).` },
          answer: G, tol: { rel: 0.002 },
          errors: [{ value: 1 - nu, feedback: t`At $\theta = \pi$, $e^{-i\theta} = -1$, so $G = 1 - \nu(1 - (-1)) = 1 - 2\nu$.` }, { value: 1, feedback: t`$|G| = 1$ only at $\nu = 0$ or $\nu = 1$.` }].filter((e) => Math.abs(e.value - G) > 0.01 * Math.max(G, 0.05)),
          hints: [t`$G(\theta) = 1 - \nu(1 - e^{-i\theta})$ and $e^{-i\pi} = -1$.`],
          teach: 'For upwind the sawtooth is multiplied by 1 − 2ν each step: it shrinks for ν < 1 and grows for ν > 1.',
          explain: t`$G(\pi) = 1 - 2(${nu}) = ${r3(1 - 2 * nu)}$, so $|G(\pi)| = ${r3(G)}$: the zigzag ${G > 1 ? 'grows — the run will blow up' : G < 1 ? 'is damped (upwind’s numerical diffusion at work)' : 'keeps its size'}${nu > 0.5 && nu <= 1 ? ', flipping sign every step' : ''}.`,
        };
      },
    }),
    num({
      id: 'cfl-dt', difficulty: 1, transfer: true,
      gen(r) {
        const a = r.pick([900, 1000, 1100, 1200]), dxmm = r.pick([0.5, 1, 2]);
        const dt = (dxmm / 1000) / a * 1e6;
        return {
          prompt: t`An explicit three-point scheme simulates pressure waves in a rocket combustion chamber, where the hot gas’s speed of sound is $${a}$ m/s, on a grid with $\Delta x = ${dxmm}$ mm. The CFL condition requires $\nu = a\,\Delta t/\Delta x \le 1$. What is the largest allowed time step, in microseconds?`,
          visual: scheme({ eq: 'advect', scheme: 'laxf', nu: 1, panels: ['cone'], levels: 4, numax: 1.2 }, 'The CFL picture at ν = 1: the characteristic traced back from the gold point just reaches the edge of the stencil’s domain of dependence.'),
          answer: dt, units: 'us', tol: { rel: 0.005 },
          errors: [{ value: (dxmm / 1000) * a * 1e6, feedback: 'The time step is Δx divided by the speed, not multiplied.' }, { value: dt / 1000, feedback: 'Convert Δx to metres: the answer is in microseconds.' }],
          hints: [t`$\Delta t \le \Delta x/a$ with $\Delta x$ in metres.`],
          teach: 'The CFL condition caps the time step at about the time the fastest signal takes to cross one cell.',
          explain: t`$\Delta t \le ${tex(dxmm / 1000)}/${a} = ${r3(dt)}\ \mu\text{s}$. A millisecond of combustion-instability simulation then takes over ${Math.round(1000 / dt)} steps — the reason implicit schemes, which escape this limit, are popular for slow phenomena.`,
        };
      },
    }),
    mcq({
      id: 'ftcs-cfl', difficulty: 2,
      prompt: t`FTCS for advection, $u_j^{n+1} = u_j^n - \tfrac12\nu\,(u_{j+1}^n - u_{j-1}^n)$, uses both neighbours, so at $\nu = 0.5$ the characteristic lies well inside its stencil’s reach. Yet the run below blows up. Why?`,
      visual: scheme({ eq: 'advect', scheme: 'ftcs', nu: 0.5, profile: 'gauss', w: 0.8, t: 9, tmax: 9, panels: ['profile'], ylim: [-2, 3] }, 'FTCS at ν = 0.5 on a smooth bump after 9 s: a grid-scale wobble has grown out of nothing.'),
      choices: [t`The CFL condition is necessary but not sufficient: here $|G|^2 = 1 + \nu^2\sin^2\theta > 1$ for every $\nu > 0$, so some waves always grow`, 'The time step is too large; at ν = 0.1 FTCS would be stable', 'Round-off error accumulates; in exact arithmetic the run would be fine', 'The CFL condition is violated, because FTCS uses a point downwind'],
      answer: 0,
      why: { 1: t`$\sqrt{1 + \nu^2\sin^2\theta} > 1$ for every $\nu > 0$: a smaller step only slows the growth (fewer per unit time, by a smaller factor) — it never stops it.`, 2: 'The smooth bump’s own short-wave content is amplified; exact arithmetic would only delay the growth a little.', 3: 'Using both neighbours means the stencil covers the characteristic: CFL holds. The trouble is the weights, not the reach.' },
      hints: [t`Compute $G$ for FTCS: $1 - \tfrac12\nu(e^{i\theta} - e^{-i\theta}) = 1 - i\nu\sin\theta$.`, t`What is $|1 - i\nu\sin\theta|$?`],
      teach: 'CFL is a necessary condition only: a scheme can see far enough and still amplify waves.',
      explain: t`$G = 1 - i\nu\sin\theta$, so $|G| = \sqrt{1 + \nu^2\sin^2\theta}$ — at $\nu = 0.5$ up to $${r3(maxGain('ftcs-adv', 0.5))}$. Centred differences in time and space for advection are unconditionally unstable. Adding the right amount of diffusion (Lax–Friedrichs) or the second-order correction (Lax–Wendroff) pulls $G$ back inside the circle for $\nu \le 1$.`,
    }),
    multi({
      id: 'which-stable', difficulty: 2,
      prompt: t`At Courant number $\nu = 0.8$, which schemes for $u_t + c\,u_x = 0$ ($c > 0$) are stable? (Select all that apply.)`,
      visual: scheme({ eq: 'advect', scheme: 'lw', nu: 0.8, panels: ['cone'], levels: 5 }, 'The reach of a centred three-point stencil at ν = 0.8: the characteristic (green) is inside it. Whether a scheme is stable also depends on its weights.'),
      choices: ['upwind', 'Lax–Wendroff', 'Lax–Friedrichs', 'FTCS (centred)', 'downwind'],
      answer: [0, 1, 2],
      why: { 3: t`$|G| = \sqrt{1 + \nu^2\sin^2\theta} > 1$: unstable for every $\nu > 0$.`, 4: 'Its stencil looks downstream, away from where the information comes from: it violates CFL at every ν.' },
      hints: [t`Upwind, Lax–Wendroff and Lax–Friedrichs all have $|G| \le 1$ for $\nu \le 1$.`, 'FTCS fails von Neumann’s test; downwind fails CFL.'],
      teach: 'Upwind, Lax–Friedrichs and Lax–Wendroff are stable for ν ≤ 1; FTCS and downwind never are.',
      explain: t`Largest $|G|$ at $\nu = 0.8$: upwind ${r3(maxGain('upwind', 0.8))}, Lax–Wendroff ${r3(maxGain('lw', 0.8))}, Lax–Friedrichs ${r3(maxGain('laxf', 0.8))}; FTCS ${r3(maxGain('ftcs-adv', 0.8))}, downwind ${r3(maxGain('downwind', 0.8))}.`,
    }),
    num({
      id: 'blowup-steps', difficulty: 3,
      gen(r) {
        const nu = r.pick([1.1, 1.2, 1.3, 1.5]), eps = r.pick([1e-16, 1e-10, 1e-6]);
        const G = 2 * nu - 1, n = Math.log(1 / eps) / Math.log(G);
        return {
          prompt: t`An upwind run at $\nu = ${nu}$ starts with a sawtooth error of amplitude $${tex(eps)}$. About how many steps does the error take to grow to amplitude 1?`,
          visual: { type: 'graph', params: { x: [0, 200], y: [-17, 2], aspect: 'wide', axesAt: 'edge', xlabel: 'steps n', ylabel: 'log₁₀ |error|', curves: [{ fn: '-16 + x*log10(1.5)', color: 'bad', width: 2.2 }, { fn: '-10 + x*log10(1.5)', color: 'warn', width: 2 }, { fn: '-6 + x*log10(1.5)', color: 'gold', width: 2 }], hlines: [{ y: 0, color: 'ink3', label: 'amplitude 1' }] }, caption: t`Geometric growth $|G|^n$ is a straight line on a log scale: here seeds of $10^{-16}$, $10^{-10}$ and $10^{-6}$ growing at $\nu = 1.25$, a different Courant number from this problem’s.` },
          answer: n, tol: { rel: 0.02 },
          errors: [{ value: Math.log(1 / eps) / Math.log(nu), feedback: t`The growth per step is $|1 - 2\nu| = ${r3(G)}$, not $\nu$.` }, { value: Math.log10(1 / eps) / Math.log(G), feedback: 'Mixed logarithms: use the same base top and bottom, n = ln(1/ε)/ln|G|.' }],
          hints: [t`$|G(\pi)| = 2\nu - 1 = ${r3(G)}$.`, t`Solve $${tex(eps)}\times${r3(G)}^n = 1$: $n = \ln(1/\varepsilon)/\ln|G|$.`],
          teach: t`Instability is geometric: an error $\varepsilon$ reaches size 1 after $\ln(1/\varepsilon)/\ln|G|$ steps — tiny seeds buy surprisingly little time.`,
          explain: t`$n = \ln(${tex(1 / eps)})/\ln ${r3(G)} \approx ${r3(n)}$ steps. Making the seed a million times smaller adds only $\ln 10^6/\ln ${r3(G)} \approx ${r3(Math.log(1e6) / Math.log(G))}$ steps: you cannot out-wait an instability by being careful with arithmetic.`,
        };
      },
    }),
    {
      type: 'slider', id: 'leapfrog-limit', difficulty: 2,
      prompt: t`The leapfrog scheme for the wave equation, $u_j^{n+1} = 2u_j^n - u_j^{n-1} + \nu^2(u_{j+1}^n - 2u_j^n + u_{j-1}^n)$, has two amplification factors per wave. Set the Courant number to the largest value at which both stay on or inside the unit circle.`,
      visual: scheme({ eq: 'wave', scheme: 'leapfrog', nu: 0.6, numax: 1.4, panels: ['gain'], controls: ['nu'] }, 'Leapfrog’s two amplification factors for θ from −π to π: on the unit circle while the scheme is stable, red where one leaves it.'),
      param: 'nu', answer: [0.99, 1.0],
      instruction: 'Slide ν until the factors are about to leave the circle, then check.',
      hints: ['While stable, both roots lie on the unit circle (leapfrog neither damps nor grows). Watch θ = π, the gold dots on the real axis.', 'The roots satisfy G² − 2(1 − 2ν² sin²(θ/2))G + 1 = 0; at θ = π they leave the circle when 1 − 2ν² < −1.'],
      teach: 'Leapfrog for waves is stable exactly up to ν = 1 — the CFL limit of its three-point stencil.',
      explain: t`At $\theta = \pi$ the roots satisfy $G^2 - 2(1 - 2\nu^2)G + 1 = 0$; they are complex with $|G| = 1$ while $|1 - 2\nu^2| \le 1$, i.e. $\nu \le 1$. Just past it, at $\nu = 1.01$, one root has $|G| = ${r3(maxGain('leapfrog', 1.01))}$ — leapfrog fails abruptly. In two and three dimensions with equal spacing the limit drops to $1/\sqrt2$ and $1/\sqrt3$.`,
    },
    code({
      id: 'von-neumann', difficulty: 3,
      prompt: t`Compute amplification factors numerically. Write \`max_gain(G, nu)\` returning the largest $|G(\theta)|$ over \`theta = np.linspace(-np.pi, np.pi, 2001)\`, where \`G(theta, nu)\` is a function. Define \`upwind\`, \`ftcs\` ($1 - i\nu\sin\theta$) and \`lax_wendroff\` ($1 - i\nu\sin\theta - \nu^2(1 - \cos\theta)$). Then find the Lax–Wendroff stability limit \`limit\` by bisection on $[0.5, 2]$: the largest $\nu$ with \`max_gain <= 1 + 1e-12\`.`,
      starter: t`import numpy as np

theta = np.linspace(-np.pi, np.pi, 2001)

def upwind(theta, nu):
    return 1 - nu * (1 - np.exp(-1j * theta))

def ftcs(theta, nu):
    pass

def lax_wendroff(theta, nu):
    pass

def max_gain(G, nu):
    pass

lo, hi = 0.5, 2.0
# bisect: keep max_gain(lax_wendroff, lo) <= 1 + 1e-12 and max_gain(lax_wendroff, hi) > 1 + 1e-12
limit = None
print(max_gain(upwind, 0.8), max_gain(upwind, 1.2), limit)
`,
      answer: t`import numpy as np

theta = np.linspace(-np.pi, np.pi, 2001)

def upwind(theta, nu):
    return 1 - nu * (1 - np.exp(-1j * theta))

def ftcs(theta, nu):
    return 1 - 1j * nu * np.sin(theta)

def lax_wendroff(theta, nu):
    return 1 - 1j * nu * np.sin(theta) - nu**2 * (1 - np.cos(theta))

def max_gain(G, nu):
    return np.max(np.abs(G(theta, nu)))

lo, hi = 0.5, 2.0
for _ in range(50):
    mid = 0.5 * (lo + hi)
    if max_gain(lax_wendroff, mid) <= 1 + 1e-12:
        lo = mid
    else:
        hi = mid
limit = lo
print(max_gain(upwind, 0.8), max_gain(upwind, 1.2), limit)`,
      tests: [
        { name: t`upwind: largest $|G|$ is 1 at $\nu = 0.8$ and 1.4 at $\nu = 1.2$`, code: 'abs(max_gain(upwind, 0.8) - 1) < 1e-9 and abs(max_gain(upwind, 1.2) - 1.4) < 1e-9' },
        { name: t`FTCS: largest $|G| = \sqrt{1 + \nu^2}$, above 1 even at $\nu = 0.1$`, code: 'abs(max_gain(ftcs, 0.5) - np.sqrt(1.25)) < 1e-6 and max_gain(ftcs, 0.1) > 1.004' },
        { name: t`Lax–Wendroff is stable up to $\nu = 1$`, code: 'limit is not None and abs(limit - 1) < 1e-6' },
      ],
      hints: ['`max_gain` is one line: `np.max(np.abs(G(theta, nu)))`.', 'Use `1j` for i and `np.sin`, `np.cos` on the whole `theta` array.', 'Bisection: 50 times, `mid = (lo + hi)/2`; if stable at mid, `lo = mid`, else `hi = mid`; then `limit = lo`.'],
      teach: 'Von Neumann analysis is a function of θ you can tabulate: stability is the question whether its modulus ever exceeds 1.',
      explain: t`Upwind and Lax–Wendroff both reach exactly $|G| = 1$ at $\nu = 1$ and exceed it beyond; FTCS exceeds it for every $\nu > 0$. This test is exact for linear constant-coefficient problems on periodic grids; for variable coefficients and boundaries it is a necessary guide applied locally, and boundaries need their own analysis.`,
    }),
    code({
      id: 'cfl-blowup', difficulty: 3,
      prompt: t`Watch a CFL violation blow up. Write \`steps_to_blowup(nu, max_steps=1000)\`: carry the square pulse \`u0\` with upwind (on the periodic grid) and return the number of steps after which \`np.max(np.abs(u))\` first exceeds 1000, or \`None\` if it never does within \`max_steps\`. Set \`n_bad = steps_to_blowup(1.1)\` and \`n_good = steps_to_blowup(0.9)\`. Finally set \`zigzag\` to the fraction of neighbouring pairs with opposite signs, \`np.mean(u * np.roll(u, 1) < 0)\`, in the blown-up solution at $\nu = 1.1$.`,
      starter: t`import numpy as np

N = 100
x = np.arange(N) * 0.1
u0 = (np.abs(x - 5.0) < 1.0).astype(float)

def steps_to_blowup(nu, max_steps=1000):
    u = u0.copy()
    for n in range(1, max_steps + 1):
        pass   # one upwind step, then test max|u| > 1000
    return None

n_bad = None
n_good = None
zigzag = None
print(n_bad, n_good, zigzag)
`,
      answer: t`import numpy as np

N = 100
x = np.arange(N) * 0.1
u0 = (np.abs(x - 5.0) < 1.0).astype(float)

def run(nu, max_steps=1000):
    u = u0.copy()
    for n in range(1, max_steps + 1):
        u = u - nu * (u - np.roll(u, 1))
        if np.max(np.abs(u)) > 1000:
            return n, u
    return None, u

def steps_to_blowup(nu, max_steps=1000):
    return run(nu, max_steps)[0]

n_bad = steps_to_blowup(1.1)
n_good = steps_to_blowup(0.9)
u_bad = run(1.1)[1]
zigzag = np.mean(u_bad * np.roll(u_bad, 1) < 0)
print(n_bad, n_good, zigzag)`,
      tests: [
        { name: t`at $\nu = 1.1$ the solution passes 1000 after 51 steps`, code: 'n_bad == 51' },
        { name: t`at $\nu = 0.9$ it never does in 1000 steps`, code: 'n_good is None' },
        { name: 'the blown-up solution is a zigzag: most neighbours have opposite signs', code: 'zigzag is not None and zigzag > 0.5' },
      ],
      hints: ['Inside the loop: `u = u - nu * (u - np.roll(u, 1))`, then `if np.max(np.abs(u)) > 1000: return n`.', 'For the zigzag you need the blown-up array itself: write a helper that returns both `n` and `u`.', '`zigzag = np.mean(u_bad * np.roll(u_bad, 1) < 0)`.'],
      teach: 'Past the CFL limit, the grid-scale zigzag grows geometrically; the pulse’s jumps seed it.',
      explain: t`At $\nu = 1.1$ the run passes 1000 after 51 steps, and the solution is a zigzag that flips sign from point to point — the $\theta = \pi$ mode multiplied by $|1 - 2\nu| = 1.2$ per step. At $\nu = 0.9$ upwind is a weighted average with positive weights and can never exceed the initial maximum, 1.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nr-dt', difficulty: 3, transfer: true,
      gen(r) {
        const M = r.pick([10, 30, 60]), dx = r.pick([0.02, 0.05]);
        const Tm = 4.925491e-6 * M;          // GM/c³ in seconds for M solar masses
        const dt = (dx / Math.sqrt(3)) * Tm * 1e6;
        return {
          prompt: t`A toy numerical-relativity code evolves the 3D wave equation with the leapfrog scheme on its finest grid, spacing $\Delta x = ${dx}\,M$ in each direction (in units where $G = c = 1$, length and time are measured in the mass $M$; $1\,M = GM/c^3$ = $${tex(Tm, 4)}$ s for $M = ${M}\,M_\odot$). With equal spacing, 3D leapfrog is stable for $c\,\Delta t/\Delta x \le 1/\sqrt3$. What is the largest time step, in microseconds?`,
          visual: scheme({ eq: 'wave', scheme: 'leapfrog', nu: 0.577, numax: 1.2, panels: ['cone'], levels: 4 }, 'One dimension of the CFL picture for waves: the light cone traced back from the gold point (green, both directions) must stay inside the stencil’s reach. In 3D the diagonal directions tighten the limit to 1/√3.'),
          answer: dt, units: 'us', tol: { rel: 0.005 },
          errors: [{ value: dx * Tm * 1e6, feedback: t`In three dimensions the limit is $\nu \le 1/\sqrt3$, not 1: a wave travelling diagonally crosses cells faster.` }, { value: (dx / 3) * Tm * 1e6, feedback: t`The factor is $1/\sqrt3 \approx 0.577$, not $1/3$.` }],
          hints: [t`$\Delta t = \Delta x/(\sqrt3\,c)$: in units of $M$, $${dx}/\sqrt3$.`, t`Multiply by $GM/c^3 = ${tex(Tm, 4)}$ s and convert to μs.`],
          teach: 'The CFL condition on the speed of light sets every explicit numerical-relativity time step; in 3D it tightens by 1/√3.',
          explain: t`$\Delta t = ${dx}/\sqrt3 = ${r3(dx / Math.sqrt(3))}\,M = ${r3(dt)}\ \mu\text{s}$. A merger simulated over $1000\,M$ then takes $${Math.round(1000 / (dx / Math.sqrt(3)))}$ steps on the finest level. Production codes use Runge–Kutta time stepping with Courant factors of roughly 0.25–0.5, and mesh refinement lets coarse levels take bigger steps.`,
        };
      },
    }),
    mcq({
      id: 'cp-sawtooth', difficulty: 2,
      prompt: t`A colleague’s advection run looks fine for a few seconds, then a cell-to-cell zigzag appears at the pulse’s edges and grows until the numbers overflow. What is the most likely diagnosis?`,
      visual: scheme({ eq: 'advect', scheme: 'upwind', nu: 1.1, profile: 'box', w: 1, t: r3(SAW.time), tmax: 5, panels: ['profile'], ylim: [-2.5, 3.5] }, 'Upwind on a square pulse, partway into a run: the zigzag growing from the edges.'),
      choices: [t`The time step violates the stability limit: the grid’s shortest wave has $|G| > 1$ and grows geometrically`, 'A bug in the boundary conditions', 'The physics of the PDE: advection steepens fronts into shocks', 'Accumulated round-off, which needs higher precision'],
      answer: 0,
      why: { 1: 'A periodic grid has no boundaries here, and a stencil bug would usually wreck the solution from the first step, not grow geometrically from the sharpest features.', 2: 'Linear advection carries a profile unchanged; it does not steepen. Burgers’ equation does, and makes a single jump, not a zigzag.', 3: 'Higher precision only lowers the seed: an unstable mode still grows by the same factor per step and wins a few steps later.' },
      hints: ['Which wave is a cell-to-cell zigzag? What does von Neumann analysis say about it?'],
      teach: 'Grid-scale zigzags growing geometrically are the signature of a stability violation.',
      explain: t`The zigzag is the $\theta = \pi$ mode; the jumps of the pulse seed it, and if $|G(\pi)| > 1$ it grows geometrically. Here $\nu = 1.1$: $|G(\pi)| = 1.2$. Reduce the time step below the CFL limit — or, for a scheme like FTCS that fails von Neumann’s test at every $\nu$, change the scheme.`,
    }),
    mcq({
      id: 'cp-downwind', difficulty: 3,
      prompt: t`For $u_t + c\,u_x = 0$ with $c > 0$, a student writes $u_j^{n+1} = u_j^n - \nu\,(u_{j+1}^n - u_j^n)$. Can any time step make it stable?`,
      visual: scheme({ eq: 'advect', scheme: 'downwind', nu: 0.3, numax: 1, panels: ['cone'], levels: 5 }, 'The student’s stencil: each new value is built from the point and its right-hand neighbour.'),
      choices: [t`No: its numerical domain of dependence lies to the right, while the characteristic comes from the left — CFL fails for every $\nu > 0$`, t`Yes, any $\nu \le 1$, like upwind`, t`Yes, if $\nu \le \tfrac12$`, 'Yes, for a fine enough grid'],
      answer: 0,
      why: { 1: t`Its $G = 1 + \nu - \nu e^{i\theta}$ has $|G(\pi)| = 1 + 2\nu > 1$ for every $\nu > 0$.`, 2: t`Halving $\nu$ halves the growth per step but never stops it: $|G(\pi)| = 1 + 2\nu$.`, 3: 'Refining keeps ν fixed if Δt shrinks with Δx; the stencil still looks the wrong way.' },
      hints: ['Where does the exact solution at (xⱼ, tₙ₊₁) come from? Which grid values does the scheme use?', t`Compute $G$: $1 - \nu(e^{i\theta} - 1)$, and evaluate at $\theta = \pi$.`],
      teach: 'A stencil that does not contain the characteristic can never converge, whatever the time step: CFL is about direction as well as size.',
      explain: t`The exact value at $(x_j, t_{n+1})$ is $u$ carried from $x_j - c\,\Delta t$, to the **left**; the scheme only looks right. Von Neumann agrees: $|G(\pi)| = 1 + 2\nu > 1$. Taking the difference from the side the information comes from — upwinding — is the fix.`,
    }),
  ],
  sources: [CFL1928, STRIKWERDA, LEVEQUE07, SRC.strauss],
});
