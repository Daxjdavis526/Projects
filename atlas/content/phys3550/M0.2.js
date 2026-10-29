// Differential equations a mechanic needs: Newton's second law as a
// second-order ODE needing two initial conditions per coordinate; first-order
// drag problems (linear: exponential approach; quadratic: tanh), the v dv/dx
// trick for a force that depends on speed, linearity and superposition, and
// complex exponentials as the way to solve linear constant-coefficient
// equations. Taylor ch. 2 and the toolkit of ch. 5.
import { lesson, mcq, multi, num, expr } from '../../src/core/content.js';
import { sci, r6, pl, gpic, seg, lab, G } from './_cm.js';

const t = String.raw;

// Taylor's quadratic-drag constant for a sphere in air: c = γD², γ = 0.25 N·s²/m⁴
const GAMMA = 0.25;

// the worked example: a belly-down skydiver, c = ½ρC_dA ≈ 0.25 kg/m
const EX = (() => {
  const m = 80, c = 0.25, vt = Math.sqrt((m * G) / c);
  const t90 = (vt * Math.atanh(0.9)) / G, x90 = ((vt * vt) / G) * Math.log(Math.cosh((G * t90) / vt));
  const tlin = (vt * Math.log(10)) / G;
  return { m, c, vt, t90, x90, tlin };
})();

