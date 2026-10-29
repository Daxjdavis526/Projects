// Computing Christoffel symbols efficiently: the diagonal-metric rules
// (Γ^μ_μν = ∂_ν ln√|g_μμ|, Γ^μ_νν = −∂_μ g_νν / 2g_μμ), applied to the
// Schwarzschild (t, r) plane (Γ^r_tt → GM/r², the Newtonian g), Rindler in
// laboratory form, a power-law universe, the stereographic sphere and a
// torus; the off-diagonal trap (Eddington–Finkelstein: Γ^t̃_t̃t̃ = 2M²/r³ ≠ 0);
// the Lagrangian shortcut; a finite-difference checker in Python.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const C = 299792458;
const GM_E = 3.986004418e14;   // m³/s², IERS
const R_E = 6371e3;

const chartPic = (metric, P, caption, extra = {}) => ({
  type: 'dg4-chart',
  params: { metric, mode: 'chart', P, drag: false, readout: false, cells: 8, ...extra },
  caption,
});

export default lesson({
  id: 'st-c.C13.1',
  title: 'Computing Christoffel symbols',
  minutes: 16, difficulty: 3,
  equation: t`\Gamma^\mu{}_{\mu\nu} = \partial_\nu\ln\sqrt{|g_{\mu\mu}|}, \qquad \Gamma^\mu{}_{\nu\nu} = -\frac{\partial_\mu g_{\nu\nu}}{2g_{\mu\mu}}\ \ (\mu \ne \nu)`,
  intro: t`The Christoffel formula of C12.3 is a sum of $n$ terms for each of $n^2(n + 1)/2$ symbols — 40 in spacetime — and most of the work is bookkeeping. When the metric is **diagonal** ($g_{\mu\nu} = 0$ for $\mu \ne \nu$), the inverse is just $g^{\mu\mu} = 1/g_{\mu\mu}$ and the formula collapses to the two rules above (no sum over repeated $\mu$), plus one more: **symbols with three different indices vanish.** In 2D, with $ds^2 = A\,du^2 + B\,dv^2$, that is all six symbols at a glance.

Two habits make the results trustworthy. **Check by a second route**: the Euler–Lagrange equations of $L = \tfrac12 g_{\mu\nu}\dot x^\mu\dot x^\nu$ deliver the same symbols (gr.S12.d). **Check numerically**: finite differences of $g$ alone must reproduce every symbol at a sample point. And beware the off-diagonal trap: one nonzero $g_{\mu\nu}$ with $\mu \ne \nu$ and the shortcuts no longer apply.`,
  symbols: [
    { tex: t`\Gamma^\mu{}_{\mu\nu}`, text: t`a symbol whose upper index repeats a lower one (no sum here): the logarithmic rate at which the length of $\partial_\mu$ changes along $x^\nu$` },
    { tex: t`\Gamma^\mu{}_{\nu\nu}`, text: t`with $\mu \ne \nu$: how moving along $\partial_\nu$ turns it toward $\partial_\mu$` },
    { tex: t`g_{\mu\mu}`, text: t`a diagonal component of the metric; $\sqrt{|g_{\mu\mu}|}$ is the length of the basis vector $\partial_\mu$` },
    { tex: t`\partial_\nu`, text: t`the partial derivative along the coordinate $x^\nu$` },
  ],
  why: t`Every GR calculation starts here: Christoffels → geodesics → curvature → field equations. For the Schwarzschild metric $\Gamma^r{}_{tt}$ is, at large $r$, Newton’s $GM/r^2$ — the place where the geometry hands back ordinary gravity.`,
  visual: {
    type: 'dg4-chart',
    title: 'Formula against finite differences',
    lead: t`Drag P across each chart. The readout lists every nonzero Christoffel symbol at P from the formula, with — in brackets — the same symbol computed from nothing but the metric’s values at four neighbouring points (central differences, step $10^{-5}$).`,
    tasks: [
      t`Schwarzschild ($M = 1$): move P toward $r = 2$. $\Gamma^t{}_{tr}$ and $\Gamma^r{}_{rr}$ blow up like $\pm1/\big(2(r - 2)\big)$ — the chart failing — while $\Gamma^r{}_{tt} = (r - 2)/r^3$ goes to zero.`,
      t`Rindler: $\Gamma^\rho{}_{\eta\eta} = \rho$ and $\Gamma^\eta{}_{\eta\rho} = 1/\rho$ at every $\eta$ — the metric does not depend on $\eta$, so neither do they.`,
      t`Eddington–Finkelstein: one off-diagonal component, and now **all six** symbols are nonzero, including $\Gamma^{\tilde t}{}_{\tilde t\tilde t}$, which a diagonal reflex would set to zero.`,
    ],
    params: { metric: 'schwarzschild', metrics: ['polar', 'sphere', 'rindler', 'schwarzschild', 'ef'], mode: 'chart', readout: ['P', 'g', 'check'], cells: 8 },
    caption: t`Each chart drawn as plain coordinates with its unit ellipses or light cones. The two columns agree to the digits shown everywhere inside a chart: the formulas are right.`,
  },
  example: {
    prompt: t`Compute every Christoffel symbol of the Schwarzschild radial–time plane, $ds^2 = -f\,dt^2 + f^{-1}dr^2$ with $f = 1 - 2M/r$ ($G = c = 1$). Check them at $r = 5M$ against finite differences, and find what $\Gamma^r{}_{tt}$ becomes far away.`,
    visual: chartPic('schwarzschild', [5, 0], t`The Schwarzschild chart with P at $r = 5M$; the readout gives each symbol from the formula and (in brackets) from finite differences.`, { readout: ['check'] }),
    steps: [
      { label: 'Ingredients', text: t`Diagonal, depending on $r$ only: $g_{tt} = -f$, $g_{rr} = 1/f$, $f' = 2M/r^2$. Any symbol needing a $t$-derivative vanishes: $\Gamma^t{}_{tt} = \Gamma^t{}_{rr} = \Gamma^r{}_{tr} = 0$.` },
      { label: 'Repeated index', text: t`$\Gamma^t{}_{tr} = \partial_r\ln\sqrt f = \dfrac{f'}{2f} = \dfrac{M}{r(r - 2M)}$; $\Gamma^r{}_{rr} = \partial_r\ln\sqrt{1/f} = -\dfrac{f'}{2f} = -\dfrac{M}{r(r - 2M)}$.` },
      { label: 'Distinct pair', text: t`$\Gamma^r{}_{tt} = -\dfrac{\partial_r g_{tt}}{2g_{rr}} = \dfrac{f'}{2/f} = \dfrac{ff'}{2} = \dfrac{M(r - 2M)}{r^3}$.` },
      { label: 'Numbers at 5M', text: t`$\Gamma^t{}_{tr} = 1/15M = 0.0667/M$, $\Gamma^r{}_{rr} = -0.0667/M$, $\Gamma^r{}_{tt} = 3/125M = 0.0240/M$ — matching the finite differences in the picture.` },
      { label: 'Far away', text: t`For $r \gg M$, $\Gamma^r{}_{tt} \to M/r^2$; with $G$ and $c$ restored, $c^2\,\Gamma^r{}_{tt} \to GM/r^2$. In the geodesic equation $\ddot r = -\Gamma^r{}_{tt}\,\dot t^2 + \dots$ it is the Newtonian pull.` },
    ],
    answer: t`$\Gamma^t{}_{tr} = -\Gamma^r{}_{rr} = \dfrac{M}{r(r - 2M)}$, $\Gamma^r{}_{tt} = \dfrac{M(r - 2M)}{r^3}$, the other three zero; at $5M$: $0.0667$, $-0.0667$, $0.0240$ (per $M$); $\Gamma^r{}_{tt} \to GM/(c^2r^2)$ far away.`,
  },
  practice: [
    num({
      id: 'rindler-lab', difficulty: 2,
      gen(r) {
        const g = r.pick([0.2, 0.5, 1]), x = r.pick([0, 0.5, 1, 2]);
        const ans = g * (1 + g * x);
        return {
          prompt: t`The Rindler metric in laboratory form ($c = 1$) is $ds^2 = -(1 + gx)^2dt^2 + dx^2$: a rocket floor at $x = 0$ accelerating at $g$. With $g = ${g}$, find $\Gamma^x{}_{tt}$ at $x = ${x}$.`,
          visual: chartPic('rindler', [1 / g + x, 0], t`The same spacetime in the $(\rho, \eta)$ chart, $\rho = x + 1/g$, P at height $x = ${x}$.`, { probe: true, view: { a: [0, 1 / g + 3], b: [-1.5, 1.5] } }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: g, feedback: t`That is the value at the floor, $x = 0$. Keep the factor $(1 + gx)$.` }, { value: 2 * ans, feedback: t`$-\partial_xg_{tt}/(2g_{xx}) = 2g(1 + gx)/2$: keep the $\tfrac12$.` }, { value: -ans, feedback: t`$g_{tt}$ is negative, so $-\partial_x g_{tt}$ is positive.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\Gamma^x{}_{tt} = -\dfrac{\partial_xg_{tt}}{2g_{xx}}$ with $g_{tt} = -(1 + gx)^2$, $g_{xx} = 1$.`],
          teach: t`For a diagonal metric, $\Gamma^\mu{}_{\nu\nu} = -\partial_\mu g_{\nu\nu}/(2g_{\mu\mu})$ when $\mu \ne \nu$.`,
          explain: t`$\Gamma^x{}_{tt} = g(1 + gx) = ${nice(ans, 4)}$. At the floor it is exactly $g$: in the geodesic equation a free particle "falls" with $\ddot x = -g$. Higher up, an observer at fixed $x$ needs $g/(1 + gx)$ of proper acceleration: Rindler observers accelerate less the higher they ride.`,
        };
      },
    }),
    expr({
      id: 'power-law', difficulty: 2,
      gen(r) {
        const [n, ntex] = r.pick([[2 / 3, t`2/3`], [1 / 2, t`1/2`], [1, '1'], [1 / 3, t`1/3`]]);
        return {
          prompt: t`A 1+1 universe with scale factor $a(t) = t^{${ntex}}$ has $ds^2 = -dt^2 + t^{2\cdot${ntex}}dx^2$. Find $\Gamma^x{}_{xt}$.`,
          visual: chartPic('desitter', [0, 0], t`For comparison, the de Sitter chart, $a = e^{Ht}$, whose $\Gamma^x{}_{xt} = H$ is constant; for a power law it falls off in time.`, { probe: false }),
          answer: `${n}/t`, answerTeX: t`\frac{${ntex}}{t}`, lhs: t`\Gamma^x{}_{xt}`,
          vars: { t: [0.5, 3] },
          errors: [{ answer: `${2 * n}/t`, feedback: t`$\partial_t\ln\sqrt{g_{xx}} = \partial_t\ln a$: the square root halves the $2\cdot${ntex}$.` }, { answer: `${n}*t^(${2 * n - 1})`, feedback: t`That is $\tfrac12\partial_tg_{xx}$; divide by $g_{xx}$ too (take the logarithmic derivative).` }],
          hints: [t`$\Gamma^x{}_{xt} = \partial_t\ln\sqrt{g_{xx}} = \partial_t\ln a$.`],
          teach: t`In an expanding universe $\Gamma^x{}_{xt} = \dot a/a$, the Hubble rate.`,
          explain: t`$\Gamma^x{}_{xt} = \dot a/a = ${ntex}/t$: the Hubble rate $H(t)$. For $a \propto t^{2/3}$ (matter) that is $H = 2/(3t)$, the relation behind "the universe is about $\tfrac23$ of a Hubble time old" in a matter-only model.`,
        };
      },
    }),
    num({
      id: 'stereo', difficulty: 3,
      gen(r) {
        const X = r.pick([0.5, 1, 1.5]), Y = r.pick([0, 0.5, 1]);
        const ans = (-2 * X) / (1 + X * X + Y * Y);
        return {
          prompt: t`The unit sphere in stereographic coordinates has $ds^2 = e^{2\sigma}(dX^2 + dY^2)$ with $e^{\sigma} = \dfrac{2}{1 + X^2 + Y^2}$. Find $\Gamma^X{}_{XX}$ at $(X, Y) = (${X}, ${Y})$.`,
          visual: chartPic('stereo', [X, Y], 'The stereographic chart with P; circles of one true size grow away from the centre.', { probe: true }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`$\partial_X\ln\sqrt{g_{XX}} = \partial_X\sigma$, not $\partial_X(2\sigma)$.` }, { value: -ans, feedback: t`$\sigma$ decreases as $X$ grows: the derivative is negative for $X > 0$.` }],
          hints: [t`$\Gamma^X{}_{XX} = \partial_X\ln\sqrt{g_{XX}} = \partial_X\sigma$.`, t`$\sigma = \ln2 - \ln(1 + X^2 + Y^2)$, so $\partial_X\sigma = -\dfrac{2X}{1 + X^2 + Y^2}$.`],
          teach: t`For a conformally flat metric $e^{2\sigma}\delta$, $\Gamma^a{}_{bc} = \delta^a_b\partial_c\sigma + \delta^a_c\partial_b\sigma - \delta_{bc}\partial^a\sigma$.`,
          explain: t`$\Gamma^X{}_{XX} = -\dfrac{2(${X})}{1 + ${nice(X * X + Y * Y)}} = ${nice(ans, 4)}$. Every symbol of a conformally flat metric is a first derivative of the one function $\sigma$ — here $\Gamma^Y{}_{XX} = -\partial_Y\sigma$ and $\Gamma^X{}_{XY} = \partial_Y\sigma$ too.`,
        };
      },
    }),
    mcq({
      id: 'lagrangian', difficulty: 2,
      prompt: t`For $L = \tfrac12\big(-f\dot t^2 + f^{-1}\dot r^2\big)$, the $r$ Euler–Lagrange equation, divided by $g_{rr} = 1/f$, reads $\ddot r + \tfrac12ff'\,\dot t^2 - \dfrac{f'}{2f}\,\dot r^2 = 0$. What does it say about $\Gamma^r{}_{tt}$ and $\Gamma^r{}_{rr}$?`,
      visual: chartPic('schwarzschild', [5, 0], 'The Schwarzschild chart, with every symbol read out at P for checking.', { readout: ['gamma'], probe: true }),
      choices: [t`$\Gamma^r{}_{tt} = \tfrac12ff'$ and $\Gamma^r{}_{rr} = -\dfrac{f'}{2f}$`, t`$\Gamma^r{}_{tt} = ff'$ and $\Gamma^r{}_{rr} = -\dfrac{f'}{f}$`, t`$\Gamma^r{}_{tt} = -\tfrac12ff'$ and $\Gamma^r{}_{rr} = \dfrac{f'}{2f}$`, 'Nothing: the Euler–Lagrange equations give only conserved quantities'],
      answer: 0,
      why: {
        1: t`Squared velocities ($\dot t^2$, $\dot r^2$) appear once in $\Gamma^\mu{}_{\nu\lambda}\dot x^\nu\dot x^\lambda$; only mixed terms like $\dot t\dot r$ come twice.`,
        2: t`Compare with $\ddot r + \Gamma^r{}_{\nu\lambda}\dot x^\nu\dot x^\lambda = 0$: the coefficients carry over with their signs.`,
        3: t`Cyclic coordinates give conserved quantities; the other equations give the full geodesic equation, $\Gamma$’s and all.`,
      },
      hints: [t`Match term by term with $\ddot r + \Gamma^r{}_{tt}\dot t^2 + 2\Gamma^r{}_{tr}\dot t\dot r + \Gamma^r{}_{rr}\dot r^2 = 0$.`],
      teach: 'Read Γ off the Euler–Lagrange equations: square terms carry Γ once, mixed terms twice.',
      explain: t`$\Gamma^r{}_{tt} = \tfrac12ff' = M(r - 2M)/r^3$ and $\Gamma^r{}_{rr} = -f'/(2f)$, agreeing with the worked example. No $\dot t\dot r$ term: $\Gamma^r{}_{tr} = 0$. Two independent routes, one answer.`,
    }),
    code({
      id: 'fd-christoffel', difficulty: 3,
      prompt: t`Write \`christoffel(g, x, h)\` that returns the array \`G[l, m, k]\` $= \Gamma^l{}_{mk}$ for **any** metric function \`g(x)\` (returning an $n\times n$ NumPy array), using central differences of \`g\` with step \`h\` and the formula $\Gamma^l{}_{mk} = \tfrac12 g^{ls}(\partial_m g_{ks} + \partial_k g_{ms} - \partial_s g_{mk})$. The program checks it on the Schwarzschild plane at $r = 5$ ($M = 1$, coordinates $x = (t, r)$).`,
      starter: t`import numpy as np

def christoffel(g, x, h=1e-5):
    x = np.array(x, dtype=float)
    n = len(x)
    dg = np.zeros((n, n, n))          # dg[s, m, k] = d g_mk / d x^s
    for s in range(n):
        e = np.zeros(n); e[s] = h
        dg[s] = (g(x + e) - g(x - e)) / (2 * h)
    ginv = np.linalg.inv(g(x))
    G = np.zeros((n, n, n))
    # fill G[l, m, k] here
    return G

def g_schw(x, M=1.0):
    t, r = x
    f = 1 - 2 * M / r
    return np.array([[-f, 0.0], [0.0, 1 / f]])

G = christoffel(g_schw, [0.0, 5.0])
print("Gamma^t_tr =", G[0, 0, 1], " expected", 1 / 15)
print("Gamma^r_tt =", G[1, 0, 0], " expected", 3 / 125)
`,
      answer: t`import numpy as np

def christoffel(g, x, h=1e-5):
    x = np.array(x, dtype=float)
    n = len(x)
    dg = np.zeros((n, n, n))          # dg[s, m, k] = d g_mk / d x^s
    for s in range(n):
        e = np.zeros(n); e[s] = h
        dg[s] = (g(x + e) - g(x - e)) / (2 * h)
    ginv = np.linalg.inv(g(x))
    G = np.zeros((n, n, n))
    for l in range(n):
        for m in range(n):
            for k in range(n):
                G[l, m, k] = 0.5 * sum(ginv[l, s] * (dg[m, k, s] + dg[k, m, s] - dg[s, m, k]) for s in range(n))
    return G

def g_schw(x, M=1.0):
    t, r = x
    f = 1 - 2 * M / r
    return np.array([[-f, 0.0], [0.0, 1 / f]])

G = christoffel(g_schw, [0.0, 5.0])
print("Gamma^t_tr =", G[0, 0, 1], " expected", 1 / 15)
print("Gamma^r_tt =", G[1, 0, 0], " expected", 3 / 125)
`,
      tests: [
        { name: t`Schwarzschild at $r = 5$: $\Gamma^t{}_{tr} = 1/15$`, code: 'abs(christoffel(g_schw, [0.0, 5.0])[0, 0, 1] - 1/15) < 1e-7' },
        { name: t`Schwarzschild at $r = 5$: $\Gamma^r{}_{tt} = 3/125$ and $\Gamma^r{}_{rr} = -1/15$`, code: 'abs(christoffel(g_schw, [0.0, 5.0])[1, 0, 0] - 3/125) < 1e-7 and abs(christoffel(g_schw, [0.0, 5.0])[1, 1, 1] + 1/15) < 1e-7' },
        { name: t`symmetric in the lower indices`, code: 'np.allclose(christoffel(g_schw, [0.0, 4.0]), np.transpose(christoffel(g_schw, [0.0, 4.0]), (0, 2, 1)))' },
        { name: t`an off-diagonal metric (Eddington–Finkelstein at $r = 3$): $\Gamma^{\tilde t}{}_{\tilde t\tilde t} = 2/27$`, code: 'abs(christoffel(lambda x: np.array([[1 + 2/x[0], 2/x[0]], [2/x[0], -(1 - 2/x[0])]]), [3.0, 0.0])[1, 1, 1] - 2/27) < 1e-7' },
      ],
      hints: [t`Three nested loops over \`l\`, \`m\`, \`k\`, and a sum over \`s\`.`, t`\`G[l, m, k] = 0.5 * sum(ginv[l, s] * (dg[m, k, s] + dg[k, m, s] - dg[s, m, k]) for s in range(n))\` — note \`dg[m, k, s]\` is $\partial_m g_{ks}$.`],
      teach: 'Finite differences of the metric alone reproduce every Christoffel symbol: an independent check on any hand calculation.',
      explain: t`The same 15-line function checks any metric in any dimension — including off-diagonal ones, where the shortcuts fail. Errors are about $h^2$ times third derivatives of $g$, so $h = 10^{-5}$ gives roughly ten correct digits away from singular points.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-earth-g', difficulty: 2, transfer: true,
      gen(r) {
        const [where, h] = r.pick([['at the Earth’s surface', 0], ['at the ISS’s altitude, 420 km', 420e3], ['at GPS altitude, 20 200 km', 20200e3]]);
        const rr = R_E + h, M = GM_E / (C * C), ans = C * C * M * (rr - 2 * M) / rr ** 3;
        return {
          prompt: t`Treat the Earth’s exterior as Schwarzschild with $M = GM_\oplus/c^2$, $GM_\oplus = 3.986\,004\times10^{14}\ \text{m}^3/\text{s}^2$, mean radius 6371 km. Evaluate $c^2\,\Gamma^r{}_{tt} = c^2M(r - 2M)/r^3$ ${where}, in $\text{m/s}^2$.`,
          visual: chartPic('schwarzschild', [6, 0], t`The Schwarzschild chart in units of $M$ (P at $6M$). For the Earth, $M = 4.4$ mm and the surface is at $r \approx 1.4\times10^9M$, far off to the right.`, { probe: true }),
          answer: ans, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: ans * C * C, feedback: t`Here $M$ is a length; $\Gamma^r{}_{tt}$ is in $\text{m}^{-1}$, and $c^2$ turns it into an acceleration — check where the factors of $c$ went.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$M = GM_\oplus/c^2 = 4.435$ mm.`, t`$c^2M(r - 2M)/r^3 = (GM_\oplus/r^2)(1 - 2M/r)$, and $2M/r$ is about $10^{-9}$.`],
          teach: t`Far from a mass, $c^2\Gamma^r{}_{tt} \approx GM/r^2$: the Christoffel symbol is the Newtonian gravitational field.`,
          explain: t`$${nice(ans, 5)}\ \text{m/s}^2$ — the Newtonian $GM/r^2$ to nine digits (the relativistic factor $1 - 2M/r$ differs from 1 by $${tex(2 * M / rr, 2)}$). Measured $g$ differs again, because of the Earth’s rotation and shape.`,
        };
      },
    }),
    num({
      id: 'cp-ef-trap', difficulty: 3,
      gen(r) {
        const k = r.pick([3, 4, 5, 6]);
        const ans = 2 / k ** 3;
        return {
          prompt: t`In Eddington–Finkelstein form, $ds^2 = -\big(1 - \tfrac{2M}{r}\big)d\tilde t^{\,2} + \tfrac{4M}{r}\,d\tilde t\,dr + \big(1 + \tfrac{2M}{r}\big)dr^2$, with $M = 1$. Its inverse metric has $g^{\tilde tr} = 2M/r$, and $g_{\tilde t\tilde t}$ depends only on $r$. Find $\Gamma^{\tilde t}{}_{\tilde t\tilde t}$ at $r = ${k}$.`,
          visual: chartPic('ef', [k, 1], t`The Eddington–Finkelstein chart with P at $r = ${k}M$.`, { probe: true }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 0, feedback: t`For a diagonal metric it would vanish — but here $g^{\tilde tr} \ne 0$ lets $\partial_rg_{\tilde t\tilde t}$ in.` }, { value: -ans, feedback: t`$-\partial_rg_{\tilde t\tilde t} = +2M/r^2$ enters the formula through its third term with a minus sign.` }, { value: 2 * ans, feedback: t`Keep the $\tfrac12$.` }],
          hints: [t`$\Gamma^{\tilde t}{}_{\tilde t\tilde t} = \tfrac12 g^{\tilde t\sigma}\big(2\partial_{\tilde t}g_{\tilde t\sigma} - \partial_\sigma g_{\tilde t\tilde t}\big)$; nothing depends on $\tilde t$, so only $\sigma = r$ survives.`, t`$= \tfrac12\,g^{\tilde tr}\,(-\partial_rg_{\tilde t\tilde t}) = \tfrac12\cdot\tfrac{2M}{r}\cdot\tfrac{2M}{r^2}$.`],
          teach: 'With an off-diagonal metric, the inverse metric mixes components: symbols the diagonal rules would zero can survive.',
          explain: t`$\Gamma^{\tilde t}{}_{\tilde t\tilde t} = 2M^2/r^3 = ${nice(ans, 4)}$. The diagonal shortcut would have said $\partial_{\tilde t}$ of nothing, zero — wrong.`,
        };
      },
    }),
    expr({
      id: 'cp-torus', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 4]);
        return {
          prompt: t`A torus with tube radius 1 and central radius ${R} has $ds^2 = (${R} + \cos v)^2du^2 + dv^2$. Find $\Gamma^u{}_{uv}$.`,
          visual: { type: 'gr-surface', params: { mode: 'basis', surface: 'torus', v: 0.8, controls: false, readout: false }, caption: t`The torus (drawn with central radius 2) and its coordinate basis vectors at a point: $\mathbf e_u$ stretches and shrinks as $v$ changes.` },
          answer: `-sin(v)/(${R} + cos(v))`, answerTeX: t`-\frac{\sin v}{${R} + \cos v}`, lhs: t`\Gamma^u{}_{uv}`,
          vars: { v: [-3, 3] },
          errors: [{ answer: `sin(v)/(${R} + cos(v))`, feedback: t`$\partial_v(${R} + \cos v) = -\sin v$.` }, { answer: `-2sin(v)/(${R} + cos(v))`, feedback: t`$\partial_v\ln\sqrt{g_{uu}} = \partial_v\ln(${R} + \cos v)$: the square root removes the 2.` }],
          hints: [t`$\Gamma^u{}_{uv} = \partial_v\ln\sqrt{g_{uu}}$.`, t`$\sqrt{g_{uu}} = ${R} + \cos v$.`],
          teach: t`$\Gamma^\mu{}_{\mu\nu} = \partial_\nu\ln\sqrt{|g_{\mu\mu}|}$: the relative rate at which the basis vector $\partial_\mu$ grows along $x^\nu$.`,
          explain: t`$\Gamma^u{}_{uv} = -\sin v/(${R} + \cos v)$: zero on both equators, where the circles of constant $v$ are longest and shortest. It is the relative growth of $\mathbf e_u$ as you go round the tube.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.2 and §5.1', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Hartle, Gravity, ch. 8 (the Lagrangian shortcut)', url: 'https://www.cambridge.org/highereducation/books/gravity/' },
    { label: 'IERS Conventions (2010), GM of the Earth', url: 'https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html' },
  ],
});
