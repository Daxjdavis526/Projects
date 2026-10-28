// Inequalities and absolute value — solution sets drawn on the number line.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, sgn, numberLine, bothSides, thou } from './_m0kit.js';

const t = String.raw;
const on = (k) => `step(0.5 - abs(mode - ${k}))`;

// multiplying by −1 as a reflection of the number line: order reverses
const flipFig = numberLine({
  x: [-7, 7], xlabel: 'x', points: [{ x: 2, label: '2' }, { x: 5, label: '5' }, { x: -2, label: '−2', color: 'violet' }, { x: -5, label: '−5', color: 'violet' }],
  arrows: [{ from: [2, 0.12], to: [-2, 0.12], color: 'violet', width: 1.6, dash: true }, { from: [5, 0.32], to: [-5, 0.32], color: 'violet', width: 1.6, dash: true }],
  caption: t`Multiplying by $-1$ reflects the number line through $0$: $2 < 5$, but $-2 > -5$. The order of every pair reverses.`,
});

export default lesson({
  id: 'm0.M0-3.3',
  title: 'Inequalities and absolute value',
  minutes: 9, difficulty: 2,
  intro: t`An inequality’s answer is a **set** — an interval or a union of intervals on the number line. Solve it like an equation, with one extra rule: **multiplying or dividing by a negative number reverses the inequality**. Absolute value measures distance from zero, so

$$|x - a| < \delta \iff a - \delta < x < a + \delta$$

says “$x$ lies within $\delta$ of $a$” — the language of tolerances, error bars and, later, limits.`,
  symbols: [
    { tex: '|x - a|', text: 'the distance between $x$ and $a$ on the number line (never negative)' },
    { tex: 'a', text: 'the centre: the target or nominal value' },
    { tex: '\\delta', text: 'delta, the allowed distance: a tolerance or error bound (positive)' },
    { tex: '\\iff', text: '“if and only if”: the two statements say exactly the same thing' },
    { tex: '<,\\ \\le', text: 'strict and non-strict: an open circle excludes the endpoint, a filled dot includes it' },
  ],
  why: t`Every engineering tolerance and every measurement $x = a \pm \delta$ is an absolute-value inequality, and the definition of a limit in calculus is two of them nested together.`,
  visual: {
    type: 'graph',
    title: 'Distance from a centre',
    lead: t`The V is $y = |x - a|$, the distance from $a$; the dashed line is $y = \delta$. Where the V is below the line, $x$ is within $\delta$ of $a$: the solution set is drawn on the axis. Switch to “farther than” to see the opposite set.`,
    tasks: [
      t`Shrink $\delta$: the interval tightens around $a$ — the picture behind every limit.`,
      t`Switch to $|x - a| > \delta$: the solution becomes two separate rays, joined by “or”.`,
      t`Move $a$: the whole picture slides; the interval’s width stays $2\delta$.`,
    ],
    params: {
      x: [-6, 8], y: [-0.6, 6],
      sliders: [
        { key: 'a', label: t`Centre $a$`, min: -2, max: 4, step: 0.5, value: 1, explain: t`The value $x$ is measured from.` },
        { key: 'd', label: t`Tolerance $\delta$`, min: 0.5, max: 4, step: 0.25, value: 2, explain: t`How far from $a$ is allowed.` },
      ],
      choices: [{ key: 'mode', label: 'Inequality', options: [[1, t`$|x - a| < \delta$`], [2, t`$|x - a| > \delta$`]], value: 1 }],
      curves: [
        { fn: 'abs(x - a)', color: 'accent' },
        { fn: '0', domain: ['a - d', 'a + d'], color: 'gold', width: 7, when: on(1) },
        { fn: '0', domain: [-6, 'a - d'], color: 'gold', width: 7, when: on(2) }, { fn: '0', domain: ['a + d', 8], color: 'gold', width: 7, when: on(2) },
      ],
      hlines: [{ y: 'd', label: 'y = δ', color: 'ink3' }],
      points: [{ x: 'a - d', y: 0, hollow: true, color: 'gold', r: 5 }, { x: 'a + d', y: 0, hollow: true, color: 'gold', r: 5 }, { x: 'a', y: 0, color: 'accent', r: 3.5, label: 'a', labelDy: 16, labelDx: -3 }],
      readouts: [{ label: t`left end $a - \delta$`, expr: 'a - d', digits: 3 }, { label: t`right end $a + \delta$`, expr: 'a + d', digits: 3 }],
    },
    caption: t`Open circles: the endpoints are excluded because the inequalities are strict. With $\le$ or $\ge$ they would be filled.`,
  },
  example: {
    prompt: t`Solve $|2x - 3| < 5$ and draw the solution set.`,
    visual: numberLine({ x: [-3, 6], segments: [{ from: -1, to: 4 }], points: [{ x: -1, label: '−1', hollow: true }, { x: 4, label: '4', hollow: true }, { x: 1.5, label: 'centre 1.5', color: 'accent', r: 3.5, level: 1 }], caption: t`The solution: all $x$ strictly between $-1$ and $4$ — within $2.5$ of $1.5$.` }),
    steps: [
      { label: 'Unwrap', text: t`$|u| < 5$ means $-5 < u < 5$, so $-5 < 2x - 3 < 5$.` },
      { label: 'Add 3 throughout', text: t`$-2 < 2x < 8$ — whatever is done to the middle is done to both ends.` },
      { label: 'Divide by 2', text: t`$-1 < x < 4$. Dividing by a *positive* number keeps the direction.` },
      { label: 'Read as a distance', text: t`$|2x - 3| < 5$ is $2\,|x - 1.5| < 5$, i.e. $|x - 1.5| < 2.5$: within $2.5$ of $1.5$. The interval $(-1, 4)$ is exactly that.` },
      { label: 'Spot check', text: t`$x = 0$: $|-3| = 3 < 5$ ✓. $x = 5$: $|7| = 7$, not $< 5$ ✓ — outside, as drawn.` },
    ],
    answer: t`$-1 < x < 4$, the open interval $(-1, 4)$.`,
  },
  practice: [
    mcq({
      id: 'flip', difficulty: 1,
      gen(r) {
        const b = r.int(2, 5), k = r.intExcept(-4, 4, [0]), c = r.intExcept(-9, 9, [0]);
        const a = c + b * k;   // a − b x ≥ c  ⇔  x ≤ k
        return {
          prompt: t`Solve $${a} - ${b}x \ge ${c}$.`,
          visual: flipFig,
          choices: [t`$x \le ${k}$`, t`$x \ge ${k}$`, t`$x \le ${-k}$`, t`$x \ge ${-k}$`],
          answer: 0,
          why: {
            1: t`Dividing by $-${b}$ reverses the inequality. Check with a number: at $x = ${k + 1}$, $${a} - ${b * (k + 1)} = ${a - b * (k + 1)}$, which is less than $${c}$.`,
            2: t`The direction is right but the sign of the boundary is not: $${c} - ${a} = ${c - a}$, and $${c - a} / (-${b}) = ${k}$.`,
            3: t`Two slips: the sign of the boundary and the direction.`,
          },
          hints: [t`Subtract $${a}$: $-${b}x \ge ${c - a}$.`, t`Divide by $-${b}$ — and reverse the sign.`],
          teach: t`Multiplying or dividing an inequality by a negative number reverses its direction.`,
          explain: t`$-${b}x \ge ${c - a} \Rightarrow x \le \dfrac{${c - a}}{-${b}} = ${k}$.`,
        };
      },
    }),
    num({
      id: 'abs-interval', difficulty: 2,
      gen(r) {
        const a = r.intExcept(-4, 6, [0]), b = r.intExcept(2, 5, [a]);
        return {
          prompt: t`The set $|x ${sgn(-a)}| \le ${b}$ is an interval. What is its smallest value?`,
          answer: a - b, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: a + b, feedback: t`That is the largest value. The interval runs from $${a} - ${b}$ to $${a} + ${b}$.` }, { value: -a - b, feedback: t`The centre is $${a}$: $|x ${sgn(-a)}|$ is the distance from $${a}$, not from $${-a}$.` }],
          hints: [t`$|x ${sgn(-a)}|$ is the distance from $x$ to $${a}$.`, t`Within $${b}$ of $${a}$: from $${a} - ${b}$ to $${a} + ${b}$.`],
          teach: t`$|x - a| \le \delta$ is the closed interval $[a - \delta, a + \delta]$.`,
          explain: t`$-${b} \le x ${sgn(-a)} \le ${b} \Rightarrow ${a - b} \le x \le ${a + b}$; the smallest value is $${a - b}$.`,
          visual: bothSides({ lhs: `abs(x - (${a}))`, rhs: `${b}`, x: [a - 2.2 * b, a + 2.2 * b], y: [-0.4, 2.2 * b], lhsLabel: `y = |x ${a < 0 ? '+' : '−'} ${Math.abs(a)}|`, rhsLabel: `y = ${b}`, yticks: 0, legendAt: 'tr', caption: t`The distance from $${a}$ (the V) and the allowed distance (the line), scales hidden. The set is where the V is on or below the line.` }),
        };
      },
    }),
    mcq({
      id: 'abs-greater', difficulty: 2,
      prompt: t`Solve $|2x + 1| > 5$.`,
      visual: bothSides({ lhs: 'abs(2x + 1)', rhs: '5', x: [-6, 5], y: [-0.5, 11], lhsLabel: 'y = |2x + 1|', rhsLabel: 'y = 5', yticks: 0, legendAt: 'tr', caption: t`The two sides, $x$ scale hidden. Where is the V above the line?` }),
      choices: [t`$x < -3$ or $x > 2$`, t`$-3 < x < 2$`, t`$x > 2$`, t`$x < -2$ or $x > 3$`],
      answer: 0,
      why: {
        1: t`That is $|2x + 1| < 5$. “Greater than” means farther away: two rays, not an interval.`,
        2: t`That keeps only $2x + 1 > 5$. The case $2x + 1 < -5$ is also more than $5$ from zero.`,
        3: t`Sign slip: $2x + 1 = -5$ gives $x = -3$ and $2x + 1 = 5$ gives $x = 2$.`,
      },
      hints: [t`$|u| > 5$ means $u > 5$ **or** $u < -5$.`, t`Solve $2x + 1 > 5$ and $2x + 1 < -5$ separately.`],
      teach: t`$|u| > \delta$ splits into two rays, $u > \delta$ or $u < -\delta$; $|u| < \delta$ stays one interval.`,
      explain: t`$2x + 1 > 5 \Rightarrow x > 2$, or $2x + 1 < -5 \Rightarrow x < -3$.`,
    }),
    num({
      id: 'window', difficulty: 2,
      gen(r) {
        const [lo, hi, what, unit, uTeX] = r.pick([[6.8, 7.4, 'chamber pressure', 'MPa', t`\text{MPa}`], [88, 94, 'liquid-oxygen temperature', 'K', t`\text{K}`], [25.35, 25.45, 'nozzle throat diameter', 'mm', t`\text{mm}`], [2.30, 2.45, 'mixture ratio', '', '']]);
        const d = (hi - lo) / 2, c = (hi + lo) / 2;
        return {
          prompt: t`A test procedure allows the ${what} to lie between $${lo}${uTeX ? '\\ ' + uTeX : ''}$ and $${hi}${uTeX ? '\\ ' + uTeX : ''}$. Written as $|p - p_0| \le \delta$, what is $\delta$?`,
          answer: d, units: unit || undefined, difference: unit === 'K' ? true : undefined, tol: { rel: 0.002 },
          errors: [{ value: hi - lo, feedback: t`That is the full width of the window. $\delta$ is the distance from the centre to either end: half of it.` }, { value: c, feedback: t`That is the centre $p_0$. The question asks for the half-width $\delta$.` }],
          hints: [t`The centre is the midpoint, $p_0 = (${lo} + ${hi})/2$.`, t`$\delta$ is how far either end is from the centre.`],
          teach: t`A window $[L, H]$ is $|p - p_0| \le \delta$ with centre $p_0 = (L + H)/2$ and half-width $\delta = (H - L)/2$.`,
          explain: t`$p_0 = ${nice(c)}$ and $\delta = ${nice(sig(d, 4))}$${uTeX ? ' ' + unit : ''}: the window is $${nice(c)} \pm ${nice(sig(d, 4))}$.`,
          visual: numberLine({ x: [lo - (hi - lo) * 0.8, hi + (hi - lo) * 0.8], xlabel: what + (unit ? ` (${unit})` : ''), segments: [{ from: lo, to: hi }], points: [{ x: lo, label: String(lo) }, { x: hi, label: String(hi) }], caption: t`The allowed window, endpoints included.` }),
        };
      },
    }),
    mcq({
      id: 'sign-chart', difficulty: 3,
      prompt: t`Solve $\dfrac{(x - 1)(x + 2)}{x - 3} \ge 0$.`,
      visual: numberLine({ x: [-5, 6], points: [{ x: -2, label: '−2' }, { x: 1, label: '1' }, { x: 3, label: '3', color: 'bad' }], caption: t`The three places where a factor changes sign: the zeros $-2$, $1$ and the pole $3$ (red). Between them the sign is constant.` }),
      choices: [t`$-2 \le x \le 1$ or $x > 3$`, t`$-2 \le x \le 1$ or $x \ge 3$`, t`$x \le -2$ or $1 \le x < 3$`, t`$-2 < x < 1$ or $x > 3$`],
      answer: 0,
      why: {
        1: t`At $x = 3$ the denominator is zero and the expression is undefined, so $3$ cannot be included.`,
        2: t`Those are the intervals where the expression is *negative* (or zero). Test $x = 0$: $\tfrac{(-1)(2)}{-3} = \tfrac23 > 0$.`,
        3: t`“$\ge 0$” includes the zeros $x = -2$ and $x = 1$, where the expression equals $0$.`,
      },
      hints: [t`Mark $-2$, $1$ and $3$ on the line; test one number in each of the four regions.`, t`For $x > 3$ all three factors are positive. Each time you cross a marked point, one factor changes sign.`],
      teach: t`For a rational inequality, mark zeros and poles, test the sign in each region, include zeros for $\ge$, and never include poles.`,
      explain: t`Signs from left to right: $-$, $+$, $-$, $+$. So the expression is $\ge 0$ on $[-2, 1]$ and on $(3, \infty)$.`,
    }),
    mcq({
      id: 'reciprocal-error', difficulty: 3, kind: 'error',
      prompt: t`A student solves $\dfrac1x < 2$ by multiplying both sides by $x$: $1 < 2x$, so $x > \tfrac12$. What is wrong?`,
      visual: bothSides({ lhs: '1/x', rhs: '2', x: [-3, 3], y: [-5, 5], xticks: null, lhsLabel: 'y = 1/x', rhsLabel: 'y = 2', lhsDomain: [-3, 3], extra: { curves: [{ fn: '1/x', color: 'accent', domain: [-3, -0.05] }, { fn: '1/x', color: 'accent', domain: [0.05, 3] }, { fn: '2', color: 'gold' }] }, caption: t`Both sides of $1/x < 2$. Where is the blue curve below the gold line?` }),
      choices: [t`For $x < 0$ multiplying by $x$ reverses the inequality; the full solution is $x < 0$ or $x > \tfrac12$`, t`Nothing: $x > \tfrac12$`, t`It should be $x < \tfrac12$`, t`It should be $0 < x < \tfrac12$`],
      answer: 0,
      why: {
        1: t`Try $x = -1$: $\tfrac1{-1} = -1 < 2$ ✓, yet $-1$ is not $> \tfrac12$. Solutions were lost.`,
        2: t`$x = 0.25$ gives $\tfrac1x = 4$, not $< 2$.`,
        3: t`That is exactly where $\tfrac1x > 2$ — the opposite set.`,
      },
      hints: [t`Test $x = -1$ in the original.`, t`Multiplying by $x$ keeps the direction only when $x > 0$; split into the cases $x > 0$ and $x < 0$.`],
      teach: t`Never multiply an inequality by an expression whose sign you do not know — split into cases, or use a sign chart.`,
      explain: t`If $x > 0$: $1 < 2x$, so $x > \tfrac12$. If $x < 0$: multiplying reverses, $1 > 2x$, i.e. $x < \tfrac12$ — true for every negative $x$. Together: $x < 0$ or $x > \tfrac12$.`,
    }),
    mcq({
      id: 'feasible', difficulty: 2,
      prompt: t`A stage’s load must satisfy three constraints: total propellant $o + f \le 120$ t, and mixture ratio $2.2 \le o/f \le 2.6$ (oxidizer $o$, fuel $f$, in tonnes). Which load is feasible?`,
      visual: { type: 'graph', params: { x: [15, 48], y: [35, 125], aspect: 'wide', xlabel: 'fuel f (t)', ylabel: 'oxidizer o (t)',
        curves: [{ fn: '120 - x', color: 'bad', dash: true, label: 'o + f = 120', labelAt: 46, labelDy: 16, labelDx: -84 }, { fn: '2.2x', color: 'accent', dash: true, label: 'o/f = 2.2', labelAt: 20, labelDy: 14, labelDx: 10 }, { fn: '2.6x', color: 'violet', dash: true, label: 'o/f = 2.6', labelAt: 40, labelDx: -78, labelDy: -6 }],
        points: [{ x: 30, y: 75, label: 'P', color: 'gold' }, { x: 40, y: 85, label: 'Q', color: 'gold' }, { x: 35, y: 90, label: 'R', color: 'gold' }, { x: 25, y: 70, label: 'S', color: 'gold' }] },
        caption: t`The three boundaries (dashed) and four candidate loads. The feasible region is not shaded: decide which side of each line is allowed.` },
      choices: ['P: f = 30 t, o = 75 t', 'Q: f = 40 t, o = 85 t', 'R: f = 35 t, o = 90 t', 'S: f = 25 t, o = 70 t'],
      answer: 0,
      why: {
        1: t`$o/f = 85/40 = 2.125$, below the minimum ratio $2.2$ — too fuel-rich.`,
        2: t`The ratio $90/35 = 2.57$ is fine, but the total $125$ t exceeds the $120$ t limit.`,
        3: t`$o/f = 70/25 = 2.8$, above the maximum $2.6$ — too oxidizer-rich.`,
      },
      hints: [t`Check each point against all three constraints: the sum, and the ratio.`],
      teach: t`A point is feasible only if it satisfies every inequality at once: the feasible region is the overlap of the allowed sides.`,
      explain: t`P: $75 + 30 = 105 \le 120$ ✓ and $75/30 = 2.5$, between $2.2$ and $2.6$ ✓. It lies inside the triangle the three lines enclose.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-largest-int', difficulty: 2,
      gen(r) {
        const b = r.int(2, 5), k = r.int(-3, 6), a = r.int(1, 12);
        const c = a - b * k;   // a − b x > c  ⇔  x < k
        return {
          prompt: t`What is the largest whole number $x$ with $${a} - ${b}x > ${c}$?`,
          answer: k - 1, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: k, feedback: t`The inequality is strict: $x < ${k}$, so $${k}$ itself is excluded.` }],
          hints: [t`$-${b}x > ${c - a}$; dividing by $-${b}$ reverses the sign.`],
          teach: t`Solve, reverse on division by a negative, and respect strictness at the boundary.`,
          explain: t`$-${b}x > ${c - a} \Rightarrow x < ${k}$; the largest whole number below $${k}$ is $${k - 1}$.`,
          visual: flipFig,
        };
      },
    }),
    mcq({
      id: 'cp-tolerance', difficulty: 2,
      prompt: t`Which describes $|x - 3| < 0.01$?`,
      visual: numberLine({ x: [2.97, 3.03], points: [{ x: 3, label: '3', color: 'accent' }], caption: t`A close-up of the number line near $3$.` }),
      choices: [t`$2.99 < x < 3.01$`, t`$2.99 \le x \le 3.01$`, t`$x < 3.01$`, t`$-2.99 < x < 3.01$`],
      answer: 0,
      why: {
        1: t`The inequality is strict: the endpoints are excluded.`,
        2: t`$|x - 3|$ also limits how far *below* $3$ $x$ can go: $x - 3 > -0.01$.`,
        3: t`Add $3$ to all three parts of $-0.01 < x - 3 < 0.01$: the left end is $3 - 0.01 = 2.99$.`,
      },
      hints: [t`$|u| < 0.01 \iff -0.01 < u < 0.01$.`],
      teach: t`$|x - a| < \delta$ is the open interval of radius $\delta$ about $a$.`,
      explain: t`$-0.01 < x - 3 < 0.01 \Rightarrow 2.99 < x < 3.01$.`,
    }),
    num({
      id: 'cp-twr', difficulty: 2, transfer: true,
      gen(r) {
        const [T, twr] = r.pick([[7600, 1.3], [1500, 1.2], [3500, 1.25], [2200, 1.4], [16000, 1.3]]);
        const g = 9.81, mMax = T * 1e3 / (twr * g) / 1e3;
        return {
          prompt: t`A launcher’s engines give $${thou(T)}$ kN of thrust at liftoff, and its thrust-to-weight ratio $T/(mg)$ must be at least $${twr}$. Taking $g = 9.81\ \text{m/s}^2$, what is the greatest allowed liftoff mass, in tonnes?`,
          answer: mMax, units: 't', tol: { rel: 0.005 },
          errors: [{ value: T * 1e3 / g / 1e3, feedback: t`That is the mass at a ratio of exactly $1$ — the rocket would hover. Divide by $${twr}g$.` }, { value: twr * T * 1e3 / g / 1e3, feedback: t`Solving $\tfrac{T}{mg} \ge ${twr}$ for $m$ puts $${twr}$ in the denominator: $m \le \tfrac{T}{${twr}g}$.` }],
          hints: [t`$\dfrac{T}{mg} \ge ${twr} \iff m \le \dfrac{T}{${twr}\,g}$ (multiplying by the positive $m$ keeps the direction).`, t`Thrust in newtons: $${thou(T)}\ \text{kN} = ${thou(T * 1000)}$ N.`],
          teach: t`Multiplying an inequality by a positive quantity, like a mass, keeps its direction.`,
          explain: t`$m \le \dfrac{${thou(T * 1000)}}{${twr} \times 9.81} = ${thou(Math.round(mMax * 1000))}$ kg $\approx ${nice(sig(mMax, 3))}$ t.`,
          visual: { type: 'graph', params: { x: [0, mMax * 1.8], y: [0, 3], aspect: 'wide', xlabel: 'liftoff mass m', ylabel: 'T/(mg)', xticks: 0,
            curves: [{ fn: `${N(T * 1e3 / g / 1e3)}/x`, color: 'accent', domain: [mMax * 0.25, mMax * 1.8] }], hlines: [{ y: twr, label: `required ${twr}`, color: 'gold' }],
            shade: [{ fn: '3', lower: `${twr}`, from: 0, to: mMax * 1.8, color: 'good', alpha: 0.1 }] },
            caption: t`Thrust-to-weight against mass (mass scale hidden). The green band is the allowed ratio; the feasible masses are where the curve lies in it. Thrust also changes with altitude — this is at the pad.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §2.7 Linear Inequalities and Absolute Value Inequalities', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-7-linear-inequalities-and-absolute-value-inequalities' },
  ],
});
