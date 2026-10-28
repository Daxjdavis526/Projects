// The matrix exponential: e^{At} defined by its series, x(t) = e^{At}x₀,
// computed by diagonalization (P e^{Dt} P⁻¹) and, for A = λI + N with N² = 0,
// by the series that stops (e^{λt}(I + Nt)); rotations from A² = −I; the
// warnings (not entrywise; e^{A+B} = e^A e^B only when AB = BA); e^{At} =
// X(t)X(0)⁻¹; Liouville's det e^{At} = e^{τt}; and a check with SciPy's expm.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, V, n, r6, sg, lead } from './_systems.js';
import { expm2 } from '../../src/viz/model/de-plane.js';

const t = String.raw;

// e^{λt} written tidily: ex(-1) → '-t', ex(2) → '2t'
const ex = (l) => (l === 1 ? 't' : l === -1 ? '-t' : `${n(l)}t`);

// the four sides of the parallelogram spanned by u and v, as graph curves
const sides = (u, v, color, width = 2.2) => [[[0, 0], u], [u, [u[0] + v[0], u[1] + v[1]]], [[u[0] + v[0], u[1] + v[1]], v], [v, [0, 0]]]
  .map(([p, q]) => ({ param: [`${r6(p[0])} + t*${r6(q[0] - p[0])}`, `${r6(p[1])} + t*${r6(q[1] - p[1])}`], t: [0, 1], color, width }));

// entries of I + Nt: 1 + kt on the diagonal, kt off it
const one = (k) => (k === 0 ? '1' : `1${sg(k, 't')}`);
const tee = (k) => (k === 0 ? '0' : lead(k, 't'));

// a matrix and the unit square carried by its flow for a fixed time (a still picture)
const flowPic = (A, tf, caption, o = {}) => ({
  type: 'de-plane',
  params: { matrix: A, x: o.x || [-3, 3], y: o.y || [-3, 3], aspect: 'wide', flow: { t: tf, shape: o.shape || 'square', at: o.at || [0, 0], size: o.size ?? 1 }, readout: false, click: false, seeds: [], xlabel: 'x₁', ylabel: 'x₂', grid: 22 },
  caption,
});

