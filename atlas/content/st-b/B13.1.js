// Finite differences: derivatives replaced by differences on a grid, judged
// by Taylor series — the centred difference is second order (error Δx²u‴/6),
// the one-sided ones first order, the second difference second order (error
// Δx²u⁗/12). A scheme is a PDE with every derivative so replaced: upwind for
// u_t + c u_x = 0, uⱼⁿ⁺¹ = uⱼⁿ − ν(uⱼⁿ − uⱼ₋₁ⁿ), ν = cΔt/Δx. Its modified
// equation u_t + c u_x = (cΔx/2)(1 − ν)u_xx makes the leading error a
// numerical diffusion — checked against the scheme (model/pde4-fd.js: a bump
// of width 0.8 m after one 10 m lap at N = 100, ν = 0.5 keeps 0.624 of its
// height; the prediction is 0.625). ν = 1 makes upwind exact. Resolution: the
// second difference of sin kx is (sin(kΔx/2)/(kΔx/2))² × −k² sin kx, so 1% needs
// 19 points per wavelength. Avoids st-f F2.1 (difference quotients of
// functions against round-off) and prog P11 (ODE steppers).
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';
import { run, upwindDiffusivity } from '../../src/viz/model/pde4-fd.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const r4 = (x) => +x.toPrecision(4);
const scheme = (params, caption) => ({ type: 'pde4-scheme', params: { controls: false, play: false, readout: false, ...params }, caption });
const LEVEQUE07 = { label: 'R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations (SIAM, 2007), ch. 1 and 10', url: 'https://doi.org/10.1137/1.9780898717839' };
const STRIKWERDA = { label: 'J. C. Strikwerda, Finite Difference Schemes and Partial Differential Equations, 2nd ed. (SIAM, 2004), ch. 1–3', url: 'https://doi.org/10.1137/1.9780898717938' };

// the worked example, computed by the scheme itself
const WX = { c: 1, dx: 0.1, nu: 0.5, w: 0.8, T: 10 };
WX.D = upwindDiffusivity(WX.c, WX.dx, WX.nu);
WX.pred = Math.sqrt(WX.w ** 2 / (WX.w ** 2 + 4 * WX.D * WX.T));
WX.run = Math.max(...run({ eq: 'advect', scheme: 'upwind', N: 100, nu: WX.nu, profile: 'gauss', w: WX.w, t: WX.T }).u);
const factor = (P) => (Math.sin(Math.PI / P) / (Math.PI / P)) ** 2;     // second difference of a wave sampled P times per wavelength

