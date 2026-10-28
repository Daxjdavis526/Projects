// The idea of a limit — what a function is heading for near a point, judged
// from both sides, regardless of what (if anything) happens at the point.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice, fmt, sig } from '../../src/core/format.js';

const t = String.raw;

const is = (k) => `step(0.5 - abs(k - ${k}))`;
const F = `${is(0)}*sin(x)/x + ${is(1)}*(1 + 0.5*sgn(x)) + ${is(2)}*sin(1/x) + ${is(3)}*0.3/x^2`;

// a table of values approaching a from both sides, as display TeX
function table(f, a, steps = [0.1, 0.01, 0.001], n = 6) {
  const xs = [...steps.map((s) => a - s), ...steps.slice().reverse().map((s) => a + s)];
  const cells = xs.map((x) => nice(sig(f(x), n), n + 2));
  return t`$$\begin{array}{c|${'c'.repeat(xs.length)}} x & ${xs.map((x) => nice(sig(x, 6))).join(' & ')} \\ \hline f(x) & ${cells.join(' & ')} \end{array}$$`;
}

export default lesson({
  id: 'math1210.C1-2.1',
  title: 'The idea of a limit',
  minutes: 9, difficulty: 2,
  intro: t`A limit describes where a function is **heading** as its input closes in on a point — not what happens *at* the point. We write

$$\lim_{x\to a} f(x) = L$$

when $f(x)$ can be made as close to $L$ as we like by taking $x$ close enough to $a$, from both sides, with $x \ne a$. The value $f(a)$ plays no part: it may be different from $L$, or not exist at all. That is exactly what calculus needs, because the velocity at an instant is the limit of an average velocity whose formula is $0/0$ at the instant itself.`,
  symbols: [
    { tex: 'x', text: 'the input, which closes in on $a$ but is never equal to it' },
    { tex: 'a', text: 'the point being approached' },
    { tex: 'f(x)', text: 'the output near $a$ — the values whose trend we read' },
    { tex: 'L', text: 'the **limit**: the single number those outputs settle on' },
    { tex: 'x \\to a', text: '“$x$ approaches $a$” — from both sides unless a side is stated' },
  ],
  why: t`Every derivative, every integral and every series in physics is defined as a limit.`,
  visual: {
    type: 'graph',
    title: 'Closing in on x = 0 from both sides',
    lead: t`Four functions, each with something odd at $x = 0$. The gold points sit a distance $d$ to the left and right of $0$, and the readouts give $f(-d)$ and $f(d)$. Shrink $d$ and watch whether both readouts settle on one number.`,
    tasks: [
      t`$\frac{\sin x}{x}$ is undefined at $0$ ($0/0$), yet both readouts close in on $1$: the limit is $1$.`,
      t`The jump: the left readout settles on $0.5$ and the right on $1.5$. Two different targets, so there is no limit.`,
      t`$\sin(1/x)$: however small $d$ gets, the readouts keep jumping around in $[-1, 1]$. No limit. Then try $0.3/x^2$: the values grow without bound.`,
    ],
    params: {
      x: [-4, 4], y: [-1.6, 2.6], aspect: 'wide',
      choices: [{ key: 'k', label: 'Function', options: [[0, t`$\frac{\sin x}{x}$`], [1, 'a jump'], [2, t`$\sin(1/x)$`], [3, t`$0.3/x^2$`]], value: 0, explain: t`Which function to study near $x = 0$.` }],
      sliders: [{ key: 'd', label: t`Distance $d$ from $0$`, min: 0.001, max: 2, step: 0.001, value: 1, logScale: true, explain: t`How close the two sample points are to $x = 0$; the slider is logarithmic, so you can reach $0.001$.` }],
      curves: [
        { fn: 'sin(x)/x', color: 'accent', when: is(0), domain: [-4, 4] },
        { fn: '0.5', color: 'accent', when: is(1), domain: [-4, -0.02] },
        { fn: '1.5', color: 'accent', when: is(1), domain: [0.02, 4] },
        { fn: 'sin(1/x)', color: 'accent', when: is(2), domain: [-4, 4] },
        { fn: '0.3/x^2', color: 'accent', when: is(3), domain: [-4, 4] },
      ],
      points: [{ x: '-d', y: F.replace(/x/g, '(-d)'), color: 'gold' }, { x: 'd', y: F.replace(/x/g, '(d)'), color: 'gold' }],
      vlines: [{ x: 0, color: 'ink4' }],
      readouts: [
        { label: t`$f(-d)$`, expr: F.replace(/x/g, '(-d)'), digits: 5 },
        { label: t`$f(d)$`, expr: F.replace(/x/g, '(d)'), digits: 5 },
      ],
    },
    caption: t`None of these functions is shown at $x = 0$ itself: $\frac{\sin x}{x}$ and $\sin(1/x)$ are undefined there, and the jump’s value at $0$ does not matter to the limit. Near $0$, $\sin(1/x)$ oscillates faster than the screen can draw.`,
  },
  example: {
    prompt: t`A rocket’s altitude is $h(t) = 15t^2$ m. Its average velocity over $[2, 2 + \Delta t]$ is $\bar v(\Delta t) = \dfrac{h(2 + \Delta t) - h(2)}{\Delta t}$. This formula is $0/0$ at $\Delta t = 0$. Find $\lim_{\Delta t \to 0} \bar v(\Delta t)$, the velocity at $t = 2$ s.`,
    visual: { type: 'graph', params: { x: [-1.2, 1.2], y: [38, 80], aspect: 'wide', xlabel: 'Δt (s)', ylabel: 'average velocity (m/s)', curves: [{ fn: '60 + 15*x', color: 'accent', domain: [-1.2, -0.03] }, { fn: '60 + 15*x', color: 'accent', domain: [0.03, 1.2] }], points: [{ x: -0.5, y: 52.5, color: 'gold' }, { x: 0.5, y: 67.5, color: 'gold' }, { x: 0.1, y: 61.5, color: 'gold' }, { x: -0.1, y: 58.5, color: 'gold' }] }, caption: t`The average velocity against the interval length. The gap at $\Delta t = 0$ is where the formula is $0/0$; the values on both sides close in on one height.` },
    steps: [
      { label: 'Tabulate', text: t`$\bar v(0.1) = \frac{15(2.1)^2 - 60}{0.1} = 61.5$, $\;\bar v(0.01) = 60.15$, $\;\bar v(0.001) = 60.015$; from the left, $\bar v(-0.01) = 59.85$, $\;\bar v(-0.001) = 59.985$.` },
      { label: 'Read the trend', text: t`From both sides the values close in on $60$. The table suggests $L = 60$ m/s — but a table is evidence, not proof.` },
      { label: 'Confirm by algebra', text: t`For $\Delta t \ne 0$: $\bar v = \frac{15(4\Delta t + \Delta t^2)}{\Delta t} = 60 + 15\,\Delta t$. As $\Delta t \to 0$ this tends to $60$. Cancelling was legal because the limit never uses $\Delta t = 0$.` },
      { label: 'Sense check', text: t`$h = 15t^2$ means a constant acceleration of $30\ \text{m/s}^2$ from rest; after $2$ s that gives $v = 30 \times 2 = 60$ m/s. ✓` },
    ],
    answer: t`$\lim_{\Delta t\to 0}\bar v(\Delta t) = 60$ m/s, although $\bar v(0)$ itself is undefined.`,
  },
  practice: [
    num({
      id: 'table-exp', difficulty: 1,
      gen(r) {
        const k = r.pick([2, 3, 0.5, -2, 4, 1.5]);
        const f = (x) => (Math.exp(k * x) - 1) / x;
        return {
          prompt: t`Here are values of $f(x) = \dfrac{e^{${k}x} - 1}{x}$ near $x = 0$:

${table(f, 0)}

Estimate $\displaystyle\lim_{x\to 0} f(x)$.`,
          answer: k, tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: t`$f(0)$ is $0/0$, which is not $0$ — it is undefined. Read the trend in the table instead.` }, ...(k !== 1 ? [{ value: 1, feedback: t`$0/0$ is not $1$ either. The table’s values close in on another number.` }] : [])],
          hints: ['Look at the values nearest x = 0 on both sides.'],
          teach: t`A table estimates a limit by the value both sides close in on; the formula’s value at the point (here $0/0$) is irrelevant.`,
          explain: t`From both sides the values approach $${k}$, so $\lim_{x\to0}\frac{e^{${k}x}-1}{x} = ${k}$. (You will prove it with the derivative of $e^{${k}x}$ at $0$.)`,
          visual: { type: 'graph', params: { x: [-1, 1], y: [Math.min(0, f(-1), f(1)) - 0.5, Math.max(0, f(-1), f(1)) + 0.5], aspect: 'wide', curves: [{ fn: `(e^(${k}*x) - 1)/x`, color: 'accent', domain: [-1, -0.02] }, { fn: `(e^(${k}*x) - 1)/x`, color: 'accent', domain: [0.02, 1] }] }, caption: t`$y = (e^{${k}x} - 1)/x$, with a gap at $x = 0$ where the formula is $0/0$.` },
        };
      },
    }),
    mcq({
      id: 'value-vs-limit', difficulty: 1,
      prompt: t`The graph shows $f$, defined by $f(x) = \tfrac12 x^2 + 1$ for $x \ne 2$ and $f(2) = 5$. What is $\displaystyle\lim_{x\to 2} f(x)$?`,
      visual: { type: 'graph', params: { x: [-0.3, 4], y: [-0.3, 6.5], aspect: 'wide', curves: [{ fn: '0.5*x^2 + 1', color: 'accent', domain: [-0.3, 1.94] }, { fn: '0.5*x^2 + 1', color: 'accent', domain: [2.06, 4] }], points: [{ x: 2, y: 5, color: 'accent', label: 'f(2) = 5' }] }, caption: t`The gap in the curve at $x = 2$ is a hole; the lone dot is the value $f(2)$.` },
      choices: ['3', '5', 'It does not exist, because the curve has a hole at x = 2', '4'],
      answer: 0,
      why: {
        1: t`$5$ is the value $f(2)$. The limit asks where $f(x)$ is heading as $x$ approaches $2$, and the curve heads to $3$ from both sides.`,
        2: 'A hole does not stop a limit from existing: the values on both sides still close in on one number.',
        3: t`There is no averaging: the curve heads for $3$ on both sides; $5$ is just the isolated value $f(2)$.`,
      },
      hints: [t`Cover up the dot at $x = 2$. Where is the curve heading?`],
      teach: t`$\lim_{x\to a} f(x)$ never looks at $f(a)$ — only at values of $f$ near $a$.`,
      explain: t`Near $x = 2$, $f(x) = \tfrac12 x^2 + 1 \to \tfrac12(4) + 1 = 3$ from both sides. The limit is $3$, while $f(2) = 5$: the two can differ.`,
    }),
    mcq({
      id: 'jump-dne', difficulty: 2,
      prompt: t`For the function in the graph, what is $\displaystyle\lim_{x\to 1} f(x)$?`,
      visual: { type: 'graph', params: { x: [-1, 3], y: [-0.5, 4.2], aspect: 'wide', curves: [{ fn: '1 + 0.5*(x - 1)', color: 'accent', domain: [-1, 0.97] }, { fn: '3 + 0.3*(x - 1)', color: 'accent', domain: [1, 3] }], points: [{ x: 1, y: 3, color: 'accent' }] }, caption: t`The right-hand piece includes its left end, so $f(1) = 3$; the left-hand piece stops just short of $x = 1$.` },
      choices: ['It does not exist', '3', '1', '2'],
      answer: 0,
      why: {
        1: t`$3$ is $f(1)$ and the target from the right. From the left, $f(x)$ heads for $1$ instead.`,
        2: t`$1$ is where the left piece is heading. A two-sided limit needs both sides to agree.`,
        3: t`Limits do not average the two sides: $2$ is a value $f$ never approaches.`,
      },
      hints: ['Where does the curve head as x approaches 1 from the left? From the right?'],
      teach: 'A two-sided limit exists only when the left and right approaches settle on the same number.',
      explain: t`From the left $f(x) \to 1$; from the right $f(x) \to 3$. They differ, so $\lim_{x\to1} f(x)$ does not exist — whatever $f(1)$ is.`,
    }),
    mcq({
      id: 'sin-inverse', difficulty: 3, kind: 'error',
      prompt: t`A student evaluates $f(x) = \sin(\pi/x)$ at $x = 1, 0.1, 0.01, 0.001$, gets $0$ every time, and concludes that $\displaystyle\lim_{x\to 0^+}\sin(\pi/x) = 0$. What is wrong?`,
      visual: { type: 'graph', params: { x: [-0.05, 1.1], y: [-1.4, 1.4], aspect: 'wide', curves: [{ fn: 'sin(pi/x)', color: 'accent', domain: [0.015, 1.1] }], points: [{ x: 1, y: 0, color: 'gold', label: 'x = 1' }, { x: 0.1, y: 0, color: 'gold', label: 'x = 0.1', labelDy: 16 }] }, caption: t`$y = \sin(\pi/x)$ for $x > 0.015$; closer to $0$ it oscillates too fast to draw. The student’s samples (gold) all land on zeros.` },
      choices: [
        t`Every sample lands where $\pi/x$ is a multiple of $\pi$; between them $f$ swings between $-1$ and $1$, so there is no limit`,
        t`Nothing is wrong: the limit is $0$`,
        t`The limit is $1$, the largest value the sine reaches`,
        t`The samples should have been negative; the limit from the left is $0$`,
      ],
      answer: 0,
      why: {
        1: t`Try $x = 2/(4n+1)$: there $\sin(\pi/x) = 1$ for every $n$, however close to $0$. Values arbitrarily near $0$ take both $0$ and $1$.`,
        2: t`$f$ reaches $1$ infinitely often near $0$, but also $-1$ and $0$; it never settles on any number.`,
        3: t`$\sin(\pi/x)$ is odd, so the left side oscillates exactly the same way: no limit there either.`,
      },
      hints: ['Ask what the student’s sample points have in common.', t`At $x = 1/n$, $\sin(\pi/x) = \sin(n\pi) = 0$. What happens at $x = 2/5$, or $2/41$?`],
      teach: 'A table only samples a function; a pattern in the samples can hide behaviour between them.',
      explain: t`At $x = 10^{-k}$, $\pi/x = 10^k\pi$ and the sine is $0$ — the samples are special. At $x = 2/(4n+1)$ the sine is $1$, and at $x = 2/(4n+3)$ it is $-1$. Near $0$ the function takes every value in $[-1, 1]$ over and over, so the limit does not exist.`,
    }),
    num({
      id: 'dq-limit', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, -1, -2, 1.5]);
        const ans = 3 * a * a;
        return {
          prompt: t`Find $\displaystyle\lim_{h\to 0}\frac{(${a} + h)^3 - ${nice(a ** 3)}}{h}$ — the slope of $y = x^3$ at $x = ${a}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`Substituting $h = 0$ gives $0/0$, which is not a number. Expand and cancel first.` }, { value: a ** 3, feedback: t`That is the value $y = x^3$ at $x = ${a}$, not the limit of the slope.` }],
          hints: [t`$(a + h)^3 = a^3 + 3a^2h + 3ah^2 + h^3$.`, t`After subtracting $${nice(a ** 3)}$, every term has a factor $h$: divide it out, then let $h \to 0$.`],
          teach: t`When direct substitution gives $0/0$, simplify for $h \ne 0$ first; the limit then follows by substitution.`,
          explain: t`$\frac{(${a}+h)^3 - ${nice(a ** 3)}}{h} = ${nice(3 * a * a)} + ${nice(3 * a)}h + h^2 \to ${nice(ans)}$ as $h \to 0$.`,
          visual: { type: 'graph', params: { x: [a - 2, a + 2], y: [Math.min((a - 2) ** 3, (a + 2) ** 3) - 1, Math.max((a - 2) ** 3, (a + 2) ** 3) + 1], aspect: 'wide', curves: [{ fn: 'x^3', color: 'accent' }, { fn: `${a ** 3} + (${((a + 1) ** 3 - a ** 3)})*(x - (${a}))`, color: 'violet', dash: true, domain: [a - 0.8, a + 1.6] }], points: [{ x: a, y: a ** 3, color: 'gold' }, { x: a + 1, y: (a + 1) ** 3, color: 'violet' }] }, caption: t`$y = x^3$ and the secant for $h = 1$. The limit is the slope the secants approach as $h$ shrinks.` },
        };
      },
    }),
    multi({
      id: 'truths', difficulty: 2,
      prompt: t`Which statements about $\displaystyle\lim_{x\to a} f(x)$ are true? Select all that apply.`,
      visual: { type: 'graph', params: { x: [-2.2, 2.2], y: [-0.4, 1.4], aspect: 'wide', curves: [{ fn: 'sin(3*x)/(3*x)', color: 'accent', domain: [-2.2, -0.03] }, { fn: 'sin(3*x)/(3*x)', color: 'accent', domain: [0.03, 2.2] }] }, caption: t`$y = \sin(3x)/(3x)$: undefined at $x = 0$, with limit $1$ there.` },
      choices: [
        t`The limit can exist even when $f(a)$ is undefined.`,
        t`If $f(a)$ is defined, the limit must equal $f(a)$.`,
        t`Changing the single value $f(a)$ cannot change the limit.`,
        t`A limit is a value $f$ approaches but can never actually reach.`,
        t`If $f(x)$ gets closer and closer to $2$ as $x \to a$, the limit must be $2$.`,
      ],
      answer: [0, 2],
      why: {
        1: t`A function can have a hole with a stray dot elsewhere, as $f(2) = 5$ with limit $3$ did.`,
        3: t`For $f(x) = 2x + 1$, $f(3) = 7$ *is* the limit at $3$. Nothing forbids $f$ from equalling its limit — continuous functions always do.`,
        4: t`“Closer and closer” is not enough: $f$ could be creeping up toward $1.9$, getting closer to $2$ all the time. The limit requires getting *arbitrarily* close.`,
      },
      hints: ['The definition only looks at x near a, with x ≠ a.', t`Test each claim on $f(x) = 2x + 1$ and on a function with a hole.`],
      teach: t`The limit at $a$ depends only on values near $a$, and it must be approached arbitrarily closely — it may or may not equal $f(a)$.`,
      explain: t`The definition excludes $x = a$, so $f(a)$ — present, absent or different — never matters (true, false, true). A limit can be reached ($2x + 1$ at $3$), and “closer and closer” without “arbitrarily close” does not pin the limit down.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sqrt', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2, 3, 4, 5]);
        const f = (x) => (Math.sqrt(c * c + x) - c) / x;
        return {
          prompt: t`Here are values of $f(x) = \dfrac{\sqrt{${c * c} + x} - ${c}}{x}$ near $x = 0$:

${table(f, 0)}

Estimate $\displaystyle\lim_{x\to 0} f(x)$ to three significant figures.`,
          answer: 1 / (2 * c), tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`At $x = 0$ the formula is $0/0$, which is undefined, not $0$. Read the trend.` }],
          hints: ['Both sides of the table approach the same value.'],
          teach: 'A limit is read from values near the point on both sides, never from the point itself.',
          explain: t`The values close in on $${nice(1 / (2 * c))}$ from both sides. (Rationalizing proves it: $f(x) = \frac{1}{\sqrt{${c * c}+x}+${c}} \to \frac{1}{${2 * c}}$.)`,
          visual: { type: 'graph', params: { x: [-0.9 * c * c, 3 * c * c], y: [0, 1.6 / (2 * c)], aspect: 'wide', curves: [{ fn: `(sqrt(${c * c} + x) - ${c})/x`, color: 'accent', domain: [-0.9 * c * c, -0.02 * c * c] }, { fn: `(sqrt(${c * c} + x) - ${c})/x`, color: 'accent', domain: [0.02 * c * c, 3 * c * c] }] }, caption: t`$y = f(x)$, with the gap at $x = 0$ where the formula is $0/0$.` },
        };
      },
    }),
    mcq({
      id: 'cp-hole', difficulty: 2,
      prompt: t`For the function in the graph, which statement is correct at $x = -1$?`,
      visual: { type: 'graph', params: { x: [-3, 1.5], y: [-0.5, 4.5], aspect: 'wide', curves: [{ fn: '(x + 1)^2 + 1.5', color: 'accent', domain: [-3, -1.06] }, { fn: '(x + 1)^2 + 1.5', color: 'accent', domain: [-0.94, 1.5] }] }, caption: t`A hole at $x = -1$ and no dot anywhere above or below it: $f(-1)$ is undefined.` },
      choices: [t`$\lim_{x\to-1} f(x) = 1.5$, although $f(-1)$ is undefined`, t`The limit does not exist, because $f(-1)$ is undefined`, t`$\lim_{x\to-1} f(x) = 0$`, t`The limit is $1.5$ from the right only`],
      answer: 0,
      why: {
        1: t`A missing value at $x = -1$ does not affect the limit; both sides head for $1.5$.`,
        2: t`Nothing points to $0$: the curve heads for height $1.5$.`,
        3: 'Both sides of the curve meet at the hole, so the two-sided limit exists.',
      },
      hints: ['Follow the curve toward x = −1 from each side.'],
      teach: t`A limit at a hole exists if both sides close in on the hole’s height.`,
      explain: t`From both sides the curve closes in on height $1.5$, so $\lim_{x\to-1} f(x) = 1.5$; the undefined $f(-1)$ is irrelevant.`,
    }),
    num({
      id: 'cp-relativity', difficulty: 3, transfer: true,
      prompt: t`A body of mass $m$ moving at speed $v = \beta c$ has relativistic kinetic energy $K = (\gamma - 1)mc^2$, with $\gamma = 1/\sqrt{1 - \beta^2}$. Compare it with Newton’s $\tfrac12 mv^2$ through the ratio

$$Q(\beta) = \frac{K}{\tfrac12 m v^2} = \frac{2(\gamma - 1)}{\beta^2}.$$

$Q(0)$ is $0/0$. Evaluate $Q$ at $\beta = 0.1$ and $\beta = 0.01$ and find $\displaystyle\lim_{\beta\to 0} Q(\beta)$.`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 4.5], aspect: 'wide', xlabel: 'β = v/c', ylabel: 'Q', curves: [{ fn: '2*(1/sqrt(1 - x^2) - 1)/x^2', color: 'accent', domain: [0.3, 0.95] }] }, caption: t`The ratio $Q$ for $0.3 \le \beta \le 0.95$: at everyday speeds it is off the left of this picture. The relativistic energy pulls away from Newton’s as $\beta \to 1$.` },
      answer: 1, tol: { rel: 0.005 },
      errors: [{ value: 0.5, feedback: t`You may have compared $(\gamma - 1)$ with $\beta^2$ and dropped the factor $2$ from Newton’s $\tfrac12 mv^2$.` }, { value: 0, feedback: t`$Q(0)$ is $0/0$ — undefined, not $0$. Compute $Q$ at small $\beta$ and read the trend.` }],
      hints: [t`At $\beta = 0.1$: $\gamma = 1/\sqrt{0.99} = 1.0050378$, so $Q = 2(0.0050378)/0.01$.`, t`$Q(0.1) \approx 1.0076$ and $Q(0.01) \approx 1.000075$.`],
      teach: 'The low-speed limit of a relativistic formula is the Newtonian one: here the energy ratio tends to 1.',
      explain: t`$Q(0.1) = 1.00756$, $Q(0.01) = 1.000075$: the ratio tends to $1$. At low speed $K \to \tfrac12 mv^2$, so Newton’s kinetic energy is the $\beta \to 0$ limit of Einstein’s. (Expanding $\gamma \approx 1 + \tfrac12\beta^2 + \tfrac38\beta^4$ gives $Q \approx 1 + \tfrac34\beta^2$.)`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §2.2 The limit of a function', url: 'https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function' },
  ],
});
