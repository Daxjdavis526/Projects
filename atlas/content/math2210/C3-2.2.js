// Derivatives and integrals of vector functions — r′(t) as the limit of
// secant vectors, the unit tangent and tangent lines, the product rules for
// dot and cross products, and integration with a constant vector: recovering
// a path from its acceleration.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { add, sub, scale, dot, norm, vecTeX, sterm } from './_space.js';

const t = String.raw;
const D = Math.PI / 180;
const near = (a, b) => Math.abs(a - b) <= 0.01 * Math.max(Math.abs(b), 1e-9);
// keep only the error values a grader could tell apart from the answer and each other
const distinct = (answer, errs) => errs.filter((e, k) => Number.isFinite(e.value) && !near(e.value, answer) && !errs.slice(0, k).some((f) => near(e.value, f.value)));

// Viviani's curve on the sphere |r| = 2 (for the constant-length question)
const VIV = ['1 + cos(t)', 'sin(t)', '2*sin(t/2)'];
const vivAt = (s) => [1 + Math.cos(s), Math.sin(s), 2 * Math.sin(s / 2)];

export default lesson({
  id: 'math2210.C3-2.2',
  title: 'Derivatives and integrals of vector functions',
  minutes: 12, difficulty: 2,
  intro: t`A vector function is differentiated one component at a time:

$$\vec r\,'(t) = \lim_{h\to0}\frac{\vec r(t + h) - \vec r(t)}{h} = \langle x'(t),\ y'(t),\ z'(t)\rangle$$

The difference quotient is a **secant vector** — the chord from the point at $t$ to the point at $t + h$, divided by $h$ — and as $h \to 0$ it turns into the **tangent vector** $\vec r\,'(t)$, pointing along the curve in the direction of motion. Its direction, the **unit tangent** $\vec T = \vec r\,'/|\vec r\,'|$, belongs to the curve; its length is the speed at which the parametrization runs. The product rule survives for dot and cross products — for the cross product with the order kept:

$$(\vec u\cdot\vec v)' = \vec u\,'\cdot\vec v + \vec u\cdot\vec v\,', \qquad (\vec u\times\vec v)' = \vec u\,'\times\vec v + \vec u\times\vec v\,'$$

Integrals are componentwise too, and the constant of integration is a constant **vector**: it takes a vector initial condition, such as a starting velocity or position, to pin it down.`,
  symbols: [
    { tex: "\\vec r\\,'(t)", text: t`the derivative of $\vec r$: the tangent vector at $t$. When $t$ is time it is the velocity, and its length $|\vec r\,'(t)|$ is the speed` },
    { tex: 'h', text: t`the step in the difference quotient; the derivative is its limit as $h \to 0$` },
    { tex: '\\vec T(t)', text: t`the unit tangent $\vec r\,'(t)/|\vec r\,'(t)|$, defined wherever $\vec r\,'(t) \ne \vec 0$: direction only, length 1` },
    { tex: '\\vec u(t),\\ \\vec v(t)', text: t`any two differentiable vector functions, in the product rules` },
    { tex: '\\vec C', text: t`a constant vector of integration: three constants, one per component` },
  ],
  why: t`Newton’s second law $\vec F = m\vec r\,''$ is a statement about the second derivative of a vector function. An inertial navigation system — in airliners, submarines and rockets — runs it backward: accelerometers measure $\vec a(t)$, and two integrations, with the starting velocity and position as the constant vectors, say where the vehicle is. The cross-product rule gives $\frac{d}{dt}(\vec r\times m\vec v) = \vec r\times\vec F$, the law of angular momentum that C3-2.5 turns into Kepler’s laws.`,
  visual: {
    type: 'c3-curve',
    title: 'Secants become the tangent',
    lead: t`The amber arrow is the difference quotient $\big(\vec r(t + h) - \vec r(t)\big)/h$: the dashed chord from the point at $t$ to the point at $t + h$, divided by $h$. The green arrow is $\vec r\,'(t)$, drawn from the gold point. Shrink $h$ and watch one become the other.`,
    tasks: [
      t`Drag $h$ toward $0$. The amber secant vector swings round and lengthens until it lies on the green $\vec r\,'(t)$: the derivative is the limit of secant vectors, and it is tangent to the curve.`,
      t`Make $h$ negative. The dashed chord now reaches back to an earlier point, yet the arrow still points forward — dividing by a negative $h$ reverses it — and it closes in on the same $\vec r\,'(t)$ from the other side.`,
      t`Switch on $\vec T$ and press **Play**. $\vec T$ always points along $\vec r\,'$ but keeps length 1, while the speed $|\vec r\,'| = \sqrt{4 + 0.35^2} \approx 2.03$ is the same all along this helix.`,
    ],
    params: {
      curve: { param: ['2*cos(t)', '2*sin(t)', '0.35*t'], t: [-2 * Math.PI, 2 * Math.PI] },
      at: 0.8,
      sliders: [{ key: 'h', label: '$h$', min: -2.5, max: 2.5, step: 0.05, value: 2, explain: 'The step of the difference quotient. At $h = 0$ the quotient itself is undefined; only its limit exists.' }],
      secant: 'h', show: ['secant', 'v'], toggles: ['secant', 'v', 'T'], scale: { v: 1, frame: 1 },
      readouts: ['t', 'speed'], speed: 0.8,
    },
    caption: 'Drag to rotate. The helix ⟨2 cos t, 2 sin t, 0.35t⟩; every arrow starts at the moving point and is drawn to scale in the units of the axes.',
  },
  example: {
    prompt: t`A survey drone’s flight controller commands the acceleration $\vec a(t) = \langle -4\cos 2t,\ -4\sin 2t,\ 0\rangle$ m/s². At $t = 0$ the drone is at $\langle 1, 0, 0\rangle$ m with velocity $\langle 0, 2, 1\rangle$ m/s. Find its position $\vec r(t)$, and where it is at $t = \pi$ s.`,
    visual: {
      type: 'c3-curve',
      params: { curve: { param: ['cos(2*t)', 'sin(2*t)', 't'], t: [0, Math.PI] }, at: 0.6, show: ['v', 'a', 'trail'], toggles: ['v', 'a'], scale: { v: 0.5, a: 0.25 }, readouts: ['t', 'x', 'y', 'z'], units: { t: '\\text{s}', len: '\\text{m}' }, speed: 0.5, range: 2, target: [0, 0, 1.3], dist: 9 },
      caption: 'Drag to rotate; Play flies the drone. Green: velocity (drawn at half scale). Violet: acceleration (quarter scale), always horizontal and aimed at the axis of the climb.',
    },
    steps: [
      { label: 'Integrate the acceleration', text: t`Component by component, $\vec v(t) = \int \vec a\,dt = \langle -2\sin 2t,\ 2\cos 2t,\ 0\rangle + \vec C_1$. At $t = 0$ this is $\langle 0, 2, 0\rangle + \vec C_1$, which must equal $\langle 0, 2, 1\rangle$, so $\vec C_1 = \langle 0, 0, 1\rangle$ and $\vec v(t) = \langle -2\sin 2t,\ 2\cos 2t,\ 1\rangle$.` },
      { label: 'Integrate the velocity', text: t`$\vec r(t) = \langle \cos 2t,\ \sin 2t,\ t\rangle + \vec C_2$. At $t = 0$: $\langle 1, 0, 0\rangle + \vec C_2 = \langle 1, 0, 0\rangle$, so $\vec C_2 = \vec 0$ and $\vec r(t) = \langle \cos 2t,\ \sin 2t,\ t\rangle$.` },
      { label: 'Read the answer', text: t`A helix of radius 1 m about the $z$-axis, one turn every $\pi$ s, climbing 1 m/s. At $t = \pi$ s the drone is at $\langle 1, 0, \pi\rangle$: straight above its start, $3.14$ m up. Check: $\vec r\,''(t) = \langle -4\cos 2t, -4\sin 2t, 0\rangle$ ✓.` },
      { label: 'Why the constants matter', text: t`Had the drone started at rest at the same point, $\vec C_1 = \langle 0, -2, 0\rangle$ and $\vec r(t) = \langle \cos 2t,\ \sin 2t - 2t,\ 0\rangle$: a cycloid in the horizontal plane, stopping dead at every cusp. The same acceleration gives a completely different flight — the constant vectors carry the initial conditions.` },
    ],
    answer: t`$\vec r(t) = \langle \cos 2t,\ \sin 2t,\ t\rangle$ m, a climbing helix; at $t = \pi$ s the drone is at $\langle 1, 0, \pi\rangle$ m, $3.14$ m directly above its start.`,
  },
  practice: [
    num({
      id: 'unit-tangent', difficulty: 2,
      gen(r) {
        const t0 = r.pick([0.5, 1, 2, 3]), k = r.int(0, 2), name = 'xyz'[k];
        const d = [2 * t0, 2, 1 / t0], L = 2 * t0 + 1 / t0, T = d.map((c) => c / L), P = [t0 * t0, 2 * t0, Math.log(t0)];
        const errors = distinct(T[k], [
          { value: d[k], feedback: t`That is the component of $\vec r\,'(${t0})$ itself. $\vec T$ divides by its length, $|\vec r\,'(${t0})| = ${nice(L, 4)}$.` },
          { value: P[k] / norm(P), feedback: t`That is the direction of the position vector $\vec r(${t0})$. The tangent comes from the derivative $\vec r\,'(${t0})$.` },
        ]);
        // the curve near t0, moved so the point sits at the origin and scaled to fit:
        // neither a translation nor a uniform scale turns the tangent
        const lo = Math.max(0.2, t0 - 0.6), hi = t0 + 0.6;
        const ext = Math.max(...[lo, hi].flatMap((u) => [u * u - t0 * t0, 2 * (u - t0), Math.log(u / t0)].map(Math.abs)));
        const s = nice(2.4 / ext, 3);
        return {
          prompt: t`For the curve $\vec r(t) = \langle t^2,\ 2t,\ \ln t\rangle$, find the $${name}$-component of the unit tangent vector $\vec T$ at $t = ${t0}$, to 3 significant figures.`,
          answer: T[k], tol: { rel: 0.005, abs: 0.0006 }, errors,
          hints: [t`Differentiate each component: $\vec r\,'(t) = \langle 2t,\ 2,\ 1/t\rangle$.`, t`$|\vec r\,'(t)|^2 = 4t^2 + 4 + 1/t^2 = (2t + 1/t)^2$, so $|\vec r\,'(t)| = 2t + 1/t$.`],
          teach: 'The unit tangent is the derivative divided by its own length: T = r′/|r′|.',
          explain: t`$\vec r\,'(${t0}) = ${vecTeX(d)}$ with length $2(${t0}) + 1/${t0} = ${nice(L, 4)}$, so $\vec T(${t0}) = ${vecTeX(T.map((c) => +c.toFixed(4)))}$ and its $${name}$-component is $${nice(T[k], 3)}$.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${s}*(t^2 - ${t0 * t0})`, `${s}*(2*t - ${2 * t0})`, `${s}*ln(t/${t0})`], t: [nice(lo, 3), nice(hi, 3)] }, at: t0, fixed: true, show: ['trail', 'T'], scale: { frame: 1.4 }, readouts: [], yaw: Math.atan2(-T[0], T[1]) + 0.35, pitch: 0.35 }, caption: 'Drag to rotate. The curve for ' + `${nice(lo, 3)} ≤ t ≤ ${nice(hi, 3)}` + ', moved so the point sits at the origin and scaled to fit — neither turns the tangent. The arrow shows the direction of T.' },
        };
      },
    }),
    expr({
      id: 'tangent-line', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = r.pick([-2, -1, 1, 2]), c = r.pick([-1, 1, 2]), t0 = r.pick([-1, 1]), k = r.int(0, 2), name = 'xyz'[k];
        const P = [a * t0, b * t0 * t0, c * t0 ** 3], V = [a, 2 * b * t0, 3 * c * t0 * t0];
        const lineTeX = (p, v) => `${p}${sterm(v, 's')}`;
        const errors = [{ answer: `${V[k]}*s`, feedback: t`The line must pass through the point of tangency: start from $\vec r(${t0})$, then add $s\,\vec r\,'(${t0})$.` }];
        if (P[k] !== V[k]) errors.push({ answer: `${P[k]} + ${P[k]}*s`, feedback: t`The direction of the tangent line is the derivative $\vec r\,'(${t0})$, not the position $\vec r(${t0})$.` });
        // the picture, uniformly scaled to fit (a uniform scale keeps the line tangent)
        const M = Math.max(...[t0 - 0.8, t0 + 0.8].flatMap((u) => [a * u, b * u * u, c * u ** 3].map(Math.abs)));
        const sc = Math.min(1, 2.6 / M), Lv = norm(V);
        return {
          prompt: t`The tangent line to $\vec r(t) = \langle ${sterm(a, 't', true)},\ ${sterm(b, 't^2', true)},\ ${sterm(c, 't^3', true)}\rangle$ at $t = ${t0}$ is $\vec\ell(s) = \vec r(${t0}) + s\,\vec r\,'(${t0})$. What is its $${name}$-component, as a function of $s$?`,
          answer: `${P[k]} + ${V[k]}*s`, answerTeX: lineTeX(P[k], V[k]), lhs: name,
          vars: { s: [-2, 2] }, errors,
          hints: [t`$\vec r\,'(t) = \langle ${a},\ ${2 * b}t,\ ${3 * c}t^2\rangle$; evaluate it and $\vec r$ at $t = ${t0}$.`],
          teach: 'The tangent line at t₀ starts at the point r(t₀) and runs along the tangent vector r′(t₀).',
          explain: t`$\vec r(${t0}) = ${vecTeX(P)}$ and $\vec r\,'(${t0}) = ${vecTeX(V)}$, so $\vec\ell(s) = \langle ${P.map((p, j) => lineTeX(p, V[j])).join(',\\ ')}\rangle$ and $${name} = ${lineTeX(P[k], V[k])}$.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 3,
              curves: [{ param: [`${sc * a}*t`, `${sc * b}*t^2`, `${sc * c}*t^3`], t: [t0 - 0.8, t0 + 0.8], color: 'accent', width: 2.6 }],
              lines: [{ point: scale(P, sc), dir: V, t: [-1.7 / Lv, 1.7 / Lv], color: 'warn' }],
              points: [{ at: scale(P, sc), color: 'gold' }],
            },
            caption: 'Drag to rotate. The curve (blue) and its tangent line (amber) at the gold point, scaled down together to fit.',
          },
        };
      },
    }),
    num({
      id: 'closing-speed', difficulty: 3,
      gen(r) {
        // B relative to A (A at the origin), velocities in km/min
        const Dv = [r.int(30, 60), r.intExcept(-20, 20, [0]), r.pick([-1, 0, 1])];
        const vA = [r.int(12, 14), r.int(-3, 3), 0], vB = [-r.int(10, 14), r.int(-3, 3), r.pick([-0.5, 0, 0.5])];
        const W = sub(vB, vA), rate = dot(Dv, W) / norm(Dv);
        const errors = distinct(rate, [
          { value: -norm(W), feedback: t`That is the size of the relative velocity, $|\vec v_B - \vec v_A|$. Only its component along the line between the aircraft changes the distance.` },
          { value: dot(Dv, W), feedback: t`$\frac{d}{dt}(\vec D\cdot\vec D) = 2\vec D\cdot\vec D\,'$ is the rate of change of the distance **squared**. Divide: $\frac{d|\vec D|}{dt} = \frac{\vec D\cdot\vec D\,'}{|\vec D|}$.` },
          { value: norm(vB) - norm(vA), feedback: t`The difference of the two speeds ignores the directions of flight; the distance changes at the rate $\vec D\cdot(\vec v_B - \vec v_A)/|\vec D|$.` },
        ]);
        return {
          prompt: t`Two aircraft, seen at the same instant: take A’s position as the origin, so B is at $\vec D = ${vecTeX(Dv)}$ km. A’s velocity is $${vecTeX(vA)}$ km/min and B’s is $${vecTeX(vB)}$ km/min. At what rate is the distance between them changing, in km/min? (Negative means closing.)`,
          answer: rate, units: 'km/min', tol: { rel: 0.01, abs: 0.02 }, errors,
          hints: [t`The separation $\vec D(t) = \vec r_B(t) - \vec r_A(t)$ changes at $\vec D\,' = \vec v_B - \vec v_A$.`, t`Differentiate $|\vec D|^2 = \vec D\cdot\vec D$ with the product rule: $2|\vec D|\,\frac{d|\vec D|}{dt} = 2\vec D\cdot\vec D\,'$.`],
          teach: 'A length changes at d|D|/dt = D·D′/|D|: the product rule on D·D = |D|².',
          explain: t`$\vec D\,' = \vec v_B - \vec v_A = ${vecTeX(W)}$ km/min and $|\vec D| = ${nice(norm(Dv), 4)}$ km, so $\frac{d|\vec D|}{dt} = \frac{\vec D\cdot\vec D\,'}{|\vec D|} = \frac{${nice(dot(Dv, W), 4)}}{${nice(norm(Dv), 4)}} = ${nice(rate, 3)}$ km/min. Airborne collision-avoidance systems divide the range by exactly this closure rate to estimate the time to closest approach.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: Math.ceil(norm(Dv) / 2 + 8),
              points: [{ at: [0, 0, 0], color: 'gold', label: 'A' }, { at: Dv, color: 'gold', label: 'B' }],
              segments: [{ from: [0, 0, 0], to: Dv, color: 'ink3', dash: true }],
              vectors: [{ from: [0, 0, 0], to: vA, color: 'accent', label: '\\vec v_A' }, { from: Dv, to: add(Dv, vB), color: 'warn', label: '\\vec v_B' }],
            },
            caption: 'Drag to rotate. The two aircraft, the line between them (dashed) and their velocities, each drawn as one minute of flight.',
          },
        };
      },
    }),
    mcq({
      id: 'cross-rule', difficulty: 2,
      prompt: t`Which is the derivative of $\vec u(t)\times\vec v(t)$?`,
      choices: [t`$\vec u\,'\times\vec v + \vec u\times\vec v\,'$`, t`$\vec u\,'\times\vec v\,'$`, t`$\vec u\,'\times\vec v + \vec v\,'\times\vec u$`, t`$\vec u\,'\cdot\vec v + \vec u\cdot\vec v\,'$`],
      answer: 0,
      why: {
        1: 'The derivative of a product is not the product of the derivatives — not for numbers, and not for vectors.',
        2: t`Order matters: $\vec v\,'\times\vec u = -\vec u\times\vec v\,'$, so this subtracts the second term instead of adding it.`,
        3: t`$\vec u\times\vec v$ is a vector, so its derivative is a vector; a sum of dot products is a scalar.`,
      },
      hints: [t`Each component of $\vec u\times\vec v$ is a difference of products, such as $u_y v_z - u_z v_y$.`, 'Apply the ordinary product rule to each product, keeping the factors in their places.'],
      teach: 'The cross product obeys the product rule as long as each term keeps the factors in their original order.',
      explain: t`Applying the ordinary product rule to every component gives $(\vec u\times\vec v)' = \vec u\,'\times\vec v + \vec u\times\vec v\,'$. For angular momentum $\vec L = \vec r\times m\vec v$: $\vec L\,' = \vec v\times m\vec v + \vec r\times m\vec a = \vec r\times\vec F$, because $\vec v\times\vec v = \vec 0$. Torque is the rate of change of angular momentum.`,
    }),
    mcq({
      id: 'constant-length', difficulty: 2,
      prompt: t`A curve lies on the sphere $|\vec r| = 2$, so $\vec r(t)\cdot\vec r(t) = 4$ for every $t$. Differentiating both sides with the dot-product rule shows what?`,
      choices: [t`$\vec r(t)\cdot\vec r\,'(t) = 0$: the tangent is always perpendicular to the radius`, t`$\vec r\,'(t) = \vec 0$: the point does not move`, t`$\vec r\,'(t)$ is parallel to $\vec r(t)$`, t`$|\vec r\,'(t)| = 2$`],
      answer: 0,
      why: {
        1: t`Constant length is not a constant vector: $\vec r$ can turn while $|\vec r|$ stays 2, so $\vec r\,'$ need not vanish.`,
        2: t`A velocity along $\vec r$ would change $|\vec r|$ — that is exactly the motion the sphere forbids.`,
        3: t`Nothing about the size of $\vec r\,'$ follows; the point can move over the sphere at any speed.`,
      },
      hints: [t`$\frac{d}{dt}(\vec r\cdot\vec r) = \vec r\,'\cdot\vec r + \vec r\cdot\vec r\,' = 2\,\vec r\cdot\vec r\,'$.`, 'The right-hand side, 4, is a constant.'],
      teach: 'A vector of constant length is always perpendicular to its own derivative.',
      explain: t`$2\,\vec r\cdot\vec r\,' = \frac{d}{dt}(4) = 0$. The same argument applied to $\vec v$ shows that motion at constant **speed** has $\vec v\cdot\vec a = 0$: a satellite on a circular orbit, or a car on a bend at a steady 50 km/h, accelerates only sideways.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 2.6,
          spheres: [{ centre: [0, 0, 0], radius: 2, color: 'teal' }],
          curves: [{ param: VIV, t: [0, 4 * Math.PI], color: 'accent', width: 2.4 }],
          vectors: [{ to: vivAt(2.2), color: 'gold', label: '\\vec r(t)' }],
        },
        caption: 'Drag to rotate. A curve on the sphere |r| = 2 (teal circles), and the position vector to one of its points.',
      },
    }),
    num({
      id: 'docking', difficulty: 2,
      gen(r) {
        // braking at 0.0025 m/s² takes the closing speed v0x to zero at t = T, short of the port
        const v0x = r.pick([0.2, 0.25, 0.3]), ax = -0.0025, T = Math.round(v0x / 0.0025), x0 = -(v0x * T) / 2 - r.pick([8, 10, 12]);
        const r0 = [x0, r.intExcept(-4, 4, [0]), r.intExcept(-3, 3, [0])];
        const v0 = [v0x, r.pick([-0.03, -0.02, 0.02, 0.03]), r.pick([-0.02, 0.02])], a = [ax, r.pick([-0.0005, 0.0005]), r.pick([-0.0002, 0.0002])];
        const pos = (u) => add(add(r0, scale(v0, u)), scale(a, 0.5 * u * u)), rT = pos(T), dist = norm(rT);
        const errors = distinct(dist, [
          { value: norm(add(add(r0, scale(v0, T)), scale(a, T * T))), feedback: t`Integrating $\vec v(t) = \vec v_0 + \vec a\,t$ gives $\vec v_0 t + \frac12\vec a\,t^2$ — the $\frac12$ comes with the integral of $t$.` },
          { value: norm(add(scale(v0, T), scale(a, 0.5 * T * T))), feedback: t`That is how far it moved, $|\vec r(${T}) - \vec r(0)|$. Its position also includes the constant of integration, $\vec r(0)$.` },
        ]);
        const fx = (x) => +x.toFixed(6);
        return {
          prompt: t`A cargo capsule approaching a space station’s docking port (the origin) is at $\vec r(0) = ${vecTeX(r0)}$ m, moving at $\vec v(0) = ${vecTeX(v0)}$ m/s. Its thrusters then hold a constant acceleration $\vec a = ${vecTeX(a)}$ m/s², which brings its $x$-velocity to zero at $t = ${T}$ s. How far from the port is it then? Give 3 significant figures.`,
          answer: dist, units: 'm', tol: { rel: 0.005 }, errors,
          hints: [t`Integrate twice: $\vec v(t) = \vec a\,t + \vec v(0)$, then $\vec r(t) = \frac12\vec a\,t^2 + \vec v(0)\,t + \vec r(0)$.`, t`Find $\vec r(${T})$, then its length.`],
          teach: 'Under constant acceleration r(t) = r(0) + v(0)t + ½at²: the two constant vectors are the initial position and velocity.',
          explain: t`$\vec r(${T}) = \vec r(0) + ${T}\,\vec v(0) + \frac12(${T})^2\vec a = ${vecTeX(rT.map((x) => fx(x)))}$ m, so the capsule halts its approach $|\vec r(${T})| = ${nice(dist, 3)}$ m from the port — a hold point, from which a final correction removes the sideways offset before contact.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: Math.ceil(Math.abs(r0[0]) / 2 + 4), yaw: -Math.PI / 2 + 0.25, pitch: 0.35,
              curves: [{ param: [`${r0[0]} + ${v0[0]}*t + ${0.5 * a[0]}*t^2`, `${r0[1]} + ${v0[1]}*t + ${0.5 * a[1]}*t^2`, `${r0[2]} + ${v0[2]}*t + ${0.5 * a[2]}*t^2`], t: [0, T], color: 'accent', width: 2.4 }],
              points: [{ at: [0, 0, 0], color: 'gold', label: '\\text{port}' }, { at: r0, color: 'accent', label: '\\vec r(0)' }],
            },
            caption: 'Drag to rotate. The capsule’s path (blue) from its starting point toward the port (gold), approaching along +x.',
          },
        };
      },
    }),
    mcq({
      id: 'same-velocity', difficulty: 1,
      prompt: t`Two drones fly with the same velocity function $\vec v(t)$ for $0 \le t \le 60$ s, but drone B starts 20 m east of drone A: $\vec r_B(0) = \vec r_A(0) + \langle 20, 0, 0\rangle$ m. How are their paths related?`,
      choices: [t`B’s path is A’s shifted 20 m east: $\vec r_B(t) = \vec r_A(t) + \langle 20, 0, 0\rangle$ at every $t$`, t`They fly the same path, B some time behind A`, t`B’s path is a shifted copy of A’s only if $\vec v(t)$ is constant`, t`The paths spread apart: the gap between the drones grows with time`],
      answer: 0,
      why: {
        1: t`Equal velocities mean equal **displacements** in every interval, not the same places: the positions differ by a constant vector.`,
        2: t`Any $\vec v(t)$ works: $(\vec r_B - \vec r_A)' = \vec v - \vec v = \vec 0$, so the difference is constant whatever the flight.`,
        3: t`The gap $\vec r_B - \vec r_A$ has derivative $\vec 0$: it never changes.`,
      },
      hints: [t`Both positions are antiderivatives of the same $\vec v(t)$.`, 'Two antiderivatives of the same function differ by a constant — here a constant vector.'],
      teach: 'Antiderivatives of the same vector function differ by a constant vector: the paths are rigid translates.',
      explain: t`$\vec r_A$ and $\vec r_B$ are antiderivatives of the same $\vec v$, so $\vec r_B(t) - \vec r_A(t) = \vec C$, fixed by the start: $\vec C = \langle 20, 0, 0\rangle$. Every point of B’s path is 20 m east of the matching point of A’s.`,
      visual: {
        type: 'calc-vectors3d',
        params: {
          range: 3,
          curves: [{ param: ['-1.5 + 0.6*sin(1.3*t)', '-1.2 + 0.5*t', '0.35*t + 0.4*sin(2*t)'], t: [0, 5], color: 'accent', width: 2.4 }],
          points: [{ at: [-1.5, -1.2, 0], color: 'gold', label: 'A' }, { at: [1.5, -1.2, 0], color: 'gold', label: 'B' }],
          vectors: [{ from: [-1.5, -1.2, 0], to: [1.5, -1.2, 0], color: 'ink3', label: '20\\text{ m east}', dash: true }],
        },
        caption: 'Drag to rotate. Drone A’s path (blue) from its start A, and drone B’s start, 20 m east (x drawn eastward). Where does B fly?',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ramp', difficulty: 2,
      gen(r) {
        const R = r.pick([6, 7, 8, 9]), h = r.pick([2.8, 3, 3.2]), c = h / (2 * Math.PI), alpha = Math.atan(c / R) / D;
        const errors = distinct(alpha, [
          { value: Math.atan(h / R) / D, feedback: t`$z$ rises $${h}$ m per **turn**, which is $2\pi$ radians of $t$: $z'(t) = ${h}/(2\pi)$, not $${h}$.` },
          { value: 90 - alpha, feedback: 'That is the angle from the vertical. Measure from the horizontal.' },
        ]);
        return {
          prompt: t`The lane of a spiral parking ramp follows $\vec r(t) = \left\langle ${R}\cos t,\ ${R}\sin t,\ \frac{${h}}{2\pi}t\right\rangle$ m: radius ${R} m, rising ${h} m per turn. At what angle above the horizontal does a car climb? Answer in degrees, to 3 significant figures.`,
          answer: alpha, units: '°', tol: { rel: 0.005 }, errors,
          hints: [t`$\vec r\,'(t) = \langle -${R}\sin t,\ ${R}\cos t,\ ${h}/(2\pi)\rangle$.`],
          teach: 'The tangent vector’s vertical and horizontal parts give the angle of climb: tan α = z′ / |horizontal part of r′|.',
          explain: t`The horizontal part of $\vec r\,'$ has length $${R}$ and the vertical part is $${h}/(2\pi) = ${nice(c, 3)}$, the same at every $t$. So $\tan\alpha = ${nice(c, 3)}/${R}$ and $\alpha = ${nice(alpha, 3)}^\circ$ — a grade of ${nice((100 * c) / R, 2)}%, all the way up.`,
          visual: { type: 'c3-curve', params: { curve: { param: ['2*cos(t)', '2*sin(t)', `${nice((2 * c) / R, 4)}*t`], t: [0, 6 * Math.PI], }, at: 7.5, fixed: true, show: ['trail', 'T'], scale: { frame: 1.2 }, readouts: [], range: 2.5, target: [0, 0, 0.6] }, caption: 'Drag to rotate. Three turns of the lane, scaled down, with its unit tangent T at a car’s position.' },
        };
      },
    }),
    num({
      id: 'cp-moon', difficulty: 2,
      gen(r) {
        const g = 1.62, z0 = 1.5, u = r.int(2, 4), w = r.int(-2, 2), vz = r.int(2, 4);
        const tl = (vz + Math.sqrt(vz * vz + 2 * g * z0)) / g, dist = Math.hypot(u, w) * tl, wt = w === 0 ? '0' : `${w}t`;
        const errors = distinct(dist, [
          { value: Math.hypot(u, w) * ((2 * vz) / g), feedback: t`That is when it would be back at the height it was thrown from. It lands at $z = 0$, ${z0} m lower.` },
          { value: Math.hypot(u, w) * ((vz + Math.sqrt(vz * vz + 2 * 9.81 * z0)) / 9.81), feedback: 'That uses Earth’s gravity. On the Moon g = 1.62 m/s².' },
        ]);
        return {
          prompt: t`On the Moon ($g = 1.62$ m/s², no air) an astronaut throws a sample bag from $\vec r(0) = \langle 0, 0, ${z0}\rangle$ m with $\vec v(0) = ${vecTeX([u, w, vz])}$ m/s, so $\vec a = \langle 0, 0, -1.62\rangle$ m/s². How far from the throw point, measured along the ground, does it land? Give 3 significant figures.`,
          answer: dist, units: 'm', tol: { rel: 0.005 }, errors,
          hints: [t`$\vec r(t) = \langle ${u}t,\ ${wt},\ ${z0} + ${vz}t - 0.81t^2\rangle$.`, t`Solve $z(t) = 0$ for the positive root, then find the horizontal distance $\sqrt{x^2 + y^2}$.`],
          teach: 'Integrate the acceleration twice with the initial velocity and position as the constant vectors, then ask the question of r(t).',
          explain: t`$\vec r(t) = \langle ${u}t,\ ${wt},\ ${z0} + ${vz}t - 0.81t^2\rangle$. It lands when $z = 0$: $t = \frac{${vz} + \sqrt{${vz * vz} + 4(0.81)(${z0})}}{2(0.81)} = ${nice(tl, 3)}$ s. The horizontal speed is $\sqrt{${u * u} + ${w * w}} = ${nice(Math.hypot(u, w), 4)}$ m/s, so it lands $${nice(dist, 3)}$ m away.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: Math.ceil(dist / 2 + 1),
              curves: [{ param: [`${u}*t`, `${w}*t`, `${z0} + ${vz}*t - 0.81*t^2`], t: [0, tl], color: 'accent', width: 2.4 }],
              vectors: [{ from: [0, 0, z0], to: [u, w, z0 + vz], color: 'good', label: '\\vec v(0)' }],
              points: [{ at: [0, 0, 0], color: 'ink3' }],
            },
            caption: 'Drag to rotate. The bag’s path (blue) and its launch velocity (green, one second’s worth).',
          },
        };
      },
    }),
    num({
      id: 'cp-rocket', difficulty: 3, transfer: true,
      gen(r) {
        // c/τ = 15–17.5 m/s², so even tilted 30° the thrust lifts more than 1.3 g at launch
        const c = r.pick([3000, 3500]), tau = 200, tb = r.pick([100, 120, 140]), th = r.pick([10, 20, 30]), g = 9.81;
        const lnr = -Math.log(1 - tb / tau), vz = c * Math.cos(th * D) * lnr - g * tb;
        const errors = distinct(vz, [
          { value: c * Math.cos(th * D) * lnr, feedback: t`Gravity’s $-g$ integrates to $-gt$: at burnout that is $-${nice(g * tb, 4)}$ m/s you left out.` },
          { value: c * lnr - g * tb, feedback: t`Only the vertical part of the thrust, $\cos ${th}^\circ$ of it, raises the rocket.` },
          { value: (c / tau) * Math.cos(th * D) * tb - g * tb, feedback: t`The thrust acceleration grows as the rocket gets lighter: it is $\frac{c/\tau}{1 - t/\tau}$, not the constant $c/\tau$.` },
        ]);
        // the path: ∫₀ᵗ −ln(1 − s/τ) ds = τ (W ln W − W + 1), W = 1 − t/τ; drawn in km
        const W = `(1 - t/${tau})`, S = `${(c * tau) / 1000}*(${W}*ln(${W}) - ${W} + 1)`;
        const Wb = 1 - tb / tau, Sb = ((c * tau) / 1000) * (Wb * Math.log(Wb) - Wb + 1);
        const xe = Sb * Math.sin(th * D), ze = Sb * Math.cos(th * D) - (g / 2000) * tb * tb;
        const vx = (c * Math.sin(th * D) * lnr) / 1000, vzk = vz / 1000;
        return {
          prompt: t`A rocket burns propellant at a steady rate, so as it lightens its thrust acceleration grows: $\vec a(t) = \frac{c/\tau}{1 - t/\tau}\,\hat u - g\,\hat k$, with exhaust speed $c = ${c}$ m/s, $\tau = ${tau}$ s, $g = 9.81$ m/s², and the thrust held along $\hat u = \langle \sin ${th}^\circ,\ 0,\ \cos ${th}^\circ\rangle$. Starting from rest, and ignoring air and Earth’s curvature, what is its vertical velocity $v_z$ at burnout, $t = ${tb}$ s? Give 3 significant figures, in m/s.`,
          answer: vz, units: 'm/s', tol: { rel: 0.005 }, errors,
          hints: [t`Integrate each component from $0$ to $t$; $\vec v(0) = \vec 0$ makes the constant vector zero.`, t`$\int_0^t \frac{ds}{1 - s/\tau} = -\tau\ln\left(1 - \frac t\tau\right)$, so $v_z(t) = -c\cos ${th}^\circ\,\ln\left(1 - \frac t\tau\right) - gt$.`],
          teach: 'Integrating a rocket’s growing thrust acceleration gives a logarithm — the rocket equation — and gravity subtracts gt.',
          explain: t`$v_z(${tb}) = ${c}\cos ${th}^\circ\,\ln\frac{1}{1 - ${tb}/${tau}} - 9.81(${tb}) = ${nice(c * Math.cos(th * D) * lnr, 4)} - ${nice(g * tb, 4)} = ${nice(vz, 4)}$ m/s. The logarithm is Tsiolkovsky’s rocket equation, $\Delta v = c\ln(m_0/m)$, here with mass ratio $m_0/m = ${nice(1 / (1 - tb / tau), 3)}$; the $-gt$ term is the gravity loss of a slow climb.`,
          visual: {
            type: 'c3-curve',
            params: { curve: { param: [`${Math.sin(th * D).toFixed(5)}*${S}`, '0', `${Math.cos(th * D).toFixed(5)}*${S} - ${g / 2000}*t^2`], t: [0, tb] }, at: tb, fixed: true, plane: 'xz', show: ['trail', 'v'], scale: { v: 8 }, readouts: [], x: [-0.1 * xe, xe + 8 * vx + 0.12 * xe], y: [-0.08 * ze, ze + 8 * vzk + 0.1 * ze], xlabel: 'downrange x (km)', ylabel: 'height z (km)' },
            caption: 'The powered climb, drawn to scale in km, and the velocity at burnout (green, drawn as 8 s of flight).',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §3.2 Calculus of Vector-Valued Functions', url: 'https://openstax.org/books/calculus-volume-3/pages/3-2-calculus-of-vector-valued-functions' },
    { label: 'Wikipedia: Tsiolkovsky rocket equation', url: 'https://en.wikipedia.org/wiki/Tsiolkovsky_rocket_equation' },
  ],
});
