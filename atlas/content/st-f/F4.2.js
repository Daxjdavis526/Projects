// Chebyshev nodes and splines — the analyst's view: choosing the nodes to
// minimise the nodal polynomial (max |ω| = 2⁻ⁿ at the Chebyshev points), the
// resulting error bound and convergence for Runge's function; and the other
// cure, piecewise cubic splines with error O(h⁴) and their end conditions.
// Ephemerides stored as Chebyshev series; thrust-curve data; density tables.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg, equispaced, chebyshev, lagrange, maxErr, omega, omegaExpr, baryExpr, naturalSpline } from './_num.js';

const t = String.raw;
const runge = (x) => 1 / (1 + 25 * x * x);

// a piecewise cubic as a graph expression: on each interval, the cubic through 4 of its own points
function splineExpr(xs, S) {
  return xs.slice(0, -1).map((a, i) => {
    const b = xs[i + 1], ts = [0, 1 / 3, 2 / 3, 1].map((u) => a + (b - a) * u), ys = ts.map(S);
    const cubic = ts.map((tj, j) => `${n12(ys[j])}*${ts.filter((_, k) => k !== j).map((tk) => `(x - (${n12(tk)}))/(${n12(tj - tk)})`).join('*')}`).join(' + ');
    return `step(x - (${n12(a)}))*step((${n12(b)}) - x)*(${cubic})`;
  }).join(' + ');
}

// ── Explore: Runge’s function by three methods ──
const NS = [4, 6, 8, 10, 12, 14, 16, 18, 20];
const KINDS = {
  1: (n) => { const xs = equispaced(n), ys = xs.map(runge); return { xs, ys, expr: baryExpr(xs, ys), p: (x) => lagrange(xs, ys, x) }; },
  2: (n) => { const xs = chebyshev(n), ys = xs.map(runge); return { xs, ys, expr: baryExpr(xs, ys), p: (x) => lagrange(xs, ys, x) }; },
  3: (n) => { const xs = equispaced(n), ys = xs.map(runge), S = naturalSpline(xs, ys); return { xs, ys, expr: splineExpr(xs, S), p: S }; },
};
const FIT = {};
for (const k of [1, 2, 3]) for (const n of NS) { const F = KINDS[k](n); FIT[`${k}-${n}`] = { ...F, err: maxErr(runge, F.p) }; }
const on = (k, n) => `step(0.5 - abs(kind - ${k}))*step(0.5 - abs(n - ${n}))`;

// ── the worked example: the cubic for eˣ on [−1, 1] ──
const XC = chebyshev(3), XE = equispaced(3);
const maxAbs = (g) => { let m = 0; for (let k = 0; k <= 20000; k++) m = Math.max(m, Math.abs(g(-1 + k / 10000))); return m; };
const OMC = maxAbs(omega(XC)), OME = maxAbs(omega(XE));
const ERR_C = maxErr(Math.exp, (x) => lagrange(XC, XC.map(Math.exp), x));
const ERR_E = maxErr(Math.exp, (x) => lagrange(XE, XE.map(Math.exp), x));
const BOUND_C = Math.E / (2 ** 3 * 24);
const fact = (m) => { let f = 1; for (let k = 2; k <= m; k++) f *= k; return f; };

// ── a natural spline of x² on [0, 1] with 4 intervals: its error lives at the ends ──
const Q = equispaced(4, 0, 1), SQ = naturalSpline(Q, Q.map((x) => x * x));
const SQ_ERR = splineExpr(Q, (x) => x * x - SQ(x));

// ── the Moon’s coordinate over a short interval (circular-orbit model) ──
const R_MOON = 3.844e8, OMEGA_MOON = (2 * Math.PI) / (27.32 * 86400);

