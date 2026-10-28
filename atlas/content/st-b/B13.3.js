// Convergence and consistency: the global error at a fixed time, E(Δx) ≈ CΔxᵖ;
// measured order p = log₂(E(Δx)/E(Δx/2)); the Lax equivalence theorem (Lax &
// Richtmyer 1956): for a consistent scheme for a well-posed linear initial-value
// problem, stability ⇔ convergence. Errors computed here by model/pde4-fd.js,
// one lap of a bump at ν = 0.5: Lax–Wendroff reaches order 2.00, upwind and
// Lax–Friedrichs creep toward 1 (and a narrow bump is far from the asymptotic
// range), consistent-but-unstable FTCS diverges as the grid is refined.
// Self-convergence without an exact solution: Q = (f_h − f_{h/2})/(f_{h/2} −
// f_{h/4}) = 2ᵖ; Richardson's error estimate. Constraint violations should
// converge to zero at the scheme's order (B14). Links st-f F13 (convergence
// testing of ODE solvers) — its examples are ODEs; these are PDE grids.
import { lesson, mcq, multi, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';
import { error, run, exact } from '../../src/viz/model/pde4-fd.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const LAX = { label: 'P. D. Lax & R. D. Richtmyer, Survey of the stability of linear finite difference equations, Comm. Pure Appl. Math. 9, 267–293 (1956)', url: 'https://doi.org/10.1002/cpa.3160090206' };
const STRIKWERDA = { label: 'J. C. Strikwerda, Finite Difference Schemes and Partial Differential Equations, 2nd ed. (SIAM, 2004), ch. 10 (the Lax–Richtmyer theorem)', url: 'https://doi.org/10.1137/1.9780898717938' };
const CHOPTUIK = { label: 'M. W. Choptuik, Consistency of finite-difference solutions of Einstein’s equations, Phys. Rev. D 44, 3124 (1991)', url: 'https://doi.org/10.1103/PhysRevD.44.3124' };

// errors after one 10 m lap at ν = 0.5, for two bump widths
const NS = [25, 50, 100, 200, 400];
const SCH = ['upwind', 'lw', 'laxf', 'ftcs'];
const WID = [0.4, 1.5];
const ERR = WID.map((w) => SCH.map((s) => NS.map((N) => error({ eq: 'advect', scheme: s, N, nu: 0.5, profile: 'gauss', w, t: 10, cap: 1e150 }).err)));
const ord = (e, i) => Math.log2(e[i] / e[i + 1]);
const COL = ['accent', 'good', 'violet', 'bad'];
const NAMES = ['upwind', 'Lax–Wendroff', 'Lax–Friedrichs', 'FTCS'];
const when = (s, w) => `step(0.5 - abs(sch - ${s}))*step(0.5 - abs(wid - ${w}))`;
const YTOP = 1.6;
const loglog = (extra = {}) => ({
  x: [1.25, 2.75], y: [-4, YTOP + 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'grid points N (log scale)', ylabel: 'largest error (log scale)', xlog: true, ylog: true, ...extra,
});
// the self-convergence data: Lax–Wendroff, bump of width 1.5 m, u at a grid point after one lap
const SELF = [4, 5.5].map((xq) => ({ xq, f: [100, 200, 400].map((N) => { const R = run({ eq: 'advect', scheme: 'lw', N, nu: 0.5, profile: 'gauss', w: 1.5, t: 10 }); return R.u[R.x.findIndex((x) => Math.abs(x - xq) < 1e-9)]; }) }));
const LW = ERR[1][1];                                 // Lax–Wendroff, wide bump

export default lesson({
  id: 'st-b.B13.3',
  title: 'Convergence and consistency',
  minutes: 15, difficulty: 3,
  intro: t`A scheme **converges** if its answer approaches the exact solution as the grid is refined: the largest error $E$ at a fixed time goes to zero as $\Delta x \to 0$ (with $\Delta t$ shrinking in step). For a scheme of order $p$, $E$ eventually behaves like $C\,\Delta x^p$, so halving the spacing divides it by $2^p$ — and two runs measure the order:

$$p \approx \log_2\frac{E(\Delta x)}{E(\Delta x/2)}.$$

When does a scheme converge? The **Lax equivalence theorem** (Lax and Richtmyer, 1956) answers for linear problems: if the initial-value problem is well posed and the scheme is **consistent** (its truncation error vanishes as the grid is refined), then it converges **if and only if it is stable**. Consistency says each step imitates the PDE; stability says the errors made at each step are not amplified without bound. You need both — and with both you are guaranteed the rest.`,
  symbols: [
    { tex: 'E(\\Delta x)', text: 'the largest difference between grid values and the exact solution at a fixed time, on a grid of spacing $\\Delta x$' },
    { tex: 'p', text: 'the order of convergence: the power of $\\Delta x$ the error eventually follows' },
    { tex: 'C', text: 'a constant set by the solution’s smoothness and the time elapsed, not by the grid' },
    { tex: '\\log_2', text: 'the base-2 logarithm, since the spacing is halved: $\\log_2 x = \\ln x/\\ln 2$' },
  ],
  why: t`Convergence testing is how simulations earn trust. Numerical-relativity groups run every binary-black-hole merger at three or more resolutions and check that the waveform differences shrink at the scheme’s order before LIGO and Virgo use it (Choptuik made this standard in 1991). The same test, on ODE solvers, is [st-f’s lesson on measuring the order](#/lesson/st-f.F13.1).`,
  visual: {
    type: 'graph',
    title: 'Error against grid size',
    lead: t`Each point is a full run: a bump carried once around the 10 m ring at $\nu = 0.5$, its largest error measured against the exact solution, for $N = 25$ to 400 grid points. On log–log axes an order-$p$ scheme makes a line of slope $-p$; the dashed guides have slopes $-1$ and $-2$.`,
    tasks: [
      t`Lax–Wendroff on the wide bump: the points fall on the slope-2 guide, and the readout settles at 2.00.`,
      t`Upwind and Lax–Friedrichs on the wide bump: slope 1 approached only slowly. On the narrow bump the coarse grids are not even in the **asymptotic range** — the errors barely fall at first.`,
      t`FTCS: consistent, but unstable — refining makes the error *grow*, off the top of the chart. Lax’s theorem in action.`,
    ],
    params: loglog({
      choices: [
        { key: 'sch', label: 'Scheme', options: NAMES.map((n, i) => [i, n]), value: 1, explain: 'Upwind and Lax–Friedrichs are first order, Lax–Wendroff second, FTCS second-order consistent but unstable.' },
        { key: 'wid', label: 'Bump width', options: [[0, '0.4 m (narrow)'], [1, '1.5 m (wide)']], value: 1, explain: 'A narrow bump needs a finer grid before the error follows its asymptotic power law.' },
      ],
      curves: [
        { fn: `${r3(Math.log10(LW[2]))} - 1*(x - ${r3(Math.log10(100))}) + 0.6`, color: 'ink3', dash: [5, 4], width: 1.2, label: 'slope −1', labelAt: 1.5, labelDy: -10 },
        { fn: `${r3(Math.log10(LW[2]))} - 2*(x - ${r3(Math.log10(100))}) - 0.25`, color: 'ink3', dash: [2, 3], width: 1.2, label: 'slope −2', labelAt: 2.45, labelDy: 14 },
        ...WID.flatMap((_, w) => SCH.map((_s, s) => ({ fn: `${r3(Math.log10(ERR[w][s][3]))} + (x - ${r3(Math.log10(200))})*${r3(-ord(ERR[w][s], 3))}`, domain: [Math.log10(200), Math.log10(400)], color: COL[s], width: 2.4, when: when(s, w) }))),
      ],
      points: WID.flatMap((_, w) => SCH.flatMap((_s, s) => NS.map((N, i) => ({ x: r3(Math.log10(N)), y: r3(Math.min(YTOP, Math.log10(ERR[w][s][i]))), color: Math.log10(ERR[w][s][i]) > YTOP ? 'bad' : COL[s], r: 5, hollow: Math.log10(ERR[w][s][i]) > YTOP, when: when(s, w) })))),
      readouts: [{ label: 'measured order, $N = 200 \\to 400$', expr: WID.flatMap((_, w) => SCH.map((_s, s) => `${when(s, w)}*(${r3(ord(ERR[w][s], 3))})`)).join(' + '), digits: 3 }],
    }),
    caption: t`Errors computed by running each scheme; hollow red circles at the top are off the scale (FTCS errors reach $10^{${Math.floor(Math.log10(ERR[1][3][4]))}}$). The coloured segment joins the two finest grids. Both axes are logarithmic.`,
  },
  example: {
    prompt: t`Lax–Wendroff carries the wide bump once around the ring. With $N = 100$ the largest error is $${tex(LW[2], 3)}$; with $N = 200$ it is $${tex(LW[3], 3)}$. Find the order, predict the error at $N = 400$, and estimate the $N$ needed for an error of $10^{-4}$.`,
    visual: { type: 'graph', params: loglog({ curves: [{ fn: `${r3(Math.log10(LW[2]))} - 2*(x - 2)`, color: 'ink3', dash: [5, 4], width: 1.2 }], points: NS.slice(0, 4).map((N, i) => ({ x: r3(Math.log10(N)), y: r3(Math.log10(LW[i])), color: 'good', r: 5 })) }), caption: 'Lax–Wendroff’s measured errors for N = 25 to 200 on log–log axes, with a slope −2 guide.' },
    steps: [
      { label: 'Ratio', text: t`$E(100)/E(200) = ${tex(LW[2], 3)}/${tex(LW[3], 3)} = ${r3(LW[2] / LW[3])}$.` },
      { label: 'Order', text: t`$p = \log_2 ${r3(LW[2] / LW[3])} = ${r3(ord(LW, 2))}$: second order, as the truncation error promised.` },
      { label: 'Predict', text: t`Halving again divides the error by $2^2 = 4$: $E(400) \approx ${tex(LW[3] / 4, 3)}$. Running it gives $${tex(LW[4], 3)}$.` },
      { label: 'Plan', text: t`To reach $10^{-4}$ from $${tex(LW[3], 3)}$ at $N = 200$: $N \approx 200\,(${tex(LW[3], 3)}/10^{-4})^{1/2} = ${Math.round(200 * Math.sqrt(LW[3] / 1e-4))}$.` },
      { label: 'Cost', text: t`At fixed $\nu$ the number of steps grows with $N$ too, so the work grows as $N^2$ in one dimension (and $N^4$ in three): about $${r3((200 * Math.sqrt(LW[3] / 1e-4) / 200) ** 2)}$ times the $N = 200$ run. A first-order scheme would need $N \approx ${tex(200 * (ERR[1][0][3] / 1e-4), 2)}$ for the same accuracy.` },
    ],
    answer: t`$p = ${r3(ord(LW, 2))}$; $E(400) \approx ${tex(LW[3] / 4, 3)}$ (measured $${tex(LW[4], 3)}$); about $${Math.round(200 * Math.sqrt(LW[3] / 1e-4))}$ grid points for an error of $10^{-4}$.`,
  },
  practice: [
    num({
      id: 'order-two', difficulty: 1,
      gen(r) {
        const p = r.pick([1, 2, 4]), e1 = r.pick([0.08, 0.012, 3.2e-3]), N = r.pick([50, 64, 100]);
        const noise = r.pick([0.97, 1.02, 1.05]);
        const e2 = (e1 / 2 ** p) * noise, ans = Math.log2(e1 / e2);
        return {
          prompt: t`A scheme’s largest error at a fixed time is $${tex(e1, 3)}$ with $N = ${N}$ grid points and $${tex(e2, 3)}$ with $N = ${2 * N}$. What order of convergence do these two runs indicate?`,
          visual: { type: 'graph', params: loglog({ x: [1.5, 2.5], y: [Math.log10(e2) - 0.8, Math.log10(e1) + 0.6], points: [{ x: r3(Math.log10(N)), y: r3(Math.log10(e1)), color: 'accent', r: 6 }, { x: r3(Math.log10(2 * N)), y: r3(Math.log10(e2)), color: 'accent', r: 6 }] }), caption: 'The two runs on log–log axes: the order is minus the slope of the line between them.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: e1 / e2, feedback: t`That is the ratio itself; the order is its base-2 logarithm, $\log_2(E_1/E_2)$.` }, { value: Math.log10(e1 / e2), feedback: t`The grid was halved, so use $\log_2$, not $\log_{10}$.` }],
          hints: [t`$p = \log_2\big(E(\Delta x)/E(\Delta x/2)\big) = \ln(E_1/E_2)/\ln 2$.`],
          teach: 'Halving the spacing divides an order-p error by 2ᵖ, so p = log₂ of the error ratio.',
          explain: t`$E_1/E_2 = ${r3(e1 / e2)}$, so $p = \log_2 ${r3(e1 / e2)} = ${ans.toFixed(2)}$ — order ${p}, give or take the scatter real measurements have.`,
        };
      },
    }),
    num({
      id: 'predict', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2, 4]), E = r.pick([0.04, 6e-3, 1.5e-3]), f = r.pick([2, 3, 4]);
        const ans = E / f ** p;
        return {
          prompt: t`An order-${p} scheme has a largest error of $${tex(E, 2)}$ on a grid with $N = 100$. Assuming it is in its asymptotic range, what error do you expect with $N = ${100 * f}$?`,
          visual: { type: 'graph', params: loglog({ x: [1.8, 2.8], y: [Math.log10(ans) - 0.6, Math.log10(E) + 0.6], curves: [{ fn: `${r3(Math.log10(E))} - ${p}*(x - 2)`, color: 'ink3', dash: [5, 4], width: 1.4 }], points: [{ x: 2, y: r3(Math.log10(E)), color: 'accent', r: 6 }] }), caption: t`The known run and a line of slope $-${p}$ through it.` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: E / f, feedback: t`Divide by the refinement factor to the power $p$: $${f}^{${p}}$.` }, { value: E / 2 ** p, feedback: t`The grid is refined by ${f}, not 2.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$E \propto \Delta x^p \propto N^{-p}$.`, t`$E_{\text{new}} = E\,/\,${f}^{${p}}$.`],
          teach: 'In the asymptotic range, refining by a factor f divides an order-p error by fᵖ.',
          explain: t`$${tex(E, 2)}/${f}^{${p}} = ${tex(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'self-conv', difficulty: 3,
      gen(r) {
        const S = r.pick(SELF), [a, b, c] = S.f;
        const Q = (a - b) / (b - c), p = Math.log2(Q);
        return {
          prompt: t`Without the exact solution you can still measure the order from three runs: with $f_h$ the result on spacing $h$, $Q = (f_h - f_{h/2})/(f_{h/2} - f_{h/4}) \approx 2^p$. Lax–Wendroff gives the value of $u$ at $x = ${S.xq}$ m after one lap as $${a.toFixed(6)}$, $${b.toFixed(6)}$ and $${c.toFixed(6)}$ with $N = 100$, 200 and 400. What order does this indicate?`,
          visual: { type: 'graph', params: { x: [0.5, 3.5], y: [Math.min(a, b, c) - 0.2 * Math.abs(a - c), Math.max(a, b, c) + 0.2 * Math.abs(a - c)], aspect: 'wide', axesAt: 'edge', xlabel: 'run (N = 100, 200, 400)', ylabel: 'u', xticks: 3, curves: [], points: [a, b, c].map((v, i) => ({ x: i + 1, y: +v.toFixed(6), color: 'good', r: 6 })) }, caption: 'The three results: successive differences shrink by a constant factor once the runs are in the asymptotic range.' },
          answer: p, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: Q, feedback: t`$Q$ is $2^p$; take $\log_2 Q$.` }, { value: Math.log2((a - c) / (b - c)), feedback: t`Use successive differences: $(f_h - f_{h/2})/(f_{h/2} - f_{h/4})$.` }],
          hints: [t`$f_h - f_{h/2} = ${(a - b).toFixed(6)}$ and $f_{h/2} - f_{h/4} = ${(b - c).toFixed(6)}$.`, t`$Q = ${r3(Q)}$, so $p = \log_2 Q$.`],
          teach: t`Self-convergence: if $f_h = f + Ch^p$, successive differences shrink by $2^p$ — no exact solution needed.`,
          explain: t`$Q = ${(a - b).toFixed(6)}/${(b - c).toFixed(6)} = ${r3(Q)}$, so $p = \log_2 ${r3(Q)} = ${p.toFixed(2)}$: second order. Richardson’s estimate of the finest run’s own error is then $(f_{h/2} - f_{h/4})/(2^p - 1) \approx ${tex((b - c) / (Q - 1), 2)}$ — and its true error, against the exact solution, is $${tex(Math.abs(exact({ eq: 'advect', profile: 'gauss', w: 1.5 }, S.xq, 10) - c), 2)}$.`,
        };
      },
    }),
    mcq({
      id: 'lax', difficulty: 2,
      prompt: t`Which statement is the Lax equivalence theorem?`,
      visual: { type: 'graph', params: loglog({ points: NS.map((N, i) => ({ x: r3(Math.log10(N)), y: r3(Math.min(YTOP, Math.log10(ERR[1][3][i]))), color: 'bad', r: 5, hollow: Math.log10(ERR[1][3][i]) > YTOP })).concat(NS.map((N, i) => ({ x: r3(Math.log10(N)), y: r3(Math.log10(ERR[1][1][i])), color: 'good', r: 5 }))) }), caption: 'Two consistent schemes, refined: Lax–Wendroff (green) converges; FTCS (red, hollow when off the scale) does not.' },
      choices: ['For a consistent scheme for a well-posed linear initial-value problem, stability is equivalent to convergence', 'Every consistent scheme converges', 'Every stable scheme converges', 'A scheme converges at the order of its truncation error, whatever its stability'],
      answer: 0,
      why: { 1: 'FTCS for advection is consistent (second order in space) and diverges: it is unstable.', 2: t`A stable scheme for the wrong equation converges to the wrong answer — the scheme $u_j^{n+1} = u_j^n$ is perfectly stable. Consistency is needed too.`, 3: 'An unstable scheme does not converge at any order; with stability, the order of a smooth problem’s error does follow the truncation error.' },
      hints: ['It has two hypotheses besides linearity and well-posedness. The FTCS points in the picture break one of them.'],
      teach: 'Consistency + stability ⇔ convergence, for linear well-posed problems (Lax–Richtmyer).',
      explain: t`Consistency alone is not enough (FTCS), and stability alone is not enough (a stable scheme for the wrong PDE). Together, for a well-posed linear problem, they are equivalent to convergence — which turns a question about the infinite limit $\Delta x \to 0$ into two checks you can do: a Taylor series and von Neumann’s $|G| \le 1$.`,
    }),
    multi({
      id: 'measured-wrong', difficulty: 2,
      prompt: t`A student’s second-order scheme shows a measured order of 1.3. Which of these could explain it? (Select all that apply.)`,
      visual: { type: 'graph', params: loglog({ points: NS.map((N, i) => ({ x: r3(Math.log10(N)), y: r3(Math.log10(ERR[0][1][i])), color: 'good', r: 5 })) }), caption: 'Lax–Wendroff on a narrow bump: the coarse grids are not yet in the asymptotic range, and the slope between successive pairs keeps changing.' },
      choices: ['the grids are too coarse to be in the asymptotic range', 'the runs were compared at slightly different final times', 'the initial data have a jump, which no scheme can resolve to second order', 'a second-order scheme gives order 2 on every grid', 'the time step was chosen too small'],
      answer: [0, 1, 2],
      why: { 3: 'The power law is an asymptotic statement; on coarse grids higher-order error terms still matter.', 4: 'A smaller time step at fixed Δx only reduces the time error; it cannot lower the measured order below the scheme’s.' },
      hints: ['Think about when E ≈ CΔxᵖ is a good description, and what else changes between the runs.', 'If the final times differ by one step’s worth, the comparison includes a first-order time offset.'],
      teach: 'A measured order is only meaningful in the asymptotic range, at matching times, for smooth enough data.',
      explain: t`On coarse grids the neglected terms ($\Delta x^3$ and up) are not small (the picture’s first slopes: ${NS.slice(0, 4).map((_, i) => r3(ord(ERR[0][1], i))).join(', ')}). If the step count is rounded so the final times differ, part of the “error” is a time offset of order $\Delta t$. And a jump in the data limits every scheme to less than first order in the largest error.`,
    }),
    code({
      id: 'measured-order', difficulty: 3,
      prompt: t`Measure Lax–Wendroff’s order. Write \`lw(u, nu)\`: $u_j^{n+1} = u_j - \tfrac12\nu(u_{j+1} - u_{j-1}) + \tfrac12\nu^2(u_{j+1} - 2u_j + u_{j-1})$ on a periodic grid. \`error(N)\` (given) carries the bump once round the 10 m ring at $\nu = 0.5$ and returns the largest error. Set \`errs\` to the errors for $N = 100, 200, 400$ and \`orders\` to the two measured orders.`,
      starter: t`import numpy as np

def lw(u, nu):
    pass

def error(N, nu=0.5, w=1.5):
    x = np.arange(N) * (10.0 / N)
    u0 = np.exp(-(x - 5.0)**2 / w**2)
    u = u0.copy()
    for n in range(round(N / nu)):      # exactly one lap: N cells at nu cells per step
        u = lw(u, nu)
    return np.max(np.abs(u - u0))

errs = []
orders = []
print(errs, orders)
`,
      answer: t`import numpy as np

def lw(u, nu):
    up, um = np.roll(u, -1), np.roll(u, 1)
    return u - 0.5 * nu * (up - um) + 0.5 * nu**2 * (up - 2 * u + um)

def error(N, nu=0.5, w=1.5):
    x = np.arange(N) * (10.0 / N)
    u0 = np.exp(-(x - 5.0)**2 / w**2)
    u = u0.copy()
    for n in range(round(N / nu)):      # exactly one lap: N cells at nu cells per step
        u = lw(u, nu)
    return np.max(np.abs(u - u0))

errs = [error(N) for N in (100, 200, 400)]
orders = [np.log2(errs[i] / errs[i + 1]) for i in range(2)]
print(errs, orders)`,
      tests: [
        { name: t`the error at $N = 100$ is about $${tex(LW[2], 3)}$`, code: `len(errs) == 3 and abs(errs[0] - ${LW[2]}) < 2e-4` },
        { name: 'both measured orders are 2.00 to within 0.03', code: 'len(orders) == 2 and all(abs(p - 2) < 0.03 for p in orders)' },
      ],
      hints: ['`np.roll(u, -1)` is the right neighbour u[j+1], `np.roll(u, 1)` the left one u[j−1].', '`errs = [error(N) for N in (100, 200, 400)]`.', '`orders = [np.log2(errs[i] / errs[i+1]) for i in range(2)]`.'],
      teach: 'A convergence test is three runs and two logarithms — the cheapest bug detector in scientific computing.',
      explain: t`The errors come out about $${tex(LW[2], 3)}$, $${tex(LW[3], 3)}$, $${tex(LW[4], 3)}$, orders 2.00 and 2.00. Comparing after an exact whole lap matters: it puts every run at the same final time, where the exact solution is simply the start. Had a typo made the scheme first order, this test would have caught it at once.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nr', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([4, 6, 8]), d2 = r.pick([0.004, 0.01, 0.025]);
        const jitter = r.pick([0.95, 1, 1.06]);
        const d1 = d2 * 2 ** p * jitter, ans = Math.log2(d1 / d2);
        return {
          prompt: t`A numerical-relativity group simulates a binary black-hole merger at three resolutions, each grid spacing half the last. At merger, the gravitational-wave phase differs by $${r3(d1)}$ rad between the coarse and medium runs and by $${r3(d2)}$ rad between the medium and fine runs. What convergence order does this indicate?`,
          visual: { type: 'graph', params: { x: [-60, 20], y: [-1.3, 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'time from merger (M)', ylabel: 'strain', yticks: 0, curves: [{ fn: '(0.3 + 0.7*step(x + 60)*(x + 60)/60)*cos(0.02*(x + 60)^1.6)*step(-x) + step(x)*exp(-x/6)*cos(0.02*60^1.6 + 0.55*x)', color: 'accent', width: 1.8, samples: 2000 }, { fn: '(0.3 + 0.7*step(x + 60)*(x + 60)/60)*cos(0.02*(x + 60)^1.6 + 0.25)*step(-x) + step(x)*exp(-x/6)*cos(0.02*60^1.6 + 0.25 + 0.55*x)', color: 'warn', width: 1.2, dash: [4, 3], samples: 2000 }] }, caption: 'Two resolutions of a chirp-like waveform drifting apart in phase (schematic, not a real simulation).' },
          answer: ans, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: d1 / d2, feedback: t`That ratio is $Q = 2^p$; the order is $\log_2 Q$.` }, { value: Math.log10(d1 / d2), feedback: 'The spacing halves each time: use log₂.' }],
          hints: [t`$Q = (\phi_h - \phi_{h/2})/(\phi_{h/2} - \phi_{h/4}) = ${r3(d1)}/${r3(d2)}$.`, t`$p = \log_2 Q$.`],
          teach: 'Self-convergence turns three resolutions into a measured order — the standard check on numerical-relativity waveforms.',
          explain: t`$Q = ${r3(d1)}/${r3(d2)} = ${r3(d1 / d2)}$, so $p = \log_2 Q = ${ans.toFixed(2)}$. Production codes use high-order finite differences, so orders of 4 to 8 are typical — provided all three runs are in the asymptotic range. Richardson’s estimate of the finest run’s remaining phase error is then $${r3(d2)}/(2^{${Math.round(ans)}} - 1) \approx ${tex(d2 / (2 ** Math.round(ans) - 1), 2)}$ rad.`,
        };
      },
    }),
    num({
      id: 'cp-grid', difficulty: 2,
      gen(r) {
        const p = r.pick([1, 2, 4]), E = r.pick([0.02, 0.005]), target = r.pick([1e-4, 1e-5]);
        const N = 100 * (E / target) ** (1 / p);
        return {
          prompt: t`An order-${p} scheme has error $${tex(E, 2)}$ at $N = 100$. Roughly how many grid points does it need for an error of $${tex(target, 1)}$?`,
          visual: { type: 'graph', params: loglog({ x: [1.8, 6.2], y: [Math.log10(target) - 0.5, Math.log10(E) + 0.5], curves: [{ fn: `${r3(Math.log10(E))} - ${p}*(x - 2)`, color: 'ink3', dash: [5, 4], width: 1.4 }], hlines: [{ y: r3(Math.log10(target)), color: 'gold', label: 'target' }], points: [{ x: 2, y: r3(Math.log10(E)), color: 'accent', r: 6 }] }), caption: t`The known run, a slope $-${p}$ line through it, and the target error (gold).` },
          answer: N, tol: { rel: 0.02 },
          errors: [{ value: 100 * (E / target), feedback: t`That is right only for first order: $N \propto E^{-1/p}$, so take the ${p === 2 ? 'square' : 'fourth'} root of the error ratio.` }, { value: 100 * (E / target) ** p, feedback: t`Invert the power law: $N = 100\,(E/E_{\text{target}})^{1/p}$.` }].filter((e) => Math.abs(e.value - N) > 0.05 * N),
          hints: [t`$E \propto N^{-p}$, so $N_{\text{target}} = 100\,(E/E_{\text{target}})^{1/p}$.`],
          teach: 'Higher order pays off most when high accuracy is needed: N grows as the 1/p power of the accuracy demanded.',
          explain: t`$N = 100\,(${tex(E, 2)}/${tex(target, 1)})^{1/${p}} \approx ${tex(N, 3)}$. ${p === 1 ? 'A first-order scheme needs a huge grid for high accuracy.' : t`Compare a first-order scheme: $${tex(100 * (E / target), 2)}$ points.`}`,
        };
      },
    }),
    mcq({
      id: 'cp-constraint', difficulty: 2,
      prompt: t`A relativity code should, in exact arithmetic, keep a constraint quantity $C$ at zero. Run at three resolutions, it shows $\max|C| = 4.0\times10^{-3}$, $2.5\times10^{-4}$ and $1.6\times10^{-5}$. What do you conclude?`,
      visual: { type: 'graph', params: loglog({ x: [1.9, 2.7], y: [-5.2, -2], points: [[2, 4e-3], [2.30103, 2.5e-4], [2.60206, 1.6e-5]].map(([x, y]) => ({ x: r3(x), y: r3(Math.log10(y)), color: 'bad', r: 6 })) }), caption: 'The constraint violation at three resolutions, on log–log axes.' },
      choices: ['The code is working: the violation converges to zero at fourth order, as a fourth-order scheme’s truncation error should', 'The code has a bug, because the constraint is not exactly zero', 'The code is unstable', 'Nothing can be concluded without the exact solution'],
      answer: 0,
      why: { 1: 'A discrete solution satisfies the continuum constraint only up to truncation error; what matters is that the violation converges away.', 2: 'An unstable code’s violation would grow with resolution, not fall by 16 each time.', 3: 'The exact value of C is known — zero — so the violation itself is the error, and three runs measure its order.' },
      hints: ['Compute the ratios of successive values. What order do they indicate?'],
      teach: 'A constraint that should vanish is a free error measure: it must converge to zero at the scheme’s order.',
      explain: t`Each halving divides $\max|C|$ by 16: $\log_2 16 = 4$. A violation that converges at the scheme’s order is exactly what a correct code shows — the most-used health check in numerical relativity, and the subject of the next module.`,
    }),
  ],
  sources: [LAX, STRIKWERDA, CHOPTUIK, SRC.strauss],
});
