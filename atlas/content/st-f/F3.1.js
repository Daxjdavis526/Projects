// Bisection — the analyst's view: the intermediate value theorem as an
// algorithm, the a-priori error bound (b − a)/2ⁿ⁺¹, linear convergence with
// rate ½ (for the bound, not the error), what floating point does to the
// last steps, and what bisection cannot do. Wien's displacement law, and the
// photon-capture threshold of a black hole found by yes/no experiments.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { n12, lg, seg, bisection } from './_num.js';

const t = String.raw;

// ── Wien's law: x = 5(1 − e⁻ˣ) on [4, 6] ──
const wien = (x) => x - 5 * (1 - Math.exp(-x));
const STEPS = bisection(wien, 4, 6, 60);
const ROOT = STEPS[STEPS.length - 1].m;                // converged to the last bit
const HC_K = (6.62607015e-34 * 299792458) / 1.380649e-23;   // m K (exact SI constants)
const WIEN_B = HC_K / ROOT;
const NMAX = 12;
const BR = STEPS.slice(0, NMAX + 1);                    // the bracket before each halving
const ERRS = STEPS.slice(0, 40).map((s) => Math.abs(s.m - ROOT));
// run to the end of float64, as the code exercise does: stop when no new midpoint exists or f(m) is exactly 0
const FLOAT_END = (() => { let a = 4, b = 6, fa = wien(a), n = 0; for (;;) { const m = a + (b - a) / 2; if (m === a || m === b) return { n, zero: false }; const fm = wien(m); if (fm === 0) return { n, zero: true }; if ((fm < 0) === (fa < 0)) { a = m; fa = fm; } else b = m; n++; } })();

// ── the frequency form, x = 3(1 − e⁻ˣ) on [2, 3] ──
const wienNu = (x) => x - 3 * (1 - Math.exp(-x));
const STEPS_NU = bisection(wienNu, 2, 3, 60);
const ROOT_NU = STEPS_NU[STEPS_NU.length - 1].m;

const pick = (arr) => arr.map((v, k) => `step(0.5 - abs(n - ${k}))*(${n12(v)})`).join(' + ');

