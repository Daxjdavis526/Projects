// The theory of second-order linear equations: the operator L[y] and
// superposition, the existence and uniqueness theorem (a unique solution on
// the whole interval where p, q and g are continuous), the two-dimensional
// solution space, fundamental sets and the Wronskian, Abel's formula, and the
// structure y = c₁y₁ + c₂y₂ + y_p of every solution of a forced equation.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { r6, um, co, sg, lead, powLabel } from './_second.js';

const t = String.raw;

/** t² y″ + α t y′ + β y = 0, whose solutions are tᵃ and tᵇ (α = 1 − a − b, β = ab), as TeX. */
const euler = (a, b) => t`t^2y''${sg(1 - a - b, t`t\,y'`)}${sg(a * b, 'y')} = 0`;
const powTeX = (a) => (a === 1 ? 't' : `t^{${a}}`);

/** The four sides of the parallelogram spanned by A and B, as graph curves. */
const sides = (A, B, color, width = 2) => [[[0, 0], A], [A, [A[0] + B[0], A[1] + B[1]]], [[A[0] + B[0], A[1] + B[1]], B], [B, [0, 0]]]
  .map(([p, q]) => ({ param: [`${r6(p[0])} + t*${r6(q[0] - p[0])}`, `${r6(p[1])} + t*${r6(q[1] - p[1])}`], t: [0, 1], color, width }));

