// What a function is: domain and range — one output per input, and which inputs are allowed.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig } from '../../src/core/format.js';

const t = String.raw;
const G = 9.81;                         // m/s²
const GM = 3.986004418e14, RE = 6371;   // Earth: m³/s², km (mean radius)
const is = (k) => `step(0.5 - abs(fam - ${k}))`;

export default lesson({
  id: 'm0.M0-4.1',
  title: 'What a function is: domain and range',
  minutes: 8, difficulty: 1,
  intro: t`A **function** is a rule that gives **exactly one output for every allowed input**. The allowed inputs form its **domain**; the outputs it actually produces form its **range**:

$$f : D \to \mathbb{R}, \qquad x \mapsto y = f(x)$$

A formula brings its own restrictions — no square root of a negative, no division by zero, no logarithm of zero or a negative — and physics adds more: time after launch is not negative, a mass is not zero. Graphically, a curve is a function of $x$ when **every vertical line meets it at most once**.`,
  symbols: [
    { tex: 'f', text: 'the function: the rule itself, not a number' },
    { tex: 'x', text: 'the input (the independent variable)' },
    { tex: 'y = f(x)', text: 'the single output the rule gives for that input — “$f$ of $x$”, not $f$ times $x$' },
    { tex: 'D', text: 'the **domain**: every input the rule accepts (from the formula and from the physics)' },
    { tex: '\\mathbb{R}', text: 'the real numbers, where the outputs live; the outputs actually reached form the **range**' },
    { tex: '\\mapsto', text: '“is sent to”: the arrow from an input to its output' },
  ],
  why: t`Every model in physics is a function with a domain: the drag law, the orbit, the decay curve. Using a formula outside its domain — a negative time, a radius inside the planet — is how sensible algebra produces nonsense numbers.`,
  visual: {
    type: 'graph',
    title: 'Domain, range and the vertical line',
    lead: t`Pick a rule. The teal bar on the $x$-axis is its domain, the gold bar on the $y$-axis its range (hollow dots are excluded ends). Slide the vertical line $x = c$: where it meets the graph, the violet dot is the output.`,
    tasks: [
      t`Semicircle: slide $c$ past $2$. The line meets nothing — $c$ is outside the domain, because $4 - c^2 < 0$.`,
      t`$1/(x - 1)$: the domain has a gap at $x = 1$ and the range a gap at $y = 0$ — no input ever gives zero.`,
      t`Full circle: the vertical line meets it twice for $-2 < c < 2$. Two outputs for one input, so a circle is not the graph of a function of $x$.`,
    ],
    params: {
      x: [-4, 4], y: [-3, 3], aspect: 'wide',
      choices: [{ key: 'fam', label: 'Rule', options: [[0, t`$\sqrt{4 - x^2}$`], [1, t`$1/(x - 1)$`], [2, t`$\ln(x + 2)$`], [3, t`circle $x^2 + y^2 = 4$`]], value: 0, explain: 'Which rule (or curve) to draw.' }],
      sliders: [{ key: 'c', label: t`Vertical line $x = c$`, min: -3.8, max: 3.8, step: 0.05, value: 1.2, explain: t`The input being tested: the line meets the graph at the output(s) for $x = c$.` }],
      curves: [
        { fn: 'sqrt(4 - x^2)', color: 'accent', domain: [-2, 2], when: is(0) },
        { fn: '1/(x - 1)', color: 'accent', domain: [-4, 0.66], when: is(1) }, { fn: '1/(x - 1)', color: 'accent', domain: [1.34, 4], when: is(1) },
        { fn: 'ln(x + 2)', color: 'accent', domain: [-1.95, 4], when: is(2) },
        { fn: 'sqrt(4 - x^2)', color: 'accent', domain: [-2, 2], when: is(3) }, { fn: '-sqrt(4 - x^2)', color: 'accent', domain: [-2, 2], when: is(3) },
        // domain bars (teal, along y = 0) and range bars (gold, along x = 0)
        { fn: '0', domain: [-2, 2], color: 'teal', width: 7, when: is(0) },
        { fn: '0', domain: [-4, 0.93], color: 'teal', width: 7, when: is(1) }, { fn: '0', domain: [1.07, 4], color: 'teal', width: 7, when: is(1) },
        { fn: '0', domain: [-1.93, 4], color: 'teal', width: 7, when: is(2) },
        { param: ['0', 't'], t: [0, 2], color: 'gold', width: 7, when: is(0) },
        { param: ['0', 't'], t: [-3, -0.07], color: 'gold', width: 7, when: is(1) }, { param: ['0', 't'], t: [0.07, 3], color: 'gold', width: 7, when: is(1) },
        { param: ['0', 't'], t: [-3, 3], color: 'gold', width: 7, when: is(2) },
      ],
      points: [
        { x: 1, y: 0, hollow: true, color: 'teal', r: 5, when: is(1) }, { x: 0, y: 0, hollow: true, color: 'gold', r: 5, when: is(1) },
        { x: -2, y: 0, hollow: true, color: 'teal', r: 5, when: is(2) },
        { x: 'c', y: 'sqrt(4 - c^2)', color: 'violet', r: 5.5, when: is(0) },
        { x: 'c', y: '1/(c - 1)', color: 'violet', r: 5.5, when: is(1) },
        { x: 'c', y: 'ln(c + 2)', color: 'violet', r: 5.5, when: is(2) },
        { x: 'c', y: 'sqrt(4 - c^2)', color: 'bad', r: 5.5, when: is(3) }, { x: 'c', y: '-sqrt(4 - c^2)', color: 'bad', r: 5.5, when: is(3) },
      ],
      vlines: [{ x: 'c', color: 'violet', label: 'x = c' }],
    },
    caption: t`Bars are drawn only within the window: the domain of $\ln(x + 2)$ and the range of $1/(x - 1)$ run on for ever. The curve $1/(x-1)$ is cut short near its gap, where it leaves the window.`,
  },
  example: {
    prompt: t`Find the domain of $f(x) = \dfrac{\sqrt{4 - x^2}}{x - 1}$.`,
    visual: { type: 'graph', params: { x: [-3, 3], y: [-6, 6], aspect: 'wide',
      curves: [{ fn: 'sqrt(4 - x^2)/(x - 1)', color: 'accent', domain: [-2, 0.8] }, { fn: 'sqrt(4 - x^2)/(x - 1)', color: 'accent', domain: [1.2, 2] },
        { fn: '0', domain: [-2, 0.94], color: 'teal', width: 7 }, { fn: '0', domain: [1.06, 2], color: 'teal', width: 7 }],
      points: [{ x: -2, y: 0, color: 'teal', r: 5, label: '−2 (in)', labelDx: -20, labelDy: 18 }, { x: 2, y: 0, color: 'teal', r: 5, label: '2 (in)', labelDx: 8, labelDy: 16 }, { x: 1, y: 0, hollow: true, color: 'bad', r: 5.5, label: '1 (out)', labelDx: 10, labelDy: 16 }],
      vlines: [{ x: 1, color: 'bad' }] },
      caption: t`The graph of $f$ with its domain $[-2, 1) \cup (1, 2]$ as the teal bar: closed dots are included, the hollow one is not. Near $x = 1$ the curve runs off the window.` },
    steps: [
      { label: 'List the hazards', text: t`Two operations can fail: the square root (needs a non-negative argument) and the division (needs a non-zero denominator).` },
      { label: 'The root', text: t`$4 - x^2 \ge 0 \iff x^2 \le 4 \iff -2 \le x \le 2$. The ends are allowed: $\sqrt 0 = 0$ is fine.` },
      { label: 'The denominator', text: t`$x - 1 \ne 0$, so $x \ne 1$ — a point inside $[-2, 2]$, which punches a hole in it.` },
      { label: 'Combine', text: t`Both conditions at once: $D = [-2, 1) \cup (1, 2]$. Square brackets include an end, round ones exclude it, and $\cup$ means “or”.` },
      { label: 'Sense check', text: t`$f(2) = \sqrt0/1 = 0$ ✓ is defined; $f(1) = \sqrt3/0$ is not; $f(3) = \sqrt{-5}/2$ is not a real number.` },
    ],
    answer: t`$D = [-2, 1) \cup (1, 2]$`,
  },
  practice: [
    mcq({
      id: 'is-function', difficulty: 1,
      prompt: t`Which of these equations defines $y$ as a function of $x$?`,
      visual: { type: 'graph', params: { x: [-4.8, 4.8], y: [-3.6, 3.6], equal: true, aspect: 'wide', curves: [{ param: ['3cos(t)', '3sin(t)'], t: [0, '2pi'], color: 'accent' }], vlines: [{ x: 1.5, color: 'violet', label: 'x = 1.5' }], points: [{ x: 1.5, y: 2.598, color: 'bad', r: 5 }, { x: 1.5, y: -2.598, color: 'bad', r: 5 }] }, caption: t`The vertical line test on one of the candidates, $x^2 + y^2 = 9$.` },
      choices: [t`$y = x^3 - 4x$`, t`$x^2 + y^2 = 9$`, t`$x = y^2$`, t`$|y| = x$`],
      answer: 0,
      why: {
        1: t`A circle fails the vertical line test: at $x = 1.5$ both $y = 2.6$ and $y = -2.6$ satisfy it.`,
        2: t`At $x = 4$ both $y = 2$ and $y = -2$ work: two outputs for one input. It is a function of $y$, not of $x$.`,
        3: t`At $x = 3$, $y = 3$ and $y = -3$ both work. The absolute value hides the sign of $y$, so $x$ cannot fix it.`,
      },
      hints: [t`For each candidate, ask: can one value of $x$ give two values of $y$?`],
      teach: t`A rule is a function when each input gives exactly one output — on a graph, every vertical line meets it at most once.`,
      explain: t`$y = x^3 - 4x$ hands back one $y$ for each $x$, even though different $x$ can share a $y$ (it has three zeros) — that is allowed. The other three each give two $y$ values for some $x$.`,
    }),
    mcq({
      id: 'domain-root-frac', difficulty: 2,
      gen(r) {
        const a = r.int(-1, 3), b = a + r.int(2, 4);
        const sa = a < 0 ? `+ ${-a}` : `- ${a}`;
        return {
          prompt: t`Find the domain of $f(x) = \dfrac{\sqrt{x ${a === 0 ? '' : sa}}}{x - ${b}}$.`,
          visual: { type: 'graph', params: { x: [a - 3, b + 3], y: [-5, 5], aspect: 'wide', curves: [{ fn: `x - (${a})`, color: 'accent', label: 'under the root', labelAt: a + 2.5, labelDx: -112, labelDy: -6 }, { fn: `x - ${b}`, color: 'gold', label: 'denominator', labelAt: b + 1.2, labelDx: 6, labelDy: 16 }] }, caption: t`The expression under the root (blue) and the denominator (gold), each as a line in $x$.` },
          choices: [t`$[${a}, ${b}) \cup (${b}, \infty)$`, t`$[${a}, \infty)$`, t`all real $x \ne ${b}$`, t`$(${a}, ${b}) \cup (${b}, \infty)$`],
          answer: 0,
          why: {
            1: t`That forgets the denominator: at $x = ${b}$ you would divide by zero.`,
            2: t`That forgets the square root: for $x < ${a}$ the root is of a negative number.`,
            3: t`$x = ${a}$ is allowed: the numerator is $\sqrt 0 = 0$ and the denominator is $${a - b}$, so $f(${a}) = 0$.`,
          },
          hints: [t`The root needs $x ${a === 0 ? '' : sa} \ge 0$; the fraction needs $x - ${b} \ne 0$.`, t`Is the endpoint $x = ${a}$ itself allowed?`],
          teach: t`A domain must satisfy every restriction at once: roots of non-negative numbers, and no zero denominators.`,
          explain: t`The root needs $x \ge ${a}$ (blue line at or above zero); the denominator removes $x = ${b}$ (where the gold line crosses zero). Together: $[${a}, ${b}) \cup (${b}, \infty)$.`,
        };
      },
    }),
    num({
      id: 'drop-tower', difficulty: 2,
      gen(r) {
        const [H, where] = r.pick([[132, 'NASA’s Zero Gravity Research Facility in Ohio'], [110, 'the Bremen drop tower in Germany'], [60, 'a university drop tower'], [80, 'a microgravity test shaft']]);
        const tEnd = Math.sqrt(2 * H / G);
        const errors = [{ value: 2 * H / G, feedback: t`That is $t^2$. Take the square root: $t = \sqrt{2H/g}$.` }, { value: Math.sqrt(H / G), feedback: t`$\tfrac12 g t^2 = H$ gives $t^2 = 2H/g$ — the factor $2$ goes on top.` }]
          .filter((e) => Math.abs(e.value - tEnd) > 0.03 * tEnd);
        return {
          prompt: t`A capsule is released from rest at the top of ${where}, whose evacuated shaft gives a free fall of $H = ${H}$ m. Its height above the bottom is $h(t) = ${H} - \tfrac12 (9.81)\,t^2$ metres. The formula is a valid model only from release, $t = 0$, until the capsule reaches the bottom. What is the upper end of this physical domain?`,
          answer: tEnd, units: 's', tol: { rel: 0.005 },
          errors,
          hints: [t`The model stops applying when $h(t) = 0$.`, t`Solve $\tfrac12 (9.81)\,t^2 = ${H}$ for the positive $t$.`],
          teach: t`A physical model has a domain set by the physics as well as by the algebra: here $0 \le t \le$ the moment of arrival.`,
          explain: t`$t = \sqrt{2 \times ${H} / 9.81} = ${nice(sig(tEnd, 3))}$ s, so the domain is $0 \le t \le ${nice(sig(tEnd, 3))}$ s. The negative root, $t = -${nice(sig(tEnd, 3))}$ s, solves the algebra but is before the release.`,
          visual: { type: 'graph', params: { x: [-0.5, tEnd * 1.45], y: [-0.55 * H, 1.2 * H], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', xticks: 0, curves: [{ fn: `${H} - 4.905x^2`, color: 'accent', domain: [0, tEnd] }, { fn: `${H} - 4.905x^2`, color: 'ink3', dash: true, domain: [tEnd, tEnd * 1.45], label: 'formula only', labelAt: tEnd * 1.12, labelDx: 10, labelDy: -4 }] }, caption: t`Height against time, time scale hidden. The dashed continuation is where the formula keeps going but the capsule has stopped. Air is pumped out, so drag is neglected.` },
        };
      },
    }),
    mcq({
      id: 'f-of-sum', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 5]);
        return {
          prompt: t`For $f(x) = ${k}x^2$, what is $f(x + h)$?`,
          visual: { type: 'graph', params: { x: [-0.4, 2.6], y: [-0.4 * k, 5 * k], aspect: 'wide', curves: [{ fn: `${k}x^2`, color: 'accent', domain: [0, 2.4], label: `f(x) = ${k}x²`, labelAt: 2.2, labelDx: -78, labelDy: -2 }], points: [{ x: 1, y: k, color: 'gold', label: `f(1) = ${k}`, labelDx: 10, labelDy: 12 }, { x: 2, y: 4 * k, color: 'gold', label: `f(1 + 1) = ${4 * k}`, labelDx: -100, labelDy: 0 }], hlines: [{ y: 2 * k, color: 'bad', label: `f(1) + f(1) = ${2 * k}` }] }, caption: t`A test case, $x = h = 1$: the output at $1 + 1$ is not the sum of the outputs at $1$ and $1$.` },
          choices: [t`$${k}x^2 + ${2 * k}xh + ${k}h^2$`, t`$${k}x^2 + h$`, t`$${k}x^2 + ${k}h^2$`, t`$${k}x^2 + ${k}h$`],
          answer: 0,
          why: {
            1: t`That is $f(x) + h$: adding $h$ to the *output*. $f(x + h)$ feeds $x + h$ into the rule — every $x$ becomes $(x + h)$.`,
            2: t`That is $f(x) + f(h)$, the slip $f(a + b) = f(a) + f(b)$. It fails for squaring: the cross term $${2 * k}xh$ is lost.`,
            3: t`The whole input $(x + h)$ is squared, so $h$ appears squared and in a cross term, not to the first power alone.`,
          },
          hints: [t`Replace every $x$ in the rule by $(x + h)$, brackets and all.`, t`$(x + h)^2 = x^2 + 2xh + h^2$.`],
          teach: t`$f(x + h)$ means “put $x + h$ into the rule”; for most functions it is not $f(x) + f(h)$ and not $f(x) + h$.`,
          explain: t`$f(x + h) = ${k}(x + h)^2 = ${k}x^2 + ${2 * k}xh + ${k}h^2$. Only straight lines through the origin, $f(x) = mx$, satisfy $f(a + b) = f(a) + f(b)$.`,
        };
      },
    }),
    mcq({
      id: 'range-bump', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 3, 4, 6]);
        return {
          prompt: t`What is the range of $f(x) = \dfrac{${k}}{1 + x^2}$, with domain all real numbers?`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-0.6, k + 1], aspect: 'wide', curves: [{ fn: `${k}/(1 + x^2)`, color: 'accent' }] }, caption: t`The graph for $-3 \le x \le 3$ only. What happens beyond the window is for you to decide.` },
          choices: [t`$(0, ${k}]$`, t`$[0, ${k}]$`, t`$(0, \infty)$`, t`all real numbers`],
          answer: 0,
          why: {
            1: t`The output is never $0$: a positive number $${k}$ divided by a positive number is positive. It only approaches $0$ as $|x|$ grows.`,
            2: t`The largest output is at $x = 0$, where the denominator is smallest: $f(0) = ${k}$. Nothing exceeds it.`,
            3: t`Every output is positive, and none exceeds $${k}$: the range is a short interval, not every number.`,
          },
          hints: [t`$1 + x^2$ is at least $1$, and grows without limit.`, t`So $${k}/(1 + x^2)$ is at most $${k}$; can it ever reach $0$?`],
          teach: t`The range is the set of outputs actually produced — find the largest and smallest, and check whether each end is reached or only approached.`,
          explain: t`Since $1 + x^2 \ge 1$, the output is at most $${k}$ (reached at $x = 0$) and always positive, getting as close to $0$ as you like: range $(0, ${k}]$.`,
        };
      },
    }),
    mcq({
      id: 'domain-log', difficulty: 2,
      gen(r) {
        const c = r.int(2, 5);
        return {
          prompt: t`Find the domain of $g(x) = \ln(${c * c} - x^2)$.`,
          visual: { type: 'graph', params: { x: [-c - 3, c + 3], y: [-c * c * 0.9, c * c * 1.3], aspect: 'wide', yticks: 0, curves: [{ fn: `${c * c} - x^2`, color: 'gold', label: 'argument', labelAt: 0.4, labelDx: 8, labelDy: -10 }] }, caption: t`The argument $${c * c} - x^2$ of the logarithm, as a curve; vertical scale hidden.` },
          choices: [t`$-${c} < x < ${c}$`, t`$-${c} \le x \le ${c}$`, t`$x < -${c}$ or $x > ${c}$`, t`all real $x \ne \pm ${c}$`],
          answer: 0,
          why: {
            1: t`At $x = \pm ${c}$ the argument is $0$, and $\ln 0$ is not defined ($\ln u \to -\infty$ as $u \to 0^+$). The ends are excluded.`,
            2: t`That is where the argument is *negative* — the sign of the inequality flipped. $\ln$ needs a positive argument.`,
            3: t`For $|x| > ${c}$ the argument is negative, and the logarithm of a negative number is not a real number.`,
          },
          hints: [t`$\ln u$ needs $u > 0$ — strictly.`, t`Solve $${c * c} - x^2 > 0$.`],
          teach: t`A logarithm needs a strictly positive argument; a square root accepts zero, a logarithm does not.`,
          explain: t`$${c * c} - x^2 > 0 \iff x^2 < ${c * c} \iff -${c} < x < ${c}$ — where the gold curve is above the axis, ends excluded.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-root-domain', difficulty: 2,
      gen(r) {
        const k = r.pick([2, 4, 5]), c = r.intExcept(3, 15, [4, 8, 10, 12]);
        const ans = c / k;
        return {
          prompt: t`The domain of $g(x) = \sqrt{${c} - ${k}x}$ is all $x \le b$. What is $b$?`,
          answer: ans, tol: { rel: 1e-6, abs: 1e-9 },
          errors: [{ value: k / c, feedback: t`Solve $${c} - ${k}x \ge 0$: divide $${c}$ by $${k}$, not the other way round.` }, { value: -ans, feedback: t`$${c} - ${k}x \ge 0$ gives $${k}x \le ${c}$, so $x \le +${nice(ans)}$.` }].filter((e) => Math.abs(e.value - ans) > 1e-6),
          hints: [t`Solve $${c} - ${k}x \ge 0$ for $x$.`],
          teach: t`A square root’s domain is where its argument is zero or positive.`,
          explain: t`$${c} - ${k}x \ge 0 \iff x \le ${c}/${k} = ${nice(ans)}$.`,
          visual: { type: 'graph', params: { x: [-2, ans + 3], y: [-8, c + 3], aspect: 'wide', xticks: 0, curves: [{ fn: `${c} - ${k}x`, color: 'gold', label: 'argument', labelAt: 0, labelDx: 8, labelDy: -6 }] }, caption: t`The argument $${c} - ${k}x$; horizontal scale hidden.` },
        };
      },
    }),
    mcq({
      id: 'cp-double-time', difficulty: 2,
      prompt: t`An object falls from rest, covering $d(t) = \tfrac12 g t^2$ in time $t$. How does $d(2t)$ compare with $d(t)$?`,
      visual: { type: 'graph', params: { x: [-0.3, 3.3], y: [-4, 52], aspect: 'wide', xticks: 0, yticks: 0, xlabel: 't', ylabel: 'd', curves: [{ fn: '4.905x^2', color: 'accent', domain: [0, 3.2] }], vlines: [{ x: 1.5, label: 't', color: 'gold' }, { x: 3, label: '2t', color: 'gold' }] }, caption: t`Distance fallen against time, no air resistance; scales hidden.` },
      choices: [t`$d(2t) = 4\,d(t)$`, t`$d(2t) = 2\,d(t)$`, t`$d(2t) = d(t) + d(2)$`, t`$d(2t) = d(t) + 2$`],
      answer: 0,
      why: {
        1: t`Doubling the input doubles the output only for a straight line through the origin. Here the input is squared: $(2t)^2 = 4t^2$.`,
        2: t`That treats doubling the input as adding $2$ and then splits the function over the sum — two slips at once. Substitute $2t$ for $t$.`,
        3: t`That adds $2$ to the output. $d(2t)$ changes the input.`,
      },
      hints: [t`Replace $t$ by $2t$ everywhere: $d(2t) = \tfrac12 g (2t)^2$.`],
      teach: t`$f(2t)$ means: feed in twice the input; for $t^2$ that multiplies the output by four.`,
      explain: t`$d(2t) = \tfrac12 g (2t)^2 = 4 \cdot \tfrac12 g t^2 = 4\,d(t)$. In twice the time a falling body covers four times the distance.`,
    }),
    num({
      id: 'cp-orbit-range', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([160, 200, 250, 300, 400]);
        const a = (RE + h) * 1e3, T = 2 * Math.PI * Math.sqrt(a ** 3 / GM) / 60;
        const Tsurf = 2 * Math.PI * Math.sqrt((RE * 1e3) ** 3 / GM) / 60, Talt = 2 * Math.PI * Math.sqrt((h * 1e3) ** 3 / GM) / 60;
        return {
          prompt: t`A circular orbit of radius $a$ around Earth has period $T(a) = 2\pi\sqrt{a^3/GM}$, with $GM = 3.986 \times 10^{14}\ \text{m}^3/\text{s}^2$. Mission rules require an altitude of at least $${h}$ km (lower orbits decay quickly in the thin upper atmosphere), so the physical domain is $a \ge R_E + ${h}$ km, with $R_E = 6371$ km. What is the smallest value in the range of $T$, in minutes?`,
          answer: T, units: 'min', tol: { rel: 0.005 },
          errors: [{ value: Tsurf, feedback: t`That is the period at Earth’s surface, $a = R_E$ — outside the physical domain. Add the $${h}$ km.` }, { value: Talt, feedback: t`$a$ is measured from Earth’s centre: use $a = R_E + ${h}$ km, not the altitude alone.` }],
          hints: [t`$T$ grows with $a$, so its smallest value is at the smallest allowed $a$.`, t`$a = ${RE + h}$ km $= ${nice((RE + h) / 1000)} \times 10^{6}$ m.`, t`$T = 2\pi\sqrt{a^3/GM}$ comes out in seconds; divide by $60$.`],
          teach: t`For an increasing function, the bottom of the range is the output at the bottom of the domain.`,
          explain: t`$T = 2\pi\sqrt{(${nice((RE + h) / 1000)} \times 10^{6})^3 / 3.986 \times 10^{14}} = ${nice(sig(T * 60, 4))}$ s $= ${nice(sig(T, 3))}$ min. No satellite circles Earth faster than this — the ISS, near $420$ km, takes about $93$ minutes.`,
          visual: { type: 'graph', params: { x: [5, 12], y: [0, 230], aspect: 'wide', xlabel: 'a (thousand km)', ylabel: 'T (min)', yticks: 0, curves: [{ fn: `2pi*sqrt((x*1e6)^3/${GM})/60`, color: 'ink3', dash: true, domain: [5, (RE + h) / 1000] }, { fn: `2pi*sqrt((x*1e6)^3/${GM})/60`, color: 'accent', domain: [(RE + h) / 1000, 12] }], vlines: [{ x: RE / 1000, label: 'Earth’s surface', color: 'ink3' }] }, caption: t`Period against orbit radius; the solid part is the physical domain. Period scale hidden. Circular orbits, spherical Earth.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §1.1 Functions and Function Notation', url: 'https://openstax.org/books/precalculus-2e/pages/1-1-functions-and-function-notation' },
    { label: 'OpenStax Precalculus 2e, §1.2 Domain and Range', url: 'https://openstax.org/books/precalculus-2e/pages/1-2-domain-and-range' },
    { label: 'NASA Glenn Research Center: Zero Gravity Research Facility (132 m free fall)', url: 'https://www1.grc.nasa.gov/facilities/zero-g/' },
  ],
});
