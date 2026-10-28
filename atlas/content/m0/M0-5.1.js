// Polynomial behaviour and roots — the leading term rules the ends, the factors rule the zeros.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { lab } from './_m0kit.js';

const t = String.raw;
// "(x − r)" as TeX and as an expression, for an integer root r
const fx = (r) => (r === 0 ? 'x' : `(x ${r > 0 ? '-' : '+'} ${Math.abs(r)})`);
const ENDS = ['rises on both sides', 'falls on both sides', 'falls on the left and rises on the right', 'rises on the left and falls on the right'];
const endIndex = (sign, n) => (n % 2 === 0 ? (sign > 0 ? 0 : 1) : (sign > 0 ? 2 : 3));

export default lesson({
  id: 'm0.M0-5.1',
  title: 'Polynomial behaviour and roots',
  minutes: 9, difficulty: 2,
  intro: t`A polynomial is a sum of whole-number powers. Two facts tell you most of its graph. Far from the origin, the **leading term** $a_n x^n$ outgrows all the others, so its sign and the parity of $n$ fix the **end behaviour**. Near the axis, the **factored form** shows the zeros:

$$p(x) = a_n x^n + \dots + a_1 x + a_0 = a_n\,(x - r_1)^{m_1}(x - r_2)^{m_2}\cdots$$

At a zero $r$ of odd **multiplicity** $m$ the graph crosses the axis; at even multiplicity it touches and turns back. A degree-$n$ polynomial has at most $n$ real zeros and at most $n - 1$ turning points.`,
  symbols: [
    { tex: 'p(x)', text: 'the polynomial' },
    { tex: 'n', text: 'the **degree**: the highest power of $x$ with a non-zero coefficient' },
    { tex: 'a_n', text: 'the **leading coefficient**: its sign, with $n$ odd or even, decides where the ends go' },
    { tex: 'a_0', text: 'the constant term: the $y$-intercept, $p(0) = a_0$' },
    { tex: 'r_k', text: 'a real zero (root): $p(r_k) = 0$, where the graph meets the $x$-axis' },
    { tex: 'm_k', text: 'the zero’s **multiplicity**: how many times its factor repeats. Odd crosses, even touches' },
  ],
  why: t`Polynomials are the first approximation to everything — Taylor series truncate to them — and their zeros are equilibria, resonances and characteristic frequencies. Reading the shape from the factors lets you sketch a model in seconds and spot an algebra slip by eye.`,
  visual: {
    type: 'graph',
    title: 'Ends from the leading term, zeros from the factors',
    lead: t`The curve is $p(x) = 0.3\,s\,(x - r)^m (x + 2)(x - 3)$. Slide the root $r$, change its multiplicity $m$, and flip the sign $s$.`,
    tasks: [
      t`Set $m = 2$: at $x = r$ the graph touches the axis and turns back. Set $m = 3$: it crosses, but flattens as it does.`,
      t`The degree is $m + 2$. With $s = +1$, an even degree sends both ends up; an odd degree sends the left end down.`,
      t`Slide $r$ onto $3$: two factors merge into one zero of higher multiplicity, and the crossing becomes a touch (or a flat crossing).`,
    ],
    params: {
      x: [-4, 5], y: [-10, 10], aspect: 'wide',
      sliders: [{ key: 'r', label: t`Movable root $r$`, min: -3.5, max: 4.5, step: 0.1, value: 1, explain: t`The zero whose factor $(x - r)$ is raised to the power $m$.` }],
      choices: [
        { key: 'm', label: t`Multiplicity $m$`, options: [[1, '1'], [2, '2'], [3, '3']], value: 2, explain: t`How many times the factor $(x - r)$ repeats.` },
        { key: 's', label: t`Sign $s$ of the leading coefficient`, options: [[1, '+1'], [-1, '−1']], value: 1, explain: 'Flips the whole graph over the x-axis.' },
      ],
      curves: [{ fn: '0.3*s*(x - r)^m*(x + 2)*(x - 3)', color: 'accent' }],
      points: [{ x: 'r', y: 0, color: 'gold', r: 5.5, label: 'r', labelDx: -4, labelDy: 18 }, { x: -2, y: 0, color: 'violet', r: 5, label: '−2', labelDx: -10, labelDy: 18 }, { x: 3, y: 0, color: 'violet', r: 5, label: '3', labelDx: -4, labelDy: 18 }],
      readouts: [{ label: 'degree', expr: 'm + 2', digits: 1 }, { label: t`leading coefficient`, expr: '0.3*s', digits: 2 }],
    },
    caption: t`Exact for these factors; the scale factor $0.3$ only keeps the hump inside the window. The ends leave the window: what they do beyond it is the end behaviour.`,
  },
  example: {
    prompt: t`Sketch $p(x) = -x(x - 2)^2(x + 3)$: its end behaviour, its zeros, and how it meets the axis at each.`,
    visual: { type: 'graph', params: { x: [-4, 3.5], y: [-14, 16], aspect: 'wide', curves: [{ fn: '-x*(x - 2)^2*(x + 3)', color: 'accent' }], points: [{ x: -3, y: 0, color: 'gold', r: 5, label: 'cross', labelDx: -16, labelDy: 18 }, { x: 0, y: 0, color: 'gold', r: 5, label: 'cross', labelDx: 8, labelDy: 18 }, { x: 2, y: 0, color: 'violet', r: 5, label: 'touch', labelDx: -14, labelDy: 18 }] }, caption: t`$y = -x(x - 2)^2(x + 3)$. Both ends fall; it crosses at $-3$ and $0$ and touches at $2$.` },
    steps: [
      { label: 'Degree and lead', text: t`Multiplying the highest powers, $-x \cdot x^2 \cdot x = -x^4$: degree $4$ (even), leading coefficient $-1$ (negative). Both ends fall.` },
      { label: 'Zeros', text: t`$x = 0$ (multiplicity $1$), $x = 2$ (multiplicity $2$), $x = -3$ (multiplicity $1$).` },
      { label: 'Cross or touch', text: t`Odd multiplicity crosses: at $-3$ and $0$. Even multiplicity touches: at $2$, where $(x - 2)^2 \ge 0$ never changes sign.` },
      { label: 'Test one interval', text: t`At $x = -1$: $-(-1)(9)(2) = 18 > 0$, so the graph is above the axis between $-3$ and $0$.` },
      { label: 'Assemble', text: t`From the left: rising from $-\infty$, crossing up at $-3$, over a hump, down through $0$, touching at $2$ from below, and falling away. Three turning points — the most a quartic can have.` },
    ],
    answer: t`Both ends down; crosses at $x = -3$ and $x = 0$, touches at $x = 2$.`,
  },
  practice: [
    mcq({
      id: 'end-behaviour', difficulty: 1,
      gen(r) {
        const n = r.pick([4, 5]), s = r.sign();
        const lead = s > 0 ? '' : '-', mid = s > 0 ? '-' : '+';
        const ans = endIndex(s, n), others = [0, 1, 2, 3].filter((i) => i !== ans);
        const choices = [ENDS[ans], ...others.map((i) => ENDS[i])];
        const reason = t`The leading term $${lead}x^{${n}}$ decides: degree ${n} is ${n % 2 ? 'odd' : 'even'} and the coefficient is ${s > 0 ? 'positive' : 'negative'}.`;
        return {
          prompt: t`How does the graph of $p(x) = ${lead}x^{${n}} ${mid} 12x^{${n - 2}} + 1$ behave far from the origin?`,
          visual: { type: 'graph', params: { x: [-1.8, 1.8], y: [-30, 30], aspect: 'wide', yticks: 0, curves: [{ fn: `${s}*(x^${n} - 12x^${n - 2}) + 1`, color: 'accent' }] }, caption: t`The graph for $|x| \le 1.8$ only, where the $12x^{${n - 2}}$ term still dominates. Do not trust it for the ends.` },
          choices,
          answer: 0,
          why: { 1: reason, 2: reason, 3: reason },
          hints: [t`For large $|x|$, $x^{${n}}$ beats $12x^{${n - 2}}$: at $x = 10$ it is ${n === 4 ? '$10\\,000$ against $1200$' : '$100\\,000$ against $12\\,000$'}.`, t`Which way does $${lead}x^{${n}}$ go as $x \to +\infty$ and as $x \to -\infty$?`],
          teach: t`End behaviour comes from the leading term alone: even degree sends both ends the same way, odd degree sends them opposite ways, and a negative coefficient flips the picture.`,
          explain: t`For large $|x|$, $p(x) \approx ${lead}x^{${n}}$, so the graph ${ENDS[ans]}. The window shows the opposite trend because near the origin $12x^{${n - 2}}$ is the bigger term — it is overtaken once $x^2 > 12$.`,
        };
      },
    }),
    mcq({
      id: 'touch-factor', difficulty: 2,
      gen(r) {
        const a = r.int(-3, 0), b = r.int(1, 3);
        const touchLeft = r.bool(0.5), T = touchLeft ? a : b, C = touchLeft ? b : a;
        return {
          prompt: t`This polynomial’s graph meets the $x$-axis at $x = ${Math.min(T, C)}$ and $x = ${Math.max(T, C)}$. Which formula is it?`,
          visual: { type: 'graph', params: { x: [-4.5, 4.5], y: [-14, 14], aspect: 'wide', curves: [{ fn: `${fx(T)}^2*${fx(C)}`, color: 'accent' }] }, caption: t`The graph meets the axis at two points; the leading coefficient is $+1$.` },
          choices: [t`$y = ${fx(T)}^2 ${fx(C)}$`, t`$y = ${fx(T)} ${fx(C)}^2$`, t`$y = ${fx(-T)}^2 ${fx(-C)}$`, t`$y = ${fx(T)} ${fx(C)}$`],
          answer: 0,
          why: {
            1: t`The squared factor belongs to the zero where the graph *touches*: at $x = ${T}$, not $x = ${C}$.`,
            2: t`Signs reversed: a zero at $x = ${T}$ comes from the factor $${fx(T)}$, which vanishes there.`,
            3: t`A product of two single factors is a parabola that crosses at both zeros; this graph only touches at one of them, and its ends go opposite ways (odd degree).`,
          },
          hints: [t`At which zero does the graph bounce back instead of crossing?`, t`A touching zero has an even power on its factor.`],
          teach: t`At a zero of even multiplicity the graph touches the axis; at odd multiplicity it crosses.`,
          explain: t`It touches at $x = ${T}$ (factor squared) and crosses at $x = ${C}$ (single factor). Degree $3$ with a positive lead: down on the left, up on the right ✓.`,
        };
      },
    }),
    expr({
      id: 'build-poly', difficulty: 2,
      gen(r) {
        const roots = r.shuffle([-3, -2, -1, 1, 2, 3]).slice(0, 3).sort((u, v) => u - v), a = r.pick([1, 2, -1, -2]);
        const c = a * -roots[0] * -roots[1] * -roots[2];
        const fac = roots.map(fx).join('');
        const ansTeX = `${a === 1 ? '' : a === -1 ? '-' : a}${fac}`;
        return {
          prompt: t`A cubic has zeros at $x = ${roots[0]}$, $${roots[1]}$ and $${roots[2]}$, and crosses the $y$-axis at $${c}$. Write it in factored form.`,
          lhs: 'p(x)',
          answer: `${a}*${fac}`, answerTeX: ansTeX,
          vars: { x: [-3, 3] }, form: 'factored',
          errors: [
            ...(a !== 1 ? [{ answer: fac, feedback: t`Those zeros are right, but this cubic has $p(0) = ${-roots[0] * -roots[1] * -roots[2]}$, not $${c}$. Scale it by a constant $a$.` }] : []),
            { answer: `${a}*${roots.map((q) => fx(-q)).join('')}`, feedback: t`A zero at $x = ${roots[0]}$ comes from the factor $${fx(roots[0])}$: the sign inside is the opposite of the zero’s.` },
          ],
          hints: [t`Start from $a\,${fac}$ and choose $a$.`, t`At $x = 0$ the product of the factors is $${-roots[0] * -roots[1] * -roots[2]}$; what $a$ makes $p(0) = ${c}$?`],
          teach: t`The zeros fix the factors; one more point fixes the leading coefficient.`,
          explain: t`$p(0) = a \cdot (${-roots[0]})(${-roots[1]})(${-roots[2]}) = ${c}$ gives $a = ${a}$, so $p(x) = ${ansTeX}$.`,
          visual: { type: 'graph', params: { x: [-4.5, 4.5], y: [-Math.abs(c) - 6, Math.abs(c) + 6], aspect: 'wide', points: [...roots.map((q) => ({ x: q, y: 0, color: 'gold', r: 5 })), { x: 0, y: c, color: 'violet', r: 5, label: `(0, ${lab(c)})`, labelDx: 8, labelDy: c > 0 ? -10 : 14 }] }, caption: t`The three zeros and the $y$-intercept: enough to pin down a cubic.` },
        };
      },
    }),
    mcq({
      id: 'sign-chart', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), b = r.int(1, 4);
        return {
          prompt: t`For which $x$ is $p(x) = (x + ${a})(x - ${b})^2 > 0$?`,
          visual: { type: 'graph', params: { x: [-a - 3, b + 3], y: [-6, 12], aspect: 'wide', curves: [{ fn: `x + ${a}`, color: 'gold', label: `x + ${a}`, labelAt: b + 1.5, labelDx: -10, labelDy: -14 }, { fn: `(x - ${b})^2`, color: 'violet', label: `(x − ${b})²`, labelAt: b - 2.6, labelDx: 10, labelDy: 0 }] }, caption: t`The two factors of $p$, drawn separately: $p$ is positive where their product is.` },
          choices: [t`$-${a} < x < ${b}$ or $x > ${b}$`, t`$x > -${a}$`, t`$x < -${a}$`, t`$-${a} < x < ${b}$`],
          answer: 0,
          why: {
            1: t`At $x = ${b}$ the factor $(x - ${b})^2$ is zero, so $p(${b}) = 0$, which is not $> 0$. That point must be removed.`,
            2: t`For $x < -${a}$ the factor $x + ${a}$ is negative and the square is positive: $p < 0$ there.`,
            3: t`A squared factor does not change sign: $p$ stays positive after $x = ${b}$, it only touches zero there.`,
          },
          hints: [t`$(x - ${b})^2$ is never negative. So the sign of $p$ is the sign of $x + ${a}$ — except where?`],
          teach: t`A factor of even multiplicity never changes the sign of a polynomial; it only creates a zero where the graph touches.`,
          explain: t`$(x - ${b})^2 > 0$ except at $x = ${b}$, so $p > 0$ exactly where $x + ${a} > 0$ and $x \ne ${b}$: $(-${a}, ${b}) \cup (${b}, \infty)$.`,
        };
      },
    }),
    num({
      id: 'turning-points', difficulty: 1,
      gen(r) {
        const n = r.int(5, 8);
        return {
          prompt: t`At most how many turning points (local maxima and minima) can a polynomial of degree $${n}$ have?`,
          answer: n - 1, tol: { rel: 0, abs: 0.4 },
          errors: [{ value: n, feedback: t`$${n}$ is the most *zeros* it can have. Between neighbouring zeros there is one turning point, so one fewer.` }],
          hints: [t`Its derivative has degree $${n - 1}$. How many zeros can that have?`],
          teach: t`A degree-$n$ polynomial has at most $n$ real zeros and at most $n - 1$ turning points.`,
          explain: t`Turning points are zeros of $p'$, a polynomial of degree $${n - 1}$, so there are at most $${n - 1}$ of them.`,
          visual: { type: 'graph', params: { x: [-3.2, 3.2], y: [-4, 4], aspect: 'wide', yticks: 0, curves: [{ fn: '0.25*(x + 2.6)*(x + 1.1)*(x - 0.6)*(x - 2.4)', color: 'accent' }] }, caption: t`A degree-4 example, for comparison: count its zeros and its turning points.` },
        };
      },
    }),
    mcq({
      id: 'double-well', difficulty: 3,
      prompt: t`A particle’s potential energy is $U(x) = x^4 - 4x^2 = x^2(x - 2)(x + 2)$ (in joules, with $x$ in metres). How does the graph of $U$ meet the $x$-axis?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-5, 9], aspect: 'wide', curves: [{ fn: 'x^2', color: 'gold', label: 'x²', labelAt: 2.4, labelDx: 8, labelDy: 0 }, { fn: '(x - 2)(x + 2)', color: 'violet', label: '(x − 2)(x + 2)', labelAt: -2.7, labelDx: 6, labelDy: 0 }] }, caption: t`The two factors of $U$, drawn separately. $U$ is their product.` },
      choices: [t`It touches at $x = 0$ and crosses at $x = \pm 2$`, t`It crosses at $x = 0$ and at $x = \pm 2$`, t`It touches at $x = \pm 2$ and crosses at $x = 0$`, t`It meets the axis only at $x = \pm 2$`],
      answer: 0,
      why: {
        1: t`$x = 0$ is a double zero (from $x^2$), so $U$ does not change sign there: it is negative on both sides near $0$.`,
        2: t`The multiplicities are swapped: $x - 2$ and $x + 2$ appear once each, $x$ twice.`,
        3: t`$U(0) = 0$ too: the factor $x^2$ vanishes at $x = 0$.`,
      },
      hints: [t`List the zeros with their multiplicities from the factored form.`, t`Even multiplicity touches; odd crosses.`],
      teach: t`Read multiplicities from the factored form: here $x^2$ gives a double zero at the origin.`,
      explain: t`$U$ touches zero at $x = 0$ from below — a local maximum, an unstable equilibrium — and crosses at $\pm 2$. Between them lie two wells with minima at $x = \pm\sqrt2$, where $U = -4$ J. This double well models everything from a buckled strut to the ammonia molecule.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-graph-formula', difficulty: 2,
      gen(r) {
        const c = r.int(-3, -1), d = r.int(1, 2);
        return {
          prompt: t`This cubic’s graph meets the $x$-axis at $x = ${c}$ and $x = ${d}$. Which formula is it?`,
          visual: { type: 'graph', params: { x: [-4.5, 4], y: [-12, 12], aspect: 'wide', curves: [{ fn: `-${fx(c)}*${fx(d)}^2`, color: 'accent' }] }, caption: t`A cubic, with scales.` },
          choices: [t`$y = -${fx(c)}${fx(d)}^2$`, t`$y = ${fx(c)}${fx(d)}^2$`, t`$y = -${fx(-c)}${fx(-d)}^2$`, t`$y = -${fx(c)}^2${fx(d)}$`],
          answer: 0,
          why: {
            1: t`With a positive leading coefficient the right end would rise. This graph falls on the right.`,
            2: t`The factor for a zero at $x = ${c}$ is $${fx(c)}$: these factors put the zeros at $${-c}$ and $${-d}$.`,
            3: t`The graph *touches* at $x = ${d}$ and crosses at $x = ${c}$, so the square belongs on $${fx(d)}$.`,
          },
          hints: [t`Find the zeros, decide touch or cross at each, then check the right end.`],
          teach: t`Zeros give the factors, touching gives the even powers, and the ends give the sign of the leading coefficient.`,
          explain: t`Crosses at $${c}$: $${fx(c)}$. Touches at $${d}$: $${fx(d)}^2$. Rises on the left and falls on the right with odd degree: negative leading coefficient.`,
        };
      },
    }),
    num({
      id: 'cp-leading-coef', difficulty: 2,
      gen(r) {
        const p = r.int(1, 3), q = r.intExcept(-3, -1, [-p]), a = r.pick([2, 3, -2, -3]);
        const c = a * p * p * -q;
        return {
          prompt: t`A cubic has a double zero at $x = ${p}$, a single zero at $x = ${q}$, and $y$-intercept $${c}$. What is its leading coefficient?`,
          answer: a, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: c, feedback: t`That is the $y$-intercept. Divide it by the value of $${fx(p)}^2${fx(q)}$ at $x = 0$.` }, { value: -a, feedback: t`Check the sign: at $x = 0$, $${fx(p)}^2${fx(q)} = (${-p})^2(${-q}) = ${p * p * -q}$.` }],
          hints: [t`$p(x) = a\,${fx(p)}^2 ${fx(q)}$.`, t`Set $x = 0$: $a \cdot ${p * p * -q} = ${c}$.`],
          teach: t`With the zeros known, one more point — often the $y$-intercept — fixes the leading coefficient.`,
          explain: t`$p(0) = a\,(${-p})^2(${-q}) = ${p * p * -q}\,a = ${c}$, so $a = ${a}$.`,
          visual: { type: 'graph', params: { x: [-4.5, 4.5], y: [-Math.abs(c) - 8, Math.abs(c) + 8], aspect: 'wide', points: [{ x: p, y: 0, color: 'violet', r: 5, label: 'double', labelDx: -16, labelDy: 18 }, { x: q, y: 0, color: 'gold', r: 5, label: 'single', labelDx: -16, labelDy: 18 }, { x: 0, y: c, color: 'teal', r: 5, label: `(0, ${lab(c)})`, labelDx: 8, labelDy: c > 0 ? -10 : 14 }] }, caption: t`The zeros and the $y$-intercept; the curve itself is for you to infer.` },
        };
      },
    }),
    mcq({
      id: 'cp-cantilever', difficulty: 3, transfer: true,
      prompt: t`A wing spar is modelled as a cantilever: clamped at the root $x = 0$, free at the tip $x = L$, carrying a uniform load. Beam theory gives its downward deflection as
$$y(x) = \frac{w}{24EI}\,x^2\left(x^2 - 4Lx + 6L^2\right),$$
where the quadratic factor has no real zeros. At the root the graph of $y$ touches zero without crossing. What does that reflect?`,
      visual: { type: 'graph', params: { x: [-0.4, 1.2], y: [-0.25, 3.6], aspect: 'wide', xlabel: 'x / L', ylabel: 'deflection', yticks: 0, curves: [{ fn: 'x^2*(x^2 - 4x + 6)', color: 'ink3', dash: true, domain: [-0.4, 0] }, { fn: 'x^2*(x^2 - 4x + 6)', color: 'accent', domain: [0, 1] }], vlines: [{ x: 0, label: 'root (clamped)', color: 'ink3' }, { x: 1, label: 'tip', color: 'ink3' }] }, caption: t`Deflection (drawn upward here) against position along the span, in units of $wL^4/24EI$. The dashed part is the formula continued past the wall, where there is no beam. Small-deflection beam theory.` },
      choices: [
        t`The double zero from $x^2$: zero deflection **and** zero slope at the root — a clamped joint`,
        t`A single zero: the spar is pinned at the root and free to rotate there`,
        t`The quadratic factor $x^2 - 4Lx + 6L^2$ vanishes at the root`,
        t`The positive leading coefficient, which makes every polynomial touch at its smallest zero`,
      ],
      answer: 0,
      why: {
        1: t`A single zero would make the graph cross with a non-zero slope — that is what a pin (hinge) allows. Here the factor is $x^2$.`,
        2: t`At $x = 0$ it equals $6L^2 \ne 0$; its discriminant $16L^2 - 24L^2$ is negative, so it never vanishes.`,
        3: t`The leading coefficient fixes the ends, not how the graph meets the axis; that is the multiplicity’s job.`,
      },
      hints: [t`Which factor vanishes at $x = 0$, and with what multiplicity?`, t`A double zero means both $y$ and its slope are zero there.`],
      teach: t`A double zero is a touch: the function and its slope vanish together — the mathematical signature of a clamped end.`,
      explain: t`The factor $x^2$ gives a double zero, so $y(0) = 0$ and $y'(0) = 0$: the spar leaves the wall horizontally, as a clamp forces it to. A pinned end would give a single zero, crossing at an angle.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §3.3 Power Functions and Polynomial Functions', url: 'https://openstax.org/books/precalculus-2e/pages/3-3-power-functions-and-polynomial-functions' },
    { label: 'OpenStax Precalculus 2e, §3.4 Graphs of Polynomial Functions', url: 'https://openstax.org/books/precalculus-2e/pages/3-4-graphs-of-polynomial-functions' },
  ],
});
