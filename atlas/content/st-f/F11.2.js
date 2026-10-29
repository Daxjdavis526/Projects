// Von Neumann stability analysis, the ODE way (st-b B13.2 does it for
// advection and the CFL condition): discretise space first and the heat
// equation becomes a stiff ODE system whose Fourier modes have eigenvalues
// λ(θ) = −(4D/Δx²)sin²(θ/2); a time stepper multiplies mode θ by R(Δt λ(θ)),
// so the von Neumann amplification factor is G(θ) = R(−4r sin²(θ/2)). FTCS is
// Euler on this system: r ≤ ½; RK4 r ≤ 0.696 (four times the work for a 39%
// longer step); backward Euler (BTCS) and Crank–Nicolson always stable, but
// CN's G(π) → −1 rings at large r. Centred advection puts the eigenvalues on
// the imaginary axis instead — why FTCS advection always fails. Worked
// example: an aluminium plate behind a heat shield.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import * as S from '../../src/viz/model/num3-stab.js';
import { n12 } from './_ode.js';

const t = String.raw;

// ── the worked example: an aluminium 2024-T3 backing plate, 2 cm thick ──
const KAL = 121, RHO = 2780, CP = 875, ALPHA = KAL / (RHO * CP);   // W/(m K), kg/m³, J/(kg K)
const DX = 1e-3, THK = 0.02, TBURN = 600;
const DT_FE = DX * DX / (2 * ALPHA), DT_RK4 = (S.realLimit('rk4') / 4) * DX * DX / ALPHA;
const DT_CN = 1, R_CN = ALPHA * DT_CN / (DX * DX);
const G_CN = (1 - 2 * R_CN) / (1 + 2 * R_CN), G_BE = 1 / (1 + 4 * R_CN);
const RK4R = S.realLimit('rk4') / 4;
const gFE = (r) => `1 - 4*${r}*sin(x/2)^2`;

