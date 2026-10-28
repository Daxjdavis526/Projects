// Systems of linear equations — two lines, one crossing.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, sgn } from './_m0kit.js';

const t = String.raw;

// the lines a1 x + b1 y = c1 and a2 x + b2 y = c2 (b ≠ 0) around a centre, scales hidden
function linesFig(L1, L2, cx, cy, span, caption, { ticks = false, labels = ['first', 'second'], xlabel = 'x', ylabel = 'y', extra = {} } = {}) {
  const fn = ([a, b, c]) => `(${N(c)} - (${N(a)})*x)/(${N(b)})`;
  return {
    type: 'graph',
    params: { x: [cx - span, cx + span], y: [cy - span * 0.62, cy + span * 0.62], aspect: 'wide', xlabel, ylabel, xticks: ticks ? undefined : 0, yticks: ticks ? undefined : 0,
      curves: [{ fn: fn(L1), color: 'accent' }, { fn: fn(L2), color: 'gold' }], legend: [{ label: labels[0], color: 'accent' }, { label: labels[1], color: 'gold' }], legendAt: 'tl', ...extra },
    caption,
  };
}
// a x + b y = c as TeX
const eqTeX = ([a, b, c], x = 'x', y = 'y') => `${a === 1 ? '' : a === -1 ? '-' : a}${x} ${sgn(b, y)} = ${c}`;

