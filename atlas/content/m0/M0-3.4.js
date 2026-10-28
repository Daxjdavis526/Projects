// Equations with radicals and rational terms — and the extra "solutions" squaring invents.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { N, sgn, bothSides, thou } from './_m0kit.js';

const t = String.raw;
const GM = 3.986004418e14, RE = 6371;   // Earth: m³/s², km

// √(x + a) = x − b with roots p (genuine) and q (extraneous): p + q = 2b + 1, pq = b² − a
function radicalCase(r) {
  const b = r.int(1, 4), p = b + r.intExcept(2, 5, [b + 1, b === 3 ? 3 : 0]), q = 2 * b + 1 - p, a = b * b - p * q;
  return { a, b, p, q, lhs: t`\sqrt{x ${sgn(a)}}`, rhs: t`x - ${b}` };
}
const radicalFig = ({ a, b, p, q }, caption, ticks = false) => bothSides({
  lhs: `sqrt(x + (${a}))`, rhs: `x - ${b}`, x: [-a - 0.5, p + 3], y: [Math.min(-b - a - 1, q - b - 1), p - b + 3], xticks: ticks ? null : 0, yticks: ticks ? null : 0,
  lhsLabel: `y = √(x ${a < 0 ? '−' : '+'} ${Math.abs(a)})`, rhsLabel: `y = x − ${b}`, lhsDomain: [-a, p + 3], legendAt: 'tl', caption,
});

