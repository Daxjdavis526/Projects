// Area and Riemann sums — chop the interval into strips, replace each strip by
// a rectangle, add. With measured data it is the only option; with a formula
// it is the road to the definite integral.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, fitY } from './_c1kit.js';
import { thou } from './_c1int.js';

const t = String.raw;

// a Riemann-sum picture (no readouts, so it never shows the answer)
const riemannFig = (fn, a, b, n, rule, x, y, caption, more = {}) => ({
  type: 'graph',
  params: { x, y, aspect: 'wide', curves: [{ fn, color: 'accent' }], riemann: { fn, from: a, to: b, n, rule }, ...more },
  caption,
});

// rectangles for sampled data: the step function through the left (or right) samples, as an expression
function stepExpr(xs, ys, side) {
  const v = side === 'left' ? ys.slice(0, -1) : ys.slice(1);
  let s = N(v[0]);
  for (let i = 1; i < v.length; i++) s += ` + (${N(v[i] - v[i - 1])})*step(x - ${N(xs[i])})`;
  return s;
}
const dataFig = (xs, ys, side, x, y, xlabel, ylabel, caption, curve) => ({
  type: 'graph',
  params: {
    x, y, aspect: 'wide', xlabel, ylabel,
    shade: [{ fn: stepExpr(xs, ys, side), from: xs[0], to: xs[xs.length - 1], color: 'warn', alpha: 0.22 }],
    curves: [
      ...(curve ? [{ fn: curve, color: 'ink3', dash: true, width: 1.4, domain: [xs[0], xs[xs.length - 1]] }] : []),
      // crisp rectangle edges: each strip's two sides and its top
      ...xs.slice(0, -1).flatMap((x0, i) => {
        const h = side === 'left' ? ys[i] : ys[i + 1], x1 = xs[i + 1];
        return [{ param: [N(x0), 't'], t: [0, h], color: 'warn', width: 1 }, { param: [N(x1), 't'], t: [0, h], color: 'warn', width: 1 }, { fn: N(h), domain: [x0, x1], color: 'warn', width: 1 }];
      }),
    ],
    points: xs.map((xx, i) => ({ x: xx, y: ys[i], color: 'accent' })),
  },
  caption,
});

// the worked example: a blowdown engine’s propellant flow, logged every 10 s
const FLOW = (s) => 250 - 0.4 * s - 0.07 * s * s;
const TS = [0, 10, 20, 30, 40], MS = TS.map((s) => Math.round(FLOW(s)));
const LEFT = 10 * (MS[0] + MS[1] + MS[2] + MS[3]), RIGHT = 10 * (MS[1] + MS[2] + MS[3] + MS[4]);

const left = (f, a, b, n) => { let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + i * h); return s * h; };
const right = (f, a, b, n) => left(f, a + (b - a) / n, b + (b - a) / n, n);

