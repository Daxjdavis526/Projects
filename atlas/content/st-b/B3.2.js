// d'Alembert's solution of the wave equation on an infinite line: the operator
// factors into two transport operators, characteristic coordinates turn the
// equation into u_ξη = 0, and the initial displacement and velocity fix the
// two travelling parts.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, xtPlane, SRC } from './_pde.js';

const t = String.raw;
const tri = (x, a, h) => Math.max(0, h * (1 - Math.abs(x) / a));

export default lesson({
  id: 'st-b.B3.2',
  title: 'd’Alembert’s solution',
  minutes: 14, difficulty: 3,
  intro: t`On a finite string you built standing waves from Fourier modes (MATH 2280, lesson DE-8.3). On a very long string there is a one-line answer. The wave operator **factors** into two transport operators, $u_{tt} - c^2u_{xx} = (\partial_t - c\,\partial_x)(\partial_t + c\,\partial_x)\,u$, one for each direction. In the characteristic coordinates $\xi = x - ct$ and $\eta = x + ct$ the equation becomes $u_{\xi\eta} = 0$, whose solutions are $F(\xi) + G(\eta)$: **a right-moving shape plus a left-moving shape**, each keeping its form exactly. Fitting the initial displacement $f$ and velocity $g$ gives **d’Alembert’s formula**:

$$u(x, t) = \frac{f(x - ct) + f(x + ct)}{2} + \frac{1}{2c}\int_{x - ct}^{x + ct} g(s)\,ds$$`,
  symbols: [
    { tex: 'f(x)', text: 'the initial displacement $u(x, 0)$ (m)' },
    { tex: 'g(x)', text: 'the initial velocity $u_t(x, 0)$ (m/s)' },
    { tex: 'c', text: 'the wave speed (m/s)' },
    { tex: t`\xi = x - ct,\ \eta = x + ct`, text: 'characteristic coordinates: constant along right-moving and left-moving characteristics' },
    { tex: t`\frac{f(x \mp ct)}{2}`, text: 'half of the initial shape, carried right and left' },
    { tex: t`\frac{1}{2c}\int_{x - ct}^{x + ct} g\,ds`, text: 'the effect of the initial velocity: the total kick inside the interval the point can “see”, spread over $2c$' },
  ],
  why: t`The interval $[x - ct, x + ct]$ in the formula is a one-dimensional light cone (lesson B3.3); in relativity the same factorization, $\partial_t^2 - c^2\partial_x^2$, is the d’Alembertian $\Box$ that gravitational waves obey.`,
  visual: {
    type: 'pde-player',
    title: 'Two halves running apart',
    lead: t`The solid curve is $u$; the dashed violet and teal curves are its right- and left-moving parts. Below, violet lines are characteristics $x - ct = \text{const}$ and teal ones $x + ct = \text{const}$. Start the string by displacing it, by striking it, or with a single right-moving pulse.`,
    tasks: [
      'Displace it: the bump splits into two half-height copies that never change shape.',
      'Strike it: a flat string given a kick leaves a flat-topped plateau behind, growing outward at speed c.',
      'Pick “one pulse moving right”: with the velocity chosen as −c f′, the left-moving part vanishes.',
    ],
    params: { mode: 'wave', init: 'pluck', profile: 'gauss', c: 2, w: 1, x: [-12, 12], tmax: 5, halves: true, controls: ['init', 'profile', 'c', 't'] },
    caption: t`Exact d’Alembert solution on an infinite string — nothing reflects; the window is a piece of it. With a square pulse the halves keep their corners: the wave equation never smooths.`,
  },
  example: {
    prompt: t`A long cable with wave speed $c = 3$ m/s is pulled into a triangle of height 2 cm and half-width $a = 0.5$ m centred at $x = 0$, and released from rest. When do the two halves separate? Find $u(0.2, 0.05)$ and $u(3, 1)$.`,
    visual: player({ mode: 'wave', init: 'pluck', profile: 'tri', A: 2, w: 0.5, c: 3, t: 0.05, tmax: 1.2, x: [-4, 4], halves: true }, t`The triangle at $t = 0.05$ s (solid) with its two halves (dashed) — still overlapping — and the whole history below. Heights in cm.`),
    steps: [
      { label: 'The data', text: t`$f(x) = 2(1 - |x|/0.5)$ for $|x| < 0.5$ and 0 outside (in cm); $g = 0$, so the integral term vanishes.` },
      { label: 'Two halves', text: t`$u = \tfrac12 f(x - 3t) + \tfrac12 f(x + 3t)$: two triangles of height 1 cm, moving apart at 3 m/s.` },
      { label: 'Separation', text: t`Each half has half-width 0.5 m; their centres are $3t$ from the origin. They stop overlapping when $3t = 0.5$: $t = 1/6$ s $\approx 0.17$ s.` },
      { label: 'Early point', text: t`$u(0.2, 0.05) = \tfrac12 f(0.05) + \tfrac12 f(0.35) = \tfrac12(${tri(0.05, 0.5, 2)}) + \tfrac12(${+tri(0.35, 0.5, 2).toFixed(2)}) = ${+((tri(0.05, 0.5, 2) + tri(0.35, 0.5, 2)) / 2).toFixed(3)}$ cm.` },
      { label: 'Late point', text: t`$u(3, 1) = \tfrac12 f(0) + \tfrac12 f(6) = \tfrac12(2) + 0 = 1$ cm: the peak of the right-moving half has just arrived.` },
      { label: 'Sense check', text: t`In one dimension nothing spreads or fades: each half keeps its height of 1 cm forever (until something reflects it). The corners of the triangle travel too — the wave equation carries kinks without rounding them.` },
    ],
    answer: t`The halves separate at $t = 1/6$ s; $u(0.2, 0.05) = 1.2$ cm and $u(3, 1) = 1$ cm.`,
  },
  practice: [
    num({
      id: 'pluck-value', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 4]), c = r.pick([1, 2, 4]), T = r.pick([0.5, 1]), dx = r.pick([0, 0.5, 1]);
        const X = c * T + dx;
        const val = 0.5 * A * (Math.exp(-((X - c * T) ** 2)) + Math.exp(-((X + c * T) ** 2)));
        return {
          prompt: t`A long string with $c = ${c}$ m/s is released from rest in the shape $u(x, 0) = ${A}e^{-x^2}$ cm ($x$ in m). Find $u(${X}, ${T})$ in cm.`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-0.2, A * 1.1], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u (cm)', curves: [{ fn: `${A}*e^(-x^2)`, color: 'accent', width: 2.4 }] }, caption: 'The initial shape; the string starts at rest.' },
          answer: val, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: 2 * val, feedback: t`Each moving copy carries **half** the initial shape: $\tfrac12f(x - ct) + \tfrac12f(x + ct)$.` }, { value: A * Math.exp(-(dx * dx)), feedback: 'The pulse splits: only half of it goes each way.' }].filter((e) => Math.abs(e.value - val) > 0.02 * val),
          hints: [t`$g = 0$, so $u = \tfrac12\big[f(x - ct) + f(x + ct)\big]$.`, t`$x - ct = ${dx}$ and $x + ct = ${X + c * T}$.`],
          teach: 'Released from rest, a string splits into two half-height copies of its initial shape.',
          explain: t`$u = \tfrac12\big[${A}e^{-${dx * dx}} + ${A}e^{-${(X + c * T) ** 2}}\big] = ${tex(val)}$ cm.`,
        };
      },
    }),
    num({
      id: 'separate', difficulty: 1,
      gen(r) {
        const a = r.pick([0.3, 0.5, 0.8, 1.2]), c = r.pick([2, 5, 10, 40]);
        return {
          prompt: t`A taut line is displaced into a square bump of half-width ${a} m and released from rest. Waves on it travel at ${c} m/s. After how many seconds do the two halves stop overlapping?`,
          visual: player({ mode: 'wave', init: 'pluck', profile: 'box', w: 1, c: 2, t: 0.25, tmax: 2, x: [-6, 6], halves: true }, t`A square bump just after release (illustrative numbers): the two half-height copies (dashed) still overlap in the middle.`),
          answer: a / c, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (2 * a) / c, feedback: 'Both halves move: each needs to travel only its own half-width, a, before they part.' }, { value: a / (2 * c), feedback: 'They separate when each centre has moved a, not a/2.' }],
          hints: ['The halves start on top of each other and move apart, each at speed c.', 'They stop overlapping when the gap between their centres equals the full width 2a.'],
          teach: 'The two halves part when each has moved its own half-width: t = a/c.',
          explain: t`The centres are $2ct$ apart, and the halves (each $2a$ wide) separate when $2ct = 2a$: $t = a/c = ${a}/${c} = ${tex(a / c)}$ s.`,
        };
      },
    }),
    num({
      id: 'struck-plateau', difficulty: 3,
      gen(r) {
        const V = r.pick([0.2, 0.5, 1.0]), a = r.pick([0.05, 0.1, 0.2]), c = r.pick([20, 50, 100]);
        const H = (V * a) / c;
        return {
          prompt: t`A hammer strikes a long, straight string, giving the stretch $|x| < ${a}$ m a sideways velocity of ${V} m/s and the rest of it none. Waves travel at ${c} m/s. Long afterwards, how far is the middle of the string displaced, in mm?`,
          visual: player({ mode: 'wave', init: 'strike', profile: 'box', w: 1, c: 2, t: 2, tmax: 4, x: [-8, 8] }, t`A struck string (illustrative numbers): it starts flat, and the kick leaves a flat-topped plateau that widens at speed $c$ in both directions.`),
          answer: H * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((2 * V * a) / c) * 1000, feedback: t`Divide by $2c$: $\frac{1}{2c}\int g\,ds$, and $\int g\,ds = ${V}\times${2 * a}$.` }, { value: 0, feedback: 'An initial velocity cannot be ignored: the string was flat, but it moves and ends up displaced.' }],
          hints: [t`With $f = 0$: $u = \dfrac{1}{2c}\int_{x - ct}^{x + ct} g(s)\,ds$.`, t`Once $ct$ exceeds ${a} m, the interval around $x = 0$ contains the whole kick: $\int g\,ds = ${V}\times ${2 * a}$.`],
          teach: 'An initial velocity in 1D leaves a permanent plateau of height (total kick)/(2c).',
          explain: t`$u(0, t) = \dfrac{1}{2(${c})}(${V})(${2 * a}) = ${tex(H)}$ m $= ${tex(H * 1000)}$ mm, and it stays: the plateau widens but never comes back down (until reflections arrive).`,
        };
      },
    }),
    mcq({
      id: 'general', difficulty: 2,
      prompt: t`In characteristic coordinates $\xi = x - ct$, $\eta = x + ct$ the wave equation becomes $u_{\xi\eta} = 0$. What is its general solution?`,
      visual: xtPlane({ x: [-4, 4], y: [0, 2], xticks: 8, curves: [...[-6, -4, -2, 0, 2, 4].map((k) => ({ fn: `(x - ${k})/2`, color: 'violet', width: 1.3 })), ...[-4, -2, 0, 2, 4, 6].map((k) => ({ fn: `(${k} - x)/2`, color: 'teal', width: 1.3 }))] }, t`Lines of constant $\xi$ (violet) and constant $\eta$ (teal) for $c = 2$: a skewed grid of characteristic coordinates.`),
      choices: [t`$u = F(\xi) + G(\eta)$ for any functions $F$, $G$`, t`$u = F(\xi)\,G(\eta)$`, t`$u = a\xi + b\eta$ for constants $a$, $b$`, t`$u = F(\xi + \eta)$`],
      answer: 0,
      why: {
        1: t`A product fails: $(FG)_{\xi\eta} = F'G' \ne 0$ in general.`,
        2: 'That is a solution, but far from the most general one: any shapes, not just straight lines.',
        3: t`$\xi + \eta = 2x$: this would not depend on time at all, and only one function appears.`,
      },
      hints: [t`$u_{\xi\eta} = 0$ says $u_\xi$ does not depend on $\eta$.`, t`Integrate in $\eta$: $u_\xi = h(\xi)$. Integrate in $\xi$: an arbitrary function of $\eta$ appears as the “constant”.`],
      teach: t`$u_{\xi\eta} = 0$ integrates to a function of $\xi$ plus a function of $\eta$: one wave each way.`,
      explain: t`$(u_\xi)_\eta = 0 \Rightarrow u_\xi = h(\xi) \Rightarrow u = F(\xi) + G(\eta)$, with $F' = h$. In $x$ and $t$: $F(x - ct) + G(x + ct)$, a right-mover plus a left-mover.`,
    }),
    expr({
      id: 'struck-sine', difficulty: 3,
      gen(r) {
        const c = r.pick([2, 3, 5]);
        return {
          prompt: t`An infinite string starts flat, $u(x, 0) = 0$, with velocity $u_t(x, 0) = \cos x$. Use d’Alembert’s formula with $c = ${c}$.`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x', ylabel: 'g', curves: [{ fn: 'cos(x)', color: 'teal', width: 2.4 }] }, caption: t`The initial velocity $g(x) = \cos x$; the initial displacement is zero.` },
          answer: `cos(x) sin(${c}t)/${c}`, answerTeX: t`\frac{\cos x\,\sin(${c}t)}{${c}}`, lhs: 'u(x, t)',
          vars: { x: [-3, 3], t: [0, 2] },
          errors: [{ answer: `cos(x) sin(${c}t)`, feedback: t`Keep the factor $\frac{1}{2c}$ in front of the integral.` }, { answer: `cos(x) cos(${c}t)`, feedback: t`That is the solution for displacement $\cos x$ released from rest; here the string starts flat and the integral term does the work.` }],
          hints: [t`$u = \dfrac{1}{2c}\int_{x - ct}^{x + ct}\cos s\,ds = \dfrac{\sin(x + ct) - \sin(x - ct)}{2c}$.`, t`Use $\sin(A + B) - \sin(A - B) = 2\cos A\sin B$.`],
          teach: 'The velocity term is (1/2c) times the integral of g over [x − ct, x + ct].',
          explain: t`$u = \dfrac{\sin(x + ${c}t) - \sin(x - ${c}t)}{${2 * c}} = \dfrac{\cos x\,\sin(${c}t)}{${c}}$: a **standing wave**, the sum of two travelling ones. Check: $u(x, 0) = 0$ and $u_t(x, 0) = \cos x$. ✓`,
        };
      },
    }),
    code({
      id: 'dalembert-grid', difficulty: 3,
      prompt: t`Evaluate d’Alembert’s formula on a grid and check that it really solves the wave equation. Write \`wave(x, t, c, f, G)\` returning
$\tfrac12\big[f(x - ct) + f(x + ct)\big] + \dfrac{G(x + ct) - G(x - ct)}{2c}$, where $G$ is an antiderivative of the initial velocity $g$. With $f = e^{-x^2}$, $g = 2e^{-x^2}$ (so $G = \sqrt\pi\,\mathrm{erf}\,x$) and $c = 1.5$, fill \`U[i, j]\` $= u(x_j, t_i)$ on the grids given, then set \`residual\` to the largest $|u_{tt} - c^2u_{xx}|$ estimated by centred differences at the interior points.`,
      starter: t`import numpy as np
from scipy.special import erf

def wave(x, t, c, f, G):
    pass

f = lambda s: np.exp(-s**2)
G = lambda s: np.sqrt(np.pi) * erf(s)       # antiderivative of g = 2 exp(-s^2)
c = 1.5
x = np.linspace(-10, 10, 401)
t = np.linspace(0, 4, 81)
dx, dt = x[1] - x[0], t[1] - t[0]

X, T = np.meshgrid(x, t)        # T[i, j] = t[i], X[i, j] = x[j]
U = None                        # wave(X, T, c, f, G)
residual = None                 # centred differences: (U[2:,1:-1] - 2U[1:-1,1:-1] + U[:-2,1:-1])/dt² ...
print(residual)
`,
      answer: t`import numpy as np
from scipy.special import erf

def wave(x, t, c, f, G):
    return 0.5 * (f(x - c * t) + f(x + c * t)) + (G(x + c * t) - G(x - c * t)) / (2 * c)

f = lambda s: np.exp(-s**2)
G = lambda s: np.sqrt(np.pi) * erf(s)       # antiderivative of g = 2 exp(-s^2)
c = 1.5
x = np.linspace(-10, 10, 401)
t = np.linspace(0, 4, 81)
dx, dt = x[1] - x[0], t[1] - t[0]

X, T = np.meshgrid(x, t)        # T[i, j] = t[i], X[i, j] = x[j]
U = wave(X, T, c, f, G)
utt = (U[2:, 1:-1] - 2 * U[1:-1, 1:-1] + U[:-2, 1:-1]) / dt**2
uxx = (U[1:-1, 2:] - 2 * U[1:-1, 1:-1] + U[1:-1, :-2]) / dx**2
residual = np.max(np.abs(utt - c**2 * uxx))
print(residual)`,
      tests: [
        { name: t`\`U\` has one row per time and one column per position (81 × 401)`, code: 'U is not None and U.shape == (81, 401)' },
        { name: t`at $t = 0$ the row is the initial shape $f$`, code: 'np.max(np.abs(U[0] - f(x))) < 1e-12' },
        { name: t`the initial velocity is $g = 2e^{-x^2}$`, code: 'np.max(np.abs((wave(x, 1e-6, c, f, G) - wave(x, 0.0, c, f, G)) / 1e-6 - 2 * np.exp(-x**2))) < 1e-4' },
        { name: t`at $t = 4$ the middle sits on the plateau $\frac{1}{2c}\int g = \sqrt\pi/c \approx 1.18$`, code: 'abs(U[-1, 200] - np.sqrt(np.pi) / c) < 1e-6' },
        { name: 'the finite-difference residual of the wave equation is small (below 0.02)', code: 'residual is not None and residual < 0.02' },
      ],
      hints: ['`wave` is one line of NumPy: it works on arrays because f and G do.', 'For the residual, the second time difference runs along axis 0 (rows) and the second space difference along axis 1 (columns); compare only interior points.', '`utt = (U[2:,1:-1] - 2*U[1:-1,1:-1] + U[:-2,1:-1])/dt**2`, `uxx = (U[1:-1,2:] - 2*U[1:-1,1:-1] + U[1:-1,:-2])/dx**2`, then `residual = np.max(np.abs(utt - c**2*uxx))`.'],
      teach: 'd’Alembert’s formula is exact; a finite-difference check of the PDE then measures only the error of the differences, which shrinks as the grid is refined.',
      explain: t`The residual is about 0.008 — not zero, because centred differences have an error proportional to $\Delta t^2$ and $\Delta x^2$; halve both steps and it falls fourfold. The exact solution leaves a plateau of height $\sqrt\pi/c$ behind the two fronts, the trace of the initial kick.`,
    }),
    mcq({
      id: 'error-spreading', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “Like ripples on a pond, a pulse on a long ideal string gets lower and wider as it travels, so after 10 s each half is much smaller than half the original height.” What is wrong?`,
      visual: player({ mode: 'wave', init: 'pluck', profile: 'gauss', w: 0.6, c: 2, t: 4, tmax: 5, x: [-10, 10], halves: true }, t`A Gaussian pluck at $t = 4$ s: each half is exactly half the original height and exactly the original width.`),
      choices: ['In one dimension each half keeps its shape exactly: f(x ∓ ct)/2 never spreads or lowers', 'Nothing: all waves spread out as they travel', 'The halves grow taller, because energy is conserved', 'The halves stop after a time 1/c'],
      answer: 0,
      why: {
        1: 'On a pond the energy spreads over ever larger circles (2D), and water waves are dispersive; neither happens on an ideal string.',
        2: 'Energy is conserved with each half keeping its height; there is no growth either (lesson B3.4).',
        3: 'They travel forever at speed c on an infinite ideal string.',
      },
      hints: [t`Look at d’Alembert’s formula: what do $f(x - ct)$ and $f(x + ct)$ look like at a later time?`],
      teach: 'The 1D wave equation is non-dispersive: shapes travel unchanged at speed c.',
      explain: t`$\tfrac12 f(x - ct)$ is the initial shape, halved and shifted — nothing more. Real strings lose a little to air drag and stiffness (lesson B3.1), but the ideal wave equation keeps shapes forever.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const FT = r.pick([10, 20, 40]), mu = 0.004, V = r.pick([0.2, 0.5]), Lk = r.pick([0.1, 0.2]);
        const c = Math.sqrt(FT / mu), H = (V * Lk) / (2 * c);
        return {
          prompt: t`A long tether between two spacecraft has tension ${FT} N and linear density $\mu = ${mu}$ kg/m. A tiny impact gives a ${Lk} m stretch of it a sideways velocity of ${V} m/s. Treating the tether as an ideal infinite string, how far is the struck region displaced once the waves have run away from it, in mm?`,
          visual: player({ mode: 'wave', init: 'strike', profile: 'box', w: 0.5, c: 2, t: 3, tmax: 4, x: [-9, 9] }, t`A struck string (illustrative numbers): the impact leaves a plateau whose edges run outward at the wave speed. The tether’s ends, gravity gradients and damping are ignored.`),
          answer: H * 1000, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: ((V * Lk) / c) * 1000, feedback: t`The plateau height is $\frac{1}{2c}\int g$: divide by $2c$.` }, { value: ((V * Lk) / (2 * FT / mu)) * 1000, feedback: t`$c = \sqrt{F_T/\mu}$ — take the square root.` }],
          hints: [t`$c = \sqrt{F_T/\mu}$.`, t`Plateau height $= \dfrac{1}{2c}\times(\text{velocity} \times \text{length struck})$.`],
          teach: 'A localized kick on a 1D string leaves a plateau of height (total kick)/(2c).',
          explain: t`$c = \sqrt{${FT}/${mu}} = ${tex(c)}$ m/s; plateau $= \dfrac{(${V})(${Lk})}{2(${tex(c)})} = ${tex(H)}$ m $= ${tex(H * 1000)}$ mm.`,
        };
      },
    }),
    mcq({
      id: 'cp-one-way', difficulty: 3,
      prompt: t`Which initial data make $u_{tt} = c^2u_{xx}$ produce a single pulse $f(x - ct)$ moving right, with nothing moving left?`,
      visual: player({ mode: 'wave', init: 'right', profile: 'gauss', w: 0.8, c: 2, t: 2, tmax: 4, x: [-8, 8], halves: true }, t`One pulse, moving right only: the left-moving part (teal, dashed) is zero.`),
      choices: [t`$u(x, 0) = f(x)$ and $u_t(x, 0) = -c\,f'(x)$`, t`$u(x, 0) = f(x)$ and $u_t(x, 0) = 0$`, t`$u(x, 0) = f(x)$ and $u_t(x, 0) = c\,f'(x)$`, t`$u(x, 0) = 0$ and $u_t(x, 0) = f(x)$`],
      answer: 0,
      why: {
        1: 'Released from rest, a pulse always splits in two.',
        2: t`$+c f'$ is the velocity of a pulse moving **left**, $f(x + ct)$.`,
        3: 'Striking a flat string makes a plateau spreading both ways.',
      },
      hints: [t`Differentiate $u = f(x - ct)$ in $t$ and set $t = 0$.`, t`$\partial_t f(x - ct) = -c\,f'(x - ct)$.`],
      teach: 'Choosing g = −c f′ cancels the left-moving part of d’Alembert’s solution.',
      explain: t`$u = f(x - ct)$ has $u_t = -c\,f'(x - ct)$, so at $t = 0$: $u_t = -c f'$. With this $g$, the left-moving part $\tfrac12f(\eta) + \tfrac{1}{2c}\int^\eta g$ is constant — zero. A real source (a hand flicking a rope end) launches one-way waves exactly like this.`,
    }),
    expr({
      id: 'cp-standing', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 4]);
        return {
          prompt: t`An infinite string with $c = ${c}$ is released from rest in the shape $u(x, 0) = \sin x$. Find $u(x, t)$.`,
          visual: { type: 'graph', params: { x: [-7, 7], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [{ fn: 'sin(x)', color: 'accent', width: 2.4 }] }, caption: t`The initial shape $\sin x$, at rest.` },
          answer: `sin(x) cos(${c}t)`, answerTeX: t`\sin x\,\cos(${c}t)`, lhs: 'u(x, t)',
          vars: { x: [-3, 3], t: [0, 2] },
          errors: [{ answer: `sin(x - ${c}t)`, feedback: 'Released from rest, the shape splits into two halves moving opposite ways; one travelling wave alone has a nonzero initial velocity.' }],
          hints: [t`$u = \tfrac12\big[\sin(x - ${c}t) + \sin(x + ${c}t)\big]$.`, t`$\sin(A - B) + \sin(A + B) = 2\sin A\cos B$.`],
          teach: 'Two equal sine waves travelling in opposite directions add up to a standing wave.',
          explain: t`$u = \tfrac12\big[\sin(x - ${c}t) + \sin(x + ${c}t)\big] = \sin x\cos(${c}t)$: a standing wave with nodes at $x = n\pi$, assembled from two travelling ones.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans],
});