export default lesson({
  id: 'st-f.F3.1',
  title: 'Bisection',
  minutes: 11, difficulty: 2,
  intro: t`If a continuous $f$ changes sign on $[a, b]$, the intermediate value theorem promises a root inside. **Bisection** turns that promise into an algorithm: evaluate $f$ at the midpoint, keep the half on which the sign still changes, repeat. Each step halves the bracket, so after $n$ steps the midpoint $m_n$ is guaranteed to be within

$$\lvert m_n - r\rvert \;\le\; \frac{b - a}{2^{\,n+1}}$$

of a root $r$ — a bound you know **before** you start, for any continuous $f$, with one function evaluation per step. That is linear convergence with rate $\tfrac12$: about 3.3 steps per decimal digit. It is slow, and it is unbeatable as a safety net. [Scientific Programming](#/lesson/prog.P9.1) used it; here you prove what it guarantees, and see where floating point ends it.`,
  symbols: [
    { tex: t`[a, b]`, text: 'the starting **bracket**: $f(a)$ and $f(b)$ have opposite signs' },
    { tex: 'r', text: 'a root inside the bracket, $f(r) = 0$ (there may be several; bisection finds one of them)' },
    { tex: t`m_n`, text: 'the midpoint of the bracket after $n$ halvings ($m_0$ is the midpoint of $[a, b]$)' },
    { tex: 'n', text: 'the number of halvings — also the number of function evaluations, beyond $f(a)$ and $f(b)$' },
    { tex: t`\frac{b - a}{2^{n+1}}`, text: 'half the width of the current bracket: the farthest the root can be from its midpoint' },
  ],
  why: 'Root finding sits inside every implicit method, every shooting method and every search for an orbit’s turning point; bisection is the one root finder whose cost you can state in advance, which is why robust codes fall back on it.',
  visual: {
    type: 'graph',
    title: 'Halving a bracket',
    lead: t`The curve is $f(x) = x - 5(1 - e^{-x})$, whose root gives Wien’s displacement law. Step $n$ forward: the shaded band is the current bracket, the gold dot its midpoint, and the bars underneath are the brackets so far, each half the one above.`,
    tasks: [
      'Step to n = 3: the bracket is 2/2³ = 0.25 wide, and the midpoint is within 0.125 of the root.',
      'Compare “actual error” with “bound” as you step: the bound halves every time, the actual error does not.',
      'Count steps per decimal digit: the bound falls by 10 in a little over 3 steps.',
    ],
    params: {
      x: [3.8, 6.2], y: [-2.15, 1.2], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)', yticks: 4,
      sliders: [{ key: 'n', label: 'Halvings $n$', min: 0, max: NMAX, step: 1, value: 0, explain: 'How many times the bracket has been halved.' }],
      curves: [{ fn: 'x - 5*(1 - e^(-x))', color: 'accent', width: 2.2 }, { fn: '0', color: 'ink4', width: 1 },
        ...BR.flatMap((s, k) => seg(s.a, -1.2 - 0.075 * k, s.b, -1.2 - 0.075 * k, { color: k % 2 ? 'teal' : 'violet', width: 3, when: `step(n - ${k} + 0.5)` }))],
      shade: BR.map((s, k) => ({ fn: '1.2', lower: '-1.12', from: n12(s.a), to: n12(s.b), color: 'gold', alpha: 0.13, when: `step(0.5 - abs(n - ${k}))` })),
      points: BR.map((s, k) => ({ x: n12(s.m), y: 0, r: 5, color: 'gold', when: `step(0.5 - abs(n - ${k}))` })),
      readouts: [
        { label: 'bracket width', expr: '2/2^n', digits: 4 },
        { label: 'bound on the error', expr: '1/2^n', digits: 4 },
        { label: 'actual error', expr: pick(ERRS.slice(0, NMAX + 1)), digits: 3 },
      ],
    },
    caption: 'Exact bisection of the real function, in float64. The nested bars below the axis are the successive brackets, offset downward for clarity.',
  },
  example: {
    prompt: t`Wien’s displacement law, $\lambda_{\max}T = b$, comes from the root of $x = 5(1 - e^{-x})$, with $b = hc/(k_Bx)$. Starting from the bracket $[4, 6]$, how many bisection steps guarantee the root to within $10^{-10}$? Then compute $b$.`,
    visual: {
      type: 'graph',
      params: { x: [-0.5, 40.5], y: [-16.5, 0.5], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step n', ylabel: 'error of the midpoint',
        curves: [{ fn: `${n12(lg(1))} - x*${n12(lg(2))}`, color: 'bad', dash: true, label: 'bound (b − a)/2ⁿ⁺¹', labelAt: 6, labelDx: 6, labelDy: -12 }],
        points: ERRS.map((e, n) => ({ x: n, y: n12(lg(Math.max(e, 1e-16))), r: 3.5, color: 'accent' })),
        hlines: [{ y: -10, label: '10⁻¹⁰', color: 'gold' }] },
      caption: 'The actual error of each midpoint (blue) against the guaranteed bound (red), logarithmic axis. Errors below 10⁻¹⁶ are drawn at 10⁻¹⁶.',
    },
    steps: [
      { label: 'Check the bracket', text: t`$f(x) = x - 5(1 - e^{-x})$ is continuous, with $f(4) = ${wien(4).toFixed(3)} < 0$ and $f(6) = ${wien(6).toFixed(3)} > 0$: the intermediate value theorem guarantees a root in $[4, 6]$.` },
      { label: 'Why the bound holds', text: t`Each step keeps a half on which $f$ changes sign, so a root stays inside, and the width halves: after $n$ steps it is $2/2^n$. The root lies in the bracket and the midpoint is in its centre, so $\lvert m_n - r\rvert \le \tfrac12 \cdot 2/2^n = 2^{-n}$.` },
      { label: 'Count the steps', text: t`$2^{-n} \le 10^{-10}$ needs $n \ge 10\log_2 10 = 33.2$: **34 steps**, decided before evaluating anything.` },
      { label: 'Run it', text: t`The midpoints are $5, 4.5, 4.75, 4.875, 4.9375, \ldots$; the 34th is within $10^{-10}$ of $r = ${ROOT.toFixed(12)}$. Carried on to the limit of float64, ${FLOAT_END.zero ? t`after ${FLOAT_END.n} halvings it lands on a midpoint where the computed $f$ is exactly 0 — as close as float64 can say.` : t`after ${FLOAT_END.n} halvings the bracket is two adjacent floats.`}` },
      { label: 'Wien’s constant', text: t`$b = \dfrac{hc}{k_Bx} = \dfrac{${tex(HC_K, 6)}\ \text{m K}}{${ROOT.toFixed(6)}} = ${tex(WIEN_B, 6)}\ \text{m K}$, the CODATA value. The Sun's photosphere, at about 5770 K, peaks near $${(WIEN_B / 5770 * 1e9).toFixed(0)}$ nm.` },
    ],
    answer: t`34 steps; $x = ${ROOT.toFixed(10)}$ and $b = ${tex(WIEN_B, 6)}$ m K.`,
  },
  practice: [
    num({
      id: 'bound-after-n', difficulty: 1,
      gen(r) {
        const [a, b, what, unit] = r.pick([[0, 2, 'the time of closest approach of two spacecraft', 's'], [5, 7, 'a turning point of an orbit', 'M'], [1, 4, 'the depth at which a probe’s buoyancy balances its weight', 'm']]);
        const n = r.int(8, 20);
        const ans = (b - a) / 2 ** (n + 1);
        return {
          prompt: t`Bisection searches for ${what} in the bracket $[${a}, ${b}]$${unit === 'M' ? ' (in units of the mass $M$)' : ` ${unit}`}. After $n = ${n}$ halvings, what is the largest possible distance between the current midpoint and the root${unit === 'M' ? ', in units of $M$' : ''}?`,
          visual: {
            type: 'graph',
            params: { x: [a - 0.1 * (b - a), b + 0.1 * (b - a)], y: [-4.6, 0.6], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: '', yticks: 0, grid: false,
              curves: [0, 1, 2, 3].flatMap((k) => seg(a + (b - a) * (k === 0 ? 0 : [0, 0.5, 0.5, 0.625][k]), -k, a + (b - a) * [1, 1, 0.75, 0.75][k], -k, { color: k % 2 ? 'teal' : 'violet', width: 4 })),
              points: [0, 1, 2, 3].map((k) => ({ x: n12(a + (b - a) * [0.5, 0.75, 0.625, 0.6875][k]), y: -k, r: 4, color: 'gold' })) },
            caption: 'The first four brackets of some bisection run (each half the one above), with their midpoints in gold. Which half survives depends on the function; the width does not.',
          },
          answer: ans, units: unit === 'M' ? undefined : unit, tol: { rel: 0.01 },
          errors: [{ value: (b - a) / 2 ** n, feedback: 'That is the width of the bracket. The midpoint is at its centre, so it is at most half a width from the root.' }],
          hints: ['Each halving halves the width: after n steps it is (b − a)/2ⁿ.', 'The root is inside the bracket and the midpoint is in the middle: at most half the width away.'],
          teach: 'After n halvings the midpoint is within (b − a)/2ⁿ⁺¹ of a root: an a-priori bound that needs nothing about f beyond continuity and a sign change.',
          explain: t`$\dfrac{${b - a}}{2^{${n + 1}}} = ${tex(ans, 3)}$${unit === 'M' ? '$\\,M$' : ` ${unit}`}. Note what the bound does *not* need: no derivative, no smoothness, no good starting guess.`,
        };
      },
    }),
    mcq({
      id: 'not-monotone', difficulty: 3,
      prompt: t`Bisection’s error bound halves at every step. Is the **actual** error of the midpoint, $e_n = \lvert m_n - r\rvert$, guaranteed to satisfy $e_{n+1} \le \tfrac12 e_n$?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 20.5], y: [-7, 0.3], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step n', ylabel: 'error of the midpoint',
          curves: [{ fn: `-x*${n12(lg(2))}`, color: 'bad', dash: true, label: 'bound', labelAt: 15, labelDx: 6, labelDy: -12 }, ...ERRS.slice(0, 21).slice(1).map((e, k) => seg(k, lg(ERRS[k]), k + 1, lg(e), { color: 'accent', width: 1.6 }))],
          points: ERRS.slice(0, 21).map((e, n) => ({ x: n, y: n12(lg(e)), r: 3.5, color: 'accent' })) },
        caption: 'The actual midpoint errors of the Wien bisection (blue) and the bound (red), logarithmic axis.',
      },
      choices: [
        'No: only the bound halves; when the root lies close to one midpoint, the next midpoint can be farther away',
        'Yes: halving the bracket halves the error',
        'Yes, but only if f is differentiable',
        'No: the error can grow without limit',
      ],
      answer: 0,
      why: {
        1: 'The bracket halves; the distance from its centre to the root need not. In the picture the error rises at several steps.',
        2: 'Smoothness plays no part: the midpoints depend only on the signs of f.',
        3: 'The actual error never exceeds the bound, which goes to zero.',
      },
      hints: ['Suppose the root happens to be very close to m₃. Where is m₄?', 'm₄ is a quarter of the old bracket away from m₃, whatever the root does.'],
      teach: 'Bisection converges linearly with rate ½ in the sense of its error bound; the actual errors zigzag underneath it.',
      explain: t`If $r$ is within $10^{-6}$ of $m_3$, then $m_4$ is a quarter-bracket from $m_3$ and the error *jumps up*. Order and rate are statements about bounds (or limits of ratios) — for bisection the ratio $e_{n+1}/e_n$ has no limit at all, while $e_n \le (b - a)/2^{n+1}$ always holds.`,
    }),
    num({
      id: 'float-limit', difficulty: 2,
      gen(r) {
        const k = r.int(0, 10), m = r.int(k - 12, k - 1);
        const ans = m - k + 52;
        const lo = 2 ** k, w = 2 ** m;
        return {
          prompt: t`Bisection runs in float64 on the bracket $[2^{${k}},\ 2^{${k}} + 2^{${m}}]$. The floats there are $2^{${k}-52}$ apart. How many halvings can it make before the two ends of the bracket are **adjacent floats**, so that no new midpoint exists?`,
          visual: {
            type: 'graph',
            params: { x: [-0.5, 8.5], y: [-0.7, 0.9], aspect: 'wide', axesAt: 'edge', xlabel: '', ylabel: '', yticks: 0, xticks: 0, grid: false,
              curves: [{ fn: '0', color: 'ink4', width: 1.2, domain: [-0.3, 8.3] }, seg(0, 0.35, 8, 0.35, { color: 'violet', width: 3 }), seg(0, 0.25, 4, 0.25, { color: 'teal', width: 3 }), seg(2, 0.15, 4, 0.15, { color: 'violet', width: 3 })],
              points: Array.from({ length: 9 }, (_, j) => ({ x: j, y: 0, r: 3.5, color: 'accent' })).concat([{ x: 0, y: 0, r: 0, label: 'a', labelDx: -4, labelDy: 14 }, { x: 8, y: 0, r: 0, label: 'b', labelDx: -4, labelDy: 14 }]) },
            caption: 'Schematic: floats (blue) are discrete, so halving must stop when the bracket spans a single gap. Here a bracket of eight gaps allows three halvings.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: 52, feedback: 'That would be right for a bracket as wide as the whole binade. Count the gaps in this one: its width divided by the spacing.' }],
          hints: [t`The bracket holds $2^{${m}}/2^{${k}-52}$ gaps.`, t`Each halving halves the number of gaps; stop at one: $\log_2$ of the number of gaps.`],
          teach: 'In floating point bisection ends after about log₂(width/spacing) steps — at most 52 inside one binade — when the ends are neighbouring floats; asking for a tighter tolerance than that loops forever.',
          explain: t`The bracket is $2^{${m}}/2^{${k - 52}} = 2^{${ans}}$ gaps wide, so $${ans}$ halvings leave one gap. A loop that waits for \`b - a < 1e-20\` near $${lo > 1000 ? tex(lo, 3) : lo}$ never ends: test instead whether the midpoint equals an end, or use a tolerance relative to the size of $x$.`,
        };
      },
    }),
    mcq({
      id: 'double-root', difficulty: 2,
      prompt: t`The function $f(x) = (x - 2)^2(x + 1)$ has a root at $x = 2$. Why can bisection not find it from a bracket around 2, such as $[1.5, 3]$?`,
      visual: {
        type: 'graph',
        params: { x: [0.5, 3.5], y: [-1, 5], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
          curves: [{ fn: '(x - 2)^2*(x + 1)', color: 'accent', width: 2.2 }],
          points: [{ x: 2, y: 0, r: 5, color: 'gold', label: 'root at 2', labelDx: -24, labelDy: -16 }] },
        caption: 'f(x) = (x − 2)²(x + 1) near its double root: the curve touches the axis without crossing it.',
      },
      choices: [
        'f does not change sign at a double root, so f(1.5) and f(3) are both positive and there is no bracket to start from',
        'The derivative is zero there, so bisection divides by zero',
        'Bisection converges, but only linearly with rate ½',
        'Bisection needs f to be a polynomial of odd degree',
      ],
      answer: 0,
      why: {
        1: 'Bisection uses no derivatives at all; that is Newton’s difficulty.',
        2: 'It cannot even start: both ends have the same sign.',
        3: 'This f is a cubic, and bisection cares only about signs at the ends, not about degree.',
      },
      hints: ['What does bisection need at the two ends of its bracket?', 'Evaluate f(1.5) and f(3).'],
      teach: 'Bisection needs a sign change; a root of even multiplicity has none, so a bracketing method cannot see it.',
      explain: t`$f(1.5) = 0.25 \times 2.5 = 0.625$ and $f(3) = 1 \times 4 = 4$: both positive. Roots of even multiplicity are invisible to sign tests; find them as minima of $\lvert f\rvert$ or roots of $f'$ instead.`,
    }),
    mcq({
      id: 'three-roots', difficulty: 2,
      prompt: t`Bisection starts on $[0, 4]$ for $f(x) = (x - 0.5)(x - 1.5)(x - 3.5)$, with $f(0) < 0 < f(4)$. Which root does it find?`,
      visual: {
        type: 'graph',
        params: { x: [-0.2, 4.2], y: [-3.5, 4.5], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'f(x)',
          curves: [{ fn: '(x - 0.5)*(x - 1.5)*(x - 3.5)', color: 'accent', width: 2.2 }],
          vlines: [{ x: 2, label: 'first midpoint', color: 'gold' }] },
        caption: 'A cubic with three roots in the bracket [0, 4]. The first midpoint is 2.',
      },
      choices: ['3.5: at the midpoint 2, f is negative, so the bracket becomes [2, 4]', '0.5, the leftmost root', '1.5, the one nearest the midpoint', 'It fails, because there is more than one root'],
      answer: 0,
      why: {
        1: 'Bisection has no preference for the left; it follows the signs.',
        2: 'Distance to the midpoint plays no part; only the sign of f(2) does.',
        3: 'The guarantee is “some root in the bracket”, and with an odd number of sign changes there always is one to converge to.',
      },
      hints: ['Evaluate f(2) and compare its sign with f(0) and f(4).', 'f(2) = (1.5)(0.5)(−1.5) < 0, so the sign change is in the right half.'],
      teach: 'With several roots in the bracket, bisection converges to one of them, chosen by the signs at the midpoints — not necessarily the one you wanted.',
      explain: t`$f(2) = -1.125 < 0$ and $f(4) > 0$, so the bracket becomes $[2, 4]$, which contains only the root $3.5$. To find the others, bracket them separately — for example by sampling $f$ on a grid first and bisecting each sign change.`,
    }),
    code({
      id: 'bisect-float', difficulty: 3,
      prompt: t`Write \`bisect(f, a, b)\` for $f(a)$, $f(b)$ of opposite signs that halves the bracket **until no new midpoint exists**: compute \`m = a + (b - a) / 2\`; if \`m == a or m == b\`, stop; if \`f(m) == 0\`, return \`(m, m, steps)\`; otherwise keep the half with the sign change. Return \`(a, b, steps)\`, where \`steps\` counts the halvings. Run it on Wien’s $f(x) = x - 5(1 - e^{-x})$ over $[4, 6]$.`,
      starter: t`import math

def bisect(f, a, b):
    steps = 0
    fa = f(a)
    # loop: midpoint, stopping tests, keep the half with the sign change
    return a, b, steps

f = lambda x: x - 5 * (1 - math.exp(-x))
lo, hi, n = bisect(f, 4.0, 6.0)
print(lo, hi, n, hi - lo)
`,
      answer: t`import math

def bisect(f, a, b):
    steps = 0
    fa = f(a)
    while True:
        m = a + (b - a) / 2
        if m == a or m == b:
            return a, b, steps
        fm = f(m)
        if fm == 0:
            return m, m, steps
        if (fm < 0) == (fa < 0):
            a, fa = m, fm
        else:
            b = m
        steps += 1

f = lambda x: x - 5 * (1 - math.exp(-x))
lo, hi, n = bisect(f, 4.0, 6.0)
print(lo, hi, n, hi - lo)`,
      tests: [
        { name: 'the final bracket is at most one float gap wide', code: 'hi - lo <= math.ulp(lo)' },
        { name: t`it brackets Wien’s root $4.9651142317442763\ldots$`, code: 'abs((lo + hi) / 2 - 4.965114231744276) <= 2 * math.ulp(4.965114231744276)' },
        { name: 'it needed about 51 halvings, not millions', code: '45 <= n <= 53' },
        { name: t`it works on $x^3 - 2$ over $[0, 2]$`, code: 'abs(bisect(lambda x: x**3 - 2, 0.0, 2.0)[0] - 2 ** (1/3)) < 1e-15' },
      ],
      hints: ['Use `while True:` and return from inside the loop when a stopping test fires.', 'Compare signs with `(fm < 0) == (fa < 0)`: if they match, the root is in [m, b], so set `a, fa = m, fm`; otherwise set `b = m`.'],
      teach: 'Stopping when the midpoint equals an end is a tolerance-free test that ends exactly when floating point has nothing left to give.',
      explain: t`Between 4 and 8 floats are $2^{-50}$ apart, so a bracket of width 2 is $2^{51}$ gaps wide, and about 51 halvings bring it down to one. A fixed tolerance like \`1e-20\` would have looped forever; one like \`1e-6\` would have stopped 30 steps early.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-photon-capture', difficulty: 2, transfer: true,
      gen(r) {
        const k = r.pick([3, 4, 6, 8]);
        const ans = Math.ceil(k * Math.log2(10));
        return {
          prompt: t`A photon fired past a Schwarzschild black hole is captured if its impact parameter $b$ is below a critical value $b_c$, and escapes otherwise. Each trial integrates one photon orbit and reports only **captured** or **escaped**. Starting from the bracket $[5M, 6M]$, how many trials does bisection need to shrink the bracket below $10^{-${k}}M$?`,
          visual: {
            type: 'graph',
            params: { x: [-8, 4], y: [-6.8, 3.4], aspect: 'wide', equal: true, axesAt: 'edge', xlabel: 'x / M', ylabel: 'y / M', xticks: 6, yticks: 5,
              curves: [{ param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'ink', width: 2 }, { param: ['3*cos(t)', '3*sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1.2, dash: true },
                { fn: '-5.0', color: 'bad', width: 1.6, domain: [-20, 0] }, { fn: '-6.0', color: 'good', width: 1.6, domain: [-20, 0] }],
              points: [{ x: -7.5, y: -5, r: 0, label: 'b = 5M: captured', color: 'bad', labelDy: -12 }, { x: -7.5, y: -6, r: 0, label: 'b = 6M: escapes', color: 'good', labelDy: 12 }] },
            caption: 'Schematic: the horizon (solid, r = 2M), the photon sphere (dashed, 3M) and two incoming photon paths before they bend. Only their fates — captured or escaped — enter the bisection.',
          },
          answer: ans, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: ans - 1, feedback: t`Check the inequality: you need $1/2^n < 10^{-${k}}$, so $n > ${(k * Math.log2(10)).toFixed(2)}$, and $n$ is a whole number of trials.` }],
          hints: [t`After $n$ trials the bracket is $1M/2^n$ wide.`, t`Solve $2^{-n} < 10^{-${k}}$: $n > ${k}\log_2 10$.`],
          teach: 'Bisection needs only a yes-or-no answer per trial, which makes it the tool for thresholds found by experiment or by whole simulations.',
          explain: t`$n > ${k}\log_2 10 = ${(k * Math.log2(10)).toFixed(2)}$, so ${ans} trials. The answer converges to $b_c = 3\sqrt3\,M = ${(3 * Math.sqrt(3)).toFixed(6)}M$, the photon-sphere threshold — Newton's method could not even be applied, since “captured” has no derivative.`,
        };
      },
    }),
    num({
      id: 'cp-wien-nu', difficulty: 2, transfer: true,
      prompt: t`Per unit **frequency**, the Planck spectrum peaks where $x = h\nu/(k_BT)$ solves $x = 3(1 - e^{-x})$, with a root in $[2, 3]$. Find it to 4 significant figures (bisect by hand, in code, or any way you like).`,
      visual: {
        type: 'graph',
        params: { x: [1.8, 3.2], y: [-0.25, 0.3], aspect: 'wide', axesAt: 'edge', xlabel: 'x', ylabel: 'x − 3(1 − e⁻ˣ)',
          curves: [{ fn: 'x - 3*(1 - e^(-x))', color: 'accent', width: 2.2 }, { fn: '0', color: 'ink4', width: 1 }],
          vlines: [{ x: 2, color: 'ink3' }, { x: 3, color: 'ink3' }] },
        caption: 'The function whose root gives the frequency peak, on the bracket [2, 3].',
      },
      answer: ROOT_NU, tol: { rel: 0.0005 },
      errors: [{ value: ROOT, feedback: 'That is the root for the peak per unit wavelength, x = 5(1 − e⁻ˣ). Here the factor is 3.' }],
      hints: ['f(2) = 2 − 3(1 − e⁻²) < 0 and f(3) > 0. Try the midpoint 2.5.', 'Keep halving: about 12 steps give four significant figures.'],
      teach: 'Any continuous equation with a sign change can be solved to a stated accuracy by bisection, at a cost you can predict.',
      explain: t`$x = ${ROOT_NU.toFixed(6)}$. So the spectrum per unit frequency peaks at $h\nu_{\max} = ${ROOT_NU.toFixed(3)}\,k_BT$ — a different point of the spectrum from the wavelength peak, because the two densities differ by the Jacobian $d\nu/d\lambda$.`,
    }),
    mcq({
      id: 'cp-rate', difficulty: 2,
      prompt: t`A root finder’s guaranteed error bounds are $10^{-2}, 5\times10^{-3}, 2.5\times10^{-3}, 1.25\times10^{-3}, \ldots$ How would you describe its convergence, and how many steps does each new correct decimal digit cost?`,
      visual: {
        type: 'graph',
        params: { x: [-0.5, 10.5], y: [-5.2, -1.6], ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step n', ylabel: 'error bound',
          points: Array.from({ length: 11 }, (_, n) => ({ x: n, y: n12(-2 - n * lg(2)), r: 4, color: 'accent' })) },
        caption: 'The error bounds on a logarithmic axis: a straight line.',
      },
      choices: [
        'Linear with rate ½: log₂10 ≈ 3.3 steps per digit',
        'Quadratic: the number of digits doubles each step',
        'Linear with rate ½: one step per digit',
        'Sublinear: the steps get smaller and smaller',
      ],
      answer: 0,
      why: {
        1: 'Quadratic convergence would square the error: 10⁻², 10⁻⁴, 10⁻⁸. Here it only halves.',
        2: 'Halving gains log₁₀2 ≈ 0.3 of a digit per step, not a whole digit.',
        3: 'A constant ratio of ½ is linear convergence; on a log axis it is a straight line, not a curve that flattens.',
      },
      hints: ['What is the ratio of each bound to the one before?', 'A factor of 10 needs n halvings with 2ⁿ = 10.'],
      teach: 'Linear convergence with rate C gains −log₁₀C digits per step: for bisection, 0.30 digits, or 3.3 steps per digit.',
      explain: 'Each bound is half the previous one, a constant ratio C = ½: linear convergence, a straight line on a logarithmic axis. Ten times smaller needs log₂10 ≈ 3.32 halvings. Newton’s method, next, does far better near a simple root.',
    }),
  ],
  sources: [
    { label: 'Sauer (2018), Numerical Analysis, 3rd ed., Pearson, §1.1 (the bisection method)', url: 'https://openlibrary.org/isbn/9780134696454' },
    { label: 'Burden & Faires (2016), Numerical Analysis, 10th ed., Cengage, §2.1', url: 'https://openlibrary.org/isbn/9781305253667' },
    { label: 'CODATA 2018 / SI exact constants h, c, k and Wien’s displacement constant (NIST)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?bwien' },
  ],
});