export default lesson({
  id: 'math1210.C1-5.2',
  title: 'Area and Riemann sums',
  minutes: 9, difficulty: 2,
  intro: t`To find the area under a curve — or the total of anything whose rate is graphed — cut the interval $[a, b]$ into $n$ strips of width $\Delta x = (b - a)/n$, stand a rectangle on each strip at the height of the curve at some sample point $x_i^*$, and add:

$$\sum_{i=1}^{n} f(x_i^*)\,\Delta x$$

Sampling at the left ends gives the **left sum** $L_n$, at the right ends the **right sum** $R_n$, at the middles the **midpoint sum** $M_n$. For an increasing function the left sum is too small and the right sum too big, so the true value is trapped between them; more strips squeeze the gap. A sum like this is the only option when the rate comes from a logger, not a formula.`,
  symbols: [
    { tex: '\\sum_{i=1}^{n}', text: 'sigma notation: add the terms for $i = 1, 2, \\ldots, n$' },
    { tex: 'n', text: 'the number of strips' },
    { tex: '\\Delta x', text: 'the width of each strip, $(b - a)/n$' },
    { tex: 'x_i^*', text: 'the sample point in strip $i$: its left end, right end or middle' },
    { tex: 'f(x_i^*)\\,\\Delta x', text: 'one rectangle: height times width — with units, e.g. (kg/s) × s = kg' },
  ],
  why: t`Rate times time, added up strip by strip, is how a flight computer turns a flow meter into propellant used and an accelerometer into velocity — and in the limit of thin strips it becomes the definite integral.`,
  visual: {
    type: 'graph',
    title: 'Rectangles closing in on an area',
    lead: t`The area under $f(x) = \tfrac14x^2 + 1$ from $0$ to $4$ is approximated by $n$ rectangles. Change $n$ and the sampling rule, and compare the sum with the exact area.`,
    tasks: [
      'With n = 4, the left sum is below the exact area and the right sum above: f is increasing.',
      'Double n a few times: the error of the left and right sums roughly halves each time.',
      'Switch to midpoints: at n = 4 it is already closer than the left sum at n = 32.',
    ],
    params: {
      x: [-0.3, 4.4], y: [-0.4, 5.6], aspect: 'wide',
      sliders: [{ key: 'n', label: t`Strips $n$`, min: 1, max: 64, step: 1, value: 4, explain: 'How many rectangles the interval is cut into.' }],
      choices: [{ key: 'rule', label: 'Sample point', options: [['left', 'Left ends'], ['right', 'Right ends'], ['mid', 'Midpoints']], value: 'left', explain: 'Where in each strip the rectangle takes its height.' }],
      curves: [{ fn: 'x^2/4 + 1', color: 'accent' }],
      riemann: { fn: 'x^2/4 + 1', from: 0, to: 4, n: 'n', rule: 'rule' },
      readouts: [
        { label: 'sum of rectangles', expr: 'riemann', digits: 5 },
        { label: 'exact area', expr: 'integral', digits: 5 },
        { label: 'error', expr: 'riemann - integral', digits: 3 },
      ],
    },
    caption: t`The exact area, $28/3 \approx 9.333$, is computed numerically here; the next two lessons show how to get it exactly.`,
  },
  example: {
    prompt: t`A pressure-fed engine’s propellant flow falls as its tank empties. The flow meter logs $\dot m$ (kg/s) every $10$ s: $\;${MS.join(',\\ ')}$ at $t = 0, 10, 20, 30, 40$ s. Estimate the propellant burned in those $40$ s, and bound the error.`,
    visual: dataFig(TS, MS, 'left', [-2, 44], [-15, 280], 't (s)', 'ṁ (kg/s)', t`The five readings (blue) and the left-sum rectangles (amber). The dashed curve is one smooth flow consistent with the readings; nobody knows the flow between samples for sure.`, '250 - 0.4*x - 0.07*x^2'),
    steps: [
      { label: 'Strips', text: t`Four strips of $\Delta t = 10$ s. Each rectangle is a flow rate times a time: (kg/s)·s = kg.` },
      { label: 'Left sum', text: t`$L_4 = 10\,(${MS.slice(0, 4).join(' + ')}) = ${thou(LEFT)}$ kg.` },
      { label: 'Right sum', text: t`$R_4 = 10\,(${MS.slice(1).join(' + ')}) = ${thou(RIGHT)}$ kg.` },
      { label: 'Which way is each off', text: t`The flow only falls, so on each strip the left end is the highest value and the right end the lowest: $L_4$ overestimates and $R_4$ underestimates. The true mass lies between $${thou(RIGHT)}$ and $${thou(LEFT)}$ kg.` },
      { label: 'Best single number', text: t`Their average, $${thou((LEFT + RIGHT) / 2)}$ kg, is the trapezoid estimate (Calculus II). The gap between the bounds, $${thou(LEFT - RIGHT)}$ kg, is set by the logging rate: halve $\Delta t$ and it halves.` },
    ],
    answer: t`Between $${thou(RIGHT)}$ kg and $${thou(LEFT)}$ kg; about $${thou((LEFT + RIGHT) / 2)}$ kg.`,
  },
  practice: [
    num({
      id: 'sigma-eval', difficulty: 1,
      gen(r) {
        const n = r.int(4, 9), S = n * n + 2 * n;
        return {
          prompt: t`Evaluate $\displaystyle\sum_{i=1}^{${n}} (2i + 1)$.`,
          answer: S, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: S + 1, feedback: t`Start at $i = 1$, whose term is $3$; you included an $i = 0$ term.` }, { value: n * n + n, feedback: t`$\sum 1 = ${n}$, and $\sum 2i = 2\cdot\frac{${n}\cdot${n + 1}}{2}$.` }],
          hints: [t`Split it: $2\sum i + \sum 1$, with $\sum_{i=1}^{n} i = \tfrac{n(n + 1)}{2}$.`, t`$2\cdot\frac{${n}\cdot${n + 1}}{2} + ${n}$.`],
          teach: t`Sigma notation splits over sums and constant multiples: $\sum(2i + 1) = 2\sum i + \sum 1$.`,
          explain: t`$${n}\cdot${n + 1} + ${n} = ${S}$. The terms are $3, 5, 7, \ldots, ${2 * n + 1}$ — the bars in the picture.`,
          visual: { type: 'graph', params: { x: [-0.5, n + 0.5], y: [-1, 2 * n + 3], aspect: 'wide', xlabel: 'i', ylabel: 'term', riemann: { fn: '2*x + 3', from: 0, to: n, n, rule: 'left' } }, caption: t`One bar per term, of width $1$ and heights $3, 5, 7, \ldots$; the sum is their total area.` },
        };
      },
    }),
    num({
      id: 'left-sum', difficulty: 2,
      gen(r) {
        const c = r.int(1, 3), b = r.pick([2, 6]), n = 4, f = (x) => x * x + c, L = left(f, 0, b, n);
        return {
          prompt: t`Compute the left sum $L_4$ for $f(x) = x^2 + ${c}$ on $[0, ${b}]$.`,
          answer: L, tol: { rel: 0.002 },
          errors: [{ value: right(f, 0, b, n), feedback: 'That is the right sum: the left sum samples at x = 0, Δx, 2Δx, 3Δx.' }, { value: L / (b / n), feedback: t`Multiply the sum of heights by the width $\Delta x = ${nice(b / n)}$.` }],
          hints: [t`$\Delta x = ${b}/4 = ${nice(b / 4)}$; the left ends are $0, ${nice(b / 4)}, ${nice(b / 2)}, ${nice(3 * b / 4)}$.`, t`$L_4 = ${nice(b / 4)}\,\big(f(0) + f(${nice(b / 4)}) + f(${nice(b / 2)}) + f(${nice(3 * b / 4)})\big)$.`],
          teach: 'Left sum: heights at the left end of every strip, times the common width.',
          explain: t`$${nice(b / 4)}\,(${[0, 1, 2, 3].map((i) => nice(f(i * b / 4))).join(' + ')}) = ${nice(L, 5)}$. The exact area is $${nice(b ** 3 / 3 + c * b, 4)}$, so this underestimates — $f$ increases.`,
          visual: riemannFig(`x^2 + ${c}`, 0, b, n, 'left', [-0.2 * b / 2, 1.1 * b], [-0.06 * (b * b + c), 1.1 * (b * b + c)], t`$f(x) = x^2 + ${c}$ with its four left-end rectangles.`),
        };
      },
    }),
    num({
      id: 'right-sum-recip', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5]), f = (x) => 1 / x, R = right(f, 1, 3, n);
        return {
          prompt: t`Compute the right sum $R_{${n}}$ for $f(x) = \dfrac1x$ on $[1, 3]$. Give 4 significant figures.`,
          answer: R, tol: { rel: 0.0005 },
          errors: [{ value: left(f, 1, 3, n), feedback: 'That is the left sum. The right sum samples the right end of each strip.' }],
          hints: [t`$\Delta x = 2/${n} = ${nice(2 / n)}$; the right ends are $${Array.from({ length: n }, (_, i) => nice(1 + (i + 1) * 2 / n)).join(',\\ ')}$.`],
          teach: 'Right sum: heights at the right end of every strip; for a decreasing function it underestimates.',
          explain: t`$${nice(2 / n)}\,\left(${Array.from({ length: n }, (_, i) => t`\tfrac{1}{${nice(1 + (i + 1) * 2 / n)}}`).join(' + ')}\right) = ${nice(R, 5)}$, below the exact area $\ln 3 = 1.0986$, because $1/x$ decreases.`,
          visual: riemannFig('1/x', 1, 3, n, 'right', [0.5, 3.3], [-0.08, 1.15], t`$y = 1/x$ on $[1, 3]$ with ${n} right-end rectangles.`, { curves: [{ fn: '1/x', color: 'accent', domain: [0.55, 3.3] }] }),
        };
      },
    }),
    mcq({
      id: 'over-under', difficulty: 2,
      prompt: t`$f$ is **decreasing** on $[a, b]$. For every $n$, which is true of the left sum $L_n$, the right sum $R_n$ and the true area $A$?`,
      visual: riemannFig('2*e^(-x/2)', 0, 4, 4, 'left', [-0.3, 4.4], [-0.15, 2.3], 'A decreasing function with its left-end rectangles: each one pokes above the curve.'),
      choices: [t`$R_n \le A \le L_n$`, t`$L_n \le A \le R_n$`, t`$L_n = R_n = A$`, 'It depends on n'],
      answer: 0,
      why: {
        1: 'That is the order for an increasing function. Here the left end of each strip is its highest point.',
        2: 'They agree only for a constant function. In the picture the rectangles visibly overshoot.',
        3: 'For a monotone function the order is the same for every n; only the size of the gaps changes.',
      },
      hints: ['On one strip of a falling curve, where is the curve highest: at the left end or the right end?'],
      teach: 'For a decreasing function, left-end rectangles overshoot and right-end rectangles undershoot; for an increasing one, the reverse.',
      explain: t`On every strip the left end is the highest point and the right end the lowest, so each left rectangle contains the area under the curve and each right rectangle fits inside it: $R_n \le A \le L_n$.`,
    }),
    mcq({
      id: 'which-sigma', difficulty: 2,
      prompt: t`Which sum is the **right** sum $R_4$ for $\displaystyle\int_0^2 x^2\,dx$?`,
      visual: riemannFig('x^2', 0, 2, 4, 'right', [-0.2, 2.2], [-0.25, 4.4], 'x² on [0, 2] with four right-end rectangles of width 0.5.'),
      choices: [
        t`$\displaystyle\sum_{i=1}^{4}\left(\frac{i}{2}\right)^2\cdot\frac12$`,
        t`$\displaystyle\sum_{i=0}^{3}\left(\frac{i}{2}\right)^2\cdot\frac12$`,
        t`$\displaystyle\sum_{i=1}^{4}\left(\frac{i}{2}\right)^2$`,
        t`$\displaystyle\sum_{i=1}^{4}\left(\frac{i}{4}\right)^2\cdot\frac12$`,
      ],
      answer: 0,
      why: {
        1: t`Running $i$ from $0$ to $3$ samples the left ends: that is $L_4$.`,
        2: t`The widths are missing: each height must be multiplied by $\Delta x = \tfrac12$.`,
        3: t`The right ends are at $x_i = i\,\Delta x = i/2$, not $i/4$ — that would only reach $x = 1$.`,
      },
      hints: [t`$\Delta x = \tfrac{2 - 0}{4} = \tfrac12$, so the right ends are $x_i = \tfrac{i}{2}$ for $i = 1, \ldots, 4$.`],
      teach: t`$R_n = \sum_{i=1}^{n} f(a + i\Delta x)\,\Delta x$; starting at $i = 0$ and stopping at $n - 1$ gives $L_n$.`,
      explain: t`$x_i = \tfrac{i}{2}$ for $i = 1$ to $4$, height $x_i^2$, width $\tfrac12$: $\sum_{i=1}^4 (i/2)^2\cdot\tfrac12 = \tfrac12(0.25 + 1 + 2.25 + 4) = 3.75$.`,
    }),
    num({
      id: 'tank-fill', difficulty: 3,
      gen(r) {
        const base = r.pick([[120, 150, 165, 172, 176], [80, 110, 128, 138, 142], [200, 240, 262, 275, 280]]);
        const k = r.pick([5, 10]), ts = base.map((_, i) => i * k);
        const L = k * (base[0] + base[1] + base[2] + base[3]), R = k * (base[1] + base[2] + base[3] + base[4]);
        return {
          prompt: t`A transfer pump fills a ground tank. Its flow rate, logged every ${k} min, is $\;${base.join(',\\ ')}$ L/min at $t = ${ts.join(', ')}$ min, and it only ever increases. Give the **smallest upper bound** on the volume delivered that these readings guarantee, in litres.`,
          answer: R, units: 'L', tol: { rel: 0.002 },
          errors: [{ value: L, feedback: 'That is the left sum — for a rising rate it is the lower bound.' }, { value: R / k, feedback: t`Multiply each reading by the $${k}$-minute strip width.` }],
          hints: ['For an increasing rate, which end of each strip gives a rectangle that is at least as tall as the curve?', t`The right sum: $${k}\,(${base.slice(1).join(' + ')})$.`],
          teach: 'For a monotone rate, the left and right sums of the log are guaranteed bounds on the total.',
          explain: t`On each strip the flow is at most its right-end value, so the volume is at most $R_4 = ${k}\,(${base.slice(1).join(' + ')}) = ${thou(R)}$ L. (It is at least $L_4 = ${thou(L)}$ L.)`,
          visual: dataFig(ts, base, 'right', [-0.05 * 4 * k, 4.4 * k], [-0.05 * base[4], 1.15 * base[4]], 't (min)', 'flow (L/min)', 'The logged flow rates and the right-end rectangles built on them.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-right-exp', difficulty: 2,
      gen(r) {
        const n = r.pick([4, 5]), k = r.pick([1, 2]), f = (x) => Math.exp(k * x), R = right(f, 0, 1, n);
        return {
          prompt: t`Compute the right sum $R_{${n}}$ for $f(x) = e^{${k === 1 ? '' : k}x}$ on $[0, 1]$. Give 4 significant figures.`,
          answer: R, tol: { rel: 0.0005 },
          errors: [{ value: left(f, 0, 1, n), feedback: 'That is the left sum. Use the right end of each strip.' }],
          hints: [t`$\Delta x = 1/${n}$; the right ends are $${Array.from({ length: n }, (_, i) => nice((i + 1) / n)).join(',\\ ')}$.`],
          teach: 'Right sum: width times the sum of the heights at the right ends.',
          explain: t`$R_{${n}} = \tfrac1{${n}}\sum_{i=1}^{${n}} e^{${k === 1 ? '' : k}i/${n}} = ${nice(R, 5)}$, above the exact $${nice((Math.exp(k) - 1) / k, 5)}$ because $e^{${k === 1 ? '' : k}x}$ increases.`,
          visual: riemannFig(`e^(${k}*x)`, 0, 1, n, 'right', [-0.1, 1.15], fitY((x) => Math.exp(k * x), 0, 1.1).map((v, i) => (i ? v : -0.2)), t`$y = e^{${k === 1 ? '' : k}x}$ with ${n} right-end rectangles.`),
        };
      },
    }),
    num({
      id: 'cp-solar', difficulty: 3, transfer: true,
      gen(r) {
        const s = r.pick([1, 1.5, 2]), P = [8, 14, 18, 20, 18, 14, 8].map((p) => p * s), ts = P.map((_, i) => i * 10);
        const sumL = P.slice(0, 6).reduce((a, b) => a + b, 0), E = sumL * 10 / 60;
        return {
          prompt: t`During a $60$-minute sunlit pass, a CubeSat logs its solar-array power every $10$ minutes: $\;${P.map((p) => nice(p)).join(',\\ ')}$ W. Estimate the energy collected with the **left** sum, in watt-hours (Wh).`,
          answer: E, units: 'Wh', tol: { rel: 0.003 },
          errors: [{ value: sumL * 10, feedback: t`That is in W·min. A $10$-minute strip is $\tfrac16$ h.` }, { value: sumL, feedback: t`Multiply the summed powers by the strip width, $\tfrac16$ h.` }],
          hints: ['Energy = power × time, strip by strip.', t`$\Delta t = 10\ \text{min} = \tfrac16\ \text{h}$. Left ends: the first six readings.`],
          teach: 'A Riemann sum of a power log is an energy: watts times hours gives watt-hours.',
          explain: t`$\tfrac16\,(${P.slice(0, 6).map((p) => nice(p)).join(' + ')}) = \tfrac{${nice(sumL)}}{6} = ${nice(E, 4)}$ Wh. The power rises and falls, so the left sum is neither a guaranteed upper nor lower bound here.`,
          visual: dataFig(ts, P, 'left', [-3, 64], [-0.06 * 20 * s, 1.18 * 20 * s], 't (min)', 'P (W)', 'The power log with left-end rectangles. The power peaks when the array faces the Sun most squarely.'),
        };
      },
    }),
    mcq({
      id: 'cp-limit-n', difficulty: 2,
      prompt: t`For a continuous function on $[a, b]$, what happens to $L_n$, $R_n$ and $M_n$ as the number of strips $n \to \infty$?`,
      visual: riemannFig('1 + sin(x)', 0, 5, 24, 'mid', [-0.3, 5.3], [-0.15, 2.3], 'Twenty-four midpoint rectangles: already hard to tell from the area under the curve.'),
      choices: [
        'All three approach the same number: the definite integral of f from a to b',
        'They approach three different limits, one for each rule',
        'They grow without bound, because more and more rectangles are added',
        'They all approach 0, because each rectangle gets thinner',
      ],
      answer: 0,
      why: {
        1: 'The sampling rule matters less and less as the strips shrink; the differences between the rules go to 0.',
        2: 'More rectangles, but each is thinner: Δx = (b − a)/n shrinks as n grows, and the total stays near the area.',
        3: 'Each rectangle shrinks, but there are more of them; the total does not vanish.',
      },
      hints: ['How does the gap between the left and right sums change as the strips get thinner?'],
      teach: 'As the strips get thinner, every Riemann sum of a continuous function approaches one number — that limit is the definite integral.',
      explain: t`For continuous $f$, $|R_n - L_n|$ shrinks to $0$ and every sampling rule converges to the same limit, $\int_a^b f(x)\,dx$ — the subject of the next lesson.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §5.1 Approximating areas', url: 'https://openstax.org/books/calculus-volume-1/pages/5-1-approximating-areas' }],
});
