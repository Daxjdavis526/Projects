// Weak versus strong hyperbolicity: for a first-order system u_t = A u_x the
// Fourier modes evolve by e^(ikAt). Real eigenvalues alone (weak hyperbolicity)
// are not enough: a Jordan block gives e^(ikλt)(I + iktN), growth ∝ |k|t — the
// solution loses a derivative of its data, and a small lower-order term turns
// the growth exponential, e^(√(εk/2)t). A full set of eigenvectors (strong
// hyperbolicity) bounds ‖e^(ikAt)‖ by the eigenvector matrix's condition
// number for every k: well-posed. Symmetric ⊂ strong ⊂ weak. The seed for
// B15: ADM, as usually written, is only weakly hyperbolic.
import { lesson, mcq, multi, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const jnorm = (k, tt) => (Math.abs(k) * tt + Math.sqrt(k * k * tt * tt + 4)) / 2;
const W = 'step(0.5 - abs(sys))', S = 'step(0.5 - abs(sys - 1))', Y = 'step(0.5 - abs(sys - 2))';
// u and v for data u = 0, v = ε cos kx (ε = 0.05) in the three systems
const U = { w: '-0.05*k1*tt*sin(k1*(x + tt))', s: '-0.05*sin(k1*x)*sin(k1*tt)', y: '-0.05*sin(k1*x)*sin(k1*tt)' };
const V = { w: '0.05*cos(k1*(x + tt))', s: '0.05*cos(k1*(x - tt))', y: '0.05*cos(k1*x)*cos(k1*tt)' };
const growthPlot = (caption, extra = {}) => ({ type: 'graph', params: { x: [0, 3], y: [-0.3, 3.3], xlog: true, ylog: true, aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'growth factor at t = 1', axesAt: 'edge', curves: [{ fn: '(10^x + sqrt(10^(2*x) + 4))/2', color: 'warn', width: 2.4, label: 'Jordan block (weak)', labelAt: 1.6, labelDy: -14 }].map((c) => ({ ...c, fn: `log10(${c.fn})` })).concat([{ fn: `log10(${(1 + Math.sqrt(5)) / 2})`, color: 'accent', width: 2.4, label: 'diagonalizable (strong): never above 1.62', labelAt: 1.2, labelDy: 14 }]), ...extra }, caption });

export default lesson({
  id: 'st-b.B12.2',
  title: 'Weak versus strong hyperbolicity',
  minutes: 15, difficulty: 4,
  intro: t`Write a hyperbolic problem as a first-order system, $\mathbf u_t = \mathsf A\,\mathbf u_x$ for a vector $\mathbf u$ of fields. A Fourier mode $\mathbf u = \hat{\mathbf u}(t)e^{ikx}$ evolves by the matrix exponential, $\hat{\mathbf u}(t) = e^{ik\mathsf At}\,\hat{\mathbf u}(0)$, and Hadamard’s condition asks that $\|e^{ik\mathsf At}\|$ stay bounded **uniformly in $k$**. Real eigenvalues of $\mathsf A$ (real characteristic speeds) make the system **weakly hyperbolic** — but that is not enough. If $\mathsf A$ is a Jordan block, $\mathsf A = \lambda\mathsf I + \mathsf N$ with $\mathsf N^2 = 0$, then

$$e^{ik\mathsf At} = e^{ik\lambda t}\,\big(\mathsf I + ikt\,\mathsf N\big),$$

which grows like $|k|\,t$: the finer the detail, the faster it grows. The system is **strongly hyperbolic** — and well-posed — only if $\mathsf A$ also has a **complete set of eigenvectors**; then $\|e^{ik\mathsf At}\|$ never exceeds the condition number of the eigenvector matrix, whatever $k$ and $t$.`,
  symbols: [
    { tex: t`\mathbf u`, text: 'the vector of fields, e.g. $(u, v)$ — in relativity, the metric components and their time derivatives' },
    { tex: t`\mathsf A`, text: 'the principal matrix: its eigenvalues are the characteristic speeds (m/s)' },
    { tex: 'k', text: 'the wavenumber of a Fourier mode (rad/m): large $k$ means fine detail' },
    { tex: t`e^{ik\mathsf At}`, text: 'the matrix that carries a mode’s amplitudes from time 0 to time $t$' },
    { tex: t`\mathsf N`, text: 'the nilpotent part of a Jordan block ($\\mathsf N \\ne 0$, $\\mathsf N^2 = 0$): what is left when an eigenvector is missing' },
    { tex: t`\lambda`, text: 'the repeated eigenvalue: the one characteristic speed of the block' },
  ],
  why: t`This is the reason numerical relativity was stuck for years. The ADM form of Einstein’s evolution equations, as usually written, is only **weakly** hyperbolic: its simulations ran, then blew up, faster on finer grids. The formulations that made binary black-hole mergers computable in 2005–06 — generalized harmonic and BSSN with moving punctures — are strongly hyperbolic for suitable gauges (module B15).`,
  visual: {
    type: 'graph',
    title: 'Same speeds, different fates',
    lead: t`Start each system with $u = 0$ and a small ripple $v = 0.05\cos kx$. All three have real characteristic speeds. Raise the wavenumber $k$ and the time $t$, and watch $u$ (blue) beside $v$ (gold, dashed).`,
    tasks: [
      t`Jordan block: $u$ grows as $0.05\,kt$ — double the wavenumber, double the growth. At $k = 20$, $t = 3$ the ripple has grown sixty-fold.`,
      t`Switch to the diagonalizable system (speeds $+1$ and $-1$): $u$ never exceeds $0.05$, whatever $k$ and $t$.`,
      t`The symmetric system — the wave equation in first-order form — behaves the same: energy is conserved, so nothing can grow.`,
    ],
    params: {
      x: [0, 6.2832], y: [-3.2, 3.2], aspect: 'wide', xlabel: 'x', ylabel: 'u, v', axesAt: 'edge',
      choices: [{ key: 'sys', label: 'System', options: [[0, 'Jordan block (weak)'], [1, 'diagonalizable (strong)'], [2, 'symmetric (waves)']], value: 0, explain: 'Jordan block: $u_t = u_x + v_x$, $v_t = v_x$. Diagonalizable: $u_t = u_x + v_x$, $v_t = -v_x$. Symmetric: $u_t = v_x$, $v_t = u_x$. All have real characteristic speeds.' }],
      sliders: [
        { key: 'k1', label: 'Wavenumber $k$', min: 1, max: 20, step: 1, value: 4, explain: 'How fine the initial ripple is: $k$ crests per $2\\pi$ of length.' },
        { key: 'tt', label: 'Time $t$', min: 0, max: 3, step: 0.05, value: 1, explain: 'How long the system has run.' },
      ],
      curves: [
        { fn: U.w, color: 'accent', width: 2.2, when: W, samples: 1600 }, { fn: V.w, color: 'gold', width: 1.4, dash: [4, 3], when: W, samples: 1600 },
        { fn: U.s, color: 'accent', width: 2.2, when: S, samples: 1600 }, { fn: V.s, color: 'gold', width: 1.4, dash: [4, 3], when: S, samples: 1600 },
        { fn: U.y, color: 'accent', width: 2.2, when: Y, samples: 1600 }, { fn: V.y, color: 'gold', width: 1.4, dash: [4, 3], when: Y, samples: 1600 },
      ],
      readouts: [
        { label: 'amplitude of u', expr: `${W}*0.05*k1*tt + (${S} + ${Y})*0.05*abs(sin(k1*tt))`, digits: 3, zero: 1e-9 },
        { label: t`$\|e^{ik\mathsf At}\|$`, expr: `${W}*(k1*tt + sqrt(k1^2*tt^2 + 4))/2 + ${S}*sqrt(1 + sin(k1*tt)^2/2 + abs(sin(k1*tt))*sqrt(1 + sin(k1*tt)^2/4)) + ${Y}*1`, digits: 3 },
      ],
    },
    caption: t`Exact solutions; $x$ is periodic over $2\pi$. The matrix norm is the largest factor by which any combination of the two fields’ amplitudes can grow (the 2-norm). For the diagonalizable system it never exceeds $(1 + \sqrt5)/2 \approx 1.62$.`,
  },
  example: {
    prompt: t`Solve $u_t = u_x + v_x$, $v_t = v_x$ with $u(x, 0) = 0$, $v(x, 0) = g(x)$. Then find $\|e^{ik\mathsf At}\|$ for $k = 100$ and $t = 1$, and compare the diagonalizable system $v_t = -v_x$.`,
    visual: growthPlot('Growth factor against wavenumber at t = 1 (log–log), computed from the closed forms: the Jordan block grows in proportion to k; the diagonalizable system stays bounded.'),
    steps: [
      { label: 'The lone field', text: t`$v_t = v_x$ is transport: $v = g(x + t)$.` },
      { label: 'Feed it in', text: t`Then $u_t - u_x = g'(x + t)$: along the characteristic $x + t = $ const the source is constant, so $u$ grows linearly: $u = t\,g'(x + t)$. Check: $u_t = g' + tg''$ and $u_x + v_x = tg'' + g'$ ✓.` },
      { label: 'A derivative is lost', text: t`$u$ is built from $g'$, not $g$: data that are small but wiggly ($g = \varepsilon\cos kx$) give $u$ of size $\varepsilon\,kt$. No bound $\|\mathbf u(t)\| \le C\|\mathbf u(0)\|$ can hold with one $C$ for all $k$.` },
      { label: 'The matrix picture', text: t`$\mathsf A = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix} = \mathsf I + \mathsf N$, so $e^{ik\mathsf At} = e^{ikt}\begin{pmatrix} 1 & ikt \\ 0 & 1 \end{pmatrix}$, whose largest singular value is $\tfrac12\big(kt + \sqrt{k^2t^2 + 4}\big) = ${jnorm(100, 1).toFixed(2)}$ for $k = 100$, $t = 1$.` },
      { label: 'Strong instead', text: t`With $v_t = -v_x$, $\mathsf A = \begin{pmatrix} 1 & 1 \\ 0 & -1 \end{pmatrix}$ has two speeds, $\pm1$, and two eigenvectors. Then $\|e^{ik\mathsf At}\| \le (1 + \sqrt5)/2 \approx 1.62$ for every $k$ and $t$ — the solution $u = -\varepsilon\sin(kx)\sin(kt)$ never exceeds $\varepsilon$.` },
    ],
    answer: t`$u = t\,g'(x + t)$, $v = g(x + t)$; $\|e^{ik\mathsf At}\| = ${jnorm(100, 1).toFixed(2)}$ at $k = 100$, $t = 1$ (and $\approx kt$ in general). The diagonalizable system stays below 1.62 for all $k$.`,
  },
  practice: [
    mcq({
      id: 'classify-matrix', difficulty: 2,
      gen(r) {
        const M = r.pick([
          { m: [[2, 1], [0, 2]], type: 1, note: t`one eigenvalue, 2, twice — but only one eigenvector, $(1, 0)$: a Jordan block` },
          { m: [[0, 0], [1, 0]], type: 1, note: t`eigenvalue 0 twice, with only the eigenvector $(0, 1)$` },
          { m: [[1, 2], [0, -1]], type: 0, note: t`two different real eigenvalues, $\pm1$, hence two eigenvectors` },
          { m: [[0, 4], [1, 0]], type: 0, note: t`eigenvalues $\pm2$, real and distinct` },
          { m: [[2, 0], [0, 2]], type: 0, note: t`eigenvalue 2 twice, but every vector is an eigenvector — a full set` },
          { m: [[1, 1], [-1, 1]], type: 2, note: t`eigenvalues $1 \pm i$: complex speeds` },
        ]);
        const mt = t`\begin{pmatrix} ${M.m[0][0]} & ${M.m[0][1]} \\ ${M.m[1][0]} & ${M.m[1][1]} \end{pmatrix}`;
        return {
          prompt: t`Classify the system $\mathbf u_t = \mathsf A\,\mathbf u_x$ with $\mathsf A = ${mt}$.`,
          visual: growthPlot('What is at stake: a bounded growth factor (strongly hyperbolic) or one that rises with the wavenumber (weakly hyperbolic only).'),
          choices: ['strongly hyperbolic', 'weakly hyperbolic only (real speeds, too few eigenvectors)', 'not hyperbolic: complex characteristic speeds', 'parabolic'],
          answer: M.type,
          why: Object.fromEntries([0, 1, 2, 3].filter((i) => i !== M.type).map((i) => [i, i === 3 ? 'A first-order system with no second derivatives has no diffusion; the question is only about the eigenvalues and eigenvectors of A.' : t`This matrix has ${M.note}.`])),
          hints: [t`Find the eigenvalues from $\lambda^2 - (\operatorname{tr}\mathsf A)\lambda + \det\mathsf A = 0$. Complex? Not hyperbolic.`, 'If an eigenvalue is repeated, count its independent eigenvectors.'],
          teach: 'Real eigenvalues give weak hyperbolicity; real eigenvalues plus a full set of eigenvectors give strong hyperbolicity.',
          explain: t`$\mathsf A$ has ${M.note}: **${['strongly hyperbolic', 'weakly but not strongly hyperbolic', 'not hyperbolic'][M.type]}**. A repeated eigenvalue is harmless when it has its full set of eigenvectors (as for $2\mathsf I$); it is fatal when one is missing.`,
        };
      },
    }),
    num({
      id: 'growth-factor', difficulty: 2,
      gen(r) {
        const k = r.pick([5, 20, 50, 200]), tt = r.pick([0.5, 1, 2]);
        const g = jnorm(k, tt);
        return {
          prompt: t`For the Jordan-block system $\mathsf A = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$, the largest factor by which a mode of wavenumber $k$ can grow by time $t$ is $\|e^{ik\mathsf At}\| = \tfrac12\big(kt + \sqrt{k^2t^2 + 4}\big)$. Evaluate it for $k = ${k}$ rad/m, $t = ${tt}$ s.`,
          visual: growthPlot('The growth factor against wavenumber at t = 1 (log–log): a straight line of slope 1 for the Jordan block.'),
          answer: g, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`The eigenvalues have modulus 1, $|e^{ik\lambda t}| = 1$ — but the off-diagonal $ikt$ is what grows.` }],
          hints: [t`$kt = ${k * tt}$.`],
          teach: 'For a Jordan block the growth factor is about kt: it rises without limit with the wavenumber.',
          explain: t`$\tfrac12\big(${k * tt} + \sqrt{${k * tt}^2 + 4}\big) = ${r3(g)}$ — essentially $kt$. Every eigenvalue has modulus one, yet the matrix grows: eigenvalues alone do not decide well-posedness.`,
        };
      },
    }),
    num({
      id: 'noise-growth', difficulty: 2, transfer: true,
      gen(r) {
        const dx = r.pick([0.01, 0.005]), eps = r.pick([1e-10, 1e-12]), T = r.pick([50, 200]);
        const k = Math.PI / dx, amp = eps * k * T;
        return {
          prompt: t`A simulation of the Jordan-block system runs on a grid of spacing $\Delta x = ${dx}$, so the finest mode it can hold has $k = \pi/\Delta x$. Round-off seeds that mode in $v$ with amplitude $\varepsilon = ${tex(eps)}$. Using $u \approx \varepsilon\,kt$, how large has $u$ grown by $t = ${T}$?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.2, 1.2], aspect: 'wide', xlabel: 'x', ylabel: 'v (scaled)', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: 'cos(pi*x*20)', color: 'gold', width: 1.4, samples: 2000 }], points: Array.from({ length: 21 }, (_, i) => ({ x: i / 20, y: Math.cos(Math.PI * i), color: 'accent', r: 3 })) }, caption: 'The finest mode a grid can hold: + − + − from point to point (k = π/Δx). Only a stretch of the grid is drawn.' },
          answer: amp, tol: { rel: 0.01 },
          errors: [{ value: eps * T, feedback: t`Multiply by $k = \pi/\Delta x$ as well: the growth is proportional to the wavenumber.` }, { value: eps * T / dx, feedback: t`$k = \pi/\Delta x$, not $1/\Delta x$.` }],
          hints: [t`$k = \pi/${dx} = ${r3(k)}$ rad/m.`, t`$u \approx \varepsilon\,k\,t$.`],
          teach: 'In a weakly hyperbolic system round-off at the grid scale grows like (π/Δx)·t: finer grids make it worse.',
          explain: t`$k = ${r3(k)}$, so $u \approx ${tex(eps)}\times${r3(k)}\times${T} = ${tex(amp)}$. Halve $\Delta x$ and the growth doubles: refining the grid makes this error worse, the opposite of convergence. With the lower-order terms real equations have, the growth becomes exponential (next problems).`,
        };
      },
    }),
    expr({
      id: 'solve-weak', difficulty: 3,
      prompt: t`Solve $u_t = u_x + v_x$, $v_t = v_x$ with $u(x, 0) = 0$ and $v(x, 0) = \sin x$. Find $u(x, t)$.`,
      visual: { type: 'graph', params: { x: [0, 6.2832], y: [-3.2, 3.2], aspect: 'wide', xlabel: 'x', ylabel: 'v', axesAt: 'edge', curves: [{ fn: 'sin(x + 1)', color: 'gold', width: 2, dash: [4, 3] }] }, caption: t`$v$ at $t = 1$: the data carried left unchanged. What it does to $u$ is the question.` },
      answer: 't*cos(x + t)',
      answerTeX: t`t\cos(x + t)`,
      lhs: 'u(x, t)',
      vars: { x: [-3, 3], t: [0, 2] },
      errors: [{ answer: 'cos(x + t)', feedback: t`$u$ is fed by $v_x$ for the whole time $t$ along its characteristic: it grows like $t$.` }, { answer: 't*sin(x + t)', feedback: t`The source is $v_x = \cos(x + t)$, the derivative of the data.` }, { answer: 't*cos(x - t)', feedback: t`$v_t = v_x$ moves left: $v = \sin(x + t)$.` }],
      hints: [t`First $v = \sin(x + t)$, so $u_t - u_x = v_x = \cos(x + t)$.`, t`Along $x + t = $ const the right side is constant: $u$ grows linearly in $t$.`, t`Try $u = t\,\cos(x + t)$ and check it.`],
      teach: 'A Jordan block feeds one field by the derivative of the other along the same characteristic: secular, linear-in-t growth.',
      explain: t`$u = t\cos(x + t)$: $u_t = \cos(x + t) - t\sin(x + t)$ and $u_x + v_x = -t\sin(x + t) + \cos(x + t)$ ✓. Replace $\sin x$ by $\sin kx$ and $u = kt\cos k(x + t)$: the factor $k$ is the lost derivative.`,
    }),
    num({
      id: 'perturbed', difficulty: 3,
      gen(r) {
        const eps = r.pick([0.01, 0.04, 0.1]), k = r.pick([50, 200, 800]);
        const rate = Math.sqrt((eps * k) / 2);
        return {
          prompt: t`Add a small lower-order coupling to the Jordan-block system: $u_t = u_x + v_x$, $v_t = v_x + ${eps}\,u$. For a mode $e^{ikx}$ the eigenvalues of the evolution matrix are $ik \pm \sqrt{${eps}\,ik}$. What is the exponential growth rate (the largest real part) for $k = ${k}$ rad/m?`,
          visual: { type: 'graph', params: { x: [0, 1000], y: [0, 7.5], aspect: 'wide', xlabel: 'wavenumber k', ylabel: 'growth rate (1/s)', axesAt: 'edge', yticks: 0, curves: [{ fn: `sqrt(${eps}*x/2)`, color: 'warn', width: 2.4 }], hlines: [{ y: 0.05, color: 'accent', label: 'strongly hyperbolic + same term: bounded' }] }, caption: 'The growth rate √(εk/2) against wavenumber (orange): unbounded. Lower-order terms in a strongly hyperbolic system add at most a fixed rate.' },
          answer: rate, units: '1/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(eps * k), feedback: t`$\sqrt{ik} = \sqrt{k}\,e^{i\pi/4}$, whose real part is $\sqrt{k/2}$: you dropped the $1/\sqrt2$.` }, { value: eps * k, feedback: 'The growth rate is the square root of εk/2, not εk.' }].filter((e) => Math.abs(e.value - rate) > 0.01 * rate),
          hints: [t`$\sqrt{i} = e^{i\pi/4} = (1 + i)/\sqrt2$.`, t`Real part of $\sqrt{\varepsilon ik}$ is $\sqrt{\varepsilon k/2}$.`],
          teach: 'A weakly hyperbolic system is not robust: a small lower-order term turns its polynomial growth into exponential growth whose rate rises with k.',
          explain: t`$\sqrt{${eps}\times${k}/2} = ${r3(rate)}$ s⁻¹. The rate grows like $\sqrt k$ without limit — the mode $k$ is amplified by $e^{\sqrt{\varepsilon k/2}\,t}$, Hadamard’s ill-posedness in full. A strongly hyperbolic system stays well-posed under *any* lower-order term (Kreiss); a weakly hyperbolic one does not. Real equations, Einstein’s included, always have lower-order terms.`,
        };
      },
    }),
    multi({
      id: 'hierarchy', difficulty: 2,
      prompt: t`Which statements are true for first-order systems $\mathbf u_t = \mathsf A\,\mathbf u_x$? (Select all that apply.)`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-1.9, 1.9], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['2.6*cos(t)', '1.7*sin(t)'], t: [0, 6.2832], color: 'warn', width: 2 }, { param: ['0.5 + 1.8*cos(t)', '1.15*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['1 + 0.9*cos(t)', '0.6*sin(t)'], t: [0, 6.2832], color: 'good', width: 2 }], points: [{ x: -1.9, y: 1.25, label: 'weakly hyperbolic', r: 0, color: 'warn' }, { x: -1.1, y: 0.6, label: 'strongly', r: 0, color: 'accent' }, { x: 0.45, y: 0, label: 'symmetric', r: 0, color: 'good' }] }, caption: 'Nested classes of hyperbolic systems (schematic).' },
      choices: ['every symmetric A with real entries gives a strongly hyperbolic system', 'every strongly hyperbolic system is weakly hyperbolic', 'every weakly hyperbolic system is well-posed', 'adding lower-order terms cannot spoil the well-posedness of a strongly hyperbolic system', 'real eigenvalues guarantee a full set of eigenvectors'],
      answer: [0, 1, 3],
      why: {
        2: 'The Jordan block is weakly hyperbolic and ill-posed: growth ∝ kt.',
        4: t`$\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$ has the real eigenvalue 1 twice and one eigenvector.`,
      },
      hints: ['A real symmetric matrix has real eigenvalues and an orthonormal set of eigenvectors.', 'Think of the Jordan block for the false ones.'],
      teach: 'Symmetric ⊂ strongly ⊂ weakly hyperbolic; well-posedness (robust to lower-order terms) starts at strong.',
      explain: t`Symmetric matrices are diagonalizable by rotations (so $\|e^{ik\mathsf At}\| = 1$ exactly: an energy is conserved). Strongly hyperbolic systems are well-posed, and stay so whatever lower-order terms are added. Weak hyperbolicity is not enough, and real eigenvalues do not by themselves supply eigenvectors.`,
    }),
    code({
      id: 'norm-growth', difficulty: 3,
      prompt: t`Measure the growth factors with SciPy’s matrix exponential. For $\mathsf J = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$ (weak) and $\mathsf D = \begin{pmatrix} 1 & 1 \\ 0 & -1 \end{pmatrix}$ (strong), compute \`np.linalg.norm(expm(1j * k * A * t), 2)\` at $t = 1$ for $k = 1, 10, 100, 1000$, storing the lists \`weak\` and \`strong\`. Then, for the strong system, find the largest factor over a sweep of times \`ts = np.linspace(0, 10, 2001)\` at $k = 1$ (\`worst\`).`,
      starter: t`import numpy as np
from scipy.linalg import expm

J = np.array([[1.0, 1.0], [0.0, 1.0]])
D = np.array([[1.0, 1.0], [0.0, -1.0]])
ks = [1, 10, 100, 1000]

def growth(A, k, t):
    pass

weak = []
strong = []
worst = None
print(weak, strong, worst)
`,
      answer: t`import numpy as np
from scipy.linalg import expm

J = np.array([[1.0, 1.0], [0.0, 1.0]])
D = np.array([[1.0, 1.0], [0.0, -1.0]])
ks = [1, 10, 100, 1000]

def growth(A, k, t):
    return np.linalg.norm(expm(1j * k * A * t), 2)

weak = [growth(J, k, 1.0) for k in ks]
strong = [growth(D, k, 1.0) for k in ks]
ts = np.linspace(0, 10, 2001)
worst = max(growth(D, 1, t) for t in ts)
print(weak, strong, worst)`,
      tests: [
        { name: 'the weak growth factors are about 1.62, 10.1, 100 and 1000', code: 'len(weak) == 4 and all(abs(w - (k + np.sqrt(k*k + 4)) / 2) < 1e-6 * k for w, k in zip(weak, ks))' },
        { name: 'every strong growth factor stays below 1.62', code: 'len(strong) == 4 and max(strong) < 1.6181' },
        { name: 'over a sweep of times the strong factor peaks at the golden ratio, 1.618', code: 'worst is not None and abs(worst - (1 + np.sqrt(5)) / 2) < 1e-4' },
      ],
      hints: ['`growth(A, k, t)` is one line: `np.linalg.norm(expm(1j*k*A*t), 2)`.', '`weak = [growth(J, k, 1.0) for k in ks]`, and the same with `D`.', '`worst = max(growth(D, 1, t) for t in np.linspace(0, 10, 2001))`.'],
      teach: 'A uniform bound on $\\|e^{ikAt}\\|$ over all k and t is what strong hyperbolicity buys — and a Jordan block cannot have one.',
      explain: t`The weak factors come out $1.618$, $10.10$, $100.01$, $1000.0$ — proportional to $k$. The strong ones wander between 1 and $1.618 = (1 + \sqrt5)/2$ and never exceed it, whatever $k$ and $t$ — exactly the guaranteed bound: the matrix of $\mathsf D$’s unit eigenvectors, $(1, 0)$ and $(1, -2)/\sqrt5$, has condition number $(1 + \sqrt5)/2$ too. That uniform bound is Hadamard’s condition.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-adm', difficulty: 3, transfer: true,
      prompt: t`The ADM evolution equations of general relativity, in their usual form (with the lapse and shift fixed in advance), are only **weakly** hyperbolic. What does that predict for a black-hole simulation built on them?`,
      visual: { type: 'graph', params: { x: [0, 100], y: [-6, 3], ylog: true, aspect: 'wide', xlabel: 'simulation time (units of M)', ylabel: 'constraint violation', axesAt: 'edge', yticks: 0, curves: [{ fn: 'log10(1e-6*e^(0.1*x)*(1 + 0*x))', color: 'warn', width: 2, label: 'coarse grid', labelAt: 70, labelDy: 14 }, { fn: 'log10(1e-6*e^(0.16*x))', color: 'bad', width: 2, label: 'finer grid', labelAt: 40, labelDy: -12 }] }, caption: 'Schematic, not data: the pattern of a weakly hyperbolic evolution — errors that grow, and grow faster on a finer grid.' },
      choices: ['Short-wavelength errors grow without a bound uniform in k, so runs crash, and refining the grid makes them crash sooner instead of converging', 'Nothing: real characteristic speeds guarantee a stable evolution', 'The physics is wrong: ADM describes a different spacetime', 'The simulation runs forever but slightly inaccurately'],
      answer: 0,
      why: {
        1: 'Real speeds give weak hyperbolicity only; without a full set of eigenvectors the growth depends on k.',
        2: 'ADM is an exact rewriting of Einstein’s equations; its solutions are the right spacetimes. The trouble is how errors evolve, not what the exact solution is.',
        3: 'Ill-posedness does not make errors merely small: they grow, and faster at finer resolution.',
      },
      hints: ['Weakly hyperbolic means: growth that rises with the wavenumber. What does refining a grid add?', 'A finer grid holds shorter waves — larger k — so its worst errors grow faster.'],
      teach: 'An ill-posed formulation punishes resolution: finer grids hold higher wavenumbers, which grow faster.',
      explain: t`Grid noise at wavenumber $\sim\pi/\Delta x$ grows like $kt$ — and, with the lower-order terms Einstein’s equations always have, exponentially at a rate that rises with $k$. Early 3D ADM codes ran for a while and then blew up, sooner at higher resolution. Reformulations that are strongly hyperbolic for suitable gauges — generalized harmonic coordinates (Pretorius, 2005) and BSSN with moving punctures (2006) — produced the first binary black-hole mergers. Module B15 takes this apart.`,
    }),
    num({
      id: 'cp-refine', difficulty: 3, transfer: true,
      gen(r) {
        const N1 = r.pick([64, 128]), f = r.pick([2, 4]), T = r.pick([100, 500]);
        const L = 2 * Math.PI, g1 = (Math.PI / (L / N1)) * T, g2 = (Math.PI / (L / (N1 * f))) * T;
        return {
          prompt: t`A periodic domain of length $2\pi$ is resolved with $N = ${N1}$ points. In a weakly hyperbolic formulation the grid-scale mode ($k = \pi/\Delta x$) is amplified by about $kt$. The grid is refined to $${N1 * f}$ points. By what factor does the amplification at $t = ${T}$ change?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ fn: 'cos(pi*x*8)', color: 'accent', width: 1.6, samples: 800 }, { fn: `0.6*cos(pi*x*${8 * f})`, color: 'warn', width: 1.4, samples: 1600 }] }, caption: 'The finest mode on a coarse grid (blue) and on the refined grid (orange, drawn smaller): refining adds shorter waves.' },
          answer: g2 / g1, tol: { rel: 0.005 },
          errors: [{ value: 1 / f, feedback: 'Refining makes the finest mode finer — larger k — so the amplification grows, not shrinks.' }, { value: f * f, feedback: t`The growth is $\propto k$, and $k \propto 1/\Delta x \propto N$: one power of the refinement factor.` }],
          hints: [t`$k_{\max} = \pi/\Delta x = \pi N/(2\pi) = N/2$.`, 'The amplification kt is proportional to N.'],
          teach: 'For a weakly hyperbolic system, refining the grid by a factor f multiplies the worst error growth by f: no convergence.',
          explain: t`$k_{\max} = N/2$: from $${N1 / 2}$ to $${(N1 * f) / 2}$, so the amplification $kt$ goes from $${r3(g1)}$ to $${r3(g2)}$ — ${f} times larger. A convergent method needs errors to *shrink* with refinement (module B13); here they grow.`,
        };
      },
    }),
    mcq({
      id: 'cp-eigenvectors', difficulty: 2,
      prompt: t`A system has $\mathsf A = \begin{pmatrix} 3 & a \\ 0 & 3 \end{pmatrix}$. For which values of $a$ is it strongly hyperbolic?`,
      visual: growthPlot('Bounded against unbounded growth with wavenumber — the line that the value of a decides.'),
      choices: [t`only $a = 0$`, t`every $a$: the eigenvalues are real`, t`every $a \ne 0$`, t`only $a > 0$`],
      answer: 0,
      why: {
        1: t`Real eigenvalues give weak hyperbolicity. For $a \ne 0$ the repeated eigenvalue 3 has a single eigenvector.`,
        2: t`$a \ne 0$ is exactly the Jordan-block case.`,
        3: t`The sign of $a$ does not matter; any nonzero $a$ leaves an eigenvector missing.`,
      },
      hints: [t`Eigenvalue 3 twice. Solve $(\mathsf A - 3\mathsf I)\mathbf e = 0$: how many independent solutions?`],
      teach: 'A repeated eigenvalue gives strong hyperbolicity only if it keeps a full set of eigenvectors.',
      explain: t`$\mathsf A - 3\mathsf I = \begin{pmatrix} 0 & a \\ 0 & 0 \end{pmatrix}$: for $a \ne 0$ only $(1, 0)$ is an eigenvector and $e^{ik\mathsf At}$ grows like $|a|kt$. For $a = 0$, $\mathsf A = 3\mathsf I$, two uncoupled transport equations: strongly (indeed symmetric) hyperbolic. Formulation choices in relativity — adding multiples of the constraints, choosing the gauge — are exactly ways of making such off-diagonal entries harmless.`,
    }),
  ],
  sources: [SRC.evans, { label: 'H.-O. Kreiss & J. Lorenz, Initial-Boundary Value Problems and the Navier–Stokes Equations (Academic Press, 1989; SIAM 2004), ch. 2', url: 'https://doi.org/10.1137/1.9780898719130' }, { label: 'O. Sarbach & M. Tiglio, Continuum and discrete initial-boundary value problems and Einstein’s field equations, Living Rev. Relativ. 15, 9 (2012)', url: 'https://doi.org/10.12942/lrr-2012-9' }, { label: 'M. Alcubierre, Introduction to 3+1 Numerical Relativity (Oxford University Press, 2008), ch. 5', url: 'https://doi.org/10.1093/acprof:oso/9780199205677.001.0001' }, { label: 'F. Pretorius, Evolution of binary black-hole spacetimes, Phys. Rev. Lett. 95, 121101 (2005)', url: 'https://doi.org/10.1103/PhysRevLett.95.121101' }],
});