export default lesson({
  id: 'math2280.DE-3.1',
  title: 'Second-order linear equations',
  minutes: 13, difficulty: 3,
  intro: t`A second-order equation is **linear** when it can be put in the standard form

$$y'' + p(t)\,y' + q(t)\,y = g(t),$$

with the coefficient of $y''$ divided out. Call the left side $L[y]$: it is a **linear operator**, so for the homogeneous equation $L[y] = 0$ sums and multiples of solutions are solutions — **superposition**. The **existence and uniqueness theorem** adds the rest: if $p$, $q$ and $g$ are continuous on an open interval containing $t_0$, then for every choice of $y(t_0)$ and $y'(t_0)$ there is exactly one solution, and it lasts across that whole interval. So the solutions of $L[y] = 0$ form a **two-dimensional space**: two independent solutions $y_1$, $y_2$ give every one as $c_1y_1 + c_2y_2$, and the **Wronskian** $W = y_1y_2' - y_1'y_2$ tells you whether a pair is independent.`,
  symbols: [
    { tex: 'y(t)', text: 'the unknown function — a displacement, a charge, a pressure amplitude' },
    { tex: 't', text: 'the independent variable: a time, or a radius in the worked example' },
    { tex: 'p(t),\\ q(t)', text: 'the coefficients once the equation is divided by the coefficient of $y\'\'$; they may vary with $t$ but never depend on $y$' },
    { tex: 'g(t)', text: 'the forcing; $g = 0$ is the **homogeneous** equation' },
    { tex: 'L[y]', text: 'the operator $y\'\' + p\\,y\' + q\\,y$: it takes a function and returns a function, and $L[c_1y_1 + c_2y_2] = c_1L[y_1] + c_2L[y_2]$' },
    { tex: 'y_1,\\ y_2', text: 'a **fundamental set**: two solutions of $L[y] = 0$, neither a constant multiple of the other' },
    { tex: 'W(t)', text: 'the Wronskian $y_1y_2\' - y_1\'y_2$, the determinant $\\begin{vmatrix} y_1 & y_2 \\\\ y_1\' & y_2\' \\end{vmatrix}$ of the system that fits $c_1$ and $c_2$ to initial data' },
  ],
  why: t`Everything later in this module stands on this: constant coefficients hand you $y_1$ and $y_2$ (DE-3.2), a forced equation then needs just one extra solution (DE-3.3), and the Wronskian is the denominator of variation of parameters (DE-3.4). The same structure — a vector space of solutions — is why quantum states superpose.`,
  visual: {
    type: 'graph',
    title: 'One starting point, one slope, one solution',
    lead: t`Every solution of $t^2y'' - 2t\,y' + 2y = 0$ is $y = c_1t + c_2t^2$ (substitute $t$ and $t^2$ to check). Choose a starting time $t_0$, a starting value $y_0$ and a starting slope $v_0$: the graph draws the one solution with that data, and the readouts give its constants and the Wronskian $W(t_0) = t_0^2$. In standard form the coefficients are $p = -2/t$ and $q = 2/t^2$.`,
    tasks: [
      t`With $t_0 = 1$, $y_0 = 1$ and $v_0 = 1$ the solution is the line $y = t$; raise $v_0$ to 2 and it becomes the parabola $y = t^2$. A value and a slope pick out one curve.`,
      t`Hold $y_0 = 1$, $v_0 = 0$ and slide $t_0$ down toward 0.1: the constants grow like $1/t_0^2$, because the system they solve has determinant $W(t_0) = t_0^2$, nearly zero.`,
      t`Whatever you choose, the curve passes through the origin: no solution has $y(0) = 1$, while infinitely many have $y(0) = y'(0) = 0$. At $t = 0$ the coefficients $-2/t$ and $2/t^2$ blow up, and the theorem promises nothing there.`,
    ],
    params: {
      x: [-1.5, 3], y: [-3, 4], aspect: 'wide', xlabel: 't', ylabel: 'y',
      sliders: [
        { key: 't0', label: 'Start time $t_0$', min: 0.1, max: 2.5, step: 0.05, value: 1, explain: 'Where the initial data are given. The coefficients $-2/t$ and $2/t^2$ are continuous for $t > 0$, so the theorem covers $(0, \\infty)$.' },
        { key: 'y0', label: 'Starting value $y_0$', min: -2, max: 3, step: 0.1, value: 1, explain: 'The value $y(t_0)$.' },
        { key: 'v0', label: 'Starting slope $v_0$', min: -3, max: 3, step: 0.1, value: 1, explain: 'The slope $y\'(t_0)$; a second-order equation needs it as well as the value.' },
      ],
      curves: [
        { fn: 'x', color: 'ink3', width: 1.3, dash: true, label: 'y₁ = t', labelAt: -1.1, labelDx: 6, labelDy: 14 },
        { fn: 'x^2', color: 'ink3', width: 1.3, dash: true, label: 'y₂ = t²', labelAt: -1.55, labelDx: 34, labelDy: -6 },
        { fn: '((2*y0 - v0*t0)/t0)*x + ((v0*t0 - y0)/t0^2)*x^2', color: 'accent', width: 2.6 },
      ],
      arrows: [{ from: ['t0', 'y0'], to: ['t0 + 0.4', 'y0 + 0.4*v0'], color: 'gold', width: 2.6 }],
      points: [{ x: 't0', y: 'y0', color: 'gold', label: 'start', labelDx: -40, labelDy: -12 }, { x: 0, y: 0, color: 'bad', r: 4 }],
      readouts: [
        { label: '$c_1$', expr: '(2*y0 - v0*t0)/t0', digits: 4 },
        { label: '$c_2$', expr: '(v0*t0 - y0)/t0^2', digits: 4 },
        { label: '$W(t_0) = t_0^2$', expr: 't0^2', digits: 4 },
      ],
    },
    caption: t`Blue: the solution with your initial data, drawn across the window because the formula $c_1t + c_2t^2$ makes sense everywhere — but the theorem vouches for it only on the side of $t = 0$ where $t_0$ sits. Dashed: the two basis solutions. Red: the origin, which every solution passes through.`,
  },
  example: {
    prompt: t`The pressure amplitude $P(r)$ of a sound wave spreading out from a small source — or the radial part of a quantum wave with no angular momentum — obeys

$$P'' + \frac{2}{r}\,P' + P = 0, \qquad r > 0,$$

with the radius $r$ measured in units of the wavelength over $2\pi$. Show that $P_1 = \dfrac{\sin r}{r}$ and $P_2 = \dfrac{\cos r}{r}$ form a fundamental set, check Abel’s formula, and find the solution with $P(\pi) = 1$ and $P'(\pi) = 0$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 12], y: [-3, 3], aspect: 'wide', xlabel: 'r', ylabel: 'P',
        curves: [
          { fn: 'sin(x)/x', domain: [0.05, 12], color: 'ink3', width: 1.4, dash: true, label: 'sin r / r', labelAt: 7.8, labelDy: -12 },
          { fn: 'cos(x)/x', domain: [0.34, 12], color: 'violet', width: 1.4, dash: true, label: 'cos r / r', labelAt: 0.5, labelDx: 8, labelDy: 0 },
          { fn: '-(sin(x) + pi*cos(x))/x', domain: [1.1, 12], color: 'accent', width: 2.6, label: 'P(r)', labelAt: 2.0, labelDx: -40, labelDy: 2 },
        ],
        points: [{ x: 'pi', y: 1, color: 'gold', label: 'P(π) = 1, P′(π) = 0', labelDx: 8, labelDy: -12 }],
      },
      caption: t`The two basis solutions (dashed) and the solution fitted to the data at $r = \pi$ (blue). Every solution except the multiples of $\sin r/r$ blows up at the source, $r = 0$, where the coefficient $2/r$ is undefined.`,
    },
    steps: [
      { label: 'Standard form', text: t`The equation is already in standard form, with $p(r) = 2/r$, $q(r) = 1$ and $g = 0$. Both coefficients are continuous on $(0, \infty)$, so any initial-value problem posed at an $r_0 > 0$ has exactly one solution, valid on all of $(0, \infty)$.` },
      { label: 'Check the solutions', text: t`Write $P = u/r$. Then $P' = u'/r - u/r^2$ and $P'' = u''/r - 2u'/r^2 + 2u/r^3$, so $P'' + \tfrac{2}{r}P' = u''/r$ and the equation becomes $(u'' + u)/r = 0$. Both $u = \sin r$ and $u = \cos r$ satisfy $u'' + u = 0$ ✓.` },
      { label: 'Wronskian', text: t`With $P_1' = \dfrac{\cos r}{r} - \dfrac{\sin r}{r^2}$ and $P_2' = -\dfrac{\sin r}{r} - \dfrac{\cos r}{r^2}$, the terms in $\sin r\cos r/r^3$ cancel and $W = P_1P_2' - P_1'P_2 = -\dfrac{\sin^2 r + \cos^2 r}{r^2} = -\dfrac{1}{r^2}$. It never vanishes on $(0, \infty)$, so $P_1$, $P_2$ is a fundamental set.` },
      { label: 'Abel’s formula', text: t`For any two solutions, $W' = -p\,W$ (differentiate $W$ and use the equation), so $W = C\,e^{-\int p\,dr} = C\,e^{-2\ln r} = C/r^2$ — the same shape, found without solving anything. Here $C = -1$.` },
      { label: 'Fit the data', text: t`At $r = \pi$: $P_1 = 0$, $P_2 = -1/\pi$, $P_1' = -1/\pi$ and $P_2' = 1/\pi^2$. So $-c_2/\pi = 1$ and $-c_1/\pi + c_2/\pi^2 = 0$, giving $c_2 = -\pi$ and $c_1 = -1$. The determinant of this system is $W(\pi) = -1/\pi^2 \neq 0$ — that is why the answer exists and is unique.` },
      { label: 'Sense check', text: t`$P = -\dfrac{\sin r + \pi\cos r}{r}$ gives $P(\pi) = -(0 - \pi)/\pi = 1$ ✓. Near $r = 0$ it blows up like $-\pi/r$, because it contains $\cos r/r$; only multiples of $\sin r/r$ stay finite at the source. The theorem made no promise at $r = 0$.` },
    ],
    answer: t`$P = -\dfrac{\sin r + \pi\cos r}{r}$, with $W = -1/r^2$, just as Abel’s formula $C/r^2$ predicts.`,
  },
  practice: [
    multi({
      id: 'forced-structure', difficulty: 2,
      prompt: t`$y_1 = \cos t$ and $y_2 = \sin t$ solve $y'' + y = 0$, and $y_p = t$ solves $y'' + y = t$. Which of these also solve $y'' + y = t$? Select all that do.`,
      choices: [t`$t + 5\cos t$`, t`$t + 2\cos t - 3\sin t$`, t`$2t$`, t`$\cos t + \sin t$`, t`$t\cos t$`],
      answer: [0, 1],
      why: {
        2: t`$L[2t] = 2t$: doubling a solution of the forced equation doubles the forcing too. Only solutions of the homogeneous equation may be added or scaled freely.`,
        3: t`$L[\cos t + \sin t] = 0$: this solves the homogeneous equation, not the forced one. A solution of $L[y] = t$ must contain a particular solution such as $t$.`,
        4: t`Multiplying a solution by $t$ does not give a solution: $L[t\cos t] = -2\sin t$.`,
      },
      hints: [t`Use linearity: $L[t + c_1\cos t + c_2\sin t] = L[t] + c_1L[\cos t] + c_2L[\sin t]$.`, 'A solution of the forced equation is one particular solution plus any solution of the homogeneous one.'],
      teach: 'Every solution of a forced linear equation is one particular solution plus a solution of the homogeneous equation, and any two of them differ by a homogeneous solution.',
      explain: t`$L[t + c_1\cos t + c_2\sin t] = t + 0 + 0 = t$ for every $c_1$, $c_2$ — so the first two work, and these are *all* the solutions. $2t$ gives $L = 2t$, $\cos t + \sin t$ gives $L = 0$, and $t\cos t$ gives $-2\sin t$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 10], y: [-4, 14], aspect: 'wide', xlabel: 't', ylabel: 'y',
          curves: [
            { fn: 'x', color: 'gold', width: 2.6, label: 'yₚ = t', labelAt: 8.6, labelDx: -10, labelDy: -14 },
            { fn: 'x + 2*cos(x) - 3*sin(x)', color: 'accent', width: 2 },
            { fn: 'x + 5*cos(x)', color: 'violet', width: 2 },
          ],
        },
        caption: t`Three solutions of $y'' + y = t$: the particular solution $t$ (gold) and two others that wobble around it. The wobbles — their differences from $t$ — solve $y'' + y = 0$.`,
      },
    }),
    num({
      id: 'wronskian-powers', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, -2], [2, -1], [1, 3], [-1, 3], [2, 3]]);
        const t0 = r.pick([2, 3]);
        const W = (b - a) * t0 ** (a + b - 1);
        const errors = [{ value: (a + b) * t0 ** (a + b - 1), feedback: t`That is $y_1y_2' + y_1'y_2$. The Wronskian *subtracts*: $W = y_1y_2' - y_1'y_2$.` }]
          .filter((e) => Math.abs(e.value - W) > 1e-9 && Math.abs(e.value + W) > 1e-9);
        return {
          prompt: t`For $t > 0$, both $y_1 = ${powTeX(a)}$ and $y_2 = ${powTeX(b)}$ solve $${euler(a, b)}$. What is their Wronskian at $t = ${t0}$?`,
          answer: W, tol: { rel: 1e-6 },
          errors,
          hints: [t`$W = y_1y_2' - y_1'y_2$. Differentiate each power with the power rule.`, t`$W = ${powTeX(a)}\cdot ${b}t^{${b - 1}} - ${a}t^{${a - 1}}\cdot ${powTeX(b)} = (${b} - (${a}))\,t^{${a + b - 1}}$.`],
          teach: 'For two powers, W[tᵃ, tᵇ] = (b − a)tᵃ⁺ᵇ⁻¹: never zero for t > 0 when a ≠ b, so the pair is a fundamental set there.',
          explain: t`$W = (b - a)\,t^{a + b - 1} = ${b - a}\cdot ${t0}^{${a + b - 1}} = ${nice(W)}$. Abel agrees: $p = ${1 - a - b}/t$, so $W = C\,e^{-\int p\,dt} = C\,t^{${a + b - 1}}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3.4], y: [-0.5, 5], aspect: 'wide', xlabel: 't', ylabel: 'y',
              curves: [
                { fn: `x^(${a})`, domain: [0.05, 3.4], color: 'accent', label: powLabel(a), labelAt: a > 0 ? 2.1 : 0.55, labelDx: 8, labelDy: a > 0 ? 6 : -10 },
                { fn: `x^(${b})`, domain: [0.05, 3.4], color: 'violet', label: powLabel(b), labelAt: b > 0 ? 1.3 : 0.6, labelDx: b > 0 ? -28 : 10, labelDy: b > 0 ? -10 : 2 },
              ],
              vlines: [{ x: t0, label: `t = ${t0}`, color: 'gold' }],
            },
            caption: t`The two solutions for $t > 0$. Neither is a constant multiple of the other — the Wronskian measures that.`,
          },
        };
      },
    }),
    mcq({
      id: 'interval', difficulty: 2,
      gen(r) {
        const V = r.pick([
          {
            eq: t`(t - 3)\,y'' + (\ln t)\,y' + y = 0`, ivp: t`y(1) = 2,\ y'(1) = 0`,
            choices: [t`$(0, 3)$`, t`$(0, \infty)$`, t`$(-\infty, 3)$`, t`$(1, 3)$`],
            why: { 1: t`Standard form divides by $t - 3$, so both coefficients blow up at $t = 3$.`, 2: t`$\ln t$ is undefined for $t \le 0$, so the interval cannot reach past 0.`, 3: t`The interval runs both ways from $t_0 = 1$, as far as everything stays continuous.` },
            explain: t`Standard form: $y'' + \dfrac{\ln t}{t - 3}\,y' + \dfrac{1}{t - 3}\,y = 0$. Both coefficients are continuous for $t > 0$, $t \neq 3$; the piece containing $t_0 = 1$ is $(0, 3)$.`,
            curves: [{ fn: 'x - 3', color: 'accent', label: 't − 3 (multiplies y″)', labelAt: 4.2, labelDx: -10, labelDy: -14 }, { fn: 'ln(x)', domain: [0.02, 6], color: 'violet', label: 'ln t', labelAt: 5.2, labelDy: -10 }],
            t0: 1, x: [-2, 6],
          },
          {
            eq: t`(t^2 - 4)\,y'' + t\,y' + y = \sqrt{t}`, ivp: t`y(1) = 0,\ y'(1) = 1`,
            choices: [t`$(0, 2)$`, t`$(-2, 2)$`, t`$(0, \infty)$`, t`$(1, 2)$`],
            why: { 1: t`The forcing $\sqrt t$ is undefined for $t < 0$ — $g$ must be continuous too.`, 2: t`Standard form divides by $t^2 - 4$, so every coefficient blows up at $t = \pm2$.`, 3: t`The interval extends to the left of $t_0 = 1$ as well, until $\sqrt t$ fails at 0.` },
            explain: t`Standard form: $y'' + \dfrac{t}{t^2 - 4}\,y' + \dfrac{1}{t^2 - 4}\,y = \dfrac{\sqrt t}{t^2 - 4}$. Everything is continuous for $t > 0$, $t \neq 2$; the piece containing $t_0 = 1$ is $(0, 2)$.`,
            curves: [{ fn: 'x^2 - 4', color: 'accent', label: 't² − 4 (multiplies y″)', labelAt: 2.45, labelDx: 10, labelDy: 6 }, { fn: 'sqrt(x)', domain: [0, 4], color: 'violet', label: '√t', labelAt: 3.4, labelDy: -10 }],
            t0: 1, x: [-4, 4],
          },
          {
            eq: t`(\cos t)\,y'' + y' + t\,y = 0`, ivp: t`y(0) = 1,\ y'(0) = -1`,
            choices: [t`$(-\pi/2, \pi/2)$`, t`$(-\infty, \infty)$`, t`$(0, \pi/2)$`, t`$(-\pi, \pi)$`],
            why: { 1: t`Standard form divides by $\cos t$, which vanishes at $t = \pm\pi/2$.`, 2: t`The guarantee runs to the left of $t_0 = 0$ too.`, 3: t`$\cos t$ first vanishes at $\pm\pi/2$, before reaching $\pm\pi$.` },
            explain: t`Standard form: $y'' + \sec t\;y' + t\sec t\;y = 0$. The coefficients are continuous wherever $\cos t \neq 0$; the piece containing $t_0 = 0$ is $(-\pi/2, \pi/2)$.`,
            curves: [{ fn: 'cos(x)', color: 'accent', label: 'cos t (multiplies y″)', labelAt: 0.3, labelDx: 6, labelDy: -12 }],
            t0: 0, x: [-4.5, 4.5],
          },
        ]);
        return {
          prompt: t`On what interval does the existence and uniqueness theorem guarantee a unique solution of $${V.eq}$ with $${V.ivp}$?`,
          choices: V.choices, answer: 0, why: V.why,
          hints: [t`Divide by the coefficient of $y''$ to reach standard form, then find where $p$, $q$ and $g$ are all continuous.`, t`Of the intervals where everything is continuous, take the one that contains $t_0$ — it reaches both ways from $t_0$.`],
          teach: 'For a linear equation the theorem guarantees a unique solution on the whole open interval around t₀ where p, q and g are continuous — and promises nothing beyond it.',
          explain: t`${V.explain} The theorem guarantees a unique solution on all of that interval; beyond its ends it promises nothing.`,
          visual: {
            type: 'graph',
            params: {
              x: V.x, y: [-4, 4], aspect: 'wide', xlabel: 't', ylabel: '',
              curves: V.curves,
              points: [{ x: V.t0, y: 0, color: 'gold', label: `t₀ = ${V.t0}`, labelDx: 6, labelDy: 14 }],
            },
            caption: 'The coefficient functions as the equation is written, before dividing through. Where the coefficient of y″ is zero, standard form divides by zero.',
          },
        };
      },
    }),
    num({
      id: 'abel-damped', difficulty: 3,
      gen(r) {
        const m = r.pick([0.5, 1, 2]), bm = r.pick([0.1, 0.2, 0.3, 0.4]), k = r.pick([4, 8, 9]) * m;
        const b = +(bm * m).toFixed(3), T = r.pick([3, 5, 8]);
        const ratio = Math.exp(-bm * T);
        // the picture: the solutions from (1, 0) and (0, ω₀), in the plane (x, x′/ω₀), at t = 0 and t = 1 s
        const g = bm / 2, w0 = Math.sqrt(k / m), wd = Math.sqrt(w0 * w0 - g * g), t1 = 1;
        const e = Math.exp(-g * t1), s = Math.sin(wd * t1), c = Math.cos(wd * t1);
        const A = [e * (c + (g / wd) * s), -(w0 / wd) * e * s], B = [(w0 / wd) * e * s, e * (c - (g / wd) * s)];
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${nice(k)}$ N/m is damped by a dashpot with $b = ${b}$ kg/s, so $m\,x'' + b\,x' + k\,x = 0$. Without solving it: by what factor does the Wronskian of any two of its solutions shrink between $t = 0$ and $t = ${T}$ s? (Give $W(${T})/W(0)$.)`,
          answer: ratio, tol: { rel: 0.005 },
          errors: [
            { value: Math.exp(-bm * T / 2), feedback: t`$e^{-bt/2m}$ is how an *amplitude* decays. Abel’s formula uses $p = b/m$ itself: $W = W(0)\,e^{-bt/m}$.` },
            { value: Math.exp(-b * T), feedback: t`Divide by $m$ first: in standard form $p = b/m$, not $b$.` },
          ].filter((x) => Math.abs(x.value - ratio) > 0.01 * ratio),
          hints: [t`Standard form: $x'' + \dfrac{b}{m}x' + \dfrac{k}{m}x = 0$, so $p = b/m$.`, t`Abel’s formula: $W(t) = W(0)\,e^{-\int_0^t p\,ds} = W(0)\,e^{-bt/m}$ — the spring constant never enters.`],
          teach: 'Abel’s formula W(t) = W(t₀) e^(−∫p dt) gives the Wronskian without solving — for a damped oscillator it shrinks like e^(−bt/m).',
          explain: t`$p = b/m = ${nice(bm)}$ s⁻¹, so $W(${T})/W(0) = e^{-${nice(bm)}\times${T}} = ${fmt(ratio, 3)}$, whatever the two solutions and whatever $k$. The Wronskian is the area of the parallelogram spanned by the two solutions’ vectors $(x, x')$; each side shrinks like $e^{-bt/2m}$, so the area shrinks like their product.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.4, 1.6], y: [-1.25, 1.35], equal: true, aspect: 'wide', xlabel: 'x', ylabel: 'x′ / ω₀', xticks: 0, yticks: 0,
              curves: [...sides([1, 0], [0, 1], 'ink3', 1.4), ...sides(A, B, 'accent', 2)],
              arrows: [
                { from: [0, 0], to: A, color: 'accent', width: 2.2 }, { from: [0, 0], to: B, color: 'violet', width: 2.2 },
              ],
              points: [{ x: 1, y: 1, r: 3, color: 'ink3', label: 't = 0', labelDx: 6, labelDy: -6 }, { x: r6(A[0] + B[0]), y: r6(A[1] + B[1]), r: 3, color: 'accent', label: 't = 1 s', labelDx: 6, labelDy: 12 }],
            },
            caption: t`Two solutions as vectors $(x, x'/\omega_0)$: at $t = 0$ they span the grey square; one second later (blue and violet arrows) they have turned and shrunk, and so has the area between them — the Wronskian, up to a constant factor. Drawn to scale, no numbers.`,
          },
        };
      },
    }),
    expr({
      id: 'euler-ivp', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[1, -2], [2, -1], [1, 3]]);
        const c1 = r.pick([1, 2, 3, -1]), c2 = r.pick([1, -1, 2, -2]);
        const y0 = c1 + c2, v0 = a * c1 + b * c2;
        const ans = `${c1}*t^(${a}) + (${c2})*t^(${b})`;
        const errors = c1 !== c2 ? [{ answer: `${c2}*t^(${a}) + (${c1})*t^(${b})`, feedback: t`The constants are swapped. Solve $c_1 + c_2 = ${y0}$ and $${a}c_1 + (${b})c_2 = ${v0}$ again.` }] : [];
        errors.push({ answer: `${y0}*t^(${a}) + (${v0})*t^(${b})`, feedback: t`At $t = 1$ both basis solutions equal 1, so $y(1) = c_1 + c_2$ — but the slope is $y'(1) = ${a}c_1 + (${b})c_2$, not $c_2$. Solve the two equations together.` });
        const ylo = Math.min(-1, y0 - 3), yhi = Math.max(3, y0 + 3), dx = Math.min(0.3, 1.2 / Math.abs(v0 || 1));
        return {
          prompt: t`For $t > 0$ the equation $${euler(a, b)}$ has the fundamental set $y_1 = ${powTeX(a)}$, $y_2 = ${powTeX(b)}$. Solve it with $y(1) = ${y0}$ and $y'(1) = ${v0}$.`,
          answer: ans, answerTeX: t`${lead(c1, powTeX(a))}${sg(c2, powTeX(b))}`, lhs: 'y(t)',
          vars: { t: [0.5, 3] },
          errors,
          hints: [t`Write $y = c_1${powTeX(a)} + c_2${powTeX(b)}$; at $t = 1$ both powers equal 1.`, t`$y(1) = c_1 + c_2 = ${y0}$ and $y'(1) = ${a}c_1 + (${b})c_2 = ${v0}$.`],
          teach: 'With a fundamental set in hand, an initial-value problem is two linear equations for c₁ and c₂ — solvable because their determinant is the Wronskian, which is not zero.',
          explain: t`From $c_1 + c_2 = ${y0}$ and $${a}c_1 + (${b})c_2 = ${v0}$: $c_1 = ${c1}$, $c_2 = ${c2}$. So $y = ${lead(c1, powTeX(a))}${sg(c2, powTeX(b))}$. The determinant of that system is $W(1) = ${b - a} \neq 0$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0.2, 2.8], y: [ylo, yhi], aspect: 'wide', xlabel: 't', ylabel: 'y',
              curves: [
                { fn: `x^(${a})`, color: 'ink3', width: 1.3, dash: true, label: powLabel(a), labelAt: 2.4, labelDx: 6, labelDy: 2 },
                { fn: `x^(${b})`, color: 'ink3', width: 1.3, dash: true, label: powLabel(b), labelAt: b > 0 ? 1.45 : 0.45, labelDx: 8, labelDy: b > 0 ? -4 : -8 },
              ],
              arrows: [{ from: [1, y0], to: [r6(1 + dx), r6(y0 + dx * v0)], color: 'gold', width: 2.6 }],
              points: [{ x: 1, y: y0, color: 'gold', label: `y(1) = ${um(y0)}, y′(1) = ${um(v0)}`, labelDx: -30, labelDy: v0 > 0 ? 18 : -14 }],
            },
            caption: 'The initial data at t = 1 (gold) and the two basis solutions (dashed). The answer is the one combination of them that starts with this value and this slope.',
          },
        };
      },
    }),
    mcq({
      id: 'dependent-pair', difficulty: 2, kind: 'error',
      prompt: t`A student solving $y'' - y = 0$ notices that $y_1 = e^t$ and $y_2 = 3e^t$ are both solutions and writes the general solution as $y = c_1e^t + 3c_2e^t$. What is wrong?`,
      choices: [
        t`$W = e^t\cdot3e^t - e^t\cdot3e^t = 0$: the two are multiples of each other, so their combinations miss solutions such as $e^{-t}$`,
        'Nothing: any two solutions of a second-order linear equation form a fundamental set',
        t`The equation itself is the problem: $y'' - y = 0$ has only one independent solution, $e^t$`,
        t`The constants must multiply, not add: $y = (c_1e^t)(3c_2e^t)$`,
      ],
      answer: 0,
      why: {
        1: t`Only two *independent* solutions do — two whose Wronskian is not zero. A solution and its own multiple are not independent.`,
        2: t`$e^{-t}$ solves it too: $(e^{-t})'' = e^{-t}$. Every second-order linear equation has two independent solutions.`,
        3: t`A product of solutions is not a solution of a linear equation; superposition is about sums.`,
      },
      hints: [t`Compute $W[e^t, 3e^t]$.`, t`Try to meet $y(0) = 1$, $y'(0) = -1$ with $c_1e^t + 3c_2e^t$: what is the slope of any multiple of $e^t$ at $t = 0$?`],
      teach: 'Two solutions span the solution space only if they are independent — and for solutions that means W ≠ 0.',
      explain: t`$c_1e^t + 3c_2e^t = (c_1 + 3c_2)e^t$ is just one constant times $e^t$: a one-dimensional family. It cannot meet $y(0) = 1$, $y'(0) = -1$, whose solution is $e^{-t}$. A fundamental set is $e^t$, $e^{-t}$, with $W = -2 \neq 0$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.5, 1.5], y: [-0.5, 5], aspect: 'wide', xlabel: 't', ylabel: 'y',
          curves: [
            { fn: 'e^x', color: 'accent', label: 'eᵗ', labelAt: 1.1, labelDx: 8, labelDy: 6 },
            { fn: '3*e^x', color: 'violet', label: '3eᵗ', labelAt: 0.35, labelDx: 8, labelDy: 6 },
            { fn: 'e^(-x)', color: 'ink3', width: 1.3, dash: true, label: 'e⁻ᵗ', labelAt: -1.2, labelDx: 8, labelDy: 0 },
          ],
          arrows: [{ from: [0, 1], to: [0.45, 0.55], color: 'gold', width: 2.6 }],
          points: [{ x: 0, y: 1, color: 'gold', label: 'y(0) = 1, y′(0) = −1', labelDx: -150, labelDy: 22 }],
        },
        caption: t`Every combination of $e^t$ and $3e^t$ is a multiple of $e^t$, whose slope always equals its value — so none can start at 1 heading down with slope $-1$. The solution that does is $e^{-t}$ (dashed).`,
      },
    }),
    expr({
      id: 'second-solution', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, -1]);
        const y1 = powTeX(a);
        return {
          prompt: t`For $t > 0$, $y_1 = ${y1}$ solves $${euler(a, a)}$, but the second power you would try is the same one: the indicial root is repeated. Abel’s formula gives the Wronskian of $y_1$ and any second solution as $W = C\,t^{${2 * a - 1}}$. Using $\left(\dfrac{y_2}{y_1}\right)' = \dfrac{W}{y_1^2}$ with $C = 1$, find the second solution $y_2$ with $y_2(1) = 0$.`,
          answer: `t^(${a})*ln(t)`, answerTeX: t`${a === 1 ? 't' : `t^{${a}}`}\ln t`, lhs: 'y_2(t)',
          vars: { t: [0.5, 3] },
          errors: [
            { answer: 'ln(t)', feedback: t`That is $y_2/y_1$. Multiply back by $y_1 = ${y1}$.` },
            { answer: `t^(${a})`, feedback: t`That is $y_1$ itself — not independent of it. Integrate $W/y_1^2$ to find the ratio $y_2/y_1$.` },
          ],
          hints: [t`$\dfrac{W}{y_1^2} = \dfrac{t^{${2 * a - 1}}}{t^{${2 * a}}} = \dfrac{1}{t}$.`, t`So $y_2/y_1 = \ln t + K$, and $y_2(1) = 0$ makes $K = 0$.`],
          teach: 'Knowing one solution, the Wronskian from Abel’s formula hands you the second: (y₂/y₁)′ = W/y₁² (reduction of order).',
          explain: t`$(y_2/y_1)' = 1/t$, so $y_2/y_1 = \ln t$ and $y_2 = ${y1}\ln t$. Check: $W = y_1^2\,(y_2/y_1)' = t^{${2 * a}}\cdot\tfrac1t = t^{${2 * a - 1}}$ ✓, never zero for $t > 0$. This is where the $\ln t$ of a repeated root comes from — the same reasoning gives $t\,e^{rt}$ for a repeated root of a constant-coefficient equation.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3.2], y: [-0.3, 3], aspect: 'wide', xlabel: 't', ylabel: '',
              curves: [{ fn: '1/x', domain: [0.3, 3.2], color: 'accent', label: 'W / y₁² = 1/t', labelAt: 0.55, labelDx: 10, labelDy: 0 }],
              shade: [{ fn: '1/x', from: 1, to: 2.5, color: 'gold', alpha: 0.3 }],
              vlines: [{ x: 1, label: 't = 1' }],
            },
            caption: t`The derivative of $y_2/y_1$: the ratio grows by the shaded area under $1/t$ between 1 and $t$.`,
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-wronskian', difficulty: 2,
      gen(r) {
        const al = r.pick([0.5, 1]), be = r.pick([2, 3, 4]);
        const W = be * Math.exp(-2 * al);
        return {
          prompt: t`$y_1 = e^{-${al === 1 ? '' : al}t}\cos ${be}t$ and $y_2 = e^{-${al === 1 ? '' : al}t}\sin ${be}t$ solve $y'' + ${nice(2 * al)}\,y' + ${nice(al * al + be * be)}\,y = 0$. What is their Wronskian at $t = 1$?`,
          answer: W, tol: { rel: 0.005 },
          errors: [
            { value: be * Math.exp(-al), feedback: t`Each solution carries $e^{-${al}t}$, so the Wronskian — a product of two of them — carries $e^{-${nice(2 * al)}t}$.` },
            { value: Math.exp(-2 * al), feedback: t`Differentiating $\sin ${be}t$ and $\cos ${be}t$ brings out a factor ${be}: $W = ${be}\,e^{-${nice(2 * al)}t}$.` },
          ],
          hints: [t`Factor out the exponentials: $W = e^{-${nice(2 * al)}t}\,W[\cos ${be}t, \sin ${be}t]$ — the cross terms with $-${al}$ cancel.`, t`$W[\cos ${be}t, \sin ${be}t] = ${be}(\cos^2 + \sin^2) = ${be}$.`],
          teach: 'Multiplying both solutions by the same factor f multiplies their Wronskian by f².',
          explain: t`$W = ${be}\,e^{-${nice(2 * al)}t}$, so $W(1) = ${be}e^{-${nice(2 * al)}} = ${fmt(W, 3)}$. Abel: $p = ${nice(2 * al)}$ gives $W = C\,e^{-${nice(2 * al)}t}$ ✓.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3], y: [-1.1, 1.1], aspect: 'wide', xlabel: 't', ylabel: 'y',
              curves: [
                { fn: `exp(-${al}*x)*cos(${be}*x)`, color: 'accent', label: 'y₁', labelAt: 0.12, labelDx: 6, labelDy: -6 },
                { fn: `exp(-${al}*x)*sin(${be}*x)`, color: 'violet', label: 'y₂', labelAt: 0.3, labelDx: 2, labelDy: -10 },
              ],
              vlines: [{ x: 1, label: 't = 1', color: 'gold' }],
            },
            caption: 'The two solutions: decaying oscillations a quarter cycle apart.',
          },
        };
      },
    }),
    mcq({
      id: 'cp-tangent', difficulty: 3,
      prompt: t`Two different solutions of the same equation $y'' + p(t)\,y' + q(t)\,y = 0$, with $p$ and $q$ continuous for all $t$, are sketched touching at $t = 2$ with a common slope. Is that possible?`,
      choices: [
        t`No: at $t = 2$ they share $y$ and $y'$, so by uniqueness they are the same solution everywhere`,
        t`No — and for the same reason no two different solutions can even cross`,
        t`Yes: uniqueness fixes only $y(t_0)$, so two solutions may share a point and a slope`,
        t`Yes, provided $p$ and $q$ are not constants`,
      ],
      answer: 0,
      why: {
        1: t`Crossing is allowed: two solutions may share $y(2)$ with *different* slopes. A second-order equation needs both $y$ and $y'$ to pin a solution down.`,
        2: t`For a second-order equation the initial data are $y(t_0)$ **and** $y'(t_0)$, and the theorem says those two numbers determine the solution.`,
        3: 'The theorem holds for any continuous coefficients, constant or not.',
      },
      hints: [t`What initial data does the theorem need for a second-order equation?`, t`At the touching point both curves have the same $y(2)$ and the same $y'(2)$.`],
      teach: 'Solutions of a second-order linear equation may cross, but they can never touch with a common slope unless they are the same solution.',
      explain: t`Both curves solve the initial-value problem with the same $y(2)$ and $y'(2)$, so by uniqueness they coincide on the whole line. Crossing with different slopes is fine — unlike the curves of a first-order equation, which can never meet at all.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [-0.5, 2.5], aspect: 'wide', xlabel: 't', ylabel: 'y',
          curves: [
            { fn: '1 + 0.5*(x - 2) + 0.3*(x - 2)^2', color: 'accent', label: 'one', labelAt: 3.2, labelDx: -40, labelDy: -8 },
            { fn: '1 + 0.5*(x - 2) - 0.4*(x - 2)^2', color: 'violet', label: 'other', labelAt: 3.6, labelDx: 6, labelDy: 4 },
          ],
          points: [{ x: 2, y: 1, color: 'gold', r: 4 }],
        },
        caption: 'A sketch: two curves that meet at t = 2 with the same slope. Could both solve one linear equation with continuous coefficients?',
      },
    }),
    num({
      id: 'cp-lox-line', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([2, 2.5, 3]), ratio = r.pick([2, 2.5]), b = +(a * ratio).toFixed(2);
        const rm = +(a * r.pick([1.4, 1.5])).toFixed(2), Tin = 90, Tout = r.pick([290, 295, 300]);
        const T = Tin + ((Tout - Tin) * Math.log(rm / a)) / Math.log(b / a);
        const lin = Tin + ((Tout - Tin) * (rm - a)) / (b - a);
        return {
          prompt: t`A liquid-oxygen feed line of outer radius ${a} cm is wrapped in foam out to a radius of ${b} cm. In steady state the temperature in the foam obeys $r\,T'' + T' = 0$ (heat conducted radially, none generated). Check that $1$ and $\ln r$ are solutions with a nonzero Wronskian, then find the temperature at $r = ${rm}$ cm if the pipe wall is at ${Tin} K and the outer surface at ${Tout} K.`,
          answer: T, units: 'K', tol: { rel: 0.003 },
          errors: [{ value: lin, feedback: 'That interpolates linearly in r. Heat spreads through ever larger circles, so the temperature varies like ln r: steep near the pipe, flatter outside.' }],
          hints: [t`$T = c_1 + c_2\ln r$; $W[1, \ln r] = 1/r \neq 0$, so this is the general solution.`, t`$T(${a}) = ${Tin}$ and $T(${b}) = ${Tout}$ give $c_2 = \dfrac{${Tout} - ${Tin}}{\ln(${b}/${a})}$; then $T(r) = ${Tin} + c_2\ln(r/${a})$.`],
          teach: 'Two independent solutions and two conditions: the general solution c₁y₁ + c₂y₂ is fitted by solving for its two constants.',
          explain: t`$(1)' = 0$ and $r(\ln r)'' + (\ln r)' = -1/r + 1/r = 0$ ✓, with $W = 1\cdot\tfrac1r - 0 = 1/r$. Then $T = ${Tin} + (${Tout} - ${Tin})\,\dfrac{\ln(${rm}/${a})}{\ln(${b}/${a})} = ${fmt(T, 4)}$ K — warmer than the straight-line guess of ${fmt(lin, 4)} K, because most of the temperature drop sits in the thin inner layers.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.25 * b, 1.6 * b], y: [-1.1 * b, 1.1 * b], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [
                { param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, '2*pi'], color: 'accent', width: 3 },
                { param: [`${b}*cos(t)`, `${b}*sin(t)`], t: [0, '2*pi'], color: 'warn', width: 2.4 },
                { param: [`${rm}*cos(t)`, `${rm}*sin(t)`], t: [0, '2*pi'], color: 'gold', width: 1.6, dash: true },
              ],
              arrows: [{ from: [0, 0], to: [r6(rm * 0.8), r6(rm * 0.6)], color: 'gold', width: 1.8, label: 'r = ?', labelDx: 4, labelDy: -4 }],
              points: [
                { x: 0, y: 0, r: 0.01, color: 'accent', label: 'LOX, 90 K', labelDx: -28, labelDy: 20 },
                { x: r6(b), y: 0, r: 0.01, color: 'warn', label: `${Tout} K outside`, labelDx: 8, labelDy: 4 },
              ],
            },
            caption: 'Cross-section of the line: the pipe wall (blue), the foam’s outer surface (orange) and the radius asked about (gold, dashed). To scale. Constant conductivity is assumed; real foam conducts less when it is cold.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §2.1 Second-order linear ODEs', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax Calculus Vol. 3, §7.1 Second-order linear equations', url: 'https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations' },
  ],
});