export default lesson({
  id: 'st-f.F4.2',
  title: 'Chebyshev nodes and splines',
  minutes: 13, difficulty: 3,
  intro: t`The interpolation error is $\frac{f^{(n+1)}(\xi)}{(n+1)!}\,\omega(x)$, and only $\omega(x) = \prod(x - x_i)$ depends on where the nodes are. So choose them to make $\max\lvert\omega\rvert$ as small as possible. On $[-1, 1]$ the answer is the **Chebyshev points**, the zeros of the Chebyshev polynomial $T_{n+1}(x) = \cos\big((n+1)\arccos x\big)$:

$$x_k = \cos\frac{(2k+1)\pi}{2n+2}, \qquad \max_{[-1,1]}\lvert\omega(x)\rvert = 2^{-n}, \qquad \max\lvert f - p_n\rvert \le \frac{\max\lvert f^{(n+1)}\rvert}{2^n\,(n+1)!}$$

No other choice of nodes does better, and with them Runge’s function converges. When you **cannot** choose the nodes — measured data arrive where they arrive — the other cure is to stop raising the degree: a **cubic spline** joins cubics on each interval so that the whole curve has continuous first and second derivatives, and its error falls like $h^4$ as the spacing $h$ shrinks.`,
  symbols: [
    { tex: t`x_k`, text: 'the Chebyshev points, $k = 0, \\ldots, n$: projections onto the $x$-axis of equally spaced points on a semicircle, so they crowd towards $\\pm1$' },
    { tex: t`T_{n+1}`, text: 'the Chebyshev polynomial of degree $n + 1$; $\\omega(x) = 2^{-n}T_{n+1}(x)$ for these nodes, so all its humps have the same height' },
    { tex: t`2^{-n}`, text: 'the smallest possible $\\max\\lvert\\omega\\rvert$ on $[-1, 1]$; on $[a, b]$ multiply by $\\left(\\tfrac{b-a}{2}\\right)^{n+1}$' },
    { tex: t`f^{(n+1)}`, text: 'the $(n+1)$-th derivative of $f$; its size is the function’s share of the error' },
    { tex: 'h', text: 'for a spline, the spacing between neighbouring knots; a cubic spline’s error is at most $\\tfrac{5}{384}h^4\\max\\lvert f^{(4)}\\rvert$ when its end slopes are right' },
  ],
  why: 'Chebyshev series store the planetary ephemerides that spacecraft navigation uses and are the basis of the spectral methods of F12; splines turn tabulated equations of state, thrust curves and dense ODE output into smooth functions.',
  visual: {
    type: 'graph',
    title: 'Three ways through the same points',
    lead: t`Runge’s function $1/(1 + 25x^2)$ (blue) and an approximation (gold) through $n + 1$ points. Compare equally spaced nodes, Chebyshev nodes and a natural cubic spline as $n$ grows; the readout gives the maximum error.`,
    tasks: [
      'At n = 20: equispaced error near 60 (off the chart), Chebyshev about 0.015, spline about 0.003.',
      'Look at where the Chebyshev nodes sit: crowded near ±1, exactly where equispaced interpolation failed.',
      'Step the spline from n = 12 to 20: the error stops falling by 16 per halving — the natural end conditions are holding it back.',
    ],
    params: {
      x: [-1.08, 1.08], y: [-0.6, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
      choices: [{ key: 'kind', label: 'Method', options: [[1, 'equispaced polynomial'], [2, 'Chebyshev polynomial'], [3, 'natural cubic spline']], value: 2, explain: 'The same function, three ways of passing a smooth curve through n + 1 of its values.' }],
      sliders: [{ key: 'n', label: '$n$ (points − 1)', min: 4, max: 20, step: 2, value: 10, explain: 'The polynomial degree, or for the spline the number of intervals.' }],
      curves: [{ fn: '1/(1 + 25x^2)', color: 'accent', width: 2.4 }, ...[1, 2, 3].flatMap((k) => NS.map((n) => ({ fn: FIT[`${k}-${n}`].expr, color: 'gold', width: 1.9, domain: [-1, 1], when: on(k, n) })))],
      points: [1, 2, 3].flatMap((k) => NS.flatMap((n) => FIT[`${k}-${n}`].xs.map((x, i) => ({ x: n12(x), y: n12(FIT[`${k}-${n}`].ys[i]), r: 3.2, color: 'gold', when: on(k, n) })))),
      readouts: [{ label: 'max error on [−1, 1]', expr: [1, 2, 3].flatMap((k) => NS.map((n) => `${on(k, n)}*${n12(FIT[`${k}-${n}`].err)}`)).join(' + '), digits: 3 }],
    },
    caption: 'Exact interpolants (barycentric form) and natural cubic splines (second derivative zero at both ends); the Chebyshev points are those of the first kind. Errors are measured on a fine grid.',
  },
  example: {
    prompt: t`Approximate $e^x$ on $[-1, 1]$ by a cubic. Compare equally spaced nodes $-1, -\tfrac13, \tfrac13, 1$ with the four Chebyshev points: find $\max\lvert\omega\rvert$ for each, the Chebyshev error bound, and the actual errors.`,
    visual: {
      type: 'graph',
      params: { x: [-1.05, 1.05], y: [-0.22, 0.22], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'ω(x)',
        curves: [{ fn: omegaExpr(XE), color: 'warn', width: 2, domain: [-1, 1], label: 'equispaced', labelAt: 0.62, labelDx: 6, labelDy: 16 }, { fn: omegaExpr(XC), color: 'accent', width: 2, domain: [-1, 1], label: 'Chebyshev', labelAt: -0.05, labelDx: -30, labelDy: -14 }],
        hlines: [{ y: 0.125, label: '2⁻³', color: 'ink3' }, { y: -0.125, color: 'ink3' }] },
      caption: 'The two nodal polynomials of degree 4. The Chebyshev one (blue) equioscillates between ±1/8; the equispaced one (amber) has larger humps near the ends.',
    },
    steps: [
      { label: 'The nodes', text: t`$x_k = \cos\frac{(2k+1)\pi}{8}$ for $k = 0, 1, 2, 3$: $\pm0.9239$ and $\pm0.3827$. They are the zeros of $T_4(x) = 8x^4 - 8x^2 + 1$.` },
      { label: 'Node factors', text: t`For these nodes $\omega(x) = T_4(x)/8$, so $\max\lvert\omega\rvert = \tfrac18 = 0.125$. For the equispaced nodes $\omega(x) = (x^2 - 1)(x^2 - \tfrac19)$, whose largest hump, at $x^2 = \tfrac59$, is $\tfrac{16}{81} = ${OME.toFixed(4)}$ — ${(OME / OMC).toFixed(2)} times larger.` },
      { label: 'Bound', text: t`$\lvert f^{(4)}\rvert = e^x \le e$, so the Chebyshev cubic errs by at most $\dfrac{e}{2^3\cdot 4!} = ${BOUND_C.toFixed(5)}$.` },
      { label: 'Measure', text: t`On a fine grid the actual maximum errors are $${ERR_C.toFixed(5)}$ (Chebyshev) and $${ERR_E.toFixed(5)}$ (equispaced): the ratio, ${(ERR_E / ERR_C).toFixed(2)}, is close to the ratio of the node factors.` },
      { label: 'Scale it', text: t`For degree $n$ the bound $e/(2^n(n+1)!)$ falls faster than any power: about $${tex(Math.E / (2 ** 8 * fact(9)), 1)}$ at $n = 8$ and $${tex(Math.E / (2 ** 12 * fact(13)), 1)}$ at $n = 12$. That is why a Chebyshev series of modest degree can represent a smooth quantity — a planet’s coordinate over a few days — to the last digit.` },
    ],
    answer: t`$\max\lvert\omega\rvert = 0.125$ (Chebyshev) against $0.198$ (equispaced); bound $${BOUND_C.toFixed(4)}$; actual errors $${ERR_C.toFixed(4)}$ and $${ERR_E.toFixed(4)}$.`,
  },
  practice: [
    num({
      id: 'cheb-time', difficulty: 1,
      gen(r) {
        const T = r.pick([8, 16, 32]), n = r.pick([7, 9, 11]);
        const ans = T / 2 - (T / 2) * Math.cos(Math.PI / (2 * n + 2));
        return {
          prompt: t`An ephemeris stores one coordinate over an interval of $${T}$ days by its values at the $n + 1 = ${n + 1}$ Chebyshev points, mapped from $[-1, 1]$ onto $[0, ${T}]$ days by $t = \tfrac{${T}}{2} + \tfrac{${T}}{2}s$. How many days after the start of the interval is the **first** sample, $s = -\cos\frac{\pi}{2n+2}$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.15, 1.15], y: [-0.25, 1.15], aspect: 'wide', equal: true, axesAt: 'edge', xlabel: 's', ylabel: '', yticks: 0,
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 3.1416], color: 'ink3', width: 1.4, dash: true }, { fn: '0', color: 'ink4', width: 1, domain: [-1, 1] }],
              points: chebyshev(n).map((s) => ({ x: n12(s), y: 0, r: 4, color: 'gold' })).concat(chebyshev(n).map((s) => ({ x: n12(s), y: n12(Math.sqrt(1 - s * s)), r: 3, color: 'ink3' }))) },
            caption: t`The ${n + 1} Chebyshev points (gold) are the shadows of equally spaced points on a semicircle (grey), so they crowd towards the ends.`,
          },
          answer: ans, units: 'd', tol: { rel: 0.005 },
          errors: [{ value: T / n, feedback: 'Equally spaced samples would start at 0 and step by T/n. Chebyshev points start just inside the end, by T/2 · (1 − cos(π/(2n + 2))).' }],
          hints: [t`$\cos\dfrac{\pi}{${2 * n + 2}} = ${Math.cos(Math.PI / (2 * n + 2)).toFixed(5)}$.`, t`$t = \tfrac{${T}}{2}\left(1 - \cos\tfrac{\pi}{${2 * n + 2}}\right)$.`],
          teach: 'Chebyshev points on [a, b] are (a + b)/2 − ((b − a)/2) cos((2k + 1)π/(2n + 2)): dense near both ends, sparse in the middle.',
          explain: t`$t = ${T / 2}\left(1 - ${Math.cos(Math.PI / (2 * n + 2)).toFixed(5)}\right) = ${ans.toFixed(4)}$ d — about $${(ans * 24).toFixed(1)}$ hours in, while equispaced samples would be $${(T / n).toFixed(2)}$ days apart. The gaps near the ends are about $${(((1 - Math.cos(3 * Math.PI / (2 * n + 2))) - (1 - Math.cos(Math.PI / (2 * n + 2)))) * T / 2).toFixed(2)}$ d; in the middle about $${((Math.sin(Math.PI / (n + 1))) * T / 2).toFixed(2)}$ d.`,
        };
      },
    }),
    num({
      id: 'cheb-degree', difficulty: 2,
      gen(r) {
        const k = r.pick([4, 6, 8, 10, 12]);
        let n = 1; while (Math.E / (2 ** n * fact(n + 1)) >= 10 ** -k) n++;
        return {
          prompt: t`What is the smallest degree $n$ for which the Chebyshev bound $\dfrac{e}{2^n(n+1)!}$ guarantees $\lvert e^x - p_n(x)\rvert < 10^{-${k}}$ on all of $[-1, 1]$?`,
          visual: {
            type: 'graph',
            params: { x: [0.5, 13.5], y: [-16, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'degree n', ylabel: 'bound',
              points: Array.from({ length: 13 }, (_, i) => ({ x: i + 1, y: n12(lg(Math.E / (2 ** (i + 1) * fact(i + 2)))), r: 4, color: 'accent' })),
              hlines: [{ y: -k, label: `10⁻${String(k).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`, color: 'gold' }] },
            caption: 'The Chebyshev error bound for eˣ against the degree (logarithmic axis): it falls faster than geometrically.',
          },
          answer: n, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n + 1, feedback: 'Check the degree below: its bound may already be under the target.' }, { value: n - 1, feedback: 'At that degree the bound is still above the target.' }],
          hints: [t`Tabulate $e/(2^n(n+1)!)$: $n = 4$ gives $1.4\times10^{-3}$, $n = 6$ gives $8.4\times10^{-6}$.`, t`Keep going until it drops below $10^{-${k}}$; the picture shows the same numbers.`],
          teach: 'For entire functions such as eˣ the Chebyshev bound falls super-geometrically, so a few more degrees buy many more digits.',
          explain: t`At $n = ${n}$ the bound is $${tex(Math.E / (2 ** n * fact(n + 1)), 2)} < 10^{-${k}}$, while at $n = ${n - 1}$ it is $${tex(Math.E / (2 ** (n - 1) * fact(n)), 2)}$. So degree ${n} suffices — on equispaced nodes the bound would carry a node factor several times larger.`,
        };
      },
    }),
    mcq({
      id: 'why-ends', difficulty: 2,
      prompt: t`Why are the Chebyshev points crowded near the ends of the interval?`,
      visual: {
        type: 'graph',
        params: { x: [-1.05, 1.05], y: [-0.03, 0.03], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'ω(x)',
          curves: [{ fn: omegaExpr(equispaced(8)), color: 'warn', width: 1.8, domain: [-1, 1] }, { fn: omegaExpr(chebyshev(8)), color: 'accent', width: 2, domain: [-1, 1] }],
          legend: [{ label: 'equispaced, 9 nodes', color: 'warn' }, { label: 'Chebyshev, 9 nodes', color: 'accent' }], legendAt: 'tr' },
        caption: 'The nodal polynomials for nine nodes. The equispaced one is cut off by the frame near the ends; the Chebyshev one stays within ±2⁻⁸.',
      },
      choices: [
        'Moving nodes towards the ends shrinks the end humps of ω and grows the middle ones until all are equal — and equal humps give the smallest possible maximum',
        'Functions change fastest near the ends of any interval',
        'Round-off is larger near the ends, so more samples are needed there',
        'It makes the polynomial’s coefficients easier to compute',
      ],
      answer: 0,
      why: {
        1: 'The node placement does not depend on f at all — it minimises the node factor for every function at once.',
        2: 'Rounding has nothing to do with it; the argument is exact.',
        3: 'Chebyshev interpolants are best evaluated in barycentric form, not through monomial coefficients.',
      },
      hints: ['Look at the equispaced ω: where are its largest humps?', 'A node pulls ω towards zero around it. Where would you add pull?'],
      teach: 'The Chebyshev points equalise the humps of the nodal polynomial (equioscillation), which is what minimises its maximum.',
      explain: t`For the Chebyshev points $\omega = 2^{-n}T_{n+1}$ and $T_{n+1}(\cos\theta) = \cos((n+1)\theta)$ swings between $\pm1$: every hump has height $2^{-n}$. Chebyshev proved that no monic polynomial of degree $n + 1$ has a smaller maximum on $[-1, 1]$.`,
    }),
    num({
      id: 'spline-scaling', difficulty: 2,
      gen(r) {
        const N1 = r.pick([10, 20, 25]), m = r.pick([2, 3, 4]);
        const N2 = N1 * m, E1 = r.pick([2e-5, 6e-6, 1.5e-4]);
        const ans = E1 / m ** 4;
        return {
          prompt: t`A cubic spline through $${N1}$ equal intervals of a smooth function has maximum error $${tex(E1, 2)}$ (with correct end conditions, so the error scales as $h^4$). What error do you expect with $${N2}$ intervals?`,
          visual: {
            type: 'graph',
            params: { x: [0.8, 2.2], y: [-10, -2], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'number of intervals', ylabel: 'max error',
              curves: [{ fn: `${n12(lg(E1) + 4 * lg(N1))} - 4x`, color: 'accent', width: 2, domain: [0.9, 2.15] }],
              points: [{ x: n12(lg(N1)), y: n12(lg(E1)), r: 5, color: 'gold', label: `${N1} intervals`, labelDx: 8, labelDy: -10 }] },
            caption: 'Error against the number of intervals on log–log axes: a straight line of slope −4.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: E1 / m ** 2, feedback: 'That is h² scaling. A cubic spline with good end conditions is fourth order.' }, { value: E1 / m, feedback: 'The error falls as h⁴, not h.' }],
          hints: [t`The spacing shrinks by a factor of $${m}$.`, t`Error $\propto h^4$: divide by $${m}^4 = ${m ** 4}$.`],
          teach: 'A cubic spline’s error scales as h⁴: double the number of knots and the error falls 16-fold — without ever raising the degree.',
          explain: t`$${tex(E1, 2)}/${m}^4 = ${tex(ans, 3)}$. A single polynomial through $${N2 + 1}$ equally spaced points could instead diverge, as Runge showed.`,
        };
      },
    }),
    mcq({
      id: 'natural-ends', difficulty: 3,
      prompt: t`A **natural** cubic spline sets $S'' = 0$ at both ends. Fitting $f(x) = x^2$ on $[0, 1]$ with 4 intervals, its error is as in the picture: about $6\times10^{-3}$ in the two end intervals and several times smaller inside. What is going on?`,
      visual: {
        type: 'graph',
        params: { x: [-0.03, 1.03], y: [-0.007, 0.002], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'x² − S(x)',
          curves: [{ fn: SQ_ERR, color: 'accent', width: 2.2, domain: [0, 1] }],
          points: Q.map((x) => ({ x: n12(x), y: 0, r: 4, color: 'gold' })) },
        caption: 'The error of the natural spline through x² at five equally spaced knots (gold).',
      },
      choices: [
        'f″ = 2 at the ends, but the natural spline forces S″ = 0 there: the wrong end condition costs accuracy near the ends (only O(h²) there)',
        'The spline has too few knots in the middle',
        'Round-off error accumulates towards the ends',
        'Cubic splines cannot represent a quadratic',
      ],
      answer: 0,
      why: {
        1: 'The error is largest next to the ends and decays inwards; the interior knots are not the problem.',
        2: 'The errors are thousands of times larger than any rounding.',
        3: 'A spline with the right end conditions (clamped with the true slopes, or not-a-knot) reproduces x² exactly.',
      },
      hints: ['Compare S″ = 0 with the true second derivative of x² at x = 0 and x = 1.', 'The “natural” condition is natural for a bent ruler free at its ends, not for every function.'],
      teach: 'End conditions matter: a natural spline imposes S″ = 0, which is wrong unless f″ vanishes at the ends; clamped or not-a-knot conditions keep the full h⁴ accuracy.',
      explain: t`The forced $S'' = 0$ bends the end intervals away from $x^2$ and the error decays towards the middle. SciPy’s \`CubicSpline\` uses the **not-a-knot** condition by default (the first two pieces are one cubic), which restores order 4; a clamped spline needs the true end slopes. The same end effect is why the natural spline of Runge’s function in the Explore stops improving 16-fold per halving.`,
    }),
    code({
      id: 'spline-order', difficulty: 2,
      prompt: t`Measure the order of SciPy’s \`CubicSpline\` (not-a-knot ends). For $f(x) = \sin(3x)$ on $[0, 2]$, build splines through $N + 1$ equally spaced points for $N = 10, 20, 40, 80$, measure each maximum error on 4001 points, store them in the list \`errs\`, and set \`orders\` to $\log_2(E_N/E_{2N})$ for the three successive pairs.`,
      starter: t`import numpy as np
from scipy.interpolate import CubicSpline

f = lambda x: np.sin(3 * x)
grid = np.linspace(0, 2, 4001)
errs = []
for N in [10, 20, 40, 80]:
    pass   # knots, spline, maximum error

orders = []
print(errs)
print(orders)
`,
      answer: t`import numpy as np
from scipy.interpolate import CubicSpline

f = lambda x: np.sin(3 * x)
grid = np.linspace(0, 2, 4001)
errs = []
for N in [10, 20, 40, 80]:
    x = np.linspace(0, 2, N + 1)
    S = CubicSpline(x, f(x))
    errs.append(np.max(np.abs(S(grid) - f(grid))))

orders = [np.log2(errs[i] / errs[i + 1]) for i in range(3)]
print(errs)
print(orders)`,
      tests: [
        { name: 'four errors, each smaller than the last', code: 'len(errs) == 4 and all(errs[i] > errs[i + 1] for i in range(3))' },
        { name: 'the observed order approaches 4', code: 'abs(orders[-1] - 4) < 0.3' },
        { name: t`with 80 intervals the error is below $10^{-6}$`, code: 'errs[-1] < 1e-6' },
      ],
      hints: ['Inside the loop: x = np.linspace(0, 2, N + 1); S = CubicSpline(x, f(x)).', 'The error is np.max(np.abs(S(grid) − f(grid))); the orders are np.log2(errs[i] / errs[i + 1]).'],
      teach: 'Halving the spacing and comparing errors measures the order directly: log₂ of the error ratio.',
      explain: 'The orders come out close to 4, as the theory predicts for a not-a-knot spline. Switch to `bc_type="natural"` and the order drops towards 2 for sin(3x), whose second derivative is not zero at x = 2 — the end condition is part of the method.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([6, 8, 10]), T = 4;
        const half = (OMEGA_MOON * T * 86400) / 2;
        const ans = (R_MOON * half ** (n + 1)) / (2 ** n * fact(n + 1));
        return {
          prompt: t`An ephemeris represents one coordinate of the Moon, $x(t) \approx R\cos\Omega t$ with $R = 384\,400$ km and $\Omega = 2\pi/27.32\ \text{d}$, over a $${T}$-day interval by its degree-$${n}$ interpolant at Chebyshev points. Mapping $[-1, 1]$ onto the interval, the bound becomes $\dfrac{R\,(\Omega T/2)^{n+1}}{2^n(n+1)!}$. Evaluate it, in metres.`,
          visual: {
            type: 'graph',
            params: { x: [0, 27.32], y: [-1.2, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'time (days)', ylabel: 'x / R',
              curves: [{ fn: `cos(2*pi*x/27.32)`, color: 'accent', width: 2 }],
              shade: [{ fn: 'cos(2*pi*x/27.32)', from: 10, to: 10 + T, color: 'gold', alpha: 0.35 }] },
            caption: t`One lunar orbit of the model coordinate; the shaded ${T}-day window is one interval of the ephemeris. (A circular orbit: the real Moon’s eccentricity and perturbations make its derivatives somewhat larger.)`,
          },
          answer: ans, units: 'm', tol: { rel: 0.02 },
          errors: [{ value: (R_MOON * half ** (n + 1)) / fact(n + 1), feedback: t`You left out the Chebyshev factor $2^{-n}$ — the whole point of the node choice.` }],
          hints: [t`$\Omega T/2 = \dfrac{2\pi}{27.32\ \text{d}}\cdot\dfrac{${T}\ \text{d}}{2} = ${half.toFixed(4)}$, a pure number.`, t`Then $R\cdot${half.toFixed(4)}^{${n + 1}}/(2^{${n}}\cdot${n + 1}!)$ with $R = 3.844\times10^{8}$ m.`],
          teach: 'For a smooth periodic motion sampled over a fraction of its period, Chebyshev interpolation converges like (ΩT/4)ⁿ⁺¹/(n + 1)!: each degree buys about an order of magnitude.',
          explain: t`$\dfrac{3.844\times10^{8} \times ${half.toFixed(4)}^{${n + 1}}}{2^{${n}}\times${fact(n + 1)}} = ${tex(ans, 2)}$ m. Ephemerides such as JPL’s store exactly such Chebyshev coefficients for each body over fixed intervals, so a spacecraft’s software evaluates a short series instead of integrating the solar system.`,
        };
      },
    }),
    mcq({
      id: 'cp-thrust', difficulty: 2, transfer: true,
      prompt: t`A static test of a solid rocket motor records thrust every 0.05 s for 2.5 s — 51 equally spaced samples. You need a smooth thrust curve $F(t)$ for a trajectory code. What should you use?`,
      visual: {
        type: 'graph',
        params: { x: [-0.1, 2.7], y: [-2, 30], aspect: 'wide', axesAt: 'edge', xlabel: 't (s)', ylabel: 'thrust (kN)',
          points: Array.from({ length: 51 }, (_, k) => { const tt = k * 0.05; const F = tt < 0.15 ? 160 * tt : tt < 2.2 ? 24 + 2 * Math.sin(3 * tt) - 1.5 * tt : Math.max(0, (24 + 2 * Math.sin(6.6) - 3.3) * (2.5 - tt) / 0.3); return { x: n12(tt), y: n12(F), r: 3, color: 'accent' }; }) },
        caption: 'Schematic thrust data at 51 equally spaced times: a sharp ignition rise, a sustained burn and a tail-off.',
      },
      choices: [
        'A cubic spline (or a shape-preserving piecewise cubic): local, fourth order on smooth stretches, and no Runge oscillation',
        'The degree-50 polynomial through all 51 samples',
        'The Chebyshev interpolant of degree 50',
        'A degree-50 polynomial fitted with np.polyfit',
      ],
      answer: 0,
      why: {
        1: 'Equally spaced nodes at degree 50: Runge’s phenomenon, oscillations of enormous size near the ends.',
        2: 'Chebyshev interpolation needs samples at the Chebyshev points; these data are where the test stand put them.',
        3: 'The same doomed polynomial, now also computed from an ill-conditioned Vandermonde system.',
      },
      hints: ['Can you choose where the samples are?', 'If not, keep the degree low and work piece by piece.'],
      teach: 'When the data points are given, not chosen, use piecewise low-degree interpolation: splines are the default, shape-preserving cubics when overshoot must be avoided.',
      explain: 'A spline uses only nearby samples, so the sharp ignition does not disturb the smooth burn, and its error is O(h⁴) where the curve is smooth. Near the abrupt ignition and tail-off a shape-preserving cubic (scipy.interpolate.PchipInterpolator) avoids the small overshoots a spline can add at a corner.',
    }),
    num({
      id: 'cp-density-table', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([4, 6, 8]);
        const H = 7;
        const h = H * Math.pow((384 * 10 ** -k) / 5, 0.25);
        const ans = Math.ceil(100 / h);
        return {
          prompt: t`A re-entry code tabulates $\rho(z) = \rho_0e^{-z/H}$ ($H = 7$ km) from 0 to 100 km and reads it with a clamped cubic spline, whose error is at most $\tfrac{5}{384}h^4\max\lvert\rho^{(4)}\rvert$. Since $\lvert\rho^{(4)}\rvert = \rho/H^4$, the **relative** error is at most $\tfrac{5}{384}(h/H)^4$. How many equal intervals are needed to keep it below $10^{-${k}}$?`,
          visual: {
            type: 'graph',
            params: { x: [0, 100], y: [-6.8, 0.4], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'altitude z (km)', ylabel: 'ρ / ρ₀',
              curves: [{ fn: `-x/(7*ln(10))`, color: 'accent', width: 2 }] },
            caption: 'The exponential model atmosphere on a logarithmic axis (real density departs from it by tens of percent, and varies with solar activity).',
          },
          answer: ans, tol: { rel: 0, abs: 1 },
          errors: [{ value: Math.ceil(100 / (H * Math.pow(10 ** -k, 0.25))), feedback: t`Keep the constant: solve $\tfrac{5}{384}(h/H)^4 \le 10^{-${k}}$ for $h$.` }],
          hints: [t`$h \le H\left(\dfrac{384}{5}\times10^{-${k}}\right)^{1/4}$.`, t`That gives $h = ${h.toFixed(3)}$ km; divide 100 km by it and round up.`],
          teach: 'An h⁴ error bound turns an accuracy target into a table size: each extra factor of 10 in accuracy costs only a factor $10^{1/4} \\approx 1.8$ in entries.',
          explain: t`$h = 7\ \text{km}\times(76.8\times10^{-${k}})^{1/4} = ${h.toFixed(3)}$ km, so $${ans}$ intervals. Linear interpolation, with error $h^2/(8H^2)$ relative, would need about $${Math.ceil(100 / (H * Math.sqrt(8 * 10 ** -k)))}$ for the same target.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Trefethen (2019), Approximation Theory and Approximation Practice, extended ed., SIAM, ch. 2–5, 8 (Chebyshev points, convergence)', url: 'https://doi.org/10.1137/1.9781611975949' },
    { label: 'de Boor (2001), A Practical Guide to Splines, revised ed., Springer (error bounds and end conditions)', url: 'https://openlibrary.org/search?q=A+Practical+Guide+to+Splines+de+Boor' },
    { label: 'Park et al. (2021), The JPL Planetary and Lunar Ephemerides DE440 and DE441, Astronomical Journal 161, 105 (Chebyshev coefficients)', url: 'https://doi.org/10.3847/1538-3881/abd414' },
    { label: 'SciPy documentation: scipy.interpolate.CubicSpline', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.CubicSpline.html' },
  ],
});
