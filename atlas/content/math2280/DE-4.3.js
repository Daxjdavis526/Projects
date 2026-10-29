// Complex and repeated eigenvalues of x′ = Ax: real solutions from the real
// and imaginary parts of v e^{λt}; spirals and centres (α sets growth, β the
// turning rate, the sign of the lower-left entry the sense of rotation); a
// repeated eigenvalue — a star when A = λI, otherwise a degenerate node with
// a generalized eigenvector and the solution (tv + w)e^{λt}; and the link to
// the damping regimes of a second-order oscillator.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, V, n, r6, sg, lead, portrait } from './_systems.js';
import { expm2 } from '../../src/viz/model/de-plane.js';

const t = String.raw;

// spirals A = [[α + p, q], [r, α − p]] with eigenvalues α ± iβ (r = −(β² + p²)/q)
const SPIRALS = [[-0.5, 2, 0, 2], [-1, 2, 1, -5], [-1, 1, 1, -2], [0.5, 3, 0, -1], [-0.5, 1, 0.5, 1], [-0.2, 1, 0, 1]];
const spiral = ([al, be, p, q]) => ({ al, be, A: [[al + p, q], [r6(-(be * be + p * p) / q), al - p]] });

// the characteristic polynomial with complex roots: it never reaches the axis
function charPolyC(tr, det, caption) {
  const m = tr / 2, top = det - m * m;
  return {
    type: 'graph',
    params: {
      x: [r6(m - 3), r6(m + 3)], y: [-1, r6(Math.max(4, top + 6))], aspect: 'wide', xlabel: 'λ', ylabel: 'p(λ)',
      curves: [{ fn: `x^2 - (${tr})*x + (${det})`, color: 'accent', width: 2.4 }],
    },
    caption: caption || 'The characteristic polynomial p(λ) = λ² − τλ + Δ. It never crosses the axis: no real eigenvalues.',
  };
}

// the defective matrices λI + N with N = [[p, q], [r, −p]], p² + qr = 0 (so N² = 0)
// a + bt in TeX, and the exponent λt
const ex = (l) => (l === 1 ? 't' : l === -1 ? '-t' : `${n(l)}t`);
const lin = (a, b) => (a === 0 ? lead(b, 't') : `${n(a)}${sg(b, 't')}`);
const NILS = [[1, 1, -1], [2, -4, 1], [1, -1, 1], [-2, 1, -4], [3, -9, 1]];