export default lesson({
  id: 'math2280.DE-4.4',
  title: 'The matrix exponential',
  minutes: 14, difficulty: 3,
  intro: t`One equation $x' = ax$ is solved by $x = e^{at}x_0$. A system $\mathbf x' = A\mathbf x$ is solved the same way, once $e^{At}$ is defined by the same series:

$$\mathbf x(t) = e^{At}\,\mathbf x_0, \qquad e^{At} = I + At + \frac{(At)^2}{2!} + \frac{(At)^3}{3!} + \cdots$$

Differentiating term by term gives $\frac{d}{dt}e^{At} = A\,e^{At}$, and $e^{A\cdot0} = I$, so $e^{At}\mathbf x_0$ solves the system and starts at $\mathbf x_0$. Two ways to sum the series: if $A = PDP^{-1}$ with $D$ diagonal, every power is $A^k = PD^kP^{-1}$, so $e^{At} = P\,e^{Dt}\,P^{-1}$; and if $A = \lambda I + N$ with $N^2 = 0$, the series for $N$ stops after two terms, so $e^{At} = e^{\lambda t}(I + Nt)$.`,
  symbols: [
    { tex: 'e^{At}', text: 'a 2×2 matrix for each time $t$, the **state-transition matrix**: it carries any starting state to the state $t$ later. Its columns are the solutions that start at $(1, 0)$ and $(0, 1)$' },
    { tex: 'A', text: 'the constant coefficient matrix of $\\mathbf x\' = A\\mathbf x$, in 1/time' },
    { tex: '\\mathbf x_0', text: 'the state at $t = 0$' },
    { tex: 'I', text: 'the identity matrix — $e^{At}$ at $t = 0$' },
    { tex: 'P,\\ D', text: 'eigenvectors as the columns of $P$ and the eigenvalues on the diagonal of $D$, so $A = PDP^{-1}$; $e^{Dt}$ is diagonal with entries $e^{\\lambda_k t}$' },
    { tex: 'N', text: 'a **nilpotent** matrix, $N^2 = 0$: the part of a defective $A$ beyond $\\lambda I$' },
  ],
  why: t`Spacecraft navigation propagates a state and its uncertainty with exactly this matrix (the state-transition matrix of a Kalman filter), quantum mechanics evolves states with $e^{-iHt/\hbar}$, and the same series defines the rotations of three-dimensional space.`,
  visual: {
    type: 'de-plane',
    title: 'The flow carries the square',
    lead: t`Set $A$ with the four sliders and the time with $t$. The gold shape is the unit square after the flow has carried every point of it for time $t$ — the image of the square under $e^{At}$. Its edges from the origin are the columns of $e^{At}$, read out below with its determinant.`,
    tasks: [
      t`The start is $A = ${M([[0, -1], [1, 0]])}$: slide $t$ and the square turns rigidly — $e^{At}$ is a rotation through angle $t$. At $t = 1.57 \approx \pi/2$ it has made a quarter turn.`,
      t`Set $a = b = c = d = 0$, then $b = 1$: now $A^2 = 0$ and $e^{At} = I + At$ exactly — the square shears, and the top edge slides at a steady rate.`,
      t`Make $a + d$ negative: the area $\det e^{At} = e^{(a + d)t}$ shrinks, whatever the other entries. Negative $t$ runs the flow backward: $e^{-At}$ is the inverse of $e^{At}$.`,
    ],
    params: {
      matrix: [['a', 'b'], ['c', 'd']], x: [-3, 3], y: [-3, 3], aspect: 'square', xlabel: 'x₁', ylabel: 'x₂', flow: { t: 'tf', shape: 'square' },
      sliders: [
        { key: 'tf', label: 'Time $t$', min: -1.5, max: 3, step: 0.01, value: 0.8, explain: 'How long the flow runs. $t = 0$ leaves the square where it was ($e^{0} = I$).' },
        { key: 'a', label: '$a$', min: -2, max: 2, step: 0.25, value: 0, explain: 'Top left entry of $A$.' },
        { key: 'b', label: '$b$', min: -2, max: 2, step: 0.25, value: -1, explain: 'Top right entry.' },
        { key: 'c', label: '$c$', min: -2, max: 2, step: 0.25, value: 1, explain: 'Bottom left entry.' },
        { key: 'd', label: '$d$', min: -2, max: 2, step: 0.25, value: 0, explain: 'Bottom right entry.' },
      ],
      seeds: [], click: false,
    },
    caption: t`Dashed grey: the unit square at $t = 0$. Gold: where the flow has carried it. Blue and violet arrows: the columns of $e^{At}$, the images of $(1, 0)$ and $(0, 1)$. Arrows of the field show direction only.`,
  },
  example: {
    prompt: t`Find $e^{At}$ for $A = ${M([[1, 2], [2, 1]])}$ by diagonalization, check it, and use it to solve $\mathbf x' = A\mathbf x$ from $\mathbf x_0 = (1, 0)$.`,
    visual: { type: 'de-plane', params: { matrix: [[1, 2], [2, 1]], x: [-3, 3], y: [-2, 3], aspect: 'wide', flow: { t: 'tf', shape: 'square' }, sliders: [{ key: 'tf', label: 'Time $t$', min: 0, max: 0.6, step: 0.01, value: 0.3, explain: 'How long the flow runs.' }], eigen: true, readout: true, click: false, grid: 22, xlabel: 'x₁', ylabel: 'x₂' }, caption: t`The unit square under $e^{At}$: it stretches along $(1, 1)$, where $\lambda = 3$, and shrinks along $(1, -1)$, where $\lambda = -1$. The readout prints $e^{At}$ — check it against the formula.` },
    steps: [
      { label: 'Eigenpairs', text: t`$\tau = 2$, $\Delta = 1 - 4 = -3$: $\lambda^2 - 2\lambda - 3 = (\lambda - 3)(\lambda + 1) = 0$. For $\lambda = 3$, $\mathbf v = (1, 1)$; for $\lambda = -1$, $\mathbf v = (1, -1)$.` },
      { label: 'Diagonalize', text: t`$P = ${M([[1, 1], [1, -1]])}$, $D = ${M([[3, 0], [0, -1]])}$, and $P^{-1} = \tfrac12${M([[1, 1], [1, -1]])}$. Why it works: $A^k = PDP^{-1}PDP^{-1}\cdots = PD^kP^{-1}$, so every term of the series is sandwiched the same way.` },
      { label: 'Exponentiate D', text: t`$e^{Dt} = ${M(['e^{3t}', '0'].map((v, i) => (i ? ['0', 'e^{-t}'] : [v, '0'])))}$ — a diagonal matrix exponentiates entry by entry (and *only* a diagonal one does).` },
      { label: 'Multiply out', text: t`$e^{At} = Pe^{Dt}P^{-1} = \dfrac12${M([['e^{3t} + e^{-t}', 'e^{3t} - e^{-t}'], ['e^{3t} - e^{-t}', 'e^{3t} + e^{-t}']])}$.` },
      { label: 'Check', text: t`At $t = 0$ it is $\tfrac12${M([[2, 0], [0, 2]])} = I$ ✓. Its derivative at $t = 0$ is $\tfrac12${M([['3 - 1', '3 + 1'], ['3 + 1', '3 - 1']])} = A$ ✓. And $\det e^{At} = e^{3t}e^{-t} = e^{2t} = e^{\tau t}$ ✓.` },
      { label: 'Solve', text: t`$\mathbf x = e^{At}(1, 0)$ is the first column: $\mathbf x = \tfrac12\left(e^{3t} + e^{-t},\ e^{3t} - e^{-t}\right)$. At $t = 0.5$: $\mathbf x = (${fmt(0.5 * (Math.exp(1.5) + Math.exp(-0.5)), 4)}, ${fmt(0.5 * (Math.exp(1.5) - Math.exp(-0.5)), 4)})$.` },
    ],
    answer: t`$e^{At} = \dfrac12${M([['e^{3t} + e^{-t}', 'e^{3t} - e^{-t}'], ['e^{3t} - e^{-t}', 'e^{3t} + e^{-t}']])}$, and from $(1, 0)$ the solution is its first column.`,
  },
  practice: [
    mcq({
      id: 'entrywise', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]);
        return {
          prompt: t`For $A = ${M([[0, k], [0, 0]])}$, what is $e^{At}$?`,
          choices: [t`$${M([[1, `${k}t`], [0, 1]])}$`, t`$${M([[1, `e^{${k}t}`], [1, 1]])}$`, t`$${M([[0, `${k}t`], [0, 0]])}$`, t`$${M([[1, `e^{${k}t}`], [0, 1]])}$`],
          answer: 0,
          why: {
            1: t`That exponentiates each entry ($e^0 = 1$ in three places). The matrix exponential is the series $I + At + \dots$, not the exponential of the entries.`,
            2: t`That is just $At$: the series starts with $I$, so $e^{A\cdot0} = I$.`,
            3: t`Exponentiating the one nonzero entry is still the entrywise mistake. Here $A^2 = 0$, so the series stops after $I + At$.`,
          },
          hints: [t`Compute $A^2$.`, t`$A^2 = 0$, so $e^{At} = I + At + 0 + 0 + \cdots$.`],
          teach: t`$e^{At}$ is the power series in $A$, never the exponential of each entry; when $A^2 = 0$ it is exactly $I + At$.`,
          explain: t`$A^2 = ${M([[0, 0], [0, 0]])}$, so $e^{At} = I + At = ${M([[1, `${k}t`], [0, 1]])}$. Check: its derivative $${M([[0, k], [0, 0]])}$ equals $A\,e^{At} = ${M([[0, k], [0, 0]])}$ ✓. Physically: $x_2$ stays put and $x_1$ grows at the steady rate $${k}x_2$ — a shear.`,
          visual: { type: 'de-plane', params: { matrix: [[0, k], [0, 0]], x: [-3, 3], y: [-2, 2], aspect: 'wide', seeds: [], readout: false, click: false, xlabel: 'x₁', ylabel: 'x₂', grid: 22 }, caption: 'The field of x′ = Ax: horizontal arrows, pointing right above the axis and left below it. Every point of the x₁ axis is an equilibrium.' },
        };
      },
    }),
    num({
      id: 'nilpotent', difficulty: 2,
      gen(r) {
        const lam = r.pick([-1, 2, 0.5]), [p, q, rr] = r.pick([[1, 1, -1], [2, -4, 1], [1, -1, 1], [0, 3, 0]]), tt = r.pick([0.5, 1]);
        const A = [[lam + p, q], [rr, lam - p]], which = r.pick(['11', '12']);
        const E = Math.exp(lam * tt), ans = which === '11' ? E * (1 + p * tt) : E * q * tt;
        const naive = which === '11' ? Math.exp((lam + p) * tt) : Math.exp(q * tt);
        return {
          prompt: t`$A = ${M(A)} = ${n(lam)}I + N$ with $N = ${M([[p, q], [rr, -p]])}$, and $N^2 = 0$. Find the ${which === '11' ? 'top-left' : 'top-right'} entry of $e^{At}$ at $t = ${tt}$.`,
          answer: ans, tol: { rel: 0.005, abs: 1e-4 },
          errors: [{ value: naive, feedback: t`That exponentiates one entry of $A$. Use $e^{At} = e^{\lambda t}(I + Nt)$ — the identity and $N$ commute, so the exponential splits.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans) + 1e-6),
          hints: [t`$\lambda I$ and $N$ commute, so $e^{At} = e^{\lambda t}\,e^{Nt}$, and $e^{Nt} = I + Nt$ because $N^2 = 0$.`, t`$e^{At} = e^{${ex(lam)}}${M([[one(p), tee(q)], [tee(rr), one(-p)]])}$.`],
          teach: t`If $A = \lambda I + N$ with $N^2 = 0$, then $e^{At} = e^{\lambda t}(I + Nt)$: the series for $N$ stops after two terms.`,
          explain: t`$e^{At} = e^{${ex(lam)}}(I + Nt)$, so the entry is $${which === '11' ? `e^{${n(lam * tt)}}(1 ${sg(p * tt)})` : `e^{${n(lam * tt)}}\\cdot ${n(q * tt)}`} = ${fmt(ans, 4)}$.`,
          visual: flowPic(A, 0.25, 'The unit square carried by the flow for t = 0.25 (not the time asked about): it shears as it grows or shrinks.'),
        };
      },
    }),
    mcq({
      id: 'rotation', difficulty: 3,
      prompt: t`For $A = ${M([[0, -1], [1, 0]])}$, $A^2 = -I$, $A^3 = -A$, $A^4 = I$, … Summing the series $I + At + \tfrac{(At)^2}{2!} + \cdots$ gives $e^{At} =$`,
      choices: [t`$${M([['\\cos t', '-\\sin t'], ['\\sin t', '\\cos t']])}$`, t`$${M([['\\cos t', '\\sin t'], ['-\\sin t', '\\cos t']])}$`, t`$${M([['1', '-t'], ['t', '1']])}$`, t`$${M([['1', 'e^{-t}'], ['e^{t}', '1']])}$`],
      answer: 0,
      why: {
        1: t`That is the rotation the other way. Check the first column: it must be the solution from $(1, 0)$, whose velocity at $t = 0$ is $A(1, 0) = (0, 1)$ — upward, counterclockwise.`,
        2: t`That is only $I + At$. Here $A^2 \neq 0$, so the series does not stop: the even powers build $\cos t$ and the odd ones $\sin t$.`,
        3: t`Exponentiating entries is never how a matrix exponential works (unless the matrix is diagonal).`,
      },
      hints: [t`Collect the terms with $I$: $1 - \tfrac{t^2}{2!} + \tfrac{t^4}{4!} - \cdots$. Which function is that?`, t`The terms with $A$ are $t - \tfrac{t^3}{3!} + \cdots = \sin t$, so $e^{At} = (\cos t)I + (\sin t)A$.`],
      teach: t`When $A^2 = -I$ the exponential series splits into the cosine and sine series: $e^{At} = (\cos t)I + (\sin t)A$, a rotation.`,
      explain: t`$e^{At} = (\cos t)\,I + (\sin t)\,A = ${M([['\\cos t', '-\\sin t'], ['\\sin t', '\\cos t']])}$, the counterclockwise rotation through angle $t$. Euler’s formula $e^{it} = \cos t + i\sin t$ is the same calculation with $i$ in place of $A$.`,
      visual: { type: 'de-plane', params: { matrix: [[0, -1], [1, 0]], x: [-2.5, 2.5], y: [-2, 2], aspect: 'wide', seeds: [[1, 0], [2, 0]], readout: false, click: false, xlabel: 'x₁', ylabel: 'x₂' }, caption: 'The field of x′ = Ax and two of its circular trajectories.' },
    }),
    num({
      id: 'propagate', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[-3, 1], [-2, 1], [1, 2], [-1, 2], [-3, 2]]), [p, q] = r.pick([[1, 0], [2, 1], [1, -1], [0, 2]]), T = 1;
        const E1 = Math.exp((a + b) * T), E2 = Math.exp((a - b) * T);
        const ans = 0.5 * ((E1 - E2) * p + (E1 + E2) * q);
        const X = expm2(a, b, b, a, T), check = X[1][0] * p + X[1][1] * q;
        return {
          prompt: t`For $A = ${M([[a, b], [b, a]])}$ the eigenvalues are $${a + b}$ with $(1, 1)$ and $${a - b}$ with $(1, -1)$, so $e^{At} = \tfrac12${M([[`e^{${ex(a + b)}} + e^{${ex(a - b)}}`, `e^{${ex(a + b)}} - e^{${ex(a - b)}}`], [`e^{${ex(a + b)}} - e^{${ex(a - b)}}`, `e^{${ex(a + b)}} + e^{${ex(a - b)}}`]])}$. Starting from $\mathbf x_0 = ${V([p, q])}$, find $x_2(1)$.`,
          answer: check, tol: { rel: 0.005, abs: 1e-4 },
          errors: [{ value: 0.5 * ((E1 + E2) * p + (E1 - E2) * q), feedback: t`That is $x_1(1)$, from the first row of $e^{At}$. The question asks for $x_2$: use the second row.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans) + 1e-6),
          hints: [t`$\mathbf x(1) = e^{A}\mathbf x_0$: multiply the matrix at $t = 1$ by $(${p}, ${q})$.`, t`$x_2(1) = \tfrac12\left[(e^{${a + b}} - e^{${a - b}})(${p}) + (e^{${a + b}} + e^{${a - b}})(${q})\right]$.`],
          teach: t`Once $e^{At}$ is known, every initial-value problem is one matrix–vector product: $\mathbf x(t) = e^{At}\mathbf x_0$.`,
          explain: t`$x_2(1) = \tfrac12\left[${fmt(E1 - E2, 4)}\times${p} + ${fmt(E1 + E2, 4)}\times${q}\right] = ${fmt(ans, 4)}$.`,
          visual: flowPic([[a, b], [b, a]], 0.3, 'The unit square carried by the flow for t = 0.3: stretched or squeezed along the eigenvector directions (1, 1) and (1, −1).'),
        };
      },
    }),
    num({
      id: 'fundamental', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2]), b = r.pick([-1, -2, -3]), tt = r.pick([0.5, 1]);
        const ans = 0.5 * (Math.exp(a * tt) - Math.exp(b * tt));
        return {
          prompt: t`The two columns of $X(t) = ${M([[`e^{${ex(a)}}`, `e^{${ex(b)}}`], [`e^{${ex(a)}}`, `-e^{${ex(b)}}`]])}$ are solutions of a system $\mathbf x' = A\mathbf x$. Using $e^{At} = X(t)\,X(0)^{-1}$, find the top-right entry of $e^{At}$ at $t = ${tt}$.`,
          answer: ans, tol: { rel: 0.005, abs: 1e-4 },
          errors: [{ value: Math.exp(b * tt), feedback: t`That is an entry of $X(t)$ itself. $X(t)$ solves the system but does not equal $I$ at $t = 0$; multiplying by $X(0)^{-1}$ fixes that.` }],
          hints: [t`$X(0) = ${M([[1, 1], [1, -1]])}$, so $X(0)^{-1} = \tfrac12${M([[1, 1], [1, -1]])}$.`, t`The top row of $X(t)$ times the second column of $X(0)^{-1}$: $\tfrac12\left(e^{${ex(a)}} - e^{${ex(b)}}\right)$.`],
          teach: 'Any fundamental matrix X(t) — columns that are independent solutions — gives the state-transition matrix as X(t)X(0)⁻¹, the one combination that equals I at t = 0.',
          explain: t`$e^{At} = X(t)X(0)^{-1}$ has top-right entry $\tfrac12(e^{${ex(a)}} - e^{${ex(b)}})$, which at $t = ${tt}$ is $${fmt(ans, 4)}$. (The system is $A = ${M([[(a + b) / 2, (a - b) / 2], [(a - b) / 2, (a + b) / 2]].map((row) => row.map(r6)))}$.)`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 1.5], y: [-1.2, r6(Math.exp(1.5 * a) + 0.5)], aspect: 'wide', xlabel: 't', ylabel: '',
              curves: [{ fn: `exp(${a}*x)`, color: 'accent', width: 2.2, label: 'first column', labelAt: 1.2, labelDx: -96, labelDy: -6 }, { fn: `exp(${b}*x)`, color: 'violet', width: 2.2, label: 'second column, top', labelAt: 0.6, labelDx: 6, labelDy: -12 }, { fn: `-exp(${b}*x)`, color: 'violet', width: 2.2, dash: true, label: 'second column, bottom', labelAt: 0.6, labelDx: 6, labelDy: 14 }],
              vlines: [{ x: tt, label: `t = ${tt}`, color: 'gold' }],
            },
            caption: 'The entries of X(t) against time (both entries of the first column are the same curve).',
          },
        };
      },
    }),
    mcq({
      id: 'commute', difficulty: 3, kind: 'error',
      prompt: t`A student needs $e^{A + B}$ for $A = ${M([[0, 1], [0, 0]])}$ and $B = ${M([[0, 0], [1, 0]])}$. Each is easy alone ($A^2 = B^2 = 0$), so they write $e^{A+B} = e^Ae^B = ${M([[1, 1], [0, 1]])}${M([[1, 0], [1, 1]])} = ${M([[2, 1], [1, 1]])}$. What is wrong?`,
      choices: [
        t`$AB \neq BA$, and $e^{A+B} = e^Ae^B$ holds only for matrices that commute`,
        t`Nothing: $e^{A+B} = e^Ae^B$ for all matrices, as for numbers`,
        t`Only the order: it should be $e^Be^A$`,
        t`$e^A$ is wrong: it should be $${M([[1, 'e'], [1, 1]])}$`,
      ],
      answer: 0,
      why: {
        1: t`For numbers the rule comes from rearranging the product of two series, which needs $ab = ba$. Here $AB = ${M([[1, 0], [0, 0]])}$ but $BA = ${M([[0, 0], [0, 1]])}$.`,
        2: t`$e^Be^A = ${M([[1, 1], [1, 2]])}$ — also wrong. Neither order gives $e^{A+B}$, because the matrices do not commute.`,
        3: t`That exponentiates entries. Since $A^2 = 0$, $e^A = I + A$ exactly.`,
      },
      hints: [t`Compute $AB$ and $BA$.`, t`$A + B = ${M([[0, 1], [1, 0]])}$ has eigenvalues $\pm1$ with eigenvectors $(1, \pm1)$; its exponential is $${M([['\\cosh 1', '\\sinh 1'], ['\\sinh 1', '\\cosh 1']])}$.`],
      teach: t`$e^{A+B} = e^Ae^B$ is guaranteed only when $AB = BA$; for matrices that do not commute, exponentiate the sum directly.`,
      explain: t`$e^{A+B} = ${M([['\\cosh 1', '\\sinh 1'], ['\\sinh 1', '\\cosh 1']])} \approx ${M([[1.543, 1.175], [1.175, 1.543]])}$, not $${M([[2, 1], [1, 1]])}$. The rule $e^{A+B} = e^Ae^B$ survives exactly when $A$ and $B$ commute — as $\lambda I$ and $N$ always do, which is why $e^{(\lambda I + N)t} = e^{\lambda t}e^{Nt}$ was safe.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.5, 3.6], y: [-0.4, 3], aspect: 'wide', equal: true, xlabel: 'x₁', ylabel: 'x₂',
          curves: [...sides([1, 0], [0, 1], 'ink3', 1.4), ...sides([2, 1], [1, 1], 'warn'), ...sides([1.5431, 1.1752], [1.1752, 1.5431], 'accent')],
          points: [{ x: 3, y: 2, r: 3, color: 'warn', label: 'square under eᴬeᴮ', labelDx: -40, labelDy: -12 }, { x: 2.7183, y: 2.7183, r: 3, color: 'accent', label: 'square under eᴬ⁺ᴮ', labelDx: 8, labelDy: -4 }],
        },
        caption: 'The unit square (grey) under the student’s matrix (orange) and under the true exponential (blue): both have area 1, but they are different shapes.',
      },
    }),
    code({
      id: 'expm-check', difficulty: 2,
      prompt: t`Check the worked example with SciPy. Compute $e^{At}$ for $A = ${M([[1, 2], [2, 1]])}$ at $t = 0.5$ twice — with \`scipy.linalg.expm\` and by diagonalization with \`np.linalg.eig\` — and use it to propagate $\mathbf x_0 = (1, 0)$.`,
      starter: t`import numpy as np
from scipy.linalg import expm

A = np.array([[1.0, 2.0], [2.0, 1.0]])
t = 0.5

# 1. e^{At} straight from SciPy
E1 = None    # replace

# 2. e^{At} = P e^{Dt} P^{-1}: lam holds the eigenvalues, the columns of P the eigenvectors
lam, P = np.linalg.eig(A)
E2 = None    # replace (np.diag and np.linalg.inv help)

# 3. the state at t from x0
x0 = np.array([1.0, 0.0])
x = None     # replace

print(E1)
print(E2)
print(x)
`,
      answer: t`import numpy as np
from scipy.linalg import expm

A = np.array([[1.0, 2.0], [2.0, 1.0]])
t = 0.5

# 1. e^{At} straight from SciPy
E1 = expm(A * t)

# 2. e^{At} = P e^{Dt} P^{-1}: lam holds the eigenvalues, the columns of P the eigenvectors
lam, P = np.linalg.eig(A)
E2 = P @ np.diag(np.exp(lam * t)) @ np.linalg.inv(P)

# 3. the state at t from x0
x0 = np.array([1.0, 0.0])
x = E1 @ x0

print(E1)
print(E2)
print(x)
`,
      tests: [
        { name: t`\`E1\` is SciPy’s $e^{At}$ at $t = 0.5$`, code: 'E1 is not None and np.allclose(E1, expm(A * 0.5))' },
        { name: t`\`E2\` (by diagonalization) agrees with \`E1\``, code: 'E2 is not None and np.allclose(E2, expm(A * 0.5))' },
        { name: t`\`x\` is $(\tfrac12(e^{1.5} + e^{-0.5}),\ \tfrac12(e^{1.5} - e^{-0.5})) \approx (2.544, 1.938)$`, code: 'x is not None and np.allclose(x, [0.5*(np.exp(1.5)+np.exp(-0.5)), 0.5*(np.exp(1.5)-np.exp(-0.5))])' },
      ],
      hints: [t`\`expm(A * t)\` — SciPy wants the matrix $At$, not $A$.`, t`\`np.exp(lam * t)\` exponentiates each eigenvalue; \`np.diag\` puts them on a diagonal; then \`P @ ... @ np.linalg.inv(P)\`. The state is \`E1 @ x0\`.`],
      teach: 'scipy.linalg.expm computes the matrix exponential directly (by scaling and squaring with a Padé approximant); diagonalization gives the same matrix when A has a basis of eigenvectors.',
      explain: t`Both give $${M([[2.544, 1.938], [1.938, 2.544]])}$ (to four figures), the formula $\tfrac12(e^{3t} \pm e^{-t})$ at $t = 0.5$. \`np.linalg.eig\` scales its eigenvectors to length 1 — any scaling works, because $P$ and $P^{-1}$ cancel it. Note that \`np.exp(A * t)\` would be the entrywise exponential: a different, wrong matrix.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coast', difficulty: 2, transfer: true,
      gen(r) {
        const x0 = r.pick([80, 100, 120]), v0 = r.pick([-0.2, -0.25, -0.3]), T = r.pick([120, 150, 200]);
        const ans = x0 + v0 * T;
        return {
          prompt: t`Two spacecraft fly in formation in deep space, where gravity pulls both alike, so their separation $s$ obeys $s'' = 0$. With the state $(s, s')$ the system matrix is $A = ${M([[0, 1], [0, 0]])}$. Use the state-transition matrix $e^{At}$ to find the separation after ${T} s if now $s = ${x0}$ m and $s' = ${v0}$ m/s.`,
          answer: ans, units: 'm', tol: { rel: 0.002, abs: 0.05 },
          errors: [{ value: x0 * Math.exp(v0 * T), feedback: t`That treats the motion as exponential, as if $e^{At}$ acted entry by entry. Here $A^2 = 0$, so $e^{At} = I + At$: the separation changes linearly.` }],
          hints: [t`$A^2 = 0$, so $e^{At} = I + At = ${M([[1, 't'], [0, 1]])}$.`, t`$s(t) = s_0 + t\,s'_0$.`],
          teach: 'For a free particle the state-transition matrix is I + At exactly: position advances by velocity × time, velocity stays put.',
          explain: t`$${V(['s', "s'"])}(${T}) = ${M([[1, T], [0, 1]])}${V([x0, v0])} = ${V([n(ans), v0])}$: the separation is ${n(ans)} m and still closing at ${n(-v0)} m/s. Near a planet, tidal terms (the Clohessy–Wiltshire equations) add entries to $A$, and $e^{At}$ is computed the same way.`,
          visual: { type: 'de-plane', params: { matrix: [[0, 1], [0, 0]], x: [0, 150], y: [-0.5, 0.5], equal: false, aspect: 'wide', xlabel: 's (m)', ylabel: 's′ (m/s)', seeds: [{ x: x0, y: v0, dir: 'forward', color: 'accent2', T: 2 * T }], points: [{ x: x0, y: v0, label: 'now', color: 'gold' }], readout: false, click: false, grid: 20 }, caption: 'The phase plane of free relative motion: every trajectory is a horizontal line, traversed at the constant speed s′.' },
        };
      },
    }),
    num({
      id: 'cp-area', difficulty: 3,
      gen(r) {
        const [a, b, c, d] = r.pick([[-1, 2, -3, -0.5], [0.5, 1, -2, 0.3], [-0.4, 3, 1, -0.6], [2, -1, 4, -3]]);
        const tau = a + d, T = r.pick([1, 2]), ans = Math.exp(tau * T);
        return {
          prompt: t`A small cloud of initial states of $\mathbf x' = ${M([[a, b], [c, d]])}\,\mathbf x$ covers an area of 1 (in the units of the phase plane). Every point moves with the flow. What area does the cloud cover after $t = ${T}$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.exp((a * d - b * c) * T), feedback: t`Area scales by $\det e^{At} = e^{\tau t}$ — the trace, not the determinant of $A$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`A linear map multiplies every area by its determinant, and $\det e^{At} = e^{\lambda_1t}e^{\lambda_2t}$.`, t`$e^{\lambda_1t}e^{\lambda_2t} = e^{(\lambda_1 + \lambda_2)t} = e^{\tau t}$, with $\tau = ${n(tau)}$.`],
          teach: t`The flow of $\mathbf x' = A\mathbf x$ scales every area by $\det e^{At} = e^{\tau t}$ (Liouville’s formula): zero trace preserves area.`,
          explain: t`$\det e^{At} = e^{\tau t} = e^{${n(tau)}\times${T}} = ${fmt(ans, 4)}$, whatever the cloud’s shape — and whatever $b$ and $c$ are. A conservative mechanical system has $\tau = 0$ (Liouville’s theorem), so its clouds of states change shape but never area.`,
          visual: { type: 'de-plane', params: { matrix: [[a, b], [c, d]], x: [-3, 3], y: [-3, 3], aspect: 'wide', flow: { t: 0.4, shape: 'disc', at: [0, 0], size: 1 }, seeds: [], readout: false, click: false, xlabel: 'x₁', ylabel: 'x₂', grid: 22 }, caption: 'A disc of states (dashed) and where the flow has carried it after t = 0.4 (gold) — not the time asked about.' },
        };
      },
    }),
    mcq({
      id: 'cp-which', difficulty: 2,
      prompt: t`Which of these matrices is $e^{At}$ for **some** constant matrix $A$?`,
      choices: [t`$${M([['e^{-t}', '0'], ['0', 'e^{2t}']])}$`, t`$${M([['1 + t', '0'], ['0', '1']])}$`, t`$${M([['e^{t}', '1'], ['0', 'e^{t}']])}$`, t`$${M([['\\cos t', '\\sin t'], ['\\sin t', '\\cos t']])}$`],
      answer: 0,
      why: {
        1: t`Its derivative at $t = 0$ would make $A = ${M([[1, 0], [0, 0]])}$, whose exponential is $${M([['e^t', '0'], ['0', '1']])}$, not this. (A matrix exponential also obeys $e^{A(s+t)} = e^{As}e^{At}$, and $1 + s + t \neq (1 + s)(1 + t)$.)`,
        2: t`At $t = 0$ it must equal $I$, but this is $${M([[1, 1], [0, 1]])}$.`,
        3: t`Its derivative at 0 would give $A = ${M([[0, 1], [1, 0]])}$, whose exponential is the cosh–sinh matrix, not this one. (Here the determinant $\cos^2 t - \sin^2 t$ even reaches 0, which $e^{\tau t}$ never does.)`,
      },
      hints: [t`Two tests: $e^{A\cdot0} = I$, and $\det e^{At} = e^{\tau t}$ is never zero.`, 'A diagonal matrix of exponentials is the exponential of a diagonal matrix.'],
      teach: t`A matrix function is a matrix exponential $e^{At}$ only if it is $I$ at $t = 0$, its determinant is never zero, and $e^{A(s + t)} = e^{As}e^{At}$.`,
      explain: t`$${M([['e^{-t}', '0'], ['0', 'e^{2t}']])} = e^{At}$ for $A = ${M([[-1, 0], [0, 2]])}$. The others fail a test: the second is not multiplicative, the third is not $I$ at $t = 0$, and the fourth reaches determinant 0 at $t = \pi/4$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 1.6], y: [-0.2, 1.3], aspect: 'wide', xlabel: 't', ylabel: 'det',
          curves: [{ fn: 'exp(x)', color: 'accent', width: 2.2, label: 'eᵗ', labelAt: 0.2, labelDx: 6, labelDy: -12 }, { fn: 'cos(x)^2 - sin(x)^2', color: 'violet', width: 2.2, label: 'cos²t − sin²t', labelAt: 1.1, labelDx: 6, labelDy: -10 }],
          hlines: [{ y: 0, color: 'ink3' }],
        },
        caption: 'Determinants of two of the candidates against time: a true matrix exponential has determinant e^(τt), which never touches zero.',
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §3.8 Matrix exponentials', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'SciPy reference: scipy.linalg.expm', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.linalg.expm.html' },
  ],
});