export default lesson({
  id: 'm0.M0-3.4',
  title: 'Equations with radicals and rational terms',
  minutes: 9, difficulty: 3,
  intro: t`To clear a square root you square both sides; to clear fractions you multiply by the denominators. Both moves are useful and both are **not reversible**: squaring cannot tell $3$ from $-3$, and multiplying by an expression that is zero proves nothing. So they can add **extraneous roots** — numbers that solve the new equation but not the original:

$$\sqrt{u} = v \;\Longrightarrow\; u = v^2, \qquad\text{but}\qquad u = v^2 \;\not\Longrightarrow\; \sqrt{u} = v$$

The cure is simple and non-negotiable: **substitute every candidate back into the original equation.**`,
  symbols: [
    { tex: '\\sqrt{u}', text: 'the non-negative square root: never negative, and defined only for $u \\ge 0$' },
    { tex: 'u,\\ v', text: 'the two sides of the equation, each an expression in $x$' },
    { tex: '\\Longrightarrow', text: '“implies”: every solution of the left statement solves the right one' },
    { tex: '\\not\\Longrightarrow', text: 'the reverse fails: $u = v^2$ also holds when $\\sqrt u = -v$' },
  ],
  why: t`Physics formulas are full of roots and reciprocals — speeds from energies, radii from periods, the thin-lens and resistor equations — and an extraneous root is a negative time or an imaginary distance waiting to be reported.`,
  visual: {
    type: 'graph',
    title: 'Where the extra root comes from',
    lead: t`Solve $\sqrt{x + 3} = x - k$: the blue curve is the left side, the gold line the right side. Squaring both sides also lets in the dashed violet curve, $y = -\sqrt{x + 3}$. Slide $k$.`,
    tasks: [
      t`At $k = 3$, squaring gives $x = 6$ and $x = 1$. Only $x = 6$ is on the blue curve; $x = 1$ lies on the violet one.`,
      t`At every $k$ here the line meets the blue curve once and the violet curve once: one genuine root, one extraneous.`,
      t`Check the extraneous root by substitution: the left side is positive, the right side negative.`,
    ],
    params: {
      x: [-4, 10], y: [-5, 5],
      sliders: [{ key: 'k', label: t`Shift $k$`, min: 0, max: 6, step: 0.5, value: 3, explain: t`The right-hand side is $x - k$: a line of slope 1, slid right by $k$.` }],
      curves: [{ fn: 'sqrt(x + 3)', color: 'accent', domain: [-3, 10] }, { fn: '-sqrt(x + 3)', color: 'violet', dash: true, domain: [-3, 10] }, { fn: 'x - k', color: 'gold' }],
      points: [
        { x: '((2k + 1) + sqrt(4k + 13))/2', y: '((2k + 1) + sqrt(4k + 13))/2 - k', color: 'good', r: 5.5, label: 'genuine', labelDx: 10 },
        { x: '((2k + 1) - sqrt(4k + 13))/2', y: '((2k + 1) - sqrt(4k + 13))/2 - k', color: 'bad', hollow: true, r: 5.5, label: 'extraneous', labelDx: 10, labelDy: 14 },
      ],
      readouts: [{ label: 'genuine root', expr: '((2k + 1) + sqrt(4k + 13))/2', digits: 3 }, { label: 'extraneous root', expr: '((2k + 1) - sqrt(4k + 13))/2', digits: 3 }],
    },
    caption: t`Both roots solve the squared equation $x + 3 = (x - k)^2$; only one solves the original. For $k$ just below $-3$ the line can meet the blue curve twice, and then both roots are genuine.`,
  },
  example: {
    prompt: t`Solve $\sqrt{x + 3} = x - 3$.`,
    visual: bothSides({ lhs: 'sqrt(x + 3)', rhs: 'x - 3', x: [-4, 9], y: [-4, 6], xticks: null, lhsDomain: [-3, 9], lhsLabel: 'y = √(x + 3)', rhsLabel: 'y = x − 3',
      extra: { curves: [{ fn: 'sqrt(x + 3)', color: 'accent', domain: [-3, 9] }, { fn: 'x - 3', color: 'gold' }, { fn: '-sqrt(x + 3)', color: 'violet', dash: true, domain: [-3, 9] }], points: [{ x: 6, y: 3, color: 'good', label: 'x = 6 ✓' }, { x: 1, y: -2, color: 'bad', hollow: true, label: 'x = 1 ✗', labelDx: 10, labelDy: 14 }] },
      caption: t`The two sides meet once, at $x = 6$. The candidate $x = 1$ sits on the dashed curve $y = -\sqrt{x+3}$, which squaring let in.` }),
    steps: [
      { label: 'Square both sides', text: t`$x + 3 = (x - 3)^2 = x^2 - 6x + 9$ — with the cross term, not $x^2 + 9$.` },
      { label: 'Solve the quadratic', text: t`$x^2 - 7x + 6 = 0$, so $(x - 1)(x - 6) = 0$: candidates $x = 1$ and $x = 6$.` },
      { label: 'Check x = 6', text: t`$\sqrt{9} = 3$ and $6 - 3 = 3$ ✓.` },
      { label: 'Check x = 1', text: t`$\sqrt{4} = 2$ but $1 - 3 = -2$ ✗. It solves $\sqrt{x+3} = -(x - 3)$, the equation squaring could not tell apart.` },
      { label: 'Conclude', text: t`A square root is never negative, so the right side must be $\ge 0$ — $x \ge 3$ — which rules out $x = 1$ at a glance.` },
    ],
    answer: t`$x = 6$ only; $x = 1$ is extraneous.`,
  },
  practice: [
    mcq({
      id: 'sqrt-extraneous', difficulty: 2,
      gen(r) {
        const c = radicalCase(r);
        return {
          prompt: t`Solve $${c.lhs} = ${c.rhs}$.`,
          visual: radicalFig(c, t`The two sides as curves, scales hidden. How many times do they meet?`),
          choices: [t`$x = ${c.p}$ only`, t`$x = ${c.p}$ and $x = ${c.q}$`, t`$x = ${c.q}$ only`, 'no solution'],
          answer: 0,
          why: {
            1: t`Both solve the squared equation, but check $x = ${c.q}$ in the original: the right side is $${c.q - c.b}$, negative, and a square root never is.`,
            2: t`That is the extraneous root: at $x = ${c.q}$ the left side is $${c.b - c.q}$ and the right side $${c.q - c.b}$.`,
            3: t`$x = ${c.p}$ works: $\sqrt{${c.p + c.a}} = ${c.p - c.b}$ ✓.`,
          },
          hints: [t`Square both sides: $x ${sgn(c.a)} = (x - ${c.b})^2$.`, t`The quadratic gives two candidates; substitute each into the original.`],
          teach: t`After squaring, every candidate must be checked in the original equation.`,
          explain: t`Squaring gives $x^2 - ${2 * c.b + 1}x ${sgn(c.p * c.q)} = 0$, so $x = ${c.p}$ or $x = ${c.q}$. Only $x = ${c.p}$ survives the check.`,
        };
      },
    }),
    mcq({
      id: 'rational-none', difficulty: 2,
      prompt: t`Solve $\dfrac{x}{x - 2} = \dfrac{2}{x - 2} + 3$.`,
      visual: bothSides({ lhs: 'x/(x - 2)', rhs: '2/(x - 2) + 3', x: [-4, 8], y: [-6, 10], xticks: null, lhsLabel: 'left side', rhsLabel: 'right side', legendAt: 'tr',
        extra: { curves: [{ fn: 'x/(x - 2)', color: 'accent', domain: [-4, 1.85] }, { fn: 'x/(x - 2)', color: 'accent', domain: [2.15, 8] }, { fn: '2/(x - 2) + 3', color: 'gold', domain: [-4, 1.85] }, { fn: '2/(x - 2) + 3', color: 'gold', domain: [2.15, 8] }] },
        caption: t`The two sides, which break at $x = 2$. Do they ever meet?` }),
      choices: ['no solution', t`$x = 2$`, t`$x = 3$`, t`every $x \ne 2$`],
      answer: 0,
      why: {
        1: t`At $x = 2$ both sides divide by zero, so $x = 2$ is not in the domain. Multiplying by $x - 2$ produced it.`,
        2: t`At $x = 3$: left $3$, right $2 + 3 = 5$.`,
        3: t`The left side is always $2$ less than the right: $\tfrac{x}{x-2} - \tfrac{2}{x-2} = 1$, not $3$.`,
      },
      hints: [t`Multiply by $x - 2$: $x = 2 + 3(x - 2)$, and solve.`, t`Is the answer allowed in the original equation?`],
      teach: t`Multiplying by a denominator can create a “solution” that makes that denominator zero; such a value is always excluded.`,
      explain: t`$x = 2 + 3x - 6 \Rightarrow x = 2$, which makes the denominators zero. No solution — the graphs are two hyperbolas a constant $2$ apart.`,
    }),
    num({
      id: 'pendulum-L', difficulty: 2,
      gen(r) {
        const T = r.pick([1, 1.5, 2, 2.5, 3]), g = 9.81, L = g * T * T / (4 * Math.PI ** 2);
        return {
          prompt: t`A clock needs a pendulum with period $T = ${T}$ s. Using $T = 2\pi\sqrt{L/g}$ with $g = 9.81\ \text{m/s}^2$, how long must it be?`,
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: g * T / (2 * Math.PI), feedback: t`Squaring both sides squares $T/(2\pi)$: $L = g\,T^2/(4\pi^2)$.` }],
          hints: [t`Divide by $2\pi$, then square both sides: $\dfrac{T^2}{4\pi^2} = \dfrac{L}{g}$.`],
          teach: t`Squaring removes a square root; here both sides are positive, so no extraneous root can appear.`,
          explain: t`$L = \dfrac{9.81 \times ${T}^2}{4\pi^2} = ${nice(sig(L, 3))}$ m.`,
          visual: bothSides({ lhs: '2pi*sqrt(x/9.81)', rhs: `${T}`, x: [0, L * 2.2], y: [0, T * 1.6], xlabel: 'L', ylabel: 'T', xticks: 0, lhsLabel: 'T(L)', rhsLabel: `T = ${T} s`, legendAt: 'br', caption: t`Period against length and the target period; the length scale is hidden. Small swings assumed.` }),
        };
      },
    }),
    mcq({
      id: 'square-error', difficulty: 3, kind: 'error',
      prompt: t`To solve $\sqrt{2x + 1} + 1 = x$, a student squares both sides term by term: $(2x + 1) + 1 = x^2$. What is wrong?`,
      visual: bothSides({ lhs: 'sqrt(2x + 1) + 1', rhs: 'x', x: [-1, 7], y: [-1, 7], xticks: null, lhsDomain: [-0.5, 7], lhsLabel: 'y = √(2x + 1) + 1', rhsLabel: 'y = x', caption: t`The two sides, with scales. They meet once.` }),
      choices: [t`$(a + b)^2 \ne a^2 + b^2$: isolate the root first, $\sqrt{2x + 1} = x - 1$, then square`, t`Nothing is wrong with that step`, t`Only the root should be squared: $2x + 1 + 1 = x$`, t`Take the square root of both sides instead`],
      answer: 0,
      why: {
        1: t`Squaring the left side gives $(\sqrt{2x+1} + 1)^2 = 2x + 1 + 2\sqrt{2x+1} + 1$; the cross term is missing.`,
        2: t`Both sides of an equation must get the same operation; squaring only one term changes the equation.`,
        3: t`That would not remove the root; it adds another one.`,
      },
      hints: [t`Expand $(\sqrt{2x + 1} + 1)^2$ properly.`, t`Move the $+1$ across first so the root is alone.`],
      teach: t`Isolate the radical before squaring, so the square of the root side is just what is under the root.`,
      explain: t`$\sqrt{2x + 1} = x - 1 \Rightarrow 2x + 1 = x^2 - 2x + 1 \Rightarrow x(x - 4) = 0$. Check: $x = 4$ gives $3 + 1 = 4$ ✓; $x = 0$ gives $1 + 1 = 2 \ne 0$ ✗. Answer: $x = 4$.`,
    }),
    num({
      id: 'rational-solve', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4]), b = r.int(1, 5), x0 = r.intExcept(-4, 9, [b, 0]);
        const a = k * (x0 - b) - x0;
        const errors = [];
        const slip = (a + b) / (k - 1);
        if (Math.abs(slip - x0) > 1e-9) errors.push({ value: slip, feedback: t`Cross-multiplying multiplies the whole denominator: $x ${sgn(a)} = ${k}(x - ${b}) = ${k}x - ${k * b}$.` });
        return {
          prompt: t`Solve $\dfrac{x ${sgn(a)}}{x - ${b}} = ${k}$.`,
          answer: x0, tol: { rel: 0, abs: 1e-6 },
          errors,
          hints: [t`Multiply both sides by $x - ${b}$ (allowed as long as $x \ne ${b}$).`, t`$x ${sgn(a)} = ${k}x - ${k * b}$; collect the $x$ terms.`],
          teach: t`Clear the denominator, solve, then make sure the answer does not make the denominator zero.`,
          explain: t`$x ${sgn(a)} = ${k}x - ${k * b} \Rightarrow ${1 - k}x = ${-k * b - a} \Rightarrow x = ${x0}$, and $${x0} \ne ${b}$ ✓.`,
          visual: bothSides({ lhs: `(x + (${a}))/(x - ${b})`, rhs: `${k}`, x: [Math.min(b, x0) - 6, Math.max(b, x0) + 6], y: [k - 8, k + 8], yticks: 0, lhsLabel: 'left side', rhsLabel: `y = ${k}`, legendAt: 'tr',
            extra: { curves: [{ fn: `(x + (${a}))/(x - ${b})`, color: 'accent', domain: [Math.min(b, x0) - 6, b - 0.08] }, { fn: `(x + (${a}))/(x - ${b})`, color: 'accent', domain: [b + 0.08, Math.max(b, x0) + 6] }, { fn: `${k}`, color: 'gold' }] },
            caption: t`The left side (a hyperbola, broken at $x = ${b}$) and the constant ${k}; scales hidden.` }),
        };
      },
    }),
    multi({
      id: 'which-steps', difficulty: 2,
      prompt: t`Which of these steps can introduce extraneous solutions? Select all that apply.`,
      choices: ['squaring both sides', t`multiplying both sides by an expression containing $x$`, 'adding the same number to both sides', t`dividing both sides by $5$`, 'cubing both sides'],
      answer: [0, 1],
      why: {
        2: t`Adding a number is undone by subtracting it: the new equation has exactly the same solutions.`,
        3: t`Dividing by a nonzero constant is reversible.`,
        4: t`Cubing is one-to-one — $a^3 = b^3$ forces $a = b$ for real numbers — so it adds nothing. Squaring is the problem because $(-a)^2 = a^2$.`,
      },
      hints: [t`A step is safe if you can undo it and get back exactly the original equation.`],
      teach: t`Reversible steps keep the solution set; squaring and multiplying by an expression that can be zero are not reversible.`,
      explain: t`Squaring merges $u = v$ with $u = -v$, and multiplying by an expression that can be zero adds that expression’s zeros. The others can be undone exactly.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sqrt-root', difficulty: 3,
      gen(r) {
        const c = radicalCase(r);
        return {
          prompt: t`Solve $${c.lhs} = ${c.rhs}$.`,
          answer: c.p, tol: { rel: 0, abs: 1e-6 },
          errors: [{ value: c.q, feedback: t`That root is extraneous: at $x = ${c.q}$ the right side is negative but a square root is not.` }],
          hints: [t`Square: $x ${sgn(c.a)} = (x - ${c.b})^2$.`, t`Check both candidates in the original.`],
          teach: t`Square, solve, then reject any candidate that fails the original equation.`,
          explain: t`Candidates $x = ${c.p}$ and $x = ${c.q}$; only $x = ${c.p}$ satisfies $\sqrt{${c.p + c.a}} = ${c.p - c.b}$.`,
          visual: radicalFig(c, t`The two sides, scales hidden.`),
        };
      },
    }),
    mcq({
      id: 'cp-rational-none', difficulty: 3,
      prompt: t`Solve $\dfrac{1}{x - 1} + \dfrac{1}{x + 1} = \dfrac{2}{x^2 - 1}$.`,
      visual: bothSides({ lhs: '1/(x - 1) + 1/(x + 1)', rhs: '2/(x^2 - 1)', x: [-4, 4], y: [-6, 6], xticks: null, lhsLabel: 'left side', rhsLabel: 'right side', legendAt: 'tr',
        extra: { curves: [[-4, -1.06], [-0.94, 0.94], [1.06, 4]].flatMap(([lo, hi]) => [{ fn: '1/(x - 1) + 1/(x + 1)', color: 'accent', domain: [lo, hi] }, { fn: '2/(x^2 - 1)', color: 'gold', domain: [lo, hi] }]) },
        caption: t`Both sides, which break at $x = \pm 1$.` }),
      choices: ['no solution', t`$x = 1$`, t`$x = -1$`, t`$x = 0$`],
      answer: 0,
      why: {
        1: t`Clearing denominators gives $2x = 2$, i.e. $x = 1$ — but $x = 1$ makes three of the denominators zero.`,
        2: t`$x = -1$ is excluded too, and it does not even solve the cleared equation.`,
        3: t`At $x = 0$: left $-1 + 1 = 0$, right $-2$.`,
      },
      hints: [t`Multiply through by $x^2 - 1 = (x - 1)(x + 1)$.`, t`$(x + 1) + (x - 1) = 2$. Is the result allowed?`],
      teach: t`A candidate that zeroes a denominator of the original equation is rejected, however cleanly the algebra produced it.`,
      explain: t`$2x = 2 \Rightarrow x = 1$, excluded. No solution — indeed the left side minus the right is $\tfrac{2}{x + 1}$, which is never zero.`,
    }),
    num({
      id: 'cp-orbit-alt', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([7.5, 7.0, 6.0, 5.0]);
        const rr = GM / (v * 1e3) ** 2 / 1e3, h = rr - RE;
        return {
          prompt: t`A satellite in a circular orbit moves at $v = \sqrt{GM/r} = ${v}$ km/s, with $GM = 3.986 \times 10^{14}\ \text{m}^3/\text{s}^2$. Solve for its orbit radius $r$, then give its altitude above Earth’s surface ($R_E = ${thou(RE)}$ km).`,
          answer: h, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: rr, feedback: t`That is the orbit radius, measured from Earth’s centre. Subtract Earth’s radius for the altitude.` }],
          hints: [t`Square both sides: $v^2 = GM/r$, so $r = GM/v^2$ (with $v$ in m/s).`, t`Then altitude $= r - R_E$.`],
          teach: t`Squaring $v = \sqrt{GM/r}$ is safe here: both sides are positive, so no extraneous root appears.`,
          explain: t`$r = \dfrac{3.986 \times 10^{14}}{(${v} \times 10^3)^2} = ${thou(Math.round(rr))}$ km, so the altitude is $${thou(Math.round(h))}$ km.`,
          visual: bothSides({ lhs: `sqrt(${N(GM / 1e12)}/x)`, rhs: `${v}`, x: [5, 22], y: [3, 9], xlabel: 'r (thousand km)', ylabel: 'v (km/s)', xticks: 0, lhsLabel: 'v = √(GM/r)', rhsLabel: `v = ${v} km/s`, legendAt: 'tr', extra: { vlines: [{ x: 6.371, label: 'Earth’s surface', color: 'ink3' }] }, caption: t`Circular-orbit speed against radius and the given speed; radius scale hidden.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §2.6 Other Types of Equations (radical and rational equations)', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-6-other-types-of-equations' },
  ],
});