export default lesson({
  id: 'st-b.B13.1',
  title: 'Finite differences',
  minutes: 15, difficulty: 3,
  intro: t`A computer cannot hold a function, only its values on a grid: $x_j = j\,\Delta x$, $t_n = n\,\Delta t$, with $u_j^n$ standing for $u(x_j, t_n)$. Replace every derivative in a PDE by a difference of neighbouring values and you have a **finite-difference scheme**. How good a difference is, Taylor’s theorem says exactly:

$$\frac{u_{j+1} - u_{j-1}}{2\Delta x} = u_x(x_j) + \frac{\Delta x^2}{6}\,u_{xxx}(x_j) + O(\Delta x^4).$$

The leftover is the **truncation error**, and its power of $\Delta x$ is the **order**: halve the spacing and this centred difference gets four times better, a one-sided difference only twice. A whole scheme is judged the same way — and the surprise is that its leading error is often a *physical-looking* term, an extra diffusion or dispersion that the computer quietly adds to your equation.`,
  symbols: [
    { tex: 'u_j^n', text: 'the grid value at point $j$ and time level $n$: the computer’s stand-in for $u(x_j, t_n)$' },
    { tex: t`\Delta x,\ \Delta t`, text: 'the grid spacing (m) and the time step (s)' },
    { tex: 'u_x,\\ u_{xxx}', text: 'the first and third derivatives of the exact solution at $x_j$' },
    { tex: t`O(\Delta x^4)`, text: 'terms that shrink at least as fast as $\\Delta x^4$ (they hold $u$’s fifth and higher derivatives)' },
    { tex: t`\nu = c\,\Delta t/\Delta x`, text: 'the Courant number: how many cells a wave of speed $c$ (m/s) crosses in one time step' },
  ],
  why: t`Every simulation you will meet — rocket-engine CFD, weather models, the binary-black-hole waveforms LIGO compares its data with — is a PDE turned into differences. Knowing what the differences really solve is how you tell physics from artefact. The next two lessons ask when such a scheme can be trusted at all (stability) and how fast it approaches the truth (convergence); st-f’s [explicit and implicit schemes](#/lesson/st-f.F11.1) take the same tools further.`,
  visual: {
    type: 'pde4-scheme',
    title: 'A bump carried around a ring',
    lead: t`A bump is carried to the right at $c = 1$ m/s around a periodic domain 10 m long; after 10 s it is back where it started. The dots are the scheme’s grid values, the grey line the exact answer. The lower panel shows which grid values one new value is built from.`,
    tasks: [
      t`Upwind, $N = 50$: play one lap. The bump comes back lower and wider — the scheme has added diffusion. Switch to $N = 100$, then 200: the loss roughly halves each time (first order).`,
      t`Set $\nu = 1$: upwind becomes exact — each value just moves one cell per step. Then try $\nu = 0.5$ again.`,
      t`Switch to Lax–Wendroff (second order): far less smearing, but a small wiggly wake trails the bump — its leading error disperses instead of diffusing.`,
    ],
    params: { eq: 'advect', scheme: 'upwind', schemes: ['upwind', 'lw'], nu: 0.5, numax: 1, N: 50, Ns: [25, 50, 100, 200], profile: 'gauss', w: 0.8, tmax: 10, panels: ['profile', 'cone'], levels: 4, ylim: [-0.25, 1.25], hide: ['gain'] },
    caption: t`Periodic domain of length 10 m, $c = 1$ m/s. Grid values (dots) against the exact solution (grey); the shaded triangle in the lower panel is every grid value that one new value depends on, four steps back, and the green line the characteristic of the PDE. The Courant number is limited to 1 here: the next lesson explains why.`,
  },
  example: {
    prompt: t`The upwind scheme $u_j^{n+1} = u_j^n - \nu\,(u_j^n - u_{j-1}^n)$ approximates $u_t + c\,u_x = 0$ (with $c > 0$). Find the PDE it actually solves to second order, and use it to predict how much of a Gaussian bump $e^{-x^2/w^2}$ ($w = ${WX.w}$ m) survives one 10 m lap at $c = 1$ m/s, $\Delta x = ${WX.dx}$ m, $\nu = ${WX.nu}$.`,
    visual: scheme({ eq: 'advect', scheme: 'upwind', nu: WX.nu, N: 100, profile: 'gauss', w: WX.w, t: WX.T, tmax: WX.T, panels: ['profile'], ylim: [-0.15, 1.15] }, t`The scheme’s grid values after one lap (dots) against the exact solution (grey): 100 points, $\nu = 0.5$.`),
    steps: [
      { label: 'Expand in time', text: t`$u_j^{n+1} = u + \Delta t\,u_t + \tfrac12\Delta t^2u_{tt} + \dots$, everything evaluated at $(x_j, t_n)$.` },
      { label: 'Expand in space', text: t`$u_{j-1}^n = u - \Delta x\,u_x + \tfrac12\Delta x^2u_{xx} - \dots$` },
      { label: 'Substitute', text: t`Put both into the scheme and divide by $\Delta t$: $u_t + c\,u_x = -\tfrac12\Delta t\,u_{tt} + \tfrac12c\,\Delta x\,u_{xx} + \dots$ — so the truncation error is first order in $\Delta t$ and $\Delta x$.` },
      { label: 'Trade time for space', text: t`To leading order $u_t = -c\,u_x$, so $u_{tt} = c^2u_{xx}$. Then $$u_t + c\,u_x = \frac{c\,\Delta x}{2}\,(1 - \nu)\,u_{xx}.$$ This **modified equation** is an advection–diffusion equation with diffusivity $D_{\text{num}} = c\,\Delta x(1 - \nu)/2$.` },
      { label: 'Numbers', text: t`$D_{\text{num}} = \tfrac12(1)(${WX.dx})(1 - ${WX.nu}) = ${WX.D}\ \text{m}^2/\text{s}$. Diffusion adds $2D_{\text{num}}t = ${r3(2 * WX.D * WX.T)}\ \text{m}^2$ to the bump’s variance, which starts at $w^2/2 = ${r3(WX.w ** 2 / 2)}\ \text{m}^2$; the height falls as one over the square root of the variance: $\sqrt{${r3(WX.w ** 2 / 2)}/${r3(WX.w ** 2 / 2 + 2 * WX.D * WX.T)}} = ${r3(WX.pred)}$.` },
      { label: 'Check', text: t`Running the scheme itself gives a peak of $${r3(WX.run)}$ — the modified equation predicts it to three figures. Note $1 - \nu$: at $\nu = 1$ the numerical diffusion vanishes and upwind is exact.` },
    ],
    answer: t`The scheme solves $u_t + c\,u_x = \tfrac12c\,\Delta x(1 - \nu)\,u_{xx}$: numerical diffusion $D_{\text{num}} = ${WX.D}\ \text{m}^2/\text{s}$, so only about $${r3(WX.pred)}$ of the bump’s height survives one lap.`,
  },
  practice: [
    num({
      id: 'nozzle-taps', difficulty: 1,
      gen(r) {
        const dx = r.pick([5, 10, 20]), a = r.int(300, 420), g = r.pick([-12, -9, -6, -4]), q = r.pick([0.06, 0.1, 0.15]);
        // pressure along a nozzle wall, kPa against x in mm: p = a + g s + q s², s = x − x₀ (exactly quadratic, so centred is exact)
        const pm = a - g * dx + q * dx * dx, p0 = a, pp = a + g * dx + q * dx * dx;
        const ans = (pp - pm) / (2 * dx);
        return {
          prompt: t`Three pressure taps sit ${dx} mm apart along a nozzle wall. They read $${r4(pm)}$, $${r4(p0)}$ and $${r4(pp)}$ kPa. Estimate the pressure gradient $dp/dx$ at the middle tap with the centred difference, in kPa per mm.`,
          visual: { type: 'graph', params: { x: [-1.6 * dx, 1.6 * dx], y: [Math.min(pm, pp) - 0.25 * Math.abs(pp - pm) - 2, Math.max(pm, pp) + 0.25 * Math.abs(pp - pm) + 2], aspect: 'wide', axesAt: 'edge', xlabel: 'x from the middle tap (mm)', ylabel: 'p (kPa)', curves: [{ fn: `${a} + ${g}*x + ${q}*x^2`, color: 'ink3', width: 1.4, dash: [5, 4] }, { fn: `${p0} + ${r4(ans)}*x`, color: 'warn', width: 1.6, domain: [-dx, dx] }], points: [{ x: -dx, y: pm, color: 'accent', r: 5 }, { x: 0, y: p0, color: 'accent', r: 5 }, { x: dx, y: pp, color: 'accent', r: 5 }] }, caption: 'The three readings (dots), a smooth pressure curve through them (dashed, illustrative) and a line with the slope of the chord through the outer two, drawn through the middle reading (orange).' },
          answer: ans, units: 'kPa/mm', tol: { rel: 0.005 },
          errors: [{ value: (pp - p0) / dx, feedback: 'That is the forward difference — first order. The centred one uses the taps on both sides: (p₊ − p₋)/(2Δx).' }, { value: (pp - pm) / dx, feedback: 'The outer taps are 2Δx apart: divide by 2Δx.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$\dfrac{dp}{dx} \approx \dfrac{p_{j+1} - p_{j-1}}{2\Delta x}$.`],
          teach: 'The centred difference uses the values on both sides and is second order.',
          explain: t`$(${r4(pp)} - ${r4(pm)})/(2\times${dx}) = ${r4(ans)}$ kPa/mm. The middle reading does not enter at all — and for a pressure that varies quadratically, the centred difference is exact, since its error term holds the third derivative.`,
        };
      },
    }),
    match({
      id: 'orders', difficulty: 2,
      prompt: t`Match each difference to its truncation error — what is left over when it is subtracted from the derivative it approximates (the power of $\Delta x$ is the order).`,
      left: [t`$\dfrac{u_{j+1} - u_j}{\Delta x} \approx u_x$`, t`$\dfrac{u_j - u_{j-1}}{\Delta x} \approx u_x$`, t`$\dfrac{u_{j+1} - u_{j-1}}{2\Delta x} \approx u_x$`, t`$\dfrac{u_{j+1} - 2u_j + u_{j-1}}{\Delta x^2} \approx u_{xx}$`],
      right: ['+½Δx u″ (first order)', '−½Δx u″ (first order)', '+⅙Δx² u‴ (second order)', '+¹⁄₁₂Δx² u⁗ (second order)', '+¼Δx² u″ (second order)'],
      answer: [0, 1, 2, 3],
      hints: [t`Expand $u_{j\pm1} = u \pm \Delta x\,u' + \tfrac12\Delta x^2u'' \pm \tfrac16\Delta x^3u''' + \tfrac1{24}\Delta x^4u'''' \pm \dots$ and see which terms survive.`, 'In the symmetric differences the terms of one parity cancel in pairs, which removes the lowest error term.'],
      teach: 'Symmetric differences cancel the lowest error term and gain an order; one-sided ones do not.',
      explain: t`One-sided: error $\pm\tfrac12\Delta x\,u_{xx}$, first order. Centred first difference: $\tfrac16\Delta x^2u_{xxx}$, second order. Second difference: $\tfrac{1}{12}\Delta x^2u_{xxxx}$, second order. Fourth order needs wider stencils, such as $(-u_{j+2} + 8u_{j+1} - 8u_{j-1} + u_{j-2})/(12\Delta x)$.`,
      diagram: '<svg viewBox="0 0 320 70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Five grid points j−2 to j+2"><g fill="currentColor" font-size="12" text-anchor="middle"><line x1="20" y1="30" x2="300" y2="30" stroke="currentColor" stroke-opacity=".4"/><circle cx="40" cy="30" r="5"/><circle cx="100" cy="30" r="5"/><circle cx="160" cy="30" r="6"/><circle cx="220" cy="30" r="5"/><circle cx="280" cy="30" r="5"/><text x="40" y="56">j−2</text><text x="100" y="56">j−1</text><text x="160" y="56">j</text><text x="220" y="56">j+1</text><text x="280" y="56">j+2</text></g></svg>',
    }),
    num({
      id: 'upwind-step', difficulty: 2,
      gen(r) {
        const nu = r.pick([0.25, 0.4, 0.5, 0.6, 0.8]);
        const um = r.pick([0.2, 0.5, 0.9, 1.0]), u0 = r.pick([0.1, 0.3, 0.6]), up = r.pick([0, 0.05, 0.4]);
        const ans = u0 - nu * (u0 - um);
        return {
          prompt: t`An upwind scheme for $u_t + c\,u_x = 0$ with $c > 0$ runs at Courant number $\nu = ${nu}$. At time level $n$ three neighbouring grid values are $u_{j-1}^n = ${um}$, $u_j^n = ${u0}$, $u_{j+1}^n = ${up}$. What is $u_j^{n+1}$?`,
          visual: { type: 'graph', params: { x: [-1.6, 1.6], y: [-0.1, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'grid offset from j', ylabel: 'u', xticks: 4, curves: [], points: [{ x: -1, y: um, color: 'accent', r: 6, label: 'j − 1' }, { x: 0, y: u0, color: 'gold', r: 6, label: 'j' }, { x: 1, y: up, color: 'ink3', r: 6, label: 'j + 1' }], arrows: [{ from: [-1.5, 1.05], to: [-0.6, 1.05], color: 'teal', label: 'flow' }] }, caption: 'The three values at time level n; the flow carries information from left to right.' },
          answer: ans, tol: { rel: 0.002, abs: 0.0005 },
          errors: [{ value: u0 - nu * (up - u0), feedback: t`That used the downwind neighbour $u_{j+1}$. For $c > 0$ information comes from the left: $u_j - \nu(u_j - u_{j-1})$.` }, { value: u0 - 0.5 * nu * (up - um), feedback: 'That is the centred (FTCS) update, not upwind.' }].filter((e) => Math.abs(e.value - ans) > 0.002),
          hints: [t`$u_j^{n+1} = u_j^n - \nu\,(u_j^n - u_{j-1}^n)$: only the point and its upwind (left) neighbour.`],
          teach: 'The upwind update for c > 0 uses the point itself and its left neighbour.',
          explain: t`$${u0} - ${nu}(${u0} - ${um}) = ${r4(ans)}$. Rewritten, $u_j^{n+1} = (1 - \nu)u_j^n + \nu\,u_{j-1}^n$: for $0 \le \nu \le 1$ a weighted average of the old value and the one upstream — so it can never overshoot. The value $u_{j+1}^n$ plays no part.`,
        };
      },
    }),
    num({
      id: 'resolve', difficulty: 2,
      gen(r) {
        const P = r.pick([4, 6, 8, 10, 16]);
        const f = factor(P);
        return {
          prompt: t`For a wave $u = \sin kx$ the second difference gives exactly $$\frac{u_{j+1} - 2u_j + u_{j-1}}{\Delta x^2} = -k^2\left(\frac{\sin(k\Delta x/2)}{k\Delta x/2}\right)^2\sin kx_j.$$ If the wave is sampled at ${P} points per wavelength ($k\Delta x = 2\pi/${P}$), by what factor does the second difference fall short of the true $u_{xx} = -k^2\sin kx$?`,
          visual: { type: 'graph', params: { x: [2, 24], y: [0, 1.05], aspect: 'wide', axesAt: 'edge', xlabel: 'grid points per wavelength', ylabel: 'factor', curves: [{ fn: '(sin(pi/x)/(pi/x))^2', color: 'accent', width: 2.4 }], hlines: [{ y: 1, color: 'ink3' }] }, caption: 'How much of the true second derivative the second difference returns, against resolution.' },
          answer: f, tol: { rel: 0.002 },
          errors: [{ value: Math.sin(Math.PI / P) / (Math.PI / P), feedback: 'Square it: the factor is (sin(kΔx/2)/(kΔx/2))².' }, { value: (Math.sin((2 * Math.PI) / P) / ((2 * Math.PI) / P)) ** 2, feedback: 'The half-angle enters: kΔx/2 = π/P, not 2π/P.' }],
          hints: [t`$k\Delta x/2 = \pi/${P}$.`, t`Evaluate $\big(\sin(\pi/${P})/(\pi/${P})\big)^2$ in radians.`],
          teach: 'Differences see a sampled wave as smoother than it is: the shortfall depends on points per wavelength.',
          explain: t`$\big(\sin(\pi/${P})/(\pi/${P})\big)^2 = ${r4(f)}$. ${P <= 6 ? 'Badly under-resolved waves are seen far too smooth — the grid makes them move at the wrong speed too.' : 'The error is about (kΔx)²/12, the second-order truncation error.'} At 2 points per wavelength (the sawtooth) the factor is $4/\pi^2 \approx 0.41$.`,
        };
      },
    }),
    mcq({
      id: 'nu-one', difficulty: 2,
      prompt: t`At Courant number $\nu = 1$ the upwind scheme returns the exact solution of $u_t + c\,u_x = 0$, however coarse the grid. Why?`,
      visual: scheme({ eq: 'advect', scheme: 'upwind', nu: 1, panels: ['cone'], levels: 4 }, 'The grid in the x–t plane at ν = 1: the characteristic traced back from the gold point (green) runs straight through grid points.'),
      choices: [t`Then $u_j^{n+1} = u_{j-1}^n$: in one step the exact solution moves exactly one cell, onto the next grid point`, 'At ν = 1 the time step is as small as it can be', 'The truncation error is second order at ν = 1', 'The scheme becomes the centred difference'],
      answer: 0,
      why: { 1: t`It is the *largest* stable step for upwind, $\Delta t = \Delta x/c$, not the smallest.`, 2: t`The leading error is $\tfrac12c\,\Delta x(1 - \nu)u_{xx}$ — it is not merely smaller at $\nu = 1$: every error term vanishes, because the update is an exact shift.`, 3: t`The formula still uses $u_j$ and $u_{j-1}$ only; at $\nu = 1$ the $u_j$ term drops out altogether.` },
      hints: [t`Put $\nu = 1$ into $u_j^{n+1} = (1 - \nu)u_j^n + \nu\,u_{j-1}^n$.`, t`How far does the exact solution move in time $\Delta t = \Delta x/c$?`],
      teach: 'When the characteristic through a grid point lands exactly on another grid point, a scheme that copies values along it is exact.',
      explain: t`With $\nu = 1$, $u_j^{n+1} = u_{j-1}^n$, and the exact solution $u(x - ct)$ moves $c\,\Delta t = \Delta x$ per step: the scheme copies values along the characteristics. The modified equation agrees: $D_{\text{num}} \propto 1 - \nu = 0$. In practice $c$ varies in space and time, so $\nu = 1$ everywhere is impossible — and the next lesson shows what happens if any point goes past it.`,
    }),
    num({
      id: 'num-diff', difficulty: 3,
      gen(r) {
        const N = r.pick([50, 100, 200]), nu = r.pick([0.2, 0.5, 0.8]), w = r.pick([0.6, 1]);
        const dx = 10 / N, D = upwindDiffusivity(1, dx, nu), pred = Math.sqrt(w * w / (w * w + 4 * D * 10));
        return {
          prompt: t`Upwind carries a bump $e^{-x^2/w^2}$ with $w = ${w}$ m once around a 10 m ring at $c = 1$ m/s, with $N = ${N}$ grid points ($\Delta x = ${r3(dx)}$ m) and $\nu = ${nu}$. Using the modified equation $u_t + c\,u_x = D_{\text{num}}u_{xx}$, $D_{\text{num}} = \tfrac12c\,\Delta x(1 - \nu)$, predict the fraction of the bump’s height left after the lap (10 s).`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-0.05, 1.15], aspect: 'wide', axesAt: 'edge', xlabel: 'x (m)', ylabel: 'u', curves: [{ fn: `exp(-x^2/${w * w})`, color: 'ink3', width: 1.6, dash: [5, 4] }, { fn: `0.55*exp(-x^2/${(w * w) / 0.3})`, color: 'accent', width: 2.2 }] }, caption: 'The bump at the start (dashed) and a lower, wider bump of the kind upwind returns (solid; illustrative heights, not this problem’s answer).' },
          answer: pred, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(w * w / (w * w + 2 * D * 10)), feedback: t`The bump $e^{-x^2/w^2}$ has variance $w^2/2$, and diffusion adds $2Dt$ to the variance: the height ratio is $\sqrt{(w^2/2)/(w^2/2 + 2Dt)} = \sqrt{w^2/(w^2 + 4Dt)}$.` }, { value: w * w / (w * w + 4 * D * 10), feedback: 'In one dimension the height goes as one over the square root of the variance, not one over the variance.' }].filter((e) => Math.abs(e.value - pred) > 0.01 * pred),
          hints: [t`$D_{\text{num}} = \tfrac12(1)(${r3(dx)})(1 - ${nu}) = ${r3(D)}\ \text{m}^2/\text{s}$.`, t`Variance: from $w^2/2$ to $w^2/2 + 2D_{\text{num}}t$; height $\propto 1/\sqrt{\text{variance}}$.`],
          teach: 'Upwind’s leading error is a diffusion, D = cΔx(1 − ν)/2: it flattens and widens what it carries.',
          explain: t`$D_{\text{num}} = ${r3(D)}\ \text{m}^2/\text{s}$; the variance grows from $${r3(w * w / 2)}$ to $${r3(w * w / 2 + 20 * D)}\ \text{m}^2$, so the height falls to $\sqrt{${r3(w * w / 2)}/${r3(w * w / 2 + 20 * D)}} = ${r3(pred)}$ of its start. Halving $\Delta x$ halves $D_{\text{num}}$ — first-order convergence, seen as a physical process.`,
        };
      },
    }),
    code({
      id: 'upwind-lap', difficulty: 3,
      prompt: t`Write \`upwind(u, nu)\`, one step of $u_j^{n+1} = u_j^n - \nu\,(u_j^n - u_{j-1}^n)$ on a periodic grid (\`np.roll(u, 1)\` is the array of left neighbours $u_{j-1}$). Carry the bump around one lap at $N = 100$, $\nu = 0.5$ and set \`peak\` to its final height. Then set \`exact_err\` to the largest difference from the starting bump after one lap at $\nu = 1$.`,
      starter: t`import numpy as np

L, N, c = 10.0, 100, 1.0
x = np.arange(N) * (L / N)
u0 = np.exp(-(x - 5.0)**2 / 0.8**2)

def upwind(u, nu):
    pass

def lap(nu):
    steps = round(N / nu)          # one lap: N cells at nu cells per step
    u = u0.copy()
    for n in range(steps):
        u = upwind(u, nu)
    return u

peak = None
exact_err = None
print(peak, exact_err)
`,
      answer: t`import numpy as np

L, N, c = 10.0, 100, 1.0
x = np.arange(N) * (L / N)
u0 = np.exp(-(x - 5.0)**2 / 0.8**2)

def upwind(u, nu):
    return u - nu * (u - np.roll(u, 1))

def lap(nu):
    steps = round(N / nu)          # one lap: N cells at nu cells per step
    u = u0.copy()
    for n in range(steps):
        u = upwind(u, nu)
    return u

peak = lap(0.5).max()
exact_err = np.max(np.abs(lap(1.0) - u0))
print(peak, exact_err)`,
      tests: [
        { name: 'one step of upwind is right', code: 'np.allclose(upwind(np.array([0.0, 1.0, 0.0, 0.0]), 0.5), [0.0, 0.5, 0.5, 0.0])' },
        { name: t`after one lap at $\nu = 0.5$ the peak is about 0.624 — the modified equation predicts 0.625`, code: 'peak is not None and abs(peak - 0.6244) < 2e-3' },
        { name: t`at $\nu = 1$ the lap is exact`, code: 'exact_err is not None and exact_err < 1e-12' },
      ],
      hints: ['`np.roll(u, 1)[j]` is `u[j-1]` (with wrap-around): the left neighbour.', 'One line: `return u - nu * (u - np.roll(u, 1))`.', '`peak = lap(0.5).max()`, `exact_err = np.max(np.abs(lap(1.0) - u0))`.'],
      teach: 'A whole explicit scheme is one NumPy line on a periodic grid; np.roll supplies the neighbours.',
      explain: t`The peak comes back at $${r3(WX.run)}$, against the modified equation’s $${r3(WX.pred)}$: the scheme really is solving an advection–diffusion equation. At $\nu = 1$ every step is an exact one-cell shift, so after 100 steps the bump is back untouched (to round-off).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const c = r.pick([600, 800, 1200]), dxmm = r.pick([1, 2, 5]), nu = r.pick([0.3, 0.5, 0.7]);
        const D = upwindDiffusivity(c, dxmm / 1000, nu);
        return {
          prompt: t`A first-order upwind CFD code carries a temperature front along a rocket nozzle’s core flow at $c = ${c}$ m/s on a grid with $\Delta x = ${dxmm}$ mm, at Courant number $\nu = ${nu}$. What numerical diffusivity does the scheme add, in m²/s? (For comparison, the hot gas’s own thermal diffusivity is of order $10^{-4}\ \text{m}^2/\text{s}$.)`,
          visual: { type: 'graph', params: { x: [0, 10], y: [-0.1, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x along the nozzle (cells)', ylabel: 'T (scaled)', curves: [{ fn: 'step(4 - x)', color: 'ink3', width: 1.6, dash: [5, 4] }, { fn: '0.5*(1 - erf((x - 4)/1.4))', color: 'accent', width: 2.2 }] }, caption: 'A sharp temperature front (dashed) and what a diffusive scheme makes of it (solid), illustrative.' },
          answer: D, units: 'm^2/s', tol: { rel: 0.005 },
          errors: [{ value: c * (dxmm / 1000) * (1 - nu), feedback: 'The modified equation has a factor ½: D = cΔx(1 − ν)/2.' }, { value: (c * (dxmm / 1000) * nu) / 2, feedback: 'The factor is (1 − ν), not ν: the diffusion vanishes at ν = 1.' }, { value: (c * dxmm * (1 - nu)) / 2, feedback: 'Convert Δx to metres first.' }].filter((e) => Math.abs(e.value - D) > 0.01 * D),
          hints: [t`$D_{\text{num}} = \tfrac12c\,\Delta x\,(1 - \nu)$ with $\Delta x$ in metres.`, t`$\tfrac12\times${c}\times${dxmm / 1000}\times(1 - ${nu})$.`],
          teach: 'First-order upwind adds a diffusivity cΔx(1 − ν)/2, which in fast flow can dwarf the physical one.',
          explain: t`$D_{\text{num}} = \tfrac12(${c})(${tex(dxmm / 1000)})(1 - ${nu}) = ${r3(D)}\ \text{m}^2/\text{s}$ — around ${tex(Math.round(D / 1e-4))} times the gas’s real thermal diffusivity. A first-order scheme in a fast flow smears fronts by its own artefact, not by physics; that is why production CFD uses second-order (or higher) schemes with limiters.`,
        };
      },
    }),
    num({
      id: 'cp-gw-resolve', difficulty: 3, transfer: true,
      gen(r) {
        const pct = r.pick([0.5, 1, 2, 5]);
        let P = 2; while (1 - factor(P) > pct / 100) P++;
        return {
          prompt: t`A numerical-relativity code evaluates second derivatives of a gravitational wave with the centred second difference, which returns a fraction $\big(\sin(\pi/P)/(\pi/P)\big)^2$ of the true value for a wave sampled at $P$ points per wavelength. What is the smallest whole number of points per wavelength that keeps this error below ${pct}%?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x (wavelengths)', ylabel: 'h', xticks: 4, curves: [{ fn: 'sin(2*pi*x)', color: 'accent', width: 2 }], points: Array.from({ length: 13 }, (_, i) => ({ x: i / 6, y: Math.sin((2 * Math.PI * i) / 6), color: 'gold', r: 4 })) }, caption: 'A wave sampled at six points per wavelength (gold); the question is how many are enough.' },
          answer: P, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: P - 1, feedback: t`At $P = ${P - 1}$ the error is $${r3(100 * (1 - factor(P - 1)))}\%$ — just over the limit.` }],
          hints: ['The error is 1 − (sin(π/P)/(π/P))². Try values of P.', t`For small $\pi/P$ the error is about $(\pi/P)^2/3$: solve that for a first guess, then check whole numbers near it.`],
          teach: 'Second-order differences need many points per wavelength for small errors: the error falls only as 1/P².',
          explain: t`$1 - \big(\sin(\pi/${P})/(\pi/${P})\big)^2 = ${r3(100 * (1 - factor(P)))}\%$, below ${pct}%, while $P = ${P - 1}$ gives $${r3(100 * (1 - factor(P - 1)))}\%$. Since the error falls only as $1/P^2$, numerical-relativity codes use fourth- to eighth-order differences (or spectral methods) to resolve the many cycles of an inspiral affordably.`,
        };
      },
    }),
    mcq({
      id: 'cp-truncation', difficulty: 2,
      prompt: t`A scheme’s truncation error is what is left over when the **exact** solution of the PDE is put into the scheme. What does it tell you directly?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-0.2, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'u', curves: [{ fn: 'exp(-x^2)', color: 'ink3', width: 2 }], points: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map((x) => ({ x, y: Math.exp(-x * x), color: 'accent', r: 4 })) }, caption: 'The exact solution sampled on a grid: substitute these values into the scheme and see how far it is from balancing.' },
      choices: ['How well the scheme imitates the PDE at one step (consistency) — not, by itself, how big the error in the computed solution will be', 'The error of the computed solution at the final time', 'The round-off error of the arithmetic', 'Whether the scheme is stable'],
      answer: 0,
      why: { 1: 'Errors made at each step can grow (or be damped) as the scheme runs; the final error depends on that too — on stability.', 2: 'Truncation error is what is left with exact arithmetic; round-off is a separate thing.', 3: 'A scheme can have a tiny truncation error and still blow up — FTCS for advection does (next lesson).' },
      hints: ['It measures a single step. What happens to errors over many steps is another question.'],
      teach: 'Truncation error measures consistency; whether local errors stay small over many steps is stability.',
      explain: t`A small truncation error means the scheme is **consistent** with the PDE. The global error at time $t$ is these local errors accumulated over $t/\Delta t$ steps *and amplified by the scheme*. Consistency plus stability gives convergence — the Lax equivalence theorem of [lesson B13.3](#/lesson/st-b.B13.3).`,
    }),
  ],
  sources: [SRC.strauss, LEVEQUE07, STRIKWERDA],
});