// a picture of a falling body with its weight and drag
const fallPic = (caption, { drag = 'drag  cv²', weight = 'weight  mg', ratio = 0.6 } = {}) => gpic({
  x: [-2, 2], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
  curves: [{ param: ['0.3*cos(t)', '0.3*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 }],
  arrows: [{ from: [0, -0.3], to: [0, -1.45], color: 'accent', label: weight, labelDx: 8, labelDy: 0 }, { from: [0, 0.3], to: [0, 0.3 + 1.15 * ratio], color: 'warn', label: drag, labelDx: 8, labelDy: 0 }, { from: [-0.9, 0.6], to: [-0.9, -0.4], color: 'good', label: 'v', labelDx: -16, labelDy: 0 }],
}, caption, 'A falling ball with its weight pointing down and drag pointing up');

export default lesson({
  id: 'phys3550.M0.2',
  title: 'Differential equations a mechanic needs',
  minutes: 16, difficulty: 3,
  intro: t`Newton's second law is a **second-order differential equation**: given the force, it fixes the acceleration, and the motion follows once you know where the particle starts and how fast. Three tools solve almost everything in this course. **Separation of variables** handles a force that depends only on velocity, such as drag. **Linearity** lets you add solutions. And for a linear equation with constant coefficients, a guess $e^{rt}$ — with $r$ complex if need be — turns calculus into algebra. They are the mechanic's slice of [first-order equations](#/lesson/math2280.DE-2.1) and [constant-coefficient equations](#/lesson/math2280.DE-3.2).`,
  equation: t`m\ddot{\vec r} = \vec F(\vec r, \dot{\vec r}, t), \qquad \vec r(0) = \vec r_0,\ \ \dot{\vec r}(0) = \vec v_0`,
  symbols: [
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '\\vec r,\\ \\dot{\\vec r},\\ \\ddot{\\vec r}', text: 'position (m), velocity (m/s) and acceleration (m/s²) — each dot is one time derivative' },
    { tex: '\\vec F', text: 'the net force, in N; it may depend on position (a spring), velocity (drag) and time (a drive)' },
    { tex: '\\vec r_0,\\ \\vec v_0', text: 'the initial conditions: six numbers in three dimensions, two per coordinate, because the equation is second order' },
  ],
  why: t`Every model in mechanics is a differential equation; recognizing its type — order, linear or not, what the force depends on — tells you which tool solves it.`,
  visual: {
    type: 'graph',
    title: 'Falling with linear and quadratic drag',
    lead: t`A body falls from rest. Grey: no air. Blue: linear drag, $v = v_\text{ter}(1 - e^{-gt/v_\text{ter}})$. Gold: quadratic drag, $v = v_\text{ter}\tanh(gt/v_\text{ter})$. Both are tuned to the same terminal speed.`,
    tasks: [
      t`Set $v_\text{ter} = 20$ m/s. The quadratic curve reaches 90% of it at $t = (v_\text{ter}/g)\,\text{artanh}\,0.9 \approx 3.0$ s; the linear one needs $(v_\text{ter}/g)\ln 10 \approx 4.7$ s.`,
      t`Early on all three curves agree: while $v \ll v_\text{ter}$ drag is negligible and $v \approx gt$.`,
      t`Raise $v_\text{ter}$: everything stretches — the time to approach terminal speed scales as $v_\text{ter}/g$.`,
    ],
    params: {
      aspect: 'wide', x: [0, 12], y: [0, 70], xlabel: 't (s)', ylabel: 'v (m/s)',
      sliders: [{ key: 'vt', label: 'Terminal speed $v_\\text{ter}$', min: 5, max: 60, step: 1, value: 20, unit: '\\mathrm{m/s}', explain: 'Where weight and drag balance: $mg/b$ for linear drag, $\\sqrt{mg/c}$ for quadratic.' }],
      curves: [
        { fn: '9.8*x', color: 'ink3', dash: true, label: 'no air', labelAt: 6.2 },
        { fn: 'vt*(1 - e^(-9.8*x/vt))', color: 'accent', width: 2.4, label: 'linear', labelAt: 10, labelDy: 14 },
        { fn: 'vt*tanh(9.8*x/vt)', color: 'gold', width: 2.4, label: 'quadratic', labelAt: 10, labelDy: -12 },
      ],
      hlines: [{ y: 'vt', color: 'ink3' }],
      readouts: [{ label: 'time to 90% (quadratic)', expr: 'vt*1.47222/9.8', unit: 's', digits: 3 }, { label: 'time to 90% (linear)', expr: 'vt*2.302585/9.8', unit: 's', digits: 3 }],
    },
    caption: t`Constant $g = 9.8$ m/s² and constant drag coefficients; the dashed line is the terminal speed. Real drag is closer to quadratic for anything bigger than a dust grain moving faster than a few cm/s.`,
  },
  example: {
    prompt: t`A belly-down skydiver of mass ${EX.m} kg feels air drag $f = cv^2$ with $c = \tfrac12\rho C_dA \approx ${EX.c}$ kg/m. Find the terminal speed, solve for $v(t)$ from rest, and find when and how far below the aircraft the diver reaches 90% of terminal speed.`,
    visual: fallPic(t`Downward is positive. Weight $mg$ is fixed; drag $cv^2$ grows until the two balance (arrows not to scale).`),
    steps: [
      { label: 'Write the law', text: t`Down positive: $m\dot v = mg - cv^2$. First order in $v$, **nonlinear** (the $v^2$), and the force depends on $v$ alone — so it separates.` },
      { label: 'Terminal speed', text: t`$\dot v = 0$ when $v = v_\text{ter} = \sqrt{mg/c} = \sqrt{${EX.m}\times9.8/${EX.c}} = ${sci(EX.vt)}$ m/s (about ${Math.round(EX.vt * 3.6)} km/h).` },
      { label: 'Separate', text: t`Rewrite as $\dot v = \dfrac{g}{v_\text{ter}^2}(v_\text{ter}^2 - v^2)$, so $\displaystyle\int_0^v \frac{dv'}{v_\text{ter}^2 - v'^2} = \frac{g}{v_\text{ter}^2}\,t$. The left side is $\tfrac{1}{v_\text{ter}}\,\text{artanh}(v/v_\text{ter})$.` },
      { label: 'Solve for v', text: t`$v(t) = v_\text{ter}\tanh\!\left(\dfrac{gt}{v_\text{ter}}\right)$. For small $t$, $\tanh u \approx u$ gives $v \approx gt$ — free fall, as it must.` },
      { label: 'Ninety per cent', text: t`$\tanh u = 0.9$ at $u = \text{artanh}\,0.9 = 1.472$, so $t_{90} = 1.472\,v_\text{ter}/g = ${sci(EX.t90)}$ s.` },
      { label: 'Distance', text: t`Integrate once more: $x = \dfrac{v_\text{ter}^2}{g}\ln\cosh\dfrac{gt}{v_\text{ter}}$, so $x_{90} = ${sci(EX.x90)}$ m.` },
      { label: 'Sense check', text: t`A linear-drag model with the same $v_\text{ter}$ would need $(v_\text{ter}/g)\ln 10 = ${sci(EX.tlin)}$ s: the $v^2$ law bites harder near terminal speed, so the approach is faster.` },
    ],
    answer: t`$v_\text{ter} = ${sci(EX.vt)}$ m/s; $v = v_\text{ter}\tanh(gt/v_\text{ter})$; 90% after $${sci(EX.t90)}$ s and $${sci(EX.x90)}$ m.`,
  },
  practice: [
    num({
      id: 'coast', difficulty: 2,
      gen(r) {
        const m = r.pick([200, 300, 400]), b = r.pick([40, 60, 80]), v0 = r.pick([2, 3, 4]), tt = r.pick([3, 5, 8]);
        const tau = m / b, v = v0 * Math.exp(-tt / tau);
        return {
          prompt: t`A ${m} kg dinghy coasts after its motor cuts out at ${v0} m/s. At this low speed water drag is close to linear, $f = -bv$ with $b = ${b}$ kg/s. What is its speed ${tt} s later?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: v0 * Math.exp(-tt * tau), feedback: t`The time constant is $\tau = m/b$, not $b/m$: a heavier boat coasts longer.` }, ...(v0 - (b / m) * v0 * tt > 0 ? [{ value: v0 - (b / m) * v0 * tt, feedback: t`You kept the initial deceleration $bv_0/m$ constant. Drag weakens as the boat slows, so the decay is exponential.` }] : [])],
          hints: [t`$m\dot v = -bv$ separates: $dv/v = -(b/m)\,dt$.`, t`$v = v_0e^{-t/\tau}$ with $\tau = m/b$.`],
          teach: t`A force proportional to $-v$ gives exponential decay with time constant $\tau = m/b$.`,
          explain: t`$\tau = ${m}/${b} = ${sci(tau)}$ s, so $v = ${v0}\,e^{-${tt}/${sci(tau)}} = ${sci(v)}$ m/s.`,
          visual: gpic({ x: [0, r6(3 * tau)], y: [0, v0 * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${v0}*e^(-x/${r6(tau)})`, color: 'accent', width: 2.4 }], points: [{ x: 0, y: v0, color: 'accent', label: `v₀ = ${v0} m/s` }] }, t`The shape of an exponential coast-down, over three time constants (no value marked).`, 'A decaying exponential speed curve'),
        };
      },
    }),
    num({
      id: 'coast-distance', difficulty: 3,
      gen(r) {
        const m = r.pick([200, 300, 400]), b = r.pick([40, 60, 80]), v0 = r.pick([2, 3, 4]);
        const tau = m / b, X = v0 * tau;
        return {
          prompt: t`The same model: a ${m} kg dinghy with linear drag $b = ${b}$ kg/s coasts from ${v0} m/s. How far does it glide before (in this model) it stops?`,
          answer: X, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (m * v0) / (2 * b), feedback: t`That treats the drag as a constant force $bv_0$, its starting value. It weakens as the boat slows: use $v\,dv/dx$, and the $v$ in the drag cancels.` }, { value: v0 / tau, feedback: t`Check units: $v_0/\tau$ is an acceleration. The distance is $v_0\tau$.` }],
          hints: [t`Write $\dot v = \dfrac{dv}{dx}\dfrac{dx}{dt} = v\dfrac{dv}{dx}$ and divide both sides by $v$.`, t`$m\,v\,\dfrac{dv}{dx} = -bv$ gives $\dfrac{dv}{dx} = -\dfrac{b}{m}$: speed falls linearly with distance.`],
          teach: t`The chain-rule trick $\dot v = v\,dv/dx$ turns a speed-dependent force into an equation in $x$; for linear drag the speed falls linearly with distance.`,
          explain: t`$dv/dx = -b/m$, so $v = v_0 - (b/m)x$, which reaches zero at $x = mv_0/b = v_0\tau = ${sci(X)}$ m. It takes infinite time — the exponential never quite ends — but covers a finite distance, the area under $v(t)$.`,
          visual: gpic({ x: [0, r6(5 * tau)], y: [0, v0 * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${v0}*e^(-x/${r6(tau)})`, color: 'accent', width: 2.4 }], shade: [{ fn: `${v0}*e^(-x/${r6(tau)})`, from: 0, to: r6(5 * tau), color: 'accent', alpha: 0.2 }] }, t`The distance glided is the shaded area under $v(t)$ — finite, although the curve never reaches zero.`, 'The area under an exponential speed curve'),
        };
      },
    }),
    num({
      id: 'terminal-ball', difficulty: 2,
      gen(r) {
        const [name, D, m] = r.pick([['a baseball', 0.073, 0.145], ['a golf ball', 0.0427, 0.0459], ['a table-tennis ball', 0.040, 0.0027], ['a 2 cm hailstone', 0.020, 0.0038]]);
        const c = GAMMA * D * D, vt = Math.sqrt((m * G) / c);
        return {
          prompt: t`For a sphere moving through air, quadratic drag is $f = cv^2$ with $c = \gamma D^2$, where $D$ is the diameter and $\gamma \approx 0.25\ \text{N·s}^2/\text{m}^4$. What is the terminal speed of ${name} ($D = ${sci(D * 100)}$ cm, $m = ${sci(m * 1000)}$ g)?`,
          answer: vt, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (m * G) / c, feedback: t`At terminal speed $cv^2 = mg$: you forgot the square root.` }, { value: Math.sqrt((m * G) / (GAMMA * D)), feedback: t`Drag scales with the cross-section, $c = \gamma D^2$ — square the diameter.` }],
          hints: [t`At terminal speed the drag balances the weight: $cv^2 = mg$.`, t`$v_\text{ter} = \sqrt{mg/(\gamma D^2)}$, with $D$ in metres and $m$ in kg.`],
          teach: t`Quadratic drag balances gravity at $v_\text{ter} = \sqrt{mg/c}$; bigger and denser bodies fall faster.`,
          explain: t`$c = 0.25\times(${sci(D)})^2 = ${sci(c)}$ kg/m, so $v_\text{ter} = \sqrt{${sci(m)}\times9.8/${sci(c)}} = ${sci(vt)}$ m/s.`,
          visual: fallPic(t`${name.charAt(0).toUpperCase() + name.slice(1)} falling at terminal speed: drag and weight balance (arrows equal, not to scale).`, { ratio: 1 }),
        };
      },
    }),
    mcq({
      id: 'how-many-ics', difficulty: 1,
      prompt: t`A particle moves in three dimensions under a known force $\vec F(\vec r, \dot{\vec r}, t)$. How many numbers must you know at $t = 0$ to predict its whole future motion?`,
      visual: gpic({
        x: [0, 10], y: [0, 6], xlabel: 'x (m)', ylabel: 'y (m)',
        curves: [{ fn: '1.2*x - 0.098*x^2', color: 'accent', domain: [0, 10] }, { fn: '0.6*x - 0.04*x^2', color: 'gold', domain: [0, 10] }, { fn: '1.8*x - 0.25*x^2', color: 'violet', domain: [0, 7.4] }],
        points: [{ x: 0, y: 0, color: 'ink', label: 'same start', labelDx: 6, labelDy: -10 }],
      }, t`Three projectiles from the same point under the same gravity, launched with different velocities: the starting position alone does not fix the path.`, 'Three different trajectories from one starting point'),
      choices: ['6: three coordinates and three velocity components', '3: the starting position', '2: a position and a speed', '9: position, velocity and acceleration'],
      answer: 0,
      why: { 1: 'The picture shows three different paths from one starting point: the velocity is needed too.', 2: 'In 3D each of x, y and z needs its own starting value and starting rate — two numbers each.', 3: 'The acceleration is not free: the equation of motion gives it from the position and velocity.' },
      hints: ['How many initial conditions does a second-order equation need, per coordinate?'],
      teach: 'Each coordinate obeys a second-order equation, so it needs two initial conditions: a position and a velocity.',
      explain: t`Three second-order equations need $3\times2 = 6$ numbers: $\vec r_0$ and $\vec v_0$. The acceleration then follows from $\vec F/m$.`,
    }),
    expr({
      id: 'shm-ivp', difficulty: 2,
      gen(r) {
        const w = r.pick([2, 3, 4, 5]), x0 = r.pick([1, 2, 3]), v0 = r.pick([-6, -4, 2, 4, 6]);
        const k = v0 / w;
        return {
          prompt: t`Solve $\ddot x = -${w * w}x$ with $x(0) = ${x0}$ and $\dot x(0) = ${v0}$.`,
          answer: `${x0} cos(${w}t) + (${v0}/${w}) sin(${w}t)`, answerTeX: t`${x0}\cos ${w}t ${k < 0 ? '-' : '+'} ${sci(Math.abs(k))}\sin ${w}t`,
          vars: { t: [0, 3] }, lhs: 'x(t)',
          errors: [{ answer: `${x0} cos(${w}t) + ${v0} sin(${w}t)`, feedback: t`Check $\dot x(0)$: differentiating $B\sin ${w}t$ brings down a factor ${w}, so $B = \dot x(0)/${w}$.` }, { answer: `${x0} cos(${w * w}t) + ${r6(v0 / (w * w))} sin(${w * w}t)`, feedback: t`The angular frequency is the square root of ${w * w}.` }],
          hints: [t`The general solution of $\ddot x = -\omega^2x$ is $A\cos\omega t + B\sin\omega t$; here $\omega = ${w}$.`, t`$x(0) = A$ and $\dot x(0) = B\omega$.`],
          teach: t`Two arbitrary constants for a second-order equation, fixed by $x(0)$ and $\dot x(0)$: $x = x_0\cos\omega t + (v_0/\omega)\sin\omega t$.`,
          explain: t`$\omega = ${w}$, $A = ${x0}$, $B = ${v0}/${w} = ${sci(k)}$: $x = ${x0}\cos ${w}t ${k < 0 ? '-' : '+'} ${sci(Math.abs(k))}\sin ${w}t$.`,
          visual: gpic({ x: [-0.3, 2.5], y: [-4.5, 4.5], xlabel: 't', ylabel: 'x', points: [{ x: 0, y: x0, color: 'accent', label: `x(0) = ${x0}`, labelDx: 8 }], arrows: [{ from: [0, x0], to: [0.35, x0 + 0.35 * v0], color: 'good', label: 'slope ẋ(0)', labelDx: 6, labelDy: v0 > 0 ? -6 : 10 }] }, t`The two initial conditions: a starting value and a starting slope. Together they pick one curve out of the two-parameter family.`, 'A starting point and a starting slope'),
        };
      },
    }),
    multi({
      id: 'linear', difficulty: 2,
      prompt: t`For which of these equations of motion is a sum of two solutions again a solution (with the drive, if any, adjusted to the sum of the drives)? Select every one.`,
      visual: gpic({ x: [-3, 3], y: [-3, 3], xlabel: 'v (m/s)', ylabel: 'drag force (N)', curves: [{ fn: '-0.8*x', color: 'accent', label: 'linear: −bv', labelAt: -2.4, labelDy: -10 }, { fn: '-0.4*x*abs(x)', color: 'gold', label: 'quadratic: −cv|v|', labelAt: 1.2, labelDy: 18 }] }, t`Linear and quadratic drag against velocity. Only a straight line through the origin respects $f(v_1 + v_2) = f(v_1) + f(v_2)$.`, 'Two drag laws plotted against velocity'),
      choices: [t`$m\ddot x = -kx - b\dot x$`, t`$m\ddot x = -kx + F_0\cos\omega t$`, t`$m\dot v = -cv|v|$`, t`$\ddot\theta = -(g/L)\sin\theta$`],
      answer: [0, 1],
      why: { 2: t`$(v_1 + v_2)|v_1 + v_2| \ne v_1|v_1| + v_2|v_2|$: quadratic drag is nonlinear.`, 3: t`$\sin(\theta_1 + \theta_2) \ne \sin\theta_1 + \sin\theta_2$; only the small-angle version $\ddot\theta = -(g/L)\theta$ is linear.` },
      hints: [t`An equation is linear if the unknown and its derivatives appear only to the first power, with coefficients that do not depend on the unknown.`, t`Test each nonlinear-looking term: does $f(x_1 + x_2) = f(x_1) + f(x_2)$?`],
      teach: 'Superposition — adding solutions — works exactly when the equation is linear in the unknown; it is why oscillators can be analysed one frequency at a time.',
      explain: t`The spring–damper and the driven spring are linear (the drive adds, which is why driven responses superpose — M2.4 relies on it). Quadratic drag and the full pendulum are nonlinear.`,
    }),
    expr({
      id: 'complex-form', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 4]), w = r.pick([2, 3, 5]), bi = b === 1 ? '' : b;
        return {
          prompt: t`Linear equations are often solved with $z(t) = Ce^{i\omega t}$ and the physical answer read off as $x = \text{Re}\,z$. With $C = ${a} - ${bi}i$ and $\omega = ${w}$ rad/s, write $x(t)$ as a real function.`,
          answer: `${a} cos(${w}t) + ${b} sin(${w}t)`, answerTeX: t`${a}\cos ${w}t + ${bi}\sin ${w}t`,
          vars: { t: [0, 3] }, lhs: 'x(t)',
          errors: [{ answer: `${a} cos(${w}t) - ${b} sin(${w}t)`, feedback: t`$\text{Re}\big[(-${bi}i)(i\sin\omega t)\big] = -${bi}i^2\sin\omega t = +${bi}\sin\omega t$.` }, { answer: `${a} cos(${w}t)`, feedback: t`The imaginary part of $C$ multiplies $i\sin\omega t$ to give a real term.` }],
          hints: [t`Euler: $e^{i\omega t} = \cos\omega t + i\sin\omega t$.`, t`Multiply $(${a} - ${bi}i)(\cos ${w}t + i\sin ${w}t)$ and keep the real part; $i^2 = -1$.`],
          teach: t`$\text{Re}\big[(a - ib)e^{i\omega t}\big] = a\cos\omega t + b\sin\omega t$: the complex amplitude stores both the size and the phase.`,
          explain: t`$(${a} - ${bi}i)(\cos ${w}t + i\sin ${w}t) = ${a}\cos ${w}t + ${bi}\sin ${w}t + i(\ldots)$, so $x = ${a}\cos ${w}t + ${bi}\sin ${w}t$ — amplitude $|C| = ${sci(Math.hypot(a, b))}$.`,
          visual: gpic({ x: [-1, 5], y: [-5, 2], equal: true, xlabel: 'Re', ylabel: 'Im', arrows: [{ from: [0, 0], to: [a, -b], color: 'accent', label: `C = ${a} − ${bi}i`, labelDx: 8, labelDy: 6 }], curves: [{ param: [`${r6(Math.hypot(a, b))}*cos(t)`, `${r6(Math.hypot(a, b))}*sin(t)`], t: [0, 6.2832], color: 'ink4', width: 1, dash: true }] }, t`The complex amplitude $C$ in the complex plane. Multiplying by $e^{i\omega t}$ spins it anticlockwise round the dashed circle; $x(t)$ is its shadow on the real axis.`, 'A complex number drawn as an arrow in the complex plane'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars-chute', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([800, 1000, 1200]), CdA = r.pick([150, 200, 250]), rho = r.pick([0.012, 0.015, 0.02]), g = 3.71;
        const vt = Math.sqrt((2 * m * g) / (rho * CdA));
        return {
          prompt: t`A ${m} kg lander hangs under a parachute on Mars ($g = 3.71$ m/s²). Model the drag as $f = \tfrac12\rho C_dA\,v^2$ with $C_dA = ${CdA}$ m² and the thin Martian air at $\rho = ${rho}$ kg/m³. What terminal speed would it reach?`,
          answer: vt, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((2 * m * G) / (rho * CdA)), feedback: t`That uses Earth's $g$; on Mars $g = 3.71$ m/s².` }, { value: Math.sqrt((m * g) / (rho * CdA)), feedback: t`Keep the $\tfrac12$: $c = \tfrac12\rho C_dA$.` }],
          hints: [t`Terminal speed balances weight and drag: $\tfrac12\rho C_dA\,v^2 = mg$.`, t`$v_\text{ter} = \sqrt{2mg/(\rho C_dA)}$.`],
          teach: t`Terminal speed under quadratic drag is $\sqrt{mg/c}$, with $c = \tfrac12\rho C_dA$; thin air means a fast descent.`,
          explain: t`$v_\text{ter} = \sqrt{2\times${m}\times3.71/(${rho}\times${CdA})} = ${sci(vt)}$ m/s — around ${Math.round(vt * 3.6)} km/h, far too fast to touch down. Martian air is about 1% as dense as Earth's, which is why every Mars lander finishes with rockets, airbags or a sky crane. (Constant $\rho$ and $C_d$ are idealizations.)`,
          visual: fallPic(t`The lander under its canopy at terminal speed: drag balances weight (arrows equal, not to scale).`, { drag: 'drag  ½ρCdA v²', weight: 'weight  mg (Mars)', ratio: 1 }),
        };
      },
    }),
    num({
      id: 'cp-half', difficulty: 2,
      gen(r) {
        const vt = r.pick([30, 40, 56, 70]);
        const th = (vt / G) * Math.atanh(0.5);
        return {
          prompt: t`A body falls from rest with quadratic drag and terminal speed ${vt} m/s, so $v = v_\text{ter}\tanh(gt/v_\text{ter})$. How long does it take to reach half the terminal speed?`,
          answer: th, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (vt / G) * Math.log(2), feedback: t`That is the linear-drag answer, $\tau\ln 2$. With quadratic drag solve $\tanh u = \tfrac12$.` }, { value: vt / (2 * G), feedback: t`That ignores drag entirely ($v = gt$). Drag already matters at half terminal speed.` }],
          hints: [t`Solve $\tanh(gt/v_\text{ter}) = \tfrac12$.`, t`$\text{artanh}\,\tfrac12 = \tfrac12\ln 3 \approx 0.549$.`],
          teach: t`Invert the tanh: $t = (v_\text{ter}/g)\,\text{artanh}(v/v_\text{ter})$.`,
          explain: t`$t = \dfrac{${vt}}{9.8}\times\text{artanh}\,0.5 = \dfrac{${vt}}{9.8}\times0.549 = ${sci(th)}$ s — only about 10% longer than free fall would take ($${sci(vt / (2 * G))}$ s), since drag at half speed is only a quarter of the weight.`,
          visual: gpic({ x: [0, r6((3 * vt) / G)], y: [0, vt * 1.15], xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${vt}*tanh(9.8*x/${vt})`, color: 'gold', width: 2.4 }], hlines: [{ y: vt, label: 'terminal', color: 'ink3' }, { y: vt / 2, label: 'half', color: 'ink3' }] }, t`$v(t)$ for quadratic drag; the dashed lines are $v_\text{ter}$ and $v_\text{ter}/2$.`, 'A tanh-shaped speed curve with two horizontal lines'),
        };
      },
    }),
    mcq({
      id: 'cp-classify', difficulty: 2,
      prompt: t`A satellite's accelerometer proof mass obeys $m\ddot x + b\dot x + kx = -ma(t)$, where $a(t)$ is the craft's acceleration. Which description is right?`,
      visual: gpic({
        x: [-0.5, 6], y: [-1.2, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [seg([0, -1], [0, 1.4], 'ink2', 3), seg([0, 0.55], [1.2, 0.55], 'ink2', 1.6), seg([1.2, 0.55], [1.4, 0.75], 'ink2', 1.6), seg([1.4, 0.75], [1.7, 0.35], 'ink2', 1.6), seg([1.7, 0.35], [2.0, 0.75], 'ink2', 1.6), seg([2.0, 0.75], [2.3, 0.35], 'ink2', 1.6), seg([2.3, 0.35], [2.5, 0.55], 'ink2', 1.6), seg([2.5, 0.55], [3.2, 0.55], 'ink2', 1.6),
          seg([0, -0.35], [1.6, -0.35], 'ink2', 1.6), seg([1.6, -0.6], [1.6, -0.1], 'ink2', 2), seg([1.45, -0.62], [2.1, -0.62], 'ink2', 1.6), seg([1.45, -0.08], [2.1, -0.08], 'ink2', 1.6), seg([2.1, -0.62], [2.1, -0.08], 'ink2', 1.6), seg([2.1, -0.35], [3.2, -0.35], 'ink2', 1.6),
          seg([3.2, -0.9], [4.6, -0.9], 'accent', 2.4), seg([4.6, -0.9], [4.6, 1.3], 'accent', 2.4), seg([4.6, 1.3], [3.2, 1.3], 'accent', 2.4), seg([3.2, 1.3], [3.2, -0.9], 'accent', 2.4)],
        points: [lab(3.9, 0.2, 'm', 'accent'), lab(1.85, 0.95, 'k', 'ink2'), lab(1.85, -0.85, 'b', 'ink2')],
      }, t`The proof mass on a spring $k$ and a damper $b$, both fixed to the spacecraft's frame (left).`, 'A mass attached to a wall by a spring and a damper'),
      choices: [
        'Second order, linear, inhomogeneous: the general solution has two free constants plus a particular solution set by a(t)',
        'Second order and nonlinear, because a(t) can be any function of time',
        'First order, because only one derivative of x appears with b',
        'Linear and homogeneous, so x = 0 is the only possible motion',
      ],
      answer: 0,
      why: {
        1: 'Linearity is about how the unknown x enters. A forcing term that depends on t alone, however complicated, keeps the equation linear.',
        2: t`The order is the highest derivative present: $\ddot x$ makes it second order.`,
        3: t`The right-hand side $-ma(t)$ does not involve $x$, so the equation is **inhomogeneous**; $x = 0$ solves it only when $a = 0$.`,
      },
      hints: ['Order: the highest derivative. Linear: x and its derivatives appear to the first power only. Homogeneous: every term contains x.'],
      teach: 'Classify an equation by order, linearity and homogeneity before solving it: that decides the method and how many constants the answer carries.',
      explain: t`$\ddot x$ makes it second order; $x$, $\dot x$, $\ddot x$ appear linearly with constant coefficients; the drive $-ma(t)$ makes it inhomogeneous. So $x = x_h + x_p$, with two constants in $x_h$ fixed by the initial conditions — the structure M2 is built on.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 2: projectiles and charged particles (linear and quadratic drag, γ = 0.25 N·s²/m⁴)', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'NASA Glenn Research Center: The Drag Equation', url: 'https://www.grc.nasa.gov/www/k-12/airplane/drageq.html' },
  ],
});
