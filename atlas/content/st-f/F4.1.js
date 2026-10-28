// Polynomial interpolation and Runge's phenomenon — the analyst's view:
// existence and uniqueness, the Lagrange form, the error formula
// f − pₙ = f⁽ⁿ⁺¹⁾(ξ)/(n+1)! · ∏(x − xᵢ) and what each factor does, why
// equispaced high-degree interpolation of 1/(1 + 25x²) diverges, and
// interpolating satellite ephemerides.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg, seg, equispaced, lagrange, maxErr, omega, omegaExpr, baryExpr } from './_num.js';

const t = String.raw;
const DEG = Math.PI / 180;

// ── Runge's function and a gentle one, interpolated at equispaced nodes on [−1, 1] ──
const FUNCS = { 1: { f: (x) => 1 / (1 + 25 * x * x), expr: '1/(1 + 25x^2)' }, 2: { f: (x) => 1 / (1 + x * x), expr: '1/(1 + x^2)' } };
const NS = [2, 4, 6, 8, 10, 12, 14, 16];
const INTERP = {};
for (const k of [1, 2]) for (const n of NS) {
  const xs = equispaced(n), ys = xs.map(FUNCS[k].f);
  INTERP[`${k}-${n}`] = { xs, ys, expr: baryExpr(xs, ys), err: maxErr(FUNCS[k].f, (x) => lagrange(xs, ys, x)) };
}
const RUNGE_ERR = Object.fromEntries([10, 20].map((n) => { const xs = equispaced(n), ys = xs.map(FUNCS[1].f); return [n, maxErr(FUNCS[1].f, (x) => lagrange(xs, ys, x))]; }));

// ── the worked example: a sine table at 0°, 30°, 60°, 90°, read at 45° ──
const TX = [0, 30, 60, 90].map((d) => d * DEG), TY = TX.map(Math.sin);
const P45 = lagrange(TX, TY, 45 * DEG), S45 = Math.sin(45 * DEG);
const OM45 = Math.abs(omega(TX)(45 * DEG));
const BOUND45 = OM45 / 24;

