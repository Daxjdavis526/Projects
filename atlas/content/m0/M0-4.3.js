// Composition and inverse functions — machines in series, and running a machine backwards.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';
import { sgn } from './_m0kit.js';

const t = String.raw;
const is = (k) => `step(0.5 - abs(fam - ${k}))`;
// f for each explore choice, as an expression in u (the input)
const FAM = ['u^3', 'e^u', 'u^2', '2u + 1'];
const at = (k, u) => FAM[k].replace(/u/g, `(${u})`);

export default lesson({
  id: 'm0.M0-4.3',
  title: 'Composition and inverse functions',
  minutes: 9, difficulty: 2,
  intro: t`**Composition** chains two functions: the output of $g$ becomes the input of $f$. An **inverse** runs a function backwards: if $f$ sends $x$ to $y$, then $f^{-1}$ sends $y$ back to $x$.

$$(f \circ g)(x) = f\big(g(x)\big), \qquad f^{-1}\big(f(x)\big) = x$$

Order matters — $f(g(x))$ is usually not $g(f(x))$ — and $f^{-1}$ is **not** $1/f$: the $-1$ means “undo”, not “reciprocal”. Only a function that never repeats an output (it passes the **horizontal line test**) has an inverse; its graph is the mirror image of $f$’s in the line $y = x$.`,
  symbols: [
    { tex: 'f \\circ g', text: '“$f$ after $g$”: apply $g$ first, then $f$ to the result' },
    { tex: 'g(x)', text: 'the **inner** function, which acts first' },
    { tex: 'f', text: 'the **outer** function, which acts on $g$’s output' },
    { tex: 'f^{-1}', text: 'the **inverse** of $f$: it returns the input that produced a given output. Not $1/f(x)$, which is written $\\big(f(x)\\big)^{-1}$' },
  ],
  why: t`Every unit conversion has an inverse, every sensor’s calibration curve is run backwards to read the measurement, and the chain rule of calculus is the derivative of a composition. Spotting the inner and outer function is half of differentiating anything.`,
  visual: {
    type: 'graph',
    title: 'An inverse is a reflection in y = x',
    lead: t`The blue curve is $f$, the gold curve its inverse $f^{-1}$, the dashed line $y = x$. The point $P = (a, f(a))$ on $f$ and $Q = (f(a), a)$ on $f^{-1}$ swap coordinates. Slide $a$ and change $f$.`,
    tasks: [
      t`With $e^x$: $P$ at $(0, 1)$ reflects to $Q$ at $(1, 0)$ on $\ln x$. Every point of $f$ swaps its coordinates.`,
      t`With $x^3$: where $f$ is flat (near $0$) the inverse is steep. Slopes at mirror points are reciprocals.`,
      t`With $x^2$: only the half $x \ge 0$ is drawn. The full parabola fails the horizontal line test ($2^2 = (-2)^2$), so we restrict it before inverting.`,
    ],
    params: {
      x: [-4, 6], y: [-3.5, 6], equal: true, aspect: 'wide',
      choices: [{ key: 'fam', label: t`Function $f(x)$`, options: [[0, t`$x^3$`], [1, t`$e^x$`], [2, t`$x^2,\ x \ge 0$`], [3, t`$2x + 1$`]], value: 1, explain: 'The function to invert; its inverse is drawn in gold.' }],
      sliders: [{ key: 'a', label: t`Input $a$`, min: -1.5, max: 1.8, step: 0.05, value: 0.6, explain: t`$P = (a, f(a))$ on $f$; its mirror image $Q = (f(a), a)$ lies on $f^{-1}$.` }],
      curves: [
        { fn: 'x', color: 'ink3', dash: true, label: 'y = x', labelAt: 4.6, labelDx: 6, labelDy: 14 },
        { fn: 'x^3', color: 'accent', when: is(0) }, { fn: 'cbrt(x)', color: 'gold', when: is(0) },
        { fn: 'e^x', color: 'accent', when: is(1) }, { fn: 'ln(x)', color: 'gold', domain: [0.01, 7], when: is(1) },
        { fn: 'x^2', color: 'accent', domain: [0, 3], when: is(2) }, { fn: 'sqrt(x)', color: 'gold', domain: [0, 7], when: is(2) },
        { fn: '2x + 1', color: 'accent', when: is(3) }, { fn: '(x - 1)/2', color: 'gold', when: is(3) },
        ...[0, 1, 2, 3].map((k) => ({ param: [`a + t*(${at(k, 'a')} - a)`, `${at(k, 'a')} + t*(a - ${at(k, 'a')})`], t: [0, 1], color: 'violet', width: 1.4, dash: true, when: k === 2 ? `${is(2)}*step(a)` : is(k) })),
      ],
      points: [0, 1, 2, 3].flatMap((k) => [
        { x: 'a', y: at(k, 'a'), color: 'accent', r: 5.5, label: 'P', labelDx: -18, labelDy: -10, when: k === 2 ? `${is(2)}*step(a)` : is(k) },
        { x: at(k, 'a'), y: 'a', color: 'gold', r: 5.5, label: 'Q', labelDx: 8, labelDy: 14, when: k === 2 ? `${is(2)}*step(a)` : is(k) },
      ]),
    },
    caption: t`Both axes share one scale, so the reflection in $y = x$ is a true mirror image. The violet dashed segment joining $P$ and $Q$ always crosses $y = x$ at a right angle.`,
  },
  example: {
    prompt: t`Find the inverse of $f(x) = \dfrac{2x + 1}{x - 3}$, and its domain.`,
    visual: { type: 'graph', params: { x: [-8, 12], y: [-6, 10], equal: true, aspect: 'wide',
      curves: [{ fn: 'x', color: 'ink3', dash: true }, { fn: '(2x + 1)/(x - 3)', color: 'accent', domain: [-12, 2.3] }, { fn: '(2x + 1)/(x - 3)', color: 'accent', domain: [3.7, 14], label: 'f', labelAt: 9, labelDx: 4, labelDy: -10 }, { fn: '(3x + 1)/(x - 2)', color: 'gold', domain: [-12, 1.3] }, { fn: '(3x + 1)/(x - 2)', color: 'gold', domain: [2.7, 14], label: 'f⁻¹', labelAt: 10, labelDx: 4, labelDy: 14 }],
      vlines: [{ x: 3, color: 'accent' }, { x: 2, color: 'gold' }], hlines: [{ y: 2, color: 'accent' }, { y: 3, color: 'gold' }] },
      caption: t`$f$ (blue) and $f^{-1}$ (gold), mirror images in $y = x$. Each has a vertical and a horizontal asymptote (dashed), and they swap: $x = 3,\ y = 2$ for $f$ become $x = 2,\ y = 3$.` },
    steps: [
      { label: 'Swap the roles', text: t`Write $y = \dfrac{2x + 1}{x - 3}$ and solve for $x$ — the input that gives output $y$.` },
      { label: 'Clear the fraction', text: t`$y(x - 3) = 2x + 1$, so $xy - 3y = 2x + 1$.` },
      { label: 'Collect the x terms', text: t`$xy - 2x = 3y + 1$, so $x(y - 2) = 3y + 1$ and $x = \dfrac{3y + 1}{y - 2}$.` },
      { label: 'Rename', text: t`Call the new input $x$ again: $f^{-1}(x) = \dfrac{3x + 1}{x - 2}$. Its domain is the range of $f$: every $x \ne 2$, because $f$ never outputs $2$.` },
      { label: 'Check', text: t`$f(0) = -\tfrac13$, and $f^{-1}(-\tfrac13) = \dfrac{-1 + 1}{-\tfrac13 - 2} = 0$ ✓. Compare $1/f(x) = \dfrac{x - 3}{2x + 1}$ — a different function entirely.` },
    ],
    answer: t`$f^{-1}(x) = \dfrac{3x + 1}{x - 2}$, for $x \ne 2$.`,
  },
  practice: [
    mcq({
      id: 'compose-order', difficulty: 1,
      gen(r) {
        const c = r.int(2, 5);
        return {
          prompt: t`Let $f(x) = x^2$ and $g(x) = x + ${c}$. What is $(f \circ g)(x) = f\big(g(x)\big)$?`,
          visual: { type: 'graph', params: { x: [-7, 4], y: [-4, 9], aspect: 'wide', curves: [{ fn: 'x^2', color: 'accent', label: 'f(x) = x²', labelAt: 2.1, labelDx: 8, labelDy: 0 }, { fn: `x + ${c}`, color: 'gold', label: `g(x) = x + ${c}`, labelAt: -6, labelDx: 4, labelDy: 18 }] }, caption: t`The two building blocks, $f$ and $g$.` },
          choices: [t`$(x + ${c})^2$`, t`$x^2 + ${c}$`, t`$x^2(x + ${c})$`, t`$x^2 + ${c * c}$`],
          answer: 0,
          why: {
            1: t`That is $g(f(x))$: square first, then add $${c}$. In $f(g(x))$, $g$ acts first.`,
            2: t`That is the product $f(x)\,g(x)$. Composition feeds one output into the other function; it does not multiply.`,
            3: t`That squares each part separately — the slip $(a + b)^2 = a^2 + b^2$. $f$ squares the whole of $g(x)$.`,
          },
          hints: [t`Replace the $x$ in $f(x) = x^2$ by the whole of $g(x)$.`],
          teach: t`$f(g(x))$: apply $g$ first, then put its entire output into $f$.`,
          explain: t`$f(g(x)) = f(x + ${c}) = (x + ${c})^2$ — a parabola moved ${c} to the left. The other order, $g(f(x)) = x^2 + ${c}$, moves it up instead.`,
        };
      },
    }),
    num({
      id: 'read-composition', difficulty: 2,
      gen(r) {
        const s = r.pick([1, 2]), c = r.int(-3, 0), x0 = r.int(1, 2);
        const g = (x) => s * x + c, f = (u) => 5 - (u - 1) ** 2;
        const ans = f(g(x0)), gf = g(f(x0)), prod = f(x0) * g(x0);
        const errors = [{ value: gf, feedback: t`That is $g(f(${x0}))$ — the other order. Read $g(${x0})$ first, then feed it to $f$.` }, { value: prod, feedback: t`That is $f(${x0}) \times g(${x0})$, a product. Composition feeds $g(${x0})$ into $f$.` }, { value: g(x0), feedback: t`That is only the inner step, $g(${x0})$. Now apply $f$ to it.` }]
          .filter((e, i, arr) => e.value !== ans && arr.findIndex((o) => o.value === e.value) === i);
        return {
          prompt: t`Using the graphs of $f$ (blue) and $g$ (gold), find $f\big(g(${x0})\big)$.`,
          answer: ans, tol: { rel: 0, abs: 1e-6 },
          errors,
          hints: [t`Read $g(${x0})$ from the gold line first.`, t`Then find the height of the blue curve at that input.`],
          teach: t`To evaluate $f(g(a))$ from graphs, read $g$ at $a$, then read $f$ at that value.`,
          explain: t`$g(${x0}) = ${g(x0)}$, and $f(${g(x0)}) = ${ans}$.`,
          visual: { type: 'graph', params: { x: [-4, 5], y: [-6, 7], aspect: 'wide', xticks: 9, yticks: 13, curves: [{ fn: '5 - (x - 1)^2', color: 'accent', label: 'f', labelAt: 2.6, labelDx: 8, labelDy: -2 }, { fn: `${s}x + (${c})`, color: 'gold', label: 'g', labelAt: s === 2 ? 3.6 : 4.4, labelDx: -18, labelDy: -2 }] }, caption: t`Both graphs on one grid; every value you need is a whole number.` },
        };
      },
    }),
    mcq({
      id: 'inverse-not-reciprocal', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4, 5]), b = r.intExcept(-6, 6, [0]);
        return {
          prompt: t`Find the inverse of $f(x) = ${a}x ${sgn(b)}$.`,
          visual: { type: 'graph', params: { x: [-8, 8], y: [-8, 8], equal: true, aspect: 'wide', curves: [{ fn: 'x', color: 'ink3', dash: true, label: 'y = x', labelAt: 5.5, labelDx: 6, labelDy: 14 }, { fn: `${a}x + (${b})`, color: 'accent', label: 'f', labelAt: (6 - b) / a, labelDx: 8, labelDy: 4 }] }, caption: t`$f$ and the mirror line $y = x$; the inverse is $f$ reflected in it.` },
          choices: [t`$f^{-1}(x) = \dfrac{x ${sgn(-b)}}{${a}}$`, t`$f^{-1}(x) = \dfrac{1}{${a}x ${sgn(b)}}$`, t`$f^{-1}(x) = \dfrac{x}{${a}} ${sgn(-b)}$`, t`$f^{-1}(x) = \dfrac{x ${sgn(b)}}{${a}}$`],
          answer: 0,
          why: {
            1: t`That is $1/f(x)$, the reciprocal. The $-1$ in $f^{-1}$ means “undo”: $f^{-1}$ must take $f(x)$ back to $x$.`,
            2: t`The undo steps run in reverse order: $f$ multiplies by $${a}$ and *then* adds $${b}$, so the inverse first subtracts $${b}$ and then divides.`,
            3: t`To undo “add $${b}$” you subtract it: check $f^{-1}(f(0)) = f^{-1}(${b})$, which should be $0$.`,
          },
          hints: [t`Solve $y = ${a}x ${sgn(b)}$ for $x$.`, t`Undo the last step first.`],
          teach: t`An inverse undoes the steps of $f$ in reverse order; it is not the reciprocal $1/f$.`,
          explain: t`$y = ${a}x ${sgn(b)} \Rightarrow x = \dfrac{y ${sgn(-b)}}{${a}}$. Check: $f^{-1}(f(1)) = \dfrac{${a + b} ${sgn(-b)}}{${a}} = 1$ ✓.`,
        };
      },
    }),
    expr({
      id: 'sensor-inverse', difficulty: 2,
      gen(r) {
        const Pf = r.pick([50, 100, 200, 250]), s = 4 / Pf, k = Pf / 4;
        return {
          prompt: t`A pressure transducer on a propellant line outputs $V = 0.5 + ${nice(s)}\,P$ volts for a pressure $P$ in bar, from $0.5$ V at $0$ bar to $4.5$ V at $${Pf}$ bar. The data system must turn a reading back into a pressure. Write the inverse function $P(V)$.`,
          lhs: 'P(V)',
          answer: `${k}(V - 0.5)`, answerTeX: t`${k}\,(V - 0.5)`,
          vars: { V: [0.6, 4.4] },
          errors: [
            { answer: `1/(0.5 + ${nice(s)}V)`, feedback: t`That is the reciprocal $1/V(P)$ with $P$ renamed — the $f^{-1} = 1/f$ slip. Solve the calibration for $P$ instead.` },
            { answer: `${k}V - 0.5`, feedback: t`Subtract the offset first, then divide: $P = (V - 0.5)/${nice(s)}$.` },
            { answer: `${k}(V + 0.5)`, feedback: t`The offset is added by the sensor, so the inverse subtracts it.` },
          ],
          hints: [t`Solve $V = 0.5 + ${nice(s)}\,P$ for $P$.`, t`$P = \dfrac{V - 0.5}{${nice(s)}}$, and $1/${nice(s)} = ${k}$.`],
          teach: t`Reading a sensor means running its calibration function backwards.`,
          explain: t`$P(V) = \dfrac{V - 0.5}{${nice(s)}} = ${k}(V - 0.5)$ bar. A reading of $2.5$ V means $${nice(k * 2)}$ bar, half of full scale ✓.`,
          visual: { type: 'graph', params: { x: [-0.08 * Pf, 1.1 * Pf], y: [0, 5], aspect: 'wide', xlabel: 'P (bar)', ylabel: 'V (volts)', curves: [{ fn: `0.5 + ${s}x`, color: 'accent', domain: [0, Pf] }], points: [{ x: 0, y: 0.5, color: 'gold', r: 5, label: '0.5 V', labelDx: 8, labelDy: -10 }, { x: Pf, y: 4.5, color: 'gold', r: 5, label: '4.5 V', labelDx: -46, labelDy: -10 }] }, caption: t`The calibration line $V(P)$. A real transducer has a small non-linearity, ignored here.` },
        };
      },
    }),
    match({
      id: 'decompose', difficulty: 2,
      prompt: t`Each function is a composition $f(g(x))$. Match it with its **inner** function $g$ — the one that acts first.`,
      left: [t`$\sin(x^2)$`, t`$e^{-3t}$`, t`$\sqrt{1 - v^2}$`, t`$(2x + 1)^5$`],
      right: ['x²', '−3t', '1 − v²', '2x + 1', 'sin x', 'u⁵'],
      answer: [0, 1, 2, 3],
      hints: [t`Ask what you would compute first on a calculator.`, t`The outer function is the last button you press: $\sin$, $\exp$, $\sqrt{\ }$, the fifth power.`],
      teach: t`Decomposing a function into outer and inner parts is exactly what the chain rule needs.`,
      explain: t`$\sin(x^2)$: square, then sine. $e^{-3t}$: multiply by $-3$, then exponentiate. $\sqrt{1 - v^2}$: compute $1 - v^2$, then the root. $(2x + 1)^5$: compute $2x + 1$, then raise to the fifth. The chain rule (Calculus I, C1-3.6) differentiates the outer function at the inner one, times the inner function’s derivative.`,
    }),
    mcq({
      id: 'restrict-domain', difficulty: 2,
      prompt: t`$f(x) = (x - 2)^2 + 1$ has no inverse on all of $\mathbb{R}$. On which domain does it have the inverse $f^{-1}(x) = 2 + \sqrt{x - 1}$?`,
      visual: { type: 'graph', params: { x: [-2, 6], y: [-1, 6], aspect: 'wide', curves: [{ fn: '(x - 2)^2 + 1', color: 'accent' }], hlines: [{ y: 3, color: 'gold', label: 'y = 3' }], points: [{ x: 0.5858, y: 3, color: 'gold', r: 5 }, { x: 3.4142, y: 3, color: 'gold', r: 5 }] }, caption: t`The horizontal line $y = 3$ meets the parabola twice: two inputs share one output.` },
      choices: [t`$x \ge 2$`, t`$x \le 2$`, t`$x \ge 0$`, t`$x \ge 1$`],
      answer: 0,
      why: {
        1: t`On $x \le 2$ the inverse would be $2 - \sqrt{x - 1}$, whose outputs are $\le 2$. The given formula outputs values $\ge 2$.`,
        2: t`$x \ge 0$ still contains both $x = 1$ and $x = 3$, which share the output $f = 2$: the horizontal line test fails.`,
        3: t`$x \ge 1$ still contains $x = 1$ and $x = 3$, which share an output.`,
      },
      hints: [t`The inverse’s outputs are the original function’s inputs.`, t`$2 + \sqrt{x - 1}$ is always at least $2$.`],
      teach: t`To invert a function that repeats outputs, restrict it to a piece on which it is one-to-one; the piece you choose fixes the inverse’s formula.`,
      explain: t`Outputs of $2 + \sqrt{x - 1}$ are $\ge 2$, so they must be the inputs $x \ge 2$ — the right half of the parabola, where it rises steadily and passes the horizontal line test.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-inverse-rational', difficulty: 3,
      gen(r) {
        const p = r.int(1, 5), q = r.intExcept(1, 5, [p]);
        return {
          prompt: t`Find the inverse of $f(x) = \dfrac{x + ${p}}{x - ${q}}$.`,
          lhs: 'f^{-1}(x)',
          answer: `(${q}x + ${p})/(x - 1)`, answerTeX: t`\dfrac{${q}x + ${p}}{x - 1}`,
          vars: { x: [2, 5] },
          errors: [{ answer: `(x - ${q})/(x + ${p})`, feedback: t`That is $1/f(x)$, the reciprocal. Solve $y = \dfrac{x + ${p}}{x - ${q}}$ for $x$ instead.` }, { answer: `(${q}x - ${p})/(x - 1)`, feedback: t`Check the sign of the constant: $xy - ${q}y = x + ${p}$ gives $x(y - 1) = ${q}y + ${p}$.` }],
          hints: [t`Write $y = \dfrac{x + ${p}}{x - ${q}}$ and multiply by $x - ${q}$.`, t`$xy - ${q}y = x + ${p}$: collect the $x$ terms on one side.`, t`$x(y - 1) = ${q}y + ${p}$.`],
          teach: t`To invert a function, solve $y = f(x)$ for $x$, then rename $y$ as $x$.`,
          explain: t`$x(y - 1) = ${q}y + ${p}$, so $f^{-1}(x) = \dfrac{${q}x + ${p}}{x - 1}$, for $x \ne 1$ (the value $f$ never takes). Check: $f(0) = -\tfrac{${p}}{${q}}$ and $f^{-1}(-\tfrac{${p}}{${q}}) = \dfrac{-${p} + ${p}}{\cdots} = 0$ ✓.`,
          visual: { type: 'graph', params: { x: [-8, 12], y: [-6, 8], aspect: 'wide', equal: true, curves: [{ fn: 'x', color: 'ink3', dash: true }, { fn: `(x + ${p})/(x - ${q})`, color: 'accent', domain: [-12, q - 0.25] }, { fn: `(x + ${p})/(x - ${q})`, color: 'accent', domain: [q + 0.25, 14] }], vlines: [{ x: q, color: 'accent' }], hlines: [{ y: 1, color: 'accent' }] }, caption: t`$f$ with its asymptotes $x = ${q}$ and $y = 1$, and the mirror line $y = x$.` },
        };
      },
    }),
    expr({
      id: 'cp-rocket-inverse', difficulty: 2, transfer: true,
      gen(r) {
        const [ve, what] = r.pick([[3.1, 'a hypergolic bipropellant'], [2.9, 'a solid-propellant'], [4.4, 'a hydrogen–oxygen'], [3.4, 'a kerosene–oxygen']]);
        return {
          prompt: t`The rocket equation $\Delta v = v_e \ln R$ gives a stage’s velocity change as a function of its mass ratio $R = m_0/m_f$ (initial over final mass). For ${what} stage with $v_e = ${ve}$ km/s, write the inverse function $R(\Delta v)$, with $\Delta v$ in km/s.`,
          lhs: 'R(\\Delta v)',
          answer: `e^(Δv/${ve})`, answerTeX: t`e^{\Delta v/${ve}}`,
          vars: { 'Δv': [0.5, 6] }, keys: [['Δv', 'Δv']],
          errors: [
            { answer: `1/(${ve} ln(Δv))`, feedback: t`That is $1/\Delta v$ with the variable renamed — the $f^{-1} = 1/f$ slip. Solve $\Delta v = ${ve}\ln R$ for $R$.` },
            { answer: `Δv/${ve}`, feedback: t`That is $\ln R$. Undo the logarithm too: $R = e^{\ln R}$.` },
            { answer: `ln(Δv/${ve})`, feedback: t`The inverse of $\ln$ is the exponential, not another logarithm.` },
          ],
          hints: [t`Divide by $${ve}$ first: $\ln R = \Delta v/${ve}$.`, t`Undo the natural log with $e^{(\cdot)}$.`],
          teach: t`The inverse of $y = c\ln x$ is $x = e^{y/c}$: undo the multiplication, then the logarithm.`,
          explain: t`$\ln R = \Delta v/${ve}$, so $R(\Delta v) = e^{\Delta v/${ve}}$. For $\Delta v = 2.4$ km/s that is $${nice(sig(Math.exp(2.4 / ve), 3))}$: the stage must start $${nice(sig(Math.exp(2.4 / ve), 3))}$ times heavier than it ends.`,
          visual: { type: 'graph', params: { x: [0.8, 8], y: [-0.6, 7], aspect: 'wide', xlabel: 'mass ratio R', ylabel: 'Δv (km/s)', curves: [{ fn: `${ve} ln(x)`, color: 'accent', domain: [1, 8], label: 'Δv(R)', labelAt: 6.5, labelDx: -10, labelDy: -14 }], points: [{ x: 1, y: 0, color: 'gold', r: 5, label: 'R = 1: no propellant', labelDx: 10, labelDy: 14 }] }, caption: t`The rocket equation as a function of mass ratio: no gravity or drag losses, constant exhaust speed.` },
        };
      },
    }),
    num({
      id: 'cp-cryogen-kelvin', difficulty: 2,
      gen(r) {
        const [F, name] = r.pick([[-297.3, 'liquid oxygen'], [-423.2, 'liquid hydrogen'], [-320.4, 'liquid nitrogen'], [-258.7, 'liquid methane']]);
        const C = (F - 32) * 5 / 9, K = C + 273.15, wrong = (F * 5 / 9 - 32) + 273.15;
        return {
          prompt: t`A US data sheet gives the boiling point of ${name} as $${F}\ {}^\circ\text{F}$. With $C(F) = \tfrac59(F - 32)$ and $K(C) = C + 273.15$, evaluate the composition $K\big(C(F)\big)$ to get it in kelvin.`,
          answer: K, units: 'K', tol: { rel: 0.002 },
          errors: [{ value: wrong, feedback: t`Subtract $32$ *before* multiplying by $\tfrac59$: $C(F) = \tfrac59(F - 32)$, brackets first.` }, { value: F + 273.15, feedback: t`The $273.15$ offset converts Celsius, not Fahrenheit. Apply $C(F)$ first.` }],
          hints: [t`Inner function first: $C = \tfrac59(${F} - 32)$.`, t`Then add $273.15$.`],
          teach: t`A chain of unit conversions is a composition: apply the inner conversion first.`,
          explain: t`$C = \tfrac59(${F} - 32) = ${nice(sig(C, 4))}\ {}^\circ\text{C}$, then $K = ${nice(sig(C, 4))} + 273.15 = ${nice(sig(K, 3))}$ K.`,
          visual: { type: 'graph', params: { x: [-480, 120], y: [-300, 60], aspect: 'wide', xlabel: '°F', ylabel: '°C', curves: [{ fn: '5/9*(x - 32)', color: 'accent', label: 'C(F)', labelAt: 40, labelDx: -40, labelDy: -12 }], vlines: [{ x: F, color: 'gold', label: `${F} °F` }], points: [{ x: 32, y: 0, color: 'ink3', r: 4, label: 'water freezes', labelDx: -90, labelDy: -12 }] }, caption: t`The inner conversion, Celsius against Fahrenheit, with the given temperature marked.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §1.4 Composition of Functions', url: 'https://openstax.org/books/precalculus-2e/pages/1-4-composition-of-functions' },
    { label: 'OpenStax Precalculus 2e, §1.7 Inverse Functions', url: 'https://openstax.org/books/precalculus-2e/pages/1-7-inverse-functions' },
    { label: 'NIST Chemistry WebBook: normal boiling points of O₂, H₂, N₂, CH₄', url: 'https://webbook.nist.gov/chemistry/' },
  ],
});
