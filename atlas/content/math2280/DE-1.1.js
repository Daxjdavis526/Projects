// What a differential equation is: order, linear or not, ordinary or partial,
// and what it means for a function to solve one (substitute it and check).
import { lesson, mcq, multi, num, expr, match } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

// thousands separated for TeX: 12000 → 12{,}000
const th = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
// a coefficient with 1 silent; a number with a true minus sign for canvas labels
const co = (k) => (k === 1 ? '' : String(k));
const um = (x) => String(x).replace('-', '−');
// a signed term "+ 3t" / "- 3t" for building equations in TeX
const sgn = (c, body) => (c < 0 ? ` - ${-c === 1 && body ? '' : -c}${body}` : ` + ${c === 1 && body ? '' : c}${body}`);

export default lesson({
  id: 'math2280.DE-1.1',
  title: 'Order, linearity and solutions',
  minutes: 10, difficulty: 2,
  intro: t`A **differential equation** is a relation between an unknown function and its derivatives. Newton’s second law, a circuit’s loop rule and a rocket’s momentum balance are all of this kind. Three labels tell you what you are facing: the **order** (the highest derivative that appears), whether the equation is **linear**, and whether it is **ordinary** (one independent variable) or **partial** (several). A linear equation of order $n$ has the form

$$a_n(t)\,y^{(n)} + \cdots + a_1(t)\,y' + a_0(t)\,y = g(t)$$

in which $y$ and its derivatives appear only to the first power, multiplied by functions of $t$ alone. A **solution** is a function that makes the equation true at every $t$ in an interval — you check one by substituting it — and the solutions of an order-$n$ equation form a family with $n$ free constants, which $n$ initial conditions pin down.`,
  symbols: [
    { tex: t`y(t)`, text: 'the unknown function: a position, a speed, a temperature, a charge' },
    { tex: t`t`, text: 'the independent variable — here time, in seconds' },
    { tex: t`y^{(n)}`, text: t`the $n$th derivative $d^ny/dt^n$; the largest $n$ in the equation is its **order**` },
    { tex: t`a_k(t)`, text: t`the coefficients: functions of $t$ only — never of $y$ — if the equation is to be linear` },
    { tex: t`g(t)`, text: t`the forcing or source term; when $g = 0$ the linear equation is called **homogeneous**` },
  ],
  why: t`Linear equations obey superposition — add two solutions and you get another — which is why they can be solved in general. Nonlinear ones usually cannot, and are met with slope fields, phase portraits and numerical methods instead.`,
  visual: {
    type: 'oscillator',
    title: 'A pendulum: one nonlinear equation and its linear twin',
    lead: t`A pendulum obeys $\theta'' = -\dfrac{g}{L}\sin\theta$: second order and **nonlinear**, because of the $\sin\theta$. For small swings $\sin\theta \approx \theta$, which gives the **linear** equation $\theta'' = -\dfrac{g}{L}\,\theta$. The graph draws the solutions of both from the same release angle: solid for the true equation, dashed for its linear twin.`,
    tasks: [
      'Release at 10°: the two swings stay together, because sin θ ≈ θ for small angles.',
      'Release at 90°: the real pendulum falls behind — its period is about 18% longer than the linear one.',
      'Release at 170°: it lingers near the top before falling, something no linear equation can do.',
    ],
    params: { kind: 'pendulum', L: 1, theta0: 90 },
    caption: t`Dashed: the linear (small-angle) solution $\theta_0\cos\omega_0 t$. Solid: the nonlinear equation $\theta'' = -(g/L)\sin\theta$, integrated numerically. No air drag unless you add damping; the pendulum drawing is not to scale.`,
  },
  example: {
    prompt: t`A sounding rocket of initial mass $m_0 = 500$ kg burns propellant at $\dot m = 5.0$ kg/s, with exhaust speed $v_e = 2000$ m/s, climbing straight up. Ignoring drag, its speed obeys

$$\frac{dv}{dt} = \frac{v_e\,\dot m}{m_0 - \dot m\,t} - g.$$

Classify this equation, show that $v(t) = v_e\ln\dfrac{m_0}{m_0 - \dot m\,t} - g\,t$ solves it with $v(0) = 0$, and find the speed at burnout, after 60 s.`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 84], y: [0, 2000], xlabel: 't (s)', ylabel: 'v (m/s)',
        curves: [
          { fn: '2000*ln(500/(500 - 5x))', domain: [0, 60], color: 'ink3', dash: true, width: 1.8, label: 'no gravity', labelAt: 40, labelDx: -78, labelDy: -14 },
          { fn: '2000*ln(500/(500 - 5x)) - 9.8x', domain: [0, 60], color: 'accent', label: 'v(t)', labelAt: 45 },
        ],
        points: [
          { x: 60, y: 2000 * Math.log(2.5) - 588, color: 'gold', label: 'burnout', labelDx: 10, labelDy: 14 },
          { x: 63, y: 2000 * Math.log(2.5) - 294, color: 'bad', r: 0.01, label: 'gravity loss, 588 m/s', labelDx: 6, labelDy: 0 },
        ],
        arrows: [{ from: [62, 2000 * Math.log(2.5)], to: [62, 2000 * Math.log(2.5) - 588], color: 'bad', width: 1.8 }],
      },
      caption: t`The solution (blue) and the same burn with no gravity (dashed): the gap at burnout is $g\,t = 588$ m/s. Air drag is ignored, which flatters the rocket.`,
    },
    steps: [
      { label: 'Classify', text: t`The highest derivative is $dv/dt$, so the equation is **first order**. The unknown $v$ does not even appear on the right, so the equation is (trivially) **linear**. Time $t$ appears explicitly, so it is **not autonomous**. One independent variable: an **ordinary** differential equation.` },
      { label: 'Where it comes from', text: t`Newton’s second law for a body losing mass: $m\,\dfrac{dv}{dt} = \dot m\,v_e - m g$ — thrust minus weight — with $m(t) = m_0 - \dot m\,t$. Divide by $m$.` },
      { label: 'Substitute the candidate', text: t`$\dfrac{d}{dt}\Big[v_e\ln m_0 - v_e\ln(m_0 - \dot m t) - g t\Big] = -v_e\,\dfrac{-\dot m}{m_0 - \dot m t} - g = \dfrac{v_e\,\dot m}{m_0 - \dot m t} - g$ ✓ — the right side of the equation, at every $t$ before the propellant runs out.` },
      { label: 'Initial condition', text: t`$v(0) = v_e\ln 1 - 0 = 0$ ✓. Adding any constant would still satisfy the equation — the general solution is a one-constant family, as a first-order equation’s should be — but only $C = 0$ starts from rest.` },
      { label: 'Burnout', text: t`At $t = 60$ s the mass is $500 - 300 = 200$ kg, so $v = 2000\ln\dfrac{500}{200} - 9.8 \times 60 = ${nice(2000 * Math.log(2.5), 4)} - 588 \approx ${Math.round(2000 * Math.log(2.5) - 588)}$ m/s.` },
      { label: 'Sense check', text: t`With $g = 0$ this is Tsiolkovsky’s rocket equation, $\Delta v = v_e\ln(m_0/m)$. Gravity costs $g\,t_\text{burn} = 588$ m/s — the **gravity loss** that makes slow burns wasteful. Units: $v_e\dot m/m$ is (m/s)(kg/s)/kg = m/s², an acceleration ✓.` },
    ],
    answer: t`First order, linear, not autonomous; $v(60\ \text{s}) \approx ${Math.round(2000 * Math.log(2.5) - 588)}$ m/s.`,
  },
  practice: [
    mcq({
      id: 'ode-or-pde', difficulty: 1,
      prompt: t`Which of these is a **partial** differential equation?`,
      choices: [
        t`$\dfrac{\partial T}{\partial t} = \alpha\,\dfrac{\partial^2 T}{\partial x^2}$`,
        t`$m\,\dfrac{d^2x}{dt^2} = -k\,x$`,
        t`$EI\,\dfrac{d^4w}{dx^4} = q(x)$`,
        t`$\dfrac{dT}{dt} = -k\,(T - T_a)$`,
      ],
      answer: 0,
      why: {
        1: t`One unknown, $x(t)$, of one variable: second order, but ordinary.`,
        2: t`The beam’s deflection $w(x)$ depends on the single variable $x$ — ordinary, of fourth order, even though $x$ is a position rather than a time.`,
        3: t`Newton’s law of cooling: $T(t)$ depends on time alone, so the equation is ordinary.`,
      },
      hints: ['Ask of each unknown function: how many independent variables does it depend on?', 'A partial derivative ∂ is needed only when the unknown depends on two or more variables.'],
      teach: 'An ordinary differential equation’s unknown depends on one variable; a partial one’s depends on several, so its derivatives are partial derivatives.',
      explain: t`In the heat equation the temperature $T(x, t)$ depends on position along the rod **and** on time, so its derivatives are partial. Every other unknown here — $x(t)$, $w(x)$, $T(t)$ — depends on one variable. This course is about the ordinary kind.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 1], y: [0, 1.15], xlabel: 'x, position along the rod', ylabel: 'T',
          curves: [[0, 'accent'], [0.03, 'teal'], [0.08, 'good'], [0.2, 'gold']].map(([tt, color]) => ({ fn: `exp(-pi^2*${tt})*sin(pi*x)`, color, label: `t = ${tt}`, labelAt: 0.5, labelDx: -16, labelDy: -10 })),
        },
        caption: t`The temperature along a rod at four moments: $T$ depends on position **and** time, two independent variables. Arbitrary units; both ends held at $T = 0$.`,
      },
    }),
    mcq({
      id: 'order-not-power', difficulty: 1,
      prompt: t`What is the **order** of $\left(\dfrac{dy}{dt}\right)^{3} + t^2\,y = \cos t$?`,
      choices: ['First order', 'Third order', 'Second order', 'It has no order, because it is nonlinear'],
      answer: 0,
      why: {
        1: t`The 3 is a **power** of the first derivative, not a third derivative: $(y')^3 \neq y'''$. Order counts derivatives, not exponents.`,
        2: t`No second derivative appears; $t^2$ is a coefficient multiplying $y$.`,
        3: 'Every differential equation has an order. This one is first order and nonlinear — the cube is what makes it nonlinear.',
      },
      hints: ['Find the highest derivative of y in the equation, and ignore any powers it is raised to.'],
      teach: 'The order is the highest derivative that appears; powers of derivatives make an equation nonlinear but do not raise its order.',
      explain: t`Only $dy/dt$ appears, so the equation is first order. Solved for the slope it reads $y' = \sqrt[3]{\cos t - t^2 y}$: one slope at each point $(t, y)$, as for every first-order equation. Cubing $y'$ makes it nonlinear.`,
      visual: {
        type: 'de-slopefield',
        params: { f: 'cbrt(cos(t) - t^2*y)', x: [-3, 3], y: [-2, 2], seeds: [[0, -1], [0, 0], [0, 1]], seedColor: 'accent2', grid: [19, 13] },
        caption: t`Solved for the slope, $y' = \sqrt[3]{\cos t - t^2 y}$: a first-order equation assigns one slope to each point. Three solutions are traced through it.`,
      },
    }),
    multi({
      id: 'which-linear', difficulty: 2,
      prompt: 'Which of these equations are **linear**? Select all that are.',
      choices: [
        t`$t^2y'' + t\,y' + (t^2 - 4)\,y = 0$`,
        t`$\theta'' + \dfrac{g}{L}\sin\theta = 0$`,
        t`$y''' - e^{t}\,y' = \ln t$`,
        t`$y\,y' = t$`,
        t`$v' = g - \dfrac{c}{m}\,v^2$`,
      ],
      answer: [0, 2],
      why: {
        1: t`$\sin\theta$ is not first power in $\theta$: the pendulum equation is nonlinear (only its small-angle version is linear).`,
        3: t`$y\,y'$ multiplies the unknown by its own derivative.`,
        4: t`Quadratic drag: $v^2$ is not first power in $v$.`,
      },
      hints: [t`Linear: $y$ and its derivatives appear only to the first power, multiplied by functions of $t$ — never multiplied together, never inside $\sin$, $\exp$ or a square.`],
      teach: 'The coefficients may be any functions of t — t², eᵗ, ln t — only the unknown and its derivatives must appear linearly.',
      explain: t`Bessel’s equation $t^2y'' + ty' + (t^2 - 4)y = 0$ has coefficients $t^2$, $t$ and $t^2 - 4$, all functions of $t$, so it is linear; so is $y''' - e^t y' = \ln t$ (third order, with forcing $\ln t$). The pendulum ($\sin\theta$), $y\,y'$ and quadratic drag ($v^2$) are nonlinear.`,
      visual: {
        type: 'graph',
        params: {
          x: [-3, 3], y: [-2, 2], xlabel: 'θ (rad)', ylabel: '',
          curves: [{ fn: 'x', color: 'ink3', dash: true, width: 1.8, label: 'θ', labelAt: 1.75, labelDx: 8, labelDy: 0 }, { fn: 'sin(x)', color: 'accent', label: 'sin θ', labelAt: 2.3, labelDy: -12 }],
        },
        caption: t`$\sin\theta$ against the straight line $\theta$: they agree only near $\theta = 0$. That is why a small swing obeys a linear equation and a large one does not.`,
      },
    }),
    mcq({
      id: 'superposition-fails', difficulty: 2, kind: 'error',
      prompt: t`A boat coasting with its engine off is slowed by quadratic water drag: $v' = -k\,v^2$. For any starting speed $v_0$, the function $v = \dfrac{v_0}{1 + k v_0 t}$ solves it, so $v_1 = \dfrac{2}{1 + 2kt}$ and $v_2 = \dfrac{1}{1 + kt}$ (in m/s) are both solutions. A student argues that $v_1 + v_2$, starting at 3 m/s, must be a solution too, “by superposition”. What is wrong?`,
      choices: [
        t`The equation is nonlinear: substituting $v_1 + v_2$ leaves an extra $2k\,v_1v_2$, because $(v_1 + v_2)^2 \neq v_1^2 + v_2^2$`,
        'Nothing: the sum of two solutions is always a solution',
        t`Only the difference $v_1 - v_2$ is a solution`,
        'Superposition works, but only for two solutions with the same starting speed',
      ],
      answer: 0,
      why: {
        1: 'That holds only for linear homogeneous equations. Here the unknown is squared.',
        2: t`The difference fails for the same reason: $(v_1 - v_2)^2 \neq v_1^2 + v_2^2$.`,
        3: 'Starting values have nothing to do with it; the square in the equation is the problem.',
      },
      hints: [t`Substitute $v = v_1 + v_2$ into both sides and use $v_1' = -k v_1^2$ and $v_2' = -k v_2^2$.`, t`Expand $(v_1 + v_2)^2$: the cross term $2v_1v_2$ has nothing to cancel against.`],
      teach: 'Superposition — sums of solutions are solutions — holds for linear homogeneous equations and fails for nonlinear ones.',
      explain: t`Left side: $(v_1 + v_2)' = -k v_1^2 - k v_2^2$. Right side: $-k(v_1 + v_2)^2 = -k v_1^2 - 2k v_1 v_2 - k v_2^2$. They differ by $2k\,v_1v_2 \neq 0$. The true solution from 3 m/s is $\dfrac{3}{1 + 3kt}$: drag that grows like $v^2$ does not treat two speeds separately.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 4], y: [-5, 0.3], xlabel: 't (s)', ylabel: 'm/s²', axesAt: 'edge',
          curves: [
            { fn: '-2/(1 + x)^2 - 0.5/(1 + 0.5x)^2', color: 'accent', label: 'left side (v₁ + v₂)′', labelAt: 2.4, labelDx: 0, labelDy: -16 },
            { fn: '-0.5*(2/(1 + x) + 1/(1 + 0.5x))^2', color: 'warn', dash: true, label: 'right side −k(v₁ + v₂)²', labelAt: 0.5, labelDx: 10, labelDy: 6 },
          ],
        },
        caption: t`With $k = 0.5\ \text{m}^{-1}$: the two sides of the equation for the candidate $v_1 + v_2$. A solution would make the curves coincide.`,
      },
    }),
    num({
      id: 'two-constants', difficulty: 2,
      gen(r) {
        const w = r.int(2, 5), x0 = r.pick([0.1, 0.15, 0.2, -0.1]), v0 = r.pick([0.6, 0.9, 1.2, -0.8, -1.5]);
        const c2 = v0 / w;
        const errors = [
          { value: v0, feedback: t`Differentiating $\sin(${w}t)$ brings out a factor ${w}: $x'(0) = ${w}c_2$, so divide the velocity by ${w}.` },
          { value: x0, feedback: t`$c_2$ is fixed by the starting **velocity**; the starting position fixes $c_1$.` },
          { value: v0 * w, feedback: t`$x'(0) = ${w}c_2$: divide by ${w}, do not multiply.` },
        ].filter((e) => Math.abs(e.value - c2) > 0.02 * Math.abs(c2));
        const slopes = [-2, -1, 0, 1, 2].map((s) => s * Math.abs(v0));
        const amp = 1.15 * Math.max(...slopes.map((s) => Math.hypot(x0, s / w)));
        return {
          prompt: t`A mass on a spring obeys $x'' + ${w * w}\,x = 0$, whose general solution is $x = c_1\cos(${w}t) + c_2\sin(${w}t)$. It starts at $x(0) = ${x0}$ m, moving at $x'(0) = ${v0}$ m/s. Find $c_2$.`,
          answer: c2, units: 'm', tol: { rel: 0.01 },
          errors,
          hints: ['Differentiate the general solution, then set t = 0.', t`$x'(t) = -${w}c_1\sin(${w}t) + ${w}c_2\cos(${w}t)$, so $x'(0) = ${w}c_2$.`],
          teach: 'A second-order equation needs two initial conditions: the starting position fixes one constant and the starting velocity the other.',
          explain: t`$x(0) = c_1 = ${x0}$ m, and $x'(0) = ${w}c_2 = ${v0}$ m/s gives $c_2 = ${v0}/${w} = ${nice(c2, 3)}$ m. Units: $c_2$ multiplies a pure number, $\sin(${w}t)$, so it is a length.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 3], y: [-amp, amp], xlabel: 't (s)', ylabel: 'x (m)',
              curves: slopes.map((s) => ({ fn: `${x0}*cos(${w}x) + ${s / w}*sin(${w}x)`, color: 'ink3', dash: true, width: 1.3 })),
              arrows: [{ from: [0, x0], to: [0.12, x0 + 0.12 * v0], color: 'gold', width: 2.6 }],
              points: [{ x: 0, y: x0, color: 'gold', label: `x(0) = ${um(x0)} m`, labelDx: 8, labelDy: x0 > 0 ? -14 : 14 }],
            },
            caption: t`Grey: solutions through the same starting point with five different starting velocities — position alone does not decide the motion. Gold: the starting slope, $x'(0) = ${v0}$ m/s.`,
          },
        };
      },
    }),
    expr({
      id: 'integrate-twice', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = r.int(1, 4), y0 = r.intExcept(-3, 3, [0]), v0 = r.intExcept(-4, 4, [0]);
        const ans = `${a}t^3 - ${b}t^2 + (${v0})t + (${y0})`;
        return {
          prompt: t`Solve $y'' = ${6 * a}t - ${2 * b}$ with $y(0) = ${y0}$ and $y'(0) = ${v0}$.`,
          answer: ans, answerTeX: t`y = ${a === 1 ? '' : a}t^3 - ${b === 1 ? '' : b}t^2${sgn(v0, 't')}${sgn(y0, '')}`, lhs: 'y',
          vars: { t: [-2, 2] },
          errors: [
            { answer: `${a}t^3 - ${b}t^2 + (${y0})`, feedback: t`You lost the first constant: integrating $y''$ gives $y' = ${3 * a}t^2 - ${2 * b}t + c_1$, and $y'(0) = ${v0}$ makes $c_1 = ${v0}$, which integrates to $${v0 === 1 ? '' : v0 === -1 ? '-' : v0}t$.` },
            ...(y0 !== v0 ? [{ answer: `${a}t^3 - ${b}t^2 + (${y0})t + (${v0})`, feedback: t`The constants are swapped: $y'(0)$ fixes the coefficient of $t$ and $y(0)$ the constant term.` }] : []),
            { answer: `${6 * a}t^3 - ${2 * b}t^2 + (${v0})t + (${y0})`, feedback: t`Integrate the powers properly: $\int ${6 * a}t\,dt = ${3 * a}t^2$, then $\int ${3 * a}t^2\,dt = ${co(a)}t^3$.` },
          ],
          hints: [t`Integrate once: $y' = ${3 * a}t^2 - ${2 * b}t + c_1$. Use $y'(0) = ${v0}$.`, t`Integrate again: $y = ${co(a)}t^3 - ${co(b)}t^2${sgn(v0, 't')} + c_2$. Use $y(0) = ${y0}$.`],
          teach: 'Each integration brings one constant, so a second-order equation needs two conditions — one for each.',
          explain: t`$y' = ${3 * a}t^2 - ${2 * b}t + c_1$ with $c_1 = y'(0) = ${v0}$; then $y = ${co(a)}t^3 - ${co(b)}t^2${sgn(v0, 't')} + c_2$ with $c_2 = y(0) = ${y0}$. Check: $y'' = ${6 * a}t - ${2 * b}$ ✓.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.5, 2], y: [y0 - 3, y0 + 3], xlabel: 't', ylabel: 'y', axesAt: 'edge',
              arrows: [{ from: [0, y0], to: [0.5, y0 + 0.5 * v0], color: 'gold', width: 2.6, label: `slope y′(0) = ${um(v0)}`, labelDx: 8, labelDy: v0 > 0 ? -6 : 10 }],
              points: [{ x: 0, y: y0, color: 'gold', label: `y(0) = ${um(y0)}`, labelDx: -66, labelDy: -12 }],
            },
            caption: t`The initial data: the solution starts at height $${y0}$ with slope $${v0}$. Two conditions for the two constants of a second-order equation.`,
          },
        };
      },
    }),
    match({
      id: 'classify', difficulty: 2,
      prompt: 'Match each equation with its description.',
      left: [
        t`$L\,q'' + R\,q' + \dfrac{q}{C} = V_0\cos\omega t$ (a driven circuit)`,
        t`$\dfrac{dP}{dt} = rP\left(1 - \dfrac{P}{K}\right)$ (a population)`,
        t`$\theta'' + 0.2\,\theta' + 9.8\sin\theta = 0$ (a damped pendulum)`,
        t`$y' + \dfrac{2}{t}\,y = t^2$`,
      ],
      right: ['second order, linear, forced', 'first order, nonlinear, autonomous', 'second order, nonlinear, autonomous', 'first order, linear, not autonomous', 'first order, linear, autonomous'],
      answer: [0, 1, 2, 3],
      hints: ['For each, find the highest derivative, then look for products, powers or functions of the unknown.', 'Autonomous means the independent variable t does not appear explicitly.'],
      teach: 'Order, linearity and autonomy are read straight off the equation, before any solving.',
      explain: t`The circuit is second order and linear, with forcing $V_0\cos\omega t$. The logistic equation has $P^2$, so it is nonlinear, and no explicit $t$: autonomous. The pendulum has $\sin\theta$: nonlinear and autonomous. $y' + \frac2t y = t^2$ is linear with coefficients that depend on $t$, so it is not autonomous.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-skydiver', difficulty: 2, transfer: true,
      prompt: t`A skydiver’s speed obeys $m\,\dfrac{dv}{dt} = mg - \tfrac12\rho C_D A\,v^2$, with mass $m$, gravity $g$, air density $\rho$, drag coefficient $C_D$ and frontal area $A$ all constant. Which description is right?`,
      choices: [
        'First order, nonlinear, autonomous',
        'Second order, nonlinear, autonomous',
        t`First order, linear — every coefficient ($m$, $g$, $\rho$, $C_D$, $A$) is a constant`,
        t`First order, nonlinear, not autonomous, because $v$ changes with time`,
      ],
      answer: 0,
      why: {
        1: t`The unknown is the speed $v$, and its first derivative is the acceleration: first order. (In terms of the position it would be second order.)`,
        2: t`Constant coefficients do not make an equation linear; the $v^2$ does make it nonlinear.`,
        3: t`Every solution changes with time. Autonomous means $t$ does not appear **explicitly** on the right, and here it does not.`,
      },
      hints: ['Identify the unknown function first: it is v, not the position.', t`Then look for powers of $v$, and for an explicit $t$.`],
      teach: 'Classify by the unknown actually in the equation: here the speed, whose equation is first order and nonlinear.',
      explain: t`The highest derivative of $v$ is $dv/dt$ (first order); $v^2$ makes it nonlinear; the right side depends on $v$ alone (autonomous). That autonomy is why the terminal speed, where the right side vanishes, is an equilibrium — a constant solution.`,
      visual: { type: 'mech-drag', params: { m: 80, CdA: 0.42, time: 6, T: 20 }, caption: 'An 80 kg skydiver six seconds into the fall: drag (gold) has grown to about 60% of the weight. Forces to scale; quadratic drag at sea-level air density.' },
    }),
    mcq({
      id: 'cp-ivp', difficulty: 2,
      prompt: t`Which function solves $y'' + 4y = 0$ with $y(0) = 3$ and $y'(0) = -4$?`,
      choices: [t`$y = 3\cos 2t - 2\sin 2t$`, t`$y = 3\cos 2t - 4\sin 2t$`, t`$y = 3\cos 4t - \sin 4t$`, t`$y = 3 - 4t$`],
      answer: 0,
      why: {
        1: t`It satisfies the equation, but $y'(0) = 2\times(-4) = -8$: the chain rule doubles the sine’s coefficient.`,
        2: t`Its initial values are right, but $y'' = -16y$ for it, not $-4y$: it solves a different equation.`,
        3: t`It has the right initial values, but $y'' = 0 \neq -4y$: it does not satisfy the equation at all.`,
      },
      hints: ['A solution of the IVP must pass two tests: the equation itself, and both initial conditions.', t`For $y = a\cos 2t + b\sin 2t$: $y(0) = a$ and $y'(0) = 2b$.`],
      teach: 'A solution of an initial-value problem must satisfy the equation at every t and every initial condition.',
      explain: t`For $y = 3\cos 2t - 2\sin 2t$: $y'' = -12\cos 2t + 8\sin 2t = -4y$ ✓, $y(0) = 3$ ✓ and $y'(0) = -2\times 2 = -4$ ✓. Each other candidate fails one test.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 2], y: [-4, 4.5], xlabel: 't', ylabel: 'y',
          arrows: [{ from: [0, 3], to: [0.45, 1.2], color: 'gold', width: 2.6, label: 'slope −4', labelDx: 8, labelDy: 8 }],
          points: [{ x: 0, y: 3, color: 'gold', label: 'y(0) = 3', labelDx: 8, labelDy: -12 }],
        },
        caption: 'The initial data: the solution must start at height 3 heading down with slope −4 — and obey the equation afterwards.',
      },
    }),
    num({
      id: 'cp-hover', difficulty: 3, transfer: true,
      gen(r) {
        const body = r.pick([['the Moon', 1.62], ['Mars', 3.71]]), g = body[1];
        const ve = r.pick([2800, 3000, 3100]), m0 = r.pick([12000, 15000, 16000]), frac = r.pick([0.4, 0.5, 0.55]);
        const mp = Math.round(m0 * frac), md = m0 - mp;
        const T = (ve / g) * Math.log(m0 / md);
        const lin = (mp * ve) / (m0 * g);
        return {
          prompt: t`A lander hovers above ${body[0]} ($g = ${g}\ \text{m/s}^2$). To hover, its thrust $v_e\,|dm/dt|$ must equal its weight $m g$ at every instant, so its mass obeys $\dfrac{dm}{dt} = -\dfrac{g}{v_e}\,m$ — first order, linear, homogeneous — whose solution is $m(t) = m_0\,e^{-g t/v_e}$. With $m_0 = ${th(m0)}$ kg, of which ${mp.toLocaleString('en-US')} kg is propellant, and $v_e = ${ve}$ m/s, how long can it hover?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: lin, feedback: 'That assumes it keeps burning at its starting rate. As propellant burns the lander gets lighter, needs less thrust, and burns more slowly — so the mass decays exponentially.' }].filter((e) => Math.abs(e.value - T) > 0.02 * T),
          hints: [t`Hovering ends when the propellant is gone: $m(t) = ${md.toLocaleString('en-US')}$ kg.`, t`Solve $${md} = ${m0}\,e^{-${g}t/${ve}}$: $\;t = \dfrac{v_e}{g}\ln\dfrac{m_0}{m_\text{dry}}$.`],
          teach: 'An equation with no forcing whose rate is proportional to the amount decays exponentially; the event you want is a value of the unknown.',
          explain: t`$t = \dfrac{${ve}}{${g}}\ln\dfrac{${m0}}{${md}} = ${fmt(ve / g, 4)} \times ${fmt(Math.log(m0 / md), 3)} \approx ${fmt(T, 3)}$ s, about ${Math.round(T / 60)} minutes — an upper bound. Real landers keep only a minute or two of hover in reserve: most of their propellant goes into braking from orbital speed.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 2.5], y: [0, 1.08], xlabel: 'g t / vₑ', ylabel: 'm / m₀',
              curves: [{ fn: 'exp(-x)', color: 'accent', label: 'm / m₀', labelAt: 0.9 }],
            },
            caption: t`Every hovering lander follows this one curve once mass is measured in units of $m_0$ and time in units of $v_e/g$: its mass falls fast while it is heavy and slowly once it is light. No drag, constant $v_e$.`,
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §0.2–0.3 (introduction and classification)', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'OpenStax Calculus Vol. 2, §4.1 Basics of differential equations', url: 'https://openstax.org/books/calculus-volume-2/pages/4-1-basics-of-differential-equations' },
    { label: 'OpenStax University Physics Vol. 1, §9.7 Rocket propulsion', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-7-rocket-propulsion' },
  ],
});
