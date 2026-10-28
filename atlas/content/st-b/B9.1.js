// Green's functions for ODE boundary problems: the response G(x, s) to a unit
// point load at s, for −u″ = f with fixed ends, is a tent — continuous, with
// its slope dropping by exactly 1 under the load. Superposition then solves
// every load at once, u = ∫G f ds. Reciprocity G(x, s) = G(s, x); other end
// conditions change the tent; the discrete Green's matrix is the inverse of
// the finite-difference matrix; the causal (initial-value) kind is the
// impulse response of math2280.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
// the tent G(x, s) = min(x, s)(L − max(x, s))/L as an expression of x
const tent = (s, L = 1) => `min(x, ${s})*(${L} - max(x, ${s}))/${L}`;
// a sagging cable: −(deflection), so the picture hangs down
const sag = (curves, L, ymin, extra = {}, caption) => ({
  type: 'graph',
  params: { x: [-0.04 * L, 1.04 * L], y: [ymin, -0.12 * ymin], aspect: 'wide', xlabel: 'x (m)', ylabel: 'sag (m)', axesAt: 'edge', yticks: 4, curves: curves.map((c) => ({ domain: [0, L], ...c })), ...extra },
  ...(caption ? { caption } : {}),
});
// stainless steel 304 at 300 K: k = 14.9 W/(m K) (Incropera, Table A.1)
const K_SS = 14.9;