export default lesson({
  id: 'st-f.F11.2',
  title: 'Von Neumann stability analysis',
  minutes: 15, difficulty: 3,
  intro: t`Replace only the space derivative of the heat equation $u_t = Du_{xx}$ by a difference, $u_j' = \frac{D}{\Delta x^2}(u_{j+1} - 2u_j + u_{j-1})$, and you have a large system of ODEs — the **method of lines**. Its eigenvectors are the grid’s Fourier modes $e^{ij\theta}$, $\theta = k\Delta x$, with eigenvalues $\lambda(\theta) = -\frac{4D}{\Delta x^2}\sin^2\frac\theta2$: all real, all negative, the sawtooth $\theta = \pi$ the fastest. Now march in time with any ODE method of [F9](#/lesson/st-f.F9.2)–[F11.1](#/lesson/st-f.F11.1). Each mode is multiplied every step by that method’s $R(\Delta t\,\lambda)$, so von Neumann’s amplification factor is

$$G(\theta) = R\!\left(-4r\sin^2\tfrac\theta2\right), \qquad r = \frac{D\,\Delta t}{\Delta x^2}$$

and the scheme is stable when every mode’s $z = \Delta t\,\lambda$, spread over $[-4r, 0]$, lies inside the method’s stability region. Explicit methods therefore need $\Delta t \propto \Delta x^2$; implicit ones do not.`,
  symbols: [
    { tex: 'u_j', text: 'the temperature at grid point $j$, now a function of time' },
    { tex: t`\theta = k\Delta x`, text: 'a Fourier mode’s phase change per grid cell: $\\theta \\approx 0$ smooth, $\\theta = \\pi$ the sawtooth $+,-,+,-$' },
    { tex: t`\lambda(\theta)`, text: 'that mode’s eigenvalue in the semi-discrete system: its decay rate, in $\\text{s}^{-1}$' },
    { tex: 'G(\\theta)', text: 'the **amplification factor**: what one full time step multiplies mode $\\theta$ by. Stable when $\\lvert G\\rvert \\le 1$ for every $\\theta$' },
    { tex: 'R(z)', text: 'the time stepper’s stability function: $1 + z$ for Euler (giving FTCS), $1/(1 - z)$ for backward Euler (BTCS), $\\frac{1 + z/2}{1 - z/2}$ for the trapezoid rule (Crank–Nicolson)' },
    { tex: 'r', text: 'the mesh ratio $D\\Delta t/\\Delta x^2$, dimensionless, with $D$ the diffusivity in m²/s' },
  ],
  why: 'Thermal-protection, cryogenic-tank and reactor models are all heat equations on fine grids; this one picture tells you which time steppers can run at the step accuracy needs and which are chained to Δx².',
  visual: {
    type: 'num3-stability',
    title: 'Twenty grid modes on the negative real axis',
    lead: t`The heat equation on 20 interior grid points (ends held fixed): each dot is one Fourier mode at $z = \Delta t\,\lambda$, spread over $[-4r, 0]$. Slide $r$ and choose the time stepper. The run panel follows the mode with the largest $\lvert G\rvert$.`,
    tasks: [
      'Euler (FTCS): at r = 0.5 the sawtooth mode sits exactly at z = −2, the edge of the disc. Go past it and that mode grows — the checkerboard blow-up of FTCS.',
      `RK4: the limit moves out to r ≈ ${RK4R.toFixed(3)} — 39% more step for four times the work per step.`,
      'Backward Euler and the trapezoid (Crank–Nicolson) are stable for every r. At large r, read the trapezoid’s largest |G|: close to 1, and negative — the stiff modes survive as a slowly fading checkerboard.',
    ],
    params: { methods: ['euler', 'rk4', 'beuler', 'trap'], method: 'euler', mol: 20, r: 0.4, rmax: 1, x: [-4.4, 1], y: [-2.2, 2.2], n: 40 },
    caption: 'Exact eigenvalues of the second-difference matrix with fixed ends (dots; off-window ones drawn at the edge). This is von Neumann analysis seen as ODE stability: G(θ) is R evaluated at the mode’s z.',
  },
  example: {
    prompt: t`An aluminium 2024 plate behind a capsule’s heat shield ($k = ${KAL}$ W/(m K), $\rho = ${RHO}$ kg/m³, $c = ${CP}$ J/(kg K)) is ${THK * 100} cm thick and modelled on a grid with $\Delta x = 1$ mm, through a ${TBURN} s entry. Find the largest stable steps for FTCS and for RK4 in time, then judge Crank–Nicolson at $\Delta t = 1$ s.`,
    visual: {
      type: 'graph',
      params: { x: [0, Math.PI], y: [-1.15, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'θ = kΔx', ylabel: 'G(θ)',
        curves: [
          { fn: gFE(0.45), color: 'accent', width: 2.2, label: 'FTCS, r = 0.45', labelAt: 2.3, labelDy: 14 },
          { fn: `(1 - 2*${n12(R_CN)}*sin(x/2)^2)/(1 + 2*${n12(R_CN)}*sin(x/2)^2)`, color: 'bad', width: 2.2, samples: 1500, label: `Crank–Nicolson, r = ${R_CN.toFixed(1)}`, labelAt: 1.2, labelDy: 14 },
          { fn: `1/(1 + 4*${n12(R_CN)}*sin(x/2)^2)`, color: 'good', width: 2.2, samples: 1500, label: `backward Euler, r = ${R_CN.toFixed(1)}`, labelAt: 0.5, labelDx: 10, labelDy: -6 },
        ],
        hlines: [{ y: 1, color: 'ink4' }, { y: -1, color: 'ink4' }, { y: 0, color: 'ink4' }] },
      caption: 'Amplification factors against θ from the formulas. |G| ≤ 1 (between the grey lines) is stable; G near −1 at θ = π means the checkerboard mode flips sign and barely decays.',
    },
    steps: [
      { label: 'Diffusivity', text: t`$D = k/(\rho c) = ${KAL}/(${RHO}\times${CP}) = ${tex(ALPHA, 3)}$ m²/s.` },
      { label: 'The fastest mode', text: t`The sawtooth has $\lambda(\pi) = -4D/\Delta x^2 = ${tex(-4 * ALPHA / (DX * DX), 3)}\ \text{s}^{-1}$: a checkerboard of 2 mm wavelength decays in about 5 ms. That is the stiff mode.` },
      { label: 'FTCS', text: t`Euler needs $\Delta t\,\lvert\lambda\rvert \le 2$: $r \le \tfrac12$, $\Delta t \le \Delta x^2/(2D) = ${tex(DT_FE, 3)}$ s — about $${Math.round(TBURN / DT_FE / 1000)}\,000$ steps for the entry.` },
      { label: 'RK4', text: t`RK4’s region meets the real axis at $-${S.realLimit('rk4').toFixed(3)}$: $4r \le ${S.realLimit('rk4').toFixed(3)}$, $r \le ${RK4R.toFixed(3)}$, $\Delta t \le ${tex(DT_RK4, 3)}$ s. Four evaluations per step for 39% more step: per unit of work, **worse** than FTCS. Higher order does not help a stiff problem.` },
      { label: 'Crank–Nicolson', text: t`The trapezoid rule gives $G = \frac{1 - 2r\sin^2(\theta/2)}{1 + 2r\sin^2(\theta/2)}$, $\lvert G\rvert \le 1$ for every $r$. At $\Delta t = 1$ s, $r = ${R_CN.toFixed(1)}$, and $G(\pi) = ${G_CN.toFixed(3)}$: any checkerboard in the data (a sudden surface heat flux, a corner in the initial profile) flips sign every step and loses only $${((1 - Math.abs(G_CN)) * 100).toFixed(0)}\%$ per step — visible wiggles for dozens of steps.` },
      { label: 'Backward Euler', text: t`$G(\pi) = 1/(1 + 4r) = ${G_BE.toFixed(4)}$: the checkerboard is gone in a step, at first-order accuracy in time. Practice: Crank–Nicolson with a few backward-Euler steps at the start (Rannacher smoothing), or BDF2. Either way, one tridiagonal solve per step, $O(N)$ work.` },
    ],
    answer: t`FTCS $\Delta t \le ${tex(DT_FE, 2)}$ s, RK4 $\Delta t \le ${tex(DT_RK4, 2)}$ s; Crank–Nicolson at 1 s ($r = ${R_CN.toFixed(0)}$) is stable but $G(\pi) = ${G_CN.toFixed(2)}$, so sharp features ring; backward Euler damps them.`,
  },
  practice: [
    num({
      id: 'g-pi', difficulty: 2,
      gen(r) {
        const rr = r.pick([0.2, 0.3, 0.45, 0.55, 0.6, 0.75]), ans = 1 - 4 * rr;
        return {
          prompt: t`FTCS for the heat equation is Euler’s method on the semi-discrete system. With $r = ${rr}$, what is the amplification factor $G(\pi)$ of the sawtooth mode?`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, 9.3], y: [-1.4, 1.4], aspect: 'wide', axesAt: 'edge', xlabel: 'grid point j', ylabel: 'u', xticks: 10,
              points: Array.from({ length: 10 }, (_, j) => ({ x: j, y: j % 2 ? -1 : 1, r: 5, color: 'accent' })),
              curves: Array.from({ length: 9 }, (_, j) => ({ param: [`${j} + t`, `${j % 2 ? -1 : 1} + ${j % 2 ? 2 : -2}*t`], t: [0, 1], color: 'accent', width: 1.4 })) },
            caption: 'The sawtooth (θ = π): every point the opposite of its neighbours. Its second difference is −4 times the value.',
          },
          answer: ans, tol: { rel: 0, abs: 0.005 },
          errors: [{ value: 1 - 2 * rr, feedback: 'The sawtooth’s second difference is −4u, so G(π) = 1 − 4r.' }],
          hints: [t`$G(\theta) = 1 - 4r\sin^2(\theta/2)$.`, t`At $\theta = \pi$: $\sin^2(\pi/2) = 1$.`],
          teach: 'The sawtooth is the fastest-decaying mode of the heat equation and the first to go unstable in an explicit scheme.',
          explain: t`$G(\pi) = 1 - 4(${rr}) = ${n12(ans)}$. ${Math.abs(ans) <= 1 ? 'Inside [−1, 1]: stable (r ≤ ½).' : 'Below −1: the sawtooth grows and flips sign every step — unstable, since r > ½.'}`,
        };
      },
    }),
    {
      type: 'slider', id: 'rk4-r', difficulty: 3,
      prompt: t`The heat equation on 20 interior grid points is stepped with RK4 in time. Set the mesh ratio $r$ to the largest value for which every mode is stable.`,
      visual: { type: 'num3-stability', params: { methods: ['rk4'], method: 'rk4', mol: 20, r: 0.3, rmax: 1, x: [-4.4, 1], y: [-2.2, 2.2], n: 40, controls: ['r'], hide: ['verdict', 'R'] } },
      param: 'r', answer: [0.69, 0.70],
      instruction: 'Move r until the leftmost mode just reaches the edge of the region, then check.',
      hints: [t`The leftmost mode is at $z = -4r\sin^2\frac{20\pi}{42} = -${(4 * Math.sin((20 * Math.PI) / 42) ** 2).toFixed(4)}\,r$.`, t`RK4’s region ends at $z = -2.785$: $r = 2.785/${(4 * Math.sin((20 * Math.PI) / 42) ** 2).toFixed(4)}$.`],
      teach: 'For an explicit time stepper on the heat equation, the stable r is the method’s real-axis reach divided by 4 (a little more on a coarse grid).',
      explain: t`$r = ${S.realLimit('rk4').toFixed(4)}/${(4 * Math.sin((20 * Math.PI) / 42) ** 2).toFixed(4)} = ${(S.realLimit('rk4') / (4 * Math.sin((20 * Math.PI) / 42) ** 2)).toFixed(4)}$ — on a fine grid it tends to $2.785/4 = ${RK4R.toFixed(3)}$.`,
    },
    num({
      id: 'cn-ring', difficulty: 2,
      gen(r) {
        const rr = r.pick([2, 5, 10, 50]), ans = (1 - 2 * rr) / (1 + 2 * rr);
        return {
          prompt: t`Crank–Nicolson for the heat equation has $G(\theta) = \dfrac{1 - 2r\sin^2(\theta/2)}{1 + 2r\sin^2(\theta/2)}$. With $r = ${rr}$, what is $G(\pi)$?`,
          visual: {
            type: 'graph',
            params: { x: [0, Math.PI], y: [-1.15, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'θ', ylabel: 'G',
              curves: [{ fn: `(1 - 2*${rr}*sin(x/2)^2)/(1 + 2*${rr}*sin(x/2)^2)`, color: 'bad', width: 2.2, samples: 1200 }],
              hlines: [{ y: -1, color: 'ink4' }, { y: 1, color: 'ink4' }] },
            caption: 'Crank–Nicolson’s amplification factor at this r.',
          },
          answer: ans, tol: { rel: 0.002 },
          errors: [{ value: 1 / (1 + 4 * rr), feedback: 'That is backward Euler’s (BTCS) G(π). Crank–Nicolson averages the explicit and implicit halves.' }],
          hints: [t`At $\theta = \pi$, $\sin^2(\theta/2) = 1$.`, t`$G = (1 - ${2 * rr})/(1 + ${2 * rr})$.`],
          teach: 'Crank–Nicolson is unconditionally stable, but at large r its stiffest modes have G ≈ −1: they oscillate and fade slowly.',
          explain: t`$G(\pi) = ${(1 - 2 * rr)}/${1 + 2 * rr} = ${ans.toFixed(4)}$: the checkerboard reverses each step and shrinks by only $${((1 - Math.abs(ans)) * 100).toFixed(1)}\%$.`,
        };
      },
    }),
    mcq({
      id: 'refine-cost', difficulty: 2,
      prompt: t`An explicit (FTCS) heat-conduction code is refined from $\Delta x$ to $\Delta x/2$ to resolve a thin layer. Roughly how does the work to reach the same final time change, in one space dimension?`,
      visual: {
        type: 'graph',
        params: { x: [-4.6, 0.6], y: [-1, 1], aspect: 'wide', axesAt: 'edge', xlabel: 'z = Δt λ', ylabel: '', yticks: 0,
          points: [...Array.from({ length: 10 }, (_, k) => ({ x: n12(-2 * Math.sin(((k + 1) * Math.PI) / 22) ** 2), y: 0.3, r: 4, color: 'accent' })), ...Array.from({ length: 21 }, (_, k) => ({ x: n12(-2 * 4 * Math.sin(((k + 1) * Math.PI) / 44) ** 2), y: -0.3, r: 3.5, color: 'bad' }))],
          vlines: [{ x: -2, color: 'gold', label: 'Euler’s limit' }] },
        caption: 'Mode eigenvalues at the same Δt: blue on the coarse grid (r = ½), red after halving Δx — r quadruples and the stiff modes jump past −2.',
      },
      choices: [
        'Eight times: twice as many points, and Δt must fall fourfold because the fastest eigenvalue scales as 1/Δx²',
        'Twice: twice as many points',
        'Four times: Δt must halve, with twice as many points',
        'Unchanged: stability depends only on r',
      ],
      answer: 0,
      why: {
        1: 'The time step is also limited, and by Δx², not Δx.',
        2: 'Δt ∝ Δx² for the heat equation (r = DΔt/Δx² ≤ ½), so halving Δx quarters Δt.',
        3: 'Keeping r fixed is what forces Δt down by four.',
      },
      hints: ['The fastest mode’s eigenvalue is −4D/Δx².', 'Count both the points per step and the number of steps.'],
      teach: 'Diffusion grows stiffer as the grid is refined, so explicit cost rises like N³ in 1D — the reason heat solvers go implicit.',
      explain: t`$\lambda_{\max} = -4D/\Delta x^2$ quadruples, so $\Delta t$ quarters: $2\times4 = 8$ times the work in 1D, 32 in 3D. An implicit method keeps $\Delta t$ set by accuracy and solves a sparse system each step.`,
    }),
    mcq({
      id: 'advection-axis', difficulty: 3,
      prompt: t`For advection $u_t + cu_x = 0$ with a centred difference in space, the mode eigenvalues are $\lambda(\theta) = -i\frac{c}{\Delta x}\sin\theta$ — purely imaginary. What does this predict?`,
      visual: { type: 'num3-stability', params: { methods: ['euler', 'rk4'], method: 'rk4', compare: true, z: [0, 1.5], drag: true, panels: ['plane', 'run'], x: [-3.6, 1.2], y: [-3.2, 3.2], n: 40, controls: false },
        caption: 'RK4 shaded, Euler outlined. Centred advection puts every mode on the imaginary axis, up to ν = cΔt/Δx.' },
      choices: [
        t`Euler in time (FTCS) is unstable for every $\Delta t$; RK4 in time is stable for $c\Delta t/\Delta x \le 2\sqrt2$`,
        'Every explicit method is unstable for advection',
        'FTCS is stable for cΔt/Δx ≤ 1, the CFL condition',
        'The modes decay, so any method is stable',
      ],
      answer: 0,
      why: {
        1: 'RK3 and RK4 cover a stretch of the imaginary axis, so they are stable for small enough steps.',
        2: 'Euler’s disc touches the imaginary axis only at 0: FTCS fails for every positive step. CFL is necessary, not sufficient.',
        3: 'Imaginary eigenvalues neither decay nor grow: the exact modes just travel.',
      },
      hints: ['Where is Euler’s disc on the imaginary axis?', 'Where does RK4’s region cross it?'],
      teach: 'The method-of-lines view explains both FTCS advection’s failure and how to rescue a centred scheme: pick a time stepper whose region covers the eigenvalues.',
      explain: t`$z = -i\nu\sin\theta$ with $\nu = c\Delta t/\Delta x$, reaching $\pm i\nu$. Euler: $\lvert1 + iy\rvert > 1$ — FTCS’s $\lvert G\rvert^2 = 1 + \nu^2\sin^2\theta$ found in [B13.2](#/lesson/st-b.B13.2). RK4: stable while $\nu \le 2\sqrt2$. (Upwind and Lax–Wendroff, the CFL story, are in B13.2.)`,
    }),
    code({
      id: 'spectral-radius', difficulty: 3,
      prompt: t`Build the $N\times N$ second-difference matrix $L$ (with $-2$ on the diagonal and 1 beside it, $N = 50$). FTCS’s step matrix is $A = I + rL$; Crank–Nicolson’s is $B = (I - \tfrac r2L)^{-1}(I + \tfrac r2L)$. Write \`rho(M)\`, the spectral radius (largest $\lvert\text{eigenvalue}\rvert$), and \`r_crit\`, the largest $r$ on the grid \`np.arange(0.40, 0.60, 0.001)\` with $\rho(A) \le 1$.`,
      starter: t`import numpy as np

N = 50
L = np.zeros((N, N))
# fill L: -2 on the diagonal, 1 on the two off-diagonals

def rho(M):
    return 0.0

def ftcs(r):
    return np.eye(N) + r * L

def cn(r):
    I = np.eye(N)
    return np.linalg.solve(I - r / 2 * L, I + r / 2 * L)

r_crit = None
print(r_crit, rho(cn(50.0)))
`,
      answer: t`import numpy as np

N = 50
L = np.zeros((N, N))
for j in range(N):
    L[j, j] = -2.0
    if j > 0:
        L[j, j - 1] = 1.0
    if j < N - 1:
        L[j, j + 1] = 1.0

def rho(M):
    return np.max(np.abs(np.linalg.eigvals(M)))

def ftcs(r):
    return np.eye(N) + r * L

def cn(r):
    I = np.eye(N)
    return np.linalg.solve(I - r / 2 * L, I + r / 2 * L)

r_crit = max(r for r in np.arange(0.40, 0.60, 0.001) if rho(ftcs(r)) <= 1 + 1e-12)
print(r_crit, rho(cn(50.0)))`,
      tests: [
        { name: 'L has the right structure', code: 'L[0, 0] == -2 and L[3, 4] == 1 and L[4, 3] == 1 and L[0, 2] == 0 and abs(L.sum() + 2) < 1e-12' },
        { name: t`FTCS is stable up to $r \approx 0.5$ (a little more on a finite grid)`, code: '0.499 <= r_crit <= 0.502' },
        { name: t`Crank–Nicolson at $r = 50$ is stable but $\rho$ is close to 1`, code: '0.95 < rho(cn(50.0)) < 1' },
      ],
      hints: ['Loop over j: L[j, j] = −2, and L[j, j±1] = 1 where those indices exist.', t`\`rho(M)\` is the largest of \`np.abs(np.linalg.eigvals(M))\`; \`r_crit\` is the largest r in the grid with \`rho(ftcs(r)) <= 1\`.`],
      teach: 'Von Neumann’s G(θ) are exactly the eigenvalues of the step matrix when the modes are its eigenvectors — so a numerical spectral radius checks the analysis.',
      explain: t`On 50 points the sawtooth-like mode has $\sin^2\frac{50\pi}{102} = ${(Math.sin((50 * Math.PI) / 102) ** 2).toFixed(5)}$, so the limit is $r = \frac{1}{2}/${(Math.sin((50 * Math.PI) / 102) ** 2).toFixed(5)} = ${(0.5 / Math.sin((50 * Math.PI) / 102) ** 2).toFixed(4)}$, just above ½. Crank–Nicolson’s radius at $r = 50$ is $${Math.abs((1 - 2 * 50 * Math.sin((50 * Math.PI) / 102) ** 2) / (1 + 2 * 50 * Math.sin((50 * Math.PI) / 102) ** 2)).toFixed(4)}$: below 1 — stable — and nearly 1, the ringing mode.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tps', difficulty: 3, transfer: true,
      gen(r) {
        const [mat, k, rho, c] = r.pick([['titanium Ti-6Al-4V', 6.7, 4430, 526], ['stainless steel 304', 16.2, 8000, 500], ['aluminium 6061', 167, 2700, 896], ['copper', 401, 8960, 385]]);
        const dx = r.pick([0.5, 1, 2]) * 1e-3, D = k / (rho * c), ans = (dx * dx) / (2 * D);
        return {
          prompt: t`A thermal model of a ${mat} structure behind a heat shield ($k = ${k}$ W/(m K), $\rho = ${rho}$ kg/m³, $c = ${c}$ J/(kg K)) uses FTCS with $\Delta x = ${dx * 1e3}$ mm. What is the largest stable time step?`,
          visual: { type: 'num3-stability', params: { methods: ['euler'], method: 'euler', mol: 20, r: 0.5, rmax: 1, panels: ['plane'], x: [-2.6, 0.6], y: [-1.3, 1.3], controls: false, readout: false },
            caption: 'FTCS (Euler) at its limit r = ½: the stiffest grid mode sits on the edge of the disc.' },
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (dx * dx) / D, feedback: 'The FTCS limit is r = DΔt/Δx² ≤ ½: include the ½.' }, { value: dx / (2 * D), feedback: 'Δx is squared in the mesh ratio.' }],
          hints: [t`$D = k/(\rho c)$.`, t`$\Delta t \le \Delta x^2/(2D)$.`],
          teach: 'FTCS’s stability limit Δt ≤ Δx²/(2D) depends on the material: high-diffusivity metals force the shortest steps.',
          explain: t`$D = ${tex(D, 3)}$ m²/s, so $\Delta t \le ${tex(ans, 3)}$ s.`,
        };
      },
    }),
    mcq({
      id: 'cp-cn-wiggles', difficulty: 2, transfer: true,
      prompt: t`A cryogenic-tank wall model uses Crank–Nicolson with a large time step. When the tank is suddenly filled with liquid hydrogen (a step change at the inner surface), the computed temperatures near the surface zig-zag point to point for many steps before settling. What is the best fix?`,
      visual: {
        type: 'graph',
        params: { x: [0, 10.5], y: [-0.6, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'grid point', ylabel: 'T (normalised)', xticks: 10,
          curves: [{ fn: 'exp(-x/2)', color: 'ink3', width: 2 }], points: Array.from({ length: 11 }, (_, j) => ({ x: j, y: n12(Math.exp(-j / 2) + (j < 6 ? 0.35 * (j % 2 ? -1 : 1) * Math.exp(-j / 3) : 0)), r: 5, color: 'bad' })) },
        caption: 'Schematic: a smooth profile (grey) and a ringing Crank–Nicolson solution (red).',
      },
      choices: [
        'Take a few backward-Euler steps at the start (or use an L-stable scheme), so the stiff sawtooth modes are damped at once',
        'Switch to FTCS with the same step',
        'Use a coarser grid',
        'Nothing: the wiggles show that Crank–Nicolson is unstable',
      ],
      answer: 0,
      why: {
        1: 'At that step FTCS would be violently unstable.',
        2: 'Coarser grids blur the boundary layer the model is meant to resolve.',
        3: 'Crank–Nicolson is stable — |G| < 1 — the wiggles decay, just slowly, because G(π) ≈ −1.',
      },
      hints: ['What is Crank–Nicolson’s G for the sawtooth at large r?', 'Which time stepper has R → 0 for very stiff modes?'],
      teach: 'Crank–Nicolson’s ringing after a sudden change is a stiff transient with G ≈ −1; a few L-stable steps (Rannacher start-up) remove it.',
      explain: t`The jump excites every mode, the sawtooth included, and Crank–Nicolson multiplies it by nearly $-1$ each step. Two to four backward-Euler steps crush those modes ($G \approx 1/(1 + 4r)$), after which Crank–Nicolson’s second-order accuracy takes over.`,
    }),
    num({
      id: 'cp-btcs', difficulty: 2,
      gen(r) {
        const rr = r.pick([0.5, 2, 10]), th = r.pick([[Math.PI / 2, t`\pi/2`], [Math.PI / 3, t`\pi/3`], [Math.PI, t`\pi`]]);
        const ans = 1 / (1 + 4 * rr * Math.sin(th[0] / 2) ** 2);
        return {
          prompt: t`Backward Euler in time (BTCS) gives $G(\theta) = \dfrac{1}{1 + 4r\sin^2(\theta/2)}$. With $r = ${rr}$, by what factor is the mode $\theta = ${th[1]}$ multiplied per step?`,
          visual: {
            type: 'graph',
            params: { x: [0, Math.PI], y: [0, 1.1], aspect: 'wide', axesAt: 'edge', xlabel: 'θ', ylabel: 'G',
              curves: [{ fn: `1/(1 + 4*${rr}*sin(x/2)^2)`, color: 'good', width: 2.2 }] },
            caption: 'BTCS’s amplification factor at this r: positive and below 1 for every mode.',
          },
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 1 - 4 * rr * Math.sin(th[0] / 2) ** 2, feedback: 'That is FTCS’s G. BTCS divides instead: 1/(1 + 4r sin²(θ/2)).' }],
          hints: [t`$\sin^2(\theta/2)$ at $\theta = ${th[1]}$ is $${(Math.sin(th[0] / 2) ** 2).toFixed(4)}$.`, t`$G = 1/(1 + 4\times${rr}\times${(Math.sin(th[0] / 2) ** 2).toFixed(4)})$.`],
          teach: 'BTCS damps every mode, the stiffest most, at any time step: L-stable diffusion.',
          explain: t`$G = ${ans.toFixed(4)}$. The exact decay over the same step is $e^{-4r\sin^2(\theta/2)} = ${Math.exp(-4 * rr * Math.sin(th[0] / 2) ** 2).toFixed(4)}$: BTCS damps slow modes accurately and fast ones too weakly but safely.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'LeVeque, Finite Difference Methods for ODEs and PDEs (SIAM 2007), ch. 9 (diffusion) and §10.5 (method of lines)', url: 'https://faculty.washington.edu/rjl/fdmbook/' },
    { label: 'Crank & Nicolson (1947), A practical method for numerical evaluation of solutions of partial differential equations of the heat-conduction type, Proc. Camb. Phil. Soc. 43, 50', url: 'https://doi.org/10.1017/S0305004100023197' },
    { label: 'Rannacher (1984), Finite element solution of diffusion problems with irregular data, Numer. Math. 43, 309', url: 'https://doi.org/10.1007/BF01390130' },
  ],
});