export default lesson({
  id: 'math2280.DE-4.3',
  title: 'Complex and repeated eigenvalues',
  minutes: 15, difficulty: 3,
  intro: t`When $\tau^2 < 4\Delta$ the eigenvalues come as a complex pair $\lambda = \alpha \pm i\beta$, with complex eigenvectors $\mathbf v = \mathbf a \pm i\mathbf b$. By Euler’s formula $e^{(\alpha + i\beta)t} = e^{\alpha t}(\cos\beta t + i\sin\beta t)$, and the real and imaginary parts of $\mathbf v e^{\lambda t}$ are two real solutions, so

$$\mathbf x = e^{\alpha t}\Big[c_1\big(\mathbf a\cos\beta t - \mathbf b\sin\beta t\big) + c_2\big(\mathbf a\sin\beta t + \mathbf b\cos\beta t\big)\Big].$$

The brackets go round and round with period $2\pi/\beta$; the factor $e^{\alpha t}$ makes it a **spiral** — in if $\alpha < 0$, out if $\alpha > 0$ — or a **centre** if $\alpha = 0$. On the border $\tau^2 = 4\Delta$ the eigenvalue is repeated, and unless $A$ is a multiple of $I$ there is only one eigenvector: the missing solution is $(t\,\mathbf v + \mathbf w)\,e^{\lambda t}$, the matrix version of the $t\,e^{rt}$ you met for a repeated root.`,
  symbols: [
    { tex: '\\alpha', text: 'the real part of the eigenvalues, $\\tau/2$, in 1/time: the growth ($> 0$) or decay ($< 0$) rate of the spiral' },
    { tex: '\\beta', text: 'the imaginary part, $\\sqrt{\\Delta - \\tau^2/4}$, in rad per unit time: how fast trajectories turn; one turn takes $2\\pi/\\beta$' },
    { tex: '\\mathbf a,\\ \\mathbf b', text: 'the real and imaginary parts of an eigenvector $\\mathbf a + i\\mathbf b$ for $\\alpha + i\\beta$' },
    { tex: 'c_1,\\ c_2', text: 'real constants fixed by $\\mathbf x(0) = c_1\\mathbf a + c_2\\mathbf b$' },
    { tex: '\\mathbf w', text: 'for a repeated eigenvalue with one eigenvector $\\mathbf v$: a **generalized eigenvector**, any solution of $(A - \\lambda I)\\mathbf w = \\mathbf v$' },
  ],
  why: t`Every lightly damped vibration — a wing, a circuit, an attitude controller ringing after a manoeuvre — is a complex-eigenvalue spiral, and its two numbers $\alpha$ and $\beta$ are exactly what an engineer reads off a test: the decay rate and the ringing frequency.`,
  visual: {
    type: 'de-plane',
    title: 'From spiral to node',
    lead: t`The oscillator $x'' + 2\zeta\omega_0x' + \omega_0^2x = 0$ as the system $\mathbf x' = ${M([[0, 1], ['-\\omega_0^2', '-2\\zeta\\omega_0']])}\mathbf x$, with $\mathbf x = (x, v)$. Its eigenvalues are the characteristic roots of DE-3 (the roots you dragged in [Calculus III, C3-6](#/lesson/math2210.C3-6.1)). Slide the damping ratio $\zeta$ and watch the portrait and the readout together.`,
    tasks: [
      t`$\zeta = 0$: eigenvalues $\pm i\omega_0$, a **centre** — closed orbits, period $2\pi/\omega_0$.`,
      t`$\zeta = 0.2$: $\alpha = -0.2\,\omega_0 < 0$, a **stable spiral**, turning clockwise. Make $\zeta$ negative (energy fed in) and it spirals out.`,
      t`$\zeta = 1$ exactly: one repeated eigenvalue and a single gold eigenvector line — a **degenerate node**, the critically damped oscillator. Above 1 two lines appear: a node.`,
    ],
    params: {
      matrix: [[0, 1], ['-w^2', '-2*z*w']], x: [-3, 3], y: [-4, 4], aspect: 'square', xlabel: 'x', ylabel: 'v', eigen: true,
      sliders: [
        { key: 'z', label: 'Damping ratio $\\zeta$', min: -0.3, max: 2, step: 0.01, value: 0.2, explain: 'Below 1 the motion oscillates (complex eigenvalues), at 1 it is critically damped (repeated), above 1 overdamped (two real).' },
        { key: 'w', label: 'Natural frequency $\\omega_0$', min: 0.5, max: 2, step: 0.05, value: 1, unit: '\\mathrm{rad/s}', explain: 'Sets $|\\lambda| = \\omega_0$ while the eigenvalues are complex.' },
      ],
      start: [2, 0], series: true, tmax: 15, seriesNames: ['x(t)', 'v(t)'], play: true, T: 12, seeds: [[-2, 2], [0, -3.5]],
    },
    caption: 'Arrows show direction only. Trajectories traced numerically (RK4), arrowheads forward in time. Gold dashed lines: real eigenvector directions, when there are any.',
  },
  example: {
    prompt: t`Solve $\mathbf x' = ${M([[1, -5], [1, -3]])}\,\mathbf x$ with $\mathbf x(0) = ${V([1, 1])}$, and describe the motion.`,
    visual: { type: 'de-plane', params: { matrix: [[1, -5], [1, -3]], x: [-1.6, 1.6], y: [-1, 1.2], aspect: 'wide', start: [1, 1], series: true, tmax: 7, seriesNames: ['x₁(t)', 'x₂(t)'], readout: false, click: false, xlabel: 'x₁', ylabel: 'x₂', grid: 22 }, caption: 'The solution spirals counterclockwise into the origin, shrinking by e⁻¹ every time unit; one turn takes 2π.' },
    steps: [
      { label: 'Eigenvalues', text: t`$\tau = -2$, $\Delta = -3 + 5 = 2$, so $\lambda^2 + 2\lambda + 2 = 0$ and $\lambda = -1 \pm i$: $\alpha = -1$, $\beta = 1$.` },
      { label: 'Eigenvector', text: t`For $\lambda = -1 + i$: $A - \lambda I = ${M([['2 - i', '-5'], ['1', '-2 - i']])}$. The second row says $v_1 = (2 + i)v_2$, so $\mathbf v = ${V(['2 + i', '1'])} = \underbrace{${V([2, 1])}}_{\mathbf a} + i\underbrace{${V([1, 0])}}_{\mathbf b}$. (Check the first row: $(2 - i)(2 + i) - 5 = 0$ ✓.)` },
      { label: 'Two real solutions', text: t`$\mathbf v e^{\lambda t} = (\mathbf a + i\mathbf b)\,e^{-t}(\cos t + i\sin t)$ has real part $e^{-t}(\mathbf a\cos t - \mathbf b\sin t)$ and imaginary part $e^{-t}(\mathbf a\sin t + \mathbf b\cos t)$.` },
      { label: 'Fit the start', text: t`At $t = 0$: $c_1\mathbf a + c_2\mathbf b = (2c_1 + c_2,\ c_1) = (1, 1)$, so $c_1 = 1$, $c_2 = -1$.` },
      { label: 'Assemble', text: t`$\mathbf x = e^{-t}\left[${V(['2\\cos t - \\sin t', '\\cos t'])} - ${V(['2\\sin t + \\cos t', '\\sin t'])}\right] = e^{-t}${V(['\\cos t - 3\\sin t', '\\cos t - \\sin t'])}$.` },
      { label: 'Describe and check', text: t`A stable spiral: it shrinks by $e^{-1}$ per time unit and turns once every $2\pi$. The sense: at $(1, 0)$ the velocity is $A(1, 0) = (1, 1)$, up and to the right, so it turns **counterclockwise** — the lower-left entry $c = 1$ is positive. Check $t = 0$: $\mathbf x'(0) = (-1 - 3,\ -1 - 1) = (-4, -2)$ and $A(1, 1) = (1 - 5,\ 1 - 3) = (-4, -2)$ ✓.` },
    ],
    answer: t`$\mathbf x = e^{-t}(\cos t - 3\sin t,\ \cos t - \sin t)$: a counterclockwise spiral into the origin.`,
  },
  practice: [
    num({
      id: 'period', difficulty: 1,
      gen(r) {
        const S = spiral(r.pick(SPIRALS.filter((s) => s[0] !== 0)));
        const [[a, b], [c, d]] = S.A, tr = a + d, det = r6(a * d - b * c), T = (2 * Math.PI) / S.be;
        return {
          prompt: t`$\mathbf x' = ${M(S.A)}\,\mathbf x$, with time in seconds. How long does a trajectory take to make one full turn around the origin?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: (2 * Math.PI) / Math.abs(S.al), feedback: t`That uses the real part $\alpha$, which sets the growth or decay. The turning comes from the imaginary part $\beta$.` }, { value: 1 / S.be, feedback: t`$\beta$ is an angular frequency in rad/s: one turn is $2\pi$ radians, so it takes $2\pi/\beta$.` }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
          hints: [t`$\tau = ${n(tr)}$ and $\Delta = ${n(det)}$, so $\lambda = \tfrac{\tau}{2} \pm i\sqrt{\Delta - \tau^2/4}$.`, t`$\beta = \sqrt{${n(det)} - ${n((tr * tr) / 4)}} = ${n(S.be)}$; one turn takes $2\pi/\beta$.`],
          teach: 'For eigenvalues α ± iβ, trajectories turn at β radians per unit time, so one turn takes 2π/β whatever α is.',
          explain: t`$\lambda = ${n(S.al)} \pm ${n(S.be)}i$, so one turn takes $2\pi/${n(S.be)} = ${fmt(T, 3)}$ s; meanwhile the size changes by $e^{2\pi\alpha/\beta} = ${fmt(Math.exp((2 * Math.PI * S.al) / S.be), 3)}$ per turn.`,
          visual: portrait(S.A, { seeds: [[2.5, 0], [-2.5, 0]], T: 8, caption: 'Two trajectories of the system. Arrows show direction only.' }),
        };
      },
    }),
    mcq({
      id: 'stability', difficulty: 2,
      gen(r) {
        const al = r.pick([-0.5, 0, 0.5, -1, 1]), be = r.pick([1, 2]), [p, q] = r.pick([[0, 1], [1, -2], [0, -2], [1, 1]]);
        const S = spiral([al, be, p, q]);
        const [[a, b], [c, d]] = S.A, tr = r6(a + d), det = r6(a * d - b * c);
        const kind = al < 0 ? 0 : al > 0 ? 1 : 2;
        const all = { 0: 'A stable spiral: it turns while it decays', 1: 'An unstable spiral: it turns while it grows', 2: 'A centre: closed orbits', 3: 'A stable node: it decays without turning' };
        const whyAll = {
          0: t`A stable spiral needs $\alpha = \tau/2 < 0$, so that $e^{\alpha t}$ shrinks.`,
          1: t`An unstable spiral needs $\alpha = \tau/2 > 0$.`,
          2: t`A centre needs $\alpha = \tau/2 = 0$ exactly, so the size neither grows nor shrinks.`,
          3: t`Here $\tau^2 - 4\Delta < 0$: the eigenvalues are complex, so trajectories turn. A node needs real eigenvalues.`,
        };
        const why = {}; for (const k of [0, 1, 2, 3]) if (k !== kind) why[k] = whyAll[k];
        return {
          prompt: t`Classify the origin of $\mathbf x' = ${M(S.A)}\,\mathbf x$.`,
          choices: [all[0], all[1], all[2], all[3]], answer: kind, why,
          hints: [t`$\tau = ${n(tr)}$ and $\Delta = ${n(det)}$. Is $\tau^2 - 4\Delta$ negative?`, t`The eigenvalues are $\tfrac{\tau}{2} \pm i\beta$: the sign of $\tau/2 = ${n(tr / 2)}$ decides.`],
          teach: 'With complex eigenvalues α ± iβ, the sign of α = τ/2 decides: negative spirals in, positive spirals out, zero is a centre.',
          explain: t`$\tau^2 - 4\Delta = ${n(tr * tr - 4 * det)} < 0$, so $\lambda = ${n(al)} \pm ${n(be)}i$: ${kind === 0 ? 'the factor $e^{' + n(al) + 't}$ shrinks — a stable spiral' : kind === 1 ? 'the factor $e^{' + n(al) + 't}$ grows — an unstable spiral' : 'no growth or decay — a centre'}.`,
          visual: charPolyC(tr, det),
        };
      },
    }),
    mcq({
      id: 'rotation', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[1, -2, 1], [0, 1, -4], [1, 2, -1], [-1, -5, 1], [2, -5, 1], [0, -1, 2]]);
        // the conserved quadratic H = (c/2)x² − axy − (b/2)y²; levels chosen so the largest ellipse reaches about 2.6
        let hmin = Infinity;
        for (let k = 0; k < 360; k++) { const th = (k * Math.PI) / 180, x = Math.cos(th), y = Math.sin(th); hmin = Math.min(hmin, Math.abs((c / 2) * x * x - a * x * y - (b / 2) * y * y)); }
        const h = Math.sign(c) * 2.6 * 2.6 * hmin;
        const ccw = c > 0;
        return {
          prompt: t`The system $\mathbf x' = ${M([[a, b], [c, -a]])}\,\mathbf x$ has a centre: its trajectories are the ellipses shown. Which way does the state go round them?`,
          choices: ['Counterclockwise', 'Clockwise', 'It depends on the starting point', 'It does not go round: it moves back and forth along one ellipse'],
          answer: ccw ? 0 : 1,
          why: ccw
            ? { 1: t`Test the point $(1, 0)$: the velocity there is $A(1, 0) = (${a}, ${c})$, with a positive upward part — counterclockwise.`, 2: 'All trajectories of one linear system turn the same way: the arrows are set by A.', 3: 'The velocity is never zero away from the origin, so the state never stops to turn back.' }
            : { 0: t`Test the point $(1, 0)$: the velocity there is $A(1, 0) = (${a}, ${c})$, with a negative upward part — the state heads down, which is clockwise.`, 2: 'All trajectories of one linear system turn the same way: the arrows are set by A.', 3: 'The velocity is never zero away from the origin, so the state never stops to turn back.' },
          hints: ['Pick the point (1, 0) on the positive x₁ axis and find the velocity there.', t`$A(1, 0)$ is the first column of $A$, $(${a}, ${c})$. Does it point up or down?`],
          teach: 'For a spiral or centre, the lower-left entry c of A decides the sense: at (1, 0) the state moves with vertical speed c, so c > 0 turns counterclockwise.',
          explain: t`At $(1, 0)$ the velocity is $(${a}, ${c})$: it heads ${ccw ? 'up' : 'down'}, so the state turns ${ccw ? 'counterclockwise' : 'clockwise'}. The ellipses are the level curves of $H = ${lead(c / 2, 'x_1^2')}${sg(-a, 'x_1x_2')}${sg(-b / 2, 'x_2^2')}$, which stays constant along every solution.`,
          visual: { type: 'de-plane', params: { matrix: [[a, b], [c, -a]], x: [-3, 3], y: [-3, 3], aspect: 'wide', field: false, seeds: [], readout: false, click: false, xlabel: 'x₁', ylabel: 'x₂', levels: { fn: `(${c}/2)*x^2 - (${a})*x*y - (${b}/2)*y^2`, values: [h, h / 4, h / 16].map(r6) } }, caption: 'Trajectories of the centre, drawn without direction.' },
        };
      },
    }),
    num({
      id: 'component', difficulty: 3,
      gen(r) {
        const S = spiral(r.pick(SPIRALS)), [[a, b], [c, d]] = S.A, x0 = r.pick([[1, 0], [0, 1], [1, 1], [2, -1]]);
        const X = expm2(a, b, c, d, 1), ans = X[0][0] * x0[0] + X[0][1] * x0[1];
        const av = [r6(S.al - d), c], bv = [S.be, 0];
        const c1 = r6(x0[1] / c), c2 = r6((x0[0] - c1 * (S.al - d)) / S.be);
        return {
          prompt: t`Solve $\mathbf x' = ${M(S.A)}\,\mathbf x$ with $\mathbf x(0) = ${V(x0)}$ and give $x_1(1)$ to 3 significant figures.`,
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          hints: [t`The eigenvalues are $${n(S.al)} \pm ${n(S.be)}i$. For $\lambda = ${n(S.al)} + ${n(S.be)}i$ the second row of $A - \lambda I$ gives the eigenvector $\mathbf v = (\lambda - ${n(d)},\ ${n(c)})$.`, t`So $\mathbf a = ${V(av)}$, $\mathbf b = ${V(bv)}$. Solve $c_1\mathbf a + c_2\mathbf b = ${V(x0)}$, then use $x_1 = e^{\alpha t}\left[c_1(a_1\cos\beta t - b_1\sin\beta t) + c_2(a_1\sin\beta t + b_1\cos\beta t)\right]$.`],
          teach: t`For complex eigenvalues, take the real and imaginary parts of $\mathbf v e^{\lambda t}$ as the two real solutions, then fit $c_1$, $c_2$ to the start.`,
          explain: t`$c_1 = ${n(c1)}$, $c_2 = ${n(c2)}$, and $x_1(1) = e^{${n(S.al)}}\left[${n(c1)}(${n(av[0])}\cos ${n(S.be)} - ${n(S.be)}\sin ${n(S.be)}) + (${n(c2)})(${n(av[0])}\sin ${n(S.be)} + ${n(S.be)}\cos ${n(S.be)})\right] = ${fmt(ans, 3)}$.`,
          visual: portrait(S.A, { x: [-3, 3], y: [-3, 3], seeds: [{ x: x0[0], y: x0[1], dir: 'forward', color: 'accent2', T: 1 }], points: [{ x: x0[0], y: x0[1], label: 'x(0)', color: 'gold' }], caption: 'The solution from x(0) traced to t = 1: you want the horizontal coordinate of its end.' }),
        };
      },
    }),
    mcq({
      id: 'repeated-form', difficulty: 3,
      prompt: t`$A = ${M([[3, 1], [0, 3]])}$ has the eigenvalue 3 twice but only one eigenvector, $\mathbf v = (1, 0)$. Which is the general solution of $\mathbf x' = A\mathbf x$?`,
      choices: [
        t`$c_1${V([1, 0])}e^{3t} + c_2\left(t${V([1, 0])} + ${V([0, 1])}\right)e^{3t}$`,
        t`$c_1${V([1, 0])}e^{3t} + c_2\,t${V([1, 0])}e^{3t}$`,
        t`$c_1${V([1, 0])}e^{3t} + c_2${V([0, 1])}e^{3t}$`,
        t`$(c_1 + c_2t)${V([1, 0])}e^{3t}$`,
      ],
      answer: 0,
      why: {
        1: t`$t(1, 0)e^{3t}$ is not a solution: its first component $te^{3t}$ has derivative $e^{3t} + 3te^{3t}$, but the first row asks for $3x_1 + x_2 = 3te^{3t}$. The $t\mathbf v$ needs a partner $\mathbf w$.`,
        2: t`$(0, 1)e^{3t}$ is not a solution, because $(0, 1)$ is not an eigenvector: $A(0, 1) = (1, 3) \neq 3(0, 1)$.`,
        3: t`Every vector here lies along $(1, 0)$, so no choice of constants meets a start such as $(0, 1)$. Two solutions on one line are not enough.`,
      },
      hints: [t`Find $\mathbf w$ with $(A - 3I)\mathbf w = \mathbf v$: $${M([[0, 1], [0, 0]])}\mathbf w = ${V([1, 0])}$.`, t`$\mathbf w = (0, 1)$ works. The second solution is $(t\mathbf v + \mathbf w)e^{3t}$; check it in the first row.`],
      teach: t`For a defective repeated eigenvalue the second solution is $(t\mathbf v + \mathbf w)e^{\lambda t}$, where the generalized eigenvector $\mathbf w$ solves $(A - \lambda I)\mathbf w = \mathbf v$.`,
      explain: t`With $\mathbf w = (0, 1)$: $\mathbf x = (t, 1)e^{3t}$ gives $x_1' = (1 + 3t)e^{3t} = 3x_1 + x_2$ ✓ and $x_2' = 3e^{3t} = 3x_2$ ✓. The two solutions are independent (at $t = 0$ they are $(1, 0)$ and $(0, 1)$), so together they reach every start.`,
      visual: portrait([[3, 1], [0, 3]], { x: [-3, 3], y: [-3, 3], eigen: true, seeds: [[0.3, 0.3], [-0.3, -0.3], [-0.6, 0.15], [0.6, -0.15], [0.05, 0.4], [-0.05, -0.4]], T: 3, caption: 'A degenerate node: one eigenvector line (gold), and every other trajectory leaves the origin tangent to it, turning to run parallel to it.' }),
    }),
    num({
      id: 'defective-ivp', difficulty: 3,
      gen(r) {
        const lam = r.pick([-1, -2, 1]), [p, q, rr] = r.pick(NILS), x0 = r.pick([[1, 2], [2, -1], [1, 1], [0, 1]]);
        const A = [[lam + p, q], [rr, lam - p]], Nx = [p * x0[0] + q * x0[1], rr * x0[0] - p * x0[1]];
        const T = 1, ans = Math.exp(lam * T) * (x0[0] + T * Nx[0]);
        const naive = Math.exp(lam * T) * x0[0];
        return {
          prompt: t`$A = ${M(A)}$ has the eigenvalue $${lam}$ twice, and $N = A - (${lam})I$ satisfies $N^2 = 0$. Solve $\mathbf x' = A\mathbf x$ with $\mathbf x(0) = ${V(x0)}$ and give $x_1(1)$.`,
          answer: ans, tol: { rel: 0.005, abs: 1e-3 },
          errors: Math.abs(Nx[0]) > 0.05 ? [{ value: naive, feedback: t`That is $e^{${ex(lam)}}\mathbf x(0)$, which would be right only if $\mathbf x(0)$ were an eigenvector. Here $N\mathbf x(0) \neq \mathbf 0$, so there is a $t\,e^{\lambda t}$ term.` }] : [],
          hints: [t`Try $\mathbf x = (\mathbf x_0 + t\,\mathbf u)e^{${ex(lam)}}$: substituting shows it works when $\mathbf u = N\mathbf x_0$ and $N\mathbf u = N^2\mathbf x_0 = \mathbf 0$. (Here $\mathbf u$ is an eigenvector and $\mathbf x_0$ a generalized eigenvector.)`, t`$N\mathbf x_0 = ${M([[p, q], [rr, -p]])}${V(x0)} = ${V(Nx)}$, so $x_1 = (${lin(x0[0], Nx[0])})\,e^{${ex(lam)}}$.`],
          teach: t`When $(A - \lambda I)^2 = 0$, every solution is $\big(\mathbf x_0 + t(A - \lambda I)\mathbf x_0\big)e^{\lambda t}$: the start is a generalized eigenvector, and $(A - \lambda I)\mathbf x_0$ an eigenvector.`,
          explain: t`$\mathbf x = \left(${V(x0)} + t${V(Nx)}\right)e^{${ex(lam)}}$, so $x_1(1) = (${n(x0[0] + Nx[0])})\,e^{${lam}} = ${fmt(ans, 4)}$. Check: $\mathbf x' = \left(N\mathbf x_0 + \lambda(\mathbf x_0 + tN\mathbf x_0)\right)e^{\lambda t}$ and $A\mathbf x = (\lambda I + N)(\mathbf x_0 + tN\mathbf x_0)e^{\lambda t}$ agree because $N^2 = 0$.`,
          visual: portrait(A, { x: [-3, 3], y: [-3, 3], eigen: true, seeds: [{ x: x0[0], y: x0[1], dir: 'forward', color: 'accent2', T: 1 }], points: [{ x: x0[0], y: x0[1], label: 'x(0)', color: 'gold' }], caption: 'The solution from x(0) traced to t = 1, and the single eigenvector line (gold).' }),
        };
      },
    }),
    mcq({
      id: 'critical', difficulty: 2,
      prompt: t`A critically damped oscillator, $x'' + 2\omega_0x' + \omega_0^2x = 0$, is written as $\mathbf x' = ${M([[0, 1], ['-\\omega_0^2', '-2\\omega_0']])}\mathbf x$. What kind of equilibrium is the origin?`,
      choices: ['A degenerate node: the eigenvalue −ω₀ is repeated with only one eigenvector', 'A star: every direction is an eigenvector', 'A stable spiral, because an oscillator oscillates', 'A centre, because there is no energy loss at critical damping'],
      answer: 0,
      why: {
        1: t`A star needs $A = \lambda I$. This matrix has a 1 in the corner, and $A + \omega_0I = ${M([['\\omega_0', '1'], ['-\\omega_0^2', '-\\omega_0']])}$ has rank 1: only one eigenvector, $(1, -\omega_0)$.`,
        2: 'At critical damping the roots are real, so there is no turning: the mass creeps back without overshooting more than once.',
        3: t`Critical damping still dissipates energy: the eigenvalue $-\omega_0$ is negative, so every solution decays.`,
      },
      hints: [t`$\tau = -2\omega_0$ and $\Delta = \omega_0^2$: compute $\tau^2 - 4\Delta$.`, t`The eigenvalue is $-\omega_0$, twice. Is $A$ a multiple of $I$?`],
      teach: t`The companion matrix of a critically damped oscillator is defective: one eigenvalue, one eigenvector, and a degenerate node — the source of the $t\,e^{-\omega_0t}$ solution.`,
      explain: t`$\tau^2 - 4\Delta = 4\omega_0^2 - 4\omega_0^2 = 0$: one eigenvalue, $-\omega_0$, with the single eigenvector $(1, -\omega_0)$. The generalized-eigenvector solution $(t\mathbf v + \mathbf w)e^{-\omega_0t}$ is where the $t\,e^{-\omega_0t}$ of DE-3 comes from.`,
      visual: { type: 'c3-roots', params: { mode: 'free', zeta: 1, w0: 2, sliders: false, panels: 'top', readout: false }, caption: 'The characteristic roots for ζ = 1: the two roots have met on the negative real axis.' },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-attitude', difficulty: 3, transfer: true,
      gen(r) {
        const kp = r.pick([4, 9, 16]), kd = r.pick([0.8, 1.2, 2]);
        const al = -kd / 2, be = Math.sqrt(kp - (kd * kd) / 4), T = (2 * Math.PI) / be;
        return {
          prompt: t`A reaction-wheel controller holds a space telescope’s pointing angle $\theta$ (in rad) with proportional and derivative feedback, so a small error obeys $\theta'' + ${kd}\,\theta' + ${kp}\,\theta = 0$ (time in s). After a disturbance the error rings down. What is the period of the ringing?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: [{ value: (2 * Math.PI) / Math.sqrt(kp), feedback: t`That is the undamped period $2\pi/\sqrt{${kp}}$. Damping slows the turning: $\beta = \sqrt{\Delta - \tau^2/4}$.` }],
          hints: [t`As a system, $(\theta, \theta')' = ${M([[0, 1], [-kp, -kd]])}(\theta, \theta')$: $\tau = -${kd}$, $\Delta = ${kp}$.`, t`$\lambda = -${n(kd / 2)} \pm i\sqrt{${kp} - ${n((kd * kd) / 4)}}$; the period is $2\pi/\beta$.`],
          teach: 'For a damped oscillator the eigenvalues α ± iβ give the decay rate α and the ringing frequency β: the period is 2π/β, a little longer than the undamped one.',
          explain: t`$\beta = \sqrt{${kp} - ${n((kd * kd) / 4)}} = ${fmt(be, 4)}$ rad/s, so the period is $${fmt(T, 3)}$ s, while the envelope $e^{${n(al)}t}$ falls by a factor $e$ every ${fmt(1 / -al, 3)} s. Real attitude loops are tuned exactly this way, from these two numbers. (A rigid body and a linear controller; flexible solar panels add modes of their own.)`,
          visual: { type: 'de-plane', params: { matrix: [[0, 1], [-kp, -kd]], x: [-0.12, 0.12], y: [r6(-0.12 * Math.sqrt(kp)), r6(0.12 * Math.sqrt(kp))], equal: false, aspect: 'wide', xlabel: 'θ (rad)', ylabel: 'θ′ (rad/s)', start: [0.1, 0], series: true, tmax: 10, seriesNames: ['θ(t)', 'θ′(t)'], readout: false, click: false }, caption: 'The pointing error after a 0.1 rad disturbance: a stable spiral in the phase plane, a decaying oscillation in time. Rigid body, linear control.' },
        };
      },
    }),
    mcq({
      id: 'cp-spiral', difficulty: 3,
      gen(r) {
        const [A, al] = r.pick([[[[-1, 2], [-2, -1]], -1], [[[1, -2], [3, -1.5]], -0.25], [[[0.5, -3], [3, 0.5]], 0.5], [[[1, 4], [-2, 0]], 0.5], [[[-0.5, 1], [-2, 0]], -0.25]]);
        const cc = A[1][0] > 0, inward = al < 0;
        const ans = (inward ? 0 : 2) + (cc ? 0 : 1);
        const choices = ['It spirals in, counterclockwise', 'It spirals in, clockwise', 'It spirals out, counterclockwise', 'It spirals out, clockwise'];
        const why = {};
        for (let k = 0; k < 4; k++) {
          if (k === ans) continue;
          const kin = k < 2, kcc = k % 2 === 0;
          why[k] = kin !== inward ? t`Check the size: $\alpha = \tau/2 = ${n(al)}$ is ${inward ? 'negative, so it shrinks' : 'positive, so it grows'}.` : t`Check the sense: at $(1, 0)$ the velocity is $(${n(A[0][0])}, ${n(A[1][0])})$, which points ${cc ? 'up — counterclockwise' : 'down — clockwise'}.`;
          if (kin !== inward && kcc !== cc) why[k] = t`Both are off: $\alpha = ${n(al)}$ ${inward ? '< 0 shrinks' : '> 0 grows'}, and at $(1, 0)$ the velocity points ${cc ? 'up' : 'down'}.`;
        }
        const S = Math.max(...A.flat().map(Math.abs));
        return {
          prompt: t`Describe the trajectories of $\mathbf x' = ${M(A)}\,\mathbf x$.`,
          choices, answer: ans, fixedOrder: true, why,
          hints: [t`First the eigenvalues: $\tau = ${n(A[0][0] + A[1][1])}$, $\Delta = ${n(A[0][0] * A[1][1] - A[0][1] * A[1][0])}$.`, 'Then the sense: find the velocity at (1, 0).'],
          teach: 'Two questions settle a spiral: the sign of α = τ/2 (in or out) and the sign of the lower-left entry c (counterclockwise if c > 0).',
          explain: t`$\alpha = \tau/2 = ${n(al)}$, so it spirals ${inward ? 'in' : 'out'}; at $(1, 0)$ the velocity is $(${n(A[0][0])}, ${n(A[1][0])})$, so it turns ${cc ? 'counterclockwise' : 'clockwise'}.`,
          visual: portrait(A, { x: [-3, 3], y: [-3, 3], field: false, heads: false, origin: false, seeds: [[0.4, 0], [2.6, 0]], T: 4 / S, caption: 'Two trajectories of the system, drawn without their direction.' }),
        };
      },
    }),
    num({
      id: 'cp-defective', difficulty: 3,
      gen(r) {
        const lam = r.pick([-1, -0.5, 0.5]), [p, q, rr] = r.pick(NILS), x0 = r.pick([[1, 0], [0, 2], [1, -1]]);
        const A = [[lam + p, q], [rr, lam - p]], Nx = [p * x0[0] + q * x0[1], rr * x0[0] - p * x0[1]];
        const T = 2, ans = Math.exp(lam * T) * (x0[1] + T * Nx[1]);
        return {
          prompt: t`$A = ${M(A)}$ has the repeated eigenvalue $${n(lam)}$ with $(A - (${n(lam)})I)^2 = 0$. For $\mathbf x(0) = ${V(x0)}$, find $x_2(2)$.`,
          answer: ans, tol: { rel: 0.005, abs: 1e-3 },
          hints: [t`$\mathbf x = \left(\mathbf x_0 + t\,(A - \lambda I)\mathbf x_0\right)e^{\lambda t}$.`, t`$(A - \lambda I)\mathbf x_0 = ${V(Nx)}$.`],
          teach: t`For a defective 2×2 matrix, $\mathbf x(t) = \big(\mathbf x_0 + t(A - \lambda I)\mathbf x_0\big)e^{\lambda t}$.`,
          explain: t`$x_2 = (${lin(x0[1], Nx[1])})\,e^{${n(lam)}t}$, so $x_2(2) = ${fmt(ans, 4)}$.`,
          visual: portrait(A, { x: [-3, 3], y: [-3, 3], eigen: true, seeds: [{ x: x0[0], y: x0[1], dir: 'forward', color: 'accent2', T: 2 }], points: [{ x: x0[0], y: x0[1], label: 'x(0)', color: 'gold' }], caption: 'The solution from x(0) to t = 2 and the single eigenvector line.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §3.4 and §3.7 (complex and repeated eigenvalues)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Complex eigenvalues', url: 'https://tutorial.math.lamar.edu/Classes/DE/ComplexEigenvalues.aspx' },
  ],
});