export default lesson({
  id: 'st-b.B9.1',
  title: 'Green’s functions for ODE boundary problems',
  minutes: 14, difficulty: 3,
  intro: t`Hang a weight at one point of a taut cable and it bends into a **tent**: straight on each side, with a corner under the weight. That tent is the cable’s response to a point load. Any load at all — snow along its length, a row of instruments — is a sum of point loads, and since the equation is linear the sag is the same sum of tents. For $-u'' = f$ on $0 \le x \le L$ with both ends fixed ($u = 0$ there):

$$u(x) = \int_0^L G(x, s)\,f(s)\,ds$$

where $G(x, s)$, the **Green’s function**, is the response at $x$ to a unit point source at $s$: it solves $-G'' = \delta(x - s)$ with the same end conditions. Find $G$ once and every right-hand side is a single integral.`,
  symbols: [
    { tex: 'u(x)', text: 'the unknown: here the sag of a cable (m), or a steady temperature rise along a rod' },
    { tex: 'f(s)', text: 'the source: load per unit length divided by the cable’s tension (1/m), or heat input per length divided by $kA$' },
    { tex: 'G(x, s)', text: 'the Green’s function: the response at $x$ to a unit point source at $s$ (units of $u$ per unit of total source; m here)' },
    { tex: 's', text: 'where the source sits (m); $x$ is where you look' },
    { tex: t`\delta(x - s)`, text: 'the Dirac delta: a unit spike at $s$ with area 1, units 1/m ([PHYS 3600](#/lesson/phys3600.M0.4))' },
    { tex: 'L', text: 'the length of the interval (m)' },
  ],
  why: t`Green’s functions are how physics turns “a point source” into “any source”: the gravitational potential of a point mass, the field of a point charge and the retarded wave of a flash (the next two lessons) are all Green’s functions, and the linearized Einstein equations are solved the same way.`,
  visual: {
    type: 'graph',
    title: 'A tent per point load',
    lead: t`One point load first: move it with $s$ and watch the tent’s corner follow. Then switch to many small loads spread evenly along the cable: their tents add up to the smooth sag of a uniform load.`,
    tasks: [
      'With one load, slide s: the sag under the load is s(1 − s), largest at the middle. The two straight sides always meet at a corner.',
      'Read the slopes: left of the load 1 − s, right of it −s. They always differ by exactly 1 — that is the unit load.',
      'Switch to many loads and raise N: the sum of N tents closes in on the parabola x(1 − x)/2 (dashed).',
    ],
    params: {
      x: [-0.04, 1.04], y: [-0.29, 0.03], aspect: 'wide', xlabel: 'x', ylabel: 'sag', axesAt: 'edge', yticks: 4,
      choices: [{ key: 'view', label: 'Load', options: [[0, 'one point load'], [1, 'a uniform load as N point loads']], value: 0, explain: 'A unit point load at $s$, or a total load 1 shared among $N$ equal point loads at even spacing.' }],
      sliders: [
        { key: 's', label: 'Load position $s$', min: 0.05, max: 0.95, step: 0.05, value: 0.3, explain: 'Where the unit point load hangs (one-load view).' },
        { key: 'N', label: 'Number of loads $N$', min: 1, max: 24, step: 1, value: 3, explain: 'Each carries $1/N$, at $s_j = (j - \\tfrac12)/N$ (many-loads view).' },
      ],
      curves: [
        { fn: `-(${tent('s')})`, color: 'accent', width: 2.6, when: 'step(0.5 - view)', domain: [0, 1] },
        { sum: '-(1/N)*min(x, (k - 0.5)/N)*(1 - max(x, (k - 0.5)/N))', k: [1, 'N'], color: 'accent', width: 2.6, when: 'step(view - 0.5)' },
        { fn: '-x*(1 - x)/2', color: 'gold', width: 1.6, dash: [5, 4], when: 'step(view - 0.5)', domain: [0, 1], label: 'uniform load: x(1 − x)/2', labelAt: 0.62, labelDy: 16 },
      ],
      points: [{ x: 's', y: '-s*(1 - s)', color: 'warn', when: 'step(0.5 - view)', label: 'unit load', labelDy: 14 }],
      readouts: [
        { label: 'sag under the load, s(1 − s)', expr: 's*(1 - s)*step(0.5 - view)', digits: 3, zero: 1e-9 },
        { label: 'slope left of the load', expr: '(1 - s)*step(0.5 - view)', digits: 3, zero: 1e-9 },
        { label: 'slope right of the load', expr: '-s*step(0.5 - view)', digits: 3, zero: 1e-9 },
      ],
    },
    caption: t`$-u'' = f$ on $[0, 1]$ with both ends fixed; the sag is drawn downward. Each point load is an ideal spike — a real hook spreads its load over a short length, which rounds the corner without changing the tent elsewhere. Small slopes are assumed, as in every taut-string model.`,
  },
  example: {
    prompt: t`Solve $-u'' = 1$ on $0 \le x \le 1$ with $u(0) = u(1) = 0$ by the Green’s function

$$G(x, s) = \begin{cases} x(1 - s), & x \le s \\ s(1 - x), & x \ge s. \end{cases}$$

Then read it as a cable of length $L = 10$ m under tension $T = 2000$ N carrying a uniform $q = 50$ N/m: how far does the middle sag?`,
    visual: sag([{ fn: '-x*(1 - x)/2', color: 'accent', width: 2.6 }, ...[0.25, 0.5, 0.75].map((s) => ({ fn: `-0.18*(${tent(s)})`, color: 'ink3', width: 1.2, dash: [4, 4] }))], 1, -0.14, { xlabel: 'x', ylabel: 'sag', points: [{ x: 0.5, y: -0.125, label: '1/8', color: 'gold', labelDy: 14 }] }, t`The solution $x(1 - x)/2$ (blue, drawn downward) and, dashed, the tents of three of the point loads it is built from (scaled down to fit).`),
    steps: [
      { label: 'Split the integral', text: t`For a fixed $x$, the sources at $s < x$ see the right-hand branch of the tent and those at $s > x$ the left: $u(x) = \int_0^x s(1 - x)\,ds + \int_x^1 x(1 - s)\,ds$.` },
      { label: 'Integrate', text: t`$= (1 - x)\dfrac{x^2}{2} + x\dfrac{(1 - x)^2}{2} = \dfrac{x(1 - x)}{2}\big(x + 1 - x\big) = \dfrac{x(1 - x)}{2}$.` },
      { label: 'Check', text: t`$u'' = -1$ ✓, and $u(0) = u(1) = 0$ ✓. The largest sag is at the middle: $u(\tfrac12) = \tfrac18$.` },
      { label: 'Put units back', text: t`For the cable $-Tu'' = q$, so $f = q/T$ and lengths scale with $L$: $u = \dfrac{q}{T}\,\dfrac{x(L - x)}{2}$, with the middle sag $\dfrac{qL^2}{8T} = \dfrac{50 \times 100}{8 \times 2000} = ${50 * 100 / (8 * 2000)}$ m.` },
      { label: 'Sense check', text: t`The end slope $qL/2T = ${50 * 10 / (2 * 2000)}$ is small, as the model requires. Double the tension and the sag halves; double the length and it quadruples.` },
    ],
    answer: t`$u = x(1 - x)/2$, with $u(\tfrac12) = \tfrac18$. The cable sags $qL^2/8T = ${50 * 100 / (8 * 2000)}$ m at the middle.`,
  },
  practice: [
    mcq({
      id: 'kink', difficulty: 1,
      prompt: t`$G(x, s)$ solves $-G'' = \delta(x - s)$ on $[0, 1]$ with $G = 0$ at both ends. What does it look like at $x = s$?`,
      visual: sag([{ fn: `-(${tent(0.3)})`, color: 'accent', width: 2.6 }], 1, -0.25, { xlabel: 'x', ylabel: 'sag', points: [{ x: 0.3, y: -0.21, color: 'warn', label: 's', labelDy: 14 }] }),
      choices: ['continuous, with a corner: its slope drops by exactly 1', 'a jump in G itself, of height 1', 'smooth: δ is just a very large but finite value there', 'continuous, with its slope rising by exactly 1'],
      answer: 0,
      why: {
        1: t`If $G$ jumped, $G'$ would hold a delta and $G''$ the derivative of a delta — far worse than the $\delta$ on the right-hand side.`,
        2: t`$\delta$ has no finite value at $s$; integrating $-G'' = \delta$ across $s$ gives a finite change in $G'$, so the slope breaks.`,
        3: t`Integrate $-G'' = \delta(x - s)$ from $s^-$ to $s^+$: $-\big[G'\big] = 1$, so the slope **drops** by 1. The minus sign in $-u''$ makes the corner point the way the load pulls.`,
      },
      hints: [t`Integrate both sides of $-G'' = \delta(x - s)$ over a tiny interval around $s$.`],
      teach: 'A point source puts a corner in G: G is continuous, and its slope jumps by the source strength.',
      explain: t`$-\int_{s^-}^{s^+}G''\,dx = 1$ gives $G'(s^+) - G'(s^-) = -1$; $G$ itself stays continuous (the cable does not break). Away from $s$, $G'' = 0$: straight lines. Two lines, two end conditions, one continuity condition and one slope jump fix the tent.`,
    }),
    num({
      id: 'point-load', difficulty: 2,
      gen(r) {
        const L = r.pick([4, 6, 10]), T = r.pick([500, 800, 1200]), P = r.pick([40, 60, 90]), frac = r.pick([0.25, 1 / 3, 0.5]);
        const s = L * frac, d = (P * s * (L - s)) / (T * L);
        return {
          prompt: t`A cable of length $L = ${L}$ m is stretched to tension $T = ${T}$ N between two fixed anchors. An instrument of weight $P = ${P}$ N hangs from it at $s = ${r3(s)}$ m from one end. Its sag obeys $-Tu'' = P\,\delta(x - s)$. How far below the anchors is the instrument, in centimetres?`,
          visual: sag([{ fn: `-(${(P / T).toFixed(6)})*(${tent(r3(s), L)})`, color: 'accent', width: 2.6 }], L, -1.6 * d, { points: [{ x: r3(s), y: -d, color: 'warn', label: `${P} N`, labelDy: 14 }], yticks: 0 }, 'The cable and the hanging instrument. The sag is exaggerated: the real one is at most a few per cent of the length.'),
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: (P * s * (L - s)) / T * 100, feedback: t`On an interval of length $L$ the tent is $G(x, s) = x(L - s)/L$ for $x \le s$: divide by $L$.` }, { value: (P * (L - s)) / T * 100, feedback: 'That is the slope of the left side of the tent, not the sag.' }].filter((e) => Math.abs(e.value - d * 100) > 0.02 * d * 100),
          hints: [t`$u = \dfrac{P}{T}\,G(x, s)$ with $G(x, s) = \dfrac{x(L - s)}{L}$ for $x \le s$.`, t`At the load, $x = s$: $u = \dfrac{P\,s(L - s)}{T\,L}$.`],
          teach: 'A point load P on a cable of tension T gives the sag (P/T)·G(x, s): a tent.',
          explain: t`$u(s) = \dfrac{${P}\times${r3(s)}\times${r3(L - s)}}{${T}\times${L}} = ${tex(d)}$ m $= ${r3(d * 100)}$ cm. The two straight sides have slopes $P(L - s)/TL$ and $-Ps/TL$, whose difference $P/T$ is the load divided by the tension.`,
        };
      },
    }),
    num({
      id: 'two-loads', difficulty: 2,
      gen(r) {
        const s1 = r.pick([0.2, 0.3]), s2 = r.pick([0.6, 0.7, 0.8]), a = r.pick([1, 2]), b = r.pick([1, 3]), x0 = 0.5;
        const G = (x, s) => Math.min(x, s) * (1 - Math.max(x, s));
        const u = a * G(x0, s1) + b * G(x0, s2);
        return {
          prompt: t`On $[0, 1]$ with fixed ends, point sources of strength ${a} at $s = ${s1}$ and ${b} at $s = ${s2}$ act together: $-u'' = ${a}\,\delta(x - ${s1}) + ${b}\,\delta(x - ${s2})$. Using $G(x, s) = \min(x, s)\,\big(1 - \max(x, s)\big)$, find $u(0.5)$.`,
          visual: sag([{ fn: `-${a}*(${tent(s1)})`, color: 'ink3', width: 1.3, dash: [4, 4] }, { fn: `-${b}*(${tent(s2)})`, color: 'ink3', width: 1.3, dash: [4, 4] }, { fn: `-(${a}*(${tent(s1)}) + ${b}*(${tent(s2)}))`, color: 'accent', width: 2.6 }], 1, -0.75, { xlabel: 'x', ylabel: 'sag', vlines: [{ x: 0.5, color: 'gold' }] }),
          answer: u, tol: { rel: 1e-3, abs: 1e-4 },
          errors: [{ value: G(x0, s1) + G(x0, s2), feedback: 'Weight each tent by its source strength.' }, { value: a * s1 * (1 - s1) + b * s2 * (1 - s2), feedback: 'Those are the sags under each load; you want both tents evaluated at x = 0.5.' }].filter((e) => Math.abs(e.value - u) > 0.01 * u),
          hints: ['Linear equation: the response to two sources is the sum of the two responses.', t`$u(0.5) = ${a}\,G(0.5, ${s1}) + ${b}\,G(0.5, ${s2})$.`],
          teach: 'Superposition: the response to several point sources is the weighted sum of their Green’s functions.',
          explain: t`$${a}\times ${s1}(1 - 0.5) + ${b}\times 0.5(1 - ${s2}) = ${r3(a * G(x0, s1))} + ${r3(b * G(x0, s2))} = ${r3(u)}$. A continuous load is the same sum with infinitely many tents — the integral $\int G f\,ds$.`,
        };
      },
    }),
    mcq({
      id: 'reciprocity', difficulty: 2,
      prompt: t`On a taut cable, a 10 N weight hung at point P makes point Q sag by 3 mm. The weight is moved to Q. How far does P sag now?`,
      visual: sag([{ fn: `-(${tent(0.25)})`, color: 'accent', width: 2.4, label: 'load at P', labelAt: 0.05, labelDy: 14 }, { fn: `-(${tent(0.65)})`, color: 'violet', width: 2.4, dash: [6, 4], label: 'load at Q', labelAt: 0.82, labelDy: 14 }], 1, -0.29, { xlabel: 'x', ylabel: 'sag', yticks: 0, points: [{ x: 0.25, y: 0, label: 'P', color: 'warn', r: 3, labelDy: -10 }, { x: 0.65, y: 0, label: 'Q', color: 'warn', r: 3, labelDy: -10 }] }),
      choices: ['3 mm, exactly', 'more than 3 mm, because Q is nearer the middle', 'less than 3 mm, because P is nearer an end', 'it cannot be said without the cable’s length and tension'],
      answer: 0,
      why: {
        1: t`Q’s position matters to the sag *under* the load, but the cross-response is symmetric: $G(x_P, x_Q) = G(x_Q, x_P)$.`,
        2: t`Each tent is lower near its own corner, but the formula $\min(x, s)\,(L - \max(x, s))/L$ does not change when $x$ and $s$ swap.`,
        3: 'The symmetry holds whatever the length and tension; they scale both responses equally.',
      },
      hints: [t`Look at $G(x, s) = \min(x, s)\,(L - \max(x, s))/L$. What happens when you swap $x$ and $s$?`],
      teach: 'Reciprocity: G(x, s) = G(s, x) — the response at x to a source at s equals the response at s to the same source at x.',
      explain: t`$G$ is symmetric, so P sags 3 mm. This is **Maxwell–Betti reciprocity**, used to calibrate structures: load one point, measure everywhere, and you know the response at that point to loads everywhere. It holds whenever the operator is self-adjoint, as $-d^2/dx^2$ with fixed ends is.`,
    }),
    expr({
      id: 'sliding-end', difficulty: 3,
      prompt: t`A rod is held at zero temperature rise at $x = 0$ and insulated at $x = 1$, so $u(0) = 0$ and $u'(1) = 0$. Find the Green’s function $G(x, s)$ of $-u'' = f$ **for $x < s$**.`,
      visual: { type: 'graph', params: { x: [-0.04, 1.04], y: [-0.05, 0.7], aspect: 'wide', xlabel: 'x', ylabel: 'G', axesAt: 'edge', yticks: 4, curves: [{ fn: '0*x', color: 'ink3', width: 6, domain: [0, 1] }], vlines: [{ x: 0.6, label: 's', color: 'warn' }], points: [{ x: 0, y: 0, label: 'G = 0', color: 'gold', labelDy: -12 }, { x: 1, y: 0.62, label: 'G′ = 0', color: 'gold', labelAlign: 'right', labelDx: -10, r: 0 }] }, caption: t`The rod, its source at $s$, and the two end conditions (gold). The curve itself is for you to find.` },
      answer: 'x',
      answerTeX: 'x',
      lhs: t`G(x, s)`,
      vars: { x: [0.02, 0.4], s: [0.5, 0.95] },
      errors: [{ answer: 'x*(1 - s)', feedback: 'That is the fixed-ends tent. Here the right end is insulated: the right-hand piece must be flat, G′ = 0.' }, { answer: 's', feedback: 'That is the piece to the right of the source, x > s.' }],
      hints: [t`Each piece is a straight line. Left: $G = ax$ (to vanish at 0). Right: flat, $G = b$ (to have $G' = 0$ at 1).`, t`Continuity at $s$: $as = b$. Slope drop of 1: $0 - a = -1$.`, t`So $a = 1$ and $b = s$.`],
      teach: 'Change the end conditions and the Green’s function changes: each end condition is built into G.',
      explain: t`$G = x$ for $x < s$ and $G = s$ for $x > s$: $G(x, s) = \min(x, s)$. Heat injected at $s$ flows only toward the cold end, so the rod is uniformly warm beyond the heater. Symmetric again, as reciprocity demands.`,
    }),
    code({
      id: 'green-vs-direct', difficulty: 3,
      prompt: t`Solve $-u'' = e^x$ on $[0, 1]$ with $u(0) = u(1) = 0$ two ways on the grid $x_i = ih$, $i = 1 \ldots 99$, $h = 0.01$.

1. **Directly**: build the finite-difference matrix \`A\` (2 on the diagonal, −1 beside it, all divided by $h^2$) and \`u_direct = np.linalg.solve(A, f)\`.
2. **By Green’s function**: build the matrix \`Gm[i, j]\` $= G(x_i, x_j) = \min(x_i, x_j)\,(1 - \max(x_i, x_j))$ and sum the sources, \`u_green = h * Gm @ f\`.

Then compare both with the exact $u = 1 - e^x + (e - 1)x$.`,
      starter: t`import numpy as np

n = 99
h = 1 / (n + 1)
x = np.arange(1, n + 1) * h
f = np.exp(x)

A = None        # the finite-difference matrix
u_direct = None
Gm = None       # G(x_i, x_j)
u_green = None
print(np.max(np.abs(u_green - u_direct)))
`,
      answer: t`import numpy as np

n = 99
h = 1 / (n + 1)
x = np.arange(1, n + 1) * h
f = np.exp(x)

A = (2 * np.eye(n) - np.eye(n, k=1) - np.eye(n, k=-1)) / h**2
u_direct = np.linalg.solve(A, f)
X, S = np.meshgrid(x, x, indexing='ij')
Gm = np.minimum(X, S) * (1 - np.maximum(X, S))
u_green = h * Gm @ f
print(np.max(np.abs(u_green - u_direct)))
print(np.max(np.abs(np.linalg.inv(A) - h * Gm)))`,
      tests: [
        { name: 'the two solutions agree to round-off ($10^{-12}$)', code: 'u_green is not None and u_direct is not None and np.max(np.abs(u_green - u_direct)) < 1e-12' },
        { name: 'both are within $10^{-5}$ of the exact solution', code: 'u_direct is not None and np.max(np.abs(u_direct - (1 - np.exp(x) + (np.e - 1) * x))) < 1e-5' },
        { name: 'the inverse of $A$ is $h$ times the Green’s matrix', code: 'A is not None and Gm is not None and np.allclose(np.linalg.inv(A), h * Gm, atol=1e-12)' },
      ],
      hints: ['`A = (2*np.eye(n) - np.eye(n, k=1) - np.eye(n, k=-1)) / h**2`.', '`X, S = np.meshgrid(x, x, indexing="ij")`, then `Gm = np.minimum(X, S) * (1 - np.maximum(X, S))`.', '`u_green = h * Gm @ f` is the integral ∫G f ds as a sum with spacing h.'],
      teach: 'The Green’s function is the inverse of the differential operator: on a grid, h·G is exactly the inverse of the difference matrix.',
      explain: t`The two agree to about $10^{-15}$ — not by luck: the inverse of the difference matrix is **exactly** $h\,G(x_i, x_j)$, the tent sampled on the grid (the code’s last line prints the difference, about $10^{-17}$). Each column of $A^{-1}$ is the grid’s response to one unit load. Both differ from the exact $u$ by about $2\times10^{-6}$, the second-order error of the grid ($\propto h^2$).`,
    }),
    mcq({
      id: 'ivp-vs-bvp', difficulty: 2,
      prompt: t`A spring–mass system $\ddot y + \omega^2 y = f(t)$ starting at rest has the Green’s function $G(t, s) = \sin\omega(t - s)/\omega$ for $t > s$ and **zero for $t < s$** ([variation of parameters](#/lesson/math2280.DE-3.4)). The cable’s tent is nonzero on **both** sides of its load. Why the difference?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [-1.2, 1.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'G', axesAt: 'edge', curves: [{ fn: 'step(x - 3)*sin(x - 3)', color: 'accent', width: 2.4 }], vlines: [{ x: 3, label: 'kick at s', color: 'warn' }] }, caption: t`The oscillator’s response to a unit kick at $s = 3$ s ($\omega = 1$ rad/s): nothing before the kick.` },
      choices: ['Initial conditions fix the past, so a source can only affect later times; end conditions constrain both ends, so a load is felt on both sides', 'Time runs one way but space does not: it is a property of the variable’s name, not of the problem', 'The oscillator has no Green’s function at all; that formula is something else', 'The tent is nonzero on both sides only because the cable is in tension'],
      answer: 0,
      why: {
        1: 'Pose the oscillator with conditions at both ends of a time interval (y(0) = 0, y(T) = 0) and its Green’s function is nonzero on both sides too. The conditions decide, not the letter.',
        2: t`It is a Green’s function: it solves the equation with $\delta(t - s)$ on the right and meets the conditions. It is the **impulse response** ([delta functions](#/lesson/math2280.DE-6.4)).`,
        3: 'Tension sets the size of the response, not where it is nonzero; a heated rod with cold ends has the same tent.',
      },
      hints: ['Ask what each problem is told about: the start only, or both ends?'],
      teach: 'A Green’s function inherits the conditions of its problem: initial-value problems give causal Green’s functions, boundary-value problems give two-sided ones.',
      explain: t`With $y(0) = \dot y(0) = 0$ the solution up to time $s$ is zero whatever happens later: the Green’s function is **causal**, and $y(t) = \int_0^t G(t, s)f(s)\,ds$ adds up only past kicks. A boundary-value problem ties both ends, so a load anywhere is felt everywhere. The wave equation’s **retarded** Green’s function (lesson B9.3) is the causal kind.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-heater', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.3, 0.4, 0.5]), s = r.pick([0.1, 0.15]), Q = r.pick([0.1, 0.2, 0.3]), dmm = r.pick([10, 12]);
        const A = (Math.PI * (dmm / 1000) ** 2) / 4, kA = K_SS * A, dT = (Q * s * (L - s)) / (kA * L);
        return {
          prompt: t`A solid stainless-steel strut ($k = ${K_SS}$ W/(m K), diameter ${dmm} mm, length $L = ${L}$ m) joins two mounts on a cryogenic tank, both held at the tank temperature. A sensor heater on the strut puts $Q = ${Q}$ W into it at $s = ${s}$ m from one end. In vacuum, ignoring radiation, the steady temperature rise obeys $-kA\,u'' = Q\,\delta(x - s)$ with $u = 0$ at both ends. How much warmer than the tank is the heater, in kelvin?`,
          visual: { type: 'graph', params: { x: [-0.02, L + 0.02], y: [-0.5, 1], aspect: 'wide', xlabel: 'x (m)', ylabel: '', axesAt: 'edge', yticks: 0, curves: [{ fn: `0*x`, color: 'ink3', width: 6, domain: [0, L] }], points: [{ x: s, y: 0, color: 'warn', label: `heater, ${Q} W`, labelDy: -14 }, { x: 0, y: 0, color: 'accent', label: 'mount', labelDy: 14 }, { x: L, y: 0, color: 'accent', label: 'mount', labelDy: 14, labelAlign: 'right', labelDx: -6 }] }, caption: 'The strut (grey), its heater and the two mounts at tank temperature. Radiation and conduction into the sensor are neglected; the mounts are assumed perfectly cold.' },
          answer: dT, units: 'K', tol: { rel: 0.01 },
          errors: [{ value: (Q * s * (L - s)) / (K_SS * L), feedback: t`Divide by $kA$, the conductivity times the cross-sectional area $\pi d^2/4$.` }, { value: (Q * s * (L - s)) / kA, feedback: t`The tent on $[0, L]$ is $s(L - s)/L$ at its corner: divide by $L$.` }],
          hints: [t`Same tent as a cable: $u(x) = \dfrac{Q}{kA}\,G(x, s)$ with $G(s, s) = \dfrac{s(L - s)}{L}$.`, t`$A = \pi d^2/4$ with $d$ in metres.`, t`$\Delta T = \dfrac{Q\,s(L - s)}{kA\,L}$.`],
          teach: 'A point heat source in a rod with cold ends raises its temperature in the same tent shape as a point load on a cable.',
          explain: t`$A = ${tex(A)}\ \text{m}^2$, $kA = ${tex(kA)}$ W m/K, so $\Delta T = \dfrac{${Q}\times${s}\times${r3(L - s)}}{${tex(kA)}\times${L}} = ${r3(dT)}$ K. The heat splits between the mounts in the ratio $(L - s) : s$ — the nearer mount takes more. Radiation would lower the peak; a thermal model that ignored it would err on the warm side.`,
        };
      },
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: t`Which statement about the Green’s function $G(x, s)$ of a linear boundary-value problem is right?`,
      visual: sag([{ fn: `-(${tent(0.6)})`, color: 'accent', width: 2.6 }], 1, -0.29, { xlabel: 'x', ylabel: 'sag', points: [{ x: 0.6, y: -0.24, color: 'warn', label: 'unit source at s', labelDy: 14 }] }),
      choices: ['It is the response at x to a unit point source at s; the solution for a source f is ∫G(x, s)f(s)ds', 'It is the solution of the problem', 'It depends on the source f, so it must be recomputed for each new load', 'It is the solution with f = 1'],
      answer: 0,
      why: {
        1: t`$G$ is the solution for one particular source, a unit spike at $s$. The solution for a general $f$ is built from it.`,
        2: t`$G$ depends only on the operator and the end conditions; that is the whole point — one $G$ serves every $f$.`,
        3: t`$f = 1$ gives $\int G\,ds = x(1 - x)/2$ — one solution among many, not $G$.`,
      },
      hints: ['What source does G answer to?'],
      teach: 'G is the response to a unit point source; any source is a superposition of point sources, so any solution is ∫G f.',
      explain: t`$G$ belongs to the operator and its boundary conditions, not to any particular load. Superposition makes it a machine: put in $f$, integrate, read off $u$.`,
    }),
    num({
      id: 'cp-half-load', difficulty: 3,
      gen(r) {
        const L = r.pick([6, 8, 12]), T = r.pick([1000, 1500, 2500]), q = r.pick([20, 30, 40]);
        const d = (q * L * L) / (16 * T);
        return {
          prompt: t`A cable of length $L = ${L}$ m at tension $T = ${T}$ N carries a uniform load $q = ${q}$ N/m on its **left half only**. Using $u(x) = \dfrac{1}{T}\int_0^{L/2} q\,G(x, s)\,ds$ with $G(x, s) = \min(x, s)\,(L - \max(x, s))/L$, find the sag at the middle, in centimetres.`,
          visual: { type: 'graph', params: { x: [-0.04 * L, 1.04 * L], y: [-0.6, 1], aspect: 'wide', xlabel: 'x (m)', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ fn: '0*x', color: 'ink2', width: 3, domain: [0, L] }], shade: [{ fn: '0.45', lower: '0.04', from: 0, to: L / 2, color: 'warn', alpha: 0.3 }], points: [{ x: L / 4, y: 0.7, label: `${q} N/m`, r: 0, color: 'warn', labelAlign: 'center', labelDx: 0, labelDy: 0 }, { x: 0, y: 0, color: 'accent', r: 5 }, { x: L, y: 0, color: 'accent', r: 5 }], vlines: [{ x: L / 2, label: 'middle', color: 'gold' }] }, caption: 'The cable before it sags, the loaded half (shaded) and the middle, where the sag is wanted. Small slopes assumed.' },
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: (q * L * L) / (8 * T) * 100, feedback: 'That is the sag with the whole cable loaded.' }, { value: (q * L * L) / (32 * T) * 100, feedback: 'Check the integral: at x = L/2 every loaded s is to the left, where G = s(L − L/2)/L = s/2.' }],
          hints: [t`At $x = L/2$, every loaded point has $s \le x$, so $G = s\,(L - L/2)/L = s/2$.`, t`$u(L/2) = \dfrac{q}{T}\int_0^{L/2}\dfrac{s}{2}\,ds = \dfrac{q}{T}\cdot\dfrac{(L/2)^2}{4}$.`, t`$= qL^2/(16T)$ — exactly half the fully loaded sag, as symmetry predicts.`],
          teach: 'With the Green’s function, a load on part of the span is just an integral over that part.',
          explain: t`$u(L/2) = \dfrac{qL^2}{16T} = \dfrac{${q}\times${L * L}}{16\times${T}} = ${tex(d)}$ m $= ${r3(d * 100)}$ cm. Check by symmetry: loading the right half instead gives the same middle sag, and the two together are the full load, $qL^2/8T$ — so each half gives half.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, { label: 'G. B. Arfken, H. J. Weber & F. E. Harris, Mathematical Methods for Physicists, 7th ed. (Academic Press, 2013), ch. 10 (Green’s functions)', url: 'https://openlibrary.org/isbn/9780123846549' }, SRC.incropera],
});