// ── ten equally spaced epochs: the nodal polynomial inside and four spacings beyond ──
const OM10 = omegaExpr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const W10 = omega([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const W13 = Math.abs(W10(13));
let WIN = 0; for (let k = 0; k <= 18000; k++) WIN = Math.max(WIN, Math.abs(W10(k / 2000)));

// ── GPS orbit (circular approximation) ──
const GM = 3.986004418e14, RGPS = 2.656e7;
const W_GPS = Math.sqrt(GM / RGPS ** 3);

export default lesson({
  id: 'st-f.F4.1',
  title: 'Polynomial interpolation and Runge’s phenomenon',
  minutes: 13, difficulty: 3,
  intro: t`Through $n + 1$ points $(x_i, y_i)$ with distinct $x_i$ there passes **exactly one** polynomial $p_n$ of degree at most $n$; in Lagrange’s form $p_n(x) = \sum_i y_i L_i(x)$, where $L_i$ is the degree-$n$ polynomial that is 1 at $x_i$ and 0 at every other node. If the data come from a smooth $f$, the error has an exact form, the interpolation analogue of Taylor’s remainder:

$$f(x) - p_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}\,\prod_{i=0}^{n}(x - x_i)$$

The first factor belongs to the function, the second — the **nodal polynomial** — to the nodes alone. For equally spaced nodes the nodal polynomial swells near the ends of the interval, and for some perfectly smooth functions the derivatives grow faster than $(n+1)!$: then **adding points makes things worse**, and the interpolant oscillates wildly near the ends. That is **Runge’s phenomenon**.`,
  symbols: [
    { tex: t`x_0, \ldots, x_n`, text: 'the **nodes**: $n + 1$ distinct points where $f$ is known' },
    { tex: t`p_n(x)`, text: 'the interpolating polynomial, of degree at most $n$, with $p_n(x_i) = f(x_i)$' },
    { tex: t`L_i(x) = \prod_{j \ne i}\frac{x - x_j}{x_i - x_j}`, text: 'the Lagrange basis polynomial for node $i$: 1 at $x_i$, 0 at the others' },
    { tex: t`f^{(n+1)}(\xi)`, text: 'the $(n+1)$-th derivative of $f$ at some unknown $\\xi$ in the interval spanned by $x$ and the nodes' },
    { tex: t`\omega(x) = \prod_{i}(x - x_i)`, text: 'the **nodal polynomial**: zero at every node, and set entirely by where you put them' },
  ],
  why: 'Ephemerides, equation-of-state tables, opacity tables and every dense-output ODE solver interpolate; the error formula tells you how many points to use and where to put them — and the next lesson moves them to where the formula says.',
  visual: {
    type: 'graph',
    title: 'More points, worse fit',
    lead: t`The blue curve is $f$; the gold curve is the polynomial through the $n + 1$ equally spaced nodes (dots). Raise $n$ and watch the middle improve while the ends go wild.`,
    tasks: [
      'With Runge’s function, go from n = 4 to n = 16: the maximum error grows from about 0.44 to about 14.',
      'Switch to 1/(1 + x²), which has the same shape but is “gentler”: now every extra node helps.',
      'At n = 16, look where the error lives: near the ends, where the nodal polynomial is largest.',
    ],
    params: {
      x: [-1.08, 1.08], y: [-1.6, 2.1], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
      choices: [{ key: 'fn', label: 'Function', options: [[1, 'Runge: 1/(1 + 25x²)'], [2, 'gentle: 1/(1 + x²)']], value: 1, explain: 'Both are smooth on [−1, 1]; the difference is hidden in the complex plane, where 1/(1 + 25x²) has poles at ±0.2i, very close to the interval.' }],
      sliders: [{ key: 'n', label: 'Degree $n$', min: 2, max: 16, step: 2, value: 8, explain: 'The interpolant’s degree; it passes through $n + 1$ equally spaced nodes.' }],
      curves: [
        { fn: FUNCS[1].expr, color: 'accent', width: 2.4, when: 'step(0.5 - abs(fn - 1))' }, { fn: FUNCS[2].expr, color: 'accent', width: 2.4, when: 'step(0.5 - abs(fn - 2))' },
        ...[1, 2].flatMap((k) => NS.map((n) => ({ fn: INTERP[`${k}-${n}`].expr, color: 'gold', width: 2, domain: [-1, 1], when: `step(0.5 - abs(fn - ${k}))*step(0.5 - abs(n - ${n}))` }))),
      ],
      points: [1, 2].flatMap((k) => NS.flatMap((n) => INTERP[`${k}-${n}`].xs.map((x, i) => ({ x: n12(x), y: n12(INTERP[`${k}-${n}`].ys[i]), r: 3.5, color: 'gold', when: `step(0.5 - abs(fn - ${k}))*step(0.5 - abs(n - ${n}))` })))),
      readouts: [{ label: 'max |f − pₙ| on [−1, 1]', expr: [1, 2].flatMap((k) => NS.map((n) => `step(0.5 - abs(fn - ${k}))*step(0.5 - abs(n - ${n}))*${n12(INTERP[`${k}-${n}`].err)}`)).join(' + '), digits: 3 }],
    },
    caption: 'Exact interpolants, evaluated in the stable barycentric form; parts beyond the frame are cut off. The maximum error is measured on a fine grid.',
  },
  example: {
    prompt: t`An old navigation computer keeps $\sin$ only at $0^\circ, 30^\circ, 60^\circ, 90^\circ$ and interpolates with the cubic through those four points. Estimate $\sin 45^\circ$, then bound the error with the formula and compare with the truth.`,
    visual: {
      type: 'graph',
      params: { x: [-0.1, 1.68], y: [-0.08, 1.12], aspect: 'wide', axesAt: 'edge', xlabel: 'x (rad)', ylabel: 'y',
        curves: [{ fn: 'sin(x)', color: 'accent', width: 2.2, label: 'sin x', labelAt: 1.25, labelDx: 6, labelDy: 12 }, { fn: baryExpr(TX, TY), color: 'gold', width: 1.8, dash: true, domain: [0, Math.PI / 2] }],
        points: TX.map((x, i) => ({ x: n12(x), y: n12(TY[i]), r: 4.5, color: 'gold' })).concat([{ x: n12(45 * DEG), y: n12(P45), r: 4, color: 'bad', label: 'p₃(45°)', labelDx: 8, labelDy: 12 }]) },
      caption: 'The four table entries (gold) and their cubic (dashed), which is almost indistinguishable from sin x at this scale.',
    },
    steps: [
      { label: 'Lagrange weights', text: t`In units of $30^\circ$ the nodes are $0, 1, 2, 3$ and $45^\circ$ is $1.5$. Then $L_0(1.5) = \frac{(0.5)(-0.5)(-1.5)}{(-1)(-2)(-3)} = -0.0625$, $L_1 = 0.5625$, $L_2 = 0.5625$, $L_3 = -0.0625$ (they sum to 1, as they must).` },
      { label: 'Interpolate', text: t`$p_3 = -0.0625(0) + 0.5625(0.5) + 0.5625(0.8660) - 0.0625(1) = ${P45.toFixed(6)}$.` },
      { label: 'Bound', text: t`Every derivative of $\sin$ is at most 1, so $\lvert f^{(4)}\rvert \le 1$. In radians the nodal polynomial at $\pi/4$ is $\lvert\omega\rvert = \tfrac{\pi}{4}\cdot\tfrac{\pi}{12}\cdot\tfrac{\pi}{12}\cdot\tfrac{\pi}{4} = ${OM45.toFixed(5)}$, so $\lvert\sin 45^\circ - p_3\rvert \le \dfrac{1}{4!}\times${OM45.toFixed(5)} = ${tex(BOUND45, 3)}$.` },
      { label: 'Compare', text: t`The truth is $\sin 45^\circ = ${S45.toFixed(6)}$, so the actual error is $${tex(S45 - P45, 3)}$ — inside the bound, and about 70% of it, because $\lvert\sin^{(4)}\rvert = \sin\xi$ is close to its maximum over much of the interval.` },
      { label: 'Sense check', text: t`The bound is a product of a function factor and a node factor. Halving the table spacing divides $\omega$ by $2^4 = 16$: a cubic table gains a factor of 16 in accuracy per halving — order 4 in the spacing.` },
    ],
    answer: t`$p_3(45^\circ) = ${P45.toFixed(6)}$; bound $${tex(BOUND45, 3)}$; actual error $${tex(S45 - P45, 3)}$.`,
  },
  practice: [
    num({
      id: 'lagrange-eval', difficulty: 2,
      gen(r) {
        const s0 = r.int(0, 2), xs = [0, 1, 3].map((v) => v + s0);
        const ys = [r.int(1, 5), r.int(2, 8), r.int(-2, 4)];
        const x = xs[1] + r.pick([0.5, 1.5]);
        const ans = lagrange(xs, ys, x);
        return {
          prompt: t`Find the value at $x = ${x}$ of the quadratic through $(${xs[0]}, ${ys[0]})$, $(${xs[1]}, ${ys[1]})$ and $(${xs[2]}, ${ys[2]})$.`,
          visual: {
            type: 'graph',
            params: { x: [xs[0] - 0.6, xs[2] + 0.6], y: [Math.min(...ys, ans) - 1.5, Math.max(...ys, ans) + 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
              curves: [{ fn: baryExpr(xs, ys), color: 'gold', width: 2, dash: true }],
              points: xs.map((xx, i) => ({ x: xx, y: ys[i], r: 5, color: 'accent' })),
              vlines: [{ x, label: `x = ${x}`, color: 'ink3' }] },
            caption: 'The three data points and the unique quadratic through them; the question is its height on the grey line.',
          },
          answer: ans, tol: { rel: 0.002, abs: 0.002 },
          hints: [t`$L_0(x) = \dfrac{(x - ${xs[1]})(x - ${xs[2]})}{(${xs[0]} - ${xs[1]})(${xs[0]} - ${xs[2]})}$, and similarly for $L_1$, $L_2$.`, t`Evaluate the three $L_i(${x})$ (they sum to 1), then $p = \sum y_iL_i(${x})$.`],
          teach: 'The Lagrange form writes the interpolant down directly: each data value times the basis polynomial that is 1 at its own node and 0 at the others.',
          explain: t`$L_i(${x}) = ${xs.map((_, i) => lagrange(xs, xs.map((__, j) => (j === i ? 1 : 0)), x).toFixed(4)).join(',\\ ')}$, so $p(${x}) = ${ans.toFixed(4)}$.`,
        };
      },
    }),
    mcq({
      id: 'unique', difficulty: 1,
      prompt: t`Two students fit polynomials of degree at most 3 through the same four data points. One gets $x^3 - x$ written out; the other gets $(x + 1)x(x - 1)$ plus a Lagrange-form expression that looks completely different. What can you conclude?`,
      visual: {
        type: 'graph',
        params: { x: [-1.6, 2.6], y: [-1.5, 6.5], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
          curves: [{ fn: 'x^3 - x', color: 'accent', width: 2.2 }],
          points: [-1, 0, 1, 2].map((x) => ({ x, y: x ** 3 - x, r: 5, color: 'gold' })) },
        caption: 'Four points and a cubic through them. Any other polynomial of degree ≤ 3 through them would have to coincide with it.',
      },
      choices: ['If both pass through the points, they are the same polynomial: degree ≤ n through n + 1 points is unique', 'They may differ between the nodes; only the node values must agree', 'The Lagrange one is more accurate, because it is built from the data', 'One of them must have degree 4'],
      answer: 0,
      why: {
        1: 'Their difference has degree ≤ 3 and four roots (the nodes), so it is identically zero.',
        2: 'Different forms, same polynomial — accuracy is a property of the polynomial, not of how it is written (though rounding can differ between forms).',
        3: 'Both were constrained to degree ≤ 3.',
      },
      hints: ['Subtract the two polynomials. What degree is the difference, and how many roots does it have?', 'A nonzero polynomial of degree ≤ 3 has at most 3 roots.'],
      teach: 'Uniqueness: two polynomials of degree ≤ n agreeing at n + 1 points differ by a polynomial with n + 1 roots, which must be zero.',
      explain: 'Lagrange, Newton’s divided differences and solving for the coefficients all produce the same polynomial; they differ only in cost and in how rounding enters.',
    }),
    num({
      id: 'linear-table', difficulty: 2,
      gen(r) {
        const [what, M2TeX, M2, unit, hs] = r.pick([
          ['a table of sin x (radians)', '1', 1, 'rad', [0.01, 0.02, 0.05]],
          ['a table of eˣ on [0, 1]', 'e', Math.E, '', [0.01, 0.02, 0.05]],
          ['a table of ln x on [1, 2]', '1', 1, '', [0.01, 0.02, 0.05]],
        ]);
        const h = r.pick(hs);
        const ans = (M2 * h * h) / 8;
        return {
          prompt: t`A code reads ${what} with spacing $h = ${h}$ by **linear** interpolation between neighbouring entries. With $\lvert f''\rvert \le ${M2TeX}$ on the table’s range, what is the worst-case interpolation error?`,
          visual: {
            type: 'graph',
            params: { x: [-0.2, 1.2], y: [-0.1, 0.42], aspect: 'wide', axesAt: 'edge', xlabel: 'x (in units of h)', ylabel: '', yticks: 0,
              curves: [{ fn: '0.3*x*(2 - x) + 0.02', color: 'accent', width: 2.2, domain: [-0.15, 1.15] }, seg(0, 0.02, 1, 0.32, { color: 'gold', width: 2 })],
              points: [{ x: 0, y: 0.02, r: 5, color: 'gold' }, { x: 1, y: 0.32, r: 5, color: 'gold' }] },
            caption: 'Schematic: a curved f between two table entries and the chord linear interpolation uses. The gap is largest near the middle.',
          },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (M2 * h * h) / 2, feedback: t`Use the nodal polynomial’s maximum: $\lvert(x - x_0)(x - x_1)\rvert \le h^2/4$, at the midpoint, then divide by $2!$.` }],
          hints: [t`For $n = 1$: $\lvert f - p_1\rvert \le \dfrac{\max\lvert f''\rvert}{2!}\max\lvert(x - x_0)(x - x_1)\rvert$.`, t`$\lvert(x - x_0)(x - x_1)\rvert$ peaks at the midpoint, at $(h/2)^2$. So the bound is $M_2h^2/8$.`],
          teach: 'Linear interpolation errs by at most h²·max|f″|/8: halve the spacing and the error falls by 4.',
          explain: t`$\dfrac{${M2TeX}\cdot${h}^2}{8} = ${tex(ans, 3)}$. For six-figure accuracy in a sine table you would need $h \le \sqrt{8\times10^{-6}} \approx 0.0028$ rad — hundreds of entries — which is why tables used higher-order interpolation.`,
        };
      },
    }),
    mcq({
      id: 'runge-why', difficulty: 2,
      prompt: t`Interpolating Runge’s function $f(x) = 1/(1 + 25x^2)$ at equally spaced nodes on $[-1, 1]$, the maximum error is about $${RUNGE_ERR[10].toFixed(2)}$ at $n = 10$ and $${RUNGE_ERR[20].toFixed(1)}$ at $n = 20$. What makes it **grow**, although $f$ is infinitely differentiable?`,
      visual: {
        type: 'graph',
        params: { x: [-1.08, 1.08], y: [-1.2, 2.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'y',
          curves: [{ fn: FUNCS[1].expr, color: 'accent', width: 2.2 }, { fn: INTERP['1-14'].expr, color: 'gold', width: 1.8, domain: [-1, 1] }],
          points: INTERP['1-14'].xs.map((x, i) => ({ x: n12(x), y: n12(INTERP['1-14'].ys[i]), r: 3.5, color: 'gold' })) },
        caption: 'Runge’s function (blue) and its degree-14 interpolant at equally spaced nodes (gold). The interpolant is cut off by the frame near the ends.',
      },
      choices: [
        'Its high derivatives grow roughly like (n + 1)!·5ⁿ⁺¹, outpacing the (n + 1)! in the formula, while the equispaced nodal polynomial is largest near the ends',
        'Round-off error in evaluating the high-degree polynomial',
        'f is not smooth enough at x = 0',
        'There are too few nodes; more would fix it',
      ],
      answer: 0,
      why: {
        1: 'The growth is real mathematics: exact arithmetic gives the same oscillations (rounding only matters far beyond n = 20).',
        2: 'f is infinitely differentiable on the whole real line; the trouble is its poles at ±0.2i in the complex plane, close to the interval.',
        3: 'More equispaced nodes make it worse — that is the phenomenon.',
      },
      hints: ['Look at the two factors of the error formula. Which grows with n, and where?', 'f has poles at x = ±i/5: its Taylor series about 0 converges only for |x| < 0.2, a sign that its derivatives are huge.'],
      teach: 'Interpolation error = (function factor) × (node factor): Runge’s function has a large function factor, and equispaced nodes have a large node factor near the ends.',
      explain: t`$\max\lvert f^{(n+1)}\rvert$ grows roughly like $(n+1)!\,5^{n+1}$, so the first factor alone is of size $5^{n+1}$, while $\max\lvert\omega\rvert$ for equispaced nodes is about $(2/e)^{n}$ — far larger near the ends than in the middle. Their product grows. The cure is not fewer points but better-placed ones: Chebyshev nodes, next lesson.`,
    }),
    num({
      id: 'omega-ratio', difficulty: 3,
      gen(r) {
        const n = r.pick([4, 6, 8, 10]);
        const xs = equispaced(n), w = omega(xs);
        const xe = 1 - 1 / n, xc = 1 / n;
        const ans = Math.abs(w(xe)) / Math.abs(w(xc));
        return {
          prompt: t`For $n + 1 = ${n + 1}$ equally spaced nodes on $[-1, 1]$ (spacing $${+(2 / n).toFixed(4)}$), compare the nodal polynomial $\omega(x) = \prod(x - x_i)$ at the middle of the **last** interval, $x = ${+xe.toFixed(4)}$, with its value at the middle of a **central** interval, $x = ${+xc.toFixed(4)}$. What is $\lvert\omega(${+xe.toFixed(4)})\rvert / \lvert\omega(${+xc.toFixed(4)})\rvert$?`,
          visual: {
            type: 'graph',
            params: { x: [-1.05, 1.05], y: [-Math.abs(w(xe)) * 1.3, Math.abs(w(xe)) * 1.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'ω(x)',
              curves: [{ fn: omegaExpr(xs), color: 'accent', width: 2, domain: [-1, 1] }],
              points: xs.map((x) => ({ x: n12(x), y: 0, r: 3.5, color: 'gold' })) },
            caption: t`The nodal polynomial for ${n + 1} equispaced nodes (gold): small humps in the middle, large ones at the ends.`,
          },
          answer: ans, tol: { rel: 0.01 },
          hints: ['Multiply out the n + 1 distances |x − xᵢ| at each point (a short loop is easiest).', t`At $x = ${+xe.toFixed(4)}$ the nearest nodes are $\pm ${tex(1 / n, 3)}$ away, but the far nodes are nearly 2 away; in the middle, every node is at most about 1 away.`],
          teach: 'For equispaced nodes the nodal polynomial’s humps grow rapidly towards the ends of the interval, and the ratio grows exponentially with n.',
          explain: t`$\lvert\omega(${+xe.toFixed(4)})\rvert = ${tex(Math.abs(w(xe)), 3)}$ and $\lvert\omega(${+xc.toFixed(4)})\rvert = ${tex(Math.abs(w(xc)), 3)}$, a ratio of $${tex(ans, 3)}$. For $n = 4, 6, 8, 10$ it is $2.3, 6.6, 20, 67$: the end humps outgrow the middle ones by about a factor of 3 for every two extra nodes.`,
        };
      },
    }),
    code({
      id: 'runge-errors', difficulty: 2,
      prompt: t`Write \`interp(xs, ys, x)\` that evaluates the Lagrange interpolant through \`(xs, ys)\` at a point (or NumPy array) \`x\`. Then set \`err10\` and \`err20\` to the maximum of $\lvert f - p_n\rvert$ over 2001 equally spaced points of $[-1, 1]$, for Runge’s $f(x) = 1/(1 + 25x^2)$ interpolated at $n + 1$ equally spaced nodes with $n = 10$ and $n = 20$.`,
      starter: t`import numpy as np

def f(x):
    return 1 / (1 + 25 * x**2)

def interp(xs, ys, x):
    # sum of ys[i] * L_i(x)
    return 0 * x

grid = np.linspace(-1, 1, 2001)
def max_error(n):
    nodes = np.linspace(-1, 1, n + 1)
    return np.max(np.abs(f(grid) - interp(nodes, f(nodes), grid)))

err10 = max_error(10)
err20 = max_error(20)
print(err10, err20)
`,
      answer: t`import numpy as np

def f(x):
    return 1 / (1 + 25 * x**2)

def interp(xs, ys, x):
    total = 0 * x
    for i in range(len(xs)):
        L = 1.0
        for j in range(len(xs)):
            if j != i:
                L = L * (x - xs[j]) / (xs[i] - xs[j])
        total = total + ys[i] * L
    return total

grid = np.linspace(-1, 1, 2001)
def max_error(n):
    nodes = np.linspace(-1, 1, n + 1)
    return np.max(np.abs(f(grid) - interp(nodes, f(nodes), grid)))

err10 = max_error(10)
err20 = max_error(20)
print(err10, err20)`,
      tests: [
        { name: 'interp passes through its data', code: 'abs(interp([0.0, 1.0, 3.0], [2.0, 5.0, -1.0], 3.0) - (-1.0)) < 1e-12' },
        { name: 'a quadratic is reproduced exactly between the nodes', code: 'abs(interp([0.0, 1.0, 2.0], [0.0, 1.0, 4.0], 1.5) - 2.25) < 1e-12' },
        { name: t`$n = 10$: maximum error $\approx 1.92$`, code: 'abs(err10 - 1.916) < 0.01' },
        { name: t`$n = 20$: maximum error $\approx 59.8$ — worse`, code: 'abs(err20 - 59.8) < 0.3' },
      ],
      hints: ['Two nested loops: the outer over i builds the term ys[i]·Lᵢ(x); the inner multiplies (x − xs[j])/(xs[i] − xs[j]) for every j ≠ i.', 'Start each Lᵢ at 1.0 and the total at 0·x, so the same code works for a number or an array.'],
      teach: 'The Lagrange form is a direct translation of the formula; with n + 1 nodes each evaluation costs O(n²) operations (the barycentric form does it in O(n)).',
      explain: t`The errors come out $${RUNGE_ERR[10].toFixed(3)}$ and $${RUNGE_ERR[20].toFixed(1)}$ (on this grid): doubling the degree made the fit thirty times worse. Try Chebyshev nodes, \`np.cos((2*np.arange(n+1) + 1) * np.pi / (2*n + 2))\`, in the same code to preview the next lesson.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-gps-linear', difficulty: 2, transfer: true,
      gen(r) {
        const hmin = r.pick([5, 10, 15]);
        const h = hmin * 60, g = GM / RGPS ** 2;
        const ans = (g * h * h) / 8;
        return {
          prompt: t`Precise GPS orbits are published as satellite positions at fixed epochs. A receiver tabulates one coordinate every $${hmin}$ minutes and interpolates **linearly**. The acceleration of a GPS satellite is $GM/r^2$ with $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$ and $r = 26\,560$ km, so $\lvert x''\rvert \le GM/r^2$. Bound the interpolation error, in metres.`,
          visual: {
            type: 'graph',
            params: { x: [-1.2, 1.2], y: [-1.2, 1.2], aspect: 'wide', equal: true, axesAt: 'edge', xlabel: '', ylabel: '', xticks: 0, yticks: 0,
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, ...[0, 1, 2, 3].map((k) => { const a = k * 0.5, b = (k + 1) * 0.5; return seg(Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b), { color: 'gold', width: 1.6 }); })],
              points: [0, 1, 2, 3, 4].map((k) => ({ x: n12(Math.cos(k * 0.5)), y: n12(Math.sin(k * 0.5)), r: 4, color: 'gold' })).concat([{ x: 0, y: 0, r: 5, color: 'good' }]) },
            caption: 'Schematic, not to scale: tabulated positions on an orbit (gold) joined by straight lines. Each chord cuts inside the arc.',
          },
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (g * h * h) / 2, feedback: t`The node factor peaks at $(h/2)^2 = h^2/4$, and the formula divides by $2!$: $h^2/8$ in all.` }],
          hints: [t`$GM/r^2 = ${tex(g, 3)}\ \text{m/s}^2$ and $h = ${h}$ s.`, t`Bound $= \dfrac{h^2}{8}\max\lvert x''\rvert$.`],
          teach: 'An orbit’s curvature makes linear interpolation of ephemerides hopeless at minutes-long spacings: the sagitta of the arc is h²g/8.',
          explain: t`$\dfrac{(${h}\ \text{s})^2}{8}\times ${tex(g, 3)}\ \text{m/s}^2 = ${tex(ans, 3)}$ m — the sagitta of the arc. Real software interpolates GPS orbits tabulated every 15 minutes with polynomials of degree around 8 to 10, using a window of epochs centred on the time wanted.`,
        };
      },
    }),
    num({
      id: 'cp-gps-cubic', difficulty: 3, transfer: true,
      gen(r) {
        const hmin = r.pick([10, 15]);
        const h = hmin * 60;
        const M4 = RGPS * W_GPS ** 4;          // |d⁴x/dt⁴| ≤ r ω⁴ for a circular orbit
        const ans = (M4 / 24) * 0.5625 * h ** 4;
        return {
          prompt: t`The same receiver switches to the **cubic** through four consecutive epochs, $${hmin}$ minutes apart, and uses it only in the **middle** interval, where $\max\lvert\omega\rvert = \tfrac{9}{16}h^4$. For a circular orbit $x = r\cos\Omega t$, so $\lvert x^{(4)}\rvert \le r\Omega^4$, with $r = 26\,560$ km and orbital rate $\Omega = \sqrt{GM/r^3} = ${tex(W_GPS, 4)}\ \text{s}^{-1}$. Bound the error, in metres.`,
          visual: {
            type: 'graph',
            params: { x: [-0.3, 3.3], y: [-1.1, 0.75], aspect: 'wide', axesAt: 'edge', xlabel: 'time (in units of h)', ylabel: 'ω(t)/h⁴',
              curves: [{ fn: 'x*(x - 1)*(x - 2)*(x - 3)', color: 'accent', width: 2, domain: [0, 3] }],
              shade: [{ fn: 'x*(x - 1)*(x - 2)*(x - 3)', from: 1, to: 2, color: 'gold', alpha: 0.3 }],
              points: [0, 1, 2, 3].map((x) => ({ x, y: 0, r: 4.5, color: 'gold' })) },
            caption: 'The nodal polynomial of four equally spaced epochs. In the middle interval (shaded) it stays below 9/16 in units of h⁴; in the outer ones it reaches 1.',
          },
          answer: ans, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (M4 / 24) * h ** 4, feedback: t`That uses $\max\lvert\omega\rvert = h^4$, the value in the *outer* intervals. In the middle one it is $\tfrac{9}{16}h^4$.` }],
          hints: [t`$r\Omega^4 = ${tex(M4, 3)}\ \text{m/s}^4$.`, t`Bound $= \dfrac{r\Omega^4}{4!}\cdot\dfrac{9}{16}h^4$ with $h = ${h}$ s.`],
          teach: 'Raising the degree replaces h²g/8 by roughly r(Ωh)⁴: for smooth orbits each extra node buys about a factor Ωh ≈ 0.13 at 15-minute spacing.',
          explain: t`$\dfrac{${tex(M4, 3)}}{24}\times\dfrac{9}{16}\times(${h})^4 = ${tex(ans, 3)}$ m: far better than linear, still far from the centimetres wanted. Each further pair of nodes multiplies the bound by roughly $(\Omega h)^2$, which is why degree 8–10 reaches the centimetre level — and why using the interpolant *near the middle* of its window matters.`,
        };
      },
    }),
    mcq({
      id: 'cp-extrapolate', difficulty: 2, transfer: true,
      prompt: t`A predictive-navigation code fits a degree-9 polynomial through the last ten tabulated positions of a satellite (epochs 15 minutes apart) and evaluates it **one hour beyond** the last epoch. The prediction is off by kilometres, although the same polynomial is accurate to centimetres between the epochs. Why?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 13.3], y: [-3, 5], aspect: 'wide', axesAt: 'edge', xlabel: 'time (in units of the spacing)', ylabel: 'ω(t), scaled',
          curves: [{ fn: `(2*step(${OM10}) - 1)*log10(1 + abs(${OM10}))/2`, color: 'accent', width: 2, domain: [0, 12.8] }],
          points: Array.from({ length: 10 }, (_, k) => ({ x: k, y: 0, r: 3.5, color: 'gold' })),
          vlines: [{ x: 9, label: 'last epoch', color: 'ink3' }] },
        caption: 'The nodal polynomial of ten equally spaced epochs, on a compressed (logarithmic) vertical scale. Beyond the last node it rises by orders of magnitude.',
      },
      choices: [
        'Outside the nodes the nodal polynomial ∏(t − tᵢ) grows extremely fast, so the error formula’s node factor explodes: extrapolation is not interpolation',
        'Round-off in the polynomial’s coefficients',
        'The satellite manoeuvred',
        'Degree 9 is too low; degree 20 would extrapolate better',
      ],
      answer: 0,
      why: {
        1: 'Rounding is the same inside and outside; the error formula alone explains the blow-up.',
        2: 'No manoeuvre is needed: the polynomial itself diverges from any smooth orbit beyond its data.',
        3: 'A higher degree makes the node factor outside the data grow even faster.',
      },
      hints: ['Evaluate the node factor |∏(t − tᵢ)| at t = 9.5 and at t = 13 (four spacings past the end).', 'Inside the data every factor is at most ~9; outside, every factor exceeds 4 at t = 13.'],
      teach: 'Interpolation is accurate between the nodes; beyond them the nodal polynomial — and with it the error — grows like a power of the distance, so polynomial extrapolation of orbits fails fast.',
      explain: t`At four spacings past the last epoch, $\lvert\omega\rvert = 13\cdot12\cdots4 = ${tex(W13, 3)}$ (in units of the spacing to the tenth power), against at most $${tex(WIN, 2)}$ between the nodes — about $${tex(W13 / WIN, 2)}$ times larger. Prediction needs a dynamical model (integrate the equations of motion), not a longer polynomial.`,
    }),
  ],
  sources: [
    { label: 'Trefethen (2019), Approximation Theory and Approximation Practice, extended ed., SIAM, ch. 11–13 (interpolation, Runge’s phenomenon)', url: 'https://doi.org/10.1137/1.9781611975949' },
    { label: 'Süli & Mayers (2003), An Introduction to Numerical Analysis, Cambridge, ch. 6 (polynomial interpolation)', url: 'https://doi.org/10.1017/CBO9780511801181' },
    { label: 'IGS: precise orbit products (SP3, 15-minute epochs)', url: 'https://igs.org/products/' },
  ],
});
