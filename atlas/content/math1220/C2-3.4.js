// First-order linear equations and the integrating factor.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

export default lesson({
  id: 'math1220.C2-3.4',
  title: 'First-order linear equations',
  minutes: 12, difficulty: 3,
  intro: t`A first-order equation is **linear** when $y$ and $y'$ appear only to the first power, multiplied by functions of $t$. Put it in standard form and multiply through by the **integrating factor** $\mu$:

$$\frac{dy}{dt} + p(t)\,y = q(t), \qquad \mu(t) = e^{\int p(t)\,dt}$$

The left side then becomes the derivative of a single product, $(\mu y)' = \mu\,q$, and one integration finishes the job. RC and RL circuits, mixing tanks, cooling in a changing room and falling with linear drag are all linear — and the method works even when the equation is not separable.`,
  symbols: [
    { tex: t`y(t)`, text: 'the unknown function (a voltage, a temperature, an amount of salt)' },
    { tex: t`p(t)`, text: t`the coefficient of $y$ once the equation is in standard form (the $y'$ term has coefficient 1); for a circuit it is $1/\tau$, in $\text{s}^{-1}$` },
    { tex: t`q(t)`, text: 'the **source** or forcing term: whatever drives $y$ from outside (a battery, an inflow, the room temperature)' },
    { tex: t`\mu(t)`, text: t`the **integrating factor** $e^{\int p\,dt}$; any antiderivative of $p$ will do, so take the constant as 0` },
    { tex: t`(\mu y)' = \mu q`, text: t`the product rule run backwards: $(\mu y)' = \mu y' + \mu' y$ and $\mu' = p\,\mu$` },
  ],
  why: t`Linear equations obey superposition — solution = transient + steady state — which is the idea behind every circuit, filter and driven oscillator you will meet in physics and engineering.`,
  visual: {
    type: 'phase',
    title: 'A circuit forgets where it started',
    lead: t`A resistor–capacitor circuit driven by an alternating source obeys $\dfrac{dy}{dt} + \dfrac{1}{\tau}\,y = \dfrac{\sin\omega t}{\tau}$: linear, with $p = 1/\tau$ and $q = \sin(\omega t)/\tau$. Its solution is a **transient** $Ce^{-t/\tau}$ that dies away plus a **steady state** that does not depend on the start.`,
    tasks: [
      'Drag the start point anywhere: after a few τ every solution merges onto the same wave.',
      'Raise ω: the steady-state wave shrinks and lags behind the source. Fast signals are filtered out — a low-pass filter.',
      'Raise τ: the transient lasts longer before the circuit settles.',
    ],
    params: {
      slope: true, f: '(sin(w*t) - y)/tau', x: [0, 12], y: [-1.6, 1.6], start: [0, 1.4], h: 0.25,
      sliders: [
        { key: 'tau', label: 'Time constant $\\tau = RC$', min: 0.5, max: 3, step: 0.1, value: 1, unit: t`\text{s}`, explain: 'Resistance times capacitance: how long the circuit takes to respond.' },
        { key: 'w', label: 'Source frequency $\\omega$', min: 0.5, max: 6, step: 0.1, value: 1.5, unit: t`\text{rad/s}`, explain: 'How fast the source voltage alternates.' },
      ],
    },
    caption: t`$y$ is the capacitor voltage as a fraction of the source amplitude; $t$ in seconds. The steady state has amplitude $1/\sqrt{1 + (\omega\tau)^2}$ and lags the source by $\arctan(\omega\tau)$. Ideal resistor and capacitor; blue is an accurate solution, orange Euler’s method with step $h$.`,
  },
  example: {
    prompt: t`Solve $t\,y' + 2y = 4t^2$ for $t > 0$, with $y(1) = 3$.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 3], y: [0, 12], xlabel: 't', ylabel: 'y',
        curves: [
          ...[-1, 0, 6].map((C) => ({ fn: `x^2 + (${C})/x^2`, color: 'ink3', dash: true, width: 1.4 })),
          { fn: 'x^2 + 2/x^2', color: 'gold', label: 'y = t² + 2/t²', labelAt: 2.1 },
        ],
        points: [{ x: 1, y: 3, color: 'gold', label: '(1, 3)' }],
      },
      caption: t`Grey: other members of the family $y = t^2 + C/t^2$. Each blows up as $t \to 0^+$ unless $C = 0$; the initial condition picks the gold one.`,
    },
    steps: [
      { label: 'Standard form', text: t`Divide by $t$ so that $y'$ stands alone: $\;y' + \dfrac{2}{t}\,y = 4t$. So $p(t) = \dfrac2t$ and $q(t) = 4t$.` },
      { label: 'Integrating factor', text: t`$\mu = e^{\int (2/t)\,dt} = e^{2\ln t} = t^2$ (for $t > 0$).` },
      { label: 'Multiply through', text: t`$t^2y' + 2t\,y = 4t^3$. The left side is exactly $(t^2 y)'$ by the product rule — that is what $\mu$ was built to do.` },
      { label: 'Integrate', text: t`$(t^2y)' = 4t^3 \;\Rightarrow\; t^2y = t^4 + C \;\Rightarrow\; y = t^2 + \dfrac{C}{t^2}$.` },
      { label: 'Initial condition', text: t`$y(1) = 1 + C = 3$, so $C = 2$ and $y = t^2 + \dfrac{2}{t^2}$.` },
      { label: 'Check', text: t`$y' = 2t - 4t^{-3}$, so $t\,y' + 2y = 2t^2 - 4t^{-2} + 2t^2 + 4t^{-2} = 4t^2$ ✓` },
    ],
    answer: t`$y = t^2 + \dfrac{2}{t^2}$ for $t > 0$.`,
  },
  practice: [
    multi({
      id: 'which-linear', difficulty: 1,
      prompt: t`Which of these equations are **linear** in $y$? Select all that are.`,
      choices: [t`$y' = t\,y + e^t$`, t`$y' + e^{t}\,y = 0$`, t`$y' + y^2 = t$`, t`$y' = \cos y$`, t`$y' - \dfrac{y}{t} = t^3$`],
      answer: [0, 1, 4],
      why: { 2: t`$y^2$ is not first power in $y$.`, 3: t`$\cos y$ is a nonlinear function of $y$.` },
      hints: [t`Linear means $y$ and $y'$ appear only to the first power, multiplied by functions of $t$ — never $y^2$, $\sin y$ or $y\,y'$.`],
      teach: 'An equation is linear in y when it can be written y′ + p(t)y = q(t); the coefficients may be any functions of t.',
      explain: t`$y' - t\,y = e^t$, $\;y' + e^t y = 0$ and $y' - \frac1t y = t^3$ are all of the form $y' + p(t)y = q(t)$. The coefficients $e^t$ and $1/t$ are fine — only $y$ itself must appear linearly.`,
    }),
    mcq({
      id: 'standard-form', difficulty: 1,
      visual: { type: 'phase', params: { slope: true, f: '3*y/t + t^3', x: [0.2, 1.6], y: [-1, 7], start: [0.5, 0.0625], h: 0.25 }, caption: t`The slope field of $t\,y' - 3y = t^4$ for $t > 0$, with one solution (blue). Standard form is what lets you read the slope at each point: $y' = \frac{3}{t}y + t^3$.` },
      prompt: t`Put $t\,y' - 3y = t^4$ (with $t > 0$) in standard form $y' + p(t)\,y = q(t)$. What is $p(t)$?`,
      choices: [t`$-\dfrac{3}{t}$`, t`$-3$`, t`$\dfrac{3}{t}$`, t`$t^3$`],
      answer: 0,
      why: { 1: t`First divide the whole equation by $t$, so that $y'$ has coefficient 1: the $-3$ becomes $-3/t$.`, 2: 'The sign stays with the term: it is minus 3y.', 3: t`$t^3$ is $q(t)$, the right side after dividing by $t$.` },
      hints: ['Standard form needs the coefficient of y′ to be exactly 1.', 'Divide every term by t.'],
      teach: 'Always divide by the coefficient of y′ before reading off p(t) — the integrating factor is built from p.',
      explain: t`Dividing by $t$: $y' - \dfrac{3}{t}y = t^3$, so $p(t) = -\dfrac3t$, $q(t) = t^3$, and $\mu = e^{-3\ln t} = t^{-3}$.`,
    }),
    expr({
      id: 'mu', difficulty: 2,
      gen(r) {
        const kind = r.pick(['const', 'lin', 'recip']);
        const k = r.int(2, 4);
        const F = {
          const: { eq: t`y' + ${k}y = \sin t`, ans: `exp(${k}t)`, ansT: t`e^{${k}t}`, err: `exp(-${k}t)`, p: t`${k}`, ip: t`${k}t` },
          lin: { eq: t`y' + ${2 * k}t\,y = t`, ans: `exp(${k}t^2)`, ansT: t`e^{${k}t^2}`, err: `exp(${2 * k}t)`, p: t`${2 * k}t`, ip: t`${k}t^2` },
          recip: { eq: t`y' + \dfrac{${k}}{t}\,y = 1`, ans: `t^${k}`, ansT: t`t^{${k}}`, err: `exp(${k}/t)`, p: t`\frac{${k}}{t}`, ip: t`${k}\ln t` },
        }[kind];
        return {
          prompt: t`Find the integrating factor $\mu(t) = e^{\int p\,dt}$ for $\;${F.eq}\;$ (take $t > 0$ and the constant of integration as 0).`,
          answer: F.ans, answerTeX: t`\mu = ${F.ansT}`, lhs: t`\mu(t)`,
          vars: { t: [0.5, 2] },
          errors: [{ answer: F.err, feedback: kind === 'recip' ? t`Integrate $p = \frac{${k}}{t}$ first: $\int \frac{${k}}{t}dt = ${k}\ln t$, and $e^{${k}\ln t} = t^{${k}}$.` : kind === 'lin' ? t`You need $e^{\int p\,dt}$, not $e^{p}$: integrate $${2 * k}t$ first.` : t`The exponent is $+\int p\,dt$, so no minus sign.` }],
          hints: [t`Here $p(t) = ${F.p}$.`, t`$\int p\,dt = ${F.ip}$; now exponentiate.`],
          teach: 'The integrating factor is e raised to an antiderivative of p(t), the coefficient of y in standard form.',
          explain: t`$\int p\,dt = ${F.ip}$, so $\mu = e^{${F.ip}}${kind === 'recip' ? t` = t^{${k}}` : ''}$. Check: $\mu' = p\,\mu$, which is what makes $\mu y' + \mu p y = (\mu y)'$.`,
          visual: { type: 'phase', params: { slope: true, f: kind === 'const' ? `sin(t) - ${k}*y` : kind === 'lin' ? `t - ${2 * k}*t*y` : `1 - ${k}*y/t`, x: kind === 'recip' ? [0.2, 4] : kind === 'lin' ? [0, 2] : [0, 6], y: kind === 'recip' ? [0, 2] : kind === 'lin' ? [-0.2, 1] : [-1, 1], start: kind === 'recip' ? [0.2, 1.5] : [0, 0.8], h: 0.25 }, caption: t`The slope field of $${F.eq}$ — linear in $y$, but not separable.` },
        };
      },
    }),
    expr({
      id: 'const-coef', difficulty: 2,
      gen(r) {
        const a = r.int(2, 4), s = a * r.int(1, 4), ss = s / a;
        const y0 = r.pick([0, 1, 2, 10].filter((v) => v !== ss));   // never start on the equilibrium
        const c = y0 - ss;
        const cT = c === 0 ? '' : c > 0 ? t` + ${c}e^{-${a}t}` : t` - ${-c}e^{-${a}t}`;
        return {
          prompt: t`Solve $y' + ${a}y = ${s}$ with $y(0) = ${y0}$.`,
          answer: `${ss} + (${c})*exp(-${a}t)`, answerTeX: t`y = ${ss}${cT}`, lhs: 'y',
          vars: { t: [0, 2] },
          errors: [
            ...(y0 !== 0 ? [{ answer: `${ss} + ${y0}*exp(-${a}t)`, feedback: t`At $t = 0$ that gives $${ss} + ${y0}$, not $${y0}$. Find $C$ from $y(0) = ${ss} + C$.` }] : []),
            { answer: `${s} + (${y0 - s})*exp(-${a}t)`, feedback: t`From $(e^{${a}t}y)' = ${s}e^{${a}t}$, integrating gives $\frac{${s}}{${a}}e^{${a}t}$ — divide by ${a}.` },
          ],
          hints: [t`$\mu = e^{${a}t}$, so $(e^{${a}t}y)' = ${s}e^{${a}t}$.`, t`Integrate: $e^{${a}t}y = \frac{${s}}{${a}}e^{${a}t} + C$, so $y = ${ss} + Ce^{-${a}t}$. Now use $y(0) = ${y0}$.`],
          teach: 'With constant coefficients the solution is the steady value q/p plus a transient Ce^{−pt} fixed by the start.',
          explain: t`$y = ${ss} + Ce^{-${a}t}$ and $y(0) = ${ss} + C = ${y0}$ gives $C = ${c}$. As $t \to \infty$ every solution approaches ${ss} = ${s}/${a}$.`,
          visual: { type: 'phase', params: { slope: true, f: `${s} - ${a}*y`, x: [0, 2], y: [0, Math.max(y0, ss) + 2], start: [0, y0], h: 0.1 }, caption: t`The slope field of $y' = ${s} - ${a}y$; the flat segments sit at the steady value $y = ${ss}$.` },
        };
      },
    }),
    expr({
      id: 'exp-forcing', difficulty: 3,
      gen(r) {
        const k = r.int(1, 3), y0 = r.int(1, 3);
        const C = y0 - 1 / (k + 1);
        return {
          prompt: t`Solve $y' + y = e^{${k === 1 ? '' : k}t}$ with $y(0) = ${y0}$.`,
          answer: `exp(${k}t)/${k + 1} + (${C})*exp(-t)`, answerTeX: t`y = \frac{e^{${k === 1 ? '' : k}t}}{${k + 1}} + \frac{${(k + 1) * y0 - 1}}{${k + 1}}e^{-t}`, lhs: 'y',
          vars: { t: [-1, 1.5] },
          errors: [{ answer: `exp(${k}t)/${k + 1} + ${y0}*exp(-t)`, feedback: t`Apply the initial condition to the whole solution: $y(0) = \frac{1}{${k + 1}} + C$.` }, { answer: `exp(${k}t) + (${y0 - 1})*exp(-t)`, feedback: t`$\int e^{${k + 1}t}\,dt = \frac{1}{${k + 1}}e^{${k + 1}t}$ — do not forget to divide by ${k + 1}.` }],
          hints: [t`$\mu = e^{t}$, so $(e^t y)' = e^t\cdot e^{${k === 1 ? '' : k}t} = e^{${k + 1}t}$.`, t`Integrate: $e^ty = \frac{1}{${k + 1}}e^{${k + 1}t} + C$, then divide by $e^t$.`, t`$y = \frac{1}{${k + 1}}e^{${k === 1 ? '' : k}t} + Ce^{-t}$; at $t = 0$ this is $\frac{1}{${k + 1}} + C = ${y0}$.`],
          teach: 'Multiply the source by the integrating factor too, then integrate the product.',
          explain: t`$(e^ty)' = e^{${k + 1}t}$ gives $y = \frac{e^{${k === 1 ? '' : k}t}}{${k + 1}} + Ce^{-t}$, and $C = ${y0} - \frac1{${k + 1}} = \frac{${(k + 1) * y0 - 1}}{${k + 1}}$.${k === 1 && y0 === 1 ? t` (This one is $\cosh t$.)` : ''}`,
          visual: { type: 'phase', params: { slope: true, f: `exp(${k}*t) - y`, x: [0, 1.5], y: [0, Math.ceil(Math.exp(1.5 * k) / (k + 1) + y0 + 1)], start: [0, y0], h: 0.25 }, caption: t`The slope field of $y' = e^{${k === 1 ? '' : k}t} - y$ and the solution through $(0, ${y0})$.` },
        };
      },
    }),
    mcq({
      id: 'forgot-mu-q', difficulty: 3, kind: 'error',
      visual: { type: 'graph', params: { x: [-1, 2], y: [0, 7.5], xlabel: 't', ylabel: '', curves: [{ fn: 'exp(x)', color: 'accent', label: 'needed: eᵗ', labelAt: 1.6, labelDx: -70 }, { fn: 'exp(-x)', color: 'warn', dash: true, label: 'student’s y′ + 2y', labelAt: -0.6, labelDx: 8 }] }, caption: t`Substituting the student’s answer (take $C = 0$) into the left side gives $y' + 2y = e^{-t}$ (dashed), not the $e^t$ the equation demands.` },
      prompt: t`A student solves $y' + 2y = e^{t}$: “$\mu = e^{2t}$, so $(e^{2t}y)' = e^{t}$, so $e^{2t}y = e^t + C$, so $y = e^{-t} + Ce^{-2t}$.” Where is the mistake?`,
      choices: [
        t`The right side must be multiplied by $\mu$ too: $(e^{2t}y)' = e^{3t}$`,
        t`The integrating factor should be $e^{-2t}$`,
        t`The integrating factor should be $e^{2}$`,
        t`Dividing $e^{2t}y = e^t + C$ by $e^{2t}$ gives $y = e^{t/2} + C$`,
      ],
      answer: 0,
      why: {
        1: t`$\mu = e^{\int 2\,dt} = e^{+2t}$; with $e^{-2t}$ the left side would not be a product derivative.`,
        2: t`$\int 2\,dt = 2t$, not 2.`,
        3: t`Dividing by $e^{2t}$ subtracts exponents: $e^t/e^{2t} = e^{-t}$. That step was right.`,
      },
      hints: ['Multiply the whole equation by μ — both sides.', t`What is $e^{2t}\cdot e^t$?`],
      teach: 'Multiplying by the integrating factor means multiplying every term, the source q(t) included.',
      explain: t`Correctly: $(e^{2t}y)' = e^{3t}$, so $e^{2t}y = \tfrac13e^{3t} + C$ and $y = \tfrac13e^{t} + Ce^{-2t}$. Check: $y' + 2y = \tfrac13e^t + \tfrac23e^t = e^t$ ✓`,
    }),
    num({
      id: 'mixing', difficulty: 3,
      gen(r) {
        const V = r.pick([100, 200, 400]), rate = r.pick([4, 5, 10]), cin = r.pick([0.5, 1, 2]), t1 = r.pick([10, 20, 30]);
        const k = rate / V, S = V * cin * (1 - Math.exp(-k * t1));
        return {
          prompt: t`A tank holds ${V} L of pure water. Brine with ${cin} g of salt per litre flows in at ${rate} L/min, and the well-mixed solution flows out at the same rate. The salt mass obeys $\dfrac{dS}{dt} = ${nice(rate * cin)} - \dfrac{${rate}}{${V}}\,S$ (grams, minutes). How much salt is in the tank after ${t1} min?`,
          answer: S, units: 'g', tol: { rel: 0.01 },
          errors: [{ value: rate * cin * t1, feedback: 'That ignores the salt flowing out. The outflow term −(rate/V)·S slows the build-up.' }],
          hints: [t`Standard form: $S' + ${nice(k)}\,S = ${nice(rate * cin)}$, so $\mu = e^{${nice(k)}t}$.`, t`The solution with $S(0) = 0$ is $S = ${nice(V * cin)}\,(1 - e^{-${nice(k)}t})$: it approaches the amount in a tank full of incoming brine.`],
          teach: 'In a mixing problem, rate in minus rate out gives a linear equation whose steady state is the inflow concentration times the volume.',
          explain: t`$S = ${nice(V * cin)}\,(1 - e^{-${nice(k)}\times${t1}}) = ${nice(V * cin)}\times${fmt(1 - Math.exp(-k * t1), 3)} \approx ${fmt(S, 3)}$ g. In the long run $S \to ${nice(V * cin)}$ g, a tank full of the incoming brine.`,
          visual: {
            type: 'graph',
            params: { x: [0, 3 * V / rate], y: [0, 1.2 * V * cin], xlabel: 't (min)', ylabel: 'S (g)', curves: [{ fn: `${V * cin}*(1 - exp(-${k}x))`, color: 'accent' }], hlines: [{ y: V * cin, label: 'steady state', color: 'good' }], vlines: [{ x: t1, label: `t = ${t1} min`, color: 'gold' }] },
            caption: 'The salt mass climbs towards its steady value; your answer is its height at the gold line.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-steady', difficulty: 2,
      gen(r) {
        const a = r.int(2, 5), b = a * r.int(2, 5);
        return {
          prompt: t`As $t \to \infty$, what does every solution of $y' + ${a}y = ${b}$ approach?`,
          choices: [t`$y = ${b / a}$`, t`$y = ${b}$`, 't = 0 — every solution decays to zero', 'It depends on the initial value'],
          answer: 0,
          why: { 1: t`At the steady state $y' = 0$, so $${a}y = ${b}$: divide by ${a}.`, 2: t`The transient $Ce^{-${a}t}$ decays, but the source ${b} keeps $y$ away from zero.`, 3: t`The initial value only sets $C$ in the transient $Ce^{-${a}t}$, which dies away.` },
          hints: [t`The general solution is a steady value plus $Ce^{-${a}t}$.`],
          teach: 'For y′ + ay = b with a > 0, the transient dies and every solution approaches b/a.',
          explain: t`$y = \frac{${b}}{${a}} + Ce^{-${a}t} \to ${b / a}$, whatever $C$ (that is, whatever $y(0)$) is.`,
        };
      },
    }),
    num({
      id: 'cp-rl', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([0.2, 0.5, 1]), R = r.pick([5, 10, 20]), V = r.pick([6, 12, 24]), m = r.pick([0.5, 1, 2]);
        const tau = L / R, t1 = m * tau, I = (V / R) * (1 - Math.exp(-m));
        return {
          prompt: t`A coil of inductance $L = ${L}$ H and a resistor $R = ${R}\ \Omega$ are switched across a ${V} V battery at $t = 0$. The current obeys $L\,\dfrac{di}{dt} + R\,i = ${V}$, with $i(0) = 0$. Find the current at $t = ${nice(t1 * 1000)}$ ms.`,
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: V / R, feedback: t`That is the final current $V/R$; at this time the transient $e^{-Rt/L}$ has not died yet.` }, { value: (V / R) * Math.exp(-m), feedback: t`With $i(0) = 0$ the current *rises*: $i = \frac{V}{R}(1 - e^{-Rt/L})$.` }],
          hints: [t`Standard form: $i' + \dfrac{R}{L}i = \dfrac{${V}}{L}$, so $\mu = e^{Rt/L}$ and the time constant is $\tau = L/R = ${nice(tau * 1000)}$ ms.`, t`The solution with $i(0) = 0$ is $i = \dfrac{${V}}{${R}}\left(1 - e^{-t/\tau}\right)$.`],
          teach: 'An RL circuit is a first-order linear equation: the current rises to V/R with time constant L/R.',
          explain: t`$\tau = L/R = ${nice(tau * 1000)}$ ms, so $i = ${nice(V / R)}\,(1 - e^{-${nice(m)}}) \approx ${fmt(I, 3)}$ A.`,
          visual: { type: 'graph', params: { x: [0, 5], y: [0, 1.15], xlabel: 'time t / τ', ylabel: 'i ÷ (V/R)', curves: [{ fn: '1 - exp(-x)', color: 'accent' }], hlines: [{ y: 1, label: 'final current V/R', color: 'good' }] }, caption: t`Every RL (or RC) circuit switched on at $t = 0$ follows this one curve once current is measured in units of $V/R$ and time in units of $\tau$.` },
        };
      },
    }),
    expr({
      id: 'cp-solve', difficulty: 3,
      gen(r) {
        const n = r.int(1, 3), y1 = r.int(2, 4), c = y1 - 1;
        return {
          prompt: t`Solve $t\,y' + y = ${n + 1}t^{${n}}$ for $t > 0$, with $y(1) = ${y1}$.`,
          answer: `t^${n} + ${c}/t`, answerTeX: t`y = t^{${n}} + \frac{${c}}{t}`, lhs: 'y',
          vars: { t: [0.5, 3] },
          errors: [{ answer: `t^${n} + ${c}`, feedback: t`From $ty = t^{${n + 1}} + C$, divide **every** term by $t$, the constant too.` }, { answer: `${n + 1}*t^${n} + ${c}/t`, feedback: t`Integrate $(ty)' = ${n + 1}t^{${n}}$: the antiderivative is $t^{${n + 1}}$, not $${n + 1}t^{${n + 1}}$.` }],
          hints: [t`The left side $t\,y' + y$ is already a product derivative: $(t\,y)'$.`, t`So $(ty)' = ${n + 1}t^{${n}}$, giving $ty = t^{${n + 1}} + C$.`],
          teach: 'Sometimes the left side is already a product derivative — then the integrating factor is 1 after all.',
          explain: t`$(ty)' = ${n + 1}t^{${n}} \Rightarrow ty = t^{${n + 1}} + C \Rightarrow y = t^{${n}} + \frac{C}{t}$, and $y(1) = 1 + C = ${y1}$ gives $C = ${c}$.`,
          visual: { type: 'phase', params: { slope: true, f: `(${n + 1}*t^${n} - y)/t`, x: [0.5, 2.5], y: [0, Math.ceil(1.15 * Math.max(2.5 ** n + c / 2.5, 0.5 ** n + c / 0.5))], start: [1, y1], h: 0.25 }, caption: t`The slope field of $t\,y' + y = ${n + 1}t^{${n}}$ for $t > 0$, and the solution through $(1, ${y1})$.` },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §4.5 First-order linear equations', url: 'https://openstax.org/books/calculus-volume-2/pages/4-5-first-order-linear-equations' }],
});