export default lesson({
  id: 'm0.M0-3.2',
  title: 'Systems of linear equations',
  minutes: 8, difficulty: 2,
  intro: t`Two unknowns need two equations. Each linear equation is a line in the $(x, y)$ plane, and a solution of both is a point on both — **where the lines cross**:

$$\begin{aligned} a_1 x + b_1 y &= c_1 \\ a_2 x + b_2 y &= c_2 \end{aligned}$$

Solve by **substitution** (solve one equation for a variable, put it in the other) or **elimination** (add multiples of the equations so a variable cancels). Two lines can also be parallel (no solution) or the same line (infinitely many).`,
  symbols: [
    { tex: 'x,\\ y', text: 'the two unknowns' },
    { tex: 'a_i,\\ b_i', text: 'the coefficients of equation $i$; their ratio $-a_i/b_i$ is line $i$’s slope' },
    { tex: 'c_i', text: 'the right-hand side of equation $i$' },
    { tex: 'a_1 b_2 - a_2 b_1', text: 'the **determinant**: zero exactly when the lines are parallel (or identical) and there is no single solution' },
  ],
  why: t`Kirchhoff’s circuit laws, force balance in two directions, mixing problems and every least-squares fit are linear systems — and linear algebra is this lesson with more unknowns.`,
  visual: {
    type: 'graph',
    title: 'Two lines, one solution',
    lead: t`The blue line is $2x + y = 7$. The gold line is $y = mx + k$; move it with the sliders. The solution of the system is where they cross.`,
    tasks: [
      t`Set $m = -2$: the lines are parallel and the readouts go blank — no solution.`,
      t`Keep $m = -2$ and set $k = 7$: the lines coincide and every point of the line is a solution.`,
      t`Bring $m$ close to $-2$ without reaching it: the crossing races off — nearly parallel lines make a system very sensitive to its numbers.`,
    ],
    params: {
      x: [-6, 9], y: [-5, 9],
      sliders: [
        { key: 'm', label: t`Slope $m$ of the gold line`, min: -3, max: 3, step: 0.25, value: 1, explain: t`How steeply the gold line rises: the coefficient of $x$ in $y = mx + k$.` },
        { key: 'k', label: t`Intercept $k$`, min: -4, max: 8, step: 0.5, value: 1, explain: t`Where the gold line crosses the $y$-axis.` },
      ],
      curves: [{ fn: '7 - 2x', color: 'accent', label: '2x + y = 7', labelAt: -1.6, labelDx: 8 }, { fn: 'm x + k', color: 'gold', label: 'y = mx + k', labelAt: 6.5, labelDy: 14 }],
      points: [{ x: '(7 - k)/(m + 2)', y: '7 - 2(7 - k)/(m + 2)', color: 'violet', r: 6, when: 'step(abs(m + 2) - 0.01)' }],
      readouts: [{ label: t`crossing $x$`, expr: '(7 - k)/(m + 2)', digits: 3 }, { label: t`crossing $y$`, expr: '7 - 2(7 - k)/(m + 2)', digits: 3 }],
    },
    caption: t`At $m = -2$ the formula for the crossing divides by zero — the algebraic face of parallel lines.`,
  },
  example: {
    prompt: t`A rocket team needs $500$ kg of $85\%$ hydrogen peroxide (by mass) and has stocks of $90\%$ and $70\%$. How much of each should they blend?`,
    visual: linesFig([1, 1, 500], [0.9, 0.7, 425], 300, 250, 330, t`The total-mass line and the peroxide-mass line in the plane of the two amounts; the blend is their crossing. Real blending also has to respect that concentrated peroxide is hazardous to handle.`, { ticks: true, labels: ['x + y = 500', '0.9x + 0.7y = 425'], xlabel: 'x: 90% stock (kg)', ylabel: 'y: 70% stock (kg)', extra: { points: [{ x: 375, y: 125, label: '(375, 125)', color: 'violet' }] } }),
    steps: [
      { label: 'Name the unknowns', text: t`$x$ kg of the $90\%$ stock and $y$ kg of the $70\%$ stock.` },
      { label: 'Two facts, two equations', text: t`Total mass: $x + y = 500$. Peroxide mass: $0.90x + 0.70y = 0.85 \times 500 = 425$.` },
      { label: 'Eliminate y', text: t`Multiply the first by $0.70$: $0.70x + 0.70y = 350$. Subtract it from the second: $0.20x = 75$, so $x = 375$.` },
      { label: 'Back-substitute', text: t`$y = 500 - 375 = 125$.` },
      { label: 'Check', text: t`$0.90(375) + 0.70(125) = 337.5 + 87.5 = 425$ ✓. And $85\%$ lies three-quarters of the way from $70\%$ to $90\%$, matching three parts in four of the strong stock.` },
    ],
    answer: t`$375$ kg of the $90\%$ stock and $125$ kg of the $70\%$ stock.`,
  },
  practice: [
    num({
      id: 'elim-x', difficulty: 2,
      gen(r) {
        const x0 = r.intExcept(-4, 5, [0]), y0 = r.intExcept(-4, 5, [0, x0]);
        let a1 = r.int(1, 4), b1 = r.intExcept(-3, 3, [0]), a2 = r.intExcept(-3, 4, [0]), b2 = r.intExcept(-4, 4, [0]);
        if (a1 * b2 - a2 * b1 === 0) b2 = b2 + 1 === 0 ? 2 : b2 + 1;
        const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
        return {
          prompt: t`Solve the system and give $x$: $\quad ${eqTeX([a1, b1, c1])}, \quad ${eqTeX([a2, b2, c2])}$.`,
          answer: x0, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: y0, feedback: t`That is $y$. The question asks for $x$.` }],
          hints: [t`Multiply the equations so that the $y$ coefficients match, then subtract.`, t`$x = \dfrac{c_1 b_2 - c_2 b_1}{a_1 b_2 - a_2 b_1} = \dfrac{${c1 * b2 - c2 * b1}}{${a1 * b2 - a2 * b1}}$.`],
          teach: t`Elimination: scale the equations so one variable has matching coefficients, then subtract to remove it.`,
          explain: t`The solution is $(x, y) = (${x0}, ${y0})$. Check in the first: $${a1}(${x0}) + (${b1})(${y0}) = ${c1}$ ✓.`,
          visual: linesFig([a1, b1, c1], [a2, b2, c2], x0, y0, 7, t`The two equations as lines, scales hidden. Their crossing is the solution.`),
        };
      },
    }),
    num({
      id: 'jet-stream', difficulty: 2,
      gen(r) {
        const v = r.pick([780, 820, 850, 880, 900]), w = r.pick([60, 80, 110, 140]);
        const g1 = v + w, g2 = v - w;
        return {
          prompt: t`An airliner’s GPS ground speed is $${g1}$ km/h flying with the jet stream and $${g2}$ km/h flying against it, at the same airspeed. Ground speed is airspeed $v$ plus or minus wind speed $w$. What is the wind speed?`,
          answer: w, units: 'km/h', tol: { rel: 0.002 },
          errors: [{ value: v, feedback: t`That is the airspeed $v$. The wind is half the *difference* of the two ground speeds.` }, { value: g1 - g2, feedback: t`Subtracting the equations gives $2w = ${g1 - g2}$; divide by 2.` }],
          hints: [t`$v + w = ${g1}$ and $v - w = ${g2}$.`, t`Subtract the second from the first: $v$ cancels.`],
          teach: t`When two equations differ only in the sign of one unknown, adding and subtracting them separates the unknowns.`,
          explain: t`Subtracting: $2w = ${g1 - g2}$, so $w = ${w}$ km/h; adding: $2v = ${g1 + g2}$, so $v = ${v}$ km/h.`,
          visual: linesFig([1, 1, g1], [1, -1, g2], v, w, 260, t`The two equations as lines in the plane of airspeed $v$ and wind $w$; scales hidden. Real jet streams vary along the route — this treats the wind as steady.`, { labels: ['with the wind: v + w', 'against it: v − w'], xlabel: 'v', ylabel: 'w' }),
        };
      },
    }),
    mcq({
      id: 'parallel', difficulty: 2,
      prompt: t`How many solutions has the system $\;2x + 4y = 6,\quad x + 2y = 5$?`,
      choices: ['none', 'exactly one', 'infinitely many', 'exactly two'],
      answer: 0,
      why: {
        1: t`Halve the first equation: $x + 2y = 3$. It cannot also equal $5$ — the lines are parallel.`,
        2: t`Infinitely many needs the same line; here the left sides match (after halving) but the right sides do not.`,
        3: t`Two straight lines cross at most once; a linear system has no, one or infinitely many solutions — never exactly two.`,
      },
      hints: [t`Divide the first equation by 2 and compare with the second.`],
      teach: t`If one equation’s left side is a multiple of the other’s, the lines are parallel: no solution, or infinitely many if the right sides match the same multiple.`,
      explain: t`$2x + 4y = 6$ is $x + 2y = 3$; the second says $x + 2y = 5$. Both cannot hold: no solution. The determinant $2 \cdot 2 - 1 \cdot 4 = 0$ flags it.`,
    }),
    mcq({
      id: 'subst-error', difficulty: 2, kind: 'error',
      prompt: t`Solving $y = 2x - 1$ and $3x + 2y = 12$, a student substitutes: $3x + 2 \cdot 2x - 1 = 12$, so $7x = 13$ and $x = \tfrac{13}{7}$. What went wrong?`,
      visual: linesFig([-2, 1, -1], [3, 2, 12], 2, 3, 5, t`The two lines, with their scales — check the student’s $x$ against the crossing.`, { ticks: true, labels: ['y = 2x − 1', '3x + 2y = 12'] }),
      choices: [t`$2y$ must become $2(2x - 1) = 4x - 2$: the brackets were dropped`, t`Substitution cannot be used when one equation has three terms`, t`It should be $3x - 2(2x - 1) = 12$`, t`Nothing: $x = \tfrac{13}{7}$`],
      answer: 0,
      why: {
        1: t`Substitution works for any linear system; the slip is in the arithmetic.`,
        2: t`The second equation has $+2y$; the sign stays positive.`,
        3: t`Put $x = \tfrac{13}{7}$ back: $y = \tfrac{19}{7}$, and $3x + 2y = \tfrac{77}{7} = 11 \ne 12$.`,
      },
      hints: [t`Substitute the whole expression $2x - 1$ for $y$, in brackets.`, t`$2(2x - 1)$ multiplies both terms.`],
      teach: t`When you substitute an expression, put it in brackets so every term gets multiplied.`,
      explain: t`$3x + 2(2x - 1) = 12 \Rightarrow 7x - 2 = 12 \Rightarrow x = 2$, and $y = 3$. The lines cross at $(2, 3)$.`,
    }),
    num({
      id: 'rovers', difficulty: 2,
      gen(r) {
        const vA = r.pick([0.5, 1, 1.5, 2]), vB = r.pick([1, 2, 2.5, 3]), D = r.pick([60, 100, 150, 200]);
        const tm = D / (vA + vB);
        const errors = [];
        if (vA !== vB) errors.push({ value: D / Math.abs(vA - vB), feedback: t`They drive toward each other, so the gap closes at the *sum* of their speeds. In equations: $${vA}t = ${D} - ${vB}t$.` });
        return {
          prompt: t`Two rovers drive toward each other along a straight track. Rover A starts at $x = 0$ moving at $${vA}$ m/s; rover B starts at $x = ${D}$ m moving at $${vB}$ m/s the other way. When do they meet?`,
          answer: tm, units: 's', tol: { rel: 0.005 },
          errors,
          hints: [t`Positions: $x_A = ${vA}t$, $x_B = ${D} - ${vB}t$.`, t`They meet when $x_A = x_B$.`],
          teach: t`A meeting is a system: two position equations with the same $x$ and the same $t$.`,
          explain: t`$${vA}t = ${D} - ${vB}t \Rightarrow ${nice(vA + vB)}t = ${D} \Rightarrow t = ${nice(sig(tm, 4))}$ s, at $x = ${nice(sig(vA * tm, 4))}$ m.`,
          visual: { type: 'graph', params: { x: [0, tm * 1.6], y: [-0.08 * D, D * 1.12], aspect: 'wide', xlabel: 't', ylabel: 'x', xticks: 0, yticks: 0, curves: [{ fn: `${vA}x`, color: 'accent', label: 'rover A', labelAt: tm * 1.35, labelDy: 14 }, { fn: `${D} - ${vB}x`, color: 'gold', domain: [0, D / vB], label: 'rover B', labelAt: tm * 0.3, labelDx: 8 }] }, caption: t`Position against time for both rovers, scales hidden: the meeting is the crossing.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-elim-y', difficulty: 2,
      gen(r) {
        const x0 = r.intExcept(-3, 4, [0]), y0 = r.intExcept(-4, 4, [0, x0]);
        const a1 = r.int(2, 4), b1 = r.int(1, 3), a2 = r.int(1, 3), b2 = r.intExcept(-3, -1, []);
        const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
        return {
          prompt: t`Solve and give $y$: $\quad ${eqTeX([a1, b1, c1])}, \quad ${eqTeX([a2, b2, c2])}$.`,
          answer: y0, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: x0, feedback: t`That is $x$; the question asks for $y$.` }],
          hints: [t`Eliminate $x$: multiply the first by $${a2}$ and the second by $${a1}$, then subtract.`],
          teach: t`Pick the variable whose coefficients are easiest to match, and eliminate it.`,
          explain: t`$(${x0}, ${y0})$ satisfies both: $${a1}(${x0}) + ${b1}(${y0}) = ${c1}$ and $${a2}(${x0}) + (${b2})(${y0}) = ${c2}$.`,
          visual: linesFig([a1, b1, c1], [a2, b2, c2], x0, y0, 7, t`The two lines, scales hidden.`),
        };
      },
    }),
    num({
      id: 'cp-blend', difficulty: 3, transfer: true,
      gen(r) {
        const [p1, p2, p] = r.pick([[98, 70, 90], [90, 70, 85], [98, 85, 90], [90, 60, 80], [98, 80, 92]]);
        const M = r.pick([200, 300, 400, 600]);
        const x = M * (p - p2) / (p1 - p2);
        return {
          prompt: t`A test stand needs $${M}$ kg of $${p}\%$ hydrogen peroxide, blended from stocks of $${p1}\%$ and $${p2}\%$. How many kilograms of the $${p1}\%$ stock go in?`,
          answer: x, units: 'kg', tol: { rel: 0.005 },
          errors: [{ value: M - x, feedback: t`That is the amount of the weaker, $${p2}\%$, stock.` }],
          hints: [t`$x + y = ${M}$ and $${p1 / 100}x + ${p2 / 100}y = ${nice(p / 100 * M)}$.`, t`Multiply the first by $${p2 / 100}$ and subtract to eliminate $y$.`],
          teach: t`Mixing problems are two balances: total mass, and mass of the ingredient that matters.`,
          explain: t`$${nice((p1 - p2) / 100)}x = ${nice((p - p2) / 100 * M)}$, so $x = ${nice(sig(x, 4))}$ kg of the $${p1}\%$ stock and $${nice(sig(M - x, 4))}$ kg of the $${p2}\%$.`,
          visual: linesFig([1, 1, M], [p1 / 100, p2 / 100, p / 100 * M], M / 2, M / 2, M * 0.75, t`Total-mass and peroxide-mass lines in the plane of the two amounts; scales hidden.`, { labels: ['total mass', 'peroxide mass'], xlabel: `x: ${p1}% stock`, ylabel: `y: ${p2}% stock` }),
        };
      },
    }),
    mcq({
      id: 'cp-coincident', difficulty: 2,
      prompt: t`For which $k$ does the system $\;y = 2x + 1,\quad 4x - 2y = k\;$ have infinitely many solutions?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [-6, 8], aspect: 'wide', curves: [{ fn: '2x + 1', color: 'accent', label: 'y = 2x + 1', labelAt: 2.2, labelDx: -86, labelDy: -10 }, { fn: '2x - 3', color: 'gold', dash: true, label: 'k = 6', labelAt: 3.2, labelDx: 8 }, { fn: '2x - 1', color: 'gold', dash: true, label: 'k = 2', labelAt: 3.2, labelDx: 8 }, { fn: '2x + 3', color: 'gold', dash: true, label: 'k = −6', labelAt: 2.2, labelDx: 8 }] }, caption: t`The second equation for a few values of $k$ (dashed): always parallel to the first. Which $k$ lands on it?` },
      choices: [t`$k = -2$`, t`$k = 2$`, t`$k = 1$`, 'for every k'],
      answer: 0,
      why: {
        1: t`With $k = 2$, $4x - 2y = 2$ is $y = 2x - 1$: parallel, but shifted down by 2 — no solution.`,
        2: t`$k = 1$ gives $y = 2x - \tfrac12$, another parallel line.`,
        3: t`For most $k$ the lines are parallel and distinct, with no solution.`,
      },
      hints: [t`Substitute $y = 2x + 1$ into $4x - 2y$.`],
      teach: t`Two linear equations describe the same line exactly when one is a multiple of the other, right-hand side included.`,
      explain: t`$4x - 2(2x + 1) = -2$ for every $x$, so the system holds for all points of the line exactly when $k = -2$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §11.1 Systems of Linear Equations: Two Variables', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/11-1-systems-of-linear-equations-two-variables' },
  ],
});
