// Linear and quadratic equations — where the graphs of the two sides meet.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig, frac } from '../../src/core/format.js';
import { N, sgn, bothSides } from './_m0kit.js';

const t = String.raw;

// y = A x² + B x + C on a window around its roots, scale hidden
function parabolaFig(A, B, C, caption, extra = {}) {
  const xv = -B / (2 * A), D = B * B - 4 * A * C, half = D > 0 ? Math.sqrt(D) / (2 * Math.abs(A)) : 2;
  const span = Math.max(1.6 * half, 1.5), yv = C - B * B / (4 * A);
  const f = (x) => A * x * x + B * x + C, edge = f(xv + span);
  const lo = Math.min(yv, edge, 0), hi = Math.max(yv, edge, 0);
  return {
    type: 'graph',
    params: { x: [xv - span, xv + span], y: [lo - 0.12 * (hi - lo), hi + 0.12 * (hi - lo)], aspect: 'wide', xticks: 0, yticks: 0, curves: [{ fn: `${N(A)}*x^2 + (${N(B)})*x + (${N(C)})`, color: 'accent' }], ...extra },
    caption,
  };
}

export default lesson({
  id: 'm0.M0-3.1',
  title: 'Linear and quadratic equations',
  minutes: 9, difficulty: 2,
  intro: t`An equation asks where two expressions are equal — on a graph, **where the curves of the two sides meet**. A linear equation $ax + b = cx + d$ has one meeting point (unless the lines are parallel). A quadratic $ax^2 + bx + c = 0$ has up to two, given by the quadratic formula:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

The **discriminant** $b^2 - 4ac$ under the root decides how many: two if positive, one if zero, none (in the real numbers) if negative.`,
  symbols: [
    { tex: 'a,\\ b,\\ c', text: 'the coefficients of $x^2$, $x$ and $1$, after moving everything to one side ($a \\ne 0$)' },
    { tex: '\\pm', text: 'two solutions: one with $+$, one with $-$' },
    { tex: 'b^2 - 4ac', text: 'the discriminant: its sign counts the real solutions' },
    { tex: '2a', text: 'divides the **whole** numerator, $-b \\pm \\sqrt{\\cdots}$, not just the root' },
  ],
  why: t`Every “when does it reach…” question in kinematics is a quadratic, and the two roots are physical: the rocket passes a given height once going up and once coming down.`,
  visual: {
    type: 'graph',
    title: 'Roots of a quadratic',
    lead: t`The curve is $y = ax^2 + bx + c$; the solutions of $ax^2 + bx + c = 0$ are where it crosses the axis (gold). Move $c$ to lift the parabola off the axis and watch the discriminant change sign.`,
    tasks: [
      t`Raise $c$ until the two roots merge: there the discriminant is exactly zero and the vertex touches the axis.`,
      t`Keep raising $c$: the discriminant goes negative and the roots readout goes blank — no real solutions.`,
      t`Change $b$ alone: the parabola slides sideways and down, but its shape (set by $a$) never changes.`,
    ],
    params: {
      x: [-6, 6], y: [-8, 8],
      sliders: [
        { key: 'a', label: t`$a$`, min: 0.25, max: 2, step: 0.25, value: 1, explain: t`The coefficient of $x^2$: how sharply the parabola bends (kept positive here).` },
        { key: 'b', label: t`$b$`, min: -4, max: 4, step: 0.5, value: 1, explain: t`The coefficient of $x$.` },
        { key: 'c', label: t`$c$`, min: -6, max: 6, step: 0.5, value: -3, explain: t`The constant term: where the curve crosses the $y$-axis.` },
      ],
      curves: [{ fn: 'a x^2 + b x + c', color: 'accent' }],
      points: [
        { x: '(-b - sqrt(max(b^2 - 4a c, 0)))/(2a)', y: 0, color: 'gold', r: 5, when: 'step(b^2 - 4a c)' },
        { x: '(-b + sqrt(max(b^2 - 4a c, 0)))/(2a)', y: 0, color: 'gold', r: 5, when: 'step(b^2 - 4a c)' },
      ],
      readouts: [{ label: t`discriminant $b^2 - 4ac$`, expr: 'b^2 - 4a c', digits: 3 }, { label: 'roots', expr: '(-b - sqrt(b^2 - 4a c))/(2a)', digits: 3 }, { label: t`and`, expr: '(-b + sqrt(b^2 - 4a c))/(2a)', digits: 3 }],
    },
    caption: t`The roots are computed from the quadratic formula; a blank readout means the discriminant is negative and the roots are not real (they are complex — module M0-10).`,
  },
  example: {
    prompt: t`A model rocket’s height during its coast is $h(t) = 1.5 + 20t - 4.9t^2$ (metres, seconds). When is it at $15$ m?`,
    visual: bothSides({ lhs: '1.5 + 20x - 4.9x^2', rhs: '15', x: [0, 4.4], y: [-1, 24], xticks: null, xlabel: 't (s)', ylabel: 'h (m)', lhsLabel: 'h(t)', rhsLabel: 'h = 15 m', legendAt: 'tr', lhsDomain: [0, 4.15],
      extra: { points: [{ x: 0.8535, y: 15, color: 'gold', label: 'going up', labelAlign: 'right', labelDx: -8 }, { x: 3.2282, y: 15, color: 'gold', label: 'coming down', labelDx: 8 }] },
      caption: t`The two sides of $h(t) = 15$ as curves; they meet twice. No air resistance.` }),
    steps: [
      { label: 'One side zero', text: t`$1.5 + 20t - 4.9t^2 = 15 \;\Rightarrow\; 4.9t^2 - 20t + 13.5 = 0$, so $a = 4.9$, $b = -20$, $c = 13.5$.` },
      { label: 'Discriminant', text: t`$b^2 - 4ac = 400 - 264.6 = 135.4 > 0$: two real solutions.` },
      { label: 'Formula', text: t`$t = \dfrac{20 \pm \sqrt{135.4}}{9.8} = \dfrac{20 \pm 11.64}{9.8}$.` },
      { label: 'Both roots', text: t`$t = 0.854$ s and $t = 3.23$ s.` },
      { label: 'Interpret', text: t`Both are physical: the rocket passes $15$ m going up and again coming down. Check: the two times average to $2.04$ s, the moment of peak height, $20/9.8$ ✓.` },
    ],
    answer: t`$t = 0.854$ s (rising) and $t = 3.23$ s (falling).`,
  },
  practice: [
    num({
      id: 'linear', difficulty: 1,
      gen(r) {
        const x0 = r.intExcept(-5, 6, [0]), a = r.int(2, 7), c = r.intExcept(-3, 5, [a, 0]), b = r.intExcept(-9, 9, [0]);
        const d = (a - c) * x0 + b;
        const errors = [];
        if (a + c !== 0 && (d - b) / (a + c) !== x0) errors.push({ value: (d - b) / (a + c), feedback: t`Moving $${c}x$ to the left changes its sign: $${a}x - (${c}x)$.` });
        if ((d + b) / (a - c) !== x0) errors.push({ value: (d + b) / (a - c), feedback: t`Moving $${b}$ to the right changes its sign: subtract it from both sides.` });
        return {
          prompt: t`Solve $${a}x ${sgn(b)} = ${c}x ${sgn(d)}$.`,
          answer: x0, tol: { rel: 0, abs: 1e-6 },
          errors,
          hints: [t`Collect the $x$ terms on one side and the numbers on the other: $(${a} - (${c}))x = ${d} - (${b})$.`],
          teach: t`Do the same thing to both sides until $x$ stands alone; a term changes sign when it crosses the equals sign.`,
          explain: t`$${a - c}x = ${d - b}$, so $x = ${x0}$.`,
          visual: bothSides({ lhs: `${a}x + (${b})`, rhs: `${c}x + (${d})`, x: [x0 - 6, x0 + 6], y: [Math.min(a * (x0 - 6) + b, c * (x0 - 6) + d, a * (x0 + 6) + b, c * (x0 + 6) + d), Math.max(a * (x0 - 6) + b, c * (x0 - 6) + d, a * (x0 + 6) + b, c * (x0 + 6) + d)], yticks: 0, lhsLabel: `y = ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}`, rhsLabel: `y = ${c}x ${d < 0 ? '−' : '+'} ${Math.abs(d)}`, caption: t`The two sides as lines, scales hidden. The solution is where they cross.` }),
        };
      },
    }),
    num({
      id: 'fahrenheit', difficulty: 2,
      prompt: t`A thermometer reads in both scales, with $F = \tfrac95 C + 32$. At what temperature do the two readings agree, $F = C$?`,
      answer: -40, tol: { rel: 0, abs: 0.01 },
      errors: [{ value: 40, feedback: t`Check the sign: $C - \tfrac95 C = -\tfrac45 C$, and that equals $32$.` }, { value: -32, feedback: t`Setting $C = -32$ makes $F = -25.6$, not $-32$. Solve $C = \tfrac95 C + 32$.` }],
      hints: [t`Set $F = C$: solve $C = \tfrac95 C + 32$.`, t`$-\tfrac45 C = 32$.`],
      teach: t`“When are two quantities equal” is solved by equating their formulas.`,
      explain: t`$C - \tfrac95 C = 32 \Rightarrow -\tfrac45 C = 32 \Rightarrow C = -40$. So $-40\,°\text{C} = -40\,°\text{F}$ — cold enough for the readings to coincide; liquid-oxygen ground equipment sees far colder.`,
      visual: bothSides({ lhs: '1.8x + 32', rhs: 'x', x: [-80, 60], y: [-90, 140], xlabel: 'C', ylabel: 'reading', yticks: 0, lhsLabel: 'Fahrenheit reading', rhsLabel: 'Celsius reading', caption: t`Each scale’s reading against the Celsius temperature, scales hidden. Where do they cross?` }),
    }),
    num({
      id: 'quad-formula', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3]), b = r.intExcept(-7, 7, [0]), c = r.intExcept(-6, -1, []);
        const D = b * b - 4 * a * c, root = (-b + Math.sqrt(D)) / (2 * a);
        return {
          prompt: t`Solve $${a}x^2 ${sgn(b, 'x')} ${sgn(c)} = 0$ with the quadratic formula. Give the larger solution to 3 significant figures.`,
          answer: root, tol: { rel: 0.003, abs: 0.002 },
          errors: [{ value: (-b + Math.sqrt(D)) / 2, feedback: t`Divide by $2a = ${2 * a}$, not by $2$.` }, { value: (b + Math.sqrt(D)) / (2 * a), feedback: t`The formula starts with $-b = ${-b}$.` }],
          hints: [t`$a = ${a}$, $b = ${b}$, $c = ${c}$; the discriminant is $${b * b} - 4(${a})(${c}) = ${D}$.`, t`$x = \dfrac{${-b} \pm \sqrt{${D}}}{${2 * a}}$; take the $+$ sign.`],
          teach: t`In the quadratic formula, $-b$ uses the sign of $b$ flipped, and $2a$ divides everything above it.`,
          explain: t`$x = \dfrac{${-b} + \sqrt{${D}}}{${2 * a}} = ${nice(sig(root, 3))}$ (the other root is $${nice(sig((-b - Math.sqrt(D)) / (2 * a), 3))}$).`,
          visual: parabolaFig(a, b, c, t`$y = ${a}x^2 ${sgn(b, 'x')} ${sgn(c)}$, scale hidden: two crossings, two roots.`),
        };
      },
    }),
    mcq({
      id: 'divide-by-x', difficulty: 2, kind: 'error',
      prompt: t`To solve $x^2 = 5x$, a student divides both sides by $x$ and concludes $x = 5$. What is wrong?`,
      visual: bothSides({ lhs: 'x^2', rhs: '5x', x: [-2, 7], y: [-6, 32], xticks: null, lhsLabel: 'y = x²', rhsLabel: 'y = 5x', caption: t`The two sides as curves. Count the meeting points.` }),
      choices: [t`Dividing by $x$ assumes $x \ne 0$, and loses the solution $x = 0$`, t`Nothing: $x = 5$ is the only solution`, t`The solutions are $x = \pm\sqrt5$`, t`Dividing is fine, but it should give $x = \tfrac15$`],
      answer: 0,
      why: {
        1: t`Check $x = 0$: $0^2 = 5 \cdot 0$ ✓. The curves meet at the origin too.`,
        2: t`That solves $x^2 = 5$, not $x^2 = 5x$.`,
        3: t`$x^2 / x = x$ and $5x / x = 5$; the division itself was computed correctly — the trouble is the case $x = 0$.`,
      },
      hints: [t`Test $x = 0$ in the original equation.`, t`Instead of dividing, move everything to one side and factor: $x(x - 5) = 0$.`],
      teach: t`Never divide by an expression that could be zero: factor instead, and every factor gives a solution.`,
      explain: t`$x^2 - 5x = x(x - 5) = 0$, so $x = 0$ or $x = 5$. Dividing by $x$ silently assumed $x \ne 0$.`,
    }),
    num({
      id: 'height-time', difficulty: 3,
      gen(r) {
        const v0 = r.pick([15, 18, 20, 25]), H = Math.round(v0 * v0 / 19.6 * r.pick([0.5, 0.6, 0.75]));
        const D = v0 * v0 - 19.6 * H, t1 = (v0 - Math.sqrt(D)) / 9.8, t2 = (v0 + Math.sqrt(D)) / 9.8;
        return {
          prompt: t`A ball is thrown straight up at $${v0}$ m/s, so its height is $h = ${v0}t - 4.9t^2$. When does it first reach $${H}$ m? Give the time to 3 significant figures.`,
          answer: t1, units: 's', tol: { rel: 0.004 },
          errors: [{ value: t2, feedback: t`That is the second time, on the way down. “First” means the smaller root.` }],
          hints: [t`Rearrange: $4.9t^2 - ${v0}t + ${H} = 0$.`, t`$t = \dfrac{${v0} \pm \sqrt{${v0}^2 - 4(4.9)(${H})}}{9.8}$; the first time takes the minus sign.`],
          teach: t`A quadratic in time has two roots; the physics decides which one answers the question.`,
          explain: t`$t = \dfrac{${v0} \pm \sqrt{${nice(sig(D, 4))}}}{9.8}$: $${nice(sig(t1, 3))}$ s going up and $${nice(sig(t2, 3))}$ s coming down.`,
          visual: bothSides({ lhs: `${v0}x - 4.9x^2`, rhs: `${H}`, x: [0, v0 / 4.9 * 1.08], y: [-0.5, v0 * v0 / 19.6 * 1.25], xlabel: 't', ylabel: 'h', yticks: 0, lhsDomain: [0, v0 / 4.9], lhsLabel: 'h(t)', rhsLabel: `h = ${H} m`, legendAt: 'tr', caption: t`Height against time (no air resistance) and the target height, scales hidden.` }),
        };
      },
    }),
    mcq({
      id: 'discriminant', difficulty: 2,
      prompt: t`How many real solutions does $2x^2 - 4x + 5 = 0$ have?`,
      choices: ['none', 'exactly one', 'two', 'infinitely many'],
      answer: 0,
      why: {
        1: t`One solution needs $b^2 - 4ac = 0$; here it is $16 - 40 = -24$.`,
        2: t`Two solutions need a positive discriminant; $16 - 40$ is negative.`,
        3: t`A quadratic equation has at most two solutions; infinitely many would need every coefficient to be zero.`,
      },
      hints: [t`Compute $b^2 - 4ac$ with $a = 2$, $b = -4$, $c = 5$.`],
      teach: t`The sign of $b^2 - 4ac$ counts the real solutions: positive two, zero one, negative none.`,
      explain: t`$(-4)^2 - 4(2)(5) = -24 < 0$: no real solutions. The parabola $y = 2x^2 - 4x + 5 = 2(x - 1)^2 + 3$ sits entirely above the axis.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-factorable', difficulty: 2,
      gen(r) {
        const p = r.pick([2, 3]), q = r.intExcept(-5, 5, [0]), s = r.intExcept(1, 6, [-q / p]);
        // (p x − q)(x + s) = p x² + (p s − q) x − q s
        const A = p, B = p * s - q, C = -q * s;
        const roots = [q / p, -s], big = Math.max(...roots);
        return {
          prompt: t`Solve $${A}x^2 ${B === 0 ? '' : sgn(B, 'x')} ${sgn(C)} = 0$. Give the larger solution.`,
          answer: big, tol: { rel: 0.002, abs: 1e-6 },
          hints: [t`Try the formula, or factor as $(${p}x ${sgn(-q)})(x ${sgn(s)})$.`],
          teach: t`Factoring, when it works, reads the roots straight off the factors.`,
          explain: t`$(${p}x ${sgn(-q)})(x ${sgn(s)}) = 0$ gives $x = ${frac(q / p)}$ or $x = ${-s}$; the larger is $${frac(big)}$.`,
          visual: parabolaFig(A, B, C, t`$y = ${A}x^2 ${B === 0 ? '' : sgn(B, 'x')} ${sgn(C)}$, scale hidden.`),
        };
      },
    }),
    mcq({
      id: 'cp-formula-error', difficulty: 2, kind: 'error',
      prompt: t`Solving $x^2 - 6x + 8 = 0$, a student writes $x = 6 \pm \sqrt{36 - 32}/2 = 6 \pm 1$, so $x = 7$ or $x = 5$. Where is the error?`,
      visual: { type: 'graph', params: { x: [-0.5, 8], y: [-2, 10], aspect: 'wide', curves: [{ fn: 'x^2 - 6x + 8', color: 'accent' }] }, caption: t`$y = x^2 - 6x + 8$, with its scale this time — check the student’s roots against it.` },
      choices: [t`The $2a$ must divide the whole numerator: $x = (6 \pm 2)/2$, so $x = 4$ or $2$`, t`The discriminant should be $36 + 32$`, t`It should start with $-6$, not $6$`, t`No error: $x = 7$ and $x = 5$`],
      answer: 0,
      why: {
        1: t`$b^2 - 4ac = 36 - 4(1)(8) = 36 - 32$; that part is right.`,
        2: t`The formula starts with $-b$, and $b = -6$, so $-b = +6$ is right.`,
        3: t`Substitute $x = 5$: $25 - 30 + 8 = 3 \ne 0$.`,
      },
      hints: [t`Substitute $x = 5$ into the equation.`, t`Look at what the $2$ divides.`],
      teach: t`In $x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$, the fraction bar runs under the whole numerator.`,
      explain: t`$x = \dfrac{6 \pm \sqrt4}{2} = \dfrac{6 \pm 2}{2}$: $x = 4$ or $x = 2$. Indeed $x^2 - 6x + 8 = (x - 2)(x - 4)$.`,
    }),
    num({
      id: 'cp-lander', difficulty: 3, transfer: true,
      gen(r) {
        const [H, v0, a] = r.pick([[100, 20, 1.5], [150, 25, 1.6], [80, 16, 1.2], [200, 30, 2], [120, 22, 1.5]]);
        const A = a / 2, D = v0 * v0 - 4 * A * H, t1 = (v0 - Math.sqrt(D)) / (2 * A), t2 = (v0 + Math.sqrt(D)) / (2 * A);
        return {
          prompt: t`A lunar lander is $${H}$ m up, descending at $${v0}$ m/s, with its engine giving a net upward acceleration of $${a}\ \text{m/s}^2$. Its height is $h(t) = ${H} - ${v0}t + ${nice(A)}t^2$. When does it reach the ground?`,
          answer: t1, units: 's', tol: { rel: 0.005 },
          errors: [{ value: t2, feedback: t`That root belongs to a lander that passed through the ground and came back up — the model stops being true at the first touchdown.` }],
          hints: [t`Set $h(t) = 0$: $${nice(A)}t^2 - ${v0}t + ${H} = 0$.`, t`The discriminant is $${v0}^2 - 4(${nice(A)})(${H}) = ${nice(D)}$.`, t`Take the smaller root: it happens first.`],
          teach: t`When a quadratic model has two positive roots, the first one ends the motion the model describes.`,
          explain: t`$t = \dfrac{${v0} \pm \sqrt{${nice(D)}}}{${nice(2 * A)}}$: touchdown at $${nice(sig(t1, 3))}$ s. The other root, $${nice(sig(t2, 3))}$ s, is unphysical. (Touching down at $${nice(sig(v0 - a * t1, 2))}$ m/s is still a hard landing.)`,
          visual: bothSides({ lhs: `${H} - ${v0}x + ${N(A)}x^2`, rhs: '0', x: [0, t2 * 1.1], y: [-H * 0.6, H * 1.1], xlabel: 't', ylabel: 'h', yticks: 0, lhsLabel: 'h(t) from the model', rhsLabel: 'ground', legendAt: 'tr', caption: t`The model’s height against time, scales hidden; below the ground line it no longer describes anything real. Constant acceleration assumed (the lander’s mass changes as it burns).` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §2.2 Linear Equations in One Variable', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-2-linear-equations-in-one-variable' },
    { label: 'OpenStax Algebra and Trigonometry 2e, §2.5 Quadratic Equations', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-5-quadratic-equations' },
  ],
});
