// Separable equations past the basics: implicit solutions, intervals of
// validity, partial fractions — and drag-limited fall, linear against quadratic.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac } from '../../src/core/format.js';

const t = String.raw;
const G = 9.8;
const GM = 3.986004418e14, RE = 6.371e6;     // Earth: GM (m³/s²) and mean radius (m), NASA fact sheet

export default lesson({
  id: 'math2280.DE-2.1',
  title: 'Separable equations',
  minutes: 12, difficulty: 3,
  intro: t`An equation is **separable** when its slope factors into a function of $t$ times a function of $y$, $y' = g(t)\,h(y)$. Divide by $h(y)$, multiply by $dt$ and integrate each side on its own:

$$\int \frac{dy}{h(y)} = \int g(t)\,dt + C$$

The result is often only **implicit** — a relation $H(y) = G(t) + C$ that you may not be able to solve for $y$. Two cautions turn the recipe into a method: every zero of $h$ is a constant solution that dividing by $h$ throws away, and every solution lives on an **interval of validity**, which ends where the solution blows up or where the relation stops defining $y$ as a function of $t$.`,
  symbols: [
    { tex: t`g(t)`, text: t`the factor of the slope that depends on $t$ alone` },
    { tex: t`h(y)`, text: t`the factor that depends on $y$ alone; its zeros are equilibrium (constant) solutions` },
    { tex: t`H(y),\ G(t)`, text: t`antiderivatives of $1/h(y)$ and of $g(t)$; the solution is the relation $H(y) = G(t) + C$` },
    { tex: t`C`, text: 'one constant of integration for the whole equation, fixed by the initial condition' },
  ],
  why: t`Separation solves the falling body with drag, rate laws and orbital decay, and the implicit relations it produces are often conservation laws in disguise.`,
  visual: {
    type: 'mech-drag',
    title: 'Falling with linear and with quadratic drag',
    lead: t`A skydiver falls from rest. Quadratic drag gives the separable equation $m\,v' = mg - \tfrac12\rho C_D A\,v^2$, whose solution is $v = v_t\tanh(gt/v_t)$ (blue). Purple is **linear** drag, $m\,v' = mg - bv$, with $b$ chosen to give the same terminal speed: $v = v_t\,(1 - e^{-gt/v_t})$.`,
    tasks: [
      'Press Play: the blue curve pulls ahead early. Below the terminal speed, quadratic drag is the weaker of the two.',
      'Read both at t = vₜ/g ≈ 5.6 s: quadratic drag has reached 76% of the terminal speed, linear drag only 63%.',
      t`Raise the drag area: the terminal speed falls like $1/\sqrt{C_D A}$ — it takes four times the area to halve it.`,
    ],
    params: { m: 80, CdA: 0.42, linear: true, sliders: ['m', 'CdA'], T: 24 },
    caption: t`Drag $\tfrac12\rho C_D A v^2$ at sea-level density with $C_D A$ fixed; a real skydiver changes posture, and the air thickens on the way down. The linear-drag curve shares the same terminal speed for comparison: for a body this size, linear (viscous) drag is negligible. $g = 9.8\ \text{m/s}^2$.`,
  },
  example: {
    prompt: t`A skydiver of mass $m = 80$ kg falls from rest with quadratic drag $kv^2$, $k = 0.257$ kg/m, so $\;m\dfrac{dv}{dt} = mg - kv^2$. Solve for $v(t)$ by separating variables, and find how long it takes to reach 90% of the terminal speed.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 24], y: [0, 62], xlabel: 't (s)', ylabel: 'v (m/s)',
        curves: [
          { fn: '9.8x', domain: [0, 6.3], color: 'ink3', dash: true, width: 1.6, label: 'free fall, v = gt', labelAt: 3.4, labelDx: 10, labelDy: 2 },
          { fn: '55.2*(1 - exp(-9.8x/55.2))', color: 'violet', width: 1.8, label: 'linear drag', labelAt: 15, labelDy: 14 },
          { fn: '55.2*tanh(9.8x/55.2)', color: 'accent', label: 'quadratic drag', labelAt: 4.3, labelDx: 12, labelDy: 12 },
        ],
        hlines: [{ y: 55.2, label: 'vₜ = 55.2 m/s', color: 'good' }, { y: 49.7, label: '90%', color: 'ink3' }],
      },
      caption: t`The solution (blue) against free fall and against linear drag with the same terminal speed (purple). Constant air density; no wind.`,
    },
    steps: [
      { label: 'Name the terminal speed', text: t`The slope is zero when $mg = kv^2$: $\;v_t = \sqrt{mg/k} = \sqrt{80 \times 9.8 / 0.257} = 55.2$ m/s. Then $\dfrac{dv}{dt} = g\left(1 - \dfrac{v^2}{v_t^2}\right)$ — separable, with $h(v) = 1 - v^2/v_t^2$.` },
      { label: 'Separate', text: t`$\dfrac{dv}{1 - v^2/v_t^2} = g\,dt$. The zeros of $h$, $v = \pm v_t$, are constant solutions: a diver already at terminal speed stays there.` },
      { label: 'Partial fractions', text: t`With $u = v/v_t$: $\;\dfrac{1}{1 - u^2} = \dfrac12\left(\dfrac{1}{1 - u} + \dfrac{1}{1 + u}\right)$, so $\displaystyle\int \frac{dv}{1 - v^2/v_t^2} = \frac{v_t}{2}\ln\frac{1 + v/v_t}{1 - v/v_t} = v_t\,\operatorname{artanh}\frac{v}{v_t}$ for $|v| < v_t$.` },
      { label: 'Integrate and solve', text: t`$v_t\,\operatorname{artanh}(v/v_t) = gt + C$, and $v(0) = 0$ gives $C = 0$. So $v = v_t\tanh\!\left(\dfrac{gt}{v_t}\right)$.` },
      { label: 'Time to 90 percent', text: t`$\tanh(gt/v_t) = 0.9$ when $t = \dfrac{v_t}{g}\operatorname{artanh}(0.9) = \dfrac{55.2}{9.8}\times ${fmt(Math.atanh(0.9), 4)} = ${fmt((55.2 / 9.8) * Math.atanh(0.9), 3)}$ s. With linear drag and the same $v_t$ it would take $\dfrac{v_t}{g}\ln 10 = ${fmt((55.2 / 9.8) * Math.log(10), 3)}$ s.` },
      { label: 'Sense check', text: t`For small $t$, $\tanh x \approx x$ gives $v \approx gt$: free fall, before the air matters. As $t \to \infty$, $v \to v_t$. And the curve can never cross $v = v_t$, which is itself a solution.` },
    ],
    answer: t`$v(t) = 55.2\tanh(0.178\,t)$ m/s; it reaches 90% of $v_t$ after about ${fmt((55.2 / 9.8) * Math.atanh(0.9), 2)} s.`,
  },
  practice: [
    expr({
      id: 'implicit', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2, 3]), y0 = r.pick([1, 2]), C = y0 ** 4 + y0 ** 2;
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = \dfrac{${3 * a}t^2}{4y^3 + 2y}$ with $y(0) = ${y0}$. Give the solution as an equation relating $y$ and $t$ (you need not solve for $y$).`,
          answer: `y^4 + y^2 = ${a}t^3 + ${C}`, answerTeX: t`y^4 + y^2 = ${a === 1 ? '' : a}t^3 + ${C}`,
          vars: { t: [-1, 1], y: [0.5, 3] }, mode: 'equation',
          errors: [
            { answer: `y^4 + y^2 = ${a}t^3`, feedback: t`Use the initial condition: at $t = 0$, $y^4 + y^2 = ${C}$, so the constant is ${C}, not 0.` },
            { answer: `y^4 + y^2 = ${3 * a}t^3 + ${C}`, feedback: t`$\int ${3 * a}t^2\,dt = ${a === 1 ? '' : a}t^3$ — divide by 3 when you integrate.` },
          ],
          hints: [t`Multiply across: $(4y^3 + 2y)\,dy = ${3 * a}t^2\,dt$.`, t`Integrate: $y^4 + y^2 = ${a === 1 ? '' : a}t^3 + C$. Then put in $t = 0$, $y = ${y0}$.`],
          teach: 'Separation gives the solution as a relation H(y) = G(t) + C; it is a complete answer even when you cannot solve it for y.',
          explain: t`$\int(4y^3 + 2y)\,dy = y^4 + y^2$ and $\int ${3 * a}t^2\,dt = ${a === 1 ? '' : a}t^3$, so $y^4 + y^2 = ${a === 1 ? '' : a}t^3 + C$ with $C = ${y0}^4 + ${y0}^2 = ${C}$. (This one is a quadratic in $y^2$, so it could be solved — but the relation already is the solution.)`,
          visual: { type: 'de-slopefield', params: { f: `${3 * a}*t^2/(4*y^3 + 2*y)`, x: [-1.5, 1.5], y: [0, 3], grid: [17, 13], seeds: [[0, y0]], seedColor: 'accent' }, caption: t`The slope field of $y' = ${3 * a}t^2/(4y^3 + 2y)$ and the solution through $(0, ${y0})$, traced numerically.` },
        };
      },
    }),
    num({
      id: 'validity', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 4, 9, 0.25]), a = r.pick([1, 2, 3]);
        const T = a / Math.sqrt(k);
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = -\dfrac{${k}\,t}{y}$ with $y(0) = ${a}$. The solution is defined only for $-T < t < T$. Find $T$.`,
          answer: T, tol: { rel: 0.005 },
          errors: [{ value: a, feedback: t`That would be right for $y' = -t/y$. Here $y^2 = ${a * a} - ${k}t^2$: divide by ${k} before the square root.` }, { value: (a * a) / k, feedback: t`You found $T^2$: take the square root.` }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Separate: $y\,dy = -${k}\,t\,dt$, so $\tfrac12y^2 = -\tfrac{${k}}{2}t^2 + C$.`, t`$y^2 = ${a * a} - ${k}t^2$ and $y > 0$. The solution stops where $y$ reaches 0 — there the slope $-${k}t/y$ is infinite.`],
          teach: 'A solution’s interval of validity can end where the implicit relation stops giving y as a function of t — here where y reaches 0 and the slope becomes infinite.',
          explain: t`$y = \sqrt{${a * a} - ${k}t^2}$, a half-ellipse, defined while $${k}t^2 < ${a * a}$: $|t| < ${nice(T)}$. At the ends the curve meets the axis vertically, and $y' = -${k}t/y$ blows up; the solution cannot be continued as a function of $t$.`,
          visual: { type: 'de-slopefield', params: { f: `-${k}*t/y`, x: [-1.2 * Math.max(T, 1), 1.2 * Math.max(T, 1)], y: [0, a + 1], grid: [17, 13], points: [{ x: 0, y: a, color: 'gold', label: `(0, ${a})` }] }, caption: t`The slope field of $y' = -${k}t/y$ for $y > 0$, with the starting point. The segments turn vertical as $y \to 0$.` },
        };
      },
    }),
    expr({
      id: 'explicit', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 2, 3]);
        const ans = b === 1 ? '-ln(cos(t))' : `-ln(cos(t) + ${b - 1})`;
        const y0T = b === 1 ? '0' : t`-\ln ${b}`;
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = e^{y}\sin t$ with $y(0) = ${y0T}$.`,
          answer: ans, answerTeX: b === 1 ? t`y = -\ln(\cos t)` : t`y = -\ln(\cos t + ${b - 1})`, lhs: 'y',
          vars: { t: [-1, 1] },
          integrand: `exp(${ans})*sin(t)`,
          errors: [
            { answer: b === 1 ? 'ln(cos(t))' : `ln(cos(t) + ${b - 1})`, feedback: t`Sign: $\int e^{-y}dy = -e^{-y}$, so $e^{-y} = \cos t + C$ and $y = -\ln(\cos t + C)$.` },
            { answer: `-ln(cos(t)) + (${b === 1 ? 0 : Math.log(1 / b)})`, feedback: t`The constant goes inside the logarithm: $e^{-y} = \cos t + C$, so $y = -\ln(\cos t + C)$, not $-\ln(\cos t) + C$.` },
          ].filter((e) => b !== 1 || !e.answer.includes('+ (0)')),
          hints: [t`Separate: $e^{-y}\,dy = \sin t\,dt$.`, t`Integrate: $-e^{-y} = -\cos t + C$, so $e^{-y} = \cos t + C'$. Fix $C'$ from $e^{-y(0)} = ${b}$.`],
          teach: 'Fix the constant before you take the logarithm; afterwards it sits inside the log, not outside.',
          explain: t`$e^{-y} = \cos t + C'$ with $C' = ${b} - 1 = ${b - 1}$, so $y = -\ln(\cos t${b === 1 ? '' : ` + ${b - 1}`})$. ${b === 1 ? t`It lives only on $-\tfrac{\pi}{2} < t < \tfrac{\pi}{2}$, where $\cos t > 0$.` : b === 2 ? t`It lives on $-\pi < t < \pi$ and blows up where $\cos t = -1$.` : t`Here $\cos t + 2 > 0$ always, so this solution lives for all $t$.`} The starting value decides the interval.`,
          visual: { type: 'de-slopefield', params: { f: 'exp(y)*sin(t)', x: [-3.5, 3.5], y: [-2, 3], grid: [19, 13], points: [{ x: 0, y: -Math.log(b), color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = e^{y}\sin t$: the slopes grow fast as $y$ increases. The gold dot is the starting point.` },
        };
      },
    }),
    mcq({
      id: 'lin-vs-quad', difficulty: 2,
      prompt: t`Both curves are falls from rest with the same terminal speed $v_t$: blue with quadratic drag $kv^2$, purple with linear drag $bv$. Why does the quadratic-drag curve rise faster at first?`,
      choices: [
        t`Below $v_t$, $kv^2$ is smaller than $bv$ (since $kv_t^2 = bv_t$ gives $kv^2 = bv\cdot v/v_t$), so the net force is larger`,
        'Quadratic drag is larger than linear drag at every speed',
        'The quadratic-drag body has the larger terminal speed',
        'Linear drag starts acting at once, while quadratic drag waits until the body is moving',
      ],
      answer: 0,
      why: {
        1: t`It is larger only **above** $v_t$; below it, $v^2/v_t < v$.`,
        2: 'The two terminal speeds are equal by construction — the curves level off at the same height.',
        3: t`Both drags are zero at $v = 0$ and both act from the first instant; they differ in how fast they grow.`,
      },
      hints: [t`Equal terminal speeds mean equal drag at $v_t$: $kv_t^2 = bv_t$.`, t`Compare $kv^2$ with $bv$ at, say, $v = v_t/2$.`],
      teach: 'With the same terminal speed, quadratic drag is weaker than linear drag below it and stronger above it.',
      explain: t`At $v = v_t/2$ quadratic drag is $k v_t^2/4 = \tfrac14 mg$ while linear drag is $b v_t/2 = \tfrac12 mg$. Weaker drag means a larger net force, so the quadratic-drag body accelerates harder and gets close to $v_t$ sooner: $\tanh x$ approaches 1 like $1 - 2e^{-2x}$, against $1 - e^{-x}$.`,
      visual: { type: 'mech-drag', params: { m: 80, CdA: 0.42, linear: true, time: 5, T: 24 }, caption: 'Blue: quadratic drag. Purple: linear drag with the same terminal speed. Five seconds into the fall; forces drawn for the quadratic case.' },
    }),
    num({
      id: 'drag-90', difficulty: 3,
      gen(r) {
        const [what, m, CdA] = r.pick([['An 80 kg skydiver in a head-down dive', 80, 0.22], ['A 70 kg skydiver spread flat', 70, 0.45], ['A 90 kg skydiver spread flat', 90, 0.5], ['A 100 kg payload on a drogue chute', 100, 1.2]]);
        const rho = 1.2, vt = Math.sqrt((2 * m * G) / (rho * CdA)), q = r.pick([0.9, 0.95, 0.99]);
        const T = (vt / G) * Math.atanh(q);
        return {
          prompt: t`${what} has drag area $C_D A = ${CdA}\ \text{m}^2$ in air of density $\rho = 1.2\ \text{kg/m}^3$, and falls from rest with $m v' = mg - \tfrac12\rho C_DA\,v^2$. How long until it reaches ${Math.round(q * 100)}% of its terminal speed?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: (vt / G) * Math.log(1 / (1 - q)), feedback: t`That is the linear-drag answer, $\frac{v_t}{g}\ln\frac{1}{1 - ${q}}$. Quadratic drag gives $v = v_t\tanh(gt/v_t)$, so use $\operatorname{artanh}$.` },
            { value: (q * vt) / G, feedback: 'That is how long free fall would take. Drag slows the approach, so it takes longer.' },
          ],
          hints: [t`First the terminal speed: $v_t = \sqrt{\dfrac{2mg}{\rho C_D A}}$.`, t`The solution is $v = v_t\tanh(gt/v_t)$. Set $\tanh(gt/v_t) = ${q}$.`, t`$t = \dfrac{v_t}{g}\operatorname{artanh}(${q})$, and $\operatorname{artanh}(x) = \tfrac12\ln\dfrac{1 + x}{1 - x}$.`],
          teach: 'Quadratic drag from rest gives v = vₜ tanh(gt/vₜ): the time to reach a fraction q of vₜ is (vₜ/g) artanh q.',
          explain: t`$v_t = \sqrt{2 \times ${m} \times 9.8/(1.2 \times ${CdA})} = ${fmt(vt, 3)}$ m/s, and $t = \dfrac{${fmt(vt, 3)}}{9.8}\operatorname{artanh}(${q}) = ${fmt(vt / G, 3)} \times ${fmt(Math.atanh(q), 4)} = ${fmt(T, 3)}$ s.`,
          visual: { type: 'mech-drag', params: { m, CdA, rho, ask: true, icon: what.includes('payload') ? 'capsule' : 'skydiver', chute: what.includes('payload'), time: 0, T: Math.max(10, Math.ceil(T * 1.6)) }, caption: 'The fall from rest, with weight and drag drawn to one scale. The terminal speed is left for you to compute.' },
        };
      },
    }),
    num({
      id: 'max-height', difficulty: 3,
      gen(r) {
        const v0 = r.pick([25, 30, 40, 50]), vt = r.pick([20, 30, 40]);
        const H = ((vt * vt) / (2 * G)) * Math.log(1 + (v0 * v0) / (vt * vt));
        return {
          prompt: t`A ball is thrown straight up at $v_0 = ${v0}$ m/s. On the way up both gravity and quadratic drag point down: $\dfrac{dv}{dt} = -g - \dfrac{g}{v_t^2}v^2$, with terminal speed $v_t = ${vt}$ m/s. Writing $\dfrac{dv}{dt} = v\dfrac{dv}{dx}$ makes the equation separable in $v$ and the height $x$. How high does the ball go?`,
          answer: H, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (v0 * v0) / (2 * G), feedback: t`That is the drag-free height $v_0^2/2g$. Drag takes energy out on the way up, so the ball stops lower.` }, { value: ((vt * vt) / G) * Math.log(1 + (v0 * v0) / (vt * vt)), feedback: t`$\int \frac{v\,dv}{1 + v^2/v_t^2} = \frac{v_t^2}{2}\ln\left(1 + \frac{v^2}{v_t^2}\right)$: keep the $\tfrac12$.` }],
          hints: [t`$v\dfrac{dv}{dx} = -g\left(1 + \dfrac{v^2}{v_t^2}\right)$, so $\dfrac{v\,dv}{1 + v^2/v_t^2} = -g\,dx$.`, t`Integrate $v$ from $v_0$ down to 0 and $x$ from 0 up to $H$: $\dfrac{v_t^2}{2}\ln\left(1 + \dfrac{v_0^2}{v_t^2}\right) = gH$.`],
          teach: 'The chain rule dv/dt = v dv/dx turns a force that depends on speed into a separable equation in speed and position.',
          explain: t`$H = \dfrac{v_t^2}{2g}\ln\left(1 + \dfrac{v_0^2}{v_t^2}\right) = \dfrac{${vt * vt}}{19.6}\ln\left(1 + \dfrac{${v0 * v0}}{${vt * vt}}\right) = ${fmt(H, 3)}$ m, against ${fmt((v0 * v0) / (2 * G), 3)} m without air. For $v_0 \ll v_t$, $\ln(1 + u) \approx u$ recovers $v_0^2/2g$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, v0 * 1.05], y: [0, ((v0 * v0) / (2 * G)) * 1.12], xlabel: 'speed v (m/s)', ylabel: 'height x (m)',
              curves: [{ fn: `(${v0 * v0} - x^2)/19.6`, domain: [0, v0], color: 'ink3', dash: true, width: 1.8, label: 'no air', labelAt: v0 * 0.55, labelDx: 8, labelDy: -8 }],
              points: [{ x: v0, y: 0, color: 'gold', label: 'launch', labelDx: -56, labelDy: -12 }],
            },
            caption: t`The climb drawn in the speed–height plane: without air the ball follows the dashed curve, $x = (v_0^2 - v^2)/2g$, up to where $v = 0$. With drag its curve lies lower — find where it meets the height axis.`,
          },
        };
      },
    }),
    mcq({
      id: 'above-terminal', difficulty: 3, kind: 'error',
      prompt: t`A capsule enters the lower atmosphere at twice the terminal speed there, $v(0) = 2v_t$, and obeys $\dfrac{dv}{dt} = g\left(1 - \dfrac{v^2}{v_t^2}\right)$. A student tries $v = v_t\tanh\left(\dfrac{gt}{v_t} + C\right)$, finds that no $C$ gives $v(0) = 2v_t$, and concludes the model has no solution. What is wrong?`,
      choices: [
        t`For $v > v_t$ the partial fractions give $\operatorname{arcoth}$, not $\operatorname{artanh}$: the solution is $v = v_t\coth\left(\dfrac{gt}{v_t} + C\right)$, which falls towards $v_t$`,
        'Nothing: a body can never move faster than its terminal speed, so the starting value is impossible',
        'The capsule keeps its starting speed, because the slope is zero there',
        t`$C$ must be complex, so the speed oscillates about $v_t$`,
      ],
      answer: 0,
      why: {
        1: 'It can: anything thrown down hard, or entering thicker air from above, starts faster than its terminal speed and is slowed by drag.',
        2: t`At $v = 2v_t$ the slope is $g(1 - 4) = -3g$: the capsule decelerates hard.`,
        3: t`Speeds above $v_t$ stay above it — $v = v_t$ is a solution and cannot be crossed — so there is no oscillation.`,
      },
      hints: [t`$\tanh$ never exceeds 1. Which function of the form $v_t \times (\ldots)$ stays above 1 and decreases to 1?`, t`Redo the integral with absolute values: $\dfrac{v_t}{2}\ln\left|\dfrac{1 + v/v_t}{1 - v/v_t}\right|$. For $v > v_t$ that is $v_t\operatorname{arcoth}(v/v_t)$.`],
      teach: 'The absolute values in a partial-fraction integral matter: different ranges of y can give different solution formulas.',
      explain: t`For $v > v_t$, $\dfrac{v_t}{2}\ln\dfrac{v/v_t + 1}{v/v_t - 1} = v_t\operatorname{arcoth}(v/v_t) = gt + C$, so $v = v_t\coth(gt/v_t + C)$ with $\coth C = 2$. It decelerates from $2v_t$ and settles towards $v_t$ from above, never crossing the constant solution $v = v_t$.`,
      visual: { type: 'de-slopefield', params: { f: '9.8*(1 - y^2/25)', x: [0, 2], y: [0, 11], grid: [17, 14], xlabel: 't (s)', ylabel: 'v (m/s)', seeds: [[0, 0], [0, 10]], seedColor: 'accent2', hlines: [{ y: 5, label: 'vₜ', color: 'good' }] }, caption: t`The slope field with $v_t = 5$ m/s: solutions from rest and from $2v_t$, traced numerically. The line $v = v_t$ is itself a solution.` },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-decay', difficulty: 3, transfer: true,
      gen(r) {
        const [act, rho] = r.pick([['near solar minimum', 2e-12], ['in an average year', 4e-12], ['near solar maximum', 1e-11]]);
        const beta = 0.009;                                   // C_D A / m, m²/kg — an ISS-like value
        const B = rho * beta * Math.sqrt(GM);                 // m^½/s
        const h0 = r.pick([420, 410]), h1 = h0 - r.pick([10, 20]);
        const a0 = RE + h0 * 1e3, a1 = RE + h1 * 1e3;
        const days = (2 * (Math.sqrt(a0) - Math.sqrt(a1))) / B / 86400;
        return {
          prompt: t`A space station in a circular orbit loses energy to drag. With the air density $\rho$ held constant, its orbital radius $a$ obeys
$$\frac{da}{dt} = -\rho\,\frac{C_D A}{m}\sqrt{GM\,a},$$
with $C_D A/m = 0.009\ \text{m}^2/\text{kg}$ and $GM = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$. Take $\rho = ${rho === 1e-11 ? t`1\times10^{-11}` : t`${rho / 1e-12}\times10^{-12}`}\ \text{kg/m}^3$ (${act}). How many **days** does it take to sink from ${h0} km to ${h1} km above Earth’s surface ($R_E = 6371$ km)?`,
          answer: days, units: 'day', tol: { rel: 0.02 },
          errors: [{ value: days / 2, feedback: t`$\int a^{-1/2}\,da = 2\sqrt a$: keep the factor 2.` }],
          hints: [t`Separate: $a^{-1/2}\,da = -B\,dt$ with $B = \rho\,\dfrac{C_D A}{m}\sqrt{GM}$.`, t`Integrate: $2\left(\sqrt{a_0} - \sqrt{a_1}\right) = B\,t$, with radii $a = R_E + h$ in metres.`, t`$B = ${tex1(B)}\ \text{m}^{1/2}/\text{s}$; divide the time in seconds by 86 400.`],
          teach: 'Orbital decay at constant density is separable: 2(√a₀ − √a₁) = B t.',
          explain: t`$B = ${tex1(B)}\ \text{m}^{1/2}/\text{s}$; $\sqrt{a_0} - \sqrt{a_1} = ${fmt(Math.sqrt(a0) - Math.sqrt(a1), 3)}\ \text{m}^{1/2}$, so $t = ${tex1((2 * (Math.sqrt(a0) - Math.sqrt(a1))) / B)}$ s $\approx ${Math.round(days)}$ days. Real decay is faster than this model as the orbit sinks, because the density rises steeply with depth; and the density itself swings tenfold with solar activity — which is why the station is reboosted every few months.`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 1.6], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: ['1.15*cos(t)', '1.15*sin(t)'], t: [0, 6.2832], color: 'ink3', dash: true, width: 1.4 }],
              points: [{ x: 0, y: 0, r: 46, color: 'accent' }, { x: 0.813, y: 0.813, r: 5, color: 'gold', label: 'station', labelDx: 10, labelDy: -10 }],
              arrows: [{ from: [0.813, 0.813], to: [0.413, 1.213], color: 'good', width: 2.2, label: 'v', labelDx: -14, labelDy: -6 }, { from: [0.813, 0.813], to: [1.013, 0.613], color: 'bad', width: 2.2, label: 'drag', labelDx: 6, labelDy: 8 }],
            },
            caption: 'A station on a nearly circular orbit, slowed by a thin drag force opposite its velocity. Drag lowers the orbit — and the station then moves faster. Not to scale: the orbit is only 6% wider than Earth.',
          },
        };
      },
    }),
    expr({
      id: 'cp-tan', difficulty: 3,
      gen(r) {
        const c = r.pick([1, 2, 3, 0.5]);
        const ans = `(t + ${c})/(1 - ${c}*t)`;
        return {
          prompt: t`Solve $\dfrac{dy}{dt} = \dfrac{1 + y^2}{1 + t^2}$ with $y(0) = ${c === 0.5 ? t`\tfrac12` : c}$, and write $y$ without inverse trigonometric functions.`,
          answer: ans, answerTeX: t`y = \dfrac{t + ${frac(c)}}{1 - ${c === 1 ? '' : frac(c)}t}`, lhs: 'y',
          vars: { t: [-0.15, 0.15] },
          integrand: `(1 + (${ans})^2)/(1 + t^2)`,
          errors: [{ answer: `t + ${c}`, feedback: t`$\tan(A + B) \neq \tan A + \tan B$: use $\tan(A + B) = \dfrac{\tan A + \tan B}{1 - \tan A\tan B}$.` }],
          hints: [t`Separate: $\dfrac{dy}{1 + y^2} = \dfrac{dt}{1 + t^2}$, so $\arctan y = \arctan t + C$ with $C = \arctan ${c === 0.5 ? t`\tfrac12` : c}$.`, t`Take the tangent of both sides and use $\tan(A + B) = \dfrac{\tan A + \tan B}{1 - \tan A\tan B}$.`],
          teach: 'An implicit solution through inverse functions can often be turned explicit with an identity — and the identity shows where the solution blows up.',
          explain: t`$\arctan y = \arctan t + \arctan ${c === 0.5 ? t`\tfrac12` : c}$, so $y = \dfrac{t + ${frac(c)}}{1 - ${c === 1 ? '' : frac(c)}t}$. It blows up at $t = ${frac(1 / c)}$, where the two angles add up to $\pi/2$: the interval of validity is $t < ${frac(1 / c)}$.`,
          visual: { type: 'de-slopefield', params: { f: '(1 + y^2)/(1 + t^2)', x: [-2, 2], y: [-4, 4], grid: [17, 15], points: [{ x: 0, y: c, color: 'gold', label: 'start' }] }, caption: t`The slope field of $y' = (1 + y^2)/(1 + t^2)$ with the starting point.` },
        };
      },
    }),
    mcq({
      id: 'cp-negative', difficulty: 2,
      prompt: t`A student solves $\dfrac{dy}{dt} = y\cos t$, $y(0) = -2$: “$\ln y = \sin t + C$, so $C = \ln(-2)$, which does not exist — there is no solution.” What is the right conclusion?`,
      choices: [
        t`$\int \frac{dy}{y} = \ln|y|$, so $y = Ae^{\sin t}$ with $A$ of either sign: $y = -2e^{\sin t}$`,
        t`There is no solution: logarithms of negative numbers are undefined`,
        t`The solution is $y = e^{\sin t} - 3$`,
        t`The solution is $y = 2e^{-\sin t}$`,
      ],
      answer: 0,
      why: {
        1: t`The equation is perfectly well behaved at $y = -2$ (Picard’s theorem applies). The slip is in the integral, not the equation.`,
        2: t`Check it: $(e^{\sin t} - 3)' = \cos t\,e^{\sin t}$, but $y\cos t = (e^{\sin t} - 3)\cos t$. The constant must multiply, not add.`,
        3: t`At $t = 0$ that is $+2$, not $-2$.`,
      },
      hints: [t`What is $\int \dfrac{dy}{y}$ when $y$ is negative?`],
      teach: 'The integral of 1/y is ln|y|, so exponentiating gives a constant of either sign: negative solutions are not lost.',
      explain: t`$\ln|y| = \sin t + C$ gives $|y| = e^C e^{\sin t}$, so $y = Ae^{\sin t}$ with $A = \pm e^C$ (and $A = 0$ is the lost solution $y = 0$). $y(0) = A = -2$, so $y = -2e^{\sin t}$, which stays negative for ever.`,
      visual: { type: 'de-slopefield', params: { f: 'y*cos(t)', x: [0, 7], y: [-6, 3], grid: [19, 14], points: [{ x: 0, y: -2, color: 'gold', label: '(0, −2)' }] }, caption: t`The slope field of $y' = y\cos t$; the gold dot is the initial point. Solutions below the axis are mirror images of those above.` },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §1.3 Separable equations', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax University Physics Vol. 1, §6.4 Drag force and terminal speed', url: 'https://openstax.org/books/university-physics-volume-1/pages/6-4-drag-force-and-terminal-speed' },
    { label: 'D. A. Vallado, Fundamentals of Astrodynamics and Applications (orbital decay from drag)', url: 'https://celestrak.org/software/vallado-sw.php' },
  ],
});

// a number as TeX with three significant figures (×10ⁿ outside 0.001–100 000)
function tex1(x) {
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) { const [m, e] = x.toExponential(2).split('e'); return `${m}\\times10^{${+e}}`; }
  return fmt(x, 3);
}
